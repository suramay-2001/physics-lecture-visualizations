/**
 * The timing of an error-correction cycle (Physics 709, Papers B6; owned by B6, wrapped by P2's physics/readout/gandalf.ts, never copied). Pure, lazy-only.
 * A round is a list of timed parts (gates, moves, acquisition, reset, classification, denoising); d rounds run one after the other (`unpipelinedTotal`, the paper's
 * Eq. 4 in generic form) or with the classical work of a round hidden behind the next round's gates and acquisition (`pipelinedTotal`, Eq. 5 in generic form).
 * Times are in one unit of the caller's choosing (the pages use ms). The numpy twin is pipeline/make_gandalf_platform_fixtures.py (an event simulation for the
 * pipelined total). B6's builder added the rest of P-B6-story §9.1 below (idle twirl, readout error, effective rate, the toy logical error and its minimum, fault counting, atom loss); twin pipeline/claims_papers/b6.py.
 */

import { bestThreshold } from '../optics/imaging'
import { choose, repetitionLogical } from './curves'

export type RoundPartKind = 'gate' | 'move' | 'acquire' | 'reset' | 'classify' | 'denoise'
export const ROUND_PART_KINDS: readonly RoundPartKind[] = ['gate', 'move', 'acquire', 'reset', 'classify', 'denoise']
export interface RoundPart {
  kind: RoundPartKind
  /** Duration, ≥ 0 and finite. */
  ms: number
}

function checkParts(parts: readonly RoundPart[]): void {
  for (const p of parts) if (!(ROUND_PART_KINDS as readonly string[]).includes(p.kind) || !(Number.isFinite(p.ms) && p.ms >= 0)) throw new RangeError('round part: a known kind and a duration >= 0')
}
/** The time of one round done in order: the sum of every part's duration. */
export function roundTime(parts: readonly RoundPart[]): number {
  checkParts(parts)
  let s = 0
  for (const p of parts) s += p.ms
  return s
}
/** The share of a round taken by the readout chain: acquisition, classification and denoising by default (pass `kinds` to count other parts). */
export function readoutFraction(parts: readonly RoundPart[], kinds: readonly RoundPartKind[] = ['acquire', 'classify', 'denoise']): number {
  const total = roundTime(parts)
  if (total === 0) throw new RangeError('readoutFraction: a round of zero length')
  let s = 0
  for (const p of parts) if (kinds.includes(p.kind)) s += p.ms
  return s / total
}

function checkRounds(d: number, g: number, r: number, c: number): void {
  if (!(Number.isInteger(d) && d >= 1 && [g, r, c].every((x) => Number.isFinite(x) && x >= 0))) throw new RangeError('rounds: a whole number d >= 1 and times g, r, c >= 0')
}
/** d rounds, each waiting for the one before: T = d (g + r + c) for gates g, acquisition r and classification c. */
export function unpipelinedTotal(d: number, g: number, r: number, c: number): number {
  checkRounds(d, g, r, c)
  return d * (g + r + c)
}
/**
 * d rounds with the classification of round k running while round k + 1 is gated and photographed (the next round's gates must not wait for it):
 * T = (g + r) + c + (d − 1) max(g + r, c). When c ≤ g + r this is d (g + r) + c; when c is larger the classifier is the bottleneck, T = (g + r) + d c.
 */
export function pipelinedTotal(d: number, g: number, r: number, c: number): number {
  checkRounds(d, g, r, c)
  return g + r + c + (d - 1) * Math.max(g + r, c)
}
/** The time pipelining saves: unpipelined minus pipelined (= (d − 1) min(c, g + r)). */
export const pipelineSaving = (d: number, g: number, r: number, c: number): number => unpipelinedTotal(d, g, r, c) - pipelinedTotal(d, g, r, c)
/** B6's names for the same two totals (P-B6-story §9.1). */
export const serialTime = unpipelinedTotal
export const pipelinedTime = pipelinedTotal
/**
 * An event simulation of the pipeline (a test oracle, not for pages): one acquisition chain (gates then acquisition of round k + 1 start when round k's acquisition is
 * done) and one classifier that takes rounds in order, each only after its acquisition and after the previous classification. Returns the time the last classification ends.
 */
export function pipelineSim(d: number, g: number, r: number, c: number): number {
  checkRounds(d, g, r, c)
  let acqEnd = 0
  let classEnd = 0
  for (let k = 0; k < d; k++) {
    acqEnd += g + r
    classEnd = Math.max(classEnd, acqEnd) + c
  }
  return classEnd
}

