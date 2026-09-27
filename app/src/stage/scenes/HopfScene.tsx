/**
 * hopf — S³ by stereographic projection (D-L1-scenes §3.5; ported from the Phase-0 gate for Lectures 2 and 5–7).
 * Draws ONLY `f.state` (ResolvedHopf: which fiber sets, the continuous reveal, the marked state θ, φ, χ and its
 * rotation). Fiber curves are physics/hopf.ts `fiberPolyline` (exact points; tubes follow them); the bead is
 * `fiberPoint3(θ, φ, χ)`. Colour = luminance ramp by θ (tokens `hopfRampHex`, the same as the home-page film),
 * never hue; the marked state's fiber and bead are near-white (the state).
 * The linked mini Bloch sphere (bottom-right, world-oriented) shows the marked state's Bloch point: while the bead
 * slides along its fiber (global phase) that point does not move. The |−z⟩ fiber is the vertical line through
 * infinity and is allowed to leave the frame. Camera shots HF-WIDE / HF-FIBER / HF-PAIR; the frame widens with
 * the reveal (scroll-linked, no idle motion).
 */
import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js'
import { fiberPoint3, fiberPolyline } from '../../physics/hopf'
import { hopfRampHex, INK } from '../tokens'
import { physToThree, useDomLabels, useLabelKey, useStageCamera, useStageFrame, useStageLabels, writeReadout, type LabelItem } from '../hooks'
import type { SceneProps } from '../types'
import { hopfReadout, ringFibers, setAlpha, tubeRadius } from './hopf/hopfSets'

const R_CLAMP = 6
const SAMPLES = 144
const SHOTS = { 'HF-WIDE': { az: 35, el: 28, d: 9.5 }, 'HF-FIBER': { az: 35, el: 20, d: 6.5 }, 'HF-PAIR': { az: 20, el: 12, d: 8 } } as const
/** fibers per reveal level (3: θ 80° ring, 4: θ 55°, 5: the rest) for each count */
const LEVEL_COUNTS = Object.fromEntries(
  ([64, 128] as const).map((c) => {
    const f = ringFibers(c)
    return [c, { 3: f.filter((x) => x.level === 3).length, 4: f.filter((x) => x.level === 4).length, 5: f.filter((x) => x.level === 5).length }]
  }),
) as Record<64 | 128, Record<3 | 4 | 5, number>>
/** radius to keep in frame per reveal level (0 none … 5 all); the |−z⟩ line is allowed to leave */
const FIT_BY_LEVEL = [1.5, 1.5, 1.8, 2.4, 2.6, 4.6]

function fiberTube(theta: number, phi: number, scale = 1.5, radius?: number): THREE.BufferGeometry {
  const pts = fiberPolyline(theta, phi, R_CLAMP, SAMPLES).map((p) => physToThree(p[0], p[1], p[2]))
  const mean = pts.reduce((s, p) => s + p.lengthSq(), 0) / Math.max(1, pts.length)
  const curve = new THREE.CatmullRomCurve3(pts, true, 'centripetal')
  return new THREE.TubeGeometry(curve, 200, radius ?? tubeRadius(mean, scale), 6, true)
}
function colored(g: THREE.BufferGeometry, hex: string): THREE.BufferGeometry {
  const c = new THREE.Color(hex)
  const n = g.getAttribute('position').count
  const col = new Float32Array(n * 3)
  for (let i = 0; i < n; i++) c.toArray(col, i * 3)
  g.setAttribute('color', new THREE.BufferAttribute(col, 3))
  return g
}

