/**
 * Density operators for spin ½: ρ = (I + r⃗·σ⃗)/2, pure states on the Bloch sphere (|r| = 1), mixtures
 * inside the ball (W-L1 §3.3; landed at W0 because the bloch-ball resolver needs it; numpy fixtures in W1).
 * Units: ħ = 1; r⃗ is the Bloch vector (⟨σx⟩, ⟨σy⟩, ⟨σz⟩).
 */
import { c } from './complex'
import { type Mat, type Vec, identity, madd, matmul, mscale, outer } from './linalg'
import { type Sign } from './sg'
import { SIGMA_X, SIGMA_Y, SIGMA_Z, type Vec3, dot, nDotSigma, spreadsFromBloch, unit } from './spin'

/** ρ = (I + r⃗·σ⃗)/2 */
export function rhoFromBloch(r: Vec3): Mat {
  return mscale(madd(identity(2), nDotSigma(r)), 0.5)
}

const tr = (M: Mat): number => M[0][0].re + M[1][1].re

/** r_k = tr(ρ σ_k) */
export function blochFromRho(rho: Mat): Vec3 {
  return [tr(matmul(rho, SIGMA_X)), tr(matmul(rho, SIGMA_Y)), tr(matmul(rho, SIGMA_Z))]
}

/** Σ w |ψ⟩⟨ψ| (kets normalized by the caller; weights are not renormalized). */
export function rhoFromMixture(parts: readonly { w: number; psi: Vec }[]): Mat {
  return parts.reduce<Mat>((acc, p) => madd(acc, mscale(outer(p.psi, p.psi), p.w)), mscale(identity(2), c(0)))
}

/** Σ w r⃗ (the Bloch vector of a mixture is the weighted average). */
export function blochOfMixture(parts: readonly { w: number; r: Vec3 }[]): Vec3 {
  return parts.reduce<Vec3>((a, p) => [a[0] + p.w * p.r[0], a[1] + p.w * p.r[1], a[2] + p.w * p.r[2]], [0, 0, 0])
}

/** Tr ρ² = (1 + |r|²)/2 (was the gate's `purity(rmag)`). */
export const purityOfNorm = (rmag: number): number => (1 + rmag * rmag) / 2

/** Tr ρ² computed from the matrix. */
export function purity(rho: Mat): number {
  return tr(matmul(rho, rho))
}

/** P(+ along n̂) = (1 + n̂·r⃗)/2; valid inside the ball too. */
export const pPlus = (r: Vec3, n: Vec3): number => (1 + dot(unit(n), r)) / 2

/** The best any single measurement can do on this state: (1 + |r|)/2 ("can a mixture ever be certain?"). */
export function maxPPlus(r: Vec3): number {
  return (1 + Math.hypot(r[0], r[1], r[2])) / 2
}

/** Record the outcome but keep both beams: r⃗ → (r⃗·n̂) n̂ (dephasing onto the axis). */
export function measureNonSelective(r: Vec3, n: Vec3): Vec3 {
  const u = unit(n)
  const k = dot(r, u)
  return [k * u[0], k * u[1], k * u[2]]
}

/** Keep one beam: probability p = (1 ± n̂·r⃗)/2, and the kept atoms are in r⃗' = ±n̂. */
export function measureSelective(r: Vec3, n: Vec3, s: Sign): { p: number; r: Vec3 } {
  const u = unit(n)
  const sign = s === '+' ? 1 : -1
  return { p: (1 + sign * dot(u, r)) / 2, r: [sign * u[0], sign * u[1], sign * u[2]] }
}

/** Weights of the ±n̂ recipe that realizes |r|: w± = (1 ± |r|)/2. */
export const recipeWeights = (rmag: number): [number, number] => [(1 + rmag) / 2, (1 - rmag) / 2]

/** |r| ≤ 1 + eps */
export function isPhysicalBloch(r: Vec3, eps = 1e-9): boolean {
  return Math.hypot(r[0], r[1], r[2]) <= 1 + eps
}

/**
 * The spin uncertainty relation read off a Bloch vector, for PURE and MIXED states alike (the /lab Bloch ball; D-lab
 * §2.3): ⟨S_j⟩ = r_j/2 and ⟨S_j²⟩ = ¼ for every state, so ΔS_j = ½√(1 − r_j²) and the bound ½|⟨[S_x, S_y]⟩| =
 * ½|⟨S_z⟩| = |r_z|/4. `uncertaintyCheck` (spin.ts) takes kets only. ħ = 1.
 */
export function uncertaintyFromBloch(r: Vec3, eps = 1e-9): { spreads: Vec3; product: number; bound: number; slack: number; saturated: boolean } {
  const spreads = spreadsFromBloch(r)
  const product = spreads[0] * spreads[1]
  const bound = Math.abs(r[2]) / 4
  const slack = product - bound
  return { spreads, product, bound, slack, saturated: Math.abs(slack) < eps }
}

/**
 * The three Pauli variances of a state with Bloch vector r (Lecture 8 §8.1): every Pauli reading is ±1, so σ_i² = I and
 * ⟨σ_i²⟩ = 1, hence (Δσ_i)² = 1 − r_i². Valid inside the ball too. Throws when |r| > 1 (not a state).
 */
export function pauliVariances(r: Vec3): Vec3 {
  if (!isPhysicalBloch(r)) throw new Error('pauliVariances: |r| > 1 is not a state')
  return [1 - r[0] * r[0], 1 - r[1] * r[1], 1 - r[2] * r[2]]
}
/** The variance budget: Σ(Δσ_i)² = 3 − |r|², which is 2 for every pure state and 3 at the centre of the ball. */
export function varianceTotal(r: Vec3): number {
  if (!isPhysicalBloch(r)) throw new Error('varianceTotal: |r| > 1 is not a state')
  return 3 - (r[0] * r[0] + r[1] * r[1] + r[2] * r[2])
}
/** The same variances from the matrices, for a pure or mixed ρ: Tr ρσ_i² − (Tr ρσ_i)² (independent of the 1 − r_i² shortcut). */
export function pauliVariancesOfRho(rho: Mat): Vec3 {
  const one = (S: Mat): number => {
    const m = tr(matmul(rho, S))
    return tr(matmul(rho, matmul(S, S))) - m * m
  }
  return [one(SIGMA_X), one(SIGMA_Y), one(SIGMA_Z)]
}
