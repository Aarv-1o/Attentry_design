# Attentry Design: notes from the books

What each book gives that a rule could measure, with page references. Short quotes only, and no
book text beyond them. Started 2026-11-19; copy and illustration books added 2026-11-24.

Legend: **Rule idea** = could become a check. **Context** = shapes how a rule is worded or scoped,
but isn't a check itself.

---

## Walter Murch, *In the Blink of an Eye* (2nd ed.)

- **The Rule of Six, confirmed** (pp. 18–20): emotion 51%, story 23%, rhythm 10%, eye-trace 7%,
  the 2D plane of the screen 5%, 3D space of action 4%. He calls the numbers "slightly
  tongue-in-cheek, but not completely". Priority order: never give up a higher item for a lower one.
  *Context:* Attentry Design can only measure the bottom four (rhythm, eye-trace, plane, space).
  The store copy and every finding must say it checks craft, not whether the video moves people.
- **Higher items hide lower problems, not the reverse** (p. 19): "satisfying the criteria of items
  higher on the list tends to obscure problems with items lower on the list". *Context:* findings
  on the lower rungs are suggestions, never blockers.
- **Cut rate** (p. 69): "a convincing action sequence might have around twenty-five cuts a minute,
  whereas a dialogue scene would still feel 'normal' … averaging six cuts per minute or less."
  Real blinking runs 4 to 40 a minute. **Rule idea:** shot length out of range for the kind of
  scene, e.g. a calm explainer cutting at action pace, or a 20-second shot with nothing changing.
  Bands: about 2.4 s per shot (action) to 10 s or more (dialogue).
- **Over-cutting** (p. 16): an editor who "changes shots too frequently, is like a tour guide who
  can't stop pointing things out". Supports a "too many cuts" finding as much as a "still shot" one.
- **Miniature vs. mural** (pp. 22, ~150): the editor judges a small image that plays big; the
  reverse is true for phones. *Context:* for vertical video, text and subject size should be judged
  at phone size, which backs the "too small for a phone" rule.

## Bruce Block, *The Visual Story* (3rd ed.)

- **Seven components** (ch. 1): space, line, shape, tone, color, movement, rhythm.
- **The Principle of Contrast & Affinity** (ch. 2): "The greater the contrast in a visual
  component, the more the visual intensity of the picture increases. The greater the affinity …
  the more the visual intensity … decreases." It applies within a shot, shot to shot, and sequence
  to sequence. *Context:* the backbone of an intensity measure.
- **Tone has a measurable threshold** (ch. 5): affinity needs the tonal range squeezed into about a
  third of the gray scale; "Limiting the tonal range to the upper or lower half of the gray scale
  doesn't create enough tonal affinity for the audience to notice." Maximum contrast is black and
  white. **Rule idea:** per shot, measure the luminance range of rendered frames. A shot meant to
  be calm that spans the whole scale, or a reveal that sits in one third, is flagged.
- **Color: hue, brightness, saturation** (ch. 6). Saturated yellow is the brightest hue and
  "will always attract the viewer's eye first"; saturated blue is always dark. Contrast of
  saturation "can be used to emphasize objects". **Rule idea:** the most saturated, brightest
  element in the end card should be the call to action; flag when a decoration outshines it.
- **Complementary colors raise each other's saturation** (ch. 6, from Albers): a small accent on
  its complement looks stronger. *Context:* for the accent rule, measure the accent against its
  real background, not as a flat value.
- **Line and movement** (ch. 4, 7, 9): horizontal is the least intense, diagonal more, and
  horizontal against vertical across a cut the most. *Context:* motion direction could feed the
  intensity measure later.
- **Story intensity graph** (ch. 9): exposition at zero, conflict rising, climax at 100,
  resolution back to zero. "As the story conflict intensifies, the visual structure can also
  intensify … The Principle of Contrast & Affinity can create a visual climax that supports the
  intensity of the story climax." Graphing edited work "can uncover errors". **Rule idea:** compute
  visual intensity per second (tone range, saturation contrast, motion, cut rate) and flag (a) a
  flat curve, and (b) the peak landing away from the reveal or the call to action.
- **Visual rules are set in the exposition** (ch. 9): the opening teaches the audience what each
  color and component means; breaking it later must be deliberate. **Rule idea:** a color or font
  that first appears late, outside the palette set in the first scenes, is flagged.
- **Advertising** (ch. 9): in short promos "the visuals become the content", so the structure
  matters more, not less. *Context:* backs focusing on short product videos first.

## Gustavo Mercado, *The Filmmaker's Eye*

- **Rule of thirds** (ch. 1): the cross points of the thirds are the "sweet spots" for important
  elements; the lines guide horizons. **Rule idea:** the main subject or headline of a shot sits
  dead center or jammed in a corner for its whole duration. A suggestion only: centered can be a
  choice.
- **Looking and walking room** (ch. 1): a subject facing or moving right goes on the left third,
  and vice versa; "if looking room is not added … the composition will feel static". **Rule
  idea:** an element animating toward the frame edge it's already near (entering with no room).
- **Headroom scales with shot size** (ch. 1): close-ups crop the top of the head, long shots need
  "a sizable amount" above. *Context:* only for footage with people; low priority for Remotion.
- **Hitchcock's rule** (ch. 1): "the size of an object in the frame should be directly related to
  its importance in the story at that moment." **Rule idea:** in each scene, the element the
  scene is about (the claim, the product, the call to action) should be the largest or most
  prominent; flag when a secondary label is bigger.
- **Visual weight** (ch. 1): "The size, color, brightness, and placement of an object" set its
  weight; balanced frames feel ordered, unbalanced ones uneasy, and neither is wrong in itself.
  *Context:* the weight formula (size × brightness × saturation, by position) is what an
  intensity or balance measure would compute.
- **Aspect ratio** (ch. 1): know the delivery ratio so the composition survives it. **Rule idea:**
  a 16:9 composition rendered as 9:16 (or cropped by a platform) puts key elements outside the
  frame or the safe area.

## Robin Williams, *The Non-Designer's Design Book* (2nd ed.)

The four principles each end with a "what to avoid" list; most of it can be measured on a frame.

- **Proximity** (summary, p. ~32): squint and count where the eye stops; "If there are more than
  three to five items on the page … see which … can be grouped". Avoid "equal amounts of white
  space between elements unless each group is part of a subset", and things "in the corners and in
  the middle". **Rule idea:** more than 5 separate groups on screen at once; unrelated items
  closer together than related ones.
- **Alignment** (summary, p. 48): "Nothing should be placed on the page arbitrarily. Every element
  should have some visual connection with another." Avoid "more than one text alignment on the
  page"; choose centered "consciously, not by default". **Rule idea:** text blocks in one frame
  with mixed alignments, or edges that miss each other by a few pixels (near-misses read as
  mistakes).
- **Repetition** (summary): consistency ties parts together, but too much of an accent
  overwhelms; the red-accessories example. **Rule idea:** the same element type styled
  differently across scenes (two title sizes, two button styles); an accent color covering much of
  the frame stops being an accent.
- **Contrast** (summary, p. ~65): "If two items are not exactly the same, then make them
  different. Really different." "You cannot contrast 12-point type with 14-point type … dark
  brown with black." Similar-but-different is "conflict". **Rule idea:** two text sizes in a frame
  within about 1.2× of each other, two fonts that are near-alike, or two near-identical colors
  used as different roles.

## Robert Bringhurst, *The Elements of Typographic Style*

- **Measure** (2.1.2): 45–75 characters for continuous reading, 66 ideal; 40–50 for columns.
  *Context:* video text is read in glances, so the subtitle limits (about 42 per line) apply
  instead; Bringhurst's upper bound still caps any paragraph shown on screen.
- **Letterspace capitals** (2.1.6): strings of capitals need 5–10% of the type size in tracking,
  more in titles. **Rule idea:** an all-caps line with zero or negative letter-spacing.
- **Use a scale** (3.1.1): "Don't compose without a scale"; limit yourself "to a modest set of
  distinct and related intervals". **Rule idea:** more than about 4 distinct text sizes in a
  video, or sizes that fit no common ratio.
- **Change one parameter at a time** (3.5.1): for emphasis, try weight or size or case, not all at
  once; "the weight should decrease slightly, not increase, as the size increases." *Context:* a
  nuance on Williams: contrast must be clear, but stacking bold + italic + caps + size is clutter.
- **Don't clutter the foreground** (3.5.2). *Context:* supports the "one thing leads" rule.

## Jeff Bellantoni & Matt Woolman, *Type in Motion*

Mostly a showcase of title sequences, with few stated rules. One distinction matters:

- **Montage vs. collage** (introduction): in a montage, letterforms serve "both a verbal and visual
  function" and are meant to be read; in a collage, "letterforms are not always intended to be read
  but most always serve as components to a visually arresting typographic texture." *Context:*
  reading-time and size rules must apply only to text meant to be read. Decorative text texture
  needs a way out (a marker or a role), or the text rules will raise false alarms.
- **Style without content** (Precedents): effects "mimicked and ultimately rendered a mere style by
  designers who respond to the formal qualities without considering the content". *Context:* a
  fair description of AI-made motion graphics; useful for the problem statement.

## Frank Thomas & Ollie Johnston, *The Illusion of Life*

- **Slow in and slow out** (ch. 3): spacing drawings close to the poses gives "a very spirited
  result"; but "Too much of this gave a mechanical feel to the action". **Rule idea:** position or
  scale animated with no easing (a linear jolt). Second, softer idea: every move in the video using
  the identical curve and duration reads as mechanical.
- **Arcs** (ch. 3): living movement "will describe an arc of some kind"; straight in-and-out moves
  look mechanical, except hits and throws. *Context:* low priority for UI-style motion graphics;
  relevant to characters and mascots.
- **Timing chart** (ch. 3): the same two poses mean different things by the number of in-betweens:
  none reads as being hit by a tremendous force; 1–2 as hit by a brick; around 4–5 as a crisp
  order; 9–10 as appraising, "considering thoughtfully". On twos at 24 fps each in-between is about
  83 ms. *Context:* gives duration bands: under ~150 ms reads as a jolt, ~300–500 ms as a crisp
  move, ~800 ms+ as calm. Fits Material's 300 ms / 650 ms guidance.
- **Changes during a big move go unseen** (ch. 3, Secondary Action): "A change in the middle of a
  major move will go unnoticed, and any value intended will be lost." The change "must come
  before the move, or after". **Rule idea:** text that appears or changes while the scene is in a
  large transition or camera move; it will be missed. Strong, measurable, and common in AI output.
- **Staging** (ch. 3): present one idea at a time, unmistakably. *Context:* backs "one thing
  leads the motion".

## Alexis Van Hurkman, *Color Correction Handbook* (2nd ed.)

The file is the publisher's 151-page preview, not the book: the front matter, chapter 4 (color
balance and curves, about pp. 150–260) and the index. The sections that matter for motion graphics,
"Video Signal Standards and Limits" (pp. 552–559) and "Creating Graphics and Animation with Legal
Values" (pp. 584–585), aren't in it. Not needed: ITU-R BT.709 and EBU R103 (free) give the same
legal-range numbers. Until then, ITU-R BT.709
covers the legal-range numbers.

## Donald Miller, *Building a StoryBrand 2.0*

- **The SB7 story** (ch. 3): "A character who wants something encounters a problem … a guide
  steps into their lives, gives them a plan, and calls them to action. That action helps them avoid
  failure and experience a success." The customer is the hero, the brand the guide.
- **The problem is the hook** (ch. 5): "Until our hero has a problem, the story fails to gain
  traction". **Rule idea (shape only):** a product video that never states a problem before the
  product appears. Can only be checked loosely from on-screen text.
- **The grunt test** (ch. 3): within five seconds, a viewer must be able to answer "What do you
  offer? How will it make my life better? What do I need to do to buy it?" **Rule idea:** the first
  5 seconds show the product name or offer; the last seconds show a call to action.
- **Plans have 3 to 6 steps** (ch. 7): "at least three and no more than six … Having more than four
  steps may actually add to, rather than reduce, confusion." **Rule idea:** an on-screen step list
  longer than 6 (4 preferred).

## Nancy Duarte, *Resonate*

- **What is vs. what could be** (ch. 2): the shape moves between the current state and the better
  one; "Without first setting up what is, the dramatic effect of your new idea will be lost."
- **Two turning points** (ch. 2): the call to adventure (the gap) and the call to action, then
  "the new bliss". *Context:* the same shape as Block's graph and Miller's SB7; three books agree
  on: problem first, then the idea, then a clear call to action at the end.
- **Sparkline** (ch. 2): the talk graphed as it alternates between what is and what could be, a
  term from Tufte. *Context:* the same kind of graph as Block's intensity curve.

## Karen Pearlman, *Cutting Rhythms*

- **Three tools** (ch. 3): timing (which frame, how long, where the shot goes), pacing, and
  trajectory phrasing (how the energy and direction of movement carry across a cut).
- **Pace is cuts plus change** (ch. 3): pacing is "the rate of cutting, the rate or concentration
  of movement or change in shots and sequences, and the rate of movement or events over the course
  of the whole film." Her example: splitting four events in one 10-second shot into four 3-second
  shots cuts faster but paces slower. **Rule idea:** measure pace as visual change per second
  (frame difference plus cuts), not cut rate alone; flag long stretches with almost no change, and
  a pace that never varies.
- **Neutral tempo** (ch. 3, from Grove): musical tempo is tied to a resting heartbeat, 60–80 beats a
  minute; faster or slower reads as "fast" or "slow". "Making one cut in 10 seconds is not a 'fast'
  rate of cutting in contemporary cinema." *Context:* a beat of about 0.75–1 s is the neutral
  reference for pace bands.
- **Tension and release** (ch. 4): tension is "a combination of … timing, energy, and release of
  information", built and released in cycles. *Context:* the same curve as Block and Duarte.

## Steven D. Katz, *Film Directing Shot by Shot*

- **The line of action / 180-degree rule** (ch. 6): it "organizes camera angles to preserve
  consistent screen direction and space." The camera crosses only with a new line of sight or a
  re-establishing shot. **Rule idea (motion graphics version):** consistent screen direction: an
  element or transition that moves right in one scene and the matching one moving left in the next,
  with nothing to explain it. Readable from the source (the sign of translateX in transitions).
- **Storyboards** (ch. 1–3): the storyboard is "the private record of the visualization process";
  its limit is that it can't show motion. *Context:* backs `check_storyboard`, a check on the plan
  before animating.

## Josef Müller-Brockmann, *Grid Systems in Graphic Design*

