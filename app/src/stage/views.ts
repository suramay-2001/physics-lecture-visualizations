/**
 * Host-side view registry (W-L1 §2.3). Imports three.js: only the lazy host chunk (StageHost, StagePort,
 * hooks, scenes) may import this file. The DOM side registers three-free `ViewSpec`s in stage/store.ts;
 * this module turns each spec into a `ViewEntry` with its own THREE.Scene (the portal root, created once).
 *
 * Visibility is decided in the frame loop, never through React state: the Driver (priority −100) writes
 * rect/weight/frame, and the ViewRenderer (priority 1) draws every entry with weight > 0 whose pixels meet
 * the viewport. This fixes the gate's 1–2 frame entry flash (drei <View> used React state).
 */
import { useSyncExternalStore } from 'react'
import * as THREE from 'three'
import type { StageKind } from '../content/stage'
import type { Rect } from './drive'
import { onViewsChange, stage, type ViewSpec } from './store'
import { STAGE_BG } from './tokens'
import type { StageFrame } from './types'

export interface ViewEntry {
  /** `${unitId}/${kind}` */
  readonly key: string
  readonly unitId: string
  readonly kind: StageKind
  /** Portal root, created once per entry. */
  readonly scene: THREE.Scene
  /** Set by the scene (useStageCamera); `fallbackCamera` until then. */
  camera: THREE.Camera | null
  readonly fallbackCamera: THREE.PerspectiveCamera
  /** Rect in CSS px within the unit's stage box, this frame. */
  rect: Rect
  /** Viewport rect (CSS px, top-left origin) this frame, or null when off screen / weight 0. */
  screen: Rect | null
  /** 0…1 presence; 0 ⇒ not rendered, scene callbacks skipped. */
  weight: number
  /** Clear colour = STAGE_BG[kind] (inset views use the inset token); same as the DOM backing. */
  readonly clear: THREE.Color
  /** Written by the Driver each frame. */
  frame: StageFrame<StageKind> | null
  /** A scene error forced this view off (IslandBoundary 'scene'). */
  failed: boolean
  renders: number
  /** CSS px size of the view's current slot, injected into its portal state (drei helpers measure it). */
  portalSize: { width: number; height: number }
  /** `gl.compile` warm-ups done after the scene mounted (W1: one per mount). */
  warmups: number
}

const entries = new Map<string, ViewEntry>()

function makeEntry(spec: ViewSpec): ViewEntry {
  const cam = new THREE.PerspectiveCamera(40, 1, 0.05, 200)
  cam.position.set(6, 4, 8)
  cam.lookAt(0, 0, 0)
  const scene = new THREE.Scene()
  scene.name = `view:${spec.key}`
  return {
    key: spec.key,
    unitId: spec.unitId,
    kind: spec.kind,
    scene,
    camera: null,
    fallbackCamera: cam,
    rect: [0, 0, 0, 0],
    screen: null,
    weight: 0,
    clear: new THREE.Color(STAGE_BG[spec.kind]),
    frame: null,
    failed: false,
    renders: 0,
    portalSize: { width: 0, height: 0 },
    warmups: 0,
  }
}

/* Per-view portal size: changes on slot change or stage resize only (not during a transition's lerp). */
const sizeListeners = new Map<string, Set<() => void>>()
export function setPortalSize(v: ViewEntry, width: number, height: number): void {
  const w = Math.round(width)
  const h = Math.round(height)
  if (v.portalSize.width === w && v.portalSize.height === h) return
  v.portalSize = { width: w, height: h }
  sizeListeners.get(v.key)?.forEach((fn) => fn())
}
export function usePortalSize(v: ViewEntry): { width: number; height: number } {
  return useSyncExternalStore(
    (fn) => {
      let set = sizeListeners.get(v.key)
      if (!set) sizeListeners.set(v.key, (set = new Set()))
      set.add(fn)
      return () => {
        set.delete(fn)
        if (!set.size) sizeListeners.delete(v.key)
      }
    },
    () => v.portalSize,
    () => v.portalSize,
  )
}

let snapshot: readonly ViewEntry[] = []
function rebuild() {
  for (const key of [...entries.keys()]) if (!stage.views.has(key)) entries.delete(key)
  for (const spec of stage.views.values()) if (!entries.has(spec.key)) entries.set(spec.key, makeEntry(spec))
  snapshot = [...entries.values()]
}
rebuild()
onViewsChange(rebuild)

/** Current entries (stable array between registrations). */
export function getViews(): readonly ViewEntry[] {
  return snapshot
}

export function getView(key: string): ViewEntry | undefined {
  return entries.get(key)
}

/** StagePort only: re-renders when a view is registered or unregistered (off-screen events, not per frame). */
export function useViews(): readonly ViewEntry[] {
  return useSyncExternalStore(onViewsChange, getViews, getViews)
}
