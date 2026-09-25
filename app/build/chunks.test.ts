/**
 * Chunk contract (W-L1 §6.1), read from app/node_modules/.tmp/chunk-modules.json (written by
 * build/chunkReport.ts after `vite build`; kept out of dist/ so it never ships):
 *   (a) no Babylon module in any chunk;
 *   (b) three.js and @react-three are neither in the entry chunk nor in any chunk it imports statically
 *       (so the first paint never waits for WebGL code);
 *   (c) sanity: three.js IS in some other chunk, so (b) cannot pass by measuring nothing.
 * Runs only after `vite build`; skipped (with the reason in the title) when the report is absent.
 */
import { existsSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { type ChunkReport, CHUNK_REPORT_PATH, chunkReportFile, relativeModuleId } from './chunkReport.ts'

const APP_ROOT = fileURLToPath(new URL('..', import.meta.url)).replace(/\\/g, '/').replace(/\/$/, '')
const REPORT = chunkReportFile(APP_ROOT)
const present = existsSync(REPORT)
const report: ChunkReport = present ? (JSON.parse(readFileSync(REPORT, 'utf8')) as ChunkReport) : {}

const isBabylon = (id: string) => id.includes('/@babylonjs/')
const isThree = (id: string) => id.includes('/node_modules/three/')
const isR3F = (id: string) => id.includes('/@react-three/')

/** The entry chunks plus everything they import statically, transitively. */
function staticClosureOfEntry(r: ChunkReport): Set<string> {
  const seen = new Set<string>()
  const stack = Object.keys(r).filter((f) => r[f].isEntry)
  while (stack.length) {
    const f = stack.pop()!
    if (seen.has(f)) continue
    seen.add(f)
    for (const dep of r[f]?.imports ?? []) stack.push(dep)
  }
  return seen
}

describe('relativeModuleId', () => {
  it('strips the build machine path', () => {
    expect(relativeModuleId('/Users/a/app/node_modules/three/build/three.module.js', '/Users/a/app')).toBe('/node_modules/three/build/three.module.js')
    expect(relativeModuleId('/Users/a/app/src/main.tsx', '/Users/a/app')).toBe('/src/main.tsx')
    expect(relativeModuleId('\0vite/preload-helper.js', '/Users/a/app')).toBe('vite/preload-helper.js')
  })
})

if (!present) console.info(`[chunks] SKIPPED: ${CHUNK_REPORT_PATH} absent; run \`npx vite build\` first`)

describe.skipIf(!present)(`chunk contract (${present ? CHUNK_REPORT_PATH : `SKIPPED: ${CHUNK_REPORT_PATH} absent, run npx vite build first`})`, () => {
  const files = Object.keys(report)
  const closure = staticClosureOfEntry(report)

  it('the report lists an entry chunk and module ids', () => {
    expect(files.some((f) => report[f].isEntry)).toBe(true)
    expect(files.reduce((n, f) => n + report[f].moduleIds.length, 0)).toBeGreaterThan(10)
    // ids are root-relative: no absolute path from the build machine
    expect(files.flatMap((f) => report[f].moduleIds.filter((id) => id.includes(APP_ROOT)))).toEqual([])
  })

  it('(a) no @babylonjs module in any chunk', () => {
    const hits = files.flatMap((f) => report[f].moduleIds.filter(isBabylon).map((id) => `${f}: ${id}`))
    expect(hits).toEqual([])
  })

  it('(b) three and @react-three are not in the entry chunk or its static imports', () => {
    const hits = [...closure].flatMap((f) => (report[f]?.moduleIds ?? []).filter((id) => isThree(id) || isR3F(id)).map((id) => `${f}: ${id}`))
    expect(hits).toEqual([])
  })

  it('(c) sanity: three is present in some chunk outside that closure', () => {
    const lazy = files.filter((f) => !closure.has(f) && report[f].moduleIds.some(isThree))
    expect(lazy.length).toBeGreaterThan(0)
  })
})
