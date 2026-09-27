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
 * Runs only after `vite build`; skipped (with the reason in the title) when the report is absent.
 */
import { existsSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { bytesOf, chunksWith, entryStaticClosure, isBabylon, isR3F, isThree, LAB_GATE_MODULE, LAB_PAGE_MODULE, labScopes, lectureChunks, lectureOf } from './chunkGraph.ts'
import { type ChunkReport, CHUNK_REPORT_PATH, chunkReportFile, relativeModuleId } from './chunkReport.ts'

const APP_ROOT = fileURLToPath(new URL('..', import.meta.url)).replace(/\\/g, '/').replace(/\/$/, '')
const REPORT = chunkReportFile(APP_ROOT)
const present = existsSync(REPORT)
const report: ChunkReport = present ? (JSON.parse(readFileSync(REPORT, 'utf8')) as ChunkReport) : {}

/** Flipped when the Babylon engine lands (W-lab §6 step 3): from then on Babylon MUST be found behind the gate. */
const LAB_LANDED = false

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
  [/\/@babylonjs\/core\/Loading\//, 'loading screen (<style>) and scene loader'],
  [/\/@babylonjs\/core\/(Audio|AudioV2)\//, 'audio engine (never used; audioEngine: false)'],
  [/\/@babylonjs\/core\/Engines\/(webgpuEngine|WebGPU\/)/, 'WebGPU engine (glslang/twgsl from a CDN)'],
]

/**
 * Lab byte budgets (g): measured on the first build of the lab foundation (2026-09-27, see BUILD-LOG), budget ≈ +15 %.
 * `firstDraw` = the gate chunk and its static imports (what /lab downloads before its first frame);
 * `lazy` = the rest of the lab chunks (Babylon's shader chunks, fetched on first use); `page` = the lab route chunk.
 */
const LAB_BUDGET = {
  firstDraw: { raw: 0, gzip: 0 },
  lazy: { raw: 0, gzip: 0 },
  page: { raw: 0, gzip: 0 },
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
      expect(report[g].moduleIds.filter((id) => !isBabylon(id) && !id.startsWith('/src/lab/babylon/') && !id.startsWith('vite/'))).toEqual([])
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
    const shared = files.map((f) => [f, [...new Set(report[f].moduleIds.map(lectureOf).filter(Boolean))]] as const).filter(([, ls]) => ls.length > 1)
    expect(shared).toEqual([])
    // sanity: every lecture was found in some chunk, so the checks above measured something
    const found = new Set(files.flatMap((f) => report[f].moduleIds.map(lectureOf).filter(Boolean)))
    expect([...found].sort()).toEqual(['L1', 'L2', 'L3', 'L4', 'L5', 'L6', 'L7'])
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
    const measured = {
      firstDraw: bytesOf(report, lab.firstDraw),
      lazy: bytesOf(report, lazy),
      page: bytesOf(report, chunksWith(report, LAB_PAGE_MODULE)),
    }
    console.info(`[chunks] lab bytes ${JSON.stringify(measured)}`)
    for (const k of ['firstDraw', 'lazy', 'page'] as const) {
      expect(measured[k].raw, `${k} raw`).toBeLessThanOrEqual(LAB_BUDGET[k].raw)
      expect(measured[k].gzip, `${k} gzip`).toBeLessThanOrEqual(LAB_BUDGET[k].gzip)
    }
  })
})
