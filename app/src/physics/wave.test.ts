/**
 * The wavefunction engine (physics/wave.ts), the SI constants (constants.ts) and the many-level evolution (dynamics.ts `levels`) against
 * independent numpy routes (pipeline/make_fixtures.py `lecture12_13_cases`: np.fft, closed-form Gaussians, erf, scipy's CubicSpline, a quadrature
 * of the momentum density, explicit phases), plus properties: translation is ψ(x − a) and a group, waiting is unitary and its group law holds,
 * a boost adds ε to ⟨p⟩, a Gaussian saturates ΔxΔp = ħ/2, the momentum transform keeps the norm and inverts, p̂ is Hermitian and
 * [x̂, p̂]ψ = iψ, N tiny shifts tend to T(a) with a gap that falls like 1/N and are never unitary.
 */
import { describe, expect, it } from 'vitest'
import fx from './__fixtures__/numpy.json'
import { c } from './complex'
import { levels } from './dynamics'
import * as K from './constants'
import {
  GRID, type Wave, boost, cellChances, commutatorXP, copy, dpdx, fft, freeEvolve, fromMomentum, innerProduct, interval, makeGrid, meanP, meanX, meanX2,
  norm, pOp, pOpFD, packet, peakDensity, planeSamples, shiftAndEvolve, spreadP, spreadX, toMomentum, translate, translateBySteps, windowIndices, xTimes,
} from './wave'

const D = fx.lecture12_13
const G = GRID
const close = (a: number, b: number, eps = 1e-9, msg = '') => expect(Math.abs(a - b), `${msg} ${a} vs ${b}`).toBeLessThan(eps)
const atProbes = (w: Wave) => D.probes.map((j) => ({ re: w.re[j], im: w.im[j] }))
const closeProbes = (w: Wave, ref: { re: number[]; im: number[] }, eps = 1e-9, msg = '') =>
  atProbes(w).forEach((z, i) => {
    close(z.re, ref.re[i], eps, `${msg} re[${i}]`)
    close(z.im, ref.im[i], eps, `${msg} im[${i}]`)
  })
const maxDiff = (a: Wave, b: Wave) => {
  let m = 0
  for (let j = 0; j < a.re.length; j++) m = Math.max(m, Math.hypot(a.re[j] - b.re[j], a.im[j] - b.im[j]))
  return m
}
const l2gap = (a: Wave, b: Wave) => {
  let s = 0
  for (let j = 0; j < a.re.length; j++) s += (a.re[j] - b.re[j]) ** 2 + (a.im[j] - b.im[j]) ** 2
  return Math.sqrt(s * G.dx)
}
const P = (x0: number, sigma: number, p0 = 0) => packet(G, { x0, sigma, p0 })

describe('the grid and the FFT', () => {
  it('N = 4096 on [−32, 32): dx = 1/64, the first point is −32, k follows numpy’s fftfreq order', () => {
    expect([G.n, G.length, G.dx, G.x[0], G.x[2048], G.k[0], G.k[1], G.k[2047], G.k[2048], G.k[4095]]).toEqual([4096, 64, 1 / 64, -32, 0, 0, G.dk, 2047 * G.dk, -2048 * G.dk, -G.dk])
  })
  it('the forward transform of a single mode is a spike, and the inverse undoes it', () => {
    const g = makeGrid(64, 64)
    const re = new Float64Array(64)
    const im = new Float64Array(64)
    for (let j = 0; j < 64; j++) {
      re[j] = Math.cos((2 * Math.PI * 5 * j) / 64)
      im[j] = Math.sin((2 * Math.PI * 5 * j) / 64)
    }
    const r0 = re.slice()
    const i0 = im.slice()
    fft(re, im)
    close(re[5], 64, 1e-9)
    close(Math.hypot(re[6], im[6]), 0, 1e-9)
    fft(re, im, true)
    expect(maxDiff({ re, im }, { re: r0, im: i0 })).toBeLessThan(1e-12)
    expect(g.k[33]).toBeCloseTo(-31 * g.dk, 12)
  })
  it('refuses a grid that is not a power of two', () => expect(() => makeGrid(100, 64)).toThrow())
})

