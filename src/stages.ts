// The three stages that do work (options, lock, finish), as the command line and the MCP tools
// both run them. Each returns the text the person or the agent reads, plus the data behind it.
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, isAbsolute, join, relative, resolve } from "node:path";
import { render, type RenderOptions } from "./render.ts";
import { measure } from "./measure.ts";
import { compareOptions, contactSheet } from "./options.ts";
import { LOCK_DIR, readLock, writeLock, type About } from "./lock.ts";
import { check } from "./check.ts";
import { format, type Finding } from "./findings.ts";
import { RemotionProject, sampleFrames, type Composition } from "./remotion.ts";
import { checkVideo, keyFrames, STEP, storyboard } from "./video.ts";
import type { Rendered } from "./render.ts";
import { renderPath } from "./versions.ts";

export interface StageResult {
  text: string;
  findings: Finding[];
  data: Record<string, unknown>;
}

const inProject = (project: string, file: string) => (isAbsolute(file) ? file : resolve(project, file));
const shown = (project: string, file: string) => {
  const rel = relative(project, file);
  return (rel.startsWith("..") ? file : rel).replaceAll("\\", "/");
};

export async function runOptions(project: string, files: string[], size: RenderOptions = {}, out?: string): Promise<StageResult> {
  return optionsOf(project, await Promise.all(files.map((f) => render(inProject(project, f), size))), out);
}

async function optionsOf(project: string, rendered: Rendered[], out?: string): Promise<StageResult> {
  const { options, findings } = await compareOptions(rendered);
  let sheet = out ? inProject(project, out) : undefined;
  if (!sheet) {
    await mkdir(join(project, LOCK_DIR, "sheets"), { recursive: true });
    sheet = join(project, LOCK_DIR, "sheets", `options-${stamp()}.png`);
  }
  await contactSheet(rendered, options, sheet);
  const lines = options.map((o) => `  ${o.number}. ${shown(project, o.file)}`);
  const verdict = findings.length
    ? `${format(findings)}\nRedo the options named above, then call this again.`
    : "The options really differ. Show the person the contact sheet and ask which one, by number.";
  return {
    text: `Contact sheet: ${shown(project, sheet)}\n${lines.join("\n")}\n${verdict}`,
    findings,
    data: {
      sheet,
      options: options.map(({ number, file, measures: m }) => ({ number, file, subject: m.subject, field: m.field, palette: m.palette.map((s) => s.hex) })),
    },
  };
}

export async function runLock(project: string, file: string, name: string, size: RenderOptions = {}, style?: string, words?: string[], about: About = {}): Promise<StageResult> {
  return lockOf(project, await render(inProject(project, file), size), name, style, words, about);
}

async function lockOf(project: string, rendered: Rendered, name: string, style?: string, words?: string[], about: About = {}): Promise<StageResult> {
  const m = await measure(rendered.png);
  const path = await writeLock(project, name, rendered, m, style, words, about);
  const lock = await readLock(project, name);
  return {
    text: `Locked "${name}"${style ? ` (${style})` : ""} from ${shown(project, rendered.file)} (${shown(project, path)}): colors ${lock.colors.join(", ")}; fonts ${lock.fonts.join(", ") || "none"}; ${lock.size.width}×${lock.size.height}${lock.words ? `; ${lock.words.length} approved line${lock.words.length === 1 ? "" : "s"} of words` : ""}. Check the finished design with check_design and lock "${name}".`,
    findings: [],
    data: { lock: path },
  };
}

export async function runCheck(project: string, file: string, lockName?: string, size: RenderOptions = {}): Promise<StageResult> {
  const rendered = await render(inProject(project, file), size);
  const lock = lockName ? await readLock(project, lockName) : undefined;
  const r = report(shown(project, rendered.file), await check(rendered, await measure(rendered.png), lock));
  // The render, as the checks saw it: agents often never look at what they made, so it's handed over.
  const picture = await saveRender(project, rendered.file, rendered.png);
  return { ...r, text: `${r.text}
Render: ${shown(project, picture)}
${LOOK}`, data: { ...r.data, render: picture } };
}

async function saveRender(project: string, file: string, png: Buffer): Promise<string> {
  const picture = renderPath(project, file);
  await mkdir(dirname(picture), { recursive: true });
  await writeFile(picture, png);
  return picture;
}

