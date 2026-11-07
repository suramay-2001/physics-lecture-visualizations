/**
 * The Lecture 16 stage addition (ruling M3 of docs/roles/decisions/448-L14L18.md): two named `plot` curves, every y from the engine — the width of a free Gaussian packet `packetWidth`
 * (physics/wave.ts gaussianWidth, σ = 1) and the width of the chirped packet `packetWidthChirp` (physics/wave16.ts chirpWidth, σ = 1, β = −0.2). Defaults are untouched, so every older stage
 * resolves as before.
 */
import { describe, expect, it } from 'vitest'
import type { PlotState } from '../../content/stage'
import { gaussianWidth } from '../../physics/wave'
import { chirpFocus, chirpWidth } from '../../physics/wave16'
import { validateStage } from '../resolve'
import { resolvePlotStage, validatePlotStage } from './plot'
import './kinds'

const pl = (x: Omit<PlotState, 'kind'>): PlotState => ({ kind: 'plot', ...x })
const close = (a: number, b: number, eps = 1e-12) => expect(Math.abs(a - b), `${a} vs ${b}`).toBeLessThan(eps)

describe('plot curves packetWidth and packetWidthChirp (Unit 16.3)', () => {
  it('the plain width starts at σ = 1 and reaches √2 at t_s = 2 and √5 at t = 4; the chirped one dips to 0.781 and is back to 1 at twice the focus time', () => {
    const r = resolvePlotStage(pl({ curve: { fn: 'packetWidth', vs: 'packetWidthChirp', samples: 80 }, markers: [{ x: 2 }, { x: 4 }] }), 1)
    expect(r.range).toEqual({ from: 0, to: 4 })
    r.points.forEach((p) => close(p.y, gaussianWidth(1, p.x)))
    r.vs!.points.forEach((p) => close(p.y, chirpWidth(1, -0.2, p.x)))
    close(r.points[0].y, 1)
    close(r.markers[0].y, Math.SQRT2)
    close(r.markers[1].y, Math.sqrt(5))
    close(r.markers[0].yVs as number, chirpWidth(1, -0.2, 2))
    expect(r.xLabel).toBe('t')
    expect(r.names).toEqual({ fn: 'plain Gaussian', vs: 'chirped, β = −0.2' })
    const f = chirpFocus(1, -0.2)
    expect(Math.min(...r.vs!.points.map((p) => p.y))).toBeLessThan(0.8)
    close(f.width, 0.7809, 1e-4)
    close(chirpWidth(1, -0.2, 2 * f.time), 1)
  })
  it('each curve alone validates and never goes below 0; a marker outside the range is refused', () => {
    expect(validatePlotStage(pl({ curve: { fn: 'packetWidth' }, markers: [{ x: 1 }] }))).toEqual([])
    expect(validatePlotStage(pl({ curve: { fn: 'packetWidthChirp' }, markers: [{ x: 3 }] }))).toEqual([])
    expect(resolvePlotStage(pl({ curve: { fn: 'packetWidthChirp' } }), 1).yMin).toBeGreaterThanOrEqual(0)
    expect(validateStage(pl({ curve: { fn: 'packetWidth' }, markers: [{ x: 9 }] })).join()).toMatch(/outside the drawn range/)
  })
})
