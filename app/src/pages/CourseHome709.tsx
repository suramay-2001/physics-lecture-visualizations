/**
 * Physics 709 home: the approved Cryostat "descent" (docs/roles/proposals/D-709-identity.md §4–§6 and its mockup).
 * A navy hero with "where you stopped", then the chandelier index: six gilt plates narrowing downward, copper coax
 * with attenuators, the chip at the bottom, and beside each plate its two Parts with their chapters. Planned chapters
 * are listed, not linked. Gilt and copper are chrome only: none of it ever reaches a stage (styles/theme.test.ts).
 *
 * Motion (closed list, D §7): one microwave pulse down the coax, 9 s loop, only while the reader's Motion is on
 * (html[data-motion='on']) and the OS does not ask for reduced motion.
 * Lazy chunk with the 709 registry (App.tsx); its styles (styles/course709.css) load with it.
 */
import { Link } from 'react-router-dom'
import { COURSES } from '../content/courses'
import { metaById, type LectureMeta } from '../content/meta'
import { PARTS, PLATES, placeOf, type OutlineChapter, type PlateId } from '../content/qc709/registry'
import { coursePath, lecturePath } from '../paths'
import { useProgress } from '../progress'
import { useMotionSync } from '../stage/useLiveStage'
import { usePlaces } from '../ui/lastPlace'
import '../styles/course709.css'

/** How each plate is drawn (D's mockup): width of the plate and of the rods below it, attenuators, the cold finger. */
const DRAW: { readonly [K in PlateId]: { w: number; wn: number; steel?: true; finger?: true; att: readonly ('a1' | 'a2')[] } } = {
  '300K': { w: 100, wn: 86, steel: true, att: [] },
  '50K': { w: 86, wn: 72, att: [] },
  '4K': { w: 72, wn: 58, att: ['a1', 'a2'] },
  '800mK': { w: 58, wn: 46, att: ['a1'] },
  '100mK': { w: 46, wn: 36, att: [] },
  '10mK': { w: 36, wn: 30, finger: true, att: ['a1', 'a2'] },
}

type State = 'done' | 'prog' | 'new' | 'planned'

function stateOf(meta: LectureMeta | undefined, solvedIds: (id: string) => boolean, lastChapter?: string): { state: State; note: string } {
  if (!meta) return { state: 'planned', note: 'planned' }
  const ids = meta.units.flatMap((u) => u.challenges)
  const solved = ids.filter(solvedIds).length
  if (ids.length > 0 && solved === ids.length) return { state: 'done', note: 'done' }
  if (solved > 0 || lastChapter === meta.id) return { state: 'prog', note: ids.length ? `${solved} of ${ids.length}` : 'started' }
  return { state: 'new', note: '' }
}

function ChapterRow({ c, lastChapter }: { c: OutlineChapter; lastChapter?: string }) {
  const p = useProgress()
  const meta = c.status === 'built' ? metaById(c.id) : undefined
  const { state, note } = stateOf(meta, (id) => !!p.challenges[id]?.solved, lastChapter)
  const body = (
    <>
      <span className="cr-st" data-st={state} aria-hidden="true" />
      <span className="cr-ch-id">{c.id}</span>
      <span className="cr-ch-title">{c.title}</span>
      <span className="cr-ch-state">{note}</span>
    </>
  )
  return (
    <li className="cr-ch" data-state={state}>
      {meta ? (
        <Link to={lecturePath(meta.id)} className="cr-ch-row">
          {body}
        </Link>
      ) : (
        <span className="cr-ch-row">{body}</span>
      )}
    </li>
  )
}

function Resume() {
  const here = usePlaces().qc709
  const meta = here ? metaById(here.chapter) : undefined
  const place = meta ? placeOf(meta.id) : undefined
  if (meta && place) {
    const k = here?.unit ? meta.units.findIndex((u) => u.id === here.unit) : -1
    return (
      <aside className="cr-resume" aria-labelledby="cr-resume-h">
        <p className="eyebrow" id="cr-resume-h">
          Where you stopped
        </p>
        <p className="cr-resume-where">
          <span className="cr-resume-temp">{place.plate.temp}</span> {place.part.label} · {place.part.title}
        </p>
        <p className="cr-resume-title">
          {meta.id} · {meta.title}
        </p>
        {k >= 0 && <p className="cr-resume-step">{meta.units[k].title}</p>}
        <Link className="cr-btn cr-btn-gilt" to={lecturePath(meta.id, k >= 0 ? meta.units[k].id : undefined)}>
          Continue
        </Link>
      </aside>
    )
  }
  const first = PARTS[0].chapters[0]
  return (
    <aside className="cr-resume" aria-labelledby="cr-resume-h">
      <p className="eyebrow" id="cr-resume-h">
        Where it starts
      </p>
      <p className="cr-resume-where">
        <span className="cr-resume-temp">{PLATES[0].temp}</span> {PARTS[0].label} · {PARTS[0].title}
      </p>
      <p className="cr-resume-title">
        {first.id} · {first.title}
      </p>
      <p className="cr-resume-step">The first chapters are being written now. Spin Lab (Physics 448) already covers the quantum mechanics of the top plate.</p>
      <Link className="cr-btn cr-btn-line" to={coursePath('sl448')}>
        Open Spin Lab
      </Link>
    </aside>
  )
}

