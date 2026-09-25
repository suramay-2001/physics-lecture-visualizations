/**
 * physics/expr.ts (W-L1 §3.5, S-L1 §4f): the whole S §4f table, parseMatrix2, a property fuzz, a
 * DIFFERENTIAL fuzz against a verbatim copy of the pre-W1 parseNumber, and the numpy `expr_values` fixture
 * (hand-written Python equivalents, never a parser).
 */
import { describe, expect, it } from 'vitest'
import { parseNumber } from '../ui/parseNumber'
import fx from './__fixtures__/numpy.json'
import { type C, c } from './complex'
import {
  LIMITS,
  type Limits,
  type Mode,
  type Node,
  type ParseError,
  type Parsed,
  evalComplex,
  evalReal,
  evalRealLoose,
  parse,
  parseMatrix2,
  sampleCurve,
  sampleGrid,
} from './expr'
import exprSource from './expr.ts?raw'
import { matEq } from './linalg'
import { rng } from './random'
import { Rz, SIGMA_Y, SIGMA_Z } from './spin'

const REASONS: readonly ParseError[] = ['empty', 'too-long', 'bad-char', 'unknown-identifier', 'too-many-tokens', 'too-deep', 'syntax', 'unexpected-end']
const LIMIT_REASONS: readonly ParseError[] = ['too-long', 'too-many-tokens', 'too-deep']
const reasonOf = (r: Parsed): ParseError | 'ok' => (r.ok ? 'ok' : r.reason)
const real = (s: string, limits: Limits = LIMITS.answer, vars?: string[]) => parse(s, { mode: 'real', limits, vars })
const cplx = (s: string, limits: Limits = LIMITS.cell) => parse(s, { mode: 'complex', limits })
const grapher = (s: string) => parse(s, { mode: 'real', limits: LIMITS.grapher, vars: ['x', 't'] })
const ast = (r: Parsed): Node => {
  if (!r.ok) throw new Error(`expected ok, got ${r.reason} at ${r.pos}`)
  return r.ast
}
const relClose = (a: number, b: number, tol = 1e-12) => Math.abs(a - b) <= tol * Math.max(1, Math.abs(b))

