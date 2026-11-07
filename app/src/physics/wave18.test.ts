/**
 * Lecture 18's engine (physics/wave18.ts) against the numpy cases of pipeline/claims_448/l18.py (physics/__fixtures__/wave18-cases.json): the matching conditions solved as linear systems, the
 * momentum average by scipy quad, the exact current by differentiating the closed-form ψ, and a Crank–Nicolson march on a non-periodic grid for the packets; plus the identities each function
 * should satisfy (the matching conditions themselves, R + T = 1, a current that does not depend on x, the average of one and of p).
 */
import { describe, expect, it } from 'vitest'
import cases from './__fixtures__/wave18-cases.json'
import { abs2, c, mul, scale } from './complex'
import { barrierT, barrierThick, probabilityCurrent, stepRT } from './scatter'
import { GRID, density, interval, norm, packet } from './wave'
import { gaussianExact } from './wave16'
import {
  HBAR2_OVER_2M_EV_A2, barrierAmplitudes, barrierInnerCurrent, barrierTMinOverWidth, barrierWidthForT, currentOf, detectorPeak, detectorTotal, evanescentCurrent, gaussianCurrentClosed,
  gaussianDensityClosed, integrate, momentumAverage, penetrationDepth, rigidCurrentPeak, scatterChances, stepEvanescent, stepPenetration, triangularExponent, wkbExponent,
} from './wave18'

const C = cases.cases
const close = (a: number, b: number, eps = 1e-12, msg = '') => expect(Math.abs(a - b), `${msg} ${a} vs ${b}`).toBeLessThan(eps)

describe('integrate: the tanh–sinh rule', () => {
  it('is exact to about 1e−14 for smooth and for square-root-ended integrands', () => {
    close(integrate((x) => Math.sqrt(x), 0, 1), 2 / 3, 1e-14)
    close(integrate((x) => Math.sqrt(1 - x), 0, 1), 2 / 3, 1e-14)
    close(integrate(Math.sin, 0, Math.PI), 2, 1e-14)
    close(integrate(Math.exp, 0, 1), Math.E - 1, 1e-14)
    close(integrate((x) => 1 / Math.sqrt(x), 0, 4), 4, 1e-13)
    expect(integrate(Math.sin, 2, 1)).toBe(0)
  })
})

describe('stepEvanescent: the step below its top', () => {
  it.each(C.evan)('E = $E, V₀ = $V0: k, κ, r and the edge density agree with the 2 × 2 solve to 1e−12', ({ E, V0, k, kappa, r, edge }) => {
    const s = stepEvanescent(E, V0)
    close(s.k, k)
    close(s.kappa, kappa)
    close(s.r.re, r[0])
    close(s.r.im, r[1])
    close(s.edgeDensity, edge)
  })
  it('|r| = 1 at every energy below the top, E = V₀/2 gives r = −i and edge density 2, and the edge density is 4E/V₀', () => {
    for (const E of [0.1, 0.5, 1, 1.9]) {
      const s = stepEvanescent(E, 2)
      close(Math.hypot(s.r.re, s.r.im), 1, 1e-14)
      close(s.edgeDensity, (4 * E) / 2, 1e-13)
    }
    const h = stepEvanescent(2, 4)
    close(h.r.re, 0, 1e-15)
    close(h.r.im, -1, 1e-15)
    close(h.edgeDensity, 2, 1e-14)
    expect(() => stepEvanescent(4, 4)).toThrow()
    expect(() => stepEvanescent(0, 4)).toThrow()
  })
  it('the evanescent wave carries no current at any depth, and its density falls to 1 % of the edge at ln 100/2κ', () => {
    for (const x of [0, 0.3, 1, 2.5]) expect(Math.abs(evanescentCurrent(2, 4, x))).toBeLessThan(1e-15)
    const kappa = stepEvanescent(2, 4).kappa
    close(penetrationDepth(kappa, 0.01), Math.log(100) / (2 * kappa), 1e-15)
    const edge = stepEvanescent(2, 4).edgeDensity
    close(edge * Math.exp(-2 * kappa * penetrationDepth(kappa, 0.01)), 0.01 * edge, 1e-14)
    expect(() => penetrationDepth(0, 0.5)).toThrow()
    expect(() => penetrationDepth(1, 1)).toThrow()
  })
  it('currentOf: a travelling wave carries ħk|D|²/m and the sign follows k; a real function carries none', () => {
    close(currentOf(c(0.6, 0.8), mul(c(0, 2), c(0.6, 0.8))), 2, 1e-15)
    close(currentOf(c(1), c(0, -3)), -3, 1e-15)
    expect(currentOf(c(2), c(5))).toBe(0)
    close(currentOf(c(1), c(0, 2), 2, 3), 3, 1e-15)
  })
})

