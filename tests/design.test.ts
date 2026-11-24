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
import { closeOcr } from "../src/lettering.ts";

after(() => Promise.all([closeBrowser(), closeOcr()]));

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

test("check: four texts at one size have no hierarchy; a clear headline does", async () => {
  assert.ok((await rules("flat-labels.svg")).includes("no-hierarchy"));
  assert.ok(!(await rules("invite-steelyard.svg")).includes("no-hierarchy")); // 2 texts: nothing to rank
  const { hierarchy } = await import("../src/check.ts");
  const box = (size: number) => ({ text: "x", color: "#000", fontFamily: "A", fontSize: size, size, opacity: 1, bold: false, box: { x: 0, y: 0, width: 1, height: 1 } });
  assert.deepEqual(hierarchy([box(96), box(36), box(36), box(30)]), []);
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

test("lettering drawn as shapes and marked with data-text is measured like text", async () => {
  const r = await load("drawn-label-edge.svg");
  const drawn = r.texts.find((t) => t.source === "drawn")!;
  assert.equal(drawn.text, "OK");
  assert.equal(drawn.color, "rgb(58, 42, 32)");
  const found = await check(r, await measure(r.png));
  assert.ok(found.some((f) => f.rule === "text-margin" && f.message.startsWith('"OK"')));
  assert.ok(found.some((f) => f.rule === "shapes-cut" && f.message.startsWith("1 small shape")), "the dot, not the full-bleed background");
});

test("OCR finds lettering in a generated image: a label at the edge", { timeout: 60_000 }, async () => {
  const r = await load("github-pixel-final.png");
  assert.deepEqual(r.texts, []);
  const found = await check(r, await measure(r.png));
  const edges = found.filter((f) => f.rule === "text-margin");
  assert.ok(edges.some((f) => f.message.includes('"MERGE"')), JSON.stringify(found));
  assert.ok(edges.every((f) => f.message.startsWith("Lettering in the picture")));
});

test("text size at phone width: small labels are named; big ones aren't", async () => {
  assert.ok((await rules("loud.svg")).includes("text-small")); // 18 px in a 600 px picture: 11 px on a phone
  assert.ok(!(await rules("flat-labels.svg")).some((r) => r.startsWith("text-small") || r === "text-too-small"));
});

test("drawn lettering a reader misreads is a suggestion; lettering it reads is left alone", { timeout: 60_000 }, async () => {
  const r = await load("github-pixel-cards.svg");
  const found = await check(r, await measure(r.png));
  const hard = found.find((f) => f.rule === "hard-to-read");
  assert.ok(hard, JSON.stringify(found));
  assert.equal(hard.kind, "default");
  assert.ok(!hard.message.includes('"BRANCH & MERGE" as'));
  const { similarity } = await import("../src/lettering.ts");
  assert.equal(similarity("ROLL BACK", "roll back"), 1);
  assert.ok(similarity("BACK UP CODE", "EBACE UF CODE") < 0.85);
});

test("mixels: doubled sprites beside 1x lettering are caught; one grid passes", async () => {
  const { mixels } = await import("../src/check.ts");
  const lock = { name: "p", style: "pixel art" } as Parameters<typeof mixels>[1];
  assert.equal((await mixels(await load("github-pixel-cards.svg"), lock)).length, 1);
  assert.deepEqual(await mixels(await load("pixel-crisp.svg"), lock), []);
  assert.deepEqual(await mixels(await load("github-pixel-cards.svg"), { ...lock, style: "flat 2D" }), []);
});

test("visual tension: a label crammed against its card's edge is named; one with room isn't", async () => {
  const found = (await check(await load("tight-card.svg"), await measure((await load("tight-card.svg")).png))).find((f) => f.rule === "visual-tension");
  assert.ok(found);
  assert.match(found.message, /"Track changes"/);
  assert.ok(!found.message.includes("Roll back"));
});

test("embedded content is texture, and text hidden by a crop isn't read", async () => {
  const r = await load("embed-crop.html", { width: 800, height: 600 });
  const texts = r.texts.map((t) => t.text);
  assert.deepEqual(texts.sort(), ["How it works", "visible line"]);
  assert.ok(!r.colors.includes("rgb(156, 220, 254)"), "the screenshot's code color isn't a design color");
  assert.ok(!r.fonts.includes("Consolas"));
});

test("visual tension: a ring whose curve runs through a label is named; one clear of it isn't", async () => {
  const r = await load("ring-label.svg");
  const found = (await check(r, await measure(r.png))).find((f) => f.rule === "visual-tension");
  assert.ok(found, "the ring through the label");
  assert.match(found.message, /"Before an edit"/);
  assert.ok(!found.message.includes("After an edit"));
});

test("lock names can't escape the lock folder", async () => {
  await assert.rejects(readLock(tmpdir(), "../x"), /letters, digits/);
});
