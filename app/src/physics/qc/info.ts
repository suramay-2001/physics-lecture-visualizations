/**
 * Generic probability and information-theory helpers (P-709-remap §6 "info"; chapters F2, Q10). Plain numbers in,
 * plain numbers out — no qubits, no complex numbers — so `measure.ts`'s `weightStats` and the `plot`/`matrix`
 * stage kinds can share one Shannon-entropy and one binomial-moments implementation. Bits (log₂), as in `density.ts`.
 */

/** Σ p_k x_k, the mean of `xs` weighted by `p` (xs and p must be the same length; p is used as given — callers
 * already hold Born-rule probabilities, which need not be touched up for floating round-off here). */
export function mean(xs: readonly number[], p: readonly number[]): number {
  if (xs.length !== p.length) throw new Error('mean: xs and p must be the same length')
  return xs.reduce((s, x, i) => s + p[i] * x, 0)
}

/** Σ p_k (x_k − mean)², never negative by construction (a sum of squares). */
export function variance(xs: readonly number[], p: readonly number[]): number {
  const m = mean(xs, p)
  return xs.reduce((s, x, i) => s + p[i] * (x - m) ** 2, 0)
}

/** The mean and variance of a Binomial(N, p) count: Np and Np(1 − p) (Reif §1.4–1.6; HW2 P5). */
export function binomialMoments(N: number, p: number): { mean: number; variance: number } {
  if (!Number.isInteger(N) || N < 0) throw new Error('binomialMoments: N must be a whole number ≥ 0')
  return { mean: N * p, variance: N * p * (1 - p) }
}

/** Shannon entropy H(p) = −Σ p_k log₂ p_k, in bits (0·log 0 = 0; negligible negative noise from p is floored). */
export function shannon(p: readonly number[]): number {
  return -p.reduce((s, x) => s + (x > 1e-15 ? x * Math.log2(x) : 0), 0)
}

/** The binary entropy function h(p) = −p log₂ p − (1 − p) log₂(1 − p), 0 ≤ p ≤ 1 (max 1 bit at p = ½). */
export const binaryEntropy = (p: number): number => shannon([p, 1 - p])

/**
 * The marginals of a joint distribution p[x][y] (x indexes rows, y indexes columns): px[x] = Σ_y p[x][y],
 * py[y] = Σ_x p[x][y] (Q10's CHSH tables; F2).
 */
export function marginals(pxy: readonly (readonly number[])[]): { px: number[]; py: number[] } {
  const cols = pxy[0]?.length ?? 0
  const px = pxy.map((row) => row.reduce((s, x) => s + x, 0))
  const py = Array.from({ length: cols }, (_, y) => pxy.reduce((s, row) => s + row[y], 0))
  return { px, py }
}

/**
 * The ±1-valued correlator C = ⟨XY⟩ = p₀₀ − p₀₁ − p₁₀ + p₁₁ from a 2×2 joint distribution over bits x, y ∈ {0, 1}
 * read as ±1 outcomes ((−1)^bit): C = +1 for perfectly correlated bits, −1 for perfectly anticorrelated, 0 for
 * independent fair coins (Q10's CHSH correlators; F2).
 */
export function correlatorC(pxy: readonly (readonly [number, number])[] | readonly (readonly number[])[]): number {
  if (pxy.length !== 2 || pxy[0].length !== 2 || pxy[1].length !== 2) throw new Error('correlatorC: pxy must be a 2×2 table')
  return pxy[0][0] - pxy[0][1] - pxy[1][0] + pxy[1][1]
}

/**
 * The statistical correlation ⟨ab⟩ − ⟨a⟩⟨b⟩ of two ±1-valued variables from a 2×2 joint table over bits x, y read as
 * (−1)^bit (Lecture 9; Susskind §6.2): `correlatorC` minus the product of the two means (px₀ − px₁)(py₀ − py₁). It is 0 for
 * any table that factors, and −1 for two coins that always differ.
 */
export function covariancePM(pxy: readonly (readonly number[])[]): number {
  const { px, py } = marginals(pxy)
  return correlatorC(pxy) - (px[0] - px[1]) * (py[0] - py[1])
}

/**
 * The 2×2 joint table P(a, b) of two coins scored ±1, rows and columns ordered +1 then −1 (bit 0 is +1, as in
 * `correlatorC`). 'dealer': a dealer hands a penny (+1) and a dime (−1) to two people at random, so they always hold
 * opposite scores, P(+1, −1) = P(−1, +1) = ½. `{pA, pB}`: two independent coins with P(+1) = pA and P(+1) = pB, so the table
 * factors, P(a, b) = P_A(a)P_B(b). Chances only: no phases, nothing quantum.
 */
export function classicalPair(spec: 'dealer' | { pA: number; pB: number }): [[number, number], [number, number]] {
  if (spec === 'dealer')
    return [
      [0, 0.5],
      [0.5, 0],
    ]
  const { pA, pB } = spec
  if (!(pA >= 0 && pA <= 1 && pB >= 0 && pB <= 1)) throw new Error('classicalPair: pA and pB must be chances from 0 to 1')
  return [
    [pA * pB, pA * (1 - pB)],
    [(1 - pA) * pB, (1 - pA) * (1 - pB)],
  ]
}
