/**
 * The reader's place in a lecture (W-709-platform §C "Reading position"): which beat is under the viewport centre line
 * and how far into it. One module serves every swap that rebuilds the page under the reader:
 *   - Story ↔ Read (crossing 900 px, a lost WebGL context, the Read toggle),
 *   - the track toggle (Ground-up ↔ Formal: the same beats, different text heights),
 *   - bridges (a 709 place is written into the URL before leaving and restored on return).
 *
 *   probeReadingPosition()    → { beat, frac } | null   the beat article under the centre line (story or static)
 *   restoreReadingPosition(p) → boolean                  scroll so that point of that beat sits on the centre line
 *   restoreWhenSettled(p, …)                             the same, once the story's scroll triggers have refreshed
 *   useKeepReadingPosition(…)                            probe on scroll, restore when the page is rebuilt
 *
 * Timing (BUILD-LOG "Hard-won platform knowledge"): lectures load asynchronously and late layout (KaTeX, fonts, the
 * opener film, reveals) moves beats after the first paint, so a restore that must survive a page load waits for the
 * FIRST story refresh after the chunk arrives (`onStoryRefreshed`, stage/useStoryScroll.ts) and re-applies itself on
 * the refreshes of the next moments, until the reader scrolls. The probe runs once per frame after a scroll.
 * DOM-only and three-free (main chunk).
 */
import { createContext, useEffect, useLayoutEffect, useRef } from 'react'
import { onStoryRefreshed, scheduleStoryRefresh } from './useStoryScroll'

/** The beat a piece of prose sits in (StoryBeat and StaticBeat provide it): a bridge link knows where it was followed. */
export const BeatContext = createContext<string | null>(null)

export interface ReadingPos {
  /** Beat id (`q3-bell:b4`). */
  beat: string
  /** 0…1: how far into that beat's article the centre line sits. */
  frac: number
}

/** Beat articles of the live story and of the static reading version (exactly one of the two exists per unit). */
export const BEAT_SELECTOR = '.story-beat[data-beat], .static-beat[data-beat]'

const clamp01 = (x: number) => (x < 0 ? 0 : x > 1 ? 1 : x)

/** The beat under the viewport centre line (or the nearest within one viewport), and the fraction at the line. */
export function probeReadingPosition(): ReadingPos | null {
  if (typeof document === 'undefined') return null
  const mid = innerHeight / 2
  let best: HTMLElement | null = null
  let bestD = Infinity
  let bestRect: DOMRect | null = null
  document.querySelectorAll<HTMLElement>(BEAT_SELECTOR).forEach((el) => {
    const r = el.getBoundingClientRect()
    if (r.height === 0 && r.width === 0) return // not laid out (display: none)
    const d = r.top <= mid && r.bottom >= mid ? 0 : Math.min(Math.abs(r.top - mid), Math.abs(r.bottom - mid))
    if (d < bestD) {
      bestD = d
      best = el
      bestRect = r
    }
  })
  if (!best || !bestRect || bestD >= innerHeight) return null
  const r: DOMRect = bestRect
  const beat = (best as HTMLElement).dataset.beat
  if (!beat) return null
  return { beat, frac: Math.round(clamp01((mid - r.top) / Math.max(1, r.height)) * 1000) / 1000 }
}

/** The beat article for an id, in whichever version (live or static) is on the page. */
export function beatElement(beat: string): HTMLElement | null {
  if (typeof document === 'undefined') return null
  for (const el of document.querySelectorAll<HTMLElement>(BEAT_SELECTOR)) if (el.dataset.beat === beat) return el
  return null
}

/** Scroll so that `frac` of the beat's article sits on the viewport centre line. False when the beat is not on the page. */
export function restoreReadingPosition(pos: ReadingPos): boolean {
  const el = beatElement(pos.beat)
  if (!el) return false
  const r = el.getBoundingClientRect()
  const top = scrollY + r.top + clamp01(pos.frac) * r.height - innerHeight / 2
  window.scrollTo({ top: Math.max(0, Math.round(top)), behavior: 'instant' })
  return true
}

const AT_FRAC_RE = /^(?:0(?:\.\d{1,3})?|1(?:\.0{1,3})?)$/
const AT_BEAT_RE = /^([a-z0-9][a-z0-9-]{0,63}):b([1-9]\d{0,2})([a-z]?)$/

/**
 * The place a URL asks for (`?at=<beat>&f=<frac>`, written by a bridge before it leaves and by the return bar's way
 * back), when the beat belongs to one of `units`. Untrusted input: closed patterns, else null. Never throws.
 */
export function placeFromSearch(search: string, units: readonly string[]): ReadingPos | null {
  if (!search.includes('at=')) return null
  let q: URLSearchParams
  try {
    q = new URLSearchParams(search)
  } catch {
    return null
  }
  const beat = q.get('at') ?? ''
  const f = q.get('f') ?? '0.5'
  const m = beat.length <= 80 ? AT_BEAT_RE.exec(beat) : null
  if (!m || !units.includes(m[1]) || !AT_FRAC_RE.test(f)) return null
  return { beat, frac: Number(f) }
}

