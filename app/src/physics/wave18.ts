/**
 * Lecture 18 engine (448): a packet at a step or barrier, the probability current of a moving Gaussian, the step below the top (the evanescent wave), the exact barrier amplitudes, the
 * current inside a barrier, and the exponent of a smooth barrier. Every function is pure; ħ = m = 1 unless a call passes its own mass and ħ (the book's electron-volt and ångström
 * examples: `HBAR2_OVER_2M_EV_A2`). A lecture-only module: it is imported by content/L18.values.ts and nothing in the entry closure. Numpy twin of every `l18…` key:
 * pipeline/claims_448/l18.py (np.linalg.solve of the four matching conditions, scipy quad of the momentum average, np.fft split step with CubicSpline chances, a Crank–Nicolson march for
 * the engine cases); engine cases: physics/__fixtures__/wave18-cases.json. Tests: physics/wave18.test.ts.
 */
import { type C, abs2, c, conj, div, mul, scale } from './complex'
import { E_CHARGE, HBAR, M_ELECTRON } from './constants'
import { barrierT } from './scatter'
import { GRID, type Wave, barrierPotential, chanceAbove, chanceBelow, evolveV, norm, packet, stepPotential } from './wave'

/** ħ²/2mₑ in eV·Å² (CODATA 2018: 3.80998…): with it an electron's k² is E/this and q² is (V₀ − E)/this when lengths are in ångströms and energies in electron-volts. */
export const HBAR2_OVER_2M_EV_A2 = ((HBAR * HBAR) / (2 * M_ELECTRON) / E_CHARGE) * 1e20

/* ---------------------------------------------------- one quadrature for smooth and endpoint-singular integrands ---------------------------------------------------- */
/**
 * ∫ₐᵇ f dx by the tanh–sinh (double exponential) rule, step 1/16 on t ∈ [−4, 4]: about 1e−15 for an analytic f, and for one with a square-root singularity at an end (the turning
 * point of a barrier, the threshold of a step). The points are computed as distances from the ends, so f is never asked beyond the interval.
 */
export function integrate(f: (x: number) => number, a: number, b: number): number {
  if (!(b > a)) return 0
  const h = 1 / 16
  const half = (b - a) / 2
  let s = 0
  for (let j = -64; j <= 64; j++) {
    const t = j * h
    const u = (Math.PI / 2) * Math.sinh(t)
    const w = ((Math.PI / 2) * Math.cosh(t)) / Math.cosh(u) ** 2
    const d = (b - a) / (1 + Math.exp(2 * Math.abs(u))) // the distance from the nearer end
    const x = u < 0 ? a + d : b - d
    const v = f(x)
    if (v !== 0 && Number.isFinite(v)) s += w * v
  }
  return s * half * h
}

/* ---------------------------------------------------- the step below the top: the evanescent wave ---------------------------------------------------- */
export interface StepEvanescent {
  /** √(2mE)/ħ on the left */
  k: number
  /** κ = √(2m(V₀ − E))/ħ: the wave on the right is Ce^{−κx} */
  kappa: number
  /** r = B/A = (k − iκ)/(k + iκ): |r| = 1, so R = 1 */
  r: C
  /** |φ(0)|²/|A|² = |1 + r|²: the density at the edge, the incident density being 1 */
  edgeDensity: number
}

/**
 * The step V = 0 (x < 0), V₀ (x > 0) for 0 < E < V₀ (notes §18.5; Townsend Eqs. 6.137–6.140): φ_L = Ae^{ikx} + Be^{−ikx}, φ_R = Ce^{−κx}. A + B = C and ik(A − B) = −κC give
 * r = (k − iκ)/(k + iκ), a number of size one, and C = A(1 + r). The edge density is |1 + r|² = 4E/V₀. The numpy twin solves the two matching conditions as a complex 2 × 2 system.
 */
export function stepEvanescent(E: number, V0: number, m = 1, hbar = 1): StepEvanescent {
  if (!(E > 0) || !(V0 > E) || !(m > 0) || !(hbar > 0)) throw new Error('stepEvanescent: needs 0 < E < V0 and positive m and ħ')
  const k = Math.sqrt(2 * m * E) / hbar
  const kappa = Math.sqrt(2 * m * (V0 - E)) / hbar
  const r = div(c(k, -kappa), c(k, kappa))
  return { k, kappa, r, edgeDensity: abs2(c(1 + r.re, r.im)) }
}

