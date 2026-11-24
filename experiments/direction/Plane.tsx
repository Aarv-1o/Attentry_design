import { useCurrentFrame } from "remotion";
import { buf, dither, H, hash, line, overRotated, Pixels, rect, set, tri, W, type Buf } from "./pixel";

// Prompt: "a 4 s pixel-art plane taking off".
// Plain: what the prompt asks for. Directed: the same scene plus the cards (aircraft taking off,
// jet engines, vehicle lights, runways at dusk, speed and the camera, and their pairs).

const PALETTE = [
  "#141a3a", "#2a2a5a", "#5a3a6a", "#c0607a", "#f0a070", // 0-4 dusk sky, top → horizon
  "#dfe4ff", "#1c1f38", "#12142a", "#ffd27a", "#10122a", // 5-9 star, far city, near city, city window, tower
  "#2e3038", "#6a6870", "#c8c8c0", "#16261c", "#2a3a24", // 10-14 runway, runway lit, marking, grass, grass lit
  "#ffe9a0", "#6a6040", // 15-16 edge light, its glow
  "#e8ecf2", "#a8b0bc", "#1a1c26", "#ffd27a", "#2f6fd8", "#8a92a0", "#2a2c34", // 17-23 plane: body, shade, outline, lit window, tail, engine, gear
  "#ff3b30", "#ffffff", "#fff2c0", "#1c1e24", "#8a8070", "#6a7a90", // 24-29 red light, strobe, landing light, shadow, dust, unlit window
];
const RUNWAY_TOP = 80, RUNWAY_BOTTOM = 87;
const LIFTOFF = 2.3; // seconds: the main wheels leave the ground
const PITCH = 0.16; // radians of nose-up in the climb (about 9°)

const smooth = (a: number, b: number, t: number) => { const k = Math.min(1, Math.max(0, (t - a) / (b - a))); return k * k * (3 - 2 * k); };

// The plane in its own buffer, facing right. The pivot is the bottom of the main wheels.
const PIVOT: [number, number] = [21, 17];
function drawPlane(f: number, gear: number, directed: boolean): Buf {
  const p = buf(-1, 50, 22);
  rect(p, 4, 6, 42, 5, 17);
  rect(p, 4, 10, 42, 1, 18);
  line(p, 6, 5, 42, 5, 19); line(p, 6, 11, 42, 11, 19);
  rect(p, 45, 7, 2, 3, 17); set(p, 47, 8, 17); set(p, 47, 7, 19); set(p, 47, 9, 19);
  rect(p, 43, 7, 2, 1, 19); // cockpit
  for (let x = 10; x <= 40; x += 3) set(p, x, 7, directed ? 20 : 29); // windows, lit at dusk when directed
  tri(p, [4, 6], [11, 6], [4, 0], 21); line(p, 4, 0, 11, 6, 19); // tail fin
  line(p, 1, 8, 8, 8, 18); // stabilizer
  tri(p, [16, 10], [31, 10], [20, 13], 18); // wing
  rect(p, 18, 11, 7, 3, 22); line(p, 25, 11, 25, 13, 19); // engine
  // Landing gear: struts that fold up into the body as `gear` goes from 1 to 0.
  const strut = Math.round(5 * gear);
  if (strut > 0) {
    [21, 41].forEach((x) => {
      line(p, x, 11, x, 11 + strut, 23);
      rect(p, x - 1, 11 + strut, 2, 1, 23);
    });
  }
  if (directed) {
    if (f % 30 < 4) { set(p, 25, 4, 24); set(p, 30, 12, 24); } // red beacon, about once a second
    set(p, 19, 13, 24); // red navigation light on the left wingtip
    if (f % 30 < 2 || (f % 30 >= 6 && f % 30 < 8)) set(p, 18, 13, 25); // white strobe, double flash
  }
  return p;
}

// Where everything is at frame f: simulated frame by frame so speed, camera and climb stay in step.
function state(f: number, directed: boolean) {
  let worldX = 0, screenX = directed ? 40 : -30, scroll = 0;
  for (let k = 0; k < f; k++) {
    const t = k / 30, v = 10 + 22 * t;
    // Directed: the camera follows the plane, then eases to a stop around lift-off (speed card).
    const follow = directed ? 1 - smooth(1.9, 2.8, t) : 0;
    worldX += v / 30; scroll += (v * follow) / 30; screenX += (v * (1 - follow)) / 30;
  }
  const t = f / 30;
  const air = Math.max(0, t - LIFTOFF);
  const alt = 22 * air * air + 6 * air;
  // Directed: the nose lifts first, pivoting on the main wheels, before they leave the ground.
  // Plain: the whole plane lifts and tilts together.
  const pitch = directed ? PITCH * smooth(1.8, 2.45, t) : PITCH * smooth(2.0, 2.8, t);
  const gear = directed ? 1 - smooth(2.7, 3.1, t) : 1;
  const shake = directed && t < LIFTOFF && hash(Math.floor(f / 2)) < 0.35 ? -1 : 0;
  return { t, screenX, scroll, alt, pitch, gear, shake, onGround: t < LIFTOFF };
}

