# Lecture-content agent brief (template)

Used since Lecture 3: the orchestrator fills `{N}`, `{n}`, `{N+1}` and `{RULINGS}` (the judge's rulings for that
lecture), saves it to the session scratchpad, and launches one agent with `isolation: "worktree"` pointing at it.
The orchestrator then merges the branch, runs both e2e projects, does the visual QA (every beat and every reveal),
and sends an independent read-only P review; fixes land as a follow-up commit. `<MAIN_CHECKOUT>` = the repo's main
working tree (never commit a local path).

---

You are the content builder (roles P + W) for "Spin Lab", an interactive study app for a spin-½ quantum mechanics course (Physics 448). You work in an ISOLATED git worktree of the repo (your current directory). The main checkout is `<MAIN_CHECKOUT>/`. Your job: build **Lecture {N}** content exactly as Lectures 2 and 3 were built, from the approved plan, until every test is green; then commit on your worktree branch.

## Setup (do first)
1. Read `CLAUDE.md`, `BUILD-LOG.md` (sections "Cross-lecture rulings", "Locked decisions", "Hard-won platform knowledge", "KT points") and `skills/course-builder/references/lecture-checklist.md` (with its "Lessons" section).
2. The worktree has no `node_modules` and no `sources/` (git-ignored). Symlink them from the main checkout:
   `ln -s "<MAIN_CHECKOUT>/app/node_modules" app/node_modules`
   `ln -s "<MAIN_CHECKOUT>/sources" sources`
   Never commit these symlinks (check `git status` before committing).
3. graphify-out/graph.json exists: run `graphify query "<question>"` before grepping or reading raw source files for orientation.

## The plan and rulings
- Plan: `docs/roles/proposals/P-L{N}-story.md`. Transcribe it faithfully. Paraphrase, never copy source text: a verbatim 8-gram test runs against `sources/`.
- The worked examples to mirror in structure and style: `app/src/content/L2.*.ts` and `L3.*.ts`.
{RULINGS}
- Engine and stage (do NOT edit `app/src/physics/*.ts` or `app/src/stage/**`; if you need a change there, stop and report it). Available beyond L1–L3:
  - `physics/linalg.ts`: `trace2`, `charPoly2` ([1, −tr, det]), `inv2`, `diag2`, `isDiagonal`, `maxDiff`, `mpow`, `commutator`, `anticommutator`.
  - `physics/operators.ts`: `eigen2` (any 2×2), `expmSeries`, `generatorOf`, `expm2`, `evolve`, `classify`, `decomposeHermitian`.
  - `physics/spin.ts`: `sandwich` (complex ⟨ψ|A|ψ⟩; `expectation` THROWS for non-Hermitian A), `collapse(P, ψ)`, `eigenvectorFor(M, λ)` (the lecture's back-substitution), `basisChange(from, to)` (= B_{to←from}), `phaseShift`, `rotateBloch`, `spread`, `spreadsFromBloch`, `uncertaintyCheck`, `rayAngle`, `blochAngle`, `cross`, `relativeSign`, `jointProb`, plus `eigenHermitian2` (THROWS for non-Hermitian), `projector`, `fromSpectrum`, `operatorInBasis`, `toBasis`, `basisMatrix`, `Rz`, `rotation`, `variance`, `measure`.
  - `physics/sg.ts`: `benchTheory`, `spreadAlong`, `sequenceOutcomes`.
  - Stage: hilbert-plane `image` (Â|ψ⟩ at true length, real matrices only, `label`), `project` + `renormalize`; lab readout `spread` (needs `centroid`); `showPrep` works for ±z and ±x sources (never ±y or oven); bloch `rotate.axis` may be `{thetaDeg, phiDeg}`, `dropLines`, `readouts: ['averages','spreads','bound']` ('bound' needs 'spreads'); operator-space `labels: 'plain'` (L3 only; from Lecture 4 on the default σ passport).

## Files
- NEW: `app/src/content/L{N}.values.ts`, `L{N}.story.ts`, `L{N}.review.ts`, `L{N}.ts`. Claim keys are lecture-prefixed and alphanumeric (`l{n}…`). Every number a learner sees comes from `V` and is backed by a keyed claim in its beat or unit. Print numbers with `d(x, digits)`, `pct`, `tf` or `uf`, NEVER a raw `${V.x}` (a test fails on long floats). For "at every …" sweeps, store the worst sample (`worst(xs, target)`), never `Math.min`.
- EDIT: `app/src/content/index.ts` (add L{N} to LECTURES); `values.ts` (merge V{N}); `glossary.ts` (an L{N} block at the end; reuse existing ids, never duplicate one); `fidelity.ts` (the plan's new items); `concepts.ts` (unit links for L{N}'s concepts).
- EDIT: `pipeline/make_claim_fixtures.py`: an "L{N}" block of numpy twins for EVERY L{N} key, by an independent route (eigh/eig, Lüders projectors for benches, np.vdot, np.poly, np.linalg.inv), as in the L2/L3 blocks. Then run `python3 pipeline/make_claim_fixtures.py` from the worktree root. Do not edit `make_fixtures.py`.
- EDIT: `app/src/arcade/games.ts` + `games.test.ts`: the plan's Arcade levels, with `trains` pointing at L{N} units (golf may use ROT), and one engine check per new spot-the-error correction.
- EDIT e2e (they run later in the main checkout; just keep them correct):
  - `app/e2e/story.spec.ts`: add 'L{N}' to `BUILT`.
  - `app/e2e/security.spec.ts`: add `'#/lecture/L{N}'` to ROUTES.
  - `app/e2e/nav.spec.ts`: the topbar panel unit count = the total units of all built lectures. The fork test: the previous last lecture now links to L{N}, and L{N} says "Lecture {N+1} is in preparation" with 3 links.
  - `app/e2e/arcade.spec.ts`: the "Level 2 of …" count if you add route levels.

## Checks that must pass (from `app/`)
- `npx tsc -p tsconfig.app.json --noEmit` → 0 errors.
- `npx vitest run src/content src/arcade` → all green. This covers symbol-before-use, gloss at first use, ≤ 25-word sentences, claims ↔ numpy, displayed numbers ↔ claims, terms/anchors, KaTeX, fidelity ids, the verbatim test, assigned homework (`walkthrough: []`) and raw floats.
- Then `npm run build && npx vitest run` → all green (build first: the security tests read `dist/`).
- Pitfalls:
  - `{{key|shown}}` cannot wrap TeX that contains `|`; inside TeX use `\htmlClass{term-key}{…}`.
  - Symbols carried from earlier lectures go in `L{N}.symbols`, mapped to the first unit id as a recap, or come from a gloss tag's `symbols`.
  - Avoid `\leftrightarrow` and `\mathbb` in TeX.
  - Refer to units as "Unit {N}.x".
  - Bloch transitions must not jump between antipodal points.
  - Every unit with a story shows at least one number.
  - A link-back beat to an earlier lecture names that unit in words ("Unit 3.6"); it defines nothing.

## Finish
Commit on your worktree branch, with the message "Lecture {N} built: …", a short summary and the evidence (test counts), ending with the line:
Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Do NOT push and do NOT merge into main. Report:
- the branch name and the commit hash;
- the test counts;
- any plan item you could not do and why;
- any engine or stage change you needed but did not make;
- any wording you are unsure about.
Keep the report under 400 words.
