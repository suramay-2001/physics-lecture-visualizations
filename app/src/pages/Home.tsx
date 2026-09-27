import { lazy, Suspense } from 'react'
import { Link } from 'react-router-dom'
import { COURSES } from '../content/courses'
import { COURSE, LECTURE_META } from '../content/meta'
import { OPENERS } from '../openers/openerCopy'
import { coursePath, lecturePath } from '../paths'
import { useProgress } from '../progress'
import { useMotionSync } from '../stage/useLiveStage'
import { SGLab } from '../widgets/SGLab'

// The Hopf chapter opener (Blender film, user decision 2026-09-27): lazy, so GSAP and the player stay out of
// the home page's first chunk; its frames start loading only once the page is idle.
const OpenerScrub = lazy(() => import('../openers/OpenerScrub'))

export function Home() {
  const p = useProgress()
  useMotionSync()
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
          {LECTURE_META.map((l) => {
            const ids = l.units.flatMap((u) => u.challenges)
            const solved = ids.filter((id) => p.challenges[id]?.solved).length
            return (
              <li key={l.id} className="station">
                <Link to={lecturePath(l.id)}>
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

      <section className="heading-to" aria-labelledby="heading-to-title">
        <h2 id="heading-to-title">Where this is heading</h2>
        <p className="section-lede">
          Lecture 1 ends at the Bloch sphere: every spin state is a point on its surface. That picture hides something. Behind each point sits a whole circle of state vectors that differ only by a phase no measurement can see. Scroll through the full shape of spin-½ state space; the later lectures build up to it.
        </p>
        <Suspense fallback={null}>
          <OpenerScrub spec={OPENERS.hopf} level={3} />
        </Suspense>
      </section>

      <section className="home-links">
        <Link to={coursePath('sl448', 'arcade')} className="home-card">
          <span className="eyebrow">Arcade</span>
          <span>Puzzles built on the same physics: route beams, steer a state around the Bloch sphere, find the error in a derivation.</span>
        </Link>
        <Link to={coursePath('sl448', 'help')} className="home-card">
          <span className="eyebrow">Help</span>
          <span>Every challenge with a full walkthrough, plus a four-step method for getting unstuck on any measurement problem.</span>
        </Link>
        <Link to={coursePath('sl448', 'map')} className="home-card">
          <span className="eyebrow">Concept map</span>
          <span>How each idea depends on the ones before it, from two spots on a plate to rotation generators.</span>
        </Link>
        <Link to={coursePath('qc709')} className="home-card home-card-709">
          <span className="eyebrow">{COURSES.qc709.code} · {COURSES.qc709.title}</span>
          <span>The second course, one plate colder: qubits, circuits, entanglement and the hardware, starting from the quantum mechanics you learn here.</span>
        </Link>
      </section>
    </div>
  )
}
