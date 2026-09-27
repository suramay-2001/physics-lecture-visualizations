/**
 * Full lectures, one chunk each, loaded on demand (the registry in content/meta.ts lists them without loading).
 * A lecture loads once per session: later visits read the cache synchronously, so a revisit renders at once.
 */
import { useEffect, useReducer, useState } from 'react'
import { LECTURE_META, metaById } from './meta'
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

const cache = new Map<string, Lecture>()
const pending = new Map<string, Promise<Lecture | undefined>>()

/** Registered lecture ids that have a loader (content/meta.test.ts checks the two lists agree). */
export const LOADABLE = Object.keys(LOADERS)

/** The lecture if it is already loaded; never starts a load. */
export const cachedLecture = (id: string): Lecture | undefined => {
  const key = metaById(id)?.id
  return key ? cache.get(key) : undefined
}

/** Load one lecture (case-insensitive id). Resolves undefined for an unknown id; rejects if the chunk fails. */
export function loadLecture(id: string): Promise<Lecture | undefined> {
  const key = metaById(id)?.id
  if (!key || !LOADERS[key]) return Promise.resolve(undefined)
  const hit = cache.get(key)
  if (hit) return Promise.resolve(hit)
  let p = pending.get(key)
  if (!p) {
    p = LOADERS[key]().then(
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

/** Every lecture, in course order (the help page lists all challenges). */
export function useAllLectures(): Lecture[] | 'loading' | 'failed' {
  const [, loaded] = useReducer((n: number) => n + 1, 0)
  const [failed, setFailed] = useState(false)
  const all = LECTURE_META.map((m) => cache.get(m.id))
  const done = all.every(Boolean)
  useEffect(() => {
    if (done) return
    let alive = true
    Promise.all(LECTURE_META.map((m) => loadLecture(m.id))).then(
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
