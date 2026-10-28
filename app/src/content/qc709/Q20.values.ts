/**
 * Chapter Q20 numbers (Physics 709, "Quantum machines: cloners, U-NOT, programmable processors"), computed once with the engine (physics/qc/machines.ts).
 * Plan: docs/roles/proposals/P-Q20-story.md; rulings docs/roles/decisions/qc709-Q20-Q27.md (Z1-Z7).
 *
 * Every number a learner reads in Q20 comes from `V` and is backed by a keyed claim (content.test.tsx "claims hold"); the numpy twin of each key is in
 * physics/__fixtures__/claims-qc709/q20.json (pipeline/claims_qc709/q20.py, an independent route built on pipeline/machines_numpy.py: CNOTs from bit manipulation,
 * reshaped partial traces, leggauss and brentq, explicit singlet projectors; never the engine's own code). Keys start with `q20` and are unique across all courses.
 *
 * Running examples. The input psi has Bloch angles theta = 60, phi = 90 degrees (r = (0, 0.866, 0.5): it has a y part, so complex conjugation is visible); the processor
 * angle is alpha = 30 degrees; the discriminator pair is psi1 = R_y(60)|0> and psi2 = R_y(-60)|0> (overlap s = 1/2). Every `...Gap` value is a max-abs difference between two
 * routes and is about 1e-16, not exactly 0: it is shown through d(x, 0), which prints 0, and claimed with close(x, 0, 1e-12). A number the text shows with a minus sign is
 * stored as its size (the number reader skips the sign), and the sign is asserted in the claim.
 */
import { densityOf, fidelity, partialTrace } from '../../physics/qc/density'
import { type Mat } from '../../physics/linalg'
import { type Circuit, type Op } from '../../physics/qc/circuit'
import { inner } from '../../physics/linalg'
import { abs, abs2, c } from '../../physics/complex'
import { unotMap } from '../../physics/qc/channels'
import { I2, Z } from '../../physics/qc/gates'
import {
  PSI_RUN,
  XI00,
  XI0X,
  type ProgramSpec,
  bellProgramGap,
  blochAzimuthDeg,
  blochKet,
  blochLength,
  blochVector,
  choiMinEig,
  choiSpectrum,
  clonerCircuit,
  clonerCircuitGap,
  clonerEq82Gap,
  clonerEq85Gap,
  clonerFidelities,
  clonerFormulaGap,
  clonerOutputs,
  clonerPairOverlap,
  clonerProgram,
  cnotBranchGap,
  cnotProcessor,
  copyFidelity,
  discBlock,
  discBlockGap,
  expectationSpread,
  failureOverlap,
  maxC0C1,
  maxOperations,
  measureCorrectOperations,
  measurePrepareClone,
  measurePrepareUnot,
  outputPurity,
  pairAtOverlap,
  perpKet,
  phaseFlipFormulaGap,
  phaseFlipGap,
  phaseFlipProgram,
  phaseFlipRun,
  prCircuit,
  processorExpectation,
  processorOverlapGap,
  programNormGap,
  programmableUsd,
  programmableUsdBest,
  rusBranchGap,
  rusCircuit,
  rusCircuitGap,
  rusCircuitSuccess,
  rusRounds,
  rusSuccess,
  toffoliGap,
  toffoliProcessor,
  U0,
  uinOverlap,
  uinUnitaryGap,
  unotLimit,
  unotShrunk,
  unotTargetGap,
  unotTurned,
  unotYTYGap,
  universalSpread,
  usdKnown,
  usdProgrammableAt,
} from '../../physics/qc/machines'
import { claimKey, close, d, keyedClaim, pct, tf, uf } from '../claimKit'

const DEG = Math.PI / 180

