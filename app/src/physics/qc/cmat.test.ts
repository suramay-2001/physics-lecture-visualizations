/**
 * cmat.ts against numpy/scipy (make_qc_fixtures.py block "cmat": np.linalg.eigh/det/inv/matrix_rank/svd/qr/solve,
 * scipy.linalg.polar/sqrtm/logm/expm), eigenvectors compared as projectors (their phase is free), plus properties
 * of the Jacobi routines on seeded random matrices.
 */
import { describe, expect, it } from 'vitest'
import { abs, c } from '../complex'
import { type Mat, dagger, fromColumns, identity, inner, isUnitary, matmul, outer } from '../linalg'
import { rng } from '../random'
import {
  angleBetween,
  changeU,
  components,
  detN,
  eigh,
  expmHermitian,
  fromEigen,
  funcHermitian,
  hermitianAngle,
  invN,
  isIndependent,
  kronM,
  logPSD,
  polar,
  projectOnto,
  projectorOnto,
  randomHermitian,
  randomUnitary,
  rankN,
  simultaneousEigenbasis,
  sqrtPSD,
  svd,
  traceN,
  weightedInner,
} from './cmat'
import { FX, cm, cv, cz, formulaHermitian, matGap, overlap, vecGap } from './testkit'

const D = FX.cmat
const close = (a: number, b: number, eps = 1e-9) => expect(Math.abs(a - b), `${a} vs ${b}`).toBeLessThan(eps)
const diagOf = (s: number[]): Mat => s.map((x, i) => s.map((_, j) => c(i === j ? x : 0)))

describe('eigh (cyclic Jacobi) against np.linalg.eigh', () => {
  it('random Hermitian 2…8: ascending values and every eigenprojector', () => {
    for (const k of D.eighSmall) {
      const { values, vectors } = eigh(cm(k.M))
      values.forEach((v, i) => close(v, k.values[i], 1e-10))
      vectors.forEach((v, i) => expect(matGap(outer(v, v), cm(k.projectors[i]))).toBeLessThan(1e-9))
    }
  })

  it('16×16, 32×32 and 64×64 (the size budget): values, |v_k|² weights and residuals ‖Hv − λv‖', () => {
    for (const k of D.eighLarge) {
      const Hm = formulaHermitian(k.n)
      const { values, vectors } = eigh(Hm)
      values.forEach((v: number, i: number) => close(v, k.values[i], 1e-9))
      vectors.forEach((v, i) => {
        v.forEach((x, j) => close(x.re * x.re + x.im * x.im, k.weights[i][j], 1e-9))
        const Hv = Hm.map((row) => row.reduce((s, h, j) => c(s.re + h.re * v[j].re - h.im * v[j].im, s.im + h.re * v[j].im + h.im * v[j].re), c(0)))
        expect(vecGap(Hv, v.map((x) => c(x.re * values[i], x.im * values[i])))).toBeLessThan(1e-9)
      })
    }
  })

  it('repeated eigenvalues: values with multiplicity and each eigenspace projector (sum over the group)', () => {
    for (const k of D.eighDegenerate) {
      const { values, vectors } = eigh(cm(k.M))
      values.forEach((v, i) => close(v, k.values[i], 1e-10))
      for (const g of k.groups) {
        const idx = values.map((v, i) => [v, i] as const).filter(([v]) => Math.abs(v - g.value) < 1e-8).map(([, i]) => i)
        expect(idx.length).toBe(g.mult)
        expect(matGap(fromEigen(idx.map(() => 1), idx.map((i) => vectors[i])), cm(g.projector))).toBeLessThan(1e-9)
      }
    }
  })

  it('properties on 30 seeded matrices: V unitary, V diag(λ) V† = H, 448 phase convention', () => {
    const R = rng(7091)
    for (let t = 0; t < 30; t++) {
      const n = 1 + Math.floor(R() * 12)
      const Hm = randomHermitian(n, R)
      const { values, vectors } = eigh(Hm)
      expect(isUnitary(fromColumns(vectors), 1e-10)).toBe(true)
      expect(matGap(fromEigen(values, vectors), Hm)).toBeLessThan(1e-10)
      for (const v of vectors) {
        const lead = v.find((x) => x.re * x.re + x.im * x.im > 1e-12)!
        expect(lead.re).toBeGreaterThan(0)
        close(lead.im, 0, 1e-12)
      }
    }
  })

  it('rejects a non-Hermitian matrix instead of returning a wrong spectrum', () => {
    expect(() => eigh([[c(1), c(2)], [c(0), c(1)]])).toThrow(/Hermitian/)
  })
})

