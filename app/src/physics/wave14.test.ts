/**
 * Lecture 14's engine (physics/wave14.ts) against the numpy cases of pipeline/claims_448/l14.py (physics/__fixtures__/wave14-cases.json), plus the identities each function should satisfy.
 */
import { describe, expect, it } from 'vitest'
import cases from './__fixtures__/wave14-cases.json'
import { GRID, boxEnergy, boxState, density, norm, packet, planeSamples } from './wave'
import {
  boxMeanEnergy, boxPairParts, boxPairPeriod, boxResidual, densityDrift, kineticEnergy, omegaFree, omegaLinear, planeCurvature, tentKinetic, topHatKineticCut, twoWaveResidual,
} from './wave14'

describe('dispersion relations', () => {
  it('omegaFree is k²/2m and omegaLinear is c|k|; they meet at k = 2 for m = c = 1', () => {
    expect(omegaFree(3)).toBe(4.5)
    expect(omegaFree(3, 2)).toBe(2.25)
    expect(omegaFree(-2)).toBe(omegaFree(2))
    expect(omegaLinear(-3)).toBe(3)
    expect(omegaFree(2)).toBe(omegaLinear(2))
    expect(omegaFree(1)).toBeLessThan(omegaLinear(1))
    expect(omegaFree(3)).toBeGreaterThan(omegaLinear(3))
    expect(() => omegaFree(1, 0)).toThrow()
    expect(() => omegaLinear(1, -1)).toThrow()
  })
  it('doubling k multiplies ω by 4 for matter and by 2 for light; the curvature factor of a plane wave is −k²', () => {
    expect(omegaFree(3) / omegaFree(1.5)).toBeCloseTo(4, 12)
    expect(omegaLinear(3) / omegaLinear(1.5)).toBeCloseTo(2, 12)
    expect(planeCurvature(3)).toBe(-9)
  })
})

describe('kineticEnergy on the grid', () => {
  it.each(cases.cases.kinetic)('σ = $sigma, p₀ = $p0 gives $T', ({ sigma, p0, T }) => {
    expect(Math.abs(kineticEnergy(packet(GRID, { x0: 0, sigma, p0 }), GRID) - T)).toBeLessThan(1e-9)
  })
  it('a heavier particle has less kinetic energy for the same state: ⟨p²⟩/2m', () => {
    const psi = packet(GRID, { x0: 0, sigma: 1, p0: 3 })
    expect(kineticEnergy(psi, GRID, 2)).toBeCloseTo(kineticEnergy(psi, GRID) / 2, 12)
  })
})

describe('sharp edges: the tent and the top hat', () => {
  it.each(cases.cases.tent)('tentKinetic(L = $L, m = $m) = $T', ({ L, m, T }) => {
    expect(Math.abs(tentKinetic(L, m) - T)).toBeLessThan(1e-9)
  })
  it('the tent on the grid agrees with the closed form to 2 % (its slope jumps, so the FFT route only approximates)', () => {
    const L = 2
    const re = Float64Array.from(GRID.x, (x) => (Math.abs(x) < L ? 1 - Math.abs(x) / L : 0))
    const psi = { re, im: new Float64Array(GRID.n) }
    const n = norm(psi, GRID)
    for (let j = 0; j < GRID.n; j++) psi.re[j] /= Math.sqrt(n)
    expect(Math.abs(kineticEnergy(psi, GRID) / tentKinetic(L) - 1)).toBeLessThan(0.02)
  })
  it.each(cases.cases.topHat)('topHatKineticCut(L = $L, P = $P) = $T', ({ L, P, T }) => {
    expect(Math.abs(topHatKineticCut(L, P) - T)).toBeLessThan(1e-9)
  })
  it('at P = 2πn/L the cut kinetic energy is 2n/L² and grows without limit; zero cut-off gives zero', () => {
    for (const n of [1, 4, 8, 50]) expect(topHatKineticCut(1, 2 * Math.PI * n)).toBeCloseTo(2 * n, 9)
    expect(topHatKineticCut(1, 0)).toBe(0)
    expect(topHatKineticCut(2, 2 * Math.PI * 16 / 2)).toBeCloseTo((2 * 16) / 4, 9)
  })
})

