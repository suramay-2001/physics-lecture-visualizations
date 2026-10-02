/**
 * info.ts against scipy/numpy (block "info": numpy weighted sums for mean/variance, scipy.stats.binom.stats for
 * binomialMoments, scipy.special.entr for shannon/binaryEntropy, numpy row/column sums for marginals, the direct
 * formula for correlatorC), plus properties: variance ≥ 0 always; shannon is 0 for a one-hot distribution and
 * log₂(k) for a uniform one over k outcomes; binaryEntropy peaks at 1 bit at p = ½ and is 0 at the endpoints.
 */
import { describe, expect, it } from 'vitest'
import { rng } from '../random'
import { binaryEntropy, binomialMoments, correlatorC, marginals, mean, shannon, variance } from './info'
import { FX } from './testkit'

const D = FX.info
const close = (a: number, b: number, eps = 1e-9) => expect(Math.abs(a - b), `${a} vs ${b}`).toBeLessThan(eps)

describe('mean and variance (weighted)', () => {
  it('= numpy weighted sums on a 5-outcome distribution', () => {
    close(mean(D.meanVar.xs, D.meanVar.p), D.meanVar.mean)
    close(variance(D.meanVar.xs, D.meanVar.p), D.meanVar.variance)
  })

  it('variance is never negative, for 50 seeded random distributions; mean of a one-hot distribution is that value', () => {
    const R = rng(7114)
    for (let t = 0; t < 50; t++) {
      const xs = Array.from({ length: 4 }, (_, i) => i * 1.3 - 2)
      const raw = Array.from({ length: 4 }, () => R())
      const s = raw.reduce((a, b) => a + b, 0)
      const p = raw.map((x) => x / s)
      expect(variance(xs, p)).toBeGreaterThanOrEqual(-1e-12)
    }
    expect(mean([5, 7, 9], [0, 1, 0])).toBe(7)
    expect(variance([5, 7, 9], [0, 1, 0])).toBe(0)
    expect(() => mean([1, 2], [1])).toThrow()
  })
})

describe('binomialMoments vs scipy.stats.binom', () => {
  it('= scipy.stats.binom.stats(N, p), an independent route from the closed form Np, Np(1 − p)', () => {
    for (const k of D.binomial) {
      const r = binomialMoments(k.N, k.p)
      close(r.mean, k.mean)
      close(r.variance, k.variance)
      // the engine's OWN closed form agrees too (consistency, not independence)
      close(r.mean, k.N * k.p)
      close(r.variance, k.N * k.p * (1 - k.p))
    }
    expect(() => binomialMoments(-1, 0.5)).toThrow()
  })
})

describe('Shannon and binary entropy vs scipy.special.entr', () => {
  it('shannon = scipy.special.entr(p).sum() / ln 2, on 5 distributions including a one-hot and a uniform one', () => {
    for (const k of D.shannon) close(shannon(k.p), k.H)
    close(shannon([1, 0]), 0) // one-hot: no surprise
    close(shannon([0.25, 0.25, 0.25, 0.25]), 2) // uniform over 4: log2(4) = 2 bits
    close(shannon(Array(8).fill(1 / 8)), 3) // uniform over 8: 3 bits
  })

  it('binaryEntropy = shannon([p, 1-p]) against scipy; peaks at 1 bit at p = ½, is 0 at the endpoints', () => {
    for (const k of D.binaryEntropy) close(binaryEntropy(k.p), k.h)
    close(binaryEntropy(0), 0)
    close(binaryEntropy(1), 0)
    close(binaryEntropy(0.5), 1)
    expect(binaryEntropy(0.5)).toBeGreaterThan(binaryEntropy(0.1))
    expect(binaryEntropy(0.5)).toBeGreaterThan(binaryEntropy(0.9))
  })
})

describe('marginals and correlatorC (Q10 CHSH tables, F2)', () => {
  it('= numpy row/column sums and the direct ±1 formula, on 4 joint tables', () => {
    for (const k of D.pxy) {
      const m = marginals(k.pxy)
      m.px.forEach((x: number, i: number) => close(x, k.px[i]))
      m.py.forEach((x: number, i: number) => close(x, k.py[i]))
      close(correlatorC(k.pxy), k.C)
    }
  })

  it('perfectly correlated bits give C = 1, perfectly anticorrelated give C = −1, independent fair coins give C = 0', () => {
    close(correlatorC([[0.5, 0], [0, 0.5]]), 1)
    close(correlatorC([[0, 0.5], [0.5, 0]]), -1)
    close(correlatorC([[0.25, 0.25], [0.25, 0.25]]), 0)
    expect(() => correlatorC([[0.5, 0.5]])).toThrow()
  })
})
