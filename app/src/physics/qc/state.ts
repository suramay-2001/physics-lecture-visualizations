/**
 * n-qubit state vectors (P-709-map §(b) "state"; chapters F6, Q4, Q8, Q10).
 *
 * Qubit order (decisions/qc709-map.md #8, C2): q0 = the LEFTMOST tensor factor = the top wire = the most
 * significant bit. The basis index of |b₀b₁…b_{n−1}⟩ is Σ b_k 2^{n−1−k}, and bit strings print left to right.
 * |0⟩ ≡ |+z⟩ (north), tied to spin.ts by bridge448.test.ts. States are plain `Vec` (arrays of {re, im}).
 */
import { type C, ZERO, abs2, c, mul } from '../complex'
import { type Mat, type Vec, identity, norm, vscale } from '../linalg'
import { KET } from '../spin'
import { gaussian, rankN } from './cmat'

export { kronM, kronMAll } from './cmat'

/** The UI's qubit cap (decisions/qc709-map.md). */
export const MAX_QUBITS = 10
/** Dense 2ⁿ×2ⁿ operators are built only up to this many qubits; bigger registers use in-place gates. */
export const MAX_DENSE_QUBITS = 6

/** n for a length 2ⁿ (a state vector or a matrix side); throws when the length is not a power of two. */
export function nQubits(len: number | Vec): number {
  const L = typeof len === 'number' ? len : len.length
  const n = Math.round(Math.log2(L))
  if (!(L >= 1) || 2 ** n !== L) throw new Error(`nQubits: ${L} is not a power of two`)
  return n
}

/** The bit mask of qubit q in an n-qubit index (q0 is the most significant bit). */
export const qubitMask = (q: number, n: number): number => 1 << (n - 1 - q)

/** Index of the basis string b₀b₁…: Σ b_k 2^{n−1−k}. Accepts '0110' or [0, 1, 1, 0]. */
export function indexOfBits(bits: string | readonly number[]): number {
  const arr = typeof bits === 'string' ? [...bits] : bits
  let i = 0
  for (const b of arr) {
    if (b !== '0' && b !== '1' && b !== 0 && b !== 1) throw new Error(`indexOfBits: "${String(b)}" is not a bit`)
    i = i * 2 + (b === '1' || b === 1 ? 1 : 0)
  }
  return i
}

/** The n-bit string of index i, q0 first: bitsOfIndex(6, 4) = '0110'. */
export function bitsOfIndex(i: number, n: number): string {
  if (!Number.isInteger(i) || i < 0 || i >= 2 ** n) throw new Error(`bitsOfIndex: ${i} is out of range for ${n} bits`)
  return i.toString(2).padStart(n, '0')
}

/** The computational basis vector |i⟩ of n qubits. */
export function basisKet(i: number, n: number): Vec {
  const v: Vec = new Array(2 ** n).fill(ZERO)
  v[i] = c(1)
  return v
}

/** a ⊗ b for vectors: (a ⊗ b)_{i·|b| + j} = a_i b_j. */
export function kron(a: Vec, b: Vec): Vec {
  const out: Vec = new Array(a.length * b.length)
  for (let i = 0; i < a.length; i++) for (let j = 0; j < b.length; j++) out[i * b.length + j] = mul(a[i], b[j])
  return out
}
/** v₁ ⊗ v₂ ⊗ … (v₁ is qubit 0). */
export const kronAll = (vs: readonly Vec[]): Vec => vs.reduce((acc, v) => kron(acc, v))

const ONE_QUBIT: Record<string, Vec> = { '0': KET['+z'], '1': KET['-z'], '+': KET['+x'], '-': KET['-x'] }

/**
 * A product ket from a label, one character per qubit, q0 first: '0', '1', '+' (= |+x⟩) or '-' (= |−x⟩).
 * ket('01') = |01⟩, ket('0-') = |0⟩ ⊗ |−⟩ (Deutsch's input after the first Hadamards).
 */
export function ket(label: string): Vec {
  if (label.length === 0) throw new Error('ket: empty label')
  // A fresh array every call: kronAll([v]) returns v itself, and runCircuit mutates its start state in place, so
  // handing out a shared KET vector let a one-qubit circuit overwrite KET for both courses (P-Q4-story §9.1 E1).
  return [...kronAll([...label].map((ch) => {
    const v = ONE_QUBIT[ch]
    if (!v) throw new Error(`ket: "${ch}" is not one of 0, 1, +, -`)
    return v
  }))]
}

