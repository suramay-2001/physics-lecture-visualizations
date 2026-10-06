/**
 * Chapter F4 numbers ("Eigenvalues, Hermitian and unitary operators, the spectral theorem"), computed once with the
 * engine (plan: docs/roles/proposals/P-F4-story.md §1/§2/§4; rulings docs/roles/decisions/qc709-foundations.md,
 * qc709-foundations-rulings.md). Every number a learner reads in F4 comes from `V` and is backed by a keyed claim;
 * the numpy twin of each key, computed by another route, is in physics/__fixtures__/claims-qc709/f4.json
 * (pipeline/claims_qc709/f4.py). Keys start with `f4`, unique across both courses (content/values.ts refuses a
 * duplicate).
 *
 * No new engine function is needed (plan §9.1): every number comes from `physics/qc/cmat.ts` (`eigh`, `fromEigen`,
 * `funcHermitian`, `expmHermitian`, `simultaneousEigenbasis`, `sqrtPSD`, `svd`, `kronM`, `detN`, `traceN`,
 * `projectorOnto`, `isHermitian`, `isUnitary`, `matEq`, `maxDiff`), `physics/operators.ts` (`eigen2`, `charPoly2` via
 * `physics/linalg.ts`, `commutator`, `unitaryAction`), `physics/linalg.ts` (`mat`, `vec`, `madd`, `mscale`, `matmul`,
 * `dagger`, `outer`, `inner`, `apply`, `identity`, `norm`), `physics/qc/gates.ts` (`X`, `Z`, `H`, `S`) and
 * `physics/spin.ts` (`KET`, `blochAngles`).
 *
 * Phase convention (BUILD-LOG "Locked decisions"): `eigh`/`eigen2` return eigenvectors with their first
 * non-negligible component real ≥ 0 (`canonicalPhase`). Component-level figures (e.g. the λ = −0.707 eigenvector of
 * ½(X+Z)) are therefore interpolated straight from `V` in F4.story.ts rather than typed as a literal, so the shown
 * text can never drift from whatever sign the engine's convention actually produces.
 */
import { c } from '../../physics/complex'
import { charPoly2, commutator } from '../../physics/linalg'
import { apply, dagger, identity, inner, isHermitian, isUnitary, madd, mat, matEq, matmul, maxDiff, mscale, norm, outer, vec } from '../../physics/linalg'
import {
  detN,
  eigh,
  expmHermitian,
  fromEigen,
  funcHermitian,
  kronM,
  projectorOnto,
  simultaneousEigenbasis,
  sqrtPSD,
  svd,
  traceN,
} from '../../physics/qc/cmat'
import { H, S, X, Z } from '../../physics/qc/gates'
import { eigen2, unitaryAction } from '../../physics/operators'
import { blochAngles, KET } from '../../physics/spin'
import { keyedClaim } from '../claimKit'

export { close, d, pct } from '../claimKit'

const yes = (b: boolean) => (b ? 1 : 0)

/* ---------------------------------------------------------------------------------------------- */
/* Running examples (plan §0 "Running examples")                                                    */
/* ---------------------------------------------------------------------------------------------- */

const I2 = identity(2)
const XZhalf = mscale(madd(X, Z), 0.5) // ½(X + Z): eigenvalues ±1/√2, eigenvectors |±n⟩ at 45°/135°
const Pplusx = outer(KET['+x'], KET['+x']) // |+x⟩⟨+x|: eigenvalues 1, 0
const halfIplusX = mscale(madd(I2, X), 0.5) // ½(I + X) — equals the same projector P+x
const R = mat([
  [0, -1],
  [1, 0],
]) // the quarter-turn: non-Hermitian, eigenvalues ±i
const N = mat([
  [2, 1],
  [0, 2],
]) // the shear: defective, one eigenvalue 2, one eigenvector
const ZZ = kronM(Z, Z) // Z⊗Z (Chapter F6's language, used here as a given 4×4 table): eigenvalues ±1, each doubly degenerate
const HermEx1 = mat([
  [2, c(0, 1)],
  [c(0, -1), 2],
]) // [[2, i], [-i, 2]]: a Hermitian example with complex entries, eigenvalues 1, 3
const Diag49 = mat([
  [4, 0],
  [0, 9],
]) // a positive diagonal table: its square root is diag(2, 3)
const IplusXZhalf = madd(I2, XZhalf) // I + ½(X + Z): positive but not a projector, eigenvalues 1 ± 1/√2
const P0 = outer(KET['+z'], KET['+z']) // |0⟩⟨0| = diag(1, 0)