- **Line length** (type area chapter): "there should be 7 words per line for a text of any length",
  7–10 at most. *Context:* agrees with Bringhurst's 45–75 characters; for video, the subtitle limit
  stays tighter.
- **Margins** (margins chapter): "Margins of the same size can never result in an interesting page
  design; they always create an impression of indecision"; a type area placed too high seems to take
  flight, too low seems to fall out. **Rule idea:** a text block optically off its intended
  position (too close to the top or bottom edge for its size).
- **The grid as control** (throughout): elements sit on shared columns and fields across every
  page. **Rule idea:** across scenes, titles and recurring elements jump between unrelated
  positions instead of returning to the same grid lines.

## Josef Albers, *Interaction of Color*

- **"Color is the most relative medium in art"** (ch. I): the same color looks different by what
  surrounds it. *Context:* contrast must be measured on the rendered frame, against the real
  background, never from the color values in the source alone.
- **Vibrating boundaries** (ch. XXII): two contrasting, saturated colors of similar lightness side
  by side make the edge vibrate. **Rule idea:** text in a saturated hue on a saturated
  complementary background (red on green or blue) even when the contrast ratio passes; the finding
  explains why it's hard to read.
- **Equal light intensity** (ch. XXIII): two different hues of "equal or near-equal light
  intensity" lose their edges, "a smooth merging". *Context:* why luminance contrast, not hue
  difference, decides readability: backs the WCAG check.

## Patti Bellantoni, *If It's Purple, Someone's Gonna Die*

- What each color tends to make audiences feel, chapter by color (red, yellow, blue, orange, green,
  purple), from film examples. *Context only:* meaning depends on the story and can't be measured.
  Agrees with Block that a color's meaning is set early and then held.

## *Typography: Practical Considerations and Design Patterns* (Smashing Magazine, 2014)

- Web body text, from a 2013 survey: line height about 1.46–1.5 × the font size; headline about 2.5 ×
  the body size; paragraph spacing about 1.39 × the line height. *Context:* for multi-line text on
  screen. **Rule idea:** multi-line text with line height under about 1.1 (lines nearly touching).
  The book is web-focused and from 2014, so its sizes in pixels don't carry over to video.

## Richard Williams, *The Animator's Survival Kit* (expanded ed.)

- **Timing vs. spacing** ("It's all in the timing and the spacing"): timing is where the hits and
  accents land; spacing is how far apart the positions are. Same timing, different spacing, "very
  different movement". *Context:* an easing rule reads spacing (the curve), a duration rule reads
  timing; they're separate checks.
- **Ease in and out** (same chapter): "snap out" of one pose and "cushion in" to the next; more
  in-betweens and slower ease for relaxed actions. Backs the no-easing rule.
- **Sync to a beat** (Picture and Sound Sync): "Rule of thumb #1: have the visual accent position
  occur 2 frames ahead of the actual sound". **Rule idea:** with a music track, find the beats
  (audio onsets) and check that cuts and hits land on the beat or up to 2 frames before; flag
  accents that land after it.
- **Twinning** (Symmetry or 'Twinning'): "people say avoid twinning, where both arms and hands are
  doing the same thing"; "a way to take the curse off twinning is just to delay one of the hands or
  arms by 4 or 6 frames". **Rule idea:** several elements starting the same move on the same frame
  with the same curve (a list where every item flies in at once). Suggest a stagger of 4–6 frames
  (about 130–200 ms at 30 fps). Very common in AI-made Remotion videos.
- **Uneven frame steps look jerky** (Ken Harris section): action jumping between 2, 3 and 4 frames
  gave "a jerky stop-start result". *Context:* Remotion renders every frame, so this only matters
  for stepped or "on twos" effects.

## Austin Shaw, *Design for Motion*

- **Hero frames and transitions** (ch. 10): hero frames "require strong compositions and clear
  focal points"; "the relative speed of a piece will slow down during hero moments, so the viewer
  can process the scene", while transitions "are typically much faster". **Rule idea:** the key
  moments (claim, product, call to action) get a hold long enough to read; everything between can
  move fast. Flag a hero frame that is itself still moving or shorter than its reading time.
- **One or two typefaces** (ch. 4): "Typography should be limited to no more than a couple of
  typefaces. Ideally, work with a single typeface and vary the weight and point size". **Rule
  idea:** more than 2 font families in a video.
- **Negative space** (ch. 4, 9): "Always leave a healthy amount of visual space on all of the
  edges"; "When an image contains too many elements, it will appear to flatten out." Backs the
  clutter and edge-margin rules.
- **Style frames set a visual pattern** (ch. 2): palette, type, texture defined before motion, so
  "every element in the frame … belongs together"; skipping this shows: "transitions are not
  considered; and the motion is weak." *Context:* the project's palette and fonts are the reference
  for the off-palette and off-font rules; a storyboard check fits before animating.

## Liz Blazer, *Animated Storytelling* (2nd ed.)

- **Limit the palette** (ch. 5): "movement and the passage of time create the need for a continuous
  and clear focal point"; "Too much color variety in a shot confuses the eye". **Rule idea:** more
  distinct colors in a shot than the palette allows (count clustered hues in rendered frames).
- **Saturation means "look here"** (ch. 5): "By saturating a color, you are telling the audience,
  'look here, it's important!'"; "Rely on saturation too often and the eye will tire out". **Rule
  idea:** saturated area covering much of the frame for long stretches; agrees with Block's
  emphasis rule.
- **Support, don't upstage the subject** (ch. 5). Backs Hitchcock's rule from Mercado.
- **Three acts, and restraint with sound effects** (ch. 2, 7). *Context:* the same story shape as
  Block, Miller and Duarte.

---

## What the books change in the plan

1. **Confirmed with page references:** Murch's percentages and cut rates (25 a minute for action,
   6 for dialogue); Block's tonal-affinity threshold (a third of the gray scale); Williams's
   3-to-5 groups and the 12-vs-14 pt contrast example; Bringhurst's 45–75 characters and 5–10%
   caps tracking; Miller's 5-second test and 3–6 steps.
2. **New rule ideas** not in the first list of 10: identical moves starting on the same frame,
   stagger 4–6 frames (Williams); accents landing after the music beat (Williams); hero moments with
   no hold (Shaw); more than 2 font families (Shaw); too many colors or too much saturation
   (Blazer); pace measured as change per second, not just
   cuts (Pearlman); screen direction that flips between scenes (Katz); recurring elements that
   don't keep to a grid (Müller-Brockmann); vibrating saturated color pairs (Albers); text that changes during a big move
   (Thomas & Johnston); weak contrast between sizes or fonts (Williams); mixed text alignments and
   near-miss edges (Williams); too many text sizes (Bringhurst); caps without tracking
   (Bringhurst); the most prominent element isn't the subject (Mercado, Hitchcock's rule); a flat
   intensity curve or a peak away from the reveal (Block).
3. **Scope limits:** emotion and story are 74% of Murch's list and can't be measured; text meant
   as texture must be exempt from reading rules (Bellantoni & Woolman); lower-rung findings stay
   suggestions (Murch).
4. **For Attentry itself:** Miller's grunt test applies to the store page today. In 5 seconds a
   visitor should see what it is, how it helps, and how to install. The current short description
   runs past the visible lines; see the 0.1.7 store-page draft.

---

## Direction books (read 2026-11-23)

The six books listed under "Direction: the director's eye" in attentry-design-books.md, for the
direction cards: what an element causes in a scene and how to show it. Legend as above, plus
**Card** = goes into a direction card (attentry-design-cards.md). Gurney, Yot and Mateu-Mestre are
scans: read through OCR, with the diagram pages looked at directly.

## Joseph Gilland, *Elemental Magic, Volume II* (waves, splashes, fire, explosions)

- **Animate energy, not things** (ch. 3, p. 125): "Always remember, you are animating energy
  patterns not things." Shapes "always radiate outward from the point of combustion, or in the case
  of a water splash, the point of impact" (ch. 4, p. 197). **Card:** every effect has a source point, and
  its pieces move away from it along the path of the energy that made it.
- **No repetition** (ch. 2, p. 45): "sets of waves don't come in identical sizes, or perfectly repeating
  time frames"; variation matters more the closer the camera. Fire and splash design: "a good
  silhouette, and the avoidance of too much symmetry or repetition" (ch. 4, p. 198). **Rule idea:** a
  particle or wave element that repeats with the same size and period (a loop the eye can count).
- **Displacement** (ch. 2, pp. 35–37): water always fills the space it's pushed out of; disturbances spread,
  cross and bounce off edges. **Card:** a still lake with something moving in it can't stay still.
- **A splash is two events** (ch. 3, pp. 70–110): the primary splash (crown or sheet thrown out)
  and the secondary splash (a jet up the middle as the air pocket the object punched fills in),
  after "a beat, or a pause of several frames, perhaps one half of a second" (p. 106). Which one dominates
  depends on the object: a small fast stone or a raindrop gives almost no primary and a clear jet;
  a flat rock or a belly-flop gives a big primary; a buoyant ball gives only a primary (no air
  pocket); a clean dive gives almost neither. Extra, smaller secondaries can follow. **Card:** the
  splash card, with the object table.
- **Sheets tear along the energy** (ch. 3, pp. 97–98): the splash wall gets holes that grow in
  number and size "within a mere 24 frames or one second", then becomes strings of droplets, then
  gravity takes over; the tearing "must also follow the directional path of the energy". **Card.**
- **Timing gives scale** (ch. 3, p. 121): "to give our animation scale and power, we must work with large
  drawings and move them much more slowly"; "the timing is crucial if we want the splash to have the
  correct scale". **Card + Rule idea:** a big wave or explosion that resolves as fast as a small one
  reads as a miniature.
- **Ripples are uneven** (ch. 3, p. 129): real ripples are "an incredibly complex array of
  overlapping and interacting concentric rings"; perfect concentric circles look fake. **Card.**
- **Fire is a fluid** (ch. 4, pp. 166–192): "fire dynamics are fluid dynamics"; fire is hot-air
  bubbles rising through cooler air, which pushes back. Animate it like a flag waving upward;
  unlike a flag its volume changes constantly and irregularly; pieces break off the tips and vanish
  "in two or three frames" (p. 237). Embers ride the same air currents as the smoke, erratically. Clean fuel
  (gas) burns blue with little smoke. **Card.**
- **Explosions** (ch. 5, pp. 248–273): the first frames look the same for any material (pure
  outward energy, no fluid shapes); then a rapid outward expansion followed by "an acute slowing
  down". In his example: one frame of shrinking (anticipation), frames 3–6 the violent burst, a
  one-frame flash (negative, then white), then the cloud expands slowly and fades while debris
  reaches its peak and falls, over 80+ frames. Smoke starts directional, then billows as the air
  takes over; "always some pieces that fly away much farther than all the rest". A second burst
  while the first slows adds energy. **Card + Rule idea:** an explosion with even speed throughout,
  or one whose debris all lands at once.

## Michele Bousquet, *Physics for Animators*

- **Gravity timing: the odd rule** (ch. 2, pp. 50–52): with constant acceleration the distance
  between frames grows 1, 3, 5, 7…; rising, it shrinks 7, 5, 3, 1. Gravity doesn't depend on size
  or weight; only air resistance makes wide light things (leaves, cloth) fall slower (ch. 3,
  p. 63). **Rule idea:** a fall at constant speed, or something heavy floating down.
- **Shadows tell distance** (ch. 4, pp. 124–128): a shadow is sharp only where the caster touches
  or nearly touches the receiver; the penumbra (soft edge) grows with the distance between them; the
  sun's penumbra is about 1% of the caster-to-shadow distance. A shrinking penumbra over frames
  says the object is getting closer to the surface. Occlusion shadows sit in cracks and under large
  objects even on overcast days with no cast shadows (p. 133). **Card:** shadows card.
- **Light falls off** (attenuation, p. 121) and **bounces** (p. 119): shadow areas are lit by light
  bounced off the ground, water and clouds; a bright color near a white surface tints it (diffuse
  interreflection, p. 142). **Card.**
- **Water reflects more at a low angle** (pp. 142, 286–289): water reflects only 2% of light
  head-on, much more at grazing angles; looking down you see into the water, looking across it you
  see the sky. Deep water is blue on a sunny day, blue-grey overcast, blue-black at night; shallow
  water is clear. The more disturbed the surface, the more distorted the reflection. **Card:**
  corrects "mirrors what's above it" in the water card (true only from a low angle).
- **Flames** (ch. 8, p. 250): color by temperature: red (coolest), orange-yellow, white, blue
  (hottest); hottest at the base and tip, red-orange-yellow inside. Flames are partly transparent.
  **Card.**
- **Smoke** (pp. 256–257): from one point it rises in a straight column, splits into roughly
  parallel lines, swirls, then turns chaotic, dissipates and stops rising; with wind, the same at an
  angle. Damp wood makes puffy smoke, dry wood thin tendrils; a bright fire at night can seem to
  have no smoke (the eye adjusts to the fire). **Card.**
- **Explosion timing** (p. 260): realistically over in about two frames, so animators use 24–30;
  a small blast's fireball burns out within a second but its cloud can stay 3–6 seconds (p. 255).
  After the blast front, air rushes back and debris is pulled toward the center (p. 261). Broken
  pieces fly roughly equal and opposite, mostly sideways, then fall as projectiles (p. 265). **Card.**
- **Rain** (p. 239): seen as long blurred streaks, not drops; visible because it reflects and
  refracts light, so grey-white streaks in daylight. **Card.**
- **God rays** (p. 230): parallel rays that seem to fan out from the sun through gaps in clouds;
  they need particles in the air. Clouds at different heights move at different speeds; their wispy
  edges change faster than the mass (p. 229). **Card.**
- **Drag and follow-through** (p. 218): soft parts (hair, cloth, antennae, a tail) trail the
  part they're attached to and settle after it stops. **Card.**
- **Scale** (ch. 5, p. 164): a small version of a creature with the big one's proportions and timing reads
  as a shrunken adult; size shows through timing and posture. **Context** for the scale point
  above.

## Francis Glebas, *Directing the Story*

- **Two jobs of a director** (ch. 7, p. 157): first direct the viewer's eye, then make what they
  see readable. "The viewer's eyes will focus on the area of greatest contrast in the shot" (p.
  180). **Rule idea:** the area of greatest contrast isn't the subject (agrees with Mercado,
  Hitchcock's rule).
- **Silhouettes** (p. 91): "You should be able to blacken in your drawings and still read what is
  happening." **Rule idea:** the subject's silhouette, filled black, doesn't read (merges with
  another shape or the frame edge).
