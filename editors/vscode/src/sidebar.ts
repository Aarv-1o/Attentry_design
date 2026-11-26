// The Attentry Design panel in the activity bar, top to bottom: the project (any folder in the
// window with designs in it), what's happening now (with a tip while a check runs), the mode, setup,
// and the project's design locks, each with its designs to open (the lock in use first). The designs themselves stay in the chat; the panel shows what the chat can't keep in view.
import { randomBytes } from "node:crypto";
import { homedir } from "node:os";
import { basename, dirname, join, relative, resolve } from "node:path";
import * as vscode from "vscode";
import type { DesignKind } from "../../../src/brief.ts";
import { LOCK_DIR } from "../../../src/lock.ts";
import { browser, connect, libraries, pluginState, refresh, type PluginState } from "./claude.ts";
import { restoreDesign, type LockDesigns } from "../../../src/status.ts";
import { locks, projectStatus, setPin } from "./design.ts";
import { openDesign } from "./preview.ts";
import { TIPS } from "./tips.ts";

type FromPanel =
  | { type: "ready" | "connect" | "refresh" }
  | { type: "open" | "view"; path: string }
  | { type: "copy"; text: string }
  | { type: "project"; path: string }
  | { type: "mode"; kind: DesignKind | "auto" }
  | { type: "restore"; lock: string; n: number };

const INSTALL_POLL_MS = 3000; // while the libraries install in the background
const PROJECT_KEY = "attentryDesign.project";

export class Sidebar implements vscode.WebviewViewProvider {
  private view: vscode.WebviewView | undefined;
  private plugin: PluginState | "checking" | "connecting" = "checking";
  private justConnected = false;
  private poll: ReturnType<typeof setInterval> | undefined;
  private projects: { path: string; name: string }[] = [];

  constructor(private readonly extension: vscode.Uri, private readonly memory: vscode.Memento) {}

  /** The plugin marketplace this extension carries (built into claude/). */
  private get home(): string {
    return join(this.extension.fsPath, "claude");
  }

  private get folders(): string[] {
    return (vscode.workspace.workspaceFolders ?? []).map((f) => f.uri.fsPath);
  }

  /** The folder the panel shows: the one picked, while it's still there, else the first. */
  private get project(): string | undefined {
    const picked = this.memory.get<string>(PROJECT_KEY);
    return picked && this.projects.some((p) => p.path === picked) ? picked : this.folders[0];
  }

  /**
   * The projects to pick from: the window's folders, and every folder inside them with designs in it
   * (a design folder), like a folder of several projects where the agent ran in one of them.
   */
  private async findProjects(): Promise<void> {
    const found = await vscode.workspace.findFiles(`**/${LOCK_DIR}/*.json`, "**/node_modules/**", 1000);
    const withDesigns = [...new Set(found.map((uri) => dirname(dirname(uri.fsPath))))].sort();
    this.projects = [...new Set([...this.folders, ...withDesigns])].map((path) => {
      const folder = vscode.workspace.getWorkspaceFolder(vscode.Uri.file(path))?.uri.fsPath ?? path;
      const inside = relative(folder, path).replaceAll("\\", "/");
      return { path, name: inside ? `${basename(folder)}/${inside}` : basename(path) };
    });
  }

  /** The page may load its own files, and the versions' renders inside the window's folders. */
  private allowFolders(view: vscode.WebviewView): void {
    view.webview.options = { enableScripts: true, localResourceRoots: [vscode.Uri.joinPath(this.extension, "media"), ...(vscode.workspace.workspaceFolders ?? []).map((f) => f.uri)] };
  }

  resolveWebviewView(view: vscode.WebviewView): void {
    this.view = view;
    this.allowFolders(view);
    // Unguessable, or a script injected into the page could carry it (Math.random() can be predicted).
    const nonce = randomBytes(16).toString("base64");
    const script = view.webview.asWebviewUri(vscode.Uri.joinPath(this.extension, "media", "sidebar.js"));
    const style = view.webview.asWebviewUri(vscode.Uri.joinPath(this.extension, "media", "sidebar.css"));
    view.webview.html = `<!doctype html><html><head><meta charset="utf-8">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src ${view.webview.cspSource}; style-src ${view.webview.cspSource}; script-src 'nonce-${nonce}';">
<link rel="stylesheet" href="${style}"></head><body><div id="app"></div><script nonce="${nonce}" src="${script}"></script></body></html>`;
    view.webview.onDidReceiveMessage((m: FromPanel) => void this.handle(m));
    view.onDidChangeVisibility(() => void (view.visible && this.checkSetup()));
    view.onDidDispose(() => {
      this.view = undefined;
      this.stopPoll();
    });
  }

