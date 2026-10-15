/**
 * A particle on a line (Lectures 12 and 13, notes §12.4–12.8 and §13.1–13.10; Townsend Ch. 6): the wavefunction ψ(x) = ⟨x|ψ⟩ sampled on a
 * fixed periodic grid, with the operators the lectures apply to it. ħ = m = 1 inside the engine: lengths are in a fixed length ℓ, momenta
 * in ħ/ℓ and times in mℓ²/ħ (the UI appends the units).
 *
 * The grid is N = 4096 points on [−32, 32) (dx = 1/64). Position-space operators are exact multiplications (x̂ψ = xψ). Momentum-space ones are
 * spectral: p̂ is multiplication by k after a fast Fourier transform, so p̂ψ = −iψ′ to machine precision for a band-limited ψ, and
 * T(a) = e^{−iap̂} is the phase e^{−ika} in k-space (a shift of the graph, ψ_a(x) = ψ(x − a)). Plane waves and sums of two plane waves are
 * not normalisable and never live on the periodic grid: they are ANALYTIC (`planeSamples`).
 *
 * Every function has an independent numpy twin (pipeline/make_fixtures.py `lecture12_13_cases`: np.fft, closed-form Gaussians, erf, scipy's
 * CubicSpline and quad, explicit finite differences) and property tests (wave.test.ts). Pure: no clock, no randomness.
 */

/** A sampled complex function: `re[j] + i·im[j]` at grid point j. */
export interface Wave {
  re: Float64Array
  im: Float64Array
}

export interface Grid {
  /** number of samples (a power of two) */
  n: number
  /** length of the periodic box, in ℓ */
  length: number
  dx: number
  /** the grid points x_j = −length/2 + j·dx */
  x: Float64Array
  /** the wave numbers of the transform (= momenta, ħ = 1), in numpy's fftfreq order: 0, dk, …, −dk */
  k: Float64Array
  dk: number
}

export function makeGrid(n: number, length: number): Grid {
  if (!Number.isInteger(Math.log2(n)) || n < 8) throw new Error('makeGrid: n must be a power of two ≥ 8')
  const dx = length / n
  const dk = (2 * Math.PI) / length
  const x = new Float64Array(n)
  const k = new Float64Array(n)
  for (let j = 0; j < n; j++) {
    x[j] = -length / 2 + dx * j
    k[j] = dk * (j < n / 2 ? j : j - n)
  }
  return { n, length, dx, x, k, dk }
}

/** The lectures' grid: N = 4096 on [−32, 32), dx = 1/64. */
export const GRID: Grid = makeGrid(4096, 64)

/** Momenta above this magnitude are dropped by `translateBySteps` (the product (1 − iap̂/N)^N amplifies a grid's round-off at high p). */
export const P_CUT = 40

/* ---------------------------------------------------- the fast Fourier transform ---------------------------------------------------- */
interface Plan {
  cos: Float64Array
  sin: Float64Array
  rev: Uint32Array
}
const plans = new Map<number, Plan>()
function planFor(n: number): Plan {
  let p = plans.get(n)
  if (!p) {
    const bits = Math.log2(n)
    const rev = new Uint32Array(n)
    for (let i = 0; i < n; i++) {
      let r = 0
      for (let b = 0; b < bits; b++) if (i & (1 << b)) r |= 1 << (bits - 1 - b)
      rev[i] = r
    }
    const cos = new Float64Array(n / 2)
    const sin = new Float64Array(n / 2)
    for (let j = 0; j < n / 2; j++) {
      cos[j] = Math.cos((2 * Math.PI * j) / n)
      sin[j] = Math.sin((2 * Math.PI * j) / n)
    }
    p = { cos, sin, rev }
    plans.set(n, p)
  }
  return p
}

