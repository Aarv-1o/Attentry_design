// The Attentry Design panel's page. Everything it shows arrives as one "state" message from the
// extension; lock names, words and file names come from files, so text is always set with
// textContent, never as markup.
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
  preview_design: "Rendering the design",
  preview_video: "Rendering the video frames",
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
  for (const c of children.flat(Infinity)) if (c !== undefined && c !== null && c !== false) el.append(c);
  return el;
}

const send = (message) => vscode.postMessage(message);
const pill = (kind, label) => h("span", { class: `pill ${kind}` }, h("i", { "aria-hidden": "true" }), label);
const fileName = (path) => path.split(/[\\/]/).pop();
const elapsed = (started) => `${Math.max(0, Math.round((Date.now() - started) / 1000))} s`;

function since(time) {
  const minutes = Math.round((time - Date.now()) / 60000);
  if (minutes > -1) return "just now";
  if (minutes > -60) return ago.format(minutes, "minute");
  if (minutes > -60 * 24) return ago.format(Math.round(minutes / 60), "hour");
  return ago.format(Math.round(minutes / 1440), "day");
}

// Like Attentry's: a menu when the window has several projects with designs in them.
function project(s) {
  if (!s.project) return h("section", {}, h("p", { class: "quiet" }, "Open a folder to use Attentry Design."));
  if (s.projects.length < 2) return h("section", {}, h("p", { class: "project-name" }, s.projects[0]?.name ?? fileName(s.project)));
  const select = h("select", { id: "project", onchange: (e) => send({ type: "project", path: e.target.value }) },
    s.projects.map((p) => h("option", { value: p.path, selected: p.path === s.project }, p.name)));
  return h("section", {}, h("div", { class: "project" }, h("label", { for: "project" }, "Project"), select),
    h("p", { class: "quiet" }, `${s.projects.length} projects with designs in this folder.`));
}

function status(s) {
  if (s.running) {
    const t = s.tips[tip % s.tips.length];
    return h("section", { id: "status", "aria-label": "Status", "aria-live": "polite" },
      h("div", { class: "who" }, h("h2", {}, "Status"), pill("live", "Working")),
      h("p", { class: "doing" }, h("b", {}, `${WORKING[s.running.tool] ?? "Working"}…`), " ", h("span", { id: "elapsed", class: "quiet" }, elapsed(s.running.started))),
      h("div", { class: "sweep", "aria-hidden": "true" }),
      h("div", { class: "tip" }, h("p", {}, t.tip), h("p", { class: "source" }, t.source)));
  }
  return h("section", { id: "status", "aria-label": "Status" },
    h("div", { class: "who" }, h("h2", {}, "Status"), pill("ok", "Ready")),
    s.task
      ? h("p", { class: "quiet" }, `Last request: ${KINDS[s.task.kind]}${s.task.pinned ? " (pinned)" : ""}, ${since(s.task.at)}`)
      : h("p", { class: "quiet" }, "Ask Claude Code for an illustration or a video to start."));
}

function mode(s) {
  const current = s.pin?.kind ?? "auto";
  const tab = (kind, label) => h("button", { role: "tab", "aria-selected": String(current === kind), onclick: () => current !== kind && send({ type: "mode", kind }) }, label);
  const hint = current === "auto"
    ? "Picks illustration or video from each request."
    : `Every design request gets the ${KINDS[current].toLowerCase()} brief until you set Auto.`;
  return h("section", { "aria-label": "Mode" }, h("h2", {}, "Mode"),
    h("div", { class: "tabs", role: "tablist", "aria-label": "Mode" }, tab("auto", "Auto"), tab("illustration", "Illustration"), tab("video", "Video")),
    h("p", { class: "quiet" }, hint));
}

