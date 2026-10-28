/**
 * Chunk contract (W-L1 §6.1; Babylon rules rewritten for the /lab, decisions/lab.md #8, W-lab §5), read from
 * app/node_modules/.tmp/chunk-modules.json (written by build/chunkReport.ts after `vite build`; kept out of dist/
 * so it never ships). Scopes (entry closure, lecture chunks, lab chunks) are defined in build/chunkGraph.ts.
 *   (a) Babylon: no @babylonjs module in the entry closure or in any lecture chunk; every chunk holding Babylon is
 *       a lab chunk (reachable from the entries only through the dynamic import of the lab gate
 *       `src/lab/babylon/mountLab.ts`); the gate chunk holds only lab/babylon code and Babylon; the lab page chunk
 *       holds none; sanity: Babylon IS present once the lab has landed (so (a) cannot pass by measuring nothing);
 *   (b) three.js and @react-three are neither in the entry chunk nor in any chunk it imports statically
 *       (so the first paint never waits for WebGL code);
 *   (c) sanity: three.js IS in some other chunk, so (b) cannot pass by measuring nothing;
 *   (d) no lecture's content (L{N}.ts / .story / .review / .values) is in the entry chunk or its static imports, and
 *       no two lectures share a chunk: each loads on its own when its page opens (content/load.ts);
 *   (e) none of the Babylon modules that fetch remote code or inject <style> by default is bundled (S-lab §3a):
 *       inspector, loaders and other @babylonjs packages, debug layer, mesh compression decoders, KTX2/Basis,
 *       Havok, XR, CSG2, environment/scene helpers, loading screen, scene loader, audio, WebGPU;
 *   (f) no three.js / @react-three in the lab chunks or the lab page chunk (two renderers never share a chunk);
 *   (g) byte budgets for the lab chunks (measured, plus ~15 %).
 * Two courses (W-709-platform §A "Chunk contract"), amended by rulings 448-L8L11 P6 (interface change W-448 #5): the
 * multi-qubit engine (src/physics/qc/) and the SVG stage kinds (src/stage/svg/) are SHARED code a 448 lecture may use;
 * course CONTENT (content/L*, content/qc709/) stays separated:
 *   (d) covers both courses' chapters (L{N}, and 709's Q{n} / F{n} under content/qc709/);
 *   (h) no 709 CONTENT module (content/qc709/) and no shared multi-qubit engine module (physics/qc/) in the entry
 *       closure: the first paint of any page carries neither;
 *   (i) no chunk holds both 709 content (content/qc709/) and a 448 lecture's content (physics/qc and stage/svg are
 *       shared, so a chunk may hold them with either course);
 *   (j) no Motion Canvas or films-pipeline module in any chunk (offline tooling only);
 *   (k) no DEV content fixture (the 448 demo story, the 709 demo chapter) in any chunk of a production build;
 *   (l) a byte budget for the entry closure (the first paint), measured plus ~5 %.
 * The SVG route (W-709-platform §E, content/stage.ts KIND_RENDER):
 *   (m) the SVG kinds (src/stage/svg/: their resolvers call physics/qc) load lazily: none is in the entry closure, and
 *       no 448 lecture chunk holds or statically imports one (a lecture may USE a kind, but names it by data; the
 *       kinds' chunk stays lazy and loads on demand); sanity: they ARE bundled.
 *   (n) Physics 448's per-lecture data is lazy, so the entry stops growing with each lecture: the glossary, the unit
 *       details, the fidelity tables, the concept map's stations and the Arcade's rounds (SL448_LAZY_DATA) are in no chunk
 *       of the entry closure; the first three live in the 448 pack (content/pack448.ts, loaded with every lecture and with
 *       709's pack), which holds no lecture file; sanity: all of them ARE bundled.
 * The notation explainers (decisions/notation-explainers.md; interface change W-notation B):
 *   (o) the listener (components/NotationRuntime.tsx), the card (components/NotationCard.tsx), the chapter key
 *       (components/NotationKey.tsx), the dictionary (content/notation*.ts) and the TeX pre-processor (ui/notationMark.ts)
 *       are lazy: none is in the entry closure, each is bundled, and the dictionary's chunk holds no chapter content of
 *       either course. What the entry carries for them is the pref, the toggle, the mount point, the vocabulary of a mark
 *       and the trusted-renderer check (a few hundred bytes of each).
 * The lazy platform pass (decisions/qc709-deferred-features.md D4; interface change W-platform lazy):
 *   (p) KaTeX (the library and ui/tex.ts), GSAP (`gsap`, `@gsap/react`) and the 2-D widgets (everything under widgets/ but the
 *       registry, which is the lazy table the entry carries) are in no chunk of the entry closure: the first page that typesets
 *       loads KaTeX (ui/texLoader.ts), the first live story loads the story scroll's GSAP half (stage/useStoryScroll.ts), and a
 *       lecture fetches the chunks of the widgets it shows (widgets/registry.tsx). Sanity: all three ARE bundled, and every widget
 *       file on disk is in some chunk outside the closure.
 * The Papers section (docs/specs/papers-platform.md §6; interface change W-papers #1):
 *   (q) nothing of the Papers section (content/papers/, papers/, pages/PapersPages.tsx) is in the entry closure; each paper
 *       spec is a chunk of its own (no other spec, no chapter of 448 or 709 beside it); no chunk holds Papers content with 709
 *       content or a 448 lecture's; the papers pack holds every chapter's glossary and no spec, and brings the 448 pack;
 *       sanity: the pages, the registry, the pack, the recipe registry and every spec on disk ARE bundled.
 * The 709 lecture notes (docs/roles/proposals/W-709-notes.md §5; rulings docs/roles/decisions/qc709-notes.md W12):
 *   (r) nothing of the notes (content/qc709/notes/, pages/NotesPages.tsx) is in the entry closure; every lecture on disk is bundled, in one
 *       chunk with its own values, and no chunk holds two notes lectures or another lecture's story, content or glossary module (a
 *       709 chapter's VALUES module is allowed: a notes claim may cite a chapter-owned key, W12); the listing (`meta.generated.ts`) rides
 *       in the lazy 709 registry chunk and holds no lecture; the page imports no lecture statically. The entry budget (l) is unchanged.
 * The 709 Optics Lab, the second notes collection (rule (r), optics half; one platform, the same lazy shape):
 *   (r) nothing of the optics (content/qc709/optics/, the embedded widget widgets/OpticsBench.tsx and widgets/opticsBench/) is in the entry
 *       closure; every optics page on disk is bundled, in one chunk with its own values, and never beside another page, a lecture-notes
 *       lecture or another lecture's story, content or glossary module (a chapter's values module is allowed); the listing rides in the lazy
 *       709 registry chunk, beside the notes listing, and holds no page; the notes page imports no optics page statically; the bench and its
 *       presets table are lazy chunks of their own. The entry budget (l) is unchanged.
 * Runs only after `vite build`; skipped (with the reason in the title) when the report is absent.
 */
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import {
  bytesOf, chunksWith, entryStaticClosure, is448Lecture, is709Content, isBabylon, isContentFixture, isFilmTooling, isGsap, isKatex, isNotationLazy, isPapersContent, isPapersModule, isR3F, isSharedQc, isSvgKindModule, isThree, isWidgetModule,
  isNotesContent, isNotesModule, isOpticsContent, isOpticsModule, isOpticsWidget, opticsLeaks, opticsOf, LAB_GATE_MODULE, LAB_PAGE_MODULE, labScopes, lectureChunks, lectureOf, mixedCourseChunks, notesLeaks, notesOf, paperOf, papersMixedChunks, SL448_LAZY_DATA, SL448_PACK_MODULE, walk, WIDGET_REGISTRY_MODULE,
} from './chunkGraph.ts'
import { type ChunkReport, CHUNK_REPORT_PATH, chunkReportFile, relativeModuleId } from './chunkReport.ts'

const APP_ROOT = fileURLToPath(new URL('..', import.meta.url)).replace(/\\/g, '/').replace(/\/$/, '')
const REPORT = chunkReportFile(APP_ROOT)
const present = existsSync(REPORT)
const report: ChunkReport = present ? (JSON.parse(readFileSync(REPORT, 'utf8')) as ChunkReport) : {}

/** Pure lab helpers the gate may carry (no page code, no React): the physics → render axis map. */
const LAB_GATE_PURE = ['/src/lab/axes.ts']

/** Flipped when the Babylon engine lands (W-lab §6 step 3): from then on Babylon MUST be found behind the gate. */
const LAB_LANDED = true