describe('barrierAmplitudes: the four matching conditions', () => {
  it.each(C.barrier)('E = $E, V₀ = $V0, a = $a (ħ²/2m = $hb2m): B, C, D, F and the current inside agree with the 4 × 4 solve', ({ E, V0, a, hb2m, B, C: CC, D, F, T, inner, k, q }) => {
    const m = 1 / (2 * hb2m)
    const s = barrierAmplitudes(E, V0, a, m, 1)
    close(s.k, k)
    close(s.kappa, q)
    for (const [mine, theirs] of [[s.B, B], [s.C, CC], [s.D, D], [s.F, F]] as const) {
      close(mine.re, theirs[0], 1e-11)
      close(mine.im, theirs[1], 1e-11)
    }
    close(abs2(s.F), T, 1e-12)
    close(barrierInnerCurrent(E, V0, a, m, 1) * m, inner, 1e-11) // the twin's current is per ħ/m
  })
  it('the four continuity equations hold for the returned amplitudes (A = 1), R + T = 1, T agrees with barrierT, and the current inside equals T times the incident one', () => {
    for (const [E, V0, a] of [[2, 4, 0.5], [1, 5, 1.3], [3, 4, 0.2], [0.4, 9, 0.7]] as const) {
      const s = barrierAmplitudes(E, V0, a)
      const { k, kappa: q } = s
      const at = (z: { re: number; im: number }, e: number) => scale(z, e)
      // x = 0: 1 + B = C + D and ik(1 − B) = q(C − D)
      const lhs0 = c(1 + s.B.re, s.B.im)
      const rhs0 = c(s.C.re + s.D.re, s.C.im + s.D.im)
      close(lhs0.re, rhs0.re, 1e-13)
      close(lhs0.im, rhs0.im, 1e-13)
      const slopeL = mul(c(0, k), c(1 - s.B.re, -s.B.im))
      const slopeR = scale(c(s.C.re - s.D.re, s.C.im - s.D.im), q)
      close(slopeL.re, slopeR.re, 1e-13)
      close(slopeL.im, slopeR.im, 1e-13)
      // x = a: Ce^{qa} + De^{−qa} = F and q(Ce^{qa} − De^{−qa}) = ikF
      const inside = c(at(s.C, Math.exp(q * a)).re + at(s.D, Math.exp(-q * a)).re, at(s.C, Math.exp(q * a)).im + at(s.D, Math.exp(-q * a)).im)
      close(inside.re, s.F.re, 1e-13)
      close(inside.im, s.F.im, 1e-13)
      const slopeIn = scale(c(at(s.C, Math.exp(q * a)).re - at(s.D, Math.exp(-q * a)).re, at(s.C, Math.exp(q * a)).im - at(s.D, Math.exp(-q * a)).im), q)
      const slopeOut = mul(c(0, k), s.F)
      close(slopeIn.re, slopeOut.re, 1e-13)
      close(slopeIn.im, slopeOut.im, 1e-13)
      close(abs2(s.B) + abs2(s.F), 1, 1e-13)
      close(abs2(s.F), barrierT(E, V0, a), 1e-13)
      close(barrierInnerCurrent(E, V0, a), abs2(s.F) * k, 1e-13)
    }
  })
  it('a = 0 is no barrier (T = 1, B = 0, F = 1); a wide barrier has T near the thick form', () => {
    const z = barrierAmplitudes(2, 4, 0)
    close(abs2(z.F), 1, 1e-14)
    close(abs2(z.B), 0, 1e-14)
    close(abs2(barrierAmplitudes(2, 4, 3).F) / barrierThick(2, 4, 3), 1, 0.01)
    expect(() => barrierAmplitudes(4, 2, 1)).toThrow()
    expect(() => barrierAmplitudes(2, 4, -1)).toThrow()
  })
})

