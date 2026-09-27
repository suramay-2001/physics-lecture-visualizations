/**
 * The course switcher beside the wordmark (W-709-platform §A "Pages"; D-709-identity §4 and the approved mockup):
 * a disclosure like the Lectures panel (button + region of ordinary links, not a menu role). Each course offers its
 * home and, when the reader has been there, "continue at" its last place (ui/lastPlace.ts, `courses.last.v1`).
 * Opens on click; closes on Escape (focus back to the button), on a pointer press outside, and on navigation.
 *
 * Main chunk: it names 709 chapters by id until the 709 registry has loaded (the switcher asks for it when opened,
 * a lazy import, so 448's first paint never carries 709 content: chunk contract (h)).
 */
import { useEffect, useId, useReducer, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { COURSES, COURSE_IDS, isRegistered, type CourseId } from '../content/courses'
import { metaById } from '../content/meta'
import { useCourse } from '../course/CourseContext'
import { coursePath, lecturePath } from '../paths'
import { usePlaces, type Place } from '../ui/lastPlace'

/** One line about each course's world (the swatch says the same in colour). */
const WORLD: { readonly [K in CourseId]: string } = {
  sl448: 'The Stern–Gerlach bench: spin-½, one silver atom at a time.',
  qc709: 'The dilution refrigerator: qubits, circuits, entanglement and hardware.',
}

/** "Continue at" for a course, or null when there is nowhere real to continue (an unknown or unwritten chapter). */
export function continueAt(course: CourseId, place: Place | undefined): { to: string; text: string } | null {
  if (!place) return null
  const meta = metaById(place.chapter)
  const noun = COURSES[course].noun.one
  if (!meta) {
    // 709's list may simply not have arrived yet: name the chapter by id; the chapter page answers for it
    if (course === 'sl448' || isRegistered(course)) return null
    return { to: lecturePath(place.chapter), text: `${noun} ${place.chapter}` }
  }
  const name = `${noun} ${course === 'sl448' ? meta.number : meta.id}`
  const k = place.unit ? meta.units.findIndex((u) => u.id === place.unit) : -1
  if (k < 0) return { to: lecturePath(meta.id), text: `${name} · ${meta.title}` }
  return { to: lecturePath(meta.id, place.unit), text: `${name}, unit ${course === 'sl448' ? `${meta.number}.${k + 1}` : k + 1} · ${meta.units[k].title}` }
}

function Swatch({ course }: { course: CourseId }) {
  // colours are the identities' own (index.css glass plate / theme-cryostat.css), drawn once here as a picture
  return course === 'qc709' ? (
    <svg className="swatch" viewBox="0 0 44 44" aria-hidden="true">
      <rect width="44" height="44" rx="4" fill="#0b1530" />
      <rect x="6" y="10" width="32" height="3" fill="#f2e8c8" />
      <rect x="10" y="21" width="24" height="3" fill="#f2e8c8" />
      <rect x="14" y="32" width="16" height="3" fill="#f2e8c8" />
      <line x1="19" y1="13" x2="19" y2="32" stroke="#c4705f" strokeWidth="1.3" />
      <line x1="25" y1="13" x2="25" y2="32" stroke="#c4705f" strokeWidth="1.3" />
    </svg>
  ) : (
    <svg className="swatch" viewBox="0 0 44 44" aria-hidden="true">
      <rect width="44" height="44" rx="4" fill="#e4eaee" />
      <rect x="0.5" y="0.5" width="43" height="43" rx="3.5" fill="none" stroke="#b9c4cc" />
      <line x1="6" y1="22" x2="38" y2="22" stroke="#8e99a6" strokeWidth="2" />
      <circle cx="22" cy="14" r="3" fill="#8e99a6" />
      <circle cx="22" cy="30" r="3" fill="#8e99a6" />
    </svg>
  )
}

export function CourseSwitcher() {
  const course = useCourse()
  const [open, setOpen] = useState(false)
  const button = useRef<HTMLButtonElement>(null)
  const panel = useRef<HTMLDivElement>(null)
  const id = useId()
  const { pathname, hash } = useLocation()
  const places = usePlaces()
  const [, arrived] = useReducer((n: number) => n + 1, 0)
  const c = COURSES[course]

  useEffect(() => setOpen(false), [pathname, hash])
  useEffect(() => {
    if (!open) return
    // 709's chapter titles live in its lazy registry: fetch it once, then re-render with the titles
    if (!isRegistered('qc709')) {
      void import('../content/qc709/registry').then(arrived, () => {})
    }
    panel.current?.querySelector<HTMLAnchorElement>('a')?.focus()
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
    <div className="course-switcher">
      <button
        ref={button}
        type="button"
        className="switcher-btn"
        aria-expanded={open}
        aria-controls={id}
        aria-label={`Course: ${c.code}, ${c.title}. Switch course`}
        onClick={() => setOpen((o) => !o)}
      >
        <span className="sw-code">{c.code}</span>
        {/* 448's title is the wordmark itself ("Spin Lab"); only 709 adds its name */}
        {c.title !== COURSES.sl448.title && <span className="sw-name">{c.title}</span>}
        <svg viewBox="0 0 10 6" width="10" height="6" aria-hidden="true">
          <path d="M1 1l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      </button>
      {open && (
        <div ref={panel} id={id} className="switcher-pop" role="region" aria-label="Switch course">
          <p className="pop-head">Switch course</p>
          <ul className="course-opts">
            {COURSE_IDS.map((k) => {
              const here = continueAt(k, places[k])
              return (
                <li key={k} className="course-opt" data-course={k} aria-current={k === course ? 'true' : undefined}>
                  <Swatch course={k} />
                  <span className="co-body">
                    <Link to={coursePath(k)} className="co-name">
                      {COURSES[k].code} · {COURSES[k].title}
                    </Link>
                    <span className="co-meta">{WORLD[k]}</span>
                    {here && (
                      <Link to={here.to} className="co-continue">
                        Continue at {here.text}
                      </Link>
                    )}
                  </span>
                </li>
              )
            })}
          </ul>
          <p className="pop-foot">Each course keeps its own place and progress.</p>
        </div>
      )}
    </div>
  )
}
