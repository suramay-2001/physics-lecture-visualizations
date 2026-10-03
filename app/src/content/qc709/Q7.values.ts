/**
 * Chapter Q7 numbers and circuits (Physics 709, "GHZ and Mermin: certainty without instructions"), computed once
 * with the engine. Plan: docs/roles/proposals/P-Q7-story.md; rulings docs/roles/decisions/qc709-remap.md,
 * qc709-Q6Q7.md.
 *
 * Every number a learner reads in Q7 comes from `V` and is backed by a keyed claim (content.test.tsx "claims hold");
 * the numpy twin of each key is in physics/__fixtures__/claims-qc709/q7.json (pipeline/claims_qc709/q7.py, an
 * independent route: it builds every bracket from explicit numpy bras/kets, never from this file's own helpers).
 * Keys start with `q7` and are unique across both courses.
 *
 * Engine note (found while building this chapter, reported, not fixed here — W-709 agents own physics/**):
 * `physics/qc/bits.ts` `merminInstructionSets()` scores each hidden-variable card against an internal
 * `MERMIN_TARGET = { XXX: -1, XYY: 1, YXY: 1, YYX: 1 }` that is the sign-reversed opposite of this course's own
 * `pauliEigenvalue(ghz(3), ·)` on all four strings (XXX: +1, YYX = YXY = XYY: -1, for GHZ = (|000⟩+|111⟩)/√2). The
 * aggregate histogram and `maxMatches` (3) are unaffected (the two targets are complementary: matches against one
 * equal 4 − matches against the other, and the 64-assignment histogram 0,32,0,32,0 is symmetric under that swap),
 * but a SPECIFIC assignment's own `.matches` field describes the wrong target. This file never reads `.matches`:
 * it recomputes each card's match count against the engine's own `pauliEigenvalue` values, combining
 * `merminInstructionSets().assignments[i].values` (pure card arithmetic, target-independent) with
 * `pauliEigenvalue(ghz(3), s)` (the actual quantum values) directly.
 */
import { abs, abs2, add, arg, c, type C, scale, sub } from '../../physics/complex'
import { apply, commutator, identity, inner, matmul, maxDiff, type Mat, mscale, type Vec, vscale } from '../../physics/linalg'
import { KET } from '../../physics/spin'
import { ghz, kronAll } from '../../physics/qc/state'
import type { Circuit, GateOp } from '../../physics/qc/circuit'
import { runCircuit } from '../../physics/qc/circuit'
import { X, Y, pauliEigenvalue, pauliMul, pauliString, paulisCommute } from '../../physics/qc/gates'
import { expectationN, localBasisProbs, postMeasure, probs, varianceN, weightStats } from '../../physics/qc/measure'
import { merminInstructionSets } from '../../physics/qc/bits'
import { claimKey, close, d, keyedClaim, pct, tf, uf } from '../claimKit'

/* ---------------------------------------------------------------------------------------------- */
/* Small helpers                                                                                    */
/* ---------------------------------------------------------------------------------------------- */

const maxAbsMat = (M: Mat): number => Math.max(...M.flatMap((row) => row.map((x) => abs(x))))
const maxDiffVec = (a: Vec, b: Vec): number => Math.max(...a.map((x, i) => abs(sub(x, b[i]))))
const eigOrThrow = (psi: Vec, s: string): 1 | -1 => {
  const e = pauliEigenvalue(psi, s)
  if (e === null) throw new Error(`Q7.values: ${s} is not an eigenstate here`)
  return e
}

const G3 = ghz(3) // (|000⟩ + |111⟩)/√2

