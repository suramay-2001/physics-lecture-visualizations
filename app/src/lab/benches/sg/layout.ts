/**
 * The SG bench's schematic geometry (D-lab §2.1), in PHYSICS coordinates (beam along +y, z up). Pure maths: no Babylon,
 * no three.js, no physics truths. It places the hardware (the lecture lab's layout rules, stage/scenes/lab/layout.ts,
 * re-derived here without three.js), the protractor rings and knobs, the ± pads, the atoms' flight paths and their
 * landing points. Which way an atom goes is decided by the engine (model.ts, `fireAtom`); this file only draws it.
 *
 * Conventions (the lecture's):
 *   - a module's BASE frame: entrance centre at the origin, beam along local +y, local z up; its TILTED frame is
 *     base · R_y(τ), so the magnet's + direction is n = (sin τ, 0, cos τ) in the base frame (τ from +z toward +x, the
 *     engine's `tiltXZ`): magnets turn only about the beam (decisions/lab.md ruling 4);
 *   - deflection inside a module: d(y′) = a·f(y′) along n, f = y′² in the magnet, then straight with the exit slope;
 *     a = k·s·g/v² (s = ±1 outcome, g = gradient falloff across the pole, v = the atom's speed factor);
 *   - the next module sits ON the kept beam: translated to where the kept centreline reaches it and turned by its slope.
 *     Modules that feed another use K/2; the last uses K, so the plate spots sit at ±SPOT along the last magnet's n.
 * Deflections are exaggerated (the fidelity note says so).
 */
import { gradientFalloff } from '../../../physics/field'
import type { Sign } from '../../../physics/sg'
import type { V3 } from '../../axes'

export const SG = {
  /** Module length along the beam and centre-to-centre spacing. */
  L: 3.2,
  spacing: 5.8,
  ovenGap: 2.15,
  slitGap: 1.0,
  plateGap: 2.6,
  stopGap: 1.3,
  /** Deflection constant: ±SPOT at the plate on axis for v = 1. */
  K: 0.0335,
  /** Beam ribbon half-width across the pole (x of the tilted frame). */
  halfWidth: 0.26,
  /** Plate spot centres along n. */
  spot: 0.9,
  /** The floor and the rail (the Blender stands reach z = −1.99). */
  floorZ: -2.15,
  /** Protractor ring: its plane sits this far upstream of the entrance, radius clear of the yoke. */
  ringY: -0.4,
  ringR: 2.35,
  /** ± pads: this far beyond each beam, along ±n, at the stop's distance. */
  padOut: 0.55,
  /** The sealed |±y⟩ box: size (x, y, z) and the gap from its exit face to the first entrance. */
  box: [1.3, 1.6, 1.3] as const,
  boxGap: 1.2,
} as const
const G = SG.spacing - SG.L

/** A rigid frame: origin and rotation (row-major 3×3; its columns are the local axes in physics coordinates). */
export interface Frame {
  o: V3
  R: number[]
}

const I3 = [1, 0, 0, 0, 1, 0, 0, 0, 1]
export const IDENTITY: Frame = { o: [0, 0, 0], R: I3 }
const mulR = (a: number[], b: number[]): number[] => {
  const r = new Array<number>(9)
  for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) r[i * 3 + j] = a[i * 3] * b[j] + a[i * 3 + 1] * b[3 + j] + a[i * 3 + 2] * b[6 + j]
  return r
}
const rot = (R: number[], v: readonly number[]): V3 => [
  R[0] * v[0] + R[1] * v[1] + R[2] * v[2],
  R[3] * v[0] + R[4] * v[1] + R[5] * v[2],
  R[6] * v[0] + R[7] * v[1] + R[8] * v[2],
]
const rotT = (R: number[], v: readonly number[]): V3 => [
  R[0] * v[0] + R[3] * v[1] + R[6] * v[2],
  R[1] * v[0] + R[4] * v[1] + R[7] * v[2],
  R[2] * v[0] + R[5] * v[1] + R[8] * v[2],
]
/** A point of frame `f`'s local coordinates in the parent (physics) frame. */
export const at = (f: Frame, p: readonly number[]): V3 => {
  const r = rot(f.R, p)
  return [f.o[0] + r[0], f.o[1] + r[1], f.o[2] + r[2]]
}
/** A direction of frame `f` in the parent frame. */
export const dirOf = (f: Frame, v: readonly number[]): V3 => rot(f.R, v)
/** A physics point in frame `f`'s local coordinates. */
export const localOf = (f: Frame, p: readonly number[]): V3 => rotT(f.R, [p[0] - f.o[0], p[1] - f.o[1], p[2] - f.o[2]])
/** f · g (g expressed in f's local coordinates). */
export const compose = (f: Frame, g: Frame): Frame => ({ o: at(f, g.o), R: mulR(f.R, g.R) })
/** Rotation about local y by τ: z → (sin τ, 0, cos τ). */
export const rotY = (tau: number): number[] => {
  const c = Math.cos(tau)
  const s = Math.sin(tau)
  return [c, 0, s, 0, 1, 0, -s, 0, c]
}
/** The smallest rotation taking +y to the unit vector d (Rodrigues). */
function yTo(d: V3): number[] {
  const c = d[1]
  // axis = y × d = (d_z, 0, −d_x)
  const ax = d[2]
  const az = -d[0]
  const s = Math.hypot(ax, az)
  if (s < 1e-12) return c > 0 ? I3 : [1, 0, 0, 0, -1, 0, 0, 0, -1]
  const kx = ax / s
  const kz = az / s
  const t = 1 - c
  return [c + kx * kx * t, -kz * s, kx * kz * t, kz * s, c, -kx * s, kx * kz * t, kx * s, c + kz * kz * t]
}

