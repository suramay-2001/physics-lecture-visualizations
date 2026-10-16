/**
 * Lecture 12 numbers, computed once with the engine (owner: P). Same contract as L1–L11.values.ts: every number a learner reads in L12
 * comes from `V` and is backed by a keyed claim; the numpy twin of each key is in physics/__fixtures__/claims.json
 * (pipeline/make_claim_fixtures.py, "Lecture 12" block). Keys start with `l12`.
 *
 * Conventions: ħ = m = 1 inside the engine (physics/wave.ts, physics/dynamics.ts); lengths are in a fixed length ℓ, momenta in ħ/ℓ, times in
 * mℓ²/ħ (the UI appends the units). The spin examples keep Lecture 11's energies (E₊ = 3ε, E₋ = ε) and write time as the angle εt/ħ in degrees;
 * the three-level example has E = ε, 2ε, 4ε in an equal superposition. The particle on a line is the Gaussian packet of width σ = 1ℓ unless a key
 * says otherwise: ψ(x) = (2πσ²)^{−1/4} e^{−(x−x₀)²/4σ²}, with the cells and intervals read from the cubic-spline integral of |ψ|² (physics/wave.ts).
 * A displayed magnitude of a negative number gets its own key (the number reader sees digits, not signs). Yes/no facts are 1 or 0; a residual that
 * should be zero is stored as itself and claimed to be below a tolerance.
 *
 * This file imports physics/wave (a 448 engine module) but no stage module: a lecture chunk must not pull in stage/svg.
 */
import { abs, arg, c } from '../physics/complex'
import { energyAverage, evolveKet, levels, precession, precessionPeriod, twoLevelH } from '../physics/dynamics'
import { inner, mat } from '../physics/linalg'
import { KET, prob } from '../physics/spin'
import {
  GRID, cellChances, density, dpdx, innerProduct, interval, meanX, meanX2, norm, packet, pOp, peakDensity, spreadX, translate, translateBySteps, xTimes,
} from '../physics/wave'
import { keyedClaim } from './claimKit'

const DEG = Math.PI / 180

/* unit 1: the equal superposition of three energies, E = ε, 2ε, 4ε (ħ = 1; εt/ħ is the time) */
const E3 = [1, 2, 4]
const S3 = 1 / Math.sqrt(3)
const C3 = [c(S3, 0), c(S3, 0), c(S3, 0)]
const H3 = mat([[1, 0, 0], [0, 2, 0], [0, 0, 4]])
const psi90 = levels.evolve(E3, C3, 90 * DEG)
const psiEqual90 = levels.evolve([2, 2, 2], C3, 90 * DEG)
const survival = (E: number[], deg: number) => levels.survival(E, C3, deg * DEG)

/* unit 2: |+x⟩ under H = diag(3ε, ε) (Lecture 11's example); εt/ħ in degrees, so ωt = 2εt/ħ */
const L31 = { upper: 3, lower: 1 }
const TL = twoLevelH(L31.upper, L31.lower)
const PX = KET['+x']
const psiAt = (epsDeg: number) => evolveKet(TL.H, epsDeg * DEG, PX)
const pPlusX = (epsDeg: number) => precession(L31, epsDeg * DEG).pPlusX
const halfPeriodOmegaT = (TL.hbarOmega * precessionPeriod(L31)) / 2 / DEG // ωt at half a period, degrees
/** The εt/ħ (degrees) where P(+x) first falls to 1/2, by bisection on the engine's P(+x; t) (P falls from 1 at t = 0 to 0 at the half period). */
const whenHalf = (() => {
  let lo = 0
  let hi = (precessionPeriod(L31) / 2) / DEG
  for (let i = 0; i < 80; i++) {
    const mid = (lo + hi) / 2
    if (pPlusX(mid) > 0.5) lo = mid
    else hi = mid
  }
  return (lo + hi) / 2
})()

