/**
 * Optics Lab collisions and clocks: the printed forms the book gets wrong against the numerical barrier (Corrections C9 to C11), the
 * threshold law and the Ramsey fringe. The table against the numpy twin is in cooling.test.ts.
 */
import { describe, expect, it } from 'vitest'
import { CS_D2, NA_D2 } from './cooling'
import * as C from './collisions'

const C6 = C.C6_NA_AU * C.AU_C6
const m = NA_D2.massKg / 2

describe('Langevin barrier (§6.3)', () => {
  it('the corrected Eq. (6.3) equals the numerical top of V(R); the printed form is not an energy and is far off (C9)', () => {
    for (const ell of [1, 2, 3]) {
      const { Vc } = C.langevinBarrier(6, C6, m, ell)
      expect(C.barrierTop(6, C6, m, ell) / Vc).toBeCloseTo(1, 12)
      expect(C.barrierTopPrinted(6, C6, m, ell) / Vc).not.toBeCloseTo(1, 1)
    }
  })
  it('R_c is the maximum of V(R): the potential is lower on both sides', () => {
    const { Rc, Vc } = C.langevinBarrier(6, C6, m, 1)
    expect(C.langevinPotential(6, C6, m, 1, 0.9 * Rc)).toBeLessThan(Vc)
    expect(C.langevinPotential(6, C6, m, 1, 1.1 * Rc)).toBeLessThan(Vc)
  })
  it('σ falls as E^(−2/n), so b_c itself falls as E^(−1/n) (C10)', () => {
    const slope = Math.log(C.thresholdCross(6, C6, m, 2e-30) / C.thresholdCross(6, C6, m, 1e-30)) / Math.log(2)
    expect(slope).toBeCloseTo(-1 / 3, 12)
    expect(slope / 2).toBeCloseTo(-1 / 6, 12)
  })
  it('only s waves pass below the onset temperature: ℓ_c = 1 at T_Q, a Cs onset is lower than Na (heavier, larger C₆)', () => {
    expect(C.partialWaves(6, C6, m, C.quantumOnsetT(6, C6, m))).toBeCloseTo(1, 12)
    expect(C.quantumOnsetT(6, C.C6_CS_AU * C.AU_C6, CS_D2.massKg / 2)).toBeLessThan(C.quantumOnsetT(6, C6, m))
  })
})

describe('clocks, atom optics and units', () => {
  it('the Ramsey fringe: cos²(πΔνT) falls to one half at ±1/4T, so its full width is 1/2T', () => {
    expect(C.ramseyChance(0, 0.35)).toBe(1)
    expect(C.ramseyChance(C.ramseyWidth(0.35) / 2, 0.35)).toBeCloseTo(0.5, 12)
  })
  it('9.19 GHz is 441 mK and a 5.25 m/s kick per atom; Na 17 cm⁻¹ is 24.5 K (C11)', () => {
    expect(C.hzToK(C.CS_HFS_HZ)).toBeCloseTo(0.4412, 3)
    expect(C.releaseSpeed(CS_D2.massKg, 6.62607015e-34 * C.CS_HFS_HZ)).toBeCloseTo(5.25, 2)
    expect(C.wavenumberToK(17)).toBeCloseTo(24.46, 2)
  })
  it('a fountain rising 15 cm above the cavity gives T = 0.350 s; a Na atom at 1000 m/s deflects 58.9 µrad per 2ħk kick', () => {
    expect(C.fountainTime(0.15)).toBeCloseTo(0.35, 3)
    expect(C.kapitzaDiracAngle(NA_D2, 1000, 1) * 1e6).toBeCloseTo(58.9, 1)
  })
})
