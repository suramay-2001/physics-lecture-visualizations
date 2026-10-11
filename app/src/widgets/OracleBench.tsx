/**
 * Widget W16 `oracle-bench` (Physics 709, Chapters Q16 and Q17; rulings docs/roles/decisions/qc709-deferred-features.md D1): the black-box algorithms with a hidden pattern,
 * stepped one circuit column at a time. Pick the number of wires n (up to 4) and a function (constant, linear a·x ⊕ b, a balanced step, or one marked item), press the steps
 * and watch the circuit, the signed bars and, for Grover, the plane. Modes: Deutsch–Jozsa, Bernstein–Vazirani, Grover (N ≤ 16) and Simon (n = 3, five wires), and
 * 'hadamard' (Hadamard signs, Chapter Q16's first unit): a string and two columns of Hadamards, with no function, no oracle and no algorithm named.
 *
 * It draws the `circuit`, `amplitudes` and `grover-plane` stage kinds with their own resolvers and scenes (stage/svg/), on states built by the model (widgets/oracleBenchModel.ts),
 * which takes every number from the engine (physics/qc/oracles.ts, grover.ts, circuit.ts): this file only lays them out. The circuit and the bars read THE SAME circuit and cursor,
 * so the bars are the state flowing along the wires. Lazy: it calls the engine and the SVG kinds.
 *
 * Controls: the mode, n, the function and its parameters (the hidden string a and bit b, the marked item, Simon's secret s and the answer read, the starting string x of Hadamard
 * signs), the step buttons in circuit order, Back and Reset. Changing a setting starts the run again. Everything is a native button, slider or radio, labelled; the sentence under the step buttons is a live region.
 */
import { useEffect, useMemo, useRef, useState, type ReactNode, type RefObject } from 'react'
import { circuitReadouts, resolveCircuitStage } from '../stage/svg/circuit'
import { CircuitScene } from '../stage/svg/CircuitScene'
import { ampReadouts, resolveAmplitudes } from '../stage/svg/amplitudes'
import { AmplitudesScene } from '../stage/svg/AmplitudesScene'
import { groverPlaneReadouts, resolveGroverPlaneStage } from '../stage/svg/groverPlane'
import { GroverPlaneScene } from '../stage/svg/GroverPlaneScene'
import '../stage/svg/svg.css'
import './oracleBench.css'
import { STAGE_THEME, stageCssVars } from '../stage/tokens'
import type { StageKind } from '../content/stage'
import { Slider, WidgetFrame } from '../ui/primitives'
import {
  ALGORITHM_MODES,
  BENCH_OPS,
  DJ_FAMILIES,
  N_RANGE,
  START,
  applyOp,
  benchModel,
  normalizeSetup,
  stateAt,
  type BenchOp,
  type BenchSetup,
  type BenchState,
  type DjFamily,
  type OracleBenchMode,
} from './oracleBenchModel'

export interface OracleBenchProps {
  /**
   * 'dj' (default): Deutsch–Jozsa · 'bv': Bernstein–Vazirani · 'grover': search among N ≤ 16 strings · 'simon': Simon's problem (n = 3, five wires) · 'hadamard': Hadamard signs,
   * a string through two columns of Hadamards (no function, no cost line; its Algorithm choice offers only itself, so no algorithm is named).
   */
  mode?: OracleBenchMode
  /** Input wires: 1–4 for hadamard, dj and bv, 2–4 for grover (N = 2ⁿ ≤ 16), always 3 for simon (default 3). */
  n?: number
  /** dj only: 'constant' (f ≡ b), 'linear' (f = a·x ⊕ b, the default) or 'balanced' (a balanced step function that is not linear; n ≥ 3). bv is always linear. */
  family?: DjFamily
  /** The hidden string a as a whole number 0 … 2ⁿ − 1 (q0 the most significant bit): dj 'linear' and bv (default 1). */
  a?: number
  /** The hidden bit b (dj 'linear' and bv) or the constant value of f (dj 'constant'): 0 or 1 (default 0). */
  b?: 0 | 1
  /** grover only: the marked string as a whole number 0 … N − 1 (default 0). */
  marked?: number
  /** simon only: the secret string s as a whole number 1 … 7 (default 6, that is 110). */
  s?: number
  /** simon only: the answer the two answer wires are read as, 0 … 3 (default 0, that is 00). */
  answer?: number
  /** hadamard only: the string the wires start in, as a whole number 0 … 2ⁿ − 1 (q0 the most significant bit; default 1). */
  x?: number
  /** Start with this many columns of the circuit done (0 = before the first column; it snaps to a column the buttons can reach). Default 0. */
  step?: number
  /** false locks the mode, n and the function to the props; the step, Back and Reset buttons remain. Default true. */
  editable?: boolean
}

