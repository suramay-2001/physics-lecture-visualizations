/**
 * Physics 709's Formulas and Help pages: the two pages that read every written chapter (content/load.ts
 * `useAllLectures`, each chapter its own lazy chunk) and follow the reader's track. Their own lazy chunk (App.tsx), apart
 * from the Map and Arcade (pages/Pages709.tsx). The challenge row mirrors 448's (pages/HelpPage.tsx) and is not shared with
 * it, and the walkthrough component is loaded on demand: a lazy chunk that imports both `components/ChallengeCard` (which
 * brings the widget registry) and `content/load` statically makes the bundler split the entry chunk into more files,
 * which costs the first paint ~2 KB gzip (build/chunks.test.ts (l), (g)).
 */
import { lazy, Suspense, useState, type ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { chapterName, COURSES, type Track } from '../content/courses'
import { useAllLectures } from '../content/load'
import { metaById } from '../content/meta'
import { boardFor } from '../content/qc709/boards'
// registers the 709 chapter list (metaFor('qc709')) that useAllLectures reads, whichever page the reader opened first
import '../content/qc709/registry'
import type { Challenge, Lecture } from '../content/schema'
import { lecturePath } from '../paths'
import '../styles/course709.css'
import { usePlaces } from '../ui/lastPlace'
import { Rich, Tex } from '../ui/Rich'
import { TrackContext, useTrack } from '../ui/trackPref'
import { useQcPack } from './useQcPack'

// the track toggle is loaded on demand too (same reason): it is the one other import that splits the entry chunk
const TrackToggle = lazy(() => import('../components/TrackToggle').then((m) => ({ default: m.TrackToggle })))
const Walkthrough = lazy(() => import('../components/ChallengeCard').then((m) => ({ default: m.Walkthrough })))

/**
 * One challenge on the Help page: a toggle, and when open the prompt, then the walkthrough, or, for a challenge the course
 * assigns as homework (`assigned`), the three hints only. This is where the 709 Help page decides that (it mirrors the
 * row in 448's pages/HelpPage.tsx); an assigned challenge never reaches `Walkthrough`, even if its data carried steps.
 * Both ways back to the chapter are links: the challenge itself in its unit, and the unit.
 */
export function HelpChallenge709({
  c,
  chapter,
  unit,
  open,
  onToggle,
}: {
  c: Challenge
  chapter: string
  unit: { id: string; title: string }
  open: boolean
  onToggle: () => void
}) {
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
            <Suspense
              fallback={
                <p className="small" aria-busy="true">
                  Loading the walkthrough…
                </p>
              }
            >
              <Walkthrough steps={c.walkthrough} startOpen />
            </Suspense>
          )}
          <p className="help-routes">
            <Link to={lecturePath(chapter, c.id)}>Try it in {chapterName(chapter)} →</Link>
            {' · '}
            <Link to={lecturePath(chapter, unit.id)}>Read the unit ({unit.title}) →</Link>
          </p>
        </div>
      )}
    </li>
  )
}

/** The loading and failed states of a page that reads every chapter (the wording of 448's Help page). */
function AllChapters({ all, what, children }: { all: ReturnType<typeof useAllLectures>; what: string; children: (lectures: Lecture[]) => ReactNode }) {
  if (all === 'loading')
    return (
      <p className="small" aria-busy="true">
        Loading {what}…
      </p>
    )
  if (all === 'failed')
    return (
      <p className="small" role="alert">
        {what.charAt(0).toUpperCase() + what.slice(1)} did not load. Check the connection, then reload the page.
      </p>
    )
  return <>{children(all)}</>
}

const TRACK_NAME: Record<Track, string> = { ground: 'Ground-up', formal: 'Formal' }

/**
 * The 709 formula boards (the 448 sheet's counterpart): for each written chapter in course order, each unit's board in
 * the track the reader is on (the toggle on the page, which is the same stored choice the chapters use). Every line
 * links back to where it comes from: a derivation's result to its beat, a review-card line to the unit's review card.
 * Print-ready: the toggle and the chrome drop out of print (styles/print.css), the track's name stays.
 */
