/**
 * Chapter F1 numbers ("Numbers that turn"), computed once with the engine (plan: docs/roles/proposals/P-F1-story.md,
 * with the judge's rulings qc709-pilots.md and qc709-nc.md). Every number a learner reads in F1 comes from `V` and is
 * backed by a keyed claim; the numpy twin of each key, computed by another route, is in
 * physics/__fixtures__/claims-qc709/f1.json (pipeline/claims_qc709/f1.py). Keys start with `f1`, unique across both
 * courses (content/values.ts refuses a duplicate).
 *
 * Complex results are stored as the part the prose states. A number the prose prints with a minus sign in front is
 * also stored as its size (`…Neg`), because the ledger reads the digits. Yes/no facts are 1 or 0; angles in degrees
 * end in `Deg`.
 */
import { I, ONE, abs, abs2, add, arg, c, conj, cpow, csqrt, div, expi, mul, neg, sub } from '../../physics/complex'
import { cexpSeries, eulerLimit, phasorSum } from '../../physics/qc/complexExtra'
import { Rz, S, T, Z } from '../../physics/qc/gates'
import { inner, matEq, matmul, mscale, vscale } from '../../physics/linalg'
import { KET, ketFromBloch, samePhysicalState } from '../../physics/spin'
import { keyedClaim } from '../claimKit'

export { close, d, pct } from '../claimKit'

const DEG = Math.PI / 180
const yes = (b: boolean) => (b ? 1 : 0)
/** The sample farthest from `target`: equal to the target only if EVERY sample is (as L2.values.ts). */
const worst = (xs: number[], target: number) => xs.reduce((w, x) => (Math.abs(x - target) > Math.abs(w - target) ? x : w), target)
const GAMMAS = [0, 1, 2.5, 4, 5.5]
/** The stage's relative-phase state of f1-phase:b4 at φ (degrees): (1, e^{iφ})/√2 = ketFromBloch(90°, φ). */
const eq = (phiDeg: number) => ketFromBloch(Math.PI / 2, phiDeg * DEG)
const relSum = (phiDeg: number) => abs2(add(eq(phiDeg)[0], eq(phiDeg)[1]))

