/**
 * The reader's own motion choice (topbar toggle, Phase 4a). Precedence in `prefersReducedMotion()` (stage/store):
 * `?motion=reduce` (tests, links) → this choice → the OS setting. A per-viewer convenience kept in localStorage;
 * every access is guarded, and the app behaves exactly as before when storage is blocked or empty.
 */
import { useSyncExternalStore } from 'react'

export const MOTION_KEY = 'spinlab.motion.v1'
/** 'full' / 'reduce' = the reader chose; null = follow the OS */
export type MotionChoice = 'full' | 'reduce' | null

function read(): MotionChoice {
  try {
    const v = globalThis.localStorage?.getItem(MOTION_KEY)
    return v === 'full' || v === 'reduce' ? v : null
  } catch {
    return null
  }
}

let choice: MotionChoice = read()
const subs = new Set<() => void>()

export const getMotionChoice = (): MotionChoice => choice

export function setMotionChoice(next: MotionChoice): void {
  choice = next
  try {
    if (next) localStorage.setItem(MOTION_KEY, next)
    else localStorage.removeItem(MOTION_KEY)
  } catch {
    /* storage blocked: the choice still holds for this visit */
  }
  subs.forEach((fn) => fn())
}

const subscribe = (fn: () => void) => {
  subs.add(fn)
  return () => subs.delete(fn)
}
export const useMotionChoice = (): MotionChoice => useSyncExternalStore(subscribe, getMotionChoice, () => null)
