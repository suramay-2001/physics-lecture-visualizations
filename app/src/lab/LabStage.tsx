/**
 * Shared pieces of a bench's stage (Babylon-free; the next benches reuse them):
 *   useLabStage(bench)       the engine for this bench (≥ 900 px with WebGL only), its handle, status and loss state
 *   <LabFallback>            the DOM fallback after a context loss or a failed start ("Restart 3D")
 *   useProjectedLabels(...)  DOM labels placed by projection after every frame (per view, or at a scene anchor),
 *                            kept apart and off the overlay furniture by an avoidance pass (priority order)
 *   <LabPassport>            a view's passport as the fidelity button (the lecture FidelityDrawer, bench content)
 *   useSplit(ref)            'lr' on a wide stage box, 'tb' on a squarer one (for two-view benches)
 * Every word and number stays DOM (ruling 2); the canvas never formats anything.
 */
import { useCallback, useEffect, useLayoutEffect, useRef, useState, type RefObject } from 'react'
import { FidelityDrawer } from '../components/FidelityDrawer'
import type { Fidelity, FidelityKey, Passport, StageKind } from '../content/stage'
import { LABEL_EDGE, placeItem, type LabelRect } from '../stage/labelLayout'
import { useStageFlag } from '../stage/store'
import { useMedia, webglAvailable, WIDE_QUERY } from '../stage/useLiveStage'
import { Rich } from '../ui/Rich'
import type { V3 } from './axes'
import type { LabBenchId, LabHandle } from './handle'
import { LAB_RESERVED_SELECTOR, LAB_VIEW_SELECTOR } from './labelBoxes'
import { restartLab, useLab } from './labStore'
import { useLabEngine, type LabEngineStatus } from './useLabEngine'

/** Rects (px relative to `root`'s top-left) of the elements matching `selector` inside `root` that have a size. */
function rectsIn(root: HTMLElement, selector: string): { el: HTMLElement; rect: LabelRect }[] {
  const b = root.getBoundingClientRect()
  const out: { el: HTMLElement; rect: LabelRect }[] = []
  root.querySelectorAll<HTMLElement>(selector).forEach((el) => {
    const r = el.getBoundingClientRect()
    if (r.width > 0 && r.height > 0) out.push({ el, rect: [r.left - b.left, r.top - b.top, r.width, r.height] })
  })
  return out
}

export function useLabStage(bench: LabBenchId) {
  const wide = useMedia(WIDE_QUERY)
  const { lost, givenUp, epoch } = useLab()
  const motion = useStageFlag('motion')
  const host = useRef<HTMLDivElement>(null)
  const live = wide && webglAvailable() && !givenUp
  const { handle, status } = useLabEngine(host, live && !lost, epoch, motion, bench)
  return { wide, host, handle, status, lost, givenUp, motion }
}

export function LabFallback({ lost, givenUp, status }: { lost: boolean; givenUp: boolean; status: LabEngineStatus }) {
  if (!(lost || givenUp || status === 'error')) return null
  return (
    <div className="lab-fallback" role="status">
      {givenUp ? (
        <p>The 3D view stopped twice, so it stays off for this visit. The controls and readouts still work.</p>
      ) : status === 'error' ? (
        <p>The 3D view could not start here. The controls and readouts still work.</p>
      ) : (
        <p>
          The 3D view stopped (the graphics context was lost).{' '}
          <button type="button" onClick={restartLab}>
            Restart 3D
          </button>
        </p>
      )}
    </div>
  )
}

/** A DOM label placed by projection: a physics point seen through view `view`, or a named scene anchor. */
export interface LabLabel {
  key: string
  /** The view it belongs to (its projection camera, and the rect it stays inside). */
  view?: string
  /** Physics point; null hides the label. */
  at?: V3 | null
  /** A scene anchor name instead of a point (e.g. the gauge's a₀ mark). */
  anchor?: string
  /** Offset in CSS px after centring. */
  dx?: number
  dy?: number
  /** Placement order, lower first (default 3): a later label that would overlap an earlier one moves or hides. */
  priority?: number
  /**
   * A label that must stay by its object (the gauge's name): it is kept inside its view and slides along this
   * direction (screen px, e.g. [0, 1] = down) by up to 42 px before the ordinary offsets are tried.
   */
  slide?: readonly [number, number]
}

interface LabelCache {
  /** Projected anchor (stage px) of each label from the last frame, null = behind the camera or no anchor. */
  pts: Map<string, [number, number] | null>
  size: Map<string, [number, number]>
  reserved: LabelRect[]
  views: Map<string, LabelRect>
  box: LabelRect | null
  dirty: boolean
  frame: number
}

/**
 * Place labels after every frame, with an avoidance pass (P review items 3 and 12): labels go in priority order; each
 * tries its anchor, then the lecture pass's nearby offsets (stage/labelLayout.ts `placeItem`: up / right / down /
 * left at 22 and 38 px, two diagonals), and takes the first spot that stays inside its view and clear of the
 * passports, every readout line, the caption and the labels already placed; with no free spot it hides
 * (`data-hidden="1"`). Layout reads (sizes, furniture) happen only after a change (labels, a resize, fonts), and every
 * 20 frames while the scene draws; a change re-places at once from the last frame's projections.
 * Returns a ref callback per label key.
 */
