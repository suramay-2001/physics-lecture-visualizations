/**
 * Readout classification (Papers background chapter B5, "From pixels to bits"; P-B5-story §9.1, rulings gandalf-batch.md G1-G3). Pure functions, ħ-free, no clock and no randomness
 * (the seeded frame draw is physics/optics/imaging.ts `cameraFrame`, which this module does not repeat). Our model throughout: an atom puts `N` detected photons into a Gaussian spot
 * of width σ pixels; every pixel also collects a background `b`; counts are Poisson. These are labelled model inputs, never an experiment's.
 *
 * Numpy twin: pipeline/claims_papers/b5.py (scipy `poisson`, `erf`, `numpy.linalg`, an enumeration of the joint counts, a seeded Monte Carlo and a seeded regression for checks).
 * The count statistics of ONE site (scattering, collection, the Poisson histogram, the EMCCD law, the threshold) are the experiment track's (physics/optics/imaging.ts); what is here
 * is whole frames: ROI, crosstalk, weights, learned filters, linear cascades, network sizes and the posterior of a cleaner's prior.
 */
import { poissonCdf, poissonPmf, psfShare } from '../optics/imaging'

/* ------------------------------------------------ the spot on the grid ------------------------------------------------ */
/** The share of a Gaussian line (width σ pixels) in a pixel whose centre is `x` pixels from the line's centre. */
export const psfPixelShare = (sigma: number, x: number): number => psfShare(x, 0, sigma)

/** Mean photons per pixel of a rows × cols frame: atoms at `sites` (row, column) with `photons` each over a Gaussian spot of width `sigma`, plus a flat `background`. Row-major. */
export function psfFrame(sites: readonly (readonly [number, number])[], sigma: number, photons: number, background: number, rows: number, cols: number): number[] {
  const out = new Array<number>(rows * cols).fill(background)
  for (const [r0, c0] of sites) {
    const sr = Array.from({ length: rows }, (_, i) => psfShare(i, r0, sigma))
    const sc = Array.from({ length: cols }, (_, j) => psfShare(j, c0, sigma))
    for (let i = 0; i < rows; i++) for (let j = 0; j < cols; j++) out[i * cols + j] += photons * sr[i] * sc[j]
  }
  return out
}

/** The share of one atom's light inside a (2·half + 1)-pixel-wide window centred `delta` pixels away (one axis; the other axis is taken as fully inside). */
export const windowShare = (delta: number, sigma: number, half: number): number => {
  let s = 0
  for (let i = -half; i <= half; i++) s += psfShare(delta + i, 0, sigma)
  return s
}

/** The share of one atom's light inside a size × size box centred on it (size odd): the product of the one-axis sums. */
export const boxShare = (size: number, sigma: number): number => windowShare(0, sigma, (size - 1) / 2) ** 2

/** The three symmetry classes of a 3 × 3 region around a centred atom: the centre (1 pixel), the edges (4) and the corners (4). */
export const CLASSES_3X3: readonly number[] = [1, 4, 4]

/** The per-pixel mean photons of the three classes (centre, edge, corner) of an atom's spot: photons × share. */
export function classSignals(sigma: number, photons: number): [number, number, number] {
  const c = psfPixelShare(sigma, 0)
  const e = psfPixelShare(sigma, 1)
  return [photons * c * c, photons * c * e, photons * e * e]
}

/* ------------------------------------------------ the likelihood-ratio weights ------------------------------------------------ */
/** The likelihood-ratio weight of a pixel: ln(1 + s/b) (s the atom's mean photons in it, b the background). */
export const llrWeight = (s: number, b: number): number => {
  if (!(b > 0)) throw new RangeError('llrWeight: background > 0')
  return Math.log1p(s / b)
}
export const llrWeights = (s: readonly number[], b: number): number[] => s.map((x) => llrWeight(x, b))
/** The log-likelihood ratio of one pixel with count n: −s + n ln(1 + s/b). */
export const llrOnePixel = (n: number, s: number, b: number): number => -s + n * llrWeight(s, b)

/** d′² = Σ s²/b (the weak-signal separation of the best weighted sum; here with a common background). */
export function dprime2(s: readonly number[], b: number | readonly number[]): number {
  let t = 0
  s.forEach((x, i) => (t += (x * x) / (typeof b === 'number' ? b : b[i])))
  return t
}

