/**
 * Optics Lab page O4 numbers (Metcalf and van der Straten, Chapter 4: magnetic traps), computed with the engine (physics/optics/cooling.ts), each
 * ROUNDED to the digits and unit the page prints (the comment says which): sodium, μ = μ_B, A = 1 T/m unless stated. Numpy twin:
 * pipeline/claims_optics/o.py -> physics/__fixtures__/claims-optics/o4.json. Keys start `o4`, unique across all courses.
 */
import { H_PLANCK, bohrMagneton } from '../../../physics/constants'
import { NA_D2, adiabaticLimits, circularOrbit, heuristicE1, heuristicLevel, orbitN, trapAcceleration, trapDepthK, vTrapLevels, zeemanEnergyK } from '../../../physics/optics/cooling'
import { keyedClaim } from '../../claimKit'
import { r } from './format'

export { close, d, pct, tf, uf } from '../../claimKit'
export { n0, near, r } from './format'

const M = NA_D2.massKg
const a = trapAcceleration(M, 1, 1) // m/s² at A = 1 T/m
const orbit = circularOrbit(a, 0.01) // ρ = 1 cm
const lim = adiabaticLimits(a, M)
const levels = vTrapLevels(M, bohrMagneton(), 3) // J, the V-shaped well F|x| with F = μ_B · 1 T/m

export const V = {
  /* o4-why */
  o4GaussUK: r(zeemanEnergyK(1, 1e-4) * 1e6, 1), // µK per gauss for g m = 1
  o4DepthmK: r(trapDepthK(1, 0.02) * 1e3, 1), // mK: a 200 G wall
  /* o4-orbits */
  o4TrapAccel: r(a, 0), // m/s²
  o4OrbitV: r(orbit.v, 2), // m/s at ρ = 1 cm
  o4OrbitT: r(orbit.period * 1e3, 1), // ms
  o4RhoMin: r(lim.rhoMin * 1e6, 3), // µm: the cube root of ħ²/M²a
  o4VMin: r(lim.vMin * 100, 3), // cm/s: the cube root of ħa/M
  o4OrbitN: r(orbitN(M, orbit.v, 0.01) / 1e6, 2), // millions: n = Mvρ/ħ = ω_Z/ω_T
  /* o4-quantum */
  o4E1kHz: r(heuristicE1(M, a) / H_PLANCK / 1e3, 2), // kHz: E₁/h
  o4AiryE1kHz: r(levels[0] / H_PLANCK / 1e3, 2), // kHz
  o4AiryE2kHz: r(levels[1] / H_PLANCK / 1e3, 2),
  o4AiryE3kHz: r(levels[2] / H_PLANCK / 1e3, 2),
  o4AiryRatio21: r(levels[1] / levels[0], 3), // exact E₂/E₁
  o4HeurRatio21: r(heuristicLevel(M, a, 2) / heuristicLevel(M, a, 1), 3), // the orbit rule's ratio
} as const

export type ValueKey = keyof typeof V
export const claim = keyedClaim<ValueKey>()