export default function HopfScene(_: SceneProps<'hopf'>) {
  const cam = useMemo(() => new THREE.PerspectiveCamera(40, 1, 0.1, 200), [])
  useStageCamera(cam)
  const root = useRef<THREE.Group>(null)
  const mini = useRef<THREE.Group>(null)
  const miniDot = useRef<THREE.Mesh>(null)
  const bead = useRef<THREE.Mesh>(null)
  const markedMesh = useRef<THREE.Mesh>(null)
  const lastMarked = useRef('')
  /** farthest point of the marked state's fiber from the origin (keeps the whole circle in frame) */
  const markedExtent = useRef(0)
  const camKey = useRef('')
  const count = useRef<64 | 128>(64)

  // fiber sets: the |+z⟩ circle, the |−z⟩ line, and one merged, vertex-coloured mesh per ring level (3, 4, 5)
  const sets = useMemo(() => {
    const build = (c: 64 | 128) => {
      const rings = ringFibers(c)
      const byLevel = (lv: 3 | 4 | 5) => mergeGeometries(rings.filter((r) => r.level === lv).map((r) => colored(fiberTube(r.theta, r.phi), hopfRampHex(r.theta))))!
      return { 3: byLevel(3), 4: byLevel(4), 5: byLevel(5) }
    }
    const circle = fiberTube(0, 0, 1.5, 0.03)
    const [a, b] = fiberPolyline(Math.PI, 0, R_CLAMP, 2).map((p) => physToThree(p[0], p[1], p[2]))
    const line = new THREE.TubeGeometry(new THREE.LineCurve3(a, b), 2, 0.02, 6, false)
    return { rings: { 64: build(64), 128: null as ReturnType<typeof build> | null }, build, circle, line }
  }, [])
  const mats = useMemo(
    () => ({
      ring: [3, 4, 5].map(() => new THREE.MeshStandardMaterial({ vertexColors: true, metalness: 0.1, roughness: 0.42, transparent: true })),
      circle: new THREE.MeshStandardMaterial({ color: hopfRampHex(0), metalness: 0.2, roughness: 0.35, transparent: true }),
      line: new THREE.MeshStandardMaterial({ color: hopfRampHex(Math.PI), metalness: 0.2, roughness: 0.4, transparent: true }),
      marked: new THREE.MeshStandardMaterial({ color: INK.state, emissive: INK.state, emissiveIntensity: 0.25, roughness: 0.3 }),
      bead: new THREE.MeshStandardMaterial({ color: INK.state, emissive: INK.state, emissiveIntensity: 1.1 }),
    }),
    [],
  )
  const ringMeshes = useMemo(
    () =>
      ([3, 4, 5] as const).map((lv, i) => {
        const m = new THREE.Mesh(sets.rings[64][lv], mats.ring[i])
        m.userData.level = lv
        return m
      }),
    [sets, mats],
  )
  useEffect(
    () => () => {
      for (const g of [sets.circle, sets.line, ...Object.values(sets.rings[64]), ...(sets.rings[128] ? Object.values(sets.rings[128]) : [])]) g.dispose()
      markedMesh.current?.geometry.dispose()
    },
    [sets],
  )

  const item = (anchor: THREE.Vector3, priority: number, alpha = 1): LabelItem => ({ anchor, alpha, priority })
  const anchors = useMemo(
    () => ({
      plus: item(physToThree(0.72, -0.72, 0.1), 3, 0),
      minus: item(physToThree(0, 0, 2.2), 3, 0),
      bead: item(new THREE.Vector3(), 1, 0),
      mini: item(new THREE.Vector3(), 2, 0),
    }),
    [],
  )
  const labels = useMemo(
    () => ({
      plus: { text: '$|{+z}\\rangle$ circle', tier: 'axis' as const, tone: 'silver' as const },
      minus: { text: '$|{-z}\\rangle$ line', tier: 'axis' as const, tone: 'silver' as const },
      bead: { text: '$e^{i\\chi}|\\psi\\rangle$', tier: 'chip' as const, tone: 'state' as const },
      mini: { text: 'Bloch point', tier: 'axis' as const, tone: 'silver' as const },
      r0: { text: '', tier: 'readout' as const, tone: 'state' as const },
      r1: { text: '', tier: 'readout' as const, tone: 'text' as const },
    }),
    [],
  )
  useStageLabels(labels)
  const r0 = useLabelKey('r0')
  const r1 = useLabelKey('r1')
  const fwd = useMemo(() => new THREE.Vector3(), [])
  const right = useMemo(() => new THREE.Vector3(), [])
  const upV = useMemo(() => new THREE.Vector3(), [])

  useStageFrame<'hopf'>((f) => {
    const s = f.state
    // 128 fibers only if a beat asks (built on demand, kept)
    if (s.count !== count.current) {
      count.current = s.count
      if (s.count === 128 && !sets.rings[128]) sets.rings[128] = sets.build(128)
      const src = s.count === 128 ? sets.rings[128]! : sets.rings[64]
      ringMeshes.forEach((m) => (m.geometry = src[m.userData.level as 3 | 4 | 5]))
    }
    const rv = s.reveal
    // camera: the shot, pulled back to fit what is revealed (continuous with the reveal)
    const shot = SHOTS[s.shot ?? 'HF-WIDE']
    const lv = Math.max(0, Math.min(5, rv))
    const i0 = Math.floor(lv)
    const fitLevel = FIT_BY_LEVEL[i0] + (FIT_BY_LEVEL[Math.min(5, i0 + 1)] - FIT_BY_LEVEL[i0]) * (lv - i0)
    const fit = s.marked && rv >= 1 ? Math.max(fitLevel, Math.min(4.6, markedExtent.current * 1.08)) : fitLevel
    const vf = (cam.fov * Math.PI) / 360
    const half = Math.min(vf, Math.atan(Math.tan(vf) * cam.aspect))
    const d = Math.max(shot.d * (fit / 4.6), fit / Math.sin(half))
    const key = `${s.shot}:${d.toFixed(3)}:${cam.aspect.toFixed(3)}`
    if (camKey.current !== key) {
      camKey.current = key
      const az = (shot.az * Math.PI) / 180
      const el = (shot.el * Math.PI) / 180
      cam.position.copy(physToThree(d * Math.cos(el) * Math.cos(az), d * Math.cos(el) * Math.sin(az), d * Math.sin(el)))
      cam.up.set(0, 1, 0)
      cam.lookAt(0, 0, 0)
      cam.updateMatrixWorld()
    }
    // sets
    const pairA = setAlpha(1, rv)
    mats.circle.opacity = mats.line.opacity = pairA
    anchors.plus.alpha = anchors.minus.alpha = pairA > 0.5 && rv < 3.5 ? 1 : 0
    ringMeshes.forEach((m, i) => {
      const a = setAlpha(m.userData.level as number, rv)
      mats.ring[i].opacity = a
      m.visible = a > 0.01
    })
    // the marked state: its fiber (rebuilt only when its base point moves) and the bead at χ
    const mk = s.marked
    const showMarked = !!mk && rv >= 1
    if (markedMesh.current) markedMesh.current.visible = showMarked
    if (bead.current) bead.current.visible = showMarked
    anchors.bead.alpha = showMarked ? 1 : 0
    if (mk && showMarked) {
      const k = `${mk.theta.toFixed(4)}:${mk.phi.toFixed(4)}`
      if (k !== lastMarked.current && markedMesh.current) {
        lastMarked.current = k
        markedMesh.current.geometry.dispose()
        markedMesh.current.geometry = mk.theta < 1e-6 ? fiberTube(0, 0, 1.5, 0.036) : fiberTube(mk.theta, mk.phi, 1.5, 0.034)
        markedExtent.current = Math.max(...fiberPolyline(mk.theta, mk.phi, R_CLAMP, 72).map((p) => Math.hypot(p[0], p[1], p[2])))
      }
      const p = fiberPoint3(mk.theta, mk.phi, mk.chi)
      if (p && bead.current) {
        bead.current.position.copy(physToThree(p[0], p[1], p[2]))
        anchors.bead.anchor.copy(bead.current.position).multiplyScalar(1.12).add(new THREE.Vector3(0, 0.18, 0))
      }
    }
    // mini Bloch sphere: bottom-right of the frame, world-oriented; its dot = the marked state's Bloch point
    if (mini.current) {
      const on = !!mk && s.mini
      mini.current.visible = on
      anchors.mini.alpha = on ? 1 : 0
      if (on) {
        fwd.set(0, 0, -1).applyQuaternion(cam.quaternion)
        right.set(1, 0, 0).applyQuaternion(cam.quaternion)
        upV.set(0, 1, 0).applyQuaternion(cam.quaternion)
        const dist = 4
        const h = dist * Math.tan(vf)
        const w = h * cam.aspect
        mini.current.position.copy(cam.position).addScaledVector(fwd, dist).addScaledVector(right, w * 0.68).addScaledVector(upV, -h * 0.62)
        const sc = Math.min(w, h) * 0.2
        mini.current.scale.setScalar(sc)
        miniDot.current?.position.copy(physToThree(mk!.r[0], mk!.r[1], mk!.r[2]))
        anchors.mini.anchor.copy(mini.current.position).addScaledVector(upV, sc * 1.35)
      }
    }
    // readouts: where the bead is (marked state) and how many fibers are fully shown
    const perLevel = LEVEL_COUNTS[count.current]
    const shownFibers = (pairA > 0.5 ? 2 : 0) + ([3, 4, 5] as const).reduce((n, lvl) => n + (setAlpha(lvl, rv) > 0.5 ? perLevel[lvl] : 0), 0)
    const lines = hopfReadout(showMarked && mk ? { chi: mk.chi, rotAngle: mk.rotAngle } : null, shownFibers)
    writeReadout(r0, lines.length > 1 ? lines[0] : '')
    writeReadout(r1, lines[lines.length - 1])
    if (root.current) root.current.visible = f.weight > 0
  })
  useDomLabels(anchors, root)

  return (
    <group ref={root}>
      <ambientLight intensity={0.5} />
      <directionalLight position={[4, 6, 5]} intensity={1.0} />
      <directionalLight position={[-5, -2, -4]} intensity={0.35} color="#a9bcff" />
      <mesh geometry={sets.circle} material={mats.circle} />
      <mesh geometry={sets.line} material={mats.line} />
      {ringMeshes.map((m, i) => (
        <primitive key={i} object={m} />
      ))}
      <mesh ref={markedMesh} material={mats.marked}>
        <bufferGeometry />
      </mesh>
      <mesh ref={bead} material={mats.bead}>
        <sphereGeometry args={[0.09, 20, 14]} />
      </mesh>
      <group ref={mini}>
        <mesh>
          <sphereGeometry args={[1, 32, 20]} />
          <meshStandardMaterial color="#a7b6cf" transparent opacity={0.12} depthWrite={false} />
        </mesh>
        <lineLoop>
          <bufferGeometry
            onUpdate={(g) =>
              g.setFromPoints(Array.from({ length: 65 }, (_, i) => physToThree(Math.cos((i / 64) * 2 * Math.PI), Math.sin((i / 64) * 2 * Math.PI), 0)))
            }
          />
          <lineBasicMaterial color={INK.silver2} />
        </lineLoop>
        <mesh ref={miniDot} material={mats.bead}>
          <sphereGeometry args={[0.12, 16, 10]} />
        </mesh>
      </group>
    </group>
  )
}
