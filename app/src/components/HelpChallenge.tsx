import { Link } from 'react-router-dom'
import { chapterName, courseOfId } from '../content/courses'
import type { Challenge } from '../content/schema'
import { lecturePath } from '../paths'
import { Rich } from '../ui/Rich'
import { Walkthrough } from './ChallengeCard'

/**
 * One challenge on a Help page, shared by both courses: a toggle, and when open the prompt, then the walkthrough, or,
 * for a challenge the course assigns as homework (`assigned`), the three hints only. This is the one place the Help
 * pages decide that: an assigned challenge never reaches `Walkthrough` here, even if its data carried steps.
 * Both ways back to the chapter are links (the unit, and the challenge itself in its unit).
 */
export function HelpChallenge({
  c,
  chapter,
  unit,
  open,
  onToggle,
}: {
  c: Challenge
  /** The chapter id: L2 / Q3 / F1. */
  chapter: string
  unit: { id: string; title: string }
  open: boolean
  onToggle: () => void
}) {
  const is448 = courseOfId(chapter) === 'sl448'
  return (
    <li>
      <button className="help-toggle" aria-expanded={open} onClick={onToggle}>
        <span className="chip">{c.tier}</span> {c.title}
      </button>
      {open && (
        <div className="help-body">
          <Rich text={c.prompt} />
          {c.assigned ? (
            <>
              <p className="assigned-note small">Assigned as homework ({c.assigned}): hints only.</p>
              <ol>
                {c.hints.map((h, k) => (
                  <li key={k}>
                    <Rich text={h.text} />
                  </li>
                ))}
              </ol>
            </>
          ) : (
            <Walkthrough steps={c.walkthrough} startOpen />
          )}
          <p className="help-routes">
            <Link to={lecturePath(chapter, c.id)}>{is448 ? 'Try it in the lecture →' : `Try it in ${chapterName(chapter)} →`}</Link>
            {' · '}
            <Link to={lecturePath(chapter, unit.id)}>{is448 ? `Read the chapter (${unit.title}) →` : `Read the unit (${unit.title}) →`}</Link>
          </p>
        </div>
      )}
    </li>
  )
}
