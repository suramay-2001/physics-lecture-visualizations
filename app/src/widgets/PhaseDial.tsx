import { useEffect, useRef, useState } from 'react'
import { type C, expi, mul, scale } from '../physics/complex'
import { apply } from '../physics/linalg'
import { Rz, blochVector } from '../physics/spin'
import { Phasor, Slider, WidgetFrame, deg } from '../ui/primitives'
import { Tex } from '../ui/Rich'

export interface PhaseDialProps {
  theta?: number // initial relative phase φ, degrees (prop name kept for existing content)
}

/**
 * Lectures 2 and 6: relative phase φ in (|+z⟩ + e^{iφ}|−z⟩)/√2 is the angle around the equator (θ stays the
 * polar angle, so the course writes φ here; the prop keeps its old name `theta`).
 * R_z(φ) turns both amplitudes in opposite directions (relative phase +φ); a global phase turns
 * both the same way and the point does not move.
 */
export function PhaseDial({ theta = 0 }: PhaseDialProps) {
  const [a, setA] = useState<C>({ re: Math.SQRT1_2, im: 0 })
  const [b, setB] = useState<C>(scale(expi((theta * Math.PI) / 180), Math.SQRT1_2))
  const [relDeg, setRelDeg] = useState(theta)
  const [last, setLast] = useState('')
  const anim = useRef<number | null>(null)
  const r = blochVector([a, b])
  const az = Math.atan2(r[1], r[0])

  const setRelative = (d: number) => {
    setRelDeg(d)
    setA({ re: Math.SQRT1_2, im: 0 })
    setB(scale(expi((d * Math.PI) / 180), Math.SQRT1_2))
    setLast('')
  }

  const animate = (kind: 'rz' | 'global', angle: number) => {
    if (anim.current) cancelAnimationFrame(anim.current)
    const from: [C, C] = [a, b]
    const start = performance.now()
    const dur = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ? 0 : 1000
    const tick = (now: number) => {
      const f = dur === 0 ? 1 : Math.min(1, (now - start) / dur)
      if (kind === 'rz') {
        const [na, nb] = apply(Rz(angle * f), from)
        setA(na)
        setB(nb)
      } else {
        setA(mul(from[0], expi(angle * f)))
        setB(mul(from[1], expi(angle * f)))
      }
      if (f < 1) anim.current = requestAnimationFrame(tick)
      else if (kind === 'rz') setRelDeg((d) => Math.round((((d + (angle * 180) / Math.PI + 540) % 360) - 180)))
    }
    setLast(kind === 'rz' ? `R_z(${Math.round((angle * 180) / Math.PI)}^\\circ)` : `e^{i\\,${Math.round((angle * 180) / Math.PI)}^\\circ}\\;\\text{(global)}`)
    anim.current = requestAnimationFrame(tick)
  }
  useEffect(() => () => { if (anim.current) cancelAnimationFrame(anim.current) }, [])

  return (
    <WidgetFrame
      title="Relative phase is a direction"
      readout={
        <div>
          <div className="phasor-row">
            <Phasor z={a} size={84} label={<Tex>{'\\alpha'}</Tex>} />
            <Phasor z={b} size={84} label={<Tex>{'\\beta'}</Tex>} />
          </div>
          <p className="mono small">relative phase arg(β/α) = {deg(Math.atan2(mul({ re: a.re, im: -a.im }, b).im, mul({ re: a.re, im: -a.im }, b).re))}</p>
          {last && <p className="small">Last applied: <Tex>{last}</Tex></p>}
        </div>
      }
    >
      <div className="side-by-side">
        <svg viewBox="-80 -80 160 160" className="plane" role="img" aria-label={`Equator seen from above; the state is at azimuth ${deg(az)}`}>
          <circle r={58} className="unit-circle" />
          {[['+x', 58, 0], ['+y', 0, -58], ['−x', -58, 0], ['−y', 0, 58]].map(([l, x, y]) => (
            <text key={l as string} x={(x as number) * 1.2} y={(y as number) * 1.2 + 4} textAnchor="middle" className="axis-text">{l}</text>
          ))}
          <line x1={0} y1={0} x2={58 * Math.cos(az)} y2={-58 * Math.sin(az)} className="vec-line" />
          <circle cx={58 * Math.cos(az)} cy={-58 * Math.sin(az)} r={6} className="state-dot" />
        </svg>
        <div>
          <Tex display>{`|\\psi(\\varphi)\\rangle = \\tfrac{1}{\\sqrt2}\\big(|{+z}\\rangle + e^{i\\varphi}|{-z}\\rangle\\big)`}</Tex>
          <Slider label={<Tex>{'\\varphi'}</Tex>} value={relDeg} min={-180} max={180} step={5} onChange={setRelative} format={(v) => `${v}°`} />
        </div>
      </div>
      <div className="preset-row">
        <button className="btn" onClick={() => animate('rz', Math.PI / 2)}><Tex>{'R_z(90^\\circ)'}</Tex></button>
        <button className="btn" onClick={() => animate('rz', -Math.PI / 4)}><Tex>{'R_z(-45^\\circ)'}</Tex></button>
        <button className="btn ghost" onClick={() => animate('global', Math.PI / 2)}>multiply both by <Tex>{'e^{i\\pi/2}'}</Tex></button>
      </div>
      <p className="widget-note">
        <Tex>{'R_z'}</Tex> turns α and β in opposite directions, so their relative phase changes and the point moves. A global phase turns them together: the phasors spin, the point stays. Only relative phase is physical.
      </p>
    </WidgetFrame>
  )
}
