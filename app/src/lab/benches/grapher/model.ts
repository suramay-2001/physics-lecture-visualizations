/**
 * The Grapher's model (D-lab §2.4; decisions/lab.md; S-lab §5). PURE: typed texts in, the picture and every readout
 * out. Every number comes from the engine (app/src/physics): `parse` (real mode, LIMITS.grapher, the grapher function
 * set and grammar), `evalReal`, `sampleCurve` (a surface row by row in double precision, y bound as a number: rounded to
 * single precision it is bit for bit `sampleGrid`, model.test.ts), `sampleParametric` (≤ 1024; a gap in one coordinate
 * is a gap in all), `checkRange`, MAX_SAMPLE_ABS (the gap rule), and for the Bloch path `ketFromBloch`, `blochVector`,
 * `prob`, KET. Heights, ranges and the layer comparison are read in double precision (P review item 3).
 *
 * Three modes:
 *   surface  z = f(x, y) (the solid layer) and g(x, y) (the wire layer) over two ranges; the student names x and y;
 *   curve    (x(t), y(t), z(t)) over a range of t;
 *   bloch    θ(t), φ(t) (radians) drawn on the Bloch sphere as the engine's Bloch vector of
 *            cos(θ/2)|+z⟩ + e^{iφ} sin(θ/2)|−z⟩; a near-white state cursor.
 * One parameter `a` (−5…5) is bound into the parsed expressions as a number before sampling (the engine's samplers
 * take only the plotted variables), so a change of `a` is a full re-sample (the page throttles it; never per frame).
 *
 * The inputs are canonical: each text is parsed as typed; a text that does not read gives a caret position and a
 * plain reason, and the picture keeps the last inputs of that mode that all read correctly (`committed`).
 * Only finite values reach a vertex buffer: gap samples (non-finite or |value| > 10⁶) are holes in the surface and
 * breaks in a curve; their vertices sit at a finite placeholder that no triangle or line uses (model.test.ts fuzz).
 * Graph space has no units: no readout carries ħ or a unit (angles on the Bloch path are radians, shown with degrees).
 */
import { checkRange, evalReal, LIMITS, MAX_SAMPLE_ABS, parse, sampleCurve, sampleParametric, type Node, type ParseError } from '../../../physics/expr'
import { blochVector, KET, ketFromBloch, prob, type Vec3 } from '../../../physics/spin'
import { sig } from '../../format'
import type { GrapherGeometry, GrapherLabView } from '../../handle'
import { presetTable } from '../../presets'

/* ------------------------------------------------------------------------------------------------ */
/* Modes, fields, limits                                                                             */
/* ------------------------------------------------------------------------------------------------ */

export type GrapherMode = 'surface' | 'curve' | 'bloch'
export const MODES: readonly { id: GrapherMode; name: string }[] = [
  { id: 'surface', name: 'Surface' },
  { id: 'curve', name: 'Curve' },
  { id: 'bloch', name: 'Bloch path' },
]

/** Every typed input, by id. Surface: two variable names, f (solid), g (wire), the x and y ranges. Curve: the
 *  parameter name, x(t), y(t), z(t), the t range. Bloch path: the parameter name, θ(t), φ(t), the t range. */
export const FIELDS = {
  surface: ['sv1', 'sv2', 'f', 'g', 'x0', 'x1', 'y0', 'y1'],
  curve: ['cv', 'cx', 'cy', 'cz', 'ct0', 'ct1'],
  bloch: ['bv', 'bth', 'bph', 'bt0', 'bt1'],
} as const
export type FieldId = (typeof FIELDS)[GrapherMode][number]
export type Texts = Readonly<Record<FieldId, string>>

/** Samples per side of a surface grid, and per curve (the engine caps them at 128 and 1024). */
export const RES = {
  surface: { min: 8, max: 128, initial: 65 },
  curve: { min: 16, max: 1024, initial: 400 },
  bloch: { min: 16, max: 1024, initial: 256 },
} as const
/** The parameter `a` and its slider. */
export const A_MIN = -5
export const A_MAX = 5
export const A_STEP = 0.01
/** A variable name: 1–6 lowercase letters (the tokenizer lowercases names; Greek letters cannot be typed). */
export const VAR_RE = /^[a-z]{1,6}$/
/** Names a variable may not take: the constants, the complex unit, the parameter and every function name. */
export const RESERVED = new Set(['pi', 'e', 'hbar', 'i', 'a', 'sqrt', 'sin', 'cos', 'tan', 'exp', 'ln', 'abs', 'asin', 'acos', 'atan', 'sinh', 'cosh', 'tanh', 'conj', 're', 'im', 'arg'])
const FN_NAMES = ['sqrt', 'sin', 'cos', 'tan', 'exp', 'ln', 'abs', 'asin', 'acos', 'atan', 'sinh', 'cosh', 'tanh']
/** A range narrower than this (relative to its ends) would sample the same number twice: refused. */
export const MIN_SPAN_REL = 1e-6
/** Two layers are "equal" at a sample when |f − g| ≤ EQUAL_REL · max(|f|, |g|, S), S the largest drawn |value| in either
 *  layer (double precision): a float residue of the picture's own size, never an absolute 10⁻¹² (P review item 3). */
export const EQUAL_REL = 1e-12
/** The Bloch path is drawn this far outside the unit sphere so it stays visible over the great circles. */
export const PATH_LIFT = 1.01
/** The default view of graph space (degrees): higher than the lectures' Bloch shot (el 22°), so the top of a surface
 *  reads as its top and less floor shows under its arches (P review item 15). The Babylon scene (grapherScene.ts
 *  GRAPH_EL) and the < 900 px outline use the same numbers (review.test.ts). */
export const GRAPH_SHOT = { az: 30, el: 34 } as const

/* ------------------------------------------------------------------------------------------------ */
/* Reading the inputs                                                                                */
/* ------------------------------------------------------------------------------------------------ */

export type FieldErrorCode = ParseError | 'non-finite' | 'reversed' | 'too-wide' | 'too-narrow' | 'var-shape' | 'var-reserved' | 'var-same'
export interface FieldError {
  /** Caret position in the field's text (0-based). */
  pos: number
  code: FieldErrorCode
  /** A plain sentence. */
  reason: string
}

const PARSE_REASON: Record<Exclude<ParseError, 'unknown-identifier' | 'bad-char' | 'spaced-numbers' | 'bare-argument' | 'name-digit' | 'bare-exponent'>, string> = {
  empty: 'This box is empty: type an expression.',
  'too-long': 'Too long: at most 200 characters.',
  'too-many-tokens': 'Too many pieces (at most 128 numbers, names and signs): write it more simply.',
  'too-deep': 'Too many brackets or functions inside each other (at most 32 levels).',
  syntax: 'Something is missing or out of place here.',
  'unexpected-end': 'The expression stops too early: something is missing at the end.',
}

/** The name at `pos` in `text` (letters, π, ħ), for the unknown-name reason. */
const nameAt = (text: string, pos: number): string => /^[a-zπħ]+/i.exec(text.slice(pos))?.[0] ?? text.slice(pos, pos + 1)

/** `name` split into known names ("xy" → x, y; "ax" → a, x), or null when it cannot be (longest match first). */
export function splitNames(name: string, known: readonly string[]): string[] | null {
  const n = name.length
  const best: (string[] | null)[] = Array.from({ length: n + 1 }, () => null)
  best[n] = []
  for (let i = n - 1; i >= 0; i--) {
    for (const k of [...known].sort((p, q) => q.length - p.length)) {
      if (name.startsWith(k, i) && best[i + k.length]) {
        best[i] = [k, ...best[i + k.length]!]
        break
      }
    }
  }
  return best[0] && best[0].length > 1 ? best[0] : null
}

/**
 * The implicit factor chain that starts at `pos` ("x" in "sin 2x + 1", "pi t" in "sin 2 pi t", "(x+1)" in
 * "sin 2(x+1)"): up to the first + − * / , or unmatched ")" outside brackets (a sign right after ^ belongs to it).
 */
