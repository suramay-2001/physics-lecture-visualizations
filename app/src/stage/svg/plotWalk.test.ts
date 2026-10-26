/**
 * The nine plot curves of Chapter Q19 (P-Q19-story §9.2 S2): `randomWalkSigma`, `coinWalkSigma`, `starWalkMarked8`, `extraWalk64`, `extraWalk64Plus`, `trotterErr1`,
 * `trotterErr2`, `qaoaGammaSlice`, `qaoaBetaSlice`. Every y is the engine's (physics/qc/walk.ts, trotter.ts, variational.ts); the seven curves of a whole number are drawn at
 * every whole x of the range on either axis scale; the two QAOA slices are smooth in the angle. Values are checked against the numpy twin (__fixtures__/qc-walk.json) and the plan.
 */
import { createElement } from 'react'
import { renderToString } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import raw from '../../physics/__fixtures__/qc-walk.json?raw'
import type { PlotCurveName, PlotState } from '../../content/stage'
import { interpolate } from '../interp'
import { resolve, validateStage } from '../resolve'
import type { ResolvedPlot } from '../types'
import { PlotScene } from './PlotScene'
import { PLOT_LIMITS, wholeXs } from './plot'
import './kinds'

const FX: any = JSON.parse(raw)
const pl = (fn: PlotCurveName, o: Omit<PlotState, 'kind' | 'curve'> & { curve?: Partial<NonNullable<PlotState['curve']>> } = {}): PlotState => ({
  kind: 'plot',
  ...o,
  curve: { fn, ...(o.curve ?? {}) },
})
const R = (st: PlotState) => resolve(st, 1) as ResolvedPlot
const at = (r: ResolvedPlot, x: number): number => r.points.find((p) => Math.abs(p.x - x) < 1e-9)!.y
const close = (a: number, b: number, eps = 1e-9) => expect(Math.abs(a - b), `${a} vs ${b}`).toBeLessThan(eps)
const problems = (st: PlotState): string[] => validateStage(st)

describe('Q19 curves: the engine’s numbers', () => {
  it('randomWalkSigma is √n and coinWalkSigma is the quantum spread (54.12 at n = 100, 0.5412 n)', () => {
    const a = R(pl('randomWalkSigma'))
    close(at(a, 100), 10, 1e-12)
    close(at(a, 25), 5, 1e-12)
    close(at(a, 0), 0, 1e-12)
    const b = R(pl('coinWalkSigma'))
    close(at(b, 100), FX.coin.sigma['100'], 1e-9)
    close(at(b, 10), 5.472944819747412, 1e-9)
    close(at(b, 100) / 100, 0.5412, 1e-4)
    expect(a.xLabel).toBe('n')
  })
  it('starWalkMarked8 equals the numpy chances for N = 8 (0.9453 at n = 4)', () => {
    const r = R(pl('starWalkMarked8'))
    expect(r.points.map((p) => p.x)).toEqual(Array.from({ length: 15 }, (_, k) => k))
    r.points.forEach((p) => close(p.y, FX.star.chances['8'][p.x], 1e-12))
    close(at(r, 4), 0.9453125, 1e-12)
    expect(r.yMax).toBeLessThanOrEqual(1)
    expect(r.yMin).toBeGreaterThanOrEqual(0)
  })
  it('extraWalk64 peaks at 0.7002 at n = 11; the plus start stays under 0.083; both equal numpy', () => {
    const m = R(pl('extraWalk64'))
    const p = R(pl('extraWalk64Plus'))
    expect(m.points).toHaveLength(41)
    m.points.forEach((q) => close(q.y, FX.extra.near['64'][q.x], 1e-12))
    p.points.forEach((q) => close(q.y, FX.extra.near['64plus'][q.x], 1e-12))
    const peak = m.points.reduce((a, b) => (b.y > a.y ? b : a))
    expect(peak.x).toBe(11)
    close(peak.y, 0.7002, 1e-4)
    expect(Math.max(...p.points.map((q) => q.y))).toBeLessThan(0.083)
  })
  it('trotterErr1 and trotterErr2 equal numpy (0.7327 at M = 1, 0.0486 at M = 15; 0.0246 at M = 3 for order 2)', () => {
    const a = R(pl('trotterErr1', { curve: { x: { from: 1, to: 32 } } }))
    const b = R(pl('trotterErr2', { curve: { x: { from: 1, to: 32 } } }))
    expect(a.points).toHaveLength(32)
    for (const M of Object.keys(FX.trotter.err1)) close(at(a, Number(M)), FX.trotter.err1[M], 1e-10)
    for (const M of Object.keys(FX.trotter.err2)) close(at(b, Number(M)), FX.trotter.err2[M], 1e-10)
    close(at(a, 1), 0.7327, 1e-4)
    close(at(a, 15), 0.0486, 1e-4)
    close(at(b, 3), 0.0246, 1e-4)
    close(at(a, 16) / at(a, 32), 2, 0.02)
    expect(a.xLabel).toBe('M')
  })
  it('the QAOA slices: F(γ, 22.5°) = 2 + sin 2γ and F(45°, β) = 2 + sin 4β; both reach 3 and meet 2 at 0', () => {
    const g = R(pl('qaoaGammaSlice'))
    const b = R(pl('qaoaBetaSlice'))
    expect(g.range).toEqual({ from: 0, to: 180 })
    expect(g.points).toHaveLength(PLOT_LIMITS.samplesDefault + 1)
    for (const p of g.points) close(p.y, 2 + Math.sin((2 * p.x * Math.PI) / 180), 1e-12)
    for (const p of b.points) close(p.y, 2 + Math.sin((4 * p.x * Math.PI) / 180), 1e-12)
    close(Math.max(...g.points.map((p) => p.y)), 3, 1e-3)
    close(R(pl('qaoaGammaSlice', { curve: { x: { from: 0, to: 90 }, samples: 4 }, markers: [{ x: 45 }] })).markers[0].y, 3, 1e-12)
    close(R(pl('qaoaBetaSlice', { markers: [{ x: 22.5 }] })).markers[0].y, 3, 1e-12)
    close(g.points[0].y, 2, 1e-12)
    expect(g.xLabel).toBe('γ')
  })
})

