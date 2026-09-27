/**
 * bloch — the pure-state sphere (D-L1-scenes §3.3; built for Lectures 2 and 5–7). Draws ONLY `f.state`
 * (ResolvedBloch: r, the ket, the rotation, the measurement axis and P(+), all from the engine). Grammar:
 *   near-white arrow + bead = the state · silver = structure (shell, circles, axes, rotation arc)
 *   amber / cobalt dots at +n̂ / −n̂ of the CURRENT measurement axis (they move with it; not fixed to ±z)
 *   dashed drop-line from the tip to the axis; the readout gives P(+) = (1 + n̂·r)/2 from the engine.
 * The rotation arc is the path the resolver's rotation sweeps (Rodrigues on the base vector: geometry only; the
 * endpoints are the engine's). The ket readout shows what the arrow cannot: global phase and the sign after 2π.
 * Axes are named in the passport (⟨σx⟩, ⟨σy⟩, ⟨σz⟩); the scene labels the six pole states instead.
 * Camera shots: B-STD (az 30°, el 22°), B-EQUATOR (el 8°), B-POLE (straight down from +z, +x right and +y up, so the
 * equator reads as the complex unit circle with 1 on the right and i on top; the ±z labels would sit on the centre and
 * are hidden); a shot change is a cut. No idle motion.
 */
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { physToThree, useDomLabels, useLabelKey, useStageCamera, useStageFrame, useStageLabels, writeReadout, type LabelItem } from '../hooks'
import { INK } from '../tokens'
import type { SceneProps, V3 } from '../types'
import { POLE_LABELS, blochReadout, ketLines, short2, type Pole } from './bloch/blochLabels'

const AXIS_LEN = 1.3
/** radius that must stay in frame: axes (1.3) plus their pole labels */
const FIT = 1.62
/** the swept rotation arc is drawn just outside the sphere, so it never hides under the equator or a meridian */
const ARC_R = 1.1
const SHOTS = { 'B-STD': { az: 30, el: 22, d: 4.2 }, 'B-EQUATOR': { az: 30, el: 8, d: 4.4 }, 'B-POLE': { az: 0, el: 90, d: 4.2 } } as const
const POLES: [Pole, V3][] = [
  ['+x', [1, 0, 0]],
  ['-x', [-1, 0, 0]],
  ['+y', [0, 1, 0]],
  ['-y', [0, -1, 0]],
  ['+z', [0, 0, 1]],
  ['-z', [0, 0, -1]],
]

function rodrigues(v: V3, k: V3, a: number): V3 {
  const c = Math.cos(a)
  const s = Math.sin(a)
  const kv = k[0] * v[0] + k[1] * v[1] + k[2] * v[2]
  const x: V3 = [k[1] * v[2] - k[2] * v[1], k[2] * v[0] - k[0] * v[2], k[0] * v[1] - k[1] * v[0]]
  return [v[0] * c + x[0] * s + k[0] * kv * (1 - c), v[1] * c + x[1] * s + k[1] * kv * (1 - c), v[2] * c + x[2] * s + k[2] * kv * (1 - c)]
}

function circle(axis: 'x' | 'y' | 'z', n = 96): THREE.BufferGeometry {
  return new THREE.BufferGeometry().setFromPoints(
    Array.from({ length: n + 1 }, (_, i) => {
      const a = (i / n) * Math.PI * 2
      const p: V3 = axis === 'z' ? [Math.cos(a), Math.sin(a), 0] : axis === 'x' ? [0, Math.cos(a), Math.sin(a)] : [Math.cos(a), 0, Math.sin(a)]
      return physToThree(p[0], p[1], p[2])
    }),
  )
}