describe('packets against numpy: norm, mean and spread of x and p, peak, samples of ψ, xψ, p̂ψ', () => {
  it('matches the fixtures to 1e-9 (the finite-difference p̂ψ to 5e-5)', () => {
    for (const f of D.packets) {
      const w = P(f.x0, f.sigma, f.p0)
      close(norm(w, G), f.norm, 1e-9, 'norm')
      close(meanX(w, G), f.meanX, 1e-9, 'meanX')
      close(spreadX(w, G), f.spreadX, 1e-9, 'spreadX')
      close(meanP(w, G), f.meanP, 1e-9, 'meanP')
      close(spreadP(w, G), f.spreadP, 1e-8, 'spreadP')
      close(peakDensity(w), f.peak, 1e-9, 'peak')
      closeProbes(w, f.psi, 1e-12, 'psi')
      closeProbes(xTimes(w, G), f.xPsi, 1e-12, 'xpsi')
      closeProbes(pOp(w, G), f.pPsi, 1e-9, 'ppsi')
      closeProbes(pOpFD(w, G), f.pPsiFd, 1e-9, 'ppsiFD')
    }
  })
  it('a Gaussian is normalised, centred at x₀, has Δx = σ, ⟨p⟩ = p₀, Δp = ħ/2σ and saturates ΔxΔp = ħ/2', () => {
    for (const [x0, s, p0] of [[0, 1, 0], [2, 0.5, 3], [-1, 2, -1], [0, 0.125, 0]] as const) {
      const w = P(x0, s, p0)
      close(norm(w, G), 1, 1e-12)
      close(meanX(w, G), x0, 1e-10)
      close(spreadX(w, G), s, 1e-10)
      close(meanP(w, G), p0, 1e-9)
      close(spreadP(w, G), 1 / (2 * s), 1e-8)
      close(spreadX(w, G) * spreadP(w, G), 0.5, 1e-8)
    }
  })
  it('⟨x²⟩ = x₀² + σ² (the plan’s l12MeanX2 = 5 for the packet at 2)', () => close(meanX2(P(2, 1), G), 5, 1e-10))
  it('the peak density of a packet of width σ is 1/(σ√2π): 0.399 per ℓ at σ = 1, 1.596 at σ = ¼', () => {
    close(peakDensity(P(0, 1)), 1 / Math.sqrt(2 * Math.PI), 1e-12)
    close(peakDensity(P(0, 0.25)), 1 / (0.25 * Math.sqrt(2 * Math.PI)), 1e-12)
  })
})

