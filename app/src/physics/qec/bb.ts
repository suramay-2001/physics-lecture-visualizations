/**
 * Bivariate bicycle (BB) codes exactly as `paper-tdg` (Yoder et al., Tour de gross, arXiv:2506.03094) defines them. Pure TypeScript.
 *
 * Where each convention is read from (paper-tdg; page numbers are the paper's own, p. 8-9 = §2.1, p. 43-47 = App. A.1-A.2):
 *   - geometry (§2.1, Fig. 3a/3b, p. 8-9): an ℓ × m grid of unit cells on a torus; a cell holds one L qubit, one R qubit, one X check and one Z check.
 *     In the drawing of Fig. 3b cell (i, j) occupies a 2 × 2 block with R top-left, X top-right, Z bottom-left, L bottom-right, x growing east and y north.
 *   - polynomials (Eq. 27, p. 43): A = 1 + y + x^{a→} y^{a↑}, B = 1 + x + x^{b→} y^{b↑}, with x^ℓ = 1 and y^m = 1; the X check in cell x^i y^j touches the
 *     L qubits x^i y^j A (the three terms of A) and the R qubits x^i y^j B; the Z check touches the L qubits x^i y^j Bᵀ and the R qubits x^i y^j Aᵀ, where
 *     (x^i y^j)ᵀ = x^{−i} y^{−j} (Eq. 28). Every check has weight six.
 *   - gross code (p. 9, p. 43): ℓ = 12, m = 6, a→ = −b↑ = 3, a↑ = b→ = −1, parameters [[144, 12, 12]]; two-gross code: ℓ = 12, m = 12 and the same four
 *     numbers, [[288, 12, 18]]. (So A = 1 + y + x³y⁻¹ and B = 1 + x + x⁻¹y⁻³.)
 * The matrices are the standard ones: H_X = [A | B] and H_Z = [Bᵀ | Aᵀ] with A, B the circulant matrices of the polynomials (multiplication by a monomial
 * x^a y^b is the permutation of the cells that moves cell (i, j) to (i + a, j + b)); H_X · H_Zᵀ = AB + BA = 0 because the polynomial ring is commutative.
 * Qubit order: L qubits first (index i·m + j for cell (i, j), x the slow index), then R qubits (offset ℓm). Check order: cell index i·m + j, one list for X
 * and one for Z.
 *
 * What is NOT computed here: the distance. The paper reports d = 12 and d = 18 (§2.1; the weights come from a BP+OSD search, Fig. 12, p. 46). This module
 * exports those as `REPORTED` with their location, exhibits logical operators of the weights the paper gives (an UPPER bound on d) and can prove small
 * lower bounds by exhaustive search; it never states d = 12 or d = 18 as something it computed.
 */
import { GF2Matrix } from './gf2'
import { CSSCode, lightLogicalSearch } from './codes'
import { Pauli } from './pauli'

/** A monomial x^dx y^dy as exponents (any integers; reduced mod ℓ, m when used). */
export type Mono = readonly [number, number]

const wrap = (v: number, mod: number): number => ((v % mod) + mod) % mod

export interface BBSpec {
  name: string
  l: number
  m: number
  /** the monomials of A, in the paper's order 1, y, x^{a→} y^{a↑} */
  A: readonly Mono[]
  /** the monomials of B, in the paper's order 1, x, x^{b→} y^{b↑} */
  B: readonly Mono[]
}

/** The paper's form: A = 1 + y + x^{a→}y^{a↑}, B = 1 + x + x^{b→}y^{b↑} on an ℓ × m torus (Eq. 27). */
export function paperSpec(name: string, l: number, m: number, aRight: number, aUp: number, bRight: number, bUp: number): BBSpec {
  return {
    name,
    l,
    m,
    A: [[0, 0], [0, 1], [aRight, aUp]],
    B: [[0, 0], [1, 0], [bRight, bUp]],
  }
}

