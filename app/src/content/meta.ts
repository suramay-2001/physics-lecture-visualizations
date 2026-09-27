/**
 * The light lecture registry: everything the pages that LIST lectures need (topbar, home, map, Arcade, fork,
 * formula sheet), without the lectures themselves. Each full lecture (story, review, values, challenges) is its own
 * chunk, loaded when its page opens (content/load.ts), so the first paint never waits for seven lectures.
 *
 * `LECTURE_META` is generated from the lectures by content/meta.test.ts (`UPDATE_META=1 npx vitest run
 * src/content/meta.test.ts`); the same test fails whenever the file and the lectures disagree.
 */
import { LECTURE_META } from './meta.generated'

export interface UnitMeta {
  id: string
  title: string
  /** The unit's opening question (the fork previews the next lecture's first one). */
  question: string
  /** Challenge ids, for progress counts. */
  challenges: string[]
  /** What the lecture leaves on the board (the formula sheet). */
  equations: string[]
}

export interface LectureMeta {
  id: string
  number: number
  title: string
  units: UnitMeta[]
}

export { LECTURE_META }

export const COURSE = {
  code: 'Physics 448',
  title: 'Spin Lab',
  tagline: 'Quantum mechanics, one silver atom at a time.',
}

export const metaById = (id: string): LectureMeta | undefined => LECTURE_META.find((l) => l.id.toLowerCase() === id.toLowerCase())