/* ---------------------------------------------------- the barrier: amplitudes and the current inside ---------------------------------------------------- */
export interface BarrierAmplitudes {
  k: number
  kappa: number
  /** reflected, B/A */
  B: C
  /** inside, the growing exponential Ce^{κx}, C/A */
  C: C
  /** inside, the decaying exponential De^{−κx}, D/A */
  D: C
  /** transmitted, φ_III = Fe^{ik(x−a)}, F/A (so T = |F/A|²) */
  F: C
}

/**
 * All four amplitudes of the barrier of notes §18.7 for A = 1 and 0 < E < V₀ (width a, φ_I = Ae^{ikx} + Be^{−ikx}, φ_II = Ce^{κx} + De^{−κx}, φ_III = Fe^{ik(x−a)}). From Appendix A: propagating
 * φ(a) = F, φ′(a) = ikF back to 0 gives A/F = cosh κa + (i/2)(κ/k − k/κ) sinh κa, and then B/F = −(i/2)(k/κ + κ/k) sinh κa, C/F = ½e^{−κa}(1 + ik/κ), D/F = ½e^{κa}(1 − ik/κ).
 * The numpy twin solves the four matching conditions (Townsend Eq. 6.143, his F and G are our C and D) as a 4 × 4 complex linear system.
 */
export function barrierAmplitudes(E: number, V0: number, a: number, m = 1, hbar = 1): BarrierAmplitudes {
  if (!(E > 0) || !(V0 > E) || !(a >= 0) || !(m > 0) || !(hbar > 0)) throw new Error('barrierAmplitudes: needs 0 < E < V0, a ≥ 0 and positive m and ħ')
  const k = Math.sqrt(2 * m * E) / hbar
  const kappa = Math.sqrt(2 * m * (V0 - E)) / hbar
  const ch = Math.cosh(kappa * a)
  const sh = Math.sinh(kappa * a)
  const AoverF = c(ch, 0.5 * (kappa / k - k / kappa) * sh)
  const F = div(c(1), AoverF)
  return {
    k,
    kappa,
    B: mul(F, c(0, -0.5 * (k / kappa + kappa / k) * sh)),
    C: mul(F, scale(c(1, k / kappa), 0.5 * Math.exp(-kappa * a))),
    D: mul(F, scale(c(1, -k / kappa), 0.5 * Math.exp(kappa * a))),
    F,
  }
}

/**
 * The current inside the barrier, j = (ħ/m)·2κ·Im(D*C) per unit |A|² (notes App. B): each exponential alone carries none, together they carry the transmitted current T·ħk/m.
 */
export function barrierInnerCurrent(E: number, V0: number, a: number, m = 1, hbar = 1): number {
  const { kappa, C: C1, D: D1 } = barrierAmplitudes(E, V0, a, m, hbar)
  return ((hbar / m) * 2 * kappa) * mul(conj(D1), C1).im
}

/**
 * The smallest transmission over all widths for E > V₀ (the barrier of Townsend Problem 6.24's type): T oscillates with the width as 1/(1 + f² sin²k′a), so over one period π/k′ it has a lowest
 * point, found by a scan of 4000 widths and a golden-section refinement of the best one. Returns the width and the value.
 */
export function barrierTMinOverWidth(E: number, V0: number, m = 1, hbar = 1): { a: number; T: number } {
  if (!(E > V0) || !(V0 > 0)) throw new Error('barrierTMinOverWidth: needs E > V0 > 0')
  const T = (a: number) => barrierT(E, V0, a, m, hbar)
  const period = Math.PI / (Math.sqrt(2 * m * (E - V0)) / hbar) // sin² repeats every π/k′
  let best = { a: 0, T: 1 }
  const n = 4000
  for (let j = 0; j <= n; j++) {
    const a = (period * j) / n
    const t = T(a)
    if (t < best.T) best = { a, T: t }
  }
  // golden-section refinement around the scan minimum
  let lo = Math.max(0, best.a - period / n)
  let hi = best.a + period / n
  const g = (Math.sqrt(5) - 1) / 2
  for (let i = 0; i < 80; i++) {
    const x1 = hi - g * (hi - lo)
    const x2 = lo + g * (hi - lo)
    if (T(x1) < T(x2)) hi = x2
    else lo = x1
  }
  const a = (lo + hi) / 2
  return { a, T: T(a) }
}

