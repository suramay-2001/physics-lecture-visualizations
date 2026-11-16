/**
 * Lecture 19 engine (448): the stationary state of a particle meeting a rectangular barrier from the left, E below the top (the stage source `wavefunction.source.barrierWave`). ħ = m = 1.
 * V = V₀ on 0 < x < a and 0 elsewhere; the state has incident amplitude 1:
 *   x < 0: e^{ikx} + r e^{−ikx} · 0 < x < a: A e^{κx} + B e^{−κx} · x > a: τ e^{ikx}, k = √(2E), κ = √(2(V₀ − E)).
 * The four matching conditions (ψ and ψ′ continuous at x = 0 and x = a) solve in closed form: with D = cosh κa + iε sinh κa, ε = (κ² − k²)/2kκ, one has τ = e^{−ika}/D,
 * A = τe^{ika}(1 + ik/κ)e^{−κa}/2, B = τe^{ika}(1 − ik/κ)e^{κa}/2, r = A + B − 1, and |r|² + |τ|² = 1. A lecture-only module (imported by the lazy wavefunction chunk and by
 * content/L19.values.ts), nothing in the entry closure. Numpy twin: pipeline/make_fixtures.py `lecture19_20_cases` (np.linalg.solve of the 4 x 4 system); tests: physics/wave19.test.ts.
 */
import { type C, abs2, c, mul } from './complex'
import { HBAR } from './constants'
import { barrierT } from './scatter'
import { HBAR2_OVER_2M_EV_A2, integrate, momentumAverage } from './wave18'

export interface BarrierAmplitudes {
  /** √(2E) and √(2(V₀ − E)) */
  k: number
  kappa: number
  /** reflected amplitude (x < 0, e^{−ikx}) */
  r: C
  /** the coefficient of e^{κx} and of e^{−κx} inside */
  A: C
  B: C
  /** transmitted amplitude (x > a, e^{ikx}, no phase removed) */
  tau: C
  /** |r|² and |τ|² */
  R: number
  T: number
}

/** The amplitudes of the stationary state for 0 < E < V₀ and a > 0 (a throw outside them). */
export function transmissionAmplitude(E: number, V0: number, a: number): BarrierAmplitudes {
  if (!(E > 0 && V0 > E && a > 0)) throw new Error(`transmissionAmplitude: needs 0 < E < V0 and a > 0 (got E = ${E}, V0 = ${V0}, a = ${a})`)
  const k = Math.sqrt(2 * E)
  const kappa = Math.sqrt(2 * (V0 - E))
  const eps = (kappa * kappa - k * k) / (2 * k * kappa)
  const ch = Math.cosh(kappa * a)
  const sh = Math.sinh(kappa * a)
  // 1/D, D = cosh + iε sinh
  const den = ch * ch + eps * eps * sh * sh
  const F = c(ch / den, (-eps * sh) / den) // τ e^{ika}
  const eIn = Math.exp(-kappa * a)
  const eOut = Math.exp(kappa * a)
  const A = mul(F, c(0.5 * eIn, (0.5 * eIn * k) / kappa))
  const B = mul(F, c(0.5 * eOut, (-0.5 * eOut * k) / kappa))
  const r = c(A.re + B.re - 1, A.im + B.im)
  const tau = mul(F, c(Math.cos(k * a), -Math.sin(k * a)))
  return { k, kappa, r, A, B, tau, R: abs2(r), T: abs2(tau) }
}

