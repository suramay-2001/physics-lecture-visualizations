/**
 * The reader's track per course (W-709-platform §B "Toggle"): Ground-up or Formal. The readModePref.ts pattern: a
 * per-viewer convenience in localStorage (`spinlab.qc709.track.v1`; every access guarded, blocked storage means the
 * choice lasts for this visit), validated on read like the other prefs: only a track the course HAS is ever returned,
 * so a hand-edited or stale value falls back to Ground-up. A `?track=` query on the page (a shared link, a bridge's
 * way back) overrides the stored choice for that URL, validated the same way. 448 has one track and always reads
 * Ground-up. `TrackContext` carries the page's track to every beat, card and gloss below the lecture page.
 */
import { createContext, useContext, useSyncExternalStore } from 'react'
import { COURSES, COURSE_IDS, type CourseId, type Track } from '../content/courses'
import { isTrack } from '../content/track'

export const trackKey = (course: CourseId): string => `spinlab.${course}.track.v1`

/** A track the course offers, else null (untrusted input: storage, the URL). */
export function validTrack(course: CourseId, x: unknown): Track | null {
  return isTrack(x) && COURSES[course].tracks.includes(x) ? x : null
}

function read(course: CourseId): Track {
  if (COURSES[course].tracks.length < 2) return 'ground'
  try {
    const raw = globalThis.localStorage?.getItem(trackKey(course))
    return (typeof raw === 'string' && raw.length < 16 && validTrack(course, raw)) || 'ground'
  } catch {
    return 'ground'
  }
}

const tracks = Object.fromEntries(COURSE_IDS.map((c) => [c, read(c)])) as Record<CourseId, Track>
const subs = new Set<() => void>()

export const getTrack = (course: CourseId): Track => tracks[course]

export function setTrack(course: CourseId, track: Track): void {
  const t = validTrack(course, track)
  if (!t || tracks[course] === t) return
  tracks[course] = t
  try {
    if (t === 'ground') localStorage.removeItem(trackKey(course))
    else localStorage.setItem(trackKey(course), t)
  } catch {
    /* storage blocked: the choice still holds for this visit */
  }
  subs.forEach((fn) => fn())
}

const subscribe = (fn: () => void) => {
  subs.add(fn)
  return () => subs.delete(fn)
}

/** The `?track=` override of a router search string, when valid for the course. */
export function trackFromSearch(course: CourseId, search: string): Track | null {
  if (!search.includes('track=')) return null
  try {
    return validTrack(course, new URLSearchParams(search).get('track'))
  } catch {
    return null
  }
}

/** The track a page of `course` shows: the URL's `?track=` when valid, else the stored choice. */
export function useTrack(course: CourseId, search = ''): Track {
  const stored = useSyncExternalStore(subscribe, () => tracks[course], () => 'ground' as Track)
  return trackFromSearch(course, search) ?? stored
}

/** The track of the page being rendered (LecturePage provides it; Ground-up elsewhere, and in SSR tests). */
export const TrackContext = createContext<Track>('ground')
export const useTrackContext = (): Track => useContext(TrackContext)
