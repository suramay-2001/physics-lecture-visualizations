/**
 * Complex-number helpers for F1 "Numbers that turn" (P-709-map §(b) "other: complex"). complex.ts already has
 * expi, polar, arg, csqrt and cpow; these show e^{iφ} as a limit of small turns (and as its series), the roots of
 * unity, and interference as a sum of arrows. The `complex-plane` stage kind draws every one of them
 * (stage/svg/complexPlane.ts).
 */
import { type C, ONE, add, c, cpow, expi, mul, scale } from '../complex'

/**
 * G1: Σ_{k<K} zᵏ/k!, the first K terms of the exponential series (K = 0 gives 0). The partial sums tend to e^z; at
 * z = iπ, 10 terms give −0.9760 + 0.0069i and 20 give −1.0000. Each term is the last one times z/(k + 1), so no
 * factorial is ever formed. (The series proof of Euler's formula is homework in 448: F1 shows values, never the proof.)
 */
export function cexpSeries(z: C, K: number): C {
  if (!Number.isInteger(K) || K < 0) throw new Error('cexpSeries: K must be a whole number ≥ 0')
  let term = ONE
  let sum = c(0)
  for (let k = 0; k < K; k++) {
    sum = add(sum, term)
    term = scale(mul(term, z), 1 / (k + 1))
  }
  return sum
}

/** G2: the N-th roots of unity e^{2πik/N}, k = 0 … N − 1 (N ≥ 1). For N ≥ 2 they sum to 0 (F1 clue, F8, the QFT). */
export function rootsOfUnity(N: number): C[] {
  if (!Number.isInteger(N) || N < 1) throw new Error('rootsOfUnity: N must be a whole number ≥ 1')
  return Array.from({ length: N }, (_, k) => expi((2 * Math.PI * k) / N))
}

/** (1 + iφ/n)ⁿ, which tends to e^{iφ} as n grows (n compound steps of a quarter-turn-per-unit growth). */
export function eulerLimit(phi: number, n: number): C {
  if (!Number.isInteger(n) || n < 1) throw new Error('eulerLimit: n must be a whole number ≥ 1')
  return cpow(c(1, phi / n), n)
}

/** The n + 1 corners (1 + iφ/n)^k, k = 0 … n: the polygon that spirals onto the unit circle (the F1 picture). */
export function eulerPath(phi: number, n: number): C[] {
  const step = c(1, phi / n)
  const out: C[] = [ONE]
  for (let k = 1; k <= n; k++) out.push(mul(out[k - 1], step))
  return out
}

/** Σ_k a_k e^{iφ_k} (amplitudes default to 1): equal arrows cancel when their phases spread evenly round the circle. */
export function phasorSum(phases: readonly number[], amps?: readonly number[]): C {
  return phases.reduce<C>((s, ph, k) => add(s, scale(expi(ph), amps ? amps[k] : 1)), c(0))
}

/** The partial sums 0, a₀e^{iφ₀}, a₀e^{iφ₀} + a₁e^{iφ₁}, …: the head-to-tail arrow chain. */
export function phasorPath(phases: readonly number[], amps?: readonly number[]): C[] {
  const out: C[] = [c(0)]
  phases.forEach((ph, k) => out.push(add(out[k], scale(expi(ph), amps ? amps[k] : 1))))
  return out
}
