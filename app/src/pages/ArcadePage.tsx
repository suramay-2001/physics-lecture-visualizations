/**
 * The Arcade index (Phase 4a item 5): games grouped by the lecture station they train, each with its cleared
 * levels and the chapters it links back into. A chapter that is not built yet is labelled as ahead of the course
 * (TrainsLink); since Lecture 7 every lecture is built, so every group is a built lecture.
 *
 * Main chunk (App.tsx imports this eagerly), so it must never import 709 content (chunk contract (h)): the grouped
 * list itself lives in the course-agnostic `arcade/ArcadeList` and 709's `Arcade709` (content/qc709 pages, lazy)
 * uses the same component with its own games and groups.
 */
import { ArcadeGroups } from '../arcade/ArcadeList'
import { GAMES } from '../arcade/games'
import { LECTURE_META } from '../content/meta'

const GROUPS = LECTURE_META.map((l) => ({ id: l.id, title: `Lecture ${l.number} · ${l.title}` }))

export function ArcadePage() {
  return (
    <div className="page arcade">
      <p className="eyebrow">Arcade</p>
      <h1>Arcade</h1>
      <p className="section-lede">Short rounds built on the same physics engine as the lectures. Every game names the chapter it trains, so you can go back and read it.</p>
      <ArcadeGroups course="sl448" groups={GROUPS} games={GAMES} />
    </div>
  )
}
