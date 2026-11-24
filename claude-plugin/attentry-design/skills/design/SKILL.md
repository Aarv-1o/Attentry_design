---
name: design
description: Make an illustration or a video with Attentry Design's stages (brief, options, lock, finish, card). Use when the person asks to design, draw, illustrate or animate something, or asks to check a design.
---

1. **Brief.** Ask the person, in one round with your question tool, only what they didn't say:
   the one thing it should say, what it's for, who sees it, where it's used and at what size, the style of the world
   (hand-drawn, flat vector, isometric, 3D look, pixel art, or another), the exact text, the mood, and anything it must
   have or avoid. If they skip or decline the questions, don't stop: choose sensible answers
   yourself, state them in one line, and go on to the options, where they choose by looking.
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
   keep text and shapes clearly away from edges or clearly overlapping them, never just touching. Pixel art: one pixel grid, no doubled sprites (mixels).
3. **Lock.** Call `lock_design` with the chosen file, a short name and the style. A pixel-art lock
   is checked for pixel-sharp edges.
4. **Finish.** Make it full size and call `check_design` with the file and the lock. Fix the
   errors. Mention the suggestions; don't force them.
5. **Card.** End with a short design card: the file, the lock, what was found and fixed, and any
   part that may not get its message across. Say so plainly; don't hide weak parts.

**Remotion videos** use the same stages with the video tools: each option is a short composition
(`check_video_options` with the entry file and the composition ids), then `lock_video`, then
`check_video` on the finished composition. The first call bundles the project (a few seconds).

Attentry Design checks quality, not taste: the person's choices win. If they want it quick, skip
to step 4.
