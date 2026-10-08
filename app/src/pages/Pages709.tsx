/**
 * Physics 709's Map and Arcade (W-709-platform §A "Pages"). The Map lists the written chapters' concepts
 * (content/qc709/concepts.ts) with their cross-course links into Spin Lab; the Arcade groups the games by chapter.
 * The Formulas and Help pages, which read every written chapter, are in pages/Reading709.tsx. Lazy chunk (App.tsx):
 * nothing here reaches 448's first paint.
 */
import { Link } from 'react-router-dom'
import { ArcadeGroups } from '../arcade/ArcadeList'
import { CONCEPTS } from '../content/concepts'
import { chapterName, COURSES, metaFor } from '../content/courses'
import { LECTURE_META } from '../content/meta'
import { QC_CONCEPTS } from '../content/qc709/concepts'
import { QC_GAMES } from '../content/qc709/games'
import { OUTLINE_CHAPTERS } from '../content/qc709/registry'
import { coursePath, lecturePath } from '../paths'
import '../styles/course709.css'

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

