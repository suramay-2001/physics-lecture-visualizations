import { describe, expect, it } from 'vitest'
import { expi, mul } from './complex'
import { blochVector, ketFromBloch } from './spin'
import {
  type R4,
  type V3,
  basePoints,
  blochPoint,
  fiberPoint,
  fiberPoint3,
  fiberPolyline,
  fiberSpan,
  hopfMap,
  inverseStereo,
  linkingNumber,
  norm4,
  stereo,
} from './hopf'

const close = (a: number, b: number, eps = 1e-9) => expect(Math.abs(a - b)).toBeLessThan(eps)
const TAU = Math.PI * 2
const CHIS = Array.from({ length: 97 }, (_, k) => (k / 96) * TAU - 0.3)

// Base points of both picture sizes plus awkward ones (poles, near the projection pole, negative φ).
const SAMPLE_POINTS: [number, number][] = [
  ...basePoints(64).map((b) => [b.theta, b.phi] as [number, number]),
  ...basePoints(128).map((b) => [b.theta, b.phi] as [number, number]),
  [0, 0],
  [Math.PI, 0],
  [Math.PI - 1e-3, 1.1],
  [1.3, -2.7],
]

describe('Hopf fibration math', () => {
  it('every sampled fiber point is a unit spinor, |ψ| = 1', () => {
    for (const [th, ph] of SAMPLE_POINTS) for (const chi of CHIS) close(norm4(fiberPoint(th, ph, chi)), 1, 1e-12)
  })

  it('every point of a fiber maps to the same Bloch vector — the base point (θ, φ)', () => {
    for (const [th, ph] of SAMPLE_POINTS) {
      const r = blochPoint(th, ph)
      for (const chi of CHIS) hopfMap(fiberPoint(th, ph, chi)).forEach((x, i) => close(x, r[i], 1e-12))
    }
  })

  it('agrees with the engine: e^{iχ}·ketFromBloch has the same Bloch vector via physics/spin.ts', () => {
    for (const [th, ph] of SAMPLE_POINTS.slice(0, 40)) {
      for (const chi of CHIS.slice(0, 20)) {
        const psi = ketFromBloch(th, ph).map((z) => mul(expi(chi), z))
        const x: R4 = [psi[0].re, psi[0].im, psi[1].re, psi[1].im]
        fiberPoint(th, ph, chi).forEach((v, i) => close(v, x[i], 1e-12))
        blochVector(psi).forEach((v, i) => close(v, hopfMap(x)[i], 1e-12))
      }
    }
  })

  it('stereographic projection inverts, and projected fibers are circles (circles map to circles)', () => {
    for (const [th, ph] of SAMPLE_POINTS.slice(0, 64)) {
      const pts = CHIS.map((chi) => fiberPoint3(th, ph, chi)!)
      for (let k = 0; k < pts.length; k += 7) {
        const back = inverseStereo(pts[k])
        fiberPoint(th, ph, CHIS[k]).forEach((v, i) => close(v, back[i], 1e-9))
      }
      // circle through three points: center, radius and plane normal; all others must fit it
      const [a, b, c] = [pts[0], pts[30], pts[60]]
      const sub = (u: V3, v: V3): V3 => [u[0] - v[0], u[1] - v[1], u[2] - v[2]]
      const dot = (u: V3, v: V3) => u[0] * v[0] + u[1] * v[1] + u[2] * v[2]
      const cross = (u: V3, v: V3): V3 => [u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]]
      const ab = sub(b, a)
      const ac = sub(c, a)
      const n = cross(ab, ac)
      const n2 = dot(n, n)
      const t1 = cross(n, ab).map((x) => x * dot(ac, ac))
      const t2 = cross(ac, n).map((x) => x * dot(ab, ab))
      const center: V3 = [a[0] + (t1[0] + t2[0]) / (2 * n2), a[1] + (t1[1] + t2[1]) / (2 * n2), a[2] + (t1[2] + t2[2]) / (2 * n2)]
      const R = Math.hypot(...sub(a, center))
      const nn = Math.sqrt(n2)
      for (const p of pts) {
        close(Math.hypot(...sub(p, center)) / R, 1, 1e-7)
        close(dot(sub(p, center), n) / nn / R, 0, 1e-7)
      }
    }
  })

  it('the fiber through the projection pole (|−z⟩) is the x₃ axis', () => {
    for (const chi of CHIS) {
      const p = fiberPoint3(Math.PI, 0.4, chi)
      if (!p) continue // the pole itself
      close(p[0], 0, 1e-12)
      close(p[1], 0, 1e-12)
    }
    expect(stereo([0, 0, 0, 1])).toBeNull()
  })

  it('clamping: base-point fibers are closed at rClamp = 6; the |−z⟩ fiber is clipped to −6 ≤ p₃ ≤ 6', () => {
    for (const b of basePoints(128)) {
      const s = fiberSpan(b.theta, b.phi, 6)
      expect(s.closed).toBe(true)
      expect(s.clipped).toBe(false)
    }
    const line = fiberSpan(Math.PI, 0, 6)
    expect(line.closed).toBe(false)
    expect(line.empty).toBe(false)
    const ends = [fiberPoint3(Math.PI, 0, line.chi0)!, fiberPoint3(Math.PI, 0, line.chi1)!]
    close(Math.abs(ends[0][2]), 6, 1e-6)
    close(Math.abs(ends[1][2]), 6, 1e-6)
    expect(Math.sign(ends[0][2])).not.toBe(Math.sign(ends[1][2]))
    for (let k = 0; k <= 200; k++) {
      const p = fiberPoint3(Math.PI, 0, line.chi0 + ((line.chi1 - line.chi0) * k) / 200)!
      expect(Math.hypot(...p)).toBeLessThanOrEqual(6 + 1e-6)
    }
    // a big circle near the pole is cut into one arc whose ends sit on the clamp sphere
    const big = fiberSpan(Math.PI - 0.05, 0.3, 6)
    expect(big.clipped).toBe(true)
    close(Math.hypot(...fiberPoint3(Math.PI - 0.05, 0.3, big.chi0)!), 6, 1e-6)
    close(Math.hypot(...fiberPoint3(Math.PI - 0.05, 0.3, big.chi1)!), 6, 1e-6)
  })

  it('picture sizes: ≥ 64 and ≥ 128 base points, none at the projection pole θ = π', () => {
    expect(basePoints(64).length).toBe(64)
    expect(basePoints(128).length).toBe(128)
    for (const b of basePoints(128)) expect(b.theta).toBeLessThan(Math.PI - 0.5)
  })

  it('any two distinct fibers link exactly once (Gauss linking integral ≈ ±1)', () => {
    const loop = (th: number, ph: number) => Array.from({ length: 400 }, (_, k) => fiberPoint3(th, ph, (k / 400) * TAU)!)
    const pairs: [number, number, number, number][] = [
      [0, 0, 1.2, 0.7], // |+z⟩ fiber (unit circle) with a generic fiber
      [0.8, 0, 0.8, 1.5], // same latitude
      [0.35, 2, 2.1, -1], // different latitudes
    ]
    for (const [t1, p1, t2, p2] of pairs) close(Math.abs(linkingNumber(loop(t1, p1), loop(t2, p2))), 1, 2e-2)
    // control: two copies of nearby-but-separate unlinked circles in a plane give 0
    const ring = (cx: number) => Array.from({ length: 200 }, (_, k): V3 => [cx + Math.cos((k / 200) * TAU), Math.sin((k / 200) * TAU), 0])
    close(linkingNumber(ring(0), ring(3)), 0, 1e-6)
  })
})

