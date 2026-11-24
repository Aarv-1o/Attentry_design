// attentry-design options <files…>     stage 2: contact sheet and whether the options really differ
// attentry-design lock <file> --name n   stage 3: save the picked option as a design lock
// attentry-design check <file> [--lock n] stage 4: errors and suggestions in the finished design
// attentry-design hook                   Claude Code's hooks (stage 1, the brief)
// attentry-design mcp                    the stage tools for the agent
import { parseArgs } from "node:util";
import { closeBrowser } from "./render.ts";
import { parseSize, runCheck, runLock, runOptions, type StageResult } from "./stages.ts";
import { runHook } from "./hook.ts";
import { runMcpServer } from "./mcp.ts";

const USAGE = `Usage:
  attentry-design options <file> <file> [… up to 5] [--out sheet.png]
  attentry-design lock <file> --name <name>
  attentry-design check <file> [--lock <name>]
  attentry-design hook | mcp      (for Claude Code)
Options: --size WxH (for HTML pages; SVGs use their own size), --json`;

const project = process.env.CLAUDE_PROJECT_DIR ?? process.cwd();

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
  const print = (r: StageResult) => console.log(values.json ? JSON.stringify({ ...r.data, findings: r.findings }, null, 2) : r.text);

  switch (command) {
    case "options":
      print(await runOptions(project, files, size, values.out));
      return 0;
    case "lock":
      if (files.length !== 1 || !values.name) throw new Error("lock takes one file and --name.");
      print(await runLock(project, files[0], values.name, size));
      return 0;
    case "check": {
      if (files.length !== 1) throw new Error("check takes one file.");
      const r = await runCheck(project, files[0], values.lock, size);
      print(r);
      return r.findings.some((f) => f.kind === "error") ? 2 : 0;
    }
    default:
      console.error(USAGE);
      return 1;
  }
}


const [command] = process.argv.slice(2);
if (command === "hook") {
  await runHook();
} else if (command === "mcp") {
  runMcpServer(project);
} else {
  await main(process.argv.slice(2))
    .then((code) => (process.exitCode = code))
    .catch((e: Error) => {
      console.error(e.message);
      process.exitCode = 1;
    })
    .finally(closeBrowser);
}
