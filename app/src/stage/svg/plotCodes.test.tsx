/**
 * Stage-code agent S3 (P-Q21-story §9.2, P-Q22-story §9.2; additive): the plot curves of the error-correction chapters, all from physics/qec/rates.ts —
 * `repFail3`, `repFail5`, `identityP`, `qhbNeed1`, `steaneFailX`. Content writes only the curve's name and range; the numbers are the engine's, the closed forms and the
 * numpy / itertools values of the plans (0.028, 0.00856, 0.0020040749…, 0.1306432, the crossing 0.0646, 2(1 + 3n)) agree with them.
 */
import { createElement } from 'react'
import { renderToString } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import type { PlotState } from '../../content/stage'
import { steaneCode } from '../../physics/qec/codes'
import { logicalFailure, qhbNeed, qhbNeedReal, repetitionFail } from '../../physics/qec/rates'
import { interpolate } from '../interp'
import { resolve, validateStage } from '../resolve'
import type { ResolvedPlot } from '../types'
import { plotReadouts, resolvePlotStage, validatePlotStage } from './plot'
import { PlotScene } from './PlotScene'
import './kinds'

const pl = (x: Omit<PlotState, 'kind'>): PlotState => ({ kind: 'plot', ...x })
const R = (x: Omit<PlotState, 'kind'>) => resolvePlotStage(pl(x), 1)
const texts = (r: ResolvedPlot) => plotReadouts(r).map((x) => x.text)
const at = (r: ResolvedPlot, x: number) => r.points.find((p) => Math.abs(p.x - x) < 1e-9)!.y

describe('plot: the majority-vote curves and the lone bit', () => {
  it('repFail3 is p²(3 − 2p) on [0, 1], repFail5 is p³(10 − 15p + 6p²), identityP is y = p; 64 samples by default', () => {
    for (const fn of ['repFail3', 'repFail5', 'identityP'] as const) {
      const r = R({ curve: { fn } })
      expect(r.range).toEqual({ from: 0, to: 1 })
      expect(r.points).toHaveLength(65)
      expect(r.xLabel).toBe('p')
    }
    const three = R({ curve: { fn: 'repFail3' } })
    const five = R({ curve: { fn: 'repFail5' } })
    const lone = R({ curve: { fn: 'identityP' } })
    for (const p of three.points.map((q) => q.x)) {
      expect(at(three, p)).toBeCloseTo(p * p * (3 - 2 * p), 12)
      expect(at(five, p)).toBeCloseTo(p ** 3 * (10 - 15 * p + 6 * p * p), 12)
      expect(at(lone, p)).toBe(p)
    }
  })
  it('the plans’ markers: 0.028 for three copies at p = 0.1, 0.00856 for five, and the curves meet the line at ½', () => {
    const r = R({ curve: { fn: 'repFail3', vs: 'identityP' }, markers: [{ x: 0.1 }, { x: 0.5 }] })
    expect(r.markers[0].y).toBeCloseTo(0.028, 12)
    expect(r.markers[0].yVs).toBeCloseTo(0.1, 12)
    expect(r.markers[1].y).toBeCloseTo(0.5, 12)
    expect(r.markers[1].yVs).toBeCloseTo(0.5, 12)
    const five = R({ curve: { fn: 'repFail5', vs: 'repFail3' }, markers: [{ x: 0.1 }] })
    expect(five.markers[0].y).toBeCloseTo(0.00856, 12)
    expect(five.markers[0].yVs).toBeCloseTo(0.028, 12)
    expect(five.markers[0].yVs! / five.markers[0].y).toBeCloseTo(3.271, 3) // the plan's q21RepRatio
    // five copies lie lower everywhere below ½
    const both = R({ curve: { fn: 'repFail5', vs: 'repFail3', samples: 128, x: { from: 0.01, to: 0.49 } } })
    for (let k = 0; k < both.points.length; k++) expect(both.points[k].y).toBeLessThan(both.vs!.points[k].y)
  })
  it('every sample is the engine’s repetitionFail; the y axis is never padded past 0 or 1', () => {
    const r = R({ curve: { fn: 'repFail3', vs: 'identityP' } })
    for (const p of r.points) expect(p.y).toBeCloseTo(repetitionFail(p.x, 3), 12)
    expect(r.yMin).toBe(0)
    expect(r.yMax).toBe(1)
  })
  it('the readouts name each curve at its end and at every marker, with the p axis printed to four decimals', () => {
    const r = R({ curve: { fn: 'repFail3', vs: 'identityP' }, markers: [{ x: 0.1 }] })
    expect(texts(r)).toEqual(['p ∈ [0, 1]', 'vote of 3(1) = 1', 'lone bit(1) = 1', 'p = 0.1: vote of 3 = 0.0280, lone bit = 0.1'])
  })
})

