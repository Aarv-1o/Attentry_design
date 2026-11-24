// Stage 4: checks on the finished design. Errors are measured faults to fix; defaults are the AI
// look, offered as suggestions. Each rule names where it comes from.
import sharp from "sharp";
import { converter, differenceEuclidean, wcagContrast, wcagLuminance } from "culori";
import type { Rendered, TextBox } from "./render.ts";
import type { Measures } from "./measure.ts";
import { toHex, type DesignLock } from "./lock.ts";
import type { Finding } from "./findings.ts";
import { findLettering, readBack, similarity } from "./lettering.ts";

const SAFE_MARGIN = 0.04; // of the shorter side

/** What the shared checks need from a picture or a video frame. */
export interface Picture {
  png: Buffer;
  width: number;
  height: number;
}
const HEADLINE_LEAD = 1.5; // how much bigger the headline should be than the typical text
const PHONE_WIDTH = 360; // px: how wide a phone shows a post or a web image
const READABLE = 0.85; // similarity of OCR's reading to the words below which lettering is hard to read
const PIXEL_COLORS = 64; // distinct colors above which edges are smoothed, not pixel art
const OFF_PALETTE = 0.03; // OKLab distance that still counts as the same color
const oklab = differenceEuclidean("oklab");
const toRgb = converter("rgb");

export async function check(rendered: Rendered, m: Measures, lock?: DesignLock): Promise<Finding[]> {
  const findings: Finding[] = [];
  // Real text and marked lettering are exact; lettering OCR finds in the pixels is less certain, so
  // it gets the edge and size checks but not contrast (its color is an estimate).
  const lettering = await findLettering(rendered.png, rendered.texts);
  const texts = [...rendered.texts, ...lettering];
  for (const t of texts) {
    if (t.source !== "ocr") findings.push(...(await contrastFinding(rendered, t)));
    findings.push(...edge(rendered, t));
  }
  findings.push(...phoneSize(rendered, texts), ...(await legibility(rendered)), ...tension(rendered, texts));
  if (rendered.cut.length) {
    findings.push({
      rule: "shapes-cut",
      kind: "default",
      message: `${rendered.cut.length} small shape${rendered.cut.length === 1 ? "" : "s"} run past the edge of the picture. If that isn't on purpose, move ${rendered.cut.length === 1 ? "it" : "them"} inside the frame.`,
    });
  }

  if (lock) findings.push(...offLock(rendered.colors, rendered.fonts, lock), ...(await pixelEdges(rendered, lock)), ...(await mixels(rendered, lock)));

  findings.push(...hierarchy(texts));

  if (m.centered && !lock?.composition.centered) {
    findings.push({
      rule: "subject-centered",
      kind: "default",
      message: "The picture's visual weight sits at its center. Unless it's an icon or meant to be still, try moving the main subject off center.",
      source: "Bang, Picture This, principle 5; Payne p. 38; Loomis p. 46",
    });
  }
  if (m.midShare > 0.85) {
    findings.push({
      rule: "middle-values",
      kind: "default",
      message: `${Math.round(m.midShare * 100)}% of the picture is mid-grey in value, with few real lights or darks. Push some areas to light and some to dark.`,
      source: "Gurney, Imaginative Realism p. 156, middle value mumbling",
    });
  }
  if (m.saturatedShare > 0.55) {
    findings.push({
      rule: "saturation",
      kind: "default",
      message: `${Math.round(m.saturatedShare * 100)}% of the picture is strongly saturated. Grey most of it and keep strong color for the focal point.`,
      source: "Loomis, Creative Illustration p. 153, nature is largely grey",
    });
  }
  if (m.rawPrimaries.length === 3) {
    findings.push({
      rule: "raw-primaries",
      kind: "default",
      message: "Red, yellow and blue all appear at full strength. Tone two of them down.",
      source: "Loomis, Creative Illustration p. 168",
    });
  }
  return findings;
}

/** WCAG contrast of a text against what's behind it: 4.5:1, or 3:1 for large text. */
export async function contrastFinding(p: Picture, t: TextBox): Promise<Finding[]> {
  const contrast = await textContrast(p, t);
  const large = t.size >= 24 || (t.bold && t.size >= 18.66);
  const needed = large ? 3 : 4.5;
  if (contrast === undefined || contrast >= needed) return [];
  return [{
    rule: "text-contrast",
    kind: "error",
    message: `"${short(t.text)}" has contrast ${contrast.toFixed(1)}:1 against what's behind it; it needs ${needed}:1.`,
    source: "WCAG 2.2, 1.4.3",
  }];
}

