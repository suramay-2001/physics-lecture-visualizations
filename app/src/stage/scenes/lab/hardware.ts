/**
 * Blender-built bench hardware (pipeline/blender/lab_assets.py → public/models/lab.glb; decisions P3 #1–#3).
 *
 * GEOMETRY ONLY: every part keeps the rig's own material, so no colour can arrive inside a GLB (the reserved
 * encodings stay code-owned). The file is exported with +Y up OFF: its coordinates are already the physics
 * axes the rig is authored in, so a part drops into place with its node matrix and nothing else. The pole
 * pieces are not in it (ruling #2): they stay exact and morphable in geometry.ts.
 *
 * Loaded once per session and shared by every rig (registered in `sharedGeometry`, so disposeLabRig leaves it
 * alone). A missing or unreadable file resolves to null and the procedural stand-ins simply stay: the lab
 * never waits for, or fails on, decoration.
 */
import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { sharedGeometry, type LabRig } from './rig'

export const HARDWARE_PARTS = ['sg_yoke', 'sg_coils', 'sg_axis_mount', 'oven', 'slit', 'plate_frame', 'beam_stop', 'bench_rail'] as const
export type HardwarePart = (typeof HARDWARE_PARTS)[number]
export type Hardware = Record<HardwarePart, THREE.BufferGeometry>

const isPart = (name: string): name is HardwarePart => (HARDWARE_PARTS as readonly string[]).includes(name)

/** Pull the named parts out of a parsed glTF scene, node transforms baked in. Null if any part is missing. */
export function extractHardware(root: THREE.Object3D): Hardware | null {
  root.updateMatrixWorld(true)
  const out: Partial<Hardware> = {}
  root.traverse((o) => {
    const m = o as THREE.Mesh
    if (!m.isMesh || !isPart(m.name)) return
    const g = m.geometry.clone().applyMatrix4(m.matrixWorld)
    g.computeBoundingSphere()
    out[m.name] = g
  })
  return HARDWARE_PARTS.every((p) => out[p]) ? (out as Hardware) : null
}

export const HARDWARE_URL = `${import.meta.env.BASE_URL}models/lab.glb`

let pending: Promise<Hardware | null> | null = null

export function loadHardware(url = HARDWARE_URL): Promise<Hardware | null> {
  pending ??= new GLTFLoader().loadAsync(url).then(
    (gltf) => {
      const hw = extractHardware(gltf.scene)
      if (hw) for (const g of Object.values(hw)) sharedGeometry.add(g)
      return hw
    },
    () => null,
  )
  return pending
}

/** Swap the procedural stand-ins for the Blender parts, in place (materials, matrices and fades untouched). */
export function applyHardware(rig: LabRig, hw: Hardware): void {
  if (rig.hardware) return
  const swap = (mesh: THREE.Mesh, g: THREE.BufferGeometry) => {
    // placeholders (empty, never drawn) are disposed; procedural geometry belongs to rig.geo and stays
    if (!Object.values(rig.geo).includes(mesh.geometry)) mesh.geometry.dispose()
    mesh.geometry = g
  }
  for (const br of rig.benches) {
    for (const mr of [br.prep, ...br.modules]) {
      swap(mr.yoke, hw.sg_yoke)
      swap(mr.coils, hw.sg_coils)
      swap(mr.mount, hw.sg_axis_mount)
      mr.coils.visible = mr.mount.visible = true
    }
    swap(br.ovenBody, hw.oven)
    for (const j of br.slitJaws) j.visible = false
    swap(br.slitHw, hw.slit)
    br.slitHw.visible = true
    for (const pr of [br.plate, br.ghost]) swap(pr.frame, hw.plate_frame)
    for (const sr of [br.prepStop, ...br.stops]) {
      swap(sr.block, hw.beam_stop)
      sr.stem.visible = false
    }
    swap(br.rail, hw.bench_rail)
  }
  rig.hardware = true
}
