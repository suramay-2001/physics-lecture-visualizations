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

/* ------------------------------------------------------- instruction sets, in general ------------------------------------------------------- */

export type Sign = 1 | -1

/** One instruction set: every player's fixed answer to every setting, and what it predicts for each row. */
export interface InstructionSet {
  /** `answers[p][letter]`: player p's predetermined ±1 for each setting letter (player 0 is the row string's first letter). */
  answers: Record<string, Sign>[]
  /** the product of the players' answers for each row string: what this assignment predicts for that product observable */
  values: Record<string, Sign>
  /** how many rows' target the assignment matches */
  matches: number
}

export interface InstructionSets {
  /** the setting letters, in order of first appearance across the rows ('ZZZ', 'ZXX' gives Z, X) */
  letters: string[]
  players: number
  /** every assignment: (2^letters)^players of them, player 0 varying slowest, each player's answers in the order (+,+), (+,−), (−,+), (−,−) */
  assignments: InstructionSet[]
  /** the most targets any assignment matches */
  maxMatches: number
  /** how many assignments match exactly k targets, keyed by k */
  histogram: Record<number, number>
  /** the product of the predicted values over all rows: the same sign for EVERY assignment when each letter appears an even number of times per player */
  rowsProduct: Sign | null
  /** the product of the targets: when it differs from `rowsProduct`, no assignment can match every row */
  targetsProduct: Sign
}

/**
 * Every classical "instruction set" for a game or a Bell/Mermin-type argument in which each of the n players (1–3) holds one of
 * the setting letters (two or three of them, e.g. Z and X, or X, Y and Z) and a row such as 'ZXX' asks for the product of the three
 * answers: each player fixes in advance an answer ±1 for EVERY letter, so there are (2^letters)^players assignments. The set
 * predicts each row as the product of the players' answers; `targets` says which product each row should have, and the set
 * `matches` the rows where the two agree. `rowsProduct` is the product of the predictions over all rows (the same for every
 * assignment whenever each letter appears an even number of times in each player's column); it differs from `targetsProduct` for
 * Mermin's rows (448 L10's GHZ game and the notes' Mermin argument alike), so NO assignment matches every row.
 */
export function instructionSets(rows: readonly string[], targets: Readonly<Record<string, Sign>>, letters?: readonly string[]): InstructionSets {
  if (rows.length === 0) throw new Error('instructionSets: no rows')
  const players = rows[0].length
  if (players < 1 || players > 3) throw new Error('instructionSets: one to three players')
  if (rows.some((r) => r.length !== players)) throw new Error('instructionSets: every row needs one letter per player')
  if (new Set(rows).size !== rows.length) throw new Error('instructionSets: the rows must be distinct')
  const seen = letters ? [...letters] : [...new Set(rows.flatMap((r) => [...r]))]
  if (seen.length < 1 || seen.length > 3 || new Set(seen).size !== seen.length) throw new Error('instructionSets: one to three distinct setting letters')
  if (rows.some((r) => [...r].some((ch) => !seen.includes(ch)))) throw new Error('instructionSets: a row uses a letter that is not a setting')
  for (const r of rows) if (targets[r] !== 1 && targets[r] !== -1) throw new Error(`instructionSets: row "${r}" needs a target of +1 or −1`)
  if (Object.keys(targets).some((k) => !rows.includes(k))) throw new Error('instructionSets: a target names a row that is not in the game')
  // one player's possible answer sheets: the first letter varies slowest, +1 before −1
  const sheets: Record<string, Sign>[] = [{}]
  for (const ch of seen) {
    const next: Record<string, Sign>[] = []
    for (const s of sheets) for (const v of [1, -1] as const) next.push({ ...s, [ch]: v })
    sheets.splice(0, sheets.length, ...next)
  }
  let combos: Record<string, Sign>[][] = [[]]
  for (let p = 0; p < players; p++) combos = combos.flatMap((prefix) => sheets.map((sheet) => [...prefix, sheet]))
  const assignments: InstructionSet[] = combos.map((answers) => {
    const values: Record<string, Sign> = {}
    for (const r of rows) values[r] = [...r].reduce((prod, ch, p) => (prod * answers[p][ch]) as Sign, 1 as Sign)
    return { answers, values, matches: rows.filter((r) => values[r] === targets[r]).length }
  })
  const histogram: Record<number, number> = {}
  for (const a of assignments) histogram[a.matches] = (histogram[a.matches] ?? 0) + 1
  const productOf = (a: InstructionSet): Sign => rows.reduce((prod, r) => (prod * a.values[r]) as Sign, 1 as Sign)
  const first = productOf(assignments[0])
  const same = assignments.every((a) => productOf(a) === first)
  return {
    letters: seen,
    players,
    assignments,
    maxMatches: Math.max(...assignments.map((a) => a.matches)),
    histogram,
    rowsProduct: same ? first : null,
    targetsProduct: rows.reduce((prod, r) => (prod * targets[r]) as Sign, 1 as Sign),
  }
}

