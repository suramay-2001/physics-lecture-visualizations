/**
 * Quantum gates (P-709-map §(b) "gates"; chapters Q4, Q5, Q14, Q20).
 *
 * One-qubit gates are the 448 matrices where they exist: X, Y, Z are σ_x, σ_y, σ_z (spin.ts), R_n(θ) = e^{−iθ n·σ/2}
 * is spin.ts `rotation` (so R_z(2π) = −I), P(φ) = diag(1, e^{iφ}) is spin.ts `phaseShift`, S = P(π/2), T = P(π/4)
 * (decisions C6, C14). Many-qubit gates follow the engine's qubit order (q0 = the most significant bit, state.ts).
 * `applyGate` acts on a state vector IN PLACE with an O(2ⁿ·2ᵏ) strided loop, for any k-qubit matrix on any wires,
 * with any controls; the dense builders (`controlled`, `cnot`, …) stop at 6 qubits.
 */
import { type C, ZERO, abs, add, approxEq, c, mul, sub } from '../complex'
import { type Mat, type Vec, apply, dagger, identity, mat, matmul } from '../linalg'
import { SIGMA_X, SIGMA_Y, SIGMA_Z, phaseShift, rotation, Rz as spinRz } from '../spin'
import { type TruthTable, hammingWeight, truthTable } from './bits'
import { kronMAll, maxAbs } from './cmat'
import { MAX_DENSE_QUBITS, checkWires, embed, nQubits, qubitMask, subsetOffsets } from './state'

const r = Math.SQRT1_2

export const I2: Mat = identity(2)
/** NOT: |0⟩ ↔ |1⟩ (Bergou 1.5–1.7); = σ_x. */
export const X: Mat = SIGMA_X
export const Y: Mat = SIGMA_Y
export const Z: Mat = SIGMA_Z
/** Hadamard (Bergou 1.8): |0⟩ → |+x⟩, |1⟩ → |−x⟩; the notes' z→x change of basis. */
export const H: Mat = mat([[r, r], [r, -r]])
/** P(φ) = diag(1, e^{iφ}) (448's phaseShift). */
export const P = (phi: number): Mat => phaseShift(phi)
/** S = P(π/2) = diag(1, i) (Bergou's "F"). */
export const S: Mat = P(Math.PI / 2)
export const Sdg: Mat = P(-Math.PI / 2)
/** T = P(π/4) */
export const T: Mat = P(Math.PI / 4)
export const Tdg: Mat = P(-Math.PI / 4)
/** R_x(θ) = e^{−iθσ_x/2} */
export const Rx = (theta: number): Mat => rotation([1, 0, 0], theta)
/** R_y(θ) = e^{−iθσ_y/2} (real: it keeps real amplitudes real). */
export const Ry = (theta: number): Mat => rotation([0, 1, 0], theta)
/** R_z(θ) = diag(e^{−iθ/2}, e^{iθ/2}) (448's Rz). */
export const Rz = (theta: number): Mat => spinRz(theta)
/** SWAP on two qubits: |ab⟩ → |ba⟩. */
export const SWAP2: Mat = mat([[1, 0, 0, 0], [0, 0, 1, 0], [0, 1, 0, 0], [0, 0, 0, 1]])

/** The dense operator of U on `targets` of n qubits, applied only when every control is 1: |0⟩⟨0|⊗I + |1⟩⟨1|⊗U, generalized. */
export const controlled = (U: Mat, controls: readonly number[], targets: readonly number[], n: number): Mat => embed(U, n, targets, controls)
/** CNOT with control c and target t (Bergou 1.9). */
export const cnot = (ctrl = 0, target = 1, n = 2): Mat => controlled(X, [ctrl], [target], n)
/** CZ = diag(1, 1, 1, −1) on the pair; symmetric in its two wires. */
export const cz = (a = 0, b = 1, n = 2): Mat => controlled(Z, [a], [b], n)
export const swap = (a = 0, b = 1, n = 2): Mat => embed(SWAP2, n, [a, b])
/** Toffoli (CCNOT): flips t when both controls are 1. */
export const toffoli = (c1 = 0, c2 = 1, t = 2, n = 3): Mat => controlled(X, [c1, c2], [t], n)
/** Fredkin (CSWAP): swaps a and b when the control is 1. */
export const cswap = (ctrl = 0, a = 1, b = 2, n = 3): Mat => controlled(SWAP2, [ctrl], [a, b], n)