/** The gross code of paper-tdg: ℓ = 12, m = 6, a→ = 3, a↑ = −1, b→ = −1, b↑ = −3 (p. 9 and p. 43). */
export const GROSS_SPEC: BBSpec = paperSpec('gross', 12, 6, 3, -1, -1, -3)
/** The two-gross code of paper-tdg: ℓ = 12, m = 12, the same a and b (p. 9 and p. 43, Fig. 11). */
export const TWO_GROSS_SPEC: BBSpec = paperSpec('two-gross', 12, 12, 3, -1, -1, -3)

/** Limits on a spec that arrives as data (a smart-tool recipe): small enough that building the code is instant. */
export const BB_LIMITS = { minSide: 2, maxSide: 24, maxCells: 400, maxTerms: 4, maxExponent: 1000 } as const

export type BBValidation = { ok: true; spec: BBSpec } | { ok: false; reason: string }

/** Validate an untrusted spec (a recipe's parameters): shape, whole numbers, the limits above. Never evaluates anything. */
export function validateBBSpec(x: unknown): BBValidation {
  const fail = (reason: string): BBValidation => ({ ok: false, reason })
  if (typeof x !== 'object' || x === null || Array.isArray(x)) return fail('a BB spec must be an object { l, m, A, B }')
  const o = x as Record<string, unknown>
  for (const k of Object.keys(o)) if (!['name', 'l', 'm', 'A', 'B'].includes(k)) return fail(`unknown field "${k.slice(0, 40)}"`)
  const { l, m } = o
  if (!Number.isInteger(l) || !Number.isInteger(m)) return fail('l and m must be whole numbers')
  const L = l as number
  const M = m as number
  if (L < BB_LIMITS.minSide || M < BB_LIMITS.minSide || L > BB_LIMITS.maxSide || M > BB_LIMITS.maxSide) return fail(`l and m must be between ${BB_LIMITS.minSide} and ${BB_LIMITS.maxSide}`)
  if (L * M > BB_LIMITS.maxCells) return fail(`l·m must be at most ${BB_LIMITS.maxCells}`)
  const mono = (v: unknown, who: string): Mono[] | string => {
    if (!Array.isArray(v) || v.length < 1 || v.length > BB_LIMITS.maxTerms) return `${who} must list 1 to ${BB_LIMITS.maxTerms} monomials`
    const out: Mono[] = []
    for (let t = 0; t < v.length; t++) {
      const e = v[t]
      if (!Array.isArray(e) || e.length !== 2 || !Number.isInteger(e[0]) || !Number.isInteger(e[1])) return `${who}[${t}] must be a pair of whole-number exponents [dx, dy]`
      if (Math.abs(e[0]) > BB_LIMITS.maxExponent || Math.abs(e[1]) > BB_LIMITS.maxExponent) return `${who}[${t}] exponents must be at most ${BB_LIMITS.maxExponent} in size`
      out.push([e[0], e[1]])
    }
    return out
  }
  const A = mono(o.A, 'A')
  if (typeof A === 'string') return fail(A)
  const B = mono(o.B, 'B')
  if (typeof B === 'string') return fail(B)
  const name = typeof o.name === 'string' ? o.name.slice(0, 80) : `BB ${L}×${M}`
  return { ok: true, spec: { name, l: L, m: M, A, B } }
}

/* ------------------------------------------------------------------ polynomials on the torus ------------------------------------------------------------------ */

/** The ring F₂[x, y]/(x^ℓ − 1, y^m − 1): a polynomial is a 0/1 vector over the ℓm cells, cell (i, j) ↔ the monomial x^i y^j at index i·m + j. */
export class TorusRing {
  readonly l: number
  readonly m: number
  readonly cells: number

  constructor(l: number, m: number) {
    if (!Number.isInteger(l) || !Number.isInteger(m) || l < 1 || m < 1) throw new Error('TorusRing: l and m must be positive whole numbers')
    this.l = l
    this.m = m
    this.cells = l * m
  }

  index(i: number, j: number): number {
    return wrap(i, this.l) * this.m + wrap(j, this.m)
  }

