/**
 * The Grapher (D-lab §2.4; decisions/lab.md). A lazy chunk of its own, loaded by LabPage for #/lab/grapher; Babylon
 * still arrives only through useLabEngine's dynamic import (the lab gate), and never below 900 px.
 *
 * Paper column (DOM, canonical): mode, presets, the typed inputs (caret at a parse error with a plain reason; the
 * picture keeps the last inputs that read), ranges, resolution, the parameter a, layers, equal scale, the cursor's
 * keyboard twin, the allowed names, Try this (with what the engine finds, one click away).
 * Stage: the passport of the space shown (fidelity note one click away), engine-only readouts (aria-live when a change
 * ends), DOM axis and pole labels placed by projection with the avoidance pass, a caption. Below 900 px: the readouts
 * and a static SVG of the curve or surface outline, no Babylon.
 * Re-sampling: a full re-sample per edit, throttled to one per RESAMPLE_GAP_MS (the last edit always lands), never per
 * frame; moving the cursor re-samples nothing.
 */
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { useSearchParams } from 'react-router-dom'
import type { Passport } from '../../../content/stage'
import { stageCssVars } from '../../../stage/tokens'
import { useMedia, WIDE_QUERY } from '../../../stage/useLiveStage'
import { Rich } from '../../../ui/Rich'
import type { GrapherLabView, LabHandle } from '../../handle'
import { HandleTwin } from '../../HandleTwin'
import { registerGrapherApi } from '../../instrument'
import { LabFallback, LabPassport, useLabStage, useProjectedLabels, useSplit } from '../../LabStage'
import { presetFrom } from '../../presets'
import { BLOCH_PATH_FIDELITY, GRAPH_FIDELITY } from './fidelity'
import { labelsOf } from './labels'
import {
  A_MAX,
  A_MIN,
  A_STEP,
  cursorFromPoint,
  cursorOf,
  cursorView,
  geometryOf,
  MODES,
  num,
  readMode,
  readoutsOf,
  RES,
  sampleOf,
  SETUPS,
  TRY_THIS,
  TRY_THIS_ANSWER,
  twinText,
  viewFinite,
  type FieldError,
  type FieldId,
  type Geometry,
  type ModeConfig,
  type Readout,
  type Sampled,
} from './model'
import {
  applySetup,
  configOf,
  grStore,
  nudgeCursor,
  setA,
  setCursor,
  setEqual,
  setFocus,
  setLayer,
  setMode,
  setRes,
  setSplit,
  setText,
  useGrapher,
  type GrapherParams,
} from './store'

/** At most one re-sample per this many ms while an input keeps changing (the last change always lands). */
export const RESAMPLE_GAP_MS = 50

const PRESET_NAMES: [string, string][] = [
  ['uncertainty', 'ΔSx·ΔSy and its bound'],
  ['saddle', 'Saddle and plane'],
  ['helix', 'Helix'],
  ['born', 'P(+z) against the tilt'],
  ['equator', 'Equator (great circle)'],
  ['spiral', 'Spiral pole to pole'],
]

/** The mounted stage's engine handle and the page's current picture (the __lab hooks drive them synchronously). */
let liveHandle: LabHandle | null = null
const live: { s: Sampled | null; g: Geometry | null; flush: (() => void) | null } = { s: null, g: null, flush: null }

interface Pictured {
  view: GrapherLabView
  readouts: Readout[]
  twin: string
  cursor: ReturnType<typeof cursorOf>
}
function picture(p: GrapherParams, s: Sampled, g: Geometry): Pictured {
  const cursor = cursorOf(s, p.cursor)
  const view: GrapherLabView = { bench: 'grapher', geometry: g.geo, ...cursorView(s, g, cursor, p.layers), focus: p.focus }
  return { view, readouts: readoutsOf(s, g, cursor, p.layers, p.equal), twin: twinText(s, cursor), cursor }
}

/** The committed inputs sampled, throttled: a full re-sample per edit, at most one per RESAMPLE_GAP_MS. */
function useSampled(cfg: ModeConfig, a: number): Sampled {
  const [s, setS] = useState<Sampled>(() => sampleOf(cfg, a))
  const last = useRef(0)
  // a new mode shows at once (its inputs are already on the page)
  const sync = useMemo(() => (s.cfg.kind !== cfg.kind ? sampleOf(cfg, a) : null), [s, cfg, a])
  useEffect(() => {
    live.flush = () => {
      last.current = performance.now()
      setS(sampleOf(cfg, a))
    }
    if (sync) {
      last.current = performance.now()
      setS(sync)
      return
    }
    if (s.cfg === cfg && s.a === a) return
    const id = window.setTimeout(
      () => {
        last.current = performance.now()
        setS(sampleOf(cfg, a))
      },
      Math.max(0, last.current + RESAMPLE_GAP_MS - performance.now()),
    )
    return () => clearTimeout(id)
  }, [s, sync, cfg, a])
  return sync ?? s
}

