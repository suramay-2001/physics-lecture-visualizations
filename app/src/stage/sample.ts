/**
 * Beat sampling (W-L1 §2.5; pure, frozen at `l1-freeze`): beat position u ∈ [0, n] → which beats are on
 * stage, how far the change between them has gone, and each beat's hold progress.
 *
 * Beat k's text spans u ∈ [k, k+1). The change INTO beat k happens in the window [k − w, k + w] around its
 * boundary (w = TRANSITION_HALF_WIDTH, gate-proven), eased with smoothstep. Beat k HOLDS over
 * [k + w, k + 1 − w] (beat 0 from 0, beat n−1 to n); its hold progress s ∈ [0, 1] drives `Sweep` values
 * and scroll-bound counts.
 *
 * Reduced motion (decision #18): scroll still selects the beat, every change is a cut (w = 0), and s snaps
 * to 3 steps {0, ½, 1}, so a sweep jumps in three steps and nothing moves between them.
 */
export const TRANSITION_HALF_WIDTH = 0.35
/** Reduced-motion hold stops. */
export const REDUCED_STOPS = [0, 0.5, 1] as const

export interface BeatSample {
  /** Beat being left (= b while holding). */
  a: number
  /** Beat being entered (= a while holding). */
  b: number
  /** 0…1 eased progress from a to b (0 while holding). */
  t: number
  /** Hold progress used to resolve beat a's sweeps (1 during a change: a sweep ends at its `to`). */
  sA: number
  /** Hold progress used to resolve beat b's sweeps (0 during a change: the next beat starts at its `from`). */
  sB: number
  /** The beat whose text is at the centre line: clamp(floor(u), 0, n − 1). */
  beat: number
  /** Hold progress of `beat` (0…1). */
  hold: number
}

export const clamp01 = (x: number): number => (x < 0 ? 0 : x > 1 ? 1 : x)
/** 3t² − 2t³ on [0, 1] (D §4.0 `power1.inOut` equivalent). */
export const smoothstep = (x: number): number => {
  const t = clamp01(x)
  return t * t * (3 - 2 * t)
}
/** Snap a hold progress to the reduced-motion stops (thirds of the hold map to 0, ½, 1). */
export const quantizeHold = (s: number): number => (s < 1 / 3 ? 0 : s < 2 / 3 ? 0.5 : 1)

/** Hold progress of beat k at u (unclamped window → clamped 0…1). */
function holdOf(u: number, k: number, n: number, w: number): number {
  const start = k === 0 ? 0 : k + w
  const end = k === n - 1 ? n : k + 1 - w
  return end > start ? clamp01((u - start) / (end - start)) : 1
}

export function sampleBeats(u: number, n: number, motion: boolean): BeatSample {
  const count = Math.max(1, Math.floor(n))
  const x = Number.isFinite(u) ? Math.min(count, Math.max(0, u)) : 0
  const w = motion ? TRANSITION_HALF_WIDTH : 0
  const beat = Math.min(count - 1, Math.max(0, Math.floor(x)))
  const q = (s: number) => (motion ? s : quantizeHold(s))
  const hold = q(holdOf(x, beat, count, w))
  if (w > 0) {
    const kb = Math.round(x)
    if (kb >= 1 && kb <= count - 1 && Math.abs(x - kb) < w) {
      return { a: kb - 1, b: kb, t: smoothstep((x - (kb - w)) / (2 * w)), sA: 1, sB: 0, beat, hold }
    }
  }
  return { a: beat, b: beat, t: 0, sA: hold, sB: hold, beat, hold }
}
