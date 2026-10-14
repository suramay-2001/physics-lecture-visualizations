/**
 * Matrices over GF(2) (the field with two elements, addition = XOR) for the error-correction engine (Bergou Ch. 9 §9.2 pp. 168-175 for
 * parity-check matrices and the CSS construction; the paper `paper-tdg` §2.1 / App. A.1 for the bivariate bicycle codes). Pure TypeScript.
 *
 * Representation: a matrix keeps each row as `stride = ceil(cols / 32)` unsigned 32-bit words, column j in word `j >> 5`, bit `j & 31`
 * (least significant bit first). Everything is deterministic: no random numbers, no hash ordering, and every method returns plain data
 * (a new matrix, a 0/1 array or a list of indices in increasing order). Vectors are `Bits`: arrays of 0 and 1.
 *
 * Conventions used by the rest of the module (pauli.ts, stabilizer.ts, codes.ts, bb.ts):
 *   - a check matrix H has one ROW per check and one COLUMN per qubit; a vector x is a row of 0/1 over the qubits;
 *   - `H.mulVec(x)` is the column vector H·x (the syndrome of x), `H.leftMulVec(y)` is the row vector y·H (a combination of rows);
 *   - `rref()` gives the REDUCED row echelon form: pivots in increasing column order, each pivot column cleared above and below;
 *   - `nullspace()` returns a basis of {x : H·x = 0} as ROWS, one per free column, in increasing free-column order.
 * The package `physics/qc/bits.ts` has array-of-arrays versions of rank, nullspace and solve for the 709 cryptography chapters; the tests
 * here compare the two on random matrices.
 */

/** A vector over GF(2): entries are 0 or 1. */
export type Bits = readonly number[]

/** Number of set bits in a 32-bit word (Hacker's Delight, the SWAR route). */
export function popcount(x: number): number {
  let v = x >>> 0
  v -= (v >>> 1) & 0x55555555
  v = (v & 0x33333333) + ((v >>> 2) & 0x33333333)
  v = (v + (v >>> 4)) & 0x0f0f0f0f
  return Math.imul(v, 0x01010101) >>> 24
}

/** The Hamming weight of a 0/1 vector. */
export const weight = (v: Bits): number => v.reduce((s, b) => s + (b & 1), 0)

/** The dot product of two 0/1 vectors mod 2 (the parity of the positions where both are 1). */
export function dot(a: Bits, b: Bits): number {
  if (a.length !== b.length) throw new Error(`dot: lengths ${a.length} and ${b.length} differ`)
  let s = 0
  for (let i = 0; i < a.length; i++) s ^= a[i] & b[i] & 1
  return s
}

/** The XOR of two 0/1 vectors. */
export function xorBits(a: Bits, b: Bits): number[] {
  if (a.length !== b.length) throw new Error(`xorBits: lengths ${a.length} and ${b.length} differ`)
  return a.map((x, i) => (x ^ b[i]) & 1)
}

/** The indices of the 1s of a vector, in increasing order. */
export const support = (v: Bits): number[] => v.flatMap((b, i) => (b & 1 ? [i] : []))

/** A length-n vector with 1s exactly at the listed positions. */
export function fromSupport(positions: readonly number[], n: number): number[] {
  const v = new Array<number>(n).fill(0)
  for (const p of positions) {
    if (!Number.isInteger(p) || p < 0 || p >= n) throw new Error(`fromSupport: position ${p} is outside 0 … ${n - 1}`)
    v[p] ^= 1
  }
  return v
}

export class GF2Matrix {
  readonly rows: number
  readonly cols: number
  /** words per row */
  readonly stride: number
  /** row-major packed bits, length rows × stride (mutated only by `set` and by the builders in this file) */
  readonly data: Uint32Array