// ---------------------------------------------------------------------------------------------------------
describe('S §4f table', () => {
  it("'' and '   ' → empty", () => {
    for (const s of ['', '   ', '\t \n']) {
      expect(reasonOf(real(s))).toBe('empty')
      expect(reasonOf(cplx(s))).toBe('empty')
      expect(parseNumber(s)).toBeNull()
    }
  })

  it("'1+'.repeat(101)+'1' (203 chars) → too-long (answers, grapher, cells)", () => {
    const s = '1+'.repeat(101) + '1'
    expect(s.length).toBe(203)
    expect(real(s)).toEqual({ ok: false, pos: 200, reason: 'too-long' })
    expect(reasonOf(grapher(s))).toBe('too-long')
    expect(reasonOf(cplx(s))).toBe('too-long')
    expect(parseNumber(s)).toBeNull()
    expect(reasonOf(real('1+'.repeat(99) + '1'))).toBe('too-many-tokens') // 199 chars: under the length cap
  })

  it("'('.repeat(33)+'1'+')'.repeat(33) → too-deep, not a RangeError", () => {
    const s = '('.repeat(33) + '1' + ')'.repeat(33)
    for (const r of [real(s), grapher(s), cplx(s, LIMITS.grapher)]) expect(r).toEqual({ ok: false, pos: 32, reason: 'too-deep' })
    expect(parseNumber(s)).toBeNull()
    // boundary: depth 32 is allowed
    expect(evalReal(ast(grapher('('.repeat(32) + '1' + ')'.repeat(32))))).toBe(1)
  })

  it("'-'.repeat(40)+'1' → too-deep", () => {
    expect(real('-'.repeat(40) + '1')).toEqual({ ok: false, pos: 32, reason: 'too-deep' })
    expect(evalReal(ast(real('-'.repeat(32) + '1')))).toBe(1)
    expect(reasonOf(real('-'.repeat(33) + '1'))).toBe('too-deep')
    // the other two depth counters: power chains and function arguments
    expect(reasonOf(real('2^'.repeat(33) + '1', LIMITS.grapher))).toBe('too-deep')
    expect(reasonOf(real('√'.repeat(33) + '1'))).toBe('too-deep')
    expect(reasonOf(cplx('('.repeat(17) + '1' + ')'.repeat(17)))).toBe('too-deep') // cell depth 16
  })

  it.each(['constructor', 'toString', 'hasOwnProperty(1)', 'valueOf', 'constructor(1)', '1*constructor(3)', 'prototype'])(
    '%s → unknown-identifier (real, complex, grapher)',
    (s) => {
      expect(reasonOf(real(s))).toBe('unknown-identifier')
      expect(reasonOf(cplx(s, LIMITS.answer))).toBe('unknown-identifier')
      expect(reasonOf(grapher(s))).toBe('unknown-identifier')
      expect(parseNumber(s)).toBeNull()
    },
  )

  it.each(['alert(1)', 'window', 'this', 'x=>x', '1;2', '`1`', '[1]', '{}', "'a'", '__proto__', 'a.b'])('%s → rejected by char or identifier', (s) => {
    for (const r of [real(s), cplx(s, LIMITS.answer), grapher(s)]) {
      expect(r.ok).toBe(false)
      expect(['bad-char', 'unknown-identifier', 'syntax']).toContain(reasonOf(r))
    }
    expect(parseNumber(s)).toBeNull()
    expect(parseMatrix2([[s, '0'], ['0', '0']]).ok).toBe(false)
  })

  it('reports the offending character at its position in the ORIGINAL string', () => {
    expect(real('1;2')).toEqual({ ok: false, pos: 1, reason: 'bad-char' })
    expect(real('2 + $')).toEqual({ ok: false, pos: 4, reason: 'bad-char' })
    expect(real('`1`')).toEqual({ ok: false, pos: 0, reason: 'bad-char' })
    expect(grapher('x=>x')).toEqual({ ok: false, pos: 1, reason: 'bad-char' })
    expect(real('2 * window')).toEqual({ ok: false, pos: 4, reason: 'unknown-identifier' })
    expect(real('(1+2')).toEqual({ ok: false, pos: 4, reason: 'unexpected-end' })
    expect(real('3//4')).toEqual({ ok: false, pos: 2, reason: 'syntax' })
    expect(real('1 . 5 .')).toEqual({ ok: false, pos: 6, reason: 'syntax' })
  })

  it.each(['1/0', '0/0', '9^9^9', '1e309', 'ln(0)'])('%s → answers reject non-finite; the grapher gets gaps', (s) => {
    const a = ast(real(s))
    expect(evalReal(a)).toBeNaN()
    expect(parseNumber(s)).toBeNull()
    expect(evalComplex(ast(cplx(s)))).toBeNull()
    const curve = sampleCurve(ast(grapher(`${s} + 0x`)), 'x', [-1, 1], 16)
    expect(curve.length).toBe(16)
    expect([...curve].every(Number.isNaN)).toBe(true)
  })

  it('sqrt(-1): real mode rejects, complex mode gives {re: 0, im: 1}', () => {
    expect(evalReal(ast(real('sqrt(-1)')))).toBeNaN()
    expect(parseNumber('sqrt(-1)')).toBeNull()
    expect(evalComplex(ast(cplx('sqrt(-1)')))).toEqual({ re: 0, im: 1 })
    expect(reasonOf(cplx('√-1'))).toBe('syntax') // √ binds to the next atom; '-1' is not an atom (as before)
    expect(evalComplex(ast(cplx('√(-1)')))).toEqual({ re: 0, im: 1 })
  })

  it.each([
    ['2pi', 6.2832, 2 * Math.PI],
    ['√3/2', 0.866, Math.sqrt(3) / 2],
    ['cos(pi/8)^2', 0.853553, Math.cos(Math.PI / 8) ** 2],
    ['1/sqrt2', 0.7071, Math.SQRT1_2],
    ['ħ/4', 0.25, 0.25],
  ] as const)('%s ≈ %d (regression of the existing tests)', (s, shown, exact) => {
    expect(parseNumber(s)).toBeCloseTo(shown, 4)
    expect(parseNumber(s)).toBeCloseTo(exact, 14)
    expect(evalComplex(ast(cplx(s)))!.re).toBeCloseTo(exact, 14)
  })

  it.each([
    ['-2^2', -4],
    ['2^-1', 0.5],
    ['2^3^2', 512],
  ] as const)('%s = %d (documented precedence)', (s, want) => {
    expect(parseNumber(s)).toBe(want)
    expect(evalComplex(ast(cplx(s)))).toEqual({ re: want, im: 0 })
  })

  it('grapher: sin(x) on 10⁶ requested samples is clamped to 1024; fields to 128 × 128', () => {
    const a = ast(grapher('sin(x)'))
    const y = sampleCurve(a, 'x', [0, Math.PI], 1e6)
    expect(y.length).toBe(1024)
    expect(y[0]).toBe(0)
    expect(y[1023]).toBeCloseTo(0, 12)
    expect(y[512]).toBeCloseTo(Math.sin((Math.PI * 512) / 1023), 14)
    expect(sampleCurve(a, 'x', [0, 1], Infinity).length).toBe(1024)
    expect(sampleCurve(a, 'x', [0, 1], NaN).length).toBe(0)
    const g = sampleGrid(ast(grapher('x*t')), ['x', 't'], [0, 1], [0, 2], 1e6, 1e6)
    expect(g).toBeInstanceOf(Float32Array)
    expect(g.length).toBe(128 * 128)
    expect(g[127 * 128 + 127]).toBeCloseTo(2, 6)
    expect(g[127 * 128]).toBe(0) // x = 0 on row t = 2
  })

  it('grapher gaps: |y| > 1e6 and non-finite samples become NaN, finite ones stay', () => {
    const y = sampleCurve(ast(grapher('1/x')), 'x', [-1, 1], 5) // x = −1, −½, 0, ½, 1
    expect([...y]).toEqual([-1, -2, NaN, 2, 1])
    const big = sampleCurve(ast(grapher('10^x')), 'x', [5, 7], 3) // 1e5, 1e6, 1e7
    expect([...big]).toEqual([1e5, 1e6, NaN])
    const f = sampleGrid(ast(grapher('ln(x*t)')), ['x', 't'], [0, 1], [1, 1], 2, 1)
    expect(Number.isNaN(f[0])).toBe(true)
    expect(f[1]).toBe(0)
  })
})

