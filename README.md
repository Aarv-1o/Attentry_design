# Attentry Design

[Attentry](https://github.com/Aarv-1o/Attentry) checks the code AI agents write. Attentry Design
will do the same for the videos they make: check them at the moments the agent can still fix
them, on your own machine, without another AI model. It starts with
[Remotion](https://www.remotion.dev) videos and Claude Code.

**Status: research.** Nothing is built yet. This repo holds the research, the plan and the first
experiment. The plan and the first rules are drafts that haven't been agreed yet.

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
| [docs/attentry-design.md](docs/attentry-design.md) | The plan (draft): the moments, the first rules, the stack, the order |
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
