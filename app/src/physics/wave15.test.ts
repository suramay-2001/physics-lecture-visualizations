/**
 * Lecture 15's engine (physics/wave15.ts) against the numpy cases of pipeline/claims_448/l15.py (physics/__fixtures__/wave15-cases.json), plus the identities each function should satisfy
 * and the grid evolution it describes (the packet's centre moves at the group velocity, a component turns by its own phase, the width follows the spreading scale).
 */
import { describe, expect, it } from 'vitest'
import cases from './__fixtures__/wave15-cases.json'
import { H_PLANCK, HBAR, M_ELECTRON, spreadTime } from './constants'
import { GRID, freeEvolve, meanX, packet, spreadX, toMomentum } from './wave'
import { omegaFree } from './wave14'
import {
  componentPhaseDeg, crestSpeed, fringePosition, groupSpeedFromWavelength, groupVelocity, momentaOfEnergy, omegaSecond, pairCarrierSpeed, pairEnvelopeSpeed, phaseVelocity,
  planeDensityVariation, spreadScale,
} from './wave15'

describe('group and phase velocity of the free relation', () => {
  it('v_g = k/m and v_phase = k/2m; the group velocity is twice the phase velocity', () => {
    expect(groupVelocity(3)).toBe(3)
    expect(groupVelocity(4.5, 1.5)).toBe(3)
    expect(groupVelocity(-3)).toBe(-3)
    expect(phaseVelocity(3)).toBe(1.5)
    expect(groupVelocity(3) / phaseVelocity(3)).toBe(2)
    expect(phaseVelocity(-2)).toBe(-1) // a left-moving wave: ω/k is negative with k
    expect(() => groupVelocity(1, 0)).toThrow()
    expect(() => phaseVelocity(0)).toThrow()
  })
  it('the velocity is the derivative of ω(k): a central difference of omegaFree', () => {
    for (const [k, m] of [[3, 1], [1.2, 2], [-2, 0.5]] as const) {
      const h = 1e-4
      expect(Math.abs((omegaFree(k + h, m) - omegaFree(k - h, m)) / (2 * h) - groupVelocity(k, m))).toBeLessThan(1e-8)
    }
  })
  it('ω″ = ħ/m, for any wave number and step', () => {
    expect(omegaSecond()).toBeCloseTo(1, 12)
    expect(omegaSecond(2)).toBeCloseTo(0.5, 12)
    expect(omegaSecond(1, -1.3, 0.25)).toBeCloseTo(1, 12)
    expect(() => omegaSecond(1, 3, 0)).toThrow()
  })
})

describe('two waves', () => {
  it.each(cases.cases.pairEnvelope)('pairEnvelopeSpeed($k1, $k2, m = $m) = $v', ({ k1, k2, m, v }) => {
    expect(Math.abs(pairEnvelopeSpeed(k1, k2, m) - v)).toBeLessThan(1e-12)
    expect(Math.abs(pairEnvelopeSpeed(k1, k2, m) - groupVelocity((k1 + k2) / 2, m))).toBeLessThan(1e-12) // exactly the group velocity at the mean wave number
  })
  it.each(cases.cases.pairCarrier)('pairCarrierSpeed($k1, $k2, m = $m) = $v', ({ k1, k2, m, v }) => {
    expect(Math.abs(pairCarrierSpeed(k1, k2, m) - v)).toBeLessThan(1e-12)
  })
  it('the envelope is the faster of the two for a free particle, the carrier of a close pair is near the phase velocity at k₀', () => {
    expect(pairEnvelopeSpeed(2.8, 3.2)).toBeGreaterThan(pairCarrierSpeed(2.8, 3.2))
    expect(Math.abs(pairCarrierSpeed(2.8, 3.2) - phaseVelocity(3))).toBeLessThan(0.01)
    expect(() => pairEnvelopeSpeed(2, 2)).toThrow()
    expect(() => pairCarrierSpeed(-1, 1)).toThrow()
  })
  it.each(cases.cases.fringe)('fringePosition($p1, $p2) in [$lo, $hi] at t = $t is $x', ({ p1, p2, lo, hi, t, x }) => {
    expect(Math.abs(fringePosition(p1, p2, lo, hi, t) - x)).toBeLessThan(1e-12)
  })
  it('a fringe moves at the envelope speed and the spacing is 2π/Δk; a bracket without a fringe is refused', () => {
    expect((fringePosition(2, 4, 1, 2, 0.5) - fringePosition(2, 4, -0.5, 0.5, 0)) / 0.5).toBeCloseTo(pairEnvelopeSpeed(2, 4), 12)
    expect(fringePosition(2, 4, Math.PI - 0.5, Math.PI + 0.5, 0) - fringePosition(2, 4, -0.5, 0.5, 0)).toBeCloseTo(Math.PI, 12)
    expect(() => fringePosition(2, 4, 0.2, 0.4, 0)).toThrow()
  })
})

