import { PerspectiveCamera } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { memo, useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { purity, rOfBeat, recipeWeights } from '../ball'
import { store } from '../store'
import { INK, STAGE_BG, T, beatPos, fitCamera, keyed, smooth, stageClock, stageT, useDomLabels, useSharedEnv, writeText } from './common'

/* Bloch ball: state space of one qubit, pure states on the surface, mixed states inside. */
const N_THETA = (55 * Math.PI) / 180
const N_PHI = (35 * Math.PI) / 180
const NHAT = T(Math.sin(N_THETA) * Math.cos(N_PHI), Math.sin(N_THETA) * Math.sin(N_PHI), Math.cos(N_THETA)).normalize()
const UP = new THREE.Vector3(0, 1, 0)

/** An arrow from the origin along `dir` with adjustable length (shaft + cone head). */
function Arrow({ dir, color, api, opacity = 1, radius = 0.02 }: { dir: THREE.Vector3; color: string; api: React.RefObject<ArrowApi | null>; opacity?: number; radius?: number }) {
  const shaft = useRef<THREE.Mesh>(null)
  const head = useRef<THREE.Mesh>(null)
  const group = useRef<THREE.Group>(null)
  const mat = useMemo(
    () => new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.25, metalness: 0.2, roughness: 0.3, transparent: opacity < 1, opacity }),
    [color, opacity],
  )
  useEffect(() => () => mat.dispose(), [mat])
  const q = useMemo(() => new THREE.Quaternion().setFromUnitVectors(UP, dir.clone().normalize()), [dir])
  useEffect(() => {
    api.current = {
      set(len: number, alpha = 1) {
        const headLen = Math.min(0.13, len * 0.5)
        const shaftLen = Math.max(1e-4, len - headLen)
        if (shaft.current) {
          shaft.current.scale.set(1, shaftLen, 1)
          shaft.current.position.set(0, shaftLen / 2, 0)
        }
        if (head.current) {
          head.current.scale.set(1, headLen / 0.13, 1)
          head.current.position.set(0, shaftLen + headLen / 2, 0)
        }
        mat.opacity = opacity * alpha
        if (group.current) group.current.visible = len > 0.02 && alpha > 0.01
      },
    }
  }, [api, mat, opacity])
  return (
    <group ref={group} quaternion={q}>
      <mesh ref={shaft} material={mat}>
        <cylinderGeometry args={[radius, radius, 1, 12]} />
      </mesh>
      <mesh ref={head} material={mat}>
        <coneGeometry args={[radius * 2.6, 0.13, 20]} />
      </mesh>
    </group>
  )
}
interface ArrowApi {
  set(len: number, alpha?: number): void
}

function rimMaterial() {
  return new THREE.ShaderMaterial({
    uniforms: { uColor: { value: new THREE.Color('#b9c8ff') }, uStrength: { value: 0.55 } },
    vertexShader: `varying vec3 vN; varying vec3 vV;
void main(){ vec4 mv = modelViewMatrix * vec4(position, 1.0); vN = normalize(normalMatrix * normal); vV = normalize(-mv.xyz); gl_Position = projectionMatrix * mv; }`,
    fragmentShader: `uniform vec3 uColor; uniform float uStrength; varying vec3 vN; varying vec3 vV;
void main(){ float f = pow(1.0 - abs(dot(normalize(vN), normalize(vV))), 2.6) * uStrength; gl_FragColor = vec4(uColor * f, f);
#include <tonemapping_fragment>
#include <colorspace_fragment>
}`,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  })
}

/** Ghost recipe states: ±n̂ (weights w±), then ±x and ±y (weights ½ each) for "many recipes, one ρ". */
const GHOSTS: THREE.Vector3[] = [NHAT, NHAT.clone().negate(), T(1, 0, 0), T(-1, 0, 0), T(0, 1, 0), T(0, -1, 0)]

/** Cylinder (three.js +y) rotations onto the physics x, y, z axes under T. */
const AXIS_ROT: [number, number, number][] = [
  [0, 0, -Math.PI / 2],
  [Math.PI / 2, 0, 0],
  [0, 0, 0],
]

const CAM = { az: [0.75, 0.9, 1.05, 1.15, 1.3], el: [0.36, 0.4, 0.38, 0.34, 0.45], r: [3.9, 3.9, 3.8, 3.7, 4.1] }

