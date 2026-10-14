/**
 * Failure chances and counting bounds drawn by the stage kind `plot` (curves `repFail3`, `repFail5`, `identityP`, `qhbNeed1`, `steaneFailX`) and used by the
 * error-correction chapters: the chance that a majority vote over n copies of a bit is wrong, the number of error "rooms" a code needs against the syndromes it
 * has (the quantum Hamming bound, N&C §10.3.4), and the exact logical failure chance of a CSS code against one kind of flip under its minimum-weight lookup
 * decoder, found by listing ALL 2ⁿ flip patterns (n ≤ 16). Pure TypeScript (qec/purity.test.ts).
 */
import type { CSSCode } from './codes'
import { rankOf } from './gf2'

const binom = (n: number, k: number): number => {
  if (k < 0 || k > n) return 0
  let r = 1
  for (let i = 1; i <= Math.min(k, n - k); i++) r = (r * (n - i + 1)) / i
  return Math.round(r)
}

/** P(exactly k of n independent events happen), each with chance p. */
export function binomialPmf(n: number, k: number, p: number): number {
  if (!Number.isInteger(n) || n < 0 || !Number.isInteger(k)) throw new Error('binomialPmf: n and k must be whole numbers, n ≥ 0')
  if (!(p >= 0 && p <= 1)) throw new Error('binomialPmf: p must lie in [0, 1]')
  return binom(n, k) * p ** k * (1 - p) ** (n - k)
}

/** The chance that a majority vote over n (odd) copies of a bit is wrong when each copy is flipped independently with chance p: Σ_{k > n/2} C(n,k) p^k (1−p)^{n−k}. */
export function repetitionFail(p: number, n: number): number {
  if (!Number.isInteger(n) || n < 1 || n % 2 === 0) throw new Error('repetitionFail: n must be an odd whole number')
  let s = 0
  for (let k = (n + 1) / 2; k <= n; k++) s += binomialPmf(n, k, p)
  return s
}

/** 2^k Σ_{j ≤ t} C(n, j) 3^j: how many "rooms" an [[n, k]] code needs to tell every Pauli error of weight ≤ t from the others (the left side of the quantum Hamming bound). */
export function qhbNeed(n: number, k: number, t: number): number {
  let s = 0
  for (let j = 0; j <= t; j++) s += binom(n, j) * 3 ** j
  return 2 ** k * s
}

/** The smallest n for which a nondegenerate [[n, k]] code correcting t errors fits the bound 2^k Σ_{j≤t} C(n,j)3^j ≤ 2^n (n ≤ 200), or null. */
export function qhbMinN(k: number, t: number): number | null {
  for (let n = Math.max(1, k); n <= 200; n++) if (qhbNeed(n, k, t) <= 2 ** n) return n
  return null
}

export const FAILURE_MAX_QUBITS = 16

/**
 * For a CSS code facing ONE kind of flip ('X' flips, caught by the Z checks and undone by looking up the lightest flip pattern with the same syndrome;
 * or 'Z' flips, caught by the X checks): how many of the C(n, w) flip patterns of each weight w leave a logical error behind. The residual is
 * pattern ⊕ correction; it fails exactly when it is not a sum of the OTHER type's checks (X flips: not in the row space of H_X). Exact: all 2ⁿ patterns.
 * Ties between equally light corrections break toward the pattern that comes first in increasing numeric order (the registered codes the chapters use have no ties).
 */
export function failuresByWeight(code: CSSCode, kind: 'X' | 'Z'): number[] {
  const memo = failureMemo.get(code)?.[kind]
  if (memo) return memo
  const out = enumerateFailures(code, kind)
  failureMemo.set(code, { ...failureMemo.get(code), [kind]: out })
  return out
}
const failureMemo = new WeakMap<CSSCode, Partial<Record<'X' | 'Z', number[]>>>()

function enumerateFailures(code: CSSCode, kind: 'X' | 'Z'): number[] {
  const n = code.n
  if (n > FAILURE_MAX_QUBITS) throw new Error(`failuresByWeight: ${n} qubits is more than the exact-enumeration limit ${FAILURE_MAX_QUBITS}`)
  const detect = kind === 'X' ? code.HZ : code.HX // the checks that see this flip
  const stab = kind === 'X' ? code.HX : code.HZ // the checks of the same letter: their span is harmless
  const bit = (b: number, j: number): number => (b >> (n - 1 - j)) & 1
  const toRow = (b: number): number[] => Array.from({ length: n }, (_, j) => bit(b, j))
  const synKey = (b: number): string => detect.mulVec(toRow(b)).join('')
  const weight = (b: number): number => {
    let w = 0
    for (let x = b; x; x &= x - 1) w++
    return w
  }
  const dim = 2 ** n
  // the lightest pattern per syndrome, in increasing numeric order within one weight
  const order = Array.from({ length: dim }, (_, b) => b).sort((a, b) => weight(a) - weight(b) || a - b)
  const leader = new Map<string, number>()
  for (const b of order) {
    const k = synKey(b)
    if (!leader.has(k)) leader.set(k, b)
  }
  const stabRank = stab.rank()
  const spans = (b: number): boolean => {
    if (b === 0) return true
    // b is in the row space of `stab` iff adding it does not raise the rank
    return rankOf([...stab.toRows(), toRow(b)], n) === stabRank
  }
  const out = new Array<number>(n + 1).fill(0)
  for (let b = 0; b < dim; b++) {
    const c = leader.get(synKey(b))!
    if (!spans(b ^ c)) out[weight(b)]++
  }
  return out
}

/** The logical failure chance P_L(p) of a CSS code against independent flips of one kind, each qubit with chance p (exact: Σ_w failuresByWeight[w] p^w (1−p)^{n−w}). */
export function logicalFailure(code: CSSCode, p: number, kind: 'X' | 'Z'): number {
  const f = failuresByWeight(code, kind)
  let s = 0
  for (let w = 0; w < f.length; w++) s += f[w] * p ** w * (1 - p) ** (code.n - w)
  return s
}
