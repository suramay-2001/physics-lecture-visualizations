/**
 * Lecture 16's engine (physics/wave16.ts) against the numpy cases of pipeline/claims_448/l16.py (physics/__fixtures__/wave16-cases.json), plus the identities each function should satisfy:
 * the closed-form Gaussian against the grid evolution, Townsend's Eq. 6.76 against the notes' form, the width of a chirped packet against the Heisenberg-picture sum, and Ehrenfest's two
 * equations against the moments they should equal.
 */
import { describe, expect, it } from 'vitest'
import cases from './__fixtures__/wave16-cases.json'
import { HBAR, M_ELECTRON } from './constants'
import { GRID, freeEvolve, gaussianWidth, meanP, meanX, norm, packet, spreadP, spreadX } from './wave'
import { kineticEnergy } from './wave14'
import {
  chirpCovariance, chirpFocus, chirpPacket, chirpSpreadP, chirpWidth, commutatorRate, covarianceXP, gaussianExact, meanOf, momentumSquareMean, spinMeanRate, townsendPacket, widthTime,
} from './wave16'

const POTS: Record<string, (x: number) => number> = { zero: () => 0, harmonic: (x) => 0.5 * x * x, quartic: (x) => 0.25 * x ** 4, linear: (x) => 0.3 * x }
const gap = (a: { re: Float64Array; im: Float64Array }, b: { re: Float64Array; im: Float64Array }) => {
  let w = 0
  for (let j = 0; j < a.re.length; j++) w = Math.max(w, Math.hypot(a.re[j] - b.re[j], a.im[j] - b.im[j]))
  return w
}

describe('the closed-form free Gaussian', () => {
  it.each(cases.cases.exact)('gaussianExact(x0 = $x0, σ = $s, p0 = $p0, t = $t, m = $m) is the numpy closed form at six points and sits $fft from the FFT evolution', ({ x0, s, p0, t, m, idx, re, im, fft }) => {
    const w = gaussianExact(GRID, { x0, sigma: s, p0 }, t, m)
    idx.forEach((j, i) => {
      expect(Math.abs(w.re[j] - re[i]), `re ${j}`).toBeLessThan(1e-12)
      expect(Math.abs(w.im[j] - im[i]), `im ${j}`).toBeLessThan(1e-12)
    })
    expect(Math.abs(gap(w, freeEvolve(packet(GRID, { x0, sigma: s, p0 }), GRID, t, m)) - fft)).toBeLessThan(1e-11)
  })
  it('at t = 0 it is the initial packet exactly; the density stays normalised and its centre is x₀ + p₀t/m', () => {
    expect(gap(gaussianExact(GRID, { x0: 1, sigma: 0.8, p0: 2 }, 0), packet(GRID, { x0: 1, sigma: 0.8, p0: 2 }))).toBe(0)
    const w = gaussianExact(GRID, { x0: 0, sigma: 1, p0: 3 }, 4)
    expect(norm(w, GRID)).toBeCloseTo(1, 12)
    expect(meanX(w, GRID)).toBeCloseTo(12, 9)
    expect(spreadX(w, GRID)).toBeCloseTo(Math.sqrt(5), 8)
    expect(() => gaussianExact(GRID, { x0: 0, sigma: 0 }, 1)).toThrow()
  })
  it('the width is σ√(1 + (t/t_s)²) at three times, and the peak falls as 1/√(1 + τ²) with the area fixed', () => {
    for (const t of [1, 2, 4]) expect(spreadX(gaussianExact(GRID, { x0: 0, sigma: 1 }, t), GRID)).toBeCloseTo(gaussianWidth(1, t), 9)
    const peak = (w: { re: Float64Array; im: Float64Array }) => Math.max(...Array.from(w.re, (r, j) => r * r + w.im[j] * w.im[j]))
    expect(peak(gaussianExact(GRID, { x0: 0, sigma: 1 }, 2)) / peak(gaussianExact(GRID, { x0: 0, sigma: 1 }, 0))).toBeCloseTo(Math.SQRT1_2, 9)
  })
  it.each(cases.cases.townsend)('townsendPacket(a = $a, t = $t, m = $m) is the numpy complex form of Eq. 6.76', ({ a, t, m, idx, re, im }) => {
    const w = townsendPacket(GRID, a, t, m)
    idx.forEach((j, i) => {
      expect(Math.abs(w.re[j] - re[i])).toBeLessThan(1e-12)
      expect(Math.abs(w.im[j] - im[i])).toBeLessThan(1e-12)
    })
  })
  it('with a = √2 σ Townsend’s form is the notes’ form (same state, x₀ = p₀ = 0)', () => {
    expect(gap(townsendPacket(GRID, Math.SQRT2, 2), gaussianExact(GRID, { x0: 0, sigma: 1 }, 2))).toBeLessThan(1e-12)
    expect(gap(townsendPacket(GRID, 1.3, 1.5, 2), gaussianExact(GRID, { x0: 0, sigma: 1.3 / Math.SQRT2 }, 1.5, 2))).toBeLessThan(1e-12)
    expect(() => townsendPacket(GRID, 0, 1)).toThrow()
  })
})

