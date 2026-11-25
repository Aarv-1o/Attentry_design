// What the panel's setup section shows and does: whether Claude Code has Attentry Design, Connect,
// whether the stages' libraries are installed, and whether a browser is there to render with. No
// vscode import, so the tests can run it.
import { execFile } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { promisify } from "node:util";
import { hasRuntime, INSTALLING } from "../../../src/limits.ts";

const run = promisify(execFile);
const MARKETPLACE = "attentry-design";
export const PLUGIN = `attentry-design@${MARKETPLACE}`;
const claudeDir = () => process.env.CLAUDE_CONFIG_DIR || join(homedir(), ".claude");

// Claude Code's command. Usually an .exe; an npm install on Windows gives a .cmd, which only a shell
// can start (Node refuses it without one: ENOENT by name, EINVAL by path). Attentry does the same.
async function claude(args: string[], folder: string) {
  const command = process.env.ATTENTRY_CLAUDE || "claude";
  const options = { cwd: folder, timeout: 120_000, windowsHide: true };
  try {
    return await run(command, args, options);
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;
    if (process.platform !== "win32" || (code !== "ENOENT" && code !== "EINVAL")) throw error;
    const line = [command, ...args].map((a) => (/[\s&()^|<>"]/.test(a) ? `"${a}"` : a)).join(" ");
    return run(line, [], { ...options, shell: true });
  }
}

export type PluginState =
  | { installed: false }
  | { installed: true; enabled: boolean; version: string; path?: string }
  | { error: string; command: string };

/** What to run by hand when `claude` can't be run from here. */
const connectCommand = (home: string) => `claude plugin marketplace add "${home}" && claude plugin install ${PLUGIN}`;

function failed(error: unknown, command: string): { error: string; command: string } {
  const missing = (error as NodeJS.ErrnoException).code === "ENOENT" || /not recognized|not found/i.test(String((error as { stderr?: string }).stderr ?? ""));
  return { error: missing ? "Claude Code's `claude` command isn't installed" : (error as Error).message.split("\n")[0]!, command };
}

export async function pluginState(folder: string, home: string): Promise<PluginState> {
  try {
    const listed = JSON.parse((await claude(["plugin", "list", "--json"], folder)).stdout) as { id: string; enabled: boolean; version: string; installPath?: string }[];
    const found = listed.find((p) => p.id === PLUGIN);
    return found ? { installed: true, enabled: found.enabled, version: found.version, ...(found.installPath ? { path: found.installPath } : {}) } : { installed: false };
  } catch (error) {
    return failed(error, connectCommand(home));
  }
}

// Connect: installs (or turns on, or updates) the plugin this extension carries in `home`, a plugin
// marketplace. Adding it again points Claude Code here, also after an update moved the extension.
export async function connect(home: string, folder: string): Promise<PluginState> {
  try {
    await claude(["plugin", "marketplace", "add", home], folder);
    await claude(["plugin", "install", PLUGIN, "--scope", "user"], folder);
    await claude(["plugin", "enable", PLUGIN], folder).catch(() => undefined); // already enabled: fine
    await claude(["plugin", "update", PLUGIN], folder);
  } catch (error) {
    return failed(error, connectCommand(home));
  }
  return pluginState(folder, home);
}

// Versions in order (0.1.10 after 0.1.9).
const byVersion = new Intl.Collator("en", { numeric: true }).compare;
const carried = (home: string) => (JSON.parse(readFileSync(join(home, "attentry-design", ".claude-plugin", "plugin.json"), "utf8")) as { version: string }).version;

/**
 * When the editor starts: a plugin older than the one this extension carries is updated, so an
 * extension update reaches the agent. A newer one (from another editor's extension) is left alone.
 */
export async function refresh(home: string, folder: string): Promise<PluginState> {
  const state = await pluginState(folder, home);
  if (!("installed" in state) || !state.installed || byVersion(state.version, carried(home)) >= 0) return state;
  return connect(home, folder);
}

/**
 * The stages' libraries: beside Claude Code's copy of the plugin (installed with it), or in the
 * plugin's data folder (installed by the plugin when a session starts, in the background).
 */
export function libraries(pluginPath: string | undefined): "ready" | "installing" | "missing" {
  const data = join(claudeDir(), "plugins", "data", PLUGIN.replace("@", "-"));
  if ((pluginPath && hasRuntime(pluginPath)) || hasRuntime(data)) return "ready";
  return existsSync(join(data, INSTALLING)) ? "installing" : "missing";
}

// Where Chrome and Edge install, the channels the renderer launches through Playwright (which keeps
// its own list internal).
function browserPaths(): [string, string][] {
  const env = process.env;
  if (process.platform === "win32") {
    const roots = [env.PROGRAMFILES, env["PROGRAMFILES(X86)"], env.LOCALAPPDATA].filter((r): r is string => !!r);
    return roots.flatMap((r) => [["Chrome", join(r, "Google", "Chrome", "Application", "chrome.exe")], ["Edge", join(r, "Microsoft", "Edge", "Application", "msedge.exe")]] as [string, string][]);
  }
  if (process.platform === "darwin") {
    return [["Chrome", "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"], ["Edge", "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge"]];
  }
  return [["Chrome", "/opt/google/chrome/chrome"], ["Chrome", "/usr/bin/google-chrome"], ["Edge", "/opt/microsoft/msedge/msedge"], ["Edge", "/usr/bin/microsoft-edge"]];
}

/** The browser designs render in: Chrome or Edge, whichever is installed. */
export function browser(): string | undefined {
  return browserPaths().find(([, path]) => existsSync(path))?.[0];
}