/**
 * Every classical "instruction set" for Mermin's 3-qubit GHZ argument (notes L6 pp. 29–32, L7 pp. 33–34; Q7): each
 * of the 3 parties fixes in advance an outcome a_x, a_y ∈ {±1} for an x and a y measurement — 2² choices per party,
 * 2⁶ = 64 assignments in all. Every assignment predicts XXX·XYY·YXY·YYX = +1 (each a_x, a_y appears exactly twice,
 * squares to 1), but the quantum targets multiply to −1, so NO assignment matches all four — `maxMatches` is 3,
 * the heart of Mermin's "certainty without instructions" contradiction. (A view of the general `instructionSets`, which 448
 * Lecture 10's GHZ game uses too; the output, down to the order of the assignments, is the one this function always gave.)
 */
export function merminInstructionSets(): { assignments: MerminAssignment[]; maxMatches: number } {
  const g = instructionSets(['XXX', 'XYY', 'YXY', 'YYX'], MERMIN_TARGET, ['X', 'Y'])
  const assignments: MerminAssignment[] = g.assignments.map((s) => ({
    a: s.answers.map((p) => ({ x: p.X, y: p.Y })),
    values: { XXX: s.values.XXX, XYY: s.values.XYY, YXY: s.values.YXY, YYX: s.values.YYX },
    matches: s.matches,
  }))
  return { assignments, maxMatches: g.maxMatches }
}

/* ------------------------------------------------------------ Chapter F7: gates as maps, counting, cost ------------------------------------------------------------ */

/** The bit string of x on n places, most significant (q0) first: bitString(6, 3) is '110'. */
export const bitString = (x: number, n: number): string => x.toString(2).padStart(n, '0')
/** The number a string of 0s and 1s stands for: parseBits('110') is 6. */
export function parseBits(s: string): number {
  if (!/^[01]+$/.test(s)) throw new Error(`parseBits: "${s}" is not a string of 0s and 1s`)
  return parseInt(s, 2)
}

/** The gates F7 draws as maps of bit strings (N&C §3.1.2 pp. 129–133, §3.2.5 pp. 156–160). */
export const BITS_GATES = ['NOT', 'AND', 'OR', 'XOR', 'NAND', 'CNOT', 'SWAP', 'Toffoli', 'Fredkin'] as const
export type BitsGate = (typeof BITS_GATES)[number]
/** A map from n bits to m bits: out[x] is the output string, read as a number (the first bit most significant). */
export interface GateTable {
  n: number
  m: number
  out: number[]
}
const bitAt = (x: number, k: number, n: number): number => (x >> (n - 1 - k)) & 1
const fromBits = (...b: number[]): number => b.reduce((s, v) => 2 * s + v, 0)

/**
 * The truth table of a named gate as a map {0,1}ⁿ → {0,1}ᵐ. AND, OR, XOR and NAND read two bits and return one; NOT one and one;
 * CNOT (control = the first bit) keeps the first and XORs it into the second; SWAP exchanges the two bits; Toffoli (the first two bits
 * control) XORs their AND into the third; Fredkin (the first bit controls) swaps the last two when it is 1. Built from the gates'
 * definitions bit by bit, never from a pre-written list of outputs.
 */
export function gateTable(name: BitsGate): GateTable {
  const spec: Record<BitsGate, { n: number; m: number; f: (b: number[]) => number[] }> = {
    NOT: { n: 1, m: 1, f: ([a]) => [1 ^ a] },
    AND: { n: 2, m: 1, f: ([a, b]) => [a & b] },
    OR: { n: 2, m: 1, f: ([a, b]) => [a | b] },
    XOR: { n: 2, m: 1, f: ([a, b]) => [a ^ b] },
    NAND: { n: 2, m: 1, f: ([a, b]) => [1 ^ (a & b)] },
    CNOT: { n: 2, m: 2, f: ([a, b]) => [a, a ^ b] },
    SWAP: { n: 2, m: 2, f: ([a, b]) => [b, a] },
    Toffoli: { n: 3, m: 3, f: ([a, b, c]) => [a, b, c ^ (a & b)] },
    Fredkin: { n: 3, m: 3, f: ([a, b, c]) => (a ? [a, c, b] : [a, b, c]) },
  }
  const s = spec[name]
  if (!s) throw new Error(`gateTable: unknown gate "${name}"`)
  const out = Array.from({ length: 2 ** s.n }, (_, x) => fromBits(...s.f(Array.from({ length: s.n }, (_, k) => bitAt(x, k, s.n)))))
  return { n: s.n, m: s.m, out }
}