function setup(s) {
  const p = s.plugin;
  const checks = [];
  const check = (kind, mark, text) => checks.push(h("li", { class: kind }, h("span", { class: "mark", "aria-hidden": "true" }, mark), h("span", {}, text)));
  let action;
  let connected = false;
  if (p === "checking") check("", "…", "Checking Claude Code");
  else if (p === "connecting") check("", "…", "Connecting Claude Code. This can take a minute.");
  else if (p.error) {
    check("bad", "✕", `Couldn't connect: ${p.error}.`);
    action = h("div", {}, h("p", { class: "quiet" }, "Run this in a terminal instead:"), h("code", { class: "command" }, p.command),
      h("div", { class: "buttons" }, h("button", { class: "secondary", onclick: () => send({ type: "copy", text: p.command }) }, "Copy"), h("button", { class: "secondary", onclick: () => send({ type: "connect" }) }, "Try again")));
  } else if (!p.installed) {
    check("", "○", "Claude Code doesn't have Attentry Design yet.");
    action = h("button", { class: "primary", onclick: () => send({ type: "connect" }) }, "Connect Claude Code");
  } else if (!p.enabled) {
    check("", "○", "Installed in Claude Code, but turned off.");
    action = h("button", { class: "primary", onclick: () => send({ type: "connect" }) }, "Turn on");
  } else {
    connected = true;
    check("ok", "✓", `Claude Code connected (${p.version})`);
    if (s.justConnected) action = h("p", { class: "quiet" }, "Start a new Claude Code session to use it.");
  }
  if (s.libraries === "ready") check("ok", "✓", "Libraries ready");
  else if (s.libraries === "installing") check("", "…", "Installing the libraries the checks use (about 100 MB)");
  else if (s.libraries === "missing") check("", "○", "The libraries install when the next Claude Code session starts.");
  check(s.browser ? "ok" : "bad", s.browser ? "✓" : "✕", s.browser ? `Renders with ${s.browser}` : "Needs Chrome or Edge installed to render designs.");
  // All fine: one line, opened only on request. Anything to do: open.
  const ready = connected && s.libraries === "ready" && s.browser;
  return h("section", { "aria-label": "Setup" },
    h("details", { open: setupOpen ?? !ready },
      // A click, not the toggle event: that one also fires when the section is drawn already open.
      h("summary", { onclick: (e) => (setupOpen = !e.currentTarget.parentElement.open) }, h("h2", {}, "Setup"), ready ? pill("ok", "Ready") : pill("warn", "Needs you")),
      h("ul", { class: "checks" }, checks), action));
}

const SVG = "http://www.w3.org/2000/svg";
const svg = (tag, attrs) => {
  const el = document.createElementNS(SVG, tag);
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
  return el;
};
const LANE = 14; // px between branch lines
const ROW = 36; // px per row, as in the CSS
const laneX = (l) => 7 + l * LANE;

/**
 * The versions as a tree, git-graph style: the picked option at the root, each version under the
 * one it grew from. A version's first child carries on its line; any later child (a change made
 * after going back) branches into a new lane to the right, leaving from its parent's dot.
 */
function treeRows(versions) {
  const kids = new Map();
  for (const v of [...versions].sort((a, b) => a.n - b.n)) {
    const parent = v.parent ?? 0;
    if (!kids.has(parent)) kids.set(parent, []);
    kids.get(parent).push(v);
  }
  const rows = [{ root: true, lane: 0 }];
  const rowOf = new Map([[0, 0]]); // version number (0: the root) → its row
  const lanes = [{ start: 0, end: 0 }]; // per lane: its first and last row, and the row it leaves from
  const walk = (n, lane) => (kids.get(n) ?? []).forEach((v, i) => {
    let own = lane;
    if (i > 0) {
      own = lanes.length;
      lanes.push({ start: rows.length, end: rows.length, from: rowOf.get(n), fromLane: lane });
    }
    rowOf.set(v.n, rows.length);
    lanes[own].end = rows.length;
    rows.push({ v, lane: own });
    walk(v.n, own);
  });
  walk(0, 0);
  return { rows, lanes };
}

function gutter(i, row, lanes) {
  const width = laneX(lanes.length - 1) + 7;
  const g = svg("svg", { width, height: ROW, viewBox: `0 0 ${width} ${ROW}`, "aria-hidden": "true", class: "gutter" });
  const mid = ROW / 2;
  lanes.forEach((l, lane) => {
    const x = laneX(lane);
    if (l.from === undefined) {
      // The main line: from the first dot down to the last.
      if (i >= l.start && i <= l.end && l.start < l.end) g.append(svg("line", { x1: x, y1: i === l.start ? mid : 0, x2: x, y2: i === l.end ? mid : ROW, class: "edge" }));
      return;
    }
    // A branch: a curve out of its parent's dot, then straight down its own lane to its last dot.
    if (i === l.from) g.append(svg("path", { d: `M${laneX(l.fromLane)} ${mid} C${laneX(l.fromLane)} ${ROW}, ${x} ${mid}, ${x} ${ROW}`, class: "edge", fill: "none" }));
    else if (i > l.from && i <= l.end) g.append(svg("line", { x1: x, y1: 0, x2: x, y2: i === l.end ? mid : ROW, class: "edge" }));
  });
  g.append(svg("circle", { cx: laneX(row.lane), cy: mid, r: row.current ? 4.5 : 3.5, class: row.root ? "node root" : row.current ? "node current" : "node" }));
  return g;
}

