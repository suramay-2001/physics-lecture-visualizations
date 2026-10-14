/**
 * Belief propagation and ordered-statistics decoding on the Tanner graph of a classical check matrix (Papers background chapter B2, plan P-B2-story §9.1).
 *
 * The decoder is the plain one of Roffe et al. (arXiv:2005.07016 §V, Eqs. 6-7) in the log-likelihood form: every bit starts at the channel ratio
 * λ = ln((1 − p)/p); a check sends a bit the product of the signs and the minimum magnitude of the OTHER bits' messages (min-sum, with the sign
 * flipped when the check read −1), a bit sends a check the sum of λ and the messages of its other checks; the marginal of a bit is λ plus all of
 * its incoming messages; the hard decision is 1 when the marginal is ≤ 0 (the chance of a flip is at least ½, so a tie goes to 1). Flooding
 * schedule, no scaling factor (the scaling of that paper's appendix could not be read online). It stops as soon as the hard decision has the
 * right syndrome, or after `iters` rounds.
 *
 * OSD-0 (same §V): order the bits by marginal (most suspected first, ties broken by index low-to-high or high-to-low), take the first rank(H)
 * independent columns of H in that order, solve H_S e_S = s exactly and set every other bit to 0. The answer always has the right syndrome.
 *
 * Pure TypeScript; twin: pipeline/claims_papers/b2.py and pipeline/make_bb2_fixtures.py (a dictionary-based min-sum written separately).
 */
import { Echelon, GF2Matrix } from './gf2'

/** The channel log-likelihood ratio ln((1 − p)/p) of a bit that flips with chance p. */
export function channelLlr(p: number): number {
  if (!(p > 0 && p < 0.5)) throw new Error('channelLlr: p must be a chance strictly between 0 and ½')
  return Math.log((1 - p) / p)
}

export interface BPStep {
  /** the round, from 1 */
  iter: number
  /** λ + all incoming check messages, one per bit (negative: more likely flipped) */
  marginals: number[]
  /** 1 where the marginal is ≤ 0 */
  hard: number[]
  hardWeight: number
  /** does the hard decision have the syndrome that was asked for? */
  syndromeMet: boolean
}

export interface BPResult {
  converged: boolean
  /** the round at which it stopped (the round it converged, or `iters`) */
  iterations: number
  marginals: number[]
  hard: number[]
  history: BPStep[]
  /** λ */
  channel: number
}

/** Min-sum belief propagation (flooding) for H e = s over GF(2) with independent flips of chance p; at most `iters` rounds, stopping at the first right syndrome. */
export function minSumBP(H: GF2Matrix, syndrome: readonly number[], p: number, iters: number): BPResult {
  if (syndrome.length !== H.rows) throw new Error(`minSumBP: the syndrome has ${syndrome.length} bits, H has ${H.rows} checks`)
  if (!Number.isInteger(iters) || iters < 1) throw new Error('minSumBP: iters must be a whole number ≥ 1')
  const lam = channelLlr(p)
  const m = H.rows
  const n = H.cols
  const checkBits: number[][] = Array.from({ length: m }, (_, c) => H.rowSupport(c))
  // messages by (check, position in the check's list)
  const toBit: number[][] = checkBits.map((vs) => vs.map(() => 0))
  const toCheck: number[][] = checkBits.map((vs) => vs.map(() => lam))
  const history: BPStep[] = []
  let marginals: number[] = new Array<number>(n).fill(lam)
  let hard: number[] = new Array<number>(n).fill(0)
  for (let it = 1; it <= iters; it++) {
    for (let c = 0; c < m; c++) {
      const vs = checkBits[c]
      const sgnS = syndrome[c] ? -1 : 1
      for (let a = 0; a < vs.length; a++) {
        let sign = sgnS
        let mag = Infinity
        for (let b = 0; b < vs.length; b++) {
          if (b === a) continue
          const x = toCheck[c][b]
          sign *= x >= 0 ? 1 : -1
          mag = Math.min(mag, Math.abs(x))
        }
        toBit[c][a] = mag === Infinity ? 0 : sign * mag
      }
    }
    marginals = new Array<number>(n).fill(lam)
    for (let c = 0; c < m; c++) checkBits[c].forEach((v, a) => (marginals[v] += toBit[c][a]))
    for (let c = 0; c < m; c++) checkBits[c].forEach((v, a) => (toCheck[c][a] = marginals[v] - toBit[c][a]))
    hard = marginals.map((x) => (x <= 0 ? 1 : 0))
    const got = H.mulVec(hard)
    const met = got.every((b, i) => b === (syndrome[i] ? 1 : 0))
    history.push({ iter: it, marginals: marginals.slice(), hard: hard.slice(), hardWeight: hard.reduce((s, b) => s + b, 0), syndromeMet: met })
    if (met) return { converged: true, iterations: it, marginals, hard, history, channel: lam }
  }
  return { converged: false, iterations: iters, marginals, hard, history, channel: lam }
}

export interface OSDResult {
  estimate: number[]
  /** the information set: the first rank(H) independent columns in the marginal order */
  infoSet: number[]
  weight: number
  /** H · estimate equals the syndrome */
  valid: boolean
}

/** OSD-0: solve exactly on the most suspected independent bits, set the rest to 0. `tie` decides the order among equal marginals (low index first, or high index first). */
export function osd0(H: GF2Matrix, syndrome: readonly number[], marginals: readonly number[], tie: 'low' | 'high' = 'low'): OSDResult {
  const n = H.cols
  const m = H.rows
  if (marginals.length !== n) throw new Error('osd0: one marginal per bit')
  const order = Array.from({ length: n }, (_, j) => j).sort((a, b) => marginals[a] - marginals[b] || (tie === 'low' ? a - b : b - a))
  const HT = H.transpose()
  const want = H.rank()
  const ech = new Echelon(m)
  const infoSet: number[] = []
  for (const j of order) {
    if (ech.add(HT.rowBits(j))) infoSet.push(j)
    if (infoSet.length === want) break
  }
  const sub = GF2Matrix.fromRows(infoSet.map((j) => HT.rowBits(j)), m).transpose()
  const sol = sub.solve(syndrome.map((b) => (b ? 1 : 0)))
  const estimate = new Array<number>(n).fill(0)
  if (sol) infoSet.forEach((j, t) => (estimate[j] = sol[t]))
  const got = H.mulVec(estimate)
  return { estimate, infoSet, weight: estimate.reduce((s, b) => s + b, 0), valid: !!sol && got.every((b, i) => b === (syndrome[i] ? 1 : 0)) }
}

/** Does the difference of two errors lie in the row space of `stabilizers` (so they act alike on the code)? */
export function differByStabilizer(stabilizers: GF2Matrix, a: readonly number[], b: readonly number[]): boolean {
  const diff = a.map((x, i) => x ^ b[i])
  return stabilizers.rowspaceContains(diff)
}

/** The number of pairs of rows of H that share two or more columns (the four-cycles of its Tanner graph). */
export function fourCycles(H: GF2Matrix): number {
  let count = 0
  for (let a = 0; a < H.rows; a++) {
    const sa = new Set(H.rowSupport(a))
    for (let b = a + 1; b < H.rows; b++) {
      let shared = 0
      for (const j of H.rowSupport(b)) if (sa.has(j)) shared++
      if (shared >= 2) count++
    }
  }
  return count
}
