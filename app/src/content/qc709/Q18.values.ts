/**
 * Chapter Q18 numbers (Physics 709, "Hidden periods: Simon, the QFT and phase estimation"), computed once with the engine. Plan:
 * docs/roles/proposals/P-Q18-story.md; rulings docs/roles/decisions/qc709-Q18.md.
 *
 * Every number a learner reads in Q18 comes from `V` and is backed by a keyed claim (content.test.tsx "claims hold"); the numpy twin of each key is in
 * physics/__fixtures__/claims-qc709/q18.json (pipeline/claims_qc709/q18.py, an independent route: dense gate matrices, np.fft, np.linalg.eigvals, exact Fractions
 * and enumeration, never physics/qc/qft.ts or this file's helpers). Keys start with `q18` and are unique across both courses.
 *
 * Running examples. Simon: n = 3, s = 110 on five wires (three inputs, two answer wires). QFT: three wires, the input 101 (the number 5). The eigenphase
 * τ is a FRACTION of a turn (φ stays the angle everywhere in the course, so the books' "φ" is τ here): τ = 0.101₂ = 0.625 (225°), 1/3, 0.1011₂ = 0.6875.
 * Counting: N = 4 (two search wires) with three counting wires. Order finding: N = 21, x = 2, r = 6. The readings the story shows are the circuits' own
 * (route A, `runCircuit`); each closed form is checked against its circuit in the claims that quote the number.
 */
import { abs, abs2, c } from '../../physics/complex'
import { type Vec } from '../../physics/linalg'
import { gf2Nullspace, gf2Rank, gf2RowReduceSteps, gf2Span, dotMod2 } from '../../physics/qc/bits'
import { type Circuit, circuitUnitary, runCircuit } from '../../physics/qc/circuit'
import { binaryFraction, continuedFraction, dft, dftMatrix, orderFromPeak } from '../../physics/qc/fourier'
import { groverAngle } from '../../physics/qc/grover'
import { marginal, postMeasure } from '../../physics/qc/measure'
import { gcd, multOrder } from '../../physics/qc/numtheory'
import {
  classicalCollision,
  collisionUnionBound,
  simonCircuit,
  simonExpectedRuns,
  simonPrintedNorm2,
  simonRunsSuffice,
  simonTable,
  simonYFromCircuit,
} from '../../physics/qc/oracles'
import {
  countEstimate,
  countingCircuit,
  countingDistribution,
  countingPrintedReading,
  distinctPowerPhases,
  expandPrinted,
  expandTrue,
  fftCost,
  groverQMatrix,
  ncWires,
  oneIsSumResidual,
  orderEigenResidual,
  orderEigenphases,
  orderFindingDistribution,
  orderGoodReadings,
  orderSuccess,
  peDistribution,
  peNearest,
  peTailWorst,
  peWithin,
  peWorstBest,
  phaseEstimationCircuit,
  qftCircuit,
  qftCounts,
  qftFromProduct,
  qftPrintedNorm2,
  qftProductAngles,
  readingOfCircuit,
  tallestReadings,
} from '../../physics/qc/qft'
import { ket } from '../../physics/qc/state'
import { claimKey, close, d, keyedClaim, pct, tf, uf } from '../claimKit'

const DEG = Math.PI / 180
const S_STR = 6 // Simon's secret string 110
const SIMON_N = 3

/* ---------------------------------------------------------------------------------------------- */
/* The circuits (plan "Circuits"), memoised so a story's stage states share one object per circuit  */
/* ---------------------------------------------------------------------------------------------- */
/** Simon's circuit: 5 wires, columns [H], [U_f high bit], [U_f low bit], [measure answers], [H]. Read it with outcomes '01'. */
export const C_S: Circuit = simonCircuit(S_STR, SIMON_N)
export const SIMON_OUTCOMES = '01'
const memoQ = new Map<string, Circuit>()
/** The QFT circuit on three wires with the input a (the number a, or its bits). */
export const C_QFT3 = (a: number): Circuit => {
  const key = `qft${a}`
  let C = memoQ.get(key)
  if (!C) memoQ.set(key, (C = qftCircuit(3, { init: a })))
  return C
}
/** Phase estimation of U = P(2πτ) with m counting wires and the target t (default the eigenstate |1⟩). */
export const C_PE = (tau: number, m: number, target: '0' | '1' | '+' = '1'): Circuit => {
  const key = `pe${tau}_${m}_${target}`
  let C = memoQ.get(key)
  if (!C) memoQ.set(key, (C = phaseEstimationCircuit(tau, m, target)))
  return C
}
/** Kickback on two wires: the control in |+⟩ and the target |1⟩, then controlled-U with τ = 0.625 (the first two columns of phase estimation). */
export const C_K: Circuit = (() => {
  const full = phaseEstimationCircuit(5 / 8, 1)
  return { ...full, columns: full.columns.slice(0, 2) }
})()
/** Quantum counting: N = 4 (two search wires), three counting wires, the marked strings as indices. */
export const C_CNT = (marked: readonly number[]): Circuit => {
  const key = `cnt${marked.join(',')}`
  let C = memoQ.get(key)
  if (!C) memoQ.set(key, (C = countingCircuit(2, marked, 3)))
  return C
}
/** The running eigenphases (fractions of a turn). */
export const TAU = 5 / 8
export const TAU_THIRD = 1 / 3
export const TAU_ELEVEN = 11 / 16