const BASIS_KET: Record<'x' | 'y', Record<1 | -1, Vec>> = {
  x: { 1: KET['+x'], [-1]: KET['-x'] },
  y: { 1: KET['+y'], [-1]: KET['-y'] },
}
/** The product ket |ε₁b₁,ε₂b₂,ε₃b₃⟩ of one run. */
const runKet = (bases: readonly ('x' | 'y')[], eps: readonly (1 | -1)[]): Vec => kronAll(bases.map((b, k) => BASIS_KET[b][eps[k]]))
/** ⟨ε₁b₁,ε₂b₂,ε₃b₃|GHZ⟩, by direct inner product — never via `runBracket` (whose merged signature returns the
 * AGGREGATE product-observable expectation over every outcome, not one outcome's complex bracket; see the plan's
 * engine-gap note, P-Q7-story.md §9.1, against the merged `measure.ts`). */
const ghzBracket = (bases: readonly ('x' | 'y')[], eps: readonly (1 | -1)[]): C => inner(runKet(bases, eps), G3)
/** s = 4·⟨run|GHZ⟩ − 1, the plan's single complex number per run (notes Eq. 2.9–2.10). */
const sOfRun = (bases: readonly ('x' | 'y')[], eps: readonly (1 | -1)[]): C => sub(scale(ghzBracket(bases, eps), 4), c(1))
/** P = |1 + s|²/16 (notes Eq. 2.10). */
const p1s = (s: C): number => abs2(add(c(1), s)) / 16

/* ---------------------------------------------------------------------------------------------- */
/* Circuits (physics/qc/circuit.ts format). Every named circuit below STARTS with C_GHZ's own three columns.       */
/* ---------------------------------------------------------------------------------------------- */
const g = (gate: GateOp['gate'], target: number, controls?: number[]): GateOp => ({ op: 'gate', gate, targets: [target], ...(controls ? { controls } : {}) })

/** H on qubit 1, then CNOT 1→2, then CNOT 1→3: |000⟩ → GHZ. */
export const C_GHZ: Circuit = {
  version: 1,
  qubits: 3,
  init: '000',
  wires: ['1', '2', '3'],
  columns: [[g('H', 0)], [g('X', 1, [0])], [g('X', 2, [0])]],
}
/** C_GHZ then a terminal reading of qubit q (0-indexed): |000⟩ or |111⟩ survive. */
export const C_GHZM = (q: number): Circuit => ({ ...C_GHZ, clbits: 1, columns: [...C_GHZ.columns, [{ op: 'measure', qubit: q, bit: 0 }]] })
/** C_GHZ then X on every qubit: XXX is GHZ's own +1 eigenvector, so the state is unchanged. */
export const C_GHZ_XXX: Circuit = { ...C_GHZ, columns: [...C_GHZ.columns, [g('X', 0), g('X', 1), g('X', 2)]] }
/** C_GHZ then Y, Y, X: YYX's eigenvalue is −1, so every amplitude flips sign. */
export const C_GHZ_YYX: Circuit = { ...C_GHZ, columns: [...C_GHZ.columns, [g('Y', 0), g('Y', 1), g('X', 2)]] }
/** C_GHZ then SWAP qubits 2, 3 (GHZ is symmetric under any relabelling of its three qubits). */
export const C_GHZ_SW: Circuit = { ...C_GHZ, columns: [...C_GHZ.columns, [{ op: 'gate', gate: 'SWAP', targets: [1, 2] }]] }
/** C_GHZ, then S† on every qubit read in y, then H on all three: the run's own outcome amplitudes, bit 0 = +1. */
export const C_RUN = (bases: readonly ('x' | 'y')[]): Circuit => ({
  ...C_GHZ,
  columns: [
    ...C_GHZ.columns,
    ...(bases.some((b) => b === 'y') ? [bases.flatMap((b, k): GateOp[] => (b === 'y' ? [g('Sdg', k)] : []))] : []),
    [g('H', 0), g('H', 1), g('H', 2)],
  ],
})

/* ---------------------------------------------------------------------------------------------- */
/* q7-ghz                                                                                           */
/* ---------------------------------------------------------------------------------------------- */
const ghzProbs = probs(G3)
const ghzByCircuit = runCircuit(C_GHZ).states.at(-1)!
const after0 = postMeasure(G3, [0], '0')
const afterQ2 = postMeasure(G3, [1], '1')
const zerosGhz = weightStats(G3, 0)
const zerosPlus = weightStats(kronAll([KET['+x'], KET['+x'], KET['+x']]), 0)

