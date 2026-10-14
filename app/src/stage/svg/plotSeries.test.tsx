/**
 * `plot` additions of the Papers background chapter B1 (P-B1-story §9.2 K-P; additive): SERIES mode (up to six named series of physics/qec/curves.ts instead of one curve), a base-10
 * log x axis (`xScale`), vertical marks printed in a paper (`reportedMarks`, hollow, "as printed"), markers on the first series and a small value table as readouts. Content writes only the
 * function names, their parameters and the range; every y is the engine's. These tests check the points against the engine and against closed forms, the odd whole d of a function of d,
 * the log spacing, every validation limit with a message that names the field, interpolation, the readouts, the drawer / vocabulary, that a named curve resolves exactly as before, and
 * that the one scene draws the series, the legend, the as-printed marks and the decades with no NaN in both modes.
 */
import { renderToString } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { fidelityOf } from '../../content/fidelity'
import type { PlotSeriesState, PlotState } from '../../content/stage'
import { PLOT_PRESETS, PLOT_SERIES_FNS } from '../../content/stage'
import { ANCHORS } from '../../content/stageVocab'
import { cleanRun, repetitionLogical, surfaceFit } from '../../physics/qec/curves'
import { FigureFor } from '../figures/FigureFor'
import { interpolate } from '../interp'
import { svgKindDef } from '../svgKinds'
import { resolve, validateStage } from '../resolve'
import type { ResolvedPlot } from '../types'
import { PlotScene, SERIES_STYLE, legendCols, legendRows, plotPrintSize } from './PlotScene'
import { PLOT_LIMITS, SERIES_RANGE, SERIES_X, plotReadouts, resolvePlotStage, seriesValue, seriesXs, validatePlotStage } from './plot'
import './kinds'

const S = (x: Omit<PlotSeriesState, 'kind'>): PlotSeriesState => ({ kind: 'plot', ...x })
const R = (x: Omit<PlotSeriesState, 'kind'>) => resolvePlotStage(S(x), 1)
const bad = (x: Omit<PlotSeriesState, 'kind'> | Omit<PlotState, 'kind'>) => validatePlotStage({ kind: 'plot', ...x } as PlotSeriesState)
type Mode = 'stage' | 'print'
const draw = (r: ResolvedPlot, mode: Mode, w: number, h: number, bare = false, slot: 'full' | 'top' | 'bottom' = 'full') =>
  renderToString(
    <svg viewBox={`0 0 ${w} ${h}`}>
      <PlotScene state={r} mode={mode} width={w} height={h} bare={bare} slot={slot} />
    </svg>,
  )

describe('plot B1: the vocabulary, the drawer and the named curves', () => {
  it('has the new anchors and the printed-constants note; a named curve resolves with none of the new fields', () => {
    expect(ANCHORS.plot).toEqual(expect.arrayContaining(['series', 'reported']))
    const f = fidelityOf('plot')
    expect(f.misleading.map((i) => i.id)).toEqual(['qc-plot-printed-constants', 'qc-plot-not-a-measurement', 'qc-plot-points-printed'])
    expect([...PLOT_SERIES_FNS]).toEqual(['cleanRun', 'repLogicalVsD', 'repLogicalVsP', 'surfaceVsP', 'surfaceVsD', 'voteFail'])
    expect([...PLOT_PRESETS]).toEqual(['tdg-2.6', 'tdg-A10', 'bev22'])
    const r = resolve({ kind: 'plot', curve: { fn: 'repFail3' } }, 1) as ResolvedPlot
    expect(r.fn).toBe('repFail3')
    expect(r.series).toBeUndefined()
    expect(r.xScale).toBeUndefined()
    expect(r.reportedMarks).toBeUndefined()
    expect(validateStage(S({ series: [{ fn: 'cleanRun', params: { p: 0.001 } }] }))).toEqual([])
  })
})

