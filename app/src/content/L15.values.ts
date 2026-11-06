/**
 * Lecture 15 numbers, computed once with the engine (owner: P). Same contract as L1–L14.values.ts: every number a learner reads in L15 comes from `V` and is backed by a keyed claim; the numpy
 * twin of each `l15…` key is in physics/__fixtures__/claims-448/l15.json (pipeline/claims_448/l15.py). Four keys moved here from Lecture 13 (ruling M2 of docs/roles/decisions/448-L14L18.md)
 * and took the lecture prefix, because the claim lint needs it: `l13FreeMean2` → `l15FreeMean2`, `l13FringeSpacing` → `l15FringeSpacing`, `l13FringeSpeed` → `l15FringeSpeed`,
 * `l13FringeSpeedFormula` → `l15FringeSpeedFormula`.
 *
 * Conventions as Lectures 12–14: ħ = m = 1 inside the engine (physics/wave.ts, wave14.ts, wave15.ts); lengths are in ℓ, momenta in ħ/ℓ, times in mℓ²/ħ (the UI appends the units). The width demos
 * use p₀ = 1.5, because a p₀ = 3 packet run to t = 6 reaches x = 18 and its far tail wraps the periodic window. A displayed magnitude of a negative number gets its own key (the number reader sees
 * digits, not signs); a residual that should be zero is stored as itself and claimed to be below a tolerance. The `l15Echo…` keys repeat an input the lecture chose (a time, a wave number) so that the
 * number reader finds it backed; they are not results.
 *
 * This file imports physics modules but no stage module: a lecture chunk must not pull in stage/svg.
 */
import { M_ELECTRON, HBAR, spreadTime } from '../physics/constants'
import {
  GRID, boost, freeEvolve, meanP, meanX, norm, packet, peakDensity, spreadP, spreadX, toMomentum, translate, wavelength,
} from '../physics/wave'
import { kineticEnergy, omegaFree } from '../physics/wave14'
import {
  componentPhaseDeg, crestSpeed, fringePosition, groupSpeedFromWavelength, groupVelocity, momentaOfEnergy, omegaSecond, pairCarrierSpeed, pairEnvelopeSpeed, phaseVelocity, planeDensityVariation,
  spreadScale,
} from '../physics/wave15'
import { keyedClaim } from './claimKit'

const PK = (x0: number, sigma: number, p0 = 0) => packet(GRID, { x0, sigma, p0 })

/* l15-puzzle: the p₀ = 3 packet */
const K3 = PK(0, 1, 3)

/* l15-free-eigenstate: a plane wave sampled over a stretch of x */
const PLANE_XS = Float64Array.from({ length: 2001 }, (_, j) => -4 + j * 0.004)

/* l15-packet-evolution and l15-dispersion: the p₀ = 1.5 packet at t = 0 and t = 6 */
const P15 = PK(0, 1, 1.5)
const P15_T6 = freeEvolve(P15, GRID, 6)
const phiSize = (psi: typeof P15) => {
  const mw = toMomentum(psi, GRID)
  return Array.from(mw.phi.re, (re, i) => re * re + mw.phi.im[i] * mw.phi.im[i])
}
const PHI0 = phiSize(P15)
const PHI6 = phiSize(P15_T6)

/* l15-group-velocity: the near pair k = 2.8 and 3.2, and the pair p = 2 and 4 moved from Lecture 13 */
const NEAR = { k1: 2.8, k2: 3.2 }

/* l15-gaussian: σ = 0.8 */
const G08 = PK(0, 0.8)

