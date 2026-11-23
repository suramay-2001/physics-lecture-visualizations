/**
 * The experiment track's engine (arrays.ts and the cutoff functions of imaging.ts): limits and anchors that do not depend on the page numbers, plus round trips.
 * The numbers a page prints are checked against their numpy twins by content/claims.test.ts (pipeline/claims_optics/o_track.py).
 */
import { describe, expect, it } from 'vitest'
import { HBAR, K_BOLTZMANN } from '../constants'
import { CS_D2, RB87_D2, scatterRate } from './cooling'
import {
  AU_POLARIZABILITY,
  CS_D1,
  CS_LINES,
  depumpPhotonsOneOverE,
  depumpSurvival,
  fillChance,
  lambDicke,
  loadTimeTo,
  lossBudget,
  motLoad,
  parityDistribution,
  photonsToDepth,
  poissonP1,
  polarizability,
  rayleighLength,
  recoilGainK,
  recoilGainKAt,
  refillEquilibrium,
  refillStep,
  refillTrace,
  sitesNeeded,
  thermalRms,
  trapHeatTime,
  tweezerDepth,
  tweezerFreqs,
  tweezerPotential,
  tweezerScatter,
  waistFromFreqs,
  depthFromRadialFreq,
} from './arrays'
import { bestThreshold, dPrime, emccdBestError, emccdMoments, errorVsExposure, photonBudget, poissonCdf, poissonPmf, thresholdError, toyOptimum } from './imaging'

describe('the MOT fill', () => {
  it('N(t) = Rτ(1 − e^{−t/τ}) rises to Rτ, reaches 1 − 1/e at τ, and the 95 % time is τ ln 20', () => {
    expect(motLoad(1e6, 0.1, 1e3)).toBeCloseTo(1e5, 6)
    expect(motLoad(1, 1, 1)).toBeCloseTo(1 - Math.exp(-1), 14)
    expect(loadTimeTo(0.95, 2)).toBeCloseTo(2 * Math.log(20), 14)
    expect(() => loadTimeTo(1, 1)).toThrow(RangeError)
  })
})

describe('the tweezer', () => {
  const lam = 1061e-9
  it('the Gaussian focus: z_R = π w₀²/λ, and the waist from two frequencies round-trips through the frequencies of a well', () => {
    const w0 = 1.24e-6
    const { fr, fz, zR } = tweezerFreqs(1e-4 * K_BOLTZMANN, CS_D2.massKg, w0, lam)
    expect(zR).toBeCloseTo(rayleighLength(w0, lam), 18)
    expect(waistFromFreqs(fr, fz, lam)).toBeCloseTo(w0, 15)
    expect(fr / fz).toBeCloseTo((Math.SQRT2 * Math.PI * w0) / lam, 12)
  })
  it('the depth of a measured radial frequency fixes the harmonic frequency back', () => {
    const w0 = 1.2e-6
    const U = depthFromRadialFreq(29.3e3, CS_D2.massKg, w0)
    expect(tweezerFreqs(U, CS_D2.massKg, w0, lam).fr).toBeCloseTo(29.3e3, 6)
  })
  it('the potential is −U at the centre, harmonic near it (curvature 4U/w₀²) and falls to e⁻² at r = w₀', () => {
    const U = 1e-27
    const w0 = 1e-6
    expect(tweezerPotential(U, w0, lam, 0)).toBeCloseTo(-U, 40)
    expect(tweezerPotential(U, w0, lam, w0)).toBeCloseTo(-U * Math.exp(-2), 40)
    const h = 1e-9
    expect(((2 * (tweezerPotential(U, w0, lam, h) + U)) / (h * h)) / ((4 * U) / (w0 * w0))).toBeCloseTo(1, 4) // curvature 4U/w₀²
    expect(tweezerPotential(U, w0, lam, 0, rayleighLength(w0, lam))).toBeCloseTo(-U / 2, 40)
  })
  it('the cesium polarizability: about 1,150 au at 1064 nm and 1,165 at 1061 nm (both lines, both rotating terms), the static value near 383 au, and the Grimm (rotating-wave) form is about 9 % lower', () => {
    const au = (l: number) => polarizability(CS_LINES, l) / AU_POLARIZABILITY
    expect(au(1064e-9)).toBeGreaterThan(1140)
    expect(au(1064e-9)).toBeLessThan(1165)
    expect(au(1061e-9)).toBeGreaterThan(au(1064e-9))
    expect(au(1e-3)).toBeGreaterThan(380) // 1 mm ≈ the static limit
    expect(au(1e-3)).toBeLessThan(386)
    // the rotating-wave-only polarizability (the Grimm form) misses the counter-rotating terms
    const om = (2 * Math.PI * 299792458) / lam
    let rwa = 0
    for (const { atom, Jp } of CS_LINES) {
      const w = (2 * Math.PI * 299792458) / atom.lambdaM
      rwa += ((2 * Jp + 1) * atom.gamma) / (w * w * 2 * w * (w - om))
    }
    const rwaAu = (Math.PI * 8.8541878128e-12 * 299792458 ** 3 * rwa) / AU_POLARIZABILITY
    expect(rwaAu / au(1061e-9)).toBeGreaterThan(0.89)
    expect(rwaAu / au(1061e-9)).toBeLessThan(0.93)
  })
  it('the depth is linear in the power and falls as one over the waist squared; it is attractive (positive) below both lines', () => {
    const U = tweezerDepth(1e-3, 1.2e-6, lam)
    expect(U).toBeGreaterThan(0)
    expect(tweezerDepth(2e-3, 1.2e-6, lam)).toBeCloseTo(2 * U, 20)
    expect(tweezerDepth(1e-3, 2.4e-6, lam)).toBeCloseTo(U / 4, 20)
    expect(polarizability(CS_LINES, 800e-9)).toBeLessThan(0) // blue of D1 and D2 the trap repels (between the lines and the cesium resonances it changes sign)
  })
  it('the scattering rate of the trap light falls as one over the detuning squared, so it is far smaller at 1064 than near the D1 line', () => {
    expect(tweezerScatter(1e-3, 1.2e-6, 1061e-9)).toBeLessThan(tweezerScatter(1e-3, 1.2e-6, 950e-9))
    expect(tweezerScatter(2e-3, 1.2e-6, 1061e-9)).toBeCloseTo(2 * tweezerScatter(1e-3, 1.2e-6, 1061e-9), 12)
  })
  it('the heating time is depth/(2E_R R) at the trap photon’s recoil: halving the rate doubles it', () => {
    const U = 1e-28
    expect(trapHeatTime(U, 0.5, CS_D2.massKg, lam)).toBeCloseTo(2 * trapHeatTime(U, 1, CS_D2.massKg, lam), 6)
    expect(recoilGainKAt(852.347e-9, CS_D2.massKg)).toBeCloseTo(recoilGainK(CS_D2), 18)
  })
  it('the Lamb–Dicke parameter and the thermal size: η² is the recoil over the level spacing, and σ² = k_B T/(Mω²)', () => {
    const omega = 2 * Math.PI * 29.3e3
    const k = (2 * Math.PI) / 852.347e-9
    expect(lambDicke(CS_D2.massKg, omega, k) ** 2 / ((HBAR * k * k) / (2 * CS_D2.massKg * omega))).toBeCloseTo(1, 12)
    expect(thermalRms(CS_D2.massKg, omega, 4 * 1e-6) / thermalRms(CS_D2.massKg, omega, 1e-6)).toBeCloseTo(2, 12)
  })
})