  constructor(rows: number, cols: number, data?: Uint32Array) {
    if (!Number.isInteger(rows) || !Number.isInteger(cols) || rows < 0 || cols < 0) throw new Error(`GF2Matrix: bad shape ${rows} × ${cols}`)
    this.rows = rows
    this.cols = cols
    this.stride = Math.ceil(cols / 32)
    if (data && data.length !== rows * this.stride) throw new Error('GF2Matrix: data has the wrong length')
    this.data = data ?? new Uint32Array(rows * this.stride)
  }

  /* ------------------------------------------------------------------ builders ------------------------------------------------------------------ */

  static zeros(rows: number, cols: number): GF2Matrix {
    return new GF2Matrix(rows, cols)
  }

  static identity(n: number): GF2Matrix {
    const M = new GF2Matrix(n, n)
    for (let i = 0; i < n; i++) M.set(i, i, 1)
    return M
  }

  /** From rows of 0/1 (every entry must be exactly 0 or 1). `cols` is needed only for an empty list. */
  static fromRows(rows: readonly Bits[], cols?: number): GF2Matrix {
    const c = cols ?? rows[0]?.length ?? 0
    const M = new GF2Matrix(rows.length, c)
    rows.forEach((r, i) => {
      if (r.length !== c) throw new Error(`fromRows: row ${i} has ${r.length} entries, expected ${c}`)
      r.forEach((b, j) => {
        if (b !== 0 && b !== 1) throw new Error(`fromRows: entry (${i}, ${j}) is ${b}, expected 0 or 1`)
        if (b) M.set(i, j, 1)
      })
    })
    return M
  }

  /** From the support of each row: row i has 1s at the listed columns (a repeated column cancels, as XOR does). */
  static fromSupports(supports: readonly (readonly number[])[], cols: number): GF2Matrix {
    const M = new GF2Matrix(supports.length, cols)
    supports.forEach((s, i) =>
      s.forEach((j) => {
        if (!Number.isInteger(j) || j < 0 || j >= cols) throw new Error(`fromSupports: column ${j} is outside 0 … ${cols - 1}`)
        M.set(i, j, M.get(i, j) ^ 1)
      }),
    )
    return M
  }

  /** The matrix of a 0/1 text grid, rows separated by newlines or spaces: `'1010 0101'` is a 2 × 4 matrix. */
  static fromText(text: string): GF2Matrix {
    const rows = text.trim().split(/[\s,;]+/).filter((r) => r.length > 0)
    return GF2Matrix.fromRows(rows.map((r) => r.split('').map((ch) => (ch === '1' ? 1 : ch === '0' ? 0 : NaN))), rows[0]?.length ?? 0)
  }

  /** The permutation matrix P with P[i][perm[i]] = 1 (row i has its single 1 in column perm[i]). */
  static permutation(perm: readonly number[]): GF2Matrix {
    const n = perm.length
    const seen = new Array<boolean>(n).fill(false)
    for (const p of perm) {
      if (!Number.isInteger(p) || p < 0 || p >= n || seen[p]) throw new Error('permutation: not a permutation of 0 … n−1')
      seen[p] = true
    }
    const M = new GF2Matrix(n, n)
    perm.forEach((p, i) => M.set(i, p, 1))
    return M
  }

  /* ------------------------------------------------------------------ entries and rows ------------------------------------------------------------------ */

  get(i: number, j: number): number {
    return (this.data[i * this.stride + (j >> 5)] >>> (j & 31)) & 1
  }

  set(i: number, j: number, v: number): void {
    if (i < 0 || i >= this.rows || j < 0 || j >= this.cols) throw new Error(`set: (${i}, ${j}) is outside the ${this.rows} × ${this.cols} matrix`)
    const k = i * this.stride + (j >> 5)
    const bit = 1 << (j & 31)
    this.data[k] = v & 1 ? this.data[k] | bit : this.data[k] & ~bit
  }

  clone(): GF2Matrix {
    return new GF2Matrix(this.rows, this.cols, this.data.slice())
  }

  /** Row i as a 0/1 array. */
  rowBits(i: number): number[] {
    return Array.from({ length: this.cols }, (_, j) => this.get(i, j))
  }