const BASE_W = 560

/** The width of an element, followed as it resizes (the scenes lay themselves out for it); `initial` until it is measured. */
function useBoxWidth(initial: number): [number, RefObject<HTMLDivElement | null>] {
  const ref = useRef<HTMLDivElement | null>(null)
  const [w, setW] = useState(initial)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const measure = () => setW(Math.max(240, Math.round(el.clientWidth)))
    measure()
    if (typeof ResizeObserver === 'undefined') return
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])
  return [w, ref]
}

const MODE_NAMES: Record<OracleBenchMode, string> = { dj: 'Deutsch–Jozsa', bv: 'Bernstein–Vazirani', grover: 'Grover', simon: 'Simon', hadamard: 'Hadamard signs' }
const FAMILY_NAMES: Record<DjFamily, string> = { constant: 'constant', linear: 'linear a·x ⊕ b', balanced: 'balanced, not linear' }
const bitsOf = (x: number, n: number): string => x.toString(2).padStart(n, '0')

/** A radio group of buttons (the page's `.segmented` look) in which an option can be unavailable. */
function Choice<T extends string>({ label, value, options, onChange, caption }: { label: string; value: T; options: { value: T; label: ReactNode; disabled?: boolean; title?: string }[]; onChange: (v: T) => void; caption?: string }) {
  const group = (
    <div className="segmented ob-choice" role="radiogroup" aria-label={label}>
      {options.map((o) => (
        <button key={o.value} type="button" role="radio" aria-checked={value === o.value} aria-disabled={o.disabled || undefined} disabled={o.disabled} title={o.title} className={value === o.value ? 'on' : ''} onClick={() => onChange(o.value)}>
          {o.label}
        </button>
      ))}
    </div>
  )
  // a group whose buttons do not explain themselves (the four answers 00 … 11) gets a visible name above it
  return caption ? (
    <div className="ob-captioned">
      <span className="ob-bits-name" aria-hidden="true">
        {caption}
      </span>
      {group}
    </div>
  ) : (
    group
  )
}

/** A string of bits as buttons (top wire first): pressing one flips it. */
function BitRow({ label, n, value, onChange }: { label: string; n: number; value: number; onChange: (v: number) => void }) {
  return (
    <div className="ob-bits" role="group" aria-label={label}>
      <span className="ob-bits-name">{label}</span>
      {[...bitsOf(value, n)].map((b, k) => (
        <button key={k} type="button" className={`ob-bit${b === '1' ? ' one' : ''}`} aria-pressed={b === '1'} aria-label={`${label}, bit ${k + 1} of ${n}: ${b}`} onClick={() => onChange(value ^ (1 << (n - 1 - k)))}>
          {b}
        </button>
      ))}
    </div>
  )
}

/** One stage kind drawn bare in its own svg on the 709 stage ground. */
function Stage({ kind, w, h, label, className, children }: { kind: StageKind; w: number; h: number; label: string; className: string; children: ReactNode }) {
  return (
    <svg className={`svgk svgk-stage ${className}`} viewBox={`0 0 ${w} ${h}`} width={w} height={h} style={stageCssVars(kind, 'qc709') as React.CSSProperties} role="img" aria-label={label}>
      <rect x={0} y={0} width={w} height={h} fill={STAGE_THEME.qc709.bg[kind]} rx={6} />
      {children}
    </svg>
  )
}

