import type { ReactElement } from "react";

// A tiny pixel canvas: a grid of palette indices, drawn as crisp SVG rects so every effect sits on
// the same pixel grid (the pixel-art card). Runs of one color in a row become one rect.

export const W = 192;
export const H = 108;
export const SCALE = 10; // 192×108 → 1920×1080

export type Buf = { w: number; h: number; px: Int16Array };
export const TRANSPARENT = -1;

export const buf = (fill = TRANSPARENT, w = W, h = H): Buf => ({ w, h, px: new Int16Array(w * h).fill(fill) });

export const set = (b: Buf, x: number, y: number, c: number) => {
  x = Math.round(x); y = Math.round(y);
  if (c >= 0 && x >= 0 && y >= 0 && x < b.w && y < b.h) b.px[y * b.w + x] = c;
};
export const get = (b: Buf, x: number, y: number) =>
  x >= 0 && y >= 0 && x < b.w && y < b.h ? b.px[y * b.w + x] : TRANSPARENT;

export const rect = (b: Buf, x: number, y: number, w: number, h: number, c: number) => {
  for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) set(b, x + i, y + j, c);
};

export const line = (b: Buf, x0: number, y0: number, x1: number, y1: number, c: number) => {
  const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0), 1);
  for (let k = 0; k <= n; k++) set(b, x0 + ((x1 - x0) * k) / n, y0 + ((y1 - y0) * k) / n, c);
};

type P = [number, number];
export const tri = (b: Buf, a: P, p: P, q: P, c: number) => {
  const [minY, maxY] = [Math.floor(Math.min(a[1], p[1], q[1])), Math.ceil(Math.max(a[1], p[1], q[1]))];
  const [minX, maxX] = [Math.floor(Math.min(a[0], p[0], q[0])), Math.ceil(Math.max(a[0], p[0], q[0]))];
  const side = (u: P, v: P, x: number, y: number) => (v[0] - u[0]) * (y - u[1]) - (v[1] - u[1]) * (x - u[0]);
  for (let y = minY; y <= maxY; y++) for (let x = minX; x <= maxX; x++) {
    const s1 = side(a, p, x + 0.5, y + 0.5), s2 = side(p, q, x + 0.5, y + 0.5), s3 = side(q, a, x + 0.5, y + 0.5);
    if ((s1 >= 0 && s2 >= 0 && s3 >= 0) || (s1 <= 0 && s2 <= 0 && s3 <= 0)) set(b, x, y, c);
  }
};

// Rows of characters; each character maps to a palette index, "." is transparent.
export const sprite = (b: Buf, rows: string[], x: number, y: number, map: Record<string, number>) => {
  rows.forEach((row, j) => [...row].forEach((ch, i) => { if (ch in map) set(b, x + i, y + j, map[ch]); }));
};

// Draws `top` over `base` wherever `top` isn't transparent.
export const over = (base: Buf, top: Buf, dx = 0, dy = 0) => {
  for (let y = 0; y < top.h; y++) for (let x = 0; x < top.w; x++) set(base, x + dx, y + dy, top.px[y * top.w + x]);
};

// Draws `top` rotated by `angle` (radians, positive = nose up for a right-facing sprite) about its
// pivot (px, py), with the pivot landing at (dx, dy). Nearest-neighbour, so pixels stay pixels.
export const overRotated = (base: Buf, top: Buf, px: number, py: number, angle: number, dx: number, dy: number) => {
  const [cos, sin] = [Math.cos(angle), Math.sin(angle)];
  const r = Math.ceil(Math.hypot(top.w, top.h));
  for (let y = -r; y <= r; y++) for (let x = -r; x <= r; x++) {
    // Inverse rotation: where in the sprite does this screen pixel come from?
    const sx = Math.round(px + x * cos - y * sin), sy = Math.round(py + x * sin + y * cos);
    const c = get(top, sx, sy);
    if (c >= 0) set(base, dx + x, dy + y, c);
  }
};

// 2×2 ordered dither: true on half the pixels in a checker, for in-between shades and fades.
const BAYER = [[0, 2], [3, 1]];
export const dither = (x: number, y: number, level: number) => level > (BAYER[y & 1][x & 1] + 0.5) / 4;

// Same input, same output: deterministic noise for flicker and particles.
export const hash = (n: number) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };

// A 5×7 pixel font with just the glyphs the test needs.
const GLYPHS: Record<string, string[]> = {
  R: ["####.", "#...#", "#...#", "####.", "#.#..", "#..#.", "#...#"],
  e: [".....", ".....", ".###.", "#...#", "#####", "#....", ".###."],
  s: [".....", ".....", ".####", "#....", ".###.", "....#", "####."],
  t: ["..#..", "..#..", "#####", "..#..", "..#..", "..#..", "...##"],
  h: ["#....", "#....", "#.##.", "##..#", "#...#", "#...#", "#...#"],
  r: [".....", ".....", "#.##.", "##..#", "#....", "#....", "#...."],
  ".": [".....", ".....", ".....", ".....", ".....", ".##..", ".##.."],
  " ": [".....", ".....", ".....", ".....", ".....", ".....", "....."],
};
// `reveal(x, y)` decides per pixel whether it's drawn yet (for a dithered fade-in).
export const text = (b: Buf, s: string, x: number, y: number, c: number, reveal: (x: number, y: number) => boolean = () => true) => {
  [...s].forEach((ch, k) => (GLYPHS[ch] ?? GLYPHS[" "]).forEach((row, j) => [...row].forEach((v, i) => {
    const px = x + k * 6 + i, py = y + j;
    if (v === "#" && reveal(px, py)) set(b, px, py, c);
  })));
};

export const Pixels = ({ b, palette }: { b: Buf; palette: string[] }) => {
  const rects: ReactElement[] = [];
  for (let y = 0; y < b.h; y++) {
    let x = 0;
    while (x < b.w) {
      const c = b.px[y * b.w + x];
      let n = 1;
      while (x + n < b.w && b.px[y * b.w + x + n] === c) n++;
      if (c >= 0) rects.push(<rect key={`${y}-${x}`} x={x} y={y} width={n} height={1} fill={palette[c]} />);
      x += n;
    }
  }
  return (
    <svg width={b.w * SCALE} height={b.h * SCALE} viewBox={`0 0 ${b.w} ${b.h}`} shapeRendering="crispEdges" style={{ display: "block" }}>
      {rects}
    </svg>
  );
};
