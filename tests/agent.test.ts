// Stage 1 (the brief hook) and the MCP tools, the way Claude Code reaches them.
import { test } from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdtemp, mkdir, writeFile, copyFile, access } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createInterface } from "node:readline";
import { designKind, brief } from "../src/brief.ts";
import { hookReply } from "../src/hook.ts";

test("design requests are recognized; code requests that mention visual words are not", () => {
  assert.equal(designKind("make me an invitation illustration for our wedding"), "illustration");
  assert.equal(designKind("Create a poster for the launch"), "illustration");
  assert.equal(designKind("can you design a hero image for the landing page"), "illustration");
  assert.equal(designKind("build a 20 second promo video in Remotion"), "video");
  assert.equal(designKind("invitation illustration for my sister's wedding"), "illustration");
  assert.equal(designKind("rename the poster component's props"), undefined);
  assert.equal(designKind("fix the video player crash"), undefined);
  assert.equal(designKind("the poster field is null in the API response"), undefined);
  assert.equal(designKind("make the tests pass"), undefined);
  assert.equal(designKind("design the database schema"), undefined);
});

test("the brief walks through the stages; a quick request goes straight to the check", async () => {
  const project = await mkdtemp(join(tmpdir(), "ad-"));
  const full = await brief("make an invitation illustration", project);
  for (const word of ["Brief", "check_options", "lock_design", "check_design", "not taste"]) assert.ok(full?.includes(word), word);
  assert.match(full!, /decline the questions, don't stop/);
  const quick = await brief("just a quick poster for tonight", project);
  assert.ok(quick?.includes("check_design"));
  assert.ok(!quick?.includes("check_options"));
  const video = await brief("create a launch video", project);
  assert.ok(video?.includes("storyboard"));
});

test("the brief mentions the project's existing locks", async () => {
  const project = await mkdtemp(join(tmpdir(), "ad-"));
  await mkdir(join(project, ".attentry-design"));
  await writeFile(join(project, ".attentry-design", "invitation.lock.json"), "{}");
  assert.match((await brief("make an invitation illustration", project))!, /design locks: invitation/);
});

test("the hook answers only UserPromptSubmit design requests, as Claude Code expects", async () => {
  const project = await mkdtemp(join(tmpdir(), "ad-"));
  const reply = JSON.parse(await hookReply({ hook_event_name: "UserPromptSubmit", prompt: "draw a poster", cwd: project }));
  assert.equal(reply.hookSpecificOutput.hookEventName, "UserPromptSubmit");
  assert.match(reply.hookSpecificOutput.additionalContext, /^Attentry Design/);
  assert.equal(await hookReply({ hook_event_name: "UserPromptSubmit", prompt: "rename this function", cwd: project }), "");
  assert.equal(await hookReply({ hook_event_name: "Stop" }), "");
});

test("MCP: the three tools are listed and check_options answers with a contact sheet", { timeout: 60_000 }, async () => {
  const project = await mkdtemp(join(tmpdir(), "ad-"));
  for (const f of ["invite-centered.svg", "invite-centered-again.svg"]) await copyFile(join(import.meta.dirname, "fixtures", f), join(project, f));
  const server = spawn(process.execPath, ["--import", "tsx", join(import.meta.dirname, "..", "src", "cli.ts"), "mcp"], {
    cwd: join(import.meta.dirname, ".."),
    env: { ...process.env, CLAUDE_PROJECT_DIR: project },
    stdio: ["pipe", "pipe", "inherit"],
  });
  const lines = createInterface({ input: server.stdout });
  const replies = new Map<number, (v: any) => void>();
  lines.on("line", (line) => {
    const msg = JSON.parse(line);
    replies.get(msg.id)?.(msg);
  });
  let id = 0;
  const ask = (method: string, params: object) =>
    new Promise<any>((done) => {
      replies.set(++id, done);
      server.stdin.write(JSON.stringify({ jsonrpc: "2.0", id, method, params }) + "\n");
    });
  try {
    await ask("initialize", { protocolVersion: "2025-06-18", capabilities: {}, clientInfo: { name: "test", version: "0" } });
    server.stdin.write(JSON.stringify({ jsonrpc: "2.0", method: "notifications/initialized" }) + "\n");
    const tools = (await ask("tools/list", {})).result.tools.map((t: { name: string }) => t.name).sort();
    assert.deepEqual(tools, ["check_design", "check_options", "lock_design"]);

    const result = (await ask("tools/call", { name: "check_options", arguments: { files: ["invite-centered.svg", "invite-centered-again.svg"] } })).result;
    const text = result.content[0].text as string;
    assert.match(text, /^Contact sheet: \.attentry-design\/sheets\/options-\d+\.png/);
    assert.match(text, /nearly the same picture/);
    await access(join(project, text.split("\n")[0].slice("Contact sheet: ".length)));

    const tooMany = (await ask("tools/call", { name: "check_options", arguments: { files: ["a", "b", "c", "d", "e", "f"] } })).result;
    assert.equal(tooMany.isError, true);
  } finally {
    server.stdin.end();
    server.kill();
  }
});
