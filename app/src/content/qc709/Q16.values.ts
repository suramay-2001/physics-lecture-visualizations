/**
 * Chapter Q16 numbers (Physics 709, "One query, many answers: Deutsch–Jozsa and Bernstein–Vazirani"), computed once with the engine.
 * Plan: docs/roles/proposals/P-Q16-story.md; rulings docs/roles/decisions/qc709-Q15Q17.md.
 *
 * Every number a learner reads in Q16 comes from `V` and is backed by a keyed claim (content.test.tsx "claims hold"); the numpy twin of
 * each key is in physics/__fixtures__/claims-qc709/q16.json (pipeline/claims_qc709/q16.py, an independent route: explicit dense matrices,
 * parities from strings of bits, an exact count over every balanced function, never physics/qc/oracles.ts). Keys start with `q16` and are
 * unique across both courses.
 *
 * Running examples (ruling R1): Deutsch–Jozsa on n = 3 with F_BALN (balanced, not linear) and F_BAL = x·101; Bernstein–Vazirani on n = 4
 * with a = 1011, b = 1. The circuits come from the engine (`djCircuit`, `bvCircuit`, `hadamardRun`, `queryCircuit`); every amplitude view in
 * the story is the phase form (ruling R2), and Bergou's ancilla circuit is drawn only in the first Deutsch–Jozsa beat and the classical
 * queries (no clue draws it). The closed forms the story quotes are checked against the circuits' own states before they are
 * exported (a mismatch throws, so a wrong engine never reaches a page).
 */
import { abs2 } from '../../physics/complex'
import type { Vec } from '../../physics/linalg'
import { type Bit, dotMod2, isBalanced, isConstant } from '../../physics/qc/bits'
import { type Circuit, runCircuit } from '../../physics/qc/circuit'
import {
  bvCircuit,
  bvClassicalRun,
  bvTable,
  djCircuit,
  djDeterministicWorst,
  djMinimaxQueries,
  djOutputAmplitude,
  djRandomMiss,
  dotOddCount,
  hadamardColumn,
  hadamardRun,
  queryCircuit,
  signMean,
  walshSum,
} from '../../physics/qc/oracles'
import { meanAmplitude } from '../../physics/qc/state'
import { claimKey, close, d, keyedClaim, pct, tf, uf } from '../claimKit'

/* ---------------------------------------------------------------------------------------------- */
/* The functions (plan "Conventions"): n = 3 tables f[x], x read q0-first; Bernstein–Vazirani a = 1011, b = 1.                      */
/* ---------------------------------------------------------------------------------------------- */
/** Balanced, not linear: 1 on the strings 001, 010, 011, 100 (a table the Deutsch–Jozsa circuit reads without being of the form a·x ⊕ b). */
export const F_BALN: Bit[] = [0, 1, 1, 1, 1, 0, 0, 0]
/** Balanced and linear: f(x) = x·101. */
export const F_BAL: Bit[] = bvTable(0b101, 0, 3)
/** Constant 1. */
export const F_ONE: Bit[] = [1, 1, 1, 1, 1, 1, 1, 1]
export const BV_A = 0b1011
export const BV_B = 1

/* ---------------------------------------------------------------------------------------------- */
/* The circuits, memoised so a story's stage states share one object per circuit (C_* names are the plan's).                        */
/* ---------------------------------------------------------------------------------------------- */
const memo = new Map<string, Circuit>()
const once = (key: string, make: () => Circuit): Circuit => {
  let C = memo.get(key)
  if (!C) memo.set(key, (C = make()))
  return C
}
/** C_H1: one H on |1⟩. */
export const C_H1: Circuit = hadamardRun(1, 1)
/** C_H2(x): an H on each of two wires, from the string x. */
export const C_H2 = (x: number): Circuit => once(`h2:${x}`, () => hadamardRun(x, 2))
/** C_H3(x): an H on each of three wires. */
export const C_H3 = (x: number): Circuit => once(`h3:${x}`, () => hadamardRun(x, 3))
/** C_HH3(x): two columns of H on three wires. */
export const C_HH3 = (x: number): Circuit => once(`hh3:${x}`, () => hadamardRun(x, 3, true))
/** C_DJA(f): Bergou's Fig. 7.1, n input wires and a target in |−⟩ (the ancilla form). */
export const C_DJA = (f: readonly Bit[]): Circuit => once(`dja:${f.join('')}`, () => djCircuit(f, 'ancilla'))
/** C_DJ(f): the same circuit in its phase form (the target's |−⟩ folded into a phase oracle: kickback). */
export const C_DJ = (f: readonly Bit[]): Circuit => once(`dj:${f.join('')}`, () => djCircuit(f, 'phase'))
/** C_CLQ(x): one classical query of F_BALN at the string x (the f-CNOT alone, target 0 in). */
export const C_CLQ = (x: number): Circuit => once(`clq:${x}`, () => queryCircuit(F_BALN, x))
/** C_BV: Bernstein–Vazirani for a = 1011, b = 1 (phase form). */
export const C_BV: Circuit = bvCircuit(BV_A, BV_B, 4)
/** C_BVQ(x): one classical query of f(x) = 1011·x ⊕ 1 (five wires: the stage maximum). */
export const C_BVQ = (x: number): Circuit => once(`bvq:${x}`, () => queryCircuit(bvTable(BV_A, BV_B, 4), x))

