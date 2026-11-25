// What the editor panel follows in a project's design folder: the stage tool running now, the last
// one that finished (and the lock it held the design to), the design request the brief hook last
// saw, and the kind the person pinned. Small JSON files, so the panel needs no link to the agent.
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import type { DesignKind } from "./brief.ts";
import { LOCK_DIR } from "./lock.ts";

export const RUNNING = "running.json";
export const LAST_RUN = "last-run.json";
export const TASK = "task.json";
export const PIN = "pin.json";

export type Running = { tool: string; started: number; lock?: string };
export type LastRun = { tool: string; finished: number; lock?: string };
export type Task = { kind: DesignKind; at: number; pinned: boolean };
export type Pin = { kind: DesignKind };

const path = (project: string, name: string) => join(project, LOCK_DIR, name);

export async function readStatus<T>(project: string, name: string): Promise<T | undefined> {
  try {
    return JSON.parse(await readFile(path(project, name), "utf8")) as T;
  } catch {
    return undefined; // not there (the usual case), or caught half-written: nothing to show
  }
}

export async function writeStatus(project: string, name: string, value: Running | LastRun | Task | Pin): Promise<void> {
  await mkdir(join(project, LOCK_DIR), { recursive: true });
  await writeFile(path(project, name), JSON.stringify(value));
}

export async function clearStatus(project: string, name: string): Promise<void> {
  await rm(path(project, name), { force: true });
}
