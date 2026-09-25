/**
 * Label layout pass: the pure, THREE-free pieces (D §6.1; mechanism owned by W, tuning and styling by D).
 * The per-frame hook is `useDomLabels` (stage/hooks.ts, priority 500, after rendering). Since Round 3 (interface
 * change D1) it IS D's pass from `stage/scenes/labels.ts` `useSceneLabels`, folded in unchanged:
 *
 * - RESERVED ZONES: the passport(s), the readout column, the caption and the inset (each + 8 px), plus any zone
 *   the scene reserves (the lab's orientation gizmo). No label is ever placed inside one.
 * - COLLISIONS: labels are placed in priority order; each tries its anchor, then offsets up / right / down /
 *   left at 22 and 38 px and two diagonals, and takes the first spot that avoids reserved zones, labels already
 *   placed in its view and the view's edges (6 px). An offset label gets a 1 px leader to its anchor. No spot →
 *   it fades out (`data-hidden="1"`, opacity 0).
 * - FIXED labels (gizmo tips) are clamped into the view and may only slide along their own direction.
 * - No layout reads per frame: sizes come from a ResizeObserver; reserved rects are re-read on a beat / reveal /
 *   slot change (every 3rd frame for 30 frames) and every 20 frames.
 *
 * The older anchor-only helpers (`candidates`, `placeLabel`, `safeArea`, `LABEL_LAYOUT`) stay exported for the
 * tests that pin them.
 */

export interface LRect {
  x: number
  y: number
  w: number
  h: number
}

/** A rect in stage-box px as a tuple (D's `Rect`): x, y, w, h. */
export type LabelRect = [x: number, y: number, w: number, h: number]

/** Candidate offsets (px) tried after the anchor itself, in order (D §6.1). */
export const LABEL_OFFSETS: readonly (readonly [number, number])[] = [
  [0, 0],
  [0, -22],
  [22, 0],
  [0, 22],
  [-22, 0],
  [0, -38],
  [38, 0],
  [0, 38],
  [-38, 0],
  [30, -30],
  [-30, -30],
]
/** Margin kept around reserved zones and the scene's extra zones. */
export const RESERVE_MARGIN = 8
/** Margin kept between two labels. */
export const LABEL_MARGIN = 4
/** Labels stay this far inside their own view rect. */
export const LABEL_EDGE = 6
/** Steps (px) a fixed label may slide along its `slide` direction before the ordinary offsets. */
export const FIXED_SLIDE_STEPS: readonly number[] = [0, 14, 28, 42]
/** Priority of an anchor given as a bare vector, by the published tier (gizmo 0 · callout/chip 1 · spot 2 · axis 3). */
export const TIER_PRIORITY: Readonly<Record<string, number>> = { callout: 1, chip: 1, axis: 3 }

/** Do two rects overlap once `m` px of margin is added around the second? */
export const rectsHit = (a: LabelRect, b: LabelRect, m: number): boolean =>
  a[0] < b[0] + b[2] + m && a[0] + a[2] + m > b[0] && a[1] < b[1] + b[3] + m && a[1] + a[3] + m > b[1]

/**
 * Place one label of size w × h anchored at (x, y) (view px of the stage box). Pure: tries the candidates in
 * order and returns the spot (x, y may be clamped for a fixed label; ox, oy = the offset used) or null. The
 * accepted rect is pushed onto `placed`.
 */
export function placeItem(
  x: number,
  y: number,
  w: number,
  h: number,
  opts: { fixed?: boolean; slide?: readonly [number, number] },
  safe: LabelRect,
  reserved: readonly LabelRect[],
  extra: readonly LabelRect[],
  placed: LabelRect[],
): { x: number; y: number; ox: number; oy: number } | null {
  if (opts.fixed) {
    // fixed labels are clamped into the view instead of being moved around
    x = Math.min(safe[0] + safe[2] - w / 2, Math.max(safe[0] + w / 2, x))
    y = Math.min(safe[1] + safe[3] - h / 2, Math.max(safe[1] + h / 2, y))
  }
  const d = opts.slide ?? [0, 0]
  const cands: readonly (readonly [number, number])[] = opts.fixed ? FIXED_SLIDE_STEPS.map((k) => [d[0] * k, d[1] * k] as const).concat(LABEL_OFFSETS.slice(1)) : LABEL_OFFSETS
  for (const [dx, dy] of cands) {
    const r: LabelRect = [x + dx - w / 2, y + dy - h / 2, w, h]
    if (r[0] < safe[0] - 0.5 || r[1] < safe[1] - 0.5 || r[0] + w > safe[0] + safe[2] + 0.5 || r[1] + h > safe[1] + safe[3] + 0.5) continue
    if (reserved.some((q) => rectsHit(r, q, RESERVE_MARGIN))) continue
    // the scene's own zones (the gizmo) keep OTHER labels away; fixed labels (the gizmo's own) ignore them
    if (!opts.fixed && extra.some((q) => rectsHit(r, q, RESERVE_MARGIN))) continue
    if (placed.some((q) => rectsHit(r, q, LABEL_MARGIN))) continue
    placed.push(r)
    return { x, y, ox: dx, oy: dy }
  }
  return null
}

/** The overlay furniture every label avoids, as selectors (passports, readouts, caption, marked zones). */
export const RESERVED_SELECTOR = '.stage-passport, .stage-readouts, .stage-caption, [data-reserve]'

/**
 * Reserved rects (stage-box px) of the overlay furniture in a stage box. Bounding rects, so CSS translate on the
 * inset title strip is honoured. A layout read: call it on beat changes and every few frames only.
 */
export function overlayReservedRects(box: HTMLElement | null): LabelRect[] {
  if (!box) return []
  const out: LabelRect[] = []
  const b = box.getBoundingClientRect()
  box.querySelectorAll<HTMLElement>(RESERVED_SELECTOR).forEach((el) => {
    const r = el.getBoundingClientRect()
    if (r.width > 0 && r.height > 0) out.push([r.left - b.left, r.top - b.top, r.width, r.height])
  })
  return out
}

/** Ref callback marking an overlay element as a reserved zone (`data-reserve="<name>"`) for the layout pass. */
export function reserveRef(_unitId: string, name: string) {
  return (el: HTMLElement | null) => {
    if (el) el.dataset.reserve = name
  }
}

/* ------------------------------------------------------------------------------------------------ */
/* Anchor-only helpers (pre-D1 pass; kept for their tests)                                           */
/* ------------------------------------------------------------------------------------------------ */

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