/* ---------------------------------------------------------------------------------------------- */
/* Derived quantities                                                                               */
/* ---------------------------------------------------------------------------------------------- */

const eighXZ = eigh(XZhalf)
const eighX = eigh(X)
const eighZ = eigh(Z)
const eighZZ = eigh(ZZ)
const eighProj = eigh(Pplusx)
const eighHerm1 = eigh(HermEx1)
const eighIXZ = eigh(IplusXZhalf)
const eigen2R = eigen2(R)
const charPolyR = charPoly2(R)
const eigen2N = eigen2(N)
const eigen2S = eigen2(S)
const svdN = svd(N)
const sqrtDiag = sqrtPSD(Diag49)
const funcX2 = funcHermitian(X, (a) => a * a)
const funcZ2 = funcHermitian(Z, (a) => a * a)
const eighFuncX2 = eigh(funcX2)
const fromEigenX = fromEigen([1, -1], [KET['+x'], KET['-x']])
const fromEigenI = fromEigen([1, 1], [KET['+x'], KET['-x']])
const sqrtHalfIX = sqrtPSD(halfIplusX)
const eighSqrtHalfIX = eigh(sqrtHalfIX)
const commXZ = commutator(X, Z)
const commIX = commutator(I2, X)
const simulZP = simultaneousEigenbasis(Z, P0)
const simulXZ = simultaneousEigenbasis(X, Z)
const unitaryHalfZ = unitaryAction(mscale(Z, 0.5), Math.PI / 2) // e^{-i(½σ_z)(π/2)}
const unitaryZ = unitaryAction(Z, Math.PI / 2) // e^{-iσ_z(π/2)}
const expHalfZPi = expmHermitian(mscale(Z, 0.5), Math.PI) // e^{-i(½σ_z)π}
const expZQuarter = expmHermitian(Z, Math.PI / 4) // e^{-iσ_z(π/4)}
const expHalfZHalfPi = expmHermitian(mscale(Z, 0.5), Math.PI / 2) // e^{-i(½σ_z)(π/2)}
const plusXAngles = blochAngles(KET['+x'])

// Z⊗Z's two eigenspaces, split by sign, for the n-dimensional spectral sum P+ − P−
const zzPlusVectors = eighZZ.vectors.filter((_, i) => eighZZ.values[i] > 0)
const zzMinusVectors = eighZZ.vectors.filter((_, i) => eighZZ.values[i] < 0)
const zzSpectral = madd(projectorOnto(zzPlusVectors), mscale(projectorOnto(zzMinusVectors), -1))

// The commuting pair (σ_z, P+z): which value of P0 pairs with which value of Z
const simulPlusIdx = simulZP ? simulZP.valuesA.findIndex((v) => v > 0) : -1
const simulMinusIdx = simulZP ? simulZP.valuesA.findIndex((v) => v < 0) : -1

