/**
 * Named stabilizer codes, the CSS construction, distances by exhaustive search (where that is feasible) and a lookup decoder.
 *
 * Sources: Bergou Ch. 9 §9.1 pp. 160-166 (bit-flip, phase-flip and the Shor code), §9.2 pp. 168-175 (CSS codes, the Steane code from the
 * [7,4] Hamming code, Eq. 9.53), Ch. 10 §10.1 (stabilizers; the 5-qubit code is the standard cyclic [[5,1,3]]); the rotated surface code is
 * the layout of Horsman, Fowler, Devitt, Van Meter, New J. Phys. 14, 123011 (2012) as described in Fowler et al., Phys. Rev. A 86, 032324.
 * Pure TypeScript.
 *
 * CSS construction: two binary check matrices H_X (X-type checks) and H_Z (Z-type checks) on the same n qubits give a stabilizer code exactly when
 * every X check and every Z check overlap on an even number of qubits, i.e. H_X · H_Zᵀ = 0 over GF(2). Then k = n − rank H_X − rank H_Z. Logical operators
 * are pure X type (vectors in ker H_Z outside the row space of H_X) or pure Z type (ker H_X outside the row space of H_Z), and for a CSS code
 * d = min(d_X, d_Z): any Pauli X^a Z^b in the normalizer that is not a stabilizer has a ∉ rowspace H_X or b ∉ rowspace H_Z, so its weight is at
 * least d_X or d_Z.
 *
 * Distance search: `cssDistance` and `stabilizerDistance` enumerate error patterns by increasing weight w = 1, 2, … and stop at the first
 * one that has zero syndrome and is not a stabilizer element. The cost is Σ_{j ≤ w} C(n, j) (×3^j for a general stabilizer code), so the search is
 * complete for n up to about 25 at any distance (the d = 5 surface code, 25 qubits, costs about 7·10⁴ patterns) and degrades quickly after: the
 * default budget of 5·10⁷ patterns proves d ≥ 7 for the 49-qubit surface code but not d ≥ 9 for the 81-qubit one. When the budget runs out the
 * result says so: `lower` is then a proved lower bound ("no logical operator of smaller weight"), `upper` is whatever witness is known.
 */
import { Echelon, GF2Matrix, packBits } from './gf2'
import { Pauli, type Letter } from './pauli'
import { StabilizerCode } from './stabilizer'

/* ------------------------------------------------------------------ CSS codes ------------------------------------------------------------------ */

export class CSSCode {
  readonly name: string
  readonly n: number
  readonly HX: GF2Matrix
  readonly HZ: GF2Matrix
  private cached: StabilizerCode | null = null

  constructor(HX: GF2Matrix, HZ: GF2Matrix, name = 'CSS code') {
    if (HX.cols !== HZ.cols) throw new Error(`CSSCode: H_X has ${HX.cols} columns, H_Z has ${HZ.cols}`)
    if (!HX.mul(HZ.transpose()).isZero()) throw new Error('CSSCode: H_X · H_Zᵀ ≠ 0 over GF(2): some X check and Z check overlap on an odd number of qubits, so they anticommute')
    this.name = name
    this.n = HX.cols
    this.HX = HX
    this.HZ = HZ
  }

  get rankX(): number {
    return this.HX.rank()
  }

  get rankZ(): number {
    return this.HZ.rank()
  }

  /** k = n − rank H_X − rank H_Z. */
  get k(): number {
    return this.n - this.rankX - this.rankZ
  }

  /** The same code as a general stabilizer code: the X checks as X-strings, then the Z checks as Z-strings (all rows, even if some are redundant). */
  stabilizer(): StabilizerCode {
    if (!this.cached) {
      const gens: Pauli[] = []
      for (let i = 0; i < this.HX.rows; i++) gens.push(new Pauli(this.HX.rowBits(i), new Array<number>(this.n).fill(0)))
      for (let i = 0; i < this.HZ.rows; i++) gens.push(new Pauli(new Array<number>(this.n).fill(0), this.HZ.rowBits(i)))
      this.cached = new StabilizerCode(gens, this.name)
    }
    return this.cached
  }