// ---------------------------------------------------------------------------------------------------------
describe('names, modes and variables', () => {
  it('i exists only in complex mode; variables only when listed', () => {
    expect(reasonOf(real('2i'))).toBe('unknown-identifier')
    expect(evalComplex(ast(cplx('2i')))).toEqual({ re: 0, im: 2 })
    expect(reasonOf(real('x^2'))).toBe('unknown-identifier')
    const r = real('x^2 + 2x', LIMITS.grapher, ['x'])
    expect(r.ok && r.vars).toEqual(['x'])
    expect(evalReal(ast(r), new Map([['x', 3]]))).toBe(15)
    expect(evalReal(ast(r))).toBeNaN() // a missing variable is a gap, not a throw
    expect(reasonOf(real('t', LIMITS.grapher, ['x']))).toBe('unknown-identifier')
    expect(real('T+X', LIMITS.grapher, ['x', 't'])).toMatchObject({ ok: true, vars: ['t', 'x'] })
  })

  it('complex-only functions are unknown in real mode (real mode keeps the old function set)', () => {
    for (const f of ['conj', 're', 'im', 'arg']) {
      expect(reasonOf(real(`${f}(1)`))).toBe('unknown-identifier')
      expect(cplx(`${f}(1)`).ok).toBe(true)
    }
  })

  it('whitespace: parseNumber deletes it (as before), complex mode separates tokens', () => {
    expect(parseNumber('1 2')).toBe(12)
    expect(parseNumber('sqrt pi')).toBeNull() // "sqrtpi" is one unknown name
    expect(parseNumber('2 pi')).toBeCloseTo(2 * Math.PI, 14)
    expect(evalComplex(ast(cplx('i pi')))).toEqual({ re: 0, im: Math.PI })
    expect(evalComplex(ast(cplx('sqrt pi')))!.re).toBeCloseTo(Math.sqrt(Math.PI), 14)
  })

  it('case-insensitive names, Unicode operators, and the √/function-binds-to-atom rule', () => {
    expect(parseNumber('PI')).toBe(Math.PI)
    expect(parseNumber('Π')).toBe(Math.PI) // legacy: the /i regex matches capital pi too
    expect(parseNumber('SQRT(4)')).toBe(2)
    expect(parseNumber('6 ÷ 4 × 2 · 1 − 1')).toBe(2)
    expect(parseNumber('cos(0)^2')).toBe(1)
    expect(parseNumber('√4^3')).toBe(8) // (√4)^3
    expect(parseNumber('2E3')).toBeCloseTo(2 * Math.E * 3, 14) // exponent is lower-case e only; E is Euler's e
    expect(parseNumber('2e3')).toBe(2000)
  })

  it('complex arithmetic agrees with real arithmetic on real inputs, bit for bit', () => {
    for (const s of ['1/3', '2^0.5', 'sin(1)+cos(2)', 'tan(0.3)', 'exp(-2)', 'ln(7)', '(-2)^3', 'abs(-4)/7', '√3/2']) {
      expect(evalComplex(ast(cplx(s, LIMITS.answer)))).toEqual({ re: evalReal(ast(real(s))), im: 0 })
    }
  })
})

