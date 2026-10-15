/**
 * Magic states and their distillation (background chapter B4, units b4-beyond-clifford and b4-distill). Pure TypeScript.
 *
 * Part 1, the Bloch sphere. The single-qubit Clifford group acts on the Bloch sphere as the 24 rotations that map the octahedron with corners ±x, ±y, ±z onto itself; they are the closure of the Bloch
 * rotations of H and S. A state with Bloch vector v is a stabilizer state when v is a corner, and is imitated classically when v lies INSIDE the octahedron |x| + |y| + |z| ≤ 1 (Bravyi and Kitaev 2005,
 * Theorem 1, arXiv:quant-ph/0403025). The Clifford orbit of T|+⟩ = (|0⟩ + e^{iπ/4}|1⟩)/√2 has 12 points (their "H-type"); the 8 cube diagonals are their "T-type".
 *
 * Part 2, the 15-qubit code and 15-to-1 distillation (same paper, Section VI; Litinski 2019, arXiv:1905.06903, Section 1). The [[15,1,3]] Reed-Muller code has the 4 X checks whose columns count 1 … 15 in binary
 * (qubit j carries the bits of j) and 10 Z checks spanning the even-weight subcode of the [15,11,3] Hamming code. Z flips on the 15 inputs, each with chance ε independently, are ACCEPTED when all four X checks
 * read 0, i.e. the flip pattern is a Hamming word; an accepted pattern of odd weight corrupts the output. The output error is summed over the accepted patterns (never the cancelling closed form of the paper).
 */

export type V3 = readonly [number, number, number]
export type Mat3 = readonly (readonly number[])[]

/* --------------------------------------------------------------- the Bloch sphere */

/** Bloch rotation of H: (x, y, z) → (z, −y, x); of S: (x, y, z) → (−y, x, z). */
const R_H: Mat3 = [[0, 0, 1], [0, -1, 0], [1, 0, 0]]
const R_S: Mat3 = [[0, -1, 0], [1, 0, 0], [0, 0, 1]]
const mul3 = (a: Mat3, b: Mat3): number[][] => a.map((row) => [0, 1, 2].map((j) => row[0] * b[0][j] + row[1] * b[1][j] + row[2] * b[2][j]))
const key3 = (m: Mat3): string => m.map((r) => r.join(',')).join(';')
let GROUP1: Mat3[] | null = null

/** The 24 Bloch rotations of the single-qubit Clifford group (closure of H and S), identity first. */
export function cliffordGroup1(): Mat3[] {
  if (GROUP1) return GROUP1
  const id: Mat3 = [[1, 0, 0], [0, 1, 0], [0, 0, 1]]
  const seen = new Map<string, Mat3>([[key3(id), id]])
  let frontier: Mat3[] = [id]
  while (frontier.length) {
    const next: Mat3[] = []
    for (const m of frontier)
      for (const g of [R_H, R_S]) {
        const p = mul3(g, m)
        const k = key3(p)
        if (!seen.has(k)) {
          seen.set(k, p)
          next.push(p)
        }
      }
    frontier = next
  }
  GROUP1 = [...seen.values()]
  return GROUP1
}

const apply3 = (m: Mat3, v: V3): V3 => [0, 1, 2].map((i) => m[i][0] * v[0] + m[i][1] * v[1] + m[i][2] * v[2]) as unknown as V3
const clean = (x: number): number => Math.round(x * 1e6) / 1e6 + 0

/** The distinct images of a Bloch vector under the 24 Clifford rotations (rounded to 6 places), in a fixed order. */
export function orbit(v: V3): V3[] {
  const pts = new Map<string, V3>()
  for (const g of cliffordGroup1()) {
    const w = apply3(g, v).map(clean) as unknown as V3
    pts.set(w.join(','), w)
  }
  return [...pts.values()].sort((a, b) => a[0] - b[0] || a[1] - b[1] || a[2] - b[2])
}