  /**
   * The syndrome of a Pauli error, split by check type. `z`: outcomes of the Z checks (they detect the error's X part: H_Z · e_x); `x`: outcomes
   * of the X checks (they detect the error's Z part: H_X · e_z). A Y error is both. 1 means the check flipped.
   */
  syndrome(error: Pauli): { x: number[]; z: number[] } {
    if (error.n !== this.n) throw new Error(`syndrome: the error acts on ${error.n} qubits, the code on ${this.n}`)
    return { x: this.HX.mulVec(error.z), z: this.HZ.mulVec(error.x) }
  }

  /** The most 1s in any row (the check weight) and in any column (how many checks one qubit is in), for the pair (H_X, H_Z) together. */
  degrees(): { checkWeight: number; qubitDegree: number } {
    let checkWeight = 0
    for (const H of [this.HX, this.HZ]) for (let i = 0; i < H.rows; i++) checkWeight = Math.max(checkWeight, H.rowWeight(i))
    let qubitDegree = 0
    for (let j = 0; j < this.n; j++) qubitDegree = Math.max(qubitDegree, this.HX.colWeight(j) + this.HZ.colWeight(j))
    return { checkWeight, qubitDegree }
  }

  /**
   * Pure-type logical operators, paired: X̄_i = X^{x_i} and Z̄_j = Z^{z_j} with x_i · z_j = δ_ij (so X̄_i and Z̄_j anticommute exactly when i = j).
   * The representatives come from the null spaces in increasing free-column order, then the Z side is rotated by the inverse of the Gram matrix.
   */
  logicals(): { X: Pauli[]; Z: Pauli[] } {
    const n = this.n
    const pick = (H: GF2Matrix, stab: GF2Matrix): number[][] => {
      const E = new Echelon(n)
      for (let i = 0; i < stab.rows; i++) E.add(stab.rowBits(i))
      const N = H.nullspace()
      const out: number[][] = []
      for (let i = 0; i < N.rows; i++) if (E.add(N.rowBits(i))) out.push(N.rowBits(i))
      return out
    }
    const xs = pick(this.HZ, this.HX)
    const zs = pick(this.HX, this.HZ)
    const k = xs.length
    if (k !== zs.length || k !== this.k) throw new Error(`logicals: found ${k} X-type and ${zs.length} Z-type representatives, expected k = ${this.k}`)
    if (k === 0) return { X: [], Z: [] }
    const Xm = GF2Matrix.fromRows(xs, n)
    const Zm = GF2Matrix.fromRows(zs, n)
    const M = Xm.mul(Zm.transpose()) // M[i][j] = x_i · z_j
    const Z2 = M.inverse().transpose().mul(Zm)
    const zero = new Array<number>(n).fill(0)
    return {
      X: xs.map((v) => new Pauli(v, zero)),
      Z: Array.from({ length: k }, (_, j) => new Pauli(zero, Z2.rowBits(j))),
    }
  }
}

/** The CSS code of (H_X, H_Z); throws unless H_X · H_Zᵀ = 0. */
export const cssCode = (HX: GF2Matrix, HZ: GF2Matrix, name?: string): CSSCode => new CSSCode(HX, HZ, name)

/* ------------------------------------------------------------------ distance search ------------------------------------------------------------------ */

export interface DistanceSearch {
  /** every logical operator of this type has weight ≥ `lower` (proved by exhausting all patterns of smaller weight) */
  lower: number
  /** the weight of the lightest logical operator found (null when none was found within the budget) */
  upper: number | null
  /** a logical operator of weight `upper` (null when none was found) */
  witness: Pauli | null
  /** lower === upper: the minimum weight is known exactly */
  exact: boolean
  /** how many patterns were examined */
  searched: number
}

/** The default number of error patterns a distance search may examine before it stops and reports a lower bound. */
export const DISTANCE_BUDGET = 5e7

const binom = (n: number, k: number): number => {
  if (k < 0 || k > n) return 0
  let r = 1
  for (let i = 1; i <= Math.min(k, n - k); i++) r = (r * (n - i + 1)) / i
  return Math.round(r)
}

/**
 * The lightest vector x with H·x = 0 that is not in the row space of `stab` (for X-type logicals: H = H_Z, stab = H_X), searching weights 1, 2, …
 * up to `maxWeight` or until `budget` patterns have been examined. Returns the weight and the support of the first one found, else the proved bound.
 */
