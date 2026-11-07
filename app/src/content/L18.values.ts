/**
 * Lecture 18 numbers, computed once with the engine (owner: P; plan docs/roles/proposals/P-L18-story.md, rulings docs/roles/decisions/448-L14L18.md). Same contract as
 * L1–L17.values.ts: every number a learner reads in L18 comes from `V` and is backed by a keyed claim; the numpy twin of each key is in physics/__fixtures__/claims-448/l18.json
 * (pipeline/claims_448/l18.py: the step below its top and the barrier solved as matching conditions with np.linalg.solve, currents as Im(conj(u)u′), the momentum average by scipy quad,
 * the exact current by differentiating the closed-form ψ, the packet run by an np.fft split step with CubicSpline chances). Keys start with `l18`. Nine keys MOVED from Lecture 13 with
 * their beats (ruling M2): `l13TStepRbelow`, `l13TStepTbelow`, `l13TBookAT`, `l13TBookBohrT`, `l13TBookQa`, `l13TEV0T`, `l13TThickRatio`, `l13TDecayFactor` and `l13PrTunnelPct`
 * became `l18TStepRbelow`, `l18TStepTbelow`, `l18TBookAT`, `l18TBookBohrT`, `l18TBookQa`, `l18TEV0T`, `l18TThickRatio`, `l18TDecayFactor` and `l18PrTunnelPct` (the claim lint needs the
 * lecture prefix); their twins moved from claims-448/g4b.json to claims-448/l18.json.
 *
 * Conventions as Lectures 13–17: ħ = m = 1 inside the engine; lengths in ℓ, momenta in ħ/ℓ, times in mℓ²/ħ. The running scenes are chosen so the packet stays inside the
 * 64-long periodic box (the stage refuses a packet whose centre plus five widths passes |x| = 28):
 *   step      p₀ = 4 and V₀ = 6, so E = 8 = 4V₀/3, k₁ = 4, k₂ = 2 (the ratios of Lecture 17); a packet of width 2 starting at −8, run to t = 5.5;
 *   low step  E = 2 = V₀/2 with V₀ = 4, so k = κ = 2; a packet of width 2 starting at −8;
 *   barrier   the same energy and V₀ = 4, width a = ½, so κa = 1 and T = 1/cosh²1 = 0.420;
 *   detector  a free packet of width 3 with p₀ = 2 starting at −6, a detector at x_d = 4.
 * The two packet runs in this table use the split step with the larger step 0.01 (≈ 0.15 s together); the stage uses 0.005 and the chances differ by about 2e-5, far below the digits shown.
 * An integral over the packet's momenta is `momentumAverage`; the exact area long after the collision is the energy-weighted average of R(E) (the run at t = 5.5 is already within 1e-3).
 * A displayed magnitude of a negative number gets its own key; a residual that should be zero is stored as itself and claimed to be below a tolerance; a number with an exponent is a
 * mantissa key and a typed power of ten.
 *
 * This file imports physics modules (wave, scatter, wave18) but no stage module: a lecture chunk must not pull in stage/svg.
 */
import { abs2, arg } from '../physics/complex'
import { E_CHARGE, HBAR, M_ELECTRON } from '../physics/constants'
import { barrierT, barrierThick, decayConstant, planeCurrent, stepAmplitudes, stepRT } from '../physics/scatter'
import { GRID, packet, spreadP } from '../physics/wave'
import {
  HBAR2_OVER_2M_EV_A2, barrierAmplitudes, barrierInnerCurrent, barrierResonanceWidth, barrierTMinOverWidth, barrierWidthForT, detectorPeak, detectorTotal, evanescentCurrent,
  momentumAverage, penetrationDepth, rigidCurrentPeak, scatterChances, stepEvanescent, stepPenetration, wkbExponent,
} from '../physics/wave18'
import { keyedClaim } from './claimKit'

const RAD = 180 / Math.PI

/* the E = 4V₀/3 step: p₀ = 4, V₀ = 6 (k₁ = 4, k₂ = 2) */
const st43 = stepAmplitudes(8, 6)
const stepRun = scatterChances(-8, 2, 4, { step: { V0: 6 } }, 5.5, 0.01)
const stepR = (p: number): number => stepRT((p * p) / 2, 6).R
const stepKink = Math.sqrt(2 * 6) // the threshold momentum: R is not smooth there
const weightedR = (sigma: number): number => momentumAverage(4, sigma, stepR, stepKink)

/* the free packet and the detector */
const DET = { sigma: 3, p0: 2, x0: -6, xd: 4 }
const detPeak = detectorPeak(DET.sigma, DET.p0, DET.x0, DET.xd).j
const detRigid = rigidCurrentPeak(DET.sigma, DET.p0)

