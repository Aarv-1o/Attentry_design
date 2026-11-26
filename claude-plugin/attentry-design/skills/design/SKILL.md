---
name: design
description: Make an illustration or a video with Attentry Design's stages (brief, options, lock, finish, card). Use when the person asks to design, draw, illustrate or animate something, or asks to check a design.
---

1. **Brief.** Ask the person, in one round with your question tool, only what they didn't say:
   the one thing it should say, what it's for, who sees it, where it's used and at what size, the style of the world
   (hand-drawn, flat vector, isometric, 3D look, pixel art, or another), the exact text, the mood, and anything it must
   have or avoid. If they skip or decline the questions, don't stop: choose sensible answers
   yourself, state them in one line, and go on to the options, where they choose by looking.
   **Then the words**, which carry the message: for a video the script (every caption or spoken
   line, in order, with how long it stays up, written as `line | 3s`); for a picture the headline and every label.
   If the person gave them, use them word for word. If not, draft them from the single message,
   show them in the chat as a plain list headed "The script" (for a picture, "The words"), and wait for a yes or changes before drawing. Don't skip
   this, even when the questions were skipped: a picture can't rescue words that don't say it.
2. **Options.** Draw 2–5 small options as separate SVG or HTML files (for a video, one storyboard
   file per option with 4–6 key frames). Make them differ in composition, value plan and palette,
   in how they explain the idea (one scene, a before and after, a flow), and in style if the
   person didn't choose one. Call Attentry Design's `check_options` with the
   files and redo what it flags. Then show the person the contact sheet and ask which one, by
   number.
   While drawing: build it around that one message. Plan the text first: one headline, labels
   clearly smaller (sizes at least 1.5× apart), and measure each line (characters × letter width)
   against the frame so it stays inside a 5% margin. Lettering drawn as shapes (pixel art,
   hand-drawn type): wrap each line in `<g data-text="the words">` so it can be measured. Draw each idea as the kind of picture it is: a
   thing as a portrait, an amount as a chart, a place as a map, a sequence as a timeline, a process
   as a flow with arrows (Roam's <6><6> rule). Size the main characters by the smallest part that
   must read (an expression, a gesture). Give an explaining picture a title and label its parts;
   keep text and shapes clearly away from edges or clearly overlapping them, never just touching. Pixel art: one pixel grid, no doubled sprites (mixels). 3D look: one key
   light above and to the side, a dimmer fill never mirroring it, soft contact shadows all one way,
   small highlights, no flat ambient sides.
   To look at a design while drawing, call `preview_design` (or `preview_video` for a frame); it
   only renders, so use it instead of `check_options` with copies.
3. **Lock.** Call `lock_design` with the chosen file, a short name, the style, the approved
   words (one line each), and the mood and purpose from the brief (a dark mood or a tribute keeps
   the check from suggesting against them); the check then flags any approved word missing from the design. A pixel-art lock
   is checked for pixel-sharp edges.
4. **Finish.** Make it full size and call `check_design` with the file and the lock. Open the
   render it names and look at it. Fix the errors. Mention the suggestions; don't force them.
   Each check keeps a numbered version (v1, v2…); when the person wants an earlier one back
   ("the first one was better"), call `restore_version` and edit from there.
5. **Card.** End with a short design card: the file, the lock, what was found and fixed, and any
   part that may not get its message across. Say so plainly; don't hide weak parts.

**Remotion videos** use the same stages with the video tools: each option is a short composition
(`check_video_options` with the entry file and the composition ids), then `lock_video`, then
`check_video` on the finished composition. The first call bundles the project (a few seconds).

Attentry Design checks quality, not taste: the person's choices win. If they want it quick, skip
to step 4.
