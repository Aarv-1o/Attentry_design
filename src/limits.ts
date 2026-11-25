// Small shared pieces that need none of the heavy libraries, so the brief hook and the MCP server
// can use them before sharp, Playwright and tesseract.js are installed.
import type { RenderOptions } from "./render.ts";

export const MAX_OPTIONS = 5;

/** A request or lock naming the 3D look. */
export const STYLE_3D = /\b(3d|three[- ]d)\b/i;

/** A page size given as WxH, like 1200x630. */
export function parseSize(s?: string): RenderOptions {
  if (!s) return {};
  const m = /^(\d+)x(\d+)$/.exec(s);
  if (!m) throw new Error("Give the size as WxH, like 1200x630.");
  return { width: Number(m[1]), height: Number(m[2]) };
}
