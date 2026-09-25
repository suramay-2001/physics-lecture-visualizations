/**
 * W0 PLACEHOLDER scenes (owner: D after the l1-freeze tag; replace freely). Wireframe only: they exist to
 * prove the contract end to end — `useStageFrame` state, `useStageCamera`, `useStageLabels` +
 * `useDomLabels` + `writeReadout`, split/inset rects — so D can start on real scenes the day after freeze.
 * Every number they show comes from `f.state` (engine-resolved), never from their own physics.
 */
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { INK } from '../tokens'
import { PHYSICS_TO_THREE, physToThree, useDomLabels, useLabelKey, useStageCamera, useStageFrame, useStageLabels, writeReadout } from '../hooks'
import type { SceneProps } from '../types'

const pct = (p: number) => `${(100 * p).toFixed(1)}%`
const MODULE_DY = 5.8 // D §4.0: module k centred at y = 5.8·k
const PLATE_GAP = 4.2

function lineGeo(points: THREE.Vector3[]) {
  return new THREE.BufferGeometry().setFromPoints(points)
}

/* ------------------------------------------------------------------------------------------------ */
/* lab-r3                                                                                            */
/* ------------------------------------------------------------------------------------------------ */

const MAX_DEVICES = 4
const MAX_BENCHES = 2

export function PlaceholderLab(_: SceneProps<'lab-r3'>) {
  const cam = useMemo(() => new THREE.PerspectiveCamera(50, 1, 0.1, 200), [])
  useStageCamera(cam)
  const root = useRef<THREE.Group>(null)
  const magnets = useRef<(THREE.Object3D | null)[]>([])
  const spots = useRef<(THREE.Mesh | null)[]>([])
  const beams = useRef<(THREE.Line | null)[]>([])
  const plateAnchor = useMemo(() => new THREE.Vector3(), [])
  const ovenAnchor = useMemo(() => new THREE.Vector3(0, -3.75, 0), [])
  useStageLabels({
    oven: { text: 'OVEN', tier: 'callout' },
    plate: { text: 'PLATE', tier: 'callout' },
    fractions: { text: '—', tier: 'readout', tone: 'plus' },
  })
  const readout = useLabelKey('fractions')
  const box = useMemo(() => new THREE.BoxGeometry(1.9, 3.2, 1.2), [])
  const edges = useMemo(() => new THREE.EdgesGeometry(box), [box])
  const spotGeo = useMemo(() => new THREE.SphereGeometry(0.18, 12, 8), [])
  const beamLines = useMemo(
    () =>
      Array.from(
        { length: MAX_BENCHES },
        () => new THREE.Line(lineGeo([new THREE.Vector3(), new THREE.Vector3(0, 1, 0)]), new THREE.LineBasicMaterial({ color: INK.unpol })),
      ),
    [],
  )

  useStageFrame<'lab-r3'>((f) => {
    const s = f.state
    let maxY = 0
    for (let b = 0; b < MAX_BENCHES; b++) {
      const bench = s.benches[b]
      const zOff = s.benches.length === 2 ? (b === 0 ? 1.8 : -1.8) : 0
      for (let k = 0; k < MAX_DEVICES; k++) {
        const m = magnets.current[b * MAX_DEVICES + k]
        if (!m) continue
        m.visible = !!bench && k < bench.tilts.length
        if (!m.visible) continue
        m.position.set(0, MODULE_DY * k, zOff)
        m.rotation.set(0, bench.tilts[k], 0) // tilt about the beam (physics y)
      }
      const beam = beams.current[b]
      const plus = spots.current[b * 2]
      const minus = spots.current[b * 2 + 1]
      if (!bench || !beam || !plus || !minus) {
        if (beam) beam.visible = false
        if (plus) plus.visible = false
        if (minus) minus.visible = false
        continue
      }
      const n = bench.tilts.length
      const yPlate = MODULE_DY * (n - 1) + PLATE_GAP
      maxY = Math.max(maxY, yPlate)
      beam.visible = true
      beam.geometry.setFromPoints([new THREE.Vector3(0, -3.75, zOff), new THREE.Vector3(0, yPlate, zOff)])
      const ax = bench.axes[n - 1]
      const sep = 0.9 * s.gradient
      plus.visible = minus.visible = true
      plus.position.set(ax[0] * sep, yPlate, zOff + ax[2] * sep)
      minus.position.set(-ax[0] * sep, yPlate, zOff - ax[2] * sep)
      plus.scale.setScalar(Math.sqrt(Math.max(0.001, bench.theory.plus)))
      minus.scale.setScalar(Math.sqrt(Math.max(0.001, bench.theory.minus)))
      if (b === 0) {
        plateAnchor.set(0.9, yPlate, zOff + 1.3)
        writeReadout(readout, `+ ${pct(bench.theory.plus)} · − ${pct(bench.theory.minus)}`)
      }
    }
    // three-quarter establishing shot on the bench centre (D L-EST-ish), aspect from the view
    const yc = maxY / 2 - 1
    const c = physToThree(8.6 + maxY * 0.25, yc - 7 - maxY * 0.35, 4.8 + maxY * 0.15)
    cam.position.copy(c)
    cam.lookAt(physToThree(0, yc, -0.3))
    if (root.current) root.current.visible = f.weight > 0
  })
  useDomLabels({ oven: ovenAnchor, plate: plateAnchor }, root)

  return (
    <group ref={root} rotation={PHYSICS_TO_THREE}>
      <ambientLight intensity={1} />
      {Array.from({ length: MAX_BENCHES * MAX_DEVICES }, (_, i) => (
        <lineSegments key={i} ref={(o) => void (magnets.current[i] = o)} geometry={edges}>
          <lineBasicMaterial color={INK.silver} />
        </lineSegments>
      ))}
      {beamLines.map((line, b) => (
        <group key={b}>
          <primitive object={line} ref={(o: THREE.Line | null) => void (beams.current[b] = o)} />
          <mesh ref={(o) => void (spots.current[b * 2] = o)} geometry={spotGeo}>
            <meshBasicMaterial color={INK.plus} />
          </mesh>
          <mesh ref={(o) => void (spots.current[b * 2 + 1] = o)} geometry={spotGeo}>
            <meshBasicMaterial color={INK.minus} />
          </mesh>
        </group>
      ))}
      <mesh position={[-1.4, -3.75, 0]}>
        <cylinderGeometry args={[0.4, 0.4, 0.95, 16]} />
        <meshBasicMaterial color={INK.silver3} wireframe />
      </mesh>
    </group>
  )
}

