/**
 * `bloch.marks` (Papers B4; ruling R4 of docs/roles/decisions/papers-B3B4.md): up to 24 marked points on the Bloch sphere, small spheres at positions the engine supplied (the Clifford orbit of a state).
 * Pure checks, no WebGL: the field is validated numerically (1 … 24 finite unit vectors within 1e-6, an optional boolean `index`), it resolves to the same points, an in-between frame keeps them, and a
 * state without marks resolves to `marks: null`. The scene draws them with one instanced mesh (stage/scenes/BlochScene.tsx); its frame cost is a matrix write per mark.
 */
import { describe, expect, it } from 'vitest'
import type { BlochState } from '../content/stage'
import { interpolate } from './interp'
import { BLOCH_MARKS_MAX, blochMarksProblems, resolve, validateStage } from './resolve'
import type { ResolvedBloch } from './types'

type Marks = NonNullable<BlochState['marks']>
const B = (marks?: Marks, extra: Partial<BlochState> = {}): BlochState => ({ kind: 'bloch', state: '+z', ...extra, ...(marks ? { marks } : {}) })
const bad = (marks: unknown) => blochMarksProblems(marks)

/** n points spread over the sphere (the golden spiral), each exactly unit length. */
const spiral = (n: number): Marks['points'] =>
  Array.from({ length: n }, (_, i) => {
    const z = 1 - (2 * (i + 0.5)) / n
    const r = Math.sqrt(1 - z * z)
    const phi = i * Math.PI * (3 - Math.sqrt(5))
    return { x: r * Math.cos(phi), y: r * Math.sin(phi), z }
  })

describe('bloch marks: validation', () => {
  it('accepts 1 and 24 unit vectors, with or without an index', () => {
    expect(BLOCH_MARKS_MAX).toBe(24)
    expect(bad({ points: spiral(1) })).toEqual([])
    expect(bad({ points: spiral(24) })).toEqual([])
    expect(bad({ points: spiral(24), index: true })).toEqual([])
    expect(bad({ points: spiral(5), index: false })).toEqual([])
    expect(validateStage(B({ points: spiral(24), index: true }))).toEqual([])
    expect(validateStage(B({ points: [{ x: 1, y: 0, z: 0 }, { x: Math.SQRT1_2, y: 0, z: Math.SQRT1_2 }] }, { shot: 'B-POLE' }))).toEqual([])
  })
  it('refuses 25 points and none', () => {
    expect(bad({ points: spiral(25) })).toEqual(['bloch marks.points: a list of 1–24 points'])
    expect(bad({ points: [] })).toEqual(['bloch marks.points: a list of 1–24 points'])
    expect(validateStage(B({ points: spiral(25) }))).toEqual(['bloch marks.points: a list of 1–24 points'])
    expect(bad({})).toEqual(['bloch marks.points: a list of 1–24 points'])
  })
  it('refuses a point that is not a unit vector, naming it and its length', () => {
    expect(bad({ points: [{ x: 1, y: 0, z: 0 }, { x: 1, y: 1, z: 0 }] })[0]).toMatch(/^bloch marks\.points\[1\]: must be a unit vector \(length 1\.414214, not 1\)/)
    expect(bad({ points: [{ x: 0, y: 0, z: 0 }] })[0]).toMatch(/^bloch marks\.points\[0\]: must be a unit vector/)
    expect(bad({ points: [{ x: 0.5, y: 0.5, z: 0.5 }] })[0]).toMatch(/length 0\.866025/)
    // the tolerance is 1e-6 on the length
    expect(bad({ points: [{ x: 1 + 5e-7, y: 0, z: 0 }] })).toEqual([])
    expect(bad({ points: [{ x: 1 + 2e-6, y: 0, z: 0 }] })[0]).toMatch(/must be a unit vector/)
    expect(validateStage(B({ points: [{ x: 2, y: 0, z: 0 }] }))[0]).toMatch(/^bloch marks\.points\[0\]/)
  })
  it('refuses non-finite or missing coordinates and non-numbers', () => {
    expect(bad({ points: [{ x: NaN, y: 0, z: 1 }] })).toEqual(['bloch marks.points[0]: { x, y, z } with finite numbers'])
    expect(bad({ points: [{ x: Infinity, y: 0, z: 0 }] })[0]).toMatch(/finite numbers/)
    expect(bad({ points: [{ x: 1, y: 0 }] })[0]).toMatch(/finite numbers/)
    expect(bad({ points: [{ x: '1', y: 0, z: 0 }] })[0]).toMatch(/finite numbers/)
    expect(bad({ points: [null] })[0]).toMatch(/finite numbers/)
    expect(bad({ points: [[1, 0, 0]] })[0]).toMatch(/finite numbers/)
  })
  it('refuses a bad index, an unknown field and a non-object', () => {
    expect(bad({ points: spiral(2), index: 'yes' })).toEqual(['bloch marks.index: true or false'])
    expect(bad({ points: spiral(2), labels: true })).toEqual(['bloch marks.labels: unknown field (allowed: points, index)'])
    expect(bad(undefined)).toEqual(['bloch marks: { points: { x, y, z }[], index? }'])
    expect(bad([])).toEqual(['bloch marks: { points: { x, y, z }[], index? }'])
    expect(bad('all')).toEqual(['bloch marks: { points: { x, y, z }[], index? }'])
  })
  it('reports every bad point, not only the first', () => {
    const e = bad({ points: [{ x: 1, y: 0, z: 0 }, { x: 3, y: 0, z: 0 }, { x: 0, y: 4, z: 0 }] })
    expect(e).toHaveLength(2)
    expect(e[0]).toMatch(/points\[1\]/)
    expect(e[1]).toMatch(/points\[2\]/)
  })
})

