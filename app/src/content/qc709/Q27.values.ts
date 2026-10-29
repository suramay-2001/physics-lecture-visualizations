/**
 * Chapter Q27 numbers (Physics 709, "Qubits in chips: transmons and quantum dots"), computed once with the engine (physics/qc/solid.ts).
 * Plan: docs/roles/proposals/P-Q27-story.md; rulings docs/roles/decisions/qc709-Q20-Q27.md (Z1-Z7).
 *
 * Every number a learner reads in Q27 comes from `V` and is backed by a keyed claim (content.test.tsx "claims hold"); the numpy twin of each key is in
 * physics/__fixtures__/claims-qc709/q27.json (pipeline/claims_qc709/q27.py, an independent route built on pipeline/solid_numpy.py: LAPACK's tridiagonal solver and 50-digit mpmath for
 * the charge qubit, scipy quad + brentq for the Cooper gap equation, Boltzmann sums, expm of Kronecker Paulis; never the engine's own code). Keys start with `q27` and are unique across all courses.
 *
 * Conventions. Every value is stored in the unit and to the digits the text shows (a mantissa for a power of ten: `q27Disp10` is the dispersion in units of 1e-7 E_C), so the engine and the
 * twin agree to 1e-12 after rounding (`rd`); a ratio of two noisy numbers is rounded to fewer digits. A number the text shows with a minus sign is stored as its size (the number reader skips the sign)
 * and the sign is asserted in a claim through `SIGN`. Model inputs (C = 0.3 pF, L = 3 nH, g/2pi = 10 MHz, ...) are V constants too. Every `...Gap` value is a max-abs difference of two routes
 * and is about 1e-16, not exactly 0: it is shown through d(x, 0) and claimed with close(x, 0, 1e-12).
 * Experiment-derived figures of Bergou Chapter 15 (coherence times, fidelities, device frequencies) are NOT numbers here (ruling Z2): they appear in words only.
 */
import { concurrencePure } from '../../physics/qc/entangle'
import { runCircuit, type Circuit } from '../../physics/qc/circuit'
import {
  anharmonicity,
  anharmonicityFormula,
  chargeDispersion,
  chargeH,
  chargingEnergy,
  chargingEnergyCommon,
  commutatorGap,
  cooperBinding,
  cooperBindingExp,
  cooperBindingQuad,
  cooperativity,
  cutGap,
  czCircuitGap,
  czDotCircuit,
  dispersionKoch,
  dispersionPrinted,
  dispersiveShift,
  dispersiveShiftExact,
  dotBox,
  exchangeCircuit,
  exchangeEnergies,
  f01Spread,
  firstGap,
  fluxQuantum,
  fullGap,
  gapSlope,
  groundTemperature,
  halfSwapChance,
  harmonicGap,
  hfOverK,
  iswapCircuit,
  iswapGap,
  iswapTime,
  josephsonEJ,
  josephsonFreq,
  josephsonI0,
  josephsonL,
  josephsonLcFreq,
  josephsonPhase,
  lcFreq,
  lcImpedance,
  lcOmega,
  lcWavelength,
  leakRatio,
  loopFlux,
  londonLength,
  oscillatorCoupling,
  oscillatorHGap,
  oscillatorLevels,
  piPulseCircuit,
  piTime,
  rabiField,
  s1s2Eigen,
  spinDownChance,
  sqrtSwapCzGap,
  sqrtSwapSquareGap,
  squidFluxFor,
  squidScale,
  swapChance,
  swapPulseGap,
  thermalMicroEv,
  thermalGround,
  thermalN,
  transmonLadder,
  twoLevelCut,
  vacuumRabi,
  zeemanField,
  zeemanFreq,
} from '../../physics/qc/solid'
import { H_PLANCK } from '../../physics/constants'
import type { PlotPoint } from '../schema'
import { claimKey, close, d, keyedClaim, pct, tf, uf } from '../claimKit'

const TAU = 2 * Math.PI
/** Round to k decimals (the digits the text shows): engine and twin then agree exactly. */
const rd = (x: number, k: number): number => Number(x.toFixed(k))

/* ---------------------------------------------------------------------------------------------- */
/* Model inputs (stated in the text as "model, ours")                                                 */
/* ---------------------------------------------------------------------------------------------- */
const L_NH = 3e-9
const C_PF = 0.3e-12
const F_LC = lcFreq(L_NH, C_PF)
const I0 = josephsonI0(L_NH)
const G = TAU * 1e7 // g/2pi = 10 MHz
const DELTA = TAU * 1e8 // Delta/2pi = 100 MHz
const KAPPA = (TAU * 10e9) / 1e7 // omega_r/Q at 10 GHz and Q = 1e7
const GAMMA = 1 / 100e-6 // 1/T1 at T1 = 100 microseconds
const OMEGA = TAU * 1e7 // Omega/2pi = 10 MHz
const EJ_IN = 0.2
const NG_IN = 0.3
const B_IN = 0.1
const F_SPIN = zeemanFreq(B_IN)

