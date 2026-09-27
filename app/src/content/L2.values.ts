/**
 * Lecture 2 numbers, computed once with the engine (owner: P). Same contract as L1.values.ts:
 * every number a learner reads in L2 comes from `V` and is backed by a keyed claim; the numpy twin of each key
 * is in physics/__fixtures__/claims.json (pipeline/make_claim_fixtures.py, "L2" block). Keys start with `l2`
 * so they never clash with another lecture's (content/values.ts refuses duplicates).
 *
 * Complex results are stored as their real or imaginary part (the part the prose states); yes/no facts
 * are 1 or 0. Angles are in degrees.
 */
import { I, abs, abs2, add, arg, c, conj, cpow, csqrt, expi, mul, polar } from '../physics/complex'
import { bilinear, inner, norm, norm2, normalize, vadd, vec, vscale, type Vec } from '../physics/linalg'
import { benchTheory } from '../physics/sg'
import {
  KET, SY, blochAngles, blochVector, expectation, ketFromBloch, ketFromCoeff, mutuallyUnbiased, prob, probUpAlong,
  samePhysicalState, tiltXZ, toBasis, type NamedKet, type Vec3,
} from '../physics/spin'
import { keyedClaim } from './claimKit'

const DEG = Math.PI / 180
const yes = (b: boolean) => (b ? 1 : 0)

const zB: Vec[] = [KET['+z'], KET['-z']]
const xB: Vec[] = [KET['+x'], KET['-x']]
const yB: Vec[] = [KET['+y'], KET['-y']]
/** ψ at 30° in the plane = Bloch angle 60°: (cos 30°, sin 30°). */
const psi30 = ketFromBloch(60 * DEG, 0)
/** Townsend Ex. 1.1 / 1.3: ½|+z⟩ + (√3/2) i |−z⟩. */
export const psiT = vec(0.5, c(0, Math.sqrt(3) / 2))
/** The stretch challenge's state: (3/5)|+z⟩ + (4/5) i |−z⟩. */
export const psi35 = vec(0.6, c(0, 0.8))

const delta30 = toBasis(psi30, xB)
const psiTx = toBasis(psiT, xB)
const unitCs = [c(1), c(-1), I, c(0, -1), expi(Math.PI / 4)]
const xCoeffs = toBasis(ketFromCoeff(expi(Math.PI / 4)), xB)
const sweep = (n: number, f: (t: number) => number) => Array.from({ length: n + 1 }, (_, k) => f(k / n))
const NAMED: NamedKet[] = ['+z', '-z', '+x', '-x', '+y', '-y']
const cycleNames: NamedKet[] = ['+x', '+y', '-x', '-y']
const crossProbs = NAMED.flatMap((a) => NAMED.filter((b) => a[1] !== b[1]).map((b) => prob(KET[a], KET[b])))
const AXIS_OF: Record<NamedKet, Vec3> = { '+z': [0, 0, 1], '-z': [0, 0, -1], '+x': [1, 0, 0], '-x': [-1, 0, 0], '+y': [0, 1, 0], '-y': [0, -1, 0] }
const twoParams = blochAngles(ketFromBloch(120 * DEG, 60 * DEG))
const phase360 = (rad: number) => (((rad / DEG) % 360) + 360) % 360
/** The sample farthest from `target`: equal to the target only if EVERY sample is (a minimum would only prove "at least"). */
const worst = (xs: number[], target: number) => xs.reduce((w, x) => (Math.abs(x - target) > Math.abs(w - target) ? x : w), target)

