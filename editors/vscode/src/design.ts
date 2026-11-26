// The project's side of the panel: its design locks and their designs, what's running, the last
// request's kind and the pin. Read with the plugin's own code, so the panel and the checks agree
// on what each file means.
import { join } from "node:path";
import { existingLocks, type DesignKind } from "../../../src/brief.ts";
import { LOCK_DIR, readLock, type DesignLock } from "../../../src/lock.ts";
import { clearStatus, DESIGNS, LAST_RUN, PIN, readStatus, RUNNING, TASK, writeStatus, type Designs, type LastRun, type Pin, type Running, type Task } from "../../../src/status.ts";

export type LockEntry =
  | { name: string; path: string; lock: DesignLock }
  | { name: string; path: string; error: string };

export async function locks(project: string): Promise<LockEntry[]> {
  const found = await Promise.all((await existingLocks(project)).map(async (name): Promise<LockEntry> => {
    // Not lockPath: a file renamed by hand to a name lockPath refuses is still listed.
    const path = join(project, LOCK_DIR, `${name}.lock.json`);
    try {
      return { name, path, lock: await readLock(project, name) };
    } catch (error) {
      // A lock edited by hand into bad JSON: shown as such, so the rest of the panel still works.
      return { name, path, error: (error as Error).message };
    }
  }));
  return found.sort((a, b) => ("lock" in b ? b.lock.locked : "").localeCompare("lock" in a ? a.lock.locked : ""));
}

// A running marker older than this was left by a session that was closed mid-check.
const STALE = 10 * 60_000;

export type ProjectStatus = { running?: Running; last?: LastRun; task?: Task; pin?: Pin; designs?: Designs };

export async function projectStatus(project: string): Promise<ProjectStatus> {
  const [running, last, task, pin, designs] = await Promise.all([
    readStatus<Running>(project, RUNNING),
    readStatus<LastRun>(project, LAST_RUN),
    readStatus<Task>(project, TASK),
    readStatus<Pin>(project, PIN),
    readStatus<Designs>(project, DESIGNS),
  ]);
  return { running: running && Date.now() - running.started < STALE ? running : undefined, last, task, pin, designs };
}

/** Pins the kind every design request gets, or back to Auto (the guess from each request). */
export const setPin = (project: string, kind: DesignKind | undefined) => (kind ? writeStatus(project, PIN, { kind }) : clearStatus(project, PIN));
