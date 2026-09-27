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
import type { LabBenchId, LabHandle } from './handle'
import { labFrameDrawn, labMounted, labTrip } from './instrument'
import { labContextLost, restartLab } from './labStore'

export type LabEngineStatus = 'off' | 'loading' | 'ready' | 'error'

/** The canvas's accessible name per bench (the readouts beside it carry the numbers). */
const CANVAS_LABEL: Record<LabBenchId, string> = {
  frame: 'Bloch sphere: the x, y and z axes and one state. The readouts beside it give the numbers.',
  operator:
    'Two linked 3D views: operator space with the arrow a and its eigen-axis, and the Bloch sphere with the start state, its orbit and the bead. The panel and the readouts give the numbers.',
  grapher:
    'A 3D graph of your expressions: a surface or a curve in a fitted box, or a path on the Bloch sphere, with a cursor. The panel and the readouts give the numbers.',
  sg: 'A Stern–Gerlach bench in 3D: the source, a chain of magnets with their stops, and the plate, with an inset of the plate seen along the beam. The panel and the readouts give the numbers.',
}

export function useLabEngine(
  host: RefObject<HTMLDivElement | null>,
  enabled: boolean,
  epoch: number,
  motion: boolean,
  bench: LabBenchId = 'frame',
): { handle: LabHandle | null; status: LabEngineStatus } {
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
    canvas.setAttribute('aria-label', CANVAS_LABEL[bench])
    el.prepend(canvas)
    setStatus('loading')
    import('./babylon/mountLab')
      .then(({ mountLab }) => {
        if (aborted) return
        h = mountLab(canvas, {
          bench,
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
    // `motion` is applied live through handle.setMotion; only a new epoch, bench or enablement remounts
  }, [host, enabled, epoch, bench])

  useEffect(() => {
    handle?.setMotion(motion)
  }, [handle, motion])

  return { handle, status }
}