/**
 * Contrast of a text against what's really behind it: the pixels in its box that aren't the
 * glyphs. The background is their median luminance, so a busy image behind counts as it looks.
 */
async function textContrast(r: Picture, t: TextBox): Promise<number | undefined> {
  const box = clip(t.box, r);
  if (!box) return undefined;
  const { data } = await sharp(r.png).flatten({ background: "#ffffff" }).extract(box).raw().toBuffer({ resolveWithObject: true });
  const ink = toRgb(t.color);
  if (!ink) return undefined;
  const behind: { mode: "rgb"; r: number; g: number; b: number }[] = [];
  for (let i = 0; i < data.length; i += 3) {
    const px = { mode: "rgb" as const, r: data[i] / 255, g: data[i + 1] / 255, b: data[i + 2] / 255 };
    if (oklab(px, ink) > 0.08) behind.push(px);
  }
  if (behind.length < (data.length / 3) * 0.2) return undefined; // the box is nearly all glyph
  behind.sort((a, b) => wcagLuminance(a) - wcagLuminance(b));
  return wcagContrast(behind[behind.length >> 1], ink);
}

function clip(b: TextBox["box"], r: Picture) {
  const left = Math.max(0, Math.floor(b.x)), top = Math.max(0, Math.floor(b.y));
  const right = Math.min(r.width, Math.ceil(b.x + b.width)), bottom = Math.min(r.height, Math.ceil(b.y + b.height));
  if (right - left < 2 || bottom - top < 2) return undefined;
  return { left, top, width: right - left, height: bottom - top };
}

/** Text cut by the frame, or inside the safe margin (a share of the shorter side). */
export function edge(r: Picture, t: TextBox, margin = SAFE_MARGIN): Finding[] {
  const { x, y, width, height } = t.box;
  const touch = t.source === "ocr" ? 2 : 0; // OCR can't see past the frame: touching it is cut
  if (x < touch || y < touch || x + width > r.width - touch || y + height > r.height - touch) {
    return [{ rule: "text-cut", kind: "error", message: `${what(t)} is cut off by the edge of the picture.` }];
  }
  const m = margin * Math.min(r.width, r.height);
  if (x < m || y < m || x + width > r.width - m || y + height > r.height - m) {
    return [{
      rule: "text-margin",
      kind: "error",
      message: `${what(t)} sits within ${Math.round(m)}px of the edge, where it can be cropped or crowded. Move it in.`,
    }];
  }
  return [];
}

export function offLock(colors: string[], fonts: string[], lock: DesignLock): Finding[] {
  const out: Finding[] = [];
  const stray = [...new Set(colors.map(toHex).filter((h): h is string => !!h))].filter(
    (c) => !lock.colors.some((l) => oklab(c, l) <= OFF_PALETTE),
  );
  if (stray.length) {
    out.push({
      rule: "off-lock-colors",
      kind: "error",
      message: `Colors outside the "${lock.name}" lock: ${stray.join(", ")}. Use the locked palette: ${lock.colors.join(", ")}.`,
    });
  }
  const strayFonts = fonts.filter((f) => !lock.fonts.includes(f));
  if (strayFonts.length) {
    out.push({
      rule: "off-lock-fonts",
      kind: "error",
      message: `Fonts outside the "${lock.name}" lock: ${strayFonts.join(", ")}. Locked: ${lock.fonts.join(", ") || "none"}.`,
    });
  }
  return out;
}

/**
 * A pixel-art lock: every edge stays on the pixel grid. Smoothed (anti-aliased) edges blend
 * neighbouring colors into hundreds of in-between ones; real pixel art uses a few dozen at most.
 */
export async function pixelEdges(p: Picture, lock: DesignLock): Promise<Finding[]> {
  if (!/pixel/i.test(lock.style ?? "")) return [];
  const { data } = await sharp(p.png).flatten({ background: "#ffffff" }).raw().toBuffer({ resolveWithObject: true });
  const colors = new Set<number>();
  for (let i = 0; i < data.length; i += 3) colors.add((data[i] << 16) | (data[i + 1] << 8) | data[i + 2]);
  if (colors.size <= PIXEL_COLORS) return [];
  return [{
    rule: "pixel-edges",
    kind: "error",
    message: `The "${lock.name}" lock is pixel art, but the picture has ${colors.size} distinct colors: edges are smoothed, not pixel-sharp. Draw on whole pixels and add shape-rendering="crispEdges" (SVG) or image-rendering: pixelated (CSS).`,
  }];
}