/**
 * Babylon modules that must never be bundled (S-lab §3a, decisions/lab.md #9): each fetches remote code or data by
 * default (CDN decoders, HDR environments, wasm, snippet server), injects <style>, or opens devices we never use.
 */
const BANNED_BABYLON: [RegExp, string][] = [
  [/\/@babylonjs\/(?!core\/|gui\/)/, 'only @babylonjs/core and @babylonjs/gui are allowed (no inspector, loaders, materials, serializers, addons, editors)'],
  [/\/@babylonjs\/core\/Debug\/debugLayer/, 'debug layer loads the Inspector from a CDN'],
  [/\/@babylonjs\/core\/Meshes\/Compression\//, 'Draco / meshopt decoders (CDN + wasm)'],
  [/\/@babylonjs\/core\/Misc\/(khronosTextureContainer2|basis)/, 'KTX2 / Basis transcoders (CDN + wasm)'],
  [/\/@babylonjs\/core\/Materials\/Textures\/Loaders\//, 'texture loaders (KTX2, Basis, HDR, env)'],
  [/\/@babylonjs\/core\/Physics\//, 'physics plugins (Havok is wasm + new Function)'],
  [/\/@babylonjs\/core\/XR\//, 'WebXR (controller models from a CDN)'],
  [/\/@babylonjs\/core\/Meshes\/csg2/, 'CSG2 (wasm from unpkg)'],
  [/\/@babylonjs\/core\/Helpers\//, 'environment / scene helpers (HDR from assets.babylonjs.com)'],
  [/\/@babylonjs\/core\/Loading\/(?!sceneLoaderFlags\.js$)/, 'loading screen (<style>) and scene loader (the inert flags module is allowed)'],
  [/\/@babylonjs\/core\/(Audio|AudioV2)\//, 'audio engine (never used; audioEngine: false)'],
  [/\/@babylonjs\/core\/Engines\/(webgpuEngine|WebGPU\/)/, 'WebGPU engine (glslang/twgsl from a CDN)'],
]

/**
 * Entry-closure budget (l): the entry chunk and everything it imports statically = what the first paint of any page
 * downloads before React renders. History (raw / gzip, level 9):
 *   before the second course (main 93fe072, 2026-09-27)           897 804 / 291 737 (5 chunks)
 *   709 platform 3/5 (registry, paths, useCourse; 709 pages lazy)  903 188 / 294 520 (10 chunks: react, the router
 *                                                                     and paths now split out of the entry file)
 *   709 platform 5/5 (+ switcher, lastPlace, theme hook)            909 736 / 296 039 (9 chunks)
 *   2026-09-28, after the 709 pilots: platform B (tracks, bridges, return bar, print), the SVG route, the rail's
 *   reading controls, course-aware Arcade list and the DecorVideo mount points                 951 295 / 311 066 (14 chunks)
 *   → budget raised to 965 000 / 315 000 (≈ 1.3 % over the build): all of it is platform code both courses use; no 709
 *     content is in the entry (rule (h) is green). Follow-up (BUILD-LOG open issues): lazy-load the 2D widgets and
 *     KaTeX, which would free far more than this.
 *   2026-10-09, the 448 platform pass for Lectures 8–11 (class marker, Go-deeper phase, bridges in both directions with the
 *   Spin Lab return bar, the shared SVG-kind fidelity registration; physics/qc and stage/svg stay out of the entry)
 *                                                                 958 730 / 313 631 (15 chunks), against 958 084 / 313 639
 *                                                                 (17 chunks) for the previous main build: +0.07 % raw, gzip flat:
 *                                                                 budget unchanged; no 709 content is in the entry
 *   2026-10-09, Physics 448 Lecture 9 (composite systems): the entry carries every 448 lecture's glossary entries, concept
 *   stations and light registry, and the passports of the `matrix` kind's new pair view (content/stage.ts): 11 glossary
 *   entries, 6 stations, 6 unit cards, 4 passports. 968 945 / 316 894 (15 chunks), against 958 730 / 313 631 before it
 *   (+1.1 % raw, +1.0 % gzip): the lecture itself is its own chunk (L9-*.js) and the pair view lives in the lazy SVG-kind chunk.
 *   Budget raised to 985 000 / 325 000 (the next lectures' glossaries and registries will need the same, one step at a time).
 *   2026-10-09, Physics 448 Lecture 8 (polarization and BB84): 990 922 / 324 602 (15 chunks), against 968 945 / 316 894 for L9
 *   (+2.3 % raw, +2.4 % gzip). What the entry gained: the Arcade's data (four Spot-the-error rounds and Catch Eve's five levels in
 *   arcade/games.ts, no engine: the verdicts are arcade/catchEve.ts, loaded with the game page), the photon-turn and variance-budget
 *   resolver (stage/resolve.ts, stage/budget.ts, physics/polarization.ts, the density chunk's pauliVariances), the new fidelity and
 *   passport entries (content/fidelity.ts, stage.ts) and ~30 glossary entries. The lecture (L8-*.js), the bb84 kind, the plot's log
 *   axis, the two widgets and the BB84 engine are lazy chunks (rule (h) holds). Budget raised to 1 000 000 / 330 000.
 *   2026-10-10, Physics 448 Lectures 10 and 11 (entanglement and the GHZ game; quantum dynamics), merged: 1 014 391 / 332 021
 *   (15 chunks), against 990 922 / 324 602 for L8 (+2.4 % raw, +2.3 % gzip). Each lecture fitted a budget alone (L10 1 004 357 /
 *   328 944, L11 1 000 262 / 327 405, both measured against L8) but their entry additions add up. What the entry gained: the Arcade's
 *   data (nine more Spot-the-error rounds, the GHZ game's four levels and the Waiting game of Bloch golf in arcade/games.ts, no
 *   engine: the verdicts are arcade/ghz.ts, loaded with the game page), 26 glossary entries, 14 concept stations and map stations, the
 *   unit and challenge cards of both lectures (content/meta.generated.ts), the `clocks` passport, shots, anchors and stage ground
 *   (content/stage.ts, stageVocab.ts, stage/tokens.ts) and the fidelity items. The lectures (L10-*.js, L11-*.js), the clocks kind,
 *   the two-clocks, two-spin and ghz-game widgets and the engines (physics/qc/ghz.ts, twoSpin.ts, physics/dynamics.ts) are lazy chunks
 *   (rule (h) holds). Budget raised to 1 025 000 / 335 500 (+1 % over the build).
 *   2026-10-11, main e36eaf1 (709 F8 merged, 448 through L11): 1 016 165 / 332 649 (15 chunks), the three raises above having
 *   grown the budget with every lecture (the glossary, concept stations, unit questions and equations, Arcade rounds and fidelity
 *   tables all lived in the entry). "Lazy 448 pack": the glossary, the unit details (content/meta.detail.generated.ts) and the
 *   fidelity tables (content/fidelity.sl448.ts) ride in content/pack448.ts, loaded with every lecture (content/load.ts) and with
 *   709's pack; the Arcade list, the concept map and the formula sheet are lazy routes (their data with them); the entry keeps ids,
 *   titles and challenge ids (LECTURE_META) and the registries. Per step: glossary 963 002 / 316 687 · Arcade, map, formulas
 *   904 500 / 297 744 · unit details 890 772 / 293 595 · fidelity 871 751 / 286 421 (16 chunks: one more shared chunk) = -14.2 % raw,
 *   -13.9 % gzip. BUDGET LOWERED to 915 000 / 301 000 (+5.0 % / +5.1 % over the build); rule (n) keeps the lecture data out, so
 *   a new lecture no longer raises it (only its row of LECTURE_META, ~1.2 KB raw, and platform code a lecture truly needs).
 *   2026-10-11, notation explainers merged onto the lazy 448 pack: 878 993 / 289 054 (17 files), against 871 751 / 286 421 (+0.8 % raw,
 *   +0.9 % gzip: the pref, the toggle, the mount point, the mark vocabulary and the trusted-renderer check; rule (o) keeps the rest
 *   lazy). Budget UNCHANGED (915 000 / 301 000: +4.1 % / +4.1 % headroom).
 *   2026-10-11, the lazy platform pass (decisions/qc709-deferred-features.md D4; main d12810c): the entry still carried every 2-D widget,
 *   KaTeX and GSAP, 884 565 / 292 521 (20 chunks). Per step: GSAP out (the story scroll's lazy half, stage/storyScrollGsap.ts, loaded by
 *   stage/useStoryScroll.ts) 772 439 / 249 414 · KaTeX out (ui/tex.ts behind ui/texLoader.ts: the first page that typesets loads it, a Tex
 *   suspends until it has) 508 033 / 170 911 · widgets out (widgets/registry.tsx resolves every kind with a dynamic import and a placeholder of
 *   the widget's height; the home hero is the same SGLab chunk) 472 290 / 161 314 (28 chunks: with the widgets lazy the bundler shares more
 *   small modules between the entry and the lazy chunks) · the home opener's KaTeX loaded beside its chunk 472 270 / 161 306 · main's Q15
 *   ledger merged (the bb84 kind's new state fields) 472 610 / 161 395 · the lecture page waits for its widgets and for the notation marks
 *   (stage/lectureWidgets.ts, useWidgetsReady, useNotationReady: so the page shows once, final, and a late layout change cannot cancel a
 *   reader's smooth scroll) 473 869 / 161 869 = -46.4 % raw, -44.7 % gzip. BUDGET LOWERED to 497 500 / 170 000 (+5.0 % / +5.0 % over the
 *   build). Rule (p) keeps KaTeX, GSAP and every widgets/* module but the registry out of the closure. What is left is the router and
 *   react-dom, the lecture page's own subtree (UnitView, StoryStage, Derivation, FigureFor, ChallengeCard), the lecture index and the
 *   registries; the entry STYLESHEET still carries katex.min.css (moving it into the lazy chunk would change the cascade against app.css's
 *   `.katex` rules: not done).
 *   2026-10-14, the Papers section (docs/specs/papers-platform.md; W-papers #1–#3): 487 428 / 166 191 (29 files), against 480 105 /
 *   164 235 for main 048da31 (+1.5 % raw, +1.2 % gzip). What the entry gained: the course's row in COURSES, its four routes' lazy
 *   imports and nav, the switcher's swatch and world line, the spec loaders' glob (one dynamic import per spec), the return bar's
 *   on-demand Papers registry, and the two beat lines every story renders (components/BeatPaperNotes.tsx, `reportedWhere`). The
 *   specs, the recipe registry and the engine it calls, the pack, the pages and the concept-map picture are lazy (rule (q)).
 *   Budget UNCHANGED (497 500 / 170 000: +2.1 % / +2.3 % headroom).
 *   2026-10-20, the 448 Townsend pass (L1–L13 books beats, practice questions, the recombining device, the spin-ladder kind): 499 635 / 170 267
 *   (28 chunks), 2 135 B raw over the budget. A shared chunk keeps every export ANY chunk imports, so engine helpers that only a lecture reads
 *   (spin.ts pathLedger/portProbs/schwarzParts, five polarization.ts helpers) rode in the entry; they moved to physics/townsend448.ts.
 *   Per step: townsend448 499 050 / 170 027 · readingOrder (content/readingOrder.ts, re-exported by walk.ts; only the lints and the lazy
 *   notation key call it) 496 635 / 169 234 · hopfRampHex and LAB_MATERIAL (stage/sceneTokens.ts; lazy scenes and the Blender data only)
 *   496 026 / 168 838 = -0.7 % raw, -0.8 % gzip. Budget UNCHANGED (497 500 / 170 000: +0.3 % / +0.7 % headroom).
 *   2026-10-29, after the Optics Lab platform and content passes: 497 525 / 169 324 (28 chunks), 25 B raw over the budget. The opener
 *   caption table (openers/openerCopy.ts: five openers' captions, fidelity lists and frame counts, 9.6 KB source) rode in the entry because
 *   pages/Home.tsx and components/UnitOpener.tsx read `OPENERS` to pass a spec to the lazy player. Both now pass the opener's name to the lazy
 *   openers/OpenerByName.tsx, which reads the table beside OpenerScrub; the entry keeps only the titles (openers/openerTitles.ts, the unit
 *   section's accessible name; openerCopy.ts takes each title from it). 488 810 / 165 988 (27 chunks) = -1.8 % raw, -2.0 % gzip.
 *   Budget UNCHANGED (497 500 / 170 000: +1.8 % / +2.4 % headroom).
 * The entry stylesheet grew 92 707 → 97 713 raw (switcher + theme-cryostat.css); 709's faces (fonts709, 14.7 KB of
 * @font-face) and page styles (course709.css) load only with 709 pages.
 * Set ≈ 5 % above the measured build; raise it only with a reason (and never for 709 content: that is rule (h)).
 */
const ENTRY_BUDGET = { raw: 497_500, gzip: 170_000 } as const

/** 709 chapter files on disk (content/qc709/Q{n}.ts, F{n}.ts): what (d) must find in the build. */
const QC_DIR = `${APP_ROOT}/src/content/qc709`
const QC_CHAPTER_FILES = existsSync(QC_DIR) ? readdirSync(QC_DIR).flatMap((f) => /^([QF]\d+)\.ts$/.exec(f)?.[1] ?? []) : []
/** 448 lecture files on disk (content/L{n}.ts): what (d) and (m) must find in the build. Read from disk so a lecture added
 *  later (L8–L11) is expected without editing this file; the lists used to be hand-written (L1…L7, `>= 7`). */
const L_DIR = `${APP_ROOT}/src/content`
const LECTURE_FILES_448 = readdirSync(L_DIR).flatMap((f) => /^(L\d+)\.ts$/.exec(f)?.[1] ?? [])

/** 709 lecture-notes files on disk (content/qc709/notes/N{k}.ts): what (r) must find in the build. */
const NOTES_DIR = `${APP_ROOT}/src/content/qc709/notes`
const NOTES_FILES = existsSync(NOTES_DIR) ? readdirSync(NOTES_DIR).flatMap((f) => /^(N[1-9]\d*)\.ts$/.exec(f)?.[1] ?? []) : []

/** Optics Lab page files on disk (content/qc709/optics/O{k}.ts): what (r), the optics half, must find in the build. */
const OPTICS_DIR = `${APP_ROOT}/src/content/qc709/optics`
const OPTICS_FILES = existsSync(OPTICS_DIR) ? readdirSync(OPTICS_DIR).flatMap((f) => /^(O[1-9]\d*)\.ts$/.exec(f)?.[1] ?? []) : []

/** Paper spec files on disk (content/papers/P{n}.paper.ts, B{n}.paper.ts): what (q) must find in the build. */
const PAPERS_DIR = `${APP_ROOT}/src/content/papers`
const PAPER_SPEC_FILES = existsSync(PAPERS_DIR) ? readdirSync(PAPERS_DIR).flatMap((f) => /^([PB]\d+)\.paper\.ts$/.exec(f)?.[1] ?? []) : []

/** Widget modules on disk (widgets/<Name>.tsx, not the registry, not a test): what (p) must find outside the entry closure. */
const WIDGET_FILES = readdirSync(`${APP_ROOT}/src/widgets`).flatMap((f) => (/^[A-Z]\w*\.tsx$/.test(f) ? [`/src/widgets/${f}`] : []))

/**
 * Lab byte budgets (g), set ≈ 15 % above the measured build. History:
 *   foundation (2026-09-27, frame check + GUI): firstDraw 1 230 159 / 289 125 · lazy 335 352 / 71 198 · page 10 719 / 4 824
 *   Operator Lab (2026-09-27, + PBR materials, reflection probe + HDR prefilter, outline renderer, drag behaviour,
 *   second camera; the bench page as its own lazy chunk):
 *     firstDraw 1 527 316 raw / 374 706 gzip (1 chunk: core subset + GUI + PBR + lab/babylon)
 *     lazy        695 345 raw / 154 461 gzip (64 shader chunks, GLSL and WGSL twins, PBR's included; WebGL fetches only
 *                                             the GLSL half, on first use)
 *     page         11 822 raw /   5 229 gzip (LabPage + small shared chunks; unchanged by the bench)
 *     benches      33 789 raw /  12 977 gzip (the Operator Lab page chunk + its one shared helper chunk)
 *   Operator Lab review fixes + the two-course platform (2026-09-28: label-avoidance pass reusing the lecture's
 *   placeItem, exact-form cells, Predict-first gating; paths.ts/useCourse in the page's imports):
 *     page         12 565 raw /   5 557 gzip          benches      38 891 raw /  14 719 gzip
 *   budgets re-set ≈ 15 % above these two; firstDraw and lazy unchanged.
 *   Grapher (2026-09-28, the second bench: its own lazy page chunk with the model, fidelity notes, labels and the
 *   < 900 px SVG outline; grapherScene in the gate chunk; one more lazy import in the lab page):
 *     firstDraw 1 548 805 raw / 380 945 gzip (+21.5 KB raw: grapherScene and Babylon's tube builder; under its
 *                                             budget, unchanged)
 *     page         13 191 raw /   5 682 gzip (under its budget, unchanged)
 *     benches      77 821 raw /  30 146 gzip (3 chunks: OperatorBench, GrapherBench, the shared createStore)
 *   the benches budget re-set ≈ 15 % above: a second teaching bench roughly doubles what "benches" measures.
 *   SG bench (2026-09-28, the third bench: its own lazy page chunk with the model, layout, plate marks and flight paths,
 *   fidelity note and the < 900 px dials; physics/field.ts now a small chunk shared with the lecture lab scene; sgScene,
 *   Babylon's disc builder and thin instances in the gate chunk; one more lazy import in the lab page):
 *     firstDraw 1 584 552 raw / 391 473 gzip (+35.7 KB raw; under its budget, unchanged)
 *     page         13 890 raw /   5 851 gzip (under its budget, unchanged)
 *     benches     110 795 raw /  43 596 gzip (6 chunks: the three bench pages, createStore, format, field)
 *   the benches budget re-set ≈ 15 % above: a third teaching bench (its model does the flight geometry on the page).
 *   709 Formulas/Help chunk + stage platform gaps (2026-10-08): no lab code changed, but with both merged the bundler
 *   regroups small shared modules so the page's static imports grow: page 14 573 raw / 6 117 gzip. Page raw re-set
 *   to 15 000 (+3 %, kept tight on purpose: the page itself did not grow).
 *   Lazy platform pass + oracle-bench/B92 merges (2026-10-11): LabPage's three bench Suspense blocks became one (the page
 *   itself shrank), but the bundler regroups the shared lazy plumbing again: page 14 884 raw / 6 414 gzip, 14 B over the
 *   gzip budget. Page re-set to 16 400 / 7 050 (≈ +10 %): between the tight +3 % that drifted twice and rule (g)'s 15 %.
 * `firstDraw` =the gate chunk and its static imports (what /lab downloads before its first frame);
 * `lazy` = the rest of the lab chunks (Babylon's shader chunks, fetched on first use); `page` = the lab route chunk and
 * its static imports outside the entry closure (DOM page, store, frame-check model); `benches` = the teaching benches'
 * page chunks (lazy, one per bench) and what they import beyond the page. Raise a budget only with a reason.
 */
const LAB_BUDGET = {
  firstDraw: { raw: 1_760_000, gzip: 431_000 },
  lazy: { raw: 800_000, gzip: 178_000 },
  page: { raw: 16_400, gzip: 7_050 },
  benches: { raw: 127_000, gzip: 50_000 },
} as const

describe('relativeModuleId', () => {
  it('strips the build machine path', () => {
    expect(relativeModuleId('/Users/a/app/node_modules/three/build/three.module.js', '/Users/a/app')).toBe('/node_modules/three/build/three.module.js')
    expect(relativeModuleId('/Users/a/app/src/main.tsx', '/Users/a/app')).toBe('/src/main.tsx')
    expect(relativeModuleId('\0vite/preload-helper.js', '/Users/a/app')).toBe('vite/preload-helper.js')
  })
})

describe('chunk graph scopes (self-check on a synthetic report)', () => {
  const chunk = (moduleIds: string[], imports: string[] = [], dynamicImports: string[] = [], isEntry = false) => ({ isEntry, isDynamicEntry: !isEntry, name: '', moduleIds, imports, dynamicImports, bytes: 10, gzip: 5 })
  const r: ChunkReport = {
    'entry.js': chunk(['/src/main.tsx'], ['shared.js'], ['LabPage.js', 'L1.js'], true),
    'shared.js': chunk(['/src/ui/x.ts']),
    'LabPage.js': chunk([LAB_PAGE_MODULE], ['shared.js'], ['mountLab.js']),
    'mountLab.js': chunk([LAB_GATE_MODULE, '/node_modules/@babylonjs/core/scene.js'], ['babylon-shared.js'], ['shader.js']),
    'babylon-shared.js': chunk(['/node_modules/@babylonjs/core/Maths/math.vector.js']),
    'shader.js': chunk(['/node_modules/@babylonjs/core/Shaders/default.fragment.js']),
    'L1.js': chunk(['/src/content/L1.ts']),
  }
  it('lab = only reachable through the gate; firstDraw = gate + static imports', () => {
    const s = labScopes(r)
    expect(s.gate).toEqual(['mountLab.js'])
    expect([...s.lab].sort()).toEqual(['babylon-shared.js', 'mountLab.js', 'shader.js'])
    expect([...s.firstDraw].sort()).toEqual(['babylon-shared.js', 'mountLab.js'])
    expect(bytesOf(r, s.lab)).toEqual({ raw: 30, gzip: 15, files: 3 })
    expect(lectureChunks(r)).toEqual(['L1.js'])
    expect([...entryStaticClosure(r)].sort()).toEqual(['entry.js', 'shared.js'])
  })
  it('course helpers: chapters of both courses, 709 modules, film tooling, content fixtures', () => {
    expect(lectureOf('/src/content/L3.story.ts')).toBe('L3')
    expect(lectureOf('/src/content/qc709/Q4.ts')).toBe('Q4')
    expect(lectureOf('/src/content/qc709/F2.glossary.ts')).toBe('F2')
    expect(lectureOf('/src/content/qc709/outline.ts')).toBeUndefined()
    expect(lectureOf('/src/content/qc709/__fixtures__/demoChapter.ts')).toBeUndefined()
    expect(is709Content('/src/content/qc709/registry.ts') && !is709Content('/src/physics/qc/gates.ts') && !is709Content('/src/content/L7.ts')).toBe(true)
    expect(isSharedQc('/src/physics/qc/gates.ts') && !isSharedQc('/src/physics/spin.ts') && !isSharedQc('/src/content/qc709/registry.ts')).toBe(true)
    expect(is448Lecture('/src/content/L7.values.ts') && !is448Lecture('/src/content/qc709/Q7.ts') && !is448Lecture('/src/content/meta.ts')).toBe(true)
    expect(isFilmTooling('/node_modules/@motion-canvas/core/lib/index.js') && isFilmTooling('/films/src/scenes/bell.tsx') && !isFilmTooling('/src/openers/OpenerScrub.tsx')).toBe(true)
    expect(isContentFixture('/src/physics/__fixtures__/numpy.json')).toBe(false) // engine reference values are not DEV fixtures
  })
  it('notation modules: the lazy ones are recognised, the entry ones are not', () => {
    for (const id of ['/src/content/notation.ts', '/src/content/notation.entries.ts', '/src/content/notationKit.ts', '/src/components/NotationCard.tsx', '/src/components/NotationKey.tsx', '/src/components/NotationRuntime.tsx', '/src/ui/notationMark.ts', '/src/ui/notationCodec.ts']) expect(isNotationLazy(id), id).toBe(true)
    for (const id of ['/src/components/NotationHost.tsx', '/src/components/NotationKeySlot.tsx', '/src/ui/notationPref.ts', '/src/ui/notationKeys.ts', '/src/ui/notationFocus.ts', '/src/ui/tex.ts', '/src/content/notation.test.ts', '/src/ui/notationMark.test.ts']) expect(isNotationLazy(id), id).toBe(false)
  })
  it('lazy platform modules (p): KaTeX, GSAP and the widgets are recognised; the registry is not a widget module', () => {
    for (const id of ['/node_modules/katex/dist/katex.mjs', '/src/ui/tex.ts']) expect(isKatex(id), id).toBe(true)
    for (const id of ['/src/ui/texLoader.ts', '/src/ui/Rich.tsx', '/src/ui/texfmt.ts']) expect(isKatex(id), id).toBe(false)
    for (const id of ['/node_modules/gsap/gsap-core.js', '/node_modules/gsap/ScrollTrigger.js', '/node_modules/@gsap/react/src/index.js']) expect(isGsap(id), id).toBe(true)
    for (const id of ['/src/stage/useStoryScroll.ts', '/src/stage/storyScrollGsap.ts']) expect(isGsap(id), id).toBe(false)
    for (const id of ['/src/widgets/SGLab.tsx', '/src/widgets/oracleBenchModel.ts', '/src/widgets/svg.tsx']) expect(isWidgetModule(id), id).toBe(true)
    expect(isWidgetModule(WIDGET_REGISTRY_MODULE)).toBe(false)
    expect(isWidgetModule('/src/components/ChallengeCard.tsx')).toBe(false)
    // a leak would look like this: a widget module (or GSAP) in a chunk the entry imports statically
    const leak: ChunkReport = {
      'entry.js': chunk(['/src/main.tsx', WIDGET_REGISTRY_MODULE], ['shared.js'], ['SGLab.js'], true),
      'shared.js': chunk(['/node_modules/gsap/gsap-core.js']),
      'SGLab.js': chunk(['/src/widgets/SGLab.tsx']),
    }
    const inClosure = [...entryStaticClosure(leak)].flatMap((f) => leak[f].moduleIds.filter((id) => isKatex(id) || isGsap(id) || isWidgetModule(id)))
    expect(inClosure).toEqual(['/node_modules/gsap/gsap-core.js'])
  })
  it('rule (h) / (i) after P6: the shared engine may sit with a 448 lecture, 709 content may not', () => {
    const shared: ChunkReport = {
      'a.js': chunk(['/src/content/L8.ts', '/src/physics/qc/gates.ts', '/src/physics/qc/state.ts']),
      'b.js': chunk(['/src/content/qc709/Q2.ts', '/src/physics/qc/gates.ts']),
      'c.js': chunk(['/src/stage/svg/kinds.ts', '/src/physics/qc/circuit.ts']),
    }
    expect(mixedCourseChunks(shared)).toEqual([])
    expect(mixedCourseChunks({ ...shared, 'd.js': chunk(['/src/content/L9.story.ts', '/src/content/qc709/pack.ts']) })).toEqual(['d.js'])
    expect(mixedCourseChunks({ ...shared, 'e.js': chunk(['/src/content/L7.ts', '/src/content/qc709/bridges.ts']) })).toEqual(['e.js'])
  })
  it('rule (q) helpers: Papers modules are recognised, specs are named, and a mixed chunk is caught', () => {
    for (const id of ['/src/content/papers/P1.paper.ts', '/src/content/papers/pack.ts', '/src/papers/recipes.ts', '/src/pages/PapersPages.tsx']) expect(isPapersModule(id), id).toBe(true)
    for (const id of ['/src/content/qc709/Q4.ts', '/src/styles/papers.css', '/src/components/BeatPaperNotes.tsx', '/src/pages/Chapter709Page.tsx']) expect(isPapersModule(id), id).toBe(false)
    expect(paperOf('/src/content/papers/P1.paper.ts')).toBe('P1')
    expect(paperOf('/src/content/papers/B12.paper.ts')).toBe('B12')
    expect(paperOf('/src/content/papers/P1.glossary.ts')).toBeUndefined()
    expect(isPapersContent('/src/papers/recipes.ts')).toBe(false)
    const mixed: ChunkReport = {
      'a.js': chunk(['/src/content/papers/P1.paper.ts', '/src/physics/qc/state.ts']),
      'b.js': chunk(['/src/content/papers/pack.ts', '/src/content/qc709/bridges.ts']),
      'c.js': chunk(['/src/content/papers/P1.paper.ts', '/src/content/L3.story.ts']),
    }
    expect(papersMixedChunks(mixed)).toEqual(['b.js', 'c.js'])
  })
  it('rule (r) helpers: notes modules are recognised, lectures are named, and a leaking chunk is caught (a chapter’s values are allowed, W12)', () => {
    for (const id of ['/src/content/qc709/notes/N8.ts', '/src/content/qc709/notes/kit.ts', '/src/content/qc709/notes/meta.generated.ts', '/src/pages/NotesPages.tsx']) expect(isNotesModule(id), id).toBe(true)
    for (const id of ['/src/content/qc709/Q8.ts', '/src/styles/notes709.css', '/src/content/unitNotes.ts', '/src/pages/Chapter709Page.tsx']) expect(isNotesModule(id), id).toBe(false)
    expect(isNotesContent('/src/pages/NotesPages.tsx')).toBe(false)
    expect(notesOf('/src/content/qc709/notes/N8.ts')).toBe('N8')
    expect(notesOf('/src/content/qc709/notes/N11.values.ts')).toBe('N11')
    expect(notesOf('/src/content/qc709/notes/kit.ts')).toBeUndefined()
    expect(notesOf('/src/content/qc709/notes/N8.test.ts')).toBeUndefined()
    expect(lectureOf('/src/content/qc709/notes/N8.ts')).toBeUndefined() // a notes lecture is not a chapter: rules (d) and (d2) are untouched
    const ok: ChunkReport = {
      'n8.js': chunk(['/src/content/qc709/notes/N8.ts', '/src/content/qc709/notes/N8.values.ts', '/src/content/qc709/notes/kit.ts', '/src/content/qc709/Q8.values.ts']),
      'n9.js': chunk(['/src/content/qc709/notes/N9.ts', '/src/content/qc709/notes/N9.values.ts']),
      'q8.js': chunk(['/src/content/qc709/Q8.ts', '/src/content/qc709/Q8.story.ts']),
    }
    expect(notesLeaks(ok)).toEqual([])
    const bad: ChunkReport = {
      ...ok,
      'two.js': chunk(['/src/content/qc709/notes/N1.ts', '/src/content/qc709/notes/N2.ts']),
      'story.js': chunk(['/src/content/qc709/notes/N3.ts', '/src/content/qc709/Q3.story.ts']),
      'glossary.js': chunk(['/src/content/qc709/notes/N4.ts', '/src/content/qc709/Q4.glossary.ts']),
      'sl.js': chunk(['/src/content/qc709/notes/N5.ts', '/src/content/L3.values.ts']),
    }
    expect(notesLeaks(bad).map((x) => x.split(':')[0])).toEqual(['two.js', 'story.js', 'glossary.js', 'sl.js'])
  })
  it('a Babylon module reachable without the gate is NOT a lab chunk', () => {
    const leak: ChunkReport = { ...r, 'L1.js': chunk(['/src/content/L1.ts'], ['babylon-shared.js']) }
    expect(labScopes(leak).lab.has('babylon-shared.js')).toBe(false)
  })
})

if (!present) console.info(`[chunks] SKIPPED: ${CHUNK_REPORT_PATH} absent; run \`npx vite build\` first`)

describe.skipIf(!present)(`chunk contract (${present ? CHUNK_REPORT_PATH : `SKIPPED: ${CHUNK_REPORT_PATH} absent, run npx vite build first`})`, () => {
  const files = Object.keys(report)
  const closure = entryStaticClosure(report)
  const lab = labScopes(report)
  const babylonChunks = files.filter((f) => report[f].moduleIds.some(isBabylon))

  it('the report lists an entry chunk, module ids and chunk sizes', () => {
    expect(files.some((f) => report[f].isEntry)).toBe(true)
    expect(files.reduce((n, f) => n + report[f].moduleIds.length, 0)).toBeGreaterThan(10)
    // ids are root-relative: no absolute path from the build machine
    expect(files.flatMap((f) => report[f].moduleIds.filter((id) => id.includes(APP_ROOT)))).toEqual([])
    expect(files.filter((f) => !(Number(report[f].bytes) > 0 && Number(report[f].gzip) > 0))).toEqual([])
  })

  it('(a) no @babylonjs module in the entry closure or in any lecture chunk', () => {
    const scoped = new Set([...closure, ...lectureChunks(report)])
    const hits = [...scoped].flatMap((f) => (report[f]?.moduleIds ?? []).filter(isBabylon).map((id) => `${f}: ${id}`))
    expect(hits).toEqual([])
  })

  it('(a) every chunk holding Babylon is reachable only through the lab gate (the dynamic import of mountLab)', () => {
    expect(babylonChunks.filter((f) => !lab.lab.has(f))).toEqual([])
  })

  it('(a) the gate chunk holds only lab/babylon code and Babylon; the lab page chunk holds no Babylon', () => {
    for (const g of lab.gate) {
      expect(report[g].isDynamicEntry, g).toBe(true)
      expect(report[g].moduleIds.filter((id) => !isBabylon(id) && !id.startsWith('/src/lab/babylon/') && !LAB_GATE_PURE.includes(id) && !id.startsWith('vite/'))).toEqual([])
    }
    for (const p of chunksWith(report, LAB_PAGE_MODULE)) expect(report[p].moduleIds.filter(isBabylon), p).toEqual([])
  })

  it.skipIf(!LAB_LANDED)('(a) sanity: Babylon IS bundled, behind exactly one gate chunk', () => {
    expect(lab.gate).toHaveLength(1)
    expect(babylonChunks.length).toBeGreaterThan(0)
    expect(chunksWith(report, LAB_PAGE_MODULE)).toHaveLength(1)
  })

  it('(b) three and @react-three are not in the entry chunk or its static imports', () => {
    const hits = [...closure].flatMap((f) => (report[f]?.moduleIds ?? []).filter((id) => isThree(id) || isR3F(id)).map((id) => `${f}: ${id}`))
    expect(hits).toEqual([])
  })

  it('(c) sanity: three is present in some chunk outside that closure', () => {
    const lazy = files.filter((f) => !closure.has(f) && report[f].moduleIds.some(isThree))
    expect(lazy.length).toBeGreaterThan(0)
  })

  it('(d) lecture content is not in the entry closure, and each lecture has a chunk to itself', () => {
    const early = [...closure].flatMap((f) => (report[f]?.moduleIds ?? []).filter((id) => lectureOf(id)).map((id) => `${f}: ${id}`))
    expect(early).toEqual([])
    // a chapter's glossary is the one exception: every 709 glossary lives in the course pack (content/qc709/pack.ts,
    // W-709-platform "Costs" 7), which rule (d2) checks instead
    const chapterOf = (id: string) => (id.endsWith('.glossary.ts') ? undefined : lectureOf(id))
    const shared = files.map((f) => [f, [...new Set(report[f].moduleIds.map(chapterOf).filter(Boolean))]] as const).filter(([, ls]) => ls.length > 1)
    expect(shared).toEqual([])
    // sanity: every lecture was found in some chunk, so the checks above measured something
    const found = new Set(files.flatMap((f) => report[f].moduleIds.map(lectureOf).filter(Boolean)))
    expect([...found].filter((id) => id!.startsWith('L')).sort()).toEqual([...LECTURE_FILES_448].sort())
    expect(LECTURE_FILES_448.length, 'the 448 lecture files on disk').toBeGreaterThanOrEqual(7)
    // and every written 709 chapter ships as its own chunk too
    expect([...found].filter((id) => !id!.startsWith('L')).sort()).toEqual([...QC_CHAPTER_FILES].sort())
  })

  it('(d2) the 709 course pack holds every written chapter’s glossary and no other chapter file', () => {
    const pack = files.filter((f) => report[f].moduleIds.includes('/src/content/qc709/pack.ts'))
    expect(pack).toHaveLength(1)
    const inPack = report[pack[0]].moduleIds.filter((id) => lectureOf(id))
    expect(inPack.filter((id) => !id.endsWith('.glossary.ts'))).toEqual([]) // no story, values, review or chapter file
    expect(inPack.map(lectureOf).sort()).toEqual([...QC_CHAPTER_FILES].sort()) // one glossary per written chapter
  })

  it('(h) no 709 content (content/qc709/) and no shared multi-qubit engine (physics/qc/) in the entry chunk or its static imports', () => {
    const hits = [...closure].flatMap((f) => (report[f]?.moduleIds ?? []).filter((id) => is709Content(id) || isSharedQc(id)).map((id) => `${f}: ${id}`))
    expect(hits).toEqual([])
    // sanity: the 709 registry IS bundled (lazily, with the 709 pages), so (h) measured something
    expect(files.filter((f) => report[f].moduleIds.includes('/src/content/qc709/outline.ts')).length).toBeGreaterThan(0)
  })

  it('(i) no chunk holds both 709 content and a 448 lecture’s content (physics/qc and stage/svg are shared)', () => {
    const mixed = mixedCourseChunks(report)
    expect(mixed.map((f) => `${f}: ${report[f].moduleIds.filter((id) => is709Content(id) || is448Lecture(id)).join(', ')}`)).toEqual([])
  })

  it('(j) no Motion Canvas or films-pipeline module in any chunk', () => {
    const hits = files.flatMap((f) => report[f].moduleIds.filter(isFilmTooling).map((id) => `${f}: ${id}`))
    expect(hits).toEqual([])
  })

  it('(k) no DEV content fixture ships: the 448 demo story and the 709 demo chapter are in no chunk', () => {
    const hits = files.flatMap((f) => report[f].moduleIds.filter(isContentFixture).map((id) => `${f}: ${id}`))
    expect(hits).toEqual([])
    // the guard itself: these ids are what a leak would look like
    expect(isContentFixture('/src/content/qc709/__fixtures__/demoChapter.ts') && isContentFixture('/src/content/__fixtures__/demoStory.ts')).toBe(true)
  })

  it('(m) the SVG kinds load lazily: not in the entry closure, never pulled in by a lecture chunk; they are bundled', () => {
    const early = [...closure].flatMap((f) => (report[f]?.moduleIds ?? []).filter(isSvgKindModule).map((id) => `${f}: ${id}`))
    expect(early).toEqual([])
    const lectures448 = files.filter((f) => report[f].moduleIds.some(is448Lecture))
    expect(lectures448.length, 'the 448 lecture chunks').toBeGreaterThanOrEqual(LECTURE_FILES_448.length)
    const pulled = lectures448.flatMap((f) => [...walk(report, [f], false)].flatMap((c) => report[c].moduleIds.filter(isSvgKindModule).map((id) => `${f} → ${c}: ${id}`)))
    expect(pulled).toEqual([])
    // sanity: the kinds' chunk exists (a dynamic import), so the checks above measured something
    expect(files.filter((f) => report[f].moduleIds.includes('/src/stage/svg/kinds.ts')).length).toBe(1)
  })

  it('(n) 448’s per-lecture data is lazy: not in the entry closure, in the 448 pack or with its page, and the pack holds no lecture', () => {
    const early = [...closure].flatMap((f) => (report[f]?.moduleIds ?? []).filter((id) => SL448_LAZY_DATA.includes(id)).map((id) => `${f}: ${id}`))
    expect(early).toEqual([])
    // sanity: every one of them IS bundled (so the check above measured something), outside the closure
    for (const id of SL448_LAZY_DATA) expect(chunksWith(report, id).length, id).toBeGreaterThan(0)
    // the pack: one dynamic chunk with the glossary, the unit details and the fidelity tables, and no lecture, concept map or game
    const pack = chunksWith(report, SL448_PACK_MODULE)
    expect(pack).toHaveLength(1)
    expect(report[pack[0]].isDynamicEntry).toBe(true)
    // (a module the formula sheet's chunk shares, like the unit details, may sit in a chunk the pack imports statically)
    const packClosure = walk(report, pack, false)
    for (const id of ['/src/content/glossary.ts', '/src/content/meta.detail.generated.ts', '/src/content/fidelity.sl448.ts']) {
      expect(chunksWith(report, id).some((f) => packClosure.has(f)), `${id} loads with the 448 pack`).toBe(true)
    }
    const inPack = [...packClosure].flatMap((f) => report[f].moduleIds)
    expect(inPack.filter((id) => lectureOf(id) || id === '/src/content/concepts.ts' || id === '/src/arcade/games.ts')).toEqual([])
    // 709's pack brings the 448 pack (a 709 chapter may cite a Spin Lab term), as a static import of the same chunk
    const qcPack = chunksWith(report, '/src/content/qc709/pack.ts')
    expect(qcPack).toHaveLength(1)
    expect(report[qcPack[0]].imports).toContain(pack[0])
  })

  it('(o) the notation explainers are lazy: card, key, dictionary and pre-processor are in no entry chunk; they are bundled', () => {
    const early = [...closure].flatMap((f) => (report[f]?.moduleIds ?? []).filter(isNotationLazy).map((id) => `${f}: ${id}`))
    expect(early).toEqual([])
    // sanity: they ARE in the build, behind dynamic imports, so the check above measured something
    const lazy = files.filter((f) => report[f].moduleIds.some(isNotationLazy))
    expect(lazy.length).toBeGreaterThan(0)
    for (const f of lazy) expect(closure.has(f), f).toBe(false)
    const ids = files.flatMap((f) => report[f].moduleIds.filter(isNotationLazy))
    for (const m of ['/src/content/notation.entries.ts', '/src/components/NotationCard.tsx', '/src/components/NotationKey.tsx', '/src/components/NotationRuntime.tsx', '/src/ui/notationMark.ts', '/src/ui/notationCodec.ts']) expect(ids, m).toContain(m)
    // the dictionary's chunk has no chapter content in it (and so cannot make rule (i) fail)
    const dict = files.filter((f) => report[f].moduleIds.includes('/src/content/notation.entries.ts'))
    expect(dict).toHaveLength(1)
    expect(report[dict[0]].moduleIds.filter((id) => lectureOf(id) || is709Content(id))).toEqual([])
    // and the entry does carry its small part
    expect([...closure].some((f) => report[f].moduleIds.includes('/src/components/NotationHost.tsx'))).toBe(true)
  })

  it('(p) KaTeX, GSAP and the widgets are lazy: in no chunk of the entry closure; each is bundled, and the registry is the one widgets/ module the entry carries', () => {
    const early = [...closure].flatMap((f) => (report[f]?.moduleIds ?? []).filter((id) => isKatex(id) || isGsap(id) || isWidgetModule(id)).map((id) => `${f}: ${id}`))
    expect(early).toEqual([])
    // sanity: all three ARE in the build, behind dynamic imports, so the check above measured something
    const bundled = (test: (id: string) => boolean) => files.filter((f) => report[f].moduleIds.some(test))
    for (const [what, test] of [['KaTeX', isKatex], ['GSAP', isGsap], ['a widget', isWidgetModule]] as const) {
      const found = bundled(test)
      expect(found.length, `${what} is bundled`).toBeGreaterThan(0)
      for (const f of found) expect(closure.has(f), `${what}: ${f} is lazy`).toBe(false)
    }
    // every widget file on disk is in a chunk of its own side of the line (so a widget added later is held to the same rule)
    expect(WIDGET_FILES.length, 'widget files on disk').toBeGreaterThanOrEqual(20)
    for (const id of WIDGET_FILES) expect(chunksWith(report, id).length, `${id} is bundled`).toBeGreaterThan(0)
    // the lazy table: the entry carries the registry (and the placeholder sizes), nothing of the widgets themselves
    expect([...closure].some((f) => report[f].moduleIds.includes(WIDGET_REGISTRY_MODULE))).toBe(true)
    // and the loaders: the entry's halves of the lazy libraries are small and named
    for (const id of ['/src/ui/texLoader.ts', '/src/stage/useStoryScroll.ts']) expect([...closure].some((f) => report[f].moduleIds.includes(id)), id).toBe(true)
  })

  it('(q) the Papers section is lazy: nothing of it in the entry closure, each spec its own chunk, never beside 709 or 448 content', () => {
    const early = [...closure].flatMap((f) => (report[f]?.moduleIds ?? []).filter(isPapersModule).map((id) => `${f}: ${id}`))
    expect(early).toEqual([])
    // sanity: the pages, the light registry, the pack, the recipe registry and every spec on disk ARE bundled, outside the closure
    for (const id of ['/src/pages/PapersPages.tsx', '/src/content/papers/registry.ts', '/src/content/papers/pack.ts', '/src/papers/recipes.ts', '/src/papers/compile.ts']) {
      const found = chunksWith(report, id)
      expect(found.length, `${id} is bundled`).toBeGreaterThan(0)
      for (const f of found) expect(closure.has(f), `${id}: ${f} is lazy`).toBe(false)
    }
    expect(PAPER_SPEC_FILES.length, 'paper specs on disk').toBeGreaterThan(0)
    const specs = files.flatMap((f) => report[f].moduleIds.map(paperOf).filter(Boolean))
    expect([...new Set(specs)].sort()).toEqual([...PAPER_SPEC_FILES].sort())
    // each spec has a chunk to itself: no second spec and no chapter of another course beside it
    for (const f of files) {
      const here = report[f].moduleIds.map(paperOf).filter(Boolean)
      if (!here.length) continue
      expect(here, `${f}: one spec`).toHaveLength(1)
      expect(report[f].moduleIds.filter((id) => lectureOf(id)), `${f}: no 448 or 709 chapter`).toEqual([])
    }
    // the Papers section never shares a chunk with 709 content or a 448 lecture (physics/qc and stage/svg are shared code)
    expect(papersMixedChunks(report).map((f) => `${f}: ${report[f].moduleIds.filter((id) => isPapersContent(id) || is709Content(id) || is448Lecture(id)).join(', ')}`)).toEqual([])
    // the pack: every chapter's glossary, no spec, and the 448 pack (a paper may cite a Spin Lab term)
    const pack = chunksWith(report, '/src/content/papers/pack.ts')
    expect(pack).toHaveLength(1)
    expect(report[pack[0]].moduleIds.filter((id) => paperOf(id))).toEqual([])
    const glossaries = report[pack[0]].moduleIds.flatMap((id) => /^\/src\/content\/papers\/([PB]\d+)\.glossary\.ts$/.exec(id)?.[1] ?? [])
    expect(glossaries.sort()).toEqual([...PAPER_SPEC_FILES].sort())
    const sl = chunksWith(report, SL448_PACK_MODULE)
    expect(report[pack[0]].imports, 'the papers pack brings the 448 pack').toContain(sl[0])
  })

  it('(r) the 709 lecture notes are lazy: nothing of them in the entry closure, each lecture a chunk with its own values, the listing in the registry chunk, the page imports no lecture', () => {
    const early = [...closure].flatMap((f) => (report[f]?.moduleIds ?? []).filter(isNotesModule).map((id) => `${f}: ${id}`))
    expect(early).toEqual([])
    // sanity: the page, the kit and the listing ARE bundled, outside the closure
    for (const id of ['/src/pages/NotesPages.tsx', '/src/content/qc709/notes/kit.ts', '/src/content/qc709/notes/meta.generated.ts']) {
      const found = chunksWith(report, id)
      expect(found.length, `${id} is bundled`).toBeGreaterThan(0)
      for (const f of found) expect(closure.has(f), `${id}: ${f} is lazy`).toBe(false)
    }
    // the chip and the reverse index are lazy too: the entry carries only the slot under a unit's question (components/UnitView.tsx UnitAsideContext)
    for (const id of ['/src/components/UnitNotesLink.tsx', '/src/content/unitNotes.ts']) {
      const found = chunksWith(report, id)
      expect(found.length, `${id} is bundled`).toBeGreaterThan(0)
      for (const f of found) expect(closure.has(f), `${id}: ${f} is lazy`).toBe(false)
    }
    // every notes lecture on disk is bundled, in exactly one chunk, with its own values beside it
    expect(NOTES_FILES.length, 'notes lectures on disk').toBeGreaterThan(0)
    const found = files.flatMap((f) => report[f].moduleIds.map(notesOf).filter(Boolean))
    expect([...new Set(found)].sort()).toEqual([...NOTES_FILES].sort())
    for (const n of NOTES_FILES) {
      const lecture = chunksWith(report, `/src/content/qc709/notes/${n}.ts`)
      expect(lecture, `${n} is in exactly one chunk`).toHaveLength(1)
      // a values file exists only for a lecture that shows a number no chapter owns (ruling W12); when present it rides with its lecture
      if (existsSync(`${NOTES_DIR}/${n}.values.ts`)) expect(chunksWith(report, `/src/content/qc709/notes/${n}.values.ts`), `${n}.values.ts rides with ${n}`).toEqual(lecture)
    }
    // no chunk holds two notes lectures, or another lecture's story, content or glossary module (a chapter's values are allowed: W12)
    expect(notesLeaks(report)).toEqual([])
    // the listing rides in the lazy 709 registry chunk and holds no lecture and no kit
    const listing = chunksWith(report, '/src/content/qc709/notes/meta.generated.ts')
    expect(listing).toHaveLength(1)
    expect(chunksWith(report, '/src/content/qc709/registry.ts')).toEqual(listing)
    expect(report[listing[0]].moduleIds.filter((id) => notesOf(id) || id.endsWith('/notes/kit.ts'))).toEqual([])
    // the page imports no lecture statically (a lecture is its own chunk behind a dynamic import)
    const page = chunksWith(report, '/src/pages/NotesPages.tsx')
    expect(page).toHaveLength(1)
    const staticDeps = [...walk(report, page, false)].flatMap((f) => report[f].moduleIds.filter((id) => notesOf(id) || id.endsWith('/notes/kit.ts')).map((id) => `${f}: ${id}`))
    expect(staticDeps).toEqual([])
  })

  it('rule (r) optics helpers: optics modules are recognised, pages are named, and a leaking chunk is caught', () => {
    const chunk = (moduleIds: string[]) => ({ isEntry: false, isDynamicEntry: true, name: '', moduleIds, imports: [], dynamicImports: [], bytes: 10, gzip: 5 })
    for (const id of ['/src/content/qc709/optics/O3.ts', '/src/content/qc709/optics/meta.generated.ts', '/src/widgets/OpticsBench.tsx', '/src/widgets/opticsBench/presets.ts', '/src/pages/NotesPages.tsx']) expect(isOpticsModule(id), id).toBe(true)
    for (const id of ['/src/content/qc709/notes/N8.ts', '/src/content/qc709/Q8.ts', '/src/widgets/BitTable.tsx', '/src/styles/notes709.css']) expect(isOpticsModule(id), id).toBe(false)
    expect(isOpticsContent('/src/content/qc709/optics/loaders.ts')).toBe(true)
    expect(isOpticsContent('/src/widgets/OpticsBench.tsx')).toBe(false)
    expect(isOpticsWidget('/src/widgets/opticsBench/validate.ts')).toBe(true)
    expect(opticsOf('/src/content/qc709/optics/O3.ts')).toBe('O3')
    expect(opticsOf('/src/content/qc709/optics/O12.values.ts')).toBe('O12')
    expect(opticsOf('/src/content/qc709/optics/meta.generated.ts')).toBeUndefined()
    expect(opticsOf('/src/content/qc709/optics/O3.test.ts')).toBeUndefined()
    expect(notesOf('/src/content/qc709/optics/O3.ts')).toBeUndefined() // an optics page is not a notes lecture: rule (r) for the notes is untouched
    expect(lectureOf('/src/content/qc709/optics/O3.ts')).toBeUndefined() // nor a chapter: rules (d) and (d2) are untouched
    const ok: ChunkReport = {
      'o1.js': chunk(['/src/content/qc709/optics/O1.ts', '/src/content/qc709/optics/O1.values.ts', '/src/content/qc709/notes/kit.ts', '/src/content/qc709/Q8.values.ts']),
      'o2.js': chunk(['/src/content/qc709/optics/O2.ts', '/src/content/qc709/optics/O2.values.ts']),
      'n8.js': chunk(['/src/content/qc709/notes/N8.ts', '/src/content/qc709/notes/N8.values.ts']),
      'q8.js': chunk(['/src/content/qc709/Q8.ts', '/src/content/qc709/Q8.story.ts']),
    }
    expect(opticsLeaks(ok)).toEqual([])
    expect(notesLeaks(ok)).toEqual([])
    const bad: ChunkReport = {
      'two.js': chunk(['/src/content/qc709/optics/O1.ts', '/src/content/qc709/optics/O2.ts']),
      'notes.js': chunk(['/src/content/qc709/optics/O1.ts', '/src/content/qc709/notes/N8.ts']),
      'chap.js': chunk(['/src/content/qc709/optics/O1.ts', '/src/content/qc709/Q8.story.ts']),
      'sl.js': chunk(['/src/content/qc709/optics/O1.ts', '/src/content/L3.story.ts']),
    }
    expect(opticsLeaks(bad).map((m) => m.split(':')[0])).toEqual(['two.js', 'notes.js', 'chap.js', 'sl.js'])
  })

  it('(r) the Optics Lab is lazy: nothing of it in the entry closure, each page a chunk with its own values, the listing in the registry chunk, the notes page imports no page, the bench is its own lazy chunk', () => {
    const early = [...closure].flatMap((f) => (report[f]?.moduleIds ?? []).filter(isOpticsModule).map((id) => `${f}: ${id}`))
    expect(early).toEqual([])
    // sanity: the listing, the loaders, the bench and its presets table ARE bundled, outside the closure
    for (const id of ['/src/content/qc709/optics/meta.generated.ts', '/src/content/qc709/optics/loaders.ts', '/src/widgets/OpticsBench.tsx', '/src/widgets/opticsBench/presets.ts']) {
      const found = chunksWith(report, id)
      expect(found.length, `${id} is bundled`).toBeGreaterThan(0)
      for (const f of found) expect(closure.has(f), `${id}: ${f} is lazy`).toBe(false)
    }
    // every optics page on disk is bundled, in exactly one chunk, with its own values beside it
    expect(OPTICS_FILES.length, 'optics pages on disk').toBeGreaterThan(0)
    const found = files.flatMap((f) => report[f].moduleIds.map(opticsOf).filter(Boolean))
    expect([...new Set(found)].sort()).toEqual([...OPTICS_FILES].sort())
    for (const o of OPTICS_FILES) {
      const page = chunksWith(report, `/src/content/qc709/optics/${o}.ts`)
      expect(page, `${o} is in exactly one chunk`).toHaveLength(1)
      if (existsSync(`${OPTICS_DIR}/${o}.values.ts`)) expect(chunksWith(report, `/src/content/qc709/optics/${o}.values.ts`), `${o}.values.ts rides with ${o}`).toEqual(page)
    }
    // never beside another page, a lecture-notes lecture or another lecture's story, content or glossary module (a chapter's values are allowed)
    expect(opticsLeaks(report)).toEqual([])
    // the listing rides in the lazy 709 registry chunk (beside the notes listing) and holds no page and no kit
    const listing = chunksWith(report, '/src/content/qc709/optics/meta.generated.ts')
    expect(listing).toHaveLength(1)
    expect(chunksWith(report, '/src/content/qc709/registry.ts')).toEqual(listing)
    expect(chunksWith(report, '/src/content/qc709/notes/meta.generated.ts')).toEqual(listing)
    expect(report[listing[0]].moduleIds.filter((id) => opticsOf(id) || notesOf(id) || id.endsWith('/notes/kit.ts'))).toEqual([])
    // the notes page (it draws both collections) imports no optics page and no kit statically
    const pages = chunksWith(report, '/src/pages/NotesPages.tsx')
    expect(pages).toHaveLength(1)
    const staticDeps = [...walk(report, pages, false)].flatMap((f) => report[f].moduleIds.filter((id) => opticsOf(id) || id.endsWith('/notes/kit.ts')).map((id) => `${f}: ${id}`))
    expect(staticDeps).toEqual([])
    // the bench loads on demand (a dynamic import of the registry): it is not a static dependency of the notes page, and its presets table rides with it
    const bench = chunksWith(report, '/src/widgets/OpticsBench.tsx')
    expect(bench).toHaveLength(1)
    expect(chunksWith(report, '/src/widgets/opticsBench/presets.ts')).toEqual(bench)
    const pageStatic = new Set([...walk(report, pages, false)])
    expect(pageStatic.has(bench[0]), 'the notes page does not import the bench statically').toBe(false)
  })

  it('(l) the entry closure (first paint) keeps to its byte budget', () => {
    const entry = bytesOf(report, closure)
    console.info(`[chunks] entry closure ${JSON.stringify(entry)}: ${[...closure].join(', ')}`)
    expect(entry.raw, 'entry raw').toBeLessThanOrEqual(ENTRY_BUDGET.raw)
    expect(entry.gzip, 'entry gzip').toBeLessThanOrEqual(ENTRY_BUDGET.gzip)
  })

  it('(e) no Babylon module that fetches remote code, injects <style> or opens unused devices', () => {
    const hits = files.flatMap((f) => report[f].moduleIds.flatMap((id) => BANNED_BABYLON.filter(([re]) => re.test(id)).map(([, why]) => `${f}: ${id} (${why})`)))
    expect(hits).toEqual([])
  })

  it('(f) no three.js / @react-three in the lab chunks or the lab page chunk', () => {
    const scoped = [...lab.lab, ...chunksWith(report, LAB_PAGE_MODULE)]
    const hits = scoped.flatMap((f) => report[f].moduleIds.filter((id) => isThree(id) || isR3F(id)).map((id) => `${f}: ${id}`))
    expect(hits).toEqual([])
  })

  it.skipIf(!LAB_LANDED)('(g) lab byte budgets (raw and gzip)', () => {
    const lazy = [...lab.lab].filter((f) => !lab.firstDraw.has(f))
    const pageChunks = chunksWith(report, LAB_PAGE_MODULE)
    const page = [...walk(report, pageChunks, false)].filter((f) => !closure.has(f))
    // the benches' lazy page chunks (src/lab/benches/<id>/<Name>Bench.tsx) and their static imports beyond the entry
    // closure and the lab page (what opening a bench downloads besides the page and Babylon)
    const benchEntries = files.filter((f) => report[f].moduleIds.some((id) => /^\/src\/lab\/benches\/[^/]+\/[A-Z]\w*Bench\.tsx$/.test(id)))
    expect(benchEntries.length, 'the Operator Lab page chunk').toBeGreaterThan(0)
    const benches = [...walk(report, benchEntries, false)].filter((f) => !closure.has(f) && !page.includes(f) && !lab.lab.has(f))
    const measured = {
      firstDraw: bytesOf(report, lab.firstDraw),
      lazy: bytesOf(report, lazy),
      // the route chunk and what it imports statically beyond the entry closure (what opening #/lab downloads)
      page: bytesOf(report, page),
      benches: bytesOf(report, benches),
    }
    console.info(`[chunks] lab bytes ${JSON.stringify(measured)} benches: ${benches.join(', ')}`)
    for (const k of ['firstDraw', 'lazy', 'page', 'benches'] as const) {
      expect(measured[k].raw, `${k} raw`).toBeLessThanOrEqual(LAB_BUDGET[k].raw)
      expect(measured[k].gzip, `${k} gzip`).toBeLessThanOrEqual(LAB_BUDGET[k].gzip)
    }
  })
})
