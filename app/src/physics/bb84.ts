/**
 * BB84 quantum key distribution with an intercept–resend eavesdropper (Lecture 8, notes §§8.4–8.9 and L9 §§9.1–9.3).
 *
 * ONE seeded engine for the `bb84` stage kind, the `bb84-bench` widget and the `catch-eve` Arcade game. Every chance below
 * is a Born probability of the engine's own kets (`physics/polarization.ts` POL, `spin.ts` `prob`); the tallies and the
 * sifted-key rates are enumerations or seeded samples of those chances, never a formula typed in. Rosetta (rulings
 * 448-L8L11, L8 R3): the bases are named H/V and D/A (the notes' Z and X), a code bit is 0 for the first state of a basis
 * (H, D) and 1 for the second (V, A), and the message bit of the one-time pad is x (the notes' m; here m is a sample size).
 *
 * Draw order of one round (seven uniform numbers from the seeded generator, ALWAYS seven, so that switching Eve on or
 * off, or changing the fraction she intercepts, never moves Alice's or Bob's choices, and a longer run only appends
 * rounds): Alice's bit, Alice's basis, Bob's basis, Eve's basis, Eve's "intercept?", Eve's outcome, Bob's outcome.
 */
import { type Vec } from './linalg'
import { POL } from './polarization'
import { rng } from './random'
import { prob } from './spin'

export type Basis = 'HV' | 'DA'
export type Bit = 0 | 1
export const BASES: readonly Basis[] = ['HV', 'DA']
/** The agreed code (notes §8.5): index = the bit. H/V basis: H = 0, V = 1. D/A basis: D = 0, A = 1. */
export const BB84_CODE: Readonly<Record<Basis, readonly [Vec, Vec]>> = { HV: [POL.H, POL.V], DA: [POL.D, POL.A] }
export const bb84Ket = (basis: Basis, bit: Bit): Vec => BB84_CODE[basis][bit]
/** The letter of a prepared state: H, V, D or A. */
export const stateLetter = (basis: Basis, bit: Bit): 'H' | 'V' | 'D' | 'A' => (basis === 'HV' ? (['H', 'V'] as const)[bit] : (['D', 'A'] as const)[bit])

const snap = (p: number): number => (p < 1e-12 ? 0 : p > 1 - 1e-12 ? 1 : Math.abs(p - 0.5) < 1e-12 ? 0.5 : p)

/** BORN[basis of the state][bit of the state][measuring basis] = P(reading bit 0): from the kets, once. */
const BORN0: Record<Basis, [Record<Basis, number>, Record<Basis, number>]> = (() => {
  const row = (b: Basis, k: Bit): Record<Basis, number> => ({
    HV: snap(prob(BB84_CODE.HV[0], BB84_CODE[b][k])),
    DA: snap(prob(BB84_CODE.DA[0], BB84_CODE[b][k])),
  })
  return { HV: [row('HV', 0), row('HV', 1)], DA: [row('DA', 0), row('DA', 1)] }
})()

/** The chance that measuring the photon (basis, bit) in `measureIn` reads `k` (the Born rule on the engine's kets). */
export function bornBit(state: { basis: Basis; bit: Bit }, measureIn: Basis, k: Bit): number {
  const p0 = BORN0[state.basis][state.bit][measureIn]
  return k === 0 ? p0 : 1 - p0
}

export interface RoundSpec {
  alice: { basis: Basis; bit: Bit }
  bob: { basis: Basis }
  /** Eve intercepts, measures in her basis and resends the state she found; absent = no Eve. */
  eve?: { basis: Basis }
}

/**
 * P(Bob's bit ≠ Alice's bit) for one round, summed over Eve's outcomes (a Born sum, two separate histories that add; Bob
 * receives a definite photon of Eve's, never a blend). With matched bases this is the error of a KEPT round.
 */
