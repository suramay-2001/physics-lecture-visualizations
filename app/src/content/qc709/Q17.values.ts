/**
 * Chapter Q17 numbers (Physics 709, "Searching an unsorted list: Grover"), computed once with the engine. Plan:
 * docs/roles/proposals/P-Q17-story.md; rulings docs/roles/decisions/qc709-Q15Q17.md.
 *
 * Every number a learner reads in Q17 comes from `V` and is backed by a keyed claim (content.test.tsx "claims hold"); the numpy
 * twin of each key is in physics/__fixtures__/claims-qc709/q17.json (pipeline/claims_qc709/q17.py, an independent route: explicit
 * 2ⁿ × 2ⁿ matrices, never physics/qc/grover.ts). Keys start with `q17` and are unique across both courses.
 *
 * Running example: N = 8 (three wires), the marked string x₀ = 101 (index 5). Side cases: N = 4, N = 16 with four marked strings,
 * N = 1024. The circuits come from the engine (`groverCircuit`, `diffusionCircuit`); the amplitudes the story reads are the circuit's
 * own states column by column, and each closed-form number (the plane's angle and chance) is checked against that simulation here
 * before it is exported (a mismatch throws, so a wrong engine never reaches a page).
 */
import { abs2, c } from '../../physics/complex'
import { type Mat, type Vec, identity, inner, matmul, maxDiff, mscale } from '../../physics/linalg'
import type { Circuit } from '../../physics/qc/circuit'
import { kronMAll } from '../../physics/qc/cmat'
import { H } from '../../physics/qc/gates'
import {
  bbbvD,
  bbbvLowerBound,
  bbbvStepBound,
  cosAlphaMeasured,
  diffusionCircuit,
  eq715Gaps,
  finalState,
  groverAngle,
  groverCircuit,
  groverOptimalK,
  groverPlane,
  groverStepMatrix,
  groverSuccess,
  minusUfVersusUw0,
  missChances,
  perpOverlap,
  reflect2D,
  rotate2D,
  startState,
} from '../../physics/qc/grover'
import { runCircuit } from '../../physics/qc/circuit'
import { basisKet, meanAmplitude } from '../../physics/qc/state'
import { claimKey, close, d, keyedClaim, pct, tf, uf } from '../claimKit'

const DEG = Math.PI / 180

/* ---------------------------------------------------------------------------------------------- */
/* The circuits (plan "Circuits"): C_G(k) = Grover on three wires, marked 101, k steps (1 + 4k columns); C_D(k) the same without     */
/* the marking columns (1 + 3k); C_G4 two wires marked 11; C_G16M4 four wires with four marked strings. Memoised so a story's       */
/* stage states share one object per circuit.                                                                                       */
/* ---------------------------------------------------------------------------------------------- */
const memoG = new Map<number, Circuit>()
const memoD = new Map<number, Circuit>()
export const C_G = (k: number): Circuit => {
  let C = memoG.get(k)
  if (!C) memoG.set(k, (C = groverCircuit(3, ['101'], k)))
  return C
}
export const C_D = (k: number): Circuit => {
  let C = memoD.get(k)
  if (!C) memoD.set(k, (C = diffusionCircuit(3, k)))
  return C
}
export const C_G4: Circuit = groverCircuit(2, ['11'], 1)
export const C_G16M4: Circuit = groverCircuit(4, ['0001', '0110', '1011', '1100'], 1)

const X0 = 5 // 101
const ALPHA = groverAngle(8)
/** α in degrees: the Grover plane's start angle for N = 8 (the matrix coefficients' angles are computed from it in code, never typed). */
export const ALPHA_DEG = ALPHA / DEG
/** 2α in degrees: the turn of one step. */
export const TWO_A = 2 * ALPHA_DEG

/* ---------------------------------------------------------------------------------------------- */
/* The simulation the story reads                                                                   */
/* ---------------------------------------------------------------------------------------------- */
const S1 = runCircuit(C_G(1)).states // 0 … 5
const S2 = runCircuit(C_G(2)).states // 0 … 9
const S3 = runCircuit(C_G(3)).states // 0 … 13
const W0 = S1[1]

const probAt = (psi: Vec, i: number): number => abs2(psi[i])
const spread = (psi: Vec): number => {
  const rest = psi.filter((_, i) => i !== X0).map((z) => z.re)
  return Math.max(...rest) - Math.min(...rest)
}
/** The plane angle of a full state: atan2(amplitude of the marked string, the unmarked amplitude × √7), in degrees. */
const planeAngle = (psi: Vec): number => Math.atan2(psi[X0].re, psi[0].re * Math.sqrt(7)) / DEG

/** Bergou's Q = −U_H U₀ U_H U_f from explicit matrices (Eq. 7.14 and the operator below it), to set beside the circuit's own step. */
const UH = kronMAll([H, H, H])
const U0 = identity(8).map((row, i) => row.map((z, j) => (i === 0 && j === 0 ? c(-1) : z)))
const UF = identity(8).map((row, i) => row.map((z, j) => (i === X0 && j === X0 ? c(-1) : z)))
const QBOOK: Mat = mscale(matmul(UH, matmul(U0, matmul(UH, UF))), -1)

// the closed forms must equal the simulation, or no page may show them
for (const [k, S, col] of [[1, S1, 5], [2, S2, 9], [3, S3, 13]] as const) {
  if (Math.abs(probAt(S[col], X0) - groverSuccess(8, 1, k)) > 1e-12) throw new Error(`Q17.values: the circuit and the plane disagree at k = ${k}`)
}

