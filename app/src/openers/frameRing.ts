/**
 * Which opener frames to hold decoded (D-L1-scenes §5.3 "memory budget"). Pure: no DOM, no bitmaps.
 *
 * A decoded 1080 × 1350 RGBA frame is 5.83 MB, so all 120 would be 700 MB. The player keeps every frame as a
 * compressed Blob (≤ 8.4 MB in all) and decodes only a RING of 9 around the current one, biased 6 ahead and
 * 2 behind in the scroll direction (52.5 MB). A frame not decoded yet is never shown blank: the nearest
 * decoded frame stands in. Frames load coarse-to-fine: every 8th frame first, then the gaps.
 */

export const RING_SIZE = 9
const AHEAD = 6
const BEHIND = 2

/** Frames to hold decoded when the viewer is on `current` moving in direction `dir` (+1 forward, −1 back). */
export function ringFrames(current: number, dir: 1 | -1, total: number): number[] {
  const out: number[] = [current]
  const add = (f: number) => {
    if (f >= 0 && f < total && out.length < RING_SIZE && !out.includes(f)) out.push(f)
  }
  for (let k = 1; k <= AHEAD; k++) add(current + dir * k)
  for (let k = 1; k <= BEHIND; k++) add(current - dir * k)
  // at either end of the film the missing side is filled from the other one
  for (let k = 1; out.length < RING_SIZE && k < total; k++) {
    add(current + dir * k)
    add(current - dir * k)
  }
  return out
}

/** Fetch order: every `stride`-th frame first (a coarse film in ≈ 1 MB), then the rest in order. */
export function loadOrder(total: number, stride = 8): number[] {
  const coarse = Array.from({ length: Math.ceil(total / stride) }, (_, i) => i * stride)
  if (coarse[coarse.length - 1] !== total - 1) coarse.push(total - 1)
  const set = new Set(coarse)
  return [...coarse, ...Array.from({ length: total }, (_, f) => f).filter((f) => !set.has(f))]
}

/** The decoded frame closest to `want` (ties go to the earlier frame), or null when nothing is decoded. */
export function nearestDecoded(want: number, decoded: ReadonlySet<number>): number | null {
  if (decoded.has(want)) return want
  let best: number | null = null
  for (const f of decoded) if (best === null || Math.abs(f - want) < Math.abs(best - want) || (Math.abs(f - want) === Math.abs(best - want) && f < best)) best = f
  return best
}

/** Scroll progress 0…1 → frame index (clamped). */
export const frameAt = (progress: number, total: number): number => Math.min(total - 1, Math.max(0, Math.round(progress * (total - 1))))
