/**
 * The Operator Lab (D-lab §2.2; decisions/lab.md; the user's Q2 answer (a): typed-matrix results appear at once, with
 * an optional "Predict first" switch, off by default). A lazy chunk of its own, loaded by LabPage for #/lab/operator;
 * Babylon still arrives only through useLabEngine's dynamic import (the lab gate).
 *
 * Paper column (DOM, canonical): presets, a₀ and a⃗, the 2×2 cells (caret at a parse error, plain reason), the display
 * basis, ψ₀, τ (and "Play the turn"), operator B, the three handles' keyboard twins, Predict first, Try this.
 * Stage: two linked views with a passport each (fidelity note one click away), engine-only readouts (aria-live when a
 * change ends), DOM labels placed by projection. Every number comes from operatorModel (engine).
 */
import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { useSearchParams } from 'react-router-dom'
import { PASSPORT } from '../../../content/stage'
import { rotateBloch, type Vec3 } from '../../../physics/spin'
import { LIMITS, evalReal, parse } from '../../../physics/expr'
import { POLE_LABELS, type Pole } from '../../../stage/scenes/bloch/blochLabels'
import { useStageFlag } from '../../../stage/store'
import { useMedia, WIDE_QUERY } from '../../../stage/useLiveStage'
import { Rich } from '../../../ui/Rich'
import { degText, short2, turnText } from '../../format'
import type { LabHandle, OperatorHandle } from '../../handle'
import { HandleTwin } from '../../HandleTwin'
import { registerOperatorApi } from '../../instrument'
import { LabFallback, LabPassport, useLabStage, useProjectedLabels, useSplit, type LabLabel } from '../../LabStage'
import { presetFrom } from '../../presets'
import { OPERATOR_FIDELITY } from './fidelity'
import {
  A0_MAX,
  A_MAX,
  CELL_REASON,
  cellsOf,
  checkGuess,
  matrixOf,
  OP_PRESETS,
  operatorModel,
  SETUPS,
  TAU_MAX,
  tauText,
  TRY_THIS,
  type Basis,
  type OperatorModel,
  type OperatorParams,
  type OpPresetId,
  type Readout,
} from './model'
import {
  applyPreset,
  applySetup,
  dragHandle,
  nudgeHandle,
  opStore,
  reveal,
  setA0,
  setAk,
  setB,
  setBasis,
  setCell,
  setFocus,
  setGuess,
  setPredict,
  setPsi0Angles,
  setPsi0Named,
  setSn,
  setSplit,
  setTau,
  useOperator,
} from './store'

/** The engine handle of the mounted stage (for the __lab drag bench, which updates the scene synchronously). */
let liveHandle: LabHandle | null = null
const TAU_STEP = Math.PI / 36
const KETS = ['+z', '-z', '+x', '-x', '+y', '-y'] as const
const deg = (rad: number) => (rad * 180) / Math.PI
const rad = (d: number) => (d * Math.PI) / 180

/* ------------------------------------------------------------------------------------------------ */
/* "Play the turn" (D-lab §5 motion 3): the bead travels ψ₀ → U(τ)ψ₀ at 400 ms per 90°, ≤ 1.6 s; a cut without motion */
/* ------------------------------------------------------------------------------------------------ */
let playRaf = 0
function stopTurn() {
  if (playRaf) cancelAnimationFrame(playRaf)
  playRaf = 0
}
function playTurn(motion: boolean) {
  stopTurn()
  const target = opStore.get().tau
  const m = operatorModel(opStore.get())
  const angle = m.act ? m.act.angle : 0
  if (!motion || angle <= 0) return setTau(target)
  const dur = Math.min(1600, Math.max(250, (400 * angle) / (Math.PI / 2)))
  const t0 = performance.now()
  setTau(0)
  const step = () => {
    const u = Math.min(1, (performance.now() - t0) / dur)
    setTau(target * u)
    playRaf = u < 1 ? requestAnimationFrame(step) : 0
  }
  playRaf = requestAnimationFrame(step)
}

