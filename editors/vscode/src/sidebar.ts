// The Attentry Design panel in the activity bar, top to bottom: the project, what's happening now
// (with a tip while a check runs), the mode, setup, and the project's design locks (the one in use
// first). The designs themselves stay in the chat; the panel shows what the chat can't keep in view.
import { randomBytes } from "node:crypto";
import { homedir } from "node:os";
import { basename, join } from "node:path";
import * as vscode from "vscode";
import type { DesignKind } from "../../../src/brief.ts";
import { browser, connect, libraries, pluginState, refresh, type PluginState } from "./claude.ts";
import { locks, projectStatus, setPin } from "./design.ts";
import { TIPS } from "./tips.ts";

type FromPanel =
  | { type: "ready" | "connect" | "refresh" }
  | { type: "open"; path: string }
  | { type: "copy"; text: string }
  | { type: "project"; path: string }
  | { type: "mode"; kind: DesignKind | "auto" };

const INSTALL_POLL_MS = 3000; // while the libraries install in the background
const PROJECT_KEY = "attentryDesign.project";

export class Sidebar implements vscode.WebviewViewProvider {
  private view: vscode.WebviewView | undefined;
  private plugin: PluginState | "checking" | "connecting" = "checking";
  private justConnected = false;
  private poll: ReturnType<typeof setInterval> | undefined;

  constructor(private readonly extension: vscode.Uri, private readonly memory: vscode.Memento) {}

  /** The plugin marketplace this extension carries (built into claude/). */
  private get home(): string {
    return join(this.extension.fsPath, "claude");
  }

  private get folders(): string[] {
    return (vscode.workspace.workspaceFolders ?? []).map((f) => f.uri.fsPath);
  }

  /** The folder the panel shows: the one picked, while it's still open, else the first. */
  private get project(): string | undefined {
    const picked = this.memory.get<string>(PROJECT_KEY);
    return picked && this.folders.includes(picked) ? picked : this.folders[0];
  }

  resolveWebviewView(view: vscode.WebviewView): void {
    this.view = view;
    view.webview.options = { enableScripts: true, localResourceRoots: [vscode.Uri.joinPath(this.extension, "media")] };
    // Unguessable, or a script injected into the page could carry it (Math.random() can be predicted).
    const nonce = randomBytes(16).toString("base64");
    const script = view.webview.asWebviewUri(vscode.Uri.joinPath(this.extension, "media", "sidebar.js"));
    const style = view.webview.asWebviewUri(vscode.Uri.joinPath(this.extension, "media", "sidebar.css"));
    view.webview.html = `<!doctype html><html><head><meta charset="utf-8">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${view.webview.cspSource}; script-src 'nonce-${nonce}';">
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
    else if (m.type === "copy") {
      await vscode.env.clipboard.writeText(m.text);
      void vscode.window.showInformationMessage("Copied. Run it in a terminal.");
    } else if (m.type === "project") {
      await this.memory.update(PROJECT_KEY, m.path);
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
    this.plugin = await refresh(this.home, this.project ?? homedir());
    await this.send();
  }

  /** Asks Claude Code about the plugin (a second or two), then shows everything. */
  private async checkSetup(): Promise<void> {
    if (this.plugin === "connecting") return;
    this.plugin = await pluginState(this.project ?? homedir(), this.home);
    await this.send();
  }

  /** Something changed in a project's design folder: a lock saved, a tool started or finished. */
  async projectChanged(): Promise<void> {
    await this.send();
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
    const status = project ? await projectStatus(project) : {};
    const inUse = status.running?.lock ?? status.last?.lock;
    const found = project ? await locks(project) : [];
    await this.view.webview.postMessage({
      type: "state",
      folders: this.folders.map((f) => ({ path: f, name: basename(f) })),
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
            ? { style: e.lock.style, colors: e.lock.colors, fonts: e.lock.fonts, words: e.lock.words ?? [], size: e.lock.size, from: join(project!, e.lock.from) }
            : { error: e.error }),
        }))
        .sort((a, b) => Number(b.inUse) - Number(a.inUse)),
      tips: TIPS,
    });
  }
}
