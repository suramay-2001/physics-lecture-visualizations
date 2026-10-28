/**
 * The five plot curves of Chapter Q23 (P-Q23-story §9.2 S2): `holevoChiPair`, `accessibleInfoPair`, `usdBoundPair`, `usdFailPair`, `bscCapacity`. Every y is the engine's
 * (physics/qc/infoq.ts) and is checked against the numpy twin (__fixtures__/qc-infoq.json, `curves`) and the closed forms: chi = h((1 + s)/2), the best reading 1 - h((1 - sqrt(1 - s^2))/2),
 * the bound 1 - chi, the exact failure s, the capacity 1 - h(f).
 */
import { createElement } from 'react'
import { renderToString } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import raw from '../../physics/__fixtures__/qc-infoq.json?raw'
import type { PlotCurveName, PlotState } from '../../content/stage'
import { binaryEntropy } from '../../physics/qc/info'
import { interpolate } from '../interp'
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
const near = (r: ResolvedPlot, x: number) => r.points.reduce((a, b) => (Math.abs(b.x - x) < Math.abs(a.x - x) ? b : a))

describe('Q23 curves: the engine’s numbers', () => {
  it('holevoChiPair is h((1 + s)/2): 1 at s = 0, 0 at s = 1, 0.6009 at s = 1/√2 (a marker)', () => {
    const r = R(pl('holevoChiPair', { markers: [{ x: Math.SQRT1_2 }] }))
    expect(r.range).toEqual({ from: 0, to: 1 })
    for (const p of r.points) close(p.y, binaryEntropy((1 + p.x) / 2), 1e-9)
    close(r.points[0].y, 1, 1e-12)
    close(r.points[r.points.length - 1].y, 0, 1e-12)
    close(r.markers[0].y, 0.6008760366928568, 1e-9)
    expect(r.xLabel).toBe('s')
    for (const { s, y } of FX.curves.holevoChiPair) close(R(pl('holevoChiPair', { markers: [{ x: s }] })).markers[0].y, y, 1e-9)
  })
  it('accessibleInfoPair is the best projective reading, below chi everywhere, 0.3991 at s = 1/√2', () => {
    const a = R(pl('accessibleInfoPair', { markers: [{ x: Math.SQRT1_2 }] }))
    const c = R(pl('holevoChiPair'))
    close(a.markers[0].y, 0.3991239633071439, 1e-9)
    a.points.forEach((p, k) => {
      expect(p.y).toBeLessThanOrEqual(c.points[k].y + 1e-9)
      close(p.y, 1 - binaryEntropy((1 - Math.sqrt(1 - p.x * p.x)) / 2), 1e-5)
    })
    for (const { s, y } of FX.curves.accessibleInfoPair) close(R(pl('accessibleInfoPair', { markers: [{ x: s }] })).markers[0].y, y, 1e-9)
  })
  it('usdBoundPair is 1 - chi and usdFailPair is s: the bound sits under the exact failure (a pair of curves with a marker at 0.5)', () => {
    const r = R(pl('usdBoundPair', { curve: { vs: 'usdFailPair' }, markers: [{ x: 0.5 }] }))
    close(r.markers[0].y, 1 - binaryEntropy(0.75), 1e-9)
    close(r.markers[0].yVs!, 0.5, 1e-12)
    r.points.forEach((p, k) => {
      close(p.y, 1 - binaryEntropy((1 + p.x) / 2), 1e-9)
      close(r.vs!.points[k].y, p.x, 1e-12)
      expect(p.y).toBeLessThanOrEqual(r.vs!.points[k].y + 1e-9)
    })
    expect(r.names).toEqual({ fn: 'bound', vs: 'exact' })
    for (const { s, y } of FX.curves.usdBoundPair) close(R(pl('usdBoundPair', { markers: [{ x: s }] })).markers[0].y, y, 1e-9)
  })
  it('bscCapacity is 1 - h(f) on 0 … 1/2: 0.531 at f = 0.1, 0.1887 at 0.25, 0 at 1/2', () => {
    const r = R(pl('bscCapacity', { markers: [{ x: 0.1 }, { x: 0.25 }, { x: 0.5 }] }))
    expect(r.range).toEqual({ from: 0, to: 0.5 })
    close(r.markers[0].y, 0.5310044064107188, 1e-9)
    close(r.markers[1].y, 0.1887218755408672, 1e-9)
    close(r.markers[2].y, 0, 1e-12)
    for (const p of r.points) close(p.y, 1 - binaryEntropy(p.x), 1e-9)
    expect(r.xLabel).toBe('f')
    for (const { f, y } of FX.curves.bscCapacity) close(R(pl('bscCapacity', { markers: [{ x: f }] })).markers[0].y, y, 1e-9)
    expect(near(r, 0.5).y).toBeLessThan(1e-9)
  })
})

describe('Q23 curves: validation, transitions and drawing', () => {
  it('each curve validates with a marker, a second curve or a yLine, and bounds its axis to 0 … 1', () => {
    for (const fn of ['holevoChiPair', 'accessibleInfoPair', 'usdBoundPair', 'usdFailPair', 'bscCapacity'] as const) {
      expect(validateStage(pl(fn, { markers: [{ x: 0.25, label: 'x' }], yLines: [{ y: 0.5 }] })), fn).toEqual([])
      const r = R(pl(fn))
      expect(r.yMin).toBeGreaterThanOrEqual(0)
      expect(r.yMax).toBeLessThanOrEqual(1)
    }
    expect(validateStage(pl('holevoChiPair', { curve: { vs: 'accessibleInfoPair' } }))).toEqual([])
  })
  it('a transition between two Q23 plots draws finite points at every frame and the ends are the states themselves', () => {
    const a = R(pl('holevoChiPair'))
    const b = R(pl('holevoChiPair', { curve: { vs: 'accessibleInfoPair' }, markers: [{ x: Math.SQRT1_2 }] }))
    expect(interpolate(a, b, 0)).toBe(a)
    expect(interpolate(a, b, 1)).toBe(b)
    for (const t of [0.1, 0.5, 0.9]) for (const p of (interpolate(a, b, t) as ResolvedPlot).points) expect(Number.isFinite(p.y)).toBe(true)
  })
  it('every curve draws inside its box with no NaN, stage and print', () => {
    for (const fn of ['holevoChiPair', 'accessibleInfoPair', 'usdBoundPair', 'usdFailPair', 'bscCapacity'] as const)
      for (const mode of ['stage', 'print'] as const) {
        const html = renderToString(createElement('svg', null, createElement(PlotScene, { state: R(pl(fn, { markers: [{ x: 0.25 }] })), mode, width: 320, height: 240 })))
        expect(html, `${fn} ${mode}`).not.toMatch(/NaN|undefined|Infinity/)
      }
  })
})
