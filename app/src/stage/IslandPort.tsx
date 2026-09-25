/**
 * Host side of widget islands (W-L1 §2.9). One r3f portal per registered island: its content goes into a
 * THREE.Scene with the island's own camera (+ OrbitControls on the widget's div), and the ViewRenderer
 * draws it scissored to the div's rect, cleared transparent (the widget sits on paper, not the stage).
 * Portal state carries the island's size, so drei helpers (Line resolution) measure the right viewport.
 * Imports three: host chunk only.
 */
import { createPortal, useFrame } from '@react-three/fiber'
import { useEffect, useMemo, useState } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { IslandBoundary } from '../ui/ErrorBoundary'
import { useIslands, type IslandSpec } from './islands'

export interface HostIsland {
  key: string
  el: HTMLElement
  scene: THREE.Scene
  camera: THREE.PerspectiveCamera
  anchors: IslandSpec['anchors']
  renders: number
}
const hostIslands = new Map<string, HostIsland>()
/** Islands with a mounted portal (ViewRenderer draws them). */
export function getHostIslands(): Iterable<HostIsland> {
  return hostIslands.values()
}
export function hostIslandCount(): number {
  return hostIslands.size
}

function IslandView({ spec }: { spec: IslandSpec }) {
  const [scene] = useState(() => new THREE.Scene())
  const camera = useMemo(() => {
    const c = new THREE.PerspectiveCamera(spec.camera.fov, 1, 0.05, 100)
    c.position.set(...spec.camera.position)
    c.lookAt(0, 0, 0)
    return c
    // the camera is created once per island; later prop changes do not reset the reader's orbit
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spec.key])
  const [size, setSize] = useState({ width: spec.el.clientWidth || 300, height: spec.el.clientHeight || 300, top: 0, left: 0 })

  useEffect(() => {
    const ro = new ResizeObserver(() => setSize({ width: spec.el.clientWidth, height: spec.el.clientHeight, top: 0, left: 0 }))
    ro.observe(spec.el)
    return () => ro.disconnect()
  }, [spec.el])

  const controls = useMemo(() => {
    if (!spec.orbit) return null
    const c = new OrbitControls(camera, spec.el)
    c.enablePan = false
    c.enableZoom = false
    return c
  }, [camera, spec.el, spec.orbit])
  useEffect(() => () => controls?.dispose(), [controls])
  useFrame(() => controls?.update(), -50)

  useEffect(() => {
    const entry: HostIsland = { key: spec.key, el: spec.el, scene, camera, anchors: spec.anchors, renders: 0 }
    hostIslands.set(spec.key, entry)
    return () => {
      if (hostIslands.get(spec.key) === entry) hostIslands.delete(spec.key)
    }
  }, [spec.key, spec.el, spec.anchors, scene, camera])

  return createPortal(
    <IslandBoundary name="widget" fallback={null}>
      {spec.content}
    </IslandBoundary>,
    scene,
    { events: { enabled: false }, camera, size },
  )
}

export function IslandPort() {
  const islands = useIslands()
  return (
    <>
      {islands.map((s) => (
        <IslandView key={s.key} spec={s} />
      ))}
    </>
  )
}

const v = new THREE.Vector3()
/** Priority 500: move each island's DOM labels to their projected anchors (transforms only). */
export function IslandLabels() {
  useFrame(() => {
    for (const isl of hostIslands.values()) {
      const w = isl.el.clientWidth
      const h = isl.el.clientHeight
      isl.el.querySelectorAll<HTMLElement>('[data-island-label]').forEach((lab) => {
        const a = isl.anchors[lab.dataset.islandLabel ?? '']
        if (!a) return
        v.set(a[0], a[1], a[2]).project(isl.camera)
        const visible = v.z < 1 && Math.abs(v.x) <= 1 && Math.abs(v.y) <= 1
        lab.style.opacity = visible ? '' : '0'
        if (visible) lab.style.transform = `translate(${(((v.x + 1) / 2) * w).toFixed(1)}px, ${(((1 - v.y) / 2) * h).toFixed(1)}px) translate(-50%, -50%)`
      })
    }
  }, 500)
  return null
}
