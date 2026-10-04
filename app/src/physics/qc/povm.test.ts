/**
 * qc/povm.ts against numpy/scipy (block "povm": scipy.linalg.sqrtm — a Schur-based route independent of the
 * engine's eigh-based sqrtPSD — for the Neumark isometry, SVD trace norm for Helstrom), plus properties: the
 * Neumark dilation's projective measurement reproduces bornPovm exactly; helstrom(orthogonal) = 1,
 * helstrom(identical) = ½; usd ≤ helstrom's success probability (equal priors).
 */
import { describe, expect, it } from 'vitest'
import { type Mat, dagger, identity, inner, matmul, norm, vscale, vsub } from '../linalg'
import { rng } from '../random'
import { bornPovm, helstrom, isPOVM, neumark, usd } from './povm'
import { densityOf, randomDensity } from './density'
import { randomState } from './state'
import { FX, cm, cv, matGap } from './testkit'

const PV = FX.povm
const close = (a: number, b: number, eps = 1e-9) => expect(Math.abs(a - b), `${a} vs ${b}`).toBeLessThan(eps)

describe('isPOVM', () => {
  it('accepts every valid POVM in the fixture (projective, and the overcomplete rank-1 trine)', () => {
    for (const k of PV.povms.valid) expect(isPOVM(k.Es.map(cm)), k.name).toBe(true)
  })

  it('rejects a set that does not sum to I, and a set with a non-PSD element', () => {
    for (const k of PV.povms.invalid) expect(isPOVM(k.Es.map(cm)), k.name).toBe(false)
  })

  it('rejects an empty list, a non-square operator, and mismatched dimensions', () => {
    expect(isPOVM([])).toBe(false)
    expect(isPOVM([cm(PV.povms.valid[0].Es[0]), identity(3)])).toBe(false)
  })
})

describe('bornPovm against numpy Tr(E·ρ)', () => {
  it('matches the fixture for the projective and trine POVMs', () => {
    for (const k of PV.born) {
      const Es = k.Es.map(cm)
      const p = bornPovm(Es, cm(k.rho))
      p.forEach((x: number, i: number) => close(x, k.p[i], 1e-10))
    }
  })

  it('property: outcome probabilities are ≥ 0 and sum to 1, for a random POVM-like set (a resolution of the identity built from a Haar-random basis) on random states', () => {
    const R = rng(71301)
    for (let t = 0; t < 10; t++) {
      // a projective measurement in a random orthonormal basis is a valid (projective) POVM
      const psi0 = randomState(1, R)
      const psi1Raw = randomState(1, R)
      // Gram–Schmidt psi1Raw against psi0 to get an orthonormal pair (any fixed orthonormal basis works as a POVM)
      const proj = vsub(psi1Raw, vscale(psi0, inner(psi0, psi1Raw)))
      const psi1 = vscale(proj, 1 / norm(proj))
      const Es = [densityOf(psi0), densityOf(psi1)]
      expect(isPOVM(Es, 1e-7)).toBe(true)
      const rho = randomDensity(2, R)
      const p = bornPovm(Es, rho)
      expect(p.every((x: number) => x >= -1e-9)).toBe(true)
      close(p.reduce((a: number, b: number) => a + b, 0), 1, 1e-9)
    }
  })
})

describe('neumark: the dilation (scipy.linalg.sqrtm) matches the fixture, and its projective measurement reproduces bornPovm', () => {
  it('V and V†V = I match the fixture for the projective and trine POVMs', () => {
    for (const k of PV.neumark) {
      const Es = k.Es.map(cm)
      const { V } = neumark(Es)
      expect(matGap(V, cm(k.V))).toBeLessThan(1e-7)
      expect(matGap(matmul(dagger(V), V), cm(k.VdaggerV))).toBeLessThan(1e-9)
      const d = Es[0].length
      expect(matGap(matmul(dagger(V), V), identity(d))).toBeLessThan(1e-7)
    }
  })

  it('the dilated projective measurement on V·ρ·V† reproduces bornPovm exactly, against the fixture', () => {
    for (const k of PV.neumark) {
      const Es = k.Es.map(cm)
      const { V, projectors } = neumark(Es)
      const rho = cm(k.rho)
      const rhoDil = matmul(matmul(V, rho), dagger(V))
      const probs = projectors.map((P: Mat) => matmul(P, rhoDil).reduce((s: number, row: { re: number }[], i: number) => s + row[i].re, 0))
      probs.forEach((p: number, i: number) => close(p, k.probs[i], 1e-9))
      probs.forEach((p: number, i: number) => close(p, bornPovm(Es, rho)[i], 1e-9))
    }
  })

  it('property: for 20 random qubit density matrices and BOTH fixture POVMs, the dilation always reproduces bornPovm', () => {
    const R = rng(71302)
    for (const k of PV.povms.valid) {
      const Es = k.Es.map(cm)
      const { V, projectors } = neumark(Es)
      for (let t = 0; t < 20; t++) {
        const rho = randomDensity(2, R, 1 + (t % 2))
        const rhoDil = matmul(matmul(V, rho), dagger(V))
        const want = bornPovm(Es, rho)
        projectors.forEach((P: Mat, i: number) => {
          const p = matmul(P, rhoDil).reduce((s: number, row: { re: number }[], j: number) => s + row[j].re, 0)
          close(p, want[i], 1e-8)
        })
      }
    }
  })
})

