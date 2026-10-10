/**
 * The reader's "Explain notation" choice (notation explainers, decisions/notation-explainers.md). ON by default; the
 * topbar toggle turns it off. A per-viewer convenience in localStorage like the track and Read-mode choices
 * (`spinlab.notation.v1`: only the OFF choice is stored; every access is guarded, and blocked storage just means the
 * choice lasts for this visit).
 *
 * Also the loader for the pre-processor. ui/notationMark.ts is not part of the first paint: the first `<Tex>` that
 * is rendered with the choice ON asks for it, TeX is typeset plain until it arrives, then every `<Tex>` re-renders
 * with its marks (the marks add no size, so nothing moves). Nothing else about notation lives in the entry chunk but
 * this file, the toggle, the one listener (components/NotationHost.tsx) and the trusted-renderer check (ui/tex.ts).
 */
import { createContext, useEffect, useSyncExternalStore } from 'react'

export const NOTATION_KEY = 'spinlab.notation.v1'

function read(): boolean {
  try {
    return globalThis.localStorage?.getItem(NOTATION_KEY) !== 'off'
  } catch {
    return true
  }
}

let on = read()
const subs = new Set<() => void>()

export const getNotationOn = (): boolean => on

export function setNotationOn(next: boolean): void {
  on = next
  try {
    if (next) localStorage.removeItem(NOTATION_KEY)
    else localStorage.setItem(NOTATION_KEY, 'off')
  } catch {
    /* storage blocked: the choice still holds for this visit */
  }
  subs.forEach((fn) => fn())
}

const subscribe = (fn: () => void) => {
  subs.add(fn)
  return () => subs.delete(fn)
}
export const useNotationOn = (): boolean => useSyncExternalStore(subscribe, getNotationOn, () => true)

type Marker = (typeof import('./notationMark'))['markNotation']
let marker: Marker | null = null
let loading = false
const markerSubs = new Set<() => void>()
const subscribeMarker = (fn: () => void) => {
  markerSubs.add(fn)
  return () => markerSubs.delete(fn)
}

function loadMarker(): void {
  if (marker || loading) return
  loading = true
  import('./notationMark')
    .then((m) => {
      marker = m.markNotation
      markerSubs.forEach((fn) => fn())
    })
    .catch(() => {
      loading = false // a failed chunk may load on the next toggle; the maths stays plain
    })
}

/** The pre-processor once it has loaded and the choice is ON, else null (render the TeX as written). */
export function useNotationMarker(): Marker | null {
  const enabled = useNotationOn()
  const m = useSyncExternalStore(subscribeMarker, () => marker, () => null)
  useEffect(() => {
    if (enabled) loadMarker()
  }, [enabled])
  return enabled ? m : null
}

/**
 * What a `<Tex>` below this point may do about notation. `off`: leave it unmarked (the glossary popovers and the
 * notation cards themselves). `gates`: Physics 709 pages, where a bare X, Y, Z, H in a gate formula is the gate
 * (LecturePage provides it from the course).
 */
export interface NotationScope {
  off?: boolean
  gates?: boolean
}
export const NotationScopeContext = createContext<NotationScope>({})