/* units 3–6: a particle on a line. U1 is the unit packet (x₀ = 0, σ = 1); the cells chop the window [−8, 8] */
const U1 = packet(GRID, { x0: 0, sigma: 1 })
const J0 = Math.round((0 - GRID.x[0]) / GRID.dx) // the grid index of x = 0
const cells = (n: number) => cellChances(U1, GRID, [-8, 8], n)
const mid = (n: number) => cells(n)[n / 2] // the cell [0, 16/n)
const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0)
const PQ = packet(GRID, { x0: 0, sigma: 0.25 })
const P2 = packet(GRID, { x0: 2, sigma: 1 })
const J2 = Math.round((2 - GRID.x[0]) / GRID.dx)
const J1 = Math.round((1 - GRID.x[0]) / GRID.dx)
const xP2 = xTimes(P2, GRID)
const herm = (() => {
  const a = packet(GRID, { x0: -1, sigma: 1 })
  const b = packet(GRID, { x0: 1.5, sigma: 0.7 })
  const l = innerProduct(a, xTimes(b, GRID), GRID)
  const r = innerProduct(xTimes(a, GRID), b, GRID)
  return Math.hypot(l.re - r.re, l.im - r.im)
})()
const T3 = translate(U1, GRID, 3)
const T3Err = (() => {
  const want = packet(GRID, { x0: 3, sigma: 1 })
  let m = 0
  for (let j = 0; j < GRID.n; j++) m = Math.max(m, Math.hypot(T3.re[j] - want.re[j], T3.im[j] - want.im[j]))
  return m
})()
// the clue of l12-translations:b7: a packet with its peak at b = 1, shifted by a = 2, peaks at a + b = 3
const peakAt = (() => {
  const d = density(translate(packet(GRID, { x0: 1, sigma: 1 }), GRID, 2))
  let jm = 0
  for (let j = 0; j < d.length; j++) if (d[j] > d[jm]) jm = j
  return GRID.x[jm]
})()
// the leading term of a first-order shift: T(da)ψ − (ψ − da ψ′) = ½ ψ″ da² + O(da³), so the coefficient of da² is ½ max |ψ″| (spectral ψ″)
const firstOrder = (() => {
  const d2 = dpdx(dpdx(U1, GRID), GRID)
  let m = 0
  for (let j = 0; j < GRID.n; j++) m = Math.max(m, Math.hypot(d2.re[j], d2.im[j]))
  return 0.5 * m
})()
const pU1 = pOp(U1, GRID)
const stepNorm = (n: number) => norm(translateBySteps(U1, GRID, 2, n), GRID)
const stepGap = (n: number) => {
  const a = translateBySteps(U1, GRID, 2, n)
  const b = translate(U1, GRID, 2)
  let s = 0
  for (let j = 0; j < GRID.n; j++) s += (a.re[j] - b.re[j]) ** 2 + (a.im[j] - b.im[j]) ** 2
  return Math.sqrt(s * GRID.dx)
}

