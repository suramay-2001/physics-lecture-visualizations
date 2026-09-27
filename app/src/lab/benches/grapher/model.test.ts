/**
 * The Grapher's model against the engine (P truth: every number a learner reads comes from app/src/physics):
 *   - sampling agrees with `evalReal` at every sample (surface, curve, Bloch path), with `a` bound as a number;
 *   - gaps are counted and never reach the picture: a few hundred random expressions and ranges (1/x, ln, tan, sqrt of
 *     negatives, huge powers, ±10⁶ ranges) never throw and never put a non-finite number in the view;
 *   - parse errors carry a caret position and a plain reason; ranges are refused with checkRange's reasons;
 *   - the preset allowlist rejects crafted ids;
 *   - the Bloch-path readouts equal spin.ts (hand values: θ = π/2, φ = 0 is |+x⟩: P(+z) = ½, P(+x) = 1);
 *   - units: graph space has none (no ħ anywhere);
 *   - the Try this is true: f = g exactly on the pole rows and four meridians (445 samples of 65²), f ≥ g everywhere,
 *     both 0 only at |±x⟩, |±y⟩.
 */
import { describe, expect, it } from 'vitest'
import { evalReal, MAX_SAMPLE_ABS, parse, sampleGrid } from '../../../physics/expr'
import { blochVector, KET, ketFromBloch, prob } from '../../../physics/spin'
import { FIDELITY, FIDELITY_VARIANT } from '../../../content/fidelity'
import { texSpans } from '../../../content/walk'
import { renderAuthoredTexStrict } from '../../../ui/tex'
import { presetFrom } from '../../presets'
import {
  bindParam,
  cursorFromPoint,
  cursorOf,
  cursorView,
  FIELDS,
  geometryOf,
  rampRgb,
  readMode,
  readoutsOf,
  readRange,
  sampleOf,
  samplePoints,
  SETUPS,
  splitNames,
  stepCursor,
  TRY_THIS,
  TRY_THIS_ANSWER,
  UNCERTAINTY_F,
  UNCERTAINTY_G,
  viewFinite,
  type BlochSample,
  type CurveSample,
  type FieldId,
  type GrapherMode,
  type Layers,
  type SurfaceSample,
  type Texts,
} from './model'
import { GRAPH_FIDELITY, BLOCH_PATH_FIDELITY } from './fidelity'

const BOTH: Layers = { solid: true, wire: true }
const BASE: Texts = {
  sv1: 'x', sv2: 'y', f: UNCERTAINTY_F, g: UNCERTAINTY_G, x0: '0', x1: 'pi', y0: '0', y1: '2pi',
  cv: 't', cx: 'cos t', cy: 'sin t', cz: 'a t', ct0: '0', ct1: '2pi',
  bv: 't', bth: 'pi/2', bph: 't', bt0: '0', bt1: '2pi',
}
const texts = (patch: Partial<Record<FieldId, string>> = {}): Texts => ({ ...BASE, ...patch })
function sampled(mode: GrapherMode, patch: Partial<Record<FieldId, string>> = {}, n = 33, a = 0, layers: Layers = BOTH) {
  const r = readMode(mode, texts(patch), layers, n)
  if (!r.config) throw new Error(`does not read: ${JSON.stringify(r.errors)}`)
  return sampleOf(r.config, a)
}
const env = (pairs: [string, number][]) => new Map(pairs)
const ev = (src: string, vars: string[], e: [string, number][]) => {
  const p = parse(src, { mode: 'real', fns: 'grapher', vars })
  if (!p.ok) throw new Error(src)
  const v = evalReal(p.ast, env(e))
  return Number.isFinite(v) && Math.abs(v) <= MAX_SAMPLE_ABS ? v : NaN
}

