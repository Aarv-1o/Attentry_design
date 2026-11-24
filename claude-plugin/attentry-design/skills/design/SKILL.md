---
name: design
description: Make an illustration or a video with Attentry Design's stages (brief, options, lock, finish, card). Use when the person asks to design, draw, illustrate or animate something, or asks to check a design.
---

1. **Brief.** Ask the person, in one round with your question tool, only what they didn't say:
   what it's for, who sees it, where it's used and at what size, the exact text, the mood, and
   anything it must have or avoid.
2. **Options.** Draw 2–5 small options as separate SVG or HTML files (for a video, one storyboard
   file per option with 4–6 key frames). Make them differ in composition, value plan and palette.
   Call Attentry Design's `check_options` with the files and redo what it flags. Then show the
   person the contact sheet and ask which one, by number.
3. **Lock.** Call `lock_design` with the chosen file and a short name.
4. **Finish.** Make it full size and call `check_design` with the file and the lock. Fix the
   errors. Mention the suggestions; don't force them.
5. **Card.** End with a short design card: the file, the lock, and what was found and fixed.

Attentry Design checks quality, not taste: the person's choices win. If they want it quick, skip
to step 4.
