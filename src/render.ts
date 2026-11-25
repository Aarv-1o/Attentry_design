// Renders an SVG or HTML design in the person's own browser and reads what is in it: the exact
// colors, fonts and text boxes, as the browser computed them. Nothing is downloaded: Playwright
// drives the installed Chrome, or Edge if Chrome is missing.
import { chromium, type Browser } from "playwright-core";
import { pathToFileURL } from "node:url";
import { extname } from "node:path";
import sharp from "sharp";

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
  fontSize: number; // px, as the CSS sets it
  size: number; // px on screen, after any scaling (a camera zoom, a CSS transform)
  opacity: number; // effective, with every ancestor's opacity multiplied in
  bold: boolean;
  box: Box;
  // Where it came from: real text, lettering drawn as shapes and marked with data-text, or read
  // from the pixels by OCR (a fallback, less certain).
  source?: "text" | "drawn" | "ocr";
  holder?: Box; // HTML: the nearest ancestor that draws a background or border (its card, bubble, pill)
}

export interface Rendered {
  file: string;
  png: Buffer;
  width: number;
  height: number;
  colors: string[]; // every visible fill, stroke, text, background and gradient color
  fonts: string[]; // first family of every font in use
  texts: TextBox[];
  cut: Box[]; // small painted shapes that run past the frame's edge
  panels: Box[]; // painted shapes big enough to hold text (cards, bubbles, buttons, panels)
  rings: Box[]; // outlined circles and ellipses (their curve can run through text)
  images: Box[]; // pictures (img, video, canvas, SVG image, CSS background images): their lettering is only pixels
}

// One browser for the whole run, shared by every render (launched once even when renders start
// together).
let launching: Promise<Browser> | undefined;

