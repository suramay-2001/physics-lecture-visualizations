import { describe, expect, it } from 'vitest'
import { apply, norm } from '../physics/linalg'
import { blochVector, KET, rotation, Rz, samePhysicalState } from '../physics/spin'
import { frameView, PHI_STEP, PHI_TURN, wrapDeg } from './frameBench'

const close = (a: readonly number[], b: readonly number[], eps = 1e-12) => a.every((x, i) => Math.abs(x - b[i]) < eps)

describe('frame check model (every number from the engine)', () => {
  it('R_z(φ)|+x⟩ lands on the four equator poles at 0°, 90°, 180°, 270°', () => {
    expect(close(frameView(0).r, [1, 0, 0])).toBe(true)
    expect(close(frameView(90).r, [0, 1, 0])).toBe(true)
    expect(close(frameView(180).r, [-1, 0, 0])).toBe(true)
    expect(close(frameView(270).r, [0, -1, 0])).toBe(true)
    // the same physical states as the engine's named kets
    expect(samePhysicalState(frameView(90).ket, KET['+y'])).toBe(true)
    expect(samePhysicalState(frameView(270).ket, KET['-y'])).toBe(true)
  })

  it('matches the engine directly (R_z = rotation about z; the bead is blochVector of the ket), unit norm', () => {
    for (const d of [0, 15, 37, 90, 200, 359, 360, 541, 719]) {
      const v = frameView(d)
      const direct = apply(rotation([0, 0, 1], (d * Math.PI) / 180), KET['+x'])
      expect(close(v.r, blochVector(direct)), `φ=${d}`).toBe(true)
      expect(close(v.r, blochVector(apply(Rz((d * Math.PI) / 180), KET['+x']))), `φ=${d}`).toBe(true)
      expect(Math.abs(norm(v.ket) - 1)).toBeLessThan(1e-12)
    }
  })

  it('one full turn gives −|+x⟩ (same point, ket sign flipped); two turns give it back', () => {
    const home = frameView(0)
    const once = frameView(360)
    expect(close(once.r, home.r)).toBe(true)
    expect(once.ket[0].re).toBeCloseTo(-Math.SQRT1_2, 12)
    expect(once.ket[1].re).toBeCloseTo(-Math.SQRT1_2, 12)
    expect(once.readouts.slice(2)).toEqual(['ψ₁ = −1/√2', 'ψ₂ = −1/√2'])
    expect(frameView(0).readouts.slice(2)).toEqual(['ψ₁ = 1/√2', 'ψ₂ = 1/√2'])
    expect(wrapDeg(720)).toBe(0)
    expect(PHI_TURN).toBe(720)
  })

  it('readouts: φ, r and the ket (engine values, short forms)', () => {
    expect(frameView(90).readouts).toEqual(['R_z(90°) |+x⟩', 'r = (0, 1, 0)', 'ψ₁ = 1/2 − i/2', 'ψ₂ = 1/2 + i/2'])
    expect(frameView(45).readouts[1]).toBe('r = (0.71, 0.71, 0)')
  })

  it('wrapDeg: whole degrees in [0, 720), junk → 0; the pad steps by 15°', () => {
    expect([wrapDeg(-15), wrapDeg(735), wrapDeg(89.6), wrapDeg(NaN), wrapDeg(Infinity)]).toEqual([705, 15, 90, 0, 0])
    expect(PHI_STEP).toBe(15)
  })
})