describe('p̂ and x̂: −iψ′, multiplication, Hermiticity and the commutator', () => {
  it('p̂ψ = −iψ′ spectrally, and dpdx is its i-times (the analytic derivative of a Gaussian: ψ′ = −(x − x₀)/2σ² ψ + ip₀ψ)', () => {
    const w = P(1, 0.8, 2)
    const p = pOp(w, G)
    const d = dpdx(w, G)
    let worst = 0
    for (let j = 0; j < G.n; j += 37) {
      const x = G.x[j]
      const f = -(x - 1) / (2 * 0.8 * 0.8)
      // ψ′ = (f + i p₀) ψ ;  p̂ψ = −i ψ′
      const dre = f * w.re[j] - 2 * w.im[j]
      const dim = f * w.im[j] + 2 * w.re[j]
      worst = Math.max(worst, Math.hypot(d.re[j] - dre, d.im[j] - dim), Math.hypot(p.re[j] - dim, p.im[j] + dre))
    }
    expect(worst).toBeLessThan(1e-10)
  })
  it('a real wavefunction has an imaginary p̂ψ and ⟨p⟩ = 0 (the plan’s l12PPsiRe1 = 0, l12PPsiIm1 = 0.246)', () => {
    const w = P(0, 1)
    const p = pOp(w, G)
    const j = 2048 + 64 // x = 1
    close(p.re[j], 0, 1e-12)
    close(p.im[j], 0.5 * Math.hypot(w.re[j], w.im[j]), 1e-10)
    close(p.im[j], 0.246, 5e-4)
    close(meanP(w, G), 0, 1e-12)
  })
  it('multiplication by x is Hermitian: ⟨φ|xψ⟩ = ⟨xφ|ψ⟩ (residual 0 for two different packets)', () => {
    const a = P(-1, 1)
    const b = P(1.5, 0.7)
    const l = innerProduct(a, xTimes(b, G), G)
    const r = innerProduct(xTimes(a, G), b, G)
    close(l.re, r.re, 1e-13)
    close(l.im, r.im, 1e-13)
  })
  it('p̂ is Hermitian: ⟨φ|p̂ψ⟩ = ⟨p̂φ|ψ⟩ for two packets', () => {
    const a = P(-1, 1, 2)
    const b = P(1, 1, 3)
    const l = innerProduct(a, pOp(b, G), G)
    const r = innerProduct(pOp(a, G), b, G)
    close(l.re, r.re, 1e-11)
    close(l.im, r.im, 1e-11)
  })
  it('[x̂, p̂]ψ = iψ at every probe for a smooth localised ψ (ħ = 1)', () => {
    const w = P(2, 1, 1)
    const comm = commutatorXP(w, G)
    const j = 2048 + 128
    close(comm.re[j], -w.im[j], 1e-9)
    close(comm.im[j], w.re[j], 1e-9)
    expect(maxDiff(comm, { re: w.im.map((v) => -v), im: w.re.slice() })).toBeLessThan(1e-8)
  })
})

describe('T(a) = e^{−iap̂}: the graph moves right (ψ_a(x) = ψ(x − a))', () => {
  it('the shifted packet is the closed-form packet at x₀ + a, to 1e-11', () => {
    expect(maxDiff(translate(P(0, 1), G, 3), P(3, 1))).toBeLessThan(1e-11)
    // with momentum p₀ the shifted ψ(x − a) also carries the constant phase e^{−ip₀a}: a = −2.5 and p₀ = 2 give e^{+5i}
    const want = P(-3.5, 0.7, 2)
    const direct = { re: want.re.map((v, j) => v * Math.cos(5) - want.im[j] * Math.sin(5)), im: want.re.map((v, j) => v * Math.sin(5) + want.im[j] * Math.cos(5)) }
    expect(maxDiff(translate(P(-1, 0.7, 2), G, -2.5), direct)).toBeLessThan(1e-11)
  })
  it('keeps the norm, moves ⟨x⟩ by a, leaves ⟨p⟩ alone and obeys T(a)T(b) = T(a + b) and T(0) = I', () => {
    const w = P(0.5, 1, 1)
    const t = translate(w, G, 3)
    close(norm(t, G), 1, 1e-12)
    close(meanX(t, G), 3.5, 1e-9)
    close(meanP(t, G), 1, 1e-9)
    expect(maxDiff(translate(translate(w, G, 1.3), G, 0.9), translate(w, G, 2.2))).toBeLessThan(1e-11)
    expect(maxDiff(translate(w, G, 0), w)).toBeLessThan(1e-12)
  })
  it('the peak sits at x₀ + a, the sign of the shift is a plus for a rightward move (l12PeakPos = 3)', () => {
    const t = translate(P(0, 1), G, 3)
    let jMax = 0
    for (let j = 0; j < G.n; j++) if (t.re[j] ** 2 + t.im[j] ** 2 > t.re[jMax] ** 2 + t.im[jMax] ** 2) jMax = j
    close(G.x[jMax], 3, G.dx)
  })
  it('a first-order step: T(da)ψ = ψ − da ψ′ up to a term of size 0.158 da² for the unit packet (da = 0.01)', () => {
    const w = P(0, 1)
    const da = 0.01
    const t = translate(w, G, da)
    const d = dpdx(w, G)
    const first = { re: w.re.map((v, j) => v - da * d.re[j]), im: w.im.map((v, j) => v - da * d.im[j]) }
    close(maxDiff(t, first) / (da * da), 0.158, 2e-3)
  })
  it('numpy: a boost, a shift and a free evolution (applied in that order) match np.fft to 1e-9', () => {
    for (const f of D.moved) {
      let w = P(f.x0, f.sigma, f.p0)
      if (f.boost) w = boost(w, G, f.boost)
      w = shiftAndEvolve(w, G, f.shift, f.time)
      close(norm(w, G), f.norm, 1e-9)
      close(meanX(w, G), f.meanX, 1e-8)
      close(spreadX(w, G), f.spreadX, 1e-8)
      close(meanP(w, G), f.meanP, 1e-8)
      close(spreadP(w, G), f.spreadP, 1e-7)
      closeProbes(w, f.psi, 1e-9)
    }
  })
})