function lightestOutside(H: GF2Matrix, stab: GF2Matrix, maxWeight: number, budget: number): { weight: number | null; support: number[] | null; lower: number; searched: number } {
  const n = H.cols
  const sw = Math.ceil(H.rows / 32)
  // column j of H as a packed syndrome
  const colWords: Uint32Array[] = Array.from({ length: n }, (_, j) => packBits(H.colBits(j)))
  const col1 = new Int32Array(n)
  if (sw === 1) for (let j = 0; j < n; j++) col1[j] = colWords[j][0] | 0
  const E = new Echelon(n)
  for (let i = 0; i < stab.rows; i++) E.add(stab.rowBits(i))
  let searched = 0
  for (let w = 1; w <= Math.min(maxWeight, n); w++) {
    const count = binom(n, w)
    if (searched + count > budget) return { weight: null, support: null, lower: w, searched }
    searched += count
    const chosen = new Array<number>(w).fill(0)
    const hit: { support: number[] | null } = { support: null }
    const test = () => {
      const v = new Array<number>(n).fill(0)
      for (const j of chosen) v[j] = 1
      if (!E.contains(v)) hit.support = chosen.slice()
    }
    if (sw <= 1) {
      const rec = (start: number, depth: number, acc: number): void => {
        if (hit.support) return
        if (depth === w) {
          if (acc === 0) test()
          return
        }
        for (let j = start; j <= n - (w - depth); j++) {
          chosen[depth] = j
          rec(j + 1, depth + 1, acc ^ col1[j])
          if (hit.support) return
        }
      }
      rec(0, 0, 0)
    } else {
      const accs = Array.from({ length: w + 1 }, () => new Uint32Array(sw))
      const rec = (start: number, depth: number): void => {
        if (hit.support) return
        const acc = accs[depth]
        if (depth === w) {
          if (acc.every((x) => x === 0)) test()
          return
        }
        for (let j = start; j <= n - (w - depth); j++) {
          chosen[depth] = j
          const next = accs[depth + 1]
          for (let t = 0; t < sw; t++) next[t] = acc[t] ^ colWords[j][t]
          rec(j + 1, depth + 1)
          if (hit.support) return
        }
      }
      rec(0, 0)
    }
    if (hit.support) return { weight: w, support: hit.support, lower: w, searched }
  }
  return { weight: null, support: null, lower: Math.min(maxWeight, n) + 1, searched }
}

const toResult = (r: ReturnType<typeof lightestOutside>, make: (s: number[]) => Pauli): DistanceSearch => ({
  lower: r.lower,
  upper: r.weight,
  witness: r.support ? make(r.support) : null,
  exact: r.weight !== null,
  searched: r.searched,
})

export interface CssDistance {
  /** X-type logical operators (vectors in ker H_Z outside the row space of H_X) */
  X: DistanceSearch
  /** Z-type logical operators */
  Z: DistanceSearch
  /** d = min(d_X, d_Z) when both are exact; otherwise only `lower` is a claim */
  lower: number
  upper: number | null
  exact: boolean
}

/**
 * The distance of a CSS code by exhaustive search over error patterns by increasing weight (see the file header for the cost and where it stops).
 * `k = 0` codes have no logical operators: the result is then lower = ∞... they are refused. Use `maxWeight` to cap the search (default n).
 */
export function cssDistance(code: CSSCode, opts: { budget?: number; maxWeight?: number } = {}): CssDistance {
  if (code.k === 0) throw new Error('cssDistance: the code encodes no qubits (k = 0), so it has no logical operators')
  const budget = opts.budget ?? DISTANCE_BUDGET
  const maxWeight = opts.maxWeight ?? code.n
  const n = code.n
  const zero = new Array<number>(n).fill(0)
  const fromSupport = (s: number[]): number[] => {
    const v = new Array<number>(n).fill(0)
    for (const j of s) v[j] = 1
    return v
  }
  const X = toResult(lightestOutside(code.HZ, code.HX, maxWeight, budget), (s) => new Pauli(fromSupport(s), zero))
  const Z = toResult(lightestOutside(code.HX, code.HZ, maxWeight, budget), (s) => new Pauli(zero, fromSupport(s)))
  const lower = Math.min(X.lower, Z.lower)
  const upper = X.upper !== null && Z.upper !== null ? Math.min(X.upper, Z.upper) : null
  return { X, Z, lower, upper, exact: X.exact && Z.exact }
}

