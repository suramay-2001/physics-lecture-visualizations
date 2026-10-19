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
import { type C, arg, c, expi, mul } from './complex'
import { type Mat, type Vec, apply, diag2, identity, madd, mat, mpow, mscale, msub, norm2, vec } from './linalg'
import { evolve } from './operators'
import { KET, Rz, SX, blochVector, eigenHermitian2, expectation, prob, variance, type Vec3 } from './spin'

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

/**
 * Lecture 12 (notes §12.1, p. 5): a superposition of any number of energies, |ψ(0)⟩ = Σcₙ|Eₙ⟩, gives |ψ(t)⟩ = Σcₙe^{−iEₙt}|Eₙ⟩ (ħ = 1; H
 * constant). Each energy keeps its chance |cₙ|² forever; only the relative phases move. The chance of still finding the START state is
 * the survival |⟨ψ(0)|ψ(t)⟩|² = |Σ|cₙ|²e^{−iEₙt}|². Independent numpy twin: pipeline/make_fixtures.py `lecture12_13_cases`.
 */
export const levels = {
  /** cₙ e^{−iEₙt}: the amplitude of each energy after a wait t. */
  evolve(E: readonly number[], coef: readonly C[], t: number): C[] {
    if (E.length !== coef.length) throw new Error('levels.evolve: one amplitude per energy')
    return coef.map((z, n) => mul(z, expi(-E[n] * t)))
  },
  /** |Σ|cₙ|²e^{−iEₙt}|²: the chance of finding the start state again after a wait t. */
  survival(E: readonly number[], coef: readonly C[], t: number): number {
    if (E.length !== coef.length) throw new Error('levels.survival: one amplitude per energy')
    let re = 0
    let im = 0
    for (let n = 0; n < E.length; n++) {
      const w = coef[n].re * coef[n].re + coef[n].im * coef[n].im
      re += w * Math.cos(E[n] * t)
      im -= w * Math.sin(E[n] * t)
    }
    return re * re + im * im
  },
}

/* ------------------------------------------------------------------------------------------------------------------------------------------ */
/* Townsend pass, G4a (Lectures 11 and 12; Townsend Ch. 4). Independent numpy twins: pipeline/claims_448/g4a.py (-> __fixtures__/dynamics-g4a.json).   */
/* ------------------------------------------------------------------------------------------------------------------------------------------ */

/** The ammonia-type pair (Townsend §4.5, Eq. 4.48): H = [[E0, −A], [−A, E0]] in the basis |1⟩ = nitrogen above, |2⟩ = nitrogen below (ħ = 1). */
export const ammoniaH = (E0: number, A: number): Mat => mat([[E0, -A], [-A, E0]])
/** The period of the flip, T = πħ/A (Eq. 4.55–4.56 with ħ = 1): the nitrogen is on the other side after T/2 and back after T. */
export const ammoniaPeriod = (A: number): number => Math.PI / A
/** The chances of "above" and "below" after a time t, starting above (the engine evolves |1⟩ under the matrix). */
export function ammoniaChances(E0: number, A: number, t: number): { above: number; below: number } {
  const psi = evolveKet(ammoniaH(E0, A), t, vec(1, 0))
  return { above: prob(vec(1, 0), psi), below: prob(vec(0, 1), psi) }
}
/** The energy spread ΔE = √(⟨H²⟩ − ⟨H⟩²) of a state (Eq. 4.64 for the ammonia state |1⟩). */
export const energySpread = (H: Mat, psi: Vec): number => Math.sqrt(variance(H, psi))
/** The two levels of the ammonia pair in a static field (Eq. 4.58b), in units of A and measured from E0: the eigenvalues of [[x, −1], [−1, −x]], x = μ|E|/A. Returns [lower, upper]. */
export function twoLevelEnergies(x: number): [number, number] {
  const e = eigenHermitian2(mat([[x, -1], [-1, -x]]))
  return [e.values[1], e.values[0]]
}
/** The weak-field form of the upper level (Eq. 4.59) in the same units: 1 + x²/2. */
export const twoLevelWeak = (x: number): number => 1 + (x * x) / 2

/**
 * The neutron interferometer's port counts (Townsend §4.3, Fig. 4.4): after a relative turn φ = ω0T about z between the two arms, the chance of
 * leaving by port `sign` is |(I ± R_z(φ))|+x⟩/2|² = (1 ± cos(φ/2))/2. It repeats after φ = 4π, not 2π, because a 2π turn flips the ket's sign.
 */
export function interferometerPort(phi: number, sign: 1 | -1): number {
  const arm = apply(mscale(madd(identity(2), mscale(Rz(phi), sign)), 0.5), KET['+x'])
  return norm2(arm)
}

/** Rabi's closed form (Townsend Eq. 4.45, ħ = 1): the chance of the lower state at time t for a drive ω of strength ω1 on a splitting ω0. */
export function rabiProbability(w0: number, w1: number, w: number, t: number): number {
  const q2 = (w0 - w) ** 2 + (w1 * w1) / 4
  return (w1 * w1 / 4 / q2) * Math.sin((Math.sqrt(q2) * t) / 2) ** 2
}
/** The height of the resonance curve, (ω1²/4)/(δ² + ω1²/4), for a detuning δ = ω0 − ω (Fig. 4.6); 1 on resonance. */
export const rabiPeak = (delta: number, w1 = 1): number => (w1 * w1) / 4 / (delta * delta + (w1 * w1) / 4)
/** On resonance the lower state is certain at t = 2π/ω1 (Eq. 4.44a: sin²(ω1t/4) = 1). */
export const rabiFlipTime = (w1: number): number => (2 * Math.PI) / w1

/**
 * The same chance without the rotating-wave step: Eq. 4.38 integrated as written, i ȧ = (ω0/2)a + (ω1/2)cos(ωt) b and i ḃ = (ω1/2)cos(ωt) a − (ω0/2)b,
 * from a = 1, b = 0, by classical RK4 with `steps` equal steps (default 2000 per unit of time). Used to measure how good the rotating-wave formula is.
 */
export function rabiExactProbability(w0: number, w1: number, w: number, t: number, steps = Math.ceil(2000 * t)): number {
  const f = (tt: number, s: number[]): number[] => {
    const g = (w1 / 2) * Math.cos(w * tt)
    const xr = (w0 / 2) * s[0] + g * s[2]
    const xi = (w0 / 2) * s[1] + g * s[3]
    const yr = g * s[0] - (w0 / 2) * s[2]
    const yi = g * s[1] - (w0 / 2) * s[3]
    return [xi, -xr, yi, -yr] // d/dt of (a_r, a_i, b_r, b_i) = −i(X, Y)
  }
  const h = t / steps
  let s = [1, 0, 0, 0]
  const add = (u: number[], v: number[], k: number) => u.map((x, i) => x + k * v[i])
  for (let n = 0; n < steps; n++) {
    const t0 = n * h
    const k1 = f(t0, s)
    const k2 = f(t0 + h / 2, add(s, k1, h / 2))
    const k3 = f(t0 + h / 2, add(s, k2, h / 2))
    const k4 = f(t0 + h, add(s, k3, h))
    s = s.map((x, i) => x + (h / 6) * (k1[i] + 2 * k2[i] + 2 * k3[i] + k4[i]))
  }
  return s[2] * s[2] + s[3] * s[3]
}
