# Attentry Design: baseline of real AI-made videos, and what people complain about

Research only (2026-11-19). Local, like the other design docs. Two parts: (1) a hand review of
real videos made by AI agents with Remotion, (2) what people complain about in AI-made video,
posters, illustration, UI, logos and ads.

---

## Part 1: hand review of AI-made Remotion videos

### Method

- **Corpus:** Remotion's prompt gallery (remotion.dev/prompts): 25 videos, each published with the
  prompt, the agent (mostly Claude Code, some Codex, Cursor, Gemini) and the model. Every video is
  agent-made, which is exactly what Attentry Design would check.
- **Frames:** 16 frames per video, spread evenly, pulled from Mux's public thumbnail service, laid
  out as one contact sheet per video (scratchpad).
- **Reviewed so far:** 14 of 25, covering every type in the gallery: product demo (Presscut, 84 s),
  launch video (OpenClawd, 37 s), promos (VVTerm 20 s, Disc Depot 17 s, Remotion kinetic 20 s),
  announcement (Cursor, 20 s), vertical captions over footage (real estate, 15 s), vertical data
  (Strava, 16 s), data viz (bar+line chart 4 s, rocket timeline 66 s, solar system 30 s), 3D ranking
  (57 s), cinematic intro (6 s).
- **Limits:** 16 still frames can't show easing or motion, and a frame caught mid-fade is normal
  for any video. Findings below count only what is clearly wrong in a still or across the sheet.
  Durations of text on screen need denser sampling (next step).

### What recurred (out of 14)

| # | Problem | Seen in | Count | Rule it supports |
|---|---|---|---|---|
| 1 | **Text too small to read on a phone**: UI screenshots with app text a few pixels tall, axis labels, legends, monospace bios, price lines | Presscut, OpenClawd, VVTerm, Cursor, bar chart, rocket, solar, 3D ranking, cinematic | **9** | Text too small (rule 4) |
| 2 | **Low-contrast text**: dark grey on near-black, pale green on light grey, light grey on white | OpenClawd, rocket, cinematic, VVTerm, bar chart, solar | **6** | Text contrast (rule 3), measured on the frame |
| 3 | **Dead frames**: a black or empty frame in the opening seconds, empty circles or empty UI panels, a black last second | OpenClawd (black at 3.5 s, inside the hook), kinetic (empty frame, empty circles), Disc Depot (black end), 3D ranking (empty end), Presscut (empty Analytics screen) | **5** | No hook (rule 7); new: empty frame |
| 4 | **Flat pace**: the same move or layout for the whole video | rocket (66 s of near-identical frames), solar (30 s), 3D ranking (one camera move repeated 20 times), Presscut (same UI-plus-caption layout ~10 times) | **4** | Still shot (rule 8); Block's flat intensity curve; Pearlman's change per second |
| 5 | **Content cut off by the frame edge**: labels, cards, a logo | 3D ranking (labels cropped), Disc Depot (cards off the edge), rocket (logo clipped at the top), real estate (title at the very top) | **4** | Outside the safe area (rule 5) |
| 6 | **Text half-visible or overlapping during transitions**: words ghosted mid-fade over busy backgrounds, two words overlapping | kinetic ("SHIP"/"VIDEOS" overlap), real estate (ghosted caption words), Disc Depot (title over cards mid-crossfade), OpenClawd | **4** | Thomas & Johnston: a change during a big move goes unseen |
| 7 | **No call to action at the end** (for videos meant to promote) | Cursor (logo only, no link), cinematic intro | 2 of 7 promos | No end card (rule 10) |
| 8 | **Typewriter text eats reading time**: the line finishes typing just before the cut | cinematic (bio done at 5.4 s, video ends 6.0 s: 0.6 s for ~40 characters), Cursor, Disc Depot | **3** | Text gone too soon (rule 1): count reading time from when typing ends |
| 9 | **Vertical videos ignore platform UI zones**: stat panel in the bottom ~15%, title in the top ~3% | Strava, real estate | **2 of 2** vertical | Safe area for vertical (rule 5) |
| 10 | **Too many items at once**: 8 feature names in one frame | VVTerm | 1 | Williams: 3–5 groups |
| 11 | **The "AI default look"**: purple-pink gradient blobs; a glossy AI-generated logo | kinetic, Disc Depot | 2 | Off-palette; context for the copy |
| 12 | **Mixed caption styles** in one video (three type treatments) | real estate | 1 | More than 2 font families (Shaw) |

