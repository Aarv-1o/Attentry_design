// Stage 1: notice that the person asked for a design and tell the agent how to go about it before
// it draws anything: ask the brief, make real options, lock the pick, check the result. Short, as
// the agent pays for every word, and silent for everything that isn't a design request.
import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { LOCK_DIR } from "./lock.ts";
import { MAX_OPTIONS } from "./options.ts";

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
    "1. Brief. Ask the person, in one round with your question tool, only what they didn't say: the one thing it should say (its single message), what it's for, who sees it, where it's used and at what size, the style of the world (stick figure, flat 2D, 3D, pixel art, or another), the exact text, the mood, anything it must have or avoid. If they skip or decline the questions, don't stop: choose sensible answers yourself, state them in one line, and go on to the options, where they choose by looking.",
    `2. Options. Then ${options}: 2–3 for something small, up to ${MAX_OPTIONS} for a key piece. Make them differ in composition (off center, diagonal, a group to one side, not all centered), in value plan (light, dark or mid-grey field) and in palette; if the person didn't choose a style, let them differ in style too (stick figure, flat 2D, 3D, pixel art). Call ${tools.check_options}, redo what it flags, then show the person the contact sheet and ask which one, by number.`,
    "While drawing: build it around the single message. Plan the text first: one headline, labels clearly smaller (sizes at least 1.5× apart), and measure each line's width (characters × letter width) against the frame so every line stays inside a 5% margin. Make the main characters big enough to carry detail (in pixel art, about 24 grid squares tall or more).",
    `3. Lock. Call ${tools.lock}, a short name and the style.`,
    `4. Finish. Make it in full, call ${tools.check} and the lock, fix the errors, and mention the suggestions without forcing them.`,
    "5. End with a short design card: what was made, the lock, and what was found and fixed.",
    "Attentry Design checks quality, not taste: the person's choices win.",
    lockLine,
  ].filter(Boolean).join("\n");
}
