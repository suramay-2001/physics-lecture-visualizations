/**
 * Chapter Q2 numbers (Physics 709, "Coordinates, bases and turning frames"), computed once with the engine.
 * Plan: docs/roles/proposals/P-Q2-story.md; rulings docs/roles/decisions/qc709-Q2Q3.md.
 *
 * Same contract as Q1's `Q1.values.ts`: every number a learner reads in Q2 comes from `V` and is backed by a keyed
 * claim; the numpy twin of each key is in physics/__fixtures__/claims-qc709/q2.json (pipeline/claims_qc709/q2.py,
 * an independent route). A vector- or matrix-valued plan formula is stored as separate scalar keys (Re0/Re1/…,
 * Im0/Im1/…, or a row/column suffix for a matrix entry), because `V` is a flat `Record<string, number>` (the
 * claims reader compares one number per key). Booleans are 1/0 (`yes`).
 *
 * Photon engine fallback (P-Q2-story §9.1 E1: no physics/qc/optics.ts is added — Q2's brief keeps physics/** frozen).
 * A real polarization state at angle χ is `ketFromBloch(2χ, 0)`, exactly the plane arrow at angle χ (state-space
 * angles are half of lab/Bloch angles, so `planeVec` and `pol` are the same construction); |R⟩, |L⟩ are 448's
 * |±y⟩; a frame turned by χ is the spin rotation `rotation([0,1,0], −2χ)` (verified below against the notes' own
 * U(χ) = (cos χ, sin χ; −sin χ, cos χ), an ACTIVE rotation by −χ giving the PASSIVE relabelling by +χ).
 */
import { I, abs, c, expi } from '../../physics/complex'
import {
  apply,
  dagger,
  det2 as det2c,
  fromColumns,
  gramSchmidt,
  identity,
  inner,
  isUnitary,
  madd,
  mat,
  matEq,
  matmul,
  mscale,
  msub,
  norm,
  norm2,
  normalize,
  outer,
  vadd,
  vec,
  vscale,
  vsub,
  type Mat,
  type Vec,
} from '../../physics/linalg'
import { angleBetween, changeU, components, isIndependent, rankN } from '../../physics/qc/cmat'
import { H, I2 } from '../../physics/qc/gates'
import { ket } from '../../physics/qc/state'
import { benchTheory } from '../../physics/sg'
import { KET, SIGMA_Y, SX, SZ, blochAngle, ketFromBloch, projector, prob, rotation, samePhysicalState } from '../../physics/spin'
import { keyedClaim } from '../claimKit'

const yes = (b: boolean) => (b ? 1 : 0)
const DEG = Math.PI / 180
const vecClose = (a: Vec, b: Vec, eps = 1e-9) => norm(vsub(a, b)) < eps
const det2 = (M: Mat) => det2c(M).re

/** The real plane arrow at angle `deg` (0 = |+z⟩, 90 = |−z⟩): also 448's `ketFromBloch(2·deg°, 0)`. */
const planeVec = (deg: number): Vec => vec(Math.cos(deg * DEG), Math.sin(deg * DEG))
/** The photon's linear-polarization state at frame angle χ (degrees): the same construction as `planeVec`. */
const pol = planeVec
/** The frame turned by χ (degrees), as a spin rotation: the notes' U(χ) = (cos χ, sin χ; −sin χ, cos χ). */
const frameTurn = (chiDeg: number): Mat => rotation([0, 1, 0], -2 * chiDeg * DEG)

/** ψ, the chapter's running state: the plane arrow at 30° = ketFromBloch(π/3, 0) = (0.866, 0.5). */
const PSI30 = planeVec(30)
/** ψ's exact components in {|+z⟩, |−z⟩} (c1, c2): reused by q2Comp30* and by q2Printed, so no rounded literal drifts. */
const C30 = components(PSI30, [KET['+z'], KET['-z']])!
/** A = [[1,−1],[1,1]] (Fig. 6: a turn + a uniform stretch); K = [[1,1],[0,1]] (the shear, Unit 2.4 b3). */
const A: Mat = mat([
  [1, -1],
  [1, 1],
])
const K: Mat = mat([
  [1, 1],
  [0, 1],
])
const U_ZX = changeU([KET['+x'], KET['-x']])
/** ψ's exact components in {|+x⟩, |−x⟩} (d1, d2): reused by q2D30* and by q2Wrong* (the wrong-sign check, N4). */
const D30 = apply(U_ZX, PSI30)
const U_ZY = changeU([KET['+y'], KET['-y']])
const R = KET['+y'] // |R⟩ = (|x⟩ + i|y⟩)/√2
const L = KET['-y'] // |L⟩ = (|x⟩ − i|y⟩)/√2