const RS = runCircuit(C_S, { outcomes: SIMON_OUTCOMES })
const fS = simonTable(S_STR, SIMON_N)
const idxS = (x: number, out: number): number => (x << 2) | out

const argDeg = (re: number, im: number): number => (((Math.atan2(im, re) / DEG) % 360) + 360) % 360
const ratioDeg = (num: { re: number; im: number }, den: { re: number; im: number }): number => {
  const q = { re: num.re * den.re + num.im * den.im, im: num.im * den.re - num.re * den.im }
  return argDeg(q.re, q.im)
}
const colOfF = (m: number, a: number) => dftMatrix(2 ** m).map((row) => row[a])
const gap = (a: Vec, b: Vec): number => Math.max(...a.map((x, i) => Math.hypot(x.re - b[i].re, x.im - b[i].im)))

/* ---------- Simon, n = 3, s = 110 ---------- */
const queryBars = Array.from({ length: 8 }, (_, x) => abs(RS.states[3][idxS(x, fS[x])]))
const pairA = abs(RS.states[4][idxS(1, 1)])
const yBarA = RS.states[5][idxS(0, 1)]
const yBarB = RS.states[5][idxS(1, 1)]
const yChances = simonYFromCircuit(S_STR, SIMON_N, SIMON_OUTCOMES)
// the strings Simon's circuit can read (its support), not an enumeration of s-perp: the Correction box is about the circuit
const perpRows = yChances.flatMap((p, y) => (p > 1e-9 ? [[(y >> 2) & 1, (y >> 1) & 1, y & 1]] : []))
const checks2 = gf2RowReduceSteps([[1, 1, 1], [1, 1, 0]])
const nullMembers = gf2Span(gf2Nullspace([[1, 1, 1], [1, 1, 0]], 3), 3)
const answerChance = postMeasure(RS.states[3], [3, 4], SIMON_OUTCOMES).p

/* ---------- the QFT ---------- */
const F8 = dftMatrix(8)
const colQ5 = colOfF(3, 5)
const formulaCol = (a: number, m: number) =>
  Array.from({ length: 2 ** m }, (_, y) => c(Math.cos((2 * Math.PI * a * y) / 2 ** m) / Math.sqrt(2 ** m), Math.sin((2 * Math.PI * a * y) / 2 ** m) / Math.sqrt(2 ** m)))
const qftFormulaGap = Math.max(...Array.from({ length: 8 }, (_, a) => gap(formulaCol(a, 3), colOfF(3, a))))
const qftProductGap = Math.max(...Array.from({ length: 8 }, (_, a) => gap(qftFromProduct(a, 3), colOfF(3, a))))
const wrong3 = Array.from({ length: 8 }, (_, a) => a.toString(2).padStart(3, '0')).filter((b) => expandPrinted(b) !== expandTrue(b)).length
const H3col = (a: number): Vec =>
  Array.from({ length: 8 }, (_, y) => {
    const dot = (a & y & 1) + ((a >> 1) & (y >> 1) & 1) + ((a >> 2) & (y >> 2) & 1)
    return c(((-1) ** dot) / Math.sqrt(8), 0)
  })
const qftRun5 = runCircuit(C_QFT3(5))
const qftOut5 = qftRun5.states[qftRun5.states.length - 1]
const run101 = F8.map((row) => row[5])

