/**
 * Widget W3 `bb84-bench` (448 Lecture 8; rulings 448-L8L11 L8 R7): send photons through the BB84 protocol and watch the ledger.
 * It builds a `bb84` stage state from its controls and draws it with the kind's own resolver and scene (stage/svg/bb84.ts
 * `resolveBb84Stage` → Bb84Scene), which draw every bit from the one seeded engine (physics/bb84.ts) the story and the
 * `catch-eve` Arcade game share, so the Try-it and the story cannot disagree. Lazy: it calls the engine and the SVG kind.
 *
 * Controls: Send 1 / 10 / 100 / 1000 photons (the run only appends: a longer count keeps the earlier rounds), Eve off or on
 * every photon, "Compare bases" (sifting), a test sample of m sifted bits (the first m kept rounds, published and removed
 * from the key), New run (the next seed) and Reset. The readouts are the kind's own: rounds kept, Q̂ with its ±1σ band
 * against the exact Q, what Eve knows, the test's error count and the chance (¾)^m that such a test shows nothing.
 */
import { useMemo, useState } from 'react'
import type { Bb84State } from '../content/stage'
import type { ResolvedBb84 } from '../stage/types'
import { BB84_LIMITS, bb84Readouts, resolveBb84Stage } from '../stage/svg/bb84'
import { Bb84Scene } from '../stage/svg/Bb84Scene'
import '../stage/svg/svg.css'
import './bb84Bench.css'
import { STAGE_BG, stageCssVars } from '../stage/tokens'
import { Segmented, Slider, WidgetFrame } from '../ui/primitives'

const W = 560
const H = 440

export interface Bb84BenchProps {
  /** Eve: 'off' (default) or 'all' (she intercepts and resends every photon). */
  eve?: 'off' | 'all'
  /** The seed of the first run (default 84). "New run" moves to the next seed. */
  seed?: number
  /** Start with this many sifted bits in the public test sample (default 0: no test). */
  testSize?: number
  /** false locks Eve and the test size to the props; the Send, New run and Reset buttons remain. Default true. */
  editable?: boolean
}

/** The ledger the controls ask for (pure; the component only draws it): null before any photon is sent. */
export function benchModel(c: { sent: number; seed: number; eve: 'off' | 'all'; sift: boolean; m: number }): { r: ResolvedBb84 | null; lines: string[]; kept: number; mEff: number } {
  if (c.sent < 1) return { r: null, lines: [], kept: 0, mEff: 0 }
  const st: Bb84State = {
    kind: 'bb84',
    rounds: { seed: c.seed, count: Math.min(BB84_LIMITS.countMax, c.sent) },
    eve: c.eve,
    sift: c.sift,
    readouts: ['kept', 'qber', ...(c.eve === 'all' ? (['eve-knows'] as const) : [])],
  }
  const kept = resolveBb84Stage(st, 1).kept
  // the test sample is the first m kept rounds; it cannot be larger than the key so far
  const mEff = c.sift ? Math.min(Math.max(0, Math.floor(c.m)), kept) : 0
  const r = resolveBb84Stage(mEff > 0 ? { ...st, test: { size: mEff } } : st, 1)
  return { r, lines: bb84Readouts(r).map((x) => x.text), kept, mEff }
}

export default function Bb84Bench({ eve: eve0 = 'off', seed: seed0 = 84, testSize = 0, editable = true }: Bb84BenchProps) {
  const [eve, setEve] = useState<'off' | 'all'>(eve0)
  const [run, setRun] = useState(0)
  const [sent, setSent] = useState(0)
  const [sift, setSift] = useState(testSize > 0)
  const [m, setM] = useState(Math.max(0, Math.floor(testSize)))
  const seed = (seed0 + run) >>> 0

  const send = (k: number) => setSent((n) => Math.min(BB84_LIMITS.countMax, n + k))
  const { r, lines, kept: keptNow } = useMemo(() => benchModel({ sent, seed, eve, sift, m }), [sent, seed, eve, sift, m])

  return (
    <WidgetFrame title="BB84 bench: send photons, compare bases, test">
      <div className="bb84-bench-fire">
        {[1, 10, 100, 1000].map((k) => (
          <button key={k} className="btn" onClick={() => send(k)} disabled={sent >= BB84_LIMITS.countMax}>
            Send {k}
          </button>
        ))}
        <button
          className="btn ghost"
          onClick={() => {
            setRun((x) => x + 1)
            setSent(0)
          }}
        >
          New run
        </button>
        <button className="btn ghost" onClick={() => setSent(0)}>
          Reset
        </button>
      </div>
      {r ? (
        <svg className="svgk svgk-stage bb84-bench-svg" viewBox={`0 0 ${W} ${H}`} style={stageCssVars('bb84') as React.CSSProperties} role="img" aria-label={lines.join('; ')}>
          <rect x={0} y={0} width={W} height={H} fill={STAGE_BG.bb84} rx={6} />
          <Bb84Scene state={r} mode="stage" width={W} height={H} bare />
        </svg>
      ) : (
        <p className="bb84-bench-empty mono">No photons sent yet. Press Send.</p>
      )}
      {editable && (
        <>
          <Segmented
            label="Eavesdropper"
            value={eve}
            onChange={setEve}
            options={[
              { value: 'off', label: 'no Eve' },
              { value: 'all', label: 'Eve on every photon' },
            ]}
          />
          <label className="check">
            <input type="checkbox" checked={sift} onChange={(e) => setSift(e.target.checked)} /> compare bases (keep matching rounds)
          </label>
          <Slider label="test sample m" value={m} min={0} max={100} step={1} onChange={setM} format={(v) => (sift ? (v > keptNow && sent > 0 ? `${v} (only ${keptNow} kept)` : String(v)) : `${v} (compare bases first)`)} />
        </>
      )}
      <p className="widget-note">
        Same seed, same photons: Eve on or off never changes what Alice sends or which basis Bob picks. The test uses the first m kept bits.
      </p>
    </WidgetFrame>
  )
}
