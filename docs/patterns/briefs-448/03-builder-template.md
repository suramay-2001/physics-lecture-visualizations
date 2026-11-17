<!-- Brief as used for the 448 L19–L20 batch (2026-11-16/17); copy, then replace the lecture ids, commits and counts. -->

You are the builder for Physics 448 **{L}** ({TITLE}) in a git worktree of the "Spin Lab" repo. Build engine + content exactly per `docs/roles/proposals/P-{L}-story.md` and the rulings `docs/roles/decisions/448-L19L20.md` (they override the plan), plus the Townsend-pass rulings `448-townsend.md` T1–T11 and `448-L14L18.md` M1–M7. Follow `skills/05-chapter-build/SKILL.md` and `skills/course-builder/references/lecture-checklist.md`. Lean: ≤ 170 steps, batch reads, quiet outputs (`| tail`), no Playwright runs, no pushes.

## Setup (first)
1. `git merge --ff-only main` (your worktree may start behind main).
2. Per-package node_modules symlinks and a `sources/` link exactly as `docs/patterns/worktree-agent-setup.md` says (sources is git-ignored; link the main checkout's `sources/`, never copy it).
3. `graphify query` before grepping; `node pipeline/context/build_context.mjs {L} L18` for the pack and `docs/context/generated/ids.json`.
4. Read the latest built lecture as the model: `app/src/content/L18*.ts`, `app/src/physics/wave18.ts`, `pipeline/claims_448/l18.py`, relay `docs/context/relay/2026-11-07-448-L18.md`.

## Order (commit after each step, explicit paths, trailer `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`)
1. Engine: a lecture-only module `app/src/physics/{ENGINE}.ts` with tests, plus its independent numpy twin; nothing lecture-only in the entry closure.
2. Approved stage additions only (if the rulings grant one).
3. Ownership moves the rulings grant: keys and ids take the new prefix; update every reference (bridges incl. Optics rows in `qc709/bridges.ts`, concept stations, e2e pins, claims twins) in the same commit; leave a one-line pointer behind.
4. The lecture: units, beats (one voice), derivations (≥ 2 views), engine-drawn visuals, formula boards, challenges + 3–5 practice questions (`practice: 'homework' | 'townsend'`, new numbers), claims with twins in `pipeline/claims_448/{l}.py`, glossary (no duplicates), bridges, Rosetta notes, review card.
5. Registration: registry/meta, `LAST_448`, LectureFork, e2e counts (nav units, map lines/stations, `BUILT`, the 448 SVG-only list in `story.spec.ts` derived from kinds AND widgets — a Bloch Try-it widget creates a canvas; security ROUTES), `UPDATE_META=1` run twice, a relay note `docs/context/relay/2026-11-16-448-{L}.md` (≤ 8 lines, the L18 relay's shape), cards.

## Rules
- `sources/` is copyrighted and the repo is public: paraphrase; run a 7-word overlap sweep of all new prose against `sources/{L}/text.md` and `sources/townsend/digest-G4.md`; the verbatim 8-gram test (TeX tokens count) must stay green.
- Every number a learner sees comes from `app/src/physics/` via claims; cite "Eq. 6.7" with no parentheses; ħ = 1 inside the engine.
- Claim keys carry the `{l}` prefix; beat ids follow the lettered-group lint.
- No local paths, e-mails or personal data in tracked files.

## Acceptance (report each)
`npx tsc -b` 0 errors; `npx vitest run src/content src/physics src/stage` green with the verbatim test running; claims twins byte-identical; `UPDATE_META=1` twice, second run clean; `build_context` 0 not found; `npm run build` + `build/chunks.test.ts` green (entry ≤ 497 500 raw). Report in under 120 words: commits, counts (units, beats, derivations, challenges incl. practice, glossary, keys), moves done, e2e numbers changed, entry size, anything left.
