/**
 * Stabilizer codes (Bergou Ch. 10 §10.1 pp. 179-183; Nielsen & Chuang §10.5; Gottesman's thesis for the logical-operator construction).
 * A code is given by generators g_1 … g_r: Hermitian Paulis (phase 0 or 2) that commute pairwise. The code space is the common +1
 * eigenspace; with the generators independent it has dimension 2^{n−r}, so k = n − r logical qubits. Pure TypeScript.
 *
 * What lives here:
 *   - `StabilizerCode.check()`: the three conditions a lecture states (commuting, independent, Hermitian with no −I in the group);
 *   - `syndrome(e)`: bit i = 1 exactly when the error e anticommutes with g_i (Bergou p. 181: the generators are the syndrome measurements);
 *   - membership in the stabilizer group and in the normalizer N(S) (the Paulis that commute with every generator), logical operators
 *     = N(S) modulo S: a symplectic basis X̄_1 … X̄_k, Z̄_1 … Z̄_k with ⟨X̄_i, Z̄_j⟩ = δ_ij, found by symplectic Gram–Schmidt (deterministic);
 *   - the Knill–Laflamme condition for a set of errors (Bergou Eq. 9.8) in stabilizer form: E_a†E_b must anticommute with a generator or
 *     lie in ±S;
 *   - all 2^r group elements, for small codes (a lecture draws the group).
 * Distances and decoders are in codes.ts; the tableau simulator (Gottesman–Knill, Q20) is in tableau.ts.
 */
import { Echelon, GF2Matrix } from './gf2'
import { Pauli, symplecticDot } from './pauli'

export interface StabilizerReport {
  /** every pair of generators commutes */
  commuting: boolean
  /** no generator is a product of the others (as symplectic vectors) */
  independent: boolean
  /** every generator has phase 0 or 2 (a Hermitian operator) */
  hermitian: boolean
  /** no product of generators equals −I (it would make the code space empty) */
  noMinusIdentity: boolean
  ok: boolean
  problems: string[]
}

export type Membership = 'in' | 'negated' | 'outside'

export class StabilizerCode {
  readonly n: number
  readonly generators: readonly Pauli[]
  readonly name: string

  constructor(generators: readonly Pauli[], name = 'stabilizer code') {
    if (generators.length === 0) throw new Error('StabilizerCode: needs at least one generator')
    const n = generators[0].n
    for (const g of generators) if (g.n !== n) throw new Error('StabilizerCode: the generators act on different numbers of qubits')
    this.n = n
    this.generators = generators
    this.name = name
  }

  /** From strings such as `XZZXI` (an optional sign prefix is allowed). */
  static fromStrings(strings: readonly string[], name?: string): StabilizerCode {
    return new StabilizerCode(strings.map((s) => Pauli.parse(s)), name)
  }

  /** The generators as rows of the n-column symplectic matrix [X part | Z part], size r × 2n. */
  symplecticMatrix(): GF2Matrix {
    return GF2Matrix.fromRows(this.generators.map((g) => g.symplectic()), 2 * this.n)
  }

  /** The number of independent generators (the GF(2) rank of the symplectic matrix). */
  get rank(): number {
    return this.symplecticMatrix().rank()
  }

  /** The number of logical qubits, k = n − rank. */
  get k(): number {
    return this.n - this.rank
  }

  /** Check the conditions on a list of generators. Does not throw; `ok` says whether every one holds. */
  check(): StabilizerReport {
    const problems: string[] = []
    const g = this.generators
    let commuting = true
    for (let i = 0; i < g.length && commuting; i++)
      for (let j = i + 1; j < g.length; j++)
        if (!g[i].commutesWith(g[j])) {
          commuting = false
          problems.push(`generators ${i} (${g[i]}) and ${j} (${g[j]}) anticommute`)
          break
        }
    const hermitian = g.every((p) => p.isHermitian())
    if (!hermitian) problems.push('a generator has phase ±i (not Hermitian)')
    const rank = this.rank
    const independent = rank === g.length
    if (!independent) problems.push(`the generators are dependent: ${g.length} given, rank ${rank}`)
    // A dependent set can still be consistent (a redundant generator) or contradictory (a product equals −I): look for the latter.
    let noMinusIdentity = true
    if (commuting && hermitian) {
      const E = this.symplecticMatrix()
      const N = E.transpose().nullspace() // combinations c with c·E = 0: products with trivial letters
      for (let t = 0; t < N.rows; t++) {
        const c = N.rowBits(t)
        const prod = g.reduce((acc, p, i) => (c[i] ? acc.mul(p) : acc), Pauli.identity(this.n))
        if (prod.phase !== 0) {
          noMinusIdentity = false
          problems.push('a product of generators equals −I (the code space would be empty)')
          break
        }
      }
    }
    return { commuting, independent, hermitian, noMinusIdentity, ok: commuting && independent && hermitian && noMinusIdentity, problems }
  }

  /** Bit i is 1 exactly when the error anticommutes with generator i (the syndrome: the outcomes of measuring the generators, as 0/1 for +1/−1). */
  syndrome(error: Pauli): number[] {
    if (error.n !== this.n) throw new Error(`syndrome: the error acts on ${error.n} qubits, the code on ${this.n}`)
    return this.generators.map((g) => (g.commutesWith(error) ? 0 : 1))
  }

