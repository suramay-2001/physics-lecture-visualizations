/**
 * Chapter Q4 numbers (Physics 709, "The qubit, gates and circuits"), computed once with the engine.
 * Plan: docs/roles/proposals/P-Q4-story.md; rulings docs/roles/decisions/qc709-Q4Q5.md, qc709-map.md, qc709-nc.md.
 *
 * Same contract as Q3.values.ts: every number a learner reads in Q4 comes from `V` and is backed by a keyed claim
 * (content.test.tsx runs `holds`; claims.test.ts compares each key with numpy, pipeline/claims_qc709/q4.py, an
 * independent route: explicit matrices and np.kron, never this file's applyGate/embed strided loops). Keys start
 * with `q4` and are unique across both courses.
 *
 * Conventions (the plan's "Conventions"): |0⟩ ≡ |+z⟩, |1⟩ ≡ |−z⟩, qubit 0 is the leftmost label, the top wire and
 * the MSB. ψ = Q3's running state = ketFromBloch(π/3, 0) = (0.866, 0.5).
 *
 * Engine gap E1 (a one-qubit `runCircuit` overwriting the shared KET constants) is already fixed on main (ae8ef58):
 * `qc/state.ts` `ket()` now returns a fresh array every call, so no `psi0` padding is needed here.
 */
import { I, abs2, add, c, expi } from '../../physics/complex'
import { apply, det2, identity, isUnitary, mat, matEq, matmul, mscale, madd, norm, vec, vscale, vsub, type Vec } from '../../physics/linalg'
import { KET, blochVector, ketFromBloch, rotation, samePhysicalState } from '../../physics/spin'
import { bell, coefMatrix, embed, indexOfBits, isProduct, ket, kron } from '../../physics/qc/state'
import { H, I2, P, Rx, S, SWAP2, T, X, Z, cnot, cz, walshHadamard } from '../../physics/qc/gates'
import { circuitUnitary, runCircuit, type Circuit } from '../../physics/qc/circuit'
import { marginal, measureInBasis, postMeasure, probs } from '../../physics/qc/measure'
import { claimKey, close, d, keyedClaim, pct, tf, uf } from '../claimKit'

const yes = (b: boolean) => (b ? 1 : 0)
const vecEq = (a: Vec, b: Vec, eps = 1e-9): boolean => norm(vsub(a, b)) < eps

/* ---- shared states (the plan's "Conventions") ---- */
/** ψ, Q1/Q3's running state at Bloch θ = 60°, φ = 0: (0.866, 0.5), prepared in circuits by g(Ry, 0, π/3). */
const PSI = ketFromBloch(Math.PI / 3, 0)
const PLUS = ket('+') // |+⟩ = |+x⟩ = (0.7071, 0.7071)
const R2 = Math.SQRT1_2