describe('fiberPolyline and the χ / φ distinction (decision L1 #15)', () => {
  it('closed fibers: n points on the fiber, all inside the clamp, each over the same Bloch point', () => {
    const [th, ph] = [1.1, 0.4]
    const pts = fiberPolyline(th, ph, 6, 64)
    expect(pts.length).toBe(64)
    const r0 = blochPoint(th, ph)
    for (const p of pts) {
      expect(Math.hypot(...p)).toBeLessThanOrEqual(6 + 1e-9)
      const r = hopfMap(inverseStereo(p))
      for (let k = 0; k < 3; k++) close(r[k], r0[k], 1e-9)
    }
  })

  it('open arcs end on the clamp sphere; the |−z⟩ fiber is the p₃ axis segment', () => {
    const pts = fiberPolyline(Math.PI, 0, 6, 50)
    expect(pts.length).toBe(50)
    close(Math.hypot(...pts[0]), 6, 1e-6)
    close(Math.hypot(...pts[pts.length - 1]), 6, 1e-6)
    for (const p of pts) {
      close(p[0], 0, 1e-9)
      close(p[1], 0, 1e-9)
    }
    expect(fiberPolyline(0.5, 0, 6, 1)).toEqual([])
  })

  it('χ = 0°, 360° and 720° are the same point of S³ (the same state vector)', () => {
    const a = fiberPoint(0.9, 0.3, 0)
    for (const chi of [TAU, 2 * TAU]) {
      const b = fiberPoint(0.9, 0.3, chi)
      for (let k = 0; k < 4; k++) close(a[k], b[k], 1e-12)
    }
  })

  it('rotation angle φ: R_z(φ)|+z⟩ = e^{−iφ/2}|+z⟩, so φ = 360° gives −|+z⟩ and φ = 720° gives |+z⟩', () => {
    const at = (phiRot: number) => fiberPoint(0, 0, -phiRot / 2) // bead position after R_z(φ)
    const start = at(0)
    const half = at(TAU)
    const full = at(2 * TAU)
    for (let k = 0; k < 4; k++) {
      close(half[k], -start[k], 1e-12)
      close(full[k], start[k], 1e-12)
    }
  })
})
