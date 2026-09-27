/**
 * The Stern–Gerlach bench (D-lab §2.1; decisions/lab.md). A lazy chunk of its own, loaded by LabPage for #/lab/sg; Babylon
 * still arrives only through useLabEngine's dynamic import (the lab gate), and never below 900 px.
 *
 * Paper column (DOM, canonical): presets, the source (oven, |±z⟩, |±x⟩, a sealed |±y⟩ box), each magnet's tilt (typed,
 * and the knob's keyboard twin: ±15°, Shift ±1°), keep ± per stop, add / remove, Fire 100 / 1 000 / 10 000, Clear, field
 * lines, the stops' counts, the counts before the last change, Try this (with what the engine finds, one click away).
 * Stage: the passport (fidelity note one click away), engine-only readouts (aria-live when a volley has landed), DOM
 * labels placed by projection with the avoidance pass, the plate inset (the plate face-on, seen along the beam) and a
 * caption. Below 900 px: the readouts and a still SVG (the chain as dials, the plate's counts), no Babylon.
 * The hardware is `lab.glb`, fetched once from our own origin and read by the strict reader (lab/glb.ts): 8 named meshes,
 * geometry only, no loader. The poles stay procedural (physics/field.ts POLE).
 */
import { useCallback, useEffect, useMemo, useState, type ReactNode, type RefObject } from 'react'
import { useSearchParams } from 'react-router-dom'
import type { Passport } from '../../../content/stage'
import { POLE, streamlines } from '../../../physics/field'
import type { Sign } from '../../../physics/sg'
import { stageCssVars } from '../../../stage/tokens'
import { useMedia, WIDE_QUERY } from '../../../stage/useLiveStage'
import { Plate as PlateSvg } from '../../../ui/primitives'
import { parseGlb } from '../../glb'
import type { LabHandle, SgHardwareMesh, SgLabView, SgLayoutView } from '../../handle'
import { HandleTwin } from '../../HandleTwin'
import { registerSgApi } from '../../instrument'
import { LabFallback, LabPassport, useLabStage, useProjectedLabels, useSplit, type LabLabel } from '../../LabStage'
import { presetFrom } from '../../presets'
import { SG_FIDELITY } from './fidelity'
import { at, localOf, SG, tiltFromPoint, type SgLayout } from './layout'
import {
  axisName,
  chainText,
  count,
  MAX_DEPOSITS,
  MAX_MAGNETS,
  PRESET_ORDER,
  readoutsOf,
  SETUPS,
  setupKey,
  SOURCES,
  sourceText,
  stopLines,
  TRY_THIS,
  tryThisAnswer,
  VOLLEYS,
  type Readout,
  type SgSource,
} from './model'
import { layoutOfSetup, sourceTone } from './plate'
import {
  addMagnet,
  applySetup,
  clearPlate,
  commitFlight,
  dragTilt,
  fire,
  nudgeTilt,
  removeMagnet,
  setField,
  setFocus,
  setKeep,
  setSource,
  setSplit,
  setTilt,
  setupOf,
  sgStore,
  useSg,
  type SgParams,
} from './store'

const PASSPORT: Passport = { title: 'PHYSICAL SPACE ℝ³ · metres', note: 'schematic · not to scale', axes: [], fidelityKey: 'lab-r3' }
/** Field lines at the two ends of a magnet (its tilted frame), from the engine's schematic streamlines. */
const FIELD_LINES = [...streamlines(0.03, { samples: 20 }), ...streamlines(SG.L - 0.03, { samples: 20 })]
const POLE_VIEW = { ...POLE }

/* ---------------- the Blender hardware: fetched once, read strictly ---------------- */
let hardware: Promise<SgHardwareMesh[] | null> | null = null
function loadHardware(): Promise<SgHardwareMesh[] | null> {
  hardware ??= fetch(`${import.meta.env.BASE_URL}models/lab.glb`)
    .then((r) => (r.ok ? r.arrayBuffer() : null))
    .then((b) => {
      if (!b) return null
      const g = parseGlb(b)
      return g.ok ? g.meshes : null
    })
    .catch(() => null)
  return hardware
}