/** The table of an authored function: 2ⁿ rows of m output bits (values 0 … 2ᵐ − 1), n and m each 1 … 3. Throws on any other shape. */
export function checkTable(out: readonly number[], n: number, m: number): GateTable {
  if (!Number.isInteger(n) || n < 1 || n > 3) throw new Error('table: n is 1, 2 or 3 input bits')
  if (!Number.isInteger(m) || m < 1 || m > 3) throw new Error('table: m is 1, 2 or 3 output bits')
  if (out.length !== 2 ** n) throw new Error(`table: ${n} input bits need ${2 ** n} rows (got ${out.length})`)
  if (!out.every((v) => Number.isInteger(v) && v >= 0 && v < 2 ** m)) throw new Error(`table: every output is a whole number 0 … ${2 ** m - 1}`)
  return { n, m, out: [...out] }
}

/** How many inputs the map sends to the output v. */
export const preimageCount = (out: readonly number[], v: number): number => out.filter((o) => o === v).length
/** The largest number of inputs any one output receives (1 for a permutation). */
export const maxPreimages = (out: readonly number[]): number => Math.max(...out.map((v) => preimageCount(out, v)))
/** A reversible map: as many outputs as inputs, and every input has its own output (a bijection of the bit strings). */
export function isBijection(out: readonly number[], m: number): boolean {
  return out.length === 2 ** m && new Set(out).size === out.length && out.every((v) => Number.isInteger(v) && v >= 0 && v < 2 ** m)
}
/** g after f for two maps on the same strings: the output at x is g[f[x]]. */
export const composeMaps = (f: readonly number[], g: readonly number[]): number[] => f.map((v) => g[v])
/** A map that undoes itself: doing it twice gives every input back. */
export const isInvolution = (perm: readonly number[]): boolean => composeMaps(perm, perm).every((v, x) => v === x)

/**
 * Every map from n bits to m bits, listed one by one (only while there are at most 65536 of them): how many there are, (2ᵐ)^(2ⁿ), and
 * how many of those are bijections (n = m only), which for two bits is 4! = 24 of 4⁴ = 256 (N&C §3.2.5, p. 153: the reversible ones).
 */
export function mapCensus(n: number, m: number): { total: number; bijections: number } {
  if (!Number.isInteger(n) || !Number.isInteger(m) || n < 1 || m < 1) throw new Error('mapCensus: n and m are whole numbers from 1')
  const rows = 2 ** n
  const per = 2 ** m
  if (per ** rows > 65536) throw new Error('mapCensus: too many maps to list one by one (at most 65536)')
  let total = 0
  let bijections = 0
  for (let code = 0; code < per ** rows; code++) {
    const out = Array.from({ length: rows }, (_, x) => Math.floor(code / per ** x) % per)
    total++
    if (n === m && isBijection(out, m)) bijections++
  }
  return { total, bijections }
}

/** The number of Boolean functions of n bits, counted by listing every truth table (n ≤ 4: up to 65536 tables of 16 rows). */
export function booleanCount(n: number): number {
  return functionCensus(n).total
}
/** Every function of n bits sorted by kind: how many are constant, balanced, or neither (n ≤ 4, by listing every table). */
export function functionCensus(n: number): { total: number; constant: number; balanced: number; neither: number } {
  if (!Number.isInteger(n) || n < 1 || n > 4) throw new Error('functionCensus: n is 1 … 4 (every table is listed)')
  const rows = 2 ** n
  let constant = 0
  let balanced = 0
  let total = 0
  for (let code = 0; code < 2 ** rows; code++) {
    total++
    const t = Array.from({ length: rows }, (_, x) => ((code >> x) & 1) as Bit)
    if (isConstant(t)) constant++
    else if (isBalanced(t)) balanced++
  }
  return { total, constant, balanced, neither: total - constant - balanced }
}

/** Boltzmann's constant (J/K) and the electron-volt (J), exact in the 2019 SI. */
export const K_B = 1.380649e-23
export const EV = 1.602176634e-19
/** Landauer's least heat for erasing one bit at temperature T (kelvin): k_B T ln 2, in joules (N&C §3.2.5, p. 153). */
export function landauerJ(T: number): number {
  if (!(T > 0) || !Number.isFinite(T)) throw new Error('landauerJ: T is a positive temperature in kelvin')
  return K_B * T * Math.LN2
}
/** The same least heat in electron-volts. */
export const landauerEV = (T: number): number => landauerJ(T) / EV