/** In-place FFT. Forward: X_m = Σ_j x_j e^{−2πi mj/N}. Inverse: the conjugate kernel, divided by N (so it undoes the forward one). */
export function fft(re: Float64Array, im: Float64Array, inverse = false): void {
  const n = re.length
  const { cos, sin, rev } = planFor(n)
  for (let i = 0; i < n; i++) {
    const r = rev[i]
    if (r > i) {
      const tr = re[i]
      re[i] = re[r]
      re[r] = tr
      const ti = im[i]
      im[i] = im[r]
      im[r] = ti
    }
  }
  const sgn = inverse ? 1 : -1
  for (let size = 2; size <= n; size <<= 1) {
    const half = size >> 1
    const step = n / size
    for (let start = 0; start < n; start += size) {
      for (let j = 0, t = 0; j < half; j++, t += step) {
        const wr = cos[t]
        const wi = sgn * sin[t]
        const a = start + j
        const b = a + half
        const xr = re[b] * wr - im[b] * wi
        const xi = re[b] * wi + im[b] * wr
        re[b] = re[a] - xr
        im[b] = im[a] - xi
        re[a] += xr
        im[a] += xi
      }
    }
  }
  if (inverse) {
    const s = 1 / n
    for (let i = 0; i < n; i++) {
      re[i] *= s
      im[i] *= s
    }
  }
}

/** Multiply in k-space by the complex factor (fr[m] + i·fi[m]): FFT, multiply, inverse FFT. */
function spectral(psi: Wave, fr: Float64Array, fi: Float64Array): Wave {
  const re = psi.re.slice()
  const im = psi.im.slice()
  fft(re, im)
  for (let m = 0; m < re.length; m++) {
    const a = re[m]
    const b = im[m]
    re[m] = a * fr[m] - b * fi[m]
    im[m] = a * fi[m] + b * fr[m]
  }
  fft(re, im, true)
  return { re, im }
}
const factor = (g: Grid, fn: (k: number) => [number, number]): [Float64Array, Float64Array] => {
  const fr = new Float64Array(g.n)
  const fi = new Float64Array(g.n)
  for (let m = 0; m < g.n; m++) {
    const [a, b] = fn(g.k[m])
    fr[m] = a
    fi[m] = b
  }
  return [fr, fi]
}

/* ---------------------------------------------------- states ---------------------------------------------------- */
export interface PacketParams {
  x0: number
  sigma: number
  p0?: number
}

/** The Gaussian packet ψ(x) = (2πσ²)^{−1/4} e^{−(x−x₀)²/4σ²} e^{ip₀x}: ⟨x⟩ = x₀, Δx = σ, ⟨p⟩ = p₀, Δp = ħ/2σ. */
export function packet(g: Grid, { x0, sigma, p0 = 0 }: PacketParams): Wave {
  const amp = Math.pow(2 * Math.PI * sigma * sigma, -0.25)
  const re = new Float64Array(g.n)
  const im = new Float64Array(g.n)
  for (let j = 0; j < g.n; j++) {
    const env = amp * Math.exp(-((g.x[j] - x0) ** 2) / (4 * sigma * sigma))
    re[j] = env * Math.cos(p0 * g.x[j])
    im[j] = env * Math.sin(p0 * g.x[j])
  }
  return { re, im }
}

export const copy = (psi: Wave): Wave => ({ re: psi.re.slice(), im: psi.im.slice() })

/** |ψ|² at every grid point. */
export function density(psi: Wave): Float64Array {
  const d = new Float64Array(psi.re.length)
  for (let j = 0; j < d.length; j++) d[j] = psi.re[j] * psi.re[j] + psi.im[j] * psi.im[j]
  return d
}

/** ∫|ψ|²dx (a Riemann sum on the grid: spectrally exact for a band-limited, localised ψ). */
export function norm(psi: Wave, g: Grid): number {
  let s = 0
  for (let j = 0; j < g.n; j++) s += psi.re[j] * psi.re[j] + psi.im[j] * psi.im[j]
  return s * g.dx
}

