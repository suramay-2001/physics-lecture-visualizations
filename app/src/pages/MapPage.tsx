/**
 * The Concept map (Phase 4a item 6, D-nav-story §3.3): the course as beamlines. Each lecture is a row, its concepts
 * are stations on that row's line; built concepts link into their chapter, planned ones say "in preparation".
 * Focus or hover a station: silver lines are drawn from what it builds on (solid) and to what builds on it
 * (dashed), and the same relations are said in words (polite live region) — the picture is never the only channel.
 * The picture itself is components/ConceptLines.tsx, shared with the Papers section's prerequisite maps.
 */
import { LECTURE_META } from '../content/meta'
import { COURSE_LECTURES, CONCEPTS } from '../content/concepts'
import { ConceptLines, type ConceptLine, type ConceptStation } from '../components/ConceptLines'
import { lecturePath } from '../paths'
import { useHashScroll } from './useHashScroll'

export function MapPage() {
  useHashScroll()
  const built = new Set(LECTURE_META.map((l) => l.id))
  const lines: ConceptLine[] = COURSE_LECTURES.map((l) => ({ id: l.id, anchor: `map-${l.id}`, num: String(l.number), title: l.title, built: built.has(l.id), to: lecturePath(l.id) }))
  const stations: ConceptStation[] = CONCEPTS.map((c) => ({
    id: c.id,
    line: c.lecture,
    label: c.label,
    to: c.unit && built.has(c.lecture) ? lecturePath(c.lecture, c.unit) : undefined,
    needs: c.needs,
  }))

  return (
    <div className="page map-page">
      <p className="eyebrow">Concept map</p>
      <h1>Concept map</h1>
      <p className="section-lede">
        The course as beamlines: each lecture a line, each idea a station. Hover or focus a station to see what it builds on (solid) and what builds on it (dashed).
        {COURSE_LECTURES.some((l) => !built.has(l.id)) && ' Dashed stations belong to lectures still in preparation.'}
      </p>
      <ConceptLines lines={lines} stations={stations} />
    </div>
  )
}
