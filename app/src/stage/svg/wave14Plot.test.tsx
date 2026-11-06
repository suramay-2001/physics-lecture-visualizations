/**
 * The Lecture 14 stage addition (ruling M3 of docs/roles/decisions/448-L14L18.md): two named `plot` curves, every y from physics/wave14.ts — a free matter wave's dispersion relation
 * `freeOmega` (ω = k²/2) and light's `linearOmega` (ω = |k|). Defaults are untouched, so every older stage resolves as before.
 */
import { describe, expect, it } from 'vitest'
import type { PlotState } from '../../content/stage'
import { omegaFree, omegaLinear } from '../../physics/wave14'
import { validateStage } from '../resolve'
import { resolvePlotStage, validatePlotStage } from './plot'
import './kinds'

const pl = (x: Omit<PlotState, 'kind'>): PlotState => ({ kind: 'plot', ...x })
const close = (a: number, b: number, eps = 1e-12) => expect(Math.abs(a - b), `${a} vs ${b}`).toBeLessThan(eps)

describe('plot curves freeOmega and linearOmega (Unit 14.3)', () => {
  it('the parabola k²/2 beside the line |k|: they meet at k = 2; the markers at k = 1, 2, 3 read the engine', () => {
    const r = resolvePlotStage(pl({ curve: { fn: 'freeOmega', vs: 'linearOmega', samples: 80 }, markers: [{ x: 1 }, { x: 2 }, { x: 3 }] }), 1)
    expect(r.range).toEqual({ from: -4, to: 4 })
    r.points.forEach((p) => close(p.y, omegaFree(p.x)))
    r.vs!.points.forEach((p) => close(p.y, omegaLinear(p.x)))
    close(r.markers[0].y, 0.5)
    close(r.markers[1].y, 2)
    close(r.markers[1].yVs as number, 2)
    close(r.markers[2].y, 4.5)
    close(r.markers[2].yVs as number, 3)
    expect(r.xLabel).toBe('k')
    expect(r.names).toEqual({ fn: 'matter wave, k²/2m', vs: 'light, c|k|' })
    expect(r.yMin).toBeGreaterThanOrEqual(0)
  })
  it('each curve alone is symmetric in k and validates; a marker outside the range is refused', () => {
    expect(validatePlotStage(pl({ curve: { fn: 'freeOmega' }, markers: [{ x: -3 }, { x: 3 }] }))).toEqual([])
    close(omegaFree(-3), omegaFree(3))
    close(omegaLinear(-3), omegaLinear(3))
    expect(validateStage(pl({ curve: { fn: 'linearOmega' }, markers: [{ x: 9 }] })).join()).toMatch(/outside the drawn range/)
  })
})
