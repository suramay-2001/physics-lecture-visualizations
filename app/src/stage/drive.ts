/**
 * The Driver's pure core (W-L1 §2.3 priority −100): one unit's beat position → per-kind resolved frame,
 * view rect and weight. No DOM, React or three.js, so it runs in vitest over real content.
 *
 * Reveal transitions (decision #17): while the reader holds a clue beat, `revealMix(beat)` ∈ [0, 1] moves
 * the stage from the question picture (Beat.stage) to the answer picture (reveal.stage). The mix is
 * animated by the Driver on click (a cut under reduced motion); scroll never changes it.
 */
import type { Beat, StageKind, StageLayout, StageState, ViewSlot } from '../content/stage'
import { beatLayout, layoutSlots } from '../content/stage'
import { interpolate } from './interp'
import { resolve } from './resolve'
import { type BeatSample, sampleBeats, smoothstep } from './sample'
import type { AnyResolved } from './types'

/** Rect in CSS px within the stage box: [x, y, w, h] from the top-left. */
export type Rect = [number, number, number, number]

/** Split rig (D §3.2): two panes top/bottom with a 12 px gap. Inset (D §6.3): a 220 × 220 view under a
 *  28 px title strip, 14 px from the bottom-right corner (the caption sits bottom-left). */
export const SPLIT_GAP = 12
export const INSET = { w: 220, h: 220, strip: 28, margin: 14 } as const

export function slotRect(slot: ViewSlot, boxW: number, boxH: number): Rect {
  switch (slot) {
    case 'full':
    case 'main':
      return [0, 0, boxW, boxH]
    case 'top':
      return [0, 0, boxW, (boxH - SPLIT_GAP) / 2]
    case 'bottom':
      return [0, (boxH + SPLIT_GAP) / 2, boxW, (boxH - SPLIT_GAP) / 2]
    case 'inset':
      return [boxW - INSET.margin - INSET.w, boxH - INSET.margin - INSET.h, INSET.w, INSET.h]
  }
}

const lerpRect = (a: Rect, b: Rect, t: number): Rect => [
  a[0] + (b[0] - a[0]) * t,
  a[1] + (b[1] - a[1]) * t,
  a[2] + (b[2] - a[2]) * t,
  a[3] + (b[3] - a[3]) * t,
]

export interface KindDrive {
  kind: StageKind
  state: AnyResolved
  from: AnyResolved | null
  to: AnyResolved
  t: number
  slot: ViewSlot | null
  rect: Rect
  weight: number
}

export interface UnitDrive {
  sample: BeatSample
  /** The current beat's clue is revealed (mix ≥ ½). */
  revealed: boolean
  kinds: Map<StageKind, KindDrive>
}

function slotOf(l: StageLayout, kind: StageKind): { slot: ViewSlot; raw: StageState } | null {
  for (const s of layoutSlots(l)) if (s.state.kind === kind) return { slot: s.slot, raw: s.state }
  return null
}

/** Every kind a story uses (question and reveal pictures), in first-use order. */
export function storyKinds(beats: readonly Beat[]): StageKind[] {
  const out: StageKind[] = []
  for (const b of beats)
    for (const l of [b.stage, b.reveal?.stage])
      if (l) for (const s of layoutSlots(l)) if (!out.includes(s.state.kind)) out.push(s.state.kind)
  return out
}

/**
 * One unit at beat position u. `revealMix(i)` is beat i's reveal progress (0 = question, 1 = answer).
 * `kinds` lists every kind with a view (storyKinds); absent kinds get weight 0 and the nearest keyframe.
 */
export function driveUnit(
  beats: readonly Beat[],
  u: number,
  motion: boolean,
  revealMix: (beat: number) => number,
  box: { w: number; h: number },
  kinds: readonly StageKind[],
): UnitDrive {
  const n = beats.length
  const sample = sampleBeats(u, n, motion)
  const mixAt = (i: number) => {
    const m = beats[i].reveal ? revealMix(i) : 0
    return m < 0 ? 0 : m > 1 ? 1 : m
  }
  let layoutA: StageLayout
  let layoutB: StageLayout
  let sA = sample.sA
  let sB = sample.sB
  let t = sample.t
  if (sample.a !== sample.b) {
    layoutA = beatLayout(beats[sample.a], mixAt(sample.a) >= 0.5)
    layoutB = beatLayout(beats[sample.b], mixAt(sample.b) >= 0.5)
  } else {
    const b = beats[sample.a]
    const m = mixAt(sample.a)
    layoutA = beatLayout(b, false)
    layoutB = beatLayout(b, true)
    sA = sB = sample.hold
    t = layoutA === layoutB ? 0 : motion ? smoothstep(m) : m >= 0.5 ? 1 : 0
    if (t === 0) layoutB = layoutA
    else if (t === 1) layoutA = layoutB
  }
  const out = new Map<StageKind, KindDrive>()
  for (const kind of kinds) {
    const A = slotOf(layoutA, kind)
    const B = slotOf(layoutB, kind)
    if (A && B) {
      const rA = resolve(A.raw, sA) as AnyResolved
      const rB = layoutA === layoutB && sA === sB ? rA : (resolve(B.raw, sB) as AnyResolved)
      const moving = t > 0 && t < 1
      out.set(kind, {
        kind,
        state: moving ? interpolate(rA, rB, t) : t >= 1 ? rB : rA,
        from: moving ? rA : null,
        to: t > 0 ? rB : rA,
        t: moving ? t : 0,
        slot: t >= 0.5 ? B.slot : A.slot,
        rect: lerpRect(slotRect(A.slot, box.w, box.h), slotRect(B.slot, box.w, box.h), t),
        weight: 1,
      })
    } else if (B) {
      const rB = resolve(B.raw, sB) as AnyResolved
      out.set(kind, { kind, state: rB, from: null, to: rB, t, slot: B.slot, rect: slotRect(B.slot, box.w, box.h), weight: t })
    } else if (A) {
      const rA = resolve(A.raw, sA) as AnyResolved
      out.set(kind, { kind, state: rA, from: null, to: rA, t, slot: t >= 1 ? null : A.slot, rect: slotRect(A.slot, box.w, box.h), weight: 1 - t })
    } else {
      // absent: keep a valid state (nearest beat that shows this kind) so scenes never read garbage
      const near = nearestKeyframe(beats, sample.beat, kind)
      const r = near ? (resolve(near, 0) as AnyResolved) : null
      if (r) out.set(kind, { kind, state: r, from: null, to: r, t: 0, slot: null, rect: [0, 0, box.w, box.h], weight: 0 })
    }
  }
  return { sample, revealed: mixAt(sample.beat) >= 0.5, kinds: out }
}

function nearestKeyframe(beats: readonly Beat[], from: number, kind: StageKind) {
  for (let d = 0; d < beats.length; d++) {
    for (const i of [from + d, from - d]) {
      if (i < 0 || i >= beats.length) continue
      for (const l of [beats[i].stage, beats[i].reveal?.stage]) {
        if (!l) continue
        const hit = slotOf(l, kind)
        if (hit) return hit.raw
      }
    }
  }
  return null
}
