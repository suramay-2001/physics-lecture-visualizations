/**
 * qc/density.ts against numpy/scipy (block "density": np.einsum partial traces to 5 qubits, reshape/transpose
 * partial transposes, eigvalsh trace distances, the sqrtm route for root fidelity, embedded projectors for selective
 * measurement), plus properties: Tr_A Tr_B = Tr and partial traces compose in any order; no signalling (a local
 * unitary on B leaves ρ_A unchanged); purify then trace = ρ; Schmidt reconstructs ψ; Fuchs–van de Graaf holds.
 */
import { describe, expect, it } from 'vitest'
import { c } from '../complex'
import { type Mat, column, fromColumns, identity, isUnitary, matmul, norm, norm2, outer, vscale } from '../linalg'
import { rng } from '../random'
import { eigh, kronM, randomHermitian, randomUnitary, traceN } from './cmat'
import {
  type Ensemble,
  densityOf,
  eigenEnsemble,
  ensembleUnitary,
  entanglementEntropy,
  evolveRho,
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
  spectrum,
  thermalPolarization,
  traceDistance,
  vonNeumann,
} from './density'
import { applyGate } from './gates'
import { bell, embed, ghz, kron, ket, randomState } from './state'
import { FX, cm, cv, matGap, overlap, vecGap } from './testkit'

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

describe('vonNeumann, entanglementEntropy, spectrum (Q8, Q9)', () => {
  it('vonNeumann = numpy eigvalsh entropy, on rho3, rho4, a pure state and two maximally mixed states', () => {
    for (const k of D.vonNeumann) close(vonNeumann(cm(k.rho)), k.S, 1e-10)
  })

  it('vonNeumann is 0 for every pure state (50 seeded) and log₂ d for the maximally mixed state of d = 2, 4, 8, 16', () => {
    const R = rng(7115)
    for (let t = 0; t < 50; t++) close(vonNeumann(densityOf(randomState(1 + (t % 4), R))), 0, 1e-9)
    for (const d of [2, 4, 8, 16]) close(vonNeumann(identity(d).map((row) => row.map((x) => c(x.re / d, x.im)))), Math.log2(d), 1e-9)
  })

  it('spectrum = eigvalsh descending and clamped ≥ 0; sums to 1 (Tr ρ)', () => {
    for (const k of D.spectrum) {
      const s = spectrum(cm(k.rho))
      s.forEach((x, i) => close(x, k.spectrum[i], 1e-10))
      for (let i = 1; i < s.length; i++) expect(s[i]).toBeLessThanOrEqual(s[i - 1] + 1e-12)
      expect(s.every((x) => x >= 0)).toBe(true)
      close(s.reduce((a, b) => a + b, 0), 1, 1e-9)
    }
  })

  it('entanglementEntropy = squared singular values of the coefficient matrix (numpy SVD route), on random cuts', () => {
    for (const k of D.entanglementEntropy) close(entanglementEntropy(cv(k.psi), k.A), k.S, 1e-10)
  })

  it('entanglementEntropy is 1 bit for EVERY Bell state and 0 for a product state (F6 D3)', () => {
    for (const b of ['00+11', '00-11', '01+10', '01-10']) close(entanglementEntropy(bell(b), [0]), 1, 1e-10)
    close(entanglementEntropy(ket('0+'), [0]), 0, 1e-10)
    close(entanglementEntropy(ket('+1'), [1]), 0, 1e-10)
    close(entanglementEntropy(ghz(3), [0]), 1, 1e-10) // GHZ: tracing one qubit leaves ½(|00⟩⟨00| + |11⟩⟨11|)
    expect(() => entanglementEntropy(ket('00'), [])).toThrow()
    expect(() => entanglementEntropy(ket('00'), [0, 1])).toThrow()
  })
})

