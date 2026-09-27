/**
 * Expression compiler for learner answers, the grapher and Operator Lab matrix cells (W-L1 §3.5, S-L1 §4f).
 *
 * parse once → AST → evaluate many. Recursive descent over a tokenizer allowlist; evaluation is a pure
 * `switch` over `Node`. The module never builds code from text (no eval, no Function constructor, no
 * with-blocks, no string timers). Every failure is a returned value; the parser never throws into React.
 *
 * Grammar (identical to the pre-W1 `ui/parseNumber.ts`, which is now a thin wrapper over this module):
 *   expr  := term (('+' | '-') term)*
 *   term  := unary (('*' | '/') unary | unary)*      implicit multiplication when the next token is a
 *                                                    number, a name or '(' — "2pi", "3√2", "2(1+i)"
 *   unary := ('-' | '+') unary | power
 *   power := atom ('^' unary)?                       right-associative through unary: -2^2 = −4,
 *                                                    2^3^2 = 512, 2^-1 = 0.5
 *   atom  := number | '(' expr ')' | constant | variable | 'i' (complex mode) | function atom
 * Functions bind to the next ATOM, so cos(x)^2 = (cos x)² and √3/2 = (√3)/2.
 *
 * Tokens (allowlist): digits, '.', exponent `e±` (lower-case only, as before), `+ - * / ^ ( ) ,`, whitespace,
 * `π ħ √ × · ÷ −` and ASCII letters. `× ·` read as `*`, `÷` as `/`, `−` as `-`, `√` as `sqrt`. Names are
 * matched case-insensitively (PI = pi). Constants: pi π e ħ hbar (ħ = hbar = 1, the engine's units).
 * Real-mode functions: sqrt sin cos tan exp ln abs. Complex mode adds conj re im arg and the unit `i`. The grapher's
 * real mode (`fns: 'grapher'`) adds asin acos atan sinh cosh tanh; answers keep the old set, so their parsing is unchanged.
 * Whitespace (Round 3 #6). Real mode: whitespace separates IDENTIFIERS ("2 pi t" = 2·π·t, "x y" = x·y,
 * "sin x" = sin(x)) and is otherwise deleted, so numbers read as before ("1 2" = 12, "1 . 5" = 1.5, "2 pi" = 2π)
 * and "2pi" still works through the digit → letter boundary; "sinpi" stays one unknown name. Complex mode: it
 * separates every token, so "e^(i pi/4)" and "i sin(1)" read as written. `whitespace: 'ignored'` restores the
 * pre-W1 real-mode rule (all whitespace deleted: "sqrt pi" = the unknown "sqrtpi"); only ui/parseNumber uses
 * it, so learner answers keep their exact old semantics.
 *
 * Limits (S §4f): the length cap applies to the raw string; the token cap and the depth cap are reported at
 * the first offending token, scanning left to right. Depth counts '(' in atom, each chained unary sign, each
 * '^' exponent and each function argument, and overflow returns 'too-deep' (never a RangeError).
 * Name tables are null-prototype objects read with Object.hasOwn, so "constructor", "__proto__", "toString"
 * or "valueOf" are unknown identifiers, never Object.prototype members.
 *
 * Evaluation checks every node: evalReal gives NaN, evalComplex null, as soon as any node is non-finite
 * (so "1/(1/0)" is rejected rather than read as 0). The one exception is evalRealLoose, kept only so that
 * ui/parseNumber reproduces the old answer semantics exactly (final value checked, intermediates not).
 * Units: ħ = 1.
 */
import { type C, add, c, conj, mul, neg, sub } from './complex'
import type { Mat } from './linalg'

export type Mode = 'real' | 'complex'
export interface Limits {
  maxLen: number
  maxTokens: number
  maxDepth: number
}
export const LIMITS: { readonly answer: Limits; readonly grapher: Limits; readonly cell: Limits } = Object.freeze({
  answer: Object.freeze({ maxLen: 200, maxTokens: 64, maxDepth: 32 }),
  grapher: Object.freeze({ maxLen: 200, maxTokens: 128, maxDepth: 32 }),
  cell: Object.freeze({ maxLen: 64, maxTokens: 32, maxDepth: 16 }),
})

export type Node =
  | { t: 'num'; v: number }
  | { t: 'i' }
  | { t: 'const'; name: 'pi' | 'e' | 'hbar' }
  | { t: 'var'; name: string }
  | { t: 'neg'; a: Node }
  | { t: 'bin'; op: '+' | '-' | '*' | '/' | '^'; a: Node; b: Node }
  | { t: 'call'; fn: FnName; a: Node }