describe('sampling agrees with evalReal', () => {
  it('surface: every sample of both layers is evalReal at the engine’s sample points (a bound as a number)', () => {
    const s = sampled('surface', { f: 'sin(a x) cos y + 1/x', g: 'x^2 - a y', x0: '-1', x1: '2' }, 17, 1.5) as SurfaceSample
    expect(s.solid!.length).toBe(17 * 17)
    const xs = samplePoints([-1, 2], 17)
    const ys = samplePoints([0, 2 * Math.PI], 17)
    for (let iy = 0; iy < 17; iy++)
      for (let ix = 0; ix < 17; ix++) {
        const e: [string, number][] = [['x', xs[ix]], ['y', ys[iy]], ['a', 1.5]]
        const f = ev('sin(a x) cos y + 1/x', ['x', 'y', 'a'], e)
        const g = ev('x^2 - a y', ['x', 'y', 'a'], e)
        const k = iy * 17 + ix
        if (Number.isNaN(f)) expect(s.solid![k]).toBeNaN()
        else expect(s.solid![k]).toBe(Math.fround(f))
        expect(s.wire![k]).toBe(Math.fround(g))
      }
    // the sample points are the engine's (sampleGrid's own grid)
    const p = parse('x + 0 y', { mode: 'real', vars: ['x', 'y'] })
    if (!p.ok) throw new Error()
    const grid = sampleGrid(p.ast, ['x', 'y'], [-1, 2], [0, 1], 17, 1)
    expect([...grid]).toEqual([...xs].map(Math.fround))
    // 1/x at x = 0 is not a sample here (17 points on [−1, 2] miss 0), so no gap
    expect(s.stats.solid!.gaps).toBe(0)
  })

  it('curve and Bloch path: every sample is evalReal; a gap in one coordinate is a gap in all', () => {
    const c = sampled('curve', { cx: 'cos t', cy: 'ln t', cz: 'a t' }, 64, 2) as CurveSample
    const ts = samplePoints([0, 2 * Math.PI], 64)
    for (let k = 0; k < 64; k++) {
      const y = ev('ln t', ['t'], [['t', ts[k]]])
      if (Number.isNaN(y)) {
        expect([c.pts[3 * k], c.pts[3 * k + 1], c.pts[3 * k + 2]].every(Number.isNaN)).toBe(true)
        continue
      }
      expect(c.pts[3 * k]).toBe(ev('cos t', ['t'], [['t', ts[k]]]))
      expect(c.pts[3 * k + 1]).toBe(y)
      expect(c.pts[3 * k + 2]).toBe(2 * ts[k])
    }
    expect(c.gaps).toBe(1) // ln 0
    const b = sampled('bloch', { bth: 't/2', bph: 'a t' }, 50, 3) as BlochSample
    const tb = samplePoints([0, 2 * Math.PI], 50)
    for (let k = 0; k < 50; k++) {
      const r = blochVector(ketFromBloch(tb[k] / 2, 3 * tb[k]))
      for (let j = 0; j < 3; j++) expect(b.r[3 * k + j]).toBeCloseTo(r[j], 14)
    }
  })

  it('bindParam replaces only the parameter', () => {
    const p = parse('a x + sin(a) - a^a', { mode: 'real', vars: ['x', 'a'] })
    if (!p.ok) throw new Error()
    const bound = bindParam(p.ast, 2)
    expect(evalReal(bound, env([['x', 3]]))).toBeCloseTo(6 + Math.sin(2) - 4, 14)
    expect(JSON.stringify(bound)).not.toMatch(/"name":"a"/)
  })
})

/* ------------------------------------------------------------------------------------------------ */
/* Fuzz: no throw, no non-finite vertex                                                              */
/* ------------------------------------------------------------------------------------------------ */
function rng(seed: number) {
  let s = seed >>> 0
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0
    return s / 2 ** 32
  }
}
const ATOMS = ['x', 'y', 'a', '0', '1', '2', 'pi', 'e', '1e6', '1e-300', '0.5']
const FNS = ['sqrt', 'sin', 'cos', 'tan', 'exp', 'ln', 'abs', 'asin', 'acos', 'atan', 'sinh', 'cosh', 'tanh']
const OPS = ['+', '-', '*', '/', '^']
function randExpr(r: () => number, depth: number, vars: [string, string]): string {
  const atom = () => {
    const a = ATOMS[Math.floor(r() * ATOMS.length)]
    return a === 'x' ? vars[0] : a === 'y' ? vars[1] : a
  }
  if (depth <= 0 || r() < 0.25) return atom()
  const k = r()
  if (k < 0.35) return `${FNS[Math.floor(r() * FNS.length)]}(${randExpr(r, depth - 1, vars)})`
  if (k < 0.45) return `-(${randExpr(r, depth - 1, vars)})`
  return `(${randExpr(r, depth - 1, vars)})${OPS[Math.floor(r() * OPS.length)]}(${randExpr(r, depth - 1, vars)})`
}
const ENDS = ['0', '-1', '1', 'pi', '-1e6', '1e6', '1e-9', '-1e-9', '1/0', 'ln 0', '5', '-5', '1e7', '1e-12']
/** A valid range most of the time (sorted, wide), else two random ends (often refused). */
const GOOD: [string, string][] = [['-1', '1'], ['0', 'pi'], ['-5', '5'], ['-1e6', '1e6'], ['1e-9', '1'], ['0', '2pi'], ['-pi', '0']]

