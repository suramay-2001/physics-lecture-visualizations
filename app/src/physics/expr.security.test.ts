/**
 * SPEC-ONLY security tests for the expression compiler `physics/expr.ts` (S-L1 §4f; W-L1 §3.5 signatures).
 * W1 owns and builds expr.ts in the build round. Until the file exists this whole suite is SKIPPED; the moment
 * it lands (`import.meta.glob` finds it) the suite runs against it and every case below must hold.
 * The module is loaded dynamically and typed locally from W-L1 §3.5, so this file compiles with or without it.
 */
import { beforeAll, describe, expect, it } from 'vitest'

type ParseError = 'empty' | 'too-long' | 'bad-char' | 'unknown-identifier' | 'too-many-tokens' | 'too-deep' | 'syntax' | 'unexpected-end'
interface Limits {
  maxLen: number
  maxTokens: number
  maxDepth: number
}
type Node = { t: string }
type Parsed = { ok: true; ast: Node; vars: string[] } | { ok: false; pos: number; reason: ParseError }
interface C {
  re: number
  im: number
}
type MatrixParse = { ok: true; M: unknown } | { ok: false; cell: [0 | 1, 0 | 1]; pos: number; reason: ParseError | 'non-finite' | 'too-large' }
interface ExprModule {
  LIMITS: { readonly answer: Limits; readonly grapher: Limits; readonly cell: Limits }
  parse(src: string, opts: { mode: 'real' | 'complex'; vars?: readonly string[]; limits?: Limits }): Parsed
  evalReal(ast: Node, env?: ReadonlyMap<string, number>): number
  evalComplex(ast: Node, env?: ReadonlyMap<string, C>): C | null
  sampleCurve(ast: Node, v: string, range: [number, number], n: number): Float64Array
  sampleGrid(ast: Node, vs: [string, string], rx: [number, number], ry: [number, number], nx: number, ny: number): Float32Array
  parseMatrix2(cells: readonly [readonly [string, string], readonly [string, string]]): MatrixParse
}

const LOADERS = import.meta.glob('./expr.ts')
const HAS_EXPR = Object.keys(LOADERS).length > 0
const REASONS: ParseError[] = ['empty', 'too-long', 'bad-char', 'unknown-identifier', 'too-many-tokens', 'too-deep', 'syntax', 'unexpected-end']

