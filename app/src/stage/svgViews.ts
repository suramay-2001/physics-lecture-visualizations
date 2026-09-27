/**
 * The SVG route's views, as the instrument sees them (`window.__stage.views()` / `frame(key)`, stage/instrument.ts):
 * the same fields a WebGL view reports (key, kind, weight, slot, rect, screen, renders, warmups), so the story e2e
 * checks every beat of an SVG kind exactly as it checks a WebGL one. Written by stage/svg/SvgStage.tsx each frame it
 * drives. THREE-FREE.
 */
import type { StageKind, ViewSlot } from '../content/stage'
import type { AnyResolved } from './types'

/** What the instrument's `frame(key)` returns for an SVG view (the fields a WebGL StageFrame carries that tests read). */
export interface SvgFrame {
  unitId: string
  kind: StageKind
  slot: ViewSlot | null
  state: AnyResolved
  from: AnyResolved | null
  to: AnyResolved
  t: number
  beat: number
  hold: number
  revealed: boolean
  u: number
  clock: number
  motion: boolean
  focus: string | null
  weight: number
  size: { w: number; h: number }
}

export interface SvgViewEntry {
  readonly key: string
  readonly unitId: string
  readonly kind: StageKind
  /** Rect in CSS px within the unit's stage box. */
  rect: [number, number, number, number]
  /** Viewport rect, or null when off screen / weight 0. */
  screen: [number, number, number, number] | null
  weight: number
  frame: SvgFrame | null
  /** React commits of the view's scene. */
  renders: number
  /** 1 once the scene has committed its first picture (a WebGL view counts its shader warm-up here). */
  warmups: number
}

const entries = new Map<string, SvgViewEntry>()

/** Register (idempotent by key) and return the entry; the returned function removes it. */
export function registerSvgView(unitId: string, kind: StageKind): [SvgViewEntry, () => void] {
  const key = `${unitId}/${kind}`
  let e = entries.get(key)
  if (!e) {
    e = { key, unitId, kind, rect: [0, 0, 0, 0], screen: null, weight: 0, frame: null, renders: 0, warmups: 0 }
    entries.set(key, e)
  }
  const mine = e
  return [
    mine,
    () => {
      if (entries.get(key) === mine) entries.delete(key)
    },
  ]
}

export const getSvgViews = (): SvgViewEntry[] => [...entries.values()]

/* ---- a synchronous step, so the instrument's renderNow() can bring every SVG view up to date in one task ---- */
const flushers = new Set<() => void>()
export function registerSvgFlush(fn: () => void): () => void {
  flushers.add(fn)
  return () => flushers.delete(fn)
}
export function flushSvgViews(): void {
  flushers.forEach((fn) => fn())
}