function tableOf(f: TruthTable | ((x: number) => number | boolean), nIn: number, qubits: number): TruthTable {
  if (qubits > MAX_DENSE_QUBITS) throw new Error(`oracle: dense matrices stop at ${MAX_DENSE_QUBITS} qubits; use applyOracleXor/applyOraclePhase`)
  const t = typeof f === 'function' ? truthTable(f, nIn) : f
  if (t.length !== 2 ** nIn) throw new Error(`oracle: a truth table on ${nIn} bits has ${2 ** nIn} entries`)
  return t
}

/**
 * The f-CNOT U_f|x⟩|y⟩ = |x⟩|y ⊕ f(x)⟩ on nIn + 1 qubits (x = the first nIn qubits, y = the last), a permutation
 * matrix and therefore unitary (F7 D2, Bergou §1.4). f is a truth table (f[x], x read q0-first) or a function.
 */
export function oracleXor(f: TruthTable | ((x: number) => number | boolean), nIn: number): Mat {
  const t = tableOf(f, nIn, nIn + 1)
  const N = 2 ** (nIn + 1)
  const M: Mat = Array.from({ length: N }, () => new Array<C>(N).fill(ZERO))
  for (let j = 0; j < N; j++) M[j ^ t[j >> 1]][j] = c(1)
  return M
}

/** The phase oracle |x⟩ → (−1)^{f(x)}|x⟩ on nIn qubits (what U_f does with a |−⟩ target: phase kickback, Bergou 1.13). */
export function oraclePhase(f: TruthTable | ((x: number) => number | boolean), nIn: number): Mat {
  const t = tableOf(f, nIn, nIn)
  return t.map((fx, i) => t.map((_, j) => (i === j ? c(fx ? -1 : 1) : ZERO)))
}

/** H^{⊗n}: entries (−1)^{x·y} / 2^{n/2} (x·y the bitwise dot product mod 2, F7 D4). */
export function walshHadamard(n: number): Mat {
  if (n > MAX_DENSE_QUBITS) throw new Error(`walshHadamard: dense only up to ${MAX_DENSE_QUBITS} qubits`)
  const N = 2 ** n
  const k = 1 / Math.sqrt(N)
  return Array.from({ length: N }, (_, x) => Array.from({ length: N }, (_, y) => c(hammingWeight(x & y) % 2 ? -k : k)))
}

/**
 * Apply the k-qubit matrix U to `targets` (targets[0] is U's most significant bit) of the state psi, IN PLACE,
 * only on basis states where every `controls` wire is 1; returns psi. O(2ⁿ·2ᵏ); works to the 10-qubit cap and beyond.
 * U need not be unitary (a projector gives an unnormalized post-measurement vector).
 */
export function applyGate(psi: Vec, U: Mat, targets: readonly number[], controls: readonly number[] = []): Vec {
  const n = nQubits(psi)
  checkWires(n, targets, controls, 'applyGate')
  const dim = 2 ** targets.length
  if (U.length !== dim || U.some((row) => row.length !== dim)) throw new Error(`applyGate: a ${targets.length}-qubit gate must be ${dim}×${dim}`)
  const off = subsetOffsets(targets, n)
  const tMask = off[dim - 1]
  const cMask = controls.reduce((m, q) => m | qubitMask(q, n), 0)
  const a: C[] = new Array(dim)
  for (let base = 0; base < psi.length; base++) {
    if ((base & tMask) !== 0 || (base & cMask) !== cMask) continue
    for (let k = 0; k < dim; k++) a[k] = psi[base | off[k]]
    for (let row = 0; row < dim; row++) {
      let s = ZERO
      const Ur = U[row]
      for (let k = 0; k < dim; k++) if (a[k].re !== 0 || a[k].im !== 0) s = add(s, mul(Ur[k], a[k]))
      psi[base | off[row]] = s
    }
  }
  return psi
}

