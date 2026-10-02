/**
 * Measuring registers (P-709-map §(b) "measure"; chapters Q3, Q4, Q9).
 *
 * Born rule on n-qubit state vectors: outcome probabilities, marginals over any qubits, post-measurement states,
 * measurement in another basis, Bell measurement, seeded multinomial sampling, and expectation values of operators on
 * any wires. Outcome strings list the measured qubits' bits in the order the qubits were given. ħ = 1.
 */
import { type C, ZERO, abs2, add, conj, mul } from '../complex'
import { type Mat, type Vec, dagger, matmul, msub, norm2, vscale } from '../linalg'
import { KET, basisMatrix } from '../spin'
import { applyGate } from './gates'
import { hammingWeight } from './bits'
import { mean, variance } from './info'
import { BELL_BASIS, checkWires, nQubits, subsetOffsets } from './state'

/** |ψ_i|² for every basis index i (not renormalized). */
export const probs = (psi: Vec): number[] => psi.map(abs2)

/**
 * The distribution of the bits on `qubits` (qubits[0] most significant): p[r] = Σ over the other qubits of |ψ|².
 * marginal(ψ, [2, 0])[0b10] is P(q2 = 1, q0 = 0).
 */
export function marginal(psi: Vec, qubits: readonly number[]): number[] {
  const n = nQubits(psi)
  checkWires(n, qubits, [], 'marginal')
  const off = subsetOffsets(qubits, n)
  const mask = off[off.length - 1]
  const out = new Array<number>(off.length).fill(0)
  const idx = new Map(off.map((o, r) => [o, r]))
  for (let i = 0; i < psi.length; i++) out[idx.get(i & mask)!] += abs2(psi[i])
  return out
}

/**
 * Project the `qubits` onto the bit string `bits` (one character per listed qubit): p = ‖Πψ‖², post = Πψ/√p, or
 * post = null when p = 0 (Bergou's collapse; 448's Rule 3).
 */
export function postMeasure(psi: Vec, qubits: readonly number[], bits: string): { p: number; post: Vec | null } {
  const n = nQubits(psi)
  checkWires(n, qubits, [], 'postMeasure')
  if (bits.length !== qubits.length || !/^[01]*$/.test(bits)) throw new Error('postMeasure: one bit per measured qubit')
  const off = subsetOffsets(qubits, n)
  const mask = off[off.length - 1]
  const want = off[parseInt(bits, 2)]
  const out = psi.map((x, i) => ((i & mask) === want ? x : ZERO))
  const p = norm2(out)
  return { p, post: p > 1e-15 ? vscale(out, 1 / Math.sqrt(p)) : null }
}

export interface QubitMeasurement {
  /** [P(0), P(1)] (or [P(first basis ket), P(second)] for measureInBasis) */
  p: [number, number]
  /** the normalized post-measurement states, null for an impossible outcome */
  post: [Vec | null, Vec | null]
}

/** Measure one qubit in the computational basis. */
export function measureQubit(psi: Vec, q: number): QubitMeasurement {
  const a = postMeasure(psi, [q], '0')
  const b = postMeasure(psi, [q], '1')
  return { p: [a.p, b.p], post: [a.post, b.post] }
}

const NAMED_BASES: Record<'x' | 'y' | 'z', [Vec, Vec]> = { x: [KET['+x'], KET['-x']], y: [KET['+y'], KET['-y']], z: [KET['+z'], KET['-z']] }

/**
 * Measure qubit q in the basis {|b₀⟩, |b₁⟩} ('x', 'y', 'z' or two orthonormal kets): p_k = ‖(|b_k⟩⟨b_k| ⊗ I)ψ‖²;
 * the post-states are written in the computational basis (the measured qubit is left in |b_k⟩).
 */
