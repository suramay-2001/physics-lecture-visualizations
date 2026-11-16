/**
 * The Lecture 19 and 20 stage additions (ruling R3 of docs/roles/decisions/448-L19L20.md): the `wavefunction` sources `barrierWave` and `well`, their readouts (`reflection`, `transmission`,
 * `tail`, and the existing `norm` and `energy` for a well), every refusal (each message names the field), interpolation, the scene in every mode, and the `plot` curves `wellMatchEven` and
 * `wellMatchOdd`. Every number is checked against the engine (physics/wave19.ts, wave20.ts, themselves checked against numpy in their own tests).
 */
import { renderToString } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { fidelityOf } from '../../content/fidelity'
import type { PlotState, WavefunctionState } from '../../content/stage'
import { ANCHORS } from '../../content/stageVocab'
import { barrierStateSamples, transmissionAmplitude } from '../../physics/wave19'
import { wellCount, wellLevels, wellMismatch, wellStateSamples, wellTail } from '../../physics/wave20'
import { interpolate } from '../interp'
import { resolve, validateStage } from '../resolve'
import type { ResolvedWavefunction } from '../types'
import { resolvePlotStage, validatePlotStage } from './plot'
import { wavefunctionReadouts } from './wavefunction'
import { WavefunctionScene } from './WavefunctionScene'
import './kinds'

const W = (o: Omit<WavefunctionState, 'kind'>): WavefunctionState => ({ kind: 'wavefunction', ...o })
const R = (st: WavefunctionState, s = 1) => resolve(st, s) as ResolvedWavefunction
const close = (a: number, b: number, eps = 1e-12) => expect(Math.abs(a - b), `${a} vs ${b}`).toBeLessThan(eps)
const BW = (E = 2, V0 = 4, a = 0.5, o: Partial<WavefunctionState> = {}): WavefunctionState => W({ source: { barrierWave: { E, V0, a } }, readouts: ['reflection', 'transmission'], ...o })
const WL = (V0 = 8, a = 2, n = 1, o: Partial<WavefunctionState> = {}): WavefunctionState => W({ source: { well: { V0, a, n } }, readouts: ['norm', 'energy', 'tail'], ...o })
const errs = (st: WavefunctionState) => validateStage(st).join(' | ')