/* ---------------------------------------------------------------------------------------------- */
/* The circuits (plan "Stage shorthand"), built once so a story's stage states share one object      */
/* ---------------------------------------------------------------------------------------------- */
/** The cloner circuit C_CL(P): three wires from 000, data on top, the program P a box on the two lower wires; six columns (the four CNOTs are columns 3-6). Memoised. */
const memoCL = new Map<string, Circuit>()
export const C_CL = (p: ProgramSpec): Circuit => {
  const key = JSON.stringify(p)
  let C = memoCL.get(key)
  if (!C) memoCL.set(key, (C = clonerCircuit(p)))
  return C
}
/** One CNOT processor round, C_PR(alpha): two wires, four columns (the program wire is read last). */
export const C_PR = (alphaDeg: number): Circuit => prCircuit(alphaDeg)
/** Two rounds with the first reading kept coherent (a Toffoli): three wires, five columns; the same circuit as Eq. 8.30's larger program. */
export const C_RUS: Circuit = rusCircuit(30)
const ry = (q: number, deg: number): Op => ({ op: 'gate', gate: 'Ry', targets: [q], params: [deg * DEG] })
/** The discriminator inputs on wires A, B, C: input 1 is psi1 psi2 psi1 and input 2 is psi1 psi2 psi2, with psi1 = R_y(60)|0> and psi2 = R_y(-60)|0> (overlap 1/2). */
export const C_D1: Circuit = { version: 1, qubits: 3, init: '000', wires: ['A', 'B', 'C'], columns: [[ry(0, 60), ry(1, -60), ry(2, 60)]] }
export const C_D2: Circuit = { version: 1, qubits: 3, init: '000', wires: ['A', 'B', 'C'], columns: [[ry(0, 60), ry(1, -60), ry(2, -60)]] }

/* ---------------------------------------------------------------------------------------------- */
/* Stage vectors (never typed: every Bloch vector below is the engine's)                              */
/* ---------------------------------------------------------------------------------------------- */
const PSI = PSI_RUN
const PSI_OTHER = blochKet(120, 30)
const PLUS_X = blochKet(90, 0)
const PSI1 = blochKet(60, 0)
const PSI2 = blochKet(60, 180)
const OUT30 = clonerOutputs({ uDeg: 30 })
const OUT30_OTHER = clonerOutputs({ uDeg: 30 }, 120, 30)
const TURNED = unotTurned(OUT30[2])
const MP_CLONE = measurePrepareClone(PSI)
export const R_PSI = blochVector(densityOf(PSI))
export const R_PSI_OTHER = blochVector(densityOf(PSI_OTHER))
export const R_PSI_PERP = blochVector(densityOf(perpKet(PSI)))
export const R_OUT1 = blochVector(OUT30[0])
export const R_OUT1_OTHER = blochVector(OUT30_OTHER[0])
export const R_OUT3 = blochVector(OUT30[2])
export const R_TURNED = blochVector(TURNED)
export const R_MP_UNOT = blochVector(measurePrepareUnot(PSI))
export const R_MP_CLONE = blochVector(partialTrace(MP_CLONE.rho12, [1]))

/* ---------------------------------------------------------------------------------------------- */
/* Values                                                                                          */
/* ---------------------------------------------------------------------------------------------- */
const GAPS4 = [5, 17, 41, 55].map((u) => clonerFormulaGap(u))
const FLIP_DIRS: [number, number][] = [
  [90, 0],
  [90, 90],
  [60, 0],
  [120, 40],
]
const FLIP_PS = FLIP_DIRS.map(([t, p]) => phaseFlipGap(PSI, [[t, p]]))
const RHOS = [densityOf(PSI), densityOf(PSI_OTHER), densityOf(PLUS_X), [[c(0.5), c(0)], [c(0), c(0.5)]] as Mat]
const SINGLE_PHASE = [[c(Math.cos(0.7), Math.sin(0.7)), c(0)], [c(0), c(Math.cos(0.7), Math.sin(0.7))]] as Mat
const KICK: Mat = [[c(Math.cos(0.2), -Math.sin(0.2)), c(0)], [c(0), c(Math.cos(0.2), Math.sin(0.2))]]
const FLIP_PLUS_X = phaseFlipProgram(90, 0)
const FLIP_PLUS_Y = phaseFlipProgram(90, 90)
const FLIP_120 = phaseFlipProgram(120, 0)
const BLOCK23 = discBlock(2 / 3, 2 / 3)
const [P1S, P2S] = [PSI1, PSI2]
const USD_BEST = programmableUsdBest(P1S, P2S)
const S0707 = Math.SQRT1_2
const PAIR0707 = pairAtOverlap(S0707)