// ---------------------------------------------------------------------------------------------------------
describe('whitespace separates identifiers in real mode (Round 3 #6)', () => {
  const g = (src: string, vars?: string[]) => parse(src, { mode: 'real', limits: LIMITS.grapher, vars })
  const val = (src: string, env: Record<string, number> = {}) => evalReal(ast(g(src, Object.keys(env))), new Map(Object.entries(env)))

  it('"2 pi t" = 2·π·t, "x y" = x·y, "sin x" = sin(x) (the grapher defect: "pit" was one unknown name)', () => {
    expect(val('2 pi t', { t: 0.5 })).toBeCloseTo(Math.PI, 14)
    expect(val('x y', { x: 2, y: 3 })).toBe(6)
    expect(val('sin x', { x: Math.PI / 2 })).toBe(1)
    expect(val('cos t sin t', { t: 0.3 })).toBe(Math.cos(0.3) * Math.sin(0.3))
    expect(val('x\ty\u00a0t', { x: 2, y: 3, t: 5 })).toBe(30) // any whitespace, including tab and NBSP
    // the old rule (whitespace deleted) read the unknown name "pit"
    expect(parse('2 pi t', { mode: 'real', limits: LIMITS.grapher, vars: ['t'], whitespace: 'ignored' })).toEqual({ ok: false, pos: 2, reason: 'unknown-identifier' })
  })

  it('without whitespace nothing changes: "2pi" and "2pi t" work, "sinpi" and "xy" stay one name', () => {
    expect(val('2pi')).toBeCloseTo(2 * Math.PI, 14)
    expect(val('2pi t', { t: 2 })).toBeCloseTo(4 * Math.PI, 14)
    expect(val('2t', { t: 3 })).toBe(6)
    expect(reasonOf(g('sinpi'))).toBe('unknown-identifier')
    expect(g('xy', ['x', 'y'])).toEqual({ ok: false, pos: 0, reason: 'unknown-identifier' })
  })

  it('numbers still ignore whitespace in real mode ("1 2" = 12, "2 pi" = 2π, "1 . 5" = 1.5, "1e 3" = 1000)', () => {
    expect(val('1 2')).toBe(12)
    expect(val('2 pi')).toBeCloseTo(2 * Math.PI, 14)
    expect(val('1 . 5')).toBe(1.5)
    expect(val('1e 3')).toBe(1000)
    expect(val('x 2', { x: 4 })).toBe(8)
  })

  it('error positions point into the raw string', () => {
    expect(g('x q', ['x'])).toEqual({ ok: false, pos: 2, reason: 'unknown-identifier' })
    expect(g('sin   foo')).toEqual({ ok: false, pos: 6, reason: 'unknown-identifier' })
  })

  it('parseNumber keeps the old rule exactly ("sqrt pi", "sin pi" unreadable), while real parse reads them', () => {
    expect(parseNumber('sqrt pi')).toBeNull()
    expect(parseNumber('sin pi')).toBeNull()
    expect(parseNumber('1 2')).toBe(12)
    expect(val('sqrt pi')).toBeCloseTo(Math.sqrt(Math.PI), 14)
    expect(Math.abs(val('sin pi'))).toBeLessThan(1e-15)
    expect(evalComplex(ast(cplx('i pi')))).toEqual({ re: 0, im: Math.PI }) // complex mode: unchanged
  })

  it('fuzz: the default and the old rule differ ONLY where whitespace sits between two ASCII letters', () => {
    const rand = rng(44806)
    const ALPHA = '0123456789.e+-*/^() πħ√×·÷−sqrtcoinexplabhdxy\t'
    let differ = 0
    for (let k = 0; k < 6000; k++) {
      let src = ''
      const len = 1 + Math.floor(rand() * 30)
      for (let j = 0; j < len; j++) src += pick(rand, ALPHA)
      const a = parse(src, { mode: 'real', vars: ['x', 'y'] })
      const b = parse(src, { mode: 'real', vars: ['x', 'y'], whitespace: 'ignored' })
      if (JSON.stringify(a) === JSON.stringify(b)) continue
      differ++
      expect(/[a-z]\s+[a-z]/i.test(src), JSON.stringify(src)).toBe(true)
    }
    expect(differ).toBeGreaterThan(10) // the property is exercised, not vacuous (29 with this seed)
  })
})

describe('parseMatrix2', () => {
  it("[['1','0'],['0','-1']] is σ_z; [['0','-i'],['i','0']] is σ_y", () => {
    const z = parseMatrix2([['1', '0'], ['0', '-1']])
    expect(z).toEqual({ ok: true, M: SIGMA_Z })
    const y = parseMatrix2([['0', '-i'], ['i', '0']])
    expect(y).toEqual({ ok: true, M: SIGMA_Y })
  })

  it('reads phases: diag(e^(iπ/4), e^(-iπ/4)) = R_z(−π/2)', () => {
    const r = parseMatrix2([['e^(iπ/4)', '0'], ['0', 'e^(-iπ/4)']])
    expect(r.ok && matEq(r.M, Rz(-Math.PI / 2), 1e-15)).toBe(true)
  })

  it('errors carry the cell: parse errors, non-finite, |z| > 1e6, cell length and depth caps', () => {
    expect(parseMatrix2([['1', 'x'], ['0', '1']])).toEqual({ ok: false, cell: [0, 1], pos: 0, reason: 'unknown-identifier' })
    expect(parseMatrix2([['1', '2'], ['3', '1/0']])).toEqual({ ok: false, cell: [1, 1], pos: 0, reason: 'non-finite' })
    expect(parseMatrix2([['1', '0'], ['1e6i+1', '0']])).toMatchObject({ ok: false, cell: [1, 0], reason: 'too-large' })
    expect(parseMatrix2([['1e6', '0'], ['0', '-1e6']]).ok).toBe(true)
    expect(parseMatrix2([['1'.repeat(65), '0'], ['0', '0']])).toMatchObject({ ok: false, cell: [0, 0], reason: 'too-long' })
    expect(parseMatrix2([['0', '0'], ['(1+i', '0']])).toMatchObject({ ok: false, cell: [1, 0], reason: 'unexpected-end' })
    expect(parseMatrix2([['0', ''], ['0', '0']])).toMatchObject({ ok: false, cell: [0, 1], reason: 'empty' })
  })
})

