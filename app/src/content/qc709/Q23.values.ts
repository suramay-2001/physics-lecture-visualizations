/**
 * Chapter Q23 numbers (Physics 709, "Measuring information: distances, entropies and Holevo"), computed once with the engine (physics/qc/infoq.ts, density.ts, info.ts, povm.ts).
 * Plan: docs/roles/proposals/P-Q23-story.md; rulings docs/roles/decisions/qc709-Q20-Q27.md (Z1-Z7).
 *
 * Every number a learner reads in Q23 comes from `V` and is backed by a keyed claim (content.test.tsx "claims hold"); the numpy twin of each key is in
 * physics/__fixtures__/claims-qc709/q23.json (pipeline/claims_qc709/q23.py, built on pipeline/infoq_numpy.py: np.kron states, einsum partial traces, eigvalsh entropies,
 * scipy.linalg.logm and sqrtm, a vectorised grid with scipy.optimize for the capacity and the accessible information, gate-by-gate circuits; never the engine's own code).
 * Keys start with `q23` and are unique across both courses. Every `...Gap` value is a max-abs difference between two routes and is about 1e-16, not exactly 0: it is shown
 * through d(x, 0), which prints 0, and claimed with close(x, 0, 1e-12).
 *
 * Running examples (plan "Conventions"): the coins p = (1/2, 1/2), q = (0.9, 0.1), r = (0.7, 0.3); the pair |0>, |+> (overlap 1/sqrt 2); the binary symmetric channel with flip
 * chance 0.1; the Bell pair with a Z error on one half; the BB84 ensemble. Entropies are in bits.
 *
 * Imports: this file is read only by the chapter's lazy content chunk, so `physics/qc/infoq.ts` stays out of the entry closure (chunk rule (l)).
 */
import { type Mat, type Vec, apply, identity, inner, madd, mscale, outer, vsub } from '../../physics/linalg'
import { abs, c } from '../../physics/complex'
import { type Circuit, type Op, runCircuit } from '../../physics/qc/circuit'
import { Ry } from '../../physics/qc/gates'
import {
  densityOf,
  entanglementEntropy,
  conditionalEntropy,
  fidelity,
  mixtureN,
  partialTrace,
  reducedBloch,
  spectrum,
  traceDistance,
  vonNeumann,
} from '../../physics/qc/density'
import { binaryEntropy, classicalPair, marginals, shannon } from '../../physics/qc/info'
import {
  accessibleProjective,
  bestTableDistance,
  bscChannel,
  bscJoint,
  capacityGrid,
  classicalDistance,
  classicalFidelity,
  condEntropyClassical,
  dephasedBell,
  dephasingCircuit,
  eigenTableDistance,
  fidelityAngleDeg,
  ghzCircuit,
  holevoChi,
  holevoChiPair,
  holevoProofStates,
  jointEntropy,
  kleinChain,
  logChord,
  mutualInfo,
  mutualInfoAsRel,
  mutualInfoPovm,
  pairStates,
  planeBasis,
  quantumMutualInfo,
  quantumRelEntropy,
  quarterTables,
  relEntropy,
  relEntropyGrid,
  sqrtPlaneDeg,
  tableDistance,
  triangleSlack,
  usdFailureBound,
} from '../../physics/qc/infoq'
import { usd, usdPovm } from '../../physics/qc/povm'
import { bell, embed, ket, kron, wState } from '../../physics/qc/state'
import { repetitionFail } from '../../physics/qec/rates'
import { claimKey, close, d, keyedClaim, pct, tf, uf } from '../claimKit'

