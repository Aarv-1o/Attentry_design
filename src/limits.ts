// Small shared pieces that need none of the heavy libraries, so the brief hook and the MCP server
// can use them before sharp, Playwright and tesseract.js are installed.
import { existsSync } from "node:fs";
import { join } from "node:path";
import type { RenderOptions } from "./render.ts";

export const MAX_OPTIONS = 5;

/** The heavy libraries the stages need, installed beside the plugin or in its data folder. */
export const RUNTIME = ["sharp", "playwright-core", "tesseract.js", "@tesseract.js-data/eng"];
export const hasRuntime = (dir: string) => RUNTIME.every((p) => existsSync(join(dir, "node_modules", p, "package.json")));
/** In the data folder while an install runs (one at a time). */
export const INSTALLING = ".installing";

/** A mood the person chose dark on purpose: a dark picture is then the brief, not murk. */
export const DARK_MOOD = /\b(dark|night|noir|moody|gloomy|horror|space|shadowy|mysterious)\b/i;
/** A purpose that asks nothing of the viewer: no call to action expected at the end. */
export const NO_ASK = /\b(tribute|homage|memorial|thank(s| you)|fan (film|video|art)|music video|story|art piece)\b/i;

/** A request or lock naming the 3D look. */
export const STYLE_3D = /\b(3d|three[- ]d)\b/i;

/** A page size given as WxH, like 1200x630. */
export function parseSize(s?: string): RenderOptions {
  if (!s) return {};
  const m = /^(\d+)x(\d+)$/.exec(s);
  if (!m) throw new Error("Give the size as WxH, like 1200x630.");
  return { width: Number(m[1]), height: Number(m[2]) };
}