  private async handle(m: FromPanel): Promise<void> {
    if (m.type === "ready" || m.type === "refresh") await this.checkSetup();
    else if (m.type === "connect") await this.connect();
    else if (m.type === "open") await vscode.window.showTextDocument(vscode.Uri.file(m.path));
    else if (m.type === "view") await openDesign(m.path);
    else if (m.type === "copy") {
      await vscode.env.clipboard.writeText(m.text);
      void vscode.window.showInformationMessage("Copied. Run it in a terminal.");
    } else if (m.type === "project") {
      await this.memory.update(PROJECT_KEY, m.path);
      await this.send();
    } else if (m.type === "restore" && this.project) {
      try {
        const v = await restoreDesign(this.project, m.lock, m.n);
        void vscode.window.showInformationMessage(`Put v${v.n} back in ${basename(v.file)}. What was there is kept as a version.`);
      } catch (error) {
        void vscode.window.showErrorMessage(`Couldn't put v${m.n} back: ${(error as Error).message}`);
      }
      await this.send();
    } else if (m.type === "mode" && this.project) {
      await setPin(this.project, m.kind === "auto" ? undefined : m.kind);
      await this.send();
    }
  }

  async connect(): Promise<void> {
    this.plugin = "connecting";
    await this.send();
    this.plugin = await connect(this.home, this.project ?? homedir());
    this.justConnected = "installed" in this.plugin && this.plugin.installed;
    await this.send();
  }

  /** At startup: brings Claude Code's copy of the plugin up to this extension's. */
  async start(): Promise<void> {
    await this.findProjects();
    this.plugin = await refresh(this.home, this.project ?? homedir());
    await this.send();
  }

  /** Asks Claude Code about the plugin (a second or two), then shows everything. */
  private async checkSetup(): Promise<void> {
    if (this.plugin === "connecting") return;
    this.plugin = await pluginState(this.project ?? homedir(), this.home);
    await this.send();
  }

  /** Something changed in a design folder (a lock saved, a tool started or finished), or the window's folders. */
  async projectChanged(file?: vscode.Uri): Promise<void> {
    if (!file && this.view) this.allowFolders(this.view); // the window's folders changed
    if (!file || !this.projects.some((p) => p.path === dirname(dirname(file.fsPath)))) await this.findProjects();
    await this.send();
  }

  /**
   * A lock's designs, to open from the panel: the option it was picked from (the tree's root), its
   * versions with a thumbnail of each render, and the round's other options. A lock saved before
   * designs were kept has only the option it came from.
   */
  private lockDesigns(kept: LockDesigns | undefined, from: string) {
    const picked = kept?.picked ?? from.replaceAll("\\", "/");
    const thumb = (render: string | undefined, at: number) => (render && this.view ? `${this.view.webview.asWebviewUri(vscode.Uri.file(render))}?v=${at}` : undefined);
    return {
      picked,
      options: (kept?.options ?? []).filter((o) => o !== picked),
      head: kept?.head,
      versions: (kept?.versions ?? []).map((v) => ({ n: v.n, parent: v.parent, at: v.at, snapshot: v.snapshot, file: v.file, thumb: thumb(v.render, v.at) })),
    };
  }

  private stopPoll(): void {
    clearInterval(this.poll);
    this.poll = undefined;
  }

  private async send(): Promise<void> {
    if (!this.view) return;
    const plugin = this.plugin;
    const path = typeof plugin === "object" && "path" in plugin ? plugin.path : undefined;
    const libs = typeof plugin === "object" && "installed" in plugin && plugin.installed ? libraries(path) : undefined;
    // The libraries install in the background at a session's start: follow until they're ready.
    if (libs === "installing" && !this.poll) this.poll = setInterval(() => void this.send(), INSTALL_POLL_MS);
    if (libs !== "installing") this.stopPoll();
    const project = this.project;
    const { designs, ...status } = project ? await projectStatus(project) : {};
    const inUse = status.running?.lock ?? status.last?.lock;
    const found = project ? await locks(project) : [];
    await this.view.webview.postMessage({
      type: "state",
      projects: this.projects,
      project,
      ...status,
      plugin,
      justConnected: this.justConnected,
      libraries: libs,
      browser: browser(),
      // The lock in use first, then newest first.
      locks: found
        .map((e) => ({
          name: e.name,
          path: e.path,
          inUse: e.name === inUse,
          ...("lock" in e
            ? { style: e.lock.style, mood: e.lock.mood, purpose: e.lock.purpose, colors: e.lock.colors, fonts: e.lock.fonts, words: e.lock.words ?? [], size: e.lock.size, designs: this.lockDesigns(designs?.locks[e.name], resolve(project!, e.lock.from)) }
            : { error: e.error }),
        }))
        .sort((a, b) => Number(b.inUse) - Number(a.inUse)),
      tips: TIPS,
    });
  }
}

