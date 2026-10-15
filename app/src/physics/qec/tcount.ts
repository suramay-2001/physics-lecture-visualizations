/**
 * T-count (background chapter B4, unit b4-synthesis; Ross and Selinger 2016, arXiv:1403.2975). Pure TypeScript.
 *
 * U_k is the set of single-qubit unitaries, modulo a global phase, that use at most k T gates together with any Clifford gates. It is found by a breadth-first search over 2 x 2 matrices that uses no
 * normal-form theorem: U_0 is the 24 Cliffords, and the gates with T-count exactly k are the new ones among {C·T·u : C a Clifford, u of T-count exactly k − 1} (a gate of minimal T-count k leaves
 * a gate of T-count k − 1 once its leading Clifford and T are peeled off). A matrix is identified by its entries after fixing the global phase (rounded to 7 digits). The sizes come out as
 * 24 (3·2^k − 2) = 24, 96, 240, 528, 1104, 2256, 4560 for k = 0 … 6.
 * The error of an approximation is the operator-norm distance modulo phase, sqrt(2 − |tr(U† V)|).
 * `tcountLaw(ε) = 3 log2(1/ε)`: the leading term of the published synthesis count (RS16), reported there, evaluated here.
 */

/** A 2 x 2 complex matrix as [re00, im00, re01, im01, re10, im10, re11, im11]. */
type M2 = readonly number[]
const s2 = Math.SQRT1_2
const H_: M2 = [s2, 0, s2, 0, s2, 0, -s2, 0]
const S_: M2 = [1, 0, 0, 0, 0, 0, 0, 1]
const T_: M2 = [1, 0, 0, 0, 0, 0, s2, s2]

function mul2(a: M2, b: M2, out: number[] | Float64Array = new Array<number>(8), o = 0): number[] | Float64Array {
  const [a0, a1, a2, a3, a4, a5, a6, a7] = a
  const [b0, b1, b2, b3, b4, b5, b6, b7] = b
  out[o] = a0 * b0 - a1 * b1 + a2 * b4 - a3 * b5
  out[o + 1] = a0 * b1 + a1 * b0 + a2 * b5 + a3 * b4
  out[o + 2] = a0 * b2 - a1 * b3 + a2 * b6 - a3 * b7
  out[o + 3] = a0 * b3 + a1 * b2 + a2 * b7 + a3 * b6
  out[o + 4] = a4 * b0 - a5 * b1 + a6 * b4 - a7 * b5
  out[o + 5] = a4 * b1 + a5 * b0 + a6 * b5 + a7 * b4
  out[o + 6] = a4 * b2 - a5 * b3 + a6 * b6 - a7 * b7
  out[o + 7] = a4 * b3 + a5 * b2 + a6 * b7 + a7 * b6
  return out
}

/** Fix the global phase: make the first entry of non-negligible size real and positive. */
function normalise(m: M2, out: number[] | Float64Array, o: number): void {
  const k = Math.hypot(m[0], m[1]) > 1e-9 ? 0 : 2
  const r = Math.hypot(m[k], m[k + 1])
  const cr = m[k] / r
  const ci = -m[k + 1] / r // multiply by conj(first)/|first|
  for (let i = 0; i < 8; i += 2) {
    out[o + i] = m[i] * cr - m[i + 1] * ci
    out[o + i + 1] = m[i] * ci + m[i + 1] * cr
  }
}
const keyOf = (v: ArrayLike<number>, o: number): string => {
  let s = ''
  for (let i = 0; i < 8; i++) s += Math.round(v[o + i] * 1e7) + ','
  return s
}

let CLIFF: Float64Array | null = null
/** The 24 single-qubit Cliffords modulo phase, as 24 normalised 2 x 2 matrices (flat). */
export function cliffords1(): Float64Array {
  if (CLIFF) return CLIFF
  const id: M2 = [1, 0, 0, 0, 0, 0, 1, 0]
  const seen = new Map<string, number[]>()
  const put = (m: number[]): boolean => {
    const n = new Array<number>(8)
    normalise(m, n, 0)
    const k = keyOf(n, 0)
    if (seen.has(k)) return false
    seen.set(k, n)
    return true
  }
  put([...id])
  let frontier = [[...id]]
  while (frontier.length) {
    const next: number[][] = []
    for (const u of frontier)
      for (const g of [H_, S_]) {
        const v = mul2(g, u) as number[]
        if (put(v)) next.push(v)
      }
    frontier = next
  }
  const all = [...seen.values()]
  CLIFF = Float64Array.from(all.flat())
  return CLIFF
}

/** Levels of the search: LEVELS[k] holds the matrices of T-count exactly k (flat, normalised). */
const LEVELS: Float64Array[] = []
let SEEN: Set<string> | null = null
export const TCOUNT_MAX = 12