  cellOf(index: number): [number, number] {
    return [Math.floor(index / this.m), index % this.m]
  }

  zero(): number[] {
    return new Array<number>(this.cells).fill(0)
  }

  /** The polynomial with one term x^i y^j. */
  mono(i: number, j: number): number[] {
    const p = this.zero()
    p[this.index(i, j)] = 1
    return p
  }

  /** The sum of monomials (repeated monomials cancel). */
  fromTerms(terms: readonly Mono[]): number[] {
    const p = this.zero()
    for (const [i, j] of terms) p[this.index(i, j)] ^= 1
    return p
  }

  /** The terms of p as exponents (i, j), in index order. */
  terms(p: readonly number[]): [number, number][] {
    const out: [number, number][] = []
    p.forEach((b, t) => {
      if (b) out.push(this.cellOf(t))
    })
    return out
  }

  add(p: readonly number[], q: readonly number[]): number[] {
    return p.map((b, t) => b ^ q[t])
  }

  /** The product in the ring: convolution of exponents on the torus. */
  mul(p: readonly number[], q: readonly number[]): number[] {
    const out = this.zero()
    const tp = this.terms(p)
    const tq = this.terms(q)
    for (const [i, j] of tp) for (const [u, v] of tq) out[this.index(i + u, j + v)] ^= 1
    return out
  }

  /** The transpose: every monomial x^i y^j goes to x^{−i} y^{−j}. */
  transpose(p: readonly number[]): number[] {
    const out = this.zero()
    for (const [i, j] of this.terms(p)) out[this.index(-i, -j)] ^= 1
    return out
  }

  isZero(p: readonly number[]): boolean {
    return p.every((b) => b === 0)
  }

  /** The circulant matrix of multiplication by p: row (i, j) has a 1 at column (i + a, j + b) for every term x^a y^b of p. */
  matrix(p: readonly number[]): GF2Matrix {
    const M = GF2Matrix.zeros(this.cells, this.cells)
    const ts = this.terms(p)
    for (let c = 0; c < this.cells; c++) {
      const [i, j] = this.cellOf(c)
      for (const [a, b] of ts) M.set(c, this.index(i + a, j + b), M.get(c, this.index(i + a, j + b)) ^ 1)
    }
    return M
  }
}

/* ------------------------------------------------------------------ the code and its Tanner graph ------------------------------------------------------------------ */

export type QubitKind = 'L' | 'R'
export type CheckKind = 'X' | 'Z'

export interface TannerNode {
  id: string
  kind: QubitKind | CheckKind
  cell: [number, number]
  /** data qubit index (0 … 2ℓm − 1) for L / R, row of H_X or H_Z for X / Z */
  index: number
  /** drawing position in the paper's layout (Fig. 3b): x east, y north, 2 × 2 per cell */
  pos: [number, number]
}

export interface TannerEdge {
  /** index of the check (a row of H_X for an X check, of H_Z for a Z check) */
  check: number
  checkKind: CheckKind
  /** data qubit index (0 … 2ℓm − 1) */
  qubit: number
  qubitKind: QubitKind
  /** the Pauli the check applies on this qubit (X checks act with X, Z checks with Z) */
  pauli: CheckKind
  /** which monomial of the polynomial (0, 1 or 2): the check's connection number */
  term: number
  /** 'local': the qubit's cell is the check's cell or a neighbour (one step N, S, E or W); 'long': a long-range connection across the torus */
  kind: 'local' | 'long'
  /** the cell offset from the check's cell to the qubit's, wrapped to the nearest copy on the torus: dx in (−ℓ/2, ℓ/2], dy in (−m/2, m/2] */
  delta: [number, number]
  /** unrolled drawing coordinates: where the check is, and where the qubit's nearest copy is (may lie outside the ℓ × m window) */
  from: [number, number]
  to: [number, number]
}

export interface Tanner {
  nodes: TannerNode[]
  edges: TannerEdge[]
}

const wrapSym = (v: number, mod: number): number => {
  const w = wrap(v, mod)
  return w > mod / 2 ? w - mod : w
}

