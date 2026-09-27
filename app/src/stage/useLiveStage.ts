/**
 * Which story version a page shows (W-L1 §2.9). THREE-FREE: lives in the main chunk.
 *   live   — the pinned 3D stage on the ONE shared canvas: viewport ≥ 900 px, WebGL present, context alive
 *   static — StaticStory (reading column + 2D widgets): < 900 px, no WebGL, a lost context, or SSR/tests
 * Crossing 900 px swaps versions live (LecturePage keeps the reading position on the current beat).
 */
import { useEffect, useSyncExternalStore } from 'react'
import { KIND_RENDER, type StageKind } from '../content/stage'
import { prefersReducedMotion, setMotion, useStageFlag } from './store'
import { useMotionChoice } from '../ui/motionPref'
import { useReadMode } from '../ui/readModePref'

/** The live stage needs at least this viewport width (PLAN "Devices": laptop only). */
export const WIDE_QUERY = '(min-width: 900px)'
const REDUCED_QUERY = '(prefers-reduced-motion: reduce)'

/** A media query as React state (server snapshot `server`, so SSR renders the static version). */
export function useMedia(query: string, server = false): boolean {
  return useSyncExternalStore(
    (fn) => {
      if (typeof matchMedia === 'undefined') return () => {}
      const m = matchMedia(query)
      m.addEventListener('change', fn)
      return () => m.removeEventListener('change', fn)
    },
    () => typeof matchMedia !== 'undefined' && matchMedia(query).matches,
    () => server,
  )
}

/** Cheap capability probe: never creates a context (creation failures go through the stage-host boundary). */
export function webglAvailable(): boolean {
  return typeof window !== 'undefined' && (typeof WebGL2RenderingContext !== 'undefined' || typeof WebGLRenderingContext !== 'undefined')
}

/**
 * Does a story with these kinds need WebGL? Any WebGL kind does; a story whose kinds are all SVG (content/stage.ts
 * KIND_RENDER) draws in the DOM and does not. No kinds given (or none) ⇒ the old rule: WebGL is needed.
 */
export const needsWebgl = (kinds?: readonly StageKind[]): boolean => !kinds || kinds.length === 0 || kinds.some((k) => KIND_RENDER[k] === 'gl')

/** The live stage is possible here (wide screen, WebGL and a live context when a kind needs them) — the reader may still choose Read mode. */
export function useLiveCapable(kinds?: readonly StageKind[]): boolean {
  const wide = useMedia(WIDE_QUERY)
  const lost = useStageFlag('contextLost')
  return wide && (!needsWebgl(kinds) || (webglAvailable() && !lost))
}

/** true ⇒ render the live story; false ⇒ StaticStory (also when the reader chose Read mode). Always false during SSR. */
export function useLiveStage(kinds?: readonly StageKind[]): boolean {
  const capable = useLiveCapable(kinds)
  const readMode = useReadMode()
  return capable && !readMode
}

/** Keep `stage.motion` in sync with the OS setting, the reader's topbar choice and `?motion=reduce` (decision #18), live. */
export function useMotionSync(): void {
  const reduced = useMedia(REDUCED_QUERY)
  const choice = useMotionChoice()
  useEffect(() => {
    const motion = !prefersReducedMotion()
    setMotion(motion)
    // CSS reads the same flag (lecture title words, chapter cards): <html data-motion="on|off">
    if (typeof document !== 'undefined') document.documentElement.dataset.motion = motion ? 'on' : 'off'
  }, [reduced, choice])
}
