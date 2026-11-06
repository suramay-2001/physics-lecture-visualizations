/**
 * Lecture 17 numbers, computed once with the engine (owner: P; plan docs/roles/proposals/P-L17-story.md, rulings docs/roles/decisions/448-L14L18.md). Same contract as
 * L1–L13.values.ts: every number a learner reads in L17 comes from `V` and is backed by a keyed claim; the numpy twin of each key is in
 * physics/__fixtures__/claims-448/l17.json (pipeline/claims_448/l17.py: the step solved as matching conditions with np.linalg.solve, currents as Im(conj(ψ)ψ′), mean motion by
 * the matrix exponential of the moment equations, mean forces as trapezoid integrals, the ramped block as forward differences). Keys start with `l17`, except the eight keys MOVED
 * from L13 (`l17ContResidualFree`, `l17CurrentMean`, `l17StepR2/T2/R3/T3`, `l17PrStepT/R`: ruling M2) which keep their names and their twins in claims-448/g4b.json.
 *
 * Conventions as Lecture 13: ħ = m = 1 inside the engine; lengths in ℓ, momenta in ħ/ℓ, times in mℓ²/ħ. The step is E = 4V₀/3 (E = 2, V₀ = 3/2, k₁ = 2, k₂ = 1) unless a key says
 * otherwise. A displayed magnitude of a negative number gets its own key (the number reader sees digits, not signs); a residual that should be zero is stored as itself and claimed to be
 * below a tolerance. The "narrow peaks" are Gaussians of width 0.1 (0.05 for the challenge) with equal weights; the packet is the unit Gaussian ψ = (2πσ²)^{−1/4}e^{−(x−x₀)²/4σ²}e^{ip₀x}.
 *
 * This file imports physics modules (wave, scatter) but no stage module: a lecture chunk must not pull in stage/svg.
 */
import { ehrenfestConstMean, forceMean, harmonicMean, harmonicWidth, planeCurrent, rampBlockKinetic, stepAmplitudes, stepFringe, stepRT, totalCurrent, continuityResidual } from '../physics/scatter'
import { GRID, type Wave, gaussianWidth, meanX, packet, spreadX } from '../physics/wave'
import { keyedClaim } from './claimKit'

const PK = (x0: number, sigma: number, p0 = 0) => packet(GRID, { x0, sigma, p0 })
const pk15 = PK(0, 1, 1.5)

/** Equal-weight Gaussian peaks of width s at the given centres: ψ = √ρ with ρ their mixture (real), so |ψ|² is the position distribution of the "two narrow peaks" of the notes. */
function peaks(centres: number[], s: number): Wave {
  const re = new Float64Array(GRID.n)
  for (let j = 0; j < GRID.n; j++) {
    let rho = 0
    for (const c of centres) rho += Math.exp(-((GRID.x[j] - c) ** 2) / (2 * s * s)) / (s * Math.sqrt(2 * Math.PI)) / centres.length
    re[j] = Math.sqrt(rho)
  }
  return { re, im: new Float64Array(GRID.n) }
}

const st43 = stepAmplitudes(2, 1.5) // E = 4V₀/3: k₁ = 2, k₂ = 1, r = 1/3, τ = 4/3
const near = stepAmplitudes(1.0001, 1) // just above the threshold
const fr = stepFringe(2, 1.5)
const smoothStep = Float64Array.from(GRID.x, (x) => (3.375 * (1 + Math.tanh(x / 0.5))) / 2) // a smooth step: the V terms still cancel
const sq = (x: number) => x * x
const twoPeaks = peaks([-2, 2], 0.1)
const restoring = peaks([0, 2], 0.1)
const sineMean = (mu: number, sigma: number) => -forceMean(PK(mu, sigma), GRID, (x) => -Math.sin(x)) // E[sin x] = the magnitude of the mean force of F = −sin x
const sineTaylor = (mu: number, sigma: number) => Math.abs(-Math.sin(mu) + 0.5 * Math.sin(mu) * spreadX(PK(mu, sigma), GRID) ** 2) // |F(μ) + ½F″(μ)(Δx)²|, F″ = sin x
const jRef = planeCurrent(-st43.k1, st43.r.re) // negative: the reflected wave moves left

