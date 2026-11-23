/**
 * Imaging of one atom on a camera (Physics 709, the GANDALF batch; plan: P-optics-experiment-track §7, P-B5-story §9). Pure functions, SI where a unit shows,
 * lazy-only (never in an entry chunk). The photon budget (how many photons an atom gives and the camera collects), the Poisson count law, the EMCCD count
 * model (a Poisson number of photoelectrons, each multiplied by an Erlang gain, plus Gaussian read noise), a seeded sampler for each, and the synthesis of one
 * grey-level frame from site positions, a point spread function, a background and a noise model. The numpy twin is pipeline/make_gandalf_platform_fixtures.py
 * (physics/__fixtures__/gandalf-platform.json). The experiment-track builder adds the remaining functions of §7 (threshold search, loss budget) to this module.
 *
 * Units: a pixel (r, c) is the unit square centred on (r, c); photon numbers are means; the gain of an EMCCD is in counts per photoelectron.
 */
import { rng } from '../random'
import { scatterRate, type AtomLine } from './cooling'

/* ------------------------------------------------ the photon budget ------------------------------------------------ */
/** The fraction of isotropically emitted light an ideal lens of numerical aperture `na` (0 ≤ NA < 1) gathers: (1 − √(1 − NA²))/2. */
export function collectionEfficiency(na: number): number {
  if (!(na >= 0 && na < 1)) throw new RangeError('collectionEfficiency: 0 <= NA < 1')
  return (1 - Math.sqrt(1 - na * na)) / 2
}

/**
 * One atom lit for a time `tau` (s): the scattering rate R = (Γ/2) s / (1 + s + 4Δ²/Γ²) (`dl` = Δ/Γ), the photons scattered R·τ and the mean number detected R·η·τ
 * when a fraction `eta` of the scattered photons is counted.
 */
export function photonBudget(a: AtomLine, s: number, dl: number, eta: number, tau: number): { R: number; scattered: number; detected: number } {
  if (!(s >= 0 && eta >= 0 && eta <= 1 && tau >= 0)) throw new RangeError('photonBudget: s >= 0, 0 <= eta <= 1, tau >= 0')
  const R = scatterRate(a, s, dl)
  return { R, scattered: R * tau, detected: R * eta * tau }
}
/** Scattered photons needed for a mean detected count `m` at detection efficiency `eta`. */
export const photonsFor = (m: number, eta: number): number => m / eta
/** The chance that an atom with mean count `m` shows zero counts: e^(−m). */
export const zeroCountFloor = (m: number): number => Math.exp(-m)

/* ------------------------------------------------ Poisson ------------------------------------------------ */
const lnFact: number[] = [0]
/** ln k! for a whole number k (a running table of sums of logarithms: exact to rounding). */
export function logFactorial(k: number): number {
  if (!Number.isInteger(k) || k < 0) throw new RangeError('logFactorial: a whole number >= 0')
  for (let j = lnFact.length; j <= k; j++) lnFact.push(lnFact[j - 1] + Math.log(j))
  return lnFact[k]
}
/** P(k; m) = e^(−m) m^k / k!, computed in logarithms so a mean in the hundreds does not overflow. */
export function poissonPmf(k: number, m: number): number {
  if (!(m >= 0)) throw new RangeError('poissonPmf: mean >= 0')
  if (!Number.isInteger(k) || k < 0) return 0
  if (m === 0) return k === 0 ? 1 : 0
  return Math.exp(k * Math.log(m) - m - logFactorial(k))
}
/** P(count ≤ k) for a Poisson mean m: the sum of the pmf from 0 to k (0 for k < 0). */
export function poissonCdf(k: number, m: number): number {
  if (!(m >= 0)) throw new RangeError('poissonCdf: mean >= 0')
  if (k < 0) return 0
  const top = Math.floor(k)
  let s = 0
  for (let j = 0; j <= top; j++) s += poissonPmf(j, m)
  return Math.min(1, s)
}

