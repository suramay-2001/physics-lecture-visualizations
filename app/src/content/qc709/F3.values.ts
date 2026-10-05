/**
 * Chapter F3 numbers ("Matrices and linear maps"), computed once with the engine (plan:
 * docs/roles/proposals/P-F3-story.md §1/§4; rulings docs/roles/decisions/qc709-foundations.md,
 * qc709-foundations-rulings.md). Every number a learner reads in F3 comes from `V` and is backed by a keyed claim;
 * the numpy twin of each key, computed by another route, is in physics/__fixtures__/claims-qc709/f3.json
 * (pipeline/claims_qc709/f3.py). Keys start with `f3`, unique across both courses (content/values.ts refuses a
 * duplicate).
 *
 * No new engine function is needed (plan §9.1): every number comes from `physics/linalg.ts` (`apply`, `matmul`,
 * `dagger`, `outer`, `identity`, `inner`, `isHermitian`, `matEq`, `mscale`, `madd`), `physics/qc/gates.ts` (`X`, `Y`,
 * `Z`, `H`, `S`) and `physics/qc/cmat.ts` (`changeU`).
 */
import { apply, dagger, identity, inner, isHermitian, madd, matEq, matmul, mscale, outer, vec } from '../../physics/linalg'
import { changeU } from '../../physics/qc/cmat'
import { H, S, X, Y, Z } from '../../physics/qc/gates'
import { KET } from '../../physics/spin'
import { keyedClaim } from '../claimKit'

export { close, d, pct } from '../claimKit'

const yes = (b: boolean) => (b ? 1 : 0)

// z→x change of basis (notes n2 §I.C.4): U_ij = ⟨new_i|old_j⟩, the engine's changeU; U = H for this pair.
const U = changeU([KET['+x'], KET['-x']])

export const V = {
  /* f3-linear-maps */
  f3Xplusz: apply(X, KET['+z'])[1].re, // 1: X|+z⟩ = |−z⟩ = (0, 1)
  f3Xminusz: apply(X, KET['-z'])[0].re, // 1: X|−z⟩ = |+z⟩ = (1, 0)
  f3Zminusz: apply(Z, KET['-z'])[1].re, // −1: Z|−z⟩ = −|−z⟩
  f3ProjZ: apply(outer(KET['+z'], KET['+z']), vec(0.6, 0.8))[1].re, // 0: |0⟩⟨0| drops the second part
  f3Identity: apply(identity(2), KET['+x'])[0].re, // 0.7071: I leaves |+x⟩ alone
  f3SquareNonlinear: 2 ** 2 - 2 * 1, // 2: squaring quadruples (2,0)→(4,0); doubling (1,0)→(2,0) only doubles it
  /* f3-matrix-of-map */
  f3MatX: inner(KET['-z'], apply(X, KET['+z'])).re, // 1: the (1,0) entry of X's table
  f3ActionHc: apply(H, vec(0.6, 0.8))[0].re, // 0.9899: H(0.6, 0.8), first entry
  f3MatH: H[1][1].re, // −0.7071: the one negative entry of H
  f3XouterSum: madd(outer(KET['+z'], KET['-z']), outer(KET['-z'], KET['+z']))[0][1].re, // 1: rebuilds X's (0,1) entry
  f3XelemZmz: inner(KET['+z'], apply(X, KET['-z'])).re, // 1: ⟨0|X|1⟩
  /* f3-products */
  f3HX: matmul(H, X)[0][0].re, // 0.7071: HX's (0,0) entry
  f3HXH: matmul(matmul(H, X), H)[1][1].re, // −1: HXH = Z, so (1,1) = −1
  f3HZH: matmul(matmul(H, Z), H)[0][1].re, // 1: HZH = X, so (0,1) = 1
  f3XZ: matmul(X, Z)[0][1].re, // −1: XZ's (0,1) entry
  f3ZX: matmul(Z, X)[0][1].re, // 1: ZX's (0,1) entry
  f3XZeqNegZX: yes(matEq(matmul(X, Z), mscale(matmul(Z, X), -1))), // 1: XZ = −ZX
  f3Xsq: matmul(X, X)[0][0].re, // 1: X² = I
  f3Hsq: matmul(H, H)[0][0].re, // 1: H² = I
  /* f3-adjoint */
  f3Sdag: dagger(S)[1][1].im, // −1: S† = diag(1, −i)
  f3SdagEntry: inner(KET['-z'], apply(dagger(S), KET['-z'])).im, // −1: ⟨1|S†|1⟩, an independent route to the same fact
  f3ProdDag: yes(matEq(dagger(matmul(X, Z)), matmul(Z, X))), // 1: (XZ)† = Z†X† = ZX
  f3OuterDag: yes(matEq(dagger(outer(KET['+z'], KET['-z'])), outer(KET['-z'], KET['+z']))), // 1: (|0⟩⟨1|)† = |1⟩⟨0|
  f3Hdag: yes(matEq(dagger(H), H)), // 1: H is Hermitian
  f3Xdag: yes(matEq(dagger(X), X)), // 1: X is Hermitian
  f3SdagS: matmul(dagger(S), S)[0][0].re, // 1: S†S = I, so S is unitary
  f3SHermGap: yes(matEq(dagger(S), S)), // 0: S is NOT Hermitian (S† ≠ S)
  f3YHerm: yes(isHermitian(Y)), // 1: Y is Hermitian
  /* f3-change-of-basis */
  f3Ux: U[0][0].re, // 0.7071: U for z→x is H
  f3PluszInX: apply(U, KET['+z'])[0].re, // 0.7071: |+z⟩'s new (x-frame) coordinates
  f3InnerPlusXZ: inner(KET['+x'], KET['+z']).re, // 0.7071: ⟨+x|+z⟩, the same overlap directly
  f3ZinX: matmul(matmul(U, Z), dagger(U))[0][1].re, // 1: Z in the x frame, UZU† = X, so (0,1) = 1
  f3Uunitary: matmul(dagger(U), U)[0][0].re, // 1: U†U = I
  f3XinX: matmul(matmul(U, X), dagger(U))[0][0].re, // 1: X in the x frame, UXU† = Z, so (0,0) = 1
} as const

export type F3Key = keyof typeof V
export const claim = keyedClaim<F3Key>()