describe('barrierWidthForT and barrierTMinOverWidth', () => {
  it('the printed 0.68 of Townsend p. 231 needs a = 0.56 Å (SI with brentq in the twin), and the width found gives back the target', () => {
    const m = 9.1093837015e-31
    const hbar = 1.054571817646156e-34
    const eV = 1.602176634e-19
    const a = barrierWidthForT(5 * eV, 10 * eV, 0.68, m, hbar)
    close(a * 1e10, C.widthFor068.a, 1e-9)
    close(barrierT(5 * eV, 10 * eV, a, m, hbar), 0.68, 1e-12)
    close(barrierWidthForT(2, 4, 0.5), Math.acosh(Math.SQRT2) / 2, 1e-12) // E = V₀/2: T = 1/cosh²(κa)
    expect(() => barrierWidthForT(2, 4, 1)).toThrow()
  })
  it('above a barrier with E = 2V₀ the smallest T over the widths is 8/9, at the quarter period, and T = 1 at k′a = π', () => {
    const r = barrierTMinOverWidth(2, 1)
    close(r.T, C.minAbove.T, 1e-9)
    close(r.a, C.minAbove.a, 1e-5)
    close(r.T, 8 / 9, 1e-12)
    close(barrierT(2, 1, C.minAbove.res), 1, 1e-12)
    expect(() => barrierTMinOverWidth(1, 2)).toThrow()
  })
})

describe('momentumAverage: ∫|φ(p)|² f(p) dp', () => {
  it.each(C.average)('$kind for p₀ = $p0, σ = $sigma agrees with scipy quad to 1e−12', ({ p0, sigma, kind, value }) => {
    const f = { stepR: (p: number) => stepRT((p * p) / 2, 6).R, barrierT: (p: number) => barrierT((p * p) / 2, 4, 0.5), one: () => 1, p: (p: number) => p, p2: (p: number) => p * p }[kind as 'stepR']
    close(momentumAverage(p0, sigma, f, kind === 'stepR' ? Math.sqrt(12) : undefined), value, 1e-12)
  })
  it('the weight is one, the mean is p₀, the second moment is p₀² + Δp²; a narrow packet gives the plane-wave R of the middle energy, a broad one converges to it', () => {
    close(momentumAverage(4, 2, () => 1, Math.sqrt(12)), 1, 1e-12)
    close(momentumAverage(4, 2, (p) => p, Math.sqrt(12)), 4, 1e-12)
    close(momentumAverage(4, 2, (p) => p * p, Math.sqrt(12)) - 16, 1 / 16, 1e-12)
    const R = (p: number) => stepRT((p * p) / 2, 6).R
    close(momentumAverage(4, 400, R, Math.sqrt(12)), 1 / 9, 1e-4)
    expect(momentumAverage(4, 2, R, Math.sqrt(12))).toBeGreaterThan(momentumAverage(4, 12, R, Math.sqrt(12)))
    expect(() => momentumAverage(4, 0, R)).toThrow()
  })
})

describe('wkbExponent and triangularExponent', () => {
  it('the triangular barrier of the field-emission problem: the quadrature, the closed form and the twin agree', () => {
    const w = C.wkb
    const m = 1 / (2 * w.hb2m)
    const q = wkbExponent(0, (x) => w.W - w.F * x, 0, w.W / w.F, m, 1)
    close(q, w.exponent, 1e-12)
    close(triangularExponent(w.W, w.F, m, 1), w.exponent, 1e-12)
    close(w.hb2m, HBAR2_OVER_2M_EV_A2, 1e-12)
    expect(() => wkbExponent(0, () => 1, 1, 1)).toThrow()
    expect(() => triangularExponent(-1, 1)).toThrow()
  })
  it('for a square barrier the exponent is 2κa, the exponent of the thick form', () => {
    const kappa = Math.sqrt(2 * (4 - 2))
    close(wkbExponent(2, () => 4, 0, 0.75), 2 * kappa * 0.75, 1e-13)
  })
})