function versionTree(lock, d) {
  const { rows, lanes } = treeRows(d.versions);
  return h("div", { class: "tree", role: "list", "aria-label": `Versions of ${lock}` }, rows.map((row, i) => {
    if (row.root) {
      return h("div", { class: "vrow", role: "listitem" }, gutter(i, row, lanes),
        h("button", { class: "vmain", title: d.picked, onclick: () => send({ type: "view", path: d.picked }) },
          h("span", { class: "vname" }, "Picked option"), h("span", { class: "when" }, fileName(d.picked))));
    }
    const v = row.v;
    row.current = v.n === d.head;
    return h("div", { class: `vrow ${row.current ? "current" : ""}`, role: "listitem" }, gutter(i, row, lanes),
      h("button", { class: "vmain", title: `Open v${v.n} (${fileName(v.file)})`, onclick: () => send({ type: "view", path: v.snapshot }) },
        v.thumb ? h("img", { class: "thumb", src: v.thumb, alt: "" }) : h("span", { class: "thumb empty" }),
        h("span", { class: "vname" }, `v${v.n}`),
        row.current ? pill("ok", "Current") : h("span", { class: "when" }, since(v.at))),
      row.current ? undefined : h("button", { class: "restore", title: `Put v${v.n} back in ${fileName(v.file)}; what's there now is kept as a version`, onclick: () => send({ type: "restore", lock, n: v.n }) }, "Restore"));
  }));
}

function optionRow(path) {
  return h("button", { class: "row", title: path, onclick: () => send({ type: "view", path }) },
    h("i", { class: "glyph option", "aria-hidden": "true" }), h("span", { class: "file" }, fileName(path)), h("span", { class: "when" }, ""));
}

function lockCard(l) {
  if (l.error) {
    return h("li", { class: "lock" }, h("p", { class: "name" }, l.name), h("p", { class: "error-text" }, `Can't read this lock: ${l.error}`),
      h("button", { class: "link lockfile", onclick: () => send({ type: "open", path: l.path }) }, "Open lock file"));
  }
  const d = l.designs;
  const current = d.versions.find((v) => v.n === d.head);
  const latest = current?.snapshot ?? d.picked;
  const groups = [h("h3", {}, d.versions.length ? "Versions" : "Picked option"), versionTree(l.name, d)];
  if (d.options.length) groups.push(h("h3", {}, "Other options"), d.options.map(optionRow));
  const meta = [l.style, `${l.size.width}×${l.size.height}`].filter(Boolean).join(" · ");
  return h("li", { class: `lock ${l.inUse ? "in-use" : ""}` },
    h("div", { class: "title" },
      h("button", { class: "name", title: `Open ${fileName(latest)}`, onclick: () => send({ type: "view", path: latest }) }, l.name),
      l.inUse ? pill("live", "In use") : undefined),
    h("p", { class: "meta" }, meta),
    l.mood || l.purpose ? h("p", { class: "meta" }, [l.purpose, l.mood].filter(Boolean).join(" · ")) : undefined,
    l.colors.length ? h("div", { class: "swatches", role: "img", "aria-label": `Colors: ${l.colors.join(", ")}` }, l.colors.slice(0, 12).map(swatch)) : undefined,
    l.words.length ? h("p", { class: "words" }, `“${l.words[0]}”`, l.words.length > 1 ? h("span", { class: "quiet" }, ` and ${l.words.length - 1} more line${l.words.length > 2 ? "s" : ""}`) : "") : undefined,
    h("div", { class: "designs" }, groups),
    h("button", { class: "link lockfile", onclick: () => send({ type: "open", path: l.path }) }, "Open lock file"));
}

function swatch(color) {
  const el = h("span", { class: "swatch", title: color });
  el.style.background = color; // set as a property, not markup: the page's CSP allows no inline style attribute
  return el;
}

function lockList(s) {
  return h("section", { "aria-label": "Locks" }, h("h2", {}, "Locks"),
    s.locks.length
      ? h("ul", { class: "locks" }, s.locks.map(lockCard))
      : h("p", { class: "quiet" }, "No locks yet. One is saved when you pick an option in the chat."));
}

function render() {
  const parts = [project(state), status(state), state.project ? mode(state) : undefined, setup(state), state.project ? lockList(state) : undefined];
  app.replaceChildren(...parts.filter(Boolean));
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
