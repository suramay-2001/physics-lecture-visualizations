import { Fragment, useEffect, useLayoutEffect, useMemo, useRef } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
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
import { TrackHint, TrackToggle } from '../components/TrackToggle'
import { PrintNotes, usePrintFlush } from '../components/PrintNotes'
import { FigureNumbersContext, figureNumbers } from '../stage/figures/FigureFor'
import { TrackContext, useTrack } from '../ui/trackPref'
import { requestStageHost } from '../stage/demand'
import { storyKinds } from '../stage/drive'
import { useSvgKinds } from '../stage/svgKinds'
import { glKinds, type StageKind } from '../content/stage'
import { scheduleStoryRefresh } from '../stage/useStoryScroll'
import { beatElement, focusQuietly, placeFromSearch, restoreWhenSettled, useKeepReadingPosition } from '../stage/readingPosition'
import { useLiveStage, useMotionSync } from '../stage/useLiveStage'
import { Rich } from '../ui/Rich'
import { UnitOpener } from '../components/UnitOpener'

/** Sticky offset under the app's top bar (`--story-top`, read by story.css). */
function useStoryTop(root: React.RefObject<HTMLElement | null>, mounted: boolean) {
  useLayoutEffect(() => {
    const bar = document.querySelector<HTMLElement>('.topbar')
    const el = root.current
    if (!bar || !el) return
    const set = () => el.style.setProperty('--story-top', `${bar.offsetHeight}px`)
    set()
    const ro = new ResizeObserver(set)
    ro.observe(bar)
    return () => ro.disconnect()
  }, [root, mounted])
}

/** "5 units · 31 beats · 14 challenges": what the reader is about to travel (counted, not estimated). */
export function lectureStats(l: Lecture): string {
  const beats = l.units.reduce((n, u) => n + (u.story?.length ?? 0), 0)
  const challenges = l.units.reduce((n, u) => n + u.play.length, 0)
  const plural = (n: number, w: string) => `${n} ${w}${n === 1 ? '' : 's'}`
  return [plural(l.units.length, 'unit'), beats ? plural(beats, 'beat') : '', plural(challenges, 'challenge')].filter(Boolean).join(' · ')
}

