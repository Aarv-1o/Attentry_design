// `attentry-design mcp`: the stage tools for Claude Code (and any agent that speaks MCP). Paths are
// relative to the project the agent works in. Nothing else may go to stdout: it's the agent's
// channel.
import { McpServer } from "@modelcontextprotocol/server";
import { serveStdio } from "@modelcontextprotocol/server/stdio";
import { z } from "zod";
import manifest from "../package.json" with { type: "json" };
import { MAX_OPTIONS, parseSize } from "./limits.ts";
import { clearStatus, LAST_RUN, noteDesigns, restoreDesign, RUNNING, writeStatus, type DesignEvent } from "./status.ts";
import type { StageResult } from "./stages.ts";

/** The stages, loaded on the first tool call (they need the heavy libraries; see core.ts). */
export type Core = typeof import("./core.ts");

const INSTRUCTIONS = `Attentry Design checks the illustrations and videos you make, without AI. It checks quality, never taste.
- Before any options: get the words approved (the video's script, the picture's exact text). If the person gave none, draft them and show them for a yes before drawing.
- Before the full drawing: draw 2–${MAX_OPTIONS} small options as files and call check_options. Redo what it flags, then let the person pick by number.
- When the person picks: call lock_design with that file and the approved words.
- To look at a design while drawing, call preview_design (or preview_video); it only renders.
- When the design is finished: call check_design (with the lock). Open the render it names and look at it. Fix the errors; mention the suggestions.
- Each check with a lock keeps a numbered version (v1, v2…). When the person wants an earlier one back, call restore_version, then edit from there.
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
const MOOD = z.string().max(80).optional().describe('The mood from the brief, like "dark and tense" or "warm". A dark mood keeps the check from suggesting it be lighter.');
const PURPOSE = z.string().max(120).optional().describe('What it is for, from the brief, like "promo for a bakery" or "tribute to a game". A tribute or homage keeps the check from asking for a call to action.');
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
    inputSchema: z.object({ file: FILE.describe("The chosen option's file."), name: NAME, style: STYLE, words: WORDS, mood: MOOD, purpose: PURPOSE, size: SIZE }),
  },
  check_design: {
    title: "Check the finished design",
    description: "Call on a finished design: SVG, HTML, or a generated image (PNG, JPG, WebP). Errors to fix: text contrast below WCAG, text cut off or at the edge (including lettering drawn as shapes, marked with data-text, or found in the pixels by OCR), colors or fonts outside the lock, smoothed edges in pixel art. Suggestions: no clear headline, shapes cut by the frame, and the AI defaults (dead-center subject, everything mid-grey, too saturated, raw red, yellow and blue together). Each with its source.",
    inputSchema: z.object({ file: FILE, lock: NAME.optional().describe("The lock to hold it to."), size: SIZE }),
  },
  preview_design: {
    title: "Render a design to look at",
    description: "Call to see a design (SVG, HTML, or an image) as it renders, without checking it: while drawing, or before showing it to the person. Saves a PNG and says where; open it and look. Use check_options only for real options and check_design for the finished design.",
    inputSchema: z.object({ file: FILE, size: SIZE }),
  },
  preview_video: {
    title: "Render video frames to look at",
    description: "Call to see a Remotion composition without checking it: the frame at one moment (seconds: [2.5]), several moments side by side, or its five key frames when no seconds are given. Saves a PNG and says where; open it and look.",
    inputSchema: z.object({ entry: ENTRY, composition: COMPOSITION, seconds: z.array(z.number().min(0)).max(8).optional().describe("Moments to show, in seconds. Left out: the five key frames.") }),
  },
  restore_version: {
    title: "Put back an earlier version",
    description: "Call when the person wants an earlier version of a locked design back (go back to v2, the first one was better). Puts that version back in the file it came from; whatever is in the file now is kept as a version first, so nothing is lost. Edit from there: the next check_design keeps the result as a branch from that version.",
    inputSchema: z.object({ lock: NAME.describe("The lock the versions belong to."), version: z.number().int().min(1).describe("The version number: 2 for v2.") }),
  },
  check_video_options: {
    title: "Check the video options",
    description: `Call with 2–${MAX_OPTIONS} short Remotion compositions, one per option, before making the full video. Renders a storyboard of each (5 key frames) into one numbered contact sheet and says whether they really differ. Never says which is better. The first call bundles the project, which takes a few seconds.`,
    inputSchema: z.object({ entry: ENTRY, compositions: z.array(COMPOSITION).min(2).max(MAX_OPTIONS) }),
  },
  lock_video: {
    title: "Lock the chosen video",
    description: "Call when the person picks a video option. Saves its style, the approved script, colors, fonts, size and look as a design lock, which check_video holds the finished video to.",
    inputSchema: z.object({ entry: ENTRY, composition: COMPOSITION, name: NAME, style: STYLE, words: WORDS, mood: MOOD, purpose: PURPOSE }),
  },
  check_video: {
    title: "Check the finished video",
    description: "Call on a finished Remotion composition. Reads a frame every quarter second. Errors: text shown too briefly to read, text too small or low in contrast, text cut off (also lettering inside pictures, read by OCR), blank stretches, colors or fonts outside the lock, the approved script missing, out of order or too short. Suggestions: text arriving mid-move, no call to action at the end or a smallest one, too many sizes or sizes too close, too many fonts, the same frame held over 6 s.",
    inputSchema: z.object({ entry: ENTRY, composition: COMPOSITION, lock: NAME.optional().describe("The lock to hold it to.") }),
  },
} as const;

export function runMcpServer(project: string, load: () => Promise<Core>): void {
  // Loaded once; a failed load (the libraries couldn't be installed, say) is tried again next call.
  let loading: Promise<Core> | undefined;
  const core = () => (loading ??= load().catch((error) => { loading = undefined; throw error; }));
  // `lock`: the lock the tool holds the design to, or saves; the editor marks it in use.
  // `design`: which files the tool shows, picks or finishes, kept once it succeeds (see noteDesigns).
  const call = async (tool: keyof typeof TOOLS, lock: string | undefined, run: (c: Core) => Promise<StageResult>, design?: DesignEvent) => {
    try {
      await writeStatus(project, RUNNING, { tool, started: Date.now(), ...(lock ? { lock } : {}) });
      const result = await run(await core());
      const note = design ? await noteDesigns(project, design) : undefined;
      return { content: [{ type: "text" as const, text: note ? `${result.text}