describe('plot B1: every point of a series is the engine’s', () => {
  it('cleanRun is (1 − p)^N at the steps N, repLogicalVsD a majority vote of d copies at odd d, repLogicalVsP the vote against p', () => {
    const c = R({ series: [{ fn: 'cleanRun', params: { p: 0.001 } }], xRange: { from: 1, to: 1000 }, samples: 10 })
    expect(c.series![0].points).toHaveLength(11)
    for (const pt of c.series![0].points) expect(pt.y).toBe(cleanRun(pt.x, 0.001))
    expect(c.series![0].points[0]).toEqual({ x: 1, y: 0.999 })
    // the closed form
    for (const pt of c.series![0].points) expect(pt.y).toBeCloseTo((1 - 0.001) ** pt.x, 12)
    const d = R({ series: [{ fn: 'repLogicalVsD', params: { p: 0.01 } }], xRange: { from: 1, to: 9 } })
    expect(d.series![0].points.map((p) => p.x)).toEqual([1, 3, 5, 7, 9])
    d.series![0].points.forEach((pt) => expect(pt.y).toBe(repetitionLogical(pt.x, 0.01)))
    expect(d.series![0].points[1].y).toBeCloseTo(3 * 0.01 ** 2 * 0.99 + 0.01 ** 3, 12)
    const p = R({ series: [{ fn: 'repLogicalVsP', params: { d: 3 } }], xRange: { from: 0, to: 1 }, samples: 4 })
    expect(p.series![0].points.map((q) => q.x)).toEqual([0, 0.25, 0.5, 0.75, 1])
    for (const q of p.series![0].points) expect(q.y).toBeCloseTo(3 * q.x ** 2 - 2 * q.x ** 3, 12)
  })
  it('the surface fits are a (p / p*)^e(d): the three presets, against the formulas the plan prints', () => {
    const want: Record<string, (d: number, p: number) => number> = {
      'tdg-2.6': (d, p) => 0.1 * (p / 0.01) ** (d / 2),
      'tdg-A10': (d, p) => 0.03 * (p / 0.01) ** (d / 2),
      bev22: (d, p) => 0.03 * (p / 0.01) ** ((d + 1) / 2),
    }
    for (const preset of PLOT_PRESETS) {
      const vsD = R({ series: [{ fn: 'surfaceVsD', params: { p: 0.001, preset } }], xRange: { from: 3, to: 15 } })
      expect(vsD.series![0].points.map((q) => q.x)).toEqual([3, 5, 7, 9, 11, 13, 15])
      for (const q of vsD.series![0].points) {
        expect(q.y, `${preset} d=${q.x}`).toBe(surfaceFit(q.x, 0.001, preset))
        expect(q.y / want[preset](q.x, 0.001)).toBeCloseTo(1, 12)
      }
      const vsP = R({ series: [{ fn: 'surfaceVsP', params: { d: 7, preset } }], xRange: { from: 0.0001, to: 0.01 }, xScale: 'log', samples: 8 })
      for (const q of vsP.series![0].points) expect(q.y / want[preset](7, q.x)).toBeCloseTo(1, 12)
    }
    // one factor of p*/p for every +2 in d, in every preset
    const t = R({ series: [{ fn: 'surfaceVsD', params: { p: 0.002, preset: 'tdg-2.6' } }], xRange: { from: 5, to: 7 } }).series![0].points
    expect(t[0].y / t[1].y).toBeCloseTo(0.01 / 0.002, 9)
  })
  it('`vote` protects every step of a clean run with a majority vote of that many copies', () => {
    const plain = R({ series: [{ fn: 'cleanRun', params: { p: 0.01 } }], xRange: { from: 1, to: 100 }, samples: 4 }).series![0].points
    const voted = R({ series: [{ fn: 'cleanRun', params: { p: 0.01, vote: 3 } }], xRange: { from: 1, to: 100 }, samples: 4 }).series![0].points
    expect(voted[0].y).toBeCloseTo(1 - repetitionLogical(3, 0.01), 12)
    expect(voted[4].y).toBeGreaterThan(plain[4].y)
  })
  it('the x values: the odd whole numbers of a function of d (rounded inward), `samples + 1` points otherwise, evenly spaced or evenly in the logarithm', () => {
    expect(seriesXs('d', { from: 4, to: 10 }, 64, 'linear')).toEqual([5, 7, 9])
    expect(seriesXs('d', { from: 3, to: 3 }, 64, 'linear')).toEqual([3])
    const lin = seriesXs('p', { from: 0, to: 1 }, 4, 'linear')
    expect(lin).toEqual([0, 0.25, 0.5, 0.75, 1])
    const log = seriesXs('N', { from: 1, to: 1000 }, 3, 'log')
    expect(log.map((x) => Math.round(x))).toEqual([1, 10, 100, 1000])
    const ratios = log.slice(1).map((x, i) => x / log[i])
    for (const q of ratios) expect(q).toBeCloseTo(10, 9)
    expect(R({ series: [{ fn: 'cleanRun', params: { p: 0.01 } }] }).series![0].points).toHaveLength(PLOT_LIMITS.samplesDefault + 1)
    expect(SERIES_RANGE).toEqual({ N: { from: 1, to: 1000 }, d: { from: 3, to: 25 }, p: { from: 0.0001, to: 0.01 } })
    expect(SERIES_X).toEqual({ cleanRun: 'N', repLogicalVsD: 'd', repLogicalVsP: 'p', surfaceVsP: 'p', surfaceVsD: 'd', voteFail: 'R' })
  })
  it('markers sit on the FIRST series (label optional); the y range covers every series, line and band; a linear axis never goes below 0', () => {
    const r = R({
      series: [{ fn: 'surfaceVsD', params: { p: 0.001, preset: 'tdg-2.6' } }, { fn: 'surfaceVsD', params: { p: 0.002, preset: 'tdg-2.6' } }],
      markers: [{ x: 7 }, { x: 11, label: 'd = 11' }],
      yLines: [{ y: 1e-15, label: 'target' }],
      yScale: 'log',
    })
    expect(r.markers.map((m) => [m.x, m.y, m.label, m.yVs])).toEqual([[7, surfaceFit(7, 0.001, 'tdg-2.6'), undefined, null], [11, surfaceFit(11, 0.001, 'tdg-2.6'), 'd = 11', null]])
    const all = r.series!.flatMap((s) => s.points.map((p) => p.y))
    expect(r.yMin).toBeLessThanOrEqual(Math.min(...all, 1e-15))
    expect(r.yMax).toBeGreaterThanOrEqual(Math.max(...all))
    const lin = R({ series: [{ fn: 'cleanRun', params: { p: 0.001 } }] })
    expect(lin.yMin).toBeGreaterThanOrEqual(0)
    expect(lin.yMax).toBeLessThanOrEqual(1)
    expect(lin.points).toBe(lin.series![0].points)
  })
  it('the legend names a series by the author’s label, or by its function and parameters', () => {
    expect(R({ series: [{ fn: 'cleanRun', params: { p: 0.001 }, label: 'a long run' }] }).series![0].label).toBe('a long run')
    expect(R({ series: [{ fn: 'repLogicalVsP', params: { d: 5 } }] }).series![0].label).toBe('vote of 5')
    expect(R({ series: [{ fn: 'surfaceVsD', params: { p: 0.001, preset: 'bev22' } }] }).series![0].label).toBe('bev22, p = 1 × 10⁻³')
    expect(R({ series: [{ fn: 'surfaceVsP', params: { d: 7, preset: 'tdg-A10' } }] }).series![0].label).toBe('tdg-A10, d = 7')
    expect(R({ series: [{ fn: 'cleanRun', params: { p: 0.001, vote: 3 } }] }).series![0].label).toBe('clean run, p = 1 × 10⁻³ · vote of 3')
  })
})