/* q2-gram-schmidt: the 3D example of Fig. 4, computed once and read by both the beat and its challenges */
const GS3D = gramSchmidt([vec(1, 1, 0), vec(1, 0, 1), vec(0, 1, 1)])
/* the order-matters challenge: Gram–Schmidt on the 60° arrow first, then |+z⟩ */
const GS_ORDER = gramSchmidt([planeVec(60), KET['+z']])
/* Unit 2.2 b2/b3: Gram–Schmidt on |+z⟩, the 60° arrow */
const GS_ZB60 = gramSchmidt([KET['+z'], planeVec(60)])
/* Unit 2.2 b5: Gram–Schmidt on |+y⟩, |+z⟩ (complex) */
const GS_YZ = gramSchmidt([KET['+y'], KET['+z']])
/* q2-g-left challenge: |β1⟩ = |+z⟩, |β2⟩ = (0.6, 0.8) */
const GS_LEFT = gramSchmidt([KET['+z'], vec(0.6, 0.8)])

/** Σ_ij Aij |ei⟩⟨ej| for a 2×2 table `Aij` (the z-basis matrix elements) and an orthonormal basis (Unit 2.4 b5). */
function sumOuter(Aij: Mat, basis: Vec[]): Mat {
  let M: Mat = mscale(identity(2), 0)
  for (let i = 0; i < basis.length; i++) for (let j = 0; j < basis.length; j++) M = madd(M, mscale(outer(basis[i], basis[j]), Aij[i][j]))
  return M
}

