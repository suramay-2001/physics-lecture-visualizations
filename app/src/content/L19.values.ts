/**
 * Lecture 19 numbers, computed once with the engine (owner: P; plan docs/roles/proposals/P-L19-story.md, rulings docs/roles/decisions/448-L19L20.md and 448-townsend.md). Same contract as
 * L1–L18.values.ts: every number a learner reads in L19 comes from `V` (or, for the numbers Lecture 18 already owns, from L18.values.ts under their L18 keys: ruling R1) and is backed by a keyed
 * claim; the numpy twin of each key is in physics/__fixtures__/claims-448/l19.json (pipeline/claims_448/l19.py: the four matching conditions as a 4 x 4 np.linalg.solve, the currents as
 * Im(conj(u)u′), the closed forms of T written out, the Gamow exponent by scipy quad and by the arccos form, the momentum average by scipy quad).
 * Keys start with `l19`.
 *
 * Conventions as Lectures 13–18: ħ = m = 1 inside the engine; lengths in ℓ, momenta in ħ/ℓ, times in mℓ²/ħ. The stationary scene (stage source `barrierWave`) has E = 2 and V₀ = 4, so
 * k = κ = 2 (the energies of Lecture 18); a = ½ makes κa = 1, and a = 1 makes κa = 2. The numbers in electron-volts and ångströms use `HBAR2_OVER_2M_EV_A2`; the macroscopic estimate of
 * Townsend p. 231 is in CGS (a mantissa key: the power of ten is typed); alpha decay is a stated MODEL (a point alpha, Z = 90, R = 7.4 fm), with no reported half-lives (ruling T4).
 * A displayed magnitude of a negative number gets its own key; a residual that should be zero is stored as itself and claimed to be below a tolerance.
 *
 * This file imports physics modules (scatter, wave, wave18, wave19) but no stage module: a lecture chunk must not pull in stage/svg.
 */
import { abs2, arg } from '../physics/complex'
import { M_ELECTRON } from '../physics/constants'
import { barrierT, barrierThick, decayConstant } from '../physics/scatter'
import { HBAR2_OVER_2M_EV_A2, barrierAmplitudes, barrierWidthForT, momentumAverage } from '../physics/wave18'
import {
  M_PROTON, barrierFringes, barrierLeftCurrent, barrierTEv, coulombTurningPoint, deltaBarrierT, deltaLimitT, filteredKineticMean, gamowExponent, kappaPerAngstrom, macroKappaA,
  matchResidual, regionEnergies, transmissionAmplitude,
} from '../physics/wave19'
import { keyedClaim } from './claimKit'

const RAD = 180 / Math.PI

/* the stationary scene: E = 2, V₀ = 4 (k = κ = 2), a = ½ (κa = 1) and a = 1 (κa = 2) */
const S = transmissionAmplitude(2, 4, 0.5)
const S2 = transmissionAmplitude(2, 4, 1)
const kappa = decayConstant(2, 4)
const TAtKa = (qa: number): number => barrierT(2, 4, qa / kappa)
const thickAtKa = (qa: number): number => barrierThick(2, 4, qa / kappa)
const route = barrierAmplitudes(2, 4, 0.5)
const fr = barrierFringes(2, 4, 0.5)
/** The phase lag of the transmitted wave for a = ¾ (k = κ, so the lag is ka in radians). */
const lag75 = -arg(transmissionAmplitude(2, 4, 0.75).tau) * RAD
/** Both closed forms of T for the scene: the notes' V₀²/16E(V₀ − E) form and Townsend's (k² + κ²)/2kκ form. */
const notesT = 1 / (1 + (16 / (16 * 2 * 2)) * (Math.exp(1) - Math.exp(-1)) ** 2)
/** The slope of ln T against a, measured between κa = 3 and κa = 4 (a = 1.5 and 2). */
const slope = (Math.log(TAtKa(4)) - Math.log(TAtKa(3))) / (1 / kappa)

/* the electron and the proton at a barrier 1 Å wide: E = 1 eV, V₀ = 2 eV */
const massRatio = M_PROTON / M_ELECTRON
const TProton = barrierTEv(1, 2, 1, massRatio)

/* scanning tunnelling: the electron's energy 4 eV below the vacuum level (E = 4 eV, V₀ = 8 eV): a gap of 5 Å and one of 6 Å */
const stmKappa = kappaPerAngstrom(4)

/* alpha decay (a model): Z = 90, R = 7.4 fm, the alpha's energy 4.27 and 8.0 MeV */
const ALPHA_E = 4.27
const ALPHA_R = 7.4
const G4 = gamowExponent(ALPHA_E, 90, ALPHA_R)
const G8 = gamowExponent(8, 90, ALPHA_R)

/* practice: φ = 5.1 eV (E = 5 eV, V₀ = 10.1 eV), the gap grows from 5 Å to 5.5 Å */
const prStm = barrierTEv(5, 10.1, 5.5) / barrierTEv(5, 10.1, 5)