/* ------------------------------------------------ exact errors of a weighted sum ------------------------------------------------ */
/** Poisson counts beyond which a class's probability is below 1e-17: its enumeration cap (a few more than mean + 8σ). */
const capOf = (m: number): number => Math.ceil(m + 9 * Math.sqrt(m) + 12)
/** The joint law of the class counts (independent Poisson sums, class k has `mult[k]` pixels of per-pixel mean `lam[k]`), as parallel arrays of (statistic, chance) for a weight vector. */
interface Joint {
  s: number[]
  p: number[]
}
function enumerate(weights: readonly number[], lam: readonly number[], mult: readonly number[], prune: number): Joint {
  const caps = lam.map((l, k) => capOf(mult[k] * l))
  const pm = caps.map((c, k) => Array.from({ length: c + 1 }, (_, n) => poissonPmf(n, mult[k] * lam[k])))
  const s: number[] = []
  const p: number[] = []
  const [w0, w1, w2] = weights
  for (let a = 0; a <= caps[0]; a++)
    for (let b = 0; b <= caps[1]; b++) {
      const pab = pm[0][a] * pm[1][b]
      if (pab < prune * 1e-3) continue
      for (let c = 0; c <= caps[2]; c++) {
        const q = pab * pm[2][c]
        if (q < prune) continue
        s.push(w0 * a + w1 * b + w2 * c)
        p.push(q)
      }
    }
  return { s, p }
}

/**
 * The smallest error of "bright when S ≥ cutoff" for the statistic S = Σ w_k n_k over three symmetry classes, equal priors:
 * error = ½ [P(read bright | dark) + P(read dark | bright)], by full enumeration of the joint counts (≤ 3 classes: the cap is stated, mass below 1e-17 per class is dropped).
 * `bright` and `dark` are the per-pixel mean photons of the three classes; `mult` the class sizes (default the 3 × 3 box: 1, 4, 4).
 */
export function statisticError(weights: readonly number[], bright: readonly number[], dark: readonly number[], mult: readonly number[] = CLASSES_3X3): { err: number; cutoff: number } {
  if (weights.length !== 3 || bright.length !== 3 || dark.length !== 3 || mult.length !== 3) throw new RangeError('statisticError: three classes')
  const J1 = enumerate(weights, bright, mult, 1e-24)
  const J0 = enumerate(weights, dark, mult, 1e-24)
  // merge by statistic value
  const all = new Map<number, [number, number]>()
  for (let i = 0; i < J1.s.length; i++) {
    const e = all.get(J1.s[i])
    if (e) e[0] += J1.p[i]
    else all.set(J1.s[i], [J1.p[i], 0])
  }
  for (let i = 0; i < J0.s.length; i++) {
    const e = all.get(J0.s[i])
    if (e) e[1] += J0.p[i]
    else all.set(J0.s[i], [0, J0.p[i]])
  }
  const keys = [...all.keys()].sort((a, b) => a - b)
  let cum1 = 0
  let cum0 = 0
  let tot0 = 0
  for (const k of keys) tot0 += all.get(k)![1]
  let best = 0.5 * (tot0 + 0) // cutoff below everything: call everything bright
  let cutoff = keys[0]
  for (const k of keys) {
    const [a, b] = all.get(k)!
    cum1 += a
    cum0 += b
    // cutoff just above k: bright iff S > k
    const e = 0.5 * (tot0 - cum0 + cum1)
    if (e < best) {
      best = e
      cutoff = k
    }
  }
  return { err: best, cutoff }
}

/** The Bayes error of telling the bright law from the dark law with the three class counts: ½ Σ min(P₁, P₀). Reached by the likelihood-ratio statistic. */
export function bayesError(bright: readonly number[], dark: readonly number[], mult: readonly number[] = CLASSES_3X3): number {
  const caps = bright.map((l, k) => capOf(mult[k] * l))
  const pm = (lam: readonly number[]) => caps.map((c, k) => Array.from({ length: c + 1 }, (_, n) => poissonPmf(n, mult[k] * lam[k])))
  const P1 = pm(bright)
  const P0 = pm(dark)
  let t = 0
  for (let a = 0; a <= caps[0]; a++)
    for (let b = 0; b <= caps[1]; b++)
      for (let c = 0; c <= caps[2]; c++) t += Math.min(P1[0][a] * P1[1][b] * P1[2][c], P0[0][a] * P0[1][b] * P0[2][c])
  return 0.5 * t
}