/* ---------------------------------------------------------------------------------------------- */
/* q7-brackets                                                                                      */
/* ---------------------------------------------------------------------------------------------- */
/** ζ = √2·⟨εb|1⟩ (notes Eq. 2.9): x gives ±1, y gives ∓i, from the engine's own kets, not typed signs. */
const zetaOf = (basis: 'x' | 'y', eps: 1 | -1): C => scale(inner(BASIS_KET[basis][eps], KET['-z']), Math.SQRT2)
const zetaXPlus = zetaOf('x', 1)
const zetaXMinus = zetaOf('x', -1)
const zetaYPlus = zetaOf('y', 1)
const zetaYMinus = zetaOf('y', -1)
const degOf = (z: C): number => ((arg(z) * 180) / Math.PI + 360) % 360

/* ---------------------------------------------------------------------------------------------- */
/* q7-parity-table                                                                                  */
/* ---------------------------------------------------------------------------------------------- */
const sXxxAllPlus = sOfRun(['x', 'x', 'x'], [1, 1, 1]) // s = 1
const sXxxLastMinus = sOfRun(['x', 'x', 'x'], [1, 1, -1]) // s = -1
const sXxyAllPlus = sOfRun(['x', 'x', 'y'], [1, 1, 1]) // s = -i
const bracketXxxAllPlus = ghzBracket(['x', 'x', 'x'], [1, 1, 1])
const bracketXxxLastMinus = ghzBracket(['x', 'x', 'x'], [1, 1, -1])
const bracketYyxPiPlus = ghzBracket(['y', 'y', 'x'], [1, 1, 1]) // Π = +1 (forbidden for YYX)
const bracketYyxPiMinus = ghzBracket(['y', 'y', 'x'], [1, 1, -1]) // Π = -1 (survives)

/* ---------------------------------------------------------------------------------------------- */
/* q7-bit-strings                                                                                   */
/* ---------------------------------------------------------------------------------------------- */
const tableXxx = localBasisProbs(G3, ['x', 'x', 'x'])
const tableYyx = localBasisProbs(G3, ['y', 'y', 'x'])
const tableYxy = localBasisProbs(G3, ['y', 'x', 'y'])
const tableXyy = localBasisProbs(G3, ['x', 'y', 'y'])
const tableXxy = localBasisProbs(G3, ['x', 'x', 'y'])
const tableYyy = localBasisProbs(G3, ['y', 'y', 'y'])
const singleXProb = tableXxx.slice(0, 4).reduce((a, b) => a + b, 0) // qubit 1 reads +1 in an XXX run
const runCircXxxProbs = probs(runCircuit(C_RUN(['x', 'x', 'x'])).states.at(-1)!)
const runCircYyxProbs = probs(runCircuit(C_RUN(['y', 'y', 'x'])).states.at(-1)!)

