/**
 * Chapter Q24 numbers (Physics 709, "Controlling a real qubit: Lindblad, Bloch equations, Rabi and Ramsey"), computed once with the engine (physics/qc/blocheq.ts and pulses.ts).
 * Plan: docs/roles/proposals/P-Q24-story.md; rulings docs/roles/decisions/qc709-Q20-Q27.md (Z1-Z7).
 *
 * Every number a learner reads in Q24 comes from `V` and is backed by a keyed claim (content.test.tsx "claims hold"); the numpy twin of each key is in
 * physics/__fixtures__/claims-qc709/q24.json (pipeline/claims_qc709/q24.py, an independent route built on pipeline/q24_numpy.py: scipy expm of a Kronecker superoperator, solve_ivp,
 * complex linear solves, DOP853 over one drive period, scipy.integrate.quad double integrals, brentq; never the engine's own code). Keys start with `q24` and are unique across all courses.
 *
 * Conventions. hbar = 1; |g> = |0> = |+z>, |e> = |1>; times in units of T1 where gamma = 1. Model inputs (stated, not measured): a 1 microsecond gate against a 1 millisecond T2 (times
 * kept in microseconds), noise of rms size 1, the drive of Bergou's Fig. 12.3 (Omega = 2 pi, Delta = 20 pi, T1 = 2.5, T2 = 5) and the pair Omega = 1, Delta = 0.7, T1 = 4, T2 = 8 for Eq. 12.5b.
 * Every `...Gap` value is a max-abs difference between two routes and is about 1e-16, not exactly 0: it is shown through d(x, 0), which prints 0, and claimed with close(x, 0, 1e-12).
 * A number the text shows with a minus sign is stored as its size (the number reader skips the sign) and the sign is asserted in a claim. Four values that come from numerical integration
 * (`q24RwaRelErr`, `q24FullGapDerived`, `q24FullGapPrinted`, the two window averages), the two found by a search (`q24KrausGapRatio`, `q24MinEigAt`) and the ratio of two small errors (`q24RatioEps01`) are ROUNDED to the digits the text shows,
 * so the twin (a different integrator) agrees to 1e-12; the unrounded values are checked against numpy to 1e-9 in physics/qc/blocheq.test.ts.
 */
import { abs, c } from '../../physics/complex'
import type { Circuit } from '../../physics/qc/circuit'
import { type Mat, matmul, mscale } from '../../physics/linalg'
import { rabiProbability } from '../../physics/dynamics'
import { amplitudeDamping, applyKraus, dephasing } from '../../physics/qc/channels'
import { Rx, Ry, X, Y, Z } from '../../physics/qc/gates'
import {
  type BlochParams,
  type LabParams,
  S_WEAK,
  blochAverageExcited,
  blochOf,
  blochSteady,
  decayFactors,
  decayTimes,
  dephasingJump,
  eulerStep,
  krausStep,
  labHamiltonian,
  labJumps,
  labSteadyAverages,
  lindbladL0,
  lindbladRhs,
  lindbladSolve,
  losslessAverage,
  positivityMin,
  purityOf,
  qubitJump,
  rhoOfBloch,
  steadyCoherenceForm,
  steadyExcited,
  steadyWidth,
  steadyWidthBisect,
  traceOf,
} from '../../physics/qc/blocheq'
import {
  accumulatedErrorDeg,
  coherenceFactor,
  compositeU,
  divincenzo,
  echoCoherence,
  echoSequence,
  echoVariance,
  echoVarianceQuad,
  errorComposite,
  errorPlain,
  fieldStrength,
  fieldTiltDeg,
  gatesPerCoherence,
  gaussianCoherence,
  gaussianCoherenceClosed,
  gateDistance,
  omegaPrime,
  ouCoherence,
  ouVariance,
  ouVarianceQuad,
  piPulseTime,
  precessDensity,
  precessM,
  pulseTrainAngleDeg,
  pulseTrainP0,
  rabiCeiling,
  rabiPe,
  rabiU,
  rabiUExpm,
  ramseyP1,
  t2star,
  t2starFastLimit,
  t2starStaticLimit,
} from '../../physics/qc/pulses'
import { claimKey, close, d, keyedClaim, pct, tf, uf } from '../claimKit'