/* ---------------------------------------------------------------------------------------------- */
/* The circuits (plan "Stage shorthand"), built once so a story's stage states share one object      */
/* ---------------------------------------------------------------------------------------------- */
const box = (m: Mat, targets: number[], label: string): Op => ({ op: 'unitary', matrix: m.map((row) => row.map((z): [number, number] => [z.re, z.im])), targets, label })
/** The Householder reflection I - 2uu^T that sends |0...0> to the real unit vector `v` (a real unitary whose first column is v). */
function reflectTo(v: Vec): Mat {
  const e0: Vec = v.map((_, k) => c(k === 0 ? 1 : 0))
  const diff = vsub(e0, v)
  const n2 = diff.reduce((s, z) => s + z.re * z.re + z.im * z.im, 0)
  const u = diff.map((z) => c(z.re / Math.sqrt(n2), z.im / Math.sqrt(n2)))
  return madd(identity(v.length), mscale(outer(u, u), -2))
}
const F_BSC = 0.1
const F11 = 0.11
const JOINT_AMPS: Vec = [Math.sqrt(0.45), Math.sqrt(0.05), Math.sqrt(0.05), Math.sqrt(0.45)].map((x) => c(x))
/** The noisy wire as a state: sqrt p(x, y) on |xy> for a fair input and flip chance 0.1 (wire 0 = sent bit x, wire 1 = received bit y), one box from 00. */
export const C_BSC: Circuit = { version: 1, qubits: 2, init: '00', wires: ['x', 'y'], columns: [[box(reflectTo(JOINT_AMPS), [0, 1], 'p(x,y)')]] }
/** A pure helper C with chance 0.1 of |1>, a Bell pair on A, B and a controlled Z from C onto B: tracing out C leaves 0.9 Phi+ + 0.1 Phi-. */
export const C_DEPH: Circuit = dephasingCircuit(F_BSC)
/** GHZ on three wires: H, CNOT 0 -> 1, CNOT 1 -> 2. */
export const C_GHZ: Circuit = ghzCircuit()
/** One box preparing the W state from 000 (a real reflection whose first column is |W>). */
export const C_W3: Circuit = { version: 1, qubits: 3, init: '000', wires: ['a', 'b', 'c'], columns: [[box(reflectTo(wState(3)), [0, 1, 2], 'W')]] }

/* ---------------------------------------------------------------------------------------------- */
/* Values                                                                                          */
/* ---------------------------------------------------------------------------------------------- */
const P = [0.5, 0.5]
const Q = [0.9, 0.1]
const R3 = [0.7, 0.3]
/** The chance tables the stage draws (unit 1): the fair coin p, the biased coin q, the middle coin r, and q with an impossible face. */
export const TAB = { p: P, q: Q, r: R3, qZero: [1, 0] } as const
const QT3 = quarterTables(3)
const GRID = relEntropyGrid(QT3)
/** A diagonal one-qubit state diag(a, 1 - a), as a mixture of |0> and |1>. */
const diag2 = (a: number): Mat =>
  mixtureN([
    { w: a, psi: ket('0') },
    { w: 1 - a, psi: ket('1') },
  ])
