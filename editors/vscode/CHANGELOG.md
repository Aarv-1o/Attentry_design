# Changelog

## 0.1.2

- Reading time in videos is measured, not counted in samples: fades count from half opacity and
  the frames' real times are used (a 3-second caption no longer reads as 2.5 s).
- A video project edited during a session is bundled again; a failed bundle is tried again.
- Preview tools: Claude Code can render a design or video frames just to look at them.
- "Almost touches the edge" names the shape: what it is, its color, which edge and how close.
- Locks no longer list black that nothing paints (a dash's fill, a shape in defs, a use).
- The lock keeps the brief's mood and purpose: a dark mood isn't told to lighten up, and a tribute
  isn't asked for a call to action.

## 0.1.1

- Versions: every check against a lock keeps a numbered version, shown as a branch tree with a
  thumbnail of each; Restore puts one back (Claude Code can too, with restore_version).
- Each lock lists its designs: the versions, the option it was picked from, and the other options.
  Designs open as pictures.
- A project picker, like Attentry's: every folder in the window with designs in it.
- Claude Code gets the render of each finished check, to look at what it made.
- Videos in a Remotion project inside the session's folder are checked (Remotion is found from the
  video's entry file).
- Attentry's look: its colors, pills and tabs.

## 0.1.0

First version.

- Connects Claude Code to Attentry Design: the brief, options, lock, finish and card stages for
  illustrations and Remotion videos.
- The panel: status with tips while a check runs, Auto or pinned mode, setup, and design locks.
