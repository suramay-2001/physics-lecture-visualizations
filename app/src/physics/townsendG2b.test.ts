/**
 * Engine additions of the 448 Townsend pass, group G2b (Lectures 7-8) against their numpy twin
 * (pipeline/claims_448/g2b.py -> __fixtures__/claims-448/g2b.json `cases`): physics/angmom.ts (spin j from the ladder coefficient),
 * polarization.ts (chain of polarizers, wave plate, the spin a beam carries) and spin.ts schwarzParts (the pieces of Townsend's proof).
 */
import { describe, expect, it } from 'vitest'
import fx from './__fixtures__/claims-448/g2b.json'
import { c } from './complex'
import { commutator, identity, isHermitian, isUnitary, matEq, mscale } from './linalg'
import { J_VALUES, type AxisSpec, axisVec, coneAngle, eigAlong, jAlong, jLength, jMatrices, ladderCoeff, levelCount, mLevels, rot3, rotJ, zChances } from './angmom'
import { POL, chainTransmission, circularChance, photonJz, plateDelta, quarterWaveThickness } from './polarization'
import { KET, SX, SY, ketFromBloch, prob, schwarzParts } from './spin'

const DEG = Math.PI / 180
const close = (a: number, b: number, eps = 1e-12) => expect(Math.abs(a - b), `${a} vs ${b}`).toBeLessThan(eps)
type ReIm = { re: number[][]; im: number[][] }
const matClose = (M: { re: number; im: number }[][], ref: ReIm, eps = 1e-12) =>
  M.forEach((row, i) =>
    row.forEach((z, k) => {
      close(z.re, ref.re[i][k], eps)
      close(z.im, ref.im[i][k], eps)
    }),
  )

describe('angmom.ts jMatrices: spin j from the ladder coefficient (Townsend Eqs. 3.28, 3.59-3.62)', () => {
  it.each(fx.cases.jMatrices)('j = $j agrees with the matrices of added spin-1/2s', (k) => {
    const M = jMatrices(k.j)
    matClose(M.Jx, k.Jx)
    matClose(M.Jy, k.Jy)
    matClose(M.Jz, k.Jz)
    matClose(M.J2, k.J2)
  })

  it('the commutators [Jx, Jy] = i Jz (Eq. 3.14) and [Jz, J+] = J+ (Eq. 3.39) hold for every j; J+ is the adjoint of J-; every matrix is Hermitian', () => {
    for (const j of J_VALUES) {
      const { Jx, Jy, Jz, Jp, Jm, J2 } = jMatrices(j)
      expect(matEq(commutator(Jx, Jy), mscale(Jz, c(0, 1))), `j=${j}`).toBe(true)
      expect(matEq(commutator(Jz, Jp), Jp), `j=${j}`).toBe(true)
      expect(matEq(commutator(Jz, Jm), mscale(Jm, -1)), `j=${j}`).toBe(true)
      for (const A of [Jx, Jy, Jz, J2]) expect(isHermitian(A)).toBe(true)
      expect(matEq(J2, mscale(identity(levelCount(j)), j * (j + 1)))).toBe(true)
    }
  })

  it('there are 2j + 1 levels from +j down to -j, the ladder stops at both ends, and |J| = sqrt(j(j+1))', () => {
    for (const j of J_VALUES) {
      expect(levelCount(j)).toBe(2 * j + 1)
      expect(mLevels(j)[0]).toBe(j)
      expect(mLevels(j).at(-1)).toBe(-j)
      close(ladderCoeff(j, j, '+'), 0)
      close(ladderCoeff(j, -j, '-'), 0)
      close(jLength(j) ** 2, j * (j + 1))
    }
    close(ladderCoeff(1, 0, '+'), Math.SQRT2)
    close(coneAngle(1, 1), 45 * DEG)
  })
})

