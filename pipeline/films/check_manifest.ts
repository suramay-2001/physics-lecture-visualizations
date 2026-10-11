/**
 * Recompute every number a film drew with the engine and fail on a mismatch. From the repo root:
 *   node pipeline/films/check_manifest.ts [film | path/to/manifest.json ...] [--self-test]
 * With no film named, it checks every film in pipeline/films/films.ts (each must have been rendered: films/output/<film>/manifest.json).
 *
 * The manifest is written by the scene from the DRAWN nodes (films/src/manifest.ts). Each film has its own check module
 * (pipeline/films/checks/<film>.ts) that imports only the engine (app/src/physics), never the film's own data module, so a wrong
 * layout or a hand-typed number shows up here. `--self-test` also runs each module's tampered copies of the manifest, which must FAIL
 * (otherwise the check itself might be a no-op).
 */
import fs from 'node:fs'
import { registerHooks } from 'node:module'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

// the engine is written for Vite (extensionless relative imports); let Node's type stripping load it as-is
registerHooks({
  resolve(specifier, context, nextResolve) {
    try {
      return nextResolve(specifier, context)
    } catch (e) {
      if (/^\.\.?\//.test(specifier) && !path.extname(specifier)) return nextResolve(`${specifier}.ts`, context)
      throw e
    }
  },
})

import type { CheckResult } from './checks/types.ts'
interface CheckModule {
  check: (manifest: unknown) => CheckResult
  selfTests?: (manifest: unknown) => [string, unknown][]
}

const { FILM_IDS } = (await import('./films.ts')) as { FILM_IDS: string[] }
const here = path.dirname(fileURLToPath(import.meta.url))
const manifestOf = (film: string) => path.resolve(here, '../../films/output', film, 'manifest.json')

const args = process.argv.slice(2)
const named = args.filter((a) => !a.startsWith('--'))
const targets = (named.length ? named : FILM_IDS).map((a) => (a.endsWith('.json') ? { file: path.resolve(a), film: null as string | null } : { file: manifestOf(a), film: a }))

let exit = 0
for (const t of targets) {
  if (!fs.existsSync(t.file)) {
    console.error(`check_manifest: no manifest at ${path.relative(process.cwd(), t.file)} (run node pipeline/films/render.ts)`)
    exit = 1
    continue
  }
  const manifest = JSON.parse(fs.readFileSync(t.file, 'utf8')) as { film?: string }
  const film = t.film ?? manifest.film
  if (!film || !FILM_IDS.includes(film)) {
    console.error(`check_manifest: ${path.relative(process.cwd(), t.file)} is for an unknown film ${film}`)
    exit = 1
    continue
  }
  const mod = (await import(`./checks/${film}.ts`)) as CheckModule
  const res = mod.check(manifest)
  console.log(`── ${film}`)
  res.rows.forEach((r) => console.log(r))
  console.log(`${res.count} checks, ${res.failures.length} failures (${path.relative(process.cwd(), t.file)})`)
  res.failures.forEach((f) => console.error(`  FAIL ${f}`))
  if (res.failures.length) exit = 1

  if (args.includes('--self-test')) {
    for (const [name, tampered] of mod.selfTests?.(manifest) ?? []) {
      const r = mod.check(tampered)
      console.log(`self-test (${name}): ${r.failures.length ? `fails as it should: ${r.failures[0]}` : 'PASSED — the check is blind to this'}`)
      if (!r.failures.length) exit = 1
    }
  }
}
process.exitCode = exit
