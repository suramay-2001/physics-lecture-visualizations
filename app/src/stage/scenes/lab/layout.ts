/**
 * Lab bench layout (D §3.1, §4.0): where every module, stop, plate and the oven sit, in PHYSICS
 * coordinates (beam along +y, z up). Pure maths on three.js math classes; no rendering, no physics truths:
 * the tilts and kept signs come from the resolved state (`ResolvedBench`), nothing is decided here.
 *
 * Conventions
 * - A module's LOCAL frame: entrance centre at the origin, beam along local +y, local z up before its
 *   tilt; the tilt τ turns the module about local y, so the + deflection direction is n = (sin τ, 0, cos τ).
 * - Deflection inside a module (gate model, schematic): d(y′) = a·f(y′) along n, f = y′² in the magnet,
 *   then straight with the exit slope. a = K·s·g/v² (s = ±1 outcome, g = gradient falloff, v = speed).
 * - A kept beam feeds the next module, which sits ON that beam: translated to where the kept centreline
 *   (s = keep, g = v = 1) reaches it and turned by its deflection angle. Modules that feed another module
 *   use K/2 so the zig-zag stays small; the last module uses the full K so the plate spots always sit at
 *   ±0.9 (= 30 % / 70 % of the 2D Plate). Fidelity: "deflections are exaggerated; real magnets are aligned
 *   to the beam".
 */
import * as THREE from 'three'

export const LAB = {
  /** Module length along the beam and centre-to-centre spacing. */
  L: 3.2,
  spacing: 5.8,
  /** Oven mouth distance before module 0's entrance (mouth at y = −3.75 for module 0 centred at 0). */
  ovenGap: 2.15,
  slitGap: 1.0,
  /** Plate distance after the last module's exit (plate at y_last + 4.2). */
  plateGap: 2.6,
  /** Blocked beam: stop distance after the exit; open other output: side-plate distance. */
  stopGap: 1.3,
  sideGap: 1.6,
  /** Deflection constant: ±0.9 at the plate on axis for v = 1 (gate K). */
  K: 0.0335,
  /** Beam ribbon half-width across the pole (x). */
  halfWidth: 0.26,
  /** Two benches (l1-logic): stacked panes, A above B. */
  benchDz: 2.6,
} as const

export type V3 = [number, number, number]
export const G = LAB.spacing - LAB.L

/** f(y′): parabola inside the magnet, straight line with the exit slope after it (continuous in value and slope). */
export function defl(y: number): number {
  const L = LAB.L
  if (y <= 0) return 0
  if (y <= L) return y * y
  return L * L + 2 * L * (y - L)
}

export interface ModuleFrame {
  /** Module-local (untilted) → bench physics coordinates. */
  base: THREE.Matrix4
  /** base · R_y(τ): the tilted module (magnet, gradient arrow, split plane). */
  tilted: THREE.Matrix4
  tilt: number
  /** Deflection constant used in this module (K/2 when it feeds another module, K when last). */
  k: number
  /** Entrance, centre and exit on the axis, physics coordinates. */
  entrance: THREE.Vector3
  center: THREE.Vector3
  exit: THREE.Vector3
  /** + deflection direction (unit, physics coordinates). */
  n: THREE.Vector3
}

export interface StopFrame {
  /** Index of the module whose blocked output this stops. */
  k: number
  /** Stop face centre, physics coordinates; `m` = stop frame (local y = beam). */
  m: THREE.Matrix4
  pos: THREE.Vector3
  /** A small plate instead of a stop (LabDevice.openOther). */
  open: boolean
}

