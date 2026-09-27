/**
 * The independent P review of the Grapher (docs/roles/audits/P-grapher-review.md, 2026-09-28): one test per finding,
 * named after its item, that pins the reviewed defect's absence. The parser's own grammar tests are
 * physics/expr.grapherGrammar.test.ts; answer mode is frozen in physics/expr.answerMode.test.ts. What only the page can
 * show (the Try this at first load, the preset note after a click, the live regions, the shots) is in e2e/lab.spec.ts.
 * Hand values in the comments.
 */
import { describe, expect, it } from 'vitest'
import { evalReal, parse } from '../../../physics/expr'
import { blochVector, KET, ketFromBloch, prob } from '../../../physics/spin'
import { POLE_LABELS } from '../../../stage/scenes/bloch/blochLabels'
import { STAGE_BG } from '../../../stage/tokens'
import { BLOCH_PATH_FIDELITY, GRAPH_FIDELITY } from './fidelity'
import { labelsOf } from './labels'
import {
  captionOf,
  cursorOf,
  geometryOf,
  GRAPH_SHOT,
  grapherParse,
  HELP,
  presetNote,
  probText,
  RAMP_L,
  rampRgb,
  readMode,
  readoutsOf,
  readRange,
  sampleOf,
  samplePoints,
  scaleText,
  SETUPS,
  TRY_THIS_ANSWER,
  type FieldId,
  type GrapherMode,
  type Layers,
  type Sampled,
  type SurfaceSample,
  type Texts,
} from './model'
import { applySetup, grStore, INITIAL_PARAMS } from './store'
import grapherSceneSource from '../../babylon/grapherScene.ts?raw'

const BOTH: Layers = { solid: true, wire: true }
const BASE: Texts = {
  sv1: 'x', sv2: 'y', f: 'x^2 - y^2', g: 'a', x0: '-1', x1: '1', y0: '-1', y1: '1',
  cv: 't', cx: 'cos t', cy: 'sin t', cz: '0', ct0: '0', ct1: '2pi',
  bv: 't', bth: 'pi/2', bph: 't', bt0: '0', bt1: '2pi',
}
function sampled(mode: GrapherMode, patch: Partial<Record<FieldId, string>>, n: number, a = 0, layers: Layers = BOTH): Sampled {
  const r = readMode(mode, { ...BASE, ...patch }, layers, n)
  if (!r.config) throw new Error(`does not read: ${JSON.stringify(r.errors)}`)
  return sampleOf(r.config, a)
}
const lines = (s: Sampled, cursor: { surface?: [number, number]; curve?: number; bloch?: number } = {}, compare = true, layers: Layers = BOTH, equal = false) =>
  Object.fromEntries(
    readoutsOf(s, geometryOf(s, equal, layers), cursorOf(s, { surface: cursor.surface ?? [0.5, 0.5], curve: cursor.curve ?? 0, bloch: cursor.bloch ?? 0 }), layers, equal, compare).map((l) => [l.key, l.text]),
  )
const err = (mode: GrapherMode, field: FieldId, text: string) => readMode(mode, { ...BASE, [field]: text }, BOTH, 17).errors[field]

