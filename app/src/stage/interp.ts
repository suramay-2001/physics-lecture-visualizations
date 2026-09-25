/**
 * Interpolation between two resolved states of the same kind (W-L1 §2.6; pure, frozen at `l1-freeze`).
 *
 * Principle: INTERPOLATE INPUTS, RECOMPUTE OUTPUTS. Every in-between frame is built from interpolated
 * inputs (tilts, angles, Bloch vectors, coefficients) and then passed through the same engine functions
 * as `resolve` (stage/resolve.ts `benchFrom`, `planeProbs`, `blochFrom`, `ballFrom`, `hopfMarked`,
 * `operatorFrom`). A probability on screen is therefore always true for the geometry on screen.
 *
 * | kind           | continuous inputs          | rule                                                       |
 * |----------------|----------------------------|------------------------------------------------------------|
 * | lab-r3         | device tilts, gradient,    | lerp degrees AS AUTHORED (0° → 180° passes 90°) when the   |
 * |                | ghost band, dim, fires     | bench topology matches; otherwise switch at t = ½          |
 * | hilbert-plane  | ψ, other arrows, frame     | lerp angles as authored, no shortest-arc wrap; neg = +180° |
 * | bloch          | r on S²                    | geodesic slerp (a physical rotation about r_a × r_b);      |
 * |                |                            | `path.about` rotates about that axis; a shared `rotate`    |
 * |                |                            | lerps its angle (R_z(2π) is a full lap); never inside S²   |
 * | bloch-ball     | r in the ball              | pure → pure: slerp on the surface; either end mixed or the |
 * |                |                            | leaving beat 'non-selective': straight chord; 'selective': |
 * |                |                            | cut at t = ½ (a recorded outcome is a jump)                |
 * | hopf           | base point, χ, reveal      | slerp the base point; χ LINEAR, NO WRAP; reveal lerp       |
 * | operator-space | (a₀, a⃗) ∈ ℝ⁴             | linear (a real vector space: straight lines are honest)    |
 * Discrete fields (topology, model, labels, shots, roles) switch at t = ½; D choreographs with from/to/t.
 *
 * Hopf phase (decision #15): χ = 0° and χ = 720° are the SAME state. "No wrap" is only an animation-path
 * rule: a scripted χ sweep 0° → 720° draws two laps of the bead instead of standing still. The "720° to
 * return" fact belongs to the rotation angle φ (R_z(φ)|+z⟩ = e^{−iφ/2}|+z⟩), which moves χ by −φ/2.
 */
import type { StageKind } from '../content/stage'
import { type Sign } from '../physics/sg'
import { ketFromBloch } from '../physics/spin'
import { ballFrom, benchFrom, blochFrom, hopfMarked, operatorFrom, planeProbs } from './resolve'
import type {
  AnyResolved,
  Resolved,
  ResolvedBall,
  ResolvedBench,
  ResolvedBloch,
  ResolvedHopf,
  ResolvedLab,
  ResolvedOperator,
  ResolvedPlane,
  V3,
} from './types'

const lerp = (a: number, b: number, t: number) => a + (b - a) * t
const lerp3 = (a: V3, b: V3, t: number): V3 => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)]
const dot3 = (a: V3, b: V3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2]
const cross3 = (a: V3, b: V3): V3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]
const norm3 = (a: V3) => Math.hypot(a[0], a[1], a[2])
const near3 = (a: V3, b: V3, eps = 1e-9) => Math.abs(a[0] - b[0]) < eps && Math.abs(a[1] - b[1]) < eps && Math.abs(a[2] - b[2]) < eps
const pick = <T>(a: T, b: T, t: number): T => (t < 0.5 ? a : b)

/** Rodrigues rotation of v about unit axis k by angle θ. */
export function rotateAbout(v: V3, k: V3, theta: number): V3 {
  const c = Math.cos(theta)
  const s = Math.sin(theta)
  const kv = cross3(k, v)
  const kd = dot3(k, v) * (1 - c)
  return [v[0] * c + kv[0] * s + k[0] * kd, v[1] * c + kv[1] * s + k[1] * kd, v[2] * c + kv[2] * s + k[2] * kd]
}

