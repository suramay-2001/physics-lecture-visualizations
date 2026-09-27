/**
 * qc/density.ts against numpy/scipy (block "density": np.einsum partial traces to 5 qubits, reshape/transpose
 * partial transposes, eigvalsh trace distances, the sqrtm route for root fidelity, embedded projectors for selective
 * measurement), plus properties: Tr_A Tr_B = Tr and partial traces compose in any order; no signalling (a local
 * unitary on B leaves ρ_A unchanged); purify then trace = ρ; Schmidt reconstructs ψ; Fuchs–van de Graaf holds.
 */
import { describe, expect, it } from 'vitest'
import { c } from '../complex'
import { type Mat, matmul, outer } from '../linalg'
import { rng } from '../random'
import { eigh, kronM, randomUnitary, traceN } from './cmat'
import {
  densityOf,
  fidelity,
  fidelitySq,
  fvdg,
  isDensity,
  mixtureN,
  partialTrace,
  postMeasureRho,
  ptranspose,
  purify,
  purityN,
  randomDensity,
  reducedBloch,
  reducedDensity,
  schmidt,
  traceDistance,
} from './density'
import { applyGate } from './gates'
import { bell, embed, kron, ket, randomState } from './state'
import { FX, cm, cv, matGap, vecGap } from './testkit'

const D = FX.density
const close = (a: number, b: number, eps = 1e-12) => expect(Math.abs(a - b), `${a} vs ${b}`).toBeLessThan(eps)
const RHO: Record<number, Mat> = { 3: cm(D.rho3), 4: cm(D.rho4), 5: cm(D.rho5) }
const conjugate = (U: Mat, rho: Mat): Mat => matmul(matmul(U, rho), U.map((_, j) => U.map((row) => c(row[j].re, -row[j].im))))

describe('partial trace and reduced states against np.einsum', () => {
  it('partialTrace over any subset of 3, 4 and 5 qubits (32×32)', () => {
    for (const k of D.partialTrace) expect(matGap(partialTrace(RHO[k.n], k.traceOut), cm(k.result)), `n = ${k.n}, out ${k.traceOut}`).toBeLessThan(1e-14)
  })

  it('reducedDensity straight from a ket = Tr of |ψ⟩⟨ψ| (einsum); reducedBloch = Tr(ρ_q σ) for pure and mixed states', () => {
    const psi = cv(D.pure3)
    for (const k of D.reduced) expect(matGap(reducedDensity(psi, k.keep), cm(k.rho))).toBeLessThan(1e-14)
    for (let q = 0; q < 3; q++) {
      reducedBloch(psi, q).forEach((x, i) => close(x, D.bloch.pure[q][i]))
      reducedBloch(RHO[3], q).forEach((x, i) => close(x, D.bloch.mixed[q][i]))
    }
  })

  it('consistency: Tr_A Tr_B ρ = Tr_{AB} ρ in either order; Tr of the reduced state is 1; reducedDensity = partialTrace', () => {
    const R = rng(7101)
    for (let t = 0; t < 10; t++) {
      const n = 3 + (t % 3)
      const rho = randomDensity(2 ** n, R, 1 + (t % 4))
      const both = partialTrace(rho, [0, n - 1])
      // trace out qubit 0 first (the others shift down by one), or qubit n−1 first
      expect(matGap(partialTrace(partialTrace(rho, [0]), [n - 2]), both)).toBeLessThan(1e-13)
      expect(matGap(partialTrace(partialTrace(rho, [n - 1]), [0]), both)).toBeLessThan(1e-13)
      close(traceN(both).re, 1)
      const psi = randomState(n, R)
      expect(matGap(reducedDensity(psi, [1, n - 1]), partialTrace(densityOf(psi), Array.from({ length: n }, (_, k) => k).filter((k) => k !== 1 && k !== n - 1)))).toBeLessThan(1e-13)
    }
  })

  it('no signalling: any unitary on B (in place, strided) leaves ρ_A unchanged; a unitary on A changes it', () => {
    const R = rng(7102)
    for (let t = 0; t < 15; t++) {
      const psi = randomState(4, R)
      const before = reducedDensity(psi, [0, 1])
      const after = reducedDensity(applyGate(psi.slice(), randomUnitary(4, R), [3, 2]), [0, 1])
      expect(matGap(after, before)).toBeLessThan(1e-13)
      const rho = randomDensity(8, R)
      expect(matGap(partialTrace(conjugate(embed(randomUnitary(2, R), 3, [2]), rho), [2]), partialTrace(rho, [2]))).toBeLessThan(1e-13)
    }
    const psi = randomState(3, R)
    expect(matGap(reducedDensity(applyGate(psi.slice(), randomUnitary(2, R), [0]), [0]), reducedDensity(psi, [0]))).toBeGreaterThan(1e-3)
  })
})