/**
 * The distance of a general stabilizer code: the lightest Pauli that commutes with every generator but is not ±(a stabilizer element). Enumerates
 * all 3^w C(n, w) Paulis of weight w for w = 1, 2, … within `budget` patterns.
 */
export function stabilizerDistance(code: StabilizerCode, opts: { budget?: number; maxWeight?: number } = {}): DistanceSearch {
  if (code.k === 0) throw new Error('stabilizerDistance: the code encodes no qubits (k = 0)')
  const budget = opts.budget ?? DISTANCE_BUDGET
  const n = code.n
  const maxWeight = Math.min(opts.maxWeight ?? n, n)
  const r = code.generators.length
  const sw = Math.ceil(r / 32)
  // syndrome column of each single-qubit Pauli: letter 0 = X, 1 = Y, 2 = Z
  const letters: Letter[] = ['X', 'Y', 'Z']
  const cols: Uint32Array[][] = Array.from({ length: n }, (_, q) => letters.map((l) => packBits(code.syndrome(Pauli.single(n, q, l)))))
  const col1: Int32Array[] = cols.map((cs) => Int32Array.from(cs.map((c) => (sw === 0 ? 0 : c[0] | 0))))
  let searched = 0
  for (let w = 1; w <= maxWeight; w++) {
    const count = binom(n, w) * 3 ** w
    if (searched + count > budget) return { lower: w, upper: null, witness: null, exact: false, searched }
    searched += count
    const pos = new Array<number>(w).fill(0)
    const let3 = new Array<number>(w).fill(0)
    const hit: { p: Pauli | null } = { p: null }
    const test = () => {
      const p = Pauli.fromLetters(
        Array.from({ length: n }, (_, q) => {
          const i = pos.indexOf(q)
          return i < 0 ? 'I' : letters[let3[i]]
        }),
      )
      if (code.isLogical(p)) hit.p = p
    }
    if (sw <= 1) {
      const rec = (start: number, depth: number, acc: number): void => {
        if (hit.p) return
        if (depth === w) {
          if (acc === 0) test()
          return
        }
        for (let q = start; q <= n - (w - depth); q++) {
          pos[depth] = q
          for (let l = 0; l < 3; l++) {
            let3[depth] = l
            rec(q + 1, depth + 1, acc ^ col1[q][l])
            if (hit.p) return
          }
        }
      }
      rec(0, 0, 0)
    } else {
      const rec = (start: number, depth: number, acc: Uint32Array): void => {
        if (hit.p) return
        if (depth === w) {
          if (acc.every((x) => x === 0)) test()
          return
        }
        for (let q = start; q <= n - (w - depth); q++) {
          pos[depth] = q
          for (let l = 0; l < 3; l++) {
            let3[depth] = l
            const next = new Uint32Array(sw)
            for (let t = 0; t < sw; t++) next[t] = acc[t] ^ cols[q][l][t]
            rec(q + 1, depth + 1, next)
            if (hit.p) return
          }
        }
      }
      rec(0, 0, new Uint32Array(sw))
    }
    if (hit.p) return { lower: w, upper: w, witness: hit.p, exact: true, searched }
  }
  return { lower: maxWeight + 1, upper: null, witness: null, exact: false, searched }
}

/** The number of Pauli errors of weight at most t on n qubits: Σ_{j ≤ t} C(n, j)·3^j (the left side of the quantum Hamming bound). */
export const pauliBallSize = (n: number, t: number): number => {
  let s = 0
  for (let j = 0; j <= t; j++) s += binom(n, j) * 3 ** j
  return s
}

/** The quantum Hamming bound for a nondegenerate code: Σ_{j ≤ t} C(n, j) 3^j ≤ 2^{n−k}. A code meeting it with equality is perfect ([[5,1,3]]). */
export const hammingBound = (n: number, k: number, t: number): { ball: number; syndromes: number; holds: boolean; perfect: boolean } => {
  const ball = pauliBallSize(n, t)
  const syndromes = 2 ** (n - k)
  return { ball, syndromes, holds: ball <= syndromes, perfect: ball === syndromes }
}

/* ------------------------------------------------------------------ a randomized search for light logical operators ------------------------------------------------------------------ */

