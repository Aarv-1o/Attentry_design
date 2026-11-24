// The three stages that do work (options, lock, finish), as the command line and the MCP tools
// both run them. Each returns the text the person or the agent reads, plus the data behind it.
import { mkdir } from "node:fs/promises";
import { isAbsolute, join, relative, resolve } from "node:path";
import { render, type RenderOptions } from "./render.ts";
import { measure } from "./measure.ts";
import { compareOptions, contactSheet } from "./options.ts";
import { LOCK_DIR, readLock, writeLock } from "./lock.ts";
import { check } from "./check.ts";
import { format, type Finding } from "./findings.ts";

export interface StageResult {
  text: string;
  findings: Finding[];
  data: Record<string, unknown>;
}

const inProject = (project: string, file: string) => (isAbsolute(file) ? file : resolve(project, file));
const shown = (project: string, file: string) => {
  const rel = relative(project, file);
  return (rel.startsWith("..") ? file : rel).replaceAll("\\", "/");
};

export async function runOptions(project: string, files: string[], size: RenderOptions = {}, out?: string): Promise<StageResult> {
  const rendered = await Promise.all(files.map((f) => render(inProject(project, f), size)));
  const { options, findings } = await compareOptions(rendered);
  let sheet = out ? inProject(project, out) : undefined;
  if (!sheet) {
    await mkdir(join(project, LOCK_DIR, "sheets"), { recursive: true });
    sheet = join(project, LOCK_DIR, "sheets", `options-${stamp()}.png`);
  }
  await contactSheet(rendered, options, sheet);
  const lines = options.map((o) => `  ${o.number}. ${shown(project, o.file)}`);
  const verdict = findings.length
    ? `${format(findings)}\nRedo the options named above, then call this again.`
    : "The options really differ. Show the person the contact sheet and ask which one, by number.";
  return {
    text: `Contact sheet: ${shown(project, sheet)}\n${lines.join("\n")}\n${verdict}`,
    findings,
    data: {
      sheet,
      options: options.map(({ number, file, measures: m }) => ({ number, file, subject: m.subject, field: m.field, palette: m.palette.map((s) => s.hex) })),
    },
  };
}

export async function runLock(project: string, file: string, name: string, size: RenderOptions = {}): Promise<StageResult> {
  const rendered = await render(inProject(project, file), size);
  const m = await measure(rendered.png);
  const path = await writeLock(project, name, rendered, m);
  const lock = await readLock(project, name);
  return {
    text: `Locked "${name}" from ${shown(project, rendered.file)} (${shown(project, path)}): colors ${lock.colors.join(", ")}; fonts ${lock.fonts.join(", ") || "none"}; ${lock.size.width}×${lock.size.height}. Check the finished design with check_design and lock "${name}".`,
    findings: [],
    data: { lock: path },
  };
}

export async function runCheck(project: string, file: string, lockName?: string, size: RenderOptions = {}): Promise<StageResult> {
  const rendered = await render(inProject(project, file), size);
  const lock = lockName ? await readLock(project, lockName) : undefined;
  const findings = await check(rendered, await measure(rendered.png), lock);
  const errors = findings.filter((f) => f.kind === "error").length;
  const head = findings.length === 0
    ? `${shown(project, rendered.file)}: no findings.`
    : `${shown(project, rendered.file)}: ${errors} to fix, ${findings.length - errors} suggestion${findings.length - errors === 1 ? "" : "s"}.`;
  return { text: findings.length ? `${head}\n${format(findings)}` : head, findings, data: {} };
}

function stamp(): string {
  return new Date().toISOString().replace(/\D/g, "").slice(0, 14);
}
