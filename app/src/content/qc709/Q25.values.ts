/**
 * Chapter Q25 numbers (Physics 709, "Qubits made of atoms: neutral atoms and trapped ions"), computed once with the engine (physics/qc/atoms.ts and iontrap.ts; the laser-cooling numbers
 * reuse the Optics Lab engine physics/optics/cooling.ts, ruling Z4). Plan: docs/roles/proposals/P-Q25-story.md; rulings docs/roles/decisions/qc709-Q20-Q27.md (Z1-Z7).
 *
 * Every number a learner reads in Q25 comes from `V` and is backed by a keyed claim (content.test.tsx "claims hold"); the numpy twin of each key is in
 * physics/__fixtures__/claims-qc709/q25.json (pipeline/claims_qc709/q25.py, an independent route built on pipeline/q25_numpy.py: scipy.stats laws, brentq, expm/eigh of dense atoms, solve_ivp
 * for the Mathieu monodromy, an analytic Hessian, DOP853 over the force Hamiltonian; never the engine's own code). Keys start with `q25` and are unique across all courses.
 *
 * Conventions. hbar = 1 in the gate matrices, SI where a unit is shown; |g> = |0>, |e> = |1>. The unit of a number is the unit the text prints it in (microkelvin, millimetres per second, millions
 * per second, MHz, nm, micrometres, ms), so a displayed digit string is `d(V.key, digits)`. Model inputs (stated, not measured; ruling Z2: no hardware result appears as a number): the wavelength and
 * gamma/2pi of Bergou's Table 13.1 (atomic physics), the caesium clock frequency (it defines the second), the strontium 698 nm line (Fig. 13.3), Bergou's beryllium trap (p. 238: m, V0, omega_rf, z_c),
 * the light-shift fraction 0.00025 of Fig. 13.5 with trap frequencies 50, 50 and 10 kHz, the readout means 0.2 and 8.2, 313 nm for Be+ (ours, the book does not print it) and the gate parameters of
 * Units 25.3 and 25.6. Every `...Gap` value is a max-abs difference of two routes (about 1e-16 or 1e-9) ROUNDED to 6-9 places, so it is 0 and the twin (a different route) agrees.
 * Values from a numerical integration, a root search or a finite difference are rounded to the digits the text shows, so a twin built on another integrator agrees to 1e-12.
 */
import { abs } from '../../physics/complex'
import { maxAcceleration } from '../../physics/optics/cooling'
import { wState } from '../../physics/qc/state'
import {
  PRINTED_T_DOPPLER_UK,
  TABLE_13_1,
  bestCutoff,
  binomialTail,
  blockadeRadiusScale,
  dopplerT,
  forceOverGravity,
  gammaIdentityGap,
  groundSublevels,
  heatAfter,
  heatPerPhoton,
  lightFrequency,
  logSlope,
  maxScatterRate,
  parityLoad,
  photonExponent,
  poissonConvolutionGap,
  poissonPmf,
  ramanLoss,
  ramanLossEstimate,
  readoutError,
  recoilSpeed,
  recoilT,
  rydbergBest,
  rydbergError,
  rydbergIdealGap,
  sandwichGapX,
  sandwichGapY,
  scaleFor,
  semiEnvelope,
  sitesFor,
  stopRow,
  t2starCoeff,
  t2starOverT0,
  t2starQuantum,
  t2starSemi,
  thermalPhotons,
  thermalSpeed,
  thermalT0,
  vdwScale,
  wCoupling,
  wCouplingClosed,
  zzCzGap,
} from '../../physics/qc/atoms'
import {
  BE_TRAP,
  carrierExact,
  coolTime,
  coolTimeNaive,
  czBell,
  czCircuit,
  czRun,
  ghzScan,
  kickCircuit,
  lambDicke,
  lambDickeMicrowave,
  localisation,
  mathieuBeta,
  mathieuEdge,
  msBell,
  msBookTime,
  msCircuit,
  msLoops,
  msOmegaTilde,
  msTime,
  pulseFromGround,
  quadrupoleCurvatures,
  recoilOverQuantum,
  recoilState,
  secularExact,
  sidebandCircuit,
  sidebandExact,
  sidebandFirstOrder,
  smallestRf,
  bchGap,
  trapParams,
  twoIonModes,
  twoIonPotential,
  twoIonSpacing,
  vacuumWeight,
  zeroPoint,
} from '../../physics/qc/iontrap'
import { rydbergGate } from '../../physics/qc/atoms'
import type { Circuit } from '../../physics/qc/circuit'
import type { Mat } from '../../physics/linalg'
import { claimKey, close, d, keyedClaim, pct, tf, uf } from '../claimKit'