describe('det, inverse, trace, rank, kron against numpy', () => {
  it('detN (LU with pivoting) = np.linalg.det; invN = np.linalg.inv; traceN = np.trace', () => {
    for (const k of D.detInv) {
      const M = cm(k.M)
      const d = detN(M)
      expect(abs(c(d.re - k.det[0], d.im - k.det[1]))).toBeLessThan(1e-9 * Math.max(1, abs(cz(k.det))))
      expect(matGap(invN(M)!, cm(k.inv))).toBeLessThan(1e-9)
      expect(matGap(matmul(M, invN(M)!), identity(M.length))).toBeLessThan(1e-10)
      const t = traceN(M)
      close(t.re, k.trace[0], 1e-12)
      close(t.im, k.trace[1], 1e-12)
    }
  })

  it('a rank-2 4×4 matrix has no inverse and a zero determinant', () => {
    const M = cm(D.singular)
    expect(invN(M)).toBeNull()
    expect(abs(detN(M))).toBeLessThan(1e-10)
  })

  it('rankN = np.linalg.matrix_rank (square, tall, wide, zero)', () => {
    for (const k of D.ranks) expect(rankN(cm(k.M))).toBe(k.rank)
  })

  it('kronM = np.kron for rectangular factors', () => {
    expect(matGap(kronM(cm(D.kron.A), cm(D.kron.B)), cm(D.kron.AB))).toBeLessThan(1e-13)
  })
})

describe('SVD (one-sided Jacobi) and polar decomposition', () => {
  it('singular values = np.linalg.svd, u_k v_k† outer products agree, M = U diag(s) V†', () => {
    for (const k of D.svd) {
      const M = cm(k.M)
      const { U, s, V } = svd(M)
      k.s.slice(0, s.length).forEach((x: number, i: number) => close(s[i], x, 1e-10))
      for (let i = 0; i < k.rank; i++) {
        const u = U.map((row) => row[i])
        const v = V.map((row) => row[i])
        expect(matGap(outer(u, v), cm(k.uv[i]))).toBeLessThan(1e-9)
      }
      expect(matGap(matmul(matmul(U, diagOf(s)), dagger(V)), M)).toBeLessThan(1e-10)
      expect(matGap(matmul(dagger(V), V), identity(V[0].length))).toBeLessThan(1e-10)
      expect(matGap(matmul(dagger(U), U), identity(U[0].length))).toBeLessThan(1e-10)
    }
  })

  it('polar M = U P equals scipy.linalg.polar (U unitary, P positive)', () => {
    for (const k of D.polar) {
      const { U, P } = polar(cm(k.M))
      expect(matGap(U, cm(k.U))).toBeLessThan(1e-9)
      expect(matGap(P, cm(k.P))).toBeLessThan(1e-9)
      expect(isUnitary(U, 1e-10)).toBe(true)
    }
  })
})

