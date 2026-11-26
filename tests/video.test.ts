// The video checks on a small Remotion project (fixtures/video): a promo with the faults the
// baseline found most, one without, and one that drifts from a lock.
import { test, after } from "node:test";
import assert from "node:assert/strict";
import { cp, mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { closeBrowser } from "../src/render.ts";
import { closeRemotion } from "../src/remotion.ts";
import { closeOcr } from "../src/lettering.ts";
import { runVideoCheck, runVideoLock, runVideoOptions, runVideoPreview } from "../src/stages.ts";

after(() => Promise.all([closeBrowser(), closeRemotion(), closeOcr()]));

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

test("reading time is measured, not counted in samples: a faded caption legible for 3.13 s is enough for 2.94 s of words", { timeout: 120_000 }, async () => {
  assert.ok(!(await rules("FadedCaption")).includes("text-too-brief"));
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

test("the video's own Remotion is found from its entry file, when the session runs in another folder", { timeout: 120_000 }, async () => {
  await closeRemotion(); // no server left from an earlier test: this one must find Remotion itself
  const elsewhere = await mkdtemp(join(tmpdir(), "ad-"));
  assert.match((await runVideoOptions(elsewhere, join(project, entry), ["BadPromo", "GoodPromo"])).text, /Contact sheet: /);
});

test("the bundle follows the project: a failure isn't kept, and a composition added later is found", { timeout: 240_000 }, async () => {
  const copy = await mkdtemp(join(tmpdir(), "ad-video-"));
  await cp(join(project, "tests/fixtures/video"), copy, { recursive: true });
  const root = join(copy, "Root.tsx");
  const good = await readFile(root, "utf8");
  // The copy has no Remotion of its own: it's found from the session's folder, this repo.
  await writeFile(root, `${good}\nthis is not code`);
  await assert.rejects(runVideoOptions(project, join(copy, "index.ts"), ["BadPromo", "GoodPromo"]));
  await writeFile(root, good);
  assert.match((await runVideoOptions(project, join(copy, "index.ts"), ["BadPromo", "GoodPromo"])).text, /Contact sheet: /);
  await writeFile(root, good.replace('<Composition id="GoodPromo"', '<Composition id="LatePromo" component={GoodPromo} {...common} />\n    <Composition id="GoodPromo"'));
  assert.match((await runVideoOptions(project, join(copy, "index.ts"), ["BadPromo", "LatePromo"])).text, /Contact sheet: /);
});

test("video preview: one frame at a moment, or the key frames, with no checks", { timeout: 120_000 }, async () => {
  const at = await mkdtemp(join(tmpdir(), "ad-"));
  const one = await runVideoPreview(at, join(project, entry), "GoodPromo", [2]);
  assert.match(one.text, /the frame at 2\.00 s/);
  assert.deepEqual(one.findings, []);
  assert.match((await runVideoPreview(at, join(project, entry), "GoodPromo")).text, /frames at .*, .*, .*, .*, /);
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

test("T3: a caption that arrives while the picture behind it is still panning", { timeout: 120_000 }, async () => {
  assert.ok((await rules("MovePromo")).includes("text-during-move"));
});

test("S1: a call to action that's the smallest line is named; a logo ending isn't asked for one", { timeout: 120_000 }, async () => {
  assert.ok((await rules("SmallCtaPromo")).includes("call-to-action-smallest"));
  const logo = await rules("LogoPromo");
  assert.ok(!logo.includes("no-call-to-action") && !logo.includes("call-to-action-smallest"), logo.join(", "));
  assert.ok((await rules("MovePromo")).includes("no-call-to-action"));
  // A tribute asks nothing of the viewer: its lock's purpose keeps the call to action from being asked.
  const at = await mkdtemp(join(tmpdir(), "ad-"));
  await runVideoLock(at, join(project, entry), "MovePromo", "tribute", undefined, undefined, { purpose: "a tribute to a game" });
  assert.ok(!(await rules("MovePromo", "tribute", at)).includes("no-call-to-action"));
});

test("OCR: lettering inside a picture that runs off the frame is cut off", { timeout: 180_000 }, async () => {
  const r = await runVideoCheck(project, join(project, entry), "ImagePromo");
  const cut = r.findings.find((f) => f.rule === "text-cut");
  assert.ok(cut, r.text);
  assert.match(cut.message, /in a picture at/);
});

test("the approved script: a line missing, a line out of order, a line up shorter than approved", { timeout: 120_000 }, async () => {
  const at = await mkdtemp(join(tmpdir(), "ad-"));
  await runVideoLock(at, join(project, entry), "CardPromo", "card", undefined, ["Checks every edit | 3s", "Built in a weekend", "Ship faster"]);
  const r = await runVideoCheck(at, join(project, entry), "CardPromo", "card");
  const by = (rule: string) => r.findings.find((f) => f.rule === rule)?.message ?? "";
  assert.match(by("approved-words"), /"Ship faster" \(ship, faster\)/);
  assert.match(by("script-order"), /"Built in a weekend" comes before "Checks every edit"/);
  assert.match(by("script-timing"), /"Checks every edit" is up 1\.\d s of the 3 s approved/);
});