export type FnName =
  | 'sqrt' | 'sin' | 'cos' | 'tan' | 'exp' | 'ln' | 'abs' | 'conj' | 're' | 'im' | 'arg'
  | 'asin' | 'acos' | 'atan' | 'sinh' | 'cosh' | 'tanh'
export type ParseError =
  | 'empty'
  | 'too-long'
  | 'bad-char'
  | 'unknown-identifier'
  | 'too-many-tokens'
  | 'too-deep'
  | 'syntax'
  | 'unexpected-end'
export type Parsed = { ok: true; ast: Node; vars: string[] } | { ok: false; pos: number; reason: ParseError }

// ---------------------------------------------------------------------------------------------------------
// Name tables: null prototype + frozen, read only through Object.hasOwn.
function table<V>(entries: Record<string, V>): Readonly<Record<string, V>> {
  return Object.freeze(Object.assign(Object.create(null) as Record<string, V>, entries))
}
const CONSTS = table<'pi' | 'e' | 'hbar'>({ pi: 'pi', π: 'pi', e: 'e', ħ: 'hbar', hbar: 'hbar' })
/** Real mode keeps exactly the pre-W1 parseNumber function set. */
const REAL_FNS = table<FnName>({ sqrt: 'sqrt', sin: 'sin', cos: 'cos', tan: 'tan', exp: 'exp', ln: 'ln', abs: 'abs' })
/** The /lab grapher's real mode (S-lab §5): the answer set plus inverse trig and hyperbolic functions. */
const GRAPHER_FNS = table<FnName>({
  sqrt: 'sqrt', sin: 'sin', cos: 'cos', tan: 'tan', exp: 'exp', ln: 'ln', abs: 'abs',
  asin: 'asin', acos: 'acos', atan: 'atan', sinh: 'sinh', cosh: 'cosh', tanh: 'tanh',
})
const COMPLEX_FNS = table<FnName>({
  sqrt: 'sqrt', sin: 'sin', cos: 'cos', tan: 'tan', exp: 'exp', ln: 'ln', abs: 'abs',
  conj: 'conj', re: 're', im: 'im', arg: 'arg',
})

// ---------------------------------------------------------------------------------------------------------
// Tokenizer. The character classes and the number/name regexes are the pre-W1 parseNumber ones, verbatim.
type Tok =
  | { k: 'num'; v: number; pos: number }
  | { k: 'id'; v: string; pos: number }
  | { k: 'op'; v: string; pos: number }
  | { k: 'end'; pos: number }
  | { k: 'stop'; reason: ParseError; pos: number } // bad char, malformed number or token cap: parsing stops here

const WS = /\s/
const DIGIT_START = /[0-9.]/
const NUM = /^[0-9]*\.?[0-9]+(e[+-]?[0-9]+)?|^[0-9]+\.?/
const NAME_START = /[a-zπħ√]/i
const NAME = /^([a-z]+|π|ħ)/i
const OPS = '+-*/^(),'

type Lexed = { ok: true; toks: Tok[] } | { ok: false; pos: number; reason: ParseError }

/** Where whitespace ends a token: names (identifiers) and/or numbers. Otherwise it is simply deleted. */
type Separate = { names: boolean; numbers: boolean }

