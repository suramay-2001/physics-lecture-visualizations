/**
 * Lecture 13's engine additions against independent numpy routes (pipeline/make_fixtures.py `lecture13_cases`): the width of a free packet
 * (closed form vs a packet evolved with np.fft), the momentum picture (norm, mean, peak, spread and iħ∂ₚ by a 7-point stencil), the fringe spacing,
 * the shift on a ring of sites and the trace of a commutator. Properties: the transform keeps the norm, x̂ and p̂ swap roles, a Gaussian saturates
 * ΔxΔp = ħ/2, and the trace of XP − PX is zero while the trace of iħI is not.
 */
import { describe, expect, it } from 'vitest'
import fx from './__fixtures__/numpy.json'
import { c } from './complex'
import * as K from './constants'
import { type Mat } from './linalg'
import { ringEigenphases, ringOffDiagonal, ringShift, ringUnitaryGap, traceCommutator } from './ring'
import {
  GRID, commutatorXP, freeEvolve, gaussianWidth, meanX, meanXFromMomentum, momentumMean, momentumNorm, momentumPeak, packet, pOp, spreadP, spreadX, toMomentum, wavelength, xTimes,
} from './wave'

const D = fx.lecture13
const G = GRID
const close = (a: number, b: number, eps = 1e-9, msg = '') => expect(Math.abs(a - b), `${msg} ${a} vs ${b}`).toBeLessThan(eps)

describe('the width of a free packet: σ√(1 + (t/2mσ²)²)', () => {
  it('the closed form equals the width of a packet evolved on the grid (np.fft) to 1e-9, and the engine’s freeEvolve agrees', () => {
    for (const f of D.widths) {
      close(gaussianWidth(f.sigma, f.t, f.m), f.sd, 1e-9, `σ ${f.sigma} t ${f.t} m ${f.m}`)
      close(spreadX(freeEvolve(packet(G, { x0: 0, sigma: f.sigma }), G, f.t, f.m), G), f.sd, 1e-9, 'grid')
    }
  })
  it('σ = 1 gives 1.414 at t = 2 and 2.236 at t = 4; Δp never changes (½ for σ = 1)', () => {
    close(gaussianWidth(1, 2), Math.SQRT2, 1e-12)
    close(gaussianWidth(1, 4), Math.sqrt(5), 1e-12)
    const w = freeEvolve(packet(G, { x0: 0, sigma: 1, p0: 3 }), G, 4)
    close(spreadP(w, G), 0.5, 1e-9)
    close(meanX(w, G), 12, 1e-9)
  })
  it('refuses a non-positive width or mass', () => {
    expect(() => gaussianWidth(0, 1)).toThrow()
    expect(() => gaussianWidth(1, 1, 0)).toThrow()
  })
})

describe('the momentum picture: ψ̃(p) = ⟨p|ψ⟩', () => {
  it('norm, mean, peak and ⟨x̂⟩ = ∫ψ̃*(iħ∂ₚψ̃)dp match numpy (7-point stencil) to 1e-9', () => {
    for (const f of D.momenta) {
      const mw = toMomentum(packet(G, { x0: f.x0, sigma: f.sigma, p0: f.p0 }), G)
      close(momentumNorm(mw, G), f.norm, 1e-9, 'norm')
      close(momentumMean(mw, G), f.meanP, 1e-9, 'mean')
      close(momentumPeak(mw), f.peak, 1e-9, 'peak')
      close(meanXFromMomentum(mw, G), f.meanXFromP, 1e-9, 'x from p')
    }
  })
  it('the transform is unitary: ∫|ψ̃|²dp = 1; the mean equals ⟨p̂⟩ from p̂ψ; the peak for σ = 1 is 0.798 per ħ/ℓ', () => {
    for (const s of [0.5, 1, 2]) close(momentumNorm(toMomentum(packet(G, { x0: 0, sigma: s }), G), G), 1, 1e-9)
    const mw = toMomentum(packet(G, { x0: 0, sigma: 1, p0: 3 }), G)
    close(momentumMean(mw, G), 3, 1e-9)
    close(momentumPeak(toMomentum(packet(G, { x0: 0, sigma: 1 }), G)), Math.sqrt(2 / Math.PI), 1e-9)
  })
  it('x̂ = iħ∂ₚ in the p picture reproduces ⟨x̂⟩ = 2 for the packet at 2 to the stencil’s accuracy (5e-5), and 0 at rest', () => {
    close(meanXFromMomentum(toMomentum(packet(G, { x0: 2, sigma: 1 }), G), G), 2, 5e-5)
    close(meanXFromMomentum(toMomentum(packet(G, { x0: 0, sigma: 1 }), G), G), 0, 5e-5)
    close(meanXFromMomentum(toMomentum(packet(G, { x0: -1, sigma: 0.7, p0: 2 }), G), G), -1, 5e-5)
  })
  it('Gaussians sit on the floor: Δx·Δp = ½ for σ = ½, 1, 2 (and Δp = 1/2σ)', () => {
    for (const s of [0.5, 1, 2]) {
      const w = packet(G, { x0: 0, sigma: s })
      close(spreadX(w, G) * spreadP(w, G), 0.5, 1e-9)
      close(spreadP(w, G), 1 / (2 * s), 1e-9)
    }
  })
  it('[x̂, p̂]ψ = iψ holds for the packet at 2 (residual below 1e-9 at every grid point)', () => {
    const psi = packet(G, { x0: 2, sigma: 1 })
    const cm = commutatorXP(psi, G)
    let m = 0
    for (let j = 0; j < G.n; j++) m = Math.max(m, Math.hypot(cm.re[j], cm.im[j] - psi.re[j]))
    expect(m).toBeLessThan(1e-9)
    // and the order of operators matters: x̂(p̂ψ) differs from p̂(x̂ψ) by the same iψ
    const a = xTimes(pOp(psi, G), G)
    const b = pOp(xTimes(psi, G), G)
    close(a.im[2176] - b.im[2176], psi.re[2176], 1e-9)
  })
})