describe('fuzz: random expressions and ranges never throw and never put a non-finite number in the view', () => {
  it('300 cases across the three modes, both scales, both layers', () => {
    const r = rng(448)
    let drawn = 0
    let refused = 0
    let gaps = 0
    for (let i = 0; i < 300; i++) {
      const mode = (['surface', 'curve', 'bloch'] as const)[i % 3]
      const e = () => randExpr(r, 4, mode === 'surface' ? ['x', 'y'] : ['t', 't'])
      const pair = (): [string, string] => (r() < 0.75 ? GOOD[Math.floor(r() * GOOD.length)] : [ENDS[Math.floor(r() * ENDS.length)], ENDS[Math.floor(r() * ENDS.length)]])
      const [x0, x1] = pair()
      const [y0, y1] = pair()
      const patch: Partial<Record<FieldId, string>> =
        mode === 'surface'
          ? { f: e(), g: e(), x0, x1, y0, y1 }
          : mode === 'curve'
            ? { cx: e(), cy: e(), cz: e(), ct0: x0, ct1: x1 }
            : { bth: e(), bph: e(), bt0: x0, bt1: x1 }
      const layers = { solid: r() < 0.8, wire: r() < 0.8 }
      const res = readMode(mode, texts(patch), layers, mode === 'surface' ? 9 + Math.floor(r() * 24) : 16 + Math.floor(r() * 200))
      if (!res.config) {
        refused++
        expect(Object.keys(res.errors).length, JSON.stringify(patch)).toBeGreaterThan(0)
        continue
      }
      const s = sampleOf(res.config, -5 + 10 * r())
      for (const equal of [false, true]) {
        const g = geometryOf(s, equal, layers)
        const c = cursorOf(s, { surface: [r(), r()], curve: r(), bloch: r() })
        const view = { bench: 'grapher' as const, geometry: g.geo, ...cursorView(s, g, c, layers), focus: false }
        expect(viewFinite(view), JSON.stringify(patch)).toBe(true)
        // the readouts never print NaN or Infinity
        for (const line of readoutsOf(s, g, c, layers, equal)) expect(line.text, JSON.stringify(patch)).not.toMatch(/NaN|Infinity/)
      }
      drawn++
      gaps += s.kind === 'surface' ? (s.stats.solid?.gaps ?? 0) + (s.stats.wire?.gaps ?? 0) : s.gaps
    }
    // the fuzz really exercised both paths and produced gaps
    expect(drawn).toBeGreaterThan(100)
    expect(refused).toBeGreaterThan(15)
    expect(gaps).toBeGreaterThan(100)
  })

  it('the classic gap makers: 1/x, ln x, tan x meshes are finite, and their gaps are counted', () => {
    for (const f of ['1/x', 'ln(x)', 'tan(x)', 'sqrt(x)', 'x^1000', 'exp(exp(3 x))']) {
      const s = sampled('surface', { f, g: f, x0: '-2', x1: '2', y0: '-1', y1: '1' }, 65) as SurfaceSample
      const g = geometryOf(s, false, BOTH)
      const view = { bench: 'grapher' as const, geometry: g.geo, ...cursorView(s, g, cursorOf(s, { surface: [0.5, 0.5], curve: 0, bloch: 0 }), BOTH), focus: false }
      expect(viewFinite(view), f).toBe(true)
      // count = the non-finite or > 10⁶ samples, exactly
      const xs = samplePoints([-2, 2], 65)
      let expected = 0
      for (let iy = 0; iy < 65; iy++) for (let ix = 0; ix < 65; ix++) if (Number.isNaN(ev(f, ['x', 'y'], [['x', xs[ix]], ['y', 0]]))) expected++
      expect(s.stats.solid!.gaps, f).toBe(expected)
      // tan's asymptotes (±π/2) are not sample points here: its values stay finite and below 10⁶, so no gap (honest)
      if (f !== 'tan(x)') expect(expected, f).toBeGreaterThan(0)
      // no triangle touches a gap vertex
      const idx = g.geo.surface!.indices
      for (let i = 0; i < idx.length; i++) expect(Number.isNaN(s.solid![idx[i]])).toBe(false)
    }
  })

  it('every sample a gap: nothing drawn, finite view, plain readouts', () => {
    const s = sampled('surface', { f: 'ln(-1 - x^2)', g: 'sqrt(-1)' }, 9) as SurfaceSample
    const g = geometryOf(s, false, BOTH)
    expect(g.geo.surface!.indices.length).toBe(0)
    expect(g.geo.wire).toEqual([])
    const c = cursorOf(s, { surface: [0.5, 0.5], curve: 0, bloch: 0 })
    const lines = readoutsOf(s, g, c, BOTH, false).map((l) => l.text)
    expect(lines).toContain('f: every sample is a gap')
    expect(lines).toContain('f: a gap here (solid)')
    expect(lines).toContain('f and g: no sample where both are drawn')
    expect(viewFinite({ bench: 'grapher', geometry: g.geo, ...cursorView(s, g, c, BOTH), focus: false })).toBe(true)
  })
})

