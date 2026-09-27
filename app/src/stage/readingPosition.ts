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
import { useEffect, useLayoutEffect, useRef } from 'react'
import { onStoryRefreshed, scheduleStoryRefresh } from './useStoryScroll'

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

/** How long a restore keeps re-applying itself as late layout settles (unless the reader moves first). */
export const SETTLE_MS = 1500
/** A live story that never refreshes (nothing moved) must not hold the restore back longer than this. */
const REFRESH_WAIT_MS = 700

/**
 * Restore `pos` once the page can hold it: after the next story refresh (live story) or at once (static), then again
 * after each refresh and `document.fonts.ready` within SETTLE_MS, unless the reader scrolls, taps or presses a key in
 * the meantime. `done(ok)` runs once, after the first attempt. Returns a cancel function.
 */
export function restoreWhenSettled(pos: ReadingPos, opts: { live: boolean; done?: (ok: boolean) => void }): () => void {
  let alive = true
  let reported = false
  const offs: (() => void)[] = []
  const stop = () => {
    alive = false
    offs.splice(0).forEach((f) => f())
  }
  const apply = () => {
    if (!alive) return
    const ok = restoreReadingPosition(pos)
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
    return () => {
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
    settle.current = restoreWhenSettled(pos, { live })
  }, [swap, live])
  return { current: () => current.current }
}
