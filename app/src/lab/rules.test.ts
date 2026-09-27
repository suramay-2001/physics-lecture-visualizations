/**
 * Boundaries of the lab code (W-lab §2 "rules", decisions/lab.md #2, #8, #9), checked on the source:
 *   1. only `src/lab/babylon/**` imports `@babylonjs`, and only through subpaths (no barrels, no Legacy bundle);
 *      nothing outside src/lab/ reaches the lab's Babylon code except through `useLabEngine`'s dynamic import;
 *   2. the lab page and the hook load Babylon only through `import('./babylon/mountLab')` (the lab gate);
 *   3. `src/lab/babylon/**` imports no VALUE from app/src/physics (types only) and formats no number: every
 *      number a learner reads is computed and formatted on the page side from the engine;
 *   4. no lab file names an API that fetches remote code, injects <style> or opens devices we never use (S-lab §3a),
 *      except the tripwire, which wraps the loaders to refuse cross-origin URLs.
 */
import { describe, expect, it } from 'vitest'

const SRC = import.meta.glob<string>('/src/**/*.{ts,tsx}', { query: '?raw', import: 'default', eager: true })
const isTest = (f: string) => /\.(test|spec)\.tsx?$/.test(f)
const code = Object.entries(SRC).filter(([f]) => !isTest(f))
const lab = code.filter(([f]) => f.startsWith('/src/lab/'))
const babylonSide = lab.filter(([f]) => f.startsWith('/src/lab/babylon/'))
/** Module specifiers of static imports/exports and dynamic imports. */
const specifiers = (t: string) => [...t.matchAll(/(?:\bfrom\s*|\bimport\s*\(\s*|\bimport\s+)['"]([^'"]+)['"]/g)].map((m) => m[1])

describe('lab code boundaries', () => {
  it('scans the lab (page, store, model, hook)', () => {
    const names = lab.map(([f]) => f)
    for (const f of ['/src/lab/LabPage.tsx', '/src/lab/labStore.ts', '/src/lab/frameBench.ts', '/src/lab/axes.ts']) expect(names).toContain(f)
  })

  it('1. only src/lab/babylon/** imports @babylonjs, by subpath (no barrels, no Legacy)', () => {
    const outside = code.filter(([f]) => !f.startsWith('/src/lab/babylon/')).flatMap(([f, t]) => specifiers(t).filter((s) => s.startsWith('@babylonjs')).map((s) => `${f}: ${s}`))
    expect(outside).toEqual([])
    const barrels = babylonSide.flatMap(([f, t]) =>
      specifiers(t)
        .filter((s) => /^@babylonjs\/(core|gui)(\/(index|pure|legacy|Legacy\/.*))?(\.js)?$/.test(s) || /^@babylonjs\/(?!core\/|gui\/)/.test(s))
        .map((s) => `${f}: ${s}`),
    )
    expect(barrels).toEqual([])
  })

  it('1. nothing outside the lab reaches src/lab/babylon; inside, only useLabEngine does, and only dynamically', () => {
    const reach = code
      .filter(([f]) => !f.startsWith('/src/lab/babylon/'))
      .flatMap(([f, t]) => specifiers(t).filter((s) => /(^|\/)babylon\//.test(s) || /lab\/babylon/.test(s)).map((s) => `${f}: ${s}`))
    expect(reach.filter((r) => !r.startsWith('/src/lab/useLabEngine.ts: ./babylon/mountLab'))).toEqual([])
  })

  it('2. the page and the hook import Babylon code only through import("./babylon/mountLab")', () => {
    for (const [f, t] of lab.filter(([f]) => !f.startsWith('/src/lab/babylon/'))) {
      const statics = [...t.matchAll(/(?:\bfrom\s*|\bimport\s+)['"]([^'"]+)['"]/g)].map((m) => m[1])
      expect(statics.filter((s) => /babylon/.test(s)), f).toEqual([])
    }
  })

  it('3. the Babylon side imports no value from physics/ (types only) and formats no numbers', () => {
    const bad: string[] = []
    for (const [f, t] of babylonSide) {
      for (const m of t.matchAll(/^\s*import\s+(type\s+)?[^;]*?from\s*['"]([^'"]*physics\/[^'"]*)['"]/gm)) if (!m[1]) bad.push(`${f}: value import from ${m[2]}`)
      for (const re of [/\.toFixed\s*\(/, /\.toPrecision\s*\(/, /\.toLocaleString\s*\(/, /Intl\.NumberFormat/, /\.toExponential\s*\(/]) if (re.test(t)) bad.push(`${f}: ${re}`)
    }
    expect(bad).toEqual([])
  })

  it('4. no API that fetches remote code, injects <style> or opens unused devices (the tripwire may name the loaders)', () => {
    const BANNED: [RegExp, string][] = [
      [/\bSceneLoader\b|\bImportMeshAsync\b|\bAppendSceneAsync\b|\bLoadAssetContainerAsync\b/, 'scene loader'],
      [/\bdebugLayer\b|\bInspector\b/, 'debug layer / Inspector (the user chose our own panel, not the Inspector)'],
      [/\bcreateDefaultEnvironment\b|\bcreateDefaultSkybox\b|\bEnvironmentHelper\b|\bcreateDefaultCameraOrLight\b/, 'environment helpers (CDN HDR)'],
      [/\bDefaultLoadingScreen\b|\bdisplayLoadingUI\b/, 'loading screen (<style>)'],
      [/\bParseFromSnippetAsync\b|\bparseFromSnippetAsync\b|\bparseFromURLAsync\b|\bSnippetUrl\b/, 'snippet server'],
      [/\bWebGPUEngine\b|\bHavokPlugin\b|\bDracoCompression\b|\bKhronosTextureContainer2\b|\bCSG2\b|\bWebXR/, 'wasm / CDN decoders / XR'],
      [/\bCubeTexture\b|\bHDRCubeTexture\b|\.env['"]/, 'environment textures (none shipped)'],
    ]
    const bad = lab.flatMap(([f, t]) => BANNED.filter(([re]) => re.test(t)).map(([, why]) => `${f}: ${why}`))
    expect(bad).toEqual([])
    const loaders = lab.filter(([f, t]) => !f.endsWith('/tripwire.ts') && /\b(LoadScript|LoadScriptAsync|LoadFile|LoadFileAsync)\b/.test(t)).map(([f]) => f)
    expect(loaders).toEqual([])
  })
})
