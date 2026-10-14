/**
 * `plot` series `voteFail` and the authored whole x list `xs` (B3, P-B3 S-f; additive): the failure chance of the majority vote of R repeated readings of the product of m seam checks, each
 * check misread with chance q, drawn at the chosen odd R as points joined by a line on a base-10 log y axis with a reference line at 1 in 1000. Content writes the function, q, m and the x list;
 * every y is physics/qec/timelike.ts `voteFail(R, productFlip(q, m))`. These tests check the points against the engine and against a separate binomial sum, the x list and its limits, every
 * validation message, interpolation, the readouts, and that the one scene draws a log axis from 7.5 × 10⁻² down to 6 × 10⁻⁵ with a line at 10⁻³ and no two text labels on top of each other.
 */
import { renderToString } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import type { PlotSeriesState, PlotState } from '../../content/stage'
import { productFlip, voteFail } from '../../physics/qec/timelike'
import { FigureFor } from '../figures/FigureFor'
import { interpolate } from '../interp'
import { resolve, validateLayout, validateStage } from '../resolve'
import type { ResolvedPlot } from '../types'
import { PlotScene, plotPrintSize } from './PlotScene'
import { PLOT_LIMITS, ROUNDS_RANGE, SERIES_X, plotReadouts, resolvePlotStage, seriesValue, validatePlotStage } from './plot'
import './kinds'

const S = (x: Omit<PlotSeriesState, 'kind'>): PlotSeriesState => ({ kind: 'plot', ...x })
const R = (x: Omit<PlotSeriesState, 'kind'>) => resolvePlotStage(S(x), 1)
const bad = (x: Omit<PlotSeriesState, 'kind'> | Omit<PlotState, 'kind'>) => validatePlotStage({ kind: 'plot', ...x } as PlotSeriesState)
const draw = (r: ResolvedPlot, mode: 'stage' | 'print', w: number, h: number, bare = false, slot: 'full' | 'top' | 'bottom' = 'full') =>
  renderToString(
    <svg viewBox={`0 0 ${w} ${h}`}>
      <PlotScene state={r} mode={mode} width={w} height={h} bare={bare} slot={slot} />
    </svg>,
  )

const RS = [1, 3, 5, 7, 9, 11]
/** The plan's picture: m = 1 check read with q = 0.075, so a single reading is wrong with chance 0.075 and eleven readings vote wrong about 6 in 100 000. */
const PLAN = S({ series: [{ fn: 'voteFail', params: { q: 0.075, m: 1 }, label: 'vote failure' }], xs: RS, xRange: { from: 1, to: 11 }, yScale: 'log', yLines: [{ y: 1e-3, label: '1 in 1000' }] })

/** Independent route: the tail of the binomial sum with its own binomial coefficient (Pascal's rule), no shared code with the engine. */
function tail(R: number, p: number): number {
  const row: number[] = [1]
  for (let n = 1; n <= R; n++) for (let k = n; k >= 1; k--) row[k] = (row[k] ?? 0) + row[k - 1]
  let s = 0
  for (let j = (R + 1) / 2; j <= R; j++) s += row[j] * p ** j * (1 - p) ** (R - j)
  return s
}