describe('free evolution e^{−ip̂²t/2} and the boost e^{iεx̂}', () => {
  it('is unitary, a group (U(s)U(t) = U(s + t)), and commutes with the shift', () => {
    const w = P(0, 1, 3)
    const a = freeEvolve(w, G, 2)
    close(norm(a, G), 1, 1e-12)
    expect(maxDiff(freeEvolve(a, G, 1.5), freeEvolve(w, G, 3.5))).toBeLessThan(1e-11)
    expect(maxDiff(translate(freeEvolve(w, G, 2), G, 1), freeEvolve(translate(w, G, 1), G, 2))).toBeLessThan(1e-11)
    expect(maxDiff(shiftAndEvolve(w, G, 1, 2), translate(freeEvolve(w, G, 2), G, 1))).toBeLessThan(1e-11)
  })
  it('the packet moves at p₀/m and spreads as σ√(1 + (t/2σ²)²) (σ = 1, t = 2 and 4: 1.414 and 2.236)', () => {
    for (const t of [2, 4]) {
      const a = freeEvolve(P(0, 1, 3), G, t)
      close(meanX(a, G), 3 * t, 1e-9)
      close(spreadX(a, G), Math.sqrt(1 + (t / 2) ** 2), 1e-7)
      close(spreadP(a, G), 0.5, 1e-7)
    }
  })
  it('a larger mass moves and spreads more slowly: the phase is k²t/2m', () => {
    close(spreadX(freeEvolve(P(0, 1), G, 4, 4), G), Math.sqrt(1 + (4 / (2 * 4)) ** 2), 1e-7)
  })
  it('a boost adds ε to ⟨p⟩ and leaves the spread of p and the density alone', () => {
    const w = P(0.5, 1, 1)
    const b = boost(w, G, 1.5)
    close(meanP(b, G), 2.5, 1e-9)
    close(spreadP(b, G), spreadP(w, G), 1e-9)
    close(norm(b, G), 1, 1e-12)
    for (let j = 0; j < G.n; j += 101) close(Math.hypot(b.re[j], b.im[j]), Math.hypot(w.re[j], w.im[j]), 1e-14)
  })
})

