import { describe, expect, it } from 'vitest'
import fx from './__fixtures__/numpy.json'
import { type C, c, I, approxEq, arg, csqrt, cpow } from './complex'
import { type Mat, type Vec, apply, matEq, isHermitian, isUnitary, identity, madd, matmul, gramSchmidt, vec, inner, norm, bilinear, vconj } from './linalg'
import {
  SX, SY, SZ, KET, blochVector, expectation, variance, eigenHermitian2, projector, rotation, Rz,
  operatorInBasis, toBasis, fromSpectrum, probUpAlong, tiltXZ, measure, prob, samePhysicalState, ketFromBloch,
  ketFromCoeff, relativeCoeff, mutuallyUnbiased, ketAlong, neg3, sandwich, collapse,
  type Vec3,
} from './spin'
import { rng, binomialPmf } from './random'

const V = (xs: C[]): Vec => xs
const M = (xs: C[][]): Mat => xs
const close = (a: number, b: number, eps = 1e-9) => expect(Math.abs(a - b)).toBeLessThan(eps)

describe('engine agrees with numpy', () => {
  it('expectation values, variance and Bloch vector', () => {
    for (const s of fx.states) {
      const psi = V(s.psi)
      close(expectation(SX, psi), s.Sx)
      close(expectation(SY, psi), s.Sy)
      close(expectation(SZ, psi), s.Sz)
      close(variance(SX, psi), s.varSx)
      blochVector(psi).forEach((x, i) => close(x, s.bloch[i]))
    }
  })

  it('Hermitian eigen-decomposition (values and phase-free projectors)', () => {
    for (const h of fx.hermitians) {
      const { values, vectors } = eigenHermitian2(M(h.M))
      values.forEach((v, i) => close(v, h.values[i]))
      vectors.forEach((v, i) => expect(matEq(projector(v), M(h.projectors[i]), 1e-8)).toBe(true))
    }
  })

  it('rotations match exp(-iφ n·S) computed spectrally', () => {
    for (const r of fx.rotations) {
      const U = rotation(r.n as Vec3, r.phi)
      expect(matEq(U, M(r.U), 1e-9)).toBe(true)
      blochVector(apply(U, V(r.psi))).forEach((x, i) => close(x, r.bloch_after[i], 1e-8))
    }
  })

  it('basis changes: c_new = B†c_old, A_new = B†AB, predictions unchanged', () => {
    for (const b of fx.basis_changes) {
      const basis = b.basis.map(V)
      expect(matEq(operatorInBasis(M(b.A), basis), M(b.A_new))).toBe(true)
      const psiNew = toBasis(V(b.psi), basis)
      psiNew.forEach((z, i) => expect(approxEq(z, b.psi_new[i])).toBe(true))
      close(expectation(operatorInBasis(M(b.A), basis), psiNew), b.expectation)
    }
  })
})

