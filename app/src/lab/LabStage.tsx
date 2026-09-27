/**
 * Shared pieces of a bench's stage (Babylon-free; the next benches reuse them):
 *   useLabStage(bench)       the engine for this bench (≥ 900 px with WebGL only), its handle, status and loss state
 *   <LabFallback>            the DOM fallback after a context loss or a failed start ("Restart 3D")
 *   useProjectedLabels(...)  DOM labels placed by projection after every frame (per view, or at a scene anchor)
 *   <LabPassport>            a view's passport as the fidelity button (the lecture FidelityDrawer, bench content)
 *   useSplit(ref)            'lr' on a wide stage box, 'tb' on a squarer one (for two-view benches)
 * Every word and number stays DOM (ruling 2); the canvas never formats anything.
 */
import { useCallback, useEffect, useLayoutEffect, useRef, useState, type RefObject } from 'react'
import { FidelityDrawer } from '../components/FidelityDrawer'
import type { Fidelity, FidelityKey, Passport, StageKind } from '../content/stage'
import { useStageFlag } from '../stage/store'
import { useMedia, webglAvailable, WIDE_QUERY } from '../stage/useLiveStage'
import { Rich } from '../ui/Rich'
import type { V3 } from './axes'
import type { LabBenchId, LabHandle } from './handle'
import { restartLab, useLab } from './labStore'
import { useLabEngine, type LabEngineStatus } from './useLabEngine'

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
  view?: string
  /** Physics point; null hides the label. */
  at?: V3 | null
  /** A scene anchor name instead of a point (e.g. the gauge's a₀ mark). */
  anchor?: string
  /** Offset in CSS px after centring. */
  dx?: number
  dy?: number
}

/** Place labels after every frame; returns a ref callback per label key. */
export function useProjectedLabels(handle: LabHandle | null, labels: readonly LabLabel[]) {
  const list = useRef(labels)
  list.current = labels
  const els = useRef(new Map<string, HTMLElement>())
  useEffect(
    () =>
      handle?.onRender((project, anchor) => {
        for (const l of list.current) {
          const el = els.current.get(l.key)
          if (!el) continue
          const p = l.anchor ? anchor(l.anchor) : l.at ? project(l.at, l.view) : null
          if (!p) {
            if (el.dataset.hidden !== '1') {
              el.dataset.hidden = '1'
              el.style.opacity = '0'
            }
            continue
          }
          el.dataset.hidden = '0'
          el.style.opacity = '1'
          el.style.transform = `translate(${(p[0] + (l.dx ?? 0)).toFixed(1)}px, ${(p[1] + (l.dy ?? 0)).toFixed(1)}px) translate(-50%, -50%)`
        }
      }),
    [handle],
  )
  return useCallback(
    (key: string) => (el: HTMLElement | null) => {
      if (el) els.current.set(key, el)
      else els.current.delete(key)
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
