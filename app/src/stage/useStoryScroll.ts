/**
 * Scroll → beat position (W-L1 §2.2). ONE ScrollTrigger per unit (`id: 'story:<unitId>'`) on the beats
 * column, `start: 'top center'`, `end: 'bottom center'`, no pin (the stage box is CSS sticky), no scrub tween.
 *
 *   uRaw = k + (centre − top_k) / height_k    k = the beat article under the viewport centre line
 *
 * Article extents are cached on ScrollTrigger refresh, so `onUpdate` reads no layout. A centre inside the gap
 * after article k gives k + 0.999; past the last article, n. Beat changes are therefore tied to the text
 * actually reaching the centre, whatever the article heights (the gate's floor(p·n) assumed equal heights).
 * `u` is uRaw smoothed by gsap.quickTo (0.6 s, power3.out); under reduced motion u = uRaw (decision #18).
 * Everything is written through `setScroll(track, uRaw, u)`; React hears only beat changes.
 *
 * Hygiene: a gsap.context scoped to the lecture root kills the trigger and the tween on unmount / dependency
 * change, so the `story:*` count returns to baseline across route round-trips and StrictMode remounts.
 *
 * THE ENTRY'S HALF. GSAP and ScrollTrigger (~116 KB raw / 45 KB gzip) are not in the first paint: this module holds the
 * constants, the pure mapping (`beatPosition`) and the loader of the lazy half (stage/storyScrollGsap.ts, build/chunks.test.ts
 * rule (p)). A lecture whose story runs live loads it with the page (pages/LecturePage.tsx waits for it, as it waits for the
 * SVG kinds, so the triggers exist when the story first shows); `scheduleStoryRefresh` does nothing until it has arrived
 * (there is no trigger to refresh), and `onStoryRefreshed` then listens from the first refresh on.
 */
import { useEffect, useLayoutEffect, useState, type RefObject } from 'react'
import type { ScrollTrigger } from 'gsap/ScrollTrigger' // a type: nothing of GSAP is imported here
import { useStageFlag, type UnitTrack } from './store'

export const SMOOTH_SECONDS = 0.6
export const STORY_TRIGGER_PREFIX = 'story:'
/** Beat articles carry this attribute (their index); the scroll mapping reads only these elements. */
export const BEAT_ATTR = 'data-beat-index'

/**
 * Pure: beat position of a centre line (document px) given the articles' document tops and heights.
 * Before the first article → 0; inside article k → k + fraction; in the gap after k → k + 0.999; past the last → n.
 */
export function beatPosition(centre: number, tops: readonly number[], heights: readonly number[]): number {
  const n = tops.length
  if (!n || centre < tops[0]) return 0
  for (let k = n - 1; k >= 0; k--) {
    if (centre < tops[k]) continue
    const f = (centre - tops[k]) / Math.max(1, heights[k])
    if (f < 1) return k + f
    return k === n - 1 ? n : k + 0.999
  }
  return 0
}

/** What the lazy half (stage/storyScrollGsap.ts) hands the entry: GSAP's ScrollTrigger and the per-unit attachment. */
export interface StoryRuntime {
  ScrollTrigger: typeof ScrollTrigger
  /** One unit's trigger and smoothing on the lecture root; the returned function reverts them. */
  attach: (root: HTMLElement, track: UnitTrack, motion: boolean) => () => void
}

let runtime: StoryRuntime | null = null
let loading: Promise<StoryRuntime> | null = null
/** Callers that wait for the runtime (a listener that can only attach to ScrollTrigger once it exists). */
const arrivals: (() => void)[] = []
let refreshOnArrival = false

/** The runtime once its chunk has loaded, else null. */
export const storyRuntime = (): StoryRuntime | null => runtime

/** Load the lazy half once per session (a failed chunk may load on the next attempt). */
export function loadStoryRuntime(): Promise<StoryRuntime> {
  loading ??= import('./storyScrollGsap').then(
    (m) => {
      runtime = m.runtime
      arrivals.splice(0).forEach((f) => f())
      if (refreshOnArrival) {
        refreshOnArrival = false
        scheduleStoryRefresh()
      }
      return m.runtime
    },
    (e: unknown) => {
      loading = null
      throw e
    },
  )
  return loading
}