describe('Q19 curves: whole x only', () => {
  it('a curve of a whole number is drawn at every whole x and ignores `samples`', () => {
    expect(R(pl('starWalkMarked8', { curve: { samples: 7 } })).points).toHaveLength(15)
    expect(R(pl('randomWalkSigma', { curve: { x: { from: 0, to: 100 }, samples: 4 } })).points).toHaveLength(101)
    expect(wholeXs({ from: 1.2, to: 4.9 })).toEqual([2, 3, 4])
    expect(wholeXs({ from: 2.2, to: 2.9 })).toEqual([2, 3])
  })
  it('on a log x axis the whole x are kept (32 points for M = 1…32); the log y axis needs positive errors', () => {
    const st = pl('trotterErr1', { curve: { vs: 'trotterErr2', x: { from: 1, to: 32 } }, xScale: 'log', yScale: 'log', markers: [{ x: 15, label: 'M = 15' }] })
    expect(problems(st)).toEqual([])
    const r = R(st)
    expect(r.points.map((p) => p.x)).toEqual(Array.from({ length: 32 }, (_, k) => k + 1))
    expect(r.vs!.points).toHaveLength(32)
    expect(r.xScale).toBe('log')
    expect(r.yMin).toBeGreaterThan(0)
    close(r.markers[0].y, FX.trotter.err1['15'], 1e-10)
    close(r.markers[0].yVs!, R(pl('trotterErr2', { curve: { x: { from: 1, to: 32 } } })).points[14].y, 1e-12)
  })
  it('a pair of whole-number curves shares its x: the coin spread beside the √n curve', () => {
    const r = R(pl('coinWalkSigma', { curve: { vs: 'randomWalkSigma', x: { from: 0, to: 100 } }, markers: [{ x: 100, label: 'n = 100' }] }))
    expect(r.points).toHaveLength(101)
    expect(r.names).toEqual({ fn: 'quantum coin', vs: 'coin flips' })
    close(r.markers[0].y, 54.12413815289823, 1e-9)
    close(r.markers[0].yVs!, 10, 1e-12)
  })
  it('validation: a non-whole range or marker, or a range outside the domain, names the curve', () => {
    expect(problems(pl('starWalkMarked8', { curve: { x: { from: 0, to: 14.5 } } })).join()).toContain('starWalkMarked8 is drawn at whole x only')
    expect(problems(pl('starWalkMarked8', { curve: { x: { from: 0, to: 41 } } })).join()).toContain('whole numbers in 0…40')
    expect(problems(pl('trotterErr1', { curve: { x: { from: 0, to: 32 } } })).join()).toContain('whole numbers in 1…60')
    expect(problems(pl('randomWalkSigma', { markers: [{ x: 10.5 }] })).join()).toContain('marked at a whole x')
    expect(problems(pl('coinWalkSigma', { curve: { vs: 'nSquared', x: { from: 0, to: 401 } } })).join()).toContain('whole numbers in 0…400')
    expect(problems(pl('qaoaGammaSlice', { curve: { x: { from: 0.5, to: 179.5 } }, markers: [{ x: 22.25 }] }))).toEqual([])
    expect(problems(pl('extraWalk64', { markers: [{ x: 11, label: 'peak' }], yLines: [{ y: 0.7 }] }))).toEqual([])
  })
  it('a transition between two whole-number plots draws finite points at every frame; the ends are the states themselves', () => {
    const a = R(pl('starWalkMarked8', { curve: { x: { from: 0, to: 14 } } }))
    const b = R(pl('starWalkMarked8', { curve: { x: { from: 0, to: 6 } }, markers: [{ x: 4 }] }))
    expect(interpolate(a, b, 0)).toBe(a)
    expect(interpolate(a, b, 1)).toBe(b)
    for (const t of [0.1, 0.25, 0.5, 0.75, 0.9]) {
      const m = interpolate(a, b, t) as ResolvedPlot
      expect(m.points.length).toBeGreaterThanOrEqual(2)
      for (const p of m.points) expect(Number.isFinite(p.y)).toBe(true)
    }
    const c = R(pl('extraWalk64', { curve: { x: { from: 0, to: 40 } } }))
    const d = R(pl('extraWalk64', { curve: { x: { from: 0, to: 20 } } }))
    expect((interpolate(c, d, 0.5) as ResolvedPlot).points.length).toBeGreaterThan(20)
  })
  it('every curve draws inside its box with no NaN, stage and print', () => {
    const names: PlotCurveName[] = ['randomWalkSigma', 'coinWalkSigma', 'starWalkMarked8', 'extraWalk64', 'extraWalk64Plus', 'trotterErr1', 'trotterErr2', 'qaoaGammaSlice', 'qaoaBetaSlice']
    for (const fn of names) {
      const st = pl(fn, fn.startsWith('trotter') ? { yScale: 'log', xScale: 'log' } : {})
      expect(problems(st), fn).toEqual([])
      for (const mode of ['stage', 'print'] as const) {
        const html = renderToString(createElement('svg', null, createElement(PlotScene, { state: R(st), mode, width: 320, height: 240 })))
        expect(html, `${fn} ${mode}`).not.toMatch(/NaN|undefined|Infinity/)
      }
    }
  })
})
