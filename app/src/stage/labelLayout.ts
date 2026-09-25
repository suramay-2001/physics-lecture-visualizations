/**
 * Label layout pass (D §6.1; generic mechanism owned by W, tuning and styling by D). THREE-FREE.
 *
 * Every frame, `useDomLabels` (priority 500, after rendering) places each anchored label of a unit:
 *   1. labels in priority order: callouts, then chips, then axis labels;
 *   2. candidates: the anchor itself, then offsets up / right / down / left at 20 px and 36 px;
 *   3. a candidate is accepted when its rect lies inside the bounds (the view rect ∩ the stage's safe area)
 *      and avoids every reserved rect (passport, readouts, caption, inset; each + 8 px) and every label
 *      already placed this frame in the same unit (split panes share one list);
 *   4. no candidate fits → the label fades out (`data-hidden="1"`, opacity 0; D's CSS transition).
 * An offset label gets `data-offset="1"` and `--leader-dx/--leader-dy` (px back to its anchor) so D can draw
 * a 1 px leader. No layout is read per frame: label sizes and reserved rects are cached by ResizeObserver
 * and ref callbacks (React commits), the stage box size is written by the Driver.
 */

export interface LRect {
  x: number
  y: number
  w: number
  h: number
}

/** Tunable by D (D §6.1 numbers). */
export const LABEL_LAYOUT = {
  /** Margin added around every reserved rect. */
  margin: 8,
  /** Offset distances tried after the anchor itself. */
  offsets: [20, 36] as readonly number[],
  /** Safe area inside the stage box (px from each edge). */
  safe: { top: 72, bottom: 132, side: 24 },
  /** Keep labels this far inside their own view rect. */
  viewInset: 4,
}

export const TIER_ORDER: Readonly<Record<string, number>> = { callout: 0, chip: 1, axis: 2 }

export const intersects = (a: LRect, b: LRect): boolean => a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h
export const inside = (a: LRect, b: LRect): boolean => a.x >= b.x && a.y >= b.y && a.x + a.w <= b.x + b.w && a.y + a.h <= b.y + b.h
export function intersect(a: LRect, b: LRect): LRect {
  const x = Math.max(a.x, b.x)
  const y = Math.max(a.y, b.y)
  return { x, y, w: Math.max(0, Math.min(a.x + a.w, b.x + b.w) - x), h: Math.max(0, Math.min(a.y + a.h, b.y + b.h) - y) }
}
export const grow = (r: LRect, m: number): LRect => ({ x: r.x - m, y: r.y - m, w: r.w + 2 * m, h: r.h + 2 * m })

/** Candidate centres around an anchor, in the order tried. */
export function candidates(offsets: readonly number[] = LABEL_LAYOUT.offsets): [number, number][] {
  const out: [number, number][] = [[0, 0]]
  for (const d of offsets) out.push([0, -d], [d, 0], [0, d], [-d, 0])
  return out
}
const DEFAULT_CANDIDATES = candidates()

/**
 * Pure: place one label (centred on its anchor or an offset). Returns the centre and the offset used,
 * or null when nothing fits. `obstacles` are already grown by their margins.
 */
export function placeLabel(
  anchor: { x: number; y: number },
  size: { w: number; h: number },
  obstacles: readonly LRect[],
  bounds: LRect,
  cands: readonly [number, number][] = DEFAULT_CANDIDATES,
): { x: number; y: number; dx: number; dy: number } | null {
  for (const [dx, dy] of cands) {
    const cx = anchor.x + dx
    const cy = anchor.y + dy
    const r = { x: cx - size.w / 2, y: cy - size.h / 2, w: size.w, h: size.h }
    if (!inside(r, bounds)) continue
    let hit = false
    for (const o of obstacles)
      if (intersects(r, o)) {
        hit = true
        break
      }
    if (!hit) return { x: cx, y: cy, dx, dy }
  }
  return null
}

/** Safe area of a stage box of size w × h. */
export function safeArea(w: number, h: number, s = LABEL_LAYOUT.safe): LRect {
  return { x: s.side, y: s.top, w: Math.max(0, w - 2 * s.side), h: Math.max(0, h - s.top - s.bottom) }
}

/* ------------------------------------------------------------------------------------------------ */
/* Caches (DOM side)                                                                                  */
/* ------------------------------------------------------------------------------------------------ */

const reserved = new Map<string, Map<string, LRect>>()
const EMPTY: ReadonlyMap<string, LRect> = new Map()

/** Reserved rects of a unit's stage box (box px, not yet grown). */
export function reservedRects(unitId: string): ReadonlyMap<string, LRect> {
  return reserved.get(unitId) ?? EMPTY
}

/**
 * Ref callback marking an overlay element as a reserved zone. Measured at every React commit (positions
 * change with the beat's layout) and on resize; the rect is relative to the stage overlay (= the box).
 */
export function reserveRef(unitId: string, name: string) {
  return (el: HTMLElement | null) => {
    if (!el) return
    el.dataset.reserve = name
    let map = reserved.get(unitId)
    if (!map) reserved.set(unitId, (map = new Map()))
    const m = map
    const measure = () => m.set(name, { x: el.offsetLeft, y: el.offsetTop, w: el.offsetWidth, h: el.offsetHeight })
    measure()
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(measure) : null
    ro?.observe(el)
    return () => {
      ro?.disconnect()
      m.delete(name)
      if (!m.size) reserved.delete(unitId)
    }
  }
}

const sizes = new WeakMap<HTMLElement, { w: number; h: number }>()
let sizeRO: ResizeObserver | null = null
/** Cached label size (measured once, then kept current by a shared ResizeObserver). */
export function labelSize(el: HTMLElement): { w: number; h: number } {
  let s = sizes.get(el)
  if (!s) {
    s = { w: el.offsetWidth, h: el.offsetHeight }
    sizes.set(el, s)
    if (typeof ResizeObserver !== 'undefined') {
      sizeRO ??= new ResizeObserver((entries) => {
        for (const e of entries) {
          const b = e.borderBoxSize?.[0]
          const target = e.target as HTMLElement
          sizes.set(target, b ? { w: b.inlineSize, h: b.blockSize } : { w: target.offsetWidth, h: target.offsetHeight })
        }
      })
      sizeRO.observe(el)
    }
  }
  return s
}

const boxes = new Map<string, { w: number; h: number }>()
/** Written by the Driver each frame (it already reads the box rect). */
export function setBoxSize(unitId: string, w: number, h: number): void {
  const b = boxes.get(unitId)
  if (b) {
    b.w = w
    b.h = h
  } else boxes.set(unitId, { w, h })
}
export function boxSize(unitId: string): { w: number; h: number } | undefined {
  return boxes.get(unitId)
}

/* Labels placed this frame, per unit (split panes avoid each other). */
let frameNo = 0
const placed = new Map<string, { frame: number; rects: LRect[] }>()
/** Called once per canvas frame (StageHost, priority −1000). */
export function beginLabelFrame(): void {
  frameNo++
}
export function placedThisFrame(unitId: string): LRect[] {
  let p = placed.get(unitId)
  if (!p) placed.set(unitId, (p = { frame: frameNo, rects: [] }))
  if (p.frame !== frameNo) {
    p.frame = frameNo
    p.rects.length = 0
  }
  return p.rects
}