/** Offsets inside a 2 × 2 cell block (paper Fig. 3a/3b): R top-left, X top-right, Z bottom-left, L bottom-right. */
const OFFSET: Record<QubitKind | CheckKind, [number, number]> = { R: [0, 1], X: [1, 1], Z: [0, 0], L: [1, 0] }

export class BBCode {
  readonly spec: BBSpec
  readonly ring: TorusRing
  readonly n: number
  /** polynomials A and B as 0/1 vectors on the torus */
  readonly A: number[]
  readonly B: number[]
  readonly HX: GF2Matrix
  readonly HZ: GF2Matrix
  readonly css: CSSCode
  private tannerCache: Tanner | null = null

  constructor(spec: BBSpec) {
    this.spec = spec
    this.ring = new TorusRing(spec.l, spec.m)
    this.A = this.ring.fromTerms(spec.A)
    this.B = this.ring.fromTerms(spec.B)
    const MA = this.ring.matrix(this.A)
    const MB = this.ring.matrix(this.B)
    this.n = 2 * this.ring.cells
    this.HX = MA.hstack(MB)
    this.HZ = MB.transpose().hstack(MA.transpose())
    this.css = new CSSCode(this.HX, this.HZ, spec.name)
  }

  get l(): number {
    return this.spec.l
  }

  get m(): number {
    return this.spec.m
  }

  /** the number of unit cells ℓm (= the number of X checks = of Z checks = of L qubits = of R qubits) */
  get cells(): number {
    return this.ring.cells
  }

  /** k = n − rank H_X − rank H_Z, from the two ranks over GF(2). */
  get k(): number {
    return this.css.k
  }

  /** the largest row weight over H_X and H_Z (6 for the paper's codes) */
  get checkWeight(): number {
    return this.css.degrees().checkWeight
  }

  /** qubit index of the L qubit in cell (i, j) */
  lIndex(i: number, j: number): number {
    return this.ring.index(i, j)
  }

  /** qubit index of the R qubit in cell (i, j) */
  rIndex(i: number, j: number): number {
    return this.cells + this.ring.index(i, j)
  }

  /** which kind of qubit is index q, and in which cell */
  qubitCell(q: number): { kind: QubitKind; cell: [number, number] } {
    if (q < 0 || q >= this.n) throw new Error(`qubitCell: ${q} is outside 0 … ${this.n - 1}`)
    return q < this.cells ? { kind: 'L', cell: this.ring.cellOf(q) } : { kind: 'R', cell: this.ring.cellOf(q - this.cells) }
  }

  /** Drawing position of a node in the paper's layout (x east, y north, 2 × 2 per cell, cell (i, j) at (2i, 2j)). */
  position(kind: QubitKind | CheckKind, cell: readonly [number, number]): [number, number] {
    const [ox, oy] = OFFSET[kind]
    return [2 * cell[0] + ox, 2 * cell[1] + oy]
  }