/** ⟨x̂⟩ = ∫x|ψ|²dx (not divided by the norm: lectures use normalised states). */
export function meanX(psi: Wave, g: Grid): number {
  let s = 0
  for (let j = 0; j < g.n; j++) s += g.x[j] * (psi.re[j] * psi.re[j] + psi.im[j] * psi.im[j])
  return s * g.dx
}

/** ⟨x̂²⟩ = ∫x²|ψ|²dx */
export function meanX2(psi: Wave, g: Grid): number {
  let s = 0
  for (let j = 0; j < g.n; j++) s += g.x[j] * g.x[j] * (psi.re[j] * psi.re[j] + psi.im[j] * psi.im[j])
  return s * g.dx
}

/** Δx = √(⟨x̂²⟩ − ⟨x̂⟩²), computed as the spread about the mean (no cancellation). */
export function spreadX(psi: Wave, g: Grid): number {
  const m = meanX(psi, g)
  let s = 0
  for (let j = 0; j < g.n; j++) s += (g.x[j] - m) ** 2 * (psi.re[j] * psi.re[j] + psi.im[j] * psi.im[j])
  return Math.sqrt(s * g.dx)
}

/* ---------------------------------------------------- operators ---------------------------------------------------- */
/** dψ/dx, spectrally: IFFT(ik · FFT ψ). */
export function dpdx(psi: Wave, g: Grid): Wave {
  const [fr, fi] = factor(g, (k) => [0, k])
  return spectral(psi, fr, fi)
}

/** (p̂ψ)(x) = −iħ ψ′(x) (ħ = 1), spectrally: multiplication by k in k-space. */
export function pOp(psi: Wave, g: Grid): Wave {
  const [fr, fi] = factor(g, (k) => [k, 0])
  return spectral(psi, fr, fi)
}

/** −iψ′ by central differences on the periodic grid: (ψ_{j+1} − ψ_{j−1})/(2dx), an independent route for `pOp` (error O(dx²)). */
export function pOpFD(psi: Wave, g: Grid): Wave {
  const n = g.n
  const re = new Float64Array(n)
  const im = new Float64Array(n)
  for (let j = 0; j < n; j++) {
    const a = (j + 1) % n
    const b = (j + n - 1) % n
    const dre = (psi.re[a] - psi.re[b]) / (2 * g.dx)
    const dim = (psi.im[a] - psi.im[b]) / (2 * g.dx)
    // −i (dre + i dim) = dim − i dre
    re[j] = dim
    im[j] = -dre
  }
  return { re, im }
}

/** (x̂ψ)(x) = xψ(x): multiplication by x. */
export function xTimes(psi: Wave, g: Grid): Wave {
  const re = new Float64Array(g.n)
  const im = new Float64Array(g.n)
  for (let j = 0; j < g.n; j++) {
    re[j] = g.x[j] * psi.re[j]
    im[j] = g.x[j] * psi.im[j]
  }
  return { re, im }
}

/** T(a) = e^{−iap̂}: the state moved right by a, ψ_a(x) = ψ(x − a) (phase e^{−ika} in k-space). */
export function translate(psi: Wave, g: Grid, a: number): Wave {
  const [fr, fi] = factor(g, (k) => [Math.cos(k * a), -Math.sin(k * a)])
  return spectral(psi, fr, fi)
}

/**
 * (I − iap̂/N)^N ψ: N tiny shifts chained. It tends to T(a) as N grows, with a gap that shrinks like 1/N, but for any finite N it is NOT
 * unitary (each step multiplies the momentum-k part by √(1 + (ka/N)²)). Momenta above `P_CUT` are dropped, because the product amplifies
 * the grid's round-off there.
 */
export function translateBySteps(psi: Wave, g: Grid, a: number, steps: number): Wave {
  if (!Number.isInteger(steps) || steps < 1) throw new Error('translateBySteps: N must be a whole number ≥ 1')
  const [fr, fi] = factor(g, (k) => {
    if (Math.abs(k) > P_CUT) return [0, 0]
    const u = (k * a) / steps
    const r = Math.pow(1 + u * u, steps / 2)
    const th = -steps * Math.atan(u)
    return [r * Math.cos(th), r * Math.sin(th)]
  })
  return spectral(psi, fr, fi)
}

