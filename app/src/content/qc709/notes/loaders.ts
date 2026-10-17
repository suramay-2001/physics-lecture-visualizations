/**
 * The 709 lecture notes' loaders, found by file name ('./N8.ts' -> N8): each is a dynamic import, so each lecture is its own chunk
 * (build/chunks.test.ts rule (r)); its values file (`N8.values.ts`) is skipped by the glob and rides in the same chunk. This file is
 * imported by 709's registry chunk (qc709/registry.ts), which registers the table with content/load.ts, so the entry carries none of it.
 */
import type { Lecture } from '../../schema'

const modules = import.meta.glob<Record<string, Lecture>>(['./N[0-9]*.ts', '!./N*.*.ts'])

export const NOTES_LOADERS: Record<string, () => Promise<Lecture>> = Object.fromEntries(
  Object.entries(modules).map(([file, load]) => {
    const id = /\/(N[1-9]\d*)\.ts$/.exec(file)?.[1] ?? file
    return [id, () => load().then((m) => m[id])]
  }),
)

/** Registered notes lectures that have a loader: every `qc709/notes/N<k>.ts` the glob found (content/meta.test.ts checks it against the listing). */
export const LOADABLE_NOTES = Object.keys(NOTES_LOADERS)