/** The page's view of the layout (plain data for the canvas). */
function layoutView(lay: SgLayout, keep: readonly Sign[]): SgLayoutView {
  return {
    modules: lay.modules.map((m) => ({ base: m.base, tilted: m.tilted, prep: false })),
    prep: lay.prep ? { base: lay.prep.base, tilted: lay.prep.tilted, prep: true } : null,
    stops: lay.stops.map((s, k) => ({ frame: s.frame, pads: { plus: s.pads.plus, minus: s.pads.minus, kept: keep[k] === '-' ? '-' : '+' } })),
    prepStop: lay.prepStop?.frame ?? null,
    rings: lay.rings,
    removePads: lay.removePads,
    addPad: lay.addPad,
    plate: lay.plate,
    source: lay.source,
    slit: lay.slit,
    rail: lay.rail,
    mid: lay.mid,
    length: lay.length,
    ring: { radius: SG.ringR },
    floorZ: SG.floorZ,
  }
}

/** The mounted stage's engine handle and the page's current picture (the __lab hooks drive them synchronously). */
let liveHandle: LabHandle | null = null
const live: { view: SgLabView | null; layout: SgLayout | null; motion: boolean; fine: boolean } = { view: null, layout: null, motion: false, fine: false }

/** A gesture from the canvas (or __lab): the same store actions as the DOM twins. */
function onGesture(handle: string, p: [number, number, number] | null): void {
  const knob = /^knob-(\d)$/.exec(handle)
  if (knob) {
    const m = live.layout?.modules[Number(knob[1])]
    const deg = m && p ? tiltFromPoint(m, p) : null
    if (deg !== null) dragTilt(Number(knob[1]), deg, live.fine)
    return
  }
  const keep = /^keep-(\d)-(plus|minus)$/.exec(handle)
  if (keep) return setKeep(Number(keep[1]), keep[2] === 'plus' ? '+' : '-')
  const rm = /^remove-(\d)$/.exec(handle)
  if (rm) return removeMagnet(Number(rm[1]))
  if (handle === 'add') addMagnet()
}

export default function SgBench({ tabs }: { tabs: ReactNode }) {
  const p = useSg()
  const [search] = useSearchParams()
  // ruling 7: only an allowlisted id is read from the URL; it names a preset, never state
  const presetId = presetFrom(SETUPS, search.get('preset'))
  useEffect(() => {
    if (presetId) applySetup(presetId)
  }, [presetId])
  const readouts = useMemo(() => readoutsOf(setupOf(p), p.counts), [p])
  useEffect(
    () =>
      registerSgApi({
        state: () => {
          const { plate, ...rest } = sgStore.get()
          return { ...rest, marks: plate.count, landed: plate.landed, flying: !!plate.flight, hardware: live.view?.hardware ? live.view.hardware.length : 0 }
        },
        readouts: () => Object.fromEntries(readoutsOf(setupOf(sgStore.get()), sgStore.get().counts).map((r) => [r.key, r.text])),
        setup: (id) => {
          const ok = presetFrom(SETUPS, id)
          if (ok) applySetup(ok)
        },
        fire: (n) => {
          fire(n, { motion: live.motion })
        },
        land: () => commitFlight(),
        clear: () => clearPlate(),
        drag: (handle, pts) => {
          for (const pt of pts) onGesture(handle, pt)
        },
        pick: (handle) => onGesture(handle, null),
        knobPoint: (k, deg) => {
          const m = live.layout?.modules[k]
          const r = live.layout?.rings[k]
          if (!m || !r) return null
          const y = localOf(m.base, r.center)[1]
          const a = (deg * Math.PI) / 180
          return at(m.base, [SG.ringR * Math.sin(a), y, SG.ringR * Math.cos(a)])
        },
        dragStep: (handle) => {
          if (handle !== 'volley') return null
          // atoms in flight on every frame: one 10 000-atom volley, drawn at a clock that sweeps the flight (the objects
          // are taken now: the volley's own landing timer may commit it while the bench runs)
          const base = live.view
          fire(10000, { motion: true })
          const s = sgStore.get()
          const flight = s.plate.flight
          const marks = marksOf(s)
          if (!base || !flight) return null
          return (i) => {
            const clock = 0.15 + (1.5 * (i % 120)) / 119
            liveHandle?.update({ ...base, flight, marks, clock })
          }
        },
      }),
    [],
  )
  return (
    <>
      <aside className="lab-paper" aria-label="Lab controls">
        {tabs}
        <SgPanel p={p} readouts={readouts} note={presetId ? SETUPS[presetId].note : undefined} />
      </aside>
      <SgStage p={p} readouts={readouts} />
    </>
  )
}