/** |x| + |y| + |z|: at most 1 inside the octahedron of stabilizer states. */
export const l1 = (v: V3): number => Math.abs(v[0]) + Math.abs(v[1]) + Math.abs(v[2])
/** The Bloch vector of T|+⟩. */
export const T_PLUS: V3 = [Math.SQRT1_2, Math.SQRT1_2, 0]
/** A cube diagonal (BK05's T-type states point along these). */
export const T_TYPE: V3 = [1 / Math.sqrt(3), 1 / Math.sqrt(3), 1 / Math.sqrt(3)]
export const STABILIZER6: readonly V3[] = [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]]
/** Flip chance ε at which the arrow of T|+⟩, shortened to 1 − 2ε, reaches a face of the octahedron: ε = (1 − 1/√2)/2. */
export const octahedronEdge = (): number => 0.5 * (1 - 1 / Math.SQRT2)
/** The arrow after a flip chance ε: 1 − 2ε of its length. */
export const depolarizedLength = (eps: number): number => 1 - 2 * eps
/** Is the shortened state inside the octahedron (and so classically imitated)? */
export const insideOctahedron = (v: V3, eps: number): boolean => l1(v) * depolarizedLength(eps) <= 1 + 1e-12
export function scale3(v: V3, k: number): V3 {
  return [v[0] * k, v[1] * k, v[2] * k]
}

/* --------------------------------------------------------------- the 15-qubit code */

const N15 = 15
const popcount = (x: number): number => {
  let n = 0
  for (let v = x; v; v &= v - 1) n++
  return n
}
/** Row b of H_X, as a 15-bit mask (bit j−1 = qubit j): qubit j is on row b when bit b of the number j is 1. */
const HX_MASKS: number[] = [0, 1, 2, 3].map((b) => {
  let m = 0
  for (let j = 1; j <= N15; j++) if ((j >> b) & 1) m |= 1 << (j - 1)
  return m
})

export interface Fifteen {
  /** H_X: 4 rows of 15 bits, qubit 1 first. */
  HX: number[][]
  /** H_Z: 10 rows of 15 bits (a reduced basis of the even-weight subcode of the Hamming code). */
  HZ: number[][]
  xChecks: number
  /** Qubits per X check (8). */
  xWeight: number
  zChecks: number
  /** Distance against X-type logical operators (7) and Z-type ones (3). */
  dX: number
  dZ: number
  /** A_w: the number of flip patterns of weight w that pass all four X checks (the Hamming weight enumerator), w = 0 … 15. */
  weights: number[]
  /** How many patterns pass: 2^11 = 2048. */
  accepted: number
  /** The phase (degrees) that T on all 15 qubits gives |0̄⟩ and |1̄⟩. */
  phaseDeg: { zero: number; one: number }
}

let FIFTEEN: Fifteen | null = null

const bitsOf = (m: number): number[] => Array.from({ length: N15 }, (_, j) => (m >> j) & 1)