/** e^{iεx̂}ψ: adds ε to the momentum of every part (a boost). */
export function boost(psi: Wave, g: Grid, eps: number): Wave {
  const re = new Float64Array(g.n)
  const im = new Float64Array(g.n)
  for (let j = 0; j < g.n; j++) {
    const c = Math.cos(eps * g.x[j])
    const s = Math.sin(eps * g.x[j])
    re[j] = psi.re[j] * c - psi.im[j] * s
    im[j] = psi.re[j] * s + psi.im[j] * c
  }
  return { re, im }
}

/** e^{−iĤt}ψ for the free particle Ĥ = p̂²/2m (ħ = 1): the phase e^{−ik²t/2m} in k-space. */
export function freeEvolve(psi: Wave, g: Grid, t: number, m = 1): Wave {
  const [fr, fi] = factor(g, (k) => [Math.cos((k * k * t) / (2 * m)), -Math.sin((k * k * t) / (2 * m))])
  return spectral(psi, fr, fi)
}

/** Shift then free evolution in ONE transform pair (both are functions of p̂ alone, so they commute and combine): e^{−iap̂ − itp̂²/2m}ψ. */
export function shiftAndEvolve(psi: Wave, g: Grid, a: number, t: number, m = 1): Wave {
  const [fr, fi] = factor(g, (k) => {
    const ph = -(k * a + (k * k * t) / (2 * m))
    return [Math.cos(ph), Math.sin(ph)]
  })
  return spectral(psi, fr, fi)
}

/** x̂p̂ψ − p̂x̂ψ: for every smooth, localised ψ this is iħψ (the commutator [x̂, p̂] = iħ, L13). */
export function commutatorXP(psi: Wave, g: Grid): Wave {
  const a = xTimes(pOp(psi, g), g)
  const b = pOp(xTimes(psi, g), g)
  const re = new Float64Array(g.n)
  const im = new Float64Array(g.n)
  for (let j = 0; j < g.n; j++) {
    re[j] = a.re[j] - b.re[j]
    im[j] = a.im[j] - b.im[j]
  }
  return { re, im }
}

/** ⟨φ|ψ⟩ = ∫φ*ψ dx */
export function innerProduct(phi: Wave, psi: Wave, g: Grid): { re: number; im: number } {
  let re = 0
  let im = 0
  for (let j = 0; j < g.n; j++) {
    re += phi.re[j] * psi.re[j] + phi.im[j] * psi.im[j]
    im += phi.re[j] * psi.im[j] - phi.im[j] * psi.re[j]
  }
  return { re: re * g.dx, im: im * g.dx }
}

/** ⟨p̂⟩ and Δp = √(⟨p̂²⟩ − ⟨p̂⟩²) from ONE p̂ψ (⟨p̂²⟩ = ‖p̂ψ‖²): spectral. */
export function momentumMoments(psi: Wave, g: Grid): { mean: number; spread: number } {
  const pp = pOp(psi, g)
  const mean = innerProduct(psi, pp, g).re
  return { mean, spread: Math.sqrt(Math.max(0, norm(pp, g) - mean * mean)) }
}

/** ⟨p̂⟩ = ∫ψ*(−iψ′)dx (real for any ψ; spectral). */
export function meanP(psi: Wave, g: Grid): number {
  return momentumMoments(psi, g).mean
}

/** Δp = √(⟨p̂²⟩ − ⟨p̂⟩²). */
export function spreadP(psi: Wave, g: Grid): number {
  return momentumMoments(psi, g).spread
}

/* ---------------------------------------------------- the momentum representation ---------------------------------------------------- */
export interface MomentumWave {
  /** the momenta, in INCREASING order from −N·dk/2 */
  p: Float64Array
  /** φ(p_m) = (2π)^{−1/2} ∫e^{−ipx}ψ(x)dx, as a Riemann sum over the grid */
  phi: Wave
}

