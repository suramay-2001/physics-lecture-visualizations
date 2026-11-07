/**
 * Lecture 16 numbers, computed once with the engine (owner: P). Same contract as L1–L15.values.ts: every number a learner reads in L16 comes from `V` and is backed by a keyed claim; the numpy
 * twin of each `l16…` key is in physics/__fixtures__/claims-448/l16.json (pipeline/claims_448/l16.py). Eight keys moved here from Lecture 13 (ruling M2 of docs/roles/decisions/448-L14L18.md) and
 * took the lecture prefix, because the claim lint needs it: `l13FreeDp4` → `l16FreeDp4`, `l13FreeSd2` → `l16FreeSd2`, `l13FreeSd4` → `l16FreeSd4`, `l13SpreadElectronMant` → `l16SpreadElectronMant`,
 * `l13SpreadElectronLog10` → `l16SpreadElectronLog10`, `l13SpreadMarbleMant` → `l16SpreadMarbleMant`, `l13SpreadMarbleYearsMant` → `l16SpreadMarbleYearsMant`, `l13EhrenfestDpDt` → `l16EhrenfestDpDt`.
 *
 * Conventions as Lectures 12–15: ħ = m = 1 inside the engine (physics/wave.ts, wave16.ts); lengths are in ℓ, momenta in ħ/ℓ, times in mℓ²/ħ (the UI appends the units). The p₀ = 3 packet is run only to
 * t = 4 (its centre reaches 12), and a width at t = 20 is the closed form, because the periodic window is 64 ℓ wide. A displayed magnitude of a negative number gets its own key (the number reader sees
 * digits, not signs); a residual that should be zero is stored as itself and claimed to be below a tolerance. `l16EchoBeta` repeats an input the lecture chose (the chirp β = −0.2) so that the number
 * reader finds it backed; it is not a result.
 *
 * This file imports physics modules but no stage module: a lecture chunk must not pull in stage/svg.
 */
import { HBAR, M_ELECTRON, YEAR_S, spreadTime } from '../physics/constants'
import { GRID, freeEvolve, gaussianWidth, meanP, meanX, norm, packet, peakDensity, spreadP, spreadX } from '../physics/wave'
import { kineticEnergy } from '../physics/wave14'
import { spreadScale } from '../physics/wave15'
import { chirpPacket, commutatorRate, covarianceXP, gaussianExact, meanOf, momentumSquareMean, spinMeanRate, townsendPacket, widthTime } from '../physics/wave16'
import { keyedClaim } from './claimKit'

const PK = (x0: number, sigma: number, p0 = 0) => packet(GRID, { x0, sigma, p0 })
const gap = (a: { re: Float64Array; im: Float64Array }, b: { re: Float64Array; im: Float64Array }) => {
  let w = 0
  for (let j = 0; j < a.re.length; j++) w = Math.max(w, Math.hypot(a.re[j] - b.re[j], a.im[j] - b.im[j]))
  return w
}

/* the unit packet (σ = 1, p₀ = 0) and the p₀ = 3 packet, and their evolutions */
const K1 = PK(0, 1)
const K3 = PK(0, 1, 3)
const K1_T2 = freeEvolve(K1, GRID, 2)
const K1_T4 = freeEvolve(K1, GRID, 4)
const K3_T4 = freeEvolve(K3, GRID, 4)

/* l16-evolve: the closed form against the grid evolution, at the three times the lecture checks */
const formulaGap = Math.max(...[1, 2, 4].map((t) => gap(gaussianExact(GRID, { x0: 0, sigma: 1, p0: 3 }, t), freeEvolve(K3, GRID, t))))

/* l16-spread: SI inputs of Townsend Ex. 6.4 (a gram with a = 1 mm, an electron with a = 10⁻¹⁰ m) */
const tMarbleMant = spreadTime(1e-3, 1e-3) // seconds
const tElectron = spreadTime(M_ELECTRON, 1e-10) // seconds

