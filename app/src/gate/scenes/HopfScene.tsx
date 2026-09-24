import { PerspectiveCamera } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { memo, useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js'
import { basePoints, blochPoint, fiberPoint3, fiberSpan } from '../hopf'
import { store } from '../store'
import { INK, STAGE_BG, T, beatPos, clamp01, fitCamera, keyed, smooth, stageClock, stageT, useDomLabels, useSharedEnv } from './common'

/*
 * Hopf fibration stage: fibers of S³ → S², stereographically projected from (0,0,0,1) and drawn in
 * three.js via T(p₁, p₂, p₃) = (p₁, p₃, −p₂) so p₃ (the |−z⟩ fiber) is vertical.
 * Colors are a luminance ramp by latitude θ (θ = 0 brightest), never hue: amber/cobalt are reserved.
 */
export const R_CLAMP = 6
const TUBULAR = 180
const RADIAL = 8
const IDX_PER_FIBER = TUBULAR * RADIAL * 6
// φ chosen so this fiber's plane faces the beat-1 camera (az ≈ 0.8, el ≈ 0.6); see gate notes.
const BEAD = { theta: (70 * Math.PI) / 180, phi: 3.94 }
const PARTNER = { theta: (120 * Math.PI) / 180, phi: 2.1 }

const DARK = new THREE.Color('#4a5462')
const LIGHT = new THREE.Color('#f5f7fa')
export const rampColor = (theta: number) => new THREE.Color().lerpColors(LIGHT, DARK, theta / Math.PI)

/** Exact fiber curve (no spline): parameter t ∈ [0,1] ↦ χ ∈ [chi0, chi1]; three.js re-parametrizes by arc length. */
class FiberCurve extends THREE.Curve<THREE.Vector3> {
  theta: number
  phi: number
  chi0: number
  chi1: number
  constructor(theta: number, phi: number) {
    super()
    this.theta = theta
    this.phi = phi
    const span = fiberSpan(theta, phi, R_CLAMP)
    this.chi0 = span.chi0
    this.chi1 = span.closed ? span.chi0 + Math.PI * 2 : span.chi1
    this.arcLengthDivisions = span.closed ? 400 : 2000
  }
  getPoint(t: number, target = new THREE.Vector3()) {
    const p = fiberPoint3(this.theta, this.phi, this.chi0 + (this.chi1 - this.chi0) * t)
    if (!p) return target.set(0, R_CLAMP, 0)
    return target.set(p[0], p[2], -p[1])
  }
}

function tube(theta: number, phi: number, radius: number, closed: boolean, color?: THREE.Color) {
  const g = new THREE.TubeGeometry(new FiberCurve(theta, phi), TUBULAR, radius, RADIAL, closed)
  if (color) {
    const n = g.attributes.position.count
    const col = new Float32Array(n * 3)
    for (let i = 0; i < n; i++) color.toArray(col, i * 3)
    g.setAttribute('color', new THREE.BufferAttribute(col, 3))
  }
  return g
}

export function useHopfData(fibers: 64 | 128) {
  return useMemo(() => {
    const t0 = performance.now()
    const pts = basePoints(fibers)
    const merged = mergeGeometries(pts.map((b) => tube(b.theta, b.phi, 0.02, true, rampColor(b.theta))))!
    const firstRing = pts.filter((p) => p.ring === pts[0].ring).length
    const data = {
      pts,
      firstRing,
      merged,
      circle: tube(0, 0, 0.034, true), // |+z⟩: the unit circle in the p₁p₂ plane
      line: tube(Math.PI, 0, 0.034, false), // |−z⟩: through the projection pole → the p₃ axis, clipped at |p| ≤ 6
      bead: tube(BEAD.theta, BEAD.phi, 0.036, true),
      partner: tube(PARTNER.theta, PARTNER.phi, 0.036, true),
      buildMs: 0,
    }
    data.buildMs = performance.now() - t0
    return data
  }, [fibers])
}

/** Fibers shown (fractional → a partly drawn tube) as a function of keyframe time t. */
export function fibersShown(t: number, firstRing: number, total: number) {
  if (t < 1) return 0
  if (t < 2) return firstRing * (t - 1)
  if (t < 3) return firstRing + (total - firstRing) * (t - 2)
  return total
}

const CAM = {
  r: [5.6, 5.4, 8.4, 11.0, 10.6],
  el: [0.42, 0.6, 0.5, 0.52, 0.36],
  az: [0.55, 0.62, 0.95, 1.2, 1.5],
}

function Hopf({ fibers }: { fibers: 64 | 128 }) {
  store.renders.sceneHopf++
  useSharedEnv(0.55)
  const d = useHopfData(fibers)
  const cam = useRef<THREE.PerspectiveCamera>(null)
  const mergedRef = useRef<THREE.Mesh>(null)
  const beadRef = useRef<THREE.Mesh>(null)
  const beadFiber = useRef<THREE.Mesh>(null)
  const partner = useRef<THREE.Mesh>(null)
  const fiberMat = useMemo(() => new THREE.MeshStandardMaterial({ vertexColors: true, metalness: 0.1, roughness: 0.42 }), [])
  const hiMat = useMemo(() => new THREE.MeshStandardMaterial({ color: INK.state, emissive: INK.state, emissiveIntensity: 0.25, metalness: 0.2, roughness: 0.25 }), [])
  const circleMat = useMemo(() => new THREE.MeshStandardMaterial({ color: rampColor(0), metalness: 0.3, roughness: 0.28 }), [])
  const lineMat = useMemo(() => new THREE.MeshStandardMaterial({ color: rampColor(Math.PI), metalness: 0.3, roughness: 0.35 }), [])

  useEffect(() => {
    store.fibers = fibers
    store.hopfBuildMs = Math.round(d.buildMs * 10) / 10
    return () => {
      d.merged.dispose()
      d.circle.dispose()
      d.line.dispose()
      d.bead.dispose()
      d.partner.dispose()
    }
  }, [d, fibers])
  useEffect(() => () => [fiberMat, hiMat, circleMat, lineMat].forEach((m) => m.dispose()), [fiberMat, hiMat, circleMat, lineMat])

  useFrame((state) => {
    const n = store.sections.hopf.beats
    const u = beatPos('hopf')
    const t = stageT(u, n)
    const time = stageClock(state.clock.elapsedTime)
    const shown = fibersShown(t, d.firstRing, d.pts.length)
    d.merged.setDrawRange(0, Math.floor((shown * IDX_PER_FIBER) / 6) * 6)
    if (mergedRef.current) mergedRef.current.visible = shown > 0
    // global phase: the bead slides along its fiber while its Bloch point stays fixed
    const beadOn = smooth((t - 0.5) / 0.5)
    const chi = 2 * Math.PI * clamp01(u - 1) * 1.25 + (store.motion ? time * 0.35 : 0)
    const p = fiberPoint3(BEAD.theta, BEAD.phi, chi)
    if (beadRef.current && p) {
      beadRef.current.position.set(p[0], p[2], -p[1])
      beadRef.current.scale.setScalar(0.001 + beadOn)
    }
    if (beadFiber.current) beadFiber.current.visible = beadOn > 0.01
    if (partner.current) partner.current.visible = t > 3.5
    const c = cam.current
    if (c) {
      const r = keyed(CAM.r, t)
      const el = keyed(CAM.el, t)
      const az = keyed(CAM.az, t) + 0.12 * u + (store.motion ? time * 0.03 : 0)
      c.position.set(r * Math.cos(el) * Math.cos(az), r * Math.sin(el), r * Math.cos(el) * Math.sin(az))
      c.lookAt(0, 0, 0)
      fitCamera(c, 40, 'hopf')
    }
  })

  const anchors = useMemo(() => ({ p1: T(3.6, 0, 0), p2: T(0, 3.6, 0), p3: T(0, 0, 3.2) }), [])
  useDomLabels('hopf', anchors)

  const axis = useMemo(
    () => new THREE.BufferGeometry().setFromPoints([T(-3.4, 0, 0), T(3.4, 0, 0), T(0, -3.4, 0), T(0, 3.4, 0)]),
    [],
  )
  useEffect(() => () => axis.dispose(), [axis])

  return (
    <>
      <PerspectiveCamera ref={cam} makeDefault fov={40} near={0.05} far={100} position={[5, 2, 3]} />
      <color attach="background" args={[STAGE_BG.hopf]} />
      <hemisphereLight args={['#dfe6f5', '#141a26', 0.45]} />
      <directionalLight position={[6, 9, 5]} intensity={1.6} color="#ffffff" />
      <directionalLight position={[-7, -2, -6]} intensity={0.8} color="#b8c6ff" />
      <lineSegments geometry={axis}>
        <lineBasicMaterial color="#5d6778" transparent opacity={0.8} />
      </lineSegments>
      <mesh ref={mergedRef} geometry={d.merged} material={fiberMat} />
      <mesh geometry={d.circle} material={circleMat} />
      <mesh geometry={d.line} material={lineMat} />
      <mesh ref={beadFiber} geometry={d.bead} material={hiMat} />
      <mesh ref={partner} geometry={d.partner} material={hiMat} />
      <mesh ref={beadRef}>
        <sphereGeometry args={[0.11, 24, 16]} />
        <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={1.2} />
      </mesh>
    </>
  )
}
export const HopfScene = memo(Hopf)

/* ---------------- the linked mini Bloch sphere (its own <View>) ---------------- */
function MiniBloch({ fibers }: { fibers: 64 | 128 }) {
  store.renders.sceneMini++
  useSharedEnv(0.8)
  const pts = useMemo(() => basePoints(fibers), [fibers])
  const firstRing = useMemo(() => pts.filter((p) => p.ring === pts[0].ring).length, [pts])
  const dots = useRef<THREE.InstancedMesh>(null)
  const bead = useRef<THREE.Mesh>(null)
  const group = useRef<THREE.Group>(null)
  const dotGeo = useMemo(() => new THREE.SphereGeometry(0.045, 12, 8), [])
  useEffect(() => () => dotGeo.dispose(), [dotGeo])

  useEffect(() => {
    const m = dots.current
    if (!m) return
    const o = new THREE.Object3D()
    pts.forEach((b, i) => {
      const r = blochPoint(b.theta, b.phi)
      o.position.copy(T(r[0], r[1], r[2]))
      o.updateMatrix()
      m.setMatrixAt(i, o.matrix)
      m.setColorAt(i, rampColor(b.theta))
    })
    m.instanceMatrix.needsUpdate = true
    if (m.instanceColor) m.instanceColor.needsUpdate = true
  }, [pts])

  const beadPos = useMemo(() => {
    const r = blochPoint(BEAD.theta, BEAD.phi)
    return T(r[0], r[1], r[2])
  }, [])

  useFrame((state) => {
    const n = store.sections.hopf.beats
    const u = beatPos('hopf')
    const t = stageT(u, n)
    const time = stageClock(state.clock.elapsedTime)
    if (dots.current) dots.current.count = Math.ceil(fibersShown(t, firstRing, pts.length) - 1e-6)
    if (bead.current) {
      const on = smooth((t - 0.5) / 0.5)
      bead.current.scale.setScalar(0.001 + on * (1 + (store.motion ? 0.12 * Math.sin(time * 3) : 0)))
    }
    if (group.current) group.current.rotation.y = 0.4 + 0.12 * u + (store.motion ? time * 0.03 : 0)
    state.camera.lookAt(0, 0, 0)
    fitCamera(state.camera as THREE.PerspectiveCamera, 30, 'hopf-mini', 1)
  })

  const anchors = useMemo(() => ({ z: T(0, 0, 1.42) }), [])
  useDomLabels('hopf-mini', anchors)

  return (
    <>
      <PerspectiveCamera makeDefault fov={30} near={0.1} far={20} position={[3.1, 1.7, 3.1]} />
      <color attach="background" args={[STAGE_BG['hopf-mini']]} />
      <hemisphereLight args={['#dfe6f5', '#141a26', 0.5]} />
      <directionalLight position={[4, 6, 5]} intensity={1.8} />
      <group ref={group}>
        <mesh>
          <sphereGeometry args={[1, 48, 32]} />
          <meshStandardMaterial color="#9fb0c8" transparent opacity={0.1} depthWrite={false} roughness={0.2} />
        </mesh>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[1, 0.006, 6, 96]} />
          <meshBasicMaterial color="#6d7888" />
        </mesh>
        <mesh>
          <cylinderGeometry args={[0.006, 0.006, 2.6, 6]} />
          <meshBasicMaterial color="#6d7888" />
        </mesh>
        <mesh position={T(0, 0, 1)}>
          <sphereGeometry args={[0.07, 16, 12]} />
          <meshStandardMaterial color={rampColor(0)} />
        </mesh>
        <mesh position={T(0, 0, -1)}>
          <sphereGeometry args={[0.07, 16, 12]} />
          <meshStandardMaterial color={rampColor(Math.PI)} />
        </mesh>
        <instancedMesh key={fibers} ref={dots} args={[dotGeo, undefined, pts.length]} frustumCulled={false}>
          <meshStandardMaterial roughness={0.35} metalness={0.1} />
        </instancedMesh>
        <mesh ref={bead} position={beadPos}>
          <sphereGeometry args={[0.085, 20, 14]} />
          <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={1.1} />
        </mesh>
      </group>
    </>
  )
}
export const MiniBlochScene = memo(MiniBloch)
