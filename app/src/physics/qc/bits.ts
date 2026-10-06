/**
 * Classical bits, Boolean functions and linear algebra over GF(2) (P-709-map §(b) "bits"; chapters F7, Q14, Q16, Q20).
 *
 * Bit strings are integers whose most significant bit is the leftmost character (the engine's q0-first order), so
 * 0b110 prints as '110'. A Boolean function on n bits is its truth table f[x] for x = 0 … 2ⁿ − 1. GF(2) vectors
 * and matrices are arrays of 0/1; x·z always means the bitwise dot product mod 2 (decisions C11).
 */
import { type C, ZERO, c } from '../complex'
import { type Mat } from '../linalg'

export type Bit = 0 | 1
export type TruthTable = Bit[]

/** a ⊕ b, bitwise. */
export const xor = (a: number, b: number): number => a ^ b

/** The number of 1 bits. */
export function hammingWeight(x: number): number {
  let w = 0
  for (let v = x >>> 0; v; v &= v - 1) w++
  return w
}
/** x₀ ⊕ x₁ ⊕ … (1 when the weight is odd). */
export const parity = (x: number): Bit => (hammingWeight(x) & 1) as Bit
/** x·z = Σ x_k z_k mod 2 (the bitwise dot product, F7 D4). */
export const dotMod2 = (x: number, z: number): Bit => parity(x & z)
/** The number of places where a and b differ. */
export const hammingDistance = (a: number, b: number): number => hammingWeight(a ^ b)

/** f[x] for x = 0 … 2ⁿ − 1; the function may return a boolean or a number (nonzero = 1). */
export function truthTable(f: (x: number) => number | boolean, n: number): TruthTable {
  return Array.from({ length: 2 ** n }, (_, x) => (f(x) ? 1 : 0))
}
/** Every output the same. */
export const isConstant = (t: readonly Bit[]): boolean => t.every((v) => v === t[0])
/** Exactly half the outputs are 1 (Deutsch–Jozsa's promise). */
export const isBalanced = (t: readonly Bit[]): boolean => t.length % 2 === 0 && t.filter((v) => v === 1).length === t.length / 2

/**
 * The reversible version of f: the permutation π of the n + 1-bit strings (x, y) ↦ (x, y ⊕ f(x)), as π[j] with
 * j = 2x + y (y is the last, least significant bit). It is its own inverse (F7 D2).
 */
export function reversibleOracle(t: readonly Bit[]): number[] {
  return Array.from({ length: 2 * t.length }, (_, j) => j ^ t[j >> 1])
}

/** The permutation matrix P|j⟩ = |π[j]⟩ (column j has its 1 in row π[j]); throws unless π is a permutation. */
export function permutationMatrix(perm: readonly number[]): Mat {
  const N = perm.length
  if (new Set(perm).size !== N || perm.some((p) => !Number.isInteger(p) || p < 0 || p >= N)) throw new Error('permutationMatrix: not a permutation')
  const M: Mat = Array.from({ length: N }, () => new Array<C>(N).fill(ZERO))
  perm.forEach((p, j) => (M[p][j] = c(1)))
  return M
}

/** A uniformly random balanced truth table on n bits (a seeded Fisher–Yates shuffle of 2ⁿ⁻¹ ones). */
export function randomBalanced(n: number, rand: () => number): TruthTable {
  const t: TruthTable = Array.from({ length: 2 ** n }, (_, i) => (i < 2 ** (n - 1) ? 1 : 0))
  for (let i = t.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    ;[t[i], t[j]] = [t[j], t[i]]
  }
  return t
}

/* ------------------------------------------------------------ GF(2) algebra ------------------------------------------------------------ */

const mod2 = (M: readonly (readonly number[])[]): Bit[][] => M.map((row) => row.map((x) => (((x % 2) + 2) % 2) as Bit))

/**
 * Reduced row echelon form over GF(2) (Gauss–Jordan: swap a pivot up, then XOR it into every other row that has a
 * 1 in its column). RREF is unique, so it can be compared entry by entry. Returns R, the pivot columns and the rank.
 */
export function gf2RowReduce(M: readonly (readonly number[])[]): { R: Bit[][]; pivots: number[]; rank: number } {
  const R = mod2(M)
  const rows = R.length
  const cols = rows ? R[0].length : 0
  const pivots: number[] = []
  let r = 0
  for (let col = 0; col < cols && r < rows; col++) {
    let p = r
    while (p < rows && R[p][col] === 0) p++
    if (p === rows) continue
    ;[R[p], R[r]] = [R[r], R[p]]
    for (let i = 0; i < rows; i++) if (i !== r && R[i][col] === 1) R[i] = R[i].map((x, j) => (x ^ R[r][j]) as Bit)
    pivots.push(col)
    r++
  }
  return { R, pivots, rank: pivots.length }
}