function background(b: Buf, scroll: number, directed: boolean) {
  const edges = [0, 18, 36, 52, 64, RUNWAY_TOP];
  for (let y = 0; y < RUNWAY_TOP; y++) {
    const k = edges.findIndex((e, i) => y >= e && y < edges[i + 1]);
    const into = (y - edges[k]) / (edges[k + 1] - edges[k]);
    for (let x = 0; x < W; x++) set(b, x, y, Math.min(4, k + (into > 0.8 && dither(x, y, (into - 0.8) * 5) ? 1 : 0)));
  }
  for (let i = 0; i < 18; i++) set(b, hash(i) * W, hash(i + 40) * 30, 5);
  // Far city barely moves, the tower a little more: the nearer, the faster (parallax).
  const far = directed ? scroll * 0.06 : 0;
  for (let x = 0; x < W; x++) {
    const wx = Math.floor(x + far);
    const top = 66 - Math.floor(hash(Math.floor(wx / 7)) * 9);
    for (let y = top; y < RUNWAY_TOP; y++) {
      const window = (wx % 3 === 1) && (y % 3 === 0) && hash(wx * 7 + y) > 0.55;
      set(b, x, y, window ? 8 : 6);
    }
  }
  const towerX = Math.round(150 - (directed ? scroll * 0.3 : 0)) % (W + 40);
  rect(b, towerX, 54, 3, 26, 9); rect(b, towerX - 3, 50, 9, 5, 9); set(b, towerX + 1, 49, 24);
}

function runway(b: Buf, scroll: number, directed: boolean) {
  for (let y = RUNWAY_TOP; y < H; y++) for (let x = 0; x < W; x++) set(b, x, y, y <= RUNWAY_BOTTOM ? 10 : 13);
  const off = Math.floor(scroll) % 20;
  for (let x = -20; x < W + 20; x += 20) rect(b, x - off, 84, 10, 1, 12);
  if (!directed) return;
  // Edge lights in rows, rushing past while the camera follows (runways at dusk).
  const loff = Math.floor(scroll) % 16;
  for (let x = -16; x < W + 16; x += 16) {
    [RUNWAY_TOP, RUNWAY_BOTTOM].forEach((y) => { set(b, x - loff, y, 15); set(b, x - loff, y + 1, 16); });
  }
}

export const Plane = ({ directed }: { directed: boolean }) => {
  const f = useCurrentFrame();
  const s = state(f, directed);
  const b = buf();
  background(b, s.scroll, directed);
  runway(b, s.scroll, directed);
  // Screen position of the main wheels.
  const wheelX = Math.round(s.screenX + PIVOT[0]), wheelY = RUNWAY_TOP + 5 - Math.round(s.alt) + s.shake;
  if (directed) {
    // The shadow on the runway, shrinking and fading as it climbs.
    const fade = 1 - s.alt / 30;
    if (fade > 0) for (let x = -20; x <= 20; x++) {
      const sx = wheelX + 4 + x + Math.round(s.alt * 0.4), sy = RUNWAY_BOTTOM - 1;
      if (Math.abs(x) < 20 * (1 - s.alt / 60) && dither(sx, sy, fade * 0.8)) set(b, sx, sy, 27);
    }
    // The landing light lights the runway ahead of the nose, falling off with distance.
    // A wedge: narrow at the nose, widening and fading with distance, on the runway's middle.
    const noseX = wheelX + 20, reach = 44 * (1 - s.alt / 25), mid = (RUNWAY_TOP + RUNWAY_BOTTOM) / 2;
    for (let d = 3; d < reach; d++) {
      const half = 0.5 + (d / reach) * 3;
      for (let y = Math.ceil(mid - half); y <= Math.floor(mid + half); y++) {
        if (y > RUNWAY_TOP && y < RUNWAY_BOTTOM && dither(noseX + d, y, (1 - d / reach) * 0.85)) set(b, noseX + d, y, 11);
      }
    }
    // Heat shimmer behind the engine: the background behind it wobbles.
    const src = Int16Array.from(b.px);
    const ex = wheelX - 4, ey = wheelY - 5 - Math.round(s.pitch * 10);
    for (let d = 1; d < 26; d++) for (let y = -1 - d / 8; y <= 1 + d / 8; y++) {
      const x = ex - d, yy = Math.round(ey + y + d * s.pitch);
      const shift = hash(x * 3 + yy * 11 + Math.floor(f / 2)) < 0.5 ? -1 : 1;
      if (x >= 1 && x < W - 1 && yy >= 0 && yy < H) b.px[yy * W + x] = src[yy * W + x + shift];
    }
    // Dust blown back off the runway while it rolls at power.
    if (s.onGround) for (let i = 0; i < 12; i++) {
      const age = ((s.t + i * 0.05) % 0.6) / 0.6;
      const x = wheelX - 6 - age * 30 - hash(i) * 4, y = RUNWAY_TOP + 4 - age * 4 - hash(i + 3) * 2;
      if (dither(Math.round(x), Math.round(y), (1 - age) * 0.8)) set(b, x, y, 28);
    }
  }
  const plane = drawPlane(f, s.gear, directed);
  // Plain tilts about the middle of the fuselage; directed pivots on the main wheels.
  const pivot: [number, number] = directed ? PIVOT : [25, 8];
  const at: [number, number] = directed ? [wheelX, wheelY] : [wheelX + 4, wheelY - 9];
  overRotated(b, plane, pivot[0], pivot[1], s.pitch, at[0], at[1]);
  return <Pixels b={b} palette={PALETTE} />;
};
