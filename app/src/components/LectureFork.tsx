/**
 * The end of a lecture is a fork, not a pager (Phase 4a item 3, D-nav-story §3.2): where to take what you just
 * read — the next lecture, the games that train this one, its formula board, its place on the concept map —
 * and the way back. Lectures that are not built yet are said to be in preparation, never linked.
 */
import { Link } from 'react-router-dom'
import { LECTURES } from '../content'
import { COURSE_LECTURES } from '../content/concepts'
import type { Lecture } from '../content/schema'

export function LectureFork({ lecture }: { lecture: Lecture }) {
  const i = LECTURES.indexOf(lecture)
  const prev = i >= 0 ? LECTURES[i - 1] : undefined
  const next = i >= 0 ? LECTURES[i + 1] : undefined
  // the course's last lecture has no successor to promise
  const last = lecture.number >= Math.max(...COURSE_LECTURES.map((l) => l.number))
  return (
    <nav className="lecture-fork" aria-labelledby={`${lecture.id}-fork-title`}>
      <p className="eyebrow">End of lecture {lecture.number}</p>
      <h2 id={`${lecture.id}-fork-title`}>Where next</h2>
      <ol className="fork-routes">
        <li>
          {next ? (
            <Link to={`/lecture/${next.id}`} className="fork-route">
              <span className="fork-kind">Next lecture</span>
              <span className="fork-title">
                {next.number}. {next.title}
              </span>
              <span className="fork-note">{next.units[0]?.question}</span>
            </Link>
          ) : last ? (
            <Link to="/map" className="fork-route">
              <span className="fork-kind">End of the course</span>
              <span className="fork-title">See the whole course on one map</span>
              <span className="fork-note">Every idea from Lecture 1 to Lecture {lecture.number}, and what each one builds on.</span>
            </Link>
          ) : (
            <div className="fork-route" aria-disabled="true">
              <span className="fork-kind">Next lecture</span>
              <span className="fork-title">Lecture {lecture.number + 1} is in preparation</span>
              <span className="fork-note">It is built next, in the same story format.</span>
            </div>
          )}
        </li>
        <li>
          <Link to={`/arcade#arcade-${lecture.id}`} className="fork-route">
            <span className="fork-kind">Arcade</span>
            <span className="fork-title">Games that train Lecture {lecture.number}</span>
            <span className="fork-note">Short rounds built on the same physics engine.</span>
          </Link>
        </li>
        <li>
          <Link to={`/formulas#formulas-${lecture.id}`} className="fork-route">
            <span className="fork-kind">Formula board</span>
            <span className="fork-title">Every equation from Lecture {lecture.number}</span>
            <span className="fork-note">In order, printable.</span>
          </Link>
        </li>
        <li>
          <Link to={`/map#map-${lecture.id}`} className="fork-route">
            <span className="fork-kind">Concept map</span>
            <span className="fork-title">Where Lecture {lecture.number} sits</span>
            <span className="fork-note">What it builds on, and what builds on it.</span>
          </Link>
        </li>
      </ol>
      {prev && (
        <p className="fork-back">
          <Link to={`/lecture/${prev.id}`}>
            ← Lecture {prev.number}: {prev.title}
          </Link>
        </p>
      )}
    </nav>
  )
}
