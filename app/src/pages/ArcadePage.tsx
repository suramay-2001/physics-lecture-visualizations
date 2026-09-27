/**
 * The Arcade index (Phase 4a item 5): games grouped by the lecture station they train, each with its cleared
 * levels and the chapters it links back into. A chapter that is not built yet is labelled as ahead of the course
 * (TrainsLink); since Lecture 7 every lecture is built, so every group is a built lecture.
 */
import { Link } from 'react-router-dom'
import { GAMES } from '../arcade/games'
import { TrainsLink } from '../arcade/TrainsLink'
import { LECTURE_META } from '../content/meta'
import { useProgress } from '../progress'

const GROUPS = LECTURE_META.map((l) => ({ id: l.id, title: `Lecture ${l.number} · ${l.title}` }))

export function ArcadePage() {
  const p = useProgress()
  return (
    <div className="page arcade">
      <p className="eyebrow">Arcade</p>
      <h1>Arcade</h1>
      <p className="section-lede">Short rounds built on the same physics engine as the lectures. Every game names the chapter it trains, so you can go back and read it.</p>
      {GROUPS.map((grp) => {
        const games = GAMES.filter((g) => g.trains.some((t) => t.lecture === grp.id))
        if (!games.length) return null
        return (
          <section key={grp.id} id={`arcade-${grp.id}`} className="arcade-group" aria-labelledby={`arcade-${grp.id}-title`}>
            <h2 id={`arcade-${grp.id}-title`}>{grp.title}</h2>
            <ul className="arcade-games">
              {games.map((g) => {
                const cleared = p.games[g.id] ?? 0
                return (
                  <li key={g.id} className="arcade-game">
                    <Link to={`/arcade/${g.id}`} className="arcade-card">
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
    </div>
  )
}