/** |x⟩|y⟩ → |x⟩|y ⊕ f(x)⟩ in place, with x read from `inputs` (inputs[0] most significant) and y the `target` wire. */
export function applyOracleXor(psi: Vec, f: TruthTable, inputs: readonly number[], target: number): Vec {
  const n = nQubits(psi)
  checkWires(n, [target], inputs, 'applyOracleXor')
  if (f.length !== 2 ** inputs.length) throw new Error('applyOracleXor: the truth table does not match the inputs')
  const tm = qubitMask(target, n)
  const xOf = inputBits(inputs, n)
  for (let i = 0; i < psi.length; i++) {
    if (i & tm || !f[xOf(i)]) continue
    const t = psi[i]
    psi[i] = psi[i | tm]
    psi[i | tm] = t
  }
  return psi
}

/** |x⟩ → (−1)^{f(x)}|x⟩ in place, with x read from `inputs`. */
export function applyOraclePhase(psi: Vec, f: TruthTable, inputs: readonly number[]): Vec {
  const n = nQubits(psi)
  checkWires(n, inputs, [], 'applyOraclePhase')
  if (f.length !== 2 ** inputs.length) throw new Error('applyOraclePhase: the truth table does not match the inputs')
  const xOf = inputBits(inputs, n)
  for (let i = 0; i < psi.length; i++) if (f[xOf(i)]) psi[i] = c(-psi[i].re, -psi[i].im)
  return psi
}

/** i ↦ the number whose bits are i's bits on `inputs` (inputs[0] most significant). */
function inputBits(inputs: readonly number[], n: number): (i: number) => number {
  const masks = inputs.map((q) => qubitMask(q, n))
  return (i) => masks.reduce((x, m) => x * 2 + (i & m ? 1 : 0), 0)
}

const PAULI: Record<string, Mat> = { I: I2, X, Y, Z }

/** A Pauli string as a matrix: pauliString('XIZ') = X ⊗ I ⊗ Z (q0 first). */
export function pauliString(s: string): Mat {
  if (!/^[IXYZ]+$/.test(s)) throw new Error(`pauliString: "${s}" must use only I, X, Y, Z`)
  return kronMAll([...s].map((ch) => PAULI[ch]))
}

/** Every Pauli string on n qubits (4ⁿ of them), in the order I, X, Y, Z per wire. */
export function pauliStrings(n: number): string[] {
  let out = ['']
  for (let k = 0; k < n; k++) out = out.flatMap((p) => ['I', 'X', 'Y', 'Z'].map((ch) => p + ch))
  return out
}

/**
 * U P U† for a Pauli string P, written as ±(another Pauli string), or null when the image is not a single Pauli
 * string (U is not Clifford). cliffordConj(H, 'X') = { sign: 1, pauli: 'Z' }; cliffordConj(cnot(), 'XI') = +XX.
 */
export function cliffordConj(U: Mat, pauli: string): { sign: 1 | -1; pauli: string } | null {
  const n = pauli.length
  if (U.length !== 2 ** n) throw new Error(`cliffordConj: U is not a ${n}-qubit operator`)
  const M = matmul(matmul(U, pauliString(pauli)), dagger(U))
  const N = 2 ** n
  for (const q of pauliStrings(n)) {
    const Q = pauliString(q)
    // λ = tr(Q M)/2ⁿ (Paulis are Hermitian and square to I)
    let tr = ZERO
    for (let i = 0; i < N; i++) for (let k = 0; k < N; k++) if (Q[i][k].re !== 0 || Q[i][k].im !== 0) tr = add(tr, mul(Q[i][k], M[k][i]))
    const lam = c(tr.re / N, tr.im / N)
    if (abs(lam) > 0.5) {
      // the images of distinct Pauli strings are trace-orthogonal, so M = ±Q exactly or U is not Clifford
      const sign = lam.re > 0 ? 1 : -1
      if (Math.abs(lam.re - sign) > 1e-9 || Math.abs(lam.im) > 1e-9) return null
      if (maxAbs(M.map((row, i) => row.map((x, k) => c(x.re - sign * Q[i][k].re, x.im - sign * Q[i][k].im)))) > 1e-9) return null
      return { sign, pauli: q }
    }
  }
  return null
}

