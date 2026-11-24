// Checks on a finished video, from frames sampled every quarter second, and the storyboard strip
// that stands for a video in the options stage. The rules and their thresholds come from
// attentry-design-rules.md (R1–R4, T1–T2, L1), measured on 25 gallery videos and 31 more.
import sharp from "sharp";
import type { TextBox } from "./render.ts";
import type { Composition, VideoFrame } from "./remotion.ts";
import { labPixels, layoutDistance } from "./measure.ts";
import { contrastFinding, edge, offLock, pixelEdges, short, tension } from "./check.ts";
import type { DesignLock } from "./lock.ts";
import type { Finding } from "./findings.ts";

export const STEP = 0.25; // seconds between sampled frames (as the baseline was sampled)
const SEEN = 0.95; // opacity from which a text counts as fully shown
const MIN_SIZE = 0.022; // of frame height: 24 px on 1080 (R1)
const CAPTION_SIZE = 0.037; // 40 px on 1080: a caption this big carries the message (R1)
const VIDEO_MARGIN = 0.05; // 54 px on 1080 (L1)
const CROWDED = 15; // texts on screen at once beyond which the frame is texture (a whole IDE)
const BLANK = 0.02; // lightness spread under which a frame shows nothing (T1)
const STILL = 0.003; // mean lightness change under which two frames are the same (T2)
const LONGEST_HOLD = 6; // seconds (T2: the pros' longest hold was 5.8 s)

