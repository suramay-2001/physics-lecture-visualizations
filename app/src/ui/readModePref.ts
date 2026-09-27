/**
 * The reader's Read-mode choice (Phase 4a item 4): the plain reading column (StaticStory) instead of the pinned
 * 3D stage, on any screen. A per-viewer convenience in localStorage (every access guarded; blocked storage just
 * means the choice lasts for this visit). `useLiveStage()` reads it, so the lecture page and every StoryStage agree.
 */
import { useSyncExternalStore } from 'react'

export const READ_MODE_KEY = 'spinlab.readmode.v1'

function read(): boolean {
  try {
    return globalThis.localStorage?.getItem(READ_MODE_KEY) === 'read'
  } catch {
    return false
  }
}

let readMode = read()
const subs = new Set<() => void>()

export const getReadMode = (): boolean => readMode

export function setReadMode(on: boolean): void {
  readMode = on
  try {
    if (on) localStorage.setItem(READ_MODE_KEY, 'read')
    else localStorage.removeItem(READ_MODE_KEY)
  } catch {
    /* storage blocked: the choice still holds for this visit */
  }
  subs.forEach((fn) => fn())
}

const subscribe = (fn: () => void) => {
  subs.add(fn)
  return () => subs.delete(fn)
}
export const useReadMode = (): boolean => useSyncExternalStore(subscribe, getReadMode, () => false)