export default function GrapherBench({ tabs }: { tabs: ReactNode }) {
  const p = useGrapher()
  const s = useSampled(configOf(p), p.a)
  const g = useMemo(() => geometryOf(s, p.equal, p.layers), [s, p.equal, p.layers])
  const pic = useMemo(() => picture(p, s, g), [p, s, g])
  live.s = s
  live.g = g
  const [search] = useSearchParams()
  // ruling 7: only an allowlisted id is read from the URL; it names a preset, never state
  const presetId = presetFrom(SETUPS, search.get('preset'))
  useEffect(() => {
    if (presetId) applySetup(presetId)
  }, [presetId])
  useEffect(
    () =>
      registerGrapherApi({
        state: () => {
          const { committed: _c, ...rest } = grStore.get()
          return rest
        },
        readouts: () => {
          const st = grStore.get()
          if (!live.s || !live.g) return {}
          return Object.fromEntries(picture(st, live.s, live.g).readouts.map((r) => [r.key, r.text]))
        },
        setup: (id) => {
          const ok = presetFrom(SETUPS, id)
          if (ok) applySetup(ok)
        },
        drag: (pts) => {
          for (const pt of pts) {
            if (!live.s || !live.g) return
            const c = cursorFromPoint(live.s, live.g, pt)
            if (c !== null) setCursor(c)
          }
        },
        sample: () => {
          const x = live.s
          if (!x || !live.g) return { ms: 0, samples: 0, gaps: 0, finite: true, mode: '' }
          const gaps = x.kind === 'surface' ? (x.stats.solid?.gaps ?? 0) + (x.stats.wire?.gaps ?? 0) : x.gaps
          return { ms: x.ms, samples: x.kind === 'surface' ? x.n * x.n : x.n, gaps, finite: viewFinite(picture(grStore.get(), x, live.g).view), mode: x.kind }
        },
        flush: () => live.flush?.(),
        dragStep: (handle) => {
          if (handle === 'cursor') {
            return (i) => {
              const t = (i / 60) * 2 * Math.PI
              const st = grStore.get()
              setCursor(st.mode === 'surface' ? [0.5 + 0.4 * Math.cos(t), 0.5 + 0.4 * Math.sin(t)] : 0.5 + 0.45 * Math.sin(t))
              if (live.s && live.g) liveHandle?.update(picture(grStore.get(), live.s, live.g).view)
            }
          }
          if (handle === 'a') {
            // a full re-sample at a new a on every frame: the cost of one re-sample frame (the page throttles them)
            return (i) => {
              const st = grStore.get()
              const x = sampleOf(configOf(st), -5 + (10 * (i % 60)) / 59)
              const y = geometryOf(x, st.equal, st.layers)
              liveHandle?.update(picture(st, x, y).view)
            }
          }
          return null
        },
      }),
    [],
  )
  return (
    <>
      <aside className="lab-paper" aria-label="Lab controls">
        {tabs}
        <GrapherPanel p={p} s={s} g={g} pic={pic} note={presetId ? SETUPS[presetId].note : undefined} />
      </aside>
      <GrapherStage p={p} s={s} g={g} pic={pic} />
    </>
  )
}

/* ------------------------------------------------------------------------------------------------ */
/* Paper column                                                                                       */
/* ------------------------------------------------------------------------------------------------ */
function FieldErr({ id, text, error }: { id: string; text: string; error: FieldError }) {
  return (
    <div id={`gr-err-${id}`} className="lab-cell-error" role="alert" data-error={id}>
      <pre className="mono" aria-hidden>
        {text}
        {'\n'}
        {' '.repeat(Math.min(error.pos, 200))}^
      </pre>
      <p>
        Character {error.pos + 1}: {error.reason} The picture keeps the last graph that read correctly.
      </p>
    </div>
  )
}