/** φ(p) with its true phase: dx/√(2π) · e^{ipL/2} · FFT (the transform of a box starting at −L/2), ordered by increasing p. */
export function toMomentum(psi: Wave, g: Grid): MomentumWave {
  const re = psi.re.slice()
  const im = psi.im.slice()
  fft(re, im)
  const n = g.n
  const c = g.dx / Math.sqrt(2 * Math.PI)
  const p = new Float64Array(n)
  const out: Wave = { re: new Float64Array(n), im: new Float64Array(n) }
  for (let i = 0; i < n; i++) {
    const m = (i + n / 2) % n // fftshift: increasing p
    const ph = (g.k[m] * g.length) / 2
    const cs = Math.cos(ph)
    const sn = Math.sin(ph)
    out.re[i] = c * (re[m] * cs - im[m] * sn)
    out.im[i] = c * (re[m] * sn + im[m] * cs)
    p[i] = g.k[m]
  }
  return { p, phi: out }
}

/** The inverse of `toMomentum`: ψ(x) from φ(p) (both ordered as `toMomentum` returns them). */
export function fromMomentum(phi: Wave, g: Grid): Wave {
  const n = g.n
  const c = Math.sqrt(2 * Math.PI) / g.dx
  const re = new Float64Array(n)
  const im = new Float64Array(n)
  for (let i = 0; i < n; i++) {
    const m = (i + n / 2) % n
    const ph = -(g.k[m] * g.length) / 2
    const cs = Math.cos(ph)
    const sn = Math.sin(ph)
    re[m] = c * (phi.re[i] * cs - phi.im[i] * sn)
    im[m] = c * (phi.re[i] * sn + phi.im[i] * cs)
  }
  fft(re, im, true)
  return { re, im }
}

/* ---------------------------------------------------- chances over an interval ---------------------------------------------------- */
/**
 * ∫|ψ|²dx over a stretch, as the EXACT integral of the natural cubic spline of |ψ|² through the grid nodes (agrees with erf to 2e−7 for a
 * Gaussian packet of width σ ≥ 1/8). Build it once, then ask for as many stretches as you like.
 */
export interface DensitySpline {
  /** ∫ₐᵇ of the spline (a and b clamped to the grid; a > b gives the negative) */
  integral(a: number, b: number): number
}
export function densitySpline(psi: Wave, g: Grid): DensitySpline {
  const n = g.n
  const h = g.dx
  const y = density(psi)
  // natural spline: M₀ = M_{n−1} = 0 and M_{j−1} + 4M_j + M_{j+1} = 6(y_{j+1} − 2y_j + y_{j−1})/h²
  const M = new Float64Array(n)
  const cp = new Float64Array(n)
  const dp = new Float64Array(n)
  for (let j = 1; j < n - 1; j++) {
    const rhs = (6 * (y[j + 1] - 2 * y[j] + y[j - 1])) / (h * h)
    const denom = 4 - (j > 1 ? cp[j - 1] : 0)
    cp[j] = 1 / denom
    dp[j] = (rhs - (j > 1 ? dp[j - 1] : 0)) / denom
  }
  for (let j = n - 2; j >= 1; j--) M[j] = dp[j] - cp[j] * M[j + 1]
  // ∫ over t ∈ [0, u] of the segment j, times h
  const seg = (j: number, u: number): number => {
    const A = u - (u * u) / 2 // ∫₀ᵘ (1 − t) dt, the weight of y_j
    const B = (u * u) / 2 // ∫₀ᵘ t dt, the weight of y_{j+1}
    const C = -(Math.pow(1 - u, 4) - 1) / 4 + (Math.pow(1 - u, 2) - 1) / 2 // ∫₀ᵘ ((1−t)³ − (1−t)) dt
    const D = Math.pow(u, 4) / 4 - (u * u) / 2 // ∫₀ᵘ (t³ − t) dt
    return h * (y[j] * A + y[j + 1] * B + ((h * h) / 6) * (M[j] * C + M[j + 1] * D))
  }
  const cum = new Float64Array(n)
  for (let j = 1; j < n; j++) cum[j] = cum[j - 1] + seg(j - 1, 1)
  const F = (x: number): number => {
    const t = (x - g.x[0]) / h
    if (t <= 0) return 0
    if (t >= n - 1) return cum[n - 1]
    const j = Math.floor(t)
    return cum[j] + seg(j, t - j)
  }
  return { integral: (a, b) => F(b) - F(a) }
}

