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
    expect([fix(90, 0), fix(10), fix(-0.0001), fix(2.5, 0), fix(100, 1)]).toEqual(['90', '10', '0', '3', '100'])
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

/* ---------------------------------------------------------------------------------------------- */
/* Label collisions (P review of 709 F1, items 12–13)                                              */
/* ---------------------------------------------------------------------------------------------- */

interface TextMark {
  x: number
  y: number
  anchor: string
  text: string
}
/** The <text> labels of a rendered scene (renderToString keeps x, y, class, text-anchor in that order). */
function texts(html: string): TextMark[] {
  return [...html.matchAll(/<text x="([-\d.e]+)" y="([-\d.e]+)" class="[^"]*" text-anchor="(\w+)"[^>]*>([^<]*)<\/text>/g)].map((m) => ({ x: Number(m[1]), y: Number(m[2]), anchor: m[3], text: m[4] }))
}
/** A label's box at 12 px, a glyph about 0.62 em wide (as the scene estimates it), 0.8 em above and 0.25 em below the baseline. */
function box(t: TextMark) {
  const w = [...t.text].length * 12 * 0.62
  const x0 = t.anchor === 'start' ? t.x : t.anchor === 'middle' ? t.x - w / 2 : t.x - w
  return { x0, x1: x0 + w, y0: t.y - 9.6, y1: t.y + 3 }
}
const overlap = (a: TextMark, b: TextMark) => {
  const p = box(a)
  const q = box(b)
  return p.x0 < q.x1 && q.x0 < p.x1 && p.y0 < q.y1 && q.y0 < p.y1
}
/** Does the segment a–b cross the label's box? (sampled finely) */
const crosses = (t: TextMark, a: { x: number; y: number }, b: { x: number; y: number }) => {
  const q = box(t)
  return Array.from({ length: 201 }, (_, k) => k / 200).some((u) => {
    const x = a.x + (b.x - a.x) * u
    const y = a.y + (b.y - a.y) * u
    return x > q.x0 && x < q.x1 && y > q.y0 && y < q.y1
  })
}
const render = (st: ComplexPlaneState, mode: 'stage' | 'print', width: number, height: number, s = 1) =>
  renderToString(createElement('svg', null, createElement(ComplexPlaneScene, { state: resolveComplexPlane(st, s), mode, width, height })))
/** Stage sizes: the F1 pages' desktop stage, a phone, and a print figure. */
const SIZES: ['stage' | 'print', number, number][] = [
  ['stage', 520, 760],
  ['stage', 560, 900],
  ['stage', 343, 460],
  ['print', 320, 260],
]
const one = (ts: TextMark[], text: string) => {
  const hits = ts.filter((t) => t.text === text)
  expect(hits.length, `one "${text}" label`).toBe(1)
  return hits[0]
}

describe('complex-plane: labels stay clear of each other (F1 review items 12–13)', () => {
  it('the Euler limit is typeset eⁱᵠ, never caret notation, and sits above the axis, clear of the "−1" tick (f1-euler:b4, b7)', () => {
    for (const n of [1, 2, 4, 16, 64]) {
      const st = cp({ euler: { rate: 'imag', phiDeg: 180, n }, shot: 'C-FLAT' })
      for (const [mode, w, h] of SIZES) {
        const html = render(st, mode, w, h)
        expect(html).not.toContain('e^(')
        const ts = texts(html)
        const lim = one(ts, 'eⁱᵠ')
        const tick = one(ts, '−1')
        expect(overlap(lim, tick), `n = ${n}, ${mode} ${w}×${h}`).toBe(false)
        const re = one(ts, 'Re')
        expect(overlap(lim, re)).toBe(false)
        // the limit −1 is on the real axis (the Re label sits 8 px above it): the name is lifted above the axis line,
        // just inside the circle
        expect(box(lim).y1, `n = ${n}`).toBeLessThan(re.y + 8)
        expect(lim.anchor).toBe('start')
        // … and no line of the polygon (whose end overshoots outside the circle) nor the unit circle runs through it
        const d = html.match(/<g data-anchor="polygon"[^>]*><path d="([^"]+)"/)![1]
        const pts = [...d.matchAll(/[ML]([-\d.]+),([-\d.]+)/g)].map((m) => ({ x: Number(m[1]), y: Number(m[2]) }))
        expect(pts.length).toBe(n + 1)
        for (let k = 1; k < pts.length; k++) expect(crosses(lim, pts[k - 1], pts[k]), `n = ${n}, ${mode} ${w}×${h}, segment ${k}`).toBe(false)
        const c = html.match(/<circle cx="([-\d.e]+)" cy="([-\d.e]+)" r="([-\d.e]+)"[^>]*data-anchor="unit-circle"/)
        expect(c, 'the plane draws its unit circle').toBeTruthy()
        const [cx, cy, rr] = [Number(c![1]), Number(c![2]), Number(c![3])]
        const ring = Array.from({ length: 361 }, (_, k) => ({ x: cx + rr * Math.cos((k * Math.PI) / 180), y: cy - rr * Math.sin((k * Math.PI) / 180) }))
        for (let k = 1; k < ring.length; k++) expect(crosses(lim, ring[k - 1], ring[k]), `unit circle, n = ${n}, ${mode} ${w}×${h}`).toBe(false)
      }
    }
    // off the axis the name goes radially outward: φ = 90° puts it above i
    const up = texts(render(cp({ euler: { rate: 'imag', phiDeg: 90, n: 64 }, shot: 'C-FLAT' }), 'stage', 520, 760))
    expect(one(up, 'eⁱᵠ').anchor).toBe('middle')
  })

  it('e on the number line keeps off the "Re" label (f1-euler:b3); eˣ is typeset for a whole x', () => {
    for (const n of [1, 2, 8, 64]) {
      for (const [mode, w, h] of SIZES) {
        const ts = texts(render(cp({ line: true, euler: { rate: 'real', x: 1, n }, shot: 'C-FLAT' }), mode, w, h))
        const e = one(ts, 'e')
        const re = one(ts, 'Re')
        expect(overlap(e, re), `n = ${n}, ${mode} ${w}×${h}`).toBe(false)
        // not merely clear: side by side they read as "e Re", so e sits on the far side of its ring (radius 6 px)
        expect(box(re).x0 - box(e).x1, `n = ${n}, ${mode} ${w}×${h}`).toBeGreaterThanOrEqual(8)
        expect(e.anchor).toBe('end')
      }
    }
    const two = render(cp({ line: true, euler: { rate: 'real', x: 2, n: 8 }, shot: 'C-FLAT' }), 'stage', 520, 760)
    expect(texts(two).map((t) => t.text)).toContain('e²')
    expect(two).not.toContain('e^')
  })

  it('the powers’ names keep off the "Re" label (f1-multiply:b7 reveal: z⁸ = 16 on the axis)', () => {
    for (const [mode, w, h] of SIZES) {
      const ts = texts(render(cp({ powers: { of: { re: 1, im: 1 }, upTo: 8 }, shot: 'C-FLAT' }), mode, w, h))
      const re = one(ts, 'Re')
      const names = ts.filter((t) => /^(1|z|z[⁰¹²³⁴⁵⁶⁷⁸⁹]+)$/.test(t.text) && t.anchor === 'start')
      expect(names.map((t) => t.text)).toEqual(['1', 'z', 'z²', 'z³', 'z⁴', 'z⁵', 'z⁶', 'z⁷', 'z⁸'])
      for (const t of names) expect(overlap(t, re), `${t.text}, ${mode} ${w}×${h}`).toBe(false)
    }
  })

  it('|z| keeps off a short z arrow and its name (f1-multiply:b3); a long arrow keeps its label beside the middle', () => {
    const b3 = cp({ z: { re: 2, im: 1 }, w: { re: 1, im: 3 }, show: ['product', 'modulus'], shot: 'C-FLAT' })
    for (const [mode, w, h] of SIZES) {
      const html = render(b3, mode, w, h)
      // a print figure also lists its readouts as text lines at the top left (x = 8): not labels on the plane
      const ts = texts(html).filter((t) => !(t.x === 8 && t.y <= 14 + 13 * 3))
      const size = one(ts, '|z| = 2.236')
      const name = ts.find((t) => t.text === 'z' && t.anchor === 'start')!
      expect(overlap(size, name), `${mode} ${w}×${h}`).toBe(false)
      // the z arrow runs from the origin (the axes' crossing) to its tip, just inside the name
      const m = html.match(/<g data-anchor="z"><line x1="([-\d.e]+)" y1="([-\d.e]+)" x2="([-\d.e]+)" y2="([-\d.e]+)"/)!
      expect(crosses(size, { x: Number(m[1]), y: Number(m[2]) }, { x: Number(m[3]), y: Number(m[4]) }), `${mode} ${w}×${h}`).toBe(false)
    }
    // the plane's own beats (3 + 4i, and 2 + i at its own scale) are long arrows: the label stays centred beside them
    for (const st of [cp({ z: { re: 3, im: 4 }, show: ['parts', 'modulus'], shot: 'C-FLAT' }), cp({ z: { re: 2, im: 1 }, show: ['modulus', 'arg'], shot: 'C-FLAT' })]) {
      const t = texts(render(st, 'stage', 520, 760)).find((x) => x.text.startsWith('|z| = '))!
      expect(t.anchor).toBe('middle')
    }
  })
})
