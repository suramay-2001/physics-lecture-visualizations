/**
 * Lecture 10's additive stage fields (interface change W-448 L10-A; rulings 448-L8L11 L10 R5):
 *  A1 `two-qubit` family `pair: '01-10'` (cos θ|ud⟩ − sin θ|du⟩: |ud⟩ at 0°, the singlet at 45°),
 *  A2 `amplitudes` source `{terms}` (the engine's `superpose`),
 *  A3 `matrix` tableau `targets` (the "need" column, ✓/✗ per row and "wins k of n").
 * Every number is the engine's: arrows, grid cells, bars and verdicts are read back from the resolvers and compared with closed forms.
 */
import { createElement } from 'react'
import { renderToString } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import type { AmplitudesState, MatrixTableauState, TwoQubitState } from '../content/stage'
import { superpose } from '../physics/qc/state'
import { interpTwoQubitStage, resolveTwoQubitStage, twoQubitReadouts, validateTwoQubitStage } from './svg/twoQubit'
import { ampReadouts, resolveAmplitudes, validateAmplitudes } from './svg/amplitudes'
import { interpMatrixStage, matrixReadouts, resolveMatrixStage, validateMatrixStage } from './svg/matrix'
import { MatrixScene } from './svg/MatrixScene'
import './svg/kinds'

const DEG = Math.PI / 180
const near = (x: number, y: number, eps = 1e-9) => Math.abs(x - y) < eps
const tq = (thetaDeg: number | { from: number; to: number }, pair?: '00+11' | '01-10', rest: Partial<TwoQubitState> = {}): TwoQubitState => ({
  kind: 'two-qubit',
  source: pair ? { family: 'cos-sin', thetaDeg, pair } : { family: 'cos-sin', thetaDeg },
  grid: 'T',
  ...rest,
})

describe('A1: two-qubit family pair 01-10 is the path from |ud⟩ to the singlet', () => {
  it('θ = 0 is |ud⟩: Alice up, Bob down, only the zz cell is filled (−1)', () => {
    const r = resolveTwoQubitStage(tq(0, '01-10'), 1)
    expect([near(r.rA[0], 0), near(r.rA[1], 0), near(r.rA[2], 1)]).toEqual([true, true, true])
    expect([near(r.rB[0], 0), near(r.rB[1], 0), near(r.rB[2], -1)]).toEqual([true, true, true])
    expect(near(r.T![2][2], -1)).toBe(true)
    expect(near(r.T![0][0], 0) && near(r.T![1][1], 0)).toBe(true)
    expect(r.sweep).toEqual({ thetaDeg: 0, pair: '01-10' })
  })

  it('θ = 45° is the singlet: both arrows at the centre and the grid is −I', () => {
    const r = resolveTwoQubitStage(tq(45, '01-10'), 1)
    expect(Math.hypot(...r.rA)).toBeLessThan(1e-9)
    expect(Math.hypot(...r.rB)).toBeLessThan(1e-9)
    for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) expect(near(r.T![i][j], i === j ? -1 : 0), `T[${i}][${j}]`).toBe(true)
    expect(r.purity).toBeCloseTo(1, 9)
    expect(r.entropy).toBeCloseTo(1, 9)
  })

  it('θ = 30°: |r_A| = cos 2θ = ½, xx = yy = −sin 2θ, zz = −1 (closed forms)', () => {
    const r = resolveTwoQubitStage(tq(30, '01-10', { readouts: ['rLength'] }), 1)
    expect(near(Math.hypot(...r.rA), Math.cos(60 * DEG))).toBe(true)
    expect(near(Math.hypot(...r.rB), Math.cos(60 * DEG))).toBe(true)
    expect(near(r.T![0][0], -Math.sin(60 * DEG))).toBe(true)
    expect(near(r.T![1][1], -Math.sin(60 * DEG))).toBe(true)
    expect(near(r.T![2][2], -1)).toBe(true)
    expect(twoQubitReadouts(r).map((x) => x.name)).toContain('rLength')
  })

  it('the default family (no pair) is unchanged: cos θ|00⟩ + sin θ|11⟩ with the old sweep shape', () => {
    const r = resolveTwoQubitStage(tq(30), 1)
    expect(r.sweep).toEqual({ thetaDeg: 30 })
    expect(near(r.rA[2], Math.cos(60 * DEG))).toBe(true)
    expect(near(r.rB[2], Math.cos(60 * DEG))).toBe(true) // |00⟩ side: both up (the 01-10 family has Bob down)
  })

  it('a sweep lerps the angle and rebuilds at the new angle; the two families never blend', () => {
    const a = resolveTwoQubitStage(tq({ from: 0, to: 45 }, '01-10'), 0)
    const b = resolveTwoQubitStage(tq({ from: 0, to: 45 }, '01-10'), 1)
    const mid = interpTwoQubitStage(a, b, 0.5)
    expect(mid.sweep).toEqual({ thetaDeg: 22.5, pair: '01-10' })
    expect(near(Math.hypot(...mid.rA), Math.cos(45 * DEG))).toBe(true)
    // a different family has another key, so the move is a hard switch at the middle
    const other = resolveTwoQubitStage(tq(45), 1)
    expect(a.key).not.toBe(other.key)
    expect(interpTwoQubitStage(a, other, 0.25)).toBe(a)
    expect(interpTwoQubitStage(a, other, 0.75)).toBe(other)
  })

  it('validation: only 00+11 and 01-10', () => {
    expect(validateTwoQubitStage(tq(30, '01-10'))).toEqual([])
    expect(validateTwoQubitStage(tq(30, '00+11'))).toEqual([])
    expect(validateTwoQubitStage(tq(30, '10+01' as unknown as '01-10')).join(' ')).toMatch(/pair/)
  })
})