/** The width of the n-th resonance above a barrier (E > V₀): T = 1 where k′a = nπ, so a = nπħ/√(2m(E − V₀)). */
export function barrierResonanceWidth(E: number, V0: number, n = 1, m = 1, hbar = 1): number {
  if (!(E > V0) || !Number.isInteger(n) || n < 1) throw new Error('barrierResonanceWidth: needs E > V0 and a whole n ≥ 1')
  return (n * Math.PI * hbar) / Math.sqrt(2 * m * (E - V0))
}

/**
 * The width a at which a barrier with 0 < E < V₀ transmits exactly the share `target` (T falls steadily with the width, so the root is unique): a bracket by doubling, then 200 halvings.
 * Used for the page where the printed 0.68 would need a = 0.56 Å (Townsend p. 231): with m and ħ in SI, a comes out in metres.
 */
export function barrierWidthForT(E: number, V0: number, target: number, m = 1, hbar = 1): number {
  if (!(target > 0) || !(target < 1)) throw new Error('barrierWidthForT: the target must lie between 0 and 1')
  const kappa = Math.sqrt(2 * m * (V0 - E)) / hbar
  let lo = 0
  let hi = 1 / kappa
  while (barrierT(E, V0, hi, m, hbar) > target) hi *= 2
  for (let i = 0; i < 200; i++) {
    const mid = (lo + hi) / 2
    if (barrierT(E, V0, mid, m, hbar) > target) lo = mid
    else hi = mid
  }
  return (lo + hi) / 2
}

/** The thick-barrier exponent of a smooth barrier, 2∫√(2m(V − E))dx/ħ over [x₁, x₂] where the root is real (Townsend Eq. 6.149, Fig. 6.17), by the endpoint-safe rule `integrate`. */
export function wkbExponent(E: number, V: (x: number) => number, x1: number, x2: number, m = 1, hbar = 1): number {
  if (!(x2 > x1) || !(m > 0) || !(hbar > 0)) throw new Error('wkbExponent: needs x2 > x1 and positive m and ħ')
  return ((2 * Math.sqrt(2 * m)) / hbar) * integrate((x) => Math.sqrt(Math.max(0, V(x) - E)), x1, x2)
}

/** The same exponent for the triangular barrier V = W − Fx at the Fermi level (Townsend Problem 6.25, field emission), in closed form: (4/3)√(2m) W^{3/2}/(ħF). W in energy, F in energy per length. */
export function triangularExponent(W: number, F: number, m = 1, hbar = 1): number {
  if (!(W > 0) || !(F > 0)) throw new Error('triangularExponent: W and F must be positive')
  return ((4 / 3) * Math.sqrt(2 * m) * Math.pow(W, 1.5)) / (hbar * F)
}

/* ---------------------------------------------------- the average over the momenta of a packet ---------------------------------------------------- */
/**
 * ∫ |φ(p)|² f(p) dp for the Gaussian packet of width σ and mean momentum p₀ (ħ = 1): the momentum density is the Gaussian of width Δp = 1/2σ centred on p₀. Only p > 0 is used (the weight below
 * zero is e^{−72} for the packets of the lecture). The range is cut at ±14Δp into panels of at most 1.5Δp, split at `kink`, a momentum where f is not smooth (the threshold of a step, p = √(2V₀));
 * each panel is the `integrate` rule, so the square-root end at the kink is exact. For a packet narrow in energy this is the weighted R or T of notes §18.2.
 */
export function momentumAverage(p0: number, sigma: number, f: (p: number) => number, kink?: number): number {
  if (!(sigma > 0)) throw new Error('momentumAverage: σ must be positive')
  const sd = 1 / (2 * sigma)
  const w = (p: number) => Math.exp(-((p - p0) ** 2) / (2 * sd * sd)) / (Math.sqrt(2 * Math.PI) * sd)
  const lo = Math.max(1e-9, p0 - 14 * sd)
  const hi = p0 + 14 * sd
  const edges = [lo]
  if (kink !== undefined && kink > lo && kink < hi) edges.push(kink)
  edges.push(hi)
  let s = 0
  for (let i = 0; i + 1 < edges.length; i++) {
    const n = Math.max(1, Math.ceil((edges[i + 1] - edges[i]) / (1.5 * sd)))
    for (let j = 0; j < n; j++) {
      const a = edges[i] + ((edges[i + 1] - edges[i]) * j) / n
      const b = edges[i] + ((edges[i + 1] - edges[i]) * (j + 1)) / n
      s += integrate((p) => w(p) * f(p), a, b)
    }
  }
  return s
}

