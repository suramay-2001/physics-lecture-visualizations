/**
 * Pauli strings as symplectic vectors with a phase (Bergou Ch. 10 §10.1 pp. 179-183: the Pauli group G_n; Nielsen & Chuang §10.5.1
 * "the stabilizer formalism" and §10.5.2 for the symplectic picture; Aaronson & Gottesman, Phys. Rev. A 70, 052328 for the update rules).
 * Pure TypeScript, no randomness.
 *
 * Convention (locked for this module, tested against 2^n × 2^n matrices in pauli.test.ts):
 *   - qubit 0 is the LEFTMOST letter of a string and the leftmost tensor factor, as everywhere in physics/qc (state.ts);
 *   - a Pauli is  P = i^phase · σ_0 ⊗ σ_1 ⊗ … ⊗ σ_{n−1}  with each σ_j one of the Hermitian letters I, X, Y, Z (Y = iXZ is a letter);
 *     phase is an integer mod 4: 0 → +1, 1 → +i, 2 → −1, 3 → −i, so an element of the Pauli group has phase in {0, 1, 2, 3} and a
 *     Hermitian one (an observable, what a stabilizer generator must be) has phase 0 or 2;
 *   - the symplectic vector of P is (x | z) of length 2n: letter j is I (0,0), X (1,0), Z (0,1), Y (1,1);
 *   - two Paulis commute exactly when their symplectic product x₁·z₂ + z₁·x₂ is even.
 * The phase of a product is computed, never assumed: X·Z = −iY and Z·X = +iY are tested, and the rule is checked against matrix products.
 */
import { type Bits, dot, support } from './gf2'

export type Letter = 'I' | 'X' | 'Y' | 'Z'
export const LETTERS: readonly Letter[] = ['I', 'X', 'Y', 'Z']

const letterOf = (x: number, z: number): Letter => (x ? (z ? 'Y' : 'X') : z ? 'Z' : 'I')
const mod4 = (p: number): number => ((p % 4) + 4) % 4

/** The Clifford gates the engine propagates Paulis through (`conjugate`): H, S, S†, the Paulis themselves, CNOT, CZ and SWAP. */
export type CliffordGate = 'H' | 'S' | 'Sdg' | 'X' | 'Y' | 'Z' | 'CNOT' | 'CZ' | 'SWAP'

export class Pauli {
  readonly n: number
  /** X part, entries 0/1 */
  readonly x: readonly number[]
  /** Z part, entries 0/1 */
  readonly z: readonly number[]
  /** exponent of i, 0 … 3 */
  readonly phase: number

  constructor(x: Bits, z: Bits, phase = 0) {
    if (x.length !== z.length) throw new Error(`Pauli: x has ${x.length} entries, z has ${z.length}`)
    for (let j = 0; j < x.length; j++) if ((x[j] !== 0 && x[j] !== 1) || (z[j] !== 0 && z[j] !== 1)) throw new Error('Pauli: entries must be 0 or 1')
    if (!Number.isInteger(phase)) throw new Error('Pauli: phase must be a whole number')
    this.n = x.length
    this.x = Array.from(x)
    this.z = Array.from(z)
    this.phase = mod4(phase)
  }

  static identity(n: number): Pauli {
    return new Pauli(new Array<number>(n).fill(0), new Array<number>(n).fill(0))
  }

  /** One letter on one qubit, identity elsewhere: `Pauli.single(3, 1, 'X')` is IXI. */
  static single(n: number, q: number, letter: Letter): Pauli {
    if (!Number.isInteger(q) || q < 0 || q >= n) throw new Error(`Pauli.single: qubit ${q} is outside 0 … ${n - 1}`)
    return Pauli.fromLetters(Array.from({ length: n }, (_, j) => (j === q ? letter : 'I')))
  }

  /** From a list of letters (Hermitian letters, phase +1 unless given). */
  static fromLetters(letters: readonly Letter[], phase = 0): Pauli {
    return new Pauli(
      letters.map((l) => (l === 'X' || l === 'Y' ? 1 : 0)),
      letters.map((l) => (l === 'Z' || l === 'Y' ? 1 : 0)),
      phase,
    )
  }

