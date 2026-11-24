// Stage 4: checks on the finished design. Errors are measured faults to fix; defaults are the AI
// look, offered as suggestions. Each rule names where it comes from.
import sharp from "sharp";
import { converter, differenceEuclidean, wcagContrast, wcagLuminance } from "culori";
import type { Rendered, TextBox } from "./render.ts";
import type { Measures } from "./measure.ts";
import { toHex, type DesignLock } from "./lock.ts";
import type { Finding } from "./findings.ts";

const SAFE_MARGIN = 0.04; // of the shorter side

/** What the shared checks need from a picture or a video frame. */
export interface Picture {
  png: Buffer;
  width: number;
  height: number;
}
const PIXEL_COLORS = 64; // distinct colors above which edges are smoothed, not pixel art
const OFF_PALETTE = 0.03; // OKLab distance that still counts as the same color
const oklab = differenceEuclidean("oklab");
const toRgb = converter("rgb");

export async function check(rendered: Rendered, m: Measures, lock?: DesignLock): Promise<Finding[]> {
  const findings: Finding[] = [];
  for (const t of rendered.texts) {
    findings.push(...(await contrastFinding(rendered, t)), ...edge(rendered, t));
  }

  if (lock) findings.push(...offLock(rendered.colors, rendered.fonts, lock), ...(await pixelEdges(rendered, lock)));

  if (m.centered && !lock?.composition.centered) {
    findings.push({
      rule: "subject-centered",
      kind: "default",
      message: "The subject sits dead center. Unless it's an icon, try placing it off center.",
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
  if (x < 0 || y < 0 || x + width > r.width || y + height > r.height) {
    return [{ rule: "text-cut", kind: "error", message: `"${short(t.text)}" is cut off by the edge of the picture.` }];
  }
  const m = margin * Math.min(r.width, r.height);
  if (x < m || y < m || x + width > r.width - m || y + height > r.height - m) {
    return [{
      rule: "text-margin",
      kind: "error",
      message: `"${short(t.text)}" sits within ${Math.round(m)}px of the edge, where it can be cropped or crowded. Move it in.`,
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

export function short(s: string): string {
  return s.length > 40 ? s.slice(0, 37) + "…" : s;
}
