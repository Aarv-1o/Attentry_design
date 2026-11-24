# Research behind Attentry Design

Started 2026-11-15. Research only: nothing is built until it's agreed. Same order as Attentry's
research: is the problem real, what existing tools miss, what the books teach, then a baseline of
real AI-made videos.

Sources marked *(secondary)* were read through blogs or summaries, not the original. Check those
against the original before a rule depends on them.

## The problem is real

- **AI video agents share one weak layer.** A video editor's test of seven AI video tools found the
  same four weak spots in nearly every output: the first frame, the title banner, numbers shown only
  in speech, and the end card ("a category-wide blind spot"). The tests are unpublished and the
  article sells a competing tool (AutoAE), so this is one opinion, but it matches the rest.
  *(autoae.online, May 2026)*
- **Story and pacing are where AI video breaks.** Production studios report that short clips hide
  flaws, but longer pieces expose "continuity, pacing, voice synchronization, and scene
  transitions." *(c-istudios, secondary)*
- **Most social video plays muted.** Verizon and Publicis: 92% watch with the sound off on mobile,
  83% across devices; about 50% rely on captions *(secondary, via Kapwing)*. Digiday (2016): up to
  85% of Facebook video views were silent (publisher data). Text on screen carries the message, so
  text timing and contrast matter more than the voiceover.
- **Structure is what AI leaves out.** One published approach to AI motion graphics has a second
  step write a structured plan (camera moves, annotations) before rendering. Another reports that
  stating start and end states gives more natural transitions than text prompts alone. Planning
  before animating helps, as checking a plan before coding does in Attentry.

## What existing tools miss

- **Remotion's official agent skills** teach correct Remotion code (current APIs, frame-driven
  animation, preview while editing). Nothing on story, pacing, color or readability.
- **Skills that direct generation** (video-shotcraft, director, video_toolkit, product-launch-video)
  give the agent recipes, storyboards and sound guides before it makes the video. None of them
  checks the result after each change, and none tells the agent what its last edit made worse.
  video-shotcraft says it "checks every frame": to test before we rely on that.
- **Template libraries** (AutoAE) replace the generated parts with designed templates. That fixes
  how it looks, not whether it reads.
- **Broadcast QC** (HardingFPA, Venera Pulsar) checks flashing for epilepsy safety, for TV and
  streaming delivery. All commercial; no open-source analyzer turned up.
- **The gap:** nothing watches what an agent makes while it makes it, against the rules an editor
  applies, without AI. That's the same gap Attentry fills for code.

## Lessons from the books

Each book gives rules a person applies by eye. The question for each: which of them can be
measured from the source or the rendered frames?

- **Walter Murch, *In the Blink of an Eye*** (editing). The Rule of Six, in order: emotion (51%),
  story (23%), rhythm (10%), eye-trace (7%), the 2D plane (5%), 3D space (4%) *(percentages
  secondary)*. Never give up emotion for story, or story for rhythm.
  *Measurable:* rhythm (shot lengths and how they vary) and eye-trace (does the next shot put the
  important thing where the eye already is: compare positions across a cut). *Not measurable:*
  emotion and story. Attentry Design has to say that it checks the lower rungs only.
- **Bruce Block, *The Visual Story*.** Everything on screen is seven components: space, line and
  shape, tone, color, movement, rhythm, and contrast and affinity across them. Contrast raises
  intensity; affinity lowers it. A story's intensity should rise and fall, peaking at the climax.
  *Measurable:* tone, color, movement and rhythm per shot, so a video's intensity can be graphed
  across time. A flat graph (everything the same intensity) or a peak at the wrong place (the
  strongest moment isn't the reveal) can be flagged.
- **Frank Thomas and Ollie Johnston, *The Illusion of Life*** (the 12 principles of animation).
  The most useful for motion graphics: slow in and slow out (easing), timing, anticipation,
  follow-through, staging. Overuse is the warning: too much motion "turns professional software
  into a cartoon."
  *Measurable:* easing (an animated property with a linear or missing curve), staging (more than
  one thing moving at once when one should lead), timing (durations far outside the usual range).
- **Richard Williams, *The Animator's Survival Kit*.** Timing (how long) and spacing (how the
  steps are spread) are separate decisions. *Measurable:* spacing, from the frame-by-frame values.
