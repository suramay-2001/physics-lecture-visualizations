/**
 * Chapter Q6 numbers and circuits (Physics 709, "Two qubits: products, entanglement and the Bell basis"), computed
 * once with the engine. Plan: docs/roles/proposals/P-Q6-story.md; rulings docs/roles/decisions/qc709-remap.md,
 * qc709-Q6Q7.md.
 *
 * Every number a learner reads in Q6 comes from `V` and is backed by a keyed claim (content.test.tsx "claims hold");
 * the numpy twin of each key is in physics/__fixtures__/claims-qc709/q6.json (pipeline/claims_qc709/q6.py, an
 * independent route: hand-written 4x4 matrices and CNOT-as-projector-sum, never calling this file's own helpers or
 * physics/qc/circuit.ts `runCircuit`). Keys start with `q6` and are unique across both courses. Circuits (`C_*`) are
 * exported so Q6.story.ts builds its stages from the SAME objects read here: engine and stage can never drift apart.
 * All circuits carry `wires: ['1', '2']` (plan "Conventions").
 */
import {
  apply,
  identity,
  inner,
  madd,
  matmul,
  maxDiff,
  mscale,
  msub,
  vadd,
  vscale,
  type Mat,
} from '../../physics/linalg'
import { components, kronM, maxAbs } from '../../physics/qc/cmat'
import type { Circuit, GateOp } from '../../physics/qc/circuit'
import { runCircuit } from '../../physics/qc/circuit'
import { H, I2, X, Z, cliffordConj, cnot, heisenberg, pauliEigenvalue, pauliMul, pauliString } from '../../physics/qc/gates'
import { expectationN } from '../../physics/qc/measure'
import { bell, coefMatrix, embed, ket } from '../../physics/qc/state'
import { claimKey, close, d, keyedClaim, pct, tf, uf } from '../claimKit'

const yes = (b: boolean) => (b ? 1 : 0)

/* ---------------------------------------------------------------------------------------------- */
/* Circuit builders (physics/qc/circuit.ts format), per the plan's circuit table (§0 "Circuits").   */
/* ---------------------------------------------------------------------------------------------- */
const g = (gate: GateOp['gate'], target: number, param?: number): GateOp => ({ op: 'gate', gate, targets: [target], ...(param !== undefined ? { params: [param] } : {}) })
const cx = (ctrl: number, target: number): GateOp => ({ op: 'gate', gate: 'X', targets: [target], controls: [ctrl] })
const czOp = (ctrl: number, target: number): GateOp => ({ op: 'gate', gate: 'Z', targets: [target], controls: [ctrl] })
const m = (qubit: number, bit: number) => ({ op: 'measure' as const, qubit, bit })

/** q6-tensor:b4, D2: a product state ψ₁⊗|+⟩, ψ₁ = cos(π/6)|0⟩ + sin(π/6)|1⟩ = 0.866|0⟩ + 0.5|1⟩. */
export const C_PROD: Circuit = { version: 1, qubits: 2, init: '00', wires: ['1', '2'], columns: [[g('Ry', 0, Math.PI / 3), g('H', 1)]] }
/** q6-bell-circuit:b6, D14: HW2's Ψ₂ = (√3|00⟩ + |11⟩)/2. */
export const C_COPY: Circuit = { version: 1, qubits: 2, init: '00', wires: ['1', '2'], columns: [[g('Ry', 0, Math.PI / 3)], [cx(0, 1)]] }
/** q6-bell-circuit:b3, D9: Unit 4.5's Bell-state recipe, H then CNOT. */
export const C_BELL: Circuit = { version: 1, qubits: 2, init: '00', wires: ['1', '2'], columns: [[g('H', 0)], [cx(0, 1)]] }
/** D5: a check on one basis state, (X⊗Z)|01⟩ = −|11⟩. */
export const C_XZ: Circuit = { version: 1, qubits: 2, init: '01', wires: ['1', '2'], columns: [[g('X', 0), g('Z', 1)]] }
/** q6-entangled:b5: CZ on |+⟩|+⟩ entangles a product state. */
export const C_CZPP: Circuit = { version: 1, qubits: 2, init: '++', wires: ['1', '2'], columns: [[czOp(0, 1)]] }
/** q6-bell-circuit:b3: the measuring circuit run backwards on |xy⟩, making β_xy. */
export const C_PREP = (xy: string): Circuit => ({ version: 1, qubits: 2, init: xy, wires: ['1', '2'], columns: [[g('H', 0)], [cx(0, 1)]] })
/** q6-bell-circuit:b1–b2, b7, D8: the Bell measurement on |xy⟩ prepared as β_xy (columns 1–2), then read (3–5). */
export const C_BM = (xy: string): Circuit => ({
  version: 1,
  qubits: 2,
  clbits: 2,
  init: xy,
  wires: ['1', '2'],
  columns: [[g('H', 0)], [cx(0, 1)], [cx(0, 1)], [g('H', 0)], [m(0, 0), m(1, 1)]],
})
/** q6-bell-circuit:b5, HW2 P2(a): Fig. 7 on Ψ₁ = |0⟩|+⟩ directly (no prep needed). */
export const C_F7_0PLUS: Circuit = { version: 1, qubits: 2, clbits: 2, init: '0+', wires: ['1', '2'], columns: [[cx(0, 1)], [g('H', 0)], [m(0, 0), m(1, 1)]] }
/** q6-bell-circuit:b6, HW2 P2(c): prepare Ψ₂, then run Fig. 7 on it. */
export const C_F7C: Circuit = {
  version: 1,
  qubits: 2,
  clbits: 2,
  init: '00',
  wires: ['1', '2'],
  columns: [[g('Ry', 0, Math.PI / 3)], [cx(0, 1)], [cx(0, 1)], [g('H', 0)], [m(0, 0), m(1, 1)]],
}
/** q6-parities:b1, D10: Fig. 7's two gates with no meters, so the stage can carry an `observable`. */
export const C_U: Circuit = { version: 1, qubits: 2, init: '00', wires: ['1', '2'], columns: [[cx(0, 1)], [g('H', 0)]] }

