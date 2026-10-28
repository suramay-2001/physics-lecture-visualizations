/**
 * Optics Lab page O5 numbers (Metcalf and van der Straten, Chapter 5: traps made of light), computed with the engine (physics/optics/cooling.ts), each
 * ROUNDED to the digits and unit the page prints (the comment says which). Inputs: the book's design numbers (sodium at s = 2×10⁸, δ = −10⁶γ, p. 57;
 * a 3 cm beam, 10⁻⁵ torr at 300 K) and the stated atomic data. Numpy twin: pipeline/claims_optics/o.py -> physics/__fixtures__/claims-optics/o5.json.
 */
import { HBAR, K_BOLTZMANN, bohrMagneton } from '../../../physics/constants'
import { CS_D2, NA_D2, RB87_D2, boltzmannBelow, capture, deBroglie, dipoleDepth, dipoleScatterRate, latticeVibration, lightShiftGround, motLinear, recoilHeatingTime, recoilRate, sisyphusHill, waveNumber } from '../../../physics/optics/cooling'
import { vaporDensity } from '../../../physics/optics/cooling'
import { keyedClaim } from '../../claimKit'
import { r } from './format'

export { close, d, pct, tf, uf } from '../../claimKit'
export { n0, near, r } from './format'

const depth = dipoleDepth(NA_D2, 2e8, -1e6) // J
const rate = dipoleScatterRate(NA_D2, 2e8, -1e6) // s⁻¹
const Ub = sisyphusHill(lightShiftGround(RB87_D2, 0.5, -4, 1)) // ⁸⁷Rb lattice, δ = −4γ, s = ½: the modulation depth (J)
const ER = HBAR * recoilRate(RB87_D2) // J
const mot = motLinear(RB87_D2, { s: 1, dl: -1, A: 0.1, muPrime: bohrMagneton() }) // ⁸⁷Rb, 10 G/cm, s = 1, δ = −γ
const cap = capture(CS_D2, 0.03) // a 3 cm beam
const vOneK = Math.sqrt((2 * K_BOLTZMANN * 1) / CS_D2.massKg) // m/s: cesium of kinetic energy 1 K

export const V = {
  /* o5-dipole */
  o5DipoleDepthmK: r((depth / K_BOLTZMANN) * 1e3, 2), // mK
  o5DipoleRate: r(rate, 0), // s⁻¹
  o5HeatTimeS: r(recoilHeatingTime(depth, NA_D2, rate), 2), // s
  /* o5-lattice */
  o5DeBroglieHalf: r(deBroglie(2 * HBAR * waveNumber(NA_D2)) / NA_D2.lambdaM, 1), // the wavelength of a 2ħk atom over the light wavelength
  o5LatticeVibkHz: r(latticeVibration(Ub, ER) / 6.62607015e-34 / 1e3, 1), // kHz: 2√(U_b E_R)/h
  o5LatticeVibER: r(latticeVibration(Ub, ER) / ER, 1), // in units of E_R
  /* o5-mot */
  o5MotKappaOverBeta: r(mot.kappa / mot.beta, 0), // m⁻¹: μ′A/ħk
  o5MotFreqHz: r(mot.omega / (2 * Math.PI), 0), // Hz
  o5MotSizeMm: r(mot.size * 1e3, 2), // mm: ħ|δ|/μ′A
  /* o5-capture */
  o5CsCaptureMs: r(cap.v, 1), // m/s
  o5CsCaptureEK: r(cap.energyK, 1), // K
  o5CsDensity: r(vaporDensity(1e-5, 300) / 1e6 / 1e11, 2), // units of 10¹¹ cm⁻³
  o5Frac1K: r(boltzmannBelow(vOneK, 300, CS_D2.massKg) / 1e-4, 2), // units of 10⁻⁴: the share of the vapour below 1 K of kinetic energy
  o5FracRatio: r(boltzmannBelow(10, 300, CS_D2.massKg) / boltzmannBelow(5, 300, CS_D2.massKg), 2), // doubling v_c from 5 to 10 m/s (Correction C7)
} as const

export type ValueKey = keyof typeof V
export const claim = keyedClaim<ValueKey>()