  /** The columns holding a 1 in row i, increasing. */
  rowSupport(i: number): number[] {
    const out: number[] = []
    for (let j = 0; j < this.cols; j++) if (this.get(i, j)) out.push(j)
    return out
  }

  rowWeight(i: number): number {
    let w = 0
    for (let k = 0; k < this.stride; k++) w += popcount(this.data[i * this.stride + k])
    return w
  }

  /** Column j as a 0/1 array. */
  colBits(j: number): number[] {
    return Array.from({ length: this.rows }, (_, i) => this.get(i, j))
  }

  colWeight(j: number): number {
    let w = 0
    for (let i = 0; i < this.rows; i++) w += this.get(i, j)
    return w
  }

  /** All entries as an array of 0/1 rows (what a fixture or a drawing wants). */
  toRows(): number[][] {
    return Array.from({ length: this.rows }, (_, i) => this.rowBits(i))
  }

  /** The matrix as text, one row per line (`1010`). */
  toText(): string {
    return this.toRows().map((r) => r.join('')).join('\n')
  }

  /** The number of 1s in the whole matrix. */
  totalWeight(): number {
    let w = 0
    for (let k = 0; k < this.data.length; k++) w += popcount(this.data[k])
    return w
  }

  isZero(): boolean {
    return this.data.every((w) => w === 0)
  }

  equals(B: GF2Matrix): boolean {
    return this.rows === B.rows && this.cols === B.cols && this.data.every((w, k) => w === B.data[k])
  }

  /* ------------------------------------------------------------------ arithmetic ------------------------------------------------------------------ */

  transpose(): GF2Matrix {
    const T = new GF2Matrix(this.cols, this.rows)
    for (let i = 0; i < this.rows; i++) for (let j = 0; j < this.cols; j++) if (this.get(i, j)) T.set(j, i, 1)
    return T
  }

  add(B: GF2Matrix): GF2Matrix {
    if (this.rows !== B.rows || this.cols !== B.cols) throw new Error(`add: shapes ${this.rows}×${this.cols} and ${B.rows}×${B.cols} differ`)
    const C = this.clone()
    for (let k = 0; k < C.data.length; k++) C.data[k] ^= B.data[k]
    return C
  }

  /** The matrix product over GF(2): row i of the result is the XOR of those rows of B that row i of this matrix selects. */
  mul(B: GF2Matrix): GF2Matrix {
    if (this.cols !== B.rows) throw new Error(`mul: ${this.rows}×${this.cols} times ${B.rows}×${B.cols}`)
    const C = new GF2Matrix(this.rows, B.cols)
    for (let i = 0; i < this.rows; i++)
      for (let k = 0; k < this.cols; k++)
        if (this.get(i, k)) for (let w = 0; w < B.stride; w++) C.data[i * C.stride + w] ^= B.data[k * B.stride + w]
    return C
  }

  /** H·x for a 0/1 vector x of length `cols` (the syndrome of x when H is a check matrix): entry i is the parity of row i AND x. */
  mulVec(x: Bits): number[] {
    if (x.length !== this.cols) throw new Error(`mulVec: vector has ${x.length} entries, matrix has ${this.cols} columns`)
    const px = packBits(x)
    return Array.from({ length: this.rows }, (_, i) => {
      let p = 0
      for (let k = 0; k < this.stride; k++) p ^= popcount(this.data[i * this.stride + k] & px[k])
      return p & 1
    })
  }

  /** y·H for a 0/1 vector y of length `rows`: the XOR of the rows y selects. */
  leftMulVec(y: Bits): number[] {
    if (y.length !== this.rows) throw new Error(`leftMulVec: vector has ${y.length} entries, matrix has ${this.rows} rows`)
    const acc = new Uint32Array(this.stride)
    y.forEach((b, i) => {
      if (b & 1) for (let k = 0; k < this.stride; k++) acc[k] ^= this.data[i * this.stride + k]
    })
    return unpackBits(acc, this.cols)
  }