/** Great-circle interpolation between directions (unit length kept). Antipodes: rotate about any ⊥ axis. */
export function slerp(a: V3, b: V3, t: number): V3 {
  const la = norm3(a) || 1
  const lb = norm3(b) || 1
  const ua: V3 = [a[0] / la, a[1] / la, a[2] / la]
  const ub: V3 = [b[0] / lb, b[1] / lb, b[2] / lb]
  const d = Math.max(-1, Math.min(1, dot3(ua, ub)))
  const len = lerp(la, lb, t)
  if (d > 1 - 1e-12) return [ua[0] * len, ua[1] * len, ua[2] * len]
  let axis = cross3(ua, ub)
  if (norm3(axis) < 1e-9) {
    // antipodal: validateTransition flags this in content; pick a stable perpendicular at runtime
    axis = Math.abs(ua[0]) < 0.9 ? cross3(ua, [1, 0, 0]) : cross3(ua, [0, 1, 0])
  }
  const n = norm3(axis)
  const k: V3 = [axis[0] / n, axis[1] / n, axis[2] / n]
  const r = rotateAbout(ua, k, Math.acos(d) * t)
  return [r[0] * len, r[1] * len, r[2] * len]
}

/** Signed angle that rotates a's projection onto b's about k (both taken perpendicular to k). */
function angleAbout(a: V3, b: V3, k: V3): number {
  const ka = dot3(a, k)
  const kb = dot3(b, k)
  const qa: V3 = [a[0] - ka * k[0], a[1] - ka * k[1], a[2] - ka * k[2]]
  const qb: V3 = [b[0] - kb * k[0], b[1] - kb * k[1], b[2] - kb * k[2]]
  return Math.atan2(dot3(cross3(qa, qb), k), dot3(qa, qb))
}

/* ------------------------------------------------------------------------------------------------ */

function sameTopology(a: ResolvedBench, b: ResolvedBench): boolean {
  return (
    a.id === b.id &&
    a.source === b.source &&
    a.tilts.length === b.tilts.length &&
    a.keep.every((k, i) => k === b.keep[i]) &&
    a.openOther.every((o, i) => o === b.openOther[i]) &&
    a.showPrep === b.showPrep
  )
}

function interpLab(a: ResolvedLab, b: ResolvedLab, t: number): ResolvedLab {
  const topo = a.benches.length === b.benches.length && a.benches.every((x, i) => sameTopology(x, b.benches[i]))
  const benches = topo
    ? a.benches.map((x, i) => {
        const y = b.benches[i]
        return benchFrom(x.id, x.source, x.tilts.map((th, k) => lerp(th, y.tilts[k], t)), x.keep as Sign[], x.openOther, x.showPrep, lerp(x.fires ?? 1, y.fires ?? 1, t))
      })
    : pick(a.benches, b.benches, t)
  const d = pick(a, b, t)
  return {
    ...d,
    kind: 'lab-r3',
    benches,
    gradient: lerp(a.gradient, b.gradient, t),
    ghostBand: lerp(a.ghostBand, b.ghostBand, t),
    dim: lerp(a.dim, b.dim, t),
  }
}

function interpPlane(a: ResolvedPlane, b: ResolvedPlane, t: number): ResolvedPlane {
  const basis = lerp(a.basis, b.basis, t)
  let psi: number | null
  let psiAlpha: number
  if (a.psi !== null && b.psi !== null) {
    psi = lerp(a.psi, b.psi, t)
    psiAlpha = 1
  } else if (b.psi !== null) {
    psi = b.psi
    psiAlpha = t
  } else if (a.psi !== null) {
    psi = a.psi
    psiAlpha = 1 - t
  } else {
    psi = null
    psiAlpha = 0
  }
  const n = Math.max(a.others.length, b.others.length)
  const others: ResolvedPlane['others'] = []
  for (let i = 0; i < n; i++) {
    const x = a.others[i]
    const y = b.others[i]
    if (x && y) {
      const d = pick(x, y, t)
      others.push({ angle: lerp(x.angle, y.angle, t), role: d.role, badge: d.badge, alpha: lerp(x.alpha, y.alpha, t) })
    } else if (y) others.push({ ...y, alpha: y.alpha * t })
    else if (x) others.push({ ...x, alpha: x.alpha * (1 - t) })
  }
  return {
    kind: 'hilbert-plane',
    psi,
    psiAlpha,
    others,
    basis,
    probs: psi === null ? null : planeProbs(psi, basis),
    shadows: lerp(a.shadows, b.shadows, t),
    rightAngle: lerp(a.rightAngle, b.rightAngle, t),
    arc: lerp(a.arc, b.arc, t),
    ticks: lerp(a.ticks, b.ticks, t),
    shot: pick(a.shot, b.shot, t),
  }
}

