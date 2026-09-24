import type { Challenge, Lecture } from './schema'
import { L1 } from './L1'

export const COURSE = {
  code: 'Physics 448',
  title: 'Spin Lab',
  tagline: 'Quantum mechanics, one silver atom at a time.',
}

export const LECTURES: Lecture[] = [L1]

export const lectureById = (id: string) => LECTURES.find((l) => l.id.toLowerCase() === id.toLowerCase())

export function allChallenges(): { lecture: Lecture; unitTitle: string; c: Challenge }[] {
  return LECTURES.flatMap((lecture) =>
    lecture.units.flatMap((u) => u.play.map((c) => ({ lecture, unitTitle: u.title, c }))),
  )
}
