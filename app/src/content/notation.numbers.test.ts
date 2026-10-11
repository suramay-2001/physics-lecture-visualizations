/**
 * Every number a notation card shows comes from the engine (decisions/notation-explainers.md #4; review #13). An example's
 * caption (`says`) is built with the interpolation helper `N` in content/notation.entries.ts, which marks each number it writes;
 * `ex` reports the digits it finds OUTSIDE the marks as `typed`. Here:
 *   - no caption has a typed digit (a ket's label, `$|01\rangle$`, names a state and is not a number);
 *   - each number a caption shows equals one of that example's computed `values` or declared `inputs` (the numbers chosen);
 *   - each number in the example's TeX, apart from the entries of a matrix the engine printed, bit strings, state labels and
 *     exponents, is likewise a value or an input.
 */
import { describe, expect, it } from 'vitest'
import { NOTATION } from './notation'
import type { Example, ExampleValue } from './notationKit'

function leaves(rec: Readonly<Record<string, ExampleValue>> | undefined): { nums: number[]; strs: string[] } {
  const nums: number[] = []
  const strs: string[] = []
  for (const v of Object.values(rec ?? {})) {
    if (typeof v === 'number') nums.push(v)
    else if (typeof v === 'string') strs.push(v)
    else nums.push(...v)
  }
  return { nums, strs }
}
const known = (ex: Example) => {
  const a = leaves(ex.values)
  const b = leaves(ex.inputs)
  return { nums: [...a.nums, ...b.nums], strs: [...a.strs, ...b.strs] }
}
const same = (shown: number, v: number) => Math.abs(Math.abs(shown) - Math.abs(v)) < 5.1e-4

/** The numbers `texNum` prints as a fraction or a root, and their values. */
const EXACT: [RegExp, number][] = [
  [/\\tfrac\{1\}\{\\sqrt2\}/g, Math.SQRT1_2],
  [/\\tfrac\{\\sqrt3\}\{2\}/g, Math.sqrt(3) / 2],
  [/\\tfrac\{\\sqrt3\}\{4\}/g, Math.sqrt(3) / 4],
  [/\\tfrac\{1\}\{2\\sqrt2\}/g, 1 / (2 * Math.SQRT2)],
  [/\\tfrac\{\\hbar\}\{2\}/g, 0.5],
  [/\\tfrac12/g, 0.5],
  [/\\tfrac14/g, 0.25],
  [/\\tfrac34/g, 0.75],
  [/\\sqrt2/g, Math.SQRT2],
]

/** The number literals an example's TeX shows by itself (not inside a matrix the engine printed, an exponent, a label). */
function texLiterals(tex: string): { nums: number[]; words: string[] } {
  let s = tex
  s = s.replace(/\\begin\{pmatrix\}[\s\S]*?\\end\{pmatrix\}/g, ' ') // engine-printed matrices, columns and rows
  s = s.replace(/\\(?:text|mathrm|operatorname|xrightarrow)\{[^}]*\}/g, ' ') // words
  s = s.replace(/\|[^|]*?\\rangle/g, ' ').replace(/\\langle[^|]*?\|/g, ' ') // the names of states
  const nums: number[] = []
  for (const [re, v] of EXACT) s = s.replace(re, () => (nums.push(v), ' '))
  for (let prev = ''; prev !== s; ) {
    prev = s
    s = s.replace(/[_^]\{[^{}]*\}/g, ' ')
  }
  s = s.replace(/[_^]\\?[A-Za-z0-9]/g, ' ')
  const words = [...s.matchAll(/\d+(?:\.\d+)?/g)].map((m) => m[0])
  return { nums, words }
}

describe('every number on a notation card is computed', () => {
  const examples = NOTATION.map((e) => [e.id, e.example()] as const)

  it('no caption has a digit typed by hand; every number in it was interpolated (and most captions have some)', () => {
    let withNumbers = 0
    for (const [id, ex] of examples) {
      expect(ex.caption.typed, `${id}: "${ex.says}" has digits written by hand`).toEqual([])
      if (ex.caption.shown.length) withNumbers++
    }
    expect(withNumbers).toBeGreaterThan(40)
  })

  it.each(examples)('%s: each number its caption shows is one of its computed values or chosen inputs', (id, ex) => {
    const k = known(ex)
    for (const s of ex.caption.shown) {
      if (k.strs.includes(s)) continue
      const n = Number(s.replace('−', '-'))
      expect(Number.isFinite(n), `${id}: "${s}" is neither a value nor a number`).toBe(true)
      expect(
        k.nums.some((v) => same(n, v)),
        `${id}: the caption shows ${s}, which is not among its values ${JSON.stringify(ex.values)} or inputs ${JSON.stringify(ex.inputs ?? {})}`,
      ).toBe(true)
    }
  })

  it.each(examples)('%s: each number its TeX shows is a computed value or a chosen input', (id, ex) => {
    const k = known(ex)
    const { nums, words } = texLiterals(ex.tex)
    // a literal is a bit string the example declares (an input string), or a number
    for (const w of words) {
      if (k.strs.includes(w)) continue
      nums.push(Number(w))
    }
    for (const n of nums)
      expect(
        k.nums.some((v) => same(n, v)),
        `${id}: the TeX "${ex.tex}" shows ${n}, which is not among its values ${JSON.stringify(ex.values)} or inputs ${JSON.stringify(ex.inputs ?? {})}`,
      ).toBe(true)
  })

  it('the words that name a result agree with the engine: the result labels of the Pauli and Hadamard examples come from the state, not from a typed label', () => {
    const tex = (id: string) => NOTATION.find((e) => e.id === id)!.example().tex
    expect(tex('pauli-x')).toMatch(/= \|\{-z\}\\rangle$/)
    expect(tex('pauli-y')).toMatch(/= i\\,\|\{-z\}\\rangle$/)
    expect(tex('pauli-z')).toMatch(/= -\|\{-z\}\\rangle$/)
    expect(tex('hadamard')).toMatch(/= \|\{\+x\}\\rangle$/)
    expect(tex('arrow')).toMatch(/\|\{-z\}\\rangle$/)
    expect(tex('cz')).toMatch(/= -\|11\\rangle$/)
    expect(tex('element')).toContain('\\text{ is true;}')
    expect(tex('element')).toContain('\\text{ is false}')
    expect(tex('sigma-vec')).toContain('0\\,\\sigma_x + 0\\,\\sigma_y + 1\\,\\sigma_z')
  })

  it('gcd uses the engine’s gcd and Euclid steps', () => {
    const ex = NOTATION.find((e) => e.id === 'gcd')!.example()
    expect(ex.values).toEqual({ gcd: 12 })
    expect(ex.says).toBe('Euclid’s steps: 84 = 2·36 + 12, then 36 = 3·12 + 0. The last nonzero remainder is 12.')
  })
})
