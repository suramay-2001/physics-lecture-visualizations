/**
 * Physics 709's EAGER chapter registry, for tests and DEV tools only (like content/index.ts for 448): the app lists
 * chapters from `meta.generated.ts` and loads each one on demand (content/load.ts). Importing this from application
 * code would put every 709 chapter into one chunk.
 *
 * Chapters register themselves by file name, so adding one touches no shared file (W-709-platform §A "Content"):
 * `qc709/Q4.ts` exports `Q4: Lecture` (and `F2.ts` exports `F2`); its story, review, values and glossary live in
 * `Q4.story.ts`, `Q4.review.ts`, `Q4.values.ts`, `Q4.glossary.ts`, which the glob below skips.
 */
import type { Challenge, Lecture } from '../schema'
import { OUTLINE_CHAPTERS } from './outline'

const modules = import.meta.glob<Record<string, Lecture>>(['./[QF]*.ts', '!./*.*.ts'], { eager: true })

/** The chapter id a registry file is named after: './Q4.ts' → 'Q4'. */
export const chapterIdOfFile = (file: string): string => /\/([QF]\d+)\.ts$/.exec(file)?.[1] ?? ''

const order = new Map(OUTLINE_CHAPTERS.map((c, i) => [c.id, i]))

/** Every written 709 chapter, in course order (the outline's). */
export const QC_CHAPTERS: Lecture[] = Object.entries(modules)
  .map(([file, m]) => m[chapterIdOfFile(file)])
  .filter((l): l is Lecture => !!l)
  .sort((a, b) => (order.get(a.id) ?? 1e9) - (order.get(b.id) ?? 1e9))

/** Files the glob found, and the chapter each one should export (content/meta.test.ts checks they agree). */
export const QC_FILES: { file: string; id: string; exported: boolean }[] = Object.entries(modules).map(([file, m]) => ({
  file,
  id: chapterIdOfFile(file),
  exported: !!m[chapterIdOfFile(file)],
}))

export const qcChapterById = (id: string) => QC_CHAPTERS.find((l) => l.id.toLowerCase() === id.toLowerCase())

export function allQcChallenges(): { lecture: Lecture; unitTitle: string; c: Challenge }[] {
  return QC_CHAPTERS.flatMap((lecture) => lecture.units.flatMap((u) => u.play.map((c) => ({ lecture, unitTitle: u.title, c }))))
}
