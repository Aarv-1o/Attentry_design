# Attentry Design: direction, not only checks (draft idea, 2026-11-19)

## The problem the user named

Asked for "a dragon flying over the sky in pixel art", an agent builds exactly that: a dragon, a
sky, wings flapping. It misses what a director sees at once: the wings push air, so the water
below ripples; the water mirrors the dragon, broken by those ripples; spray lifts on the strongest
beat. Nobody asked for those, so the agent never thought of them.

That's the gap. The rules (docs/attentry-design-rules.md) catch what's wrong. They can't add what's
missing. A good video needs both: craft that isn't broken, and direction that makes it feel alive.

The same thing happened with the Attentry site: the awesome-design-md library (a DESIGN.md per
brand: colors, type, spacing, mood, written for agents) gave the agent a direction to start from,
and the user's eye added the improvements on top. Attentry Design should bring that eye to video.

## Why agents miss it

- **They do what's asked, literally.** The request names the subject; the consequences of the
  subject (light, shadow, reflection, air, sound) aren't in the words, so they aren't in the video.
- **They think in objects, not in causes.** "A fire" becomes an orange shape that flickers, not a
  light source that changes everything around it.
- **Nothing outside the agent asks "and what does that cause?"** That's the director's question.

## The idea: direction cards

Like a DESIGN.md per brand, a **card per element** the scene contains, written from the books and
from how the real world behaves. Each card says what the element *causes* and how to show it,
with numbers where they exist. No AI: the cards are written by people, picked by matching the
scene's elements, and grow with use, like the rules.

When the agent gets a request or writes a storyboard, Attentry Design reads which elements are in
it and gives the agent the cards, including what happens **between** elements (fire + night,
wings + water, sun + water).

### Example 1: a dragon flying over water (pixel art)

- **Wings → air.** Each down-beat pushes air down. On water: a ring of ripples under the dragon on
  every down-beat, spreading and fading over about 1 s; stronger and closer when it flies low.
  Over clouds: wisps pushed aside.
- **Water → reflection.** The water mirrors the dragon upside down, a little darker and less
  saturated, and broken into stripes where the ripples are. The reflection moves with the dragon
  and shrinks as it climbs.
- **The climax beat.** On the strongest flap, spray: a few pixels flung up, falling back by
  gravity.
- **Light.** Pick where the sun is. The dragon's top edge gets the light color, its belly the
  shadow; its shadow on the water sits opposite the sun.
- **Pixel-art consistency.** Ripples, spray and reflection use the same palette and the same
  stepped frame rate as the dragon. Smooth effects on stepped sprites break the style.

### Example 2: a campsite with a fire at night

- **Fire → light.** The fire is the light source of the whole scene. Light falls off fast with
  distance (inverse square): bright within about 1–2 tent-lengths, a warm glow beyond, dark at the
  edges. Faces and tents are lit on the side facing the fire only.
- **Fire → shadows.** Long shadows pointing away from the fire, flickering with it.
- **Flicker.** Irregular, not a steady pulse: brightness wobbles a little several times a second,
  with an occasional bigger flare. The glow on the ground flickers with the flames, in sync.
- **Warm against cool.** The firelight is warm (orange); everything the fire doesn't reach is cool
  night blue. That contrast is what makes it feel like night (Block: contrast of color).
- **Smoke.** A little, thin, rising and widening, drifting with the wind; greyer and fading as it
  rises. Embers: a few sparks floating up and dying out.
- **Text that fits.** Warm, calm type (a serif or a soft rounded sans), placed in the dark
  negative space, not over the fire; lit in the firelight's color, or cool white if it should feel
  like a distance. It appears slowly, like the scene breathes, not with a snap.

### What the agent hears (sketch)

> Your scene has **fire at night**. Direction: the fire lights the scene (bright close, warm glow
> at 1–2 tent-lengths, dark beyond); tents and faces lit on the fire side only; long shadows away
> from it, flickering in sync; warm firelight against cool night blue; thin smoke drifting with
> the wind; a few embers. Put the text in the dark space, in a warm calm face.

## Where it fits in Attentry's moments

| Moment | Code (today) | Design: direction | Design: checks |
|---|---|---|---|
| With the request | Code that already exists | **Direction cards for the scene's elements** | |
| Storyboard / plan | `check_plan` | **What the plan forgot** (fire but no light on the tents, water but no reflection) | |
| After an edit | Problems added | | Craft rules on the source |
| Check-in / render | Tests | **Did the direction happen?** (is it brighter near the fire, is there a reflection) | Craft rules on frames |

So Attentry Design has two halves: **direction before** (what to add) and **checks after** (what
went wrong, and whether the direction made it in).

## Honest limits

- The cards cover common elements (light sources, water, sky, weather, fire, smoke, wind, people,
  text). An element with no card gets no direction, and the tool says so.