describe('barrierWave: the stationary state of the barrier', () => {
  it('draws the engine’s ψ on the default window [−6, a + 6] and reads |r|² and |τ|² from the engine', () => {
    const r = R(BW())
    expect(r.window.x).toEqual([-6, 6.5])
    const w = barrierStateSamples(r.position.x, 2, 4, 0.5)
    r.position.x.forEach((_, j) => {
      close(r.position.re[j], w.re[j])
      close(r.position.im[j], w.im[j])
      close(r.position.density[j], w.re[j] ** 2 + w.im[j] ** 2)
    })
    const t = transmissionAmplitude(2, 4, 0.5)
    close(r.stats.reflection!, t.R)
    close(r.stats.transmission!, t.T)
    close(t.T, 0.42, 5e-5)
    const lines = wavefunctionReadouts(r).map((o) => o.text)
    expect(lines).toEqual(['R = |r|² = 0.58', 'T = |τ|² = 0.42'])
    expect(r.stats.norm).toBeNull()
    expect(r.stats.energy).toBeNull()
  })
  it('the profile is the barrier with the E line (named E), edges at 0 and a; the scales cover the state', () => {
    const r = R(BW(2, 4, 0.5))
    expect(r.profile!.kind).toBe('barrier')
    expect(r.profile!.energy).toBe(2)
    expect(r.profile!.energyLabel).toBe('E')
    expect(r.profile!.edges).toEqual([0, 0.5])
    expect(Math.max(...r.profile!.v)).toBe(4)
    expect(r.scale.dens).toBeGreaterThanOrEqual(Math.max(...r.position.density))
    expect(r.scale.amp).toBeGreaterThanOrEqual(Math.max(...r.position.re.map(Math.abs)))
    expect(r.walls).toBeNull()
    expect(r.momentum).toBeNull()
  })
  it('accepts the range 0 < E < V0 <= 8, 0.1 <= a <= 4 and every shown curve', () => {
    for (const [E, V0, a] of [[0.01, 8, 0.1], [7.99, 8, 4], [3, 3.5, 2]]) expect(validateStage(BW(E, V0, a))).toEqual([])
    expect(validateStage(BW(2, 4, 0.5, { show: ['density'], window: { x: [-4, 5] } }))).toEqual([])
  })
  it('refuses a number outside the range, naming the field', () => {
    expect(errs(BW(4, 4, 1))).toMatch(/barrierWave E: below V0/)
    expect(errs(BW(5, 4, 1))).toMatch(/barrierWave E: below V0/)
    expect(errs(BW(0, 4, 1))).toMatch(/barrierWave E: above 0/)
    expect(errs(BW(2, 9, 1))).toMatch(/barrierWave V0: above 0 and at most 8/)
    expect(errs(BW(2, 4, 0.05))).toMatch(/barrierWave a: between 0.1 and 4/)
    expect(errs(BW(2, 4, 4.5))).toMatch(/barrierWave a: between 0.1 and 4/)
    expect(errs(BW(Number.NaN, 4, 1))).toMatch(/barrierWave E: a finite number/)
  })
  it('refuses norm, time, boost, shift, cells, interval, overlay, potential and a momentum panel, each message naming the field', () => {
    expect(errs(BW(2, 4, 0.5, { readouts: ['norm'] }))).toMatch(/'norm' is refused with a barrierWave source/)
    expect(errs(BW(2, 4, 0.5, { time: 1 }))).toMatch(/wavefunction time: refused with a barrierWave source/)
    expect(errs(BW(2, 4, 0.5, { boost: 1 }))).toMatch(/wavefunction boost: refused/)
    expect(errs(BW(2, 4, 0.5, { shift: 1 }))).toMatch(/wavefunction shift: refused/)
    expect(errs(BW(2, 4, 0.5, { cells: 8 }))).toMatch(/wavefunction cells: refused/)
    expect(errs(BW(2, 4, 0.5, { interval: [0, 1] }))).toMatch(/wavefunction interval: refused/)
    expect(errs(BW(2, 4, 0.5, { overlay: ['original'] }))).toMatch(/wavefunction overlay: refused/)
    expect(errs(BW(2, 4, 0.5, { potential: { step: { V0: 1 } } }))).toMatch(/wavefunction potential: refused/)
    expect(errs(BW(2, 4, 0.5, { panels: ['position', 'momentum'] }))).toMatch(/wavefunction panels:/)
    expect(errs(BW(2, 4, 0.5, { show: ['phase'] }))).toMatch(/wavefunction show:/)
    expect(errs(BW(2, 4, 0.5, { readouts: ['energy'] }))).toMatch(/"energy" is not defined for a barrierWave source/)
    expect(errs(BW(2, 4, 0.5, { readouts: ['tail'] }))).toMatch(/"tail" is not defined for a barrierWave source/)
    expect(errs(BW(2, 4, 0.5, { readouts: ['reflection', 'reflection'] }))).toMatch(/each once/)
  })
  it('interpolates E, V0 and a (a sweep is never snapped); the ends are the resolved states themselves', () => {
    const a = R(BW(1, 4, 0.5))
    const b = R(BW(3, 4, 1.5))
    const m = interpolate(a, b, 0.5) as ResolvedWavefunction
    close(m.stats.transmission!, transmissionAmplitude(2, 4, 1).T)
    expect(interpolate(a, b, 0)).toBe(a)
    expect(interpolate(a, b, 1)).toBe(b)
  })
})