export const V = {
  /* l17-mean-force */
  l17ConstMean2: ehrenfestConstMean(0, 3, 1, 2), // 8: x₀ = 0, p₀ = 3, F₀ = 1, t = 2
  l17ConstDx2: gaussianWidth(1, 2), // 1.414: a constant force leaves the width to free spreading
  l17HarmMeanHalfPi: harmonicMean(2, 0, 1, Math.PI / 2), // 0 (x₀ = 2, Ω = 1)
  l17HarmDxHalfPi: harmonicWidth(1, 1, Math.PI / 2), // 0.5 (σ = 1)
  l17HarmMeanPi: harmonicMean(2, 0, 1, Math.PI), // −2
  l17HarmDxPi: harmonicWidth(1, 1, Math.PI), // 1
  l17TwoPeakMeanX: meanX(twoPeaks, GRID), // 0
  l17TwoPeakMeanF: forceMean(twoPeaks, GRID, sq), // 4.01 (peaks of width 0.1 at ±2, γ = 1)
  l17GaussMeanF: forceMean(PK(2, 1), GRID, sq), // 5
  l17GaussForceAtMean: meanX(PK(2, 1), GRID) ** 2, // 4
  l17VarCorrection: 0.5 * 2 * spreadX(PK(2, 1), GRID) ** 2, // 1 = ½F″(Δx)² with F″ = 2γ
  l17RestoringRatio: forceMean(restoring, GRID, (x) => -x * Math.abs(x)) / (-meanX(restoring, GRID) * Math.abs(meanX(restoring, GRID))), // 2.005
  l17SineExactA: sineMean(Math.PI / 2, 0.5), // 0.8825 = e^{−1/8}
  l17SineTaylorA: sineTaylor(Math.PI / 2, 0.5), // 0.875
  l17SineExactB: sineMean(Math.PI / 2, 1), // 0.6065
  l17SineTaylorB: sineTaylor(Math.PI / 2, 1), // 0.5
  l17ChTwoPeaks: forceMean(peaks([-3, 3], 0.05), GRID, sq), // 9.0025 (the challenge: ⟨x²⟩ for sharp peaks at ±3)
  l17ChVar: forceMean(PK(3, 0.5), GRID, sq), // 9.25
  l17PrMeanFactor: forceMean(PK(3, 0.5), GRID, sq) / meanX(PK(3, 0.5), GRID) ** 2, // 1.0278 = 1 + σ²/μ²
  /* l17-step */
  l17K1: st43.k1, // 2
  l17K2: st43.k2, // 1
  l17StepRatio43: st43.k2 / st43.k1, // 0.5
  l17StepRAmp43: st43.r.re, // 1/3
  l17StepTau43: st43.tau.re, // 4/3
  l17StepDens43: st43.tau.re ** 2 + st43.tau.im ** 2, // 16/9
  l17StepTau1p0001: near.tau.re, // 1.980 at E = 1.0001 V₀
  l17StepR1p0001: near.R, // 0.961
  l17TrapT1: rampBlockKinetic(10, 1), // 0.09375
  l17TrapT05: rampBlockKinetic(10, 0.5), // 0.1935
  l17TrapRatio: rampBlockKinetic(10, 0.5) / rampBlockKinetic(10, 1), // 2.065
  l17ChR: stepAmplitudes(4.5, 4).r.re, // k₁ = 3k₂: r = 1/2
  l17ChTau: stepAmplitudes(4.5, 4).tau.re, // τ = 3/2
  /* l17-current */
  l17ContResidualFree: continuityResidual(pk15, GRID), // 0 (rounding error); MOVED from L13
  l17CurrentMean: totalCurrent(pk15, GRID), // 1.5 = ⟨p⟩/m; MOVED
  l17ContResidualStep: continuityResidual(PK(-6, 1.5, 3), GRID, smoothStep), // 0 (rounding error) across a smooth step: the V terms cancel
  l17Jin: planeCurrent(st43.k1, 1), // 2
  l17JrefMag: Math.abs(jRef), // 0.2222
  l17Jtr: planeCurrent(st43.k2, st43.tau.re), // 1.778
  l17JBalance: planeCurrent(st43.k1, 1) + jRef - planeCurrent(st43.k2, st43.tau.re), // 0
  l17FringeMax: fr.max, // 1.778
  l17FringeMin: fr.min, // 0.444
  l17FringeSpacing: fr.spacing, // 1.571
  l17RplusT: st43.R + st43.T, // 1
  l17StepR43: st43.R, // 1/9
  l17StepT43: st43.T, // 8/9
  l17ChNet: (planeCurrent(st43.k1, 1) + planeCurrent(-st43.k1, 0.5)) / planeCurrent(st43.k1, 1), // |B| = |A|/2: 3/4
  l17StepR2: stepRT(2, 1).R, // 0.0294; MOVED
  l17StepT2: stepRT(2, 1).T, // 0.9706; MOVED
  l17StepR3: stepRT(3, 1).R, // 0.0102; MOVED
  l17StepT3: stepRT(3, 1).T, // 0.9898; MOVED
  l17PrStepR: stepRT(1.5, 1).R, // 0.0718 (practice: E = 1.5 V₀); MOVED
  l17PrStepT: stepRT(1.5, 1).T, // 0.9282; MOVED
} as const

export type ValueKey = keyof typeof V

/** A claim tied to one L17 engine value: its text starts with `key · ` (read by content/claims.test.ts). */
export const claim = keyedClaim<ValueKey>()

export { close, d, pct, tf, uf } from './claimKit'