  /** Does p commute with every generator (p ∈ N(S), ignoring sign)? */
  inNormalizer(p: Pauli): boolean {
    return this.syndrome(p).every((b) => b === 0)
  }

  /** The coefficients c with Π g_i^{c_i} having the letters of p, or null when p's letters are not in the span of the generators. */
  private combination(p: Pauli): number[] | null {
    return this.symplecticMatrix().solveRowCombination(p.symplectic())
  }

  /**
   * 'in': p itself is a product of generators (an element of S). 'negated': −p is (the letters are in the group, the sign is opposite).
   * 'outside': the letters are not a product of generators. A phase ±i is always 'outside' or 'negated'-style mismatch: only an exact match is 'in'.
   */
  membership(p: Pauli): Membership {
    const c = this.combination(p)
    if (!c) return 'outside'
    const prod = this.generators.reduce((acc, g, i) => (c[i] ? acc.mul(g) : acc), Pauli.identity(this.n))
    if (prod.phase === p.phase) return 'in'
    return 'negated'
  }

  /** Is p an element of the stabilizer group (letters and sign)? */
  inStabilizer(p: Pauli): boolean {
    return this.membership(p) === 'in'
  }

  /** A logical operator: commutes with every generator but is not ±(a stabilizer element). Acts non-trivially on the code space. */
  isLogical(p: Pauli): boolean {
    return this.inNormalizer(p) && this.combination(p) === null
  }

  /**
   * Knill–Laflamme for stabilizer codes (Bergou Eq. 9.8: ⟨c_i|E_a†E_b|c_j⟩ = δ_ij α_ab): the errors are correctable iff for every pair the
   * product E_a†E_b either anticommutes with some generator (then it has zero expectation in the code space) or is ±(an element of S) (then it is
   * a multiple of the identity there). A product that commutes with every generator yet is not in the group is a logical operator: it
   * distinguishes codewords, so the pair cannot be told apart.
   */
  corrects(errors: readonly Pauli[]): boolean {
    for (const a of errors)
      for (const b of errors) {
        const p = a.mul(b) // E_a† E_b for Hermitian Paulis E_a† = E_a
        if (this.inNormalizer(p) && this.combination(p) === null) return false
      }
    return true
  }

  /**
   * A symplectic basis of the logical operators: k pairs (X̄_i, Z̄_i), all in the normalizer, none in S, with X̄_i, Z̄_j anticommuting exactly
   * when i = j and every other pair commuting. Letters only (phase +1); for a CSS code use `cssLogicals` (codes.ts) to get pure X and pure Z type.
   * Deterministic: normalizer basis from the null space, then Gram–Schmidt in increasing order.
   */
  logicalOperators(): { X: Pauli[]; Z: Pauli[] } {
    const n = this.n
    const S = this.symplecticMatrix()
    // v commutes with generator (gx | gz) iff gx·vz + gz·vx = 0: the null space of S with its halves swapped
    const swapped = GF2Matrix.fromRows(S.toRows().map((r) => [...r.slice(n), ...r.slice(0, n)]), 2 * n)
    const N = swapped.nullspace()
    const E = new Echelon(2 * n)
    for (let i = 0; i < S.rows; i++) E.add(S.rowBits(i))
    let reps: number[][] = []
    for (let i = 0; i < N.rows; i++) {
      const v = N.rowBits(i)
      if (E.add(v)) reps.push(v)
    }
    const xs: number[][] = []
    const zs: number[][] = []
    while (reps.length > 0) {
      const u = reps[0]
      const jv = reps.findIndex((w, j) => j > 0 && symplecticDot(u, w) === 1)
      if (jv < 0) throw new Error('logicalOperators: no partner found (the stabilizer is not maximal commuting, or the generators are not Hermitian-independent)')
      const v = reps[jv]
      const rest = reps.filter((_, j) => j !== 0 && j !== jv)
      reps = rest.map((w) => {
        const a = symplecticDot(w, v) // component along u
        const b = symplecticDot(w, u) // component along v
        return w.map((bit, t) => bit ^ (a ? u[t] : 0) ^ (b ? v[t] : 0))
      })
      xs.push(u)
      zs.push(v)
    }
    return { X: xs.map((v) => Pauli.fromSymplectic(v)), Z: zs.map((v) => Pauli.fromSymplectic(v)) }
  }

  /** The generators plus the logical pair operators as one string table (what a lecture lists). */
  describe(): { generators: string[]; n: number; k: number } {
    return { generators: this.generators.map((g) => g.toString()), n: this.n, k: this.k }
  }

  /** All 2^r products of the generators (r ≤ `max`, default 16), the group itself, in order of the bit pattern of the subset. */
  elements(max = 16): Pauli[] {
    const r = this.generators.length
    if (r > max) throw new Error(`elements: 2^${r} products is more than the cap 2^${max}`)
    const out: Pauli[] = []
    for (let m = 0; m < 2 ** r; m++) out.push(this.generators.reduce((acc, g, i) => (m & (1 << i) ? acc.mul(g) : acc), Pauli.identity(this.n)))
    return out
  }
}