export function Formulas709() {
  const { search } = useLocation()
  const track = useTrack('qc709', search)
  const all = useAllLectures('qc709')
  return (
    <div className="page page-709 formulas formulas-709" data-track={track}>
      <p className="eyebrow">{COURSES.qc709.code} · Formulas</p>
      <h1>The boards</h1>
      <p className="section-lede">
        Every equation the chapters leave on the board, in order and in the track you read. Each line links back to the step it comes from. Use your
        browser’s print command for a paper copy.
      </p>
      <div className="formulas-tools">
        <Suspense fallback={null}>
          <TrackToggle course="qc709" track={track} />
        </Suspense>
      </div>
      <p className="small formulas-track">
        Showing the {TRACK_NAME[track]} track. A derivation’s result is the same in both tracks; the review lines and the number of lines in each derivation
        are the track’s own.
      </p>
      <AllChapters all={all} what="the boards">
        {(lectures) =>
          lectures.map((l) => (
            <section key={l.id} className="formula-lecture" id={`formulas-${l.id}`} aria-labelledby={`formulas-${l.id}-h`}>
              <h2 id={`formulas-${l.id}-h`}>
                {chapterName(l.id)}: {l.title}
              </h2>
              {boardFor(l, track).map((u) => (
                <div key={u.id} className="formula-unit" data-unit={u.id}>
                  <Link to={lecturePath(l.id, u.id)} className="eyebrow">
                    {u.title}
                  </Link>
                  {u.lines.map((line, k) => (
                    <div key={k} className="formula-line" data-kind={line.kind}>
                      <Tex display>{line.tex}</Tex>
                      <Link className="formula-src small" to={line.beat ? { pathname: lecturePath(l.id), search: `?at=${line.beat}` } : lecturePath(l.id, `${u.id}-review`)}>
                        {line.beat ? `Derived in ${line.steps} ${line.steps === 1 ? 'line' : 'lines'}` : 'Review card'}
                      </Link>
                    </div>
                  ))}
                </div>
              ))}
            </section>
          ))
        }
      </AllChapters>
    </div>
  )
}

/**
 * The 709 Help page (the 448 page's counterpart, with its own row, HelpChallenge709): every
 * challenge of every written chapter, grouped by chapter and unit, each opening to its prompt and its walkthrough and
 * linking back to its chapter. A challenge the course assigns as homework opens to its three hints only, never a
 * walkthrough. The way back to where the reader was comes from the stored last place (ui/lastPlace.ts). Waits for the
 * course pack first: the prose uses 709's glossary and bridges.
 */
export function Help709() {
  const { search } = useLocation()
  const track = useTrack('qc709', search)
  const [pack, retry] = useQcPack(true)
  const all = useAllLectures('qc709')
  const here = usePlaces().qc709
  const [open, setOpen] = useState<string | null>(null)
  const hereChapter = here ? metaById(here.chapter) : undefined
  const hereUnit = hereChapter?.units.find((u) => u.id === here?.unit)
  return (
    <div className="page page-709 help help-709">
      <p className="eyebrow">{COURSES.qc709.code} · Help</p>
      <h1>Getting unstuck</h1>
      <p className="section-lede">Hints and a worked walkthrough for every challenge, grouped by chapter, and a way back to the step you were on.</p>
      {here && hereChapter && (
        <p className="help-back">
          <Link to={lecturePath(here.chapter, hereUnit?.id)}>
            Back to where you were: {chapterName(here.chapter)}
            {hereUnit ? `, ${hereUnit.title}` : ''} →
          </Link>
        </p>
      )}

      <section className="how">
        <h2>How each challenge helps you</h2>
        <ul>
          <li><strong>Hints come in three rungs</strong>: a nudge, then the key idea, then the setup. Take one at a time.</li>
          <li><strong>Walkthroughs</strong> go one step at a time, and many steps open a live visual set up at the right moment.</li>
          <li><strong>Homework problems</strong> the course assigns get hints but no walkthrough.</li>
          <li>Answers accept fractions and roots: <span className="mono">3/4</span>, <span className="mono">√3/2</span>, <span className="mono">cos(pi/8)^2</span>.</li>
        </ul>
      </section>

      <section>
        <h2>All worked solutions</h2>
        {pack === 'failed' ? (
          <p className="small" role="alert">
            The worked solutions did not load. Check the connection, then{' '}
            <button type="button" className="topbar-button" onClick={retry}>
              try again
            </button>
            .
          </p>
        ) : pack === 'loading' ? (
          <p className="small" aria-busy="true">
            Loading the worked solutions…
          </p>
        ) : (
          <AllChapters all={all} what="the worked solutions">
            {(lectures) => (
              <TrackContext.Provider value={track}>
                <nav className="help-jump" aria-label="Chapters">
                  {lectures.map((l) => (
                    <button key={l.id} type="button" className="chip" onClick={() => document.getElementById(`help-${l.id}`)?.scrollIntoView({ block: 'start' })}>
                      {l.id}
                    </button>
                  ))}
                </nav>
                {lectures.map((l) => (
                  <div key={l.id} className="help-lecture" id={`help-${l.id}`}>
                    <h3>
                      {chapterName(l.id)}: {l.title}
                    </h3>
                    {l.units.map((u) => (
                      <div key={u.id} className="help-unit">
                        <p className="eyebrow">{u.title}</p>
                        <ul className="help-list">
                          {u.play.map((c) => (
                            <HelpChallenge709 key={c.id} c={c} chapter={l.id} unit={u} open={open === c.id} onToggle={() => setOpen(open === c.id ? null : c.id)} />
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                ))}
              </TrackContext.Provider>
            )}
          </AllChapters>
        )}
      </section>
    </div>
  )
}