- **Patti Bellantoni, *If It's Purple, Someone's Gonna Die*** and **Josef Albers, *Interaction of
  Color***. Color carries meaning and changes with what's next to it. Practitioners' version: a
  restrained base and one accent, saved for what the viewer should notice first *(secondary)*.
  *Measurable:* the palette per scene, the number of accent colors, the contrast of text on its
  real background, whether the accent lands on the call to action.
- **David Sonnenschein, *Sound Design*** and **Michel Chion, *Audio-Vision***. Sound changes what
  people see: it sets rhythm and tells the eye where to look. *Measurable:* sound at cuts and at
  key motion, silence used on purpose, loudness. Comes after the visual rules.
- **Donald Miller, *Building a StoryBrand*** and **Nancy Duarte, *Resonate***. The viewer is the
  hero; the product is the guide. Demo-video guides converge on hook, problem, solution, proof,
  call to action, with the hook in the first 3 to 5 seconds *(secondary)*.
  *Measurable:* only the shape: is there something in the first seconds, does it end on a call to
  action. Whether the story is good isn't.
- **Still to read for this:** Austin Shaw, *Design for Motion*; Jon Krasner, *Motion Graphic
  Design*; Karen Pearlman, *Cutting Rhythms*; Joseph Mascelli, *The Five C's of Cinematography*;
  Edward Tufte, *The Visual Display of Quantitative Information* (for data callouts).

## Full reading list (rechecked 2026-11-18)

Grouped by area. ★ = buy first: the most rules that can be measured per page.

- **Editing and rhythm:** ★ Murch, *In the Blink of an Eye*; Pearlman, *Cutting Rhythms*; Ken
  Dancyger, *The Technique of Film and Video Editing*.
- **Direction and composition:** ★ Block, *The Visual Story*; ★ Gustavo Mercado, *The Filmmaker's
  Eye* (composition rules shot by shot: thirds, headroom, lead room, all measurable from a frame);
  Steven Katz, *Film Directing Shot by Shot*; Mascelli, *The Five C's of Cinematography*;
  Christopher Kenworthy, *Master Shots*; Jennifer van Sijll, *Cinematic Storytelling*.
- **Animation and motion:** ★ Thomas & Johnston, *The Illusion of Life*; Williams, *The
  Animator's Survival Kit*; Shaw, *Design for Motion*; Krasner, *Motion Graphic Design*; Liz
  Blazer, *Animated Storytelling* (short, made for motion graphics).
- **Color:** ★ Alexis Van Hurkman, *Color Correction Handbook* (scopes, skin tones, legal levels:
  the most measurable color book); Albers, *Interaction of Color*; Bellantoni, *If It's Purple,
  Someone's Gonna Die*; Johannes Itten, *The Elements of Color*; James Gurney, *Color and Light*;
  Charles Poynton, *Digital Video and HD* (luma, gamut, legal range; technical).
- **Layout and hierarchy:** ★ Robin Williams, *The Non-Designer's Design Book* (contrast,
  repetition, alignment, proximity: alignment and spacing are measurable); Josef Müller-Brockmann,
  *Grid Systems in Graphic Design*; Lupton & Phillips, *Graphic Design: The New Basics*; Rudolf
  Arnheim, *Art and Visual Perception* (visual weight and balance).
- **Type:** ★ Bringhurst, *The Elements of Typographic Style*; Lupton, *Thinking with Type*;
  Spiekermann, *Stop Stealing Sheep*; Bellantoni & Woolman, *Type in Motion*; Barbara Brownie,
  *Transforming Type*; Butterick, *Practical Typography* (free online).
- **VFX and compositing:** Ron Brinkmann, *The Art and Science of Digital Compositing* (edges,
  matching light, grain, motion blur); Mark Christiansen, *After Effects Visual Effects and
  Compositing Studio Techniques* (closest to motion graphics); Steve Wright, *Digital Compositing
  for Film and Video*; *The VES Handbook of Visual Effects*. Later: Remotion videos rarely composite.
- **Sound:** Sonnenschein, *Sound Design*; Chion, *Audio-Vision*.
- **Story:** Miller, *Building a StoryBrand*; Duarte, *Resonate*.
- **Data on screen:** Tufte, *The Visual Display of Quantitative Information*.

Free standards (no need to buy; read directly): Netflix Timed Text Style Guide, BBC subtitle
guidelines, WCAG 2.2 (contrast, flashing), ITU-R BT.1702 (flashing), ITU-R BT.709 (color, legal
range), EBU R128 / ITU-R BS.1770 (loudness), Material Design 3 motion, platform safe-zone pages,
Kevin Larson's readability papers.

## Numbers the rules can stand on (to confirm against the originals)