### The other 11 (mostly short effect demos)

News headline highlight, travel route on a globe, subscribe overlay, phone rise, shapes to words,
3D logo spin, pixel font, magnifying glass, vintage terminal, audio spectrum, battery dashboard,
glitch title. The same problems, plus two new ones:

- **Tiny text** again in 8 of 11 (map labels, phone notifications, dashboard values, terminal
  text, "coming soon", glitch subtitle). **Across all 25: about 17.**
- **Empty frames** again: 2–3 s of near-black before anything appears (pixel font, vintage
  terminal), and 1.2 s of blank frame after the word leaves (shapes to words). **Across all 25: 8.**
- **Flat pace** again: 17 s of near-identical spectrum bars, 18 s of terminal typing. **Across all
  25: 6.**
- **New: the hero never holds.** The 3D logo spins for 10 s without resting; it is edge-on and
  unreadable in about half the frames. The glitch title is torn in about half the frames.
  (Shaw: hero moments slow down "so the viewer can process the scene".)
- **New: decoration that pretends to be data.** The spectrum bars carry no song, no labels; a
  first-hand write-up of a similar video found the bars were "simulated", not driven by the audio.

### What the agents did well

- **Problem-first hooks when the prompt asked for structure:** Presscut opens on "Writing newsletter
  commentary takes forever"; Disc Depot on "Where do you even buy music anymore?". Both end on a
  clear call to action and a URL.
- **Consistent palettes and type** in most videos; one or two font families.
- **Clean end cards** in 5 of 7 promos.

So the agents get the story shape right when told to. What they miss is the craft a viewer feels
but can't name: size, contrast, timing, edges, empty frames, flat pace.

### What this means for the first rules

Ranked by how often they showed up and how cleanly they can be measured:

1. **Text too small** (9/14): measure rendered text height relative to frame height.
2. **Text contrast on the real background** (6/14): WCAG on rendered frames.
3. **Empty or black frames**, especially in the first 3 seconds (5/14): frame variance near zero.
4. **Flat pace** (4/14): change per second from frame differences; flag long low-change stretches.
5. **Content crossing the frame edge / safe area** (4/14, 2/2 vertical): bounding boxes of
   elements against the frame and platform safe zones.
6. **Text visible during a transition** (4/14): text appearing or changing while the frame
   difference is high.
7. **Reading time**, counted from when text finishes appearing (3/14 clear cases; needs dense
   sampling to measure the rest).
8. **No call to action at the end** of a promo (2/7).

Not seen in stills, to test with motion: easing, twinning (identical simultaneous moves),
accents off the music beat.

### Dense sampling: 7 promos, a frame every 0.25 s

Per frame: how much changed since the previous one (mean pixel difference) and how flat the frame
is (pixel spread; near zero = blank or single color). A "hold" is ≥0.75 s with almost no change.

| Video | Length | Time spent changing | Holds ≥0.75 s | Longest hold | Blank stretches ≥0.5 s |
|---|---|---|---|---|---|
| Cinematic intro | 6 s | **92%** | **0** | 0 s | none |
| Disc Depot promo | 17 s | **90%** | 1 (the black end) | 0.8 s | 16.0–17.0 (end) |
| OpenClawd launch | 37 s | 61% | 8 | 2.2 s | **6** (3.5, 8.5, 14.0, 18.2, 23.0, 27.0 s: a dip to black between every scene) |
| Remotion kinetic | 20 s | 61% | 5 | 2.2 s | 2 (10.8, 15.2 s) |
| Cursor announcement | 20 s | 52% | 3 | 2.8 s | none |
| VVTerm promo | 20 s | 44% | 7 | 2.2 s | 1 (1.2 s) |
| Presscut demo | 84 s | **27%** | 18 | **7.0 s** | none |