/** The smallest error of a threshold on a Poisson sum: dark mean m0, bright mean m1 (a sum of independent Poisson counts is Poisson), equal priors. Equals the experiment track's threshold error. */
export function poissonSumError(m1: number, m0: number): { err: number; cutoff: number } {
  let best = Infinity
  let cutoff = 0
  const top = Math.ceil(m1 + 10 * Math.sqrt(m1) + 20)
  for (let c = 0; c <= top; c++) {
    const e = 0.5 * (1 - poissonCdf(c - 1, m0) + poissonCdf(c - 1, m1))
    if (e < best) {
      best = e
      cutoff = c
    }
  }
  return { err: best, cutoff }
}

/** The normal-approximation error ½ erfc(d′/(2√2)) = Q(d′/2): what d′ alone predicts (it misjudges the Poisson tails). */
export function normalError(d: number, tail: (z: number) => number): number {
  return tail(d / 2)
}

/* ------------------------------------------------ the learned filter (population least squares) ------------------------------------------------ */
/** Solve A x = y for a symmetric positive semi-definite A by Gauss-Jordan with partial pivoting; a pivot below `tiny` × the largest diagonal leaves that unknown at 0 (a consistent singular system). */
export function solveSym(A: readonly (readonly number[])[], y: readonly number[], tiny = 1e-12): number[] {
  const n = y.length
  const M = A.map((row, i) => [...row, y[i]])
  const scale = Math.max(1e-300, ...A.map((r, i) => Math.abs(r[i])))
  const piv: number[] = []
  let row = 0
  for (let col = 0; col < n && row < n; col++) {
    let p = row
    for (let r = row + 1; r < n; r++) if (Math.abs(M[r][col]) > Math.abs(M[p][col])) p = r
    if (Math.abs(M[p][col]) <= tiny * scale) continue
    ;[M[row], M[p]] = [M[p], M[row]]
    const d = M[row][col]
    for (let c = col; c <= n; c++) M[row][c] /= d
    for (let r = 0; r < n; r++) {
      if (r === row) continue
      const f = M[r][col]
      if (f !== 0) for (let c = col; c <= n; c++) M[r][c] -= f * M[row][c]
    }
    piv.push(col)
    row++
  }
  const x = new Array<number>(n).fill(0)
  piv.forEach((col, r) => (x[col] = M[r][n]))
  return x
}

/**
 * The population least-squares filter for atom `target` among atoms whose mean-photon profiles over the pixels are `profiles` (each atom present with chance `p`, independently; a flat
 * background `b`): W = Cov(n)⁻¹ Cov(n, a_target), with Cov(n) = diag(b + p Σ s_k) + p(1 − p) Σ s_k s_kᵀ and Cov(n, a_target) = p(1 − p) s_target.
 * (A fit of the 0/1 label on the pixel counts, centred: Kent et al. Eq. A1 in its population form.) For one isolated atom the weights are ∝ s / (b + p s).
 */
export function populationFilter(profiles: readonly (readonly number[])[], target: number, p: number, b: number): number[] {
  const n = profiles[0].length
  const mu = new Array<number>(n).fill(b)
  for (const s of profiles) for (let i = 0; i < n; i++) mu[i] += p * s[i]
  const C = Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => (i === j ? mu[i] : 0)))
  for (const s of profiles) for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) C[i][j] += p * (1 - p) * s[i] * s[j]
  return solveSym(C, profiles[target].map((x) => p * (1 - p) * x))
}

/** Isolated atom, prior p: q = sᵀ D⁻¹ s with D = diag(b + p s), and the shrink factor p(1 − p) q / (1 + p(1 − p) q) of the Wiener smoother (Sherman-Morrison). */
export function isolatedQ(s: readonly number[], b: number, p: number): { q: number; shrink: number } {
  let q = 0
  for (const x of s) q += (x * x) / (b + p * x)
  const k = p * (1 - p) * q
  return { q, shrink: k / (1 + k) }
}

