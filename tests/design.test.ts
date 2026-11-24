// Each check is tried on designs it must flag and designs it must not flag (fixtures/).
import { test, after } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { closeBrowser, render, type Rendered } from "../src/render.ts";
import { measure } from "../src/measure.ts";
import { compareOptions, contactSheet, MAX_OPTIONS } from "../src/options.ts";
import { readLock, writeLock } from "../src/lock.ts";
import { check } from "../src/check.ts";

after(closeBrowser);

const fixture = (name: string) => join(import.meta.dirname, "fixtures", name);
const cache = new Map<string, Promise<Rendered>>();
const load = (name: string, size?: { width: number; height: number }) => {
  if (!cache.has(name)) cache.set(name, render(fixture(name), size));
  return cache.get(name)!;
};
const rules = async (name: string, size?: { width: number; height: number }) => {
  const r = await load(name, size);
  return (await check(r, await measure(r.png))).map((f) => f.rule);
};

test("render reads an SVG's size, painted colors, fonts and text", async () => {
  const r = await load("invite-diagonal.svg");
  assert.deepEqual([r.width, r.height], [600, 800]);
  assert.ok(!r.colors.includes("rgb(0, 0, 0)"), "the root's default black fill isn't painted");
  assert.deepEqual(r.fonts, ["Arial"]);
  assert.deepEqual(r.texts.map((t) => t.text), ["Maya & Leo", "June 14, Lisbon"]);
});

test("render: a line's unpainted default fill isn't a color in the design", async () => {
  const r = await load("divider-line.svg");
  assert.deepEqual(r.colors.sort(), ["rgb(217, 164, 65)", "rgb(43, 33, 24)"]);
});

test("options: two copies of the default invitation are flagged on every axis", async () => {
  const { findings } = await compareOptions([await load("invite-centered.svg"), await load("invite-centered-again.svg")]);
  assert.deepEqual(findings.map((f) => f.rule).sort(), ["options-all-centered", "options-same", "options-same-palette", "options-same-values"]);
});

test("options: three real alternatives pass", async () => {
  const set = await Promise.all(["invite-centered.svg", "invite-steelyard.svg", "invite-diagonal.svg"].map((n) => load(n)));
  const { findings, options } = await compareOptions(set);
  assert.deepEqual(findings, []);
  const sheet = await contactSheet(set, options, join(await mkdtemp(join(tmpdir(), "ad-")), "sheet.png"));
  assert.match(sheet, /sheet\.png$/);
});

test("options: at most five, at least two", async () => {
  const one = await load("invite-diagonal.svg");
  await assert.rejects(compareOptions([one]), /at least 2/);
  await assert.rejects(compareOptions(Array(MAX_OPTIONS + 1).fill(one)), /At most 5/);
});

test("check: pastel text on pastel fails contrast; the subject is centered", async () => {
  const found = await rules("invite-centered.svg");
  assert.equal(found.filter((r) => r === "text-contrast").length, 2);
  assert.ok(found.includes("subject-centered"));
});

test("check: an off-center design with readable text isn't flagged for either", async () => {
  const found = await rules("invite-diagonal.svg");
  assert.ok(!found.includes("text-contrast"));
  assert.ok(!found.includes("subject-centered"));
});

test("check: HTML pages render at the given size; low-contrast text is found", async () => {
  const found = await rules("invite.html", { width: 1200, height: 630 });
  assert.deepEqual(found.filter((r) => r === "text-contrast").length, 1); // the date, not the title
});

test("check: raw primaries everywhere, and text hugging the edge", async () => {
  const found = await rules("loud.svg");
  for (const rule of ["saturation", "raw-primaries", "text-margin"]) assert.ok(found.includes(rule), rule);
});

test("lock: the locked design passes; a drifted one is caught for color and font", async () => {
  const project = await mkdtemp(join(tmpdir(), "ad-"));
  const original = await load("invite-diagonal.svg");
  await writeLock(project, "invitation", original, await measure(original.png));
  const lock = await readLock(project, "invitation");
  assert.deepEqual(lock.fonts, ["Arial"]);
  assert.ok(!lock.colors.includes("#000000"));

  const same = await check(original, await measure(original.png), lock);
  assert.ok(!same.some((f) => f.rule.startsWith("off-lock")));

  const drift = await load("invite-diagonal-drift.svg");
  const found = (await check(drift, await measure(drift.png), lock)).map((f) => f.rule);
  assert.ok(found.includes("off-lock-colors"));
  assert.ok(found.includes("off-lock-fonts"));
});

test("a pixel-art lock: crisp pixels pass, smoothed edges are caught", async () => {
  const project = await mkdtemp(join(tmpdir(), "ad-"));
  const crisp = await load("pixel-crisp.svg");
  await writeLock(project, "cowboy", crisp, await measure(crisp.png), "pixel art");
  const lock = await readLock(project, "cowboy");
  assert.equal(lock.style, "pixel art");
  assert.ok(!(await check(crisp, await measure(crisp.png), lock)).some((f) => f.rule === "pixel-edges"));
  const smooth = await load("pixel-smooth.svg");
  assert.ok((await check(smooth, await measure(smooth.png), lock)).some((f) => f.rule === "pixel-edges"));
  // Without a pixel-art style, smooth edges are nobody's business.
  await writeLock(project, "flat", crisp, await measure(crisp.png), "flat 2D");
  assert.ok(!(await check(smooth, await measure(smooth.png), await readLock(project, "flat"))).some((f) => f.rule === "pixel-edges"));
});

test("lock names can't escape the lock folder", async () => {
  await assert.rejects(readLock(tmpdir(), "../x"), /letters, digits/);
});