/** Is U a Clifford unitary? It maps every X_k and Z_k (hence every Pauli string) to ± a Pauli string. */
export function isClifford(U: Mat): boolean {
  const n = nQubits(U.length)
  for (let k = 0; k < n; k++)
    for (const g of ['X', 'Z']) {
      const p = 'I'.repeat(k) + g + 'I'.repeat(n - k - 1)
      if (!cliffordConj(U, p)) return false
    }
  return true
}

/**
 * Single-qubit Pauli multiplication table: PAULI_MUL[a + b] = [phase, result] for P_a P_b = phase · P_result
 * (I is the identity factor; X·Y = iZ, Y·X = −iZ, and cyclic). The engine route for `pauliMul` (a per-qubit lookup,
 * no matrices); the numpy twin multiplies the full matrices and decomposes the product by trace.
 */
const PAULI_MUL: Record<string, [C, string]> = {
  II: [c(1), 'I'], IX: [c(1), 'X'], IY: [c(1), 'Y'], IZ: [c(1), 'Z'],
  XI: [c(1), 'X'], XX: [c(1), 'I'], XY: [c(0, 1), 'Z'], XZ: [c(0, -1), 'Y'],
  YI: [c(1), 'Y'], YX: [c(0, -1), 'Z'], YY: [c(1), 'I'], YZ: [c(0, 1), 'X'],
  ZI: [c(1), 'Z'], ZX: [c(0, 1), 'Y'], ZY: [c(0, -1), 'X'], ZZ: [c(1), 'I'],
}

/**
 * P_a P_b = phase · P_result for two equal-length Pauli strings (q0 first), phase ∈ {1, −1, i, −i}: multiply each
 * qubit's single-Pauli factor from PAULI_MUL and accumulate the per-qubit phases (Q6, Q7).
 */
export function pauliMul(a: string, b: string): { phase: C; string: string } {
  if (a.length !== b.length || !/^[IXYZ]+$/.test(a) || !/^[IXYZ]+$/.test(b)) throw new Error('pauliMul: a, b must be equal-length strings of I, X, Y, Z')
  let phase: C = c(1)
  let s = ''
  for (let k = 0; k < a.length; k++) {
    const [ph, letter] = PAULI_MUL[a[k] + b[k]]
    phase = mul(phase, ph)
    s += letter
  }
  return { phase, string: s }
}

/**
 * Do the Pauli strings a and b commute? PQ = ±QP always (same resulting string either order — PAULI_MUL's result
 * letter does not depend on operand order, only its phase can flip sign), so they commute exactly when pauliMul(a,
 * b) and pauliMul(b, a) agree in phase (Q6, Q7).
 */
export function paulisCommute(a: string, b: string): boolean {
  return approxEq(pauliMul(a, b).phase, pauliMul(b, a).phase)
}

/**
 * The eigenvalue of the Pauli string s on ψ: ±1 when Pψ is (numerically) ±ψ, else null — ψ is not an eigenstate of
 * s (Q6, Q7). Checked by applying the matrix and comparing to ±ψ directly (not via ⟨ψ|P|ψ⟩, which can average to a
 * value near ±1 from a mixture of eigenvalues and falsely pass a loose tolerance).
 */
export function pauliEigenvalue(psi: Vec, s: string, eps = 1e-9): 1 | -1 | null {
  const out = apply(pauliString(s), psi)
  for (const lam of [1, -1] as const) {
    let gap = 0
    for (let i = 0; i < psi.length; i++) gap = Math.max(gap, abs(sub(out[i], c(lam * psi[i].re, lam * psi[i].im))))
    if (gap < eps) return lam
  }
  return null
}

/**
 * The Heisenberg-picture image of the Pauli string s under U: U†PU, written as ±(another Pauli string); null when U
 * is not Clifford for s. U†PU = cliffordConj(U†, s) (cliffordConj(V, P) = VPV†, so V = U† gives U†PU) — Q6, Q7.
 */
export const heisenberg = (U: Mat, s: string): { sign: 1 | -1; pauli: string } | null => cliffordConj(dagger(U), s)

/** The one-qubit gates by name, as used by the circuit format (circuit.ts). */
export const GATES_1Q: Record<string, Mat> = { I: I2, X, Y, Z, H, S, Sdg, T, Tdg }
/** The one-parameter one-qubit gates by name. */
export const GATES_1P: Record<string, (x: number) => Mat> = { P, Rx, Ry, Rz }