describe('functions of a Hermitian matrix against scipy', () => {
  const F = D.funcs
  it('sqrtPSD = sqrtm (full rank and rank 2), logPSD = logm, expmHermitian = expm(−iHt)', () => {
    expect(matGap(sqrtPSD(cm(F.psd)), cm(F.sqrt))).toBeLessThan(1e-9)
    expect(matGap(sqrtPSD(cm(F.psdLow)), cm(F.sqrtLow))).toBeLessThan(1e-10)
    expect(matGap(logPSD(cm(F.pd))!, cm(F.log))).toBeLessThan(1e-9)
    expect(matGap(expmHermitian(cm(F.H), F.t), cm(F.expm))).toBeLessThan(1e-10)
    expect(logPSD(cm(F.psdLow))).toBeNull()
    expect(() => sqrtPSD([[c(1), c(0)], [c(0), c(-0.5)]])).toThrow(/semidefinite/)
  })

  it('funcHermitian(H, x ↦ x) = H and (√M)² = M', () => {
    const R = rng(7092)
    const Hm = randomHermitian(5, R)
    expect(matGap(funcHermitian(Hm, (x) => x), Hm)).toBeLessThan(1e-10)
    const M = cm(F.psd)
    const s = sqrtPSD(M)
    expect(matGap(matmul(s, s), M)).toBeLessThan(1e-9)
  })

  it('simultaneousEigenbasis of commuting A, B with degenerate eigenspaces = the joint pairs of numpy (eigh of A + (π/7)B)', () => {
    const A = cm(D.commuting.A)
    const B = cm(D.commuting.B)
    const r = simultaneousEigenbasis(A, B)!
    const key = (x: number) => Math.round(x * 1e6)
    const pairs = r.valuesA.map((a, i) => [a, r.valuesB[i]]).sort((p, q) => key(p[0]) - key(q[0]) || key(p[1]) - key(q[1]))
    pairs.forEach((p, i) => {
      close(p[0], D.commuting.pairs[i][0], 1e-8)
      close(p[1], D.commuting.pairs[i][1], 1e-8)
    })
    const V = fromColumns(r.vectors)
    for (const M of [A, B]) {
      const Dm = matmul(matmul(dagger(V), M), V)
      Dm.forEach((row, i) => row.forEach((x, j) => i !== j && expect(abs(x)).toBeLessThan(1e-9)))
    }
    expect(simultaneousEigenbasis(cm(FX.gates.fixed.X), cm(FX.gates.fixed.Z))).toBeNull()
  })
})

describe('vectors, projections and bases (F2, F3)', () => {
  it('projectOnto / projectorOnto = Q Q† v from np.linalg.qr', () => {
    const P = D.project
    const span = P.span.map(cv)
    expect(vecGap(projectOnto(cv(P.v), span), cv(P.proj))).toBeLessThan(1e-10)
    expect(matGap(projectorOnto(span), cm(P.projector))).toBeLessThan(1e-10)
  })

  it('angleBetween (law of cosines; Re⟨a|b⟩ for complex vectors) and hermitianAngle (|⟨a|b⟩|)', () => {
    const A = D.angles
    close(angleBetween(A.a.map((x: number) => c(x)), A.b.map((x: number) => c(x))), A.real, 1e-12)
    close(angleBetween(cv(A.ac), cv(A.bc)), A.complex, 1e-12)
    close(hermitianAngle(cv(A.ac), cv(A.bc)), A.hermitian, 1e-12)
  })

  it('components = np.linalg.solve in a skewed basis; null when the vectors are not a basis', () => {
    const K = D.components
    expect(vecGap(components(cv(K.psi), K.basis.map(cv))!, cv(K.c))).toBeLessThan(1e-10)
    const b = K.basis.map(cv)
    expect(components(cv(K.psi), [b[0], b[1], b[0]])).toBeNull()
  })

  it('isIndependent agrees with numpy matrix_rank', () => {
    for (const k of D.independent) expect(isIndependent(k.vs.map(cv))).toBe(k.yes)
  })

  it('weightedInner a†Mb', () => {
    const W = D.weighted
    const z = weightedInner(cm(W.M), cv(W.a), cv(W.b))
    close(z.re, W.value[0], 1e-12)
    close(z.im, W.value[1], 1e-12)
  })

  it('changeU(new) = basisMatrix(new)† and changeU(new, old)_ij = ⟨new_i|old_j⟩ (decisions C7)', () => {
    const K = D.changeU
    expect(matGap(changeU(K.basis.map(cv)), cm(K.U))).toBeLessThan(1e-12)
    expect(matGap(changeU(K.basis.map(cv), K.old.map(cv)), cm(K.Uold))).toBeLessThan(1e-12)
  })

  it('randomUnitary is unitary; eigenvectors of a seeded Hermitian are orthonormal (inner products)', () => {
    const R = rng(7093)
    for (let d = 1; d <= 8; d++) expect(isUnitary(randomUnitary(d, R), 1e-10)).toBe(true)
    const { vectors } = eigh(randomHermitian(6, R))
    vectors.forEach((a, i) => vectors.forEach((b, j) => close(abs(inner(a, b)), i === j ? 1 : 0, 1e-10)))
    close(overlap(vectors[0], vectors[0]), 1, 1e-12)
  })
})