function tokenize(src: string, separate: Separate, limits: Limits): Lexed {
  if (src.length > limits.maxLen) return { ok: false, pos: limits.maxLen, reason: 'too-long' }
  // Normalize (whitespace out, × · ÷ − mapped) while remembering each char's original index and where
  // whitespace separated two characters.
  let norm = ''
  const at: number[] = []
  const gap: boolean[] = []
  let sawSpace = false
  for (let i = 0; i < src.length; i++) {
    let ch = src[i]
    if (WS.test(ch)) {
      sawSpace = true
      continue
    }
    if (ch === '×' || ch === '·') ch = '*'
    else if (ch === '÷') ch = '/'
    else if (ch === '−') ch = '-'
    norm += ch
    at.push(i)
    gap.push(sawSpace)
    sawSpace = false
  }
  const n = norm.length
  if (n === 0) return { ok: false, pos: 0, reason: 'empty' }
  // runEnd(on)[j]: where the run containing j ends when whitespace separates (the whole string when it does not).
  const runEnd = (on: boolean) => {
    const e = new Array<number>(n)
    e[n - 1] = n
    for (let j = n - 2; j >= 0; j--) e[j] = on && gap[j + 1] ? j + 1 : e[j + 1]
    return e
  }
  const numEnd = runEnd(separate.numbers)
  const nameEnd = separate.names === separate.numbers ? numEnd : runEnd(separate.names)

  const toks: Tok[] = []
  let j = 0
  while (j < n) {
    const pos = at[j]
    if (toks.length >= limits.maxTokens) {
      toks.push({ k: 'stop', reason: 'too-many-tokens', pos })
      return { ok: true, toks }
    }
    const ch = norm[j]
    if (DIGIT_START.test(ch)) {
      const m = NUM.exec(norm.slice(j, numEnd[j]))
      if (!m) {
        toks.push({ k: 'stop', reason: 'syntax', pos }) // a lone '.'
        return { ok: true, toks }
      }
      toks.push({ k: 'num', v: parseFloat(m[0]), pos })
      j += m[0].length
    } else if (NAME_START.test(ch)) {
      if (ch === '√') {
        toks.push({ k: 'id', v: 'sqrt', pos })
        j++
        continue
      }
      const m = NAME.exec(norm.slice(j, nameEnd[j]))
      if (!m) {
        toks.push({ k: 'stop', reason: 'bad-char', pos })
        return { ok: true, toks }
      }
      toks.push({ k: 'id', v: m[0].toLowerCase(), pos })
      j += m[0].length
    } else if (OPS.includes(ch)) {
      toks.push({ k: 'op', v: ch, pos })
      j++
    } else {
      toks.push({ k: 'stop', reason: 'bad-char', pos })
      return { ok: true, toks }
    }
  }
  toks.push({ k: 'end', pos: src.length })
  return { ok: true, toks }
}

// ---------------------------------------------------------------------------------------------------------
// Parser.
class Fail {
  readonly pos: number
  readonly reason: ParseError
  constructor(pos: number, reason: ParseError) {
    this.pos = pos
    this.reason = reason
  }
}

export interface ParseOptions {
  mode: Mode
  vars?: readonly string[]
  limits?: Limits
  /**
   * 'separates' (default): whitespace ends an identifier in real mode and every token in complex mode.
   * 'ignored': real mode deletes whitespace first, the pre-W1 parseNumber rule (complex mode always separates).
   * Additive option, Round 3 #6.
   */
  whitespace?: 'separates' | 'ignored'
  /** Real-mode function set: 'answer' (default, the pre-W1 parseNumber set) or 'grapher' (adds asin acos atan sinh
   *  cosh tanh). Ignored in complex mode. */
  fns?: 'answer' | 'grapher'
}

