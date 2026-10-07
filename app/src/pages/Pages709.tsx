/**
 * Physics 709's Map, Arcade, Formulas and Help (W-709-platform §A "Pages"). The Map lists the written chapters'
 * concepts (content/qc709/concepts.ts) with their cross-course links into Spin Lab; the Arcade groups the games by
 * chapter; the Formulas and Help pages read every written chapter (content/load.ts `useAllLectures`, each chapter its
 * own lazy chunk) and follow the reader's track. Lazy chunk (App.tsx): nothing here reaches 448's first paint.
 */
import { useState, type ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ArcadeGroups } from '../arcade/ArcadeList'
import { HelpChallenge } from '../components/HelpChallenge'
import { TrackToggle } from '../components/TrackToggle'
import { CONCEPTS } from '../content/concepts'
import { chapterName, COURSES, metaFor, type Track } from '../content/courses'
import { useAllLectures } from '../content/load'
import { LECTURE_META, metaById } from '../content/meta'
import { boardFor } from '../content/qc709/boards'
import { QC_CONCEPTS } from '../content/qc709/concepts'
import { QC_GAMES } from '../content/qc709/games'
import { OUTLINE_CHAPTERS } from '../content/qc709/registry'
import type { Lecture } from '../content/schema'
import { coursePath, lecturePath } from '../paths'
import '../styles/course709.css'
import { usePlaces } from '../ui/lastPlace'
import { Tex } from '../ui/Rich'
import { TrackContext, useTrack } from '../ui/trackPref'
import { useQcPack } from './useQcPack'

/** Where a Spin Lab concept sits on 448's map: its lecture line (the anchor `map-L2`) and its unit number ("2.3"). */
function twinPlace(conceptId: string): { anchor: string; unitNumber: string; label: string } | null {
  const c = CONCEPTS.find((x) => x.id === conceptId)
  const l = c && LECTURE_META.find((m) => m.id === c.lecture)
  const k = c && l ? l.units.findIndex((u) => u.id === c.unit) : -1
  return c && l && k >= 0 ? { anchor: `map-${l.id}`, unitNumber: `${l.number}.${k + 1}`, label: c.label } : null
}

/**
 * The 709 concept map (ruling 6 of docs/roles/decisions/qc709-pilots.md): each written chapter is a line, each of its
 * concepts a station linking into its unit, with the stations it builds on said in words. A concept that is a Spin Lab
 * concept (`QcConcept.sameAs`) carries a dashed cross-course link to that station's line on Spin Lab's map, labelled
 * "met in Spin Lab 2.3".
 */
export function Map709() {
  const written = OUTLINE_CHAPTERS.filter((ch) => ch.status === 'built' && QC_CONCEPTS.some((c) => c.chapter === ch.id))
  const labelOf = (id: string) => QC_CONCEPTS.find((c) => c.id === id)?.label ?? id
  return (
    <div className="page page-709 map-page map-709">
      <p className="eyebrow">{COURSES.qc709.code} · Map</p>
      <h1>Concept map</h1>
      <p className="section-lede">
        Each written chapter is a line and each of its ideas a station. A dashed link marks an idea you may already have met in Spin Lab (Physics 448), and
        leads to it on Spin Lab’s map.
      </p>
      <ol className="map-lines">
        {written.map((ch) => (
          <li key={ch.id} id={`map709-${ch.id}`} className="map-line" data-built="true">
            <div className="map-lecture">
              <span className="map-num">{ch.id}</span>
              <span className="map-title">
                <Link to={lecturePath(ch.id)}>{ch.title}</Link>
              </span>
            </div>
            <ol className="map-stations">
              {QC_CONCEPTS.filter((c) => c.chapter === ch.id).map((c) => {
                const twin = c.sameAs ? twinPlace(c.sameAs) : null
                const needs = c.needs.map(labelOf).join('; ')
                return (
                  <li key={c.id}>
                    <Link className="map-station" data-concept={c.id} to={lecturePath(ch.id, c.unit)} title={needs ? `Builds on: ${needs}` : undefined}>
                      {c.label}
                    </Link>
                    {twin && (
                      <Link
                        className="map-twin"
                        data-twin={c.sameAs}
                        to={coursePath('sl448', 'map', twin.anchor)}
                        aria-label={`Met in Spin Lab ${twin.unitNumber}: ${twin.label}. Open Spin Lab’s concept map.`}
                      >
                        met in Spin Lab {twin.unitNumber}
                      </Link>
                    )}
                  </li>
                )
              })}
            </ol>
          </li>
        ))}
      </ol>
      <div className="coming-709" role="note">
        <p>Chapters still being written add their stations here as they land.</p>
        <p>
          <Link to={coursePath('qc709')}>See the chapter plan on the course home</Link>
        </p>
      </div>
    </div>
  )
}

/**
 * The 709 Arcade (F1 + Q1 pilots, docs/roles/proposals/P-F1-story.md §11.2, P-Q1-story.md §11.2): the ten pilot
 * levels, grouped by chapter the same way 448's Arcade is (arcade/ArcadeList, shared). Chapters not written yet
 * have no games and drop out of the list, the same rule `ArcadeGroups` already applies for 448.
 */
export function Arcade709() {
  const groups = metaFor('qc709').map((l) => ({ id: l.id, title: `${chapterName(l.id)} · ${l.title}` }))
  return (
    <div className="page page-709">
      <p className="eyebrow">
        {COURSES.qc709.code} · Arcade
      </p>
      <h1>Arcade</h1>
      <p className="section-lede">Short rounds built on the same physics engine as the chapters. Every game names the chapter it trains, so you can go back and read it.</p>
      <ArcadeGroups course="qc709" groups={groups} games={QC_GAMES} />
    </div>
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
        <TrackToggle course="qc709" track={track} />
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
 * The 709 Help page (the 448 page's counterpart, with the same shared row, components/HelpChallenge.tsx): every
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
                            <HelpChallenge key={c.id} c={c} chapter={l.id} unit={u} open={open === c.id} onToggle={() => setOpen(open === c.id ? null : c.id)} />
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