describe('loading statistics', () => {
  it('parity projection: P(1) + P(0) = 1, P(1) → ½ from below as μ grows, and it beats the Poisson one-atom chance above μ ≈ 0.3', () => {
    for (const mu of [0.1, 1, 3, 8]) expect(parityDistribution(mu).p0 + parityDistribution(mu).p1).toBeCloseTo(1, 14)
    expect(parityDistribution(8).p1).toBeCloseTo(0.5, 6)
    expect(parityDistribution(1).p1).toBeGreaterThan(poissonP1(1))
    expect(poissonP1(1)).toBeCloseTo(1 / Math.E, 14)
    expect(parityDistribution(0).p1).toBe(0)
  })
  it('a binomial target: the chance to fill M of N is monotone in N and p; sitesNeeded is the first N that reaches the confidence', () => {
    const N = sitesNeeded(100, 0.512, 0.99)
    expect(fillChance(N, 100, 0.512)).toBeGreaterThanOrEqual(0.99)
    expect(fillChance(N - 1, 100, 0.512)).toBeLessThan(0.99)
    expect(fillChance(150, 100, 0.512)).toBeLessThan(fillChance(250, 100, 0.512))
    expect(fillChance(10, 11, 0.5)).toBe(0)
    expect(fillChance(5, 0, 0.3)).toBeCloseTo(1, 14)
    // more sites are needed at a lower loading probability
    expect(sitesNeeded(100, 0.5, 0.99)).toBeGreaterThan(sitesNeeded(100, 0.512, 0.99))
  })
  it('the refilling chain: e → e(1 − q) + (1 − e)ε converges to ε/(q + ε), and the trace starts at the all-empty array', () => {
    const tr = refillTrace(60, 0.01, 0.5)
    expect(tr[0]).toBe(1)
    expect(tr[1]).toBeCloseTo(0.5, 14)
    expect(tr[60]).toBeCloseTo(refillEquilibrium(0.01, 0.5), 12)
    expect(refillStep(refillEquilibrium(0.01, 0.5), 0.01, 0.5)).toBeCloseTo(refillEquilibrium(0.01, 0.5), 14)
  })
  it('the loss budget: N/τ per second and N(1 − S) per image', () => {
    const b = lossBudget(6139, 1374, 0.9998952)
    expect(b.perSecond).toBeCloseTo(6139 / 1374, 12)
    expect(b.perImage).toBeCloseTo(6139 * 1.048e-4, 6)
  })
})

