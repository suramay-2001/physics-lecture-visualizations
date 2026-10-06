/**
 * Chapter F6 numbers ("Tensor products"), computed once with the engine (plan: docs/roles/proposals/P-F6-story.md
 * §1/§2/§4; rulings docs/roles/decisions/qc709-foundations.md, qc709-foundations-rulings.md). Every number a learner
 * reads in F6 comes from `V` and is backed by a keyed claim; the numpy twin of each key, computed by another route,
 * is in physics/__fixtures__/claims-qc709/f6.json (pipeline/claims_qc709/f6.py). Keys start with `f6`, unique across
 * both courses (content/values.ts refuses a duplicate).
 *
 * No new engine function is needed (rulings doc): every number comes from physics/qc/state.ts (`nQubits`,
 * `indexOfBits`, `bitsOfIndex`, `kron`, `ket`, `bell`, `ghz`, `coefMatrix`, `schmidtRank`, `isProduct`, `paramCount`),
 * physics/qc/cmat.ts (`kronM`, `detN`), physics/qc/gates.ts (`X`, `Z`, `I2`, `H`) and physics/linalg.ts (`apply`,
 * `matmul`, `matEq`, `maxDiff`, `inner`, `norm`, `vec`).
 */
import { mul } from '../../physics/complex'
import { apply, inner, mat, matEq, matmul, maxDiff, norm, vadd, vsub } from '../../physics/linalg'
import { bell, bitsOfIndex, coefMatrix, ghz, indexOfBits, isProduct, ket, kron, nQubits, paramCount, schmidtRank } from '../../physics/qc/state'
import { detN, kronM } from '../../physics/qc/cmat'
import { H, I2, X, Z } from '../../physics/qc/gates'
import { KET } from '../../physics/spin'
import { close, keyedClaim } from '../claimKit'

export { close, d, pct } from '../claimKit'

const yes = (b: boolean) => (b ? 1 : 0)

// the X⊗I block table, written out by hand to check against the engine's kronM
const XI_BY_HAND = mat([
  [0, 0, 1, 0],
  [0, 0, 0, 1],
  [1, 0, 0, 0],
  [0, 1, 0, 0],
])

