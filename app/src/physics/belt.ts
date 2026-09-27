/**
 * Dirac's belt trick as explicit rotations (Phase 3 chapter opener B; decision P3 #5).
 *
 * A belt hangs from a fixed bracket (s = 0) to a block (s = 1). Every point of the belt carries a frame, a
 * rotation R(s). We store rotations as unit quaternions q = (w, x, y, z) because a unit quaternion IS an SU(2)
 * element: q ↔ U = w·I − i(x σx + y σy + z σz), so `axisAngle(n̂, φ)` ↔ `rotation(n̂, φ)` of physics/spin.ts
 * (e^{−iφ n̂·σ/2}). The quaternion keeps the sign a 3D rotation matrix forgets: a 360° turn is q = −1, a 720°
 * turn is q = +1. That sign is the spin-½ fact the opener dramatizes.
 *
 * Twist stage (block turned by α about the vertical z): the twist spreads evenly along the belt,
 *   R(s) = Rot_z(α s).
 * Untwist stage (block held still after α = 720°), u from 0 to 1:
 *   R_u(s) = Rot_n(u)(2π s) · Rot_z(2π s),   n(u) = (sin πu, 0, cos πu).
 * Checks (belt.test.ts): u = 0 equals the 720° twist exactly (as quaternions); every R_u starts at +1 on the
 * bracket and ends at +1 on the block (Rot_n(2π) · Rot_z(2π) = (−1)(−1)); u = 1 is +1 everywhere (flat belt).
 * The same family cannot start from a 360° twist: its block end is −1, and a continuous family of loops
 * that all start at +1 cannot jump to end at +1.
 *
 * Belt path (drawing, not physics): the centreline follows the frames' tangent, then a linear shear keeps
 * the block end fixed. The drawn length is therefore not constant (a real belt needs slack for the loop);
 * the fidelity note says so. What is exact is the frame at every point.
 */

export type Quat = [number, number, number, number]
export type P3 = [number, number, number]

const TAU = Math.PI * 2

export function axisAngle(n: P3, angle: number): Quat {
  const l = Math.hypot(n[0], n[1], n[2])
  const s = Math.sin(angle / 2) / l
  return [Math.cos(angle / 2), n[0] * s, n[1] * s, n[2] * s]
}

export function qmul(a: Quat, b: Quat): Quat {
  return [
    a[0] * b[0] - a[1] * b[1] - a[2] * b[2] - a[3] * b[3],
    a[0] * b[1] + a[1] * b[0] + a[2] * b[3] - a[3] * b[2],
    a[0] * b[2] - a[1] * b[3] + a[2] * b[0] + a[3] * b[1],
    a[0] * b[3] + a[1] * b[2] - a[2] * b[1] + a[3] * b[0],
  ]
}

/** v rotated by q (the SO(3) image; the sign of q drops out). */
export function qrotate(q: Quat, v: P3): P3 {
  const [w, x, y, z] = q
  // t = 2 (q_vec × v); v' = v + w t + q_vec × t
  const tx = 2 * (y * v[2] - z * v[1])
  const ty = 2 * (z * v[0] - x * v[2])
  const tz = 2 * (x * v[1] - y * v[0])
  return [v[0] + w * tx + (y * tz - z * ty), v[1] + w * ty + (z * tx - x * tz), v[2] + w * tz + (x * ty - y * tx)]
}

const Z: P3 = [0, 0, 1]

/** Frame at s when the block has turned by α about z. */
export const twistFrame = (alpha: number, s: number): Quat => axisAngle(Z, alpha * s)

/** The untwisting axis n(u): z at u = 0, x at u = ½, −z at u = 1. */
export const untwistAxis = (u: number): P3 => [Math.sin(Math.PI * u), 0, Math.cos(Math.PI * u)]

/** Frame at s during the untwist, u ∈ [0, 1]. */
export const untwistFrame = (u: number, s: number): Quat => qmul(axisAngle(untwistAxis(u), TAU * s), axisAngle(Z, TAU * s))

export interface Ribbon {
  /** centreline points, bracket (s = 0) to block (s = 1) */
  points: P3[]
  /** unit width direction at each point, perpendicular to the drawn tangent */
  widths: P3[]
  /** the block's orientation (the frame at s = 1) */
  block: Quat
}

/**
 * Sample the belt: `frame(s)` gives the rotation at s; the belt hangs from `top` down to `bottom` (a point
 * straight below). Rest tangent −z (downwards), rest width +x. `slack` = path length ÷ bracket-to-block gap
 * before the shear (2 keeps the drawn tangent at least as long as the gap: no cusps; see belt.test.ts).
 */
export function ribbon(frame: (s: number) => Quat, top: P3, bottom: P3, samples = 65, slack = 2): Ribbon {
  const gap: P3 = [bottom[0] - top[0], bottom[1] - top[1], bottom[2] - top[2]]
  const len = slack * Math.hypot(gap[0], gap[1], gap[2])
  const sub = 16
  const n = (samples - 1) * sub
  // centreline by the midpoint rule on a fine grid, kept at the sample points
  const raw: P3[] = [[...top]]
  let c: P3 = [...top]
  for (let k = 0; k < n; k++) {
    const t = qrotate(frame((k + 0.5) / n), [0, 0, -1])
    c = [c[0] + (len * t[0]) / n, c[1] + (len * t[1]) / n, c[2] + (len * t[2]) / n]
    if ((k + 1) % sub === 0) raw.push(c)
  }
  const end = raw[raw.length - 1]
  const fix: P3 = [bottom[0] - end[0], bottom[1] - end[1], bottom[2] - end[2]]
  const points = raw.map((p, i): P3 => {
    const s = i / (samples - 1)
    return [p[0] + s * fix[0], p[1] + s * fix[1], p[2] + s * fix[2]]
  })
  const widths = points.map((_, i): P3 => {
    const a = points[Math.max(0, i - 1)]
    const b = points[Math.min(samples - 1, i + 1)]
    const d: P3 = [b[0] - a[0], b[1] - a[1], b[2] - a[2]]
    const dl = Math.hypot(d[0], d[1], d[2])
    const t: P3 = [d[0] / dl, d[1] / dl, d[2] / dl]
    const w = qrotate(frame(i / (samples - 1)), [1, 0, 0])
    const dot = w[0] * t[0] + w[1] * t[1] + w[2] * t[2]
    const o: P3 = [w[0] - dot * t[0], w[1] - dot * t[1], w[2] - dot * t[2]]
    const ol = Math.hypot(o[0], o[1], o[2])
    return [o[0] / ol, o[1] / ol, o[2] / ol]
  })
  return { points, widths, block: frame(1) }
}
