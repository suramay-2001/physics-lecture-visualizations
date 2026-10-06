/**
 * Chapter F2 numbers ("Vectors and inner products"), computed once with the engine (plan:
 * docs/roles/proposals/P-F2-story.md, ruling docs/roles/decisions/qc709-foundations-rulings.md). Every number a
 * learner reads in F2 comes from `V` and is backed by a keyed claim; the numpy twin of each key, computed by another
 * route, is in physics/__fixtures__/claims-qc709/f2.json (pipeline/claims_qc709/f2.py). Keys start with `f2`, unique
 * across both courses (content/values.ts refuses a duplicate).
 *
 * No new engine function is needed: every call here is an existing `physics/linalg.ts` or `physics/qc/cmat.ts`
 * function, exactly as the plan's §9.1 table lists (the comments in those files name these derivations by id).
 * A number the prose prints with a literal minus sign in front is stored as its SIZE (the `…Neg` convention of
 * F1.values.ts), because the ledger reads the digits, not the sign.
 */
import { abs, abs2 } from '../../physics/complex'
import { diag2, mat, norm, norm2, vadd, vec, vsub, vscale, bilinear, apply, matEq, identity } from '../../physics/linalg'
import { angleBetween, components, eigh, inner, isIndependent, madd, orthonormalize, outer, weightedInner } from '../../physics/qc/cmat'
import { KET } from '../../physics/spin'
import { I } from '../../physics/complex'
import { keyedClaim } from '../claimKit'

export { close, d, pct } from '../claimKit'

const yes = (b: boolean) => (b ? 1 : 0)

/** The example state of f2-orthonormal: 0.6|0⟩ + 0.8|1⟩, z-frame coordinates (0.6, 0.8). */
const PSI = vec(0.6, 0.8)
const Z_BASIS = [KET['+z'], KET['-z']]
const X_BASIS = [KET['+x'], KET['-x']]

/** The spin-1 S_x matrix in the |+1z⟩, |0z⟩, |−1z⟩ basis, ħ = 1 (ladder-operator matrix elements for j = 1): the
 *  only ad hoc physics input of `f2-gs-spin1`; everything downstream (eigenvalues, the GS residual) is the generic
 *  engine (`eigh`, `orthonormalize`), never typed by hand. */
const R2 = 1 / Math.sqrt(2)
const SX1 = mat([
  [0, R2, 0],
  [R2, 0, R2],
  [0, R2, 0],
])
/** The standard spin-1 S_x eigenstates |±1x⟩ (ladder-operator formula), used only to build the Gram–Schmidt input
 *  of `f2-gs-spin1`; the answer itself comes from `eigh` below, independently of these. */
const PLUS1X = vec(0.5, R2, 0.5)
const MINUS1X = vec(0.5, -R2, 0.5)
const Z1_PLUS = vec(1, 0, 0)
/** f2-gram-schmidt:b4: (1, i) then (0, 1), so the conjugation visibly matters. The "bare" route subtracts the
 *  UNconjugated shadow Σ e_i v_i and leaves a residual w with ⟨e1|w⟩ = −1.414i ≠ 0. */
const V2_C = vec(0, 1)
const GS_C = orthonormalize([vec(1, I), V2_C])
const BARE_RESID_C = vsub(V2_C, vscale(GS_C[0], bilinear(GS_C[0], V2_C)))
const GS_SPIN1 = orthonormalize([PLUS1X, MINUS1X, Z1_PLUS])