describe('review #1: typed input never silently becomes a different graph', () => {
  it('"2 3" and "x^2 3" are refused at the second number, naming the fix', () => {
    expect(err('surface', 'f', '2 3')).toEqual({
      pos: 2,
      code: 'spaced-numbers',
      reason: 'Two numbers side by side: put · or * between 2 and 3, or remove the space if they are one number.',
    })
    expect(err('surface', 'f', 'x^2 3')).toMatchObject({ pos: 4, code: 'spaced-numbers', reason: expect.stringContaining('put · or * between 2 and 3') })
    // a range end too
    expect(readRange('0', '2 3')).toMatchObject({ ok: false, which: 1, err: { pos: 2, code: 'spaced-numbers' } })
  })
  it('"sin 2x" and "cos pi t" are refused at the factor: "write sin(2x) or sin(2)·x"', () => {
    expect(err('surface', 'f', 'sin 2x')).toEqual({
      pos: 5,
      code: 'bare-argument',
      reason: 'A function takes only the next factor, so this is ambiguous: write sin(2x) or sin(2)·x.',
    })
    expect(err('curve', 'cz', 'cos pi t')!.reason).toMatch(/write cos\(pi t\) or cos\(pi\)·t\.$/)
    expect(err('surface', 'f', '1 + sin 2(x+1) - y')!.reason).toMatch(/write sin\(2\(x\+1\)\) or sin\(2\)·\(x\+1\)\.$/)
    expect(err('surface', 'f', 'sqrt 2 x^2 + 1')!.reason).toMatch(/write sqrt\(2 x\^2\) or sqrt\(2\)·x\^2\.$/)
  })
  it('"sin x cos y", "sin x", "2 sin x", "sin(2x)" read the obvious way', () => {
    const v = (src: string) => {
      const r = grapherParse(src, ['x', 'y'])
      if (!r.ok) throw new Error(src)
      return evalReal(r.ast, new Map([['x', 0.7], ['y', -1.3]]))
    }
    expect(v('sin x cos y')).toBe(Math.sin(0.7) * Math.cos(-1.3))
    expect(v('sin x')).toBe(Math.sin(0.7))
    expect(v('2 sin x')).toBe(2 * Math.sin(0.7))
    expect(v('sin(2x)')).toBe(Math.sin(1.4))
  })
  it('every example in the help reads as the help says (walked through the parser)', () => {
    const shown = HELP.map((p) => (typeof p === 'string' ? p : p.ex)).join('')
    const examples = HELP.filter((p): p is Exclude<(typeof HELP)[number], string> => typeof p !== 'string')
    expect(examples.length).toBeGreaterThanOrEqual(10)
    // the old promise is gone; the help names both refusals
    expect(shown).not.toMatch(/\(2pi, 2 x, x y\)/)
    expect(examples.map((e) => e.ex)).toEqual(expect.arrayContaining(['2 3', 'sin 2x', 'sin x cos y', 'sin x^2']))
    for (const e of examples) {
      const r = grapherParse(e.ex, ['x', 'y', 'a'])
      if ('refused' in e) {
        expect(r.ok, e.ex).toBe(false)
        if (!r.ok) expect(r.reason, e.ex).toBe(e.refused)
        continue
      }
      const want = grapherParse(e.reads, ['x', 'y', 'a'])
      if (!r.ok || !want.ok) throw new Error(`${e.ex} / ${e.reads} does not read`)
      for (const [x, y] of [[0.3, 1.1], [-2.5, 0.4], [1.7, -0.9]]) {
        const env = new Map([['x', x], ['y', y], ['a', 0.5]])
        expect(evalReal(r.ast, env), e.ex).toBeCloseTo(evalReal(want.ast, env), 13)
      }
    }
  })
})

