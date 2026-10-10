/**
 * The GHZ game of Physics 448 Lecture 10 (the notes' three-player game; Mermin's argument in its game form). Alice, Bob and
 * Charlie agree a plan, then cannot talk. The referee hands them one of four instruction strings ZZZ, ZXX, XZX, XXZ (a letter per
 * player, the setting that player measures) and each player answers ±1. They win when the product of the three answers is +1 for
 * ZZZ and −1 for the other three (equivalently: an even number of −1 answers for ZZZ, an odd number for the rest).
 *
 * Two ways to play, both here:
 *  - a classical plan is an INSTRUCTION TABLE: six fixed answers A_Z, A_X, B_Z, B_X, C_Z, C_X (`instructionSets`: 64 tables);
 *  - the quantum plan shares a three-spin state, each player measures the letter they are shown and reports the ±1 result.
 * Every verdict a learner reads comes from here: the classical bound ¾ is the best of the 64 tables, the quantum win chance is
 * (1 + target · ⟨P⟩)/2 per input, and a round is sampled from the Born chances of the three local measurements.
 */
import { type Vec } from '../linalg'
import { instructionSets, type InstructionSet, type Sign } from './bits'
import { pauliString } from './gates'
import { expectationN, localBasisProbs, sampleCounts } from './measure'
import { nQubits, superpose } from './state'

/** The referee's four instruction strings, one letter per player (Alice, Bob, Charlie). */
export const GHZ_ROWS = ['ZZZ', 'ZXX', 'XZX', 'XXZ'] as const
export type GhzRow = (typeof GHZ_ROWS)[number]
/** The product the three answers must have to win each input: +1 for ZZZ, −1 for the other three. */
export const GHZ_TARGET: Readonly<Record<GhzRow, Sign>> = { ZZZ: 1, ZXX: -1, XZX: -1, XXZ: -1 }
/** The shared state that wins every round: ½(|000⟩ − |011⟩ − |101⟩ − |110⟩), the notes' |G⟩. */
export const GHZ_TERMS = '000-011-101-110'
export const ghzState = (): Vec => superpose(GHZ_TERMS)

/** One player's fixed answer to each of the two letters. */
export type GhzSheet = { Z: Sign; X: Sign }
/** A classical plan: Alice's, Bob's and Charlie's answer sheets. */
export type GhzTable = [GhzSheet, GhzSheet, GhzSheet]

/** How a table fares on the four inputs. */
export interface GhzTableResult {
  /** the product of the three answers on each input */
  values: Record<GhzRow, Sign>
  /** true where the product meets the target */
  win: Record<GhzRow, boolean>
  /** how many of the four inputs it wins */
  wins: number
}

/** Score one table: its row products, which inputs it wins and how many. */
export function ghzTableResult(table: GhzTable): GhzTableResult {
  const values = {} as Record<GhzRow, Sign>
  const win = {} as Record<GhzRow, boolean>
  for (const r of GHZ_ROWS) {
    values[r] = [...r].reduce((prod, ch, p) => (prod * table[p][ch as 'Z' | 'X']) as Sign, 1 as Sign)
    win[r] = values[r] === GHZ_TARGET[r]
  }
  return { values, win, wins: GHZ_ROWS.filter((r) => win[r]).length }
}

export interface GhzGame {
  /** all 2⁶ = 64 tables, scored */
  tables: { table: GhzTable; result: GhzTableResult }[]
  /** the most inputs any table wins (3) */
  maxWins: number
  /** the best classical chance of winning a uniformly random input: maxWins/4 (¾) */
  classicalBound: number
  /** how many tables win exactly k inputs, keyed by k: {1: 32, 3: 32} */
  histogram: Record<number, number>
  /** the product of the four row values: +1 for EVERY table (each answer appears twice) */
  rowsProduct: Sign | null
  /** the product of the four targets: −1 */
  targetsProduct: Sign
}

/** The whole classical game: all 64 instruction tables, their wins, the ¾ ceiling and the +1 versus −1 contradiction. */
export function ghzGame(): GhzGame {
  const g = instructionSets(GHZ_ROWS, GHZ_TARGET, ['Z', 'X'])
  const tables = g.assignments.map((s: InstructionSet) => {
    const table = s.answers.map((a) => ({ Z: a.Z, X: a.X })) as GhzTable
    return { table, result: ghzTableResult(table) }
  })
  return { tables, maxWins: g.maxMatches, classicalBound: g.maxMatches / GHZ_ROWS.length, histogram: g.histogram, rowsProduct: g.rowsProduct, targetsProduct: g.targetsProduct }
}

/**
 * The shared state's chance of winning each input, (1 + target · ⟨P⟩)/2 with P the product observable of that input's letters
 * (`expectationN` of the Pauli string), and the average over the four equally likely inputs. For |G⟩ every input is exactly 1.
 */
export function ghzQuantumWin(psi: Vec): { perInput: { row: GhzRow; expectation: number; win: number }[]; mean: number } {
  if (nQubits(psi) !== 3) throw new Error('ghzQuantumWin: the state needs three spins')
  const perInput = GHZ_ROWS.map((row) => {
    const expectation = expectationN(psi, pauliString(row)).re
    return { row, expectation, win: (1 + GHZ_TARGET[row] * expectation) / 2 }
  })
  return { perInput, mean: perInput.reduce((s, x) => s + x.win, 0) / perInput.length }
}