/* below the step: E = 2, V₀ = 4 (k = κ = 2) */
const ev = stepEvanescent(2, 4)
const pen = stepPenetration(-8, 2, 2, 4, 5, 0.01)

/* the barrier: E = 2, V₀ = 4, a = ½ (κ = 2, so κa = 1) */
const bar = barrierAmplitudes(2, 4, 0.5)
const kappa = ev.kappa
const TAtKa = (qa: number): number => barrierT(2, 4, qa / kappa)
const thickAtKa = (qa: number): number => barrierThick(2, 4, qa / kappa)
const barWeightedT = momentumAverage(2, 2, (p) => barrierT((p * p) / 2, 4, 0.5))

/* the book's electron (Townsend p. 231): E = 5 eV, V₀ = 10 eV, SI */
const eV = E_CHARGE
const BOOK_E = 5 * eV
const BOOK_V0 = 10 * eV
const bookT = (aMetres: number): number => barrierT(BOOK_E, BOOK_V0, aMetres, M_ELECTRON, HBAR)
const bookKappa = decayConstant(BOOK_E, BOOK_V0, M_ELECTRON, HBAR)

/* field emission (Townsend Problem 6.25): W = 4.5 eV and a field of 5 V/nm = 0.5 eV per ångström, ħ = 1 and m = 1/(2·ħ²/2m) in eV and ångström */
const emission = wkbExponent(0, (x) => 4.5 - 0.5 * x, 0, 4.5 / 0.5, 1 / (2 * HBAR2_OVER_2M_EV_A2), 1)