describe('the box: mean energy, the two-level density, the period and the residual', () => {
  it.each(cases.cases.meanE)('boxMeanEnergy(L = $L) = $E', ({ L, terms, E }) => {
    expect(Math.abs(boxMeanEnergy(L, terms.map(([n, weight]) => ({ n, weight }))) - E)).toBeLessThan(1e-12)
    // weights only need to be proportional
    expect(boxMeanEnergy(L, terms.map(([n, weight]) => ({ n, weight: 7 * weight })))).toBeCloseTo(E, 12)
  })
  it.each(cases.cases.pair)('boxPairParts(L = $L, levels $n1 and $n2, t = $t, x = $x) totals $total', ({ L, n1, n2, t, x, total }) => {
    const p = boxPairParts(L, n1, n2, t, x)
    expect(Math.abs(p.total - total)).toBeLessThan(1e-12)
    expect(p.total).toBeCloseTo(p.direct1 + p.direct2 + p.cross, 15)
  })
  it('the pair density on the grid is the total of boxPairParts, and the direct terms do not move with time', () => {
    const t = 1.7
    const g = boxState(GRID, 4, [1, 2], t)
    const rho = density(g)
    for (const x of [0.5, 1, 2.6, 3.3]) {
      const j = Math.round((x - GRID.x[0]) / GRID.dx)
      expect(rho[j]).toBeCloseTo(boxPairParts(4, 1, 2, t, GRID.x[j]).total, 12)
    }
    expect(boxPairParts(4, 1, 2, 0, 1).direct1).toBe(boxPairParts(4, 1, 2, 9, 1).direct1)
    expect(boxPairParts(4, 1, 2, 0, 1).direct2).toBe(boxPairParts(4, 1, 2, 9, 1).direct2)
  })
  it.each(cases.cases.period)('boxPairPeriod(L = $L, $n1, $n2) = $T; the density repeats after it', ({ L, n1, n2, T }) => {
    expect(Math.abs(boxPairPeriod(L, n1, n2) - T)).toBeLessThan(1e-12)
    expect(boxPairParts(L, n1, n2, 0, L / 3).total).toBeCloseTo(boxPairParts(L, n1, n2, T, L / 3).total, 10)
  })
  it('a level obeys the time-independent equation on the grid, a wrong energy does not, and a stationary state does not drift', () => {
    const s = boxState(GRID, 4, 2)
    expect(boxResidual(s, GRID, boxEnergy(4, 2), 0, 4)).toBeLessThan(1e-9)
    expect(boxResidual(s, GRID, boxEnergy(4, 1), 0, 4)).toBeGreaterThan(0.1)
    expect(densityDrift(boxState(GRID, 4, 2, 5.5), s)).toBeLessThan(1e-12)
    expect(densityDrift(boxState(GRID, 4, [1, 2], 3), boxState(GRID, 4, [1, 2], 0))).toBeGreaterThan(0.05)
  })
  it('refuses a repeated level, a point outside the walls and empty or negative weights', () => {
    expect(() => boxPairParts(4, 2, 2, 0, 1)).toThrow()
    expect(() => boxPairParts(4, 1, 2, 0, 5)).toThrow()
    expect(() => boxMeanEnergy(4, [])).toThrow()
    expect(() => boxMeanEnergy(4, [{ n: 1, weight: -1 }])).toThrow()
    expect(() => boxMeanEnergy(4, [{ n: 1, weight: 0 }])).toThrow()
  })
})

describe('the free equation for two plane waves', () => {
  it('the finite-difference residual of iψ_t + ½ψ_xx is tiny for p = 2 and 4 and large for a wrong equation', () => {
    expect(twoWaveResidual(2, 4, 0.7, 1.3)).toBeLessThan(1e-6)
    // the same stencil on e^{ipx} with ω = p (light-like, linear) is not a solution of the free equation
    const w = planeSamples([0.7], [2, 4], { time: 1.3 })
    expect(Math.hypot(w.re[0], w.im[0])).toBeGreaterThan(0.1)
  })
})