export const V = {
  /* q2-basis */
  q2Dep: norm(vsub(KET['+x'], vscale(vadd(KET['+z'], KET['-z']), Math.SQRT1_2))), // 0
  q2DepZZX: yes(isIndependent([KET['+z'], KET['-z'], KET['+x']])), // 0 (dependent)
  q2IndepZX: yes(isIndependent([KET['+z'], KET['+x']])), // 1
  q2Dim: rankN(fromColumns([KET['+z'], KET['-z'], KET['+x']])), // 2
  q2AngZX: (angleBetween(KET['+z'], KET['+x']) * 180) / Math.PI, // 45
  q2Comp30Re0: C30[0].re, // 0.8660
  q2Comp30Re1: C30[1].re, // 0.5
  q2Orth: abs(inner(KET['+z'], KET['-z'])), // 0
  q2Comp30xRe0: components(PSI30, [KET['+x'], KET['-x']])![0].re, // 0.9659
  q2Comp30xRe1: components(PSI30, [KET['+x'], KET['-x']])![1].re, // 0.2588
  q2NonOrthRe0: components(KET['-z'], [KET['+z'], KET['+x']])![0].re, // −1
  q2NonOrthRe1: components(KET['-z'], [KET['+z'], KET['+x']])![1].re, // 1.4142
  q2NonOrthOvZ: inner(KET['+z'], KET['-z']).re, // 0
  q2NonOrthOvX: inner(KET['+x'], KET['-z']).re, // 0.7071
  q2BComp: inner(KET['+x'], vec(0.6, 0.8)).re, // 0.9899 (q2-b-comp)
  q2IndepXNegX: yes(isIndependent([KET['+x'], vscale(KET['+x'], -1)])), // 0 (q2-b-independent option 3)
  q2IndepZZero: yes(isIndependent([KET['+z'], vec(0, 0)])), // 0 (q2-b-independent option 4)

  /* q2-gram-schmidt */
  q2Gs60: inner(KET['+z'], planeVec(60)).re, // 0.5
  q2GsResRe0: GS_ZB60.steps[1].residual[0].re, // 0
  q2GsResRe1: GS_ZB60.steps[1].residual[1].re, // 0.8660
  q2GsResOrth: inner(KET['+z'], GS_ZB60.steps[1].residual).re, // 0
  q2GsE2Re0: GS_ZB60.steps[1].e[0].re, // 0
  q2GsE2Re1: GS_ZB60.steps[1].e[1].re, // 1
  q2Gs3DRes1Re0: GS3D.steps[1].residual[0].re, // 0.5
  q2Gs3DRes1Re1: GS3D.steps[1].residual[1].re, // −0.5
  q2Gs3DRes1Re2: GS3D.steps[1].residual[2].re, // 1
  q2Gs3DRes2Re0: GS3D.steps[2].residual[0].re, // −0.6667
  q2Gs3DRes2Re1: GS3D.steps[2].residual[1].re, // 0.6667
  q2Gs3DRes2Re2: GS3D.steps[2].residual[2].re, // 0.6667
  q2Gs3DOrthAll: yes(
    abs(inner(GS3D.basis[0], GS3D.basis[1])) < 1e-9 && abs(inner(GS3D.basis[0], GS3D.basis[2])) < 1e-9 && abs(inner(GS3D.basis[1], GS3D.basis[2])) < 1e-9,
  ), // 1
  q2GsYOv: inner(KET['+y'], KET['+z']).re, // 0.7071
  q2GsYResRe0: GS_YZ.steps[1].residual[0].re, // 0.5
  q2GsYResIm1: GS_YZ.steps[1].residual[1].im, // −0.5
  q2GsYE2: yes(vecClose(GS_YZ.basis[1], KET['-y'])), // 1
  q2GsDep: gramSchmidt([KET['+z'], KET['-z'], KET['+x']]).basis.length, // 2
  q2GLeft: norm(GS_LEFT.steps[1].residual), // 0.8
  q2G3DRes2Norm2: norm2(GS3D.steps[1].residual), // 1.5 (q2-g-3d: ⟨α'2|α'2⟩)
  q2GOrderE1Re0: GS_ORDER.basis[1][0].re, // 0.8660
  q2GOrderE1Re1: GS_ORDER.basis[1][1].re, // −0.5

  /* q2-spin-space */
  q2AmpExRe0: ketFromBloch(Math.PI / 3, Math.PI / 2)[0].re, // 0.8660
  q2AmpExIm1: ketFromBloch(Math.PI / 3, Math.PI / 2)[1].im, // 0.5
  q2AmpExP0: prob(KET['+z'], ketFromBloch(Math.PI / 3, Math.PI / 2)), // 0.75
  q2AmpExP1: prob(KET['-z'], ketFromBloch(Math.PI / 3, Math.PI / 2)), // 0.25
  q2XHalfPlus: benchTheory({ source: '+x', axes: ['z'], keep: [] }).plus, // 0.5
  q2XHalfMinus: benchTheory({ source: '+x', axes: ['z'], keep: [] }).minus, // 0.5
  q2XOrth: inner(KET['+x'], KET['-x']).re, // 0
  q2DeltaAt0: abs(inner(KET['+x'], normalize(vec(1, expi(0))))), // 1
  q2DeltaAt90: abs(inner(KET['+x'], normalize(vec(1, expi(Math.PI / 2))))), // 0.7071
  q2DeltaAt180: abs(inner(KET['+x'], normalize(vec(1, expi(Math.PI))))), // 0
  q2ZfromXPlusRe0: vscale(vadd(KET['+x'], KET['-x']), Math.SQRT1_2)[0].re, // 1
  q2ZfromXPlusRe1: vscale(vadd(KET['+x'], KET['-x']), Math.SQRT1_2)[1].re, // 0
  q2ZfromXMinusRe0: vscale(vsub(KET['+x'], KET['-x']), Math.SQRT1_2)[0].re, // 0
  q2ZfromXMinusRe1: vscale(vsub(KET['+x'], KET['-x']), Math.SQRT1_2)[1].re, // 1
  q2AngXX90: (angleBetween(KET['+x'], KET['-x']) * 180) / Math.PI, // 90
  q2AngXXBloch180: (blochAngle(KET['+x'], KET['-x']) * 180) / Math.PI, // 180
  q2Delta90Prob: prob(KET['+x'], normalize(vec(1, I))), // 0.5
  q2Delta90Same: yes(samePhysicalState(normalize(vec(1, I)), KET['+y'])), // 1
  q2SAngle: (angleBetween(KET['+z'], KET['-x']) * 180) / Math.PI, // 45 (q2-s-angle)
  q2ZXOverlap: abs(inner(KET['+z'], KET['+x'])), // 0.7071 (⟨+z|+x⟩ = ⟨+x|+z⟩: the amplitude size of |+x⟩ along z, and of |+z⟩ along x)

  /* q2-operators */
  q2ProjRank: rankN(projector(KET['+z'])), // 1
  q2FigAzRe0: apply(A, KET['+z'])[0].re, // 1
  q2FigAzRe1: apply(A, KET['+z'])[1].re, // 1
  q2FigAmzRe0: apply(A, KET['-z'])[0].re, // −1
  q2FigAmzRe1: apply(A, KET['-z'])[1].re, // 1
  q2FigAInner: inner(apply(A, KET['+z']), apply(A, KET['-z'])).re, // 0
  q2FigANorm: norm(apply(A, KET['+z'])), // 1.4142
  q2FigAAngle: (angleBetween(KET['+z'], apply(A, KET['+z'])) * 180) / Math.PI, // 45
  q2ShearRe0: apply(K, KET['-z'])[0].re, // 1
  q2ShearRe1: apply(K, KET['-z'])[1].re, // 1
  q2ShearInner: inner(apply(K, KET['+z']), apply(K, KET['-z'])).re, // 1
  q2ShearAngle: (angleBetween(apply(K, KET['+z']), apply(K, KET['-z'])) * 180) / Math.PI, // 45
  q2OuterRe00: outer(KET['+z'], KET['+x'])[0][0].re, // 0.7071
  q2OuterRe01: outer(KET['+z'], KET['+x'])[0][1].re, // 0.7071
  q2OuterRe10: outer(KET['+z'], KET['+x'])[1][0].re, // 0
  q2OuterRe11: outer(KET['+z'], KET['+x'])[1][1].re, // 0
  q2OuterPsiRe0: apply(outer(KET['+z'], KET['+x']), PSI30)[0].re, // 0.9659
  q2OuterPsiRe1: apply(outer(KET['+z'], KET['+x']), PSI30)[1].re, // 0
  q2OuterMxRe0: apply(outer(KET['+z'], KET['+x']), KET['-x'])[0].re, // 0
  q2OuterMxRe1: apply(outer(KET['+z'], KET['+x']), KET['-x'])[1].re, // 0
  q2OOuterZ: apply(outer(KET['+z'], KET['+x']), KET['-z'])[0].re, // 0.7071 (q2-o-outer)
  q2FacRe0: apply(A, PSI30)[0].re, // 0.3660
  q2FacRe1: apply(A, PSI30)[1].re, // 1.3660
  q2Aij00: A[0][0].re, // 1
  q2Aij01: A[0][1].re, // −1
  q2Aij10: A[1][0].re, // 1
  q2Aij11: A[1][1].re, // 1
  q2SumOuter: yes(matEq(sumOuter(A, [KET['+z'], KET['-z']]), A)), // 1 (Σ A_ij |e_i⟩⟨e_j| = A)
  q2Shift: norm(vadd(vec(0, 0), KET['+z'])), // 1

  /* q2-change */
  q2URe00: U_ZX[0][0].re, // 0.7071
  q2URe01: U_ZX[0][1].re, // 0.7071
  q2URe10: U_ZX[1][0].re, // 0.7071
  q2URe11: U_ZX[1][1].re, // −0.7071
  q2D30Re0: D30[0].re, // 0.9659
  q2D30Re1: D30[1].re, // 0.2588
  q2Px30Plus: prob(KET['+x'], PSI30), // 0.9330
  q2Px30Minus: prob(KET['-x'], PSI30), // 0.0670
  q2Printed: (C30[1].re - C30[0].re) / Math.SQRT2, // −0.2588 (the notes' Eq. 1.3 sign, N4)
  q2UnitZX: yes(isUnitary(U_ZX)), // 1
  q2UnitZY: yes(isUnitary(U_ZY)), // 1
  q2UyDag01Re: dagger(U_ZY)[0][1].re, // 0.7071
  q2UyDag10Im: dagger(U_ZY)[1][0].im, // 0.7071
  q2UyNotes01Im: inner(KET['-z'], KET['+y']).im, // 0.7071
  q2UyRight01Re: inner(KET['+z'], KET['-y']).re, // 0.7071
  q2SzXCheck: yes(matEq(matmul(matmul(U_ZX, SZ), dagger(U_ZX)), SX)), // 1 (U S_z U† = S_x)
  q2SzXTopRight: matmul(matmul(U_ZX, SZ), dagger(U_ZX))[0][1].re, // 0.5 (q2-c-sz)
  q2SzPsiXRe0: apply(U_ZX, apply(SZ, PSI30))[0].re, // 0.1294
  q2SzPsiXRe1: apply(U_ZX, apply(SZ, PSI30))[1].re, // 0.4830
  q2UisH: yes(matEq(U_ZX, H)), // 1
  q2HH: yes(matEq(matmul(H, H), I2)), // 1
  q2H0: yes(vecClose(apply(H, ket('0')), KET['+x'])), // 1
  q2WrongRe0: apply(dagger(U_ZX), vec(D30[0].re, -D30[1].re))[0].re, // 0.5
  q2WrongRe1: apply(dagger(U_ZX), vec(D30[0].re, -D30[1].re))[1].re, // 0.8660
  q2WrongSame: yes(samePhysicalState(apply(dagger(U_ZX), vec(D30[0].re, -D30[1].re)), planeVec(60))), // 1
  q2WrongPzPlus: prob(KET['+z'], planeVec(60)), // 0.25
  q2WrongPzMinus: prob(KET['-z'], planeVec(60)), // 0.75
  q2CU22: U_ZX[1][1].re, // −0.7071 (q2-c-u22)
  q2CD2: apply(U_ZX, vec(0.6, 0.8))[1].re, // −0.1414 (q2-c-d2)

  /* q2-photon */
  q2Pol45Re0: pol(45)[0].re, // 0.7071
  q2Pol45Re1: pol(45)[1].re, // 0.7071
  q2FrameU45Unitary: yes(isUnitary(frameTurn(45))), // 1
  q2DetUH: det2(H), // −1
  q2DetU45: det2(frameTurn(45)), // 1
  q2RRe0: R[0].re, // 0.7071
  q2RIm1: R[1].im, // 0.7071
  q2RL: abs(inner(R, L)), // 0
  q2PxR: prob(pol(0), R), // 0.5
  q2Rp45Re0: vscale(vadd(pol(45), vscale(pol(135), I)), Math.SQRT1_2)[0].re, // 0.5
  q2Rp45Im0: vscale(vadd(pol(45), vscale(pol(135), I)), Math.SQRT1_2)[0].im, // −0.5
  q2Rp45Re1: vscale(vadd(pol(45), vscale(pol(135), I)), Math.SQRT1_2)[1].re, // 0.5
  q2Rp45Im1: vscale(vadd(pol(45), vscale(pol(135), I)), Math.SQRT1_2)[1].im, // 0.5
  q2Rp45Phase: yes(vecClose(vscale(vadd(pol(45), vscale(pol(135), I)), Math.SQRT1_2), vscale(R, expi(-Math.PI / 4)))), // 1
  q2LpPhase: yes(vecClose(vscale(vsub(pol(45), vscale(pol(135), I)), Math.SQRT1_2), vscale(L, expi(Math.PI / 4)))), // 1
  q2JzR: yes(vecClose(apply(SIGMA_Y, R), R)), // 1
  q2JzL: yes(vecClose(apply(SIGMA_Y, L), vscale(L, -1))), // 1
  q2SandwichR: inner(R, apply(SIGMA_Y, R)).re, // 1 (q2-p-jz)
  q2FrameExp: yes(
    matEq(msub(mscale(identity(2), Math.cos(Math.PI / 6)), mscale(SIGMA_Y, c(0, Math.sin(Math.PI / 6)))), rotation([0, 1, 0], Math.PI / 3)),
  ), // 1 (cos χ I − i sin χ σ_y = rotation([0,1,0], 2χ), checked at χ = 30°)
  q2Malus45: prob(pol(0), pol(45)), // 0.5
  q2Spin45: prob(KET['+z'], ketFromBloch(Math.PI / 4, 0)), // 0.8536
  q2PolBloch45: (blochAngle(pol(0), pol(45)) * 180) / Math.PI, // 90
  q2FrameIsRy: yes(matEq(frameTurn(45), rotation([0, 1, 0], -Math.PI / 2))), // 1
  q2BergouOverlap: prob(vec(Math.cos(Math.PI / 6), c(0, Math.sin(Math.PI / 6))), vec(Math.cos(Math.PI / 6), Math.sin(Math.PI / 6))), // 0.625 (B35)
  q2Rot90P0: prob(pol(0), pol(90)), // 0
  q2Rot90P1: prob(R, vscale(R, expi(-Math.PI / 2))), // 1
  q2Rot90InnerIm: inner(R, vscale(R, expi(-Math.PI / 2))).im, // −1 (⟨R|R'⟩ = −i)
  q2Rp90isMinusIR: yes(vecClose(vscale(R, expi(-Math.PI / 2)), vscale(R, c(0, -1)))), // 1
  q2PMalus60: prob(pol(0), pol(60)), // 0.25 (q2-p-malus)
  q2PSpin60: prob(KET['+z'], ketFromBloch(Math.PI / 3, 0)), // 0.75 (q2-p-spin)
  q2PhaseCos30: expi(-Math.PI / 6).re, // 0.8660 (q2-p-phase)
} as const

export type ValueKey = keyof typeof V
export const claim = keyedClaim<ValueKey>()
export { close, d, pct, tf, uf } from '../claimKit'
