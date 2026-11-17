<!-- Brief as used for the 448 L19–L20 batch (2026-11-16/17); copy, then replace the lecture ids, commits and counts. -->

You are the stage/engine agent for Physics 448 Lectures 19–20 in a git worktree of the "Spin Lab" repo. Build ONLY ruling R3 of `docs/roles/decisions/448-L19L20.md` (read R3, R4 and R10 in full; the stage contracts are §9.2 of `docs/roles/proposals/P-L19-story.md` and `P-L20-story.md`). Follow `skills/10-stage-kind/SKILL.md` (state type, resolve, passport, fidelity, print mode, chunk placement) and `skills/11-engine-module/SKILL.md` (pure functions, independent numpy fixtures in `pipeline/make_fixtures.py`, property tests). Lean: ≤ 120 steps, batch reads, quiet outputs, no Playwright, no pushes, no lecture content.

## Setup
1. `git merge --ff-only main`.
2. node_modules symlinks and the `sources/` link per `docs/patterns/worktree-agent-setup.md`.
3. `graphify query "wavefunction stage kind box source potential readouts"` before grepping. Models: the existing `box` source and the L17/L18 `potential` field of the `wavefunction` kind, the readouts `reflected`/`transmitted`/`norm`/`energy`, and the `plot` curve tables (`content/stage.ts` `PlotCurveName` keeps `| OpticsCurveName`; `plot.ts` tables keep `...OPTICS_CURVE_X`).

## Build (commit after each, explicit paths, trailer `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`)
1. Engine: `app/src/physics/wave19.ts` — `transmissionAmplitude(E, V0, a)` → {r, A, B, tau} complex (closed form; ħ = m = 1), `barrierStateSamples(xs, E, V0, a)`; `app/src/physics/wave20.ts` — `wellLevels(V0, a)` → [{n, parity, E, k, kappa}] (bisection on the smooth forms κcos(ka/2) − k sin(ka/2) and κ sin(ka/2) + k cos(ka/2)), `wellMismatch(E, V0, a, parity)` normalised by √(k² + κ²), `wellStateSamples(xs, V0, a, n)` normalised with tails, `wellCount(V0, a)`, the tail probability. Tests + numpy fixtures (4 × 4 `numpy.linalg.solve` for the barrier; brentq plus a finite-difference Hamiltonian for the well). Check values: k = κ = 2, a = ½ → |τ| = 0.6481, T = 0.4200, R + T = 1; V₀ = 8, a = 2 → E = 0.7842, 3.0618, 6.4631 (even, odd, even).
2. S1 `wavefunction.source.barrierWave`, S2 `wavefunction.source.well`, S3 plot curves `wellMatchEven`/`wellMatchOdd`, exactly as R3 (readouts, refusals naming the field, fidelity ids, default windows, print mode). S2 has no `current` readout.
3. Tests for resolve/validation/refusals/readout values against the engine, plus the stage-kinds card `docs/context/cards/stage-kinds*` updated (one line per addition).

## Rules
Chunk rule (l): run `npm run build` and `npx vitest run build/chunks.test.ts`; the entry stays ≤ 497 500 raw and the budget is never raised — if the samplers land in the entry closure, make them lazy or move them into the kind's chunk. No lecture content, no e2e edits, no local paths.

## Acceptance (report each, under 100 words)
`npx tsc -b` 0 errors; `npx vitest run src/physics src/stage src/content` green; fixtures regenerate byte-identical; build + chunks green with the entry size; commits listed; the exact source/readout/curve names and engine signatures the builders will use.