/* ------------------------------------------------------------------------------------------------ */
/* hilbert-plane: flat, unlit, orthographic (D §3.2)                                                 */
/* ------------------------------------------------------------------------------------------------ */

const HALF_H = 1.55

export function PlaceholderPlane(_: SceneProps<'hilbert-plane'>) {
  const cam = useMemo(() => {
    const c = new THREE.OrthographicCamera(-HALF_H, HALF_H, HALF_H, -HALF_H, -10, 10)
    c.position.set(0, 0, 5)
    return c
  }, [])
  useStageCamera(cam)
  const psi = useRef<THREE.Line>(null)
  const e1 = useRef<THREE.Line>(null)
  const e2 = useRef<THREE.Line>(null)
  const sh1 = useRef<THREE.Line>(null)
  const sh2 = useRef<THREE.Line>(null)
  const tip = useMemo(() => new THREE.Vector3(1, 0, 0), [])
  const circle = useMemo(
    () => lineGeo(Array.from({ length: 97 }, (_, i) => new THREE.Vector3(Math.cos((i / 96) * Math.PI * 2), Math.sin((i / 96) * Math.PI * 2), 0))),
    [],
  )
  const lines = useMemo(() => {
    const unit = lineGeo([new THREE.Vector3(0, 0, 0), new THREE.Vector3(1, 0, 0)])
    const mk = (color: string, opacity = 1) =>
      new THREE.Line(unit, new THREE.LineBasicMaterial({ color, transparent: opacity < 1 || color === INK.state, opacity }))
    return { e1: mk(INK.plus), e2: mk(INK.minus), psi: mk(INK.state), sh1: mk(INK.plus, 0.6), sh2: mk(INK.minus, 0.6) }
  }, [])
  useStageLabels({
    psi: { text: '$|\\psi\\rangle$', tier: 'chip', tone: 'state' },
    probs: { text: '—', tier: 'readout', tone: 'plus' },
  })
  const readout = useLabelKey('probs')

  useStageFrame<'hilbert-plane'>((f) => {
    const s = f.state
    const aspect = f.size.h > 0 ? f.size.w / f.size.h : 1
    if (Math.abs(cam.right - HALF_H * aspect) > 1e-6) {
      cam.left = -HALF_H * aspect
      cam.right = HALF_H * aspect
      cam.updateProjectionMatrix()
    }
    if (e1.current) e1.current.rotation.z = s.basis
    if (e2.current) e2.current.rotation.z = s.basis + Math.PI / 2
    const p = psi.current
    if (p) {
      p.visible = s.psi !== null && s.psiAlpha > 0.01
      if (s.psi !== null) {
        p.rotation.z = s.psi
        ;(p.material as THREE.LineBasicMaterial).opacity = s.psiAlpha
        tip.set(Math.cos(s.psi) * 1.08, Math.sin(s.psi) * 1.08, 0)
      }
    }
    // shadows: the projections of ψ on the two basis arrows (lengths √P from the engine's probabilities)
    for (const [ref, k] of [[sh1, 0], [sh2, 1]] as const) {
      const l = ref.current
      if (!l) continue
      l.visible = !!s.probs && s.shadows > 0.01
      if (s.probs && s.psi !== null) {
        const ang = s.basis + (k * Math.PI) / 2
        const len = Math.cos(s.psi - ang) // signed shadow; |len|² = probs[k]
        l.rotation.z = ang
        l.scale.set(len, 1, 1)
      }
    }
    writeReadout(readout, s.probs ? `P₁ ${s.probs[0].toFixed(3)} · P₂ ${s.probs[1].toFixed(3)}` : '—')
  })
  useDomLabels({ psi: tip })

  return (
    <group>
      <lineLoop geometry={circle}>
        <lineBasicMaterial color={INK.silver2} />
      </lineLoop>
      <primitive object={lines.e1} ref={e1} />
      <primitive object={lines.e2} ref={e2} />
      <primitive object={lines.psi} ref={psi} />
      <primitive object={lines.sh1} ref={sh1} position={[0, 0, -0.01]} />
      <primitive object={lines.sh2} ref={sh2} position={[0, 0, -0.01]} />
    </group>
  )
}

