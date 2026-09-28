/**
 * The Arcade's grouped game list, shared by both courses. 448's `ArcadePage` (main chunk) and 709's `Arcade709`
 * (content/qc709 pages, lazy) each own their page chrome (eyebrow, h1, lede) and pass their own course, chapter
 * groups and games; this file imports no course content itself, so either page can use it without pulling the
 * other course's data into its chunk (chunk contract (h)/(i), build/chunks.test.ts).
 */
import { Link } from 'react-router-dom'
import type { CourseId } from '../content/courses'
import { gamePath } from '../paths'
import { useProgress } from '../progress'
import type { GameEntry } from './games'
import { TrainsLink } from './TrainsLink'

export interface ArcadeGroup {
  id: string
  title: string
}

export function ArcadeGroups({ course, groups, games }: { course: CourseId; groups: ArcadeGroup[]; games: GameEntry[] }) {
  const p = useProgress()
  return (
    <>
      {groups.map((grp) => {
        const gamesFor = games.filter((g) => g.trains.some((t) => t.lecture === grp.id))
        if (!gamesFor.length) return null
        return (
          <section key={grp.id} id={`arcade-${grp.id}`} className="arcade-group" aria-labelledby={`arcade-${grp.id}-title`}>
            <h2 id={`arcade-${grp.id}-title`}>{grp.title}</h2>
            <ul className="arcade-games">
              {gamesFor.map((g) => {
                const cleared = p.games[g.id] ?? 0
                return (
                  <li key={g.id} className="arcade-game">
                    <Link to={gamePath(course, g.id)} className="arcade-card">
                      <span className="fork-kind">{g.levels} levels</span>
                      <span className="fork-title">{g.title}</span>
                      <span className="fork-note">{g.blurb}</span>
                      <span className="arcade-progress mono" aria-label={`${cleared} of ${g.levels} levels cleared`}>
                        {cleared}/{g.levels}
                      </span>
                    </Link>
                    <p className="arcade-trains small">
                      Trains{' '}
                      {g.trains.map((t, i) => (
                        <span key={t.unit}>
                          {i > 0 && ' · '}
                          <TrainsLink t={t} />
                        </span>
                      ))}
                    </p>
                  </li>
                )
              })}
            </ul>
          </section>
        )
      })}
    </>
  )
}
