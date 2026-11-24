# Attentry Design: notes from the books

What each book gives that a rule could measure, with page references. Short quotes only. Local,
like the other design docs. Started 2026-11-19.

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