function factorsAt(text: string, pos: number): string {
  let depth = 0
  let k = pos
  for (; k < text.length; k++) {
    const ch = text[k]
    if (ch === '(') depth++
    else if (ch === ')') {
      if (depth === 0) break
      depth--
    } else if (depth === 0 && '*/×·÷,'.includes(ch)) break
    else if (depth === 0 && '+-−'.includes(ch) && !/\^\s*$/.test(text.slice(pos, k))) break
  }
  return text.slice(pos, k).trim()
}

/** A parse failure as a caret and a plain reason (the grapher's words; names listed are the ones allowed here). */
export function parseReason(text: string, pos: number, reason: ParseError, vars: readonly string[], hint?: readonly [string, string]): FieldError {
  if (reason === 'unknown-identifier') {
    const name = nameAt(text, pos).toLowerCase()
    const split = splitNames(name, [...vars, 'a', 'pi', 'e', ...FN_NAMES])
    return {
      pos,
      code: reason,
      reason: split
        ? `“${name}” is not a name. For a product, put a space or * between the names: “${split.join(' ')}”.`
        : vars.length
          ? `Unknown name “${name}”. Here you can use ${vars.join(', ')}, the parameter a, pi and e, and the functions listed below.`
          : `Unknown name “${name}”. Here you can use numbers, pi, e and the functions listed below (sqrt(2) works).`,
    }
  }
  if (reason === 'bad-char') return { pos, code: reason, reason: `The character “${text.slice(pos, pos + 1)}” is not allowed here.` }
  if (reason === 'spaced-numbers') {
    const [a, b] = hint ?? ['the two numbers', '']
    return { pos, code: reason, reason: `Two numbers side by side: put · or * between ${a} and ${b}, or remove the space if they are one number.` }
  }
  if (reason === 'bare-argument') {
    const [fn, arg] = hint ?? ['the function', 'its argument']
    // the argument ends where the implicit factor begins (only whitespace between them)
    const argEnd = text.slice(0, pos).trimEnd().length
    const whole = `${text.slice(argEnd - arg.length, pos)}${factorsAt(text, pos)}`.trim()
    return { pos, code: reason, reason: `A function takes only the next factor, so this is ambiguous: write ${fn}(${whole}) or ${fn}(${arg})·${factorsAt(text, pos)}.` }
  }
  if (reason === 'name-digit') {
    const [name, digits] = hint ?? ['the name', 'the number']
    if (name.toLowerCase() !== 'e') return { pos, code: reason, reason: `A name followed straight by a digit is ambiguous: write ${name}·${digits}, or ${name}^${digits} for a power.` }
    // e then digits: the product, or scientific notation (with the number typed before it, "2 e3", or 1)
    const mantissa = /([0-9]*\.?[0-9]+)\s*$/.exec(text.slice(0, pos - name.length))?.[1] ?? '1'
    return { pos, code: reason, reason: `A name followed straight by a digit is ambiguous: write ${name}·${digits}, or ${mantissa}e${digits} for ${num(Number(`${mantissa}e${digits}`))}.` }
  }
  if (reason === 'bare-exponent') {
    const [base, exp] = hint ?? ['the base^', 'the exponent']
    const rest = factorsAt(text, pos)
    return { pos, code: reason, reason: `A power takes only the next factor, so this is ambiguous: write ${base}(${exp}${rest}) or ${base}${exp}·${rest}.` }
  }
  return { pos, code: reason, reason: PARSE_REASON[reason] }
}

export function readVar(text: string): { ok: true; name: string } | { ok: false; err: FieldError } {
  const t = text.trim()
  if (!VAR_RE.test(t)) {
    const bad = [...text].findIndex((ch) => !/[a-z]/.test(ch))
    return { ok: false, err: { pos: Math.max(0, bad), code: 'var-shape', reason: 'A variable name is 1 to 6 lowercase letters (a to z).' } }
  }
  if (RESERVED.has(t))
    return { ok: false, err: { pos: 0, code: 'var-reserved', reason: `“${t}” is taken: pi, e, hbar, i, the parameter a and the function names cannot be variables.` } }
  return { ok: true, name: t }
}

/** One piece of the input help: words, or an example (in the variables x and y) the parser reads exactly like `reads`,
 *  or refuses with `refused`. */
export type HelpPart = string | { ex: string; reads: string } | { ex: string; refused: ParseError }
/**
 * The help under the inputs, as the page shows it (P review item 1: the old text promised "a space multiplies", but
 * "2 3" read as 23). review.test.ts walks every example through the grapher's parser.
 */
export const HELP: readonly HelpPart[] = [
  'You can type numbers, + − * / ^, pi, e, your variables and the parameter a; sqrt, sin, cos, tan, exp, ln, abs, asin, acos, atan, sinh, cosh, tanh. A space or nothing between factors multiplies: ',
  { ex: '2pi', reads: '2*pi' },
  ', ',
  { ex: '2 x', reads: '2*x' },
  ', ',
  { ex: 'x y', reads: 'x*y' },
  ', ',
  { ex: 'sin x cos y', reads: 'sin(x)*cos(y)' },
  '. Two numbers need * or · between them: ',
  { ex: '2 3', refused: 'spaced-numbers' },
  ' is refused, ',
  { ex: '2·3', reads: '6' },
  ' is 6. A function takes the next factor: ',
  { ex: 'sin x^2', reads: 'sin(x)*sin(x)' },
  ' is ',
  { ex: '(sin x)^2', reads: 'sin(x)*sin(x)' },
  '; write ',
  { ex: 'sin(x^2)', reads: 'sin(x*x)' },
  ' for the other. ',
  { ex: 'sin 2x', refused: 'bare-argument' },
  ' is refused: write ',
  { ex: 'sin(2x)', reads: 'sin(2*x)' },
  ' or ',
  { ex: 'sin(2)·x', reads: 'sin(2)*x' },
  '. So is a power’s bare exponent before a product: ',
  { ex: 'e^2x', refused: 'bare-exponent' },
  ' (write ',
  { ex: 'e^(2x)', reads: 'e^(2*x)' },
  ' or ',
  { ex: 'e^2·x', reads: 'e^2*x' },
  '); a space ends the exponent, so ',
  { ex: 'x^2 y', reads: 'x*x*y' },
  ' is x²·y. A name right before a digit is refused: ',
  { ex: 'x2', refused: 'name-digit' },
  ' (write ',
  { ex: 'x·2', reads: 'x*2' },
  ' or ',
  { ex: 'x^2', reads: 'x*x' },
  '), while ',
  { ex: '2e3', reads: '2000' },
  ' is the number 2000.',
]

/** The Grapher's reading of typed text: the engine's parser in real mode, grapher limits, functions and grammar. */
export const grapherParse = (text: string, vars?: readonly string[]) => parse(text, { mode: 'real', limits: LIMITS.grapher, fns: 'grapher', grammar: 'grapher', vars })

/** An expression in the given variables and the parameter a (the engine's parser, grapher limits and functions). */
export function readExpr(text: string, vars: readonly string[]): { ok: true; ast: Node; usesA: boolean } | { ok: false; err: FieldError } {
  const r = grapherParse(text, [...vars, 'a'])
  if (!r.ok) return { ok: false, err: parseReason(text, r.pos, r.reason, vars, r.hint) }
  return { ok: true, ast: r.ast, usesA: r.vars.includes('a') }
}

/** One end of a range: constants only (numbers, pi, e, the functions), evaluated by the engine. */
export function readEnd(text: string): { ok: true; v: number } | { ok: false; err: FieldError } {
  const r = grapherParse(text)
  if (!r.ok) return { ok: false, err: parseReason(text, r.pos, r.reason, [], r.hint) }
  const v = evalReal(r.ast)
  if (!Number.isFinite(v)) return { ok: false, err: { pos: 0, code: 'non-finite', reason: 'This end is not a finite number.' } }
  return { ok: true, v }
}

/**
 * A sampling range from its two ends: the engine's `checkRange` (finite, ordered, within ±10⁶), and a width the
 * samples can resolve (S-lab §5 item 1: equal ends, or a span below 10⁻⁶ of the ends, would sample one number many
 * times). A range error is reported on the second end.
 */
