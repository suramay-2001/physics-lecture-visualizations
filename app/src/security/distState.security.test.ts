/**
 * Pins the stale-dist guard (./distState.ts, round-3 fix #1) on a throwaway app tree, so a regression in the guard
 * cannot silently turn the dist checks of cdn.security / csp.security back into misleading assertions (or skips).
 */
import { afterAll, describe, expect, it } from 'vitest'
import { distState, newestInput } from './distState.ts'
import { path } from './node.ts'

interface WriteFs {
  mkdtempSync(prefix: string): string
  mkdirSync(p: string, o: { recursive: true }): void
  writeFileSync(p: string, data: string): void
  utimesSync(p: string, atime: number, mtime: number): void
  rmSync(p: string, o: { recursive: true; force: true }): void
}
const proc = (globalThis as unknown as { process: { getBuiltinModule(id: string): unknown } }).process
const wfs = proc.getBuiltinModule('node:fs') as WriteFs
const os = proc.getBuiltinModule('node:os') as { tmpdir(): string }

const root = wfs.mkdtempSync(path.join(os.tmpdir(), 'spinlab-dist-'))
afterAll(() => wfs.rmSync(root, { recursive: true, force: true }))

const T0 = 1_700_000_000 // seconds; every file starts here
const put = (rel: string, body: string, t = T0) => {
  const p = path.join(root, rel)
  wfs.mkdirSync(path.dirname(p), { recursive: true })
  wfs.writeFileSync(p, body)
  wfs.utimesSync(p, t, t)
}
const CSP_HTML = '<!doctype html><html><head><meta http-equiv="Content-Security-Policy" content="default-src \'none\'"><meta charset="UTF-8"></head></html>'

describe('distState (stale-dist guard)', () => {
  put('index.html', '<!doctype html>')
  put('src/main.tsx', 'x')
  put('build/csp.ts', 'x')
  put('public/_headers', 'x')

  it('missing dist → "run `npm run build` first"', () => {
    const s = distState(root)
    expect(s.ok).toBe(false)
    if (!s.ok) expect(s.message).toMatch(/dist\/index\.html does not exist — run `npm run build` first/)
  })

  it('a build newer than every input → ok', () => {
    put('dist/index.html', CSP_HTML, T0 + 10)
    expect(distState(root).ok).toBe(true)
  })

  it('a source, build plugin, public file or the HTML shell edited after the build → stale, naming the file', () => {
    for (const f of ['src/main.tsx', 'build/csp.ts', 'public/_headers', 'index.html']) {
      put(f, 'y', T0 + 20)
      const s = distState(root)
      expect(s.ok, f).toBe(false)
      if (!s.ok) expect(s.message).toContain(`${f} changed 10 s after dist/ was built — run \`npm run build\` first`)
      put(f, 'x', T0) // restore
    }
    expect(distState(root).ok).toBe(true)
  })

  it('test and spec files are not build inputs', () => {
    put('src/a.test.ts', 't', T0 + 99)
    put('build/b.security.test.ts', 't', T0 + 99)
    put('src/c.spec.tsx', 't', T0 + 99)
    expect(newestInput(root).file).not.toMatch(/\.(test|spec)\./)
    expect(distState(root).ok).toBe(true)
  })

  it('a fresh dist without the CSP <meta> first in <head> → not current, with the cspMeta() hint', () => {
    put('dist/index.html', '<!doctype html><html><head><meta charset="UTF-8"></head></html>', T0 + 10)
    const s = distState(root)
    expect(s.ok).toBe(false)
    if (!s.ok) {
      expect(s.message).toMatch(/no CSP <meta> first in <head>.*run `npm run build` first/)
      expect(s.message).toContain('cspMeta()')
    }
  })
})
