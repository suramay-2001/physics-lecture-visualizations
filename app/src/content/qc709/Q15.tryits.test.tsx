/**
 * Chapter Q15's Try-it lines against the REAL widgets (P-Q15 plan §3; the rulings ask for stand-ins checked against the widget code). Each unit's `visual` names a
 * widget and the props it passes; each `tryThis` line quotes what that widget draws. Two checks keep a line true:
 *  1. every prop is one the widget declares (the widget's own `…Props` interface, read from its source);
 *  2. every readout a line quotes is what the widget really renders: the bench's lines come from its own `benchModel` (the pure function behind its
 *     controls: Send, compare bases, Eve, New run), the sphere's and the pair table's by rendering them to markup and comparing the text.
 * The numbers a line quotes after an action (a new run's kept count, a state set to φ = 180°, "no Eve") are recomputed here through the widgets' own engine calls.
 */
import { renderToString } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import Bb84Bench, { benchModel } from '../../widgets/Bb84Bench'
import bb84Src from '../../widgets/Bb84Bench.tsx?raw'
import { BlochSphere } from '../../widgets/BlochSphere'
import blochSrc from '../../widgets/BlochSphere.tsx?raw'
import PairGrid from '../../widgets/PairGrid'
import pairSrc from '../../widgets/PairGrid.tsx?raw'
import { binomialStd } from '../../physics/random'
import { udFamily } from '../../physics/qc/state'
import type { Unit } from '../schema'
import { Q15 } from './Q15'
import { CH_MINUS, CH_PLUS, V } from './Q15.values'

const unit = (id: string): Unit => Q15.units.find((u) => u.id === id)!