describe('chances: interval, cells and the density', () => {
  it('interval matches scipy’s CubicSpline.integrate to 1e-6 and erf to 2e-7', () => {
    for (const f of D.spans) {
      const v = interval(P(f.x0, f.sigma), G, f.a, f.b)
      close(v, f.spline, 1e-6, `spline ${f.sigma}`)
      close(v, f.erf, 2e-7, `erf ${f.sigma}`)
    }
  })
  it('P(−1 < x < 1) = 0.683 and P(−2 < x < 2) = 0.954 for the unit packet; P(x > 0) = ½', () => {
    close(interval(P(0, 1), G, -1, 1), 0.682689, 1e-6)
    close(interval(P(0, 1), G, -2, 2), 0.954500, 1e-6)
    close(interval(P(0, 1), G, 0, 31.9), 0.5, 1e-7)
  })
  it('cells: n equal cells of [−8, 8] match scipy to 1e-6 each and add to 1 (the plan’s l12CellsSum64 = 1)', () => {
    for (const n of [4, 8, 64, 512]) {
      const got = cellChances(P(0, 1), G, [-8, 8], n)
      const want = (D.cells as Record<string, number[]>)[String(n)]
      expect(got).toHaveLength(n)
      got.forEach((v, i) => close(v, want[i], 1e-6, `cell ${n}/${i}`))
      close(got.reduce((a, b) => a + b, 0), 1, 1e-9)
    }
  })
  it('the middle cell [0, w) of n cells holds 0.500, 0.477, 0.0987 and 0.0125 for n = 4, 8, 64, 512', () => {
    const mid = (n: number) => cellChances(P(0, 1), G, [-8, 8], n)[n / 2]
    close(mid(4), 0.499, 1e-3)
    close(mid(8), 0.477, 1e-3)
    close(mid(64), 0.0987, 1e-4)
    close(mid(512), 0.0125, 1e-4)
  })
  it('refuses fewer than one cell and clamps an interval to the grid', () => {
    expect(() => cellChances(P(0, 1), G, [-8, 8], 0)).toThrow()
    close(interval(P(0, 1), G, -100, 100), 1, 1e-9)
    close(interval(P(0, 1), G, 1, -1), -0.682689, 1e-6)
  })
})

describe('the momentum representation', () => {
  it('φ(p) is a direct sum of e^{−ipx}ψ(x) (np, not the FFT), and ∫|φ|²dp = 1', () => {
    for (const f of D.momentum) {
      const { p, phi } = toMomentum(P(f.x0, f.sigma, f.p0), G)
      for (const q of f.direct) {
        close(p[q.index], q.p, 1e-12)
        close(phi.re[q.index], q.re, 1e-10)
        close(phi.im[q.index], q.im, 1e-10)
      }
      let s = 0
      for (let i = 0; i < G.n; i++) s += phi.re[i] ** 2 + phi.im[i] ** 2
      close(s * G.dk, f.norm, 1e-9)
      close(s * G.dk, 1, 1e-9)
    }
  })
  it('the momenta are increasing, the Gaussian twin is (2σ²/π)^{1/4} e^{−σ²(p − p₀)²} e^{−i(p − p₀)x₀} · e^{−i…} in modulus, and Δp = 1/2σ', () => {
    const s = 0.5
    const { p, phi } = toMomentum(P(0, s), G)
    for (let i = 1; i < G.n; i++) expect(p[i]).toBeGreaterThan(p[i - 1])
    for (const i of [1900, 2048, 2100, 2200]) close(Math.hypot(phi.re[i], phi.im[i]), Math.pow((2 * s * s) / Math.PI, 0.25) * Math.exp(-s * s * p[i] * p[i]), 1e-9)
  })
  it('fromMomentum undoes toMomentum, and the transform of a shifted packet carries the phase e^{−ipa}', () => {
    const w = P(1, 0.7, 2)
    const back = fromMomentum(toMomentum(w, G).phi, G)
    expect(maxDiff(back, w)).toBeLessThan(1e-12)
    const a = toMomentum(P(0, 1), G).phi
    const b = toMomentum(translate(P(0, 1), G, 2), G)
    for (const i of [2000, 2048, 2100]) {
      const ph = -b.p[i] * 2
      close(b.phi.re[i], a.re[i] * Math.cos(ph) - a.im[i] * Math.sin(ph), 1e-9)
      close(b.phi.im[i], a.re[i] * Math.sin(ph) + a.im[i] * Math.cos(ph), 1e-9)
    }
  })
})

