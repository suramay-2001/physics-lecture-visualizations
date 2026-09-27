import { Link } from 'react-router-dom'
import type { Trains } from './games'

/** A chip naming the chapter a game trains; a link into the lecture when that lecture is built. */
export function TrainsLink({ t }: { t: Trains }) {
  if (t.lecture !== 'L1') return <span className="trains-chip">{t.label} · ahead of the course</span>
  return (
    <Link className="trains-chip" to={`/lecture/${t.lecture}#${t.unit}`}>
      {t.label}
    </Link>
  )
}
