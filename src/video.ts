// Checks on a finished video, from frames sampled every quarter second, and the storyboard strip
// that stands for a video in the options stage. The rules and their thresholds come from
// attentry-design-rules.md (R1–R4, T1–T3, L1, S1), measured on 25 gallery videos and 31 more.
import sharp from "sharp";
import type { Box, TextBox } from "./render.ts";
import type { Composition, VideoFrame } from "./remotion.ts";
import { labPixels, layoutDistance } from "./measure.ts";
import { contrastFinding, edge, offLock, pixelEdges, scriptLine, short, sizeSteps, tension, wordsOf } from "./check.ts";
import { findLettering } from "./lettering.ts";
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
// T3: mean lightness change per sample, outside changing text, of a picture mid-move. Calibrated on
// our videos: AttentryLoop's caption during a camera move 0.021, kinetic hook words 0.011, the
// explainer's captions arriving with their pictures 0.003 or less.
const MOVING = 0.015;
const ONGOING = 2; // seconds after a text arrives: moving through half of them, it's footage, not a move

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

  // R4: sizes, each text at its size while it holds still (a camera zoom passes through every size).
  const sizeOf = new Map([...texts].map(([text, seen]) => {
    const run = longestStillRun(seen, frames);
    return [text, (run.length ? run : seen)[0].box.size];
  }));
  findings.push(...sizeSteps(sizeOf, frames.map((f) => [...new Set(f.texts.map((t) => t.text).filter((t) => sizeOf.has(t)))])));

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

  // T1, T2 and T3, from the frames' lightness.
  const looks = await Promise.all(frames.map(async (f) => (await labPixels(f.png, GRID)).map((p) => p.l)));
  findings.push(...blankRuns(looks, frames, c), ...stillRuns(looks, frames), ...arrivesMidMove(texts, frames, looks, c));

  findings.push(...callToAction(c, frames), ...(await letteringInImages(c, frames)));

  if (lock) {
    findings.push(...offLock(frames.flatMap((f) => f.colors), fonts, lock));
    findings.push(...approvedScript(lock, frames));
    const middle = frames[Math.floor(frames.length / 2)];
    if (middle) findings.push(...(await pixelEdges(picture(middle), lock)));
  }
  return findings;
}

const END_SECONDS = 3; // the end a viewer acts on (S1)
// A next step: a link or domain, a handle, or the words that ask for one.
const NEXT_STEP = /([\w-]+\.(com|org|io|dev|app|ai|co|net|gg|so)\b|https?:|@\w|\b(install|download|get it|try|visit|sign up|join|search|subscribe|follow|buy|order|book|start|link in)\b)/i;

/**
 * S1: a promo ends on what to do next, and the next step isn't the smallest thing on the end card
 * (Hitchcock's rule: an element's size in the frame matches its importance). A video that ends on a
 * logo with no text is a brand ending and isn't flagged.
 */
function callToAction(c: Composition, frames: VideoFrame[]): Finding[] {
  const end = c.durationInFrames / c.fps;
  const last = frames.filter((f) => f.time >= end - END_SECONDS);
  // The end card: the last frames' fullest moment.
  const card = last.map((f) => f.texts.filter((t) => t.opacity >= SEEN && (t.text.match(/[\p{L}\p{N}]/gu) ?? []).length >= 2))
    .reduce<TextBox[]>((a, b) => (b.length > a.length ? b : a), []);
  if (!card.length) return [];
  const next = card.filter((t) => NEXT_STEP.test(t.text));
  if (!next.length) {
    return [{
      rule: "no-call-to-action",
      kind: "default",
      message: `The last ${END_SECONDS} s have text but no next step (a link, a store name, "install", "try"). If the video should bring a visit or an install, end on it; a brand film can end on its logo.`,
      source: "Attentry Design rules S1: no call to action in 2 of 7 gallery promos",
    }];
  }
  const others = card.filter((t) => !next.includes(t));
  const biggest = Math.max(...next.map((t) => t.size));
  if (others.length >= 2 && others.every((t) => t.size > biggest)) {
    return [{
      rule: "call-to-action-smallest",
      kind: "default",
      message: `The next step, "${short(next[0].text)}", is the smallest text on the end card (${Math.round(biggest)} px). Make it the second biggest thing there.`,
      source: "Hitchcock's rule: an object's size in the frame should match its importance (Attentry Design rules S1)",
    }];
  }
  return [];
}

