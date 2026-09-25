/**
 * Is app/dist a production build of THIS tree? (owner S; round-3 fix #1). TEST-ONLY, like ./node.ts.
 *
 * `cdn.security` and `csp.security` assert things about the BUILT app. Run on a missing or stale dist/, their
 * assertions fail (or pass) about code that is no longer the code under test: right after a merge, 6 tests
 * failed with misleading diffs until `vite build` ran (2026-09-25). So each of those files first asks
 * `distState()` and, when the build is not current, fails ONE test with one message ending in
 * "run `npm run build` first" and skips its dist assertions.
 *
 * Stale means: dist/index.html is missing, or it is older than the newest build input (below), or it has no CSP
 * <meta> as the first child of <head> (a dev artefact or a `vite build` without cspMeta()). Build inputs: every
 * non-test file under src/, build/ and public/, plus index.html, vite.config.ts, package.json and
 * package-lock.json. Test and spec files are not inputs: editing them never changes dist/.
 */
import { APP_DIR, fs, path } from './node.ts'

export const BUILD_FIRST = 'run `npm run build` first'

export type DistState = { ok: true; builtAt: number } | { ok: false; message: string }

const INPUT_DIRS = ['src', 'build', 'public']
const INPUT_FILES = ['index.html', 'vite.config.ts', 'package.json', 'package-lock.json']
const isTestFile = (f: string) => /\.(test|spec)\.[cm]?[jt]sx?$/.test(f)
const CSP_FIRST = /<head>\s*<meta http-equiv="Content-Security-Policy" content="default-src/

/** Newest build input (absolute path + mtime). Skips node_modules, dot-directories and test files. */
export function newestInput(appDir = APP_DIR): { file: string; mtimeMs: number } {
  let best = { file: '', mtimeMs: 0 }
  const consider = (p: string) => {
    const m = fs.statSync(p).mtimeMs
    if (m > best.mtimeMs) best = { file: p, mtimeMs: m }
  }
  const visit = (d: string) => {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      const p = path.join(d, e.name)
      if (e.isDirectory()) {
        if (e.name !== 'node_modules' && !e.name.startsWith('.')) visit(p)
      } else if (e.isFile() && !isTestFile(e.name)) consider(p)
    }
  }
  for (const d of INPUT_DIRS) if (fs.existsSync(path.join(appDir, d))) visit(path.join(appDir, d))
  for (const f of INPUT_FILES) if (fs.existsSync(path.join(appDir, f))) consider(path.join(appDir, f))
  return best
}

const ago = (ms: number) => (ms < 90_000 ? `${Math.round(ms / 1000)} s` : ms < 5_400_000 ? `${Math.round(ms / 60_000)} min` : `${(ms / 3_600_000).toFixed(1)} h`)

/** One verdict for the whole dist/ (cheap: one stat per input file). */
export function distState(appDir = APP_DIR): DistState {
  const index = path.join(appDir, 'dist', 'index.html')
  const why = (reason: string, hint = ''): DistState => ({
    ok: false,
    message: `app/dist is not a current production build: ${reason} — ${BUILD_FIRST}, then re-run the tests.${hint}`,
  })
  if (!fs.existsSync(index)) return why('dist/index.html does not exist')
  const builtAt = fs.statSync(index).mtimeMs
  const newest = newestInput(appDir)
  if (newest.mtimeMs > builtAt)
    return why(`${path.relative(appDir, newest.file)} changed ${ago(newest.mtimeMs - builtAt)} after dist/ was built`)
  if (!CSP_FIRST.test(fs.readFileSync(index, 'utf8')))
    return why(
      'dist/index.html has no CSP <meta> first in <head> (built by something other than `npm run build`?)',
      ' If it persists right after `npm run build`, cspMeta() in vite.config.ts stopped injecting the policy.',
    )
  return { ok: true, builtAt }
}
