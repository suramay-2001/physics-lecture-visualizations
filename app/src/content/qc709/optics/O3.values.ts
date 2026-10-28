/**
 * Optics Lab page O3 numbers (Metcalf and van der Straten, Chapter 3: below the Doppler limit), computed with the engine (physics/optics/cooling.ts),
 * each ROUNDED to the digits and unit the page prints (the comment says which); the exact weights 1, 1/3, 1 and 6 are the engine's own numbers.
 * Models and inputs (rulings O2, O3): Sisyphus potentials at C² = 1 in units of the light shift; the book's coefficients c = 0.125 and 0.097 (p. 41)
 * are stated inputs; Table 6.1's T_S and T′_Q are not shown. Numpy twin: pipeline/claims_optics/o.py -> physics/__fixtures__/claims-optics/o3.json.
 */
import { CS_D2, NA_D2, RB85_D2, RB87_D2, clebschSquared, dopplerFrictionMax, dopplerSpeed1D, dopplerTemperature, lightShiftGround, milcWindow, recoilTemperature, sisyphusFriction, sisyphusHill, subDopplerLimit, vsrVelocity, waveNumber, zeemanOmega } from '../../../physics/optics/cooling'
import { K_BOLTZMANN } from '../../../physics/constants'
import { keyedClaim } from '../../claimKit'
import { r } from './format'

export { close, d, pct, tf, uf } from '../../claimKit'
export { n0, near, r } from './format'

const U1 = lightShiftGround(RB87_D2, 0.5, -4, 1) // ⁸⁷Rb, δ = −4γ, s = ½ per beam, C² = 1: negative, in J
const wZ = zeemanOmega(1 / 3, 1e-4) // ⁸⁵Rb F = 3 (g_F = 1/3) at 1 G, rad/s
const C_LIN = 0.125 // the book's coefficient of the lin⊥lin limit (p. 41)
const C_SIGMA = 0.097 // … and of the σ⁺σ⁻ limit

export const V = {
  /* o3-gradient */
  o3CGUp: clebschSquared(0.5, 0.5, 1), // 1: σ⁺ on the upper ground sublevel
  o3CGDown: clebschSquared(0.5, -0.5, 1), // 1/3: σ⁺ on the lower ground sublevel
  o3U1: r(Math.abs(U1) / K_BOLTZMANN * 1e6, 1), // µK: |U₁|
  o3HillDepth: r(sisyphusHill(U1) / K_BOLTZMANN * 1e6, 1), // µK: 2|U₁|/3
  o3FrictionRatio: r(sisyphusFriction(RB87_D2, -4) / dopplerFrictionMax(RB87_D2), 0), // 2|δ|/γ at δ = −4γ
  /* o3-milc */
  o3MilcLow: r(milcWindow(RB85_D2, 1 / 3, 1e-5).low * 100, 2), // cm/s: ω_Z/k at 0.1 G
  o3VDRb: r(dopplerSpeed1D(RB87_D2) * 100, 2), // cm/s: √(7ħγ/20M) (Correction C4)
  /* o3-sigma */
  o3CGOne: clebschSquared(1, 1, 1), // 1: σ⁺ on m = +1 of a Jg = 1 level
  o3CGSix: clebschSquared(1, 1, 1) / clebschSquared(1, 1, -1), // 6
  /* o3-vsr */
  o3ZeemanMHzG: r(wZ / (2 * Math.PI) / 1e6, 3), // MHz per gauss: ω_Z/2π
  o3VsrSigma: r(vsrVelocity(wZ, waveNumber(RB85_D2), 'sigma') * 100, 1), // cm/s at 1 G (Correction C5)
  o3VsrLin: r(vsrVelocity(wZ, waveNumber(RB85_D2), 'lin') * 100, 1), // cm/s at 1 G
  /* o3-3d */
  o3CLin: C_LIN,
  o3CSigma: C_SIGMA,
  o3TlimLin: r(subDopplerLimit(U1, C_LIN) * 1e6, 2), // µK
  o3TlimSigma: r(subDopplerLimit(U1, C_SIGMA) * 1e6, 2), // µK
  o3CsTD: r(dopplerTemperature(CS_D2) * 1e6, 1), // µK
  o3CsTR: r(recoilTemperature(CS_D2) * 1e9, 0), // nK: ħ²k²/Mk_B (Correction C6)
  o3CsTDoverTR: r(dopplerTemperature(CS_D2) / recoilTemperature(CS_D2), 0), // an engine ratio of two stated-input numbers
  o3NaTRMicroK: r(recoilTemperature(NA_D2) * 1e6, 2), // µK: sodium, the same definition (Correction C6)
} as const

export type ValueKey = keyof typeof V
export const claim = keyedClaim<ValueKey>()