/** The text of a server-rendered widget, markup and comment separators removed. */
const text = (html: string): string =>
  html
    .replace(/&amp;/g, '&')
    .replace(/&#x27;/g, "'")
    .replace(/<!--.*?-->/g, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')

const declared = (src: string): string[] => {
  const body = /export interface \w+Props\s*\{([\s\S]*?)\n\}/.exec(src)?.[1] ?? ''
  return [...body.matchAll(/^\s*(\w+)\??:/gm)].map((m) => m[1])
}
const WIDGET_SRC: Record<string, string> = { 'bb84-bench': bb84Src, bloch: blochSrc, 'pair-grid': pairSrc }
const lines = (id: string): string => unit(id).visual.tryThis.join(' ')

describe('Q15 Try-its: every prop reaches the widget', () => {
  it.each(Q15.units.map((u) => [u.id, u] as const))('%s: its visual passes only props the widget declares', (_, u) => {
    const src = WIDGET_SRC[u.visual.kind]
    expect(src, `${u.id}: add the widget kind "${u.visual.kind}" to WIDGET_SRC`).toBeDefined()
    expect(Object.keys(u.visual.props ?? {}).filter((k) => !declared(src).includes(k)), `${u.id}: props the "${u.visual.kind}" widget ignores`).toEqual([])
  })
  it('reads the declared props of the widgets', () => {
    expect(declared(bb84Src)).toEqual(['eve', 'seed', 'testSize', 'editable'])
    expect(declared(blochSrc)).toEqual(['theta', 'phi', 'editable', 'measure', 'rotations', 'rotationAngles', 'landmarks'])
    expect(declared(pairSrc)).toEqual(['mode', 'frame', 'alice', 'bob', 'preset', 't', 'coins', 'pA', 'pB', 'showDet'])
  })
})

describe('Q15 Try-it: the pad unit (bb84-bench, no Eve, seed 84)', () => {
  const u = unit('q15-otp')
  it('the bench starts empty with the controls the lines name: Send 100, compare bases, New run', () => {
    const html = text(renderToString(<Bb84Bench {...(u.visual.props as object)} />))
    expect(html).toContain('No photons sent yet')
    expect(html).toContain('Send 1000')
    expect(html).toContain('New run')
    expect(html).toContain('compare bases')
    expect(bb84Src).toContain("{ value: 'off', label: 'no Eve' }")
  })
  it('Send 100 with the bases compared keeps 50 of the 100 (seed 84); a New run (the next seed) keeps 51 of its 100', () => {
    const p = u.visual.props as { seed: number; eve: 'off' | 'all' }
    expect(benchModel({ sent: 100, seed: p.seed, eve: p.eve, sift: true, m: 0 }).lines).toContain('kept 50 of 100')
    expect(benchModel({ sent: 100, seed: p.seed + 1, eve: p.eve, sift: true, m: 0 }).lines).toContain('kept 51 of 100')
    const t = lines('q15-otp')
    expect(t).toContain('kept 50 of 100')
    expect(t).toContain('51 bits are kept')
  })
})

describe('Q15 Try-it: the BB84 unit (bb84-bench, Eve on every photon, seed 84)', () => {
  const u = unit('q15-bb84')
  const p = u.visual.props as { seed: number; eve: 'off' | 'all' }
  it('1000 photons with the bases compared: the wrong share reads 0.269 against the exact error rate 0.25, 1σ band ±0.019, inside two bands', () => {
    const m = benchModel({ sent: 1000, seed: p.seed, eve: p.eve, sift: true, m: 0 })
    expect(m.lines).toContain('kept bits wrong 0.269')
    expect(m.lines).toContain('exact error rate 0.25')
    expect(m.lines).toContain('1σ band ±0.019')
    expect(Math.abs(0.269 - V.q15BridgeQ)).toBeLessThan(2 * binomialStd(m.kept, V.q15BridgeQ) / m.kept)
    const t = lines('q15-bb84')
    expect(t).toContain('reads 0.269')
    expect(t).toContain('exact error rate 0.25')
    expect(t).toContain('±0.019')
  })
  it('with no Eve the same photons give a wrong share of 0', () => {
    expect(benchModel({ sent: 1000, seed: p.seed, eve: 'off', sift: true, m: 0 }).lines).toContain('kept bits wrong 0')
    expect(lines('q15-bb84')).toContain('drops to 0')
    expect(bb84Src).toContain("label: 'Eve on every photon'")
  })
})

describe('Q15 Try-it: the B92 unit (bloch at θ = 90°, φ = 0°, measuring z)', () => {
  const html = text(renderToString(<BlochSphere {...(unit('q15-b92').visual.props as object)} />))
  it('the +z bar reads 50.0%, and |α|², |β|² read 1/2, 1/2: the overlap |⟨0|+⟩| = 0.71 and success 1 − 0.71 = 0.29', () => {
    expect(html).toContain('+z 50.0%')
    expect(html).toContain('|α|², |β|² 1/2, 1/2')
    expect(V.q15Overlap.toFixed(2)).toBe('0.71')
    expect((1 - Number(V.q15Overlap.toFixed(2))).toFixed(2)).toBe('0.29')
    expect(V.q15B92Kept.toFixed(2)).toBe('0.29')
    const t = lines('q15-b92')
    expect(t).toContain('+z bar reads 50.0%')
    expect(t).toContain('= 0.71')
    expect(t).toContain('= 0.29')
  })
  it('at θ = 0° the state is |0⟩ itself: the +z bar reads 100.0%', () => {
    const at0 = text(renderToString(<BlochSphere theta={0} phi={0} editable measure="z" landmarks />))
    expect(at0).toContain('+z 100.0%')
    expect(lines('q15-b92')).toContain('At θ = 0° the state is |0⟩ itself')
  })
})

describe('Q15 Try-it: the E91 unit (pair-grid, the ud–du family at t = 45°)', () => {
  const html = text(renderToString(<PairGrid {...(unit('q15-e91').visual.props as object)} />))
  it('at t = 45° only the boxes ud and du hold weight (±1/√2 and nothing in uu or dd); the table says so and the singlet is the engine’s', () => {
    expect(html).toContain('0 1/√2 −1/√2 0')
    const psi = udFamily((45 * Math.PI) / 180)
    expect(Math.abs(psi[0].re) + Math.abs(psi[3].re)).toBeLessThan(1e-12)
    expect(psi[1].re).toBeCloseTo(Math.SQRT1_2, 12)
    expect(psi[2].re).toBeCloseTo(-Math.SQRT1_2, 12)
    const t = lines('q15-e91')
    expect(t).toContain('At t = 45°')
    expect(t).toContain('|ud⟩ and |du⟩')
  })
  it('at any t the boxes uu and dd stay empty (the family is cos t |ud⟩ − sin t |du⟩) and the weights are cos² t and sin² t', () => {
    for (const tDeg of [10, 30, 45, 60, 80]) {
      const psi = udFamily((tDeg * Math.PI) / 180)
      expect(Math.abs(psi[0].re) + Math.abs(psi[3].re)).toBeLessThan(1e-12)
      expect(psi[1].re ** 2).toBeCloseTo(Math.cos((tDeg * Math.PI) / 180) ** 2, 12)
    }
    expect(lines('q15-e91')).toContain('|uu⟩ and |dd⟩ stay empty')
  })
})

describe('Q15 Try-it: the sharing unit (bloch at θ = 45°, φ = 0°, measuring x: Charlie’s |ψ₊⟩)', () => {
  const props = unit('q15-sharing').visual.props as { theta: number; phi: number }
  const plus = text(renderToString(<BlochSphere {...(props as object)} />))
  const minus = text(renderToString(<BlochSphere {...(props as object)} phi={180} />))
  it('is the Bloch direction of Charlie’s two states: the engine’s |ψ₊⟩ sits at (45°, 0°) and |ψ₋⟩ at (45°, 180°)', () => {
    expect([props.theta, props.phi]).toEqual([CH_PLUS.thetaDeg, CH_PLUS.phiDeg])
    expect([CH_MINUS.thetaDeg, CH_MINUS.phiDeg]).toEqual([45, 180])
  })
  it('the +x bar reads 85.4% for |ψ₊⟩ and 14.6% at φ = 180° (|ψ₋⟩); |α|², |β|² read 0.854, 0.146 for both; the engine agrees', () => {
    expect(plus).toContain('+x 85.4%')
    expect(minus).toContain('+x 14.6%')
    expect(plus).toContain('|α|², |β|² 0.854, 0.146')
    expect(minus).toContain('|α|², |β|² 0.854, 0.146')
    expect((100 * V.q15SharePxPlus).toFixed(1)).toBe('85.4')
    expect((100 * V.q15SharePxMinus).toFixed(1)).toBe('14.6')
    expect(V.q15ShareAlpha2.toFixed(3)).toBe('0.854')
    const t = lines('q15-sharing')
    expect(t).toContain('85.4%')
    expect(t).toContain('14.6%')
    expect(t).toContain('0.854 and 0.146')
  })
})
