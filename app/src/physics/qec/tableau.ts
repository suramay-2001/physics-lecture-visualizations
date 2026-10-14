/**
 * A stabilizer tableau simulator: the Gottesman–Knill picture (Bergou Ch. 10 §10.2 pp. 183-186: the theorem; Aaronson & Gottesman,
 * Phys. Rev. A 70, 052328 (2004) for the tableau and its update rules). A computation made of H, S, CNOT, Pauli gates and Z-measurements,
 * started in |0…0⟩, is followed exactly by n stabilizer generators (and n destabilizers) instead of 2ⁿ amplitudes: O(n) bit operations per
 * gate, O(n²) per measurement. Pure TypeScript, no randomness of its own: a random measurement outcome comes from the caller.
 *
 * Representation: rows 0 … n−1 are the destabilizers, rows n … 2n−1 the stabilizer generators, row 2n is scratch space. Row i holds the
 * Pauli (−1)^{r_i} · ⊗_j σ_j with letters from (x_ij, z_ij): the same Hermitian-letter convention as pauli.ts (q0 leftmost, Y = (1,1)).
 * Invariants kept by every gate and measurement (tested): the stabilizers commute with each other, destabilizer i anticommutes with
 * stabilizer i and with no other row of the same kind, and destabilizers commute with each other.
 */
import { type CliffordGate, Pauli } from './pauli'

/** A circuit step the tableau can run: a Clifford gate on its wires, or a Z measurement. */
export type TableauOp = { gate: CliffordGate; qubits: number[] } | { measure: number }

export interface MeasureResult {
  outcome: 0 | 1
  /** true when the outcome was already fixed by the state (some stabilizer is ±Z_a), false when it was a fair coin */
  deterministic: boolean
}

/** How a random outcome is chosen: a fixed bit (replay a known branch) or a generator of numbers in [0, 1). */
export type OutcomeChoice = 0 | 1 | (() => number)

export class Tableau {
  readonly n: number
  private readonly x: Uint8Array
  private readonly z: Uint8Array
  private readonly r: Uint8Array

  /** The state |0…0⟩: stabilizers Z_j, destabilizers X_j. */
  constructor(n: number) {
    if (!Number.isInteger(n) || n < 1) throw new Error('Tableau: n must be a whole number ≥ 1')
    this.n = n
    const rows = 2 * n + 1
    this.x = new Uint8Array(rows * n)
    this.z = new Uint8Array(rows * n)
    this.r = new Uint8Array(rows)
    for (let j = 0; j < n; j++) {
      this.x[j * n + j] = 1 // destabilizer j = X_j
      this.z[(n + j) * n + j] = 1 // stabilizer j = Z_j
    }
  }

  copy(): Tableau {
    const t = new Tableau(this.n)
    t.x.set(this.x)
    t.z.set(this.z)
    t.r.set(this.r)
    return t
  }

  private checkQubit(a: number, who: string): void {
    if (!Number.isInteger(a) || a < 0 || a >= this.n) throw new Error(`${who}: qubit ${a} is outside 0 … ${this.n - 1}`)
  }

  /* ------------------------------------------------------------------ gates ------------------------------------------------------------------ */

  /** Hadamard: X ↔ Z, Y → −Y. */
  h(a: number): this {
    this.checkQubit(a, 'h')
    const n = this.n
    for (let i = 0; i < 2 * n; i++) {
      const k = i * n + a
      this.r[i] ^= this.x[k] & this.z[k]
      const t = this.x[k]
      this.x[k] = this.z[k]
      this.z[k] = t
    }
    return this
  }

  /** Phase gate S = diag(1, i): X → Y, Y → −X, Z → Z. */
  s(a: number): this {
    this.checkQubit(a, 's')
    const n = this.n
    for (let i = 0; i < 2 * n; i++) {
      const k = i * n + a
      this.r[i] ^= this.x[k] & this.z[k]
      this.z[k] ^= this.x[k]
    }
    return this
  }

  /** S† = S³. */
  sdg(a: number): this {
    return this.s(a).s(a).s(a)
  }

  /** CNOT with control a, target b: X_a → X_a X_b, Z_b → Z_a Z_b. */
  cnot(a: number, b: number): this {
    this.checkQubit(a, 'cnot')
    this.checkQubit(b, 'cnot')
    if (a === b) throw new Error('cnot: control and target must differ')
    const n = this.n
    for (let i = 0; i < 2 * n; i++) {
      const xa = this.x[i * n + a]
      const xb = this.x[i * n + b]
      const za = this.z[i * n + a]
      const zb = this.z[i * n + b]
      this.r[i] ^= xa & zb & (xb ^ za ^ 1)
      this.x[i * n + b] = xb ^ xa
      this.z[i * n + a] = za ^ zb
    }
    return this
  }

