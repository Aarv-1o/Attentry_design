// Measurements of a rendered design, from its pixels. Each one is something the books name and a
// check can compare: where the subject sits, which value plan it uses, its main colors, how much of
// it is saturated. All colors are handled in OKLab, where distances match what people see.
import sharp from "sharp";
import { converter, formatHex } from "culori";

const toOklab = converter("oklab");

export interface Lab {
  l: number;
  a: number;
  b: number;
}

export interface Swatch {
  hex: string;
  share: number; // of the picture's area, 0..1
  lab: Lab;
}

/** Loomis's four values (Creative Illustration pp. 88–90): the field is the biggest one. */
export type Value = "white" | "light grey" | "dark grey" | "black";

export interface Measures {
  subject: { x: number; y: number }; // contrast-weighted center of mass, 0..1 across the frame
  centered: boolean;
  values: Record<Value, number>; // share of the area in each value band
  field: Value;
  midShare: number; // light grey + dark grey
  palette: Swatch[];
  saturatedShare: number; // share of pixels with OKLCh chroma above SATURATED
  rawPrimaries: string[]; // which of red, yellow, blue appear at full strength over 2% of the area
  thumb: number[]; // 16 × 16 lightness, for comparing layouts
}

const SIDE = 96; // measurements run on a 96 × 96 copy: enough for layout and color, and fast
const SATURATED = 0.12;
const RAW = 0.17;

export async function measure(png: Buffer): Promise<Measures> {
  const pixels = await labPixels(png, SIDE);
  const background = borderColor(pixels, SIDE);
  const subject = centerOfMass(pixels, SIDE, background);
  const values = valueBands(pixels);
  const field = (Object.keys(values) as Value[]).reduce((a, b) => (values[b] > values[a] ? b : a));
  const chroma = pixels.map((p) => Math.hypot(p.a, p.b));
  return {
    subject,
    centered: Math.abs(subject.x - 0.5) < 0.06 && Math.abs(subject.y - 0.5) < 0.08,
    values,
    field,
    midShare: values["light grey"] + values["dark grey"],
    palette: kmeans(pixels, 5),
    saturatedShare: chroma.filter((c) => c > SATURATED).length / pixels.length,
    rawPrimaries: rawPrimaries(pixels),
    thumb: await thumbnail(png),
  };
}

export async function labPixels(png: Buffer, side: number): Promise<Lab[]> {
  const { data } = await sharp(png)
    .flatten({ background: "#ffffff" })
    .resize(side, side, { fit: "fill" })
    .raw()
    .toBuffer({ resolveWithObject: true });
  const out: Lab[] = [];
  for (let i = 0; i < data.length; i += 3) {
    const { l, a, b } = toOklab({ mode: "rgb", r: data[i] / 255, g: data[i + 1] / 255, b: data[i + 2] / 255 });
    out.push({ l, a, b });
  }
  return out;
}

export function distance(p: Lab, q: Lab): number {
  return Math.hypot(p.l - q.l, p.a - q.a, p.b - q.b);
}

/** The background is taken to be the median color along the frame's edge. */
function borderColor(pixels: Lab[], side: number): Lab {
  const edge: Lab[] = [];
  for (let i = 0; i < side; i++) {
    edge.push(pixels[i], pixels[(side - 1) * side + i], pixels[i * side], pixels[i * side + side - 1]);
  }
  const median = (xs: number[]) => xs.sort((a, b) => a - b)[xs.length >> 1];
  return { l: median(edge.map((p) => p.l)), a: median(edge.map((p) => p.a)), b: median(edge.map((p) => p.b)) };
}

/** Where the eye's weight sits: each pixel weighs by how far its color is from the background. */
function centerOfMass(pixels: Lab[], side: number, background: Lab) {
  let sx = 0, sy = 0, sw = 0;
  pixels.forEach((p, i) => {
    const w = distance(p, background) ** 2;
    sx += w * ((i % side) + 0.5);
    sy += w * (Math.floor(i / side) + 0.5);
    sw += w;
  });
  if (sw === 0) return { x: 0.5, y: 0.5 };
  return { x: sx / sw / side, y: sy / sw / side };
}