function BlochBall() {
  store.renders.sceneBloch++
  useSharedEnv(0.8)
  const cam = useRef<THREE.PerspectiveCamera>(null)
  const stateArrow = useRef<ArrowApi | null>(null)
  const ghostRefs = useMemo(() => GHOSTS.map(() => ({ current: null as ArrowApi | null })), [])
  const point = useRef<THREE.Mesh>(null)
  const rim = useMemo(rimMaterial, [])
  useEffect(() => () => rim.dispose(), [rim])

  useFrame((state) => {
    const n = store.sections.bloch.beats
    const u = beatPos('bloch')
    const t = stageT(u, n)
    const time = stageClock(state.clock.elapsedTime)
    const rmag = rOfBeat(u)
    stateArrow.current?.set(rmag)
    if (point.current) point.current.position.copy(NHAT).multiplyScalar(rmag)
    const [wp, wm] = recipeWeights(rmag)
    const recipeOn = smooth((t - 0.5) / 0.5)
    const manyOn = smooth((t - 3.5) / 0.5)
    ghostRefs.forEach(({ current: g }, i) => {
      if (!g) return
      if (i === 0) g.set(1, recipeOn * (0.25 + 0.6 * wp))
      else if (i === 1) g.set(1, recipeOn * (0.25 + 0.6 * wm))
      else g.set(1, manyOn * 0.55)
    })
    writeText('bloch:readout', `|r|   = ${rmag.toFixed(2)}\nTr ρ² = ${purity(rmag).toFixed(2)}\nw₊ = ${wp.toFixed(2)}  w₋ = ${wm.toFixed(2)}`)
    const c = cam.current
    if (c) {
      const az = keyed(CAM.az, t) + 0.1 * u + (store.motion ? time * 0.03 : 0)
      const el = keyed(CAM.el, t)
      const r = keyed(CAM.r, t)
      c.position.set(r * Math.cos(el) * Math.cos(az), r * Math.sin(el), r * Math.cos(el) * Math.sin(az))
      c.lookAt(0, 0, 0)
      fitCamera(c, 38, 'bloch', 1)
    }
  })

  const anchors = useMemo(() => ({ x: T(1.45, 0, 0), y: T(0, 1.45, 0), z: T(0, 0, 1.4) }), [])
  useDomLabels('bloch', anchors)

  return (
    <>
      <PerspectiveCamera ref={cam} makeDefault fov={38} near={0.05} far={40} position={[3, 1.5, 2]} />
      <color attach="background" args={[STAGE_BG.bloch]} />
      <hemisphereLight args={['#dfe6f5', '#141a26', 0.5]} />
      <directionalLight position={[4, 6, 5]} intensity={2} />
      <directionalLight position={[-5, -2, -4]} intensity={0.9} color="#b8c6ff" />
      {/* the ball */}
      <mesh>
        <sphereGeometry args={[1, 64, 48]} />
        <meshStandardMaterial color="#a7b6cf" transparent opacity={0.09} depthWrite={false} roughness={0.15} metalness={0} />
      </mesh>
      <mesh material={rim} scale={1.002}>
        <sphereGeometry args={[1, 64, 48]} />
      </mesh>
      {[0, 1, 2].map((i) => (
        <mesh key={i} rotation={i === 0 ? [Math.PI / 2, 0, 0] : i === 1 ? [0, 0, 0] : [0, Math.PI / 2, 0]}>
          <torusGeometry args={[1, 0.005, 6, 128]} />
          <meshBasicMaterial color="#7b8698" transparent opacity={i === 0 ? 0.9 : 0.5} />
        </mesh>
      ))}
      {/* axes ⟨σx⟩, ⟨σy⟩, ⟨σz⟩ */}
      {AXIS_ROT.map((rot, i) => (
        <mesh key={i} rotation={rot}>
          <cylinderGeometry args={[0.006, 0.006, 2.6, 8]} />
          <meshBasicMaterial color="#8d98a8" />
        </mesh>
      ))}
      {/* z outcomes: amber = +, cobalt = − (reserved encodings) */}
      <mesh position={T(0, 0, 1)}>
        <sphereGeometry args={[0.045, 16, 12]} />
        <meshStandardMaterial color={INK.plus} emissive={INK.plus} emissiveIntensity={0.4} />
      </mesh>
      <mesh position={T(0, 0, -1)}>
        <sphereGeometry args={[0.045, 16, 12]} />
        <meshStandardMaterial color={INK.minus} emissive={INK.minus} emissiveIntensity={0.4} />
      </mesh>
      {GHOSTS.map((dir, i) => (
        <Arrow key={i} dir={dir} color={INK.silver} opacity={0.9} radius={0.011} api={ghostRefs[i]} />
      ))}
      <Arrow dir={NHAT} color={INK.state} api={stateArrow} radius={0.022} />
      <mesh ref={point}>
        <sphereGeometry args={[0.06, 24, 16]} />
        <meshStandardMaterial color={INK.state} emissive={INK.state} emissiveIntensity={0.9} />
      </mesh>
    </>
  )
}

export const BlochBallScene = memo(BlochBall)