const Z0 = densityOf(ket('0'))
const ZP = densityOf(ket('+'))
const ZM = densityOf(ket('-'))
const HALF = diag2(0.5)
const RHO9 = diag2(0.9)
/** (1/2)(I + 0.8 X): eigenvalues 0.9 and 0.1 along +-x, the same table as RHO9 with turned axes. */
const SIG_X = mixtureN([
  { w: 0.9, psi: ket('+') },
  { w: 0.1, psi: ket('-') },
])
const KLEIN = kleinChain(RHO9, SIG_X)
/** The four chances of the four-level state of Unit 23.3. */
const LEVELS = [0.4, 0.3, 0.2, 0.1]
const RHO4 = mixtureN(LEVELS.map((w, i) => ({ w, psi: ket(['00', '01', '10', '11'][i]) })))
/** The chance of the first level of the diagonal state of Unit 23.2, and the arrow of the second state. */
const A75 = 0.75
const SIG_ARROW = 0.8
const BLOCK = mixtureN([
  { w: 0.25, psi: ket('00') },
  { w: 0.25, psi: ket('01') },
  { w: 0.5, psi: ket('1+') },
])
const MIX_0P = mixtureN([
  { w: 0.5, psi: ket('0') },
  { w: 0.5, psi: ket('+') },
])
const BELL = bell('00+11')
const W_MIX = madd(mscale(densityOf(wState(3)), 0.5), mscale(densityOf(ket('000')), 0.5))
const S_ssa = (traceOut: number[]): number => vonNeumann(traceOut.length ? partialTrace(W_MIX, traceOut) : W_MIX)
const SSA = { A: S_ssa([1, 2]), B: S_ssa([0, 2]), AB: S_ssa([2]), BC: S_ssa([0]), AC: S_ssa([1]), ABC: S_ssa([]) }
const J01 = bscJoint(F_BSC)
const CAP = capacityGrid(bscChannel(F_BSC), 1001)
const STATE_DEPH = runCircuit(C_DEPH).states.at(-1)!
const STATE_GHZ = runCircuit(C_GHZ).states.at(-1)!
const AB_FROM_CIRCUIT = partialTrace(densityOf(STATE_DEPH), [2])
const dephGap = dephasedBell(F_BSC).reduce((m, row, i) => row.reduce((mm, z, j) => Math.max(mm, Math.hypot(z.re - AB_FROM_CIRCUIT[i][j].re, z.im - AB_FROM_CIRCUIT[i][j].im)), m), 0)
const BELL_PURE_C = kron(BELL, ket('0'))
const BELL_TURNED = apply(embed(Ry(1.1), 2, [1]), BELL)
// Unit 6: the pair |0>, |+>, the ensemble tools and the BB84 and Bell ensembles
const PS2 = [0.5, 0.5]
const PAIR_RHOS = [Z0, ZP]
const PAIR_MIX = MIX_0P
const S_OVERLAP = abs(inner(ket('0'), ket('+'))) // |<0|+>|, the overlap of the pair
const zProj = [Z0, densityOf(ket('1'))]
const xProj = [ZP, ZM]
const PAIR_Z = mutualInfoPovm(PS2, PAIR_RHOS, zProj)
const PAIR_BEST = accessibleProjective(PS2, PAIR_RHOS, 3601)
const PROOF = holevoProofStates(PS2, PAIR_RHOS, [0, 0, 1])
const PAIR_JOINT_Z = [
  [0.5, 0],
  [0.25, 0.25],
]
const BB84_PS = [0.25, 0.25, 0.25, 0.25]
const BB84_RHOS = ['0', '1', '+', '-'].map((k) => densityOf(ket(k)))
const BB84_BEST = accessibleProjective(BB84_PS, BB84_RHOS, 3601)
const BELL_NAMES = ['00+11', '00-11', '01+10', '01-10']
const BELL_RHOS = BELL_NAMES.map((n) => densityOf(bell(n)))
const BELL_HALVES = BELL_RHOS.map((r) => partialTrace(r, [1]))
const USD05 = pairStates(0.5)
const USD_POVM05 = usdPovm(USD05[0], USD05[1])