export async function checkVideo(c: Composition, frames: VideoFrame[], lock?: DesignLock): Promise<Finding[]> {
  const findings: Finding[] = [];
  const picture = (f: VideoFrame) => ({ png: f.png, width: c.width, height: c.height });

  // Each distinct text the viewer is meant to read, with the frames where it's fully shown.
  const texts = new Map<string, { frame: VideoFrame; box: TextBox }[]>();
  frames.forEach((f, i) => {
    const visible = f.texts.filter((t) => t.opacity >= SEEN);
    // A frame crowded with text (a whole IDE, a web page) is texture: only caption-sized text in it
    // carries the message (rules R1, "must not flag").
    const crowded = visible.length > CROWDED;
    for (const t of visible) {
      if (crowded && t.size / c.height < CAPTION_SIZE) continue;
      if ((t.text.match(/[\p{L}\p{N}]/gu) ?? []).length < 2) continue; // a cursor, a lone symbol
      if (inBetween(t, frames[i + 1])) continue; // a typed line or a counter, still changing
      texts.set(t.text, [...(texts.get(t.text) ?? []), { frame: f, box: t }]);
    }
  });

  // R3: each text's longest run of samples where it's shown and holds still. Lines that come on
  // screen together (a title and its subtitle, a card) are read together, so they're timed as one.
  const index = new Map(frames.map((f, i) => [f, i]));
  const runs = [...texts].map(([text, seen]) => ({ text, seen, run: longestStillRun(seen, frames) }))
    .filter((r) => r.run.length > 0)
    .map((r) => ({ ...r, start: index.get(r.run[0].frame)!, end: index.get(r.run.at(-1)!.frame)! }))
    .sort((a, b) => a.start - b.start);
  // Together: it arrives within a second of the group's first line, while all of it is still up,
  // and sits near one of its lines (a footer changing at the same moment isn't part of the card).
  const near = (a: TextBox, b: TextBox) => {
    const gap = Math.max(a.box.y, b.box.y) - Math.min(a.box.y + a.box.height, b.box.y + b.box.height);
    return gap < 2 * Math.max(a.box.height, b.box.height);
  };
  const groups: (typeof runs)[] = [];
  for (const r of runs) {
    const g = groups.find((g) =>
      r.start - g[0].start <= Math.round(1 / STEP) && r.start <= Math.min(...g.map((x) => x.end)) &&
      g.some((x) => near(x.run[0].box, r.run[0].box)));
    if (g) g.push(r);
    else groups.push([r]);
  }
  for (const g of groups) {
    const chars = g.reduce((n, r) => n + r.text.length, 0);
    const needed = Math.max(5 / 6, chars / 17);
    // Readable as a whole from when the group appears to when its first line goes.
    const shown = (Math.min(...g.map((r) => r.end)) - g[0].start + 1) * STEP;
    if (shown >= needed) continue;
    const what = g.length === 1 ? `"${short(g[0].text)}"` : `"${short(g[0].text)}" and ${g.length - 1} more line${g.length === 2 ? "" : "s"} shown with it`;
    findings.push({
      rule: "text-too-brief",
      kind: "error",
      message: `${what}: ${chars} characters readable for about ${shown.toFixed(2)} s; they need ${needed.toFixed(2)} s. Hold longer or say less.`,
      source: "Netflix timed-text guidelines: 17 characters per second, never under 5/6 s",
    });
  }

  const nearEdge: string[] = [];
  for (const [text, seen] of texts) {
    const run = longestStillRun(seen, frames);
    const middle = (run.length ? run : seen)[Math.floor((run.length ? run : seen).length / 2)];

    // R1: too small, unless a big caption in the same frame carries the message.
    const size = middle.box.size / c.height;
    // Small text is texture (code, a UI, logs) when several small pieces sit together and a big
    // caption carries the message; one small line on its own carries a message of its own.
    const visible = middle.frame.texts.filter((t) => t.opacity >= SEEN);
    const texture = visible.some((t) => t.size / c.height >= CAPTION_SIZE) &&
      visible.filter((t) => t.size / c.height < MIN_SIZE).length >= 3;
    if (size < MIN_SIZE && !texture) {
      findings.push({
        rule: "text-too-small",
        kind: "error",
        message: `"${short(text)}" is ${Math.round(middle.box.size)} px tall on a ${c.height} px frame (${(size * 100).toFixed(1)}%); text that carries the message needs about ${Math.round(MIN_SIZE * c.height)} px.`,
        source: "Attentry Design baseline: small text in 17 of 25 gallery videos",
      });
    }
    findings.push(...(await contrastFinding(picture(middle.frame), middle.box)));
    for (const f of edge(picture(middle.frame), middle.box, VIDEO_MARGIN)) {
      if (f.rule === "text-margin") nearEdge.push(text);
      else findings.push(f);
    }
  }
  // Inside the margin isn't cut off: one suggestion for all of it (L1 found cut-off text in 4 of 25).
  if (nearEdge.length) {
    findings.push({
      rule: "text-margin",
      kind: "default",
      message: `${nearEdge.length} text${nearEdge.length === 1 ? "" : "s"} within ${Math.round(VIDEO_MARGIN * Math.min(c.width, c.height))} px of the edge, where platforms crop or overlay: ${nearEdge.map((x) => `"${short(x)}"`).join(", ")}.`,
      source: "Attentry Design rules L1: a 5% margin",
    });
  }

  // Visual tension in any sampled frame, named once per text.
  const tense = new Map<string, Finding>();
  for (const f of frames) {
    const shown = f.texts.filter((t) => t.opacity >= SEEN);
    // Crowded frames (a whole IDE) are texture: only caption-sized text in them counts, as above.
    const crowded = shown.length > CROWDED;
    for (const t of shown.filter((t) => !crowded || t.size / c.height >= CAPTION_SIZE)) {
      const [hit] = tension(f, [t]);
      if (hit && !tense.has(t.text)) tense.set(t.text, { ...hit, message: hit.message.replace(/^"[^"]*"/, `"${short(t.text)}" (at ${f.time.toFixed(1)} s)`) });
    }
  }
  if (tense.size) {
    findings.push({
      rule: "visual-tension",
      kind: "default",
      message: `Text almost touching or crossed by a shape's edge: ${[...tense.values()].map((f) => f.message.split(" almost")[0]).join(", ")}. Give clear room, or let it clearly overlap.`,
      source: "Glitschka, Vector Basic Training pp. 189–191 (visual tension)",
    });
  }

  // R4: fonts.
  const fonts = [...new Set(frames.flatMap((f) => f.fonts))];
  if (fonts.length > 2) {
    findings.push({
      rule: "too-many-fonts",
      kind: "default",
      message: `${fonts.length} font families (${fonts.join(", ")}). Two are usually enough.`,
      source: "Shaw, Design for Motion: no more than a couple of typefaces",
    });
  }

  // T1 and T2, from the frames' lightness.
  const looks = await Promise.all(frames.map(async (f) => (await labPixels(f.png, 32)).map((p) => p.l)));
  findings.push(...blankRuns(looks, frames, c), ...stillRuns(looks, frames));

  if (lock) {
    findings.push(...offLock(frames.flatMap((f) => f.colors), fonts, lock));
    const middle = frames[Math.floor(frames.length / 2)];
    if (middle) findings.push(...(await pixelEdges(picture(middle), lock)));
  }
  return findings;
}

/**
 * A text still on its way to its final form: in the next sample the same spot shows it longer (a
 * line being typed) or shows another number (a counter). Only the final form is judged: R3 counts
 * a typed line from its last letter.
 */
function inBetween(t: TextBox, next: VideoFrame | undefined): boolean {
  if (!next) return false;
  const number = /^[\d.,%\s+-]+$/;
  return next.texts.some((n) =>
    n.text !== t.text &&
    // The same line: a centered line shifts sideways as it grows, so match the row and overlap.
    Math.abs(n.box.y - t.box.y) < 4 && n.box.x < t.box.x + t.box.width && t.box.x < n.box.x + n.box.width &&
    (n.text.startsWith(t.text) || (number.test(n.text) && number.test(t.text))),
  );
}

/** The longest stretch of consecutive samples where the text is shown and doesn't move. */
function longestStillRun(seen: { frame: VideoFrame; box: TextBox }[], frames: VideoFrame[]) {
  const index = new Map(frames.map((f, i) => [f, i]));
  let best: typeof seen = [], run: typeof seen = [];
  for (const s of seen) {
    const prev = run.at(-1);
    const next = prev && index.get(s.frame)! === index.get(prev.frame)! + 1 &&
      Math.abs(s.box.box.x - prev.box.box.x) < 2 && Math.abs(s.box.box.y - prev.box.box.y) < 2;
    run = next ? [...run, s] : [s];
    if (run.length > best.length) best = run;
  }
  return best;
}

function spread(l: number[]): number {
  const mean = l.reduce((a, b) => a + b, 0) / l.length;
  return Math.sqrt(l.reduce((a, b) => a + (b - mean) ** 2, 0) / l.length);
}

/** T1: stretches of frames with nothing in them. */
function blankRuns(looks: number[][], frames: VideoFrame[], c: Composition): Finding[] {
  const end = c.durationInFrames / c.fps;
  // A frame with text on it isn't blank, however small or dark the text.
  const blank = looks.map((l, i) => spread(l) < BLANK && !frames[i].texts.some((t) => t.opacity >= SEEN));
  return runs(blank).flatMap(([a, b]) => {
    const from = frames[a].time, to = frames[b].time + STEP, length = to - from;
    const atEdges = from < 3 || to > end - 1;
    if (length < (atEdges ? 0.5 : 1)) return [];
    return [{
      rule: "blank-frames",
      kind: "error" as const,
      message: `Nothing on screen from ${from.toFixed(2)} s to ${Math.min(to, end).toFixed(2)} s${from < 3 ? ", inside the opening seconds" : to > end - 1 ? ", at the end" : ""}.`,
      source: "Attentry Design baseline: blank frames in 8 of 25 gallery videos",
    }];
  });
}

/** T2: the same frame held for longer than the pros ever hold. */
function stillRuns(looks: number[][], frames: VideoFrame[]): Finding[] {
  const same = looks.map((l, i) => i > 0 && layoutDistance(l, looks[i - 1]) < STILL && spread(l) >= BLANK);
  return runs(same).flatMap(([a, b]) => {
    const length = (b - a + 2) * STEP;
    if (length <= LONGEST_HOLD) return [];
    return [{
      rule: "held-too-long",
      kind: "default" as const,
      message: `The picture doesn't change from ${frames[a - 1].time.toFixed(1)} s to ${frames[b].time.toFixed(1)} s (${length.toFixed(1)} s). Add movement or cut sooner.`,
      source: "Attentry Design baseline: the pros' longest hold was 5.8 s",
    }];
  });
}

/** [first, last] index pairs of each run of true values. */
function runs(flags: boolean[]): [number, number][] {
  const out: [number, number][] = [];
  flags.forEach((on, i) => {
    if (!on) return;
    if (out.length && out.at(-1)![1] === i - 1) out.at(-1)![1] = i;
    else out.push([i, i]);
  });
  return out;
}

/** The key frames at 10, 30, 50, 70 and 90% of a video. */
export function keyFrames(c: Composition): number[] {
  return [0.1, 0.3, 0.5, 0.7, 0.9].map((p) => Math.min(c.durationInFrames - 1, Math.round(p * c.durationInFrames)));
}

/** A storyboard: the key frames side by side in one picture, standing for the video. */
export async function storyboard(c: Composition, frames: VideoFrame[]): Promise<{ png: Buffer; width: number; height: number }> {
  const W = 384, H = Math.round((W * c.height) / c.width), GAP = 8;
  const tiles = await Promise.all(frames.map((f) => sharp(f.png).resize(W, H).png().toBuffer()));
  const width = tiles.length * W + (tiles.length - 1) * GAP;
  const png = await sharp({ create: { width, height: H, channels: 3, background: "#ffffff" } })
    .composite(tiles.map((input, i) => ({ input, left: i * (W + GAP), top: 0 })))
    .png()
    .toBuffer();
  return { png, width, height: H };
}