// ---------------------------------------------------------------------------------------------------------
// Property fuzz: never throws, returns ok or a known reason, and is fast.
const ALLOWED = '0123456789.e+-*/^(),  \tπħ√×·÷−abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
const HOSTILE = '$;[]{}`\'"=<>!@#&|\\~\u0000‮😀ϖĦ'
const pick = (rand: () => number, s: string) => s[Math.floor(rand() * s.length)]

function checkParsed(r: Parsed, src: string) {
  if (r.ok) {
    expect(r.ast).toBeTypeOf('object')
    expect(Array.isArray(r.vars)).toBe(true)
  } else {
    expect(REASONS).toContain(r.reason)
    expect(Number.isInteger(r.pos) && r.pos >= 0 && r.pos <= Math.max(src.length, 200)).toBe(true)
  }
}

describe('property fuzz (5000 random strings over the allowed alphabet, plus hostile and deep ones)', () => {
  it('never throws, always returns ok or a reason, and parses in well under 1 ms on average', () => {
    const rand = rng(4485)
    const inputs: string[] = []
    for (let k = 0; k < 5000; k++) {
      const len = rand() < 0.1 ? 190 + Math.floor(rand() * 30) : Math.floor(rand() * 60)
      let s = ''
      for (let j = 0; j < len; j++) s += pick(rand, ALLOWED)
      inputs.push(s)
    }
    for (let k = 0; k < 1000; k++) {
      let s = ''
      const len = Math.floor(rand() * 40)
      for (let j = 0; j < len; j++) s += rand() < 0.15 ? pick(rand, HOSTILE) : pick(rand, ALLOWED)
      inputs.push(s)
    }
    for (const unit of ['(', '-', '+', '√', '2^', 'sin', '-(', '(-', 'e^', '2(']) for (let n = 1; n <= 120; n += 7) inputs.push(unit.repeat(n) + '1' + (unit.includes('(') ? ')'.repeat(n) : ''))

    let parses = 0
    let total = 0
    for (const s of inputs) {
      for (const run of [() => real(s), () => cplx(s), () => grapher(s), () => parse(s, { mode: 'complex', limits: LIMITS.answer })]) {
        const t0 = performance.now()
        const r = run()
        total += performance.now() - t0
        parses++
        checkParsed(r, s)
        if (r.ok) {
          expect(() => evalReal(r.ast, new Map([['x', 0.5], ['t', 2]]))).not.toThrow()
          expect(() => evalComplex(r.ast)).not.toThrow()
        }
      }
      expect(() => parseNumber(s)).not.toThrow()
    }
    expect(parses).toBeGreaterThanOrEqual(24000)
    expect(total / parses).toBeLessThan(1) // ms per parse
    expect(total).toBeLessThan(5000)
  })
})