/* ------------------------------------------------------------------------------------------------ */
/* bloch / bloch-ball: wire sphere + the state point                                                 */
/* ------------------------------------------------------------------------------------------------ */

export function PlaceholderSphere(_: SceneProps<'bloch' | 'bloch-ball'>) {
  const cam = useMemo(() => {
    const c = new THREE.PerspectiveCamera(48, 1, 0.1, 50)
    c.position.copy(physToThree(3.6, 2.1, 1.6))
    c.lookAt(0, 0, 0)
    return c
  }, [])
  useStageCamera(cam)
  const point = useRef<THREE.Mesh>(null)
  useStageLabels({ state: { text: '—', tier: 'readout', tone: 'state' } })
  const readout = useLabelKey('state')
  useStageFrame<'bloch' | 'bloch-ball'>((f) => {
    const r = f.state.r
    point.current?.position.copy(physToThree(r[0], r[1], r[2]))
    const s = f.state
    writeReadout(readout, s.kind === 'bloch-ball' ? `|r| ${s.rNorm.toFixed(2)} · Tr ρ² ${s.purity.toFixed(2)}` : s.pPlus === null ? 'pure' : `P(+) ${s.pPlus.toFixed(3)}`)
  })
  return (
    <group>
      <mesh>
        <sphereGeometry args={[1, 18, 12]} />
        <meshBasicMaterial color={INK.silver3} wireframe />
      </mesh>
      <mesh ref={point}>
        <sphereGeometry args={[0.06, 12, 8]} />
        <meshBasicMaterial color={INK.state} />
      </mesh>
    </group>
  )
}