/** Move focus to an element without scrolling it (a heading or a beat article gets tabindex -1 for this). */
export function focusQuietly(el: HTMLElement): void {
  if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex', '-1')
  el.focus({ preventScroll: true })
}

/** How long a restore keeps re-applying itself as late layout settles (unless the reader moves first). */
export const SETTLE_MS = 1500
/** A live story that never refreshes (nothing moved) must not hold the restore back longer than this. */
const REFRESH_WAIT_MS = 700

/**
 * Restore `pos` once the page can hold it: after the next story refresh (live story) or at once (static), then again
 * after each refresh and `document.fonts.ready` within SETTLE_MS, unless the reader scrolls, taps or presses a key in
 * the meantime, or anything else scrolls the page away from where the restore left it (a link, a script).
 * `anchored`: the place is already on screen (a swap restored it before paint), so a scroll from here on stops it too.
 * `done(ok)` runs once, after the first attempt. Returns a cancel function.
 */
export function restoreWhenSettled(pos: ReadingPos, opts: { live: boolean; anchored?: boolean; done?: (ok: boolean) => void }): () => void {
  let alive = true
  let reported = false
  /** Where the last restore left the page; a different scrollY means someone else scrolled since. */
  let lastTop: number | null = opts.anchored ? scrollY : null
  const offs: (() => void)[] = []
  const stop = () => {
    alive = false
    offs.splice(0).forEach((f) => f())
  }
  const apply = () => {
    if (!alive) return
    if (lastTop !== null && Math.abs(scrollY - lastTop) > 2) return stop()
    const ok = restoreReadingPosition(pos)
    lastTop = scrollY
    if (!reported) {
      reported = true
      opts.done?.(ok)
    }
  }
  // the reader moving first wins: stop re-applying
  const userMoved = () => stop()
  for (const ev of ['wheel', 'touchstart', 'keydown', 'pointerdown'] as const) {
    addEventListener(ev, userMoved, { passive: true, capture: true })
    offs.push(() => removeEventListener(ev, userMoved, { capture: true }))
  }
  const again = () => {
    if (!alive) return
    apply()
    offs.push(onStoryRefreshed(again))
  }
  if (opts.live) {
    let first = false
    const t = setTimeout(() => {
      if (!first) {
        first = true
        apply()
      }
    }, REFRESH_WAIT_MS)
    offs.push(() => clearTimeout(t))
    offs.push(
      onStoryRefreshed(() => {
        if (!alive) return
        first = true
        clearTimeout(t)
        again()
      }),
    )
    scheduleStoryRefresh()
  } else {
    requestAnimationFrame(apply)
  }
  document.fonts?.ready.then(() => requestAnimationFrame(apply))
  const end = setTimeout(stop, SETTLE_MS)
  offs.push(() => clearTimeout(end))
  return stop
}

/** Synchronous probes of every mounted useKeepReadingPosition (normally one): see flushReadingProbe. */
const flushers = new Set<() => void>()

/**
 * Read the reader's place NOW, before a swap changes the page. A control that swaps (the track or Story/Read toggle)
 * calls this in its handler, while the DOM still shows the old version. Otherwise the place is the last per-frame
 * probe, which misses a scroll made in the same frame, e.g. by focusing the control. Under load that decided,
 * frame by frame, whether the swap kept the reader's beat or the page top.
 */
export function flushReadingProbe(): void {
  flushers.forEach((f) => f())
}

/**
 * Keep the reader's place across a swap: the position is probed once per frame after a scroll, and when `swap` changes
 * (live ↔ static, or the track) the page is scrolled back to it before paint, then held there while the rebuilt page
 * settles (`restoreWhenSettled`; `live` says whether the new page runs story triggers). `current()` reads the last
 * probe (a bridge writes it into the URL before leaving).
 */
export function useKeepReadingPosition(swap: string, live: boolean): { current: () => ReadingPos | null } {
  const current = useRef<ReadingPos | null>(null)
  const prev = useRef(swap)
  const settle = useRef<(() => void) | null>(null)
  useEffect(() => {
    let raf = 0
    const probe = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        current.current = probeReadingPosition()
      })
    }
    probe()
    addEventListener('scroll', probe, { passive: true })
    const flush = () => {
      cancelAnimationFrame(raf)
      current.current = probeReadingPosition()
    }
    flushers.add(flush)
    return () => {
      flushers.delete(flush)
      cancelAnimationFrame(raf)
      removeEventListener('scroll', probe)
      settle.current?.()
    }
  }, [])
  useLayoutEffect(() => {
    if (prev.current === swap) return
    prev.current = swap
    const pos = current.current
    if (!pos || !restoreReadingPosition(pos)) return
    settle.current?.()
    settle.current = restoreWhenSettled(pos, { live, anchored: true })
  }, [swap, live])
  return { current: () => current.current }
}