/* ------------------------------------------------ the normal law ------------------------------------------------ */
/** The upper tail Q(z) = P(Z > z) of a standard normal: a positive series for erf below z = 2.8, a continued fraction beyond (relative error ≈ 1e-14). */
export function normalTail(z: number): number {
  if (z < 0) return 1 - normalTail(-z)
  const x = z / Math.SQRT2
  if (x < 2) {
    // erf(x) = 2/√π e^(−x²) Σ 2^n x^(2n+1)/(2n+1)!!  (every term positive: no cancellation)
    let term = x
    let sum = x
    for (let n = 1; n < 200; n++) {
      term *= (2 * x * x) / (2 * n + 1)
      sum += term
      if (term < 1e-17 * sum) break
    }
    const erf = (2 / Math.sqrt(Math.PI)) * Math.exp(-x * x) * sum
    return 0.5 * (1 - erf)
  }
  // erfc(x) = e^(−x²)/(x√π) · 1/(1 + 1/(2x²)/(1 + 2/(2x²)/(1 + ...))) by the modified Lentz method on K = x + (1/2)/(x + 1/(x + (3/2)/(x + ...)))
  let f = x
  for (let k = 60; k >= 1; k--) f = x + k / 2 / f
  const erfc = Math.exp(-x * x) / (f * Math.sqrt(Math.PI))
  return 0.5 * erfc
}
/** P(a ≤ Z < b) for a standard normal, computed on the side of the mean where the tails are small (no cancellation near 1). */
export function normalMass(a: number, b: number): number {
  return a + b >= 0 ? normalTail(a) - normalTail(b) : normalTail(-b) - normalTail(-a)
}

/* ------------------------------------------------ seeded sampling ------------------------------------------------ */
/** A seeded generator of uniform draws in [0, 1): the repo's mulberry32 (physics/random.ts). */
export const makeRng = rng
/** A Poisson draw by inversion of the cdf from k = 0 (exact; one uniform per draw; mean ≤ 600 so that e^(−m) does not underflow). */
export function poissonSample(m: number, rand: () => number): number {
  if (!(m >= 0 && m <= 600)) throw new RangeError('poissonSample: 0 <= mean <= 600')
  if (m === 0) return 0
  const u = rand()
  let p = Math.exp(-m)
  let cum = p
  let k = 0
  while (u > cum && k < 4000) {
    k++
    p *= m / k
    cum += p
  }
  return k
}
/** A standard normal draw (Box–Muller, two uniforms). */
export function normalSample(rand: () => number): number {
  const u = 1 - rand()
  const v = rand()
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v)
}
/** An EMCCD count: n ~ Poisson(mean) photoelectrons, each multiplied by an exponential gain (so the sum is Erlang(n, gain)), plus N(0, sigma²) read noise. */
export function emccdSample(mean: number, gain: number, sigma: number, rand: () => number): number {
  const n = poissonSample(mean, rand)
  let y = 0
  for (let i = 0; i < n; i++) y -= gain * Math.log(1 - rand())
  return y + (sigma > 0 ? sigma * normalSample(rand) : 0)
}

/* ------------------------------------------------ the EMCCD count law ------------------------------------------------ */
export const EMCCD_LIMITS = { maxMean: 200, maxCells: 600000 } as const

/**
 * The probability mass of an EMCCD count in each unit cell [c, c + 1) of the count axis, for photoelectron mean `mean`, gain `gain` (counts per photoelectron) and read
 * noise `sigma` (counts). Exact up to the cell width: the Erlang law's cdf is 1 − Poisson cdf (n − 1; y/gain) (summed over n with the Poisson weights), a y-cell is placed at its
 * midpoint, and the Gaussian is integrated over each count cell. Returns the first cell's count `lo` (negative when sigma > 0) and the masses (they add to 1).
 */