describe('well: a bound level of the finite well', () => {
  it('draws the engine’s normalised φ on the default window [−a, a]; norm, energy and tail are the engine’s', () => {
    for (const n of [1, 2, 3]) {
      const r = R(WL(8, 2, n))
      expect(r.window.x).toEqual([-2, 2])
      const w = wellStateSamples(r.position.x, 8, 2, n)
      r.position.x.forEach((_, j) => {
        close(r.position.re[j], w[j])
        close(r.position.im[j], 0)
      })
      close(r.stats.energy!, wellLevels(8, 2)[n - 1].E)
      close(r.stats.tail!, wellTail(8, 2, n))
      close(r.stats.norm!, 1, 1e-6)
      expect(r.stats.reflection).toBeNull()
    }
    const lines = wavefunctionReadouts(R(WL(8, 2, 1))).map((o) => o.text)
    expect(lines).toEqual(['∫|ψ|²dx = 1', 'E = 0.784 ħ²/mℓ²', 'P(|x| > 1) = 0.0204'])
  })
  it('a window wider than the well shows the tails; the profile is the well with the E line at the level', () => {
    const r = R(WL(8, 2, 3, { window: { x: [-4, 4] } }))
    expect(r.window.x).toEqual([-4, 4])
    expect(r.profile!.kind).toBe('well')
    close(r.profile!.energy!, 6.4631, 5e-5)
    expect(r.profile!.edges).toEqual([-1, 1])
    expect(Math.max(...r.profile!.v)).toBe(8)
    expect(Math.min(...r.profile!.v)).toBe(0)
  })
  it('has no current readout (it is not in the vocabulary); a well takes the same refusals as the barrier', () => {
    expect(errs(WL(8, 2, 1, { readouts: ['current' as never] }))).toMatch(/unknown "current"/)
    expect(errs(WL(8, 2, 1, { readouts: ['reflection'] }))).toMatch(/"reflection" is not defined for a well source/)
    for (const [f, v] of [['time', 1], ['boost', 1], ['shift', 1], ['cells', 8], ['interval', [0, 1]], ['overlay', ['original']], ['potential', { step: { V0: 1 } }]] as const) {
      expect(errs(WL(8, 2, 1, { [f]: v } as Partial<WavefunctionState>)), f).toMatch(new RegExp(`wavefunction ${f}: refused with a well source`))
    }
    expect(errs(WL(8, 2, 1, { panels: ['momentum'] }))).toMatch(/wavefunction panels:/)
  })
  it('accepts n from 1 to the count of bound levels and refuses beyond it, a non-integer n and out-of-range V0 and a', () => {
    for (const [V0, a] of [[8, 2], [8, 6], [1, 1], [2, 4]]) for (let n = 1; n <= wellCount(V0, a); n++) expect(validateStage(WL(V0, a, n)), `${V0} ${a} ${n}`).toEqual([])
    expect(errs(WL(8, 2, 4))).toMatch(/well n: at most 3/)
    expect(errs(WL(8, 2, 0))).toMatch(/well n: a whole number from 1/)
    expect(errs(WL(8, 2, 1.5))).toMatch(/well n: a whole number from 1/)
    expect(errs(WL(9, 2, 1))).toMatch(/well V0: above 0 and at most 8/)
    expect(errs(WL(8, 0.5, 1))).toMatch(/well a: between 1 and 6/)
    expect(errs(WL(8, 7, 1))).toMatch(/well a: between 1 and 6/)
  })
  it('interpolates V0 and a at one level; a level that would stop being bound switches at the half-way point instead of throwing', () => {
    const a = R(WL(8, 2, 3))
    const b = R(WL(8, 3, 3))
    const m = interpolate(a, b, 0.5) as ResolvedWavefunction
    close(m.stats.energy!, wellLevels(8, 2.5)[2].E)
    const c = R(WL(8, 6, 8))
    const d = R(WL(1, 1, 1))
    expect(() => interpolate(c, d, 0.25)).not.toThrow()
    expect(() => interpolate(d, c, 0.75)).not.toThrow()
  })
})