/** f(y′): parabola inside the magnet, straight line with the exit slope after it (continuous in value and slope). */
export function defl(y: number): number {
  const L = SG.L
  if (y <= 0) return 0
  if (y <= L) return y * y
  return L * L + 2 * L * (y - L)
}
/** The + direction and the across direction of a module turned by τ, in its base frame. */
export const nLocal = (tau: number): V3 => [Math.sin(tau), 0, Math.cos(tau)]
export const acrossLocal = (tau: number): V3 => [Math.cos(tau), 0, -Math.sin(tau)]

export interface ModuleLayout {
  /** Untilted frame at the entrance (the protractor ring lives here). */
  base: Frame
  /** base · R_y(τ): the magnet itself. */
  tilted: Frame
  tau: number
  /** Deflection constant in this module (K/2 when it feeds another, K when last). */
  k: number
  /** Greyed preparation magnet of a |±z⟩ or |±x⟩ source (not counted, not editable). */
  prep: boolean
}
export interface StopLayout {
  /** Index of the module whose blocked output this stops (−1: the preparation magnet). */
  k: number
  /** The stop block: at the blocked beam, turned with the magnet. */
  frame: Frame
  /** The ± pads (physics): the pad beside the + beam and beside the − beam. */
  pads: { plus: V3; minus: V3 }
}
export interface RingLayout {
  center: V3
  /** The beam direction at this module (the ring's normal). */
  axis: V3
  /** The knob: on the ring, along the magnet's + direction n. */
  knob: V3
}
export interface SgLayout {
  modules: ModuleLayout[]
  prep: ModuleLayout | null
  /** The preparation magnet's kept sign (+1 or −1). */
  prepSign: 1 | -1
  prepStop: StopLayout | null
  stops: StopLayout[]
  /** The kept sign (+1 / −1) at each counted magnet but the last. */
  keepSigns: (1 | -1)[]
  rings: RingLayout[]
  /** "−" pad above each magnet (null when there is only one magnet). */
  removePads: (V3 | null)[]
  /** "+" pad at the rail end (null at four magnets). */
  addPad: V3 | null
  /** The plate: local x–z = the glass, local y = the beam normal (untilted: the deposit pattern follows n). */
  plate: Frame
  /** The source: the oven mouth frame, or the sealed box's exit face. */
  source: { kind: 'oven' | 'sealed'; frame: Frame }
  slit: Frame | null
  rail: { from: V3; to: V3 }
  /** Centre and length of the bench (camera fit). */
  mid: V3
  length: number
  /** DOM label anchors (physics). */
  anchors: { source: V3; magnets: V3[] }
}

export interface LayoutInput {
  /** Tilts of the counted magnets, radians. */
  taus: readonly number[]
  keep: readonly Sign[]
  /** 'oven'; a prepared ±z/±x source (a greyed magnet at τ keeping sign); a sealed ±y box. */
  source: { kind: 'oven' } | { kind: 'prep'; tau: number; sign: 1 | -1 } | { kind: 'sealed' }
  /** Most magnets the bench takes (the add pad hides at this count). */
  max: number
}

const sgn = (s: Sign | undefined): 1 | -1 => (s === '-' ? -1 : 1)