export default function BlochScene(_: SceneProps<'bloch'>) {
  const cam = useMemo(() => new THREE.PerspectiveCamera(40, 1, 0.1, 50), [])
  useStageCamera(cam)
  const shotRef = useRef<string>('')

  const root = useRef<THREE.Group>(null)
  const arrow = useRef<THREE.Group>(null)
  const bead = useRef<THREE.Mesh>(null)
  const plusDot = useRef<THREE.Mesh>(null)
  const minusDot = useRef<THREE.Mesh>(null)
  const tmp = useMemo(() => new THREE.Vector3(), [])
  const up = useMemo(() => new THREE.Vector3(0, 1, 0), [])

  const geo = useMemo(
    () => ({
      equator: circle('z'),
      merXZ: circle('y'),
      merYZ: circle('x'),
      axes: (['x', 'y', 'z'] as const).map((a) => {
        const v = a === 'x' ? [1, 0, 0] : a === 'y' ? [0, 1, 0] : [0, 0, 1]
        return new THREE.BufferGeometry().setFromPoints([physToThree(-v[0] * AXIS_LEN, -v[1] * AXIS_LEN, -v[2] * AXIS_LEN), physToThree(v[0] * AXIS_LEN, v[1] * AXIS_LEN, v[2] * AXIS_LEN)])
      }),
    }),
    [],
  )
  const mats = useMemo(
    () => ({
      axes: [0, 1, 2].map(() => new THREE.LineBasicMaterial({ color: INK.silver, transparent: true, opacity: 0.7 })),
      equator: new THREE.LineBasicMaterial({ color: INK.silver2, transparent: true, opacity: 0.9 }),
      meridian: new THREE.LineBasicMaterial({ color: INK.silver2, transparent: true, opacity: 0.45 }),
      measure: new THREE.LineDashedMaterial({ color: INK.silver, dashSize: 0.06, gapSize: 0.045, transparent: true, opacity: 0.85 }),
      drop: new THREE.LineDashedMaterial({ color: INK.silver, dashSize: 0.04, gapSize: 0.035, transparent: true, opacity: 0.85 }),
      arc: new THREE.LineBasicMaterial({ color: INK.silver }),
      rotAxis: new THREE.LineDashedMaterial({ color: INK.silver2, dashSize: 0.05, gapSize: 0.05, transparent: true, opacity: 0.8 }),
      state: new THREE.MeshStandardMaterial({ color: INK.state, emissive: INK.state, emissiveIntensity: 0.55 }),
    }),
    [],
  )
  // dynamic lines: measurement axis, drop-line, rotation axis, rotation arc
  const lines = useMemo(() => {
    const mk = (n: number, m: THREE.Material) => {
      const g = new THREE.BufferGeometry()
      g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(n * 3), 3))
      const l = new THREE.Line(g, m)
      l.frustumCulled = false
      return l
    }
    // drop-lines to the axes (Lecture 7): segment j has length √(1 − r_j²) = 2ΔS_j (ħ = 1)
    return { measure: mk(2, mats.measure), drop: mk(2, mats.drop), rotAxis: mk(2, mats.rotAxis), arc: mk(49, mats.arc), dx: mk(2, mats.drop), dy: mk(2, mats.drop), dz: mk(2, mats.drop) }
  }, [mats])
  const setLine = (l: THREE.Line, pts: V3[], dashed = false) => {
    const pos = l.geometry.getAttribute('position') as THREE.BufferAttribute
    pts.forEach((p, i) => {
      const v = physToThree(p[0], p[1], p[2])
      pos.setXYZ(i, v.x, v.y, v.z)
    })
    l.geometry.setDrawRange(0, pts.length)
    pos.needsUpdate = true
    l.geometry.computeBoundingSphere()
    if (dashed) l.computeLineDistances()
  }

  const item = (anchor: THREE.Vector3, priority: number, alpha = 1): LabelItem => ({ anchor, alpha, priority })
  const anchors = useMemo(() => {
    const a: Record<string, LabelItem> = {
      state: item(new THREE.Vector3(), 1),
      rot: item(new THREE.Vector3(), 2, 0),
    }
    for (const [name, v] of POLES) a[`pole${name}`] = item(physToThree(v[0] * 1.08, v[1] * 1.08, v[2] * 1.08 + (name === '+z' ? 0.08 : name === '-z' ? -0.08 : 0)), 3)
    return a
  }, [])
  const labels = useMemo(() => {
    const l: Record<string, { text: string; tier: 'axis' | 'chip' | 'readout'; tone: 'silver' | 'state' | 'text' }> = {
      state: { text: '$|\\psi\\rangle$', tier: 'chip', tone: 'state' },
      rot: { text: 'rotation axis', tier: 'axis', tone: 'silver' },
      bloch: { text: '', tier: 'readout', tone: 'state' },
      ket1: { text: '', tier: 'readout', tone: 'text' },
      ket2: { text: '', tier: 'readout', tone: 'text' },
      avg: { text: '', tier: 'readout', tone: 'text' },
      spr: { text: '', tier: 'readout', tone: 'text' },
      bnd: { text: '', tier: 'readout', tone: 'state' },
      bnd2: { text: '', tier: 'readout', tone: 'state' },
    }
    for (const [name] of POLES) l[`pole${name}`] = { text: POLE_LABELS.spin[name], tier: 'axis', tone: 'silver' }
    return l
  }, [])
  useStageLabels(labels)
  const rBloch = useLabelKey('bloch')
  const rKet1 = useLabelKey('ket1')
  const rKet2 = useLabelKey('ket2')
  const rAvg = useLabelKey('avg')
  const rSpr = useLabelKey('spr')
  const rBnd = useLabelKey('bnd')
  const rBnd2 = useLabelKey('bnd2')

  useStageFrame<'bloch'>((f) => {
    const s = f.state
    // camera: the beat's shot (a change is a cut)
    const shot = SHOTS[s.shot ?? 'B-STD']
    // fit the sphere, its axes and pole labels (radius FIT) inside the narrower field of view of this stage
    const vf = (cam.fov * Math.PI) / 360
    const half = Math.min(vf, Math.atan(Math.tan(vf) * cam.aspect))
    const d = Math.max(shot.d, FIT / Math.sin(half))
    const key = `${s.shot ?? 'B-STD'}:${d.toFixed(2)}`
    if (shotRef.current !== key) {
      shotRef.current = key
      const az = (shot.az * Math.PI) / 180
      const el = (shot.el * Math.PI) / 180
      cam.position.copy(physToThree(d * Math.cos(el) * Math.cos(az), d * Math.cos(el) * Math.sin(az), d * Math.sin(el)))
      const top = s.shot === 'B-POLE'
      // looking straight down, 'up' on screen is physics +y (three.js +y is physics z, which points at the camera)
      if (top) cam.up.copy(physToThree(0, 1, 0))
      else cam.up.set(0, 1, 0)
      cam.lookAt(0, 0, 0)
      anchors['pole+z'].alpha = anchors['pole-z'].alpha = top ? 0 : 1
    }
    const focus = f.focus
    const r = s.r
    const tip = physToThree(r[0], r[1], r[2])
    // the state: arrow from the origin + bead
    if (arrow.current) {
      tmp.copy(tip).normalize()
      arrow.current.quaternion.setFromUnitVectors(up, tmp)
    }
    bead.current?.position.copy(tip)
    mats.state.emissiveIntensity = focus === 'point' ? 1.1 : 0.55
    anchors.state.anchor.copy(tip).multiplyScalar(1.22)
    // axes and circles (focus: brighten)
    ;(['x', 'y', 'z'] as const).forEach((a, i) => (mats.axes[i].opacity = focus === a ? 1 : 0.7))
    mats.equator.opacity = focus === 'equator' ? 1 : 0.9
    // measurement axis, outcome dots, drop-line
    const n = s.axis
    lines.measure.visible = lines.drop.visible = !!n
    if (plusDot.current && minusDot.current) plusDot.current.visible = minusDot.current.visible = !!n
    if (n) {
      setLine(lines.measure, [[-n[0] * AXIS_LEN, -n[1] * AXIS_LEN, -n[2] * AXIS_LEN], [n[0] * AXIS_LEN, n[1] * AXIS_LEN, n[2] * AXIS_LEN]], true)
      const d = n[0] * r[0] + n[1] * r[1] + n[2] * r[2]
      setLine(lines.drop, [r, [n[0] * d, n[1] * d, n[2] * d]], true)
      plusDot.current?.position.copy(physToThree(n[0], n[1], n[2]))
      minusDot.current?.position.copy(physToThree(-n[0], -n[1], -n[2]))
      mats.measure.opacity = focus === 'axis-n' ? 1 : 0.85
    }
    // rotation: axis line + the swept arc from the base vector
    const rot = s.rot
    lines.rotAxis.visible = lines.arc.visible = !!rot && Math.abs(rot.angle) > 1e-6
    anchors.rot.alpha = lines.rotAxis.visible ? 1 : 0
    if (rot && lines.rotAxis.visible) {
      const k = rot.axis
      setLine(lines.rotAxis, [[-k[0] * 1.45, -k[1] * 1.45, -k[2] * 1.45], [k[0] * 1.45, k[1] * 1.45, k[2] * 1.45]], true)
      setLine(
        lines.arc,
        Array.from({ length: 49 }, (_, i) => rodrigues(s.base, k, (rot.angle * i) / 48).map((c) => c * ARC_R) as V3),
      )
      anchors.rot.anchor.copy(physToThree(k[0] * 1.5, k[1] * 1.5, k[2] * 1.5))
    }
    // drop-lines from the point to the chosen axes (their lengths are 2ΔS_j; the numbers come from the resolver)
    ;(['x', 'y', 'z'] as const).forEach((ax, i) => {
      const l = lines[`d${ax}`]
      l.visible = s.dropLines.includes(ax)
      if (l.visible) setLine(l, [r, i === 0 ? [r[0], 0, 0] : i === 1 ? [0, r[1], 0] : [0, 0, r[2]]], true)
    })
    // short lines: the readout column is ~160 px (the ket lines keep to 22 characters)
    writeReadout(rAvg, s.readouts.includes('averages') ? `⟨S⟩ = (${s.avg.map(short2).join(', ')}) ħ` : '')
    writeReadout(rSpr, s.readouts.includes('spreads') ? `ΔS = (${s.spreads.map(short2).join(', ')}) ħ` : '')
    writeReadout(rBnd, s.readouts.includes('bound') ? `ΔSx·ΔSy = ${(s.spreads[0] * s.spreads[1]).toFixed(3)} ħ²` : '')
    writeReadout(rBnd2, s.readouts.includes('bound') ? `½|⟨Sz⟩| = ${(Math.abs(s.avg[2]) / 2).toFixed(3)} ħ²` : '')
    writeReadout(rBloch, blochReadout(s))
    const [k1, k2] = ketLines(s.ket)
    writeReadout(rKet1, k1)
    writeReadout(rKet2, k2)
    if (root.current) root.current.visible = f.weight > 0
  })
  useDomLabels(anchors, root)

  return (
    <group ref={root}>
      <ambientLight intensity={0.55} />
      <directionalLight position={[3, 4, 5]} intensity={0.9} />
      <directionalLight position={[-4, -1, -3]} intensity={0.25} />
      <mesh>
        <sphereGeometry args={[1, 64, 40]} />
        <meshStandardMaterial color="#a7b6cf" transparent opacity={0.09} roughness={0.35} metalness={0.1} depthWrite={false} />
      </mesh>
      <lineLoop geometry={geo.equator} material={mats.equator} />
      <lineLoop geometry={geo.merXZ} material={mats.meridian} />
      <lineLoop geometry={geo.merYZ} material={mats.meridian} />
      {geo.axes.map((g, i) => (
        <lineSegments key={i} geometry={g} material={mats.axes[i]} />
      ))}
      <primitive object={lines.measure} />
      <primitive object={lines.drop} />
      <primitive object={lines.dx} />
      <primitive object={lines.dy} />
      <primitive object={lines.dz} />
      <primitive object={lines.rotAxis} />
      <primitive object={lines.arc} />
      <mesh ref={plusDot}>
        <sphereGeometry args={[0.045, 16, 10]} />
        <meshStandardMaterial color={INK.plus} emissive={INK.plus} emissiveIntensity={0.4} />
      </mesh>
      <mesh ref={minusDot}>
        <sphereGeometry args={[0.045, 16, 10]} />
        <meshStandardMaterial color={INK.minus} emissive={INK.minus} emissiveIntensity={0.4} />
      </mesh>
      <group ref={arrow}>
        <mesh position={[0, 0.44, 0]}>
          <cylinderGeometry args={[0.016, 0.016, 0.88, 12]} />
          <primitive object={mats.state} attach="material" />
        </mesh>
        <mesh position={[0, 0.9, 0]}>
          <coneGeometry args={[0.045, 0.1, 16]} />
          <primitive object={mats.state} attach="material" />
        </mesh>
      </group>
      <mesh ref={bead}>
        <sphereGeometry args={[0.06, 20, 14]} />
        <primitive object={mats.state} attach="material" />
      </mesh>
    </group>
  )
}
