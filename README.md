# Attentry Design

[Attentry](https://github.com/Aarv-1o/Attentry) checks the code AI agents write. Attentry Design
does the same for the illustrations and videos they make: it steps in when you ask your agent to
design something, makes sure the brief is asked, the options really differ, your choice is kept
and the result has no errors. On your own machine, without another AI model, and it never judges
taste. It starts with SVG/HTML illustration, [Remotion](https://www.remotion.dev) videos and
Claude Code.

**Status: the Claude Code plugin is installable; the editor extension and the store listings come
next.** Five stages: brief, options, lock, finish, card; illustration and video first. It renders
designs, checks whether options really differ, keeps the chosen one as a lock and checks the
result, for SVG/HTML illustrations and Remotion videos.

## Install in Claude Code

Needs Node 22 and Chrome or Edge (it renders designs in the browser you have; nothing else is
downloaded for that).

```
/plugin marketplace add Aarv-1o/Attentry_design
/plugin install attentry-design@attentry-design
```

Then ask for a design, like "an invitation illustration for my sister's wedding". The first time,
the plugin installs the libraries its checks use (sharp, Playwright's driver, tesseract.js with its
English data, about 100 MB): Claude Code does this when the plugin is installed, or the plugin does
it in the background at the start of the next session. The brief works before they're in.

## Two halves

1. **Direction before the render.** When the agent is asked for a scene, it hears what the scene's
   elements cause: a fire lights the ground and throws shadows away from itself, wings over water
   make ripples, text sits in the dark space and holds long enough to read. These are the
   "direction cards".
2. **Checks after the render.** Rules an editor or motion designer applies by eye, made
   measurable: text too small or too low in contrast, text that never holds still, blank frames,
   pace far from what professionals do, no end card on a promo.

The first experiment showed that both are needed: the cards supplied everything a plain version
lacked, and only looking at the frames caught how badly some of it was first drawn.

## What's here

| Path | What it is |
|---|---|
| [src](src) | The engine (step 1): render a design, compare options, lock one, check the result |
| [claude-plugin](claude-plugin) | The Claude Code plugin: the brief hook, the three tools, the design skill |
| [tests](tests) | Tests and fixture designs each check must flag or pass |
| [docs/attentry-design.md](docs/attentry-design.md) | The plan: the five design stages, the first checks, the stack, the order |
| [docs/attentry-design-research.md](docs/attentry-design-research.md) | Why: what goes wrong in AI-made video, what existing tools miss |
| [docs/attentry-design-baseline.md](docs/attentry-design-baseline.md) | 25 gallery videos, 16 AI-made and 15 professional launch videos, measured the same way |
| [docs/attentry-design-rules.md](docs/attentry-design-rules.md) | The first rules (draft), applied by hand to real videos |
| [docs/attentry-design-direction.md](docs/attentry-design-direction.md) | The direction idea and the plain-vs-directed test |
| [docs/attentry-design-cards.md](docs/attentry-design-cards.md) | The direction cards (second draft), with sources |
| [docs/attentry-design-copy.md](docs/attentry-design-copy.md) | Copy that reads like AI: the patterns, the research, rule ideas, direction |
| [docs/attentry-design-illustration.md](docs/attentry-design-illustration.md) | Illustration that looks like AI: the look, why it happens, rule ideas, direction |
| [docs/attentry-design-books.md](docs/attentry-design-books.md) | The reading list |
| [docs/attentry-design-book-notes.md](docs/attentry-design-book-notes.md) | Notes from 40 books on editing, animation, type, color, light, physics, staging, writing, persuasion and illustration, with page references |
| [experiments/direction](experiments/direction) | The test: a dragon over a lake, a campsite at night and a plane taking off, each made plain and with the cards. Renders in `out/` (`*-compare.mp4`: plain left, directed right) |
| [tools](tools) | The scripts used to read scanned books: OCR to text with page markers, and finding a quote's printed page |

## Trying the engine

Needs Node 22 and Chrome or Edge installed.

```
npm install
npm test
node --import tsx src/cli.ts options a.svg b.svg c.svg --out options.png   # do the options really differ?
node --import tsx src/cli.ts lock b.svg --name invitation                   # keep the one picked
node --import tsx src/cli.ts check final.svg --lock invitation              # errors and suggestions
```

HTML designs take `--size 1200x630`. Remotion videos (run inside the Remotion project):

```
node --import tsx path/to/src/cli.ts video-options src/index.ts OptionA OptionB   # storyboards compared
node --import tsx path/to/src/cli.ts video-lock src/index.ts OptionB --name promo
node --import tsx path/to/src/cli.ts video-check src/index.ts Promo --lock promo
```

To try a change inside Claude Code for one session (nothing is installed into your Claude setup):

```
npm run build
claude --plugin-dir path/to/Attentry_design/claude-plugin/attentry-design
```

`npm run build` writes the plugin's two files in `dist/`; commit them with the change (a test
fails when they're out of date).

Then ask for a design, like "an invitation illustration for my sister's wedding".

## Running the experiment

```
npm install
npm run studio                                   # browse the six compositions
npx remotion render experiments/direction/index.ts DragonDirected out.mp4
```

## Tools

`tools/ocr_book.py` turns a scanned PDF into text with one `=== page N ===` block per page
(`pip install rapidocr-onnxruntime pymupdf`). `tools/find_pages.py` prints the printed page number
of quotes in a PDF with a text layer. They're for reading books you own; no book text is in this
repo beyond short quotes in the notes.
