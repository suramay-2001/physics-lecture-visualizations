/**
 * Density operators for spin ½: ρ = (I + r⃗·σ⃗)/2, pure states on the Bloch sphere (|r| = 1), mixtures
 * inside the ball (W-L1 §3.3; landed at W0 because the bloch-ball resolver needs it; numpy fixtures in W1).
 * Units: ħ = 1; r⃗ is the Bloch vector (⟨σx⟩, ⟨σy⟩, ⟨σz⟩).
 */
import { c } from './complex'
import { type Mat, type Vec, identity, madd, matmul, mscale, outer } from './linalg'
import { type Sign } from './sg'
import { SIGMA_X, SIGMA_Y, SIGMA_Z, type Vec3, dot, nDotSigma, unit } from './spin'

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
