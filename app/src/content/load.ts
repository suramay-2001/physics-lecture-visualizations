/**
 * Full lectures, one chunk each, loaded on demand (the registry in content/meta.ts lists them without loading).
 * A lecture loads once per session: later visits read the cache synchronously, so a revisit renders at once.
 *
 * Every course: 448's loaders are listed by hand (unchanged); 709's chapters are found by file name
 * (`qc709/Q4.ts` exports `Q4`), and so are the Papers section's specs (`papers/P1.paper.ts` exports `P1`), so adding a
 * chapter touches no shared file. Each is still its own chunk.
 */
import { useEffect, useReducer, useState } from 'react'
import { metaFor, type CourseId } from './courses'
import { metaById } from './meta'
import type { Lecture } from './schema'

/** One dynamic import per lecture: Vite splits each into its own chunk (checked by build/chunks.test.ts). */
const LOADERS: Record<string, () => Promise<Lecture>> = {
  L1: () => import('./L1').then((m) => m.L1),
  L2: () => import('./L2').then((m) => m.L2),
  L3: () => import('./L3').then((m) => m.L3),
  L4: () => import('./L4').then((m) => m.L4),
  L5: () => import('./L5').then((m) => m.L5),
  L6: () => import('./L6').then((m) => m.L6),
  L7: () => import('./L7').then((m) => m.L7),
  L8: () => import('./L8').then((m) => m.L8),
  L9: () => import('./L9').then((m) => m.L9),
  L10: () => import('./L10').then((m) => m.L10),
  L11: () => import('./L11').then((m) => m.L11),
  L12: () => import('./L12').then((m) => m.L12),
}

/** 709 chapters by file name ('./qc709/Q4.ts' → Q4), lazily: each is a dynamic import (its own chunk). */
const QC_MODULES = import.meta.glob<Record<string, Lecture>>(['./qc709/[QF]*.ts', '!./qc709/*.*.ts'])
const QC_LOADERS: Record<string, () => Promise<Lecture>> = Object.fromEntries(
  Object.entries(QC_MODULES).map(([file, load]) => {
    const id = /\/([QF]\d+)\.ts$/.exec(file)?.[1] ?? file
    return [id, () => load().then((m) => m[id])]
  }),
)
/**
 * Papers chapters by file name ('./papers/P1.paper.ts' → P1), lazily: each spec is its own chunk, compiled on load by the
 * lazy papers platform (papers/compile.ts: validate, then run the allow-listed recipes). docs/specs/papers-platform.md §1.
 */
const PAPER_MODULES = import.meta.glob<Record<string, unknown>>('./papers/[PB]*.paper.ts')
const PAPER_LOADERS: Record<string, () => Promise<Lecture>> = Object.fromEntries(
  Object.entries(PAPER_MODULES).map(([file, load]) => {
    const id = /\/([PB]\d+)\.paper\.ts$/.exec(file)?.[1] ?? file
    return [id, () => Promise.all([load(), import('../papers/compile')]).then(([m, c]) => c.compilePaper(m[id]).lecture)]
  }),
)
const ALL_LOADERS: Record<string, () => Promise<Lecture>> = { ...LOADERS, ...QC_LOADERS, ...PAPER_LOADERS }

/**
 * DEV only, and only when a test asks (`window.__devChip448 = true`, set by e2e/bridge.spec.ts before the page loads):
 * Lecture 5 gets a temporary "Go further in 709" chip aimed at the demo chapter Q0, so the 448 → 709 bridge and its return
 * bar can be exercised on a real lecture page before a real chip exists (W-448 #4). Off by default: a developer browsing
 * the real lectures never sees it. `import.meta.env.DEV` is false in a build, so this branch and the fixture import are
 * dropped (chunk rule (k)).
 */
const devFinish = async (l: Lecture): Promise<Lecture> =>
  import.meta.env.DEV && (globalThis as { __devChip448?: boolean }).__devChip448 ? (await import('./__fixtures__/devBridge448')).withDevChip(l) : l

const cache = new Map<string, Lecture>()
const pending = new Map<string, Promise<Lecture | undefined>>()

/** Registered lecture ids that have a loader (content/meta.test.ts checks the two lists agree). */
export const LOADABLE = Object.keys(LOADERS)
/** The same for 709: every chapter file the glob found. */
export const LOADABLE_709 = Object.keys(QC_LOADERS)
/** The same for the Papers section: every spec file the glob found. */
export const LOADABLE_PAPERS = Object.keys(PAPER_LOADERS)