describe('evolveRho and thermalPolarization (Q8, Q9)', () => {
  it('evolveRho = scipy.linalg.expm Uρ(0)U†, U = e^{−iHt}', () => {
    const k = D.evolveRho
    expect(matGap(evolveRho(cm(k.H), cm(k.rho), k.t), cm(k.result))).toBeLessThan(1e-9)
  })

  it('evolveRho at t = 0 is the identity map for any H and ρ; a ρ commuting with H is left fixed at any t', () => {
    const R = rng(7116)
    for (let t = 0; t < 10; t++) {
      const H = randomHermitian(4, R)
      const rho = randomDensity(4, R)
      expect(matGap(evolveRho(H, rho, 0), rho)).toBeLessThan(1e-9)
    }
    const ZI = kronM([[c(1), c(0)], [c(0), c(-1)]], identity(2)) // Z ⊗ I
    const rho00 = densityOf(ket('00')) // |00⟩ is an eigenstate of Z⊗I, so it commutes
    expect(matGap(evolveRho(ZI, rho00, 1.7), rho00)).toBeLessThan(1e-9)
  })

  it('thermalPolarization(x) = tanh(x/2) against numpy; 0 at x = 0, odd, saturates to ±1', () => {
    for (const k of D.thermalPolarization) close(thermalPolarization(k.x), k.r, 1e-12)
    close(thermalPolarization(0), 0)
    close(thermalPolarization(-3), -thermalPolarization(3))
    expect(thermalPolarization(50)).toBeGreaterThan(0.999)
    expect(thermalPolarization(-50)).toBeLessThan(-0.999)
  })
})