describe('lecture facts', () => {
  it('spin matrices are Hermitian and built from their projectors (L4)', () => {
    for (const S of [SX, SY, SZ]) expect(isHermitian(S)).toBe(true)
    expect(matEq(fromSpectrum([0.5, -0.5], [KET['+x'], KET['-x']]), SX)).toBe(true)
    expect(matEq(fromSpectrum([0.5, -0.5], [KET['+y'], KET['-y']]), SY)).toBe(true)
  })

  it('projectors are complete: P+ + P- = I (L3)', () => {
    for (const [p, m] of [['+x', '-x'], ['+y', '-y'], ['+z', '-z']] as const) {
      expect(matEq(madd(projector(KET[p]), projector(KET[m])), identity(2))).toBe(true)
    }
  })

  it('x, y, z bases are mutually unbiased (L2)', () => {
    const bases = [['+x', '-x'], ['+y', '-y'], ['+z', '-z']] as const
    for (const A of bases) for (const B of bases) {
      if (A === B) continue
      for (const a of A) for (const b of B) close(prob(KET[a], KET[b]), 0.5)
    }
  })

  it('P(+) at 45° is cos²(22.5°) ≈ 0.854, not 3/4 (correction to L1)', () => {
    close(probUpAlong(tiltXZ(Math.PI / 4), [0, 0, 1]), fx.lecture_numbers.P_up_45deg)
    close(probUpAlong(tiltXZ(Math.PI / 3), [0, 0, 1]), 0.75)
    expect(Math.abs(probUpAlong(tiltXZ(Math.PI / 4), [0, 0, 1]) - 0.75)).toBeGreaterThan(0.1)
  })

  it('⟨Sz⟩ = ħ/4 for (√3/2)|+z⟩ + (1/2)|−z⟩, not zero (correction to L4 p.10)', () => {
    close(expectation(SZ, vec(Math.sqrt(3) / 2, 0.5)), 0.25)
  })

  it('L5 worked example: ψ = (√3/2, i/2) gives ⟨S⟩ = (0, √3/4, 1/4)', () => {
    const psi = vec(Math.sqrt(3) / 2, c(0, 0.5))
    close(expectation(SX, psi), 0)
    close(expectation(SY, psi), Math.sqrt(3) / 4)
    close(expectation(SZ, psi), 0.25)
  })

  it('an operator is diagonal in its own eigenbasis (L5/L6)', () => {
    const Sx_in_x = operatorInBasis(SX, [KET['+x'], KET['-x']])
    expect(matEq(Sx_in_x, M([[c(0.5), c(0)], [c(0), c(-0.5)]]))).toBe(true)
    // …and S_z in the x basis looks like S_x in the z basis
    expect(matEq(operatorInBasis(SZ, [KET['+x'], KET['-x']]), SX)).toBe(true)
  })

  it('Rz(φ) moves equatorial state θ to θ+φ up to global phase (L6)', () => {
    const eq = (t: number) => ketFromBloch(Math.PI / 2, t)
    expect(samePhysicalState(apply(Rz(0.7), eq(0.3)), eq(1.0))).toBe(true)
    expect(isUnitary(Rz(1.234))).toBe(true)
    expect(matEq(matmul(Rz(0.4), Rz(0.5)), Rz(0.9))).toBe(true)
    expect(matEq(Rz(0.9), rotation([0, 0, 1], 0.9))).toBe(true)
    // |+z⟩ only picks up a global phase
    expect(samePhysicalState(apply(Rz(2), KET['+z']), KET['+z'])).toBe(true)
  })

  it('Rz(2π) = −I: a full turn flips the sign of every spinor', () => {
    expect(matEq(Rz(2 * Math.PI), M([[c(-1), c(0)], [c(0), c(-1)]]))).toBe(true)
  })

  it('Gram–Schmidt reproduces the L4 identity-matrix example', () => {
    const { basis } = gramSchmidt([vec(1, 0), vec(Math.SQRT1_2, Math.SQRT1_2)])
    expect(basis.map((b) => b.map((z) => Math.round(z.re * 1e9) / 1e9))).toEqual([[1, 0], [0, 1]])
  })

  it('Gram–Schmidt gives an orthonormal set in 3D', () => {
    const { basis } = gramSchmidt([vec(1, 1, 0), vec(1, 0, 1), vec(0, 1, 1)])
    for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) close(inner(basis[i], basis[j]).re, i === j ? 1 : 0)
    basis.forEach((b) => close(norm(b), 1))
  })
})

describe('measurement statistics', () => {
  it('sampled frequencies converge to Born probabilities', () => {
    const rand = rng(7)
    const psi = vec(Math.sqrt(3) / 2, 0.5)
    let up = 0
    const N = 20000
    for (let i = 0; i < N; i++) if (measure(SZ, psi, rand()).value > 0) up++
    // 5σ band around 0.75: σ = sqrt(p(1-p)/N) ≈ 0.003
    expect(Math.abs(up / N - 0.75)).toBeLessThan(0.016)
  })

  it('post-measurement state is the eigenstate (repeat gives same result)', () => {
    const first = measure(SZ, KET['+x'], 0.2)
    expect(measure(SZ, first.post, 0.999).value).toBe(first.value)
  })

  it('binomial pmf sums to 1', () => {
    let s = 0
    for (let k = 0; k <= 100; k++) s += binomialPmf(k, 100, 0.3)
    close(s, 1, 1e-9)
  })
})

