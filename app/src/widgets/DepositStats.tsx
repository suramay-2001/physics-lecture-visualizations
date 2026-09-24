import { useMemo, useRef, useState } from 'react'
import { type NamedKet, KET, prob, ketAlong, ketFromBloch } from '../physics/spin'
import { type Axis, axisVector, axisLabel } from '../physics/sg'
import { rng, binomialStd, zScore } from '../physics/random'
import { Plate, WidgetFrame, pct } from '../ui/primitives'
import { Tex } from '../ui/Rich'

export interface DepositStatsProps {
  state?: NamedKet | [number, number] // named ket, or Bloch [θ°, φ°]
  axis?: Axis
  seed?: number
}

/**
 * Finite samples (Reif §1.2–1.6): N atoms give a count k that scatters around Np with standard
 * deviation √(Np(1−p)). The Born rule predicts the distribution, not the individual count.
 */
export function DepositStats({ state = '+z', axis = 60, seed = 7 }: DepositStatsProps) {
  const psi = typeof state === 'string' ? KET[state] : ketFromBloch((state[0] * Math.PI) / 180, (state[1] * Math.PI) / 180)
  const n = axisVector(axis)
  const p = prob(ketAlong(n), psi)
  const rand = useRef(rng(seed))
  const [k, setK] = useState(0)
  const [N, setN] = useState(0)
  const fire = (m: number) => {
    let up = 0
    for (let i = 0; i < m; i++) if (rand.current() < p) up++
    setK((x) => x + up)
    setN((x) => x + m)
  }
  const sigma = binomialStd(N, p)
  const z = N ? zScore(k, N, p) : 0
  const band = useMemo(() => (N ? [Math.max(0, N * p - 2 * sigma), Math.min(N, N * p + 2 * sigma)] : null), [N, p, sigma])
  const L = axisLabel(axis)

  return (
    <WidgetFrame
      title="How many should land up?"
      readout={
        <div>
          <Plate plus={k} minus={N - k} labels={[`+${L}`, `−${L}`]} expected={p} />
          {N > 0 && (
            <table className="readout-table mono">
              <tbody>
                <tr><th>expected</th><td>{(N * p).toFixed(1)} ± {sigma.toFixed(1)}</td></tr>
                <tr><th>observed</th><td>{k}</td></tr>
                <tr><th>distance</th><td className={Math.abs(z) > 3 ? 'bad' : ''}>{z.toFixed(2)} σ</td></tr>
                {band && <tr><th>95% band</th><td>{band[0].toFixed(0)}–{band[1].toFixed(0)}</td></tr>}
              </tbody>
            </table>
          )}
        </div>
      }
    >
      <Tex display>{`P(+${L}) = ${p.toFixed(4)},\\qquad \\sigma_k = \\sqrt{N\\,p\\,(1-p)}`}</Tex>
      <div className="preset-row">
        {[10, 100, 1000, 10000].map((m) => (
          <button key={m} className="btn ghost" onClick={() => fire(m)}>+{m} atoms</button>
        ))}
        <button className="btn ghost" onClick={() => { setK(0); setN(0) }}>Clear</button>
      </div>
      {N > 0 && (
        <p className="widget-note">
          After {N} atoms the fraction is {pct(k / N)}. The spread of the <em>fraction</em> shrinks like <Tex>{'1/\\sqrt N'}</Tex>, so ten times more atoms only makes it about three times tighter.
        </p>
      )}
    </WidgetFrame>
  )
}
