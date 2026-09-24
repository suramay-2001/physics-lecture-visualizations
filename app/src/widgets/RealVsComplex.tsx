import { useMemo, useRef, useState } from 'react'
import { type C, expi, fmt, abs2, add, sub, c } from '../physics/complex'
import { WidgetFrame, deg, pct } from '../ui/primitives'
import { Tex } from '../ui/Rich'
import { Arrow, useDrag, viewport } from './svg'

export interface RealVsComplexProps {
  /** Start with only real coefficients allowed. */
  realOnly?: boolean
  angle?: number // degrees, initial phase of c
}

const SIZE = 240

/**
 * Lecture 2, "failure of real Hilbert space": look for |+y⟩ = (|+z⟩ + c|−z⟩)/√2 that is 50/50 along
 * z AND along x. With c real only ±1 exist (that's ±x); the 50/50-along-x condition forces Re c = 0.
 */
export function RealVsComplex({ realOnly: real0 = true, angle = 0 }: RealVsComplexProps) {
  const [realOnly, setRealOnly] = useState(real0)
  const [theta, setTheta] = useState((angle * Math.PI) / 180)
  const svgRef = useRef<SVGSVGElement>(null)
  const vp = useMemo(() => viewport(SIZE, 1.4), [])
  const drag = useDrag(svgRef, vp, (x, y) => {
    let t = Math.atan2(y, x)
    if (realOnly) t = Math.abs(t) < Math.PI / 2 ? 0 : Math.PI
    setTheta(t)
  })
  const cc: C = realOnly ? c(Math.cos(theta) >= 0 ? 1 : -1) : expi(theta)
  const pz = 0.5
  const pPlusX = abs2(add(c(1), cc)) / 4
  const pMinusX = abs2(sub(c(1), cc)) / 4
  const unbiased = Math.abs(pPlusX - 0.5) < 0.01

  return (
    <WidgetFrame
      title="Where is the y direction?"
      readout={
        <div>
          <Tex display>{`|\\psi\\rangle = \\tfrac{1}{\\sqrt2}\\big(|{+z}\\rangle + c\\,|{-z}\\rangle\\big),\\quad c = ${fmt(cc, 2).replace('i', '\\,i')}`}</Tex>
          <table className="readout-table mono">
            <tbody>
              <tr><th>P(+z), P(−z)</th><td>{pct(pz)}, {pct(pz)}</td><td className="ok">✓ 50/50</td></tr>
              <tr><th>P(+x), P(−x)</th><td>{pct(pPlusX)}, {pct(pMinusX)}</td><td className={unbiased ? 'ok' : 'bad'}>{unbiased ? '✓ 50/50' : '✗ not 50/50'}</td></tr>
            </tbody>
          </table>
          <p className="small">
            {unbiased
              ? 'Found it: this state is equally uncertain along z and along x — a genuinely new direction.'
              : realOnly
                ? 'With a real c you can only reach c = ±1, which is just |+x⟩ or |−x⟩ again.'
                : 'Keep turning c: you need |1 + c| = |1 − c|.'}
          </p>
        </div>
      }
    >
      <label className="check">
        <input type="checkbox" checked={realOnly} onChange={(e) => {
          setRealOnly(e.target.checked)
          if (e.target.checked) setTheta(Math.cos(theta) >= 0 ? 0 : Math.PI)
        }} /> only real numbers allowed
      </label>
      <div className="side-by-side">
        <figure>
          <svg ref={svgRef} viewBox={`0 0 ${SIZE} ${SIZE}`} className="plane touch-none" {...drag} role="img"
            aria-label={`The coefficient c on the unit circle at ${deg(theta)}. Drag to change it.`}>
            <circle cx={SIZE / 2} cy={SIZE / 2} r={vp.scale} className="unit-circle" />
            <line x1={0} x2={SIZE} y1={SIZE / 2} y2={SIZE / 2} className={realOnly ? 'axis-line real-only' : 'axis-line'} />
            <line y1={0} y2={SIZE} x1={SIZE / 2} x2={SIZE / 2} className="axis-line" />
            <Arrow vp={vp} to={[cc.re, cc.im]} className="vec vec-em" label={<Tex>c</Tex>} />
          </svg>
          <figcaption className="small">coefficient c (drag)</figcaption>
        </figure>
        <figure>
          <svg viewBox="-70 -70 140 140" className="plane" role="img" aria-label="Top view of the Bloch sphere equator">
            <circle r={52} className="unit-circle" />
            {[['+x', 52, 0], ['+y', 0, -52], ['−x', -52, 0], ['−y', 0, 52]].map(([l, x, y]) => (
              <text key={l as string} x={(x as number) * 1.22} y={(y as number) * 1.22 + 4} textAnchor="middle" className="axis-text">{l}</text>
            ))}
            <line x1={0} y1={0} x2={52 * Math.cos(Math.atan2(cc.im, cc.re))} y2={-52 * Math.sin(Math.atan2(cc.im, cc.re))} className="vec-line" />
            <circle cx={52 * Math.cos(Math.atan2(cc.im, cc.re))} cy={-52 * Math.sin(Math.atan2(cc.im, cc.re))} r={5} className="state-dot" />
          </svg>
          <figcaption className="small">where |ψ⟩ sits on the equator (top view)</figcaption>
        </figure>
      </div>
    </WidgetFrame>
  )
}