/* ---------------------------------------------------------------------------------------------- */
/* The circuits (plan "Stage shorthand"), built once so a story's stage states share one object      */
/* ---------------------------------------------------------------------------------------------- */
/** The pi pulse on one wire: C_X. */
export const C_X: Circuit = piPulseCircuit()
const memoISW = new Map<number, Circuit>()
const memoEX = new Map<number, Circuit>()
/** The iSWAP-type exchange box on |01>, C_ISW(tau): two wires, one column. Memoised. */
export const C_ISW = (tau: number): Circuit => {
  let C = memoISW.get(tau)
  if (!C) memoISW.set(tau, (C = iswapCircuit(tau)))
  return C
}
/** The exchange pulse box on |01>, C_EX(phi): two wires, one column. Memoised. */
export const C_EX = (phi: number): Circuit => {
  let C = memoEX.get(phi)
  if (!C) memoEX.set(phi, (C = exchangeCircuit(phi)))
  return C
}
/** Eq. 15.14 as a circuit on |++>: H column, half pulse, Rz, half pulse, Rz column (5 columns). */
export const C_CZD: Circuit = czDotCircuit()

/* ---------------------------------------------------------------------------------------------- */
/* Points for the `plot` points mode (every y is the engine's; x is the plotted variable)             */
/* ---------------------------------------------------------------------------------------------- */
const P = (x: number, y: number, group?: string, label?: string): PlotPoint => ({ x, y, ...(group ? { group } : {}), ...(label ? { label } : {}) })
const range = <T,>(n: number, f: (k: number) => T): T[] => Array.from({ length: n }, (_, k) => f(k))
const NG_GRID = range(9, (k) => k / 8)
const NG_FINE = range(17, (k) => k / 16)
const LEVELS_LC = oscillatorLevels(L_NH, C_PF)
const LADDER20 = transmonLadder(20)
const SHIFT_X = [20, 50, 100, 200, 400]
const DISPERSION_R = [5, 10, 15, 20, 25, 30]
const FLUX_P = [0, 1, 2, 3, 4]
const PHI0_E15 = fluxQuantum() * 1e15
const LOOP_X = loopFlux(1e-3, 1e-12)

