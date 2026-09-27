/**
 * Chunk report (W-L1 §6.1): after a build, write `node_modules/.tmp/chunk-modules.json` (under the Vite
 * root, i.e. app/), mapping each chunk file to the module ids it contains, the chunks it imports and its
 * size (raw and gzip). `build/chunks.test.ts` reads it to prove that Babylon stays behind the lab's dynamic
 * import, that three.js / @react-three stay out of the entry chunk and its static imports, and that the
 * lab chunks keep to their byte budgets; `src/security/cdn.security.test.ts` reads it to scope its scans. The Vite manifest cannot answer that: it does not list the
 * node_modules inside a chunk. The report is deliberately NOT emitted into dist/, so it never ships.
 *
 * Module ids are root-relative ("/src/…", "/node_modules/three/…"), so the file carries no absolute paths
 * from the build machine.
 */
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { gzipSync } from 'node:zlib'
import type { Plugin } from 'vite'
import type { ChunkReport } from './chunkGraph.ts'

export type { ChunkInfo, ChunkReport } from './chunkGraph.ts'

/** Where the report lives, relative to the Vite root (app/). */
export const CHUNK_REPORT_PATH = 'node_modules/.tmp/chunk-modules.json'
export const chunkReportFile = (root: string): string => resolve(root, CHUNK_REPORT_PATH)

/** "/abs/app/node_modules/x/y.js" → "/node_modules/x/y.js"; "/abs/app/src/a.ts" → "/src/a.ts"; virtual ids unchanged. */
export function relativeModuleId(id: string, root: string): string {
  const clean = id.replace(/\\/g, '/').replace(/^\0/, '')
  const nm = clean.indexOf('/node_modules/')
  if (nm >= 0) return clean.slice(nm)
  const r = root.replace(/\\/g, '/').replace(/\/$/, '')
  return r && clean.startsWith(r + '/') ? clean.slice(r.length) : clean
}

export function chunkReport(): Plugin {
  let root = ''
  return {
    name: 'spin-lab:chunk-report',
    apply: 'build',
    configResolved(config) {
      root = config.root
    },
    writeBundle(_options, bundle) {
      const report: ChunkReport = {}
      for (const out of Object.values(bundle)) {
        if (out.type !== 'chunk') continue
        report[out.fileName] = {
          isEntry: out.isEntry,
          isDynamicEntry: out.isDynamicEntry,
          name: out.name,
          moduleIds: out.moduleIds.map((id) => relativeModuleId(id, root)),
          imports: [...out.imports],
          dynamicImports: [...out.dynamicImports],
          bytes: Buffer.byteLength(out.code),
          gzip: gzipSync(out.code, { level: 9 }).length,
        }
      }
      const file = chunkReportFile(root)
      mkdirSync(dirname(file), { recursive: true })
      writeFileSync(file, JSON.stringify(report, null, 1))
    },
  }
}