describe('A2: the amplitudes source {terms} is the engine\'s superpose', () => {
  const amp = (terms: string, rest: Partial<AmplitudesState> = {}): AmplitudesState => ({ kind: 'amplitudes', state: { terms }, ...rest })

  it('draws the notes\' |G⟩: four bars of size ½, signs +, −, −, − on 000, 011, 101, 110', () => {
    const r = resolveAmplitudes(amp('000-011-101-110', { dials: true }), 1)
    expect(r.n).toBe(3)
    const G = superpose('000-011-101-110')
    r.amps.forEach((a, k) => {
      expect(near(a.re, G[k].re) && near(a.im, G[k].im)).toBe(true)
    })
    expect(r.sizes.filter((x) => x > 1e-9).length).toBe(4)
    expect(r.sizes.filter((x) => x > 1e-9).every((x) => near(x, 0.5))).toBe(true)
    expect(r.probs.reduce((s, x) => s + x, 0)).toBeCloseTo(1, 12)
    expect(ampReadouts(r).length).toBeGreaterThan(0)
  })

  it('validates: a malformed content or too many qubits is a problem; a good one is not', () => {
    expect(validateAmplitudes(amp('000-011-101-110'))).toEqual([])
    expect(validateAmplitudes(amp('00+0')).join(' ')).toMatch(/terms/)
    expect(validateAmplitudes(amp('000000+111111')).join(' ')).toMatch(/at most/)
    expect(validateAmplitudes({ kind: 'amplitudes', state: { terms: '00+11', ket: '00' } } as unknown as AmplitudesState).join(' ')).toMatch(/exactly one/)
  })
})

describe('A3: tableau targets are a "need" column with a ✓ or ✗ per row and "wins k of n"', () => {
  const GAME = ['ZZZ', 'ZXX', 'XZX', 'XXZ']
  const TGT = { ZZZ: 1, ZXX: -1, XZX: -1, XXZ: -1 } as const
  const tab = (rest: Partial<MatrixTableauState> = {}): MatrixTableauState => ({ kind: 'matrix', tableau: GAME, targets: { ...TGT }, ...rest })

  it('targets alone: the need column, no verdict', () => {
    const r = resolveMatrixStage(tab(), 1)
    expect(r.rows.map((x) => x.target)).toEqual([1, -1, -1, -1])
    expect(r.rows.every((x) => x.ok === null)).toBe(true)
    expect(r.wins).toBeNull()
  })

  it('a card of "always −1" wins ZXX, XZX, XXZ and loses ZZZ: wins 3 of 4', () => {
    const r = resolveMatrixStage(tab({ values: { ZZZ: -1, ZXX: -1, XZX: -1, XXZ: -1 } }), 1)
    expect(r.rows.map((x) => x.ok)).toEqual([false, true, true, true])
    expect(r.wins).toEqual({ k: 3, of: 4 })
    expect(matrixReadouts(r).map((x) => x.text)).toContain('wins 3 of 4')
  })

  it('a state judges by its eigenvalue: |G⟩ meets every target (wins 4 of 4); |000⟩ meets only ZZZ', () => {
    const g = resolveMatrixStage(tab({ state: { terms: '000-011-101-110' } }), 1)
    expect(g.rows.map((x) => x.eigen)).toEqual([1, -1, -1, -1])
    expect(g.rows.every((x) => x.ok)).toBe(true)
    expect(g.wins).toEqual({ k: 4, of: 4 })
    const u = resolveMatrixStage(tab({ state: { ket: '000' } }), 1)
    expect(u.rows[0].ok).toBe(true)
    expect(u.rows.slice(1).every((x) => x.ok === null || x.ok === false)).toBe(true)
  })

  it('draws the need column and the mark in the scene', () => {
    const r = resolveMatrixStage(tab({ values: { ZZZ: -1, ZXX: -1, XZX: -1, XXZ: -1 } }), 1)
    const html = renderToString(createElement(MatrixScene, { state: r, mode: 'print', width: 480, height: 260, progress: 1 } as never))
    expect(html).toContain('need +1')
    expect(html).toContain('need −1')
    expect(html).toContain('✓')
    expect(html).toContain('✗')
    expect(html).toContain('wins 3 of 4')
  })

  it('validation: a target for a row that is not in the table, or not ±1', () => {
    expect(validateMatrixStage(tab())).toEqual([])
    expect(validateMatrixStage(tab({ targets: { XYZ: 1 } })).join(' ')).toMatch(/not one of the tableau/)
    expect(validateMatrixStage(tab({ targets: { ZZZ: 2 as unknown as 1 } })).join(' ')).toMatch(/\+1 or −1/)
  })

  it('a transition between tableaux is a hard switch (discrete cards)', () => {
    const a = resolveMatrixStage(tab({ values: { ZZZ: -1, ZXX: -1, XZX: -1, XXZ: -1 } }), 1)
    const b = resolveMatrixStage(tab({ state: { terms: '000-011-101-110' } }), 1)
    expect(interpMatrixStage(a, b, 0.25)).toBe(a)
    expect(interpMatrixStage(a, b, 0.75)).toBe(b)
  })
})
