/**
 * Chapter Q26 numbers (Physics 709, "Qubits made of light: photons and linear optics"), computed once with the engine (physics/qc/photons.ts).
 * Plan: docs/roles/proposals/P-Q26-story.md; rulings docs/roles/decisions/qc709-Q20-Q27.md (Z1-Z7).
 *
 * Every number a learner reads in Q26 comes from `V` and is backed by a keyed claim (content.test.tsx "claims hold"); the numpy twin of each key is in
 * physics/__fixtures__/claims-qc709/q26.json (pipeline/claims_qc709/q26.py, an independent route built on pipeline/photon_numpy.py: the exponential of the mode generator on a
 * truncated Fock space, itertools permanents, sympy polynomials, scipy fsolve, a six-index tensor for gate teleportation; never the engine's own code). Keys start with `q26`
 * and are unique across all courses.
 *
 * Running examples. The wave plates are theta = 30, varphi = 40 degrees (the Correction's numbers); the splitters are the real convention S = [[t, r], [-r, t]] at
 * reflectivities R = 0.3, 0.25 and 0.2 and the balanced one at R = 1/2; the signal photons of the sign gate see theta = 150.49, varphi = 61.58 degrees; the Jaynes-Cummings atom
 * has Delta = 10 Omega_0; the coherent amplitude is alpha = 2 (1 for the first overlap). Inputs the text shows ("model (ours)": R, the targets 0.9 and 0.99) are `V` constants too.
 * Every `...Gap` value is a max-abs difference between two routes and is about 1e-16, not exactly 0: it is shown through d(x, 0), which prints 0, and claimed with close(x, 0, 1e-12).
 * A number the text shows with a minus sign is stored with its sign where the picture needs it and shown by its size; the claim asserts the sign.
 * Reported hardware results (photon numbers prepared, rates, detector efficiencies, distances) appear in words only (ruling Z2): no digit of this chapter is an experiment's.
 */
import { abs, abs2, c } from '../../physics/complex'
import { type Vec, maxDiff } from '../../physics/linalg'
import { type Circuit, circuitUnitary, runCircuit } from '../../physics/qc/circuit'
import { entanglementEntropy } from '../../physics/qc/density'
import { concurrencePure } from '../../physics/qc/entangle'
import { superpose } from '../../physics/qc/state'
import {
  attempts,
  bellAnalyzerSuccess,
  blochPolarDeg,
  bsQ5,
  bsReal,
  bsSym,
  catFock,
  catNorm,
  cnotPlusZeroCircuit,
  cnotTeleportSweep,
  coherentFock,
  coherentOverlap,
  coherentOverlapSeries,
  conventionGap,
  czCircuit,
  czDualRail,
  czLeak,
  czPrinted,
  czSuccess,
  distinguishable,
  doubledAngleGap,
  dualRailCircuit,
  dualRailKet,
  entCircuit,
  fockChances,
  homCancelGap,
  homCircuit,
  homCircuitGap,
  homDip,
  homPhaseDeg,
  jcChi,
  jcEigenGap,
  jcLine,
  jcMixDeg,
  jcPiTime,
  jcShift,
  kerrCircuit,
  kerrGate,
  klmNeeded,
  klmSuccess,
  meanPhotons,
  nsAmplitudes,
  nsFormulaGap,
  nsRatios,
  nsSignGap,
  nsSolve,
  relativePhaseDeg,
  resCircuit,
  resourceGap,
  splitterCircuit,
  stokesGapSweep,
  teleportOneCircuit,
  teleportOutput,
  twoPhoton,
  twoPhotonFormulaGap,
  twoSplitterCircuit,
  unitarityGap,
  waveCircuit,
  waveKet,
  waveP1,
} from '../../physics/qc/photons'
import { claimKey, close, d, keyedClaim, pct, tf, uf } from '../claimKit'

