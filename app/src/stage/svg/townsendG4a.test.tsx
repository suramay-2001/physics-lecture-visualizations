/**
 * The Townsend-pass (G4a) stage additions: seven named `plot` curves, every y from physics/dynamics.ts — the ammonia pair's level in a field
 * (`ammoniaLevel`, `ammoniaLevelWeak`), the neutron interferometer's two ports (`spinFringe`, `spinFringeOther`) and Rabi's flip and ceiling
 * (`rabiFlip`, `rabiFlipOff`, `rabiPeak`). Defaults are untouched, so every older stage resolves as before.
 */
import { describe, expect, it } from 'vitest'
import type { PlotState } from '../../content/stage'
import { rabiPeak, rabiProbability, twoLevelEnergies } from '../../physics/dynamics'
import { validateStage } from '../resolve'
import { resolvePlotStage, validatePlotStage } from './plot'
import './kinds'

const pl = (x: Omit<PlotState, 'kind'>): PlotState => ({ kind: 'plot', ...x })
const close = (a: number, b: number, eps = 1e-12) => expect(Math.abs(a - b), `${a} vs ${b}`).toBeLessThan(eps)

describe('plot curves ammoniaLevel and ammoniaLevelWeak (Townsend Eqs. 4.58b, 4.59)', () => {
  it('the exact upper level √(1 + x²) beside its weak-field form 1 + x²/2: equal near 0, 1.4142 against 1.5 at x = 1', () => {
    const r = resolvePlotStage(pl({ curve: { fn: 'ammoniaLevel', vs: 'ammoniaLevelWeak', samples: 60 }, markers: [{ x: 0.3 }, { x: 1 }] }), 1)
    expect(r.range).toEqual({ from: 0, to: 3 })
    r.points.forEach((p) => close(p.y, twoLevelEnergies(p.x)[1]))
    close(r.markers[0].y, 1.0440306508910551, 1e-12)
    close(r.markers[0].yVs as number, 1.045, 1e-12)
    close(r.markers[1].y, Math.SQRT2, 1e-12)
    close(r.markers[1].yVs as number, 1.5, 1e-12)
    expect(r.xLabel).toBe('μ|E|/A')
    expect(r.names).toEqual({ fn: 'exact level', vs: 'weak-field form' })
    expect(r.yMin).toBeGreaterThan(0.5)
  })
})

describe('plot curves spinFringe and spinFringeOther (Townsend Fig. 4.4b)', () => {
  it('the two ports (1 ± cos(φ/2))/2 against φ/π: both at ½ at φ = 3π, the first full at 0 and 4π, empty at 2π; period 4π', () => {
    const r = resolvePlotStage(pl({ curve: { fn: 'spinFringe', vs: 'spinFringeOther', samples: 120 }, markers: [{ x: 0 }, { x: 2 }, { x: 3 }, { x: 4 }] }), 1)
    expect(r.range).toEqual({ from: 0, to: 12 })
    ;[1, 0, 0.5, 1].forEach((v, i) => close(r.markers[i].y, v))
    ;[0, 1, 0.5, 0].forEach((v, i) => close(r.markers[i].yVs as number, v))
    r.points.forEach((p) => close(p.y + (r.vs!.points.find((q) => q.x === p.x)!.y as number), 1))
    const at = (x: number) => r.points.find((p) => Math.abs(p.x - x) < 1e-9)!.y
    close(at(1), at(5)) // repeats after 4 (in units of π), not 2
    expect(Math.abs(at(1) - at(2))).toBeGreaterThan(0.1)
    expect(r.yMin).toBe(0)
    expect(r.yMax).toBe(1)
  })
})

describe('plot curves rabiFlip, rabiFlipOff and rabiPeak (Townsend Eqs. 4.44–4.45, Fig. 4.6)', () => {
  it('on resonance sin²(πx/2) for x = ω₁t/2π: 1 at x = 1, 0 at x = 2; one ω₁ off the ceiling is ⅕', () => {
    const r = resolvePlotStage(pl({ curve: { fn: 'rabiFlip', vs: 'rabiFlipOff', samples: 90 }, markers: [{ x: 1 }, { x: 2 }] }), 1)
    expect(r.range).toEqual({ from: 0, to: 3 })
    close(r.markers[0].y, 1)
    close(r.markers[1].y, 0)
    r.points.forEach((p) => close(p.y, rabiProbability(1, 1, 1, 2 * Math.PI * p.x)))
    expect(Math.max(...r.vs!.points.map((p) => p.y))).toBeLessThanOrEqual(0.2 + 1e-12)
    expect(Math.max(...r.vs!.points.map((p) => p.y))).toBeGreaterThan(0.19)
  })
  it('the resonance curve is the Lorentzian (¼)/(x² + ¼): 1, ½, ⅕ at x = 0, ½, 1 and symmetric', () => {
    const r = resolvePlotStage(pl({ curve: { fn: 'rabiPeak', samples: 120 }, markers: [{ x: 0 }, { x: 0.5 }, { x: 1 }] }), 1)
    expect(r.range).toEqual({ from: -3, to: 3 })
    ;[1, 0.5, 0.2].forEach((v, i) => close(r.markers[i].y, v))
    r.points.forEach((p) => close(p.y, rabiPeak(p.x)))
    close(rabiPeak(-1), rabiPeak(1))
    expect(r.xLabel).toBe('(ω₀−ω)/ω₁')
  })
  it('validates like the other named curves (markers inside the range)', () => {
    expect(validatePlotStage(pl({ curve: { fn: 'rabiPeak' }, markers: [{ x: 0 }], yLines: [{ y: 0.5, label: 'half' }] }))).toEqual([])
    expect(validateStage(pl({ curve: { fn: 'spinFringe' }, markers: [{ x: 20 }] })).join()).toMatch(/outside the drawn range/)
    expect(validateStage(pl({ curve: { fn: 'ammoniaLevel', vs: 'ammoniaLevel' } })).join()).toBeTruthy()
  })
})
