/**
 * `plot` (P-Q10-story §9.2): the resolver samples a NAMED engine curve (physics/qc/entangle.ts), content writes no
 * point; interpolation lerps the inputs (range, samples, markers, bands, yLines) and recomputes the curve when both
 * sides share one, else hard-switches; validation enforces the plan's limits; the kind is reached through the
 * ordinary resolve / interpolate / validateStage entry points, like every other SVG kind.
 */
import { createElement } from 'react'
import { renderToString } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import type { PlotState } from '../../content/stage'
import { KIND_RENDER, PASSPORT } from '../../content/stage'
import { chshCurve, lhvChsh, type Dir } from '../../physics/qc/entangle'
import { interpolate } from '../interp'
import { resolve, validateStage } from '../resolve'
import { svgKindDef } from '../svgKinds'
import type { ResolvedPlot } from '../types'
import { PLOT_LIMITS, interpPlotStage, plotReadouts, resolvePlotStage, validatePlotStage } from './plot'
import { PlotScene } from './PlotScene'
import './kinds'

const pl = (x: Omit<PlotState, 'kind'>): PlotState => ({ kind: 'plot', ...x })
const X_AXIS: Dir = [1, 0, 0]
const Y_AXIS: Dir = [0, 1, 0]
function phaseBell(deltaDeg: number) {
  const theta = (deltaDeg * Math.PI) / 180
  return [
    { re: Math.SQRT1_2, im: 0 },
    { re: 0, im: 0 },
    { re: 0, im: 0 },
    { re: Math.SQRT1_2 * Math.cos(theta), im: Math.SQRT1_2 * Math.sin(theta) },
  ]
}

describe('plot: the SVG route', () => {
  it('is an SVG kind, registered by the lazy kinds module, with the plan’s passport', () => {
    expect(KIND_RENDER.plot).toBe('svg')
    expect(svgKindDef('plot')).toBeDefined()
    expect(PASSPORT.plot).toMatchObject({ title: 'CURVE · engine-sampled', note: 'not a place · the curve and its markers are computed, not drawn' })
  })

  it('resolve / validateStage reach it like any kind; an unknown shot is caught by the shared check', () => {
    const st = pl({ curve: { fn: 'chshVsPhase' }, shot: 'P-CURVE' })
    expect((resolve(st, 1) as ResolvedPlot).points.length).toBeGreaterThan(0)
    expect(validateStage(st)).toEqual([])
    expect(validateStage({ ...st, shot: 'C-FLAT' as never })).toEqual(['plot: unknown shot "C-FLAT"'])
  })
})