function moduleAt(base: Frame, tau: number, k: number, prep: boolean): ModuleLayout {
  return { base, tilted: compose(base, { o: [0, 0, 0], R: rotY(tau) }), tau, k, prep }
}
/** The next module's base on the kept centreline of m (sign s). */
function nextBase(m: ModuleLayout, s: number): Frame {
  const L = SG.L
  const n = nLocal(m.tau)
  const d = s * m.k * defl(L + G)
  const T: V3 = [n[0] * d, L + G, n[2] * d]
  const slope = s * m.k * 2 * L
  const dir: V3 = [n[0] * slope, 1, n[2] * slope]
  const len = Math.hypot(...dir)
  return compose(m.base, { o: T, R: yTo([dir[0] / len, dir[1] / len, dir[2] / len]) })
}
/** A point on a beam of module m (base-local y′, deflection sign s), physics. */
export function beamPoint(m: ModuleLayout, y: number, s: number): V3 {
  const n = nLocal(m.tau)
  const d = s * m.k * defl(y)
  return at(m.base, [n[0] * d, y, n[2] * d])
}
function stopAt(m: ModuleLayout, k: number, keep: number): StopLayout {
  const y = SG.L + SG.stopGap
  const n = nLocal(m.tau)
  const d = m.k * defl(y)
  const blocked = -keep
  const pos: V3 = [n[0] * d * blocked, y, n[2] * d * blocked]
  const frame = compose(m.base, { o: pos, R: rotY(m.tau) })
  const out = d + SG.padOut
  return { k, frame, pads: { plus: at(m.base, [n[0] * out, y, n[2] * out]), minus: at(m.base, [-n[0] * out, y, -n[2] * out]) } }
}

export function sgLayout(input: LayoutInput): SgLayout {
  const n = Math.max(1, input.taus.length)
  const L = SG.L
  let base: Frame = { o: [0, -L / 2, 0], R: I3 }
  let prep: ModuleLayout | null = null
  let prepStop: StopLayout | null = null
  const prepSign = input.source.kind === 'prep' ? input.source.sign : 1
  if (input.source.kind === 'prep') {
    prep = moduleAt({ o: [0, -L / 2 - SG.spacing, 0], R: I3 }, input.source.tau, SG.K / 2, true)
    prepStop = stopAt(prep, -1, prepSign)
    base = nextBase(prep, prepSign)
  }
  const modules: ModuleLayout[] = []
  const stops: StopLayout[] = []
  const keepSigns: (1 | -1)[] = []
  for (let k = 0; k < n; k++) {
    const last = k === n - 1
    const m = moduleAt(base, input.taus[k] ?? 0, last ? SG.K : SG.K / 2, false)
    modules.push(m)
    if (!last) {
      const s = sgn(input.keep[k])
      keepSigns.push(s)
      stops.push(stopAt(m, k, s))
      base = nextBase(m, s)
    }
  }
  const lastM = modules[n - 1]
  const plate = compose(lastM.base, { o: [0, L + SG.plateGap, 0], R: I3 })
  const first = prep ?? modules[0]
  const sealed = input.source.kind === 'sealed'
  const sourceFrame = compose(first.base, { o: [0, sealed ? -SG.boxGap : -SG.ovenGap, 0], R: I3 })
  const slit = sealed ? null : compose(first.base, { o: [0, -SG.slitGap, 0], R: I3 })
  const back = sealed ? at(sourceFrame, [0, -SG.box[1], 0]) : at(sourceFrame, [0, -1.1, 0])
  const rail = { from: [0, back[1] - 0.6, SG.floorZ + 0.08] as V3, to: [0, plate.o[1] + 1.4, SG.floorZ + 0.08] as V3 }
  const rings = modules.map((m) => {
    const t = m.tau
    return { center: at(m.base, [0, SG.ringY, 0]), axis: dirOf(m.base, [0, 1, 0]), knob: at(m.base, [SG.ringR * Math.sin(t), SG.ringY, SG.ringR * Math.cos(t)]) }
  })
  const removePads = modules.map((m) => (n > 1 ? at(m.base, [-0.4, L / 2, 2.6]) : null))
  const addPad = n < input.max ? at(plate, [1.75, 0.9, -0.85]) : null
  const mid: V3 = [(back[0] + plate.o[0]) / 2, (back[1] + plate.o[1]) / 2, (back[2] + plate.o[2]) / 2]
  return {
    modules,
    prep,
    prepSign,
    prepStop,
    stops,
    keepSigns,
    rings,
    removePads,
    addPad,
    plate,
    source: { kind: sealed ? 'sealed' : 'oven', frame: sourceFrame },
    slit,
    rail,
    mid,
    length: Math.hypot(plate.o[0] - back[0], plate.o[1] - back[1], plate.o[2] - back[2]),
    anchors: {
      source: at(sourceFrame, [0, sealed ? -SG.box[1] / 2 : -0.5, sealed ? SG.box[2] / 2 + 0.55 : 1.05]),
      magnets: modules.map((m) => at(m.base, [-0.4, L / 2, n > 1 ? 3.25 : 2.75])),
    },
  }
}

