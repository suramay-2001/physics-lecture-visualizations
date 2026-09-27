/**
 * The topbar's chapter panel for Physics 709 (lazy chunk, loaded when the panel first opens on a 709 page):
 * Foundations first, then the Chapters, from the semester outline. Written chapters are links with their progress;
 * planned ones are listed, not linked, and say so.
 */
import { Link } from 'react-router-dom'
import { metaById } from '../content/meta'
import { PARTS, type OutlineChapter } from '../content/qc709/registry'
import { lecturePath } from '../paths'
import { useProgress } from '../progress'
import '../styles/course709.css'

function Row({ c }: { c: OutlineChapter }) {
  const p = useProgress()
  const meta = c.status === 'built' ? metaById(c.id) : undefined
  if (!meta) {
    return (
      <li className="panel-station" data-status="planned">
        <span className="panel-lecture panel-planned">
          <span className="panel-num">{c.id}</span>
          <span className="panel-title">{c.title}</span>
          <span className="panel-progress">planned</span>
        </span>
      </li>
    )
  }
  const ids = meta.units.flatMap((u) => u.challenges)
  const solved = ids.filter((cid) => p.challenges[cid]?.solved).length
  return (
    <li className="panel-station" data-status="built">
      <Link to={lecturePath(meta.id)} className="panel-lecture">
        <span className="panel-num">{meta.id}</span>
        <span className="panel-title">{meta.title}</span>
        <span className="panel-progress mono" aria-label={`${solved} of ${ids.length} challenges solved`}>
          {solved}/{ids.length}
        </span>
      </Link>
    </li>
  )
}

export default function LecturesPanel709() {
  const foundations = PARTS.filter((p) => p.id === 'F')
  const chapters = PARTS.filter((p) => p.id !== 'F')
  return (
    <div className="panel-709">
      <p className="panel-group">Foundations</p>
      <ol className="panel-line">{foundations.flatMap((p) => p.chapters.map((c) => <Row key={c.id} c={c} />))}</ol>
      <p className="panel-group">Chapters</p>
      <ol className="panel-line">{chapters.flatMap((p) => p.chapters.map((c) => <Row key={c.id} c={c} />))}</ol>
    </div>
  )
}
