/**
 * The grapher grammar (`grammar: 'grapher'`, P review of the Grapher item 1): "number space number" and a function's
 * bare number or constant argument before an implicit product are errors at a caret; everything else reads as before.
 * What the other callers read is frozen separately (expr.answerMode.test.ts).
 */
import { describe, expect, it } from 'vitest'
import { LIMITS, evalReal, parse, type Parsed } from './expr'
import { rng } from './random'

const G = (src: string, vars: string[] = ['x', 'y', 't', 'a']) => parse(src, { mode: 'real', limits: LIMITS.grapher, fns: 'grapher', grammar: 'grapher', vars })
const OLD = (src: string, vars: string[] = ['x', 'y', 't', 'a']) => parse(src, { mode: 'real', limits: LIMITS.grapher, fns: 'grapher', vars })
const at = (r: Parsed, env: Record<string, number>) => {
  if (!r.ok) throw new Error(`expected ok, got ${r.reason} at ${r.pos}`)
  return evalReal(r.ast, new Map(Object.entries(env)))
}
const ENVS = [
  { x: 0.3, y: -1.7, t: 2.1, a: 0.5 },
  { x: -2.2, y: 0.9, t: -0.4, a: -3 },
  { x: 1.1, y: 3.3, t: 5.5, a: 1.25 },
]
/** `src` reads exactly like `explicit` (same values at several points). */
function same(src: string, explicit: string) {
  for (const e of ENVS) expect(at(G(src), e), `${src} vs ${explicit}`).toBe(at(G(explicit), e))
}

describe('review #1: number space number is an error at the second number', () => {
  it('"2 3" and "x^2 3" (were 23 and x²³), with the two numbers for the fix', () => {
    expect(G('2 3')).toEqual({ ok: false, pos: 2, reason: 'spaced-numbers', hint: ['2', '3'] })
    expect(G('x^2 3')).toEqual({ ok: false, pos: 4, reason: 'spaced-numbers', hint: ['2', '3'] })
    expect(G('1.5   2e3 + x')).toEqual({ ok: false, pos: 6, reason: 'spaced-numbers', hint: ['1.5', '2e3'] })
    expect(G('x + 2 .5')).toEqual({ ok: false, pos: 6, reason: 'spaced-numbers', hint: ['2', '.5'] })
    // "1e 3": the tokenizer's 1·e must not quietly become 3e
    expect(G('1e 3')).toEqual({ ok: false, pos: 3, reason: 'spaced-numbers', hint: ['1e', '3'] })
    // the old grapher reading, for the record
    expect(at(OLD('2 3'), {})).toBe(23)
    expect(at(OLD('x^2 3'), { x: 0.3 })).toBeCloseTo(0.3 ** 23, 30)
  })
  it('numbers written together, or separated by an operator, a bracket or a name, still read', () => {
    same('23', '23')
    same('2*3', '6')
    same('2·3', '6')
    same('(2) 3', '6')
    same('2 (3)', '6')
    same('2 x', '2*x')
    same('x 2', 'x*2')
    same('2 pi t', '2*pi*t')
    same('2 - 3', '-1')
    same('1e3 x', '1000*x')
    same('2e', '2*e')
    expect(G('1 . 5').ok).toBe(false) // a lone '.' between spaces is not a number
  })
})