${note}` : result.text }] };
    } catch (error) {
      // A failed tool is a result the agent can read, not a broken connection.
      return { content: [{ type: "text" as const, text: `Attentry Design failed: ${(error as Error).message}` }], isError: true };
    } finally {
      await clearStatus(project, RUNNING);
      await writeStatus(project, LAST_RUN, { tool, finished: Date.now(), ...(lock ? { lock } : {}) });
    }
  };
  // Renders the project's own files and writes only under .attentry-design/.
  const annotations = { readOnlyHint: false, destructiveHint: false, openWorldHint: false };
  serveStdio(() => {
    const server = new McpServer({ name: "attentry-design", version: manifest.version ?? "0.0.0" }, { instructions: INSTRUCTIONS });
    server.registerTool("check_options", { ...TOOLS.check_options, annotations }, (a) => call("check_options", undefined, (c) => c.runOptions(project, a.files, parseSize(a.size)), { tool: "check_options", files: a.files }));
    server.registerTool("lock_design", { ...TOOLS.lock_design, annotations }, (a) => call("lock_design", a.name, (c) => c.runLock(project, a.file, a.name, parseSize(a.size), a.style, a.words, { mood: a.mood, purpose: a.purpose }), { tool: "lock_design", file: a.file, name: a.name }));
    server.registerTool("check_design", { ...TOOLS.check_design, annotations }, (a) => call("check_design", a.lock, (c) => c.runCheck(project, a.file, a.lock, parseSize(a.size)), { tool: "check_design", file: a.file, lock: a.lock }));
    server.registerTool("preview_design", { ...TOOLS.preview_design, annotations }, (a) => call("preview_design", undefined, (c) => c.runPreview(project, a.file, parseSize(a.size))));
    server.registerTool("preview_video", { ...TOOLS.preview_video, annotations }, (a) => call("preview_video", undefined, (c) => c.runVideoPreview(project, a.entry, a.composition, a.seconds)));
    // Needs none of the heavy libraries: only files are copied.
    server.registerTool("restore_version", { ...TOOLS.restore_version, annotations }, async (a) => {
      try {
        const v = await restoreDesign(project, a.lock, a.version);
        return { content: [{ type: "text" as const, text: `Put v${v.n} of "${a.lock}" back in ${v.file}. Edit from here; the next check_design keeps it as a branch from v${v.n}.` }] };
      } catch (error) {
        return { content: [{ type: "text" as const, text: `Attentry Design failed: ${(error as Error).message}` }], isError: true };
      }
    });
    server.registerTool("check_video_options", { ...TOOLS.check_video_options, annotations }, (a) => call("check_video_options", undefined, (c) => c.runVideoOptions(project, a.entry, a.compositions)));
    server.registerTool("lock_video", { ...TOOLS.lock_video, annotations }, (a) => call("lock_video", a.name, (c) => c.runVideoLock(project, a.entry, a.composition, a.name, a.style, a.words, { mood: a.mood, purpose: a.purpose })));
    server.registerTool("check_video", { ...TOOLS.check_video, annotations }, (a) => call("check_video", a.lock, (c) => c.runVideoCheck(project, a.entry, a.composition, a.lock)));
    return server;
  }, { onerror: (error) => process.stderr.write(`attentry-design mcp: ${error.message.replace(/\s+/g, " ").slice(0, 300)}\n`) });
  const close = async () => { if (loading) await (await loading.catch(() => undefined))?.closeAll(); };
  for (const signal of ["SIGINT", "SIGTERM"] as const) process.on(signal, () => void close().finally(() => process.exit(0)));
  process.stdin.on("close", () => void close());
}