const DEG = Math.PI / 180
const r = (x: number, places: number): number => Number(x.toFixed(places))
const ZERO2: Mat = [[c(0), c(0)], [c(0), c(0)]]
const maxd = (A: Mat, B: Mat): number => Math.max(...A.flatMap((row, i) => row.map((x, j) => abs(c(x.re - B[i][j].re, x.im - B[i][j].im)))))

/* ---------------------------------------------------------------------------------------------- */
/* Stage vectors (never typed: every Bloch vector below is the engine's)                              */
/* ---------------------------------------------------------------------------------------------- */
const PLUS_X: Mat = rhoOfBloch([1, 0, 0])
const DECAY = [qubitJump(1)]
const TPHI = [qubitJump(1), dephasingJump(1)]
export const R_PLUS_X = blochOf(PLUS_X)
export const R_STEP = blochOf(krausStep(PLUS_X, lindbladL0(ZERO2, DECAY), DECAY, 0.2))
export const R_T1 = blochOf(lindbladSolve(PLUS_X, ZERO2, DECAY, 1))
export const R_TPHI = blochOf(lindbladSolve(PLUS_X, ZERO2, TPHI, 0.5))
export const R_GROUND = blochOf(rhoOfBloch([0, 0, 1]))
const FIG: BlochParams = { Omega: 2 * Math.PI, Delta: 20 * Math.PI, T1: 2.5, T2: 5 }
const FIG_STEADY = blochSteady(FIG)
export const R_FIG = [2 * FIG_STEADY.rho.re, 2 * FIG_STEADY.rho.im, -FIG_STEADY.w]
/** The tilt of the axis B = (Omega, 0, delta) = (1, 0, 0.8) from the z axis, in degrees (90 minus the tilt from x). */
export const AXIS_THETA = 90 - fieldTiltDeg(1, 0.8)
/** The same for B = (Omega, 0, Delta) with Delta = 2 Omega (Unit 24.4's detuned example). */
export const AXIS_THETA_OFF = 90 - fieldTiltDeg(1, 2)
/** Unit 24.1: one wire from |0>, a flip X, then a reading (the three steps every platform must supply). */
export const C_LIFE: Circuit = { version: 1, qubits: 1, clbits: 1, init: '0', wires: ['q'], columns: [[{ op: 'gate', gate: 'X', targets: [0] }], [{ op: 'measure', qubit: 0, bit: 0 }]] }

/* ---------------------------------------------------------------------------------------------- */
/* Values                                                                                          */
/* ---------------------------------------------------------------------------------------------- */
const LAB: LabParams = { omegaQ: 40, Omega: 1, Delta: 0.7, T1: 4, T2: 8 }
const LAB_RWA = blochSteady(LAB)
const LAB_FULL = labSteadyAverages(LAB)
const LAB_OURS = steadyCoherenceForm(LAB, false)
const LAB_PRINTED = steadyCoherenceForm(LAB, true)
const dist = (a: { re: number; im: number }, b: { re: number; im: number }): number => Math.hypot(a.re - b.re, a.im - b.im)
const KRAUS_GAP = (dt: number): number => maxd(krausStep(PLUS_X, lindbladL0(ZERO2, DECAY), DECAY, dt), eulerStep(PLUS_X, ZERO2, DECAY, dt))
const RHO_T1 = lindbladSolve(PLUS_X, ZERO2, DECAY, 1)
const STATE_ANY = rhoOfBloch([0.3, -0.4, 0.5])
const NOISE_FIELD = [1, 0, 0.8] as const
const NOISE_M0 = [0.3, -0.5, 0.6] as const
const POS3 = positivityMin(1, 3)
const FIG_AVG = (t0: number, t1: number): number => blochAverageExcited(FIG, t0, t1)
const U_CASES: [number | { re: number; im: number }, number, number][] = [
  [1.3, 0.9, 2.1],
  [c(0.8, -0.6), 0.9, 2.1],
  [2 * Math.PI, 4 * Math.PI, 0.25],
]
const PHIS = Array.from({ length: 29 }, (_, k) => k * 0.25)
const ECHO_DELTAS = Array.from({ length: 11 }, (_, k) => k)
/** Model inputs the text states (read from the engine's own parameter objects where there is one). */
const T_QUARTER = 0.25
const NOISE_SHIFT = NOISE_FIELD[2]
const TAU_FAST = 0.1
const EPS_SMALL = 0.01
const EPS_LARGE = 0.1
const WINDOW_END = 0.5

