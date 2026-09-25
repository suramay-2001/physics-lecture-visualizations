/**
 * Scene hooks (W-L1 §2.4; frozen at `l1-freeze`). Scenes (D) are rendered by StagePort inside a portal
 * whose root is their view's THREE.Scene; these hooks give them the per-frame state, a camera slot, DOM
 * labels/readouts and shared resources. Imports three + r3f: only use inside the host chunk.
 *
 * Frame order on the one canvas (r3f useFrame priorities; any positive priority disables r3f's own render):
 *   −1000 clear + stats start (StageHost) · −100 Driver · 0 scenes (`useStageFrame`) · 1 ViewRenderer ·
 *   500 DOM label projection (`useDomLabels`) · 1000 stats end.
 */
import { useFrame, useThree } from '@react-three/fiber'
import { createContext, useContext, useEffect, useMemo, useRef, type RefObject } from 'react'
import * as THREE from 'three'
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js'
import type { StageKind } from '../content/stage'
import { labelKey, publishLabels, stage, type StageLabel } from './store'
import type { StageFrame } from './types'
import type { ViewEntry } from './views'

export { labelKey, writeReadout, type StageLabel } from './store'

/** physics (x, y, z) with z up → three.js (x, z, −y) with y up; det = +1 (same map as widgets/BlochSphere). */
export const physToThree = (x: number, y: number, z: number): THREE.Vector3 => new THREE.Vector3(x, z, -y)
/** A group rotation that applies physToThree to everything authored inside it in physics coordinates. */
export const PHYSICS_TO_THREE: [number, number, number] = [-Math.PI / 2, 0, 0]

/** D §1.6: lenses are specified by HORIZONTAL fov; three's PerspectiveCamera.fov is vertical. */
export function hfovToVfov(hfovDeg: number, aspect: number): number {
  const h = (hfovDeg * Math.PI) / 180
  return (2 * Math.atan(Math.tan(h / 2) / Math.max(1e-6, aspect)) * 180) / Math.PI
}

/* ------------------------------------------------------------------------------------------------ */

export const ViewContext = createContext<ViewEntry | null>(null)

/** The view this scene renders into (provided by StagePort). */
export function useView(): ViewEntry {
  const v = useContext(ViewContext)
  if (!v) throw new Error('stage hooks must be used inside a StagePort view')
  return v
}

/**
 * Per-frame state for this view (priority 0, after the Driver, before the renderer). Skipped when the view
 * has weight 0 or its unit is not near. Read `f.state`; never decide physics here.
 */
export function useStageFrame<K extends StageKind>(cb: (f: StageFrame<K>) => void): void {
  const view = useView()
  const ref = useRef(cb)
  useEffect(() => {
    ref.current = cb
  })
  useFrame(() => {
    const f = view.frame
    if (!f || view.weight <= 0 || view.failed) return
    ref.current(f as unknown as StageFrame<K>)
  }, 0)
}

/** Register the camera this view renders with (null → the view's fallback camera). */
export function useStageCamera(cam: THREE.Camera | null): void {
  const view = useView()
  useEffect(() => {
    view.camera = cam
    return () => {
      if (view.camera === cam) view.camera = null
    }
  }, [view, cam])
}

/**
 * Publish this view's DOM labels and readouts (the overlay renders them; KaTeX allowed via the trusted
 * renderer). Keys become `labelKey(view.key, name)`: use them with `useDomLabels` anchors and `writeReadout`.
 */
export function useStageLabels(labels: Readonly<Record<string, StageLabel>>): void {
  const view = useView()
  const json = JSON.stringify(labels)
  useEffect(() => {
    publishLabels(view.key, JSON.parse(json) as Record<string, StageLabel>)
    return () => publishLabels(view.key, {})
  }, [view.key, json])
}

/** Full overlay key of one of this view's labels (for writeReadout). */
export function useLabelKey(name: string): string {
  return labelKey(useView().key, name)
}

/**
 * Move this view's anchored DOM labels (priority 500, after rendering; transforms only, no layout reads).
 * `anchors` are in the local frame of `root` (or world space). Labels outside the view are faded out.
 * W0 culls like the gate; the collision-avoiding layout pass (D §6.1) lands here later without an API change.
 */
