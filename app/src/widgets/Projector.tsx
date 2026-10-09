import { useMemo, useRef, useState } from 'react'
import { Slider, WidgetFrame, deg, num, pct } from '../ui/primitives'
import { Tex } from '../ui/Rich'
import { Arrow, useDrag, viewport } from './svg'

export interface ProjectorProps {
  /** State angle in the real plane spanned by |+z⟩ (right) and |−z⟩ (up), degrees. */
  state?: number
  /** Measurement-basis angle: 0 = z basis, 45 = x basis. */
  basis?: number
  editableBasis?: boolean
  /**
   * 'polarization' (Lecture 8): the plane is the polarizer's own angle, so the axes read |H>, |V> (0 deg) and |D>, |A> (45 deg),
   * the basis slider is the analyzer angle, a second slider sets the polarization angle chi in whole degrees, and the footnote
   * says that here the plane angle IS the polarizer angle (no halving). Default 'spin' (unchanged).
   */
  labels?: 'spin' | 'polarization'
}

const SIZE = 340

/**
 * Lecture 3 §3: P_i|ψ⟩ is the shadow of ψ on the outcome direction; its squared length is the
 * probability. The two shadows are the legs of a right triangle with hypotenuse |ψ| = 1, so the
 * probability squares' areas add to 1: completeness is Pythagoras.
 * Real amplitudes only — the widget says so.
 */
