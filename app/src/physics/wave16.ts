/**
 * Lecture 16 engine (448): the free Gaussian packet in closed form, the width of a chirped packet, the covariance of x̂ and p̂, and Ehrenfest's rate law applied to x̂ and p̂ on the grid. Every function is pure,
 * ħ = 1 and lengths in ℓ unless a call passes its own mass (or, for `widthTime`, its own ħ). A lecture-only module: it is imported by content/L16.values.ts and, for the chirp curve, by the plot table in
 * stage/svg/plot.ts. Numpy twin of every `l16…` key: pipeline/claims_448/l16.py (np.fft evolution, dense operators, finite-difference Hamiltonians); engine cases: physics/__fixtures__/wave16-cases.json.
 * Tests: physics/wave16.test.ts.
 */
import { ONE, c, csqrt, div, expi, scale } from './complex'
import { KET, SIGMA_X, SIGMA_Z, sandwich } from './spin'
import { evolveKet } from './dynamics'
import { matmul, mscale, msub } from './linalg'
import { type Grid, type Wave, innerProduct, meanP, meanX, pOp, xTimes } from './wave'
import { kineticEnergy } from './wave14'
import { spreadScale } from './wave15'

export interface GaussianParams {
  x0: number
  sigma: number
  p0?: number
}

/**
 * ψ(x, t) of a free Gaussian packet in closed form, sampled on the grid (the notes' §16.3 with the phase convention of `packet`, ψ(x, 0) = (2πσ²)^{−1/4} e^{−(x−x₀)²/4σ²} e^{ip₀x}):
 * ψ = (2πσ²)^{−1/4} (1 + iτ)^{−1/2} exp[−X²/4σ²(1 + iτ)] exp[i(p₀x − p₀²t/2m)], X = x − x₀ − p₀t/m, τ = ħt/2mσ² = t/t_s. At t = 0 it is `packet` itself.
 */
export function gaussianExact(g: Grid, { x0, sigma, p0 = 0 }: GaussianParams, t: number, m = 1): Wave {
  if (!(sigma > 0) || !(m > 0)) throw new Error('gaussianExact: σ and m must be positive')
  const tau = t / (2 * m * sigma * sigma)
  const s = 1 + tau * tau
  const amp = Math.pow(2 * Math.PI * sigma * sigma, -0.25) * Math.pow(s, -0.25)
  const half = -0.5 * Math.atan(tau) // the phase of (1 + iτ)^{−1/2}
  const re = new Float64Array(g.n)
  const im = new Float64Array(g.n)
  for (let j = 0; j < g.n; j++) {
    const X = g.x[j] - x0 - (p0 * t) / m
    const env = amp * Math.exp(-(X * X) / (4 * sigma * sigma * s))
    // −X²/4σ²(1 + iτ) = −X²(1 − iτ)/4σ²(1 + τ²): the real part is the envelope, the imaginary part +τX²/4σ²(1 + τ²) joins the phase
    const theta = p0 * g.x[j] - (p0 * p0 * t) / (2 * m) + half + (tau * X * X) / (4 * sigma * sigma * s)
    re[j] = env * Math.cos(theta)
    im[j] = env * Math.sin(theta)
  }
  return { re, im }
}

/**
 * Townsend's Eq. 6.76 (p. 209) for a packet that starts as e^{−x²/2a²} at x₀ = 0 with p₀ = 0: ψ = [√π (a + iħt/ma)]^{−1/2} exp[−x²/(2a²(1 + iħt/ma²))], ħ = 1. With a = √2 σ it is the
 * `gaussianExact` of the same packet, term for term. Built in complex arithmetic from the book's printed form, not from the notes' form.
 */
export function townsendPacket(g: Grid, a: number, t: number, m = 1): Wave {
  if (!(a > 0) || !(m > 0)) throw new Error('townsendPacket: a and m must be positive')
  const T = t / (m * a * a)
  const pref = div(ONE, csqrt(scale(c(a, t / (m * a)), Math.sqrt(Math.PI))))
  const re = new Float64Array(g.n)
  const im = new Float64Array(g.n)
  for (let j = 0; j < g.n; j++) {
    const u = (g.x[j] * g.x[j]) / (2 * a * a)
    const amp = Math.exp(-u / (1 + T * T))
    const ph = expi((u * T) / (1 + T * T)) // −u/(1 + iT) = −u(1 − iT)/(1 + T²)
    re[j] = amp * (pref.re * ph.re - pref.im * ph.im)
    im[j] = amp * (pref.re * ph.im + pref.im * ph.re)
  }
  return { re, im }
}

export interface ChirpParams extends GaussianParams {
  /** The chirp: ψ is multiplied by e^{iβ(x − x₀)²}, so the local wave number 2β(x − x₀) grows with the distance from the centre. */
  beta: number
}

/** The Gaussian of `packet` times e^{iβ(x−x₀)²}: the same density at t = 0, a position-dependent momentum on top (a chirp). */
export function chirpPacket(g: Grid, { x0, sigma, p0 = 0, beta }: ChirpParams): Wave {
  const amp = Math.pow(2 * Math.PI * sigma * sigma, -0.25)
  const re = new Float64Array(g.n)
  const im = new Float64Array(g.n)
  for (let j = 0; j < g.n; j++) {
    const u = g.x[j] - x0
    const env = amp * Math.exp(-(u * u) / (4 * sigma * sigma))
    const theta = p0 * g.x[j] + beta * u * u
    re[j] = env * Math.cos(theta)
    im[j] = env * Math.sin(theta)
  }
  return { re, im }
}

