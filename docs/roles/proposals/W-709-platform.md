# W — Physics 709 as a second course: platform design (2026-09-27)

A Plan agent designed this (read-only) for the approved plan `docs/roles/PLAN-709.md`. It is the build spec for the
platform phase. Paths without a prefix are under `app/src/`. The rulings in `docs/roles/decisions/qc709-map.md` and
the approved identity `docs/roles/proposals/D-709-identity.md` (with its mockup) take precedence where they are more
specific.

## Costs in today's code (fix at the source)
1. **Progress cap.** `progress.ts` caps the store at `maxEntries = 500` and `maxRaw = 64 KiB`, and `sanitize()`
   silently drops records past the cap. 709 will exceed 500 challenges, so raise the caps first.
2. **One id space.** Glossary (a Map), `FIDELITY`, progress keys, game ids, claim keys (`mergeValues`) and concept ids
   share one namespace, and nothing enforces a course prefix.
3. **448 is hard-wired as "the course".**
   - `meta.ts` `COURSE` and `LECTURE_META` are treated as the whole course by Home, the topbar, Map, Arcade, Formulas
     and the fork.
   - `concepts.ts` `COURSE_LECTURES` decides which lecture is last.
   - 17 `/lecture/${id}` strings are hard-coded (App, TopbarControls, LectureFork, TrainsLink, four pages).
4. **Copper vs amber.** `stage/tokens.ts` bans copper because it reads as amber, and amber #f0a93a means "+". Gold and
   copper stay OFF the stage.
5. **Every stage kind is assumed to be WebGL.** `STAGE_BG`, `PASSPORT` and `FIDELITY` are typed over `StageKind`, and
   every renderer assumes a WebGL view (`stage/views.ts`, `drive.ts`, the overlay-contrast instrument).
6. **Text syntax.** `walk.ts` `INLINE_RE` is frozen: a new syntax needs an interface-change note. The claims reader
   treats only `\bL\d+` as a reference.
7. **Main chunk.** `glossary.ts` is in the 870 KB main chunk (`Gloss.tsx` reads it synchronously). 709 terms must not
   go there.
8. **Merge conflicts.** Every lecture edits the shared `index.ts`, `load.ts`, `values.ts`, `glossary.ts`, `claims.json`
   and `make_claim_fixtures.py`.
9. **Restore timing.** `App.tsx` `ScrollToHash` scrolls to the top on every path change, and GSAP pin spacers move
   beats after the first layout. A restore must wait for the story's first refresh.

## A. Namespacing
**Ids** (a course is always inferable from an id)

| | Chapters | Units | Claim keys | Other ids |
|---|---|---|---|---|
| 448 | `L1…` | `l{n}-…` | `l{n}…` | unchanged |
| 709 | `Q1…Q25`, `F1…F8` | `q{n}-…` / `f{n}-…` | `q{n}` / `f{n}` | glossary, fidelity, concept and game ids start `qc-` |

**Course registry**
- `content/courses.ts` (main chunk): `CourseId = 'sl448' | 'qc709'`.
- `COURSES[id]`: code, title, tagline, slug (`''` / `'709'`), chapter noun, id pattern, tracks, sentence caps
  `{ground: 25, formal: 40}`, theme.
- Helpers `courseOfId()` and `metaFor(course)`.
- `meta.ts` keeps `COURSE` and `LECTURE_META` byte-identical; `metaById` searches both courses.
- New test `content/courses.test.ts` checks every id kind against its course prefix.

**Routes**
- 448 stays canonical: no redirects, and `e2e/security.spec.ts` ROUTES is unchanged.
- Alias `#/448/lecture/:id` becomes a `<Navigate>` that keeps the hash.
- 709: `#/709`, `#/709/ch/:id` (Q and F), `#/709/{map,arcade,arcade/:gameId,formulas,help}`.
- `paths.ts` (`lecturePath`, `coursePath`, `courseOfPath`) replaces the 17 hard-coded strings.
- `course/CourseContext.tsx` provides `useCourse()`, derived from the path.

**Content**
- 448 stays flat in `content/`.
- 709 lives in `content/qc709/`:
  - per chapter: `Q{n}.ts`, `.story.ts`, `.review.ts`, `.values.ts`, `.glossary.ts` (same for `F{n}`);
  - shared: `bridges.ts`, `concepts.ts`, `films.ts`, `meta.generated.ts`;
  - `pack.ts`: a lazy course pack holding the glossary, bridges, concepts and film captions;
  - `index.ts`: the eager registry, for tests only.
- Chapters are registered by glob, so adding a chapter touches no shared file:
  - `qc709/index.ts` uses `import.meta.glob(['./[QF]*.ts', '!./*.*.ts'], { eager: true })`;
  - `load.ts` adds a lazy glob for 709 (448 loaders unchanged);
  - `qc709/values.ts` merges `*.values.ts` the same way, and `content/values.ts` merges both courses.
- Claim twins: `pipeline/claims_qc709/q{n}.py` → `physics/__fixtures__/claims-qc709/q{n}.json`, merged by glob in
  `claims.test.ts`.