/* ---------------------------------------------------- the current of a moving Gaussian ---------------------------------------------------- */
/** The width of the free Gaussian at time t, σ(t) = σ₀√(1 + (t/2σ₀²)²) (ħ = m = 1). */
const widthAt = (sigma0: number, t: number): number => sigma0 * Math.sqrt(1 + (t / (2 * sigma0 * sigma0)) ** 2)

/** The density ρ(x, t) of the free Gaussian: a bell of width σ(t) about x₀ + p₀t (exact). */
export function gaussianDensityClosed(sigma0: number, p0: number, x0: number, x: number, t: number): number {
  const s = widthAt(sigma0, t)
  return Math.exp(-((x - x0 - p0 * t) ** 2) / (2 * s * s)) / (Math.sqrt(2 * Math.PI) * s)
}

/**
 * The exact probability current of a free Gaussian, j = ρ[v₀ + (σ̇/σ)(x − x_c)] with x_c = x₀ + v₀t, v₀ = p₀ and σ̇/σ = t/(4σ₀²σ(t)²) (notes App. B, ħ = m = 1): the first term carries the packet,
 * the second is the outward flow from its centre as it spreads. The numpy twin differentiates the closed-form ψ.
 */
export function gaussianCurrentClosed(sigma0: number, p0: number, x0: number, x: number, t: number): number {
  const s = widthAt(sigma0, t)
  const rate = t / (4 * sigma0 * sigma0 * s * s)
  return gaussianDensityClosed(sigma0, p0, x0, x, t) * (p0 + rate * (x - x0 - p0 * t))
}

/** The peak of the rigidly translating packet's current at a fixed detector: v₀·ρ at the centre, p₀/(√(2π)σ) (the notes' §18.3 formula). */
export const rigidCurrentPeak = (sigma0: number, p0: number): number => p0 / (Math.sqrt(2 * Math.PI) * sigma0)

/** ∫ j(x_d, t) dt of the exact current over all times (a window of ±300 cut into 120 panels): the whole packet passes the detector once, so 1. */
export function detectorTotal(sigma0: number, p0: number, x0: number, xd: number): number {
  const panels = 120
  const T = 300
  let s = 0
  for (let i = 0; i < panels; i++) s += integrate((t) => gaussianCurrentClosed(sigma0, p0, x0, xd, t), -T + (2 * T * i) / panels, -T + (2 * T * (i + 1)) / panels)
  return s
}

/** The largest value of the exact current j(x_d, t) over time, with the time it happens (a scan of the passage followed by golden-section refinement). */
export function detectorPeak(sigma0: number, p0: number, x0: number, xd: number): { t: number; j: number } {
  const tc = (xd - x0) / p0
  let lo = 0
  let hi = 2 * tc
  let best = { t: tc, j: gaussianCurrentClosed(sigma0, p0, x0, xd, tc) }
  const n = 4000
  for (let i = 0; i <= n; i++) {
    const t = lo + ((hi - lo) * i) / n
    const j = gaussianCurrentClosed(sigma0, p0, x0, xd, t)
    if (j > best.j) best = { t, j }
  }
  const step = (hi - lo) / n
  lo = best.t - step
  hi = best.t + step
  const g = (Math.sqrt(5) - 1) / 2
  const J = (t: number) => gaussianCurrentClosed(sigma0, p0, x0, xd, t)
  for (let i = 0; i < 80; i++) {
    const x1 = hi - g * (hi - lo)
    const x2 = lo + g * (hi - lo)
    if (J(x1) > J(x2)) hi = x2
    else lo = x1
  }
  const t = (lo + hi) / 2
  return { t, j: J(t) }
}