/** C_xp = ½⟨(x̂ − ⟨x⟩)(p̂ − ⟨p⟩) + (p̂ − ⟨p⟩)(x̂ − ⟨x⟩)⟩ = Re⟨x̂p̂⟩ − ⟨x⟩⟨p⟩ of a normalised state (ħ = 1), with the spectral p̂. Zero for an unchirped Gaussian. */
export function covarianceXP(psi: Wave, g: Grid): number {
  const xp = innerProduct(psi, xTimes(pOp(psi, g), g), g).re
  return xp - meanX(psi, g) * meanP(psi, g)
}

/** Δp of the chirped Gaussian (width σ, chirp β): √(1/4σ² + 4β²σ²). It does not change in free evolution. */
export function chirpSpreadP(sigma: number, beta: number): number {
  return Math.sqrt(1 / (4 * sigma * sigma) + 4 * beta * beta * sigma * sigma)
}

/** C_xp of the chirped Gaussian: 2βσ² (negative for β < 0, the packet that narrows first). */
export function chirpCovariance(sigma: number, beta: number): number {
  return 2 * beta * sigma * sigma
}

/** Δx(t) of a free packet of width σ, chirp β and mass m: √(σ² + 2tC_xp/m + t²(Δp)²/m²) (the notes' Eq. of p. 11). β = 0 gives σ√(1 + (t/t_s)²). */
export function chirpWidth(sigma: number, beta: number, t: number, m = 1): number {
  if (!(sigma > 0) || !(m > 0)) throw new Error('chirpWidth: σ and m must be positive')
  const C = chirpCovariance(sigma, beta)
  const dp = chirpSpreadP(sigma, beta)
  return Math.sqrt(sigma * sigma + (2 * t * C) / m + (t * t * dp * dp) / (m * m))
}

/** The time and the width at which a chirped packet is narrowest, t* = −mC_xp/(Δp)² and √(σ² − C_xp²/(Δp)²); a packet with C_xp ≥ 0 is narrowest at t = 0. */
export function chirpFocus(sigma: number, beta: number, m = 1): { time: number; width: number } {
  const C = chirpCovariance(sigma, beta)
  const dp = chirpSpreadP(sigma, beta)
  const time = Math.max(0, (-m * C) / (dp * dp))
  return { time, width: chirpWidth(sigma, beta, time, m) }
}

/** The time at which a free Gaussian of width σ has grown to `ratio` times that width, t_s·√(ratio² − 1), with t_s = 2mσ²/ħ (SI when the call passes SI numbers). */
export function widthTime(sigma: number, ratio: number, m = 1, hbar = 1): number {
  if (!(ratio > 1)) throw new Error('widthTime: the ratio must exceed 1')
  return spreadScale(sigma, m, hbar) * Math.sqrt(ratio * ratio - 1)
}

/** ⟨p̂²⟩ = ‖p̂ψ‖² of a normalised state on the grid (twice the kinetic energy of m = 1). */
export function momentumSquareMean(psi: Wave, g: Grid): number {
  return 2 * kineticEnergy(psi, g, 1)
}

/** ⟨f(x̂)⟩ = ∫ f(x)|ψ|² dx on the grid. */
export function meanOf(psi: Wave, g: Grid, f: (x: number) => number): number {
  let s = 0
  for (let j = 0; j < g.n; j++) s += f(g.x[j]) * (psi.re[j] * psi.re[j] + psi.im[j] * psi.im[j])
  return s * g.dx
}

/**
 * d⟨Â⟩/dt = (i/ħ)⟨[Ĥ, Â]⟩ for Ĥ = p̂²/2m + V(x̂) and Â = x̂ or p̂ (ħ = 1), computed as the commutator itself on the grid: Ĥ(Âψ) − Â(Ĥψ) with the spectral p̂ and V a multiplication,
 * then −Im⟨ψ|·⟩ (the expectation of an anti-Hermitian operator is imaginary, so Re(i z) = −Im z). The packet and V(x)ψ must stay away from the edge of the periodic window (|x| ≲ 20).
 */
export function commutatorRate(psi: Wave, g: Grid, V: (x: number) => number, which: 'x' | 'p', m = 1): number {
  if (!(m > 0)) throw new Error('commutatorRate: the mass must be positive')
  const H = (w: Wave): Wave => {
    const kin = pOp(pOp(w, g), g)
    const re = new Float64Array(g.n)
    const im = new Float64Array(g.n)
    for (let j = 0; j < g.n; j++) {
      const v = V(g.x[j])
      re[j] = kin.re[j] / (2 * m) + v * w.re[j]
      im[j] = kin.im[j] / (2 * m) + v * w.im[j]
    }
    return { re, im }
  }
  const A = (w: Wave): Wave => (which === 'x' ? xTimes(w, g) : pOp(w, g))
  const a = H(A(psi))
  const b = A(H(psi))
  const C: Wave = { re: new Float64Array(g.n), im: new Float64Array(g.n) }
  for (let j = 0; j < g.n; j++) {
    C.re[j] = a.re[j] - b.re[j]
    C.im[j] = a.im[j] - b.im[j]
  }
  return -innerProduct(psi, C, g).im
}

/**
 * d⟨X⟩/dt for one spin under H = ħωZ/2 started in |+x⟩, in units of ω, from the rate law (i/ħ)⟨[H, X]⟩ at ωt = `omegaT` (ħ = ω = 1): the ket is evolved by e^{−iHt}, and the commutator is formed
 * from the 2 × 2 matrices; the solution ⟨X⟩ = cos ωt is never used.
 */
export function spinMeanRate(omegaT: number): number {
  const H = mscale(SIGMA_Z, 0.5)
  const psi = evolveKet(H, omegaT, KET['+x'])
  const comm = msub(matmul(H, SIGMA_X), matmul(SIGMA_X, H))
  return -sandwich(comm, psi).im
}