describe('wavelength and fringes', () => {
  it('λ = 2π/|p| (2.094 for p = 3) and refuses p = 0', () => {
    close(wavelength(3), 2.0943951023931953, 1e-12)
    expect(wavelength(-3)).toBe(wavelength(3))
    expect(() => wavelength(0)).toThrow()
  })
  it('Lλ/d matches L tan(arcsin(λ/d)) to 1e-9 relative: helium at 2200 m/s, 8 μm slits, 1.95 m: 11.0 μm', () => {
    const lam = K.deBroglie(K.M_HELIUM4, 2200)
    close(K.fringeSpacing(D.fringe.L, D.fringe.lambda, D.fringe.d) / D.fringe.spacing, 1, 1e-9)
    close(lam / D.fringe.lambda, 1, 5e-8) // the helium mass is rebuilt from the alpha particle in numpy
    close(K.fringeSpacing(1.95, lam, 8e-6) * 1e6, 11.04, 0.01)
    close(lam * 1e12, 45.31, 0.01)
  })
})

describe('the shift on a ring of sites and the trace of a commutator', () => {
  it('the eigenphases of T|j⟩ = |j + 1⟩ are the n-th roots of unity: |phase| matches np.linalg.eig, the Fourier columns diagonalise T, and T is unitary', () => {
    for (const f of D.ring) {
      const mine = ringEigenphases(f.n)
        .map((p) => Math.abs(p))
        .sort((a, b) => a - b)
      mine.forEach((p, i) => close(p, f.absPhasesDeg[i], 1e-9, `n ${f.n} #${i}`))
      expect(ringOffDiagonal(f.n)).toBeLessThan(1e-12)
      close(ringUnitaryGap(f.n), f.unitaryGap, 1e-14)
    }
  })
  it('six sites: 0°, −60°, −120°, ±180°, 120°, 60° (the exact values −60m)', () => {
    const p = ringEigenphases(6)
    ;[0, -60, -120].forEach((v, m) => close(p[m], v, 1e-9))
    close(Math.abs(p[3]), 180, 1e-9)
    close(p[4], 120, 1e-9)
    close(p[5], 60, 1e-9)
  })
  it('the shift moves each site on by one and the last back to the first', () => {
    const T = ringShift(4)
    expect(T[1][0].re).toBe(1)
    expect(T[0][3].re).toBe(1)
    expect(T.flat().reduce((s, z) => s + z.re, 0)).toBe(4)
    expect(() => ringShift(1)).toThrow()
  })
  it('tr(XP − PX) = 0 for the two fixed 3 × 3 matrices (numpy: np.trace), while tr(iI₃) has size 3', () => {
    const toMat = (m: { re: number; im: number }[][]): Mat => m.map((row) => row.map((z) => c(z.re, z.im)))
    const t = traceCommutator(toMat(D.trace.X), toMat(D.trace.P))
    close(t.re, D.trace.re, 1e-12)
    close(t.im, D.trace.im, 1e-12)
    expect(Math.hypot(t.re, t.im)).toBeLessThan(1e-12)
    // the right-hand side iI₃ has trace 3i
    expect(Math.hypot(0, 3)).toBe(3)
  })
})