/* ------------------------------------------------------------------------------------------------ */
/* The bench                                                                                          */
/* ------------------------------------------------------------------------------------------------ */
export default function OperatorBench({ tabs }: { tabs: ReactNode }) {
  const p = useOperator()
  const model = useMemo(() => operatorModel(p), [p])
  const [search] = useSearchParams()
  // ruling 7: only an allowlisted id is read from the URL; it names a setup, never state
  const presetId = presetFrom(SETUPS, search.get('preset'))
  useEffect(() => {
    if (presetId) applySetup(presetId)
  }, [presetId])
  useEffect(() => () => stopTurn(), [])
  useEffect(
    () =>
      registerOperatorApi({
        state: () => opStore.get(),
        readouts: () => {
          const m = operatorModel(opStore.get())
          const map = (rs: Readout[]) => Object.fromEntries(rs.map((r) => [r.key, r.text]))
          return { op: map(m.readouts.op), state: map(m.readouts.state) }
        },
        drag: (handle, pts) => {
          const h = handle as OperatorHandle
          pts.forEach((pt, i) => dragHandle(h, i === 0 ? 'start' : 'move', pt))
          dragHandle(h, 'end', null)
        },
        setup: (id) => {
          const ok = presetFrom(SETUPS, id)
          if (ok) applySetup(ok)
        },
        dragStep: (handle) => {
          if (handle === 'tip') {
            return (i) => {
              const t = (i / 60) * 2 * Math.PI
              dragHandle('tip', 'move', [0.8 * Math.cos(t), 0.8 * Math.sin(t), 0.4])
              liveHandle?.update(operatorModel(opStore.get()).view)
            }
          }
          if (handle === 'bead') {
            const m0 = operatorModel(opStore.get())
            if (!m0.orbit) return null
            const { axis } = m0.orbit
            const r0 = m0.r0
            return (i) => {
              // points of the orbit's plane, one lap per 60 frames (the drag path; the page turns them into τ)
              dragHandle('bead', 'move', rotateBloch(axis, ((i + 1) / 60) * 2 * Math.PI, r0))
              liveHandle?.update(operatorModel(opStore.get()).view)
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
        <OperatorPanel p={p} model={model} note={presetId ? SETUPS[presetId].note : undefined} />
      </aside>
      <OperatorStage p={p} model={model} />
    </>
  )
}

/* ------------------------------------------------------------------------------------------------ */
/* Paper column                                                                                       */
/* ------------------------------------------------------------------------------------------------ */
function Range(props: { label: ReactNode; min: number; max: number; step: number; value: number; text: string; onChange: (v: number) => void; name: string; disabled?: boolean }) {
  return (
    <label className="lab-range">
      <span>{props.label}</span>
      <input
        type="range"
        min={props.min}
        max={props.max}
        step={props.step}
        value={props.value}
        disabled={props.disabled}
        aria-label={props.name}
        aria-valuetext={`${props.name} ${props.text}`}
        onChange={(e) => props.onChange(Number(e.currentTarget.value))}
      />
      <output className="mono">{props.text}</output>
    </label>
  )
}

function OperatorPanel({ p, model, note }: { p: OperatorParams; model: OperatorModel; note?: string }) {
  const wide = useMedia(WIDE_QUERY)
  const motion = useStageFlag('motion')
  const cells = p.source === 'cells' ? p.cells : cellsOf(matrixOf(p), p.basis)
  const hidden = model.pending
  const [tauInput, setTauInput] = useState<string | null>(null)
  const guess = model.pending ? null : p.predict && p.revealed ? checkGuess(p.guess, model.eig) : null
  const err = p.cellError
  return (
    <>
      <h1>Operator Lab</h1>
      <p className="section-lede">An operator as an arrow and a gauge, and the turn it generates on a state.</p>
      {note && <p className="lab-note" data-preset-note>{note}</p>}
      {(!wide || p.split === 'tb') && <PaperReadouts model={model} sticky={wide} />}

      <fieldset className="lab-controls">
        <legend>Operator A</legend>
        <div className="lab-row lab-presets" role="group" aria-label="Presets">
          {OP_PRESETS.map((q) => (
            <button key={q.id} type="button" aria-pressed={p.preset === q.id} aria-label={`Preset ${q.name}`} onClick={() => applyPreset(q.id)}>
              <Rich as="span" text={q.label} />
            </button>
          ))}
        </div>
        <div className="lab-row lab-sn">
          <label>
            <Rich as="span" text="$S_n$: $\theta$" />{' '}
            <input type="number" min={0} max={180} step={5} value={p.sn.theta} aria-label="S n polar angle theta in degrees" onChange={(e) => setSn(Number(e.currentTarget.value), p.sn.phi)} />°
          </label>
          <label>
            <Rich as="span" text="$\varphi$" />{' '}
            <input type="number" min={-180} max={360} step={5} value={p.sn.phi} aria-label="S n azimuth phi in degrees" onChange={(e) => setSn(p.sn.theta, Number(e.currentTarget.value))} />°
          </label>
        </div>
        <p className="lab-small">
          ħ = 1 inside the engine. The spin presets carry ħ (their readouts end in ħ); the others are plain numbers.
        </p>
        {hidden ? (
          <p className="lab-small" data-hidden-params>
            a₀ and a are hidden until you check your prediction.
          </p>
        ) : (
          <div className="lab-params">
            <Range label={<Rich as="span" text="$a_0$" />} name="a zero" min={-A0_MAX} max={A0_MAX} step={0.01} value={model.a0} text={short2(model.a0)} onChange={setA0} />
            {(['x', 'y', 'z'] as const).map((c, k) => (
              <Range
                key={c}
                label={<Rich as="span" text={`$a_${c}$`} />}
                name={`a ${c}`}
                min={-A_MAX}
                max={A_MAX}
                step={0.01}
                value={model.a[k]}
                text={short2(model.a[k])}
                onChange={(v) => setAk(k as 0 | 1 | 2, v)}
              />
            ))}
            {!model.hermitian && <p className="lab-small">A is not Hermitian: the sliders show the real parts; moving one makes A Hermitian again.</p>}
          </div>
        )}
        <fieldset className="lab-matrix">
          <legend>
            Matrix of A in the basis{' '}
            {(['z', 'x', 'y'] as Basis[]).map((b) => (
              <label key={b} className="lab-basis">
                <input type="radio" name="op-basis" value={b} checked={p.basis === b} onChange={() => setBasis(b)} /> {b}
              </label>
            ))}
          </legend>
          <div className="lab-cells">
            {([0, 1] as const).map((r) =>
              ([0, 1] as const).map((k) => {
                const bad = err && err.cell[0] === r && err.cell[1] === k
                return (
                  <input
                    key={`${r}${k}`}
                    className="mono"
                    type="text"
                    spellCheck={false}
                    autoComplete="off"
                    maxLength={64}
                    aria-label={`Matrix entry row ${r + 1}, column ${k + 1}`}
                    aria-invalid={bad || undefined}
                    aria-describedby={bad ? 'op-cell-error' : undefined}
                    value={cells[r][k]}
                    onChange={(e) => setCell(r, k, e.currentTarget.value)}
                  />
                )
              }),
            )}
          </div>
          {err ? (
            <div id="op-cell-error" className="lab-cell-error" role="alert">
              <pre className="mono" aria-hidden>
                {cells[err.cell[0]][err.cell[1]]}
                {'\n'}
                {' '.repeat(Math.min(err.pos, 64))}^
              </pre>
              <p>
                Row {err.cell[0] + 1}, column {err.cell[1] + 1}, at character {err.pos + 1}: {CELL_REASON[err.reason]} The picture keeps the last matrix that read correctly.
              </p>
            </div>
          ) : (
            <p className="lab-small">Type numbers, i, pi, sqrt(…): results appear at once{p.predict ? ' (after your prediction)' : ''}.</p>
          )}
        </fieldset>
        <label className="lab-select">
          Operator B (commutator mode){' '}
          <select value={p.B ?? ''} onChange={(e) => setB((e.currentTarget.value || null) as OpPresetId | null)}>
            <option value="">none</option>
            {OP_PRESETS.map((q) => (
              <option key={q.id} value={q.id}>
                {q.name}
              </option>
            ))}
          </select>
        </label>
      </fieldset>

      <fieldset className="lab-controls">
        <legend>State and turn</legend>
        <div className="lab-row" role="group" aria-label="Start state">
          {KETS.map((k) => (
            <button key={k} type="button" aria-pressed={p.psi0.named === k} aria-label={`Start state ket ${k}`} onClick={() => setPsi0Named(k)}>
              <Rich as="span" text={`$|{${k}}\\rangle$`} />
            </button>
          ))}
        </div>
        <Range label={<Rich as="span" text="$\theta_0$" />} name="start theta" min={0} max={180} step={1} value={Math.round(deg(p.psi0.theta))} text={degText(p.psi0.theta)} onChange={(v) => setPsi0Angles(rad(v), p.psi0.phi)} />
        <Range
          label={<Rich as="span" text="$\varphi_0$" />}
          name="start phi"
          min={-180}
          max={180}
          step={1}
          value={Math.round(deg(Math.atan2(Math.sin(p.psi0.phi), Math.cos(p.psi0.phi))))}
          text={degText(Math.atan2(Math.sin(p.psi0.phi), Math.cos(p.psi0.phi)))}
          onChange={(v) => setPsi0Angles(p.psi0.theta, rad(v))}
        />
        <Range
          label={<Rich as="span" text="$\tau$" />}
          name="tau"
          min={0}
          max={Math.round(TAU_MAX / TAU_STEP)}
          step={1}
          value={Math.round(p.tau / TAU_STEP)}
          text={tauText(p.tau)}
          onChange={(v) => {
            stopTurn()
            setTau(v * TAU_STEP)
          }}
        />
        <div className="lab-row">
          <label className="lab-tau">
            τ ={' '}
            <input
              className="mono"
              type="text"
              maxLength={40}
              aria-label="tau, typed (for example 2pi)"
              value={tauInput ?? ''}
              placeholder={tauInput === null ? tauText(p.tau) : undefined}
              onChange={(e) => {
                const t = e.currentTarget.value
                setTauInput(t)
                const r = parse(t, { mode: 'real', limits: LIMITS.answer })
                const v = r.ok ? evalReal(r.ast) : NaN
                if (Number.isFinite(v)) {
                  stopTurn()
                  setTau(v)
                }
              }}
              onBlur={() => setTauInput(null)}
            />
          </label>
          <button type="button" onClick={() => playTurn(motion)} disabled={!model.act || hidden}>
            Play the turn
          </button>
        </div>
      </fieldset>

      <fieldset className="lab-controls">
        <legend>Handles (keyboard twins of the drags)</legend>
        <HandleTwin
          label="Tip of the arrow a"
          dims={3}
          valueText={`a = (${model.a.map(short2).join(', ')})`}
          disabled={hidden}
          disabledText="hidden until you check"
          onNudge={(n) => nudgeHandle('tip', n)}
          onFocusChange={(f) => setFocus(f ? 'tip' : null)}
        />
        <HandleTwin
          label="Start state ψ₀"
          dims={2}
          valueText={p.psi0.named ? `|${p.psi0.named}⟩` : `θ ${degText(p.psi0.theta)}, φ ${degText(p.psi0.phi)}`}
          onNudge={(n) => nudgeHandle('psi0', n)}
          onFocusChange={(f) => setFocus(f ? 'psi0' : null)}
        />
        <HandleTwin
          label="Bead U(τ)ψ₀ on its orbit"
          dims={1}
          valueText={model.act ? `τ = ${tauText(p.tau)}, turn ${turnText(model.act.angle)}` : 'no turn'}
          slider={{ now: Number(p.tau.toFixed(3)), min: 0, max: Number(TAU_MAX.toFixed(3)) }}
          disabled={!model.view.draggable.bead}
          disabledText={model.eigenstate ? 'ψ₀ is an eigenstate: only the phase changes' : 'hidden until you check'}
          onNudge={(n) => nudgeHandle('bead', n)}
          onFocusChange={(f) => setFocus(f ? 'bead' : null)}
        />
      </fieldset>

      <fieldset className="lab-controls">
        <legend>Predict first</legend>
        <label className="lab-check">
          <input type="checkbox" checked={p.predict} onChange={(e) => setPredict(e.currentTarget.checked)} /> Hide the results of each new A until I predict
          its eigenvalues
        </label>
        {model.pending && (
          <form
            className="lab-predict"
            onSubmit={(e) => {
              e.preventDefault()
              reveal()
            }}
          >
            <label>
              <Rich as="span" text="$\lambda_+$" /> <input className="mono" type="text" maxLength={40} value={p.guess[0]} onChange={(e) => setGuess(0, e.currentTarget.value)} aria-label="your lambda plus" />
            </label>
            <label>
              <Rich as="span" text="$\lambda_-$" /> <input className="mono" type="text" maxLength={40} value={p.guess[1]} onChange={(e) => setGuess(1, e.currentTarget.value)} aria-label="your lambda minus" />
            </label>
            <button type="submit">Check</button>
          </form>
        )}
        {guess && (
          <p className="lab-small" role="status">
            Your eigenvalues: {p.guess[0] || '—'} {guess.ok[0] ? '✓' : '✗'} · {p.guess[1] || '—'} {guess.ok[1] ? '✓' : '✗'} (the readouts give the engine’s).
          </p>
        )}
      </fieldset>

      <div className="lab-try">
        <p>
          <strong>Try this.</strong> <Rich as="span" text={TRY_THIS} />
        </p>
        <button type="button" onClick={() => applySetup('sz-lap')}>
          Set it up
        </button>
      </div>

    </>
  )
}

/** The readouts in the paper column: below 900 px (no 3D) and, sticky, beside the top/bottom split. */
function PaperReadouts({ model, sticky }: { model: OperatorModel; sticky: boolean }) {
  return (
    <div className={`lab-readout-list mono${sticky ? ' lab-sticky' : ''}`} aria-live="polite" data-readouts="paper">
      <p className="lab-small">Operator space</p>
      <ul aria-label="Operator readouts">
        {model.readouts.op.map((r) => (
          <li key={r.key} data-key={r.key} data-paper-tone={r.tone}>
            {r.text}
          </li>
        ))}
      </ul>
      <p className="lab-small">State space</p>
      <ul aria-label="State readouts">
        {model.readouts.state.map((r) => (
          <li key={r.key} data-key={r.key} data-paper-tone={r.tone}>
            {r.text}
          </li>
        ))}
      </ul>
    </div>
  )
}

/* ------------------------------------------------------------------------------------------------ */
/* Stage                                                                                              */
/* ------------------------------------------------------------------------------------------------ */
interface LabelSpec extends LabLabel {
  text: string
  tone: 'text' | 'op' | 'plus' | 'minus' | 'state' | 'silver'
  tier: 'axis' | 'chip'
}
const POLES: [Pole, Vec3][] = [
  ['+x', [1.08, 0, 0]],
  ['-x', [-1.08, 0, 0]],
  ['+y', [0, 1.08, 0]],
  ['-y', [0, -1.08, 0]],
  ['+z', [0, 0, 1.16]],
  ['-z', [0, 0, -1.16]],
]
const out = (v: Vec3, k: number, extra = 0): Vec3 => {
  const l = Math.hypot(...v) || 1
  const s = k + extra / l
  return [v[0] * s, v[1] * s, v[2] * s]
}

function labelsOf(m: OperatorModel): LabelSpec[] {
  const v = m.view
  const text = (key: string) => m.readouts.op.find((r) => r.key === key)?.text ?? ''
  const tip = out(v.a, v.scale)
  const L: LabelSpec[] = [
    { key: 'ax-x', view: 'op', at: [1.76, 0, 0], text: '$a_x$', tone: 'silver', tier: 'axis' },
    { key: 'ax-y', view: 'op', at: [0, 1.76, 0], text: '$a_y$', tone: 'silver', tier: 'axis' },
    { key: 'ax-z', view: 'op', at: [0.14, 0, 1.7], text: '$a_z$', tone: 'silver', tier: 'axis' },
    { key: 'ghost', view: 'op', at: [0, 0, -1], dx: 0, dy: 16, text: 'ghost Bloch sphere · state space', tone: 'silver', tier: 'axis' },
    { key: 'vec-a', view: 'op', at: v.showArrow && Math.hypot(...v.a) > 1e-6 ? out(tip, 1, 0.16) : null, text: '$\\vec a$', tone: 'op', tier: 'axis' },
    { key: 'lam+', view: 'op', at: v.axis ? out(v.axis, 1.24) : null, text: text('lam+'), tone: 'plus', tier: 'axis' },
    { key: 'lam-', view: 'op', at: v.axis ? out(v.axis, -1.24) : null, text: text('lam-'), tone: 'minus', tier: 'axis' },
    { key: 'a0', anchor: 'gauge-a0', dx: 22, text: '$a_0$', tone: 'op', tier: 'axis' },
    { key: 'gauge', anchor: 'gauge-top', text: 'a₀ gauge', tone: 'silver', tier: 'axis' },
    { key: 'vec-b', view: 'op', at: v.b && Math.hypot(...v.b) > 1e-6 ? out(out(v.b, v.scale), 1, 0.14) : null, text: '$\\vec b$', tone: 'op', tier: 'axis' },
    { key: 'cross', view: 'op', at: v.cross && Math.hypot(...v.cross) > 1e-6 ? out(out(v.cross, v.scale), 1, 0.2) : null, text: '$[A,B]/2i$', tone: 'op', tier: 'axis' },
  ]
  for (const [pole, at] of POLES) L.push({ key: `pole${pole}`, view: 'state', at, text: POLE_LABELS.spin[pole], tone: 'silver', tier: 'axis' })
  L.push(
    { key: 'psi0', view: 'state', at: v.psi0, dx: 18, dy: -16, text: '$\\psi_0$', tone: 'state', tier: 'axis' },
    { key: 'bead', view: 'state', at: v.showBead ? v.bead : null, dx: 26, dy: 16, text: '$U(\\tau)\\psi_0$', tone: 'state', tier: 'axis' },
    { key: 'ket+', view: 'state', at: v.axis ? out(v.axis, 1.28) : null, text: '$|\\lambda_+\\rangle$', tone: 'plus', tier: 'axis' },
    { key: 'ket-', view: 'state', at: v.axis ? out(v.axis, -1.28) : null, text: '$|\\lambda_-\\rangle$', tone: 'minus', tier: 'axis' },
  )
  return L
}

function Readouts({ list, live, view }: { list: Readout[]; live: boolean; view: string }) {
  return (
    <div className="stage-readouts" data-view={view} aria-live={live ? 'polite' : 'off'}>
      {list.map((r) => (
        <span key={r.key} className="stage-readout" data-key={r.key} data-tone={r.tone}>
          {r.text}
        </span>
      ))}
    </div>
  )
}

function OperatorStage({ p, model }: { p: OperatorParams; model: OperatorModel }) {
  const { wide, host, handle, status, lost, givenUp } = useLabStage('operator')
  const [dragging, setDragging] = useState(false)
  useSplit(host, setSplit)
  const view = model.view
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
        if (a.type !== 'drag') return
        if (a.phase === 'start') {
          stopTurn()
          setDragging(true)
        }
        dragHandle(a.handle as OperatorHandle, a.phase, a.p)
        if (a.phase === 'end') setDragging(false)
      }),
    [handle],
  )
  const labels = useMemo(() => labelsOf(model), [model])
  const labelRef = useProjectedLabels(handle, labels)

  if (!wide)
    return (
      <p className="lab-note lab-narrow" role="note">
        The two 3D views open in a window at least 900 px wide. The readouts on this page come from the same engine.
      </p>
    )
  return (
    <section className="lab-stage lab-stage-split" ref={host} aria-label="3D views" data-status={status} data-split={p.split}>
      <div className="stage-overlay">
        <div className="lab-views" data-split={p.split}>
          <div className="lab-view" data-view="op">
            <LabPassport passport={PASSPORT['operator-space']} kind="operator-space" view="op" fidelity={OPERATOR_FIDELITY} />
            {p.split === 'lr' && <Readouts list={model.readouts.op} live={!dragging} view="op" />}
          </div>
          <div className="lab-view" data-view="state">
            <LabPassport passport={PASSPORT.bloch} kind="bloch" view="state" fidelity={OPERATOR_FIDELITY} />
            {p.split === 'lr' && <Readouts list={model.readouts.state} live={!dragging} view="state" />}
          </div>
        </div>
        {labels.map((l) => (
          <span
            key={l.key}
            ref={labelRef(l.key)}
            className="stage-label lab-label"
            data-label={l.key}
            data-tier={l.tier}
            data-tone={l.tone}
            data-hidden="1"
            style={{ opacity: 0 }}
          >
            <Rich as="span" text={l.text} />
          </span>
        ))}
        <p className="stage-caption">Drag the arrow’s tip, the hollow ψ₀ or the bead. Drag anywhere else to turn both views together.</p>
      </div>
      <LabFallback lost={lost} givenUp={givenUp} status={status} />
    </section>
  )
}