export const V = {
  /* f4-eigen */
  f4XZvalLow: eighXZ.values[0], // −0.7071
  f4XZvalHigh: eighXZ.values[1], // +0.7071
  f4XZvecPlus0: eighXZ.vectors[1][0].re, // 0.9239
  f4XZvecPlus1: eighXZ.vectors[1][1].re, // 0.3827
  f4XZtr: traceN(XZhalf).re, // 0
  f4XZdet: detN(XZhalf).re, // −0.5
  f4XZpolyDet: charPoly2(XZhalf)[2].re, // −0.5, an independent cross-check via the characteristic polynomial
  f4XZgap: eighXZ.values[1] - eighXZ.values[0], // 1.4142
  f4ZZvalLow: eighZZ.values[0], // −1
  f4ZZvalHigh: eighZZ.values[3], // 1
  f4ShearEigVal: eigen2N.values[0].re, // 2
  f4ShearVecCount: eigen2N.vectors.length, // 1 (defective)
  f4RPoly0: charPolyR[0].re, // 1
  f4RPoly1: charPolyR[1].re, // 0
  f4RPoly2: charPolyR[2].re, // 1
  f4RValRe: eigen2R.values[0].re, // 0
  f4RValIm: Math.abs(eigen2R.values[0].im), // 1
  /* f4-hermitian */
  f4XHerm: yes(isHermitian(X)), // 1
  f4XEqAdj: yes(matEq(X, dagger(X))), // 1
  f4XvalLow: eighX.values[0], // −1
  f4XvalHigh: eighX.values[1], // 1
  f4XZvecMinus0: eighXZ.vectors[0][0].re,
  f4XZvecMinus1: eighXZ.vectors[0][1].re,
  f4XZorth: Math.abs(inner(eighXZ.vectors[1], eighXZ.vectors[0]).re), // 0
  f4ZZplusRank: zzPlusVectors.length, // 2
  /* f4-spectral */
  f4XspectralGap: maxDiff(fromEigenX, X), // 0
  f4XsqIsI: maxDiff(funcX2, I2), // 0
  f4XZsqrtValLow: eighSqrtHalfIX.values[0], // 0
  f4XZsqrtValHigh: eighSqrtHalfIX.values[1], // 1
  f4ZZprojDiff: maxDiff(zzSpectral, ZZ), // 0
  f4ZsqIsI: maxDiff(funcZ2, I2), // 0
  f4XsqEigVal: eighFuncX2.values[0], // 1 (both eigenvalues of X² = I)
  f4SpectralRebuildTR: fromEigenX[0][1].re, // 1
  /* f4-unitary */
  f4Hunitary: yes(isUnitary(H)), // 1
  f4HdH: maxDiff(matmul(dagger(H), H), I2), // 0
  f4HonZero0: apply(H, KET['+z'])[0].re, // 0.7071
  f4HonZero1: apply(H, KET['+z'])[1].re, // 0.7071
  f4HpreservesNorm: norm(apply(H, vec(0.6, c(0, 0.8)))), // 1
  f4SAbsEig: Math.hypot(eigen2S.values[0].re, eigen2S.values[0].im), // 1
  f4RzQuarterRe: expZQuarter[0][0].re, // 0.7071
  f4RzQuarterIm: expZQuarter[0][0].im, // −0.7071
  f4RzActionAngle: unitaryHalfZ ? unitaryHalfZ.angle : Number.NaN, // 1.5708
  f4RzEigRe: expHalfZHalfPi[0][0].re, // 0.7071
  f4RzEigIm: expHalfZHalfPi[0][0].im, // −0.7071
  f4RzHalfPiAngleDeg: (unitaryZ ? unitaryZ.angle : Number.NaN) * (180 / Math.PI), // 180
  f4XIsUnitary: yes(isUnitary(X)), // 1
  /* f4-commuting */
  f4ZPsimulOk: yes(simulZP !== null), // 1
  f4ZPvalBatPlus: simulZP && simulPlusIdx >= 0 ? simulZP.valuesB[simulPlusIdx] : Number.NaN, // 1 (P+z when σ_z = +1)
  f4ZPvalBatMinus: simulZP && simulMinusIdx >= 0 ? simulZP.valuesB[simulMinusIdx] : Number.NaN, // 0 (P+z when σ_z = −1)
  f4XZcomm: Math.max(...commXZ.flat().map((x) => Math.hypot(x.re, x.im))), // 2 = maxAbs([X,Z])
  f4XZnoSimul: yes(simulXZ === null), // 1
  f4Icomm: Math.max(...commIX.flat().map((x) => Math.hypot(x.re, x.im))), // 0
  f4IbasisDiff: maxDiff(fromEigenI, I2), // 0
  /* f4-positive */
  f4ProjValLow: eighProj.values[0], // 0
  f4ProjValHigh: eighProj.values[1], // 1
  f4ZvalNeg: eighZ.values[0], // −1
  f4HalfIXisProj: maxDiff(halfIplusX, Pplusx), // 0
  f4SqrtProjDiff: maxDiff(sqrtPSD(Pplusx), Pplusx), // 0
  f4ShearSV0: svdN.s[0], // 2.5616
  f4ShearSV1: svdN.s[1], // 1.5616
  f4PosNotProjLow: eighIXZ.values[0], // 0.2929
  f4PosNotProjHigh: eighIXZ.values[1], // 1.7071
  f4ProjIdemDiff: maxDiff(matmul(Pplusx, Pplusx), Pplusx), // 0
  /* challenges */
  f4ETrace: traceN(fromEigen([3, -1], [vec(1, 0), vec(0, 1)])).re, // 2
  f4HermEx1Max: eighHerm1.values[1], // 3
  f4PlusMinusXOverlap: Math.abs(inner(KET['+x'], KET['-x']).re), // 0
  f4GsAngleDeg: plusXAngles.theta * (180 / Math.PI), // 90
  f4SqrtDiag49Val: sqrtDiag[1][1].re, // 3
  f4ExpHalfZPiRe: expHalfZPi[0][0].re, // 0 (e^{-i(½σ_z)π} = diag(−i, i); the real part of each entry is 0)
  f4Half: 0.5, // the coefficient ½ used throughout (e.g. ½(X+Z), ½(I+X)); a bare constant, not an engine call
} as const

export type F4Key = keyof typeof V
export const claim = keyedClaim<F4Key>()
