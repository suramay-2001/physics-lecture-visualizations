/**
 * Quantum dynamics (Lecture 11, notes §§11.4–11.10; Susskind & Friedman Lecture 4): how a state changes while we wait.
 * ħ = 1 inside the engine, so a Hamiltonian's entries are energies in a fixed unit ε and a time t is εt/ħ (radians; the
 * stage shows it as the angle εt/ħ in degrees). The example two-level system of the lecture has E₊ = 3ε and E₋ = ε, so
 * Ē = 2ε, ħω = 2ε, a quarter Bloch turn at εt/ħ = 45° and U(T) = −I exactly at εt/ħ = π.
 *
 * Nothing here is new physics: e^{−iHt} is `operators.ts evolve` (the closed 2×2 exponential), the Bloch vector and the
 * chances are `spin.ts`. This module names the pieces the lecture uses (the tiny step I − iH dt, the N-step product that
 * tends to U, the two phase clocks of a state with two energies, P(+x; t)) so the stage, the claims and the Arcade read one
 * implementation. Each function has an independent numpy twin (pipeline/make_fixtures.py `lecture11_cases`: the eigh
 * exponential, np.linalg.matrix_power, np.angle of explicit phases) and property tests (dynamics.test.ts).
 */
import { type C, arg, c, expi } from './complex'
import { type Mat, type Vec, apply, diag2, identity, mpow, mscale, msub } from './linalg'
import { evolve } from './operators'
import { KET, SX, blochVector, expectation, prob, type Vec3 } from './spin'

/** H = diag(E₊, E₋) = ĒI + (ħω/2)Z for a two-level system, with Ē and ħω derived from the two levels (never authored). */
export interface TwoLevel {
  H: Mat
  /** Ē = (E₊ + E₋)/2 */
  mean: number
  /** ħω = E₊ − E₋ (> 0) */
  hbarOmega: number
}
export function twoLevelH(upper: number, lower: number): TwoLevel {
  if (!(Number.isFinite(upper) && Number.isFinite(lower) && upper > lower)) throw new Error('twoLevelH: need finite energies with E₊ > E₋')
  return { H: diag2(upper, lower), mean: (upper + lower) / 2, hbarOmega: upper - lower }
}

/** |ψ(t)⟩ = e^{−iHt}|ψ(0)⟩ (ħ = 1; H time-independent). */
export const evolveKet = (H: Mat, t: number, psi: Vec): Vec => apply(evolve(H, t), psi)

/** The tiny step U(dt) ≈ I − iH dt (notes §11.6). It is unitary only to first order in dt. */
export const tinyStep = (H: Mat, dt: number): Mat => msub(identity(H.length), mscale(H, c(0, dt)))

/**
 * (I − iHt/N)^N: N tiny steps chained (notes §11.6, p. 13). It tends to U(t) = e^{−iHt} as N grows, with a gap that shrinks
 * like 1/N, but for any finite N it is NOT unitary (each step stretches a state by √(1 + (E dt)²)).
 */
export function stepProduct(H: Mat, t: number, N: number): Mat {
  if (!Number.isInteger(N) || N < 1) throw new Error('stepProduct: N must be a whole number ≥ 1')
  return mpow(tinyStep(H, t / N), N)
}

/** The Schrödinger equation's right-hand side: d|ψ⟩/dt = −iH|ψ⟩ (ħ = 1), the direction the state moves at this instant. */
export const ketRate = (H: Mat, psi: Vec): Vec => apply(mscale(H, c(0, -1)), psi)

/** One component's phase clock, or the pair of them (notes §11.9). */
export interface ClockHands {
  /**
   * The phase of the |+z⟩ and |−z⟩ amplitudes, UNWRAPPED, in radians counter-clockwise from +x: arg(start_k) − E_k t. A hand
   * turning clockwise has a falling angle, so a hand that has gone round 1½ times reads −3π (it is not folded into one turn).
   */
  turned: [number, number]
  /** The same angles wrapped to (−π, π], as a reader would name the hand's position. */
  angle: [number, number]
  /** The hand lengths |a|, |b| of the start state (they never change: waiting only turns the hands). */
  length: [number, number]
  /**
   * The gap between the hands: φ = arg(b(t)/a(t)) = φ₀ + (E₊ − E₋)t, wrapped to [0, 2π); it is the state's Bloch azimuth. null when
   * a hand has no length (a start at a pole has no relative phase).
   */
  gap: number | null
}
export function clockHands(levels: { upper: number; lower: number }, start: Vec, t: number): ClockHands {
  const E: [number, number] = [levels.upper, levels.lower]
  const turned = [0, 1].map((k) => arg(start[k]) - E[k] * t) as [number, number]
  const length = [0, 1].map((k) => Math.hypot(start[k].re, start[k].im)) as [number, number]
  const wrap = (x: number) => arg(expi(x))
  const poleless = Math.min(...length) > 1e-12
  const TWO_PI = 2 * Math.PI
  return {
    turned,
    angle: [wrap(turned[0]), wrap(turned[1])],
    length,
    gap: poleless ? (((turned[1] - turned[0]) % TWO_PI) + TWO_PI) % TWO_PI : null,
  }
}

/** The motion the notes derive (and an x magnet would see): P(+x; t), ⟨S_x⟩ (units of ħ) and the Bloch vector of |ψ(t)⟩. */
export interface Precession {
  pPlusX: number
  /** ⟨S_x⟩ in units of ħ */
  sx: number
  bloch: Vec3
}
export function precession(levels: { upper: number; lower: number }, t: number, start: Vec = KET['+x']): Precession {
  const psi = evolveKet(twoLevelH(levels.upper, levels.lower).H, t, start)
  return { pPlusX: prob(KET['+x'], psi), sx: expectation(SX, psi), bloch: blochVector(psi) }
}

/** The period of the arrow's turn: ω T = 2π, i.e. εT/ħ = 2π/(E₊ − E₋) (π for the lecture's 3ε and ε). */
export const precessionPeriod = (levels: { upper: number; lower: number }): number => (2 * Math.PI) / (levels.upper - levels.lower)

/** ⟨H⟩ in the state ψ (conserved: H commutes with itself, so it does not depend on t). */
export const energyAverage = (H: Mat, psi: Vec): number => expectation(H, psi)

/** e^{−iĒt}: the overall phase a two-level system's mean energy puts on the ket (it changes no prediction). */
export const meanPhase = (mean: number, t: number): C => expi(-mean * t)