function Field({ id, label, value, error, max = 200, short }: { id: FieldId; label: string; value: string; error?: FieldError; max?: number; short?: boolean }) {
  return (
    <div className={`gr-field${short ? ' gr-short' : ''}`}>
      <label>
        <span className="gr-name mono">{label}</span>
        <input
          className="mono"
          type="text"
          spellCheck={false}
          autoComplete="off"
          autoCapitalize="off"
          maxLength={max}
          data-field={id}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `gr-err-${id}` : undefined}
          value={value}
          onChange={(e) => setText(id, e.currentTarget.value)}
        />
      </label>
      {error && <FieldErr id={id} text={value} error={error} />}
    </div>
  )
}

function Slider(props: { label: string; name: string; min: number; max: number; step: number; value: number; text: string; onChange: (v: number) => void }) {
  return (
    <label className="lab-range">
      <span>{props.label}</span>
      <input
        type="range"
        min={props.min}
        max={props.max}
        step={props.step}
        value={props.value}
        aria-label={props.name}
        aria-valuetext={`${props.name} ${props.text}`}
        onChange={(e) => props.onChange(Number(e.currentTarget.value))}
      />
      <output className="mono">{props.text}</output>
    </label>
  )
}

function GrapherPanel({ p, s, g, pic, note }: { p: GrapherParams; s: Sampled; g: Geometry; pic: Pictured; note?: string }) {
  const wide = useMedia(WIDE_QUERY)
  const split = p.split
  const errors = useMemo(() => readMode(p.mode, p.text, p.layers, p.res[p.mode]).errors, [p.mode, p.text, p.layers, p.res])
  const t = p.text
  const [v1, v2] = [t.sv1, t.sv2]
  const usesA = configOf(p).usesA
  const res = RES[p.mode]
  const unit = p.mode === 'surface' ? `${p.res.surface} × ${p.res.surface}` : `${p.res[p.mode]}`
  return (
    <>
      <h1>Grapher</h1>
      <p className="section-lede">Plot your own functions: a surface, a curve, or a path of states on the Bloch sphere.</p>
      {note && (
        <p className="lab-note" data-preset-note>
          {note}
        </p>
      )}
      {wide && split === 'tb' && (
        <p className="lab-small" data-caption="paper">
          {captionOf(g, s)}
        </p>
      )}
      {(!wide || split === 'tb') && <PaperReadouts list={pic.readouts} sticky={wide} />}
      {!wide && <GraphSvg s={s} g={g} />}

      <fieldset className="lab-controls">
        <legend>Mode</legend>
        <div className="lab-row" role="radiogroup" aria-label="Mode">
          {MODES.map((m) => (
            <label key={m.id} className="lab-check gr-mode">
              <input type="radio" name="gr-mode" value={m.id} checked={p.mode === m.id} onChange={() => setMode(m.id)} /> {m.name}
            </label>
          ))}
        </div>
        <div className="lab-row lab-presets" role="group" aria-label="Presets">
          {PRESET_NAMES.map(([id, name]) => (
            <button key={id} type="button" aria-pressed={p.preset === id} onClick={() => applySetup(id)}>
              {name}
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset className="lab-controls">
        <legend>{p.mode === 'surface' ? 'Surface z = f(x, y)' : p.mode === 'curve' ? 'Curve (x(t), y(t), z(t))' : 'Bloch path θ(t), φ(t)'}</legend>
        {p.mode === 'surface' && (
          <>
            <div className="lab-row gr-vars">
              <span className="lab-small">Variables</span>
              <Field id="sv1" label="1st" value={t.sv1} error={errors.sv1} max={12} short />
              <Field id="sv2" label="2nd" value={t.sv2} error={errors.sv2} max={12} short />
            </div>
            <label className="lab-check">
              <input type="checkbox" checked={p.layers.solid} onChange={(e) => setLayer('solid', e.currentTarget.checked)} /> Solid layer
            </label>
            <Field id="f" label={`f(${v1}, ${v2}) =`} value={t.f} error={p.layers.solid ? errors.f : undefined} />
            <label className="lab-check">
              <input type="checkbox" checked={p.layers.wire} onChange={(e) => setLayer('wire', e.currentTarget.checked)} /> Wire layer
            </label>
            <Field id="g" label={`g(${v1}, ${v2}) =`} value={t.g} error={p.layers.wire ? errors.g : undefined} />
            <div className="lab-row gr-range">
              <Field id="x0" label={`${v1} from`} value={t.x0} error={errors.x0} max={60} short />
              <Field id="x1" label="to" value={t.x1} error={errors.x1} max={60} short />
            </div>
            <div className="lab-row gr-range">
              <Field id="y0" label={`${v2} from`} value={t.y0} error={errors.y0} max={60} short />
              <Field id="y1" label="to" value={t.y1} error={errors.y1} max={60} short />
            </div>
          </>
        )}
        {p.mode === 'curve' && (
          <>
            <div className="lab-row gr-vars">
              <span className="lab-small">Parameter</span>
              <Field id="cv" label="name" value={t.cv} error={errors.cv} max={12} short />
            </div>
            <Field id="cx" label={`x(${t.cv}) =`} value={t.cx} error={errors.cx} />
            <Field id="cy" label={`y(${t.cv}) =`} value={t.cy} error={errors.cy} />
            <Field id="cz" label={`z(${t.cv}) =`} value={t.cz} error={errors.cz} />
            <div className="lab-row gr-range">
              <Field id="ct0" label={`${t.cv} from`} value={t.ct0} error={errors.ct0} max={60} short />
              <Field id="ct1" label="to" value={t.ct1} error={errors.ct1} max={60} short />
            </div>
          </>
        )}
        {p.mode === 'bloch' && (
          <>
            <div className="lab-row gr-vars">
              <span className="lab-small">Parameter</span>
              <Field id="bv" label="name" value={t.bv} error={errors.bv} max={12} short />
            </div>
            <Field id="bth" label={`θ(${t.bv}) =`} value={t.bth} error={errors.bth} />
            <Field id="bph" label={`φ(${t.bv}) =`} value={t.bph} error={errors.bph} />
            <p className="lab-small">θ and φ in radians: the state cos(θ/2)|+z⟩ + e^(iφ) sin(θ/2)|−z⟩.</p>
            <div className="lab-row gr-range">
              <Field id="bt0" label={`${t.bv} from`} value={t.bt0} error={errors.bt0} max={60} short />
              <Field id="bt1" label="to" value={t.bt1} error={errors.bt1} max={60} short />
            </div>
          </>
        )}
        <Slider
          label="samples"
          name={p.mode === 'surface' ? 'samples per side' : 'samples'}
          min={res.min}
          max={res.max}
          step={1}
          value={p.res[p.mode]}
          text={unit}
          onChange={(v) => setRes(p.mode, v)}
        />
        <Slider label="a" name="parameter a" min={A_MIN} max={A_MAX} step={A_STEP} value={p.a} text={num(p.a)} onChange={setA} />
        {!usesA && <p className="lab-small">These expressions do not use a, so moving it changes nothing.</p>}
        {p.mode !== 'bloch' && (
          <label className="lab-check">
            <input type="checkbox" checked={p.equal} onChange={(e) => setEqual(e.currentTarget.checked)} /> Equal scale (otherwise each axis is fitted to the box
            separately)
          </label>
        )}
        <p className="lab-small">
          You can type numbers, + − * / ^, pi, e, your variables and the parameter a; sqrt, sin, cos, tan, exp, ln, abs, asin, acos, atan, sinh, cosh, tanh. A
          space or nothing between factors multiplies (2pi, 2 x, x y). A function takes the next factor: sin x^2 is (sin x)^2; write sin(x^2) for the other.
        </p>
      </fieldset>

      <fieldset className="lab-controls">
        <legend>Cursor (keyboard twin of the drag)</legend>
        <HandleTwin
          label="Cursor"
          dims={p.mode === 'surface' ? 2 : 1}
          valueText={pic.twin}
          slider={p.mode === 'surface' ? undefined : { now: Number((pic.cursor.kind === 'surface' ? 0 : pic.cursor.t).toPrecision(6)), min: s.kind === 'surface' ? 0 : s.cfg.tr[0], max: s.kind === 'surface' ? 1 : s.cfg.tr[1] }}
          onNudge={nudgeCursor}
          onFocusChange={setFocus}
        />
      </fieldset>

      <div className="lab-try">
        <p>
          <strong>Try this.</strong> <Rich as="span" text={TRY_THIS} />
        </p>
        <button type="button" onClick={() => applySetup('uncertainty')}>
          Set it up
        </button>
        <details className="gr-answer">
          <summary>What the engine finds</summary>
          <p>
            <Rich as="span" text={TRY_THIS_ANSWER} />
          </p>
        </details>
      </div>
    </>
  )
}

function PaperReadouts({ list, sticky }: { list: Readout[]; sticky: boolean }) {
  return (
    <div className={`lab-readout-list mono${sticky ? ' lab-sticky' : ''}`} aria-live="polite" data-readouts="paper">
      <ul aria-label="Readouts">
        {list.map((r) => (
          <li key={r.key} data-key={r.key} data-paper-tone={r.tone}>
            {r.text}
          </li>
        ))}
      </ul>
    </div>
  )
}

/* ------------------------------------------------------------------------------------------------ */
/* < 900 px: a static SVG outline (no Babylon)                                                        */
/* ------------------------------------------------------------------------------------------------ */
/** The default shot's direction (az 30°, el 22°), orthographic: box coordinates → 2D (x right, y up). */
const AZ = (30 * Math.PI) / 180
const EL = (22 * Math.PI) / 180
const RIGHT = [-Math.sin(AZ), Math.cos(AZ), 0]
const UP = [-Math.sin(EL) * Math.cos(AZ), -Math.sin(EL) * Math.sin(AZ), Math.cos(EL)]
const proj = (x: number, y: number, z: number): [number, number] => [x * RIGHT[0] + y * RIGHT[1], x * UP[0] + y * UP[1] + z * UP[2]]

export function GraphSvg({ s, g }: { s: Sampled; g: Geometry }) {
  const paths = useMemo(() => {
    const out: { d: string; tone: 'frame' | 'line' }[] = []
    const P = (x: number, y: number, z: number) => {
      const [u, v] = proj(x, y, z)
      return `${(160 + 70 * u).toFixed(1)} ${(120 - 70 * v).toFixed(1)}`
    }
    const poly = (pts: Float32Array, stride = 3) => {
      let d = ''
      for (let k = 0; k < pts.length / stride; k++) d += `${k ? 'L' : 'M'}${P(pts[stride * k], pts[stride * k + 1], pts[stride * k + 2])}`
      return d
    }
    const box = g.geo.box
    if (box) {
      const [x0, y0, z0] = box.min
      const [x1, y1, z1] = box.max
      const c = [
        [x0, y0, z0], [x1, y0, z0], [x1, y1, z0], [x0, y1, z0],
        [x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1],
      ]
      const e = [[0, 1], [1, 2], [2, 3], [3, 0], [4, 5], [5, 6], [6, 7], [7, 4], [0, 4], [1, 5], [2, 6], [3, 7]]
      out.push({ d: e.map(([a, b]) => `M${P(c[a][0], c[a][1], c[a][2])}L${P(c[b][0], c[b][1], c[b][2])}`).join(''), tone: 'frame' })
    } else {
      // the Bloch sphere's outline and equator
      const ring = (f: (a: number) => [number, number, number]) =>
        Array.from({ length: 65 }, (_, i) => {
          const [x, y, z] = f((i / 64) * 2 * Math.PI)
          return `${i ? 'L' : 'M'}${P(x, y, z)}`
        }).join('')
      out.push({ d: ring((a) => [Math.cos(a) * RIGHT[0] + Math.sin(a) * UP[0], Math.cos(a) * RIGHT[1] + Math.sin(a) * UP[1], Math.sin(a) * UP[2]]), tone: 'frame' })
      out.push({ d: ring((a) => [Math.cos(a), Math.sin(a), 0]), tone: 'frame' })
    }
    // the surface outline: its own grid lines at a coarse stride (the drawn samples only), or the wire, or the path
    if (s.kind === 'surface' && g.geo.surface && s.solid) {
      const n = s.n
      const pos = g.geo.surface.positions
      const k = Math.max(1, Math.ceil((n - 1) / 16))
      const line = (idx: number[]) => {
        let d = ''
        let pen = false
        for (const i of idx) {
          if (Number.isNaN(s.solid![i])) {
            pen = false
            continue
          }
          d += `${pen ? 'L' : 'M'}${P(pos[3 * i], pos[3 * i + 1], pos[3 * i + 2])}`
          pen = true
        }
        return d
      }
      for (let iy = 0; iy < n; iy += k) out.push({ d: line(Array.from({ length: n }, (_, ix) => iy * n + ix)), tone: 'line' })
      for (let ix = 0; ix < n; ix += k) out.push({ d: line(Array.from({ length: n }, (_, iy) => iy * n + ix)), tone: 'line' })
    }
    for (const w of g.geo.wire) out.push({ d: poly(w), tone: 'frame' })
    for (const p of g.geo.path) out.push({ d: poly(p.points), tone: 'line' })
    return out.filter((x) => x.d)
  }, [s, g])
  return (
    <figure className="gr-svg">
      <svg viewBox="0 0 320 240" role="img" aria-label="A still outline of the graph from the default view. The readouts above give the numbers.">
        {paths.map((p, i) => (
          <path key={i} d={p.d} data-tone={p.tone} fill="none" />
        ))}
      </svg>
      <figcaption className="lab-small">A still outline (the 3D view opens in a window at least 900 px wide).</figcaption>
    </figure>
  )
}

/* ------------------------------------------------------------------------------------------------ */
/* Stage                                                                                              */
/* ------------------------------------------------------------------------------------------------ */
/** The stage caption: what the shade means and what to drag. */
function captionOf(g: Geometry, s: Sampled): string {
  if (g.geo.space === 'bloch') return 'Shade along the path is t (dark at the start). The near-white bead is the state at the cursor: drag it along the path, or drag elsewhere to orbit.'
  if (s.kind === 'surface') return 'Shade is height: darker is lower. Drag the silver ring to move the cursor, or drag elsewhere to orbit.'
  return 'Shade is t: dark at the start. Drag the silver ring along the curve, or drag elsewhere to orbit.'
}

const BLOCH_PASSPORT: Passport = { title: 'STATE SPACE · Bloch sphere', note: 'not a place · opposite points = orthogonal states', axes: [], fidelityKey: 'bloch' }

function GrapherStage({ p, s, g, pic }: { p: GrapherParams; s: Sampled; g: Geometry; pic: Pictured }) {
  const { wide, host, handle, status, lost, givenUp } = useLabStage('grapher')
  const [dragging, setDragging] = useState(false)
  const split = p.split
  useSplit(host, setSplit)
  useEffect(() => {
    liveHandle = handle
    return () => {
      if (liveHandle === handle) liveHandle = null
    }
  }, [handle])
  useEffect(() => {
    handle?.update(pic.view)
  }, [handle, pic.view])
  useEffect(
    () =>
      handle?.onGui((a) => {
        if (a.type !== 'drag' || a.handle !== 'cursor') return
        if (a.phase === 'start') setDragging(true)
        if (a.p && live.s && live.g) {
          const c = cursorFromPoint(live.s, live.g, a.p)
          if (c !== null) setCursor(c)
        }
        if (a.phase === 'end') setDragging(false)
      }),
    [handle],
  )
  const labels = useMemo(() => labelsOf(s, g, p.layers, pic.view.cursor.at), [s, g, p.layers, pic.view.cursor.at])
  const labelRef = useProjectedLabels(handle, labels, host)
  const space = g.geo.space
  const passport: Passport =
    space === 'bloch'
      ? BLOCH_PASSPORT
      : {
          title: 'GRAPH SPACE ℝ³ · no units',
          note: s.kind === 'surface' ? `not a place · ${s.cfg.vars[0]}, ${s.cfg.vars[1]} are your inputs` : `not a place · ${s.kind === 'curve' ? s.cfg.v : 't'} is your input`,
          axes: [],
          fidelityKey: 'lab-r3',
        }
  if (!wide)
    return (
      <p className="lab-note lab-narrow" role="note">
        The 3D view opens in a window at least 900 px wide. The readouts and the outline on this page come from the same engine.
      </p>
    )
  return (
    <section
      className="lab-stage gr-stage"
      ref={host}
      aria-label="3D view"
      data-status={status}
      data-split={split}
      data-space={space}
      style={stageCssVars(space === 'bloch' ? 'bloch' : 'lab-r3')}
    >
      <div className="stage-overlay">
        <LabPassport passport={passport} kind={space === 'bloch' ? 'bloch' : 'lab-r3'} view="main" fidelity={space === 'bloch' ? BLOCH_PATH_FIDELITY : GRAPH_FIDELITY} />
        {split === 'lr' && (
          <div className="stage-readouts" data-view="main" aria-live={dragging ? 'off' : 'polite'}>
            {pic.readouts.map((r) => (
              <span key={r.key} className="stage-readout" data-key={r.key} data-tone={r.tone}>
                {r.text}
              </span>
            ))}
          </div>
        )}
        {labels.map((l) => (
          <span key={l.key} ref={labelRef(l.key)} className="stage-label lab-label" data-label={l.key} data-tier="axis" data-tone={l.tone} data-hidden="1" style={{ opacity: 0 }}>
            {l.rich ? <Rich as="span" text={l.text} /> : l.text}
          </span>
        ))}
        {/* a squarer stage (1024) keeps its caption in the paper column: here it would cover the axis labels */}
        {split === 'lr' && <p className="stage-caption">{captionOf(g, s)}</p>}
      </div>
      <LabFallback lost={lost} givenUp={givenUp} status={status} />
    </section>
  )
}