export function measureInBasis(psi: Vec, q: number, basis: 'x' | 'y' | 'z' | readonly [Vec, Vec]): QubitMeasurement {
  const kets = typeof basis === 'string' ? NAMED_BASES[basis] : basis
  const B = basisMatrix([kets[0], kets[1]])
  // rotate the basis to the computational one (B†), measure, rotate back (B)
  const m = measureQubit(applyGate(psi.slice(), dagger(B), [q]), q)
  return { p: m.p, post: [m.post[0] && applyGate(m.post[0], B, [q]), m.post[1] && applyGate(m.post[1], B, [q])] }
}

export interface BellOutcome {
  content: string
  name: string
  p: number
  post: Vec | null
}

/**
 * A Bell measurement on qubits a, b (in the order Φ+, Φ−, Ψ+, Ψ−, i.e. contents 00+11, 00-11, 01+10, 01-10 on
 * (a, b)): p = ‖(|B⟩⟨B|)ψ‖², and the post-state carries |B⟩ on (a, b).
 */
export function bellMeasure(psi: Vec, a: number, b: number): BellOutcome[] {
  return BELL_BASIS.map(({ content, name, ket: B }) => {
    const proj = B.map((x) => B.map((y) => mul(x, conj(y))))
    const out = applyGate(psi.slice(), proj, [a, b])
    const p = norm2(out)
    return { content, name, p, post: p > 1e-15 ? vscale(out, 1 / Math.sqrt(p)) : null }
  })
}

/**
 * Multinomial sampling: counts[i] after `shots` independent draws from the distribution p (seeded, so a run can be
 * replayed). Each shot inverts the cumulative distribution; p need not be normalized exactly (it is rescaled).
 */
export function sampleCounts(p: readonly number[], shots: number, rand: () => number): number[] {
  const cum: number[] = []
  let s = 0
  for (const x of p) cum.push((s += Math.max(0, x)))
  if (!(s > 0)) throw new Error('sampleCounts: the probabilities sum to zero')
  const counts = new Array<number>(p.length).fill(0)
  for (let k = 0; k < shots; k++) {
    const u = rand() * s
    let lo = 0
    let hi = cum.length - 1
    while (lo < hi) {
      const mid = (lo + hi) >> 1
      if (cum[mid] > u) hi = mid
      else lo = mid + 1
    }
    counts[lo]++
  }
  return counts
}

/** A = the operator on `qubits` (all qubits by default) applied to a copy of ψ. */
function applyOp(psi: Vec, A: Mat, qubits?: readonly number[]): Vec {
  const n = nQubits(psi)
  const q = qubits ?? Array.from({ length: n }, (_, k) => k)
  return applyGate(psi.slice(), A, q)
}

const innerV = (a: Vec, b: Vec): C => a.reduce((s, x, i) => add(s, mul(conj(x), b[i])), ZERO)

/** ⟨ψ|A|ψ⟩ as a complex number, for any A on `qubits` (all by default). Real exactly when A is Hermitian. */
export const expectationN = (psi: Vec, A: Mat, qubits?: readonly number[]): C => innerV(psi, applyOp(psi, A, qubits))

/** ⟨A^k⟩ (complex), the k-th moment. */
export function moment(psi: Vec, A: Mat, k: number, qubits?: readonly number[]): C {
  let v = psi
  for (let j = 0; j < k; j++) v = applyOp(v, A, qubits)
  return innerV(psi, v)
}

/**
 * (ΔA)² = ‖(A − ⟨A⟩)ψ‖² = ⟨A†A⟩ − |⟨A⟩|², which is ⟨A²⟩ − ⟨A⟩² for a Hermitian A (and never negative).
 */
export function varianceN(psi: Vec, A: Mat, qubits?: readonly number[]): number {
  const Apsi = applyOp(psi, A, qubits)
  const m = innerV(psi, Apsi)
  return Math.max(0, norm2(Apsi) - abs2(m))
}

/**
 * Robertson's relation ΔA·ΔB ≥ ½|⟨[A, B]⟩| (448 L7 §7.9) for operators on the same `qubits`: the product, the bound
 * and the slack (product − bound ≥ 0).
 */
