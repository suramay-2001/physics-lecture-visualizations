/**
 * The reader's "Explain notation" choice (notation explainers, decisions/notation-explainers.md). ON by default; the
 * topbar toggle turns it off. A per-viewer convenience in localStorage like the track and Read-mode choices
 * (`spinlab.notation.v1`: only the OFF choice is stored; every access is guarded, and blocked storage just means the
 * choice lasts for this visit).
 *
 * Also the loader for the pre-processor. ui/notationMark.ts is not part of the first paint: the first `<Tex>` that
 * is rendered with the choice ON asks for it, TeX is typeset plain until it arrives, then every `<Tex>` re-renders
 * with its marks (the marks add no size, so nothing moves). `<Tex>` renders only once KaTeX is in (ui/texLoader.ts), so the
 * pre-processor is requested behind it. Nothing else about notation lives in the entry chunk but this file, the toggle, the
 * one listener (components/NotationHost.tsx) and the vocabulary of a mark; the trusted-renderer check (ui/tex.ts) rides with
 * KaTeX.
 */
import { createContext, useEffect, useState, useSyncExternalStore } from 'react'

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

/**
 * The listener (components/NotationRuntime.tsx, lazy) has attached its handlers. A mark appears only once it has: with KaTeX,
 * the lecture and the pre-processor all arriving at once, the first formulas can be typeset before the listener is mounted, and a
 * mark that looks explained but ignores the pointer is worse than no mark yet.
 */
let runtimeUp = false
export function setNotationRuntimeUp(up: boolean): void {
  if (runtimeUp === up) return
  runtimeUp = up
  markerSubs.forEach((fn) => fn())
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

/** The pre-processor once it has loaded, the listener is up and the choice is ON, else null (render the TeX as written). */
export function useNotationMarker(): Marker | null {
  const enabled = useNotationOn()
  const m = useSyncExternalStore(subscribeMarker, () => (runtimeUp ? marker : null), () => null)
  useEffect(() => {
    if (enabled) loadMarker()
  }, [enabled])
  return enabled ? m : null
}

/** A page never waits longer than this for the explainers (an explainer chunk that fails to load leaves the maths plain). */
export const NOTATION_GRACE_MS = 3000

/**
 * For a page that is about to typeset a lot of maths (LecturePage): true once the marks can be there at its first paint, i.e.
 * "Explain notation" is off, or the pre-processor has loaded and the listener is up; and in any case after NOTATION_GRACE_MS.
 * The page then shows its maths marked from the start: nothing is typeset plain and re-typeset, so the layout is final when the
 * page appears (a late change of a few pixels would refresh every scroll trigger and cancel a reader's smooth scroll in flight).
 */
export function useNotationReady(): boolean {
  const enabled = useNotationOn()
  const m = useSyncExternalStore(subscribeMarker, () => (runtimeUp ? marker : null), () => null)
  const [gaveUp, setGaveUp] = useState(false)
  useEffect(() => {
    if (!enabled || m) return
    loadMarker()
    const t = setTimeout(() => setGaveUp(true), NOTATION_GRACE_MS)
    return () => clearTimeout(t)
  }, [enabled, m])
  return !enabled || m !== null || gaveUp
}

/**
 * What a `<Tex>` below this point may do about notation. `off`: leave it unmarked (the glossary popovers and the
 * notation cards themselves). `gates`: Physics 709 pages, where a bare X, Y, Z, H in a gate formula is the gate
 * (LecturePage provides it from the course). `bits` and `sets`: what the chapter's own text says about the `·` between bit
 * strings, about capital letters that are sets, and about whether S is the spin (content/notationVocab.ts; LecturePage provides
 * them from the chapter).
 */
export interface NotationScope {
  off?: boolean
  gates?: boolean
  bits?: boolean
  sets?: ReadonlySet<string>
  spin?: boolean
}
export const NotationScopeContext = createContext<NotationScope>({})