describe('Lecture 2 helpers agree with numpy', () => {
  const L2 = fx.lecture2
  it('the unconjugated product gives 0 for |+y⟩ with itself; the inner product gives its true length 1', () => {
    expect(approxEq(bilinear(KET['+y'], KET['+y']), L2.bilinear_yy as C)).toBe(true)
    expect(approxEq(inner(KET['+y'], KET['+y']), L2.inner_yy as C)).toBe(true)
    expect(approxEq(bilinear(KET['+x'], KET['+x']), L2.bilinear_xx as C)).toBe(true)
    expect(approxEq(bilinear(KET['+y'], KET['+y']), inner(vconj(KET['+y']), KET['+y']))).toBe(true)
  })
  it('the trial family (|+z⟩ + c|−z⟩)/norm: sizes and z, x, y probabilities', () => {
    for (const f of L2.family) {
      const psi = ketFromCoeff(f.c as C)
      psi.forEach((x, i) => close(Math.hypot(x.re, x.im), f.psi_abs[i]))
      close(prob(KET['+z'], psi), f.pz)
      close(prob(KET['+x'], psi), f.px)
      close(prob(KET['+y'], psi), f.py)
      expect(approxEq(relativeCoeff(psi)!, f.c as C)).toBe(true)
    }
    expect(relativeCoeff(KET['-z'])).toBeNull()
    close(arg(relativeCoeff(KET['-y'])!), L2.relcoeff_arg_minus_y)
  })
  it('z, x and y are pairwise mutually unbiased; a 45° tilt is not', () => {
    const B: Record<string, Vec[]> = {
      x: [KET['+x'], KET['-x']], y: [KET['+y'], KET['-y']], z: [KET['+z'], KET['-z']],
      t45: [ketAlong(tiltXZ(Math.PI / 4)), ketAlong(neg3(tiltXZ(Math.PI / 4)))],
    }
    for (const p of L2.pairs) expect(mutuallyUnbiased(B[p.a], B[p.b]), `${p.a}/${p.b}`).toBe(p.unbiased)
  })
  it('√(−2) and powers of i', () => {
    expect(approxEq(csqrt(c(-2)), L2.sqrt_minus2 as C)).toBe(true)
    for (const [n, v] of Object.entries(L2.i_powers)) expect(approxEq(cpow(I, Number(n)), v as C, 1e-9), `i^${n}`).toBe(true)
    expect(() => cpow(I, 0.5)).toThrow()
  })
})

describe('Lecture 3 helpers agree with numpy', () => {
  const L3 = fx.lecture3
  it('sandwich ⟨ψ|A|ψ⟩ is complex for any A', () => {
    for (const s of L3.sandwiches) expect(approxEq(sandwich(s.M as unknown as Mat, s.psi as unknown as Vec), s.value as C, 1e-9)).toBe(true)
  })
  it('collapse: the chance of an outcome and the state after it, with no re-phasing (|+y⟩ → i|−z⟩)', () => {
    for (const k of L3.collapses) {
      const r = collapse(k.P as unknown as Mat, k.psi as unknown as Vec)
      close(r.p, k.p)
      if (k.post === null) expect(r.post).toBeNull()
      else r.post!.forEach((x, i) => expect(approxEq(x, (k.post as C[])[i], 1e-9)).toBe(true))
    }
  })
  it('guards: eigenHermitian2 and expectation refuse a non-Hermitian matrix instead of answering wrongly', () => {
    const R: Mat = [[c(0), c(-1)], [c(1), c(0)]]
    expect(() => eigenHermitian2(R)).toThrow(/not Hermitian/)
    expect(() => expectation(R, KET['+y'])).toThrow(/not real/)
    expect(approxEq(sandwich(R, KET['+y']), c(0, -1))).toBe(true)
  })
})
