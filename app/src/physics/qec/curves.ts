/**
 * Logical-error arithmetic for the background chapter B1 (P-B1-story §9.1): the chance a long run stays clean, the per-step budget of a long
 * computation, the failure of a majority vote of d copies, and the three published fits of the surface code's logical error rate
 * P(d) = a (p/p*)^e(d). The fits are arithmetic on constants the papers print (never a measurement made here): each preset carries its source.
 * Pure and deterministic. Numpy twin: pipeline/claims_papers/b1.py (and pipeline/qec_numpy.py for the fixtures).
 */

/** (1 − p)^N: the chance that N operations, each failing independently with chance p, are all fault free. */
export function cleanRun(N: number, p: number): number {
  if (!(N >= 0) || !(p >= 0 && p <= 1)) throw new Error('cleanRun: need N ≥ 0 and 0 ≤ p ≤ 1')
  return Math.exp(N * Math.log1p(-p))
}

/** The per-step logical error that still leaves a run of N steps clean with chance `success`: 1 − success^(1/N). */
export function logicalBudget(N: number, success: number): number {
  if (!(N >= 1) || !(success > 0 && success < 1)) throw new Error('logicalBudget: need N ≥ 1 and 0 < success < 1')
  return -Math.expm1(Math.log(success) / N)
}

/** C(n, k) as a float (exact while it stays below 2^53). */
export function choose(n: number, k: number): number {
  if (k < 0 || k > n) return 0
  let r = 1
  for (let i = 1; i <= Math.min(k, n - k); i++) r = (r * (n - i + 1)) / i
  return Math.round(r) === r && r < 2 ** 53 ? Math.round(r) : r
}

/** A majority vote of d (odd) copies of a bit that each flip with chance p fails when more than half flip: Σ_{w > d/2} C(d,w) p^w (1−p)^(d−w). */
export function repetitionLogical(d: number, p: number): number {
  if (!Number.isInteger(d) || d < 1 || d % 2 === 0) throw new Error('repetitionLogical: d must be an odd whole number')
  let s = 0
  for (let w = (d + 1) / 2; w <= d; w++) s += choose(d, w) * p ** w * (1 - p) ** (d - w)
  return s
}

export interface SurfacePreset {
  id: 'tdg-2.6' | 'tdg-A10' | 'bev22'
  /** the short code outputs use ("26", "A10", "Bev22") */
  code: '26' | 'A10' | 'Bev22'
  /** where the constants are printed (paraphrased) */
  source: string
  a: number
  pStar: number
  /** the exponent e(d) of (p/p*): d/2 or (d+1)/2 */
  exponent: (d: number) => number
}

export const SURFACE_PRESETS: readonly SurfacePreset[] = [
  { id: 'tdg-2.6', code: '26', source: 'the paper, section 2.6', a: 0.1, pStar: 0.01, exponent: (d) => d / 2 },
  { id: 'tdg-A10', code: 'A10', source: 'the paper, appendix A.10', a: 0.03, pStar: 0.01, exponent: (d) => d / 2 },
  { id: 'bev22', code: 'Bev22', source: 'Beverland et al. 2022, appendix B, table 5', a: 0.03, pStar: 0.01, exponent: (d) => (d + 1) / 2 },
]

export function surfacePreset(id: string): SurfacePreset {
  const s = SURFACE_PRESETS.find((x) => x.id === id)
  if (!s) throw new Error(`surfacePreset: unknown preset ${id}`)
  return s
}

/** P(d) = a (p/p*)^e(d) for a preset. */
export function surfaceFit(d: number, p: number, preset: string): number {
  const s = surfacePreset(preset)
  return s.a * (p / s.pStar) ** s.exponent(d)
}

/** The factor the error shrinks by for every +2 in d: P(d)/P(d+2) = pStar over p, for all three presets. */
export function suppressionPerStep(p: number, preset: string): number {
  return surfaceFit(5, p, preset) / surfaceFit(7, p, preset)
}

/** The least odd d ≥ 3 whose error is at most `target` (null if none up to `max`). */
export function dNeeded(fn: (d: number) => number, target: number, max = 399): number | null {
  for (let d = 3; d <= max; d += 2) if (fn(d) <= target) return d
  return null
}

/** Qubits of a rotated patch of distance d, data plus checks: 2d² − 1. */
export const patchQubits = (d: number): number => 2 * d * d - 1

/** Steps of +2 in d needed to shrink the error by `factor`: ⌈ln factor / ln Λ⌉. */
export const stepsFor = (factor: number, lambda: number): number => Math.ceil(Math.log(factor) / Math.log(lambda) - 1e-12)