  /** Pauli X: flips the sign of every row that has a Z (or Y) on the qubit. */
  px(a: number): this {
    this.checkQubit(a, 'x')
    for (let i = 0; i < 2 * this.n; i++) this.r[i] ^= this.z[i * this.n + a]
    return this
  }

  /** Pauli Z: flips the sign of every row that has an X (or Y) on the qubit. */
  pz(a: number): this {
    this.checkQubit(a, 'z')
    for (let i = 0; i < 2 * this.n; i++) this.r[i] ^= this.x[i * this.n + a]
    return this
  }

  /** Pauli Y: flips the sign of every row that has X or Z (not Y) on the qubit. */
  py(a: number): this {
    this.checkQubit(a, 'y')
    for (let i = 0; i < 2 * this.n; i++) this.r[i] ^= this.x[i * this.n + a] ^ this.z[i * this.n + a]
    return this
  }

  /** Controlled-Z = H on the target around a CNOT. */
  cz(a: number, b: number): this {
    return this.h(b).cnot(a, b).h(b)
  }

  swap(a: number, b: number): this {
    return this.cnot(a, b).cnot(b, a).cnot(a, b)
  }

  /** Apply a gate by name (the names of pauli.ts `CliffordGate`; control first for CNOT / CZ). */
  apply(gate: CliffordGate, ...q: number[]): this {
    const need = gate === 'CNOT' || gate === 'CZ' || gate === 'SWAP' ? 2 : 1
    if (q.length !== need) throw new Error(`Tableau.apply: ${gate} takes ${need} qubit(s)`)
    switch (gate) {
      case 'H':
        return this.h(q[0])
      case 'S':
        return this.s(q[0])
      case 'Sdg':
        return this.sdg(q[0])
      case 'X':
        return this.px(q[0])
      case 'Y':
        return this.py(q[0])
      case 'Z':
        return this.pz(q[0])
      case 'CNOT':
        return this.cnot(q[0], q[1])
      case 'CZ':
        return this.cz(q[0], q[1])
      case 'SWAP':
        return this.swap(q[0], q[1])
    }
  }

  /* ------------------------------------------------------------------ measurement ------------------------------------------------------------------ */

  /** The exponent of i picked up multiplying letters (x1, z1)·(x2, z2) (Aaronson–Gottesman's g function), in −1 … 1. */
  private static g(x1: number, z1: number, x2: number, z2: number): number {
    if (x1 === 0 && z1 === 0) return 0
    if (x1 === 1 && z1 === 1) return z2 - x2
    if (x1 === 1) return z2 * (2 * x2 - 1)
    return x2 * (1 - 2 * z2)
  }

  /** Row h := row i · row h, with the sign worked out. */
  private rowsum(h: number, i: number): void {
    const n = this.n
    let sum = 2 * this.r[h] + 2 * this.r[i]
    for (let j = 0; j < n; j++) sum += Tableau.g(this.x[i * n + j], this.z[i * n + j], this.x[h * n + j], this.z[h * n + j])
    const m = ((sum % 4) + 4) % 4
    // Stabilizer rows (and the scratch row) commute, so their products are real. A destabilizer row can meet the one stabilizer it anticommutes
    // with; its sign is bookkeeping only (Aaronson–Gottesman never read it), so the odd case just keeps the high bit, as the CHP program does.
    if (m % 2 === 1 && h >= this.n) throw new Error('Tableau: rowsum produced an imaginary sign on a stabilizer row: internal error')
    this.r[h] = m >= 2 ? 1 : 0
    for (let j = 0; j < n; j++) {
      this.x[h * n + j] ^= this.x[i * n + j]
      this.z[h * n + j] ^= this.z[i * n + j]
    }
  }

  /** The stabilizer row that anticommutes with Z_a (has an X or Y on a), or −1 when the outcome of measuring Z_a is already fixed. */
  private anticommutingStabilizer(a: number): number {
    for (let p = this.n; p < 2 * this.n; p++) if (this.x[p * this.n + a]) return p
    return -1
  }

  /** Is the outcome of measuring Z on qubit a already fixed by the state? */
  isDeterministicZ(a: number): boolean {
    this.checkQubit(a, 'isDeterministicZ')
    return this.anticommutingStabilizer(a) < 0
  }

  /** The outcome (0 for +1, 1 for −1) Z_a would give, or null when it is a fair coin; does not change the state. */
  peekZ(a: number): 0 | 1 | null {
    if (!this.isDeterministicZ(a)) return null
    return this.copy().measureZ(a).outcome
  }

