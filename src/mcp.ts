// `attentry-design mcp`: the stage tools for Claude Code (and any agent that speaks MCP). Paths are
// relative to the project the agent works in. Nothing else may go to stdout: it's the agent's
// channel.
import { McpServer } from "@modelcontextprotocol/server";
import { serveStdio } from "@modelcontextprotocol/server/stdio";
import { z } from "zod";
import manifest from "../package.json" with { type: "json" };
import { closeBrowser } from "./render.ts";
import { MAX_OPTIONS } from "./options.ts";
import { parseSize, runCheck, runLock, runOptions, type StageResult } from "./stages.ts";

const INSTRUCTIONS = `Attentry Design checks the illustrations and videos you make, without AI. It checks quality, never taste.
- Before the full drawing: draw 2–${MAX_OPTIONS} small options as files and call check_options. Redo what it flags, then let the person pick by number.
- When the person picks: call lock_design with that file.
- When the design is finished: call check_design (with the lock). Fix the errors; mention the suggestions.`;

const FILE = z.string().min(1).max(1_000);
const SIZE = z.string().regex(/^\d+x\d+$/, "Give size as WxH, like 1200x630.").optional()
  .describe("For HTML files: the page size as WxH, like 1200x630. SVGs use their own size.");
const NAME = z.string().regex(/^[\w-]{1,60}$/, "Letters, digits, - and _ only.").describe('A short name for the lock, like "invitation".');

const TOOLS = {
  check_options: {
    title: "Check the options",
    description: `Call with 2–${MAX_OPTIONS} small design options (SVG or HTML files) before drawing the final. Renders them into one numbered contact sheet and says whether they really differ: nearly the same picture, all centered, one value plan, one palette. Never says which is better.`,
    inputSchema: z.object({
      files: z.array(FILE).min(2).max(MAX_OPTIONS).describe('The option files, in order, like ["design/option-1.svg", "design/option-2.svg"].'),
      size: SIZE,
    }),
  },
  lock_design: {
    title: "Lock the chosen design",
    description: "Call when the person picks an option. Saves its colors, fonts, size, composition and value plan as a design lock, which check_design holds the finished work to.",
    inputSchema: z.object({ file: FILE.describe("The chosen option's file."), name: NAME, size: SIZE }),
  },
  check_design: {
    title: "Check the finished design",
    description: "Call on a finished design (SVG or HTML). Errors to fix: text contrast below WCAG, text cut off or at the edge, colors or fonts outside the lock. Suggestions: the AI defaults (dead-center subject, everything mid-grey, too saturated, raw red, yellow and blue together). Each with its source.",
    inputSchema: z.object({ file: FILE, lock: NAME.optional().describe("The lock to hold it to."), size: SIZE }),
  },
} as const;


export function runMcpServer(project: string): void {
  const call = async (run: () => Promise<StageResult>) => {
    try {
      return { content: [{ type: "text" as const, text: (await run()).text }] };
    } catch (error) {
      // A failed tool is a result the agent can read, not a broken connection.
      return { content: [{ type: "text" as const, text: `Attentry Design failed: ${(error as Error).message}` }], isError: true };
    }
  };
  // Renders the project's own files and writes only under .attentry-design/.
  const annotations = { readOnlyHint: false, destructiveHint: false, openWorldHint: false };
  serveStdio(() => {
    const server = new McpServer({ name: "attentry-design", version: manifest.version ?? "0.0.0" }, { instructions: INSTRUCTIONS });
    server.registerTool("check_options", { ...TOOLS.check_options, annotations }, (a) => call(() => runOptions(project, a.files, parseSize(a.size))));
    server.registerTool("lock_design", { ...TOOLS.lock_design, annotations }, (a) => call(() => runLock(project, a.file, a.name, parseSize(a.size))));
    server.registerTool("check_design", { ...TOOLS.check_design, annotations }, (a) => call(() => runCheck(project, a.file, a.lock, parseSize(a.size))));
    return server;
  }, { onerror: (error) => process.stderr.write(`attentry-design mcp: ${error.message.replace(/\s+/g, " ").slice(0, 300)}\n`) });
  for (const signal of ["SIGINT", "SIGTERM"] as const) process.on(signal, () => void closeBrowser().finally(() => process.exit(0)));
  process.stdin.on("close", () => void closeBrowser());
}
