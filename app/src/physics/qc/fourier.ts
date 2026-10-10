/**
 * The discrete Fourier transform and the sums and fractions around it, for Chapter F8 "Hidden rhythms" (P-F8-story §9.1; N&C §5.1
 * p. 217, Appendix 4 pp. 635-638; Bergou §7.5 pp. 127-129). Chapter Q18 reuses all of it for the quantum Fourier transform and for
 * Shor's algorithm. Pure functions of numbers and `Vec`s.
 *
 * Convention (locked in the plan): ω = ω_N = e^{2πi/N}; the transform has the sign +, (F_N)_{kj} = ω^{jk}/√N, the same as N&C Eq. 5.1 and
 * Bergou's U_F (Eq. 7.34). NumPy's `fft` has the sign −; numpy's `ifft(…, norm='ortho')` is this F_N. A list is c_j, its transform ĉ_k.
 * Index j and k are plain numbers 0 … N − 1; on a register the bit string is the number its bits spell, first (q0) bit most significant.
 */
import { type C, ONE, ZERO, abs, add, c, cpow, div, expi, mul, scale, sub } from '../complex'
import { type Mat, type Vec, normalize } from '../linalg'
import { modPow, multOrder } from './numtheory'

const wholeN = (N: number): void => {
  if (!Number.isInteger(N) || N < 1) throw new Error('N must be a whole number ≥ 1')
}

/** The N-point transform matrix, (F_N)_{kj} = ω^{jk}/√N (the exponent is reduced mod N first, so every entry is as exact as cos and sin are). */
export function dftMatrix(N: number): Mat {
  wholeN(N)
  const s = 1 / Math.sqrt(N)
  return Array.from({ length: N }, (_, k) => Array.from({ length: N }, (_, j) => scale(expi((2 * Math.PI * ((j * k) % N)) / N), s)))
}

/** ĉ = F_N c: ĉ_k = (1/√N) Σ_j c_j ω^{jk}. Any length N ≥ 1 (not only a power of 2). */
export function dft(v: Vec): Vec {
  const N = v.length
  wholeN(N)
  const s = 1 / Math.sqrt(N)
  return Array.from({ length: N }, (_, k) => scale(v.reduce<C>((acc, cj, j) => add(acc, mul(cj, expi((2 * Math.PI * ((j * k) % N)) / N))), ZERO), s))
}

/**
 * The comb of step r: equal amplitudes on the places s, s + r, s + 2r, … below N and zero elsewhere, normalised (so each of its t teeth
 * has amplitude 1/√t). comb(8, 2) is the state ½(|0⟩ + |2⟩ + |4⟩ + |6⟩) = `ket('++0')`.
 */
export function comb(N: number, r: number, s = 0): Vec {
  wholeN(N)
  if (!Number.isInteger(r) || r < 1) throw new Error('comb: the step r must be a whole number ≥ 1')
  if (!Number.isInteger(s) || s < 0 || s >= r) throw new Error('comb: the start s must satisfy 0 ≤ s < r')
  const v: Vec = Array.from({ length: N }, (_, j) => (j >= s && (j - s) % r === 0 ? ONE : ZERO))
  if (v.every((z) => z.re === 0)) throw new Error('comb: no teeth below N')
  return normalize(v)
}

/* ---------------------------------------------------------------- geometric sums ---------------------------------------------------------------- */

/** The geometric sum 1 + u + … + u^{M−1} by the closed form (1 − u^M)/(1 − u) (the S − uS trick), M for u = 1 (Bergou Eq. 7.39, p. 128). */
export function geometricSum(u: C, M: number): C {
  if (!Number.isInteger(M) || M < 1) throw new Error('geometricSum: M must be a whole number ≥ 1')
  const gap = sub(ONE, u)
  if (abs(gap) < 1e-12) return c(M)
  return div(sub(ONE, cpow(u, M)), gap)
}
/** The same sum added term by term, each term u times the last (the check that the closed form is the sum). */
export function geometricSumDirect(u: C, M: number): C {
  if (!Number.isInteger(M) || M < 1) throw new Error('geometricSumDirect: M must be a whole number ≥ 1')
  let term: C = ONE
  let total: C = ZERO
  for (let t = 0; t < M; t++) {
    total = add(total, term)
    term = mul(term, u)
  }
  return total
}

