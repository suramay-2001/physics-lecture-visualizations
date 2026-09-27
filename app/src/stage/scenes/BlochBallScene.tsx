/**
 * bloch-ball — pure states on the surface, mixtures inside (decision #6; D-L1-scenes §3.4). Beauty-first:
 * a lit translucent ball, local lights only (no remote environment maps, CSP). Draws ONLY `f.state`
 * (ResolvedBall): the engine's Bloch vector r, |r|, Tr ρ² and the comparison point; the scene decides no
 * physics. Grammar: a pure state is a FILLED near-white dot on the surface; a mixture is a HOLLOW ring
 * inside (a mixture is not "partly up": the fidelity note says so, the ring shape shows it). The comparison
 * marker follows the same grammar in silver (a pure comparison is a filled dot, a mixed one a ring). With `recipe`
 * the ingredients are small silver dots joined by a dashed chord: the mixture sits at their weighted average. A
 * magnet axis is a dashed line with amber / cobalt dots at +n̂ / −n̂ and a P(+) readout (as in the bloch scene).
 * Axes are labelled ⟨σx⟩, ⟨σy⟩, ⟨σz⟩ — state space, not the lab. No idle motion: everything follows `f`.
 * The camera backs off on narrow stages so the ball and its axis labels always fit (L6 QA: portrait crop).
 * Shots: B-STD (oblique) and B-SECTION (the x–z plane face on, +x right and +z up, with its great circle drawn:
 * points in that plane keep their true positions, e.g. a mixture on the chord below the superposition, L6).
 */
import { useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import { physToThree, useDomLabels, useLabelKey, useStageCamera, useStageFrame, useStageLabels, writeReadout, type LabelItem } from '../hooks'
import { INK } from '../tokens'
import type { SceneProps, V3 } from '../types'
import { BALL_AXES, ballAxisReadout, ballReadout, compareLabel, pointKind } from './ball/ballLabels'

const AXIS_LEN = 1.28
const DOT_R = 0.065
const RING_R = 0.075
const INGREDIENT_R = 0.04
/** radius that must stay in frame: the axes plus their labels */
const FIT = 1.55
/** camera direction (physics coordinates) and its distance on a wide stage */
const CAM_DIR: V3 = [3.3, 2.2, 1.7]
const CAM_D = Math.hypot(...CAM_DIR)
/** B-SECTION: from −y, so +x is to the right and +z up */
const SECTION_DIR: V3 = [0, -CAM_D, 0]
/** ingredient dots per recipe (the stage validates short recipes; 4 covers every lecture) */
const MAX_PARTS = 4

const at = (v: V3, out: THREE.Vector3) => out.copy(physToThree(v[0], v[1], v[2]))

export default function BlochBallScene(_: SceneProps<'bloch-ball'>) {
  const cam = useMemo(() => {
    const c = new THREE.PerspectiveCamera(40, 1, 0.1, 50)
    c.position.copy(physToThree(...CAM_DIR))
    c.lookAt(0, 0, 0)
    return c
  }, [])
  useStageCamera(cam)
  const fitRef = useRef(0)
  const sectionRef = useRef<THREE.LineLoop>(null)

  const root = useRef<THREE.Group>(null)
  const dot = useRef<THREE.Mesh>(null)
  const ring = useRef<THREE.Mesh>(null)
  const cmpRing = useRef<THREE.Mesh>(null)
  const cmpDot = useRef<THREE.Mesh>(null)
  const plusDot = useRef<THREE.Mesh>(null)
  const minusDot = useRef<THREE.Mesh>(null)
  const stem = useRef<THREE.Line>(null)
  const parts = useRef<(THREE.Mesh | null)[]>([])

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
      ballAxis: { text: '', tier: 'readout' as const, tone: 'text' as const },
    }),
    [cmpText],
  )
  useStageLabels(labels)
  const readout = useLabelKey('ball')
  const axisReadout = useLabelKey('ballAxis')

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
  const meridian = useMemo(
    () => new THREE.BufferGeometry().setFromPoints(Array.from({ length: 97 }, (_, i) => physToThree(Math.cos((i / 96) * Math.PI * 2), 0, Math.sin((i / 96) * Math.PI * 2)))),
    [],
  )
  // dynamic dashed lines: the magnet axis and the two recipe chords (the point's, the comparison's)
  const lines = useMemo(() => {
    const mk = (n: number, m: THREE.LineDashedMaterial) => {
      const g = new THREE.BufferGeometry()
      g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(n * 3), 3))
      const l = new THREE.Line(g, m)
      l.frustumCulled = false
      l.visible = false
      return l
    }
    const chord = () => new THREE.LineDashedMaterial({ color: INK.silver, dashSize: 0.05, gapSize: 0.04, transparent: true, opacity: 0.7 })
    return {
      measure: mk(2, new THREE.LineDashedMaterial({ color: INK.silver, dashSize: 0.06, gapSize: 0.045, transparent: true, opacity: 0.85 })),
      chord: mk(MAX_PARTS + 1, chord()),
      cmpChord: mk(MAX_PARTS + 1, chord()),
    }
  }, [])
  const setLine = (l: THREE.Line, pts: V3[]) => {
    const pos = l.geometry.getAttribute('position') as THREE.BufferAttribute
    pts.forEach((p, i) => {
      const v = physToThree(p[0], p[1], p[2])
      pos.setXYZ(i, v.x, v.y, v.z)
    })
    l.geometry.setDrawRange(0, pts.length)
    pos.needsUpdate = true
    l.geometry.computeBoundingSphere()
    l.computeLineDistances()
  }
  /** a recipe's chord: through every ingredient, closed when there are three or more */
  const recipeLine = (l: THREE.Line, recipe: { r: V3 }[] | null) => {
    l.visible = !!recipe && recipe.length > 1
    if (recipe && l.visible) setLine(l, recipe.length > 2 ? [...recipe.map((q) => q.r), recipe[0].r] : recipe.map((q) => q.r))
  }

  useStageFrame<'bloch-ball'>((f) => {
    const s = f.state
    // camera: back off on a narrow stage so the ball, its axes and their labels stay in frame
    const vf = (cam.fov * Math.PI) / 360
    const half = Math.min(vf, Math.atan(Math.tan(vf) * cam.aspect))
    const d = Math.max(CAM_D, FIT / Math.sin(half))
    const section = s.shot === 'B-SECTION'
    const key = d + (section ? 1000 : 0)
    if (Math.abs(key - fitRef.current) > 1e-3) {
      fitRef.current = key
      cam.position.copy(physToThree(...(section ? SECTION_DIR : CAM_DIR))).multiplyScalar(d / CAM_D)
      cam.up.set(0, 1, 0)
      cam.lookAt(0, 0, 0)
      // face on, the ⟨σy⟩ axis points at the camera: its label would sit on the centre
      anchors.ax1.alpha = section ? 0 : 1
      if (sectionRef.current) sectionRef.current.visible = section
    }
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
    // labels never cross: the comparison's words go radially outward; when the comparison lies further out along
    // (almost) the same ray, as the superposition does beyond its mixture (L6), the state's chip moves inward
    const c = s.compare
    const cNorm = c ? Math.hypot(...c) : 0
    const sameRay = !!c && s.rNorm > 0.02 && cNorm > s.rNorm && (c[0] * s.r[0] + c[1] * s.r[1] + c[2] * s.r[2]) / (cNorm * s.rNorm) > Math.cos(Math.PI / 6)
    if (sameRay) anchors.state.anchor.copy(tmp).multiplyScalar(1 - 0.22 / s.rNorm)
    else anchors.state.anchor.copy(tmp).multiplyScalar(s.rNorm > 0.02 ? 1 + 0.18 / Math.max(s.rNorm, 0.2) : 1).add(physToThree(0, 0, 0.14))
    // the comparison point (e.g. the oven mixture at the centre, r = 0): a silver ring when mixed, a silver dot when pure
    const cmpPure = !!s.compare && pointKind(Math.hypot(...s.compare)) === 'pure'
    anchors.cmp.alpha = s.compare ? 1 : 0
    if (cmpRing.current && cmpDot.current) {
      cmpRing.current.visible = !!s.compare && !cmpPure
      cmpDot.current.visible = cmpPure
      if (s.compare) {
        at(s.compare, cmpRing.current.position)
        cmpDot.current.position.copy(cmpRing.current.position)
        cmpRing.current.quaternion.copy(cam.quaternion)
        if (cNorm > 0.02) anchors.cmp.anchor.copy(cmpRing.current.position).multiplyScalar(1 + 0.22 / cNorm)
        else anchors.cmp.anchor.copy(cmpRing.current.position).add(physToThree(0, 0, -0.2))
      }
    }
    // recipes: ingredient dots (pure states, on the surface) and the chord the mixture sits on
    recipeLine(lines.chord, s.recipe)
    recipeLine(lines.cmpChord, s.compareRecipe)
    const all = [...(s.recipe ?? []), ...(s.compareRecipe ?? [])]
    parts.current.forEach((m, i) => {
      if (!m) return
      m.visible = i < all.length
      if (m.visible) at(all[i].r, m.position)
    })
    // magnet axis: dashed line and outcome dots at ±n̂ (the probability is the resolver's)
    const n = s.axis
    lines.measure.visible = !!n
    if (plusDot.current && minusDot.current) plusDot.current.visible = minusDot.current.visible = !!n
    if (n) {
      setLine(lines.measure, [[-n[0] * AXIS_LEN, -n[1] * AXIS_LEN, -n[2] * AXIS_LEN], [n[0] * AXIS_LEN, n[1] * AXIS_LEN, n[2] * AXIS_LEN]])
      plusDot.current?.position.copy(physToThree(n[0], n[1], n[2]))
      minusDot.current?.position.copy(physToThree(-n[0], -n[1], -n[2]))
      ;(lines.measure.material as THREE.LineDashedMaterial).opacity = f.focus === 'axis-n' ? 1 : 0.85
    }
    writeReadout(axisReadout, ballAxisReadout(s.pPlus))
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
      <lineLoop ref={sectionRef} geometry={meridian} visible={false}>
        <lineBasicMaterial color={INK.silver2} transparent opacity={0.9} />
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
      <mesh ref={cmpDot} visible={false}>
        <sphereGeometry args={[DOT_R, 20, 14]} />
        <meshStandardMaterial color={INK.silver} emissive={INK.silver} emissiveIntensity={0.2} />
      </mesh>
      <primitive object={lines.measure} />
      <primitive object={lines.chord} />
      <primitive object={lines.cmpChord} />
      {Array.from({ length: 2 * MAX_PARTS }, (_, i) => (
        <mesh key={i} ref={(m) => void (parts.current[i] = m)} visible={false}>
          <sphereGeometry args={[INGREDIENT_R, 14, 10]} />
          <meshStandardMaterial color={INK.silver2} emissive={INK.silver2} emissiveIntensity={0.25} />
        </mesh>
      ))}
      <mesh ref={plusDot} visible={false}>
        <sphereGeometry args={[0.045, 16, 10]} />
        <meshStandardMaterial color={INK.plus} emissive={INK.plus} emissiveIntensity={0.4} />
      </mesh>
      <mesh ref={minusDot} visible={false}>
        <sphereGeometry args={[0.045, 16, 10]} />
        <meshStandardMaterial color={INK.minus} emissive={INK.minus} emissiveIntensity={0.4} />
      </mesh>
    </group>
  )
}