export const V = {
  /* f6-pairs */
  f6TwoQDim: 2 ** nQubits(ket('00')), // 4: two qubits, 2×2 joint states
  f6DimRule: 2 * 2, // 4: dim(V⊗W) = dim V · dim W
  f6Idx10: indexOfBits('10'), // 2: |10⟩'s big-endian index
  f6Bits3: Number(bitsOfIndex(3, 2)), // 11: bitsOfIndex(3, 2) = '11'
  f6Strings: 2 ** 3, // 8: 3 bits give 2^3 strings
  f6Idx110: indexOfBits('110'), // 6: |110⟩'s big-endian index
  f6RegLen: ghz(2).length, // 4: a two-qubit register has 4 amplitudes
  f6RegAmp: bell('00+11')[0].re, // 0.7071: one nonzero amplitude of the two-atom register example
  f6TenDim: 2 ** 10, // 1024: ten qubits
  f6AddWrong: 2 * 10, // 20: what adding (wrongly) would give
  /* f6-kron */
  f6PlusZero: yes(close(kron(KET['+x'], KET['+z'])[0].re, Math.SQRT1_2) && close(kron(KET['+x'], KET['+z'])[2].re, Math.SQRT1_2)), // 1: |+0⟩'s nonzero amplitudes
  f6PlusZeroRe: kron(KET['+x'], KET['+z'])[0].re, // 0.7071: |+0⟩'s first amplitude
  f6PlusMinus: yes(close(kron(KET['+x'], KET['-x'])[1].re, -0.5)), // 1: |+−⟩'s second amplitude is negative
  f6PlusMinusRe: kron(KET['+x'], KET['-x'])[0].re, // 0.5: |+−⟩'s first amplitude
  f6Idx01: indexOfBits('01'), // 1: |01⟩'s big-endian index
  /* f6-operator */
  f6XI: yes(matEq(kronM(X, I2), XI_BY_HAND)), // 1: X⊗I matches the hand-built block table
  f6XIdim: kronM(X, I2).length, // 4: X⊗I is 4×4
  f6XInonzeroFrac: kronM(X, I2).flat().filter((z) => Math.hypot(z.re, z.im) > 1e-9).length / 16, // 0.25: 4 of 16 entries are nonzero
  f6XIon01: yes(norm(vsub(apply(kronM(X, I2), ket('01')), ket('11'))) < 1e-9), // 1: (X⊗I)|01⟩ = |11⟩
  f6Idx11: indexOfBits('11'), // 3: |11⟩'s index
  f6LocalCommute: maxDiff(matmul(kronM(X, I2), kronM(I2, Z)), matmul(kronM(I2, Z), kronM(X, I2))), // 0: local operators on different parts commute
  f6XIIXcommute: maxDiff(matmul(kronM(X, I2), kronM(I2, X)), matmul(kronM(I2, X), kronM(X, I2))), // 0: X⊗I and I⊗X commute (the operator:b4 reveal)
  f6ZZon01: yes(norm(vadd(apply(kronM(Z, Z), ket('01')), ket('01'))) < 1e-9), // 1: (Z⊗Z)|01⟩ = −|01⟩ (the operator Try-it)
  f6XIon0Plus: yes(norm(vsub(apply(kronM(X, I2), kron(KET['+x'], KET['+z'])), kron(KET['+x'], KET['+z']))) < 1e-9), // 1: (X⊗I)|+0⟩ = |+0⟩, since X|+⟩ = |+⟩ (the operator Try-it)
  f6XIeqIX: yes(matEq(kronM(X, I2), kronM(I2, X))), // 0: X⊗I ≠ I⊗X
  f6IXon01: yes(norm(vsub(apply(kronM(I2, X), ket('01')), ket('00'))) < 1e-9), // 1: (I⊗X)|01⟩ = |00⟩, index 0
  /* f6-product-or-not */
  f6ProdDet: detN(coefMatrix(ket('++'))).re, // 0: |++⟩ is a product
  f6ProdEntry: coefMatrix(ket('++'))[0][0].re, // 0.5: every entry of |++⟩'s coefficient matrix
  f6ProdIsProduct: yes(isProduct(ket('++'))), // 1
  f6BellDet: detN(coefMatrix(bell('00+11'))).re, // 0.5: the Bell state is entangled
  f6BellSchmidt: schmidtRank(bell('00+11')), // 2
  f6BellEntangled: yes(isProduct(bell('00+11'))), // 0: NOT a product
  f6BellSchmidtX: schmidtRank(apply(kronM(H, H), bell('00+11'))), // 2: still rank 2 in the x basis
  f6Psi01isProduct: yes(isProduct(bell('01+10'))), // 0: Ψ+ is entangled too
  /* f6-growth */
  f6ProdNorm: norm(kron(KET['+x'], KET['-x'])), // 1: a product of unit states is unit length
  f6InnerFactor: yes(
    (() => {
      const lhs = inner(kron(KET['+x'], KET['-x']), kron(KET['+z'], KET['-x']))
      const rhs = mul(inner(KET['+x'], KET['+z']), inner(KET['-x'], KET['-x']))
      return Math.abs(lhs.re - rhs.re) < 1e-9 && Math.abs(lhs.im - rhs.im) < 1e-9
    })(),
  ), // 1: ⟨a⊗b|c⊗d⟩ = ⟨a|c⟩⟨b|d⟩
  f6BasisCount: 2 ** 3, // 8
  f6Mem30Bytes: 2 ** 30 * 16, // 17179869184 = 2^34: bytes to store a 30-qubit register (about 17 billion)
  f6Mem30: (2 ** 30 * 16) / 2 ** 30, // 16: GiB to store a 30-qubit register
  f6Mem50: (2 ** 50 * 16) / 2 ** 50, // 16: PiB to store a 50-qubit register
  f6Params10General: paramCount(10).general, // 2046
  f6Params10Product: paramCount(10).product, // 20
  f6ProdFrac: paramCount(10).product / paramCount(10).general, // ≈ 0.0098, about 1%
} as const

export type F6Key = keyof typeof V
export const claim = keyedClaim<F6Key>()
