import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useMemo } from 'react'
import * as THREE from 'three'
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js'
import { store, type StageId } from '../store'

/** physics (x, y, z) with z up → three.js (x, y, z) with y up; same map as widgets/BlochSphere (det = +1). */
export const T = (x: number, y: number, z: number) => new THREE.Vector3(x, z, -y)

/** A group rotation that applies T to everything authored inside it in physics coordinates. */
export const PHYSICS_TO_THREE: [number, number, number] = [-Math.PI / 2, 0, 0]

export const clamp01 = (x: number) => Math.min(1, Math.max(0, x))
export const smooth = (x: number) => {
  const t = clamp01(x)
  return t * t * (3 - 2 * t)
}
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t

/**
 * Beat position u ∈ [0, n] → keyframe time t ∈ [0, n − 1]. Each beat holds its keyframe while its text
 * is read; the change to the next keyframe happens in a window of ±0.35 beat around the boundary.
 */
export function stageT(u: number, n: number) {
  const w = 0.35
  const kb = Math.round(u)
  if (kb >= 1 && kb <= n - 1 && Math.abs(u - kb) < w) return kb - 1 + smooth((u - (kb - w)) / (2 * w))
  return Math.min(n - 1, Math.max(0, Math.floor(u)))
}

/** Interpolate an array of keyframe values at keyframe time t. */
export function keyed(values: number[], t: number) {
  const i = Math.min(values.length - 1, Math.max(0, Math.floor(t)))
  const j = Math.min(values.length - 1, i + 1)
  return lerp(values[i], values[j], t - i)
}

export function beatPos(id: StageId) {
  const s = store.sections[id]
  return s.progress * s.beats
}

export function stageClock(elapsed: number) {
  return store.motion ? elapsed : 4.0
}

/** Stage backgrounds: CIE L* ≈ 11–13 (HSL lightness ≈ 12–14 %). */
export const STAGE_BG: Record<string, string> = {
  lab: '#182030',
  hopf: '#161d2c',
  'hopf-mini': '#1d2536',
  bloch: '#1a2131',
}

export const INK = {
  plus: '#f0a93a', // amber = + outcome (reserved)
  minus: '#7f95ff', // cobalt = − outcome (reserved)
  state: '#f4f6fa', // near-white = the state
  silver: '#9aa5b4', // structure
}

/** One PMREM environment (RoomEnvironment, no network) shared by every view on the canvas. */
export function useSharedEnv(intensity = 1) {
  const gl = useThree((s) => s.gl)
  const scene = useThree((s) => s.scene)
  useEffect(() => {
    if (!store.env) {
      const pmrem = new THREE.PMREMGenerator(gl)
      const room = new RoomEnvironment()
      store.env = pmrem.fromScene(room, 0.04).texture
      room.traverse((o) => {
        const m = o as THREE.Mesh
        m.geometry?.dispose()
        const mat = m.material as THREE.Material | THREE.Material[] | undefined
        if (Array.isArray(mat)) mat.forEach((x) => x.dispose())
        else mat?.dispose()
      })
      pmrem.dispose()
    }
    scene.environment = store.env
    scene.environmentIntensity = intensity
    return () => {
      scene.environment = null
    }
  }, [gl, scene, intensity])
}

/**
 * DOM axis labels: project 3D anchors with this view's camera and move the label elements
 * (registered in store.dom as `${stage}:${key}`). Runs after the views have rendered (priority 500)
 * so the style writes never force a layout inside the frame.
 */
export function useDomLabels(stage: string, anchors: Record<string, THREE.Vector3>, root?: React.RefObject<THREE.Object3D | null>) {
  const v = useMemo(() => new THREE.Vector3(), [])
  useFrame((state) => {
    const size = store.stageSize[stage]
    if (!size) return
    const cam = state.camera
    for (const key in anchors) {
      const el = store.dom.get(`${stage}:${key}`)
      if (!el) continue
      v.copy(anchors[key])
      if (root?.current) v.applyMatrix4(root.current.matrixWorld)
      v.project(cam)
      const visible = v.z < 1 && Math.abs(v.x) < 0.94 && Math.abs(v.y) < 0.92
      const x = ((v.x + 1) / 2) * size.w
      const y = ((1 - v.y) / 2) * size.h
      const hidden = visible ? '0' : '1'
      if (el.dataset.hidden !== hidden) {
        el.dataset.hidden = hidden
        el.style.opacity = visible ? '1' : '0'
      }
      if (visible) el.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) translate(-50%, -50%)`
    }
  }, 500)
}

/**
 * Keep the horizontal field of view of a design aspect when the stage is narrower (portrait stages
 * would otherwise crop the sides): widen the vertical fov instead.
 */
export function fitCamera(cam: THREE.PerspectiveCamera, fovV: number, stage: string, designAspect = 1.25) {
  const size = store.stageSize[stage]
  const aspect = size && size.h > 0 ? size.w / size.h : designAspect
  const f = aspect < designAspect ? (2 * Math.atan((Math.tan((fovV * Math.PI) / 360) * designAspect) / aspect) * 180) / Math.PI : fovV
  if (Math.abs(cam.fov - f) > 1e-3) {
    cam.fov = f
    cam.updateProjectionMatrix()
  }
}

/** Write a live text readout into a DOM node without React. */
export function writeText(key: string, text: string) {
  const el = store.dom.get(key)
  if (el && el.textContent !== text) el.textContent = text
}
