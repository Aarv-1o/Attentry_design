// The Claude Code plugin's entry, dist/attentry-design.mjs:
//   hook               the brief (UserPromptSubmit); needs none of the heavy libraries
//   mcp                the stage tools; the stages load on the first tool call
//   setup [--background]  installs the heavy libraries if they're missing (SessionStart)
//
// sharp, playwright-core and tesseract.js (with its English data) are platform-specific or large,
// so they aren't in the bundle. Claude Code installs them next to the plugin from its package.json
// and lockfile when the plugin is installed. If that didn't happen (it gives up after 60 s, and
// --plugin-dir doesn't install), they're installed into the plugin's data folder, which survives
// updates, and the stages (dist/core.mjs) run from there so Node finds them.
import { spawn } from "node:child_process";
import { createWriteStream, existsSync, readFileSync } from "node:fs";
import { copyFile, mkdir, open, readFile, stat, unlink } from "node:fs/promises";
import { homedir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { runHook } from "./hook.ts";
import { hasRuntime, INSTALLING } from "./limits.ts";
import { runMcpServer, type Core } from "./mcp.ts";

const dist = dirname(fileURLToPath(import.meta.url));
const root = join(dist, "..");
const project = process.env.CLAUDE_PROJECT_DIR ?? process.cwd();
const STALE = 10 * 60_000; // an install lock older than this was left by a crashed install

const dataDir = () => process.env.CLAUDE_PLUGIN_DATA || join(homedir(), ".attentry-design", "runtime");
const lockfile = (dir: string) => (existsSync(join(dir, "package-lock.json")) ? readFileSync(join(dir, "package-lock.json"), "utf8") : "");
/** The data folder holds the libraries this version of the plugin asks for. */
const current = (dir: string) => hasRuntime(dir) && lockfile(dir) === lockfile(root);

/** Installs the libraries into `dir` with npm, exactly as the plugin's lockfile pins them. */
async function install(dir: string): Promise<void> {
  await mkdir(dir, { recursive: true });
  const lock = join(dir, INSTALLING);
  // One install at a time: another process (the SessionStart setup, a second session) may be on it.
  for (;;) {
    try {
      await (await open(lock, "wx")).close();
      break;
    } catch {
      const age = Date.now() - (await stat(lock).catch(() => ({ mtimeMs: 0 }))).mtimeMs;
      if (age > STALE) await unlink(lock).catch(() => {});
      else await new Promise((r) => setTimeout(r, 1000));
      if (current(dir)) return;
    }
  }
  try {
    if (current(dir)) return;
    for (const f of ["package.json", "package-lock.json"]) await copyFile(join(root, f), join(dir, f));
    const log = createWriteStream(join(dir, "install.log"));
    const code = await new Promise<number>((resolve, reject) => {
      // Through a shell: npm is npm.cmd on Windows, which Node only starts that way. A fixed
      // command, nothing from outside in it.
      const npm = spawn("npm ci --omit=dev --ignore-scripts --no-audit --no-fund", { cwd: dir, shell: true });
      npm.stdout.pipe(log);
      npm.stderr.pipe(log);
      npm.on("error", reject);
      npm.on("close", (c) => resolve(c ?? 1));
    }).catch(() => -1);
    if (code !== 0 || !hasRuntime(dir)) {
      throw new Error(`Couldn't install Attentry Design's libraries (sharp, Playwright, tesseract.js) with npm into ${dir}. Is npm on the PATH? See ${join(dir, "install.log")}.`);
    }
  } finally {
    await unlink(lock).catch(() => {});
  }
}

/** The stages, from wherever their libraries are: next to the plugin, or in the data folder. */
async function loadCore(): Promise<Core> {
  if (hasRuntime(root)) return import(pathToFileURL(join(dist, "core.mjs")).href);
  const dir = dataDir();
  if (!current(dir)) await install(dir);
  // Node finds a module's packages from where the module is, so the stages run from the data folder.
  const here = join(dir, "core.mjs");
  const built = await readFile(join(dist, "core.mjs"));
  if (!existsSync(here) || !built.equals(await readFile(here))) await copyFile(join(dist, "core.mjs"), here);
  return import(pathToFileURL(here).href);
}

/** SessionStart: get the libraries in place before the first design request. Says nothing. */
async function setup(background: boolean): Promise<void> {
  if (hasRuntime(root) || current(dataDir())) return;
  if (background) {
    // Detached, so the session starts now and the install carries on behind it.
    spawn(process.execPath, [fileURLToPath(import.meta.url), "setup"], { detached: true, stdio: "ignore", windowsHide: true }).unref();
    return;
  }
  await install(dataDir());
}

const [command, flag] = process.argv.slice(2);
if (command === "hook") await runHook();
else if (command === "mcp") runMcpServer(project, loadCore);
else if (command === "setup") await setup(flag === "--background").catch((e: Error) => { process.stderr.write(`${e.message}\n`); process.exitCode = 1; });
else {
  process.stderr.write("Usage: attentry-design.mjs hook | mcp | setup [--background]\n");
  process.exitCode = 1;
}