describe('review #2: the comparison counts crossings, not only exact coincidences', () => {
  it('saddle at a = 0.51: f = g at no sample, yet the layers cross in C > 0 cells (x² − y² = 0.51 between samples)', () => {
    const s = sampled('surface', SETUPS.saddle.texts, 49, 0.51) as SurfaceSample
    expect(s.touch!.equal).toBe(0)
    // the crossing cells counted by hand: corners of x² − y² − 0.51 of both signs
    const xs = samplePoints([-1, 1], 49)
    let cross = 0
    for (let iy = 0; iy < 48; iy++)
      for (let ix = 0; ix < 48; ix++) {
        const d = [[ix, iy], [ix + 1, iy], [ix, iy + 1], [ix + 1, iy + 1]].map(([i, j]) => xs[i] ** 2 - xs[j] ** 2 - 0.51)
        if (Math.min(...d) < 0 && Math.max(...d) > 0) cross++
      }
    expect(cross).toBeGreaterThan(0)
    expect(s.touch).toMatchObject({ both: 49 * 49, equal: 0, cells: 48 * 48, cross })
    const r = lines(s)
    expect(r.touch).toBe('f = g exactly at no sample')
    expect(r.cross).toBe(`the layers cross in ${cross} cells`)
  })
  it('the Try this: 445 exact samples, and the layers touch without crossing (f ≥ g)', () => {
    const u = SETUPS.uncertainty
    const s = sampled('surface', u.texts, 65, 0) as SurfaceSample
    expect(s.touch).toMatchObject({ both: 4225, equal: 445, below: 0, cross: 0, cells: 64 * 64 })
    const r = lines(s)
    expect(r.touch).toBe('f = g exactly at 445 samples')
    expect(r.cross).toBe('the layers cross in no cell')
    expect(TRY_THIS_ANSWER).toMatch(/445 samples/)
  })
})

describe('review #3: equality is relative to the picture, and extremes are double precision', () => {
  it('f = 1e-13·x against g = 0 is NOT equal (was 2401 of 2401): only the x = 0 column is', () => {
    const s = sampled('surface', { f: '1e-13 x', g: '0' }, 49) as SurfaceSample
    // x = 0 is the middle sample of 49 on [−1, 1]: 49 exact zeros there
    expect(s.touch!.equal).toBe(49)
    expect(lines(s).touch).toBe('f = g exactly at 49 samples')
    // and a float residue of the picture's size still counts as equal: sin(πx) against 0 at the integers (S = 1,
    // sin(2π) = −2.4e-16), 5 of the 9 columns on [−2, 2]
    const z = sampled('surface', { f: 'sin(pi x)', g: '0', x0: '-2', x1: '2' }, 9) as SurfaceSample
    expect(z.touch!.equal).toBe(5 * 9)
  })
  it('f = 1e-50·x is not "constant: 0" (it underflowed in single precision); its mesh is not flat', () => {
    const s = sampled('surface', { f: '1e-50 x', g: '0' }, 17) as SurfaceSample
    expect(s.solid![0]).toBe(-0) // the single-precision grid did underflow
    const r = lines(s)
    expect(r['f-range']).toBe('f from −1e-50 to 1e-50 (sampled)')
    const g = geometryOf(s, false, { solid: true, wire: false })
    const zs = g.geo.surface!.positions.filter((_, i) => i % 3 === 2)
    expect(Math.min(...zs)).toBeCloseTo(-1, 6)
    expect(Math.max(...zs)).toBeCloseTo(1, 6)
  })
})

describe('review #4: a probability that rounds to 0 or 1 is not printed as 0 or 1', () => {
  it('4·10⁻⁴ is "< 0.001", 0.9996 is "> 0.999"; float residues and exact ends are "= 0", "= 1"', () => {
    expect(probText(4e-4)).toBe('< 0.001')
    expect(probText(0.9996)).toBe('> 0.999')
    expect(probText(0.0005)).toBe('= 0.001')
    expect(probText(3.749e-33)).toBe('= 0')
    expect(probText(1 - 2e-16)).toBe('= 1')
    expect(probText(0.5)).toBe('= 0.5')
    // on the Bloch path: θ = 2·acos(0.02) gives P(+z) = 4·10⁻⁴
    const th = 2 * Math.acos(0.02)
    const s = sampled('bloch', { bth: String(th), bph: '0' }, 17)
    expect(prob(KET['+z'], ketFromBloch(th, 0))).toBeCloseTo(4e-4, 15)
    expect(lines(s, { bloch: 0.5 }).pz).toBe('P(+z) < 0.001')
  })
})