describe('plot voteFail: every point is the engine’s', () => {
  it('y at odd R is voteFail(R, productFlip(q, m)), and it is the binomial tail by a separate sum', () => {
    const r = R({ series: [{ fn: 'voteFail', params: { q: 0.05, m: 3 } }], xs: RS })
    const p = productFlip(0.05, 3)
    expect(r.series![0].points.map((pt) => pt.x)).toEqual(RS)
    for (const pt of r.series![0].points) {
      expect(pt.y).toBe(voteFail(pt.x, p))
      expect(pt.y / tail(pt.x, p)).toBeCloseTo(1, 12)
    }
    expect(seriesValue({ fn: 'voteFail', params: { q: 0.05, m: 3 } }, 1)).toBeCloseTo(p, 14)
    expect(SERIES_X.voteFail).toBe('R')
  })
  it('the plan’s picture runs from 7.5 × 10⁻² (one reading) down to about 6 × 10⁻⁵ (eleven), and crosses the line at 1 in 1000 between R = 5 and R = 7', () => {
    const r = resolve(PLAN, 1) as ResolvedPlot
    const ys = r.series![0].points.map((p) => p.y)
    expect(ys[0]).toBeCloseTo(0.075, 12)
    expect(ys[5]).toBeGreaterThan(5e-5)
    expect(ys[5]).toBeLessThan(7e-5)
    expect(ys[2]).toBeGreaterThan(1e-3)
    expect(ys[3]).toBeLessThan(1e-3)
    for (let i = 1; i < ys.length; i++) expect(ys[i]).toBeLessThan(ys[i - 1])
    expect(r.yScale).toBe('log')
    expect(r.yMin).toBeLessThan(ys[5])
    expect(r.yMax).toBeGreaterThan(ys[0])
    expect(r.series![0].discrete).toBe(true)
    expect(r.xs).toEqual(RS)
    expect(r.xLabel).toBe('rounds R')
    expect(r.series![0].label).toBe('vote failure')
  })
  it('without xs a function of R is drawn at every odd R of its range (default 1 … 11); xs alone sets the range', () => {
    expect(ROUNDS_RANGE).toEqual({ from: 1, to: 11 })
    expect(R({ series: [{ fn: 'voteFail', params: { q: 0.05, m: 2 } }] }).series![0].points.map((p) => p.x)).toEqual(RS)
    expect(R({ series: [{ fn: 'voteFail', params: { q: 0.05, m: 2 } }], xRange: { from: 3, to: 9 } }).series![0].points.map((p) => p.x)).toEqual([3, 5, 7, 9])
    const r = R({ series: [{ fn: 'voteFail', params: { q: 0.05, m: 2 } }], xs: [1, 5, 9] })
    expect(r.series![0].points.map((p) => p.x)).toEqual([1, 5, 9])
    expect(r.range).toEqual({ from: 1, to: 9 })
    expect(R({ series: [{ fn: 'voteFail', params: { q: 0.05, m: 2 } }] }).xs).toBeUndefined()
  })
  it('the value table, the marker and the default legend name', () => {
    const r = resolve(PLAN, 1) as ResolvedPlot
    const t = plotReadouts(r).map((x) => x.text)
    expect(t[0]).toBe('rounds R from 1 to 11')
    expect(t[1]).toMatch(/^vote failure: 0\.0750 → \d\.\d × 10/)
    expect(R({ series: [{ fn: 'voteFail', params: { q: 0.05, m: 3 } }], xs: [1, 3] }).series![0].label).toBe('vote, q = 0.05, m = 3')
    const m = R({ series: [{ fn: 'voteFail', params: { q: 0.05, m: 3 } }], xs: RS, markers: [{ x: 5, label: 'R = 5' }] })
    expect(m.markers[0].y).toBe(voteFail(5, productFlip(0.05, 3)))
  })
})