export default function OracleBench({ mode, n, family, a, b, marked, s, answer, x, step = 0, editable = true }: OracleBenchProps) {
  const [setup, setSetup] = useState<BenchSetup>(() => normalizeSetup({ mode, n, family, a, b, marked, s, answer, x }))
  const [hist, setHist] = useState<BenchState[]>(() => [stateAt(setup.mode, step)])
  const [boxW, boxRef] = useBoxWidth(BASE_W)
  const scrollRef = useRef<HTMLDivElement | null>(null)

  const algorithmChoices: readonly OracleBenchMode[] = mode === 'hadamard' ? ['hadamard'] : ALGORITHM_MODES
  const cur = hist[hist.length - 1]
  const m = useMemo(() => benchModel(setup, cur), [setup, cur])
  const sm = m.setup.mode
  const edit = (patch: Partial<BenchSetup>) => {
    const next = normalizeSetup({ ...setup, ...patch })
    setSetup(next)
    setHist([START])
  }
  const press = (op: BenchOp) => {
    const next = applyOp(sm, m.state, op)
    if (next) setHist((h) => [...h, next])
  }

  // the three kinds, resolved by their own resolvers from the model's states
  const rc = useMemo(() => resolveCircuitStage(m.circuitState, 1), [m.circuitState])
  const ra = useMemo(() => resolveAmplitudes(m.ampState, 1), [m.ampState])
  const rp = useMemo(() => (m.planeState ? resolveGroverPlaneStage(m.planeState, 1) : null), [m.planeState])

  const w = boxW
  const circuitW = Math.max(w, 96 + 40 * rc.columns.length)
  const circuitH = 85 + 64 * rc.n
  // the bars and the plane are laid out for at least 440 px / 400 px and shrink to a narrower column (their labels would collide at phone width otherwise);
  // they sit one under the other: the widget's column is never wide enough for both side by side
  const planeW = 400
  const planeH = 360
  const barsW = Math.max(w, 440)
  const barsH = ra.amps.length > 8 ? 300 : 260

  // a long circuit scrolls sideways; keep the cursor in view
  useEffect(() => {
    const el = scrollRef.current
    if (!el || circuitW <= el.clientWidth) return
    const x = 76 + (rc.cursor / Math.max(1, rc.columns.length)) * (circuitW - 90)
    el.scrollLeft = Math.max(0, x - el.clientWidth / 2)
  }, [circuitW, rc.cursor, rc.columns.length])

  const wires = rc.n
  const circuitLabel = `Circuit on ${wires} wires, ${rc.columns.length} columns: ${circuitReadouts(rc).map((x) => x.text).join('; ')}`
  const barsLabel = `Bars: ${ampReadouts(ra).map((x) => x.text).join('; ')}`
  const planeLabel = rp ? `Grover plane: ${groverPlaneReadouts(rp).map((x) => x.text).join('; ')}` : ''
  const r = N_RANGE[sm]

  return (
    <WidgetFrame title={`${sm === 'hadamard' ? 'Hadamard' : 'Oracle'} bench: step the circuit, watch the bars`}>
      <div className="ob" data-mode={sm}>
        <div className="ob-grid">
          {editable && (
            <div className="ob-setup">
              {/* a bench that starts in Hadamard signs offers only that: the names of the algorithms belong to the units that introduce them */}
              <Choice label="Algorithm" value={sm} onChange={(v) => edit({ mode: v })} options={algorithmChoices.map((v) => ({ value: v, label: MODE_NAMES[v] }))} />
              {r.min !== r.max && <Slider label="wires n" value={m.setup.n} min={r.min} max={r.max} step={1} onChange={(v) => edit({ n: v })} format={(v) => `${v} (N = ${2 ** v})`} />}
              {sm === 'hadamard' && <BitRow label="Starting string x" n={m.setup.n} value={m.setup.x} onChange={(v) => edit({ x: v })} />}
              {sm === 'dj' && (
                <Choice
                  label="Function f"
                  value={m.setup.family}
                  onChange={(v) => edit({ family: v })}
                  options={DJ_FAMILIES.map((v) => ({ value: v, label: FAMILY_NAMES[v], disabled: v === 'balanced' && m.setup.n < 3, title: v === 'balanced' && m.setup.n < 3 ? 'for n = 1 and 2 every balanced function is linear' : undefined }))}
                />
              )}
              {sm === 'dj' && m.setup.family === 'constant' && (
                <Choice label="Value of f" value={String(m.setup.b) as '0' | '1'} onChange={(v) => edit({ b: v === '1' ? 1 : 0 })} options={[{ value: '0', label: 'f = 0' }, { value: '1', label: 'f = 1' }]} />
              )}
              {((sm === 'dj' && m.setup.family === 'linear') || sm === 'bv') && (
                <>
                  <BitRow label="Hidden string a" n={m.setup.n} value={m.setup.a} onChange={(v) => edit({ a: v })} />
                  <Choice label="Hidden bit b" value={String(m.setup.b) as '0' | '1'} onChange={(v) => edit({ b: v === '1' ? 1 : 0 })} options={[{ value: '0', label: 'b = 0' }, { value: '1', label: 'b = 1' }]} />
                </>
              )}
              {sm === 'grover' && <BitRow label="Marked item" n={m.setup.n} value={m.setup.marked} onChange={(v) => edit({ marked: v })} />}
              {sm === 'simon' && (
                <>
                  <BitRow label="Secret string s" n={m.setup.n} value={m.setup.s} onChange={(v) => v !== 0 && edit({ s: v })} />
                  <Choice
                    label="Answer wires read as"
                    caption="Answer wires read as"
                    value={String(m.setup.answer) as '0' | '1' | '2' | '3'}
                    onChange={(v) => {
                      setSetup(normalizeSetup({ ...setup, answer: Number(v) }))
                    }}
                    options={[0, 1, 2, 3].map((v) => ({ value: String(v) as '0' | '1' | '2' | '3', label: bitsOf(v, m.setup.n - 1) }))}
                  />
                </>
              )}
            </div>
          )}
          <div className="ob-steps">
            <div className="ob-ops" role="group" aria-label="Circuit steps">
              {BENCH_OPS[sm].map((op) => (
                <button key={op.id} type="button" className="btn" disabled={!m.can[op.id]} onClick={() => press(op.id)}>
                  {op.label}
                </button>
              ))}
              <button type="button" className="btn ghost" disabled={hist.length <= 1} onClick={() => setHist((h) => (h.length > 1 ? h.slice(0, -1) : h))}>
                Back
              </button>
              <button type="button" className="btn ghost" disabled={hist.length <= 1} onClick={() => setHist([START])}>
                Reset
              </button>
            </div>
            <p className="widget-note ob-headline" role="status">
              {m.headline}
            </p>
          </div>
          <div className="ob-draw" ref={boxRef}>
            <div className="ob-scroll" ref={scrollRef} tabIndex={circuitW > w ? 0 : undefined} role={circuitW > w ? 'group' : undefined} aria-label={circuitW > w ? 'Circuit, scrolls sideways' : undefined}>
              <Stage kind="circuit" w={circuitW} h={circuitH} label={circuitLabel} className="ob-circuit">
                <CircuitScene state={rc} mode="stage" width={circuitW} height={circuitH} bare />
              </Stage>
            </div>
            <div className="ob-lower">
              <Stage kind="amplitudes" w={barsW} h={barsH} label={barsLabel} className="ob-bars">
                {/* the scene keeps 14 px at its left edge, too little for the axis labels of a signed view (0.5, −1): a gutter of 16 px */}
                <g transform="translate(16 0)">
                  <AmplitudesScene state={ra} mode="stage" width={barsW - 16} height={barsH} bare />
                </g>
              </Stage>
              {rp && (
                <div className={`ob-plane-box${m.planeLive ? '' : ' dim'}`}>
                  <Stage kind="grover-plane" w={planeW} h={planeH} label={m.planeLive ? planeLabel : 'Grover plane, drawn once the start state is prepared'} className="ob-plane">
                    <GroverPlaneScene state={rp} mode="stage" width={planeW} height={planeH} bare />
                  </Stage>
                  {!m.planeLive && <p className="widget-note">The plane starts once |w₀⟩ is prepared: press Prepare.</p>}
                </div>
              )}
            </div>
          </div>
          <ul className="ob-readings" aria-label="Readings">
            {m.readings.map((x) => (
              <li key={x.key} data-reading={x.key}>
                {x.text}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </WidgetFrame>
  )
}
