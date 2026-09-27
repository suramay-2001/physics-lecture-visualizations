/**
 * The end of a lecture is a fork, not a pager (Phase 4a item 3, D-nav-story §3.2): where to take what you just
 * read — the next lecture, the games that train this one, its formula board, its place on the concept map —
 * and the way back. Lectures that are not built yet are said to be in preparation, never linked.
 *
 * Course-aware (W-709-platform §A): the chapter's own course supplies the list, the words ("Lecture 3" /
 * "Chapter Q3") and the links (paths.ts). 448's fork reads exactly as before.
 */
import { Link } from 'react-router-dom'
import { COURSE_LECTURES } from '../content/concepts'
import { COURSES, courseOfId, metaFor } from '../content/courses'
import { loadLecture } from '../content/load'
import { Rich } from '../ui/Rich'
import type { LectureMeta } from '../content/meta'
import type { Lecture } from '../content/schema'
import { coursePath, lecturePath } from '../paths'

/** The last chapter of 709's semester map (content/qc709/outline.ts; its test pins the order). */
const LAST_709 = 'Q25'

export function LectureFork({ lecture }: { lecture: Lecture }) {
  const course = courseOfId(lecture.id)
  const list = metaFor(course)
  const noun = COURSES[course].noun.one
  // 448 names a lecture by its number, 709 by its id (Q3, F2)
  const label = (l: { id: string; number: number }) => (course === 'sl448' ? String(l.number) : l.id)
  const i = list.findIndex((l) => l.id === lecture.id)
  const prev: LectureMeta | undefined = i >= 0 ? list[i - 1] : undefined
  const next: LectureMeta | undefined = i >= 0 ? list[i + 1] : undefined
  // the course's last lecture has no successor to promise
  const last = course === 'sl448' ? lecture.number >= Math.max(...COURSE_LECTURES.map((l) => l.number)) : lecture.id === LAST_709
  const me = `${noun} ${label(lecture)}`
  return (
    <nav className="lecture-fork" aria-labelledby={`${lecture.id}-fork-title`}>
      <p className="eyebrow">
        End of {noun.toLowerCase()} {label(lecture)}
      </p>
      <h2 id={`${lecture.id}-fork-title`}>Where next</h2>
      <ol className="fork-routes">
        <li>
          {next ? (
            <Link to={lecturePath(next.id)} className="fork-route" onMouseEnter={() => void loadLecture(next.id).catch(() => {})} onFocus={() => void loadLecture(next.id).catch(() => {})}>
              <span className="fork-kind">Next {noun.toLowerCase()}</span>
              <span className="fork-title">
                {label(next)}. {next.title}
              </span>
              {next.units[0] && <Rich as="span" className="fork-note" text={next.units[0].question} />}
            </Link>
          ) : last ? (
            <Link to={coursePath(course, 'map')} className="fork-route">
              <span className="fork-kind">End of the course</span>
              <span className="fork-title">See the whole course on one map</span>
              <span className="fork-note">
                Every idea from {noun} {list[0] ? label(list[0]) : label(lecture)} to {me}, and what each one builds on.
              </span>
            </Link>
          ) : (
            <div className="fork-route" aria-disabled="true">
              <span className="fork-kind">Next {noun.toLowerCase()}</span>
              <span className="fork-title">{course === 'sl448' ? `Lecture ${lecture.number + 1} is in preparation` : 'The next chapter is in preparation'}</span>
              <span className="fork-note">It is built next, in the same story format.</span>
            </div>
          )}
        </li>
        <li>
          <Link to={coursePath(course, 'arcade', `arcade-${lecture.id}`)} className="fork-route">
            <span className="fork-kind">Arcade</span>
            <span className="fork-title">Games that train {me}</span>
            <span className="fork-note">Short rounds built on the same physics engine.</span>
          </Link>
        </li>
        <li>
          <Link to={coursePath(course, 'formulas', `formulas-${lecture.id}`)} className="fork-route">
            <span className="fork-kind">Formula board</span>
            <span className="fork-title">Every equation from {me}</span>
            <span className="fork-note">In order, printable.</span>
          </Link>
        </li>
        <li>
          <Link to={coursePath(course, 'map', `map-${lecture.id}`)} className="fork-route">
            <span className="fork-kind">Concept map</span>
            <span className="fork-title">Where {me} sits</span>
            <span className="fork-note">What it builds on, and what builds on it.</span>
          </Link>
        </li>
      </ol>
      {prev && (
        <p className="fork-back">
          <Link to={lecturePath(prev.id)}>
            ← {noun} {label(prev)}: {prev.title}
          </Link>
        </p>
      )}
    </nav>
  )
}