  /** The Tanner graph with drawing coordinates: 2ℓm data qubits (two families L and R) and 2ℓm checks (X and Z), every edge tagged local or long-range. */
  tanner(): Tanner {
    if (this.tannerCache) return this.tannerCache
    const { l, m } = this
    const nodes: TannerNode[] = []
    for (let c = 0; c < this.cells; c++) {
      const cell = this.ring.cellOf(c)
      nodes.push({ id: `L${c}`, kind: 'L', cell, index: c, pos: this.position('L', cell) })
      nodes.push({ id: `R${c}`, kind: 'R', cell, index: this.cells + c, pos: this.position('R', cell) })
      nodes.push({ id: `X${c}`, kind: 'X', cell, index: c, pos: this.position('X', cell) })
      nodes.push({ id: `Z${c}`, kind: 'Z', cell, index: c, pos: this.position('Z', cell) })
    }
    const edges: TannerEdge[] = []
    const termsOf = (p: readonly Mono[], negate: boolean): Mono[] => p.map(([a, b]) => (negate ? [-a, -b] : [a, b]) as Mono)
    // For each check kind: which polynomial gives the L connections and which the R ones (Eq. 27-28), with the sign of the displacement.
    const plans: { kind: CheckKind; L: Mono[]; R: Mono[] }[] = [
      { kind: 'X', L: termsOf(this.spec.A, false), R: termsOf(this.spec.B, false) },
      { kind: 'Z', L: termsOf(this.spec.B, true), R: termsOf(this.spec.A, true) },
    ]
    for (const { kind, L, R } of plans)
      for (let c = 0; c < this.cells; c++) {
        const cell = this.ring.cellOf(c)
        const from = this.position(kind, cell)
        for (const [qk, list] of [['L', L], ['R', R]] as const)
          list.forEach(([a, b], term) => {
            const dx = wrapSym(a, l)
            const dy = wrapSym(b, m)
            const qcell: [number, number] = [wrap(cell[0] + a, l), wrap(cell[1] + b, m)]
            const qubit = qk === 'L' ? this.lIndex(qcell[0], qcell[1]) : this.rIndex(qcell[0], qcell[1])
            const [ox, oy] = OFFSET[qk]
            edges.push({
              check: c,
              checkKind: kind,
              qubit,
              qubitKind: qk,
              pauli: kind,
              term,
              kind: Math.abs(dx) + Math.abs(dy) <= 1 ? 'local' : 'long',
              delta: [dx, dy],
              from,
              to: [2 * (cell[0] + dx) + ox, 2 * (cell[1] + dy) + oy],
            })
          })
      }
    this.tannerCache = { nodes, edges }
    return this.tannerCache
  }

  /**
   * The shift automorphism x^a y^b as a permutation of the qubits: the qubit at (L or R, cell (i, j)) goes to the same kind in cell (i + a, j + b)
   * (paper App. A.2, p. 46-47: (L, α) → (L, δα) and (R, α) → (R, δα) for the monomial δ). `perm[q]` is where qubit q goes.
   */
  shiftPermutation(a: number, b: number): number[] {
    const perm = new Array<number>(this.n)
    for (let c = 0; c < this.cells; c++) {
      const [i, j] = this.ring.cellOf(c)
      perm[c] = this.lIndex(i + a, j + b)
      perm[this.cells + c] = this.rIndex(i + a, j + b)
    }
    return perm
  }

  /** The same shift on the check cells (X checks and Z checks alike): `perm[c]` is the cell the check in cell c goes to. */
  shiftChecks(a: number, b: number): number[] {
    return Array.from({ length: this.cells }, (_, c) => {
      const [i, j] = this.ring.cellOf(c)
      return this.ring.index(i + a, j + b)
    })
  }

  /**
   * Does the qubit permutation `perm`, together with a permutation `checkPerm` of the check cells, map the X checks onto X checks and the Z checks onto
   * Z checks (each row of H_X, with its qubits moved, is the row `checkPerm` names; same for H_Z)? That is what it means for a permutation to preserve the
   * code: it keeps both check spaces.
   */
  preservesChecks(perm: readonly number[], checkPerm: readonly number[]): boolean {
    for (const H of [this.HX, this.HZ])
      for (let r = 0; r < H.rows; r++) {
        const moved = H.rowSupport(r).map((q) => perm[q]).sort((u, v) => u - v)
        const want = H.rowSupport(checkPerm[r])
        if (moved.length !== want.length || moved.some((q, t) => q !== want[t])) return false
      }
    return true
  }

  /** Does the shift x^a y^b preserve both check spaces (as the paper's App. A.2 says every shift does)? */
  shiftPreservesCode(a: number, b: number): boolean {
    return this.preservesChecks(this.shiftPermutation(a, b), this.shiftChecks(a, b))
  }

  /** X(p, q): X on the L qubits at the terms of p and on the R qubits at the terms of q (the paper's notation in App. A.1). */
  xOperator(p: readonly number[], q: readonly number[]): Pauli {
    return new Pauli([...p, ...q], new Array<number>(this.n).fill(0))
  }