/**
 * Type hierarchy: with three or more texts, one should clearly lead. When the biggest is barely
 * bigger than the typical one, everything reads at the same level and nothing reads first.
 */
export function hierarchy(texts: TextBox[]): Finding[] {
  const sizes = texts.map((t) => t.size).sort((a, b) => a - b);
  if (sizes.length < 3) return [];
  const median = sizes[sizes.length >> 1], biggest = sizes.at(-1)!;
  if (biggest >= HEADLINE_LEAD * median) return [];
  return [{
    rule: "no-hierarchy",
    kind: "default",
    message: `${sizes.length} texts, all about the same size (${Math.round(sizes[0])}–${Math.round(biggest)} px): nothing reads first. Make one headline at least ${HEADLINE_LEAD}× the labels.`,
    source: "Williams, The Non-Designer's Design Book: contrast must be strong; Attentry Design rules R4",
  }];
}

/** How a finding names a text: OCR's reading is a guess, so it says where the words were found. */
function what(t: TextBox): string {
  return t.source === "ocr" ? `Lettering in the picture (read as "${short(t.text)}")` : `"${short(t.text)}"`;
}

/**
 * Text size at the size people will see it: a picture for social posts and the web is mostly seen
 * on a phone, about 360 px wide. Under 9 px there it can't be read; under 13 px it strains.
 */
function phoneSize(r: Picture, texts: TextBox[]): Finding[] {
  const atPhone = (t: TextBox) => (t.size * PHONE_WIDTH) / r.width;
  const unreadable = texts.filter((t) => atPhone(t) < 9), small = texts.filter((t) => atPhone(t) >= 9 && atPhone(t) < 13);
  const list = (ts: TextBox[]) => ts.map((t) => `${what(t)} (${Math.round(atPhone(t))} px)`).join(", ");
  const out: Finding[] = [];
  if (unreadable.length) {
    out.push({
      rule: "text-too-small",
      kind: "error",
      message: `Too small to read on a phone, where this picture shows about ${PHONE_WIDTH} px wide: ${list(unreadable)}. Make it at least ${Math.ceil((13 * r.width) / PHONE_WIDTH)} px tall here.`,
      source: "Attentry Design rules R1; phones show posts about 360 px wide",
    });
  }
  if (small.length) {
    out.push({
      rule: "text-small",
      kind: "default",
      message: `Small on a phone (about ${PHONE_WIDTH} px wide): ${list(small)}. ${Math.ceil((13 * r.width) / PHONE_WIDTH)} px or more here reads easily.`,
      source: "Attentry Design rules R1; phones show posts about 360 px wide",
    });
  }
  return out;
}

/**
 * Lettering drawn as shapes, whose words we know from data-text: can a reader read it? OCR reads
 * each line; when it gets the words wrong, the letter shapes are probably ambiguous to people too.
 * A suggestion, never an error: OCR also misreads lettering people read fine.
 */
async function legibility(r: Rendered): Promise<Finding[]> {
  const misread: string[] = [];
  for (const t of r.texts.filter((t) => t.source === "drawn")) {
    const read = await readBack(r.png, r.width, r.height, t);
    if (similarity(t.text, read) < READABLE) misread.push(`"${short(t.text)}" as "${short(read || "nothing")}"`);
  }
  if (!misread.length) return [];
  return [{
    rule: "hard-to-read",
    kind: "default",
    message: `A text reader misread ${misread.join(", ")}. The letter shapes may be ambiguous to people too: try a plainer font, more space between letters, or a bigger size.`,
  }];
}

/**
 * Mixels (Pixel Logic p. 21: "NEVER EVER mix different aspect ratios"): parts of a pixel-art
 * picture drawn at different pixel sizes, like a sprite doubled to 2x beside 1x lettering. In a
 * region drawn at size n, every run of one color, across or down, is a multiple of n; so each
 * region's cell size is the greatest common divisor of its runs.
 */
