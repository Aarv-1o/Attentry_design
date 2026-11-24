# Attentry Design: first rules (draft, to agree)

From the research (books: docs/attentry-design-book-notes.md; videos and complaints:
docs/attentry-design-baseline.md). Nothing is built. Thresholds are starting points, to be
calibrated on fixtures: the AI-made videos that should be flagged and the pro launch videos that
should not.

Every finding is a **suggestion**: these are the lower rungs of Murch's list (rhythm, eye-trace,
the plane, space). Emotion and story can't be measured, and the copy says so.

**How a rule measures:** "source" = read from the Remotion code (font sizes, durations in frames,
fonts, colors, easing, positions); "frames" = measured on rendered frames (contrast on the real
background, blank frames, holds, edges). Most rules use both: the source says what the text is
and where, the frames say what the viewer actually sees.

---

## Readability

### R1. Text too small to read
- **Checks:** text meant to be read, at its rendered size (font size × camera zoom), against the
  frame height.
- **Starting threshold:** under about 2.2% of frame height (24 px on a 1080 frame) for any text
  that carries the message; captions and headlines under about 3.7% (40 px).
- **Must not flag:** text used as texture (code, UI in a screenshot, logs) when a readable caption
  in the same shot carries the message. That's how the pros use small text.
- **Why:** the most common problem: ~17 of 25 gallery videos, 8 of 15 skill videos. Mercado
  (Hitchcock's rule), Murch (miniature vs. mural: phones are the miniature).

### R2. Low contrast on the real background
- **Checks:** contrast between text and what is actually behind it in the rendered frame.
- **Threshold:** WCAG 2.2: under 4.5:1 for normal text, 3:1 for large text.
- **Also notes:** dark theme with grey secondary text, the most common source (AI median brightness
  50/255 vs pro 238), and saturated complementary pairs that "vibrate" even when the ratio passes
  (Albers).
- **Must not flag:** decorative text deliberately faded behind content (a ghost word), if it carries
  no message.
- **Why:** ~9 of 25 gallery, 3 of 15 skill videos. WCAG; Albers: "color is the most relative
  medium", so measure on the frame.

### R3. Text doesn't stay up long enough to read
- **Checks:** how long each piece of text is fully visible and still, counted from when it finishes
  appearing (a typewriter line counts from its last letter).
- **Threshold:** at least 1 s per 17 characters, and never under 5/6 s (Netflix timed-text
  guidelines).
- **Why:** 2 of 7 densely sampled promos never held at all; a typewriter bio got 0.6 s for 40
  characters; pros hold about 2 times every 10 s against 1 for AI.

### R4. Too many fonts, too many sizes, sizes too close
- **Checks:** font families, distinct text sizes, and pairs of sizes or fonts that are almost the
  same.
- **Thresholds:** more than 2 families (Shaw: "no more than a couple of typefaces"); more than about
  4 sizes (Bringhurst: "a modest set of distinct and related intervals"); two sizes within 1.2× used
  for different roles (Williams: "You cannot contrast 12-point type with 14-point type").

---

## Timing and motion

### T1. Blank or near-black frames
- **Checks:** frames with almost no content (pixel spread near zero).
- **Threshold:** 0.5 s or more in the first 3 s or the last second; 1 s or more anywhere else.
- **Must not flag:** a fade in or out under about 0.3 s; a loop's deliberate fade to black at the
  very end.
- **Why:** 8 of 25 gallery videos; one dipped to black 6 times in 37 s, the first inside the hook.

### T2. Pace out of range
- **Checks:** how often the picture holds still, and how long it stays the same.
- **Thresholds:** with text on screen, under about 0.5 holds per 10 s (pros: about 2); or the same
  static frame for more than about 6 s (pros' longest hold: median 2.5 s, max 5.8 s).
- **Measure holds on the text's own area**, not the whole frame (a drifting background hides a still
  headline).
- **Why:** Pearlman (pace is change per second, not just cuts); Shaw (hero moments slow down,
  transitions run fast); flat videos in the baseline (66 s of near-identical frames).

### T3. Text appears or changes during a transition
- **Checks:** text that appears, changes or is half-faded while the frame is changing a lot (a wipe,
  a camera move, a crossfade).
- **Why:** Thomas & Johnston: "A change in the middle of a major move will go unnoticed"; ghosted
  and overlapping text in 4 of 25 gallery videos; text sliding off the edge mid-wipe in 2 of 15.

### T4. Identical moves on the same frame (twinning)
- **Checks:** three or more elements starting the same animation on the same frame with the same
  curve.
- **Suggests:** a stagger of 4–6 frames (Williams: delay one "by 4 or 6 frames").
- **Why:** "Claude often applies identical spring animations to every element" (practitioner
  guide).

### T5. Movement with no easing
- **Checks:** position or scale animated linearly (constant speed, jolt at start and stop).
- **Why:** Thomas & Johnston (slow in and slow out), Williams (spacing). Opacity and color can stay
  linear.

---

## Layout

### L1. Off the edge or under platform buttons
- **Checks:** text and key elements against the frame edge (a margin of about 5%, 54 px on a 1080
  frame), and for vertical video, the platforms' top and bottom zones (a setting, since platforms
  change).