function ensureLevels(kmax: number): void {
  if (kmax > TCOUNT_MAX || kmax < 0 || !Number.isInteger(kmax)) throw new Error(`tcount: k is a whole number 0 … ${TCOUNT_MAX}`)
  if (!LEVELS.length) {
    const cl = cliffords1()
    LEVELS.push(cl)
    SEEN = new Set<string>()
    for (let i = 0; i < cl.length; i += 8) SEEN.add(keyOf(cl, i))
  }
  const cl = cliffords1()
  // C·T for each Clifford, once
  const CT = new Float64Array(24 * 8)
  for (let c = 0; c < 24; c++) mul2(Array.from(cl.subarray(c * 8, c * 8 + 8)), T_, CT.subarray(c * 8, c * 8 + 8) as unknown as number[], 0)
  const scratch = new Array<number>(8)
  const norm = new Array<number>(8)
  while (LEVELS.length <= kmax) {
    const prev = LEVELS[LEVELS.length - 1]
    const fresh: number[] = []
    const freshKeys = new Set<string>()
    for (let u = 0; u < prev.length; u += 8) {
      const ub = Array.from(prev.subarray(u, u + 8))
      for (let c = 0; c < 24; c++) {
        mul2(Array.from(CT.subarray(c * 8, c * 8 + 8)), ub, scratch, 0)
        normalise(scratch, norm, 0)
        const k = keyOf(norm, 0)
        if (SEEN!.has(k) || freshKeys.has(k)) continue
        freshKeys.add(k)
        fresh.push(...norm)
      }
    }
    for (const k of freshKeys) SEEN!.add(k)
    LEVELS.push(Float64Array.from(fresh))
  }
}

/** |U_k| for k = 0 … kmax: the number of single-qubit gates (modulo phase) with at most k T gates. */
export function sets(kmax: number): number[] {
  if (kmax > 8) throw new Error('tcount.sets: k up to 8 (use bestErrors for a deeper search)')
  ensureLevels(kmax)
  const out: number[] = []
  let tot = 0
  for (let k = 0; k <= kmax; k++) {
    tot += LEVELS[k].length / 8
    out.push(tot)
  }
  return out
}

export type Target = readonly number[]
const rzT = (phi: number): Target => [Math.cos(phi / 2), -Math.sin(phi / 2), 0, 0, 0, 0, Math.cos(phi / 2), Math.sin(phi / 2)]
const rxT = (b: number): Target => [Math.cos(b / 2), 0, 0, -Math.sin(b / 2), 0, -Math.sin(b / 2), Math.cos(b / 2), 0]
/** R_z(φ) = diag(e^{−iφ/2}, e^{iφ/2}). */
export const rzTarget = rzT
/** The 27 generic rotations R_z(a) R_x(b) R_z(c) with a, c in {0.7, 2.4, 4.1} and b in {0.6, 1.5, 2.4}. */
export const GENERIC_TARGETS: readonly Target[] = (() => {
  const out: Target[] = []
  for (const a of [0.7, 2.4, 4.1]) for (const b of [0.6, 1.5, 2.4]) for (const c of [0.7, 2.4, 4.1]) out.push(mul2(mul2(rzT(a), rxT(b)) as number[], rzT(c)) as number[])
  return out
})()

/** Best error min over U_k of sqrt(2 − |tr(U† V)|) for k = 0 … kmax, for each target V (the best is non-increasing in k). */
export function bestErrors(targets: readonly Target[], kmax: number): number[][] {
  ensureLevels(kmax)
  const best = targets.map(() => 0)
  const out: number[][] = targets.map(() => [])
  for (let k = 0; k <= kmax; k++) {
    const lay = LEVELS[k]
    targets.forEach((V, ti) => {
      let mx = best[ti]
      for (let u = 0; u < lay.length; u += 8) {
        // tr(U† V) = Σ conj(U_ij) V_ij
        let re = 0
        let im = 0
        for (let i = 0; i < 8; i += 2) {
          re += lay[u + i] * V[i] + lay[u + i + 1] * V[i + 1]
          im += lay[u + i] * V[i + 1] - lay[u + i + 1] * V[i]
        }
        const a = Math.hypot(re, im)
        if (a > mx) mx = a
      }
      best[ti] = mx
      out[ti].push(Math.sqrt(Math.max(0, 2 - mx)))
    })
  }
  return out
}

/** Mean over targets of log2(1/ε) at each k, and the least-squares slope of that mean against k over k = lo … hi. */
export function meanLogSlope(errs: readonly (readonly number[])[], lo: number, hi: number): { meanLog: number[]; slope: number } {
  const K = errs[0].length
  const meanLog = Array.from({ length: K }, (_, k) => errs.reduce((s, e) => s + Math.log2(1 / e[k]), 0) / errs.length)
  const ks = Array.from({ length: hi - lo + 1 }, (_, i) => lo + i)
  const mx = ks.reduce((a, b) => a + b, 0) / ks.length
  const my = ks.reduce((a, k) => a + meanLog[k], 0) / ks.length
  const num = ks.reduce((a, k) => a + (k - mx) * (meanLog[k] - my), 0)
  const den = ks.reduce((a, k) => a + (k - mx) ** 2, 0)
  return { meanLog, slope: num / den }
}

/** The leading term of the published synthesis count: T gates for accuracy ε ≈ 3 log2(1/ε). */
export const tcountLaw = (eps: number): number => 3 * Math.log2(1 / eps)
/** The size law of the sets, 24 (3·2^k − 2), to compare with the search. */
export const setSizeLaw = (k: number): number => 24 * (3 * 2 ** k - 2)
