// The Attentry Design panel's page. Everything it shows arrives as one "state" message from the
// extension; lock names and words come from files, so text is always set with textContent.
const vscode = acquireVsCodeApi();
const app = document.getElementById("app");
const TIP_MS = 8000;

const WORKING = {
  check_options: "Checking the options",
  lock_design: "Saving the lock",
  check_design: "Checking the design",
  check_video_options: "Checking the video options",
  lock_video: "Saving the video lock",
  check_video: "Checking the video",
};
const KINDS = { illustration: "Illustration", video: "Video" };
const ago = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

let state;
let tip = 0;
let ticker; // updates the seconds and turns the tip while a tool runs
let setupOpen; // the person opened or closed Setup: kept across updates (undefined: open only when needed)

function h(tag, props, ...children) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(props ?? {})) {
    if (k.startsWith("on")) el.addEventListener(k.slice(2), v);
    else if (v !== undefined && v !== false) el.setAttribute(k, v === true ? "" : v);
  }
  for (const c of children.flat()) if (c !== undefined && c !== null && c !== false) el.append(c);
  return el;
}

const send = (message) => vscode.postMessage(message);
const button = (label, onclick, kind = "secondary") => h("button", { class: kind, onclick }, label);
const line = (mark, text, kind) => h("p", { class: `line ${kind ?? ""}` }, h("span", { class: "mark", "aria-hidden": "true" }, mark), h("span", {}, text));
const section = (title, ...children) => h("section", { "aria-label": title }, h("h2", {}, title), children);

function since(time) {
  const minutes = Math.round((time - Date.now()) / 60000);
  if (minutes > -1) return "just now";
  if (minutes > -60) return ago.format(minutes, "minute");
  if (minutes > -60 * 24) return ago.format(Math.round(minutes / 60), "hour");
  return ago.format(Math.round(minutes / 1440), "day");
}

function folder(s) {
  if (!s.project) return h("p", { class: "hint" }, "Open a folder to use Attentry Design.");
  if (s.folders.length < 2) return h("p", { class: "folder muted" }, s.folders[0].name);
  const select = h("select", { id: "project", onchange: (e) => send({ type: "project", path: e.target.value }) },
    s.folders.map((f) => h("option", { value: f.path, selected: f.path === s.project }, f.name)));
  return h("div", { class: "folder" }, h("label", { for: "project" }, "Project"), select);
}

function status(s) {
  if (s.running) {
    const t = s.tips[tip % s.tips.length];
    return h("section", { id: "status", class: "working", "aria-label": "Status", "aria-live": "polite" },
      h("p", { class: "line" }, h("span", { class: "spinner", "aria-hidden": "true" }), h("span", {}, `${WORKING[s.running.tool] ?? "Working"}… `), h("span", { id: "elapsed", class: "muted" }, elapsed(s.running.started))),
      h("div", { class: "tip" }, h("p", {}, t.tip), h("p", { class: "source" }, t.source)));
  }
  const last = s.task ? h("p", { class: "muted" }, `Last request: ${KINDS[s.task.kind]}${s.task.pinned ? " (pinned)" : ""}, ${since(s.task.at)}`) : undefined;
  return section("Status", line("●", "Ready", "good"), last ?? h("p", { class: "hint" }, "Ask Claude Code for an illustration or a video to start."));
}

const elapsed = (started) => `${Math.max(0, Math.round((Date.now() - started) / 1000))} s`;

function mode(s) {
  const current = s.pin?.kind ?? "auto";
  const choice = (kind, label) => h("button", { class: `seg ${current === kind ? "on" : ""}`, "aria-pressed": String(current === kind), onclick: () => send({ type: "mode", kind }) }, label);
  const hint = current === "auto"
    ? "Picks illustration or video from each request."
    : `Every design request gets the ${KINDS[current].toLowerCase()} brief until you set Auto.`;
  return section("Mode", h("div", { class: "segments", role: "group", "aria-label": "Mode" }, choice("auto", "Auto"), choice("illustration", "Illustration"), choice("video", "Video")), h("p", { class: "hint" }, hint));
}