export function readRange(t0: string, t1: string): { ok: true; r: [number, number] } | { ok: false; which: 0 | 1; err: FieldError } {
  const a = readEnd(t0)
  if (!a.ok) return { ok: false, which: 0, err: a.err }
  const b = readEnd(t1)
  if (!b.ok) return { ok: false, which: 1, err: b.err }
  const r: [number, number] = [a.v, b.v]
  const c = checkRange(r)
  if (c === 'non-finite') return { ok: false, which: 1, err: { pos: 0, code: 'non-finite', reason: 'Both ends must be finite numbers.' } }
  if (c === 'empty') return { ok: false, which: 1, err: { pos: 0, code: 'reversed', reason: 'The end is before the start: swap them.' } }
  if (c === 'too-wide') return { ok: false, which: 1, err: { pos: 0, code: 'too-wide', reason: 'Keep both ends within ±10⁶.' } }
  if (r[1] - r[0] < MIN_SPAN_REL * Math.max(1, Math.abs(r[0]), Math.abs(r[1])))
    return { ok: false, which: 1, err: { pos: 0, code: 'too-narrow', reason: 'The range is too narrow to sample: give it some width.' } }
  return { ok: true, r }
}

export interface SurfaceConfig {
  kind: 'surface'
  vars: [string, string]
  /** null: that layer is off (not sampled). */
  f: Node | null
  g: Node | null
  xr: [number, number]
  yr: [number, number]
  n: number
  usesA: boolean
  key: string
}
export interface CurveConfig {
  kind: 'curve'
  v: string
  xyz: [Node, Node, Node]
  tr: [number, number]
  n: number
  usesA: boolean
  key: string
}
export interface BlochConfig {
  kind: 'bloch'
  v: string
  angles: [Node, Node]
  tr: [number, number]
  n: number
  usesA: boolean
  key: string
}
export type ModeConfig = SurfaceConfig | CurveConfig | BlochConfig
export interface Layers {
  solid: boolean
  wire: boolean
}

/**
 * Read every input of one mode: the per-field errors (caret, reason) and, when everything the picture needs reads
 * correctly, the config to sample. A layer that is off needs no valid expression.
 */
export function readMode(mode: GrapherMode, text: Texts, layers: Layers, n: number): { errors: Partial<Record<FieldId, FieldError>>; config: ModeConfig | null } {
  const errors: Partial<Record<FieldId, FieldError>> = {}
  const key = JSON.stringify([mode, FIELDS[mode].map((f) => text[f]), mode === 'surface' ? layers : null, n])
  const range = (f0: FieldId, f1: FieldId): [number, number] | null => {
    const r = readRange(text[f0], text[f1])
    if (r.ok) return r.r
    errors[r.which === 0 ? f0 : f1] = r.err
    return null
  }
  const expr = (f: FieldId, vars: string[]) => {
    const r = readExpr(text[f], vars)
    if (r.ok) return r
    errors[f] = r.err
    return null
  }
  if (mode === 'surface') {
    const v1 = readVar(text.sv1)
    const v2 = readVar(text.sv2)
    if (!v1.ok) errors.sv1 = v1.err
    if (!v2.ok) errors.sv2 = v2.err
    if (v1.ok && v2.ok && v1.name === v2.name) errors.sv2 = { pos: 0, code: 'var-same', reason: 'The two variables need different names.' }
    const xr = range('x0', 'x1')
    const yr = range('y0', 'y1')
    if (!v1.ok || !v2.ok || errors.sv2) return { errors, config: null }
    const vars: [string, string] = [v1.name, v2.name]
    const f = layers.solid ? expr('f', vars) : null
    const g = layers.wire ? expr('g', vars) : null
    if (!xr || !yr || (layers.solid && !f) || (layers.wire && !g)) return { errors, config: null }
    return { errors, config: { kind: 'surface', vars, f: f?.ast ?? null, g: g?.ast ?? null, xr, yr, n, usesA: !!(f?.usesA || g?.usesA), key } }
  }
  const vf = mode === 'curve' ? 'cv' : 'bv'
  const v = readVar(text[vf])
  if (!v.ok) errors[vf] = v.err
  const tr = mode === 'curve' ? range('ct0', 'ct1') : range('bt0', 'bt1')
  if (!v.ok) return { errors, config: null }
  if (mode === 'curve') {
    const xyz = (['cx', 'cy', 'cz'] as const).map((f) => expr(f, [v.name]))
    if (!tr || xyz.some((e) => !e)) return { errors, config: null }
    const [x, y, z] = xyz as { ast: Node; usesA: boolean }[]
    return { errors, config: { kind: 'curve', v: v.name, xyz: [x.ast, y.ast, z.ast], tr, n, usesA: x.usesA || y.usesA || z.usesA, key } }
  }
  const th = expr('bth', [v.name])
  const ph = expr('bph', [v.name])
  if (!tr || !th || !ph) return { errors, config: null }
  return { errors, config: { kind: 'bloch', v: v.name, angles: [th.ast, ph.ast], tr, n, usesA: th.usesA || ph.usesA, key } }
}

/* ------------------------------------------------------------------------------------------------ */
/* Sampling (the engine's samplers; `a` bound as a number)                                           */
/* ------------------------------------------------------------------------------------------------ */

/** The AST with every `a` replaced by the number `value` (the engine's samplers see a constant). */
export function bindParam(ast: Node, value: number, name = 'a'): Node {
  switch (ast.t) {
    case 'var':
      return ast.name === name ? { t: 'num', v: value } : ast
    case 'neg':
      return { t: 'neg', a: bindParam(ast.a, value, name) }
    case 'bin':
      return { t: 'bin', op: ast.op, a: bindParam(ast.a, value, name), b: bindParam(ast.b, value, name) }
    case 'call':
      return { t: 'call', fn: ast.fn, a: bindParam(ast.a, value, name) }
    default:
      return ast
  }
}
/** The engine's gap rule (expr.ts `gapped`): a value is drawn only when finite and |v| ≤ MAX_SAMPLE_ABS. */
export const gapped = (v: number): number => (Number.isFinite(v) && Math.abs(v) <= MAX_SAMPLE_ABS ? v : NaN)
/** The engine's sample positions (expr.ts `lerpAt`): n evenly spaced points, both ends included. */
export const samplePoints = (r: readonly [number, number], n: number): Float64Array => {
  const out = new Float64Array(n)
  for (let k = 0; k < n; k++) out[k] = n === 1 ? r[0] : r[0] + (r[1] - r[0]) * (k / (n - 1))
  return out
}
/** One value of a (bound) expression at a point, with the gap rule. */
export const valueAt = (ast: Node, env: ReadonlyMap<string, number>): number => gapped(evalReal(ast, env))

export interface LayerStats {
  n: number
  gaps: number
  min: number | null
  max: number | null
}
/**
 * Where the two layers agree and where they cross, over the samples where both are drawn (double precision, P review
 * items 2 and 3): `equal` samples where f = g to EQUAL_REL of the picture's size; `below` samples where f < g; `cross`
 * of `cells` grid cells (four drawn corners) whose corners have f − g of both strict signs, so the layers cross inside
 * them, between samples. A touch without a crossing (f ≥ g with equality on a line) gives cross 0.
 */
export interface TouchStats {
  both: number
  equal: number
  below: number
  cells: number
  cross: number
  min: number | null
  max: number | null
}
export interface SurfaceSample {
  kind: 'surface'
  cfg: SurfaceConfig
  a: number
  n: number
  xs: Float64Array
  ys: Float64Array
  /** The layers in double precision (row-major, out[iy·n + ix]; NaN = gap); null when the layer is off. */
  solid64: Float64Array | null
  wire64: Float64Array | null
  /** The same rounded to single precision: the engine's `sampleGrid` grids, bit for bit. */
  solid: Float32Array | null
  wire: Float32Array | null
  stats: { solid: LayerStats | null; wire: LayerStats | null }
  touch: TouchStats | null
  ms: number
}
export interface CurveSample {
  kind: 'curve'
  cfg: CurveConfig
  a: number
  n: number
  ts: Float64Array
  /** [x₀, y₀, z₀, x₁, …]; a gap in one coordinate is a gap in all three (NaN). */
  pts: Float64Array
  gaps: number
  /** min/max of each coordinate over the drawn samples (null: every sample is a gap). */
  ext: [[number, number], [number, number], [number, number]] | null
  ms: number
}
export interface BlochSample {
  kind: 'bloch'
  cfg: BlochConfig
  a: number
  n: number
  ts: Float64Array
  /** [θ₀, φ₀, θ₁, …] (NaN = gap in both). */
  ang: Float64Array
  /** The engine's Bloch vectors [x₀, y₀, z₀, …] (NaN at gaps). */
  r: Float64Array
  gaps: number
  ms: number
}
export type Sampled = SurfaceSample | CurveSample | BlochSample