function interpBloch(a: ResolvedBloch, b: ResolvedBloch, t: number): ResolvedBloch {
  const gamma = lerp(a.globalPhase, b.globalPhase, t)
  const axis = a.axis && b.axis ? slerp(a.axis, b.axis, t) : pick(a.axis, b.axis, t)
  const d = pick(a, b, t)
  const rest = { trail: d.trail, labels: d.labels, path: b.path, shot: d.shot }
  // 1. shared rotation: same base and axis → lerp the rotation angle (R_z(2π) is a full lap, ket sign kept)
  if (a.rot && b.rot && near3(a.base, b.base) && near3(a.rot.axis, b.rot.axis)) {
    const theta = Math.acos(Math.max(-1, Math.min(1, a.base[2])))
    const phi = Math.atan2(a.base[1], a.base[0])
    return blochFrom(rest, ketFromBloch(theta, phi), { axis: a.rot.axis, angle: lerp(a.rot.angle, b.rot.angle, t) }, gamma, axis)
  }
  // 2. authored path about an axis, else 3. geodesic
  let r: V3
  if (b.path !== 'geodesic') r = rotateAbout(a.r, b.path.about, angleAbout(a.r, b.r, b.path.about) * t)
  else r = slerp(a.r, b.r, t)
  const theta = Math.acos(Math.max(-1, Math.min(1, r[2])))
  const phi = Math.atan2(r[1], r[0])
  return blochFrom(rest, ketFromBloch(theta, phi), null, gamma, axis)
}

function interpBall(a: ResolvedBall, b: ResolvedBall, t: number): ResolvedBall {
  const d = pick(a, b, t)
  let r: V3
  if (a.update === 'selective') r = pick(a.r, b.r, t) // a recorded outcome is a jump
  else if (a.update !== 'non-selective' && Math.abs(a.rNorm - 1) < 1e-9 && Math.abs(b.rNorm - 1) < 1e-9) r = slerp(a.r, b.r, t)
  else r = lerp3(a.r, b.r, t) // mixing and dephasing are straight chords
  const compare = a.compare && b.compare ? lerp3(a.compare, b.compare, t) : pick(a.compare, b.compare, t)
  const axis = a.axis && b.axis ? slerp(a.axis, b.axis, t) : pick(a.axis, b.axis, t)
  return ballFrom(r, {
    compare,
    recipe: d.recipe,
    axis,
    update: d.update,
    purityShown: lerp(a.purityShown, b.purityShown, t),
    shot: d.shot,
  })
}

function interpHopf(a: ResolvedHopf, b: ResolvedHopf, t: number): ResolvedHopf {
  const d = pick(a, b, t)
  let marked: ResolvedHopf['marked'] = pick(a.marked, b.marked, t)
  if (a.marked && b.marked) {
    const x = a.marked
    const y = b.marked
    if (Math.abs(x.base.theta - y.base.theta) < 1e-9 && Math.abs(x.base.phi - y.base.phi) < 1e-9) {
      // same base: lerp the phase and the rotation angle (no wrap), recompute
      marked = hopfMarked(x.base.theta, x.base.phi, lerp(x.base.chi, y.base.chi, t), lerp(x.rotAngle, y.rotAngle, t))
    } else {
      const r = slerp(x.r, y.r, t)
      const theta = Math.acos(Math.max(-1, Math.min(1, r[2])))
      const phi = Math.atan2(r[1], r[0])
      marked = hopfMarked(theta, phi, lerp(x.chi, y.chi, t), 0)
    }
  }
  return {
    ...d,
    kind: 'hopf',
    reveal: lerp(a.reveal, b.reveal, t),
    linking: lerp(a.linking, b.linking, t),
    marked,
  }
}

function interpOperator(a: ResolvedOperator, b: ResolvedOperator, t: number): ResolvedOperator {
  const d = pick(a, b, t)
  const add = a.add && b.add ? { a0: lerp(a.add.a0, b.add.a0, t), a: lerp3(a.add.a, b.add.a, t) } : pick(a.add, b.add, t)
  return operatorFrom({ a0: lerp(a.a0, b.a0, t), a: lerp3(a.a, b.a, t), valid: a.valid && b.valid }, add, {
    eigen: lerp(a.eigen, b.eigen, t),
    gauge: lerp(a.gauge, b.gauge, t),
    shot: d.shot,
  })
}

/** In-between state at t ∈ [0, 1] (t = 0 → a, t = 1 → b), observables recomputed. */
export function interpolate<K extends StageKind>(a: Resolved<K>, b: Resolved<K>, t: number): Resolved<K> {
  if (t <= 0) return a
  if (t >= 1) return b
  const x = a as AnyResolved
  switch (x.kind) {
    case 'lab-r3':
      return interpLab(x, b as ResolvedLab, t) as Resolved<K>
    case 'hilbert-plane':
      return interpPlane(x, b as ResolvedPlane, t) as Resolved<K>
    case 'bloch':
      return interpBloch(x, b as ResolvedBloch, t) as Resolved<K>
    case 'bloch-ball':
      return interpBall(x, b as ResolvedBall, t) as Resolved<K>
    case 'hopf':
      return interpHopf(x, b as ResolvedHopf, t) as Resolved<K>
    case 'operator-space':
      return interpOperator(x, b as ResolvedOperator, t) as Resolved<K>
  }
}
