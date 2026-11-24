// Stage 2: are the options really different? Compares up to five rendered options on the axes the
// books name (composition, value plan, palette) and says which to redo and along which axis. It
// never says which option is better.
import sharp, { type OverlayOptions } from "sharp";
import { basename } from "node:path";
import type { Rendered } from "./render.ts";
import { layoutDistance, measure, paletteDistance, type Measures } from "./measure.ts";
import type { Finding } from "./findings.ts";

export const MAX_OPTIONS = 5;

export interface Option {
  number: number;
  file: string;
  measures: Measures;
}

const SAME_LAYOUT = 0.06; // mean lightness difference of the thumbnails
const SAME_PALETTE = 0.06; // OKLab distance

export async function compareOptions(rendered: Rendered[]): Promise<{ options: Option[]; findings: Finding[] }> {
  if (rendered.length < 2) throw new Error("Give at least 2 options to compare.");
  if (rendered.length > MAX_OPTIONS) throw new Error(`At most ${MAX_OPTIONS} options.`);
  const options = await Promise.all(
    rendered.map(async (r, i) => ({ number: i + 1, file: r.file, measures: await measure(r.png) })),
  );
  const findings: Finding[] = [];
  const n = options.length;

  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const a = options[i].measures, b = options[j].measures;
      if (layoutDistance(a.thumb, b.thumb) < SAME_LAYOUT && paletteDistance(a.palette, b.palette) < SAME_PALETTE) {
        findings.push({
          rule: "options-same",
          kind: "error",
          message: `Options ${i + 1} and ${j + 1} are nearly the same picture. Redo one with a different composition or palette.`,
        });
      }
    }
  }

  const centered = options.filter((o) => o.measures.centered);
  if (centered.length >= Math.max(2, n - 1)) {
    findings.push({
      rule: "options-all-centered",
      kind: "error",
      message: `${centered.length} of ${n} options put the subject dead center (${list(centered)}). Redo some with another composition: off center, a diagonal, a group to one side.`,
      source: "Payne, Composition of Outdoor Painting p. 38; Bang, Picture This, principle 5",
    });
  }

  const byField = Map.groupBy(options, (o) => o.measures.field);
  const [field, same] = [...byField].sort((a, b) => b[1].length - a[1].length)[0];
  if (same.length === n) {
    findings.push({
      rule: "options-same-values",
      kind: "error",
      message: `All ${n} options use the same value plan (a ${field} field). Try another: dark figures on light, light on dark, or a mid-grey field.`,
      source: "Loomis, Creative Illustration pp. 88–90, the four tonal plans",
    });
  }

  const pairs: number[] = [];
  for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) pairs.push(paletteDistance(options[i].measures.palette, options[j].measures.palette));
  if (Math.max(...pairs) < SAME_PALETTE * 1.5) {
    findings.push({
      rule: "options-same-palette",
      kind: "error",
      message: `All ${n} options share nearly one palette. Give at least one a different color scheme.`,
    });
  }
  return { options, findings };
}

function list(options: Option[]): string {
  return options.map((o) => o.number).join(", ");
}

/** One PNG with the options side by side, numbered, each with its main colors underneath. */
export async function contactSheet(rendered: Rendered[], options: Option[], out: string): Promise<string> {
  const W = 320, GAP = 24, LABEL = 56;
  const tiles = await Promise.all(rendered.map((r) => sharp(r.png).resize({ width: W }).png().toBuffer({ resolveWithObject: true })));
  const tileH = Math.max(...tiles.map((t) => t.info.height));
  const width = GAP + tiles.length * (W + GAP);
  const height = GAP + tileH + LABEL + GAP;
  const parts: OverlayOptions[] = [];
  tiles.forEach((t, i) => {
    const x = GAP + i * (W + GAP);
    parts.push({ input: t.data, left: x, top: GAP });
    const swatches = options[i].measures.palette
      .map((s, k) => `<rect x="${28 + k * 22}" y="16" width="18" height="18" fill="${s.hex}" stroke="#0002"/>`)
      .join("");
    const label = `<svg width="${W}" height="${LABEL}" xmlns="http://www.w3.org/2000/svg">
      <text x="0" y="30" font-family="Arial, sans-serif" font-size="22" font-weight="700" fill="#111">${i + 1}</text>
      ${swatches}
      <text x="0" y="50" font-family="Arial, sans-serif" font-size="12" fill="#555">${escape(basename(options[i].file))}</text>
    </svg>`;
    parts.push({ input: Buffer.from(label), left: x, top: GAP + tileH + 4 });
  });
  await sharp({ create: { width, height, channels: 3, background: "#f4f4f2" } }).composite(parts).png().toFile(out);
  return out;
}

function escape(s: string): string {
  return s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);
}