  /**
   * Measure Z on qubit a and collapse. When some stabilizer anticommutes with Z_a the outcome is a fair coin, taken from `choice` (a bit, or a
   * generator of numbers in [0, 1): below ½ is 0); otherwise it is fixed by the state and `choice` is ignored. Returns the outcome and whether
   * it was deterministic.
   */
  measureZ(a: number, choice: OutcomeChoice = () => 0.25): MeasureResult {
    this.checkQubit(a, 'measureZ')
    const n = this.n
    const p = this.anticommutingStabilizer(a)
    if (p >= 0) {
      const outcome: 0 | 1 = typeof choice === 'number' ? choice : choice() < 0.5 ? 0 : 1
      for (let i = 0; i < 2 * n; i++) if (i !== p && this.x[i * n + a]) this.rowsum(i, p)
      // the destabilizer paired with the new stabilizer is the old one
      for (let j = 0; j < n; j++) {
        this.x[(p - n) * n + j] = this.x[p * n + j]
        this.z[(p - n) * n + j] = this.z[p * n + j]
      }
      this.r[p - n] = this.r[p]
      for (let j = 0; j < n; j++) {
        this.x[p * n + j] = 0
        this.z[p * n + j] = j === a ? 1 : 0
      }
      this.r[p] = outcome
      return { outcome, deterministic: false }
    }
    // deterministic: Z_a is (up to sign) a product of stabilizers; multiply them in the scratch row to read the sign
    const s = 2 * n
    for (let j = 0; j < n; j++) {
      this.x[s * n + j] = 0
      this.z[s * n + j] = 0
    }
    this.r[s] = 0
    for (let i = 0; i < n; i++) if (this.x[i * n + a]) this.rowsum(s, i + n)
    return { outcome: this.r[s] as 0 | 1, deterministic: true }
  }

  /** Reset qubit a to |0⟩: measure it and flip with X when the outcome was 1 (a fair-coin outcome comes from `choice`). */
  reset(a: number, choice: OutcomeChoice = () => 0.25): this {
    if (this.measureZ(a, choice).outcome === 1) this.px(a)
    return this
  }

  /** Run a list of steps; measurement outcomes are returned in order (a fair-coin one comes from `choice`). */
  run(ops: readonly TableauOp[], choice: OutcomeChoice = () => 0.25): MeasureResult[] {
    const out: MeasureResult[] = []
    for (const op of ops) {
      if ('measure' in op) out.push(this.measureZ(op.measure, choice))
      else this.apply(op.gate, ...op.qubits)
    }
    return out
  }

  /* ------------------------------------------------------------------ reading the state ------------------------------------------------------------------ */

  private rowPauli(i: number): Pauli {
    const n = this.n
    return new Pauli(Array.from(this.x.subarray(i * n, (i + 1) * n)), Array.from(this.z.subarray(i * n, (i + 1) * n)), this.r[i] ? 2 : 0)
  }

  /** The n stabilizer generators (signed Pauli strings): the state is their common +1 eigenvector. */
  stabilizers(): Pauli[] {
    return Array.from({ length: this.n }, (_, i) => this.rowPauli(this.n + i))
  }

  /** The n destabilizers (bookkeeping rows; destabilizer i anticommutes with stabilizer i only). Their letters are meaningful, their signs are not. */
  destabilizers(): Pauli[] {
    return Array.from({ length: this.n }, (_, i) => this.rowPauli(i))
  }

  /** All 2ⁿ elements of the stabilizer group (n ≤ 14), in the order of the bit pattern of the subset of generators. */
  stabilizerGroup(maxN = 14): Pauli[] {
    if (this.n > maxN) throw new Error(`stabilizerGroup: 2^${this.n} elements is more than the cap 2^${maxN}`)
    const g = this.stabilizers()
    const out: Pauli[] = []
    for (let m = 0; m < 2 ** this.n; m++) out.push(g.reduce((acc, p, i) => (m & (1 << i) ? acc.mul(p) : acc), Pauli.identity(this.n)))
    return out
  }

  /** Check the three tableau invariants (an internal consistency test, also useful in a lecture). */
  invariantsHold(): boolean {
    const s = this.stabilizers()
    const d = this.destabilizers()
    for (let i = 0; i < this.n; i++)
      for (let j = 0; j < this.n; j++) {
        if (!s[i].commutesWith(s[j])) return false
        if (!d[i].commutesWith(d[j])) return false
        if (d[i].commutesWith(s[j]) === (i === j)) return false
      }
    return true
  }
}
