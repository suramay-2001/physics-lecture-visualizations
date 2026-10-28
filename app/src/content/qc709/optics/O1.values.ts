/**
 * Optics Lab page O1 numbers (Metcalf and van der Straten, Introduction and Chapter 1), computed with the engine (physics/optics/cooling.ts).
 * Every number a reader sees in O1 comes from `V` and is backed by a keyed claim; each value is the engine's number ROUNDED to the digits
 * the page prints, in the unit the page prints (the comment says which), so the numpy twin (pipeline/claims_optics/o.py ->
 * physics/__fixtures__/claims-optics/o1.json, another route) can agree to the last digit. Keys start `o1`, unique across all courses.
 * Atoms are stated inputs (Steck, Alkali D Line Data; NIST); the oven temperature, the 3 m and 500 m/s are the book's design numbers.
 */
import { H_LYA, NA_D2, deBroglie, dopplerOverGamma, flightLimit, gammaOverK, maxAcceleration, recoilVelocity, saturationIntensity, secondOrderDoppler, slowRow, slowerDamping, transverseDiffusion, zeemanProfile, zeemanSlower } from '../../../physics/optics/cooling'
import { keyedClaim } from '../../claimKit'
import { r } from './format'

export { close, d, pct, tf, uf } from '../../claimKit'
export { n0, near, r } from './format'

const row = slowRow(NA_D2, 712) // the Na oven of the first table of Chapter 1 (712 K)
const slower = zeemanSlower(NA_D2, row.vPeak, 0.5) // entry at the thermal peak, half the maximum deceleration

export const V = {
  /* o1-why */
  o1TransitHz: r(flightLimit(3, 500), 0), // Hz: 1/T for a beam that crosses 3 m at 500 m/s
  o1Doppler2Beam: r(-secondOrderDoppler(500) / 1e-12, 2), // units of 10⁻¹²: v²/2c² at 500 m/s (the magnitude)
  /* o1-force */
  o1RecoilNa: r(recoilVelocity(NA_D2) * 100, 2), // cm/s: ħk/M
  o1IsatNa: r(saturationIntensity(NA_D2) / 10, 2), // mW/cm²: πhcγ/3λ³
  o1AmaxNa: r(maxAcceleration(NA_D2) / 1e3, 0), // km/s²: ħkγ/2M
  o1VPeakNa: r(row.vPeak, 0), // m/s: √(3k_BT/M) at 712 K
  o1StopLenNa: r(row.stopLength, 3), // m: v²/2a_max
  o1StopTimeNa: r(row.stopTime * 1e3, 3), // ms: v/a_max
  o1HGammaOverK: r(gammaOverK(H_LYA), 1), // m/s: γ/k for hydrogen Lyman-α (Correction C2)
  o1HLambdaNm: r(H_LYA.lambdaM * 1e9, 1), // nm: Lyman-α
  o1HLambdaFromRecoil: r(deBroglie(H_LYA.massKg * 3.25) * 1e9, 1), // nm: the wavelength that gives the printed ħk/M = 325 cm/s (Correction C2)
  /* o1-compensation */
  o1DopplerOverGamma: r(dopplerOverGamma(NA_D2, row.vPeak), 0), // kv/γ at the thermal peak
  o1SlowerB0G: r(slower.B0 * 1e4, 0), // G: ħkv₀/μ′ (μ′ = μ_B)
  o1SlowerLenM: r(slower.z0, 3), // m: Mv₀²/ηħkγ at η = ½ (Correction C1)
  o1HalfwayB: r(zeemanProfile(slower, slower.z0 / 2).B / slower.B0, 3), // B/B₀ at z = z₀/2
  /* o1-cooling */
  o1DampUs: r(slowerDamping(NA_D2, 0.5, 2).time * 1e6, 1), // µs: M/β = 2/γ_R at η = ½, s = 2
  o1TransDiffMm: r(transverseDiffusion(NA_D2, row.vPeak, 0.5) * 1e3, 2), // mm: (2ħk/3M)√(Γt³)
} as const

export type ValueKey = keyof typeof V
export const claim = keyedClaim<ValueKey>()
