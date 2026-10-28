/**
 * The 709 Optics Lab's loaders, found by file name ('./O3.ts' -> O3): each is a dynamic import, so each page is its own chunk
 * (build/chunks.test.ts rule (r)); its values file (`O3.values.ts`) is skipped by the glob and rides in the same chunk. This file is
 * imported by 709's registry chunk (qc709/registry.ts), which registers the table with content/load.ts, so the entry carries none of it.
 */
import type { Lecture } from '../../schema'

const modules = import.meta.glob<Record<string, Lecture>>(['./O[0-9]*.ts', '!./O*.*.ts'])

export const OPTICS_LOADERS: Record<string, () => Promise<Lecture>> = Object.fromEntries(
  Object.entries(modules).map(([file, load]) => {
    const id = /\/(O[1-9]\d*)\.ts$/.exec(file)?.[1] ?? file
    return [id, () => load().then((m) => m[id])]
  }),
)

/** Registered optics pages that have a loader: every `qc709/optics/O<k>.ts` the glob found (content/meta.test.ts checks it against the listing). */
export const LOADABLE_OPTICS = Object.keys(OPTICS_LOADERS)
