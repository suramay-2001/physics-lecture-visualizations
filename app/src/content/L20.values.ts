/**
 * Lecture 20 numbers, computed once with the engine (owner: P; plan docs/roles/proposals/P-L20-story.md, rulings docs/roles/decisions/448-L19L20.md). Same contract as L1–L18.values.ts: every
 * number a learner reads in L20 comes from `V` and is backed by a keyed claim; the numpy twin of each key is in physics/__fixtures__/claims-448/l20.json (pipeline/claims_448/l20.py: the
 * finite well's levels by scipy brentq on a scan of the two smooth matching forms, its tails by scipy quad of the unnormalised pieces, the box by Simpson integrals of analytic functions, the
 * sloshing mean by a Simpson integral of x|ψ|² of the complex pair state, the thin deep well by brentq). Keys start with `l20`. Eleven keys MOVED from Lecture 14 with the infinite well
 * (ruling R2): `l14TBoxE1Ev`, `l14TBoxOverlap`, `l14TBoxP1`, `l14TBoxP2`, `l14TBoxP3`, `l14TBoxSumOdd`, `l14TBoxEnergyRatio`, `l14TBoxDpRatio`, `l14TWall2P1`, `l14PrE1Ev` and `l14PrWall3`
 * became `l20TBoxE1Ev`, … `l20PrWall3` (the claim lint needs the lecture prefix); their twins moved from claims-448/g4b.json to claims-448/l20.json. `l14TBoxNodes4` stays in Lecture 14.
 *
 * Conventions: ħ = m = 1 inside the engine; lengths in ℓ, energies in ħ²/mℓ², times in mℓ²/ħ. Scenario F is the finite well V₀ = 8, a = 2 (z₀ = 4, three bound levels). The infinite
 * boxes of the story have widths 4 and 6 (the sloshing pair); the practice boxes are the unit width. A displayed magnitude of a negative number gets its own key (the number reader sees
 * digits, not signs); a residual that should be zero is stored as itself and claimed to be below a tolerance.
 *
 * This file imports physics modules but no stage module: a lecture chunk must not pull in stage/svg.
 */
import { E_CHARGE, HBAR, M_ELECTRON, boxEnergyEv } from '../physics/constants'
import { GRID, boxEnergy, boxMomentumSpread, boxNodes, boxOverlap, boxState } from '../physics/wave'
import { boxPairParts, boxPairPeriod } from '../physics/wave14'
import {
  boxFunctionEnergy, boxFunctionOverlap, boxPairMeanX, boxPositionSpread, boxWallSlope, deltaWellBinding, gaussianOscillatorBestWidth, gaussianOscillatorEnergy, thinWellBinding, wellCount,
  wellCurrent, wellEnergyRatio, wellEvenLeft, wellLevels, wellMismatch, wellNodes, wellParityOverlap, wellTail, wellThreshold, wellWallRatio,
} from '../physics/wave20'
import { keyedClaim } from './claimKit'

/* scenario F */
const F = wellLevels(8, 2)
/* the electron: ħ²/mℓ² for ℓ = 1 Å in eV (twice the book's 3.81 eV Å²), so a well 3 eV deep and 5 Å wide is V₀ = 3/ε and a = 5 in these units */
const EPS_EV = (2 * HBAR * HBAR * 1e20) / (2 * M_ELECTRON) / E_CHARGE
const electron = wellLevels(3 / EPS_EV, 5)

/* the box moved from Lecture 14 (Townsend Ex. 6.6): the ground state of a box widened on both sides to twice its width, about the same centre */
const BOX_OLD = { lo: -0.5, hi: 0.5, n: 1 }
const boxNew = (n: number) => ({ lo: -1, hi: 1, n })

/* the sloshing pair: a box of width 6, levels 1 and 2 */
const slosh = boxPairPeriod(6, 1, 2)
const sloshGrid = (): number => {
  let worst = 0
  for (const t of [0, 2.5, slosh / 3, slosh / 2]) {
    const psi = boxState(GRID, 6, [1, 2], t)
    for (let j = 0; j < GRID.n; j += 7) {
      const x = GRID.x[j]
      if (x < 0 || x > 6) continue
      worst = Math.max(worst, Math.abs(psi.re[j] ** 2 + psi.im[j] ** 2 - boxPairParts(6, 1, 2, t, x).total))
    }
  }
  return worst
}

/* the current of a bound state: j = Im(φ*φ′) of the real state φ₁ of scenario F at points away from the edges (exactly 0) */
const wellCurrentMax = (): number => Math.max(...[-3, -1.5, -0.7, -0.2, 0, 0.3, 0.9, 2.4].map((x) => Math.abs(wellCurrent(8, 2, 1, x))))