const now = () => (typeof performance !== 'undefined' ? performance.now() : Date.now())

function layerStats(grid: Float64Array): LayerStats {
  let gaps = 0
  let min = Infinity
  let max = -Infinity
  for (let k = 0; k < grid.length; k++) {
    const v = grid[k]
    if (Number.isNaN(v)) gaps++
    else {
      if (v < min) min = v
      if (v > max) max = v
    }
  }
  const any = gaps < grid.length
  return { n: grid.length, gaps, min: any ? min : null, max: any ? max : null }
}

/** The largest |value| a layer draws (0 when it draws nothing). */
const sizeOf = (st: LayerStats | null): number => (st && st.min !== null ? Math.max(Math.abs(st.min), Math.abs(st.max!)) : 0)

/**
 * f on the n × n grid in double precision (row-major, out[iy·n + ix]; NaN = gap): the engine's `sampleCurve` along
 * each row, with the row's y bound as a number (the engine's sample positions; the gap rule is the engine's).
 */
function surfaceGrid(ast: Node, vars: [string, string], xr: [number, number], yr: [number, number], n: number): Float64Array {
  const out = new Float64Array(n * n)
  const ys = samplePoints(yr, n)
  for (let iy = 0; iy < n; iy++) out.set(sampleCurve(bindParam(ast, ys[iy], vars[1]), vars[0], xr, n), iy * n)
  return out
}

/** f − g where both layers are drawn (double precision): equal to EQUAL_REL of the picture's size S, below, and the
 *  cells the layers cross (TouchStats). */
export function touchStats(f: Float64Array, g: Float64Array, n: number, S: number): TouchStats {
  const d = new Float64Array(n * n)
  let both = 0
  let equal = 0
  let below = 0
  let min = Infinity
  let max = -Infinity
  for (let k = 0; k < n * n; k++) {
    if (Number.isNaN(f[k]) || Number.isNaN(g[k])) {
      d[k] = NaN
      continue
    }
    both++
    let dk = f[k] - g[k]
    if (Math.abs(dk) <= EQUAL_REL * Math.max(Math.abs(f[k]), Math.abs(g[k]), S)) {
      dk = 0
      equal++
    }
    if (dk < 0) below++
    if (dk < min) min = dk
    if (dk > max) max = dk
    d[k] = dk
  }
  let cells = 0
  let cross = 0
  for (let iy = 0; iy < n - 1; iy++) {
    for (let ix = 0; ix < n - 1; ix++) {
      const k = iy * n + ix
      const [c0, c1, c2, c3] = [d[k], d[k + 1], d[k + n], d[k + n + 1]]
      if (Number.isNaN(c0) || Number.isNaN(c1) || Number.isNaN(c2) || Number.isNaN(c3)) continue
      cells++
      if ((c0 < 0 || c1 < 0 || c2 < 0 || c3 < 0) && (c0 > 0 || c1 > 0 || c2 > 0 || c3 > 0)) cross++
    }
  }
  return { both, equal, below, cells, cross, min: both ? min : null, max: both ? max : null }
}

/** Sample one mode's committed inputs at parameter value `a` (the engine's samplers). Never throws. */
export function sampleOf(cfg: ModeConfig, a: number): Sampled {
  const t0 = now()
  if (cfg.kind === 'surface') {
    const f = cfg.f && bindParam(cfg.f, a)
    const g = cfg.g && bindParam(cfg.g, a)
    const solid64 = f ? surfaceGrid(f, cfg.vars, cfg.xr, cfg.yr, cfg.n) : null
    const wire64 = g ? surfaceGrid(g, cfg.vars, cfg.xr, cfg.yr, cfg.n) : null
    const stats = { solid: solid64 && layerStats(solid64), wire: wire64 && layerStats(wire64) }
    const touch = solid64 && wire64 ? touchStats(solid64, wire64, cfg.n, Math.max(sizeOf(stats.solid), sizeOf(stats.wire))) : null
    return {
      kind: 'surface',
      cfg,
      a,
      n: cfg.n,
      xs: samplePoints(cfg.xr, cfg.n),
      ys: samplePoints(cfg.yr, cfg.n),
      solid64,
      wire64,
      solid: solid64 && Float32Array.from(solid64),
      wire: wire64 && Float32Array.from(wire64),
      stats,
      touch,
      ms: now() - t0,
    }
  }
  if (cfg.kind === 'curve') {
    const pts = sampleParametric(
      cfg.xyz.map((e) => bindParam(e, a)),
      cfg.v,
      cfg.tr,
      cfg.n,
    )
    const n = pts.length / 3
    let gaps = 0
    const lo = [Infinity, Infinity, Infinity]
    const hi = [-Infinity, -Infinity, -Infinity]
    for (let k = 0; k < n; k++) {
      if (Number.isNaN(pts[3 * k])) {
        gaps++
        continue
      }
      for (let j = 0; j < 3; j++) {
        const v = pts[3 * k + j]
        if (v < lo[j]) lo[j] = v
        if (v > hi[j]) hi[j] = v
      }
    }
    const ext = gaps < n ? ([0, 1, 2].map((j) => [lo[j], hi[j]]) as CurveSample['ext']) : null
    return { kind: 'curve', cfg, a, n, ts: samplePoints(cfg.tr, n), pts, gaps, ext, ms: now() - t0 }
  }
  const ang = sampleParametric(
    cfg.angles.map((e) => bindParam(e, a)),
    cfg.v,
    cfg.tr,
    cfg.n,
  )
  const n = ang.length / 2
  const r = new Float64Array(3 * n)
  let gaps = 0
  for (let k = 0; k < n; k++) {
    const th = ang[2 * k]
    if (Number.isNaN(th)) {
      gaps++
      r[3 * k] = r[3 * k + 1] = r[3 * k + 2] = NaN
      continue
    }
    const b = blochVector(ketFromBloch(th, ang[2 * k + 1]))
    r[3 * k] = b[0]
    r[3 * k + 1] = b[1]
    r[3 * k + 2] = b[2]
  }
  return { kind: 'bloch', cfg, a, n, ts: samplePoints(cfg.tr, n), ang, r, gaps, ms: now() - t0 }
}

/* ------------------------------------------------------------------------------------------------ */
/* The picture: fitting to the box, the luminance ramp, the geometry                                 */
/* ------------------------------------------------------------------------------------------------ */

/** box = (value − c)·s per axis: each axis fitted to [−1, 1] separately, or all with one scale ("equal scale"). */
export interface Fit {
  c: Vec3
  s: Vec3
  /** The data extents that were fitted (x, y, height), each [lo, hi]. */
  ext: [[number, number], [number, number], [number, number]]
  equal: boolean
}
export function fitOf(ext: Fit['ext'], equal: boolean): Fit {
  const half = ext.map(([lo, hi]) => (hi - lo) / 2)
  const c = ext.map(([lo, hi]) => (lo + hi) / 2) as Vec3
  const big = Math.max(...half)
  // 1/h stays finite (a subnormal half-range would give Infinity): such an axis is drawn flat
  const inv = (h: number) => (h > 0 && Number.isFinite(1 / h) ? 1 / h : 0)
  const s = half.map((h) => (equal ? inv(big) : inv(h))) as Vec3
  return { c, s, ext, equal }
}
const fitted = (fit: Fit, j: 0 | 1 | 2, v: number) => (v - fit.c[j]) * fit.s[j]

/**
 * The height ramp: luminance only, never hue. CIELAB L* from 50 (lowest) to 88 (highest) with the lecture ramp's
 * neutral tint (a = −0.5, b = −5; stage/tokens.ts hopfRampHex), so it never reaches the state's near-white
 * (L* 96.8) and holds no outcome, state or operator colour. Its dark end keeps 3:1 (WCAG 1.4.11) against the box floor
 * and the Bloch stage (P review item 11; measured in review.test.ts). sRGB components in [0, 1].
 */
