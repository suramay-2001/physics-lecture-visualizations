/**
 * The `step` field (GANDALF platform G2): a staircase for histograms and probability mass functions, on the optics bench's `OpticsCurve` and on the `plot` kind's named curve and series.
 * One pure path helper (widgets/opticsBench/plot.ts `stepPathOf`) draws both; the plot kind carries the flag through resolve, interpolation and validation.
 */
import { renderToString } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import type { PlotSeriesState, PlotState } from '../../content/stage'
import { pathOf, stepPathOf } from '../../widgets/opticsBench/plot'
import { opticsPresetProblems as validatePreset } from '../../widgets/opticsBench/validate'
import type { OpticsPreset } from '../../widgets/opticsBench/presets'
import { interpolate } from '../interp'
import { resolve, validateStage } from '../resolve'
import type { ResolvedPlot } from '../types'
import { PlotScene } from './PlotScene'
import './kinds'

const id = (v: number) => v
describe('stepPathOf: each sample is held across the cell between the midpoints to its neighbours', () => {
  const pts = [{ x: 0, y: 1 }, { x: 1, y: 3 }, { x: 2, y: 2 }]
  it('draws a staircase through the samples, with half cells at the two ends', () => {
    expect(stepPathOf(pts, id, id)).toBe('M0.00 1.00L0.50 1.00L0.50 3.00L1.50 3.00L1.50 2.00L2.00 2.00')
  })
  it('breaks the path at a gap, as the plain path does, and starts a new run after it', () => {
    const g = [{ x: 0, y: 1 }, { x: 1, y: Number.NaN }, { x: 2, y: 2 }, { x: 3, y: 2 }]
    expect(stepPathOf(g, id, id)).toBe('M0.00 1.00L0.50 1.00M1.50 2.00L2.50 2.00L2.50 2.00L3.00 2.00')
    expect(pathOf(g, id, id).split('M').length).toBe(stepPathOf(g, id, id).split('M').length)
    expect(stepPathOf([], id, id)).toBe('')
    expect(stepPathOf([{ x: 3, y: 1 }], id, id)).toBe('M3.00 1.00L3.00 1.00')
  })
  it('never writes NaN into a path', () => {
    expect(stepPathOf([{ x: 0, y: 1 }, { x: 1, y: Number.NaN }], id, id)).not.toContain('NaN')
  })
})

describe('OpticsCurve.step: the bench accepts a boolean and refuses anything else', () => {
  const base = (step: unknown): OpticsPreset => ({
    title: 'Counts',
    question: 'How are the counts spread?',
    sliders: [{ key: 'm', label: 'Mean m', min: 1, max: 30, step: 1, default: 5, unit: '' }],
    x: { label: 'counts', unit: '', from: 0, to: 40 },
    y: { label: 'chance', unit: '', from: 0, to: 1 },
    curves: (p) => [{ label: 'bright', f: (x) => Math.exp(-p.m) * p.m ** Math.round(x) / [1, 1, 2, 6, 24, 120, 720, 5040][Math.min(7, Math.round(x))], step: step as boolean }],
    readouts: (p) => [{ label: 'mean', value: p.m, unit: '', digits: 1 }],
  })
  it('true and false are valid; a string is not', () => {
    expect(validatePreset('p', base(true)).filter((m) => m.includes('step'))).toEqual([])
    expect(validatePreset('p', base(false)).filter((m) => m.includes('step'))).toEqual([])
    expect(validatePreset('p', base('yes')).join()).toContain('has step "yes"')
  })
})

describe('plot: step on a named curve and on series', () => {
  const curve = (step?: boolean): PlotState => ({ kind: 'plot', curve: { fn: 'chshVsPhase', samples: 8, ...(step === undefined ? {} : { step }) } })
  const series = (step?: boolean): PlotSeriesState => ({ kind: 'plot', series: [{ fn: 'cleanRun', params: { p: 0.01 }, ...(step === undefined ? {} : { step }) }], samples: 6 })
  const R = (st: PlotState | PlotSeriesState) => resolve(st, 1) as ResolvedPlot
  it('is carried only when asked for: every older plot resolves exactly as before', () => {
    expect('step' in R(curve())).toBe(false)
    expect('step' in R(curve(false))).toBe(false)
    expect(R(curve(true)).step).toBe(true)
    expect('step' in R(series())).toBe(false)
    expect('step' in R(series())).toBe(false)
    expect(R(series(true)).series![0].step).toBe(true)
    expect('step' in R(series(false)).series![0]).toBe(false)
    expect(R(curve(true)).points).toEqual(R(curve()).points)
  })
  it('validates as a boolean', () => {
    expect(validateStage(curve(true))).toEqual([])
    expect(validateStage(series(true))).toEqual([])
    expect(validateStage({ ...curve(), curve: { fn: 'chshVsPhase', step: 'yes' as unknown as boolean } }).join()).toContain('curve.step')
    expect(validateStage({ ...series(), series: [{ fn: 'cleanRun', params: { p: 0.01 }, step: 1 as unknown as boolean }] }).join()).toContain('series[0].step')
  })
  it('survives interpolation between two states with the same inputs, and a change of step switches', () => {
    const a = R(curve(true))
    const b = R({ ...curve(true), curve: { fn: 'chshVsPhase', samples: 8, step: true, x: { from: 0, to: 90 } } })
    expect((interpolate(a, b, 0.5) as ResolvedPlot).step).toBe(true)
    const c = R(curve())
    expect((interpolate(a, c, 0.25) as ResolvedPlot).step).toBe(true)
    expect((interpolate(a, c, 0.75) as ResolvedPlot).step).toBeUndefined()
    const s = R(series(true))
    expect((interpolate(s, R(series(true)), 0.5) as ResolvedPlot).series![0].step).toBe(true)
  })
  it('draws a staircase: the path of a stepped curve has twice the vertices, all horizontal or vertical', () => {
    const draw = (r: ResolvedPlot) => renderToString(<svg><PlotScene state={r} mode="print" width={320} height={220} /></svg>)
    const plain = draw(R(curve()))
    const stepped = draw(R(curve(true)))
    const d = (h: string) => /data-anchor="curve"/.exec(h) && /<path d="([^"]+)"[^>]*data-anchor="curve"/.exec(h)![1]
    const pd = d(plain)!
    const sd = d(stepped)!
    expect(sd).not.toBe(pd)
    expect(sd).not.toContain('NaN')
    const verts = (x: string) => (x.match(/[ML]/g) ?? []).length
    expect(verts(sd)).toBe(2 * verts(pd))
    const sdSeries = draw(R(series(true)))
    const plainSeries = draw(R(series()))
    expect(sdSeries).not.toBe(plainSeries)
    expect(sdSeries).not.toMatch(/NaN|undefined/)
  })
})
