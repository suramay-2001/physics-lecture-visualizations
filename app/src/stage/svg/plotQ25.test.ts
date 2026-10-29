/**
 * The three plot curves of Chapter Q25 (P-Q25-story §9.2 S2): `mathieuBeta`, `mathieuBetaApprox` and `twoIonPotential`. Every y is the engine's (physics/qc/iontrap.ts); the values are
 * checked against the numpy/scipy twin (__fixtures__/qc-q25.json) and the closed forms.
 */
import { describe, expect, it } from 'vitest'
import raw from '../../physics/__fixtures__/qc-q25.json?raw'
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

describe('Q25 curves: the engine’s numbers', () => {
  it('mathieuBeta is the Floquet number of the numpy monodromy at its markers, rises from 0 to 1 and stops at 1 beyond the edge 0.908; mathieuBetaApprox is q/sqrt 2', () => {
    const a = R(pl('mathieuBeta', { curve: { vs: 'mathieuBetaApprox', x: { from: 0.05, to: 0.95 }, samples: 36 }, markers: [{ x: 0.5411 }, { x: 0.9 }] }))
    expect(a.names).toEqual({ fn: 'exact', vs: 'effective potential' })
    expect(a.xLabel).toBe('q̃')
    const m = FX.mathieu.find((e: any) => e.q === 0.5411)
    close(a.markers[0].y, m.beta, 1e-8)
    close(a.markers[0].yVs!, 0.5411 / Math.SQRT2, 1e-12)
    expect(a.points[a.points.length - 1].y).toBe(1)
    expect(a.points[0].y).toBeLessThan(0.1)
    a.points.forEach((p, i) => expect(p.y).toBeGreaterThanOrEqual(i === 0 ? 0 : a.points[i - 1].y - 1e-9))
    expect(a.yMax).toBeLessThanOrEqual(1)
  })
  it('twoIonPotential is s^2/4 + 1/(2 s) with its minimum 3/4 at s = 1', () => {
    const a = R(pl('twoIonPotential', { curve: { x: { from: 0.4, to: 2.5 }, samples: 42 }, markers: [{ x: 1 }] }))
    close(a.markers[0].y, 0.75, 1e-12)
    a.points.forEach((p) => close(p.y, (p.x * p.x) / 4 + 1 / (2 * p.x), 1e-12))
    expect(Math.min(...a.points.map((p) => p.y))).toBeGreaterThanOrEqual(0.75 - 1e-9)
  })
})
