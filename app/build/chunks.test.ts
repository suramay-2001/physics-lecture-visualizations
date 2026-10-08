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
 * Runs only after `vite build`; skipped (with the reason in the title) when the report is absent.
 */
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import {
  bytesOf, chunksWith, entryStaticClosure, is448Lecture, is709Content, isBabylon, isContentFixture, isFilmTooling, isR3F, isSharedQc, isSvgKindModule, isThree,
  LAB_GATE_MODULE, LAB_PAGE_MODULE, labScopes, lectureChunks, lectureOf, mixedCourseChunks, walk,
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
 * The entry stylesheet grew 92 707 → 97 713 raw (switcher + theme-cryostat.css); 709's faces (fonts709, 14.7 KB of
 * @font-face) and page styles (course709.css) load only with 709 pages.
 * Set ≈ 5 % above the measured build; raise it only with a reason (and never for 709 content: that is rule (h)).
 */
const ENTRY_BUDGET = { raw: 985_000, gzip: 325_000 } as const

/** 709 chapter files on disk (content/qc709/Q{n}.ts, F{n}.ts): what (d) must find in the build. */
const QC_DIR = `${APP_ROOT}/src/content/qc709`
const QC_CHAPTER_FILES = existsSync(QC_DIR) ? readdirSync(QC_DIR).flatMap((f) => /^([QF]\d+)\.ts$/.exec(f)?.[1] ?? []) : []
/** 448 lecture files on disk (content/L{n}.ts): what (d) and (m) must find in the build. Read from disk so a lecture added
 *  later (L8–L11) is expected without editing this file; the lists used to be hand-written (L1…L7, `>= 7`). */
const L_DIR = `${APP_ROOT}/src/content`
const LECTURE_FILES_448 = readdirSync(L_DIR).flatMap((f) => /^(L\d+)\.ts$/.exec(f)?.[1] ?? [])

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
 * `firstDraw` =the gate chunk and its static imports (what /lab downloads before its first frame);
 * `lazy` = the rest of the lab chunks (Babylon's shader chunks, fetched on first use); `page` = the lab route chunk and
 * its static imports outside the entry closure (DOM page, store, frame-check model); `benches` = the teaching benches'
 * page chunks (lazy, one per bench) and what they import beyond the page. Raise a budget only with a reason.
 */
const LAB_BUDGET = {
  firstDraw: { raw: 1_760_000, gzip: 431_000 },
  lazy: { raw: 800_000, gzip: 178_000 },
  page: { raw: 15_000, gzip: 6_400 },
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