  /** From the symplectic vector (x | z) of length 2n, phase 0 (so Y letters are the Hermitian Y). */
  static fromSymplectic(v: Bits, phase = 0): Pauli {
    if (v.length % 2 !== 0) throw new Error('Pauli.fromSymplectic: the vector must have even length 2n')
    const n = v.length / 2
    return new Pauli(v.slice(0, n), v.slice(n), phase)
  }

  /** Parse `XZIY`, with an optional prefix `+`, `-`, `i`, `+i`, `-i` (the whole Pauli group). Whitespace is ignored. */
  static parse(text: string): Pauli {
    const t = text.replace(/\s+/g, '')
    const m = /^([+-]?)(i?)([IXYZ]*)$/.exec(t)
    if (!m) throw new Error(`Pauli.parse: cannot read "${text}"`)
    const phase = (m[1] === '-' ? 2 : 0) + (m[2] === 'i' ? 1 : 0)
    return Pauli.fromLetters(m[3].split('') as Letter[], phase)
  }

  /** Letters only (no sign), e.g. `XZIY`. */
  letters(): Letter[] {
    return this.x.map((xj, j) => letterOf(xj, this.z[j]))
  }

  /** The string with its sign: `+XZIY`, `-XZIY`, `+iXZIY`, `-iXZIY`. */
  toString(): string {
    return `${['+', '+i', '-', '-i'][this.phase]}${this.letters().join('')}`
  }

  /** The symplectic vector (x | z). */
  symplectic(): number[] {
    return [...this.x, ...this.z]
  }

  /** The number of non-identity letters (Bergou's "weight"). */
  weight(): number {
    return this.x.reduce((s, xj, j) => s + (xj | this.z[j]), 0)
  }

  /** The qubits where the letter is not I, increasing. */
  support(): number[] {
    return this.x.flatMap((xj, j) => (xj | this.z[j] ? [j] : []))
  }

  isIdentityUpToPhase(): boolean {
    return this.weight() === 0
  }

  /** Phase 0 or 2: the operator is Hermitian (±1 times a product of letters). */
  isHermitian(): boolean {
    return this.phase % 2 === 0
  }

  /** +1 or −1 for a Hermitian Pauli; throws for ±i. */
  sign(): 1 | -1 {
    if (!this.isHermitian()) throw new Error('Pauli.sign: the phase is ±i, not ±1')
    return this.phase === 0 ? 1 : -1
  }

  /** Same letters, phase multiplied by i^k. */
  withPhase(phase: number): Pauli {
    return new Pauli(this.x, this.z, phase)
  }

  /** −P. */
  negate(): Pauli {
    return new Pauli(this.x, this.z, this.phase + 2)
  }

  /** The same letters and the same phase? */
  equals(q: Pauli): boolean {
    return this.sameLetters(q) && this.phase === q.phase
  }

  /** The same string up to a factor i^k? */
  sameLetters(q: Pauli): boolean {
    return this.n === q.n && this.x.every((xj, j) => xj === q.x[j] && this.z[j] === q.z[j])
  }

  /** Do P and Q commute? (Their symplectic product is even.) */
  commutesWith(q: Pauli): boolean {
    return symplecticProduct(this, q) === 0
  }

  /**
   * The product P·Q (apply Q first, then P). The phase is exact:
   *   i^{p+q} · i^{Σ x₁z₁ + x₂z₂ + 2 z₁x₂ − (x₁⊕x₂)(z₁⊕z₂)}
   * (write each letter as i^{xz} X^x Z^z, move Z^{z₁} past X^{x₂} for a factor (−1)^{z₁x₂}, and write the result as letters again).
   */
  mul(q: Pauli): Pauli {
    if (this.n !== q.n) throw new Error(`Pauli.mul: ${this.n} and ${q.n} qubits`)
    let ph = this.phase + q.phase
    const x = new Array<number>(this.n)
    const z = new Array<number>(this.n)
    for (let j = 0; j < this.n; j++) {
      x[j] = this.x[j] ^ q.x[j]
      z[j] = this.z[j] ^ q.z[j]
      ph += this.x[j] * this.z[j] + q.x[j] * q.z[j] + 2 * this.z[j] * q.x[j] - x[j] * z[j]
    }
    return new Pauli(x, z, ph)
  }

