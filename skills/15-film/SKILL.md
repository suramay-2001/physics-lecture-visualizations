---
name: 15-film
description: Build a Motion Canvas film for a chapter opener — its own package, headless render, and a manifest of every drawn number re-checked against the engine. Trigger when a chapter plan's Media section (03-chapter-plan §10.2) names a Motion Canvas film.
---

# Film — Motion Canvas with a manifest check

Reference: `films/README.md`; pipeline: `pipeline/films/{render.ts,encode.sh,check_manifest.ts}`; house rule:
`CLAUDE.md` "Films draw engine data only (a manifest of every drawn number is re-checked against the engine)."

## When to use
A chapter or Part plan names a scroll-scrubbed film (e.g. a chapter opener, a concept animation) beyond what the
Blender pipeline (`16-blender-opener`) or a live stage scene covers.

## Inputs
- The exact numbers/geometry the film must draw, each traceable to an engine call — a film never invents a
  number or shape a resolver couldn't also produce.
- Frame count and target resolution (existing pattern: e.g. 120 frames at a fixed aspect, WebP frames scrubbed
  by `openers/OpenerScrub.tsx`).

## Steps
1. From the repo root: `cd films && npm ci --ignore-scripts` (own `package.json`, exact pins — Motion Canvas
   never enters `app/`'s dependency tree).
2. Write the scene, importing geometry/values from `app/src/physics/**` (or `physics/qc/**`) directly — the
   scene computes nothing physical itself; it only lays out what the engine already returned.
3. **Write the manifest** as the scene renders: every number drawn on screen, with its engine source.
4. `node pipeline/films/render.ts` — starts Vite in-process and drives Motion Canvas's own Renderer in the
   installed Chrome (headless rendering was unverified going in; it was spiked first, not assumed to work).
5. `sh pipeline/films/encode.sh` → PNG → WebP frames under `app/public/films/<course-slug>/<id>/NNNN.webp` +
   poster.
6. `node pipeline/films/check_manifest.ts` — recomputes every manifested number **with the engine**, independent
   of what the render actually drew, and fails if they disagree (this is the film's version of a claim test).
7. Wire it as a chapter's `Unit.opener.film` (widened to a `FilmId`); captions carrying the claims live in the
   course pack (`qc709/films.ts` or equivalent), tested the same way opener captions are.

## Gates
- `check_manifest.ts` passes: every drawn number recomputed by the engine matches.
- A **self-test** exists proving a deliberate mutation of a manifested number fails the check (otherwise the
  check itself might be a no-op).
- Multiple renders of the same scene are byte-identical (determinism), the same discipline as a numpy fixture.
- `@motion-canvas` never appears in any `app/` chunk (`build/chunks.test.ts` rule (j)).
- No PDFs or other build artifacts land under `app/` from the film pipeline.

## Outputs
- `films/<scene>.tsx` (or equivalent) and its render/encode output under `app/public/films/<course-slug>/<id>/`.
- A manifest checked into the films pipeline, and captions in the course's content pack.

## Pitfalls
- Vite's own version constraints matter: this pipeline needed explicit JSX config, core+2d pre-bundled together,
  and the 2D inspector stubbed to run under Vite 8 — don't assume a newer Vite "just works" without re-checking
  the pinned versions in `films/package.json`.
- Motion Canvas draws point lists that round to a coarse grid (e.g. 1/64 px) — geometry must be planned as
  engine point lists, not assumed to render at arbitrary precision.
- The renderer's clock can run one frame ahead of the nominal frame rate; the manifest check compares planned vs
  actual start frames, not just a frame count, to catch this.
- New dev tooling for `films/` (or any pipeline addition) needs the user's OK at install, per the house rule on
  installing anything new.

## Next
Wire the film into the chapter's `Unit.opener`; then `09-visual-qa` to confirm it plays and scrubs correctly.