export interface BenchLayout {
  modules: ModuleFrame[]
  /** Greyed preparation module (LabBench.showPrep), same frame rules, tilted to the source's axis (z or x). */
  prep: ModuleFrame | null
  prepStop: StopFrame | null
  /** The beam the prep module keeps: the source's sign (+1 for |+z⟩ or |+x⟩, −1 for |−z⟩ or |−x⟩). */
  prepSign: 1 | -1
  stops: StopFrame[]
  /** Plate frame: local x–z = the glass, local y = beam normal; untilted (the deposit pattern turns). */
  plate: THREE.Matrix4
  plateCenter: THREE.Vector3
  oven: THREE.Vector3
  /** Centre of the bench (oven … plate) for wide shots. */
  mid: THREE.Vector3
}

const Y = new THREE.Vector3(0, 1, 0)

function frameAt(base: THREE.Matrix4, tilt: number, k: number): ModuleFrame {
  const tilted = base.clone().multiply(new THREE.Matrix4().makeRotationY(tilt))
  const L = LAB.L
  const entrance = new THREE.Vector3(0, 0, 0).applyMatrix4(base)
  const center = new THREE.Vector3(0, L / 2, 0).applyMatrix4(base)
  const exit = new THREE.Vector3(0, L, 0).applyMatrix4(base)
  const n = new THREE.Vector3(Math.sin(tilt), 0, Math.cos(tilt)).transformDirection(base)
  return { base, tilted, tilt, k, entrance, center, exit, n }
}

/** Frame of the next module on the kept centreline of `m` (sign s = ±1). */
function nextBase(m: ModuleFrame, s: number): THREE.Matrix4 {
  const L = LAB.L
  const nLoc = new THREE.Vector3(Math.sin(m.tilt), 0, Math.cos(m.tilt))
  const T = new THREE.Vector3(0, L + G, 0).addScaledVector(nLoc, s * m.k * defl(L + G))
  const dir = new THREE.Vector3(0, 1, 0).addScaledVector(nLoc, s * m.k * 2 * L).normalize()
  const q = new THREE.Quaternion().setFromUnitVectors(Y, dir)
  return m.base.clone().multiply(new THREE.Matrix4().compose(T, q, new THREE.Vector3(1, 1, 1)))
}

/** A point on a beam of module m (module-local y′, deflection sign s), physics coordinates. */
export function beamPoint(m: ModuleFrame, y: number, s: number, into = new THREE.Vector3()): THREE.Vector3 {
  const nLoc = new THREE.Vector3(Math.sin(m.tilt), 0, Math.cos(m.tilt))
  return into.set(0, y, 0).addScaledVector(nLoc, s * m.k * defl(y)).applyMatrix4(m.base)
}

function stopAt(m: ModuleFrame, k: number, s: number, open: boolean): StopFrame {
  const y = LAB.L + (open ? LAB.sideGap : LAB.stopGap)
  const nLoc = new THREE.Vector3(Math.sin(m.tilt), 0, Math.cos(m.tilt))
  const pos = new THREE.Vector3(0, y, 0).addScaledVector(nLoc, s * m.k * defl(y))
  const mm = m.base.clone().multiply(new THREE.Matrix4().compose(pos, new THREE.Quaternion(), new THREE.Vector3(1, 1, 1)))
  mm.multiply(new THREE.Matrix4().makeRotationY(m.tilt))
  return { k, m: mm, pos: pos.clone().applyMatrix4(m.base), open }
}

/**
 * Layout of one bench from its tilts (radians) and kept signs. `offset` places the bench (two benches are
 * stacked along z). `lastK` lets a transition blend the last module's K (K → K/2 when a module is added).
 */
