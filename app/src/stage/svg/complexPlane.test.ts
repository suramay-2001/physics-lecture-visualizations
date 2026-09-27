/**
 * `complex-plane` (P-F1-story §9.2 S1): the resolver computes every derived mark with the engine (content writes inputs
 * only), interpolation turns polar numbers by their angle and recomputes the outputs, validation enforces the plan's
 * limits, and the kind is reached through the ordinary resolve / interpolate / validateStage entry points.
 */
import { describe, expect, it } from 'vitest'
import { renderToString } from 'react-dom/server'
import { createElement } from 'react'
import type { ComplexPlaneState } from '../../content/stage'
import { KIND_RENDER, PASSPORT } from '../../content/stage'
import { abs, add, arg, c, conj, cpow, mul, sub } from '../../physics/complex'
import { eulerLimit, phasorSum } from '../../physics/qc/complexExtra'
import { interpolate } from '../interp'
import { resolve, validateStage } from '../resolve'
import { svgKindDef } from '../svgKinds'
import type { ResolvedComplexPlane } from '../types'
import { ComplexPlaneScene } from './ComplexPlaneScene'
import { complexReadouts, resolveComplexPlane, validateComplexPlane } from './complexPlane'
import { fix, fmtC } from './draw'
import './kinds'

const cp = (x: Omit<ComplexPlaneState, 'kind'>): ComplexPlaneState => ({ kind: 'complex-plane', ...x })
const near = (a: { re: number; im: number }, b: { re: number; im: number }) => Math.hypot(a.re - b.re, a.im - b.im)

describe('complex-plane: the SVG route', () => {
  it('is an SVG kind, registered by the lazy kinds module, with the plan’s passport', () => {
    expect(KIND_RENDER['complex-plane']).toBe('svg')
    expect(svgKindDef('complex-plane')).toBeDefined()
    expect(PASSPORT['complex-plane']).toMatchObject({ title: 'NUMBER PLANE ℂ', note: 'not a place · a picture of numbers', axes: ['Re', 'Im'], legend: 'phase' })
  })
  it('resolve / validateStage reach it like any kind; an unknown shot is caught by the shared check', () => {
    const st = cp({ z: { re: 3, im: 4 }, shot: 'C-FLAT' })
    expect((resolve(st, 1) as ResolvedComplexPlane).z!.r).toBe(5)
    expect(validateStage(st)).toEqual([])
    expect(validateStage({ ...st, shot: 'B-STD' as never })).toEqual(['complex-plane: unknown shot "B-STD"'])
  })
})