export const V = {
  /* f2-vectors */
  f2PlusXAmps: KET['+x'][0].re, // 0.7071: both amplitudes of |+x⟩ (the state has equal amplitudes)
  f2SumZX: norm(vadd(KET['+z'], KET['+x'])), // 1.8478: |+z⟩ + |+x⟩ has this length
  f2PlusZAmps: KET['+z'][0].re, // 1: the first amplitude of |+z⟩ = (1, 0)
  f2MinusXAmps: KET['-x'][0].re, // 0.7071: the size of each amplitude of |-x⟩ = (0.7071, -0.7071)
  f2DepThree: yes(isIndependent([vec(1, 0), vec(0, 1), vec(1, 1)])), // 0: (1,1) = (1,0)+(0,1), dependent
  f2VAmp: KET['-x'][1].re, // -0.7071: the second number of |-x⟩ (challenge f2-v-amp)
  f2VSuper: PSI[1].re, // 0.8: the coefficient of |1⟩ in 0.6|0⟩ + 0.8|1⟩

  /* f2-inner-product */
  f2InnerZX: inner(KET['+z'], KET['+x']).re, // 0.7071: ⟨+z|+x⟩
  f2InnerXY: inner(KET['+x'], KET['+y']).re, // 0.5: Re⟨+x|+y⟩
  f2InnerXYIm: inner(KET['+x'], KET['+y']).im, // 0.5: Im⟨+x|+y⟩
  f2InnerYX: inner(KET['+y'], KET['+x']).re, // 0.5: Re⟨+y|+x⟩ (same as InnerXY's real part)
  f2InnerYXImNeg: -inner(KET['+y'], KET['+x']).im, // 0.5: the conjugate's imaginary part is -0.5
  f2InnerYY: inner(KET['+y'], KET['+y']).re, // 1: ⟨+y|+y⟩, the honest squared length
  f2BilinearYY: bilinear(KET['+y'], KET['+y']).re, // 0: the un-conjugated "forgot the mirror" product
  f2WeightedXZ: weightedInner(diag2(2, 1), KET['+x'], KET['+z']).re, // 1.4142: weighted inner product, weights (2,1)
  f2InnerXYabs2: abs2(inner(KET['+x'], KET['+y'])), // 0.5: |⟨+x|+y⟩|²
  f2PlusYAmpSq: abs2(KET['+y'][0]), // 0.5: the squared size of each entry of |+y⟩ (the ½ in the bilinear example)

  /* f2-norm-angle */
  f2NormZplusX: norm(vadd(KET['+z'], KET['+x'])), // 1.8478 (same route as f2SumZX, a second claim of the same fact)
  f2NormPlusX: norm(KET['+x']), // 1: |+x⟩ is a unit state
  f2OrthXmX: inner(KET['+x'], KET['-x']).re, // 0: ⟨+x|-x⟩
  f2OrthZmZ: inner(KET['+z'], KET['-z']).re, // 0: ⟨+z|-z⟩
  f2PythVal: norm2(vadd(KET['+x'], KET['-x'])), // 2: ‖+x⟩ + |-x⟩‖² = 1 + 1
  f2AngleZX: (angleBetween(KET['+z'], KET['+x']) * 180) / Math.PI, // 45: the angle between |+z⟩ and |+x⟩, in degrees
  f2AngleXmX: (angleBetween(KET['+x'], KET['-x']) * 180) / Math.PI, // 90: the angle between |+x⟩ and |-x⟩
  f2CS: abs(inner(KET['+z'], KET['+x'])), // 0.7071: |⟨+z|+x⟩| ≤ 1 (Cauchy-Schwarz)
  f2TriStrict: norm(vadd(KET['+z'], KET['-z'])), // 1.4142: ‖+z⟩ + |-z⟩‖ < 1 + 1 (orthogonal: strict)
  f2TriEqual: norm(vadd(vec(1, 0), vec(2, 0))), // 3: ‖(1,0) + (2,0)‖ = 1 + 2 (parallel: equality)

  /* f2-orthonormal */
  f2IndepZmZ: yes(isIndependent(Z_BASIS)), // 1: {|+z⟩, |-z⟩} is independent
  f2CompZ: (components(PSI, Z_BASIS) ?? [])[0].re, // 0.6: the z-frame first coordinate of ψ
  f2CompZ2: (components(PSI, Z_BASIS) ?? [])[1].re, // 0.8: the z-frame second coordinate of ψ
  f2CompX: (components(PSI, X_BASIS) ?? [])[0].re, // 0.9899: the x-frame first coordinate of ψ
  f2CompXNeg: -(components(PSI, X_BASIS) ?? [])[1].re, // 0.1414: the size of the x-frame second coordinate (-0.1414)
  f2ParsevalX: norm2(components(PSI, X_BASIS) ?? []), // 1: the x-frame coordinates' squares still sum to 1
  f2Completeness: yes(matEq(madd(outer(KET['+z'], KET['+z']), outer(KET['-z'], KET['-z'])), identity(2), 1e-12)), // 1: |0⟩⟨0| + |1⟩⟨1| = I, every entry

  /* f2-gram-schmidt */
  f2IndepXZb: yes(isIndependent([KET['+x'], KET['+z']])), // 1 (a second use of the same independence fact, D6's setup)
  f2GsUnitShadow: inner(KET['+x'], KET['+z']).re, // 0.7071: ⟨+x|+z⟩, the shadow coefficient
  f2GsUnitResid: vsub(KET['+z'], vscale(KET['+x'], inner(KET['+x'], KET['+z']).re))[0].re, // 0.5: the residual's first entry
  f2GsUnitResidNeg: -vsub(KET['+z'], vscale(KET['+x'], inner(KET['+x'], KET['+z']).re))[1].re, // 0.5: size of the residual's second entry (-0.5)
  f2GsUnitE1: orthonormalize([KET['+x'], KET['+z']])[0][0].re, // 0.7071: e1's first entry
  f2GsUnitE2: orthonormalize([KET['+x'], KET['+z']])[1][0].re, // 0.7071: e2's first entry
  f2GsUnitE2Neg: -orthonormalize([KET['+x'], KET['+z']])[1][1].re, // 0.7071: size of e2's second entry (-0.7071)
  f2GsCE1: GS_C[0][1].im, // 0.7071: e1's second entry, the imaginary part
  f2GsCE2First: GS_C[1][0].im, // 0.7071: e2 = (i, 1)/√2, so its FIRST entry is purely imaginary
  f2GsCOrtho: yes(abs(inner(GS_C[0], GS_C[1])) < 1e-9), // 1: e1 ⊥ e2
  f2GsComplexSize: abs(GS_C[0][1]), // 0.7071: |second entry of e1|
  f2GsCBareGap: abs(inner(GS_C[0], BARE_RESID_C)), // 1.4142: without the mirror the leftover is NOT orthogonal to e1
  f2IndepFalse: yes(isIndependent([vec(1, 1), vec(2, 2)])), // 0: (1,1) and (2,2) are dependent
  f2GsDepLen: orthonormalize([vec(1, 1), vec(2, 2)]).length, // 1: Gram-Schmidt keeps only one frame vector

  /* f2-gs-spin1 (709 HW1 P5, submitted: docs/roles/decisions/homework-status.md) */
  f2GsSpin1: eigh(SX1).values[1], // 0: the middle eigenvalue of spin-1 S_x, found independently of the GS construction
  f2GsSpin1E0: GS_SPIN1[2][0].re, // 0.7071: the first z-component of the Gram–Schmidt leftover (1, 0, −1)/√2 (the challenge answer)
  f2GsSpin1SxNorm: norm(apply(SX1, GS_SPIN1[2])), // 0: ‖S_x·leftover‖, so the leftover really is the 0 eigenstate
} as const

export type F2Key = keyof typeof V
export const claim = keyedClaim<F2Key>()
