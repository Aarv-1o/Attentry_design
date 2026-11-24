import { interpolate, useCurrentFrame } from "remotion";
import { buf, dither, H, hash, line, Pixels, set, text, tri, W, type Buf } from "./pixel";

// Prompt: "a 4 s pixel-art campsite at night with a campfire and the text 'Rest here.'".
// Plain: what the prompt asks for. Directed: the same scene plus the cards (fire, night, smoke,
// embers, wind, text in a scene, and the pair fire + night).

const PALETTE = [
  "#0b1026", "#16224a", "#e8ecff", "#7f8ac0", // 0-3 sky, stars
  "#0a1420", "#3a2a22", // 4-5 trees: night, lit edge
  "#141c2c", "#2a2630", "#5a3a2a", "#a0623a", // 6-9 ground: night → bright
  "#2b4a66", "#141c30", "#9a5a34", "#d38a4a", "#0a0e18", // 10-14 tent: plain canvas, dark side, lit, bright, outline
  "#d8452b", "#f28c28", "#ffd35a", "#fff4c2", "#3a2414", "#7a4a24", // 15-20 flames, logs
  "#4a4e5c", "#6c7080", "#ffb040", // 21-23 smoke, ember
  "#ffc78a", "#0d121e", // 24-25 warm text, shadow
];
const GROUND = 74;
const FIRE = { x: 122, y: 84 }; // the base of the flames
const TENT = { left: 56, right: 92, base: 86, apex: [74, 62] as [number, number] };

// Firelight wobbles irregularly, stepped at 12 a second, with an occasional flare (Fire card).
const flicker = (f: number) => {
  const s = Math.floor(f / 2.5);
  return 1 + 0.07 * Math.sin(s * 1.9) + 0.05 * Math.sin(s * 3.7 + 1) + (hash(s) > 0.9 ? 0.14 : 0);
};
// Light falls off with the square of the distance, spread wider than tall on the ground plane.
const light = (f: number, x: number, y: number) =>
  (flicker(f) * 900) / ((x - FIRE.x) ** 2 + ((y - FIRE.y) * 1.8) ** 2 + 60);
// Picks a step of a 4-color ramp for a light value, dithering between steps.
const ramp = (x: number, y: number, l: number, steps: number[]) => {
  const t = [0.35, 0.9, 2.2];
  let k = t.findIndex((v) => l < v);
  if (k < 0) k = 3;
  const lo = k === 0 ? 0 : t[k - 1], hi = t[k] ?? lo * 2;
  const into = (l - lo) / (hi - lo);
  return steps[Math.min(3, k + (k < 3 && into > 0.6 && dither(x, y, (into - 0.6) * 2.5) ? 1 : 0))];
};

function sky(b: Buf, f: number, directed: boolean) {
  // Two bands with a short dithered step between them.
  for (let y = 0; y < GROUND; y++) for (let x = 0; x < W; x++) set(b, x, y, y > 56 || (y > 52 && dither(x, y, (y - 52) / 4)) ? 1 : 0);
  for (let i = 0; i < 40; i++) {
    const x = Math.floor(hash(i) * W), y = Math.floor(hash(i + 50) * 56);
    // A few stars twinkle, one at a time; most stay still (Moon / night card).
    const twinkle = directed && i % 7 === 0 && Math.floor(f / 6 + i) % 5 === 0;
    set(b, x, y, twinkle ? 3 : i % 3 === 0 ? 3 : 2);
  }
}

function trees(b: Buf, f: number, directed: boolean) {
  const pines: [number, number][] = [[8, 30], [22, 40], [160, 34], [178, 26], [190, 38]];
  pines.forEach(([cx, top]) => {
    for (let y = top; y < GROUND + 4; y++) {
      const half = Math.round(((y - top) / (GROUND - top)) * 9) + 1;
      for (let x = cx - half; x <= cx + half; x++) {
        // The side facing the fire catches a little of its light.
        // Only the lower branches facing the fire catch its light.
        const lit = directed && x >= cx + half - 1 && y > GROUND - 10 && light(f, x, y) > 0.15;
        set(b, x, y, lit ? 5 : 4);
      }
    }
  });
}

function ground(b: Buf, f: number, directed: boolean) {
  for (let y = GROUND; y < H; y++) for (let x = 0; x < W; x++) {
    set(b, x, y, directed ? ramp(x, y, light(f, x, y), [6, 7, 8, 9]) : 7);
  }
  if (!directed) return;
  // The tent's shadow, away from the fire, stretching with the flicker; visible only where lit.
  const len = 26 * flicker(f);
  const dx = TENT.left - FIRE.x, dy = TENT.base - FIRE.y, n = Math.hypot(dx, dy);
  const [ux, uy] = [dx / n, (dy / n) * 0.4];
  const far: [number, number][] = [[TENT.left + ux * len, TENT.base + uy * len], [TENT.apex[0] + ux * len * 1.6, TENT.base + 1]];
  const tmp = buf();
  tri(tmp, [TENT.left, TENT.base], [TENT.right - 4, TENT.base], far[0], 25);
  tri(tmp, [TENT.left, TENT.base], far[0], far[1], 25);
  for (let y = GROUND; y < H; y++) for (let x = 0; x < W; x++) {
    if (tmp.px[y * W + x] === 25 && light(f, x, y) > 0.3) set(b, x, y, 25);
  }
}