describe.skipIf(!HAS_EXPR)('physics/expr.ts security (S-L1 §4f table)', () => {
  let E: ExprModule
  const real = (src: string, vars?: string[]) => E.parse(src, { mode: 'real', vars, limits: E.LIMITS.answer })
  const reasonOf = (p: Parsed) => (p.ok ? 'ok' : p.reason)
  const value = (src: string) => {
    const p = real(src)
    return p.ok ? E.evalReal(p.ast) : null
  }

  beforeAll(async () => {
    E = (await LOADERS['./expr.ts']()) as ExprModule
  })

  it('limits match the spec: answer {200, 64, 32} · grapher {200, 128, 32} · cell {64, 32, 16}', () => {
    expect(E.LIMITS.answer).toMatchObject({ maxLen: 200, maxTokens: 64, maxDepth: 32 })
    expect(E.LIMITS.grapher).toMatchObject({ maxLen: 200, maxTokens: 128, maxDepth: 32 })
    expect(E.LIMITS.cell).toMatchObject({ maxLen: 64, maxTokens: 32, maxDepth: 16 })
  })

  it.each(['', '   '])('empty %j is rejected as empty', (src) => {
    expect(reasonOf(real(src))).toBe('empty')
  })
  it('203 chars → too-long', () => {
    expect(reasonOf(real('1+'.repeat(101) + '1'))).toBe('too-long')
  })
  it.each([
    ['33 nested parens', '('.repeat(33) + '1' + ')'.repeat(33)],
    ['40 chained minus', '-'.repeat(40) + '1'],
    ['33 chained powers', '2^'.repeat(33) + '2'],
  ])('%s → too-deep (a returned value, never a RangeError)', (_l, src) => {
    let p: Parsed | undefined
    expect(() => (p = real(src))).not.toThrow()
    expect(reasonOf(p!)).toMatch(/too-deep|too-many-tokens/)
  })
  it('10^5 nested parens never throw', () => {
    expect(() => real('('.repeat(100_000) + '1' + ')'.repeat(100_000))).not.toThrow()
  })

  it.each(['constructor', 'toString', 'hasOwnProperty(1)', 'valueOf', '__proto__', 'prototype', 'alert(1)', 'window', 'this'])('%s → unknown-identifier', (src) => {
    expect(reasonOf(real(src))).toBe('unknown-identifier')
  })
  it.each(['x=>x', '1;2', '`1`', '[1]', '{}', "'a'", '"a"', '1,2', '$1', 'a=1'])('%s → rejected (bad char or identifier)', (src) => {
    expect(reasonOf(real(src))).toMatch(/bad-char|unknown-identifier|syntax/)
  })
  it('variables must be declared; i exists only in complex mode', () => {
    expect(reasonOf(real('x'))).toBe('unknown-identifier')
    expect(real('x', ['x']).ok).toBe(true)
    expect(reasonOf(real('i'))).toBe('unknown-identifier')
    expect(E.parse('i', { mode: 'complex' }).ok).toBe(true)
  })

  it.each(['1/0', '0/0', '9^9^9', '1e309', 'ln(0)'])('%s is non-finite (rejected as an answer)', (src) => {
    const v = value(src)
    expect(v === null || !Number.isFinite(v)).toBe(true)
  })
  it('sqrt(-1): real mode non-finite, complex mode {re: 0, im: 1}', () => {
    const v = value('sqrt(-1)')
    expect(v === null || !Number.isFinite(v)).toBe(true)
    const p = E.parse('sqrt(-1)', { mode: 'complex' })
    expect(p.ok).toBe(true)
    if (p.ok) {
      const z = E.evalComplex(p.ast)!
      expect(z.re).toBeCloseTo(0, 12)
      expect(z.im).toBeCloseTo(1, 12)
    }
  })

  it.each([
    ['2pi', 2 * Math.PI],
    ['√3/2', Math.sqrt(3) / 2],
    ['cos(pi/8)^2', Math.cos(Math.PI / 8) ** 2],
    ['1/sqrt2', Math.SQRT1_2],
    ['ħ/4', 0.25],
    ['-2^2', -4],
    ['2^-1', 0.5],
    ['2^3^2', 512],
  ] as [string, number][])('%s = %d (regression + documented precedence)', (src, want) => {
    expect(value(src)).toBeCloseTo(want, 12)
  })

  it('grapher: 10^6 requested samples are clamped to 1024; bad points are gaps (NaN), not throws', () => {
    const p = E.parse('sin(x)', { mode: 'real', vars: ['x'], limits: E.LIMITS.grapher })
    expect(p.ok).toBe(true)
    if (!p.ok) return
    expect(E.sampleCurve(p.ast, 'x', [0, 1], 1_000_000).length).toBeLessThanOrEqual(1024)
    const q = E.parse('1/x', { mode: 'real', vars: ['x'], limits: E.LIMITS.grapher })
    if (!q.ok) throw new Error('1/x should parse')
    let ys: Float64Array = new Float64Array()
    expect(() => (ys = E.sampleCurve(q.ast, 'x', [-1, 1], 1001))).not.toThrow()
    for (const y of ys) expect(Number.isNaN(y) || Math.abs(y) <= 1e6).toBe(true)
  })
  it('grapher: grids are clamped to 128×128', () => {
    const p = E.parse('x*y', { mode: 'real', vars: ['x', 'y'], limits: E.LIMITS.grapher })
    if (!p.ok) throw new Error('x*y should parse')
    expect(E.sampleGrid(p.ast, ['x', 'y'], [0, 1], [0, 1], 10_000, 10_000).length).toBeLessThanOrEqual(128 * 128)
  })

  it('matrix cells: σ_z and σ_y parse; oversized, non-finite and long cells are rejected', () => {
    expect(E.parseMatrix2([['1', '0'], ['0', '-1']]).ok).toBe(true)
    expect(E.parseMatrix2([['0', '-i'], ['i', '0']]).ok).toBe(true)
    const big = E.parseMatrix2([['1e7', '0'], ['0', '1']])
    expect(big.ok ? 'ok' : big.reason).toBe('too-large')
    const inf = E.parseMatrix2([['1/0', '0'], ['0', '1']])
    expect(inf.ok ? 'ok' : inf.reason).toBe('non-finite')
    const long = E.parseMatrix2([['1+'.repeat(40) + '1', '0'], ['0', '1']])
    expect(long.ok ? 'ok' : long.reason).toMatch(/too-long|too-many-tokens/)
  })

  it('fuzz: 5000 random strings over the allowed alphabet never throw, each returns ok or a known reason, < 1 ms average', () => {
    const ALPHA = '0123456789.e+-*/^() πħ√×·÷−sqrtcosinlabhpxi,'
    let seed = 448
    const rnd = () => (seed = (seed * 1103515245 + 12345) >>> 0) / 2 ** 32
    const t0 = performance.now()
    for (let k = 0; k < 5000; k++) {
      let s = ''
      const n = Math.floor(rnd() * 60)
      for (let j = 0; j < n; j++) s += ALPHA[Math.floor(rnd() * ALPHA.length)]
      let p: Parsed | undefined
      expect(() => (p = E.parse(s, { mode: rnd() < 0.5 ? 'real' : 'complex', vars: ['x'] })), s).not.toThrow()
      expect(p!.ok || REASONS.includes(p!.reason), s).toBe(true)
    }
    expect((performance.now() - t0) / 5000).toBeLessThan(1)
  })
})

// Visible marker in the vitest summary while the suite is spec-only.
if (!HAS_EXPR) it.todo('physics/expr.ts has not landed: the S-L1 §4f security suite is skipped (spec only)')
