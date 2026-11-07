/**
 * Lecture 14 numbers, computed once with the engine (owner: P). Same contract as L1–L13.values.ts: every number a learner reads in L14 comes from `V` and is backed by a keyed claim;
 * the numpy twin of each `l14…` key is in physics/__fixtures__/claims-448/l14.json (pipeline/claims_448/l14.py), and the twins of the keys moved here from Lecture 13 (`l13T…`, `l13Pr…`:
 * the box) stay in claims-448/g4b.json (pipeline/claims_448/g4b.py). Keys of moved items keep their `l13` names (ruling M2 of docs/roles/decisions/448-L14L18.md: stored progress and
 * the fixtures stay valid); new ones start with `l14`.
 *
 * Conventions as Lectures 12 and 13: ħ = m = 1 inside the engine (physics/wave.ts, physics/wave14.ts); lengths are in ℓ, momenta in ħ/ℓ, times in mℓ²/ħ (the UI appends the units). The unit
 * packet is the Gaussian of width σ = 1 ℓ at x₀ = 0 unless a key says otherwise. A displayed magnitude of a negative number gets its own key (the number reader sees digits, not signs); a
 * residual that should be zero is stored as itself and claimed to be below a tolerance; a finite-difference check is stored as 1 (it passed) or 0.
 *
 * This file imports physics modules but no stage module: a lecture chunk must not pull in stage/svg.
 */
import { M_ELECTRON, boxEnergyEv } from '../physics/constants'
import { clockHands } from '../physics/dynamics'
import { KET } from '../physics/spin'
import {
  GRID, boxEnergy, boxMomentumSpread, boxNodes, boxOverlap, boxState, cellChances, freeEvolve, meanP, meanX, meanX2, packet, peakDensity, spreadP, translate,
} from '../physics/wave'
import {
  boxMeanEnergy, boxPairParts, boxPairPeriod, boxResidual, densityDrift, kineticEnergy, omegaFree, omegaLinear, planeCurvature, tentKinetic, topHatKineticCut, twoWaveResidual,
} from '../physics/wave14'
import { keyedClaim } from './claimKit'

const RAD = 180 / Math.PI
const PK = (x0: number, sigma: number, p0 = 0) => packet(GRID, { x0, sigma, p0 })
const idx = (x: number) => Math.round((x - GRID.x[0]) / GRID.dx) // the grid index of the position x

/* l14-components: sixteen equal cells on [−8, 8], then 512 */
const U1 = PK(0, 1)
const cells16 = cellChances(U1, GRID, [-8, 8], 16)
const cells512 = cellChances(U1, GRID, [-8, 8], 512)

/* l14-schrodinger: the p₀ = 3 packet, and V = x²/2 for a packet at 2 */
const K3 = PK(0, 1, 3)

/* l14-time: shift 3 and wait 2, in both orders (p₀ = 1.5) */
const P15 = PK(0, 1, 1.5)

/* l14-stationary: the box of width 4, level 1 and the pair of levels 1 and 2; the practice box of width 3 and the one of width 2 */
const B4 = boxState(GRID, 4, 1)
const clockGap = clockHands({ upper: 3, lower: 1 }, KET['+x'], Math.PI / 4).gap ?? Number.NaN // εt/ħ = 45°: the hands sit 2·45° apart
const pairHalf = boxPairPeriod(4, 1, 2) / 2
const phaseAt = (w: { re: Float64Array; im: Float64Array }, j: number) => Math.atan2(w.im[j], w.re[j])

/* the box moved from Lecture 13 (Townsend §6.9; its twins are in claims-448/g4b.json) */
const BOX_OLD = { lo: -0.5, hi: 0.5, n: 1 } // Ex. 6.6: the ground state of a box that is then widened on both sides to twice its width, about the same centre
const boxNew = (n: number) => ({ lo: -1, hi: 1, n })