  /** Z(r, s): Z on the L qubits at the terms of r and on the R qubits at the terms of s. */
  zOperator(r: readonly number[], s: readonly number[]): Pauli {
    return new Pauli(new Array<number>(this.n).fill(0), [...r, ...s])
  }

  /** Eq. (29): X(p, q) is a logical operator or stabilizer iff pB + qA = 0 (it commutes with every Z check). */
  xCommutes(p: readonly number[], q: readonly number[]): boolean {
    const r = this.ring
    return r.isZero(r.add(r.mul(p, this.B), r.mul(q, this.A)))
  }

  /** Eq. (30): Z(r, s) commutes with every X check iff rAᵀ + sBᵀ = 0. */
  zCommutes(r: readonly number[], s: readonly number[]): boolean {
    const g = this.ring
    return g.isZero(g.add(g.mul(r, g.transpose(this.A)), g.mul(s, g.transpose(this.B))))
  }
}

/** Build a BB code from a spec. */
export const bbCode = (spec: BBSpec): BBCode => new BBCode(spec)

/* ------------------------------------------------------------------ what the paper reports (never computed here) ------------------------------------------------------------------ */

export interface ReportedBB {
  n: number
  k: number
  /** the distance the paper states; found there by BP+OSD, not proved */
  d: number
  /** where the paper states it */
  where: string
  /** the weight of each of the four basis operators of Eq. (31) in the paper's basis (Eq. 32 / Eq. 33), p. 45 */
  basisWeight: number
}

export const REPORTED: Record<'gross' | 'two-gross', ReportedBB> = {
  gross: { n: 144, k: 12, d: 12, where: 'paper-tdg §2.1 p. 8-9 (Fig. 3b) and App. A.1 p. 43, Eq. (27) and following; d from the BP+OSD search of Fig. 12, p. 46', basisWeight: 12 },
  'two-gross': { n: 288, k: 12, d: 18, where: 'paper-tdg §2.1 p. 9 and App. A.1 p. 43, Fig. 11 p. 44; the basis operators have weight 20, two above d (p. 45)', basisWeight: 20 },
}

/** The counts of low-weight logical X operators the paper's BP+OSD enumeration found (Fig. 12 caption, p. 46), all shifts included. Reported, not recomputed here. */
export const REPORTED_LOGICAL_COUNTS = {
  gross: { weight12: 1884, weight14: 19728, where: 'paper-tdg App. A.1, Fig. 12 caption, p. 46' },
  'two-gross': { weight18: 336, weight20: 1728, where: 'paper-tdg App. A.1, Fig. 12 caption, p. 46' },
} as const

/** The shifts the paper lists as the basic shift automorphisms (App. A.2, p. 47): x, y, x³y⁻¹, xy³, x³y⁻², x²y³ and their inverses, as exponent pairs. */
export const PAPER_BASIC_SHIFTS: readonly Mono[] = [[1, 0], [0, 1], [3, -1], [1, 3], [3, -2], [2, 3]]

/* ------------------------------------------------------------------ the paper's logical basis (App. A.1, Eq. 31-36) ------------------------------------------------------------------ */

/** A polynomial written as a list of monomials, the form the paper prints in Eq. (32), (33), (35), (36). */
type Terms = readonly Mono[]

interface PaperBasisData {
  p: Terms
  q: Terms
  r: Terms
  s: Terms
  mu: Mono
  nu: Mono
  alpha: Terms
  beta: Terms
}

/** Eq. (32) and Eq. (35): the gross code (μ = ν = xy). */
const GROSS_BASIS: PaperBasisData = {
  p: [[4, 0], [5, 0], [6, 1], [4, 2], [5, 4], [6, 5]],
  q: [[3, 0], [4, 0], [3, 1], [3, 2], [4, 2], [3, 5]],
  r: [[0, 0], [8, 0], [1, 1], [9, 1], [3, 4], [11, 4]],
  s: [[1, 0], [9, 0], [4, 4], [8, 4], [0, 5], [8, 5]],
  mu: [1, 1],
  nu: [1, 1],
  alpha: [[0, 0], [3, 5], [11, 5], [10, 1], [5, 4], [4, 2]],
  beta: [[0, 0], [2, 4], [1, 2], [2, 5], [1, 1], [3, 1]],
}

