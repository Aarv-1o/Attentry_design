// `attentry-design mcp`: the stage tools for Claude Code (and any agent that speaks MCP). Paths are
// relative to the project the agent works in. Nothing else may go to stdout: it's the agent's
// channel.
import { McpServer } from "@modelcontextprotocol/server";
import { serveStdio } from "@modelcontextprotocol/server/stdio";
import { z } from "zod";
import manifest from "../package.json" with { type: "json" };
import { closeBrowser } from "./render.ts";
import { closeRemotion } from "./remotion.ts";
import { closeOcr } from "./lettering.ts";
import { MAX_OPTIONS } from "./options.ts";
import { parseSize, runCheck, runLock, runOptions, runVideoCheck, runVideoLock, runVideoOptions, type StageResult } from "./stages.ts";

const INSTRUCTIONS = `Attentry Design checks the illustrations and videos you make, without AI. It checks quality, never taste.
- Before any options: get the words approved (the video's script, the picture's exact text). If the person gave none, draft them and show them for a yes before drawing.
- Before the full drawing: draw 2–${MAX_OPTIONS} small options as files and call check_options. Redo what it flags, then let the person pick by number.
- When the person picks: call lock_design with that file and the approved words.
- When the design is finished: call check_design (with the lock). Fix the errors; mention the suggestions.
- Remotion videos: the same stages with check_video_options (one composition per option), lock_video and check_video.`;

const FILE = z.string().min(1).max(1_000);
const SIZE = z.string().regex(/^\d+x\d+$/, "Give size as WxH, like 1200x630.").optional()
  .describe("For HTML files: the page size as WxH, like 1200x630. SVGs use their own size.");
const ENTRY = z.string().min(1).max(1_000).describe('The Remotion entry file that calls registerRoot, like "src/index.ts".');
const COMPOSITION = z.string().min(1).max(200).describe("A composition id, as in <Composition id=…>.");
const STYLE = z.string().max(60).optional()
  .describe('The world style the person chose: "stick figure", "flat 2D", "3D", "pixel art", or their own words. A pixel-art lock is checked for pixel-sharp edges.');
const WORDS = z.array(z.string().min(1).max(500)).max(60).optional()
  .describe("The words the person approved, one line each: the video's script (every caption, in order, with its time as 'line | 3s') or the picture's exact text (headline, labels). The check holds the finished design to them: every line there, in order, for its time.");
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
    description: "Call when the person picks an option. Saves its style, the approved words, colors, fonts, size, composition and value plan as a design lock, which check_design holds the finished work to.",
    inputSchema: z.object({ file: FILE.describe("The chosen option's file."), name: NAME, style: STYLE, words: WORDS, size: SIZE }),
  },
  check_design: {
    title: "Check the finished design",
    description: "Call on a finished design: SVG, HTML, or a generated image (PNG, JPG, WebP). Errors to fix: text contrast below WCAG, text cut off or at the edge (including lettering drawn as shapes, marked with data-text, or found in the pixels by OCR), colors or fonts outside the lock, smoothed edges in pixel art. Suggestions: no clear headline, shapes cut by the frame, and the AI defaults (dead-center subject, everything mid-grey, too saturated, raw red, yellow and blue together). Each with its source.",
    inputSchema: z.object({ file: FILE, lock: NAME.optional().describe("The lock to hold it to."), size: SIZE }),
  },
  check_video_options: {
    title: "Check the video options",
    description: `Call with 2–${MAX_OPTIONS} short Remotion compositions, one per option, before making the full video. Renders a storyboard of each (5 key frames) into one numbered contact sheet and says whether they really differ. Never says which is better. The first call bundles the project, which takes a few seconds.`,
    inputSchema: z.object({ entry: ENTRY, compositions: z.array(COMPOSITION).min(2).max(MAX_OPTIONS) }),
  },
  lock_video: {
    title: "Lock the chosen video",
    description: "Call when the person picks a video option. Saves its style, the approved script, colors, fonts, size and look as a design lock, which check_video holds the finished video to.",
    inputSchema: z.object({ entry: ENTRY, composition: COMPOSITION, name: NAME, style: STYLE, words: WORDS }),
  },
  check_video: {
    title: "Check the finished video",
    description: "Call on a finished Remotion composition. Reads a frame every quarter second. Errors: text shown too briefly to read, text too small or low in contrast, text cut off (also lettering inside pictures, read by OCR), blank stretches, colors or fonts outside the lock, the approved script missing, out of order or too short. Suggestions: text arriving mid-move, no call to action at the end or a smallest one, too many sizes or sizes too close, too many fonts, the same frame held over 6 s.",
    inputSchema: z.object({ entry: ENTRY, composition: COMPOSITION, lock: NAME.optional().describe("The lock to hold it to.") }),
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
    server.registerTool("lock_design", { ...TOOLS.lock_design, annotations }, (a) => call(() => runLock(project, a.file, a.name, parseSize(a.size), a.style, a.words)));
    server.registerTool("check_design", { ...TOOLS.check_design, annotations }, (a) => call(() => runCheck(project, a.file, a.lock, parseSize(a.size))));
    server.registerTool("check_video_options", { ...TOOLS.check_video_options, annotations }, (a) => call(() => runVideoOptions(project, a.entry, a.compositions)));
    server.registerTool("lock_video", { ...TOOLS.lock_video, annotations }, (a) => call(() => runVideoLock(project, a.entry, a.composition, a.name, a.style, a.words)));
    server.registerTool("check_video", { ...TOOLS.check_video, annotations }, (a) => call(() => runVideoCheck(project, a.entry, a.composition, a.lock)));
    return server;
  }, { onerror: (error) => process.stderr.write(`attentry-design mcp: ${error.message.replace(/\s+/g, " ").slice(0, 300)}\n`) });
  for (const signal of ["SIGINT", "SIGTERM"] as const) process.on(signal, () => void Promise.all([closeBrowser(), closeRemotion(), closeOcr()]).finally(() => process.exit(0)));
  process.stdin.on("close", () => void Promise.all([closeBrowser(), closeRemotion(), closeOcr()]));
}
