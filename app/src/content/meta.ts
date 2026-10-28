/**
 * The light lecture registry: everything the pages that LIST lectures need (topbar, home, fork, return bar, Arcade), without
 * the lectures themselves. Each full lecture (story, review, values, challenges) is its own chunk, loaded when its page
 * opens (content/load.ts), so the first paint never waits for the lectures.
 *
 * Two layers, so the main chunk stops growing with each lecture's prose:
 *   - `LECTURE_META` (the main chunk): id, number, title, and per unit its id, title and challenge ids (progress counts);
 *   - `UNIT_DETAIL` (content/meta.detail.generated.ts): each unit's opening question and the equations it leaves on the
 *     board. Physics 448's rides in the lazy 448 pack (content/pack448.ts registers it here) and in the formula sheet's
 *     chunk; 709's chapters carry theirs in their own registry (qc709/meta.generated.ts, `LectureMeta`).
 *
 * Both files are generated from the lectures by content/meta.test.ts (`UPDATE_META=1 npx vitest run
 * src/content/meta.test.ts`); the same test fails whenever a file and the lectures disagree.
 */
import { collectionOfId, courseOfId, metaFor, notesMeta } from './courses'
import { LECTURE_META } from './meta.generated'

/** What a unit's listing needs: its title, and the challenges it holds (a lecture's progress count). */
export interface UnitIndex {
  id: string
  title: string
  /** Challenge ids, for progress counts. */
  challenges: string[]
}

/** A unit's opening question (the fork previews the next lecture's first one) and what it leaves on the board. */
export interface UnitDetail {
  question: string
  /** What the lecture leaves on the board (the formula sheet). */
  equations: string[]
}

export interface UnitMeta extends UnitIndex, UnitDetail {}

/** A chapter as the listing pages see it (448's whole registry is this; 709's `LectureMeta` entries are assignable). */
export interface LectureIndex {
  id: string
  number: number
  title: string
  units: UnitIndex[]
}

/** A chapter with its units' details (709's registry carries them, chapter by chapter, in its own lazy chunk). */
export interface LectureMeta extends LectureIndex {
  units: UnitMeta[]
}

export { LECTURE_META }

export const COURSE = {
  code: 'Physics 448',
  title: 'Spin Lab',
  tagline: 'Quantum mechanics, one silver atom at a time.',
}

/** A chapter of any course (case-insensitive id): 448's lectures, and 709's or the Papers section's once its registry chunk has loaded. */
export const metaById = (id: string): LectureIndex | undefined => {
  const key = id.toLowerCase()
  // a bare chapter id in lower case ('l3', 'q3', 'p1') names the chapter of its upper-case form (the Papers section's
  // lower-case `p1` alone would read as one of Lecture 1's legacy claim keys: content/courses.ts courseOfId)
  const full = /^[a-z]\d+$/.test(id) ? id.toUpperCase() : id
  // 709's lecture notes (N1…) and Optics Lab pages (O1…) are not in the course's chapter list: their own light registries answer (W-709-notes §1)
  const collection = collectionOfId(full.toUpperCase())
  return (collection ? notesMeta(collection) : metaFor(courseOfId(full))).find((l) => l.id.toLowerCase() === key)
}

const details = new Map<string, UnitDetail>()

/** The lazy 448 pack registers `UNIT_DETAIL` here when it loads (content/pack448.ts). */
export function registerUnitDetails(all: Readonly<Record<string, UnitDetail>>): void {
  for (const [id, d] of Object.entries(all)) details.set(id, d)
}

/**
 * A unit's question and board equations: carried by the unit itself (709's registry), else read from what the 448 pack
 * registered. Undefined until a lecture page has loaded the pack (every page that shows a question is inside one).
 */
export const unitDetail = (u: UnitIndex): UnitDetail | undefined => {
  const own = u as Partial<UnitDetail>
  return typeof own.question === 'string' ? { question: own.question, equations: own.equations ?? [] } : details.get(u.id)
}
