/**
 * Topbar controls (Phase 4a, D-nav-story §3.1): the course beamline as a "Lectures" panel reachable from every
 * page, and the reader's Motion toggle.
 *
 * Lectures panel: a disclosure (button + region), not a menu role — it holds ordinary links. Opens on click,
 * closes on Escape (focus back to the button), on a pointer press outside, and on navigation. No animation:
 * the closed motion list (§4) does not include it.
 */
import { lazy, Suspense, useEffect, useId, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { COURSES, type CourseId } from '../content/courses'
import { LECTURE_META } from '../content/meta'
import { useCourse } from '../course/CourseContext'
import { lecturePath } from '../paths'
import { useProgress } from '../progress'
import { useStageFlag } from '../stage/store'
import { setMotionChoice } from '../ui/motionPref'

// 709's panel lists the semester outline (Foundations, then Chapters): lazy, like every 709 page (chunk contract (h))
const LecturesPanel709 = lazy(() => import('./LecturesPanel709'))

/** The course's chapter list from the topbar: 448's lectures, or 709's Foundations then Chapters. */
export function LecturesMenu({ course: pinned }: { course?: CourseId } = {}) {
  const current = useCourse()
  const course = pinned ?? current
  const noun = COURSES[course].noun.many
  const [open, setOpen] = useState(false)
  const button = useRef<HTMLButtonElement>(null)
  const panel = useRef<HTMLDivElement>(null)
  const id = useId()
  const { pathname, hash } = useLocation()
  const p = useProgress()

  useEffect(() => setOpen(false), [pathname, hash])
  useEffect(() => {
    if (!open) return
    // the first link; 709's panel may have none yet (every chapter planned, or its list still loading)
    const first = panel.current?.querySelector<HTMLAnchorElement>('a')
    if (first) first.focus()
    else panel.current?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      setOpen(false)
      button.current?.focus()
    }
    const onDown = (e: PointerEvent) => {
      const t = e.target as Node
      if (!panel.current?.contains(t) && !button.current?.contains(t)) setOpen(false)
    }
    document.addEventListener('keydown', onKey)
    document.addEventListener('pointerdown', onDown)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('pointerdown', onDown)
    }
  }, [open])

  return (
    <div className="lectures-menu">
      <button ref={button} type="button" className="topbar-button" aria-expanded={open} aria-controls={id} onClick={() => setOpen((o) => !o)}>
        {noun} <span aria-hidden="true">▾</span>
      </button>
      {open && course === 'qc709' && (
        <div ref={panel} id={id} className="lectures-panel" role="region" aria-label={noun} tabIndex={-1}>
          <Suspense fallback={<p className="small">Loading the chapters…</p>}>
            <LecturesPanel709 />
          </Suspense>
        </div>
      )}
      {open && course === 'sl448' && (
        <div ref={panel} id={id} className="lectures-panel" role="region" aria-label="Lectures">
          <ol className="panel-line">
            {LECTURE_META.map((l) => {
              const ids = l.units.flatMap((u) => u.challenges)
              const solved = ids.filter((cid) => p.challenges[cid]?.solved).length
              return (
                <li key={l.id} className="panel-station">
                  <Link to={lecturePath(l.id)} className="panel-lecture">
                    <span className="panel-num">{l.number}</span>
                    <span className="panel-title">{l.title}</span>
                    <span className="panel-progress mono" aria-label={`${solved} of ${ids.length} challenges solved`}>
                      {solved}/{ids.length}
                    </span>
                  </Link>
                  <ol className="panel-units">
                    {l.units.map((u, k) => (
                      <li key={u.id}>
                        <Link to={lecturePath(l.id, u.id)}>
                          <span className="mono">
                            {l.number}.{k + 1}
                          </span>{' '}
                          {u.title}
                        </Link>
                      </li>
                    ))}
                  </ol>
                </li>
              )
            })}
          </ol>
        </div>
      )}
    </div>
  )
}

export function MotionToggle() {
  const motion = useStageFlag('motion')
  return (
    <button
      type="button"
      className="topbar-button motion-toggle"
      aria-pressed={motion}
      title={motion ? 'Turn animations off (stage changes become cuts)' : 'Turn animations on'}
      onClick={() => setMotionChoice(motion ? 'reduce' : 'full')}
    >
      <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
        <circle cx="8" cy="8" r="6.5" fill="none" stroke="currentColor" strokeWidth="1.4" />
        <path d="M8 1.5a6.5 6.5 0 0 1 0 13z" fill={motion ? 'currentColor' : 'none'} />
      </svg>
      Motion {motion ? 'on' : 'off'}
    </button>
  )
}