export function parse(src: string, opts: ParseOptions): Parsed {
  if (typeof src !== 'string') return { ok: false, pos: 0, reason: 'bad-char' }
  const mode: Mode = opts.mode === 'complex' ? 'complex' : 'real'
  const limits = opts.limits ?? LIMITS.answer
  const lexed = tokenize(src, { names: mode === 'complex' || opts.whitespace !== 'ignored', numbers: mode === 'complex' }, limits)
  if (!lexed.ok) return lexed
  const toks = lexed.toks
  const varTable: Record<string, true> = Object.create(null) as Record<string, true>
  for (const v of opts.vars ?? []) if (typeof v === 'string') varTable[v.toLowerCase()] = true
  const fns = mode === 'complex' ? COMPLEX_FNS : opts.fns === 'grapher' ? GRAPHER_FNS : REAL_FNS
  const used: string[] = []
  let p = 0
  let depth = 0

  const fail = (t: Tok, fallback: ParseError): never => {
    throw new Fail(t.pos, t.k === 'stop' ? t.reason : t.k === 'end' ? 'unexpected-end' : fallback)
  }
  const enter = (t: Tok) => {
    if (++depth > limits.maxDepth) throw new Fail(t.pos, 'too-deep')
  }
  const isOp = (t: Tok, ...vs: string[]) => t.k === 'op' && vs.includes(t.v)

  function expr(): Node {
    let a = term()
    for (;;) {
      const t = toks[p]
      if (t.k === 'op' && (t.v === '+' || t.v === '-')) {
        p++
        a = { t: 'bin', op: t.v, a, b: term() }
      } else return a
    }
  }
  function term(): Node {
    let a = unary()
    for (;;) {
      const t = toks[p]
      if (t.k === 'op' && (t.v === '*' || t.v === '/')) {
        p++
        a = { t: 'bin', op: t.v, a, b: unary() }
      } else if (t.k === 'num' || t.k === 'id' || t.k === 'stop' || isOp(t, '(')) {
        a = { t: 'bin', op: '*', a, b: unary() } // implicit multiplication
      } else return a
    }
  }
  function unary(): Node {
    const t = toks[p]
    if (isOp(t, '-', '+')) {
      p++
      enter(t)
      const a = unary()
      depth--
      return t.k === 'op' && t.v === '-' ? { t: 'neg', a } : a
    }
    return power()
  }
  function power(): Node {
    const base = atom()
    const t = toks[p]
    if (isOp(t, '^')) {
      p++
      enter(t)
      const e = unary()
      depth--
      return { t: 'bin', op: '^', a: base, b: e }
    }
    return base
  }
  function atom(): Node {
    const t = toks[p]
    if (t.k === 'end' || t.k === 'stop') return fail(t, 'syntax')
    p++
    if (t.k === 'num') return { t: 'num', v: t.v }
    if (t.k === 'op') {
      if (t.v !== '(') return fail(t, 'syntax')
      enter(t)
      const e = expr()
      const close = toks[p]
      if (!isOp(close, ')')) return fail(close, 'syntax')
      p++
      depth--
      return e
    }
    const name = t.v
    if (Object.hasOwn(varTable, name)) {
      if (!used.includes(name)) used.push(name)
      return { t: 'var', name }
    }
    if (mode === 'complex' && name === 'i') return { t: 'i' }
    if (Object.hasOwn(CONSTS, name)) return { t: 'const', name: CONSTS[name] }
    if (Object.hasOwn(fns, name)) {
      enter(t)
      const a = atom()
      depth--
      return { t: 'call', fn: fns[name], a }
    }
    throw new Fail(t.pos, 'unknown-identifier')
  }

  try {
    const ast = expr()
    const t = toks[p]
    if (t.k !== 'end') fail(t, 'syntax')
    return { ok: true, ast, vars: used }
  } catch (e) {
    if (e instanceof Fail) return { ok: false, pos: e.pos, reason: e.reason }
    // Unreachable with LIMITS; a caller-supplied huge maxDepth could still exhaust the stack.
    if (e instanceof RangeError) return { ok: false, pos: toks[Math.min(p, toks.length - 1)].pos, reason: 'too-deep' }
    throw e
  }
}

// ---------------------------------------------------------------------------------------------------------
// Real evaluation: plain IEEE arithmetic in the same order as the old parseNumber, but every node is checked.
const CONST_VALUE = { pi: Math.PI, e: Math.E, hbar: 1 } as const

function realFn(fn: FnName, x: number): number {
  switch (fn) {
    case 'sqrt': return Math.sqrt(x)
    case 'sin': return Math.sin(x)
    case 'cos': return Math.cos(x)
    case 'tan': return Math.tan(x)
    case 'exp': return Math.exp(x)
    case 'ln': return Math.log(x)
    case 'abs': return Math.abs(x)
    case 'conj': return x
    case 're': return x
    case 'im': return 0
    case 'arg': return Math.atan2(0, x)
    case 'asin': return Math.asin(x)
    case 'acos': return Math.acos(x)
    case 'atan': return Math.atan(x)
    case 'sinh': return Math.sinh(x)
    case 'cosh': return Math.cosh(x)
    case 'tanh': return Math.tanh(x)
  }
}

/** Value of `ast` for real inputs; NaN when any node (including a variable missing from env) is non-finite. */
export function evalReal(ast: Node, env?: ReadonlyMap<string, number>): number {
  const ev = (nd: Node): number => {
    let v: number
    switch (nd.t) {
      case 'num':
        v = nd.v
        break
      case 'i':
        return NaN
      case 'const':
        v = CONST_VALUE[nd.name]
        break
      case 'var':
        v = env?.get(nd.name) ?? NaN
        break
      case 'neg': {
        const a = ev(nd.a)
        if (Number.isNaN(a)) return NaN
        v = -a
        break
      }
      case 'bin': {
        const a = ev(nd.a)
        if (Number.isNaN(a)) return NaN
        const b = ev(nd.b)
        if (Number.isNaN(b)) return NaN
        v = nd.op === '+' ? a + b : nd.op === '-' ? a - b : nd.op === '*' ? a * b : nd.op === '/' ? a / b : Math.pow(a, b)
        break
      }
      case 'call': {
        const a = ev(nd.a)
        if (Number.isNaN(a)) return NaN
        v = realFn(nd.fn, a)
        break
      }
    }
    return Number.isFinite(v) ? v : NaN
  }
  try {
    return ev(ast)
  } catch {
    return NaN // only a hand-built AST deeper than the stack can get here
  }
}

