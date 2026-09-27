/**
 * The lab's store (W-lab §2). Babylon-free and three-free: the DOM controls, the GUI affordances (through
 * `LabHandle.onGui`) and `window.__lab` all write through these actions, and the page derives the view from the
 * engine (`frameView`). The canvas never owns state.
 *
 * Context loss (mirrors the lecture host, stage/StageHost.tsx ContextGuard): a loss shows the DOM fallback; a
 * restore (or "Restart 3D") bumps `epoch`, which remounts the engine on a fresh canvas; a second loss within
 * 60 s keeps the static page for the session.
 */
import { useSyncExternalStore } from 'react'
import { PHI_STEP, wrapDeg } from './frameBench'

export interface LabState {
  /** Frame check: the turn about z, in whole degrees [0, 360). */
  phi: number
  /** The Babylon context was lost (the page shows the static fallback). */
  lost: boolean
  /** A second loss within LOSS_WINDOW_MS: static for the rest of the session. */
  givenUp: boolean
  /** Bumped to remount the engine (restore, Restart 3D). */
  epoch: number
}

export const LOSS_WINDOW_MS = 60_000

const INITIAL: LabState = { phi: 0, lost: false, givenUp: false, epoch: 0 }
let state: LabState = INITIAL
const subs = new Set<() => void>()
const set = (patch: Partial<LabState>) => {
  const next = { ...state, ...patch }
  if ((Object.keys(patch) as (keyof LabState)[]).every((k) => next[k] === state[k])) return
  state = next
  subs.forEach((fn) => fn())
}

export const getLab = (): LabState => state

export function useLab(): LabState {
  return useSyncExternalStore(
    (fn) => {
      subs.add(fn)
      return () => subs.delete(fn)
    },
    getLab,
    () => INITIAL,
  )
}

export const setPhi = (deg: number): void => set({ phi: wrapDeg(deg) })
export const stepPhi = (dir: 1 | -1): void => set({ phi: wrapDeg(state.phi + dir * PHI_STEP) })
export const resetFrame = (): void => set({ phi: 0 })

const losses: number[] = []
/** webglcontextlost on the lab canvas: fallback now; a second loss within the window gives up. */
export function labContextLost(now = Date.now()): void {
  losses.push(now)
  const recent = losses.filter((t) => now - t < LOSS_WINDOW_MS).length
  set({ lost: true, givenUp: state.givenUp || recent >= 2 })
}
/** webglcontextrestored or "Restart 3D": remount on a fresh canvas (not after giving up). */
export function restartLab(): void {
  if (state.givenUp) return
  set({ lost: false, epoch: state.epoch + 1 })
}

/** Tests only: back to the initial state. */
export function _resetLabStore(): void {
  losses.length = 0
  state = INITIAL
  subs.forEach((fn) => fn())
}
