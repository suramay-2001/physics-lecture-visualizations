/**
 * The four plot curves of Chapter Q20 (P-Q20-story §9.2 S2): `clonerF1`, `clonerF2`, `usdProgrammable`, `usdKnown`. Every y is the engine's (physics/qc/machines.ts); the values are checked
 * against the numpy twin (__fixtures__/qc-machines.json), the closed forms (the ends of the cloner curves, 1/3 (1 - s^2) and 1 - s) and the plan's marker values.
 */
import { createElement } from 'react'
import { renderToString } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import raw from '../../physics/__fixtures__/qc-machines.json?raw'
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

describe('Q20 curves: the engine’s numbers', () => {
  it('clonerF1 falls from 1 to 1/2 and clonerF2 rises from 1/2 to 1 over u = 0 … 60; both are 5/6 at 30 (numpy at six angles)', () => {
    const a = R(pl('clonerF1', { curve: { vs: 'clonerF2', x: { from: 0, to: 60 }, samples: 60 }, markers: [{ x: 0 }, { x: 15 }, { x: 30 }, { x: 60 }] }))
    expect(a.points.length).toBe(61)
    expect(a.names).toEqual({ fn: 'wire 1', vs: 'wire 2' })
    expect(a.xLabel).toBe('u')
    for (const k of FX.cloner.cases) {
      const p = a.points.find((q) => Math.abs(q.x - k.u) < 1e-9)!
      close(p.y, k.f1, 1e-12)
      close(R(pl('clonerF2', { curve: { x: { from: 0, to: 60 }, samples: 60 } })).points.find((q) => Math.abs(q.x - k.u) < 1e-9)!.y, k.f2, 1e-12)
    }
    const m = a.markers
    close(m[0].y, 1, 1e-12)
    close(m[0].yVs!, 0.5, 1e-12)
    close(m[1].y, FX.cloner.cases.find((k: any) => k.u === 15).f1, 1e-12)
    close(m[2].y, 5 / 6, 1e-12)
    close(m[2].yVs!, 5 / 6, 1e-12)
    close(m[3].y, 0.5, 1e-12)
    close(m[3].yVs!, 1, 1e-12)
    expect(a.yMax).toBeLessThanOrEqual(1)
    expect(a.yMin).toBeGreaterThanOrEqual(0)
  })
  it('usdProgrammable is 1/3 (1 - s^2) and usdKnown is 1 - s; the programmable curve lies below the known one (numpy table)', () => {
    const a = R(pl('usdProgrammable', { curve: { vs: 'usdKnown', x: { from: 0, to: 1 }, samples: 100 }, markers: [{ x: 0 }, { x: 0.5 }] }))
    expect(a.names).toEqual({ fn: 'programmable', vs: 'known states' })
    expect(a.xLabel).toBe('s')
    const known = R(pl('usdKnown', { curve: { x: { from: 0, to: 1 }, samples: 100 } }))
    for (const p of a.points) {
      close(p.y, (1 - p.x * p.x) / 3, 1e-12)
      const q = known.points.find((k) => Math.abs(k.x - p.x) < 1e-9)!
      close(q.y, 1 - p.x, 1e-12)
      expect(p.y).toBeLessThanOrEqual(q.y + 1e-12)
    }
    close(a.markers[0].y, 1 / 3, 1e-12)
    close(a.markers[0].yVs!, 1, 1e-12)
    close(a.markers[1].y, 0.25, 1e-12)
    close(a.markers[1].yVs!, 0.5, 1e-12)
    for (const k of FX.disc.known) {
      const p = a.points.find((q) => Math.abs(q.x - k.s) < 1e-9)
      if (p) close(p.y, k.prog, 1e-12)
    }
  })
  it('validation: the four curves and their markers are accepted; an unknown curve is refused', () => {
    expect(validateStage(pl('clonerF1', { markers: [{ x: 30, label: 'equal split' }], yLines: [{ y: 5 / 6 }] }))).toEqual([])
    expect(validateStage(pl('usdProgrammable', { curve: { vs: 'usdKnown' }, markers: [{ x: 0.5 }] }))).toEqual([])
    expect(validateStage(pl('clonerF2' as PlotCurveName, { curve: { x: { from: 0, to: 60 } } }))).toEqual([])
  })
  it('every curve draws inside its box with no NaN, stage and print', () => {
    for (const fn of ['clonerF1', 'clonerF2', 'usdProgrammable', 'usdKnown'] as PlotCurveName[]) {
      const st = pl(fn)
      expect(validateStage(st), fn).toEqual([])
      for (const mode of ['stage', 'print'] as const) {
        const html = renderToString(createElement('svg', null, createElement(PlotScene, { state: R(st), mode, width: 320, height: 240 })))
        expect(html, `${fn} ${mode}`).not.toMatch(/NaN|undefined|Infinity/)
      }
    }
  })
})