export function emccdCells(mean: number, gain: number, sigma: number): { lo: number; mass: Float64Array } {
  if (!(mean >= 0 && mean <= EMCCD_LIMITS.maxMean && gain > 0 && sigma >= 0)) throw new RangeError('emccdCells: 0 <= mean <= 200, gain > 0, sigma >= 0')
  const nmax = Math.ceil(mean + 10 * Math.sqrt(mean) + 12)
  const P = Array.from({ length: nmax + 1 }, (_, n) => poissonPmf(n, mean))
  const J = Math.ceil(gain * (nmax + 10 * Math.sqrt(nmax) + 10)) + 1
  if (J > EMCCD_LIMITS.maxCells) throw new RangeError('emccdCells: gain times the photoelectron range is too large for the grid')
  // F(y) = P(electrons > 0 and the Erlang sum <= y) at the cell edges y = 0 … J
  const F = new Float64Array(J + 1)
  for (let y = 0; y <= J; y++) {
    const lam = y / gain
    let pk = Math.exp(-lam)
    let cum = 0 // Poisson cdf (n − 1; lam)
    let s = 0
    for (let n = 1; n <= nmax; n++) {
      cum += pk // add the pmf at n − 1
      pk *= lam / n
      s += P[n] * (1 - cum)
    }
    F[y] = s
  }
  const R = sigma > 0 ? Math.ceil(8 * sigma) + 1 : 0
  const lo = -R
  const out = new Float64Array(J + 2 * R + 1)
  const my = new Float64Array(J)
  for (let j = 0; j < J; j++) my[j] = F[j + 1] - F[j]
  if (sigma === 0) {
    out[0] = P[0]
    for (let j = 0; j < J; j++) out[j] += my[j]
    return { lo, mass: out }
  }
  // kernel[d + R] = P(count cell c | y-cell midpoint j + 1/2) with d = c − j
  const K = new Float64Array(2 * R + 2)
  for (let d = -R; d <= R; d++) K[d + R] = normalMass((d - 0.5) / sigma, (d + 0.5) / sigma)
  for (let j = 0; j < J; j++) {
    const w = my[j]
    if (w === 0) continue
    for (let d = -R; d <= R; d++) out[j + d - lo] += w * K[d + R]
  }
  // the no-electron mass sits exactly at y = 0
  for (let c = -R; c < R; c++) out[c - lo] += P[0] * normalMass(c / sigma, (c + 1) / sigma)
  return { lo, mass: out }
}
/** The EMCCD count density per count (the cell masses) at counts `lo` … `hi − 1`. */
export function emccdPdf(mean: number, gain: number, sigma: number, lo: number, hi: number): number[] {
  const { lo: l0, mass } = emccdCells(mean, gain, sigma)
  return Array.from({ length: Math.max(0, hi - lo) }, (_, i) => mass[lo + i - l0] ?? 0)
}
/**
 * The smallest error a count cutoff can reach when a bright atom (mean `mb` photoelectrons) is told from a dark one (`md`) with equal priors:
 * (P(bright reads below the cutoff) + P(dark reads at or above it))/2, over every whole cutoff. Returns the error, the best cutoff count and the two misread chances.
 */
export function emccdBestError(mb: number, md: number, gain: number, sigma: number): { err: number; cutoff: number; eb: number; ed: number } {
  const B = emccdCells(mb, gain, sigma)
  const D = emccdCells(md, gain, sigma)
  const lo = B.lo
  const n = Math.max(B.mass.length, D.mass.length)
  const b = (i: number): number => B.mass[i] ?? 0
  const d = (i: number): number => D.mass[i] ?? 0
  // dark tail P(count >= cell i) summed from the top, so a tiny tail is never 1 − (almost 1)
  const tail = new Float64Array(n + 1)
  for (let i = n - 1; i >= 0; i--) tail[i] = tail[i + 1] + d(i)
  let best = { err: Infinity, cutoff: lo, eb: 0, ed: 0 }
  let below = 0 // bright mass in cells < i
  for (let i = 0; i <= n; i++) {
    const err = (below + tail[i]) / 2
    if (err < best.err) best = { err, cutoff: lo + i, eb: below, ed: tail[i] }
    if (i < n) below += b(i)
  }
  return best
}

/* ------------------------------------------------ the point spread function ------------------------------------------------ */
/** The share of a Gaussian line (centre `x0`, standard deviation `sigma`, in pixels) that falls in pixel `i`, the interval [i − ½, i + ½]. */
export function psfShare(i: number, x0: number, sigma: number): number {
  if (!(sigma > 0)) throw new RangeError('psfShare: sigma > 0')
  return normalMass((i - 0.5 - x0) / sigma, (i + 0.5 - x0) / sigma)
}