describe('the exact current of a free Gaussian', () => {
  it.each(C.current)('σ = $sigma, p₀ = $p0, x₀ = $x0 at x = $x, t = $t: j and ρ agree with Im(ψ*ψ′) of the closed-form ψ', ({ sigma, p0, x0, x, t, j, rho }) => {
    close(gaussianCurrentClosed(sigma, p0, x0, x, t), j, 1e-13)
    close(gaussianDensityClosed(sigma, p0, x0, x, t), rho, 1e-13)
  })
  it('on the grid, ħ Im(ψ*ψ′)/m with the spectral derivative agrees with the closed form (the gap is about 1e−10), and the continuity equation holds for the closed forms', () => {
    const w = gaussianExact(GRID, { x0: -6, sigma: 3, p0: 2 }, 5)
    const jg = probabilityCurrent(w, GRID)
    let gap = 0
    for (let i = 0; i < GRID.n; i++) gap = Math.max(gap, Math.abs(jg[i] - gaussianCurrentClosed(3, 2, -6, GRID.x[i], 5)))
    expect(gap).toBeLessThan(1e-9)
    const rho = density(w)
    for (let i = 0; i < GRID.n; i++) expect(Math.abs(rho[i] - gaussianDensityClosed(3, 2, -6, GRID.x[i], 5))).toBeLessThan(1e-12)
    // ∂ρ/∂t + ∂j/∂x = 0 by central differences of the closed forms
    const h = 1e-4
    for (const [x, t] of [[0, 3], [4, 5], [-2, 1], [7, 6]] as const) {
      const dRho = (gaussianDensityClosed(3, 2, -6, x, t + h) - gaussianDensityClosed(3, 2, -6, x, t - h)) / (2 * h)
      const dJ = (gaussianCurrentClosed(3, 2, -6, x + h, t) - gaussianCurrentClosed(3, 2, -6, x - h, t)) / (2 * h)
      expect(Math.abs(dRho + dJ)).toBeLessThan(1e-8)
    }
  })
  it('a rigidly translating packet has current peak p₀/(√2π σ) and the exact one, which spreads, is a little lower; a packet at rest with σ → ∞ is rigid; the whole passage carries 1', () => {
    const d = C.detector
    close(rigidCurrentPeak(d.sigma, d.p0), d.p0 / (Math.sqrt(2 * Math.PI) * d.sigma), 1e-15)
    const peak = detectorPeak(d.sigma, d.p0, d.x0, d.xd)
    close(peak.j, d.peak, 1e-12)
    close(peak.t, d.peakTime, 1e-6)
    expect(peak.j).toBeLessThan(rigidCurrentPeak(d.sigma, d.p0))
    expect(peak.j / rigidCurrentPeak(d.sigma, d.p0)).toBeGreaterThan(0.95)
    close(detectorTotal(d.sigma, d.p0, d.x0, d.xd), d.total, 1e-12)
    close(detectorTotal(d.sigma, d.p0, d.x0, d.xd), 1, 1e-12)
    expect(detectorPeak(40, 2, -6, 4).j / rigidCurrentPeak(40, 2)).toBeGreaterThan(0.999)
  })
})

describe('packets at a step and a barrier: the split-step engine against the Crank–Nicolson march', () => {
  it('the packet at the E = 4V₀/3 step at t = 5.5: R and T agree with the non-periodic march to 2e−3, they add to 1, and the weighted R is the late-time limit', () => {
    const s = C.stepRun
    const r = scatterChances(s.x0, s.sigma, s.p0, { step: { V0: s.V0 } }, s.t)
    close(r.reflected, s.left, 2e-3)
    close(r.transmitted, s.right, 2e-3)
    close(r.reflected + r.transmitted, 1, 1e-6)
    const late = C.stepLate
    close(late.left, late.weighted, 5e-4) // the march at t = 12: the two packets are apart and the area is the momentum-space average
    expect(Math.abs(r.reflected - late.weighted)).toBeLessThan(2e-3)
  })
  it('the same packet at the barrier: the area beyond the barrier agrees with the march and is close to the energy-weighted T', () => {
    const b = C.barrierRun
    const r = scatterChances(b.x0, b.sigma, b.p0, { barrier: { V0: b.V0, a: b.a } }, b.t)
    close(r.transmitted, b.beyond, 2e-3)
    close(r.reflected, b.left, 2e-3)
    close(r.reflected + r.transmitted, 1, 5e-3) // a thin slice of chance sits inside the barrier
    close(r.transmitted, momentumAverage(b.p0, b.sigma, (p) => barrierT((p * p) / 2, b.V0, b.a)), 1e-3)
  })
  it('a packet at an infinite step below its top: the chance in x > 0 follows the march every half unit, peaks when the packet arrives, and dies away', () => {
    const l = C.lowRun
    const p = stepPenetration(l.x0, l.sigma, l.p0, l.V0, 9)
    expect(p.times).toEqual(l.times)
    for (let i = 0; i < l.times.length; i++) close(p.right[i], l.right[i], 2e-3, `t = ${l.times[i]}`)
    expect(p.timeOfMax).toBe(4)
    expect(p.maxRight).toBeGreaterThan(0.09)
    expect(p.lateRight).toBeLessThan(1e-3)
    expect(p.maxRight).toBeGreaterThan(50 * p.lateRight)
  })
  it('the evolution conserves the norm and the chances are the spline integral of |ψ|² that the stage reads (readouts)', () => {
    const r = scatterChances(-8, 2, 4, { step: { V0: 6 } }, 2.5)
    expect(r.reflected + r.transmitted).toBeGreaterThan(0.999999)
    const w = packet(GRID, { x0: -8, sigma: 2, p0: 4 })
    close(norm(w, GRID), 1, 1e-12)
    close(interval(w, GRID, -32, 0) + interval(w, GRID, 0, 32), 1, 1e-6)
  })
})