/** Eq. (33) and Eq. (36): the two-gross code (μ = ν = xy). */
const TWO_GROSS_BASIS: PaperBasisData = {
  p: [[2, 0], [2, 2], [8, 2], [9, 2], [3, 3], [4, 3], [7, 4], [8, 6], [6, 7], [7, 11]],
  q: [[3, 2], [5, 3], [7, 3], [11, 3], [8, 4], [8, 5], [6, 7], [4, 8], [1, 9], [1, 10]],
  r: [[4, 2], [11, 2], [0, 5], [1, 5], [5, 5], [6, 5], [1, 8], [8, 8], [2, 11], [10, 11]],
  s: [[2, 6], [2, 9], [2, 10], [11, 6], [11, 9], [11, 10], [8, 7], [11, 7], [5, 8], [11, 8]],
  mu: [1, 1],
  nu: [1, 1],
  alpha: [[0, 0], [0, 3], [3, 7], [11, 11], [2, 9], [7, 4]],
  beta: [[0, 0], [1, 1], [4, 0], [5, 4], [4, 3], [3, 5]],
}

export interface PaperLogicalBasis {
  /** the four operators of Eq. (31): X̄₁ = X(p, q), X̄₇ = X(r, s), Z̄₁ = Z(νsᵀ, νrᵀ), Z̄₇ = Z(μqᵀ, μpᵀ) */
  generators: { X1: Pauli; X7: Pauli; Z1: Pauli; Z7: Pauli }
  /** the twelve X-type logical operators X̄₁ … X̄₁₂ (index 0 … 11) of Eq. (34) */
  X: Pauli[]
  /** the twelve Z-type logical operators Z̄₁ … Z̄₁₂ */
  Z: Pauli[]
  /** the monomial lists α and β the shifts use (Eq. 35 / 36) */
  alpha: Mono[]
  beta: Mono[]
}

/**
 * The paper's logical basis of Eq. (31)-(36) for the gross or two-gross code: X̄_i = α_i X̄₁, X̄_{i+6} = β_iᵀ X̄₇, Z̄_i = β_i Z̄₁, Z̄_{i+6} = α_iᵀ Z̄₇ (i = 1 … 6;
 * a shift of an operator multiplies each polynomial by the monomial). The polynomials are transcribed from p. 45 (the page image, checked against the text
 * layer). Whether these are logical operators, their weights and their commutation pattern are checked by tests, not assumed.
 */
export function paperLogicalBasis(code: BBCode, which: 'gross' | 'two-gross'): PaperLogicalBasis {
  const D = which === 'gross' ? GROSS_BASIS : TWO_GROSS_BASIS
  const R = code.ring
  if (code.l !== 12 || code.m !== (which === 'gross' ? 6 : 12)) throw new Error(`paperLogicalBasis: the ${which} basis needs ℓ = 12, m = ${which === 'gross' ? 6 : 12}`)
  const p = R.fromTerms(D.p)
  const q = R.fromTerms(D.q)
  const r = R.fromTerms(D.r)
  const s = R.fromTerms(D.s)
  const mu = R.mono(D.mu[0], D.mu[1])
  const nu = R.mono(D.nu[0], D.nu[1])
  const X1 = code.xOperator(p, q)
  const X7 = code.xOperator(r, s)
  const Z1 = code.zOperator(R.mul(nu, R.transpose(s)), R.mul(nu, R.transpose(r)))
  const Z7 = code.zOperator(R.mul(mu, R.transpose(q)), R.mul(mu, R.transpose(p)))
  const alpha = D.alpha.map(([i, j]) => R.mono(i, j))
  const beta = D.beta.map(([i, j]) => R.mono(i, j))
  const X: Pauli[] = []
  const Z: Pauli[] = []
  for (let i = 0; i < 6; i++) X.push(code.xOperator(R.mul(alpha[i], p), R.mul(alpha[i], q)))
  for (let i = 0; i < 6; i++) X.push(code.xOperator(R.mul(R.transpose(beta[i]), r), R.mul(R.transpose(beta[i]), s)))
  for (let i = 0; i < 6; i++) Z.push(code.zOperator(R.mul(R.mul(beta[i], nu), R.transpose(s)), R.mul(R.mul(beta[i], nu), R.transpose(r))))
  for (let i = 0; i < 6; i++) Z.push(code.zOperator(R.mul(R.mul(R.transpose(alpha[i]), mu), R.transpose(q)), R.mul(R.mul(R.transpose(alpha[i]), mu), R.transpose(p))))
  return { generators: { X1, X7, Z1, Z7 }, X, Z, alpha: D.alpha.map(([i, j]) => [i, j] as Mono), beta: D.beta.map(([i, j]) => [i, j] as Mono) }
}