- **Characteristic viewpoint** (p. 158): we identify things from their usual angle; beginners pick
  high angles because they're "dynamic", and lose readability. **Card:** stage a subject from the
  angle it's known by when the shot is about recognizing it.
- **Light over dark, dark over light** (p. 188): weave values; "tone down graphic noise by lowering
  the contrast. Punch up the contrast on where you want the" eye. **Card:** the text-in-scene card.
- **Depth killers** (ch. 8, p. 210): lines parallel to the frame flatten space; objects at the wrong
  size break size constancy; "shadows that are all black can create holes in a picture. Highlights
  that go all white can look pasted on top"; objects that don't share a horizon "feel like they
  don't belong in the same picture"; characters need breathing room in the direction they look.
  **Rule ideas:** crushed shadows and clipped highlights over large areas; a subject crammed
  against the edge it faces.
- **One idea at a time** (pp. 111, 210): use camera movement and framing to tell the story one idea at a
  time; telephoto for beauty shots, wide angle for dynamic movement. **Context.**
- **Attention** (p. 120): strong contrast attracts attention; changes that are too gradual go
  unnoticed. **Context** for the timing rules.

## Richard Yot, *Light for Visual Artists* (scan, read through OCR)

- **Every outdoor scene has two lights, often three** (ch. 1, pp. 12–13): the sun (small, hard,
  white, sharp shadows), the sky (huge, soft, blue) and light bounced off the ground. Shadows in
  sun are lit by the sky, so "the shadows in this photo have a strong blue cast" (p. 14). **Card:**
  the sun card names its fill.
