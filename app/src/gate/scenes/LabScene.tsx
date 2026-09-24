import { PerspectiveCamera } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { memo, useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { store } from '../store'
import { INK, PHYSICS_TO_THREE, STAGE_BG, T, beatPos, clamp01, fitCamera, keyed, smooth, stageClock, stageT, useDomLabels, useSharedEnv } from './common'

/*
 * Lab ℝ³: a Stern–Gerlach apparatus authored in physics coordinates (z up, beam along +y) inside a
 * group that applies T = (x, z, −y). Geometry is schematic: sizes are not to scale.
 *
 * Atom model (vertex shader, zero CPU per frame): inside the magnet z(y) = k d², after it a straight line
 * with slope 2kL; k ∝ ± (∂B/∂z)(x) / v². Off-axis atoms feel a weaker gradient, which bends each spot
 * into the "lip" seen on the 1922 plate; slower atoms deflect more, which smears each spot vertically.
 */
const L = {
  y0: -3.75, // oven mouth
  ySlit: -2.6,
  yIn: -1.6,
  yOut: 1.6,
  yPlate: 4.2,
  K: 0.0335, // gives ±0.9 at the plate for v = v0 on axis
  halfWidth: 0.26, // ribbon beam half-width in x
}
const ATOMS = 2000
const DEPOSIT = 1400

function makeAtomMaterial() {
  const mat = new THREE.MeshStandardMaterial({ roughness: 0.3, metalness: 0.1 })
  const uniforms = {
    uTime: { value: 0 },
    uSplit: { value: 0 },
    uReveal: { value: 0 },
    uRadius: { value: 0.019 },
    uGlow: { value: 0.55 },
    uSilver: { value: new THREE.Color(INK.state) },
    uPlus: { value: new THREE.Color(INK.plus) },
    uMinus: { value: new THREE.Color(INK.minus) },
  }
  mat.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms)
    shader.vertexShader = shader.vertexShader
      .replace(
        '#include <common>',
        `#include <common>
uniform float uTime; uniform float uSplit; uniform float uReveal; uniform float uRadius;
uniform vec3 uSilver; uniform vec3 uPlus; uniform vec3 uMinus;
attribute vec4 aSeed; attribute float aSpeed;
varying vec3 vAtomColor;`,
      )
      .replace(
        '#include <begin_vertex>',
        `float s = fract(aSeed.x + uTime * 0.15 * aSpeed);
float y = mix(${L.y0.toFixed(3)}, ${(L.yPlate - 0.03).toFixed(3)}, s);
float xw = aSeed.z * ${L.halfWidth.toFixed(3)};
float spread = mix(2.6, 1.0, smoothstep(${L.y0.toFixed(3)}, ${L.ySlit.toFixed(3)}, y));
float grad = 1.0 - 0.55 * aSeed.z * aSeed.z;
float k = ${L.K.toFixed(5)} * uSplit * aSeed.y * grad / (aSpeed * aSpeed);
float dz = 0.0;
if (y > ${L.yIn.toFixed(3)}) {
  float d = min(y, ${L.yOut.toFixed(3)}) - ${L.yIn.toFixed(3)};
  dz = k * d * d;
  if (y > ${L.yOut.toFixed(3)}) dz += 2.0 * k * ${(L.yOut - L.yIn).toFixed(3)} * (y - ${L.yOut.toFixed(3)});
}
vec3 atomPos = vec3(xw * spread, y, aSeed.w * 0.022 * spread + dz);
float vis = step(y, mix(${L.y0.toFixed(3)}, ${L.yPlate.toFixed(3)}, uReveal)) * step(0.004, uReveal);
// fade atoms that pass right in front of the camera instead of letting them fill the frame
vis *= smoothstep(0.9, 2.4, -(modelViewMatrix * vec4(atomPos, 1.0)).z);
vec3 transformed = vec3(position) * uRadius * vis + atomPos;
float m = smoothstep(${L.yIn.toFixed(3)}, ${(L.yIn + 1.1).toFixed(3)}, y) * uSplit;
vAtomColor = mix(uSilver, aSeed.y > 0.0 ? uPlus : uMinus, m);`,
      )
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', `#include <common>\nvarying vec3 vAtomColor; uniform float uGlow;`)
      .replace('#include <color_fragment>', `#include <color_fragment>\ndiffuseColor.rgb = vAtomColor;`)
      .replace('#include <emissivemap_fragment>', `#include <emissivemap_fragment>\ntotalEmissiveRadiance += vAtomColor * uGlow;`)
  }
  return { mat, uniforms }
}