describe('plot B1: the log x axis works on a named curve too', () => {
  it('samples a named curve evenly in the logarithm; needs a positive range', () => {
    const st: PlotState = { kind: 'plot', curve: { fn: 'bb84Miss', x: { from: 1, to: 100 }, samples: 2 }, xScale: 'log' }
    const r = resolve(st, 1) as ResolvedPlot
    expect(r.points.map((p) => Math.round(p.x))).toEqual([1, 10, 100])
    expect(r.xScale).toBe('log')
    expect(bad({ curve: { fn: 'bb84Miss', x: { from: 0, to: 100 } }, xScale: 'log' })).toEqual(['plot xScale: log needs a range above 0'])
  })
})

describe('plot B1: validation — every limit, with a message that names the field', () => {
  const ok = { fn: 'cleanRun' as const, params: { p: 0.001 } }
  it('exactly one of curve and series', () => {
    expect(bad({} as never)).toEqual(['plot: a curve or a list of series'])
    expect(validatePlotStage({ kind: 'plot', curve: { fn: 'repFail3' }, series: [ok] } as never)).toEqual(['plot: either curve or series, not both'])
  })
  it('series: one to six, known functions, parameters each function needs and no others, shared x', () => {
    expect(bad({ series: [] })).toEqual(['plot series: one to 6 series'])
    expect(bad({ series: Array.from({ length: 7 }, () => ok) })).toEqual(['plot series: one to 6 series'])
    expect(bad({ series: Array.from({ length: 6 }, () => ok) })).toEqual([])
    expect(bad({ series: [{ fn: 'nope' as never }] })[0]).toMatch(/^plot series\[0\]\.fn: 'cleanRun', 'repLogicalVsD'/)
    expect(bad({ series: [{ fn: 'cleanRun' }] })).toEqual(['plot series[0].params.p: cleanRun needs it'])
    expect(bad({ series: [{ fn: 'surfaceVsP', params: { d: 7 } }] })).toEqual(['plot series[0].params.preset: surfaceVsP needs it'])
    expect(bad({ series: [{ fn: 'repLogicalVsP', params: { d: 7, p: 0.1 } }] })).toEqual(['plot series[0].params.p: repLogicalVsP does not use it (it needs d)'])
    expect(bad({ series: [{ fn: 'cleanRun', params: { p: 0.001, zz: 1 } as never }] })).toEqual(['plot series[0].params.zz: unknown (d, p, preset, vote, q, m)'])
    expect(bad({ series: [{ fn: 'repLogicalVsP', params: { d: 4 } }] })).toEqual(['plot series[0].params.d: an odd whole number up to 399'])
    expect(bad({ series: [{ fn: 'repLogicalVsP', params: { d: 401 } }] })[0]).toMatch(/params\.d/)
    expect(bad({ series: [{ fn: 'cleanRun', params: { p: 1.5 } }] })).toEqual(['plot series[0].params.p: a chance from 0 to 1'])
    expect(bad({ series: [{ fn: 'surfaceVsP', params: { d: 7, preset: 'nope' as never } }] })[0]).toMatch(/params\.preset: 'tdg-2.6', 'tdg-A10', 'bev22'/)
    expect(bad({ series: [{ fn: 'cleanRun', params: { p: 0.1, vote: 4 } }] })).toEqual(['plot series[0].params.vote: an odd whole number up to 99'])
    expect(bad({ series: [{ fn: 'repLogicalVsD', params: { p: 0.1, vote: 3 } }] })[0]).toMatch(/params\.vote: only cleanRun uses it/)
    expect(bad({ series: [{ ...ok, label: '' }] })).toEqual(['plot series[0].label: 1–24 characters'])
    expect(bad({ series: [{ ...ok, label: 'x'.repeat(25) }] })[0]).toMatch(/\.label/)
    expect(bad({ series: [ok, { fn: 'repLogicalVsD', params: { p: 0.01 } }] })).toEqual(['plot series: every series shares one x axis, but these mix steps N and d'])
  })
  it('xRange per kind of x, samples, and the markers and marks inside the range', () => {
    expect(bad({ series: [ok], xRange: { from: 5, to: 5 } })).toEqual(['plot xRange: from must be less than to'])
    expect(bad({ series: [ok], xRange: { from: 0, to: 50 } })).toEqual(['plot xRange: x is the number of steps N, so the range starts at 1 or more'])
    expect(bad({ series: [{ fn: 'repLogicalVsP', params: { d: 3 } }], xRange: { from: 0, to: 2 } })).toEqual(['plot xRange: x is a chance p, so the range runs inside [0, 1]'])
    expect(bad({ series: [{ fn: 'repLogicalVsD', params: { p: 0.1 } }], xRange: { from: 3, to: 120 } })).toEqual(['plot xRange: x is the distance d, so the range runs inside [1, 99]'])
    expect(bad({ series: [{ fn: 'repLogicalVsD', params: { p: 0.1 } }], xRange: { from: 4, to: 5 } })).toEqual(['plot xRange: a function of d is drawn at its odd whole values, so the range needs at least two of them'])
    expect(bad({ series: [ok], samples: 1 })).toEqual(['plot samples: a whole number 2–256'])
    expect(bad({ series: [ok], samples: 300 })[0]).toMatch(/^plot samples/)
    expect(bad({ series: [ok], markers: [{ x: 5000 }] })).toEqual(['plot markers: x = 5000 is outside the drawn range [1, 1000]'])
    expect(bad({ series: [{ fn: 'repLogicalVsD', params: { p: 0.1 } }], markers: [{ x: 4 }] })).toEqual(['plot markers: x = 4; a function of d is marked at an odd whole d'])
    expect(bad({ series: [{ fn: 'repLogicalVsD', params: { p: 0.1 } }], markers: [{ x: 5 }] })).toEqual([])
    expect(bad({ series: [ok], xRange: undefined, reportedMarks: [{ x: 5000, label: 'a', source: 's' }] })).toEqual(['plot reportedMarks: x = 5000 is outside the drawn range [1, 1000]'])
    expect(bad({ curve: { fn: 'repFail3' }, xRange: { from: 0, to: 1 } } as never)).toEqual(['plot xRange: only series mode has it (a curve takes curve.x)'])
  })
  it('xScale: linear or log, a positive range, not for a function of d; reportedMarks: at most six, with a label and a source', () => {
    expect(bad({ series: [ok], xScale: 'sqrt' as never })).toEqual(["plot xScale: 'linear' or 'log'"])
    expect(bad({ series: [{ fn: 'repLogicalVsP', params: { d: 3 } }], xRange: { from: 0, to: 1 }, xScale: 'log' })).toEqual(['plot xScale: log needs a range above 0'])
    expect(bad({ series: [{ fn: 'repLogicalVsD', params: { p: 0.1 } }], xScale: 'log' })).toEqual(['plot xScale: a function of d is drawn at odd whole values; use a linear x axis'])
    expect(bad({ series: [ok], xScale: 'log' })).toEqual([])
    const m = (i: number) => ({ x: 10 + i, label: `m${i}`, source: 'paper' })
    expect(bad({ series: [ok], reportedMarks: Array.from({ length: 6 }, (_, i) => m(i)) })).toEqual([])
    expect(bad({ series: [ok], reportedMarks: Array.from({ length: 7 }, (_, i) => m(i)) })).toEqual(['plot reportedMarks: at most 6'])
    expect(bad({ series: [ok], reportedMarks: [{ x: 10, label: 'a' } as never] })[0]).toMatch(/^plot reportedMarks\[0\]: \{ x, label \(1–40 characters\), source \}/)
  })
  it('a log y axis needs every series above 0', () => {
    expect(bad({ series: [{ fn: 'repLogicalVsP', params: { d: 3 } }], xRange: { from: 0, to: 1 }, yScale: 'log' })).toEqual(['plot yScale: log needs a series that stays above 0'])
    expect(bad({ series: [{ fn: 'surfaceVsD', params: { p: 0.001, preset: 'tdg-2.6' } }], yScale: 'log' })).toEqual([])
    expect(bad({ series: [ok], yScale: 'log', yLines: [{ y: 0 }] })).toEqual(['plot yScale: log needs yLines above 0'])
  })
})