export const RAMP_L: readonly [number, number] = [50, 88]
export function rampRgb(u: number): [number, number, number] {
  const L = RAMP_L[0] + (RAMP_L[1] - RAMP_L[0]) * Math.min(1, Math.max(0, Number.isFinite(u) ? u : 0))
  const fy = (L + 16) / 116
  const fx = fy + -0.5 / 500
  const fz = fy - -5 / 200
  const inv = (f: number) => (f ** 3 > 0.008856 ? f ** 3 : (f - 16 / 116) / 7.787)
  const [X, Y, Z] = [0.95047 * inv(fx), inv(fy), 1.08883 * inv(fz)]
  const lin = [3.2406 * X - 1.5372 * Y - 0.4986 * Z, -0.9689 * X + 1.8758 * Y + 0.0415 * Z, 0.0557 * X - 0.204 * Y + 1.057 * Z]
  const enc = (v: number) => (v <= 0.0031308 ? 12.92 * v : 1.055 * v ** (1 / 2.4) - 0.055)
  return lin.map((v) => Math.min(1, Math.max(0, enc(v)))) as [number, number, number]
}
const RAMP_LUT = (() => {
  const t = new Float32Array(256 * 3)
  for (let i = 0; i < 256; i++) t.set(rampRgb(i / 255), 3 * i)
  return t
})()
const rampInto = (out: Float32Array, k: number, u: number) => {
  const i = 3 * Math.round(255 * Math.min(1, Math.max(0, u)))
  out[4 * k] = RAMP_LUT[i]
  out[4 * k + 1] = RAMP_LUT[i + 1]
  out[4 * k + 2] = RAMP_LUT[i + 2]
  out[4 * k + 3] = 1
}

/** Runs of consecutive drawn samples (≥ 2 long: a lone sample between gaps is not a line). */
function runs(n: number, drawn: (k: number) => boolean): [number, number][] {
  const out: [number, number][] = []
  let start = -1
  for (let k = 0; k <= n; k++) {
    const on = k < n && drawn(k)
    if (on && start < 0) start = k
    if (!on && start >= 0) {
      if (k - start >= 2) out.push([start, k])
      start = -1
    }
  }
  return out
}

/** Wire lines of a grid: every `stride`-th row and column (and the last), broken at gaps. */
function gridLines(grid: Float64Array, n: number, bx: Float32Array, by: Float32Array, fit: Fit, stride: number): Float32Array[] {
  const out: Float32Array[] = []
  const pick = (m: number) => {
    const ks: number[] = []
    for (let k = 0; k < m; k += stride) ks.push(k)
    if (ks[ks.length - 1] !== m - 1) ks.push(m - 1)
    return ks
  }
  const line = (count: number, at: (k: number) => number, xy: (k: number) => [number, number]) => {
    for (const [s, e] of runs(count, (k) => !Number.isNaN(grid[at(k)]))) {
      const pts = new Float32Array(3 * (e - s))
      for (let k = s; k < e; k++) {
        const [x, y] = xy(k)
        pts[3 * (k - s)] = x
        pts[3 * (k - s) + 1] = y
        pts[3 * (k - s) + 2] = fitted(fit, 2, grid[at(k)])
      }
      out.push(pts)
    }
  }
  for (const iy of pick(n)) line(n, (ix) => iy * n + ix, (ix) => [bx[ix], by[iy]])
  for (const ix of pick(n)) line(n, (iy) => iy * n + ix, (iy) => [bx[ix], by[iy]])
  return out
}

/** Stride for about 32 wire lines per direction. */
export const wireStride = (n: number): number => Math.max(1, Math.ceil((n - 1) / 32))

export interface Geometry {
  geo: GrapherGeometry
  fit: Fit | null
  /** The height range the surface fit used (both drawn layers), or null. */
  zr: [number, number] | null
}

/** The picture of a sample (positions in box coordinates, physics axes z up). Every number in it is finite. */
export function geometryOf(s: Sampled, equal: boolean, layers: Layers): Geometry {
  if (s.kind === 'surface') {
    const shown = [layers.solid && s.solid ? s.stats.solid : null, layers.wire && s.wire ? s.stats.wire : null].filter((x): x is LayerStats => !!x && x.min !== null)
    const zr: [number, number] | null = shown.length ? [Math.min(...shown.map((x) => x.min!)), Math.max(...shown.map((x) => x.max!))] : null
    const fit = fitOf([s.cfg.xr, s.cfg.yr, zr ?? [0, 0]], equal)
    const bx = Float32Array.from(s.xs, (x) => fitted(fit, 0, x))
    const by = Float32Array.from(s.ys, (y) => fitted(fit, 1, y))
    const n = s.n
    let surface: GrapherGeometry['surface'] = null
    if (layers.solid && s.solid64) {
      // heights fitted in double precision, then stored single (a 10⁻⁵⁰ layer is fitted, not flushed to 0)
      const grid = s.solid64
      const positions = new Float32Array(3 * n * n)
      const colors = new Float32Array(4 * n * n)
      const span = zr ? zr[1] - zr[0] : 0
      for (let iy = 0; iy < n; iy++) {
        for (let ix = 0; ix < n; ix++) {
          const k = iy * n + ix
          const v = grid[k]
          const gap = Number.isNaN(v)
          positions[3 * k] = bx[ix]
          positions[3 * k + 1] = by[iy]
          // a gap's vertex is a finite placeholder that no triangle uses
          positions[3 * k + 2] = gap ? 0 : fitted(fit, 2, v)
          rampInto(colors, k, gap || !zr ? 0 : span > 0 ? (v - zr[0]) / span : 0.5)
        }
      }
      const idx = new Uint32Array(6 * (n - 1) * (n - 1))
      let m = 0
      const ok = (k: number) => !Number.isNaN(grid[k])
      for (let iy = 0; iy < n - 1; iy++) {
        for (let ix = 0; ix < n - 1; ix++) {
          const k00 = iy * n + ix
          const k10 = k00 + 1
          const k01 = k00 + n
          const k11 = k01 + 1
          if (ok(k00) && ok(k10) && ok(k11)) {
            idx[m++] = k00
            idx[m++] = k10
            idx[m++] = k11
          }
          if (ok(k00) && ok(k11) && ok(k01)) {
            idx[m++] = k00
            idx[m++] = k11
            idx[m++] = k01
          }
        }
      }
      surface = { positions, colors, indices: idx.slice(0, m) }
    }
    const wire = layers.wire && s.wire64 ? gridLines(s.wire64, n, bx, by, fit, wireStride(n)) : []
    return { geo: { space: 'graph', box: boxOf(fit), surface, wire, path: [] }, fit, zr }
  }
  if (s.kind === 'curve') {
    const fit = fitOf(s.ext ?? [[0, 0], [0, 0], [0, 0]], equal)
    const path = pathPieces(s.n, s.pts, (k, j) => fitted(fit, j, s.pts[3 * k + j]))
    return { geo: { space: 'graph', box: boxOf(fit), surface: null, wire: [], path }, fit, zr: null }
  }
  const path = pathPieces(s.n, s.r, (k, j) => s.r[3 * k + j] * PATH_LIFT)
  return { geo: { space: 'bloch', box: null, surface: null, wire: [], path }, fit: null, zr: null }
}

function boxOf(fit: Fit): { min: Vec3; max: Vec3 } {
  return {
    min: [0, 1, 2].map((j) => fitted(fit, j as 0 | 1 | 2, fit.ext[j][0])) as Vec3,
    max: [0, 1, 2].map((j) => fitted(fit, j as 0 | 1 | 2, fit.ext[j][1])) as Vec3,
  }
}

/** A sampled path as pieces of consecutive drawn samples, shaded by t: dark at the start, light at the end. */
function pathPieces(n: number, pts: Float64Array, at: (k: number, j: 0 | 1 | 2) => number): { points: Float32Array; colors: Float32Array }[] {
  return runs(n, (k) => !Number.isNaN(pts[3 * k])).map(([s, e]) => {
    const points = new Float32Array(3 * (e - s))
    const colors = new Float32Array(4 * (e - s))
    for (let k = s; k < e; k++) {
      for (let j = 0; j < 3; j++) points[3 * (k - s) + j] = at(k, j as 0 | 1 | 2)
      rampInto(colors, k - s, n > 1 ? k / (n - 1) : 0)
    }
    return { points, colors }
  })
}