describe('the chirped packet', () => {
  it.each(cases.cases.chirpMoments)('chirpPacket(x₀ = $x0, σ = $s, p₀ = $p0, β = $b): Δp = $dp and C_xp = $cov', ({ x0, s, p0, b, dp, cov }) => {
    const psi = chirpPacket(GRID, { x0, sigma: s, p0, beta: b })
    expect(Math.abs(spreadP(psi, GRID) - dp)).toBeLessThan(1e-9)
    expect(Math.abs(covarianceXP(psi, GRID) - cov)).toBeLessThan(1e-9)
    expect(Math.abs(chirpSpreadP(s, b) - dp)).toBeLessThan(1e-8)
    expect(Math.abs(chirpCovariance(s, b) - cov)).toBeLessThan(1e-8)
    expect(norm(psi, GRID)).toBeCloseTo(1, 12)
  })
  it.each(cases.cases.chirpWidth)('chirpWidth(σ = $s, β = $b, t = $t, m = $m) = $v (FFT evolution)', ({ s, b, t, m, v }) => {
    expect(Math.abs(chirpWidth(s, b, t, m) - v)).toBeLessThan(1e-8)
    expect(Math.abs(spreadX(freeEvolve(chirpPacket(GRID, { x0: 0, sigma: s, beta: b }), GRID, t, m), GRID) - v)).toBeLessThan(1e-12)
  })
  it('β = 0 is the plain Gaussian width and a negative chirp narrows first: the focus time is −mC/(Δp)², the narrowest width √(σ² − C²/(Δp)²), and the packet returns to σ at twice that time', () => {
    expect(chirpWidth(1, 0, 3)).toBeCloseTo(gaussianWidth(1, 3), 12)
    const f = chirpFocus(1, -0.2)
    expect(f.time).toBeCloseTo(0.4 / 0.41, 12)
    expect(f.width).toBeCloseTo(Math.sqrt(1 - 0.16 / 0.41), 12)
    expect(chirpWidth(1, -0.2, 2 * f.time)).toBeCloseTo(1, 12)
    expect(chirpWidth(1, -0.2, f.time)).toBeLessThan(chirpWidth(1, -0.2, f.time + 0.05))
    expect(chirpWidth(1, -0.2, f.time)).toBeLessThan(chirpWidth(1, -0.2, f.time - 0.05))
    expect(chirpFocus(1, 0.2).time).toBe(0) // a positive chirp only widens
    expect(() => chirpWidth(0, 0, 1)).toThrow()
  })
  it('the covariance is zero for an unchirped Gaussian, whatever x₀ and p₀', () => {
    expect(Math.abs(covarianceXP(packet(GRID, { x0: 1.5, sigma: 0.7, p0: -2 }), GRID))).toBeLessThan(1e-12)
  })
})