/* ------------------------------------------------ idle error, readout error and the U-shaped optimum (P-B6-story §9.1; model inputs, not data) ------------------------------------------------ */
export interface PauliChances {
  pX: number
  pY: number
  pZ: number
}
/**
 * The Pauli twirl of a qubit that waits a time t with amplitude damping T₁ and dephasing T₂ (Tomita and Svore, Eqs. 9–10): p_X = p_Y = (1 − e^{−t/T₁})/4 and
 * p_Z = (1 − e^{−t/T₂})/2 − p_X. Times in one unit (seconds on the pages). T₂ ≤ 2 T₁ is the physical range; a larger T₂ would make p_Z negative and is refused.
 */
export function pauliTwirl(t: number, T1: number, T2: number): PauliChances {
  if (!(Number.isFinite(t) && t >= 0) || !(T1 > 0) || !(T2 > 0)) throw new RangeError('pauliTwirl: a time t >= 0 and positive T1, T2')
  const pX = -Math.expm1(-t / T1) / 4
  const pZ = -Math.expm1(-t / T2) / 2 - pX
  if (pZ < -1e-15) throw new RangeError('pauliTwirl: T2 must not exceed 2 T1')
  return { pX, pY: pX, pZ: Math.max(0, pZ) }
}
/** The total chance of an error while waiting: p_X + p_Y + p_Z. */
export const idleTotal = (t: number, T1: number, T2: number): number => {
  const q = pauliTwirl(t, T1, T2)
  return q.pX + q.pY + q.pZ
}
/** The straight-line rule for short waits: t/(4 T₁) + t/(2 T₂). */
export const idleSmallT = (t: number, T1: number, T2: number): number => t / (4 * T1) + t / (2 * T2)
/** How a Pauli channel shrinks the Bloch vector: λ_x = 1 − 2(p_Y + p_Z), λ_y = 1 − 2(p_X + p_Z), λ_z = 1 − 2(p_X + p_Y). */
export function blochShrink(q: PauliChances): { x: number; y: number; z: number } {
  return { x: 1 - 2 * (q.pY + q.pZ), y: 1 - 2 * (q.pX + q.pZ), z: 1 - 2 * (q.pX + q.pY) }
}
/**
 * The chance of a wrong reading after `tMs` milliseconds of counting: a bright atom gives Poisson counts of mean `rb`·t, a dark site `rg`·t (rates per ms, `rb` the whole bright rate), and
 * the best whole-count cutoff is used (physics/optics/imaging.ts `bestThreshold`; error = half the sum of the two misreads).
 */
export function readoutError(rb: number, rg: number, tMs: number): number {
  if (!(rb > rg && rg >= 0) || !(tMs > 0)) throw new RangeError('readoutError: a bright rate above the background rate, a background >= 0, a time > 0')
  return bestThreshold(rb * tMs, rg * tMs).err
}
/** B6's toy effective error per round: gate and move error p_g + idle error over the reading time (ms, converted to seconds for T₁, T₂) + the reading's own error. */
export function effectiveRate(pg: number, tMs: number, T1: number, T2: number, rb: number, rg: number): number {
  return pg + idleTotal(tMs / 1000, T1, T2) + readoutError(rb, rg, tMs)
}
/** The scaling p_L = A (p/p_th)^((d+1)/2) (the `bev22` fit of B1: A = 0.03, p_th = 0.01 on the pages), for odd d. */
export function logicalToy(peff: number, A: number, pth: number, d: number): number {
  if (!Number.isInteger(d) || d < 1 || d % 2 === 0 || !(peff >= 0) || !(A > 0) || !(pth > 0)) throw new RangeError('logicalToy: an odd whole d, p_eff >= 0, A > 0, p_th > 0')
  return A * (peff / pth) ** ((d + 1) / 2)
}
/** The smallest value of f on the grid lo, lo + step, … ≤ hi (the first one on a tie): the argument and the value. */
export function argminTime(f: (t: number) => number, lo: number, hi: number, step: number): { t: number; value: number } {
  if (!(hi > lo) || !(step > 0)) throw new RangeError('argminTime: lo < hi and step > 0')
  const n = Math.floor((hi - lo) / step + 1e-9)
  let best = { t: lo, value: f(lo) }
  for (let i = 1; i <= n; i++) {
    const t = lo + i * step
    const v = f(t)
    if (v < best.value) best = { t, value: v }
  }
  return best
}
/** Golden-section minimum of f on [lo, hi] (f unimodal there), to the argument tolerance `tol`. */
export function refineMinimum(f: (t: number) => number, lo: number, hi: number, tol = 1e-7): { t: number; value: number } {
  const g = (Math.sqrt(5) - 1) / 2
  let a = lo
  let b = hi
  let c = b - g * (b - a)
  let d = a + g * (b - a)
  let fc = f(c)
  let fd = f(d)
  while (b - a > tol) {
    if (fc < fd) {
      b = d
      d = c
      fd = fc
      c = b - g * (b - a)
      fc = f(c)
    } else {
      a = c
      c = d
      fc = fd
      d = a + g * (b - a)
      fd = f(d)
    }
  }
  const t = (a + b) / 2
  return { t, value: f(t) }
}