- `meta.test.ts` runs per course; `UPDATE_META` writes both generated files; loader lists are checked per course.
- `Gloss.tsx` resolves terms through `content/glossRegistry.ts`: 448 terms are eager, and the 709 pack registers its
  terms when it loads.

**Progress**
- One store; key `spinlab.progress.v1` unchanged (ids are already namespaced).
- Caps raised to 2000 entries and 256 KiB. `progress.security.test.ts` gets a 1500-record round trip.
- New prefs, validated the same way: `qc709.track.v1` and `courses.last.v1`.

**Chunk contract** (`build/chunkGraph.ts`, `build/chunks.test.ts`)
- `lectureOf` → `/\/src\/content\/(?:qc709\/)?([LQF]\d+)(?:\.(?:story|review|values|glossary))?\.ts$/`.
- New rules:
  - (h) no `content/qc709/` or `physics/qc/` in the entry closure;
  - (i) no 709/448 shared chunk;
  - (j) no `@motion-canvas` or `/films/` in any chunk.
- An entry-chunk byte budget.

**Pages**
- `TopbarControls` `LecturesMenu(course)`: the 709 panel lists Foundations, then Chapters.
- `CourseSwitcher` beside the wordmark (a disclosure like `LecturesMenu`): each course links home and to its
  "continue at" place from `courses.last.v1`.
- `App.tsx`: wordmark, nav and footer from `COURSES[useCourse()]`.
- `Home.tsx` stays the 448 home plus one card for 709; new `pages/CourseHome709.tsx` (the descent from the approved
  mockup).
- `MapPage`, `ArcadePage`, `FormulasPage`, `HelpPage`, `LectureFork`, `LecturePage` and `arcade/TrainsLink.tsx` read
  `useCourse()` / `paths.ts`.

**Tests**
- The whole existing 448 e2e suite must pass UNCHANGED.
- New `e2e/course709.spec.ts`: switcher, home, map, formulas, a trip back to 448.
- 709 routes added to security ROUTES.

## B. Two tracks
**Schema** (`content/stage.ts`, with an interface-change note)
- Text: `Beat.formal?`, `Beat.captionFormal?`, `BeatReveal.formal?`.
- Derivations: `Beat.derivation?: { result; ground: DerivStep[]; formal: DerivStep[] }`, with
  `DerivStep = { tex; why; claims? }`.
- `Unit.insightFormal?`, `ReviewCard.formal?`, `GlossEntry.formal?`, `Lecture.symbolsFormal?`.
- Beat ids, stage, terms and claims are shared by both tracks: one stage per beat, and positions and bridge targets
  hold in either track.

**Lints**
- `readingOrder(l, track = 'ground')` in `walk.ts`.
- `symbols.test.ts` and `claims.test.ts` run per course × track. Caps: 25 words (Ground-up), 40 (Formal). 448 runs
  Ground-up only, so its results do not change.
- `content.test.tsx`, 709 only:
  - every beat and reveal has `formal`;
  - every term is listed;
  - both derivation lists end on `result`;
  - Ground-up has at least as many steps as Formal;
  - all TeX renders.

**Toggle**
- `ui/trackPref.ts` (the `readModePref.ts` pattern, with a `?track=` override).
- `components/TrackToggle.tsx` beside `ReadModeToggle`, independent of it, shown only for two-track courses.
- `StoryStage`, `StaticStory` and `UnitView` render `pickTrack(beat, track)`; `components/Derivation.tsx` steps
  through derivations.
- Switching tracks keeps the reading position (C).

## C. Bridges with return
**Reading position**
- Move `useKeepReadingPosition` out of `pages/LecturePage.tsx` into `stage/readingPosition.ts`, exposing
  `probeReadingPosition() → {beat, frac}` and `restoreReadingPosition(pos)`.
- Add `onStoryRefreshed(cb)` in `stage/useStoryScroll.ts`, so a restore waits for the first refresh.
- It serves the Story/Read swap, the track toggle and bridges.

**Schema and syntax**
- `qc709/bridges.ts`: `BRIDGES: Record<id, {course, lecture, unit, beat?, label}>`.
- Prose syntax `<<id|shown>>`, added to `INLINE_RE`, with `bridgeRefs()`.
- `GlossEntry.bridge?` lets a gloss popover offer "Learn it in Spin Lab 2.3".

**Following and returning**
- `components/BridgeLink.tsx`:
  1. probe the reading position;
  2. `replaceState` the current 709 URL with `?at=<beat>&f=<frac>` (so Back works too);
  3. push the target with `?ret=qc709~Q3~q3-bell:b4~0.42~formal#<anchor>`.
- `ui/returnParam.ts` parses `ret` field by field and validates every id against the registries. It holds ids only,
  never a URL, so it cannot be an open redirect.
- `components/ReturnBar.tsx`: a sticky `<nav aria-label="Return to Physics 709">`, e.g. "Return to 709 · Chapter 3 ·
  Bell states, step 4".
  - It survives reload, a new tab and chained bridges (`ret` is carried forward).
  - On arrival, focus moves to the target heading and a polite live region announces it; on return, the position is
    restored and focus moves to the beat.