export function useProjectedLabels(handle: LabHandle | null, labels: readonly LabLabel[], host: RefObject<HTMLElement | null>) {
  const list = useRef(labels)
  list.current = labels
  const els = useRef(new Map<string, HTMLElement>())
  const cache = useRef<LabelCache>({ pts: new Map(), size: new Map(), reserved: [], views: new Map(), box: null, dirty: true, frame: 0 })
  const ro = useRef<ResizeObserver | null>(null)

  const place = useCallback(() => {
    const c = cache.current
    const root = host.current
    if (root && c.dirty) {
      // one layout read for everything: the stage box, the views, the furniture and every label's size
      const b = root.getBoundingClientRect()
      c.box = [0, 0, b.width, b.height]
      c.reserved = rectsIn(root, LAB_RESERVED_SELECTOR).map((r) => r.rect)
      c.views = new Map(rectsIn(root, LAB_VIEW_SELECTOR).map((r) => [r.el.dataset.view ?? '', r.rect]))
      for (const [key, el] of els.current) c.size.set(key, [el.offsetWidth, el.offsetHeight])
      c.dirty = false
    }
    const order = [...list.current].sort((a, b) => (a.priority ?? 3) - (b.priority ?? 3))
    const placed: LabelRect[] = []
    for (const l of order) {
      const el = els.current.get(l.key)
      if (!el) continue
      const p = c.pts.get(l.key) ?? null
      let spot: { x: number; y: number; ox: number; oy: number } | null = null
      if (p) {
        const [w, h] = c.size.get(l.key) ?? [el.offsetWidth, el.offsetHeight]
        const v = (l.view ? c.views.get(l.view) : undefined) ?? c.box
        const safe: LabelRect = v ? [v[0] + LABEL_EDGE, v[1] + LABEL_EDGE, v[2] - 2 * LABEL_EDGE, v[3] - 2 * LABEL_EDGE] : [-1e6, -1e6, 2e6, 2e6]
        spot = placeItem(p[0] + (l.dx ?? 0), p[1] + (l.dy ?? 0), w, h, l.slide ? { fixed: true, slide: l.slide } : {}, safe, c.reserved, [], placed)
      }
      if (!spot) {
        if (el.dataset.hidden !== '1') {
          el.dataset.hidden = '1'
          el.style.opacity = '0'
        }
        continue
      }
      if (el.dataset.hidden !== '0') {
        el.dataset.hidden = '0'
        el.style.opacity = '1'
      }
      el.style.transform = `translate(${(spot.x + spot.ox).toFixed(1)}px, ${(spot.y + spot.oy).toFixed(1)}px) translate(-50%, -50%)`
    }
  }, [host])

  // new labels (texts, anchors, the readouts beside them): re-measure and re-place from the last projections
  useEffect(() => {
    cache.current.dirty = true
    place()
  }, [labels, place])

  // any size change of a label, the furniture or the stage (fonts arriving, a readout growing, a resize)
  useLayoutEffect(() => {
    if (typeof ResizeObserver === 'undefined') return
    const obs = new ResizeObserver(() => {
      cache.current.dirty = true
      place()
    })
    ro.current = obs
    for (const el of els.current.values()) obs.observe(el)
    return () => {
      obs.disconnect()
      ro.current = null
    }
  }, [place])
  // the furniture changes with every render (readout lines come and go): observe what is there now
  useLayoutEffect(() => {
    const root = host.current
    if (!root || !ro.current) return
    ro.current.observe(root)
    root.querySelectorAll(LAB_RESERVED_SELECTOR).forEach((el) => ro.current!.observe(el))
  })

  useEffect(
    () =>
      handle?.onRender((project, anchor) => {
        const c = cache.current
        for (const l of list.current) c.pts.set(l.key, l.anchor ? anchor(l.anchor) : l.at ? project(l.at, l.view) : null)
        if (c.frame++ % 20 === 0) c.dirty = true
        place()
      }),
    [handle, place],
  )
  return useCallback(
    (key: string) => (el: HTMLElement | null) => {
      const old = els.current.get(key)
      if (old && old !== el) ro.current?.unobserve(old)
      if (el) {
        els.current.set(key, el)
        ro.current?.observe(el)
      } else els.current.delete(key)
    },
    [],
  )
}

/** A view's passport: title and honesty note; a click opens the bench's fidelity note (the lecture drawer). */
export function LabPassport({ passport, kind, view, fidelity }: { passport: Passport; kind: StageKind; view: string; fidelity: Fidelity }) {
  const [anchor, setAnchor] = useState<HTMLElement | null>(null)
  const close = useCallback(() => setAnchor(null), [])
  return (
    <>
      <button
        type="button"
        className="stage-passport lab-view-passport"
        data-slot={view}
        data-kind={kind}
        aria-expanded={!!anchor}
        aria-haspopup="dialog"
        title="What this picture gets right and wrong"
        onClick={(e) => {
          const el = e.currentTarget
          setAnchor((a) => (a ? null : el))
        }}
      >
        <span className="passport-title">
          <Rich as="span" text={passport.title} />
        </span>
        <span className="passport-note">{passport.note}</span>
      </button>
      {anchor && (
        <FidelityDrawer fidelityKey={passport.fidelityKey as FidelityKey} kind={kind} title={passport.title} highlight={[]} anchor={anchor} onClose={close} fidelity={fidelity} />
      )}
    </>
  )
}

/** Two-view split for a stage box: left/right when it is clearly wider than tall, else top/bottom. */
export function useSplit(ref: RefObject<HTMLElement | null>, onSplit: (s: 'lr' | 'tb') => void, ratio = 1.1): void {
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const apply = () => {
      const r = el.getBoundingClientRect()
      if (r.width > 0 && r.height > 0) onSplit(r.width / r.height >= ratio ? 'lr' : 'tb')
    }
    apply()
    const ro = new ResizeObserver(apply)
    ro.observe(el)
    return () => ro.disconnect()
  }, [ref, onSplit, ratio])
}