const marksOf = (s: SgParams): SgLabView['marks'] => ({ key: s.plate.key, pos: s.plate.pos, sign: s.plate.sign, count: s.plate.count, start: s.plate.start, arrive: s.plate.arrive })

/* ------------------------------------------------------------------------------------------------ */
/* Paper column                                                                                       */
/* ------------------------------------------------------------------------------------------------ */
const SOURCE_NAMES: Record<SgSource, string> = { oven: 'oven', '+z': '|+z⟩', '-z': '|−z⟩', '+x': '|+x⟩', '-x': '|−x⟩', '+y': '|+y⟩ box', '-y': '|−y⟩ box' }

function SgPanel({ p, readouts, note }: { p: SgParams; readouts: Readout[]; note?: string }) {
  const wide = useMedia(WIDE_QUERY)
  const n = p.tilts.length
  const setup = setupOf(p)
  const stops = stopLines(setup, p.counts)
  return (
    <>
      <h1>Stern–Gerlach bench</h1>
      <p className="section-lede">Build a chain of magnets, fire atoms through it, and compare the counts with the Born rule.</p>
      {note && (
        <p className="lab-note" data-preset-note>
          {note}
        </p>
      )}
      {wide && p.split === 'tb' && (
        <p className="lab-small" data-caption="paper">
          {CAPTION}
        </p>
      )}
      {(!wide || p.split === 'tb') && <PaperReadouts list={readouts} sticky={wide} />}
      {!wide && <ChainSvg p={p} />}

      <fieldset className="lab-controls">
        <legend>Presets</legend>
        <div className="lab-row lab-presets" role="group" aria-label="Presets">
          {PRESET_ORDER.map((id) => (
            <button key={id} type="button" aria-pressed={p.preset === id} onClick={() => applySetup(id)}>
              {SETUPS[id].name}
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset className="lab-controls">
        <legend>Source</legend>
        <div className="lab-row sg-sources" role="radiogroup" aria-label="Source">
          {SOURCES.map((s) => (
            <label key={s} className="lab-check sg-source">
              <input type="radio" name="sg-source" value={s} checked={p.source === s} onChange={() => setSource(s)} /> {SOURCE_NAMES[s]}
            </label>
          ))}
        </div>
        <p className="lab-small" data-source-note>
          Now: {sourceText(p.source)}.{' '}
          {p.source[1] === 'y'
            ? 'A magnet here turns only about the beam, so none can prepare |±y⟩: those atoms come in a sealed box.'
            : p.source === 'oven'
              ? 'Its atoms meet the first magnet unpolarized.'
              : 'Only the atoms the grey magnet lets through are fired and counted.'}
        </p>
      </fieldset>

      <fieldset className="lab-controls sg-magnets">
        <legend>Magnets (turned about the beam, from z toward x)</legend>
        {p.tilts.map((t, k) => (
          <div key={k} className="sg-magnet" data-magnet={k}>
            <div className="lab-row">
              <strong className="sg-mname">Magnet {k + 1}</strong>
              <label className="sg-tilt">
                <span>tilt</span>
                <input
                  className="mono"
                  type="number"
                  min={0}
                  max={359}
                  step={1}
                  value={t}
                  aria-label={`Tilt of magnet ${k + 1} in degrees`}
                  onChange={(e) => {
                    const v = e.currentTarget.valueAsNumber
                    if (Number.isFinite(v)) setTilt(k, v)
                  }}
                />
                <span>°</span>
              </label>
              {n > 1 && (
                <button type="button" onClick={() => removeMagnet(k)} aria-label={`Remove magnet ${k + 1}`}>
                  Remove
                </button>
              )}
            </div>
            <HandleTwin
              label={`Knob of magnet ${k + 1}`}
              dims={1}
              valueText={`${t}° from z toward x${axisName(t) ? `: along ${axisName(t)}` : ''}`}
              slider={{ now: t, min: 0, max: 359 }}
              onNudge={(nu) => nudgeTilt(k, nu)}
              onFocusChange={(f) => setFocus(f ? k : null)}
            />
            {k < n - 1 && (
              <div className="lab-row" role="radiogroup" aria-label={`Beam that goes on after magnet ${k + 1}`}>
                {(['+', '-'] as const).map((s) => (
                  <label key={s} className="lab-check sg-keep">
                    <input type="radio" name={`sg-keep-${k}`} checked={p.keep[k] === s} onChange={() => setKeep(k, s)} /> keep {s === '+' ? '+' : '−'}
                  </label>
                ))}
              </div>
            )}
          </div>
        ))}
        <div className="lab-row">
          <button type="button" onClick={addMagnet} disabled={n >= MAX_MAGNETS}>
            Add a magnet
          </button>
          {n >= MAX_MAGNETS && <span className="lab-small">Four is the most this bench takes.</span>}
        </div>
      </fieldset>

      <fieldset className="lab-controls">
        <legend>Fire</legend>
        <div className="lab-row">
          {VOLLEYS.map((v) => (
            <button key={v} type="button" onClick={() => fire(v, { motion: live.motion })}>
              Fire {count(v)}
            </button>
          ))}
          <button type="button" onClick={clearPlate}>
            Clear
          </button>
        </div>
        <label className="lab-check">
          <input type="checkbox" checked={p.field} onChange={(e) => setField(e.currentTarget.checked)} /> Field lines
        </label>
        <ul className="lab-readout-list sg-stops" aria-label="Stops">
          {stops.map((s, k) => (
            <li key={k}>{s}</li>
          ))}
        </ul>
        <p className="lab-small" data-last-volley>
          {p.last ? `Last volley: ${count(p.last.n)} atoms, seed ${p.last.seed}${p.flight ? ' (in flight)' : ''}. Each volley draws a new seed.` : 'Each volley draws a new seed, so small volleys scatter.'}
          {p.plate.landed > p.plate.count ? ` The plate draws its first ${count(MAX_DEPOSITS)} marks; the counts include every atom.` : ''}
        </p>
        {p.previous && (
          <p className="lab-small" data-previous>
            Before your last change ({p.previous.chain}): {p.previous.text}.
          </p>
        )}
        <p className="lab-small">Changing the bench starts a fresh plate: the counts belong to one setup.</p>
      </fieldset>

      <div className="lab-try">
        <p>
          <strong>Try this.</strong> {TRY_THIS}
        </p>
        <details className="gr-answer">
          <summary>What the engine finds</summary>
          <p>{tryThisAnswer()}</p>
        </details>
      </div>
      <p className="lab-small sg-chain" data-chain>
        The bench now: {chainText(setup)}.
      </p>
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
/* < 900 px: the chain as end-on dials and the plate's counts (SVG, no Babylon)                      */
/* ------------------------------------------------------------------------------------------------ */
function ChainSvg({ p }: { p: SgParams }) {
  const n = p.tilts.length
  const W = 320
  const x0 = 46
  const dx = n > 1 ? (W - 2 * x0) / (n - 1) : 0
  return (
    <figure className="sg-svg">
      <svg viewBox={`0 0 ${W} 96`} role="img" aria-label={`The chain seen down the beam: ${chainText(setupOf(p))}. The readouts above give the numbers.`}>
        {p.tilts.map((t, k) => {
          const a = (t * Math.PI) / 180
          const cx = n > 1 ? x0 + k * dx : W / 2
          return (
            <g key={k} transform={`translate(${cx.toFixed(1)} 40)`}>
              <circle r={22} data-tone="frame" fill="none" />
              <line x1={0} y1={0} x2={(20 * Math.sin(a)).toFixed(1)} y2={(-20 * Math.cos(a)).toFixed(1)} data-tone="needle" />
              <text y={42} textAnchor="middle" className="sg-svg-label">
                {k + 1} · {t}°{k < n - 1 ? ` · ${p.keep[k] === '-' ? '−' : '+'}` : ''}
              </text>
            </g>
          )
        })}
      </svg>
      <figcaption className="lab-small">Each dial is a magnet seen along the beam: the needle is its + direction (z up, x right).</figcaption>
      <PlateSvg plus={p.counts.plus} minus={p.counts.minus} height={110} />
    </figure>
  )
}

/* ------------------------------------------------------------------------------------------------ */
/* Stage                                                                                              */
/* ------------------------------------------------------------------------------------------------ */
const CAPTION =
  'Drag a magnet’s knob round its ring to turn it about the beam (15° steps; Shift for 1°). Tap a ± pad to choose the beam that goes on, “+” at the rail’s end to add a magnet, “−” above one to remove it. The inset shows the plate face-on, seen along the beam.'

interface LabelSpec extends LabLabel {
  text: string
  tone: 'silver' | 'text' | 'plus' | 'minus'
}
function labelsOf(lay: SgLayout, p: SgParams): LabelSpec[] {
  const out: LabelSpec[] = [
    {
      key: 'source',
      at: lay.anchors.source,
      text: p.source === 'oven' ? 'oven' : p.source[1] === 'y' ? `${SOURCE_NAMES[p.source].replace(' box', '')} · sealed box` : `${SOURCE_NAMES[p.source]} source`,
      tone: 'silver',
      priority: 1,
    },
  ]
  lay.anchors.magnets.forEach((a, k) => out.push({ key: `m${k + 1}`, at: a, text: `magnet ${k + 1} · ${p.tilts[k]}°`, tone: 'text', priority: 2 }))
  // the two spots in the inset: beyond each spot along the last magnet's n (plate-local → physics)
  const tau = lay.modules[lay.modules.length - 1].tau
  const n = [Math.sin(tau), 0, Math.cos(tau)]
  const across = [Math.cos(tau), 0, -Math.sin(tau)]
  const f = lay.plate
  // beside each spot (across the ribbon), so a label never covers the marks
  const spot = (s: number): [number, number, number] => {
    const l = [n[0] * 0.72 * s + across[0] * 0.62, -0.05, n[2] * 0.72 * s + across[2] * 0.62]
    return [f.o[0] + f.R[0] * l[0] + f.R[1] * l[1] + f.R[2] * l[2], f.o[1] + f.R[3] * l[0] + f.R[4] * l[1] + f.R[5] * l[2], f.o[2] + f.R[6] * l[0] + f.R[7] * l[1] + f.R[8] * l[2]]
  }
  out.push({ key: 'spot-plus', view: 'plate', at: spot(1), text: '+', tone: 'plus', priority: 0 })
  out.push({ key: 'spot-minus', view: 'plate', at: spot(-1), text: '−', tone: 'minus', priority: 0 })
  return out
}

/** The plate inset: bottom-right, square, clear of the caption (fractions of the stage box). */
function useInset(host: RefObject<HTMLElement | null>): SgLabView['inset'] {
  const [inset, setInset] = useState<SgLabView['inset']>(null)
  useEffect(() => {
    const el = host.current
    if (!el) return
    const apply = () => {
      const r = el.getBoundingClientRect()
      if (r.width <= 0 || r.height <= 0) return
      const side = Math.round(Math.min(280, Math.max(170, 0.3 * Math.min(r.width, r.height))))
      const m = 14
      const next = { x: (r.width - side - m) / r.width, y: (r.height - side - m) / r.height, w: side / r.width, h: side / r.height }
      setInset((old) => (old && Math.abs(old.x - next.x) < 1e-4 && Math.abs(old.y - next.y) < 1e-4 && Math.abs(old.w - next.w) < 1e-4 ? old : next))
    }
    apply()
    const ro = new ResizeObserver(apply)
    ro.observe(el)
    return () => ro.disconnect()
  }, [host])
  return inset
}

function SgStage({ p, readouts }: { p: SgParams; readouts: Readout[] }) {
  const { wide, host, handle, status, lost, givenUp, motion } = useLabStage('sg')
  const [dragging, setDragging] = useState(false)
  const [hw, setHw] = useState<SgHardwareMesh[] | null>(null)
  useSplit(host, setSplit)
  const inset = useInset(host)
  const setup = setupOf(p)
  const key = setupKey(setup)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const lay = useMemo(() => layoutOfSetup(setup), [key])
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const layView = useMemo(() => layoutView(lay, setup.keep), [lay])
  live.layout = lay
  live.motion = motion && !!handle
  useEffect(() => {
    if (!handle) return
    let on = true
    void loadHardware().then((m) => on && setHw(m))
    return () => {
      on = false
    }
  }, [handle])
  // Shift while dragging a knob: 1° steps
  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      live.fine = e.shiftKey
    }
    window.addEventListener('keydown', k)
    window.addEventListener('keyup', k)
    return () => {
      window.removeEventListener('keydown', k)
      window.removeEventListener('keyup', k)
      live.fine = false
    }
  }, [])
  const view = useMemo<SgLabView>(
    () => ({
      bench: 'sg',
      layout: layView,
      pole: POLE_VIEW,
      field: p.field ? FIELD_LINES : null,
      hardware: hw,
      sourceTone: sourceTone(setup),
      marks: marksOf(p),
      flight: p.plate.flight,
      clock: null,
      inset,
      focus: p.focus,
      motion,
      rightStrip: p.split === 'lr' ? 330 : 0,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [layView, p.field, hw, p.plate, inset, p.focus, motion, p.split],
  )
  live.view = view
  useEffect(() => {
    liveHandle = handle
    return () => {
      if (liveHandle === handle) liveHandle = null
    }
  }, [handle])
  useEffect(() => {
    handle?.update(view)
  }, [handle, view])
  useEffect(
    () =>
      handle?.onGui((a) => {
        if (a.type === 'pick') onGesture(a.handle, null)
        if (a.type !== 'drag') return
        if (a.phase === 'start') setDragging(true)
        if (a.p) onGesture(a.handle, a.p)
        if (a.phase === 'end') setDragging(false)
      }),
    [handle],
  )
  const labels = useMemo(() => labelsOf(lay, p), [lay, p])
  const labelRef = useProjectedLabels(handle, labels, host)
  const insetStyle = useCallback(
    (r: NonNullable<SgLabView['inset']>) => ({ left: `${(r.x * 100).toFixed(3)}%`, top: `${(r.y * 100).toFixed(3)}%`, width: `${(r.w * 100).toFixed(3)}%`, height: `${(r.h * 100).toFixed(3)}%` }),
    [],
  )
  if (!wide)
    return (
      <p className="lab-note lab-narrow" role="note">
        The 3D view opens in a window at least 900 px wide. The readouts and the dials on this page come from the same engine.
      </p>
    )
  const split = p.split
  return (
    <section className="lab-stage sg-stage" ref={host} aria-label="3D view" data-status={status} data-split={split} style={stageCssVars('lab-r3')}>
      <div className="stage-overlay">
        <LabPassport passport={PASSPORT} kind="lab-r3" view="main" fidelity={SG_FIDELITY} />
        {split === 'lr' && (
          <div className="stage-readouts" data-view="main" aria-live={dragging || p.flight ? 'off' : 'polite'}>
            {readouts.map((r) => (
              <span key={r.key} className="stage-readout" data-key={r.key} data-tone={r.tone}>
                {r.text}
              </span>
            ))}
          </div>
        )}
        {inset && (
          <div className="lab-view sg-inset" data-view="plate" style={insetStyle(inset)} aria-hidden>
            <span className="sg-inset-tag" data-reserve>
              plate, face-on
            </span>
          </div>
        )}
        {labels.map((l) => (
          <span key={l.key} ref={labelRef(l.key)} className="stage-label lab-label" data-label={l.key} data-tier="axis" data-tone={l.tone} data-hidden="1" style={{ opacity: 0 }}>
            {l.text}
          </span>
        ))}
        {split === 'lr' && <p className="stage-caption">{CAPTION}</p>}
      </div>
      <LabFallback lost={lost} givenUp={givenUp} status={status} />
    </section>
  )
}
