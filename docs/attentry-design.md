# Attentry Design: plan

Rewritten 2026-11-24 around the five design stages (the first draft is in
archive/attentry-design-plan-2026-11-15.md). Agreed with the person: video and illustration
first; everything shown in the chat; up to 5 options; quality, never taste.

## What it is

A companion to Attentry for design work. When someone asks their coding agent to design or
create something (an invitation illustration, a poster, a scene, a launch video), Attentry Design
steps in at the moments where design goes wrong: before anything is drawn, when options are
chosen, and when the work is finished. It runs on the person's machine, with no AI and no tokens.

It improves quality and never judges taste. Everyone has their own taste; Attentry Design makes
sure the brief was asked, the options really differ, the choice is kept, and the result has no
errors. It draws nothing itself: the agent draws, Attentry Design structures the process and
measures the result.

Own logo, own page on the Attentry site. Name to be decided.

## Why it steps in earlier than Attentry

Attentry waits for code and finds problems in it. With a picture, most of the damage is done
before anything is drawn: the agent guesses the occasion, mood, size and text, falls back on its
defaults (centered, symmetric, pastel, the first idea) and often never looks at what it made
(attentry-design-illustration.md; Loomis p. 179 on the first idea). So the useful moments are
the brief, the options and the finished render, not every edit.

## The five stages

| Stage | When | What happens | How (Claude Code) |
|---|---|---|---|
| **1. Brief** | The person asks for a design | Attentry Design recognizes a design request and gives the agent the questions to ask (occasion, audience, size, the world style: stick figure, flat 2D, 3D or pixel art, exact text, mood, must-haves) and the project's palette and fonts if any. The agent asks the person before drawing. | `UserPromptSubmit` hook adds the brief; the agent asks with its question tool |
| **2. Options** | Before the full drawing | The agent makes up to 5 small options (thumbnails for an illustration, 4–6 key frames each for a video), the count set by the request. Attentry Design renders them into one contact sheet and checks they really differ. | MCP tool `check_options` |
| **3. Lock** | The person picks one | The choice is saved as a design lock: style, palette, composition type, value plan, light direction, fonts, text, size. If no style was chosen, the options differ in style too. A pixel-art lock is checked for pixel-sharp edges (smoothing turns a handful of colors into hundreds); other styles are taste and aren't checked. | MCP tool `lock_design`, file `.attentry-design/<name>.lock.json` |
| **4. Finish** | The agent draws it full size | Attentry Design renders it, checks errors (to fix) and defaults (suggestions), and compares it with the lock. | MCP tool `check_design` |
| **5. Card** | End of the task | A design card in the chat: the image or frame strip, the lock, what was found and fixed, each finding with its source. | Rendered PNG plus markdown |

Quick requests ("just a quick one") skip to stage 4 with the error checks only.

**In the chat, not a panel.** Everything the person sees comes through the agent's replies, so
the information stays in one place. Images can't be drawn in a terminal, so the contact sheet and
the card are PNG files the agent links; the person picks an option by number in the question
tool.

**Never:** judge taste, draw, use AI, step in while the agent is sketching.

## Stage 2: what "really different" means

The options should differ on the axes the books name, not in small details:

