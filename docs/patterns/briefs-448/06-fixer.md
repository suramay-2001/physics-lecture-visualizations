<!-- Brief as used for the 448 L19–L20 batch (2026-11-16/17); copy, then replace the lecture ids, commits and counts. -->

You are the fix agent for Physics 448 L19–L20 in a git worktree of the "Spin Lab" repo. Fix the items of the independent review `docs/roles/audits/448-L19L20-review.md` (commit bd2ae37) per `skills/07-chapter-fix/SKILL.md`, with the judge's rulings below. Lean: ≤ 90 steps, quiet outputs, no Playwright, no push. Touch only the files the items name (plus tests/meta/twins the edits force).

Setup: `git merge --ff-only main`; node_modules symlinks and the `sources/` link per `docs/patterns/worktree-agent-setup.md`.

## Judge's rulings on the items
- **S1, N1, N2, N3, N4, N5:** fix as the review says. N3: state the work function and both gap widths in the prose so the factor is reproducible. N4: state the alpha mass and Z, R in the prose, and mark the stage in its caption as a square-barrier stand-in (or use a stage that is honest about it).
- **N6:** apply the strict reading of ruling R1: `l19-thick:b2` becomes a short link-back to L18's thick form (its formula plus "here we read it") and keeps only the new ratios 0.964 and 0.995; `l19-thick:b5` drops the repeated "as a → 0 the thick form tends to 4" (one clause pointing to `l18-tunnel:b3` is fine). Keep D2.
- **Nits 1–4, 6–9:** fix as the review says.
- **Nit 5:** no change (moved, already-reviewed content; Townsend problems are not course homework).
- **Nit 10:** read `l14-pr-kinetic` (L14.ts ≈ 363). If it already asks for the tent's kinetic energy (the same 6ħ²/mL² number), change `l20-pr-kink` to an asymmetric tent peaked at x = L/3 (new engine-backed key with a twin; new answer; the point stays "a kink costs finite energy, a jump costs infinite"), and add a one-line link back to `l14-pr-kinetic`. If L14 asks a different quantity, leave it and add only the link.

## Rules
Paraphrase sources, 7-word overlap sweep on changed prose against `sources/L19/text.md`, `sources/L20/text.md`, `sources/townsend/digest-G4.md`; every number from the engine via claims; sentence cap 25 words; commit per group with explicit paths and the trailer `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.

## Acceptance
`npx tsc -b` 0 errors; `npx vitest run src/content src/physics src/stage` green (verbatim running); twins byte-identical; `UPDATE_META=1` twice clean; `npm run build` + `build/chunks.test.ts` green. Append to the review file a "Fix pass" section: each item → done/no change with file:line. Report under 100 words with commits and your branch name.