- Cards give physics and craft, not taste. They say where firelight goes, not whether the video
  is moving. The person's eye still decides; the cards make sure the obvious isn't missed.
- Some checks after render are rough (is it brighter near the fire: yes; is the smoke beautiful:
  no).

## Test: with and without the cards (2026-11-19)

Cards: docs/attentry-design-cards.md (sun, night, fire, lamp, smoke, embers, wind, wings, water,
ripples, rain/snow/fog, shadows, pixel art, text in a scene, and a table of pairs).
Code: experiments/direction in this repo (its own Remotion entry). Renders in
`out/`: DragonPlain, DragonDirected, CampPlain, CampDirected, plus side-by-side Dragon-compare and
Camp-compare (plain left, directed right).

**Prompt 1: "a 4 s pixel-art dragon flying over a lake at sunset".**
Plain: sunset sky, sun, hills, clouds, a flapping dragon with a bob, a flat lake with a few lines.
Directed added, each from a card or pair:
- the lake mirrors the sky, sun, hills and the dragon, broken into dashes by small waves (anything
  above water)
- a flickering glitter path under the sun (low sun + water)
- a ring of ripples under every down-beat, a bigger ring and spray on the strongest beat (wings +
  water)
- a warm rim on the dragon's sun-facing edges (low sun + object)
- clouds lit from below in the sun's color (sun)
- its shadow on the water while it flies low (something flying low)

**Prompt 2: "a 4 s pixel-art campsite at night with a campfire and the text 'Rest here.'".**
Plain: night sky with stars, pines, a tent, a flickering fire, the text centered at the top in a
bold sans-serif.
Directed added:
- a pool of firelight on the ground, falling off with distance, dithered steps, flickering with the
  flames (fire + night)
- the tent lit only on the side facing the fire; its shadow stretching away from the fire (fire,
  shadows)
- lower branches facing the fire catching a little light; a few stars twinkling (fire, night)
- thin smoke drifting with the wind, embers rising and dying out (smoke, embers, wind)
- the text in the dark sky away from the fire, in the fire's warm color, in a pixel font on the same
  grid, revealed slowly through a dither (text in a scene, pixel art)

**What it showed:**

1. **The cards supplied exactly what the plain version lacked.** Every item above came from a card
   line; none of them were in the prompt, and none of them were in the approach I described before
   the cards existed (no reflection, no ripples, no light falloff).
2. **Cards don't fix execution.** My first directed render had heavy full-width water stripes, an
   unlit tent side, a tree "rim" that read as a stick, and smoke too faint to see. The cards said
   what to add; seeing the frames is what caught how badly it was added. **Both halves are needed:
   direction before, checks after.**
3. **Physics can look wrong.** The dragon's reflection is mirrored about the water under it, so it
   sits as far below that point as the dragon is above it: correct, but it reads as detached. A card
   needs a note like "correct but check it reads; shorten the distance if it doesn't".
4. **The plain text broke the style**: a smooth bold sans-serif over pixel art. That's exactly the
   pixel-art card's first line, and something the craft rules alone wouldn't name.

**Prompt 3: "a 4 s pixel-art plane taking off"** (the user's next request, after liking the
first two). The library had no aircraft cards, so the direction step wrote them first (aircraft
taking off, jet engines, vehicle lights, runways at dusk, speed and the camera, plus pairs), then
built. Plain: a dusk city, a runway, a plane crossing a fixed scene, accelerating, tilting up as one
piece and climbing. Directed added:
- the takeoff order: the nose lifts first, pivoting on the main wheels; then the wheels leave the
  ground; then the gear folds up
- a small runway shake that stops at lift-off
- the camera following the plane (runway and edge lights rushing by, city barely moving, the tower
  in between), then easing to a stop at lift-off so the plane pulls away
- a landing-light wedge on the runway ahead, a blinking red beacon, a wingtip strobe and red
  navigation light, lit cabin windows
- dust blown back while it rolls, heat shimmer behind the engine, its shadow shrinking as it climbs

Again the first render needed a look at the frames: the landing light came out as a grey box
filling the runway; the card says a cone, so it became a wedge that widens and fades.

**What this adds:** a missing card is the normal case, not the exception. The direction step has to
say "no card for aircraft yet" and the library has to grow per scene type, the way the rules grow.

**Limits of this test:** I wrote the cards and made both versions, so it isn't blind. A fairer test:
a fresh agent session makes the plain version from the prompt alone, another makes the directed
version from the prompt plus the cards, and people who don't know which is which pick.

## Next

1. Agree this direction half belongs in Attentry Design.
2. Draft the first cards (about 15: sun, moon, fire, lamp, water, reflection, rain, snow, fog,
   wind, smoke, wings, footsteps on sand or snow, shadows, text in a scene), each from the books and
   real-world references.
3. Try them by hand: make the dragon and the campsite twice, once without cards and once with, and
   compare.