export const V = {
  /* l14-components */
  l14Cell16: cells16[8], // 0.3413: the cell [0, 1) of sixteen
  l14CellsSum: cells16.reduce((a, b) => a + b, 0), // 1
  l14Cell512Dens: cells512[256] * 32, // 0.3989 ℓ⁻¹: the cell [0, 1/32) ÷ its width
  l14Cell512: cells512[256], // 0.01247: the chance in the cell [0, 1/32)
  l14AmpUnit: Math.sqrt(peakDensity(U1)), // 0.6316 ℓ^{−1/2}: the peak of |ψ| for σ = 1
  /* l14-schrodinger */
  l14TkinP0: kineticEnergy(K3, GRID), // 4.625 = 4.5 + 0.125
  l14TkinMean: 0.5 * meanP(K3, GRID) ** 2, // 4.5: p₀²/2m
  l14TkinSpread: 0.5 * spreadP(K3, GRID) ** 2, // 0.125: (Δp)²/2m
  l14DpP0: spreadP(K3, GRID), // 0.5: Δp = ħ/2σ of the p₀ = 3, σ = 1 packet
  l14VMean: 0.5 * meanX2(PK(2, 1), GRID), // 2.5: ⟨x²/2⟩ for a packet at 2
  /* l14-dispersion */
  l14Omega3: omegaFree(3), // 4.5
  l14OmegaDouble: omegaFree(3) / omegaFree(1.5), // 4: doubling k multiplies ω by 4
  l14OmegaLightDouble: omegaLinear(3) / omegaLinear(1.5), // 2: and light's ω only by 2
  l14Curv3Mag: Math.abs(planeCurvature(3)), // 9: ∂ₓ² e^{3ix} = −9 e^{3ix}
  l14GaussT1: kineticEnergy(U1, GRID), // 0.125
  l14GaussTHalf: kineticEnergy(PK(0, 0.5), GRID), // 0.5
  l14GaussTRatio: kineticEnergy(PK(0, 0.5), GRID) / kineticEnergy(U1, GRID), // 4
  l14TwoWaveOk: twoWaveResidual(2, 4, 0.7, 1.3) < 1e-6 ? 1 : 0, // 1: iψ_t = −½ψ_xx for p = 2 and 4 to 1e-6 (a check, not shown)
  l14TopHatT4: topHatKineticCut(2, 4 * Math.PI), // 2: the top hat of width 2 cut at P = 2πn/L with n = 4 (value 2n/L²)
  l14TopHatT8: topHatKineticCut(2, 8 * Math.PI), // 4: n = 8
  l14PrTentT: tentKinetic(2), // 0.375
  /* l14-time */
  l14MeanP15: meanP(P15, GRID), // 1.5: the mean momentum of the packet that is shifted and left to run
  l14ShiftThenWait: meanX(freeEvolve(translate(P15, GRID, 3), GRID, 2), GRID), // 6
  l14WaitThenShift: meanX(translate(freeEvolve(P15, GRID, 2), GRID, 3), GRID), // 6
  l14ClockGap90: clockGap * RAD, // 90
  /* l14-stationary */
  l14BoxE2: boxEnergy(4, 2), // 1.2337
  l14BoxE1: boxEnergy(4, 1), // 0.3084
  l14BoxTiseOk: boxResidual(B4, GRID, boxEnergy(4, 1), 0, 4) < 1e-6 ? 1 : 0, // 1: −φ″/2 = Eφ on the grid
  l14StationaryDrift: densityDrift(boxState(GRID, 4, 1, 4), B4), // 0 (a rounding error): |ψ|² at t = 4 against t = 0
  l14SloshMean: boxPairParts(4, 1, 2, 0, 1).direct1 + boxPairParts(4, 1, 2, 0, 1).direct2, // 0.375: the two direct terms at x = 1
  l14CrossAmp: boxPairParts(4, 1, 2, 0, 1).cross, // 0.3536: the size of the cross term
  l14SloshD0: boxPairParts(4, 1, 2, 0, 1).total, // 0.7286
  l14SloshDHalf: boxPairParts(4, 1, 2, pairHalf, 1).total, // 0.0214
  l14SloshPeriod: boxPairPeriod(4, 1, 2), // 6.79
  l14PhaseTurnDegMag: Math.abs(phaseAt(boxState(GRID, 4, 1, 4), idx(2)) - phaseAt(B4, idx(2))) * RAD, // 70.69: E₁t = 1.234 rad at t = 4
  l14PrPeriod: boxPairPeriod(3, 1, 2), // 3.820 = 12/π
  l14PrMeanE: boxMeanEnergy(2, [{ n: 1, weight: 0.36 }, { n: 3, weight: 0.64 }]), // 7.550
  l14PrChanceE1: 0.36 / (0.36 + 0.64), // 0.36: |c₁|² of 0.6φ₁ + 0.8iφ₃
  /* l14-box (moved from l13-stationary, ruling M2) */
  l14TBoxE1Ev: boxEnergyEv(0.4e-9, M_ELECTRON), // 2.350 eV: an electron in a well 0.4 nm wide
  l14TBoxNodes4: boxNodes(boxState(GRID, 4, 4), GRID, 0, 4), // 3
  l14TBoxOverlap: Math.abs(boxOverlap(BOX_OLD, boxNew(1))), // 0.8488 = 8/3π
  l14TBoxP1: boxOverlap(BOX_OLD, boxNew(1)) ** 2, // 0.7205
  l14TBoxP2: boxOverlap(BOX_OLD, boxNew(2)) ** 2, // 0
  l14TBoxP3: boxOverlap(BOX_OLD, boxNew(3)) ** 2, // 0.2594 = 64/25π²
  l14TBoxSumOdd: Array.from({ length: 399 }, (_, i) => boxOverlap(BOX_OLD, boxNew(i + 1)) ** 2).reduce((a, b) => a + b, 0), // 1 (to 2e-8)
  l14TWall2P1: boxOverlap({ lo: 0, hi: 1, n: 1 }, { lo: 0, hi: 2, n: 1 }) ** 2, // 0.3603: one wall moves out to twice the width
  l14TBoxEnergyRatio: boxEnergy(2, 1) / boxEnergy(4, 1), // 4: half the width
  l14TBoxDpRatio: boxMomentumSpread(2, 1) / boxMomentumSpread(4, 1), // 2
  l14PrE1Ev: boxEnergyEv(0.55e-9, M_ELECTRON), // 1.243 eV
  l14PrWall3: boxOverlap({ lo: 0, hi: 1, n: 1 }, { lo: 0, hi: 3, n: 1 }) ** 2, // 0.1282
} as const

export type ValueKey = keyof typeof V

/** A claim tied to one L14 engine value: its text starts with `key · ` (read by content/claims.test.ts). */
export const claim = keyedClaim<ValueKey>()

export { close, d, pct, tf, uf } from './claimKit'