describe('a plane wave', () => {
  it.each(cases.cases.crest)('crestSpeed(p = $p, m = $m, dt = $dt) = $v', ({ p, m, dt, v }) => {
    expect(Math.abs(crestSpeed(p, m, dt) - v)).toBeLessThan(1e-12)
    expect(Math.abs(crestSpeed(p, m, dt) - phaseVelocity(p, m))).toBeLessThan(1e-12)
  })
  it('refuses a crest that moves more than a quarter of a wavelength in dt', () => {
    expect(() => crestSpeed(3)).toThrow()
    expect(() => crestSpeed(0)).toThrow()
  })
  it('the density of a momentum eigenstate is flat in x and t', () => {
    const xs = Float64Array.from({ length: 401 }, (_, j) => -8 + j * 0.04)
    expect(planeDensityVariation(1.5, xs, 0.7)).toBeLessThan(1e-12)
    expect(planeDensityVariation(-2.2, xs, 5)).toBeLessThan(1e-12)
  })
  it('momentaOfEnergy gives the two signs of one energy, one momentum at zero and none below', () => {
    expect(momentaOfEnergy(2)).toEqual([-2, 2])
    expect(momentaOfEnergy(0.25, 2)).toEqual([-1, 1])
    expect(momentaOfEnergy(0)).toEqual([0])
    expect(momentaOfEnergy(-1)).toEqual([])
    for (const p of momentaOfEnergy(3.7, 1.3)) expect(omegaFree(p, 1.3)).toBeCloseTo(3.7, 12)
  })
})

describe('evolving a packet component by component', () => {
  it.each(cases.cases.phaseDeg)('componentPhaseDeg(p = $p, t = $t, m = $m) = $deg', ({ p, t, m, deg }) => {
    expect(Math.abs(componentPhaseDeg(p, t, m) - deg)).toBeLessThan(1e-9)
  })
  it('the grid evolution turns the momentum amplitude at a grid momentum by exactly that phase and leaves its size alone', () => {
    const p0 = packet(GRID, { x0: 0, sigma: 1, p0: 1.5 })
    const t = 1.2
    const a = toMomentum(p0, GRID)
    const b = toMomentum(freeEvolve(p0, GRID, t), GRID)
    for (const i of [2000, 2100, 2200, 2300]) {
      const turn = Math.atan2(b.phi.im[i] * a.phi.re[i] - b.phi.re[i] * a.phi.im[i], b.phi.re[i] * a.phi.re[i] + b.phi.im[i] * a.phi.im[i]) // arg(b/a)
      const want = (componentPhaseDeg(a.p[i], t) * Math.PI) / 180
      const diff = Math.atan2(Math.sin(turn - want), Math.cos(turn - want))
      if (Math.hypot(a.phi.re[i], a.phi.im[i]) > 1e-3) expect(Math.abs(diff)).toBeLessThan(1e-9)
      expect(Math.abs(Math.hypot(b.phi.re[i], b.phi.im[i]) - Math.hypot(a.phi.re[i], a.phi.im[i]))).toBeLessThan(1e-12)
    }
  })
  it('the centre of a free packet moves at the group velocity of its mean momentum', () => {
    for (const [p0, m] of [[3, 1], [-3, 1], [4.5, 1.5]] as const) {
      const psi = packet(GRID, { x0: 0, sigma: 1, p0 })
      expect(meanX(freeEvolve(psi, GRID, 2, m), GRID) / 2).toBeCloseTo(groupVelocity(p0, m), 9)
    }
  })
})

describe('the spreading scale', () => {
  it.each(cases.cases.spreadScale)('spreadScale(σ = $sigma, m = $m) = $T', ({ sigma, m, T }) => {
    expect(Math.abs(spreadScale(sigma, m) - T)).toBeLessThan(1e-12)
  })
  it('at t = 2mσ²/ħ a free Gaussian is √2 times as wide on the grid; halving σ quarters the scale', () => {
    const psi = packet(GRID, { x0: 0, sigma: 0.8, p0: 0 })
    expect(spreadX(freeEvolve(psi, GRID, spreadScale(0.8)), GRID) / 0.8).toBeCloseTo(Math.SQRT2, 9)
    expect(spreadScale(0.8) / spreadScale(0.4)).toBeCloseTo(4, 12)
  })
  it("Townsend's T = ma²/ħ is the scale with a = √2σ, in SI and in natural units", () => {
    const a = 1e-10
    expect(spreadScale(a / Math.SQRT2, M_ELECTRON, HBAR) / spreadTime(M_ELECTRON, a)).toBeCloseTo(1, 12)
    expect(spreadScale(1 / Math.SQRT2) / 1).toBeCloseTo(1, 12)
    expect(() => spreadScale(0)).toThrow()
  })
})

describe('SI helpers', () => {
  it.each(cases.cases.groupSpeed)('groupSpeedFromWavelength(m = $m, λ = $lambda) = $v', ({ m, lambda, v }) => {
    expect(Math.abs(groupSpeedFromWavelength(m, lambda) / v - 1)).toBeLessThan(1e-12)
    expect(groupSpeedFromWavelength(m, lambda)).toBeCloseTo(H_PLANCK / (m * lambda), 6)
  })
  it('refuses a non-positive mass or wavelength', () => {
    expect(() => groupSpeedFromWavelength(0, 1e-9)).toThrow()
    expect(() => groupSpeedFromWavelength(M_ELECTRON, -1)).toThrow()
  })
})
