import { useCurrentFrame } from "remotion";
import { buf, dither, get, H, hash, line, over, Pixels, rect, set, sprite, tri, TRANSPARENT, W, type Buf } from "./pixel";

// Prompt: "a 4 s pixel-art dragon flying over a lake at sunset".
// Plain: what the prompt asks for. Directed: the same scene plus what the cards say its elements
// cause (wings + water, anything above water, low sun + water, low sun + object, flying low).

// [color, its reflection on the water] — reflections are darker and less saturated (Water card).
const COLORS: Record<string, [string, string?]> = {
  sky0: ["#2b1d4a", "#1d1838"], sky1: ["#4a2a6a", "#2e2350"], sky2: ["#8a3f6e", "#4f3060"],
  sky3: ["#d0605e", "#74445f"], sky4: ["#f39a5b", "#8f5a58"], sun: ["#ffd98a", "#c9a46a"],
  core: ["#fff3c4", "#d9c79a"], hills: ["#3a2140", "#261833"], cloud: ["#e9a0a0", "#9a6f80"],
  cloudDark: ["#b0708a", "#6e4a66"], water: ["#2a3360"], waterLine: ["#3f4c86"],
  ink: ["#1a1020", "#141020"], body: ["#3b7d5c", "#2c4f48"], belly: ["#8fc77a", "#567a62"],
  wing: ["#2f6a4c", "#26493f"], wingFar: ["#234d3a", "#1c3a32"], eye: ["#ffcc33", "#b08a3a"],
  rim: ["#ffb36b", "#b88060"], ripple: ["#8f9ad0"], spray: ["#dfe6ff"], shadow: ["#1d2347"],
  glitter: ["#ffe6a8"],
};
const NAMES = Object.keys(COLORS);
const PALETTE = [...NAMES.map((n) => COLORS[n][0]), ...NAMES.map((n) => COLORS[n][1] ?? COLORS[n][0])];
const c = (n: string) => NAMES.indexOf(n);
const reflected = (i: number) => (i >= 0 && i < NAMES.length ? i + NAMES.length : i);

const HORIZON = 66;
const SUN = { x: 150, y: 62, r: 9 };
const POSE_FRAMES = 4; // 7.5 drawings a second: stepped, like pixel animation
const CYCLE = POSE_FRAMES * 4; // up, mid, down, mid
const CLIMAX_BEAT = 88; // the strongest down-beat (frame), just before the climb

const BODY = [
  "...................OO...",
  "..................OBBO..",
  ".................OBBEBOO",
  "O..........OOOOOBBBBBBBO",
  "OBO.....OOOBBBBBBBBOOOO.",
  ".OBOOOOOBBBBBBBBBBO.....",
  "..OBBBBBBBbbbbbbBO......",
  "...OOOOOBbbbbbbBO.......",
  "........OOOOOOOO........",
];
const WING_TIPS = { up: [[9, -7], [13, -6]], mid: [[4, -1], [9, -2]], down: [[8, 12], [12, 10]] } as const;
const POSES = ["up", "mid", "down", "mid"] as const;
// The dragon's own buffer has room above its body for the raised wings.
const OY = 10;
const DW = 32, DH = 28;

// The flight path, shared by both versions: in from the left, low over the water, then a climb out.
function dragonAt(f: number) {
  const t = f / 30;
  const x = t < 3 ? -28 + (t - 0.8) * 70 : 126 + (t - 3) * 85;
  const low = 46 + 5 * Math.sin(Math.min(1, Math.max(0, (t - 0.8) / 2.2)) * Math.PI * 0.9);
  const y = t < 3 ? low : low - (t - 3) ** 2 * 75;
  const pose = POSES[Math.floor(f / POSE_FRAMES) % 4];
  const bob = pose === "down" ? -1 : pose === "up" ? 1 : 0; // the wings carry it
  return { x: Math.round(x), y: Math.round(y + bob), pose };
}
// The point on the water under the dragon: lower flight reads as closer, so further down the lake.
const groundY = (y: number) => HORIZON + 4 + Math.max(0, y - 40) * 0.7;

function drawDragon(f: number, directed: boolean): Buf {
  const d = buf(TRANSPARENT, DW, DH);
  const { pose } = dragonAt(f);
  const [near, far] = WING_TIPS[pose];
  const S: [number, number] = [13, 4 + OY];
  tri(d, [15, 4 + OY], [10, 4 + OY], [far[0], far[1] + OY], c("wingFar"));
  sprite(d, BODY, 0, OY, { O: c("ink"), B: c("body"), b: c("belly"), E: c("eye") });
  tri(d, S, [7, 5 + OY], [near[0], near[1] + OY], c("wing"));
  line(d, S[0], S[1], near[0], near[1] + OY, c("ink"));
  if (directed) {
    // Low sun on the right: a warm rim on every edge facing it (low sun + object).
    const rim: [number, number][] = [];
    for (let y = 0; y < DH; y++) for (let x = 0; x < DW; x++) {
      const p = get(d, x, y);
      if (p >= 0 && p !== c("ink") && p !== c("eye") && get(d, x + 1, y) === TRANSPARENT) rim.push([x, y]);
    }
    rim.forEach(([x, y]) => set(d, x, y, c("rim")));
  }
  return d;
}