/* ------------------------------------------------ why the exponent is (d + 1)/2: counting the cheapest failing fault sets ------------------------------------------------ */
/** The cheapest failing fault sets of a vote of d (odd) copies: C(d, (d+1)/2) p^((d+1)/2). */
export const voteLeading = (d: number, p: number): number => choose(d, (d + 1) / 2) * p ** ((d + 1) / 2)
/** The exact failure of the vote (B1's `repetitionLogical`), restated here for the chapter. */
export const voteExact = repetitionLogical
/** The elementary symmetric polynomial e_k of the rates p: the sum over every k-subset of the product of its rates (the leading term of failure with unequal rates), by the generating polynomial. */
export function elementarySymmetric(p: readonly number[], k: number): number {
  if (!Number.isInteger(k) || k < 0 || k > p.length) throw new RangeError('elementarySymmetric: a whole k from 0 to the number of rates')
  const e = new Array<number>(k + 1).fill(0)
  e[0] = 1
  for (const q of p) for (let j = k; j >= 1; j--) e[j] += e[j - 1] * q
  return e[k]
}
/** The chance that at least k of n independent events happen, event i with chance p_i (the Poisson-binomial tail), by the one-pass recursion over the count. */
export function poissonBinomialTail(p: readonly number[], k: number): number {
  const dp = new Array<number>(p.length + 1).fill(0)
  dp[0] = 1
  let used = 0
  for (const q of p) {
    used++
    for (let j = used; j >= 1; j--) dp[j] = dp[j] * (1 - q) + dp[j - 1] * q
    dp[0] *= 1 - q
  }
  let s = 0
  for (let j = Math.max(0, k); j <= p.length; j++) s += dp[j]
  return s
}
/** Maclaurin's bound on e_k: C(n, k) p̄^k with p̄ the mean rate (equality when all rates are equal). */
export function maclaurinBound(p: readonly number[], k: number): number {
  const mean = p.reduce((a, b) => a + b, 0) / p.length
  return choose(p.length, k) * mean ** k
}
/** A repetition code of d bits with erasure chance e and no other errors fails only when every bit is erased and the guess is wrong: e^d / 2. */
export function erasureRepetition(d: number, e: number): number {
  if (!Number.isInteger(d) || d < 1 || !(e >= 0 && e <= 1)) throw new RangeError('erasureRepetition: a whole d >= 1 and a chance e')
  return 0.5 * e ** d
}
/** The fewest faults that fail a vote of d copies: (d + 1)/2 unknown flips, or d known-place erasures. */
export const minFaults = (d: number, kind: 'flip' | 'erasure'): number => {
  if (!Number.isInteger(d) || d < 1 || d % 2 === 0) throw new RangeError('minFaults: an odd whole d')
  return kind === 'flip' ? (d + 1) / 2 : d
}

/* ------------------------------------------------ atoms that leave ------------------------------------------------ */
/** The expected number of atoms lost in one round: n atoms, each surviving an image with chance S. */
export function lossPerRound(n: number, S: number): number {
  if (!Number.isInteger(n) || n < 1 || !(S > 0 && S <= 1)) throw new RangeError('lossPerRound: a whole n >= 1 and a survival chance 0 < S <= 1')
  return n * (1 - S)
}
/** The chance that no atom is lost in `rounds` rounds: S^(n · rounds). */
export function noLossChance(n: number, S: number, rounds: number): number {
  if (!Number.isInteger(n) || n < 1 || !Number.isInteger(rounds) || rounds < 0 || !(S > 0 && S <= 1)) throw new RangeError('noLossChance: whole n >= 1 and rounds >= 0, 0 < S <= 1')
  return S ** (n * rounds)
}
/** How many rounds pass, on average, per lost atom: 1/(n (1 − S)). */
export const roundsPerLoss = (n: number, S: number): number => 1 / lossPerRound(n, S)
