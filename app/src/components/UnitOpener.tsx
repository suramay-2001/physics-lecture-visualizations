/**
 * A chapter-opener film before a unit (Unit.opener; user decision: the 720° belt trick opens L7 §7.2). The film is
 * lazy, so it appears after the story's scroll triggers have measured the page: its height pushes every later unit
 * down without changing their own heights. This section therefore watches its height and schedules the same
 * page-wide ScrollTrigger refresh the story units use for late KaTeX/fonts (found by a QA run: a beat after the film
 * never became active).
 */
import { lazy, Suspense, useEffect, useRef } from 'react'
import type { Unit } from '../content/schema'
import { OPENERS } from '../openers/openerCopy'
import { scheduleStoryRefresh } from '../stage/useStoryScroll'
import { Rich } from '../ui/Rich'

const OpenerScrub = lazy(() => import('../openers/OpenerScrub'))

export function UnitOpener({ opener }: { opener: NonNullable<Unit['opener']> }) {
  const ref = useRef<HTMLElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el || typeof ResizeObserver === 'undefined') return
    let lastH = el.offsetHeight
    const ro = new ResizeObserver(() => {
      const h = el.offsetHeight
      if (Math.abs(h - lastH) < 1) return
      lastH = h
      scheduleStoryRefresh()
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])
  const spec = OPENERS[opener.film]
  return (
    <section ref={ref} className="unit-opener" aria-label={spec.title}>
      <Rich text={opener.lede} className="section-lede" />
      <Suspense fallback={null}>
        <OpenerScrub spec={spec} level={3} />
      </Suspense>
    </section>
  )
}