describe('review #1: a function of a bare number or constant, then an implicit product, is an error there', () => {
  it('"sin 2x" and "cos pi t" (were sin(2)·x and cos(π)·t): caret at the factor, hint = function and argument', () => {
    expect(G('sin 2x')).toEqual({ ok: false, pos: 5, reason: 'bare-argument', hint: ['sin', '2'] })
    expect(G('cos pi t')).toEqual({ ok: false, pos: 7, reason: 'bare-argument', hint: ['cos', 'pi'] })
    expect(G('sin2x')).toMatchObject({ ok: false, pos: 4, reason: 'bare-argument' })
    expect(G('√2x')).toEqual({ ok: false, pos: 2, reason: 'bare-argument', hint: ['√', '2'] })
    expect(G('1 + sin 2(x+1)')).toMatchObject({ ok: false, pos: 9, reason: 'bare-argument' })
    expect(G('-sin 2 x')).toMatchObject({ ok: false, pos: 7, reason: 'bare-argument' })
    expect(G('sin sin 2 x')).toMatchObject({ ok: false, pos: 10, reason: 'bare-argument', hint: ['sin', '2'] })
    expect(G('x^cos e y')).toMatchObject({ ok: false, pos: 8, reason: 'bare-argument', hint: ['cos', 'e'] })
    expect(at(OLD('sin 2x'), { x: 3 })).toBe(Math.sin(2) * 3)
    expect(at(OLD('cos pi t'), { t: 3 })).toBe(-3)
  })
  it('"sin x cos y", "sin x", "2 sin x", "sin(2x)" and the explicit forms read the obvious way', () => {
    same('sin x cos y', 'sin(x)*cos(y)')
    same('sin x', 'sin(x)')
    same('2 sin x', '2*sin(x)')
    same('sin(2x)', 'sin(2*x)')
    same('sin(2) x', 'sin(2)*x')
    same('sin(2)·x', 'sin(2)*x')
    same('sin 2 * x', 'sin(2)*x')
    same('sin 2 / x', 'sin(2)/x')
    same('sin 2 + x', 'sin(2)+x')
    same('sin 2', 'sin(2)')
    same('cos pi', '-1')
    same('3 sin 2', '3*sin(2)')
    same('sin x^2', 'sin(x)*sin(x)')
    same('sin 2^2 x', 'sin(2)*sin(2)*x') // a power ends the bare argument: (sin 2)² x, as the help says of sin x^2
    same('(sin 2) x', 'sin(2)*x')
    same('exp(-t) cos(2 pi t)', 'exp(-t)*cos(2*pi*t)')
  })
  it('only with the option: the default grammar keeps "2 3" = 23 and "sin 2x" = sin(2)·x (answers never see it)', () => {
    for (const s of ['2 3', 'x^2 3', 'sin 2x', 'cos pi t', '1e 3']) expect(OLD(s).ok, s).toBe(true)
    // learner answers (parseNumber's options): "2 3" is still 23 there (expr.answerMode.test.ts freezes the rest)
    expect(at(parse('2 3', { mode: 'real', limits: LIMITS.answer, whitespace: 'ignored' }), {})).toBe(23)
  })
  it('fuzz: the grapher grammar only ever refuses, and where it reads, it reads the same as the default', () => {
    const rand = rng(1447)
    const ALPHA = '0123456789.e+-*/^() πxyt sincoexpqrtab\t'
    let refused = 0
    for (let k = 0; k < 6000; k++) {
      let src = ''
      const len = 1 + Math.floor(rand() * 24)
      for (let j = 0; j < len; j++) src += ALPHA[Math.floor(rand() * ALPHA.length)]
      const g = G(src)
      const o = OLD(src)
      if (g.ok) {
        // the same tree, except where whitespace follows a number: the default glued "2 e3" into 2000, here a space
        // ends the number (2·e·3), as it looks
        if (!/[0-9.]\s+[0-9.e]/i.test(src)) expect(g, JSON.stringify(src)).toEqual(o)
      } else if (['spaced-numbers', 'bare-argument', 'name-digit', 'bare-exponent'].includes(g.reason)) {
        refused++
        expect(g.hint, JSON.stringify(src)).toHaveLength(2)
      }
    }
    expect(refused).toBeGreaterThan(50)
  })
})