/** The Wiener smoother W = C_s (C_s + C_n)⁻¹ for one atom of profile s with prior p: C_s = p(1 − p) s sᵀ, C_n = diag(b + p s). Rank one: W = s vᵀ with v ∝ C_n⁻¹ s. Rows of the matrix. */
export function wienerSmoother(s: readonly number[], b: number, p: number): number[][] {
  const n = s.length
  const mu = s.map((x) => b + p * x)
  const Cs = Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => p * (1 - p) * s[i] * s[j]))
  const A = Cs.map((r, i) => r.map((v, j) => v + (i === j ? mu[i] : 0)))
  // W = Cs A^-1  <=>  A Wᵀ = Csᵀ (A and Cs symmetric): solve for each column
  const W: number[][] = Array.from({ length: n }, () => new Array<number>(n).fill(0))
  for (let j = 0; j < n; j++) {
    const col = solveSym(A, Cs.map((r) => r[j]))
    for (let i = 0; i < n; i++) W[j][i] = col[i]
  }
  return W
}

/** The Gaussian-approximation separation d² = (H Δ)ᵀ (H Σ Hᵀ)⁻¹ (H Δ) of the output of a linear map H (k rows), Δ = the atom's profile s and Σ = diag(b + p s) (a singular H Σ Hᵀ is solved on its range). */
export function linearD2(H: readonly (readonly number[])[], s: readonly number[], b: number, p: number): number {
  const mu = s.map((x) => b + p * x)
  const Hd = H.map((r) => r.reduce((t, h, j) => t + h * s[j], 0))
  const G = H.map((ri) => H.map((rj) => ri.reduce((t, h, j) => t + h * mu[j] * rj[j], 0)))
  const x = solveSym(G, Hd)
  return Hd.reduce((t, v, i) => t + v * x[i], 0)
}

/** The 1-D triangular blur kernel (¼, ½, ¼) as a matrix on n pixels (edges drop the missing taps). */
export function blurMatrix(n: number): number[][] {
  const K = Array.from({ length: n }, () => new Array<number>(n).fill(0))
  for (let i = 0; i < n; i++) [[i - 1, 0.25], [i, 0.5], [i + 1, 0.25]].forEach(([j, w]) => { if (j >= 0 && j < n) K[i][j] += w })
  return K
}

/* ------------------------------------------------ network sizes ------------------------------------------------ */
/** Parameters of a k × k convolution from `cin` to `cout` channels, with or without a bias per output channel. */
export const convParams = (k: number, cin: number, cout: number, bias = true): number => k * k * cin * cout + (bias ? cout : 0)
/** Parameters of a dense layer from `nin` to `nout` units (with biases). */
export const denseParams = (nin: number, nout: number): number => nin * nout + nout
/** The receptive field (pixels along one side) of a stack of layers listed input first, each `{k, stride}`: built from the output backwards, r ← (r − 1) · stride + k. */
export function receptiveField(layers: readonly { k: number; stride: number }[]): number {
  let r = 1
  for (let i = layers.length - 1; i >= 0; i--) r = (r - 1) * layers[i].stride + layers[i].k
  return r
}

/* ------------------------------------------------ a cleaner's prior and the GAN terms ------------------------------------------------ */
const sigmoid = (x: number): number => 1 / (1 + Math.exp(-x))
/** The chance the site is bright after seeing a frame whose log-likelihood ratio is `llr`, with prior chance `prior`: Bayes' rule in odds form. */
export const posteriorBright = (llr: number, prior: number): number => sigmoid(llr + Math.log(prior / (1 - prior)))
/** The prior at which a frame with log-likelihood ratio `llr` is a coin flip: sigmoid(−llr). */
export const flipPrior = (llr: number): number => sigmoid(-llr)
/** The change of the log-odds when the prior moves from `p0` to `p1`. */
export const logitShift = (p0: number, p1: number): number => Math.log(p1 / (1 - p1)) - Math.log(p0 / (1 - p0))
/** The two non-saturating GAN terms for a judge output D in (0, 1): −ln D (a fake scored D) and −ln(1 − D) (a real scored 1 − D... the judge's cost on a fake). */
export const ganTerms = (D: number): { generator: number; judgeFake: number } => ({ generator: -Math.log(D), judgeFake: -Math.log(1 - D) })
/** The floor of the cross-entropy with a soft target t: the entropy H(t) = −t ln t − (1 − t) ln(1 − t). */
export const smoothedBceFloor = (t: number): number => -(t * Math.log(t) + (1 - t) * Math.log(1 - t))
