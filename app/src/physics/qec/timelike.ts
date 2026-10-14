/**
 * Time-like failures of a repeated product readout (Chapter B3, unit b3-distance; the toy model behind the "d rounds" of Williamson & Yoder 2024, arXiv:2410.02213 Theorem 4).
 * m seam checks are read each round and each reading is flipped independently with chance q; the logical product is the PRODUCT of the m readings, so the round's product reading
 * is wrong exactly when an odd number of readings flipped:
 *     p = (1 − (1 − 2q)^m) / 2 .
 * Reading the product R times and taking a majority vote (R odd) fails when more than half of the R product readings are wrong:
 *     P_fail(R) = Σ_{j > R/2} C(R, j) p^j (1 − p)^{R − j} .
 * This is OUR teaching model (independent flips, plain majority vote); the theorem asks for d rounds so that time-like and space-like faults are equally costly.
 * Pure TypeScript; the seeded history draws from the engine's own generator.
 */
import { binomialPmf } from './rates'
import { rng } from '../random'

export const TIMELIKE_LIMITS = { mMax: 8, rMax: 11 } as const

/** Chance that an odd number of the m readings flipped: the product reading is wrong. */
export function productFlip(q: number, m: number): number {
  if (!(q >= 0 && q <= 1) || !Number.isInteger(m) || m < 1) throw new Error('productFlip: q must be a chance and m a whole number ≥ 1')
  return (1 - (1 - 2 * q) ** m) / 2
}

/** The same chance by adding the probability of every one of the 2^m flip patterns with an odd number of flips (the route a lecture can show). */
export function productFlipByPatterns(q: number, m: number): number {
  if (m > 16) throw new Error('productFlipByPatterns: m ≤ 16')
  let p = 0
  for (let pat = 0; pat < 2 ** m; pat++) {
    let ones = 0
    for (let b = 0; b < m; b++) ones += (pat >> b) & 1
    if (ones % 2 === 1) p += q ** ones * (1 - q) ** (m - ones)
  }
  return p
}

/** Chance that the majority vote of R (odd) independent product readings, each wrong with chance p, is wrong. */
export function voteFail(R: number, p: number): number {
  if (!Number.isInteger(R) || R < 1 || R % 2 === 0) throw new Error('voteFail: R must be an odd whole number ≥ 1')
  if (!(p >= 0 && p <= 1)) throw new Error('voteFail: p must be a chance')
  let s = 0
  for (let j = (R + 1) / 2; j <= R; j++) s += binomialPmf(R, j, p)
  return s
}

/** The least odd R ≤ 99 whose vote failure is below `target`, or null. */
export function roundsFor(p: number, target: number): number | null {
  for (let R = 1; R <= 99; R += 2) if (voteFail(R, p) < target) return R
  return null
}

export interface TimelikeHistory {
  m: number
  R: number
  q: number
  seed: number
  /** flips[t][i] = 1 when check i misread in round t. */
  flips: number[][]
  /** Each round's product reading is wrong (an odd number of flips). */
  wrong: number[]
  /** How many rounds read the product wrongly, and whether the majority vote is wrong. */
  wrongRounds: number
  voteWrong: boolean
}

/** One seeded history: every reading flips with chance q; the vote verdict. `faults` (round 0-based, check 0-based) overrides the random draw. */
export function history(m: number, R: number, q: number, seed: number, faults?: ReadonlyArray<readonly [number, number]>): TimelikeHistory {
  if (!Number.isInteger(m) || m < 1 || m > TIMELIKE_LIMITS.mMax) throw new Error(`history: m must be 1 … ${TIMELIKE_LIMITS.mMax}`)
  if (!Number.isInteger(R) || R < 1 || R > TIMELIKE_LIMITS.rMax || R % 2 === 0) throw new Error(`history: R must be an odd number 1 … ${TIMELIKE_LIMITS.rMax}`)
  const flips: number[][] = Array.from({ length: R }, () => new Array<number>(m).fill(0))
  if (faults) for (const [t, i] of faults) flips[t][i] = 1
  else {
    const rand = rng(seed)
    for (let t = 0; t < R; t++) for (let i = 0; i < m; i++) flips[t][i] = rand() < q ? 1 : 0
  }
  const wrong = flips.map((row) => row.reduce((a, b) => a ^ b, 0))
  const wrongRounds = wrong.reduce((a, b) => a + b, 0)
  return { m, R, q, seed, flips, wrong, wrongRounds, voteWrong: wrongRounds > R / 2 }
}