What it shows:

- **Two videos never stop moving.** The cinematic intro holds for zero frames in 6 s, so its bio
  text never rests; Disc Depot's only hold is its black last second, so no line of text ever sits
  still. Shaw's hero-frame rule and the reading-time rule both fail, and both are measurable
  without reading the text: no hold after text appears = not readable.
- **Presscut is the opposite problem:** changing only 27% of the time, with static holds up to
  7 s. Fine for reading, flat for pace. A pace rule needs both ends: never holding, and holding too
  long.
- **OpenClawd dips to black between every scene** (6 times in 37 s). Each dip is short, but six
  near-black frames in a dark video read as stalls; the first one lands at 3.5 s, inside the hook.
- **VVTerm has the rhythm the books describe:** holds of 1.2–2.2 s alternating with ~1 s of
  motion, hero then transition, every time. It's the one to use as a "must not flag" fixture.
- **Reading time can be estimated from holds.** VVTerm's "Native SSH client / for iPhone, iPad,
  and Mac" (about 45 characters) needs about 2.6 s at Netflix's 17 characters a second; its hold is
  about 1.3 s. Presscut's captions (about 80 characters, needing about 4.7 s) get 5–7 s holds.

Limits: a hold is measured on the whole frame, so a drifting background can hide a text hold, and
the sampling step is 0.25 s. A real rule would read text positions from the source and measure
holds on the text's own area.

### First-hand write-ups from people who made these videos

Four accounts of making a video with Claude Code or Codex and Remotion:

- **The agent declares done without looking.** One log shows the agent writing files, starting the
  dev server and reporting "project complete", with no render and no visual check.
- **The agent grades its own taste.** Another ran "keep looping until you think it's good enough":
  dozens of self-critique cycles ("spacing is too tight", "stagger delay should be 15 frames, not
  10"), with the final judgment left to the same model.
- **Real defects, fixed by hand** (Codex, the most detailed account): an element that "shot off the
  right edge of the screen"; a background that "looked like spaghetti" (too fast, too much
  contrast, took 4 prompts); "f" and "i" kerned too tight and a word sitting 4 px low; a logo spring
  that "feels too snappy"; a render with no audio track; invented asset paths when prompts were
  vague. First usable cut: 41 minutes.
- **A vendor's review checklist** names the same things we found: "each scene stays on screen long
  enough to read", "no text crosses the safe margins", clipped text, blank renders.

**What this adds:** the gap isn't only the rules. It's that nothing outside the agent checks the
rendered result before it says "done". That is exactly Attentry's position for code.

### Outside the gallery: 18 sample videos from 18 GitHub repos

Searched GitHub for Remotion projects made with Claude Code or Codex (157 repos, mostly video
"skills"), pulled every README, and took the sample videos the skill authors show off. Same
method: 4 frames a second with ffmpeg, contact sheets, the same pace measures.

Caveat: these are showcases too. A skill author puts their best output in the README, so these
are better than average, and noticeably more polished than the gallery's effect demos.

What still recurred in the 15 reviewed so far:

- **Tiny text inside product screenshots**, the single most common problem again: CodeStripper
  (about 25 s of browser and code pages too small to read), Showpilot (about 25 s of GitHub code
  pages), Pocket Habits, GhostCommits, Supabase, CrewDash cards. **8 of 15.**
- **Text sliding across the frame edge mid-transition**: Neon Dodge ("teer. Swipe to / lash."),
  MarkPress ("SHA" cut off, "Mark|ARE" split by a wipe). 2 of 15.
- **Low-contrast secondary text** on dark backgrounds: GhostCommits ("Build in public." and
  "Rewarded in shielded Zcash." in grey on black), CodeStripper, Klaq's small labels. 3 of 15.