describe('bloch marks: the resolved state', () => {
  it('carries the authored points as unit vectors and the index flag; a state without marks has null', () => {
    const pts = spiral(24)
    const r = resolve(B({ points: pts, index: true }), 1) as ResolvedBloch
    expect(r.marks).not.toBeNull()
    expect(r.marks!.points).toHaveLength(24)
    expect(r.marks!.index).toBe(true)
    r.marks!.points.forEach((v, i) => expect(v).toEqual([pts[i].x, pts[i].y, pts[i].z]))
    for (const v of r.marks!.points) expect(Math.hypot(...v)).toBeCloseTo(1, 12)
    expect((resolve(B({ points: pts }), 1) as ResolvedBloch).marks!.index).toBe(false)
    expect((resolve(B(), 1) as ResolvedBloch).marks).toBeNull()
  })
  it('the marks do not move with the state: a rotation moves the arrow, not the marked points', () => {
    const marks = { points: spiral(6) }
    const a = resolve(B(marks, { rotate: { axis: 'z', angleDeg: 0 }, state: '+x' }), 0) as ResolvedBloch
    const b = resolve(B(marks, { rotate: { axis: 'z', angleDeg: 90 }, state: '+x' }), 0) as ResolvedBloch
    expect(a.marks).toEqual(b.marks)
    expect(a.r).not.toEqual(b.r)
  })
  it('an in-between frame keeps the marks of the beat it is nearer to (the points are discrete data)', () => {
    const a = resolve(B({ points: spiral(4) }), 0) as ResolvedBloch
    const b = resolve(B({ points: spiral(7), index: true }, { state: '+x' }), 0) as ResolvedBloch
    expect((interpolate(a, b, 0.25) as ResolvedBloch).marks).toEqual(a.marks)
    expect((interpolate(a, b, 0.75) as ResolvedBloch).marks).toEqual(b.marks)
    // marks to no marks: the same
    const none = resolve(B(), 0) as ResolvedBloch
    expect((interpolate(a, none, 0.75) as ResolvedBloch).marks).toBeNull()
    expect((interpolate(none, a, 0.75) as ResolvedBloch).marks).toEqual(a.marks)
  })
  it('every resolved number is finite (the shared check passes)', () => {
    expect(validateStage(B({ points: spiral(24), index: true }, { rotate: { axis: 'x', angleDeg: { from: 0, to: 180 } } }))).toEqual([])
  })
})