/**
 * Information-set decoding (Prange 1962, with the Lee–Brickell variant for p = 2) for a light vector x ∈ ker(H) outside rowspace(stab): the way the
 * paper finds its light logical operators ("BP+OSD" there; this is the simplest cheap search). Each round picks a random column order (from `rand`), row-
 * reduces a basis of ker H on it, and examines the rows (and, with `pairs`, the XORs of two rows) of the reduced basis; the lightest candidate outside
 * the row space of `stab` is kept. The result is an UPPER bound on the distance (a witness), never a lower one. Deterministic for a given `rand`.
 */
export function lightLogicalSearch(
  H: GF2Matrix,
  stab: GF2Matrix,
  rand: () => number,
  opts: { rounds: number; pairs?: boolean; target?: number },
): { weight: number; support: number[]; rounds: number } | null {
  const n = H.cols
  const K = H.nullspace()
  const E = new Echelon(n)
  for (let i = 0; i < stab.rows; i++) E.add(stab.rowBits(i))
  const kc = K.rows
  if (kc === 0) return null
  const wordsPer = Math.ceil(n / 32)
  const state: { best: { weight: number; support: number[]; rounds: number } | null } = { best: null }
  const perm = Array.from({ length: n }, (_, i) => i)
  const consider = (words: Uint32Array, inv: number[], rounds: number): void => {
    let w = 0
    for (let t = 0; t < wordsPer; t++) {
      let x = words[t]
      while (x) {
        x &= x - 1
        w++
      }
    }
    if (state.best && w >= state.best.weight) return
    const s: number[] = []
    for (let j = 0; j < n; j++) if ((words[j >> 5] >>> (j & 31)) & 1) s.push(inv[j])
    s.sort((a, b) => a - b)
    const v = new Array<number>(n).fill(0)
    for (const j of s) v[j] = 1
    if (!E.contains(v)) state.best = { weight: w, support: s, rounds }
  }
  for (let round = 1; round <= opts.rounds; round++) {
    for (let i = n - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1))
      ;[perm[i], perm[j]] = [perm[j], perm[i]]
    }
    // column c of the permuted matrix is column perm[c] of K; inv[c] = original index
    const P = new GF2Matrix(kc, n)
    for (let i = 0; i < kc; i++) for (let c = 0; c < n; c++) if (K.get(i, perm[c])) P.set(i, c, 1)
    const { R, pivots } = P.rref()
    const rows: Uint32Array[] = []
    for (let i = 0; i < pivots.length; i++) rows.push(R.data.slice(i * R.stride, (i + 1) * R.stride))
    for (const r of rows) consider(r, perm, round)
    if (opts.pairs) {
      const tmp = new Uint32Array(wordsPer)
      for (let a = 0; a < rows.length; a++)
        for (let b = a + 1; b < rows.length; b++) {
          for (let t = 0; t < wordsPer; t++) tmp[t] = rows[a][t] ^ rows[b][t]
          consider(tmp, perm, round)
        }
    }
    if (state.best && opts.target !== undefined && state.best.weight <= opts.target) break
  }
  return state.best
}

/* ------------------------------------------------------------------ named codes ------------------------------------------------------------------ */

/** The [7,4] Hamming parity-check matrix, columns the numbers 1 … 7 in binary (Bergou Eq. 9.53), rows the bits from least significant. */
export const HAMMING_7_4 = (): GF2Matrix => GF2Matrix.fromText('1010101 0110011 0001111')

/**
 * The n-qubit repetition code. 'bit-flip': Z-type checks Z_iZ_{i+1} (corrects X errors, Bergou §9.1 for n = 3); 'phase-flip': X-type checks X_iX_{i+1}
 * (corrects Z errors). k = 1, and the distance of the code against the errors it was built for is n.
 */
export function repetitionCode(n: number, kind: 'bit-flip' | 'phase-flip' = 'bit-flip'): CSSCode {
  if (!Number.isInteger(n) || n < 2) throw new Error('repetitionCode: n must be a whole number ≥ 2')
  const chain = GF2Matrix.fromSupports(Array.from({ length: n - 1 }, (_, i) => [i, i + 1]), n)
  const none = GF2Matrix.zeros(0, n)
  return kind === 'bit-flip' ? new CSSCode(none, chain, `${n}-qubit bit-flip code`) : new CSSCode(chain, none, `${n}-qubit phase-flip code`)
}

