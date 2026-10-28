/**
 * The nine plot curves of Chapter Q24 (P-Q24-story §9.2 S2): `popDecay`, `cohDecay`, `steadyLow`, `steadyHigh`, `ouSlow`, `ouFast`, `echoOuSlow`, `pulseErr1`, `pulseErr2`. Every y is the engine's
 * (physics/qc/blocheq.ts, pulses.ts); the values are checked against the numpy/scipy twin (__fixtures__/qc-q24.json) and the closed forms.
 */
import { describe, expect, it } from 'vitest'
import raw from '../../physics/__fixtures__/qc-q24.json?raw'
import type { PlotCurveName, PlotState } from '../../content/stage'
import { resolve } from '../resolve'
import type { ResolvedPlot } from '../types'
import './kinds'

const FX: any = JSON.parse(raw)
const pl = (fn: PlotCurveName, o: Omit<PlotState, 'kind' | 'curve'> & { curve?: Partial<NonNullable<PlotState['curve']>> } = {}): PlotState => ({
  kind: 'plot',
  ...o,
  curve: { fn, ...(o.curve ?? {}) },
})
const R = (st: PlotState) => resolve(st, 1) as ResolvedPlot
const close = (a: number, b: number, eps = 1e-9) => expect(Math.abs(a - b), `${a} vs ${b}`).toBeLessThan(eps)

describe('Q24 curves: the engine’s numbers', () => {
  it('popDecay is e^-x and cohDecay is e^(-x/2) over x = t/T1 = 0 … 5; at 1 the values are 0.368 and 0.607 and at 2 the phase signal is 0.368', () => {
    const a = R(pl('popDecay', { curve: { vs: 'cohDecay', x: { from: 0, to: 5 }, samples: 50 }, markers: [{ x: 1 }, { x: 2 }] }))
    expect(a.names).toEqual({ fn: 'population', vs: 'phase signal' })
    expect(a.xLabel).toBe('t/T₁')
    a.points.forEach((p, i) => {
      close(p.y, Math.exp(-p.x), 1e-12)
      close(a.vs!.points[i].y, Math.exp(-p.x / 2), 1e-12)
    })
    close(a.markers[0].y, Math.exp(-1), 1e-12)
    close(a.markers[0].yVs!, Math.exp(-0.5), 1e-12)
    close(a.markers[1].yVs!, Math.exp(-1), 1e-12)
    expect(a.yMax).toBeLessThanOrEqual(1)
  })
  it('steadyLow and steadyHigh are (1/2) s/(1 + x^2 + s) at s = 0.2 and 5; the axis stops at 1/2 and the strong curve is the wider one', () => {
    const a = R(pl('steadyLow', { curve: { vs: 'steadyHigh', x: { from: -5, to: 5 }, samples: 100 }, markers: [{ x: 0 }] }))
    expect(a.names).toEqual({ fn: 'weak drive', vs: 'strong drive' })
    expect(a.xLabel).toBe('ΔT₂')
    a.points.forEach((p, i) => {
      close(p.y, (0.5 * 0.2) / (1 + p.x * p.x + 0.2), 1e-12)
      close(a.vs!.points[i].y, (0.5 * 5) / (1 + p.x * p.x + 5), 1e-12)
    })
    close(a.markers[0].y, 0.5 * 0.2 / 1.2, 1e-12)
    close(a.markers[0].yVs!, 0.5 * 5 / 6, 1e-12)
    expect(a.yMax).toBeLessThanOrEqual(0.5)
    expect(a.yMin).toBeGreaterThanOrEqual(0)
  })
  it('ouSlow and ouFast are the noise-averaged coherence for sigma = 1 at tau_c = 10 and 0.1 (numpy variances); the slow curve is the Gaussian e^(-x^2/2) at small x', () => {
    const a = R(pl('ouSlow', { curve: { vs: 'ouFast', x: { from: 0, to: 5 }, samples: 50 }, markers: [{ x: 1 }] }))
    expect(a.names).toEqual({ fn: 'slow noise', vs: 'fast noise' })
    expect(a.xLabel).toBe('σt')
    const slow = FX.ou.find((k: any) => k.t === 1 && k.tauC === 10)
    const fast = FX.ou.find((k: any) => k.t === 1 && k.tauC === 0.1)
    close(a.markers[0].y, Math.exp(-slow.var / 2), 1e-12)
    close(a.markers[0].yVs!, Math.exp(-fast.var / 2), 1e-12)
    a.points.forEach((p, i) => {
      if (p.x <= 0.5) close(p.y, Math.exp((-p.x * p.x) / 2), 2e-3)
      if (p.x >= 2) expect(a.vs!.points[i].y).toBeGreaterThan(p.y)
    })
    expect(a.yMax).toBeLessThanOrEqual(1)
  })
  it('echoOuSlow is the echo’s coherence against the total time 2 tau (numpy variance at tau = 1, 2): 0.940 at total time 2', () => {
    const a = R(pl('echoOuSlow', { curve: { vs: 'ouSlow', x: { from: 0, to: 5 }, samples: 50 }, markers: [{ x: 2 }, { x: 4 }] }))
    expect(a.names?.fn).toBe('echo, slow noise')
    const e1 = FX.echo.find((k: any) => k.tau === 1 && k.tauC === 10)
    const e2 = FX.echo.find((k: any) => k.tau === 2 && k.tauC === 10)
    close(a.markers[0].y, Math.exp(-e1.var / 2), 1e-12)
    close(a.markers[1].y, Math.exp(-e2.var / 2), 1e-12)
    expect(a.markers[0].y).toBeGreaterThan(5 * a.markers[0].yVs!)
  })
  it('pulseErr1 and pulseErr2 are the errors of the plain and the four-pulse sequence (numpy spectral norms) and the composite is the smaller one for every eps in (0, 0.3]', () => {
    const a = R(pl('pulseErr1', { curve: { vs: 'pulseErr2', x: { from: 0, to: 0.3 }, samples: 30 }, markers: [{ x: 0.1 }] }))
    expect(a.names).toEqual({ fn: 'single pulse', vs: 'four pulses' })
    expect(a.xLabel).toBe('ε')
    const k = FX.pulseErr.find((q: any) => q.eps === 0.1 && q.mode === 'scale')
    close(a.markers[0].y, k.plain, 1e-12)
    close(a.markers[0].yVs!, k.comp, 1e-12)
    a.points.forEach((p, i) => {
      if (p.x > 0) expect(a.vs!.points[i].y).toBeLessThan(p.y)
    })
    expect(a.yMin).toBeGreaterThanOrEqual(0)
  })
})
