// Stage 1: notice that the person asked for a design and tell the agent how to go about it before
// it draws anything: ask the brief, make real options, lock the pick, check the result. Short, as
// the agent pays for every word, and silent for everything that isn't a design request.
import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { LOCK_DIR } from "./lock.ts";
import { MAX_OPTIONS, STYLE_3D } from "./limits.ts";

export type DesignKind = "illustration" | "video";

// A request is a design request when it names a visual thing and nothing in it points at code:
// "an invitation illustration for my sister" is one; "fix the video player crash" is not.
const CODE = /\b(fix|bug|error|crash(es)?|null|undefined|field|api|endpoint|tests?|refactor|rename|function|schema|query|route|deploy|player|upload|import|props?)\b/i;
const VIDEO = /\b(video|animation|animated|motion graphics?|promo|trailer|storyboard|remotion|reel|explainer)\b/i;
const ILLUSTRATION =
  /\b(illustrations?|invitations?|invites?|posters?|flyers?|banners?|hero (image|art|graphic)|cover (art|image)|thumbnails?|artwork|drawing|graphics?|icons? set|card design|greeting card|social (post|image|graphic)|og image|scene)\b/i;
const QUICK = /\b(quick(ly)?|just a|rough|no options|skip the options)\b/i;

export function designKind(prompt: string): DesignKind | undefined {
  if (CODE.test(prompt)) return undefined;
  if (VIDEO.test(prompt)) return "video";
  if (ILLUSTRATION.test(prompt)) return "illustration";
  return undefined;
}

export async function existingLocks(project: string): Promise<string[]> {
  try {
    return (await readdir(join(project, LOCK_DIR))).filter((f) => f.endsWith(".lock.json")).map((f) => f.slice(0, -".lock.json".length));
  } catch {
    return [];
  }
}

/** Whether the project uses Remotion (it's in its package.json). */
export async function usesRemotion(project: string): Promise<boolean> {
  try {
    const pkg = JSON.parse(await readFile(join(project, "package.json"), "utf8"));
    return "remotion" in { ...pkg.dependencies, ...pkg.devDependencies };
  } catch {
    return false;
  }
}

/** What each stage is made of: picture files, or Remotion compositions for a Remotion video. */
function toolsFor(remotion: boolean) {
  return remotion
    ? {
        options: "make each option a short Remotion composition (a few seconds each, like OptionA, OptionB)",
        check_options: "check_video_options with the entry file and the compositions",
        lock: "lock_video with the chosen composition",
        check: "check_video with the composition",
      }
    : {
        options: "",
        check_options: "check_options with the files",
        lock: "lock_design with the chosen file",
        check: "check_design with the file",
      };
}

// Craft notes for a style the request names (from Pixel Logic, Vector Basic Training, The Back of
// the Napkin, Digital Lighting & Rendering): only the one that applies, so the brief stays short.
const STYLE_NOTES: [RegExp, string][] = [
  [/\bpixel/i, "Pixel art: one pixel grid for everything (never double a sprite's pixels beside 1x parts: those are mixels); lettering from a 5×7 or bigger pixel alphabet, a one-pixel gap inside letters and two between them; 1-2 hand-placed in-between shades on lettering and curves, never software smoothing; shade by shifting hue, not only darkening; tinted darks instead of pure black; a few colors per sprite."],
  [/\bisometric/i, "Isometric: every receding edge at the same 2:1 slope (26.57°), one light direction for all faces, nearer objects drawn over farther ones."],
  [STYLE_3D, "3D look: one key light above and 15-45° to one side, a dimmer fill from the other side and lower, never its mirror (key 2-4× the fill for a friendly look, 8× for drama); every face its own value, no flat ambient side; soft contact shadows under whatever stands, all falling one way; small bevels so edges catch light; small highlights in the light's color, no airbrushed hotspots; warm key, cool fill; surface colors between 15% and 85% lightness; a dark scene still keeps its subject well lit; no lens flares or glows standing in for light."],
  [/\b(flat|vector)\b/i, "Flat vector: build curves from few anchor points at their extremes, smooth joins where a curve flows, no auto-traced or overloaded paths; one stroke weight family."],
  [/\b(hand[- ]?drawn|doodle|sketch|stick figure)/i, "Hand-drawn: one line weight family and one wobble throughout; handwritten lettering big and clear enough to read at phone size."],
];