function sky(b: Buf, f: number, directed: boolean) {
  const bands = ["sky0", "sky1", "sky2", "sky3", "sky4"], edges = [0, 15, 29, 43, 55, HORIZON];
  for (let y = 0; y < HORIZON; y++) {
    const k = edges.findIndex((e, i) => y >= e && y < edges[i + 1]);
    const into = (y - edges[k]) / (edges[k + 1] - edges[k]);
    for (let x = 0; x < W; x++) set(b, x, y, c(bands[Math.min(4, k + (into > 0.75 && dither(x, y, (into - 0.75) * 4) ? 1 : 0))]));
  }
  for (let y = SUN.y - SUN.r; y < HORIZON; y++) for (let x = SUN.x - SUN.r; x <= SUN.x + SUN.r; x++) {
    const r = Math.hypot(x - SUN.x, y - SUN.y);
    if (r <= SUN.r) set(b, x, y, c(r < SUN.r * 0.55 ? "core" : "sun"));
  }
  for (let x = 0; x < 70; x++) for (let y = Math.round(60 + 3 * Math.sin(x / 9) + 2 * Math.sin(x / 4)); y < HORIZON; y++) set(b, x, y, c("hills"));
  // Clouds drift slowly left; lit from below by the sun when directed.
  [[30, 20, 26], [110, 34, 34], [170, 14, 22]].forEach(([cx, cy, w], i) => {
    const x0 = Math.round(cx - (f / 30) * (3 + i) );
    rect(b, x0, cy, w, 2, c("cloud"));
    rect(b, x0 + 4, cy - 1, w - 10, 1, c("cloud"));
    rect(b, x0 + 2, cy + 2, w - 4, 1, c(directed ? "sun" : "cloudDark"));
  });
}

function lake(b: Buf, f: number, directed: boolean, dragon: { x: number; y: number }, dragonBuf: Buf) {
  for (let y = HORIZON; y < H; y++) {
    const depth = y - HORIZON;
    for (let x = 0; x < W; x++) {
      if (!directed) {
        set(b, x, y, c(hash(Math.floor(x / 14) * 31 + y) > 0.93 ? "waterLine" : "water"));
        continue;
      }
      // The water mirrors the sky and sun, broken into stripes by small waves, more broken closer.
      const shift = Math.round(Math.sin(depth * 0.9 + f * 0.25) * (1 + depth / 14));
      // Breaks are short dashes, longer and more frequent closer to the viewer.
      const broken = hash(Math.floor((x + depth * 3) / (6 + depth / 3)) * 17 + y * 7 + Math.floor(f / 3)) < 0.1 + depth / 160;
      const src = get(b, x + shift, HORIZON - 1 - depth);
      set(b, x, y, broken || src < 0 ? c("water") : reflected(src));
      // A low sun lays a flickering glitter path toward the viewer.
      if (Math.abs(x - SUN.x) < 3 + depth / 3 && hash(x * 13 + y * 7 + Math.floor(f / 3)) > 0.86) set(b, x, y, c("glitter"));
    }
  }
  if (!directed) return;
  const gy = groundY(dragon.y);
  const low = dragon.y > 38;
  // The dragon's shadow on the water, away from the sun, only while it flies low.
  if (low) for (let x = -9; x <= 9; x++) for (let y = -1; y <= 1; y++) {
    if ((x / 9) ** 2 + y ** 2 <= 1 && dither(dragon.x + 8 + x, Math.round(gy) + y, 0.75)) set(b, dragon.x + 8 + x, Math.round(gy) + y, c("shadow"));
  }
  // Its reflection, mirrored about the water under it, broken the same way.
  for (let y = 0; y < DH; y++) for (let x = 0; x < DW; x++) {
    const p = get(dragonBuf, x, y);
    if (p < 0) continue;
    const ry = Math.round(2 * gy - (dragon.y - OY + y));
    const depth = ry - HORIZON;
    const rx = dragon.x + x;
    if (ry <= HORIZON || ry >= H || hash(Math.floor((rx + depth * 3) / (6 + depth / 3)) * 17 + ry * 7 + Math.floor(f / 3)) < 0.1 + depth / 160) continue;
    set(b, dragon.x + x + Math.round(Math.sin(depth * 0.9 + f * 0.25)), ry, reflected(p));
  }
}

// Every down-beat pushes air down: a ring of ripples on the water under it (wings + water).
function ripples(b: Buf, f: number) {
  for (let beat = CYCLE / 2; beat <= f; beat += CYCLE) {
    const at = dragonAt(beat);
    const age = (f - beat) / 30;
    if (at.y <= 38 || age > 1.1 || at.x < -20) continue;
    const big = beat === CLIMAX_BEAT ? 1.6 : 1;
    const rx = (2 + age * 16) * big, ry = rx / 4, cx = at.x + 12, cy = groundY(at.y);
    for (let a = 0; a < Math.PI * 2; a += 0.04) {
      const x = Math.round(cx + Math.cos(a) * rx), y = Math.round(cy + Math.sin(a) * ry);
      if (y > HORIZON && dither(x, y, 1 - age / 1.1)) set(b, x, y, c("ripple"));
    }
  }
}

// The strongest beat throws spray that falls back.
function spray(b: Buf, f: number) {
  const age = (f - CLIMAX_BEAT) / 30;
  if (age < 0 || age > 0.9) return;
  const at = dragonAt(CLIMAX_BEAT), gy = groundY(at.y);
  for (let i = 0; i < 14; i++) {
    const vx = (hash(i) - 0.5) * 40, vy = -30 - hash(i + 9) * 25;
    const x = at.x + 12 + vx * age, y = gy + vy * age + 60 * age * age;
    if (y < gy + 1) set(b, x, y, c("spray"));
  }
}

export const Dragon = ({ directed }: { directed: boolean }) => {
  const f = useCurrentFrame();
  const b = buf();
  sky(b, f, directed);
  const at = dragonAt(f);
  const d = drawDragon(f, directed);
  lake(b, f, directed, at, d);
  if (directed) { ripples(b, f); spray(b, f); }
  over(b, d, at.x, at.y - OY);
  return <Pixels b={b} palette={PALETTE} />;
};