describe('eigenEnsemble and ensembleUnitary — the unitary-freedom theorem (Bergou (2.19)–(2.20); Q8 "recipes")', () => {
  it('eigenEnsemble = eigh kept and sorted descending, against numpy; Σ p_k |k⟩⟨k| = ρ', () => {
    const k = D.eigenEnsemble
    const e = eigenEnsemble(cm(k.rho))
    expect(e.p.length).toBe(k.p.length)
    e.p.forEach((p, i) => close(p, k.p[i], 1e-10))
    // compared as RAYS (|⟨numpy|ts⟩| = 1): numpy's eigh and the engine's eigh can pick different global phases
    // for the same eigenvector (eigh.ts's own numpy cross-check already covers phase-free agreement separately)
    e.kets.forEach((v, i) => close(overlap(v, cv(k.kets[i])), 1, 1e-9))
    const rebuilt = e.p.reduce((acc, p, i) => {
      const o = outer(vscale(e.kets[i], Math.sqrt(p)), vscale(e.kets[i], Math.sqrt(p)))
      return acc.map((row, a) => row.map((x, b) => c(x.re + o[a][b].re, x.im + o[a][b].im)))
    }, cm(k.rho).map((row) => row.map(() => c(0))))
    expect(matGap(rebuilt, cm(k.rho))).toBeLessThan(1e-9)
  })

  it('a pure state has exactly one recipe: eigenEnsemble = {1, ψ} up to a global phase', () => {
    const psi = randomState(2, rng(7118))
    const e = eigenEnsemble(densityOf(psi))
    expect(e.p.length).toBe(1)
    close(e.p[0], 1, 1e-10)
    close(overlap(e.kets[0], psi), 1, 1e-9)
  })

  it('ensembleUnitary = a least-squares U (numpy lstsq) from the √p-weighted ket matrices; U is unitary and A·U = B', () => {
    const k = D.ensembleUnitary
    const e1: Ensemble = { p: k.p1, kets: k.kets1.map(cv) }
    const e2: Ensemble = { p: k.p2, kets: k.kets2.map(cv) }
    const U = ensembleUnitary(e1, e2)
    expect(matGap(U, cm(k.U))).toBeLessThan(1e-8)
    expect(isUnitary(U, 1e-8)).toBe(true)
  })

  it('round-trip: mixing an eigen-ensemble by a Haar-random unitary W gives a SECOND valid ensemble for the same ρ; ensembleUnitary recovers it (A·U = B, U unitary)', () => {
    const R = rng(7119)
    for (let t = 0; t < 8; t++) {
      const rho = randomDensity(4, R, 4) // full rank: e1 has exactly 4 terms, no padding needed
      const e1 = eigenEnsemble(rho)
      const A = fromColumns(e1.kets.map((ket_, i) => vscale(ket_, Math.sqrt(e1.p[i]))))
      const W = randomUnitary(4, R)
      const B = matmul(A, W) // B B† = A W W† A† = A A† = rho: a second valid ensemble for the SAME rho
      const e2: Ensemble = {
        p: Array.from({ length: 4 }, (_, j) => norm2(column(B, j))),
        kets: Array.from({ length: 4 }, (_, j) => vscale(column(B, j), 1 / norm(column(B, j)))),
      }
      const U = ensembleUnitary(e1, e2)
      expect(isUnitary(U, 1e-7)).toBe(true)
      expect(matGap(matmul(A, U), B)).toBeLessThan(1e-7)
    }
  })

  it('zero-padding: a 2-term ensemble (rank-2 ρ) against a 3-term ensemble of the SAME ρ (one isometry embedding)', () => {
    const R = rng(7120)
    const rho = randomDensity(4, R, 2) // rank 2
    const e1 = eigenEnsemble(rho) // exactly 2 terms
    const zero = e1.kets[0].map(() => c(0))
    const Apad = fromColumns([...e1.kets.map((ket_, i) => vscale(ket_, Math.sqrt(e1.p[i]))), zero]) // d×3, 3rd column 0
    const W3 = randomUnitary(3, R)
    const B = matmul(Apad, W3) // d×3; B B† = Apad Apad† = rho still (the padding column contributes nothing)
    const e2: Ensemble = {
      p: Array.from({ length: 3 }, (_, j) => norm2(column(B, j))),
      kets: Array.from({ length: 3 }, (_, j) => {
        const nn = norm(column(B, j))
        return nn > 1e-12 ? vscale(column(B, j), 1 / nn) : column(B, j)
      }),
    }
    const U = ensembleUnitary(e1, e2) // e1 (2 terms) is implicitly zero-padded to match e2's 3
    expect(U.length).toBe(3)
    expect(isUnitary(U, 1e-6)).toBe(true)
    expect(matGap(matmul(Apad, U), B)).toBeLessThan(1e-6)
  })

  describe('the padding fix (k > d, more ensemble members than the Hilbert dimension): svd(A)\'s V is only n×d there, not n×n, and must be completed on A\'s right null space before U = Va·D', () => {
    const S2 = Math.SQRT1_2
    const zPoles: Ensemble = { p: [0.5, 0.5], kets: [ket('0'), ket('1')] }
    const zx: Ensemble = { p: [0.5, 0.5], kets: [[c(S2), c(S2)], [c(S2), c(-S2)]] }
    // the trine: three equatorial states 120° apart (weight ⅓ each) — the Q8 "recipe" example (qc709-Q8Q9.md ruling 1)
    const trine: Ensemble = {
      p: [1 / 3, 1 / 3, 1 / 3],
      kets: [0, 120, 240].map((deg) => {
        const phi = (deg * Math.PI) / 180
        return [c(S2), c(S2 * Math.cos(phi), S2 * Math.sin(phi))]
      }),
    }

    it('k = d = 2 (no free rows at all, so U is FULLY forced): the poles vs. the "+/−" ensemble gives exactly the Hadamard', () => {
      const U = ensembleUnitary(zPoles, zx)
      expect(U.length).toBe(2)
      expect(isUnitary(U, 1e-10)).toBe(true)
      const H = cm([[[S2, 0], [S2, 0]], [[S2, 0], [-S2, 0]]])
      expect(matGap(U, H)).toBeLessThan(1e-9)
    })

    it('the numpy twin (make_qc_fixtures.py, an INDEPENDENT full-SVD-completion route): its own U is unitary and solves A·U = B too (the free row makes U itself implementation-dependent, so this checks the fixture, not bit-equality with the engine)', () => {
      const k = D.ensembleUnitaryPad
      const e1: Ensemble = { p: k.p1, kets: k.kets1.map(cv) }
      const e2: Ensemble = { p: k.p2, kets: k.kets2.map(cv) }
      const Unp = cm(k.U)
      expect(Unp.length).toBe(3)
      expect(isUnitary(Unp, 1e-8)).toBe(true)
      const A = fromColumns(e1.kets.map((ket_, i) => vscale(ket_, Math.sqrt(e1.p[i]))))
      const B = fromColumns(e2.kets.map((ket_, i) => vscale(ket_, Math.sqrt(e2.p[i]))))
      expect(matGap(matmul(A, Unp), B)).toBeLessThan(1e-8)
      // the engine's OWN U (from the same two ensembles) is independently unitary and solves A·U = B as well
      const Ueng = ensembleUnitary(e1, e2)
      expect(isUnitary(Ueng, 1e-8)).toBe(true)
      expect(matGap(matmul(A, Ueng), B)).toBeLessThan(1e-8)
    })

    it('k = 3 > d = 2 (the bug case): the trine and the z poles give the SAME ρ (= I/2); U must be a genuine 3×3 unitary with A·U = B — before the fix, U solved A·U = B numerically but was not unitary', () => {
      const rhoTrine = mixtureN(trine.p.map((w, i) => ({ w, psi: trine.kets[i] })))
      const rhoPoles = mixtureN(zPoles.p.map((w, i) => ({ w, psi: zPoles.kets[i] })))
      expect(matGap(rhoTrine, rhoPoles)).toBeLessThan(1e-12) // the theorem's premise: one ρ, two recipes
      const U = ensembleUnitary(trine, zPoles)
      expect(U.length).toBe(3)
      expect(isUnitary(U, 1e-8)).toBe(true)
      const A = fromColumns(trine.kets.map((k, i) => vscale(k, Math.sqrt(trine.p[i]))))
      const B = fromColumns([...zPoles.kets.map((k, i) => vscale(k, Math.sqrt(zPoles.p[i]))), zPoles.kets[0].map(() => c(0))])
      expect(matGap(matmul(A, U), B)).toBeLessThan(1e-8)
    })

    it('property: random d (2–4), random ensemble sizes that sometimes EXCEED d (padding) — U is always unitary and A·U = B', () => {
      const R = rng(7122)
      for (let t = 0; t < 24; t++) {
        const d = 2 + (t % 3)
        const rank = 1 + (t % d)
        const rho = randomDensity(d, R, rank)
        const e1 = eigenEnsemble(rho) // exactly `rank` terms
        const n2 = rank + (t % 4) // n2 - rank extra (zero-weight, then Haar-mixed) terms; often > d
        const Apad = fromColumns([
          ...e1.kets.map((ket_, i) => vscale(ket_, Math.sqrt(e1.p[i]))),
          ...Array.from({ length: n2 - rank }, () => e1.kets[0].map(() => c(0))),
        ])
        const W = randomUnitary(n2, R)
        const B = matmul(Apad, W) // B B† = Apad Apad† = rho, for ANY n2 ≥ rank (the padding columns contribute 0)
        const e2: Ensemble = {
          p: Array.from({ length: n2 }, (_, j) => norm2(column(B, j))),
          kets: Array.from({ length: n2 }, (_, j) => {
            const nn = norm(column(B, j))
            return nn > 1e-12 ? vscale(column(B, j), 1 / nn) : column(B, j)
          }),
        }
        const U = ensembleUnitary(e1, e2)
        const tag = `t=${t} d=${d} rank=${rank} n2=${n2}`
        expect(U.length, tag).toBe(n2)
        expect(isUnitary(U, 1e-6), tag).toBe(true)
        expect(matGap(matmul(Apad, U), B), tag).toBeLessThan(1e-6)
      }
    })
  })
})