/**
 * The approved script, held against the video: each line is on screen (all its words at once), in
 * the approved order, and for as long as approved when the line says ("line | 3s").
 */
function approvedScript(lock: DesignLock, frames: VideoFrame[]): Finding[] {
  if (!lock.words?.length) return [];
  const words = frames.map((f) => new Set(f.texts.filter((t) => t.opacity >= SEEN).flatMap((t) => wordsOf(t.text))));
  const everywhere = new Set(words.flatMap((w) => [...w]));
  const missing: string[] = [], brief: string[] = [], first: { line: string; at: number }[] = [];
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
      const longest = runs(on).reduce((m, [a, b]) => Math.max(m, (b - a + 1) * STEP), 0);
      if (longest < seconds * 0.8) brief.push(`"${short(text)}" is up ${longest.toFixed(1)} s of the ${seconds} s approved`);
    }
  }
  const out: Finding[] = [];
  const source = `the script approved in the "${lock.name}" lock`;
  if (missing.length) out.push({ rule: "approved-words", kind: "error", message: `Approved lines missing from the video: ${missing.join("; ")}. Put them in, or ask before changing them.`, source });
  if (brief.length) out.push({ rule: "script-timing", kind: "error", message: `Shorter than the approved script: ${brief.join("; ")}.`, source });
  const swapped = first.slice(1).flatMap((l, i) => (l.at < first[i].at ? [`"${short(l.line)}" comes before "${short(first[i].line)}"`] : []));
  if (swapped.length) out.push({ rule: "script-order", kind: "error", message: `Lines out of the approved order: ${swapped.join("; ")}.`, source });
  return out;
}

const TEXTURE_LINES = 5; // lines of lettering beyond which a picture is texture (a UI, a page)
const OCR_RUNS = 20; // at most this many pictures read per video: OCR takes about a second each

/**
 * Lettering inside pictures in the video (a generated image, a photo, a video clip): only pixels,
 * so OCR reads it, about once a second, skipping a picture that hasn't changed since it was read.
 * Embedded UI (data-embed) isn't a picture here. Cut-off and too-small lettering are named once.
 */