const r = (x: number, places: number): number => Number(Math.abs(x) < 0.5 * 10 ** -places ? 0 : x.toFixed(places))
const TWO_PI = 2 * Math.PI
const MHZ = TWO_PI * 1e6
/** 10^k as a number of whole digits grouped by thin spaces for a count the text writes without a decimal point (a count is not read as a decimal). */
export const grp = (x: number): string => String(Math.round(x)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ')

/* ---------------------------------------------------------------------------------------------- */
/* Model inputs                                                                                    */
/* ---------------------------------------------------------------------------------------------- */
const RB = TABLE_13_1.Rb
const CS = TABLE_13_1.Cs
const NU_CS = 9_192_631_770
const NU_SR = lightFrequency(698e-9)
const DARK = 0.2
const SIGNAL = 8
const BRIGHT = DARK + SIGNAL
const ETA_LS = 2.5e-4
const OMEGAS_TRAP = [TWO_PI * 50e3, TWO_PI * 50e3, TWO_PI * 10e3]
const TRAP = trapParams(BE_TRAP)
const EDGE = mathieuEdge()
const WZ = TRAP.omegaZ
const LAMBDA_BE = 313e-9
const ETA0 = lambDicke(LAMBDA_BE, BE_TRAP.massKg, WZ)
const SEC = secularExact(TRAP.q, BE_TRAP.omegaRf)
const MODES = twoIonModes(BE_TRAP.massKg, WZ)
const LOC = localisation(1e-5, BE_TRAP)
const TRAP15 = trapParams({ ...BE_TRAP, omegaRf: TWO_PI * 15e6 })
const STOP = stopRow(RB, 300)
const BEST = [1e-4, 1e-5, 1e-6].map((g) => rydbergBest(g))
const TAUS = [1e4, 1e5, 1e6]
const RAMAN50 = ramanLoss(50, 1)
const RAMAN200 = ramanLoss(200, 1)
const MS_BASE = { etaOmega: 0.1, delta: 1, N: 2, nmax: 14 }
const MS_BELL = (n0: number): number => msBell({ ...MS_BASE, n0, t: msTime(25, 1) })
const MS_NO_LOOP = 1 - msBell({ n0: 0, etaOmega: 0.12, delta: 1, N: 2, nmax: 14, t: msBookTime(0.12, 1) })
const MS_K17 = 1 - msBell({ n0: 0, etaOmega: 0.12, delta: 1, N: 2, nmax: 14, t: msTime(17, 1) })
const GHZ = [2, 3, 4].map((n) => ghzScan(n))

/* ---------------------------------------------------------------------------------------------- */
/* Stage data (every y is the engine's; never typed)                                                  */
/* ---------------------------------------------------------------------------------------------- */
const speedAt = (n: number): number => STOP.speed - n * recoilSpeed(RB)
/** Unit 25.1: the speed of the rubidium atom against the photons it absorbed, six points from the oven speed to 0 (m/s). */
export const PTS_SPEED = [0, 1, 2, 3, 4, 5].map((k) => ({ x: Math.round((k * STOP.photons) / 5), y: Math.max(0, speedAt((k * STOP.photons) / 5)) }))
/** The four Doppler temperatures of Table 13.1 recomputed (microkelvin) and as printed. */
export const TD_NAMES = ['Rb', 'Cs', 'Sr 461', 'Sr 689'] as const
export const PTS_TD_OURS = (['Rb', 'Cs', 'Sr461', 'Sr689'] as const).map((k) => dopplerT(TABLE_13_1[k]) * 1e6)
export const PTS_TD_PRINTED = (['Rb', 'Cs', 'Sr461', 'Sr689'] as const).map((k) => PRINTED_T_DOPPLER_UK[k])
/** Unit 25.1: the chance of at least 100 atoms against the number of sites loaded at a half. */
export const PTS_SITES = [190, 200, 210, 220, 230, 235, 240, 250].map((N) => ({ x: N, y: binomialTail(N, 0.5, 100) }))
/** Unit 25.2: count histograms (chance against the count n). */
export const PMF = (mean: number, nMax: number): number[] => Array.from({ length: nMax + 1 }, (_, n) => poissonPmf(n, mean))
export const PTS_HIST = { dark: PMF(DARK, 11), bright: PMF(BRIGHT, 11), signal: PMF(SIGNAL, 7), dark8: PMF(DARK, 7), bright8: PMF(BRIGHT, 7), darkSlow: PMF(DARK * 1.51, 11), brightSlow: PMF(BRIGHT * 1.51, 11) }
export const PTS_ERR = Array.from({ length: 8 }, (_, k) => ({ x: k + 1, y: readoutError(k + 1, DARK, BRIGHT) }))
export const PTS_T2 = [1, 2, 5, 10].map((uk) => ({ x: uk, semi: t2starSemi(uk * 1e-6, ETA_LS) * 1e3, quantum: t2starQuantum(uk * 1e-6, ETA_LS, OMEGAS_TRAP) * 1e3 }))
/** Unit 25.3: Raman loss of one pi pulse against the detuning over gamma, and the estimate (pi/2) gamma/|Delta|. */
export const PTS_RAMAN = [30, 50, 100, 200].map((D) => ({ x: D, sim: ramanLoss(D, 1).loss, est: ramanLossEstimate(D, 1) }))
export const PTS_SCALING = [25, 30, 35, 40, 45, 50, 55, 60].map((n) => ({ x: n, u: vdwScale(25, n), rb: blockadeRadiusScale(25, n) }))
export const PTS_RYD = TAUS.map((tau, i) => ({ x: tau, y: BEST[i].error }))
/** The Rydberg gate for the stage: |++> through the blockade-limit block diag(1, -1, -1, -1). */
const rydBox = (M: Mat) => M.map((row) => row.map((z): [number, number] => [z.re, z.im]))
export const C_SITE: Circuit = {
  version: 1,
  qubits: 1,
  init: '0',
  wires: ['atom'],
  columns: [
    [{ op: 'gate', gate: 'Ry', targets: [0], params: [Math.PI / 2], label: 'global' }],
    [{ op: 'gate', gate: 'Rz', targets: [0], params: [0.7], label: 'local θ' }],
    [{ op: 'gate', gate: 'Ry', targets: [0], params: [-Math.PI / 2], label: 'global' }],
  ],
}
export const C_CZG: Circuit = {
  version: 1,
  qubits: 2,
  init: '00',
  wires: ['control', 'target'],
  columns: [[{ op: 'gate', gate: 'H', targets: [0] }, { op: 'gate', gate: 'H', targets: [1] }], [{ op: 'unitary', matrix: rydBox(rydbergGate(1, Infinity, 0)), targets: [0, 1], label: 'π–2π–π' }]],
}
/** Unit 25.4: the three curvatures of the quadrupole (x, y, z), and the two-ion potential of the stage. */
export const PTS_CURV = quadrupoleCurvatures().map((k, i) => ({ x: i + 1, y: r(k, 5) }))
/** Unit 25.5: sideband strengths against n at eta = 0.1 (exact and first order), cooling times, and the two Lamb-Dicke numbers. */
export const PTS_SB = Array.from({ length: 11 }, (_, n) => ({ x: n, exact: sidebandExact(0.1, n), first: sidebandFirstOrder(0.1, n) }))
export const PTS_COOL = Array.from({ length: 10 }, (_, k) => ({ x: k + 1, sum: coolTime(k + 1), naive: coolTimeNaive(k + 1) }))
export const ETA_MICRO = lambDickeMicrowave(NU_CS, BE_TRAP.massKg, WZ)
export const C_SB: Circuit = sidebandCircuit()
export const C_KICK_SMALL: Circuit = kickCircuit(0.1)
export const C_KICK: Circuit = kickCircuit(ETA0)
/** Unit 25.6. */
export const C_CZ: Circuit = czCircuit()
export const C_MS4: Circuit = msCircuit(4, GHZ[0].theta)
export const PTS_CZMS = [0, 1, 2, 3, 4].map((n) => ({ x: n, cz: czBell(n, 8), ms: MS_BELL(n) }))
export const PTS_LOOPS = [14, 14.5, 15, 15.5, 16, 16.5, 17, 17.36, 17.5, 18, 18.5, 19, 19.5, 20].map((K) => ({
  x: K,
  y: Math.max(1e-6, 1 - msBell({ n0: 0, etaOmega: 0.12, delta: 1, N: 2, nmax: 14, t: msTime(K, 1) })),
}))

export const V = {
  // ---- q25-cooling
  q25ZeemanCs: groundSublevels(3.5, 0.5),
  q25NuclearSr: groundSublevels(4.5, 0),
  q25nbarCs300: thermalPhotons(NU_CS, 300),
  q25OptExponent: photonExponent(NU_SR, 300),
  q25FreqRatio: NU_SR / NU_CS,
  q25vRecRb: recoilSpeed(RB) * 1e3,
  q25vCs300: thermalSpeed(300, CS.massKg),
  q25vCs10mK: thermalSpeed(0.01, CS.massKg),
  q25vRb300: STOP.speed,
  q25rmaxRb: maxScatterRate(RB) / 1e6,
  q25GammaRb: RB.gamma / MHZ,
  q25aRb: r(maxAcceleration(RB), 2),
  q25aOverG: r(forceOverGravity(RB), 2),
  q25NstopRb: r(STOP.photons, 3),
  q25tstopRb: STOP.time * 1e3,
  q25DstopRb: STOP.length,
  q25HeatPerPhoton: heatPerPhoton(RB) * 1e6,
  q25Heat100: heatAfter(RB, 100) * 1e6,
  q25TDRb: dopplerT(TABLE_13_1.Rb) * 1e6,
  q25TDCs: dopplerT(TABLE_13_1.Cs) * 1e6,
  q25TDSr461: dopplerT(TABLE_13_1.Sr461) * 1e6,
  q25TDSr689: dopplerT(TABLE_13_1.Sr689) * 1e6,
  q25TrRb: recoilT(TABLE_13_1.Rb) * 1e6,
  q25TrCs: recoilT(TABLE_13_1.Cs) * 1e6,
  q25TrSr461: recoilT(TABLE_13_1.Sr461) * 1e6,
  q25TrSr689: recoilT(TABLE_13_1.Sr689) * 1e6,
  q25TDPrintedRb: PRINTED_T_DOPPLER_UK.Rb,
  q25TDPrintedCs: PRINTED_T_DOPPLER_UK.Cs,
  q25TDPrintedSr461: PRINTED_T_DOPPLER_UK.Sr461,
  q25TDPrinted: PRINTED_T_DOPPLER_UK.Sr689,
  q25ScatPerDepth: 1 / 10 ** 2 / (1 / 10),
  q25PodMu1: parityLoad(1),
  q25Sites100: sitesFor(100, 0.99),
  q25P100of200: binomialTail(200, 0.5, 100),
  q25P100of235: binomialTail(235, 0.5, 100),
  q25cSpeed: STOP.speed - 20000 * recoilSpeed(RB),
  q25cHeat: heatAfter(RB, 200) * 1e6,
  q25cOdd: parityLoad(2),

  // ---- q25-readout
  q25MeanDark: DARK,
  q25MeanBright: BRIGHT,
  q25PDark0: poissonPmf(0, DARK),
  q25PBright8: poissonPmf(8, BRIGHT),
  q25ConvGap: r(poissonConvolutionGap(SIGNAL, DARK), 9),
  q25GammaIdGap: r(Math.max(gammaIdentityGap(3, DARK), gammaIdentityGap(3, BRIGHT)), 6),
  q25ncOpt: bestCutoff(DARK, BRIGHT).nc,
  q25ErrOpt: bestCutoff(DARK, BRIGHT).error,
  q25ErrNc1: readoutError(1, DARK, BRIGHT),
  q25ErrNc5: readoutError(5, DARK, BRIGHT),
  q25ErrDark: readoutError(3, DARK, BRIGHT, 1, 0),
  q25ErrBright: readoutError(3, DARK, BRIGHT, 0, 1),
  q25ScaleFor1e3: scaleFor(1e-3, DARK, BRIGHT).scale,
  q25EtaLS: ETA_LS,
  q25T2starCoeff: t2starCoeff(),
  q25T2starOverT0: t2starOverT0(),
  q25T2star10uK: t2starSemi(1e-5, ETA_LS) * 1e3,
  q25T2star1uK: t2starSemi(1e-6, ETA_LS) * 1e3,
  q25T2starQ10uK: t2starQuantum(1e-5, ETA_LS, OMEGAS_TRAP) * 1e3,
  q25T2starQ1uK: t2starQuantum(1e-6, ETA_LS, OMEGAS_TRAP),
  q25SemiAtT2star: semiEnvelope(t2starSemi(1e-5, ETA_LS), thermalT0(1e-5, ETA_LS)),
  q25TwoThirdsArg: 2 / 3,
  q25OneThirdArg: 1 / 3,
  q25QuantRatio1uK: t2starQuantum(1e-6, ETA_LS, OMEGAS_TRAP) / t2starSemi(1e-6, ETA_LS),
  q25rP0: poissonPmf(0, 0.5),
  q25rSum: 6 + 0.3,
  q25rErr: readoutError(2, DARK, BRIGHT),

  // ---- q25-atom-gates
  q25InTheta: 0.7,
  q25RBexp: 11 / 6,
  q25IdRxGap: r(sandwichGapX(0.7), 9),
  q25IdRyGap: r(sandwichGapY(0.7), 9),
  q25RamanLoss50: r(RAMAN50.loss, 5),
  q25RamanLoss200: r(RAMAN200.loss, 5),
  q25RamanHalfPi50: ramanLossEstimate(50, 1),
  q25RamanTpiRatio50: r(RAMAN50.time / (TWO_PI * 50), 4),
  q25VdwExp: 2 * (2 * 2) + 3,
  q25RydScale2n: vdwScale(25, 50),
  q25RBscale2n: blockadeRadiusScale(25, 50),
  q25RydIdealGap: r(rydbergIdealGap(), 6),
  q25ZZCZgap: r(zzCzGap(), 6),
  q25RydErr100: r(rydbergError(1, 100, 0), 9),
  q25RydErrOpt4: BEST[0].error,
  q25RydErrOpt5: BEST[1].error,
  q25RydErrOpt6: BEST[2].error,
  q25RydOptOm4: BEST[0].omega,
  q25RydOptOm5: BEST[1].omega,
  q25RydOptOm6: BEST[2].omega,
  q25RydSlopeErr: r(-logSlope(TAUS, BEST.map((b) => b.error)), 6),
  q25RydSlopeOm: r(-logSlope(TAUS, BEST.map((b) => b.omega)), 6),
  q25TwoThirds: 2 ** (-2 / 3),
  q25TenfoldFactor: 10 ** (-2 / 3),
  q25WCouple4: wCoupling(4),
  q25WCouple100: wCouplingClosed(100),
  q25W3Amp: abs(wState(3)[1]),
  q25aRaman: ramanLossEstimate(100, 1),

  // ---- q25-ion-trap
  q25EarnshawSum: r(quadrupoleCurvatures().reduce((s, k) => s + k, 0), 6),
  q25StabEdge: r(EDGE, 4),
  q25qz: r(TRAP.q, 4),
  q25RfMin: r(smallestRf(BE_TRAP, EDGE) / MHZ, 4),
  q25wz: WZ / MHZ,
  q25wzx: TRAP.omegaXY / MHZ,
  q25UzetaCoef: TRAP.uCoefK / 1e10,
  q25Zloc: LOC.Z * 1e9,
  q25zeta: LOC.zeta * 1e9,
  q25Depth: TRAP.depthK,
  q25BetaExact: r(mathieuBeta(TRAP.q), 4),
  q25BetaApprox: r(TRAP.q / Math.SQRT2, 4),
  q25SecExact: r(SEC / MHZ, 4),
  q25SecDiff: r(SEC / WZ - 1, 4),
  q25Zeq: twoIonSpacing(BE_TRAP.massKg, WZ) * 1e6,
  q25TwoIonMin: twoIonPotential(1),
  q25ModeRatio: r(MODES.ratio, 4),
  q25Stretch: r(MODES.stretch / MHZ, 4),
  q25tq: TRAP15.q,
  q25twz: TRAP15.omegaZ / MHZ,

  // ---- q25-phonons
  q25RedFromG0: r(pulseFromGround('red'), 9),
  q25BlueFromE0: r(pulseFromGround('blue'), 9),
  q25z0: zeroPoint(BE_TRAP.massKg, WZ) * 1e9,
  q25eta0: ETA0,
  q25eta2: recoilOverQuantum(LAMBDA_BE, BE_TRAP.massKg, WZ),
  q25BCHgap: r(bchGap(0.3), 9),
  q25KickKeep: Math.hypot(recoilState(ETA0, 24)[0].re, recoilState(ETA0, 24)[0].im),
  q25BlueExact0: sidebandExact(0.1, 0),
  q25BlueExact5: sidebandExact(0.1, 5),
  q25BlueExact10: sidebandExact(0.1, 10),
  q25BlueFirst5: sidebandFirstOrder(0.1, 5),
  q25BlueFirst10: sidebandFirstOrder(0.1, 10),
  q25Carrier0: carrierExact(0.1, 0),
  q25CoolT10: coolTime(10),
  q25CoolNaive10: coolTimeNaive(10),
  q25etaMicro: ETA_MICRO * 1e6,
  q25MicroSlow: r(1 / ETA_MICRO, 2),
  q25MicroLambda: (299792458 / NU_CS) * 100,
  q25ClockGHz: NU_CS / 1e9,
  q25pEta2: 0.2 ** 2,
  q25pBlue: sidebandFirstOrder(0.1, 8),

  // ---- q25-ion-gates
  q25CZbell0: r(czBell(0, 8), 6),
  q25CZbell1: r(czBell(1, 8), 6),
  q25CZbell2: r(czBell(2, 8), 6),
  q25CZphonon0: r(vacuumWeight(czRun(0, 8), 8), 6),
  q25MSetaOmega: 0.1,
  q25MSetaOmega2: 0.12,
  q25MSOmTilde: msOmegaTilde(0.1, 1),
  q25MSBell0: r(MS_BELL(0), 6),
  q25MSBell1: r(MS_BELL(1), 6),
  q25MSBell2: r(MS_BELL(2), 6),
  q25MSBell4: r(MS_BELL(4), 6),
  q25MSloopsK: msLoops(0.1, 1),
  q25MSGateTime: msTime(25, 1),
  q25MSloops1736: msBookTime(0.12, 1) / TWO_PI,
  q25MSInfid1736: r(MS_NO_LOOP, 6),
  q25MSInfidK17: r(MS_K17, 7),
  q25GHZfid2: r(GHZ[0].fidelity, 6),
  q25GHZfid3: r(GHZ[1].fidelity, 6),
  q25GHZfid4: r(GHZ[2].fidelity, 6),
  q25GHZtheta: r(GHZ[0].theta, 4),
  q25gOmt: msOmegaTilde(0.2, 2),
  q25gLoops: msLoops(0.05, 1),
} as const

export type ValueKey = keyof typeof V
export const claim = keyedClaim<ValueKey>()
export { claimKey, close, d, pct, tf, uf }