- **The product shown too small in the frame**: Showpilot's app occupies about a third of the
  frame for its first 20 s. 1 of 15.
- **3–4 font families in one video** (oneshot trailer: pixel, mono, sans, serif). 1 of 15.
- **No call to action or link at the end**: Kiteva (logo only). 1 of 15.
- **Very long**: Showpilot runs 94 s, Presscut-like.

What these do better than the gallery: nearly all open on the problem in big type ("140
timesheets. Payroll's at 5.", "Engineers don't read tutorials for the prose."), hold their
headlines, and end on a clear call to action. Story shape is solved when the skill teaches it.
Small text and contrast are not, even in the best examples.

### AI-made vs. professional: the same measures on both

Reference set: 15 official launch videos (Cursor, Notion, Vercel, Coinbase, Linear, Readwise,
ElevenLabs, Granola, Replit, Cash App, Claude, Krea) from the "awesome-ai-clonable-launch-videos"
collection, which commits the original MP4s. Compared with the 15 AI-made skill videos (the
generated live-action trailer left out). Medians:

| Measure | AI-made (15) | Pro (15) |
|---|---|---|
| Length | 30 s | 30 s |
| Time spent changing | 73% | 62% |
| **Holds (≥0.75 s still) per 10 s** | **1.0** | **2.0** |
| Longest unbroken motion | 7.2 s | 4.0 s |
| **Hard cuts per minute** | **17** | **4** |
| **Brightness (0–255)** | **50 (dark)** | **238 (light)** |
| Videos that never hold | 1 | 0 |
| Blank frames in the first 3 s | 1 | 0 |

What it shows:

1. **Pros hold twice as often.** They stop on each message, then move. AI videos keep moving
   (73% of the time, unbroken runs nearly twice as long). The "text never holds" rule has a real
   baseline now: pros give about 2 holds every 10 s; a video far below that, with text on screen,
   is the one to flag.
2. **AI defaults to dark.** Median brightness 50 vs 238. Nearly every AI video is a dark theme
   with glow; nearly every pro video is light. Dark backgrounds with grey secondary text are
   exactly where the contrast failures came from. This is the video version of the "purple
   gradient" UI tell.
3. **AI cuts four times as often** (17 vs 4 a minute). Pros move between scenes with continuous
   motion instead of hard cuts.
4. **Range matters.** Some pros are fast too (Krea: 64 cuts a minute; Granola and Linear barely
   hold). Thresholds must be loose and judged together, never one number.

From the pro sheets (Notion, Claude, Cursor):

- **Pros zoom in on the part of the UI that matters** (the prompt box fills the frame) or redraw it
  as a simple diagram (Claude), with one large caption per scene, always in the same place.
  Product screenshots with tiny text still appear (Cursor), but only as texture behind a large,
  readable caption. So the small-text rule should ask: is the text meant to be read, and is there
  a readable line that carries the message?
- **Pros often end on the logo alone** (Cursor, Notion). The end-card rule must stay a suggestion,
  aimed at promos asking for an install, not brand launches.

Limits: whole-frame measures can be fooled. Orbit (AI) scores "never holds" because its background
glow drifts while the headline sits still. A real rule measures holds on the text's own area from
the source.

### More complaints, from the people who make motion design

- **r/MotionDesign** (via a secondary summary): the top reaction to AI Claude animations calls them
  "just more social media BS"; another asks the mods to act because these posts are "literally the
  entire sub now"; on X, "pretty and useless", "SLOP motion" (generic, no storytelling).
- **Twinning, confirmed in practice:** one guide says Claude "often applies identical spring
  animations to every element, making videos look artificial", and recommends prompting for
  offsets. Williams's 4–6 frame stagger is the measurable version.
- **Auto-captions:** lines split "in arbitrary places, sometimes mid-word", fixed display times
  that "can be too short to read", and the bouncy word-by-word default that makes videos "look
  templated".
- **Slides and explainers:** text overload ("the clearest sign of an unedited AI deck"), icons and
  backgrounds that drift slide to slide; NotebookLM's early video overviews read "like a flat
  narrated slideshow".
- **Thumbnails:** YouTube itself acknowledges viewers are "increasingly tired" of AI thumbnails;
  click-optimized generators make them look alike.

---

## Part 2: what people complain about in AI-made visuals

Mostly blogs, vendor pages and surveys; the stronger sources are marked.

### AI video generators (Sora, Veo, Runway, Kling)
- Hands with the wrong number of fingers (one test: ~14% of clips), characters and props that drift
  between shots, coherence that falls apart past ~20–30 s, physics and reflections that don't track,
  and small text that can't be rendered reliably; guides say add text in post.

### Motion graphics and explainers
- **Uniform pacing** "produces either rushed or boring results"; pacing should follow how dense
  each section is (practitioner guide).
- Flair over clarity: explainers treated like brand videos; generic hook frames, topic banners,
  data callouts and end cards across seven AI video tools tested (AutoAE, a competitor, so weigh it).
- "Most AI animations fail because they operate within open-ended systems lacking scene structure,
  timing control, and reusable systems."

### Posters and graphic design
- **Typography is the main tell**: warped letters, invented words, bad kerning; "everything one size
  in one generic sans-serif"; type too crowded and unfocused (Hacker News, designer guides).
- **Overloaded layouts**: "information dense, populated with lots of copy and icons", optimized to
  fit everything the prompt contained rather than to suit the eye (Fast Company).
- **Effects pile up**: glows, flares, smoke, sparks and oversized type "fight for dominance, leaving
  no visual resting point".
- **The default look** comes from unspecified prompts: the model falls back on the statistical
  middle.

### Illustration
- A glossy, too-perfect, "a little plastic" finish; "cinematic lighting" everywhere; elements placed
  without compositional purpose; garbled lettering and fake signatures. Hands are now mostly fixed.
  Tells are unreliable on their own; beginners make some of the same marks.

### UI and websites ("AI slop")
- The signature: Inter, an indigo-to-purple gradient (Tailwind's default indigo), three rounded
  cards in a row, a hero that fits any product. The newer "tasteful default" (cream, serif, sage) is
  already its own tell.

### Logos
- Generic and interchangeable; raster files instead of vectors; hard to trademark; no brand
  strategy. Fine for brainstorming only.

### Ads, avatars and short-form
- **Ads:** NielsenIQ (via secondary coverage) finds AI ads more "annoying, boring and confusing";
  Coca-Cola's 2025 AI holiday ad drew mockery (Ole Miss study, *Journal of Interactive Advertising*,
  Aug 2026, attributes part of it to the uncanny valley). **Field experiment (NYU/Emory, 2025):**
  labeling an ad as AI cut clicks by ~31%, though unlabeled AI ads had beaten human ones by 19%.
  Harris Poll UK: 7 in 10 trust human-made ads, 2 in 10 fully AI ones.
- **Avatars:** lip-sync that drifts on product names and numbers, faces that warp; one handbook
  reports a large click-through drop from a 0.2 s sync delay (anecdotal).
- **Short-form:** Kapwing found ~21% of the first 500 Shorts served to a new account were pure AI
  slop; YouTube removed 16 large AI channels in January 2026.

### The pattern across every medium

1. **Defaults instead of decisions**: the same font, gradient, layout and effects because nobody
   specified otherwise.
2. **Everything at once**: too much text, too many effects, no single focal point, no resting point.
3. **Typography and small text** are the most reliable tell in every visual medium.
4. **Uniform pace** in anything that moves.
5. **Viewers punish what they notice**: trust and clicks drop once something reads as AI.

**For Attentry Design:** points 2, 3 and 4 are measurable and match what the hand review found
(small text, contrast, flat pace, clutter). Point 1 is checkable against the project's own palette
and fonts. The copy can say it plainly: "checks the craft AI videos get wrong: text you can't read,
contrast, empty frames, flat pacing, things off the edge."

---

## Status and next steps

Done: all 25 gallery videos reviewed; 7 promos densely sampled; 4 first-hand write-ups read.

**Proposed first rules** (ranked by how often they showed up × how cleanly they measure):

1. **Text too small** (~17/25).
2. **Text contrast on the rendered frame** (~9/25).
3. **Blank or near-black frames**, above all in the first 3 s and at the end (8/25; 6 dips in one
   video).
4. **Text never holds**: text on screen with no still moment long enough to read it (2 of 7 promos
   never held at all; VVTerm's subtitle held half its reading time).
5. **Pace out of range**: never holding, or holding the same static frame too long (6/25).
6. **Content off the frame edge / platform safe zones** (4/25; 2/2 vertical).
7. **Text changing during a transition** (4/25).
8. **No call to action at the end** of a promo (2/7).

Fixtures that must not be flagged: VVTerm (rhythm), Presscut's captions (reading time), the
subscribe overlay (an asset, no story needed).

Outside the gallery (done): 16 AI-made skill videos from 16 repos and 15 professional launch
videos, measured the same way. The proposed rules held up, with three calibrations: holds judged
against the pro baseline (~2 per 10 s), small text judged on whether a readable line carries the
message, and the end card kept as a suggestion for promos only. One more candidate: **dark theme
with grey secondary text**, the most common source of contrast failures (AI median brightness 50
vs pro 238).

Next: agree the first rules with the user.

## Sources

- Remotion prompt gallery: https://www.remotion.dev/prompts
- AI video generators: https://www.lovart.ai/blog/ai-video-models-compared-2026 ;
  https://masterai.blog/blog/ai-video-generation-guide ;
  https://designcopy.net/en/sora-2-vs-veo-3-vs-runway-gen4-ai-video-seo-2026/
- Motion graphics: https://www.capcut.com/create/ai-video-generation-explainer-content-pacing-metaphors ;
  https://autoae.online/blog/ai-video-agents-motion-graphics-problem-2026 ;
  https://recapio.com/digest/why-most-ai-animation-looks-generic-and-how-to-fix-it-with-gemini-3-1-claude-code-by-andy-lo
- Posters: https://news.ycombinator.com/item?id=49764791 ;
  https://www.fastcompany.com/91599914/ai-ruined-posters-this-human-designer-is-fixing-them ;
  https://gabosmedia.substack.com/p/why-ai-posters-all-look-the-same ;
  https://mikareyes.com/ai/how-to-fix-ai-looking-graphic-design-and-posters
- Illustration: https://help.vgen.co/hc/en-us/articles/31672648933399 ; https://isitai.com/blog/how-to-spot-ai-art
- UI: https://prg.sh/ramblings/Why-Your-AI-Keeps-Building-the-Same-Purple-Gradient-Website ;
  https://dev.to/alanwest/why-every-ai-built-website-looks-the-same-blame-tailwinds-indigo-500-3h2p ;
  https://www.925studios.co/blog/ai-slop-design-tells
- Logos: https://dev.to/techresolve/solved-please-stop-recommending-chatgpt-for-logo-design-5beg ;
  https://finnandgray.com/ai-logo-generators/
- Ads and trust: https://olemiss.edu/news/2026/08/ole-miss-study-explores-why-some-ai-ads-fail-while-others-succeed/index.html ;
  https://getcoai.com/news/nielsen-consumers-find-ai-generated-advertising-annoying-boring-and-confusing ;
  https://the-decoder.com/telling-consumers-an-ad-is-ai-generated-cuts-clicks-by-31-percent-study-finds/ ;
  https://www.theharrispoll.co.uk/insights/blog/the-authenticity-trade-off-how-ai-is-reshaping-trust-in-advertisingnbsp
- Avatars: https://blog.hubspot.com/marketing/ai-ugc-creators ; https://www.airbridge.io/en/resources/handbook/ugc/07-ai-generated-ugc
- Short-form: https://www.searchenginejournal.com/youtubes-ai-slop-problem-and-how-marketers-can-compete/ ;
  https://tubefilter.com/2026/01/29/youtube-ai-slop-channel-crackdown-bans/