/** Gaussian via Box–Muller with a seeded LCG so the picture is identical on every load. */
function rng(seed: number) {
  let s = seed >>> 0
  const u = () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) + 0.5) / 4294967296
  const g = () => Math.sqrt(-2 * Math.log(u())) * Math.cos(2 * Math.PI * u())
  return { u, g }
}

function knifeShape() {
  const s = new THREE.Shape()
  s.moveTo(-0.95, 1.55)
  s.lineTo(0.95, 1.55)
  s.lineTo(0.95, 1.0)
  s.lineTo(0.07, 0.655)
  s.quadraticCurveTo(0, 0.61, -0.07, 0.655)
  s.lineTo(-0.95, 1.0)
  s.closePath()
  return s
}
function grooveShape() {
  const s = new THREE.Shape()
  s.moveTo(-0.95, -1.55)
  s.lineTo(0.95, -1.55)
  s.lineTo(0.95, -0.46)
  s.lineTo(0.38, -0.46)
  s.quadraticCurveTo(0, -0.8, -0.38, -0.46)
  s.lineTo(-0.95, -0.46)
  s.closePath()
  return s
}

/** Qualitative field lines in an x–z slice: from the knife tip, fanning out onto the groove. */
function fieldLines(y: number) {
  const curves: THREE.QuadraticBezierCurve3[] = []
  for (let k = -3; k <= 3; k++) {
    const a = (k * 17 * Math.PI) / 180
    const start = new THREE.Vector3(Math.sin(a) * 0.05, y, 0.61 - Math.cos(a) * 0.05)
    const xe = Math.tan(a) * 0.95 + k * 0.06
    const inGroove = Math.abs(xe) < 0.38
    const ze = inGroove ? -0.46 - 0.34 * (1 - (xe / 0.38) ** 2) : -0.46
    const end = new THREE.Vector3(xe, y, ze + 0.015)
    const ctrl = new THREE.Vector3(Math.sin(a) * 0.35, y, 0.05)
    curves.push(new THREE.QuadraticBezierCurve3(start, ctrl, end))
  }
  return curves
}

function useLabAssets() {
  return useMemo(() => {
    const atoms = makeAtomMaterial()
    const atomGeo = new THREE.IcosahedronGeometry(1, 1)
    const seeds = new Float32Array(ATOMS * 4)
    const speeds = new Float32Array(ATOMS)
    const r = rng(448)
    for (let i = 0; i < ATOMS; i++) {
      seeds[i * 4] = r.u()
      seeds[i * 4 + 1] = i % 2 === 0 ? 1 : -1
      seeds[i * 4 + 2] = r.u() * 2 - 1
      seeds[i * 4 + 3] = Math.max(-2.5, Math.min(2.5, r.g()))
      speeds[i] = 0.75 + 0.5 * r.u()
    }
    atomGeo.setAttribute('aSeed', new THREE.InstancedBufferAttribute(seeds, 4))
    atomGeo.setAttribute('aSpeed', new THREE.InstancedBufferAttribute(speeds, 1))

    // Plate deposit: same model evaluated at the plate, one disc per landed atom.
    const depositGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.006, 10)
    const depositPts: { x: number; z: number; plus: boolean }[] = []
    const Ld = L.yOut - L.yIn
    const D = L.yPlate - L.yOut
    for (let i = 0; i < DEPOSIT; i++) {
      const plus = i % 2 === 0
      const jx = r.u() * 2 - 1
      const v = 0.75 + 0.5 * r.u()
      const k = (L.K * (plus ? 1 : -1) * (1 - 0.55 * jx * jx)) / (v * v)
      depositPts.push({ x: jx * L.halfWidth, z: k * Ld * Ld + 2 * k * Ld * D + r.g() * 0.022, plus })
    }
    const lineGeos = [...fieldLines(L.yIn - 0.03), ...fieldLines(0), ...fieldLines(L.yOut + 0.03)].map(
      (c) => new THREE.TubeGeometry(c, 40, 0.006, 5, false),
    )
    return {
      atoms,
      atomGeo,
      depositGeo,
      depositPts,
      lineGeos,
      knife: new THREE.ExtrudeGeometry(knifeShape(), { depth: 3.2, bevelEnabled: true, bevelSize: 0.02, bevelThickness: 0.02, bevelSegments: 2, curveSegments: 18 }),
      groove: new THREE.ExtrudeGeometry(grooveShape(), { depth: 3.2, bevelEnabled: true, bevelSize: 0.02, bevelThickness: 0.02, bevelSegments: 2, curveSegments: 18 }),
    }
  }, [])
}

