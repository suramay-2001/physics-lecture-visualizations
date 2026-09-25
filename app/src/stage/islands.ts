/**
 * Widget islands (W-L1 §2.9 "second-context leak"): a 3D widget (today: the Bloch sphere) drawn on the ONE
 * shared canvas instead of its own <Canvas> while the stage host exists. THREE-FREE registry: the DOM side
 * (stage/WidgetIsland.tsx) registers its div, its r3f scene content and its label anchors; the host side
 * (stage/IslandPort.tsx) portals the content into a scene and renders it scissored to the div's rect.
 */
import { useSyncExternalStore, type ReactNode } from 'react'

export type Vec3Tuple = [number, number, number]

export interface IslandSpec {
  key: string
  /** The widget's canvas-sized div: its rect is the viewport; it receives the orbit pointer events. */
  el: HTMLElement
  /** r3f scene content (three.js coordinates, y up). */
  content: ReactNode
  camera: { position: Vec3Tuple; fov: number }
  /** Label anchors (three.js coordinates): the host moves `[data-island-label=name]` children of `el`. */
  anchors: Readonly<Record<string, Vec3Tuple>>
  orbit: boolean
}

const islands = new Map<string, IslandSpec>()
const listeners = new Set<() => void>()
let snapshot: readonly IslandSpec[] = []
function emit() {
  snapshot = [...islands.values()]
  listeners.forEach((fn) => fn())
}

/** Add or replace an island (content changes re-render only that island's portal). */
export function setIsland(spec: IslandSpec): void {
  islands.set(spec.key, spec)
  emit()
}
export function removeIsland(key: string, el?: HTMLElement): void {
  const cur = islands.get(key)
  if (!cur || (el && cur.el !== el)) return
  islands.delete(key)
  emit()
}
export function getIslands(): readonly IslandSpec[] {
  return snapshot
}
export function onIslandsChange(fn: () => void): () => void {
  listeners.add(fn)
  return () => listeners.delete(fn)
}
export function useIslands(): readonly IslandSpec[] {
  return useSyncExternalStore(onIslandsChange, getIslands, getIslands)
}