describe('partial transpose, Schmidt, purification', () => {
  it('ptranspose = reshape/transpose on 2 and 3 qubits; T_B of Φ+ has eigenvalue −½ (Peres)', () => {
    for (const k of D.ptranspose) expect(matGap(ptranspose(cm(k.rho), k.qubits), cm(k.result))).toBe(0)
    const bellCase = D.ptranspose[2]
    eigh(ptranspose(cm(bellCase.rho), [1])).values.forEach((v, i) => close(v, bellCase.eig[i]))
    close(eigh(ptranspose(densityOf(bell('01-10')), [0])).values[0], -0.5)
  })

  it('schmidt: coefficients = singular values of the cut, orthonormal a_k and b_k, Σ λ a⊗b = ψ (A first)', () => {
    for (const k of FX.state.cuts) {
      const psi = cv(k.psi)
      const s = schmidt(psi, k.A)
      expect(s.rank).toBe(k.rank)
      s.coeffs.forEach((x, i) => close(x, k.s[i], 1e-10))
      close(s.coeffs.reduce((acc, x) => acc + x * x, 0), 1, 1e-12)
      if (k.A.length === 1 && k.A[0] === 0) {
        // for the cut q0 | rest the tensor order is unchanged, so Σ λ_k a_k ⊗ b_k is ψ itself
        const rebuilt = s.coeffs.reduce((acc, l, i) => acc.map((x, j) => c(x.re + l * kron(s.a[i], s.b[i])[j].re, x.im + l * kron(s.a[i], s.b[i])[j].im)), psi.map(() => c(0)))
        expect(vecGap(rebuilt, psi)).toBeLessThan(1e-12)
      }
    }
    expect(schmidt(bell('00+11'), [0]).coeffs.map((x) => x * x)).toEqual([expect.closeTo(0.5, 12), expect.closeTo(0.5, 12)])
  })

  it('purify: tracing the ancilla returns ρ (rank 1…4 on two qubits)', () => {
    const R = rng(7103)
    for (let r = 1; r <= 4; r++) {
      const rho = randomDensity(4, R, r)
      const Psi = purify(rho)
      close(Psi.reduce((s, x) => s + x.re * x.re + x.im * x.im, 0), 1, 1e-12)
      expect(matGap(reducedDensity(Psi, [0, 1]), rho)).toBeLessThan(1e-12)
    }
  })
})

describe('purity, distances and fidelity against numpy/scipy', () => {
  it('traceDistance = ½Σ|eig(ρ − σ)|, root fidelity = Tr√(√σ ρ √σ) (scipy sqrtm), purity = Tr ρ²', () => {
    for (const k of D.pairs) {
      const rho = cm(k.rho)
      const sigma = cm(k.sigma)
      close(traceDistance(rho, sigma), k.D, 1e-10)
      close(fidelity(rho, sigma), k.F, 1e-10)
      close(fidelity(sigma, rho), k.F, 1e-10)
      close(fidelitySq(rho, sigma), k.F * k.F, 1e-10)
      close(purityN(rho), k.purityRho, 1e-12)
      const f = fvdg(rho, sigma)
      expect(f.lower).toBeLessThanOrEqual(f.D + 1e-12)
      expect(f.D).toBeLessThanOrEqual(f.upper + 1e-12)
    }
    const P = D.purePair
    close(fidelity(cv(P.a), cv(P.b)), P.F)
    close(fidelity(densityOf(cv(P.a)), densityOf(cv(P.b))), P.F, 1e-10)
    close(traceDistance(cv(P.a), cv(P.b)), P.D, 1e-10)
    close(traceDistance(cv(P.a), cv(P.b)), Math.sqrt(1 - P.F * P.F), 1e-10) // pure states saturate the upper FvdG bound
  })

  it('pure ket against a mixed state: F² = ⟨ψ|σ|ψ⟩ (Bergou Ch. 8 "fidelity" is F²); F(ρ, ρ) = 1; F(|0⟩, |1⟩) = 0', () => {
    const R = rng(7104)
    for (let t = 0; t < 10; t++) {
      const psi = randomState(2, R)
      const sigma = randomDensity(4, R)
      const quad = psi.reduce((s, a, i) => s + psi.reduce((ss, b, j) => ss + (a.re * (sigma[i][j].re * b.re - sigma[i][j].im * b.im) + a.im * (sigma[i][j].re * b.im + sigma[i][j].im * b.re)), 0), 0)
      close(fidelitySq(psi, sigma), quad, 1e-12)
      close(fidelitySq(densityOf(psi), sigma), quad, 1e-10)
      close(fidelity(sigma, sigma), 1, 1e-10)
    }
    close(fidelity(ket('0'), ket('1')), 0)
  })

  it('isDensity accepts Wishart matrices and rejects wrong trace, a negative eigenvalue, non-Hermitian input', () => {
    const R = rng(7105)
    for (let t = 0; t < 5; t++) expect(isDensity(randomDensity(2 ** (1 + t), R, 1 + t))).toBe(true)
    for (const bad of D.notDensity) expect(isDensity(cm(bad))).toBe(false)
    close(purityN(mixtureN([{ w: 0.5, psi: ket('00') }, { w: 0.5, psi: ket('11') }])), 0.5)
    close(purityN(kronM(densityOf(ket('+')), densityOf(ket('1')))), 1)
  })

  it('postMeasureRho = PρP / Tr(PρP) with embedded projectors', () => {
    for (const k of D.postMeasure) {
      const r = postMeasureRho(RHO[3], k.qubits, k.bits)
      close(r.p, k.p)
      expect(matGap(r.post!, cm(k.post))).toBeLessThan(1e-13)
    }
    expect(postMeasureRho(densityOf(ket('000')), [1], '1')).toEqual({ p: 0, post: null })
    // a pure state measured by postMeasureRho matches the ket route
    const psi = randomState(3, rng(7106))
    const viaRho = postMeasureRho(densityOf(psi), [0, 2], '10')
    const out = outer(psi, psi)
    close(viaRho.p, out.reduce((s, row, i) => s + (((i >> 2) & 1) === 1 && (i & 1) === 0 ? row[i].re : 0), 0))
  })
})