export const V = {
  // ---- q20-cloner
  q20OverlapPrograms: inner(XI00, XI0X).re,
  q20Xi00Gap: clonerEq82Gap('00'),
  q20Xi0xGap: clonerEq82Gap('0x'),
  q20Out2PurityXi0x: outputPurity(clonerOutputs('0x')[1]),
  q20ClonerCircuitGap: Math.max(...(['00', '0x', 'Phi-', { uDeg: 22 }, { flip: [60, 0] }] as ProgramSpec[]).map((p) => clonerCircuitGap(p))),
  q20NormGap: Math.max(...[5, 17, 41, 55].map((u) => programNormGap(u))),
  q20Rho1Gap: Math.max(...GAPS4.map((g) => g.rho1)),
  q20Rho2Gap: Math.max(...GAPS4.map((g) => g.rho2)),
  q20CrossGap: Math.max(...GAPS4.map((g) => g.cross)),
  q20C0u15: clonerProgram(15).c0,
  q20C1u15: clonerProgram(15).c1,
  q20F1u15: clonerFidelities(15).f1,
  q20F2u15: clonerFidelities(15).f2,
  q20F1u0: clonerFidelities(0).f1,
  q20F2u0: clonerFidelities(0).f2,
  q20F1u60: clonerFidelities(60).f1,
  q20F2u60: clonerFidelities(60).f2,
  q20C: clonerProgram(30).c0,
  q20F56: clonerFidelities(30).f1,
  q20F56Root: fidelity(OUT30[0], PSI),
  q20Weight16: copyFidelity(OUT30[0], perpKet(PSI)),
  q20ShrinkClone: blochLength(OUT30[0]) / blochLength(densityOf(PSI)),
  q20Out1Gap: clonerEq85Gap(),
  q20UniversalSpread: universalSpread(30, 200, 709),
  q20F56Other: clonerFidelities(30, 120, 30).f1,

  // ---- q20-unot
  q20UnotIsYTYGap: unotYTYGap(RHOS),
  q20UnotChoiNeg: -choiMinEig(unotMap),
  q20UnotChoiMax: choiSpectrum(unotMap).at(-1)!,
  q20Rho3Gap: Math.max(...GAPS4.map((g) => g.rho3)),
  q20Rho3Y: Math.abs(R_OUT3[1]),
  q20PsiY: R_PSI[1],
  q20Rho3Len: blochLength(OUT30[2]) / blochLength(densityOf(PSI)),
  q20U0Sign: U0[1][0].re,
  q20UnotGap: unotTargetGap(TURNED, PSI),
  q20UnotFid: copyFidelity(TURNED, perpKet(PSI)),
  q20UnotDot: -(R_TURNED[0] * R_PSI[0] + R_TURNED[1] * R_PSI[1] + R_TURNED[2] * R_PSI[2]),
  q20UnotShrink: blochLength(TURNED) / blochLength(densityOf(PSI)),
  q20ShrinkP02: 0.2,
  q20ChoiMinP0: choiMinEig(unotShrunk(0)),
  q20ChoiSlope: -(choiMinEig(unotShrunk(1)) - choiMinEig(unotShrunk(0))),
  q20ChoiMinP02: choiMinEig(unotShrunk(0.2)),
  q20ChoiNegP05: -choiMinEig(unotShrunk(0.5)),
  q20UnotPStar: unotLimit(),
  q20MaxC0C1: maxC0C1().value,
  q20MpUnotFid: copyFidelity(measurePrepareUnot(PSI), perpKet(PSI)),
  q20MpUnotGap: unotTargetGap(measurePrepareUnot(PSI), PSI),
  q20MpCloneSingle: MP_CLONE.single,
  q20MpCloneBoth: MP_CLONE.both,
  q20CloneBoth: clonerPairOverlap(30, PSI),

  // ---- q20-no-go
  q20ExpZ0: processorExpectation(I2, Z, blochKet(0, 0)).re,
  q20ExpZ60: processorExpectation(I2, Z, blochKet(60, 0)).re,
  q20ExpZ90: processorExpectation(I2, Z, blochKet(90, 0)).re,
  q20ExpZ120: processorExpectation(I2, Z, blochKet(120, 0)).re,
  q20ExpZ180: processorExpectation(I2, Z, blochKet(180, 0)).re,
  q20SpreadZ: expectationSpread(I2, Z),
  q20SpreadPhase: expectationSpread(SINGLE_PHASE, I2),
  q20ProcOverlapGap: Math.max(processorOverlapGap(I2, Z, PSI), processorOverlapGap(I2, KICK, PSI)),
  q20MaxOps10: maxOperations(10),
  q20MaxOps8: maxOperations(8),
  q20MeasCorrectOps: measureCorrectOperations(KICK, [[c(0), c(1)], [c(1), c(0)]], 40),

  // ---- q20-probabilistic
  q20CnotSuccess: cnotProcessor(30, PLUS_X).pSuccess,
  q20RotX: blochVector(densityOf(cnotProcessor(30, PLUS_X).success))[0],
  q20RotY: Math.abs(blochVector(densityOf(cnotProcessor(30, PLUS_X).success))[1]),
  q20RotGap: cnotBranchGap(30, PLUS_X),
  q20Rus1: rusSuccess(1),
  q20Rus2: rusSuccess(2),
  q20Rus3: rusSuccess(3),
  q20Rus4: rusSuccess(4),
  q20Rus5: rusSuccess(5),
  q20Rus6: rusSuccess(6),
  q20Rus7: rusSuccess(7),
  q20Rus9: rusSuccess(9),
  q20RusGap: Math.max(Math.abs(rusSuccess(2) - rusCircuitSuccess(30)), rusCircuitGap(30), rusBranchGap(7)),
  q20Target99: 0.99,
  q20Target999: 0.999,
  q20RusRounds99: rusRounds(0.99),
  q20RusRounds999: rusRounds(0.999),
  q20ToffoliSuccess: toffoliProcessor(30, PLUS_X).pSuccess,
  q20ToffoliFail: toffoliProcessor(30, PLUS_X).pFail,
  q20FailOverlap: failureOverlap(30, PLUS_X),
  q20ToffoliGap: Math.max(toffoliGap(30, PLUS_X), toffoliGap(20, PSI)),
  q20AzAlpha20: blochAzimuthDeg(cnotProcessor(20, PLUS_X).success),

  // ---- q20-bell-programs
  q20BellProgGap: bellProgramGap(60, 90),
  q20Prog60x: Math.abs(phaseFlipProgram(60, 0).coef[0].re),
  q20Prog60y: abs(phaseFlipProgram(60, 0).coef[1]),
  q20Prog60z: Math.abs(phaseFlipProgram(60, 0).coef[2].re),
  q20UphiGap: Math.max(...FLIP_DIRS.map(([t, p]) => phaseFlipFormulaGap(t, p)), phaseFlipFormulaGap(60, 0)),
  q20Prog120z: FLIP_120.coef[2].re,
  q20FlipSuccess: Math.min(...FLIP_DIRS.map(([t, p]) => phaseFlipRun(PSI, t, p).p)),
  q20FlipGap: Math.max(...FLIP_PS, phaseFlipGap(PLUS_X, [[60, 0]])),
  q20UinGap: uinUnitaryGap(),
  q20Xi28Overlap: Math.min(...FLIP_DIRS.map(([t, p]) => uinOverlap(t, p))),
  q20ProgPlusX: FLIP_PLUS_X.coef[0].re,
  q20ProgPlusYy: abs2(FLIP_PLUS_Y.coef[1]),

  // ---- q20-discriminator
  q20DiscOverlap: abs(inner(P1S, P2S)),
  q20DiscZeroGap: programmableUsd(P1S, P2S, 2 / 3, 2 / 3).zeroGap,
  q20DiscPj: programmableUsd(P1S, P2S, 2 / 3, 2 / 3).p1,
  q20BlockGap: Math.max(discBlockGap(2 / 3, 2 / 3), discBlockGap(0.3, 0.5), discBlockGap(0.9, 0.1)),
  q20ConstTrue: BLOCK23.detTrue,
  q20ConstPrinted: BLOCK23.detPrinted,
  q20DiscPrinted: -BLOCK23.discPrinted,
  q20BlockEigLo: BLOCK23.eigs[0],
  q20BlockEigHi: BLOCK23.eigs[1],
  q20OptC: USD_BEST.c,
  q20SumC: 2 * USD_BEST.c,
  q20DetCoef: discBlock(1, 1).detTrue + 1,
  q20DiscP05: usdProgrammableAt(0.5),
  q20DiscKnown05: usdKnown(0.5),
  q20DiscRatio05: usdProgrammableAt(0.5) / usdKnown(0.5),
  q20S0707: abs(inner(PAIR0707[0], PAIR0707[1])),
  q20DiscP0707: usdProgrammableAt(S0707),
  q20DiscKnown0707: usdKnown(S0707),
  q20DiscRatio0707: usdProgrammableAt(S0707) / usdKnown(S0707),
  q20DiscP0: usdProgrammableAt(0),
  q20DiscKnown0: usdKnown(0),
} as const

export type ValueKey = keyof typeof V
export const claim = keyedClaim<ValueKey>()
export { claimKey, close, d, pct, tf, uf }
