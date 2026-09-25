import { Canvas } from '@react-three/fiber'
import { Html, Line, OrbitControls } from '@react-three/drei'
import { useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import { apply } from '../physics/linalg'
import { type Vec3, ketFromBloch, blochVector, Rz, KET, type NamedKet, blochAngles, dot, unit } from '../physics/spin'
import { type Axis, axisVector, axisLabel } from '../physics/sg'
import { Phasor, Slider, WidgetFrame, deg, num, pct } from '../ui/primitives'
import { Tex } from '../ui/Rich'
import { useStageHostRequested } from '../stage/demand'
import { useStageFlag } from '../stage/store'
import { WidgetIsland } from '../stage/WidgetIsland'

export interface BlochProps {
  theta?: number // degrees from +z
  phi?: number // degrees from +x toward +y
  editable?: boolean
  /** Draw a Stern–Gerlach axis and the two outcome probabilities along it. */
  measure?: Axis
  /** Offer Rz(φ) buttons that physically rotate the state (Lecture 6). */
  rotations?: boolean
  /** Show the six named states as labelled points. */
  landmarks?: boolean
}

/** physics (x, y, z) with z up → three.js (x, y, z) with y up. A proper rotation (det = +1). */
const T = (v: Vec3): [number, number, number] => [v[0], v[2], -v[1]]

const LANDMARKS: [NamedKet, string][] = [
  ['+z', '|{+z}\\rangle'],
  ['-z', '|{-z}\\rangle'],
  ['+x', '|{+x}\\rangle'],
  ['-x', '|{-x}\\rangle'],
  ['+y', '|{+y}\\rangle'],
  ['-y', '|{-y}\\rangle'],
]

const CAMERA = { position: [2.2, 1.5, 2.6] as [number, number, number], fov: 38 }
const axisAnchor = (a: 'x' | 'y' | 'z') => {
  const v = axisVector(a)
  return T([v[0] * 1.38, v[1] * 1.38, v[2] * 1.38])
}
const landmarkAnchor = (k: NamedKet) => {
  const p = blochVector(KET[k])
  return T([p[0] * 1.13, p[1] * 1.13, p[2] * 1.13 + (k.endsWith('z') ? 0 : 0.08)])
}
/** Island mode (shared stage canvas): labels are DOM children positioned by the host, not drei <Html>. */
const ISLAND_ANCHORS = Object.fromEntries([
  ...(['x', 'y', 'z'] as const).map((a) => [`axis-${a}`, axisAnchor(a)]),
  ...LANDMARKS.map(([k]) => [`ket${k}`, landmarkAnchor(k)]),
]) as Record<string, [number, number, number]>
function islandLabels(landmarks: boolean) {
  const out: Record<string, React.ReactNode> = {}
  for (const a of ['x', 'y', 'z'] as const) out[`axis-${a}`] = <span className="bloch-axis-label">{a}</span>
  if (landmarks)
    for (const [k, tex] of LANDMARKS)
      out[`ket${k}`] = (
        <span className="bloch-landmark">
          <Tex>{tex}</Tex>
        </span>
      )
  return out
}

function Scene({ r, trail, measure, landmarks, html = true }: { r: Vec3; trail: Vec3[]; measure?: Axis; landmarks: boolean; html?: boolean }) {
  const style = getComputedStyle(document.documentElement)
  const ink = style.getPropertyValue('--ink').trim() || '#131a2b'
  const silver = style.getPropertyValue('--silver').trim() || '#8e99a6'
  const up = style.getPropertyValue('--up').trim() || '#c9820c'
  const down = style.getPropertyValue('--down').trim() || '#3552d0'
  const circle = (plane: 'xy' | 'xz' | 'yz') =>
    Array.from({ length: 97 }, (_, i) => {
      const a = (i / 96) * Math.PI * 2
      const p: Vec3 = plane === 'xy' ? [Math.cos(a), Math.sin(a), 0] : plane === 'xz' ? [Math.cos(a), 0, Math.sin(a)] : [0, Math.cos(a), Math.sin(a)]
      return new THREE.Vector3(...T(p))
    })
  const n = measure ? unit(axisVector(measure)) : null
  return (
    <>
      <ambientLight intensity={0.9} />
      <directionalLight position={[3, 4, 5]} intensity={0.6} />
      <mesh>
        <sphereGeometry args={[1, 48, 32]} />
        <meshStandardMaterial color={silver} transparent opacity={0.1} depthWrite={false} />
      </mesh>
      <Line points={circle('xy')} color={silver} lineWidth={1.2} />
      <Line points={circle('xz')} color={silver} lineWidth={0.6} dashed dashSize={0.05} gapSize={0.05} />
      <Line points={circle('yz')} color={silver} lineWidth={0.6} dashed dashSize={0.05} gapSize={0.05} />
      {(['x', 'y', 'z'] as const).map((a) => {
        const v = axisVector(a)
        return (
          <group key={a}>
            <Line points={[T([-v[0] * 1.25, -v[1] * 1.25, -v[2] * 1.25]), T([v[0] * 1.25, v[1] * 1.25, v[2] * 1.25])]} color={silver} lineWidth={1} />
            {html && <Html position={axisAnchor(a)} center className="bloch-axis-label">{a}</Html>}
          </group>
        )
      })}
      {landmarks &&
        LANDMARKS.map(([k, tex]) => {
          const p = blochVector(KET[k])
          return (
            <group key={k}>
              <mesh position={T(p)}>
                <sphereGeometry args={[0.03, 12, 12]} />
                <meshBasicMaterial color={ink} />
              </mesh>
              {html && (
                <Html position={landmarkAnchor(k)} center className="bloch-landmark">
                  <Tex>{tex}</Tex>
                </Html>
              )}
            </group>
          )
        })}
      {n && (
        <>
          <Line points={[[0, 0, 0], T(n)]} color={up} lineWidth={3} />
          <Line points={[[0, 0, 0], T([-n[0], -n[1], -n[2]])]} color={down} lineWidth={3} />
          <mesh position={T(n)}>
            <sphereGeometry args={[0.045, 12, 12]} />
            <meshBasicMaterial color={up} />
          </mesh>
          <mesh position={T([-n[0], -n[1], -n[2]])}>
            <sphereGeometry args={[0.045, 12, 12]} />
            <meshBasicMaterial color={down} />
          </mesh>
          {/* projection of the state onto the measurement axis */}
          <Line points={[T(r), T([n[0] * dot(r, n), n[1] * dot(r, n), n[2] * dot(r, n)])]} color={ink} lineWidth={1} dashed dashSize={0.04} gapSize={0.03} />
        </>
      )}
      {trail.length > 1 && <Line points={trail.map((p) => new THREE.Vector3(...T(p)))} color={ink} lineWidth={1.5} transparent opacity={0.45} />}
      <Line points={[[0, 0, 0], T(r)]} color={ink} lineWidth={3.5} />
      <mesh position={T(r)}>
        <sphereGeometry args={[0.06, 16, 16]} />
        <meshStandardMaterial color={ink} />
      </mesh>
    </>
  )
}

export function BlochSphere({ theta = 60, phi = 30, editable = true, measure, rotations = false, landmarks = true }: BlochProps) {
  const [th, setTh] = useState(theta)
  const [ph, setPh] = useState(phi)
  const [psi, setPsi] = useState(() => ketFromBloch((theta * Math.PI) / 180, (phi * Math.PI) / 180))
  const [trail, setTrail] = useState<Vec3[]>([])
  const anim = useRef<number | null>(null)
  // One WebGL context per page: once the stage host exists, draw on its canvas as an island (W-L1 §2.9).
  const hostRequested = useStageHostRequested()
  const hostLost = useStageFlag('contextLost')
  const island = hostRequested && !hostLost

  // Sliders set the state directly (fixing the global phase); rotations act on psi and keep its phase.
  const setAngles = (t: number, p: number) => {
    setTh(t)
    setPh(p)
    setPsi(ketFromBloch((t * Math.PI) / 180, (p * Math.PI) / 180))
    setTrail([])
  }
  const r = useMemo(() => blochVector(psi), [psi])

  const rotate = (angle: number) => {
    if (anim.current) cancelAnimationFrame(anim.current)
    const start = performance.now()
    const from = psi
    const dur = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ? 0 : 900
    const pts: Vec3[] = []
    const tick = (now: number) => {
      const f = dur === 0 ? 1 : Math.min(1, (now - start) / dur)
      const next = apply(Rz(angle * f), from)
      pts.push(blochVector(next))
      setPsi(next)
      setTrail([...pts])
      if (f < 1) anim.current = requestAnimationFrame(tick)
      else {
        const a = blochAngles(next)
        setTh(Math.round((a.theta * 180) / Math.PI))
        setPh(Math.round((a.phi * 180) / Math.PI))
      }
    }
    anim.current = requestAnimationFrame(tick)
  }
  useEffect(() => () => { if (anim.current) cancelAnimationFrame(anim.current) }, [])

  const [a, b] = psi
  const n = measure ? unit(axisVector(measure)) : null
  const pUp = n ? (1 + dot(r, n)) / 2 : null

  return (
    <WidgetFrame
      title="Bloch sphere"
      wide
      readout={
        <div className="bloch-readout">
          <div className="phasor-row">
            <Phasor z={a} label={<Tex>{'\\alpha = \\langle{+z}|\\psi\\rangle'}</Tex>} />
            <Phasor z={b} label={<Tex>{'\\beta = \\langle{-z}|\\psi\\rangle'}</Tex>} />
          </div>
          <table className="readout-table mono">
            <tbody>
              <tr><th>⟨Sx⟩</th><td>{num(r[0] / 2)} ħ</td></tr>
              <tr><th>⟨Sy⟩</th><td>{num(r[1] / 2)} ħ</td></tr>
              <tr><th>⟨Sz⟩</th><td>{num(r[2] / 2)} ħ</td></tr>
              <tr><th>|α|², |β|²</th><td>{num(r[2] / 2 + 0.5)}, {num(0.5 - r[2] / 2)}</td></tr>
            </tbody>
          </table>
          {pUp !== null && (
            <div className="prob-bars" aria-label={`Probability of plus along ${axisLabel(measure!)} is ${pct(pUp)}`}>
              <div className="bar up-bar" style={{ flexBasis: `${pUp * 100}%` }}>+{axisLabel(measure!)} {pct(pUp)}</div>
              <div className="bar down-bar" style={{ flexBasis: `${(1 - pUp) * 100}%` }}>−{axisLabel(measure!)} {pct(1 - pUp)}</div>
            </div>
          )}
        </div>
      }
    >
      {island ? (
        <WidgetIsland className="bloch-canvas" ariaLabel="Bloch sphere, drag to orbit" camera={CAMERA} anchors={ISLAND_ANCHORS} labels={islandLabels(landmarks)}>
          <Scene r={r} trail={trail} measure={measure} landmarks={landmarks} html={false} />
        </WidgetIsland>
      ) : (
        <div className="bloch-canvas">
          <Canvas camera={CAMERA} dpr={[1, 2]} aria-label="Bloch sphere, drag to orbit">
            <Scene r={r} trail={trail} measure={measure} landmarks={landmarks} />
            <OrbitControls enablePan={false} enableZoom={false} />
          </Canvas>
        </div>
      )}
      {editable && (
        <div className="bloch-controls">
          <Slider label={<Tex>{'\\theta'}</Tex>} value={th} min={0} max={180} onChange={(v) => setAngles(v, ph)} format={(v) => `${v}°`} />
          <Slider label={<Tex>{'\\phi'}</Tex>} value={ph} min={-180} max={180} onChange={(v) => setAngles(th, v)} format={(v) => `${v}°`} />
          <div className="preset-row">
            {LANDMARKS.map(([k, tex]) => (
              <button key={k} className="btn ghost" onClick={() => {
                const ang = blochAngles(KET[k])
                setAngles(Math.round((ang.theta * 180) / Math.PI), Math.round((ang.phi * 180) / Math.PI))
              }}>
                <Tex>{tex}</Tex>
              </button>
            ))}
          </div>
        </div>
      )}
      {rotations && (
        <div className="preset-row">
          <span className="eyebrow">Rotate about z</span>
          {[45, 90, -90, 180, 360].map((d) => (
            <button key={d} className="btn ghost" onClick={() => rotate((d * Math.PI) / 180)}>
              <Tex>{`R_z(${d}^\\circ)`}</Tex>
            </button>
          ))}
        </div>
      )}
      <p className="widget-note">
        θ = {deg((th * Math.PI) / 180)}, φ = {deg((ph * Math.PI) / 180)}. Orthogonal states sit at <em>opposite</em> points: angles on this sphere are twice the angles between state vectors.
      </p>
    </WidgetFrame>
  )
}