// ---------------------------------------------------------------------------------------------------------
// DIFFERENTIAL: the pre-W1 app/src/ui/parseNumber.ts, copied verbatim (only `export` removed and the module
// wrapped in a closure). parseNumber must agree with it on every input except the one intended difference:
// inputs over the new limits (length 200, 64 tokens, depth 32) are rejected.
const legacyParseNumber = (() => {
  // Null-prototype tables + Object.hasOwn lookups (decision #10, W-L1 §4.4 interim fix): identifiers such as
  // "constructor", "toString", "__proto__" or "valueOf" must not resolve to Object.prototype members.
  // W1 replaces these internals with physics/expr.ts; the public behaviour stays the same.
  const FUNCS: Readonly<Record<string, (x: number) => number>> = Object.freeze(
    Object.assign(Object.create(null) as Record<string, (x: number) => number>, {
      sqrt: Math.sqrt,
      sin: Math.sin,
      cos: Math.cos,
      tan: Math.tan,
      exp: Math.exp,
      ln: Math.log,
      abs: Math.abs,
    }),
  )
  const CONSTS: Readonly<Record<string, number>> = Object.freeze(
    Object.assign(Object.create(null) as Record<string, number>, { pi: Math.PI, π: Math.PI, e: Math.E, ħ: 1, hbar: 1 }),
  )

  type Tok = { t: 'num'; v: number } | { t: 'id'; v: string } | { t: 'op'; v: string }

  function tokenize(src: string): Tok[] | null {
    const s = src.replace(/\s+/g, '').replace(/×|·/g, '*').replace(/÷/g, '/').replace(/−/g, '-')
    const toks: Tok[] = []
    let i = 0
    while (i < s.length) {
      const ch = s[i]
      if (/[0-9.]/.test(ch)) {
        const m = /^[0-9]*\.?[0-9]+(e[+-]?[0-9]+)?|^[0-9]+\.?/.exec(s.slice(i))
        if (!m) return null
        toks.push({ t: 'num', v: parseFloat(m[0]) })
        i += m[0].length
      } else if (/[a-zπħ√]/i.test(ch)) {
        if (ch === '√') {
          toks.push({ t: 'id', v: 'sqrt' })
          i++
          continue
        }
        const m = /^([a-z]+|π|ħ)/i.exec(s.slice(i))!
        toks.push({ t: 'id', v: m[0].toLowerCase() })
        i += m[0].length
      } else if ('+-*/^()'.includes(ch)) {
        toks.push({ t: 'op', v: ch })
        i++
      } else return null
    }
    return toks
  }

  function parseNumber(src: string): number | null {
    const tokens = tokenize(src)
    if (!tokens || tokens.length === 0) return null
    const toks: Tok[] = tokens
    let p = 0
    const peek = () => toks[p]
    const isOp = (v: string) => peek()?.t === 'op' && peek()!.v === v

    // expr := term (('+'|'-') term)*
    function expr(): number {
      let v = term()
      while (isOp('+') || isOp('-')) {
        const op = toks[p++].v
        const r = term()
        v = op === '+' ? v + r : v - r
      }
      return v
    }
    // term := unary (('*'|'/') unary | implicit-multiply unary)*
    function term(): number {
      let v = unary()
      for (;;) {
        if (isOp('*') || isOp('/')) {
          const op = toks[p++].v
          const r = unary()
          v = op === '*' ? v * r : v / r
        } else if (peek() && (peek()!.t !== 'op' || peek()!.v === '(')) {
          v *= unary() // "2pi", "3√2", "2(1+i)"
        } else return v
      }
    }
    function unary(): number {
      if (isOp('-')) {
        p++
        return -unary()
      }
      if (isOp('+')) {
        p++
        return unary()
      }
      return power()
    }
    // power := atom ('^' unary)?
    function power(): number {
      const base = atom()
      if (isOp('^')) {
        p++
        return Math.pow(base, unary())
      }
      return base
    }
    function atom(): number {
      const tok = toks[p++]
      if (!tok) throw new Error('end')
      if (tok.t === 'num') return tok.v
      if (tok.t === 'op' && tok.v === '(') {
        const v = expr()
        if (!isOp(')')) throw new Error(')')
        p++
        return v
      }
      if (tok.t === 'id') {
        if (Object.hasOwn(CONSTS, tok.v)) return CONSTS[tok.v]
        // Functions bind to the next atom, so cos(x)^2 = (cos x)² and √3/2 = (√3)/2.
        if (Object.hasOwn(FUNCS, tok.v)) return FUNCS[tok.v](atom())
      }
      throw new Error('unexpected')
    }

    try {
      const v = expr()
      if (p !== toks.length || !Number.isFinite(v)) return null
      return v
    } catch {
      return null
    }
  }
  return parseNumber
})()

const DIFF_ALPHABET = '0123456789.e+-*/^() πħ√×·÷−sqrtcoinexplabhd'
const DIFF_TOKENS = [
  '0', '1', '2', '3', '4', '7', '9', '10', '.5', '2.5', '1.', '1e3', '1e-2', '3e+1', '1e309', '1e-400', 'e', 'E', 'pi', 'PI', 'π', 'Π', 'ħ', 'hbar',
  'sqrt', '√', 'sin', 'cos', 'tan', 'exp', 'ln', 'abs', '+', '-', '*', '/', '^', '^', '(', '(', ')', ')', ' ', '×', '·', '÷', '−', '.', 'x', 'i', '!',
]
const REGRESSION = [
  // parseNumber.test.ts, verbatim
  '0.75', '3/4', '.5', '√3/2', 'sqrt(3)/2', '1/sqrt2', '1/√2', 'cos(pi/8)^2', '2pi', '-ħ/2', 'ħ/4', '(1+√2)/2', '2^-1', '−1/2', '3 × 0.25', '1e-3',
  '', 'abc', '3//4', '(1+2', 'alert(1)', '1/0', 'constructor', 'toString', '__proto__', 'hasOwnProperty(1)', 'valueOf', 'constructor(1)', 'constructor(2)*1', '1*constructor(3)',
  // S §4f table (the parts under the new limits)
  '   ', 'window', 'this', 'x=>x', '1;2', '`1`', '[1]', '{}', "'a'", '0/0', '9^9^9', '1e309', 'ln(0)', 'sqrt(-1)', '-2^2', '2^3^2',
  // edges of the old tokenizer and grammar
  '1.', '12.', '1..2', '.', '..5', '1e', '1e+', '2e3', '2e', '2E3', 'e2', 'ee', 'PI', 'Π', 'Ħ', 'ϖ', 'ħħ', '√-1', 'sqrt pi', 'sqrtpi', '1 2', '2(3)',
  '(2)(3)', '--2', '+2', '+-+2', '2^', '^2', '()', '(', ')', '2)', 'sin', 'sinpi', 'sin pi', 'cos(pi)^2', '√√16', '2√2', '√4^3', '2^-2^2', '4/2/2',
  '2^3*4', 'sin(pi/6)cos(pi/3)', 'e^2', 'exp(1)', 'ln(e^3)', 'abs(-3)', '1\u00a02', '1\u20032', '\ufeff1', '6 ÷ 4', '2·3', '2 × − 3', '2*-3', '2/-3',
  '-(-(-1))', '2(', '(2', '1+', '*1', '1,2', '1e-400', '0^0', '0^-1', '(-8)^(1/3)', '(-8)^3',
  // a non-finite intermediate with a finite final value: parseNumber keeps the old answer (evalRealLoose)
  '1/(1/0)', '1/1e309', '0^1e309', '2^-1e309', 'exp(-1e309)', '1/9^9^9', '(0/0)^0', '1/ln(0)', 'exp(ln(0))',
]

