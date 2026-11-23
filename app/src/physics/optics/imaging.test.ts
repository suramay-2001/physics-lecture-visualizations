/**
 * physics/optics/imaging.ts against its numpy twin (pipeline/make_gandalf_platform_fixtures.py -> __fixtures__/gandalf-platform.json), plus properties that need no twin
 * (the EMCCD law's mass, mean and variance, the seeded frame, the weights, the Wiener smoother).
 */
import { describe, expect, it } from 'vitest'
import fixture from '../__fixtures__/gandalf-platform.json'
import { CS_D2 } from './cooling'
import * as I from './imaging'

const V = fixture.values as unknown as Record<string, [number, number]>
const near = (key: string, got: number): void => {
  const [want, tol] = V[key]
  const err = tol === 0 ? Math.abs(got - want) : Math.abs(got - want) / Math.max(Math.abs(want), 1e-300)
  expect(err, `${key}: ${got} vs ${want}`).toBeLessThanOrEqual(tol === 0 ? 0 : tol)
}

describe('Poisson, the normal law and the budget agree with scipy', () => {
  it('pmf and cdf', () => {
    for (const m of [0.3, 5, 30, 150])
      for (const k of [0, 3, 9, 40]) {
        near(`poissonPmf.${k}.${m}`, I.poissonPmf(k, m))
        near(`poissonCdf.${k}.${m}`, I.poissonCdf(k, m))
      }
  })
  it('the normal tail (series and continued fraction), a PSF share, the collection efficiency and the zero-count floor', () => {
    for (const z of [-6, -2.5, -0.3, 0, 0.7, 2.9, 4.5, 8, 12]) near(`normalTail.${z}`, I.normalTail(z))
    near('psfShare.2.2.0.8', I.psfShare(2, 2, 0.8))
    near('psfShare.0.0.3.0.6', I.psfShare(0, 0.3, 0.6))
    near('collectionEfficiency.0.4', I.collectionEfficiency(0.4))
    near('collectionEfficiency.0.7', I.collectionEfficiency(0.7))
    near('zeroCountFloor.5', I.zeroCountFloor(5))
  })
  it('the photon budget: R = gamma/4 at s = 1 on resonance, detected = R eta tau, and the two helper inverses', () => {
    const b = I.photonBudget(CS_D2, 1, 0, 0.05, 1e-3)
    expect(b.R).toBeCloseTo(CS_D2.gamma / 4, 6)
    expect(b.scattered).toBeCloseTo(b.R * 1e-3, 9)
    expect(b.detected).toBeCloseTo(b.R * 0.05 * 1e-3, 9)
    expect(I.photonsFor(5, 0.0096)).toBeCloseTo(520.83333, 4)
    expect(() => I.photonBudget(CS_D2, 1, 0, 1.2, 1e-3)).toThrow(RangeError)
    expect(() => I.collectionEfficiency(1)).toThrow(RangeError)
  })
  it('poisson pmf adds to 1 and handles a mean of zero', () => {
    let s = 0
    for (let k = 0; k < 200; k++) s += I.poissonPmf(k, 30)
    expect(s).toBeCloseTo(1, 12)
    expect(I.poissonPmf(0, 0)).toBe(1)
    expect(I.poissonPmf(2, 0)).toBe(0)
    expect(I.poissonCdf(-1, 3)).toBe(0)
  })
})

describe('the EMCCD count law', () => {
  it('best error and cutoff agree with the numpy route (gamma.cdf, np.convolve) to 1e-8', () => {
    for (const [tag, mb, md, g, s] of [['a', 30, 0.3, 300, 40], ['b', 8, 0.2, 100, 15], ['c', 12, 0.5, 50, 0]] as const) {
      const e = I.emccdBestError(mb, md, g, s)
      near(`emccdBestError.${tag}.err`, e.err)
      near(`emccdBestError.${tag}.cutoff`, e.cutoff)
      near(`emccdBestError.${tag}.eb`, e.eb)
      near(`emccdBestError.${tag}.ed`, e.ed)
    }
  })
  it('the cell masses agree with the twin at chosen counts', () => {
    near('emccdCells.5.100.20.lo', I.emccdCells(5, 100, 20).lo)
    for (const c of [-20, 0, 100, 450, 700]) near(`emccdPdf.5.100.20.${c}`, I.emccdPdf(5, 100, 20, c, c + 1)[0])
  })
  it('the masses add to 1, the mean is gain × mean and the variance is 2 mean gain² + sigma² (excess noise factor 2; the cell width adds 1/12)', () => {
    const { lo, mass } = I.emccdCells(30, 300, 40)
    let s = 0
    let m1 = 0
    for (let i = 0; i < mass.length; i++) (s += mass[i]), (m1 += mass[i] * (lo + i + 0.5))
    let v = 0
    for (let i = 0; i < mass.length; i++) v += mass[i] * (lo + i + 0.5 - m1) ** 2
    expect(s).toBeCloseTo(1, 9)
    expect(m1 / s).toBeCloseTo(30 * 300, 0)
    expect(v / (2 * 30 * 300 ** 2 + 40 ** 2)).toBeCloseTo(1, 3)
  })
  it('the EMCCD error exceeds the photon-counting floor of the same means: the gain’s spread, not the photons, sets it', () => {
    const e = I.emccdBestError(30, 0.3, 300, 40)
    expect(e.err).toBeGreaterThan(1e-4)
    expect(e.err).toBeLessThan(1e-3)
    let floor = 1
    for (let nc = 1; nc < 30; nc++) floor = Math.min(floor, (I.poissonCdf(nc - 1, 30) + 1 - I.poissonCdf(nc - 1, 0.3)) / 2)
    expect(floor).toBeLessThan(e.err / 10)
  })
  it('refuses a mean, gain or grid out of range', () => {
    expect(() => I.emccdCells(250, 100, 10)).toThrow(RangeError)
    expect(() => I.emccdCells(5, 0, 10)).toThrow(RangeError)
    expect(() => I.emccdCells(100, 5000, 10)).toThrow(RangeError)
  })
  it('a sampled EMCCD count has the law’s mean and variance (4σ Monte Carlo, seed 7)', () => {
    const rand = I.makeRng(7)
    const n = 4000
    const xs = Array.from({ length: n }, () => I.emccdSample(5, 100, 20, rand))
    const mean = xs.reduce((a, b) => a + b, 0) / n
    const varr = xs.reduce((a, b) => a + (b - mean) ** 2, 0) / (n - 1)
    expect(Math.abs(mean - 500)).toBeLessThan(4 * Math.sqrt((2 * 5 * 100 ** 2 + 400) / n))
    expect(varr / (2 * 5 * 100 ** 2 + 400)).toBeGreaterThan(0.9)
    expect(varr / (2 * 5 * 100 ** 2 + 400)).toBeLessThan(1.1)
  })
})

