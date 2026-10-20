/**
 * The Townsend-pass (G4b) stage additions: the `box` source of the `wavefunction` kind (infinite walls at 0 and L; physics/wave.ts box functions) with its
 * `energy` readout, and four named `plot` curves from physics/scatter.ts: the step (`stepR`, `stepT`) and the barrier (`barrierT`, `barrierThick`).
 * Every older stage resolves as before: the existing wavefunction and plot tests are untouched.
 */
import { renderToString } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import type { PlotState, WavefunctionState } from '../../content/stage'
import { barrierT, barrierThick, stepRT } from '../../physics/scatter'
import { GRID, boxEnergy, boxPairEnergy, boxState, density, momentumMoments, norm } from '../../physics/wave'
import { interpolate } from '../interp'
import { resolve, validateStage } from '../resolve'
import type { ResolvedWavefunction } from '../types'
import { resolvePlotStage, validatePlotStage } from './plot'
import { wavefunctionReadouts } from './wavefunction'
import { WavefunctionScene } from './WavefunctionScene'
import './kinds'

const pl = (x: Omit<PlotState, 'kind'>): PlotState => ({ kind: 'plot', ...x })
const W = (box: { L: number; n: number | [number, number] }, o: Omit<WavefunctionState, 'kind' | 'source'> = {}): WavefunctionState => ({ kind: 'wavefunction', source: { box }, ...o })
const R = (st: WavefunctionState, s = 1) => resolve(st, s) as ResolvedWavefunction
const close = (a: number, b: number, eps = 1e-12) => expect(Math.abs(a - b), `${a} vs ${b}`).toBeLessThan(eps)

describe('wavefunction box source (Townsend §6.9)', () => {
  it('level 1 of a box 4 wide: the default window is [−1, 5], the walls are drawn at 0 and 4, ψ is the engine’s sine and zero outside', () => {
    const r = R(W({ L: 4, n: 1 }, { readouts: ['norm', 'xmean', 'xspread', 'pmean', 'pspread', 'product', 'peak', 'energy'] }))
    expect(r.window.x).toEqual([-1, 5])
    expect(r.walls).toEqual([0, 4])
    const eng = boxState(GRID, 4, 1)
    const j = r.position.x.findIndex((x) => Math.abs(x - 2) < 1e-9)
    close(r.position.re[j], Math.sqrt(2 / 4), 1e-12) // sin(π/2) at the middle
    close(r.position.density[j], 2 / 4, 1e-12)
    const outside = r.position.x.findIndex((x) => Math.abs(x + 0.5) < 1e-9)
    expect(r.position.re[outside]).toBe(0)
    close(r.stats.norm!, norm(eng, GRID), 1e-12)
    close(r.stats.energy!, boxEnergy(4, 1), 1e-15)
    close(r.stats.xmean!, 2, 1e-9)
    close(r.stats.pmean!, 0, 1e-6)
    close(r.stats.pspread!, momentumMoments(eng, GRID).spread, 1e-9)
    close(r.stats.pspread!, Math.PI / 4, 1e-2 * (Math.PI / 4))
    close(r.scale.dens, 0.5, 1e-15)
    expect(wavefunctionReadouts(r).map((x) => x.name)).toEqual(['norm', 'xmean', 'xspread', 'pmean', 'pspread', 'product', 'peak', 'energy'])
    expect(wavefunctionReadouts(r).at(-1)!.text).toBe('E = 0.308 ħ²/mℓ²')
  })
  it('a pair: ⟨E⟩ is the mean of the two levels, the density moves with time (each level turns by its own phase), a single level does not', () => {
    const pair = R(W({ L: 4, n: [1, 2] }, { time: 0.4, readouts: ['energy'] }))
    close(pair.stats.energy!, boxPairEnergy(4, 1, 2), 1e-15)
    expect(wavefunctionReadouts(pair)[0].text).toMatch(/^⟨E⟩ = /)
    const now = R(W({ L: 4, n: [1, 2] }, { time: 0.4 }))
    const later = R(W({ L: 4, n: [1, 2] }, { time: 1.2 }))
    expect(Math.max(...now.position.density.map((v, i) => Math.abs(v - later.position.density[i])))).toBeGreaterThan(0.05)
    const single0 = R(W({ L: 4, n: 3 }, { time: 0 }))
    const single1 = R(W({ L: 4, n: 3 }, { time: 2.5 }))
    single0.position.density.forEach((v, i) => close(v, single1.position.density[i], 1e-12))
    close(norm(boxState(GRID, 4, [1, 2], 1.7), GRID), 1, 5e-3)
    const d = density(boxState(GRID, 4, [1, 2], 0.4))
    close(d[GRID.n / 2 + 128], now.position.density[now.position.x.findIndex((x) => Math.abs(x - 2) < 1e-9)], 1e-12)
  })
  it('the momentum panel is the transform of the box state; the scene draws the walls and has no NaN; interpolation switches between boxes at the half-way point', () => {
    const r = R(W({ L: 4, n: 1 }, { panels: ['position', 'momentum'] }))
    expect(r.momentum).not.toBeNull()
    const html = renderToString(<WavefunctionScene state={r} mode="stage" width={420} height={460} />)
    expect(html).not.toMatch(/NaN/)
    expect((html.match(/stroke-width="2.4"/g) ?? []).length).toBe(2)
    const a = R(W({ L: 2, n: 1 }))
    const b = R(W({ L: 4, n: 1 }))
    expect(interpolate(a, b, 0.25)).toBeDefined()
    expect(((interpolate(a, b, 0.25) as ResolvedWavefunction).inputs.source as { L: number }).L).toBeCloseTo(2.5, 10)
    expect(((interpolate(a, R(W({ L: 4, n: 2 })), 0.75) as ResolvedWavefunction).inputs.source as { n: number }).n).toBe(2)
  })
  it('validation: L from 2 to 16, n whole from 1 to 8, a pair of two different levels; no boost, shift, cells, interval or overlay; energy only for a box', () => {
    const bad = (st: WavefunctionState) => validateStage(st).join(' | ')
    expect(bad(W({ L: 4, n: 1 }))).toBe('')
    expect(bad(W({ L: 1, n: 1 }))).toMatch(/box L/)
    expect(bad(W({ L: 20, n: 1 }))).toMatch(/box L/)
    expect(bad(W({ L: 4, n: 0 }))).toMatch(/box n/)
    expect(bad(W({ L: 4, n: 9 }))).toMatch(/box n/)
    expect(bad(W({ L: 4, n: [2, 2] }))).toMatch(/must differ/)
    expect(bad(W({ L: 4, n: 1 }, { boost: 1 }))).toMatch(/box source takes no boost/)
    expect(bad(W({ L: 4, n: 1 }, { shift: 1 }))).toMatch(/box source takes no shift/)
    expect(bad(W({ L: 4, n: 1 }, { cells: 8 }))).toMatch(/box source takes no cells/)
    expect(bad(W({ L: 4, n: 1 }, { interval: [0, 1] }))).toMatch(/takes no interval/)
    expect(bad(W({ L: 4, n: 1 }, { overlay: ['xpsi'] }))).toMatch(/takes no overlay/)
    expect(bad(W({ L: 4, n: 1 }, { readouts: ['cell'] }))).toMatch(/not defined for a box/)
    expect(bad({ kind: 'wavefunction', source: { plane: { p: 2 } }, readouts: ['energy'] })).toMatch(/needs a box source/)
    expect(bad({ kind: 'wavefunction', source: { box: { L: 4, n: 1 }, plane: { p: 2 } } as unknown as WavefunctionState['source'] })).toMatch(/exactly one/)
  })
})

