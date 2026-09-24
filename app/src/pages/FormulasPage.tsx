import { Link } from 'react-router-dom'
import { LECTURES } from '../content'
import { Tex } from '../ui/Rich'

/** The end-of-lecture boards, collected. Print-friendly (see @media print in app.css). */
export function FormulasPage() {
  return (
    <div className="page formulas">
      <p className="eyebrow">Formula sheet</p>
      <h1>The boards</h1>
      <p className="section-lede">Every equation the lectures leave on the board, in order. Use your browser's print command for a paper copy.</p>
      {LECTURES.map((l) => (
        <section key={l.id} className="formula-lecture">
          <h2>Lecture {l.number}</h2>
          {l.units.filter((u) => u.lecture.equations?.length).map((u) => (
            <div key={u.id} className="formula-unit">
              <Link to={`/lecture/${l.id}#${u.id}`} className="eyebrow">{u.title}</Link>
              {u.lecture.equations!.map((e, k) => <Tex key={k} display>{e}</Tex>)}
            </div>
          ))}
        </section>
      ))}
    </div>
  )
}