export function bb84ErrorProb(spec: RoundSpec): number {
  const wrong = (1 - spec.alice.bit) as Bit
  if (!spec.eve) return bornBit(spec.alice, spec.bob.basis, wrong)
  let p = 0
  for (const e of [0, 1] as const) {
    const pe = bornBit(spec.alice, spec.eve.basis, e)
    if (pe > 0) p += pe * bornBit({ basis: spec.eve.basis, bit: e }, spec.bob.basis, wrong)
  }
  return p
}

/**
 * The error rate Q of the SIFTED key when Eve intercepts a fraction f of the photons (f = 1 is the notes' attack), by
 * enumeration over Alice's bit and basis, Bob's basis and Eve's basis, each equally likely, keeping the matched-basis
 * rounds. It is the average over Eve's choices, ¼ for f = 1.
 */
export function bb84Q(f = 1): number {
  if (!(f >= 0 && f <= 1)) throw new Error('bb84Q: f must be in [0, 1]')
  let kept = 0
  let err = 0
  for (const aBasis of BASES)
    for (const aBit of [0, 1] as const)
      for (const bBasis of BASES)
        for (const eBasis of BASES) {
          if (aBasis !== bBasis) continue
          const w = 1 / 16
          const alice = { basis: aBasis, bit: aBit }
          const pClean = bb84ErrorProb({ alice, bob: { basis: bBasis } })
          const pEve = bb84ErrorProb({ alice, bob: { basis: bBasis }, eve: { basis: eBasis } })
          kept += w
          err += w * ((1 - f) * pClean + f * pEve)
        }
  return err / kept
}

/**
 * The share of the sifted bits Eve knows for certain when she intercepts a fraction f: those where she used Alice's basis
 * (her recorded outcome is then the bit with probability 1). ½ f by enumeration; every other sifted bit is a fair coin to her.
 */
export function eveKnown(f = 1): number {
  if (!(f >= 0 && f <= 1)) throw new Error('eveKnown: f must be in [0, 1]')
  let kept = 0
  let known = 0
  for (const aBasis of BASES)
    for (const aBit of [0, 1] as const)
      for (const eBasis of BASES) {
        const w = 1 / 8 // Alice's bit, Alice's basis, Eve's basis; Bob's basis equals Alice's on a kept round (the other half is sifted away)
        kept += w
        // she knows the bit when her outcome equals it with certainty
        if (bornBit({ basis: aBasis, bit: aBit }, eBasis, aBit) >= 1 - 1e-12) known += w * f
      }
  return known / kept
}

/** P(a test of m sifted bits shows no error) when each sifted bit is wrong with probability Q: (1 − Q)^m, independent bits. */
export function missProb(Q: number, m: number): number {
  if (!(Q >= 0 && Q <= 1) || !Number.isInteger(m) || m < 0) throw new Error('missProb: Q in [0, 1] and a whole number m ≥ 0')
  return Math.pow(1 - Q, m)
}

/** The smallest test size m with missProb(Q, m) ≤ risk, found by search (not by a logarithm). Throws if Q = 0 (never caught). */
export function minTestSize(Q: number, risk: number): number {
  if (!(Q > 0 && Q <= 1)) throw new Error('minTestSize: Q must be in (0, 1]')
  if (!(risk > 0 && risk < 1)) throw new Error('minTestSize: risk must be in (0, 1)')
  for (let m = 0; m < 100000; m++) if (missProb(Q, m) <= risk) return m
  throw new Error('minTestSize: no m below 100000')
}

/* ---------------- seeded rounds ---------------- */

export interface Bb84Round {
  /** 1-based round number. */
  n: number
  aBit: Bit
  aBasis: Basis
  bBasis: Basis
  bBit: Bit
  /** Eve intercepted this photon (always drawn: her basis and outcome exist even if unused). */
  eIntercept: boolean
  eBasis: Basis
  /** Eve's reading, or null when she did not intercept. */
  eBit: Bit | null
  /** Matched bases: the round survives sifting. */
  kept: boolean
  /** A kept round whose bits differ. */
  error: boolean
  /** A kept round where Eve used Alice's basis (she knows the bit). */
  eveKnows: boolean
}

