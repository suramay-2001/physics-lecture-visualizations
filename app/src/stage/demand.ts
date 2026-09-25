/**
 * Stage-host demand flag (W-L1 §2.1). THREE-FREE and store-free, so it lives in the main chunk: a page
 * that needs the 3D stage calls `requestStageHost()`, and App mounts the lazy `<StageHost/>` (one Canvas
 * for the whole session, never re-created on route changes). Non-lecture routes never download three.js.
 */
import { useSyncExternalStore } from 'react'

let requested = false
const listeners = new Set<() => void>()

/** Idempotent: the first call mounts the host; it then persists for the session. */
export function requestStageHost(): void {
  if (requested) return
  requested = true
  listeners.forEach((fn) => fn())
}

export function isStageHostRequested(): boolean {
  return requested
}

export function useStageHostRequested(): boolean {
  return useSyncExternalStore(
    (fn) => {
      listeners.add(fn)
      return () => listeners.delete(fn)
    },
    () => requested,
    () => false,
  )
}