/* ------------------------------------------------ one camera frame ------------------------------------------------ */
export type FrameNoise = 'none' | 'poisson' | 'emccd'
export interface FrameOptions {
  rows: number
  cols: number
  /** Atom positions in pixel units (row, column); a whole number is a pixel centre. */
  sites: readonly { r: number; c: number }[]
  /** Mean detected photons per atom, summed over the whole point spread function. */
  photons: number
  /** The point spread function's standard deviation, in pixels. */
  psf: number
  /** Mean background photons per pixel. */
  background: number
  noise: FrameNoise
  /** EMCCD gain (counts per photoelectron) and read noise (counts); used only with noise 'emccd'. */
  gain?: number
  sigma?: number
  seed?: number
}
export interface Frame {
  rows: number
  cols: number
  /** Mean photons per pixel (row-major): atoms' shares plus the background. */
  means: number[]
  /** One draw of the counts (row-major): the means themselves for noise 'none'; Poisson photons for 'poisson'; EMCCD counts for 'emccd'. */
  counts: number[]
}
/** Mean photons per pixel: Σ over atoms of photons × (share of the PSF in the pixel's row) × (share in its column), plus the background. */
export function frameMeans(o: Pick<FrameOptions, 'rows' | 'cols' | 'sites' | 'photons' | 'psf' | 'background'>): number[] {
  const out = new Array<number>(o.rows * o.cols).fill(o.background)
  for (const s of o.sites) {
    const sr = Array.from({ length: o.rows }, (_, i) => psfShare(i, s.r, o.psf))
    const sc = Array.from({ length: o.cols }, (_, j) => psfShare(j, s.c, o.psf))
    for (let i = 0; i < o.rows; i++) for (let j = 0; j < o.cols; j++) out[i * o.cols + j] += o.photons * sr[i] * sc[j]
  }
  return out
}
/** The whole frame: the means, then one seeded draw of the counts (pixels in row-major order, so the same seed always draws the same frame). */
export function cameraFrame(o: FrameOptions): Frame {
  const means = frameMeans(o)
  const rand = makeRng(o.seed ?? 1)
  let counts: number[]
  if (o.noise === 'none') counts = means.slice()
  else if (o.noise === 'poisson') counts = means.map((m) => poissonSample(m, rand))
  else counts = means.map((m) => emccdSample(m, o.gain ?? 1, o.sigma ?? 0, rand))
  return { rows: o.rows, cols: o.cols, means, counts }
}
/** The occupied sites of a row-major string of 0s and 1s (a pixel centre each). */
export function sitesFromBits(rows: number, cols: number, bits: string): { r: number; c: number }[] {
  if (bits.length !== rows * cols || !/^[01]*$/.test(bits)) throw new RangeError('sitesFromBits: a string of rows × cols bits')
  const out: { r: number; c: number }[] = []
  for (let k = 0; k < bits.length; k++) if (bits[k] === '1') out.push({ r: Math.floor(k / cols), c: k % cols })
  return out
}
/** A seeded random occupancy: each site is filled with chance p (its own stream, apart from the noise draws of `cameraFrame`). */
export function randomBits(rows: number, cols: number, p: number, seed: number): string {
  const rand = makeRng((seed ^ 0xa5a5a5a5) >>> 0)
  let s = ''
  for (let k = 0; k < rows * cols; k++) s += rand() < p ? '1' : '0'
  return s
}

/* ------------------------------------------------ weights and a Wiener smoother (the camera-frame panels) ------------------------------------------------ */
export type FrameFilter = 'square' | 'gauss' | 'llr' | 'centre'
/**
 * The weights of a size × size region of interest around one atom at its centre pixel: 'square' all 1; 'centre' 1 at the middle pixel only; 'gauss' the PSF's share of each
 * pixel; 'llr' the log-likelihood-ratio weight ln(1 + photons × share / background) of a pixel (needs background > 0). Row-major; the centre pixel is at (⌊size/2⌋, ⌊size/2⌋).
 */
