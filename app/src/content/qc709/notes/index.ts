/**
 * The 709 lecture notes' EAGER registry, for tests and DEV tools only (like qc709/index.ts): the app lists notes lectures from
 * `meta.generated.ts` and loads each one on demand (content/load.ts). Importing this from application code would put every
 * notes lecture into one chunk (build/chunks.test.ts rule (r)).
 *
 * Lectures register themselves by file name: `qc709/notes/N8.ts` exports `N8: Lecture` (built by `notesLecture`, kit.ts); its
 * numbers live in `N8.values.ts`, which the glob below skips. A new lecture touches no shared file here.
 */
import type { Lecture } from '../../schema'

const modules = import.meta.glob<Record<string, Lecture>>(['./N[0-9]*.ts', '!./N*.*.ts'], { eager: true })

/** The lecture id a notes file is named after: './N8.ts' → 'N8'. */
export const notesIdOfFile = (file: string): string => /\/(N[1-9]\d*)\.ts$/.exec(file)?.[1] ?? ''

/** Every written notes lecture, in lecture order. */
export const NOTES_CHAPTERS: Lecture[] = Object.entries(modules)
  .map(([file, m]) => m[notesIdOfFile(file)])
  .filter((l): l is Lecture => !!l)
  .sort((a, b) => a.number - b.number)

/** Files the glob found, and the lecture each one should export (qc709/notes/notes.test.ts and content/meta.test.ts check they agree). */
export const NOTES_FILES: { file: string; id: string; exported: boolean }[] = Object.entries(modules).map(([file, m]) => ({
  file,
  id: notesIdOfFile(file),
  exported: !!m[notesIdOfFile(file)],
}))

export const notesChapterById = (id: string): Lecture | undefined => NOTES_CHAPTERS.find((l) => l.id.toLowerCase() === id.toLowerCase())