let slPack: Promise<unknown> | null = null
/**
 * Physics 448's pack (its glossary): one lazy chunk, loaded once (content/pack448.ts). Every chapter's load includes it
 * (a lecture is never on the page before its glossary popovers), and 709's pack imports it too (qc709/pack.ts), because a
 * 709 chapter may cite a Spin Lab term; the main chunk carries neither, so it does not grow with each lecture.
 */
export function loadSlPack(): Promise<unknown> {
  slPack ??= import('./pack448').catch((e: unknown) => {
    slPack = null // a failed chunk may load on the next attempt
    throw e
  })
  return slPack
}

let pack: Promise<unknown> | null = null
/** Physics 709's course pack (glossary, concepts, bridges): one lazy chunk, loaded once (content/qc709/pack.ts). */
export function loadQcPack(): Promise<unknown> {
  pack ??= import('./qc709/pack').catch((e: unknown) => {
    pack = null // a failed chunk may load on the next attempt
    throw e
  })
  return pack
}

let papersPack: Promise<unknown> | null = null
/** The Papers section's pack (glossaries, bridges): one lazy chunk, loaded once (content/papers/pack.ts). */
export function loadPapersPack(): Promise<unknown> {
  papersPack ??= import('./papers/pack').catch((e: unknown) => {
    papersPack = null // a failed chunk may load on the next attempt
    throw e
  })
  return papersPack
}

/** The lecture if it is already loaded; never starts a load. */
export const cachedLecture = (id: string): Lecture | undefined => {
  const key = metaById(id)?.id
  return key ? cache.get(key) : undefined
}

/** Load one lecture (case-insensitive id). Resolves undefined for an unknown id; rejects if the chunk fails. */
export function loadLecture(id: string): Promise<Lecture | undefined> {
  const key = metaById(id)?.id
  if (!key || !ALL_LOADERS[key]) return Promise.resolve(undefined)
  const hit = cache.get(key)
  if (hit) return Promise.resolve(hit)
  let p = pending.get(key)
  if (!p) {
    // the lecture's chunk and the 448 pack (its glossary) arrive together: both are fetched in parallel
    p = Promise.all([ALL_LOADERS[key](), loadSlPack()]).then(([l]) => devFinish(l)).then(
      (l) => {
        cache.set(key, l)
        pending.delete(key)
        return l
      },
      (e: unknown) => {
        pending.delete(key) // a failed chunk may load on the next attempt (offline, a redeploy)
        throw e
      },
    )
    pending.set(key, p)
  }
  return p
}

export type LectureLoad =
  | { status: 'ready'; lecture: Lecture }
  | { status: 'loading' }
  | { status: 'missing' }
  | { status: 'failed'; retry: () => void }

/** The lecture for a route id: ready at once when cached, otherwise loading until its chunk arrives. */
export function useLecture(id: string): LectureLoad {
  const key = metaById(id)?.id
  const [attempt, retry] = useReducer((n: number) => n + 1, 0)
  const [, loaded] = useReducer((n: number) => n + 1, 0)
  const [failed, setFailed] = useState<{ key: string; attempt: number } | null>(null)
  useEffect(() => {
    if (!key || cache.has(key)) return
    let alive = true
    loadLecture(key).then(
      () => alive && loaded(),
      () => alive && setFailed({ key, attempt }),
    )
    return () => {
      alive = false
    }
  }, [key, attempt])
  if (!key) return { status: 'missing' }
  const hit = cache.get(key)
  if (hit) return { status: 'ready', lecture: hit }
  if (failed && failed.key === key && failed.attempt === attempt) return { status: 'failed', retry }
  return { status: 'loading' }
}

/** Every lecture of a course, in course order (the help page lists all challenges). */
export function useAllLectures(course: CourseId = 'sl448'): Lecture[] | 'loading' | 'failed' {
  const [, loaded] = useReducer((n: number) => n + 1, 0)
  const [failed, setFailed] = useState(false)
  const list = metaFor(course)
  const all = list.map((m) => cache.get(m.id))
  const done = all.every(Boolean)
  useEffect(() => {
    if (done) return
    let alive = true
    Promise.all(list.map((m) => loadLecture(m.id))).then(
      () => alive && loaded(),
      () => alive && setFailed(true),
    )
    return () => {
      alive = false
    }
  }, [done])
  if (done) return all as Lecture[]
  return failed ? 'failed' : 'loading'
}
