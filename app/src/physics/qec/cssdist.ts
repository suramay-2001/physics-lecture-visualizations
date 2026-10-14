/**
 * Exact distances of a small CSS code given as check supports (Chapter B3: the deformed codes of lattice surgery and gauging have 21 … 40 qubits). For a code with X checks H_X and
 * Z checks H_Z on n qubits:
 *   d_X = least weight of an X-type logical operator: a vector v with H_Z v = 0 that is NOT a combination of the rows of H_X,
 *   d_Z = the same with the roles swapped.
 * Search: a basis of the logical operators modulo the stabilizers, then every one of the 2^r stabilizer shifts (Gray code) of every non-trivial logical combination. Cost 2^r · (2^k − 1)
 * words, refused above 2^24. Pure TypeScript; no randomness.
 */
import { GF2Matrix } from './gf2'

export const CSSDIST_MAX_WORDS = 2 ** 24
export const CSSDIST_MAX_N = 52

const popLo = (x: number): number => {
  x = x - ((x >>> 1) & 0x55555555)
  x = (x & 0x33333333) + ((x >>> 2) & 0x33333333)
  return (((x + (x >>> 4)) & 0x0f0f0f0f) * 0x01010101) >>> 24
}

const toBig = (v: readonly number[]): bigint => v.reduce<bigint>((m, b, i) => (b ? m | (1n << BigInt(i)) : m), 0n)
const bitLength = (x: bigint): number => (x === 0n ? 0 : x.toString(2).length)

/** Least weight of v in null(kill) outside rowspace(stab), or null when there is no such v (no logical operator of this type). */
function minLogicalWeight(kill: readonly (readonly number[])[], stab: readonly (readonly number[])[], n: number): number | null {
  const nullRows = (kill.length ? GF2Matrix.fromSupports(kill, n).nullspace() : GF2Matrix.identity(n)).toRows()
  const stabBasis = (stab.length ? GF2Matrix.fromSupports(stab, n).rowBasis().toRows() : []).map(toBig)
  // echelon form of the stabilizer span, keyed by the leading bit
  const lead = new Map<number, bigint>()
  const reduce = (v: bigint): bigint => {
    while (v !== 0n) {
      const b = bitLength(v)
      const e = lead.get(b)
      if (e === undefined) return v
      v ^= e
    }
    return 0n
  }
  for (const s of stabBasis) {
    const r = reduce(s)
    if (r !== 0n) lead.set(bitLength(r), r)
  }
  const logicals: bigint[] = []
  for (const row of nullRows) {
    const v = toBig(row)
    const r = reduce(v)
    if (r !== 0n) {
      lead.set(bitLength(r), r)
      logicals.push(v)
    }
  }
  if (logicals.length === 0) return null
  const r = stabBasis.length
  if (r + logicals.length > 24) throw new Error(`cssdist: ${2 ** (r + logicals.length)} words is more than the cap 2^24`)
  const lo = (x: bigint): number => Number(x & 0xffffffffn)
  const hi = (x: bigint): number => Number(x >> 32n)
  const sLo = stabBasis.map(lo)
  const sHi = stabBasis.map(hi)
  let best = Infinity
  for (let m = 1; m < 2 ** logicals.length; m++) {
    let base = 0n
    for (let i = 0; i < logicals.length; i++) if ((m >> i) & 1) base ^= logicals[i]
    let cl = lo(base)
    let ch = hi(base)
    best = Math.min(best, popLo(cl >>> 0) + popLo(ch >>> 0))
    for (let g = 1; g < 2 ** r; g++) {
      const j = 31 - Math.clz32(g & -g)
      cl ^= sLo[j]
      ch ^= sHi[j]
      const w = popLo(cl >>> 0) + popLo(ch >>> 0)
      if (w < best) best = w
    }
  }
  return best
}

export interface CssDistances {
  /** Stored qubits k = n − rank(H_X) − rank(H_Z). */
  k: number
  /** Least weight of an X-type / Z-type logical operator; null when k = 0. */
  dX: number | null
  dZ: number | null
  /** min(dX, dZ), or null when k = 0. */
  d: number | null
}

/** Exact (d_X, d_Z) of the CSS code with the given X and Z check supports on n ≤ 52 qubits. The checks must commute (not tested here). */
export function cssDistances(xChecks: readonly (readonly number[])[], zChecks: readonly (readonly number[])[], n: number): CssDistances {
  if (!Number.isInteger(n) || n < 1 || n > CSSDIST_MAX_N) throw new Error(`cssDistances: n must be 1 … ${CSSDIST_MAX_N}`)
  const rx = xChecks.length ? GF2Matrix.fromSupports(xChecks, n).rank() : 0
  const rz = zChecks.length ? GF2Matrix.fromSupports(zChecks, n).rank() : 0
  const k = n - rx - rz
  if (k <= 0) return { k: Math.max(0, k), dX: null, dZ: null, d: null }
  const dX = minLogicalWeight(zChecks, xChecks, n)
  const dZ = minLogicalWeight(xChecks, zChecks, n)
  return { k, dX, dZ, d: dX === null || dZ === null ? null : Math.min(dX, dZ) }
}