/* ---------------------------------------------------------------------------------------------- */
/* q7-observables                                                                                   */
/* ---------------------------------------------------------------------------------------------- */
const MERMIN_4 = ['XXX', 'YYX', 'YXY', 'XYY'] as const
const eigXxx = eigOrThrow(G3, 'XXX')
const eigYyx = eigOrThrow(G3, 'YYX')
const eigYxy = eigOrThrow(G3, 'YXY')
const eigXyy = eigOrThrow(G3, 'XYY')
const eigZzi = eigOrThrow(G3, 'ZZI')
const eigIzz = eigOrThrow(G3, 'IZZ')
const eigZiz = eigOrThrow(G3, 'ZIZ')
const maxSquareDiff = Math.max(...MERMIN_4.map((s) => maxDiff(matmul(pauliString(s), pauliString(s)), identity(8))))
const maxCommutatorEntry = Math.max(
  ...MERMIN_4.flatMap((a, i) => MERMIN_4.map((b, j) => (i < j ? maxAbsMat(commutator(pauliString(a), pauliString(b))) : 0))),
)
const allCommute = MERMIN_4.every((a, i) => MERMIN_4.every((b, j) => i === j || paulisCommute(a, b)))
const meanXxx = expectationN(G3, pauliString('XXX')).re
const meanYyx = expectationN(G3, pauliString('YYX')).re
const meanYxy = expectationN(G3, pauliString('YXY')).re
const meanXyy = expectationN(G3, pauliString('XYY')).re
const varXxx = varianceN(G3, pauliString('XXX'))
const varYyx = varianceN(G3, pauliString('YYX'))
const varYxy = varianceN(G3, pauliString('YXY'))
const varXyy = varianceN(G3, pauliString('XYY'))
const meanX1 = expectationN(G3, pauliString('XII')).re
const varX1 = varianceN(G3, pauliString('XII'))
const ghzXxxFinal = runCircuit(C_GHZ_XXX).states.at(-1)!
const ghzYyxFinal = runCircuit(C_GHZ_YYX).states.at(-1)!
const ghzSwFinal = runCircuit(C_GHZ_SW).states.at(-1)!
const yOnZero = apply(Y, KET['+z']) // should be i|1⟩
const yOnOne = apply(Y, KET['-z']) // should be -i|0⟩

/* ---------------------------------------------------------------------------------------------- */
/* q7-mermin                                                                                        */
/* ---------------------------------------------------------------------------------------------- */
const CORRECT_TARGET: Record<'XXX' | 'XYY' | 'YXY' | 'YYX', 1 | -1> = { XXX: eigXxx, XYY: eigXyy, YXY: eigYxy, YYX: eigYyx }
const { assignments } = merminInstructionSets()
const matchesAgainstCorrect = assignments.map((a) => (['XXX', 'XYY', 'YXY', 'YYX'] as const).filter((k) => a.values[k] === CORRECT_TARGET[k]).length)
const histogram = [0, 1, 2, 3, 4].map((n) => matchesAgainstCorrect.filter((m) => m === n).length)
const bestMatches = Math.max(...matchesAgainstCorrect)
const card1 = assignments.find((a) => a.a[0].x === 1 && a.a[0].y === 1 && a.a[1].x === 1 && a.a[1].y === 1 && a.a[2].x === 1 && a.a[2].y === -1)!
const card2 = assignments.find((a) => a.a[0].x === 1 && a.a[0].y === 1 && a.a[1].x === 1 && a.a[1].y === 1 && a.a[2].x === -1 && a.a[2].y === -1)!
const forced = card2.values.XXX // -1: forced by the three y-relations, against +1 (XXX)
const prodYyxYxy = pauliMul('YYX', 'YXY') // = +IZZ
const prodAll3 = pauliMul(prodYyxYxy.string, 'XYY') // (YYX·YXY)·XYY
const prodTotalPhase = prodYyxYxy.phase.re * prodAll3.phase.re - prodYyxYxy.phase.im * prodAll3.phase.im // real part of the product of two phases
/** The product (YYX)(YXY)(XYY) as a matrix, checked against −XXX (notes Eq. 2.13): their sum's largest entry is 0. */
const prodMatrix = matmul(matmul(pauliString('YYX'), pauliString('YXY')), pauliString('XYY'))
const ZERO_8: Mat = identity(8).map((row) => row.map(() => c(0)))
const prodPlusXxx = maxDiff(
  prodMatrix.map((row, i) => row.map((x, j) => add(x, pauliString('XXX')[i][j]))),
  ZERO_8,
)
/** The three single-qubit identities behind D7: Y·Y·X = X, Y·X·Y = −X, X·Y·Y = X (anticommutation, Chapter Q3). */
const qubit1Identity = maxDiff(matmul(matmul(Y, Y), X), X)
const qubit2Identity = maxDiff(matmul(matmul(Y, X), Y), mscale(X, -1))
const qubit3Identity = maxDiff(matmul(matmul(X, Y), Y), X)