/* ---------- kickback ---------- */
const RK = runCircuit(C_K)
const RP = runCircuit(C_PE(TAU, 3))
const kicked = RP.states[4]
// the amplitude of "only control j set, target 1" over "all controls 0, target 1"
const kickAngle = (q: number, run = RP): number => ratioDeg(run.states[4][(1 << (3 - q)) | 1], run.states[4][1])
const kickedControls: Vec = Array.from({ length: 8 }, (_, y) => kicked[(y << 1) | 1])
const RPlus = readingOfCircuit(C_PE(TAU, 3, '+'), 3)

/* ---------- phase estimation ---------- */
const read58 = readingOfCircuit(C_PE(TAU, 3), 3)
const read13 = readingOfCircuit(C_PE(TAU_THIRD, 3), 3)
const read13m4 = readingOfCircuit(C_PE(TAU_THIRD, 4), 4)
const read13m5 = readingOfCircuit(C_PE(TAU_THIRD, 5), 5) // six wires: simulated here, though the stage draws five at most
const read1116 = readingOfCircuit(C_PE(TAU_ELEVEN, 3), 3)
const read1116m4 = readingOfCircuit(C_PE(TAU_ELEVEN, 4), 4)
const near13 = peNearest(TAU_THIRD, 3)
// the closed form is the circuit's reading (the routes must agree before any page quotes either)
for (const [circuitReading, closed] of [
  [read58, peDistribution(TAU, 3)],
  [read13, peDistribution(TAU_THIRD, 3)],
  [read13m4, peDistribution(TAU_THIRD, 4)],
  [read1116, peDistribution(TAU_ELEVEN, 3)],
  [read1116m4, peDistribution(TAU_ELEVEN, 4)],
  [read13m5, peDistribution(TAU_THIRD, 5)],
] as const)
  if (Math.max(...circuitReading.map((p, i) => Math.abs(p - closed[i]))) > 1e-12) throw new Error('Q18.values: a phase-estimation circuit and its closed form disagree')
const sinc2Third = (Math.sin(Math.PI / 3) / (Math.PI / 3)) ** 2

/* ---------- counting ---------- */
const CNT0 = readingOfCircuit(C_CNT([]), 3)
const CNT1 = readingOfCircuit(C_CNT([3]), 3)
const CNT2 = readingOfCircuit(C_CNT([1, 2]), 3)
const printedCount = countingPrintedReading(2, [1, 2], 3)
const Qm = groverQMatrix(2, [3])
// |w0⟩ and |w0⊥⟩ for N = 4, M = 1 in the 4-dimensional space; |α±⟩ = (|w0⟩ ∓ i|w0⊥⟩)/√2
const w0 = [c(0.5), c(0.5), c(0.5), c(0.5)]
const wPerpRaw = [c(-0.5), c(-0.5), c(-0.5), c(1.5)] // |x0⟩ − ⟨w0|x0⟩|w0⟩ = (−½, −½, −½, +3/2)
const wPerp = wPerpRaw.map((z) => c(z.re / Math.sqrt(3), 0)) // length √(¼+¼+¼+9/4) = √3
const alphaPlus: Vec = w0.map((z, i) => c(z.re / Math.SQRT2, -wPerp[i].re / Math.SQRT2))
const e60 = c(Math.cos(Math.PI / 3), Math.sin(Math.PI / 3))
const QaP: Vec = Qm.map((row) => row.reduce((s, z, j) => ({ re: s.re + z.re * alphaPlus[j].re - z.im * alphaPlus[j].im, im: s.im + z.re * alphaPlus[j].im + z.im * alphaPlus[j].re }), c(0)))
const eigGap = Math.max(...QaP.map((z, i) => Math.hypot(z.re - (e60.re * alphaPlus[i].re - e60.im * alphaPlus[i].im), z.im - (e60.re * alphaPlus[i].im + e60.im * alphaPlus[i].re))))

/* ---------- order finding, x = 2 mod 21 ---------- */
const r21 = multOrder(2, 21)!
const dist5 = orderFindingDistribution(2, 21, 5)
const peaks5 = tallestReadings(dist5, 6)
const comb32: Vec = Array.from({ length: 32 }, (_, j) => c(j % 6 === 0 ? 1 / Math.sqrt(6) : 0))
const combPeaks = tallestReadings(dft(comb32).map((z) => abs2(z)), 6)
const cf27 = continuedFraction(27, 32)
const good5 = orderGoodReadings(2, 21, 5)

