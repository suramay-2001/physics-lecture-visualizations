/**
 * Which course the reader is in (W-709-platform §A). Derived from the route: anything under `#/709` is Physics 709,
 * everything else is the canonical Physics 448 root. `CourseProvider` can pin a course for a subtree (a DEV fixture
 * rendered under `/dev/…`, a server-rendered test); without one, `useCourse()` reads the path itself.
 */
import { createContext, useContext, type ReactNode } from 'react'
import { useLocation } from 'react-router-dom'
import type { CourseId } from '../content/courses'
import { courseOfPath } from '../paths'

const Pinned = createContext<CourseId | null>(null)

export function CourseProvider({ course, children }: { course: CourseId; children: ReactNode }) {
  return <Pinned.Provider value={course}>{children}</Pinned.Provider>
}

/** The current course: a pinned one, else the route's. Needs a router above it. */
export function useCourse(): CourseId {
  const pinned = useContext(Pinned)
  const { pathname } = useLocation()
  return pinned ?? courseOfPath(pathname)
}
