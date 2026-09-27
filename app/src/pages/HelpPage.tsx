import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAllLectures } from '../content/load'
import { Walkthrough } from '../components/ChallengeCard'
import { lecturePath } from '../paths'
import { Rich, Tex } from '../ui/Rich'

const METHOD = [
  { t: 'Name the measurement', d: 'Which observable? Its eigenvalues are the only possible results, and its eigenvectors are the states those results leave behind.' },
  { t: 'Find the amplitudes', d: 'Project the state onto each eigenvector: $c_i = \\langle a_i|\\psi\\rangle$. Mind the complex conjugate on the bra.' },
  { t: 'Square them', d: '$P(a_i) = |c_i|^2$. Check they sum to 1. If not, the state was not normalized or the basis is not complete.' },
  { t: 'Update the state', d: 'After result $a_i$, the state is $|a_i\\rangle$. The next measurement starts from there, not from $|\\psi\\rangle$.' },
]

export function HelpPage() {
  const [open, setOpen] = useState<string | null>(null)
  // the worked solutions are the lectures themselves: each is its own chunk, loaded when this page opens
  const all = useAllLectures()
  return (
    <div className="page help">
      <p className="eyebrow">Help</p>
      <h1>Getting unstuck</h1>
      <section className="method">
        <h2>The four questions behind every measurement problem</h2>
        <ol className="method-steps">
          {METHOD.map((m) => (
            <li key={m.t}>
              <h3>{m.t}</h3>
              <Rich text={m.d} />
            </li>
          ))}
        </ol>
        <p className="small">
          The averages come for free: <Tex>{'\\langle A\\rangle = \\sum_i a_i P(a_i) = \\langle\\psi|A|\\psi\\rangle'}</Tex>.
        </p>
      </section>

      <section className="how">
        <h2>How each challenge helps you</h2>
        <ul>
          <li><strong>Hints come in three rungs</strong>: a nudge, then the key idea, then the setup. Take one at a time.</li>
          <li><strong>Walkthroughs</strong> go one step at a time, and many steps open a live visual set up at the right moment.</li>
          <li><strong>Homework problems</strong> assigned in the notes get hints but no walkthrough.</li>
          <li>Answers accept fractions and roots: <span className="mono">3/4</span>, <span className="mono">√3/2</span>, <span className="mono">cos(pi/8)^2</span>.</li>
        </ul>
      </section>

      <section>
        <h2>All worked solutions</h2>
        {all === 'loading' && <p className="small" aria-busy="true">Loading the worked solutions…</p>}
        {all === 'failed' && <p className="small" role="alert">The worked solutions did not load. Check the connection, then reload the page.</p>}
        {Array.isArray(all) && all.map((l) => (
          <div key={l.id} className="help-lecture">
            <h3>Lecture {l.number}: {l.title}</h3>
            {l.units.map((u) => (
              <div key={u.id} className="help-unit">
                <p className="eyebrow">{u.title}</p>
                <ul className="help-list">
                  {u.play.map((c) => (
                    <li key={c.id}>
                      <button className="help-toggle" aria-expanded={open === c.id} onClick={() => setOpen(open === c.id ? null : c.id)}>
                        <span className="chip">{c.tier}</span> {c.title}
                      </button>
                      {open === c.id && (
                        <div className="help-body">
                          <Rich text={c.prompt} />
                          {c.assigned ? (
                            <>
                              <p className="assigned-note small">Assigned as homework ({c.assigned}): hints only.</p>
                              <ol>{c.hints.map((h, k) => <li key={k}><Rich text={h.text} /></li>)}</ol>
                            </>
                          ) : (
                            <Walkthrough steps={c.walkthrough} startOpen />
                          )}
                          <p className="help-routes">
                            <Link to={lecturePath(l.id, c.id)}>Try it in the lecture →</Link>
                            {' · '}
                            <Link to={lecturePath(l.id, u.id)}>Read the chapter ({u.title}) →</Link>
                          </p>
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        ))}
      </section>
    </div>
  )
}
