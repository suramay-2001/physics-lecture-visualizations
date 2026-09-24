import { useMemo, useRef, useState } from 'react'
import { mat } from '../physics/linalg'
import { eigenHermitian2 } from '../physics/spin'
import { Slider, WidgetFrame, deg, num } from '../ui/primitives'
import { Tex } from '../ui/Rich'
import { texMat } from '../ui/texfmt'
import { Arrow, useDrag, viewport } from './svg'

export interface OperatorActionProps {
  /** Real symmetric matrix [[a, b], [b, d]]. */
  a?: number
  b?: number
  d?: number
  preset?: keyof typeof PRESETS
}

const PRESETS = {
  'σz': [1, 0, -1],
  'σx': [0, 1, 0],
  'P+z': [1, 0, 0],
  'P+x': [0.5, 0.5, 0.5],
  'I': [1, 0, 1],
  '[[2,1],[1,2]]': [2, 1, 2],
} as const

const SIZE = 340

/**
 * Lecture 3 §1.3 / Lecture 4 §5: an operator moves vectors; eigenvectors are the directions it
 * only stretches or flips. Real symmetric matrices only (the real picture); σ_y needs the Bloch sphere.
 */
export function OperatorAction({ a: a0 = 0, b: b0 = 1, d: d0 = 0, preset }: OperatorActionProps) {
  const init = preset ? PRESETS[preset] : [a0, b0, d0]
  const [[a, b, d], setM] = useState<number[]>([...init])
  const [v, setV] = useState<[number, number]>([Math.cos(0.4), Math.sin(0.4)])
  const [showEigen, setShowEigen] = useState(false)
  const svgRef = useRef<SVGSVGElement>(null)
  const extent = Math.max(1.6, Math.abs(a) + Math.abs(b) + 0.4, Math.abs(d) + Math.abs(b) + 0.4)
  const vp = useMemo(() => viewport(SIZE, extent), [extent])
  const drag = useDrag(svgRef, vp, (x, y) => {
    const t = Math.atan2(y, x)
    setV([Math.cos(t), Math.sin(t)])
  })

  const Av: [number, number] = [a * v[0] + b * v[1], b * v[0] + d * v[1]]
  const turn = Math.abs(v[0] * Av[1] - v[1] * Av[0]) // |v × Av|
  const still = turn < 0.03 * Math.max(1, Math.hypot(...Av))
  const eig = eigenHermitian2(mat([[a, b], [b, d]]))
  const ellipse = Array.from({ length: 73 }, (_, i) => {
    const t = (i / 72) * 2 * Math.PI
    return vp.toPx(a * Math.cos(t) + b * Math.sin(t), b * Math.cos(t) + d * Math.sin(t)).join(',')
  }).join(' ')

  return (
    <WidgetFrame
      title="What an operator does"
      readout={
        <div>
          <Tex display>{`A = ${texMat(mat([[a, b], [b, d]]))}`}</Tex>
          <p className={still ? 'ok' : ''}>
            {still
              ? <>A only stretches this direction, by <strong>{num((v[0] * Av[0] + v[1] * Av[1]))}</strong>. It's an eigenvector.</>
              : <>A turns this vector by {deg(Math.abs(Math.atan2(v[0] * Av[1] - v[1] * Av[0], v[0] * Av[0] + v[1] * Av[1])))}.</>}
          </p>
          {showEigen && (
            <p className="mono small">
              eigenvalues: {num(eig.values[0])}, {num(eig.values[1])}
            </p>
          )}
          <div className="preset-row">
            {Object.entries(PRESETS).map(([k, m]) => (
              <button key={k} className="btn ghost" onClick={() => setM([...m])}>{k}</button>
            ))}
          </div>
        </div>
      }
    >
      <svg ref={svgRef} viewBox={`0 0 ${SIZE} ${SIZE}`} className="plane touch-none" {...drag} role="img"
        aria-label="A unit vector v and its image Av. Drag to rotate v.">
        <line x1={0} x2={SIZE} y1={SIZE / 2} y2={SIZE / 2} className="axis-line" />
        <line y1={0} y2={SIZE} x1={SIZE / 2} x2={SIZE / 2} className="axis-line" />
        <circle cx={SIZE / 2} cy={SIZE / 2} r={vp.scale} className="unit-circle" />
        <polyline points={ellipse} className="image-ellipse" />
        {showEigen &&
          eig.vectors.map((e, i) => {
            const x = e[0].re
            const y = e[1].re
            const [x1, y1] = vp.toPx(-x * extent, -y * extent)
            const [x2, y2] = vp.toPx(x * extent, y * extent)
            return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} className={i === 0 ? 'eigen-line up-line' : 'eigen-line down-line'} />
          })}
        <Arrow vp={vp} to={v} className="vec" label={<Tex>v</Tex>} />
        <Arrow vp={vp} to={Av} className={still ? 'vec vec-ok' : 'vec vec-em'} label={<Tex>Av</Tex>} />
      </svg>
      <div className="matrix-sliders">
        <Slider label={<Tex>a</Tex>} value={a} min={-2} max={2} step={0.1} onChange={(x) => setM([x, b, d])} format={num} />
        <Slider label={<Tex>b</Tex>} value={b} min={-2} max={2} step={0.1} onChange={(x) => setM([a, x, d])} format={num} />
        <Slider label={<Tex>d</Tex>} value={d} min={-2} max={2} step={0.1} onChange={(x) => setM([a, b, x])} format={num} />
      </div>
      <label className="check">
        <input type="checkbox" checked={showEigen} onChange={(e) => setShowEigen(e.target.checked)} /> show eigen-directions
      </label>
      <p className="widget-note">Drag v around the circle. The faint ellipse is where A sends every unit vector. Directions that stay on their own line are eigenvectors. For a symmetric matrix they are always perpendicular.</p>
    </WidgetFrame>
  )
}