/** Shor's [[9,1,3]] code (Bergou §9.1 pp. 162-165): three blocks of the bit-flip code, protected against phase errors by a phase-flip code across the blocks. */
export function shorCode(): CSSCode {
  const HZ = GF2Matrix.fromSupports([[0, 1], [1, 2], [3, 4], [4, 5], [6, 7], [7, 8]], 9)
  const HX = GF2Matrix.fromSupports([[0, 1, 2, 3, 4, 5], [3, 4, 5, 6, 7, 8]], 9)
  return new CSSCode(HX, HZ, 'Shor [[9,1,3]]')
}

/** Steane's [[7,1,3]] code: C₁ = the [7,4] Hamming code and C₂ = its dual, so H_X = H_Z = the Hamming parity-check matrix (Bergou §9.2 pp. 174-175, Eq. 9.53). */
export function steaneCode(): CSSCode {
  return new CSSCode(HAMMING_7_4(), HAMMING_7_4(), 'Steane [[7,1,3]]')
}

/** The [[5,1,3]] code (Bergou §10.1; Laflamme, Miquel, Paz, Zurek 1996): generators XZZXI and its cyclic shifts. Not CSS. A perfect code. */
export function fiveQubitCode(): StabilizerCode {
  return StabilizerCode.fromStrings(['XZZXI', 'IXZZX', 'XIXZZ', 'ZXIXZ'], '[[5,1,3]]')
}

/** The [[4,2,2]] error-detecting code: X⁴ and Z⁴ (detects any single-qubit error, corrects none). */
export function fourTwoTwoCode(): CSSCode {
  const all = GF2Matrix.fromText('1111')
  return new CSSCode(all, all, '[[4,2,2]]')
}

/* ------------------------------------------------------------------ the rotated surface code ------------------------------------------------------------------ */

export interface SurfaceCheck {
  type: 'X' | 'Z'
  /** data qubits the check acts on (2 on a boundary, 4 in the bulk), increasing */
  qubits: number[]
  /** where to draw it, in the units of `data` (the face center; boundary checks sit half a step outside the lattice) */
  center: [number, number]
  boundary: boolean
}

export interface RotatedSurface {
  d: number
  code: CSSCode
  /** data qubit i = row·d + col, drawn at (x = col, y = row), y growing downward as matrix rows do */
  data: [number, number][]
  checks: SurfaceCheck[]
  /** a pure-X logical operator: X on every qubit of column 0 (weight d) */
  logicalX: number[]
  /** a pure-Z logical operator: Z on every qubit of row 0 (weight d) */
  logicalZ: number[]
}

/**
 * The distance-d rotated surface code for odd d ≥ 3: n = d² data qubits on a d × d grid, d² − 1 checks, k = 1. A bulk face with top-left corner (r, c)
 * (0 ≤ r, c ≤ d − 2) touches the four data qubits (r, c), (r, c+1), (r+1, c), (r+1, c+1) and is an X check when r + c is even, a Z check when it is odd.
 * Weight-2 checks close the boundary: X checks along the top and bottom edges (faces at r = −1 and r = d − 1 with the X parity), Z checks along the left
 * and right edges (faces at c = −1 and c = d − 1 with the Z parity). The logical X is a column of X, the logical Z a row of Z; they share one qubit.
 */
export function rotatedSurfaceCode(d: number): RotatedSurface {
  if (!Number.isInteger(d) || d < 3 || d % 2 === 0) throw new Error('rotatedSurfaceCode: d must be an odd whole number ≥ 3')
  const n = d * d
  const q = (r: number, c: number): number => r * d + c
  const checks: SurfaceCheck[] = []
  const at = (r: number, c: number): number | null => (r >= 0 && r < d && c >= 0 && c < d ? q(r, c) : null)
  for (let r = -1; r <= d - 1; r++)
    for (let c = -1; c <= d - 1; c++) {
      const type: 'X' | 'Z' = (((r + c) % 2) + 2) % 2 === 0 ? 'X' : 'Z'
      const qs = [at(r, c), at(r, c + 1), at(r + 1, c), at(r + 1, c + 1)].filter((x): x is number => x !== null)
      if (qs.length === 4) checks.push({ type, qubits: qs.sort((a, b) => a - b), center: [c + 0.5, r + 0.5], boundary: false })
      else if (qs.length === 2) {
        const top = r === -1 || r === d - 1 // a face on the top or bottom edge
        const side = c === -1 || c === d - 1
        if (top && !side && type === 'X') checks.push({ type, qubits: qs.sort((a, b) => a - b), center: [c + 0.5, r + 0.5], boundary: true })
        if (side && !top && type === 'Z') checks.push({ type, qubits: qs.sort((a, b) => a - b), center: [c + 0.5, r + 0.5], boundary: true })
      }
    }
  const HX = GF2Matrix.fromSupports(checks.filter((k) => k.type === 'X').map((k) => k.qubits), n)
  const HZ = GF2Matrix.fromSupports(checks.filter((k) => k.type === 'Z').map((k) => k.qubits), n)
  const data: [number, number][] = Array.from({ length: n }, (_, i) => [i % d, Math.floor(i / d)])
  return {
    d,
    code: new CSSCode(HX, HZ, `rotated surface code d = ${d}`),
    data,
    checks,
    logicalX: Array.from({ length: d }, (_, r) => q(r, 0)),
    logicalZ: Array.from({ length: d }, (_, c) => q(0, c)),
  }
}

