import { useEffect, useMemo, useRef, useState } from 'react'
import { type Axis, type Bench, type BenchTheory, type Sign, type Tally, axisLabel, axisVector, benchTheory, fireAtom, fireMany, type Fate } from '../physics/sg'
import { useStageFlag } from '../stage/store'
import { type NamedKet } from '../physics/spin'
import { rng } from '../physics/random'
import { Plate, Segmented, WidgetFrame, pct } from '../ui/primitives'
import { parseNumber } from '../ui/parseNumber'
import { addBatch } from './sgBatch'

export interface SGLabProps {
  source?: Bench['source']
  axes?: Axis[]
  keep?: Sign[]
  /** Let the learner change axes, kept outputs, and add/remove devices. */
  editable?: boolean
  maxDevices?: number
  /** Ask for a prediction of P(+ spot) before revealing theory. */
  predict?: boolean
  showTheory?: boolean
  seed?: number
  /** Called with the bench and its exact theory whenever the learner changes it (Arcade puzzles read this). */
  onChange?: (bench: Bench, theory: BenchTheory) => void
}

const AXIS_CHOICES: { value: string; label: string }[] = [
  { value: 'z', label: 'z' },
  { value: 'x', label: 'x' },
  { value: 'y', label: 'y' },
  { value: 'tilt', label: 'tilt' },
]

const W = 760
const H = 230
const CY = 112
const deviceX = (k: number, n: number) => 150 + k * (n === 1 ? 0 : 430 / Math.max(1, n - 1))
const SPLIT = 30

/** End-on dial: the device's measurement axis as seen looking down the beam (x right, z up). */
function AxisDial({ a, x, y }: { a: Axis; x: number; y: number }) {
  const n = axisVector(a)
  const r = 13
  return (
    <g transform={`translate(${x},${y})`} aria-hidden>
      <circle r={r + 3} className="dial" />
      {a === 'y' ? (
        <>
          <circle r={4} className="dial-needle-fill" />
          <circle r={9} fill="none" className="dial-needle" />
        </>
      ) : (
        <line x1={-n[0] * r} y1={n[2] * r} x2={n[0] * r} y2={-n[2] * r} className="dial-needle" markerEnd="url(#dial-arrow)" />
      )}
    </g>
  )
}

