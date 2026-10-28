/**
 * The three plot curves of Chapter Q27 (P-Q27-story §9.2, the smallest additions): `transmonF01r1` and `transmonF01r20` (f01(n_g)/f01(1/2) at E_J/E_C = 1 and 20, x = n_g 0 … 1) and
 * `transmonDispersion` (the exact charge dispersion in E_C, x = E_J/E_C 2 … 30, a log y axis). Every y is the engine's (physics/qc/solid.ts), checked here against the numpy twin
 * (__fixtures__/qc-solid.json: LAPACK for the band, 50-digit mpmath for the dispersion).
 */
import { createElement } from 'react'
import { renderToString } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import raw from '../../physics/__fixtures__/qc-solid.json?raw'
import type { PlotCurveName, PlotState } from '../../content/stage'
import { resolve, validateStage } from '../resolve'
import type { ResolvedPlot } from '../types'
import { PlotScene } from './PlotScene'
import './kinds'

const FX: any = JSON.parse(raw)
const pl = (fn: PlotCurveName, o: Omit<PlotState, 'kind' | 'curve'> & { curve?: Partial<NonNullable<PlotState['curve']>> } = {}): PlotState => ({
  kind: 'plot',
  ...o,
  curve: { fn, ...(o.curve ?? {}) },
})
const R = (st: PlotState) => resolve(st, 1) as ResolvedPlot
const close = (a: number, b: number, eps = 1e-9) => expect(Math.abs(a - b), `${a} vs ${b}`).toBeLessThan(eps)

describe('Q27 curves: the engine’s numbers', () => {
  it('the band: ratio 1 swings between 1.3757 at n_g = 0 and 1 at 1/2 and is symmetric; ratio 20 is flat (numpy)', () => {
    const a = R(pl('transmonF01r1', { curve: { vs: 'transmonF01r20', x: { from: 0, to: 1 }, samples: 8 }, markers: [{ x: 0 }, { x: 0.5 }] }))
    expect(a.points.length).toBe(9)
    expect(a.names).toEqual({ fn: 'ratio 1', vs: 'ratio 20' })
    expect(a.xLabel).toBe('n_g')
    close(a.markers[0].y, FX.spread['1'].v, 1e-12)
    close(a.markers[0].yVs!, FX.spread['20'].v, 1e-12)
    close(a.markers[1].y, 1, 1e-12)
    close(a.points[2].y, a.points[6].y, 1e-12)
    for (const p of a.vs!.points) close(p.y, 1, 1e-7)
  })
  it('the dispersion falls from 10^-2 to 10^-12 over E_J/E_C = 2 … 30 and matches the 50-digit table', () => {
    const a = R(pl('transmonDispersion', { curve: { x: { from: 2, to: 30 }, samples: 28 }, markers: [{ x: 10 }, { x: 20 }], yScale: 'log' }))
    expect(a.points.length).toBe(29)
    for (const p of a.points) expect(p.y).toBeGreaterThan(0)
    for (const r of ['5', '10', '15', '20', '25', '30']) {
      const p = a.points.find((q) => Math.abs(q.x - Number(r)) < 1e-9)!
      close(p.y, FX.dispersion[r].v, FX.dispersion[r].tol)
    }
    for (let k = 1; k < a.points.length; k++) expect(a.points[k].y).toBeLessThan(a.points[k - 1].y)
  })
  it('validation: the three curves are accepted with markers and a log axis', () => {
    expect(validateStage(pl('transmonF01r1', { markers: [{ x: 0.5, label: 'sweet spot' }] }))).toEqual([])
    expect(validateStage(pl('transmonF01r20', { curve: { x: { from: 0, to: 1 } } }))).toEqual([])
    expect(validateStage(pl('transmonDispersion', { yScale: 'log', markers: [{ x: 10 }] }))).toEqual([])
  })
  it('every curve draws inside its box with no NaN, stage and print', () => {
    for (const fn of ['transmonF01r1', 'transmonF01r20', 'transmonDispersion'] as PlotCurveName[]) {
      const st = pl(fn, fn === 'transmonDispersion' ? { yScale: 'log' } : {})
      expect(validateStage(st), fn).toEqual([])
      for (const mode of ['stage', 'print'] as const) {
        const html = renderToString(createElement('svg', null, createElement(PlotScene, { state: R(st), mode, width: 320, height: 240 })))
        expect(html, `${fn} ${mode}`).not.toMatch(/NaN|undefined|Infinity/)
      }
    }
  })
})
