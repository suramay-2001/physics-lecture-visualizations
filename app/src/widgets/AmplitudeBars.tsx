import { useState } from 'react'
import { inner } from '../physics/linalg'
import { KET, type NamedKet, ketAlong, ketFromBloch, blochAngles } from '../physics/spin'
import { type Axis, axisLabel, axisVector } from '../physics/sg'
import { abs2 } from '../physics/complex'
import { Phasor, Segmented, Slider, WidgetFrame, pct } from '../ui/primitives'
import { Tex } from '../ui/Rich'
import { texC } from '../ui/texfmt'

export interface AmplitudeBarsProps {
  state?: NamedKet | [number, number]
  basis?: Axis
  editable?: boolean
}

/**
 * Lecture 3 §5 (Born rule): pick a measurement basis; each outcome's amplitude ⟨a_i|ψ⟩ is a
 * phasor, and its squared length is the probability. Works for complex amplitudes, unlike the
 * flat projection picture.
 */
export function AmplitudeBars({ state = [60, 45], basis = 'z', editable = true }: AmplitudeBarsProps) {
  const init = typeof state === 'string' ? blochAngles(KET[state]) : { theta: (state[0] * Math.PI) / 180, phi: (state[1] * Math.PI) / 180 }
  const [th, setTh] = useState(Math.round((init.theta * 180) / Math.PI))
  const [ph, setPh] = useState(Math.round((init.phi * 180) / Math.PI))
  const [ax, setAx] = useState<Axis>(basis)
  const psi = ketFromBloch((th * Math.PI) / 180, (ph * Math.PI) / 180)
  const n = axisVector(ax)
  const outs = [ketAlong(n), ketAlong([-n[0], -n[1], -n[2]])]
  const amps = outs.map((o) => inner(o, psi))
  const L = axisLabel(ax).replace('°', '^\\circ')

  return (
    <WidgetFrame
      title="Amplitudes → probabilities"
      readout={
        <div>
          <div className="phasor-row">
            {amps.map((z, i) => (
              <Phasor key={i} z={z} size={84} tone={i === 0 ? 'up' : 'down'}
                label={<Tex>{`\\langle{${i === 0 ? '+' : '-'}${L}}|\\psi\\rangle = ${texC(z, 2)}`}</Tex>} />
            ))}
          </div>
          <div className="prob-bars">
            <div className="bar up-bar" style={{ flexBasis: `${abs2(amps[0]) * 100}%` }}>+{axisLabel(ax)} {pct(abs2(amps[0]))}</div>
            <div className="bar down-bar" style={{ flexBasis: `${abs2(amps[1]) * 100}%` }}>−{axisLabel(ax)} {pct(abs2(amps[1]))}</div>
          </div>
        </div>
      }
    >
      <Segmented label="Measurement basis" value={typeof ax === 'number' ? 'tilt' : ax} onChange={(v) => setAx(v === 'tilt' ? 45 : (v as Axis))}
        options={[{ value: 'z', label: 'measure z' }, { value: 'x', label: 'measure x' }, { value: 'y', label: 'measure y' }, { value: 'tilt', label: 'tilt' }]} />
      {typeof ax === 'number' && (
        <Slider label="tilt from z toward x" value={ax} min={0} max={180} step={5} onChange={setAx} format={(v) => `${v}°`} />
      )}
      {editable && (
        <>
          <Slider label={<Tex>{'\\theta'}</Tex>} value={th} min={0} max={180} step={5} onChange={setTh} format={(v) => `${v}°`} />
          <Slider label={<Tex>{'\\phi'}</Tex>} value={ph} min={-180} max={180} step={5} onChange={setPh} format={(v) => `${v}°`} />
        </>
      )}
      <p className="widget-note">The phase of each amplitude (the hand's angle) never changes a probability on its own. But change the relative phase with φ and watch the x and y probabilities move.</p>
    </WidgetFrame>
  )
}