/** The tilt (degrees, [0, 360)) a knob drag point names: its angle about module k's beam, from +z toward +x. */
export function tiltFromPoint(m: ModuleLayout, p: V3): number | null {
  const l = localOf(m.base, p)
  if (Math.hypot(l[0], l[2]) < 1e-6) return null
  const d = (((Math.atan2(l[0], l[2]) * 180) / Math.PI) % 360 + 360) % 360
  // a float residue just below 360° is 0°
  return d > 360 - 1e-9 ? 0 : d
}

/* ------------------------------------------------------------------------------------------------ */
/* Flight paths and landing points                                                                   */
/* ------------------------------------------------------------------------------------------------ */

/** Where one atom ends (engine `Fate`): stopped after counted magnet k, or a plate spot; and its signs. */
export interface AtomFate {
  end: number | 'plus' | 'minus'
  path: Sign[]
}
/** An atom's look (decoration, seeded apart from the engine's draws): place across the ribbon, thickness, speed. */
export interface AtomLook {
  /** −1…1 across the pole. */
  x: number
  /** Gaussian, clamped to ±2.5. */
  zj: number
  /** Speed factor 0.9…1.1 (a faster atom is deflected less). */
  v: number
}
/** Tone of a path point: 0 unpolarized (no outcome yet), 1 the + outcome, 2 the − outcome of the last magnet passed. */
export type Tone = 0 | 1 | 2
/** Points per resampled flight path. */
export const PATH_POINTS = 24

interface Seg {
  pts: V3[]
  tones: Tone[]
}
const toneOf = (s: number): Tone => (s > 0 ? 1 : 2)

/**
 * The atom's polyline through the bench (physics), with a tone per point: oven (or box) → slit → each module it passes
 * → its stop or the plate. The chain follows the lecture's carry rule: offsets live in the tilted frame of each
 * module; the kept centreline feeds the next module.
 */