/** The comparisons of the sort that compares every pair once (N&C §3.2.2, p. 138), counted by running the double loop: n(n − 1)/2. */
export function pairwiseSortComparisons(n: number): number {
  if (!Number.isInteger(n) || n < 0 || n > 1e5) throw new Error('pairwiseSortComparisons: n is a whole number up to 100000')
  let count = 0
  for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) count++
  return count
}
/** The cost curves F7 compares: n², 2ⁿ and √(2ⁿ) = 2^(n/2). */
export const quadraticCost = (n: number): number => n * n
export const exponentialCost = (n: number): number => 2 ** n
export const rootExponentialCost = (n: number): number => 2 ** (n / 2)
/** (3n² + 5n + 7)/n²: the ratio that settles 3n² + 5n + 7 = O(n²) (N&C §3.2.1, p. 136). */
export const bigORatio = (n: number): number => (3 * n * n + 5 * n + 7) / (n * n)
/**
 * The least n₀ with f(n) ≤ c·g(n) for every whole n from n₀ up to `limit` (default 10 000): the n₀ of the definition f = O(g). Returns
 * null when the bound fails at `limit` itself (no n₀ was found).
 */
export function bigOThreshold(f: (n: number) => number, g: (n: number) => number, c: number, limit = 10000): number | null {
  if (f(limit) > c * g(limit)) return null
  let n0 = 1
  for (let n = 1; n <= limit; n++) if (f(n) > c * g(n)) n0 = n + 1
  return n0
}

/** The 2-to-1 function with period s on n bits: f(x) = f(x ⊕ s), taken as the smaller of x and x ⊕ s (Simon's promise, Bergou §7.4, p. 126). */
export function periodicTable(s: number, n: number): number[] {
  if (!Number.isInteger(n) || n < 1 || n > 3) throw new Error('periodicTable: n is 1, 2 or 3')
  if (!Number.isInteger(s) || s < 1 || s >= 2 ** n) throw new Error(`periodicTable: s is a nonzero string of ${n} bits`)
  return Array.from({ length: 2 ** n }, (_, x) => Math.min(x, x ^ s))
}

/** One move of Gauss–Jordan elimination over GF(2): swap rows a and b, or add (XOR) row a into row b. */
export interface Gf2Step {
  op: 'swap' | 'xor'
  a: number
  b: number
  /** The matrix after this move. */
  R: Bit[][]
}
/**
 * The same elimination as `gf2RowReduce`, one move at a time: the start, then a snapshot after every row swap and every row XOR. The
 * last snapshot is the reduced row echelon form that `gf2RowReduce` returns (pivots and rank included).
 */
export function gf2RowReduceSteps(M: readonly (readonly number[])[]): { start: Bit[][]; steps: Gf2Step[]; R: Bit[][]; pivots: number[]; rank: number } {
  const R = mod2(M)
  const start = R.map((row) => [...row])
  const rows = R.length
  const cols = rows ? R[0].length : 0
  const steps: Gf2Step[] = []
  const pivots: number[] = []
  let r = 0
  for (let col = 0; col < cols && r < rows; col++) {
    let p = r
    while (p < rows && R[p][col] === 0) p++
    if (p === rows) continue
    if (p !== r) {
      ;[R[p], R[r]] = [R[r], R[p]]
      steps.push({ op: 'swap', a: r, b: p, R: R.map((row) => [...row]) })
    }
    for (let i = 0; i < rows; i++)
      if (i !== r && R[i][col] === 1) {
        R[i] = R[i].map((x, j) => (x ^ R[r][j]) as Bit)
        steps.push({ op: 'xor', a: r, b: i, R: R.map((row) => [...row]) })
      }
    pivots.push(col)
    r++
  }
  return { start, steps, R, pivots, rank: pivots.length }
}

/** Every vector of the span of the given GF(2) vectors (each a 0/1 array of n places), as numbers 0 … 2ⁿ − 1, sorted: a null space with all its members listed. */
export function gf2Span(basis: readonly (readonly number[])[], n: number): number[] {
  if (basis.some((v) => v.length !== n)) throw new Error(`gf2Span: every vector has ${n} places`)
  const seen = new Set<number>([0])
  for (const v of basis) {
    const x = parseBits(v.join(''))
    for (const s of [...seen]) seen.add(s ^ x)
  }
  return [...seen].sort((p, q) => p - q)
}
/** The check results M·w of a word w (a string of bits), as a bit string: the syndrome when w is a received word or an error pattern. */
export function syndromeOf(M: readonly (readonly number[])[], word: string): string {
  const w = [...word].map(Number)
  if (M[0] && M[0].length !== w.length) throw new Error('syndromeOf: the word needs one bit per column of M')
  return gf2MatVec(M, w).join('')
}
