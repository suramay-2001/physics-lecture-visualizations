---
name: 09-visual-qa
description: Screenshot every beat and reveal of a merged chapter in both tracks, build contact sheets, check print figures, and look for defects tests cannot see — label collisions, raw TeX, readouts that spoil answers. Trigger after every merge (chapter, fix, platform, stage-kind) before the truth review or a BUILD-LOG update.
---

# Visual QA

Pattern (throwaway spec + PIL contact sheets): BUILD-LOG "KT points" #3, #9; `roles-and-gates.md` "Do both".

## When to use
After any merge to main that changes what a reader sees: a chapter build/fix, a stage-kind or platform commit,
a theming change. Visual QA is not optional even when unit tests and e2e are green — it catches a different
class of bug (see Pitfalls).

## Inputs
- The merged, built app (`npm run build`, then a preview server) — never test against stale `dist/`.
- The list of beats/reveals to cover: every beat and every clue's reveal ("Show me"), in **both** tracks for a
  two-track course.

## Steps
1. Write a throwaway `e2e/_qa-*.spec.ts` (never committed) that visits every beat in story order, clicks every
   clue's reveal, and screenshots each state to `e2e/__screens__/<chapter>/` (git-ignored).
2. Build PIL (or equivalent) contact sheets per unit from those screenshots, into the session scratchpad, for a
   fast visual scan.
3. **Read the readouts**, not just the picture: a float residue ("− 0.00i"), a readout that contradicts the
   caption, or a readout that answers a clue's question *before* "Show me" is clicked (a spoiler) are real
   defects that only show up by reading numbers on screen.
4. For a two-track course, repeat for the Formal track — a stage bug can be track-independent but a caption bug
   (e.g. a Formal caption that contradicts its own stage) is track-specific.
5. Check **print figures**: `PrintNotes` → one numbered `<figure>` per stage change; confirm no placeholder
   figure ships silently for a kind that should draw a real one, and no figure prints `NaN`.
6. Confirm 0 console errors across the whole walk.
7. Delete the throwaway spec and its screenshots before committing (they're QA artifacts, not test suite).

## Gates
- Every beat and every reveal, both tracks, screenshotted and read (not just glanced at).
- 0 console errors during the full walk.
- Every print figure has a title and no `NaN`; every SVG-kind figure matches its live stage picture (the SVG
  scene's `mode: 'print'` is meant to BE the stage picture, in print ink).
- Every displayed number in a screenshot matches the text/caption beside it.

## Outputs
- A short list of visual defects (or a clean pass), handed to `06-chapter-review` or directly to `07-chapter-fix`
  if the QA itself finds the issue first.
- BUILD-LOG evidence line: beat count, reveal count, defects found and fixed.

## Pitfalls
- Tests find what eyes miss (a trigger leak, a view that never warms up); eyes find what tests cannot see (an
  offset, a collapsed box, a style collision, a spoiler). A green e2e suite is not a substitute for this pass —
  real bugs have shipped past 100% green suites and were only caught here (L6's Bloch-ball scene, L4's plate
  bug, F1's forward reference).
- Since story navigation shipped, the opener fills the first screen: a QA spec must scroll to a beat before
  checking its stage draws (an unmounted-until-scrolled view otherwise looks broken when it is only unmounted).
- A unit far from the viewport unmounts its stage view; on return it re-warms one frame later — poll rather than
  assert instantly.
- The Browser pane throttles rendering when unfocused and its screenshots can be offset from scroll; front the
  tab before screenshotting, and prefer the gate's own `bench()`/measurement hooks over eyeballing timing.

## Next
`06-chapter-review` (if this QA precedes the truth review) or straight to a BUILD-LOG update if this was a
platform/stage-kind QA pass with no content review pending.