describe('helstrom minimum-error discrimination against numpy SVD trace norm', () => {
  it('matches the fixture at three priors on the same pair of states', () => {
    for (const k of PV.helstrom) close(helstrom(cm(k.rho0), cm(k.rho1), k.p0), k.P, 1e-9)
  })

  it('= 1 for two orthogonal states at equal priors, and = ½ for identical states at equal priors', () => {
    close(helstrom(cm(PV.helstromOrth.rho0), cm(PV.helstromOrth.rho1), 0.5), 1, 1e-10)
    close(helstrom(cm(PV.helstromIdentical.rho0), cm(PV.helstromIdentical.rho1), 0.5), 0.5, 1e-10)
  })

  it('for identical states at an UNEQUAL prior, no measurement helps: success = max(p0, 1 − p0), the "just guess the prior" bound', () => {
    const R = rng(71303)
    for (let t = 0; t < 5; t++) {
      const rho = randomDensity(2, R)
      const p0 = 0.1 + 0.8 * (t / 5)
      close(helstrom(rho, rho, p0), Math.max(p0, 1 - p0), 1e-9)
    }
  })

  it('property: helstrom is symmetric under swapping the two states and their priors', () => {
    const R = rng(71304)
    for (let t = 0; t < 10; t++) {
      const rho0 = randomDensity(2, R)
      const rho1 = randomDensity(2, R)
      const p0 = 0.2 + 0.6 * (t / 10)
      close(helstrom(rho0, rho1, p0), helstrom(rho1, rho0, 1 - p0), 1e-9)
    }
  })

  it('property: helstrom success is never below max(p0, 1 − p0) (you can always just guess the more likely state and ignore the measurement)', () => {
    const R = rng(71305)
    for (let t = 0; t < 10; t++) {
      const rho0 = randomDensity(2, R)
      const rho1 = randomDensity(2, R)
      const p0 = 0.05 + 0.9 * (t / 10)
      expect(helstrom(rho0, rho1, p0)).toBeGreaterThanOrEqual(Math.max(p0, 1 - p0) - 1e-9)
    }
  })
})

describe('usd: unambiguous discrimination against 1 − |⟨ψ0|ψ1⟩|', () => {
  it('matches the fixture at five overlaps', () => {
    for (const k of PV.usd) close(usd([cv(k.psi0), cv(k.psi1)]), k.success, 1e-12)
  })

  it('is 1 for orthogonal states and 0 for identical ones (up to phase)', () => {
    const R = rng(71306)
    const psi = randomState(1, R)
    close(usd([psi, psi]), 0, 1e-10)
  })

  it('property: usd success ≤ helstrom\'s success probability at equal priors, on the fixture AND on random non-orthogonal pure-state pairs (the price of never guessing wrong)', () => {
    for (const k of PV.usd) {
      const s = usd([cv(k.psi0), cv(k.psi1)])
      expect(s).toBeLessThanOrEqual(k.helstromP + 1e-9)
      expect(s).toBeLessThanOrEqual(helstrom(densityOf(cv(k.psi0)), densityOf(cv(k.psi1)), 0.5) + 1e-9)
    }
    const R = rng(71307)
    for (let t = 0; t < 20; t++) {
      const psi0 = randomState(1, R)
      const psi1 = randomState(1, R)
      const s = usd([psi0, psi1])
      const h = helstrom(densityOf(psi0), densityOf(psi1), 0.5)
      expect(s).toBeLessThanOrEqual(h + 1e-9)
    }
  })
})
