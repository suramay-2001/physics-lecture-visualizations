/**
 * Lab shot library (D §4.0): lens · position → target in PHYSICS coordinates, relative to the bench
 * layout (module centres y_m, plate y_p, bench centre y_c). Pure; the scene blends two poses inside a beat
 * window (dolly), or cuts when the lens jumps more than two rows (D §1.6).
 *
 * Split panes (≈ 2:1 landscape) and the inset use a fit distance so the subject is never cropped:
 * dist = max(library distance, R / sin(min(hfov, vfov)/2)). The split rig's end-on shot is 85 mm (D §3.2).
 */
import * as THREE from 'three'
import type { ViewSlot } from '../../../content/stage'
import type { LabShot } from '../../../content/stageVocab'
import { hfovToVfov } from '../../hooks'
import { lensHfov } from '../common'
import type { BenchLayout } from './layout'

export interface Pose {
  pos: THREE.Vector3
  target: THREE.Vector3
  lens: number
}

interface ShotDef {
  lens: number
  /** Subject radius that must stay in frame (u). */
  fit: number
  pose: (b: BenchLayout, m: number) => { pos: THREE.Vector3; target: THREE.Vector3 }
}

const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z)
/** A point expressed relative to module m's centre (x, y along the bench, z) — follows chained benches. */
const at = (b: BenchLayout, m: number, dx: number, dy: number, dz: number) => {
  const c = b.modules[Math.max(0, Math.min(b.modules.length - 1, m))].center
  return V(c.x + dx, c.y + dy, c.z + dz)
}
const plate = (b: BenchLayout, dx: number, dy: number, dz: number) => V(b.plateCenter.x + dx, b.plateCenter.y + dy, b.plateCenter.z + dz)

export const SHOTS: Record<LabShot, ShotDef> = {
  // three-quarter from the oven side
  'L-EST': { lens: 35, fit: 3.2, pose: (b) => ({ pos: at(b, 0, 7.5, -6.1, 4.2), target: at(b, 0, 0, -0.4, -0.3) }) },
  // over the magnet's shoulder at the plate
  'L-OTS': { lens: 50, fit: 2.0, pose: (b, m) => ({ pos: at(b, m, 2.9, -3.3, 3.1), target: plate(b, -0.3, -0.6, -0.35) }) },
  // side-on at module m: beam left → right, z split vertical
  'L-SIDE': { lens: 40, fit: 3.4, pose: (b, m) => ({ pos: at(b, m, 8.2, 0.8, 0.6), target: at(b, m, 0, 0.9, 0) }) },
  // down the beam at module m, 25° above the axis: a tilt reads as a clock hand
  // 35 mm (not 40): a turned magnet's yoke spans ±2 u, and on a multi-module bench the camera must stay in the gap
  'L-END': { lens: 35, fit: 2.0, pose: (b, m) => ({ pos: at(b, m, 0, -3.6, 1.7), target: at(b, m, 0, 0, 0) }) },
  // plate near face-on (≈ 30° off-normal) from upstream, beside the open +x side of the magnet
  'L-PLATE': { lens: 50, fit: 1.5, pose: (b) => ({ pos: plate(b, 2.2, -3.6, 1.1), target: plate(b, 0, 0, 0) }) },
  'L-PLATE-C': { lens: 65, fit: 1.25, pose: (b) => ({ pos: plate(b, 1.6, -2.6, 0.8), target: plate(b, 0, 0, 0) }) },
  // trucks with the kept beam: the last kept segment (between the last two modules)
  'L-TRACK': {
    lens: 40,
    fit: 2.4,
    pose: (b) => {
      const n = b.modules.length
      const y = n >= 2 ? (b.modules[n - 2].center.y + b.modules[n - 1].center.y) / 2 : b.modules[0].center.y
      return { pos: V(6.4, y - 0.4, 2.4 + b.modules[0].center.z), target: V(0, y, b.modules[0].center.z) }
    },
  },
  // a magnet exit, single-atom slow motion
  'L-DETAIL': {
    lens: 85,
    fit: 0.9,
    pose: (b, m) => {
      const e = b.modules[m].exit
      return { pos: V(e.x + 2.4, e.y - 0.4, e.z + 0.7), target: V(e.x, e.y + 0.2, e.z) }
    },
  },
  // whole multi-module bench
  'L-WIDE': { lens: 28, fit: 0, pose: (b) => ({ pos: V(11, b.mid.y - 6, 7.5 + b.mid.z), target: V(0, b.mid.y, b.mid.z) }) },
  // shows z and x splits at once (logic unit panes)
  'L-3Q': { lens: 35, fit: 0, pose: (b) => ({ pos: V(6.5, b.mid.y - 7, 5 + b.mid.z), target: V(0, b.mid.y, b.mid.z) }) },
}

/** The module a shot is about when none is given: the last (tilt / split beats) or the one before (detail). */
export function defaultModule(shot: LabShot, b: BenchLayout): number {
  const n = b.modules.length
  if (shot === 'L-DETAIL') return Math.max(0, n - 2)
  if (shot === 'L-EST') return 0
  return n - 1
}

/** Camera pose for a shot in a view of `size` at `slot` (lens may change in split panes, D §3.2). */
export function shotPose(shot: LabShot, b: BenchLayout, slot: ViewSlot | null, size: { w: number; h: number }): Pose {
  const def = SHOTS[shot] ?? SHOTS['L-EST']
  const m = defaultModule(shot, b)
  if (slot === 'inset') {
    // the 220 px inset is a diagram of the split: side-on, last magnet + plate, no labels (D §6.3)
    const lm = b.modules[b.modules.length - 1]
    const target = lm.center.clone().lerp(b.plateCenter, 0.5)
    const aspect = size.h > 0 ? size.w / size.h : 1
    const half = (Math.min(lensHfov(40), hfovToVfov(lensHfov(40), aspect)) * Math.PI) / 360
    const span = lm.center.distanceTo(b.plateCenter) / 2 + 1.9
    return { pos: target.clone().add(new THREE.Vector3(1, 0.12, 0.18).normalize().multiplyScalar(span / Math.tan(half))), target, lens: 40 }
  }
  const { pos, target } = def.pose(b, m)
  let lens = def.lens
  if ((slot === 'top' || slot === 'bottom') && shot === 'L-END') lens = 85
  const aspect = size.h > 0 ? size.w / size.h : 1
  const hf = lensHfov(lens)
  const vf = hfovToVfov(hf, aspect)
  const half = (Math.min(hf, vf) * Math.PI) / 360
  const dir = pos.clone().sub(target)
  const dist = dir.length()
  const need = def.fit > 0 ? def.fit / Math.sin(half) : 0
  // keep the library distance on the portrait stage; pull back only when the subject would be cropped
  if (need > dist) pos.copy(target).addScaledVector(dir.normalize(), need)
  // wide shots: the whole bench must fit (bench length grows with modules)
  if (shot === 'L-WIDE' || shot === 'L-3Q') {
    const len = b.oven.distanceTo(b.plateCenter) / 2 + 1.6
    const needW = len / Math.sin(half) / 1.15
    const d2 = pos.distanceTo(target)
    if (needW > d2) pos.copy(target).addScaledVector(pos.clone().sub(target).normalize(), needW)
  }
  return { pos, target, lens }
}
