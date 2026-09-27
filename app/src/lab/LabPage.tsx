/**
 * The lab route, `#/lab` and `#/lab/:bench` (W-lab §2; decisions/lab.md). A lazy route chunk with NO Babylon import
 * at module level: Babylon arrives only through `useLabEngine`'s dynamic import, and only at ≥ 900 px with WebGL
 * (ruling #13). No topbar link yet (ruling #12): the route works by URL.
 *
 * Layout (D-lab §4): the paper column (tabs, title, DOM controls, try-this) beside the stage box. The stage box holds
 * the Babylon canvas (created per mount by the hook) under the DOM overlay in the house style: passport top-left,
 * readouts top-right (aria-live), pole labels positioned by projection after each frame, caption bottom-left.
 * Every word and number is DOM (ruling #2); the GUI draws affordances only, each with a DOM twin here.
 * The lecture canvas stays mounted but draws 0 frames while this page is open (`pauseStageHost`, ruling #6).
 */
import { useEffect, useMemo, useRef } from 'react'
import { Link, useParams } from 'react-router-dom'
import { pauseStageHost } from '../stage/demand'
import { POLE_LABELS, type Pole } from '../stage/scenes/bloch/blochLabels'
import { useStageFlag } from '../stage/store'
import { stageCssVars } from '../stage/tokens'
import { useMedia, webglAvailable, WIDE_QUERY } from '../stage/useLiveStage'
import { Rich } from '../ui/Rich'
import type { V3 } from './axes'
import { BENCHES, benchFromParam, type BenchInfo } from './benches'
import { frameView, PHI_STEP, PHI_TURN } from './frameBench'
import type { LabGuiAction } from './handle'
import { installLabInstrument } from './instrument'
import { resetFrame, restartLab, setPhi, stepPhi, useLab } from './labStore'
import { useLabEngine } from './useLabEngine'
import './lab.css'

installLabInstrument()

/** Pole label anchors (physics), just outside the unit sphere like the lecture Bloch scene (1.08). */
const POLE_ANCHORS: [Pole, V3][] = [
  ['+x', [1.08, 0, 0]],
  ['-x', [-1.08, 0, 0]],
  ['+y', [0, 1.08, 0]],
  ['-y', [0, -1.08, 0]],
  ['+z', [0, 0, 1.16]],
  ['-z', [0, 0, -1.16]],
]

const PASSPORT = { title: 'STATE SPACE · Bloch sphere', note: 'not a place · opposite points = orthogonal states' }

export default function LabPage() {
  const { bench: param } = useParams()
  const bench = benchFromParam(param)
  // the lecture host (if an earlier lecture mounted it) keeps its context but draws nothing while the lab is open
  useEffect(() => pauseStageHost(), [])
  return (
    <div className="lab-page" style={stageCssVars('bloch')}>
      <aside className="lab-paper" aria-label="Lab controls">
        <p className="eyebrow">Lab</p>
        <nav className="lab-tabs" aria-label="Benches">
          {BENCHES.filter((b) => b.built).map((b) => (
            <Link key={b.id} to={b.id === 'frame' ? '/lab' : `/lab/${b.id}`} className="lab-tab" aria-current={bench?.id === b.id ? 'page' : undefined}>
              {b.title}
            </Link>
          ))}
        </nav>
        {bench === null ? <NoBench param={param ?? ''} /> : !bench.built ? <NotBuilt bench={bench} /> : <FrameControls />}
      </aside>
      {bench?.id === 'frame' && <FrameStage />}
    </div>
  )
}

function NoBench({ param }: { param: string }) {
  return (
    <>
      <h1>No such bench</h1>
      <p className="section-lede">
        There is no bench called “{param.slice(0, 40)}”. <Link to="/lab">Open the frame check</Link>.
      </p>
    </>
  )
}

function NotBuilt({ bench }: { bench: BenchInfo }) {
  return (
    <>
      <h1>{bench.title}</h1>
      <p className="section-lede">{bench.blurb}</p>
      <p className="lab-note">This bench is not built yet. <Link to="/lab">Open the frame check</Link>.</p>
    </>
  )
}

