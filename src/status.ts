// What the editor panel follows in a project's design folder: the stage tool running now, the last
// one that finished (and the lock it held the design to), the design request the brief hook last
// saw, the kind the person pinned, and which designs belong to which lock. Small JSON files, so
// the panel needs no link to the agent.
import { access, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import type { DesignKind } from "./brief.ts";
import { LOCK_DIR, readLock } from "./lock.ts";
import { keepVersion, renderPath, restoreVersion, type Version, type VersionTree } from "./versions.ts";

export const RUNNING = "running.json";
export const LAST_RUN = "last-run.json";
export const TASK = "task.json";
export const PIN = "pin.json";
export const DESIGNS = "designs.json";

export type Running = { tool: string; started: number; lock?: string };
export type LastRun = { tool: string; finished: number; lock?: string };
export type Task = { kind: DesignKind; at: number; pinned: boolean };
export type Pin = { kind: DesignKind };
/** A lock's designs: the options it was picked from, the pick, and the versions checked against it. */
export type LockDesigns = { picked: string; options: string[] } & VersionTree;
export type Designs = { options?: string[]; locks: Record<string, LockDesigns> };
export type DesignEvent =
  | { tool: "check_options"; files: string[] }
  | { tool: "lock_design"; file: string; name: string }
  | { tool: "check_design"; file: string; lock?: string };

const path = (project: string, name: string) => join(project, LOCK_DIR, name);

export async function readStatus<T>(project: string, name: string): Promise<T | undefined> {
  try {
    return JSON.parse(await readFile(path(project, name), "utf8")) as T;
  } catch {
    return undefined; // not there (the usual case), or caught half-written: nothing to show
  }
}

export async function writeStatus(project: string, name: string, value: Running | LastRun | Task | Pin | Designs): Promise<void> {
  await mkdir(join(project, LOCK_DIR), { recursive: true });
  await writeFile(path(project, name), JSON.stringify(value));
}

export async function clearStatus(project: string, name: string): Promise<void> {
  await rm(path(project, name), { force: true });
}

/**
 * Keeps track of which files belong to which lock, so the editor can offer each of them: the last
 * round of options, the one picked from it when a lock is saved, and a numbered version for each
 * check against the lock. Paths are kept absolute, whichever way the agent gave them. Returns what
 * to tell the agent, if anything.
 */
export async function noteDesigns(project: string, event: DesignEvent): Promise<string | undefined> {
  const designs = (await readStatus<Designs>(project, DESIGNS)) ?? { locks: {} };
  const abs = (file: string) => resolve(project, file).replaceAll("\\", "/");
  let said: string | undefined;
  if (event.tool === "check_options") designs.options = event.files.map(abs);
  else if (event.tool === "lock_design") {
    const picked = abs(event.file);
    designs.locks[event.name] = { picked, options: designs.options?.includes(picked) ? designs.options : [picked], versions: [] };
  } else if (event.lock) {
    // A lock saved before designs were kept starts from the option it was picked from.
    const lock = (designs.locks[event.lock] ??= { picked: abs((await readLock(project, event.lock)).from), options: [], versions: [] });
    const render = renderPath(project, event.file);
    const version = await keepVersion(project, event.lock, lock, abs(event.file), await access(render).then(() => render, () => undefined));
    said = `Kept as v${version.n} of "${event.lock}"${version.parent ? `, from v${version.parent}` : ""}. If the person asks for an earlier version, put it back with restore_version.`;
  } else return undefined;
  await writeStatus(project, DESIGNS, designs);
  return said;
}

/** Puts a lock's version back in its design's file (see restoreVersion), and keeps the record. */
export async function restoreDesign(project: string, lock: string, n: number): Promise<Version> {
  const designs = (await readStatus<Designs>(project, DESIGNS)) ?? { locks: {} };
  const tree = designs.locks[lock];
  if (!tree) throw new Error(`The "${lock}" lock has no versions yet. A version is kept each time check_design runs with it.`);
  const version = await restoreVersion(project, lock, tree, n);
  await writeStatus(project, DESIGNS, designs);
  return version;
}