describe('plot B1: interpolation and readouts', () => {
  const base = { series: [{ fn: 'cleanRun' as const, params: { p: 0.001 } }], xScale: 'log' as const }
  it('the same series slide their range (in the logarithm on a log axis); different series switch at the half-way point', () => {
    const a = R({ ...base, xRange: { from: 1, to: 100 } })
    const b = R({ ...base, xRange: { from: 10, to: 10000 } })
    expect(interpolate(a, b, 0)).toBe(a)
    expect(interpolate(a, b, 1)).toBe(b)
    const mid = interpolate(a, b, 0.5) as ResolvedPlot
    expect(mid.range.from).toBeCloseTo(10 ** 0.5, 9)
    expect(mid.range.to).toBeCloseTo(10 ** 3, 6)
    expect(mid.series![0].points).toHaveLength(a.series![0].points.length)
    const other = R({ series: [{ fn: 'cleanRun', params: { p: 0.01 } }], xScale: 'log', xRange: { from: 1, to: 100 } })
    expect(interpolate(a, other, 0.4)).toEqual(a)
    expect(interpolate(a, other, 0.6)).toEqual(other)
  })
  it('a value table: the range, each series at its first and last x, the markers and the printed marks', () => {
    const r = R({
      series: [{ fn: 'surfaceVsD', params: { p: 0.001, preset: 'tdg-2.6' }, label: 'fit' }],
      xRange: { from: 3, to: 7 },
      markers: [{ x: 5, label: 'd = 5' }],
      reportedMarks: [{ x: 7, label: 'printed d', source: 'the paper, section 2.6' }],
    })
    const t = plotReadouts(r).map((x) => x.text)
    expect(t).toHaveLength(4)
    expect(t[0]).toBe('d from 3 to 7')
    expect(t[1]).toMatch(/^fit: 0\.\d{4} → 3\.2 × 10⁻⁵$/)
    expect(t[2]).toMatch(/^d = 5: fit = /)
    expect(t[3]).toBe('as printed: printed d')
    expect(plotReadouts(r)[0].text).toBe('d from 3 to 7')
    expect(plotReadouts(r).at(-1)!.text).toBe('as printed: printed d')
    // the first and last values are the engine's
    expect(r.series![0].points[0].y).toBe(surfaceFit(3, 0.001, 'tdg-2.6'))
    expect(r.series![0].points.at(-1)!.y).toBe(surfaceFit(7, 0.001, 'tdg-2.6'))
  })
})

