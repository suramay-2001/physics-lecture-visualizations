/**
 * Optics Lab page O2 numbers (Metcalf and van der Straten, Chapter 2: optical molasses), computed with the engine (physics/optics/cooling.ts),
 * each ROUNDED to the digits and the unit the page prints (the comment says which); the numpy twin is pipeline/claims_optics/o.py ->
 * physics/__fixtures__/claims-optics/o2.json. Keys start `o2`, unique across all courses.
 */
import { NA_D2, RB87_D2, captureVelocity, collimation, diffusionTemperature, dopplerSteadyT, dopplerTemperature, dressed, gammaOverK, maxAcceleration, molassesBeta, molassesLinearityError, molassesPeak, molassesWalk, waveNumber } from '../../../physics/optics/cooling'
import { HBAR } from '../../../physics/constants'
import { keyedClaim } from '../../claimKit'
import { r } from './format'

export { close, d, pct, tf, uf } from '../../claimKit'
export { n0, near, r } from './format'

const rb = collimation(RB87_D2, 423.15) // a rubidium beam from an oven at 150 °C (423.15 K)
const walk = molassesWalk(NA_D2, 0.01) // Na molasses, diffusion over 1 cm

export const V = {
  /* o2-friction */
  o2BetaK2: r(molassesBeta(NA_D2, 1, -0.5) / (HBAR * waveNumber(NA_D2) ** 2), 3), // units of ħk²: s = 1, δ = −γ/2
  o2VcNa: r(captureVelocity(NA_D2), 2), // m/s: γ/2k
  o2PeakVel: r(molassesPeak(NA_D2, 1, -0.5) / gammaOverK(NA_D2), 3), // units of γ/k: where |F| is largest (numerical search)
  o2LinErrVc: r(molassesLinearityError(NA_D2, 1, -0.5, captureVelocity(NA_D2)), 2), // a fraction: the shortfall of the linear law at v_c
  o2LinErrHalf: r(molassesLinearityError(NA_D2, 1, -0.5, captureVelocity(NA_D2) / 2), 3), // a fraction: the shortfall at v_c/2
  /* o2-limit */
  o2TDNa: r(dopplerTemperature(NA_D2) * 1e6, 0), // µK: ħγ/2k_B
  o2TAtGamma: r(dopplerSteadyT(NA_D2, -1) / dopplerTemperature(NA_D2), 2), // T at δ = −γ over T_D
  o2DiffTemp: r(diffusionTemperature(NA_D2, 0.01, -0.5) / dopplerTemperature(NA_D2), 3), // D₀/β over ħγ/2k_B at s = 0.01
  /* o2-collimation (rubidium-87) */
  o2RbVc: r(rb.vc, 2), // m/s
  o2RbDvCms: r(rb.dvRms * 100, 1), // cm/s: √(ħγ/2M)
  o2RbCompress: r(rb.compress1D, 1), // √(γ/γ_R)
  o2RbGOverGR: r(rb.gOverGR, 0), // γ/γ_R
  o2RbDxUm: r(rb.dx * 1e6, 1), // µm: (2v_c)²/2a_max
  o2RbTimeUs: r(((2 * rb.vc) / maxAcceleration(RB87_D2)) * 1e6, 0), // µs: the printed 2v_c/a_max is a time (Correction C3)
  /* o2-dressed */
  o2DressedOmega: r(dressed(NA_D2, 2, 1).omega / NA_D2.gamma, 3), // units of γ: s = 2, δ = +γ
  /* o2-3d */
  o2WalkStepNa: r(walk.step * 1e6, 2), // µm
  o2WalkStepsNa: r(walk.steps / 1e6, 1), // millions of steps to diffuse 1 cm
  o2WalkTimeNa: r(walk.time, 0), // s
} as const

export type ValueKey = keyof typeof V
export const claim = keyedClaim<ValueKey>()