export const V = {
  /* l12-law */
  l12MeanH: energyAverage(H3, C3), // 2.3333 = 7/3: ⟨H⟩ of the equal superposition, in ε
  l12EnergyChance90: abs(psi90[1]) ** 2, // 1/3: each energy keeps its chance at εt/ħ = 90°
  l12Survival90: survival(E3, 90), // 1/9
  l12Survival45: survival(E3, 45), // 1/3
  l12SurvivalEqual: survival([2, 2, 2], 90), // 1: three equal energies, one common phase
  l12Hand90a: Math.abs(arg(psi90[0])) / DEG, // 90: the hands at εt/ħ = 90° point at −90°,
  l12Hand90b: Math.abs(arg(psi90[1])) / DEG, // 180: −180°
  l12Hand90c: Math.abs(arg(psi90[2])) / DEG, // 0: and 0°
  l12EqualHand: Math.abs(arg(psiEqual90[0])) / DEG, // 180: three equal energies turn their hands together to −180°
  /* l12-motion */
  l12AmpAbs60: abs(inner(PX, psiAt(30))), // 0.8660: |⟨+x|ψ⟩| at ωt = 60°
  l12Px60: pPlusX(30), // 0.75
  l12Px90: pPlusX(45), // 0.5
  l12Px180: pPlusX(90), // 0
  l12PmX60: 1 - pPlusX(30), // 0.25
  l12PminusXHalfPeriod: prob(KET['-x'], psiAt(90)), // 1: P(−x) at the half period
  l12PxPeriod: pPlusX(180), // 1: back after one period
  l12HalfOmegaT: halfPeriodOmegaT, // 180: ωt at half a period, in degrees
  l12WhenHalf: whenHalf, // 45: the εt/ħ (degrees) where P(+x) = ½
  /* l12-continuum */
  l12CellP4: mid(4), // 0.4999
  l12CellP8: mid(8), // 0.4773
  l12CellP64: mid(64), // 0.0987
  l12CellP512: mid(512), // 0.0125
  l12CellsSum64: sum(cells(64)), // 1
  l12CellDensity64: mid(64) / (16 / 64), // 0.395
  l12CellDensity512: mid(512) / (16 / 512), // 0.3989
  l12DensityAt0: density(U1)[J0], // 0.3989
  /* l12-wavefunction */
  l12Norm: norm(U1, GRID), // 1
  l12PRight: interval(U1, GRID, 0, 31.9), // 0.5
  l12P1sigma: interval(U1, GRID, -1, 1), // 0.6827
  l12P2sigma: interval(U1, GRID, -2, 2), // 0.9545
  l12PeakQuarter: peakDensity(PQ), // 1.5958
  l12QuarterP: interval(PQ, GRID, -0.25, 0.25), // 0.6827: one width either side of the narrow packet's centre
  /* l12-position-op */
  l12XPsiAt2: xP2.re[J2], // 1.2633: (x̂ψ)(2) for the packet at 2
  l12MeanX: meanX(P2, GRID), // 2
  l12SdX: spreadX(P2, GRID), // 1
  l12MeanX2: meanX2(P2, GRID), // 5 = x₀² + σ²
  l12XHermResidual: herm, // 0 (a rounding error): ⟨a|xb⟩ − ⟨xa|b⟩
  /* l12-translations */
  l12ShiftNorm: norm(T3, GRID), // 1
  l12ShiftMean: meanX(T3, GRID), // 3
  l12ShiftPeak: density(T3)[Math.round((3 - GRID.x[0]) / GRID.dx)], // 0.3989
  l12ShiftErr: T3Err, // 0 (a rounding error): T(3)ψ against the packet at 3
  l12PeakPos: peakAt, // 3: the peak of the packet at b = 1 after a shift by a = 2
  l12FirstOrderCoef: firstOrder, // 0.1579: the coefficient of da² (½ max |ψ″|)
  l12PPsiIm1: pU1.im[J1], // 0.2460
  l12PPsiRe1: pU1.re[J1], // 0
  l12StepNorm1: stepNorm(1), // 2.000
  l12StepNorm4: stepNorm(4), // 1.337
  l12StepNorm16: stepNorm(16), // 1.069
  l12StepNorm64: stepNorm(64), // 1.016
  l12StepNorm256: stepNorm(256), // 1.004
  l12StepGap1: stepGap(1), // 0.758
  l12StepGap4: stepGap(4), // 0.267
  l12StepGap16: stepGap(16), // 0.058
  l12StepGap64: stepGap(64), // 0.0138
  l12StepGap256: stepGap(256), // 0.0034
} as const

export type ValueKey = keyof typeof V

/** A claim tied to one L12 engine value: its text starts with `key · ` (read by content/claims.test.ts). */
export const claim = keyedClaim<ValueKey>()

export { close, d, pct, tf, uf } from './claimKit'