describe('plot curves stepR, stepT, barrierT and barrierThick (Townsend Eqs. 6.135, 6.144, 6.146)', () => {
  it('the step: R + T = 1 above V0, R = 1 and T = 0 below it; E = 2V0 gives 0.0294 and 0.9706', () => {
    const r = resolvePlotStage(pl({ curve: { fn: 'stepT', vs: 'stepR', samples: 80 }, markers: [{ x: 0.5 }, { x: 2 }, { x: 3 }] }), 1)
    expect(r.range).toEqual({ from: 0.2, to: 4 })
    close(r.markers[0].y, 0)
    close(r.markers[1].y, stepRT(2, 1).T)
    close(r.markers[1].yVs as number, stepRT(2, 1).R)
    close(r.markers[1].y + (r.markers[1].yVs as number), 1)
    close(r.markers[2].y, 0.9897948556635616, 1e-12)
    r.points.forEach((p) => close(p.y, stepRT(p.x, 1).T))
    expect(r.xLabel).toBe('E/V₀')
    expect(r.names).toEqual({ fn: 'transmitted', vs: 'reflected' })
  })
  it('the barrier of E/V0 = ½: the exact T is 1/cosh² qa, the thick form is 4e^{−2qa} and meets it from above for qa near 3; the book’s qa = 0.607 gives about 0.71', () => {
    const r = resolvePlotStage(pl({ curve: { fn: 'barrierT', vs: 'barrierThick', x: { from: 1, to: 4 }, samples: 60 }, markers: [{ x: 3 }] }), 1)
    close(r.markers[0].y, barrierT(0.5, 1, 3), 1e-12)
    close(r.markers[0].y, 1 / Math.cosh(3) ** 2, 1e-12)
    close(r.markers[0].yVs as number, barrierThick(0.5, 1, 3), 1e-12)
    close(r.markers[0].yVs as number, 4 * Math.exp(-6), 1e-12)
    expect(r.markers[0].yVs as number).toBeGreaterThan(r.markers[0].y)
    const book = resolvePlotStage(pl({ curve: { fn: 'barrierT' }, markers: [{ x: 0.607 }] }), 1)
    expect(book.range).toEqual({ from: 0, to: 4 })
    close(book.markers[0].y, 1 / Math.cosh(0.607) ** 2, 1e-12)
    expect(book.markers[0].y).toBeGreaterThan(0.70)
    expect(book.markers[0].y).toBeLessThan(0.72)
    expect(book.xLabel).toBe('qa')
  })
  it('validates like the other named curves', () => {
    expect(validatePlotStage(pl({ curve: { fn: 'stepR' }, markers: [{ x: 1 }] }))).toEqual([])
    expect(validateStage(pl({ curve: { fn: 'barrierT' }, markers: [{ x: 9 }] })).join()).toMatch(/outside the drawn range/)
    expect(validateStage(pl({ curve: { fn: 'stepT', vs: 'stepT' } })).join()).toBeTruthy()
  })
})