/** The chord |1 − e^{iθ}| = 2|sin(θ/2)| (Bergou Eq. 7.40, p. 128): the gap from 1 to the arrow at angle θ. */
export const chord = (theta: number): number => 2 * Math.abs(Math.sin(theta / 2))

/**
 * D_M(δ) = |(1/M) Σ_{t<M} e^{2πiδt}| = |sin πMδ| / (M |sin πδ|): the fraction of its straight length a chain of M unit arrows keeps when each
 * arrow is turned δ of a full turn more than the last (Bergou Eqs. 7.39-7.41, pp. 128-129). It is 1 when δ is a whole number (every arrow
 * points the same way), 0 at δ = ±1/M, and at least 2/π for |δ| ≤ 1/(2M).
 */
export function dirichlet(M: number, delta: number): number {
  if (!Number.isInteger(M) || M < 1) throw new Error('dirichlet: M must be a whole number ≥ 1')
  const s = Math.sin(Math.PI * delta)
  if (Math.abs(s) < 1e-12) return 1
  return Math.abs(Math.sin(Math.PI * M * delta)) / (M * Math.abs(s))
}

/* ---------------------------------------------------------------- binary and continued fractions ---------------------------------------------------------------- */

/** 0.d₁d₂…d_m in binary: Σ d_l 2^{−l} (N&C p. 218). `bits` is the string of digits after the point, e.g. '101' → 0.625. */
export function binaryFraction(bits: string): number {
  if (!/^[01]*$/.test(bits)) throw new Error('binaryFraction: digits 0 and 1 only')
  let x = 0
  let w = 0.5
  for (const d of bits) {
    if (d === '1') x += w
    w /= 2
  }
  return x
}

/** The partial quotients [a₀; a₁, …, a_n] of p/q (p ≥ 0, q ≥ 1): the quotients of Euclid's algorithm on (p, q) (N&C A4.4, pp. 635-636). */
export function continuedFraction(p: number, q: number): number[] {
  if (!Number.isSafeInteger(p) || !Number.isSafeInteger(q) || p < 0 || q < 1) throw new Error('continuedFraction: p ≥ 0 and q ≥ 1, whole numbers')
  const out: number[] = []
  let a = p
  let b = q
  while (b !== 0) {
    const t = Math.floor(a / b)
    out.push(t)
    ;[a, b] = [b, a - t * b]
  }
  return out
}

/** The convergents p_l/q_l = [a₀; …, a_l] by p_l = a_l p_{l−1} + p_{l−2}, q_l = a_l q_{l−1} + q_{l−2} (N&C Thm A4.15, p. 637). */
export function convergents(cf: readonly number[]): { p: number; q: number }[] {
  const out: { p: number; q: number }[] = []
  let [pPrev, p] = [0, 1]
  let [qPrev, q] = [1, 0]
  for (const a of cf) {
    ;[pPrev, p] = [p, a * p + pPrev]
    ;[qPrev, q] = [q, a * q + qPrev]
    out.push({ p, q })
  }
  return out
}

/**
 * Read an order off a peak (N&C Thm A4.16, p. 637, and §5.3.1 pp. 226-229): y is the place of a peak of a 2^m-point transform; walk the
 * convergents of y/2^m and return the first denominator q < N with x^q ≡ 1 (mod N), or null when none passes. It is x's order whenever the
 * peak sits near k/r with k and r sharing no factor; a shared factor gives a divisor of r, which the test x^q ≡ 1 rejects.
 */
export function orderFromPeak(y: number, m: number, x: number, N: number): number | null {
  if (!Number.isInteger(m) || m < 1 || m > 30) throw new Error('orderFromPeak: m must be a whole number 1-30')
  if (!Number.isInteger(y) || y < 0 || y >= 2 ** m) throw new Error('orderFromPeak: y must be a place 0 … 2^m − 1')
  for (const { q } of convergents(continuedFraction(y, 2 ** m))) if (q >= 1 && q < N && modPow(x, q, N) === 1 % N) return q
  return null
}

/** Every place y of a 2^m-point transform whose convergent test returns x's order mod N (empty when x has no order). */
export function peakSuccesses(m: number, x: number, N: number): number[] {
  const r = multOrder(x, N)
  if (r === null) return []
  return Array.from({ length: 2 ** m }, (_, y) => y).filter((y) => orderFromPeak(y, m, x, N) === r)
}
