# W-709-notes: the 709 "Lecture notes" section (W, 2026-10-17)

Proposal only (role W). The content plan is `P-709-remap-L8L11.md` (+ `P-709-remap-L1L7.md` §1.1, the notes-section -> chapter-unit table, which is exactly the link data below).
Evidence is cited as `file` (read this session); nothing under `app/` was edited. Sections: 0 summary, 1 data model, 2 rendering, 3 figures, 4 routes and links, 5 chunks and security,
6 tests, 7 context bus, 8 files, 9 build order and acceptance, 10 open questions.

## 0. Summary

| # | Decision | Choice |
|---|---|---|
| 1 | Data model | A small typed **`NotesSpec`** authored in `qc709/notes/N<k>.ts`, turned into an ordinary **`Lecture`** by a pure function `notesLecture(spec)` run at module load (no lazy compiler chunk: no recipes, nothing to AST-gate). One section = one `Unit`, one paragraph = one `Beat` (`phase: 'lecture'`, `text` only). Ids `N8`, `n8-<slug>`, `n8-<slug>:b3`, claim keys `n8Name`, all inside the 709 id family. |
| 2 | Rendering | **A new lightweight page** `pages/NotesPages.tsx` (index + lecture). Not `LecturePage` Read mode (cost table in section 2). |
| 3 | Figures | Existing stage states drawn at the end of their hold (s = 1) by `SvgStill` (every SVG kind) or `FigureFor` (the flat `bloch`, `bloch-ball`, `hilbert-plane`, `operator-space`, `lab-r3`). No stage host, no WebGL, no GSAP. |
| 4 | Routes | `#/709/notes` (index), `#/709/notes/N8` (page; `/709/notes/L8` redirects). Topbar "Notes" on 709, a hero link on the 709 home. Notes -> chapter: ordinary `<<qc-…>>` bridges. Chapter -> notes: a generated `qc-n8-<slug>` bridge chip per unit ("From the lecture notes"). The return bar works both ways once `N<k>` is a parseable chapter id. |
| 5 | Chunks | Files live under `content/qc709/notes/` so rules (h) and (i) already hold; each lecture its own chunk; new rule **(r)**; entry grows by about 1 to 1.5 KB raw (budget slack is 23 KB). |
| 6 | Tests | 2 new unit files, 1 SSR page test, 1 e2e spec; 9 existing suites get one-line extensions. |
| 7 | Context bus | New card `notes-platform`; the generator learns `N<k>` plans, the `notes` course in `ids.json`, section units and paragraph counts. |

Cost: 14 new platform files, 13 changed production files, 10 changed test files, about 85 builder steps. Lecture content N1 to N11 is the P role's, one file pair per lecture.

## 1. Data model

**Why not a new course (Papers-style).** `COURSES[courseOfId(l.id)].tracks` and `.sentenceCaps` drive every lint (`content/symbols.test.ts` l.41/49/430, `claims.test.ts` l.27, `content.test.tsx` l.77,
`qc709/bridges.test.ts` l.23, and four notation tests); the corpora are explicit lists (`QC_CHAPTERS`, `TRACKED`), so a lecture that is NOT in `QC_CHAPTERS` never reaches Arcade, Map, Formulas, Help,
the Try-it gate or the notation pins (`Pages709.test.tsx`, `visualSpecs.test.tsx`, `notation.*`). A fourth `CourseId` would touch about 14 production files (`COURSE_IDS`, `trackPref`, `lastPlace`, `CourseSwitcher`
records, `BridgeLink`, `ReturnBar`, `paths`). Instead: **`N<k>` ids belong to `qc709` by id, with their own one-voice lint profile and their own light registry** (not `QC_META`, so no list page sees them).

**Why not ids `L1`..`L11`.** `courseOfId('L8')` is 448 (`content/courses.ts`). `N` (notes) is free: no 448 id matches `^n\d` (grepped `L*.ts`, glossary, concepts, arcade).

