/**
 * Physics 709's Map, Arcade, Formulas and Help (W-709-platform §A "Pages"). The Map lists the written chapters'
 * concepts (content/qc709/concepts.ts) with their cross-course links into Spin Lab; the other pages still say what
 * they will hold and point back to the course home, and grow out of the course pack (content/qc709/pack.ts) as
 * chapters land. Lazy chunk (App.tsx): nothing here reaches 448's first paint.
 */
import { Link } from 'react-router-dom'
import { CONCEPTS } from '../content/concepts'
import { COURSES } from '../content/courses'
import { LECTURE_META } from '../content/meta'
import { QC_CONCEPTS } from '../content/qc709/concepts'
import { OUTLINE_CHAPTERS } from '../content/qc709/registry'
import { coursePath, lecturePath } from '../paths'
import '../styles/course709.css'

function Coming709({ eyebrow, title, lede, holds }: { eyebrow: string; title: string; lede: string; holds: string }) {
  return (
    <div className="page page-709">
      <p className="eyebrow">
        {COURSES.qc709.code} · {eyebrow}
      </p>
      <h1>{title}</h1>
      <p className="section-lede">{lede}</p>
      <div className="coming-709" role="note">
        <p className="eyebrow">Coming with the first chapters</p>
        <p>{holds}</p>
        <p>
          <Link to={coursePath('qc709')}>See the chapter plan on the course home</Link>
        </p>
      </div>
    </div>
  )
}

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

export function Arcade709() {
  return (
    <Coming709
      eyebrow="Arcade"
      title="Arcade"
      lede="Short rounds on the same engine as the chapters: circuits to complete, states to prepare, derivations with one wrong step."
      holds="Every game names the chapter it trains. The first games arrive with the qubit and circuit chapters."
    />
  )
}

export function Formulas709() {
  return (
    <Coming709
      eyebrow="Formulas"
      title="The boards"
      lede="Every equation the chapters leave on the board, in order and in both tracks, ready to print."
      holds="Each written chapter adds its board here, linked back to the step it comes from."
    />
  )
}

export function Help709() {
  return (
    <Coming709
      eyebrow="Help"
      title="Getting unstuck"
      lede="Worked walkthroughs for every challenge, and a way back to the step you were on."
      holds="Homework problems assigned in the course get hints only, never a walkthrough."
    />
  )
}
