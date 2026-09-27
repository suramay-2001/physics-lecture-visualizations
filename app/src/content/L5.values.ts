/**
 * Lecture 5 numbers, computed once with the engine (owner: P). Same contract as L1–L4.values.ts: every number a
 * learner reads in L5 comes from `V` and is backed by a keyed claim; the numpy twin of each key is in
 * physics/__fixtures__/claims.json (pipeline/make_claim_fixtures.py, "L5" block). Keys start with `l5`.
 *
 * Complex results are stored as their real or imaginary part (the part the prose states); yes/no facts are 1 or
 * 0; a displayed magnitude of a negative number gets its own key (the number reader sees digits, not signs).
 * Basis changes use the engine's arrows: `basisChange(from, to)` = B_{to←from}, so B_{z←x} = basisChange('x', 'z').
 * The "for every state / every basis" claims run over the seeded numpy fixture `basis_changes` (seed 448: a random
 * Hermitian A, a random state ψ and a random orthonormal basis each), never over a new random generator; each such
 * value is the worst sample (`worst`), so it equals its target only if every sample does.
 */
import { basis_changes } from '../physics/__fixtures__/numpy.json'
import { type C, abs, c, conj, expi, mul, sub } from '../physics/complex'
import {
  apply, charPoly2, dagger, det2, diag2, fromColumns, identity, inner, inv2, isDiagonal, isHermitian, isUnitary, madd, mat, matEq, matmul, maxDiff,
  mscale, msub, norm, vec, vscale, vsub, type Mat, type Vec,
} from '../physics/linalg'
import { decomposeHermitian } from '../physics/operators'
import { benchTheory } from '../physics/sg'
import {
  KET, Rz, SX, SY, SZ, basisChange, blochVector, eigenHermitian2, eigenvectorFor, expectation, fromSpectrum, ketAlong, ketFromBloch, nDotSigma,
  operatorInBasis, prob, projector, samePhysicalState, sandwich, toBasis, variance, type Vec3,
} from '../physics/spin'
import { keyedClaim } from './claimKit'

const DEG = Math.PI / 180
const yes = (b: boolean) => (b ? 1 : 0)
const vecEq = (a: Vec, b: Vec) => norm(vsub(a, b)) < 1e-12
/** The sample farthest from `target`: equal to the target only if EVERY sample is (a minimum would only prove "at least"). */
const worst = (xs: number[], target: number) => xs.reduce((w, x) => (Math.abs(x - target) > Math.abs(w - target) ? x : w), target)
const sweep = (n: number, f: (t: number) => number) => Array.from({ length: n + 1 }, (_, k) => f(k / n))
/** Largest entry-wise gap between two columns. */
const vgap = (a: Vec, b: Vec) => norm(vsub(a, b))

/** The notes' p. 5 state: (√3/2)|+z⟩ + (i/2)|−z⟩, Bloch angles (60°, 90°). */
export const psiEx = ketFromBloch(60 * DEG, 90 * DEG)
/** Lecture 4's real worked state: (√3/2)|+z⟩ + ½|−z⟩, the plane arrow at 30° (Bloch angle 60°). */
export const psi30 = ketFromBloch(60 * DEG, 0)
/** The challenges' real column (0.6, 0.8) and its complex twin (0.6, 0.8i). */
export const v68 = vec(0.6, 0.8)
export const v68i = vec(0.6, c(0, 0.8))
/** A = [[1, 2], [2, 1]] = I + 2σx: shares σx's eigenvectors. */
export const A12: Mat = mat([[1, 2], [2, 1]])
/** Townsend §2.4's kind of example: a Hermitian matrix with complex entries, a₀ = 1, a⃗ = (1, 1, 1). */
export const AC: Mat = mat([
  [2, c(1, -1)],
  [c(1, 1), 0],
])
/** A skewed pair of basis arrows, |+z⟩ and |+x⟩ (45° apart in state space): its dagger is not its inverse. */
export const NSKEW: Mat = fromColumns([KET['+z'], KET['+x']])

