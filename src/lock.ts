// Stage 3: the option the person picked, saved as a design lock. Later work is checked against it,
// the way tests hold code to a spec.
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join, relative } from "node:path";
import { formatHex, parse } from "culori";
import type { Rendered } from "./render.ts";
import type { Measures, Value } from "./measure.ts";

export interface DesignLock {
  name: string;
  style?: string; // the world style the person chose: stick figure, flat 2D, 3D, pixel art…
  words?: string[]; // the words the person approved (the script, the exact text), one line each
  mood?: string; // from the brief: a dark mood makes a dark picture the brief, not murk
  purpose?: string; // from the brief: a tribute asks nothing of the viewer, so no call to action
  from: string; // the option it was locked from, relative to the project
  size: { width: number; height: number };
  colors: string[]; // hex, exactly as the source uses them
  fonts: string[];
  composition: { subject: { x: number; y: number }; centered: boolean };
  field: Value;
  locked: string; // ISO date
}

export const LOCK_DIR = ".attentry-design";

export function lockPath(project: string, name: string): string {
  if (!/^[\w-]+$/.test(name)) throw new Error("A lock name uses letters, digits, - and _ only.");
  return join(project, LOCK_DIR, `${name}.lock.json`);
}

export function toHex(color: string): string | undefined {
  const c = parse(color);
  return c ? formatHex(c) : undefined;
}

/** What the brief said the design is for, kept so the checks don't suggest against it. */
export type About = { mood?: string; purpose?: string };

export async function writeLock(project: string, name: string, rendered: Rendered, m: Measures, style?: string, words?: string[], about: About = {}): Promise<string> {
  const lock: DesignLock = {
    name,
    ...(style ? { style } : {}),
    ...(words?.length ? { words } : {}),
    ...(about.mood ? { mood: about.mood } : {}),
    ...(about.purpose ? { purpose: about.purpose } : {}),
    from: relative(project, rendered.file).replaceAll("\\", "/"),
    size: { width: rendered.width, height: rendered.height },
    colors: [...new Set(rendered.colors.map(toHex).filter((h): h is string => !!h))],
    fonts: rendered.fonts,
    composition: { subject: round(m.subject), centered: m.centered },
    field: m.field,
    locked: new Date().toISOString(),
  };
  const path = lockPath(project, name);
  await mkdir(join(project, LOCK_DIR), { recursive: true });
  await writeFile(path, JSON.stringify(lock, null, 2) + "\n");
  return path;
}

export async function readLock(project: string, name: string): Promise<DesignLock> {
  return JSON.parse(await readFile(lockPath(project, name), "utf8"));
}

function round(p: { x: number; y: number }) {
  return { x: Math.round(p.x * 100) / 100, y: Math.round(p.y * 100) / 100 };
}