/* ---------------------------------------------------------------------------------------------- */
/* The simulations the story reads                                                                  */
/* ---------------------------------------------------------------------------------------------- */
const states = (C: Circuit): Vec[] => runCircuit(C).states
const probAt = (psi: Vec, i: number): number => abs2(psi[i])
/** The bit on the target wire of a one-query run: the last bit of the basis string that carries the chance. */
const targetOf = (C: Circuit): number => {
  const psi = states(C).at(-1)!
  const k = psi.findIndex((z) => abs2(z) > 0.5)
  if (k < 0) throw new Error('Q16.values: a classical query must end in one basis string')
  return k & 1
}

const H1 = states(C_H1).at(-1)!
const H2 = states(C_H2(0b11)).at(-1)!
const H3 = states(C_H3(0b101))
const HH3 = states(C_HH3(0b101))
const BALN = states(C_DJ(F_BALN))
const ONE = states(C_DJ(F_ONE))
const BAL = states(C_DJ(F_BAL))
const BVS = states(C_BV)

// the closed forms must equal the simulations, or no page may show them
for (const [what, gap] of [
  ['H^n|101> against 2^(-n/2)(-1)^(x.z)', Math.max(...H3[1].map((z, i) => Math.abs(z.re - hadamardColumn(0b101, 3)[i])))],
  ['Eq. 7.7 for F_BALN', Math.abs(BALN[3][0].re - djOutputAmplitude(F_BALN))],
  ['Eq. 7.7 for F_ONE', Math.abs(ONE[3][0].re - djOutputAmplitude(F_ONE))],
  ['mean of the signs against the mean line', Math.abs(meanAmplitude(BALN[2]).re * Math.sqrt(8) - signMean(F_BALN))],
  ['Eq. 7.12 for a = 1011', Math.abs(BVS[3][BV_A].re - (BV_B ? -1 : 1))],
  ['F_BALN: chance 1/4 on each of 100–111 and none on 000–011', Math.max(...BALN[3].map((z, i) => Math.abs(abs2(z) - (i >= 4 ? 0.25 : 0))))],
] as const)
  if (gap > 1e-12) throw new Error(`Q16.values: ${what} disagrees with the circuit (gap ${gap})`)
// the closed form of the exact classical cost is the exact minimax for every n the minimax can reach
for (const n of [1, 2, 3]) if (djMinimaxQueries(n) !== djDeterministicWorst(n)) throw new Error(`Q16.values: the minimax and 2^(n-1)+1 disagree at n = ${n}`)

/** Every pair (a, b) of four bits: the function is balanced exactly when a ≠ 0, and constant when a = 0. */
let balIffA = 1
for (let a = 0; a < 16; a++)
  for (const b of [0, 1] as const) {
    const t = bvTable(a, b, 4)
    if (isBalanced(t) !== (a !== 0) || isConstant(t) !== (a === 0)) balIffA = 0
  }

const classicalBv = bvClassicalRun(bvTable(BV_A, BV_B, 4), 4)

export const V = {
  /* q16-hadamard-n */
  q16H1Bar: Math.abs(H1[0].re),
  q16H1Minus: H1[1].re,
  q16H2Pos: H2[0].re,
  q16H2Neg: H2[1].re,
  q16H3Amp: Math.abs(H3[1][0].re),
  q16H3Mean: meanAmplitude(H3[1]).re,
  q16H3ZeroMean: meanAmplitude(states(C_H3(0))[1]).re, // the all-plus column of H^{⊗3}|000⟩: eight equal bars, mean 1/√8
  q16HHBack: probAt(HH3[2], 0b101),
  q16WalshZ010: walshSum(0b010, 3),
  q16WalshZ000: walshSum(0, 3),
  q16MinusCount: dotOddCount(0b101, 3),
  q16DotPair: dotMod2(0b1011, 0b1101),

  /* q16-dj */
  q16DjBar: Math.abs(BALN[2][0].re),
  q16DjMean: meanAmplitude(BALN[2]).re,
  q16DjBalnZero: probAt(BALN[3], 0),
  q16DjBalnP: probAt(BALN[3], 0b100),
  q16DjConstAmp: ONE[3][0].re,
  q16DjOneMean: meanAmplitude(ONE[2]).re,
  q16DjBalLands: probAt(BAL[3], 0b101),

  /* q16-classical-cost */
  q16ClqBit: targetOf(C_CLQ(0b011)),
  q16ClqBit110: targetOf(C_CLQ(0b110)),
  q16DetWorst3: djDeterministicWorst(3),
  q16MinimaxN3: djMinimaxQueries(3),
  q16DetWorst10: djDeterministicWorst(10),
  q16Miss8k3: djRandomMiss(8, 3),
  q16Miss1024k10: djRandomMiss(1024, 10),

  /* q16-bv */
  q16BvClassical: classicalBv.asked.length,
  q16BvQ1000: targetOf(C_BVQ(0b1000)),
  q16BvAmp: BVS[3][BV_A].re,
  q16BvP: probAt(BVS[3], BV_A),
  q16BvPreAmp: Math.abs(BVS[2][0].re),
  q16BalIffA: balIffA,
} as const

export type ValueKey = keyof typeof V
export const claim = keyedClaim<ValueKey>()
export { claimKey, close, d, pct, tf, uf }