export function robertsonBound(psi: Vec, A: Mat, B: Mat, qubits?: readonly number[]): { product: number; bound: number; slack: number } {
  const comm = msub(matmul(A, B), matmul(B, A))
  const product = Math.sqrt(varianceN(psi, A, qubits) * varianceN(psi, B, qubits))
  const e = expectationN(psi, comm, qubits)
  const bound = Math.sqrt(abs2(e)) / 2
  return { product, bound, slack: product - bound }
}

/** The fraction of each outcome in a counts array (the histogram a learner sees). */
export const frequencies = (counts: readonly number[]): number[] => {
  const N = counts.reduce((s, x) => s + x, 0)
  return counts.map((k) => (N ? k / N : 0))
}

/** |⟨a|ψ⟩|² for n-qubit states. */
export const overlapProb = (a: Vec, psi: Vec): number => abs2(innerV(a, psi))

/** The amplitude ⟨bits|ψ⟩ of one basis string (q0 first). */
export function amplitude(psi: Vec, bits: string): C {
  if (!/^[01]+$/.test(bits) || 2 ** bits.length !== psi.length) throw new Error('amplitude: one bit per qubit')
  return psi[parseInt(bits, 2)]
}

/**
 * The 2ⁿ outcome probabilities of measuring EVERY qubit at once, each in its own basis `bases[q]` ('x', 'y' or
 * 'z'): rotate each qubit to the computational basis with the dagger of its basis matrix (a strided `applyGate`
 * per qubit, O(n·2ⁿ)), then take |·|² (Q6, Q7, F2). The numpy twin instead builds the full kron of every qubit's
 * B† and multiplies once — an independent route to the same probabilities.
 */
export function localBasisProbs(psi: Vec, bases: readonly ('x' | 'y' | 'z')[]): number[] {
  const n = nQubits(psi)
  if (bases.length !== n) throw new Error('localBasisProbs: one basis per qubit')
  let v = psi.slice()
  for (let q = 0; q < n; q++) {
    const kets = NAMED_BASES[bases[q]]
    v = applyGate(v, dagger(basisMatrix([kets[0], kets[1]])), [q])
  }
  return probs(v)
}

/**
 * The product-observable expectation of one run: ⟨∏_q O_q⟩ = Σ_i localBasisProbs(ψ, bases)[i] · (−1)^{weight(i)},
 * reading each qubit's own outcome bit as ±1 (0 ↦ +1, 1 ↦ −1). Q7's Mermin/GHZ argument forces this to exactly −1
 * for one choice of bases and +1 for three others, even though each single qubit's own outcome stays random —
 * "certainty without instructions". Snaps to exactly ±1 when within `eps` (floating noise, not a real deviation).
 */
export function runBracket(psi: Vec, bases: readonly ('x' | 'y' | 'z')[], eps = 1e-9): number {
  const p = localBasisProbs(psi, bases)
  let value = 0
  for (let i = 0; i < p.length; i++) value += p[i] * (hammingWeight(i) % 2 ? -1 : 1)
  if (Math.abs(value - 1) < eps) return 1
  if (Math.abs(value + 1) < eps) return -1
  return value
}

/**
 * Mean and variance of the COUNT of qubits read as `bit` (default 1) when ψ is measured in the computational
 * basis: the Born-rule distribution (`probs`) weighted by Hamming weight (or n − weight for bit = 0), scored
 * through `info.ts`'s generic `mean`/`variance` (HW2 P5's binomial statistics of N qubits; F2).
 */
export function weightStats(psi: Vec, bit: 0 | 1 = 1): { mean: number; variance: number } {
  const n = nQubits(psi)
  const p = probs(psi)
  const counts = p.map((_, i) => (bit === 1 ? hammingWeight(i) : n - hammingWeight(i)))
  return { mean: mean(counts, p), variance: variance(counts, p) }
}