/** The code, found by testing all 2^15 flip patterns against the four X checks. */
export function fifteen(): Fifteen {
  if (FIFTEEN) return FIFTEEN
  const accepted: number[] = []
  for (let e = 0; e < 1 << N15; e++) if (HX_MASKS.every((r) => popcount(r & e) % 2 === 0)) accepted.push(e)
  const weights = new Array<number>(N15 + 1).fill(0)
  for (const e of accepted) weights[popcount(e)]++
  const even = accepted.filter((e) => popcount(e) % 2 === 0)
  // a reduced basis (GF(2) elimination keeping the lowest set bit of each pivot)
  const basis: number[] = []
  for (const v0 of even) {
    let v = v0
    for (const b of basis) v = Math.min(v, v ^ b)
    if (v) basis.push(v)
  }
  const dZ = Math.min(...accepted.filter((e) => popcount(e) % 2 === 1).map(popcount))
  const rowspace = new Set<number>()
  for (let m = 0; m < 16; m++) {
    let v = 0
    for (let b = 0; b < 4; b++) if ((m >> b) & 1) v ^= HX_MASKS[b]
    rowspace.add(v)
  }
  let dX = N15
  for (let x = 1; x < 1 << N15; x++) {
    const w = popcount(x)
    if (w >= dX || rowspace.has(x)) continue
    if (basis.every((b) => popcount(b & x) % 2 === 0)) dX = w
  }
  const ang = (w: number): number => {
    const a = ((w * 45) % 360 + 360) % 360
    return a > 180 ? a - 360 : a
  }
  const all = (1 << N15) - 1
  const zeroW = new Set([...rowspace].map(popcount))
  const oneW = new Set([...rowspace].map((v) => popcount(v ^ all)))
  const phase = (ws: Set<number>): number => {
    const a = new Set([...ws].map(ang))
    if (a.size !== 1) throw new Error('magic.fifteen: T^{⊗15} does not act as one phase on a logical state')
    return [...a][0]
  }
  FIFTEEN = {
    HX: HX_MASKS.map(bitsOf),
    HZ: reduce(basis).map(bitsOf),
    xChecks: 4,
    xWeight: popcount(HX_MASKS[0]),
    zChecks: basis.length,
    dX,
    dZ,
    weights,
    accepted: accepted.length,
    phaseDeg: { zero: phase(zeroW), one: phase(oneW) },
  }
  return FIFTEEN
}

/** Reduced row echelon form of GF(2) bit masks (pivot = lowest set bit), rows sorted by pivot. */
function reduce(rows: number[]): number[] {
  const out: number[] = []
  for (const r0 of rows) {
    let r = r0
    for (const b of out) if (r & (b & -b)) r ^= b
    if (!r) continue
    const p = r & -r
    for (let i = 0; i < out.length; i++) if (out[i] & p) out[i] ^= r
    out.push(r)
  }
  return out.sort((a, b) => (a & -a) - (b & -b))
}

/** The pass/fail verdict for a flip pattern (list of 1-based qubits, or a 0/1 list): the four check readings, accepted when all are 0, and whether an accepted pattern corrupts the output. */
export function syndrome15(flips: readonly number[]): { reads: number[]; accepted: boolean; corrupts: boolean } {
  let e = 0
  if (flips.length === N15 && flips.every((b) => b === 0 || b === 1)) flips.forEach((b, j) => b && (e |= 1 << j))
  else for (const q of flips) e |= 1 << (q - 1)
  const reads = HX_MASKS.map((r) => popcount(r & e) % 2)
  const accepted = reads.every((b) => b === 0)
  return { reads, accepted, corrupts: accepted && popcount(e) % 2 === 1 }
}

export interface Distill {
  /** Chance that all four checks read 0. */
  accept: number
  /** Chance that the output is wrong, given acceptance. */
  out: number
  /** Chance of an accepted odd-weight pattern, before dividing by accept. */
  bad: number
}

/** 15-to-1 at flip chance ε: the sums over the accepted patterns by weight (positive terms only, so nothing cancels). */
export function distill15(eps: number): Distill {
  const A = fifteen().weights
  let accept = 0
  let bad = 0
  for (let w = 0; w <= N15; w++) {
    const term = A[w] * Math.pow(eps, w) * Math.pow(1 - eps, N15 - w)
    accept += term
    if (w % 2 === 1) bad += term
  }
  return { accept, out: bad / accept, bad }
}

/** The fixed point ε* where one round returns the error it was given: out(ε*) = ε*, by bisection between 0.05 and 0.2. */
export function threshold(): number {
  let lo = 0.05
  let hi = 0.2
  for (let i = 0; i < 80; i++) {
    const mid = (lo + hi) / 2
    if (distill15(mid).out < mid) lo = mid
    else hi = mid
  }
  return (lo + hi) / 2
}