export function SGLab({
  source: source0 = 'oven',
  axes: axes0 = ['z'],
  keep: keep0 = [],
  editable = true,
  maxDevices = 3,
  predict = false,
  showTheory: showTheory0 = false,
  seed = 448,
  onChange,
}: SGLabProps) {
  const [axes, setAxes] = useState<Axis[]>(axes0)
  const [keep, setKeep] = useState<Sign[]>(keep0.length === axes0.length - 1 ? keep0 : Array(axes0.length - 1).fill('+'))
  const [tally, setTally] = useState<Tally | null>(null)
  const [flight, setFlight] = useState<{ fate: Fate; t: number } | null>(null)
  const [guess, setGuess] = useState('')
  const [locked, setLocked] = useState<number | null>(null)
  const [showTheory, setShowTheory] = useState(showTheory0)
  const rand = useRef(rng(seed))
  const bench: Bench = useMemo(() => ({ source: source0, axes, keep }), [source0, axes, keep])
  const theory = useMemo(() => benchTheory(bench), [bench])
  const n = axes.length
  // the app's motion flag: OS setting, the topbar Motion toggle and ?motion=reduce (not the OS query alone)
  const reduced = !useStageFlag('motion')

  // Any change to the bench invalidates the counts.
  useEffect(() => {
    setTally(null)
    setFlight(null)
  }, [bench])
  const onChangeRef = useRef(onChange)
  onChangeRef.current = onChange
  useEffect(() => onChangeRef.current?.(bench, theory), [bench, theory])

  const add = (fate: Fate) =>
    setTally((t) => {
      const base = t ?? { plus: 0, minus: 0, blocked: Array(n - 1).fill(0) }
      const next = { ...base, blocked: [...base.blocked] }
      if (fate.end === 'plus') next.plus++
      else if (fate.end === 'minus') next.minus++
      else next.blocked[fate.end]++
      return next
    })

  const fireOne = () => {
    const fate = fireAtom(bench, rand.current)
    if (reduced) return add(fate)
    const start = performance.now()
    const dur = 350 + 300 * fate.path.length
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / dur)
      setFlight({ fate, t })
      if (t < 1) requestAnimationFrame(tick)
      else {
        setFlight(null)
        add(fate)
      }
    }
    requestAnimationFrame(tick)
  }
  // draw the batch here, once, and hand React a pure updater: StrictMode runs an updater twice in dev, and drawing inside
  // it consumed two batches of the seeded generator per click (P-Q1 review item 21: seed 709 read 86/114 in dev, 100/100
  // in production)
  const fireN = (k: number) => setTally(addBatch(fireMany(bench, k, rand.current)))

  const setAxis = (k: number, v: string) =>
    setAxes((as) => as.map((a, i) => (i === k ? (v === 'tilt' ? 45 : (v as Axis)) : a)))
  const setTilt = (k: number, deg: number) => setAxes((as) => as.map((a, i) => (i === k ? deg : a)))
  const addDevice = () => {
    setAxes((as) => [...as, 'x'])
    setKeep((ks) => [...ks, '+'])
  }
  const removeDevice = () => {
    setAxes((as) => as.slice(0, -1))
    setKeep((ks) => ks.slice(0, -1))
  }

  // Beam path polyline for the flying atom.
  const flightPoint = (fate: Fate, t: number): [number, number] => {
    const pts: [number, number][] = [[70, CY]]
    fate.path.forEach((s, k) => {
      const x = deviceX(k, n)
      pts.push([x - 32, CY], [x + 40, CY + (s === '+' ? -SPLIT : SPLIT)])
      const blocked = typeof fate.end === 'number' && fate.end === k
      if (blocked) pts.push([x + 70, CY + (s === '+' ? -SPLIT - 12 : SPLIT + 12)])
    })
    if (typeof fate.end !== 'number') pts.push([W - 70, CY + (fate.end === 'plus' ? -44 : 44)])
    const segs = pts.slice(1).map((p, i) => Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1]))
    let d = t * segs.reduce((a, b) => a + b, 0)
    for (let i = 0; i < segs.length; i++) {
      if (d <= segs[i]) {
        const f = d / segs[i]
        return [pts[i][0] + f * (pts[i + 1][0] - pts[i][0]), pts[i][1] + f * (pts[i + 1][1] - pts[i][1])]
      }
      d -= segs[i]
    }
    return pts[pts.length - 1]
  }

  const total = tally ? tally.plus + tally.minus + tally.blocked.reduce((a, b) => a + b, 0) : 0
  const guessVal = parseNumber(guess.replace('%', ''))
  const guessP = guessVal === null ? null : guess.includes('%') || guessVal > 1 ? guessVal / 100 : guessVal
  const revealed = !predict || locked !== null
  const sourceLabel = source0 === 'oven' ? 'oven' : `|${source0}⟩`

  return (
    <WidgetFrame
      title="Stern–Gerlach bench"
      wide
      readout={
        <div className="sg-readout">
          <Plate plus={tally?.plus ?? 0} minus={tally?.minus ?? 0}
            labels={[`+${axisLabel(axes[n - 1])}`, `−${axisLabel(axes[n - 1])}`]}
            expected={revealed && showTheory && theory.plus + theory.minus > 0 ? theory.plus / (theory.plus + theory.minus) : undefined} />
          {total > 0 && (
            <p className="mono small">
              {total} atoms fired
              {tally!.blocked.map((b, k) => (
                <span key={k}><br />stopped after device {k + 1}: {b}</span>
              ))}
            </p>
          )}
        </div>
      }
    >
      <svg viewBox={`0 0 ${W} ${H}`} className="sg-bench" role="img"
        aria-label={`Source ${sourceLabel}, then ${axes.map((a, k) => `device ${k + 1} measuring along ${axisLabel(a)}${k < n - 1 ? `, keeping ${keep[k]}` : ''}`).join('; ')}`}>
        <defs>
          <marker id="dial-arrow" viewBox="0 0 6 6" refX="3" refY="3" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
            <path d="M0,0 L6,3 L0,6 z" className="dial-arrowhead" />
          </marker>
        </defs>
        {/* source */}
        <rect x={16} y={CY - 26} width={54} height={52} rx={5} className="oven" />
        <text x={43} y={CY + 44} textAnchor="middle" className="bench-label">{sourceLabel}</text>
        <line x1={70} y1={CY} x2={deviceX(0, n) - 32} y2={CY} className="beam" />
        {axes.map((a, k) => {
          const x = deviceX(k, n)
          const last = k === n - 1
          const nextIn = last ? W - 70 : deviceX(k + 1, n) - 32
          return (
            <g key={k}>
              {/* magnet: pointed pole above, grooved pole below */}
              <path d={`M${x - 32},${CY - 44} h64 v18 l-32,14 l-32,-14 z`} className="pole" />
              <path d={`M${x - 32},${CY + 44} h64 v-16 h-22 v6 h-20 v-6 h-22 z`} className="pole" />
              <AxisDial a={a} x={x} y={CY - 70} />
              <text x={x} y={CY + 66} textAnchor="middle" className="bench-label">SG<tspan className="sub" dy="4">{axisLabel(a)}</tspan></text>
              {(['+', '-'] as Sign[]).map((s) => {
                const y2 = CY + (s === '+' ? -SPLIT : SPLIT)
                const continues = !last && keep[k] === s
                const cls = s === '+' ? 'beam up-beam' : 'beam down-beam'
                return (
                  <g key={s}>
                    <line x1={x + 32} y1={CY} x2={x + 40} y2={y2} className={cls} />
                    {last ? (
                      <line x1={x + 40} y1={y2} x2={W - 70} y2={CY + (s === '+' ? -44 : 44)} className={cls} />
                    ) : continues ? (
                      <polyline points={`${x + 40},${y2} ${x + 70},${y2} ${nextIn},${CY}`} fill="none" className={cls} />
                    ) : (
                      <>
                        <line x1={x + 40} y1={y2} x2={x + 66} y2={y2 + (s === '+' ? -10 : 10)} className={`${cls} faint`} />
                        <rect x={x + 64} y={y2 + (s === '+' ? -20 : 4)} width={8} height={16} className="stop" />
                      </>
                    )}
                  </g>
                )
              })}
            </g>
          )
        })}
        {/* plate */}
        <rect x={W - 70} y={CY - 80} width={16} height={160} rx={3} className="plate-edge" />
        {flight && (() => {
          const [fx, fy] = flightPoint(flight.fate, flight.t)
          return <circle cx={fx} cy={fy} r={5} className="atom" />
        })()}
      </svg>

      {editable && (
        <div className="sg-controls">
          {axes.map((a, k) => (
            <fieldset key={k} className="sg-device">
              <legend>Device {k + 1}</legend>
              <Segmented label={`Device ${k + 1} axis`} value={typeof a === 'number' ? 'tilt' : a}
                options={AXIS_CHOICES} onChange={(v) => setAxis(k, v)} />
              {typeof a === 'number' && (
                <label className="slider compact">
                  <span className="slider-label">tilt from z toward x</span>
                  <input type="range" min={0} max={180} step={5} value={a} onChange={(e) => setTilt(k, +e.target.value)} />
                  <span className="slider-value mono">{a}°</span>
                </label>
              )}
              {k < n - 1 && (
                <Segmented label={`Device ${k + 1} output that continues`} value={keep[k]}
                  options={[{ value: '+', label: 'keep +' }, { value: '-', label: 'keep −' }]}
                  onChange={(v) => setKeep((ks) => ks.map((x, i) => (i === k ? v : x)))} />
              )}
            </fieldset>
          ))}
          <div className="sg-device-buttons">
            {n < maxDevices && <button className="btn ghost" onClick={addDevice}>Add device</button>}
            {n > 1 && <button className="btn ghost" onClick={removeDevice}>Remove last</button>}
          </div>
        </div>
      )}

      {predict && locked === null && (
        <div className="predict">
          <label>
            <span>Predict: what fraction of the atoms that reach the plate land in the <span className="up">+</span> spot?</span>
            <input className="answer-input" value={guess} onChange={(e) => setGuess(e.target.value)} placeholder="e.g. 1/2 or 50%" />
          </label>
          <button className="btn" disabled={guessP === null} onClick={() => setLocked(guessP)}>Lock in prediction</button>
        </div>
      )}
      {predict && locked !== null && (
        <p className="predict-locked mono">Your prediction: {pct(locked)} in the + spot. Now fire atoms and see.</p>
      )}

      <div className="sg-fire">
        <button className="btn" onClick={fireOne} disabled={!!flight || (predict && locked === null)}>Fire 1 atom</button>
        {[10, 100, 1000].map((k) => (
          <button key={k} className="btn ghost" onClick={() => fireN(k)} disabled={predict && locked === null}>×{k}</button>
        ))}
        <button className="btn ghost" onClick={() => setTally(null)}>Clear plate</button>
        {revealed && (
          <label className="check">
            <input type="checkbox" checked={showTheory} onChange={(e) => setShowTheory(e.target.checked)} /> show Born prediction
          </label>
        )}
      </div>
      {revealed && showTheory && (
        <p className="theory-line mono">
          Born rule: P(+ spot) = {pct(theory.plus)}, P(− spot) = {pct(theory.minus)}
          {theory.blocked.map((b, k) => ` · stopped at ${k + 1}: ${pct(b)}`).join('')}
        </p>
      )}
    </WidgetFrame>
  )
}

export type { NamedKet }
