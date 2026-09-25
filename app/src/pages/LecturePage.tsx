import { useEffect, useLayoutEffect, useRef } from 'react'
import { Link, useParams } from 'react-router-dom'
import { LECTURES, lectureById } from '../content'
import type { Lecture } from '../content/schema'
import { UnitView } from '../components/UnitView'
import { RefList } from '../components/RefList'
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
  const i = LECTURES.indexOf(lecture)
  const prev = i >= 0 ? LECTURES[i - 1] : undefined
  const next = i >= 0 ? LECTURES[i + 1] : undefined

  return (
    <div className="lecture" ref={rootRef} data-story={hasStory ? (live ? 'live' : 'static') : undefined}>
      <header className="lecture-head">
        <p className="eyebrow">Lecture {lecture.number}{lecture.date ? ` · ${lecture.date}` : ''}</p>
        <h1>{lecture.title}</h1>
        <div className="outcomes">
          <span className="eyebrow">After this lecture you can</span>
          <ul>
            {lecture.outcomes.map((o, k) => <li key={k}>{o}</li>)}
          </ul>
        </div>
      </header>

      <div className={hasStory ? 'lecture-layout has-story' : 'lecture-layout'}>
        <nav className="unit-rail" aria-label="Units in this lecture">
          <ol>
            {lecture.units.map((u, k) => (
              <li key={u.id}><a href={`#/lecture/${lecture.id}#${u.id}`} onClick={(e) => { e.preventDefault(); document.getElementById(u.id)?.scrollIntoView({ behavior: 'smooth' }) }}>
                <span className="mono">{lecture.number}.{k + 1}</span> {u.title}
              </a></li>
            ))}
          </ol>
          {lecture.watch && (
            <div className="rail-watch">
              <span className="eyebrow">Watch alongside</span>
              <RefList refs={lecture.watch} compact />
            </div>
          )}
        </nav>

        <div className="lecture-body">
          {lecture.corrections && lecture.corrections.length > 0 && (
            <aside className="errata" aria-label="Errata">
              <span className="eyebrow">Errata found while building this page</span>
              {lecture.corrections.map((c, k) => (
                <div key={k} className="erratum">
                  <p><span className="mono">{c.where}</span>: the notes say “<Rich text={c.says} as="span" />”</p>
                  <p><strong>Should read:</strong> <Rich text={c.shouldSay} as="span" /></p>
                </div>
              ))}
            </aside>
          )}
          {lecture.units.map((u, k) => (
            <UnitView key={u.id} unit={u} index={`${lecture.number}.${k + 1}`} />
          ))}
          <nav className="lecture-pager" aria-label="Other lectures">
            {prev ? <Link to={`/lecture/${prev.id}`} className="btn ghost">← Lecture {prev.number}: {prev.title}</Link> : <span />}
            {next && <Link to={`/lecture/${next.id}`} className="btn">Lecture {next.number}: {next.title} →</Link>}
          </nav>
        </div>
      </div>
    </div>
  )
}