/* ------------------------------------------------------------------------------------------------ */
/* Inputs: caret and plain reason                                                                    */
/* ------------------------------------------------------------------------------------------------ */
describe('parse errors carry a position and a plain reason', () => {
  const err = (patch: Partial<Record<FieldId, string>>, field: FieldId, mode: GrapherMode = 'surface') => readMode(mode, texts(patch), BOTH, 33).errors[field]!
  it('expressions', () => {
    expect(err({ f: 'sin(x' }, 'f')).toMatchObject({ pos: 5, code: 'unexpected-end' })
    expect(err({ f: '2 ** x' }, 'f')).toMatchObject({ pos: 3, code: 'syntax' })
    expect(err({ f: 'x $ y' }, 'f')).toMatchObject({ pos: 2, code: 'bad-char', reason: 'The character “$” is not allowed here.' })
    expect(err({ f: 'sin xy' }, 'f')).toMatchObject({ pos: 4, code: 'unknown-identifier', reason: '“xy” is not a name. For a product, put a space or * between the names: “x y”.' })
    expect(err({ f: 'foo(x)' }, 'f').reason).toBe('Unknown name “foo”. Here you can use x, y, the parameter a, pi and e, and the functions listed below.')
    expect(err({ g: '' }, 'g')).toMatchObject({ pos: 0, code: 'empty' })
    expect(err({ g: 'x'.repeat(201) }, 'g').code).toBe('too-long')
    expect(err({ cz: 'x t' }, 'cz', 'curve').reason).toMatch(/^Unknown name “x”/)
    expect(err({ bph: 'ta' }, 'bph', 'bloch').reason).toBe('“ta” is not a name. For a product, put a space or * between the names: “t a”.')
    // every reason is a sentence
    for (const f of ['(', ')', '1/', '^2', 'sin', '((((((((((((((((((((((((((((((((((x))))))))))))))))))))))))))))))))))'])
      expect(err({ f }, 'f').reason, f).toMatch(/^[A-Z“].*\.$/)
  })
  it('a layer that is off needs no valid expression; the other still reads', () => {
    const r = readMode('surface', texts({ g: 'sin(' }), { solid: true, wire: false }, 33)
    expect(r.config).not.toBeNull()
    expect(r.errors.g).toBeUndefined()
  })
  it('variable names', () => {
    expect(err({ sv1: 'pi' }, 'sv1').code).toBe('var-reserved')
    expect(err({ sv1: 'a' }, 'sv1').code).toBe('var-reserved')
    expect(err({ sv1: 'sin' }, 'sv1').code).toBe('var-reserved')
    expect(err({ sv1: 'X' }, 'sv1')).toMatchObject({ pos: 0, code: 'var-shape' })
    expect(err({ sv1: 'th2' }, 'sv1')).toMatchObject({ pos: 2, code: 'var-shape' })
    expect(err({ sv2: 'x' }, 'sv2').code).toBe('var-same')
    // renamed variables work, and the old names are then unknown
    const r = readMode('surface', texts({ sv1: 'theta', sv2: 'phi', f: 'sin theta cos phi', g: 'cos theta' }), BOTH, 9)
    expect(r.config).not.toBeNull()
    expect(readMode('surface', texts({ sv1: 'theta', sv2: 'phi' }), BOTH, 9).errors.f!.reason).toMatch(/^Unknown name “x”/)
  })
  it('ranges: constants only, and checkRange’s reasons (plus a width the samples can resolve)', () => {
    expect(readRange('0', 'pi')).toEqual({ ok: true, r: [0, Math.PI] })
    const bad = (a: string, b: string) => {
      const r = readRange(a, b)
      if (r.ok) throw new Error(`${a} ${b} accepted`)
      return [r.which, r.err.code]
    }
    expect(bad('1', '0')).toEqual([1, 'reversed'])
    expect(bad('0', '2e6')).toEqual([1, 'too-wide'])
    expect(bad('1/0', '1')).toEqual([0, 'non-finite'])
    expect(bad('1', '1')).toEqual([1, 'too-narrow'])
    expect(bad('1e5', '1e5+1e-2')).toEqual([1, 'too-narrow'])
    expect(bad('x', '1')).toEqual([0, 'unknown-identifier'])
    expect(readRange('-1e6', '1e6').ok).toBe(true)
  })
  it('splitNames finds the product a student meant', () => {
    expect(splitNames('xy', ['x', 'y'])).toEqual(['x', 'y'])
    expect(splitNames('xsin', ['x', 'sin'])).toEqual(['x', 'sin'])
    expect(splitNames('q', ['x', 'y'])).toBeNull()
    expect(splitNames('x', ['x'])).toBeNull()
  })
})