const TREE_ATOMS = ['0', '1', '2', '3', '7', '.5', '2.5', '10', '1e3', '1e-2', '0.001', 'pi', 'π', 'e', 'ħ', 'hbar', 'PI', 'Π', '1e309', '1e-400']
const TREE_OPS = ['+', '-', '*', '/', '^', ' + ', ' − ', '×', '·', '÷', '^-', '*-']
const TREE_FNS = ['sqrt', 'sin', 'cos', 'tan', 'exp', 'ln', 'abs', '√', 'SIN']
const pickOf = (rand: () => number, xs: readonly string[]) => xs[Math.floor(rand() * xs.length)]
/** A random expression tree rendered as text: mostly readable, so the differential compares many values. */
function treeExpr(rand: () => number, depth: number): string {
  const r = rand()
  if (depth <= 0 || r < 0.25) return pickOf(rand, TREE_ATOMS)
  if (r < 0.5) return treeExpr(rand, depth - 1) + pickOf(rand, TREE_OPS) + treeExpr(rand, depth - 1)
  if (r < 0.6) return '(' + treeExpr(rand, depth - 1) + ')'
  if (r < 0.68) return pickOf(rand, ['-', '+', '−', '--']) + treeExpr(rand, depth - 1)
  if (r < 0.85) return pickOf(rand, TREE_FNS) + (rand() < 0.75 ? '(' + treeExpr(rand, depth - 1) + ')' : pickOf(rand, TREE_ATOMS))
  return pickOf(rand, TREE_ATOMS) + (rand() < 0.5 ? ' ' : '') + treeExpr(rand, depth - 1) // implicit multiplication
}

describe('differential fuzz: parseNumber (expr.ts) vs the verbatim pre-W1 parseNumber', () => {
  it('agrees on every input except those over the new limits', () => {
    const rand = rng(4486)
    const inputs: string[] = [...REGRESSION]
    for (let k = 0; k < 6000; k++) {
      const len = 1 + Math.floor(rand() * 40)
      let s = ''
      for (let j = 0; j < len; j++) s += pick(rand, DIFF_ALPHABET)
      inputs.push(s)
    }
    for (let k = 0; k < 6000; k++) {
      let s = ''
      const n = 1 + Math.floor(rand() * 16)
      for (let j = 0; j < n; j++) {
        const t = DIFF_TOKENS[Math.floor(rand() * DIFF_TOKENS.length)]
        if (s.length + t.length > 40) break
        s += t
      }
      inputs.push(s)
    }
    for (let k = 0; k < 6000; k++) {
      let s = treeExpr(rand, 5)
      while (s.length > 40) s = treeExpr(rand, 3)
      inputs.push(s)
    }

    let equal = 0
    let bitwise = 0
    let bothNull = 0
    let bothValue = 0
    const overLimits: string[] = []
    const mismatches: string[] = []
    for (const s of inputs) {
      const want = legacyParseNumber(s)
      const got = parseNumber(s)
      const same = got === null || want === null ? got === want : Math.abs(got - want) <= 1e-12 * Math.max(Math.abs(got), Math.abs(want)) || got === want
      if (same) {
        equal++
        if (got === null) bothNull++
        else bothValue++
        if (Object.is(got, want) || (got === 0 && want === 0)) bitwise++
        continue
      }
      const r = real(s)
      if (!r.ok && LIMIT_REASONS.includes(r.reason)) {
        overLimits.push(s)
        continue
      }
      mismatches.push(`${JSON.stringify(s)}: legacy ${want}, new ${got}`)
    }

    expect(mismatches).toEqual([])
    expect(inputs.length).toBeGreaterThanOrEqual(18000)
    expect(bothValue).toBeGreaterThan(3000) // the expression trees make the comparison mostly about values
    expect(bitwise).toBe(equal) // same operations in the same order: identical doubles, not just close ones
    // fuzz strings stay under 40 chars, so nothing reaches the limits; the limits are covered by the S §4f table
    expect(overLimits).toEqual([])
    console.info(
      `[expr differential] ${inputs.length} inputs: ${equal} identical (${bothValue} values, ${bothNull} both null), ` +
        `${overLimits.length} over limits, ${mismatches.length} mismatches`,
    )
  })
})

