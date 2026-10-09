/**
 * Catch Eve's verdicts (Lecture 8; rulings 448-L8L11 L8 R7): every answer is the seeded BB84 engine's (physics/bb84.ts), the same
 * functions the `bb84` ledger and the `bb84-bench` call. arcade/games.ts holds the levels' DATA only (it is in the main chunk);
 * this module is loaded with the game page and by the tests. Nothing here is shown to a player before they answer.
 */
import { BOARD_P8, bb84ErrorProb, bb84Q, bb84Rounds, bb84Tally, checkBoard, minTestSize, missProb, stateLetter, type Basis } from '../physics/bb84'
import type { CatchEveLevel } from './games'

/** The error rate of the full intercept–resend attack: Eve's average over her two basis choices. */
export const eveQ = (): number => bb84Q(1)

/** What the level asks for, from the engine: the kept rounds, a chance, a test size, or the range of test sizes that work. */
export type CatchEveAnswer =
  | { kind: 'rounds'; rounds: number[] }
  | { kind: 'value'; value: number }
  | { kind: 'size'; m: number }
  | { kind: 'range'; lo: number; hi: number; sifted: number }

export function catchEveAnswer(l: CatchEveLevel): CatchEveAnswer {
  switch (l.id) {
    case 'ce-sift':
      return { kind: 'rounds', rounds: checkBoard(BOARD_P8).kept }
    case 'ce-one-round': {
      // Alice sends D (bit 0 in D/A), Bob measures in D/A, Eve intercepts in H/V
      const D: { basis: Basis; bit: 0 } = { basis: 'DA', bit: 0 }
      return { kind: 'value', value: bb84ErrorProb({ alice: D, bob: { basis: 'DA' }, eve: { basis: 'HV' } }) }
    }
    case 'ce-average':
      return { kind: 'value', value: eveQ() }
    case 'ce-test-size':
      return { kind: 'size', m: minTestSize(eveQ(), 0.01) }
    case 'ce-budget': {
      const b = l.budget!
      const sifted = bb84Tally(bb84Rounds(b.photons, b.seed, 1)).kept
      return { kind: 'range', lo: minTestSize(eveQ(), b.risk), hi: sifted - b.keep, sifted }
    }
    default:
      throw new Error(`catchEveAnswer: unknown level ${l.id}`)
  }
}

/** The player's answer to a level: the tapped rounds, an option's number, or a test size. */
export type CatchEveGuess = { rounds: number[] } | { value: number } | { m: number }

export function catchEveVerdict(l: CatchEveLevel, guess: CatchEveGuess): boolean {
  const a = catchEveAnswer(l)
  if (a.kind === 'rounds') return 'rounds' in guess && new Set(guess.rounds).size === a.rounds.length && a.rounds.every((n) => guess.rounds.includes(n))
  if (a.kind === 'value') return 'value' in guess && Math.abs(guess.value - a.value) < 1e-9
  if (a.kind === 'size') return 'm' in guess && guess.m === a.m
  return 'm' in guess && Number.isInteger(guess.m) && guess.m >= a.lo && guess.m <= a.hi
}

/** The budget level's live numbers for a test size m: the chance Eve shows no error, and the secret bits left after the test. */
export function budgetState(l: CatchEveLevel, m: number): { sifted: number; miss: number; left: number; caught: boolean; enough: boolean } {
  const b = l.budget!
  const sifted = bb84Tally(bb84Rounds(b.photons, b.seed, 1)).kept
  const miss = missProb(eveQ(), m)
  return { sifted, miss, left: sifted - m, caught: miss <= b.risk, enough: sifted - m >= b.keep }
}

/** The notes' board as rows for the sift level: Alice's state and basis, Bob's basis and bit (round numbers from 1). */
export function boardRows() {
  return BOARD_P8.map((r, i) => ({ n: i + 1, aBasis: r.aBasis, aBit: r.aBit, aState: stateLetter(r.aBasis, r.aBit), bBasis: r.bBasis, bBit: r.bBit }))
}

/** The sifted keys of the notes' board (Alice's and Bob's kept bits, in order). */
export function boardKey(): { alice: string; bob: string } {
  const c = checkBoard(BOARD_P8)
  return { alice: c.alice, bob: c.bob }
}

/** The chance that a test of m sifted bits shows no error under the full attack. */
export const noErrorChance = (m: number): number => missProb(eveQ(), m)
