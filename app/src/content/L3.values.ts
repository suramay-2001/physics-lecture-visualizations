/**
 * Lecture 3 numbers, computed once with the engine (owner: P). Same contract as L1/L2.values.ts: every number a
 * learner reads in L3 comes from `V` and is backed by a keyed claim; the numpy twin of each key is in
 * physics/__fixtures__/claims.json (pipeline/make_claim_fixtures.py, "L3" block). Keys start with `l3`.
 *
 * Complex results are stored as their real or imaginary part (the part the prose states); yes/no facts are 1 or
 * 0; a displayed magnitude of a negative number gets its own key (the number reader sees digits, not signs).
 * Non-Hermitian matrices (the quarter turn R) go through `sandwich` / `eigen2`, never `expectation` /
 * `eigenHermitian2` (both throw for them).
 */
import { abs, c } from '../physics/complex'
import {
  apply, dagger, fromColumns, identity, inner, isHermitian, madd, mat, matEq, matmul, mscale, norm, normalize, vadd, vec, vscale, vsub,
  type Mat, type Vec,
} from '../physics/linalg'
import { classify, decomposeHermitian, eigen2 } from '../physics/operators'
import { benchTheory, spreadAlong } from '../physics/sg'
import {
  KET, SIGMA_X, SIGMA_Z, SX, SZ, collapse, eigenHermitian2, expectation, fromSpectrum, ketFromBloch, measure, prob, projector, rotation,
  samePhysicalState, sandwich, spinAlong, tiltXZ, toBasis, variance, type NamedKet,
} from '../physics/spin'
import { keyedClaim } from './claimKit'

const DEG = Math.PI / 180
const yes = (b: boolean) => (b ? 1 : 0)
const vecEq = (a: Vec, b: Vec) => norm(vsub(a, b)) < 1e-12
/** The real ket drawn at `deg` in the hilbert-plane (0° = |+z⟩, 90° = |−z⟩). */
const planeKet = (deg: number) => ketFromBloch(2 * deg * DEG, 0)
/** The sample farthest from `target`: equal to the target only if EVERY sample is (a minimum would only prove "at least"). */
const worst = (xs: number[], target: number) => xs.reduce((w, x) => (Math.abs(x - target) > Math.abs(w - target) ? x : w), target)
const sweep = (n: number, f: (t: number) => number) => Array.from({ length: n + 1 }, (_, k) => f(k / n))
const NAMED: NamedKet[] = ['+z', '-z', '+x', '-x', '+y', '-y']

/** The running example: ½|+z⟩ + (√3/2)|−z⟩, the plane arrow at 60° (Bloch angle 120°). */
export const p60 = planeKet(60)
/** Townsend §1.4, Example 1.2: ½|+z⟩ + (i√3/2)|−z⟩ (same z odds as p60). */
export const psiT = vec(0.5, c(0, Math.sqrt(3) / 2))
/** The swap (named σ̂x only in Lecture 4). */
export const SWAP: Mat = mat([[0, 1], [1, 0]])
/** A symmetric example with eigenvalues 3 and 1 along |±x⟩. */
export const M: Mat = mat([[2, 1], [1, 2]])
/** A complex Hermitian example. */
export const H: Mat = mat([[1, c(0, -2)], [c(0, 2), -1]])
/** A real quarter turn: not Hermitian (eigenvalues ±i); it turns a spin 180° about y. */
export const R: Mat = mat([[0, -1], [1, 0]])
/** The challenges' operator: B|+z⟩ = |+z⟩ + 2|−z⟩, B|−z⟩ = 3|−z⟩ (images as columns). */
export const B: Mat = fromColumns([vec(1, 2), vec(0, 3)])

const Pu = projector(KET['+z'])
const Pd = projector(KET['-z'])
const Ppx = projector(KET['+x'])
const Pmx = projector(KET['-x'])
const xB: Vec[] = [KET['+x'], KET['-x']]
const eigH = eigenHermitian2(H)
const halfPu = decomposeHermitian(mscale(Pu, 0.5))!
const halfPd = decomposeHermitian(mscale(Pd, -0.5))!
const block = benchTheory({ source: '+x', axes: ['z', 'z'], keep: ['+'] })
const zxz = benchTheory({ source: '+x', axes: ['z', 'x', 'z'], keep: ['+', '+'] })
const tilt120 = benchTheory({ source: '+z', axes: [120], keep: [] })
const cxPlus = inner(KET['+x'], p60)
const cxMinus = inner(KET['-x'], p60)
const hermOptions: Mat[] = [
  mat([[1, c(0, 2)], [c(0, -2), 1]]),
  mat([[1, c(0, 2)], [c(0, 2), 1]]),
  mat([[c(0, 1), 0], [0, 1]]),
  R,
]
/** Spread bound: the largest sampled (ΔSn)² over axes n (x–z tilts) and states on a Bloch grid. */
const variances = [0, 30, 60, 90, 120, 150, 180].flatMap((tn) =>
  [0, 30, 60, 90, 120, 150, 180].flatMap((th) => [0, 90, 180, 270].map((ph) => variance(spinAlong(tiltXZ(tn * DEG)), ketFromBloch(th * DEG, ph * DEG)))),
)