describe('review #5: θ outside range', () => {
  it('θ = 3π/2, φ = 0 is |−x⟩: the note gives the point’s own angles (θ 90°, φ 180°), not only the polar one', () => {
    const s = sampled('bloch', { bth: 't', bph: '0' }, 65)
    // u = 0.75 on [0, 2π]: t = 3π/2
    expect(blochVector(ketFromBloch((3 * Math.PI) / 2, 0))[0]).toBeCloseTo(-1, 15)
    expect(lines(s, { bloch: 0.75 }).polar).toBe('θ is outside 0…180°: the point’s own angles are θ = 90°, φ = 180°')
  })
  it('θ = t/13 on [0, 13π] ends at π + 4e-16: inside (tolerance), the pole |−z⟩, where φ has no effect', () => {
    const s = sampled('bloch', { bth: 't/13', bph: 't', bt1: '13pi' }, 65)
    const c = cursorOf(s, { surface: [0, 0], curve: 0, bloch: 1 })
    if (c.kind !== 'bloch') throw new Error()
    expect(c.theta).toBeGreaterThan(Math.PI) // the float value really is past π
    expect(lines(s, { bloch: 1 }).polar).toBe('pole |−z⟩: φ has no effect')
  })
  it('θ = 2π lands on the pole |+z⟩: the outside note says so, and that φ has no effect', () => {
    const s = sampled('bloch', { bth: 't', bph: '1' }, 65)
    expect(lines(s, { bloch: 1 }).polar).toBe('θ is outside 0…180°: the point is the pole |+z⟩ (polar angle 0°), where φ has no effect')
    expect(BLOCH_PATH_FIDELITY.misleading.find((i) => i.id === 'lab-gr-bloch-angles')!.text).toMatch(/own angles/)
  })
})

describe('review #6: the fit note is conditional on “equal scale”', () => {
  it('"Unless “equal scale” is ticked, each axis is fitted to the box separately"', () => {
    const fit = GRAPH_FIDELITY.schematic.find((i) => i.id === 'lab-gr-fit')!.text
    expect(fit).toMatch(/^Unless “equal scale” is ticked, each axis is fitted to the box separately/)
  })
})

describe('review #7: curve ranges apply the float-residue rule, over 201 samples of the born preset', () => {
  it('sin t on [π, 2π] reads "from −1 to 0" (was "to 1.225e-16")', () => {
    const s = sampled('curve', { cx: 't', cy: 'sin t', cz: '0', ct0: 'pi', ct1: '2pi' }, 200)
    expect(lines(s)['y-range']).toBe('y(t) from −1 to 0 (sampled)')
  })
  it('born: 201 samples put t = π on a sample, so P(+z) = cos²(t/2) reads "from 0 to 1" (was 0.00006231, or 3.749e-33)', () => {
    expect(SETUPS.born.res).toBe(201)
    const s = sampled('curve', SETUPS.born.texts, SETUPS.born.res!)
    if (s.kind !== 'curve') throw new Error()
    expect(s.ts[100]).toBe(Math.PI)
    expect(s.ext![2][0]).toBeLessThan(1e-32) // the sample at π is a float residue
    expect(lines(s)['z-range']).toBe('z(t) from 0 to 1 (sampled)')
    expect(lines(s)['x-range']).toBe('x(t) from 0 to 6.283 (sampled)')
  })
})

describe('review #8: a deep link’s note shows only while the inputs are still that preset’s', () => {
  it('?preset=uncertainty then Helix: no uncertainty note above a helix', () => {
    expect(presetNote('uncertainty', 'uncertainty')).toBe(SETUPS.uncertainty.note)
    expect(presetNote('uncertainty', 'helix')).toBeUndefined()
    expect(presetNote('uncertainty', null)).toBeUndefined() // an edit clears the preset
    expect(presetNote(null, 'helix')).toBeUndefined()
    expect(presetNote('__proto__', '__proto__')).toBeUndefined()
  })
})

