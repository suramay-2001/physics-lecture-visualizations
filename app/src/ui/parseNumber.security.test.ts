/**
 * parseNumber security regression table (S-L1 §4f, finding S-07, decision #10). W owns the parser; this file
 * only pins its security behaviour. Two tiers:
 *  - holds today (interim Object.hasOwn fix at l1-freeze): prototype names, no-eval shapes, non-finite
 *    results, never-throws, time bounds, and the documented grammar;
 *  - holds once W1 turns parseNumber into the wrapper over physics/expr.ts (W-L1 §3.5, LIMITS.answer =
 *    {200 chars, 64 tokens, depth 32}): length/token/depth caps. Those cases switch on automatically when
 *    `physics/expr.ts` exists.
 */
import { describe, expect, it } from 'vitest'
import { parseNumber } from './parseNumber'

const HAS_EXPR = Object.keys(import.meta.glob('../physics/expr.ts')).length > 0

const timeMs = (f: () => void) => {
  const t0 = performance.now()
  f()
  return performance.now() - t0
}

describe('parseNumber: prototype names never resolve (Object.hasOwn / null-prototype tables)', () => {
  it.each([
    'constructor',
    'toString',
    '__proto__',
    '__defineGetter__',
    'hasOwnProperty(1)',
    'isPrototypeOf(1)',
    'propertyIsEnumerable(1)',
    'valueOf',
    'valueOf(1)',
    'toLocaleString',
    'constructor(1)',
    'constructor(2)*1',
    '1*constructor(3)',
    'sqrt(constructor)',
    'prototype',
    'call',
    'apply',
    'bind',
    'length',
    'name',
  ])('%s → null', (src) => {
    expect(parseNumber(src)).toBeNull()
  })
})

describe('parseNumber: code-shaped input is never evaluated', () => {
  it.each(['alert(1)', 'window', 'this', 'globalThis', 'x=>x', '()=>1', '1;2', '`1`', '[1]', '{}', "'a'", '"a"', 'a=1', 'import(1)', 'eval(1)', 'Function(1)', 'new Date', '1,2', '1 ? 2 : 3', '$1', '\\sqrt{2}', '1 || 2', '0x10', '1_000'])(
    '%s → null',
    (src) => {
      expect(parseNumber(src)).toBeNull()
    },
  )
})

describe('parseNumber: non-finite results are rejected', () => {
  it.each(['1/0', '-1/0', '0/0', '9^9^9', '1e309', '-1e309', 'ln(0)', 'sqrt(-1)', 'ln(-1)', '10^400', 'exp(1000)', 'tan(pi/2)^1e300'])('%s → null', (src) => {
    expect(parseNumber(src)).toBeNull()
  })
})

describe('parseNumber: documented grammar (regression)', () => {
  it.each([
    ['2pi', 2 * Math.PI],
    ['√3/2', Math.sqrt(3) / 2],
    ['cos(pi/8)^2', Math.cos(Math.PI / 8) ** 2],
    ['1/sqrt2', Math.SQRT1_2],
    ['ħ/4', 0.25],
    ['-2^2', -4],
    ['2^-1', 0.5],
    ['2^3^2', 512],
  ] as [string, number][])('%s = %d', (src, want) => {
    expect(parseNumber(src)).toBeCloseTo(want, 12)
  })
  it.each(['', '   ', '\t\n'])('empty %j → null', (src) => {
    expect(parseNumber(src)).toBeNull()
  })
})

describe('parseNumber: hostile sizes never throw and stay fast', () => {
  it('10^5 nested parentheses → null, no RangeError escapes', () => {
    const src = '('.repeat(100_000) + '1' + ')'.repeat(100_000)
    let v: number | null = 0
    expect(timeMs(() => (v = parseNumber(src)))).toBeLessThan(500)
    expect(v).toBeNull()
  })
  it('10^5 chained minus signs never throw', () => {
    expect(() => parseNumber('-'.repeat(100_000) + '1')).not.toThrow()
  })
  it('10^5 chained powers never throw', () => {
    expect(() => parseNumber('2^'.repeat(50_000) + '2')).not.toThrow()
  })
  it('200k-char flat input returns in < 500 ms', () => {
    const src = '1+'.repeat(100_000) + '1'
    expect(timeMs(() => parseNumber(src))).toBeLessThan(500)
  })
  it('5000 random strings over the parser alphabet: never throw, number-or-null, finite', () => {
    const ALPHA = '0123456789.e+-*/^() πħ√×·÷−sqrtcosinlabhpx'
    let seed = 448
    const rnd = () => (seed = (seed * 1103515245 + 12345) >>> 0) / 2 ** 32
    const t0 = performance.now()
    for (let i = 0; i < 5000; i++) {
      let s = ''
      const n = Math.floor(rnd() * 40)
      for (let k = 0; k < n; k++) s += ALPHA[Math.floor(rnd() * ALPHA.length)]
      let v: number | null = null
      expect(() => (v = parseNumber(s)), s).not.toThrow()
      expect(v === null || Number.isFinite(v), s).toBe(true)
    }
    expect(performance.now() - t0).toBeLessThan(2000)
  })
})

// W-L1 §3.5 / S-L1 §4f caps: enforced by physics/expr.ts. Skipped until W1 lands it (then they must hold).
describe.skipIf(!HAS_EXPR)('parseNumber over physics/expr.ts: structure caps (LIMITS.answer)', () => {
  it.each([
    ['203 chars', '1+'.repeat(101) + '1'],
    ['33 nested parens', '('.repeat(33) + '1' + ')'.repeat(33)],
    ['40 chained minus', '-'.repeat(40) + '1'],
    ['65+ tokens', '1+'.repeat(40) + '1'],
  ])('%s → null', (_label, src) => {
    expect(parseNumber(src)).toBeNull()
  })
  it('32 nested parens are still fine', () => {
    expect(parseNumber('('.repeat(30) + '1' + ')'.repeat(30))).toBe(1)
  })
})
