/**
 * Pure helpers of the `optics-bench` plot: nice ticks, scales, curve sampling and path strings. No React, no DOM, so each is unit-tested
 * on its own (widgets/OpticsBench.test.tsx). Every string that reaches the SVG is built here from finite numbers only.
 */

/** A round step (1, 2, 2.5 or 5 times a power of ten) so that about `target` steps span `range`. */
export function niceStep(range: number, target = 6): number {
  if (!(range > 0) || !Number.isFinite(range)) return 1
  const raw = range / Math.max(1, target)
  const pow = 10 ** Math.floor(Math.log10(raw))
  const f = raw / pow
  const m = f <= 1 ? 1 : f <= 2 ? 2 : f <= 2.5 ? 2.5 : f <= 5 ? 5 : 10
  return m * pow
}

/** Multiples of the nice step inside [lo, hi], inclusive (a tiny tolerance keeps the end ticks). */
export function niceTicks(lo: number, hi: number, target = 6): number[] {
  const step = niceStep(hi - lo, target)
  const first = Math.ceil(lo / step - 1e-9)
  const last = Math.floor(hi / step + 1e-9)
  const out: number[] = []
  for (let k = first; k <= last; k++) out.push(Number((k * step).toPrecision(12)))
  return out
}

/** The domain widened to whole nice steps (for a vertical axis that follows the data). */
export function niceDomain(lo: number, hi: number, target = 5): [number, number] {
  if (!(hi > lo)) return [lo - 1, hi + 1]
  const step = niceStep(hi - lo, target)
  return [Math.floor(lo / step + 1e-9) * step, Math.ceil(hi / step - 1e-9) * step]
}

/** Decimals needed to print multiples of `step` exactly (0.25 -> 2, 5 -> 0). */
export function decimalsOf(step: number): number {
  for (let d = 0; d <= 6; d++) if (Math.abs(step * 10 ** d - Math.round(step * 10 ** d)) < 1e-9) return d
  return 6
}

/** A number with fixed decimals, never "-0.00" and never "NaN" (an unreadable value prints an en dash). */
export function fixed(v: number, digits: number): string {
  if (!Number.isFinite(v)) return '–'
  const s = v.toFixed(Math.max(0, Math.min(8, digits)))
  return /^-0(?:\.0+)?$/.test(s) ? s.slice(1) : s
}

export interface Pt {
  x: number
  /** NaN when the curve has no finite value there (the path leaves a gap). */
  y: number
}

/** `n + 1` evenly spaced samples of f over [from, to]. */
export function sample(f: (x: number) => number, from: number, to: number, n = 240): Pt[] {
  const out: Pt[] = []
  for (let i = 0; i <= n; i++) {
    const x = from + ((to - from) * i) / n
    const y = f(x)
    out.push({ x, y: Number.isFinite(y) ? y : Number.NaN })
  }
  return out
}

/** The smallest and largest finite y over several sampled curves, or null when none is finite. */
export function yExtent(curves: readonly (readonly Pt[])[]): [number, number] | null {
  let lo = Infinity
  let hi = -Infinity
  for (const c of curves) for (const p of c) if (Number.isFinite(p.y)) (lo = Math.min(lo, p.y)), (hi = Math.max(hi, p.y))
  return lo <= hi ? [lo, hi] : null
}

/** An SVG path through the samples in pixel space: `M` at the start of every run of finite points, `L` after it; gaps break the line. */
export function pathOf(points: readonly Pt[], sx: (x: number) => number, sy: (y: number) => number): string {
  let d = ''
  let pen = false
  for (const p of points) {
    if (!Number.isFinite(p.y)) {
      pen = false
      continue
    }
    d += `${pen ? 'L' : 'M'}${sx(p.x).toFixed(2)} ${sy(p.y).toFixed(2)}`
    pen = true
  }
  return d
}

/** A linear scale from [d0, d1] to [r0, r1]. */
export const scale = (d0: number, d1: number, r0: number, r1: number) => (v: number) => r0 + ((v - d0) / (d1 - d0)) * (r1 - r0)
