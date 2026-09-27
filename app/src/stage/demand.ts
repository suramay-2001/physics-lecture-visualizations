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

/*
 * Pause (decisions/lab.md #6): while the Babylon /lab is open the host stays mounted (its context stays alive, so a
 * lecture resumes without a remount) but draws 0 frames: StageHost switches r3f's frameloop to 'never', which
 * ignores invalidate() too (a hidden 'demand' loop still renders on resize). Ref-counted for StrictMode.
 */
let pauses = 0
const pauseListeners = new Set<() => void>()

/** Pause the host's frame loop; returns the matching resume. */
export function pauseStageHost(): () => void {
  pauses++
  pauseListeners.forEach((fn) => fn())
  let done = false
  return () => {
    if (done) return
    done = true
    pauses--
    pauseListeners.forEach((fn) => fn())
  }
}

export const isStageHostPaused = (): boolean => pauses > 0

export function useStageHostPaused(): boolean {
  return useSyncExternalStore(
    (fn) => {
      pauseListeners.add(fn)
      return () => pauseListeners.delete(fn)
    },
    isStageHostPaused,
    () => false,
  )
}
