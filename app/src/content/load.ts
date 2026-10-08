/**
 * Full lectures, one chunk each, loaded on demand (the registry in content/meta.ts lists them without loading).
 * A lecture loads once per session: later visits read the cache synchronously, so a revisit renders at once.
 *
 * Both courses: 448's seven loaders are listed by hand (unchanged); 709's chapters are found by file name
 * (`qc709/Q4.ts` exports `Q4`), so adding a chapter touches no shared file. Each is still its own chunk.
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
}

/** 709 chapters by file name ('./qc709/Q4.ts' → Q4), lazily: each is a dynamic import (its own chunk). */
const QC_MODULES = import.meta.glob<Record<string, Lecture>>(['./qc709/[QF]*.ts', '!./qc709/*.*.ts'])
const QC_LOADERS: Record<string, () => Promise<Lecture>> = Object.fromEntries(
  Object.entries(QC_MODULES).map(([file, load]) => {
    const id = /\/([QF]\d+)\.ts$/.exec(file)?.[1] ?? file
    return [id, () => load().then((m) => m[id])]
  }),
)
const ALL_LOADERS: Record<string, () => Promise<Lecture>> = { ...LOADERS, ...QC_LOADERS }

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

let pack: Promise<unknown> | null = null
/** Physics 709's course pack (glossary, concepts, bridges): one lazy chunk, loaded once (content/qc709/pack.ts). */
export function loadQcPack(): Promise<unknown> {
  pack ??= import('./qc709/pack').catch((e: unknown) => {
    pack = null // a failed chunk may load on the next attempt
    throw e
  })
  return pack
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
    p = ALL_LOADERS[key]().then(devFinish).then(
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
