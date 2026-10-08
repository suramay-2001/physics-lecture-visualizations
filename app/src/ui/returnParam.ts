/**
 * The way back from a bridge (W-709-platform §C; widened for 448 → 709 bridges by interface change W-448 #4):
 * `?ret=qc709~Q3~q3-bell:b4~0.42~formal` on the 448 page a 709 bridge opened, or `?ret=sl448~L8~l8-photon-spin:b2~0.42~ground`
 * on the 709 page a 448 bridge opened. Fields, in order, separated by `~`:
 *   course   the course the way back leads INTO: 'qc709' (a bridge left Physics 709) or 'sl448' (a bridge left Spin Lab)
 *   chapter  a chapter id of THAT course (709: Q3, F2; 448: L8), matched against the course's own chapter pattern
 *   place    a beat id of that chapter (`q3-bell:b4`), or a unit id when the link sat outside a beat
 *   frac     0…1 with at most three decimals: how far into the beat the centre line was
 *   track    the track the reader was in, one the course HAS (709: ground | formal; 448: ground)
 *
 * SECURITY: `ret` is untrusted (anyone can craft a link). It holds ids only, never a URL: each field is parsed on its
 * own against a closed pattern, the chapter and unit are then checked against the chapter registry, and the way back
 * is BUILT from the ids with paths.ts, so it can only ever be an in-app chapter link (no open redirect). Anything
 * malformed, oversized or unknown parses to null and the page shows no return bar (returnParam.security.test.ts).
 * Main chunk, pure (no React).
 */
import { COURSES, courseOfId, isCourseId, type CourseId, type Track } from '../content/courses'
import type { LectureMeta } from '../content/meta'
import { BEAT_ID_RE } from '../content/stage'
import { isTrack } from '../content/track'

export interface ReturnPlace {
  /** The course the way back leads into (the course of `chapter`). */
  course: CourseId
  chapter: string
  unit: string
  /** The beat, or null when the place is a whole unit. */
  beat: string | null
  frac: number
  track: Track
}

/** A `ret` longer than this is ignored (a real one needs well under 120 characters). */
export const RET_MAX = 160
const UNIT_RE = /^[a-z0-9][a-z0-9-]{0,63}$/
const FRAC_RE = /^(?:0(?:\.\d{1,3})?|1(?:\.0{1,3})?)$/

/** Field by field, no registry: the shape of a return place, else null. Never throws. */
export function parseReturnSyntax(raw: unknown): ReturnPlace | null {
  if (typeof raw !== 'string' || raw.length === 0 || raw.length > RET_MAX) return null
  const f = raw.split('~')
  if (f.length !== 5) return null
  const [course, chapter, place, frac, track] = f
  if (!isCourseId(course)) return null
  if (!COURSES[course].chapterId.test(chapter) || courseOfId(chapter) !== course) return null
  const m = BEAT_ID_RE.exec(place)
  const unit = m ? m[1] : place
  if (!UNIT_RE.test(unit) || !unit.startsWith(`${chapter.toLowerCase()}-`)) return null
  if (!FRAC_RE.test(frac)) return null
  if (!isTrack(track) || !COURSES[course].tracks.includes(track)) return null
  return { course, chapter, unit, beat: m ? place : null, frac: Number(frac), track }
}

/** A chapter the registry knows, with its units (the light meta is enough). */
export type KnownChapter = (id: string) => { id: string; title: string; units: readonly Pick<LectureMeta['units'][number], 'id' | 'title'>[] } | undefined

/** The full check: the shape, then the chapter and its unit against the registry. Never throws. */
export function parseReturn(raw: unknown, known: KnownChapter): ReturnPlace | null {
  const p = parseReturnSyntax(raw)
  if (!p) return null
  const ch = known(p.chapter)
  if (!ch || ch.id !== p.chapter || !ch.units.some((u) => u.id === p.unit)) return null
  return p
}

export function formatReturn(p: ReturnPlace): string {
  const frac = String(Math.round(Math.min(1, Math.max(0, p.frac)) * 1000) / 1000)
  return [p.course, p.chapter, p.beat ?? p.unit, frac, p.track].join('~')
}

/** The raw `ret` of a router search string ('' → null). Never throws. */
export function retOf(search: string): string | null {
  if (!search.includes('ret=')) return null
  try {
    return new URLSearchParams(search).get('ret')
  } catch {
    return null
  }
}

/** A search string with `ret` set (or removed with null), other parameters kept in order. */
export function withRet(search: string, ret: string | null): string {
  const q = new URLSearchParams(search)
  if (ret === null) q.delete('ret')
  else q.set('ret', ret)
  // `~` and `:` are legal in a query: keep the ids readable (URLSearchParams escapes both)
  const s = q.toString().replace(/%7E/gi, '~').replace(/%3A/gi, ':')
  return s ? `?${s}` : ''
}

/** "step 4" from `q3-bell:b4`, "step 5a" from `…:b5a`; null for a unit. */
export function stepOf(beat: string | null): string | null {
  const m = beat ? BEAT_ID_RE.exec(beat) : null
  return m ? `step ${m[2]}${m[3]}` : null
}