/* the practice trial function ψ ∝ x(L − x)(L − 2x) on 0 < x < 1 and the lopsided tent of the kink question */
const trial = (x: number): number => x * (1 - x) * (1 - 2 * x)
const dTrial = (x: number): number => 1 - 6 * x + 6 * x * x
/* the lopsided tent of the kink question: rises to a peak at L/3, then falls more slowly (slopes 3 and −3/2 for ψ with peak 1) */
const skew = (x: number): number => (x < 1 / 3 ? 3 * x : 1.5 * (1 - x))
const dSkew = (x: number): number => (x < 1 / 3 ? 3 : -1.5)

export const V = {
  /* l20-reverse */
  l20K1: F[0].k, // 1.2524
  l20Kappa1: F[0].kappa, // 3.7989
  l20TailGround: wellTail(8, 2, 1), // 0.0204: the chance outside the well, level 1
  l20MismatchE1: wellMismatch(F[0].E, 8, 2, 'even'), // 0 at the ground energy
  l20MismatchHigh: Math.abs(wellMismatch(1.2, 8, 2, 'even')), // 0.367 (negative: E = 1.2 is above the level)
  l20MismatchLow: wellMismatch(0.4, 8, 2, 'even'), // 0.436 (positive: E = 0.4 is below it)
  /* l20-infinite */
  l20BoxE1L4: boxEnergy(4, 1), // 0.3084
  l20BoxE3overE1: boxEnergy(4, 3) / boxEnergy(4, 1), // 9
  l20BoxAmpL4: boxWallSlope(4, 1) / (Math.PI / 4), // 0.7071 = √(2/4)
  l20Nodes3: boxNodes(boxState(GRID, 4, 3), GRID, 0, 4), // 2 interior nodes in level 3
  l20ChNodes4: boxNodes(boxState(GRID, 4, 4), GRID, 0, 4), // 3 interior nodes in level 4
  l20DxL4: boxPositionSpread(4, 1), // 0.7230
  l20DpL4: boxMomentumSpread(4, 1), // 0.7854
  l20ProductGround: boxPositionSpread(4, 1) * boxMomentumSpread(4, 1), // 0.5679
  l20WallSlope: boxWallSlope(4, 1), // 0.5554: φ′ just inside the wall
  l20TBoxE1Ev: boxEnergyEv(0.4e-9, M_ELECTRON), // 2.350 eV: an electron in a well 0.4 nm wide (moved from l14TBoxE1Ev)
  l20TBoxOverlap: Math.abs(boxOverlap(BOX_OLD, boxNew(1))), // 0.8488 = 8/3π (moved)
  l20TBoxP1: boxOverlap(BOX_OLD, boxNew(1)) ** 2, // 0.7205 (moved)
  l20TBoxP2: boxOverlap(BOX_OLD, boxNew(2)) ** 2, // 0 (moved)
  l20TBoxP3: boxOverlap(BOX_OLD, boxNew(3)) ** 2, // 0.2594 (moved)
  l20TBoxSumOdd: Array.from({ length: 399 }, (_, i) => boxOverlap(BOX_OLD, boxNew(i + 1)) ** 2).reduce((a, b) => a + b, 0), // 1 (to 2e-8) (moved)
  l20TWall2P1: boxOverlap({ lo: 0, hi: 1, n: 1 }, { lo: 0, hi: 2, n: 1 }) ** 2, // 0.3603: one wall moves out to twice the width (moved)
  l20TBoxEnergyRatio: boxEnergy(2, 1) / boxEnergy(4, 1), // 4: half the width (moved)
  l20TBoxDpRatio: boxMomentumSpread(2, 1) / boxMomentumSpread(4, 1), // 2 (moved)
  l20PrE1Ev: boxEnergyEv(0.55e-9, M_ELECTRON), // 1.243 eV (moved)
  l20PrWall3: boxOverlap({ lo: 0, hi: 1, n: 1 }, { lo: 0, hi: 3, n: 1 }) ** 2, // 0.1282 (moved)
  /* l20-finite */
  l20SumSq: F[0].k ** 2 + F[0].kappa ** 2, // 16 = 2V₀
  l20WallValueRatio: wellWallRatio(8, 2), // 0.3131: φ at the wall over φ at the centre
  l20DecayLen1: 1 / F[0].kappa, // 0.2632
  l20DecayLen2: 1 / F[1].kappa, // 0.3182
  l20DecayLen3: 1 / F[2].kappa, // 0.5704
  l20Kappa2: F[1].kappa, // 3.1428
  l20Kappa3: F[2].kappa, // 1.7532
  l20WellCurrent: wellCurrentMax(), // 0: a real state carries no current
  l20Parity1: Math.round(wellParityOverlap(8, 2, 1)), // +1
  l20Parity2: Math.round(wellParityOverlap(8, 2, 2)), // −1
  l20Parity3: Math.round(wellParityOverlap(8, 2, 3)), // +1
  l20Nodes1Fin: wellNodes(8, 2, 1), // 0
  l20Nodes2Fin: wellNodes(8, 2, 2), // 1
  l20Nodes3Fin: wellNodes(8, 2, 3), // 2
  l20EvenLeft1: wellEvenLeft(8, 2), // 3.799 = k tan(ka/2) for level 1
  l20EvenResidual1: wellEvenLeft(8, 2) - F[0].kappa, // 0
  l20E1Fin: F[0].E, // 0.7842
  l20E2Fin: F[1].E, // 3.0618
  l20E3Fin: F[2].E, // 6.4631
  l20NBound: F.length, // 3
  l20NEven: F.filter((l) => l.parity === 'even').length, // 2
  l20Thresh2: wellThreshold(2, 2), // 1.2337
  l20Thresh3: wellThreshold(2, 3), // 4.9348
  l20Thresh4: wellThreshold(2, 4), // 11.103
  l20ShallowCount: wellCount(0.125, 2), // 1
  l20FiCount: wellCount(20, 2), // 5
  l20PrE1: electron[0].E * EPS_EV, // 0.696 eV: an electron in a well 0.5 nm wide and 3 eV deep
  l20PrInfEv: boxEnergyEv(0.5e-9, M_ELECTRON), // 1.504 eV: the infinite well of the same width
  /* l20-compare */
  l20E1Inf: boxEnergy(2, 1), // 1.2337
  l20E2Inf: boxEnergy(2, 2), // 4.9348
  l20E3Inf: boxEnergy(2, 3), // 11.103
  l20E1Ratio: wellEnergyRatio(8, 2, 1), // 0.6356
  l20E2Ratio: wellEnergyRatio(8, 2, 2), // 0.6204
  l20E3Ratio: wellEnergyRatio(8, 2, 3), // 0.5821
  l20RatioV32: wellEnergyRatio(32, 2, 1), // 0.7892
  l20RatioV128: wellEnergyRatio(128, 2, 1), // 0.8857
  l20RatioV512: wellEnergyRatio(512, 2, 1), // 0.9403
  l20RatioV2048: wellEnergyRatio(2048, 2, 1), // 0.9695
  l20TailV32: wellTail(32, 2, 1), // 0.00343
  l20TailV128: wellTail(128, 2, 1), // 5.04e-4
  l20TailV512: wellTail(512, 2, 1), // 6.87e-5
  l20TailV2048: wellTail(2048, 2, 1), // 8.99e-6
  l20SloshFormulaGap: sloshGrid(), // 0 (a rounding error): the complex pair density against the formula
  l20E1L6: boxEnergy(6, 1), // 0.1371
  l20DeltaEL6: boxEnergy(6, 2) - boxEnergy(6, 1), // 0.4112
  l20SloshPeriodL6: slosh, // 15.279
  l20SloshAmpL6: Math.abs(boxPairMeanX(6, 1, 2, 0) - 3), // 1.0808 = 16L/9π²
  l20MeanXmin: boxPairMeanX(6, 1, 2, 0), // 1.919
  l20MeanXmax: boxPairMeanX(6, 1, 2, slosh / 2), // 4.081
  /* l20-oscillator */
  l20Curvature: 2 * Math.cos(0), // 2: V″(0) of 2(1 − cos x)
  l20OmegaPend: Math.sqrt(2 * Math.cos(0)), // 1.4142
  l20HEstimateWidth: gaussianOscillatorBestWidth(1), // 0.7071
  l20HEstimate: gaussianOscillatorEnergy(gaussianOscillatorBestWidth(1), 1), // 0.5
  /* practice questions */
  l20TrialP2: boxFunctionOverlap(trial, 1, 2) ** 2, // 0.9830
  l20TrialP4: boxFunctionOverlap(trial, 1, 4) ** 2, // 0.0154
  l20TrialMeanRatio: boxFunctionEnergy(trial, dTrial, 1) / boxEnergy(1, 1), // 4.26
  l20SkewTentRatio: boxFunctionEnergy(skew, dSkew, 1, 1 / 3) / boxEnergy(1, 1), // 1.3678 = 27/2π²
  l20DeltaBindingClosed: deltaWellBinding(3), // 1.125
  l20DeltaBindingFine: thinWellBinding(3, 0.004), // 1.1205
} as const

export type ValueKey = keyof typeof V

/** A claim tied to one L20 engine value: its text starts with `key · ` (read by content/claims.test.ts). */
export const claim = keyedClaim<ValueKey>()

export { close, d, pct, tf, uf } from './claimKit'