describe('plot: the curve is the engine\'s, never authored', () => {
  it('curve.fn "chshVsPhase" samples physics/qc/entangle.ts chshCurve exactly, at the default range and samples', () => {
    const r = resolvePlotStage(pl({ curve: { fn: 'chshVsPhase' } }), 1)
    expect(r.points).toHaveLength(PLOT_LIMITS.samplesDefault + 1)
    expect(r.range).toEqual({ from: 0, to: 90 })
    for (const p of [r.points[0], r.points[r.points.length - 1], r.points[32]]) {
      const want = chshCurve(phaseBell, [X_AXIS, Y_AXIS], [X_AXIS, Y_AXIS], p.x)
      expect(p.y).toBeCloseTo(want, 12)
    }
    // the classic closed form, and the Tsirelson peak near 45 degrees
    expect(r.points[0].y).toBeCloseTo(2, 9)
    const at45 = r.points.find((p) => Math.abs(p.x - 45) < 1e-6)!
    expect(at45.y).toBeCloseTo(2 * Math.sqrt(2), 9)
  })

  it('curve.fn "chshClassicalBound" samples lhvChsh().maxS, a flat line at the engine\'s own bound', () => {
    const r = resolvePlotStage(pl({ curve: { fn: 'chshClassicalBound' } }), 1)
    const bound = lhvChsh().maxS
    expect(r.points.every((p) => p.y === bound)).toBe(true)
  })

  it('curve.x overrides the default range; curve.samples overrides the point count', () => {
    const r = resolvePlotStage(pl({ curve: { fn: 'chshVsPhase', x: { from: -30, to: 30 }, samples: 8 } }), 1)
    expect(r.range).toEqual({ from: -30, to: 30 })
    expect(r.points).toHaveLength(9)
    expect(r.points[0].x).toBe(-30)
    expect(r.points[8].x).toBe(30)
  })

  it('markers: y is computed from x by the same curve, never authored', () => {
    const r = resolvePlotStage(pl({ curve: { fn: 'chshVsPhase' }, markers: [{ x: 45, label: '2√2' }] }), 1)
    expect(r.markers).toHaveLength(1)
    expect(r.markers[0].label).toBe('2√2')
    expect(r.markers[0].y).toBeCloseTo(2 * Math.sqrt(2), 9)
  })

  it('bands and yLines pass through, and widen the drawn y-range beyond the curve\'s own', () => {
    const plain = resolvePlotStage(pl({ curve: { fn: 'chshClassicalBound' } }), 1)
    const withExtras = resolvePlotStage(pl({ curve: { fn: 'chshClassicalBound' }, bands: [{ yFrom: -3, yTo: 0, label: 'below' }], yLines: [{ y: 4, label: 'PR box' }] }), 1)
    expect(withExtras.bands).toEqual([{ yFrom: -3, yTo: 0, label: 'below' }])
    expect(withExtras.yLines).toEqual([{ y: 4, label: 'PR box' }])
    expect(withExtras.yMin).toBeLessThan(plain.yMin)
    expect(withExtras.yMax).toBeGreaterThan(plain.yMax)
  })
})

describe('plot: interpolation', () => {
  it('lerps the range and recomputes the curve when both sides share a curve and sample count', () => {
    const a = resolvePlotStage(pl({ curve: { fn: 'chshVsPhase', x: { from: 0, to: 90 }, samples: 4 } }), 1)
    const b = resolvePlotStage(pl({ curve: { fn: 'chshVsPhase', x: { from: 10, to: 100 }, samples: 4 } }), 1)
    const mid = interpPlotStage(a, b, 0.5)
    expect(mid.range).toEqual({ from: 5, to: 95 })
    expect(mid.points[0].y).toBeCloseTo(chshCurve(phaseBell, [X_AXIS, Y_AXIS], [X_AXIS, Y_AXIS], 5), 9)
  })

  it('lerps markers/bands/yLines by position when both sides have the same count', () => {
    const a = resolvePlotStage(pl({ curve: { fn: 'chshClassicalBound' }, markers: [{ x: 10 }], yLines: [{ y: 1 }] }), 1)
    const b = resolvePlotStage(pl({ curve: { fn: 'chshClassicalBound' }, markers: [{ x: 50 }], yLines: [{ y: 3 }] }), 1)
    const mid = interpPlotStage(a, b, 0.5)
    expect(mid.markers[0].x).toBe(30)
    expect(mid.yLines[0].y).toBe(2)
  })

  it('hard-switches (no cross-fade) when the two sides draw a different curve', () => {
    const a = resolvePlotStage(pl({ curve: { fn: 'chshVsPhase' } }), 1)
    const b = resolvePlotStage(pl({ curve: { fn: 'chshClassicalBound' } }), 1)
    expect(interpPlotStage(a, b, 0.2).fn).toBe('chshVsPhase')
    expect(interpPlotStage(a, b, 0.8).fn).toBe('chshClassicalBound')
    expect(interpPlotStage(a, b, 0)).toBe(a)
    expect(interpPlotStage(a, b, 1)).toBe(b)
  })

  it('reaches through the shared interpolate() entry point, like every other kind', () => {
    const a = resolve(pl({ curve: { fn: 'chshVsPhase' } }), 1)
    const b = resolve(pl({ curve: { fn: 'chshVsPhase' }, markers: [{ x: 20 }] }), 0)
    expect((interpolate(a, b, 0.5) as ResolvedPlot).markers).toHaveLength(1)
  })
})