describe('review #9: the Try this does not answer itself before the student acts', () => {
  it('the bench opens on the Try this with the comparison closed: no "445", no "at no sample" in its readouts', () => {
    const p = INITIAL_PARAMS
    expect(p.preset).toBe('uncertainty')
    expect(p.compare).toBe(false)
    const s = sampleOf(p.committed.surface, p.a)
    const text = readoutsOf(s, geometryOf(s, p.equal, p.layers), cursorOf(s, p.cursor), p.layers, p.equal, p.compare).map((l) => l.text).join(' | ')
    expect(text).not.toMatch(/445|at no sample|touch|cross/)
    // opened, the comparison is there
    const open = readoutsOf(s, geometryOf(s, p.equal, p.layers), cursorOf(s, p.cursor), p.layers, p.equal, true).map((l) => l.text).join(' | ')
    expect(open).toMatch(/f = g exactly at 445 samples/)
    expect(open).toMatch(/f < g at no sample/)
  })
  it('"Set it up" closes the comparison again; the saddle opens with it', () => {
    grStore.set({ compare: true })
    applySetup('uncertainty')
    expect(grStore.get().compare).toBe(false)
    applySetup('saddle')
    expect(grStore.get().compare).toBe(true)
    applySetup('uncertainty')
  })
})

describe('review #10: the state’s label never sits on a pole label', () => {
  it('spiral at t = π/2 is |−x⟩: that pole’s label is hidden and ψ(t) = |−x⟩ is written on the bead', () => {
    const s = sampled('bloch', SETUPS.spiral.texts, SETUPS.spiral.res!, SETUPS.spiral.a)
    const c = cursorOf(s, { surface: [0, 0], curve: 0, bloch: 0.5 })
    if (c.kind !== 'bloch' || !c.r) throw new Error()
    const L = labelsOf(s, geometryOf(s, false, BOTH), BOTH, c.r)
    expect(L.map((l) => l.key)).not.toContain('pole-x')
    expect(L.filter((l) => l.key.startsWith('pole'))).toHaveLength(5)
    const psi = L.find((l) => l.key === 'psi')!
    expect(psi).toMatchObject({ prefix: 'ψ(t) = ', text: POLE_LABELS.spin['-x'], rich: true })
  })
  it('within 10° it says ≈; farther away the six poles and a plain ψ(t)', () => {
    const near = labelsOf(sampled('bloch', { bth: 'pi/2', bph: 't' }, 17), geometryOf(sampled('bloch', {}, 17), false, BOTH), BOTH, [Math.cos(0.1), Math.sin(0.1), 0])
    expect(near.find((l) => l.key === 'psi')).toMatchObject({ prefix: 'ψ(t) ≈ ', text: POLE_LABELS.spin['+x'] })
    expect(near.map((l) => l.key)).not.toContain('pole+x')
    const far = labelsOf(sampled('bloch', {}, 17), geometryOf(sampled('bloch', {}, 17), false, BOTH), BOTH, [Math.cos(0.2), Math.sin(0.2), 0])
    expect(far.filter((l) => l.key.startsWith('pole'))).toHaveLength(6)
    expect(far.find((l) => l.key === 'psi')).toMatchObject({ text: 'ψ(t)', rich: false })
  })
})