describe('the scene', () => {
  const draw = (r: ResolvedWavefunction, mode: 'stage' | 'print', w: number, h: number, bare = false) =>
    renderToString(
      <svg viewBox={`0 0 ${w} ${h}`}>
        <WavefunctionScene state={r} mode={mode} width={w} height={h} bare={bare} />
      </svg>,
    )
  it('draws both sources in every mode with the V profile, the E line and no NaN; the print size is the single-panel size', () => {
    for (const st of [BW(), WL(8, 2, 1), WL(8, 2, 3, { window: { x: [-4, 4] } })]) {
      const r = R(st)
      for (const [mode, w, h, bare] of [['stage', 380, 560, false], ['stage', 640, 560, false], ['stage', 560, 440, true], ['print', 320, 300, false]] as const) {
        const html = draw(r, mode, w, h, bare)
        expect(html, `${mode} ${w}x${h}`).not.toMatch(/NaN|Infinity|undefined/)
        expect(html).toContain('data-anchor="potential"')
        expect(html).toContain('V(x)')
        expect(html).not.toContain('⟨p⟩²/2')
        expect(html).toContain('>E<')
      }
    }
  })
  it('lists the new fidelity ids and keeps the shared anchors', () => {
    const ids = fidelityOf('wavefunction').exact.map((n) => n.id)
    expect(ids).toContain('wavefunction-barrier-stationary')
    expect(ids).toContain('wavefunction-well-eigen')
    expect(fidelityOf('plot').exact.map((n) => n.id)).toContain('plot-well-match')
    expect(ANCHORS.wavefunction).toContain('potential')
  })
})

describe('plot curves wellMatchEven and wellMatchOdd (z0 = 4: V0 = 8, a = 2)', () => {
  const pl = (x: Omit<PlotState, 'kind'>): PlotState => ({ kind: 'plot', ...x })
  const E = wellLevels(8, 2)
  it('each curve is the engine’s mismatch against E/V0 on [0, 1], within [−1, 1], with the labels E/V₀ and the curve names', () => {
    const r = resolvePlotStage(pl({ curve: { fn: 'wellMatchEven', vs: 'wellMatchOdd', samples: 101 } }), 1)
    expect(r.range).toEqual({ from: 0, to: 1 })
    r.points.forEach((p) => close(p.y, wellMismatch(p.x * 8, 8, 2, 'even')))
    r.vs!.points.forEach((p) => close(p.y, wellMismatch(p.x * 8, 8, 2, 'odd')))
    for (const p of [...r.points, ...r.vs!.points]) expect(Math.abs(p.y)).toBeLessThanOrEqual(1 + 1e-12)
    expect(r.xLabel).toBe('E/V₀')
    expect(r.names).toEqual({ fn: 'even match', vs: 'odd match' })
    expect(r.yMin).toBeLessThan(0)
  })
  it('markers at the engine’s levels sit on zero of their own curve (0.7842 and 6.4631 even, 3.0618 odd)', () => {
    const r = resolvePlotStage(pl({ curve: { fn: 'wellMatchEven', vs: 'wellMatchOdd' }, markers: E.map((l) => ({ x: l.E / 8 })) }), 1)
    r.markers.forEach((m, i) => close(E[i].parity === 'even' ? m.y : (m.yVs as number), 0, 1e-11))
    close(E[0].E, 0.7842, 5e-5)
    close(E[1].E, 3.0618, 5e-5)
    close(E[2].E, 6.4631, 5e-5)
    expect(r.markers[0].y).toBeCloseTo(0, 9)
    expect(Math.abs(r.markers[0].yVs as number)).toBeGreaterThan(0.1)
  })
  it('validates alone, with markers inside [0, 1] and refuses a marker outside the range', () => {
    expect(validatePlotStage(pl({ curve: { fn: 'wellMatchOdd' }, markers: [{ x: 0.5 }] }))).toEqual([])
    expect(validateStage(pl({ curve: { fn: 'wellMatchEven' }, markers: [{ x: 1.5 }] })).length).toBeGreaterThan(0)
  })
})