/** DOM controls of the frame check: the canonical controls (the GUI pad and slider mirror them). */
function FrameControls() {
  const { phi } = useLab()
  const view = useMemo(() => frameView(phi), [phi])
  return (
    <>
      <h1>{BENCHES[0].title}</h1>
      <p className="section-lede">{BENCHES[0].blurb}</p>
      <fieldset className="lab-controls">
        <legend>Turn the state about z</legend>
        <div className="lab-row">
          <button type="button" onClick={() => stepPhi(-1)} aria-label={`Turn by minus ${PHI_STEP} degrees about z`}>
            −{PHI_STEP}°
          </button>
          <button type="button" onClick={() => stepPhi(1)} aria-label={`Turn by plus ${PHI_STEP} degrees about z`}>
            +{PHI_STEP}°
          </button>
          <button type="button" onClick={resetFrame}>
            Back to |+x⟩
          </button>
        </div>
        <label className="lab-range">
          <span>φ</span>
          <input type="range" min={0} max={PHI_TURN - 1} step={1} value={phi} aria-valuetext={`phi ${phi} degrees`} onChange={(e) => setPhi(Number(e.currentTarget.value))} />
          <output className="mono">{phi}°</output>
        </label>
      </fieldset>
      <p className="lab-try">
        <strong>Try this.</strong> Set φ to 90°. The engine applies R_z(90°) to |+x⟩: which label does the bead land on? Keep going to 360°: the bead
        is home, but read the ket. Then go on to 720°.
      </p>
      {/* the same numbers as the stage readouts, for the < 900 px page and screen readers */}
      <ul className="lab-readout-list mono" aria-label="Readouts">
        {view.readouts.map((r) => (
          <li key={r}>{r}</li>
        ))}
      </ul>
    </>
  )
}

/** The stage box: live Babylon view at ≥ 900 px with WebGL; otherwise nothing (the paper column has the numbers). */
function FrameStage() {
  const wide = useMedia(WIDE_QUERY)
  const { phi, lost, givenUp, epoch } = useLab()
  const motion = useStageFlag('motion')
  const view = useMemo(() => frameView(phi), [phi])
  const host = useRef<HTMLDivElement>(null)
  const live = wide && webglAvailable() && !givenUp
  const { handle, status } = useLabEngine(host, live && !lost, epoch, motion)
  const labelEls = useRef(new Map<Pole, HTMLSpanElement>())

  // the view → the canvas (engine values only; the canvas formats nothing)
  useEffect(() => {
    handle?.update({ bead: view.r, phi })
  }, [handle, view, phi])
  // GUI gestures → the same store actions as the DOM twins
  useEffect(() => handle?.onGui((a: LabGuiAction) => (a.type === 'step' ? stepPhi(a.dir) : setPhi(a.deg))), [handle])
  // DOM labels follow the projection of their anchors after every frame
  useEffect(
    () =>
      handle?.onRender((project) => {
        for (const [pole, anchor] of POLE_ANCHORS) {
          const el = labelEls.current.get(pole)
          if (!el) continue
          const p = project(anchor)
          if (!p) {
            el.dataset.hidden = '1'
            el.style.opacity = '0'
            continue
          }
          el.dataset.hidden = '0'
          el.style.opacity = '1'
          el.style.transform = `translate(${p[0].toFixed(1)}px, ${p[1].toFixed(1)}px) translate(-50%, -50%)`
        }
      }),
    [handle],
  )

  if (!wide) return null
  return (
    <section className="lab-stage" ref={host} aria-label="3D view" data-status={status}>
      <div className="stage-overlay">
        <div className="stage-passport lab-passport" data-slot="main">
          <span className="passport-title">{PASSPORT.title}</span>
          <span className="passport-note">{PASSPORT.note}</span>
        </div>
        {POLE_ANCHORS.map(([pole]) => (
          <span
            key={pole}
            ref={(el) => {
              if (el) labelEls.current.set(pole, el)
              else labelEls.current.delete(pole)
            }}
            className="stage-label"
            data-label={pole}
            data-tier="axis"
            data-tone="silver"
            data-hidden="1"
            style={{ opacity: 0 }}
          >
            <Rich as="span" text={POLE_LABELS.spin[pole]} />
          </span>
        ))}
        <div className="stage-readouts" aria-live="polite">
          {view.readouts.map((r, i) => (
            <span key={i} className="stage-readout" data-tone={i === 1 ? 'state' : 'text'}>
              {r}
            </span>
          ))}
        </div>
        <p className="stage-caption">
          The near-white bead is the state R_z(φ)|+x⟩, placed at the engine’s Bloch vector. Drag to orbit; the ring, the slider and the ± pad are
          handles only.
        </p>
      </div>
      {(lost || givenUp || status === 'error') && (
        <div className="lab-fallback" role="status">
          {givenUp ? (
            <p>The 3D view stopped twice, so it stays off for this visit. The controls and readouts still work.</p>
          ) : status === 'error' ? (
            <p>The 3D view could not start here. The controls and readouts still work.</p>
          ) : (
            <p>
              The 3D view stopped (the graphics context was lost).{' '}
              <button type="button" onClick={restartLab}>
                Restart 3D
              </button>
            </p>
          )}
        </div>
      )}
    </section>
  )
}