async function letteringInImages(c: Composition, frames: VideoFrame[]): Promise<Finding[]> {
  const every = Math.round(1 / STEP);
  const jobs = frames.filter((f, i) => i % every === 0).flatMap((f) => f.images.map((box) => ({ f, box }))).slice(0, OCR_RUNS * 3);
  const seen: { box: Box; look: number[] }[] = [];
  const found = new Map<string, Finding>();
  let runsLeft = OCR_RUNS;
  for (const { f, box } of jobs) {
    if (runsLeft === 0) break;
    const left = Math.max(0, Math.floor(box.x)), top = Math.max(0, Math.floor(box.y));
    const width = Math.min(c.width, Math.ceil(box.x + box.width)) - left, height = Math.min(c.height, Math.ceil(box.y + box.height)) - top;
    if (width < 32 || height < 32) continue;
    const crop = await sharp(f.png).extract({ left, top, width, height }).png().toBuffer();
    const look = (await labPixels(crop, 16)).map((p) => p.l);
    if (seen.some((s) => Math.abs(s.box.x - box.x) < 4 && Math.abs(s.box.y - box.y) < 4 && layoutDistance(s.look, look) < 0.01)) continue;
    seen.push({ box, look });
    runsLeft--;
    const known = f.texts.map((t) => ({ ...t, box: { ...t.box, x: t.box.x - left, y: t.box.y - top } }));
    const lettering = await findLettering(crop, known);
    // A picture full of lines (a screen recording, a screenshot) is texture, like a crowded frame.
    if (lettering.length > TEXTURE_LINES) continue;
    for (const t of lettering) {
      const at: TextBox = { ...t, box: { ...t.box, x: t.box.x + left, y: t.box.y + top } };
      const where = `"${short(at.text)}" in a picture at ${f.time.toFixed(1)} s`;
      const cut = edge({ png: f.png, width: c.width, height: c.height }, at, VIDEO_MARGIN).some((e) => e.rule === "text-cut");
      if (cut && !found.has(`cut ${at.text}`)) found.set(`cut ${at.text}`, { rule: "text-cut", kind: "error", message: `${where} is cut off by the edge of the frame.`, source: "read by OCR" });
      if (at.size / c.height < MIN_SIZE && !found.has(`small ${at.text}`)) {
        found.set(`small ${at.text}`, {
          rule: "text-too-small",
          kind: "default",
          message: `${where} is about ${Math.round(at.size)} px tall on a ${c.height} px frame; if it should be read, it needs about ${Math.round(MIN_SIZE * c.height)} px.`,
          source: "Attentry Design rules R1 (read by OCR, so less certain)",
        });
      }
    }
  }
  return [...found.values()];
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

const GRID = 32; // the frames' lightness is compared on a 32 × 32 grid

/**
 * T3: text that arrives while the rest of the picture is moving (a camera move, a wipe): "a change
 * in the middle of a major move will go unnoticed" (Thomas & Johnston). The motion is measured
 * outside every text that is itself appearing or changing, so a caption fading in over a still
 * picture isn't motion; only what moves behind it is.
 */
function arrivesMidMove(texts: Map<string, { frame: VideoFrame; box: TextBox }[]>, frames: VideoFrame[], looks: number[][], c: Composition): Finding[] {
  const index = new Map(frames.map((f, i) => [f, i]));
  const late: string[] = [];
  for (const [text, seen] of texts) {
    // Mid-move: the picture was already moving before the text came in, and still is as it's fully
    // shown and just after. Text that arrives with its picture (a new clip cutting in, a card
    // landing) starts or stops with the motion, so it isn't mid-move.
    const full = index.get(seen[0].frame)!;
    if (full < 2 || full === frames.length - 1) continue;
    const move = (k: number) => changeOutside(looks[k - 1], looks[k], changing(frames[k - 1], frames[k]), c);
    const motion = Math.min(move(full - 1), move(full), move(full + 1));
    if (motion <= MOVING) continue;
    // A move is a transition, over in a second or so. Footage that keeps moving (a sped-up
    // recording under its "8× speed" label) isn't a move the text should wait for.
    const after = frames.slice(full + 1, full + 1 + ONGOING / STEP).map((_, j) => move(full + 1 + j) > MOVING / 2);
    if (after.length && after.filter(Boolean).length >= after.length / 2) continue;
    late.push(`"${short(text)}" (${frames[full].time.toFixed(1)} s)`);
  }
  if (!late.length) return [];
  return [{
    rule: "text-during-move",
    kind: "default",
    message: `Text arrives while the picture is still moving, where it goes unnoticed: ${late.join(", ")}. Let the move land, then bring the text in.`,
    source: "Thomas & Johnston, The Illusion of Life: a change in the middle of a major move goes unnoticed",
  }];
}

/**
 * The boxes of texts that differ between two frames: arriving, leaving, fading or changing. Text
 * that only moves isn't masked: moving with the camera, it's part of the move.
 */
function changing(a: VideoFrame, b: VideoFrame): Box[] {
  const key = (t: TextBox) => `${t.text}|${t.opacity.toFixed(1)}`;
  const inA = new Set(a.texts.map(key)), inB = new Set(b.texts.map(key));
  return [...a.texts.filter((t) => !inB.has(key(t))), ...b.texts.filter((t) => !inA.has(key(t)))].map((t) => t.box);
}

/** Mean lightness change between two frames on the grid, leaving out the cells under the boxes. */
function changeOutside(a: number[], b: number[], boxes: Box[], c: Composition): number {
  const masked = new Set<number>();
  for (const box of boxes) {
    const x0 = Math.floor((box.x / c.width) * GRID) - 1, x1 = Math.ceil(((box.x + box.width) / c.width) * GRID);
    const y0 = Math.floor((box.y / c.height) * GRID) - 1, y1 = Math.ceil(((box.y + box.height) / c.height) * GRID);
    for (let y = Math.max(0, y0); y <= Math.min(GRID - 1, y1); y++) for (let x = Math.max(0, x0); x <= Math.min(GRID - 1, x1); x++) masked.add(y * GRID + x);
  }
  let sum = 0, n = 0;
  for (let i = 0; i < a.length; i++) if (!masked.has(i)) { sum += Math.abs(a[i] - b[i]); n++; }
  return n ? sum / n : 0;
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