/* ------------------------------------------------------------------------------------------------ */
/* The cursor                                                                                        */
/* ------------------------------------------------------------------------------------------------ */

/** The cursor: surface (u, v) ∈ [0, 1]² along the x and y ranges; curve and Bloch path u ∈ [0, 1] along t. */
export interface Cursors {
  surface: [number, number]
  curve: number
  bloch: number
}
const clamp01 = (u: number) => (Number.isFinite(u) ? Math.min(1, Math.max(0, u)) : 0)
/** A range's point at fraction u, the engine's formula (u = k/(n − 1) gives exactly the k-th sample). */
export const along = (r: readonly [number, number], u: number): number => r[0] + (r[1] - r[0]) * u

export interface SurfaceCursor {
  kind: 'surface'
  x: number
  y: number
  /** f and g at the cursor (NaN = a gap there; null = that layer is off). */
  f: number | null
  g: number | null
}
export interface CurveCursor {
  kind: 'curve'
  t: number
  p: Vec3 | null
}
export interface BlochCursor {
  kind: 'bloch'
  t: number
  theta: number
  phi: number
  /** null at a gap (θ or φ not drawn there). */
  r: Vec3 | null
  pz: number | null
  px: number | null
}
export type Cursor = SurfaceCursor | CurveCursor | BlochCursor

/** The values at the cursor, evaluated exactly (engine `evalReal` on the bound expressions, the gap rule). */
export function cursorOf(s: Sampled, c: Cursors): Cursor {
  if (s.kind === 'surface') {
    const [u, v] = c.surface
    const x = along(s.cfg.xr, clamp01(u))
    const y = along(s.cfg.yr, clamp01(v))
    const env = new Map([
      [s.cfg.vars[0], x],
      [s.cfg.vars[1], y],
    ])
    const f = s.cfg.f ? valueAt(bindParam(s.cfg.f, s.a), env) : null
    const g = s.cfg.g ? valueAt(bindParam(s.cfg.g, s.a), env) : null
    return { kind: 'surface', x, y, f, g }
  }
  const u = clamp01(s.kind === 'curve' ? c.curve : c.bloch)
  const t = along(s.cfg.tr, u)
  const env = new Map([[s.cfg.v, t]])
  if (s.kind === 'curve') {
    const p = s.cfg.xyz.map((e) => valueAt(bindParam(e, s.a), env)) as Vec3
    return { kind: 'curve', t, p: p.some(Number.isNaN) ? null : p }
  }
  const theta = valueAt(bindParam(s.cfg.angles[0], s.a), env)
  const phi = valueAt(bindParam(s.cfg.angles[1], s.a), env)
  if (Number.isNaN(theta) || Number.isNaN(phi)) return { kind: 'bloch', t, theta, phi, r: null, pz: null, px: null }
  const ket = ketFromBloch(theta, phi)
  return { kind: 'bloch', t, theta, phi, r: blochVector(ket), pz: prob(KET['+z'], ket), px: prob(KET['+x'], ket) }
}

/** Nearest drawn sample (index) to a point, for dragging the cursor along a curve or a Bloch path. */
function nearestSample(n: number, pts: Float64Array, at: (k: number, j: 0 | 1 | 2) => number, p: Vec3): number | null {
  let best = -1
  let bd = Infinity
  for (let k = 0; k < n; k++) {
    if (Number.isNaN(pts[3 * k])) continue
    const d = (at(k, 0) - p[0]) ** 2 + (at(k, 1) - p[1]) ** 2 + (at(k, 2) - p[2]) ** 2
    if (d < bd) {
      bd = d
      best = k
    }
  }
  return best < 0 ? null : best
}

/**
 * A drag point (box coordinates, or on the Bloch sphere) → the cursor. Surface: the point on the cursor's horizontal
 * plane, turned back into (x, y) through the fit. Curve and Bloch path: the nearest drawn sample (the cursor sits on a
 * sample, u = k/(n − 1)). Null when nothing can be picked (every sample a gap).
 */
export function cursorFromPoint(s: Sampled, g: Geometry, p: Vec3): number | [number, number] | null {
  if (!p.every(Number.isFinite)) return null
  if (s.kind === 'surface') {
    const fit = g.fit!
    const x = fit.c[0] + (fit.s[0] > 0 ? p[0] / fit.s[0] : 0)
    const y = fit.c[1] + (fit.s[1] > 0 ? p[1] / fit.s[1] : 0)
    return [clamp01((x - s.cfg.xr[0]) / (s.cfg.xr[1] - s.cfg.xr[0])), clamp01((y - s.cfg.yr[0]) / (s.cfg.yr[1] - s.cfg.yr[0]))]
  }
  if (s.kind === 'curve') {
    const fit = g.fit!
    const k = nearestSample(s.n, s.pts, (i, j) => fitted(fit, j, s.pts[3 * i + j]), p)
    return k === null ? null : s.n > 1 ? k / (s.n - 1) : 0
  }
  const k = nearestSample(s.n, s.r, (i, j) => s.r[3 * i + j], p)
  return k === null ? null : s.n > 1 ? k / (s.n - 1) : 0
}

/** A keyboard step of the cursor: one sample (Shift: a tenth of one), snapped to the sample grid when not fine. */
export function stepCursor(u: number, dir: 1 | -1, fine: boolean, n: number): number {
  const m = Math.max(1, n - 1)
  if (fine) return clamp01(u + dir / (10 * m))
  const k = Math.round(u * m)
  const onGrid = Math.abs(u * m - k) < 1e-9
  const next = onGrid ? k + dir : dir > 0 ? Math.ceil(u * m) : Math.floor(u * m)
  return clamp01(Math.min(m, Math.max(0, next)) / m)
}

/* ------------------------------------------------------------------------------------------------ */
/* Readouts, the view, the twin                                                                      */
/* ------------------------------------------------------------------------------------------------ */

export type Tone = 'text' | 'state' | 'silver'
export interface Readout {
  key: string
  text: string
  tone: Tone
}

/** A value for a readout: 4 significant figures, a real minus. */
export const num = (x: number): string => sig(x, 4)
/** A vector's components: residues below 10⁻¹² of its size print as 0 (a float residue, not a digit). */
export const vecText = (v: readonly number[]): string => {
  const big = Math.max(1e-300, ...v.map(Math.abs))
  return `(${v.map((x) => num(Math.abs(x) < 1e-12 * big ? 0 : x)).join(', ')})`
}
/**
 * A probability: 3 decimals, trailing zeros dropped, with its relation ("= 0.5", "= 0.854", "= 1"). A value that
 * rounds to 0 or 1 but is not one is "< 0.001" or "> 0.999" (P review item 4: 4·10⁻⁴ is not 0); a float residue
 * (≤ 10⁻¹² from 0 or 1: cos²(π/2) = 3.7·10⁻³³) is the exact end.
 */
export const probText = (p: number): string => {
  if (p <= 1e-12) return '= 0'
  if (p >= 1 - 1e-12) return '= 1'
  const r = Math.round(p * 1000) / 1000
  return r === 0 ? '< 0.001' : r === 1 ? '> 0.999' : `= ${r}`
}
/** An angle in radians with its degrees: "1.571 rad (90°)". */
export const angleText = (rad: number): string => `${num(rad)} rad (${num((rad * 180) / Math.PI)}°)`
/** The height's name on the axis and in readouts: f, g or "f, g" (the layers drawn). */
export const heightName = (layers: Layers, cfg: SurfaceConfig) => [layers.solid && cfg.f ? 'f' : null, layers.wire && cfg.g ? 'g' : null].filter(Boolean).join(', ')
/** A float residue below 10⁻¹² of `big` is 0 (labels.ts's rule for ranges; the readouts' for values). */
const unresidue = (x: number, big: number): number => (Math.abs(x) < 1e-12 * big ? 0 : x)
/** A value in a range readout, residue rule applied. */
export const rangeValue = (x: number, big: number): string => num(unresidue(x, big))
/**
 * A sampled range in words (P review item 7): min and max over the SAMPLES (not the function's extremes between them),
 * with the residue rule relative to the larger end (sin t on [π, 2π] reads "to 0", not "to 1.225e-16").
 */