describe('plot: the quantum Hamming bound’s line', () => {
  it('qhbNeed1 is 2(1 + 3n) for n from 1 to 10, and at whole n it IS the engine’s counting bound', () => {
    const r = R({ curve: { fn: 'qhbNeed1', vs: 'twoToN', x: { from: 1, to: 10 }, samples: 9 } })
    expect(r.range).toEqual({ from: 1, to: 10 })
    expect(r.xLabel).toBe('n')
    for (const p of r.points) {
      expect(p.y).toBeCloseTo(2 * (1 + 3 * p.x), 12)
      expect(p.y).toBe(qhbNeed(p.x, 1, 1))
    }
    for (const [n, need, have] of [[4, 26, 16], [5, 32, 32]] as const) {
      const k = R({ curve: { fn: 'qhbNeed1', vs: 'twoToN', x: { from: 1, to: 10 } }, markers: [{ x: n }] })
      expect(k.markers[0].y).toBe(need)
      expect(k.markers[0].yVs).toBe(have)
    }
  })
  it('the real-n extension agrees with the whole-n count for every k and t, and runs straight for t = 1', () => {
    for (const [k, t] of [[1, 1], [1, 2], [2, 1], [3, 2]] as const) for (let n = 1; n <= 12; n++) expect(qhbNeedReal(n, k, t), `n ${n} k ${k} t ${t}`).toBeCloseTo(qhbNeed(n, k, t), 9)
    expect(qhbNeedReal(2.5, 1, 1)).toBeCloseTo(2 * (1 + 7.5), 12)
  })
  it('the default range is 1 to 10; the curve crosses 2ⁿ between n = 4 and n = 5 (rooms needed meet the dimension at n = 5)', () => {
    const r = R({ curve: { fn: 'qhbNeed1', vs: 'twoToN', samples: 9 } })
    expect(r.range).toEqual({ from: 1, to: 10 })
    const need = r.points.map((p) => p.y)
    const have = r.vs!.points.map((p) => p.y)
    expect(need[3]).toBeGreaterThan(have[3]) // n = 4: 26 > 16
    expect(need[4]).toBe(have[4]) // n = 5: 32 = 32
    expect(need[5]).toBeLessThan(have[5]) // n = 6: 38 < 64
  })
})

describe('plot: the Steane code’s logical failure chance', () => {
  it('steaneFailX is the engine’s exact P_L(p) on [0, 0.2]: 0.0020040749… at 0.01, 0.1306432 at 0.1 (the itertools enumeration of the plan)', () => {
    const r = R({ curve: { fn: 'steaneFailX', vs: 'identityP' }, markers: [{ x: 0.01 }, { x: 0.1 }, { x: 0.0646 }] })
    expect(r.range).toEqual({ from: 0, to: 0.2 })
    expect(r.markers[0].y).toBeCloseTo(0.00200407496752, 10)
    expect(r.markers[1].y).toBeCloseTo(0.1306432, 10)
    for (const m of r.markers) expect(m.y).toBeCloseTo(logicalFailure(steaneCode(), m.x, 'X'), 12)
    // the crossing with the bare qubit: P_L(0.0646) = 0.0646 to within the rounding of the marker
    expect(r.markers[2].y).toBeCloseTo(r.markers[2].yVs!, 4)
    expect(r.markers[2].y).toBeCloseTo(0.0646, 4)
    // below it the code helps, above it hurts
    expect(r.markers[0].y).toBeLessThan(r.markers[0].yVs!)
    expect(r.markers[1].y).toBeGreaterThan(r.markers[1].yVs!)
  })
  it('the p axis prints four decimals and the readout names both curves at the marker', () => {
    const r = R({ curve: { fn: 'steaneFailX', vs: 'identityP' }, markers: [{ x: 0.0646 }] })
    expect(texts(r)[0]).toBe('p ∈ [0, 0.2]')
    expect(texts(r).some((t) => t.startsWith('p = 0.0646: Steane = 0.0646, lone bit = 0.0646'))).toBe(true)
    expect(r.xDigits).toBe(4)
  })
})

