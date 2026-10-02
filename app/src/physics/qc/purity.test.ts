/**
 * The qc engine is pure TypeScript (W-709-platform §E; brief rule "no DOM, React, three or Babylon imports"): every
 * file under physics/qc imports only other engine files (relative paths inside src/physics) and names no browser
 * global, so content, the stage, films and Node scripts can all import it. Tests may add `vitest`.
 */
import { describe, expect, it } from 'vitest'

const SRC = import.meta.glob<string>('/src/physics/qc/**/*.ts', { query: '?raw', import: 'default', eager: true })
const isTest = (f: string) => /\.test\.ts$/.test(f)
const specifiers = (t: string) => [...t.matchAll(/(?:\bfrom\s*|\bimport\s*\(\s*|\bimport\s+)['"]([^'"]+)['"]/g)].map((m) => m[1])
const stripComments = (t: string) => t.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/.*$/gm, '$1')
const BROWSER = /\b(window|document|navigator|localStorage|sessionStorage|indexedDB|requestAnimationFrame|HTMLElement|WebGL\w*|fetch|XMLHttpRequest)\b/

/** Resolve a relative specifier against the importing file's directory (posix paths). */
function resolve(from: string, spec: string): string {
  const parts = from.split('/').slice(0, -1)
  for (const seg of spec.split('/')) {
    if (seg === '..') parts.pop()
    else if (seg !== '.') parts.push(seg)
  }
  return parts.join('/')
}

describe('physics/qc purity', () => {
  it('scans every engine module', () => {
    const names = Object.keys(SRC)
    for (const m of ['cmat', 'state', 'gates', 'circuit', 'measure', 'density', 'bits', 'complexExtra', 'info'])
      expect(names).toContain(`/src/physics/qc/${m}.ts`)
  })

  it('imports only engine files (relative, inside src/physics) — tests may also import vitest', () => {
    for (const [file, text] of Object.entries(SRC)) {
      for (const spec of specifiers(text)) {
        if (isTest(file) && spec === 'vitest') continue
        expect(spec.startsWith('./') || spec.startsWith('../'), `${file} imports "${spec}"`).toBe(true)
        expect(resolve(file, spec).startsWith('/src/physics/'), `${file} reaches outside physics: "${spec}"`).toBe(true)
        expect(/react|three|babylon|motion-canvas|gsap|\/stage\/|\/ui\/|\/content\//i.test(spec), `${file} imports "${spec}"`).toBe(false)
      }
    }
  })

  it('names no browser global outside comments', () => {
    for (const [file, text] of Object.entries(SRC)) {
      if (isTest(file)) continue
      const hit = BROWSER.exec(stripComments(text))
      expect(hit?.[0], `${file} uses a browser global`).toBeUndefined()
    }
  })
})
