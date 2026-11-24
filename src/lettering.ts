// Lettering the browser can't see as text: drawn as shapes and not marked, or inside a generated
// image. Read with OCR (tesseract.js, English data from the installed @tesseract.js-data/eng, so
// nothing is downloaded). OCR on stylized lettering is unsure, so only confident readings of three
// or more letters count; it's a fallback behind real text and data-text marks.
import sharp from "sharp";
import { createWorker, PSM, type Worker } from "tesseract.js";
import eng from "@tesseract.js-data/eng";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { formatHex } from "culori";
import { kmeans, labPixels } from "./measure.ts";
import type { Box, TextBox } from "./render.ts";

const CONFIDENT = 50; // tesseract's 0–100 confidence below which a reading is ignored
const MIN_LETTERS = 3;

let starting: Promise<Worker> | undefined;

function getWorker(): Promise<Worker> {
  starting ??= createWorker("eng", 1, { langPath: eng.langPath, gzip: true, cachePath: join(tmpdir(), "attentry-design-ocr"), logger: () => {} });
  return starting;
}

export async function closeOcr(): Promise<void> {
  const w = starting;
  starting = undefined;
  await (await w?.catch(() => undefined))?.terminate();
}

interface Line {
  text: string;
  confidence: number;
  bbox: { x0: number; y0: number; x1: number; y1: number };
}

/** Lettering found in the picture's pixels, skipping what overlaps text already known. */
export async function findLettering(png: Buffer, known: TextBox[] = []): Promise<TextBox[]> {
  const worker = await getWorker();
  // Grey and stretched: stylized lettering on a busy scene reads better without its colors.
  const grey = await sharp(png).flatten({ background: "#ffffff" }).greyscale().normalise().png().toBuffer();
  const lines: Line[] = [];
  // Two passes: page layout finds blocks of lines, sparse mode finds scattered words and labels.
  for (const mode of [PSM.AUTO, PSM.SPARSE_TEXT]) {
    await worker.setParameters({ tessedit_pageseg_mode: mode });
    const { data } = await worker.recognize(grey, {}, { blocks: true });
    for (const b of data.blocks ?? []) for (const p of b.paragraphs) lines.push(...p.lines);
  }
  const found: TextBox[] = [];
  for (const l of lines) {
    const text = l.text.trim();
    if (l.confidence < CONFIDENT || (text.match(/[\p{L}\p{N}]/gu) ?? []).length < MIN_LETTERS) continue;
    const box = { x: l.bbox.x0, y: l.bbox.y0, width: l.bbox.x1 - l.bbox.x0, height: l.bbox.y1 - l.bbox.y0 };
    if ([...known, ...found].some((k) => overlap(k.box, box) > 0.3)) continue;
    found.push({
      text, color: await inkColor(png, box), fontFamily: "(in the picture)",
      fontSize: box.height / 0.72, size: box.height / 0.72, opacity: 1, bold: false, source: "ocr", box,
    });
  }
  return found;
}

/**
 * What a reader makes of a line of drawn lettering: OCR on just that line, enlarged. Used to test
 * whether lettering whose words we know (marked with data-text) can actually be read.
 */
export async function readBack(png: Buffer, width: number, height: number, t: TextBox): Promise<string> {
  const worker = await getWorker();
  const pad = Math.round(t.box.height * 0.4);
  const left = Math.max(0, Math.floor(t.box.x - pad)), top = Math.max(0, Math.floor(t.box.y - pad));
  const w = Math.min(width - left, Math.ceil(t.box.width + 2 * pad)), h = Math.min(height - top, Math.ceil(t.box.height + 2 * pad));
  if (w < 2 || h < 2) return "";
  const line = await sharp(png).flatten({ background: "#ffffff" }).extract({ left, top, width: w, height: h })
    .resize({ width: w * 2, kernel: "nearest" }).greyscale().normalise().png().toBuffer();
  await worker.setParameters({ tessedit_pageseg_mode: PSM.SINGLE_LINE });
  return (await worker.recognize(line)).data.text.trim();
}

/**
 * How alike two readings are, 0..1, on letters and digits only: 1 minus the edit distance over the
 * longer length. Written by hand: it's a dozen lines, not worth a package.
 */
export function similarity(a: string, b: string): number {
  const x = a.toUpperCase().replace(/[^\p{L}\p{N}]/gu, ""), y = b.toUpperCase().replace(/[^\p{L}\p{N}]/gu, "");
  if (!x.length && !y.length) return 1;
  let prev = Array.from({ length: y.length + 1 }, (_, j) => j);
  for (let i = 1; i <= x.length; i++) {
    const row = [i];
    for (let j = 1; j <= y.length; j++) row[j] = Math.min(prev[j] + 1, row[j - 1] + 1, prev[j - 1] + (x[i - 1] === y[j - 1] ? 0 : 1));
    prev = row;
  }
  return 1 - prev[y.length] / Math.max(x.length, y.length);
}

/** Share of the smaller box that the two boxes have in common. */
function overlap(a: Box, b: Box): number {
  const w = Math.min(a.x + a.width, b.x + b.width) - Math.max(a.x, b.x);
  const h = Math.min(a.y + a.height, b.y + b.height) - Math.max(a.y, b.y);
  if (w <= 0 || h <= 0) return 0;
  return (w * h) / Math.min(a.width * a.height, b.width * b.height);
}

/** The lettering's color: of the box's two main colors, the one covering less (the strokes). */
async function inkColor(png: Buffer, box: Box): Promise<string> {
  const region = await sharp(png).extract({ left: box.x, top: box.y, width: Math.max(1, box.width), height: Math.max(1, box.height) }).png().toBuffer();
  const [a, b] = kmeans(await labPixels(region, 32), 2);
  const ink = b ?? a; // kmeans sorts by area, biggest first
  return formatHex({ mode: "oklab", ...ink.lab });
}
