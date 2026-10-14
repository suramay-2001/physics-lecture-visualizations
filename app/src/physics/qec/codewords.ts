/**
 * The code words of a small code as dense state vectors (n ≤ 12), for the stage kind's `words` view and the chapters' claims: |0̄⟩ is the joint +1 eigenstate of
 * every check and of the textbook Z̄ (registry.ts `logical`), found by projecting basis states with Π (I + g)/2 until one survives; |1̄⟩ = X̄|0̄⟩; and
 * |+̄⟩ = (|0̄⟩ + |1̄⟩)/√2. The global phase of |0̄⟩ is fixed by making its first (lowest-index) nonzero amplitude real and positive.
 *
 * Index convention as everywhere in physics/qc: qubit 0 is the LEFTMOST letter of a string and the most significant bit of the basis index.
 * Applying a Pauli i^phase σ₀ ⊗ … ⊗ σ_{n−1} to |b⟩: X flips the bit, Z gives (−1)^b, Y gives i(−1)^b and flips the bit.
 * Pure TypeScript (qec/purity.test.ts).
 */
import { type C, c } from '../complex'
import type { Pauli } from './pauli'
import type { RegisteredCode } from './registry'

export const CODEWORDS_MAX_QUBITS = 12

export interface CodeAmp {
  /** The basis string, qubit 0 first. */
  bits: string
  amp: C
}
export interface Codewords {
  zero: CodeAmp[]
  one: CodeAmp[]
  plus: CodeAmp[]
}

type Dense = { re: Float64Array; im: Float64Array }

/** P|ψ⟩ for a dense state (a new vector). */
export function applyPauli(p: Pauli, psi: Dense): Dense {
  const n = p.n
  const dim = 2 ** n
  if (psi.re.length !== dim) throw new Error(`applyPauli: a ${n}-qubit Pauli on a vector of length ${psi.re.length}`)
  const L = p.letters()
  let flip = 0
  for (let j = 0; j < n; j++) if (L[j] === 'X' || L[j] === 'Y') flip |= 1 << (n - 1 - j)
  const re = new Float64Array(dim)
  const im = new Float64Array(dim)
  for (let b = 0; b < dim; b++) {
    if (psi.re[b] === 0 && psi.im[b] === 0) continue
    // exponent of i of the coefficient
    let e = p.phase
    for (let j = 0; j < n; j++) {
      const bit = (b >> (n - 1 - j)) & 1
      if (L[j] === 'Y') e += 1 + 2 * bit
      else if (L[j] === 'Z') e += 2 * bit
    }
    e = ((e % 4) + 4) % 4
    const [a, d] = [psi.re[b], psi.im[b]]
    const t = b ^ flip
    // multiply (a + id) by i^e
    if (e === 0) {
      re[t] += a
      im[t] += d
    } else if (e === 1) {
      re[t] += -d
      im[t] += a
    } else if (e === 2) {
      re[t] += -a
      im[t] += -d
    } else {
      re[t] += d
      im[t] += -a
    }
  }
  return { re, im }
}

const norm = (v: Dense): number => Math.sqrt(v.re.reduce((s, x, i) => s + x * x + v.im[i] * v.im[i], 0))

function projectAll(ops: readonly Pauli[], psi: Dense): Dense {
  let cur = psi
  for (const g of ops) {
    const gp = applyPauli(g, cur)
    cur = { re: cur.re.map((x, i) => (x + gp.re[i]) / 2), im: cur.im.map((x, i) => (x + gp.im[i]) / 2) }
  }
  return cur
}

/** Normalised, with the first nonzero amplitude real and positive. */
function tidy(v: Dense): Dense {
  const nm = norm(v)
  const re = v.re.map((x) => x / nm)
  const im = v.im.map((x) => x / nm)
  const k = re.findIndex((x, i) => Math.hypot(x, im[i]) > 1e-9)
  const m = Math.hypot(re[k], im[k])
  const pr = re[k] / m
  const pi = -im[k] / m // multiply by the conjugate phase
  return { re: re.map((x, i) => x * pr - im[i] * pi), im: re.map((x, i) => x * pi + im[i] * pr) }
}

function amps(v: Dense, n: number): CodeAmp[] {
  const out: CodeAmp[] = []
  for (let b = 0; b < v.re.length; b++) {
    if (Math.hypot(v.re[b], v.im[b]) > 1e-9) out.push({ bits: b.toString(2).padStart(n, '0'), amp: c(v.re[b], v.im[b]) })
  }
  return out
}

/**
 * The code words of a registered k = 1 code with n ≤ 12: |0̄⟩, |1̄⟩ and |+̄⟩ as their nonzero amplitudes in basis order. Throws for a code without textbook
 * logical operators (k ≠ 1) or too large to hold densely.
 */
export function codewords(entry: RegisteredCode): Codewords {
  const n = entry.n
  if (!entry.logical) throw new Error(`codewords: ${entry.id} has no single logical qubit (k = ${entry.k})`)
  if (n > CODEWORDS_MAX_QUBITS) throw new Error(`codewords: ${n} qubits is more than the dense limit ${CODEWORDS_MAX_QUBITS}`)
  const dim = 2 ** n
  const ops = [...entry.stabilizer.generators, entry.logical.Z]
  let zero: Dense | null = null
  for (let x = 0; x < dim && !zero; x++) {
    const basis: Dense = { re: new Float64Array(dim), im: new Float64Array(dim) }
    basis.re[x] = 1
    const p = projectAll(ops, basis)
    if (norm(p) > 1e-6) zero = tidy(p)
  }
  if (!zero) throw new Error(`codewords: no basis state has overlap with the +1 space of ${entry.id}`)
  // |1̄⟩ = X̄|0̄⟩ exactly (no re-fixing of the phase): then X̄ swaps the two words and |+̄⟩ is X̄'s +1 eigenstate
  const one = applyPauli(entry.logical.X, zero)
  const plus: Dense = tidy({ re: zero.re.map((x, i) => x + one.re[i]), im: zero.im.map((x, i) => x + one.im[i]) })
  return { zero: amps(zero, n), one: amps(one, n), plus: amps(plus, n) }
}