/** rank over GF(2) */
export const gf2Rank = (M: readonly (readonly number[])[]): number => gf2RowReduce(M).rank

/**
 * A basis of the null space {x : Mx = 0 mod 2}: one vector per free column (a 1 there, the pivot variables solved).
 * Its size is cols − rank. Simon's algorithm reads the secret s from the null space of the measured strings.
 */
export function gf2Nullspace(M: readonly (readonly number[])[], cols = M[0]?.length ?? 0): Bit[][] {
  const { R, pivots } = gf2RowReduce(M.length ? M : [new Array(cols).fill(0)])
  const free = Array.from({ length: cols }, (_, j) => j).filter((j) => !pivots.includes(j))
  return free.map((f) => {
    const x = new Array<Bit>(cols).fill(0)
    x[f] = 1
    pivots.forEach((pc, i) => (x[pc] = R[i][f]))
    return x
  })
}

/** One solution x of Mx = b over GF(2) (free variables 0), or null when the system is inconsistent. */
export function gf2Solve(M: readonly (readonly number[])[], b: readonly number[]): Bit[] | null {
  const cols = M[0]?.length ?? 0
  const { R, pivots } = gf2RowReduce(M.map((row, i) => [...row, b[i]]))
  if (pivots.includes(cols)) return null
  const x = new Array<Bit>(cols).fill(0)
  pivots.forEach((pc, i) => (x[pc] = R[i][cols]))
  return x
}

/** M·x mod 2 */
export const gf2MatVec = (M: readonly (readonly number[])[], x: readonly number[]): Bit[] =>
  M.map((row) => (row.reduce((s, m, j) => s + m * x[j], 0) % 2) as Bit)

/**
 * The parity-check matrix of the Hamming [2ʳ − 1, 2ʳ − r − 1] code: r rows, column j (1-based) is j in binary with
 * the most significant bit in row 0. A single flip at position j has syndrome j (F7 "gf2", Q20).
 */
export function hammingParity(r: number): Bit[][] {
  const N = 2 ** r - 1
  return Array.from({ length: r }, (_, i) => Array.from({ length: N }, (_, j) => (((j + 1) >> (r - 1 - i)) & 1) as Bit))
}

/* ------------------------------------------------------------ Mermin's GHZ argument ------------------------------------------------------------ */

export interface MerminAssignment {
  /** the predetermined outcome of an x and a y measurement, ±1, for each of the 3 parties */
  a: { x: 1 | -1; y: 1 | -1 }[]
  /** what this assignment predicts for the four Mermin correlators, as products of its local values */
  values: { XXX: 1 | -1; XYY: 1 | -1; YXY: 1 | -1; YYX: 1 | -1 }
  /** how many of the 4 quantum targets {XXX: +1, XYY: YXY: YYX: −1} this assignment matches */
  matches: number
}

/** The quantum targets for Mermin's GHZ operators (notes eq. 2.12, for GHZ = (|000⟩+|111⟩)/√2 = `state.ts` `ghz(3)`). */
export const MERMIN_TARGET = { XXX: 1, XYY: -1, YXY: -1, YYX: -1 } as const

/**
 * Every classical "instruction set" for Mermin's 3-qubit GHZ argument (notes L6 pp. 29–32, L7 pp. 33–34; Q7): each
 * of the 3 parties fixes in advance an outcome a_x, a_y ∈ {±1} for an x and a y measurement — 2² choices per party,
 * 2⁶ = 64 assignments in all. Every assignment predicts XXX·XYY·YXY·YYX = +1 (each a_x, a_y appears exactly twice,
 * squares to 1), but the quantum targets multiply to −1, so NO assignment matches all four — `maxMatches` is 3,
 * the heart of Mermin's "certainty without instructions" contradiction.
 */
export function merminInstructionSets(): { assignments: MerminAssignment[]; maxMatches: number } {
  const settings: { x: 1 | -1; y: 1 | -1 }[] = []
  for (const x of [1, -1] as const) for (const y of [1, -1] as const) settings.push({ x, y })
  const assignments: MerminAssignment[] = []
  for (const p1 of settings) {
    for (const p2 of settings) {
      for (const p3 of settings) {
        const values = {
          XXX: (p1.x * p2.x * p3.x) as 1 | -1,
          XYY: (p1.x * p2.y * p3.y) as 1 | -1,
          YXY: (p1.y * p2.x * p3.y) as 1 | -1,
          YYX: (p1.y * p2.y * p3.x) as 1 | -1,
        }
        const matches = (Object.keys(MERMIN_TARGET) as (keyof typeof MERMIN_TARGET)[]).filter((k) => values[k] === MERMIN_TARGET[k]).length
        assignments.push({ a: [p1, p2, p3], values, matches })
      }
    }
  }
  return { assignments, maxMatches: Math.max(...assignments.map((x) => x.matches)) }
}