describe('plot voteFail: validation names the field', () => {
  it('accepts the plan’s picture and the limits', () => {
    expect(validateStage(PLAN)).toEqual([])
    expect(bad({ series: [{ fn: 'voteFail', params: { q: 0, m: 8 } }], xs: [1, 11] })).toEqual(['plot yScale: log needs a series that stays above 0'].filter(() => false))
    expect(bad({ series: [{ fn: 'voteFail', params: { q: 1, m: 1 } }], xs: [1, 11] })).toEqual([])
    expect([PLOT_LIMITS.roundsMax, PLOT_LIMITS.checksMax]).toEqual([11, 8])
  })
  it('q is a chance, m is a whole number 1–8, both are needed and nothing else is accepted', () => {
    expect(bad({ series: [{ fn: 'voteFail', params: { m: 3 } }] })).toEqual(['plot series[0].params.q: voteFail needs it'])
    expect(bad({ series: [{ fn: 'voteFail', params: { q: 0.1 } }] })).toEqual(['plot series[0].params.m: voteFail needs it'])
    expect(bad({ series: [{ fn: 'voteFail', params: { q: 1.5, m: 3 } }] })).toEqual(['plot series[0].params.q: a chance from 0 to 1'])
    expect(bad({ series: [{ fn: 'voteFail', params: { q: 0.1, m: 9 } }] })).toEqual(['plot series[0].params.m: a whole number 1–8 (checks)'])
    expect(bad({ series: [{ fn: 'voteFail', params: { q: 0.1, m: 2.5 } }] })).toEqual(['plot series[0].params.m: a whole number 1–8 (checks)'])
    expect(bad({ series: [{ fn: 'voteFail', params: { q: 0.1, m: 2, p: 0.1 } }] })).toEqual(['plot series[0].params.p: voteFail does not use it (it needs q and m)'])
    expect(bad({ series: [{ fn: 'cleanRun', params: { p: 0.1, q: 0.1 } }] })).toEqual(['plot series[0].params.q: cleanRun does not use it (it needs p)'])
  })
  it('xs: odd whole numbers, increasing, two or more, at most 1 … 11 and six of them for R; only for a function of d or R; inside xRange', () => {
    const fn = { fn: 'voteFail' as const, params: { q: 0.1, m: 2 } }
    expect(bad({ series: [fn], xs: [1, 3, 4] })[0]).toMatch(/^plot xs: two to six odd whole numbers from 1 to 11, increasing$/)
    expect(bad({ series: [fn], xs: [3, 1] })[0]).toMatch(/^plot xs: /)
    expect(bad({ series: [fn], xs: [1, 13] })[0]).toMatch(/^plot xs: /)
    expect(bad({ series: [fn], xs: [5] })[0]).toMatch(/^plot xs: /)
    expect(bad({ series: [fn], xs: [1, 1, 3] })[0]).toMatch(/^plot xs: /)
    expect(bad({ series: [fn], xs: [1, 3, 5, 7, 9, 11, 13] })[0]).toMatch(/^plot xs: /)
    expect(bad({ series: [fn], xs: [1, 3.5] })[0]).toMatch(/^plot xs: /)
    expect(bad({ series: [fn], xs: [1, 3, 5], xRange: { from: 1, to: 3 } })).toEqual(['plot xs: every x lies inside xRange [1, 3]'])
    expect(bad({ series: [{ fn: 'cleanRun', params: { p: 0.1 } }], xs: [1, 3] })).toEqual(['plot xs: only a function of d or of the rounds R is drawn at chosen whole values'])
    expect(bad({ series: [{ fn: 'repLogicalVsD', params: { p: 0.1 } }], xs: [3, 5, 99] })).toEqual([])
    expect(bad({ curve: { fn: 'repFail3' }, xs: [1, 3] } as never)).toEqual(['plot xs: only series mode has it'])
  })
  it('the range of R runs inside 1 … 11; R shares no axis with d or N; R is drawn on a linear x axis; markers sit at odd R', () => {
    const fn = { fn: 'voteFail' as const, params: { q: 0.1, m: 2 } }
    expect(bad({ series: [fn], xRange: { from: 1, to: 13 } })).toEqual(['plot xRange: x is the rounds R, so the range runs inside [1, 11]'])
    expect(bad({ series: [fn], xRange: { from: 4, to: 5 } })).toEqual(['plot xRange: a function of R is drawn at its odd whole values, so the range needs at least two of them'])
    expect(bad({ series: [fn, { fn: 'repLogicalVsD', params: { p: 0.1 } }] })[0]).toMatch(/every series shares one x axis, but these mix rounds R and d/)
    expect(bad({ series: [fn], xScale: 'log' })).toEqual(['plot xScale: a function of R is drawn at odd whole values; use a linear x axis'])
    expect(bad({ series: [fn], markers: [{ x: 4 }] })).toEqual(['plot markers: x = 4; a function of R is marked at an odd whole R'])
    expect(bad({ series: [fn], markers: [{ x: 13 }] })[0]).toMatch(/outside the drawn range/)
  })
  it('a log y axis needs positive values: q = 0 (a vote that never fails) is refused with a message, the lines must be above 0', () => {
    expect(bad({ series: [{ fn: 'voteFail', params: { q: 0, m: 3 } }], xs: [1, 3], yScale: 'log' })).toEqual(['plot yScale: log needs a series that stays above 0'])
    expect(bad({ series: [{ fn: 'voteFail', params: { q: 0.1, m: 3 } }], xs: [1, 3], yScale: 'log', yLines: [{ y: 0 }] })).toEqual(['plot yScale: log needs yLines above 0'])
  })
  it('reaches the layout checks: a split of the readout history above and this plot below validates', () => {
    const top = { kind: 'spacetime' as const, history: { mode: 'readout' as const, checks: 1, rounds: 5, q: 0.075, seed: 3 }, show: ['readings' as const, 'product' as const, 'vote' as const] }
    expect(validateLayout({ layout: 'split', top, bottom: PLAN })).toEqual([])
  })
})

describe('plot voteFail: interpolation', () => {
  it('the same series and the same xs move their lines and marks; another xs or another q switches at the half-way point', () => {
    const a = resolve(S({ ...PLAN, yLines: [{ y: 1e-3 }] }), 1)
    const b = resolve(S({ ...PLAN, yLines: [{ y: 1e-2 }] }), 1)
    const mid = interpolate(a, b, 0.5) as ResolvedPlot
    expect(mid.xs).toEqual(RS)
    expect(mid.yLines[0].y).toBeCloseTo(5.5e-3, 12)
    const c = resolve(S({ ...PLAN, xs: [1, 5, 9] }), 1)
    expect(interpolate(a, c, 0.4)).toEqual(a)
    expect(interpolate(a, c, 0.6)).toEqual(c)
    const d = resolve(S({ ...PLAN, series: [{ fn: 'voteFail', params: { q: 0.1, m: 1 } }] }), 1)
    expect(interpolate(a, d, 0.4)).toEqual(a)
    expect(interpolate(a, d, 0.6)).toEqual(d)
  })
})