/* ------------------------------------------------------------------ a lookup decoder ------------------------------------------------------------------ */

export interface LookupDecoder {
  /** the heaviest error weight that was enumerated */
  maxWeight: number
  /** syndrome (as a 0/1 string) → the lightest error found with that syndrome (first in enumeration order on ties) */
  table: ReadonlyMap<string, Pauli>
  /** how many syndromes are covered / how many exist (2^rank) */
  covered: number
  total: number
  /** the correction for a syndrome, or null when no enumerated error has it */
  decode(syndrome: readonly number[]): Pauli | null
}

/**
 * A minimum-weight lookup decoder: enumerate every Pauli error of weight 0, 1, …, `maxWeight` (3^w C(n, w) of them, so keep n and t small: n = 9, t = 2
 * is 352 errors; n = 25, t = 2 is 2776) and remember, for each syndrome, the first error that produces it. Because the weights go up, that is a lightest
 * one. Exactly the table of Bergou §9.1 for the 3-qubit codes, and "syndrome → correction" in the lectures.
 */
export function lookupDecoder(code: StabilizerCode, maxWeight: number): LookupDecoder {
  const n = code.n
  const table = new Map<string, Pauli>()
  const letters: Letter[] = ['X', 'Y', 'Z']
  const key = (s: readonly number[]): string => s.join('')
  table.set(key(new Array<number>(code.generators.length).fill(0)), Pauli.identity(n))
  const add = (p: Pauli): void => {
    const k = key(code.syndrome(p))
    if (!table.has(k)) table.set(k, p)
  }
  for (let w = 1; w <= maxWeight; w++) {
    const pos = new Array<number>(w).fill(0)
    const rec = (start: number, depth: number, ls: Letter[]): void => {
      if (depth === w) {
        const row = new Array<Letter>(n).fill('I')
        pos.forEach((q, i) => (row[q] = ls[i]))
        add(Pauli.fromLetters(row))
        return
      }
      for (let q = start; q <= n - (w - depth); q++) {
        pos[depth] = q
        for (const l of letters) rec(q + 1, depth + 1, [...ls, l])
      }
    }
    rec(0, 0, [])
  }
  return {
    maxWeight,
    table,
    covered: table.size,
    total: 2 ** code.rank,
    decode: (s) => table.get(key(s)) ?? null,
  }
}

export type Outcome = 'corrected' | 'logical-error' | 'no-correction'

/**
 * Run one round of error correction on a Pauli error: measure the syndrome, look up the correction, apply it, and classify what is left. The residual
 * (error times correction) always commutes with every generator; it is `corrected` when it lies in the stabilizer group up to sign (the logical state is
 * untouched, even if the correction was a different error with the same effect), a `logical-error` when it is a nontrivial logical operator, and
 * `no-correction` when the table has no entry for the syndrome.
 */
export function correctionOutcome(code: StabilizerCode, decoder: LookupDecoder, error: Pauli): { outcome: Outcome; correction: Pauli | null; residual: Pauli | null } {
  const correction = decoder.decode(code.syndrome(error))
  if (!correction) return { outcome: 'no-correction', correction: null, residual: null }
  const residual = correction.mul(error)
  const trivial = code.membership(residual) !== 'outside'
  return { outcome: trivial ? 'corrected' : 'logical-error', correction, residual }
}