/* l16-spread:b8, the chirp: σ = 1, β = −0.2 */
const CH = chirpPacket(GRID, { x0: 0, sigma: 1, beta: -0.2 })
const chDp = spreadP(CH, GRID)
const chCov = covarianceXP(CH, GRID)
const tStar = -chCov / (chDp * chDp)

/* l16-ehrenfest: V = x²/2 */
const HARMONIC = (x: number) => 0.5 * x * x
const QUARTIC = (x: number) => (x * x * x * x) / 4
const Q10 = PK(1, 0.5)
const G05_P2 = PK(0, 0.5, 2)

export const V = {
  /* l16-start */
  l16Dp1: spreadP(K1, GRID), // 0.5 = ħ/2σ
  l16Product0: spreadX(K1, GRID) * spreadP(K1, GRID), // 0.5: the Gaussian saturates the bound
  l16Peak0: peakDensity(K1), // 0.3989 = 1/(√(2π)σ)
  l16DpFixed: spreadP(K1_T4, GRID) - spreadP(K1, GRID), // 0 (rounding): Δp at t = 4 against t = 0
  l16CentreStays: meanX(K1_T4, GRID), // 0 (rounding): p₀ = 0, so the centre stays at x₀ = 0
  l16StDp: spreadP(PK(0, 0.5), GRID), // 1: the warm-up, σ = ½
  l16StCentre: meanX(freeEvolve(PK(1, 1), GRID, 3), GRID), // 1: x₀ = 1, p₀ = 0, t = 3
  l16PrP2: momentumSquareMean(G05_P2, GRID), // 5 = p₀² + 1/4σ²: the practice, σ = ½ and p₀ = 2
  l16PrKinetic: kineticEnergy(G05_P2, GRID), // 2.5 = ⟨p²⟩/2m
  /* l16-evolve */
  l16Ts1: spreadScale(1), // 2 = 2mσ²/ħ for σ = 1
  l16FormulaGap: formulaGap, // 8.7e−10: the closed form against the grid evolution (t = 1, 2, 4), the periodic window's tail
  l16FormulaT0Gap: gap(gaussianExact(GRID, { x0: 0, sigma: 1, p0: 3 }, 0), K3), // 0: at t = 0 the formula is the initial state
  l16Mean2: meanX(gaussianExact(GRID, { x0: 0, sigma: 1, p0: 3 }, 2), GRID), // 6 = x₀ + p₀t/m
  l16TownsendGap: gap(townsendPacket(GRID, Math.SQRT2, 2), gaussianExact(GRID, { x0: 0, sigma: 1 }, 2)), // 0 (rounding): Townsend's Eq. 6.76 with a = √2σ against the notes' form
  l16EvTs: spreadScale(1.5), // 4.5: the warm-up, σ = 1.5
  l16EvCentre: meanX(freeEvolve(PK(1, 1, 3), GRID, 2), GRID), // 7 = x₀ + p₀t/m with x₀ = 1
  /* l16-spread */
  l16PeakTs: peakDensity(K1_T2), // 0.2821 = 1/(√2π σ√2): the peak at t = t_s
  l16Norm4: norm(K1_T4, GRID), // 1
  l16FreeSd2: spreadX(K1_T2, GRID), // 1.414 (moved from l13FreeSd2)
  l16FreeSd4: spreadX(K1_T4, GRID), // 2.236 (moved from l13FreeSd4)
  l16FreeDp4: spreadP(K3_T4, GRID), // 0.5 (moved from l13FreeDp4): Δp of the p₀ = 3 packet at t = 4
  l16FarRatio: gaussianWidth(1, 20) / (spreadP(K1, GRID) * 20), // 1.005: Δx(20) over Δp·t
  l16Dx05T2: spreadX(freeEvolve(PK(0, 0.5), GRID, 2), GRID), // 2.062: σ = ½ at t = 2
  l16DxCross: spreadX(freeEvolve(K1, GRID, 1), GRID), // 1.118: σ = 1 at t = 1 (the σ = ½ packet has the same width then)
  l16ProductTs: spreadX(K1_T2, GRID) * spreadP(K1_T2, GRID), // 0.7071
  l16Product4: spreadX(K1_T4, GRID) * spreadP(K1_T4, GRID), // 1.118
  l16SpDx: spreadX(freeEvolve(PK(0, 2), GRID, spreadScale(2)), GRID), // 2.828: σ = 2 at t = t_s
  l16SpreadElectronMant: tElectron / 1e-17, // 8.64 (× 10⁻¹⁷ s; moved from l13SpreadElectronMant)
  l16SpreadElectronLog10: Math.log10(tElectron), // −16.06 (moved)
  l16SpreadMarbleMant: tMarbleMant / 1e24, // 9.48 (× 10²⁴ s; moved)
  l16SpreadMarbleYearsMant: tMarbleMant / YEAR_S / 1e17, // 3.0 (× 10¹⁷ years; moved)
  /* l16-spread:b8, the chirp */
  l16EchoBeta: 0.2, // |β| of the chirp (an input)
  l16ChirpDp: chDp, // 0.640 = √(1/4σ² + 4β²σ²)
  l16ChirpCovMag: Math.abs(chCov), // 0.4 = |2βσ²|
  l16ChirpFocusTime: tStar, // 0.9756 = −mC/(Δp)²
  l16ChirpMinWidth: spreadX(freeEvolve(CH, GRID, tStar), GRID), // 0.7809
  l16ChirpBackTime: 2 * tStar, // 1.951
  l16ChirpDxBack: spreadX(freeEvolve(CH, GRID, 2 * tStar), GRID), // 1: back to the starting width
  /* l16-ehrenfest */
  l16EhrenfestDxdt: commutatorRate(PK(2, 1, 1.5), GRID, HARMONIC, 'x'), // 1.5 = ⟨p⟩/m
  l16EhrenfestDpDt: commutatorRate(PK(2, 1), GRID, HARMONIC, 'p'), // −2 (moved from l13EhrenfestDpDt): V = x²/2, packet at 2
  l16EhrenfestForceMean: -meanOf(PK(2, 1), GRID, (x) => x), // −2 = −⟨V′⟩ = −⟨x⟩
  l16EhrenfestFreeGap: Math.abs(meanX(K3_T4, GRID) - 12), // 0 (rounding): V = 0, ⟨x⟩ at t = 4 against x₀ + p₀t/m
  l16FreeMeanP4: meanP(K3_T4, GRID), // 3: ⟨p⟩ of the free packet at t = 4
  /* practice */
  l16PrTsFs: spreadScale(0.5e-9, M_ELECTRON, HBAR) / 1e-15, // 4.319 fs: t_s of an electron packet with σ = 0.5 nm
  l16PrDoubleFs: widthTime(0.5e-9, 2, M_ELECTRON, HBAR) / 1e-15, // 7.481 fs: Δx = 2σ
  l16PrQuarticDpdt: commutatorRate(Q10, GRID, QUARTIC, 'p'), // −1.75: V = x⁴/4, x₀ = 1, σ = ½
  l16PrQuarticMean3: meanOf(Q10, GRID, (x) => x * x * x), // 1.75 = x₀³ + 3x₀σ²
  l16PrQuarticCentreForce: -(meanX(Q10, GRID) ** 3), // −1: the force at the centre
  l16PrSpinDXdt: spinMeanRate(Math.PI / 3), // −0.866: from the rate law
  l16PrSpinMag: Math.abs(spinMeanRate(Math.PI / 3)), // 0.866
} as const

export type ValueKey = keyof typeof V

/** A claim tied to one L16 engine value: its text starts with `key · ` (read by content/claims.test.ts). */
export const claim = keyedClaim<ValueKey>()

export { close, d, pct, tf, uf } from './claimKit'
