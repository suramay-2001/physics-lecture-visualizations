/**
 * The three plot curves of Chapter Q26 (P-Q26-story §9.2 fallback): `homDip`, `homDistinguishable`, `klmSuccess`. Every y is the engine's (physics/qc/photons.ts); the values are checked against
 * the numpy table (__fixtures__/qc-photons.json: the exponential of the mode generator), the closed forms (1 - 2R)^2, (1 - R)^2 + R^2 and (n/(n+1))^2, and the plan's marker values.
 */
import { describe, expect, it } from 'vitest'
import raw from '../../physics/__fixtures__/qc-photons.json?raw'
import type { PlotCurveName, PlotState } from '../../content/stage'
import { resolve, validateStage } from '../resolve'
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

describe('Q26 curves: the engine’s numbers', () => {
  it('homDip is (1 - 2R)^2 (numpy at eleven reflectivities) and homDistinguishable is (1 - R)^2 + R^2; the dip touches 0 at R = 1/2 and the other stays at 1/2', () => {
    const a = R(pl('homDip', { curve: { vs: 'homDistinguishable', x: { from: 0, to: 1 }, samples: 100 }, markers: [{ x: 0.2 }, { x: 0.25 }, { x: 0.5 }] }))
    expect(a.names).toEqual({ fn: 'identical photons', vs: 'told apart' })
    expect(a.xLabel).toBe('R')
    expect(a.points).toHaveLength(101)
    for (const k of FX.dip) {
      const p = a.points.find((q) => Math.abs(q.x - k.R) < 1e-9)!
      close(p.y, k.p11, 1e-12)
      close(a.vs!.points.find((q) => Math.abs(q.x - k.R) < 1e-9)!.y, k.dist, 1e-12)
    }
    for (const p of a.points) close(p.y, (1 - 2 * p.x) ** 2, 1e-12)
    close(a.markers[0].y, 0.36, 1e-12)
    close(a.markers[1].y, 0.25, 1e-12)
    close(a.markers[2].y, 0, 1e-12)
    close(a.markers[2].yVs!, 0.5, 1e-12)
    expect(a.yMax).toBeLessThanOrEqual(1)
    expect(a.yMin).toBeGreaterThanOrEqual(0)
  })
  it('klmSuccess is (n/(n+1))^2 on a log axis; 0.25 at n = 1, 0.5625 at 3, 0.9025 at 19, 0.99 near 199', () => {
    const a = R(pl('klmSuccess', { curve: { x: { from: 1, to: 200 }, samples: 80 }, markers: [{ x: 1 }, { x: 3 }, { x: 19 }, { x: 199 }], yLines: [{ y: 0.99 }], xScale: 'log' }))
    expect(a.xLabel).toBe('n')
    expect(a.xScale).toBe('log')
    for (const p of a.points) close(p.y, (p.x / (p.x + 1)) ** 2, 1e-12)
    close(a.markers[0].y, 0.25, 1e-12)
    close(a.markers[1].y, 0.5625, 1e-12)
    close(a.markers[2].y, 0.9025, 1e-12)
    expect(a.markers[3].y).toBeGreaterThan(0.99)
    for (const k of FX.klm.table) close((k.n / (k.n + 1)) ** 2, k.p, 1e-14)
    expect(a.yMax).toBeLessThanOrEqual(1)
  })
  it('each name validates, and a bad range is refused', () => {
    for (const fn of ['homDip', 'homDistinguishable', 'klmSuccess'] as const) expect(validateStage(pl(fn))).toEqual([])
    expect(validateStage(pl('klmSuccess', { xScale: 'log', curve: { x: { from: 0, to: 10 } } })).length).toBeGreaterThan(0)
  })
})
