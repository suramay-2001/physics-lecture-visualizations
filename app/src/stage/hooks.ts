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
import { INSET } from './drive'
import { LABEL_EDGE, TIER_PRIORITY, overlayReservedRects, placeItem, type LabelRect } from './labelLayout'
import { labelKey, publishLabels, stage, type StageLabel } from './store'
import type { StageFrame } from './types'
import { getViews, type ViewEntry } from './views'

export { labelKey, writeReadout, type StageLabel } from './store'
export type { LabelRect } from './labelLayout'

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

/** One anchored label of a view, with its choreography (D §6.1; the item type of D's `useSceneLabels`). */
export interface LabelItem {
  /** Anchor in the local frame of `root` (or world), or view px when `screen` is set. */
  anchor: THREE.Vector3
  /** 0 = hidden; fractional = fading (scene choreography). */
  alpha: number
  /** Lower = placed first. Gizmo 0 · callouts/chips 1 · spot labels 2 · axis/fraction labels 3. */
  priority: number
  /** Anchor is already in view px (x, y); z ignored. */
  screen?: boolean
  /** Never moved off its anchor (gizmo tips) except along `slide`: hidden when every spot collides. */
  fixed?: boolean
  /** Unit screen direction a fixed label may slide along to avoid a collision. */
  slide?: [number, number]
  /** Draw a leader from the label to this view-px point (gizmo axes), whatever the offset. */
  leaderTo?: [number, number] | null
  /** Draw a leader to this 3D point (same frame as `anchor`), e.g. a state chip → its beam. */
  leaderAnchor?: THREE.Vector3 | null
  /** Highlight (term focus): outline via CSS. */
  focus?: boolean
  /** Visual variant written once as data-look (overlay.css): badge · window · gizmo. */
  look?: 'badge' | 'window' | 'gizmo'
}
/** A bare vector anchors a label at full alpha, placed by its published tier (callout/chip before axis). */
export type DomLabelAnchor = THREE.Vector3 | LabelItem
const isVector = (a: DomLabelAnchor): a is THREE.Vector3 => (a as THREE.Vector3).isVector3 === true

/**
 * Reserved rects (stage-box px) around a unit's stage box: the overlay furniture (labelLayout.ts
 * `overlayReservedRects`) plus any view of the unit that sits in the inset slot. A layout read.
 */
export function domReservedRects(box: HTMLElement | null, unitId?: string): LabelRect[] {
  if (!box) return []
  const out = overlayReservedRects(box)
  if (unitId)
    for (const o of getViews())
      if (o.unitId === unitId && o.weight > 0 && o.frame?.slot === 'inset') out.push([o.rect[0], o.rect[1], o.rect[2], o.rect[3]])
  return out
}

interface LabelCache {
  size: Map<string, [number, number]>
  ro: ResizeObserver | null
  observed: WeakSet<Element>
  reserved: LabelRect[]
  frame: number
  beat: number
  /** Frames of frequent re-reads left after a beat/reveal/slot change. */
  burst: number
}

/**
 * Move this view's anchored DOM labels: the label layout pass (D §6.1; stage/labelLayout.ts), priority 500
 * after rendering, transforms only, no per-frame layout reads. Interface change D1: this IS D's
 * `useSceneLabels(items, root, extraReserved)` from stage/scenes/labels.ts, folded in; the same call works here.
 *
 * `anchors`: per label name, a `LabelItem` (a mutable record the scene updates in its `useStageFrame`
 * callback) or a bare vector (full alpha, priority by tier). Anchors are in the local frame of `root` (or world).
 * `extraReserved` returns view-px rects the scene keeps clear (the gizmo).
 *
 * Writes on each label node: `data-hidden`, opacity (alpha or 0), `data-focus`, transform, `data-leader` and
 * `--lead-len / --lead-start / --lead-ang` (overlay.css draws the leader), once `data-label-name` / `data-look`.
 */