/** P(a < x < b) = ∫ₐᵇ|ψ|²dx (see `densitySpline`). */
export function interval(psi: Wave, g: Grid, a: number, b: number): number {
  return densitySpline(psi, g).integral(a, b)
}

/** Chop [lo, hi] into n equal cells and return each cell's chance ∫|ψ|²dx. */
export function cellChances(psi: Wave, g: Grid, range: readonly [number, number], n: number): number[] {
  if (!Number.isInteger(n) || n < 1) throw new Error('cellChances: n must be a whole number ≥ 1')
  const sp = densitySpline(psi, g)
  const w = (range[1] - range[0]) / n
  const out: number[] = []
  for (let i = 0; i < n; i++) out.push(sp.integral(range[0] + i * w, range[0] + (i + 1) * w))
  return out
}

/** max |ψ|² over the grid, in the probability per ℓ. */
export function peakDensity(psi: Wave): number {
  let m = 0
  for (let j = 0; j < psi.re.length; j++) m = Math.max(m, psi.re[j] * psi.re[j] + psi.im[j] * psi.im[j])
  return m
}

/* ---------------------------------------------------- analytic plane waves ---------------------------------------------------- */
/**
 * ψ at the given x for a plane wave e^{ipx} (or the sum of two, (e^{ip₁x} + e^{ip₂x})/√2), after a boost, a shift and a free evolution,
 * applied in that order. Not on the grid (a plane wave is not normalisable): boost adds ε to every momentum, a shift multiplies by
 * e^{−ipa}, a time t by e^{−ip²t/2}, evaluated per plane component.
 */
export function planeSamples(xs: ArrayLike<number>, momenta: readonly number[], o: { boost?: number; shift?: number; time?: number } = {}): Wave {
  const eps = o.boost ?? 0
  const a = o.shift ?? 0
  const t = o.time ?? 0
  const amp = 1 / Math.sqrt(momenta.length)
  const re = new Float64Array(xs.length)
  const im = new Float64Array(xs.length)
  for (const p0 of momenta) {
    const p = p0 + eps
    for (let j = 0; j < xs.length; j++) {
      const ph = p * (xs[j] - a) - (p * p * t) / 2
      re[j] += amp * Math.cos(ph)
      im[j] += amp * Math.sin(ph)
    }
  }
  return { re, im }
}

/** Sample a grid wave at the given grid indices. */
export function pick(psi: Wave, idx: readonly number[]): Wave {
  return { re: Float64Array.from(idx, (j) => psi.re[j]), im: Float64Array.from(idx, (j) => psi.im[j]) }
}

/**
 * The grid indices with x in [lo, hi], thinned to at most `max` points: a power-of-two stride over the ABSOLUTE index (so x = 0 and every
 * multiple of the stride are always sampled), plus the first and the last point of the window.
 */
export function windowIndices(g: Grid, lo: number, hi: number, max: number): number[] {
  const j0 = Math.max(0, Math.ceil((lo - g.x[0]) / g.dx - 1e-9))
  const j1 = Math.min(g.n - 1, Math.floor((hi - g.x[0]) / g.dx + 1e-9))
  let stride = 1
  while (Math.ceil((j1 - j0 + 1) / stride) > max) stride *= 2
  const out: number[] = [j0]
  for (let j = Math.ceil((j0 + 1) / stride) * stride; j < j1; j += stride) out.push(j)
  if (j1 > j0) out.push(j1)
  return out
}