export function Projector({ state = 35, basis = 0, editableBasis = true, labels = 'spin' }: ProjectorProps) {
  const light = labels === 'polarization'
  const [t, setT] = useState((state * Math.PI) / 180)
  const [b, setB] = useState(basis)
  const [squares, setSquares] = useState(true)
  const svgRef = useRef<SVGSVGElement>(null)
  const vp = useMemo(() => viewport(SIZE, 1.35), [])
  const drag = useDrag(svgRef, vp, (x, y) => setT(Math.atan2(y, x)))

  const br = (b * Math.PI) / 180
  const e1: [number, number] = [Math.cos(br), Math.sin(br)]
  const e2: [number, number] = [-Math.sin(br), Math.cos(br)]
  const psi: [number, number] = [Math.cos(t), Math.sin(t)]
  const c1 = psi[0] * e1[0] + psi[1] * e1[1]
  const c2 = psi[0] * e2[0] + psi[1] * e2[1]
  const p1: [number, number] = [c1 * e1[0], c1 * e1[1]]
  const p2: [number, number] = [c2 * e2[0], c2 * e2[1]]
  const name = light ? (b === 0 ? ['H', 'V'] : b === 45 ? ['D', 'A'] : [`${b}°`, `${b + 90}°`]) : b === 0 ? ['+z', '-z'] : b === 45 ? ['+x', '-x'] : [`+${b}°`, `-${b}°`]
  // the state's angle in whole degrees, folded into [0, 360) for the slider (the drag moves it continuously)
  const chiDeg = Math.round((((t * 180) / Math.PI) % 360 + 360) % 360) % 360

  // Square drawn on a projection segment, on the side away from ψ.
  const square = (p: [number, number], perp: [number, number], cls: string) => {
    const pts = [[0, 0], p, [p[0] + perp[0], p[1] + perp[1]], [perp[0], perp[1]]].map(([x, y]) => vp.toPx(x, y).join(',')).join(' ')
    return <polygon points={pts} className={cls} />
  }
  const s1 = Math.abs(c1)
  const s2 = Math.abs(c2)
  const away = (dir: [number, number], len: number, sign: number): [number, number] => [dir[0] * len * sign, dir[1] * len * sign]

  return (
    <WidgetFrame
      title={light ? 'Analyzer chance = projection squared' : 'Projection = probability'}
      readout={
        <div>
          <Tex display>{`c_i = \\langle ${name[0].replace('°', '^\\circ')}|\\psi\\rangle \\;\\to\\; P = |c_i|^2`}</Tex>
          <table className="readout-table mono">
            <tbody>
              <tr><th className="up">⟨{name[0]}|ψ⟩</th><td>{num(c1)}</td><td>P = {pct(c1 * c1)}</td></tr>
              <tr><th className="down">⟨{name[1]}|ψ⟩</th><td>{num(c2)}</td><td>P = {pct(c2 * c2)}</td></tr>
              <tr className="em"><th>sum</th><td></td><td>{pct(c1 * c1 + c2 * c2)}</td></tr>
            </tbody>
          </table>
          <p className="small">
            The shadows are the legs of a right triangle whose hypotenuse is the unit vector ψ, so their squares always add to 1. That is why completeness, <Tex>{'P_+ + P_- = 1'}</Tex>, makes the probabilities sum to one.
          </p>
          <p className="small caution">Flat picture = real amplitudes only. Complex amplitudes need a second dimension per component (see the phasors in Lecture 2).</p>
        </div>
      }
    >
      <svg ref={svgRef} viewBox={`0 0 ${SIZE} ${SIZE}`} className="plane touch-none" {...drag} role="img"
        aria-label={`State at ${deg(t)} in the real plane; measurement basis at ${b} degrees. Drag to move the state.`}>
        {/* basis axes */}
        {[e1, e2].map((e, i) => {
          const [x1, y1] = vp.toPx(-e[0] * 1.3, -e[1] * 1.3)
          const [x2, y2] = vp.toPx(e[0] * 1.3, e[1] * 1.3)
          return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} className={i === 0 ? 'basis-line up-line' : 'basis-line down-line'} />
        })}
        <circle cx={SIZE / 2} cy={SIZE / 2} r={vp.scale} className="unit-circle" />
        {squares && square(p1, away(e2, s1, c2 >= 0 ? -1 : 1), 'prob-square up-square')}
        {squares && square(p2, away(e1, s2, c1 >= 0 ? -1 : 1), 'prob-square down-square')}
        {/* drop lines */}
        {[p1, p2].map((p, i) => {
          const [x1, y1] = vp.toPx(...psi)
          const [x2, y2] = vp.toPx(...p)
          return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} className="drop-line" />
        })}
        <Arrow vp={vp} to={p1} className="vec up-vec" label={<Tex>{'P_1\\psi'}</Tex>} />
        <Arrow vp={vp} to={p2} className="vec down-vec" label={<Tex>{'P_2\\psi'}</Tex>} />
        <Arrow vp={vp} to={psi} className="vec vec-em" label={<Tex>{'\\psi'}</Tex>} />
        {[e1, e2].map((e, i) => {
          const [x, y] = vp.toPx(e[0] * 1.22, e[1] * 1.22)
          return <text key={i} x={x} y={y} className={`axis-text ${i === 0 ? 'up' : 'down'}`} textAnchor="middle">|{name[i]}⟩</text>
        })}
      </svg>
      {light && (
        <Slider label="polarization χ" value={chiDeg} min={0} max={359} step={1} onChange={(v) => setT((v * Math.PI) / 180)}
          format={(v) => `${v}°`} />
      )}
      {editableBasis && (
        <Slider label={light ? 'analyzer angle' : 'measurement basis'} value={b} min={0} max={90} step={5} onChange={setB}
          format={(v) => (light ? (v === 0 ? '0° (H/V)' : v === 45 ? '45° (D/A)' : `${v}°`) : v === 0 ? '0° (z basis)' : v === 45 ? '45° (x basis)' : `${v}°`)} />
      )}
      <label className="check">
        <input type="checkbox" checked={squares} onChange={(e) => setSquares(e.target.checked)} /> draw probability squares
      </label>
      <p className="widget-note">
        {light
          ? 'For light the plane angle is the polarizer angle: |D⟩ sits at 45° from |H⟩ here and in the lab. An arrow and its opposite are one polarization.'
          : 'In this plane |+x⟩ sits at 45° from |+z⟩, but on the Bloch sphere it sits at 90°. State-space angles are half the Bloch-sphere angles.'}
      </p>
    </WidgetFrame>
  )
}
