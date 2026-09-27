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
 * Hygiene: useGSAP context (`revertOnUpdate`) kills the trigger and the tween on unmount / dependency
 * change, so the `story:*` count returns to baseline across route round-trips and StrictMode remounts.
 */
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useEffect, type RefObject } from 'react'
import { registerScrollSnap, setScroll, useStageFlag, type UnitTrack } from './store'

gsap.registerPlugin(useGSAP, ScrollTrigger)

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

/* One debounced ScrollTrigger.refresh for the whole page (late KaTeX/font layout moves trigger positions). */
let refreshRaf = 0
export function scheduleStoryRefresh(): void {
  if (typeof requestAnimationFrame === 'undefined') return
  cancelAnimationFrame(refreshRaf)
  refreshRaf = requestAnimationFrame(() => ScrollTrigger.refresh())
}

/**
 * Run `cb` once, after the next ScrollTrigger refresh of the page (every story trigger has re-measured its beats).
 * A restore of the reading position waits for this (stage/readingPosition.ts): before the first refresh after a
 * lecture chunk loads, beat positions are still moving. Returns an unsubscribe function (safe to call twice).
 */
export function onStoryRefreshed(cb: () => void): () => void {
  let on = true
  // ScrollTrigger dispatches by mapping over its listener array, so removing one DURING a dispatch would skip the next
  // listener: removal is deferred to a microtask, and `on` guards against a second call in between.
  const off = () => {
    if (!on) return
    on = false
    queueMicrotask(() => ScrollTrigger.removeEventListener('refresh', fn))
  }
  const fn = () => {
    if (!on) return
    off()
    cb()
  }
  ScrollTrigger.addEventListener('refresh', fn)
  return off
}

export function useStoryScroll(root: RefObject<HTMLElement | null>, track: UnitTrack | null, enabled: boolean): void {
  const motion = useStageFlag('motion')

  useGSAP(
    () => {
      const el = root.current
      if (!enabled || !track || !el) return
      const col = el.querySelector<HTMLElement>('.story-beats')
      if (!col) return
      let tops: number[] = []
      let heights: number[] = []
      let vh = innerHeight
      const measure = () => {
        const y = window.scrollY
        tops = []
        heights = []
        col.querySelectorAll<HTMLElement>(`[${BEAT_ATTR}]`).forEach((a) => {
          const r = a.getBoundingClientRect()
          tops.push(r.top + y)
          heights.push(r.height)
        })
        vh = innerHeight
      }
      const proxy = { u: track.u }
      const quick = motion
        ? gsap.quickTo(proxy, 'u', { duration: SMOOTH_SECONDS, ease: 'power3.out', onUpdate: () => setScroll(track, track.uRaw, proxy.u) })
        : null
      const jump = (uRaw: number) => {
        proxy.u = uRaw
        if (quick) {
          quick(uRaw, uRaw)
          quick.tween.progress(1)
        }
        setScroll(track, uRaw, uRaw)
      }
      let first = true
      const sync = (scroll: number) => {
        const uRaw = beatPosition(scroll + vh / 2, tops, heights)
        if (!quick || first) {
          first = false
          jump(uRaw)
          return
        }
        setScroll(track, uRaw, proxy.u)
        quick(uRaw)
      }
      const st = ScrollTrigger.create({
        id: STORY_TRIGGER_PREFIX + track.unitId,
        trigger: col,
        start: 'top center',
        end: 'bottom center',
        onRefresh: (self) => {
          measure()
          sync(self.scroll())
        },
        onUpdate: (self) => sync(self.scroll()),
      })
      measure()
      sync(st.scroll())
      const off = registerScrollSnap(track.unitId, () => jump(track.uRaw))
      return () => off()
    },
    { scope: root, dependencies: [enabled, motion, track], revertOnUpdate: true },
  )

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