/* ---------------------------------------------------------------------------------------------- */
/* Shared matrices and states                                                                      */
/* ---------------------------------------------------------------------------------------------- */
const I4: Mat = identity(4)
const CNOT: Mat = cnot()
const H1: Mat = embed(H, 2, [0]) // H ⊗ I
const UB: Mat = matmul(H1, CNOT) // U = (H⊗I)CNOT, Fig. 7's measuring circuit
const XI: Mat = pauliString('XI')
const IX: Mat = pauliString('IX')
const XXm: Mat = pauliString('XX')
const ZZm: Mat = pauliString('ZZ')

const PHI_PLUS = bell('00+11')
const PHI_MINUS = bell('00-11')
const PSI_PLUS = bell('01+10')
const PSI_MINUS = bell('01-10')
/** The triplet-and-singlet basis of HW2 P1: |1,1⟩, |1,0⟩ = Ψ+, |1,−1⟩, |0,0⟩ = Ψ− (singlet). */
const TS_BASIS = [ket('00'), PSI_PLUS, ket('11'), PSI_MINUS]

const S_X_TOT: Mat = madd(mscale(XI, 0.5), mscale(IX, 0.5))

/** The HW2 P1(a)–(c) component vectors in the triplet-and-singlet basis. */
const p1a = components(ket('++'), TS_BASIS)!
const p1b = components(ket('--'), TS_BASIS)!
const p1c = components(ket('+-'), TS_BASIS)!
/** The symmetrized sum (|+x,−x⟩ + |−x,+x⟩)/√2: exactly Φ− (no sign hedge needed — it matches bit for bit). */
const p1cSym = vscale(vadd(ket('+-'), ket('-+')), Math.SQRT1_2)
const vecMaxDiff = (a: readonly { re: number; im: number }[], b: readonly { re: number; im: number }[]) => Math.max(...a.map((x, i) => Math.hypot(x.re - b[i].re, x.im - b[i].im)))

/** HW2 P2(c): Ψ₂'s Bell amplitudes and the Bell-measurement outcome probabilities (both from the SAME circuit). */
const psi2BellAmps = runCircuit(C_F7C).states[4]
const psi2Probs = psi2BellAmps.map((x) => x.re * x.re + x.im * x.im)
/** HW2 P2(a): Ψ₁ = |0⟩|+⟩'s Bell amplitudes, read the same way. */
const psi1BellAmps = runCircuit(C_F7_0PLUS).states[2]

/** D4, D13: the sum M̂ = (I − XX) + ½(I − ZZ), diagonal 0, 1, 2, 3 on β₀₀, β₀₁, β₁₀, β₁₁. */
const M_HAT: Mat = madd(msub(I4, XXm), mscale(msub(I4, ZZm), 0.5))
const N1: Mat = mscale(msub(I4, pauliString('ZI')), 0.5)

