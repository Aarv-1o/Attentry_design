// A design opened from the panel: shown as the picture, in one reusable editor tab, since VS Code
// opens an SVG as its code. Anything that isn't a picture (an HTML page, a composition) opens as
// VS Code would open it.
import { randomBytes } from "node:crypto";
import { basename, dirname, extname } from "node:path";
import * as vscode from "vscode";

const PICTURES = new Set([".svg", ".png", ".jpg", ".jpeg", ".webp", ".gif"]);
let panel: vscode.WebviewPanel | undefined;

export async function openDesign(file: string): Promise<void> {
  const uri = vscode.Uri.file(file);
  if (!PICTURES.has(extname(file).toLowerCase())) {
    await vscode.commands.executeCommand("vscode.open", uri);
    return;
  }
  // The tab can only load from the picture's folder, which changes from one design to the next.
  panel?.dispose();
  panel = vscode.window.createWebviewPanel("attentryDesign.preview", basename(file), vscode.ViewColumn.Active, {
    enableScripts: true,
    localResourceRoots: [vscode.Uri.file(dirname(file))],
  });
  panel.onDidDispose(() => (panel = undefined));
  panel.webview.onDidReceiveMessage((m: { type: "source" }) => {
    if (m.type === "source") void vscode.window.showTextDocument(uri);
  });
  const nonce = randomBytes(16).toString("base64");
  // The file's time on the URL, so a design redrawn since the last look isn't served from cache.
  const { mtime } = await vscode.workspace.fs.stat(uri);
  const src = `${panel.webview.asWebviewUri(uri)}?v=${mtime}`;
  panel.webview.html = `<!doctype html><html><head><meta charset="utf-8">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src ${panel.webview.cspSource}; style-src 'nonce-${nonce}'; script-src 'nonce-${nonce}';">
<style nonce="${nonce}">
  body { margin: 0; display: grid; grid-template-rows: auto 1fr; height: 100vh; color: var(--vscode-foreground); font: var(--vscode-font-size) var(--vscode-font-family); }
  header { display: flex; gap: 12px; align-items: center; padding: 8px 16px; border-bottom: 1px solid color-mix(in srgb, var(--vscode-foreground) 12%, transparent); }
  header span { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: var(--vscode-descriptionForeground); }
  button { font: inherit; color: var(--vscode-textLink-foreground); background: none; border: 0; cursor: pointer; padding: 0; }
  button:hover { text-decoration: underline; }
  main { display: grid; place-items: center; padding: 16px; min-height: 0; }
  img { max-width: 100%; max-height: 100%; object-fit: contain; box-shadow: 0 2px 16px rgba(0, 0, 0, 0.35); }
</style></head><body>
<header><span title="${escape(file)}">${escape(file)}</span>${extname(file).toLowerCase() === ".svg" ? `<button id="source">Open the SVG's code</button>` : ""}</header>
<main><img src="${src}" alt="${escape(basename(file))}"></main>
<script nonce="${nonce}">
  const vscode = acquireVsCodeApi();
  document.getElementById("source")?.addEventListener("click", () => vscode.postMessage({ type: "source" }));
</script></body></html>`;
}

const escape = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