function valueBands(pixels: Lab[]): Record<Value, number> {
  const bands: Record<Value, number> = { white: 0, "light grey": 0, "dark grey": 0, black: 0 };
  for (const { l } of pixels) {
    bands[l >= 0.82 ? "white" : l >= 0.58 ? "light grey" : l >= 0.34 ? "dark grey" : "black"]++;
  }
  for (const k of Object.keys(bands) as Value[]) bands[k] /= pixels.length;
  return bands;
}

function rawPrimaries(pixels: Lab[]): string[] {
  const hues = { red: 0, yellow: 0, blue: 0 };
  for (const p of pixels) {
    if (Math.hypot(p.a, p.b) < RAW) continue;
    const h = ((Math.atan2(p.b, p.a) * 180) / Math.PI + 360) % 360;
    if (h < 45 || h > 350) hues.red++;
    else if (h >= 85 && h <= 115) hues.yellow++;
    else if (h >= 240 && h <= 285) hues.blue++;
  }
  return Object.entries(hues).filter(([, n]) => n / pixels.length > 0.02).map(([name]) => name);
}

async function thumbnail(png: Buffer): Promise<number[]> {
  return (await labPixels(png, 16)).map((p) => p.l);
}

/**
 * The main colors, by k-means in OKLab. Written by hand: the need is twenty lines, and the
 * libraries for it carry far more than this. Seeded, so the same picture always gives the same
 * palette.
 */
export function kmeans(pixels: Lab[], k: number): Swatch[] {
  let seed = 42;
  const random = () => ((seed = (seed * 1103515245 + 12345) % 2 ** 31) / 2 ** 31);
  // k-means++ start: each new center is picked far from the ones already chosen
  const centers: Lab[] = [pixels[Math.floor(random() * pixels.length)]];
  while (centers.length < k) {
    const d = pixels.map((p) => Math.min(...centers.map((c) => distance(p, c))) ** 2);
    const total = d.reduce((a, b) => a + b, 0);
    if (total === 0) break;
    let r = random() * total, i = 0;
    while ((r -= d[i]) > 0) i++;
    centers.push(pixels[i]);
  }
  let assign = new Array<number>(pixels.length).fill(0);
  for (let iter = 0; iter < 12; iter++) {
    assign = pixels.map((p) => centers.reduce((best, c, j) => (distance(p, c) < distance(p, centers[best]) ? j : best), 0));
    centers.forEach((_, j) => {
      const members = pixels.filter((_, i) => assign[i] === j);
      if (members.length === 0) return;
      const mean = (f: (p: Lab) => number) => members.reduce((s, p) => s + f(p), 0) / members.length;
      centers[j] = { l: mean((p) => p.l), a: mean((p) => p.a), b: mean((p) => p.b) };
    });
  }
  return centers
    .map((lab, j) => ({
      lab,
      share: assign.filter((a) => a === j).length / pixels.length,
      hex: formatHex({ mode: "oklab", ...lab }),
    }))
    .filter((s) => s.share >= 0.005) // small accents count: an orange ball is a color of the design
    .sort((a, b) => b.share - a.share);
}

/** How far apart two palettes are: each color's distance to the nearest in the other, by area. */
export function paletteDistance(a: Swatch[], b: Swatch[]): number {
  const oneWay = (x: Swatch[], y: Swatch[]) =>
    x.reduce((s, c) => s + c.share * Math.min(...y.map((d) => distance(c.lab, d.lab))), 0) /
    x.reduce((s, c) => s + c.share, 0);
  return (oneWay(a, b) + oneWay(b, a)) / 2;
}

/** How alike two layouts are: mean lightness difference of the 16 × 16 thumbnails, 0..1. */
export function layoutDistance(a: number[], b: number[]): number {
  return a.reduce((s, v, i) => s + Math.abs(v - b[i]), 0) / a.length;
}
