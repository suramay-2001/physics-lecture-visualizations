/**
 * Chapter B4's two additions to older stage kinds, as pure checks (no WebGL, no DOM):
 *  - `bloch.hull` / `bloch.eps`: the octahedron of the stabilizer states and an arrow shortened to 1 − 2ε (resolve, validation, an in-between frame);
 *  - `bits.bitmap` with `bb: 'fifteen'`: the 4 x 15 X-check matrix (and 10 Z checks) of the 15-qubit code, straight from physics/qec/magic.ts.
 */
import { describe, expect, it } from 'vitest'
import type { BitsState, BlochState } from '../content/stage'
import { fifteen } from '../physics/qec/magic'
import { interpolate } from './interp'
import { resolve, validateStage } from './resolve'
import type { ResolvedBits, ResolvedBloch } from './types'
import './svg/kinds'

const B = (extra: Partial<BlochState> = {}): BlochState => ({ kind: 'bloch', state: { thetaDeg: 90, phiDeg: 45 }, ...extra })
const rb = (st: BlochState, s = 1): ResolvedBloch => resolve(st, s) as ResolvedBloch

describe('bloch hull and eps', () => {
  it('defaults: no hull, full-length arrow', () => {
    const r = rb(B())
    expect([r.hull, r.shrink]).toEqual([false, 1])
  })
  it('eps shortens the arrow to 1 − 2ε; hull is carried', () => {
    const r = rb(B({ hull: true, eps: 0.15 }))
    expect(r.hull).toBe(true)
    expect(r.shrink).toBeCloseTo(0.7, 12)
    // the state itself (its ket, its Bloch vector) is untouched: only the drawing shortens
    expect(Math.hypot(...r.r)).toBeCloseTo(1, 12)
  })
  it('validation: hull is a boolean, eps a chance in [0, 0.5]', () => {
    expect(validateStage(B({ hull: true, eps: 0.5 }))).toEqual([])
    expect(validateStage(B({ eps: 0 }))).toEqual([])
    expect(validateStage(B({ eps: 0.51 }))[0]).toMatch(/^bloch eps/)
    expect(validateStage(B({ eps: -0.1 }))[0]).toMatch(/^bloch eps/)
    expect(validateStage(B({ hull: 'yes' as never }))[0]).toMatch(/^bloch hull/)
  })
  it('an in-between frame lerps the shortening and keeps the hull of the nearer state', () => {
    const a = rb(B({ hull: true, eps: 0 }))
    const b = rb(B({ hull: true, eps: 0.25 }))
    const m = interpolate(a, b, 0.5) as ResolvedBloch
    expect(m.shrink).toBeCloseTo(0.75, 12)
    expect(m.hull).toBe(true)
  })
})

const bitmap = (which: 'HX' | 'HZ' | 'both', extra: Partial<BitsState> = {}): BitsState => ({ kind: 'bits', bitmap: { matrix: { bb: 'fifteen', which } }, ...extra })
const bits = (st: BitsState): ResolvedBits => resolve(st, 1) as ResolvedBits

describe('bits bitmap: the 15-qubit code', () => {
  const F = fifteen()
  it('H_X is 4 x 15 with 32 ones and row weight 8; H_Z is 10 x 15; both commute', () => {
    const hx = bits(bitmap('HX')).bitmap!
    expect([hx.rows, hx.cols, hx.ones, hx.rowWeightMin, hx.rowWeightMax, hx.commute, hx.code]).toEqual([4, 15, 32, 8, 8, true, 'fifteen'])
    const hz = bits(bitmap('HZ')).bitmap!
    expect([hz.rows, hz.cols]).toEqual([10, 15])
    expect(hz.ones).toBe(F.HZ.flat().reduce((a, b) => a + b, 0))
    const both = bits(bitmap('both')).bitmap!
    expect([both.rows, both.xRows]).toEqual([14, 4])
  })
  it('the drawn runs are the 1s of the engine matrix', () => {
    const r = bits(bitmap('HX')).bitmap!
    const rebuilt = F.HX.map(() => new Array<number>(15).fill(0))
    for (const [row, col, len] of r.runs) for (let j = col; j < col + len; j++) rebuilt[row][j] = 1
    expect(rebuilt).toEqual(F.HX)
  })
  it('bands are checked against the matrix drawn, and the older codes still resolve', () => {
    expect(validateStage(bitmap('HX', { bitmap: { matrix: { bb: 'fifteen', which: 'HX' }, bands: [{ rows: [0, 0] }, { cols: [3, 5] }] } }))).toEqual([])
    expect(validateStage(bitmap('HX', { bitmap: { matrix: { bb: 'fifteen', which: 'HX' }, bands: [{ rows: [0, 4] }] } }))[0]).toMatch(/bands\[0\]\.rows/)
    expect(validateStage({ kind: 'bits', bitmap: { matrix: { bb: 'gross', which: 'HX' } } })).toEqual([])
    expect(validateStage({ kind: 'bits', bitmap: { matrix: { bb: 'nope' as never, which: 'HX' } } })[0]).toMatch(/bits bitmap\.matrix\.bb/)
  })
})