/**
 * The pre-W1 parseNumber semantics: plain IEEE arithmetic through every intermediate (same operations, same
 * order), with no per-node guard; the CALLER decides what to do with a non-finite final value. It exists so
 * `ui/parseNumber` keeps identical public behaviour: "1/(1/0)" is 0 here (and in parseNumber) but NaN in
 * evalReal. New callers should use evalReal.
 */
export function evalRealLoose(ast: Node, env?: ReadonlyMap<string, number>): number {
  const ev = (nd: Node): number => {
    switch (nd.t) {
      case 'num': return nd.v
      case 'i': return NaN
      case 'const': return CONST_VALUE[nd.name]
      case 'var': return env?.get(nd.name) ?? NaN
      case 'neg': return -ev(nd.a)
      case 'bin': {
        const a = ev(nd.a)
        const b = ev(nd.b)
        return nd.op === '+' ? a + b : nd.op === '-' ? a - b : nd.op === '*' ? a * b : nd.op === '/' ? a / b : Math.pow(a, b)
      }
      case 'call': return realFn(nd.fn, ev(nd.a))
    }
  }
  try {
    return ev(ast)
  } catch {
    return NaN
  }
}

// ---------------------------------------------------------------------------------------------------------
// Complex evaluation ({re, im}; principal branches). Real arguments take the real Math.* path so that
// complex mode agrees with real mode wherever both are defined.
const isReal = (z: C) => z.im === 0

function cdiv(a: C, b: C): C {
  if (b.im === 0) return c(a.re / b.re, a.im / b.re)
  if (Math.abs(b.re) >= Math.abs(b.im)) {
    const r = b.im / b.re
    const d = b.re + b.im * r
    return c((a.re + a.im * r) / d, (a.im - a.re * r) / d)
  }
  const r = b.re / b.im
  const d = b.re * r + b.im
  return c((a.re * r + a.im) / d, (a.im * r - a.re) / d)
}
function csqrt(z: C): C {
  if (isReal(z)) return z.re >= 0 ? c(Math.sqrt(z.re)) : c(0, Math.sqrt(-z.re))
  const t = Math.sqrt((Math.hypot(z.re, z.im) + Math.abs(z.re)) / 2)
  if (z.re >= 0) return c(t, z.im / (2 * t))
  return c(Math.abs(z.im) / (2 * t), z.im < 0 ? -t : t)
}
function cexp(z: C): C {
  if (isReal(z)) return c(Math.exp(z.re))
  const m = Math.exp(z.re)
  return c(m * Math.cos(z.im), m * Math.sin(z.im))
}
const cln = (z: C): C => c(Math.log(Math.hypot(z.re, z.im)), Math.atan2(z.im, z.re))
function csin(z: C): C {
  if (isReal(z)) return c(Math.sin(z.re))
  return c(Math.sin(z.re) * Math.cosh(z.im), Math.cos(z.re) * Math.sinh(z.im))
}
function ccos(z: C): C {
  if (isReal(z)) return c(Math.cos(z.re))
  return c(Math.cos(z.re) * Math.cosh(z.im), -Math.sin(z.re) * Math.sinh(z.im))
}
function ctan(z: C): C {
  if (isReal(z)) return c(Math.tan(z.re))
  const d = Math.cos(2 * z.re) + Math.cosh(2 * z.im)
  return c(Math.sin(2 * z.re) / d, Math.sinh(2 * z.im) / d)
}
function cpow(a: C, b: C): C {
  if (isReal(a) && isReal(b) && (a.re >= 0 || Number.isInteger(b.re))) return c(Math.pow(a.re, b.re))
  if (isReal(b) && Number.isInteger(b.re) && Math.abs(b.re) <= 2 ** 30) {
    // exact for small integer powers: i^2 = −1, (1 − i)^3 = −2 − 2i
    let k = Math.abs(b.re)
    let base = a
    let acc = c(1)
    while (k > 0) {
      if (k & 1) acc = mul(acc, base)
      k >>>= 1
      if (k > 0) base = mul(base, base)
    }
    return b.re < 0 ? cdiv(c(1), acc) : acc
  }
  if (a.re === 0 && a.im === 0) return b.re > 0 ? c(0) : c(NaN, NaN)
  return cexp(mul(b, cln(a)))
}
function complexFn(fn: FnName, z: C): C {
  switch (fn) {
    case 'sqrt': return csqrt(z)
    case 'sin': return csin(z)
    case 'cos': return ccos(z)
    case 'tan': return ctan(z)
    case 'exp': return cexp(z)
    case 'ln': return isReal(z) && z.re > 0 ? c(Math.log(z.re)) : cln(z)
    case 'abs': return c(isReal(z) ? Math.abs(z.re) : Math.hypot(z.re, z.im))
    case 'conj': return conj(z)
    case 're': return c(z.re)
    case 'im': return c(z.im)
    case 'arg': return c(Math.atan2(z.im, z.re))
    // grapher-only real functions: they never parse in complex mode, so a hand-built AST gets a rejected value
    case 'asin':
    case 'acos':
    case 'atan':
    case 'sinh':
    case 'cosh':
    case 'tanh':
      return c(NaN, NaN)
  }
}

