/**
 * Lecture 4 numbers, computed once with the engine (owner: P). Same contract as L1–L3.values.ts: every number a
 * learner reads in L4 comes from `V` and is backed by a keyed claim; the numpy twin of each key is in
 * physics/__fixtures__/claims.json (pipeline/make_claim_fixtures.py, "L4" block). Keys start with `l4`.
 *
 * Complex results are stored as their real or imaginary part (the part the prose states); yes/no facts are 1 or
 * 0; a displayed magnitude of a negative number gets its own key (the number reader sees digits, not signs).
 * The non-Hermitian Q goes through `eigen2` / `classify`, never `expectation` / `eigenHermitian2` (both throw).
 */
import { abs, abs2, add, c, sub } from '../physics/complex'
import {
  apply, canonicalPhase, charPoly2, dagger, det2, diag2, gramSchmidt, identity, inner, isHermitian, madd, mat, matEq, matmul, maxDiff, mscale, msub, norm,
  norm2, normalize, vec, vscale, vsub, type Mat, type Vec,
} from '../physics/linalg'
import { classify, decomposeHermitian, eigen2 } from '../physics/operators'
import { binomialStd } from '../physics/random'
import { benchTheory } from '../physics/sg'
import {
  KET, SIGMA_X, SIGMA_Y, SIGMA_Z, SX, SY, SZ, blochVector, collapse, eigenHermitian2, eigenvectorFor, expectation, fromSpectrum, ketAlong, ketFromBloch,
  nDotSigma, operatorInBasis, prob, projector, samePhysicalState, spinAlong, tiltXZ, toBasis,
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
const ZERO2: Mat = mscale(identity(2), 0)

/** The lecture's example (L4 p. 8): (√3/2)|+z⟩ + ½|−z⟩, the plane arrow at 30° (Bloch angle 60°). */
export const psi4 = ketFromBloch(60 * DEG, 0)
/** A challenge state used throughout: 0.6|+z⟩ + 0.8|−z⟩. */
export const v68 = vec(0.6, 0.8)
/** Q² = Q but Q is not Hermitian (the clue of Unit 4.2). */
export const Q: Mat = mat([[1, 1], [0, 0]])
/** 2I + σx: the shifted eigenvalue problem of Unit 4.6. */
export const A2: Mat = mat([[2, 1], [1, 2]])
/** The "P₊y" built without conjugating the bra: ½(1, i)ᵀ(1, i). */
export const PY_BAD: Mat = mscale(mat([[1, c(0, 1)], [c(0, 1), -1]]), 0.5)

const Pu = projector(KET['+z'])
const Pd = projector(KET['-z'])
const Ppx = projector(KET['+x'])
const Pmx = projector(KET['-x'])
const Ppy = projector(KET['+y'])
const Pmy = projector(KET['-y'])
const xB: Vec[] = [KET['+x'], KET['-x']]
const p60 = planeKet(60)
const gs = gramSchmidt([KET['+z'], KET['+x']])
const yesno = benchTheory({ source: '+x', axes: ['z', 'z'], keep: ['+'] })
const filt = benchTheory({ source: '+x', axes: ['z', 'z', 'z'], keep: ['+', '+'] })
const downAsked = benchTheory({ source: '-z', axes: ['z', 'z'], keep: ['+'] })
/** The 60° preparation (a magnet tilted 60° from z toward x keeping +, fed by the oven), then the measurement. */
const prep60 = benchTheory({ source: 'oven', axes: [60, 'z'], keep: ['+'] })
const prep60zz = benchTheory({ source: 'oven', axes: [60, 'z', 'z'], keep: ['+', '+'] })
const prep60x = benchTheory({ source: 'oven', axes: [60, 'x'], keep: ['+'] })
const eigSx = eigenHermitian2(SX)
const tilt = spinAlong(tiltXZ(60 * DEG))
const eigTilt = eigenHermitian2(tilt)
const decTilt = decomposeHermitian(tilt)!
const eigA2 = eigenHermitian2(A2)
const szPsi = apply(SZ, psi4)
const psiInX = toBasis(psi4, xB)
/** ⟨±x|ψ⟩ = (α ± β)/√2, squared: the formula of Unit 4.6 against the Born rule, for three inputs. */
const formulaOk = [psi4, v68, KET['+y']].every(
  (s) => Math.abs(abs2(add(s[0], s[1])) / 2 - prob(KET['+x'], s)) < 1e-12 && Math.abs(abs2(sub(s[0], s[1])) / 2 - prob(KET['-x'], s)) < 1e-12,
)
const bz = (k: 'z' | 'x', w: [number, number]) => w[0] * blochVector(KET['+z'])[k === 'z' ? 2 : 0] + w[1] * blochVector(KET['-z'])[k === 'z' ? 2 : 0]

export const V = {
  /* l4-basis */
  l4XonZPlus: benchTheory({ source: '+x', axes: ['z'], keep: [] }).plus, // 0.5
  l4XonZMinus: benchTheory({ source: '+x', axes: ['z'], keep: [] }).minus, // 0.5
  l4UpOnZ: benchTheory({ source: '+z', axes: ['z'], keep: [] }).plus, // 1
  l4ZMinusZ: abs(inner(KET['+z'], KET['-z'])), // 0
  l4ZXOverlap: inner(KET['+z'], KET['+x']).re, // 0.7071
  l4MZXOverlap: inner(KET['-z'], KET['+x']).re, // 0.7071
  l4ZXProb: prob(KET['+z'], KET['+x']), // 0.5
  l4BarsTotal: worst(sweep(18, (t) => prob(KET['+z'], planeKet(90 * t)) + prob(KET['-z'], planeKet(90 * t))), 1), // 1 at every sampled angle
  l4ComplZ: yes(matEq(madd(Pu, Pd), identity(2))), // 1
  l4ComplX: yes(matEq(madd(Ppx, Pmx), identity(2))), // 1
  l4ZonXPlus: prob(KET['+x'], KET['+z']), // 0.5
  l4ZonXMinus: prob(KET['-x'], KET['+z']), // 0.5
  l4SxEigUp: eigSx.values[0], // 0.5 (ħ)
  l4SxEigDown: eigSx.values[1], // −0.5 (ħ)
  l4XMinusXOverlap: abs(inner(KET['+x'], KET['-x'])), // 0
  l4GsResidualUp: abs(gs.steps[1].residual[0]), // 0: |w₂⟩ has no |+z⟩ part …
  l4GsResidualDown: gs.steps[1].residual[1].re, // 0.7071: … and length 1/√2
  l4GsE2IsDown: yes(vecEq(gs.basis[1], KET['-z'])), // 1: rescaled, |e₂⟩ = |−z⟩
  l4IdEigTop: eigenHermitian2(identity(2)).values[0], // 1
  l4IdEigLow: eigenHermitian2(identity(2)).values[1], // 1: the eigenvalue repeats
  l4IdAnyEigen: yes([KET['+z'], KET['+x'], KET['-x'], planeKet(30), planeKet(75)].every((v) => samePhysicalState(apply(identity(2), v), v))), // 1
  /* l4-projectors */
  l4PuP60: apply(Pu, p60)[0].re, // 0.5
  l4PuP60Rest: abs(apply(Pu, p60)[1]), // 0
  l4PuEigTop: eigenHermitian2(Pu).values[0], // 1
  l4PuEigLow: eigenHermitian2(Pu).values[1], // 0
  l4PuVecs: yes(vecEq(eigenHermitian2(Pu).vectors[0], KET['+z']) && vecEq(eigenHermitian2(Pu).vectors[1], KET['-z'])), // 1
  l4PuKillsDown: norm(apply(Pu, KET['-z'])), // 0
  l4PuMeanX: expectation(Pu, KET['+x']), // 0.5 = P(yes) for |+x⟩
  l4YesNoBlocked: yesno.blocked[0], // 0.5
  l4YesNoPlus: yesno.plus, // 0.5
  l4PdIsIMinusPu: yes(matEq(msub(identity(2), Pu), Pd)), // 1
  l4Pu60Exp: expectation(Pu, p60), // 0.25
  l4Pd60Exp: expectation(Pd, p60), // 0.75
  l4SpecSz: yes(matEq(fromSpectrum([0.5, -0.5], [KET['+z'], KET['-z']]), SZ)), // 1
  l4FilterBlocked1: filt.blocked[0], // 0.5
  l4FilterBlocked2: filt.blocked[1], // 0
  l4FilterPlus: filt.plus, // 0.5
  l4FilterMinus: filt.minus, // 0
  l4PuIdem: yes(matEq(matmul(Pu, Pu), Pu)), // 1
  l4PuPdZero: maxDiff(matmul(Pu, Pd), ZERO2), // 0
  l4QIdem: yes(matEq(matmul(Q, Q), Q)), // 1
  l4QHerm: yes(isHermitian(Q)), // 0
  l4QProj: yes(classify(Q).projector), // 0
  l4PuProj: yes(classify(Pu).projector), // 1
  l4QEigTop: eigen2(Q).values[0].re, // 1
  l4QEigLow: eigen2(Q).values[1].re, // 0
  l4QKeepsUp: yes(vecEq(apply(Q, KET['+z']), KET['+z'])), // 1
  l4QKillsMinusX: norm(apply(Q, KET['-x'])), // 0
  l4ZMinusXOverlap: inner(KET['+z'], KET['-x']).re, // 0.7071
  l4UpGivenDown: prob(KET['+z'], KET['-z']), // 0
  l4DownAskedBlocked: downAsked.blocked[0], // 1
  /* l4-example */
  l4PsiNorm: norm(psi4), // 1
  l4PsiIsPlane30: yes(vecEq(psi4, planeKet(30))), // 1
  l4SzEigUp: eigenHermitian2(SZ).values[0], // 0.5 (ħ)
  l4SzEigDown: eigenHermitian2(SZ).values[1], // −0.5 (ħ)
  l4PsiAmpUp: inner(KET['+z'], psi4).re, // 0.8660 = √3/2
  l4PsiAmpDown: inner(KET['-z'], psi4).re, // 0.5
  l4PsiUp: prob(KET['+z'], psi4), // 0.75
  l4PsiDown: prob(KET['-z'], psi4), // 0.25
  l4CollapseUp: yes(vecEq(collapse(Pu, psi4).post!, KET['+z'])), // 1
  l4CollapseDown: yes(vecEq(collapse(Pd, psi4).post!, KET['-z'])), // 1
  l4PuPsiLen: norm(apply(Pu, psi4)), // 0.8660
  l4RepeatUp: prob(KET['+z'], KET['+z']), // 1
  l4PuMatrix: yes(matEq(Pu, mat([[1, 0], [0, 0]]))), // 1
  l4PuPsi0: apply(Pu, psi4)[0].re, // 0.8660
  l4PuPsi1: abs(apply(Pu, psi4)[1]), // 0
  l4PuPsiRescaled: yes(vecEq(vscale(apply(Pu, psi4), 1 / Math.sqrt(prob(KET['+z'], psi4))), KET['+z'])), // 1
  l4Prep60Blocked: prep60.blocked[0], // 0.5
  l4Prep60Plus: prep60.plus, // 0.375
  l4Prep60Minus: prep60.minus, // 0.125
  l4Prep60Fill: prep60.plus / (prep60.plus + prep60.minus), // 0.75
  l4Prep60Ket: yes(vecEq(ketAlong(tiltXZ(60 * DEG)), psi4)), // 1: the 60° magnet's + state is ψ
  l4PsiXPlus: prob(KET['+x'], psi4), // 0.9330
  l4PsiXMinus: prob(KET['-x'], psi4), // 0.0670
  l4MixXPlus: 0.75 * prob(KET['+x'], KET['+z']) + 0.25 * prob(KET['+x'], KET['-z']), // 0.5
  l4MixZPlus: 0.75 * prob(KET['+z'], KET['+z']) + 0.25 * prob(KET['+z'], KET['-z']), // 0.75
  l4PsiBlochX: blochVector(psi4)[0], // 0.8660
  l4PsiBlochZ: blochVector(psi4)[2], // 0.5
  l4MixBlochX: bz('x', [0.75, 0.25]), // 0
  l4MixBlochZ: bz('z', [0.75, 0.25]), // 0.5
  /* l4-average */
  l4MeanSz: expectation(SZ, psi4), // 0.25 (ħ)
  l4MeanSzSum: 0.5 * prob(KET['+z'], psi4) - 0.5 * prob(KET['-z'], psi4), // 0.25
  l4Centroid60: (prep60.plus - prep60.minus) / (prep60.plus + prep60.minus), // 0.5 = ⟨σz⟩
  l4Rep60Blocked1: prep60zz.blocked[0], // 0.5
  l4Rep60Blocked2: prep60zz.blocked[1], // 0.125
  l4Rep60Plus: prep60zz.plus, // 0.375
  l4Rep60Minus: prep60zz.minus, // 0
  l4SzPsi0: szPsi[0].re, // 0.4330 = √3/4
  l4SzPsi1: szPsi[1].re, // −0.25
  l4SzPsiLen: norm(szPsi), // 0.5
  l4SzPsiAtMinus30: yes(samePhysicalState(szPsi, planeKet(-30))), // 1: the image points to −30°
  l4SandwichSz: inner(psi4, szPsi).re, // 0.25
  l4MeanSzInX: inner(psiInX, apply(operatorInBasis(SZ, xB), psiInX)).re, // 0.25: the same number in the x basis
  l4SzPsiNotUp: yes(!samePhysicalState(szPsi, KET['+z'])), // 1
  l4SzPsiNotDown: yes(!samePhysicalState(szPsi, KET['-z'])), // 1
  l4ImgXPlus: prob(KET['+x'], normalize(szPsi)), // 0.0670
  l4MeanSzX: expectation(SZ, KET['+x']), // 0: the mean for Lecture 3's |+x⟩
  l4Count1000Std: binomialStd(1000, prob(KET['+z'], psi4)), // 13.69: scatter of the + count in 1000 atoms
  /* l4-matrices */
  l4DownOnZ: benchTheory({ source: '-z', axes: ['z'], keep: [] }).minus, // 1
  l4SzUpCol: apply(SZ, KET['+z'])[0].re, // 0.5
  l4SzUpColLow: abs(apply(SZ, KET['+z'])[1]), // 0
  l4SzDownCol: apply(SZ, KET['-z'])[1].re, // −0.5
  l4SzIsDiag: yes(matEq(SZ, diag2(0.5, -0.5))), // 1
  l4PpxEntry: Ppx[0][0].re, // 0.5
  l4PpxOff: Ppx[0][1].re, // 0.5
  l4PmxOff: Pmx[0][1].re, // −0.5
  l4SpecSx: yes(matEq(fromSpectrum([0.5, -0.5], [KET['+x'], KET['-x']]), SX)), // 1
  l4PyEntry11: Ppy[1][1].re, // 0.5
  l4PyEntry01Im: Ppy[0][1].im, // −0.5
  l4PmyEntry01Im: Pmy[0][1].im, // 0.5
  l4SpecSy: yes(matEq(fromSpectrum([0.5, -0.5], [KET['+y'], KET['-y']]), SY)), // 1
  l4SyArrow: decomposeHermitian(SY)!.a[1], // 0.5
  l4SigmaHalf: yes(matEq(mscale(SIGMA_X, 0.5), SX) && matEq(mscale(SIGMA_Y, 0.5), SY) && matEq(mscale(SIGMA_Z, 0.5), SZ)), // 1
  l4SzArrowZ: decomposeHermitian(SZ)!.a[2], // 0.5
  l4SzGauge: decomposeHermitian(SZ)!.a0, // 0
  l4SxArrowX: decomposeHermitian(SX)!.a[0], // 0.5
  l4SpinHerm: yes(isHermitian(SX) && isHermitian(SY) && isHermitian(SZ)), // 1
  l4SigmaYDagger: yes(matEq(dagger(SIGMA_Y), SIGMA_Y)), // 1
  l4SxVectors: yes(vecEq(eigSx.vectors[0], KET['+x']) && vecEq(eigSx.vectors[1], KET['-x'])), // 1
  l4SzInXIsSx: yes(matEq(operatorInBasis(SZ, xB), SX)), // 1
  l4SxInXIsSz: yes(matEq(operatorInBasis(SX, xB), SZ)), // 1
  /* l4-eigen */
  l4CharPolyLin: charPoly2(SX)[1].re, // 0: −tr Sx
  l4CharPolyDet: charPoly2(SX)[2].re, // −0.25: det Sx, so det(Sx − λI) = λ² − ¼
  l4CharPolyDetSize: abs(charPoly2(SX)[2]), // 0.25
  l4DetAtPlus: abs(det2(msub(SX, mscale(identity(2), 0.5)))), // 0
  l4DetAtMinus: abs(det2(msub(SX, mscale(identity(2), -0.5)))), // 0
  l4DetAtZero: det2(SX).re, // −0.25
  l4EigForPlus0: eigenvectorFor(SX, 0.5)[0].re, // 0.7071
  l4EigForPlus1: eigenvectorFor(SX, 0.5)[1].re, // 0.7071
  l4EigForMinus1: eigenvectorFor(SX, -0.5)[1].re, // −0.7071
  l4EigForAgree: yes(vecEq(eigenvectorFor(SX, 0.5), eigSx.vectors[0]) && vecEq(eigenvectorFor(SX, -0.5), eigSx.vectors[1])), // 1
  l4HalfFactor: KET['+x'][0].re * KET['-x'][0].re, // 0.5 = (1/√2)(1/√2)
  l4Formula: yes(formulaOk), // 1
  l4YPlusX: prob(KET['+x'], KET['+y']), // 0.5
  l4MeanSx: expectation(SX, psi4), // 0.4330 (ħ)
  l4MeanSxSum: 0.5 * (prob(KET['+x'], psi4) - prob(KET['-x'], psi4)), // 0.4330
  l4Prep60XPlus: prep60x.plus, // 0.4665
  l4Prep60XMinus: prep60x.minus, // 0.0335
  l4CentroidX: (prep60x.plus - prep60x.minus) / (prep60x.plus + prep60x.minus), // 0.8660 = ⟨σx⟩
  l4TiltEigUp: eigTilt.values[0], // 0.5
  l4TiltEigDown: eigTilt.values[1], // −0.5
  l4TiltVecIsPsi: yes(vecEq(eigTilt.vectors[0], psi4)), // 1
  l4TiltMeanUp: expectation(nDotSigma(tiltXZ(60 * DEG)), KET['+z']), // 0.5 = cos 60°
  l4TiltAx: decTilt.a[0], // 0.4330
  l4TiltAz: decTilt.a[2], // 0.25
  l4TiltLen: Math.hypot(...decTilt.a), // 0.5
  l4NegSame: yes(samePhysicalState(KET['+x'], vscale(KET['+x'], -1))), // 1
  l4ISame: yes(samePhysicalState(KET['+x'], vscale(KET['+x'], c(0, 1)))), // 1
  l4CanonI: yes(vecEq(canonicalPhase(vscale(KET['+x'], c(0, 1))), KET['+x'])), // 1
  /* challenges */
  l4ChMinusXofZ: inner(KET['-x'], KET['+z']).re, // 0.7071
  l4ChXYOverlap: abs(inner(KET['+x'], KET['+y'])), // 0.7071
  l4ChYMinusY: abs(inner(KET['+y'], vscale(KET['+y'], -1))), // 1: one state
  l4ChYes68: expectation(Pu, v68), // 0.36
  l4ChNo68: expectation(Pd, v68), // 0.64
  l4ChTwoFilters: benchTheory({ source: '+z', axes: ['x', 'z'], keep: ['+'] }).plus, // 0.25
  l4ChTwoFiltersNorm: norm2(apply(Pu, apply(Ppx, KET['+z']))), // 0.25
  l4ChPxUp0: apply(Ppx, KET['+z'])[0].re, // 0.5
  l4ChNormalize: prob(KET['+z'], normalize(vec(2, 1))), // 0.8
  l4ChThenX: prob(KET['+x'], collapse(Pu, psi4).post!), // 0.5
  l4ChMean68: expectation(SZ, v68), // −0.14 (ħ)
  l4ChMean68Size: Math.abs(expectation(SZ, v68)), // 0.14
  l4ChYesNoMean: expectation(Pu, psi4), // 0.75
  l4ChM22: SZ[1][1].re, // −0.5 (ħ)
  l4ChNoConjHerm: yes(isHermitian(PY_BAD)), // 0
  l4ChNoConjSquare: maxDiff(matmul(PY_BAD, PY_BAD), ZERO2), // 0: it squares to zero
  l4ChNoConj11: PY_BAD[1][1].re, // −0.5: the trap entry
  l4ChSzInX01: operatorInBasis(SZ, xB)[0][1].re, // 0.5 (ħ)
  l4ChSx68Plus: prob(KET['+x'], v68), // 0.98
  l4ChSx68Minus: prob(KET['-x'], v68), // 0.02
  l4ChShiftTop: eigA2.values[0], // 3
  l4ChShiftLow: eigA2.values[1], // 1
  l4ChShiftVecs: yes(vecEq(eigA2.vectors[0], KET['+x']) && vecEq(eigA2.vectors[1], KET['-x'])), // 1
  l4ChShiftA0: decomposeHermitian(A2)!.a0, // 2
  l4ChShiftAx: decomposeHermitian(A2)!.a[0], // 1
  l4ChSyIm: eigenHermitian2(SY).vectors[0][1].im, // 0.7071
} as const

export type ValueKey = keyof typeof V

/** A claim tied to one L4 engine value: its text starts with `key · ` (read by content/claims.test.ts). */
export const claim = keyedClaim<ValueKey>()

export { close, d, pct, tf, uf } from './claimKit'
