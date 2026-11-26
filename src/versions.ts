// Numbered versions of a lock's design: every check against the lock keeps a copy of the design and
// its render, and which version it grew from, so "go back to v2" means one exact picture, and a
// change made after going back is a branch, not a loss. Plain files under the design folder.
import { copyFile, mkdir, readFile } from "node:fs/promises";
import { basename, extname, join } from "node:path";
import { LOCK_DIR } from "./lock.ts";

export type Version = { n: number; file: string; snapshot: string; render?: string; at: number; parent?: number };
export type VersionTree = { versions: Version[]; head?: number };

/** Where a check leaves its render, for the agent to look at and for the version it saves. */
export const renderPath = (project: string, file: string) => join(project, LOCK_DIR, "renders", `${basename(file, extname(file))}.png`);

const sameBytes = async (a: string, b: string) => (await readFile(a)).equals(await readFile(b));

async function versionMatching(tree: VersionTree, file: string): Promise<Version | undefined> {
  for (const v of tree.versions) if (await sameBytes(file, v.snapshot).catch(() => false)) return v;
  return undefined;
}

/**
 * Keeps `file` as the lock's next version, grown from the current one. A design that's the same as
 * a kept version (checked again unchanged, or put back by hand) isn't kept twice: that version
 * becomes the current one, so the next change branches from it.
 */
export async function keepVersion(project: string, lock: string, tree: VersionTree, file: string, render?: string): Promise<Version> {
  const same = await versionMatching(tree, file);
  if (same) {
    tree.head = same.n;
    return same;
  }
  const n = Math.max(0, ...tree.versions.map((v) => v.n)) + 1;
  const dir = join(project, LOCK_DIR, "versions", lock);
  await mkdir(dir, { recursive: true });
  const snapshot = join(dir, `v${n}${extname(file)}`);
  await copyFile(file, snapshot);
  let kept: string | undefined;
  if (render) {
    kept = join(dir, `v${n}.png`);
    await copyFile(render, kept);
  }
  const version: Version = { n, file, snapshot, ...(kept ? { render: kept } : {}), at: Date.now(), ...(tree.head ? { parent: tree.head } : {}) };
  tree.versions.push(version);
  tree.head = n;
  return version;
}

/**
 * Puts version `n` back in its design's file. Whatever is in that file now is kept first, as a
 * version of its own if it isn't one already, so nothing done since is lost.
 */
export async function restoreVersion(project: string, lock: string, tree: VersionTree, n: number): Promise<Version> {
  const version = tree.versions.find((v) => v.n === n);
  if (!version) throw new Error(`The "${lock}" lock has no v${n}. It has: ${tree.versions.map((v) => `v${v.n}`).join(", ") || "no versions yet"}.`);
  await keepVersion(project, lock, tree, version.file).catch((error: NodeJS.ErrnoException) => {
    if (error.code !== "ENOENT") throw error; // the design's file was deleted: nothing to keep first
  });
  await copyFile(version.snapshot, version.file);
  tree.head = n;
  return version;
}