export const V = {
  /* l2-vector-space */
  l2ZzOrth: abs(inner(KET['+z'], KET['-z'])), // 0
  l2SumIsX: yes(samePhysicalState(normalize(vadd(KET['+z'], KET['-z'])), KET['+x'])), // 1
  l2SumLen: norm(vadd(KET['+z'], KET['-z'])), // 1.4142 = √2 before rescaling
  l2Inverse: norm(vadd(KET['+x'], vscale(KET['+x'], -1))), // 0: a ket plus its opposite is the zero ket
  l2IxUnit: norm(vscale(KET['+x'], I)), // 1
  l2BraConjIm: inner(vscale(KET['+z'], I), KET['+z']).im, // −1: the bra of i|+z⟩ is −i⟨+z|
  l2ShadowsSum: worst(sweep(36, (t) => prob(KET['+z'], ketFromBloch(t * Math.PI, 0)) + prob(KET['-z'], ketFromBloch(t * Math.PI, 0))), 1), // 1 at every sampled angle
  l2TwoZ: yes(samePhysicalState(KET['+z'], vscale(KET['+z'], 2))), // 1
  l2MinusZ: yes(samePhysicalState(KET['+z'], vscale(KET['+z'], -1))), // 1
  /* l2-inner-product */
  l2Overlap30: inner(KET['+z'], psi30).re, // 0.8660
  l2PsiTAlpha: abs(inner(KET['+z'], psiT)), // 0.5: the ½ in Townsend's state
  l2SwapA: inner(KET['-z'], psiT).im, // +0.8660: ⟨−z|ψ⟩ = 0.866 i
  l2SwapB: inner(psiT, KET['-z']).im, // −0.8660: ⟨ψ|−z⟩ = −0.866 i
  l2RowCol: inner(KET['+z'], KET['+x']).re, // 0.7071
  l2UnitX: inner(KET['+x'], KET['+x']).re, // 1
  l2OrthX: abs(inner(KET['+x'], KET['-x'])), // 0
  l2ZinX: toBasis(KET['+z'], xB)[1].re, // 0.7071 (both x coordinates of |+z⟩)
  l2MzInX: toBasis(KET['-z'], xB)[1].re, // −0.7071
  l2Delta30: delta30[0].re, // 0.9659
  l2Eps30: delta30[1].re, // 0.2588
  l2DeltaSq: abs2(delta30[0]), // 0.9330
  l2EpsSq: abs2(delta30[1]), // 0.0670
  l2AxlerIm: mul(I, inner(KET['+z'], KET['+z'])).im, // +1: Axler's first-slot rule gives +i
  l2PsiTx: abs2(psiTx[0]), // 0.5 (and 0.5 for the other coordinate)
  /* l2-complex */
  l2ISquared: mul(I, I).re, // −1
  l2TimesITurn: arg(mul(I, c(1))) / DEG, // 90 (degrees)
  l2Abs1i: abs(c(1, 1)), // 1.4142 = √2
  l2Arg1i: arg(c(1, 1)) / DEG, // 45 (degrees)
  l2Abs34: abs(c(3, 4)), // 5
  l2EulerPi: expi(Math.PI).re, // −1
  l2EulerHalfPi: expi(Math.PI / 2).im, // 1: e^{iπ/2} = i
  l2Conj34: conj(c(3, 4)).im, // −4
  l2ZstarZ: mul(conj(c(3, 4)), c(3, 4)).re, // 25
  l2PolarProduct: mul(polar(2, 30 * DEG), polar(3, 60 * DEG)).im, // 6: 2e^{i30°}·3e^{i60°} = 6i
  l2ICubed: cpow(I, 3).im, // −1: i³ = −i
  l2IFourth: cpow(I, 4).re, // 1
  l2ModSq1i: mul(conj(c(1, 1)), c(1, 1)).re, // 2: z*z for z = 1 + i
  l2Sq1i: mul(c(1, 1), c(1, 1)).im, // 2: z² = 2i
  /* l2-plus-y */
  l2YOnZ: benchTheory({ source: '+y', axes: ['z'], keep: [] }).plus, // 0.5
  l2CUnit5050: worst(unitCs.map((k) => prob(KET['+z'], ketFromCoeff(k))), 0.5), // 0.5 for every sampled |c| = 1
  l2RealCIsX: yes(samePhysicalState(ketFromCoeff(c(1)), KET['+x']) && samePhysicalState(ketFromCoeff(c(-1)), KET['-x'])), // 1
  l2XCoeffRe: xCoeffs[0].re, // 0.8536: (1 + e^{iπ/4})/2
  l2RealFailPlus: benchTheory({ source: '+x', axes: ['x'], keep: [] }).plus, // 1
  l2RealFailMinus: benchTheory({ source: '-x', axes: ['x'], keep: [] }).plus, // 0
  l2XSplit0: prob(KET['+x'], ketFromBloch(Math.PI / 2, 0)), // 1
  l2XSplit90: prob(KET['+x'], ketFromBloch(Math.PI / 2, Math.PI / 2)), // 0.5
  l2IConjSum: add(I, conj(I)).re, // 0
  l2IConjProd: mul(I, conj(I)).re, // 1
  l2YOnX: benchTheory({ source: '+y', axes: ['x'], keep: [] }).plus, // 0.5
  l2YOrth: abs(inner(KET['+y'], KET['-y'])), // 0
  l2YBloch: blochVector(KET['+y'])[1], // 1: |+y⟩ sits at (0, 1, 0)
  l2T128: 0.5 * (1 + Math.cos(0 - 90 * DEG)), // 0.5: Townsend eq. 1.28 at δ − γ = −90°
  l2YNorm: norm2(KET['+y']), // 1
  l2YBilinear: abs(bilinear(KET['+y'], KET['+y'])), // 0: the unconjugated row gives length 0
  /* l2-three-bases */
  l2Cycle: yes(cycleNames.every((n, k) => samePhysicalState(ketFromCoeff(cpow(I, k)), KET[n]) && samePhysicalState(ketFromBloch(Math.PI / 2, (k * Math.PI) / 2), KET[n]))), // 1
  l2PairsOrth: Math.max(...[zB, xB, yB].map(([p, m]) => abs(inner(p, m)))), // 0
  l2Mub: Math.max(...crossProbs), // 0.5 (the min is 0.5 too: all 24 ordered pairs)
  l2MubAll: yes(mutuallyUnbiased(zB, xB) && mutuallyUnbiased(xB, yB) && mutuallyUnbiased(zB, yB)), // 1
  l2XOnY: prob(KET['+y'], KET['+x']), // 0.5
  l2GeneralUnit: norm(ketFromBloch(60 * DEG, 45 * DEG)), // 1
  l2SixPoints: yes(NAMED.every((n) => blochVector(KET[n]).every((v, i) => Math.abs(v - AXIS_OF[n][i]) < 1e-12))), // 1
  l2TwoParamsTheta: twoParams.theta / DEG, // 120
  l2TwoParamsPhi: twoParams.phi / DEG, // 60
  l2Perp5050: worst(sweep(24, (t) => probUpAlong([0, 0, 1], [Math.cos(2 * Math.PI * t), Math.sin(2 * Math.PI * t), 0])), 0.5), // 0.5 at every sampled azimuth
  /* challenges */
  l2VsSumProb: prob(KET['+z'], normalize(vadd(KET['+z'], KET['+x']))), // 0.8536
  l2VsBraScaleIm: inner(vscale(KET['+z'], c(2, 1)), KET['+z']).im, // −1: the bra of (2 + i)|+z⟩ is (2 − i)⟨+z|
  l2IpOverlap: inner(KET['+x'], KET['+z']).re, // 0.7071
  l2IpRightLeft: toBasis(KET['-x'], zB)[1].re, // −0.7071
  l2IpTownsend: prob(KET['-z'], psiT), // 0.75
  l2IpTownsendPlus: prob(KET['+z'], psiT), // 0.25
  l2IpDeltaL1: probUpAlong([1, 0, 0], tiltXZ(60 * DEG)), // 0.9330: Lecture 1's cos²15°
  l2CModulus: abs(c(3, -4)), // 5
  l2CTurn: phase360(arg(mul(I, c(1, 1)))), // 135 (degrees)
  l2CSqrt: csqrt(c(-2)).im, // 1.4142: √(−2) = √2 i
  l2YZsplit: prob(KET['+z'], KET['+y']), // 0.5
  l2YTownsend: prob(KET['+y'], psiT), // 0.9330
  l2SyTownsend: expectation(SY, psiT), // 0.4330 (ħ)
  l2Y35: prob(KET['+y'], psi35), // 0.98
  l2X35: prob(KET['+x'], psi35), // 0.5
  l2MubWhich45: probUpAlong(tiltXZ(45 * DEG), [0, 0, 1]), // 0.8536
  l2MubPhase: phase360(blochAngles(KET['-y']).phi), // 270 (degrees)
  l2MubCount: 4 - 1 - 1, // 2 real parameters (a count; blochAngles returns exactly (θ, φ))
  /* arcade (arcade/games.ts): three eighths of a +y beam */
  l2ThreeEighths: benchTheory({ source: '+y', axes: [30, 'x'], keep: ['+'] }).plus, // 0.375
} as const

export type ValueKey = keyof typeof V

/** A claim tied to one L2 engine value: its text starts with `key · ` (read by content/claims.test.ts). */
export const claim = keyedClaim<ValueKey>()

export { close, d, pct, tf, uf } from './claimKit'