describe('complex-plane: every derived mark comes from the engine', () => {
  it('sum, product, conjugate, sizes and angles (F1 §1 pl:b2–b6, mu:b1–b5)', () => {
    const r = resolveComplexPlane(cp({ z: { re: 2, im: 1 }, w: { re: 1, im: 3 }, show: ['sum', 'product', 'conj', 'modulus', 'arg'] }), 1)
    expect(near(r.sum!, add(c(2, 1), c(1, 3)))).toBe(0)
    expect(near(r.product!, mul(c(2, 1), c(1, 3)))).toBe(0)
    expect(near(r.conj!, conj(c(2, 1)))).toBe(0)
    expect(r.product!.r).toBe(abs(c(-1, 7)))
    expect(r.product!.phi).toBe(arg(c(-1, 7)))
    expect(fix((r.product!.phi * 180) / Math.PI)).toBe('98.13')
  })
  it('marks not shown are not computed (content writes inputs only; a mark needs its switch)', () => {
    const r = resolveComplexPlane(cp({ z: { re: 2, im: 1 }, w: { re: 1, im: 3 } }), 1)
    expect([r.sum, r.product, r.conj, r.velocity]).toEqual([null, null, null, null])
  })
  it('powers by cpow, the Euler polygon by eulerPath, chains by phasorPath / phasorSum', () => {
    const pw = resolveComplexPlane(cp({ powers: { of: { re: 1, im: 1 }, upTo: 8 } }), 1)
    expect(pw.powers!.points).toHaveLength(9)
    expect(near(pw.powers!.points[8], cpow(c(1, 1), 8))).toBe(0)
    const eu = resolveComplexPlane(cp({ euler: { rate: 'imag', phiDeg: 180, n: { from: 1, to: 64 } } }), 1)
    expect(eu.euler!.n).toBe(64)
    expect(near(eu.euler!.end, eulerLimit(Math.PI, 64))).toBeLessThan(1e-14)
    expect(eu.euler!.limit.re).toBeCloseTo(-1, 15)
    const half = resolveComplexPlane(cp({ euler: { rate: 'imag', phiDeg: 180, n: { from: 1, to: 64 } } }), 0.5)
    expect(half.euler!.n).toBe(Math.round(1 + 63 * 0.5))
    const real = resolveComplexPlane(cp({ line: true, euler: { rate: 'real', x: 1, n: 1000 } }), 1)
    expect(real.euler!.end.re).toBeCloseTo(2.7169, 4)
    const ch = resolveComplexPlane(cp({ chain: { phasesDeg: [0, 60], sizes: [0.5, 0.5] } }), 1)
    expect(ch.chain!.sumAbs2).toBeCloseTo(0.75, 14)
    expect(near(ch.chain!.sum, phasorSum([0, Math.PI / 3], [0.5, 0.5]))).toBeLessThan(1e-15)
    const three = resolveComplexPlane(cp({ chain: { phasesDeg: [0, 120, 240] } }), 1)
    expect(three.chain!.sum.r).toBeLessThan(1e-12)
  })
  it('a sweep turns z by its authored angle; the trail and the velocity follow; the extent holds over the hold', () => {
    const st = cp({ z: { r: 1, phiDeg: { from: 0, to: 180 } }, trail: true, show: ['arc', 'velocity'] })
    const a = resolveComplexPlane(st, 0)
    const m = resolveComplexPlane(st, 0.5)
    const b = resolveComplexPlane(st, 1)
    expect(m.z!.phi).toBeCloseTo(Math.PI / 2, 14)
    expect(near(m.velocity!, mul(c(0, 1), c(m.z!.re, m.z!.im)))).toBeLessThan(1e-15)
    expect(b.trail!.length).toBeGreaterThan(m.trail!.length)
    expect(near(b.trail!.at(-1)!, b.z!)).toBeLessThan(1e-12)
    expect(a.extent).toBe(b.extent)
  })
  it('readouts format the resolved numbers only', () => {
    const r = resolveComplexPlane(cp({ z: { re: 3, im: 4 }, w: { re: 1, im: -2 }, show: ['sum', 'modulus'] }), 1)
    const texts = complexReadouts(r).map((x) => x.text)
    expect(texts).toEqual(['z = 3 + 4i', '|z| = 5', 'w = 1 − 2i', '|w| = 2.236', 'z + w = 4 + 2i', '|z + w| = 4.472'])
    // short lines: the right-aligned readout column never reaches the passport
    const all = [
      cp({ z: { re: -0.994, im: 0.011 }, w: { re: 1, im: 3 }, show: ['product', 'arg', 'modulus', 'conj', 'parts', 'velocity'] }),
      cp({ euler: { rate: 'imag', phiDeg: 180, n: 33 } }),
      cp({ chain: { phasesDeg: [0, 97] } }),
      cp({ powers: { of: { re: 1, im: 1 }, upTo: 12 } }),
    ].flatMap((x) => complexReadouts(resolveComplexPlane(x, 1)).map((l) => l.text))
    for (const t of all) expect(t.length, t).toBeLessThanOrEqual(22)
    expect(fmtC(c(0, -1))).toBe('−i')
    expect(fmtC(c(-0.12, -0.16))).toBe('−0.12 − 0.16i')
    expect(fmtC(sub(c(1, 0), c(1, 0)))).toBe('0')
  })
})