/** Unmarked amplitudes equal at every plane moment of the three-step run: after each whole step (column 1 + 4j) and after each mark (2 + 4j). */
const planeColumns: [Vec[], number][] = [[S3, 1], [S3, 2], [S3, 5], [S3, 6], [S3, 9], [S3, 10], [S3, 13]]
const unmarkedSpread = Math.max(...planeColumns.map(([S, col]) => spread(S[col])))

/** The fixed steps alone, twice, against |w₀⟩. */
const stillGap = Math.max(...finalState(C_D(2)).map((z, i) => Math.hypot(z.re - W0[i].re, z.im - W0[i].im)))

/** The N = 4 and N = 16 (M = 4) side cases, simulated. */
const f4 = finalState(C_G4)
const f16 = finalState(C_G16M4)
const marked16 = [1, 6, 11, 12]

const RW = reflect2D(ALPHA_DEG)
const R0 = reflect2D(0)
const diagZ: Mat = [[c(1), c(0)], [c(0), c(-1)]]
const rotAngle = (M: Mat): number => Math.atan2(M[1][0].re, M[0][0].re) / DEG

const E1 = eq715Gaps(3, X0, 1, 0)
const cosForms = cosAlphaMeasured(3, X0)
const miss = missChances(3, X0, 2)

export const V = {
  /* q17-oracle */
  q17Bar: S1[2][0].re,
  q17MeanAfterOracle: meanAmplitude(S1[2]).re,
  q17Blind: probAt(S1[2], X0),
  q17QIsCircuit: maxDiff(groverStepMatrix(3, X0), QBOOK),

  /* q17-plane */
  q17StartChance: abs2(inner(basisKet(X0, 3), W0)),
  q17SinA: Math.sin(ALPHA),
  q17AlphaDeg: ALPHA_DEG,
  q17CosA: Math.cos(ALPHA),
  q17TwoOverRootN: 2 * Math.sin(ALPHA),
  q17PlaneClosed: eq715Gaps(3, X0, 0.6, -0.8).corrected,
  q17UnmarkedEqual: unmarkedSpread,
  q17Angle1: planeAngle(S1[5]),
  q17Angle2: planeAngle(S2[9]),
  q17Angle3: planeAngle(S3[13]),
  q17BookPerpOverlap: perpOverlap(3, X0, 1),
  q17PerpTrueOverlap: perpOverlap(3, X0, -1),
  q17SinN16: Math.sin(groverAngle(16)),

  /* q17-two-reflections */
  q17R0: maxDiff(R0, diagZ),
  q17Cos2a: RW[0][0].re,
  q17Sin2a: RW[0][1].re,
  q17TwoAlphaDeg: TWO_A,
  q17ProductIsRot: maxDiff(matmul(RW, R0), rotate2D(TWO_A)),
  q17ReverseTurn: maxDiff(matmul(R0, RW), rotate2D(-TWO_A)),
  q17TrThirty: rotAngle(matmul(reflect2D(30), reflect2D(0))),

  /* q17-iterate */
  q17P1: probAt(S1[5], X0),
  q17P2: probAt(S2[9], X0),
  q17P3: probAt(S3[13], X0),
  q17InvUnmarked: S1[5][0].re,
  q17InvMarked: S1[5][X0].re,
  q17MeanAfterStep: meanAmplitude(S1[5]).re,
  q17Kopt8: groverOptimalK(8),
  q17Kopt1024: groverOptimalK(1024),
  q17P1024: groverSuccess(1024, 1, groverOptimalK(1024)),
  q17Fail8: miss.total,
  q17FailBound8: Math.sin(ALPHA) ** 2,
  q17QuarterSteps: Math.PI / (4 * ALPHA),
  q17KoptRaw: (Math.PI - 2 * ALPHA) / (4 * ALPHA),
  q17Angle1024: Math.atan2(groverPlane(1024, 1, groverOptimalK(1024))[1], groverPlane(1024, 1, groverOptimalK(1024))[0]) / DEG,
  q17Over2: planeAngle(S2[9]) - 90,
  q17Short1: 90 - planeAngle(S1[5]),
  q17N4P: probAt(f4, 3),
  q17N4Alpha: groverAngle(4) / DEG,
  q17M4P: marked16.reduce((s, i) => s + probAt(f16, i), 0),

  /* q17-optimal */
  q17DiffOnlyStill: stillGap,
  q17D1: bbbvD(3, 1),
  q17D2: bbbvD(3, 2),
  q17D3: bbbvD(3, 3),
  q17Bbbv1024: bbbvLowerBound(1024),
  q17BbbvQueries1024: Math.ceil(bbbvLowerBound(1024)),
  q17P12of1024: groverSuccess(1024, 1, 12),

  /* the four Corrections (each phrased "our calculation finds ..."): the discrepancy is computed here, never typed */
  q17E1Printed: E1.printed,
  q17E1Corrected: E1.corrected,
  q17E2UfGap: minusUfVersusUw0(3, X0),
  q17CosPrinted: cosForms.printed,
  q17MissPerItem: miss.perItem,
  q17StepBoundPrinted: bbbvStepBound(3, 0, 1),
  q17StepBoundTrue: bbbvStepBound(3, 0, 4),
} as const

export type ValueKey = keyof typeof V
export const claim = keyedClaim<ValueKey>()
export { claimKey, close, d, pct, tf, uf, groverPlane, startState }