/* ---------------------------------------------------------------------------------------------- */
/* Cross-checks against the engine's own circuit simulator                                          */
/* ---------------------------------------------------------------------------------------------- */
const KET000 = kronAll([KET['+z'], KET['+z'], KET['+z']])
const KET111 = kronAll([KET['-z'], KET['-z'], KET['-z']])
const maxDiffArr = (a: readonly number[], b: readonly number[]): number => Math.max(...a.map((x, i) => Math.abs(x - b[i])))
const ghzByCircuitMatch = maxDiffVec(ghzByCircuit, G3)
const after0Match = maxDiffVec(after0.post!, KET000)
const afterQ2Match = maxDiffVec(afterQ2.post!, KET111)
const ghzXxxMatch = maxDiffVec(ghzXxxFinal, G3)
const ghzYyxMatch = maxDiffVec(ghzYyxFinal, vscale(G3, -1))
const ghzSwMatch = maxDiffVec(ghzSwFinal, G3)
const runCircMatchXxx = maxDiffArr(runCircXxxProbs, tableXxx)
const runCircMatchYyx = maxDiffArr(runCircYyxProbs, tableYyx)

/* ---------------------------------------------------------------------------------------------- */
/* The value table                                                                                  */
/* ---------------------------------------------------------------------------------------------- */
export const V = {
  // small, reused constants (as other chapters' q#Half / q#R2)
  q7Half: 0.5,
  q7Quarter: 0.25,
  q7Eighth: 0.125,
  q7ThreeEighths: 3 / 8,
  q7R2: Math.SQRT1_2,

  /* q7-ghz */
  q7GhzAmp: abs(G3[0]), // 0.7071
  q7GhzP000: ghzProbs[0], // 0.5
  q7GhzP111: ghzProbs[7], // 0.5
  q7GhzBars: G3.length, // 8
  q7GhzFilled: ghzProbs.filter((p) => p > 1e-9).length, // 2
  q7GhzByCircuitMatch: ghzByCircuitMatch, // 0
  q7After0P: after0.p, // 0.5
  q7After0Match: after0Match, // 0
  q7AfterQ2P: afterQ2.p, // 0.5
  q7AfterQ2Match: afterQ2Match, // 0
  q7ZerosMean: zerosGhz.mean, // 1.5
  q7ZerosVar: zerosGhz.variance, // 2.25
  q7ZerosSquareMean: zerosGhz.variance + zerosGhz.mean ** 2, // 4.5, ⟨n²⟩ (Var + ⟨n⟩²)
  q7ZerosPlusMean: zerosPlus.mean, // 1.5
  q7ZerosPlusVar: zerosPlus.variance, // 0.75

  /* q7-brackets */
  q7PlusYRe: KET['+y'][0].re, // 0.7071
  q7PlusYIm: KET['+y'][1].im, // 0.7071
  q7ZetaXPlusDeg: degOf(zetaXPlus), // 0
  q7ZetaXMinusDeg: degOf(zetaXMinus), // 180
  q7ZetaYPlusDeg: degOf(zetaYPlus), // 270
  q7ZetaYMinusDeg: degOf(zetaYMinus), // 90
  q7BraMinusYZeroRe: inner(KET['-y'], KET['+z']).re, // 0.7071, ⟨−y|0⟩
  q7BraPlusYOneIm: inner(KET['+y'], KET['-z']).im, // −0.7071, Im⟨+y|1⟩

  /* q7-parity-table */
  q7S1Re: sXxxAllPlus.re, // 1
  q7S1Im: sXxxAllPlus.im, // 0
  q7SNeg1Re: sXxxLastMinus.re, // −1
  q7SNeg1Im: sXxxLastMinus.im, // 0
  q7SNegIRe: sXxyAllPlus.re, // 0
  q7SNegIIm: sXxyAllPlus.im, // −1
  q7BracketXxxAllPlus: bracketXxxAllPlus.re, // 0.5
  q7BracketXxxLastMinus: bracketXxxLastMinus.re, // 0
  q7BracketYyxPiPlus: bracketYyxPiPlus.re, // 0
  q7BracketYyxPiMinus: bracketYyxPiMinus.re, // 0.5
  q7P1AtS1: p1s(sXxxAllPlus), // 0.25
  q7P1AtSNeg1: p1s(sXxxLastMinus), // 0
  q7P1AtSNegI: p1s(sXxyAllPlus), // 0.125
  q7AbsOnePlusSNegI: abs(add(c(1), sXxyAllPlus)), // 1.41421356...

  /* q7-bit-strings */
  q7Table011: tableXxx[3], // 0.25
  q7Table010: tableXxx[2], // 0
  q7TableYxy000: tableYxy[0], // 0
  q7TableXxy101: tableXxy[5], // 0.125
  q7TableXyy001: tableXyy[1], // 0.25
  q7TableYyy000: tableYyy[0], // 0.125
  q7SingleXProb: singleXProb, // 0.5
  q7RunCircMatchXxx: runCircMatchXxx, // 0
  q7RunCircMatchYyx: runCircMatchYyx, // 0

  /* q7-observables */
  q7EigXxx: eigXxx, // 1
  q7EigYyx: eigYyx, // −1
  q7EigYxy: eigYxy, // −1
  q7EigXyy: eigXyy, // −1
  q7EigZzi: eigZzi, // 1
  q7EigIzz: eigIzz, // 1
  q7EigZiz: eigZiz, // 1
  q7Square: maxSquareDiff, // 0
  q7Comm: maxCommutatorEntry, // 0
  q7CommuteFlag: allCommute ? 1 : 0, // 1
  q7MeanXxx: meanXxx, // 1
  q7MeanYyx: meanYyx, // −1
  q7MeanYxy: meanYxy, // −1
  q7MeanXyy: meanXyy, // −1
  q7VarXxx: varXxx, // 0
  q7VarYyx: varYyx, // 0
  q7VarYxy: varYxy, // 0
  q7VarXyy: varXyy, // 0
  q7MeanX1: meanX1, // 0
  q7VarX1: varX1, // 1
  q7GhzXxxMatch: ghzXxxMatch, // 0
  q7GhzYyxMatch: ghzYyxMatch, // 0
  q7GhzSwMatch: ghzSwMatch, // 0
  q7YZeroIm: yOnZero[1].im, // 1
  q7YOneIm: yOnOne[0].im, // −1

  /* q7-mermin */
  q7MerminTotal: assignments.length, // 64
  q7MerminBest: bestMatches, // 3
  q7MerminHist0: histogram[0], // 0
  q7MerminHist1: histogram[1], // 32
  q7MerminHist2: histogram[2], // 0
  q7MerminHist3: histogram[3], // 32
  q7MerminHist4: histogram[4], // 0
  q7Card1Yyx: card1.values.YYX, // 1
  q7Card1Yxy: card1.values.YXY, // −1
  q7Card1Xyy: card1.values.XYY, // −1
  q7Card1Xxx: card1.values.XXX, // 1
  q7Card2Yyx: card2.values.YYX, // −1
  q7Card2Yxy: card2.values.YXY, // −1
  q7Card2Xyy: card2.values.XYY, // −1
  q7Forced: forced, // −1
  q7ProdPhaseRe: prodTotalPhase, // −1
  q7ProdPlusXxx: prodPlusXxx, // 0
  q7Qubit1Identity: qubit1Identity, // 0
  q7Qubit2Identity: qubit2Identity, // 0
  q7Qubit3Identity: qubit3Identity, // 0
} as const

export type ValueKey = keyof typeof V
export const claim = keyedClaim<ValueKey>()
export { claimKey, close, d, pct, tf, uf }