export function rangeText(name: string, lo: number, hi: number): string {
  const big = Math.max(Math.abs(lo), Math.abs(hi))
  const [a, b] = [unresidue(lo, big), unresidue(hi, big)]
  return a === b ? `${name} is constant: ${num(a)}` : `${name} from ${num(a)} to ${num(b)} (sampled)`
}
/** The scale chip (short: it sits on the stage above the box, P review item 16). */
export const scaleText = (equal: boolean): string => (equal ? 'one scale on all axes' : 'axes scaled separately')
/** Within this of a pole the Bloch point IS the pole (float residue), and φ has no effect (P review item 5). */
export const POLE_TOL = 1e-12
const deg = (rad: number) => (rad * 180) / Math.PI

/**
 * The readouts. `compare`: the layer comparison (where f = g, where the layers cross, where f < g) is shown only once
 * the student opens it (P review item 9: the Try this must not answer itself before the student acts).
 */
export function readoutsOf(s: Sampled, _g: Geometry, cur: Cursor, layers: Layers, equal: boolean, compare = true): Readout[] {
  const R: Readout[] = []
  const add = (key: string, text: string, tone: Tone = 'text') => R.push({ key, text, tone })
  const scale = () => add('scale', scaleText(equal), 'silver')
  if (s.kind === 'surface' && cur.kind === 'surface') {
    const [vx, vy] = s.cfg.vars
    add('cursor', `${vx} = ${num(cur.x)}, ${vy} = ${num(cur.y)}`)
    const layer = (name: 'f' | 'g', val: number | null, st: LayerStats | null, on: boolean, what: string) => {
      if (val === null || !st || !on) return
      // a float residue (cos(π/2)/4 = 1.5e-17) is 0 on the page: below 10⁻¹² of the layer's largest size
      const big = Math.max(Math.abs(st.min ?? 0), Math.abs(st.max ?? 0))
      add(name, Number.isNaN(val) ? `${name}: a gap here (${what})` : `${name} = ${rangeValue(val, big)} (${what})`)
      add(`${name}-range`, st.min === null ? `${name}: every sample is a gap` : rangeText(name, st.min, st.max!))
    }
    layer('f', cur.f, s.stats.solid, layers.solid, 'solid')
    layer('g', cur.g, s.stats.wire, layers.wire, 'wire')
    if (compare && layers.solid && layers.wire && s.touch) {
      const t = s.touch
      if (t.both === 0) add('touch', 'f and g: no sample where both are drawn')
      else {
        // short lines: the stage's readout column sits beside the box (P review item 16); the gaps line gives the total
        add('touch', `f = g exactly at ${t.equal === 0 ? 'no sample' : t.equal === 1 ? '1 sample' : `${t.equal} samples`}`)
        add('cross', `the layers cross in ${t.cross === 0 ? 'no cell' : t.cross === 1 ? '1 cell' : `${t.cross} cells`}`)
        add('below', `f < g at ${t.below === 0 ? 'no sample' : t.below === 1 ? '1 sample' : `${t.below} samples`}`)
      }
    }
    const total = s.n * s.n
    const gaps = [layers.solid && s.stats.solid ? `f ${s.stats.solid.gaps}` : null, layers.wire && s.stats.wire ? `g ${s.stats.wire.gaps}` : null].filter(Boolean)
    if (gaps.length) add('gaps', `gaps: ${gaps.join(', ')} of ${total} samples`)
    else add('gaps', 'no layer is shown')
    scale()
    if (s.cfg.usesA) add('a', `a = ${num(s.a)}`)
    return R
  }
  if (s.kind === 'curve' && cur.kind === 'curve') {
    const v = s.cfg.v
    add('cursor', `${v} = ${num(cur.t)}`)
    add('point', cur.p ? `(x, y, z) = ${vecText(cur.p)}` : `a gap at this ${v}: a coordinate is not drawn here`)
    const names = ['x', 'y', 'z']
    if (s.ext) s.ext.forEach(([lo, hi], j) => add(`${names[j]}-range`, rangeText(`${names[j]}(${v})`, lo, hi)))
    else add('empty', 'every sample is a gap: nothing to draw')
    add('gaps', `gaps: ${s.gaps} of ${s.n} samples`)
    scale()
    if (s.cfg.usesA) add('a', `a = ${num(s.a)}`)
    return R
  }
  if (s.kind === 'bloch' && cur.kind === 'bloch') {
    const v = s.cfg.v
    add('cursor', `${v} = ${num(cur.t)}`)
    if (!cur.r) add('state', `a gap at this ${v}: θ or φ is not drawn here`)
    else {
      add('theta', `θ = ${angleText(cur.theta)}`)
      add('phi', `φ = ${angleText(cur.phi)}`)
      add('r', `r = ${vecText(cur.r)}`, 'state')
      // θ outside 0…π still gives a state, but the point's own angles are then not (θ, φ): say them (P review item 5),
      // with a float tolerance (θ = t/13 at t = 13π is π + 4e-16, inside); at a pole φ has no effect
      const [rx, ry, rz] = cur.r
      const own = deg(Math.acos(Math.max(-1, Math.min(1, rz))))
      const atPole = Math.hypot(rx, ry) < POLE_TOL
      const pole = rz > 0 ? '|+z⟩' : '|−z⟩'
      if (cur.theta < -POLE_TOL || cur.theta > Math.PI + POLE_TOL) {
        const az = (deg(Math.atan2(ry, rx)) + 360) % 360
        add(
          'polar',
          atPole
            ? `θ is outside 0…180°: the point is the pole ${pole} (polar angle ${num(own)}°), where φ has no effect`
            : `θ is outside 0…180°: the point’s own angles are θ = ${num(own)}°, φ = ${num(Math.abs(az - 360) < 1e-9 ? 0 : az)}°`,
          'silver',
        )
      } else if (atPole) add('polar', `pole ${pole}: φ has no effect`, 'silver')
      add('pz', `P(+z) ${probText(cur.pz!)}`)
      add('px', `P(+x) ${probText(cur.px!)}`)
    }
    add('gaps', `gaps: ${s.gaps} of ${s.n} samples`)
    if (s.cfg.usesA) add('a', `a = ${num(s.a)}`)
    return R
  }
  return R
}

/** The stage caption: what the shade means and what to drag. */
export function captionOf(g: Geometry, s: Sampled, layers: Layers): string {
  if (g.geo.space === 'bloch') return 'Shade along the path is t (dark at the start). The near-white bead is the state at the cursor: drag it along the path, or drag elsewhere to orbit.'
  // "shade is height" only where there is shade: the wire layer is one tone (P review item 13)
  if (s.kind === 'surface' && g.geo.surface) return 'Shade is height: darker is lower. Drag the silver ring to move the cursor, or drag elsewhere to orbit.'
  if (s.kind === 'surface' && layers.wire) return 'The wire layer is one tone (only the solid layer is shaded by height). Drag the silver ring to move the cursor, or drag elsewhere to orbit.'
  if (s.kind === 'surface') return 'No layer is shown: tick the solid or the wire layer. Drag elsewhere to orbit.'
  return 'Shade is t: dark at the start. Drag the silver ring along the curve, or drag elsewhere to orbit.'
}

/** The cursor's place in the picture, and the surface its drag handle moves on. */
export function cursorView(s: Sampled, g: Geometry, cur: Cursor, layers: Layers): Pick<GrapherLabView, 'cursor' | 'drag'> {
  if (s.kind === 'surface' && cur.kind === 'surface' && g.fit) {
    const fit = g.fit
    const x = fitted(fit, 0, cur.x)
    const y = fitted(fit, 1, cur.y)
    const floor = g.geo.box!.min[2]
    // the cursor sits on the solid layer (the wire's when the solid is off); at a gap it rests on the floor
    const h = layers.solid && cur.f !== null ? cur.f : layers.wire && cur.g !== null ? cur.g : NaN
    const z = Number.isNaN(h) ? floor : fitted(fit, 2, h)
    const at: Vec3 = [x, y, z]
    return { cursor: { at, floor: [x, y, floor], state: false }, drag: { kind: 'plane', point: at, normal: [0, 0, 1] } }
  }
  if (s.kind === 'curve' && cur.kind === 'curve' && g.fit) {
    const fit = g.fit
    const at = cur.p ? (cur.p.map((v, j) => fitted(fit, j as 0 | 1 | 2, v)) as Vec3) : null
    return { cursor: { at, floor: null, state: false }, drag: at ? { kind: 'screen' } : null }
  }
  if (cur.kind === 'bloch' && cur.r) return { cursor: { at: cur.r, floor: null, state: true }, drag: { kind: 'sphere', center: [0, 0, 0], radius: 1 } }
  return { cursor: { at: null, floor: null, state: s.kind === 'bloch' }, drag: null }
}

