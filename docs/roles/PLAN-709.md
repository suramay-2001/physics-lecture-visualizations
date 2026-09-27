# Physics 709 "Intro to Quantum Computing" — a second course in Spin Lab

## Context
The user is taking Physics 709 (Fall 2026) and wants its lecture notes and two textbooks turned into visualization notes
and cinematic chapters, like the finished Physics 448 "Spin Lab". The goal is intuition from the ground up: every
term and every derivation explained, full professional notation, grounded in 9th-grade math and physics.
Sources:
- `~/Downloads/Physics709_F26.pdf`: a growing lecture-notes PDF. Today it holds 17 pp. / 3 lectures (9/2, 9/9, 9/14),
  a QM review that overlaps 448 almost entirely (Stern–Gerlach, Hilbert space, Gram–Schmidt, spin-½, change of basis,
  photon polarization, operators, projectors, Bloch sphere, Hermitian/eigen, uncertainty).
- Bergou–Hillery–Saffman, *Quantum Information Processing* 2e: 15 chapters, from qubits through hardware.
- Axler, *Linear Algebra Done Right* 4e: the math backbone.
- `P709F26-HW1.pdf`: assigned homework, so hints only.

**User decisions (2026-09-27):**
- Same app, as a 2nd course with a course switcher.
- 709 chapters stand alone. Anything a reader doesn't follow that 448 teaches is a **bridge**: go to the 448 unit, read
  it, and **return to the exact 709 place**.
- **Two tracks** side by side in every chapter: *Ground-up* (9th grade → line-by-line derivation) and *Formal* (full
  notation and vocabulary).
- Full semester planned now from Bergou (all four areas: core computing; measurement and channels; protection and
  information; hardware), re-aligned as the notes arrive.
- The notes are the **print-ready Read mode**.
- Cinematic media: live engine scenes + Blender openers + **Motion Canvas and Blender rendered films** + **AI (Higgsfield)
  video** as decoration.
- **Distinct identity: "Cryostat"**: dilution-refrigerator gold/copper, cold navy, frost-white type.
- **Order:** finish the paused Operator Lab bench first, then 709.

Unchanged house rules:
- `sources/` stays git-ignored and paraphrased.
- Every learner-visible number comes from the engine and is covered by a numpy twin.
- Generated media never states a physical result.
- Nothing is pushed or published without the user.
- Higgsfield credits need the user's go-ahead per batch.

## Phase 0: finish the Operator Lab (user's order)
Resume the paused agent in worktree `worktree-agent-a63edee838c841c60`. Its model, presets, store and tests are written;
the Babylon views, drag, look, panel and e2e remain. Then run the usual merge, gate, both e2e projects, visual QA and a
P truth review. The Grapher, SG and Bloch-ball benches wait until 709 is under way.

## Phase 1: sources and the semester map
**Ingest**
- Extend `pipeline/course.config.json` from one `course` to a `courses` list: add `qc709`, and ingest the notes PDF
  split at its "Lecture N on date" headings into `sources/qc709/N1…`.