export function filterWeights(filter: FrameFilter, size: number, psf: number, photons: number, background: number): number[] {
  const c = Math.floor(size / 2)
  const out: number[] = []
  for (let i = 0; i < size; i++)
    for (let j = 0; j < size; j++) {
      const share = psfShare(i, c, psf) * psfShare(j, c, psf)
      if (filter === 'square') out.push(1)
      else if (filter === 'centre') out.push(i === c && j === c ? 1 : 0)
      else if (filter === 'gauss') out.push(share)
      else {
        if (!(background > 0)) throw new RangeError('filterWeights: llr needs background > 0')
        out.push(Math.log(1 + (photons * share) / background))
      }
    }
  return out
}
/**
 * A Wiener smoother with a known Gaussian point spread function and white noise, on a rows × cols frame with periodic edges: each spatial frequency is multiplied by
 * S/(S + N), where S = `sourcePower` × (the PSF's transfer function)² and N = `noiseVar` (both per frequency of the unnormalised DFT: for n atoms of amplitude A and
 * white noise of variance v per pixel, S₀ = n A² and N = rows × cols × v); the mean (frequency 0) is kept. Linear, so it never invents a peak the frame lacks.
 */
export function wienerSmooth(img: readonly number[], rows: number, cols: number, psf: number, sourcePower: number, noiseVar: number): number[] {
  const re = new Array<number>(rows * cols).fill(0)
  const im = new Array<number>(rows * cols).fill(0)
  const cosT = (n: number, k: number, N: number): number => Math.cos((2 * Math.PI * n * k) / N)
  const sinT = (n: number, k: number, N: number): number => Math.sin((2 * Math.PI * n * k) / N)
  // forward 2-D DFT by separable passes
  const tmpRe = new Array<number>(rows * cols).fill(0)
  const tmpIm = new Array<number>(rows * cols).fill(0)
  for (let i = 0; i < rows; i++)
    for (let kc = 0; kc < cols; kc++) {
      let a = 0
      let b = 0
      for (let j = 0; j < cols; j++) (a += img[i * cols + j] * cosT(j, kc, cols)), (b -= img[i * cols + j] * sinT(j, kc, cols))
      tmpRe[i * cols + kc] = a
      tmpIm[i * cols + kc] = b
    }
  for (let kr = 0; kr < rows; kr++)
    for (let kc = 0; kc < cols; kc++) {
      let a = 0
      let b = 0
      for (let i = 0; i < rows; i++) {
        const c = cosT(i, kr, rows)
        const s = sinT(i, kr, rows)
        a += tmpRe[i * cols + kc] * c + tmpIm[i * cols + kc] * s
        b += tmpIm[i * cols + kc] * c - tmpRe[i * cols + kc] * s
      }
      const fr = (kr <= rows / 2 ? kr : kr - rows) / rows
      const fc = (kc <= cols / 2 ? kc : kc - cols) / cols
      const otf = Math.exp(-2 * Math.PI * Math.PI * psf * psf * (fr * fr + fc * fc))
      const S = sourcePower * otf * otf
      const H = kr === 0 && kc === 0 ? 1 : S / (S + noiseVar)
      re[kr * cols + kc] = a * H
      im[kr * cols + kc] = b * H
    }
  // inverse
  const outRe = new Array<number>(rows * cols).fill(0)
  const midRe = new Array<number>(rows * cols).fill(0)
  const midIm = new Array<number>(rows * cols).fill(0)
  for (let i = 0; i < rows; i++)
    for (let kc = 0; kc < cols; kc++) {
      let a = 0
      let b = 0
      for (let kr = 0; kr < rows; kr++) {
        const c = cosT(i, kr, rows)
        const s = sinT(i, kr, rows)
        a += re[kr * cols + kc] * c - im[kr * cols + kc] * s
        b += im[kr * cols + kc] * c + re[kr * cols + kc] * s
      }
      midRe[i * cols + kc] = a
      midIm[i * cols + kc] = b
    }
  for (let i = 0; i < rows; i++)
    for (let j = 0; j < cols; j++) {
      let a = 0
      for (let kc = 0; kc < cols; kc++) a += midRe[i * cols + kc] * cosT(j, kc, cols) - midIm[i * cols + kc] * sinT(j, kc, cols)
      outRe[i * cols + j] = a / (rows * cols)
    }
  return outRe
}

