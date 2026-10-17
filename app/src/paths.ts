/**
 * Every in-app URL, in one place (W-709-platform §A "Routes"). Paths are router paths (HashRouter: the app lives
 * after `#`). Physics 448 stays canonical at the root, exactly as before the second course; Physics 709 lives under
 * `/709`. Pure and main-chunk: no content imports, so any page (and the switcher) can build a link.
 *
 *   448: /  /lecture/L3#l3-projectors  /map  /arcade  /arcade/:gameId  /formulas  /help   (+ alias /448/lecture/:id)
 *   709: /709  /709/ch/Q3#q3-…  /709/map  /709/arcade  /709/arcade/:gameId  /709/formulas  /709/help
 *   709 lecture notes: /709/notes  /709/notes/N8#n8-bell  (N8 is the internal id; /709/notes/L8 redirects to it)
 *   Papers: /papers (the shelf)  /papers/ch/P1#p1-…  /papers/refs/P1#ref-…  /papers/prereq/P1   (docs/specs/papers-platform.md §6)
 */
import { COURSES, courseOfId, isNotesId, type CourseId } from './content/courses'

export type CoursePage = 'home' | 'map' | 'arcade' | 'formulas' | 'help' | 'notes'

const withAnchor = (path: string, anchor?: string) => (anchor ? `${path}#${anchor}` : path)

/** A course's page: `coursePath('qc709', 'map')` → `/709/map`; 448's home is `/`. */
export function coursePath(course: CourseId, page: CoursePage = 'home', anchor?: string): string {
  const root = COURSES[course].slug ? `/${COURSES[course].slug}` : ''
  const path = page === 'home' ? root || '/' : `${root}/${page}`
  return withAnchor(path, anchor)
}

/** A chapter page, optionally at a unit / step / challenge anchor; the course follows from the id (L3 / Q3 / F2 / P1 / B1). */
export function lecturePath(id: string, anchor?: string): string {
  const course = courseOfId(id)
  return withAnchor(
    isNotesId(id) ? `/709/notes/${id}` : course === 'qc709' ? `/709/ch/${id}` : course === 'papers' ? `/papers/ch/${id}` : `/lecture/${id}`,
    anchor,
  )
}

/** A Papers chapter's own pages: its References used (R5) and its prerequisite map (R2). */
export type PaperPage = 'refs' | 'prereq'
export const paperPath = (id: string, page: PaperPage, anchor?: string): string => withAnchor(`/papers/${page}/${id}`, anchor)
/** The References page anchor of a reference (paper-local id). */
export const refAnchor = (refId: string): string => `ref-${refId}`

/** An Arcade game of a course. */
export const gamePath = (course: CourseId, gameId: string): string => `${coursePath(course, 'arcade')}/${gameId}`

/** The course a router path belongs to: anything under `/709` is 709, under `/papers` the Papers section; everything else (the canonical root) is 448. */
export const courseOfPath = (pathname: string): CourseId =>
  /^\/709(?:[/?#]|$)/.test(pathname) ? 'qc709' : /^\/papers(?:[/?#]|$)/.test(pathname) ? 'papers' : 'sl448'

/**
 * The course of the page the browser is about to show, from `location.hash` ("#/709/ch/Q3#q3-x", "#/lecture/L1"),
 * for main.tsx to theme the document before the first paint.
 */
export const courseOfHash = (hash: string): CourseId => courseOfPath(hash.replace(/^#/, '').split('?')[0] || '/')
