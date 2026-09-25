/**
 * Which story version a page shows (W-L1 §2.9). THREE-FREE: lives in the main chunk.
 *   live   — the pinned 3D stage on the ONE shared canvas: viewport ≥ 900 px, WebGL present, context alive
 *   static — StaticStory (reading column + 2D widgets): < 900 px, no WebGL, a lost context, or SSR/tests
 * Crossing 900 px swaps versions live (LecturePage keeps the reading position on the current beat).
 */
import { useEffect, useSyncExternalStore } from 'react'
import { prefersReducedMotion, setMotion, useStageFlag } from './store'

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

/** true ⇒ render the live 3D story; false ⇒ StaticStory. Always false during SSR (content test). */
export function useLiveStage(): boolean {
  const wide = useMedia(WIDE_QUERY)
  const lost = useStageFlag('contextLost')
  return wide && webglAvailable() && !lost
}

/** Keep `stage.motion` in sync with the OS setting and `?motion=reduce` (decision #18), live. */
export function useMotionSync(): void {
  const reduced = useMedia(REDUCED_QUERY)
  useEffect(() => {
    setMotion(!(reduced || prefersReducedMotion()))
  }, [reduced])
}