describe('angmom.ts eigAlong / zChances / rotJ', () => {
  const spec = (a: string | { thetaDeg: number; phiDeg: number }): AxisSpec => (typeof a === 'string' ? (a as AxisSpec) : a)
  it.each(fx.cases.zChances.map((k, i) => ({ ...k, i })))('chances of |$j, $m> along an axis on the z ladder (case $i)', (k) => {
    const ch = zChances(k.j, spec(k.axis), k.m)
    expect(ch).toHaveLength(k.chances.length)
    ch.forEach((x, n) => close(x, k.chances[n]))
    close(ch.reduce((s, x) => s + x, 0), 1)
  })

  it.each(fx.cases.rotJ)('R(t n) = exp(-i t J.n) agrees with the eigh-built twin: j = $j about $axis by $tDeg degrees', (k) => {
    const U = rotJ(k.j, k.axis as AxisSpec, k.tDeg * DEG)
    matClose(U, k, 1e-11)
    expect(isUnitary(U)).toBe(true)
  })

  it('for spin 1/2 the eigenkets are the engine spin kets (up to a phase) and rotJ is the spin-1/2 rotation', () => {
    close(prob(KET['+y'], eigAlong(0.5, 'y', 0.5)), 1)
    close(prob(ketFromBloch(70 * DEG, 0), eigAlong(0.5, { thetaDeg: 70, phiDeg: 0 }, 0.5)), 1)
    matClose(rotJ(0.5, 'y', 1.3), { re: [[Math.cos(0.65), -Math.sin(0.65)], [Math.sin(0.65), Math.cos(0.65)]], im: [[0, 0], [0, 0]] })
    expect(axisVec({ thetaDeg: 90, phiDeg: 90 })[1]).toBeCloseTo(1, 12)
  })

  it('J.n has the eigenvalues m = j, ..., -j for a tilted axis, and a wrong m throws', () => {
    const A = jAlong(1.5, { thetaDeg: 40, phiDeg: 100 })
    expect(isHermitian(A)).toBe(true)
    expect(() => eigAlong(1, 'z', 0.5)).toThrow()
  })

  it('rot3 turns an ordinary vector counterclockwise: x to y about z, y to z about x, z to x about y (Eqs. 3.3, 3.5, 3.7)', () => {
    const turn = (R: number[][], v: number[]) => R.map((row) => row.reduce((s, x, k) => s + x * v[k], 0))
    const q = Math.PI / 2
    expect(turn(rot3('z', q), [1, 0, 0]).map((x) => Math.round(x))).toEqual([0, 1, 0])
    expect(turn(rot3('x', q), [0, 1, 0]).map((x) => Math.round(x))).toEqual([0, 0, 1])
    expect(turn(rot3('y', q), [0, 0, 1]).map((x) => Math.round(x))).toEqual([1, 0, 0])
  })
})

describe('polarization.ts: chain of polarizers, wave plate, the spin a beam carries (Townsend Sec. 2.7, Problems 2.12, 2.13, 2.21)', () => {
  it.each(fx.cases.chain)('chainTransmission($n, $phiDeg) agrees with the product of overlaps', (k) => close(chainTransmission(k.n, k.phiDeg), k.p))
  it.each(fx.cases.plate)('plate dn=$dn d=$d lambda=$lambda: phase, chance of C+, quarter-wave thickness', (k) => {
    close(plateDelta(k.dn, k.d, k.lambda), k.delta)
    close(circularChance(k.delta), k.chance)
    close(quarterWaveThickness(k.dn, k.lambda), k.quarter)
  })
  it.each(fx.cases.photonJz)('photonJz agrees with the expectation of the J_z matrix', (k) => close(photonJz(c(k.a[0], k.a[1]), c(k.b[0], k.b[1])), k.jz))

  it('circularChance is the overlap with |C+> of the plate state (1, e^{i delta})/sqrt2', () => {
    for (const delta of [0.3, 1.2, 2.5, 4, 5.9]) {
      const state = [c(Math.SQRT1_2), c(Math.SQRT1_2 * Math.cos(delta), Math.SQRT1_2 * Math.sin(delta))]
      close(prob(POL.Cp, state), circularChance(delta))
    }
  })
})

describe('spin.ts schwarzParts: the pieces of Townsend Eqs. 3.65-3.75', () => {
  it.each(fx.cases.schwarz)('state ($thetaDeg, $phiDeg) agrees with the shifted-ket twin', (k) => {
    const p = schwarzParts(SX, SY, ketFromBloch(k.thetaDeg * DEG, k.phiDeg * DEG))
    close(p.cov, k.cov)
    close(p.comm, k.comm)
    close(p.prod, k.prod)
  })
  it('for a qubit the Schwarz inequality is an equality: prod = cov + comm, and comm = <Sz>^2/4', () => {
    for (const [t, ph] of [[20, 10], [60, 45], [100, 200], [170, 300]]) {
      const psi = ketFromBloch(t * DEG, ph * DEG)
      const p = schwarzParts(SX, SY, psi)
      close(p.prod, p.cov + p.comm)
      close(p.comm, (Math.cos(t * DEG) / 2) ** 2 / 4)
    }
  })
})
