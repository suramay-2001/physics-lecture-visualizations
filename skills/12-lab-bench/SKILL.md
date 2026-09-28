---
name: 12-lab-bench
description: Add a Babylon.js lab bench (an interactive apparatus at /lab) — its own model, presets, store, drag/look controls, frame-time and context budgets, and an independent truth review. Trigger when a course needs a hands-on bench beyond the story stages (e.g. an SG bench, a grapher, an operator lab).
---

# Lab bench — a Babylon bench

Worked examples: `app/src/lab/benches/{sg,grapher,operator}/`; reviews: `docs/roles/audits/{P-sg-review,
P-grapher-review,P-oplab-review}.md`; design: `docs/roles/proposals/{D-lab,W-lab}.md`.

## When to use
A course needs an open-ended, hands-on apparatus (not a scripted story beat) — a bench the learner drives
directly, e.g. tilting a magnet and reading a distribution, editing a function and reading its graph, composing
operators.

## Inputs
- The bench's physical/mathematical model (reuse an existing engine module where possible; a new one goes
  through `11-engine-module` first).
- The apparatus's degrees of freedom (what the learner can drag, type or toggle) and what must be read-only.
- A place in `/lab`'s existing infrastructure (`app/src/lab/`: `LabPage.tsx`, `instrument.ts`, `handle.ts`,
  `axes.ts`) — reuse it rather than duplicating scene plumbing.

## Steps
1. Build the bench's **model + store** first (pure state, engine-backed), independent of any 3D code — the same
   discipline as a story stage: the bench's numbers come from `physics/*`, never from the 3D layer.
2. Build the Babylon **view**: import `engine.pure` with only the texture extensions actually needed (the full
   `Engines/engine` entry drags in 8 texture-loader chunks unnecessarily).
3. Add **drag/look controls** and an editable input path (e.g. an expression field) using the existing safe
   parser (`expr.answerMode.test.ts`'s pattern: no `eval`, tested against adversarial input) — never a typed
   `eval`-based parser.
4. Add **presets** a learner can load, and confirm the bench stays genuinely editable where a plan says so (no
   preset silently at the "answer" position — see `docs/roles/decisions/qc709-pilots.md` ruling 3: an editable
   Try-it bench for a homework-adjacent exploration ships editable, with no worked answer, no plot of the
   optimum, no stated maximum).
5. Wire pause/resize: a hidden r3f/Babylon canvas in `frameloop='demand'` still draws on resize —
   `pauseStageHost`/the bench's own pause must set frameloop to `'never'` when the bench's route is not active.
6. Add e2e: a **leave-and-return** check (StrictMode cancels the first effect before any engine exists, so a
   simple "mount once" check misses a real fresh-canvas bug), and a frame-time self-check.

## Gates
- p95 frame time within budget (existing benches: ≤ 3.0 ms typical, 1.0 ms static GUI; set and test a budget for
  the new bench, don't leave it unmeasured).
- WebGL contexts: exactly the expected count on the bench's route (existing budget: 2 on `/lab` after a lecture,
  1 after leaving, 0 stray Babylon engines) — 0 leaked across route round trips.
- 0 CSP violations, 0 cross-origin requests on the bench's route.
- Right-handed scene consistent with the story stages' camera convention (checked against an existing rotation
  to a known tolerance, not eyeballed).
- An independent truth review (same discipline as `06-chapter-review`): every reading the bench can produce
  re-derived and checked, not just the presets.

## Outputs
- `app/src/lab/benches/<name>/` (model, store, view, controls, presets, tests).
- `docs/roles/audits/P-<name>-review.md`.

## Pitfalls
- Babylon's GUI texture is device-resolution: scale sizes by DPR explicitly — the built-in
  `adjustToEngineHardwareScalingLevel` measured slower in this codebase.
- Babylon arrives by an async import, so StrictMode's first effect is cancelled before any engine exists; test
  the real fresh-canvas path by actually leaving and returning to the route, not by a mount-only test.
- A mesh with inside-out winding is invisible from one camera angle and only becomes visible (and wrong) from
  another — check normals from every shot the bench offers, not just the default one.
- An expression/answer field that runs user input through `eval` (or a home-grown parser that effectively does)
  is a standing security defect class here — always route through the tested safe parser.

## Next
`09-visual-qa` on the bench, both from its default shot and any alternate views; then the truth review above.