export function useDomLabels(
  anchors: Readonly<Record<string, DomLabelAnchor>>,
  root?: RefObject<THREE.Object3D | null>,
  extraReserved?: () => LabelRect[],
): void {
  const view = useView()
  const cache = useMemo<LabelCache>(() => ({ size: new Map(), ro: null, observed: new WeakSet(), reserved: [], frame: 0, beat: -1, burst: 0 }), [])
  useEffect(() => {
    if (typeof ResizeObserver === 'undefined') return
    const ro = new ResizeObserver((entries) => {
      for (const e of entries) {
        const el = e.target as HTMLElement
        const name = el.dataset.labelName
        const b = e.borderBoxSize?.[0]
        if (name) cache.size.set(name, b ? [b.inlineSize, b.blockSize] : [el.offsetWidth, el.offsetHeight])
      }
    })
    cache.ro = ro
    return () => {
      ro.disconnect()
      cache.ro = null
      cache.observed = new WeakSet()
    }
  }, [cache])

  const v = useMemo(() => new THREE.Vector3(), [])
  // items only: the order is fixed by their priorities (as in D's pass); bare vectors sort by tier each frame
  const order = useMemo(
    () => (Object.values(anchors).some(isVector) ? null : Object.keys(anchors).sort((a, b) => (anchors[a] as LabelItem).priority - (anchors[b] as LabelItem).priority)),
    [anchors],
  )

  useFrame(() => {
    const cam = view.camera ?? view.fallbackCamera
    const [rx, ry, rw, rh] = view.rect
    const track = stage.units.get(view.unitId)
    const box = track?.box ?? null
    const f = view.frame
    const itemOf = (name: string, el: HTMLElement): LabelItem => {
      const a = anchors[name]
      return isVector(a) ? { anchor: a, alpha: 1, priority: TIER_PRIORITY[el.dataset.tier ?? 'axis'] ?? 3 } : a
    }
    const names =
      order ??
      Object.keys(anchors).sort((a, b) => {
        const pa = isVector(anchors[a]) ? (TIER_PRIORITY[stage.dom.get(labelKey(view.key, a))?.dataset.tier ?? 'axis'] ?? 3) : (anchors[a] as LabelItem).priority
        const pb = isVector(anchors[b]) ? (TIER_PRIORITY[stage.dom.get(labelKey(view.key, b))?.dataset.tier ?? 'axis'] ?? 3) : (anchors[b] as LabelItem).priority
        return pa - pb
      })
    // re-read the furniture on a beat change, a reveal (the layout may split) or a slot change, else every 20 frames
    const sig = f ? f.beat * 16 + (f.revealed ? 8 : 0) + ['full', 'top', 'bottom', 'main', 'inset'].indexOf(f.slot ?? 'full') : -1
    // React re-renders the caption/passports a little AFTER the beat changes: re-read every 3rd frame for a
    // while after a change, then every 20 frames
    if (sig !== cache.beat) {
      cache.beat = sig
      cache.burst = 30
    }
    if (cache.burst > 0) cache.burst--
    if (cache.frame++ % 20 === 0 || (cache.burst > 0 && cache.frame % 3 === 0)) cache.reserved = domReservedRects(box)
    const reserved = cache.reserved.slice()
    const extra: LabelRect[] = extraReserved ? extraReserved().map((r): LabelRect => [rx + r[0], ry + r[1], r[2], r[3]]) : []
    // an inset view (another kind of this unit) and its title strip are reserved for the main view
    if (f?.slot !== 'inset')
      for (const o of getViews())
        if (o !== view && o.unitId === view.unitId && o.weight > 0 && o.frame?.slot === 'inset')
          reserved.push([o.rect[0], o.rect[1] - INSET.strip, o.rect[2], o.rect[3] + INSET.strip])
    const placed: LabelRect[] = []
    const safe: LabelRect = [rx + LABEL_EDGE, ry + LABEL_EDGE, rw - 2 * LABEL_EDGE, rh - 2 * LABEL_EDGE]
    for (const name of names) {
      const el = stage.dom.get(labelKey(view.key, name))
      if (!el) continue
      const it = itemOf(name, el)
      if (!cache.observed.has(el) && cache.ro) {
        el.dataset.labelName = name
        if (it.look) el.dataset.look = it.look
        cache.ro.observe(el)
        cache.observed.add(el)
        cache.size.set(name, [el.offsetWidth, el.offsetHeight])
      }
      let show = view.weight > 0 && it.alpha > 0.01
      let x = 0
      let y = 0
      if (show) {
        if (it.screen) {
          x = rx + it.anchor.x
          y = ry + it.anchor.y
        } else {
          v.copy(it.anchor)
          if (root?.current) v.applyMatrix4(root.current.matrixWorld)
          v.project(cam)
          if (v.z >= 1 || v.z <= -1 || Math.abs(v.x) > 1.02 || Math.abs(v.y) > 1.02) show = false
          x = rx + ((v.x + 1) / 2) * rw
          y = ry + ((1 - v.y) / 2) * rh
        }
      }
      let ox = 0
      let oy = 0
      if (show) {
        const [w, h] = cache.size.get(name) ?? [el.offsetWidth, el.offsetHeight]
        const spot = placeItem(x, y, w, h, it, safe, reserved, extra, placed)
        if (spot) {
          x = spot.x
          y = spot.y
          ox = spot.ox
          oy = spot.oy
        }
        show = !!spot
      }
      const hidden = show ? '0' : '1'
      if (el.dataset.hidden !== hidden) el.dataset.hidden = hidden
      const op = show ? (it.alpha >= 0.99 ? '' : it.alpha.toFixed(3)) : '0'
      if (el.style.opacity !== op) el.style.opacity = op
      const foc = it.focus ? '1' : '0'
      if (el.dataset.focus !== foc) el.dataset.focus = foc
      if (!show) continue
      el.style.transform = `translate(${(x + ox).toFixed(1)}px, ${(y + oy).toFixed(1)}px) translate(-50%, -50%)`
      // leader: from the label's edge to its anchor (or to leaderTo / leaderAnchor)
      let lt: number[] | null = it.leaderTo ? [rx + it.leaderTo[0], ry + it.leaderTo[1]] : ox || oy ? [x, y] : null
      if (it.leaderAnchor) {
        v.copy(it.leaderAnchor)
        if (root?.current) v.applyMatrix4(root.current.matrixWorld)
        v.project(cam)
        if (v.z < 1) lt = [rx + ((v.x + 1) / 2) * rw, ry + ((1 - v.y) / 2) * rh]
      }
      if (lt) {
        const [w, h] = cache.size.get(name) ?? [0, 0]
        const dx = lt[0] - (x + ox)
        const dy = lt[1] - (y + oy)
        const len = Math.hypot(dx, dy)
        // distance from the label centre to its border along the leader direction
        const ux = Math.abs(dx) / (len || 1)
        const uy = Math.abs(dy) / (len || 1)
        const start = Math.min(ux > 1e-6 ? w / 2 / ux : 1e9, uy > 1e-6 ? h / 2 / uy : 1e9)
        const visible = len - start > 2
        el.dataset.leader = visible ? '1' : '0'
        if (visible) {
          el.style.setProperty('--lead-len', `${(len - start).toFixed(1)}px`)
          el.style.setProperty('--lead-start', `${start.toFixed(1)}px`)
          el.style.setProperty('--lead-ang', `${Math.atan2(dy, dx).toFixed(4)}rad`)
        }
      } else if (el.dataset.leader !== '0') el.dataset.leader = '0'
    }
  }, 500)
}

/** Reset every label of a view to hidden (scene unmount). */
export function hideLabels(viewKey: string, names: readonly string[]): void {
  for (const n of names) {
    const el = stage.dom.get(labelKey(viewKey, n))
    if (el) {
      el.dataset.hidden = '1'
      el.style.opacity = '0'
    }
  }
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
