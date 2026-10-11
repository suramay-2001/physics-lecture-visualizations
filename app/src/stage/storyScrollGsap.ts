/**
 * The GSAP half of the story scroll (W-L1 §2.2): the lazy chunk. stage/useStoryScroll.ts (the entry's half) loads it with
 * the first lecture whose story runs live, so GSAP and ScrollTrigger (~116 KB raw / 45 KB gzip) are never part of the
 * first paint (build/chunks.test.ts rule (p)). It holds everything that calls GSAP: ONE ScrollTrigger per unit and the
 * `quickTo` smoothing. The mapping itself (`beatPosition`) and the constants stay in the entry's half.
 *
 * Hygiene is unchanged: the work runs inside a `gsap.context` scoped to the lecture root and the cleanup reverts it, which
 * kills the trigger and the tween, so the `story:*` count returns to baseline across route round-trips and StrictMode
 * remounts. (This is what `useGSAP` did here; it is a context created in the layout effect and reverted in its cleanup.)
 */
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { registerScrollSnap, setScroll, type UnitTrack } from './store'
import { BEAT_ATTR, beatPosition, SMOOTH_SECONDS, STORY_TRIGGER_PREFIX, type StoryRuntime } from './useStoryScroll'

gsap.registerPlugin(ScrollTrigger)

/** Attach one unit's scroll trigger to the lecture root; the returned function reverts it. */
function attach(el: HTMLElement, track: UnitTrack, motion: boolean): () => void {
  const ctx = gsap.context(() => {
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
  }, el)
  return () => ctx.revert()
}

export const runtime: StoryRuntime = { ScrollTrigger, attach }
