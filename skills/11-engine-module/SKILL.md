---
name: 11-engine-module
description: Add a pure physics/math engine function with an independent numpy twin, deterministic fixtures and property tests. Trigger when a chapter plan's engine-gaps section (03-chapter-plan §9.1) names a computation the engine doesn't have yet.
---

# Engine module — new function + numpy twin

Reference: `skills/course-builder/references/pipeline.md` "Engine and fixtures"; worked example:
`docs/roles/proposals/P-709-map.md` (b) (the full list of new `physics/qc/*` functions by module, with each
one's twin route).

## When to use
A chapter plan's §9.1 lists a function the engine doesn't have, or a Part map's dependency graph shows several
chapters will need the same new engine capability (build it once, at the Part level, before the first chapter
that needs it — `00-course-pipeline` step 3).

## Inputs
- The exact math the function must compute, and the chapters/beats that will call it.
- The course's locked conventions (`BUILD-LOG.md` "Locked decisions"): ħ = 1, S = σ/2, phase convention, rotation
  sign, qubit-0-is-leftmost, |0⟩ ≡ |+z⟩, etc. — a new function must respect these, not invent its own.

## Steps
1. Write the function as a **pure** TypeScript function in `app/src/physics/*.ts` or `physics/qc/*.ts`: no DOM,
   no React, no three.js (`purity.test.ts` / a course's own purity check enforces this).
2. Write its numpy twin in `pipeline/make_fixtures.py` (448) or `pipeline/make_qc_fixtures.py` /
   `pipeline/claims_qc709/<id>.py` (709), using an **independent route** — a different algorithm or library path
   than the engine, not the same formula retyped (e.g. engine multiplies parts by hand and takes powers by
   repeated squaring; the twin uses numpy complex scalars and Python's built-in `complex` power). Agreement is
   then evidence, not the same code checking itself.
3. Run the fixture script; confirm it is **byte-identical** across two runs (determinism — no seed drift, no
   dict-ordering dependence).
4. Add a vitest comparing engine output to the fixture, at 1e-12 tolerance (or the course's stated tolerance).
5. For a module with an invariant (unitarity, ΣK†K = I, no-signalling, a tableau matching a state vector), add a
   **property test** over random inputs, not just one worked example — this is what catches a sign error a
   single fixture would miss.
6. If the function backs a displayed number in content, it needs a `claim()` too (`03-chapter-plan`,
   `docs/patterns/claim-and-numpy-twin.md`) — the engine test and the claim test check different things (engine
   ↔ numpy; displayed number ↔ claim).

## Gates
- Engine ↔ numpy agreement at the stated tolerance, for every new function, on both worked and randomized inputs.
- The numpy script's own output is byte-identical run to run.
- Any locked convention the function touches (phase, sign, basis order) is asserted by name in a test, not just
  implied by a comment.
- A mutation check: deliberately breaking the function (e.g. a wrong sign) fails at least one test — if it
  doesn't, the test suite has a gap, not the function.

## Outputs
- New/edited `app/src/physics/**` (never touched by a chapter-build worktree — this is the one skill allowed to
  edit it) and its `__fixtures__/*.json`.
- Updated `pipeline/make_fixtures.py` / `make_qc_fixtures.py` / `claims_qc709/<id>.py`.
- Property tests for any function carrying a physical invariant.

## Pitfalls
- A twin that reuses the engine's own formula (not an independent route) gives false confidence — the whole
  point is a second, different computation reaching the same number.
- A convention mismatch (e.g. a rotation sign, which qubit is q0) introduced quietly in a new module breaks
  every later bridge or comparison against existing content; test the convention explicitly against an existing
  module (`physics/qc` ties to `physics/spin.ts` by a dedicated bridge test in 709).
- Adding a function under time pressure without its property test "for now" tends to become permanent — write
  the property test in the same commit.

## Next
`10-stage-kind` if the function feeds a new picture; `05-chapter-build` once the function and its twin are merged.