export const V = {
  // ---- q24-divincenzo
  q24Criteria: divincenzo().criteria.length,
  q24CritCompute: divincenzo().criteria.filter((x) => x.kind === 'computer').length,
  q24CritNet: divincenzo().criteria.filter((x) => x.kind === 'network').length,
  q24Platforms: divincenzo().platforms.length,
  q24GatesPerT2: gatesPerCoherence(1000, 1),
  q24SurviveGate: coherenceFactor(1, 1000),
  q24SurviveAll: coherenceFactor(gatesPerCoherence(1000, 1), 1000),
  q24GatesPerT2x2: gatesPerCoherence(1000, 2),
  q24Keep100: coherenceFactor(100, 1000),

  // ---- q24-lindblad
  q24KrausGapRatio: r(KRAUS_GAP(1e-3) / KRAUS_GAP(5e-4), 4),
  q24TraceRate: abs(traceOf(lindbladRhs(PLUS_X, ZERO2, DECAY))),
  q24ExcT1: RHO_T1[1][1].re,
  q24CohT1: abs(RHO_T1[0][1]),
  q24RT1x: blochOf(RHO_T1)[0],
  q24RT1z: blochOf(RHO_T1)[2],
  q24PurT1: purityOf(RHO_T1),
  q24PopFactorT1: decayFactors(1).pop,
  q24CohFactorT1: decayFactors(1).coh,
  q24CohFactor2T1: decayFactors(2).coh,
  q24T2OverT1: decayTimes(ZERO2, DECAY).T2 / decayTimes(ZERO2, DECAY).T1,
  q24MinEig2: positivityMin(1, 2).min,
  q24MinEig3: -POS3.min,
  q24MinEig3Sign: Math.sign(POS3.min),
  q24MinEigAt: r(POS3.at, 2),
  q24T2Tphi: decayTimes(ZERO2, TPHI).T2,
  q24CohRate: 1 / decayTimes(ZERO2, TPHI).T2,
  q24DephKrausGap: maxd(lindbladSolve(PLUS_X, ZERO2, [dephasingJump(1)], 0.5), applyKraus(dephasing((1 - Math.exp(-0.5)) / 2), PLUS_X)),
  q24DampKrausGap: maxd(lindbladSolve(PLUS_X, ZERO2, DECAY, 0.5), applyKraus(amplitudeDamping(1 - Math.exp(-0.5)), PLUS_X)),
  q24SWeak: S_WEAK,
  q24LabDelta: LAB.Delta,
  q24ChT2: r(decayTimes(ZERO2, [qubitJump(0.2)]).T2, 9),
  q24ChEe: lindbladSolve(PLUS_X, ZERO2, DECAY, 2)[1][1].re,
  q24ChTphi: decayTimes(ZERO2, [qubitJump(1 / 2), dephasingJump(1 / 3)]).T2,

  // ---- q24-bloch-eq
  q24Bloch3Trace: abs(traceOf(lindbladRhs(STATE_ANY, labHamiltonian(LAB, 0.37), labJumps(LAB.T1, LAB.T2)))),
  q24RwaRelErr: r(Math.abs(LAB_FULL.w - LAB_RWA.w) / Math.abs(LAB_RWA.w), 4),
  q24ReeRes1: steadyExcited(0, 1),
  q24ReeRes100: steadyExcited(0, 100),
  q24ReeRes3: steadyExcited(0, 3),
  q24WssFig: Math.abs(FIG_STEADY.w),
  q24WssFigSign: Math.sign(FIG_STEADY.w),
  q24RtSSgap: Math.max(dist(FIG_STEADY.rho, steadyCoherenceForm(FIG, false)), dist(blochSteady(LAB).rho, LAB_OURS)),
  q24RtRe: Math.abs(LAB_RWA.rho.re),
  q24RtReSign: Math.sign(LAB_RWA.rho.re),
  q24RtPrintedRe: Math.abs(LAB_PRINTED.re),
  q24RtPrintedReSign: Math.sign(LAB_PRINTED.re),
  q24FullGapDerived: r(dist(LAB_FULL.rho, LAB_OURS), 5),
  q24FullGapPrinted: r(dist(LAB_FULL.rho, LAB_PRINTED), 3),
  q24SchrAvg: losslessAverage(FIG.Omega, FIG.Delta),
  q24ReeSS: (1 + FIG_STEADY.w) / 2,
  q24SchrOverBloch: losslessAverage(FIG.Omega, FIG.Delta) / ((1 + FIG_STEADY.w) / 2),
  q24ReeAvgEarly: r(FIG_AVG(0, WINDOW_END), 5),
  q24ReeAvgLate: r(FIG_AVG(30, 40), 6),
  q24FigT1: FIG.T1,
  q24InHalf: WINDOW_END,
  q24FWHM0: steadyWidth(0),
  q24FWHM3: steadyWidth(3),
  q24FWHM8: steadyWidth(8),
  q24FwhmGap: Math.max(...[0, 3, 8].map((s) => Math.abs(steadyWidth(s) - steadyWidthBisect(s)))),

  // ---- q24-rabi
  q24U127Gap: Math.max(...U_CASES.map(([O, De, t]) => maxd(rabiU(O, De, t), rabiUExpm(O, De, t)))),
  q24TownsendGap: Math.abs(rabiPe(0.5, 1.0, 3.7) - rabiProbability(2, 1, 3, 3.7)),
  q24Tpi: piPulseTime(2 * Math.PI),
  q24PeOff: rabiCeiling(2 * Math.PI, 4 * Math.PI),
  q24OmPrimeOff: omegaPrime(2 * Math.PI, 4 * Math.PI),
  q24PeQuarter: rabiPe(2 * Math.PI, 0, T_QUARTER),
  q24TQuarter: T_QUARTER,
  q24U2piGap: maxd(rabiU(1, 0, 2 * Math.PI), [[c(-1), c(0)], [c(0), c(-1)]]),
  q24U4piGap: maxd(rabiU(1, 0, 4 * Math.PI), [[c(1), c(0)], [c(0), c(1)]]),
  q24SignRxPlus: gateDistance(rabiU(1, 0, Math.PI / 2), Rx(Math.PI / 2)),
  q24SignRxMinus: gateDistance(rabiU(1, 0, Math.PI / 2), Rx(-Math.PI / 2)),
  q24RyGap: gateDistance(rabiU(c(0, -1), 0, Math.PI / 2), Ry(Math.PI / 2)),
  q24RxNegGap: gateDistance(rabiU(-1, 0, Math.PI / 2), Rx(Math.PI / 2)),
  q24CompExact: gateDistance(compositeU(0), Rx(Math.PI)),
  q24InEps001: EPS_SMALL,
  q24InEps01: EPS_LARGE,
  q24ErrPlain01: errorPlain(EPS_SMALL),
  q24ErrComp01: errorComposite(EPS_SMALL),
  q24RatioEps01: r(errorPlain(EPS_SMALL) / errorComposite(EPS_SMALL), 3),
  q24ErrPlain10: errorPlain(EPS_LARGE),
  q24ErrComp10: errorComposite(EPS_LARGE),
  q24ZfromYX: gateDistance(mscale(matmul(Y, X), c(0, 1)), Z),
  q24ZTime: 2 * piPulseTime(2 * Math.PI),
  q24TpiOm4: piPulseTime(4),
  q24CeilEq: rabiCeiling(1, 1),

  // ---- q24-ramsey
  q24RamseyP1Deg0: ramseyP1(0),
  q24RamseyP1Deg60: ramseyP1(60 * DEG),
  q24RamseyP1Deg90: ramseyP1(90 * DEG),
  q24RamseyP1Deg180: ramseyP1(180 * DEG),
  q24RamseyP1Deg120: ramseyP1(120 * DEG),
  q24RamseyGap: Math.max(...PHIS.map((p) => Math.abs(ramseyP1(p) - Math.cos(p / 2) ** 2))),
  q24InDelta08: NOISE_SHIFT,
  q24TiltDeg: fieldTiltDeg(1, NOISE_SHIFT),
  q24OmPrimeNoise: fieldStrength(1, 0.8),
  q24PrecessGap: Math.max(...precessDensity(NOISE_FIELD, NOISE_M0, 1.7).map((v, i) => Math.abs(v - precessM(NOISE_FIELD, NOISE_M0, 1.7)[i]))),
  q24Gauss1: gaussianCoherence(1),
  q24Gauss2: gaussianCoherence(2),
  q24GaussE: gaussianCoherence(Math.SQRT2),
  q24Gauss15: gaussianCoherence(1.5),
  q24GaussGap: Math.abs(gaussianCoherence(1) - gaussianCoherenceClosed(1)),
  q24InTauFast: TAU_FAST,
  q24T2starFast: t2star(1, TAU_FAST),
  q24T2starSlow: t2star(1, 10),
  q24T2starStatic: t2starStaticLimit(1),
  q24T2starWhite: t2starFastLimit(1, TAU_FAST),
  q24OuVarGap: Math.abs(ouVariance(1.7, 1, 0.8) - ouVarianceQuad(1.7, 1, 0.8)),
  q24T2starMid: t2star(1, 1),
  q24TiltDeg2: fieldTiltDeg(2, 1.5),

  // ---- q24-decoupling
  q24EchoGap: Math.max(...ECHO_DELTAS.map((dl) => maxd(echoSequence(dl, 1.3), [[c(-1), c(0)], [c(0), c(-1)]]))),
  q24EchoCoh10: echoCoherence(1, 1, 10),
  q24RamseyCoh10: ouCoherence(2, 1, 10),
  q24EchoCoh01: echoCoherence(1, 1, TAU_FAST),
  q24RamseyCoh01: ouCoherence(2, 1, TAU_FAST),
  q24EchoVarGap: Math.abs(echoVariance(1, 1, 3) - echoVarianceQuad(1, 1, 3)),
  q24AccumDeg: accumulatedErrorDeg(EPS_SMALL, 10),
  q24AccumGap: r(Math.abs(accumulatedErrorDeg(0.01, 10) - pulseTrainAngleDeg(0.01, 10, false)), 9),
  q24PlainPulses: pulseTrainP0(EPS_SMALL, 10, false),
  q24AltPulses: pulseTrainP0(EPS_SMALL, 10, true),
  q24Accum27: accumulatedErrorDeg(0.005, 15),
  q24EchoCohTau2: echoCoherence(2, 1, 10),
  q24RamseyCohTau2: ouCoherence(4, 1, 10),
} as const

export type ValueKey = keyof typeof V
export const claim = keyedClaim<ValueKey>()
export { claimKey, close, d, pct, tf, uf }