- **Composition type** (Payne's fifteen, e.g. steelyard, S-curve, diagonal, group mass). Measured
  as the subject's position and the mass layout.
- **Value plan** (Loomis's four: which value is the field). Measured from the luminance
  histogram.
- **Palette.** Measured as the main colors in OKLab and the distance between option palettes.
- **Light direction** where there is light: from the source for code-drawn art.

Findings: options nearly identical as thumbnails; all subjects centered; all on the same value
plan; palettes within a small distance of each other. The report says which to redo and along
which axis. Attentry Design suggests axes; it never says which option is better.

## Stage 4: the first checks

Each with fixtures it must flag and must not flag. Errors are told to the agent to fix; defaults
are suggestions, a few at most per check.

**Illustration**

| Check | Kind | Read from |
|---|---|---|
| Text contrast under WCAG 4.5:1 (3:1 large) on what's really behind it | error | render |
| Text outside the safe margin or cut by the edge | error | source + render |
| Shadow lighter than the lit side (Loomis p. 22) | error | source (code-drawn) |
| Highlights and shadows in different directions on different elements | error | source (code-drawn) |
| Off the lock: colors outside the locked palette, fonts not locked | error | source |
| Subject dead center (Bang, Payne, Loomis, Goree) | default | render |
| Even spacing of elements (Payne, Loomis, Gurney) | default | source + render |
| Values scattered, or bunched mid-grey (Loomis, Gurney) | default | render |
| Saturation high over most of the frame; all three primaries raw (Loomis) | default | render |
| Too smooth: flat fills only, no texture (Goree, Loomis, Gurney) | default | source + render |

**Video** (from attentry-design-rules.md, measured on rendered frames and the source): text shown
too briefly, too small, low contrast, outside the safe area; a still shot; text changing during a
camera move; no hook in the first second; no end card. Storyboard options in stage 2 use the same
diversity measures per key frame.

Later: generated images (pixels only: lettering through OCR, hot skin, two eye levels), more
direction cards, copy.

## Tech stack (agreed 2026-11-24)

Same base as Attentry: Node 22, TypeScript run with tsx, `node:test`, esbuild for the bundle,
`@modelcontextprotocol/server` and zod for the MCP tools.

New packages:

- **`playwright-core`**: renders SVG and HTML designs in the person's installed Chrome or Edge
  (nothing downloaded) and reads every element's computed colors, fonts and text boxes. One
  renderer for both, so an SVG never looks different between options and checks. (`resvg-js` was
  agreed first and dropped for this reason.)
- **`sharp`**: resizes renders, gives raw pixels, composes the contact sheet and the card.
- **`culori`**: OKLab, WCAG contrast and luminance, color distance, parsing CSS colors.
- **Remotion stills** through the person's own `@remotion/renderer` (not bundled; Remotion's
  license is theirs). For step 3.
- **Later:** `tesseract.js` for lettering in generated images.

Written by hand, because no library fits: the diversity report, the subject-position estimate
(contrast-weighted center of mass), a 20-line k-means for the palette, and the checks.

## Build order

1. **The engine, as a command** (built 2026-11-24, `src/`, 10 tests). `attentry-design options <files>` (render, contact sheet,
   diversity report), `attentry-design lock`, `attentry-design check <file>`, for SVG
   illustrations. Fixtures for every check. Tried on illustrations made the plain way and the
   staged way, like the direction test of 2026-11-19.
2. **Claude Code** (built 2026-11-24, `claude-plugin/`). The brief hook and the three MCP tools, as a
   plugin. Tried in a real session: three options that differ, a lock, a finished design checked
   clean. sharp and playwright-core resolve from the repo's node_modules for now; shipping them is
   step 4.
3. **Video** (built 2026-11-24). Options are short compositions, shown as storyboards (5 key
   frames each). The finished video is read every quarter second, pixels and on-screen text, by
   driving the project's own Remotion bundle and server in the browser (Remotion's internals,
   detected and refused if a version changes them). Checks: lines or cards too brief to read
   (lines shown together are timed together; a typed line counts from its last letter), text too
   small or low in contrast, text cut by the frame, blank stretches, the same frame over 6 s, fonts,
   the lock; text near the edge is one suggestion. Crowded frames (a whole IDE) are texture: only
   caption-sized text in them counts. On Attentry's own two videos it agrees with the 2026-11-19
   hand review on reading time (the hook: 34 characters in 0.75 s, needs 2 s), contrast and fonts.
   Not yet: text changing during a camera move (T3), sizes too close (R4), the call to action at the
   end (S1).
4. **Packaging.** The VS Code extension and the stores, the site page, then Codex. Decide here how
   it takes Attentry's plumbing (hooks install, background process, Check setup): a package
   Attentry publishes, a copy, or a split-out core.

## Others doing parts of this (2026-11-24)

- **huashu-design** (Claude Code skill): offers three directions from 20 design philosophies
  when a request is vague, then builds. **Superdesign**: several UI variations in parallel.
  **Interface Design**: saves design decisions to a system file. **Google Stitch**: variants of a
  screen along chosen axes, a design.md. **Recraft**: saved brand styles for illustration sets.
  Remotion guides recommend approving a storyboard before building, by prompt only.
- What none of them do: check that options really differ, hold the result to the lock, and render
  and check the result without AI. Nearly all target web UI, not illustration or video.

## Open questions

- Name in the stores and on the site.
- How it takes Attentry's plumbing (step 4).
- HTML/CSS illustrations need a browser to render: in step 1, or after?
- Vertical video safe areas from day one, or 16:9 first?