export const V = {
  /* l15-puzzle */
  l15ClassicalV: groupVelocity(3), // 3: v₀ = p₀/m for p₀ = 3, m = 1
  l15FreeMean2: meanX(freeEvolve(K3, GRID, 2), GRID), // 6 (moved from l13FreeMean2): the centre of the p₀ = 3 packet at t = 2
  l15PzSpeed: groupVelocity(4.5, 1.5), // 3: the practice warm-up, p₀ = 4.5 and m = 1.5
  /* l15-free-eigenstate */
  l15PlaneP15: (2 * Math.PI) / wavelength(1.5), // 1.5: the momentum of the plane wave of the unit
  l15E15: omegaFree(1.5), // 1.125 = p²/2m for p = 1.5
  l15PlanePeriod: (2 * Math.PI) / omegaFree(1.5), // 5.585: the phase at a point turns once in 2π/E_p
  l15CrestSpeed15: crestSpeed(1.5), // 0.75: the crests move at p/2m
  l15FlatDensity: planeDensityVariation(1.5, PLANE_XS, 0.7), // 0 (rounding): |ψ_p|² over the window and two times
  l15SameEnergyCount: momentaOfEnergy(2).length, // 2: p = ±2 carry E = 2
  /* l15-packet-evolution */
  l15MeanP15: meanP(P15, GRID), // 1.5: the mean momentum of the unit packet
  l15EchoT12: 1.2, // the time at which the component phases are read (an input)
  l15PhaseP1DegMag: Math.abs(componentPhaseDeg(1, 1.2)), // 34.38°: the p = 1 component after t = 1.2
  l15PhaseP2DegMag: Math.abs(componentPhaseDeg(2, 1.2)), // 137.5°: the p = 2 component
  l15DpT0: spreadP(P15, GRID), // 0.5
  l15DpT6: spreadP(P15_T6, GRID), // 0.5: unchanged
  l15MeanPT6: meanP(P15_T6, GRID), // 1.5: unchanged
  l15PeakRatioT6: peakDensity(P15_T6) / peakDensity(P15), // 0.3162: the peak of |ψ|² at t = 6 against t = 0
  l15NormT6: norm(P15_T6, GRID), // 1
  l15PhiDrift: PHI0.reduce((m, v, i) => Math.max(m, Math.abs(PHI6[i] - v)), 0) / Math.max(...PHI0), // 0 (rounding): |φ(p, 6)|² against |φ(p, 0)|²
  /* l15-group-velocity */
  l15FringeSpacing: fringePosition(2, 4, Math.PI - 0.5, Math.PI + 0.5, 0) - fringePosition(2, 4, -0.5, 0.5, 0), // π (moved from l13FringeSpacing): the fringes of p = 2 and 4
  l15FringeSpeed: (fringePosition(2, 4, 1, 2, 0.5) - fringePosition(2, 4, -0.5, 0.5, 0)) / 0.5, // 3.0 (moved from l13FringeSpeed): the tracked fringe
  l15FringeSpeedFormula: pairEnvelopeSpeed(2, 4), // 3 (moved from l13FringeSpeedFormula): (p₁ + p₂)/2m
  l15EchoK1Near: NEAR.k1, // 2.8 (an input)
  l15EchoK2Near: NEAR.k2, // 3.2 (an input)
  l15FringeSpacingNear: fringePosition(NEAR.k1, NEAR.k2, 14.7, 16.7, 0) - fringePosition(NEAR.k1, NEAR.k2, -1, 1, 0), // 15.71 = 2π/Δk
  l15EnvSpeedNear: pairEnvelopeSpeed(NEAR.k1, NEAR.k2), // 3.0 = Δω/Δk
  l15Centre3: meanX(freeEvolve(K3, GRID, 3), GRID), // 9: the centre of the p₀ = 3 packet at t = 3
  l15PhaseV3: phaseVelocity(3), // 1.5: ω/k at k = 3
  l15CarrierSpeedNear: pairCarrierSpeed(NEAR.k1, NEAR.k2), // 1.507 = ω̄/k₀
  l15GroupPhaseRatio: groupVelocity(3) / phaseVelocity(3), // 2
  l15NegCentre2Mag: Math.abs(meanX(freeEvolve(PK(0, 1, -3), GRID, 2), GRID)), // 6: the packet of p₀ = −3 sits at −6 at t = 2
  l15NegEnergy: kineticEnergy(PK(0, 1, -3), GRID), // 4.625: positive for either sign of the momentum
  l15PrEnvSpeed45: pairEnvelopeSpeed(4, 5), // 4.5
  l15PrCarrier45: pairCarrierSpeed(4, 5), // 2.278
  l15VgElectron: groupSpeedFromWavelength(M_ELECTRON, 0.5e-9) / 1e6, // 1.455 (10⁶ m/s): the envelope of an electron packet of wavelength 0.50 nm
  l15VphElectron: groupSpeedFromWavelength(M_ELECTRON, 0.5e-9) / 2 / 1e6, // 0.7274 (10⁶ m/s): its crests
  /* l15-dispersion */
  l15DeltaV: groupVelocity(spreadP(P15, GRID)), // 0.5 = Δp/m
  l15Vg1: groupVelocity(1), // 1
  l15Vg3: groupVelocity(3), // 3
  l15Omega2nd: omegaSecond(), // 1 = ħ/m
  l15LinearWidth6: spreadX(translate(P15, GRID, 6), GRID), // 1: a rigid shift keeps the width
  l15QuadWidth6: spreadX(P15_T6, GRID), // 3.162 = √10: the free packet at t = 6
  /* l15-gaussian */
  l15Dx08: spreadX(G08, GRID), // 0.8 = σ
  l15Dx04: spreadX(PK(0, 0.4), GRID), // 0.4 = σ of the squeezed packet
  l15Dp08: spreadP(G08, GRID), // 0.625 = ħ/2σ
  l15Prod08: spreadX(G08, GRID) * spreadP(G08, GRID), // 0.5
  l15Dv08: groupVelocity(spreadP(G08, GRID)), // 0.625 = Δp/m
  l15Tspread08: spreadScale(0.8), // 1.28 = 2mσ²/ħ
  l15Tspread04: spreadScale(0.4), // 0.32
  l15TspreadRatio: spreadScale(0.8) / spreadScale(0.4), // 4
  l15WidthAtTSpread: spreadX(freeEvolve(G08, GRID, spreadScale(0.8)), GRID) / 0.8, // 1.414 = √2: the width at t_spread against the start
  l15TspreadEqTownsend: spreadScale(1e-10 / Math.SQRT2, M_ELECTRON, HBAR) / spreadTime(M_ELECTRON, 1e-10), // 1: Townsend's ma²/ħ with a = √2σ is 2mσ²/ħ
  /* practice */
  l15PrDp: spreadP(G08, GRID), // 0.625
  l15PrDpT5: spreadP(freeEvolve(G08, GRID, 5), GRID), // 0.625: unchanged
  l15PrBoost: meanX(freeEvolve(boost(PK(-2, 1), GRID, 1.5), GRID, 6), GRID), // 7: x₀ + p₀t/m with x₀ = −2, p₀ = 1.5, t = 6
  l15PrSpreadFs: spreadTime(M_ELECTRON, 1e-9) / 1e-15, // 8.638 fs: T = ma²/ħ for a = 1 nm
} as const

export type ValueKey = keyof typeof V

/** A claim tied to one L15 engine value: its text starts with `key · ` (read by content/claims.test.ts). */
export const claim = keyedClaim<ValueKey>()

export { close, d, pct, tf, uf } from './claimKit'