export const V = {
  /* f1-number-line */
  f1NegRoot: add(c(-2), c(5)).re, // 3: −2 + 5 = 3
  f1Half3: div(c(3), c(2)).re, // 1.5: 2x = 3 needs x = 3/2
  f1Sqrt2: csqrt(c(2)).re, // 1.4142
  f1SqNeg3: mul(c(-3), c(-3)).re, // 9
  f1HalfTurn: mul(c(-1), c(2)).re, // −2
  f1TwoHalf: mul(c(-1), c(-1)).re, // 1
  f1ITimesOne: mul(I, ONE).im, // 1: i · 1 = i
  f1ISquared: mul(I, I).re, // −1
  f1NegISquared: mul(neg(I), neg(I)).re, // −1
  f1SqrtM9: csqrt(c(-9)).im, // 3: √−9 = 3i
  f1Roots4: mul(c(0, 2), c(0, 2)).re, // −4: (2i)² = −4
  f1Sq4iNeg: -mul(c(0, 4), c(0, 4)).re, // 16: (4i)² = −16
  f1YAmp: KET['+y'][1].im, // 0.7071: the second amplitude of |+y⟩ is 0.707i
  f1SqrtIRe: csqrt(I).re, // 0.7071
  f1SqrtIIm: csqrt(I).im, // 0.7071
  f1SqrtISq: mul(csqrt(I), csqrt(I)).im, // 1: (√i)² = i
  f1TSqS: yes(matEq(matmul(T, T), S)), // 1: T² = S
  f1SSqZ: yes(matEq(matmul(S, S), Z)), // 1: S² = Z
  f1IPow2026: cpow(I, 2026).re, // −1
  /* f1-plane */
  f1Re34: c(3, 4).re, // 3
  f1Im34: c(3, 4).im, // 4
  f1SumRe: add(c(3, 4), c(1, -2)).re, // 4
  f1SumIm: add(c(3, 4), c(1, -2)).im, // 2
  f1Abs34: abs(c(3, 4)), // 5
  f1Conj34Im: conj(c(3, 4)).im, // −4
  f1AbsConj34: abs(conj(c(3, 4))), // 5
  f1ZZstar: mul(c(3, 4), conj(c(3, 4))).re, // 25
  f1ZZstarIm: mul(c(3, 4), conj(c(3, 4))).im, // 0
  f1AbsSum: abs(add(c(3, 4), c(1, -2))), // 4.4721
  f1Abs1m2: abs(c(1, -2)), // 2.2361
  f1TwoSides: abs(c(3, 4)) + abs(c(1, -2)), // 7.2361
  f1ConjRealIm: conj(c(2)).im, // 0: the mirror of 2 is 2
  f1ConjImag: conj(c(0, 3)).im, // −3: the mirror of 3i is −3i
  f1TrapZZ: mul(conj(c(1, 1)), c(1, 1)).re, // 2: zz* for z = 1 + i
  f1TrapZ2: mul(c(1, 1), c(1, 1)).im, // 2: z² = 2i
  f1Abs512: abs(c(-5, 12)), // 13
  f1Prod23: mul(c(2, -3), c(2, 3)).re, // 13
  f1TriEq: abs(add(c(2, 2), c(1, 1))) - (abs(c(2, 2)) + abs(c(1, 1))), // 0: lined-up arrows, the lengths add
  f1Abs11: abs(c(1, 1)), // 1.4142
  f1Abs22: abs(c(2, 2)), // 2.8284
  f1Abs33: abs(c(3, 3)), // 4.2426
  /* f1-multiply */
  f1ProdRe: mul(c(2, 1), c(1, 3)).re, // −1
  f1ProdIm: mul(c(2, 1), c(1, 3)).im, // 7
  f1I34Re: mul(I, c(3, 4)).re, // −4
  f1I34Im: mul(I, c(3, 4)).im, // 3
  f1AbsI34: abs(mul(I, c(3, 4))), // 5
  f1Abs21: abs(c(2, 1)), // 2.2361
  f1Abs13: abs(c(1, 3)), // 3.1623
  f1AbsProd: abs(mul(c(2, 1), c(1, 3))), // 7.0711
  f1AbsTimes: abs(c(2, 1)) * abs(c(1, 3)), // 7.0711
  f1SizesAdded: abs(c(2, 1)) + abs(c(1, 3)), // 5.3983: the trap
  f1Arg21Deg: arg(c(2, 1)) / DEG, // 26.565
  f1Arg13Deg: arg(c(1, 3)) / DEG, // 71.565
  f1ArgProdDeg: arg(mul(c(2, 1), c(1, 3))) / DEG, // 98.130
  f1Dir34Re: div(c(3, 4), c(5)).re, // 0.6
  f1Dir34Im: div(c(3, 4), c(5)).im, // 0.8
  f1Dir34Abs: abs(div(c(3, 4), c(5))), // 1
  f1Inv34Re: div(ONE, c(3, 4)).re, // 0.12
  f1Inv34ImNeg: -div(ONE, c(3, 4)).im, // 0.16: 1/(3 + 4i) = 0.12 − 0.16i
  f1InvAbs: abs(div(ONE, c(3, 4))), // 0.2 = 1/5
  f1DeMoivre: cpow(expi(Math.PI / 6), 3).im, // 1: three turns of 30° land on i
  f1OnePlusI8: cpow(c(1, 1), 8).re, // 16
  f1OnePlusI4: cpow(c(1, 1), 4).re, // −4
  f1Angle105Deg: arg(mul(c(1, 1), c(1, Math.sqrt(3)))) / DEG, // 105
  f1Abs105: abs(mul(c(1, 1), c(1, Math.sqrt(3)))), // 2.8284
  /* f1-euler */
  f1Pi: arg(c(-1)), // 3.14159
  f1HalfPi: arg(I), // 1.5708
  f1TwoPi: 2 * arg(c(-1)), // 6.2832
  f1UnitSize: abs(expi(1)), // 1
  f1Rate1: div(ONE, c(1)).re, // 1 = 100 %: one step of 1/n at n = 1
  f1Rate2: div(ONE, c(2)).re, // 0.5 = 50 %: each of two steps of 1/n at n = 2
  f1Step2: add(ONE, div(ONE, c(2))).re, // 1.5: one of two half steps
  f1Grow2: cpow(c(1.5), 2).re, // 2.25
  f1E1000: cpow(c(1.001), 1000).re, // 2.7169
  // 2.71828: the limit e itself, from the engine's series at x = 1 (G1; 20 terms, error below 10⁻¹⁸). A power (1 + 1/n)ⁿ
  // at n ≈ 10⁶ would carry the rounding of 20 repeated squarings (≈ 10⁻¹⁰), too coarse for the 10⁻¹² ledger.
  f1E: cexpSeries(ONE, 20).re,
  // 7.389: e² from the engine's series at x = 2 (30 terms, error below 10⁻²⁰), the limit of (1 + 2/n)ⁿ
  f1E2: cexpSeries(c(2), 30).re,
  f1Euler1Abs: abs(eulerLimit(Math.PI, 1)), // 3.2969
  f1Euler2ReNeg: -eulerLimit(Math.PI, 2).re, // 1.4674: (1 + iπ/2)² = −1.467 + 3.142i
  f1Euler2Im: eulerLimit(Math.PI, 2).im, // 3.1416
  f1Euler2Abs: abs(eulerLimit(Math.PI, 2)), // 3.4674
  f1Euler10Abs: abs(eulerLimit(Math.PI, 10)), // 1.6010
  f1Euler64Abs: abs(eulerLimit(Math.PI, 64)), // 1.0801
  f1Euler100Abs: abs(eulerLimit(Math.PI, 100)), // 1.0506
  f1Euler1000Abs: abs(eulerLimit(Math.PI, 1000)), // 1.0049
  f1ExpiPiRe: expi(Math.PI).re, // −1
  f1ExpiHalfPiIm: expi(Math.PI / 2).im, // 1
  f1VelDot: mul(conj(expi(0.7)), mul(I, expi(0.7))).re, // 0: the velocity i·e^{iφ} is at right angles to e^{iφ}
  f1VelSize: abs(mul(I, expi(0.7))), // 1: unit speed
  f1Rad60: arg(c(1, Math.sqrt(3))), // 1.0472 = π/3
  f1EulerPlusOne: add(expi(Math.PI), ONE).re, // 0: e^{iπ} + 1 = 0
  f1Cos75: mul(expi(Math.PI / 4), expi(Math.PI / 6)).re, // 0.2588
  f1Deg180ReNeg: -expi(180).re, // 0.5985: e^{180i} = −0.598 − 0.801i (180 read as radians)
  f1Deg180ImNeg: -expi(180).im, // 0.8012
  /* f1-phase */
  f1Phasor60Re: phasorSum([0, Math.PI / 3]).re, // 1.5
  f1Phasor60Im: phasorSum([0, Math.PI / 3]).im, // 0.8660
  f1Phasor60Abs: abs(phasorSum([0, Math.PI / 3])), // 1.7321
  f1Interf0: abs2(phasorSum([0, 0])), // 4
  f1Interf60: abs2(phasorSum([0, Math.PI / 3])), // 3
  f1Interf90: abs2(phasorSum([0, Math.PI / 2])), // 2
  f1Interf120: abs2(phasorSum([0, (2 * Math.PI) / 3])), // 1
  f1Interf180: abs2(phasorSum([0, Math.PI])), // 0
  f1GlobalAbs: worst(GAMMAS.map((g) => abs(phasorSum([g, g + Math.PI / 3], [0.5, 0.5]))), Math.sqrt(3) / 2), // 0.8660 for every γ
  f1Global: worst(GAMMAS.map((g) => abs2(phasorSum([g, g + Math.PI / 3], [0.5, 0.5]))), 0.75), // 0.75 for every γ
  f1RelProb: worst([0, 60, 90, 180].map((p) => abs2(eq(p)[1])), 0.5), // 0.5 for every φ
  f1RelSum0: relSum(0), // 2
  f1RelSum60: relSum(60), // 1.5
  f1RelSum90: relSum(90), // 1
  f1RelSum180: relSum(180), // 0
  f1Mz60: abs2(phasorSum([0, Math.PI / 3], [0.5, 0.5])), // 0.75
  f1MzEqual: abs2(phasorSum([0, 0], [0.5, 0.5])), // 1
  f1MzPi: abs2(phasorSum([0, Math.PI], [0.5, 0.5])), // 0
  f1Mz90: abs2(phasorSum([0, Math.PI / 2], [0.5, 0.5])), // 0.5
  f1XOrth: abs(inner(KET['+x'], KET['-x'])), // 0
  f1XinX: abs(inner(KET['+x'], KET['+x'])), // 1
  f1GlobalMinus: yes(samePhysicalState(KET['+x'], vscale(KET['+x'], -1))), // 1
  f1GlobalI: yes(samePhysicalState(KET['+x'], vscale(KET['+x'], I))), // 1
  f1Three: abs(phasorSum([0, (2 * Math.PI) / 3, (4 * Math.PI) / 3])), // 0
  f1Cancel: abs(phasorSum([0, Math.PI])), // 0
  f1SizeOneDeg: arg(expi((2 * Math.PI) / 3)) / DEG, // 120
  f1SizeOne: abs(phasorSum([0, (2 * Math.PI) / 3])), // 1
  f1Pi8: (arg(expi(Math.PI / 4)) * 90) / Math.PI, // 22.5: half of 45°
  f1TGlobal: yes(matEq(T, mscale(Rz(Math.PI / 4), expi(Math.PI / 8)))), // 1: T = e^{iπ/8} R_z(π/4)
} as const

export type F1Key = keyof typeof V
export const claim = keyedClaim<F1Key>()

/** e^{iπ} = −1, and the limit (1 + iπ/n)ⁿ is within 10⁻⁴ of it at n = 10⁵ (the plan's f1LimitMatches, test only). */
export const limitMatches = (): boolean => abs(sub(eulerLimit(Math.PI, 100_000), expi(Math.PI))) < 1e-4

/** (1 + x/n)ⁿ settles near eˣ: at x = 2 and n = 10⁶ it is within 10⁻⁴ of e² (the eˣ sentence of f1-euler:b3, test only). */
export const realLimitMatches = (): boolean => abs(sub(cpow(c(1 + 2 / 1_000_000), 1_000_000), c(V.f1E2))) < 1e-4