/** Every text element of a rendered figure with its box: x and y as drawn, a width from the characters (6.4 px each at 11–12 px type), a height of 11. */
function textBoxes(html: string): { text: string; x0: number; x1: number; y0: number; y1: number }[] {
  const out: { text: string; x0: number; x1: number; y0: number; y1: number }[] = []
  for (const m of html.matchAll(/<text([^>]*)>(.*?)<\/text>/g)) {
    const attrs = m[1]
    const x = Number(/\bx="([-\d.]+)"/.exec(attrs)?.[1])
    const y = Number(/\by="([-\d.]+)"/.exec(attrs)?.[1])
    const anchor = /text-anchor="(\w+)"/.exec(attrs)?.[1] ?? 'start'
    const text = m[2].replace(/<[^>]*>/g, '')
    if (!Number.isFinite(x) || !Number.isFinite(y) || !text) continue
    const w = text.length * 6.2
    const x0 = anchor === 'end' ? x - w : anchor === 'middle' ? x - w / 2 : x
    out.push({ text, x0, x1: x0 + w, y0: y - 9, y1: y + 2 })
  }
  return out
}
const clash = (a: ReturnType<typeof textBoxes>[number], b: ReturnType<typeof textBoxes>[number]) => a.x0 < b.x1 - 0.5 && b.x0 < a.x1 - 0.5 && a.y0 < b.y1 - 0.5 && b.y0 < a.y1 - 0.5

describe('plot voteFail: the scene', () => {
  const r = resolve(PLAN, 1) as ResolvedPlot
  const boxes: [string, 'stage' | 'print', number, number, boolean, 'full' | 'top' | 'bottom'][] = [
    ['print', 'print', 320, plotPrintSize(r).h, false, 'full'],
    ['stage', 'stage', 640, 560, false, 'full'],
    ['phone', 'stage', 375, 520, false, 'full'],
    ['split-bottom', 'stage', 375, 300, false, 'bottom'],
    ['bare', 'stage', 360, 320, true, 'full'],
  ]
  it('draws the log axis by decades, the points, the line at 1 in 1000 and the legend, with no NaN, in every box', () => {
    for (const [name, mode, w, h, bare, slot] of boxes) {
      const html = draw(r, mode, w, h, bare, slot)
      expect(html, name).not.toMatch(/NaN|Infinity|undefined/)
      expect(html, name).toContain('data-anchor="series"')
      expect(html, name).toContain('data-anchor="y-line"')
      expect((html.match(/<circle[^>]*class="fg-state-fill"/g) ?? []).length, name).toBe(6)
      for (const e of ['10⁻⁴', '10⁻³', '10⁻²', '10⁻¹']) expect(html, `${name} ${e}`).toContain(e)
      expect(html, name).toContain('1 in 1000')
      expect(html, name).toContain('vote failure')
    }
  })
  it('no two text labels overlap: the decade labels, the 1-in-1000 label, the x labels, the legend and the figure’s value table', () => {
    for (const [name, mode, w, h, bare, slot] of boxes) {
      const t = textBoxes(draw(r, mode, w, h, bare, slot))
      expect(t.length, name).toBeGreaterThan(8)
      for (let i = 0; i < t.length; i++)
        for (let j = i + 1; j < t.length; j++) expect(clash(t[i], t[j]), `${name}: "${t[i].text}" and "${t[j].text}"`).toBe(false)
      // everything stays inside the box
      for (const b of t) {
        expect(b.x0, `${name}: ${b.text}`).toBeGreaterThanOrEqual(-1)
        expect(b.x1, `${name}: ${b.text}`).toBeLessThanOrEqual(w + 1)
      }
    }
  })
  it('the print figure is taller for its value table and legend, and carries the plan’s numbers', () => {
    const html = renderToString(<FigureFor layout={PLAN} number="B3.5" />)
    expect(html).not.toMatch(/NaN|Infinity|undefined|no print drawing yet/)
    expect(html).toContain('rounds R from 1 to 11')
    expect(html).toContain('0.0750')
    expect(plotPrintSize(r).h).toBeGreaterThanOrEqual(220)
  })
})