export const V = {
  /* reusable constants (the amplitude sizes that recur across the chapter, as Q3/Q5's q3Half/q5R2) */
  q6Half: 0.5,
  q6NegHalf: -0.5,
  q6R2: Math.SQRT1_2,
  q6NegR2: -Math.SQRT1_2,
  q6Sqrt32: Math.sqrt(3) / 2,
  q6Quarter: 0.25,

  /* q6-many */
  q6AmpN1: ket('0').length,
  q6AmpN2: ket('00').length,
  q6AmpN3: ket('000').length,
  q6AmpN10: ket('0'.repeat(10)).length,
  q6DimSpin1: kronM(I2, identity(3)).length,
  q6Amp30B: 2 ** 30 / 1e9,
  q6Gib30: (2 ** 30 * 16) / 2 ** 30,

  /* q6-tensor */
  q6XZEntry: pauliString('XZ')[1][3].re, // row 2, col 4 (1-indexed) of X⊗Z: −1

  /* q6-entangled */
  q6Param3General: 2 * 2 ** 3 - 2,
  q6Param3Product: 2 * 3,
  q6Param3Frac: (2 * 3) / (2 * 2 ** 3 - 2),
  q6Param10General: 2 * 2 ** 10 - 2,
  q6Param10Product: 2 * 10,
  q6Param10Frac: (2 * 10) / (2 * 2 ** 10 - 2),
  q6DetPhi: coefMatrix(PHI_PLUS)[0][0].re * coefMatrix(PHI_PLUS)[1][1].re - coefMatrix(PHI_PLUS)[0][1].re * coefMatrix(PHI_PLUS)[1][0].re,
  q6RankPhi: 2,
  q6DetProd: 0,
  q6DetPP: 0,
  q6DetCZpp: (() => {
    const psi = runCircuit(C_CZPP).states[1]
    const c = coefMatrix(psi)
    return c[0][0].re * c[1][1].re - c[0][1].re * c[1][0].re
  })(),

  /* q6-bell-basis (HW2 P1) */
  q6P1aMid: p1a[1].re, // 0.707
  q6P1bMid: p1b[1].re, // −0.707
  q6P1cS: p1c[3].re, // −0.707
  q6P1cSymIsPhiMinus: yes(vecMaxDiff(p1cSym, PHI_MINUS) < 1e-9),
  q6StotEntry: inner(TS_BASIS[0], apply(S_X_TOT, TS_BASIS[1])).re, // ⟨1,1|S_x^tot|1,0⟩ = 0.707
  q6StotSingletRow: Math.max(...TS_BASIS.map((b) => Math.hypot(inner(TS_BASIS[3], apply(S_X_TOT, b)).re, inner(TS_BASIS[3], apply(S_X_TOT, b)).im))),

  /* q6-bell-circuit (HW2 P2) */
  q6P2a: psi1Probs0(),
  q6P2c00: psi2Probs[0],
  q6P2c10: psi2Probs[2],
  q6P2cAmp00: psi2BellAmps[0].re,
  q6P2cAmp10: psi2BellAmps[2].re,

  /* q6-parities */
  q6HZH: maxDiff(matmul(matmul(H, Z), H), X),
  q6AntiXZ: maxAbs(madd(matmul(X, Z), matmul(Z, X))),
  q6Comm: maxAbs(msub(matmul(XXm, ZZm), matmul(ZZm, XXm))),
  q6XXZZSign: pauliMul('XX', 'ZZ').phase.re,
  q6CnotXISign: cliffordConj(CNOT, 'XI')?.sign ?? 0,
  q6CnotIZSign: cliffordConj(CNOT, 'IZ')?.sign ?? 0,
  q6HeisZISign: heisenberg(UB, 'ZI')?.sign ?? 0,
  q6HeisIZSign: heisenberg(UB, 'IZ')?.sign ?? 0,
  q6EigXXBeta00: pauliEigenvalue(PHI_PLUS, 'XX') ?? 0,
  q6EigZZBeta00: pauliEigenvalue(PHI_PLUS, 'ZZ') ?? 0,
  q6EigYYBeta00: pauliEigenvalue(PHI_PLUS, 'YY') ?? 0,
  q6EigXXBeta10: pauliEigenvalue(PHI_MINUS, 'XX') ?? 0,
  q6EigXXPsiMinus: pauliEigenvalue(PSI_MINUS, 'XX') ?? 0,
  q6MEigBeta00: expectationN(PHI_PLUS, M_HAT).re,
  q6MEigBeta10: expectationN(PHI_MINUS, M_HAT).re,
  q6MEigBeta11: expectationN(PSI_MINUS, M_HAT).re,
  q6InvXXSign: cliffordConj(UB, 'XX')?.sign ?? 0,
  q6InvZZSign: cliffordConj(UB, 'ZZ')?.sign ?? 0,
  q6N1Beta00: expectationN(ket('00'), N1).re,
  q6N1Beta11: expectationN(ket('11'), N1).re,
  q6Psi2ExpXX: expectationN(runCircuit(C_COPY).states[2], XXm).re,
  q6Psi2ExpZZ: expectationN(runCircuit(C_COPY).states[2], ZZm).re,
  q6P2bExpXX: expectationN(runCircuit(C_F7_0PLUS).states[0], XXm).re,
  q6P2bExpZZ: expectationN(runCircuit(C_F7_0PLUS).states[0], ZZm).re,
} as const

function psi1Probs0(): number {
  const a = psi1BellAmps[0]
  return a.re * a.re + a.im * a.im
}

export type ValueKey = keyof typeof V
export const claim = keyedClaim<ValueKey>()
export { claimKey, close, d, pct, tf, uf }

/**
 * The actual drawn-label strings behind q6HeisZISign/q6HeisIZSign (P-Q6-review.md blocking item 1): not part of
 * `V` (they are strings, not numbers, so they carry no numpy twin), but used by q6-parities:b1's claims to assert
 * that the input label drawn in the circuit view (XX, ZZ) is the one the engine actually computes.
 */
export const q6HeisZIString = heisenberg(UB, 'ZI')!.pauli // 'XX'
export const q6HeisIZString = heisenberg(UB, 'IZ')!.pauli // 'ZZ'
