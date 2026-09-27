import { Fragment, useEffect, useLayoutEffect, useRef } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import { useLecture } from '../content/load'
import { COURSES, courseOfId } from '../content/courses'
import { metaById } from '../content/meta'
import { useCourse } from '../course/CourseContext'
import { coursePath } from '../paths'
import type { Lecture } from '../content/schema'
import { UnitView } from '../components/UnitView'
import { RouteRail } from '../components/RouteRail'
import { LectureFork } from '../components/LectureFork'
import { ReadModeToggle } from '../components/ReadModeToggle'
import { requestStageHost } from '../stage/demand'
import { scheduleStoryRefresh } from '../stage/useStoryScroll'
import { useKeepReadingPosition } from '../stage/readingPosition'
import { useLiveStage, useMotionSync } from '../stage/useLiveStage'
import { Rich } from '../ui/Rich'
import { UnitOpener } from '../components/UnitOpener'

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

/** "5 units · 31 beats · 14 challenges": what the reader is about to travel (counted, not estimated). */
export function lectureStats(l: Lecture): string {
  const beats = l.units.reduce((n, u) => n + (u.story?.length ?? 0), 0)
  const challenges = l.units.reduce((n, u) => n + u.play.length, 0)
  const plural = (n: number, w: string) => `${n} ${w}${n === 1 ? '' : 's'}`
  return [plural(l.units.length, 'unit'), beats ? plural(beats, 'beat') : '', plural(challenges, 'challenge')].filter(Boolean).join(' · ')
}

export function LecturePage({ lecture: given }: { lecture?: Lecture } = {}) {
  const { id = 'L1' } = useParams()
  const course = useCourse()
  const noun = COURSES[course].noun.one
  // 448 numbers its lectures ("Lecture 3"); 709 names chapters by id ("Chapter Q3")
  const label = (l: { id: string; number: number }) => (course === 'sl448' ? String(l.number) : l.id)
  // each lecture is its own chunk (content/load.ts): ready at once when cached, else loading until it arrives
  // a chapter id of the other course (#/lecture/Q3, #/709/ch/L3) is not a page of this one
  const foreign = !given && courseOfId(id) !== course
  const load = useLecture(foreign ? '' : id)
  const lecture = given ?? (load.status === 'ready' ? load.lecture : undefined)
  const { hash } = useLocation()
  const live = useLiveStage()
  const hasStory = !!lecture?.units.some((u) => u.story?.length)
  const rootRef = useRef<HTMLDivElement>(null)
  useMotionSync()
  useStoryTop(rootRef)
  // crossing 900 px (or losing the WebGL context, or the Read toggle) swaps the live story and the static reading
  // version: the beat under the centre line is re-centred after the swap (stage/readingPosition.ts)
  useKeepReadingPosition(live ? 'live' : 'static', live)

  // The ONE canvas (App level) is mounted on first demand and kept for the session (W-L1 §2.1).
  useEffect(() => {
    if (live && hasStory) requestStageHost()
  }, [live, hasStory])

  // Anything that grows after first layout (a lazy Try-it widget, a chapter film, a reveal, a walkthrough) moves every
  // LATER unit without changing that unit's own height, so its scroll triggers go stale and beats stop activating
  // (found in L5: a Bloch widget in unit 5.1 broke unit 5.2). One observer on the whole lecture refreshes them all.
  useEffect(() => {
    const el = rootRef.current
    if (!el || !live || !hasStory || typeof ResizeObserver === 'undefined') return
    let lastH = el.offsetHeight
    const ro = new ResizeObserver(() => {
      const h = el.offsetHeight
      if (Math.abs(h - lastH) < 1) return
      lastH = h
      scheduleStoryRefresh()
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [live, hasStory])

  // a #unit or #challenge link can arrive before its lecture's chunk: scroll there once the lecture is on the page
  const ready = !!lecture
  useEffect(() => {
    if (ready && hash) document.getElementById(hash.slice(1))?.scrollIntoView()
  }, [ready, hash])

  if (!lecture) {
    const meta = metaById(id)
    if (!given && meta && load.status !== 'missing') {
      return (
        <div className="page lecture-loading" aria-busy={load.status === 'loading'}>
          <p className="eyebrow">
            {noun} {label(meta)}
          </p>
          <h1>{meta.title}</h1>
          {load.status === 'failed' ? (
            <p role="alert">
              This {noun.toLowerCase()} did not load. Check the connection, then{' '}
              <button type="button" className="topbar-button" onClick={load.retry}>
                try again
              </button>
              .
            </p>
          ) : (
            <p className="small">Loading the {noun.toLowerCase()}…</p>
          )}
        </div>
      )
    }
    return (
      <div className="page">
        <h1>
          No {noun.toLowerCase()} called “{id}”
        </h1>
        <p>
          <Link to={coursePath(course)}>Back to the {noun.toLowerCase()} list</Link>
        </p>
      </div>
    )
  }

  return (
    <div className="lecture" ref={rootRef} data-story={hasStory ? (live ? 'live' : 'static') : undefined}>
      <header className="lecture-head lecture-opener">
        <p className="eyebrow">
          {noun} {label(lecture)}
          {lecture.date ? ` · ${lecture.date}` : ''}
        </p>
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
        {/* keyed: its "where am I" state is a unit index of THIS lecture; kept across a hash change from a 6-unit lecture
            to a 5-unit one it pointed past the end and crashed the page (L4's fork → L5, found building L6) */}
        <RouteRail key={lecture.id} lecture={lecture} />

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
            <Fragment key={u.id}>
              {u.opener && <UnitOpener opener={u.opener} />}
              <UnitView unit={u} index={`${lecture.number}.${k + 1}`} position={{ k, n: lecture.units.length }} />
            </Fragment>
          ))}
          <LectureFork lecture={lecture} />
        </div>
      </div>
    </div>
  )
}