function tent(b: Buf, f: number, directed: boolean) {
  const [ax, ay] = TENT.apex;
  for (let y = ay; y <= TENT.base; y++) {
    const t = (y - ay) / (TENT.base - ay);
    const l = Math.round(ax - (ax - TENT.left) * t), r = Math.round(ax + (TENT.right - ax) * t);
    for (let x = l; x <= r; x++) {
      if (!directed) { set(b, x, y, 10); continue; }
      // Lit only on the side facing the fire; the far side stays in the night color.
      set(b, x, y, x <= ax ? 11 : ramp(x, y, light(f, x, y) * 4, [11, 10, 12, 13]));
    }
  }
  // Door: a dark triangle in the middle.
  tri(b, [ax, ay + 8], [ax - 6, TENT.base], [ax + 6, TENT.base], 14);
  line(b, ax, ay, TENT.left, TENT.base, 14);
  line(b, ax, ay, TENT.right, TENT.base, 14);
}

function fire(b: Buf, f: number) {
  const step = Math.floor(f / 2.5);
  line(b, FIRE.x - 7, FIRE.y + 2, FIRE.x + 7, FIRE.y - 1, 19);
  line(b, FIRE.x - 7, FIRE.y - 1, FIRE.x + 7, FIRE.y + 2, 20);
  const layers: [number, number, number][] = [[15, 7, 15], [16, 5, 11], [17, 3, 7], [18, 1, 3]];
  layers.forEach(([col, half, height]) => {
    for (let k = -1; k <= 1; k++) {
      const h = height * (0.75 + 0.35 * hash(step * 3 + k + col));
      tri(b, [FIRE.x + k * half - half, FIRE.y], [FIRE.x + k * half + half, FIRE.y], [FIRE.x + k * (half / 2) + (hash(step + k) - 0.5) * 2, FIRE.y - h], col);
    }
  });
}

// Thin smoke rising and widening, drifting right with the wind, fading as it goes.
function smoke(b: Buf, f: number) {
  for (let i = 0; i < 26; i++) {
    const age = ((f / 30 + i * 0.13) % 3.2);
    const x = FIRE.x + age * 7 + Math.sin(age * 2.6 + i) * (1 + age), y = FIRE.y - 13 - age * 13;
    const fade = 1 - age / 3.2, size = 1 + Math.floor(age);
    for (let k = 0; k < size; k++) for (let j = 0; j < Math.min(size, 2); j++) {
      if (dither(Math.round(x + k), Math.round(y + j), fade)) set(b, x + k, y + j, age < 1.2 ? 22 : 21);
    }
  }
}

// A few embers: rise fast, wander, die out well before the top.
function embers(b: Buf, f: number) {
  for (let i = 0; i < 5; i++) {
    const age = ((f / 30 + i * 0.27) % 1.3);
    const x = FIRE.x + (hash(i) - 0.5) * 8 + Math.sin(age * 9 + i) * 2, y = FIRE.y - 8 - age * 24;
    if (dither(Math.round(x), Math.round(y), 1 - age / 1.3)) set(b, x, y, 23);
  }
}

const LINE = "Rest here.";

export const Campsite = ({ directed }: { directed: boolean }) => {
  const f = useCurrentFrame();
  const b = buf();
  sky(b, f, directed);
  trees(b, f, directed);
  ground(b, f, directed);
  tent(b, f, directed);
  fire(b, f);
  if (directed) {
    smoke(b, f);
    embers(b, f);
    // The text sits in the dark sky, away from the fire, in the fire's warm color, on the same
    // pixel grid, and arrives slowly with the calm of the scene (Text in a scene card).
    const level = interpolate(f, [30, 66], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    text(b, LINE, 16, 18, 24, (x, y) => dither(x, y, level));
  }
  const plainText = interpolate(f, [15, 24], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <div style={{ position: "relative" }}>
      <Pixels b={b} palette={PALETTE} />
      {!directed && (
        <div style={{ position: "absolute", top: 90, left: 0, right: 0, textAlign: "center", color: "#ffffff", fontFamily: "Arial, sans-serif", fontSize: 96, fontWeight: 700, opacity: plainText }}>
          {LINE}
        </div>
      )}
    </div>
  );
};