export function getBrowser(): Promise<Browser> {
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

const RASTER = new Set([".png", ".jpg", ".jpeg", ".webp", ".gif"]);

export async function render(file: string, options: RenderOptions = {}): Promise<Rendered> {
  // A generated image is only pixels: nothing to read from a source, lettering comes from OCR.
  if (RASTER.has(extname(file).toLowerCase())) {
    const { data, info } = await sharp(file).png().toBuffer({ resolveWithObject: true });
    return { file, png: data, width: info.width, height: info.height, colors: [], fonts: [], texts: [], cut: [], panels: [], rings: [], images: [] };
  }
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
    const read = (await page.evaluate(READ_DESIGN)) as Pick<Rendered, "colors" | "fonts" | "texts" | "cut" | "panels" | "rings" | "images">;
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

export const READ_DESIGN = `(() => {
  // Only elements that paint: the root <svg> and <g> report a default black fill they never draw.
  const PAINTS = new Set(["rect", "circle", "ellipse", "line", "polyline", "polygon", "path", "text", "tspan", "textpath", "use"]);
  const colors = new Set(), fonts = new Set(), texts = [], cut = [], panels = [], rings = [], images = [];
  const panel = (r) => { if (r.width * r.height > 0.004 * vw * vh && r.width * r.height < 0.9 * vw * vh && panels.length < 400) panels.push({ x: r.x, y: r.y, width: r.width, height: r.height }); };
  const vw = innerWidth, vh = innerHeight;
  const visible = (c) => c && c !== "none" && c !== "transparent" && !/rgba\\(.*,\\s*0\\)$/.test(c);
  const opacityOf = (el) => { let o = 1; for (let e = el; e; e = e.parentElement) o *= parseFloat(getComputedStyle(e).opacity); return o; };
  // What of a box is really visible: cut to every ancestor that hides its overflow (a crop, a
  // scrolling panel). The frame's own edge isn't applied here: text cut by it is a finding.
  const shown = (el, r) => {
    let x1 = r.left, y1 = r.top, x2 = r.right, y2 = r.bottom;
    for (let e = el.parentElement; e; e = e.parentElement) {
      const s = getComputedStyle(e);
      if (s.overflowX === "visible" && s.overflowY === "visible") continue;
      const c = e.getBoundingClientRect();
      x1 = Math.max(x1, c.left); y1 = Math.max(y1, c.top); x2 = Math.min(x2, c.right); y2 = Math.min(y2, c.bottom);
    }
    return x2 - x1 < 1 || y2 - y1 < 1 ? null : { x: x1, y: y1, width: x2 - x1, height: y2 - y1 };
  };
  // Embedded content (a screenshot, the real UI shown inside a design, a photo) is marked
  // data-embed: it's texture, not the design, so its colors, fonts and text aren't judged.
  const embedded = (el) => !!el.closest("[data-embed]");
  // Lettering drawn as shapes (pixel art, hand-drawn type): the agent marks each line with
  // data-text="the words". Its box is the group's; its color is the group's most used fill; its
  // size is font-size equivalent (a capital's height is about 0.72 of the font size).
  for (const el of document.querySelectorAll("[data-text]")) {
    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) continue;
    const count = new Map();
    for (const s of el.querySelectorAll("*")) {
      const f = getComputedStyle(s).fill;
      if (PAINTS.has(s.tagName.toLowerCase()) && visible(f)) count.set(f, (count.get(f) || 0) + 1);
    }
    const color = [...count].sort((a, b) => b[1] - a[1])[0]?.[0] || getComputedStyle(el).fill || "#000";
    texts.push({
      text: el.getAttribute("data-text"), color, fontFamily: "(drawn)", fontSize: r.height / 0.72,
      size: r.height / 0.72, opacity: opacityOf(el), bold: false, source: "drawn",
      box: { x: r.x, y: r.y, width: r.width, height: r.height },
    });
  }
  for (const el of document.querySelectorAll("*")) {
    if (embedded(el)) continue;
    const style = getComputedStyle(el);
    if (style.display === "none" || style.visibility === "hidden" || style.opacity === "0") continue;
    const tagName = el.tagName.toLowerCase();
    if ((["img", "video", "canvas", "image"].includes(tagName) || /url\\(/.test(style.backgroundImage)) && images.length < 50) {
      const b = shown(el, el.getBoundingClientRect());
      if (b && b.width * b.height > 0.01 * vw * vh) images.push(b);
    }
    const svg = el instanceof SVGElement;
    if (svg && el.tagName.toLowerCase() === "stop") {
      if (visible(style.stopColor)) colors.add(style.stopColor);
      continue;
    }
    if (svg && PAINTS.has(el.tagName.toLowerCase())) {
      // A <line> has no inside, so its fill (black by default) is never painted.
      const paints = el.tagName.toLowerCase() === "line" ? [style.stroke] : [style.fill, style.stroke];
      for (const c of paints) if (visible(c) && !c.startsWith("url(")) colors.add(c);
      const r = el.getBoundingClientRect();
      const tag = el.tagName.toLowerCase();
      // Text is what sits in a panel, never the panel: a <text> would "hold" its own colored <tspan>.
      if (tag !== "text" && tag !== "tspan" && tag !== "textpath") panel(r);
      if ((tag === "circle" || tag === "ellipse") && visible(style.stroke) && parseFloat(style.strokeWidth) > 0 && r.width > 4 && rings.length < 100) {
        rings.push({ x: r.x, y: r.y, width: r.width, height: r.height });
      }
      const small = r.width * r.height < 0.02 * vw * vh;
      if (small && r.width > 0 && (r.left < -1 || r.top < -1 || r.right > vw + 1 || r.bottom > vh + 1) && cut.length < 200) {
        cut.push({ x: r.x, y: r.y, width: r.width, height: r.height });
      }
    } else {
      if (visible(style.backgroundColor)) colors.add(style.backgroundColor);
      if (parseFloat(style.borderTopWidth) > 0 && visible(style.borderTopColor)) colors.add(style.borderTopColor);
    }
    const own = Array.from(el.childNodes).filter((n) => n.nodeType === Node.TEXT_NODE)
      .map((n) => n.textContent || "").join("").trim();
    if (!own) continue;
    // The words' own box, not the element's: a block element spans its whole card even when its
    // few centered words don't (a Range over the text nodes measures the glyphs' line boxes).
    let full = el.getBoundingClientRect();
    if (!svg) {
      const range = document.createRange();
      const nodes = Array.from(el.childNodes).filter((n) => n.nodeType === Node.TEXT_NODE && (n.textContent || "").trim());
      range.setStartBefore(nodes[0]);
      range.setEndAfter(nodes[nodes.length - 1]);
      const g = range.getBoundingClientRect();
      if (g.width > 0 && g.height > 0) full = g;
    }
    if (full.width === 0 || full.height === 0) continue;
    const r = shown(el, full);
    if (!r) continue; // hidden by a crop or a scrolled panel
    const color = svg ? style.fill : style.color;
    colors.add(color);
    const family = style.fontFamily.split(",")[0].trim().replace(/^["']|["']$/g, "");
    fonts.add(family);
    const opacity = opacityOf(el);
    // On-screen scale from the element's own box (the words' box is a different height).
    const scale = !svg && el.offsetHeight ? el.getBoundingClientRect().height / el.offsetHeight : 1;
    // The box the text sits in: for HTML, the nearest ancestor that draws a background or border
    // (DOM nesting knows what's in what, and what's on top; geometry alone doesn't).
    let holder;
    if (!svg) {
      for (let e = el.parentElement; e && e !== document.body; e = e.parentElement) {
        const s = getComputedStyle(e);
        if (visible(s.backgroundColor) || (parseFloat(s.borderTopWidth) > 0 && visible(s.borderTopColor))) {
          const b = shown(e, e.getBoundingClientRect());
          if (b && b.width * b.height < 0.9 * vw * vh) holder = b;
          break;
        }
      }
    }
    texts.push({
      holder, text: own, color, fontFamily: family,
      fontSize: parseFloat(style.fontSize), size: parseFloat(style.fontSize) * scale, opacity,
      bold: parseInt(style.fontWeight, 10) >= 600, source: "text",
      box: { x: r.x, y: r.y, width: r.width, height: r.height },
    });
  }
  return { colors: [...colors], fonts: [...fonts], texts, cut, panels, rings, images };
})()`;