describe('the limits of imaging', () => {
  it('the recoil gain per scattered photon is 2E_R/k_B (198 nK for cesium, 362 nK for rubidium), and the photon count to a depth follows', () => {
    expect(recoilGainK(CS_D2) * 1e9).toBeCloseTo(198.3, 1)
    expect(recoilGainK(RB87_D2) * 1e9).toBeCloseTo(362.0, 0)
    expect(photonsToDepth(1.8e-4, recoilGainK(CS_D2))).toBeCloseTo(907.5, 0)
  })
  it('depumping: (1 − p)^N, and 1/e after about 1/p photons', () => {
    expect(depumpSurvival(0, 3.7e-4)).toBe(1)
    expect(depumpSurvival(depumpPhotonsOneOverE(3.7e-4), 3.7e-4)).toBeCloseTo(1 / Math.E, 12)
    expect(depumpPhotonsOneOverE(1e-4)).toBeCloseTo(1e4, -1)
  })
  it('anchor: rubidium at s = 0.1 on resonance for 1 ms scatters about 1,733 photons (the book’s saturation convention; the paper quotes about 2,000)', () => {
    const b = photonBudget(RB87_D2, 0.1, 0, 1, 1e-3)
    expect(b.scattered).toBeGreaterThan(1700)
    expect(b.scattered).toBeLessThan(1760)
    expect(scatterRate(CS_D1, 1, 0)).toBeCloseTo(CS_D1.gamma / 4, 6)
  })
})

describe('the cutoff on counts', () => {
  it('thresholdError at cutoff 0 calls everything an atom, the error is the mean of the two misreads, and the tails match the Poisson cdf', () => {
    expect(thresholdError(5, 1, 0)).toEqual({ err: 0.5, eb: 0, ed: 1 })
    const e = thresholdError(9.2, 0.2, 3)
    expect(e.err).toBeCloseTo((e.eb + e.ed) / 2, 15)
    expect(e.eb).toBeCloseTo(poissonCdf(2, 9.2), 13)
    expect(e.ed).toBeCloseTo(1 - poissonCdf(2, 0.2), 13)
    expect(e.ed).toBeCloseTo(0.2 ** 3 * Math.exp(-0.2) / 6 + poissonPmf(4, 0.2) + poissonPmf(5, 0.2) + poissonPmf(6, 0.2) + poissonPmf(7, 0.2) + poissonPmf(8, 0.2) + poissonPmf(9, 0.2), 12)
  })
  it('bestThreshold is a minimum over every cutoff, and equal means can do no better than a coin', () => {
    const b = bestThreshold(9.2, 0.2)
    for (let nc = 0; nc < 20; nc++) expect(thresholdError(9.2, 0.2, nc).err).toBeGreaterThanOrEqual(b.err - 1e-18)
    expect(bestThreshold(4, 4).err).toBeCloseTo(0.5, 10) // nothing to tell apart: the best is cutoff 0 or beyond, error one half
  })
  it('the separation grows as √τ (four times the exposure doubles d′) and the error falls with the exposure', () => {
    const d1 = dPrime(5.4, 0.052)
    const d4 = dPrime(4 * 5.4, 4 * 0.052)
    expect(d4 / d1).toBeCloseTo(2, 12)
    const e50 = errorVsExposure(54.4e3, 0.52e3, 50e-6).err
    const e260 = errorVsExposure(54.4e3, 0.52e3, 260e-6).err
    expect(e260).toBeLessThan(e50 / 100)
    expect(errorVsExposure(54.4e3, 0.52e3, 260e-6).mb).toBeCloseTo((54.4e3 + 0.52e3) * 260e-6, 12)
  })
  it('the EMCCD: excess noise factor 2, and a gain-noise error far above the photon-counting floor for the same means', () => {
    const m = emccdMoments(30, 300)
    expect(m.enf).toBeCloseTo(2, 14)
    expect(m.mean).toBeCloseTo(9000, 9)
    expect(m.variance).toBeCloseTo(2 * 30 * 300 * 300, 6)
    const cam = emccdBestError(30, 0.3, 300, 40).err
    expect(cam).toBeGreaterThan(1e3 * bestThreshold(30, 0.3).err)
    expect(cam).toBeCloseTo(1.75e-4, 6)
  })
  it('the toy optimum balances the misread error against the loss: a larger loss rate gives a shorter best exposure; with no loss it is the longest scanned', () => {
    const a = toyOptimum(54.4e3, 0.52e3, 4)
    const b = toyOptimum(54.4e3, 0.52e3, 40)
    expect(b.tau).toBeLessThan(a.tau)
    expect(toyOptimum(54.4e3, 0.52e3, 0).tau).toBeGreaterThanOrEqual(a.tau)
    expect(a.total).toBeCloseTo(a.misread + (1 - Math.exp(-4 * a.tau)), 14)
  })
})