- **Why:** content cut off in 4 of 25; both vertical gallery videos put text under the platform UI;
  a vendor checklist: "no text crosses the safe margins".

### L2. Too much on screen at once
- **Checks:** separate groups of elements visible at the same time.
- **Threshold:** more than 5 (Williams: "more than three to five items").
- **Why:** posters and decks "information dense"; an 8-item feature list in the baseline.

---

## Story shape (only the shape)

### S1. A promo with no call to action at the end
- **Checks:** for videos meant to get an install or a visit: a URL, store name or call to action
  in the last seconds.
- **Must not flag:** brand launches that end on the logo (Cursor, Notion do).
- **Why:** Miller (the 5-second test: what do I do next?); 2 of 7 gallery promos.

---

## Later (needs more than a still frame)

- Accents off the music beat (Williams: the visual accent 2 frames before the sound).
- An intensity curve that stays flat or peaks away from the reveal (Block).
- Screen direction that flips between scenes (Katz).

## Applied to our own videos (2026-11-19)

The two Remotion videos in Attentry's marketing folder (not in this repo): **AttentryLoop** (37 s, 1080×1080, the "But who
checks the code it writes?" animation) and **DemoCut** (49 s, the cut of the real demo session).
Checked by hand against each rule, from the source (`src/AttentryLoop.tsx`, `src/DemoCut.tsx`)
and from rendered frames (4 a second, contact sheets).

### Where they already pass

- **Timing looks like the pros, not the AI videos:** 2.7 and 2.4 holds every 10 s (pros 2.0, AI
  1.0); longest hold 3.0 s and 6.0 s; no hard cuts; no blank frames (T1, T2).
- **No twinning:** the hook's words are staggered 5 and 4 frames apart; the outro cards 8 frames
  (T4).
- **Easing everywhere it matters:** camera moves use ease-in-out cubic, entrances use springs (T5).
- **Contrast passes for every line meant to be read** (R2): captions 8.8:1, end-card URL 7.1:1,
  teal 9.4:1, headline 16:1. Both videos are dark (brightness 28 and 22 out of 255, like the AI
  ones), but the palette was chosen with enough contrast.
- **DemoCut's captions all have enough reading time** (R3), and both videos end with a call to
  action (S1).

### What the rules flag

