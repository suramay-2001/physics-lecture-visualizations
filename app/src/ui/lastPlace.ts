/**
 * Where the reader last was in each course (the `courses.last.v1` pref, W-709-platform §A "Progress"): the course
 * switcher offers "continue at" this place for each course. A per-viewer convenience in localStorage, validated like
 * the progress store (semi-trusted: old schemas, extensions or a hand edit can put anything there): ids only, each
 * checked field by field against its course's id rules, never a URL, so the link it builds (paths.ts) cannot point
 * anywhere else. Every storage access is guarded; blocked storage means the place lasts for this visit.
 */
import { useSyncExternalStore } from 'react'
import { COURSES, COURSE_IDS, courseOfId, type CourseId } from '../content/courses'

export const LAST_PLACE_KEY = 'spinlab.courses.last.v1'
/** A stored value longer than this is ignored (two short records need well under 300 characters). */
export const LAST_PLACE_MAX_RAW = 1024

export interface Place {
  /** L3 / Q4 / F2 */
  chapter: string
  /** A unit of that chapter (`l3-projectors`), when the reader was inside one. */
  unit?: string
}
export type Places = { readonly [K in CourseId]?: Place }

const UNIT = /^[a-z0-9][a-z0-9-]{0,63}$/

/** Rebuild the places from untrusted JSON: unknown fields dropped, anything malformed skipped. Never throws. */
export function sanitizePlaces(x: unknown): Places {
  const out: { [K in CourseId]?: Place } = {}
  if (!x || typeof x !== 'object' || Array.isArray(x)) return out
  for (const course of COURSE_IDS) {
    if (!Object.hasOwn(x, course)) continue
    const r = (x as Record<string, unknown>)[course]
    if (!r || typeof r !== 'object' || Array.isArray(r)) continue
    const { chapter, unit } = r as Record<string, unknown>
    if (typeof chapter !== 'string' || !COURSES[course].chapterId.test(chapter) || courseOfId(chapter) !== course) continue
    const place: Place = { chapter }
    if (typeof unit === 'string' && UNIT.test(unit) && unit.startsWith(`${chapter.toLowerCase()}-`)) place.unit = unit
    out[course] = place
  }
  return out
}

function read(): Places {
  try {
    const raw = globalThis.localStorage?.getItem(LAST_PLACE_KEY)
    if (typeof raw !== 'string' || raw.length > LAST_PLACE_MAX_RAW) return {}
    return sanitizePlaces(JSON.parse(raw))
  } catch {
    return {}
  }
}

let places: Places = read()
const subs = new Set<() => void>()

export const getPlaces = (): Places => places

/** Remember the reader's place in the chapter's course (the course follows from the id). Invalid ids are ignored. */
export function rememberPlace(chapter: string, unit?: string): void {
  const course = courseOfId(chapter)
  const next = sanitizePlaces({ [course]: { chapter, unit } })[course]
  if (!next) return
  const now = places[course]
  if (now && now.chapter === next.chapter && now.unit === next.unit) return
  places = { ...places, [course]: next }
  try {
    localStorage.setItem(LAST_PLACE_KEY, JSON.stringify(places))
  } catch {
    /* storage blocked: the place still holds for this visit */
  }
  subs.forEach((fn) => fn())
}

const subscribe = (fn: () => void) => {
  subs.add(fn)
  return () => subs.delete(fn)
}
const EMPTY: Places = {}
export const usePlaces = (): Places => useSyncExternalStore(subscribe, getPlaces, () => EMPTY)