**Tests**
- `bridges.test.ts`: every used id exists, every target resolves, unused ids fail.
- `returnParam.security.test.ts`: hostile, oversized and unknown values parse to null.
- `e2e/bridge.spec.ts` on a DEV demo chapter (`qc709/__fixtures__/demoChapter.ts`): Story and Read, both tracks,
  reload on the 448 page, keyboard only, and the same beat under the centre line after return.

## D. Theming (Cryostat; 448 unchanged)
**Page**
- `styles/theme-cryostat.css` on `:root[data-course='qc709']`, imported after `index.css`: the approved palette and
  fonts, navy chrome in both schemes.
- `--up` / `--down` stay shared (\|0⟩ ≡ \|+z⟩).
- `main.tsx` sets `data-course` from the URL before first paint.

**Stage**
- `STAGE_THEME[course] = {bg, inset, backdrop}` in `stage/tokens.ts`; a test asserts
  `STAGE_THEME.sl448.bg === STAGE_BG`.
- `stageCssVars(kind, course = 'sl448')`; `ViewSpec.course` sets the clear colour in `stage/views.ts`.
- `INK` stays shared; gold and copper never appear on the stage.

**Tests**
- `tokens.test.ts` per course.
- New `styles/theme.test.ts`: WCAG contrast per course × scheme, and ΔE00 ≥ 20 between gold/copper and `--up`.
- The e2e overlay contrast check runs on the 709 demo chapter.

## Print notes
- `components/PrintNotes.tsx` flushes Read mode, waits for fonts, calls `print()`, then restores the mode
  (`beforeprint` is the fallback).
- `styles/print.css`: a running head (course, chapter, track), figures that don't split across pages, bridge URLs.
- `StaticStory.tsx` emits one `<figure>` per stage change via `stage/figures/FigureFor.tsx`: SVG from `resolve()`,
  passport labels, numbered "Fig. Q3.4".
- Tests: `figures.test.tsx` (renders every 709 beat server-side; checks titles and no `NaN`) and `e2e/print.spec.ts`
  (0 canvases, figure count, `page.pdf()`).

## E. Engine, stage kinds, films
**QC engine** (`physics/qc/`)
- `cmat`, `state`, `gates`, `circuit` (serializable), `measure`, `density`, `entangle`, `channels`, `povm`,
  `stabilizer`, `qft`, `grover`, `bloch-eq`.
- Pure TS: no DOM, React or three (`purity.test.ts`).
- Conventions: q0 is leftmost; \|0⟩ ≡ \|+z⟩, tied to `spin.ts` by `bridge448.test.ts`; the UI caps at 10 qubits.
- Fixtures: `pipeline/make_qc_fixtures.py` (numpy, seed 709) → `physics/__fixtures__/qc.json`.
- Property tests: unitarity; ΣK†K = I; partial-trace consistency; no-signalling; stabilizer tableau = state vector;
  QFT = the DFT matrix.

**Stage kinds**
- Each new kind needs a state type, `PASSPORT`, fidelity (`content/fidelity.qc.ts`), a token, resolve and interp
  cases, `staticWidgets`, and a print figure.
- `KIND_RENDER: {[K in StageKind]: 'gl' | 'svg'}`.
  - SVG: circuit, amplitudes, grover-plane. The SVG route in `StoryStage.tsx` is new plumbing, and the same component
    serves as the print figure.
  - GL: two-qubit, cityscape (`stage/scenes/qc/`).

**Films**
- `films/` at the repo root with its own `package.json`; Motion Canvas never enters `app/`.
- Scenes import `app/src/physics/qc/*.ts` and render PNG → `pipeline/films/encode.sh` →
  `app/public/films/qc709/<id>/NNNN.webp` + poster, played by `OpenerScrub` (with a new `dir` field).
- Each scene writes a manifest of every number drawn; `openers/films.test.ts` recomputes each one with the engine.
- Captions go in `qc709/films.ts` (the course pack). `Unit.opener.film` widens to a `FilmId`.
- Decor: `app/public/decor/qc709/`, played by `components/DecorVideo.tsx` (aria-hidden, no text).

## F. Order and risks
**Commits**
1. `courses.ts`, the namespace test, the progress caps.
2. `paths.ts`, `useCourse`, the 17 strings, stub 709 routes.
3. `qc709/` skeleton, glob loaders, `meta.test.ts`, chunk contract.
4. Topbar, switcher, per-course pages.
5. Theming and its tests.
6. `readingPosition.ts` (the 448 e2e must stay green).
7. Two-track schema, lints and toggle.
8. Bridges.
9. Print and figures.
10. QC engine.
11. The `amplitudes` kind (with `circuit`).
12. The remaining stage kinds.
13. Motion Canvas spike, then the film pipeline.
14. Skill references, CLAUDE.md, BUILD-LOG.

**Risks**
- Restore timing (live, static and narrow layouts).
- Main-chunk growth (add a budget).
- The formal prose may trip the verbatim test more often.
- CSS precedence between the theme and `prefers-color-scheme` blocks.
- Motion Canvas headless rendering is unverified: spike it first.
- Authoring cost: every chapter is written twice.
