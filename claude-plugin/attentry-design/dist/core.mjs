#!/usr/bin/env node
import { createRequire as __adRequire } from 'node:module'; const require = __adRequire(import.meta.url);

// src/render.ts
import { chromium } from "playwright-core";
import { pathToFileURL } from "node:url";
import { extname } from "node:path";
import sharp from "sharp";
var launching;
function getBrowser() {
  launching ??= (async () => {
    for (const channel of ["chrome", "msedge"]) {
      try {
        return await chromium.launch({ channel });
      } catch {
      }
    }
    throw new Error("Attentry Design needs Chrome or Edge installed to render designs.");
  })();
  return launching;
}
async function closeBrowser() {
  const b = launching;
  launching = void 0;
  await (await b?.catch(() => void 0))?.close();
}
var RASTER = /* @__PURE__ */ new Set([".png", ".jpg", ".jpeg", ".webp", ".gif"]);
async function render(file, options = {}) {
  if (RASTER.has(extname(file).toLowerCase())) {
    const { data, info } = await sharp(file).png().toBuffer({ resolveWithObject: true });
    return { file, png: data, width: info.width, height: info.height, colors: [], fonts: [], texts: [], cut: [], panels: [], rings: [], images: [] };
  }
  const page = await (await getBrowser()).newPage({
    viewport: { width: options.width ?? 1200, height: options.height ?? 800 }
  });
  try {
    await page.goto(pathToFileURL(file).href);
    if (extname(file).toLowerCase() === ".svg") {
      await page.setViewportSize(await page.evaluate(SVG_SIZE));
    }
    await page.evaluate("document.fonts.ready");
    const viewport = page.viewportSize();
    const png = await page.screenshot({ type: "png" });
    const read = await page.evaluate(READ_DESIGN);
    return { file, png, width: viewport.width, height: viewport.height, ...read };
  } finally {
    await page.close();
  }
}
var SVG_SIZE = `(() => {
  const svg = document.documentElement;
  const vb = svg.viewBox && svg.viewBox.baseVal;
  const w = (svg.width && svg.width.baseVal.value) || (vb && vb.width) || 800;
  const h = (svg.height && svg.height.baseVal.value) || (vb && vb.height) || 600;
  return { width: Math.round(w), height: Math.round(h) };
})()`;
var READ_DESIGN = `(() => {
  // Only elements that paint: the root <svg> and <g> report a default black fill they never draw.
  const PAINTS = new Set(["rect", "circle", "ellipse", "line", "polyline", "polygon", "path", "text", "tspan", "textpath", "use"]);
  const colors = new Set(), fonts = new Set(), texts = [], cut = [], panels = [], rings = [], images = [];
  const panel = (r, what) => { if (r.width * r.height > 0.004 * vw * vh && r.width * r.height < 0.9 * vw * vh && panels.length < 400) panels.push({ x: r.x, y: r.y, width: r.width, height: r.height, what }); };
  // Whether a color is set (attribute or style) on the element or a parent, up to stop.
  const setOn = (el, k, stop) => {
    for (let e = el; e && e !== stop; e = e.parentElement) if (e.hasAttribute(k) || (e.style && e.style.getPropertyValue(k) !== "")) return true;
    return false;
  };
  const hasInside = (el) => {
    const tag = el.tagName.toLowerCase();
    if (tag !== "path" && tag !== "polyline") return true;
    try {
      const b = el.getBBox();
      const point = el.ownerSVGElement.createSVGPoint();
      for (let i = 1; i < 8; i++) for (let j = 1; j < 8; j++) {
        point.x = b.x + (b.width * i) / 8;
        point.y = b.y + (b.height * j) / 8;
        if (el.isPointInFill(point)) return true;
      }
      return false;
    } catch {
      return true; // no geometry to ask about: count its fill, as before
    }
  };
  const describe = (tag, style) => [tag, visible(style.fill) && !style.fill.startsWith("url(") ? "filled " + style.fill : visible(style.fill) ? "filled with a gradient" : "", visible(style.stroke) && parseFloat(style.strokeWidth) > 0 ? "outlined " + style.stroke : ""].filter(Boolean).join(" ");
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
      // A <line> has no inside, so its fill (black by default) is never painted; nor has a path or
      // polyline that is only strokes (a straight dash), which the browser says covers no point.
      // Colors that are set somewhere count; the default black that nothing set doesn't. A shape in
      // <defs> takes unset colors from where it's used, so there only its own count; a <use> paints
      // nothing itself but passes down the colors set on it or around it.
      const tag0 = el.tagName.toLowerCase();
      const defs = el.closest("defs, symbol");
      const kinds = tag0 === "line" || !hasInside(el) ? ["stroke"] : ["fill", "stroke"];
      const paints = kinds.filter((k) => (tag0 === "use" || defs ? setOn(el, k, defs ? defs.parentElement : null) : true)).map((k) => style[k]);
      for (const c of paints) if (visible(c) && !c.startsWith("url(")) colors.add(c);
      const r = el.getBoundingClientRect();
      const tag = el.tagName.toLowerCase();
      // Text is what sits in a panel, never the panel: a <text> would "hold" its own colored <tspan>.
      if (tag !== "text" && tag !== "tspan" && tag !== "textpath") panel(r, describe(tag, style));
      if ((tag === "circle" || tag === "ellipse") && visible(style.stroke) && parseFloat(style.strokeWidth) > 0 && r.width > 4 && rings.length < 100) {
        rings.push({ x: r.x, y: r.y, width: r.width, height: r.height, what: describe(tag, style) });
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
          if (b && b.width * b.height < 0.9 * vw * vh) holder = { ...b, what: e.tagName.toLowerCase() + (visible(s.backgroundColor) ? " with background " + s.backgroundColor : " with a border " + s.borderTopColor) };
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

// src/remotion.ts
import { createRequire } from "node:module";
import { mkdtemp, readdir, stat } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, resolve, sep } from "node:path";
var TIMEOUT = 3e4;
var served = /* @__PURE__ */ new Map();
async function lastChange(entryPoint) {
  const newest = async (folder) => {
    const entries = await readdir(folder, { withFileTypes: true });
    const times = await Promise.all(entries.map(async (e4) => {
      if (e4.name === "node_modules" || e4.name === ".git") return 0;
      const path = join(folder, e4.name);
      return e4.isDirectory() ? newest(path) : (await stat(path)).mtimeMs;
    }));
    return Math.max(0, ...times);
  };
  return newest(dirname(entryPoint));
}
async function serveProject(project, entry) {
  const entryPoint = resolve(project, entry);
  const changed = await lastChange(entryPoint);
  const kept = served.get(entryPoint);
  if (kept && kept.changed < changed) {
    served.delete(entryPoint);
    void kept.server.then((s) => s.close(), () => void 0);
  }
  if (!served.has(entryPoint)) {
    const server = (async () => {
      const found = [entryPoint, join(project, "package.json")].map((from) => {
        try {
          const require2 = createRequire(from);
          return { require: require2, bundlerPath: require2.resolve("@remotion/bundler") };
        } catch {
          return void 0;
        }
      }).find(Boolean);
      if (!found) throw new Error("This project has no @remotion/bundler and @remotion/renderer. Install Remotion in it (npm i @remotion/cli).");
      const bundler = found.require("@remotion/bundler");
      const renderer = found.require("@remotion/renderer");
      const at = found.bundlerPath.lastIndexOf(`${sep}node_modules${sep}`);
      const remotionRoot = at >= 0 ? found.bundlerPath.slice(0, at) : project;
      const folder = await bundler.bundle({ entryPoint, outDir: await mkdtemp(join(tmpdir(), "attentry-design-bundle-")) });
      const server2 = await renderer.RenderInternals.prepareServer({
        webpackConfigOrServeUrl: folder,
        port: null,
        remotionRoot,
        offthreadVideoThreads: 2,
        logLevel: "error",
        indent: false,
        offthreadVideoCacheSizeInBytes: null,
        binariesDirectory: null,
        forceIPv4: false,
        sampleRate: 48e3
      });
      return { url: server2.serveUrl, proxyPort: server2.offthreadPort, close: () => server2.closeServer(true) };
    })();
    server.catch(() => served.delete(entryPoint));
    served.set(entryPoint, { changed, server });
  }
  return served.get(entryPoint).server;
}
async function closeRemotion() {
  const all = [...served.values()];
  served.clear();
  await Promise.all(all.map(async (s) => (await s.server.catch(() => void 0))?.close()));
}
var RemotionProject = class _RemotionProject {
  constructor(server, page) {
    this.server = server;
    this.page = page;
  }
  server;
  page;
  static async open(project, entry) {
    const server = await serveProject(project, entry);
    return new _RemotionProject(server, await openBundle(server));
  }
  async compositions() {
    await this.page.evaluate("window.remotion_setBundleMode({ type: 'evaluation' })");
    await this.ready();
    return await this.page.evaluate("window.getStaticCompositions()");
  }
  /** Reads the given frames of one composition: a screenshot and the text on screen for each. */
  async frames(composition, frames) {
    const c2 = composition;
    await this.page.close();
    this.page = await openBundle(this.server);
    await this.page.setViewportSize({ width: c2.width, height: c2.height });
    await this.page.evaluate(
      `window.remotion_setBundleMode(${JSON.stringify({
        type: "composition",
        compositionName: c2.id,
        serializedResolvedPropsWithSchema: c2.serializedResolvedPropsWithCustomSchema,
        compositionDurationInFrames: c2.durationInFrames,
        compositionFps: c2.fps,
        compositionHeight: c2.height,
        compositionWidth: c2.width,
        compositionDefaultCodec: c2.defaultCodec,
        compositionDefaultOutName: c2.defaultOutName,
        compositionDefaultVideoImageFormat: c2.defaultVideoImageFormat,
        compositionDefaultPixelFormat: c2.defaultPixelFormat,
        compositionDefaultProResProfile: c2.defaultProResProfile,
        compositionDefaultSampleRate: c2.defaultSampleRate
      })})`
    );
    await this.ready();
    const out = [];
    for (const frame of frames) {
      await this.page.evaluate(`window.remotion_setFrame(${frame}, ${JSON.stringify(c2.id)}, 1)`);
      await this.ready();
      await this.page.evaluate("document.fonts.ready");
      const png = await this.page.screenshot({ type: "png" });
      const read = await this.page.evaluate(READ_DESIGN);
      out.push({ frame, time: frame / c2.fps, png, ...read });
    }
    return out;
  }
  async close() {
    await this.page.close();
  }
  async ready() {
    await this.page.waitForFunction(
      "window.remotion_renderReady === true || window.remotion_cancelledError !== undefined",
      void 0,
      { timeout: TIMEOUT }
    );
    const error = await this.page.evaluate("window.remotion_cancelledError");
    if (error) throw new Error(`The video failed to render: ${String(error).split("\n")[0]}`);
  }
};
async function openBundle(server) {
  const page = await (await getBrowser()).newPage();
  await page.addInitScript(`
    window.remotion_puppeteerTimeout = ${TIMEOUT};
    window.remotion_isMainTab = true;
    window.remotion_mediaCacheSizeInBytes = 500000000;
    window.remotion_initialMemoryAvailable = 2000000000;
    window.remotion_sampleRate = 48000;
    window.process = window.process || {}; window.process.env = window.process.env || {};
    window.process.env.NODE_ENV = "production";
    window.remotion_broadcastChannel = new BroadcastChannel("remotion-video-frame-extraction");
    window.remotion_envVariables = "{}";
    window.remotion_inputProps = "{}";
    window.remotion_initialFrame = 0;
    window.remotion_attempt = 1;
    window.remotion_proxyPort = ${server.proxyPort};
    window.remotion_audioEnabled = false;
    window.remotion_videoEnabled = true;
    window.remotion_logLevel = "error";
  `);
  await page.goto(`${server.url}/index.html`);
  const ok = await page.evaluate("typeof window.getStaticCompositions === 'function' && typeof window.remotion_setBundleMode === 'function'");
  if (!ok) {
    await page.close();
    throw new Error("This Remotion version works differently from the ones Attentry Design knows; video checks can't run on it yet.");
  }
  return page;
}
function sampleFrames(c2, step) {
  const every = Math.max(1, Math.round(step * c2.fps));
  const frames = [];
  for (let f3 = 0; f3 < c2.durationInFrames; f3 += every) frames.push(f3);
  if (frames.at(-1) !== c2.durationInFrames - 1) frames.push(c2.durationInFrames - 1);
  return frames;
}

// src/lettering.ts
import sharp3 from "sharp";
import { createWorker, PSM } from "tesseract.js";
import eng from "@tesseract.js-data/eng";
import { tmpdir as tmpdir2 } from "node:os";
import { join as join2 } from "node:path";

// node_modules/culori/src/rgb/parseNumber.js
var parseNumber = (color, len) => {
  if (typeof color !== "number") return;
  if (len === 3) {
    return {
      mode: "rgb",
      r: (color >> 8 & 15 | color >> 4 & 240) / 255,
      g: (color >> 4 & 15 | color & 240) / 255,
      b: (color & 15 | color << 4 & 240) / 255
    };
  }
  if (len === 4) {
    return {
      mode: "rgb",
      r: (color >> 12 & 15 | color >> 8 & 240) / 255,
      g: (color >> 8 & 15 | color >> 4 & 240) / 255,
      b: (color >> 4 & 15 | color & 240) / 255,
      alpha: (color & 15 | color << 4 & 240) / 255
    };
  }
  if (len === 6) {
    return {
      mode: "rgb",
      r: (color >> 16 & 255) / 255,
      g: (color >> 8 & 255) / 255,
      b: (color & 255) / 255
    };
  }
  if (len === 8) {
    return {
      mode: "rgb",
      r: (color >> 24 & 255) / 255,
      g: (color >> 16 & 255) / 255,
      b: (color >> 8 & 255) / 255,
      alpha: (color & 255) / 255
    };
  }
};
var parseNumber_default = parseNumber;

// node_modules/culori/src/colors/named.js
var named = {
  aliceblue: 15792383,
  antiquewhite: 16444375,
  aqua: 65535,
  aquamarine: 8388564,
  azure: 15794175,
  beige: 16119260,
  bisque: 16770244,
  black: 0,
  blanchedalmond: 16772045,
  blue: 255,
  blueviolet: 9055202,
  brown: 10824234,
  burlywood: 14596231,
  cadetblue: 6266528,
  chartreuse: 8388352,
  chocolate: 13789470,
  coral: 16744272,
  cornflowerblue: 6591981,
  cornsilk: 16775388,
  crimson: 14423100,
  cyan: 65535,
  darkblue: 139,
  darkcyan: 35723,
  darkgoldenrod: 12092939,
  darkgray: 11119017,
  darkgreen: 25600,
  darkgrey: 11119017,
  darkkhaki: 12433259,
  darkmagenta: 9109643,
  darkolivegreen: 5597999,
  darkorange: 16747520,
  darkorchid: 10040012,
  darkred: 9109504,
  darksalmon: 15308410,
  darkseagreen: 9419919,
  darkslateblue: 4734347,
  darkslategray: 3100495,
  darkslategrey: 3100495,
  darkturquoise: 52945,
  darkviolet: 9699539,
  deeppink: 16716947,
  deepskyblue: 49151,
  dimgray: 6908265,
  dimgrey: 6908265,
  dodgerblue: 2003199,
  firebrick: 11674146,
  floralwhite: 16775920,
  forestgreen: 2263842,
  fuchsia: 16711935,
  gainsboro: 14474460,
  ghostwhite: 16316671,
  gold: 16766720,
  goldenrod: 14329120,
  gray: 8421504,
  green: 32768,
  greenyellow: 11403055,
  grey: 8421504,
  honeydew: 15794160,
  hotpink: 16738740,
  indianred: 13458524,
  indigo: 4915330,
  ivory: 16777200,
  khaki: 15787660,
  lavender: 15132410,
  lavenderblush: 16773365,
  lawngreen: 8190976,
  lemonchiffon: 16775885,
  lightblue: 11393254,
  lightcoral: 15761536,
  lightcyan: 14745599,
  lightgoldenrodyellow: 16448210,
  lightgray: 13882323,
  lightgreen: 9498256,
  lightgrey: 13882323,
  lightpink: 16758465,
  lightsalmon: 16752762,
  lightseagreen: 2142890,
  lightskyblue: 8900346,
  lightslategray: 7833753,
  lightslategrey: 7833753,
  lightsteelblue: 11584734,
  lightyellow: 16777184,
  lime: 65280,
  limegreen: 3329330,
  linen: 16445670,
  magenta: 16711935,
  maroon: 8388608,
  mediumaquamarine: 6737322,
  mediumblue: 205,
  mediumorchid: 12211667,
  mediumpurple: 9662683,
  mediumseagreen: 3978097,
  mediumslateblue: 8087790,
  mediumspringgreen: 64154,
  mediumturquoise: 4772300,
  mediumvioletred: 13047173,
  midnightblue: 1644912,
  mintcream: 16121850,
  mistyrose: 16770273,
  moccasin: 16770229,
  navajowhite: 16768685,
  navy: 128,
  oldlace: 16643558,
  olive: 8421376,
  olivedrab: 7048739,
  orange: 16753920,
  orangered: 16729344,
  orchid: 14315734,
  palegoldenrod: 15657130,
  palegreen: 10025880,
  paleturquoise: 11529966,
  palevioletred: 14381203,
  papayawhip: 16773077,
  peachpuff: 16767673,
  peru: 13468991,
  pink: 16761035,
  plum: 14524637,
  powderblue: 11591910,
  purple: 8388736,
  // Added in CSS Colors Level 4:
  // https://drafts.csswg.org/css-color/#changes-from-3
  rebeccapurple: 6697881,
  red: 16711680,
  rosybrown: 12357519,
  royalblue: 4286945,
  saddlebrown: 9127187,
  salmon: 16416882,
  sandybrown: 16032864,
  seagreen: 3050327,
  seashell: 16774638,
  sienna: 10506797,
  silver: 12632256,
  skyblue: 8900331,
  slateblue: 6970061,
  slategray: 7372944,
  slategrey: 7372944,
  snow: 16775930,
  springgreen: 65407,
  steelblue: 4620980,
  tan: 13808780,
  teal: 32896,
  thistle: 14204888,
  tomato: 16737095,
  turquoise: 4251856,
  violet: 15631086,
  wheat: 16113331,
  white: 16777215,
  whitesmoke: 16119285,
  yellow: 16776960,
  yellowgreen: 10145074
};
var named_default = named;

// node_modules/culori/src/rgb/parseNamed.js
var parseNamed = (color) => {
  return parseNumber_default(named_default[color.toLowerCase()], 6);
};
var parseNamed_default = parseNamed;

// node_modules/culori/src/rgb/parseHex.js
var hex = /^#?([0-9a-f]{8}|[0-9a-f]{6}|[0-9a-f]{4}|[0-9a-f]{3})$/i;
var parseHex = (color) => {
  let match;
  return (match = color.match(hex)) ? parseNumber_default(parseInt(match[1], 16), match[1].length) : void 0;
};
var parseHex_default = parseHex;

// node_modules/culori/src/util/regex.js
var num = "([+-]?\\d*\\.?\\d+(?:[eE][+-]?\\d+)?)";
var num_none = `(?:${num}|none)`;
var per = `${num}%`;
var per_none = `(?:${num}%|none)`;
var num_per = `(?:${num}%|${num})`;
var num_per_none = `(?:${num}%|${num}|none)`;
var hue = `(?:${num}(deg|grad|rad|turn)|${num})`;
var hue_none = `(?:${num}(deg|grad|rad|turn)|${num}|none)`;
var c = `\\s*,\\s*`;
var rx_num_per_none = new RegExp("^" + num_per_none + "$");

// node_modules/culori/src/rgb/parseRgbLegacy.js
var rgb_num_old = new RegExp(
  `^rgba?\\(\\s*${num}${c}${num}${c}${num}\\s*(?:,\\s*${num_per}\\s*)?\\)$`
);
var rgb_per_old = new RegExp(
  `^rgba?\\(\\s*${per}${c}${per}${c}${per}\\s*(?:,\\s*${num_per}\\s*)?\\)$`
);
var parseRgbLegacy = (color) => {
  let res = { mode: "rgb" };
  let match;
  if (match = color.match(rgb_num_old)) {
    if (match[1] !== void 0) {
      res.r = match[1] / 255;
    }
    if (match[2] !== void 0) {
      res.g = match[2] / 255;
    }
    if (match[3] !== void 0) {
      res.b = match[3] / 255;
    }
  } else if (match = color.match(rgb_per_old)) {
    if (match[1] !== void 0) {
      res.r = match[1] / 100;
    }
    if (match[2] !== void 0) {
      res.g = match[2] / 100;
    }
    if (match[3] !== void 0) {
      res.b = match[3] / 100;
    }
  } else {
    return void 0;
  }
  if (match[4] !== void 0) {
    res.alpha = Math.max(0, Math.min(1, match[4] / 100));
  } else if (match[5] !== void 0) {
    res.alpha = Math.max(0, Math.min(1, +match[5]));
  }
  return res;
};
var parseRgbLegacy_default = parseRgbLegacy;

// node_modules/culori/src/_prepare.js
var prepare = (color, mode) => color === void 0 ? void 0 : typeof color !== "object" ? parse_default(color) : color.mode !== void 0 ? color : mode ? { ...color, mode } : void 0;
var prepare_default = prepare;

// node_modules/culori/src/converter.js
var converter = (target_mode = "rgb") => (color) => (color = prepare_default(color, target_mode)) !== void 0 ? (
  // if the color's mode corresponds to our target mode
  color.mode === target_mode ? (
    // then just return the color
    color
  ) : (
    // otherwise check to see if we have a dedicated
    // converter for the target mode
    converters[color.mode][target_mode] ? (
      // and return its result...
      converters[color.mode][target_mode](color)
    ) : (
      // ...otherwise pass through RGB as an intermediary step.
      // if the target mode is RGB...
      target_mode === "rgb" ? (
        // just return the RGB
        converters[color.mode].rgb(color)
      ) : (
        // otherwise convert color.mode -> RGB -> target_mode
        converters.rgb[target_mode](converters[color.mode].rgb(color))
      )
    )
  )
) : void 0;
var converter_default = converter;

// node_modules/culori/src/modes.js
var converters = {};
var modes = {};
var parsers = [];
var colorProfiles = {};
var identity = (v) => v;
var useMode = (definition29) => {
  converters[definition29.mode] = {
    ...converters[definition29.mode],
    ...definition29.toMode
  };
  Object.keys(definition29.fromMode || {}).forEach((k4) => {
    if (!converters[k4]) {
      converters[k4] = {};
    }
    converters[k4][definition29.mode] = definition29.fromMode[k4];
  });
  if (!definition29.ranges) {
    definition29.ranges = {};
  }
  if (!definition29.difference) {
    definition29.difference = {};
  }
  definition29.channels.forEach((channel) => {
    if (definition29.ranges[channel] === void 0) {
      definition29.ranges[channel] = [0, 1];
    }
    if (!definition29.interpolate[channel]) {
      throw new Error(`Missing interpolator for: ${channel}`);
    }
    if (typeof definition29.interpolate[channel] === "function") {
      definition29.interpolate[channel] = {
        use: definition29.interpolate[channel]
      };
    }
    if (!definition29.interpolate[channel].fixup) {
      definition29.interpolate[channel].fixup = identity;
    }
  });
  modes[definition29.mode] = definition29;
  (definition29.parse || []).forEach((parser) => {
    useParser(parser, definition29.mode);
  });
  return converter_default(definition29.mode);
};
var getMode = (mode) => modes[mode];
var useParser = (parser, mode) => {
  if (typeof parser === "string") {
    if (!mode) {
      throw new Error(`'mode' required when 'parser' is a string`);
    }
    colorProfiles[parser] = mode;
  } else if (typeof parser === "function") {
    if (parsers.indexOf(parser) < 0) {
      parsers.push(parser);
    }
  }
};

// node_modules/culori/src/parse.js
var IdentStartCodePoint = /[^\x00-\x7F]|[a-zA-Z_]/;
var IdentCodePoint = /[^\x00-\x7F]|[-\w]/;
var Tok = {
  Function: "function",
  Ident: "ident",
  Number: "number",
  Percentage: "percentage",
  ParenClose: ")",
  None: "none",
  Hue: "hue",
  Alpha: "alpha"
};
var _i = 0;
function is_num(chars) {
  let ch = chars[_i];
  let ch1 = chars[_i + 1];
  if (ch === "-" || ch === "+") {
    return /\d/.test(ch1) || ch1 === "." && /\d/.test(chars[_i + 2]);
  }
  if (ch === ".") {
    return /\d/.test(ch1);
  }
  return /\d/.test(ch);
}
function is_ident(chars) {
  if (_i >= chars.length) {
    return false;
  }
  let ch = chars[_i];
  if (IdentStartCodePoint.test(ch)) {
    return true;
  }
  if (ch === "-") {
    if (chars.length - _i < 2) {
      return false;
    }
    let ch1 = chars[_i + 1];
    if (ch1 === "-" || IdentStartCodePoint.test(ch1)) {
      return true;
    }
    return false;
  }
  return false;
}
var huenits = {
  deg: 1,
  rad: 180 / Math.PI,
  grad: 9 / 10,
  turn: 360
};
function num2(chars) {
  let value = "";
  if (chars[_i] === "-" || chars[_i] === "+") {
    value += chars[_i++];
  }
  value += digits(chars);
  if (chars[_i] === "." && /\d/.test(chars[_i + 1])) {
    value += chars[_i++] + digits(chars);
  }
  if (chars[_i] === "e" || chars[_i] === "E") {
    if ((chars[_i + 1] === "-" || chars[_i + 1] === "+") && /\d/.test(chars[_i + 2])) {
      value += chars[_i++] + chars[_i++] + digits(chars);
    } else if (/\d/.test(chars[_i + 1])) {
      value += chars[_i++] + digits(chars);
    }
  }
  if (is_ident(chars)) {
    let id = ident(chars);
    if (id === "deg" || id === "rad" || id === "turn" || id === "grad") {
      return { type: Tok.Hue, value: value * huenits[id] };
    }
    return void 0;
  }
  if (chars[_i] === "%") {
    _i++;
    return { type: Tok.Percentage, value: +value };
  }
  return { type: Tok.Number, value: +value };
}
function digits(chars) {
  let v = "";
  while (/\d/.test(chars[_i])) {
    v += chars[_i++];
  }
  return v;
}
function ident(chars) {
  let v = "";
  while (_i < chars.length && IdentCodePoint.test(chars[_i])) {
    v += chars[_i++];
  }
  return v;
}
function identlike(chars) {
  let v = ident(chars);
  if (chars[_i] === "(") {
    _i++;
    return { type: Tok.Function, value: v };
  }
  if (v === "none") {
    return { type: Tok.None, value: void 0 };
  }
  return { type: Tok.Ident, value: v };
}
function tokenize(str = "") {
  let chars = str.trim();
  let tokens = [];
  let ch;
  _i = 0;
  while (_i < chars.length) {
    ch = chars[_i++];
    if (ch === "\n" || ch === "	" || ch === " ") {
      while (_i < chars.length && (chars[_i] === "\n" || chars[_i] === "	" || chars[_i] === " ")) {
        _i++;
      }
      continue;
    }
    if (ch === ",") {
      return void 0;
    }
    if (ch === ")") {
      tokens.push({ type: Tok.ParenClose });
      continue;
    }
    if (ch === "+") {
      _i--;
      if (is_num(chars)) {
        tokens.push(num2(chars));
        continue;
      }
      return void 0;
    }
    if (ch === "-") {
      _i--;
      if (is_num(chars)) {
        tokens.push(num2(chars));
        continue;
      }
      if (is_ident(chars)) {
        tokens.push({ type: Tok.Ident, value: ident(chars) });
        continue;
      }
      return void 0;
    }
    if (ch === ".") {
      _i--;
      if (is_num(chars)) {
        tokens.push(num2(chars));
        continue;
      }
      return void 0;
    }
    if (ch === "/") {
      while (_i < chars.length && (chars[_i] === "\n" || chars[_i] === "	" || chars[_i] === " ")) {
        _i++;
      }
      let alpha;
      if (is_num(chars)) {
        alpha = num2(chars);
        if (alpha.type !== Tok.Hue) {
          tokens.push({ type: Tok.Alpha, value: alpha });
          continue;
        }
      }
      if (is_ident(chars)) {
        if (ident(chars) === "none") {
          tokens.push({
            type: Tok.Alpha,
            value: { type: Tok.None, value: void 0 }
          });
          continue;
        }
      }
      return void 0;
    }
    if (/\d/.test(ch)) {
      _i--;
      tokens.push(num2(chars));
      continue;
    }
    if (IdentStartCodePoint.test(ch)) {
      _i--;
      tokens.push(identlike(chars));
      continue;
    }
    return void 0;
  }
  return tokens;
}
function parseColorSyntax(tokens) {
  tokens._i = 0;
  let token = tokens[tokens._i++];
  if (!token || token.type !== Tok.Function || token.value !== "color") {
    return void 0;
  }
  token = tokens[tokens._i++];
  if (token.type !== Tok.Ident) {
    return void 0;
  }
  const mode = colorProfiles[token.value];
  if (!mode) {
    return void 0;
  }
  const res = { mode };
  const coords = consumeCoords(tokens, false);
  if (!coords) {
    return void 0;
  }
  const channels = getMode(mode).channels;
  for (let ii = 0, c2, ch; ii < channels.length; ii++) {
    c2 = coords[ii];
    ch = channels[ii];
    if (c2.type !== Tok.None) {
      res[ch] = c2.type === Tok.Number ? c2.value : c2.value / 100;
      if (ch === "alpha") {
        res[ch] = Math.max(0, Math.min(1, res[ch]));
      }
    }
  }
  return res;
}
function consumeCoords(tokens, includeHue) {
  const coords = [];
  let token;
  while (tokens._i < tokens.length) {
    token = tokens[tokens._i++];
    if (token.type === Tok.None || token.type === Tok.Number || token.type === Tok.Alpha || token.type === Tok.Percentage || includeHue && token.type === Tok.Hue) {
      coords.push(token);
      continue;
    }
    if (token.type === Tok.ParenClose) {
      if (tokens._i < tokens.length) {
        return void 0;
      }
      continue;
    }
    return void 0;
  }
  if (coords.length < 3 || coords.length > 4) {
    return void 0;
  }
  if (coords.length === 4) {
    if (coords[3].type !== Tok.Alpha) {
      return void 0;
    }
    coords[3] = coords[3].value;
  }
  if (coords.length === 3) {
    coords.push({ type: Tok.None, value: void 0 });
  }
  return coords.every((c2) => c2.type !== Tok.Alpha) ? coords : void 0;
}
function parseModernSyntax(tokens, includeHue) {
  tokens._i = 0;
  let token = tokens[tokens._i++];
  if (!token || token.type !== Tok.Function) {
    return void 0;
  }
  let coords = consumeCoords(tokens, includeHue);
  if (!coords) {
    return void 0;
  }
  coords.unshift(token.value);
  return coords;
}
var parse = (color) => {
  if (typeof color !== "string") {
    return void 0;
  }
  const tokens = tokenize(color);
  const parsed = tokens ? parseModernSyntax(tokens, true) : void 0;
  let result = void 0;
  let i = 0;
  let len = parsers.length;
  while (i < len) {
    if ((result = parsers[i++](color, parsed)) !== void 0) {
      return result;
    }
  }
  return tokens ? parseColorSyntax(tokens) : void 0;
};
var parse_default = parse;

// node_modules/culori/src/rgb/parseRgb.js
function parseRgb(color, parsed) {
  if (!parsed || parsed[0] !== "rgb" && parsed[0] !== "rgba") {
    return void 0;
  }
  const res = { mode: "rgb" };
  const [, r2, g, b, alpha] = parsed;
  if (r2.type === Tok.Hue || g.type === Tok.Hue || b.type === Tok.Hue) {
    return void 0;
  }
  if (r2.type !== Tok.None) {
    res.r = r2.type === Tok.Number ? r2.value / 255 : r2.value / 100;
  }
  if (g.type !== Tok.None) {
    res.g = g.type === Tok.Number ? g.value / 255 : g.value / 100;
  }
  if (b.type !== Tok.None) {
    res.b = b.type === Tok.Number ? b.value / 255 : b.value / 100;
  }
  if (alpha.type !== Tok.None) {
    res.alpha = Math.min(
      1,
      Math.max(
        0,
        alpha.type === Tok.Number ? alpha.value : alpha.value / 100
      )
    );
  }
  return res;
}
var parseRgb_default = parseRgb;

// node_modules/culori/src/rgb/parseTransparent.js
var parseTransparent = (c2) => c2 === "transparent" ? { mode: "rgb", r: 0, g: 0, b: 0, alpha: 0 } : void 0;
var parseTransparent_default = parseTransparent;

// node_modules/culori/src/interpolate/lerp.js
var lerp = (a, b, t) => a + t * (b - a);

// node_modules/culori/src/interpolate/piecewise.js
var get_classes = (arr) => {
  let classes = [];
  for (let i = 0; i < arr.length - 1; i++) {
    let a = arr[i];
    let b = arr[i + 1];
    if (a === void 0 && b === void 0) {
      classes.push(void 0);
    } else if (a !== void 0 && b !== void 0) {
      classes.push([a, b]);
    } else {
      classes.push(a !== void 0 ? [a, a] : [b, b]);
    }
  }
  return classes;
};
var interpolatorPiecewise = (interpolator) => (arr) => {
  let classes = get_classes(arr);
  return (t) => {
    let cls = t * classes.length;
    let idx = t >= 1 ? classes.length - 1 : Math.max(Math.floor(cls), 0);
    let pair = classes[idx];
    return pair === void 0 ? void 0 : interpolator(pair[0], pair[1], cls - idx);
  };
};

// node_modules/culori/src/interpolate/linear.js
var interpolatorLinear = interpolatorPiecewise(lerp);

// node_modules/culori/src/fixup/alpha.js
var fixupAlpha = (arr) => {
  let some_defined = false;
  let res = arr.map((v) => {
    if (v !== void 0) {
      some_defined = true;
      return v;
    }
    return 1;
  });
  return some_defined ? res : arr;
};

// node_modules/culori/src/rgb/definition.js
var definition = {
  mode: "rgb",
  channels: ["r", "g", "b", "alpha"],
  parse: [
    parseRgb_default,
    parseHex_default,
    parseRgbLegacy_default,
    parseNamed_default,
    parseTransparent_default,
    "srgb"
  ],
  serialize: "srgb",
  interpolate: {
    r: interpolatorLinear,
    g: interpolatorLinear,
    b: interpolatorLinear,
    alpha: { use: interpolatorLinear, fixup: fixupAlpha }
  },
  gamut: true,
  white: { r: 1, g: 1, b: 1 },
  black: { r: 0, g: 0, b: 0 }
};
var definition_default = definition;

// node_modules/culori/src/a98/convertA98ToXyz65.js
var linearize = (v = 0) => Math.pow(Math.abs(v), 563 / 256) * Math.sign(v);
var convertA98ToXyz65 = (a982) => {
  let r2 = linearize(a982.r);
  let g = linearize(a982.g);
  let b = linearize(a982.b);
  let res = {
    mode: "xyz65",
    x: 0.5766690429101305 * r2 + 0.1855582379065463 * g + 0.1882286462349947 * b,
    y: 0.297344975250536 * r2 + 0.6273635662554661 * g + 0.0752914584939979 * b,
    z: 0.0270313613864123 * r2 + 0.0706888525358272 * g + 0.9913375368376386 * b
  };
  if (a982.alpha !== void 0) {
    res.alpha = a982.alpha;
  }
  return res;
};
var convertA98ToXyz65_default = convertA98ToXyz65;

// node_modules/culori/src/a98/convertXyz65ToA98.js
var gamma = (v) => Math.pow(Math.abs(v), 256 / 563) * Math.sign(v);
var convertXyz65ToA98 = ({ x, y, z, alpha }) => {
  if (x === void 0) x = 0;
  if (y === void 0) y = 0;
  if (z === void 0) z = 0;
  let res = {
    mode: "a98",
    r: gamma(
      x * 2.0415879038107465 - y * 0.5650069742788597 - 0.3447313507783297 * z
    ),
    g: gamma(
      x * -0.9692436362808798 + y * 1.8759675015077206 + 0.0415550574071756 * z
    ),
    b: gamma(
      x * 0.0134442806320312 - y * 0.1183623922310184 + 1.0151749943912058 * z
    )
  };
  if (alpha !== void 0) {
    res.alpha = alpha;
  }
  return res;
};
var convertXyz65ToA98_default = convertXyz65ToA98;

// node_modules/culori/src/lrgb/convertRgbToLrgb.js
var fn = (c2 = 0) => {
  const abs2 = Math.abs(c2);
  if (abs2 <= 0.04045) {
    return c2 / 12.92;
  }
  return (Math.sign(c2) || 1) * Math.pow((abs2 + 0.055) / 1.055, 2.4);
};
var convertRgbToLrgb = ({ r: r2, g, b, alpha }) => {
  let res = {
    mode: "lrgb",
    r: fn(r2),
    g: fn(g),
    b: fn(b)
  };
  if (alpha !== void 0) res.alpha = alpha;
  return res;
};
var convertRgbToLrgb_default = convertRgbToLrgb;

// node_modules/culori/src/xyz65/convertRgbToXyz65.js
var convertRgbToXyz65 = (rgb3) => {
  let { r: r2, g, b, alpha } = convertRgbToLrgb_default(rgb3);
  let res = {
    mode: "xyz65",
    x: 0.4123907992659593 * r2 + 0.357584339383878 * g + 0.1804807884018343 * b,
    y: 0.2126390058715102 * r2 + 0.715168678767756 * g + 0.0721923153607337 * b,
    z: 0.0193308187155918 * r2 + 0.119194779794626 * g + 0.9505321522496607 * b
  };
  if (alpha !== void 0) {
    res.alpha = alpha;
  }
  return res;
};
var convertRgbToXyz65_default = convertRgbToXyz65;

// node_modules/culori/src/lrgb/convertLrgbToRgb.js
var fn2 = (c2 = 0) => {
  const abs2 = Math.abs(c2);
  if (abs2 > 31308e-7) {
    return (Math.sign(c2) || 1) * (1.055 * Math.pow(abs2, 1 / 2.4) - 0.055);
  }
  return c2 * 12.92;
};
var convertLrgbToRgb = ({ r: r2, g, b, alpha }, mode = "rgb") => {
  let res = {
    mode,
    r: fn2(r2),
    g: fn2(g),
    b: fn2(b)
  };
  if (alpha !== void 0) res.alpha = alpha;
  return res;
};
var convertLrgbToRgb_default = convertLrgbToRgb;

// node_modules/culori/src/xyz65/convertXyz65ToRgb.js
var convertXyz65ToRgb = ({ x, y, z, alpha }) => {
  if (x === void 0) x = 0;
  if (y === void 0) y = 0;
  if (z === void 0) z = 0;
  let res = convertLrgbToRgb_default({
    r: x * 3.2409699419045226 - y * 1.537383177570094 - 0.4986107602930034 * z,
    g: x * -0.9692436362808796 + y * 1.8759675015077204 + 0.0415550574071756 * z,
    b: x * 0.0556300796969936 - y * 0.2039769588889765 + 1.0569715142428784 * z
  });
  if (alpha !== void 0) {
    res.alpha = alpha;
  }
  return res;
};
var convertXyz65ToRgb_default = convertXyz65ToRgb;

// node_modules/culori/src/a98/definition.js
var definition2 = {
  ...definition_default,
  mode: "a98",
  parse: ["a98-rgb"],
  serialize: "a98-rgb",
  fromMode: {
    rgb: (color) => convertXyz65ToA98_default(convertRgbToXyz65_default(color)),
    xyz65: convertXyz65ToA98_default
  },
  toMode: {
    rgb: (color) => convertXyz65ToRgb_default(convertA98ToXyz65_default(color)),
    xyz65: convertA98ToXyz65_default
  }
};
var definition_default2 = definition2;

// node_modules/culori/src/util/normalizeHue.js
var normalizeHue = (hue3) => (hue3 = hue3 % 360) < 0 ? hue3 + 360 : hue3;
var normalizeHue_default = normalizeHue;

// node_modules/culori/src/fixup/hue.js
var hue2 = (hues, fn5) => {
  return hues.map((hue3, idx, arr) => {
    if (hue3 === void 0) {
      return hue3;
    }
    let normalized = normalizeHue_default(hue3);
    if (idx === 0 || hues[idx - 1] === void 0) {
      return normalized;
    }
    return fn5(normalized - normalizeHue_default(arr[idx - 1]));
  }).reduce((acc, curr) => {
    if (!acc.length || curr === void 0 || acc[acc.length - 1] === void 0) {
      acc.push(curr);
      return acc;
    }
    acc.push(curr + acc[acc.length - 1]);
    return acc;
  }, []);
};
var fixupHueShorter = (arr) => hue2(arr, (d) => Math.abs(d) <= 180 ? d : d - 360 * Math.sign(d));

// node_modules/culori/src/cubehelix/constants.js
var M = [-0.14861, 1.78277, -0.29227, -0.90649, 1.97294, 0];
var degToRad = Math.PI / 180;
var radToDeg = 180 / Math.PI;

// node_modules/culori/src/cubehelix/convertRgbToCubehelix.js
var DE = M[3] * M[4];
var BE = M[1] * M[4];
var BCAD = M[1] * M[2] - M[0] * M[3];
var convertRgbToCubehelix = ({ r: r2, g, b, alpha }) => {
  if (r2 === void 0) r2 = 0;
  if (g === void 0) g = 0;
  if (b === void 0) b = 0;
  let l = (BCAD * b + r2 * DE - g * BE) / (BCAD + DE - BE);
  let x = b - l;
  let y = (M[4] * (g - l) - M[2] * x) / M[3];
  let res = {
    mode: "cubehelix",
    l,
    s: l === 0 || l === 1 ? void 0 : Math.sqrt(x * x + y * y) / (M[4] * l * (1 - l))
  };
  if (res.s) res.h = Math.atan2(y, x) * radToDeg - 120;
  if (alpha !== void 0) res.alpha = alpha;
  return res;
};
var convertRgbToCubehelix_default = convertRgbToCubehelix;

// node_modules/culori/src/cubehelix/convertCubehelixToRgb.js
var convertCubehelixToRgb = ({ h, s, l, alpha }) => {
  let res = { mode: "rgb" };
  h = (h === void 0 ? 0 : h + 120) * degToRad;
  if (l === void 0) l = 0;
  let amp = s === void 0 ? 0 : s * l * (1 - l);
  let cosh = Math.cos(h);
  let sinh = Math.sin(h);
  res.r = l + amp * (M[0] * cosh + M[1] * sinh);
  res.g = l + amp * (M[2] * cosh + M[3] * sinh);
  res.b = l + amp * (M[4] * cosh + M[5] * sinh);
  if (alpha !== void 0) res.alpha = alpha;
  return res;
};
var convertCubehelixToRgb_default = convertCubehelixToRgb;

// node_modules/culori/src/difference.js
var differenceHueSaturation = (std, smp) => {
  if (std.h === void 0 || smp.h === void 0 || !std.s || !smp.s) {
    return 0;
  }
  let std_h = normalizeHue_default(std.h);
  let smp_h = normalizeHue_default(smp.h);
  let dH = Math.sin((smp_h - std_h + 360) / 2 * Math.PI / 180);
  return 2 * Math.sqrt(std.s * smp.s) * dH;
};
var differenceHueNaive = (std, smp) => {
  if (std.h === void 0 || smp.h === void 0) {
    return 0;
  }
  let std_h = normalizeHue_default(std.h);
  let smp_h = normalizeHue_default(smp.h);
  if (Math.abs(smp_h - std_h) > 180) {
    return std_h - (smp_h - 360 * Math.sign(smp_h - std_h));
  }
  return smp_h - std_h;
};
var differenceHueChroma = (std, smp) => {
  if (std.h === void 0 || smp.h === void 0 || !std.c || !smp.c) {
    return 0;
  }
  let std_h = normalizeHue_default(std.h);
  let smp_h = normalizeHue_default(smp.h);
  let dH = Math.sin((smp_h - std_h + 360) / 2 * Math.PI / 180);
  return 2 * Math.sqrt(std.c * smp.c) * dH;
};
var differenceEuclidean = (mode = "rgb", weights = [1, 1, 1, 0]) => {
  let def = getMode(mode);
  let channels = def.channels;
  let diffs = def.difference;
  let conv = converter_default(mode);
  return (std, smp) => {
    let ConvStd = conv(std);
    let ConvSmp = conv(smp);
    return Math.sqrt(
      channels.reduce((sum, k4, idx) => {
        let delta = diffs[k4] ? diffs[k4](ConvStd, ConvSmp) : ConvStd[k4] - ConvSmp[k4];
        return sum + (weights[idx] || 0) * Math.pow(isNaN(delta) ? 0 : delta, 2);
      }, 0)
    );
  };
};

// node_modules/culori/src/average.js
var averageAngle = (val) => {
  let sum = val.reduce(
    (sum2, val2) => {
      if (val2 !== void 0) {
        let rad = val2 * Math.PI / 180;
        sum2.sin += Math.sin(rad);
        sum2.cos += Math.cos(rad);
      }
      return sum2;
    },
    { sin: 0, cos: 0 }
  );
  let angle = Math.atan2(sum.sin, sum.cos) * 180 / Math.PI;
  return angle < 0 ? 360 + angle : angle;
};

// node_modules/culori/src/cubehelix/definition.js
var definition3 = {
  mode: "cubehelix",
  channels: ["h", "s", "l", "alpha"],
  parse: ["--cubehelix"],
  serialize: "--cubehelix",
  ranges: {
    h: [0, 360],
    s: [0, 4.614],
    l: [0, 1]
  },
  fromMode: {
    rgb: convertRgbToCubehelix_default
  },
  toMode: {
    rgb: convertCubehelixToRgb_default
  },
  interpolate: {
    h: {
      use: interpolatorLinear,
      fixup: fixupHueShorter
    },
    s: interpolatorLinear,
    l: interpolatorLinear,
    alpha: {
      use: interpolatorLinear,
      fixup: fixupAlpha
    }
  },
  difference: {
    h: differenceHueSaturation
  },
  average: {
    h: averageAngle
  }
};
var definition_default3 = definition3;

// node_modules/culori/src/lch/convertLabToLch.js
var convertLabToLch = ({ l, a, b, alpha }, mode = "lch") => {
  if (a === void 0) a = 0;
  if (b === void 0) b = 0;
  let c2 = Math.sqrt(a * a + b * b);
  let res = { mode, l, c: c2 };
  if (c2) res.h = normalizeHue_default(Math.atan2(b, a) * 180 / Math.PI);
  if (alpha !== void 0) res.alpha = alpha;
  return res;
};
var convertLabToLch_default = convertLabToLch;

// node_modules/culori/src/lch/convertLchToLab.js
var convertLchToLab = ({ l, c: c2, h, alpha }, mode = "lab") => {
  if (h === void 0) h = 0;
  let res = {
    mode,
    l,
    a: c2 ? c2 * Math.cos(h / 180 * Math.PI) : 0,
    b: c2 ? c2 * Math.sin(h / 180 * Math.PI) : 0
  };
  if (alpha !== void 0) res.alpha = alpha;
  return res;
};
var convertLchToLab_default = convertLchToLab;

// node_modules/culori/src/xyz65/constants.js
var k = Math.pow(29, 3) / Math.pow(3, 3);
var e = Math.pow(6, 3) / Math.pow(29, 3);

// node_modules/culori/src/constants.js
var D50 = {
  X: 0.3457 / 0.3585,
  Y: 1,
  Z: (1 - 0.3457 - 0.3585) / 0.3585
};
var D65 = {
  X: 0.3127 / 0.329,
  Y: 1,
  Z: (1 - 0.3127 - 0.329) / 0.329
};
var k2 = Math.pow(29, 3) / Math.pow(3, 3);
var e2 = Math.pow(6, 3) / Math.pow(29, 3);

// node_modules/culori/src/lab65/convertLab65ToXyz65.js
var fn3 = (v) => Math.pow(v, 3) > e ? Math.pow(v, 3) : (116 * v - 16) / k;
var convertLab65ToXyz65 = ({ l, a, b, alpha }) => {
  if (l === void 0) l = 0;
  if (a === void 0) a = 0;
  if (b === void 0) b = 0;
  let fy = (l + 16) / 116;
  let fx = a / 500 + fy;
  let fz = fy - b / 200;
  let res = {
    mode: "xyz65",
    x: fn3(fx) * D65.X,
    y: fn3(fy) * D65.Y,
    z: fn3(fz) * D65.Z
  };
  if (alpha !== void 0) {
    res.alpha = alpha;
  }
  return res;
};
var convertLab65ToXyz65_default = convertLab65ToXyz65;

// node_modules/culori/src/lab65/convertLab65ToRgb.js
var convertLab65ToRgb = (lab2) => convertXyz65ToRgb_default(convertLab65ToXyz65_default(lab2));
var convertLab65ToRgb_default = convertLab65ToRgb;

// node_modules/culori/src/lab65/convertXyz65ToLab65.js
var f = (value) => value > e ? Math.cbrt(value) : (k * value + 16) / 116;
var convertXyz65ToLab65 = ({ x, y, z, alpha }) => {
  if (x === void 0) x = 0;
  if (y === void 0) y = 0;
  if (z === void 0) z = 0;
  let f0 = f(x / D65.X);
  let f1 = f(y / D65.Y);
  let f22 = f(z / D65.Z);
  let res = {
    mode: "lab65",
    l: 116 * f1 - 16,
    a: 500 * (f0 - f1),
    b: 200 * (f1 - f22)
  };
  if (alpha !== void 0) {
    res.alpha = alpha;
  }
  return res;
};
var convertXyz65ToLab65_default = convertXyz65ToLab65;

// node_modules/culori/src/lab65/convertRgbToLab65.js
var convertRgbToLab65 = (rgb3) => {
  let res = convertXyz65ToLab65_default(convertRgbToXyz65_default(rgb3));
  if (rgb3.r === rgb3.b && rgb3.b === rgb3.g) {
    res.a = res.b = 0;
  }
  return res;
};
var convertRgbToLab65_default = convertRgbToLab65;

// node_modules/culori/src/dlch/constants.js
var kE = 1;
var kCH = 1;
var \u03B8 = 26 / 180 * Math.PI;
var cos\u03B8 = Math.cos(\u03B8);
var sin\u03B8 = Math.sin(\u03B8);
var factor = 100 / Math.log(139 / 100);

// node_modules/culori/src/dlch/convertDlchToLab65.js
var convertDlchToLab65 = ({ l, c: c2, h, alpha }) => {
  if (l === void 0) l = 0;
  if (c2 === void 0) c2 = 0;
  if (h === void 0) h = 0;
  let res = {
    mode: "lab65",
    l: (Math.exp(l * kE / factor) - 1) / 39e-4
  };
  let G = (Math.exp(0.0435 * c2 * kCH * kE) - 1) / 0.075;
  let e4 = G * Math.cos(h / 180 * Math.PI - \u03B8);
  let f3 = G * Math.sin(h / 180 * Math.PI - \u03B8);
  res.a = e4 * cos\u03B8 - f3 / 0.83 * sin\u03B8;
  res.b = e4 * sin\u03B8 + f3 / 0.83 * cos\u03B8;
  if (alpha !== void 0) res.alpha = alpha;
  return res;
};
var convertDlchToLab65_default = convertDlchToLab65;

// node_modules/culori/src/dlch/convertLab65ToDlch.js
var convertLab65ToDlch = ({ l, a, b, alpha }) => {
  if (l === void 0) l = 0;
  if (a === void 0) a = 0;
  if (b === void 0) b = 0;
  let e4 = a * cos\u03B8 + b * sin\u03B8;
  let f3 = 0.83 * (b * cos\u03B8 - a * sin\u03B8);
  let G = Math.sqrt(e4 * e4 + f3 * f3);
  let res = {
    mode: "dlch",
    l: factor / kE * Math.log(1 + 39e-4 * l),
    c: Math.log(1 + 0.075 * G) / (0.0435 * kCH * kE)
  };
  if (res.c) {
    res.h = normalizeHue_default((Math.atan2(f3, e4) + \u03B8) / Math.PI * 180);
  }
  if (alpha !== void 0) res.alpha = alpha;
  return res;
};
var convertLab65ToDlch_default = convertLab65ToDlch;

// node_modules/culori/src/dlab/definition.js
var convertDlabToLab65 = (c2) => convertDlchToLab65_default(convertLabToLch_default(c2, "dlch"));
var convertLab65ToDlab = (c2) => convertLchToLab_default(convertLab65ToDlch_default(c2), "dlab");
var definition4 = {
  mode: "dlab",
  parse: ["--din99o-lab"],
  serialize: "--din99o-lab",
  toMode: {
    lab65: convertDlabToLab65,
    rgb: (c2) => convertLab65ToRgb_default(convertDlabToLab65(c2))
  },
  fromMode: {
    lab65: convertLab65ToDlab,
    rgb: (c2) => convertLab65ToDlab(convertRgbToLab65_default(c2))
  },
  channels: ["l", "a", "b", "alpha"],
  ranges: {
    l: [0, 100],
    a: [-40.09, 45.501],
    b: [-40.469, 44.344]
  },
  interpolate: {
    l: interpolatorLinear,
    a: interpolatorLinear,
    b: interpolatorLinear,
    alpha: {
      use: interpolatorLinear,
      fixup: fixupAlpha
    }
  }
};
var definition_default4 = definition4;

// node_modules/culori/src/dlch/definition.js
var definition5 = {
  mode: "dlch",
  parse: ["--din99o-lch"],
  serialize: "--din99o-lch",
  toMode: {
    lab65: convertDlchToLab65_default,
    dlab: (c2) => convertLchToLab_default(c2, "dlab"),
    rgb: (c2) => convertLab65ToRgb_default(convertDlchToLab65_default(c2))
  },
  fromMode: {
    lab65: convertLab65ToDlch_default,
    dlab: (c2) => convertLabToLch_default(c2, "dlch"),
    rgb: (c2) => convertLab65ToDlch_default(convertRgbToLab65_default(c2))
  },
  channels: ["l", "c", "h", "alpha"],
  ranges: {
    l: [0, 100],
    c: [0, 51.484],
    h: [0, 360]
  },
  interpolate: {
    l: interpolatorLinear,
    c: interpolatorLinear,
    h: {
      use: interpolatorLinear,
      fixup: fixupHueShorter
    },
    alpha: {
      use: interpolatorLinear,
      fixup: fixupAlpha
    }
  },
  difference: {
    h: differenceHueChroma
  },
  average: {
    h: averageAngle
  }
};
var definition_default5 = definition5;

// node_modules/culori/src/hsi/convertHsiToRgb.js
function convertHsiToRgb({ h, s, i, alpha }) {
  h = normalizeHue_default(h !== void 0 ? h : 0);
  if (s === void 0) s = 0;
  if (i === void 0) i = 0;
  let f3 = Math.abs(h / 60 % 2 - 1);
  let res;
  switch (Math.floor(h / 60)) {
    case 0:
      res = {
        r: i * (1 + s * (3 / (2 - f3) - 1)),
        g: i * (1 + s * (3 * (1 - f3) / (2 - f3) - 1)),
        b: i * (1 - s)
      };
      break;
    case 1:
      res = {
        r: i * (1 + s * (3 * (1 - f3) / (2 - f3) - 1)),
        g: i * (1 + s * (3 / (2 - f3) - 1)),
        b: i * (1 - s)
      };
      break;
    case 2:
      res = {
        r: i * (1 - s),
        g: i * (1 + s * (3 / (2 - f3) - 1)),
        b: i * (1 + s * (3 * (1 - f3) / (2 - f3) - 1))
      };
      break;
    case 3:
      res = {
        r: i * (1 - s),
        g: i * (1 + s * (3 * (1 - f3) / (2 - f3) - 1)),
        b: i * (1 + s * (3 / (2 - f3) - 1))
      };
      break;
    case 4:
      res = {
        r: i * (1 + s * (3 * (1 - f3) / (2 - f3) - 1)),
        g: i * (1 - s),
        b: i * (1 + s * (3 / (2 - f3) - 1))
      };
      break;
    case 5:
      res = {
        r: i * (1 + s * (3 / (2 - f3) - 1)),
        g: i * (1 - s),
        b: i * (1 + s * (3 * (1 - f3) / (2 - f3) - 1))
      };
      break;
    default:
      res = { r: i * (1 - s), g: i * (1 - s), b: i * (1 - s) };
  }
  res.mode = "rgb";
  if (alpha !== void 0) res.alpha = alpha;
  return res;
}

// node_modules/culori/src/hsi/convertRgbToHsi.js
function convertRgbToHsi({ r: r2, g, b, alpha }) {
  if (r2 === void 0) r2 = 0;
  if (g === void 0) g = 0;
  if (b === void 0) b = 0;
  let M3 = Math.max(r2, g, b), m = Math.min(r2, g, b);
  let res = {
    mode: "hsi",
    s: r2 + g + b === 0 ? 0 : 1 - 3 * m / (r2 + g + b),
    i: (r2 + g + b) / 3
  };
  if (M3 - m !== 0)
    res.h = (M3 === r2 ? (g - b) / (M3 - m) + (g < b) * 6 : M3 === g ? (b - r2) / (M3 - m) + 2 : (r2 - g) / (M3 - m) + 4) * 60;
  if (alpha !== void 0) res.alpha = alpha;
  return res;
}

// node_modules/culori/src/hsi/definition.js
var definition6 = {
  mode: "hsi",
  toMode: {
    rgb: convertHsiToRgb
  },
  parse: ["--hsi"],
  serialize: "--hsi",
  fromMode: {
    rgb: convertRgbToHsi
  },
  channels: ["h", "s", "i", "alpha"],
  ranges: {
    h: [0, 360]
  },
  gamut: "rgb",
  interpolate: {
    h: { use: interpolatorLinear, fixup: fixupHueShorter },
    s: interpolatorLinear,
    i: interpolatorLinear,
    alpha: { use: interpolatorLinear, fixup: fixupAlpha }
  },
  difference: {
    h: differenceHueSaturation
  },
  average: {
    h: averageAngle
  }
};
var definition_default6 = definition6;

// node_modules/culori/src/hsl/convertHslToRgb.js
function convertHslToRgb({ h, s, l, alpha }) {
  h = normalizeHue_default(h !== void 0 ? h : 0);
  if (s === void 0) s = 0;
  if (l === void 0) l = 0;
  let m1 = l + s * (l < 0.5 ? l : 1 - l);
  let m2 = m1 - (m1 - l) * 2 * Math.abs(h / 60 % 2 - 1);
  let res;
  switch (Math.floor(h / 60)) {
    case 0:
      res = { r: m1, g: m2, b: 2 * l - m1 };
      break;
    case 1:
      res = { r: m2, g: m1, b: 2 * l - m1 };
      break;
    case 2:
      res = { r: 2 * l - m1, g: m1, b: m2 };
      break;
    case 3:
      res = { r: 2 * l - m1, g: m2, b: m1 };
      break;
    case 4:
      res = { r: m2, g: 2 * l - m1, b: m1 };
      break;
    case 5:
      res = { r: m1, g: 2 * l - m1, b: m2 };
      break;
    default:
      res = { r: 2 * l - m1, g: 2 * l - m1, b: 2 * l - m1 };
  }
  res.mode = "rgb";
  if (alpha !== void 0) res.alpha = alpha;
  return res;
}

// node_modules/culori/src/hsl/convertRgbToHsl.js
function convertRgbToHsl({ r: r2, g, b, alpha }) {
  if (r2 === void 0) r2 = 0;
  if (g === void 0) g = 0;
  if (b === void 0) b = 0;
  let M3 = Math.max(r2, g, b), m = Math.min(r2, g, b);
  let res = {
    mode: "hsl",
    s: M3 === m ? 0 : (M3 - m) / (1 - Math.abs(M3 + m - 1)),
    l: 0.5 * (M3 + m)
  };
  if (M3 - m !== 0)
    res.h = (M3 === r2 ? (g - b) / (M3 - m) + (g < b) * 6 : M3 === g ? (b - r2) / (M3 - m) + 2 : (r2 - g) / (M3 - m) + 4) * 60;
  if (alpha !== void 0) res.alpha = alpha;
  return res;
}

// node_modules/culori/src/util/hue.js
var hueToDeg = (val, unit) => {
  switch (unit) {
    case "deg":
      return +val;
    case "rad":
      return val / Math.PI * 180;
    case "grad":
      return val / 10 * 9;
    case "turn":
      return val * 360;
  }
};
var hue_default = hueToDeg;

// node_modules/culori/src/hsl/parseHslLegacy.js
var hsl_old = new RegExp(
  `^hsla?\\(\\s*${hue}${c}${per}${c}${per}\\s*(?:,\\s*${num_per}\\s*)?\\)$`
);
var parseHslLegacy = (color) => {
  let match = color.match(hsl_old);
  if (!match) return;
  let res = { mode: "hsl" };
  if (match[3] !== void 0) {
    res.h = +match[3];
  } else if (match[1] !== void 0 && match[2] !== void 0) {
    res.h = hue_default(match[1], match[2]);
  }
  if (match[4] !== void 0) {
    res.s = Math.min(Math.max(0, match[4] / 100), 1);
  }
  if (match[5] !== void 0) {
    res.l = Math.min(Math.max(0, match[5] / 100), 1);
  }
  if (match[6] !== void 0) {
    res.alpha = Math.max(0, Math.min(1, match[6] / 100));
  } else if (match[7] !== void 0) {
    res.alpha = Math.max(0, Math.min(1, +match[7]));
  }
  return res;
};
var parseHslLegacy_default = parseHslLegacy;

// node_modules/culori/src/hsl/parseHsl.js
function parseHsl(color, parsed) {
  if (!parsed || parsed[0] !== "hsl" && parsed[0] !== "hsla") {
    return void 0;
  }
  const res = { mode: "hsl" };
  const [, h, s, l, alpha] = parsed;
  if (h.type !== Tok.None) {
    if (h.type === Tok.Percentage) {
      return void 0;
    }
    res.h = h.value;
  }
  if (s.type !== Tok.None) {
    if (s.type === Tok.Hue) {
      return void 0;
    }
    res.s = s.value / 100;
  }
  if (l.type !== Tok.None) {
    if (l.type === Tok.Hue) {
      return void 0;
    }
    res.l = l.value / 100;
  }
  if (alpha.type !== Tok.None) {
    res.alpha = Math.min(
      1,
      Math.max(
        0,
        alpha.type === Tok.Number ? alpha.value : alpha.value / 100
      )
    );
  }
  return res;
}
var parseHsl_default = parseHsl;

// node_modules/culori/src/hsl/definition.js
var definition7 = {
  mode: "hsl",
  toMode: {
    rgb: convertHslToRgb
  },
  fromMode: {
    rgb: convertRgbToHsl
  },
  channels: ["h", "s", "l", "alpha"],
  ranges: {
    h: [0, 360]
  },
  gamut: "rgb",
  parse: [parseHsl_default, parseHslLegacy_default],
  serialize: (c2) => `hsl(${c2.h !== void 0 ? c2.h : "none"} ${c2.s !== void 0 ? c2.s * 100 + "%" : "none"} ${c2.l !== void 0 ? c2.l * 100 + "%" : "none"}${c2.alpha < 1 ? ` / ${c2.alpha}` : ""})`,
  interpolate: {
    h: { use: interpolatorLinear, fixup: fixupHueShorter },
    s: interpolatorLinear,
    l: interpolatorLinear,
    alpha: { use: interpolatorLinear, fixup: fixupAlpha }
  },
  difference: {
    h: differenceHueSaturation
  },
  average: {
    h: averageAngle
  }
};
var definition_default7 = definition7;

// node_modules/culori/src/hsv/convertHsvToRgb.js
function convertHsvToRgb({ h, s, v, alpha }) {
  h = normalizeHue_default(h !== void 0 ? h : 0);
  if (s === void 0) s = 0;
  if (v === void 0) v = 0;
  let f3 = Math.abs(h / 60 % 2 - 1);
  let res;
  switch (Math.floor(h / 60)) {
    case 0:
      res = { r: v, g: v * (1 - s * f3), b: v * (1 - s) };
      break;
    case 1:
      res = { r: v * (1 - s * f3), g: v, b: v * (1 - s) };
      break;
    case 2:
      res = { r: v * (1 - s), g: v, b: v * (1 - s * f3) };
      break;
    case 3:
      res = { r: v * (1 - s), g: v * (1 - s * f3), b: v };
      break;
    case 4:
      res = { r: v * (1 - s * f3), g: v * (1 - s), b: v };
      break;
    case 5:
      res = { r: v, g: v * (1 - s), b: v * (1 - s * f3) };
      break;
    default:
      res = { r: v * (1 - s), g: v * (1 - s), b: v * (1 - s) };
  }
  res.mode = "rgb";
  if (alpha !== void 0) res.alpha = alpha;
  return res;
}

// node_modules/culori/src/hsv/convertRgbToHsv.js
function convertRgbToHsv({ r: r2, g, b, alpha }) {
  if (r2 === void 0) r2 = 0;
  if (g === void 0) g = 0;
  if (b === void 0) b = 0;
  let M3 = Math.max(r2, g, b), m = Math.min(r2, g, b);
  let res = {
    mode: "hsv",
    s: M3 === 0 ? 0 : 1 - m / M3,
    v: M3
  };
  if (M3 - m !== 0)
    res.h = (M3 === r2 ? (g - b) / (M3 - m) + (g < b) * 6 : M3 === g ? (b - r2) / (M3 - m) + 2 : (r2 - g) / (M3 - m) + 4) * 60;
  if (alpha !== void 0) res.alpha = alpha;
  return res;
}

// node_modules/culori/src/hsv/definition.js
var definition8 = {
  mode: "hsv",
  toMode: {
    rgb: convertHsvToRgb
  },
  parse: ["--hsv"],
  serialize: "--hsv",
  fromMode: {
    rgb: convertRgbToHsv
  },
  channels: ["h", "s", "v", "alpha"],
  ranges: {
    h: [0, 360]
  },
  gamut: "rgb",
  interpolate: {
    h: { use: interpolatorLinear, fixup: fixupHueShorter },
    s: interpolatorLinear,
    v: interpolatorLinear,
    alpha: { use: interpolatorLinear, fixup: fixupAlpha }
  },
  difference: {
    h: differenceHueSaturation
  },
  average: {
    h: averageAngle
  }
};
var definition_default8 = definition8;

// node_modules/culori/src/hwb/convertHwbToRgb.js
function convertHwbToRgb({ h, w, b, alpha }) {
  if (w === void 0) w = 0;
  if (b === void 0) b = 0;
  if (w + b > 1) {
    let s = w + b;
    w /= s;
    b /= s;
  }
  return convertHsvToRgb({
    h,
    s: b === 1 ? 1 : 1 - w / (1 - b),
    v: 1 - b,
    alpha
  });
}

// node_modules/culori/src/hwb/convertRgbToHwb.js
function convertRgbToHwb(rgba) {
  let hsv2 = convertRgbToHsv(rgba);
  if (hsv2 === void 0) return void 0;
  let s = hsv2.s !== void 0 ? hsv2.s : 0;
  let v = hsv2.v !== void 0 ? hsv2.v : 0;
  let res = {
    mode: "hwb",
    w: (1 - s) * v,
    b: 1 - v
  };
  if (hsv2.h !== void 0) res.h = hsv2.h;
  if (hsv2.alpha !== void 0) res.alpha = hsv2.alpha;
  return res;
}

// node_modules/culori/src/hwb/parseHwb.js
function ParseHwb(color, parsed) {
  if (!parsed || parsed[0] !== "hwb") {
    return void 0;
  }
  const res = { mode: "hwb" };
  const [, h, w, b, alpha] = parsed;
  if (h.type !== Tok.None) {
    if (h.type === Tok.Percentage) {
      return void 0;
    }
    res.h = h.value;
  }
  if (w.type !== Tok.None) {
    if (w.type === Tok.Hue) {
      return void 0;
    }
    res.w = w.value / 100;
  }
  if (b.type !== Tok.None) {
    if (b.type === Tok.Hue) {
      return void 0;
    }
    res.b = b.value / 100;
  }
  if (alpha.type !== Tok.None) {
    res.alpha = Math.min(
      1,
      Math.max(
        0,
        alpha.type === Tok.Number ? alpha.value : alpha.value / 100
      )
    );
  }
  return res;
}
var parseHwb_default = ParseHwb;

// node_modules/culori/src/hwb/definition.js
var definition9 = {
  mode: "hwb",
  toMode: {
    rgb: convertHwbToRgb
  },
  fromMode: {
    rgb: convertRgbToHwb
  },
  channels: ["h", "w", "b", "alpha"],
  ranges: {
    h: [0, 360]
  },
  gamut: "rgb",
  parse: [parseHwb_default],
  serialize: (c2) => `hwb(${c2.h !== void 0 ? c2.h : "none"} ${c2.w !== void 0 ? c2.w * 100 + "%" : "none"} ${c2.b !== void 0 ? c2.b * 100 + "%" : "none"}${c2.alpha < 1 ? ` / ${c2.alpha}` : ""})`,
  interpolate: {
    h: { use: interpolatorLinear, fixup: fixupHueShorter },
    w: interpolatorLinear,
    b: interpolatorLinear,
    alpha: { use: interpolatorLinear, fixup: fixupAlpha }
  },
  difference: {
    h: differenceHueNaive
  },
  average: {
    h: averageAngle
  }
};
var definition_default9 = definition9;

// node_modules/culori/src/hdr/constants.js
var YW = 203;

// node_modules/culori/src/hdr/transfer.js
var M1 = 0.1593017578125;
var M2 = 78.84375;
var C1 = 0.8359375;
var C2 = 18.8515625;
var C3 = 18.6875;
function transferPqDecode(v) {
  if (v < 0) return 0;
  const c2 = Math.pow(v, 1 / M2);
  return 1e4 * Math.pow(Math.max(0, c2 - C1) / (C2 - C3 * c2), 1 / M1);
}
function transferPqEncode(v) {
  if (v < 0) return 0;
  const c2 = Math.pow(v / 1e4, M1);
  return Math.pow((C1 + C2 * c2) / (1 + C3 * c2), M2);
}

// node_modules/culori/src/itp/convertItpToXyz65.js
var toRel = (c2) => Math.max(c2 / YW, 0);
var convertItpToXyz65 = ({ i, t, p: p4, alpha }) => {
  if (i === void 0) i = 0;
  if (t === void 0) t = 0;
  if (p4 === void 0) p4 = 0;
  const l = transferPqDecode(
    i + 0.008609037037932761 * t + 0.11102962500302593 * p4
  );
  const m = transferPqDecode(
    i - 0.00860903703793275 * t - 0.11102962500302599 * p4
  );
  const s = transferPqDecode(
    i + 0.5600313357106791 * t - 0.32062717498731885 * p4
  );
  const res = {
    mode: "xyz65",
    x: toRel(
      2.070152218389422 * l - 1.3263473389671556 * m + 0.2066510476294051 * s
    ),
    y: toRel(
      0.3647385209748074 * l + 0.680566024947227 * m - 0.0453045459220346 * s
    ),
    z: toRel(
      -0.049747207535812 * l - 0.0492609666966138 * m + 1.1880659249923042 * s
    )
  };
  if (alpha !== void 0) {
    res.alpha = alpha;
  }
  return res;
};
var convertItpToXyz65_default = convertItpToXyz65;

// node_modules/culori/src/itp/convertXyz65ToItp.js
var toAbs = (c2 = 0) => Math.max(c2 * YW, 0);
var convertXyz65ToItp = ({ x, y, z, alpha }) => {
  const absX = toAbs(x);
  const absY = toAbs(y);
  const absZ = toAbs(z);
  const l = transferPqEncode(
    0.3592832590121217 * absX + 0.6976051147779502 * absY - 0.0358915932320289 * absZ
  );
  const m = transferPqEncode(
    -0.1920808463704995 * absX + 1.1004767970374323 * absY + 0.0753748658519118 * absZ
  );
  const s = transferPqEncode(
    0.0070797844607477 * absX + 0.0748396662186366 * absY + 0.8433265453898765 * absZ
  );
  const i = 0.5 * l + 0.5 * m;
  const t = 1.61376953125 * l - 3.323486328125 * m + 1.709716796875 * s;
  const p4 = 4.378173828125 * l - 4.24560546875 * m - 0.132568359375 * s;
  const res = { mode: "itp", i, t, p: p4 };
  if (alpha !== void 0) {
    res.alpha = alpha;
  }
  return res;
};
var convertXyz65ToItp_default = convertXyz65ToItp;

// node_modules/culori/src/itp/definition.js
var definition10 = {
  mode: "itp",
  channels: ["i", "t", "p", "alpha"],
  parse: ["--ictcp"],
  serialize: "--ictcp",
  toMode: {
    xyz65: convertItpToXyz65_default,
    rgb: (color) => convertXyz65ToRgb_default(convertItpToXyz65_default(color))
  },
  fromMode: {
    xyz65: convertXyz65ToItp_default,
    rgb: (color) => convertXyz65ToItp_default(convertRgbToXyz65_default(color))
  },
  ranges: {
    i: [0, 0.581],
    t: [-0.369, 0.272],
    p: [-0.164, 0.331]
  },
  interpolate: {
    i: interpolatorLinear,
    t: interpolatorLinear,
    p: interpolatorLinear,
    alpha: { use: interpolatorLinear, fixup: fixupAlpha }
  }
};
var definition_default10 = definition10;

// node_modules/culori/src/jab/convertXyz65ToJab.js
var p = 134.03437499999998;
var d0 = 16295499532821565e-27;
var jabPqEncode = (v) => {
  if (v < 0) return 0;
  let vn3 = Math.pow(v / 1e4, M1);
  return Math.pow((C1 + C2 * vn3) / (1 + C3 * vn3), p);
};
var abs = (v = 0) => Math.max(v * 203, 0);
var convertXyz65ToJab = ({ x, y, z, alpha }) => {
  x = abs(x);
  y = abs(y);
  z = abs(z);
  let xp = 1.15 * x - 0.15 * z;
  let yp = 0.66 * y + 0.34 * x;
  let l = jabPqEncode(0.41478972 * xp + 0.579999 * yp + 0.014648 * z);
  let m = jabPqEncode(-0.20151 * xp + 1.120649 * yp + 0.0531008 * z);
  let s = jabPqEncode(-0.0166008 * xp + 0.2648 * yp + 0.6684799 * z);
  let i = (l + m) / 2;
  let res = {
    mode: "jab",
    j: 0.44 * i / (1 - 0.56 * i) - d0,
    a: 3.524 * l - 4.066708 * m + 0.542708 * s,
    b: 0.199076 * l + 1.096799 * m - 1.295875 * s
  };
  if (alpha !== void 0) {
    res.alpha = alpha;
  }
  return res;
};
var convertXyz65ToJab_default = convertXyz65ToJab;

// node_modules/culori/src/jab/convertJabToXyz65.js
var p2 = 134.03437499999998;
var d02 = 16295499532821565e-27;
var jabPqDecode = (v) => {
  if (v < 0) return 0;
  let vp = Math.pow(v, 1 / p2);
  return 1e4 * Math.pow((C1 - vp) / (C3 * vp - C2), 1 / M1);
};
var rel = (v) => v / 203;
var convertJabToXyz65 = ({ j, a, b, alpha }) => {
  if (j === void 0) j = 0;
  if (a === void 0) a = 0;
  if (b === void 0) b = 0;
  let i = (j + d02) / (0.44 + 0.56 * (j + d02));
  let l = jabPqDecode(i + 0.13860504 * a + 0.058047316 * b);
  let m = jabPqDecode(i - 0.13860504 * a - 0.058047316 * b);
  let s = jabPqDecode(i - 0.096019242 * a - 0.8118919 * b);
  let res = {
    mode: "xyz65",
    x: rel(
      1.661373024652174 * l - 0.914523081304348 * m + 0.23136208173913045 * s
    ),
    y: rel(
      -0.3250758611844533 * l + 1.571847026732543 * m - 0.21825383453227928 * s
    ),
    z: rel(-0.090982811 * l - 0.31272829 * m + 1.5227666 * s)
  };
  if (alpha !== void 0) {
    res.alpha = alpha;
  }
  return res;
};
var convertJabToXyz65_default = convertJabToXyz65;

// node_modules/culori/src/jab/convertRgbToJab.js
var convertRgbToJab = (rgb3) => {
  let res = convertXyz65ToJab_default(convertRgbToXyz65_default(rgb3));
  if (rgb3.r === rgb3.b && rgb3.b === rgb3.g) {
    res.a = res.b = 0;
  }
  return res;
};
var convertRgbToJab_default = convertRgbToJab;

// node_modules/culori/src/jab/convertJabToRgb.js
var convertJabToRgb = (color) => convertXyz65ToRgb_default(convertJabToXyz65_default(color));
var convertJabToRgb_default = convertJabToRgb;

// node_modules/culori/src/jab/definition.js
var definition11 = {
  mode: "jab",
  channels: ["j", "a", "b", "alpha"],
  parse: ["--jzazbz"],
  serialize: "--jzazbz",
  fromMode: {
    rgb: convertRgbToJab_default,
    xyz65: convertXyz65ToJab_default
  },
  toMode: {
    rgb: convertJabToRgb_default,
    xyz65: convertJabToXyz65_default
  },
  ranges: {
    j: [0, 0.222],
    a: [-0.109, 0.129],
    b: [-0.185, 0.134]
  },
  interpolate: {
    j: interpolatorLinear,
    a: interpolatorLinear,
    b: interpolatorLinear,
    alpha: { use: interpolatorLinear, fixup: fixupAlpha }
  }
};
var definition_default11 = definition11;

// node_modules/culori/src/jch/convertJabToJch.js
var convertJabToJch = ({ j, a, b, alpha }) => {
  if (a === void 0) a = 0;
  if (b === void 0) b = 0;
  let c2 = Math.sqrt(a * a + b * b);
  let res = {
    mode: "jch",
    j,
    c: c2
  };
  if (c2) {
    res.h = normalizeHue_default(Math.atan2(b, a) * 180 / Math.PI);
  }
  if (alpha !== void 0) {
    res.alpha = alpha;
  }
  return res;
};
var convertJabToJch_default = convertJabToJch;

// node_modules/culori/src/jch/convertJchToJab.js
var convertJchToJab = ({ j, c: c2, h, alpha }) => {
  if (h === void 0) h = 0;
  let res = {
    mode: "jab",
    j,
    a: c2 ? c2 * Math.cos(h / 180 * Math.PI) : 0,
    b: c2 ? c2 * Math.sin(h / 180 * Math.PI) : 0
  };
  if (alpha !== void 0) res.alpha = alpha;
  return res;
};
var convertJchToJab_default = convertJchToJab;

// node_modules/culori/src/jch/definition.js
var definition12 = {
  mode: "jch",
  parse: ["--jzczhz"],
  serialize: "--jzczhz",
  toMode: {
    jab: convertJchToJab_default,
    rgb: (c2) => convertJabToRgb_default(convertJchToJab_default(c2))
  },
  fromMode: {
    rgb: (c2) => convertJabToJch_default(convertRgbToJab_default(c2)),
    jab: convertJabToJch_default
  },
  channels: ["j", "c", "h", "alpha"],
  ranges: {
    j: [0, 0.221],
    c: [0, 0.19],
    h: [0, 360]
  },
  interpolate: {
    h: { use: interpolatorLinear, fixup: fixupHueShorter },
    c: interpolatorLinear,
    j: interpolatorLinear,
    alpha: { use: interpolatorLinear, fixup: fixupAlpha }
  },
  difference: {
    h: differenceHueChroma
  },
  average: {
    h: averageAngle
  }
};
var definition_default12 = definition12;

// node_modules/culori/src/xyz50/constants.js
var k3 = Math.pow(29, 3) / Math.pow(3, 3);
var e3 = Math.pow(6, 3) / Math.pow(29, 3);

// node_modules/culori/src/lab/convertLabToXyz50.js
var fn4 = (v) => Math.pow(v, 3) > e3 ? Math.pow(v, 3) : (116 * v - 16) / k3;
var convertLabToXyz50 = ({ l, a, b, alpha }) => {
  if (l === void 0) l = 0;
  if (a === void 0) a = 0;
  if (b === void 0) b = 0;
  let fy = (l + 16) / 116;
  let fx = a / 500 + fy;
  let fz = fy - b / 200;
  let res = {
    mode: "xyz50",
    x: fn4(fx) * D50.X,
    y: fn4(fy) * D50.Y,
    z: fn4(fz) * D50.Z
  };
  if (alpha !== void 0) {
    res.alpha = alpha;
  }
  return res;
};
var convertLabToXyz50_default = convertLabToXyz50;

// node_modules/culori/src/xyz50/convertXyz50ToRgb.js
var convertXyz50ToRgb = ({ x, y, z, alpha }) => {
  if (x === void 0) x = 0;
  if (y === void 0) y = 0;
  if (z === void 0) z = 0;
  let res = convertLrgbToRgb_default({
    r: x * 3.1341359569958707 - y * 1.6173863321612538 - 0.4906619460083532 * z,
    g: x * -0.978795502912089 + y * 1.916254567259524 + 0.03344273116131949 * z,
    b: x * 0.07195537988411677 - y * 0.2289768264158322 + 1.405386058324125 * z
  });
  if (alpha !== void 0) {
    res.alpha = alpha;
  }
  return res;
};
var convertXyz50ToRgb_default = convertXyz50ToRgb;

// node_modules/culori/src/lab/convertLabToRgb.js
var convertLabToRgb = (lab2) => convertXyz50ToRgb_default(convertLabToXyz50_default(lab2));
var convertLabToRgb_default = convertLabToRgb;

// node_modules/culori/src/xyz50/convertRgbToXyz50.js
var convertRgbToXyz50 = (rgb3) => {
  let { r: r2, g, b, alpha } = convertRgbToLrgb_default(rgb3);
  let res = {
    mode: "xyz50",
    x: 0.436065742824811 * r2 + 0.3851514688337912 * g + 0.14307845442264197 * b,
    y: 0.22249319175623702 * r2 + 0.7168870538238823 * g + 0.06061979053616537 * b,
    z: 0.013923904500943465 * r2 + 0.09708128566574634 * g + 0.7140993584005155 * b
  };
  if (alpha !== void 0) {
    res.alpha = alpha;
  }
  return res;
};
var convertRgbToXyz50_default = convertRgbToXyz50;

// node_modules/culori/src/lab/convertXyz50ToLab.js
var f2 = (value) => value > e3 ? Math.cbrt(value) : (k3 * value + 16) / 116;
var convertXyz50ToLab = ({ x, y, z, alpha }) => {
  if (x === void 0) x = 0;
  if (y === void 0) y = 0;
  if (z === void 0) z = 0;
  let f0 = f2(x / D50.X);
  let f1 = f2(y / D50.Y);
  let f22 = f2(z / D50.Z);
  let res = {
    mode: "lab",
    l: 116 * f1 - 16,
    a: 500 * (f0 - f1),
    b: 200 * (f1 - f22)
  };
  if (alpha !== void 0) {
    res.alpha = alpha;
  }
  return res;
};
var convertXyz50ToLab_default = convertXyz50ToLab;

// node_modules/culori/src/lab/convertRgbToLab.js
var convertRgbToLab = (rgb3) => {
  let res = convertXyz50ToLab_default(convertRgbToXyz50_default(rgb3));
  if (rgb3.r === rgb3.b && rgb3.b === rgb3.g) {
    res.a = res.b = 0;
  }
  return res;
};
var convertRgbToLab_default = convertRgbToLab;

// node_modules/culori/src/lab/parseLab.js
function parseLab(color, parsed) {
  if (!parsed || parsed[0] !== "lab") {
    return void 0;
  }
  const res = { mode: "lab" };
  const [, l, a, b, alpha] = parsed;
  if (l.type === Tok.Hue || a.type === Tok.Hue || b.type === Tok.Hue) {
    return void 0;
  }
  if (l.type !== Tok.None) {
    res.l = Math.min(Math.max(0, l.value), 100);
  }
  if (a.type !== Tok.None) {
    res.a = a.type === Tok.Number ? a.value : a.value * 125 / 100;
  }
  if (b.type !== Tok.None) {
    res.b = b.type === Tok.Number ? b.value : b.value * 125 / 100;
  }
  if (alpha.type !== Tok.None) {
    res.alpha = Math.min(
      1,
      Math.max(
        0,
        alpha.type === Tok.Number ? alpha.value : alpha.value / 100
      )
    );
  }
  return res;
}
var parseLab_default = parseLab;

// node_modules/culori/src/lab/definition.js
var definition13 = {
  mode: "lab",
  toMode: {
    xyz50: convertLabToXyz50_default,
    rgb: convertLabToRgb_default
  },
  fromMode: {
    xyz50: convertXyz50ToLab_default,
    rgb: convertRgbToLab_default
  },
  channels: ["l", "a", "b", "alpha"],
  ranges: {
    l: [0, 100],
    a: [-125, 125],
    b: [-125, 125]
  },
  parse: [parseLab_default],
  serialize: (c2) => `lab(${c2.l !== void 0 ? c2.l : "none"} ${c2.a !== void 0 ? c2.a : "none"} ${c2.b !== void 0 ? c2.b : "none"}${c2.alpha < 1 ? ` / ${c2.alpha}` : ""})`,
  interpolate: {
    l: interpolatorLinear,
    a: interpolatorLinear,
    b: interpolatorLinear,
    alpha: { use: interpolatorLinear, fixup: fixupAlpha }
  }
};
var definition_default13 = definition13;

// node_modules/culori/src/lab65/definition.js
var definition14 = {
  ...definition_default13,
  mode: "lab65",
  parse: ["--lab-d65"],
  serialize: "--lab-d65",
  toMode: {
    xyz65: convertLab65ToXyz65_default,
    rgb: convertLab65ToRgb_default
  },
  fromMode: {
    xyz65: convertXyz65ToLab65_default,
    rgb: convertRgbToLab65_default
  },
  ranges: {
    l: [0, 100],
    a: [-125, 125],
    b: [-125, 125]
  }
};
var definition_default14 = definition14;

// node_modules/culori/src/lch/parseLch.js
function parseLch(color, parsed) {
  if (!parsed || parsed[0] !== "lch") {
    return void 0;
  }
  const res = { mode: "lch" };
  const [, l, c2, h, alpha] = parsed;
  if (l.type !== Tok.None) {
    if (l.type === Tok.Hue) {
      return void 0;
    }
    res.l = Math.min(Math.max(0, l.value), 100);
  }
  if (c2.type !== Tok.None) {
    res.c = Math.max(
      0,
      c2.type === Tok.Number ? c2.value : c2.value * 150 / 100
    );
  }
  if (h.type !== Tok.None) {
    if (h.type === Tok.Percentage) {
      return void 0;
    }
    res.h = h.value;
  }
  if (alpha.type !== Tok.None) {
    res.alpha = Math.min(
      1,
      Math.max(
        0,
        alpha.type === Tok.Number ? alpha.value : alpha.value / 100
      )
    );
  }
  return res;
}
var parseLch_default = parseLch;

// node_modules/culori/src/lch/definition.js
var definition15 = {
  mode: "lch",
  toMode: {
    lab: convertLchToLab_default,
    rgb: (c2) => convertLabToRgb_default(convertLchToLab_default(c2))
  },
  fromMode: {
    rgb: (c2) => convertLabToLch_default(convertRgbToLab_default(c2)),
    lab: convertLabToLch_default
  },
  channels: ["l", "c", "h", "alpha"],
  ranges: {
    l: [0, 100],
    c: [0, 150],
    h: [0, 360]
  },
  parse: [parseLch_default],
  serialize: (c2) => `lch(${c2.l !== void 0 ? c2.l : "none"} ${c2.c !== void 0 ? c2.c : "none"} ${c2.h !== void 0 ? c2.h : "none"}${c2.alpha < 1 ? ` / ${c2.alpha}` : ""})`,
  interpolate: {
    h: { use: interpolatorLinear, fixup: fixupHueShorter },
    c: interpolatorLinear,
    l: interpolatorLinear,
    alpha: { use: interpolatorLinear, fixup: fixupAlpha }
  },
  difference: {
    h: differenceHueChroma
  },
  average: {
    h: averageAngle
  }
};
var definition_default15 = definition15;

// node_modules/culori/src/lch65/definition.js
var definition16 = {
  ...definition_default15,
  mode: "lch65",
  parse: ["--lch-d65"],
  serialize: "--lch-d65",
  toMode: {
    lab65: (c2) => convertLchToLab_default(c2, "lab65"),
    rgb: (c2) => convertLab65ToRgb_default(convertLchToLab_default(c2, "lab65"))
  },
  fromMode: {
    rgb: (c2) => convertLabToLch_default(convertRgbToLab65_default(c2), "lch65"),
    lab65: (c2) => convertLabToLch_default(c2, "lch65")
  },
  ranges: {
    l: [0, 100],
    c: [0, 150],
    h: [0, 360]
  }
};
var definition_default16 = definition16;

// node_modules/culori/src/lchuv/convertLuvToLchuv.js
var convertLuvToLchuv = ({ l, u, v, alpha }) => {
  if (u === void 0) u = 0;
  if (v === void 0) v = 0;
  let c2 = Math.sqrt(u * u + v * v);
  let res = {
    mode: "lchuv",
    l,
    c: c2
  };
  if (c2) {
    res.h = normalizeHue_default(Math.atan2(v, u) * 180 / Math.PI);
  }
  if (alpha !== void 0) {
    res.alpha = alpha;
  }
  return res;
};
var convertLuvToLchuv_default = convertLuvToLchuv;

// node_modules/culori/src/lchuv/convertLchuvToLuv.js
var convertLchuvToLuv = ({ l, c: c2, h, alpha }) => {
  if (h === void 0) h = 0;
  let res = {
    mode: "luv",
    l,
    u: c2 ? c2 * Math.cos(h / 180 * Math.PI) : 0,
    v: c2 ? c2 * Math.sin(h / 180 * Math.PI) : 0
  };
  if (alpha !== void 0) {
    res.alpha = alpha;
  }
  return res;
};
var convertLchuvToLuv_default = convertLchuvToLuv;

// node_modules/culori/src/luv/convertXyz50ToLuv.js
var u_fn = (x, y, z) => 4 * x / (x + 15 * y + 3 * z);
var v_fn = (x, y, z) => 9 * y / (x + 15 * y + 3 * z);
var un = u_fn(D50.X, D50.Y, D50.Z);
var vn = v_fn(D50.X, D50.Y, D50.Z);
var l_fn = (value) => value <= e3 ? k3 * value : 116 * Math.cbrt(value) - 16;
var convertXyz50ToLuv = ({ x, y, z, alpha }) => {
  if (x === void 0) x = 0;
  if (y === void 0) y = 0;
  if (z === void 0) z = 0;
  let l = l_fn(y / D50.Y);
  let u = u_fn(x, y, z);
  let v = v_fn(x, y, z);
  if (!isFinite(u) || !isFinite(v)) {
    l = u = v = 0;
  } else {
    u = 13 * l * (u - un);
    v = 13 * l * (v - vn);
  }
  let res = {
    mode: "luv",
    l,
    u,
    v
  };
  if (alpha !== void 0) {
    res.alpha = alpha;
  }
  return res;
};
var convertXyz50ToLuv_default = convertXyz50ToLuv;

// node_modules/culori/src/luv/convertLuvToXyz50.js
var u_fn2 = (x, y, z) => 4 * x / (x + 15 * y + 3 * z);
var v_fn2 = (x, y, z) => 9 * y / (x + 15 * y + 3 * z);
var un2 = u_fn2(D50.X, D50.Y, D50.Z);
var vn2 = v_fn2(D50.X, D50.Y, D50.Z);
var convertLuvToXyz50 = ({ l, u, v, alpha }) => {
  if (l === void 0) l = 0;
  if (l === 0) {
    return { mode: "xyz50", x: 0, y: 0, z: 0 };
  }
  if (u === void 0) u = 0;
  if (v === void 0) v = 0;
  let up = u / (13 * l) + un2;
  let vp = v / (13 * l) + vn2;
  let y = D50.Y * (l <= 8 ? l / k3 : Math.pow((l + 16) / 116, 3));
  let x = y * (9 * up) / (4 * vp);
  let z = y * (12 - 3 * up - 20 * vp) / (4 * vp);
  let res = { mode: "xyz50", x, y, z };
  if (alpha !== void 0) {
    res.alpha = alpha;
  }
  return res;
};
var convertLuvToXyz50_default = convertLuvToXyz50;

// node_modules/culori/src/lchuv/definition.js
var convertRgbToLchuv = (rgb3) => convertLuvToLchuv_default(convertXyz50ToLuv_default(convertRgbToXyz50_default(rgb3)));
var convertLchuvToRgb = (lchuv2) => convertXyz50ToRgb_default(convertLuvToXyz50_default(convertLchuvToLuv_default(lchuv2)));
var definition17 = {
  mode: "lchuv",
  toMode: {
    luv: convertLchuvToLuv_default,
    rgb: convertLchuvToRgb
  },
  fromMode: {
    rgb: convertRgbToLchuv,
    luv: convertLuvToLchuv_default
  },
  channels: ["l", "c", "h", "alpha"],
  parse: ["--lchuv"],
  serialize: "--lchuv",
  ranges: {
    l: [0, 100],
    c: [0, 176.956],
    h: [0, 360]
  },
  interpolate: {
    h: { use: interpolatorLinear, fixup: fixupHueShorter },
    c: interpolatorLinear,
    l: interpolatorLinear,
    alpha: { use: interpolatorLinear, fixup: fixupAlpha }
  },
  difference: {
    h: differenceHueChroma
  },
  average: {
    h: averageAngle
  }
};
var definition_default17 = definition17;

// node_modules/culori/src/lrgb/definition.js
var definition18 = {
  ...definition_default,
  mode: "lrgb",
  toMode: {
    rgb: convertLrgbToRgb_default
  },
  fromMode: {
    rgb: convertRgbToLrgb_default
  },
  parse: ["srgb-linear"],
  serialize: "srgb-linear"
};
var definition_default18 = definition18;

// node_modules/culori/src/luv/definition.js
var definition19 = {
  mode: "luv",
  toMode: {
    xyz50: convertLuvToXyz50_default,
    rgb: (luv2) => convertXyz50ToRgb_default(convertLuvToXyz50_default(luv2))
  },
  fromMode: {
    xyz50: convertXyz50ToLuv_default,
    rgb: (rgb3) => convertXyz50ToLuv_default(convertRgbToXyz50_default(rgb3))
  },
  channels: ["l", "u", "v", "alpha"],
  parse: ["--luv"],
  serialize: "--luv",
  ranges: {
    l: [0, 100],
    u: [-84.936, 175.042],
    v: [-125.882, 87.243]
  },
  interpolate: {
    l: interpolatorLinear,
    u: interpolatorLinear,
    v: interpolatorLinear,
    alpha: { use: interpolatorLinear, fixup: fixupAlpha }
  }
};
var definition_default19 = definition19;

// node_modules/culori/src/oklab/convertLrgbToOklab.js
var convertLrgbToOklab = ({ r: r2, g, b, alpha }) => {
  if (r2 === void 0) r2 = 0;
  if (g === void 0) g = 0;
  if (b === void 0) b = 0;
  let L = Math.cbrt(
    0.412221469470763 * r2 + 0.5363325372617348 * g + 0.0514459932675022 * b
  );
  let M3 = Math.cbrt(
    0.2119034958178252 * r2 + 0.6806995506452344 * g + 0.1073969535369406 * b
  );
  let S = Math.cbrt(
    0.0883024591900564 * r2 + 0.2817188391361215 * g + 0.6299787016738222 * b
  );
  let res = {
    mode: "oklab",
    l: 0.210454268309314 * L + 0.7936177747023054 * M3 - 0.0040720430116193 * S,
    a: 1.9779985324311684 * L - 2.42859224204858 * M3 + 0.450593709617411 * S,
    b: 0.0259040424655478 * L + 0.7827717124575296 * M3 - 0.8086757549230774 * S
  };
  if (alpha !== void 0) {
    res.alpha = alpha;
  }
  return res;
};
var convertLrgbToOklab_default = convertLrgbToOklab;

// node_modules/culori/src/oklab/convertRgbToOklab.js
var convertRgbToOklab = (rgb3) => {
  let res = convertLrgbToOklab_default(convertRgbToLrgb_default(rgb3));
  if (rgb3.r === rgb3.b && rgb3.b === rgb3.g) {
    res.a = res.b = 0;
  }
  return res;
};
var convertRgbToOklab_default = convertRgbToOklab;

// node_modules/culori/src/oklab/convertOklabToLrgb.js
var convertOklabToLrgb = ({ l, a, b, alpha }) => {
  if (l === void 0) l = 0;
  if (a === void 0) a = 0;
  if (b === void 0) b = 0;
  let L = Math.pow(l + 0.3963377773761749 * a + 0.2158037573099136 * b, 3);
  let M3 = Math.pow(l - 0.1055613458156586 * a - 0.0638541728258133 * b, 3);
  let S = Math.pow(l - 0.0894841775298119 * a - 1.2914855480194092 * b, 3);
  let res = {
    mode: "lrgb",
    r: 4.076741636075957 * L - 3.3077115392580616 * M3 + 0.2309699031821044 * S,
    g: -1.2684379732850317 * L + 2.6097573492876887 * M3 - 0.3413193760026573 * S,
    b: -0.0041960761386756 * L - 0.7034186179359362 * M3 + 1.7076146940746117 * S
  };
  if (alpha !== void 0) {
    res.alpha = alpha;
  }
  return res;
};
var convertOklabToLrgb_default = convertOklabToLrgb;

// node_modules/culori/src/oklab/convertOklabToRgb.js
var convertOklabToRgb = (c2) => convertLrgbToRgb_default(convertOklabToLrgb_default(c2));
var convertOklabToRgb_default = convertOklabToRgb;

// node_modules/culori/src/okhsl/helpers.js
function toe(x) {
  const k_1 = 0.206;
  const k_2 = 0.03;
  const k_3 = (1 + k_1) / (1 + k_2);
  return 0.5 * (k_3 * x - k_1 + Math.sqrt((k_3 * x - k_1) * (k_3 * x - k_1) + 4 * k_2 * k_3 * x));
}
function toe_inv(x) {
  const k_1 = 0.206;
  const k_2 = 0.03;
  const k_3 = (1 + k_1) / (1 + k_2);
  return (x * x + k_1 * x) / (k_3 * (x + k_2));
}
function compute_max_saturation(a, b) {
  let k0, k1, k22, k32, k4, wl, wm, ws;
  if (-1.88170328 * a - 0.80936493 * b > 1) {
    k0 = 1.19086277;
    k1 = 1.76576728;
    k22 = 0.59662641;
    k32 = 0.75515197;
    k4 = 0.56771245;
    wl = 4.0767416621;
    wm = -3.3077115913;
    ws = 0.2309699292;
  } else if (1.81444104 * a - 1.19445276 * b > 1) {
    k0 = 0.73956515;
    k1 = -0.45954404;
    k22 = 0.08285427;
    k32 = 0.1254107;
    k4 = 0.14503204;
    wl = -1.2684380046;
    wm = 2.6097574011;
    ws = -0.3413193965;
  } else {
    k0 = 1.35733652;
    k1 = -915799e-8;
    k22 = -1.1513021;
    k32 = -0.50559606;
    k4 = 692167e-8;
    wl = -0.0041960863;
    wm = -0.7034186147;
    ws = 1.707614701;
  }
  let S = k0 + k1 * a + k22 * b + k32 * a * a + k4 * a * b;
  let k_l = 0.3963377774 * a + 0.2158037573 * b;
  let k_m = -0.1055613458 * a - 0.0638541728 * b;
  let k_s = -0.0894841775 * a - 1.291485548 * b;
  {
    let l_ = 1 + S * k_l;
    let m_ = 1 + S * k_m;
    let s_ = 1 + S * k_s;
    let l = l_ * l_ * l_;
    let m = m_ * m_ * m_;
    let s = s_ * s_ * s_;
    let l_dS = 3 * k_l * l_ * l_;
    let m_dS = 3 * k_m * m_ * m_;
    let s_dS = 3 * k_s * s_ * s_;
    let l_dS2 = 6 * k_l * k_l * l_;
    let m_dS2 = 6 * k_m * k_m * m_;
    let s_dS2 = 6 * k_s * k_s * s_;
    let f3 = wl * l + wm * m + ws * s;
    let f1 = wl * l_dS + wm * m_dS + ws * s_dS;
    let f22 = wl * l_dS2 + wm * m_dS2 + ws * s_dS2;
    S = S - f3 * f1 / (f1 * f1 - 0.5 * f3 * f22);
  }
  return S;
}
function find_cusp(a, b) {
  let S_cusp = compute_max_saturation(a, b);
  let rgb3 = convertOklabToLrgb_default({ l: 1, a: S_cusp * a, b: S_cusp * b });
  let L_cusp = Math.cbrt(1 / Math.max(rgb3.r, rgb3.g, rgb3.b));
  let C_cusp = L_cusp * S_cusp;
  return [L_cusp, C_cusp];
}
function find_gamut_intersection(a, b, L1, C12, L0, cusp = null) {
  if (!cusp) {
    cusp = find_cusp(a, b);
  }
  let t;
  if ((L1 - L0) * cusp[1] - (cusp[0] - L0) * C12 <= 0) {
    t = cusp[1] * L0 / (C12 * cusp[0] + cusp[1] * (L0 - L1));
  } else {
    t = cusp[1] * (L0 - 1) / (C12 * (cusp[0] - 1) + cusp[1] * (L0 - L1));
    {
      let dL = L1 - L0;
      let dC = C12;
      let k_l = 0.3963377774 * a + 0.2158037573 * b;
      let k_m = -0.1055613458 * a - 0.0638541728 * b;
      let k_s = -0.0894841775 * a - 1.291485548 * b;
      let l_dt = dL + dC * k_l;
      let m_dt = dL + dC * k_m;
      let s_dt = dL + dC * k_s;
      {
        let L = L0 * (1 - t) + t * L1;
        let C = t * C12;
        let l_ = L + C * k_l;
        let m_ = L + C * k_m;
        let s_ = L + C * k_s;
        let l = l_ * l_ * l_;
        let m = m_ * m_ * m_;
        let s = s_ * s_ * s_;
        let ldt = 3 * l_dt * l_ * l_;
        let mdt = 3 * m_dt * m_ * m_;
        let sdt = 3 * s_dt * s_ * s_;
        let ldt2 = 6 * l_dt * l_dt * l_;
        let mdt2 = 6 * m_dt * m_dt * m_;
        let sdt2 = 6 * s_dt * s_dt * s_;
        let r2 = 4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s - 1;
        let r1 = 4.0767416621 * ldt - 3.3077115913 * mdt + 0.2309699292 * sdt;
        let r22 = 4.0767416621 * ldt2 - 3.3077115913 * mdt2 + 0.2309699292 * sdt2;
        let u_r = r1 / (r1 * r1 - 0.5 * r2 * r22);
        let t_r = -r2 * u_r;
        let g = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s - 1;
        let g1 = -1.2684380046 * ldt + 2.6097574011 * mdt - 0.3413193965 * sdt;
        let g2 = -1.2684380046 * ldt2 + 2.6097574011 * mdt2 - 0.3413193965 * sdt2;
        let u_g = g1 / (g1 * g1 - 0.5 * g * g2);
        let t_g = -g * u_g;
        let b2 = -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s - 1;
        let b1 = -0.0041960863 * ldt - 0.7034186147 * mdt + 1.707614701 * sdt;
        let b22 = -0.0041960863 * ldt2 - 0.7034186147 * mdt2 + 1.707614701 * sdt2;
        let u_b = b1 / (b1 * b1 - 0.5 * b2 * b22);
        let t_b = -b2 * u_b;
        t_r = u_r >= 0 ? t_r : 1e6;
        t_g = u_g >= 0 ? t_g : 1e6;
        t_b = u_b >= 0 ? t_b : 1e6;
        t += Math.min(t_r, Math.min(t_g, t_b));
      }
    }
  }
  return t;
}
function get_ST_max(a_, b_, cusp = null) {
  if (!cusp) {
    cusp = find_cusp(a_, b_);
  }
  let L = cusp[0];
  let C = cusp[1];
  return [C / L, C / (1 - L)];
}
function get_Cs(L, a_, b_) {
  let cusp = find_cusp(a_, b_);
  let C_max = find_gamut_intersection(a_, b_, L, 1, L, cusp);
  let ST_max = get_ST_max(a_, b_, cusp);
  let S_mid = 0.11516993 + 1 / (7.4477897 + 4.1590124 * b_ + a_ * (-2.19557347 + 1.75198401 * b_ + a_ * (-2.13704948 - 10.02301043 * b_ + a_ * (-4.24894561 + 5.38770819 * b_ + 4.69891013 * a_))));
  let T_mid = 0.11239642 + 1 / (1.6132032 - 0.68124379 * b_ + a_ * (0.40370612 + 0.90148123 * b_ + a_ * (-0.27087943 + 0.6122399 * b_ + a_ * (299215e-8 - 0.45399568 * b_ - 0.14661872 * a_))));
  let k4 = C_max / Math.min(L * ST_max[0], (1 - L) * ST_max[1]);
  let C_a = L * S_mid;
  let C_b = (1 - L) * T_mid;
  let C_mid = 0.9 * k4 * Math.sqrt(
    Math.sqrt(
      1 / (1 / (C_a * C_a * C_a * C_a) + 1 / (C_b * C_b * C_b * C_b))
    )
  );
  C_a = L * 0.4;
  C_b = (1 - L) * 0.8;
  let C_0 = Math.sqrt(1 / (1 / (C_a * C_a) + 1 / (C_b * C_b)));
  return [C_0, C_mid, C_max];
}

// node_modules/culori/src/okhsl/convertOklabToOkhsl.js
function convertOklabToOkhsl(lab2) {
  const l = lab2.l !== void 0 ? lab2.l : 0;
  const a = lab2.a !== void 0 ? lab2.a : 0;
  const b = lab2.b !== void 0 ? lab2.b : 0;
  const ret = { mode: "okhsl", l: toe(l) };
  if (lab2.alpha !== void 0) {
    ret.alpha = lab2.alpha;
  }
  let c2 = Math.sqrt(a * a + b * b);
  if (!c2) {
    ret.s = 0;
    return ret;
  }
  let [C_0, C_mid, C_max] = get_Cs(l, a / c2, b / c2);
  let s;
  if (c2 < C_mid) {
    let k_0 = 0;
    let k_1 = 0.8 * C_0;
    let k_2 = 1 - k_1 / C_mid;
    let t = (c2 - k_0) / (k_1 + k_2 * (c2 - k_0));
    s = t * 0.8;
  } else {
    let k_0 = C_mid;
    let k_1 = 0.2 * C_mid * C_mid * 1.25 * 1.25 / C_0;
    let k_2 = 1 - k_1 / (C_max - C_mid);
    let t = (c2 - k_0) / (k_1 + k_2 * (c2 - k_0));
    s = 0.8 + 0.2 * t;
  }
  if (s) {
    ret.s = s;
    ret.h = normalizeHue_default(Math.atan2(b, a) * 180 / Math.PI);
  }
  return ret;
}

// node_modules/culori/src/okhsl/convertOkhslToOklab.js
function convertOkhslToOklab(hsl3) {
  let h = hsl3.h !== void 0 ? hsl3.h : 0;
  let s = hsl3.s !== void 0 ? hsl3.s : 0;
  let l = hsl3.l !== void 0 ? hsl3.l : 0;
  const ret = { mode: "oklab", l: toe_inv(l) };
  if (hsl3.alpha !== void 0) {
    ret.alpha = hsl3.alpha;
  }
  if (!s || l === 1) {
    ret.a = ret.b = 0;
    return ret;
  }
  let a_ = Math.cos(h / 180 * Math.PI);
  let b_ = Math.sin(h / 180 * Math.PI);
  let [C_0, C_mid, C_max] = get_Cs(ret.l, a_, b_);
  let t, k_0, k_1, k_2;
  if (s < 0.8) {
    t = 1.25 * s;
    k_0 = 0;
    k_1 = 0.8 * C_0;
    k_2 = 1 - k_1 / C_mid;
  } else {
    t = 5 * (s - 0.8);
    k_0 = C_mid;
    k_1 = 0.2 * C_mid * C_mid * 1.25 * 1.25 / C_0;
    k_2 = 1 - k_1 / (C_max - C_mid);
  }
  let C = k_0 + t * k_1 / (1 - k_2 * t);
  ret.a = C * a_;
  ret.b = C * b_;
  return ret;
}

// node_modules/culori/src/okhsl/modeOkhsl.js
var modeOkhsl = {
  ...definition_default7,
  mode: "okhsl",
  channels: ["h", "s", "l", "alpha"],
  parse: ["--okhsl"],
  serialize: "--okhsl",
  fromMode: {
    oklab: convertOklabToOkhsl,
    rgb: (c2) => convertOklabToOkhsl(convertRgbToOklab_default(c2))
  },
  toMode: {
    oklab: convertOkhslToOklab,
    rgb: (c2) => convertOklabToRgb_default(convertOkhslToOklab(c2))
  }
};
var modeOkhsl_default = modeOkhsl;

// node_modules/culori/src/okhsv/convertOklabToOkhsv.js
function convertOklabToOkhsv(lab2) {
  let l = lab2.l !== void 0 ? lab2.l : 0;
  let a = lab2.a !== void 0 ? lab2.a : 0;
  let b = lab2.b !== void 0 ? lab2.b : 0;
  let c2 = Math.sqrt(a * a + b * b);
  let a_ = c2 ? a / c2 : 1;
  let b_ = c2 ? b / c2 : 1;
  let [S_max, T] = get_ST_max(a_, b_);
  let S_0 = 0.5;
  let k4 = 1 - S_0 / S_max;
  let t = T / (c2 + l * T);
  let L_v = t * l;
  let C_v = t * c2;
  let L_vt = toe_inv(L_v);
  let C_vt = C_v * L_vt / L_v;
  let rgb_scale = convertOklabToLrgb_default({ l: L_vt, a: a_ * C_vt, b: b_ * C_vt });
  let scale_L = Math.cbrt(
    1 / Math.max(rgb_scale.r, rgb_scale.g, rgb_scale.b, 0)
  );
  l = l / scale_L;
  c2 = c2 / scale_L * toe(l) / l;
  l = toe(l);
  const ret = {
    mode: "okhsv",
    s: c2 ? (S_0 + T) * C_v / (T * S_0 + T * k4 * C_v) : 0,
    v: l ? l / L_v : 0
  };
  if (ret.s) {
    ret.h = normalizeHue_default(Math.atan2(b, a) * 180 / Math.PI);
  }
  if (lab2.alpha !== void 0) {
    ret.alpha = lab2.alpha;
  }
  return ret;
}

// node_modules/culori/src/okhsv/convertOkhsvToOklab.js
function convertOkhsvToOklab(hsv2) {
  const ret = { mode: "oklab" };
  if (hsv2.alpha !== void 0) {
    ret.alpha = hsv2.alpha;
  }
  const h = hsv2.h !== void 0 ? hsv2.h : 0;
  const s = hsv2.s !== void 0 ? hsv2.s : 0;
  const v = hsv2.v !== void 0 ? hsv2.v : 0;
  const a_ = Math.cos(h / 180 * Math.PI);
  const b_ = Math.sin(h / 180 * Math.PI);
  const [S_max, T] = get_ST_max(a_, b_);
  const S_0 = 0.5;
  const k4 = 1 - S_0 / S_max;
  const L_v = 1 - s * S_0 / (S_0 + T - T * k4 * s);
  const C_v = s * T * S_0 / (S_0 + T - T * k4 * s);
  const L_vt = toe_inv(L_v);
  const C_vt = C_v * L_vt / L_v;
  const rgb_scale = convertOklabToLrgb_default({
    l: L_vt,
    a: a_ * C_vt,
    b: b_ * C_vt
  });
  const scale_L = Math.cbrt(
    1 / Math.max(rgb_scale.r, rgb_scale.g, rgb_scale.b, 0)
  );
  const L_new = toe_inv(v * L_v);
  const C = C_v * L_new / L_v;
  ret.l = L_new * scale_L;
  ret.a = C * a_ * scale_L;
  ret.b = C * b_ * scale_L;
  return ret;
}

// node_modules/culori/src/okhsv/modeOkhsv.js
var modeOkhsv = {
  ...definition_default8,
  mode: "okhsv",
  channels: ["h", "s", "v", "alpha"],
  parse: ["--okhsv"],
  serialize: "--okhsv",
  fromMode: {
    oklab: convertOklabToOkhsv,
    rgb: (c2) => convertOklabToOkhsv(convertRgbToOklab_default(c2))
  },
  toMode: {
    oklab: convertOkhsvToOklab,
    rgb: (c2) => convertOklabToRgb_default(convertOkhsvToOklab(c2))
  }
};
var modeOkhsv_default = modeOkhsv;

// node_modules/culori/src/oklab/parseOklab.js
function parseOklab(color, parsed) {
  if (!parsed || parsed[0] !== "oklab") {
    return void 0;
  }
  const res = { mode: "oklab" };
  const [, l, a, b, alpha] = parsed;
  if (l.type === Tok.Hue || a.type === Tok.Hue || b.type === Tok.Hue) {
    return void 0;
  }
  if (l.type !== Tok.None) {
    res.l = Math.min(
      Math.max(0, l.type === Tok.Number ? l.value : l.value / 100),
      1
    );
  }
  if (a.type !== Tok.None) {
    res.a = a.type === Tok.Number ? a.value : a.value * 0.4 / 100;
  }
  if (b.type !== Tok.None) {
    res.b = b.type === Tok.Number ? b.value : b.value * 0.4 / 100;
  }
  if (alpha.type !== Tok.None) {
    res.alpha = Math.min(
      1,
      Math.max(
        0,
        alpha.type === Tok.Number ? alpha.value : alpha.value / 100
      )
    );
  }
  return res;
}
var parseOklab_default = parseOklab;

// node_modules/culori/src/oklab/definition.js
var definition20 = {
  ...definition_default13,
  mode: "oklab",
  toMode: {
    lrgb: convertOklabToLrgb_default,
    rgb: convertOklabToRgb_default
  },
  fromMode: {
    lrgb: convertLrgbToOklab_default,
    rgb: convertRgbToOklab_default
  },
  ranges: {
    l: [0, 1],
    a: [-0.4, 0.4],
    b: [-0.4, 0.4]
  },
  parse: [parseOklab_default],
  serialize: (c2) => `oklab(${c2.l !== void 0 ? c2.l : "none"} ${c2.a !== void 0 ? c2.a : "none"} ${c2.b !== void 0 ? c2.b : "none"}${c2.alpha < 1 ? ` / ${c2.alpha}` : ""})`
};
var definition_default20 = definition20;

// node_modules/culori/src/oklch/parseOklch.js
function parseOklch(color, parsed) {
  if (!parsed || parsed[0] !== "oklch") {
    return void 0;
  }
  const res = { mode: "oklch" };
  const [, l, c2, h, alpha] = parsed;
  if (l.type !== Tok.None) {
    if (l.type === Tok.Hue) {
      return void 0;
    }
    res.l = Math.min(
      Math.max(0, l.type === Tok.Number ? l.value : l.value / 100),
      1
    );
  }
  if (c2.type !== Tok.None) {
    res.c = Math.max(
      0,
      c2.type === Tok.Number ? c2.value : c2.value * 0.4 / 100
    );
  }
  if (h.type !== Tok.None) {
    if (h.type === Tok.Percentage) {
      return void 0;
    }
    res.h = h.value;
  }
  if (alpha.type !== Tok.None) {
    res.alpha = Math.min(
      1,
      Math.max(
        0,
        alpha.type === Tok.Number ? alpha.value : alpha.value / 100
      )
    );
  }
  return res;
}
var parseOklch_default = parseOklch;

// node_modules/culori/src/oklch/definition.js
var definition21 = {
  ...definition_default15,
  mode: "oklch",
  toMode: {
    oklab: (c2) => convertLchToLab_default(c2, "oklab"),
    rgb: (c2) => convertOklabToRgb_default(convertLchToLab_default(c2, "oklab"))
  },
  fromMode: {
    rgb: (c2) => convertLabToLch_default(convertRgbToOklab_default(c2), "oklch"),
    oklab: (c2) => convertLabToLch_default(c2, "oklch")
  },
  parse: [parseOklch_default],
  serialize: (c2) => `oklch(${c2.l !== void 0 ? c2.l : "none"} ${c2.c !== void 0 ? c2.c : "none"} ${c2.h !== void 0 ? c2.h : "none"}${c2.alpha < 1 ? ` / ${c2.alpha}` : ""})`,
  ranges: {
    l: [0, 1],
    c: [0, 0.4],
    h: [0, 360]
  }
};
var definition_default21 = definition21;

// node_modules/culori/src/p3/convertP3ToXyz65.js
var convertP3ToXyz65 = (rgb3) => {
  let { r: r2, g, b, alpha } = convertRgbToLrgb_default(rgb3);
  let res = {
    mode: "xyz65",
    x: 0.486570948648216 * r2 + 0.265667693169093 * g + 0.1982172852343625 * b,
    y: 0.2289745640697487 * r2 + 0.6917385218365062 * g + 0.079286914093745 * b,
    z: 0 * r2 + 0.0451133818589026 * g + 1.043944368900976 * b
  };
  if (alpha !== void 0) {
    res.alpha = alpha;
  }
  return res;
};
var convertP3ToXyz65_default = convertP3ToXyz65;

// node_modules/culori/src/p3/convertXyz65ToP3.js
var convertXyz65ToP3 = ({ x, y, z, alpha }) => {
  if (x === void 0) x = 0;
  if (y === void 0) y = 0;
  if (z === void 0) z = 0;
  let res = convertLrgbToRgb_default(
    {
      r: x * 2.4934969119414263 - y * 0.9313836179191242 - 0.402710784450717 * z,
      g: x * -0.8294889695615749 + y * 1.7626640603183465 + 0.0236246858419436 * z,
      b: x * 0.0358458302437845 - y * 0.0761723892680418 + 0.9568845240076871 * z
    },
    "p3"
  );
  if (alpha !== void 0) {
    res.alpha = alpha;
  }
  return res;
};
var convertXyz65ToP3_default = convertXyz65ToP3;

// node_modules/culori/src/p3/definition.js
var definition22 = {
  ...definition_default,
  mode: "p3",
  parse: ["display-p3"],
  serialize: "display-p3",
  fromMode: {
    rgb: (color) => convertXyz65ToP3_default(convertRgbToXyz65_default(color)),
    xyz65: convertXyz65ToP3_default
  },
  toMode: {
    rgb: (color) => convertXyz65ToRgb_default(convertP3ToXyz65_default(color)),
    xyz65: convertP3ToXyz65_default
  }
};
var definition_default22 = definition22;

// node_modules/culori/src/prophoto/convertXyz50ToProphoto.js
var gamma2 = (v) => {
  let abs2 = Math.abs(v);
  if (abs2 >= 1 / 512) {
    return Math.sign(v) * Math.pow(abs2, 1 / 1.8);
  }
  return 16 * v;
};
var convertXyz50ToProphoto = ({ x, y, z, alpha }) => {
  if (x === void 0) x = 0;
  if (y === void 0) y = 0;
  if (z === void 0) z = 0;
  let res = {
    mode: "prophoto",
    r: gamma2(
      x * 1.3457868816471585 - y * 0.2555720873797946 - 0.0511018649755453 * z
    ),
    g: gamma2(
      x * -0.5446307051249019 + y * 1.5082477428451466 + 0.0205274474364214 * z
    ),
    b: gamma2(x * 0 + y * 0 + 1.2119675456389452 * z)
  };
  if (alpha !== void 0) {
    res.alpha = alpha;
  }
  return res;
};
var convertXyz50ToProphoto_default = convertXyz50ToProphoto;

// node_modules/culori/src/prophoto/convertProphotoToXyz50.js
var linearize2 = (v = 0) => {
  let abs2 = Math.abs(v);
  if (abs2 >= 16 / 512) {
    return Math.sign(v) * Math.pow(abs2, 1.8);
  }
  return v / 16;
};
var convertProphotoToXyz50 = (prophoto2) => {
  let r2 = linearize2(prophoto2.r);
  let g = linearize2(prophoto2.g);
  let b = linearize2(prophoto2.b);
  let res = {
    mode: "xyz50",
    x: 0.7977666449006423 * r2 + 0.1351812974005331 * g + 0.0313477341283922 * b,
    y: 0.2880748288194013 * r2 + 0.7118352342418731 * g + 899369387256e-16 * b,
    z: 0 * r2 + 0 * g + 0.8251046025104602 * b
  };
  if (prophoto2.alpha !== void 0) {
    res.alpha = prophoto2.alpha;
  }
  return res;
};
var convertProphotoToXyz50_default = convertProphotoToXyz50;

// node_modules/culori/src/prophoto/definition.js
var definition23 = {
  ...definition_default,
  mode: "prophoto",
  parse: ["prophoto-rgb"],
  serialize: "prophoto-rgb",
  fromMode: {
    xyz50: convertXyz50ToProphoto_default,
    rgb: (color) => convertXyz50ToProphoto_default(convertRgbToXyz50_default(color))
  },
  toMode: {
    xyz50: convertProphotoToXyz50_default,
    rgb: (color) => convertXyz50ToRgb_default(convertProphotoToXyz50_default(color))
  }
};
var definition_default23 = definition23;

// node_modules/culori/src/rec2020/convertXyz65ToRec2020.js
var \u03B1 = 1.09929682680944;
var \u03B2 = 0.018053968510807;
var gamma3 = (v) => {
  const abs2 = Math.abs(v);
  if (abs2 > \u03B2) {
    return (Math.sign(v) || 1) * (\u03B1 * Math.pow(abs2, 0.45) - (\u03B1 - 1));
  }
  return 4.5 * v;
};
var convertXyz65ToRec2020 = ({ x, y, z, alpha }) => {
  if (x === void 0) x = 0;
  if (y === void 0) y = 0;
  if (z === void 0) z = 0;
  let res = {
    mode: "rec2020",
    r: gamma3(
      x * 1.7166511879712683 - y * 0.3556707837763925 - 0.2533662813736599 * z
    ),
    g: gamma3(
      x * -0.6666843518324893 + y * 1.6164812366349395 + 0.0157685458139111 * z
    ),
    b: gamma3(
      x * 0.0176398574453108 - y * 0.0427706132578085 + 0.9421031212354739 * z
    )
  };
  if (alpha !== void 0) {
    res.alpha = alpha;
  }
  return res;
};
var convertXyz65ToRec2020_default = convertXyz65ToRec2020;

// node_modules/culori/src/rec2020/convertRec2020ToXyz65.js
var \u03B12 = 1.09929682680944;
var \u03B22 = 0.018053968510807;
var linearize3 = (v = 0) => {
  let abs2 = Math.abs(v);
  if (abs2 < \u03B22 * 4.5) {
    return v / 4.5;
  }
  return (Math.sign(v) || 1) * Math.pow((abs2 + \u03B12 - 1) / \u03B12, 1 / 0.45);
};
var convertRec2020ToXyz65 = (rec20202) => {
  let r2 = linearize3(rec20202.r);
  let g = linearize3(rec20202.g);
  let b = linearize3(rec20202.b);
  let res = {
    mode: "xyz65",
    x: 0.6369580483012911 * r2 + 0.1446169035862083 * g + 0.1688809751641721 * b,
    y: 0.262700212011267 * r2 + 0.6779980715188708 * g + 0.059301716469862 * b,
    z: 0 * r2 + 0.0280726930490874 * g + 1.0609850577107909 * b
  };
  if (rec20202.alpha !== void 0) {
    res.alpha = rec20202.alpha;
  }
  return res;
};
var convertRec2020ToXyz65_default = convertRec2020ToXyz65;

// node_modules/culori/src/rec2020/definition.js
var definition24 = {
  ...definition_default,
  mode: "rec2020",
  fromMode: {
    xyz65: convertXyz65ToRec2020_default,
    rgb: (color) => convertXyz65ToRec2020_default(convertRgbToXyz65_default(color))
  },
  toMode: {
    xyz65: convertRec2020ToXyz65_default,
    rgb: (color) => convertXyz65ToRgb_default(convertRec2020ToXyz65_default(color))
  },
  parse: ["rec2020"],
  serialize: "rec2020"
};
var definition_default24 = definition24;

// node_modules/culori/src/xyb/constants.js
var bias = 0.0037930732552754493;
var bias_cbrt = Math.cbrt(bias);

// node_modules/culori/src/xyb/convertRgbToXyb.js
var transfer = (v) => Math.cbrt(v) - bias_cbrt;
var convertRgbToXyb = (color) => {
  const { r: r2, g, b, alpha } = convertRgbToLrgb_default(color);
  const l = transfer(0.3 * r2 + 0.622 * g + 0.078 * b + bias);
  const m = transfer(0.23 * r2 + 0.692 * g + 0.078 * b + bias);
  const s = transfer(
    0.2434226892454782 * r2 + 0.2047674442449682 * g + 0.5518098665095535 * b + bias
  );
  const res = {
    mode: "xyb",
    x: (l - m) / 2,
    y: (l + m) / 2,
    /* Apply default chroma from luma (subtract Y from B) */
    b: s - (l + m) / 2
  };
  if (alpha !== void 0) res.alpha = alpha;
  return res;
};
var convertRgbToXyb_default = convertRgbToXyb;

// node_modules/culori/src/xyb/convertXybToRgb.js
var transfer2 = (v) => Math.pow(v + bias_cbrt, 3);
var convertXybToRgb = ({ x, y, b, alpha }) => {
  if (x === void 0) x = 0;
  if (y === void 0) y = 0;
  if (b === void 0) b = 0;
  const l = transfer2(x + y) - bias;
  const m = transfer2(y - x) - bias;
  const s = transfer2(b + y) - bias;
  const res = convertLrgbToRgb_default({
    r: 11.031566904639861 * l - 9.866943908131562 * m - 0.16462299650829934 * s,
    g: -3.2541473810744237 * l + 4.418770377582723 * m - 0.16462299650829934 * s,
    b: -3.6588512867136815 * l + 2.7129230459360922 * m + 1.9459282407775895 * s
  });
  if (alpha !== void 0) res.alpha = alpha;
  return res;
};
var convertXybToRgb_default = convertXybToRgb;

// node_modules/culori/src/xyb/definition.js
var definition25 = {
  mode: "xyb",
  channels: ["x", "y", "b", "alpha"],
  parse: ["--xyb"],
  serialize: "--xyb",
  toMode: {
    rgb: convertXybToRgb_default
  },
  fromMode: {
    rgb: convertRgbToXyb_default
  },
  ranges: {
    x: [-0.0154, 0.0281],
    y: [0, 0.8453],
    b: [-0.2778, 0.388]
  },
  interpolate: {
    x: interpolatorLinear,
    y: interpolatorLinear,
    b: interpolatorLinear,
    alpha: { use: interpolatorLinear, fixup: fixupAlpha }
  }
};
var definition_default25 = definition25;

// node_modules/culori/src/xyz50/definition.js
var definition26 = {
  mode: "xyz50",
  parse: ["xyz-d50"],
  serialize: "xyz-d50",
  toMode: {
    rgb: convertXyz50ToRgb_default,
    lab: convertXyz50ToLab_default
  },
  fromMode: {
    rgb: convertRgbToXyz50_default,
    lab: convertLabToXyz50_default
  },
  channels: ["x", "y", "z", "alpha"],
  ranges: {
    x: [0, 0.964],
    y: [0, 0.999],
    z: [0, 0.825]
  },
  interpolate: {
    x: interpolatorLinear,
    y: interpolatorLinear,
    z: interpolatorLinear,
    alpha: { use: interpolatorLinear, fixup: fixupAlpha }
  }
};
var definition_default26 = definition26;

// node_modules/culori/src/xyz65/convertXyz65ToXyz50.js
var convertXyz65ToXyz50 = (xyz652) => {
  let { x, y, z, alpha } = xyz652;
  if (x === void 0) x = 0;
  if (y === void 0) y = 0;
  if (z === void 0) z = 0;
  let res = {
    mode: "xyz50",
    x: 1.0479298208405488 * x + 0.0229467933410191 * y - 0.0501922295431356 * z,
    y: 0.0296278156881593 * x + 0.990434484573249 * y - 0.0170738250293851 * z,
    z: -0.0092430581525912 * x + 0.0150551448965779 * y + 0.7518742899580008 * z
  };
  if (alpha !== void 0) {
    res.alpha = alpha;
  }
  return res;
};
var convertXyz65ToXyz50_default = convertXyz65ToXyz50;

// node_modules/culori/src/xyz65/convertXyz50ToXyz65.js
var convertXyz50ToXyz65 = (xyz502) => {
  let { x, y, z, alpha } = xyz502;
  if (x === void 0) x = 0;
  if (y === void 0) y = 0;
  if (z === void 0) z = 0;
  let res = {
    mode: "xyz65",
    x: 0.9554734527042182 * x - 0.0230985368742614 * y + 0.0632593086610217 * z,
    y: -0.0283697069632081 * x + 1.0099954580058226 * y + 0.021041398966943 * z,
    z: 0.0123140016883199 * x - 0.0205076964334779 * y + 1.3303659366080753 * z
  };
  if (alpha !== void 0) {
    res.alpha = alpha;
  }
  return res;
};
var convertXyz50ToXyz65_default = convertXyz50ToXyz65;

// node_modules/culori/src/xyz65/definition.js
var definition27 = {
  mode: "xyz65",
  toMode: {
    rgb: convertXyz65ToRgb_default,
    xyz50: convertXyz65ToXyz50_default
  },
  fromMode: {
    rgb: convertRgbToXyz65_default,
    xyz50: convertXyz50ToXyz65_default
  },
  ranges: {
    x: [0, 0.95],
    y: [0, 1],
    z: [0, 1.088]
  },
  channels: ["x", "y", "z", "alpha"],
  parse: ["xyz", "xyz-d65"],
  serialize: "xyz-d65",
  interpolate: {
    x: interpolatorLinear,
    y: interpolatorLinear,
    z: interpolatorLinear,
    alpha: { use: interpolatorLinear, fixup: fixupAlpha }
  }
};
var definition_default27 = definition27;

// node_modules/culori/src/yiq/convertRgbToYiq.js
var convertRgbToYiq = ({ r: r2, g, b, alpha }) => {
  if (r2 === void 0) r2 = 0;
  if (g === void 0) g = 0;
  if (b === void 0) b = 0;
  const res = {
    mode: "yiq",
    y: 0.29889531 * r2 + 0.58662247 * g + 0.11448223 * b,
    i: 0.59597799 * r2 - 0.2741761 * g - 0.32180189 * b,
    q: 0.21147017 * r2 - 0.52261711 * g + 0.31114694 * b
  };
  if (alpha !== void 0) res.alpha = alpha;
  return res;
};
var convertRgbToYiq_default = convertRgbToYiq;

// node_modules/culori/src/yiq/convertYiqToRgb.js
var convertYiqToRgb = ({ y, i, q, alpha }) => {
  if (y === void 0) y = 0;
  if (i === void 0) i = 0;
  if (q === void 0) q = 0;
  const res = {
    mode: "rgb",
    r: y + 0.95608445 * i + 0.6208885 * q,
    g: y - 0.27137664 * i - 0.6486059 * q,
    b: y - 1.10561724 * i + 1.70250126 * q
  };
  if (alpha !== void 0) res.alpha = alpha;
  return res;
};
var convertYiqToRgb_default = convertYiqToRgb;

// node_modules/culori/src/yiq/definition.js
var definition28 = {
  mode: "yiq",
  toMode: {
    rgb: convertYiqToRgb_default
  },
  fromMode: {
    rgb: convertRgbToYiq_default
  },
  channels: ["y", "i", "q", "alpha"],
  parse: ["--yiq"],
  serialize: "--yiq",
  ranges: {
    i: [-0.595, 0.595],
    q: [-0.522, 0.522]
  },
  interpolate: {
    y: interpolatorLinear,
    i: interpolatorLinear,
    q: interpolatorLinear,
    alpha: { use: interpolatorLinear, fixup: fixupAlpha }
  }
};
var definition_default28 = definition28;

// node_modules/culori/src/round.js
var r = (value, precision) => Math.round(value * (precision = Math.pow(10, precision))) / precision;
var round = (precision = 4) => (value) => typeof value === "number" ? r(value, precision) : value;
var round_default = round;

// node_modules/culori/src/formatter.js
var twoDecimals = round_default(2);
var clamp = (value) => Math.max(0, Math.min(1, value || 0));
var fixup = (value) => Math.round(clamp(value) * 255);
var rgb = converter_default("rgb");
var hsl = converter_default("hsl");
var serializeHex = (color) => {
  if (color === void 0) {
    return void 0;
  }
  let r2 = fixup(color.r);
  let g = fixup(color.g);
  let b = fixup(color.b);
  return "#" + (1 << 24 | r2 << 16 | g << 8 | b).toString(16).slice(1);
};
var formatHex = (c2) => serializeHex(rgb(c2));

// node_modules/culori/src/wcag.js
function luminance(color) {
  let c2 = converter_default("lrgb")(color);
  return 0.2126 * c2.r + 0.7152 * c2.g + 0.0722 * c2.b;
}
function contrast(a, b) {
  let L1 = luminance(a);
  let L2 = luminance(b);
  return (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05);
}

// node_modules/culori/src/index.js
var a98 = useMode(definition_default2);
var cubehelix = useMode(definition_default3);
var dlab = useMode(definition_default4);
var dlch = useMode(definition_default5);
var hsi = useMode(definition_default6);
var hsl2 = useMode(definition_default7);
var hsv = useMode(definition_default8);
var hwb = useMode(definition_default9);
var itp = useMode(definition_default10);
var jab = useMode(definition_default11);
var jch = useMode(definition_default12);
var lab = useMode(definition_default13);
var lab65 = useMode(definition_default14);
var lch = useMode(definition_default15);
var lch65 = useMode(definition_default16);
var lchuv = useMode(definition_default17);
var lrgb = useMode(definition_default18);
var luv = useMode(definition_default19);
var okhsl = useMode(modeOkhsl_default);
var okhsv = useMode(modeOkhsv_default);
var oklab = useMode(definition_default20);
var oklch = useMode(definition_default21);
var p3 = useMode(definition_default22);
var prophoto = useMode(definition_default23);
var rec2020 = useMode(definition_default24);
var rgb2 = useMode(definition_default);
var xyb = useMode(definition_default25);
var xyz50 = useMode(definition_default26);
var xyz65 = useMode(definition_default27);
var yiq = useMode(definition_default28);

// src/measure.ts
import sharp2 from "sharp";
var toOklab = converter_default("oklab");
var SIDE = 96;
var SATURATED = 0.12;
var RAW = 0.17;
var LIGHT = 0.58;
var MURK = 0.01;
async function measure(png) {
  const pixels = await labPixels(png, SIDE);
  const background = borderColor(pixels, SIDE);
  const subject = centerOfMass(pixels, SIDE, background);
  const values = valueBands(pixels);
  const field = Object.keys(values).reduce((a, b) => values[b] > values[a] ? b : a);
  const chroma = pixels.map((p4) => Math.hypot(p4.a, p4.b));
  return {
    subject,
    centered: Math.abs(subject.x - 0.5) < 0.06 && Math.abs(subject.y - 0.5) < 0.08,
    values,
    field,
    midShare: values["light grey"] + values["dark grey"],
    murky: murky(pixels.map((p4) => p4.l)),
    clippedShare: pixels.filter((p4) => (p4.l >= 0.995 || p4.l <= 0.01) && distance(p4, background) > 0.05).length / pixels.length,
    palette: kmeans(pixels, 5),
    saturatedShare: chroma.filter((c2) => c2 > SATURATED).length / pixels.length,
    rawPrimaries: rawPrimaries(pixels),
    thumb: await thumbnail(png)
  };
}
async function labPixels(png, side) {
  const { data } = await sharp2(png).flatten({ background: "#ffffff" }).resize(side, side, { fit: "fill" }).raw().toBuffer({ resolveWithObject: true });
  const out = [];
  for (let i = 0; i < data.length; i += 3) {
    const { l, a, b } = toOklab({ mode: "rgb", r: data[i] / 255, g: data[i + 1] / 255, b: data[i + 2] / 255 });
    out.push({ l, a, b });
  }
  return out;
}
function distance(p4, q) {
  return Math.hypot(p4.l - q.l, p4.a - q.a, p4.b - q.b);
}
function borderColor(pixels, side) {
  const edge2 = [];
  for (let i = 0; i < side; i++) {
    edge2.push(pixels[i], pixels[(side - 1) * side + i], pixels[i * side], pixels[i * side + side - 1]);
  }
  const median = (xs) => xs.sort((a, b) => a - b)[xs.length >> 1];
  return { l: median(edge2.map((p4) => p4.l)), a: median(edge2.map((p4) => p4.a)), b: median(edge2.map((p4) => p4.b)) };
}
function centerOfMass(pixels, side, background) {
  let sx = 0, sy = 0, sw = 0;
  pixels.forEach((p4, i) => {
    const w = distance(p4, background) ** 2;
    sx += w * (i % side + 0.5);
    sy += w * (Math.floor(i / side) + 0.5);
    sw += w;
  });
  if (sw === 0) return { x: 0.5, y: 0.5 };
  return { x: sx / sw / side, y: sy / sw / side };
}
function murky(lightness) {
  return lightness.filter((l) => l >= LIGHT).length / lightness.length < MURK;
}
function valueBands(pixels) {
  const bands = { white: 0, "light grey": 0, "dark grey": 0, black: 0 };
  for (const { l } of pixels) {
    bands[l >= 0.82 ? "white" : l >= LIGHT ? "light grey" : l >= 0.34 ? "dark grey" : "black"]++;
  }
  for (const k4 of Object.keys(bands)) bands[k4] /= pixels.length;
  return bands;
}
function rawPrimaries(pixels) {
  const hues = { red: 0, yellow: 0, blue: 0 };
  for (const p4 of pixels) {
    if (Math.hypot(p4.a, p4.b) < RAW) continue;
    const h = (Math.atan2(p4.b, p4.a) * 180 / Math.PI + 360) % 360;
    if (h < 45 || h > 350) hues.red++;
    else if (h >= 85 && h <= 115) hues.yellow++;
    else if (h >= 240 && h <= 285) hues.blue++;
  }
  return Object.entries(hues).filter(([, n]) => n / pixels.length > 0.02).map(([name]) => name);
}
async function thumbnail(png) {
  return (await labPixels(png, 16)).map((p4) => p4.l);
}
function kmeans(pixels, k4) {
  let seed = 42;
  const random = () => (seed = (seed * 1103515245 + 12345) % 2 ** 31) / 2 ** 31;
  const centers = [pixels[Math.floor(random() * pixels.length)]];
  while (centers.length < k4) {
    const d = pixels.map((p4) => Math.min(...centers.map((c2) => distance(p4, c2))) ** 2);
    const total = d.reduce((a, b) => a + b, 0);
    if (total === 0) break;
    let r2 = random() * total, i = 0;
    while ((r2 -= d[i]) > 0) i++;
    centers.push(pixels[i]);
  }
  let assign = new Array(pixels.length).fill(0);
  for (let iter = 0; iter < 12; iter++) {
    assign = pixels.map((p4) => centers.reduce((best, c2, j) => distance(p4, c2) < distance(p4, centers[best]) ? j : best, 0));
    centers.forEach((_, j) => {
      const members = pixels.filter((_2, i) => assign[i] === j);
      if (members.length === 0) return;
      const mean = (f3) => members.reduce((s, p4) => s + f3(p4), 0) / members.length;
      centers[j] = { l: mean((p4) => p4.l), a: mean((p4) => p4.a), b: mean((p4) => p4.b) };
    });
  }
  return centers.map((lab2, j) => ({
    lab: lab2,
    share: assign.filter((a) => a === j).length / pixels.length,
    hex: formatHex({ mode: "oklab", ...lab2 })
  })).filter((s) => s.share >= 5e-3).sort((a, b) => b.share - a.share);
}
function paletteDistance(a, b) {
  const oneWay = (x, y) => x.reduce((s, c2) => s + c2.share * Math.min(...y.map((d) => distance(c2.lab, d.lab))), 0) / x.reduce((s, c2) => s + c2.share, 0);
  return (oneWay(a, b) + oneWay(b, a)) / 2;
}
function layoutDistance(a, b) {
  return a.reduce((s, v, i) => s + Math.abs(v - b[i]), 0) / a.length;
}

// src/lettering.ts
var CONFIDENT = 50;
var MIN_LETTERS = 3;
var starting;
function getWorker() {
  starting ??= createWorker("eng", 1, { langPath: eng.langPath, gzip: true, cachePath: join2(tmpdir2(), "attentry-design-ocr"), logger: () => {
  } }).then(async (w) => (await w.setParameters({ debug_file: "/dev/null" }), w));
  return starting;
}
async function closeOcr() {
  const w = starting;
  starting = void 0;
  await (await w?.catch(() => void 0))?.terminate();
}
async function findLettering(png, known = []) {
  const worker = await getWorker();
  const grey = await sharp3(png).flatten({ background: "#ffffff" }).greyscale().normalise().png().toBuffer();
  const lines = [];
  for (const mode of [PSM.AUTO, PSM.SPARSE_TEXT]) {
    await worker.setParameters({ tessedit_pageseg_mode: mode });
    const { data } = await worker.recognize(grey, {}, { blocks: true });
    for (const b of data.blocks ?? []) for (const p4 of b.paragraphs) lines.push(...p4.lines);
  }
  const found = [];
  for (const l of lines) {
    const text = l.text.trim();
    if (l.confidence < CONFIDENT || (text.match(/[\p{L}\p{N}]/gu) ?? []).length < MIN_LETTERS) continue;
    const box = { x: l.bbox.x0, y: l.bbox.y0, width: l.bbox.x1 - l.bbox.x0, height: l.bbox.y1 - l.bbox.y0 };
    if ([...known, ...found].some((k4) => overlap(k4.box, box) > 0.3)) continue;
    found.push({
      text,
      color: await inkColor(png, box),
      fontFamily: "(in the picture)",
      fontSize: box.height / 0.72,
      size: box.height / 0.72,
      opacity: 1,
      bold: false,
      source: "ocr",
      box
    });
  }
  return found;
}
async function readBack(png, width, height, t) {
  const worker = await getWorker();
  const pad = Math.round(t.box.height * 0.4);
  const left = Math.max(0, Math.floor(t.box.x - pad)), top = Math.max(0, Math.floor(t.box.y - pad));
  const w = Math.min(width - left, Math.ceil(t.box.width + 2 * pad)), h = Math.min(height - top, Math.ceil(t.box.height + 2 * pad));
  if (w < 2 || h < 2) return "";
  const crisp = sharp3(png).flatten({ background: "#ffffff" }).extract({ left, top, width: w, height: h }).resize({ width: w * 2, kernel: "nearest" });
  const soft = crisp.clone().blur(Math.max(0.3, t.box.height / 7 * 2 * 0.3));
  await worker.setParameters({ tessedit_pageseg_mode: PSM.SINGLE_LINE });
  const readings = [];
  for (const img of [crisp, soft]) readings.push((await worker.recognize(await img.greyscale().normalise().png().toBuffer())).data.text.trim());
  return readings.reduce((best, r2) => similarity(t.text, r2) > similarity(t.text, best) ? r2 : best);
}
function similarity(a, b) {
  const norm = (s) => s.toUpperCase().replace(/[^\p{L}\p{N}]/gu, "").replace(/0/g, "O").replace(/1/g, "I");
  const x = norm(a), y = norm(b);
  if (!x.length && !y.length) return 1;
  let prev = Array.from({ length: y.length + 1 }, (_, j) => j);
  for (let i = 1; i <= x.length; i++) {
    const row = [i];
    for (let j = 1; j <= y.length; j++) row[j] = Math.min(prev[j] + 1, row[j - 1] + 1, prev[j - 1] + (x[i - 1] === y[j - 1] ? 0 : 1));
    prev = row;
  }
  return 1 - prev[y.length] / Math.max(x.length, y.length);
}
function overlap(a, b) {
  const w = Math.min(a.x + a.width, b.x + b.width) - Math.max(a.x, b.x);
  const h = Math.min(a.y + a.height, b.y + b.height) - Math.max(a.y, b.y);
  if (w <= 0 || h <= 0) return 0;
  return w * h / Math.min(a.width * a.height, b.width * b.height);
}
async function inkColor(png, box) {
  const region = await sharp3(png).extract({ left: box.x, top: box.y, width: Math.max(1, box.width), height: Math.max(1, box.height) }).png().toBuffer();
  const [a, b] = kmeans(await labPixels(region, 32), 2);
  const ink = b ?? a;
  return formatHex({ mode: "oklab", ...ink.lab });
}

// src/stages.ts
import { mkdir as mkdir2, writeFile as writeFile2 } from "node:fs/promises";
import { dirname as dirname2, isAbsolute, join as join5, relative as relative2, resolve as resolve2 } from "node:path";

// src/options.ts
import sharp4 from "sharp";
import { basename } from "node:path";

// src/limits.ts
var MAX_OPTIONS = 5;
var DARK_MOOD = /\b(dark|night|noir|moody|gloomy|horror|space|shadowy|mysterious)\b/i;
var NO_ASK = /\b(tribute|homage|memorial|thank(s| you)|fan (film|video|art)|music video|story|art piece)\b/i;
var STYLE_3D = /\b(3d|three[- ]d)\b/i;

// src/options.ts
var SAME_LAYOUT = 0.06;
var SAME_PALETTE = 0.06;
async function compareOptions(rendered) {
  if (rendered.length < 2) throw new Error("Give at least 2 options to compare.");
  if (rendered.length > MAX_OPTIONS) throw new Error(`At most ${MAX_OPTIONS} options.`);
  const options = await Promise.all(
    rendered.map(async (r2, i) => ({ number: i + 1, file: r2.file, measures: await measure(r2.png) }))
  );
  const findings = [];
  const n = options.length;
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const a = options[i].measures, b = options[j].measures;
      if (layoutDistance(a.thumb, b.thumb) < SAME_LAYOUT && paletteDistance(a.palette, b.palette) < SAME_PALETTE) {
        findings.push({
          rule: "options-same",
          kind: "error",
          message: `Options ${i + 1} and ${j + 1} are nearly the same picture. Redo one with a different composition or palette.`
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
      source: "Payne, Composition of Outdoor Painting p. 38; Bang, Picture This, principle 5"
    });
  }
  const byField = Map.groupBy(options, (o) => o.measures.field);
  const [field, same] = [...byField].sort((a, b) => b[1].length - a[1].length)[0];
  if (same.length === n) {
    findings.push({
      rule: "options-same-values",
      kind: "error",
      message: `All ${n} options use the same value plan (a ${field} field). Try another: dark figures on light, light on dark, or a mid-grey field.`,
      source: "Loomis, Creative Illustration pp. 88\u201390, the four tonal plans"
    });
  }
  const pairs = [];
  for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) pairs.push(paletteDistance(options[i].measures.palette, options[j].measures.palette));
  if (Math.max(...pairs) < SAME_PALETTE * 1.5) {
    findings.push({
      rule: "options-same-palette",
      kind: "error",
      message: `All ${n} options share nearly one palette. Give at least one a different color scheme.`
    });
  }
  return { options, findings };
}
function list(options) {
  return options.map((o) => o.number).join(", ");
}
async function contactSheet(rendered, options, out) {
  const rows = rendered[0].width / rendered[0].height > 2;
  const W = rows ? 960 : 320, GAP = 24, LABEL = 56;
  const tiles = await Promise.all(rendered.map((r2) => sharp4(r2.png).resize({ width: W }).png().toBuffer({ resolveWithObject: true })));
  const tileH = Math.max(...tiles.map((t) => t.info.height));
  const step = rows ? { x: 0, y: tileH + LABEL + GAP } : { x: W + GAP, y: 0 };
  const width = rows ? GAP + W + GAP : GAP + tiles.length * (W + GAP);
  const height = rows ? GAP + tiles.length * (tileH + LABEL + GAP) : GAP + tileH + LABEL + GAP;
  const parts = [];
  tiles.forEach((t, i) => {
    const x = GAP + i * step.x, y = GAP + i * step.y;
    parts.push({ input: t.data, left: x, top: y });
    const swatches = options[i].measures.palette.map((s, k4) => `<rect x="${28 + k4 * 22}" y="16" width="18" height="18" fill="${s.hex}" stroke="#0002"/>`).join("");
    const label = `<svg width="${W}" height="${LABEL}" xmlns="http://www.w3.org/2000/svg">
      <text x="0" y="30" font-family="Arial, sans-serif" font-size="22" font-weight="700" fill="#111">${i + 1}</text>
      ${swatches}
      <text x="0" y="50" font-family="Arial, sans-serif" font-size="12" fill="#555">${escape(basename(options[i].file))}</text>
    </svg>`;
    parts.push({ input: Buffer.from(label), left: x, top: y + tileH + 4 });
  });
  await sharp4({ create: { width, height, channels: 3, background: "#f4f4f2" } }).composite(parts).png().toFile(out);
  return out;
}
function escape(s) {
  return s.replace(/[&<>"]/g, (c2) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c2]);
}

// src/lock.ts
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join as join3, relative } from "node:path";
var LOCK_DIR = ".attentry-design";
function lockPath(project, name) {
  if (!/^[\w-]+$/.test(name)) throw new Error("A lock name uses letters, digits, - and _ only.");
  return join3(project, LOCK_DIR, `${name}.lock.json`);
}
function toHex(color) {
  const c2 = parse_default(color);
  return c2 ? formatHex(c2) : void 0;
}
async function writeLock(project, name, rendered, m, style, words, about = {}) {
  const lock = {
    name,
    ...style ? { style } : {},
    ...words?.length ? { words } : {},
    ...about.mood ? { mood: about.mood } : {},
    ...about.purpose ? { purpose: about.purpose } : {},
    from: relative(project, rendered.file).replaceAll("\\", "/"),
    size: { width: rendered.width, height: rendered.height },
    colors: [...new Set(rendered.colors.map(toHex).filter((h) => !!h))],
    fonts: rendered.fonts,
    composition: { subject: round2(m.subject), centered: m.centered },
    field: m.field,
    locked: (/* @__PURE__ */ new Date()).toISOString()
  };
  const path = lockPath(project, name);
  await mkdir(join3(project, LOCK_DIR), { recursive: true });
  await writeFile(path, JSON.stringify(lock, null, 2) + "\n");
  return path;
}
async function readLock(project, name) {
  return JSON.parse(await readFile(lockPath(project, name), "utf8"));
}
function round2(p4) {
  return { x: Math.round(p4.x * 100) / 100, y: Math.round(p4.y * 100) / 100 };
}

// src/check.ts
import sharp5 from "sharp";
var SAFE_MARGIN = 0.04;
var HEADLINE_LEAD = 1.5;
var PHONE_WIDTH = 360;
var READABLE = 0.85;
var PIXEL_COLORS = 64;
var OFF_PALETTE = 0.03;
var CLIPPED = 0.03;
var BAND_MIN = 6;
var BAND_STEP = 6;
var BAND_RUN = 4;
var BANDED = 0.15;
var oklab2 = differenceEuclidean("oklab");
var toRgb = converter_default("rgb");
async function check(rendered, m, lock) {
  const findings = [];
  const lettering = await findLettering(rendered.png, rendered.texts);
  const texts = [...rendered.texts, ...lettering];
  for (const t of texts) {
    if (t.source !== "ocr") findings.push(...await contrastFinding(rendered, t));
    findings.push(...edge(rendered, t));
  }
  findings.push(...phoneSize(rendered, texts), ...await legibility(rendered), ...tension(rendered, texts));
  if (rendered.cut.length) {
    findings.push({
      rule: "shapes-cut",
      kind: "default",
      message: `${rendered.cut.length} small shape${rendered.cut.length === 1 ? "" : "s"} run past the edge of the picture. If that isn't on purpose, move ${rendered.cut.length === 1 ? "it" : "them"} inside the frame.`
    });
  }
  findings.push(...await banding(rendered));
  if (lock && STYLE_3D.test(lock.style ?? "") && m.clippedShare > CLIPPED) {
    findings.push({
      rule: "clipped",
      kind: "default",
      message: `The "${lock.name}" lock is a 3D look, but ${Math.round(m.clippedShare * 100)}% of the picture (the background aside) is pure white or pure black, where its shading is lost. Dim the key light or the material so the brightest part stops short of white, and lift the deepest shadows off black.`,
      source: "Birn, Digital Lighting & Rendering pp. 157\u2013158, clipping"
    });
  }
  if (lock) findings.push(...offLock(rendered.colors, rendered.fonts, lock), ...approvedWords(lock, texts.map((t) => t.text)), ...await pixelEdges(rendered, lock), ...await mixels(rendered, lock));
  findings.push(...hierarchy(texts));
  const typed = texts.filter((t) => t.source === "text");
  findings.push(...sizeSteps(new Map(typed.map((t) => [t.text, t.size])), [typed.map((t) => t.text)]));
  if (m.centered && !lock?.composition.centered) {
    findings.push({
      rule: "subject-centered",
      kind: "default",
      message: "The picture's visual weight sits at its center. Unless it's an icon or meant to be still, try moving the main subject off center.",
      source: "Bang, Picture This, principle 5; Payne p. 38; Loomis p. 46"
    });
  }
  if (m.murky && !DARK_MOOD.test(lock?.mood ?? "")) {
    findings.push({
      rule: "murk",
      kind: "default",
      message: "Nothing in the picture reaches a light value: it all sits in the dark half. A dark mood comes from contrast, not from dimming everything; keep the field dark and light the subject.",
      source: "Birn, Digital Lighting & Rendering pp. 152\u2013153, student murk"
    });
  } else if (m.midShare > 0.85) {
    findings.push({
      rule: "middle-values",
      kind: "default",
      message: `${Math.round(m.midShare * 100)}% of the picture is mid-grey in value, with few real lights or darks. Push some areas to light and some to dark.`,
      source: "Gurney, Imaginative Realism p. 156, middle value mumbling"
    });
  }
  if (m.saturatedShare > 0.55) {
    findings.push({
      rule: "saturation",
      kind: "default",
      message: `${Math.round(m.saturatedShare * 100)}% of the picture is strongly saturated. Grey most of it and keep strong color for the focal point.`,
      source: "Loomis, Creative Illustration p. 153, nature is largely grey"
    });
  }
  if (m.rawPrimaries.length === 3) {
    findings.push({
      rule: "raw-primaries",
      kind: "default",
      message: "Red, yellow and blue all appear at full strength. Tone two of them down.",
      source: "Loomis, Creative Illustration p. 168"
    });
  }
  return findings;
}
async function contrastFinding(p4, t) {
  const contrast2 = await textContrast(p4, t);
  const large = t.size >= 24 || t.bold && t.size >= 18.66;
  const needed = large ? 3 : 4.5;
  if (contrast2 === void 0 || contrast2 >= needed) return [];
  return [{
    rule: "text-contrast",
    kind: "error",
    message: `"${short(t.text)}" has contrast ${contrast2.toFixed(1)}:1 against what's behind it; it needs ${needed}:1.`,
    source: "WCAG 2.2, 1.4.3"
  }];
}
async function textContrast(r2, t) {
  const box = clip(t.box, r2);
  if (!box) return void 0;
  const { data } = await sharp5(r2.png).flatten({ background: "#ffffff" }).extract(box).raw().toBuffer({ resolveWithObject: true });
  const ink = toRgb(t.color);
  if (!ink) return void 0;
  const behind = [];
  for (let i = 0; i < data.length; i += 3) {
    const px = { mode: "rgb", r: data[i] / 255, g: data[i + 1] / 255, b: data[i + 2] / 255 };
    if (oklab2(px, ink) > 0.08) behind.push(px);
  }
  if (behind.length < data.length / 3 * 0.2) return void 0;
  behind.sort((a, b) => luminance(a) - luminance(b));
  return contrast(behind[behind.length >> 1], ink);
}
function clip(b, r2) {
  const left = Math.max(0, Math.floor(b.x)), top = Math.max(0, Math.floor(b.y));
  const right = Math.min(r2.width, Math.ceil(b.x + b.width)), bottom = Math.min(r2.height, Math.ceil(b.y + b.height));
  if (right - left < 2 || bottom - top < 2) return void 0;
  return { left, top, width: right - left, height: bottom - top };
}
function edge(r2, t, margin = SAFE_MARGIN) {
  const { x, y, width, height } = t.box;
  const touch = t.source === "ocr" ? 2 : 0;
  if (x < touch || y < touch || x + width > r2.width - touch || y + height > r2.height - touch) {
    return [{ rule: "text-cut", kind: "error", message: `${what(t)} is cut off by the edge of the picture.` }];
  }
  const m = margin * Math.min(r2.width, r2.height);
  if (x < m || y < m || x + width > r2.width - m || y + height > r2.height - m) {
    return [{
      rule: "text-margin",
      kind: "error",
      message: `${what(t)} sits within ${Math.round(m)}px of the edge, where it can be cropped or crowded. Move it in.`
    }];
  }
  return [];
}
function offLock(colors, fonts, lock) {
  const out = [];
  const stray = [...new Set(colors.map(toHex).filter((h) => !!h))].filter(
    (c2) => !lock.colors.some((l) => oklab2(c2, l) <= OFF_PALETTE)
  );
  if (stray.length) {
    out.push({
      rule: "off-lock-colors",
      kind: "error",
      message: `Colors outside the "${lock.name}" lock: ${stray.join(", ")}. Use the locked palette: ${lock.colors.join(", ")}.`
    });
  }
  const strayFonts = fonts.filter((f3) => !lock.fonts.includes(f3));
  if (strayFonts.length) {
    out.push({
      rule: "off-lock-fonts",
      kind: "error",
      message: `Fonts outside the "${lock.name}" lock: ${strayFonts.join(", ")}. Locked: ${lock.fonts.join(", ") || "none"}.`
    });
  }
  return out;
}
async function pixelEdges(p4, lock) {
  if (!/pixel/i.test(lock.style ?? "")) return [];
  const { data } = await sharp5(p4.png).flatten({ background: "#ffffff" }).raw().toBuffer({ resolveWithObject: true });
  const colors = /* @__PURE__ */ new Set();
  for (let i = 0; i < data.length; i += 3) colors.add(data[i] << 16 | data[i + 1] << 8 | data[i + 2]);
  if (colors.size <= PIXEL_COLORS) return [];
  return [{
    rule: "pixel-edges",
    kind: "error",
    message: `The "${lock.name}" lock is pixel art, but the picture has ${colors.size} distinct colors: edges are smoothed, not pixel-sharp. Draw on whole pixels and add shape-rendering="crispEdges" (SVG) or image-rendering: pixelated (CSS).`
  }];
}
async function banding(p4) {
  const { data, info } = await sharp5(p4.png).flatten({ background: "#ffffff" }).raw().toBuffer({ resolveWithObject: true });
  const { width, height } = info;
  const share = (lines, length, at) => {
    let banded = 0, read = 0;
    for (let line = 0; line < lines; line += 4, read++) if (staircase(data, length, (i) => at(line, i))) banded++;
    return banded / read;
  };
  const most = Math.max(share(height, width, (y, x) => (y * width + x) * 3), share(width, height, (x, y) => (y * width + x) * 3));
  if (most <= BANDED) return [];
  return [{
    rule: "banding",
    kind: "default",
    message: `A gradient shows as visible steps (banding) across ${Math.round(most * 100)}% of the picture. Draw it as one real gradient, or add a little noise or texture over it.`,
    source: "Birn, Digital Lighting & Rendering pp. 153\u2013154, banding"
  }];
}
function staircase(data, length, at) {
  let start = at(0), len = 1, prev = -1, steps = 0, way = 0;
  const close = () => {
    if (len < BAND_MIN) {
      prev = -1;
      steps = 0;
      return false;
    }
    const step = prev < 0 ? 0 : faintStep(data, prev, start);
    if (step && (steps === 0 || step === way)) steps++;
    else steps = step ? 1 : 0;
    way = step;
    prev = start;
    return steps >= BAND_RUN - 1;
  };
  for (let i = 1; i < length; i++) {
    const o = at(i);
    if (data[o] === data[start] && data[o + 1] === data[start + 1] && data[o + 2] === data[start + 2]) len++;
    else {
      if (close()) return true;
      start = o;
      len = 1;
    }
  }
  return close();
}
function faintStep(data, a, b) {
  const d = [data[b] - data[a], data[b + 1] - data[a + 1], data[b + 2] - data[a + 2]];
  if (Math.max(...d.map(Math.abs)) > BAND_STEP) return 0;
  return Math.sign(d[0] + d[1] + d[2]);
}
function hierarchy(texts) {
  const sizes = texts.map((t) => t.size).sort((a, b) => a - b);
  if (sizes.length < 3) return [];
  const median = sizes[sizes.length >> 1], biggest = sizes.at(-1);
  if (biggest >= HEADLINE_LEAD * median) return [];
  return [{
    rule: "no-hierarchy",
    kind: "default",
    message: `${sizes.length} texts, all about the same size (${Math.round(sizes[0])}\u2013${Math.round(biggest)} px): nothing reads first. Make one headline at least ${HEADLINE_LEAD}\xD7 the labels.`,
    source: "Williams, The Non-Designer's Design Book: contrast must be strong; Attentry Design rules R4"
  }];
}
function what(t) {
  return t.source === "ocr" ? `Lettering in the picture (read as "${short(t.text)}")` : `"${short(t.text)}"`;
}
function phoneSize(r2, texts) {
  const atPhone = (t) => t.size * PHONE_WIDTH / r2.width;
  const unreadable = texts.filter((t) => atPhone(t) < 9), small = texts.filter((t) => atPhone(t) >= 9 && atPhone(t) < 13);
  const list2 = (ts) => ts.map((t) => `${what(t)} (${Math.round(atPhone(t))} px)`).join(", ");
  const out = [];
  if (unreadable.length) {
    out.push({
      rule: "text-too-small",
      kind: "error",
      message: `Too small to read on a phone, where this picture shows about ${PHONE_WIDTH} px wide: ${list2(unreadable)}. Make it at least ${Math.ceil(13 * r2.width / PHONE_WIDTH)} px tall here.`,
      source: "Attentry Design rules R1; phones show posts about 360 px wide"
    });
  }
  if (small.length) {
    out.push({
      rule: "text-small",
      kind: "default",
      message: `Small on a phone (about ${PHONE_WIDTH} px wide): ${list2(small)}. ${Math.ceil(13 * r2.width / PHONE_WIDTH)} px or more here reads easily.`,
      source: "Attentry Design rules R1; phones show posts about 360 px wide"
    });
  }
  return out;
}
async function legibility(r2) {
  const misread = [];
  for (const t of r2.texts.filter((t2) => t2.source === "drawn")) {
    const read = await readBack(r2.png, r2.width, r2.height, t);
    if (similarity(t.text, read) < READABLE) misread.push(`"${short(t.text)}" as "${short(read || "nothing")}"`);
  }
  if (!misread.length) return [];
  return [{
    rule: "hard-to-read",
    kind: "default",
    message: `A text reader misread ${misread.join(", ")}. The letter shapes may be ambiguous to people too: try a plainer font, more space between letters, or a bigger size.`
  }];
}
async function mixels(p4, lock) {
  if (!/pixel/i.test(lock.style ?? "")) return [];
  const { data, info } = await sharp5(p4.png).flatten({ background: "#ffffff" }).raw().toBuffer({ resolveWithObject: true });
  const W = info.width, H = info.height, T = 48;
  const at = (x, y) => {
    const i = (y * W + x) * 3;
    return data[i] << 16 | data[i + 1] << 8 | data[i + 2];
  };
  const gcd = (a, b) => b ? gcd(b, a % b) : a;
  const sizes = /* @__PURE__ */ new Map();
  for (let ty = 0; ty + T <= H; ty += T) {
    for (let tx = 0; tx + T <= W; tx += T) {
      let g = 0, runs2 = 0;
      for (let k4 = 0; k4 < T; k4++) {
        for (const across of [true, false]) {
          let start = 0;
          for (let i = 1; i <= T; i++) {
            const same = i < T && (across ? at(tx + i, ty + k4) === at(tx + i - 1, ty + k4) : at(tx + k4, ty + i) === at(tx + k4, ty + i - 1));
            if (same) continue;
            if (start > 0 && i < T) {
              g = gcd(g, i - start);
              runs2++;
            }
            start = i;
          }
        }
      }
      if (runs2 >= 40 && g > 0) sizes.set(g, (sizes.get(g) ?? 0) + 1);
    }
  }
  const counted = [...sizes].filter(([, n]) => n >= 3).map(([s]) => s).sort((a, b) => a - b);
  const scaled = counted.filter((s) => s !== counted[0] && s % counted[0] === 0);
  if (!counted.length || !scaled.length) return [];
  return [{
    rule: "mixels",
    kind: "error",
    message: `This pixel art mixes pixel sizes: parts are drawn with ${[counted[0], ...scaled].map((s) => `${s} px`).join(" and ")} pixels. Draw everything on one pixel grid; to make a sprite bigger, redraw it at the larger size instead of doubling its pixels.`,
    source: "Azzi, Pixel Logic p. 21 (mixels)"
  }];
}
function tension(r2, texts) {
  const tight = [];
  for (const t of texts.filter((t2) => t2.source !== "ocr")) {
    const crossed = r2.rings.find((g) => {
      const cx2 = g.x + g.width / 2, cy2 = g.y + g.height / 2, rx = g.width / 2, ry = g.height / 2;
      const pts = [0, 0.5, 1].flatMap((u) => [0, 0.5, 1].map((v) => [t.box.x + u * t.box.width, t.box.y + v * t.box.height]));
      const d = pts.map(([x, y]) => ((x - cx2) / rx) ** 2 + ((y - cy2) / ry) ** 2);
      return Math.min(...d) < 1 && Math.max(...d) > 1;
    });
    if (crossed) {
      tight.push(`${what(t)}: the curve of the ${shape(crossed)} runs through it`);
      continue;
    }
    const cx = t.box.x + t.box.width / 2, cy = t.box.y + t.box.height / 2;
    const holder = t.holder ?? r2.panels.filter((p4) => cx > p4.x && cx < p4.x + p4.width && cy > p4.y && cy < p4.y + p4.height && p4.width * p4.height > 1.5 * t.box.width * t.box.height).sort((a, b) => a.width * a.height - b.width * b.height)[0];
    if (!holder) continue;
    const near = Math.max(2, 0.2 * t.box.height);
    const gaps = [t.box.x - holder.x, holder.x + holder.width - (t.box.x + t.box.width), t.box.y - holder.y, holder.y + holder.height - (t.box.y + t.box.height)];
    const side = gaps.map((g, i) => ({ g, i })).filter(({ g }) => Math.abs(g) < near).sort((a, b) => Math.abs(a.g) - Math.abs(b.g))[0];
    if (side) tight.push(`${what(t)}: ${Math.round(Math.abs(side.g))} px from the ${["left", "right", "top", "bottom"][side.i]} edge of the ${shape(holder)}`);
  }
  if (!tight.length) return [];
  return [{
    rule: "visual-tension",
    kind: "default",
    message: `Almost touching the edge of a shape: ${tight.join("; ")}. Give clear room inside, or let it clearly overlap the edge.`,
    source: "Glitschka, Vector Basic Training pp. 189\u2013191 (visual tension)"
  }];
}
function shape(b) {
  const named2 = (b.what ?? "shape").replace(/rgba?\([^)]*\)/g, (c2) => toHex(c2) ?? c2);
  return `${named2} (${Math.round(b.width)}\xD7${Math.round(b.height)} at ${Math.round(b.x)}, ${Math.round(b.y)})`;
}
var SAME_SIZE = 1.05;
var CLOSE_SIZE = 1.2;
var MOST_SIZES = 4;
function sizeSteps(size, together) {
  const out = [];
  const levels = [];
  for (const s of [...size.values()].sort((a, b) => a - b)) if (!levels.length || s / levels.at(-1) > SAME_SIZE) levels.push(s);
  if (levels.length > MOST_SIZES) {
    out.push({
      rule: "too-many-sizes",
      kind: "default",
      message: `${levels.length} text sizes (${levels.map((s) => Math.round(s)).join(", ")} px). About ${MOST_SIZES} distinct sizes are enough: merge the ones that are near each other.`,
      source: "Bringhurst, The Elements of Typographic Style: a modest set of distinct and related intervals"
    });
  }
  const close = /* @__PURE__ */ new Map();
  for (const group of together) {
    for (const a of group) for (const b of group) {
      const [x, y] = [size.get(a), size.get(b)];
      if (x / y > SAME_SIZE && x / y < CLOSE_SIZE) close.set(`${a} | ${b}`, `"${short(a)}" (${Math.round(x)} px) and "${short(b)}" (${Math.round(y)} px)`);
    }
  }
  if (close.size) {
    out.push({
      rule: "sizes-too-close",
      kind: "default",
      message: `Sizes too close to tell apart: ${[...close.values()].slice(0, 4).join("; ")}${close.size > 4 ? ` and ${close.size - 4} more` : ""}. Make them one size, or at least 1.2\xD7 apart.`,
      source: "Williams, The Non-Designer's Design Book: you cannot contrast 12-point type with 14-point type"
    });
  }
  return out;
}
var wordsOf = (s) => s.toLowerCase().replace(/['’]/g, "").match(/[\p{L}\p{N}]+/gu) ?? [];
function scriptLine(line) {
  const m = /^(.*?)\s*\|\s*(\d+(?:\.\d+)?)\s*s\s*$/.exec(line);
  return m ? { text: m[1], seconds: Number(m[2]) } : { text: line };
}
function approvedWords(lock, shown2) {
  const seen = new Set(shown2.flatMap(wordsOf));
  const there = (w) => seen.has(w) || w.length >= 4 && [...seen].some((s) => similarity(w, s) >= 0.8);
  const missing = (lock.words ?? []).map((l) => scriptLine(l).text).map((line) => ({ line, gone: wordsOf(line).filter((w) => !there(w)) })).filter((m) => m.gone.length);
  if (!missing.length) return [];
  return [{
    rule: "approved-words",
    kind: "error",
    message: `Approved words missing from the design: ${missing.map((m) => `"${short(m.line)}" (${m.gone.join(", ")})`).join("; ")}. The person approved these words: put them in, or ask before changing them.`,
    source: `the words approved in the "${lock.name}" lock`
  }];
}
function short(s) {
  return s.length > 40 ? s.slice(0, 37) + "\u2026" : s;
}

// src/findings.ts
function format(findings) {
  if (findings.length === 0) return "No findings.";
  const order = { error: 0, default: 1 };
  return [...findings].sort((a, b) => order[a.kind] - order[b.kind]).map((f3) => `  ${f3.kind.padEnd(7)} ${f3.message}${f3.source ? `
          (${f3.source})` : ""}`).join("\n");
}

// src/video.ts
import sharp6 from "sharp";
var STEP = 0.25;
var SEEN = 0.95;
var LEGIBLE = 0.5;
var MIN_SIZE = 0.022;
var CAPTION_SIZE = 0.037;
var VIDEO_MARGIN = 0.05;
var CROWDED = 15;
var BLANK = 0.02;
var STILL = 3e-3;
var LONGEST_HOLD = 6;
var MOVING = 0.015;
var ONGOING = 2;
async function checkVideo(c2, frames, lock) {
  const findings = [];
  const picture = (f3) => ({ png: f3.png, width: c2.width, height: c2.height });
  const texts = readable(frames, SEEN, c2);
  const timed = readable(frames, LEGIBLE, c2);
  const index = new Map(frames.map((f3, i) => [f3, i]));
  const runs2 = [...timed].map(([text, seen]) => ({ text, seen, run: longestStillRun(seen, frames) })).filter((r2) => r2.run.length > 0).map((r2) => ({ ...r2, start: index.get(r2.run[0].frame), end: index.get(r2.run.at(-1).frame) })).sort((a, b) => a.start - b.start);
  const near = (a, b) => {
    const gap = Math.max(a.box.y, b.box.y) - Math.min(a.box.y + a.box.height, b.box.y + b.box.height);
    return gap < 2 * Math.max(a.box.height, b.box.height);
  };
  const groups = [];
  for (const r2 of runs2) {
    const g = groups.find((g2) => r2.start - g2[0].start <= Math.round(1 / STEP) && r2.start <= Math.min(...g2.map((x) => x.end)) && g2.some((x) => near(x.run[0].box, r2.run[0].box)));
    if (g) g.push(r2);
    else groups.push([r2]);
  }
  for (const g of groups) {
    const chars = g.reduce((n, r2) => n + r2.text.length, 0);
    const needed = Math.max(5 / 6, chars / 17);
    const leaving = g.reduce((a, b) => b.end < a.end ? b : a);
    const shown2 = legibleEdge(frames, leaving.text, leaving.end, 1) - legibleEdge(frames, g[0].text, g[0].start, -1);
    if (shown2 + sampleGap(frames) / 2 >= needed) continue;
    const what2 = g.length === 1 ? `"${short(g[0].text)}"` : `"${short(g[0].text)}" and ${g.length - 1} more line${g.length === 2 ? "" : "s"} shown with it`;
    findings.push({
      rule: "text-too-brief",
      kind: "error",
      message: `${what2}: ${chars} characters readable for about ${shown2.toFixed(2)} s; they need ${needed.toFixed(2)} s. Hold longer or say less.`,
      source: "Netflix timed-text guidelines: 17 characters per second, never under 5/6 s"
    });
  }
  const nearEdge = [];
  for (const [text, seen] of texts) {
    const run = longestStillRun(seen, frames);
    const middle = (run.length ? run : seen)[Math.floor((run.length ? run : seen).length / 2)];
    const size = middle.box.size / c2.height;
    const visible = middle.frame.texts.filter((t) => t.opacity >= SEEN);
    const texture = visible.some((t) => t.size / c2.height >= CAPTION_SIZE) && visible.filter((t) => t.size / c2.height < MIN_SIZE).length >= 3;
    if (size < MIN_SIZE && !texture) {
      findings.push({
        rule: "text-too-small",
        kind: "error",
        message: `"${short(text)}" is ${Math.round(middle.box.size)} px tall on a ${c2.height} px frame (${(size * 100).toFixed(1)}%); text that carries the message needs about ${Math.round(MIN_SIZE * c2.height)} px.`,
        source: "Attentry Design baseline: small text in 17 of 25 gallery videos"
      });
    }
    findings.push(...await contrastFinding(picture(middle.frame), middle.box));
    for (const f3 of edge(picture(middle.frame), middle.box, VIDEO_MARGIN)) {
      if (f3.rule === "text-margin") nearEdge.push(text);
      else findings.push(f3);
    }
  }
  if (nearEdge.length) {
    findings.push({
      rule: "text-margin",
      kind: "default",
      message: `${nearEdge.length} text${nearEdge.length === 1 ? "" : "s"} within ${Math.round(VIDEO_MARGIN * Math.min(c2.width, c2.height))} px of the edge, where platforms crop or overlay: ${nearEdge.map((x) => `"${short(x)}"`).join(", ")}.`,
      source: "Attentry Design rules L1: a 5% margin"
    });
  }
  const tense = /* @__PURE__ */ new Map();
  for (const f3 of frames) {
    const shown2 = f3.texts.filter((t) => t.opacity >= SEEN);
    const crowded = shown2.length > CROWDED;
    for (const t of shown2.filter((t2) => !crowded || t2.size / c2.height >= CAPTION_SIZE)) {
      const [hit] = tension(f3, [t]);
      if (hit && !tense.has(t.text)) tense.set(t.text, { ...hit, message: hit.message.replace(/^"[^"]*"/, `"${short(t.text)}" (at ${f3.time.toFixed(1)} s)`) });
    }
  }
  if (tense.size) {
    findings.push({
      rule: "visual-tension",
      kind: "default",
      message: `Text almost touching or crossed by a shape's edge: ${[...tense.values()].map((f3) => f3.message.split(" almost")[0]).join(", ")}. Give clear room, or let it clearly overlap.`,
      source: "Glitschka, Vector Basic Training pp. 189\u2013191 (visual tension)"
    });
  }
  const sizeOf = new Map([...texts].map(([text, seen]) => {
    const run = longestStillRun(seen, frames);
    return [text, (run.length ? run : seen)[0].box.size];
  }));
  findings.push(...sizeSteps(sizeOf, frames.map((f3) => [...new Set(f3.texts.map((t) => t.text).filter((t) => sizeOf.has(t)))])));
  const fonts = [...new Set(frames.flatMap((f3) => f3.fonts))];
  if (fonts.length > 2) {
    findings.push({
      rule: "too-many-fonts",
      kind: "default",
      message: `${fonts.length} font families (${fonts.join(", ")}). Two are usually enough.`,
      source: "Shaw, Design for Motion: no more than a couple of typefaces"
    });
  }
  const looks = await Promise.all(frames.map(async (f3) => (await labPixels(f3.png, GRID)).map((p4) => p4.l)));
  findings.push(...blankRuns(looks, frames, c2), ...stillRuns(looks, frames), ...arrivesMidMove(texts, frames, looks, c2), ...DARK_MOOD.test(lock?.mood ?? "") ? [] : murk(looks));
  findings.push(...NO_ASK.test(lock?.purpose ?? "") ? [] : callToAction(c2, frames), ...await letteringInImages(c2, frames));
  if (lock) {
    findings.push(...offLock(frames.flatMap((f3) => f3.colors), fonts, lock));
    findings.push(...approvedScript(lock, frames));
    const middle = frames[Math.floor(frames.length / 2)];
    if (middle) findings.push(...await pixelEdges(picture(middle), lock));
  }
  return findings;
}
var END_SECONDS = 3;
var NEXT_STEP = /([\w-]+\.(com|org|io|dev|app|ai|co|net|gg|so)\b|https?:|@\w|\b(install|download|get it|try|visit|sign up|join|search|subscribe|follow|buy|order|book|start|link in)\b)/i;
function callToAction(c2, frames) {
  const end = c2.durationInFrames / c2.fps;
  const last = frames.filter((f3) => f3.time >= end - END_SECONDS);
  const card = last.map((f3) => f3.texts.filter((t) => t.opacity >= SEEN && (t.text.match(/[\p{L}\p{N}]/gu) ?? []).length >= 2)).reduce((a, b) => b.length > a.length ? b : a, []);
  if (!card.length) return [];
  const next = card.filter((t) => NEXT_STEP.test(t.text));
  if (!next.length) {
    return [{
      rule: "no-call-to-action",
      kind: "default",
      message: `The last ${END_SECONDS} s have text but no next step (a link, a store name, "install", "try"). If the video should bring a visit or an install, end on it; a brand film can end on its logo.`,
      source: "Attentry Design rules S1: no call to action in 2 of 7 gallery promos"
    }];
  }
  const others = card.filter((t) => !next.includes(t));
  const biggest = Math.max(...next.map((t) => t.size));
  if (others.length >= 2 && others.every((t) => t.size > biggest)) {
    return [{
      rule: "call-to-action-smallest",
      kind: "default",
      message: `The next step, "${short(next[0].text)}", is the smallest text on the end card (${Math.round(biggest)} px). Make it the second biggest thing there.`,
      source: "Hitchcock's rule: an object's size in the frame should match its importance (Attentry Design rules S1)"
    }];
  }
  return [];
}
function approvedScript(lock, frames) {
  if (!lock.words?.length) return [];
  const words = frames.map((f3) => new Set(f3.texts.filter((t) => t.opacity >= LEGIBLE).flatMap((t) => wordsOf(t.text))));
  const everywhere = new Set(words.flatMap((w) => [...w]));
  const missing = [], brief = [], first = [];
  for (const raw of lock.words) {
    const { text, seconds } = scriptLine(raw);
    const need = wordsOf(text);
    const on = words.map((w) => need.every((x) => w.has(x)));
    const at = on.indexOf(true);
    if (at < 0) {
      const gone = need.filter((x) => !everywhere.has(x));
      missing.push(`"${short(text)}" (${gone.length ? gone.join(", ") : "its words are never on screen together"})`);
      continue;
    }
    first.push({ line: text, at });
    if (seconds) {
      const longest = runs(on).reduce((m, [a, b]) => Math.max(m, frames[b].time - frames[a].time + sampleGap(frames)), 0);
      if (longest < seconds * 0.8) brief.push(`"${short(text)}" is up ${longest.toFixed(1)} s of the ${seconds} s approved`);
    }
  }
  const out = [];
  const source = `the script approved in the "${lock.name}" lock`;
  if (missing.length) out.push({ rule: "approved-words", kind: "error", message: `Approved lines missing from the video: ${missing.join("; ")}. Put them in, or ask before changing them.`, source });
  if (brief.length) out.push({ rule: "script-timing", kind: "error", message: `Shorter than the approved script: ${brief.join("; ")}.`, source });
  const swapped = first.slice(1).flatMap((l, i) => l.at < first[i].at ? [`"${short(l.line)}" comes before "${short(first[i].line)}"`] : []);
  if (swapped.length) out.push({ rule: "script-order", kind: "error", message: `Lines out of the approved order: ${swapped.join("; ")}.`, source });
  return out;
}
var TEXTURE_LINES = 5;
var OCR_RUNS = 20;
async function letteringInImages(c2, frames) {
  const every = Math.round(1 / STEP);
  const jobs = frames.filter((f3, i) => i % every === 0).flatMap((f3) => f3.images.map((box) => ({ f: f3, box }))).slice(0, OCR_RUNS * 3);
  const seen = [];
  const found = /* @__PURE__ */ new Map();
  let runsLeft = OCR_RUNS;
  for (const { f: f3, box } of jobs) {
    if (runsLeft === 0) break;
    const left = Math.max(0, Math.floor(box.x)), top = Math.max(0, Math.floor(box.y));
    const width = Math.min(c2.width, Math.ceil(box.x + box.width)) - left, height = Math.min(c2.height, Math.ceil(box.y + box.height)) - top;
    if (width < 32 || height < 32) continue;
    const crop = await sharp6(f3.png).extract({ left, top, width, height }).png().toBuffer();
    const look = (await labPixels(crop, 16)).map((p4) => p4.l);
    if (seen.some((s) => Math.abs(s.box.x - box.x) < 4 && Math.abs(s.box.y - box.y) < 4 && layoutDistance(s.look, look) < 0.01)) continue;
    seen.push({ box, look });
    runsLeft--;
    const known = f3.texts.map((t) => ({ ...t, box: { ...t.box, x: t.box.x - left, y: t.box.y - top } }));
    const lettering = await findLettering(crop, known);
    if (lettering.length > TEXTURE_LINES) continue;
    for (const t of lettering) {
      const at = { ...t, box: { ...t.box, x: t.box.x + left, y: t.box.y + top } };
      const where = `"${short(at.text)}" in a picture at ${f3.time.toFixed(1)} s`;
      const cut = edge({ png: f3.png, width: c2.width, height: c2.height }, at, VIDEO_MARGIN).some((e4) => e4.rule === "text-cut");
      if (cut && !found.has(`cut ${at.text}`)) found.set(`cut ${at.text}`, { rule: "text-cut", kind: "error", message: `${where} is cut off by the edge of the frame.`, source: "read by OCR" });
      if (at.size / c2.height < MIN_SIZE && !found.has(`small ${at.text}`)) {
        found.set(`small ${at.text}`, {
          rule: "text-too-small",
          kind: "default",
          message: `${where} is about ${Math.round(at.size)} px tall on a ${c2.height} px frame; if it should be read, it needs about ${Math.round(MIN_SIZE * c2.height)} px.`,
          source: "Attentry Design rules R1 (read by OCR, so less certain)"
        });
      }
    }
  }
  return [...found.values()];
}
function inBetween(t, next) {
  if (!next) return false;
  const number = /^[\d.,%\s+-]+$/;
  return next.texts.some(
    (n) => n.text !== t.text && // The same line: a centered line shifts sideways as it grows, so match the row and overlap.
    Math.abs(n.box.y - t.box.y) < 4 && n.box.x < t.box.x + t.box.width && t.box.x < n.box.x + n.box.width && (n.text.startsWith(t.text) || number.test(n.text) && number.test(t.text))
  );
}
var sampleGap = (frames) => frames.length > 1 ? frames[1].time - frames[0].time : STEP;
var opacityOf = (f3, text) => Math.max(0, ...f3?.texts.filter((t) => t.text === text).map((t) => t.opacity) ?? []);
function legibleEdge(frames, text, i, side) {
  const here = frames[i], there = frames[i + side];
  if (!there) return here.time;
  const a = opacityOf(here, text), b = opacityOf(there, text);
  const share = a > b ? (a - LEGIBLE) / (a - b) : 0.5;
  return here.time + share * (there.time - here.time);
}
function readable(frames, opacity, c2) {
  const texts = /* @__PURE__ */ new Map();
  frames.forEach((f3, i) => {
    const visible = f3.texts.filter((t) => t.opacity >= opacity);
    const crowded = visible.length > CROWDED;
    for (const t of visible) {
      if (crowded && t.size / c2.height < CAPTION_SIZE) continue;
      if ((t.text.match(/[\p{L}\p{N}]/gu) ?? []).length < 2) continue;
      if (inBetween(t, frames[i + 1])) continue;
      texts.set(t.text, [...texts.get(t.text) ?? [], { frame: f3, box: t }]);
    }
  });
  return texts;
}
function longestStillRun(seen, frames) {
  const index = new Map(frames.map((f3, i) => [f3, i]));
  let best = [], run = [];
  for (const s of seen) {
    const prev = run.at(-1);
    const next = prev && index.get(s.frame) === index.get(prev.frame) + 1 && Math.abs(s.box.box.x - prev.box.box.x) < 2 && Math.abs(s.box.box.y - prev.box.box.y) < 2;
    run = next ? [...run, s] : [s];
    if (run.length > best.length) best = run;
  }
  return best;
}
function spread(l) {
  const mean = l.reduce((a, b) => a + b, 0) / l.length;
  return Math.sqrt(l.reduce((a, b) => a + (b - mean) ** 2, 0) / l.length);
}
function blankRuns(looks, frames, c2) {
  const end = c2.durationInFrames / c2.fps;
  const blank = looks.map((l, i) => spread(l) < BLANK && !frames[i].texts.some((t) => t.opacity >= SEEN));
  return runs(blank).flatMap(([a, b]) => {
    const from = frames[a].time, to = frames[b].time + STEP, length = to - from;
    const atEdges = from < 3 || to > end - 1;
    if (length < (atEdges ? 0.5 : 1)) return [];
    return [{
      rule: "blank-frames",
      kind: "error",
      message: `Nothing on screen from ${from.toFixed(2)} s to ${Math.min(to, end).toFixed(2)} s${from < 3 ? ", inside the opening seconds" : to > end - 1 ? ", at the end" : ""}.`,
      source: "Attentry Design baseline: blank frames in 8 of 25 gallery videos"
    }];
  });
}
function murk(looks) {
  const shown2 = looks.filter((l) => spread(l) >= BLANK);
  const dark = shown2.filter(murky).length;
  if (!shown2.length || dark / shown2.length <= 0.5) return [];
  return [{
    rule: "murk",
    kind: "default",
    message: `${Math.round(dark / shown2.length * 100)}% of the frames never reach a light value: the video sits in the dark half. A dark mood comes from contrast; keep the field dark and light the subject and the text.`,
    source: "Birn, Digital Lighting & Rendering pp. 152\u2013153, student murk; Attentry Design baseline: median brightness 50 in AI videos, 238 in the pros'"
  }];
}
function stillRuns(looks, frames) {
  const same = looks.map((l, i) => i > 0 && layoutDistance(l, looks[i - 1]) < STILL && spread(l) >= BLANK);
  return runs(same).flatMap(([a, b]) => {
    const length = (b - a + 2) * STEP;
    if (length <= LONGEST_HOLD) return [];
    return [{
      rule: "held-too-long",
      kind: "default",
      message: `The picture doesn't change from ${frames[a - 1].time.toFixed(1)} s to ${frames[b].time.toFixed(1)} s (${length.toFixed(1)} s). Add movement or cut sooner.`,
      source: "Attentry Design baseline: the pros' longest hold was 5.8 s"
    }];
  });
}
var GRID = 32;
function arrivesMidMove(texts, frames, looks, c2) {
  const index = new Map(frames.map((f3, i) => [f3, i]));
  const late = [];
  for (const [text, seen] of texts) {
    const full = index.get(seen[0].frame);
    if (full < 2 || full === frames.length - 1) continue;
    const move = (k4) => changeOutside(looks[k4 - 1], looks[k4], changing(frames[k4 - 1], frames[k4]), c2);
    const motion = Math.min(move(full - 1), move(full), move(full + 1));
    if (motion <= MOVING) continue;
    const after = frames.slice(full + 1, full + 1 + ONGOING / STEP).map((_, j) => move(full + 1 + j) > MOVING / 2);
    if (after.length && after.filter(Boolean).length >= after.length / 2) continue;
    late.push(`"${short(text)}" (${frames[full].time.toFixed(1)} s)`);
  }
  if (!late.length) return [];
  return [{
    rule: "text-during-move",
    kind: "default",
    message: `Text arrives while the picture is still moving, where it goes unnoticed: ${late.join(", ")}. Let the move land, then bring the text in.`,
    source: "Thomas & Johnston, The Illusion of Life: a change in the middle of a major move goes unnoticed"
  }];
}
function changing(a, b) {
  const key = (t) => `${t.text}|${t.opacity.toFixed(1)}`;
  const inA = new Set(a.texts.map(key)), inB = new Set(b.texts.map(key));
  return [...a.texts.filter((t) => !inB.has(key(t))), ...b.texts.filter((t) => !inA.has(key(t)))].map((t) => t.box);
}
function changeOutside(a, b, boxes, c2) {
  const masked = /* @__PURE__ */ new Set();
  for (const box of boxes) {
    const x0 = Math.floor(box.x / c2.width * GRID) - 1, x1 = Math.ceil((box.x + box.width) / c2.width * GRID);
    const y0 = Math.floor(box.y / c2.height * GRID) - 1, y1 = Math.ceil((box.y + box.height) / c2.height * GRID);
    for (let y = Math.max(0, y0); y <= Math.min(GRID - 1, y1); y++) for (let x = Math.max(0, x0); x <= Math.min(GRID - 1, x1); x++) masked.add(y * GRID + x);
  }
  let sum = 0, n = 0;
  for (let i = 0; i < a.length; i++) if (!masked.has(i)) {
    sum += Math.abs(a[i] - b[i]);
    n++;
  }
  return n ? sum / n : 0;
}
function runs(flags) {
  const out = [];
  flags.forEach((on, i) => {
    if (!on) return;
    if (out.length && out.at(-1)[1] === i - 1) out.at(-1)[1] = i;
    else out.push([i, i]);
  });
  return out;
}
function keyFrames(c2) {
  return [0.1, 0.3, 0.5, 0.7, 0.9].map((p4) => Math.min(c2.durationInFrames - 1, Math.round(p4 * c2.durationInFrames)));
}
async function storyboard(c2, frames) {
  const W = 384, H = Math.round(W * c2.height / c2.width), GAP = 8;
  const tiles = await Promise.all(frames.map((f3) => sharp6(f3.png).resize(W, H).png().toBuffer()));
  const width = tiles.length * W + (tiles.length - 1) * GAP;
  const png = await sharp6({ create: { width, height: H, channels: 3, background: "#ffffff" } }).composite(tiles.map((input, i) => ({ input, left: i * (W + GAP), top: 0 }))).png().toBuffer();
  return { png, width, height: H };
}

// src/versions.ts
import { basename as basename2, extname as extname2, join as join4 } from "node:path";
var renderPath = (project, file) => join4(project, LOCK_DIR, "renders", `${basename2(file, extname2(file))}.png`);

// src/stages.ts
var inProject = (project, file) => isAbsolute(file) ? file : resolve2(project, file);
var shown = (project, file) => {
  const rel2 = relative2(project, file);
  return (rel2.startsWith("..") ? file : rel2).replaceAll("\\", "/");
};
async function runOptions(project, files, size = {}, out) {
  return optionsOf(project, await Promise.all(files.map((f3) => render(inProject(project, f3), size))), out);
}
async function optionsOf(project, rendered, out) {
  const { options, findings } = await compareOptions(rendered);
  let sheet = out ? inProject(project, out) : void 0;
  if (!sheet) {
    await mkdir2(join5(project, LOCK_DIR, "sheets"), { recursive: true });
    sheet = join5(project, LOCK_DIR, "sheets", `options-${stamp()}.png`);
  }
  await contactSheet(rendered, options, sheet);
  const lines = options.map((o) => `  ${o.number}. ${shown(project, o.file)}`);
  const verdict = findings.length ? `${format(findings)}
Redo the options named above, then call this again.` : "The options really differ. Show the person the contact sheet and ask which one, by number.";
  return {
    text: `Contact sheet: ${shown(project, sheet)}
${lines.join("\n")}
${verdict}`,
    findings,
    data: {
      sheet,
      options: options.map(({ number, file, measures: m }) => ({ number, file, subject: m.subject, field: m.field, palette: m.palette.map((s) => s.hex) }))
    }
  };
}
async function runLock(project, file, name, size = {}, style, words, about = {}) {
  return lockOf(project, await render(inProject(project, file), size), name, style, words, about);
}
async function lockOf(project, rendered, name, style, words, about = {}) {
  const m = await measure(rendered.png);
  const path = await writeLock(project, name, rendered, m, style, words, about);
  const lock = await readLock(project, name);
  return {
    text: `Locked "${name}"${style ? ` (${style})` : ""} from ${shown(project, rendered.file)} (${shown(project, path)}): colors ${lock.colors.join(", ")}; fonts ${lock.fonts.join(", ") || "none"}; ${lock.size.width}\xD7${lock.size.height}${lock.words ? `; ${lock.words.length} approved line${lock.words.length === 1 ? "" : "s"} of words` : ""}. Check the finished design with check_design and lock "${name}".`,
    findings: [],
    data: { lock: path }
  };
}
async function runCheck(project, file, lockName, size = {}) {
  const rendered = await render(inProject(project, file), size);
  const lock = lockName ? await readLock(project, lockName) : void 0;
  const r2 = report(shown(project, rendered.file), await check(rendered, await measure(rendered.png), lock));
  const picture = await saveRender(project, rendered.file, rendered.png);
  return { ...r2, text: `${r2.text}
Render: ${shown(project, picture)}
${LOOK}`, data: { ...r2.data, render: picture } };
}
async function saveRender(project, file, png) {
  const picture = renderPath(project, file);
  await mkdir2(dirname2(picture), { recursive: true });
  await writeFile2(picture, png);
  return picture;
}
async function runPreview(project, file, size = {}) {
  const rendered = await render(inProject(project, file), size);
  const picture = await saveRender(project, rendered.file, rendered.png);
  return { text: `Render: ${shown(project, picture)} (${rendered.width}\xD7${rendered.height}). Open it and look.`, findings: [], data: { render: picture } };
}
var LOOK = "Now open the render above and look at it yourself: does each part say its message to someone who doesn't already know it, and can every word be read at phone size? Fix what doesn't; in the design card, name any part that may still not get its message across.";
function report(what2, findings) {
  const errors = findings.filter((f3) => f3.kind === "error").length;
  const suggestions = findings.length - errors;
  const head = findings.length === 0 ? `${what2}: no findings.` : `${what2}: ${errors} to fix, ${suggestions} suggestion${suggestions === 1 ? "" : "s"}.`;
  return { text: findings.length ? `${head}
${format(findings)}` : head, findings, data: {} };
}
async function withVideo(project, entry, run) {
  const remotion = await RemotionProject.open(project, entry);
  try {
    const all = await remotion.compositions();
    const find = (id) => {
      const c2 = all.find((x) => x.id === id);
      if (!c2) throw new Error(`No composition "${id}" in ${entry}. It has: ${all.map((x) => x.id).join(", ")}.`);
      return c2;
    };
    return await run(remotion, find);
  } finally {
    await remotion.close();
  }
}
async function storyboardOf(project, entry, remotion, c2) {
  const frames = await remotion.frames(c2, keyFrames(c2));
  const board = await storyboard(c2, frames);
  return {
    file: `${inProject(project, entry)}#${c2.id}`,
    ...board,
    colors: [...new Set(frames.flatMap((f3) => f3.colors))],
    fonts: [...new Set(frames.flatMap((f3) => f3.fonts))],
    texts: [],
    cut: [],
    panels: [],
    rings: [],
    images: []
  };
}
async function runVideoPreview(project, entry, id, seconds = []) {
  return withVideo(project, entry, async (remotion, find) => {
    const c2 = find(id);
    const at = seconds.length ? seconds.map((s) => Math.max(0, Math.min(c2.durationInFrames - 1, Math.round(s * c2.fps)))) : keyFrames(c2);
    const frames = await remotion.frames(c2, at);
    const png = frames.length === 1 ? frames[0].png : (await storyboard(c2, frames)).png;
    const picture = await saveRender(project, `${c2.id}.png`, png);
    const when = at.map((f3) => `${(f3 / c2.fps).toFixed(2)} s`).join(", ");
    return { text: `Render: ${shown(project, picture)} (${frames.length === 1 ? "the frame" : "frames"} at ${when}). Open it and look.`, findings: [], data: { render: picture } };
  });
}
async function runVideoOptions(project, entry, ids, out) {
  return withVideo(project, entry, async (remotion, find) => {
    const boards = [];
    for (const id of ids) boards.push(await storyboardOf(project, entry, remotion, find(id)));
    return optionsOf(project, boards, out);
  });
}
async function runVideoLock(project, entry, id, name, style, words, about = {}) {
  return withVideo(project, entry, async (remotion, find) => {
    const c2 = find(id);
    return lockOf(project, { ...await storyboardOf(project, entry, remotion, c2), width: c2.width, height: c2.height }, name, style, words, about);
  });
}
async function runVideoCheck(project, entry, id, lockName) {
  const lock = lockName ? await readLock(project, lockName) : void 0;
  return withVideo(project, entry, async (remotion, find) => {
    const c2 = find(id);
    const frames = await remotion.frames(c2, sampleFrames(c2, STEP));
    return report(`${id} (${(c2.durationInFrames / c2.fps).toFixed(1)} s, ${frames.length} frames checked)`, await checkVideo(c2, frames, lock));
  });
}
function stamp() {
  return (/* @__PURE__ */ new Date()).toISOString().replace(/\D/g, "").slice(0, 14);
}

// src/core.ts
async function closeAll() {
  await Promise.all([closeBrowser(), closeRemotion(), closeOcr()]);
}
export {
  closeAll,
  runCheck,
  runLock,
  runOptions,
  runPreview,
  runVideoCheck,
  runVideoLock,
  runVideoOptions,
  runVideoPreview
};