const ZB: Vec[] = [KET['+z'], KET['-z']]
const XB: Vec[] = [KET['+x'], KET['-x']]
const YB: Vec[] = [KET['+y'], KET['-y']]
/** Townsend §2.5's main-text phase: |−x⟩ multiplied by −1. */
const XT: Vec[] = [KET['+x'], vscale(KET['-x'], -1)]
/** B_{z←x} (columns |±x⟩ in z coordinates) and its way back B_{x←z}; the same for y. */
const Bzx = basisChange('x', 'z')
const Bxz = basisChange('z', 'x')
const Bzy = basisChange('y', 'z')
const Byz = basisChange('z', 'y')
const Pz = projector(KET['+z'])
const SzX = operatorInBasis(SZ, XB)
const SxX = operatorInBasis(SX, XB)
const PzX = operatorInBasis(Pz, XB)
const cxZ = toBasis(KET['+z'], XB)
const cx30 = toBasis(psi30, XB)
const coh = (psi: Vec): C => mul(conj(psi[0]), psi[1])
const eigA12 = eigenHermitian2(A12)
const eigAC = eigenHermitian2(AC)
const decAC = decomposeHermitian(AC)!
const psiT = ketFromBloch(120 * DEG, 90 * DEG)
const skewInv = inv2(NSKEW)!
const rzX = apply(Rz(Math.PI / 2), KET['+x'])

/* the seeded numpy fixture (seed 448): random Hermitian A, state ψ and orthonormal basis, ten of each */
const FX = basis_changes.map((b) => ({ A: b.A as Mat, psi: b.psi as Vec, basis: b.basis as Vec[] }))
/** Every basis the property claims try: x, y and each fixture's random basis. */
const BASES = (basis: Vec[]): Vec[][] => [XB, YB, basis]
/** Sampled directions n̂ for "every direction reads ±1": polar angles × azimuths, including ones off the x–z plane. */
const DIRS: Vec3[] = [30, 60, 90, 137].flatMap((t) => [0, 45, 90, 200].map((p) => [Math.sin(t * DEG) * Math.cos(p * DEG), Math.sin(t * DEG) * Math.sin(p * DEG), Math.cos(t * DEG)] as Vec3))
const dirEig = DIRS.map((n) => eigenHermitian2(nDotSigma(n)))
/** σₙ along the notes' state's own axis, n̂ = (0, √3/2, ½): its + eigenvector is ψ (Unit 5.1). */
const nEx = blochVector(psiEx)
const eigNEx = eigenHermitian2(nDotSigma(nEx))

