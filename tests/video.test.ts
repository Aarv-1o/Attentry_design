// The video checks on a small Remotion project (fixtures/video): a promo with the faults the
// baseline found most, one without, and one that drifts from a lock.
import { test, after } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { closeBrowser } from "../src/render.ts";
import { closeRemotion } from "../src/remotion.ts";
import { runVideoCheck, runVideoLock, runVideoOptions } from "../src/stages.ts";

after(() => Promise.all([closeBrowser(), closeRemotion()]));

// The fixture uses this repo's own Remotion, so the repo is the project.
const project = join(import.meta.dirname, "..");
const entry = "tests/fixtures/video/index.ts";
const rules = async (id: string, lock?: string, at = project) => (await runVideoCheck(at, join(project, entry), id, lock)).findings.map((f) => f.rule);

test("a bad promo: brief headline, small grey text, an edge URL, a black opening", { timeout: 120_000 }, async () => {
  const found = await rules("BadPromo");
  for (const rule of ["text-too-brief", "text-too-small", "text-contrast", "text-margin", "blank-frames"]) assert.ok(found.includes(rule), rule);
  assert.equal(found.filter((r) => r === "blank-frames").length, 1, "only the opening is blank: frames with text aren't");
});

test("a good promo, with a fade-in and a moving shape, passes", { timeout: 120_000 }, async () => {
  assert.deepEqual(await rules("GoodPromo"), []);
});

test("a typed line is timed from its last letter; a title and subtitle are timed together", { timeout: 120_000 }, async () => {
  const r = await runVideoCheck(project, join(project, entry), "CardPromo");
  const brief = r.findings.filter((f) => f.rule === "text-too-brief");
  assert.equal(brief.length, 1, r.text);
  assert.match(brief[0].message, /"Checks every edit" and 1 more line shown with it: 63 characters/);
});

test("video: a ring that cuts through a label is visual tension", { timeout: 120_000 }, async () => {
  assert.ok((await rules("RingPromo")).includes("visual-tension"));
});

test("video options: storyboards that differ pass; an unknown composition is named", { timeout: 120_000 }, async () => {
  const at = await mkdtemp(join(tmpdir(), "ad-"));
  const r = await runVideoOptions(at, join(project, entry), ["BadPromo", "GoodPromo"]);
  assert.deepEqual(r.findings, []);
  assert.match(r.text, /Contact sheet: /);
  await assert.rejects(runVideoOptions(at, join(project, entry), ["BadPromo", "Nope"]), /No composition "Nope".*It has: BadPromo, GoodPromo/);
});

test("video lock: the locked promo passes; a drifted one is caught for color and font", { timeout: 120_000 }, async () => {
  const at = await mkdtemp(join(tmpdir(), "ad-"));
  await runVideoLock(at, join(project, entry), "GoodPromo", "promo");
  assert.ok(!(await rules("GoodPromo", "promo", at)).some((r) => r.startsWith("off-lock")));
  const drift = await rules("DriftPromo", "promo", at);
  assert.ok(drift.includes("off-lock-colors"));
  assert.ok(drift.includes("off-lock-fonts"));
});