/* ---- circuits (the plan's shorthand table, §"Conventions"); exported for the story's stage circuits ---- */
export const C_X: Circuit = { version: 1, qubits: 1, init: '0', columns: [[{ op: 'gate', gate: 'X', targets: [0] }]] }
export const C_H: Circuit = { version: 1, qubits: 1, init: '0', columns: [[{ op: 'gate', gate: 'H', targets: [0] }]] }
export const C_HH: Circuit = { version: 1, qubits: 1, init: '0', columns: [[{ op: 'gate', gate: 'H', targets: [0] }], [{ op: 'gate', gate: 'H', targets: [0] }]] }
export const C_HZ: Circuit = { version: 1, qubits: 1, init: '0', columns: [[{ op: 'gate', gate: 'H', targets: [0] }], [{ op: 'gate', gate: 'Z', targets: [0] }]] }
export const C_PSIH: Circuit = {
  version: 1,
  qubits: 1,
  clbits: 1,
  init: '0',
  columns: [[{ op: 'gate', gate: 'Ry', targets: [0], params: [Math.PI / 3] }], [{ op: 'gate', gate: 'H', targets: [0] }], [{ op: 'measure', qubit: 0, bit: 0 }]],
}
export const C_PROD: Circuit = { version: 1, qubits: 2, init: '00', columns: [[{ op: 'gate', gate: 'Ry', targets: [0], params: [Math.PI / 3] }, { op: 'gate', gate: 'H', targets: [1] }]] }
export const C_PRODM: Circuit = { ...C_PROD, clbits: 2, columns: [...C_PROD.columns, [{ op: 'measure', qubit: 0, bit: 0 }, { op: 'measure', qubit: 1, bit: 1 }]] }
export const C_H3: Circuit = {
  version: 1,
  qubits: 3,
  init: '000',
  columns: [[{ op: 'gate', gate: 'H', targets: [0] }, { op: 'gate', gate: 'H', targets: [1] }, { op: 'gate', gate: 'H', targets: [2] }]],
}
export const C_CX10: Circuit = { version: 1, qubits: 2, init: '10', columns: [[{ op: 'gate', gate: 'X', controls: [0], targets: [1] }]] }
export const C_CZH: Circuit = {
  version: 1,
  qubits: 2,
  init: '++',
  columns: [[{ op: 'gate', gate: 'H', targets: [1] }], [{ op: 'gate', gate: 'X', controls: [0], targets: [1] }], [{ op: 'gate', gate: 'H', targets: [1] }]],
}
export const C_COPY: Circuit = { version: 1, qubits: 2, init: '00', columns: [[{ op: 'gate', gate: 'Ry', targets: [0], params: [Math.PI / 3] }], [{ op: 'gate', gate: 'X', controls: [0], targets: [1] }]] }
export const C_COPYM: Circuit = { ...C_COPY, clbits: 1, columns: [...C_COPY.columns, [{ op: 'measure', qubit: 0, bit: 0 }]] }
export const C_BELL: Circuit = { version: 1, qubits: 2, init: '00', columns: [[{ op: 'gate', gate: 'H', targets: [0] }], [{ op: 'gate', gate: 'X', controls: [0], targets: [1] }]] }
export const C_BELLM: Circuit = { ...C_BELL, clbits: 2, columns: [...C_BELL.columns, [{ op: 'measure', qubit: 0, bit: 0 }, { op: 'measure', qubit: 1, bit: 1 }]] }
export const C_SWAP3: Circuit = {
  version: 1,
  qubits: 2,
  init: '10',
  columns: [[{ op: 'gate', gate: 'X', controls: [0], targets: [1] }], [{ op: 'gate', gate: 'X', controls: [1], targets: [0] }], [{ op: 'gate', gate: 'X', controls: [0], targets: [1] }]],
}
export const C_HHCX: Circuit = {
  version: 1,
  qubits: 2,
  init: '01',
  columns: [
    [{ op: 'gate', gate: 'H', targets: [0] }, { op: 'gate', gate: 'H', targets: [1] }],
    [{ op: 'gate', gate: 'X', controls: [0], targets: [1] }],
    [{ op: 'gate', gate: 'H', targets: [0] }, { op: 'gate', gate: 'H', targets: [1] }],
  ],
}
export const C_M2: Circuit = {
  version: 1,
  qubits: 2,
  clbits: 1,
  init: '00',
  columns: [
    [{ op: 'gate', gate: 'Ry', targets: [0], params: [Math.PI / 3] }],
    [{ op: 'gate', gate: 'X', controls: [0], targets: [1] }],
    [{ op: 'gate', gate: 'H', targets: [1] }],
    [{ op: 'measure', qubit: 0, bit: 0 }],
  ],
}

/* ---- worked quantities ---- */
const psiChances = probs(PSI) // [0.75, 0.25]
const psiBloch = blochVector(PSI) // (0.866, 0, 0.5)
const plusChances = probs(PLUS) // [0.5, 0.5]
const x0 = apply(X, KET['+z']) // = |1⟩
const xPsi = apply(X, PSI)
const xPsiChances = probs(xPsi)
const zPsi = apply(Z, PSI)
const zBloch = blochVector(zPsi)
const h0 = apply(H, KET['+z'])
const h1 = apply(H, KET['-z'])
const hPsi = apply(H, PSI)
const hPsiChances = probs(hPsi)
const hBloch = blochVector(hPsi)
const sPlus = apply(S, PLUS)
const sPlusBloch = blochVector(sPlus)
const rx90sq = matmul(Rx(Math.PI / 2), Rx(Math.PI / 2))
const rx90OnZero = apply(Rx(Math.PI / 2), KET['+z'])
const rx90Chances = probs(rx90OnZero)

const prod = kron(PSI, PLUS) // ψ ⊗ |+⟩
const prodChances = probs(prod)
const h3Final = runCircuit(C_H3).states.at(-1)!
const prodDet = det2(coefMatrix(prod))
const bellState = bell('00+11')
const bellDet = det2(coefMatrix(bellState))

const cnotMat = cnot()
const cnot10 = apply(cnotMat, ket('10'))
const czMat = cz()
const czOnPlusPlus = apply(czMat, kron(KET['+x'], KET['+x']))
const czFromCnot = matmul(matmul(embed(H, 2, [1]), cnotMat), embed(H, 2, [1]))
let andZeros = 0
for (const a of [0, 1]) for (const b of [0, 1]) if (!(a && b)) andZeros++
const copyOut = apply(cnotMat, kron(PSI, KET['+z']))
const psiPsi = kron(PSI, PSI)

