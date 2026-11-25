# Attentry Design

Better illustrations and videos from Claude Code. When you ask it to design something, Attentry
Design makes sure the brief is asked, the options really differ, your choice is kept, and the
finished work has no errors. The checks run on your machine, without AI and without tokens. It
never judges taste: your choices win.

## How it works

1. **Brief.** Ask Claude Code for an illustration or a video. Before drawing, it asks what you
   didn't say (what it's for, the size, the style, the exact words) and gets the words approved.
2. **Options.** It draws 2–5 small options. Attentry Design renders them into one contact sheet
   and checks that they really differ: not all centered, not one palette, not one value plan.
3. **Lock.** You pick one by number. Its style, colors, fonts, size and words are saved as a lock.
4. **Finish.** The full design is checked against the lock and for errors: text contrast, text cut
   off by the edge, colors or fonts outside the lock, text in a video shown too briefly to read.
5. **Card.** Claude Code ends with what was made, what was found and fixed, and what may not work.

Each suggestion names its source: Molly Bang, Andrew Loomis, James Gurney, Jeremy Birn, WCAG and
the other books and guides the checks come from.

## The panel

- **Status:** what's running, with a tip from the books while a render or a video check works.
- **Mode:** Auto picks illustration or video from each request; pin one when the guess is wrong.
- **Setup:** connect Claude Code in one click; see that the libraries and a browser are ready.
- **Locks:** each saved design, with its colors and words. The one in use comes first.

## Needs

- Claude Code
- Chrome or Edge, to render designs (nothing else is downloaded for it)
- Node 22. The first session installs the libraries the checks use, about 100 MB.

Videos are checked for Remotion projects.

Free and open source: [github.com/Aarv-1o/Attentry_design](https://github.com/Aarv-1o/Attentry_design)