describe('strict evalReal vs evalRealLoose (the parseNumber compatibility choice, made visible)', () => {
  it.each([
    ['1/(1/0)', 0],
    ['1/1e309', 0],
    ['2^-1e309', 0],
    ['1/9^9^9', 0],
    ['(0/0)^0', 1],
    ['exp(ln(0))', 0],
  ] as const)('%s: parseNumber gives %d like the old code, evalReal gives NaN', (s, old) => {
    const a = ast(real(s))
    expect(evalReal(a)).toBeNaN() // strict: some intermediate node is non-finite
    expect(evalRealLoose(a)).toBe(old)
    expect(parseNumber(s)).toBe(old)
    expect(legacyParseNumber(s)).toBe(old)
  })

  it('both agree wherever every node is finite, and both give non-finite for 1/0', () => {
    for (const s of ['cos(pi/8)^2', '2^-1', '√3/2', '-2^2', 'ln(e^3)']) expect(evalRealLoose(ast(real(s)))).toBe(evalReal(ast(real(s))))
    expect(evalRealLoose(ast(real('1/0')))).toBe(Infinity)
    expect(parseNumber('1/0')).toBeNull()
  })
})

// ---------------------------------------------------------------------------------------------------------
type Cx = { re: number; im: number }
type FxExpr = { src: string; mode: Mode; vars?: Record<string, number>; value: Cx | null }
const EXPR = fx.expr_values as unknown as FxExpr[]

describe('numpy expr_values fixture (Python equivalents, not a parser)', () => {
  it('covers real and complex cases, including rejections', () => {
    expect(EXPR.filter((e) => e.mode === 'real').length).toBeGreaterThanOrEqual(40)
    expect(EXPR.filter((e) => e.mode === 'complex').length).toBeGreaterThanOrEqual(25)
    expect(EXPR.filter((e) => e.value === null).length).toBeGreaterThanOrEqual(8)
  })

  it.each(EXPR.map((e) => [`${e.mode}${e.vars ? ' ' + JSON.stringify(e.vars) : ''}: ${e.src}`, e] as const))('%s', (_label, e) => {
    const names = e.vars ? Object.keys(e.vars) : undefined
    const r = parse(e.src, { mode: e.mode, vars: names, limits: names ? LIMITS.grapher : LIMITS.answer })
    expect(r.ok).toBe(true)
    if (!r.ok) return
    if (e.mode === 'real') {
      const v = evalReal(r.ast, new Map(Object.entries(e.vars ?? {})))
      if (e.value === null) expect(v).toBeNaN()
      else expect(relClose(v, e.value.re), `${v} vs ${e.value.re}`).toBe(true)
      if (!names) {
        // parseNumber checks only the final value (old semantics): a Python rejection is a null answer unless
        // the loose evaluation still ends finite (e.g. 1/(1/0) → 0, see the strict-vs-loose block above)
        const loose = evalRealLoose(r.ast)
        expect(parseNumber(e.src)).toBe(e.value !== null ? v : Number.isFinite(loose) ? loose : null)
      }
    } else {
      const z = evalComplex(r.ast)
      if (e.value === null) expect(z).toBeNull()
      else {
        expect(z).not.toBeNull()
        const w: C = c(e.value.re, e.value.im)
        const scale = Math.max(1, Math.hypot(w.re, w.im))
        expect(Math.hypot(z!.re - w.re, z!.im - w.im) / scale, `${JSON.stringify(z)} vs ${JSON.stringify(w)}`).toBeLessThan(1e-12)
      }
    }
  })
})

// ---------------------------------------------------------------------------------------------------------
describe('no code from text (S §4f item 5, for this module)', () => {
  it('expr.ts has no eval, Function constructor, with-block or string timers, and reads names via Object.hasOwn', () => {
    for (const re of [/\beval\s*\(/, /\bnew\s+Function\b/, /\bFunction\s*\(/, /\bwith\s*\(/, /set(Timeout|Interval)\s*\(\s*['"`]/]) {
      expect(re.test(exprSource), String(re)).toBe(false)
    }
    expect(exprSource).toContain('Object.hasOwn(')
    expect(exprSource).toContain('Object.create(null)')
    expect(/\bin\s+(CONSTS|REAL_FNS|COMPLEX_FNS)\b/.test(exprSource)).toBe(false)
  })
})
