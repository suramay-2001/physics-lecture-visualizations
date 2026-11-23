/**
 * Optics Lab page O7 numbers (from vapour to a cold cloud: a cesium dispenser, the six-beam MOT, the polarization-gradient step), computed with the engine
 * (physics/optics/arrays.ts and cooling.ts), each ROUNDED to the digits and unit the page prints (the comment says which). Inputs: the run's own settings, as
 * Manetsch et al. print them (field gradient 20 G/cm, detuning −3.17Γ, total intensity 10 I₀ over six beams, 2.5 cm beams; PGC at −19.5Γ and 7 I₀), and the
 * stated atomic data (Steck). Numpy twin: pipeline/claims_optics/o_track.py -> physics/__fixtures__/claims-optics/o7.json.
 * REPORTED values (`o7Rep…`) are copied as the paper prints them; they are not computed. Source: Manetsch et al., arXiv:2403.12021v4, Methods
 * "Loading single atoms in tweezers", p. 21 (I₀ ≈ 1.1 mW/cm², the ~1.6 mm 1/e² cloud diameter).
 */
import { K_BOLTZMANN, bohrMagneton } from '../../../physics/constants'
import { CS_D2, capture, dopplerSteadyT, dopplerTemperature, lightShiftGround, motLinear, saturationIntensity, subDopplerLimit, waveNumber } from '../../../physics/optics/cooling'
import { loadTimeTo, motLoad } from '../../../physics/optics/arrays'
import { HBAR } from '../../../physics/constants'
import { keyedClaim } from '../../claimKit'
import { r } from './format'

export { close, d, pct, tf, uf } from '../../claimKit'
export { n0, near, r } from './format'

/** The run's MOT settings (Manetsch Methods): 10 I₀ over six beams is s = 10/6 per beam (our reading), δ = −3.17Γ, 20 G/cm. */
const mot = motLinear(CS_D2, { s: 10 / 6, dl: -3.17, A: 0.2, muPrime: bohrMagneton() })
const U1 = Math.abs(lightShiftGround(CS_D2, 7 / 6, -19.5)) // J: the PGC step at −19.5Γ, 7 I₀ over six beams, C² = 1 (the scale of O3, not a prediction)
const hbark2 = HBAR * waveNumber(CS_D2) ** 2

export const V = {
  /* o7-sequence */
  o7IsatCs: r(saturationIntensity(CS_D2) / 10, 2), // mW/cm²: πhcγ/3λ³ (1 W/m² = 0.1 mW/cm²)
  /* o7-mot */
  o7MotBetaK2: r(mot.beta / hbark2, 4), // the damping in units of ħk²
  o7MotOmegaHz: r(mot.omega / (2 * Math.PI), 0), // Hz
  o7MotZeemanMm: r(mot.size * 1e3, 2), // mm: ħ|δ|/μ′A
  o7CaptureV: r(capture(CS_D2, 0.025).v, 1), // m/s over a 2.5 cm beam
  o7Load2Tau: r(motLoad(1, 1, 2), 3), // N/N_ss at t = 2τ
  o7Load95: r(loadTimeTo(0.95, 1), 2), // in units of τ
  /* o7-pgc */
  o7U1Pgc: r((U1 / K_BOLTZMANN) * 1e6, 2), // µK: |U₁| at −19.5Γ, 7 I₀
  o7TlimLin: r(subDopplerLimit(-U1, 0.125) * 1e6, 3), // µK: C = 0.125 (lin⊥lin) of O3
  o7TlimSig: r(subDopplerLimit(-U1, 0.097) * 1e6, 3), // µK: C = 0.097 (σ⁺σ⁻) of O3
  o7DopplerOverTlim: r(dopplerTemperature(CS_D2) / subDopplerLimit(-U1, 0.125), 0), // T_D over the lin⊥lin limit
  o7DopplerPgcmK: r(dopplerSteadyT(CS_D2, -19.5) * 1e3, 2), // mK: the plain Doppler theory at this detuning
  /* reported (Manetsch et al., arXiv:2403.12021v4, p. 21) */
  o7RepIsat: 1.1, // mW/cm²: "I₀ ≈ 1.1 mW cm⁻²" for the stretched-state transition
  o7RepCloudMm: 1.6, // mm: "~1.6-mm 1/e² diameter MOT cloud"
} as const

export type ValueKey = keyof typeof V
export const claim = keyedClaim<ValueKey>()