describe('the seeded frame', () => {
  it('reproduces the numpy mirror exactly: means to 1e-10 and every Poisson count (mulberry32, inversion, row-major order)', () => {
    const fr = (fixture.frames as Record<string, { means: number[]; counts: number[]; tol: number }>)['poisson.5x6.seed7']
    const f = I.cameraFrame({ rows: 5, cols: 6, sites: [{ r: 1, c: 1 }, { r: 3, c: 4 }], photons: 40, psf: 0.7, background: 0.3, noise: 'poisson', seed: 7 })
    f.means.forEach((m, i) => expect(Math.abs(m - fr.means[i]) / fr.means[i]).toBeLessThan(fr.tol))
    expect(f.counts).toEqual(fr.counts)
  })
  it('the same seed gives the same frame, another seed another; the means carry every photon of the atoms plus the background', () => {
    const o = { rows: 6, cols: 6, sites: [{ r: 2, c: 3 }], photons: 25, psf: 0.8, background: 0.2, noise: 'emccd' as const, gain: 100, sigma: 10 }
    const a = I.cameraFrame({ ...o, seed: 3 })
    expect(I.cameraFrame({ ...o, seed: 3 }).counts).toEqual(a.counts)
    expect(I.cameraFrame({ ...o, seed: 4 }).counts).not.toEqual(a.counts)
    const tot = a.means.reduce((x, y) => x + y, 0)
    expect(tot).toBeLessThanOrEqual(25 + 0.2 * 36)
    expect(tot).toBeGreaterThan(25 + 0.2 * 36 - 0.1) // only the PSF's far tail leaves the 6 × 6 frame
    expect(I.cameraFrame({ ...o, noise: 'none' }).counts).toEqual(a.means)
  })
  it('occupancy strings and seeded random occupancy', () => {
    expect(I.sitesFromBits(2, 3, '010001')).toEqual([{ r: 0, c: 1 }, { r: 1, c: 2 }])
    expect(() => I.sitesFromBits(2, 3, '0100')).toThrow(RangeError)
    const b = I.randomBits(6, 6, 0.5, 11)
    expect(b).toBe(I.randomBits(6, 6, 0.5, 11))
    expect(b).toHaveLength(36)
    expect(I.randomBits(6, 6, 0, 11)).toBe('0'.repeat(36))
    expect(I.randomBits(6, 6, 1, 11)).toBe('1'.repeat(36))
  })
})

describe('filter weights and the Wiener smoother', () => {
  it('square, centre, gauss (PSF shares, sum < 1 for a small ROI) and llr (ln(1 + s share / b))', () => {
    expect(I.filterWeights('square', 3, 0.7, 40, 0.3)).toEqual(Array(9).fill(1))
    expect(I.filterWeights('centre', 3, 0.7, 40, 0.3)).toEqual([0, 0, 0, 0, 1, 0, 0, 0, 0])
    const g = I.filterWeights('gauss', 3, 0.7, 40, 0.3)
    expect(g[4]).toBeCloseTo(I.psfShare(1, 1, 0.7) ** 2, 12)
    expect(g.reduce((a, b) => a + b, 0)).toBeLessThan(1)
    const l = I.filterWeights('llr', 3, 0.7, 40, 0.3)
    expect(l[4]).toBeCloseTo(Math.log(1 + (40 * g[4]) / 0.3), 12)
    expect(l[4]).toBeGreaterThan(l[0])
    expect(() => I.filterWeights('llr', 3, 0.7, 40, 0)).toThrow(RangeError)
  })
  it('with no noise the smoother returns the frame; with noise it shrinks the variance and keeps the mean', () => {
    const rand = I.makeRng(5)
    const img = Array.from({ length: 36 }, () => rand() * 10)
    const back = I.wienerSmooth(img, 6, 6, 0.8, 5, 0)
    back.forEach((v, i) => expect(v).toBeCloseTo(img[i], 9))
    const sm = I.wienerSmooth(img, 6, 6, 0.8, 1, 20)
    const mean = (a: number[]) => a.reduce((x, y) => x + y, 0) / a.length
    const vari = (a: number[]) => a.reduce((x, y) => x + (y - mean(a)) ** 2, 0) / a.length
    expect(mean(sm)).toBeCloseTo(mean(img), 9)
    expect(vari(sm)).toBeLessThan(vari(img))
  })
})
