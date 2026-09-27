/**
 * Complex-number helpers for F1 "Numbers that turn" (P-709-map §(b) "other: complex"). complex.ts already has
 * expi, polar, arg, csqrt and cpow; these two show e^{iφ} as a limit of small turns and interference as a sum of
 * arrows.
 */
import { type C, ONE, add, c, cpow, expi, mul, scale } from '../complex'

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
