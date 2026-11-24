// `attentry-design hook`: Claude Code's hooks call this with the event as JSON on stdin. Only
// UserPromptSubmit speaks, and only for design requests; everything else stays silent.
import { text } from "node:stream/consumers";
import { brief } from "./brief.ts";

interface HookInput {
  hook_event_name: string;
  prompt?: string;
  cwd?: string;
}

export async function hookReply(input: HookInput): Promise<string> {
  if (input.hook_event_name !== "UserPromptSubmit" || !input.prompt) return "";
  const message = await brief(input.prompt, input.cwd ?? process.cwd());
  if (!message) return "";
  return `${JSON.stringify({ hookSpecificOutput: { hookEventName: "UserPromptSubmit", additionalContext: message } })}\n`;
}

export async function runHook(): Promise<void> {
  try {
    process.stdout.write(await hookReply(JSON.parse(await text(process.stdin))));
  } catch {
    // A hook that fails must never block the person's request: stay silent.
  }
}
