import { Link, useParams } from 'react-router-dom'
import { LECTURES, lectureById } from '../content'
import { UnitView } from '../components/UnitView'
import { RefList } from '../components/RefList'
import { Rich } from '../ui/Rich'

export function LecturePage() {
  const { id = 'L1' } = useParams()
  const lecture = lectureById(id)
  if (!lecture) {
    return (
      <div className="page">
        <h1>No lecture called “{id}”</h1>
        <p><Link to="/">Back to the lecture list</Link></p>
      </div>
    )
  }
  const i = LECTURES.indexOf(lecture)
  const prev = LECTURES[i - 1]
  const next = LECTURES[i + 1]

  return (
    <div className="lecture">
      <header className="lecture-head">
        <p className="eyebrow">Lecture {lecture.number}{lecture.date ? ` · ${lecture.date}` : ''}</p>
        <h1>{lecture.title}</h1>
        <div className="outcomes">
          <span className="eyebrow">After this lecture you can</span>
          <ul>
            {lecture.outcomes.map((o, k) => <li key={k}>{o}</li>)}
          </ul>
        </div>
      </header>

      <div className="lecture-layout">
        <nav className="unit-rail" aria-label="Units in this lecture">
          <ol>
            {lecture.units.map((u, k) => (
              <li key={u.id}><a href={`#/lecture/${lecture.id}#${u.id}`} onClick={(e) => { e.preventDefault(); document.getElementById(u.id)?.scrollIntoView({ behavior: 'smooth' }) }}>
                <span className="mono">{lecture.number}.{k + 1}</span> {u.title}
              </a></li>
            ))}
          </ol>
          {lecture.watch && (
            <div className="rail-watch">
              <span className="eyebrow">Watch alongside</span>
              <RefList refs={lecture.watch} compact />
            </div>
          )}
        </nav>

        <div className="lecture-body">
          {lecture.corrections && lecture.corrections.length > 0 && (
            <aside className="errata" aria-label="Errata">
              <span className="eyebrow">Errata found while building this page</span>
              {lecture.corrections.map((c, k) => (
                <div key={k} className="erratum">
                  <p><span className="mono">{c.where}</span>: the notes say “<Rich text={c.says} as="span" />”</p>
                  <p><strong>Should read:</strong> <Rich text={c.shouldSay} as="span" /></p>
                </div>
              ))}
            </aside>
          )}
          {lecture.units.map((u, k) => (
            <UnitView key={u.id} unit={u} index={`${lecture.number}.${k + 1}`} />
          ))}
          <nav className="lecture-pager" aria-label="Other lectures">
            {prev ? <Link to={`/lecture/${prev.id}`} className="btn ghost">← Lecture {prev.number}: {prev.title}</Link> : <span />}
            {next && <Link to={`/lecture/${next.id}`} className="btn">Lecture {next.number}: {next.title} →</Link>}
          </nav>
        </div>
      </div>
    </div>
  )
}
