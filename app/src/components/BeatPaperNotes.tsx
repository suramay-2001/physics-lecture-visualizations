/**
 * A Papers beat's two extra lines (rulings papers.md R3, R5; docs/specs/papers-platform.md §2), in Story mode, Read mode and
 * print, both tracks:
 *   - the paper's OWN numbers (`Beat.reported`): a block of its own with a "Reported" badge, the value exactly as printed
 *     and its exact location, in a style no engine number uses; a screen reader hears "Reported by the paper, Figure 3b,
 *     page 9:" first. Never mixed with the beat's claims (the engine's numbers).
 *   - the reference trail (`Beat.trail`): one compact line "This step relies on Bravyi et al. 2024, §2 — why", whose link
 *     opens that reference's entry on the paper's References page.
 * Entry chunk (the shared story renders it), so it stays small; it renders nothing for a beat without either field.
 */
import { Fragment } from 'react'
import { Link, useInRouterContext } from 'react-router-dom'
import { reportedWhere, type Beat, type ReportedClaim } from '../content/stage'
import { paperPath, refAnchor } from '../paths'
import { Rich } from '../ui/Rich'

/** 'p1-checks:b2' → 'P1': the chapter whose References page lists the beat's references. */
const chapterOfBeat = (beatId: string): string => beatId.split('-')[0].toUpperCase()

/** "Figure 3b, page 9" for a screen reader ("p." read aloud is "p"). */
const spokenWhere = (at: ReportedClaim['at']): string => reportedWhere(at).replace(/\bp\. (\d+)$/, 'page $1')

function RefLink({ to, children }: { to: string; children: string }) {
  // outside a router (server-rendered tests, print figures) the same link is a plain hash anchor
  return useInRouterContext() ? (
    <Link className="trail-ref" to={to}>
      {children}
    </Link>
  ) : (
    <a className="trail-ref" href={`#${to}`}>
      {children}
    </a>
  )
}

export function BeatPaperNotes({ beat }: { beat: Pick<Beat, 'id' | 'trail' | 'reported'> }) {
  const reported = beat.reported ?? []
  const trail = beat.trail ?? []
  if (!reported.length && !trail.length) return null
  const chapter = chapterOfBeat(beat.id)
  return (
    <div className="paper-notes">
      {reported.length > 0 && (
        <ul className="reported-list" aria-label="Numbers reported by the paper">
          {reported.map((r) => (
            <li key={r.id} className="reported" data-reported={r.id}>
              <span className="reported-badge" aria-hidden="true">
                Reported
              </span>
              <span className="visually-hidden">{`Reported by the paper, ${spokenWhere(r.at)}: `}</span>
              <span className="reported-text">{r.text}</span>
              <span className="reported-value">{r.value}</span>
              <span className="reported-where" aria-hidden="true">
                {reportedWhere(r.at)}
              </span>
            </li>
          ))}
        </ul>
      )}
      {trail.length > 0 && (
        <p className="trail-line">
          <span className="trail-label">This step relies on </span>
          {trail.map((t, i) => (
            <Fragment key={`${t.ref}-${i}`}>
              {i > 0 && '; '}
              <RefLink to={paperPath(chapter, 'refs', refAnchor(t.ref))}>{t.label ?? t.ref}</RefLink>
              {`, ${t.at}`}
              <span className="trail-why">
                {' — '}
                <Rich as="span" text={t.why} />
              </span>
            </Fragment>
          ))}
        </p>
      )}
    </div>
  )
}