export function useDomLabels(anchors: Readonly<Record<string, THREE.Vector3>>, root?: RefObject<THREE.Object3D | null>): void {
  const view = useView()
  const v = useMemo(() => new THREE.Vector3(), [])
  useFrame(() => {
    const cam = view.camera ?? view.fallbackCamera
    const [rx, ry, rw, rh] = view.rect
    for (const name in anchors) {
      const el = stage.dom.get(labelKey(view.key, name))
      if (!el) continue
      v.copy(anchors[name])
      if (root?.current) v.applyMatrix4(root.current.matrixWorld)
      v.project(cam)
      const visible = view.weight > 0 && v.z < 1 && Math.abs(v.x) < 0.94 && Math.abs(v.y) < 0.92
      const hidden = visible ? '0' : '1'
      if (el.dataset.hidden !== hidden) {
        el.dataset.hidden = hidden
        el.style.opacity = visible ? '' : '0'
      }
      if (visible) {
        const x = rx + ((v.x + 1) / 2) * rw
        const y = ry + ((1 - v.y) / 2) * rh
        el.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) translate(-50%, -50%)`
      }
    }
  }, 500)
}

/* ------------------------------------------------------------------------------------------------ */
/* Shared resources                                                                                  */
/* ------------------------------------------------------------------------------------------------ */

interface Resource {
  value: unknown
  refs: number
  dispose: (v: unknown) => void
  timer: ReturnType<typeof setTimeout> | null
}
const resources = new Map<string, Resource>()
/** Grace period before an unused resource is disposed (absorbs StrictMode remounts and quick revisits). */
export const RESOURCE_GRACE_MS = 30_000

function scheduleDispose(id: string, r: Resource) {
  if (r.timer) clearTimeout(r.timer)
  r.timer = setTimeout(() => {
    if (r.refs > 0) return
    resources.delete(id)
    r.dispose(r.value)
  }, RESOURCE_GRACE_MS)
}

/**
 * Geometry/materials shared by every view of one kind (e.g. the lab's pole meshes), ref-counted and
 * disposed 30 s after the last user unmounts. `build` runs once per (kind, key) while alive.
 */
export function useKindResources<T>(kind: StageKind, key: string, build: () => T, dispose: (v: T) => void): T {
  const id = `${kind}:${key}`
  let r = resources.get(id)
  if (!r) {
    r = { value: build(), refs: 0, dispose: dispose as (v: unknown) => void, timer: null }
    resources.set(id, r)
    scheduleDispose(id, r) // built but never mounted → still cleaned up
  }
  const value = r.value as T
  useEffect(() => {
    const res = resources.get(id)
    if (!res) return
    res.refs++
    if (res.timer) {
      clearTimeout(res.timer)
      res.timer = null
    }
    return () => {
      res.refs--
      if (res.refs <= 0) scheduleDispose(id, res)
    }
  }, [id])
  return value
}

const envs = new WeakMap<THREE.WebGLRenderer, THREE.Texture>()
/** One PMREM RoomEnvironment for the whole canvas (no network, gate-proven), applied to this view's scene. */
export function useSharedEnv(intensity = 1): void {
  const view = useView()
  const gl = useThree((s) => s.gl)
  useEffect(() => {
    let env = envs.get(gl)
    if (!env) {
      const pmrem = new THREE.PMREMGenerator(gl)
      const room = new RoomEnvironment()
      env = pmrem.fromScene(room, 0.04).texture
      room.traverse((o) => {
        const m = o as THREE.Mesh
        m.geometry?.dispose()
        const mat = m.material as THREE.Material | THREE.Material[] | undefined
        if (Array.isArray(mat)) mat.forEach((x) => x.dispose())
        else mat?.dispose()
      })
      pmrem.dispose()
      envs.set(gl, env)
    }
    view.scene.environment = env
    view.scene.environmentIntensity = intensity
    return () => {
      if (view.scene.environment === env) view.scene.environment = null
    }
  }, [gl, view, intensity])
}