export const PTS = {
  lcCurrent: range(9, (k) => P(k / 8, Math.cos(TAU * (k / 8)))),
  lcFreq: [0.1, 0.2, 0.3, 0.5, 1.0].map((c) => P(c, lcFreq(L_NH, c * 1e-12) / 1e9, undefined, c === 0.3 ? 'model' : undefined)),
  lcRungs: range(5, (n) => P(n, LEVELS_LC[n])),
  lcLeak: [...range(4, (n) => P(n, LEVELS_LC[n + 1] - LEVELS_LC[n], 'step energy')), ...range(4, (n) => P(n, oscillatorCoupling(n), 'pulse strength'))],
  lcThermal: [0.01, 0.02, 0.05, 0.1, 0.25, 1, 4, 300].map((T) => P(T, thermalGround(F_LC, T))),
  cooper: [
    ...[0.15, 0.2, 0.25, 0.3, 0.4, 0.5, 0.6].map((nv) => P(nv, cooperBinding(nv, 1), 'gap equation')),
    ...[0.15, 0.2, 0.25, 0.3, 0.4, 0.5, 0.6].map((nv) => P(nv, cooperBindingExp(nv, 1), 'exponential form')),
  ],
  london: range(9, (k) => P(k / 2, Math.exp(-k / 2))),
  flux: FLUX_P.map((p) => P(p, p * PHI0_E15)),
  fluxExample: [...FLUX_P.map((p) => P(p, p * PHI0_E15, 'allowed')), P(LOOP_X, LOOP_X * PHI0_E15, 'applied by 1 mT', 'applied')],
  sinTheta: range(17, (k) => P(-1 + k / 8, Math.sin(Math.PI * (-1 + k / 8)))),
  phaseTime: range(9, (k) => P(k / 4, josephsonPhase(1e-6, k / 4 / josephsonFreq(1e-6)) / TAU)),
  lfreq: range(9, (k) => P(10 * k, josephsonLcFreq(I0, C_PF, (10 * k * Math.PI) / 180) / josephsonLcFreq(I0, C_PF, 0))),
  well: [
    ...range(11, (k) => P(-1 + k / 5, 1 - Math.cos(Math.PI * (-1 + k / 5)), '1 − cos θ')),
    ...range(11, (k) => P(-1 + k / 5, (Math.PI * (-1 + k / 5)) ** 2 / 2, 'θ²/2')),
  ],
  squid: range(11, (k) => P(k / 10, squidScale(k / 10))),
  parabolas: [-1, 0, 1, 2].flatMap((n) => [0, 0.25, 0.5, 0.75, 1].map((ng) => P(ng, (n - ng) ** 2, `n = ${n}`))),
  parabolasTwo: [0, 1].flatMap((n) => NG_GRID.map((ng) => P(ng, (n - ng) ** 2, `n = ${n}`))),
  gapCmp: [...NG_GRID.map((ng) => P(ng, fullGap(1, EJ_IN, ng), 'charge basis')), ...NG_GRID.map((ng) => P(ng, cutGap(1, EJ_IN, ng), 'two-level cut'))],
  gapFull: NG_FINE.map((ng) => P(ng, fullGap(1, EJ_IN, ng))),
  levels20: LADDER20.map((y, n) => P(n, y)),
  levelsVsHarm: [...LADDER20.map((y, n) => P(n, y, 'transmon')), ...range(5, (n) => P(n, n, 'harmonic'))],
  ladderCmp: [...range(5, (n) => P(n, n, 'LC circuit')), ...LADDER20.map((y, n) => P(n, y, 'transmon'))],
  dispersion: [
    ...DISPERSION_R.map((r) => P(r, chargeDispersion(r), 'exact')),
    ...DISPERSION_R.map((r) => P(r, dispersionKoch(r), 'exponent √(32r)')),
    ...DISPERSION_R.map((r) => P(r, dispersionPrinted(r), 'printed')),
  ],
  vacRabi: range(5, (n) => P(n, vacuumRabi(10, n))),
  rates: [P(1, (G / TAU) / 1e3, undefined, 'g'), P(2, KAPPA / TAU / 1e3, undefined, 'κ'), P(3, GAMMA / TAU / 1e3, undefined, 'γ')],
  shiftVsDelta: [...SHIFT_X.map((x) => P(x, dispersiveShift(10, x), 'g²/Δ')), ...SHIFT_X.map((x) => P(x, dispersiveShiftExact(10, x), 'exact level'))],
  shiftVsDelta200: [...SHIFT_X.map((x) => P(x, dispersiveShift(10, x), 'g²/Δ')), ...SHIFT_X.map((x) => P(x, dispersiveShiftExact(10, x), 'exact level')), P(200, dispersiveShift(10, 200), 'Δ = 200 MHz')],
  spinThermal: [0.01, 0.02, 0.05, 0.1, 0.2, 0.5, 1].map((T) => P(T, spinDownChance(F_SPIN, T))),
} as const satisfies Record<string, PlotPoint[]>

/* ---------------------------------------------------------------------------------------------- */
/* Values                                                                                          */
/* ---------------------------------------------------------------------------------------------- */
const CUT = twoLevelCut(1, EJ_IN, NG_IN)
const DISP10 = chargeDispersion(10)
const DISP20 = chargeDispersion(20)
const KOCH10 = dispersionKoch(10)
const KOCH20 = dispersionKoch(20)
const DOT = dotBox(100e-9, 0.067)
const EX = exchangeEnergies(1, 0.1)
const S1S2 = s1s2Eigen()
const CZ_FINAL = runCircuit(C_CZD).states.at(-1)!
const COS_ELEM = -chargeH(1, EJ_IN, NG_IN, 2)[2][3].re / EJ_IN

/** The signs the text shows as minus signs (the V values are sizes). */
export const SIGN = {
  anh10: anharmonicity(10),
  anh20: anharmonicity(20),
  anh50: anharmonicity(50),
  slopeOff: gapSlope(1, EJ_IN, NG_IN),
  s1s2Singlet: S1S2[0],
  zcoPrinted: -CUT.zco,
} as const