/* ------------------------------------------------ the cutoff on counts (experiment track, pages O10 and O11) ------------------------------------------------ */
/**
 * Reading one site from a count n with a cutoff `nc`: "atom" when n ≥ nc. A bright atom (Poisson mean `mb`) is missed with chance eb = P(n < nc), a dark site
 * (mean `md`) is misread with chance ed = P(n ≥ nc) (the tail is summed upward, so a tiny tail is exact); the error is half the sum (equal priors).
 */
export function thresholdError(mb: number, md: number, nc: number): { err: number; eb: number; ed: number } {
  if (!(mb >= 0 && md >= 0) || !Number.isInteger(nc) || nc < 0) throw new RangeError('thresholdError: means >= 0, a whole cutoff >= 0')
  const eb = nc === 0 ? 0 : poissonCdf(nc - 1, mb)
  let ed = 0
  const top = nc + Math.ceil(md + 14 * Math.sqrt(md + 1) + 40)
  for (let k = top; k >= nc; k--) ed += poissonPmf(k, md)
  if (nc === 0) ed = 1
  return { err: (eb + ed) / 2, eb, ed: Math.min(1, ed) }
}
/** The cutoff (a whole count) with the smallest error, scanned from 0 up past both histograms; ties go to the lower cutoff. */
export function bestThreshold(mb: number, md: number): { err: number; eb: number; ed: number; cutoff: number } {
  const top = Math.ceil(mb + md + 12 * Math.sqrt(mb + md + 1) + 20)
  let best = { ...thresholdError(mb, md, 0), cutoff: 0 }
  for (let nc = 1; nc <= top; nc++) {
    const e = thresholdError(mb, md, nc)
    if (e.err < best.err) best = { ...e, cutoff: nc }
  }
  return best
}
/**
 * The best cutoff's error for a bright atom of signal rate `rb` and a background rate `rg` (counts per second) seen for `tau` seconds: the bright mean is (rb + rg)τ,
 * the dark mean rgτ. The two histograms separate as √τ (their distance in standard deviations), so the error falls faster than exponentially in the exposure.
 */
export function errorVsExposure(rb: number, rg: number, tau: number): { err: number; cutoff: number; eb: number; ed: number; mb: number; md: number } {
  const mb = (rb + rg) * tau
  const md = rg * tau
  const b = bestThreshold(mb, md)
  return { ...b, mb, md }
}
/** The separation of the bright and dark histograms in standard deviations, d′ = (m_b − m_d)/√(m_b + m_d). */
export const dPrime = (mb: number, md: number): number => (mb - md) / Math.sqrt(mb + md)
/**
 * The mean and variance of an EMCCD count (read noise ignored): a Poisson number of photoelectrons (mean μ), each multiplied by an exponential gain g, has
 * mean μ g and variance 2 μ g²: an excess noise factor, variance/(μ g²), of exactly 2.
 */
export const emccdMoments = (mean: number, gain: number): { mean: number; variance: number; enf: number } => ({ mean: mean * gain, variance: 2 * mean * gain * gain, enf: (2 * mean * gain * gain) / (mean * gain * gain) })
/**
 * A toy readout-loss trade (a labelled model of page O11, not a measurement): the misread error of `errorVsExposure` plus an atom loss 1 − e^{−λ_L τ} at loss rate `lamL` (s⁻¹).
 * The exposure is searched on a grid from `fromUs` to `toUs` microseconds in steps of `stepUs`; the best total, and its misread part, are returned.
 */
export function toyOptimum(rb: number, rg: number, lamL: number, fromUs = 30, toUs = 600, stepUs = 2): { tau: number; total: number; misread: number } {
  let best = { tau: fromUs * 1e-6, total: Infinity, misread: 0 }
  for (let us = fromUs; us < toUs; us += stepUs) {
    const tau = us * 1e-6
    const m = errorVsExposure(rb, rg, tau).err
    const total = m + (1 - Math.exp(-lamL * tau))
    if (total < best.total) best = { tau, total, misread: m }
  }
  return best
}
