/**
 * Lecture 19 engine (448): the stationary state of a particle meeting a rectangular barrier from the left, E below the top (the stage source `wavefunction.source.barrierWave`). ħ = m = 1.
 * V = V₀ on 0 < x < a and 0 elsewhere; the state has incident amplitude 1:
 *   x < 0: e^{ikx} + r e^{−ikx} · 0 < x < a: A e^{κx} + B e^{−κx} · x > a: τ e^{ikx}, k = √(2E), κ = √(2(V₀ − E)).
 * The four matching conditions (ψ and ψ′ continuous at x = 0 and x = a) solve in closed form: with D = cosh κa + iε sinh κa, ε = (κ² − k²)/2kκ, one has τ = e^{−ika}/D,
 * A = τe^{ika}(1 + ik/κ)e^{−κa}/2, B = τe^{ika}(1 − ik/κ)e^{κa}/2, r = A + B − 1, and |r|² + |τ|² = 1. A lecture-only module (imported by the lazy wavefunction chunk and by
 * content/L19.values.ts), nothing in the entry closure. Numpy twin: pipeline/make_fixtures.py `lecture19_20_cases` (np.linalg.solve of the 4 x 4 system); tests: physics/wave19.test.ts.
 */
import { type C, abs2, c, mul } from './complex'

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