/** A solver that expresses X-type operators as (X stabilizers) + (a combination of the logical basis): build once, reuse for every shift. */
export function makeLogicalSolver(code: BBCode, basisX: readonly Pauli[]): { solve: (xPart: readonly number[]) => number[] | null; stabilizerRows: number } {
  const stack = code.HX.vstack(GF2Matrix.fromRows(basisX.map((b) => [...b.x]), code.n))
  return { solve: stack.rowSolver(), stabilizerRows: code.HX.rows }
}

/**
 * The logical action of a physical qubit permutation on the X-type logical basis: the k × k matrix M over GF(2) with M[i][j] = 1 when the image of X̄_j
 * contains X̄_i (modulo the X stabilizers). As a logical CNOT circuit it sends |x⟩ to |Mx⟩ (App. A.2, p. 47). `null` when some image is not in the span of
 * the basis plus the stabilizers (the permutation does not preserve the code, or the basis is not a basis). Pass a solver from `makeLogicalSolver` to
 * reuse one elimination across many permutations.
 */
export function logicalXAction(code: BBCode, basisX: readonly Pauli[], perm: readonly number[], solver = makeLogicalSolver(code, basisX)): GF2Matrix | null {
  const k = basisX.length
  const M = GF2Matrix.zeros(k, k)
  for (let j = 0; j < k; j++) {
    const image = basisX[j].permuted(perm)
    const c = solver.solve([...image.x])
    if (!c) return null
    for (let i = 0; i < k; i++) if (c[solver.stabilizerRows + i]) M.set(i, j, 1)
  }
  return M
}

/** The symplectic pairing of the X-type and Z-type bases: G[i][j] = 1 when X̄_i and Z̄_j anticommute. */
export function pairingMatrix(basisX: readonly Pauli[], basisZ: readonly Pauli[]): GF2Matrix {
  const G = GF2Matrix.zeros(basisX.length, basisZ.length)
  basisX.forEach((a, i) => basisZ.forEach((b, j) => G.set(i, j, a.commutesWith(b) ? 0 : 1)))
  return G
}

/* ------------------------------------------------------------------ a light-logical search for the BB codes (an upper bound only) ------------------------------------------------------------------ */

/**
 * A cheap randomized search for a light X-type logical operator (information-set decoding, codes.ts `lightLogicalSearch`). Returns the lightest witness
 * found as a Pauli, an UPPER bound on the distance, never a lower one; deterministic for a given `rand`. The paper uses BP+OSD for the same job (Fig. 12).
 */
export function searchLightLogicalX(code: BBCode, rand: () => number, rounds: number, pairs = false): { weight: number; operator: Pauli } | null {
  const r = lightLogicalSearch(code.HZ, code.HX, rand, { rounds, pairs })
  if (!r) return null
  const x = new Array<number>(code.n).fill(0)
  for (const j of r.support) x[j] = 1
  return { weight: r.weight, operator: new Pauli(x, new Array<number>(code.n).fill(0)) }
}