describe('N tiny shifts (I − iap̂/N)^N: Go deeper 1', () => {
  it('norm² matches the quadrature of the momentum density to 1e-9; 2.000, 1.337, 1.069, 1.016, 1.004 for N = 1, 4, 16, 64, 256 (a = 2, σ = 1)', () => {
    const w = P(0, 1)
    const shown = [2.0, 1.337, 1.069, 1.016, 1.004]
    D.steps.forEach((f, i) => {
      const s = translateBySteps(w, G, 2, f.n)
      close(norm(s, G), f.normQuad, 1e-9, `N=${f.n}`)
      close(norm(s, G), f.norm, 1e-10)
      close(norm(s, G), shown[i], 6e-4)
      closeProbes(s, f.psi, 1e-9, `N=${f.n}`)
    })
  })
  it('the gap to the exact shift falls like 1/N: 0.758, 0.267, 0.058, 0.0138, 0.0034 (L2 distance), and no finite N is unitary', () => {
    const w = P(0, 1)
    const exact = translate(w, G, 2)
    const gaps = [1, 4, 16, 64, 256].map((n) => l2gap(translateBySteps(w, G, 2, n), exact))
    ;[[0.758, 5e-4], [0.267, 5e-4], [0.058, 5e-4], [0.0138, 5e-5], [0.0034, 5e-5]].forEach(([want, tol], i) => close(gaps[i], want, tol, `N index ${i}`))
    D.steps.forEach((f, i) => close(gaps[i], f.gap, 1e-9))
    for (let i = 1; i < gaps.length; i++) expect(gaps[i]).toBeLessThan(gaps[i - 1])
    for (const n of [1, 4, 16, 64, 256]) expect(norm(translateBySteps(w, G, 2, n), G)).toBeGreaterThan(1.001)
    expect(() => translateBySteps(w, G, 2, 0)).toThrow()
  })
  it('refuses a state with momentum content above P_CUT (a packet of width 0.1) instead of silently cutting it', () => {
    expect(() => translateBySteps(P(0, 0.1), G, 2, 4)).toThrow(/P_CUT/)
    expect(() => translateBySteps(P(0, 0.25), G, 2, 4)).not.toThrow()
  })
  it('N = 1 doubles to 1 + a²σ_p² = 2 exactly (σ_p = ½, a = 2)', () => close(norm(translateBySteps(P(0, 1), G, 2, 1), G), 1 + 4 * 0.25, 1e-9))
})

describe('analytic plane waves: the grid route (a whole number of wavelengths in the box) gives the same samples', () => {
  it('a boost, a shift and a time agree with np.fft to 1e-9; the density is flat', () => {
    const f = D.plane
    const w = planeSamples(f.xs, [f.p], { boost: f.boost, shift: f.shift, time: f.time })
    f.xs.forEach((_, i) => {
      close(w.re[i], f.psi.re[i], 1e-9)
      close(w.im[i], f.psi.im[i], 1e-9)
      close(w.re[i] ** 2 + w.im[i] ** 2, 1, 1e-12)
    })
  })
  it('a shift multiplies a plane wave by e^{−ipa} (phase −80.2° for p = 2, a = 0.7 hmm: −1.4 rad) and two waves beat with spacing 2π/Δp', () => {
    const one = planeSamples([0], [2])
    const sh = planeSamples([0], [2], { shift: 0.7 })
    close(Math.atan2(sh.im[0], sh.re[0]) - Math.atan2(one.im[0], one.re[0]), -1.4, 1e-12)
    const xs = [0, Math.PI]
    const two = planeSamples(xs, [2, 4])
    close(two.re[0] ** 2 + two.im[0] ** 2, 2, 1e-12) // the waves are in step at x = 0: |√2|²
    close(two.re[1] ** 2 + two.im[1] ** 2, 2, 1e-9) // …and again one fringe (π) later
    const mid = planeSamples([Math.PI / 2], [2, 4])
    close(mid.re[0] ** 2 + mid.im[0] ** 2, 0, 1e-12)
  })
})