/** Every stage kind a lecture's stories use (question and reveal pictures), in first-use order. */
export function lectureKinds(l: Lecture | undefined): StageKind[] {
  const out: StageKind[] = []
  for (const u of l?.units ?? []) for (const k of storyKinds(u.story ?? [])) if (!out.includes(k)) out.push(k)
  return out
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
  const { hash, search } = useLocation()
  // every kind the lecture's stories use: WebGL kinds need the canvas; SVG kinds need their lazy chunk, loaded before
  // the lecture renders so the story, the reading version and the print figures can draw them at once
  const kinds = useMemo(() => lectureKinds(lecture), [lecture])
  const svgReady = useSvgKinds(kinds)
  // the lecture's root is on the page (its chunk and its SVG kinds' chunk have both arrived): effects that measure it
  // run again when it mounts
  const mounted = !!lecture && svgReady.status === 'ready'
  const live = useLiveStage(kinds)
  // Ground-up or Formal (two-track courses only; 448 is always Ground-up): the stored choice or the URL's ?track=
  const track = useTrack(course, search)
  const hasStory = !!lecture?.units.some((u) => u.story?.length)
  const rootRef = useRef<HTMLDivElement>(null)
  useMotionSync()
  useStoryTop(rootRef, mounted)
  // crossing 900 px (or losing the WebGL context, or the Read toggle) swaps the live story and the static reading
  // version, and the track toggle swaps every beat's text: the reader's place is restored after either
  // (stage/readingPosition.ts)
  useKeepReadingPosition(`${live ? 'live' : 'static'}:${track}`, live)
  // print notes: a browser print gets the Read-mode notes too; one numbered figure per stage change, through the lecture
  usePrintFlush()
  const figures = useMemo(() => (lecture ? figureNumbers(lecture) : new Map<string, string>()), [lecture])
  const twoTracks = COURSES[course].tracks.length > 1
  const headLeft = lecture ? `${COURSES[course].code} · ${noun} ${label(lecture)} · ${lecture.title}` : ''
  const headRight = twoTracks ? `${track === 'formal' ? 'Formal' : 'Ground-up'} track` : 'Read-mode notes'
  // the running head of the print notes lives in page margin boxes, which take strings: hand them over as properties
  useLayoutEffect(() => {
    if (!headLeft) return
    const root = document.documentElement.style
    root.setProperty('--print-head-left', JSON.stringify(headLeft))
    root.setProperty('--print-head-right', JSON.stringify(headRight))
    return () => {
      root.removeProperty('--print-head-left')
      root.removeProperty('--print-head-right')
    }
  }, [headLeft, headRight])

  // The ONE canvas (App level) is mounted on first demand and kept for the session (W-L1 §2.1).
  const hasGl = glKinds(kinds).length > 0
  useEffect(() => {
    if (live && hasStory && hasGl) requestStageHost()
  }, [live, hasStory, hasGl])

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
  }, [live, hasStory, mounted])

  // a #unit or #challenge link can arrive before its lecture's chunk: scroll there once the lecture is on the page
  const ready = mounted
  useEffect(() => {
    if (ready && hash) document.getElementById(hash.slice(1))?.scrollIntoView()
  }, [ready, hash])

  // `?at=<beat>&f=<frac>` (the way back from a bridge, or Back to the entry a bridge left): once the lecture is on the
  // page and its story has refreshed, that point of the beat goes under the centre line, focus moves to the beat
  // (outlined once), and the two parameters leave the URL (stage/readingPosition.ts, components/ReturnBar.tsx)
  const navigate = useNavigate()
  const location = useLocation()
  const units = useMemo(() => lecture?.units.map((u) => u.id) ?? [], [lecture])
  const arrive = placeFromSearch(search, units)
  const arriveKey = arrive ? `${arrive.beat}~${arrive.frac}` : ''
  const settle = useRef<(() => void) | null>(null)
  useEffect(() => () => settle.current?.(), [])
  useEffect(() => {
    // a chapter whose SVG kinds are still loading has no beats on the page yet: restore once they are (448: at once)
    if (!arrive || svgReady.status !== 'ready') return
    settle.current?.()
    settle.current = restoreWhenSettled(arrive, {
      live: live && hasStory,
      done: (ok) => {
        const el = beatElement(arrive.beat)
        if (ok && el) {
          focusQuietly(el)
          el.classList.add('arrived')
          setTimeout(() => el.classList.remove('arrived'), 2000)
        }
        const q = new URLSearchParams(location.search)
        q.delete('at')
        q.delete('f')
        const s = q.toString()
        navigate({ pathname: location.pathname, search: s ? `?${s}` : '', hash: location.hash }, { replace: true, state: location.state })
      },
    })
  }, [arriveKey, svgReady.status])

  if (!lecture || svgReady.status !== 'ready') {
    const meta = lecture ?? metaById(id)
    // the lecture's SVG stage kinds are one more lazy chunk: the same loading and retry states as the lecture itself
    const status = !lecture ? load.status : svgReady.status
    const retry = !lecture ? ('retry' in load ? load.retry : undefined) : svgReady.retry
    if ((lecture || !given) && meta && status !== 'missing') {
      return (
        <div className="page lecture-loading" aria-busy={status === 'loading'}>
          <p className="eyebrow">
            {noun} {label(meta)}
          </p>
          <h1>{meta.title}</h1>
          {status === 'failed' ? (
            <p role="alert">
              This {noun.toLowerCase()} did not load. Check the connection, then{' '}
              <button type="button" className="topbar-button" onClick={retry}>
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
    <TrackContext.Provider value={track}>
    <FigureNumbersContext.Provider value={figures}>
    <div
      className="lecture"
      ref={rootRef}
      data-story={hasStory ? (live ? 'live' : 'static') : undefined}
      data-track={twoTracks ? track : undefined}
      data-figures={figures.size}
    >
      {/* the running head of the print notes (styles/print.css prints it from --print-head-left / -right) */}
      <p className="print-head" aria-hidden="true">
        <span>{headLeft}</span> <span>{headRight}</span>
      </p>
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
          <TrackToggle course={course} track={track} />
          {twoTracks && hasStory && <PrintNotes />}
        </div>
        <TrackHint course={course} />
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
    </FigureNumbersContext.Provider>
    </TrackContext.Provider>
  )
}
