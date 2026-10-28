/**
 * The 709 Optics Lab's EAGER registry, for tests and DEV tools only (like qc709/notes/index.ts): the app lists optics pages from
 * `meta.generated.ts` and loads each one on demand (content/load.ts). Importing this from application code would put every optics
 * page into one chunk (build/chunks.test.ts rule (r), the optics half).
 *
 * Pages register themselves by file name: `qc709/optics/O3.ts` exports `O3: Lecture` (built by `notesLecture` with `collection: 'optics'`,
 * notes/kit.ts); its numbers live in `O3.values.ts`, which the glob below skips. A new page touches no shared file here.
 */
import type { Lecture } from '../../schema'

const modules = import.meta.glob<Record<string, Lecture>>(['./O[0-9]*.ts', '!./O*.*.ts'], { eager: true })

/** The page id an optics file is named after: './O3.ts' → 'O3'. */
export const opticsIdOfFile = (file: string): string => /\/(O[1-9]\d*)\.ts$/.exec(file)?.[1] ?? ''

/** Every written optics page, in page order. */
export const OPTICS_CHAPTERS: Lecture[] = Object.entries(modules)
  .map(([file, m]) => m[opticsIdOfFile(file)])
  .filter((l): l is Lecture => !!l)
  .sort((a, b) => a.number - b.number)

/** Files the glob found, and the page each one should export (qc709/optics/optics.test.ts and content/meta.test.ts check they agree). */
export const OPTICS_FILES: { file: string; id: string; exported: boolean }[] = Object.entries(modules).map(([file, m]) => ({
  file,
  id: opticsIdOfFile(file),
  exported: !!m[opticsIdOfFile(file)],
}))
