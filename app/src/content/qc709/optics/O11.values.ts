/**
 * Optics Lab page O11 numbers (counting atoms: two Poisson histograms and a cutoff, the exposure, the EMCCD's gain noise, the best exposure), computed with the
 * engine (physics/optics/imaging.ts), each ROUNDED to the digits and unit the page prints. Per cent are stored as fractions. The two example means, the EMCCD
 * setting (30 and 0.3 photoelectrons, gain 300, read noise 40 counts) and the toy loss rate (4 s⁻¹) are SETUP values and a labelled toy of the page. The error
 * is the equal-prior average ½[P(read dark | bright) + P(read bright | dark)] (the paper's "averaged inaccuracy"): judge's ruling, so the EMCCD error is
 * 1.75e-4 (the plan's 3.60e-4 is superseded). REPORTED values (`o11Rep…`): Chow et al., arXiv:2206.00144, p. 3 (rates and errors at 0.26 ms); Manetsch et al.,
 * arXiv:2403.12021v4, p. 4 (80 ms fidelity and survival) and p. 21 (20 ms). Numpy twin: pipeline/claims_optics/o_track.py -> claims-optics/o11.json.
 */
import { bestThreshold, dPrime, emccdBestError, emccdMoments, errorVsExposure, thresholdError, toyOptimum } from '../../../physics/optics/imaging'
import { fidelityTimesSurvival } from '../../../physics/optics/arrays'
import { keyedClaim } from '../../claimKit'
import { r } from './format'

export { close, d, pct, tf, uf } from '../../claimKit'
export { n0, near, r } from './format'

const RB = 54.4e3 // s⁻¹: the bright-atom signal rate as printed (Chow)
const RG = 0.52e3 // s⁻¹: the background rate as printed
const ex = thresholdError(9.2, 0.2, 3) // a bright mean of 9.2 (signal 9, background 0.2) against a dark mean of 0.2, cutoff 3
const err = (us: number) => errorVsExposure(RB, RG, us * 1e-6).err
const toy = toyOptimum(RB, RG, 4)

export const V = {
  /* o11-hist */
  o11ExErr: r(ex.err, 5),
  o11ExEb: r(ex.eb, 5),
  o11ExEd: r(ex.ed, 5),
  /* o11-exposure */
  o11DprimeRatio: r(dPrime((RB + RG) * 4e-4, RG * 4e-4) / dPrime((RB + RG) * 1e-4, RG * 1e-4), 2), // d′ at four times the exposure over d′ at one
  o11Err50: r(err(50), 4),
  o11Err100: r(err(100), 4),
  o11Err150: r(err(150), 5),
  o11Err260: r(err(260), 6),
  o11Err350: r(err(350), 7),
  o11PaperMean: r((5e-5 + 4e-4) / 2, 6), // the mean of the two errors Chow prints
  /* o11-camera */
  o11Enf: r(emccdMoments(30, 300).enf, 2),
  o11EmccdErr: r(emccdBestError(30, 0.3, 300, 40).err, 6),
  o11EmccdFloor: r(bestThreshold(30, 0.3).err * 1e8, 1), // 10⁻⁶ per cent: the same means counted photon by photon
  /* o11-loss */
  o11ToyTau: Math.round(toy.tau * 1e6), // µs
  o11ToyTotal: r(toy.total, 5),
  o11ToyMisread: r(toy.misread, 6),
  o11FS80: r(fidelityTimesSurvival(0.9999374, 0.9998952), 6),
  o11FS20: r(fidelityTimesSurvival(0.999571, 0.99176), 6),
  o11SetMb: 9.2, // the page's example bright mean (signal nine plus a background of 0.2): a SETUP value
  o11SetMd: 0.2, // the page's example dark mean: a SETUP value
  /* reported */
  o11RepRateB: 54.4, // kcps: "5.44(3) × 10⁴ s⁻¹", Chow p. 3
  o11RepRateD: 0.52, // kcps: "5.2(3) × 10² s⁻¹", Chow p. 3
  o11RepEb: 0.00005, // "εbright = 0.005%", Chow p. 3
  o11RepEd: 0.0004, // "εdark = 0.04%", Chow p. 3
  o11RepMs: 0.26, // ms: "0.26 ms of probe time", Chow p. 3
  o11RepF80: 0.9999374, // "99.99374(8)%", Manetsch p. 4
  o11RepS80: 0.9998952, // "99.98952(1)%", Manetsch p. 4
  o11RepDet80: 15.5, // |Δ| in units of Γ: the 2D PGC imaging detuning "Δ = −15.5Γ" (80 ms), Manetsch p. 21
  o11RepDet20: 9.5, // |Δ| in units of Γ: "a PGC detuning of Δ = −9.5Γ" for the 20 ms data, p. 21
  o11RepF20: 0.999571, // "99.9571(4)%", Manetsch p. 21 (20 ms)
  o11RepS20: 0.99176, // "99.176(1)%", Manetsch p. 21 (20 ms)
} as const

export type ValueKey = keyof typeof V
export const claim = keyedClaim<ValueKey>()