/** The cursor twin's value in words (engine values, like the readouts). */
export function twinText(s: Sampled, cur: Cursor): string {
  if (cur.kind === 'surface' && s.kind === 'surface') return `${s.cfg.vars[0]} = ${num(cur.x)}, ${s.cfg.vars[1]} = ${num(cur.y)}`
  if (cur.kind === 'curve' && s.kind === 'curve') return `${s.cfg.v} = ${num(cur.t)}`
  if (cur.kind === 'bloch' && s.kind === 'bloch') return `${s.cfg.v} = ${num(cur.t)}`
  return ''
}

/** Every number of the view is finite (the vertex-buffer rule; S-lab §5 item 2). */
export function viewFinite(v: GrapherLabView): boolean {
  const all = (a: ArrayLike<number>) => {
    for (let i = 0; i < a.length; i++) if (!Number.isFinite(a[i])) return false
    return true
  }
  const g = v.geometry
  if (g.surface && (!all(g.surface.positions) || !all(g.surface.colors))) return false
  if (g.surface && g.surface.indices.some((i) => i >= g.surface!.positions.length / 3)) return false
  if (g.box && !(all(g.box.min) && all(g.box.max))) return false
  if (!g.wire.every(all)) return false
  if (!g.path.every((p) => all(p.points) && all(p.colors))) return false
  if (v.cursor.at && !all(v.cursor.at)) return false
  if (v.cursor.floor && !all(v.cursor.floor)) return false
  return true
}

/* ------------------------------------------------------------------------------------------------ */
/* Presets (the allowlist) and the Try this                                                          */
/* ------------------------------------------------------------------------------------------------ */

export interface GrapherSetup {
  mode: GrapherMode
  /** What this preset is (shown under the title when it arrives by a deep link). */
  note: string
  texts: Partial<Record<FieldId, string>>
  res?: number
  a?: number
  layers?: Layers
  equal?: boolean
  /** Show the layer comparison (f = g, crossings, f < g) at once; false for a question the comparison would answer. */
  compare?: boolean
  cursor?: number | [number, number]
}

/** The ΔSx·ΔSy surface and its bound (D-lab §2.4 "Try this"): x = θ, y = φ, ħ = 1. */
export const UNCERTAINTY_F = 'sqrt((1-(sin x cos y)^2)(1-(sin x sin y)^2))/4'
export const UNCERTAINTY_G = 'abs(cos x)/4'

/**
 * Deep-link presets (`#/lab/grapher?preset=<id>`, decisions/lab.md ruling 7): a frozen null-prototype table; the id
 * names texts the page types for the student, never state from the URL.
 */
export const SETUPS = presetTable<GrapherSetup>({
  uncertainty: {
    mode: 'surface',
    note: 'Solid: ΔSx·ΔSy of the state at polar angle x and azimuth y. Wire: the bound ½|⟨Sz⟩|. Units of ħ² with ħ = 1 (Lecture 7).',
    texts: { sv1: 'x', sv2: 'y', f: UNCERTAINTY_F, g: UNCERTAINTY_G, x0: '0', x1: 'pi', y0: '0', y1: '2pi' },
    res: 65,
    a: 0,
    layers: { solid: true, wire: true },
    equal: false,
    // the Try this asks where the layers touch: the comparison waits until the student opens it (P review item 9)
    compare: false,
    cursor: [0.25, 0.125],
  },
  saddle: {
    mode: 'surface',
    note: 'A saddle x² − y² (solid) and the level plane at height a (wire): they meet where x² − y² = a. Slide a.',
    texts: { sv1: 'x', sv2: 'y', f: 'x^2 - y^2', g: 'a', x0: '-1', x1: '1', y0: '-1', y1: '1' },
    res: 49,
    a: 0.5,
    layers: { solid: true, wire: true },
    equal: true,
    compare: true,
    cursor: [0.5, 0.5],
  },
  helix: {
    mode: 'curve',
    note: 'A helix: one turn per 2π of t, rising a/(2π) per unit of t.',
    texts: { cv: 't', cx: 'cos t', cy: 'sin t', cz: 'a t/(2pi)', ct0: '0', ct1: '4pi' },
    res: 400,
    a: 1,
    equal: true,
    cursor: 0.25,
  },
  born: {
    mode: 'curve',
    note: 'P(+z) = cos²(t/2) for a state tilted by t from +z, drawn as a curve in the x–z plane (Lecture 1).',
    texts: { cv: 't', cx: 't', cy: '0', cz: 'cos(t/2)^2', ct0: '0', ct1: '2pi' },
    // 201 samples put one at t = π exactly, where P(+z) = 0 (P review item 7; 200 missed it: "from 0.00006231")
    res: 201,
    a: 0,
    equal: false,
    cursor: 0.25,
  },
  equator: {
    mode: 'bloch',
    note: 'A great circle: the equator, θ = π/2 and φ = t, through |+x⟩, |+y⟩, |−x⟩ and |−y⟩ (Lecture 6).',
    texts: { bv: 't', bth: 'pi/2', bph: 't', bt0: '0', bt1: '2pi' },
    res: 256,
    a: 0,
    cursor: 0.25,
  },
  spiral: {
    mode: 'bloch',
    note: 'A spiral from |+z⟩ to |−z⟩: θ = t while φ turns a times as fast.',
    texts: { bv: 't', bth: 't', bph: 'a t', bt0: '0', bt1: 'pi' },
    res: 512,
    a: 6,
    cursor: 0.5,
  },
})
export type GrapherSetupId = string

/** The preset the bench opens on (D's Try this). */
export const DEFAULT_SETUP = 'uncertainty'

/** A deep link's note, shown only while the inputs are still that preset's (P review item 8: after ?preset=uncertainty
 *  and a click on Helix, the uncertainty note sat above a helix). */
export const presetNote = (fromUrl: string | null, current: string | null): string | undefined =>
  fromUrl && current === fromUrl && Object.hasOwn(SETUPS, fromUrl) ? SETUPS[fromUrl].note : undefined

export const TRY_THIS =
  'Solid: $\\Delta S_x\\,\\Delta S_y$ of the state at polar angle $x = \\theta$ and azimuth $y = \\varphi$. Wire: the bound $\\tfrac12|\\langle S_z\\rangle|$ ($\\hbar = 1$). Where do the two surfaces touch, and does the solid ever dip below the wire?'

/**
 * What the engine finds for the Try this (checked in model.test.ts against the engine on the preset's 65 × 65 grid and
 * at random points): the layers are equal exactly where sin x cos y = 0 or sin x sin y = 0, because
 * (1 − rx²)(1 − ry²) − rz² = rx² ry² for a unit Bloch vector; everywhere else the solid is above the wire.
 */
export const TRY_THIS_ANSWER =
  'They touch along the edges $x = 0$ and $x = \\pi$ (the poles) and along $y = 0, \\pi/2, \\pi, 3\\pi/2$ and $2\\pi$: four whole meridians, since $y = 0$ and $y = 2\\pi$ are one. On the 65 × 65 grid that is 445 samples; at every other sample the solid is above the wire, and the layers never cross. The uncertainty relation only promises $\\ge$: here $(\\Delta S_x \\Delta S_y)^2 - \\tfrac14\\langle S_z\\rangle^2 = r_x^2 r_y^2/16$, so the bound is saturated exactly where $r_x r_y = 0$, on the $xz$ and $yz$ great circles, and strict everywhere else. Both are 0 only where those meridians cross the equator $x = \\pi/2$: the states $|{\\pm x}\\rangle$ and $|{\\pm y}\\rangle$.'
