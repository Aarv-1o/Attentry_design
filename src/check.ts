// Stage 4: checks on the finished design. Errors are measured faults to fix; defaults are the AI
// look, offered as suggestions. Each rule names where it comes from.
import sharp from "sharp";
import { converter, differenceEuclidean, wcagContrast, wcagLuminance } from "culori";
import type { Rendered, TextBox } from "./render.ts";
import type { Measures } from "./measure.ts";
import { toHex, type DesignLock } from "./lock.ts";
import type { Finding } from "./findings.ts";

const SAFE_MARGIN = 0.04; // of the shorter side
const OFF_PALETTE = 0.03; // OKLab distance that still counts as the same color
const oklab = differenceEuclidean("oklab");
const toRgb = converter("rgb");

export async function check(rendered: Rendered, m: Measures, lock?: DesignLock): Promise<Finding[]> {
  const findings: Finding[] = [];
  for (const t of rendered.texts) {
    const contrast = await textContrast(rendered, t);
    const large = t.fontSize >= 24 || (t.bold && t.fontSize >= 18.66);
    const needed = large ? 3 : 4.5;
    if (contrast !== undefined && contrast < needed) {
      findings.push({
        rule: "text-contrast",
        kind: "error",
        message: `"${short(t.text)}" has contrast ${contrast.toFixed(1)}:1 against what's behind it; it needs ${needed}:1.`,
        source: "WCAG 2.2, 1.4.3",
      });
    }
    findings.push(...edge(rendered, t));
  }

  if (lock) findings.push(...offLock(rendered, lock));

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

/**
 * Contrast of a text against what's really behind it: the pixels in its box that aren't the
 * glyphs. The background is their median luminance, so a busy image behind counts as it looks.
 */
async function textContrast(r: Rendered, t: TextBox): Promise<number | undefined> {
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

function clip(b: TextBox["box"], r: Rendered) {
  const left = Math.max(0, Math.floor(b.x)), top = Math.max(0, Math.floor(b.y));
  const right = Math.min(r.width, Math.ceil(b.x + b.width)), bottom = Math.min(r.height, Math.ceil(b.y + b.height));
  if (right - left < 2 || bottom - top < 2) return undefined;
  return { left, top, width: right - left, height: bottom - top };
}

function edge(r: Rendered, t: TextBox): Finding[] {
  const { x, y, width, height } = t.box;
  if (x < 0 || y < 0 || x + width > r.width || y + height > r.height) {
    return [{ rule: "text-cut", kind: "error", message: `"${short(t.text)}" is cut off by the edge of the picture.` }];
  }
  const m = SAFE_MARGIN * Math.min(r.width, r.height);
  if (x < m || y < m || x + width > r.width - m || y + height > r.height - m) {
    return [{
      rule: "text-margin",
      kind: "error",
      message: `"${short(t.text)}" sits within ${Math.round(m)}px of the edge, where it can be cropped or crowded. Move it in.`,
    }];
  }
  return [];
}

function offLock(r: Rendered, lock: DesignLock): Finding[] {
  const out: Finding[] = [];
  const stray = [...new Set(r.colors.map(toHex).filter((h): h is string => !!h))].filter(
    (c) => !lock.colors.some((l) => oklab(c, l) <= OFF_PALETTE),
  );
  if (stray.length) {
    out.push({
      rule: "off-lock-colors",
      kind: "error",
      message: `Colors outside the "${lock.name}" lock: ${stray.join(", ")}. Use the locked palette: ${lock.colors.join(", ")}.`,
    });
  }
  const fonts = r.fonts.filter((f) => !lock.fonts.includes(f));
  if (fonts.length) {
    out.push({
      rule: "off-lock-fonts",
      kind: "error",
      message: `Fonts outside the "${lock.name}" lock: ${fonts.join(", ")}. Locked: ${lock.fonts.join(", ") || "none"}.`,
    });
  }
  return out;
}

function short(s: string): string {
  return s.length > 40 ? s.slice(0, 37) + "…" : s;
}