describe('review #1 follow-up: a constant or variable followed straight by a digit is an error at the digit', () => {
  it('"e3", "2 e3", "pi2", "x2" (were e·3, 2·e·3, π·2, x·2): caret at the digits, hint = name and digits', () => {
    expect(G('e3')).toEqual({ ok: false, pos: 1, reason: 'name-digit', hint: ['e', '3'] })
    expect(G('2 e3')).toEqual({ ok: false, pos: 3, reason: 'name-digit', hint: ['e', '3'] })
    expect(G('pi2')).toEqual({ ok: false, pos: 2, reason: 'name-digit', hint: ['pi', '2'] })
    expect(G('x2')).toEqual({ ok: false, pos: 1, reason: 'name-digit', hint: ['x', '2'] })
    expect(G('π2 + 1')).toEqual({ ok: false, pos: 1, reason: 'name-digit', hint: ['π', '2'] })
    expect(G('a10 t')).toEqual({ ok: false, pos: 1, reason: 'name-digit', hint: ['a', '10'] })
    expect(G('sin t3')).toMatchObject({ ok: false, pos: 5, reason: 'name-digit' })
    // the old reading, for the record
    expect(at(OLD('e3'), {})).toBe(Math.E * 3)
    expect(at(OLD('x2'), { x: 5 })).toBe(10)
  })
  it('"2e3" stays the number 2000 (scientific notation, no space); a name, a space, then a digit still reads', () => {
    expect(G('2e3')).toEqual({ ok: true, ast: { t: 'num', v: 2000 }, vars: [] })
    same('2e3', '2000')
    same('2e-3 x', '0.002*x')
    same('1e3 t', '1000*t')
    same('x 2', 'x*2')
    same('pi 2', 'pi*2')
    same('2e', '2*e')
    same('2x', '2*x')
    same('x·2', 'x*2')
  })
})

describe('review #1 follow-up: a power whose bare exponent is followed straight by a product is an error there', () => {
  it('"e^2x", "x^2y", "2^3t" (were e²·x, x²·y, 2³·t): caret at the factor, hint = base with ^ and exponent', () => {
    expect(G('e^2x')).toEqual({ ok: false, pos: 3, reason: 'bare-exponent', hint: ['e^', '2'] })
    expect(G('x^2y')).toEqual({ ok: false, pos: 3, reason: 'bare-exponent', hint: ['x^', '2'] })
    expect(G('2^3t')).toEqual({ ok: false, pos: 3, reason: 'bare-exponent', hint: ['2^', '3'] })
    expect(G('x^-2y')).toEqual({ ok: false, pos: 4, reason: 'bare-exponent', hint: ['x^', '-2'] })
    expect(G('e^t(1+t)')).toEqual({ ok: false, pos: 3, reason: 'bare-exponent', hint: ['e^', 't'] })
    expect(G('(x+1)^2y')).toEqual({ ok: false, pos: 7, reason: 'bare-exponent', hint: ['(x+1)^', '2'] })
    expect(G('2^3^2x')).toEqual({ ok: false, pos: 5, reason: 'bare-exponent', hint: ['2^', '3^2'] })
    expect(G('e^pi t')).toMatchObject({ ok: true }) // a space ends the exponent
    expect(at(OLD('e^2x'), { x: 3 })).toBe(Math.E ** 2 * 3)
    expect(at(OLD('x^2y'), { x: 2, y: 5 })).toBe(20)
  })
  it('"e^(2x)", "e^2*x", "e^2·x", "x^2 + y" and "x^2 y" (x²·y: the space ends the exponent) still read', () => {
    same('e^(2x)', 'e^(2*x)')
    same('e^2*x', 'e^2*x')
    same('e^2·x', 'e^2*x')
    same('x^2 + y', 'x*x + y')
    same('x^2 y', 'x*x*y')
    same('e^2 x', 'e^2*x')
    same('x^2', 'x*x')
    same('e^-t', 'e^(-t)')
    same('sin(x)^2 cos y', 'sin(x)*sin(x)*cos(y)')
    same('x^(2)y', 'x*x*y') // a bracketed exponent is explicit
    same('(1-x^2)(1-y^2)', '(1-x*x)*(1-y*y)')
    // the default grammar reads "x^2 y" the same way (nothing changed for it)
    expect(at(OLD('x^2 y'), { x: 3, y: 2 })).toBe(18)
  })
})
