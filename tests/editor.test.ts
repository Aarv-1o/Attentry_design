// The editor panel's reading of the project and of Claude Code's setup (the parts without VS Code).
import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, mkdir, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { locks, projectStatus, setPin } from "../editors/vscode/src/design.ts";
import { libraries, PLUGIN } from "../editors/vscode/src/claude.ts";
import { LOCK_DIR } from "../src/lock.ts";
import { RUNNING } from "../src/status.ts";
import { brief } from "../src/brief.ts";
import { INSTALLING, RUNTIME } from "../src/limits.ts";

const lock = (name: string, locked: string) => JSON.stringify({ name, style: "pixel art", from: "art/a.svg", size: { width: 600, height: 800 }, colors: ["#112233"], fonts: ["Arial"], composition: { subject: { x: 0.3, y: 0.4 }, centered: false }, field: "white", locked });

test("locks: newest first; a lock that isn't JSON is listed with its error, not dropped", async () => {
  const project = await mkdtemp(join(tmpdir(), "ad-"));
  await mkdir(join(project, LOCK_DIR));
  await writeFile(join(project, LOCK_DIR, "old.lock.json"), lock("old", "2026-11-01T00:00:00Z"));
  await writeFile(join(project, LOCK_DIR, "new.lock.json"), lock("new", "2026-11-20T00:00:00Z"));
  await writeFile(join(project, LOCK_DIR, "broken.lock.json"), "{ not json");
  const found = await locks(project);
  assert.deepEqual(found.map((e) => e.name), ["new", "old", "broken"]);
  assert.ok("error" in found[2]);
  assert.deepEqual(await locks(await mkdtemp(join(tmpdir(), "ad-"))), []);
});

test("status: a fresh running marker shows; a stale one (a session closed mid-check) doesn't", async () => {
  const project = await mkdtemp(join(tmpdir(), "ad-"));
  assert.equal((await projectStatus(project)).running, undefined);
  await mkdir(join(project, LOCK_DIR));
  await writeFile(join(project, LOCK_DIR, RUNNING), JSON.stringify({ tool: "check_design", started: Date.now(), lock: "cover" }));
  assert.equal((await projectStatus(project)).running?.lock, "cover");
  await writeFile(join(project, LOCK_DIR, RUNNING), JSON.stringify({ tool: "check_design", started: Date.now() - 60 * 60_000 }));
  assert.equal((await projectStatus(project)).running, undefined);
});

test("mode: a pinned kind wins over the guess for design requests only; Auto goes back to guessing", async () => {
  const project = await mkdtemp(join(tmpdir(), "ad-"));
  assert.match((await brief("make a poster", project))!, /illustration request/);
  assert.deepEqual({ ...(await projectStatus(project)).task, at: 0 }, { kind: "illustration", at: 0, pinned: false });
  await setPin(project, "video");
  assert.match((await brief("make a poster", project))!, /video request/);
  assert.equal((await projectStatus(project)).task?.pinned, true);
  assert.equal(await brief("fix the login bug", project), undefined, "a code request stays silent, pin or not");
  await setPin(project, undefined);
  assert.equal((await projectStatus(project)).pin, undefined);
  assert.match((await brief("make a poster", project))!, /illustration request/);
});

test("libraries: beside the plugin or in its data folder; installing while the install lock is there", async () => {
  const config = await mkdtemp(join(tmpdir(), "ad-claude-"));
  const before = process.env.CLAUDE_CONFIG_DIR;
  process.env.CLAUDE_CONFIG_DIR = config;
  try {
    const plugin = await mkdtemp(join(tmpdir(), "ad-plugin-"));
    assert.equal(libraries(plugin), "missing");
    const data = join(config, "plugins", "data", PLUGIN.replace("@", "-"));
    await mkdir(data, { recursive: true });
    await writeFile(join(data, INSTALLING), "");
    assert.equal(libraries(plugin), "installing");
    for (const p of RUNTIME) {
      await mkdir(join(plugin, "node_modules", p), { recursive: true });
      await writeFile(join(plugin, "node_modules", p, "package.json"), "{}");
    }
    assert.equal(libraries(plugin), "ready");
  } finally {
    if (before === undefined) delete process.env.CLAUDE_CONFIG_DIR;
    else process.env.CLAUDE_CONFIG_DIR = before;
  }
});