export const V = {
  // ---- model inputs the chapter states (a coin's chances, a mixing weight, a flip chance): printed through d() and backed by `q23In...` claims
  q23InFair: P[0],
  q23InBiasHi: Q[0],
  q23InBiasLo: Q[1],
  q23InMidHi: R3[0],
  q23InMidLo: R3[1],
  q23InQuarter3: A75,
  q23InQuarter1: 1 - A75,
  q23InX08: SIG_ARROW,
  q23InL1: LEVELS[0],
  q23InL2: LEVELS[1],
  q23InL3: LEVELS[2],
  q23InL4: LEVELS[3],
  q23InFlip: F_BSC,
  q23InFlip11: F11,
  q23InFlipKeep: 1 - F_BSC,
  q23SqrtP: Math.sqrt(P[0]),
  q23SqrtQ0: Math.sqrt(Q[0]),
  q23SqrtQ1: Math.sqrt(Q[1]),

  // ---- q23-classical-compare
  q23Dpq: classicalDistance(P, Q),
  q23Dpr: classicalDistance(P, R3),
  q23Dqr: classicalDistance(R3, Q),
  q23TriangleGridSlack: triangleSlack(QT3),
  q23Fpq: classicalFidelity(P, Q),
  q23ThetaPq: fidelityAngleDeg(P, Q),
  q23ThetaPr: fidelityAngleDeg(P, R3),
  q23ThetaRq: fidelityAngleDeg(R3, Q),
  q23PlaneP: sqrtPlaneDeg(P),
  q23PlaneQ: sqrtPlaneDeg(Q),
  q23Hpq: relEntropy(P, Q),
  q23Hqp: relEntropy(Q, P),
  q23HrelGridMin: GRID.minFinite,
  q23HrelGridInf: GRID.infinite,
  q23HInfFlag: relEntropy(P, [1, 0]) === Infinity ? 1 : 0,

  // ---- q23-quantum-compare
  q23DquantumZP: traceDistance(Z0, ZP),
  q23DmeasZ: tableDistance(Z0, ZP, planeBasis(0)),
  q23DmeasX: tableDistance(Z0, ZP, planeBasis(Math.PI / 2)),
  q23DmeasBest: eigenTableDistance(Z0, ZP),
  q23DmeasGridMax: bestTableDistance(Z0, ZP, 3601).D,
  q23FquantumDiag: fidelity(HALF, RHO9),
  q23SrelA: quantumRelEntropy(diag2(A75), HALF),
  q23SrelAreverse: quantumRelEntropy(HALF, diag2(A75)),
  q23SDiag75: vonNeumann(diag2(A75)),
  q23SrelPureVsMixed: quantumRelEntropy(ZP, RHO9),
  q23SrelMixedVsPureInf: quantumRelEntropy(RHO9, ZP) === Infinity ? 1 : 0,
  q23SrelNC: KLEIN.S,
  q23KleinR0: KLEIN.r[0],
  q23KleinH: KLEIN.H,
  q23SrelSameEig: KLEIN.S,
  q23HeigSame: relEntropy(spectrum(RHO9), spectrum(SIG_X)),
  q23LhsPrinted: logChord(1, 4, 1.5, true).lhs,
  q23RhsPrinted: logChord(1, 4, 1.5, true).rhs,
  q23LhsTrue: logChord(1, 4, 1.5, false).lhs,
  q23RhsTrue: logChord(1, 4, 1.5, false).rhs,

  // ---- q23-entropy-props
  q23S4Level: vonNeumann(RHO4),
  q23SMaxGap: Math.abs(quantumRelEntropy(RHO4, mscale(identity(4), 1 / 4)) - (Math.log2(4) - vonNeumann(RHO4))),
  q23SBlock: vonNeumann(BLOCK),
  q23SubaddGap: quantumMutualInfo(BELL),
  q23SConcaveMix: vonNeumann(MIX_0P),
  q23SConcaveAvg: 0.5 * vonNeumann(Z0) + 0.5 * vonNeumann(ZP),
  q23SsaMixSA: SSA.A,
  q23SsaMixSAC: SSA.AC,
  q23SsaMixS: SSA.ABC,
  q23SsaLhs1: SSA.A + SSA.B,
  q23SsaRhs1: SSA.AC + SSA.BC,
  q23SsaLhs2: SSA.ABC + SSA.B,
  q23SsaRhs2: SSA.AB + SSA.BC,
  q23SsaGap1: SSA.AC + SSA.BC - SSA.A - SSA.B,
  q23SsaGap2: SSA.AB + SSA.BC - SSA.ABC - SSA.B,
  q23SBell: vonNeumann(densityOf(BELL)),
  q23SBellA: entanglementEntropy(BELL, [0]),
  q23SCondBell: conditionalEntropy(BELL, [1]),
  q23S3Qubits: vonNeumann(mscale(identity(8), 1 / 8)),

  // ---- q23-two-variables
  q23JointH: jointEntropy(J01),
  q23HX: shannon(marginals(J01).px),
  q23HYgX: condEntropyClassical(J01),
  q23BscJoint00: J01[0][0],
  q23BscJoint01: J01[0][1],
  q23Imutual: mutualInfo(J01),
  q23ImutualAsRel: mutualInfoAsRel(J01),
  q23ImutualCorr: mutualInfo([
    [0.5, 0],
    [0, 0.5],
  ]),
  q23BscCap: CAP.C,
  q23BscCapArg: CAP.argmax,
  q23BscCap25: capacityGrid(bscChannel(0.25), 1001).C,
  q23BscCap11: capacityGrid(bscChannel(F11), 1001).C,
  q23BscCapHalf: capacityGrid(bscChannel(0.5), 1001).C,
  q23Rep3Fail: repetitionFail(F_BSC, 3),
  q23Rep3Rate: 1 / 3,
  q23IDealer: mutualInfo(classicalPair('dealer')),
  q23IIndep: mutualInfo(classicalPair({ pA: 0.5, pB: 0.5 })),

  // ---- q23-quantum-mutual
  q23IBell: quantumMutualInfo(BELL),
  q23IDeph01: quantumMutualInfo(dephasedBell(0.1)),
  q23SDeph01: vonNeumann(dephasedBell(F_BSC)),
  q23IDeph05: quantumMutualInfo(dephasedBell(0.5)),
  q23IGhzAB: quantumMutualInfo(STATE_GHZ, [0], [1]),
  q23IGhzABC: quantumMutualInfo(STATE_GHZ, [0], [1, 2]),
  q23DephCircuitGap: dephGap,
  q23DataProcFall: quantumMutualInfo(BELL) - quantumMutualInfo(dephasedBell(0.1)),
  q23SlipSAB: vonNeumann(densityOf(BELL)),
  q23SlipSB: vonNeumann(partialTrace(densityOf(BELL), [0])),
  q23SlipSBC: vonNeumann(partialTrace(densityOf(BELL_PURE_C), [0])),
  q23ILocalU: quantumMutualInfo(BELL_TURNED),

  // ---- q23-holevo
  q23ChiZP: holevoChi(PS2, PAIR_RHOS),
  q23ChiZPClosed: Math.abs(holevoChi(PS2, PAIR_RHOS) - binaryEntropy((1 + S_OVERLAP) / 2)),
  q23PairOverlap: S_OVERLAP,
  q23PairArrow: Math.hypot(...reducedBloch(PAIR_MIX, 0)),
  q23PairEig1: spectrum(PAIR_MIX)[0],
  q23PairEig2: spectrum(PAIR_MIX)[1],
  q23ChiOrth: holevoChi(PS2, [Z0, densityOf(ket('1'))]),
  q23ChiSame: holevoChi(PS2, [Z0, Z0]),
  q23ChiS05: holevoChiPair(0.5),
  q23IZPz: PAIR_Z,
  q23PairZHY: shannon(marginals(PAIR_JOINT_Z).py),
  q23PairZHYgX: condEntropyClassical(PAIR_JOINT_Z),
  q23IBestZP: PAIR_BEST.I,
  q23IHelstromClosed: 1 - binaryEntropy((1 - Math.sqrt(1 - S_OVERLAP * S_OVERLAP)) / 2),
  q23ProofStart: PROOF.SPQ,
  q23ProofEnd: PROOF.SPprimeMprime,
  q23UsdBound05: usdFailureBound(PS2, pairStates(0.5)),
  q23UsdBound0707: usdFailureBound(PS2, pairStates(Math.SQRT1_2)),
  q23UsdBound09: usdFailureBound(PS2, pairStates(0.9)),
  q23UsdPfExact05: 1 - usd(pairStates(0.5)),
  q23UsdPfExact0707: 1 - usd(pairStates(Math.SQRT1_2)),
  q23UsdPfExact09: 1 - usd(pairStates(0.9)),
  q23UsdInfo05: mutualInfoPovm(PS2, USD05, USD_POVM05),
  q23ChiBB84: holevoChi(BB84_PS, BB84_RHOS),
  q23IBB84z: mutualInfoPovm(BB84_PS, BB84_RHOS, zProj),
  q23IBB84x: mutualInfoPovm(BB84_PS, BB84_RHOS, xProj),
  q23IBB84Best: BB84_BEST.I,
  q23ChiBellPair: holevoChi(BB84_PS, BELL_RHOS),
  q23ChiBellAliceOnly: holevoChi(BB84_PS, BELL_HALVES),
  q23IBellMeasure: mutualInfoPovm(BB84_PS, BELL_RHOS, BELL_RHOS),

  // ---- challenges
  q23ChDpq: classicalDistance([0.6, 0.4], [0.2, 0.8]),
  q23ChF: classicalFidelity(P, [1, 0]),
  q23ChH: relEntropy(P, [0.25, 0.75]),
  q23ChDmeasZminus: tableDistance(Z0, ZM, planeBasis(0)),
  q23ChSrelDiag: quantumRelEntropy(RHO9, HALF),
  q23ChBlock: vonNeumann(
    mixtureN([
      { w: 0.25, psi: ket('0+') },
      { w: 0.375, psi: ket('10') },
      { w: 0.375, psi: ket('11') },
    ]),
  ),
  q23ChJoint: jointEntropy(bscJoint(0.2)),
  q23ChI: mutualInfo(bscJoint(0.2)),
  q23ChDeph25: quantumMutualInfo(dephasedBell(0.25)),
  q23ChChiS06: holevoChiPair(0.6),
  q23ChUsdS08: usdFailureBound(PS2, pairStates(0.8)),
} as const

export type ValueKey = keyof typeof V
export const claim = keyedClaim<ValueKey>()
export { claimKey, close, d, pct, tf, uf }
