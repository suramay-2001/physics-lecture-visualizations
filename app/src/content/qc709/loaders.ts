/**
 * The 709 chapters' loaders, found by file name ('./Q4.ts' -> Q4, './F1.ts' -> F1): each is a dynamic import, so each chapter is its own chunk
 * (build/chunks.test.ts rule (d)); its values, story, review and glossary files are skipped by the glob and ride in the same chunk. This file is
 * imported by 709's registry chunk (qc709/registry.ts), which registers the table with content/load.ts, exactly as for the lecture notes
 * (notes/loaders.ts) and the Optics Lab (optics/loaders.ts), so the entry carries no per-chapter table and a new chapter costs it nothing
 * (build/chunks.test.ts rule (l)). A 709 chapter is only ever loaded after the registry has registered the chapter list (`metaById`), so the
 * table is always there when it is read.
 */
import type { Lecture } from '../schema'

const modules = import.meta.glob<Record<string, Lecture>>(['./[QF]*.ts', '!./*.*.ts'])

export const QC_LOADERS: Record<string, () => Promise<Lecture>> = Object.fromEntries(
  Object.entries(modules).map(([file, load]) => {
    const id = /\/([QF]\d+)\.ts$/.exec(file)?.[1] ?? file
    return [id, () => load().then((m) => m[id])]
  }),
)

/** The 709 chapters that have a loader: every `qc709/Q{n}.ts` and `F{n}.ts` the glob found (content/meta.test.ts checks it against the listing). */
export const LOADABLE_709 = Object.keys(QC_LOADERS)