const hThenZ = apply(matmul(Z, H), KET['+z']) // circuit "H then Z" = matrix ZH
const zThenH = apply(matmul(H, Z), KET['+z']) // circuit "Z then H" = matrix HZ
const bellMid = runCircuit(C_BELL).states[1]
const bellFinal = runCircuit(C_BELL).states.at(-1)!
/** N&C Eq. 1.27: (H ⊗ I) then CNOT on |x,y⟩ = (|0,y⟩ + (−1)ˣ|1,ȳ⟩)/√2, checked on all four inputs. */
const bellFormulaHolds = (() => {
  const U = circuitUnitary(C_BELL)
  for (const x of [0, 1])
    for (const y of [0, 1]) {
      const out = apply(U, ket(`${x}${y}`))
      const want: Vec = [c(0), c(0), c(0), c(0)]
      const ybar = 1 - y
      want[indexOfBits(`0${y}`)] = c(R2)
      want[indexOfBits(`1${ybar}`)] = c(x ? -R2 : R2)
      if (!vecEq(out, want)) return false
    }
  return true
})()
const swapUnitary = circuitUnitary(C_SWAP3)
const hhcxUnitary = circuitUnitary(C_HHCX)
const hhcx01 = apply(hhcxUnitary, ket('01'))
const hxh = matmul(matmul(H, X), H)

const prodMeasure = probs(prod) // reuse: 0.375, 0.375, 0.125, 0.125
const m2pre = runCircuit(C_M2).states[3]
const m2p = marginal(m2pre, [0])
const m2post0 = postMeasure(m2pre, [0], '0').post!
const m2post1 = postMeasure(m2pre, [0], '1').post!
const q4IsPlusX = vecEq([m2post0[0], m2post0[1]], KET['+x'])
const q4IsMinusX = vecEq([m2post1[2], m2post1[3]], KET['-x'])
const bellM = marginal(bellFinal, [0])
const bellPost0 = postMeasure(bellFinal, [0], '0').post!
const bellPost1 = postMeasure(bellFinal, [0], '1').post!
const plusBasis = measureInBasis(PSI, 0, 'x')
const plusFormula = abs2(add(PSI[0], PSI[1])) / 2
const copyRead = marginal(copyOut, [0])
const copyReadPost0 = postMeasure(copyOut, [0], '0').post!
const copyReadPost1 = postMeasure(copyOut, [0], '1').post!