export const V = {
  /* l18-packet */
  l18AmpIdentity: Math.hypot(1 + st43.r.re - st43.tau.re, st43.r.im - st43.tau.im), // 0: 1 + r = τ (amplitudes)
  l18StepRAmp43: st43.r.re, // 1/3
  l18StepTau43: st43.tau.re, // 4/3
  l18StepR43: st43.R, // 1/9
  l18StepT43: st43.T, // 8/9
  l18FracIdentity: st43.R + st43.T - 1, // 0: R + T = 1 (fractions)
  l18StepAreaL: stepRun.reflected, // 0.148: the area left of the step at t = 5.5
  l18StepAreaR: stepRun.transmitted, // 0.852
  l18StepNorm: stepRun.norm, // 1
  l18ChR: stepAmplitudes(4.5, 4).R, // 0.25: the challenge, k₁ = 3k₂
  l18StepWeightedR: weightedR(2), // 0.1489: the energy-weighted R for σ = 2
  l18WeightedR3: weightedR(3), // 0.1230
  l18WeightedR6: weightedR(6), // 0.1135
  l18WeightedR12: weightedR(12), // 0.1117
  /* l18-detector */
  l18DetPeakRigid: detRigid, // 0.2660: v₀ρ at the centre of a rigid packet (σ = 3, p₀ = 2)
  l18ChJ: planeCurrent(2, Math.sqrt(0.2)), // 0.4: ρ = 0.2 and v₀ = 2
  l18DeT: stepRT(8, 7.5).T, // 0.64: the challenge l18-de-T, k₂/k₁ = ¼ (E = 8, V₀ = 7.5), T = ¼ · 64/25
  l18DetTotal: detectorTotal(DET.sigma, DET.p0, DET.x0, DET.xd), // 1: the whole passage
  l18CurrentFactorR: Math.abs(planeCurrent(-st43.k1, st43.r.re)) / planeCurrent(st43.k1, 1) / abs2(st43.r), // 1: R carries no speed factor
  l18CurrentFactorT: planeCurrent(st43.k2, st43.tau.re) / planeCurrent(st43.k1, 1) / abs2(st43.tau), // 0.5 = k₂/k₁
  l18StepRatio43: st43.k2 / st43.k1, // 0.5
  l18StepDens43: abs2(st43.tau), // 16/9: the density ratio
  l18DetPeakExact: detPeak, // 0.2565: the peak of the exact current at the detector
  l18DetPeakRatio: detPeak / detRigid, // 0.9645
  /* l18-below */
  l18K: ev.k, // 2
  l18Kappa: ev.kappa, // 2
  l18AbsR: Math.sqrt(abs2(ev.r)), // 1
  l18RBelow: abs2(ev.r), // 1: R = |r|² for E < V₀
  l18PhaseDegMag: Math.abs(arg(ev.r)) * RAD, // 90: r = −i
  l18EdgeDensity: ev.edgeDensity, // 2: |1 + r|² at the edge
  l18DecayLenDensity: penetrationDepth(ev.kappa, Math.exp(-1)), // 0.25 = 1/2κ: the density falls by e
  l18DecayLenAmp: penetrationDepth(ev.kappa, Math.exp(-2)), // 0.5 = 1/κ: the amplitude falls by e
  l18X1pct: penetrationDepth(ev.kappa, 0.01), // 1.151: the density at 1 % of its edge value
  l18EvanescentCurrent: evanescentCurrent(2, 4, 1), // 0: a real exponential carries no current
  l18MaxPenetration: pen.maxRight, // 0.10: the most chance ever in x > 0
  l18PenetrationTime: pen.timeOfMax, // 4: when the packet's centre reaches the step
  l18TStepRbelow: stepRT(0.5, 1).R, // 1 (moved from l13TStepRbelow)
  l18TStepTbelow: stepRT(0.5, 1).T, // 0 (moved)
  /* l18-tunnel */
  l18BarrierT1: barrierT(2, 4, 0.5), // 0.4200 = 1/cosh²(κa) at κa = 1
  l18AppendixAT: abs2(bar.F), // 0.4200: T = |F/A|², the notes' Appendix A route
  l18BarrierWeightedT: barWeightedT, // 0.4196: the energy-weighted T of the packet (σ = 2)
  l18BarrierT05: TAtKa(0.5), // 0.7864
  l18BarrierT2: TAtKa(2), // 0.07065
  l18BarrierT3: TAtKa(3), // 0.009866
  l18BarrierThick3: thickAtKa(3), // 0.009915: the thick form at κa = 3
  l18ThickAtZero: thickAtKa(0), // 4: the thick form as a → 0 (it is not valid there)
  l18ChThickPct: 100 * thickAtKa(3), // 0.9915 percent
  l18BarrierInnerCurrent: barrierInnerCurrent(2, 4, 0.5), // 0.8399 = 2κ Im(D*C)
  l18BarrierOuterCurrent: abs2(bar.F) * planeCurrent(bar.k, 1), // 0.8399 = T times the incident current
  l18TBookAT: bookT(0.53e-10), // 0.7061: E = 5 eV, V₀ = 10 eV, a = 0.53 Å (moved from l13TBookAT)
  l18TBookBohrT: bookT(0.529177e-10), // 0.7068: with the Bohr radius (moved)
  l18TBookQa: bookKappa * 0.53e-10, // 0.6072 (moved)
  l18TBookThick: barrierThick(BOOK_E, BOOK_V0, 0.53e-10, M_ELECTRON, HBAR), // 1.188: the thick form, far outside its range
  l18BookWidthFor068: barrierWidthForT(BOOK_E, BOOK_V0, 0.68, M_ELECTRON, HBAR) * 1e10, // 0.560 Å: the width the printed 0.68 would need
  l18TEV0T: barrierT(2, 2, 1), // 0.5: E = V₀ with ka = 2 (moved)
  l18TDecayFactor:
    barrierThick(BOOK_E, BOOK_V0, 3e-10 + 1 / bookKappa, M_ELECTRON, HBAR) / barrierThick(BOOK_E, BOOK_V0, 3e-10, M_ELECTRON, HBAR), // 0.1353 = e⁻² (moved)
  l18TThickRatio: bookT(3e-10) / barrierThick(BOOK_E, BOOK_V0, 3e-10, M_ELECTRON, HBAR), // 0.9979: exact over thick, a = 0.30 nm (moved)
  /* practice questions */
  l18PrTunnelPct: 100 * barrierT(5 * eV, 8 * eV, 3e-10, M_ELECTRON, HBAR), // 1.812 percent (moved from l13PrTunnelPct)
  l18PrAboveTmin: barrierTMinOverWidth(2, 1).T, // 0.8889: the smallest T above a barrier, E = 2V₀
  l18PrAboveResWidth: barrierResonanceWidth(2, 1), // 2.221: the first width with T = 1
  l18PrFieldExponent: emission, // 13.04: 2∫√(2m(V − E))dx/ħ for the triangular barrier
  l18PrFieldTMant: Math.exp(-emission) / 1e-6, // 2.169 (× 10⁻⁶): T = e^{−exponent}
  l18PrEnergySpread: 4 * spreadP(packet(GRID, { x0: 0, sigma: 3, p0: 4 }), GRID), // 0.6667: ΔE ≈ p₀Δp for σ = 3
} as const

export type ValueKey = keyof typeof V

/** A claim tied to one L18 engine value: its text starts with `key · ` (read by content/claims.test.ts). */
export const claim = keyedClaim<ValueKey>()

export { close, d, pct, tf, uf } from './claimKit'
