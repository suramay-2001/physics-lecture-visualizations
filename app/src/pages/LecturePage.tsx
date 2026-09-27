import { Fragment, useEffect, useLayoutEffect, useRef } from 'react'
import { Link, useParams } from 'react-router-dom'
import { lectureById } from '../content'
import type { Lecture } from '../content/schema'
import { UnitView } from '../components/UnitView'
import { RouteRail } from '../components/RouteRail'
import { LectureFork } from '../components/LectureFork'
import { ReadModeToggle } from '../components/ReadModeToggle'
import { requestStageHost } from '../stage/demand'
import { useLiveStage, useMotionSync } from '../stage/useLiveStage'
import { Rich } from '../ui/Rich'

/** Sticky offset under the app's top bar (`--story-top`, read by story.css). */
function useStoryTop(root: React.RefObject<HTMLElement | null>) {
  useLayoutEffect(() => {
    const bar = document.querySelector<HTMLElement>('.topbar')
    const el = root.current
    if (!bar || !el) return
    const set = () => el.style.setProperty('--story-top', `${bar.offsetHeight}px`)
    set()
    const ro = new ResizeObserver(set)
    ro.observe(bar)
    return () => ro.disconnect()
  }, [root])
}

/**
 * Crossing 900 px (or losing the WebGL context) swaps the live story and the static reading version.
 * The beat under the viewport centre is remembered while scrolling and re-centred after the swap.
 */
function useKeepReadingPosition(live: boolean) {
  const current = useRef<string | null>(null)
  const prevLive = useRef(live)
  useEffect(() => {
    let raf = 0
    const probe = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        const mid = innerHeight / 2
        let best: string | null = null
        let bestD = Infinity
        document.querySelectorAll<HTMLElement>('.story-beat[data-beat], .static-beat[data-beat]').forEach((el) => {
          const r = el.getBoundingClientRect()
          const d = r.top <= mid && r.bottom >= mid ? 0 : Math.min(Math.abs(r.top - mid), Math.abs(r.bottom - mid))
          if (d < bestD) {
            bestD = d
            best = el.dataset.beat ?? null
          }
        })
        current.current = bestD < innerHeight ? best : null
      })
    }
    probe()
    addEventListener('scroll', probe, { passive: true })
    return () => {
      cancelAnimationFrame(raf)
      removeEventListener('scroll', probe)
    }
  }, [])
  useLayoutEffect(() => {
    if (prevLive.current === live) return
    prevLive.current = live
    const id = current.current
    if (!id) return
    const el = document.querySelector<HTMLElement>(`[data-beat="${CSS.escape(id)}"]`)
    el?.scrollIntoView({ block: 'center' })
  }, [live])
}

/** "5 units · 31 beats · 14 challenges": what the reader is about to travel (counted, not estimated). */
export function lectureStats(l: Lecture): string {
  const beats = l.units.reduce((n, u) => n + (u.story?.length ?? 0), 0)
  const challenges = l.units.reduce((n, u) => n + u.play.length, 0)
  const plural = (n: number, w: string) => `${n} ${w}${n === 1 ? '' : 's'}`
  return [plural(l.units.length, 'unit'), beats ? plural(beats, 'beat') : '', plural(challenges, 'challenge')].filter(Boolean).join(' · ')
}

export function LecturePage({ lecture: given }: { lecture?: Lecture } = {}) {
  const { id = 'L1' } = useParams()
  const lecture = given ?? lectureById(id)
  const live = useLiveStage()
  const hasStory = !!lecture?.units.some((u) => u.story?.length)
  const rootRef = useRef<HTMLDivElement>(null)
  useMotionSync()
  useStoryTop(rootRef)
  useKeepReadingPosition(live)

  // The ONE canvas (App level) is mounted on first demand and kept for the session (W-L1 §2.1).
  useEffect(() => {
    if (live && hasStory) requestStageHost()
  }, [live, hasStory])

  if (!lecture) {
    return (
      <div className="page">
        <h1>No lecture called “{id}”</h1>
        <p><Link to="/">Back to the lecture list</Link></p>
      </div>
    )
  }

  return (
    <div className="lecture" ref={rootRef} data-story={hasStory ? (live ? 'live' : 'static') : undefined}>
      <header className="lecture-head lecture-opener">
        <p className="eyebrow">Lecture {lecture.number}{lecture.date ? ` · ${lecture.date}` : ''}</p>
        {/* motion list §4 item 1: the title's words rise in once (CSS; off when motion is off) */}
        <h1 aria-label={lecture.title}>
          {lecture.title.split(' ').map((w, k) => (
            <Fragment key={k}>
              {k > 0 && ' '}
              <span className="word-rise" aria-hidden="true" style={{ '--i': k } as React.CSSProperties}>
                {w}
              </span>
            </Fragment>
          ))}
        </h1>
        <div className="lecture-meta-row">
          <p className="lecture-stats mono">{lectureStats(lecture)}</p>
          {hasStory && <ReadModeToggle />}
        </div>
        <div className="outcomes">
          <span className="eyebrow">After this lecture you can</span>
          <ul>
            {lecture.outcomes.map((o, k) => <li key={k}>{o}</li>)}
          </ul>
        </div>
      </header>

      <div className={hasStory ? 'lecture-layout has-story' : 'lecture-layout'}>
        <RouteRail lecture={lecture} />

        <div className="lecture-body">
          {lecture.corrections && lecture.corrections.length > 0 && (
            <aside className="errata" aria-label="Errata">
              <span className="eyebrow">Errata found while building this page</span>
              {lecture.corrections.map((c, k) => (
                <div key={k} className="erratum">
                  <p><span className="mono">{c.where}</span>: {c.source === 'book' ? 'the book says' : 'the notes say'} “<Rich text={c.says} as="span" />”</p>
                  <p><strong>Should read:</strong> <Rich text={c.shouldSay} as="span" /></p>
                </div>
              ))}
            </aside>
          )}
          {lecture.units.map((u, k) => (
            <UnitView key={u.id} unit={u} index={`${lecture.number}.${k + 1}`} position={{ k, n: lecture.units.length }} />
          ))}
          <LectureFork lecture={lecture} />
        </div>
      </div>
    </div>
  )
}
