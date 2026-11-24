# Attentry Design: plan (first draft, 2026-11-15, archived 2026-11-24)

Kept as it was before the rewrite around the five design stages. The current plan is
../attentry-design.md.

Not agreed and not started: research comes first (docs/attentry-design-research.md). Nothing is
built until the person says so.

A second extension, built from Attentry's working model: it checks what an AI agent makes, at the
moments the agent can still fix it, on the person's machine and without AI. Attentry checks code;
Attentry Design checks video. This is a plan to agree before any code is written.

Decided (2026-11-15):
- **Video first:** Remotion projects. Web UI may come later.
- **Its own repo** (2026-11-24): code and design live in Aarv-1o/Attentry_design, not in the
  Attentry repo. Each extension is published on its own. How it takes Attentry's plumbing is
  open (see "The shared core" and the open questions).
- **Claude Code first.** Codex later. The shared plumbing already supports it.

## The problem

AI agents now write Remotion videos that render. What they lack is direction: a weak first second,
text gone before anyone can read it, five colors fighting, a shot that sits still too long, no end
card. These are the rules an editor or motion designer applies by eye. Many can be measured from the
source and from rendered frames, so they can be checked without AI, the same way Attentry checks
code. It checks the rules, not taste: the store copy says so.

## The same moments as Attentry

| Moment | What the agent hears |
|---|---|
| With the request | The project's palette, fonts and scene components, to reuse |
| Before an edit | A color outside the palette; a scene that copies an existing component |
| After an edit | Problems found in the source: text timing, contrast of known colors, sizes, easing |
| Check-in | Problems found in rendered frames: contrast on the real background, safe area, the hook, still shots |
| End of task | A design card: a strip of frames, problems added and fixed |
| Tools | `find_existing` (palette, components), `check`, `explain`, `check_storyboard` (a plan, before animating) |

Rendering is slow (seconds per frame, longer for the first one), so it only happens at check-ins
and in `check`, never after every edit. The checks after each edit read the source only.

## First rules (each with fixtures it must flag and must not flag, AGENTS.md rule 10)

Thresholds come from published guides, so each finding can say where its number comes from.

1. **Text gone too soon.** On-screen text needs at least 1 second per 17 characters, and never less
   than 5/6 of a second (Netflix's subtitle guides: 17 characters per second for adults in most
   languages). From the source: the text and how long it's shown.
2. **Too much text at once.** More than about 42 characters per line or 2 lines (subtitle guides),
   or more than one sentence while something else moves.
3. **Text contrast.** Under 4.5:1 for normal text and 3:1 for large text (WCAG), measured on the
   rendered frame against what's really behind the text.
4. **Text too small for a phone.** Below a minimum size relative to the frame width.
5. **Outside the safe area.** Text in the edge margin, or under a platform's buttons for a vertical
   video.
6. **Off-palette colors.** A color that isn't in the project's theme. More than one accent color in
   a scene.
7. **No hook.** Nothing appears or moves in the first second; the main claim lands after 3 seconds.
8. **A still shot.** No visible change for longer than a set time (compare rendered frames).
9. **Abrupt motion.** Position or scale animated with no easing: it starts and stops with a jolt.
10. **No end card.** The last seconds have no call to action or link.

Later: sound at cuts (ffprobe), beat timing, storyboard checks, more rules from use.

## Tech stack (to install only once this plan is agreed)

- **Reading the source:** tree-sitter TypeScript and TSX, already in Attentry.
- **Rendering frames:** the person's own Remotion install (`@remotion/renderer` from their
  project), not a bundled copy. Remotion's free license covers individuals and teams of up to 3;
  bigger companies need a Remotion Company License. Attentry Design uses the project's Remotion
  rather than shipping it, and says so.
- **Pixels:** a small image library (to choose: `sharp` or `pngjs`) to read rendered frames.
- **Contrast and color:** `colorjs.io` or `culori` (WCAG contrast, color distance for "is this in
  the palette").
- **Later:** ffprobe for sound.

## The shared core

The plumbing both extensions need, moved so each takes it instead of copying it: agent hooks and
replies, the Claude Code plugin install and refresh, the heard check, the MCP server, the language
server, the background process, Check setup, settings and project picking. Attentry keeps what is
about code: languages, rules, reuse, tests, the change card's contents, Codex patches.

The move must not change Attentry: the 232 tests pass before and after, with no behavior change.

## Order

1. **Proof first, no plumbing.** A command, `attentry-design check <remotion project>`, that runs
   the first rules and prints findings. Tried on Attentry's marketing videos and two or three public Remotion
   projects. Decide from the findings whether they're useful enough to build on.
2. **Shared core.** Move the plumbing, Attentry unchanged, tests green.
3. **The extension.** Claude Code hooks, MCP tools, the panel, the design card.
4. **Release** to both stores, then Codex.

## Open questions

- Name in the stores: "Attentry Design" with the same logo, or a variant of the mark?
- Remotion only, or also Motion Canvas / Revideo later?
- Vertical video (Shorts, Reels) safe areas from day one, or 16:9 first?
- With its own repo, how does it get Attentry's plumbing (hooks, MCP server, background process,
  Check setup)? Options: Attentry publishes that part as a package both use; or the plumbing is
  copied here and the two drift apart; or a shared core is split out of Attentry into its own
  package. The first keeps one copy without moving Attentry's code into this repo.
