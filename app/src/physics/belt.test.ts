import { describe, expect, it } from 'vitest'
import { c, sub, abs } from './complex'
import { identity, madd, matmul as mmul, mscale, type Mat } from './linalg'
import { Rz, SIGMA_X, SIGMA_Y, SIGMA_Z, rotation, type Vec3 } from './spin'
import { axisAngle, qmul, qrotate, ribbon, twistFrame, untwistFrame, type P3, type Quat } from './belt'

const TAU = Math.PI * 2
const close = (a: number, b: number, eps = 1e-9) => expect(Math.abs(a - b)).toBeLessThan(eps)
const qclose = (a: Quat, b: Quat, eps = 1e-9) => a.forEach((v, i) => close(v, b[i], eps))

/** q ↔ U = w I − i(x σx + y σy + z σz) */
function su2(q: Quat): Mat {
  let U = mscale(identity(2), q[0])
  U = madd(U, mscale(SIGMA_X, c(0, -q[1])))
  U = madd(U, mscale(SIGMA_Y, c(0, -q[2])))
  return madd(U, mscale(SIGMA_Z, c(0, -q[3])))
}
const matClose = (A: Mat, B: Mat, eps = 1e-9) => A.forEach((row, i) => row.forEach((z, j) => expect(abs(sub(z, B[i][j]))).toBeLessThan(eps)))

const AXES: Vec3[] = [[0, 0, 1], [1, 0, 0], [0.3, -0.5, 0.8], [-1, 2, 0.5]]
const ANGLES = [0, 0.7, Math.PI, TAU, 1.5 * TAU, 2 * TAU]
const SS = Array.from({ length: 41 }, (_, k) => k / 40)
const US = Array.from({ length: 41 }, (_, k) => k / 40)

describe('quaternions are the SU(2) rotations of spin.ts', () => {
  it('axisAngle(n, φ) is e^{−iφ n·σ/2} = spin.ts rotation(n, φ)', () => {
    for (const n of AXES) for (const phi of ANGLES) matClose(su2(axisAngle(n, phi)), rotation(n, phi))
  })
  it('qmul is the matrix product', () => {
    for (const a of AXES) for (const b of AXES) {
      const p = axisAngle(a, 0.9)
      const q = axisAngle(b, -2.3)
      matClose(su2(qmul(p, q)), mmul(su2(p), su2(q)))
    }
  })
  it('qrotate is the SO(3) rotation (v rotated by φ about n)', () => {
    const v = qrotate(axisAngle([0, 0, 1], Math.PI / 2), [1, 0, 0])
    ;[0, 1, 0].forEach((x, i) => close(v[i], x))
  })
  it('a 360° turn is −1 (as spin.ts Rz(2π) = −I), a 720° turn is +1', () => {
    qclose(twistFrame(TAU, 1), [-1, 0, 0, 0])
    qclose(twistFrame(2 * TAU, 1), [1, 0, 0, 0])
    matClose(su2(twistFrame(TAU, 1)), Rz(TAU))
    matClose(su2(twistFrame(2 * TAU, 1)), Rz(2 * TAU))
  })
})

describe('the untwist homotopy', () => {
  it('starts exactly at the 720° twist (as SU(2) elements, not just rotations)', () => {
    for (const s of SS) qclose(untwistFrame(0, s), twistFrame(2 * TAU, s))
  })
  it('keeps the bracket end and the block end at +1 for every u (block held still)', () => {
    for (const u of US) {
      qclose(untwistFrame(u, 0), [1, 0, 0, 0])
      qclose(untwistFrame(u, 1), [1, 0, 0, 0])
    }
  })
  it('ends with the whole belt at +1: flat, no twist', () => {
    for (const s of SS) qclose(untwistFrame(1, s), [1, 0, 0, 0])
  })
  it('is continuous in u and s', () => {
    const step = (a: Quat, b: Quat) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2], a[3] - b[3])
    let worst = 0
    for (let i = 0; i < 400; i++) for (const s of SS) worst = Math.max(worst, step(untwistFrame(i / 400, s), untwistFrame((i + 1) / 400, s)))
    expect(worst).toBeLessThan(0.02)
  })
  it('cannot start from a single 360° twist: that block end is −1, every untwist loop ends at +1', () => {
    qclose(twistFrame(TAU, 1), [-1, 0, 0, 0])
    for (const u of US) expect(untwistFrame(u, 1)[0]).toBeGreaterThan(0.999)
  })
})

describe('ribbon drawing', () => {
  const top: P3 = [0, 0, 2.4]
  const bottom: P3 = [0, 0, 0.3]
  const gap = 2.1
  const frames = [
    ...ANGLES.filter((a) => a <= 2 * TAU).map((a) => (s: number) => twistFrame(a, s)),
    ...US.map((u) => (s: number) => untwistFrame(u, s)),
  ]
  it('pins both ends: the bracket and the block never move', () => {
    for (const f of frames) {
      const r = ribbon(f, top, bottom)
      r.points[0].forEach((v, i) => close(v, top[i], 1e-12))
      r.points[r.points.length - 1].forEach((v, i) => close(v, bottom[i], 1e-9))
    }
  })
  it('has no cusps and a well-defined width everywhere (slack 2)', () => {
    let minSeg = Infinity
    let worstDot = 0
    for (const f of frames) {
      const r = ribbon(f, top, bottom)
      for (let i = 1; i < r.points.length; i++) {
        const a = r.points[i - 1]
        const b = r.points[i]
        minSeg = Math.min(minSeg, Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]))
      }
      // the frame's width vector against the drawn tangent: orthogonalizing must not collapse it
      for (let i = 1; i < r.points.length - 1; i++) {
        const a = r.points[i - 1]
        const b = r.points[i + 1]
        const d: P3 = [b[0] - a[0], b[1] - a[1], b[2] - a[2]]
        const dl = Math.hypot(...d)
        const w = qrotate(f(i / (r.points.length - 1)), [1, 0, 0])
        worstDot = Math.max(worstDot, Math.abs((w[0] * d[0] + w[1] * d[1] + w[2] * d[2]) / dl))
      }
      for (const w of r.widths) close(Math.hypot(...w), 1, 1e-9)
    }
    expect(minSeg).toBeGreaterThan((0.9 * gap) / 64)
    expect(worstDot).toBeLessThan(0.95)
  })
  it('draws two full turns of the width at 720° and none at the end of the untwist', () => {
    const turns = (r: ReturnType<typeof ribbon>) => {
      let total = 0
      for (let i = 1; i < r.widths.length; i++) {
        const a = Math.atan2(r.widths[i - 1][1], r.widths[i - 1][0])
        const b = Math.atan2(r.widths[i][1], r.widths[i][0])
        total += ((b - a + 3 * Math.PI) % TAU) - Math.PI
      }
      return total / TAU
    }
    close(turns(ribbon((s) => twistFrame(2 * TAU, s), top, bottom)), 2, 1e-9)
    close(turns(ribbon((s) => untwistFrame(1, s), top, bottom)), 0, 1e-9)
    for (const w of ribbon((s) => untwistFrame(1, s), top, bottom).widths) [1, 0, 0].forEach((v, i) => close(w[i], v, 1e-9))
  })
})