- Ingest Bergou in full and add Axler ranges (tensor products §9D, spectral theorem §7), plus the HW sheet as `assigned`.
- Paths go in the git-ignored `course.config.local.json` only.
- `hw 1 709.pdf` (4.3 MB, probably the user's own work) is NOT ingested unless the user says so.
- Re-ingest weekly. A diff of the notes against the map re-orders or adjusts chapters, recorded in BUILD-LOG.

**Semester map** (P plans each chapter's story like the `P-L{N}-story.md` files, and the judge rules on them)

| Part | Chapters | Sources | Bridges |
|---|---|---|---|
| F Foundations (ground-up) | F1 numbers → complex numbers, e^{iφ} · F2 vectors, inner products · F3 matrices, linear maps · F4 eigen, Hermitian/unitary, spectral theorem · F5 probability, expectation, variance · F6 tensor (Kronecker) products · F7 bits, Boolean and reversible logic, complexity · F8 Fourier, roots of unity, modular arithmetic | Axler 1, 3, 5–7, 9D | 448 L2 (complex), L4–L5 (matrices) |
| I QM review | Q1 Stern–Gerlach and the formalism · Q2 bases, Gram–Schmidt, change of basis, photon polarization, operators · Q3 measurement, projectors, Bloch sphere, Hermitian/eigen, uncertainty | notes L1–L3 | 448 L1–L7 throughout |
| II Qubits and circuits | Q4 qubit, gates, circuits · Q5 Deutsch and the interferometer, other models | Bergou 1 | 448 L6 (rotations) |
| III Density matrix | Q6 ensembles, mixed states, the Bloch ball · Q7 Schmidt, purification, reduced states, comparing states | Bergou 2 | 448 l6-mixture |
| IV Entanglement | Q8 definition, no-signalling, Bell/CHSH · Q9 dense coding, teleportation, swapping · Q10 separability, distillation, measures, multipartite | Bergou 3 | F6 |
| V Dynamics and measurement | Q11 quantum maps, Kraus/CPTP, depolarizing, impossible maps · Q12 POVMs, Neumark, state discrimination, sequential | Bergou 4, 5 | 448 L3 (projectors) |
| VI Cryptography | Q13 one-time pad, B92, BB84, E91, secret sharing | Bergou 6 | Q8 |
| VII Algorithms | Q14 Deutsch–Jozsa, Bernstein–Vazirani · Q15 Grover · Q16 Simon, QFT, phase estimation · Q17 walks, simulation, QAOA | Bergou 7 | F7, F8 |
| VIII Machines | Q18 cloners, U-NOT, programmable processors, discriminators | Bergou 8 | Q12 |
| IX Error correction | Q19 decoherence, QEC conditions, CSS, DFS · Q20 stabilizers, Gottesman–Knill | Bergou 9, 10 | F7 |
| X Information | Q21 distances, entropies, Holevo | Bergou 11 | F5 |
| XI Hardware | Q22 DiVincenzo, Bloch equations, Rabi, Ramsey · Q23 neutral atoms and ions · Q24 photons and beam splitters · Q25 transmons and quantum dots | Bergou 12–15 | 448 L1 (magnets), L6 (generators) |

Build order: F1–F6 and Q1–Q5 first (the notes' current pace), then Parts III → XI in course order.

## Phase 2: platform (W; file-level design from the Plan agent)
**Registry and ids**
- `app/src/content/courses.ts` (`CourseId 'sl448' | 'qc709'`, theme, tracks, sentence caps).
- 709 ids are prefixed (`Q1…Q25`, `F1…F8`, units `q{n}-…`/`f{n}-…`, claim keys `q{n}`/`f{n}`, glossary, fidelity,
  concept and game ids `qc-…`), with a `courses.test.ts` namespace check.
- Raise the `progress.ts` caps (500 → 2000 entries, 64 → 256 KiB) before any 709 challenge ships; today's cap would
  silently drop records.

**Routes**
- All 448 URLs stay canonical.
- 709 lives at `#/709`, `#/709/ch/:id`, `#/709/{map,arcade,formulas,help}`.
- `paths.ts` + `useCourse()` replace the 17 hard-coded `/lecture/` strings.
- A `CourseSwitcher` sits beside the wordmark; `LecturesMenu`, home, map, Arcade, formulas, help and fork read the course.

**Content**
- `app/src/content/qc709/` is registered by `import.meta.glob`: chapters, values, glossaries and fixture twins
  (`pipeline/claims_qc709/q{n}.py`). Adding a chapter touches no shared file (ends the glossary/claims merge conflicts).
- A lazy course pack holds the 709 glossary, bridges, concepts and film captions, keeping the main chunk small.
- Chunk contract gains: no 709 content or `physics/qc` in the entry closure; no 709/448 shared chunk; no
  `@motion-canvas` in any chunk. Add an entry-chunk byte budget.

**Two tracks**
- `Beat.formal`, `captionFormal`, `reveal.formal`.
- `Beat.derivation {result, ground[], formal[]}`, stepped and animated by `components/Derivation.tsx`.
- `Unit.insightFormal`, `ReviewCard.formal`, `GlossEntry.formal`.
- `TrackToggle` beside `ReadModeToggle`, independent of it, remembered and URL-overridable; the stage is shared by both.
- Lints per track: symbols before use in both; **≤ 25 words Ground-up, ≤ 40 Formal**; Ground-up has at least as many
  derivation steps as Formal; every 709 beat has both texts.

**Bridges with return**
- `qc709/bridges.ts` targets (course, unit, beat?).
- Prose syntax `<<id|shown>>`; a glossary popover offers "Learn it in Spin Lab 2.3".
- `BridgeLink` stores the 709 position in the current URL (Back works too).
- The target URL carries `?ret=` with ids only, parsed field by field, never a URL.
- `ReturnBar` "Return to 709 · Chapter 3 · Bell states, step 4" survives reloads and chained bridges.
- The same `stage/readingPosition.ts` (moved out of `LecturePage.tsx`, restoring after the story's first refresh) also
  serves the Story/Read swap and the track toggle.
- Foundations chapters are reached the same way.

**Theming**
- `styles/theme-cryostat.css` on `:root[data-course='qc709']`, set before first paint.
- `STAGE_THEME[course]` for stage backgrounds.
- Outcome colours stay shared (|0⟩ ≡ |+z⟩ across bridges); gold/copper never on stage (amber is "+").
- Contrast tests per course; ΔE ≥ 20 between gold/copper and `--up`.

**Print notes**
- `PrintNotes` switches to Read mode and prints; `print.css`.
- One numbered SVG figure per stage change (`stage/figures/FigureFor.tsx`), drawn from `resolve()`.
- `e2e/print.spec.ts`.

**Skill**
- Update `skills/course-builder/references/{content-model,lecture-agent-brief,lecture-checklist}.md` for multi-course,
  two tracks and bridges.
- Worktree briefs use per-package `node_modules` symlinks.

## Phase 3: identity (D; user approves before building)
Cryostat direction:
- Page chrome in gold/copper plate on cold navy, frost-white type.
- Each Part is a colder stage of the dilution refrigerator (300 K → 4 K → 800 mK → 100 mK → 10 mK), and openers descend
  through them.
- D publishes a private mockup page (home, chapter, both tracks, a bridge round trip, print) for the user's approval.
- Then the `frontend-design` pass tightens the type, palette and signature element.

## Phase 4: QC engine and new stage kinds (P + W)
**Engine**
- `app/src/physics/qc/`: `state`, `gates`, `circuit` (one serializable format for content, stage and films), `measure`,
  `density` (partial trace), `entangle` (concurrence, negativity, entropy), `channels` (Kraus), `povm`, `stabilizer`,
  `qft`, `grover`, `bloch-eq` (Rabi/Ramsey/T1/T2).
- Pure TS. Conventions locked in BUILD-LOG: qubit 0 is leftmost; |0⟩ ≡ |+z⟩, tied to `physics/spin.ts` by a test; the UI
  caps at 10 qubits.
- `pipeline/make_qc_fixtures.py` (numpy, seed 709) plus property tests: unitary gates; ΣK†K = I; no-signalling;
  stabilizer tableau = state vector on random Clifford circuits; QFT = the DFT matrix.

**Stage kinds**
- New kinds, one commit each: `circuit` (SVG, animated state flowing along the wires), `amplitudes` (SVG bars with
  phase colour, n qubits), `grover-plane` (SVG), `two-qubit` (two Bloch balls + correlations, GL), `cityscape` (ρ bars,
  GL); later `optics-bench` and `energy-ladder`.
- SVG kinds double as print figures.
- Reused: `bloch`, `bloch-ball`, `operator-space`, `hilbert-plane`, `lab-r3`, `hopf`.

**Lab**
- A `/709/lab` circuit composer bench later, reusing the lab infrastructure.

## Phase 5: media pipeline
**Motion Canvas**
- A spike first: headless render → PNG → WebP frames scrubbed by `openers/OpenerScrub.tsx`.
- Then `films/` at the repo root with its own `package.json`. Scenes import `app/src/physics/qc/*.ts` and write a manifest
  of every number drawn; `films.test.ts` recomputes each with the engine.
- Captions live in the course pack.
- New dev tooling needs the user's OK at install.

**Blender**
- One opener per Part (the cryostat descent, Bloch-ball mixtures, entangled pairs, the Grover rotation, a surface-code
  lattice…) from engine JSON, as today.

**Higgsfield**
- D proposes a shot list per Part: atmosphere only, no text, no results.
- The user approves credits per batch; files go in `app/public/decor/qc709/`, shown by `DecorVideo` (aria-hidden,
  poster fallback, reduced motion → poster).

## Phase 6: chapters (the per-lecture pipeline, now two-track)
For each chapter:
1. P writes the story plan: units, beats, both tracks, derivations, bridges, fidelity, challenges, errata.
2. The judge rules.
3. A worktree agent builds it from the updated brief.
4. Merge, gate, both e2e projects.
5. Contact sheets of every beat and reveal in both tracks.
6. An independent P truth review (answer keys re-derived with the engine).
7. Fix commit, BUILD-LOG.

Two to three chapter agents run in parallel once the glob registry removes the shared-file conflicts.

## Critical files
- `app/src/content/{meta.ts,load.ts,stage.ts,walk.ts,glossary.ts}`, `app/src/progress.ts`
- `app/src/pages/{LecturePage,Home,MapPage,ArcadePage,FormulasPage,HelpPage}.tsx`
- `app/src/components/{TopbarControls,LectureFork,ReadModeToggle,StoryStage,StaticStory,UnitView}.tsx`
- `app/src/stage/{tokens.ts,useStoryScroll.ts,views.ts,resolve.ts,interp.ts}`, `app/build/{chunkGraph.ts,chunks.test.ts}`
- `pipeline/{course.config.json,ingest.py,make_fixtures.py,make_claim_fixtures.py}`
- `skills/course-builder/references/*`

Reused as-is:
- `physics/{spin,operators,density,expr}.ts`
- `openers/OpenerScrub.tsx`
- `pipeline/blender/*`
- `content/load.ts` per-chunk loading
- the verbatim, claims, symbols and meta tests

## Verification
- **Every commit:** `npm run build && npx vitest run` (gate.sh), then the preview and dev Playwright projects separately,
  then `graphify update .` (0 tracked leaks).
- **448 regression:** the whole existing e2e suite passes UNCHANGED after each platform commit (URLs, progress, contrast).
- **709:**
  - `course709.spec.ts`: switcher, home, map, formulas, a trip back to 448.
  - `bridge.spec.ts`: Story and Read, both tracks, reload on the 448 page, keyboard only; the same beat under the centre
    line after return.
  - `print.spec.ts`: 0 canvases, figures counted, `page.pdf()`.
  - Security ROUTES include 709 (0 CSP violations).
- **Engine:** numpy fixtures, property tests, and a mutation check per new module.
- **Chapters:** claim ledger per track; lints per track; verbatim 8-gram vs the 709 sources; visual QA of both tracks;
  an independent P review before each chapter counts as done.
- **Films:** manifest numbers recomputed by the engine; decor clips have no text track and no claims.
