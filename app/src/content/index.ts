import type { Challenge, Lecture } from './schema'
import { L1 } from './L1'
import { L2 } from './L2'
import { L3 } from './L3'
import { L4 } from './L4'
import { L5 } from './L5'
import { L6 } from './L6'
import { L7 } from './L7'

/** The eager registry, for tests and DEV tools only: the app loads each lecture on demand (content/load.ts) and lists
 *  them from content/meta.ts. Importing this from application code would put every lecture back in the main chunk. */
export { COURSE } from './meta'

export const LECTURES: Lecture[] = [L1, L2, L3, L4, L5, L6, L7]

export const lectureById = (id: string) => LECTURES.find((l) => l.id.toLowerCase() === id.toLowerCase())

export function allChallenges(): { lecture: Lecture; unitTitle: string; c: Challenge }[] {
  return LECTURES.flatMap((lecture) =>
    lecture.units.flatMap((u) => u.play.map((c) => ({ lecture, unitTitle: u.title, c }))),
  )
}