`courses.ts` gains: `isNotesId` (`/^N[1-9]\d*$/`); `courseOfId` returns `qc709` for `N<k>`, `n<k>-…`, `n<k>Key`; `COURSES.qc709.chapterId` becomes `/^[QFN]\d+$/`;
`tracksOfChapter(id)` (`['ground']` for notes, else the course's) and `sentenceCapOf(id, track)` (40 for notes); `registerNotesMeta` + a notes fallback in `metaById` (`meta.ts`);
`chapterName('N8')` is "Lecture 8 notes". The six test sites that will see a notes lecture (`content.test.tsx` l.77, `symbols.test.ts` l.41/49/430, `claims.test.ts` l.27, `qc709/bridges.test.ts` l.23) switch from `COURSES[courseOfId(x)].tracks` to `tracksOfChapter(x)` (mechanical); the notation tests iterate `QC_CHAPTERS`, which excludes notes, so they stay as they are.

**Authoring interface** (`app/src/content/qc709/notes/kit.ts`; the only file with logic):

```ts
import type { Claim, Lecture, StageLayout } from '../../schema'
export interface NotesFigure { stage: StageLayout; caption: string; fidelity?: string[] }  // ONE static state; caption = one sentence, plain rich text
export interface NotesPara {
  text: string                  // full sentences, <= 40 words each; $tex$, [[qc-gloss|words]], <<qc-bridge|Unit 6.2>>, **bold**; no TeX outside $...$
  figure?: NotesFigure          // drawn right after the paragraph
  claims?: Claim[]              // claim = keyedClaim<ValueKey>() from N8.values.ts; one per number shown in text or caption
}
export interface NotesSection {
  id: string                    // 'n8-bell-basis' = /^n<number>-[a-z0-9]+(-[a-z0-9]+)*$/, unique; becomes the Unit id and the page anchor
  label: string                 // the notes' own marker, verbatim: '§C', '§F.2' (<= 12 chars)
  title: string                 // plain text, no TeX
  pages: string                 // printed pages: 'p. 12' | 'pp. 12–14'; first page never decreases through the lecture
  summary: string               // ONE sentence <= 40 words (index topic line, Unit.question, Unit.insight)
  body: NotesPara[]             // short lectures 1 to 3 per section, full lectures 2 to 12; <= 120 words each
}
export interface NotesSpec {
  number: number                // 8 -> 'N8'
  title: string; date: string   // class date 'YYYY-MM-DD'
  topics: string[]              // 3 to 8 plain phrases for the index (become Lecture.outcomes)
  length: 'short' | 'full'      // short 150 to 300 words, full 900 to 1,500 (counted on prose outside $...$ and the captions)
  symbols: Record<string, string>   // TeX symbol -> section id or 'n8-bell:b2' (generated beat ids, 1-based); a gloss tag whose entry lists the symbol also defines it
  sections: NotesSection[]
}
export class NotesSpecError extends Error {}
export function notesProblems(spec: NotesSpec): string[]   // every problem at once, each starting 'N8 n8-bell:b2 …'
export function notesLecture(spec: NotesSpec): Lecture      // throws NotesSpecError when notesProblems() is not empty
```

**What `notesLecture` produces** (so every shared validator sees a normal lecture):

| Lecture / Unit / Beat field | value |
|---|---|
| `Lecture` | `id 'N8'`, `number`, `title`, `date`, `outcomes = topics`, `prerequisites []`, `symbols`, no `symbolsFormal`, no corrections |
| `Unit` per section | `id`, `title = label + ' ' + title` (the return bar says "§C Bell basis, step 4"), `question = insight = summary`, `lecture {summary, pages}`, `books []`, `clues []`, `play []`, `story` = its beats, `claims = allClaims(beats)`, `visual = NOTES_VISUAL` (the Papers precedent `{kind:'bit-table', props:{}, tryThis:[]}`; never rendered by the notes page) |
| `Beat` per paragraph | `id '<section>:b<k>'`, `phase 'lecture'`, `text`, `claims`, `stage` = the paragraph's figure, else the previous beat's, else `NOTES_NO_FIGURE`; **`caption` is set only when the paragraph has a figure**, and the page draws a figure exactly where `caption` is set |

Rules `notesProblems` enforces beyond the shared lints (which run on the compiled lecture): id and slug shape, unique sections, page format and monotone order, paragraph and lecture word windows,
figure stage passes `validateLayout` and its kinds are in `FIGURE_KINDS` minus `hopf`, claim keys match `^n<number>[A-Z][A-Za-z0-9]*$`, every symbol site exists. Gloss ids, bridge ids, TeX and 8-grams are the shared tests' job.

**Files a content author writes per lecture:** `qc709/notes/N8.ts` (`export const N8: Lecture = notesLecture({…})`), `N8.values.ts` (`V`, `claim = keyedClaim<ValueKey>()`, `close, d, pct, tf, uf`, keys `n8…`),
`pipeline/claims_notes/n8.py` (numpy twin of every key -> `physics/__fixtures__/claims-notes/n8.json`), then `UPDATE_META=1` twice. No glossary file: a note defines no concept
(single owner per concept); it tags `qc-…` and 448 glosses, and the symbol lint accepts a symbol defined by a gloss tag's `symbols`. Bridges: reuse rows of `qc709/bridges.ts`, append the missing ones
(a row never used still fails `bridges.test.ts`). Notes are paraphrase plus printed page: the verbatim guard scans every literal in `src/content/**` (`verbatim.test.ts` l.7), so `N8.ts` is covered with no change.

**Feeds are derived, not authored.** The chapter units that teach a section are the targets of the `<<qc-q6-bell-basis|…>>` bridges in its prose. `meta.test.ts` computes them (bridge lookup over the compiled lecture)
into the generated registry, so the index's "feeds Q6, Q7" and the reverse chapter links have one source: the prose the reader sees.

## 2. Rendering

| | A. `LecturePage` in Read mode | B. New `NotesPages.tsx` (chosen) |
|---|---|---|
| Reader-visible | Read mode is a global viewer preference (`spinlab.readmode.v1`, `ui/readModePref.ts`): a Story-mode reader would get the pinned stage; we would force it per route | A single reading column |
| Chrome it drags in | `RouteRail`, `TrackToggle`, "The lecture says" eyebrow and a passport line under every paragraph (`StaticStory`), `TryIt` widget per unit (`UnitView`), insight, review, challenges; GSAP on wide screens when live | None of it |
| Runtime chunks | widget registry chunks per unit (the mandatory `visual`), notation key, tex, svg kinds | tex, svg kinds, notation key (lazy as today) |
| New code | 0 pages, but a read-mode override, a "notes" branch in four components | about 250 lines of TSX and 120 of CSS, no branch in shared components |
| Risk to 448 / 709 chapters | touches `LecturePage` (357 lines, scroll, restore, GSAP) | none: `LecturePage` and `StaticStory` stay untouched (one `export` added) |

B reuses: `Rich` (KaTeX, gloss popovers, bridge chips), `useLecture`, `useQcPack`, `useSvgKinds`, `lazyTex`, `SvgStill`, `FigureFor`, `NotationScopeContext` + `chapterVocab` (marks and cards "where they already work"),
`NotationKeySlot` ("Notation in this lecture"), `BeatContext`, `placeFromSearch` + `restoreWhenSettled` (the return trip; ~30 lines copied from `LecturePage`), `FidelityNotes` (export it from `StaticStory.tsx`).
Page structure: header (eyebrow "Physics 709 · Lecture notes", title, date, pages range, topics), then per section `<section id="n8-bell" aria-labelledby="n8-bell-title"><h2 id="n8-bell-title">§C Bell basis <span>p. 25–26</span></h2>`,
paragraphs as `<div className="notes-beat" data-beat id="n8-bell:b2">` (the return bar needs `[data-beat]` and `<unit>-title`), figures as `<figure>` with a numbered caption, a "Learn it in the chapter" row (the section's bridges, from prose), then the notation key and a previous/next lecture link.
The page provides `TrackContext = useTrack('qc709')` so a bridge followed from a note writes the reader's own track into `ret` (the return then leaves the 709 track preference unchanged), while text is always the single voice.
`stage/readingPosition.ts` `BEAT_SELECTOR` gains `.notes-beat[data-beat]`. No `requestStageHost`, so no canvas and no `window.__stage`.

## 3. Figures

Evidence: `stage/SvgStill.tsx` draws any SVG-kind layout "at the end of the beat's hold (s = 1)" from `resolve(state, 1)` with the live scene component (`def.Scene mode="stage"`), needing only `useSvgKinds` (the `svg/kinds.ts` chunk).
`stage/figures/FigureFor.tsx` draws the print figure of every kind in `FIGURE_KINDS` (21 kinds; `hopf` is a labelled placeholder) from the same `resolve(state, 1)`, three-free, already in the entry (`LecturePage` imports it statically). So:
- **SVG kinds** (`complex-plane amplitudes circuit matrix two-qubit plot bb84 clocks grover-plane bits code spacetime surgery-graph module-map pauli-program wavefunction`): `SvgStill` on screen; the numbered `FigureFor` for print (`svg.css` already hides `.svg-still` under `@media print`).
- **Flat GL kinds** (`bloch bloch-ball hilbert-plane operator-space lab-r3`): `FigureFor` shown on screen (`.notes-figure .print-figure { display: block }`), a fixed oblique projection of the same resolved numbers.
- `hopf` is refused by `notesProblems`. A layout (`split`, `inset`) works as in chapters. A figure never states a number the engine did not compute: the geometry comes from `resolve`, and any number in the caption needs a claim.
Figure numbers are `N8.1, N8.2, …` over paragraphs that have `figure` (the page counts them; `figureNumbers()` would number the first beat of every unit).

## 4. Routes, navigation, links, return

- **Routes** (`App.tsx`, before `/709/*`): `/709/notes` -> `NotesIndex` (`lazy`), `/709/notes/:id` -> default export (`lazyTex`, like `PaperChapter`), `/709/notes/L:n` -> `<Navigate>` to `N<n>`. `paths.ts`: `lecturePath('N8')` = `/709/notes/N8`, `coursePath('qc709','notes')` = `/709/notes`; `courseOfPath` already maps `/709/*` to `qc709` (cryostat theme, 709 topbar). `Chapter709Page` redirects `/709/ch/N8` to the notes route.
- **Topbar and home**: `App.tsx` nav gets `{course === 'qc709' && <NavLink to={coursePath('qc709','notes')}>Notes</NavLink>}` before Arcade; `CourseHome709` hero gets one link "Lecture notes, L1 to L11". `LecturesMenu` is unchanged.
- **Index page** reads only the light registry (no lecture chunk): one row per built lecture, "Lecture 8 · 2 Oct 2026 · pp. 31–40 · Bell states, GHZ, parities · feeds Q6, Q7" with a link, and its sections as anchors; a closing line "later lectures arrive after each class".
- **Notes -> chapter**: prose `<<qc-q6-bell-basis|Unit 6.2>>` is the existing bridge. `RoutedBridge` already computes `ret` from `params.id`, `chapterCourse(chapter)` (finds `qc709` once `chapterId` accepts `N`), the beat under the link (`BeatContext`) and the track. `parseReturnSyntax` then accepts `qc709~N8~n8-bell:b2~0.4~formal` (unit must start `n8-`).
- **Chapter -> notes**: `content/unitNotes.ts` (main chunk, ~40 lines, pure): `registerUnitNotes(rows)` / `notesForUnit(unitId)`; `qc709/registry.ts` fills it (and registers bridge rows `qc-n8-<slug>` = `{course:'qc709', lecture:'N8', unit:'n8-<slug>', label:'Lecture 8 notes, §C, pp. 25–26'}`) from the generated `NOTES_BY_UNIT`.
  `components/UnitNotesLink.tsx` renders, under the unit question in `ChapterCard`, one `BridgeLink` chip per note ("From the lecture notes: Lecture 8 §C, pp. 25–26"); it renders nothing for 448 units and for units no note feeds. `bridgePlace` (bridgeRegistry.ts) answers "Lecture 8 notes" for a notes target; the chip then follows the usual path: the bar on the notes page reads "Return to 709 · Chapter Q6 · …, step 3".
- **Return bar for notes**: `knownChapter('N8')` works through `metaById`; `lecturePath('N8')` is the way back; the arrival focuses `#n8-bell-title`; `restoreWhenSettled` puts the paragraph under the centre line. `ReturnBar` loads `qc709/registry` on demand, which now also registers the notes meta.
- **Anchors** `#n8-bell` and `#n8-bell:b2` work; `ScrollToHash` does the rest.

## 5. Chunks and security

- Location `content/qc709/notes/` makes everything there `is709Content` (`build/chunkGraph.ts` l.46): rule (h) (nothing in the entry) and (i) (never beside a 448 lecture) cover it already; `lectureOf` does not match it, so rules (d) and (d2) are unaffected.
- `content/load.ts`: `import.meta.glob(['./qc709/notes/N[0-9]*.ts', '!./qc709/notes/N*.*.ts'])` -> `NOTES_LOADERS` joined into `ALL_LOADERS`, `LOADABLE_NOTES` exported; each lecture is its own chunk. The notes meta rides in the 709 registry chunk (lazy, 709 pages only). The page chunk `NotesPages` is lazy and imports no lecture statically.
- **New rule (r)** in `build/chunks.test.ts` (helpers `isNotesContent`, `notesOf` in `chunkGraph.ts`): nothing under `content/qc709/notes/` and not `pages/NotesPages.tsx` in the entry closure; every `N<k>.ts` on disk is bundled in exactly one chunk, with its own values only; no chunk holds two notes lectures, a Q/F chapter or a 448 lecture; the page chunk and the registry chunk are lazy; the registry chunk holds `meta.generated.ts` and no lecture file; entry budget (l) is unchanged.
- CSP / no-eval: no new construct. The kit is plain functions; the globs are static literals (the AST gate in `security/*.security.test.ts` scans the new files automatically). `Rich` is the only TeX path. `e2e/security.spec.ts` `ROUTES` gains `#/709/notes` and one `#/709/notes/N<k>` per built lecture (0 CSP violations, 0 third-party requests).
- `ret` hostility: `returnParam.security.test.ts` gains notes cases (`qc709~N8~n9-x…`, `qc709~N0~…`, a unit of another note, `L8` as a notes id) that must all parse to null.

## 6. Tests

New unit tests:
1. `qc709/notes/kit.test.ts`: one inline fixture spec (not under `__fixtures__`: rule (k)); each `notesProblems` rule fails on a mutation (bad slug, duplicate section, pages decreasing, 41-word sentence, paragraph over 120 words, short and full windows, figure with `hopf`, claim key off-pattern, unknown symbol site); compile shape (beat ids, caption only on figures, stage carry-forward, `validateLayout` clean, determinism).
2. `qc709/notes/notes.test.ts` over `NOTES_CHAPTERS` (eager `index.ts`): each file exports the id it is named after; pages never decrease across a lecture; every bridge target is a built unit; feeds and the reverse index equal the generated registry; the reverse chapter links point at existing sections; word windows hold.
3. `content/unitNotes.test.ts`: the reverse index registers `qc-n8-*` bridges, resolves them, and a 448 unit has none.
4. `pages/NotesPages.test.tsx` (SSR, like `Pages709.test.tsx`): index row (date, pages, topics, "feeds Q6"), lecture markup (section ids and `-title`, `data-beat`, figure SVG with `role="img"`, bridge chips, no `<canvas>`), unknown id answers "No lecture notes called …".
Existing suites extended: `content.test.tsx` (notes in `ALL`, not in `QC`; `tracksOf` -> `tracksOfChapter`), `symbols.test.ts` (TRACKED + cap 40), `claims.test.ts` (TRACKED, twins glob `claims-notes/*.json`; the "at least one number per unit" guard becomes "per lecture" for notes, see Q3), `qc709/bridges.test.ts` (notes prose counts as use), `meta.test.ts` (fourth registry, `UPDATE_META=1` TWICE, second run writes nothing), `courses.test.ts`, `paths.test.ts`, `returnParam.security.test.ts`, `build/chunks.test.ts` (rule r).
e2e `e2e/notes.spec.ts` (both projects): index -> lecture; section numbering and pages as printed; a figure drawn (`.svg-still svg[role=img]`) and 0 canvases; a notes bridge opens the chapter unit with the return bar; Return restores the paragraph and focus; the chapter unit shows "From the lecture notes" and its chip opens the section with a bar back; 0 console errors (`collectErrors`).
Print (cheap): in `notes.spec.ts`, `page.pdf()` in memory, count `.print-figure` equals the page's `data-figures`. Judge-run only: gate, Playwright projects, `audit_public.py --verbatim`.

## 7. Context bus

- New card `docs/context/cards/notes-platform.md` (<= 1.5k tokens): the `NotesSpec` sketch above, id rules, the one-voice lint profile, files per lecture, "feeds are derived from bridges", figure kinds, commands. Cards updated in the same commit: `content-model` (id family `N`, `tracksOfChapter`), `bridges-notation` (notes links, `ret` into `N<k>`), `tests-and-gate` (rule r, new tests), `stage-kinds` (one line: notes figures use `SvgStill`/`FigureFor`, no new kind), `conventions.md` (C1 table row, C5 commands), `README.md` (card list).
- `pipeline/context/build_context.mjs` learns: `RULINGS` entry `N<k>` -> `['qc709-notes.md']`; `CARDS` row `{card:'notes-platform', forKinds:['N']}`; `beatIndex()` also reads `qc709/notes/N*.ts`, but beat ids are generated, so it takes paragraph counts from `NOTES_META` (`paras` per unit); `coursesWorld()` adds `notes: mk('notes', metaArray('app/src/content/qc709/notes/meta.generated.ts','NOTES_META'))`; `UNIT_TOKEN` and `GLOSS_TOKEN` prefix classes accept `n`; `plansWorld()` already matches `P-N8-story.md` (`### Unit \`n8-bell-basis\``); `chapterNo`/sort treat `N` after `Q`; a `notesFeeds` map in `ids.json` (section -> chapter units) so a plan can check its links; `claimKeysWorld()` adds `['claims-notes','notes']`; `bridgesWorld()` unchanged (generated `qc-n*` rows are not in a table).
- Plans for notes lectures are named `P-N8-story.md` (sections as units, the paragraph list per unit); the judge's rulings in `docs/roles/decisions/qc709-notes.md`.

## 8. Files

**Add (14 platform files; content is per lecture):**

| file | purpose |
|---|---|
| `app/src/content/qc709/notes/kit.ts` | `NotesSpec` types, `notesProblems`, `notesLecture`, `NOTES_VISUAL`, `NOTES_NO_FIGURE` |
| `…/notes/kit.test.ts` | validator and compile tests |
| `…/notes/index.ts` | eager registry for tests (`NOTES_CHAPTERS`, `NOTES_FILES`) |
| `…/notes/values.ts` | `NOTES_VALUES` merged by file name (`N*.values.ts`) |
| `…/notes/meta.generated.ts` | GENERATED `NOTES_META` (id, number, title, date, pages, topics, units with pages, paras, feeds) and `NOTES_BY_UNIT` |
| `…/notes/notes.test.ts` | registry, pages, feeds, reverse-index invariants |
| `…/notes/N1.ts`, `N1.values.ts` | one seed lecture (two sections, one figure, one claim, one bridge) so the platform has a real subject; P replaces its prose |
| `app/src/content/unitNotes.ts` (+ `unitNotes.test.ts`) | main-chunk reverse index and `notesForUnit` |
| `app/src/components/UnitNotesLink.tsx` | "From the lecture notes" chips |
| `app/src/pages/NotesPages.tsx` (+ `NotesPages.test.tsx`) | index and lecture pages |
| `app/src/styles/notes709.css` | `.notes-*`, print rules (loaded with the page chunk) |
| `app/e2e/notes.spec.ts` | e2e |
| `pipeline/claims_notes/n1.py` + `app/src/physics/__fixtures__/claims-notes/n1.json` | numpy twin |
| `docs/context/cards/notes-platform.md` | the card |

**Change:** `content/courses.ts` (ids, chapterId, tracks/caps helpers, notes meta), `content/meta.ts` (`metaById` fallback), `content/load.ts` (notes loaders), `content/bridgeRegistry.ts` (`bridgePlace` for notes),
`content/values.ts` (merge), `content/qc709/registry.ts` (register meta, reverse index, bridge rows), `paths.ts`, `App.tsx` (routes, nav, lazy imports), `pages/Chapter709Page.tsx` (redirect `N` ids),
`pages/CourseHome709.tsx` (hero link), `components/UnitView.tsx` (one line in `ChapterCard`), `stage/StaticStory.tsx` (`export FidelityNotes`), `stage/readingPosition.ts` (selector). Tests: the ten listed in section 6.
Also `e2e/security.spec.ts`, `build/chunks.test.ts` + `build/chunkGraph.ts`, `pipeline/context/build_context.mjs`, the cards, one relay note.

## 9. Build order for ONE builder agent (about 85 steps, hard cap 150) and acceptance

1. (6) Ids: `courses.ts`, `meta.ts`, `paths.ts`; extend `courses.test.ts`, `paths.test.ts`, `returnParam.security.test.ts`. Run those three.
2. (10) `kit.ts` + `kit.test.ts` (write each whole). Run the file.
3. (8) Seed `N1.ts`/`N1.values.ts` + `claims_notes/n1.py` (run twice, `cmp`); `values.ts` merge; `claims.test.ts` twins glob; `index.ts`.
4. (8) `meta.test.ts` fourth registry (+ feeds and `NOTES_BY_UNIT` generation); `UPDATE_META=1` twice; `load.ts`; `registry.ts`; `notes.test.ts`.
5. (8) `unitNotes.ts`, `bridgeRegistry.ts`, `UnitNotesLink.tsx`, the `UnitView` line; tests.
6. (16) `NotesPages.tsx`, `notes709.css`, `readingPosition` selector, `App.tsx` routes and nav, home link, `Chapter709Page` redirect; `NotesPages.test.tsx`.
7. (8) Lint wiring: `content.test.tsx`, `symbols.test.ts`, `claims.test.ts` (per-lecture number guard), `bridges.test.ts`; run `npx vitest run src/content src/pages src/ui src/paths.test.ts --reporter=dot` once.
8. (7) `chunkGraph.ts` helpers + rule (r), `security.spec.ts` ROUTES, `e2e/notes.spec.ts` (edit, do not run).
9. (10) Context bus: generator, card, card updates, relay note; `node pipeline/context/build_context.mjs N1` (expect 0 flags); `graphify update .`.
10. (4) `npx tsc -p tsconfig.app.json --noEmit` and `npx tsc -b`, fix, commit by explicit paths.

**Acceptance (builder):** `tsc` 0 errors; the targeted vitest above green; meta regenerated twice with no diff on the second run; numpy twin byte-identical on two runs; no file under `physics/` or `stage/` edited except the two one-line items named; no local paths in committed files.
**Acceptance (judge's gate):** `npm run build` then full vitest incl. rule (r) with the entry within budget; both Playwright projects (`notes.spec.ts`, `security.spec.ts` with the new routes, `course709.spec.ts` unchanged); contact sheet of the N1 page at 1000 and 375 px; `audit_public.py --verbatim`.

## 10. Open questions for the judge (recommendation first)

1. **URL spelling.** Internal id `N8` (forced: `L8` is 448's). Canonical `#/709/notes/N8`, with `/709/notes/L8` redirecting. Recommend yes; the owner's "L8" stays in the title ("Lecture 8 notes").
2. **A fourth CourseId instead?** Recommend no (section 1: 14 more production files, no extra capability).
3. **"At least one number per unit" (claims.test.ts l.236).** Short sections ("what a superposition is") may show none. Recommend: for notes the guard is per lecture (each full lecture shows >= 3 numbers, each short one >= 1); the displayed-number ledger itself is unchanged.
4. **Feeds derived from prose bridges** (recommended) versus an explicit `feeds` field. Derivation means a section nobody links shows no "feeds"; add a lint that every section of a full lecture links at least one built unit.
5. **Seed lecture.** The builder writes `N1` (L1 §I.A-B, pp. 2-5, per `P-709-remap-L1L7.md` §1.1) so the e2e has a subject; P then overwrites it. Alternative: wait for P's N1; recommend the seed, because the platform cannot be accepted on a fixture alone.
6. **Granularity of the chapter link.** Per unit (recommended): each chapter unit lists the sections that feed it. A per-beat link on `phase: 'lecture'` beats can follow later without a schema change.
7. **No glossary file for notes**, no Arcade, Map, Formulas or Help presence. Recommend as designed; a Formulas section from notes equations can be added later from `Unit.lecture.equations`.
8. **`sentenceCapOf` = 40 for notes** (the owner's rule) even though the content is Ground-up readable; recommend 40, and the one-voice text uses the Formal register of the owner's notes, with symbols defined at first use.
9. **Print.** Cheap path (figures and running head, no "Print notes" button logic): `window.print()` button only. Recommend yes; a dedicated print stylesheet pass only if the judge asks.
10. **Weekly additions.** A new lecture is: three files + one twin + `UPDATE_META=1` twice + one `ROUTES` line in `security.spec.ts` + one e2e count. Recommend adding the `ROUTES` line to the lecture checklist in the card (it is the one shared edit).