describe('review #11: the height ramp keeps 3:1 against the box floor and the Bloch stage (WCAG 1.4.11)', () => {
  const lin = (v: number) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4)
  const lum = (c: readonly number[]) => 0.2126 * lin(c[0]) + 0.7152 * lin(c[1]) + 0.0722 * lin(c[2])
  const ratio = (a: readonly number[], b: readonly number[]) => (Math.max(lum(a), lum(b)) + 0.05) / (Math.min(lum(a), lum(b)) + 0.05)
  const hex = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255)
  it('both ends, measured on the floor as drawn (its alpha over the graph stage) and on the Bloch stage', () => {
    const m = /const FLOOR = \{ hex: '(#[0-9a-f]{6})', alpha: ([0-9.]+) \}/.exec(grapherSceneSource)
    expect(m, 'grapherScene.ts FLOOR').not.toBeNull()
    const [fl, alpha] = [hex(m![1]), Number(m![2])]
    const floor = fl.map((v, i) => alpha * v + (1 - alpha) * hex(STAGE_BG['lab-r3'])[i])
    const bloch = hex(STAGE_BG.bloch)
    expect(RAMP_L).toEqual([50, 88])
    for (const u of [0, 1]) {
      expect(ratio(rampRgb(u), floor), `u ${u} on the floor`).toBeGreaterThanOrEqual(3)
      expect(ratio(rampRgb(u), bloch), `u ${u} on the Bloch stage`).toBeGreaterThanOrEqual(3)
      expect(ratio(rampRgb(u), hex(STAGE_BG['lab-r3'])), `u ${u} on the graph stage`).toBeGreaterThanOrEqual(3)
    }
    // the old dark end (L* 36) failed: 1.9:1 on the floor
    expect(ratio(rampRgb(0), floor)).toBeGreaterThan(3.1)
  })
})

describe('nits (review #12–17)', () => {
  it('review #13: "shade is height" only when the solid layer is drawn', () => {
    const s = sampled('surface', {}, 9, 0, { solid: false, wire: true })
    const wire = captionOf(geometryOf(s, false, { solid: false, wire: true }), s, { solid: false, wire: true })
    expect(wire).not.toMatch(/Shade is height/)
    expect(wire).toMatch(/one tone/)
    const both = sampled('surface', {}, 9)
    expect(captionOf(geometryOf(both, false, BOTH), both, BOTH)).toMatch(/^Shade is height/)
  })
  it('review #14: the answer says the relation gives ≥ and where it is saturated', () => {
    expect(TRY_THIS_ANSWER).not.toMatch(/as the uncertainty relation says/)
    expect(TRY_THIS_ANSWER).toMatch(/only promises \$\\ge\$/)
    expect(TRY_THIS_ANSWER).toMatch(/saturated exactly where \$r_x r_y = 0\$, on the \$xz\$ and \$yz\$ great circles/)
    // and it is true: f² − g² = rx² ry²/16 (model.test.ts checks 500 random states)
    const [rx, ry, rz] = blochVector(ketFromBloch(1.1, 0.7))
    expect((1 - rx ** 2) * (1 - ry ** 2) / 16 - rz ** 2 / 16).toBeCloseTo((rx * ry) ** 2 / 16, 15)
  })
  it('review #15: graph space opens from higher up (the scene and the < 900 px outline agree); the wire is drawn on top', () => {
    const el = /const GRAPH_EL = (\d+)/.exec(grapherSceneSource)
    expect(Number(el![1])).toBe(GRAPH_SHOT.el)
    expect(GRAPH_SHOT.el).toBeGreaterThan(22)
    expect(grapherSceneSource).toMatch(/surfMat\.zOffsetUnits = [1-9]/)
    expect(GRAPH_FIDELITY.schematic.map((i) => i.id)).toContain('lab-gr-wire-on-top')
  })
  it('review #16: the scale chip is short (it wrapped over the box at 1440)', () => {
    for (const eq of [false, true]) expect(scaleText(eq).length).toBeLessThanOrEqual(24)
  })
  it('review #17: a range end’s unknown-name reason mentions the functions (sqrt(2) works)', () => {
    const r = readRange('x', '1')
    if (r.ok) throw new Error()
    expect(r.err.reason).toBe('Unknown name “x”. Here you can use numbers, pi, e and the functions listed below (sqrt(2) works).')
    expect(readRange('sqrt(2)', '2')).toEqual({ ok: true, r: [Math.SQRT2, 2] })
    expect(parse('sqrt(2)', { mode: 'real' }).ok).toBe(true)
  })
})