describe('Ehrenfest’s rate law applied to x̂ and p̂', () => {
  it.each(cases.cases.rate)('commutatorRate($V, x₀ = $x0, σ = $s, p₀ = $p0, $which, m = $m) = $v', ({ V, x0, s, p0, which, m, v }) => {
    const psi = packet(GRID, { x0, sigma: s, p0 })
    expect(Math.abs(commutatorRate(psi, GRID, POTS[V], which as 'x' | 'p', m) - v)).toBeLessThan(1e-9)
  })
  it('d⟨x⟩/dt = ⟨p⟩/m for every potential, and d⟨p⟩/dt = −⟨V′⟩ (harmonic −⟨x⟩, quartic −⟨x³⟩, constant force F)', () => {
    const psi = packet(GRID, { x0: 2, sigma: 1, p0: 1.5 })
    for (const name of Object.keys(POTS)) expect(commutatorRate(psi, GRID, POTS[name], 'x')).toBeCloseTo(meanP(psi, GRID), 9)
    expect(commutatorRate(psi, GRID, POTS.harmonic, 'p')).toBeCloseTo(-meanOf(psi, GRID, (x) => x), 9)
    expect(commutatorRate(psi, GRID, POTS.quartic, 'p')).toBeCloseTo(-meanOf(psi, GRID, (x) => x ** 3), 9)
    expect(commutatorRate(psi, GRID, POTS.linear, 'p')).toBeCloseTo(-0.3, 9)
    expect(commutatorRate(psi, GRID, POTS.zero, 'p')).toBeCloseTo(0, 9)
    expect(() => commutatorRate(psi, GRID, POTS.zero, 'x', 0)).toThrow()
  })
  it('the force at the mean is not the mean force: for x⁴/4 at x₀ = 1, σ = ½ the mean of x³ is x₀³ + 3x₀σ², not x₀³', () => {
    const psi = packet(GRID, { x0: 1, sigma: 0.5 })
    expect(meanOf(psi, GRID, (x) => x ** 3)).toBeCloseTo(1.75, 9)
    expect(meanX(psi, GRID) ** 3).toBeCloseTo(1, 9)
    expect(commutatorRate(psi, GRID, POTS.quartic, 'p')).toBeCloseTo(-1.75, 9)
  })
  it.each(cases.cases.spinRate)('spinMeanRate(ωt = $wt) = $v, and it is −sin ωt', ({ wt, v }) => {
    expect(Math.abs(spinMeanRate(wt) - v)).toBeLessThan(1e-12)
    expect(spinMeanRate(wt)).toBeCloseTo(-Math.sin(wt), 12)
  })
})

describe('times, moments and sums', () => {
  it.each(cases.cases.widthTime)('widthTime(σ = $s, ratio = $r, m = $m, ħ = $hbar) = $v', ({ s, r, m, hbar, v }) => {
    expect(Math.abs(widthTime(s, r, m, hbar) / v - 1)).toBeLessThan(1e-12)
  })
  it('the doubling time is √3 t_s; an electron packet of half a nanometre doubles in about 7.5 fs; a ratio of 1 or less is refused', () => {
    expect(widthTime(1, 2)).toBeCloseTo(2 * Math.sqrt(3), 12)
    expect(widthTime(0.5e-9, 2, M_ELECTRON, HBAR) / 1e-15).toBeCloseTo(7.4807, 3)
    expect(() => widthTime(1, 1)).toThrow()
  })
  it('⟨p̂²⟩ is twice the kinetic energy (m = 1) and equals p₀² + 1/4σ² for a Gaussian; meanOf integrates against the density', () => {
    const psi = packet(GRID, { x0: 0, sigma: 0.5, p0: 2 })
    expect(momentumSquareMean(psi, GRID)).toBeCloseTo(5, 9)
    expect(kineticEnergy(psi, GRID)).toBeCloseTo(2.5, 9)
    expect(meanOf(psi, GRID, () => 1)).toBeCloseTo(1, 12)
    expect(meanOf(psi, GRID, (x) => x * x)).toBeCloseTo(0.25, 9)
  })
})
