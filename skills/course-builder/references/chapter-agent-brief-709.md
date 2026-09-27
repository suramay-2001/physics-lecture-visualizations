# Chapter-content agent brief for a second course (template; first used for Physics 709 F1 and Q1)

**What the orchestrator does:**
- Fill `{ID}` (e.g. `F1`, `Q4`), `{id}` (lower case), `{PLAN}` (the plan file) and `{RULINGS}` (the judge's rulings
  for this chapter), save the brief to the session scratchpad, and launch one agent with `isolation: "worktree"`
  pointing at it.
- Then: merge, gate, both e2e projects, contact sheets of every beat and reveal **in both tracks**, and an independent
  read-only P review. Fixes land as a follow-up commit.
- `<MAIN_CHECKOUT>` is the repo's main working tree. Never commit a local path.

---

You are the content builder (roles P + W) for "Spin Lab", which now hosts two courses: Physics 448 (spin-½) and
Physics 709 (Intro to Quantum Computing). You work in an ISOLATED git worktree (your current directory). The main
checkout is `<MAIN_CHECKOUT>/`.

Your job: build **709 chapter {ID}** from the approved plan, in BOTH tracks, until every test is green, then commit on
your worktree branch.

## Setup (do first)
1. Read these files:
   - `CLAUDE.md`;
   - `BUILD-LOG.md`: "Locked decisions", "Hard-won platform knowledge" and "KT points";
   - `skills/course-builder/references/lecture-checklist.md`, including "Lessons";
   - `docs/roles/interface-changes.md`: rows W-709 #1–#3 and the stage-kind rows. These are the two-track, `'core'`
     and bridge APIs.
   - `docs/roles/decisions/qc709-map.md` and `qc709-pilots.md`.
2. The worktree has no `node_modules` and no `sources/` (both git-ignored). Make `app/node_modules` a REAL folder of
   per-package symlinks. A single symlink to the whole folder shares Vite and chunk-report caches with the main
   checkout.
   `mkdir app/node_modules && for p in "<MAIN_CHECKOUT>/app/node_modules"/* "<MAIN_CHECKOUT>/app/node_modules"/.bin; do ln -s "$p" app/node_modules/; done`
   `ln -s "<MAIN_CHECKOUT>/sources" sources`
   Never commit either (check `git status`); add files by explicit path.
3. graphify-out/graph.json exists. Run `graphify query "<question>"` before grepping or reading raw source files.
4. The session scratchpad is shared. Never edit files you did not create there.

## The plan and rulings
- Plan: `{PLAN}`. Transcribe it faithfully, both tracks.
  - Paraphrase; never copy source text. A verbatim 8-gram test runs against every file in `sources/`, including
    Bergou, Axler and the 709 notes.
- The worked example for file shapes is the DEV demo chapter `app/src/content/qc709/__fixtures__/demoChapter.ts`,
  plus 448's `L2.*.ts` for the style of values, claims and challenges.
{RULINGS}
- Standing 709 rules:
  - **Two tracks, one stage.**
    - Every beat and reveal has `text` (Ground-up) and `formal`; captions have `caption` and `captionFormal`.
    - Every unit has `insight` and `insightFormal`; every review card has its `formal` block; every gloss entry has
      `formal`.
    - Ground-up sentences are ≤ 25 words and Formal sentences ≤ 40. Symbols come before use, and claims are backed,
      in BOTH tracks.
    - Ground-up starts from 9th-grade math and physics and derives every step. Formal uses full notation and
      vocabulary.
  - **Derivations.** Use `derivation: {result, ground: DerivStep[], formal: DerivStep[]}`.
    - Each list's last `tex` ends with the result's right-hand side.
    - Ground-up has at least as many steps as Formal.
    - Every step's `why` is one plain sentence.
  - **Phases.**
    - F chapters use `'core'` ("The foundation") and never `'lecture'`.
    - Q chapters use `'lecture'` for what the 709 notes say.
    - `'books'` is for Bergou or Axler, with § and printed page.
    - Bergou's printed-page offset varies by chapter: use the table in `P-709-map.md` (d)-E1. Axler's printed page
      is the PDF page − 14.
  - **Bridges.**
    - `<<id|shown>>` sends the reader to a Spin Lab unit and back. Add each id to `content/qc709/bridges.ts`, keyed
      by the target unit id; `bridges.test.ts` fails on unused or dangling ids.
    - A gloss entry may carry a `bridge`.
    - A concept 448 teaches is bridged, not re-taught at length.
  - **Conventions.**
    - |0⟩ ≡ |+z⟩ (north), and q0 is the leftmost factor, the top wire and the MSB.
    - Use the standard Bell names, with the "(Bergou: …)" tag on first use.
    - S = P(π/2), and fidelity means root fidelity.
    - ħ = 1 in the engine; the UI appends ħ.
  - **Homework.** A problem assigned in EITHER course's homework gets hints only (`walkthrough: []`), never a
    walkthrough in the other course. The 709 HW sheet is ingested at `sources/qc709-hw1/`; 448's homework is marked `assigned`.
  - **Ownership.** One owner per concept; later chapters open with a one-beat link-back.
  - **`Concept.sameAs`.** Where a 709 concept is a 448 concept, set `sameAs: '<448 concept id>'`. The first chapter
    build adds the field and the map edge, as ruling 6 of `qc709-pilots.md` says.
