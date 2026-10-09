/**
 * Widget W1 `two-spin` (448 Lecture 10; rulings 448-L8L11 L10 R5, R7): the empty centre. Two spins and what Alice and Bob read.
 * It builds a `two-qubit` stage state from its controls and draws it with the kind's own resolver and scene (stage/svg/twoQubit.ts
 * `resolveTwoQubitStage` → TwoQubitScene): two Bloch balls carrying each spin's own arrow, and the 3×3 table of averages ⟨σ_i⊗σ_j⟩.
 * For the singlet both arrows sit at the centre of their balls while the table is −1 on its diagonal; one click turns the pair into
 * the product state |ud⟩, whose arrows reach the surface and whose table has a single cell. The pair state is a toggle
 * (singlet / |ud⟩ / the path between them, one slider). Each spin is measured along x, y or z, and "Measure" samples pairs from the
 * engine (physics/qc/twoSpin.ts: one spin first, the pair collapses, then the other), in either order, so the tallies show the order
 * not mattering. The exact chances are printed beside the tallies.
 */
import { useMemo, useRef, useState } from 'react'
import type { TwoQubitState } from '../content/stage'
import { rng } from '../physics/random'
import { type Axis, type TwoSpinKind, twoSpinJoint, twoSpinState, twoSpinSummary, twoSpinTally } from '../physics/qc/twoSpin'
import { resolveTwoQubitStage, twoQubitReadouts } from '../stage/svg/twoQubit'
import { TwoQubitScene } from '../stage/svg/TwoQubitScene'
import '../stage/svg/svg.css'
import './twoSpin.css'
import { STAGE_BG, stageCssVars } from '../stage/tokens'
import { Segmented, Slider, WidgetFrame } from '../ui/primitives'

const W = 520
const H = 250

export interface TwoSpinProps {
  /** The pair: 'singlet' (default), 'ud' (the product |ud⟩) or 'path' (cos t|ud⟩ − sin t|du⟩, one slider). */
  state?: TwoSpinKind
  /** The path's angle t in degrees, 0–90 (45 is the singlet). Only for state 'path'. */
  theta?: number
  /** The axis Alice measures along (default z). */
  axisA?: Axis
  /** The axis Bob measures along (default z). */
  axisB?: Axis
  /** Who measures first when a pair is sampled: 'A' (default) or 'B'. The tallies of both orders are kept side by side. */
  first?: 'A' | 'B'
  /** The seed of the sampler (default 10). */
  seed?: number
  /** false locks the state and the axes to the props; the Measure and Reset buttons remain. Default true. */
  editable?: boolean
}

type Counts = [number, number, number, number]
const ZERO: Counts = [0, 0, 0, 0]
const sum = (c: Counts) => c[0] + c[1] + c[2] + c[3]
const dirOf = (a: Axis) => (a === 'x' ? '+x' : a === 'y' ? '+y' : '+z') as '+x' | '+y' | '+z'
const percent = (x: number) => `${Math.round(100 * x)}%`
const share = (num: number, n: number) => (n > 0 ? percent(num / n) : '–')

/** The picture and the exact chances the controls ask for (pure; the component only draws them and adds tallies). */
export function twoSpinModel(c: { state: TwoSpinKind; theta: number; axisA: Axis; axisB: Axis }) {
  const source: TwoQubitState['source'] = c.state === 'singlet' ? { ket: { bell: '01-10' } } : c.state === 'ud' ? { ket: { ket: '01' } } : { family: 'cos-sin', thetaDeg: c.theta, pair: '01-10' }
  const st: TwoQubitState = { kind: 'two-qubit', source, arrows: 'reduced', grid: 'T', readouts: ['rLength'], axes: { a: [dirOf(c.axisA)], b: [dirOf(c.axisB)] } }
  const r = resolveTwoQubitStage(st, 1)
  const psi = twoSpinState(c.state, c.theta)
  const joint = twoSpinJoint(psi, c.axisA, c.axisB)
  return { st, r, psi, joint, exact: twoSpinSummary(joint), lines: twoQubitReadouts(r).map((x) => x.text) }
}