export const V = {
  /* q4-qubit */
  q4PsiAlpha: PSI[0].re, // 0.8660
  q4PsiBeta: PSI[1].re, // 0.5
  q4P0: psiChances[0], // 0.75
  q4P1: psiChances[1], // 0.25
  q4PsiVecX: psiBloch[0], // 0.8660
  q4PsiVecZ: psiBloch[2], // 0.5
  q4PhaseSame: yes(samePhysicalState(vscale(PSI, I), PSI)), // 1: iψ is the same state as ψ
  q4PlusAmp: plusChances[0] ** 0.5, // 0.7071 (= R2)
  q4PlusP0: plusChances[0], // 0.5
  q4PlusP1: plusChances[1], // 0.5

  /* q4-one-qubit-gates */
  q4X0: x0[1].re, // 1: X|0⟩ = |1⟩
  q4XPsi0: xPsi[0].re, // 0.5
  q4XPsi1: xPsi[1].re, // 0.8660
  q4XP0: xPsiChances[0], // 0.25
  q4XP1: xPsiChances[1], // 0.75
  q4XUnitary: yes(isUnitary(X)), // 1
  q4ZPsi0: zPsi[0].re, // 0.8660
  q4ZPsi1: zPsi[1].re, // −0.5
  q4ZBlochX: zBloch[0], // −0.8660
  q4ZBlochZ: zBloch[2], // 0.5
  q4XisRx: yes(matEq(X, mscale(rotation([1, 0, 0], Math.PI), I))), // 1
  q4ZisRz: yes(matEq(Z, mscale(rotation([0, 0, 1], Math.PI), I))), // 1
  q4H00: h0[0].re, // 0.7071
  q4H01: h0[1].re, // 0.7071
  q4H10: h1[0].re, // 0.7071
  q4H11: h1[1].re, // −0.7071
  q4HH: yes(matEq(matmul(H, H), I2)), // 1
  q4HXZ: yes(matEq(H, mscale(madd(X, Z), Math.SQRT1_2))), // 1
  q4HPsi0: hPsi[0].re, // 0.9659
  q4HPsi1: hPsi[1].re, // 0.2588
  q4HBlochX: hBloch[0], // 0.5
  q4HBlochZ: hBloch[2], // 0.8660
  q4HP0: hPsiChances[0], // 0.9330
  q4HP1: hPsiChances[1], // 0.0670
  q4HTurn: yes(matEq(H, mscale(matmul(rotation([1, 0, 0], Math.PI), rotation([0, 1, 0], Math.PI / 2)), I))), // 1
  q4HNC: yes(matEq(H, mscale(rotation([R2, 0, R2], Math.PI), I))), // 1
  q4SPlus: yes(samePhysicalState(sPlus, KET['+y'])), // 1
  q4SPlusVecY: sPlusBloch[1], // 1
  q4PRz: yes([0.37, 2.1].every((chi) => matEq(P(chi), mscale(rotation([0, 0, 1], chi), expi(chi / 2))))), // 1: P(χ) = e^{iχ/2}R_z(χ)
  q4TRz: yes(matEq(T, mscale(rotation([0, 0, 1], Math.PI / 4), expi(Math.PI / 8)))), // 1
  q4Rz2pi: yes(matEq(rotation([0, 0, 1], 2 * Math.PI), mscale(I2, -1))), // 1
  q4HHisX: yes(matEq(matmul(H, H), X)), // 0
  q4SqrtNot: yes(matEq(rx90sq, mscale(X, c(0, -1)))), // 1: R_x(90°)² = −iX
  q4SqrtNotP0: rx90Chances[0], // 0.5
  q4SqrtNotP1: rx90Chances[1], // 0.5

  /* q4-registers */
  q4Prod0: prod[0].re, // 0.6124
  q4Prod2: prod[2].re, // 0.3536
  q4ProdIsProduct: yes(isProduct(prod)), // 1
  q4ProdP0: prodChances[0], // 0.375
  q4ProdP2: prodChances[2], // 0.125
  q4ProdPsum: prodChances.reduce((a, x) => a + x, 0), // 1
  q4Dim3: 2 ** 3, // 8
  q4H3Amp: h3Final[0].re, // 0.3536
  q4H3isWH: yes(matEq(circuitUnitary(C_H3), walshHadamard(3))), // 1
  q4Digits500: Math.floor(500 * Math.log10(2)) + 1, // 151
  q4Idx101: indexOfBits('101'), // 5
  q4Bits6: Number('110'), // 110 (bitsOfIndex(6, 3))
  q4ProdDet: prodDet.re, // 0
  q4BellDet: bellDet.re, // 0.5
  q4ProdProduct: yes(isProduct(prod)), // 1
  q4BellProduct: yes(isProduct(bellState)), // 0

  /* q4-cnot */
  q4Cnot10: yes(vecEq(cnot10, ket('11'))), // 1
  q4CnotMat: yes(matEq(cnotMat, mat([[1, 0, 0, 0], [0, 1, 0, 0], [0, 0, 0, 1], [0, 0, 1, 0]]))), // 1
  q4CnotUnitary: yes(isUnitary(cnotMat)), // 1
  q4Cnot2: yes(matEq(matmul(cnotMat, cnotMat), identity(4))), // 1
  q4CZpp3: czOnPlusPlus[3].re, // −0.5
  q4CZ: yes(matEq(czMat, mat([[1, 0, 0, 0], [0, 1, 0, 0], [0, 0, 1, 0], [0, 0, 0, -1]]))), // 1
  q4CZSym: yes(matEq(cz(0, 1), cz(1, 0))), // 1
  q4CZfromCnot: yes(matEq(czMat, czFromCnot)), // 1
  q4CZcircuit: yes(matEq(circuitUnitary(C_CZH), czMat)), // 1
  q4AndZeros: andZeros, // 3
  q4CopyBasis: yes(vecEq(apply(cnotMat, ket('00')), ket('00')) && vecEq(apply(cnotMat, ket('10')), ket('11'))), // 1
  q4CopyOut0: copyOut[0].re, // 0.8660
  q4CopyOut3: copyOut[3].re, // 0.5
  q4PsiPsi0: psiPsi[0].re, // 0.75
  q4PsiPsi1: psiPsi[1].re, // 0.4330
  q4PsiPsi3: psiPsi[3].re, // 0.25
  q4CopyFails: yes(!vecEq(copyOut, psiPsi)), // 1

  /* q4-circuits */
  q4HthenZ0: hThenZ[0].re, // 0.7071
  q4HthenZ1: hThenZ[1].re, // −0.7071
  q4ZthenH0: zThenH[0].re, // 0.7071
  q4ZthenH1: zThenH[1].re, // 0.7071
  q4CircOrder: yes(matEq(circuitUnitary(C_HZ), matmul(Z, H))), // 1
  q4CircOrderWrong: yes(matEq(circuitUnitary(C_HZ), matmul(H, Z))), // 0
  q4BellMid0: bellMid[0].re, // 0.7071
  q4BellMid2: bellMid[2].re, // 0.7071
  q4Bell0: bellFinal[0].re, // 0.7071
  q4Bell3: bellFinal[3].re, // 0.7071
  q4BellIsPhi: yes(vecEq(bellFinal, bellState)), // 1
  q4BellFormula: yes(bellFormulaHolds), // 1
  q4SwapIsSwap: yes(matEq(swapUnitary, SWAP2)), // 1
  q4HHcx01: yes(vecEq(hhcx01, ket('11'))), // 1
  q4HHcnot: yes(matEq(hhcxUnitary, cnot(1, 0))), // 1
  q4HXH: yes(matEq(hxh, Z)), // 1

  /* q4-measure */
  q4ProdMeasure0: prodMeasure[0], // 0.375
  q4ProdMeasure2: prodMeasure[2], // 0.125
  q4M2pre0: m2pre[0].re, // 0.6124
  q4M2pre3: m2pre[3].re, // −0.3536
  q4M2p0: m2p[0], // 0.75
  q4M2p1: m2p[1], // 0.25
  q4M2post0IsPlus: yes(q4IsPlusX), // 1
  q4M2post1IsMinus: yes(q4IsMinusX), // 1
  q4BellM0: bellM[0], // 0.5
  q4BellM1: bellM[1], // 0.5
  q4BellMpost0: yes(vecEq(bellPost0, ket('00'))), // 1
  q4BellMpost1: yes(vecEq(bellPost1, ket('11'))), // 1
  q4PlusBasisP0: plusBasis.p[0], // 0.9330
  q4PlusBasisP1: plusBasis.p[1], // 0.0670
  q4PlusBasisViaH: yes(close(plusBasis.p[0], hPsiChances[0], 1e-9)), // 1
  q4PlusFormula: plusFormula, // 0.9330
  q4CopyRead0: copyRead[0], // 0.75
  q4CopyRead1: copyRead[1], // 0.25
  q4CopyReadPost0: yes(vecEq(copyReadPost0, ket('00'))), // 1
  q4CopyReadPost1: yes(vecEq(copyReadPost1, ket('11'))), // 1

  /* challenges: q4-qubit */
  q4ChP1: probs(vec(0.6, 0.8))[1], // 0.64
  q4ChComplex: probs(vec(0.6, c(0, 0.8)))[1], // 0.64
  q4ChTheta: (2 * Math.acos(Math.sqrt(0.25)) * 180) / Math.PI, // 120

  /* challenges: q4-one-qubit-gates */
  q4ChX: probs(apply(X, vec(0.6, 0.8)))[0], // 0.64
  q4ChH1: apply(H, KET['-z'])[1].re, // −0.7071

  /* challenges: q4-registers */
  q4ChCount: 2 ** 5, // 32
  q4ChProd: kron(vec(0.6, 0.8), vec(0.6, 0.8))[1].re, // 0.48
  q4ChIndex: indexOfBits('110'), // 6

  /* challenges: q4-cnot */
  q4ChEntry: cnotMat[3][2].re, // 1
  q4ChCZ: apply(czMat, vec(0.5, 0.5, 0.5, 0.5))[3].re, // −0.5
  q4ChCopy: apply(cnotMat, kron(vec(0.6, 0.8), KET['+z']))[3].re, // 0.8

  /* challenges: q4-circuits */
  q4ChBell11: apply(circuitUnitary(C_BELL), ket('10'))[3].re, // −0.7071
  q4ChHZH: hxh[0][1].re, // 1

  /* challenges: q4-measure */
  q4ChAll: probs(vec(0.5, 0.5, 0.5, 0.5))[2], // 0.25
  q4ChFirst: marginal(vec(0.6, 0, 0, 0.8), [0])[1], // 0.64
  q4ChPlus0: measureInBasis(KET['+z'], 0, 'x').p[0], // 0.5
  q4ChPost3: postMeasure(vec(0.5, 0.5, 0.5, -0.5), [0], '1').post![3].re, // −0.7071

  /* arcade */
  q4ArcSg: (() => {
    const theta = (2 * Math.PI) / 3 // 120°
    return Math.cos(theta / 2) ** 2
  })(), // 0.25
} as const

export type ValueKey = keyof typeof V
export const claim = keyedClaim<ValueKey>()
export { claimKey, close, d, pct, tf, uf }
