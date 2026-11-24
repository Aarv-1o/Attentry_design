// Renders an SVG or HTML design in the person's own browser and reads what is in it: the exact
// colors, fonts and text boxes, as the browser computed them. Nothing is downloaded: Playwright
// drives the installed Chrome, or Edge if Chrome is missing.
import { chromium, type Browser } from "playwright-core";
import { pathToFileURL } from "node:url";
import { extname } from "node:path";

export interface Box {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface TextBox {
  text: string;
  color: string; // computed CSS color of the glyphs
  fontFamily: string;
  fontSize: number; // px, as rendered
  bold: boolean;
  box: Box;
}

export interface Rendered {
  file: string;
  png: Buffer;
  width: number;
  height: number;
  colors: string[]; // every visible fill, stroke, text, background and gradient color
  fonts: string[]; // first family of every font in use
  texts: TextBox[];
}

// One browser for the whole run, shared by every render (launched once even when renders start
// together).
let launching: Promise<Browser> | undefined;

function getBrowser(): Promise<Browser> {
  launching ??= (async () => {
    for (const channel of ["chrome", "msedge"]) {
      try {
        return await chromium.launch({ channel });
      } catch {
        // try the next installed browser
      }
    }
    throw new Error("Attentry Design needs Chrome or Edge installed to render designs.");
  })();
  return launching;
}

export async function closeBrowser(): Promise<void> {
  const b = launching;
  launching = undefined;
  await (await b?.catch(() => undefined))?.close();
}

/** Size for HTML pages, which have no intrinsic size of their own. SVGs use their own size. */
export interface RenderOptions {
  width?: number;
  height?: number;
}

export async function render(file: string, options: RenderOptions = {}): Promise<Rendered> {
  const page = await (await getBrowser()).newPage({
    viewport: { width: options.width ?? 1200, height: options.height ?? 800 },
  });
  try {
    await page.goto(pathToFileURL(file).href);
    if (extname(file).toLowerCase() === ".svg") {
      await page.setViewportSize(await page.evaluate(SVG_SIZE));
    }
    await page.evaluate("document.fonts.ready");
    const viewport = page.viewportSize()!;
    const png = await page.screenshot({ type: "png" });
    const read = (await page.evaluate(READ_DESIGN)) as Pick<Rendered, "colors" | "fonts" | "texts">;
    return { file, png, width: viewport.width, height: viewport.height, ...read };
  } finally {
    await page.close();
  }
}

// The scripts below run inside the page. They are plain strings, not functions, because the
// TypeScript loader rewrites functions with helpers that don't exist in the page.

const SVG_SIZE = `(() => {
  const svg = document.documentElement;
  const vb = svg.viewBox && svg.viewBox.baseVal;
  const w = (svg.width && svg.width.baseVal.value) || (vb && vb.width) || 800;
  const h = (svg.height && svg.height.baseVal.value) || (vb && vb.height) || 600;
  return { width: Math.round(w), height: Math.round(h) };
})()`;

const READ_DESIGN = `(() => {
  // Only elements that paint: the root <svg> and <g> report a default black fill they never draw.
  const PAINTS = new Set(["rect", "circle", "ellipse", "line", "polyline", "polygon", "path", "text", "tspan", "textpath", "use"]);
  const colors = new Set(), fonts = new Set(), texts = [];
  const visible = (c) => c && c !== "none" && c !== "transparent" && !/rgba\\(.*,\\s*0\\)$/.test(c);
  for (const el of document.querySelectorAll("*")) {
    const style = getComputedStyle(el);
    if (style.display === "none" || style.visibility === "hidden" || style.opacity === "0") continue;
    const svg = el instanceof SVGElement;
    if (svg && el.tagName.toLowerCase() === "stop") {
      if (visible(style.stopColor)) colors.add(style.stopColor);
      continue;
    }
    if (svg && PAINTS.has(el.tagName.toLowerCase())) {
      for (const c of [style.fill, style.stroke]) if (visible(c) && !c.startsWith("url(")) colors.add(c);
    } else {
      if (visible(style.backgroundColor)) colors.add(style.backgroundColor);
      if (parseFloat(style.borderTopWidth) > 0 && visible(style.borderTopColor)) colors.add(style.borderTopColor);
    }
    const own = Array.from(el.childNodes).filter((n) => n.nodeType === Node.TEXT_NODE)
      .map((n) => n.textContent || "").join("").trim();
    if (!own) continue;
    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) continue;
    const color = svg ? style.fill : style.color;
    colors.add(color);
    const family = style.fontFamily.split(",")[0].trim().replace(/^["']|["']$/g, "");
    fonts.add(family);
    texts.push({
      text: own, color, fontFamily: family,
      fontSize: parseFloat(style.fontSize), bold: parseInt(style.fontWeight, 10) >= 600,
      box: { x: r.x, y: r.y, width: r.width, height: r.height },
    });
  }
  return { colors: [...colors], fonts: [...fonts], texts };
})()`;
