/**
 * Put the document in a course's identity (W-709-platform §D): `<html data-course>` selects styles/theme-cryostat.css
 * for 709 (448 matches none of its rules), the tab title names the course, and 709's faces start loading (a lazy
 * stylesheet, styles/fonts709.ts, fetched once). main.tsx calls it from the URL before React's first render; App.tsx
 * calls it again on every course change.
 */
import { COURSES, type CourseId } from '../content/courses'

let fonts709: Promise<unknown> | null = null

export function applyCourseTheme(course: CourseId): void {
  if (typeof document === 'undefined') return
  const root = document.documentElement
  if (root.dataset.course !== course) root.dataset.course = course
  document.title = `${COURSES.sl448.title} — ${COURSES[course].code}`
  if (course === 'qc709') {
    fonts709 ??= import('./fonts709').catch(() => {
      fonts709 = null // offline or a redeploy: the fallbacks stay readable; the next course change retries
    })
  }
}