const MAX_ROUNDS = 20000
interface Run {
  next: () => number
  rounds: Bb84Round[]
}
const RUNS = new Map<string, Run>()

function drawRound(next: () => number, n: number, fraction: number): Bb84Round {
  const u = [next(), next(), next(), next(), next(), next(), next()]
  const aBit: Bit = u[0] < 0.5 ? 0 : 1
  const aBasis: Basis = u[1] < 0.5 ? 'HV' : 'DA'
  const bBasis: Basis = u[2] < 0.5 ? 'HV' : 'DA'
  const eBasis: Basis = u[3] < 0.5 ? 'HV' : 'DA'
  const eIntercept = u[4] < fraction
  let state = { basis: aBasis, bit: aBit }
  let eBit: Bit | null = null
  if (eIntercept) {
    eBit = u[5] < bornBit(state, eBasis, 0) ? 0 : 1
    state = { basis: eBasis, bit: eBit }
  }
  const bBit: Bit = u[6] < bornBit(state, bBasis, 0) ? 0 : 1
  const kept = aBasis === bBasis
  return { n, aBit, aBasis, bBasis, bBit, eIntercept, eBasis, eBit, kept, error: kept && bBit !== aBit, eveKnows: kept && eIntercept && eBasis === aBasis }
}

/**
 * The first `count` rounds of the seeded run (seed, Eve's interception fraction: 0 = no Eve, 1 = every photon). The same
 * seed always gives the same rounds, a longer run only appends, and the Eve-free and the Eve runs share Alice's and Bob's
 * choices. Cached per (seed, fraction).
 */
export function bb84Rounds(count: number, seed: number, eve: number = 0): Bb84Round[] {
  if (!Number.isInteger(count) || count < 0 || count > MAX_ROUNDS) throw new Error(`bb84Rounds: count must be a whole number in 0…${MAX_ROUNDS}`)
  if (!(eve >= 0 && eve <= 1)) throw new Error('bb84Rounds: the interception fraction must be in [0, 1]')
  const key = `${seed >>> 0}:${eve}`
  let run = RUNS.get(key)
  if (!run) {
    if (RUNS.size > 48) RUNS.clear()
    run = { next: rng(seed), rounds: [] }
    RUNS.set(key, run)
  }
  while (run.rounds.length < count) run.rounds.push(drawRound(run.next, run.rounds.length + 1, eve))
  return run.rounds.slice(0, count)
}

export interface Bb84Tally {
  n: number
  /** Rounds that survived sifting. */
  kept: number
  /** Kept rounds with a wrong bit. */
  errors: number
  /** errors / kept, or null for an empty key. */
  qhat: number | null
  /** Photons Eve intercepted. */
  intercepted: number
  /** Kept rounds where Eve knows the bit. */
  eveKnows: number
}
export function bb84Tally(rounds: readonly Bb84Round[]): Bb84Tally {
  let kept = 0
  let errors = 0
  let intercepted = 0
  let eveKnows = 0
  for (const r of rounds) {
    if (r.eIntercept) intercepted++
    if (r.kept) kept++
    if (r.error) errors++
    if (r.eveKnows) eveKnows++
  }
  return { n: rounds.length, kept, errors, qhat: kept ? errors / kept : null, intercepted, eveKnows }
}

/** Which kept rounds the parties announce as the test sample. */
export type TestSpec = { rounds: number[] } | { size: number } | { fraction: number }

/** A uniform number for kept round n, from a fresh hash-seeded draw: the sample of a given fraction never depends on the run length. */
const sampleU = (seed: number, n: number): number => rng(((seed ^ Math.imul(n, 0x9e3779b1)) >>> 0) || 1)()

/**
 * The 1-based numbers of the tested rounds. `rounds`: exactly these (each must be a kept round); `size`: the first m kept
 * rounds (the sifted bits are random, so the first m are as good as any sample); `fraction`: each kept round independently
 * with that chance (seeded by `seed` and the round number).
 */
