import { useState } from 'react'
import { madd, matEq, identity, isHermitian, apply, mscale, msub } from '../physics/linalg'
import { ketAlong, projector, samePhysicalState } from '../physics/spin'
import { type Axis, axisLabel, axisVector } from '../physics/sg'
import { Segmented, Slider, WidgetFrame } from '../ui/primitives'
import { Tex } from '../ui/Rich'
import { texCol, texMat } from '../ui/texfmt'

export interface OperatorBuilderProps {
  axis?: Axis
}

/**
 * Lecture 4 §4: the observable is fixed by its outcomes and definite-outcome states,
 * S_n = (ħ/2)(|+n⟩⟨+n| − |−n⟩⟨−n|). Steps reveal one at a time; checks run live.
 */
export function OperatorBuilder({ axis = 'x' }: OperatorBuilderProps) {
  const [ax, setAx] = useState<Axis>(axis)
  const [step, setStep] = useState(1)
  const n = axisVector(ax)
  const plus = ketAlong(n)
  const minus = ketAlong([-n[0], -n[1], -n[2]])
  const Pp = projector(plus)
  const Pm = projector(minus)
  const S = mscale(msub(Pp, Pm), 0.5)
  const L = axisLabel(ax).replace('°', '^\\circ')
  const complete = matEq(madd(Pp, Pm), identity(2))
  const herm = isHermitian(S)
  const eigenOk = samePhysicalState(apply(S, plus), plus)

  const steps = [
    { label: 'Definite-outcome states', tex: `|{+${L}}\\rangle = ${texCol(plus)},\\quad |{-${L}}\\rangle = ${texCol(minus)}` },
    { label: 'Outcome projectors', tex: `P_{+} = |{+${L}}\\rangle\\langle{+${L}}| = ${texMat(Pp)},\\quad P_{-} = ${texMat(Pm)}` },
    { label: 'Weight by the outcomes ±ħ/2', tex: `S_{${L}} = \\tfrac{\\hbar}{2}P_{+} - \\tfrac{\\hbar}{2}P_{-} = \\tfrac{\\hbar}{2}${texMat(msub(Pp, Pm))}` },
  ]

  return (
    <WidgetFrame
      title="Build the operator from its outcomes"
      wide
      readout={
        <ul className="checks">
          <li className={complete ? 'ok' : 'bad'}>{complete ? '✓' : '✗'} <Tex>{'P_+ + P_- = I'}</Tex> (completeness)</li>
          <li className={herm ? 'ok' : 'bad'}>{herm ? '✓' : '✗'} <Tex>{`S_{${L}}^\\dagger = S_{${L}}`}</Tex> (Hermitian)</li>
          <li className={eigenOk ? 'ok' : 'bad'}>{eigenOk ? '✓' : '✗'} <Tex>{`S_{${L}}|{+${L}}\\rangle = +\\tfrac{\\hbar}{2}|{+${L}}\\rangle`}</Tex></li>
        </ul>
      }
    >
      <Segmented label="Axis" value={typeof ax === 'number' ? 'tilt' : ax} onChange={(v) => { setAx(v === 'tilt' ? 60 : (v as Axis)); setStep(1) }}
        options={[{ value: 'z', label: 'z' }, { value: 'x', label: 'x' }, { value: 'y', label: 'y' }, { value: 'tilt', label: 'tilt' }]} />
      {typeof ax === 'number' && (
        <Slider label="tilt from z toward x" value={ax} min={0} max={180} step={15} onChange={(v) => setAx(v)} format={(v) => `${v}°`} />
      )}
      <ol className="build-steps">
        {steps.slice(0, step).map((s, i) => (
          <li key={i}>
            <span className="eyebrow">{s.label}</span>
            <Tex display>{s.tex}</Tex>
          </li>
        ))}
      </ol>
      <div className="preset-row">
        {step < steps.length ? (
          <button className="btn" onClick={() => setStep((s) => s + 1)}>Next step</button>
        ) : (
          <span className="mono small">Done. Every entry comes from the eigenstates.</span>
        )}
        <button className="btn ghost" onClick={() => setStep(1)}>Start over</button>
      </div>
      {step === steps.length && ax === 'y' && (
        <p className="widget-note">
          Watch the bra: <Tex>{'\\langle{+y}|'}</Tex> uses the <em>conjugate</em> <Tex>{'(1,\\,-i)/\\sqrt2'}</Tex>. Forget it and <Tex>{'P_+'}</Tex> gets a −1/2 in the corner, which is no longer a projector.
        </p>
      )}
    </WidgetFrame>
  )
}
