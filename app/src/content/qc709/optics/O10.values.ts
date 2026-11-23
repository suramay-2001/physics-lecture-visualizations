/**
 * Optics Lab page O10 numbers (light from one cesium atom: the scattering rate, the share a lens collects, the photons a bright atom needs, the recoil and
 * depumping limits), computed with the engine (physics/optics/cooling.ts scatterRate, imaging.ts, arrays.ts), each ROUNDED to the digits and unit the page
 * prints. The imaging setting (s = 2, δ = −2γ, η = 5 %) is a SETUP value of the page, not a paper's; the depumping chance is a stated INPUT per COLLECTED photon (Chow's definition, p. 3 and p. 5). REPORTED values
 * (`o10Rep…`): the collection efficiency 0.96(1) % and the depump chance 3.7 × 10⁻⁴ (Chow et al., arXiv:2206.00144, p. 3 and p. 5), the total detection
 * efficiency 1.6 to 2.0 % (Kwon et al., arXiv:1706.09497, p. 2), the average trap depth 0.18 mK (Manetsch, arXiv:2403.12021v4, p. 3).
 * Numpy twin: pipeline/claims_optics/o_track.py -> physics/__fixtures__/claims-optics/o10.json.
 */
import { CS_D2, scatterRate } from '../../../physics/optics/cooling'
import { depumpPhotonsOneOverE, depumpSurvival, photonsToDepth, recoilGainK } from '../../../physics/optics/arrays'
import { collectionEfficiency, photonBudget, photonsFor, zeroCountFloor } from '../../../physics/optics/imaging'
import { keyedClaim } from '../../claimKit'
import { r } from './format'

export { close, d, pct, tf, uf } from '../../claimKit'
export { n0, near, r } from './format'

const example = photonBudget(CS_D2, 2, -2, 0.05, 0) // R at s = 2, δ = −2γ (setup values)
const gain = recoilGainK(CS_D2)

export const V = {
  /* o10-rate */
  o10RmaxCs: r(CS_D2.gamma / 2 / 1e7, 2), // 10⁷ s⁻¹: γ/2
  o10RSat: r(scatterRate(CS_D2, 1, 0) / 1e6, 2), // 10⁶ s⁻¹: s = 1, δ = 0
  o10RExample: r(example.R / 1e6, 2), // 10⁶ s⁻¹: s = 2, δ = −2γ
  /* o10-collect */
  o10CollNa40: r(collectionEfficiency(0.4), 4), // fractions (printed as per cent)
  o10CollNa55: r(collectionEfficiency(0.55), 4),
  o10CollNa65: r(collectionEfficiency(0.65), 4),
  /* o10-need */
  o10Floor5: r(zeroCountFloor(5), 5), // the chance of zero counts when the mean count is 5
  o10Floor7: r(zeroCountFloor(7), 6),
  o10NScat5: r(photonsFor(5, 0.0096), 0), // scattered photons for a mean count of 5 at the printed 0.96 % efficiency
  o10NScat7: r(photonsFor(7, 0.0096), 0),
  o10NScat5Setup: r(photonsFor(5, 0.05), 0), // scattered photons for a mean count of 5 at the page's 5 % setup
  o10TauM5Chow: r((photonsFor(5, 0.0096) / example.R) * 1e3, 2), // ms for a mean count of 5 at 0.96 % and the example rate
  o10CollRatio: r(0.05 / 0.0096, 1), // the setup efficiency over the reported collection efficiency
  o10TauM5: r((5 / (example.R * 0.05)) * 1e3, 4), // ms for a mean count of 5 at η = 5 % and the example rate
  /* o10-limit */
  o10GainK: r(gain * 1e9, 0), // nK per scattered photon: 2E_R/k_B at 852 nm
  o10PhotonsToDepth: r(photonsToDepth(0.18e-3, gain), 0), // photons to reach the printed depth with no cooling
  o10DepthOverNeedChow: r(photonsToDepth(0.18e-3, gain) / photonsFor(5, 0.0096), 1), // recoil limit (scattered photons) over the need at 0.96 %
  o10DepthOverNeedSetup: r(photonsToDepth(0.18e-3, gain) / photonsFor(5, 0.05), 0), // the same over the need at the 5 % setup
  o10DepumpScat: r(depumpPhotonsOneOverE(3.7e-4) / 0.0096 / 1e5, 1), // 10⁵ scattered photons for a 1/e chance: collected count over the 0.96 % collection
  o10DepumpN: r(depumpPhotonsOneOverE(3.7e-4), 0), // photons for a 1/e chance at the stated depump chance
  o10Surv500: r(depumpSurvival(500, 3.7e-4), 3),
  /* reported */
  o10RepCE: 0.0096, // "collection efficiency (CE) of 0.96(1)%", Chow p. 3
  o10RepKwonLo: 0.016, // "1.6 −2.0%", Kwon p. 2
  o10RepKwonHi: 0.02,
  o10RepDepump: 3.7, // 10⁻⁴: "R = 1 − 3p1−εbright = 3.7 × 10⁻⁴", Chow p. 5
  o10RepDepthmK: 0.18, // mK: Manetsch p. 3
  o10RepKwonIsoCE: 0.0417, // "4.17%" for isotropic emission at NA = 0.4, Kwon p. 8
  o10RepNa40: 0.4, // Kwon p. 2: "collected by a NA = 0.4 lens"
  o10RepNa55: 0.55, // Manetsch p. 20: "NA = 0.55 at the imaging wavelength of 852 nm"
  o10RepNa65: 0.65, // Manetsch p. 20: "NA = 0.65 at the trapping wavelengths"
} as const

export type ValueKey = keyof typeof V
export const claim = keyedClaim<ValueKey>()