/** ψ at each x of `xs` (re and im). Continuous with a continuous slope at x = 0 and x = a. */
export function barrierStateSamples(xs: ArrayLike<number>, E: number, V0: number, a: number): { re: Float64Array; im: Float64Array } {
  const { k, kappa, r, A, B, tau } = transmissionAmplitude(E, V0, a)
  const re = new Float64Array(xs.length)
  const im = new Float64Array(xs.length)
  for (let j = 0; j < xs.length; j++) {
    const x = xs[j]
    if (x < 0) {
      const co = Math.cos(k * x)
      const si = Math.sin(k * x)
      // e^{ikx} + r e^{−ikx}
      re[j] = co + r.re * co + r.im * si
      im[j] = si + r.im * co - r.re * si
    } else if (x <= a) {
      const p = Math.exp(kappa * x)
      const m = Math.exp(-kappa * x)
      re[j] = A.re * p + B.re * m
      im[j] = A.im * p + B.im * m
    } else {
      const co = Math.cos(k * x)
      const si = Math.sin(k * x)
      re[j] = tau.re * co - tau.im * si
      im[j] = tau.re * si + tau.im * co
    }
  }
  return { re, im }
}

/* ---------------------------------------------------- Lecture 19's own functions (the lecture's numbers; the stage does not use them) ---------------------------------------------------- */

/** The extreme densities of the incident-plus-reflected wave left of the barrier, (1 ± |r|)², per unit incident density. */
export function barrierFringes(E: number, V0: number, a: number): { max: number; min: number } {
  const m = Math.sqrt(transmissionAmplitude(E, V0, a).R)
  return { max: (1 + m) ** 2, min: (1 - m) ** 2 }
}

/** The current of the stationary state on the left, k(1 − |r|²) per unit incident density; by conservation it equals the one inside and beyond, k|τ|². */
export function barrierLeftCurrent(E: number, V0: number, a: number): number {
  const t = transmissionAmplitude(E, V0, a)
  return t.k * (1 - t.R)
}

/** The largest residual of the four matching conditions for the engine's amplitudes (ψ and ψ′ at x = 0 and x = a); about 1e-16. */
export function matchResidual(E: number, V0: number, a: number): number {
  const { k, kappa, r, A, B, tau } = transmissionAmplitude(E, V0, a)
  const ea = Math.exp(kappa * a)
  const ei = Math.exp(-kappa * a)
  const tE = mul(tau, c(Math.cos(k * a), Math.sin(k * a)))
  const f1 = c(1 + r.re - A.re - B.re, r.im - A.im - B.im)
  // ik(1 − r) − κ(A − B)
  const f2 = c(k * r.im - kappa * (A.re - B.re), k * (1 - r.re) - kappa * (A.im - B.im))
  const f3 = c(A.re * ea + B.re * ei - tE.re, A.im * ea + B.im * ei - tE.im)
  // κ(Ae^{κa} − Be^{−κa}) − ikτe^{ika}
  const ik = mul(c(0, k), tE)
  const f4 = c(kappa * (A.re * ea - B.re * ei) - ik.re, kappa * (A.im * ea - B.im * ei) - ik.im)
  return Math.sqrt(Math.max(abs2(f1), abs2(f2), abs2(f3), abs2(f4)))
}

/** The transmission of a delta barrier of strength g = 2mV₀a/ħ² (V₀ → ∞, a → 0, V₀a fixed) for wave number k: T = 1/(1 + g²/4k²) (Townsend Problem 6.21). */
export function deltaBarrierT(g: number, k: number): number {
  if (!(k > 0)) throw new Error('deltaBarrierT: k must be positive')
  return 1 / (1 + (g * g) / (4 * k * k))
}

/** The exact barrier of the same strength g and a given width, ħ = m = 1: V₀ = g/2a and E = k²/2; it tends to `deltaBarrierT` as a → 0. */
export function deltaLimitT(g: number, k: number, a: number): number {
  return barrierT((k * k) / 2, g / (2 * a), a)
}

/** The proton's mass in kilograms (CODATA 2018), for the mass comparison. */
export const M_PROTON = 1.67262192369e-27

/** κ in Å⁻¹ for a particle `massRatio` times the electron's mass and a barrier `drop` eV above its energy. */
export function kappaPerAngstrom(drop: number, massRatio = 1): number {
  return Math.sqrt((drop * massRatio) / HBAR2_OVER_2M_EV_A2)
}