/**
 * 'ready' when the story scroll can run: `needed` is false (no live story here), or the lazy half has loaded. `early` starts
 * the load without waiting for it (the lecture's chunk is still on its way, and a wide screen is likely to run live);
 * 'failed' offers `retry`. LecturePage uses this next to `useSvgKinds`: it keeps the loading page up until both are ready.
 */
export function useStoryRuntimeReady(needed: boolean, early = false): { status: 'ready' | 'loading' | 'failed'; retry: () => void } {
  const [state, setState] = useState<'loading' | 'ready' | 'failed'>(runtime ? 'ready' : 'loading')
  const [attempt, setAttempt] = useState(0)
  useEffect(() => {
    if (runtime || !(needed || early)) return
    let alive = true
    loadStoryRuntime().then(
      () => alive && setState('ready'),
      () => alive && needed && setState('failed'),
    )
    return () => {
      alive = false
    }
  }, [needed, early, attempt])
  const ready = !needed || runtime !== null
  return {
    status: ready ? 'ready' : state === 'failed' ? 'failed' : 'loading',
    retry: () => (setState('loading'), setAttempt((a) => a + 1)),
  }
}

/* One debounced ScrollTrigger.refresh for the whole page (late KaTeX/font layout moves trigger positions). */
let refreshRaf = 0
export function scheduleStoryRefresh(): void {
  if (typeof requestAnimationFrame === 'undefined') return
  if (!runtime) {
    refreshOnArrival = true // no trigger yet, so nothing to refresh; the first trigger will measure the page when it is made
    return
  }
  cancelAnimationFrame(refreshRaf)
  refreshRaf = requestAnimationFrame(() => runtime?.ScrollTrigger.refresh())
}

/**
 * Run `cb` once, after the next ScrollTrigger refresh of the page (every story trigger has re-measured its beats).
 * A restore of the reading position waits for this (stage/readingPosition.ts): before the first refresh after a
 * lecture chunk loads, beat positions are still moving. Returns an unsubscribe function (safe to call twice).
 * Before the lazy half has arrived it listens from the moment it does.
 */
export function onStoryRefreshed(cb: () => void): () => void {
  let on = true
  // ScrollTrigger dispatches by mapping over its listener array, so removing one DURING a dispatch would skip the next
  // listener: removal is deferred to a microtask, and `on` guards against a second call in between.
  const off = () => {
    if (!on) return
    on = false
    queueMicrotask(() => runtime?.ScrollTrigger.removeEventListener('refresh', fn))
  }
  const fn = () => {
    if (!on) return
    off()
    cb()
  }
  if (runtime) runtime.ScrollTrigger.addEventListener('refresh', fn)
  else arrivals.push(() => on && runtime?.ScrollTrigger.addEventListener('refresh', fn))
  return off
}

export function useStoryScroll(root: RefObject<HTMLElement | null>, track: UnitTrack | null, enabled: boolean): void {
  const motion = useStageFlag('motion')
  // the lazy half: at once when a page has already loaded it (LecturePage waits for it), else when this story first mounts
  const [rt, setRt] = useState<StoryRuntime | null>(runtime)
  useEffect(() => {
    if (rt || !enabled) return
    let alive = true
    loadStoryRuntime().then(
      (r) => alive && setRt(r),
      () => {}, // no scroll mapping without it: the story stays on its first beat until the next visit
    )
    return () => {
      alive = false
    }
  }, [rt, enabled])

  // a layout effect, like the useGSAP it replaces: the trigger exists in the commit that shows the story
  useLayoutEffect(() => {
    const el = root.current
    if (!rt || !enabled || !track || !el) return
    return rt.attach(el, track, motion)
  }, [rt, root, enabled, motion, track])

  // Refresh on late layout: the unit's own height changes (KaTeX, fonts, reveals, widgets) and fonts.ready.
  useEffect(() => {
    const el = root.current
    if (!enabled || !el) return
    let lastH = el.offsetHeight
    const ro = new ResizeObserver(() => {
      const h = el.offsetHeight
      if (Math.abs(h - lastH) < 1) return
      lastH = h
      scheduleStoryRefresh()
    })
    ro.observe(el)
    let alive = true
    document.fonts?.ready.then(() => alive && scheduleStoryRefresh())
    return () => {
      alive = false
      ro.disconnect()
    }
  }, [root, enabled])
}