describe('helpers', () => {
  it('copy is deep; windowIndices keeps the ends and thins to the cap', () => {
    const w = P(0, 1)
    const c2 = copy(w)
    c2.re[0] = 99
    expect(w.re[0]).not.toBe(99)
    const idx = windowIndices(G, -8, 8, 400)
    expect(idx[0]).toBe(1536)
    expect(idx[idx.length - 1]).toBe(2560)
    expect(idx.length).toBeLessThanOrEqual(401)
  })
})

describe('many energies: levels.evolve and levels.survival against np.exp of explicit phases', () => {
  it('matches the fixtures to 1e-12 on ten random superpositions', () => {
    for (const f of D.levels) {
      const ev = levels.evolve(f.E, f.c, f.t)
      ev.forEach((z, n) => {
        close(z.re, f.evolved[n].re, 1e-12)
        close(z.im, f.evolved[n].im, 1e-12)
      })
      close(levels.survival(f.E, f.c, f.t), f.survival, 1e-12)
    }
  })
  it('the chance of each energy never moves, and the survival is 1 at t = 0 and for equal energies', () => {
    const E = [1, 2, 4]
    const cc = [c(Math.SQRT1_2, 0), c(0.5, 0), c(0.5, 0)]
    for (const t of [0, 0.7, 1.9]) levels.evolve(E, cc, t).forEach((z, n) => close(z.re ** 2 + z.im ** 2, cc[n].re ** 2, 1e-14))
    close(levels.survival(E, cc, 0), 1, 1e-14)
    close(levels.survival([2, 2, 2], cc, 3.3), 1, 1e-14)
    expect(() => levels.evolve([1], cc, 1)).toThrow()
    expect(() => levels.survival([1], cc, 1)).toThrow()
  })
  it('the three-level example of Lecture 12: survival 1/9 at εt/ħ = 90° and 1/3 at 45°', () => {
    const s = 1 / Math.sqrt(3)
    const cc = [c(s, 0), c(s, 0), c(s, 0)]
    close(levels.survival([1, 2, 4], cc, Math.PI / 2), 1 / 9, 1e-14)
    close(levels.survival([1, 2, 4], cc, Math.PI / 4), 1 / 3, 1e-14)
  })
})

describe('SI constants (CODATA 2018) against values rebuilt from other constants', () => {
  it('ħ = h/2π, mₑ from 2R∞h/(cα²), the helium-4 atom as 4.002602 u, the de Broglie wavelength and the two spreading times', () => {
    const C = D.constants
    close(K.HBAR / C.hbar, 1, 1e-14)
    close(K.M_ELECTRON / C.electronMass, 1, 5e-9)
    close(K.M_HELIUM4 / C.heliumMass, 1, 5e-8)
    close(K.deBroglie(K.M_HELIUM4, 2200) / C.lambdaHe2200, 1, 5e-8)
    close(K.spreadTime(K.M_ELECTRON, 1e-10) / C.spreadElectron, 1, 5e-9)
    close(K.spreadTime(1e-3, 1e-3) / C.spreadMarble, 1, 1e-14)
  })
  it('the exact SI constants are the 2019 definitions, and the displayed numbers are the plan’s (45.31 pm, 8.6e−17 s, 9.5e24 s, 3.0e17 yr)', () => {
    expect([K.H_PLANCK, K.E_CHARGE, K.C_LIGHT]).toEqual([6.62607015e-34, 1.602176634e-19, 299792458])
    expect((K.deBroglie(K.M_HELIUM4, 2200) * 1e12).toFixed(2)).toBe('45.31')
    close(K.spreadTime(K.M_ELECTRON, 1e-10) / 1e-17, 8.6, 0.05)
    close(K.spreadTime(1e-3, 1e-3) / 1e24, 9.5, 0.05)
    close(K.spreadTime(1e-3, 1e-3) / K.YEAR_S / 1e17, 3.0, 0.02)
  })
})