  /** [this | B]: side by side. */
  hstack(B: GF2Matrix): GF2Matrix {
    if (this.rows !== B.rows) throw new Error(`hstack: ${this.rows} and ${B.rows} rows`)
    const C = new GF2Matrix(this.rows, this.cols + B.cols)
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.cols; j++) if (this.get(i, j)) C.set(i, j, 1)
      for (let j = 0; j < B.cols; j++) if (B.get(i, j)) C.set(i, this.cols + j, 1)
    }
    return C
  }

  /** this above B. */
  vstack(B: GF2Matrix): GF2Matrix {
    if (this.cols !== B.cols) throw new Error(`vstack: ${this.cols} and ${B.cols} columns`)
    const C = new GF2Matrix(this.rows + B.rows, this.cols)
    C.data.set(this.data, 0)
    C.data.set(B.data, this.data.length)
    return C
  }

  /** The Kronecker product: block (i, j) of the result is this[i][j]·B, so the result is (rows·B.rows) × (cols·B.cols). */
  kron(B: GF2Matrix): GF2Matrix {
    const C = new GF2Matrix(this.rows * B.rows, this.cols * B.cols)
    for (let i = 0; i < this.rows; i++)
      for (let j = 0; j < this.cols; j++)
        if (this.get(i, j))
          for (let p = 0; p < B.rows; p++) for (let q = 0; q < B.cols; q++) if (B.get(p, q)) C.set(i * B.rows + p, j * B.cols + q, 1)
    return C
  }

  /** Rows `from` … `to − 1` as a new matrix. */
  sliceRows(from: number, to: number): GF2Matrix {
    const C = new GF2Matrix(to - from, this.cols)
    C.data.set(this.data.subarray(from * this.stride, to * this.stride))
    return C
  }

  /** Columns `from` … `to − 1` as a new matrix. */
  sliceCols(from: number, to: number): GF2Matrix {
    const C = new GF2Matrix(this.rows, to - from)
    for (let i = 0; i < this.rows; i++) for (let j = from; j < to; j++) if (this.get(i, j)) C.set(i, j - from, 1)
    return C
  }

  /** The listed rows, in the order given, as a new matrix. */
  pickRows(idx: readonly number[]): GF2Matrix {
    const C = new GF2Matrix(idx.length, this.cols)
    idx.forEach((r, i) => C.data.set(this.data.subarray(r * this.stride, (r + 1) * this.stride), i * this.stride))
    return C
  }

  /* ------------------------------------------------------------------ elimination ------------------------------------------------------------------ */

  /** In-place reduced row echelon form on this matrix's own data, pivoting only in the first `pivotCols` columns. Returns the pivots. */
  private reduceInPlace(pivotCols: number): number[] {
    const pivots: number[] = []
    let r = 0
    for (let c = 0; c < pivotCols && r < this.rows; c++) {
      const w = c >> 5
      const bit = 1 << (c & 31)
      let p = -1
      for (let i = r; i < this.rows; i++)
        if (this.data[i * this.stride + w] & bit) {
          p = i
          break
        }
      if (p < 0) continue
      if (p !== r)
        for (let k = 0; k < this.stride; k++) {
          const t = this.data[p * this.stride + k]
          this.data[p * this.stride + k] = this.data[r * this.stride + k]
          this.data[r * this.stride + k] = t
        }
      for (let i = 0; i < this.rows; i++)
        if (i !== r && this.data[i * this.stride + w] & bit) for (let k = 0; k < this.stride; k++) this.data[i * this.stride + k] ^= this.data[r * this.stride + k]
      pivots.push(c)
      r++
    }
    return pivots
  }

  /** The reduced row echelon form, with the pivot columns; the input matrix is not changed. The first `rank` rows of R are the nonzero ones. */
  rref(): { R: GF2Matrix; pivots: number[] } {
    const R = this.clone()
    const pivots = R.reduceInPlace(R.cols)
    return { R, pivots }
  }

  /** The rank over GF(2) (the number of pivots). */
  rank(): number {
    return this.rref().pivots.length
  }

  /** The nonzero rows of the reduced row echelon form: an independent set of rows with the same row space. */
  rowBasis(): GF2Matrix {
    const { R, pivots } = this.rref()
    return R.sliceRows(0, pivots.length)
  }

  /** A basis of {x : H·x = 0} as rows, one per free column (increasing); `cols − rank` rows. */
  nullspace(): GF2Matrix {
    const { R, pivots } = this.rref()
    const isPivot = new Set(pivots)
    const free: number[] = []
    for (let j = 0; j < this.cols; j++) if (!isPivot.has(j)) free.push(j)
    const N = new GF2Matrix(free.length, this.cols)
    free.forEach((f, t) => {
      N.set(t, f, 1)
      pivots.forEach((pc, r) => {
        if (R.get(r, f)) N.set(t, pc, 1)
      })
    })
    return N
  }

  /** A vector c with c·H = v (v a combination of the rows of H), or null when v is not in the row space. Uses the augmented matrix [H | I]. */
  solveRowCombination(v: Bits): number[] | null {
    if (v.length !== this.cols) throw new Error(`solveRowCombination: vector has ${v.length} entries, matrix has ${this.cols} columns`)
    const aug = this.hstack(GF2Matrix.identity(this.rows))
    const pivots = aug.reduceInPlace(this.cols)
    const target = new GF2Matrix(1, aug.cols)
    v.forEach((b, j) => b && target.set(0, j, 1))
    pivots.forEach((pc, r) => {
      if (target.get(0, pc)) for (let k = 0; k < target.stride; k++) target.data[k] ^= aug.data[r * aug.stride + k]
    })
    for (let j = 0; j < this.cols; j++) if (target.get(0, j)) return null
    return Array.from({ length: this.rows }, (_, i) => target.get(0, this.cols + i))
  }

  /** The inverse of a square invertible matrix (reduce [M | I] and read the right block); throws when the matrix is singular. */
  inverse(): GF2Matrix {
    if (this.rows !== this.cols) throw new Error(`inverse: the matrix is ${this.rows} × ${this.cols}, not square`)
    const aug = this.hstack(GF2Matrix.identity(this.rows))
    const pivots = aug.reduceInPlace(this.cols)
    if (pivots.length !== this.rows) throw new Error('inverse: the matrix is singular over GF(2)')
    return aug.sliceCols(this.cols, 2 * this.cols)
  }

  /** Is v in the row space of this matrix? */
  rowspaceContains(v: Bits): boolean {
    return this.solveRowCombination(v) !== null
  }

  /** A solution x of H·x = b, or null when there is none (a particular solution; add any row of `nullspace()` for the others). */
  solve(b: Bits): number[] | null {
    if (b.length !== this.rows) throw new Error(`solve: right-hand side has ${b.length} entries, matrix has ${this.rows} rows`)
    const col = new GF2Matrix(this.rows, 1)
    b.forEach((v, i) => v && col.set(i, 0, 1))
    const aug = this.hstack(col)
    const pivots = aug.reduceInPlace(this.cols + 1)
    if (pivots.includes(this.cols)) return null
    const x = new Array<number>(this.cols).fill(0)
    pivots.forEach((pc, r) => {
      x[pc] = aug.get(r, this.cols)
    })
    return x
  }
}

/** Pack a 0/1 vector into 32-bit words (entry j in word j >> 5, bit j & 31). */
export function packBits(v: Bits): Uint32Array {
  const out = new Uint32Array(Math.ceil(v.length / 32))
  v.forEach((b, j) => {
    if (b & 1) out[j >> 5] |= 1 << (j & 31)
  })
  return out
}

/** The inverse of `packBits`: n entries from the words. */
export function unpackBits(words: Uint32Array, n: number): number[] {
  return Array.from({ length: n }, (_, j) => (words[j >> 5] >>> (j & 31)) & 1)
}

/** The rank of a list of rows (convenience for code that has plain arrays). */
export const rankOf = (rows: readonly Bits[], cols?: number): number => GF2Matrix.fromRows(rows, cols).rank()
