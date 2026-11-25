// Attentry Design in VS Code: the panel, and a watch on each project's design folder so the panel
// follows the agent (a check starting and finishing, a lock saved, a design request) without being asked.
import * as vscode from "vscode";
import { LOCK_DIR } from "../../../src/lock.ts";
import { Sidebar } from "./sidebar.ts";

export function activate(context: vscode.ExtensionContext): void {
  const sidebar = new Sidebar(context.extensionUri, context.workspaceState);
  const watcher = vscode.workspace.createFileSystemWatcher(`**/${LOCK_DIR}/*.json`);
  const changed = () => void sidebar.projectChanged();
  void sidebar.start();
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider("attentryDesign.panel", sidebar),
    vscode.commands.registerCommand("attentryDesign.connect", () => sidebar.connect()),
    watcher,
    watcher.onDidCreate(changed),
    watcher.onDidChange(changed),
    watcher.onDidDelete(changed),
    vscode.workspace.onDidChangeWorkspaceFolders(changed),
  );
}