const spreadStates: Vec[] = [...NAMED.map((n) => KET[n]), ketFromBloch(60 * DEG, 0), ketFromBloch(120 * DEG, 90 * DEG), ketFromBloch(45 * DEG, 200 * DEG)]

export const V = {
  /* l3-operators */
  l3XonZPlus: benchTheory({ source: '+x', axes: ['z'], keep: [] }).plus, // 0.5
  l3XonZMinus: benchTheory({ source: '+x', axes: ['z'], keep: [] }).minus, // 0.5
  l3SwapMirror: worst([10, 20, 45, 80].map((t) => inner(apply(SWAP, planeKet(t)), planeKet(90 - t)).re), 1), // 1: the image of the arrow at t is the arrow at 90° − t
  l3SwapIsSigmaX: yes(matEq(SWAP, SIGMA_X)), // 1
  l3SwapUpDown: yes(vecEq(apply(SWAP, KET['+z']), KET['-z']) && vecEq(apply(SWAP, KET['-z']), KET['+z'])), // 1
  l3SwapA11: inner(KET['+z'], apply(SWAP, KET['+z'])).re, // 0
  l3SwapA21: inner(KET['-z'], apply(SWAP, KET['+z'])).re, // 1
  l3TurnYIsX: yes(vecEq(apply(rotation([0, 1, 0], Math.PI / 2), KET['+z']), KET['+x'])), // 1: no extra phase
  l3TurnYUp: apply(rotation([0, 1, 0], Math.PI / 2), KET['+z'])[0].re, // 0.7071
  l3XinX1: toBasis(KET['+x'], xB)[0].re, // 1
  l3XinX2: abs(toBasis(KET['+x'], xB)[1]), // 0
  l3ZXOverlap: inner(KET['+z'], KET['+x']).re, // 0.7071
  l3MZXOverlap: inner(KET['-z'], KET['+x']).re, // 0.7071
  /* l3-eigen */
  l3MPlusX: apply(M, KET['+x'])[0].re, // 2.1213 = 3/√2
  l3MStretchPlus: inner(KET['+x'], apply(M, KET['+x'])).re, // 3
  l3MStretchMinus: inner(KET['-x'], apply(M, KET['-x'])).re, // 1
  l3MXEigen: yes(vecEq(apply(M, KET['+x']), vscale(KET['+x'], 3)) && vecEq(apply(M, KET['-x']), KET['-x'])), // 1
  l3MTurnsUp: yes(!samePhysicalState(apply(M, KET['+z']), KET['+z'])), // 1
  l3MUpImage: apply(M, KET['+z'])[0].re, // 2: M|+z⟩ = (2, 1)
  l3MUpImage2: apply(M, KET['+z'])[1].re, // 1: the second entry of M|+z⟩
  l3MEigTop: eigenHermitian2(M).values[0], // 3
  l3MEigLow: eigenHermitian2(M).values[1], // 1
  l3SzEigUp: eigenHermitian2(SZ).values[0], // 0.5 (ħ)
  l3SzEigDown: eigenHermitian2(SZ).values[1], // −0.5 (ħ)
  l3SzUp: apply(SZ, KET['+z'])[0].re, // 0.5
  l3SzDown: apply(SZ, KET['-z'])[1].re, // −0.5
  l3SzArrow: decomposeHermitian(SZ)!.a[2], // 0.5: half the gap between ±½
  l3SzGauge: decomposeHermitian(SZ)!.a0, // 0: their midpoint
  l3SzVectors: yes(vecEq(eigenHermitian2(SZ).vectors[0], KET['+z']) && vecEq(eigenHermitian2(SZ).vectors[1], KET['-z'])), // 1
  l3HHerm: yes(isHermitian(H) && matEq(dagger(H), H)), // 1
  l3HEigPlus: eigH.values[0], // 2.2361 = √5
  l3HEigMinus: eigH.values[1], // −2.2361
  l3HArrowY: decomposeHermitian(H)!.a[1], // 2
  l3HArrowZ: decomposeHermitian(H)!.a[2], // 1
  l3HGauge: decomposeHermitian(H)!.a0, // 0
  l3HEigOrth: abs(inner(eigH.vectors[0], eigH.vectors[1])), // 0
  l3OvenZPlus: benchTheory({ source: 'oven', axes: ['z'], keep: [] }).plus, // 0.5
  l3BornSum: worst(sweep(18, (t) => prob(KET['+z'], planeKet(90 * t)) + prob(KET['-z'], planeKet(90 * t))), 1), // 1 at every sampled angle
  l3P60Up: prob(KET['+z'], p60), // 0.25
  l3P60Down: prob(KET['-z'], p60), // 0.75
  l3HUpDownIm: inner(KET['+z'], apply(H, KET['-z'])).im, // −2: H₁₂ = −2i
  l3HDownUpIm: inner(KET['-z'], apply(H, KET['+z'])).im, // +2: H₂₁ = +2i
  l3HDiagReal: yes(Math.abs(H[0][0].im) < 1e-15 && Math.abs(H[1][1].im) < 1e-15), // 1
  l3RHerm: yes(isHermitian(R)), // 0
  l3RIsTurn: yes(matEq(R, rotation([0, 1, 0], Math.PI))), // 1: a 180° turn about y
  l3RYPlusIm: sandwich(R, KET['+y']).im, // −1: ⟨+y|R|+y⟩ = −i
  l3RYMinusIm: sandwich(R, KET['-y']).im, // +1
  l3RYSame: yes(samePhysicalState(apply(R, KET['+y']), KET['+y'])), // 1
  l3REigIm: Math.max(...eigen2(R).values.map((z) => z.im)), // 1: eigenvalues ±i
  l3REigRe: Math.max(...eigen2(R).values.map((z) => Math.abs(z.re))), // 0
  l3RNoRealEigen: yes([0, 30, 60, 90, 120, 150].every((t) => !samePhysicalState(apply(R, planeKet(t)), planeKet(t)))), // 1
  /* l3-projectors */
  l3C60Up: inner(KET['+z'], p60).re, // 0.5
  l3PuP60: apply(Pu, p60)[0].re, // 0.5: P̂₊|ψ₆₀⟩ = ½|+z⟩
  l3PuP60Rest: abs(apply(Pu, p60)[1]), // 0
  l3PuIdem: yes(matEq(matmul(Pu, Pu), Pu) && classify(Pu).projector), // 1
  l3PuTwice: apply(Pu, apply(Pu, p60))[0].re, // 0.5
  l3ComplZ: yes(matEq(madd(Pu, Pd), identity(2))), // 1
  l3ComplX: yes(matEq(madd(Ppx, Pmx), identity(2))), // 1
  l3CxPlus: cxPlus.re, // 0.9659
  l3CxMinus: cxMinus.re, // −0.2588
  l3CxMinusSize: abs(cxMinus), // 0.2588
  l3Rebuild: norm(vsub(vadd(vscale(KET['+x'], cxPlus), vscale(KET['-x'], cxMinus)), p60)), // 0
  l3HalfPuA0: halfPu.a0, // 0.25
  l3HalfPuAz: halfPu.a[2], // 0.25
  l3HalfPdA0: halfPd.a0, // −0.25
  l3HalfPdAz: halfPd.a[2], // 0.25
  l3SpecSz: yes(matEq(fromSpectrum([0.5, -0.5], [KET['+z'], KET['-z']]), SZ)), // 1
  l3BlockBlocked: block.blocked[0], // 0.5
  l3BlockPlus: block.plus, // 0.5
  l3BlockMinus: block.minus, // 0
  l3PuEigTop: eigenHermitian2(Pu).values[0], // 1
  l3PuEigLow: eigenHermitian2(Pu).values[1], // 0
  l3PuKillsDown: norm(apply(Pu, KET['-z'])), // 0
  l3PuA0: decomposeHermitian(Pu)!.a0, // 0.5: a projector sits at a₀ = ½ …
  l3PuAz: decomposeHermitian(Pu)!.a[2], // 0.5: … with an arrow of length ½
  l3PuP60Len: norm(apply(Pu, p60)), // 0.5
  l3PuP60Renorm: yes(vecEq(normalize(apply(Pu, p60)), KET['+z'])), // 1
  l3PuP60Exp: expectation(Pu, p60), // 0.25
  /* l3-postulates */
  l3P60PlusX: expectation(Ppx, p60), // 0.9330
  l3P60MinusX: expectation(Pmx, p60), // 0.0670
  l3XBarsSum: worst(sweep(12, (t) => expectation(Ppx, planeKet(180 * t)) + expectation(Pmx, planeKet(180 * t))), 1), // 1
  l3CollapseDown: yes(vecEq(collapse(Pd, p60).post!, KET['-z'])), // 1
  l3P60DownAmp: inner(KET['-z'], p60).re, // 0.8660
  l3YDownPostIm: collapse(Pd, KET['+y']).post![1].im, // 1: the state becomes i|−z⟩
  l3YDownSame: yes(samePhysicalState(collapse(Pd, KET['+y']).post!, KET['-z'])), // 1
  l3SzOnX: apply(SZ, KET['+x'])[0].re, // 0.3536
  l3SzOnXLen: norm(apply(SZ, KET['+x'])), // 0.5
  l3SzOnXIsMinusX: yes(vecEq(apply(SZ, KET['+x']), vscale(KET['-x'], 0.5))), // 1
  l3MinusXNotZ: yes(!samePhysicalState(KET['-x'], KET['+z']) && !samePhysicalState(KET['-x'], KET['-z'])), // 1
  l3MeasureXPost: yes(vecEq(measure(SZ, KET['+x'], 0.3).post, KET['+z']) && vecEq(measure(SZ, KET['+x'], 0.7).post, KET['-z'])), // 1
  l3MeasureXProb: measure(SZ, KET['+x'], 0.3).probs[0], // 0.5
  l3SigZOnX: yes(vecEq(apply(SIGMA_Z, KET['+x']), KET['-x'])), // 1
  l3XMinusXOverlap: abs(inner(KET['+x'], KET['-x'])), // 0
  l3SigZMeanX: expectation(SIGMA_Z, KET['+x']), // 0
  l3SzDownSame: yes(samePhysicalState(apply(SZ, KET['-z']), KET['-z'])), // 1
  l3DownDown: prob(KET['-z'], KET['-z']), // 1
  l3MinusXOnZ: prob(KET['-x'], KET['+z']), // 0.5
  /* l3-spin-example */
  l3ProbZX: prob(KET['+z'], KET['+x']), // 0.5
  l3RepeatCertain: prob(KET['+z'], KET['+z']), // 1
  l3ZxzAlive1: 1 - zxz.blocked[0], // 0.5
  l3ZxzAlive2: 1 - zxz.blocked[0] - zxz.blocked[1], // 0.25
  l3ZxzPlus: zxz.plus, // 0.125
  l3ZxzMinus: zxz.minus, // 0.125
  l3ProbXZ: prob(KET['+x'], KET['+z']), // 0.5
  l3ProbMXZ: prob(KET['-x'], KET['+z']), // 0.5
  l3MXZOverlap: inner(KET['-x'], KET['+z']).re, // 0.7071
  l3SxMovesZ: yes(!samePhysicalState(apply(SX, KET['+z']), KET['+z'])), // 1
  l3SzKeepsZ: yes(samePhysicalState(apply(SZ, KET['+z']), KET['+z'])), // 1
  /* l3-spread */
  l3MeanSzX: expectation(SZ, KET['+x']), // 0
  l3MeanSzXSum: 0.5 * prob(KET['+z'], KET['+x']) - 0.5 * prob(KET['-z'], KET['+x']), // 0
  l3MeanSzP60: expectation(SZ, p60), // −0.25 (ħ)
  l3MeanSzP60Sum: 0.5 * prob(KET['+z'], p60) - 0.5 * prob(KET['-z'], p60), // −0.25
  l3SzSquaredId: yes(matEq(matmul(SZ, SZ), mscale(identity(2), 0.25))), // 1
  l3SzSqP60: expectation(matmul(SZ, SZ), p60), // 0.25 (ħ²)
  l3SpreadX: Math.sqrt(variance(SZ, KET['+x'])), // 0.5 (ħ)
  l3SigmaSpreadX: spreadAlong('z', 'x'), // 1: the bracket, in units of ħ/2
  l3MeanSzUp: expectation(SZ, KET['+z']), // 0.5
  l3VarSzUp: variance(SZ, KET['+z']), // 0
  l3UpOnZ: benchTheory({ source: '+z', axes: ['z'], keep: [] }).plus, // 1
  l3TiltPlus: tilt120.plus, // 0.25
  l3TiltMinus: tilt120.minus, // 0.75
  l3TownsendUp: prob(KET['+z'], psiT), // 0.25
  l3TownsendDown: prob(KET['-z'], psiT), // 0.75
  l3TownsendMean: expectation(SZ, psiT), // −0.25 (ħ)
  l3TownsendSpread: Math.sqrt(variance(SZ, psiT)), // 0.4330 (ħ)
  l3SpreadP60: Math.sqrt(variance(SZ, p60)), // 0.4330 (ħ)
  l3SigmaSpreadTilt: spreadAlong(120, 'z'), // 0.8660: the bracket on the tilted bench, in units of ħ/2
  l3MeanSxUp: expectation(SX, KET['+z']), // 0
  l3SpreadSxUp: Math.sqrt(variance(SX, KET['+z'])), // 0.5 (ħ)
  l3ZonXPlus: benchTheory({ source: '+z', axes: ['x'], keep: [] }).plus, // 0.5
  l3SpreadMax: Math.max(...variances), // 0.25: no spin component spreads more than ħ/2
  l3ZeroSpreadIffEigen: yes(
    [SZ, SX, mscale(M, 0.25)].every((A) => spreadStates.every((s) => (variance(A, s) < 1e-12) === samePhysicalState(apply(A, s), s))),
  ), // 1: ΔA = 0 exactly for the eigenvectors (six named kets and three other states)
  /* challenges */
  l3ChSwap: inner(KET['+z'], apply(SWAP, vec(0.6, 0.8))).re, // 0.8
  l3ChB21: inner(KET['-z'], apply(B, KET['+z'])).re, // 2
  l3ChB12: inner(KET['+z'], apply(B, KET['-z'])).re, // 0
  l3ChBx: inner(KET['-z'], apply(B, KET['+x'])).re, // 3.5355 = 5/√2
  l3ChSzDown: inner(KET['-z'], apply(SZ, KET['-z'])).re, // −0.5 (ħ)
  l3ChMEigenCount: NAMED.filter((n) => samePhysicalState(apply(M, KET[n]), KET[n])).length, // 2 (|±x⟩)
  l3ChMMinusX: yes(vecEq(apply(M, KET['-x']), KET['-x'])), // 1: eigenvalue 1
  l3ChMOneTwo: yes(!samePhysicalState(apply(M, normalize(vec(1, 2))), normalize(vec(1, 2)))), // 1: not an eigenvector
  l3ChHermOnlyFirst: yes(hermOptions.map((m) => isHermitian(m)).join() === 'true,false,false,false'), // 1
  l3ChHYIm: sandwich(H, KET['+y']).im, // 0: a Hermitian sandwich is real
  l3ChHYRe: sandwich(H, KET['+y']).re, // 2
  l3ChPdLen: norm(apply(Pd, p60)), // 0.8660
  l3ChPpsi01: projector(p60)[0][1].re, // 0.4330 = √3/4
  l3ChPpsi00: projector(p60)[0][0].re, // 0.25
  l3ChPpsiIsProj: yes(classify(projector(p60)).projector), // 1
  l3ChBuild12: fromSpectrum([3, 1], [KET['+x'], KET['-x']])[0][1].re, // 1
  l3ChBuildIsM: yes(matEq(fromSpectrum([3, 1], [KET['+x'], KET['-x']]), M)), // 1
  l3ChSumProj: yes(classify(madd(Pu, Ppx)).projector), // 0
  l3ChSum00: madd(Pu, Ppx)[0][0].re, // 1.5
  l3ChSzYIsMinusY: yes(samePhysicalState(apply(SZ, KET['+y']), KET['-y'])), // 1
  l3ChPdYLen: norm(apply(Pd, KET['+y'])), // 0.7071
  l3ChStepsPost: yes(vecEq(measure(SZ, p60, 0.1).post, KET['+z']) && vecEq(measure(SZ, p60, 0.5).post, KET['-z'])), // 1
  l3ChStepsProbUp: measure(SZ, p60, 0.1).probs[0], // 0.25
  l3ChTilt: benchTheory({ source: '+x', axes: ['z', 60, 'z'], keep: ['+', '+'] }).plus, // 0.28125 = 9/32
  l3ChSpreadComplex: Math.sqrt(variance(SZ, vec(1 / Math.sqrt(3), c(0, Math.sqrt(2 / 3))))), // 0.4714 = √2/3
} as const

export type ValueKey = keyof typeof V

/** A claim tied to one L3 engine value: its text starts with `key · ` (read by content/claims.test.ts). */
export const claim = keyedClaim<ValueKey>()

export { close, d, pct, tf, uf } from './claimKit'
