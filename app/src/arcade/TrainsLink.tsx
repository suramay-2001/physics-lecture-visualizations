import { Link } from 'react-router-dom'
import type { Trains } from './games'
import { metaById } from '../content/meta'
import { lecturePath } from '../paths'

/** Is the chapter built? Its lecture exists in the app and has that unit. */
export const isBuilt = (t: Trains): boolean => !!metaById(t.lecture)?.units.some((u) => u.id === t.unit)

/** A chip naming the chapter a game trains; a link into the lecture when that chapter is built. */
export function TrainsLink({ t }: { t: Trains }) {
  if (!isBuilt(t)) return <span className="trains-chip">{t.label} · ahead of the course</span>
  return (
    <Link className="trains-chip" to={lecturePath(t.lecture, t.unit)}>
      {t.label}
    </Link>
  )
}
