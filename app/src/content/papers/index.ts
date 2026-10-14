/**
 * The Papers section's EAGER registry, for tests and DEV tools only (like content/qc709/index.ts): the app lists chapters
 * from `meta.generated.ts` and loads each spec on demand (content/load.ts). Importing this from application code would put
 * every paper into one chunk.
 *
 * Specs register themselves by file name: `papers/P1.paper.ts` exports `P1: PaperSpec` (and `B2.paper.ts` exports `B2`), its
 * glossary lives in `P1.glossary.ts`. Each spec is compiled here exactly as the loader compiles it (papers/compile.ts).
 */
import { mergeValues } from '../claimKit'
import type { Lecture } from '../schema'
import { compilePaper, paperIdOfFile, type CompiledPaper } from '../../papers/compile'
import type { PaperSpec } from '../../papers/spec'

const modules = import.meta.glob<Record<string, unknown>>('./[PB]*.paper.ts', { eager: true })

/** Files the glob found, the chapter each should export, and the export itself (content/meta.test.ts checks they agree). */
export const PAPER_FILES: { file: string; id: string; spec: unknown }[] = Object.entries(modules).map(([file, m]) => ({ file, id: paperIdOfFile(file), spec: m[paperIdOfFile(file)] }))

const order = (id: string) => (id.startsWith('B') ? 1000 : 0) + Number(id.slice(1))

/** Every compiled chapter (papers first, then background chapters), in id order. */
export const PAPERS_COMPILED: CompiledPaper[] = PAPER_FILES.filter((f) => f.spec !== undefined)
  .sort((a, b) => order(a.id) - order(b.id))
  .map((f) => compilePaper(f.spec))

export const PAPER_SPECS: PaperSpec[] = PAPERS_COMPILED.map((c) => c.spec)
export const PAPER_CHAPTERS: Lecture[] = PAPERS_COMPILED.map((c) => c.lecture)
/** Every computed claim's engine value (keys `p1…`, `b1…`), one key space with both courses' (content/values.ts). */
export const PAPER_VALUES = mergeValues(...PAPERS_COMPILED.map((c) => c.values))

export const paperChapterById = (id: string): Lecture | undefined => PAPER_CHAPTERS.find((l) => l.id.toLowerCase() === id.toLowerCase())