describe('plot: validation', () => {
  it('accepts a well-formed state and rejects an unknown curve name', () => {
    expect(validatePlotStage(pl({ curve: { fn: 'chshVsPhase' } }))).toEqual([])
    expect(validatePlotStage(pl({ curve: { fn: 'nope' as never } }))[0]).toMatch(/unknown curve/)
  })

  it('x.from must be less than x.to; samples must be a whole number in range', () => {
    expect(validatePlotStage(pl({ curve: { fn: 'chshVsPhase', x: { from: 10, to: 10 } } }))[0]).toMatch(/from must be less than to/)
    expect(validatePlotStage(pl({ curve: { fn: 'chshVsPhase', samples: 1 } }))[0]).toMatch(/whole number/)
    expect(validatePlotStage(pl({ curve: { fn: 'chshVsPhase', samples: 2.5 as never } }))[0]).toMatch(/whole number/)
    expect(validatePlotStage(pl({ curve: { fn: 'chshVsPhase', samples: 1000 } }))[0]).toMatch(/whole number/)
  })

  it('caps markers, bands and yLines; rejects a marker outside the drawn range', () => {
    const manyMarkers = Array.from({ length: PLOT_LIMITS.markers + 1 }, (_, i) => ({ x: i }))
    expect(validatePlotStage(pl({ curve: { fn: 'chshVsPhase' }, markers: manyMarkers }))[0]).toMatch(/at most/)
    const manyBands = Array.from({ length: PLOT_LIMITS.bands + 1 }, () => ({ yFrom: 0, yTo: 1 }))
    expect(validatePlotStage(pl({ curve: { fn: 'chshVsPhase' }, bands: manyBands }))[0]).toMatch(/at most/)
    const manyLines = Array.from({ length: PLOT_LIMITS.yLines + 1 }, () => ({ y: 0 }))
    expect(validatePlotStage(pl({ curve: { fn: 'chshVsPhase' }, yLines: manyLines }))[0]).toMatch(/at most/)
    expect(validatePlotStage(pl({ curve: { fn: 'chshVsPhase', x: { from: 0, to: 90 } }, markers: [{ x: 200 }] }))[0]).toMatch(/outside the drawn range/)
  })
})

describe('plot: readouts and the scene', () => {
  it('readouts name the range, the end point and every marker', () => {
    const r = resolvePlotStage(pl({ curve: { fn: 'chshVsPhase' }, markers: [{ x: 45, label: 'peak' }] }), 1)
    const lines = plotReadouts(r).map((x) => x.text)
    expect(lines.some((t) => t.startsWith('x ∈'))).toBe(true)
    expect(lines.some((t) => t.includes('peak'))).toBe(true)
  })

  it('renders in every mode without throwing, with and without bands/yLines/markers', () => {
    for (const st of [
      pl({ curve: { fn: 'chshVsPhase' } }),
      pl({ curve: { fn: 'chshClassicalBound' }, bands: [{ yFrom: -2, yTo: 2, label: 'classical' }], yLines: [{ y: 2 }], markers: [{ x: 10, label: 'm' }] }),
    ]) {
      for (const mode of ['stage', 'print'] as const) {
        const r = resolvePlotStage(st, 1)
        const html = renderToString(createElement('svg', null, createElement(PlotScene, { state: r, mode, width: 320, height: 240 })))
        expect(html).toContain('data-kind="plot"')
      }
    }
  })
})

describe('plot: a mutation check', () => {
  it('a wrong curve range (from >= to) is rejected: the guard actually discriminates', () => {
    expect(validatePlotStage(pl({ curve: { fn: 'chshVsPhase', x: { from: 50, to: 50 } } }))).not.toEqual([])
    expect(validatePlotStage(pl({ curve: { fn: 'chshVsPhase', x: { from: 0, to: 50 } } }))).toEqual([])
  })
})