/** ψ/‖ψ‖ */
export const normalizeState = (psi: Vec): Vec => vscale(psi, 1 / norm(psi))

/** Standard Bell names → content (decisions/qc709-map.md #1). Bergou swaps Φ and Ψ; the engine names states by content. */
export const BELL_NAMES: Record<string, string> = {
  'Phi+': '00+11',
  'Phi-': '00-11',
  'Psi+': '01+10',
  'Psi-': '01-10',
  'Φ+': '00+11',
  'Φ−': '00-11',
  'Φ-': '00-11',
  'Ψ+': '01+10',
  'Ψ−': '01-10',
  'Ψ-': '01-10',
}

/**
 * A two-term state named by its content: bell('00+11') = (|00⟩ + |11⟩)/√2, bell('01-10') = (|01⟩ − |10⟩)/√2 (the
 * singlet). The standard names Φ± = (|00⟩ ± |11⟩)/√2, Ψ± = (|01⟩ ± |10⟩)/√2 are aliases ('Phi+', 'Φ+', …). Any two
 * distinct equal-length strings work: bell('000+111') is the 3-qubit GHZ state.
 */
export function bell(content: string): Vec {
  const m = /^([01]+)([+-])([01]+)$/.exec(BELL_NAMES[content] ?? content)
  if (!m || m[1].length !== m[3].length || m[1] === m[3]) throw new Error(`bell: "${content}" is not of the form '00+11'`)
  const n = m[1].length
  const v: Vec = new Array(2 ** n).fill(ZERO)
  v[indexOfBits(m[1])] = c(Math.SQRT1_2)
  v[indexOfBits(m[3])] = c(m[2] === '+' ? Math.SQRT1_2 : -Math.SQRT1_2)
  return v
}

/** The Bell basis in the order Φ+, Φ−, Ψ+, Ψ− (content names first; the order a Bell measurement reports). */
export const BELL_BASIS: readonly { content: string; name: string; ket: Vec }[] = [
  { content: '00+11', name: 'Φ+', ket: bell('00+11') },
  { content: '00-11', name: 'Φ−', ket: bell('00-11') },
  { content: '01+10', name: 'Ψ+', ket: bell('01+10') },
  { content: '01-10', name: 'Ψ−', ket: bell('01-10') },
]

/** (|0…0⟩ + |1…1⟩)/√2 on n ≥ 2 qubits. */
export const ghz = (n: number): Vec => bell(`${'0'.repeat(n)}+${'1'.repeat(n)}`)

/** (|10…0⟩ + |010…0⟩ + … + |0…01⟩)/√n. */
export function wState(n: number): Vec {
  const v: Vec = new Array(2 ** n).fill(ZERO)
  for (let k = 0; k < n; k++) v[qubitMask(k, n)] = c(1 / Math.sqrt(n))
  return v
}

/** A Haar-random n-qubit state (normalized complex Gaussian vector), from a seeded generator (physics/random.ts rng). */
export function randomState(n: number, rand: () => number): Vec {
  const v: Vec = Array.from({ length: 2 ** n }, () => c(gaussian(rand), gaussian(rand)))
  return normalizeState(v)
}

/**
 * The mean amplitude (1/N) Σ_k ψ_k over the N = 2ⁿ basis states. Grover's diffusion 2|s⟩⟨s| − I (|s⟩ the uniform
 * state) sends every amplitude a_k to 2·mean − a_k: the "inversion about the mean" the `amplitudes` stage draws.
 */
export function meanAmplitude(psi: Vec): C {
  let re = 0
  let im = 0
  for (const a of psi) {
    re += a.re
    im += a.im
  }
  return c(re / psi.length, im / psi.length)
}

/** ‖ψ‖ = 1 within eps. */
export const isNormalized = (psi: Vec, eps = 1e-9): boolean => Math.abs(psi.reduce((s, x) => s + abs2(x), 0) - 1) < eps

/**
 * The coefficient matrix C_{a,b} = ⟨a_A b_B|ψ⟩ for the cut A | B, where A = `rows` (a list of qubits, in the order
 * that indexes the rows; or a number k meaning the first k qubits) and B = the remaining qubits in ascending order.
 * For two qubits, C = [[ψ₀₀, ψ₀₁], [ψ₁₀, ψ₁₁]] and ψ is a product ⇔ det C = 0 (F6 D3).
 */