/** Two rounds: the output error of the first round is the input error of the second. */
export const distill15Rounds = (eps: number, rounds: number): number => {
  let e = eps
  for (let r = 0; r < rounds; r++) e = distill15(e).out
  return e
}
/** Inputs spent per accepted output: 15 / (acceptance chance). */
export const inputsPerOutput = (eps: number): number => N15 / distill15(eps).accept
/** The leading-order estimate 35 ε³ (35 = the number of weight-3 patterns that pass). */
export const lead35 = (eps: number): number => fifteen().weights[3] * Math.pow(eps, 3)

/** Eight log-spaced values of ε from 10^-4 to 0.2 and their outputs, for the plot (ε values are the engine's own grid). */
export function distillCurve(points: readonly number[]): { eps: number; out: number; accept: number }[] {
  return points.map((eps) => {
    const d = distill15(eps)
    return { eps, out: d.out, accept: d.accept }
  })
}

/* --------------------------------------------------------------- HT: a rotation that never returns */

/** (HT)^n for n = 1 … nmax by repeated 2 x 2 multiplication: the rotation angle of HT on the Bloch sphere and the closest approach to the identity within the first n powers. */
export function htPowers(nmax: number): { angleDeg: number; turns: number; best: (n: number) => number; trace: number[] } {
  type M = [number, number, number, number, number, number, number, number]
  const mul = (a: M, b: M): M => [
    a[0] * b[0] - a[1] * b[1] + a[2] * b[4] - a[3] * b[5],
    a[0] * b[1] + a[1] * b[0] + a[2] * b[5] + a[3] * b[4],
    a[0] * b[2] - a[1] * b[3] + a[2] * b[6] - a[3] * b[7],
    a[0] * b[3] + a[1] * b[2] + a[2] * b[7] + a[3] * b[6],
    a[4] * b[0] - a[5] * b[1] + a[6] * b[4] - a[7] * b[5],
    a[4] * b[1] + a[5] * b[0] + a[6] * b[5] + a[7] * b[4],
    a[4] * b[2] - a[5] * b[3] + a[6] * b[6] - a[7] * b[7],
    a[4] * b[3] + a[5] * b[2] + a[6] * b[7] + a[7] * b[6],
  ]
  const s = Math.SQRT1_2
  const H: M = [s, 0, s, 0, s, 0, -s, 0]
  const T: M = [1, 0, 0, 0, 0, 0, Math.SQRT1_2, Math.SQRT1_2]
  const W = mul(H, T)
  const absTr = (m: M): number => Math.hypot(m[0] + m[6], m[1] + m[7])
  // Distance to the identity modulo phase, sqrt(2 − |tr|), written so that it stays accurate when it is tiny: scale to determinant 1 (V = [[a, b], [−b̄, ā]]),
  // fix the sign so that Re a ≥ 0, and use sqrt(2)·sin α / sqrt(1 + cos α) with sin α = |(Im a, b)| and cos α = Re a.
  const dist = (m: M): number => {
    const dr = m[0] * m[6] - m[1] * m[7] - (m[2] * m[4] - m[3] * m[5])
    const di = m[0] * m[7] + m[1] * m[6] - (m[2] * m[5] + m[3] * m[4])
    const half = Math.atan2(di, dr) / 2
    const cr = Math.cos(half)
    const ci = -Math.sin(half)
    let ar = m[0] * cr - m[1] * ci
    let ai = m[0] * ci + m[1] * cr
    let br = m[2] * cr - m[3] * ci
    let bi = m[2] * ci + m[3] * cr
    if (ar < 0) {
      ar = -ar
      ai = -ai
      br = -br
      bi = -bi
    }
    return (Math.SQRT2 * Math.hypot(ai, br, bi)) / Math.sqrt(1 + ar)
  }
  let P: M = [1, 0, 0, 0, 0, 0, 1, 0]
  let best = Infinity
  const trace: number[] = []
  for (let n = 1; n <= nmax; n++) {
    P = mul(P, W)
    best = Math.min(best, dist(P))
    trace.push(best)
  }
  const angleDeg = (2 * Math.acos(absTr(W) / 2) * 180) / Math.PI
  return { angleDeg, turns: angleDeg / 360, best: (n) => trace[n - 1], trace }
}