export default function CourseHome709() {
  useMotionSync()
  const last = usePlaces().qc709?.chapter
  const c = COURSES.qc709
  return (
    <div className="cr-home">
      <section className="cr-hero cr-chrome" aria-labelledby="cr-home-h1">
        <div className="cr-hero-grid">
          <div>
            <p className="eyebrow">
              {c.code} · {c.fullTitle} · Fall 2026
            </p>
            <h1 id="cr-home-h1">
              Ten millikelvin.<span className="cr-h1-sub">Twelve parts on the way down.</span>
            </h1>
            <p className="cr-lede">
              A quantum computer’s chip sits on the coldest plate of a dilution refrigerator, under five warmer ones. This course takes the same route: it starts at
              room temperature with the quantum mechanics you already know, and goes one plate colder every two parts, down to the qubit hardware itself.
            </p>
          </div>
          <Resume />
        </div>
      </section>

      <section className="cr-descent cr-chrome" aria-labelledby="cr-descent-h">
        <div className="cr-descent-head">
          <div className="cr-wrap">
          <h2 id="cr-descent-h">Six plates, twelve parts</h2>
          <p>Each plate of the refrigerator holds two parts of the course. Every plate is colder than the one above it, and the course goes down in order.</p>
          <ul className="cr-legend" aria-label="Key">
            <li>
              <span className="cr-st" data-st="done" aria-hidden="true" />
              Done
            </li>
            <li>
              <span className="cr-st" data-st="prog" aria-hidden="true" />
              In progress
            </li>
            <li>
              <span className="cr-st" data-st="new" aria-hidden="true" />
              Not started
            </li>
            <li>
              <span className="cr-st" data-st="planned" aria-hidden="true" />
              Planned, not written yet
            </li>
          </ul>
          </div>
        </div>

        <div className="cr-plates-wrap">
          <div className="cr-coax" aria-hidden="true">
            <span className="cr-sma a1" />
            <span className="cr-sma a2" />
            <svg className="cr-pulse" viewBox="0 0 15 34">
              <path
                d="M7.5 0 L7.5 3 L7.3 4.5 L7.5 5.5 L8.2 7 L7.8 8 L6.4 9 L5.7 10 L6.2 10.5 L7.5 11 L9.1 11.5 L10.5 12 L11.1 12.5 L10.5 13 L8.7 13.5 L6.2 14 L3.8 14.5 L2.5 15 L2.7 15.5 L4.6 16 L7.5 16.5 L10.5 17 L12.5 17.5 L12.8 18 L11.5 18.5 L8.9 19 L6.1 19.5 L4 20 L3.3 20.5 L3.9 21 L5.5 21.5 L7.5 22 L9.1 22.5 L9.9 23 L9.8 23.5 L9 24 L8 24.5 L7.1 25 L6.5 25.5 L6.7 26.5 L7.5 27.5 L7.8 28.5 L7.5 30 L7.4 32 L7.5 34"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          <ol className="cr-plates">
            {PLATES.map((plate) => {
              const d = DRAW[plate.id]
              return (
                <li key={plate.id} className="cr-plate-row" data-plate={plate.id} style={{ '--w': `${d.w}%`, '--wn': `${d.wn}%` } as React.CSSProperties}>
                  <div className="cr-plate-temp">
                    <p className="cr-temp">
                      <span aria-hidden="true">{plate.temp}</span>
                      <span className="visually-hidden">{plate.spoken}</span>
                    </p>
                    <p className="cr-stage-name">{plate.name}</p>
                    <p className="cr-stage-why">{plate.why}</p>
                  </div>
                  <div className="cr-plate-draw" aria-hidden="true">
                    <span className={d.steel ? 'cr-plate cr-steel' : 'cr-plate'} />
                    {d.finger ? <span className="cr-finger" /> : <span className="cr-rods" />}
                    {d.att.map((a) => (
                      <span key={a} className={`cr-att ${a}`} />
                    ))}
                  </div>
                  <div className="cr-parts">
                    {plate.parts.map((pid) => {
                      const part = PARTS.find((p) => p.id === pid)!
                      return (
                        <article key={pid} className="cr-part" aria-labelledby={`cr-part-${pid}`}>
                          <h3 id={`cr-part-${pid}`}>
                            <span className="cr-part-num">{part.label}</span>
                            {part.title}
                          </h3>
                          <ol className="cr-chapters">
                            {part.chapters.map((ch) => (
                              <ChapterRow key={ch.id} c={ch} lastChapter={last} />
                            ))}
                          </ol>
                        </article>
                      )
                    })}
                  </div>
                </li>
              )
            })}
            <li className="cr-chip-row" aria-hidden="true">
              <span className="cr-chip">
                <svg viewBox="0 0 40 40" width="30" height="30">
                  <path d="M20 6v28M6 20h28" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="square" />
                  <path d="M4 4h6M30 4h6M4 36h6M30 36h6" fill="none" stroke="currentColor" strokeWidth="1.5" />
                </svg>
              </span>
              <span className="cr-chip-label">
                <strong>The qubit chip.</strong> Chapter Q25 ends on it.
              </span>
            </li>
          </ol>
        </div>
      </section>

      <section className="cr-links" aria-label={`More in ${c.code}`}>
        <Link className="cr-link-card" to={coursePath('qc709', 'arcade')}>
          <span className="eyebrow">Arcade</span>
          <span>Short rounds on the same engine as the chapters: sizes, angles and derivations with one wrong step.</span>
        </Link>
        <Link className="cr-link-card" to={coursePath('qc709', 'map')}>
          <span className="eyebrow">Concept map</span>
          <span>How each chapter depends on the ones above it, drawn as the same stack of plates.</span>
        </Link>
        <Link className="cr-link-card" to={coursePath('qc709', 'formulas')}>
          <span className="eyebrow">Formulas</span>
          <span>Every formula in the course, in both tracks, with the chapter it comes from.</span>
        </Link>
        <Link className="cr-link-card" to={coursePath('qc709', 'help')}>
          <span className="eyebrow">Help</span>
          <span>A worked walkthrough for every challenge, and a way back to the step you were on.</span>
        </Link>
      </section>
    </div>
  )
}