- **"Nothing will make an image look more dead than grey shadows"** (ch. 5, p. 64): shadows are
  rarely black; they hold soft, muted, homogenized color from their fill (blue under open sky, green
  under foliage, p. 32). **Rule idea:** large neutral-grey or pure-black shadow areas in a daylight
  scene (agrees with Glebas's "holes").
- **Cast shadows are usually darker than form shadows** outdoors (p. 55): the shaded side of an
  object gets fill from the bright ground; the ground under it gets little from the small object.
  The terminator (where light turns to shadow) is the darkest, most saturated band. **Card.**
- **Occlusion and base shadows** (pp. 56–57): surfaces darken where they come close together, and
  most objects need a thin dark line where they meet the ground; in soft light this is often the
  strongest shadow in the picture. **Card:** contact shadows (agrees with Bousquet).
- **Hard or soft is the light's size and distance** (p. 58): a small or distant source gives hard
  edges; a large or near one soft edges. Overcast: shadows almost vanish except under cars and
  trees (p. 60). Several lights make several shadows, even if faint (p. 60); street lights make
  shadows "in various directions" with no fill and very high contrast (p. 51). **Card.**
- **Falloff is indoors and artificial, not sunlight** (ch. 4, pp. 42, 76): the sun is too far away
  for falloff to show; lamps, fires and even windows fall off visibly. **Card:** keeps the fire and
  lamp cards' falloff, and stops it being applied to sunlit scenes.
- **Times of day** (ch. 3, pp. 26–37): midday is white, hard, low-saturation, near-black shadows;
  sunset is weak orange light, low contrast, long shadows, richer blue or purple shadows, clouds lit
  from below and it lasts "only a couple of minutes"; dusk has no sun, so soft light, little shadow,
  delicate color, and alpenglow (a pink band in the eastern sky, p. 31); overcast is soft, low
  contrast, high saturation. **Card:** time-of-day cards.
- **Night: the sky is always lighter than the land** (p. 36): unless something on the land is lit,
  "the bottom image is a physical impossibility because the light on the landscape would have no
  source". Moonlight is reflected sunlight with the same rules, much fainter; the moon is red or
  yellow near the horizon, white higher up, and small: "it can often be tempting to make it much
  larger than it appears". Our night vision is nearly colorless. **Card + Rule idea:** a night
  scene where the land is brighter than the sky with no light source on it.
- **Haze and fog** (pp. 38, 130): distance makes things "fainter, bluer and lower in contrast";
  haze takes the sky's color (blue in sun, white overcast, orange at sunset); thick fog lights
  evenly from all directions, so no shadows under trees. Sun rays need particles in the air.
  **Card:** depth by atmosphere.
- **Fire and candlelight** (p. 50): so red the brain can't correct it; placed low (ground, table),
  unlike lamps from above, so shadows and highlights are reversed from the usual; and it moves,
  because it flickers. Tungsten looks whiter than it measures: paint it whiter, not bright orange
  (p. 44). **Card.**
- **Light from below** (p. 24): a campfire or a torch; it reverses the usual light and shade and
  reads as strange or monstrous (p. 152). **Card:** warn when firelight is meant to feel cozy.
- **Three-point lighting looks fake** (p. 18): "The kind of light that three-point lighting creates
  does not exist in nature and therefore it looks fake." Backlight only "with flair". **Context:**
  disagrees with Glebas (p. 91), who teaches it as the default. The cards should derive light from
  the scene's sources, not a studio formula.
- **Reflections** (ch. 8, pp. 82–90): glossy surfaces show only the brightest things (the sun, the
  lights); on a sunny day the sun's small highlight overpowers the sky's wide one (p. 84); curved
  surfaces bend reflections around their shape (p. 88); dark surfaces show highlights, light
  surfaces show the dark parts of reflections. Wide natural vistas have no specular highlights
  except on water (p. 132). **Card.**
- **Transparency** (ch. 9, pp. 92–98): glass reflects 4% head-on and more at an angle; refraction
  shows most at the edges of a curved transparent object; a water drop shows its surroundings
  upside down; rippling water casts moving caustic patterns, which ripple themselves. **Card.**
- **Translucency glows** (pp. 100, 131): leaves, grass, skin, wax let light through, cast colored
  shadows and are most saturated when backlit: "a field of grass will have a bright saturated glow
  when the sun is behind it". Skin turns red at the light-shadow edge (p. 122). **Card.**
- **Value reads form; hue is free** (ch. 10, pp. 104–110): "Value is the principal and most
  influential factor in defining forms, next comes saturation … then hue"; color is most saturated
  in the mid-tones; strong saturation is rare in nature, mostly in emitted light (sky, neon,
  fire). **Rule idea:** a frame that doesn't read in greyscale (agrees with Williams and Block).
- **Composition with light** (ch. 13, pp. 142–149): "Art is not physics." Reserve the lightest
  light and darkest dark for the focal point; the eye follows the next strongest contrasts in order;
  backlight isolates a subject in silhouette; contrasting edges that nearly touch read badly.
  **Rule idea:** the strongest contrast isn't on the subject (now in three books).
- **Mood and time** (ch. 14–15, pp. 150–162): a color cast over a whole sequence sets mood;
  sections of a story can each get their own light and palette; period scenes should use the light
  of their period (candle, gas, firelight before electricity). **Context.**

## Marcos Mateu-Mestre, *Framed Ink* (scan, read through OCR)

- **Read the shot as masses first** (ch. 3, p. 034): every example comes with two thumbnails, the
  light-and-dark masses and the lines of tension; "to achieve the needed 'quick read', do not think
  in terms of the 'elements' … but in terms of basic, clear, and readable shapes". **Rule idea:**
  blur or threshold a frame to two or three values; the subject should be one clear mass (a
  measurable version of Glebas's silhouette test).
- **Light as the first tool** (ch. 2, pp. 019, 026): the same room becomes a children's tale or a
  horror film by lighting alone; light focuses attention "by creating contrast … a bright,
  illuminated area surrounded by a frame of darkness". The character with the bigger tonal
  contrast gets the eye (p. 037). **Card:** staging by light.
- **Lines carry emotion and direct the eye** (p. 026): "curved shapes will always appear to be more
  subtle and peaceful, diagonals … more dynamic and aggressive. Straight lines will represent
  assertiveness"; branches, graffiti, clouds, a row of heads all act as lines toward the subject.
  The eye goes to the vanishing point and follows where the main character looks (p. 027). Action
  shots are built on diagonals and tilted cameras (p. 059). **Card + Context.**
- **Avoid tangencies and weird coincidences** (p. 026): they make the audience "focus on 'what
  looks weird'" instead of the story. **Rule idea:** near-touching edges between key shapes
  (agrees with Williams's near-miss alignment and Yot p. 149).
- **Big, medium, small** (pp. 027, 049): an uneven balance of sizes makes an image deeper and more
  dynamic; spiky silhouettes read as energetic, round ones as calm. Rule of thirds over symmetry,
  which "will just feel too self-conscious" (p. 025). **Card.**
- **Lenses** (pp. 028–030): a wide lens close up exaggerates depth and size differences; a long
  lens from far away flattens them so subject and background look close. **Card:** speed and
  menace (wide, low) versus calm and beauty (long).
- **Camera height is power** (pp. 040–041): looking down on someone diminishes them; a camera below
  the eyes makes the subject towering. **Card.**
- **Night is shapes disappearing** (pp. 050, 054): the same valley at night loses most shapes and
  becomes uncertain; in his day/night pair the sky has "the same exact value", and night reads
  because every detail on the land is obscured, while day reads from reflected light in the
  shadows. **Card:** agrees with Yot's "sky lighter than land".
- **Keep the focal point across cuts** (p. 055): "make sure … that the last position of the focus
  of attention in one shot coincides with the first point of focus in the next shot". **Rule
  idea:** the subject jumps across the frame at a cut (measurable from saliency or the tracked
  subject before and after a cut).
- **Scale through a shared element** (p. 056): show something huge by putting a known element (the
  aliens, a person) in both shots, touching it. **Card.**
- **Ramp up to the climax** (pp. 075–079): contrast is why we see anything, and it builds a climax:
  flat side-on shots with a calm sky first, then perspective, then a wide lens close and low;
  "leaving the wildest and most powerful for the end". **Rule idea:** the most intense shot
  (biggest size change, strongest diagonals, closest) comes early, not at the climax (agrees with
  Block's intensity curve).
- **The line** (pp. 089–091): stay on one side of the axis between characters so screen positions
  hold; cross it only within one continuous camera move. Characters swap sides of the frame at a
  cut only on purpose (p. 087). **Rule idea:** screen direction flipping at a cut (agrees with
  Katz).
- **Ground contact with a low camera** (p. 071): with the camera near the ground, where feet and
  objects touch the ground must match their spacing at the top, or people "will appear to be
  gigantic". **Card:** contact points (with the shadows card).
- **A recognizable silhouette per character** (ch. 5, pp. 097–101): each character must read as
  itself "in any sort of circumstances, including any type of framing and lighting"; soft round
  shapes for soft personalities, spiky ones for spiky; a relaxed pose is horizontal, an insecure
  one caves in. **Context** for recurring characters and mascots in a video.
- **Don't spend the spectacle early** (p. 110): overusing dynamic devices throughout "would leave us
  with nowhere to go" at the moment that needs intensity; narrowing panels speed up the rhythm
  (p. 114). **Context** for the ramp-up rule above.

## James Gurney, *Color and Light* (scan, read through OCR)

- **Three light systems on a sunny day** (ch. 2, p. 28): the sun, the blue sky and light reflected
  off lit objects; "the second two sources of light derive entirely from the first, and should be
  subordinated to it". More cloud makes shadows greyer; haze brings shadows closer in value to the
  light. **Card:** agrees with Yot; the sun card's fill.
- **Five truths about reflected light** (ch. 3, p. 67): "1. In shadows, upfacing planes are cool,
  and downfacing planes are warm. 2. Reflected light falls off quickly … unless the source is very
  large (such as a lawn) … 4. The color of the shadow is the sum of all the sources of reflected
  illumination, combined with the local color of the object itself. 5. On a sunny day, vertical
  surfaces in shadow usually receive two sources of illumination: warm ground light and blue sky
  light." A cast shadow takes the color of what it "sees" above it (the "eyeball on the ant",
  p. 50). **Card.**
- **Keep tonal intervals consistent** (p. 48): in sunlight, light and shadow can be up to five steps
  of the value scale apart; every surface crossing into the same shadow drops by the same amount
  (p. 52). Texture shows in the half-light just before the terminator, hardly at all in shadow
  (p. 47). **Rule idea:** a shadow that darkens one object much more than its neighbor under the
  same light.
- **Spotlight and ambient** (p. 68): outside the spotlit area, a shadow matches the ambient light of
  the rest of the scene, not the spotlight. **Card.**
- **Light from below** (p. 64): we hardly recognize familiar faces lit from below; it reads as
  firelight, magic or menace, though not always evil (a face lit by a sunny book). **Card:** agrees
  with Yot.
- **Contre-jour** (p. 62): against a bright sky the silhouette dominates, colors lose saturation,
  shadows stretch toward the viewer and glare melts the edges. Edge light needs a darker background
  to read (p. 60). **Card.**
- **Grey is the setting for color** (ch. 4, pp. 80–81): "More paintings fail because of too much
  intense color rather than too much gray"; "Better gray than garish." A small accent of a
  near-complement draws the eye to the center of interest (p. 117). **Rule idea:** high saturation
  over most of the frame (agrees with Blazer).
- **The green problem** (pp. 82–83): vary greens leaf to leaf and tree to tree; flat saturated green
  reads as artificial. **Card:** foliage.
- **Gradation, not flat color** (p. 84): sky, falloff and distance all gradate; a gradated color is
  to a flat one what a curve is to a straight line (after Ruskin). **Rule idea:** large flat fills
  in a scene meant to look natural.
- **Gamut and color scripting** (ch. 7, pp. 123–133): good color comes from what you leave out; pick
  a gamut (often one strong hue and two weaker ones) and stay in it. In sequential art "making a
  sudden shift of gamut will immediately signal the cut"; "it's not just the colors, but also the
  change in colors that creates the effect". **Rule idea:** a gamut shift mid-scene with no cut or
  story reason; a whole video with no change of gamut between its sections. **Context:** agrees
  with Yot ch. 15 and Block.
- **Moonlight looks blue only to us** (p. 138): measured, it's slightly redder than sunlight; it
  looks blue because the rods dominate in dim light. Paint night as the eye sees it, not with the
  camera's black shadows (p. 39). **Card.**
- **Edges and depth** (p. 140): photos blur all but one focal plane; the eye refocuses, so
  everything seems sharp. Softer edges push things back or suggest dim light. **Card.**
- **Motion blur and speed blur** (pp. 168–169): fast objects have soft edges; when the camera tracks
  a fast object the whole background blurs radially from the vanishing point, most at the frame
  edges and nearest the camera, and only edges across the motion blur. **Card:** speed and the
  camera.
- **Color corona** (p. 166): a very bright source (low sun, streetlight) has a colored halo that
  lifts the values next to it. **Card.**
- **Photos lie** (p. 170): cameras clip deep shadows to black and highlights to white and weaken
  color. **Context** for Glebas's "holes".
- **The sky is two gradations** (ch. 10, pp. 174–175): "solar glare" (brighter near the sun) and
  "horizon glow" (lighter toward the horizon); the sky is never a flat blue. **Card + Rule idea:** a
  flat single-color sky in a daylight scene.
- **Atmospheric perspective** (pp. 176–178): the darks change first, "becoming lighter and bluer";
  it happens only where the air in between is lit (a cloud shadow over the view darkens the far
  mountains behind it). Reverse atmospheric perspective: looking toward a low sun through mist or
  dust, the distance gets warmer. **Card.**
- **Golden hour and sunsets** (pp. 180–183): the low sun's light crosses far more air, so it is warm
  and the sky above a richer blue; the strongest red-orange glow sits where the sun crosses the
  horizon, a weaker one at the antisolar point opposite; after sunset the earth's grey shadow rises
  from the horizon opposite the sun. **Card:** time of day.
- **Fog** (p. 184): contrast drops fast with distance; light comes from all directions; in his
  harbor fog the glassy water is one tone darker than the sky, and distant color drops out. **Card.**
- **Rainbows** (p. 187): centered on the antisolar point, opposite the sun, at 42 degrees; a
  secondary bow outside has reversed colors and is weaker, the sky between darker; all shadows
  point toward the rainbow's center. **Card.**
- **Sunbeams need three things** (p. 190): a high screen (clouds, leaves, roof) with a few openings
  that blocks most light so the backdrop is dark; dust, vapor, smoke or smog in the air; and a view
  toward the sun ("when you're looking away from the light source, the beams become nearly
  invisible"). The rays are parallel but converge on the sun in perspective. **Card + Rule idea:**
  god rays with the sun behind the camera, or in clear air.
- **Dappled light** (pp. 192–193): each gap in the leaves projects an image of the sun, so the spots
  are circles (ellipses on slanted surfaces), larger and softer under a higher canopy, and they
  move when the wind moves the treetops. **Card.**
- **Cloud shadows** (p. 194): "1. The margin between light and shadow must be a soft edge" (about
  half a city block from full sun to full shadow); "2. The size and spacing of cloud shadows must
  be matched by the clouds visible in the sky"; 3. the shade is darker and cooler but less blue
  than clear-day cast shadows. Patches of sun direct the eye. **Card.**
- **Snow** (p. 198): whiter than clouds; cast shadows take the sky's color (blue under a blue sky,
  greyer under clouds); small shadows on snow are soft, like a shadow on milk. **Card.**
- **Water** (pp. 199–204): water approaches a mirror only at a shallow angle; looking down you see
  into it. Lit muddy water lightens and browns the reflections of dark things. "All motion in water
  elongates reflections, and throws them into confused vertical lines" (Ruskin): verticals survive
  in a reflection, horizontals break up. Reflections of bright things are darker than the things.
  Underwater, red is gone by about ten feet, orange and yellow by twenty-five, leaving blue;
  caustics appear only in the top twenty or thirty feet, on sunny days, on up-facing surfaces
  (p. 161). **Card:** refines the water card.
- **Ten closing points** (p. 210): "Choose a lighting plan and stick to it … make sure your lighting
  reference is consistent"; "Know your gamut"; colors are known by their relationships, and "the
  color you mix is almost always shifted away from the local color". **Rule idea:** light direction
  that disagrees between elements of one shot (shadows pointing different ways under one sun).

---

## What the direction books change

1. **Corrections to the first cards** (attentry-design-cards.md, 2026-11-19):
   - Water is a mirror only when seen from a low angle; looking down you see into it (Bousquet
     pp. 142, 286; Gurney p. 200). Reflections of bright things are darker than the things, and
     ripples keep verticals while breaking horizontals (Gurney p. 201).
   - Falloff belongs to near sources (fire, lamps, windows), never to sunlight (Yot pp. 42, 76).
   - Shadows are never neutral grey or pure black: they take the color of their fill (sky, ground,
     foliage), and outdoors cast shadows are darker than form shadows (Yot pp. 55, 64; Gurney
     p. 67).
   - At night the sky is lighter than unlit land, the moon is small, and it's red near the horizon
     (Yot p. 36).
   - God rays need a perforated screen, particles in the air and a view toward the sun (Gurney
     p. 190).
   - Firelight comes from low down, which reverses the usual light and shade (Yot pp. 24, 50).
2. **New cards** these books support: splash (with the object table), explosion timing, smoke
   column, flame colors, rain streaks, dappled light, cloud shadows, rainbow, fog, snow, the times
   of day, depth by atmosphere, the two sky gradations, backlit translucency (leaves, grass, skin),
   contact and occlusion shadows, scale through timing, falling under gravity, speed blur, and
   camera height and lens.
3. **New rule ideas**, measurable on rendered frames:
   - The strongest contrast in the frame isn't on the subject (Glebas p. 180, Yot p. 144, Mateu-
     Mestre p. 037; now in five books with Mercado and Blazer).
   - The subject isn't one clear mass in a two- or three-value version of the frame (Mateu-Mestre
     p. 034, Glebas p. 91).
   - The focal point jumps across the frame at a cut (Mateu-Mestre p. 055).
   - Large crushed-black or clipped-white areas (Glebas p. 210, Gurney p. 170); large neutral-grey
     shadows in a daylight scene (Yot p. 64).
   - A flat single-color daylight sky (Gurney p. 174).
   - A night scene where unlit land is brighter than the sky (Yot p. 36).
   - Shadows pointing different ways under one sun (Gurney p. 210).
   - A fall at constant speed (Bousquet p. 50); an explosion with even speed throughout, or a big
     effect resolving as fast as a small one (Gilland pp. 121, 272).
   - A particle or wave element repeating with identical size and period (Gilland p. 45).
   - The most intense shot comes early instead of at the climax (Mateu-Mestre pp. 075–079).
   - High saturation over most of the frame (Gurney p. 80); a gamut shift mid-scene with no cut
     (Gurney p. 133).
4. **A disagreement to settle in the cards:** Glebas (p. 91) teaches three-point lighting as the
   default; Yot (p. 18) calls it fake and clichéd. The cards should derive light from the scene's
   own sources (sun, sky, fire, lamps) and their bounce, which is what Yot and Gurney both teach.
5. **Limits:** these books describe the physical world and painters' practice; most of it is
   direction (what to ask for), not something a frame check can confirm. The rule ideas above are
   the measurable part; everything else belongs in the cards, given at request time and checked by
   eye after the render, as the 2026-11-19 test showed.

---

## Copy books (read 2026-11-24, two passes)

Legend as above. **Rule idea** = a check on the copy; **Direction** = what the agent hears before
writing; **Context** = scopes a rule. Page numbers are printed pages where the edition has them;
"eb" = page in an ebook as extracted (ebooks have no printed pages); "pdf" = page in a PDF with
no printed numbers. Every quotation was checked word for word against the book text (pass 2);
my own example phrases are in *italics*, not quote marks.

## Joseph M. Williams, *Style: Lessons in Clarity and Grace* (9th ed.)

(This PDF has no printed page numbers; cited by lesson and PDF page.)

- **Characters as subjects, actions as verbs** (Lesson 3–4, pdf 40–59): "the first principle of a
  clear style is this: Make the subjects of most of your verbs short, specific, and concrete—the
  main characters in your story." Readers judge prose clear when characters are subjects and
  their actions are verbs; indirect when actions hide in nominalizations and characters vanish
  ("There was fear that there would be a recommendation for a budget reduction. Who fears? Who
  recommends?"). **Rule idea:** the core of the copy rules. Reinhart et al. found instruction-tuned
  LLMs use nominalizations 1.5–2× the human rate; Williams is the cure.
- **Five nominalization patterns, each with a fix** (Lesson 3, pdf ~46–48): (1) a nominalization
  as the subject of an empty verb ("The intention of the committee is to audit…"); (2) one
  nominalization as subject of an empty verb and another after it ("Our loss in sales was a result
  of their expansion of outlets"); (3) after an empty verb ("The agency conducted an
  investigation"); (4) two or three in a row joined by prepositions ("a review of the evolution
  of the brain"); (5) after "there is/there are" ("There is no need for our further study").
  Fix: make the action a verb and name who does it. **Rule idea:** these five are detectable with
  a parser and a -tion/-ment/-ence/-ity list plus empty verbs (be, have, make, conduct, give,
  perform). Must not flag useful nominalizations (Williams lists them: a short subject referring
  back to the last sentence, a common concept like "freedom", what would otherwise need "the fact
  that").
- **Diagnose, analyze, rewrite** (Lesson 3, pdf ~45): find the characters, find their actions,
  check that characters are subjects and actions are verbs. **Direction:** the editing order.
- **The passive has uses** (Lesson 4, pdf 67): when the actor is unknown or unimportant, to move
  a long bundle of information to the end, or to keep focus on a character. **Context:** a
  passive check must not flag these. (GPT-4o uses the agentless passive at half the human rate,
  so AI copy isn't over-passive; the problem is nominalization and participles.)
- **Old before new: cohesion** (Lesson 5, pdf 81–86): sentences flow when each begins with
  something the reader already knows and ends with the new; readers expect the topic to be the
  subject. **Direction.**
- **Stress at the end** (Lesson 6, pdf 98): put long, complex and new information at the end;
  begin with a short concrete subject and a specific verb. **Direction.**
- **Concision, six rules** (Lesson 7, pdf ~112–120): delete words that mean little or nothing;
  delete words that repeat others (doubled words: English writers long paired "a French or Latin word with a native English one, because foreign words sounded more learned"); delete words implied by others ("future
  events", "past history", "final outcome", pdf 116); replace a phrase with a word; change
  negatives to affirmatives; delete what readers can infer. Plus redundant categories, where a
  word names its own category: "During that period of time, the membrane area became pink in
  color and shiny in appearance" (pdf 117). **Rule idea:** doubled words, redundant modifiers
  and categories, and wordy phrases are list-checkable.
- **Metadiscourse: some, not much** (Lesson 7, pdf ~122–126): language about the writing itself.
  Topic announcers ("In this essay, I will discuss the role of metaphor in style") and attributed
  observations: "Don't announce that something has been observed, noticed, noted, and so on;
  just state the fact". Hedges ("perhaps", "seems") and intensifiers ("very", "clearly",
  "obviously") are both metadiscourse; "the risk is in using too many". **Rule idea:** announced
  topics, attributed observations, stacked intensifiers. Matches Wikipedia's "it's important to
  note" sign.
- **Long sentences: shape, not pile-up** (Lesson 8, pdf 146–149): don't tack clause onto clause;
  use resumptive, summative and free modifiers; in coordination go from shorter to longer.
  **Context:** AI's ", highlighting X" tail is a free modifier misused to claim meaning, not to
  extend a thought.
- **Balance used prudently** (Lesson 9, pdf 169): balanced, parallel structures are the mark of
  elegance, but "used to excess, these patterns can seem merely clever". **Context:** grounds
  the "negative parallelism repeated" and "triads repeated" rules: the device is fine, the reflex
  isn't.
- **Sentence length** (Lesson 9, pdf 180): "Think about the length of your sentences only if they
  are all longer than thirty words or so or shorter than fifteen." **Rule idea:** a threshold for
  the uniform-rhythm rule: flag a paragraph whose sentences all fall in one narrow band, or all
  over 30, or all under 15.
- **Point sentences** (Lesson 10–11, pdf 205–211): open every section with a short segment ending
  in a sentence that states its point and key concepts. **Direction** for longer copy (landing
  pages, docs).
- **The ethics of style** (Lesson 12, pdf ~215–245): "We write ethically when as a matter of
  principle, we would trade places with our intended readers"; intended misdirection hides the
  responsible agent (his Sears example: the company vanishes from sentences about mistakes and
  reappears in sentences about good intentions). **Rule idea:** marketing copy that drops the
  actor exactly where something went wrong. **Context:** for honesty checks, not style.

## Verlyn Klinkenborg, *Several Short Sentences About Writing*

(An ebook with no printed page numbers; "eb" = page in the ebook as extracted, 158 in all.)

- **Volunteer sentences: the AI failure, described in 2012** (eb 41): "sentences often volunteer
  a shape of their own And supply their own words as if they anticipated your thinking. Those
  sentences are nearly always unacceptable, Dull and unvarying … only the most predictable
  phrases, the inevitable clichés." A cliché is "the debris of someone else's thinking, Any group
  of words that seem to cluster together 'naturally'". **Context:** this is what next-token
  prediction produces by design: the phrase that clusters naturally. Grounds the vocabulary and
  puffery rules, and the warning that synonyms don't fix it (eb 41: "You can't fix a cliché by
  using it ironically").
- **Know what each sentence says** (eb 9–10): "Know what each sentence says, What it doesn't say,
  And what it implies. Of these, the hardest is knowing what each sentence actually says." Each
  sentence "says the very thing it comes into existence to say. Then it leaves the stage … It
  doesn't talk about what it's saying." **Direction.**
- **Short sentences, for control** (eb 13–16): short sentences make each one examinable; long
  ones are "pasted together with false syntax And rely on words like 'with' and 'as' … short on
  verbs … Full of floating, unattached phrases". Remove words one by one: "Every word is optional
  until it proves to be essential". **Context:** the "with" and dangling-phrase habit is the same
  as Williams's tacked-on modifiers and AI's participle tails.
- **Vary the structure, not only the words** (eb 77): "One way is by looking for sameness,
  uniformity, and working against it. You wouldn't repeat the same words over and over again,
  So why repeat so many sentence structures?" Only a string of choppy sentences sounds choppy;
  rhythm comes from "two or three sentences working together" (eb 15). **Rule idea:** repeated
  sentence openings and shapes (subject–verb–object all the way down; every sentence starting
  with the subject; the same length band). Strengthens the uniform-rhythm rule with a second
  measure: structural repetition.
- **Logical indicators are tics** (eb 96–97): "In fact. Indeed. On the one hand. On the other
  hand. Therefore. Moreover. However. … Thus. These are logical indicators. Emphasizers.
  Intensifiers. They insist upon logic whether it exists or not." They "betray the writer's
  anxiety" and "bolster the apparent authority of your piece By echoing the apparent authority
  of other people". **Rule idea:** sentence-initial connectives in density ("Moreover,",
  "Additionally,", "Furthermore,", "Indeed,"): matches Wikipedia's "Additionally" sign.
- **Transitions and topic sentences are scaffolding** (eb 25–28): "No sentence can afford to be
  merely transitional"; topic sentences only "announce the subject of the paragraph you're about
  to read". **Context:** disagrees in part with Williams's point sentences (Lesson 10), who wants
  a stated point up front. The agreement: no sentence that only announces; the point sentence
  must carry content itself.
- **Empty modifiers, named** (eb 142): of "noble mountains … Robust with pines … colorfully
  vibrant in the warm months": "Can you feel the emptiness of the modifiers here—'noble,'
  'robust,' 'colorfully vibrant'? And note that summarizing word, 'array.'" **Rule idea:** two of
  the words on Wikipedia's AI list ("robust", "vibrant"), flagged by a writing teacher as empty
  before chatbots existed. Supports the vocabulary rule as a craft rule, not an AI detector.
- **Revision as becoming a stranger** (eb 45–52): read your work aloud (the eye can't hear rhythm);
  put every sentence on its own line; circle nouns and verbs; ask "How many of the verbs are
  variants of 'to be'", whether nouns are "Multisyllabic Latinate nouns ending in '-ion'", how close
  each subject is to its verb. **Rule idea:** a sentence-per-line view in the report; "-ion" noun
  density; subject–verb distance. **Direction:** the read-aloud test.
- **Names of things** (eb 39–40): "It's your business to know the names of things"; prose taught
  in school makes "inert verbs act abstractly upon faceless nouns" and uses "passive constructions,
  which absolve everyone of responsibility". **Rule idea:** supports "no specifics": concrete,
  named nouns versus abstractions.
- **Authority comes from clarity, not borrowing** (eb 102–104, 112): "Authority arises only from
  clarity of language and clarity of perception"; the "aping of authority" with "transition and
  false logic" is the opposite. **Context:** for vague attribution ("experts say").
- **Sincerity must be enacted** (eb 68): "If you want the reader to feel your sincerity, your
  sentences have to enact sincerity—verbally, syntactically, even rhythmically." **Context:** why
  copy that claims (*we're passionate about…*) reads as hollow.
- **Write about what you noticed** (eb 34–37): people write "about pre-authorized subjects in
  pre-authorized language"; noticing is the source of specifics. **Direction:** before copy, list
  what's actually particular about this product.
- **Metaphor, sparingly** (eb 40): "Like any rhetorical device, the less you use it, the more
  effective it is." **Context:** the "use a device once" direction.
- **Parallelisms and contrasts as traps** (eb 109): "You may be creating syntactical and logical
  patterns that cast themselves forward Into future sentences and end up constricting you.
  Parallelisms and contrasts, for instance. They seem to offer structure and guidance, but they're
  tying your hands." **Rule idea:** the clearest craft basis for the repeated negative-parallelism
  and triad rules: the pattern drives the sentences instead of the thought.
- **Good prose sounds spoken** (eb 62–63): "It's always worth asking yourself if you can imagine
  saying a sentence And adjusting it until you can"; rewrite stiff prose "as if it were A letter or
  a long e-mail to a friend". **Direction:** the read-aloud and letter tests.
- **Trust the reader** (eb 111–114): writing that distrusts the reader over-reasons "filling our
  prose with approximations of logic"; trusting the reader controls "The temptation to
  over-narrate, over-describe, over-interpret, over-signify". **Rule idea:** over-signifying: the
  participle tail and the "This shows/This highlights" sentence that explains what the reader
  just read.
- **What to revise toward** (eb 118–119): "revise toward brevity—remove words instead of adding
  them. Toward directness—language that isn't evasive or periphrastic. Toward simplicity—in
  construction and word choice. Toward clarity—a constant lookout for ambiguity. Toward rhythm"
  … "Toward presence—the quiet authority of your prose." **Direction:** a compact editing brief
  for the agent.

## Chip Heath & Dan Heath, *Made to Stick*

(Ebook; "eb" = page as extracted, 297 in all.)

- **The Curse of Knowledge** (Intro, eb 25; Epilogue, eb 231–233): "Once we know something, we
  find it hard to imagine what it was like not to know it." Experts answer "will people
  understand / care?" with yes because they do. **Context:** why product copy from inside the
  company (or from a model fed the company's docs) defaults to category words. "Accuracy to the
  point of uselessness is a symptom of the Curse of Knowledge" (eb 58).
- **Six traits, checkable as questions** (Intro and Epilogue): Simple, Unexpected, Concrete,
  Credible, Emotional, Stories. The epilogue maps them to the reader's steps: pay attention →
  Unexpected; understand and remember → Concrete; believe → Credible; care → Emotional; act →
  Story (eb ~235). "Rather than guess about whether people will understand our ideas, we should
  ask, 'Is it concrete?'" **Rule idea + Direction:** a SUCCESs pass on copy; Concrete and Credible
  are the measurable ones.
- **Simple = core + compact** (ch. 1, eb 48): find the single most important thing; say it
  briefly. "Names, names, and names" (eb 45–47: a local paper's whole strategy) — highly concrete.
  **Direction:** one core message per piece.
- **Concrete beats abstract** (ch. 3, eb 101–107): "Concrete language helps people, especially
  novices, understand new concepts. Abstraction is the luxury of the expert." Memory is Velcro:
  concrete details have more hooks. Over generations "the more memorable concrete details
  survived and the abstractions evaporated" (eb 104). **Rule idea:** the "no specifics" rule's
  research base: abstract-noun density, no sensory or named details.
- **Credibility from inside the message** (ch. 4): vivid, specific details make claims believable
  (eb 130s); statistics made human-scale (eb 137: "contextualize them in terms that are more
  human, more everyday"); the Sinatra Test, "one example alone is enough to establish credibility"
  (eb 145); testable credentials, "asking customers to test a claim for themselves" (eb 150).
  **Direction:** for a product page: one strong example, numbers in human terms, a claim the
  reader can check. **Context:** the opposite of "experts agree" and *industry-leading*.
- **Semantic stretch** (ch. 5, eb 164–166): words lose force by overuse; researchers tracked
  "unique" (which "used to mean one of a kind") across the top fifty U.S. newspapers over twenty
  years: it rose while "unusual" fell; "In 1985, articles were more than twice as likely to use the
  word 'unusual' as the word 'unique.' By 2005, the two words were about equally likely to be
  used." Yet "Unique things should be a subset of unusual things". **Context:** the same mechanism as AI's favorite words ("crucial",
  "pivotal", "robust"): overuse empties them. Supports the vocabulary rule on craft grounds.
- **WIIFY, what's in it for you** (ch. 5, eb 171): spell out the reader's benefit plainly.
  Avoid "Maslow's basement" (eb 174): don't assume people only care about money and security.
  **Direction.**
- **Surprise, not gimmicks** (ch. 2, eb 69–83): surprise must be "postdictable" (makes sense
  afterwards); gimmicky surprise is a trap. Curiosity "happens when we feel a gap in our
  knowledge" (Loewenstein, eb 83). **Direction:** a hook that opens a real gap, not a stunt.
- **Stories as flight simulators** (ch. 6): stories show how to act; challenge, connection and
  creativity plots. **Context.**

## Ann Handley, *Everybody Writes*

(Ebook; "eb" = page as extracted, 327 in all. Rules are numbered in the book; both are given.)

- **The swap test** (Rule 42, eb 134): copy from real home pages and press releases ("a
  full-service … practice whose objective is to provide timely and accurate professional
  services"; "leveraging a variety of data sources and advanced analytic approaches") fails
  because "they could be describing a hundred different companies, rather than one unique
  company. … Don't tell me who you are—tell me why you matter to me." **Rule idea:** the clearest
  definition of generic copy: a sentence still true if the product's name is swapped for a
  competitor's. Approximated by sentences with no product-specific noun, number or name.
- **Real words, not buzzwords** (Rule 29, eb ~100): "revolutionary, value-added, impactful,
  cutting-edge, best-of-breed … leverage and incentivize and synergize". Buzzwords are "the
  chemical additives of business writing … one or two used sparingly don't much matter. But use
  too many of them and they become toxic." **Rule idea:** a buzzword list with a density
  threshold, the same shape as Wikipedia's AI-word rule.
- **Frankenwords and fake verbs** (Rule 30): coinages ("amazeballs", "solopreneur"), "-ize/-ism"
  additives, nouns as verbs ("leverage", "incentivize", "bucketize") and verbs as nouns
  ("learnings"). **Rule idea:** a list ("leverage" is on Wikipedia's newest AI list too).
- **Weblish** (Rule 31): "bandwidth", "ping", "radar screen", "execute on", words that "sound as
  if they were being uttered by a robot". **Rule idea:** list.
- **Weak verbs and adverbs** (Rules 33–34, eb ~102–106): swap the weak verb plus adverb for a
  strong verb ("production increased quickly" → "production surged"); keep an adverb only when it
  changes the meaning. Active over passive ("Active sounds zippier"). **Rule idea:** "-ly"
  adverb + weak verb pairs; intensifier adverbs ("very", "really", "extremely").
- **Clichés, once in a blue moon** (Rule 35): business platitudes ("move the needle", "at the end
  of the day", "where the rubber meets the road", "take a 30,000-foot view") and clichéd concepts
  ("Content is king", "___ is the new black", "___ is dead"). Allowed sparingly as shorthand.
  Orwell: "Never use a metaphor, simile, or other figure of speech which you are used to seeing in
  print." **Rule idea:** a cliché list, flagged once each.
- **Mistakes marketers make** (Rule 36): unparallel "Not only … but also"; companies that "saw"
  growth; "in terms of" ("chances are you're not thinking clearly"); "this/that" with an unclear
  antecedent at the start of a sentence. **Rule idea:** each is a pattern.
- **Running starts** (Rule 15, eb 65): "At the beginning of a piece, many of us take too long to
  delve into the topic … a metaphorical running start". **Rule idea:** an opening paragraph with
  no claim, number or name (preamble). **Direction:** start where the point starts.
- **The editing checklist** (Rule 13, "Cross out the wrong words"): by chainsaw (state the key
  idea near the start; slash what doesn't support it; "Make every paragraph earn its keep";
  "Make every sentence earn its keep … Or does it simply restate what its buddy before it already
  said? If so, kill it") then by surgical tools (trim bloat: "although" for "despite the fact
  that", "about" for "in regard to"; shed the obvious: "in this article", "I've always felt
  that"). **Rule idea:** restating sentences (high overlap with the previous sentence) and
  wordy-phrase swaps.
- **Customer-centric point of view** (Rule 12, eb 59): replace "we" with "you": "Company-centric:
  We offer accelerated application development. Customer-centric: Deploy an app to the cloud at
  lunch hour." **Rule idea:** ratio of "we/our" to "you/your" on product pages.
- **Show, don't tell** (Rule 18, eb 79): Chekhov's "Show me the glint of moon on broken glass."
  **Direction.**
- **Voice is a differentiator** (Rule 43, eb 136): "your brand voice is simply an expression of
  your company's personality and point of view". **Direction:** reuse the project's voice guide
  and past copy.
- **Truth** (Rule 46, eb 151): brand content must be "scrupulously trustworthy … the full truth,
  with fairness, integrity, and accountability". **Context.**
- **Landing pages and headlines** (Rules 68–69, eb 229–233): "A landing page should offer
  visitors a hyperfocused experience … a clear path to follow"; headlines benefit-driven, not
  product-driven: in a MarketingProfs test, "Create Successful Social Media Campaigns Fast with
  SmartTools" against "Join today and get access to SmartTools". **Direction.**
- **Important words first** (Rule 5, eb 36): "We tend to junk up the beginning of our sentences
  with modifiers and qualifiers"; begin with the actor and the action. **Rule idea:** long
  sentence openers before the subject (stacked introductory phrases), with Williams Lesson 6.
- **Lede and kicker** (Rule 17, eb 69): "A good lede invites you to the party and a good kicker
  makes you wish you could stay longer." **Direction:** with Zinsser's lead; the opposite of the
  formula ending ("In conclusion").
- **Limit moralizing** (Rule 40, eb 127): sentences opening "Don't forget…", "Never…", "Avoid…",
  "Remember to…", "Always remember to…" read as condescending. **Rule idea:** moralizing openers
  in marketing copy (common in AI-written tips posts).
- **Ground content in data** (Rule 59, eb 180): "Data puts your content in context and gives you
  credibility." **Direction:** with Hopkins: a number beats an adjective.
- **Twitter is dialogue, LinkedIn is helping** (Rules 61, 65, eb 187, 214): tweets "work best as a
  dialogue"; "write every tweet as you would speak it"; LinkedIn: "Always Be Helping". Her lengths
  date from 2014 (tweets of 120–130 characters under the old 140 limit), so they're context only.
  **Direction** for posts.

## William Zinsser, *On Writing Well*

- **Clutter** (ch. 2–3, pp. 7–16): "Clutter is the disease of American writing … unnecessary
  words, circular constructions, pompous frills and meaningless jargon." "The secret of good
  writing is to strip every sentence to its cleanest components. Every word that serves no
  function, every long word that could be a short word, every adverb that carries the same meaning
  that's already in the verb, every passive construction that leaves the reader unsure of who is
  doing what." His bracket examples: the unnecessary preposition ("order up"), the adverb repeating
  the verb ("smile happily"), the adjective stating a known fact ("tall skyscraper"), little
  qualifiers ("a bit", "sort of"), empty phrases ("in a sense"). **Rule idea:** redundant
  adverb–verb and adjective–noun pairs; empty phrases.
- **Fad words** (p. 16): "Beware of all the slippery new fad words: paradigm and parameter,
  prioritize and potentialize. They are all weeds that will smother what you write." **Rule
  idea:** "prioritize" is on Wikipedia's mid-2026 AI list: the list rule again has a craft basis.
- **Journalese** (ch. 6 "Words", p. 33): "a mixture of cheap words, made-up words and clichés
  that have become so pervasive that a writer can hardly help using them. You must fight these
  phrases or you'll sound like every hack." **Context:** the pre-AI name for "sounds like everyone
  else".
- **The 30-second reader** (p. 9): "The reader is someone with an attention span of about 30
  seconds." **Context.**
- **Be yourself** (ch. 5 "Style", p. 20): "a fundamental rule is: be yourself. No rule, however,
  is harder to follow." Good writing has "humanity and warmth" (p. 5). **Direction:** first
  person and the writer's own view where the brand allows it.
- **The lead** (ch. 9, p. 55): "The most important sentence in any article is the first one. If
  it doesn't induce the reader to proceed to the second sentence, your article is dead."
  **Direction + Rule idea:** the opening sentence carries a claim or a concrete detail.
- **Verbs** (Bits & Pieces, p. 69): "Verbs are the most important of all your tools … Active
  verbs push hard; passive verbs tug fitfully." "Most adverbs are unnecessary … Don't tell us that
  the radio blared loudly." **Rule idea:** redundant adverbs.
- **Little qualifiers** (p. 71): "Prune out the small words that qualify how you feel and how
  you think and what you saw: 'a bit,' 'a little'" (and "sort of", "rather", "quite", "pretty
  much"). **Rule idea:** qualifier density.
- **The exclamation point** (p. 72): "It has a gushy aura … Instead, construct your sentence so
  that the order of the words will put the emphasis where you want it." **Rule idea:** more than
  one "!" in a piece of product copy.
- **Concept nouns and creeping nounism** (pp. 76–77): "Nouns that express a concept are commonly
  used in bad writing instead of verbs that tell what somebody did"; noun chains such as
  "Communication facilitation skills development intervention"; "Nobody goes broke now; we have
  money problem areas." **Rule idea:** noun stacks of three or more (with Williams's
  nominalizations).
- **Overstatement and credibility** (p. 78): don't inflate; "If the reader catches you in just
  one bogus statement that you are trying to pass off as true, everything you write thereafter
  will be suspect." **Rule idea:** superlatives without support ("the best", "revolutionary",
  "world-class") in product copy.
- **Business writing** (ch. 16, p. 166): "humanity and clear thinking are a big part of the
  solution"; "Hold the hype" (p. 184). **Context.**
- **Unity and one point** (ch. 8, pp. 50–53): "Unity is the anchor of good writing"; keep one
  pronoun, tense and mood; "decide what single point you want to leave in the reader's mind. It
  will … affect your decision about tone and attitude." **Direction:** with Heath's core message:
  one point per piece, chosen before writing.

## William Strunk Jr., *The Elements of Style* (the 1918 text, in a 2011 edition)

(Strunk's original, without White's later "An Approach to Style"; cited by rule number.)

- **Rule 11, active voice**: "The habitual use of the active voice … makes for forcible writing";
  replace "some such perfunctory expression as there is" ("There were a great number of dead
  leaves lying on the ground" → "Dead leaves covered the ground"). And the nominalized passive:
  "A survey of this region was made in 1900" → "This region was surveyed in 1900". The passive is
  still right when it puts the topic first. **Rule idea:** *There is/there are … -ing* openers;
  *a [noun] of X was made/carried out*.
- **Rule 12, positive form**: "Make definite assertions. Avoid tame, colorless, hesitating,
  non-committal language. Use the word not as a means of denial or in antithesis, never as a means
  of evasion." "the reader is dissatisfied with being told only what is not; he wishes to be told
  what is." But "The antithesis of negative and positive is strong: Not charity, but simple
  justice." **Context:** "not X but Y" is a real device; the AI fault is using it as a reflex on
  claims nobody made (Wikipedia's negative parallelism).
- **Rule 13, omit needless words**: "A sentence should contain no unnecessary words, a paragraph
  no unnecessary sentences … not that the writer make all his sentences short … but that every
  word tell." The phrase list: "the question as to whether" → whether; "he is a man who" → he;
  "in a hasty manner" → hastily; "the fact that should be revised out of every sentence in which it
  occurs" ("owing to the fact that" → because). **Rule idea:** the wordy-phrase list (with
  Williams and Handley).
- **Rule 14, avoid a succession of loose sentences**: a paragraph of "two co-ordinate clauses, the
  second introduced by a conjunction" is bad "because of the structure of its sentences, with their
  mechanical symmetry and sing-song". Recast some as simple, periodic or three-clause sentences.
  **Rule idea:** the uniform-rhythm rule in 1918 words: repeated sentence templates in a
  paragraph.
- **Rule 15, parallel form**, and **Rule 18, emphatic words at the end**. **Direction.**
- **Words commonly misused** (ch. V): "Certainly … to intensify any and every statement. A
  mannerism of this kind, bad in speech, is even worse in writing"; "Factor. A hackneyed word";
  "Feature. Another hackneyed word; like factor it usually adds nothing" ("Better use the same
  number of words to tell what Miss A. sang"); "Character", "Nature", "System", "Case": "often
  simply redundant"; "Very. Use this word sparingly. Where emphasis is necessary, use words strong
  in themselves." **Rule idea:** "features" (as in "boasts/features") is on Wikipedia's copula
  list; Strunk's fix is the specifics rule: say what the thing is.

## Anne Lamott, *Bird by Bird*

(Ebook; "eb" = page as extracted, 166 in all. About process and fiction; it gives direction, not
checks.)

- **Good writing is telling the truth** (Getting Started, eb 21): "good writing is about telling
  the truth"; and "telling the truth in an interesting way turns out to be about as easy and
  pleasurable as bathing a cat." **Context:** truth and interest together, not polish.
- **Details** (eb 22): "Scratch around for details: what people ate, listened to, wore". **Direction:**
  the specifics rule from a novelist: concrete, sensory, particular.
- **Short assignments, the one-inch picture frame** (eb 29–30): "all I have to do is to write down
  as much as I can see through a one-inch picture frame". **Direction:** one small concrete scene
  or fact per section, not a survey; the opposite of AI's "comprehensive overview" shape.
- **First drafts and perfectionism** (eb 24, 36): bad first drafts are how good writing starts;
  "Perfectionism is the voice of the oppressor … perfectionism will ruin your writing, blocking inventiveness
  and playfulness". **Context:** AI copy is the reverse failure: an instantly polished first draft
  with nothing true in it. The work is in the revising and in finding what's true, not the polish.
- **Looking around** (eb 78): "Writing is about learning to pay attention and to communicate what
  is going on." **Direction:** with Klinkenborg's noticing: copy starts from what was observed
  (in the product, in users), not from category language.
- **Your own voice** (eb 137): possessions and polish are "just props … on loan"; what isn't on
  loan is "the thing that is real and true: your own voice". Characters "should not all sound like
  you" (eb 59). **Context:** voice comes from truth and point of view; a model's default voice is
  everyone's average.

## Claude C. Hopkins, *Scientific Advertising* (1923)

(Printed page numbers are in the text.)

- **Being specific** (ch. 7, pp. 23–24): "Platitudes and generalities roll off the human
  understanding like water from a duck. They leave no impression whatever." "Best in the world"
  and "Lowest price in existence" are "at best simply claiming the expected. But superlatives of
  that sort are usually damaging. They suggest looseness of expression, a tendency to exaggerate,
  a careless truth. They lead readers to discount all the statements that you make." "But a man
  who makes a specific claim is either telling the truth or a lie … Actual figures are not
  generally discounted." **Rule idea:** the strongest evidence-based grounding for both the
  superlative rule and the specifics rule.
- **His examples, each a before and after** (pp. 23–24): "more light" → "three and one-third
  times the light"; "Our prices have been reduced" → "reduced 25 percent"; "Lowest prices in
  America" (copied by every rival) → "Our net profit is 3 percent" (business up sharply the next
  year); "Abundant lather" → "Softens the beard in one minute … The final result of testing and
  comparing 130 formulas"; "Used the world over" → "Used by the peoples of 52 nations"; "quick
  shaves" → "a 78-second shave". **Direction:** the model for every product claim: replace the
  adjective with the measurement behind it.
- **First to tell** (p. 24): every brewer said "Pure"; one described the process (filtered air,
  bottles washed four times, water from 4,000 feet, 1,018 yeast experiments). "All claims were
  such as any brewer might have made … But he was the first to tell the people about them."
  **Direction:** ordinary facts, specifically told, beat category claims. For Attentry: what it
  actually checks and how, not *powerful code analysis*.
- **Fine writing is a disadvantage** (ch. 2, p. 8): "fine writing is a distinct disadvantage. So
  is unique literary style. They take attention from the subject." **Context:** AI's polished,
  ornamented style is the problem Hopkins describes: style that draws attention to itself.
- **Don't boast, don't joke about money** (p. 10): "Don't try to be amusing. Money spending is a
  serious matter. Don't boast, for all people resent it." **Context.**
- **Offer service** (ch. 3, p. 11): "the people you address are selfish, as we all are. They care
  nothing about your interests or profit. They seek service for themselves." **Direction:** with
  Handley's "you, not we".
- **Test, don't guess** (ch. 1, 15, p. 5): principles proved by keyed ads and traced returns.
  **Context:** for Attentry Design, rules should come from evidence (the baseline, studies), not
  taste.
- **Tell the full story; don't attack rivals** (ch. 8, p. 26; ch. 18, p. 55). **Direction.**
- **Individuality** (ch. 17, p. 53): "A person who desires to make an impression must stand out in
  some way. Being eccentric, being abnormal is not distinction to covet. But doing admirable
  things in a different way gives one a great advantage." **Context:** standing out by substance,
  not by gimmick (with Heath's "postdictable" surprise).

## Robert B. Cialdini, *Influence: The Psychology of Persuasion*

(For copy, Cialdini matters as the line between honest persuasion and its counterfeit: Attentry
Design should flag the counterfeits, never teach the tricks.)

- **Click, whirr** (ch. 1, pp. 3–4): people often respond automatically to a trigger feature:
  Langer's copier study (a request "because I'm in a rush" got 94% compliance); turquoise that
  sold only after its price was doubled by mistake ("expensive = good"). **Context:** persuasion
  works on shortcuts, which is why fake versions of the triggers work too, and why they're the
  copy patterns worth checking.
- **Social proof, and fake social proof** (ch. 4, pp. 88–89, 121): "we use information about how
  others have behaved to help us determine proper conduct", most of all people like us. Canned
  laughter works although it's "patently fraudulent": "the problem comes when we begin responding
  to social proof in such a mindless and reflexive fashion that we can be fooled by partial or
  fake evidence." **Rule idea:** vague, unverifiable social proof in copy (*thousands of happy
  users*, *trusted by developers worldwide*, *loved by teams*) with no number, name or source.
  Real counts (Attentry's actual download numbers) are the honest version.
- **Authority, and its trappings** (ch. 6, pp. 166–174): titles, clothes and trappings stand in
  for expertise, which con artists exploit. The defense is two questions: "Is this authority truly
  an expert?" (credentials, and their relevance to the topic) and "How truthful can we expect the
  expert to be here?" **Rule idea:** *experts recommend*, *industry-leading*, *award-winning*,
  *backed by research* with no named expert, award or study (the same as Wikipedia's vague
  attribution sign, now with the psychology of why it works and why it's dishonest).
- **Scarcity tactics** (ch. 7, pp. 180–182): the limited-number tactic (*only a few left*) and
  deadlines ("Exclusive, limited engagement", "right now"). **Rule idea:** urgency and scarcity
  language (*limited time*, *only N left*, *act now*) in copy for something that isn't scarce:
  for a free, open-source tool it's always counterfeit.
- **Commitment, reciprocation, liking** (ch. 2, 3, 5): testimonial contests get people to go on
  record (p. 61); gifts create obligation. **Context:** mostly sales tactics, out of scope for
  copy checks.
- **How to say no** (each chapter's end): the defenses are about spotting counterfeit triggers,
  e.g. telling honest favors from exploitation (p. 38). **Context:** frames the rules above as
  protecting the reader, which is also what keeps trust (the disclosure studies).

## Steve Krug, *Don't Make Me Think* (2nd ed.)

(Printed page numbers are in the text in brackets.)

- **Happy talk must die** (ch. 5, p. 46): "the introductory text that's supposed to welcome us to
  the site and tell us how great it is … one sure-fire test: If you listen very closely while
  you're reading it, you can actually hear a tiny voice in the back of your head saying, 'Blah
  blah blah blah blah.'" "Unlike good promotional copy, it conveys no useful information, and it
  focuses on saying how great we are, as opposed to delineating what makes us great." **Rule
  idea:** the clearest definition of puffery on a page: self-praise without the facts behind it.
- **Krug's Third Law** (ch. 5, p. 45): "Get rid of half the words on each page, then get rid of
  half of what's left." **Direction** (for page copy).
- **Instructions must die** (p. 47): no one reads them; make things self-explanatory instead.
  **Context** for UI text.
- **Self-evident** (ch. 1, p. 11): a page should be so clear that a neighbor "could look at your
  site's Home page and say, 'Oh, it's a _____.'" **Rule idea + Direction:** the home page must say
  what the thing is; Miller's 5-second test (in the earlier notes) is the same idea.
- **Names that make you think** (ch. 1): "cute or clever names, marketing-induced names,
  company-specific names, and unfamiliar technical names". **Rule idea:** invented feature names
  in navigation and headings.
- **Taglines** (ch. 7, pp. 103–105): "Good taglines are clear and informative. Bad taglines are
  vague." "Six to eight words seem to be long enough"; "Good taglines convey differentiation and a
  clear benefit. Bad taglines sound generic." "Don't confuse a tagline with a motto" ("We bring
  good things to life"): "Mottoes are lofty and reassuring, but if I don't know what the thing is,
  a motto isn't going to tell me." Clever only "if the cleverness helps convey—not obscure—the
  benefit". **Rule idea:** a tagline that names no product, user or benefit (a motto); length
  outside about 4–10 words. Attentry's own ("Your AI writes the code. Attentry checks it, without
  AI.") passes: it says what it is, for whom, and how it differs.
- **The welcome blurb** (p. 102): "a terse description of the site … visible without scrolling".
  **Direction.**

## Rob Fitzpatrick, *The Mom Test*

(Ebook; "eb" = page as extracted, 124 in all. About customer interviews; it matters for copy in
two ways: where real customer words come from, and its taxonomy of empty statements.)

- **The Mom Test** (eb 13): "1. Talk about their life instead of your idea 2. Ask about specifics
  in the past instead of generics or opinions about the future 3. Talk less and listen more."
  **Direction:** the source of honest copy is what users actually did and said, gathered this way
  (with Handley's "spend time with your customers").
- **Fluff comes in three shapes** (eb 29): "Generic claims ('I usually', 'I always', 'I never');
  Future-tense promises ('I would', 'I will'); Hypothetical maybes ('I might', 'I could')".
  **Rule idea:** the same three shapes in product copy: generic claims (*always fast*, *never
  breaks*), future promises (*will transform your workflow*), hypotheticals (*can help you*,
  *could save hours*). Flag copy where most claims are future or hypothetical and none are
  present facts.
- **Compliments are fool's gold** (eb 29): "shiny, distracting, and entirely worthless"; "There's
  more reliable information in a 'meh' than a 'Wow!'" (eb 45). **Context:** testimonials that are
  pure praise (*Amazing tool!*) carry less than a specific one (*caught a missing auth check on my
  second day*).
- **Opinions and the future** (eb 16): "Opinions are worthless"; "Anything involving the future is
  an over-optimistic lie." **Context** for the future-promise rule.
- **Segments are who–where pairs** (eb 100): if problems aren't consistent, the segment isn't
  specific enough. **Direction:** copy for a specific reader (Attentry: people building with
  Claude Code or Codex) beats copy for "developers".

---

## Illustration books (read 2026-11-24, two passes)

For attentry-design-illustration.md. Same legend: **Rule idea**, **Direction**, **Context**.

## Molly Bang, *Picture This: How Pictures Work*

(Ebook; "eb" = page as extracted, 42 in all. Twelve numbered principles, each derived from how we
react to the physical world.)

- **Shape orientation** (principles 1–3, eb 18–19): "Smooth, flat, horizontal shapes give us a
  sense of stability and calm"; "Vertical shapes are more exciting and more active"; "Diagonal
  shapes are dynamic because they imply motion or tension." Parallel, same-size shapes in motion
  were "quite boring and heavy" until she varied their size (eb 20). **Direction:** pick the
  dominant orientation for the feeling wanted. **Rule idea:** dominant line orientation measurable
  from edges; flag an "energetic" scene built only of horizontals and verticals.
- **Top and bottom** (principle 4, eb 20): "The upper half of a picture is a place of freedom,
  happiness, and power"; low placement reads as threatened or sad. **Direction.**
- **The center traps the eye** (principle 5, eb 22–23): "The center of the page is the most
  effective 'center of attention' … it is difficult to take our eyes from the center". Moving the
  focus off center makes "the picture … more dynamic". "Artists seldom place their figures in the
  exact center of the page unless that figure is meant to be an object of meditation." The closer
  something is to an edge or the center, the greater the tension. **Rule idea:** the centered-
  subject rule (Goree measured AI art's default center) now has the designer's reason: dead
  center means stillness, which is right for an icon and wrong for a scene.
- **Light and dark backgrounds** (principle 6, eb 24): light feels safer, dark unknown and
  threatening; "Bright and pale colors glow like jewels against dark backgrounds. Against white or
  pale backgrounds, bright colors often look washed out." **Context:** for the AI-is-dark finding
  (median brightness 50 against pros' 238): a dark default carries a mood whether intended or not.
- **Points and curves** (principle 7, eb 25): "We feel more scared looking at pointed shapes; we
  feel more secure or comforted looking at rounded shapes or curves." **Direction.**
- **Size is strength** (principle 8, eb 25): "The larger an object is in a picture, the stronger
  it feels." **Direction:** with Mateu-Mestre's big, medium, small.
- **Color groups before shape** (principle 9, eb 26): "We associate the same or similar colors
  much more strongly than we associate the same or similar shapes." Color symbolism "is based on a
  false generalization. And it works—very, very well." **Rule idea:** an accent color shared by
  unrelated elements creates a false link; the subject's color shouldn't repeat on background
  clutter.
- **Neither perfect order nor chaos** (principle 10, eb 27): "'perfect' regularity—continual,
  relentless repetition—is perhaps even more horrifying in its monotony than randomness … It
  implies a cold, unfeeling, mechanical quality … Such perfect order does not exist in nature."
  "In a picture—as in any art form—true Order and true Chaos are anathema." **Rule idea:**
  supports both the "too smooth / too perfect" rule (Goree) and the repeated-element rule
  (Gilland): perfect symmetry and identical repeats read as mechanical.
- **Contrast enables seeing** (principle 11, eb 27). **Context:** with the strongest-contrast-on-
  the-subject rule.
- **Space between shapes** (principle 12, eb 28): space isolates a figure, "both free and
  vulnerable"; overlap joins shapes into one unit; depth comes from progressively smaller,
  lighter shapes set higher, with gaps shrinking geometrically, not by a fixed amount. "Space
  implies time." **Rule idea:** a crowded frame with no separating space (with Shaw's negative
  space); depth faked with evenly spaced layers reads flat.
- **Context and story override** (eb 21–22): each principle works in combination and is
  "subservient to context and content". **Context:** these are tendencies, so any rule built on
  them is a suggestion.

## Edgar Payne, *Composition of Outdoor Painting* (1941; 7th ed.)

- **Fifteen composition types** (ch. III, contents): the steelyard, the balance scale, the
  O or circle, the S or compound curve, the pyramid or triangle, the cross, the radiating or
  converging line, the ell, the suspended steelyard, the three spot, group mass, the diagonal, the
  tunnel, the silhouette, the pattern. Most good pictures combine two or three (his captions
  analyze each plate this way). **Direction:** name a composition type before drawing; the AI
  default (subject center, thirds bands) is only one of fifteen, and not one Payne lists.
- **The steelyard** (p. 36): the largest mass on one side, the second on the other, the third
  near the fulcrum: unequal masses balanced, not centered. **Direction.**
- **Avoid equal spacing; the center is a dead spot** (p. 38): guide lines are drawn "to prevent
  equal spacing of the masses"; the center is "a place or a 'dead spot' around which all parts
  revolve, through [sic] each part is located at various distances from the exact canvas center." Even
  trees spaced evenly in nature should be adjusted (pp. 49–50: "alter shadows or other forms to
  prevent equal spacing or monotonous repetition"). **Rule idea:** equal spacing of masses or
  bands, and the subject at the exact center; Goree's "almost perfectly into thirds" is equal
  spacing by another name.
- **Horizon anywhere but the center** (p. 71): "the painter may place his horizon at almost any
  place except the center"; with a clouded sky "the horizon should be low" (p. 35); for mountains,
  their top near the upper edge and the horizon low (p. 49). **Rule idea:** a horizon line at the
  vertical middle of the frame.
- **Variety against monotony** (p. 104): "if masses are similar in size, color and values, have
  too much sameness and monotony, the opposite of artistic quality will be the result. Variety and
  contrasts are needed to balance evenness". **Rule idea:** masses of near-equal size and value
  (with Bang's principle 10 and Mateu-Mestre's big, medium, small).
- **A centered pyramid is too stable** (p. 115): "If a true pyramid is placed near the center of
  the canvas and the forms are rather close-knit or solid, it is likely to have too much
  stability." **Context:** the AI centered subject in another form.
- **Light and sun direction shape the arrangement** (p. 30): with a low sun to the side, light
  and dark split into equal areas and are harder to arrange; looking toward or partly away from
  the sun gives better masses. **Direction.**
- **The qualities a painting needs** (p. 7): "nobility in its concept, variety, rhythm,
  repetition, unity, balance and harmony in its composition". Unity is the aim: "Creating
  pictorial unity and creating a fine painting is one and the same thing" (foreword).
  **Context.**

## Andrew Loomis, *Creative Illustration* (1947)

(Scanned; read from OCR. Pages are the printed folios. Seven parts: line, tone, color, telling the
story, creating ideas, fields, experiment. Loomis worked from photographs and warns throughout
against what copying them does; most of those warnings fit AI images better than photos.)

- **One light, consistent** (p. 22): "All forms within your picture should appear to be lighted by
  the same source and be lighted consistently with one another." Several sources make "the values
  become a hodgepodge of middle tones, highlights, and accents". "It cannot be faked. … Faked
  lighting breaks down every other good quality." And: "no area in the shadow can be as light as
  the areas in the light." **Rule idea:** the strongest one for illustration. Shadow regions
  brighter than lit regions, or highlights on opposite sides of neighbouring objects (with
  Goree's inconsistent light).
- **Design over subject** (p. 23): "The design makes the picture, not the subject or material."
  "The best pictures run to a few simple values." **Context.**
- **Hard edges all round stick to the page** (p. 23): "If the edge is kept hard all around, it
  cannot avoid sticking to the picture plane, losing the feeling of space". The cut-out version
  (p. 202): the subject "gets a 'pasted on' look"; "A 'scissors' type of edge has no place in
  art." **Rule idea:** uniform edge sharpness along a subject's whole outline; the pasted-on
  subject of AI composites.
- **Variety of spaces** (p. 34): "About the only rule is that we give the greatest variety of
  spaces possible, no two duplicating one another in size or shape"; "If two forms are equal, let
  one overlap the other". "Variety is the spice of composition." **Rule idea:** same as Payne's
  equal spacing: near-equal masses and gaps.
- **His own subdivision** (pp. 36, 39): divide the frame with one line, "best to avoid placing the
  line at a point which would be one-half, one-third, or one-fourth"; diagonals then give spaces
  where no two are duplicates. **Context:** he avoids even the thirds, so a thirds check must not
  reward thirds placement as good.
- **One horizon, one eye level** (pp. 41–42): "No picture can have more than one horizon." The
  fault shows "when the artist has obviously worked from two clippings or photos, each having a
  different eye level"; the horizon "must so cut across all other figures". **Rule idea:**
  vanishing lines that meet at different heights; figures on one floor whose heads cross the
  horizon at different body heights. The composited AI image is exactly the two-clippings case.
- **Eye level as a choice** (p. 45): "Too often ordinary pictures are ordinary because no thought
  has been given to an eye level." **Context:** the AI default is the eye-level, straight-on view.
- **Focal point** (p. 46, hand-lettered): never place the focal point exactly in the center;
  every good picture should have a main focal point and all lines should draw the eye toward that
  spot. Eye path (p. 47): the eye enters at the bottom and leaves at the top, never at the sides,
  and lines leading out are stopped. **Rule idea:** centered focal point (with Bang principle 5
  and Payne's dead spot).
- **Bad composition list** (p. 51, hand-lettered "Bad composition brings negative response"): too
  centered, straight-front pose, two things too alike and equal, pointing out of the picture, a
  line splitting a head, a picture edge that coincides with a line in the picture, two eye paths.
  **Rule idea:** several are measurable: subject centered, frame edge tangent to a strong line,
  line through a head, two equal subjects.
- **Line and feeling** (p. 50): horizontals for repose, verticals for dignity and strength,
  obliques for combat and confusion, radiation for shock and attention. **Direction** (as Bang).
- **Four tonal plans** (pp. 88–90): build in four values (white, light grey, dark grey, black),
  one as the field and three against it. "More pictures are bad because no attempt at tone
  organization has been made than for any other reason." A strewn room is littered "with contrasts
  or confusion of tone"; "the simpler the presentation of a subject, the better it will be
  pictorially." **Rule idea:** too many value clusters; contrast spread evenly with no dominant
  tone (a value histogram check).
- **Without a plan, every picture alike** (p. 91): "Without the tonal plan you will find yourself
  falling into the bad habit of making most of your pictures alike". **Context:** the sameness
  across a brand's AI images.
- **Figure in the dead center** (p. 99): a figure "in the dead center of white space and filling
  almost from top to bottom", background added after: "Naturally as a design it's going to be a
  dud." "The creativeness is in the planning, pure and simple; the rest is good carpenter work."
  **Context:** this is the AI hero image, described in 1947.
- **Everything equally sharp** (pp. 100–101): "A round form can be so smoothed in gradation of
  tone that it loses all character." "Definition will never be the basis of art, but rather
  selection, accentuation, subordination." "Making all things through your picture equally
  important is like playing all the notes of a composition with monotonous and equal intensity".
  Detail far back flattens the picture: "To add detail we could not see is as false as to define
  contours we cannot see"; "surface detail should become submerged in tone as it goes back."
  **Rule idea:** detail and edge sharpness that do not fall off with depth or with distance from
  the focal point (high-frequency energy spread evenly across the frame).
- **Lost and found edges** (p. 102): a balance of sharpness and softness, "neither all hard or all
  woolly". **Rule idea:** with the edge rule above.
- **Smoothness is what marks a photo** (p. 108): "One of the main things that identify a photo as a
  photo is the ultra-smoothness of the tones." Areas painted "too flat and smooth" look "tinny"; an
  area "should always look painted, not pasted". **Rule idea:** Goree's too-smooth finding, from
  a working illustrator. Low texture variance inside large regions.
- **Mixing light into shadow makes mud** (pp. 152–153): "We cannot just rub the light and shadow
  together and produce anything but dull color." "Keep your color most intense on the edges of
  the lighted areas, where it merges into shadow." "No color in shadow can have brighter color
  intensity than the same color would have in the light." **Rule idea:** shadow regions more
  saturated than the lit side of the same object.
- **Nature is grey** (p. 153): "Most of the visual color of nature, we find, is not pure color."
  "Since nature is largely grey, don't be afraid of nature's greys." **Rule idea:** saturation
  high across most of the frame.
- **Restriction makes color** (pp. 154, 162–163): "It is natural to assume that the picture
  containing the largest number of colors will be the brightest picture. Unfortunately, color does
  not work out that way." "The most colorful and beautiful paintings often come from the
  restriction of color, rather than the profuse application of it." "You cannot make a subject
  colorful by using all pure color". And "It is values and tonal relationships that spoil more
  color than anything else." **Context.**
- **When the picture is dead in color** (p. 168): "When your picture is dead or unpleasant, the
  fault is usually too much raw unrelated color, rather than not enough." Remedy: "See that all
  three primaries do not appear in their raw state within the same picture." **Rule idea:**
  saturated red, yellow and blue all present at full strength; too many hue clusters.
- **Light should match the setting** (p. 170): outdoors, warm lights and cool shadows; indoors by
  north light, the reverse. "A night subject with airy, light, and transparent shadows is most
  unconvincing and false." **Rule idea:** a night scene with lifted shadows (low contrast in a dark
  key).
- **Bad color is out of place** (p. 174): "Color that is bad is usually only 'out of place.'"
  "Anything becomes obnoxious when too completely dissociated from its environment." **Context.**
- **Don't accept the first idea** (p. 179): "The first thing we think is likely to be just about
  whatever everybody else would think of. To tell it differently, don't accept the obvious thing
  immediately." **Context:** the generator's output is, by construction, the first thing
  everybody would think of.
- **Naturalness, not overacting** (p. 195): "Only naturalness can carry conviction". "Overacting
  is worse than not enough. Agonizing over a trivial matter, or exploding with joy over a
  toothpaste, is just not natural or in good taste". "Nothing falls so flat as an artificial
  smile" (p. 200). **Rule idea:** exaggerated stock expressions; big smiles on every face.
- **Who looks at the reader** (p. 195): "If the reader is not part of the dramatic action, never
  let a character look directly at him." Direct gaze is for direct appeal only. **Rule idea:**
  every figure looking into the camera in a scene that is not an appeal (a common AI stock pose).
  Staging (p. 180): let figures do natural things, "anything but stiff-necked poses".
- **Faking and imagination** (pp. 204–205): imagine freely, but "He should not attempt to fake the
  effect of light on form." "The answer to faking lies clearly in the simple resolve not to guess
  when you can find out." What matters is "the misstatements, things meant to be right that
  through our ignorance are not." **Direction:** this separates style (free) from errors
  (checkable): hands, text, perspective, light. It is the line between a style finding and an
  error finding.
- **The camera lies too** (p. 194): "There is distortion in the average photo which is not
  obvious, but which, if followed too closely, gives that photographic look to your work."
  **Context.**
- **Tightness** (pp. 116, 120): "Tightness comes from small forms, too much precision, and everything
  filled in to a sharply defined edge everywhere." Breaking smooth curves into flatter planes
  "helps to eliminate the photographic look of painting." **Rule idea:** with the even-sharpness
  rule.
- **Hot skin looks cheap** (p. 293): "Almost any other thing can be too much, a sky too blue, grass
  too green, a dress too yellow ... But not flesh." Commercial artists "have a common habit of
  painting flesh on the 'hot' side"; "It makes much of the cheap-looking art work we see."
  **Rule idea:** skin warmer and more saturated than the scene's light explains (the waxy, orange
  AI skin), measured against the rest of the frame; never a judgment of skin color itself.
- **A rut of similar treatment** (p. 272): "It is very easy to get into a rut with too much
  similarity of treatment." **Context:** with the tonal-plan warning on p. 91.
- **Trite subjects** (p. 273): "If the subject is trite or a bit hackneyed, there is always design,
  spotting and color, types and accessories." "Originality is not dealing with facts alone, but
  building things reasonable out of the facts." **Context.**

## James Gurney, *Imaginative Realism: How to Paint What Doesn't Exist* (2009)

(Scanned; read from OCR. Pages are the printed folios. Gurney is the one author here who writes
about digital rendering and about eye-tracking data, so his book both supports and corrects the
older composition rules.)

- **Search results are other people's notions** (Introduction): images "on an Internet search ...
  are just other peoples notions of what your scene should look like." **Context:** the
  generator's output is the same thing at scale.
- **Middle value mumbling** (p. 156): "Most paintings suffer from middle value mumbling, the
  tendency to paint everything in the middle of the tonal range." **Rule idea:** a value
  histogram bunched in the middle with no real darks or lights (the reverse of Goree's
  high-contrast finding; check both ends).
- **Silhouette** (p. 158): the most important part of the pose, often the hands or the face,
  "should be brought into the silhouette rather than embedded inside the pose". **Direction.**
- **Make it simple** (p. 162): "If you want to make your composition memorable, make it simple."
  "Busy pictures with lots of little separate shapes have less impact." Join neighbouring shapes
  of similar value into larger ones (shapewelding). **Rule idea:** with Loomis's tonal plans:
  many small, separate value shapes.
- **The windmill principle** (pp. 166–167): vary the four relations along a form's edge (light on
  dark, dark on light, light on light, dark on dark) to "avoid the pasted-on look that happens if
  you don't concentrate on losing some edges and accentuating others." "The whole silhouette is
  not equally interesting or relevant to the story, and you might as well let parts of it
  disappear." **Rule idea:** a subject whose whole outline has the same contrast against the
  background (with Loomis's hard edges all round).
- **What eye-tracking shows** (p. 169): "The eye does not necessarily flow in curves or circles,
  nor does it follow contours. It leaps from one point of interest to another." Two people do not
  scan the same picture along the same route. And (p. 171): "Abstract design gets trumped by human
  narrative": faces draw almost everyone's attention. **Direction:** a correction to Loomis's eye
  path. Do not build rules on lines leading the eye; do build them on where faces and contrast
  sit.
- **Clustering against even spacing** (p. 174): a discarded sketch "suffers from a lack of
  clustering. The figures are spaced out evenly, each silhouette is separate from the others, and
  the heads are spaced well apart." "I have to fight the instinct to line up the toy soldiers,
  spread them out on the table, give everything equal importance, and define every edge in the
  same way." **Rule idea:** the clearest statement of the even-spacing rule (with Payne and
  Loomis): figure or head centers spaced at near-equal intervals, no overlaps.
- **Flagging the head** (p. 175): a light shape behind the main character's head; "Empty space
  around a face gives it a chance to breathe." Background suggests information "rather than
  delineating it". **Direction.**
- **Restraint over violent action** (p. 178): Pyle's advice that "to put figures in violent action
  is theatrical and not dramatic"; "in deep emotion there is a certain dignity and restraint of
  action which is more expressive." **Context:** with Loomis on overacting.
- **One light, even across composited parts** (pp. 73, 182): when photographing props for a
  composite he kept the same lighting on each and photographed a ruler beside them for scale; a
  cutaway "can be lit with a single, consistent light source." **Rule idea:** supports the
  lighting check; scale mismatch between parts is a second check.
- **Too pristine** (p. 136): "In both digital and painted renderings, surfaces usually come out
  looking pristine and new, so adding these qualities takes deliberate effort." Early science
  fiction showed "a world where everything was in neat, new condition and with a uniform style."
  **Rule idea:** uniformly clean, new surfaces with no wear (with Goree's too smooth and Loomis's
  ultra-smooth tones).
- **Not everyone is busy** (p. 54): "paintings of work scenes show everyone looking too earnest
  and industrious. In real life, some of the laborers must have been standing around doing
  nothing." **Rule idea:** every figure in a group performing the same eager action (the stock
  photo team).
- **The setting defines the person** (p. 72): the environment "should be unique and defining."
  **Context:** against the generic office or gradient background.
- **Capture the epic, not the incident** (p. 55). **Direction.**
- **It would never work** (p. 138): a fire-engine designer's verdict on his sketch was "Very nice
  ... but it would never work", followed by a list of mechanical faults. **Context:** invented
  machines must be plausible; the AI version is the device that cannot function (with Loomis's
  misstatements).
- **Not derivative** (pp. 14, 74): copy several artists side by side so as not to become
  derivative; for a Rockwell-like subject he "closed all my books on him" to find answers in real
  life. **Context.**
- **Many thumbnails** (pp. 30–31): Pyle liked fifty thumbnails per illustration; keep "a mental
  attitude of disinterest, detachment, and restlessness, always ready to try something else
  before getting married to one idea." **Context:** with Loomis's first idea.
- **Photodependent** (p. 64): the word "describes a painting with an unwanted
  photographic look." "Photos are a big help, but you can't take them too literally"; "Every photo
  is just a starting place". **Context:** Gurney's name for what AI images share with copied
  photos.
- **Forget about style** (p. 210): paint "with as few mannerisms and conventions as possible.
  Those stylistic mannerisms will make your pictures look dated in the future". **Context:** the
  house styles of image generators are mannerisms in this sense, and they date quickly.

---

## What the copy and illustration books change

All fifteen books predate today's image and text generators (the newest edition here is Bang's,
from 2016).
Linking what they describe to AI output is my reading, not theirs. What
they add is a craft reason for each rule: the rules in attentry-design-copy.md and
attentry-design-illustration.md came from AI-detection research, and the books show that every one
of those habits was named as a fault long before chatbots. That matters for the "not a detector"
promise: a finding can cite an editor or an illustrator, not a guess about who made the thing.

1. **Copy: the existing rules now have craft grounding.**
   - Vocabulary and puffery: Klinkenborg calls "robust" and "vibrant" empty modifiers (eb 142);
     Handley's buzzwords are fine "used sparingly" and "toxic" in numbers (Rule 29), the same
     density idea as Wikipedia's; Zinsser's fad words include "prioritize" (p. 16); Heath shows
     overuse emptying "unique" (eb 164–166); Krug's "happy talk" is self-praise without the facts
     (p. 46).
   - The participle tail: Klinkenborg's over-signifying (eb 111–114) and Williams's misused free
     modifiers (Lesson 8).
   - Uniform rhythm: Williams gives thresholds (all over 30 words or all under 15, Lesson 9);
     Klinkenborg adds repeated sentence structure as a second measure (eb 77); Strunk's Rule 14 is
     the same fault in 1918.
   - Repeated contrasts and triads: "used to excess, these patterns can seem merely clever"
     (Williams, Lesson 9); they are "tying your hands" (Klinkenborg, eb 109).
   - No specifics: Hopkins's before-and-after claims ("Actual figures are not generally
     discounted", pp. 23–24), Heath's concreteness (ch. 3), Lamott's details (eb 22).
2. **Copy: new rule ideas.**
   - **The swap test** (Handley, Rule 42): a sentence that stays true with a competitor's name in
     it. Approximated by sentences with no product-specific noun, number or name.
   - **Nominalization patterns** (Williams's five, Lesson 3) and **noun stacks** (Zinsser,
     pp. 76–77). Reinhart et al. measured the nominalizations at 1.5–2 times the human rate.
   - **Unsupported superlatives** (Hopkins pp. 23–24, Zinsser p. 78).
   - **Counterfeit persuasion** (Cialdini, ch. 4, 6, 7): social proof with no number or source,
     authority with no named expert, award or study, and scarcity or urgency language. For a free,
     open-source tool, scarcity is always counterfeit.
   - **Fluff shapes** (Fitzpatrick, eb 29): copy whose claims are mostly future promises or
     hypotheticals (*will transform*, *can help*), with no present facts.
   - **Sentence-initial connectives in density** ("Moreover,", "Additionally,", "Indeed,";
     Klinkenborg eb 96–97).
   - **Metadiscourse**: announced topics and attributed observations (Williams, Lesson 7).
   - **Redundant pairs and categories, wordy phrases** (Williams Lesson 7, Strunk Rule 13,
     Zinsser ch. 2–3, Handley Rule 13).
   - **"We" against "you"** on product pages (Handley, Rule 12).
   - **Moralizing openers** ("Don't forget…", "Always remember to…"; Handley, Rule 40).
   - **Running starts**: an opening with no claim, number or name (Handley Rule 15; Zinsser's
     lead, p. 55).
   - **Motto taglines**: a tagline that names no product, user or benefit (Krug, pp. 103–105).
   - **Exclamation points and little qualifiers** (Zinsser, pp. 71–72).
   - **The missing actor**: the company vanishes from sentences about mistakes (Williams,
     Lesson 12). A context check, for honesty rather than style.
3. **Copy: corrections.**
   - **Don't flag the passive.** Williams lists its proper uses (Lesson 4), and AI copy uses the
     agentless passive less than people do (Reinhart et al.). The fault is nominalization.
   - **"Not X but Y" is legitimate once** (Strunk, Rule 12: "Not charity, but simple justice").
     Only the reflex counts.
   - **Topic sentences**: Williams wants a stated point up front (Lessons 10–11); Klinkenborg
     calls announcing sentences scaffolding (eb 25–28). Both rule out a sentence that only
     announces. A point sentence must carry content itself.
   - **The draft problem is reversed** (Lamott, eb 24, 36): AI copy is a polished first draft with
     nothing true in it. The direction must ask for facts first, not for polish.
4. **Illustration: four sources now agree on the main rules.**
   - **Centered subject**: Bang's principle 5 (eb 22–23), Payne's dead spot (p. 38), Loomis's
     "dud" figure in the dead center (p. 99) and focal point never at the center (p. 46), and
     Goree's measurement.
   - **Even spacing and equal masses**: Payne (pp. 38, 104), Loomis's "greatest variety of spaces"
     (p. 34) and Gurney's clustering (p. 174: "line up the toy soldiers … give everything equal
     importance").
   - **Too smooth, too clean**: Loomis's "ultra-smoothness of the tones" as what marks a photo
     (p. 108), Gurney's "pristine and new" digital surfaces (p. 136), Bang's mechanical "perfect
     order" (principle 10).
5. **Illustration: new rule ideas.**
   - **Lighting consistency, made concrete** (Loomis p. 22): no shadow region lighter than a lit
     region; one source for every element; shadow color never more saturated than the same color
     in light (pp. 152–153). Gurney keeps one lighting setup across every photographed part of a
     composite (p. 73).
   - **Even sharpness**: detail and edge sharpness that don't fall off with depth or with distance
     from the focal point (Loomis pp. 100–101, 116); a subject with the same hard edge all round,
     the pasted-on look (Loomis pp. 23, 202; Gurney's windmill principle, pp. 166–167).
   - **Values at both ends**: too many value groups, with contrast scattered (Loomis's four tonal
     plans, pp. 88–90) or bunched in the middle (Gurney's "middle value mumbling", p. 156). A
     histogram check in both directions.
   - **Raw color**: all three primaries at full strength in one picture, or too many hue clusters
     (Loomis p. 168); skin pushed hotter than the scene's light explains (Loomis p. 293), judged
     against the rest of the frame, never against a standard skin color.
   - **Two eye levels**: vanishing lines meeting at different heights, figures on one floor cut by
     the horizon at different body heights (Loomis pp. 41–42). A composite made of parts with
     different camera heights is the classic case.
   - **Figures**: everyone looking into the camera in a scene that isn't a direct appeal (Loomis
     p. 195); big expressions over small matters (Loomis pp. 195, 200; Pyle via Gurney p. 178);
     every figure doing the same eager task (Gurney p. 54).
   - **Night scenes with lifted shadows** (Loomis p. 170).
6. **Illustration: corrections.**
   - **Don't reward thirds.** Payne's fifteen composition types don't include the thirds grid, and
     Loomis avoids even the one-third point when dividing a frame (p. 36). A check can flag the
     center and the exact thirds bands, but must never score thirds placement as "good".
   - **Don't build rules on leading the eye.** Loomis's eye-path rules (p. 47) don't hold up under
     Gurney's eye-tracking data: the eye leaps between points of interest, two viewers take
     different routes, and faces win over abstract design (pp. 169–171). Rules about where faces
     and the strongest contrast sit are sound; rules about line paths are not.
   - **Errors and style are different findings.** Loomis's line between faking and imagination
     (pp. 204–205): style is free, but "the misstatements, things meant to be right that through our
     ignorance are not" can be checked. Light, perspective, hands, lettering and machines that
     couldn't work are errors; centered subjects, smoothness and palettes are defaults. Reports
     should keep the two apart and phrase the second kind as suggestions.
7. **Limits.** Most of what these books teach is direction (what to ask for), not a check. The
   rule ideas above are the measurable part. Each still needs fixtures it must flag and must not
   flag, and a run against the baseline before it ships.