export function coefMatrix(psi: Vec, rows: readonly number[] | number = 1): Mat {
  const n = nQubits(psi)
  const A = typeof rows === 'number' ? Array.from({ length: rows }, (_, k) => k) : [...rows]
  if (A.some((q) => !Number.isInteger(q) || q < 0 || q >= n) || new Set(A).size !== A.length) throw new Error('coefMatrix: bad qubit list')
  const B = Array.from({ length: n }, (_, k) => k).filter((q) => !A.includes(q))
  const offA = subsetOffsets(A, n)
  const offB = subsetOffsets(B, n)
  return offA.map((ia) => offB.map((ib) => psi[ia | ib]))
}

/**
 * For a list of qubits Q (Q[0] the most significant), off[r] is the full-register bit pattern that puts the bits of
 * r on those wires (and 0 elsewhere). The workhorse of every strided loop in the qc engine.
 */
export function subsetOffsets(Q: readonly number[], n: number): number[] {
  const k = Q.length
  const off = new Array<number>(2 ** k).fill(0)
  for (let r = 0; r < 2 ** k; r++) {
    let x = 0
    for (let i = 0; i < k; i++) if ((r >> (k - 1 - i)) & 1) x |= qubitMask(Q[i], n)
    off[r] = x
  }
  return off
}

/** The Schmidt rank of ψ across the cut `A` | rest (= rank of the coefficient matrix). */
export const schmidtRank = (psi: Vec, A: readonly number[] | number = 1, rtol = 1e-9): number => rankN(coefMatrix(psi, A), rtol)

/**
 * Is ψ a product state? With a cut A: Schmidt rank 1 across A | rest. Without one: FULLY product (every qubit
 * factors out), which holds exactly when each single qubit has Schmidt rank 1 against the rest.
 */
export function isProduct(psi: Vec, A?: readonly number[], rtol = 1e-9): boolean {
  if (A) return schmidtRank(psi, A, rtol) === 1
  const n = nQubits(psi)
  for (let q = 0; q < n; q++) if (schmidtRank(psi, [q], rtol) !== 1) return false
  return true
}

/**
 * The dense 2ⁿ×2ⁿ operator that applies the k-qubit matrix A to `qubits` (in that order: qubits[0] is A's most
 * significant bit, so the wires need not be adjacent or sorted), optionally only when every qubit in `controls` is 1.
 * embed(A, n, [q]) is I ⊗ … ⊗ A ⊗ … ⊗ I (F6 "A ⊗ I"). n ≤ MAX_DENSE_QUBITS; bigger registers use gates.applyGate.
 */
export function embed(A: Mat, n: number, qubits: readonly number[], controls: readonly number[] = []): Mat {
  if (n > MAX_DENSE_QUBITS) throw new Error(`embed: dense operators stop at ${MAX_DENSE_QUBITS} qubits; use applyGate`)
  checkWires(n, qubits, controls, 'embed')
  const k = qubits.length
  if (A.length !== 2 ** k || A.some((row) => row.length !== 2 ** k)) throw new Error(`embed: a ${k}-qubit operator must be ${2 ** k}×${2 ** k}`)
  const N = 2 ** n
  const off = subsetOffsets(qubits, n)
  const tMask = off[off.length - 1]
  const cMask = controls.reduce((m, q) => m | qubitMask(q, n), 0)
  const M: Mat = Array.from({ length: N }, () => new Array<C>(N).fill(ZERO))
  for (let j = 0; j < N; j++) {
    if ((j & cMask) !== cMask) {
      M[j][j] = c(1)
      continue
    }
    const base = j & ~tMask
    const col = off.indexOf(j & tMask)
    for (let r = 0; r < off.length; r++) M[base | off[r]][j] = A[r][col]
  }
  return M
}

/** Throws unless the wires are integers in [0, n), with no wire used twice across targets and controls. */
export function checkWires(n: number, targets: readonly number[], controls: readonly number[], who: string): void {
  const all = [...targets, ...controls]
  if (targets.length === 0) throw new Error(`${who}: no target wires`)
  if (all.some((q) => !Number.isInteger(q) || q < 0 || q >= n)) throw new Error(`${who}: a wire is outside 0…${n - 1}`)
  if (new Set(all).size !== all.length) throw new Error(`${who}: a wire is used twice`)
}

/** I on n qubits. */
export const identityN = (n: number): Mat => identity(2 ** n)