describe('plot B1: the one scene', () => {
  const BOXES: [Mode, number, number, boolean, 'full' | 'top' | 'bottom'][] = [
    ['stage', 506, 785, false, 'full'],
    ['stage', 375, 640, false, 'full'],
    ['stage', 506, 360, false, 'top'],
    ['stage', 320, 300, true, 'full'],
    ['print', 320, 300, false, 'full'],
  ]
  const states: Omit<PlotSeriesState, 'kind'>[] = [
    { series: [{ fn: 'surfaceVsD', params: { p: 0.001, preset: 'tdg-2.6' } }, { fn: 'surfaceVsD', params: { p: 0.002, preset: 'tdg-2.6' } }, { fn: 'repLogicalVsD', params: { p: 0.01 } }], yScale: 'log', xRange: { from: 3, to: 21 }, markers: [{ x: 7, label: 'd = 7' }], reportedMarks: [{ x: 13, label: 'printed', source: 'paper' }] },
    { series: [{ fn: 'cleanRun', params: { p: 0.001 } }, { fn: 'cleanRun', params: { p: 0.0001 } }, { fn: 'cleanRun', params: { p: 0.00001 } }], xScale: 'log', xRange: { from: 1, to: 1000000 }, yLines: [{ y: 0.5, label: 'half' }] },
    { series: [{ fn: 'surfaceVsP', params: { d: 7, preset: 'tdg-2.6' } }, { fn: 'surfaceVsP', params: { d: 7, preset: 'tdg-A10' } }, { fn: 'surfaceVsP', params: { d: 7, preset: 'bev22' } }, { fn: 'surfaceVsP', params: { d: 5, preset: 'bev22' } }, { fn: 'surfaceVsP', params: { d: 9, preset: 'bev22' } }, { fn: 'surfaceVsP', params: { d: 11, preset: 'bev22' } }], xScale: 'log', yScale: 'log' },
    { series: [{ fn: 'repLogicalVsP', params: { d: 3 } }, { fn: 'repLogicalVsP', params: { d: 5 }, label: 'five copies' }], xRange: { from: 0, to: 0.5 } },
  ]
  it('draws every state in every box with no NaN: one line for each series, a dot for every point of a function of d, a legend entry for each, the as-printed marks hollow', () => {
    for (const st of states)
      for (const [mode, w, h, bare, slot] of BOXES) {
        const r = R(st)
        const html = draw(r, mode, w, h, bare, slot)
        const where = `${JSON.stringify(st.series![0])} ${mode} ${w}x${h} ${slot}`
        expect(html, where).not.toMatch(/NaN|Infinity|undefined/)
        expect(html.match(/data-anchor="series"/g), where).toHaveLength(r.series!.length)
        expect(html.match(/data-legend="plot"/g), where).toHaveLength(1)
        const dots = r.series!.reduce((s, sr) => s + (sr.discrete ? sr.points.length : 0), 0)
        const seriesGroups = [...html.matchAll(/data-anchor="series"[^>]*>.*?<\/g>/gs)].map((m) => m[0]).join('')
        expect(seriesGroups.match(/<circle/g)?.length ?? 0, where).toBe(dots)
        expect(html.match(/data-anchor="reported"/g)?.length ?? 0, where).toBe(r.reportedMarks?.length ?? 0)
        if (r.reportedMarks?.length) expect(html).toContain('as printed')
        for (const sr of r.series!) expect(html, where).toContain(sr.label)
      }
  })
  it('a log x axis is labelled by decades, a linear one by its two ends; the print figure lists the value table as text lines', () => {
    const log = draw(R(states[1]), 'stage', 506, 785)
    for (const t of ['10²', '10⁴', '10⁶']) expect(log).toContain(`>${t}<`)
    const lin = draw(R(states[3]), 'stage', 506, 785)
    expect(lin).toContain('>0<')
    expect(lin).toContain('>0.5<')
    const print = draw(R(states[0]), 'print', 320, 300)
    expect(print).toContain('d from 3 to 21')
    expect(print).toContain('as printed: printed')
  })
  it('the legend is one column when its labels are too long for two, and its rows add to the bottom margin', () => {
    const r = R(states[2])
    expect(legendCols(r, 200)).toBe(1)
    expect(legendRows(r, 200)).toBe(6)
    const short = R(states[3])
    expect(legendCols(short, 400)).toBe(2)
    expect(legendRows(short, 400)).toBe(1)
    expect(SERIES_STYLE).toHaveLength(6)
    expect(new Set(SERIES_STYLE.map((s) => `${s.cls}|${s.dash ?? ''}`)).size).toBe(6)
  })
  it('the print figure is the same scene, numbered and titled with the passport', () => {
    const html = renderToString(<FigureFor layout={S({ series: [{ fn: 'cleanRun', params: { p: 0.001 } }], xScale: 'log', xRange: { from: 1, to: 1000 } })} number="B1.9" caption="a clean run" />)
    expect(html).toContain('<title>Fig. B1.9: CURVE · engine-sampled</title>')
    const { w, h } = plotPrintSize(R({ series: [{ fn: 'cleanRun', params: { p: 0.001 } }], xScale: 'log', xRange: { from: 1, to: 1000 } }))
    expect(html).toContain(`viewBox="0 0 ${w} ${h}"`)
    expect(h).toBeGreaterThanOrEqual(220)
    expect(html).not.toMatch(/NaN|Infinity|undefined|no print drawing yet/)
  })
  it('the series figure is taller than a named curve’s (its value table and legend need room); a named curve keeps 320 × 220', () => {
    expect(plotPrintSize(resolve({ kind: 'plot', curve: { fn: 'repFail3' } }, 1) as ResolvedPlot)).toEqual({ w: 320, h: 220 })
    expect(svgKindDef('plot')!.print).toEqual({ w: 320, h: 220 })
    const big = plotPrintSize(R(states[2]))
    expect(big.h).toBeGreaterThan(plotPrintSize(R(states[3])).h)
    // the plot itself keeps at least 130 px between the text above it and the legend below it
    for (const st of states) {
      const r = R(st)
      const lines = plotReadouts(r).flatMap((x) => (x.text.length > 50 ? [x.text.slice(0, 50), x.text.slice(50)] : [x.text])).length
      expect(plotPrintSize(r).h - (14 + 13 * lines) - 28 - 15 * legendRows(r, 254) - 8, JSON.stringify(st.series![0])).toBeGreaterThanOrEqual(110)
    }
    // and the scene fits its own figure
    for (const st of states) {
      const r = R(st)
      const { w, h } = plotPrintSize(r)
      expect(draw(r, 'print', w, h)).not.toMatch(/NaN|Infinity|undefined/)
    }
  })
  it('seriesValue is the engine’s function for every kind', () => {
    expect(seriesValue({ fn: 'cleanRun', params: { p: 0.01 } }, 10)).toBe(cleanRun(10, 0.01))
    expect(seriesValue({ fn: 'repLogicalVsD', params: { p: 0.1 } }, 5)).toBe(repetitionLogical(5, 0.1))
    expect(seriesValue({ fn: 'repLogicalVsP', params: { d: 5 } }, 0.1)).toBe(repetitionLogical(5, 0.1))
    expect(seriesValue({ fn: 'surfaceVsP', params: { d: 5, preset: 'bev22' } }, 0.003)).toBe(surfaceFit(5, 0.003, 'bev22'))
    expect(seriesValue({ fn: 'surfaceVsD', params: { p: 0.003, preset: 'tdg-A10' } }, 9)).toBe(surfaceFit(9, 0.003, 'tdg-A10'))
  })
})
