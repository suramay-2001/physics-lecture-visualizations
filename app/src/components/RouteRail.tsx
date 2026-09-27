/**
 * The lecture's beamline (Phase 4a, D-nav-story §3.2): units are stations on a silver line; a silver atom marks
 * where the reader is (the viewport centre line), gliding between stations as they read; the station they are in
 * opens into its chapter steps with the current step lit. Silver only: amber, cobalt and near-white stay physics.
 *
 * Position is read from the DOM on scroll (rAF-throttled, passive) and written to the atom imperatively; React
 * re-renders only when the unit or step changes. `[` / `]` jump to the previous / next unit (ignored while typing),
 * announced through a polite live region. The atom is aria-hidden; `aria-current="location"` marks the station.
 */
import { useEffect, useRef, useState } from 'react'
import type { Lecture } from '../content/schema'
import { RefList } from './RefList'
import { chapterSteps, stepId, whereAt, type Where } from './chapters'
import { scrollToAnchor } from './UnitView'
import { rememberPlace } from '../ui/lastPlace'

const isTyping = (t: EventTarget | null) => {
  const el = t as HTMLElement | null
  return !!el && (el.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName))
}

export function RouteRail({ lecture }: { lecture: Lecture }) {
  const rail = useRef<HTMLElement>(null)
  const atom = useRef<HTMLSpanElement>(null)
  const [where, setWhere] = useState<Where>({ unit: -1, frac: 0, step: -1, stepFrac: 0 })
  const [announce, setAnnounce] = useState('')
  const whereRef = useRef(where)
  const remeasure = useRef<() => void>(() => {})

  useEffect(() => {
    let raf = 0
    const measure = () => {
      raf = 0
      const y = window.scrollY
      const line = y + innerHeight / 2
      const units = lecture.units.map((u) => {
        const r = document.getElementById(u.id)?.getBoundingClientRect()
        return r ? { top: r.top + y, bottom: r.bottom + y } : { top: Infinity, bottom: Infinity }
      })
      const steps = lecture.units.map((u) =>
        chapterSteps(u).map((s) => {
          const r = document.getElementById(stepId(u.id, s.key))?.getBoundingClientRect()
          return r ? r.top + y : Infinity
        }),
      )
      const w = whereAt(line, units, steps)
      const prev = whereRef.current
      if (w.unit !== prev.unit || w.step !== prev.step) setWhere(w)
      whereRef.current = w
      placeAtom(w)
    }
    // The atom rides the line between the current station and the next (fixed spacing: the line never re-lays
    // out, so the atom never jumps back while the reader moves forward). That gap is split evenly into the unit's
    // steps (plus the chapter card before them); within a step it moves in proportion to that step's page share.
    const placeAtom = (w: Where) => {
      const r = rail.current
      const a = atom.current
      if (!r || !a) return
      const dots = [...r.querySelectorAll<HTMLElement>('[data-station-dot]')]
      if (!dots.length) return
      // positions relative to the atom's own containing block (.route), not the rail: the key hint sits above it
      const base = (a.parentElement ?? r).getBoundingClientRect().top
      const mid = (el: Element) => {
        const b = el.getBoundingClientRect()
        return b.top + b.height / 2 - base
      }
      let y = mid(dots[0])
      if (w.unit >= 0) {
        const end = r.querySelector<HTMLElement>('[data-route-end]')
        const from = mid(dots[w.unit])
        const to = w.unit + 1 < dots.length ? mid(dots[w.unit + 1]) : end ? end.getBoundingClientRect().top - base : from
        const parts = chapterSteps(lecture.units[w.unit]).length + 1
        y = from + ((w.step + 1 + w.stepFrac) / parts) * (to - from)
      }
      a.style.transform = `translateY(${y.toFixed(1)}px)`
    }
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(measure)
    }
    remeasure.current = onScroll
    measure()
    addEventListener('scroll', onScroll, { passive: true })
    addEventListener('resize', onScroll)
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(onScroll) : null
    ro?.observe(document.body)
    return () => {
      cancelAnimationFrame(raf)
      removeEventListener('scroll', onScroll)
      removeEventListener('resize', onScroll)
      ro?.disconnect()
    }
  }, [lecture])

  // the "In 1.x" block below the line changes height with the unit: re-place the atom after it renders
  useEffect(() => remeasure.current(), [where.unit])

  // the course switcher offers "continue at" the reader's last unit of each course (ui/lastPlace.ts)
  useEffect(() => rememberPlace(lecture.id, lecture.units[where.unit]?.id), [lecture, where.unit])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.key !== '[' && e.key !== ']') || e.metaKey || e.ctrlKey || e.altKey || isTyping(e.target)) return
      const n = lecture.units.length
      const cur = whereRef.current.unit
      // `[` at a unit's start goes to the previous unit; anywhere else inside it, back to its start
      const top = cur >= 0 ? (document.getElementById(lecture.units[cur].id)?.getBoundingClientRect().top ?? 0) : 0
      const atStart = top > -40 && top < 160
      const k = e.key === ']' ? Math.min(n - 1, cur + 1) : cur < 0 ? 0 : atStart ? Math.max(0, cur - 1) : cur
      const u = lecture.units[k]
      if (!u) return
      e.preventDefault()
      scrollToAnchor(u.id)
      setAnnounce(`Unit ${lecture.number}.${k + 1}: ${u.title}`)
    }
    addEventListener('keydown', onKey)
    return () => removeEventListener('keydown', onKey)
  }, [lecture])

  return (
    <nav ref={rail} className="unit-rail route-rail" aria-label="Units in this lecture">
      <span className="rail-keys small">
        <kbd>[</kbd> <kbd>]</kbd> previous / next unit
      </span>
      <div className="route">
        <span ref={atom} className="route-atom" aria-hidden="true" />
        <ol className="route-line">
          {lecture.units.map((u, k) => {
            const here = k === where.unit
            const state = where.unit < 0 || k > where.unit ? 'ahead' : here ? 'here' : 'past'
            return (
              <li key={u.id} className="route-station" data-state={state}>
                <span className="route-dot" data-station-dot aria-hidden="true" />
                <a
                  href={`#${u.id}`}
                  aria-current={here ? 'location' : undefined}
                  onClick={(e) => {
                    e.preventDefault()
                    scrollToAnchor(u.id)
                  }}
                >
                  <span className="mono">
                    {lecture.number}.{k + 1}
                  </span>{' '}
                  {u.title}
                </a>
              </li>
            )
          })}
        </ol>
        <span className="route-end" data-route-end aria-hidden="true" />
      </div>
      {where.unit >= 0 && (
        <div className="route-here">
          <span className="eyebrow">
            In {lecture.number}.{where.unit + 1}
          </span>
          <ol className="route-steps" aria-label={`Steps of ${lecture.number}.${where.unit + 1}`}>
            {chapterSteps(lecture.units[where.unit]).map((st, i) => (
              <li key={st.key} data-current={i === where.step}>
                <a
                  href={`#${stepId(lecture.units[where.unit].id, st.key)}`}
                  aria-current={i === where.step ? 'step' : undefined}
                  onClick={(e) => {
                    e.preventDefault()
                    scrollToAnchor(stepId(lecture.units[where.unit].id, st.key))
                  }}
                >
                  {st.label}
                </a>
              </li>
            ))}
          </ol>
        </div>
      )}
      <p className="visually-hidden" aria-live="polite">
        {announce}
      </p>
      {lecture.watch && (
        <div className="rail-watch">
          <span className="eyebrow">Watch alongside</span>
          <RefList refs={lecture.watch} compact />
        </div>
      )}
    </nav>
  )
}