export default function TwoSpin({ state: state0 = 'singlet', theta: theta0 = 30, axisA: axisA0 = 'z', axisB: axisB0 = 'z', first: first0 = 'A', seed = 10, editable = true }: TwoSpinProps) {
  const [state, setState] = useState<TwoSpinKind>(state0)
  const [theta, setTheta] = useState(Math.min(90, Math.max(0, theta0)))
  const [axisA, setAxisA] = useState<Axis>(axisA0)
  const [axisB, setAxisB] = useState<Axis>(axisB0)
  const [first, setFirst] = useState<'A' | 'B'>(first0)
  const R = useRef<(() => number) | null>(null)
  const [tallies, setTallies] = useState<{ key: string; A: Counts; B: Counts }>({ key: '', A: ZERO, B: ZERO })

  const m = useMemo(() => twoSpinModel({ state, theta, axisA, axisB }), [state, theta, axisA, axisB])
  // a tally describes one setup; changing the pair or an axis starts a fresh one (the order is NOT part of it: both are kept)
  const key = `${state}|${state === 'path' ? theta : ''}|${axisA}|${axisB}`
  const A = tallies.key === key ? tallies.A : ZERO
  const B = tallies.key === key ? tallies.B : ZERO

  const measure = (n: number) => {
    if (!R.current) R.current = rng(seed)
    const add = twoSpinTally(m.psi, axisA, axisB, first, n, R.current)
    setTallies((t) => {
      const base = t.key === key ? t : { key, A: ZERO, B: ZERO }
      const cur = first === 'A' ? base.A : base.B
      const next = cur.map((x, i) => x + add[i]) as Counts
      return first === 'A' ? { ...base, A: next } : { ...base, B: next }
    })
  }
  const reset = () => {
    R.current = rng(seed)
    setTallies({ key: '', A: ZERO, B: ZERO })
  }

  const pooled = A.map((x, i) => x + B[i]) as Counts
  const N = sum(pooled)
  const rowFor = (label: string, c: Counts) => {
    const n = sum(c)
    return (
      <tr key={label}>
        <th scope="row">{label}</th>
        <td className="mono">{n}</td>
        <td className="mono">{share(c[0] + c[1], n)}</td>
        <td className="mono">{share(c[0] + c[2], n)}</td>
        <td className="mono">{share(c[1] + c[2], n)}</td>
      </tr>
    )
  }

  return (
    <WidgetFrame title="Two spins: what each one says, what the pair says">
      <svg className="svgk svgk-stage two-spin-svg" viewBox={`0 0 ${W} ${H}`} style={stageCssVars('two-qubit') as React.CSSProperties} role="img" aria-label={m.lines.join('; ')}>
        <rect x={0} y={0} width={W} height={H} fill={STAGE_BG['two-qubit']} rx={6} />
        <TwoQubitScene state={m.r} mode="stage" width={W} height={H} bare />
      </svg>
      {editable && (
        <>
          <Segmented
            label="Pair state"
            value={state}
            onChange={setState}
            options={[
              { value: 'singlet', label: 'singlet' },
              { value: 'ud', label: 'product |ud⟩' },
              { value: 'path', label: 'path ud → singlet' },
            ]}
          />
          {state === 'path' && <Slider label="t" value={theta} min={0} max={90} step={5} onChange={setTheta} format={(v) => `${v}°`} />}
          <Segmented label="Alice measures" value={axisA} onChange={setAxisA} options={(['x', 'y', 'z'] as Axis[]).map((a) => ({ value: a, label: `Alice ${a}` }))} />
          <Segmented label="Bob measures" value={axisB} onChange={setAxisB} options={(['x', 'y', 'z'] as Axis[]).map((a) => ({ value: a, label: `Bob ${a}` }))} />
        </>
      )}
      <Segmented
        label="Who measures first"
        value={first}
        onChange={setFirst}
        options={[
          { value: 'A', label: 'Alice first' },
          { value: 'B', label: 'Bob first' },
        ]}
      />
      <div className="two-spin-buttons">
        <button className="btn" onClick={() => measure(1)}>
          Measure 1 pair
        </button>
        <button className="btn" onClick={() => measure(100)}>
          Measure 100 pairs
        </button>
        <button className="btn ghost" onClick={reset}>
          Reset tally
        </button>
      </div>
      <table className="two-spin-tally" aria-label="Tallies of the measured pairs">
        <thead>
          <tr>
            <th scope="col">order</th>
            <th scope="col">pairs</th>
            <th scope="col">Alice +1</th>
            <th scope="col">Bob +1</th>
            <th scope="col">product −1</th>
          </tr>
        </thead>
        <tbody>
          {rowFor('Alice first', A)}
          {rowFor('Bob first', B)}
          <tr className="two-spin-exact">
            <th scope="row">exact chance</th>
            <td className="mono">–</td>
            <td className="mono">{percent(m.exact.alicePlus)}</td>
            <td className="mono">{percent(m.exact.bobPlus)}</td>
            <td className="mono">{percent(m.exact.productMinus)}</td>
          </tr>
        </tbody>
      </table>
      <table className="two-spin-joint" aria-label="Both orders pooled: the four joint outcomes">
        <thead>
          <tr>
            <th scope="col">both orders pooled</th>
            <th scope="col">Bob +1</th>
            <th scope="col">Bob −1</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <th scope="row">Alice +1</th>
            <td className="mono">{share(pooled[0], N)}</td>
            <td className="mono">{share(pooled[1], N)}</td>
          </tr>
          <tr>
            <th scope="row">Alice −1</th>
            <td className="mono">{share(pooled[2], N)}</td>
            <td className="mono">{share(pooled[3], N)}</td>
          </tr>
        </tbody>
      </table>
      <p className="widget-note">
        Alice’s and Bob’s operators commute, so measuring Alice first or Bob first gives the same chances. The exact row is the Born rule on the pair.
      </p>
    </WidgetFrame>
  )
}
