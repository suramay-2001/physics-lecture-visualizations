/**
 * bloch-ball — pure states on the surface, mixtures inside (decision #6; D-L1-scenes §3.4). Beauty-first:
 * a lit translucent ball, local lights only (no remote environment maps, CSP). Draws ONLY `f.state`
 * (ResolvedBall): the engine's Bloch vector r, |r|, Tr ρ² and the comparison point; the scene decides no
 * physics. Grammar: a pure state is a FILLED near-white dot on the surface; a mixture is a HOLLOW ring
 * inside (a mixture is not "partly up": the fidelity note says so, the ring shape shows it). Axes are
 * labelled ⟨σx⟩, ⟨σy⟩, ⟨σz⟩ — state space, not the lab. No idle motion: everything follows `f`.
 */
import { useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import { physToThree, useDomLabels, useLabelKey, useStageCamera, useStageFrame, useStageLabels, writeReadout, type LabelItem } from '../hooks'
import { INK } from '../tokens'
import type { SceneProps, V3 } from '../types'
import { BALL_AXES, ballReadout, compareLabel, pointKind } from './ball/ballLabels'

const AXIS_LEN = 1.28
const DOT_R = 0.065
const RING_R = 0.075

const at = (v: V3, out: THREE.Vector3) => out.copy(physToThree(v[0], v[1], v[2]))

export default function BlochBallScene(_: SceneProps<'bloch-ball'>) {
  const cam = useMemo(() => {
    const c = new THREE.PerspectiveCamera(40, 1, 0.1, 50)
    c.position.copy(physToThree(3.3, 2.2, 1.7))
    c.lookAt(0, 0, 0)
    return c
  }, [])
  useStageCamera(cam)

  const root = useRef<THREE.Group>(null)
  const dot = useRef<THREE.Mesh>(null)
  const ring = useRef<THREE.Mesh>(null)
  const cmpRing = useRef<THREE.Mesh>(null)
  const stem = useRef<THREE.Line>(null)

  const item = (anchor: THREE.Vector3, priority: number, alpha = 1): LabelItem => ({ anchor, alpha, priority })
  const anchors = useMemo(
    () => ({
      ax0: item(physToThree(AXIS_LEN + 0.12, 0, 0), 3),
      ax1: item(physToThree(0, AXIS_LEN + 0.12, 0), 3),
      // ⟨σz⟩ sits beside the top of its axis, below the passport strip (the label pass hid it at the tip)
      ax2: item(physToThree(0.16, 0, AXIS_LEN - 0.08), 3),
      state: item(new THREE.Vector3(), 1),
      cmp: item(new THREE.Vector3(), 2, 0),
    }),
    [],
  )
  // the comparison ring's words change only when the beat changes: one React publish, not per frame
  const [cmpText, setCmpText] = useState('mixture')
  const cmpTextRef = useRef(cmpText)
  const labels = useMemo(
    () => ({
      ax0: { text: BALL_AXES[0], tier: 'axis' as const, tone: 'silver' as const },
      ax1: { text: BALL_AXES[1], tier: 'axis' as const, tone: 'silver' as const },
      ax2: { text: BALL_AXES[2], tier: 'axis' as const, tone: 'silver' as const },
      state: { text: '$\\rho$', tier: 'chip' as const, tone: 'state' as const },
      cmp: { text: cmpText, tier: 'axis' as const, tone: 'silver' as const },
      ball: { text: '', tier: 'readout' as const, tone: 'state' as const },
    }),
    [cmpText],
  )
  useStageLabels(labels)
  const readout = useLabelKey('ball')

  const axes = useMemo(
    () =>
      ([[1, 0, 0], [0, 1, 0], [0, 0, 1]] as V3[]).map((a) =>
        new THREE.BufferGeometry().setFromPoints([physToThree(-a[0] * AXIS_LEN, -a[1] * AXIS_LEN, -a[2] * AXIS_LEN), physToThree(a[0] * AXIS_LEN, a[1] * AXIS_LEN, a[2] * AXIS_LEN)]),
      ),
    [],
  )
  const stemLine = useMemo(
    () => new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3(0, 1, 0)]), new THREE.LineBasicMaterial({ color: INK.state, transparent: true, opacity: 0.85 })),
    [],
  )
  const equator = useMemo(
    () => new THREE.BufferGeometry().setFromPoints(Array.from({ length: 97 }, (_, i) => physToThree(Math.cos((i / 96) * Math.PI * 2), Math.sin((i / 96) * Math.PI * 2), 0))),
    [],
  )
  const tmp = useMemo(() => new THREE.Vector3(), [])

  useStageFrame<'bloch-ball'>((f) => {
    const s = f.state
    const pure = pointKind(s.rNorm) === 'pure'
    at(s.r, tmp)
    // the state: filled dot when pure, hollow ring when mixed (rings face the camera)
    if (dot.current) {
      dot.current.visible = pure
      dot.current.position.copy(tmp)
    }
    if (ring.current) {
      ring.current.visible = !pure
      ring.current.position.copy(tmp)
      ring.current.quaternion.copy(cam.quaternion)
    }
    if (stem.current) {
      stem.current.visible = s.rNorm > 0.02
      stem.current.geometry.setFromPoints([new THREE.Vector3(), tmp.clone()])
    }
    anchors.state.anchor.copy(tmp).multiplyScalar(s.rNorm > 0.02 ? 1 + 0.18 / Math.max(s.rNorm, 0.2) : 1).add(physToThree(0, 0, 0.14))
    // the comparison point (e.g. the oven mixture at the centre, r = 0): always a hollow ring
    if (cmpRing.current) {
      cmpRing.current.visible = !!s.compare
      anchors.cmp.alpha = s.compare ? 1 : 0
      if (s.compare) {
        at(s.compare, cmpRing.current.position)
        cmpRing.current.quaternion.copy(cam.quaternion)
        anchors.cmp.anchor.copy(cmpRing.current.position).add(physToThree(0, 0, -0.2))
      }
    }
    writeReadout(readout, ballReadout(s.rNorm, s.purity, s.purityShown > 0.5))
    if (s.compare) {
      const next = compareLabel(s.compare)
      if (next !== cmpTextRef.current) {
        cmpTextRef.current = next
        setCmpText(next)
      }
    }
    if (root.current) root.current.visible = f.weight > 0
  })
  useDomLabels(anchors, root)

  return (
    <group ref={root}>
      <ambientLight intensity={0.55} />
      <directionalLight position={[3, 4, 5]} intensity={0.9} />
      <directionalLight position={[-4, -1, -3]} intensity={0.25} />
      {/* the ball: translucent, lit; depthWrite off so the interior points stay visible */}
      <mesh>
        <sphereGeometry args={[1, 64, 40]} />
        <meshStandardMaterial color={INK.silver2} transparent opacity={0.14} roughness={0.35} metalness={0.1} depthWrite={false} />
      </mesh>
      <lineLoop geometry={equator}>
        <lineBasicMaterial color={INK.silver2} transparent opacity={0.6} />
      </lineLoop>
      {axes.map((g, i) => (
        <lineSegments key={i} geometry={g}>
          <lineBasicMaterial color={INK.silver} transparent opacity={0.7} />
        </lineSegments>
      ))}
      <primitive object={stemLine} ref={stem} />
      <mesh ref={dot}>
        <sphereGeometry args={[DOT_R, 20, 14]} />
        <meshStandardMaterial color={INK.state} emissive={INK.state} emissiveIntensity={0.35} />
      </mesh>
      <mesh ref={ring}>
        <torusGeometry args={[RING_R, 0.014, 10, 40]} />
        <meshBasicMaterial color={INK.state} toneMapped={false} />
      </mesh>
      <mesh ref={cmpRing}>
        <torusGeometry args={[RING_R, 0.014, 10, 40]} />
        <meshBasicMaterial color={INK.silver} toneMapped={false} />
      </mesh>
    </group>
  )
}