export const V = {
  /* l19-regions */
  l19KS: Math.sqrt(2 * 2), // 2: k for E = 2
  l19KappaS: kappa, // 2: κ for V₀ − E = 2
  l19RatioBA2: Math.sqrt(abs2(S2.B) / abs2(S2.A)), // 54.60 = e^{2κa} for κa = 2 (k = κ)
  /* l19-match */
  l19MatchResidual: matchResidual(2, 4, 0.5), // 0: the four conditions hold (below 1e-12)
  l19AbsA: Math.sqrt(abs2(S.A)), // 0.1686
  l19AbsB: Math.sqrt(abs2(S.B)), // 1.2456
  l19AbsT: Math.sqrt(S.T), // 0.6481
  l19PhaseTMag: Math.abs(arg(S.tau)) * RAD, // 57.30: arg τ = −ka for k = κ
  l19L18Route: abs2(route.F), // 0.4200: T = |F/A|² by the L18 route
  l19R1: S.R, // 0.5800
  l19RplusT: S.R + S.T, // 1
  l19FringeMax: fr.max, // 3.103
  l19FringeMin: fr.min, // 0.0568
  l19CurrentLeft: barrierLeftCurrent(2, 4, 0.5), // 0.8399 = k(1 − |r|²)
  l19Identity: (kappa / S.k + S.k / kappa) ** 2, // 4 = V₀²/E(V₀ − E)
  l19FormDiff: Math.abs(notesT - TAtKa(1)), // 0: the notes' form and Townsend's agree
  /* l19-thick */
  l19ThickRatio2: TAtKa(2) / thickAtKa(2), // 0.9644
  l19ThickRatio3: TAtKa(3) / thickAtKa(3), // 0.9951
  l19Ka15: kappa * 0.75, // 1.5: κa for a = ¾ (the half-way width of the doubling example)
  l19T15: TAtKa(1.5), // 0.1807
  l19DoubleFactor: TAtKa(3) / TAtKa(1.5), // 0.0546
  l19LogSlopeMag: -slope, // 3.99: the slope of ln T against a tends to −2κ = −4
  l19TwoKappa: 2 * kappa, // 4
  l19KappaV8: decayConstant(2, 8), // 3.464
  l19TV8: barrierT(2, 8, 0.5), // 0.0910
  l19KappaEl: kappaPerAngstrom(1), // 0.5123 (Å⁻¹)
  l19KappaPr: kappaPerAngstrom(1, massRatio), // 21.95 (Å⁻¹)
  l19MassKappaRatio: kappaPerAngstrom(1, massRatio) / kappaPerAngstrom(1), // 42.85
  l19TElectron: barrierTEv(1, 2, 1), // 0.7775
  l19TProtonLog10Mag: -Math.log10(TProton), // 18.47: T = 10^(−18.47)
  l19LimitT: barrierT(2 * (1 - 1e-9), 2, 1), // 0.5000: E → V₀ with ka = 2
  l19LimitT999: barrierT(2 * 0.999, 2, 1), // 0.4994
  l19MacroKappaA: macroKappaA(1, 1, 1) / 1e27, // 1.341 (× 10²⁷)
  /* l19-energy */
  l19EnergyOut: regionEnergies(2, 4, 0.5).outside, // 2: E = k²/2 outside
  l19EnergyIn: regionEnergies(2, 4, 0.5).inside, // 2: E = V₀ − κ²/2 inside
  l19StmKappa: stmKappa, // 1.0246 (Å⁻¹)
  l19StmFactorExact: barrierTEv(4, 8, 6) / barrierTEv(4, 8, 5), // 0.1288
  l19StmFactorThick: barrierThick(4, 8, 6, 1 / (2 * HBAR2_OVER_2M_EV_A2), 1) / barrierThick(4, 8, 5, 1 / (2 * HBAR2_OVER_2M_EV_A2), 1), // 0.1288
  l19StmDecade: Math.LN10 / (2 * stmKappa), // 1.124 Å: one decade of current
  l19AlphaE: ALPHA_E, // 4.27 MeV: the first alpha energy of the model (an input, claimed because the page shows it)
  l19AlphaR: ALPHA_R, // 7.4 fm: the daughter's radius (an input)
  l19TurnB4: coulombTurningPoint(ALPHA_E, 90), // 60.70 fm
  l19Gamow4: G4, // 97.36
  l19Gamow8: G8, // 52.34
  l19GamowFactor10: (G4 - G8) / Math.LN10, // 19.55 decades
  l19DeltaTexact: deltaBarrierT(3, 2), // 0.6400
  l19DeltaTw1: deltaLimitT(3, 2, 0.1), // 0.6200
  l19DeltaTw2: deltaLimitT(3, 2, 0.01), // 0.6377
  l19DeltaTw3: deltaLimitT(3, 2, 0.001), // 0.6398
  l19IncMeanKin: momentumAverage(2, 2, (p) => (p * p) / 2), // 2.0200
  l19TransKinMean: filteredKineticMean(2, 2, 4, 0.5, 'T'), // 2.0803
  l19ReflKinMean: filteredKineticMean(2, 2, 4, 0.5, 'R'), // below the incident one
  /* challenges and practice questions */
  l19PhaseT75Lag: lag75, // 85.94: the lag of τ for a = ¾
  l19PrDelta: deltaBarrierT(2.5, 1.5), // 0.5902
  l19PrWidth: barrierWidthForT(3, 7, 0.01, 1 / (2 * HBAR2_OVER_2M_EV_A2), 1), // 2.911 Å
  l19PrStm: prStm, // 0.3144
} as const

export type ValueKey = keyof typeof V

/** A claim tied to one L19 engine value: its text starts with `key · ` (read by content/claims.test.ts). */
export const claim = keyedClaim<ValueKey>()

export { close, d, pct, tf, uf } from './claimKit'