export function benchLayout(
  tilts: readonly number[],
  keep: readonly ('+' | '-')[],
  opts: { prep?: { tilt: number; sign: 1 | -1 }; showPrep?: boolean; openOther?: readonly boolean[]; offset?: V3; lastK?: number } = {},
): BenchLayout {
  const n = Math.max(1, tilts.length)
  const off = opts.offset ?? [0, 0, 0]
  const L = LAB.L
  // module 0 centred at y = 0 → entrance at −L/2
  let base = new THREE.Matrix4().makeTranslation(off[0], off[1] - L / 2, off[2])
  let prep: ModuleFrame | null = null
  let prepStop: StopFrame | null = null
  // `showPrep` alone = the untilted z prep keeping + (a |+z⟩ source)
  const prepSpec = opts.prep ?? (opts.showPrep ? { tilt: 0, sign: 1 as const } : undefined)
  if (prepSpec) {
    const pb = new THREE.Matrix4().makeTranslation(off[0], off[1] - L / 2 - LAB.spacing, off[2])
    prep = frameAt(pb, prepSpec.tilt, LAB.K / 2)
    prepStop = stopAt(prep, -1, -prepSpec.sign, false)
    base = nextBase(prep, prepSpec.sign)
  }
  const modules: ModuleFrame[] = []
  const stops: StopFrame[] = []
  for (let k = 0; k < n; k++) {
    const last = k === n - 1
    const kk = last ? (opts.lastK ?? LAB.K) : LAB.K / 2
    const m = frameAt(base, tilts[k] ?? 0, kk)
    modules.push(m)
    if (!last) {
      const s = keep[k] === '-' ? -1 : 1
      stops.push(stopAt(m, k, -s, !!opts.openOther?.[k]))
      base = nextBase(m, s)
    }
  }
  const lastM = modules[n - 1]
  const plate = lastM.base.clone().multiply(new THREE.Matrix4().makeTranslation(0, L + LAB.plateGap, 0))
  const plateCenter = new THREE.Vector3().setFromMatrixPosition(plate)
  const first = prep ?? modules[0]
  const oven = new THREE.Vector3(0, -LAB.ovenGap, 0).applyMatrix4(first.base)
  const mid = oven.clone().add(plateCenter).multiplyScalar(0.5)
  return { modules, prep, prepStop, prepSign: prepSpec?.sign ?? 1, stops, plate, plateCenter, oven, mid }
}

/**
 * Which modules of `from` persist in `to` (D §4.0: a bench reconfiguration). Equal counts → index match
 * (rotations animate). Otherwise a longest-common-subsequence match on the tilts (rounded to 0.1°), so a
 * removed middle module slides out and the survivors re-seat. Returns, per `to` index, the `from` index or −1.
 */
export function matchModules(from: readonly number[], to: readonly number[]): number[] {
  if (from.length === to.length) return to.map((_, i) => i)
  const key = (x: number) => Math.round((x * 1800) / Math.PI)
  const a = from.map(key)
  const b = to.map(key)
  const n = a.length
  const m = b.length
  const dp = Array.from({ length: n + 1 }, () => new Array<number>(m + 1).fill(0))
  for (let i = n - 1; i >= 0; i--)
    for (let j = m - 1; j >= 0; j--) dp[i][j] = a[i] === b[j] ? 1 + dp[i + 1][j + 1] : Math.max(dp[i + 1][j], dp[i][j + 1])
  const out = new Array<number>(m).fill(-1)
  let i = 0
  let j = 0
  while (i < n && j < m) {
    if (a[i] === b[j]) {
      out[j] = i
      i++
      j++
    } else if (dp[i + 1][j] >= dp[i][j + 1]) i++
    else j++
  }
  return out
}

const _p = new THREE.Vector3()
const _q = new THREE.Quaternion()
const _s = new THREE.Vector3()
const _p2 = new THREE.Vector3()
const _q2 = new THREE.Quaternion()
/** Blend two rigid frames (position lerp, rotation slerp). */
export function lerpFrame(a: THREE.Matrix4, b: THREE.Matrix4, t: number, into = new THREE.Matrix4()): THREE.Matrix4 {
  a.decompose(_p, _q, _s)
  b.decompose(_p2, _q2, _s)
  _p.lerp(_p2, t)
  _q.slerp(_q2, t)
  return into.compose(_p, _q, _s.set(1, 1, 1))
}