- **Reading speed:** Netflix subtitle guides: 17 characters per second for adults in most languages
  (English reported as 20), at least 5/6 of a second and at most 7 seconds per subtitle, about 42
  characters a line, 2 lines. BBC: about 160 to 180 words a minute, from Ofcom; over 200 is hard to
  follow *(secondary)*.
- **Contrast:** WCAG 2: 4.5:1 for normal text, 3:1 for large text.
- **Flashing:** WCAG 2.3.1 and ITU-R BT.1702: no more than 3 flashes a second. A harmful flash is a
  pair of opposite brightness changes of 20 cd/m² or more over more than a quarter of the screen
  *(BT.1702 via secondary)*.
- **Easing and duration:** Material Design: standard easing for short, functional moves (about
  300 ms in its example), emphasized easing for longer, expressive ones (about 650 ms). M3 curves are
  listed as cubic-bezier values *(secondary, check m3.material.io)*.
- **Vertical safe areas:** the platforms disagree and change their layouts. A shared centered box
  of about 900×1400 on a 1080×1920 frame is the common advice for cross-posting *(secondary)*. Any
  rule here has to be a setting, not a fixed number.

## First rule ideas (from the above, not yet agreed)

Readable text (reading speed, contrast, size, safe area), flashing, easing, one thing leading the
motion, palette and accent use, a hook in the first seconds, still shots, rhythm of shot lengths,
the intensity curve, an end card. Story and emotion stay out: they can't be measured.

## Next research steps

1. **Read the books**, starting with Block (the most measurable), Murch and *The Illusion of Life*.
   Confirm the numbers marked secondary against their originals.
2. **Baseline**, like Attentry's first scan: collect real AI-made Remotion videos (public repos and
   showcases built with Claude Code and Remotion's skills), watch them, and write down every problem
   by hand. Which problems recur, and which would an editor flag first?
3. **Try the existing tools** on the same videos: Remotion's skills and video-shotcraft. What do
   they already catch?
4. **Only then** pick the first rules, each with fixtures it must flag and must not flag.

## Sources

- AutoAE, "Why every AI video agent in 2026 has the same motion graphics problem":
  https://autoae.online/blog/ai-video-agents-motion-graphics-problem-2026
- c-istudios, why commercial AI videos are hard: https://c-istudios.com/why-creating-commercial-ai-videos-is-hard/
- Kapwing subtitle statistics: https://kapwing.com/resources/subtitle-statistics
- Digiday, 85% of Facebook video watched without sound: https://digiday.com/media/silent-world-facebook-video/
- Structured motion graphics plan (TD Commons): https://www.tdcommons.org/dpubs_series/8627
- Remotion agent skills: https://www.remotion.dev/docs/ai/skills
- video-shotcraft: https://raw.githubusercontent.com/Vincentwei1021/video-shotcraft/main/README.md
- HardingFPA: https://hardingfpa.com/ ; Netflix photosensitive epilepsy guidance:
  https://backlothelp.netflix.com/hc/en-us/articles/360057622133
- Murch's Rule of Six: https://nofilmschool.com/2016/11/6-rules-good-cutting-according-oscar-winning-editor-walter-murch ;
  https://cloud.wikis.utexas.edu/wiki/spaces/rtf318/pages/80022510/Murch+s+Rule+of+Six
- Block, *The Visual Story* (Routledge): https://www.routledge.com/The-Visual-Story/Block/p/book/9781138014152 ;
  chapter 2 preview: https://www.oreilly.com/library/view/the-visual-story/9780240807799/009_9780080551692_chapter2.html
- 12 principles applied to UI: https://ixdf.org/literature/article/ui-animation-how-to-apply-disney-s-12-principles-of-animation-to-ui-design
- Material motion: https://material.io/design/motion/customization.html ; https://m1.material.io/motion/duration-easing.html
- Netflix timed text general requirements: https://backlothelp.netflix.com/hc/en-us/articles/215758617
- BBC R&D, how fast should subtitles be: https://bbcbreakingnews.pages.dev/rd/blog/2015-09-how-fast-should-subtitles-be
- Vertical safe zones: https://reap.video/blog/short-form-video-safe-zones ; https://blitzcutai.com/blog/best-caption-placement-short-form-video
- One accent color: https://www.capcut.com/create/monochrome-color-grading-single-accent-hue-brand-videos
- Demo structure: https://www.spielcreative.com/blog/?p=18285 ; https://joinbrands.com/blog/product-demo-video-script/