const finiteC = (z: C) => Number.isFinite(z.re) && Number.isFinite(z.im)

/** Complex value of `ast`; null when any node (including a variable missing from env) is non-finite.
 *  Signed zeros are normalized to +0 at every node: a typed "-1" is (−1, +0), so arg(-1) = π, ln(-1) = iπ and
 *  (-8)^(1/3) = 1 + i√3 take the principal branch instead of the −0 side of the cut. */
export function evalComplex(ast: Node, env?: ReadonlyMap<string, C>): C | null {
  const ev = (nd: Node): C | null => {
    let v: C
    switch (nd.t) {
      case 'num':
        v = c(nd.v)
        break
      case 'i':
        v = c(0, 1)
        break
      case 'const':
        v = c(CONST_VALUE[nd.name])
        break
      case 'var': {
        const z = env?.get(nd.name)
        if (!z) return null
        v = c(z.re, z.im)
        break
      }
      case 'neg': {
        const a = ev(nd.a)
        if (!a) return null
        v = neg(a)
        break
      }
      case 'bin': {
        const a = ev(nd.a)
        if (!a) return null
        const b = ev(nd.b)
        if (!b) return null
        v = nd.op === '+' ? add(a, b) : nd.op === '-' ? sub(a, b) : nd.op === '*' ? mul(a, b) : nd.op === '/' ? cdiv(a, b) : cpow(a, b)
        break
      }
      case 'call': {
        const a = ev(nd.a)
        if (!a) return null
        v = complexFn(nd.fn, a)
        break
      }
    }
    return finiteC(v) ? c(v.re + 0, v.im + 0) : null // x + 0 turns −0 into +0 and leaves every other x alone
  }
  try {
    return ev(ast)
  } catch {
    return null
  }
}

// ---------------------------------------------------------------------------------------------------------
// Sampling (grapher). Work caps from S §4f: 1024 samples per curve, 128 × 128 per field.
export const MAX_CURVE_SAMPLES = 1024
export const MAX_GRID_SIDE = 128
/** Samples whose magnitude exceeds this become gaps. */
export const MAX_SAMPLE_ABS = 1e6

const clampCount = (n: number, max: number): number => {
  const k = Math.floor(n)
  return k > 0 ? Math.min(max, k) : 0
}
const gapped = (y: number): number => (Number.isFinite(y) && Math.abs(y) <= MAX_SAMPLE_ABS ? y : NaN)
const lerpAt = (r: readonly [number, number], k: number, n: number): number => (n === 1 ? r[0] : r[0] + (r[1] - r[0]) * (k / (n - 1)))

/** Largest |end| of a sampling range (S-lab §5): wider ranges would lose every sample to rounding. */
export const MAX_RANGE_ABS = 1e6
export type RangeCheck = 'ok' | 'non-finite' | 'empty' | 'too-wide'
/** A sampling range the grapher accepts: finite ends, lo ≤ hi (equal ends: one point, e.g. a single grid row), both
 *  within ±MAX_RANGE_ABS. */