/** Triples of answers in the order of the outcome string: 000, 001, …, 111, where bit 0 is the answer +1 and bit 1 is −1. */
export const GHZ_ANSWER_TRIPLES: readonly [Sign, Sign, Sign][] = Array.from({ length: 8 }, (_, i) => [0, 1, 2].map((k) => (((i >> (2 - k)) & 1) === 1 ? -1 : 1)) as [Sign, Sign, Sign])

/** The eight chances of the answer triples when each player measures the letter of `row` on ψ (`localBasisProbs`). */
export function ghzAnswerProbs(psi: Vec, row: GhzRow): number[] {
  if (nQubits(psi) !== 3) throw new Error('ghzAnswerProbs: the state needs three spins')
  return localBasisProbs(psi, [...row].map((ch) => ch.toLowerCase()) as ('x' | 'z')[])
}

/** How the players play: a fixed table, or a shared three-spin state they measure. */
export type GhzStrategy = { table: GhzTable } | { state: Vec }

export interface GhzRound {
  row: GhzRow
  /** Alice's, Bob's and Charlie's answers */
  answers: [Sign, Sign, Sign]
  /** their product */
  product: Sign
  /** the product meets the target for this input */
  win: boolean
}

/**
 * One round on the referee's input `row`. A table answers by lookup; a state answers by sampling the Born chances of the three local
 * measurements (`rand` is a seeded generator, so a run can be replayed).
 */
export function ghzRound(strategy: GhzStrategy, row: GhzRow, rand: () => number): GhzRound {
  let answers: [Sign, Sign, Sign]
  if ('table' in strategy) {
    answers = [0, 1, 2].map((p) => strategy.table[p][row[p] as 'Z' | 'X']) as [Sign, Sign, Sign]
  } else {
    const counts = sampleCounts(ghzAnswerProbs(strategy.state, row), 1, rand)
    answers = [...GHZ_ANSWER_TRIPLES[counts.indexOf(1)]]
  }
  const product = (answers[0] * answers[1] * answers[2]) as Sign
  return { row, answers, product, win: product === GHZ_TARGET[row] }
}

/**
 * `n` rounds in a row: the referee draws each input uniformly from the four strings (from `rand`), then the strategy answers.
 * The same generator drives both, so one seed replays the whole run. Pass the SAME `rand` to run a table and a state side by side
 * and use `ghzReferee` for the shared inputs.
 */
export function ghzRun(strategy: GhzStrategy, n: number, rand: () => number): GhzRound[] {
  return Array.from({ length: n }, () => ghzRound(strategy, ghzReferee(rand), rand))
}

/** The referee's input for one round: uniform over the four strings. */
export const ghzReferee = (rand: () => number): GhzRow => GHZ_ROWS[Math.min(3, Math.floor(rand() * 4))]

/* ----------------------------------------------- the two-player warm-up of Unit 4 ----------------------------------------------- */

/** The two-player cousin of the game: ZZ must multiply to −1 and so must XX (the singlet's matched-axis correlations). */
export const PAIR_ROWS = ['ZZ', 'XX'] as const
export const PAIR_TARGET: Readonly<Record<'ZZ' | 'XX', Sign>> = { ZZ: -1, XX: -1 }
export type PairPlan = [GhzSheet, GhzSheet]

/** How a two-player plan fares: the product of the two answers for ZZ and for XX, and whether each meets its −1. */
export function pairPlanResult(plan: PairPlan): { values: Record<'ZZ' | 'XX', Sign>; match: Record<'ZZ' | 'XX', boolean>; matches: number } {
  const values = { ZZ: (plan[0].Z * plan[1].Z) as Sign, XX: (plan[0].X * plan[1].X) as Sign }
  const match = { ZZ: values.ZZ === PAIR_TARGET.ZZ, XX: values.XX === PAIR_TARGET.XX }
  return { values, match, matches: Number(match.ZZ) + Number(match.XX) }
}

/** The plans that match both ZZ = −1 and XX = −1: 4 of the 16 (`instructionSets`: Bob's sheet is minus Alice's). */
export function pairPlansThatMatch(): { plans: PairPlan[]; of: number } {
  const g = instructionSets(PAIR_ROWS, PAIR_TARGET, ['Z', 'X'])
  const plans = g.assignments.filter((a) => a.matches === PAIR_ROWS.length).map((a) => a.answers.map((s) => ({ Z: s.Z, X: s.X })) as PairPlan)
  return { plans, of: g.assignments.length }
}

/**
 * `n` pairs from a source that hides its choice: each pair gets one of the plans that match, picked uniformly from `rand`, and both
 * players measure `setting` (Z or X) and read their sheet's answer. Alice's answers come out about half +1 although every plan is a
 * fixed table, and Bob's is always the opposite of hers.
 */
export function pairRun(setting: 'Z' | 'X', n: number, rand: () => number): { alice: Sign; bob: Sign }[] {
  const { plans } = pairPlansThatMatch()
  return Array.from({ length: n }, () => {
    const plan = plans[Math.min(plans.length - 1, Math.floor(rand() * plans.length))]
    return { alice: plan[0][setting], bob: plan[1][setting] }
  })
}