/** Only the render, to look at: no checks, so nothing is flagged that wasn't asked about. */
export async function runPreview(project: string, file: string, size: RenderOptions = {}): Promise<StageResult> {
  const rendered = await render(inProject(project, file), size);
  const picture = await saveRender(project, rendered.file, rendered.png);
  return { text: `Render: ${shown(project, picture)} (${rendered.width}×${rendered.height}). Open it and look.`, findings: [], data: { render: picture } };
}

// What no measurement can judge: meaning. Said after every check, so "no findings" isn't taken as
// "done".
const LOOK = "Now open the render above and look at it yourself: does each part say its message to someone who doesn't already know it, and can every word be read at phone size? Fix what doesn't; in the design card, name any part that may still not get its message across.";

function report(what: string, findings: Finding[]): StageResult {
  const errors = findings.filter((f) => f.kind === "error").length;
  const suggestions = findings.length - errors;
  const head = findings.length === 0
    ? `${what}: no findings.`
    : `${what}: ${errors} to fix, ${suggestions} suggestion${suggestions === 1 ? "" : "s"}.`;
  return { text: findings.length ? `${head}\n${format(findings)}` : head, findings, data: {} };
}

// Videos: a Remotion project's entry file and composition ids.

async function withVideo<T>(project: string, entry: string, run: (p: RemotionProject, find: (id: string) => Composition) => Promise<T>): Promise<T> {
  const remotion = await RemotionProject.open(project, entry);
  try {
    const all = await remotion.compositions();
    const find = (id: string) => {
      const c = all.find((x) => x.id === id);
      if (!c) throw new Error(`No composition "${id}" in ${entry}. It has: ${all.map((x) => x.id).join(", ")}.`);
      return c;
    };
    return await run(remotion, find);
  } finally {
    await remotion.close();
  }
}

/** A video as one picture: its storyboard, with every color and font used in the key frames. */
async function storyboardOf(project: string, entry: string, remotion: RemotionProject, c: Composition): Promise<Rendered> {
  const frames = await remotion.frames(c, keyFrames(c));
  const board = await storyboard(c, frames);
  return {
    file: `${inProject(project, entry)}#${c.id}`,
    ...board,
    colors: [...new Set(frames.flatMap((f) => f.colors))],
    fonts: [...new Set(frames.flatMap((f) => f.fonts))],
    texts: [],
    cut: [],
    panels: [],
    rings: [],
    images: [],
  };
}

/** A frame of a video at full size, or several (the key frames when none are named) as a strip. */
export async function runVideoPreview(project: string, entry: string, id: string, seconds: number[] = []): Promise<StageResult> {
  return withVideo(project, entry, async (remotion, find) => {
    const c = find(id);
    const at = seconds.length ? seconds.map((s) => Math.max(0, Math.min(c.durationInFrames - 1, Math.round(s * c.fps)))) : keyFrames(c);
    const frames = await remotion.frames(c, at);
    const png = frames.length === 1 ? frames[0].png : (await storyboard(c, frames)).png;
    const picture = await saveRender(project, `${c.id}.png`, png);
    const when = at.map((f) => `${(f / c.fps).toFixed(2)} s`).join(", ");
    return { text: `Render: ${shown(project, picture)} (${frames.length === 1 ? "the frame" : "frames"} at ${when}). Open it and look.`, findings: [], data: { render: picture } };
  });
}

export async function runVideoOptions(project: string, entry: string, ids: string[], out?: string): Promise<StageResult> {
  return withVideo(project, entry, async (remotion, find) => {
    const boards: Rendered[] = [];
    for (const id of ids) boards.push(await storyboardOf(project, entry, remotion, find(id)));
    return optionsOf(project, boards, out);
  });
}

export async function runVideoLock(project: string, entry: string, id: string, name: string, style?: string, words?: string[], about: About = {}): Promise<StageResult> {
  return withVideo(project, entry, async (remotion, find) => {
    const c = find(id);
    // The lock keeps the video's own size, not the storyboard's.
    return lockOf(project, { ...(await storyboardOf(project, entry, remotion, c)), width: c.width, height: c.height }, name, style, words, about);
  });
}

export async function runVideoCheck(project: string, entry: string, id: string, lockName?: string): Promise<StageResult> {
  const lock = lockName ? await readLock(project, lockName) : undefined;
  return withVideo(project, entry, async (remotion, find) => {
    const c = find(id);
    const frames = await remotion.frames(c, sampleFrames(c, STEP));
    return report(`${id} (${(c.durationInFrames / c.fps).toFixed(1)} s, ${frames.length} frames checked)`, await checkVideo(c, frames, lock));
  });
}

function stamp(): string {
  return new Date().toISOString().replace(/\D/g, "").slice(0, 14);
}
