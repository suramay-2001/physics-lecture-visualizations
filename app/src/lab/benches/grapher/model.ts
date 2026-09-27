/**
 * The Grapher's model (D-lab §2.4; decisions/lab.md; S-lab §5). PURE: typed texts in, the picture and every readout
 * out. Every number comes from the engine (app/src/physics): `parse` (real mode, LIMITS.grapher, the grapher function
 * set), `evalReal`, `sampleGrid` (≤ 128²), `sampleParametric` (≤ 1024; a gap in one coordinate is a gap in all),
 * `checkRange`, MAX_SAMPLE_ABS (the gap rule), and for the Bloch path `ketFromBloch`, `blochVector`, `prob`, KET.
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
import { checkRange, evalReal, LIMITS, MAX_SAMPLE_ABS, parse, sampleGrid, sampleParametric, type Node, type ParseError } from '../../../physics/expr'
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
/** Two layers are "equal" at a sample when they agree to this relative precision (compared in double precision). */
export const EQUAL_REL = 1e-12
/** The Bloch path is drawn this far outside the unit sphere so it stays visible over the great circles. */
export const PATH_LIFT = 1.01

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

const PARSE_REASON: Record<Exclude<ParseError, 'unknown-identifier' | 'bad-char'>, string> = {
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

/** A parse failure as a caret and a plain reason (the grapher's words; names listed are the ones allowed here). */
export function parseReason(text: string, pos: number, reason: ParseError, vars: readonly string[]): FieldError {
  if (reason === 'unknown-identifier') {
    const name = nameAt(text, pos).toLowerCase()
    const split = splitNames(name, [...vars, 'a', 'pi', 'e', ...FN_NAMES])
    const allowed = vars.length ? `${vars.join(', ')}, the parameter a, pi and e` : 'numbers, pi and e'
    return {
      pos,
      code: reason,
      reason: split
        ? `“${name}” is not a name. For a product, put a space or * between the names: “${split.join(' ')}”.`
        : `Unknown name “${name}”. Here you can use ${allowed}${vars.length ? ', and the functions listed below' : ''}.`,
    }
  }
  if (reason === 'bad-char') return { pos, code: reason, reason: `The character “${text.slice(pos, pos + 1)}” is not allowed here.` }
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

/** An expression in the given variables and the parameter a (the engine's parser, grapher limits and functions). */
export function readExpr(text: string, vars: readonly string[]): { ok: true; ast: Node; usesA: boolean } | { ok: false; err: FieldError } {
  const r = parse(text, { mode: 'real', limits: LIMITS.grapher, fns: 'grapher', vars: [...vars, 'a'] })
  if (!r.ok) return { ok: false, err: parseReason(text, r.pos, r.reason, vars) }
  return { ok: true, ast: r.ast, usesA: r.vars.includes('a') }
}

/** One end of a range: constants only (numbers, pi, e, the functions), evaluated by the engine. */
export function readEnd(text: string): { ok: true; v: number } | { ok: false; err: FieldError } {
  const r = parse(text, { mode: 'real', limits: LIMITS.grapher, fns: 'grapher' })
  if (!r.ok) return { ok: false, err: parseReason(text, r.pos, r.reason, []) }
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
/** Where the two layers agree: over the samples where both are drawn (compared in double precision). */
export interface TouchStats {
  both: number
  equal: number
  below: number
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
  /** The engine's grids (row-major, out[iy·n + ix]; NaN = gap); null when the layer is off. */
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

function layerStats(grid: Float32Array): LayerStats {
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

/**
 * f − g at every sample where both layers are drawn. The grids are single precision; wherever the two values are
 * within 10⁻⁶ of each other the pair is evaluated again in double precision (`evalReal`), so a touch is counted only
 * where the two expressions really agree (to EQUAL_REL), and the sign of a tiny difference is the true one.
 */
function touchStats(s: { xs: Float64Array; ys: Float64Array; n: number; solid: Float32Array; wire: Float32Array; f: Node; g: Node; vars: [string, string] }): TouchStats {
  const env = new Map<string, number>()
  let both = 0
  let equal = 0
  let below = 0
  let min = Infinity
  let max = -Infinity
  for (let iy = 0; iy < s.n; iy++) {
    for (let ix = 0; ix < s.n; ix++) {
      const k = iy * s.n + ix
      const f32 = s.solid[k]
      const g32 = s.wire[k]
      if (Number.isNaN(f32) || Number.isNaN(g32)) continue
      both++
      let d = f32 - g32
      if (Math.abs(d) <= 1e-6 * Math.max(1, Math.abs(f32), Math.abs(g32))) {
        env.set(s.vars[0], s.xs[ix])
        env.set(s.vars[1], s.ys[iy])
        const f = valueAt(s.f, env)
        const g = valueAt(s.g, env)
        d = f - g
        if (Math.abs(d) <= EQUAL_REL * Math.max(1, Math.abs(f), Math.abs(g))) {
          d = 0
          equal++
        }
      }
      if (d < 0) below++
      if (d < min) min = d
      if (d > max) max = d
    }
  }
  return { both, equal, below, min: both ? min : null, max: both ? max : null }
}

/** Sample one mode's committed inputs at parameter value `a` (the engine's samplers). Never throws. */
export function sampleOf(cfg: ModeConfig, a: number): Sampled {
  const t0 = now()
  if (cfg.kind === 'surface') {
    const f = cfg.f && bindParam(cfg.f, a)
    const g = cfg.g && bindParam(cfg.g, a)
    const solid = f ? sampleGrid(f, cfg.vars, cfg.xr, cfg.yr, cfg.n, cfg.n) : null
    const wire = g ? sampleGrid(g, cfg.vars, cfg.xr, cfg.yr, cfg.n, cfg.n) : null
    const xs = samplePoints(cfg.xr, cfg.n)
    const ys = samplePoints(cfg.yr, cfg.n)
    const touch = solid && wire && f && g ? touchStats({ xs, ys, n: cfg.n, solid, wire, f, g, vars: cfg.vars }) : null
    return {
      kind: 'surface',
      cfg,
      a,
      n: cfg.n,
      xs,
      ys,
      solid,
      wire,
      stats: { solid: solid && layerStats(solid), wire: wire && layerStats(wire) },
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
  const s = half.map((h) => (equal ? (big > 0 ? 1 / big : 0) : h > 0 ? 1 / h : 0)) as Vec3
  return { c, s, ext, equal }
}
const fitted = (fit: Fit, j: 0 | 1 | 2, v: number) => (v - fit.c[j]) * fit.s[j]

/**
 * The height ramp: luminance only, never hue. CIELAB L* from 36 (lowest) to 84 (highest) with the lecture ramp's
 * neutral tint (a = −0.5, b = −5; stage/tokens.ts hopfRampHex), so it never reaches the state's near-white
 * (L* 96.8) and holds no outcome, state or operator colour. sRGB components in [0, 1].
 */
export const RAMP_L: readonly [number, number] = [36, 84]
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
function gridLines(grid: Float32Array, n: number, bx: Float32Array, by: Float32Array, fit: Fit, stride: number): Float32Array[] {
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
    if (layers.solid && s.solid) {
      const grid = s.solid
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
    const wire = layers.wire && s.wire ? gridLines(s.wire, n, bx, by, fit, wireStride(n)) : []
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
/** A probability: 3 decimals, trailing zeros dropped ("0.5", "0.854", "1", "0"). */
export const probText = (p: number): string => String(Math.round(p * 1000) / 1000)
/** An angle in radians with its degrees: "1.571 rad (90°)". */
export const angleText = (rad: number): string => `${num(rad)} rad (${num((rad * 180) / Math.PI)}°)`
/** The height's name on the axis and in readouts: f, g or "f, g" (the layers drawn). */
export const heightName = (layers: Layers, cfg: SurfaceConfig) => [layers.solid && cfg.f ? 'f' : null, layers.wire && cfg.g ? 'g' : null].filter(Boolean).join(', ')

export function readoutsOf(s: Sampled, _g: Geometry, cur: Cursor, layers: Layers, equal: boolean): Readout[] {
  const R: Readout[] = []
  const add = (key: string, text: string, tone: Tone = 'text') => R.push({ key, text, tone })
  const scale = () => add('scale', equal ? 'equal scale on all three axes' : 'each axis fitted to the box separately', 'silver')
  if (s.kind === 'surface' && cur.kind === 'surface') {
    const [vx, vy] = s.cfg.vars
    add('cursor', `${vx} = ${num(cur.x)}, ${vy} = ${num(cur.y)}`)
    const layer = (name: 'f' | 'g', val: number | null, st: LayerStats | null, on: boolean, what: string) => {
      if (val === null || !st || !on) return
      add(name, Number.isNaN(val) ? `${name}: a gap here (${what})` : `${name} = ${num(val)} (${what})`)
      add(`${name}-range`, st.min === null ? `${name}: every sample is a gap` : st.min === st.max ? `${name} is constant: ${num(st.min)}` : `${name} from ${num(st.min)} to ${num(st.max!)}`)
    }
    layer('f', cur.f, s.stats.solid, layers.solid, 'solid')
    layer('g', cur.g, s.stats.wire, layers.wire, 'wire')
    if (layers.solid && layers.wire && s.touch) {
      const t = s.touch
      add('touch', t.both === 0 ? 'f and g: no sample where both are drawn' : `f = g at ${t.equal === 0 ? 'no sample' : `${t.equal} of ${t.both} samples`}`)
      if (t.both > 0) add('below', `f < g at ${t.below === 0 ? 'no sample' : `${t.below} samples`}`)
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
    if (s.ext) s.ext.forEach(([lo, hi], j) => add(`${names[j]}-range`, lo === hi ? `${names[j]}(${v}) is constant: ${num(lo)}` : `${names[j]}(${v}) from ${num(lo)} to ${num(hi)}`))
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
      // θ outside 0…π still gives a state; its point's own polar angle is then not θ (say so, never mislead)
      if (cur.theta < 0 || cur.theta > Math.PI) add('polar', `θ is outside 0…180°: the point’s own polar angle is ${num((Math.acos(Math.max(-1, Math.min(1, cur.r[2]))) * 180) / Math.PI)}°`, 'silver')
      add('pz', `P(+z) = ${probText(cur.pz!)}`)
      add('px', `P(+x) = ${probText(cur.px!)}`)
    }
    add('gaps', `gaps: ${s.gaps} of ${s.n} samples`)
    if (s.cfg.usesA) add('a', `a = ${num(s.a)}`)
    return R
  }
  return R
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
    cursor: [0.25, 0.125],
  },
  saddle: {
    mode: 'surface',
    note: 'A saddle x² − y² (solid) and the tilted plane a·x (wire): slide a to tilt the plane.',
    texts: { sv1: 'x', sv2: 'y', f: 'x^2 - y^2', g: 'a x', x0: '-1', x1: '1', y0: '-1', y1: '1' },
    res: 49,
    a: 0.5,
    layers: { solid: true, wire: true },
    equal: true,
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
    res: 200,
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

export const TRY_THIS =
  'Solid: $\\Delta S_x\\,\\Delta S_y$ of the state at polar angle $x = \\theta$ and azimuth $y = \\varphi$. Wire: the bound $\\tfrac12|\\langle S_z\\rangle|$ ($\\hbar = 1$). Where do the two surfaces touch, and does the solid ever dip below the wire?'

/**
 * What the engine finds for the Try this (checked in model.test.ts against the engine on the preset's 65 × 65 grid and
 * at random points): the layers are equal exactly where sin x cos y = 0 or sin x sin y = 0, because
 * (1 − rx²)(1 − ry²) − rz² = rx² ry² for a unit Bloch vector; everywhere else the solid is above the wire.
 */
export const TRY_THIS_ANSWER =
  'They touch along the edges $x = 0$ and $x = \\pi$ (the poles) and along $y = 0, \\pi/2, \\pi, 3\\pi/2$ and $2\\pi$: four whole meridians, since $y = 0$ and $y = 2\\pi$ are one. On the 65 × 65 grid that is 445 samples; at every other sample the solid is above the wire, as the uncertainty relation says. Both are 0 only where those meridians cross the equator $x = \\pi/2$: the states $|{\\pm x}\\rangle$ and $|{\\pm y}\\rangle$.'