function setup(s) {
  const p = s.plugin;
  const parts = [];
  let ok = false;
  if (p === "checking") parts.push(line("…", "Checking Claude Code"));
  else if (p === "connecting") parts.push(line("…", "Connecting Claude Code. This can take a minute."));
  else if (p.error) {
    parts.push(line("✕", `Couldn't connect: ${p.error}.`, "bad"), h("p", { class: "hint" }, "Run this in a terminal instead:"), h("code", { class: "command" }, p.command),
      h("div", { class: "row" }, button("Copy", () => send({ type: "copy", text: p.command })), button("Try again", () => send({ type: "connect" }))));
  } else if (!p.installed) {
    parts.push(h("p", {}, "Claude Code doesn't have Attentry Design yet."), button("Connect Claude Code", () => send({ type: "connect" }), "primary"));
  } else if (!p.enabled) {
    parts.push(line("○", "Installed in Claude Code, but turned off."), button("Turn on", () => send({ type: "connect" }), "primary"));
  } else {
    ok = true;
    parts.push(line("✓", `Claude Code connected (${p.version})`, "good"));
    if (s.justConnected) parts.push(h("p", { class: "hint" }, "Start a new Claude Code session to use it."));
  }
  if (s.libraries === "ready") parts.push(line("✓", "Libraries ready", "good"));
  else if (s.libraries === "installing") parts.push(line("…", "Installing the libraries the checks use (about 100 MB)"));
  else if (s.libraries === "missing") parts.push(line("○", "The libraries install when the next Claude Code session starts."));
  parts.push(s.browser ? line("✓", `Renders with ${s.browser}`, "good") : line("✕", "Needs Chrome or Edge installed to render designs.", "bad"));
  // All fine: one line, opened only on request. Anything to do: open.
  const ready = ok && s.libraries === "ready" && s.browser;
  return h("section", { "aria-label": "Setup" },
    h("details", { class: "setup", open: setupOpen ?? !ready },
      // A click, not the toggle event: that one also fires when the section is drawn already open.
      h("summary", { onclick: (e) => (setupOpen = !e.currentTarget.parentElement.open) }, h("h2", {}, "Setup"), ready ? h("span", { class: "good small" }, " ✓ Ready") : undefined), parts));
}

function lockCard(l) {
  if (l.error) {
    return h("li", { class: "lock" }, h("p", { class: "name" }, l.name), line("✕", `Can't read this lock: ${l.error}`, "bad"), button("Open lock file", () => send({ type: "open", path: l.path })));
  }
  const meta = [l.style, `${l.size.width}×${l.size.height}`].filter(Boolean).join(" · ");
  const words = l.words.length ? h("p", { class: "words" }, `“${l.words[0]}”`, l.words.length > 1 ? h("span", { class: "muted" }, ` and ${l.words.length - 1} more line${l.words.length > 2 ? "s" : ""}`) : "") : undefined;
  return h("li", { class: `lock ${l.inUse ? "in-use" : ""}` },
    h("p", { class: "title" },
      h("button", { class: "name link", title: "Open the design", onclick: () => send({ type: "open", path: l.from }) }, l.name),
      l.inUse ? h("span", { class: "badge" }, "in use") : undefined),
    h("p", { class: "muted" }, meta),
    l.colors.length ? h("div", { class: "swatches", role: "img", "aria-label": `Colors: ${l.colors.join(", ")}` }, l.colors.slice(0, 12).map(swatch)) : undefined,
    words,
    l.fonts.length ? h("p", { class: "muted" }, l.fonts.join(", ")) : undefined,
    h("button", { class: "link small", onclick: () => send({ type: "open", path: l.path }) }, "Open lock file"));
}

function swatch(color) {
  const el = h("span", { class: "swatch", title: color });
  el.style.background = color; // set as a property, not markup: the page's CSP allows no inline style attribute
  return el;
}

function lockList(s) {
  return section("Locks",
    s.locks.length
      ? h("ul", { class: "locks" }, s.locks.map(lockCard))
      : h("p", { class: "hint" }, "No locks yet. One is saved when you pick an option in the chat."));
}

function render() {
  const sections = [folder(state), status(state), state.project ? mode(state) : undefined, setup(state), state.project ? lockList(state) : undefined];
  app.replaceChildren(...sections.filter(Boolean));
  clearInterval(ticker);
  ticker = undefined;
  if (!state.running) return;
  let ticks = 0;
  ticker = setInterval(() => {
    const el = document.getElementById("elapsed");
    if (el) el.textContent = elapsed(state.running.started);
    if (++ticks % (TIP_MS / 1000) === 0) {
      tip++;
      document.getElementById("status")?.replaceWith(status(state)); // only the tip: the rest keeps focus and scroll
    }
  }, 1000);
}

window.addEventListener("message", (e) => {
  if (e.data.type !== "state") return;
  // A new run starts on a different tip than the last one ended on.
  if (e.data.running && !state?.running) tip = Math.floor(Math.random() * e.data.tips.length);
  state = e.data;
  render();
});
send({ type: "ready" });