/* ---------------------------------------------------------------------------------------------- */
/* The circuits (plan "Stage shorthand"), built once so a story's stage states share one object      */
/* ---------------------------------------------------------------------------------------------- */
const memo = <K extends number, T>(f: (k: K) => T): ((k: K) => T) => {
  const m = new Map<K, T>()
  return (k) => {
    let v = m.get(k)
    if (v === undefined) m.set(k, (v = f(k)))
    return v
  }
}
/** One wire: the wave plates U(30°, 40°) as a box 'U' (Unit 26.1). */
export const C_U: Circuit = waveCircuit(30, 40)
/** One wire: a splitter of transmission cos 30° and a phase of 40° on path 1 (Fig. 14.3). */
export const C_DR: Circuit = dualRailCircuit(30, 40)
/** One wire from |0>: the real splitter of reflectivity R as a box 'S'; bar 0 = exit 2, bar 1 = exit 3. */
export const C_BS = memo((R: number) => splitterCircuit(bsReal(R)))
/** One wire from |0>: two balanced splitters (Fig. 14.5's table) in a row. */
export const C_BS2: Circuit = twoSplitterCircuit(bsSym())
/** Two occupation wires from |10>: the one-photon block of the real splitter. */
export const C_ENT = memo((R: number) => entCircuit(bsReal(R)))
/** Two occupation wires from |01> (one photon in each port): the two-photon block; bars 00, 01, 10 are |20>, |11>, |02>. */
export const C_HOM = memo((R: number) => homCircuit(bsReal(R)))
/** Two wires from |++>: the photonic gate without (false) and with (true) the nonlinear sign gates. */
export const C_CZ = (ns: boolean): Circuit => (ns ? C_CZ_NS : C_CZ_LIN)
const C_CZ_LIN: Circuit = czCircuit(false)
const C_CZ_NS: Circuit = czCircuit(true)
/** Four wires: the five columns that prepare the resource |r>. */
export const C_RES: Circuit = resCircuit()
/** Three wires: one qubit teleported through half of a Bell pair (two readings). */
export const C_T1: Circuit = teleportOneCircuit()
/** Two wires from |+0>: the ideal CNOT, the gate that the teleportation delivers. */
export const C_CNOT: Circuit = cnotPlusZeroCircuit()
/** Two wires from |++>: the controlled phase of a cross-Kerr medium at phi = pi. */
export const C_KERR: Circuit = kerrCircuit(Math.PI)

/* ---------------------------------------------------------------------------------------------- */
/* Values                                                                                          */
/* ---------------------------------------------------------------------------------------------- */
const last = (C: Circuit, outcomes?: string): Vec => runCircuit(C, outcomes ? { outcomes } : {}).states.at(-1)!
const list = <P extends string>(prefix: P, xs: readonly number[]): Record<`${P}${number}`, number> =>
  Object.fromEntries(xs.map((x, i) => [`${prefix}${i}`, x])) as Record<`${P}${number}`, number>

const S2 = Math.SQRT1_2
const U3040 = waveKet(30, 40)
const DR = last(C_DR)
const S70 = bsReal(0.3)
const ENT30 = last(C_ENT(0.3))
const ENT50 = last(C_ENT(0.5))
const TWOBS = last(C_BS2)
const H25 = twoPhoton(bsReal(0.25))
const H50 = twoPhoton(bsReal(0.5))
const H20 = twoPhoton(bsReal(0.2))
const NS = nsSolve()
const NS_A = nsAmplitudes(NS.thetaDeg, NS.phiDeg, 3)
const NS_RATIO = nsRatios(NS.thetaDeg, NS.phiDeg, 3)
const CZ_LIN = last(C_CZ(false))
const CZ_NS = last(C_CZ(true))
const P_CZ = czSuccess()
const GT = cnotTeleportSweep(6, 26)
const PLUS: Vec = [c(S2), c(S2)]
const ZERO: Vec = [c(1), c(0)]
const OUT0000 = teleportOutput(PLUS, ZERO, '0000')
const COH2 = coherentFock(2, 11)
const CAT2 = catFock(2, 1, 11)
const CAT_LONG = catFock(2, 1, 60)
const KLM99 = klmNeeded(0.99)
const KLM90 = klmNeeded(0.9)
const KERR_STATE = last(C_KERR)
const GAP_SETS = [bsReal(0.5), bsSym(), bsQ5()]