export function testedRounds(rounds: readonly Bb84Round[], spec: TestSpec, seed = 0): number[] {
  const kept = rounds.filter((r) => r.kept)
  if ('rounds' in spec) {
    const ok = new Set(kept.map((r) => r.n))
    return spec.rounds.filter((n) => ok.has(n))
  }
  if ('size' in spec) return kept.slice(0, Math.max(0, Math.min(kept.length, Math.floor(spec.size)))).map((r) => r.n)
  return kept.filter((r) => sampleU(seed, r.n) < spec.fraction).map((r) => r.n)
}

export interface TestResult {
  tested: number[]
  m: number
  nErr: number
  /** n_err / m, or null for an empty sample. */
  qhat: number | null
  /** Kept rounds that stay secret key candidates (not announced). */
  remaining: number[]
}
export function testResult(rounds: readonly Bb84Round[], spec: TestSpec, seed = 0): TestResult {
  const tested = testedRounds(rounds, spec, seed)
  const set = new Set(tested)
  const nErr = rounds.filter((r) => set.has(r.n) && r.error).length
  return { tested, m: tested.length, nErr, qhat: tested.length ? nErr / tested.length : null, remaining: rounds.filter((r) => r.kept && !set.has(r.n)).map((r) => r.n) }
}

/* ---------------- the notes' worked board (p. 8) ---------------- */

export interface BoardRow {
  aBasis: Basis
  aBit: Bit
  bBasis: Basis
  bBit: Bit
}
/**
 * The eight-photon example worked on the board in the notes (no Eve). The notes name the bases Z and X; here H/V and D/A.
 * The prepared states read H, A, V, D, A, H, D, V and Bob's bits 0, 1, 0, 0, 1, 0, 1, 1.
 */
export const BOARD_P8: readonly BoardRow[] = [
  { aBasis: 'HV', aBit: 0, bBasis: 'HV', bBit: 0 },
  { aBasis: 'DA', aBit: 1, bBasis: 'HV', bBit: 1 },
  { aBasis: 'HV', aBit: 1, bBasis: 'DA', bBit: 0 },
  { aBasis: 'DA', aBit: 0, bBasis: 'DA', bBit: 0 },
  { aBasis: 'DA', aBit: 1, bBasis: 'DA', bBit: 1 },
  { aBasis: 'HV', aBit: 0, bBasis: 'HV', bBit: 0 },
  { aBasis: 'DA', aBit: 0, bBasis: 'HV', bBit: 1 },
  { aBasis: 'HV', aBit: 1, bBasis: 'DA', bBit: 1 },
]

export interface BoardCheck {
  /** Every row is physically possible: matched bases agree with certainty, mismatched outcomes have chance > 0. */
  ok: boolean
  /** 1-based kept rounds (matched bases). */
  kept: number[]
  /** Mismatched rounds whose bits happen to agree (agreement by luck: dropped too). */
  luck: number[]
  alice: string
  bob: string
  problems: string[]
}
/** Sift a board: matched rows must be certain, every row's Bob bit must have chance > 0. */
export function checkBoard(board: readonly BoardRow[]): BoardCheck {
  const kept: number[] = []
  const luck: number[] = []
  const problems: string[] = []
  board.forEach((r, i) => {
    const n = i + 1
    const p = bornBit({ basis: r.aBasis, bit: r.aBit }, r.bBasis, r.bBit)
    if (p <= 0) problems.push(`round ${n}: Bob's bit has chance 0`)
    if (r.aBasis === r.bBasis) {
      kept.push(n)
      if (p < 1 - 1e-12) problems.push(`round ${n}: matched bases must agree with certainty`)
    } else if (r.aBit === r.bBit) luck.push(n)
  })
  const str = (side: 'aBit' | 'bBit') => kept.map((n) => String(board[n - 1][side])).join('')
  return { ok: problems.length === 0, kept, luck, alice: str('aBit'), bob: str('bBit'), problems }
}