  /** Conjugate by a Clifford gate: U P U†, which is again a Pauli (Gottesman–Knill). `qubits` are the wires (control first for CNOT / CZ). */
  conjugate(gate: CliffordGate, ...qubits: number[]): Pauli {
    const need = gate === 'CNOT' || gate === 'CZ' || gate === 'SWAP' ? 2 : 1
    if (qubits.length !== need) throw new Error(`Pauli.conjugate: ${gate} takes ${need} qubit(s)`)
    for (const q of qubits) if (!Number.isInteger(q) || q < 0 || q >= this.n) throw new Error(`Pauli.conjugate: qubit ${q} is outside 0 … ${this.n - 1}`)
    if (need === 2 && qubits[0] === qubits[1]) throw new Error('Pauli.conjugate: the two wires must differ')
    const x = [...this.x]
    const z = [...this.z]
    let ph = this.phase
    const [a, b] = qubits
    switch (gate) {
      case 'H': // X ↔ Z, Y → −Y
        ph += 2 * x[a] * z[a]
        ;[x[a], z[a]] = [z[a], x[a]]
        break
      case 'S': // X → Y, Y → −X, Z → Z
        ph += 2 * x[a] * z[a]
        z[a] ^= x[a]
        break
      case 'Sdg': // X → −Y, Y → X, Z → Z
        ph += 2 * x[a] * (1 ^ z[a])
        z[a] ^= x[a]
        break
      case 'X':
        ph += 2 * z[a]
        break
      case 'Z':
        ph += 2 * x[a]
        break
      case 'Y':
        ph += 2 * (x[a] ^ z[a])
        break
      case 'CNOT': // control a, target b: X_a → X_a X_b, Z_b → Z_a Z_b
        ph += 2 * x[a] * z[b] * (x[b] ^ z[a] ^ 1)
        x[b] ^= x[a]
        z[a] ^= z[b]
        break
      case 'CZ': // X_a → X_a Z_b, X_b → Z_a X_b
        ph += 2 * x[a] * x[b] * (z[a] ^ z[b])
        z[a] ^= x[b]
        z[b] ^= x[a]
        break
      case 'SWAP':
        ;[x[a], x[b]] = [x[b], x[a]]
        ;[z[a], z[b]] = [z[b], z[a]]
        break
    }
    return new Pauli(x, z, ph)
  }

  /** Move the letters to new positions: letter j goes to qubit `perm[j]`. */
  permuted(perm: readonly number[]): Pauli {
    if (perm.length !== this.n) throw new Error('Pauli.permuted: the permutation must list every qubit')
    const x = new Array<number>(this.n).fill(0)
    const z = new Array<number>(this.n).fill(0)
    perm.forEach((to, j) => {
      x[to] = this.x[j]
      z[to] = this.z[j]
    })
    return new Pauli(x, z, this.phase)
  }
}

/** The symplectic product x₁·z₂ + z₁·x₂ (mod 2) of two Paulis: 0 when they commute, 1 when they anticommute. */
export function symplecticProduct(p: Pauli, q: Pauli): number {
  if (p.n !== q.n) throw new Error(`symplecticProduct: ${p.n} and ${q.n} qubits`)
  return dot(p.x, q.z) ^ dot(p.z, q.x)
}

/** The same product for raw symplectic vectors (x | z) of equal even length. */
export function symplecticDot(u: Bits, v: Bits): number {
  if (u.length !== v.length || u.length % 2 !== 0) throw new Error('symplecticDot: vectors must have the same even length')
  const n = u.length / 2
  let s = 0
  for (let j = 0; j < n; j++) s ^= (u[j] & v[n + j]) ^ (u[n + j] & v[j])
  return s & 1
}

/** The product of a list of Paulis, left to right (the identity for an empty list needs n). */
export function product(ps: readonly Pauli[], n = ps[0]?.n ?? 0): Pauli {
  return ps.reduce((acc, p) => acc.mul(p), Pauli.identity(n))
}

/** The letters of a symplectic vector: `lettersOf([1,0,1, 0,1,1])` is `XZY`. */
export function lettersOf(v: Bits): Letter[] {
  return Pauli.fromSymplectic(v).letters()
}

/** The support (qubits with a non-identity letter) of a symplectic vector. */
export const symplecticSupport = (v: Bits): number[] => {
  const n = v.length / 2
  return support(v.slice(0, n).map((xj, j) => xj | v[n + j]))
}