export const V = {
  // ---- q26-encodings
  q26WaveP0: abs2(U3040[0]),
  q26WaveP1: waveP1(30, 40),
  q26WaveAmp0: abs(U3040[0]),
  q26WaveAmp1: abs(U3040[1]),
  q26TruePhase: relativePhaseDeg(U3040),
  q26PrintedPhase: relativePhaseDeg(dualRailKet(30, 40)),
  q26BlochPolar: blochPolarDeg(U3040),
  q26DoubledGap: Math.max(doubledAngleGap(30, 40), doubledAngleGap(22.5, 112.5), doubledAngleGap(10, -70)),
  q26DualRailP0: abs2(DR[0]),
  q26DualRailP1: abs2(DR[1]),
  q26DualRailGap: Math.max(...DR.map((z, i) => abs(c(z.re - dualRailKet(30, 40)[i].re, z.im - dualRailKet(30, 40)[i].im)))),
  q26Polar225: blochPolarDeg(waveKet(22.5, 0)),
  q26Sin2_225: waveP1(22.5, 0),

  // ---- q26-beamsplitter
  q26T2_70: abs2(S70[0][0]),
  q26R_70: abs2(S70[1][0]),
  q26StokesGap: stokesGapSweep(200, 26),
  q26ConvGap: conventionGap(),
  q26Conc70: concurrencePure(ENT30),
  q26Entropy70: entanglementEntropy(ENT30, [0]),
  q26Entropy50: entanglementEntropy(ENT50, [0]),
  q26TwoBsChance: abs2(TWOBS[1]),
  q26TwoBsPhase: relativePhaseDeg([c(1), TWOBS[1]]),
  q26UnitaryGap: Math.max(...GAP_SETS.map(unitarityGap)),

  // ---- q26-hom
  q26R25: 0.25,
  q26R20: 0.2,
  q26HomP20_R25: abs2(H25.a20),
  q26HomP11_R25: abs2(H25.a11),
  q26HomP02_R25: abs2(H25.a02),
  q26HomCancel: homCancelGap(200, 26),
  q26HomTt: bsReal(0.5)[0][0].re * bsReal(0.5)[1][1].re,
  q26HomRr: bsReal(0.5)[1][0].re * bsReal(0.5)[0][1].re,
  q26HomP20_R50: abs2(H50.a20),
  q26HomP11_R50: abs2(H50.a11),
  q26HomPhaseReal: homPhaseDeg(bsReal(0.5)),
  q26HomPhaseSym: homPhaseDeg(bsSym()),
  q26HomR20: homDip(0.2),
  q26HomP20_R20: abs2(H20.a20),
  q26HomBunch20: 1 - homDip(0.2),
  q26DistinguishableR50: distinguishable(bsReal(0.5)),
  q26HomClosedGap: twoPhotonFormulaGap(50, 26),
  q26HomCircuitGap: Math.max(homCircuitGap(bsReal(0.25)), homCircuitGap(bsSym()), homCircuitGap(bsQ5()), homCircuitGap(bsReal(0.2))),

  // ---- q26-ns-cz
  q26NsBar: superpose('00+01+10')[0].re,
  q26NsA0: NS_A[0],
  q26NsA1: NS_A[1],
  q26NsA2: NS_A[2],
  q26NsA3: NS_A[3],
  q26NsRatio0: NS_RATIO[0],
  q26NsA1overA0: NS_RATIO[1],
  q26NsA2overA0: NS_RATIO[2],
  q26NsRatio3: NS_RATIO[3],
  q26NsTheta: NS.thetaDeg,
  q26NsPhi: NS.phiDeg,
  q26NsSuccess: NS.success,
  q26NsOtherRootCosTheta: NS.otherCosTheta,
  q26NsFormulaGap: Math.max(nsFormulaGap(NS.thetaDeg, NS.phiDeg, 4), nsFormulaGap(20, 33, 4), nsFormulaGap(100, 75, 4)),
  q26NsSignGap: nsSignGap(),
  q26ConcLinear: concurrencePure(CZ_LIN),
  q26ConcCz: concurrencePure(CZ_NS),
  q26CzGap: Math.max(maxDiff(czDualRail(false), czPrinted(false)), maxDiff(czDualRail(true), czPrinted(true))),
  q26CzLeak: Math.max(czLeak(false), czLeak(true)),
  q26CzSuccess: P_CZ,
  q26CzAttempts: attempts(P_CZ),
  q26NsBound: 2 / 27,
  q26NsBoundRatio: 2 / 27 / P_CZ,
  q26CzIn100: 100 * P_CZ,
  q26Cz3Chain: P_CZ ** 3,
  q26CzAttempts3: Math.round(attempts(P_CZ ** 3)),
  ...list('q26CzChain', [1, 2, 3, 4].map((k) => P_CZ ** k)),

  // ---- q26-teleport-gate
  q26NsInverse: attempts(NS.success),
  q26GateTeleportOutcome: GT.minChance,
  q26TeleportOneOutcome: runCircuit(C_T1, { outcomes: '00' }).prob,
  q26ResourceGap: resourceGap(),
  q26GtGap: GT.gap,
  q26GtOut00: abs2(OUT0000[0]),
  q26GtOut11: abs2(OUT0000[3]),
  q26GtSpread: GT.maxChance - GT.minChance,
  q26Klm1: klmSuccess(1),
  q26Klm3: klmSuccess(3),
  q26Klm9: klmSuccess(9),
  q26Klm18: klmSuccess(18),
  q26Klm19: klmSuccess(19),
  q26Klm199: klmSuccess(199),
  q26Target90: 0.9,
  q26Target99: 0.99,
  q26KlmExact99: KLM99.exact,
  q26KlmN99: KLM99.n,
  q26KlmN90: KLM90.n,
  q26KlmPhotons10: 10 * (KLM99.n + 1),
  q26BellAnalyserSuccess: bellAnalyzerSuccess(),
  q26BellGate: bellAnalyzerSuccess() ** 2,

  // ---- q26-nonlinear
  q26KerrConc: concurrencePure(KERR_STATE),
  q26KerrGap: maxDiff(circuitUnitary(C_KERR), kerrGate(Math.PI)),
  q26MixAngle0: jcMixDeg(0, 10, 1),
  q26JcEigGap: jcEigenGap(10, 1, 5),
  q26Chi: jcChi(10, 1),
  q26ChiExact01: jcShift(0, 10, 1) - jcShift(1, 10, 1),
  q26ChiPhaseTime: jcPiTime(10, 1),
  ...list('q26JcShift', [0, 1, 2, 3, 4, 5].map((n) => jcShift(n, 10, 1))),
  ...list('q26JcLine', [0, 1, 2, 3, 4, 5].map((n) => jcLine(n, 10, 1))),
  q26Overlap1: coherentOverlap(1, -1),
  q26Overlap2: coherentOverlap(2, -2),
  q26OverlapSeriesGap: Math.abs(coherentOverlapSeries(1, -1, 80) - coherentOverlap(1, -1)),
  q26CatEvenNorm: catNorm(2, 1),
  q26CatOddP: CAT_LONG.filter((_, n) => n % 2 === 1).reduce((s, a) => s + a * a, 0),
  q26CatP0: CAT2[0] ** 2,
  q26CohP0: COH2[0] ** 2,
  q26CatMean: meanPhotons(CAT_LONG),
  q26CohMean: meanPhotons(coherentFock(2, 60)),
  ...list('q26CohPn', fockChances(COH2)),
  ...list('q26CatPn', fockChances(CAT2)),
} as const

export type ValueKey = keyof typeof V
export const claim = keyedClaim<ValueKey>()
export { claimKey, close, d, pct, tf, uf }