describe('complex-plane: interpolation (inputs lerp, outputs recomputed)', () => {
  it('two polar numbers turn by angle; parts move straight; the product is recomputed on the way', () => {
    const A = resolveComplexPlane(cp({ z: { r: 2, phiDeg: 0 }, w: { re: 0, im: 1 }, show: ['product'] }), 1)
    const B = resolveComplexPlane(cp({ z: { r: 2, phiDeg: 180 }, w: { re: 0, im: 1 }, show: ['product'] }), 0)
    const mid = interpolate(A, B, 0.5) as ResolvedComplexPlane
    expect(mid.z!.r).toBeCloseTo(2, 14)
    expect(mid.z!.phi).toBeCloseTo(Math.PI / 2, 14)
    expect(near(mid.product!, mul(c(mid.z!.re, mid.z!.im), c(0, 1)))).toBeLessThan(1e-14)
    const P = resolveComplexPlane(cp({ z: { re: 2, im: 0 } }), 1)
    const Q = resolveComplexPlane(cp({ z: { re: -2, im: 0 } }), 0)
    expect((interpolate(P, Q, 0.5) as ResolvedComplexPlane).z!.r).toBeLessThan(1e-12) // straight through 0
  })
  it('the Euler n lerps as a whole number and the polygon is rebuilt', () => {
    const A = resolveComplexPlane(cp({ euler: { rate: 'imag', phiDeg: 180, n: 2 } }), 1)
    const B = resolveComplexPlane(cp({ euler: { rate: 'imag', phiDeg: 180, n: 64 } }), 0)
    const mid = interpolate(A, B, 0.5) as ResolvedComplexPlane
    expect(mid.euler!.n).toBe(33)
    expect(mid.euler!.points).toHaveLength(34)
    expect(near(mid.euler!.end, eulerLimit(Math.PI, 33))).toBeLessThan(1e-13)
  })
})

describe('complex-plane: validation (P-F1-story §9.2)', () => {
  const v = (x: Omit<ComplexPlaneState, 'kind'>) => validateComplexPlane(cp(x))
  it('n is a whole number 1–1000, at most 12 arrows, the number line forbids an imaginary part', () => {
    expect(v({ euler: { rate: 'imag', phiDeg: 180, n: 0 } })).toEqual(['complex-plane euler.n: a whole number 1–1000 (a sweep’s ends too)'.replace('’', "'")])
    expect(v({ euler: { rate: 'imag', phiDeg: 180, n: 1001 } }).length).toBe(1)
    expect(v({ euler: { rate: 'imag', phiDeg: 180, n: 2.5 } }).length).toBe(1)
    expect(v({ euler: { rate: 'imag', phiDeg: 180, n: { from: 1, to: 1000 } } })).toEqual([])
    expect(v({ chain: { phasesDeg: Array.from({ length: 13 }, () => 0) } })).toEqual(['complex-plane chain: 1–12 arrows'])
    expect(v({ spokes: { phasesDeg: [0, 90], sizes: [1] } })).toEqual(['complex-plane spokes: sizes are one finite number ≥ 0 per arrow'])
    expect(v({ line: true, z: { re: -2, im: 0 } })).toEqual([])
    expect(v({ line: true, z: { re: 3, im: 1 } })[0]).toMatch(/number line is real/)
    expect(v({ line: true, z: { r: 1, phiDeg: { from: 0, to: 180 } } })[0]).toMatch(/number line is real/)
  })
  it('marks need their numbers; sizes are never negative; a drawing must stay drawable', () => {
    expect(v({ z: { re: 1, im: 0 }, show: ['sum'] })).toEqual(["complex-plane show 'sum': needs z and w"])
    expect(v({ show: ['modulus'] })).toEqual(["complex-plane show 'modulus': needs z"])
    expect(v({ z: { re: 1, im: 0 }, show: ['bogus' as never] })).toEqual(['complex-plane show: unknown mark "bogus"'])
    expect(v({ z: { r: -1, phiDeg: 0 } })[0]).toMatch(/never negative/)
    expect(v({ powers: { of: { re: 2, im: 0 }, upTo: 64 } })[0]).toMatch(/too large to draw/)
    expect(v({ z: { re: Number.NaN, im: 0 } })).toEqual(['complex-plane z: non-finite part'])
  })
})

describe('complex-plane: one scene, two modes', () => {
  it('draws in stage and print mode with no NaN; print carries the readouts and the hue legend', () => {
    const st = cp({ z: { re: 3, im: 4 }, w: { re: 1, im: -2 }, show: ['sum', 'modulus', 'parts', 'conj', 'arg'] })
    const r = resolveComplexPlane(st, 1)
    for (const mode of ['stage', 'print'] as const) {
      const html = renderToString(createElement('svg', null, createElement(ComplexPlaneScene, { state: r, mode, width: 320, height: 260 })))
      expect(html, mode).not.toMatch(/NaN|Infinity|undefined/)
      expect(html).toContain('data-anchor="z"')
      if (mode === 'print') expect(html).toContain('z + w = 4 + 2i')
      if (mode === 'print') expect(html).toContain('data-legend="phase"')
      else expect(html).not.toContain('z + w = 4 + 2i')
    }
  })
})
