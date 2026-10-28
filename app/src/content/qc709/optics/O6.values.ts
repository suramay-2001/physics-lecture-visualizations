/**
 * Optics Lab page O6 numbers (Metcalf and van der Straten, Chapters 6 and 7), computed with the engine (physics/optics/cooling.ts and collisions.ts),
 * each ROUNDED to the digits and unit the page prints (the comment says which). Inputs: C₆ of Na–Na and Cs–Cs (Derevianko et al., stated, in atomic
 * units), the Cs hyperfine frequency that defines the second, the book's design numbers (a 15 cm fountain, a 3 m beam at 500 m/s, a 3 mm drop).
 * Numpy twin: pipeline/claims_optics/o.py -> physics/__fixtures__/claims-optics/o6.json. Keys start `o6`, unique across all courses.
 */
import { H_PLANCK, K_BOLTZMANN } from '../../../physics/constants'
import { AU_C6, C6_CS_AU, C6_NA_AU, CS_HFS_HZ, bounceTime, dopplerFwhm, fountainTime, fractionalUncertainty, hzToK, kapitzaDiracAngle, langevinBarrier, quantumOnsetT, ramseyWidth, releaseSpeed, thresholdCross, wavenumberToK, barrierTop } from '../../../physics/optics/collisions'
import { CS_D2, G_STANDARD, NA_D2, dopplerTemperature, secondOrderDoppler, thermalDeBroglie } from '../../../physics/optics/cooling'
import { keyedClaim } from '../../claimKit'
import { r } from './format'

export { close, d, pct, tf, uf } from '../../claimKit'
export { n0, near, r } from './format'

const mNa = NA_D2.massKg / 2 // the reduced mass of two sodium atoms
const bar = langevinBarrier(6, C6_NA_AU * AU_C6, mNa, 1)
const T = fountainTime(0.15) // 15 cm above the cavity
const vCavity = (G_STANDARD * T) / 2 // the speed at the cavity on the way up
const E = 2e-30 // J: two collision energies E and 2E give the log-slope
const slope = Math.log(thresholdCross(6, C6_NA_AU * AU_C6, mNa, 2 * E) / thresholdCross(6, C6_NA_AU * AU_C6, mNa, E)) / Math.log(2)

export const V = {
  /* o6-clocks */
  o6FountainT: r(T, 3), // s
  o6RamseyFountain: r(ramseyWidth(T), 2), // Hz
  o6BeamT: r((3 / 500) * 1e3, 0), // ms: 3 m at 500 m/s
  o6RamseyBeam: r(ramseyWidth(3 / 500), 1), // Hz
  o6Doppler2Fountain: r(-secondOrderDoppler(vCavity) / 1e-17, 2), // units of 10⁻¹⁷ (the magnitude)
  o6PrecRatio: r(fractionalUncertainty(1.5e-3, CS_HFS_HZ) / 1e-13, 2), // units of 10⁻¹³: 1.5 mHz over 9.19 GHz (Correction C8)
  o6PrecTenMinus12mHz: r(1e-12 * CS_HFS_HZ * 1e3, 1), // mHz: 10⁻¹² of 9.19 GHz (Correction C8)
  /* o6-collisions */
  o6RcNm: r(bar.Rc * 1e9, 2), // nm: barrier radius, ℓ = 1
  o6VcNaUK: r((bar.Vc / K_BOLTZMANN) * 1e6, 0), // µK
  o6TQNa: r(quantumOnsetT(6, C6_NA_AU * AU_C6, mNa) * 1e3, 3), // mK
  o6TQCs: r(quantumOnsetT(6, C6_CS_AU * AU_C6, CS_D2.massKg / 2) * 1e6, 1), // µK
  o6Slope: r(-slope, 3), // the log-slope of σ against E is −2/n = −0.333 at n = 6 (the magnitude)
  o6SlopeB: r(-slope / 2, 3), // and that of b_c itself, −1/n (the magnitude)
  o6BarrierRatio: r(barrierTop(6, C6_NA_AU * AU_C6, mNa, 1) / bar.Vc, 6), // the corrected Eq. 6.3 over the numerical barrier top (Correction C9)
  /* o6-decay */
  o6NaFineK: r(wavenumberToK(17), 1), // K: 17 cm⁻¹
  o6CsHfsGHz: r(CS_HFS_HZ / 1e9, 2), // GHz: the cesium hyperfine frequency
  o6CsHfsmK: r(hzToK(CS_HFS_HZ) * 1e3, 0), // mK: 9.19 GHz
  o6CsKick: r(releaseSpeed(CS_D2.massKg, H_PLANCK * CS_HFS_HZ), 2), // m/s per atom (Correction C11)
  /* o6-matterwaves */
  o6BounceMs: r(bounceTime(0.003) * 1e3, 1), // ms: a 3 mm drop
  o6KDAngle: r(kapitzaDiracAngle(NA_D2, 1000, 1) * 1e6, 1), // µrad: one 2ħk kick at 1,000 m/s
  o6LamdBTD: r(thermalDeBroglie(NA_D2.massKg, dopplerTemperature(NA_D2)) * 1e9, 1), // nm at the Doppler limit
  o6LamdB1uK: r(thermalDeBroglie(NA_D2.massKg, 1e-6) * 1e9, 0), // nm at 1 µK
  /* o6-nonlinear */
  o6DopplerGHz: r(dopplerFwhm(NA_D2, 300) / 1e9, 2), // GHz at 300 K
  o6DopplerTDMHz: r(dopplerFwhm(NA_D2, dopplerTemperature(NA_D2)) / 1e6, 2), // MHz at the Doppler limit
  o6NaNaturalMHz: r(NA_D2.gamma / (2 * Math.PI) / 1e6, 2), // MHz: γ/2π
} as const

export type ValueKey = keyof typeof V
export const claim = keyedClaim<ValueKey>()