export const V = {
  /* q18-simon */
  q18SimonAnswers: new Set(fS).size,
  q18SimonPerAnswer: Math.min(...[...new Set(fS)].map((v) => fS.filter((w) => w === v).length)),
  q18SimonF001: fS[1],
  q18SimonF111: fS[7],
  q18SimonQueryBar: queryBars[0],
  q18SimonQueryBarsEqual: Math.max(...queryBars) - Math.min(...queryBars),
  q18SimonOutChance: answerChance,
  q18SimonPairBar: pairA,
  q18SimonYBar: Math.abs(yBarA.re),
  q18SimonYSign: Math.sign(yBarA.re) * Math.sign(yBarB.re),
  q18SimonYChance: yChances[0],
  q18SimonPerpCount: yChances.filter((p) => p > 1e-9).length,
  q18SimonBadY: yChances.reduce((s, p, y) => (dotMod2(y, S_STR) === 1 ? s + p : s), 0),
  q18SimonPrintedNorm2: simonPrintedNorm2(SIMON_N, S_STR),
  q18SimonTrueNorm2: yChances.reduce((s, p) => s + p, 0),
  q18SimonRank: checks2.rank,
  q18SimonMoves: checks2.steps.length,
  q18SimonNullSize: nullMembers.length,
  q18SimonSolved: nullMembers[nullMembers.length - 1],
  q18PerpRank: gf2Rank(perpRows),
  q18ThreeForceZero: gf2Span(gf2Nullspace([[1, 0, 0], [0, 1, 0], [0, 0, 1]], 3), 3).length,
  q18Dot110x111: dotMod2(6, 7),
  q18Dot110x010: dotMod2(6, 2),
  q18SimonNew0: 1 - 2 ** (0 - (SIMON_N - 1)),
  q18SimonNew1: 1 - 2 ** (1 - (SIMON_N - 1)),
  q18SimonTwoRuns: simonRunsSuffice(SIMON_N),
  q18SimonExpRuns: simonExpectedRuns(SIMON_N),
  q18SimonExpRuns10: simonExpectedRuns(10),
  q18SimonCollide3: classicalCollision(S_STR, SIMON_N, 3),
  q18SimonCollideBound: collisionUnionBound(SIMON_N, 3),
  q18CollisionXor: 2 ^ 4,

  /* q18-qft */
  q18F8Entry00: F8[0][0].re,
  q18QftIsF8: qftFormulaGap,
  q18Qft101Bar: abs(run101[3]),
  q18Qft101BarsEqual: Math.max(...run101.map((z) => abs(z))) - Math.min(...run101.map((z) => abs(z))),
  q18Qft101Step: ratioDeg(run101[1], run101[0]),
  q18Qft101Chance: abs2(run101[3]),
  q18QftPrintedNorm2: qftPrintedNorm2(3, 5),
  q18QftTrueNorm2: run101.reduce((s, z) => s + abs2(z), 0),
  q18ProdTop: qftProductAngles(5, 3)[0],
  q18ProdMid: qftProductAngles(5, 3)[1],
  q18ProdBot: qftProductAngles(5, 3)[2],
  q18ProdIsQft: qftProductGap,
  q18ExpandPrinted110: expandPrinted('110'),
  q18ExpandTrue110: expandTrue('110'),
  q18ExpandWrong: wrong3,
  q18QftCircuitIsF8: Math.max(...circuitUnitary(qftCircuit(3)).flatMap((row, i) => row.map((z, j) => Math.hypot(z.re - F8[i][j].re, z.im - F8[i][j].im)))),
  q18QftOutIsF8Col: gap(qftOut5, colQ5),
  q18QftGates3: qftCounts(3).gates,
  q18QftSwaps3: qftCounts(3).swaps,
  q18QftGates10: qftCounts(10).gates,
  q18QftSwaps10: qftCounts(10).swaps,
  q18Fft10: fftCost(10),
  q18QftGates5: qftCounts(5).gates,
  q18Qft000IsH: gap(colOfF(3, 0), H3col(0)),
  q18Qft001VsH: gap(colOfF(3, 1), H3col(1)),
  q18Prod110Top: qftProductAngles(6, 3)[0],
  q18Prod110Mid: qftProductAngles(6, 3)[1],
  q18Prod110Bot: qftProductAngles(6, 3)[2],

  /* q18-kickback */
  q18Tau: binaryFraction('101'),
  q18TauThird: TAU_THIRD,
  q18TauEleven: TAU_ELEVEN,
  q18TauDeg: binaryFraction('101') * 360,
  q18KickTarget: marginal(RK.states[2], [1])[1],
  q18KickPhase: ratioDeg(RK.states[2][3], RK.states[2][1]),
  q18KickQ0: kickAngle(0),
  q18KickQ1: kickAngle(1),
  q18KickQ2: kickAngle(2),
  q18KickIsQft: gap(kickedControls, run101),
  q18PlusHalf0: RPlus[0],
  q18PlusHalf5: RPlus[5],
  q18KickU2Deg: kickAngle(1, runCircuit(C_PE(3 / 8, 3))),

  /* q18-phase-est */
  q18PeExact: read58[5],
  q18Pe13Best: read13[3],
  q18Pe13Next: read13[2],
  q18Pe13a: near13.a,
  q18Pe13Grid: near13.a / 2 ** 3,
  q18Pe3Arrow: 1 / 2 ** 3,
  q18Pe13Delta: Math.abs(near13.delta),
  q18FourOverPi2: 4 / Math.PI ** 2,
  q18PeWorst3: peWorstBest(3),
  q18PeWorst4: peWorstBest(4),
  q18PeWorst5: peWorstBest(5),
  q18PeTie: read1116[5],
  q18PeTieNext: read1116[6],
  q18Pe4Exact: read1116m4[11],
  q18NcEps: 0.1,
  q18NcRadius: 2 ** -3,
  q18NcT: ncWires(3, 0.1),
  q18NcWithin: peWithin(TAU_THIRD, ncWires(3, 0.1), 1 / 8),
  q18Pe13m4: read13m4[5],
  q18Pe13m4Next: read13m4[6],
  q18Pe13m5: Math.max(...read13m5),
  q18Pe13Limit: sinc2Third,
  q18Pe13Near: peWithin(TAU_THIRD, 3, 1 / 8),
  q18Tail8k1: peTailWorst(8, 1),
  q18Tail8k2: peTailWorst(8, 2),
  q18Tail8k3: peTailWorst(8, 3),

  /* q18-counting */
  q18CntAlpha: groverAngle(4) / DEG,
  q18CntTurn: (2 * groverAngle(4)) / DEG,
  q18CntTau: (groverAngle(4) / Math.PI),
  q18CntTauMinus: 1 - groverAngle(4) / Math.PI,
  q18CntEig: eigGap,
  q18Cnt0: CNT0[0],
  q18Cnt2: CNT2[2],
  q18Cnt2b: CNT2[6],
  q18CntPrinted: printedCount.chance,
  q18CntEst1: countEstimate(1, 3, 4),
  q18CntEst2: countEstimate(2, 3, 4),
  q18CntEst3: countEstimate(3, 3, 4),
  q18Cnt1Peak: CNT1[1],
  q18Cnt1PeakB: CNT1[7],
  q18CntFalseEmpty: CNT1[0],
  q18CntClosed: Math.max(...CNT1.map((p, a) => Math.abs(p - countingDistribution(4, 1, 3)[a]))),

  /* q18-order */
  q18Ord: r21,
  q18OrdEig: orderEigenResidual(2, 21),
  q18OrdPhases: orderEigenphases(2, 21).length,
  q18OrdPeakA: peaks5[0],
  q18OrdPeakB: peaks5[1],
  q18OrdPeakC: peaks5[2],
  q18OrdPeakD: peaks5[3],
  q18OrdPeakE: peaks5[4],
  q18OrdPeakF: peaks5[5],
  q18OrdPeaksComb: combPeaks.reduce((s, y, i) => s + Math.abs(y - peaks5[i]), 0),
  q18OneIsSum: oneIsSumResidual(2, 21),
  q18OrdTauHat: 5 / 2 ** 5,
  q18OrdSixth: 1 / r21,
  q18OrdRead5: (5 / 32) * 360,
  q18OrdTrue: (1 / 6) * 360,
  q18OrdGoodA: good5[0],
  q18OrdGoodB: good5[1],
  q18OrdGoodCount: good5.length,
  q18OrdSuccess5: orderSuccess(2, 21, 5),
  q18OrdSuccess11: orderSuccess(2, 21, 11),
  q18OrdGcdMinus: gcd(2 ** 3 - 1, 21),
  q18OrdGcdPlus: gcd(2 ** 3 + 1, 21),
  q18Ord4: multOrder(4, 21)!,
  q18U2Distinct: distinctPowerPhases(2, 21, 2),
  q18Ord27: orderFromPeak(27, 5, 2, 21)!,
  q18Cf27Len: cf27.length,
} as const

export type ValueKey = keyof typeof V
export const claim = keyedClaim<ValueKey>()
export { claimKey, close, d, pct, tf, uf, ket }
