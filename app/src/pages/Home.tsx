import { Link } from 'react-router-dom'
import { COURSE, LECTURES } from '../content'
import { useProgress } from '../progress'
import { SGLab } from '../widgets/SGLab'

export function Home() {
  const p = useProgress()
  return (
    <div className="home">
      <section className="hero">
        <p className="eyebrow">{COURSE.code} · interactive notes</p>
        <h1>
          Two spots.
          <br />
          <span className="hero-sub">Nothing in between.</span>
        </h1>
        <p className="hero-lede">
          Fire silver atoms through a magnet and every one lands in one of two places. The rest of the course is about what that single fact forces a theory to look like: complex vectors, operators, measurement, rotation.
        </p>
        <SGLab axes={['z', 'x']} keep={['+']} editable maxDevices={3} />
        <p className="hero-hint small">Try it: fire one atom, then a thousand. Add a third magnet and ask whether the atoms still remember they were "up".</p>
      </section>

      <section className="beamline" aria-labelledby="lectures-title">
        <h2 id="lectures-title">The lectures</h2>
        <p className="section-lede">Each lecture follows the same path: what the notes say, what the books add, a visual to play with, clues toward the intuition, then challenges with worked help.</p>
        <ol className="stations">
          {LECTURES.map((l) => {
            const ids = l.units.flatMap((u) => u.play.map((c) => c.id))
            const solved = ids.filter((id) => p.challenges[id]?.solved).length
            return (
              <li key={l.id} className="station">
                <Link to={`/lecture/${l.id}`}>
                  <span className="station-num">{l.number}</span>
                  <span className="station-body">
                    <span className="station-title">{l.title}</span>
                    <span className="station-units">{l.units.map((u) => u.title).join(' · ')}</span>
                  </span>
                  <span className="station-progress mono" aria-label={`${solved} of ${ids.length} challenges solved`}>
                    {solved}/{ids.length}
                  </span>
                </Link>
              </li>
            )
          })}
        </ol>
      </section>

      <section className="home-links">
        <Link to="/arcade" className="home-card">
          <span className="eyebrow">Arcade</span>
          <span>Puzzles built on the same physics: route beams, steer a state around the Bloch sphere, find the error in a derivation.</span>
        </Link>
        <Link to="/help" className="home-card">
          <span className="eyebrow">Help</span>
          <span>Every challenge with a full walkthrough, plus a four-step method for getting unstuck on any measurement problem.</span>
        </Link>
        <Link to="/map" className="home-card">
          <span className="eyebrow">Concept map</span>
          <span>How each idea depends on the ones before it, from two spots on a plate to rotation generators.</span>
        </Link>
      </section>
    </div>
  )
}