- **Engine and stage.** Do NOT edit `app/src/physics/**` or `app/src/stage/**`. If you need a change there, stop and
  report it.
  - Engine: `physics/complex.ts`, `physics/qc/*` (`state`, `gates`, `circuit`, `measure`, `density`, `bits`,
    `complexExtra`), and 448's `physics/*`.
  - Stage kinds: 448's six, plus `complex-plane`, `amplitudes` and `circuit`, with the fields listed in
    `interface-changes.md`.

## Files (all under `app/src/content/qc709/`; adding a chapter touches no shared registry)
- **NEW:** `{ID}.ts` (exports `{ID}: Lecture`), `{ID}.story.ts`, `{ID}.review.ts`, `{ID}.values.ts` (exports `V`),
  `{ID}.glossary.ts` (exports `GLOSSARY`).
  - Claim keys start with `{id}` and are unique across both courses.
  - Print numbers with `d()`, `pct`, `tf` or `uf`, never a raw `${V.x}`.
- **EDIT:**
  - `concepts.ts`: the plan's stations, with `sameAs` where it applies;
  - `bridges.ts`;
  - the 709 fidelity registry: the plan's new items;
  - `outline.ts`: only if the plan moves a chapter, with the judge's ruling.
- **NEW:** `pipeline/claims_qc709/{id}.py`: numpy twins for EVERY `{id}` key, computed by an independent route.
  - Run it so it writes `app/src/physics/__fixtures__/claims-qc709/{id}.json`.
  - Run it twice: the output must be byte-identical.
- **Registry:** `UPDATE_META=1 npx vitest run src/content/meta.test.ts` regenerates `qc709/meta.generated.ts`.
- **e2e:** add the chapter to the 709 story/security route lists (`e2e/course709.spec.ts`, `security.spec.ts`) and to
  any unit counts the specs assert.
- **Arcade and media:** out of scope unless the rulings above say otherwise. List the plan's Arcade levels and films in
  your report as "deferred".

## Checks that must pass (from `app/`)
- `npx tsc -p tsconfig.app.json --noEmit` → 0 errors.
- `npx vitest run src/content` → all green.
  - This covers, per track: symbols before use, gloss at first use, sentence caps, claims ↔ numpy, displayed numbers
    ↔ claims.
  - It also covers derivation shape, KaTeX, fidelity ids, bridges, the verbatim test, homework, and raw floats.
- Then `npm run build && npx vitest run` → all green. Build first: the security and chunk tests read `dist/`.
- Playwright PREVIEW project on the port the orchestrator names: the whole suite, 0 CSP violations.
- Pitfalls, all from 448, all still true:
  - `{{key|shown}}` cannot wrap TeX that contains `|`.
  - Avoid `\leftrightarrow` and `\mathbb` in TeX.
  - Bloch transitions must not jump between antipodal points.
  - Every unit with a story shows at least one number.
  - A link-back beat names its target in words and defines nothing.

## Finish
Commit on your worktree branch with the message "709 {ID} built: …", a short summary and the evidence (test counts),
ending with:
Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>

Do NOT push and do NOT merge. Report, in under 400 words:
- the branch and commit;
- the test counts;
- any plan item not done, and why;
- any engine or stage change needed;
- the deferred Arcade and media items;
- any wording you are unsure of, per track.
