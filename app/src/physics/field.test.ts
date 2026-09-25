import { describe, expect, it } from 'vitest'
import { gradientFalloff, POLE, SILVER, type SGParams, sgDeflection, sgTrajectoryZ, streamlines } from './field'

const close = (a: number, b: number, rel = 1e-12) => expect(Math.abs(a - b)).toBeLessThanOrEqual(rel * Math.max(1, Math.abs(a), Math.abs(b)))

// Stern–Gerlach 1922-like numbers (order of magnitude only; P chooses the on-screen sets as Claims).
const P0: SGParams = { muZ: SILVER.muB, dBdz: 1e3, m: SILVER.m, v: 550, L: 0.035, D: 0.0 }

describe('SG deflection (field.ts)', () => {
  it('is linear in μ_z and in ∂B/∂z, and scales as 1/v²', () => {
    const d = sgDeflection(P0)
    close(sgDeflection({ ...P0, muZ: 2 * P0.muZ }), 2 * d)
    close(sgDeflection({ ...P0, muZ: -P0.muZ }), -d)
    close(sgDeflection({ ...P0, dBdz: 3 * P0.dBdz }), 3 * d)
    close(sgDeflection({ ...P0, v: 2 * P0.v }), d / 4)
  })

  it('the trajectory is continuous in value and slope at the magnet exit and lands on sgDeflection', () => {
    const p = { ...P0, D: 0.2 }
    const h = 1e-9
    const L = p.L
    close(sgTrajectoryZ(p, L - h), sgTrajectoryZ(p, L + h), 1e-6)
    const slopeIn = (sgTrajectoryZ(p, L) - sgTrajectoryZ(p, L - 1e-6)) / 1e-6
    const slopeOut = (sgTrajectoryZ(p, L + 1e-6) - sgTrajectoryZ(p, L)) / 1e-6
    close(slopeIn, slopeOut, 1e-4)
    close(sgTrajectoryZ(p, L + p.D), sgDeflection(p), 1e-12)
    expect(sgTrajectoryZ(p, -1)).toBe(0)
  })

  it('silver in a 1000 T/m gradient over 3.5 cm is deflected by a fraction of a millimetre (sanity)', () => {
    const dz = sgDeflection(P0)
    expect(dz).toBeGreaterThan(1e-5)
    expect(dz).toBeLessThan(1e-3)
  })
})

describe('streamlines (qualitative)', () => {
  it('9 lines by default, starting at the knife tip and ending on the lower pole, deterministic', () => {
    const a = streamlines(0.5)
    expect(a.length).toBe(9)
    expect(streamlines(0.5)).toEqual(a)
    for (const line of a) {
      expect(line.length).toBe(24)
      expect(Math.abs(line[0][2] - POLE.tipZ)).toBeLessThanOrEqual(POLE.tipR + 1e-12)
      expect(line[line.length - 1][2]).toBeLessThan(POLE.shoulderZ + 0.02)
      for (const p of line) expect(p[1]).toBe(0.5)
    }
  })

  it('lines are packed near the knife: the central gap is the smallest', () => {
    const ends = streamlines(0).map((l) => l[l.length - 1][0])
    const gaps = ends.slice(1).map((x, i) => x - ends[i])
    for (const g of gaps) expect(g).toBeGreaterThan(0)
    expect(Math.min(...gaps)).toBe(gaps[Math.floor(gaps.length / 2)])
  })

  it('uniform field: parallel vertical lines 0.2 apart', () => {
    const u = streamlines(0, { field: 'uniform' })
    expect(u.length).toBe(9)
    close(u[1][0][0] - u[0][0][0], 0.2)
    for (const line of u) close(line[0][0], line[line.length - 1][0])
  })

  it('gradient falloff is 1 on axis and 0.45 at the beam edge', () => {
    expect(gradientFalloff(0)).toBe(1)
    close(gradientFalloff(1), 0.45)
    close(gradientFalloff(-1), 0.45)
  })
})
