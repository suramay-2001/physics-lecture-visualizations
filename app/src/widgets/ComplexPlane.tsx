import { lazy, Suspense, useMemo, useRef, useState } from 'react'
import { type C, c, mul, conj, abs, arg, fmt, I, ONE } from '../physics/complex'
import { Segmented, WidgetFrame, deg, num } from '../ui/primitives'
import { Tex } from '../ui/Rich'
import { Arrow, Grid, useDrag, viewport } from './svg'

export interface ComplexPlaneProps {
  /**
   * 'multiply' | 'powers-of-i' | 'conjugate' (448 Lecture 2, and 709 F1); 'euler' and 'phasor' (709 F1 §3, §9.3) draw
   * the `complex-plane` stage kind itself from sliders, in a lazy pane (widgets/ComplexPlaneQc.tsx: physics/qc stays out
   * of the main chunk). A 709 mode shows only itself; the 448 modes keep their three-way switch unchanged.
   */
  mode?: 'multiply' | 'powers-of-i' | 'conjugate' | 'euler' | 'phasor'
  z?: [number, number]
  w?: [number, number]
  /** euler: φ in degrees and the number of steps n. */
  phi?: number
  n?: number
  /** phasor: two or three phases in degrees. */
  phases?: number[]
}

const SIZE = 340
const QcPane = lazy(() => import('./ComplexPlaneQc'))

/** Lecture 2: multiplying by a complex number rotates and stretches; ×i is a quarter turn. */
export function ComplexPlane(props: ComplexPlaneProps) {
  const { mode = 'multiply', phi, n, phases } = props
  if (mode === 'euler' || mode === 'phasor')
    return (
      <WidgetFrame title={mode === 'euler' ? 'Complex plane: (1 + iφ/n)ⁿ' : 'Complex plane: arrows tip to tail'}>
        <Suspense fallback={<div className="widget-loading">Loading…</div>}>
          <QcPane mode={mode} phi={phi} n={n} phases={phases} />
        </Suspense>
      </WidgetFrame>
    )
  return <ComplexPlane448 {...props} mode={mode} />
}

function ComplexPlane448({ mode: mode0 = 'multiply', z: z0 = [1.2, 0.6], w: w0 = [0.3, 0.9] }: ComplexPlaneProps & { mode: 'multiply' | 'powers-of-i' | 'conjugate' }) {
  const [mode, setMode] = useState(mode0)
  const [z, setZ] = useState<C>(c(...z0))
  const [w, setW] = useState<C>(c(...w0))
  const [k, setK] = useState(0) // number of ×i applications
  const [grab, setGrab] = useState<'z' | 'w'>('z')
  const svgRef = useRef<SVGSVGElement>(null)
  const extent = mode === 'multiply' ? 2.5 : 1.6
  const vp = useMemo(() => viewport(SIZE, extent), [extent])
  const snapTo = (v: number) => Math.round(v * 20) / 20
  const drag = useDrag(svgRef, vp, (x, y) => (grab === 'z' ? setZ(c(snapTo(x), snapTo(y))) : setW(c(snapTo(x), snapTo(y)))))

  const zw = mul(z, w)
  const powI = [ONE, I, c(-1), c(0, -1)]
  const current = powI[k % 4]
  const blochNames = ['|{+x}\\rangle', '|{+y}\\rangle', '|{-x}\\rangle', '|{-y}\\rangle']
  const coefNames = ['1', 'i', '-1', '-i']

  return (
    <WidgetFrame
      title="Complex plane"
      readout={
        mode === 'multiply' ? (
          <table className="readout-table mono">
            <tbody>
              <tr><th>z</th><td>{fmt(z, 2)}</td><td>r={num(abs(z))}, φ={deg(arg(z))}</td></tr>
              <tr><th>w</th><td>{fmt(w, 2)}</td><td>r={num(abs(w))}, φ={deg(arg(w))}</td></tr>
              <tr className="em"><th>zw</th><td>{fmt(zw, 2)}</td><td>r={num(abs(zw))}, φ={deg(arg(zw))}</td></tr>
            </tbody>
          </table>
        ) : mode === 'powers-of-i' ? (
          <div className="powers">
            <p>
              <Tex>{`i^{${k}} = ${coefNames[k % 4]}`}</Tex>
            </p>
            <p>
              Put this number in front of <Tex>{'|{-z}\\rangle'}</Tex>:
            </p>
            <Tex display>{`\\tfrac{1}{\\sqrt2}\\big(|{+z}\\rangle + (${coefNames[k % 4]})\\,|{-z}\\rangle\\big) = ${blochNames[k % 4]}`}</Tex>
            <p className="small">A quarter turn in the complex plane is a quarter turn around the Bloch sphere's equator.</p>
          </div>
        ) : (
          <table className="readout-table mono">
            <tbody>
              <tr><th>z</th><td>{fmt(z, 2)}</td></tr>
              <tr><th>z*</th><td>{fmt(conj(z), 2)}</td></tr>
              <tr className="em"><th>z*z</th><td>{num(mul(conj(z), z).re)} = r²</td></tr>
            </tbody>
          </table>
        )
      }
    >
      <Segmented label="Mode" value={mode} onChange={(m) => { setMode(m); setK(0) }}
        options={[{ value: 'multiply', label: 'multiply' }, { value: 'powers-of-i', label: 'powers of i' }, { value: 'conjugate', label: 'conjugate' }]} />
      <svg ref={svgRef} viewBox={`0 0 ${SIZE} ${SIZE}`} className="plane touch-none" {...(mode !== 'powers-of-i' ? drag : {})}
        role="img" aria-label="Complex plane. Drag to move the selected number.">
        <Grid vp={vp} extent={Math.floor(extent)} step={mode === 'multiply' ? 1 : 1} />
        <circle cx={SIZE / 2} cy={SIZE / 2} r={vp.scale} className="unit-circle" />
        {mode === 'multiply' && (
          <>
            <Arrow vp={vp} to={[z.re, z.im]} className="vec" label={<Tex>z</Tex>} />
            <Arrow vp={vp} to={[w.re, w.im]} className="vec vec-2" label={<Tex>w</Tex>} />
            <Arrow vp={vp} to={[zw.re, zw.im]} className="vec vec-em" label={<Tex>zw</Tex>} />
          </>
        )}
        {mode === 'powers-of-i' &&
          powI.map((p, i) => (
            <Arrow key={i} vp={vp} to={[p.re, p.im]} className={i === k % 4 ? 'vec vec-em' : 'vec ghost-vec'}
              label={<Tex>{coefNames[i]}</Tex>} labelOffset={[p.re * 16, -p.im * 16]} />
          ))}
        {mode === 'conjugate' && (
          <>
            <Arrow vp={vp} to={[z.re, z.im]} label={<Tex>z</Tex>} />
            <Arrow vp={vp} to={[z.re, -z.im]} className="vec vec-2" label={<Tex>{'z^*'}</Tex>} />
          </>
        )}
      </svg>
      {mode === 'multiply' && (
        <Segmented label="Drag which number" value={grab} onChange={setGrab}
          options={[{ value: 'z', label: 'drag z' }, { value: 'w', label: 'drag w' }]} />
      )}
      {mode === 'powers-of-i' && (
        <div className="preset-row">
          <button className="btn" onClick={() => setK((x) => x + 1)}>Multiply by i</button>
          <button className="btn ghost" onClick={() => setK(0)}>Reset to 1</button>
          <span className="mono small">current: {fmt(current)}</span>
        </div>
      )}
    </WidgetFrame>
  )
}