export async function mixels(p: Picture, lock: DesignLock): Promise<Finding[]> {
  if (!/pixel/i.test(lock.style ?? "")) return [];
  const { data, info } = await sharp(p.png).flatten({ background: "#ffffff" }).raw().toBuffer({ resolveWithObject: true });
  const W = info.width, H = info.height, T = 48;
  const at = (x: number, y: number) => { const i = (y * W + x) * 3; return (data[i] << 16) | (data[i + 1] << 8) | data[i + 2]; };
  const gcd = (a: number, b: number): number => (b ? gcd(b, a % b) : a);
  const sizes = new Map<number, number>(); // cell size -> regions
  for (let ty = 0; ty + T <= H; ty += T) {
    for (let tx = 0; tx + T <= W; tx += T) {
      let g = 0, runs = 0;
      // Runs fully inside the region, across and down (runs cut by its border say nothing).
      for (let k = 0; k < T; k++) {
        for (const across of [true, false]) {
          let start = 0;
          for (let i = 1; i <= T; i++) {
            const same = i < T && (across ? at(tx + i, ty + k) === at(tx + i - 1, ty + k) : at(tx + k, ty + i) === at(tx + k, ty + i - 1));
            if (same) continue;
            if (start > 0 && i < T) { g = gcd(g, i - start); runs++; }
            start = i;
          }
        }
      }
      // Only detailed regions say what grid they're on: a region of a few big blocks gets a large
      // divisor by coincidence.
      if (runs >= 40 && g > 0) sizes.set(g, (sizes.get(g) ?? 0) + 1);
    }
  }
  const counted = [...sizes].filter(([, n]) => n >= 3).map(([s]) => s).sort((a, b) => a - b);
  // A doubled sprite is a whole multiple of the grid next to it (2x, 3x): that's a mixel.
  const scaled = counted.filter((s) => s !== counted[0] && s % counted[0] === 0);
  if (!counted.length || !scaled.length) return [];
  return [{
    rule: "mixels",
    kind: "error",
    message: `This pixel art mixes pixel sizes: parts are drawn with ${[counted[0], ...scaled].map((s) => `${s} px`).join(" and ")} pixels. Draw everything on one pixel grid; to make a sprite bigger, redraw it at the larger size instead of doubling its pixels.`,
    source: "Azzi, Pixel Logic p. 21 (mixels)",
  }];
}

/**
 * Visual tension (Glitschka, Vector Basic Training pp. 189–191): text that almost touches the edge
 * of the shape it sits in, a card, a bubble, a button. "The circle is too close to the edge of the
 * green square. It unintentionally draws the eye to that area." Clearly inside or clearly over the
 * edge is fine; a hair away, or a hair over, is not.
 */
export function tension(r: Pick<Rendered, "panels" | "rings">, texts: TextBox[]): Finding[] {
  const tight: string[] = [];
  for (const t of texts.filter((t) => t.source !== "ocr")) {
    // A circle's or ellipse's curve running through the text: some points of the text's box fall
    // inside the curve and some outside (a ring drawn around an icon that cuts its label).
    const crossed = r.rings.some((g) => {
      const cx = g.x + g.width / 2, cy = g.y + g.height / 2, rx = g.width / 2, ry = g.height / 2;
      const pts = [0, 0.5, 1].flatMap((u) => [0, 0.5, 1].map((v) => [t.box.x + u * t.box.width, t.box.y + v * t.box.height]));
      const d = pts.map(([x, y]) => ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2);
      return Math.min(...d) < 1 && Math.max(...d) > 1;
    });
    if (crossed) { tight.push(what(t)); continue; }
    const cx = t.box.x + t.box.width / 2, cy = t.box.y + t.box.height / 2;
    // HTML text knows its holder from the DOM; SVG text, beside its shapes rather than inside
    // them, takes the smallest painted shape around its middle that is bigger than itself.
    const holder = t.holder ?? r.panels
      .filter((p) => cx > p.x && cx < p.x + p.width && cy > p.y && cy < p.y + p.height && p.width * p.height > 1.5 * t.box.width * t.box.height)
      .sort((a, b) => a.width * a.height - b.width * b.height)[0];
    if (!holder) continue;
    const near = Math.max(2, 0.2 * t.box.height); // a hair: a fifth of the text's height
    const gaps = [t.box.x - holder.x, holder.x + holder.width - (t.box.x + t.box.width), t.box.y - holder.y, holder.y + holder.height - (t.box.y + t.box.height)];
    if (gaps.some((g) => Math.abs(g) < near)) tight.push(what(t));
  }
  if (!tight.length) return [];
  return [{
    rule: "visual-tension",
    kind: "default",
    message: `${tight.join(", ")} ${tight.length === 1 ? "almost touches" : "almost touch"} the edge of the shape around ${tight.length === 1 ? "it" : "them"}. Give clear room inside, or let it clearly overlap the edge.`,
    source: "Glitschka, Vector Basic Training pp. 189–191 (visual tension)",
  }];
}

export function short(s: string): string {
  return s.length > 40 ? s.slice(0, 37) + "…" : s;
}