| # | Video | Rule | What | Where | Suggested fix |
|---|---|---|---|---|---|
| 1 | Loop | **R1 too small** | Attentry's own messages, the proof of the video, are about 20 px: the terminal note "your last edit added 2 problems" (14 px × 1.5 zoom) and the panel's findings (14 px × 1.4) | 19.8–31.5 s | Zoom further on the note (about 1.8×) or repeat its key line in the caption |
| 2 | Loop | **R1 too small** | Wide shots show the whole IDE at 1:1: every line is 12–14 px (1.1–1.3% of the frame), including the explanation "U = new file Claude just created" | 5.8 s, 12.8 s, 19.8 s | Fine as texture while the caption talks; zoom on the Explorer when the "U" note matters |
| 3 | Loop | **R3 reading time** | 6 of 7 captions carry more text than their time allows: e.g. "Before Claude writes a helper…" plus its subtitle is about 118 characters in 4.5 s (needs about 7 s); the first caption, 78 characters in 2 s | All captions; the title plus a long subtitle | Cut each subtitle to about 6 words, or drop subtitles where the screen shows it |
| 4 | Loop | **R3 reading time** | The hook: "Claude can build an app in minutes." finishes typing and fades 0.8 s later (needs about 2 s); "But who checks the code it writes?" is complete for about 1 s | 0–4.4 s | Hold each hook line about 1 s longer |
| 5 | Loop | **T3 during a move** | The key moment, Attentry flagging the 2 problems, lands while the camera zooms and the screen shakes; the change-card caption appears during a camera move | 478 (camera 462–492), 728 (camera 700–735) | Let the camera land, then flag; start captions after the move |
| 6 | Loop | T3 / L1 (minor) | During the zoom to the fix, sidebar text is sliced by the frame edge | about 26.8 s | Hide the sidebar or move the camera after the cut |
| 7 | Loop | **R4 fonts** | The 4-second hook uses 3 families (JetBrains Mono, Instrument Serif, Inter Tight); 5 across the video | Hook | Fine as a style choice; the rule notes it (Shaw: no more than a couple) |
| 8 | Loop | **R4 sizes too close** | The end card's three small lines are 26, 28 and 30 px, different roles within 1.1× of each other | End card | Two sizes: 30 for the lines, 26 for the URL, or make the URL the bigger one |
| 9 | Loop | **S1 / Hitchcock's rule** | The most prominent element of the end card is the download count (168 px); the call to action (attentry.js.org) is the smallest and dimmest line (28 px, grey) | 33.8–37 s | Make the install line ("search Attentry in Extensions") the second-biggest thing |
| 10 | Loop | R2 (minor) | The editor's placeholder "Ask Claude Code to start building" is #5a5a5a on #1f1f1f, 2.4:1 | 5.8–10.5 s | #8b8b8b (5.2:1), or leave it: it's texture |
| 11 | DemoCut | **R3 reading time** | The intro card: about 95 characters in 2.5 s (needs about 5.6 s) | 0–2.5 s | Keep "Attentry, for real" and one line, or hold 5 s |
| 12 | DemoCut | **R1 too small** | The sped-up wide shots show the whole VS Code window at about half size (text 6–8 px) for about 13 s; the final change card is about 13 px | 16–21 s, 31–36 s, 41–44 s | Captions carry the message, so it passes as texture; for the final card, crop tighter so "None added, 10 fixed" is readable in the footage too |
| 13 | DemoCut | **R1 / L2** | The terminal crops are thin strips (110–330 px of source) in the middle of a 744 px view: the product sits small with empty space above and below | 10–29 s | Crop taller or scale the strip up |
| 14 | DemoCut | **S1 / Hitchcock's rule** | Same as the loop: the call to action ("Try it on the demo repo…") is the smallest, greyest line | Outro | Install line bigger |
| 15 | DemoCut | T2 (borderline) | One 6.0 s hold while the prompt is typed at 2× speed | 8.5–14.5 s | 3× speed, or leave it |

### What it says about the rules

- **A lesson for the tool itself:** the contact sheet suggested the caption at 15 s was clipped
  at the top; at full resolution it isn't (the sheet's own timestamp label covered the letter).
  Edge checks must run on full-resolution frames and on element positions from the source, never
  on thumbnails.
- **Our biggest weaknesses are the AI ones:** small text for the key message, too much caption text
  for its time, and changes during camera moves. Not contrast, not pace, not blank frames.
- **The texture exemption matters:** without it, R1 would flag every wide IDE shot. With it, only
  the shots where the proof itself is small get flagged (#1, #12).
- **R3 is strict for captions shown over action** (Netflix's rate is for subtitles you read while
  watching). Worth calibrating: maybe count only the title when the subtitle repeats the screen.

## Open questions

- Thresholds for R1 and L1 need calibrating on the fixtures.
- Vertical video safe zones: which platforms, and kept as settings.
- How the agent marks text as texture (R1, R2 exemptions): a prop, a class, or a comment.
