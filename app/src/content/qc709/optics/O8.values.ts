/**
 * Optics Lab page O8 numbers (one cesium atom in a 1061 nm tweezer), computed with the engine (physics/optics/arrays.ts), each ROUNDED to the digits and unit the
 * page prints. Inputs: Manetsch et al.'s printed trap frequencies (radial 29.30 kHz, axial 5.64 kHz, which fix OUR waist), the power at the atoms (about 1.4 mW)
 * and the Cs D lines (Steck). The depth uses a two-line polarizability model (arrays.ts), stated on the page. Numpy twin: pipeline/claims_optics/o_track.py ->
 * physics/__fixtures__/claims-optics/o8.json. REPORTED values (`o8Rep…`) are the paper's own printed numbers (arXiv:2403.12021v4): the waist and the
 * frequencies p. 25 (Methods, trap parameters) and p. 18 (Ext. Data Fig. 9 caption), the average depth and the power p. 3, the NA p. 2, the lifetime p. 4.
 */
import { K_BOLTZMANN } from '../../../physics/constants'
import { CS_D2, waveNumber } from '../../../physics/optics/cooling'
import { AU_POLARIZABILITY, CS_LINES, depthFromRadialFreq, diffractionRadius, lambDicke, polarizability, rayleighLength, recoilGainKAt, thermalRms, tweezerDepth, tweezerFreqs, tweezerScatter, trapHeatTime, waistFromFreqs } from '../../../physics/optics/arrays'
import { keyedClaim } from '../../claimKit'
import { r } from './format'

export { close, d, pct, tf, uf } from '../../claimKit'
export { n0, near, r } from './format'

const LAM = 1061e-9 // m: the tweezer wavelength
const FR = 29.3e3 // Hz: radial frequency, as printed
const FZ = 5.64e3 // Hz: axial frequency, as printed
const M = CS_D2.massKg
const w0 = waistFromFreqs(FR, FZ, LAM) // m: our inference from the two printed frequencies
const U14 = tweezerDepth(1.4e-3, w0, LAM) // J at 1.4 mW
const rsc = tweezerScatter(1.4e-3, w0, LAM)
const f14 = tweezerFreqs(U14, M, w0, LAM)
const omegaR = 2 * Math.PI * FR

export const V = {
  /* o8-beam */
  o8WaistUm: r(w0 * 1e6, 2), // µm: our inference
  o8RayleighUm: r(rayleighLength(w0, LAM) * 1e6, 2), // µm
  o8AiryUm: r(diffractionRadius(LAM, 0.65) * 1e6, 3), // µm: 0.61 λ/NA
  o8SpacingOverWaist: r(7.2e-6 / w0, 2), // the printed spacing over our waist
  /* o8-depth */
  o8AlphaAu: r(polarizability(CS_LINES, LAM) / AU_POLARIZABILITY, 0), // atomic units, D1 and D2 with both rotating terms
  o8AlphaAu1064: r(polarizability(CS_LINES, 1064e-9) / AU_POLARIZABILITY, 0), // atomic units at 1064 nm (a test anchor)
  o8Depth14: r((U14 / K_BOLTZMANN) * 1e3, 3), // mK at 1.4 mW and our waist
  o8DepthFromFreq: r((depthFromRadialFreq(FR, M, w0) / K_BOLTZMANN) * 1e3, 3), // mK: M ω_r² w₀²/4
  o8PowerForFreq: r((depthFromRadialFreq(FR, M, w0) / tweezerDepth(1, w0, LAM)) * 1e3, 2), // mW that gives the printed radial frequency
  o8FrAt14: r(f14.fr / 1e3, 1), // kHz
  o8FzAt14: r(f14.fz / 1e3, 2), // kHz
  o8DepthPaperWaist: r((tweezerDepth(1.4e-3, 1.17e-6, LAM) / K_BOLTZMANN) * 1e3, 3), // mK at 1.4 mW with the waist the paper itself infers
  o8DepthSpreadPct: r((Math.max(U14, tweezerDepth(1.4e-3, 1.17e-6, LAM), depthFromRadialFreq(FR, M, w0)) / Math.min(U14, tweezerDepth(1.4e-3, 1.17e-6, LAM), depthFromRadialFreq(FR, M, w0)) - 1) * 100, 0), // per cent: highest over lowest of the three depths
  /* o8-motion */
  o8Sigma20: r(thermalRms(M, omegaR, 20e-6) * 1e9, 0), // nm at 20 µK
  o8Eta: r(lambDicke(M, omegaR, waveNumber(CS_D2)), 3), // for the 852 nm photon
  o8EtaSq: r(lambDicke(M, omegaR, waveNumber(CS_D2)) ** 2, 4),
  o8DepthOverT20: r(U14 / (K_BOLTZMANN * 20e-6), 2),
  /* o8-heat */
  o8Rsc: r(rsc, 2), // s⁻¹
  o8RecoilGainK: r(recoilGainKAt(LAM, M) * 1e9, 0), // nK per scattered trap photon
  o8HeatTime: r(trapHeatTime(U14, rsc, M, LAM), 0), // s
  o8HeatMin: r(trapHeatTime(U14, rsc, M, LAM) / 60, 1), // minutes
  /* reported (Manetsch et al., arXiv:2403.12021v4) */
  o8RepWaistUm: 1.17, // µm: "w0 = 1.17(6) µm", p. 25
  o8RepDepthmK: 0.18, // mK: "kB × 0.18(2) mK", p. 3
  o8RepFrKHz: 29.3, // kHz: "29.30(4) kHz", p. 18 and p. 25
  o8RepFzKHz: 5.64, // kHz: "5.64(3) kHz", p. 18 and p. 25
  o8RepPowerMW: 1.4, // mW per tweezer at the atom plane, p. 3
  o8RepLifeMin: 22.9, // min: "22.9(1) min", p. 4
  o8RepSpacingUm: 7.2, // µm: "spaced by ∼7.2 µm", p. 3
  o8RepNa: 0.65, // the objective's NA at the trapping wavelength, p. 20
} as const

export type ValueKey = keyof typeof V
export const claim = keyedClaim<ValueKey>()