export const V = {
  /* l5-averages */
  l5SpecSy: yes(matEq(fromSpectrum([0.5, -0.5], [KET['+y'], KET['-y']]), SY)), // 1
  l5PyEntry11: projector(KET['+y'])[1][1].re, // 0.5
  l5NoConj11: mul(KET['+y'][1], KET['+y'][1]).re, // −0.5: the lower-right product without the conjugate
  l5SpinHerm: yes(isHermitian(SX) && isHermitian(SY) && isHermitian(SZ)), // 1
  l5SyArrow: decomposeHermitian(SY)!.a[1], // 0.5
  l5SzAtEveryPhase: worst(sweep(24, (t) => expectation(SZ, ketFromBloch(60 * DEG, 360 * t * DEG))), 0.25), // 0.25 at every sampled phase
  l5SxPhi0: expectation(SX, ketFromBloch(60 * DEG, 0)), // 0.4330
  l5SxPhi180: expectation(SX, ketFromBloch(60 * DEG, 180 * DEG)), // −0.4330
  l5CohRuleX: worst(FX.map(({ psi }) => expectation(SX, psi) - coh(psi).re), 0), // 0: ⟨Sx⟩ = Re(α*β) (ħ = 1)
  l5SyPhi90: expectation(SY, ketFromBloch(60 * DEG, 90 * DEG)), // 0.4330
  l5SyPhi270: expectation(SY, ketFromBloch(60 * DEG, 270 * DEG)), // −0.4330
  l5CohRuleY: worst(FX.map(({ psi }) => expectation(SY, psi) - coh(psi).im), 0), // 0: ⟨Sy⟩ = Im(α*β)
  l5SyReal: worst(FX.map(({ psi }) => sandwich(SY, psi).im), 0), // 0: the sandwich of Sy has no imaginary part
  l5PsiExIsNotes: yes(vecEq(psiEx, vec(Math.sqrt(3) / 2, c(0, 0.5)))), // 1
  l5PopUp: prob(KET['+z'], psiEx), // 0.75
  l5PopDown: prob(KET['-z'], psiEx), // 0.25
  l5CohExRe: coh(psiEx).re, // 0
  l5CohExIm: coh(psiEx).im, // 0.4330 = √3/4
  l5MeanSz: expectation(SZ, psiEx), // 0.25 (ħ)
  l5MeanSx: expectation(SX, psiEx), // 0
  l5MeanSy: expectation(SY, psiEx), // 0.4330 (ħ)
  l5SyPsi0: apply(SY, psiEx)[0].re, // 0.25: the notes' direct check, (ħ/2)(½, i√3/2)
  l5SyPsi1Im: apply(SY, psiEx)[1].im, // 0.4330
  l5BlochX: nEx[0], // 0
  l5BlochY: nEx[1], // 0.8660
  l5BlochZ: nEx[2], // 0.5
  l5TownsendKet: yes(vecEq(psiT, vec(0.5, c(0, Math.sqrt(3) / 2)))), // 1
  l5TownsendAlpha: psiT[0].re, // 0.5
  l5TownsendSz: expectation(SZ, psiT), // −0.25
  l5SqY: nEx[1] ** 2, // 0.75
  l5SqZ: nEx[2] ** 2, // 0.25
  l5SqSum: nEx.reduce((s, x) => s + x * x, 0), // 1
  l5PolarizedEx: prob(ketAlong(nEx), psiEx), // 1: along its own axis ψ reads + for certain
  l5PolarizedAll: worst(FX.map(({ psi }) => prob(ketAlong(blochVector(psi)), psi)), 1), // 1 for every fixture state
  l5YonZ: benchTheory({ source: '+y', axes: ['z'], keep: [] }).plus, // 0.5
  l5YonX: benchTheory({ source: '+y', axes: ['x'], keep: [] }).plus, // 0.5
  l5OvenZ: benchTheory({ source: 'oven', axes: ['z'], keep: [] }).plus, // 0.5
  l5PlusYSx: expectation(SX, KET['+y']), // 0
  l5PlusYSy: expectation(SY, KET['+y']), // 0.5 (ħ)
  l5PlusYSz: expectation(SZ, KET['+y']), // 0
  l5PlusYCohIm: coh(KET['+y']).im, // 0.5
  l5OvenAvg: worst([0, 45, 90].map((t) => 2 * benchTheory({ source: 'oven', axes: [t], keep: [] }).plus - 1), 0), // 0 along every sampled tilt
  /* l5-inverse */
  l5CharPolyLin: charPoly2(SX)[1].re, // 0
  l5CharPolyDet: charPoly2(SX)[2].re, // −0.25: λ² − ħ²/4
  l5DetAtPlus: abs(det2(msub(SX, mscale(identity(2), 0.5)))), // 0
  l5DetAtMinus: abs(det2(msub(SX, mscale(identity(2), -0.5)))), // 0
  l5SxBackSub: yes(vecEq(eigenvectorFor(SX, 0.5), KET['+x']) && vecEq(eigenvectorFor(SX, -0.5), KET['-x'])), // 1
  l5XOrth: abs(inner(KET['+x'], KET['-x'])), // 0
  l5XNorms: worst([norm(KET['+x']), norm(KET['-x'])], 1), // 1
  l5ComplX: yes(matEq(madd(projector(KET['+x']), projector(KET['-x'])), identity(2))), // 1
  l5SyHerm: yes(isHermitian(SY)), // 1
  l5DirEigUp: worst(dirEig.map((e) => e.values[0]), 1), // 1 in every sampled direction
  l5DirEigDown: worst(dirEig.map((e) => e.values[1]), -1), // −1 in every sampled direction
  l5DirOrth: worst(dirEig.map((e) => abs(inner(e.vectors[0], e.vectors[1]))), 0), // 0
  l5DirExUp: eigNEx.values[0], // 1
  l5DirExIsPsi: yes(samePhysicalState(eigNEx.vectors[0], psiEx)), // 1: σₙ's + state along n̂ = (0, 0.866, 0.5) is ψ
  l5AHerm: yes(isHermitian(AC)), // 1
  l5AA0: decAC.a0, // 1
  l5AAx: decAC.a[0], // 1
  l5AAy: decAC.a[1], // 1
  l5AAz: decAC.a[2], // 1
  l5AEigUp: eigAC.values[0], // 2.7321 = 1 + √3
  l5AEigDown: eigAC.values[1], // −0.7321 = 1 − √3
  l5AEigDownSize: Math.abs(eigAC.values[1]), // 0.7321
  l5MinusXNegSame: yes(samePhysicalState(KET['-x'], vscale(KET['-x'], -1))), // 1
  l5SzInXOff: SzX[0][1].re, // 0.5
  l5SzInXTOff: operatorInBasis(SZ, XT)[0][1].re, // −0.5: Townsend's phase flips the entries
  /* l5-coordinates */
  l5Psi30Up: prob(KET['+z'], psi30), // 0.75
  l5Psi30Down: prob(KET['-z'], psi30), // 0.25
  l5Psi30Beta: psi30[1].re, // 0.5
  l5Psi30U: cx30[0].re, // 0.9659
  l5Psi30V: cx30[1].re, // 0.2588
  l5Psi30XUp: prob(KET['+x'], psi30), // 0.9330
  l5Psi30XDown: prob(KET['-x'], psi30), // 0.0670
  l5RebuildAlpha: (cx30[0].re + cx30[1].re) / Math.SQRT2, // 0.8660 = α
  l5RebuildBeta: (cx30[0].re - cx30[1].re) / Math.SQRT2, // 0.5 = β
  l5BzxEntries: yes(matEq(Bzx, mscale(mat([[1, 1], [1, -1]]), Math.SQRT1_2))), // 1
  l5BzxIsColumns: yes(matEq(Bzx, fromColumns(XB))), // 1
  l5Rebuild: yes(vecEq(apply(Bzx, cx30), psi30)), // 1: B_{z←x} c_x = c_z
  l5BzxUnitary: yes(isUnitary(Bzx)), // 1
  l5BxzIsDagger: yes(matEq(Bxz, dagger(Bzx))), // 1
  l5UIsBra: yes(Math.abs(cx30[0].re - inner(KET['+x'], psi30).re) < 1e-12 && Math.abs(cx30[1].re - inner(KET['-x'], psi30).re) < 1e-12), // 1
  l5Cx30Norm: norm(cx30), // 1
  l5ZcxU: cxZ[0].re, // 0.7071
  l5ZcxV: cxZ[1].re, // 0.7071
  l5ZonXPlus: prob(KET['+x'], KET['+z']), // 0.5
  l5XinX: yes(vecEq(toBasis(KET['+x'], XB), vec(1, 0))), // 1
  l5Bzx01: Bzx[0][1].re, // 0.7071 = ⟨+z|−x⟩
  l5Bzx11: Bzx[1][1].re, // −0.7071 = ⟨−z|−x⟩
  l5BzxOverlaps: yes([0, 1].every((j) => [0, 1].every((k) => abs(sub(Bzx[j][k], inner(ZB[j], XB[k]))) < 1e-12))), // 1: entry (j, k) = ⟨z_j|x_k⟩
  l5BxSym: yes(matEq(Bzx, Bxz)), // 1: same entries for x, by luck
  l5BySym: yes(matEq(Bzy, Byz)), // 0: not for y
  l5Bzy10Im: Bzy[1][0].im, // 0.7071
  l5Byz01Im: Byz[0][1].im, // −0.7071
  l5SkewUnitary: yes(isUnitary(NSKEW)), // 0
  l5SkewDagger1: apply(dagger(NSKEW), KET['+z'])[1].re, // 0.7071: the dagger's wrong second coordinate
  l5SkewInvOk: yes(vecEq(apply(skewInv, KET['+z']), vec(1, 0))), // 1: the true inverse gives (1, 0)
  /* l5-operators */
  l5SzArrowZ: decomposeHermitian(SZ)!.a[2], // 0.5
  l5ActConvert: worst(FX.flatMap(({ A, psi, basis }) => BASES(basis).map((bs) => vgap(toBasis(apply(A, psi), bs), apply(operatorInBasis(A, bs), toBasis(psi, bs))))), 0), // 0
  l5ActConvertAny: worst(FX.flatMap(({ A, psi, basis }) => BASES(basis).map((bs) => { const M = matmul(A, fromColumns(basis)); return vgap(toBasis(apply(M, psi), bs), apply(operatorInBasis(M, bs), toBasis(psi, bs))) })), 0), // 0: a non-Hermitian M = A·U too
  l5AnyNotHerm: yes(FX.every(({ A, basis }) => !isHermitian(matmul(A, fromColumns(basis))))), // 1: none of those M is Hermitian
  l5SxInX00: SxX[0][0].re, // 0.5
  l5SxInX11: SxX[1][1].re, // −0.5
  l5SxInXDiag: yes(isDiagonal(SxX) && matEq(SxX, diag2(0.5, -0.5))), // 1
  l5ABeqBD: yes(matEq(matmul(SX, Bzx), matmul(Bzx, diag2(0.5, -0.5)))), // 1
  l5DiagAll: worst(FX.map(({ A }) => { const e = eigenHermitian2(A); return maxDiff(operatorInBasis(A, e.vectors), diag2(e.values[0], e.values[1])) }), 0), // 0
  l5SzInXIsSx: yes(matEq(SzX, SX)), // 1
  l5SxInXIsSz: yes(matEq(SxX, SZ)), // 1
  l5TownsendPlusZ1: toBasis(KET['+z'], XT)[1].re, // −0.7071 (his eq. 2.101)
  l5TownsendMean: expectation(operatorInBasis(SZ, XT), toBasis(KET['+z'], XT)), // 0.5
  l5OurMean: expectation(SzX, cxZ), // 0.5
  l5SyInY00: operatorInBasis(SY, YB)[0][0].re, // 0.5
  l5SyInYDiag: yes(matEq(operatorInBasis(SY, YB), diag2(0.5, -0.5))), // 1
  l5ByUnitary: yes(isUnitary(Bzy)), // 1
  /* l5-invariance */
  l5ZMeanInX: expectation(SzX, cxZ), // 0.5
  l5ZMeanInZ: expectation(SZ, KET['+z']), // 0.5
  l5PzInX00: PzX[0][0].re, // 0.5
  l5PzInXAll: yes(matEq(PzX, mscale(mat([[1, 1], [1, 1]]), 0.5))), // 1
  l5PzInXProb: expectation(PzX, cxZ), // 1
  l5ZVarInX: variance(SzX, cxZ), // 0: Unit 3.6's variance (so the spread) of Sz is zero in the x basis too
  l5Psi30Mean: expectation(SZ, psi30), // 0.25
  l5Psi30MeanX: expectation(SzX, cx30), // 0.25
  l5BBdagger: yes(matEq(matmul(Bzx, dagger(Bzx)), identity(2))), // 1
  l5InvarAll: worst(FX.flatMap(({ A, psi, basis }) => BASES(basis).map((bs) => expectation(operatorInBasis(A, bs), toBasis(psi, bs)) - expectation(A, psi))), 0), // 0
  l5EigenEqInX: yes(vecEq(apply(SzX, cxZ), vscale(cxZ, 0.5))), // 1
  l5XMeanZInX: expectation(SzX, vec(1, 0)), // 0
  l5XMeanZ: expectation(SZ, KET['+x']), // 0
  l5MixedWrong: expectation(SZ, cxZ), // 0: a column in x with a matrix in z
  l5RzUnitary: yes(isUnitary(Rz(Math.PI / 2))), // 1
  l5RzXtoY: yes(samePhysicalState(rzX, KET['+y'])), // 1
  l5RzXProb: prob(KET['+x'], rzX), // 0.5
  l5XX: prob(KET['+x'], KET['+x']), // 1
  /* challenges */
  l5ChPopUp: prob(KET['+z'], v68i), // 0.36
  l5ChPopDown: prob(KET['-z'], v68i), // 0.64
  l5ChPopDiff: prob(KET['+z'], v68i) - prob(KET['-z'], v68i), // −0.28
  l5ChPopDiffSize: Math.abs(prob(KET['+z'], v68i) - prob(KET['-z'], v68i)), // 0.28
  l5ChSz: expectation(SZ, v68i), // −0.14 (ħ)
  l5ChSzSize: Math.abs(expectation(SZ, v68i)), // 0.14
  l5ChSy: expectation(SY, v68i), // 0.48 (ħ)
  l5ChSxI: expectation(SX, v68i), // 0
  l5ChSxReal: expectation(SX, v68), // 0.48
  l5ChSxGlobal: expectation(SX, vscale(v68, expi(1))), // 0.48: a global phase changes nothing
  l5ChSzSwap: expectation(SZ, vec(0.8, 0.6)), // 0.14: swapping flips the sign
  l5ChMissingSy: expectation(SY, ketFromBloch(90 * DEG, 60 * DEG)), // 0.4330
  l5ChMissingSx: expectation(SX, ketFromBloch(90 * DEG, 60 * DEG)), // 0.25
  l5ChMissingSz: expectation(SZ, ketFromBloch(90 * DEG, 60 * DEG)), // 0
  l5ChInvTop: eigA12.values[0], // 3
  l5ChInvLow: eigA12.values[1], // −1
  l5ChInvLowSize: Math.abs(eigA12.values[1]), // 1
  l5ChInvVec0: eigenvectorFor(A12, -1)[0].re, // 0.7071: back-substitution at λ = −1
  l5ChInvVec1: eigenvectorFor(A12, -1)[1].re, // −0.7071
  l5ChInvBackSub: yes(vecEq(eigenvectorFor(A12, -1), eigA12.vectors[1]) && vecEq(eigenvectorFor(A12, 3), eigA12.vectors[0])), // 1
  l5ChInvCharLin: charPoly2(A12)[1].re, // −2
  l5ChInvCharDet: charPoly2(A12)[2].re, // −3
  l5ChACharLin: charPoly2(AC)[1].re, // −2
  l5ChACharDet: charPoly2(AC)[2].re, // −2
  l5ChCoU: toBasis(v68, XB)[0].re, // 0.9899
  l5ChCoV: toBasis(v68, XB)[1].re, // −0.1414
  l5ChCoVSize: Math.abs(toBasis(v68, XB)[1].re), // 0.1414
  l5ChCoProbMinus: prob(KET['-x'], v68), // 0.02
  l5ChCoProbPlus: prob(KET['+x'], v68), // 0.98
  l5ChByzIsDagger: yes(matEq(Byz, dagger(Bzy)) && matEq(Byz, mscale(mat([[1, c(0, -1)], [1, c(0, 1)]]), Math.SQRT1_2))), // 1
  l5ChSkewQ: apply(skewInv, KET['-z'])[1].re, // 1.4142 = √2
  l5ChSkewP: apply(skewInv, KET['-z'])[0].re, // −1
  l5ChSkewDagger: apply(dagger(NSKEW), KET['-z'])[1].re, // 0.7071: what the dagger would wrongly give
  l5ChOpTop: operatorInBasis(A12, XB)[0][0].re, // 3
  l5ChOpDiag: yes(matEq(operatorInBasis(A12, XB), diag2(3, -1))), // 1
  l5ChSyInX01Im: operatorInBasis(SY, XB)[0][1].im, // 0.5
  l5ChSyInXIsMinusSy: yes(matEq(operatorInBasis(SY, XB), mscale(SY, -1))), // 1
  l5ChSxInY: yes(!isDiagonal(operatorInBasis(SX, YB)) && !isDiagonal(operatorInBasis(SZ, YB))), // 1: only Sy is diagonal in y
  l5ChSxInYIsSy: yes(matEq(operatorInBasis(SX, YB), SY)), // 1
  l5ChSzInYIsSx: yes(matEq(operatorInBasis(SZ, YB), SX)), // 1
  l5ChSxInXMean: expectation(SxX, cx30), // 0.4330
  l5ChSxInZMean: expectation(SX, psi30), // 0.4330
  l5ChByBy: yes(matEq(matmul(Bzy, Bzy), identity(2))), // 0: B² ≠ I for y
  l5ChBBdagY: yes(matEq(matmul(Bzy, dagger(Bzy)), identity(2))), // 1
  l5ChYBasisProb: expectation(operatorInBasis(projector(KET['+x']), YB), toBasis(psiEx, YB)), // 0.5
  l5ChYBasisProbZ: prob(KET['+x'], psiEx), // 0.5
  l5ChPsiExY: prob(KET['+y'], psiEx), // 0.9330
  l5ChPsiExMinusY: prob(KET['-y'], psiEx), // 0.0670
} as const

export type ValueKey = keyof typeof V

/** A claim tied to one L5 engine value: its text starts with `key · ` (read by content/claims.test.ts). */
export const claim = keyedClaim<ValueKey>()

export { close, d, pct, tf, uf } from './claimKit'