/* ---------------------------------------------------- a packet at a step or barrier: the chances of the two outgoing packets ---------------------------------------------------- */
export type ScatterPotential = { step: { V0: number } } | { barrier: { V0: number; a: number } }

/** The potential on the grid and the right-hand edge of the region counted as transmitted: 0 for a step, a for a barrier (the stage's `reflected` and `transmitted` readouts). */
function potentialOf(p: ScatterPotential): { V: Float64Array; far: number } {
  return 'step' in p ? { V: stepPotential(GRID, p.step.V0), far: 0 } : { V: barrierPotential(GRID, p.barrier.V0, p.barrier.a), far: p.barrier.a }
}

/**
 * The packet ψ(x, 0) = `packet(x0, σ, p0)` evolved to time t under p̂²/2 + V (the split step of wave.ts `evolveV`, the very call the stage makes), and the chances read off the whole grid:
 * `reflected` = P(x < 0) and `transmitted` = P(x > far edge) (spline integrals of |ψ|², as the stage's readouts), `norm` = ∫|ψ|²dx. Whatever lies inside a barrier belongs to neither. `dt` is the
 * largest step of the split (the stage uses the default 0.005; 0.02 is four times cheaper and agrees to a few parts in 10⁴).
 */
export function scatterChances(x0: number, sigma: number, p0: number, pot: ScatterPotential, t: number, dt = 0.005): { reflected: number; transmitted: number; norm: number } {
  const { V, far } = potentialOf(pot)
  const w = evolveV(packet(GRID, { x0, sigma, p0 }), GRID, V, t, dt)
  return { reflected: chanceBelow(w, GRID, 0), transmitted: chanceAbove(w, GRID, far), norm: norm(w, GRID) }
}

/**
 * The chance in x > 0 at each of the times 0.5, 1, … `end` for a packet at an infinite step (the penetration of notes §18.6): the evolution is done once in steps of 0.5, as the stage builds its
 * frames. Returns the whole list; `maxRight` and `lateRight` are the largest and the last.
 */
export function stepPenetration(x0: number, sigma: number, p0: number, V0: number, end: number, dt = 0.005): { times: number[]; right: number[]; maxRight: number; timeOfMax: number; lateRight: number } {
  const V = stepPotential(GRID, V0)
  let w: Wave = packet(GRID, { x0, sigma, p0 })
  const times: number[] = []
  const right: number[] = []
  for (let t = 0.5; t <= end + 1e-9; t += 0.5) {
    w = evolveV(w, GRID, V, 0.5, dt)
    times.push(t)
    right.push(chanceAbove(w, GRID, 0))
  }
  let imax = 0
  for (let i = 1; i < right.length; i++) if (right[i] > right[imax]) imax = i
  return { times, right, maxRight: right[imax], timeOfMax: times[imax], lateRight: right[right.length - 1] }
}

/* ---------------------------------------------------- the current of one wave, and how far an evanescent tail reaches ---------------------------------------------------- */
/** j = (ħ/m) Im(u*u′) of a wave given by its value u and slope u′ at one point (notes App. B): a travelling wave De^{ikx} gives ħk|D|²/m, one real exponential gives zero. */
export function currentOf(u: C, du: C, m = 1, hbar = 1): number {
  return (hbar / m) * mul(conj(u), du).im
}

/** The current of the evanescent wave Ce^{−κx} of the step below its top (A = 1, C = 1 + r) at x ≥ 0: Im(u*u′) with u′ = −κu, which is zero at every x. */
export function evanescentCurrent(E: number, V0: number, x: number, m = 1, hbar = 1): number {
  const { kappa, r } = stepEvanescent(E, V0, m, hbar)
  const u = scale(c(1 + r.re, r.im), Math.exp(-kappa * x))
  return currentOf(u, scale(u, -kappa), m, hbar)
}

/** How far into the step the DENSITY of the evanescent wave falls to the share `fraction` of its edge value: |C|²e^{−2κx} = fraction·|C|², so x = ln(1/fraction)/2κ. */
export function penetrationDepth(kappa: number, fraction: number): number {
  if (!(kappa > 0) || !(fraction > 0) || !(fraction < 1)) throw new Error('penetrationDepth: κ must be positive and the fraction between 0 and 1')
  return Math.log(1 / fraction) / (2 * kappa)
}