export const V = {
  // ---- q27-lc
  q27LcC: rd(C_PF * 1e12, 9),
  q27LcOmega: rd(lcOmega(L_NH, C_PF) / 1e10, 6),
  q27LcFreqGHz: rd(F_LC / 1e9, 6),
  q27LcLambdaCm: rd(lcWavelength(F_LC) * 100, 6),
  q27LcLambdaOverChip: rd(lcWavelength(F_LC) / 1e-3, 5),
  q27LcZ: rd(lcImpedance(L_NH, C_PF), 6),
  q27ZeroPoint: rd(LEVELS_LC[0], 9),
  q27CommGap: Math.max(commutatorGap(8), oscillatorHGap(L_NH, C_PF)),
  q27LeakRatio: rd(leakRatio(), 6),
  q27HfOverK: rd(hfOverK(F_LC), 6),
  q27Nbar300: rd(thermalN(F_LC, 300), 4),
  q27P0300: rd(thermalGround(F_LC, 300), 8),
  q27P01K: rd(thermalGround(F_LC, 1), 8),
  q27P020mK: rd(thermalGround(F_LC, 0.02), 8),
  q27Nbar20mK: rd(thermalN(F_LC, 0.02) * 1e6, 4),
  q27Target99: 0.99,
  q27T99mK: rd(groundTemperature(F_LC, 0.99) * 1e3, 4),

  // ---- q27-superconductivity
  q27CooperNV: 0.3,
  q27CooperB: rd(cooperBinding(0.3, 1) * 1e3, 3),
  q27CooperApprox: rd(cooperBindingExp(0.3, 1) * 1e3, 3),
  q27CooperRatio: rd(cooperBinding(0.3, 1) / cooperBindingExp(0.3, 1), 4),
  q27CooperQuadGap: Math.abs(cooperBindingQuad(0.3, 1) - cooperBinding(0.3, 1)),
  q27LondonNm: rd(londonLength(1e28) * 1e9, 4),
  q27Phi0: fluxQuantum() * 1e15,
  q27FluxLoop: rd(loopFlux(1e-3, 1e-12), 6),

  // ---- q27-josephson
  q27JosephsonMHzPerUV: rd(josephsonFreq(1e-6) / 1e6, 4),
  q27I0nA: rd(I0 * 1e9, 5),
  q27Lj60nH: rd(josephsonL(I0, Math.PI / 3) * 1e9, 6),
  q27F0GHz: rd(josephsonLcFreq(I0, C_PF, 0) / 1e9, 6),
  q27F60GHz: rd(josephsonLcFreq(I0, C_PF, Math.PI / 3) / 1e9, 6),
  q27F60Ratio: rd(josephsonLcFreq(I0, C_PF, Math.PI / 3) / josephsonLcFreq(I0, C_PF, 0), 6),
  q27EJoverH: rd(josephsonEJ(I0) / H_PLANCK / 1e9, 4),
  q27Squid025: rd(squidScale(0.25), 6),
  q27Squid13: rd(squidScale(1 / 3), 6),
  q27SquidHalf: squidScale(0.5),
  q27SquidHalfFlux: rd(squidFluxFor(0.25), 6),
  q27SquidHalfFreq: rd(Math.sqrt(squidScale(squidFluxFor(0.25))), 9),
  q27SquidQuarter: rd(squidScale(squidFluxFor(0.25)), 9),

  // ---- q27-transmon
  q27EcFactor: rd(chargingEnergy(1e-15) / chargingEnergyCommon(1e-15), 9),
  q27CosElem: rd(COS_ELEM, 9),
  q27InEJ: EJ_IN,
  q27InNg: NG_IN,
  q27ZcoTrue: rd(CUT.zco, 9),
  q27ZcoPrinted: rd(-CUT.zco, 9),
  q27UCut: rd(CUT.U, 6),
  q27GapFull: rd(fullGap(1, EJ_IN, NG_IN), 6),
  q27GapCut: rd(cutGap(1, EJ_IN, NG_IN), 6),
  q27GapDegenerate: rd(fullGap(1, EJ_IN, 0.5), 6),
  q27SlopeSweet: rd(Math.abs(gapSlope(1, EJ_IN, 0.5)), 6),
  q27SlopeOff: rd(Math.abs(gapSlope(1, EJ_IN, NG_IN)), 4),
  q27F01spread1: rd(f01Spread(1), 6),
  q27F01swing1: rd(f01Spread(1) - 1, 6),
  q27F01Excess20: rd((f01Spread(20) - 1) * 1e8, 3),
  q27E0120: rd(firstGap(20), 6),
  q27SqrtApprox20: rd(harmonicGap(20), 6),
  q27Ladder2: rd(LADDER20[2], 6),
  q27Ladder3: rd(LADDER20[3], 6),
  q27Ladder4: rd(LADDER20[4], 6),
  q27Anh10: rd(Math.abs(anharmonicity(10)), 6),
  q27Anh20: rd(Math.abs(anharmonicity(20)), 6),
  q27Anh50: rd(Math.abs(anharmonicity(50)), 6),
  q27Anh10Formula: rd(Math.abs(anharmonicityFormula(10)), 6),
  q27Anh20Formula: rd(Math.abs(anharmonicityFormula(20)), 6),
  q27Anh50Formula: rd(Math.abs(anharmonicityFormula(50)), 6),
  q27Disp10: rd(DISP10 * 1e7, 3),
  q27Disp20: rd(DISP20 * 1e9, 3),
  q27DispRatio1020: rd(DISP10 / DISP20, 1),
  q27Disp10Printed: rd(dispersionPrinted(10), 4),
  q27Disp10Koch: rd(KOCH10 * 1e6, 3),
  q27Disp20Koch: rd(KOCH20 * 1e9, 3),
  q27KochErr10: rd(KOCH10 / DISP10 - 1, 4),
  q27KochErr20: rd(KOCH20 / DISP20 - 1, 4),
  q27DispPrintedLog10: rd(Math.log10(dispersionPrinted(10) / DISP10), 3),
  q27AnhRatio1020: rd(anharmonicity(10) / anharmonicity(20), 3),

  // ---- q27-cqed
  q27VacRabi0: rd(vacuumRabi(10, 0), 6),
  q27VacRabi1: rd(vacuumRabi(10, 1), 6),
  q27VacRabi2: rd(vacuumRabi(10, 2), 6),
  q27VacRabi3: rd(vacuumRabi(10, 3), 6),
  q27VacRabi4: rd(vacuumRabi(10, 4), 6),
  q27KappakHz: rd(KAPPA / TAU / 1e3, 6),
  q27GammakHz: rd(GAMMA / TAU / 1e3, 5),
  q27Coop: rd(cooperativity(G, KAPPA, GAMMA) / 1e7, 5),
  q27DispShiftMHz: rd(dispersiveShift(G, DELTA) / TAU / 1e6, 6),
  q27DispSepMHz: rd((2 * dispersiveShift(G, DELTA)) / TAU / 1e6, 6),
  q27DispShiftExact: rd(dispersiveShiftExact(10, 100), 5),
  q27ReadoutRatio: rd((2 * dispersiveShift(G, DELTA)) / KAPPA, 6),
  q27IswapNs: rd(iswapTime(G, DELTA) * 1e9, 6),
  q27ISwapQuarterP: rd(swapChance(Math.PI / 4), 9),
  q27IswapGap: iswapGap(),
  q27Iswap200Ns: rd(iswapTime(G, 2 * DELTA) * 1e9, 6),
  q27DispShift200: rd(dispersiveShift(G, 2 * DELTA) / TAU / 1e6, 6),

  // ---- q27-dots
  q27InB: B_IN,
  q27InB14: 1.4,
  q27Zeeman01GHz: rd(F_SPIN / 1e9, 6),
  q27ZeemanTmK: rd(hfOverK(F_SPIN) * 1e3, 5),
  q27Zeeman14GHz: rd(zeemanFreq(1.4) / 1e9, 6),
  q27ZeemanPDown100mK: rd(spinDownChance(F_SPIN, 0.1), 6),
  q27ZeemanPDown20mK: rd(spinDownChance(F_SPIN, 0.02), 6),
  q27RabiBxmT: rd(rabiField(OMEGA) * 1e3, 6),
  q27PiTimeNs: rd(piTime(OMEGA) * 1e9, 6),
  q27InK: 0.1,
  q27ES: rd(EX.singlet, 9),
  q27ET: rd(EX.triplet, 9),
  q27S1S2Singlet: rd(Math.abs(S1S2[0]), 9),
  q27S1S2Triplet: rd(S1S2[1], 9),
  q27SwapPulseGap: swapPulseGap(),
  q27HalfSwapP: rd(halfSwapChance(), 9),
  q27SqrtSwapSquareGap: sqrtSwapSquareGap(),
  q27Cz1514Gap: sqrtSwapCzGap(),
  q27CzCircuitGap: czCircuitGap(),
  q27CzDotConc: rd(concurrencePure(CZ_FINAL), 9),
  q27F5GHz: rd(F_LC / 1e9, 6),
  q27ZeemanB5GHz: rd(zeemanField(F_LC), 6),
  q27DotMass: 0.067,
  q27DotE1meV: rd(DOT.E1meV, 6),
  q27DotE2meV: rd(DOT.E1meV + DOT.gapMeV, 6),
  q27DotGapmeV: rd(DOT.gapMeV, 6),
  q27DotGapK: rd(DOT.gapK, 5),
  q27DotKT100mKueV: rd(thermalMicroEv(0.1), 6),
} as const

export type ValueKey = keyof typeof V
export const claim = keyedClaim<ValueKey>()
export { claimKey, close, d, pct, tf, uf }
