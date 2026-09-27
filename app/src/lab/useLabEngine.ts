/**
 * The Babylon engine's lifecycle for the lab page (W-lab §2, decisions/lab.md #6). Babylon-free at module level:
 * the only way to Babylon is the dynamic `import('./babylon/mountLab')` below (the lab gate of the chunk contract).
 *
 * Each effect run (StrictMode runs it twice in DEV):
 *   - creates a NEW <canvas> inside `host` (after WEBGL_lose_context the same canvas would hand back the dead
 *     context, so a second mount on it would draw nothing);
 *   - imports and mounts behind an `aborted` flag (a fast unmount never leaves an engine behind);
 *   - on cleanup disposes the engine (which releases its WebGL context: loseContextOnDispose) and removes the canvas.
 * `enabled` false (< 900 px, no WebGL, context given up) means the import never happens: no Babylon bytes.
 */
import { useEffect, useState, type RefObject } from 'react'
import type { LabHandle } from './handle'
import { labFrameDrawn, labMounted, labTrip } from './instrument'
import { labContextLost, restartLab } from './labStore'

export type LabEngineStatus = 'off' | 'loading' | 'ready' | 'error'

export function useLabEngine(host: RefObject<HTMLDivElement | null>, enabled: boolean, epoch: number, motion: boolean): { handle: LabHandle | null; status: LabEngineStatus } {
  const [handle, setHandle] = useState<LabHandle | null>(null)
  const [status, setStatus] = useState<LabEngineStatus>('off')

  useEffect(() => {
    const el = host.current
    if (!enabled || !el) return
    let aborted = false
    let h: LabHandle | null = null
    const canvas = document.createElement('canvas')
    canvas.className = 'lab-canvas'
    canvas.tabIndex = 0
    canvas.setAttribute('role', 'img')
    canvas.setAttribute('aria-label', 'Bloch sphere: the x, y and z axes and one state. The readouts beside it give the numbers.')
    el.prepend(canvas)
    setStatus('loading')
    import('./babylon/mountLab')
      .then(({ mountLab }) => {
        if (aborted) return
        h = mountLab(canvas, {
          motion,
          onContextLost: () => labContextLost(),
          onContextRestored: () => restartLab(),
          hooks: { frame: labFrameDrawn, mounted: labMounted, trip: labTrip },
        })
        setHandle(h)
        setStatus('ready')
      })
      .catch((err: unknown) => {
        if (aborted) return
        console.error('[lab] the 3D view failed to start', err)
        setStatus('error')
      })
    return () => {
      aborted = true
      h?.dispose()
      canvas.remove()
      setHandle(null)
      setStatus('off')
    }
    // `motion` is applied live through handle.setMotion; only a new epoch or enablement remounts
  }, [host, enabled, epoch])

  useEffect(() => {
    handle?.setMotion(motion)
  }, [handle, motion])

  return { handle, status }
}
