/**
 * The GHZ game's verdicts (Lecture 10, rulings 448-L8L11 L10 R7): every answer is decided by the engine (physics/qc/ghz.ts), never by the
 * level data (arcade/games.ts holds only what each option CLAIMS). Loaded with the game page, so the main chunk stays engine-free.
 */
import { rng } from '../physics/random'
import { GHZ_ROWS, type GhzRow, type GhzTable, ghzGame, ghzRun, ghzState, ghzTableResult } from '../physics/qc/ghz'
import type { GhzLevel, GhzOption } from './games'

/** A plan from the six answers A_Z, A_X, B_Z, B_X, C_Z, C_X. */
export function planOf(answers: readonly (1 | -1)[]): GhzTable {
  if (answers.length !== 6) throw new Error('planOf: six answers')
  return [
    { Z: answers[0], X: answers[1] },
    { Z: answers[2], X: answers[3] },
    { Z: answers[4], X: answers[5] },
  ]
}

/** The seeded run of the shared state a 'share' level plays: how many rounds are won, and how many times Alice answers −1. */
export function shareRun(l: GhzLevel): { rounds: number; wins: number; aliceMinus: number } {
  const rounds = ghzRun({ state: ghzState() }, l.rounds ?? 20, rng(l.seed ?? 7))
  return { rounds: rounds.length, wins: rounds.filter((r) => r.win).length, aliceMinus: rounds.filter((r) => r.answers[0] === -1).length }
}

/** The input a plan loses when it loses exactly one (null when it loses none or several). */
export function lostInput(table: GhzTable): GhzRow | null {
  const r = ghzTableResult(table)
  const lost = GHZ_ROWS.filter((row) => !r.win[row])
  return lost.length === 1 ? lost[0] : null
}

export type GhzGuess = { table: GhzTable } | { option: GhzOption }

/** Is this guess right for this level? The engine decides: the plan's wins, the two products, the seeded run, the input lost. */
export function ghzVerdict(l: GhzLevel, g: GhzGuess): boolean {
  if (l.kind === 'plan') return 'table' in g && ghzTableResult(g.table).wins === l.wins
  if (!('option' in g)) return false
  const o = g.option
  if (l.kind === 'reason') {
    const game = ghzGame()
    return o.reason !== undefined && game.rowsProduct === o.reason.rows && game.targetsProduct === o.reason.needs
  }
  if (l.kind === 'share') return o.wins !== undefined && shareRun(l).wins === o.wins
  return o.input !== undefined && lostInput(planOf(l.plan ?? [])) === o.input
}

/** What a wrong plan wins, for the level's note: "wins 2 of 4" never happens (a plan wins 1 or 3), but a level may still ask for something else. */
export const winsOf = (table: GhzTable): number => ghzTableResult(table).wins