describe('preset allowlist', () => {
  it('each id is allowlisted and reads; crafted ids are not', () => {
    for (const [id, setup] of Object.entries(SETUPS)) {
      expect(presetFrom(SETUPS, id)).toBe(id)
      const t = texts(setup.texts)
      const r = readMode(setup.mode, t, setup.layers ?? BOTH, setup.res ?? 33)
      expect(r.errors, id).toEqual({})
      expect(r.config, id).not.toBeNull()
      // a preset names every field of its mode (nothing is left from an earlier state)
      for (const f of FIELDS[setup.mode]) expect(setup.texts[f], `${id}.${f}`).toBeDefined()
    }
    for (const bad of ['constructor', '__proto__', 'toString', 'hasOwnProperty', 'UNCERTAINTY', 'uncertainty ', 'uncertainty&a=5', 'helix;a=1', '', 'x'.repeat(40), '{"a":5}', '../helix'])
      expect(presetFrom(SETUPS, bad), bad).toBeNull()
  })
})

/* ------------------------------------------------------------------------------------------------ */
/* Bloch path readouts = spin.ts; units                                                              */
/* ------------------------------------------------------------------------------------------------ */
describe('Bloch path readouts come from spin.ts', () => {
  it('at every cursor position of the equator preset and a spiral', () => {
    for (const patch of [{ bth: 'pi/2', bph: 't' }, { bth: 't/2', bph: 'a t' }]) {
      const s = sampled('bloch', patch, 64, 3)
      const g = geometryOf(s, false, BOTH)
      for (const u of [0, 0.1, 0.25, 0.5, 0.77, 1]) {
        const c = cursorOf(s, { surface: [0, 0], curve: 0, bloch: u })
        if (c.kind !== 'bloch') throw new Error()
        const t = 2 * Math.PI * u
        const th = patch.bth === 'pi/2' ? Math.PI / 2 : t / 2
        const ph = patch.bph === 't' ? t : 3 * t
        const ket = ketFromBloch(th, ph)
        expect(c.theta).toBeCloseTo(th, 14)
        expect(c.phi).toBeCloseTo(ph, 14)
        expect(c.r).toEqual(blochVector(ket))
        expect(c.pz).toBe(prob(KET['+z'], ket))
        expect(c.px).toBe(prob(KET['+x'], ket))
        const lines = Object.fromEntries(readoutsOf(s, g, c, BOTH, false).map((l) => [l.key, l.text]))
        expect(lines.pz).toBe(`P(+z) = ${String(Math.round(prob(KET['+z'], ket) * 1000) / 1000)}`)
      }
    }
  })
  it('hand values: θ = π/2, φ = 0 is |+x⟩ (P(+z) = ½, P(+x) = 1); φ = π/2 is |+y⟩ (P(+x) = ½)', () => {
    const s = sampled('bloch', { bth: 'pi/2', bph: 't' }, 65)
    const g = geometryOf(s, false, BOTH)
    const at = (u: number) => Object.fromEntries(readoutsOf(s, g, cursorOf(s, { surface: [0, 0], curve: 0, bloch: u }), BOTH, false).map((l) => [l.key, l.text]))
    expect(at(0)).toMatchObject({ theta: 'θ = 1.571 rad (90°)', phi: 'φ = 0 rad (0°)', r: 'r = (1, 0, 0)', pz: 'P(+z) = 0.5', px: 'P(+x) = 1' })
    expect(at(0.25)).toMatchObject({ phi: 'φ = 1.571 rad (90°)', r: 'r = (0, 1, 0)', px: 'P(+x) = 0.5' })
    // θ outside 0…π is allowed, and the readout says the point's own polar angle
    const w = sampled('bloch', { bth: 't', bph: '0' }, 65)
    const lines = readoutsOf(w, geometryOf(w, false, BOTH), cursorOf(w, { surface: [0, 0], curve: 0, bloch: 0.75 }), BOTH, false)
    expect(lines.find((l) => l.key === 'polar')!.text).toBe('θ is outside 0…180°: the point’s own polar angle is 90°')
  })
  it('units: graph space has none; nothing carries ħ', () => {
    for (const [id, setup] of Object.entries(SETUPS)) {
      const r = readMode(setup.mode, texts(setup.texts), setup.layers ?? BOTH, setup.res ?? 33)
      const s = sampleOf(r.config!, setup.a ?? 0)
      const g = geometryOf(s, !!setup.equal, setup.layers ?? BOTH)
      for (const u of [0, 0.3, 1]) {
        const lines = readoutsOf(s, g, cursorOf(s, { surface: [u, 1 - u], curve: u, bloch: u }), setup.layers ?? BOTH, !!setup.equal).map((l) => l.text).join(' | ')
        expect(lines, id).not.toMatch(/ħ|hbar/)
        // angles appear only on the Bloch path, in radians with their degrees
        if (setup.mode !== 'bloch') expect(lines, id).not.toMatch(/rad|°/)
        else expect(lines, id).toMatch(/rad \(/)
      }
    }
  })
})

/* ------------------------------------------------------------------------------------------------ */
/* The Try this                                                                                      */
/* ------------------------------------------------------------------------------------------------ */
describe('the Try this is true (checked with the engine)', () => {
  const setup = SETUPS.uncertainty
  const r = readMode('surface', texts(setup.texts), BOTH, setup.res!)
  const s = sampleOf(r.config!, 0) as SurfaceSample
  const n = 65
  const xs = samplePoints([0, Math.PI], n)
  const ys = samplePoints([0, 2 * Math.PI], n)
  const f = (ix: number, iy: number) => ev(UNCERTAINTY_F, ['x', 'y'], [['x', xs[ix]], ['y', ys[iy]]])
  const g = (ix: number, iy: number) => ev(UNCERTAINTY_G, ['x', 'y'], [['x', xs[ix]], ['y', ys[iy]]])

  it('the solid is ΔSx·ΔSy and the wire the bound ½|⟨Sz⟩| (spin.ts, ħ = 1)', () => {
    for (const [ix, iy] of [[5, 7], [20, 40], [32, 10], [60, 63]]) {
      const ket = ketFromBloch(xs[ix], ys[iy])
      const rr = blochVector(ket)
      expect(f(ix, iy)).toBeCloseTo(0.5 * Math.sqrt(1 - rr[0] ** 2) * 0.5 * Math.sqrt(1 - rr[1] ** 2), 12)
      expect(g(ix, iy)).toBeCloseTo(0.5 * Math.abs(0.5 * rr[2]), 12)
    }
  })

  it('equal exactly on the rows x = 0, π and the columns y = 0, π/2, π, 3π/2, 2π: 445 samples; f > g at every other', () => {
    const rows = new Set([0, 64])
    const cols = new Set([0, 16, 32, 48, 64])
    let equal = 0
    for (let iy = 0; iy < n; iy++)
      for (let ix = 0; ix < n; ix++) {
        const d = f(ix, iy) - g(ix, iy)
        const on = rows.has(ix) || cols.has(iy)
        if (on) {
          expect(Math.abs(d), `${ix},${iy}`).toBeLessThan(1e-15)
          equal++
        } else expect(d, `${ix},${iy}`).toBeGreaterThan(1e-9)
      }
    expect(equal).toBe(445)
    // the model's readout counts the same
    expect(s.touch).toMatchObject({ both: 4225, equal: 445, below: 0, min: 0 })
    const gm = geometryOf(s, false, BOTH)
    const lines = Object.fromEntries(readoutsOf(s, gm, cursorOf(s, { surface: [0.5, 0.25], curve: 0, bloch: 0 }), BOTH, false).map((l) => [l.key, l.text]))
    expect(lines.touch).toBe('f = g at 445 of 4225 samples')
    // g's smallest sample is cos(π/2)/4 = 1.5e-17, a float residue: it prints as 0 (below 10⁻¹² of the layer's size)
    expect(s.stats.wire!.min).toBeGreaterThan(0)
    expect(lines['g-range']).toBe('g from 0 to 0.25')
    expect(lines['f-range']).toBe('f from 0 to 0.25')
    expect(lines.below).toBe('f < g at no sample')
  })

  it('both are 0 only at x = π/2 on those meridians (|±x⟩, |±y⟩)', () => {
    const zeros: [number, number][] = []
    for (let iy = 0; iy < n; iy++) for (let ix = 0; ix < n; ix++) if (f(ix, iy) < 1e-15 && g(ix, iy) < 1e-15) zeros.push([ix, iy])
    expect(zeros).toEqual([0, 16, 32, 48, 64].map((iy) => [32, iy]))
    for (const iy of [0, 16, 32, 48]) {
      const rr = blochVector(ketFromBloch(xs[32], ys[iy]))
      expect(rr.map((v) => Math.round(v) + 0)).toEqual([[1, 0, 0], [0, 1, 0], [-1, 0, 0], [0, -1, 0]][iy / 16])
    }
  })

  it('off the grid too: (1 − rx²)(1 − ry²) − rz² = rx² ry² ≥ 0, zero exactly when rx ry = 0', () => {
    const rand = rng(709)
    for (let i = 0; i < 500; i++) {
      const th = Math.PI * rand()
      const ph = 2 * Math.PI * rand()
      const fv = ev(UNCERTAINTY_F, ['x', 'y'], [['x', th], ['y', ph]])
      const gv = ev(UNCERTAINTY_G, ['x', 'y'], [['x', th], ['y', ph]])
      const [rx, ry] = blochVector(ketFromBloch(th, ph))
      expect(fv - gv).toBeGreaterThanOrEqual(-1e-15)
      expect(fv ** 2 - gv ** 2).toBeCloseTo((rx * ry) ** 2 / 16, 14)
    }
  })

  it('the wording says what the engine found', () => {
    expect(TRY_THIS_ANSWER).toMatch(/445 samples/)
    expect(TRY_THIS_ANSWER).toMatch(/65 × 65/)
    expect(TRY_THIS_ANSWER).toMatch(/x = 0\$ and \$x = \\pi\$/)
    expect(TRY_THIS_ANSWER).toMatch(/y = 0, \\pi\/2, \\pi, 3\\pi\/2\$ and \$2\\pi\$/)
    expect(TRY_THIS_ANSWER).toMatch(/solid is above the wire/)
    for (const t of [TRY_THIS, TRY_THIS_ANSWER]) for (const sp of texSpans(t)) expect(() => renderAuthoredTexStrict(sp.tex)).not.toThrow()
  })
})

describe('picture', () => {
  it('the ramp is luminance only: grey (a ≈ 0) and increasing, never the state’s near-white', () => {
    let prev = -1
    for (let i = 0; i <= 20; i++) {
      const [r, g, b] = rampRgb(i / 20)
      const y = 0.2126 * r + 0.7152 * g + 0.0722 * b
      expect(y).toBeGreaterThan(prev)
      prev = y
      expect(Math.max(r, g, b) - Math.min(r, g, b)).toBeLessThan(0.06)
      expect(Math.max(r, g, b)).toBeLessThan(0.86)
    }
  })
  it('each axis fitted to the box, or one scale for all; the cursor maps back to the same (x, y)', () => {
    const s = sampled('surface', { x0: '0', x1: '4', y0: '-1', y1: '1' }, 33) as SurfaceSample
    for (const equal of [false, true]) {
      const g = geometryOf(s, equal, BOTH)
      const box = g.geo.box!
      if (!equal) {
        expect(box.min).toEqual([-1, -1, -1])
        expect(box.max).toEqual([1, 1, 1])
      } else {
        expect(box.max[0] - box.min[0]).toBeCloseTo(2, 12)
        expect(box.max[1] - box.min[1]).toBeCloseTo(1, 12)
      }
      const c = cursorOf(s, { surface: [0.25, 0.75], curve: 0, bloch: 0 })
      const v = cursorView(s, g, c, BOTH)
      const back = cursorFromPoint(s, g, v.cursor.at!) as [number, number]
      expect(back[0]).toBeCloseTo(0.25, 12)
      expect(back[1]).toBeCloseTo(0.75, 12)
    }
  })
  it('keyboard steps land on samples (Shift: a tenth of one) and stay in range', () => {
    expect(stepCursor(0, 1, false, 65)).toBe(1 / 64)
    expect(stepCursor(1 / 64, -1, false, 65)).toBe(0)
    expect(stepCursor(0, -1, false, 65)).toBe(0)
    expect(stepCursor(1, 1, false, 65)).toBe(1)
    expect(stepCursor(0.5 + 1 / 640, 1, false, 65)).toBe(33 / 64)
    expect(stepCursor(0, 1, true, 65)).toBeCloseTo(1 / 640, 15)
  })
  it('a curve drag picks the nearest drawn sample', () => {
    const s = sampled('curve', { cx: 'cos t', cy: 'sin t', cz: '0' }, 65) as CurveSample
    const g = geometryOf(s, true, BOTH)
    const u = cursorFromPoint(s, g, [0, 1, 0])
    expect(u).toBeCloseTo(16 / 64, 12)
  })
})

describe('fidelity notes', () => {
  it('items in every group; ids unique, well-formed, distinct from the lecture notes; TeX typesets', () => {
    const lecture = new Set([...Object.values(FIDELITY), ...Object.values(FIDELITY_VARIANT)].flatMap((f) => [...f.exact, ...f.schematic, ...f.misleading]).map((i) => i.id))
    for (const note of [GRAPH_FIDELITY, BLOCH_PATH_FIDELITY]) {
      const all = [...note.exact, ...note.schematic, ...note.misleading]
      for (const grp of [note.exact, note.schematic, note.misleading]) expect(grp.length).toBeGreaterThan(0)
      const ids = all.map((i) => i.id)
      expect(new Set(ids).size).toBe(ids.length)
      for (const id of ids) {
        expect(/^[a-z0-9-]+$/.test(id), id).toBe(true)
        expect(lecture.has(id), id).toBe(false)
      }
      for (const i of all) for (const sp of texSpans(i.text)) expect(() => renderAuthoredTexStrict(sp.tex), i.id).not.toThrow()
    }
    const words = JSON.stringify(GRAPH_FIDELITY)
    expect(words).toMatch(/exact sample/)
    expect(words).toMatch(/straight/)
    expect(words).toMatch(/fitted to the box separately/)
  })
})