describe('plot: the new curves in validation, interpolation and the scene', () => {
  it('a chance curve’s x runs inside [0, 1]; a marker outside the drawn range is refused as before', () => {
    expect(validatePlotStage(pl({ curve: { fn: 'repFail3' } }))).toEqual([])
    expect(validatePlotStage(pl({ curve: { fn: 'repFail3', x: { from: 0, to: 2 } } }))[0]).toMatch(/repFail3 is a function of a chance p, so x runs inside \[0, 1\]/)
    expect(validatePlotStage(pl({ curve: { fn: 'steaneFailX', x: { from: -0.1, to: 0.2 } } }))[0]).toMatch(/inside \[0, 1\]/)
    expect(validatePlotStage(pl({ curve: { fn: 'qhbNeed1', vs: 'repFail3' } }))[0]).toMatch(/repFail3 is a function of a chance p/) // the second curve shares x: 1 … 10 is no chance
    expect(validatePlotStage(pl({ curve: { fn: 'qhbNeed1', x: { from: 0, to: 20 } } }))).toEqual([])
    expect(validatePlotStage(pl({ curve: { fn: 'steaneFailX', vs: 'identityP' }, markers: [{ x: 0.5 }] }))[0]).toMatch(/outside the drawn range/)
    expect(validateStage(pl({ curve: { fn: 'repFail5', vs: 'repFail3' }, markers: [{ x: 0.1 }], shot: 'P-CURVE' }))).toEqual([])
    expect(validatePlotStage(pl({ curve: { fn: 'steaneFailX', vs: 'steaneFailX' } }))[0]).toMatch(/a different curve/)
  })
  it('a log axis works for the two-curve Hamming picture (both stay above 0) and is refused for a curve that touches 0', () => {
    expect(validatePlotStage(pl({ curve: { fn: 'qhbNeed1', vs: 'twoToN' }, yScale: 'log' }))).toEqual([])
    expect(validatePlotStage(pl({ curve: { fn: 'repFail3' }, yScale: 'log' }))[0]).toMatch(/log needs a curve that stays above 0/)
  })
  it('interpolation: two states on the same curve lerp their markers and recompute; a different curve switches at ½', () => {
    const a = resolve(pl({ curve: { fn: 'repFail3', vs: 'identityP' }, markers: [{ x: 0.1 }] }), 1) as ResolvedPlot
    const b = resolve(pl({ curve: { fn: 'repFail3', vs: 'identityP' }, markers: [{ x: 0.5 }] }), 1) as ResolvedPlot
    const mid = interpolate(a, b, 0.5) as ResolvedPlot
    expect(mid.markers[0].x).toBeCloseTo(0.3, 12)
    expect(mid.markers[0].y).toBeCloseTo(repetitionFail(0.3, 3), 12)
    const c = resolve(pl({ curve: { fn: 'repFail5', vs: 'identityP' } }), 1) as ResolvedPlot
    expect((interpolate(a, c, 0.3) as ResolvedPlot).fn).toBe('repFail3')
    expect((interpolate(a, c, 0.7) as ResolvedPlot).fn).toBe('repFail5')
  })
  it('the scene draws both curves with their names and the p / n axis names, in stage and print, with no NaN', () => {
    for (const st of [pl({ curve: { fn: 'repFail3', vs: 'identityP' }, markers: [{ x: 0.1 }, { x: 0.5 }] }), pl({ curve: { fn: 'steaneFailX', vs: 'identityP' }, markers: [{ x: 0.0646 }] }), pl({ curve: { fn: 'qhbNeed1', vs: 'twoToN', x: { from: 1, to: 10 } }, markers: [{ x: 5 }] })]) {
      const r = resolve(st, 1) as ResolvedPlot
      for (const [mode, w, h] of [['stage', 500, 380], ['print', 320, 220]] as const) {
        const html = renderToString(createElement('svg', null, createElement(PlotScene, { state: r, mode, width: w, height: h })))
        expect(html).not.toMatch(/NaN|Infinity|undefined/)
        expect(html).toContain(r.names!.fn)
        expect(html).toContain(r.names!.vs)
        expect(html).toContain(`>${r.xLabel}<`)
      }
    }
  })
})