function trace(lay: SgLayout, fate: AtomFate, look: AtomLook, sourceTone: Tone): Seg {
  const pts: V3[] = []
  const tones: Tone[] = []
  const mods = lay.prep ? [lay.prep, ...lay.modules] : lay.modules
  const off = lay.prep ? 1 : 0
  const signs: number[] = lay.prep ? [lay.prepSign, ...fate.path.map(sgn)] : fate.path.map(sgn)
  const keepAll: number[] = lay.prep ? [lay.prepSign, ...lay.keepSigns] : lay.keepSigns
  const endIdx = fate.end === 'plus' || fate.end === 'minus' ? -1 : fate.end + off
  const g = gradientFalloff(look.x)
  const v2 = look.v * look.v
  let ox = look.x * SG.halfWidth
  let oz = look.zj * 0.022
  const first = mods[0]
  // source → first entrance: from the oven mouth (narrowing to the slit) or the sealed box's exit face
  const startY = lay.source.kind === 'sealed' ? -SG.boxGap : -SG.ovenGap
  const local = (m: ModuleLayout, y: number, a: number): V3 => {
    const sn = Math.sin(m.tau)
    const cs = Math.cos(m.tau)
    const d = a * defl(y)
    const lx = ox * cs + oz * sn
    const lz = -ox * sn + oz * cs
    return at(m.base, [lx + d * sn, y, lz + d * cs])
  }
  for (const y of lay.source.kind === 'sealed' ? [startY, startY / 2] : [startY, -SG.slitGap]) {
    const spread = lay.source.kind === 'sealed' ? 1 : 1 + 1.6 * Math.min(1, Math.max(0, (-y - SG.slitGap) / (SG.ovenGap - SG.slitGap)))
    const sn = Math.sin(first.tau)
    const cs = Math.cos(first.tau)
    const lx = (ox * cs + oz * sn) * spread
    const lz = (-ox * sn + oz * cs) * spread
    pts.push(at(first.base, [lx, y, lz]))
    tones.push(sourceTone)
  }
  let tone = sourceTone
  for (let k = 0; k < mods.length; k++) {
    const m = mods[k]
    const lastMod = k === mods.length - 1
    const stopped = k === endIdx
    const len = stopped ? SG.L + SG.stopGap : lastMod ? SG.L + SG.plateGap : SG.L + G
    const s = signs[k] ?? 1
    // the gradient's fall-off across the pole shapes the plate's lips: it acts in the last magnet only, so a kept beam
    // stays a tidy ribbon from magnet to magnet (schematic)
    const a = (m.k * s * (lastMod ? g : 1)) / v2
    const ys = stopped || lastMod ? [0, 0.8, 1.6, 2.4, 3.2, (SG.L + len) / 2, len] : [0, 0.8, 1.6, 2.4, 3.2, SG.L + G / 2]
    for (const y of ys) {
      if (y > 0.6) tone = toneOf(s)
      pts.push(local(m, y, a))
      tones.push(tone)
    }
    if (stopped || lastMod) break
    // carry the offset to the next module (relative to the kept centreline), into its tilted frame
    const aKeep = m.k * (keepAll[k] ?? 1)
    const oz2 = oz + (a - aKeep) * defl(SG.L + G)
    const sn = Math.sin(m.tau)
    const cs = Math.cos(m.tau)
    const lx = ox * cs + oz2 * sn
    const lz = -ox * sn + oz2 * cs
    const nt = mods[k + 1].tau
    ox = lx * Math.cos(nt) - lz * Math.sin(nt)
    oz = lx * Math.sin(nt) + lz * Math.cos(nt)
  }
  return { pts, tones }
}
/** The landing point of a plate atom in PLATE-local coordinates (x–z = the glass face). */
export function landingOf(lay: SgLayout, fate: AtomFate, look: AtomLook, sourceTone: Tone): V3 {
  const seg = trace(lay, fate, look, sourceTone)
  const p = localOf(lay.plate, seg.pts[seg.pts.length - 1])
  return [p[0], -0.03, p[2]]
}

/** Resample a polyline to `n` points equally spaced along its length; tones follow the segment each point falls in. */
function resample(seg: Seg, n: number, out: Float32Array, tones: Uint8Array, o: number): number {
  const { pts } = seg
  const cum = [0]
  for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1], pts[i][2] - pts[i - 1][2]))
  const total = cum[cum.length - 1]
  let j = 0
  for (let i = 0; i < n; i++) {
    const d = (total * i) / (n - 1)
    while (j < pts.length - 2 && cum[j + 1] < d) j++
    const span = cum[j + 1] - cum[j]
    const t = span > 0 ? Math.min(1, Math.max(0, (d - cum[j]) / span)) : 0
    for (let c = 0; c < 3; c++) out[3 * (o + i) + c] = pts[j][c] + (pts[j + 1][c] - pts[j][c]) * t
    tones[o + i] = t < 0.5 ? seg.tones[j] : seg.tones[j + 1]
  }
  return total
}

/** The path length of an atom that reaches the plate (a full flight), for timing. */
export function fullLength(lay: SgLayout): number {
  const seg = trace(lay, { end: 'plus', path: lay.modules.map(() => '+') }, { x: 0, zj: 0, v: 1 }, 0)
  let s = 0
  for (let i = 1; i < seg.pts.length; i++) s += Math.hypot(seg.pts[i][0] - seg.pts[i - 1][0], seg.pts[i][1] - seg.pts[i - 1][1], seg.pts[i][2] - seg.pts[i - 1][2])
  return s
}

/** Flight paths of `fates.length` atoms: PATH_POINTS points each (physics), a tone per point, and each path's length. */
export function flightPaths(lay: SgLayout, fates: readonly AtomFate[], looks: readonly AtomLook[], sourceTone: Tone): { points: Float32Array; tones: Uint8Array; lengths: Float32Array } {
  const n = fates.length
  const points = new Float32Array(n * PATH_POINTS * 3)
  const tones = new Uint8Array(n * PATH_POINTS)
  const lengths = new Float32Array(n)
  for (let i = 0; i < n; i++) lengths[i] = resample(trace(lay, fates[i], looks[i], sourceTone), PATH_POINTS, points, tones, i * PATH_POINTS)
  return { points, tones, lengths }
}