export function styleNotes(prompt: string): string {
  return STYLE_NOTES.filter(([re]) => re.test(prompt)).map(([, note]) => note).join(" ");
}

export async function brief(prompt: string, project: string): Promise<string | undefined> {
  const kind = designKind(prompt);
  if (!kind) return undefined;
  const tools = toolsFor(kind === "video" && (await usesRemotion(project)));
  const locks = await existingLocks(project);
  const lockLine = locks.length
    ? `This project has design locks: ${locks.join(", ")}. If the request continues one, skip to step 4 and check against it.`
    : "";

  if (QUICK.test(prompt)) {
    return [
      `Attentry Design: a quick ${kind} request. Make it, then call ${tools.check} and fix what it marks as errors.`,
      lockLine,
    ].filter(Boolean).join("\n");
  }

  const options = tools.options ||
    (kind === "video"
      ? "draw a storyboard per option: one SVG or HTML file with 4–6 key frames side by side"
      : "draw each option small, as its own SVG or HTML file");
  return [
    `Attentry Design: this is ${kind === "illustration" ? "an" : "a"} ${kind} request. Before drawing:`,
    "1. Brief. Ask the person, in one round with your question tool, only what they didn't say: the one thing it should say (its single message), what it's for, who sees it, where it's used and at what size, the style of the world (hand-drawn, flat vector, isometric, 3D look, pixel art, or another), the exact text, the mood, anything it must have or avoid. If they skip or decline the questions, don't stop: choose sensible answers yourself, state them in one line, and go on to the options, where they choose by looking.",
    `Then the words, which carry the message: ${kind === "video" ? "the script, every caption or spoken line in order with how long it stays up (written as \"line | 3s\")" : "the headline, every label and any other text"}. If the person gave them, use them word for word. If not, draft them from the single message and show them in the chat as a plain list, then wait for a yes or changes before drawing anything; this step isn't skipped, even when the questions were. A picture can't rescue words that don't say it.`,
    `2. Options. Then ${options}: 2–3 for something small, up to ${MAX_OPTIONS} for a key piece. Make them differ in composition (off center, diagonal, a group to one side, not all centered), in value plan (light, dark or mid-grey field) and in palette; and in how they explain the idea (a single scene, a before and after, a step-by-step flow); if the person didn't choose a style, let them differ in style too (hand-drawn, flat vector, isometric, 3D look, pixel art). Call ${tools.check_options}, redo what it flags, then show the person the contact sheet and ask which one, by number.`,
    "While drawing: build it around the single message. Plan the text first: one headline, labels clearly smaller (sizes at least 1.5× apart), and measure each line's width (characters × letter width) against the frame so every line stays inside a 5% margin. Lettering drawn as shapes (pixel art, hand-drawn type): wrap each line in <g data-text='the words'> so it can be measured. Draw each idea as the kind of picture it is: a thing as a portrait, an amount as a chart, a place as a map, a sequence as a timeline, a process as a flow with arrows, a reason as a comparison (a process drawn as a single object won't read). Size the main characters by the smallest part that must read (a facial expression, a hand gesture). An explaining picture carries a title and labels its parts. Keep text and shapes clearly away from an edge or clearly overlapping it, never just touching.",
    styleNotes(prompt),
    `3. Lock. Call ${tools.lock}, a short name, the style and the approved words (one line each), so the check holds the finished design to them.`,
    `4. Finish. Make it in full, call ${tools.check} and the lock, fix the errors, and mention the suggestions without forcing them.`,
    "5. End with a short design card: what was made, the lock, what was found and fixed, and any part that may not get its message across.",
    "Attentry Design checks quality, not taste: the person's choices win.",
    lockLine,
  ].filter(Boolean).join("\n");
}