export function checkRange(r: readonly [number, number]): RangeCheck {
  if (!Number.isFinite(r[0]) || !Number.isFinite(r[1])) return 'non-finite'
  if (r[0] > r[1]) return 'empty'
  if (Math.abs(r[0]) > MAX_RANGE_ABS || Math.abs(r[1]) > MAX_RANGE_ABS) return 'too-wide'
  return 'ok'
}

/** y at n evenly spaced points of `range` (both ends included); n is clamped to ≤ 1024; gaps are NaN. A range that
 *  fails `checkRange` gives all gaps without evaluating anything. */
export function sampleCurve(ast: Node, v: string, range: [number, number], n: number): Float64Array {
  const N = clampCount(n, MAX_CURVE_SAMPLES)
  const out = new Float64Array(N)
  if (checkRange(range) !== 'ok') return out.fill(NaN)
  const env = new Map<string, number>()
  const key = v.toLowerCase()
  for (let k = 0; k < N; k++) {
    env.set(key, lerpAt(range, k, N))
    out[k] = gapped(evalReal(ast, env))
  }
  return out
}

/** f(x, y) on an nx × ny grid (each clamped to ≤ 128), row-major: out[iy * nx + ix]; gaps are NaN. */
export function sampleGrid(
  ast: Node,
  vs: [string, string],
  rx: [number, number],
  ry: [number, number],
  nx: number,
  ny: number,
): Float32Array {
  const NX = clampCount(nx, MAX_GRID_SIDE)
  const NY = clampCount(ny, MAX_GRID_SIDE)
  const out = new Float32Array(NX * NY)
  if (checkRange(rx) !== 'ok' || checkRange(ry) !== 'ok') return out.fill(NaN)
  const env = new Map<string, number>()
  const kx = vs[0].toLowerCase()
  const ky = vs[1].toLowerCase()
  for (let iy = 0; iy < NY; iy++) {
    env.set(ky, lerpAt(ry, iy, NY))
    for (let ix = 0; ix < NX; ix++) {
      env.set(kx, lerpAt(rx, ix, NX))
      out[iy * NX + ix] = gapped(evalReal(ast, env))
    }
  }
  return out
}

/**
 * A parametric curve: each AST is one coordinate, sampled at the same n points of `range` (≤ 1024), interleaved
 * [x₀, y₀, z₀, x₁, …]. A point with any non-finite coordinate is a gap in EVERY coordinate, so no half-defined
 * vertex reaches a mesh (S-lab §5). At most 3 coordinates.
 */
export function sampleParametric(asts: readonly Node[], v: string, range: [number, number], n: number): Float64Array {
  const k = Math.min(3, asts.length)
  const cols = asts.slice(0, k).map((a) => sampleCurve(a, v, range, n))
  const N = cols[0]?.length ?? 0
  const out = new Float64Array(N * k)
  for (let i = 0; i < N; i++) {
    const gap = cols.some((col) => Number.isNaN(col[i]))
    for (let j = 0; j < k; j++) out[i * k + j] = gap ? NaN : cols[j][i]
  }
  return out
}

// ---------------------------------------------------------------------------------------------------------
// Operator Lab: a 2×2 complex matrix typed cell by cell.
export type MatrixParse =
  | { ok: true; M: Mat }
  | { ok: false; cell: [0 | 1, 0 | 1]; pos: number; reason: ParseError | 'non-finite' | 'too-large' }

/** Largest |z| accepted in a matrix cell (S §4f item 7). */
export const MAX_CELL_ABS = 1e6
const CELLS: readonly [0 | 1, 0 | 1][] = [[0, 0], [0, 1], [1, 0], [1, 1]]

export function parseMatrix2(cells: readonly [readonly [string, string], readonly [string, string]]): MatrixParse {
  const M: Mat = [[c(0), c(0)], [c(0), c(0)]]
  for (const [r, k] of CELLS) {
    const res = parse(cells[r]?.[k], { mode: 'complex', limits: LIMITS.cell })
    if (!res.ok) return { ok: false, cell: [r, k], pos: res.pos, reason: res.reason }
    const z = evalComplex(res.ast)
    if (!z) return { ok: false, cell: [r, k], pos: 0, reason: 'non-finite' }
    if (Math.hypot(z.re, z.im) > MAX_CELL_ABS) return { ok: false, cell: [r, k], pos: 0, reason: 'too-large' }
    M[r][k] = z
  }
  return { ok: true, M }
}
