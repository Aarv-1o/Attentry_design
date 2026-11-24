// attentry-design options <files…>    stage 2: contact sheet and whether the options really differ
// attentry-design lock <file> --name n  stage 3: save the picked option as a design lock
// attentry-design check <file> [--lock n] stage 4: errors and defaults in the finished design
import { parseArgs } from "node:util";
import { resolve, join } from "node:path";
import { closeBrowser, render, type RenderOptions } from "./render.ts";
import { measure } from "./measure.ts";
import { compareOptions, contactSheet } from "./options.ts";
import { readLock, writeLock } from "./lock.ts";
import { check } from "./check.ts";
import { format, type Finding } from "./findings.ts";

const USAGE = `Usage:
  attentry-design options <file> <file> [… up to 5] [--out sheet.png]
  attentry-design lock <file> --name <name>
  attentry-design check <file> [--lock <name>]
Options: --size WxH (for HTML pages; SVGs use their own size), --json`;

async function main(argv: string[]): Promise<number> {
  const { positionals, values } = parseArgs({
    args: argv,
    allowPositionals: true,
    options: {
      out: { type: "string" },
      name: { type: "string" },
      lock: { type: "string" },
      size: { type: "string" },
      json: { type: "boolean", default: false },
      help: { type: "boolean", short: "h", default: false },
    },
  });
  const [command, ...files] = positionals;
  if (values.help || !command) {
    console.log(USAGE);
    return command ? 0 : 1;
  }
  const size = parseSize(values.size);
  const project = process.cwd();
  const print = (findings: Finding[], extra: Record<string, unknown> = {}) =>
    console.log(values.json ? JSON.stringify({ ...extra, findings }, null, 2) : format(findings));

  if (command === "options") {
    const rendered = await Promise.all(files.map((f) => render(resolve(f), size)));
    const { options, findings } = await compareOptions(rendered);
    const sheet = await contactSheet(rendered, options, resolve(values.out ?? join(project, "options.png")));
    if (!values.json) console.log(`Contact sheet: ${sheet}`);
    print(findings, { sheet, options: options.map(({ number, file, measures: m }) => ({ number, file, subject: m.subject, field: m.field, palette: m.palette.map((s) => s.hex) })) });
    return 0;
  }
  if (command === "lock") {
    if (files.length !== 1 || !values.name) throw new Error("lock takes one file and --name.");
    const rendered = await render(resolve(files[0]), size);
    const path = await writeLock(project, values.name, rendered, await measure(rendered.png));
    console.log(values.json ? JSON.stringify({ lock: path }) : `Locked: ${path}`);
    return 0;
  }
  if (command === "check") {
    if (files.length !== 1) throw new Error("check takes one file.");
    const rendered = await render(resolve(files[0]), size);
    const lock = values.lock ? await readLock(project, values.lock) : undefined;
    const findings = await check(rendered, await measure(rendered.png), lock);
    print(findings);
    return findings.some((f) => f.kind === "error") ? 2 : 0;
  }
  console.error(USAGE);
  return 1;
}

function parseSize(s?: string): RenderOptions {
  if (!s) return {};
  const m = /^(\d+)x(\d+)$/.exec(s);
  if (!m) throw new Error("--size is WxH, e.g. 1200x630.");
  return { width: Number(m[1]), height: Number(m[2]) };
}

main(process.argv.slice(2))
  .then((code) => (process.exitCode = code))
  .catch((e: Error) => {
    console.error(e.message);
    process.exitCode = 1;
  })
  .finally(closeBrowser);