/** The exact T for a particle `massRatio` times the electron's mass: E and V₀ in eV, the width in Å (ħ = 1 and m = massRatio/(2·ħ²/2mₑ) in these units). */
export function barrierTEv(E: number, V0: number, widthA: number, massRatio = 1): number {
  return barrierT(E, V0, widthA, massRatio / (2 * HBAR2_OVER_2M_EV_A2), 1)
}

/** κa for a macroscopic body in CGS: √(2m·drop)·a/ħ, m in grams, drop in erg, a in cm (ħ = 1.0546e−27 erg s). Townsend p. 231: 1 g, 1 erg, 1 cm. */
export function macroKappaA(massG: number, dropErg: number, widthCm: number): number {
  return (Math.sqrt(2 * massG * dropErg) * widthCm) / (HBAR * 1e7)
}

/* ---- alpha decay as a stated MODEL: a point alpha of rest energy 3727.379 MeV, a daughter of charge Z with radius R, the Coulomb barrier 2Ze²/r from R out to its turning point ---- */
export const HBAR_C_MEV_FM = 197.3269804
export const COULOMB_MEV_FM = 1.439964548
export const ALPHA_MC2_MEV = 3727.379378
/** The turning point b = 2Ze²/E of the Coulomb barrier (E in MeV, in fm). */
export function coulombTurningPoint(E: number, Z: number): number {
  return (2 * Z * COULOMB_MEV_FM) / E
}
/** The exponent 2∫√(2m(V − E))dr/ħ from R to the turning point, in closed form: (2/ħc)√(2mc²E)·b·(arccos√x − √(x(1 − x))), x = R/b. T is about e^{−exponent}. */
export function gamowExponent(E: number, Z: number, R: number): number {
  const b = coulombTurningPoint(E, Z)
  if (!(R < b)) throw new Error('gamowExponent: the energy is above the top of the barrier')
  const x = R / b
  return ((2 * Math.sqrt(2 * ALPHA_MC2_MEV * E)) / HBAR_C_MEV_FM) * b * (Math.acos(Math.sqrt(x)) - Math.sqrt(x * (1 - x)))
}
/** The same exponent by the endpoint-safe quadrature `integrate` over the barrier (an independent route for the closed form). */
export function gamowExponentQuad(E: number, Z: number, R: number): number {
  const b = coulombTurningPoint(E, Z)
  return ((2 * Math.sqrt(2 * ALPHA_MC2_MEV)) / HBAR_C_MEV_FM) * integrate((r) => Math.sqrt(Math.max(0, (2 * Z * COULOMB_MEV_FM) / r - E)), R, b)
}

/** The energy the stationary state has in each region, from the equation itself: −ψ″/2 + Vψ = Eψ gives E = k²/2 where V = 0 (ψ″ = −k²ψ) and E = V₀ − κ²/2 inside (ψ″ = κ²ψ). */
export function regionEnergies(E: number, V0: number, a: number): { outside: number; inside: number } {
  const { k, kappa } = transmissionAmplitude(E, V0, a)
  return { outside: (k * k) / 2, inside: V0 - (kappa * kappa) / 2 }
}

/* ---- the barrier as a filter on a packet's momenta (ħ = m = 1) ---- */
/** The chance that the barrier lets a packet (σ, p₀) through: its momentum density weighted by T(p). The turned-back chance is 1 minus this. */
export function transmittedShare(p0: number, sigma: number, V0: number, a: number): number {
  return momentumAverage(p0, sigma, (p) => barrierT((p * p) / 2, V0, a))
}

/** The mean kinetic energy p²/2 of the part of a packet (σ, p₀) that the barrier lets through (`part` 'T') or turns back ('R'): its momentum density weighted by T(p) or 1 − T(p). */
export function filteredKineticMean(p0: number, sigma: number, V0: number, a: number, part: 'T' | 'R'): number {
  const w = (p: number): number => (part === 'T' ? barrierT((p * p) / 2, V0, a) : 1 - barrierT((p * p) / 2, V0, a))
  return momentumAverage(p0, sigma, (p) => (w(p) * p * p) / 2) / momentumAverage(p0, sigma, w)
}