// Camera keyframes (three.js coordinates; beam runs along −z in three.js).
const CAM = {
  px: [9.0, 0.95, 7.6, 3.6, 2.5],
  py: [5.0, 1.45, 0.9, 1.6, 0.75],
  pz: [7.4, -2.75, -0.6, -8.4, -2.0],
  tx: [0, 0, 0, 0, 0],
  ty: [-0.4, 0.0, 0, 0, 0],
  tz: [1.4, -1.6, -0.9, -4.2, -4.2],
  fov: [36, 50, 40, 36, 40],
}

function Lab() {
  store.renders.sceneLab++
  useSharedEnv(0.7)
  const a = useLabAssets()
  const cam = useRef<THREE.PerspectiveCamera>(null)
  const depositRef = useRef<THREE.InstancedMesh>(null)
  const linesMat = useMemo(() => new THREE.MeshBasicMaterial({ color: '#dfe7f5', transparent: true, opacity: 0, depthWrite: false }), [])
  const target = useMemo(() => new THREE.Vector3(), [])

  useEffect(() => {
    const m = depositRef.current
    if (!m) return
    const o = new THREE.Object3D()
    const plus = new THREE.Color(INK.plus)
    const minus = new THREE.Color(INK.minus)
    a.depositPts.forEach((p, i) => {
      o.position.set(p.x, L.yPlate - 0.035, p.z)
      o.updateMatrix()
      m.setMatrixAt(i, o.matrix)
      m.setColorAt(i, p.plus ? plus : minus)
    })
    m.instanceMatrix.needsUpdate = true
    if (m.instanceColor) m.instanceColor.needsUpdate = true
    m.count = 0
  }, [a])

  useEffect(
    () => () => {
      a.atoms.mat.dispose()
      a.atomGeo.dispose()
      a.depositGeo.dispose()
      a.lineGeos.forEach((g) => g.dispose())
      a.knife.dispose()
      a.groove.dispose()
      linesMat.dispose()
    },
    [a, linesMat],
  )

  useFrame((state) => {
    const n = store.sections.lab.beats
    const u = beatPos('lab')
    const t = stageT(u, n)
    const U = a.atoms.uniforms
    U.uTime.value = stageClock(state.clock.elapsedTime)
    U.uReveal.value = smooth(u / 0.8)
    U.uSplit.value = smooth(t - 1)
    linesMat.opacity = 0.85 * smooth((t - 0.4) / 0.6) * (1 - 0.6 * smooth(t - 2))
    if (depositRef.current) depositRef.current.count = Math.round(DEPOSIT * clamp01((u - 2.55) / 1.5))
    const c = cam.current
    if (c) {
      const drift = store.motion ? Math.sin(state.clock.elapsedTime * 0.2) * 0.12 : 0
      c.position.set(keyed(CAM.px, t) + drift, keyed(CAM.py, t), keyed(CAM.pz, t))
      target.set(keyed(CAM.tx, t), keyed(CAM.ty, t), keyed(CAM.tz, t))
      c.lookAt(target)
      fitCamera(c, keyed(CAM.fov, t), 'lab')
    }
  })

  const gizmo = useMemo(() => ({ o: new THREE.Vector3(-1.9, -4.6, -1.05) }), [])
  const anchors = useMemo(
    () => ({
      x: T(gizmo.o.x + 0.95, gizmo.o.y, gizmo.o.z),
      y: T(gizmo.o.x, gizmo.o.y + 0.95, gizmo.o.z),
      z: T(gizmo.o.x, gizmo.o.y, gizmo.o.z + 0.95),
      oven: T(0, -4.2, 0.62),
      magnet: T(0, 0, 2.2),
      plate: T(0, 4.2, 1.35),
    }),
    [gizmo],
  )
  useDomLabels('lab', anchors)

  const steel = <meshStandardMaterial color="#a3acb7" metalness={0.95} roughness={0.26} />
  return (
    <>
      <PerspectiveCamera ref={cam} makeDefault fov={36} near={0.05} far={80} position={[6.4, 3.4, 5.8]} />
      <color attach="background" args={[STAGE_BG.lab]} />
      <fog attach="fog" args={[STAGE_BG.lab, 14, 30]} />
      <hemisphereLight args={['#d6def0', '#1a2130', 0.5]} />
      <directionalLight position={[5, 8, 6]} intensity={2.2} color="#fff6ec" />
      <directionalLight position={[-6, 3, -7]} intensity={1.3} color="#a9bcff" />
      <pointLight position={[0, 0.2, 4.6]} intensity={2.5} distance={4} color="#e8eef8" />

      <group rotation={PHYSICS_TO_THREE}>
        {/* pole pieces: knife-edge (top) over grooved pole (bottom); extruded along the beam (y) */}
        <mesh geometry={a.knife} rotation={[Math.PI / 2, 0, 0]} position={[0, 1.6, 0]}>
          {steel}
        </mesh>
        <mesh geometry={a.groove} rotation={[Math.PI / 2, 0, 0]} position={[0, 1.6, 0]}>
          {steel}
        </mesh>
        {/* yoke: a C-frame closing the magnetic circuit on the −x side */}
        <mesh position={[-1.32, 0, 0]}>
          <boxGeometry args={[0.42, 3.2, 3.9]} />
          <meshStandardMaterial color="#39414f" metalness={0.7} roughness={0.42} />
        </mesh>
        <mesh position={[-0.38, 0, 1.78]}>
          <boxGeometry args={[2.3, 3.2, 0.42]} />
          <meshStandardMaterial color="#39414f" metalness={0.7} roughness={0.42} />
        </mesh>
        <mesh position={[-0.38, 0, -1.78]}>
          <boxGeometry args={[2.3, 3.2, 0.42]} />
          <meshStandardMaterial color="#39414f" metalness={0.7} roughness={0.42} />
        </mesh>
        {/* oven */}
        <mesh position={[0, -4.25, 0]} rotation={[0, 0, 0]}>
          <cylinderGeometry args={[0.36, 0.4, 0.95, 40]} />
          <meshStandardMaterial color="#77818e" metalness={0.85} roughness={0.33} />
        </mesh>
        <mesh position={[0, -3.76, 0]}>
          <cylinderGeometry args={[0.1, 0.1, 0.02, 24]} />
          <meshStandardMaterial color="#10141c" emissive="#e8eef8" emissiveIntensity={1.6} />
        </mesh>
        {/* collimating slit */}
        {[
          [0, 0.33, 0.62, 0.5],
          [0, -0.33, 0.62, 0.5],
        ].map(([x, z, w, h], i) => (
          <mesh key={i} position={[x, L.ySlit, z]}>
            <boxGeometry args={[w * 2, 0.04, h]} />
            <meshStandardMaterial color="#5f6875" metalness={0.8} roughness={0.35} />
          </mesh>
        ))}
        {/* detector plate (glass) with a steel frame */}
        <mesh position={[0, L.yPlate, 0]}>
          <boxGeometry args={[2.3, 0.04, 2.3]} />
          <meshStandardMaterial color="#cfd9e3" metalness={0} roughness={0.08} transparent opacity={0.16} depthWrite={false} />
        </mesh>
        {[
          [0, 1.19, 2.46, 0.08],
          [0, -1.19, 2.46, 0.08],
          [1.19, 0, 0.08, 2.46],
          [-1.19, 0, 0.08, 2.46],
        ].map(([x, z, w, h], i) => (
          <mesh key={i} position={[x, L.yPlate, z]}>
            <boxGeometry args={[w, 0.07, h]} />
            <meshStandardMaterial color="#8d97a4" metalness={0.9} roughness={0.3} />
          </mesh>
        ))}
        <instancedMesh ref={depositRef} args={[a.depositGeo, undefined, DEPOSIT]} frustumCulled={false}>
          <meshBasicMaterial />
        </instancedMesh>
        {/* optical bench */}
        <mesh position={[0, 0, -1.72]}>
          <boxGeometry args={[0.5, 10.4, 0.16]} />
          <meshStandardMaterial color="#262d39" metalness={0.6} roughness={0.5} />
        </mesh>
        <mesh position={[0, 0, -1.95]}>
          <boxGeometry args={[14, 22, 0.1]} />
          <meshStandardMaterial color="#121824" metalness={0.2} roughness={0.85} />
        </mesh>
        {/* field lines (qualitative) */}
        {a.lineGeos.map((g, i) => (
          <mesh key={i} geometry={g} material={linesMat} />
        ))}
        {/* atoms */}
        <instancedMesh args={[a.atomGeo, a.atoms.mat, ATOMS]} frustumCulled={false} />
        {/* axis gizmo */}
        {(
          [
            [[1, 0, 0], [0, 0, -Math.PI / 2]],
            [[0, 1, 0], [0, 0, 0]],
            [[0, 0, 1], [Math.PI / 2, 0, 0]],
          ] as [number[], [number, number, number]][]
        ).map(([d, rot], i) => (
          <mesh key={i} position={[gizmo.o.x + d[0] * 0.4, gizmo.o.y + d[1] * 0.4, gizmo.o.z + d[2] * 0.4]} rotation={rot}>
            <cylinderGeometry args={[0.012, 0.012, 0.8, 8]} />
            <meshBasicMaterial color="#c9d2de" />
          </mesh>
        ))}
      </group>
    </>
  )
}

export const LabScene = memo(Lab)
