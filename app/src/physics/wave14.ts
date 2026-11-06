/**
 * Lecture 14 engine (448): kinetic energy, the free dispersion relations, closed forms for the sharp-edge examples, and the box's two-level interference. Every function is pure,
 * ħ = 1 and lengths in ℓ unless a call passes its own mass. A lecture-only module: it is imported by content/L14.values.ts and, for the two dispersion curves, by the plot
 * table in stage/svg/plot.ts. Numpy twin of every `l14…` key: pipeline/claims_448/l14.py (spline, FFT, quadrature, tridiagonal eigenproblem); engine cases:
 * physics/__fixtures__/wave14-cases.json. Tests: physics/wave14.test.ts.
 */
import { type Grid, type Wave, boxEnergy, density, planeSamples, pOp } from './wave'

/** ω(k) = ħk²/2m for a free matter wave (ħ = 1; m defaults to 1). The plot curve `freeOmega` and Unit 14.3. */
export function omegaFree(k: number, m = 1): number {
  if (!(m > 0)) throw new Error('omegaFree: the mass must be positive')
  return (k * k) / (2 * m)
}

/** ω(k) = c|k| for light in vacuum (c defaults to 1). The plot curve `linearOmega`; it meets `freeOmega` at k = 2 for m = c = 1. */
export function omegaLinear(k: number, c = 1): number {
  if (!(c > 0)) throw new Error('omegaLinear: the speed must be positive')
  return c * Math.abs(k)
}

/** ⟨p̂²/2m⟩ = ‖p̂ψ‖²/2m of a normalised state on the grid (the kinetic energy of the packet, ħ = 1), with the spectral p̂. */
export function kineticEnergy(psi: Wave, g: Grid, m = 1): number {
  if (!(m > 0)) throw new Error('kineticEnergy: the mass must be positive')
  const pp = pOp(psi, g)
  let s = 0
  for (let j = 0; j < g.n; j++) s += pp.re[j] * pp.re[j] + pp.im[j] * pp.im[j]
  return (s * g.dx) / (2 * m)
}

/** The curvature factor of a plane wave: ∂ₓ² e^{ikx} = (ik)² e^{ikx} = −k² e^{ikx}; the number returned is −k² (two space derivatives bring down ik twice). */
export function planeCurvature(k: number): number {
  return -(k * k)
}

/**
 * ⟨p̂²/2m⟩ of ψ = A(1 − |x|/L) for |x| < L (0 outside), ħ = 1: A² = 3/2L and ∫|ψ′|²dx = 2A²/L, so the value is 3/(2mL²). The slope jumps at x = 0 and at ±L, but ψ′ is
 * square-integrable, so the kinetic energy is finite (ψ″ has delta functions, which is why the engine's FFT route only approximates this: tests compare them to 2 %).
 */
export function tentKinetic(L: number, m = 1): number {
  if (!(L > 0) || !(m > 0)) throw new Error('tentKinetic: L and m must be positive')
  return 3 / (2 * m * L * L)
}

/**
 * The kinetic energy of the top hat ψ = 1/√L on |x| < L/2 (ħ = m = 1) counting only momenta |p| < P: ∫_{−P}^{P} (p²/2)|φ(p)|²dp with |φ(p)|² = (2/πL) sin²(pL/2)/p², which is
 * (P − sin(PL)/L)/(πL). It grows without limit as P does (the top hat has no finite ⟨p̂²⟩): at P = 2πn/L the sine drops out and the value is 2n/L².
 */
export function topHatKineticCut(L: number, P: number): number {
  if (!(L > 0) || !(P >= 0)) throw new Error('topHatKineticCut: L must be positive and P not negative')
  return (P - Math.sin(P * L) / L) / (Math.PI * L)
}

/** ⟨E⟩ of a box state Σ cₙφₙ given the chances |cₙ|² of its levels (normalised here so the weights need only be proportional), ħ = m = 1. */
export function boxMeanEnergy(L: number, terms: readonly { n: number; weight: number }[]): number {
  if (terms.length === 0) throw new Error('boxMeanEnergy: needs at least one level')
  let total = 0
  let acc = 0
  for (const t of terms) {
    if (!(t.weight >= 0)) throw new Error('boxMeanEnergy: a weight is a chance, so not negative')
    total += t.weight
    acc += t.weight * boxEnergy(L, t.n)
  }
  if (!(total > 0)) throw new Error('boxMeanEnergy: the weights must not all be zero')
  return acc / total
}

export interface PairParts {
  /** |c₁|²φ₁(x)² */
  direct1: number
  /** |c₂|²φ₂(x)² */
  direct2: number
  /** 2 Re[c₁*c₂ φ₁φ₂ e^{−i(E₂−E₁)t}] */
  cross: number
  /** the sum: |ψ(x,t)|² */
  total: number
}

/**
 * The density of the equal superposition (φ_{n1}e^{−iE₁t} + φ_{n2}e^{−iE₂t})/√2 of two levels of a box 0 < x < L, split as in Unit 14.5: the two direct terms (time independent) and the cross
 * term φ₁φ₂ cos((E₂ − E₁)t). Real eigenfunctions φₙ = √(2/L) sin(nπx/L); x must lie inside the walls. ħ = m = 1.
 */
export function boxPairParts(L: number, n1: number, n2: number, t: number, x: number): PairParts {
  if (n1 === n2) throw new Error('boxPairParts: the two levels must differ')
  if (!(x >= 0 && x <= L)) throw new Error('boxPairParts: x must lie inside the box')
  const phi = (n: number) => Math.sqrt(2 / L) * Math.sin((n * Math.PI * x) / L)
  const p1 = phi(n1)
  const p2 = phi(n2)
  const direct1 = (p1 * p1) / 2
  const direct2 = (p2 * p2) / 2
  const cross = p1 * p2 * Math.cos((boxEnergy(L, n2) - boxEnergy(L, n1)) * t)
  return { direct1, direct2, cross, total: direct1 + direct2 + cross }
}

/** The period 2π/(E₂ − E₁) of the density of two box levels (ħ = m = 1). */
export function boxPairPeriod(L: number, n1: number, n2: number): number {
  return (2 * Math.PI) / Math.abs(boxEnergy(L, n2) - boxEnergy(L, n1))
}

/**
 * The residual of the time-independent equation −(1/2m)φ″ − Eφ = 0 for the real part of a box state, with the seven-point stencil for φ″ (error of order h⁶), over the grid points
 * that lie at least three samples inside the walls (the stencil must not reach the corner at a wall). Returns max |−φ″/2m − Eφ|.
 */
export function boxResidual(psi: Wave, g: Grid, E: number, lo: number, hi: number, m = 1): number {
  const c = [1 / 90, -3 / 20, 3 / 2, -49 / 18, 3 / 2, -3 / 20, 1 / 90]
  let worst = 0
  for (let j = 3; j < g.n - 3; j++) {
    if (g.x[j - 3] < lo - 1e-9 || g.x[j + 3] > hi + 1e-9) continue
    let d2 = 0
    for (let q = -3; q <= 3; q++) d2 += c[q + 3] * psi.re[j + q]
    d2 /= g.dx * g.dx
    worst = Math.max(worst, Math.abs((-d2) / (2 * m) - E * psi.re[j]))
  }
  return worst
}

/** max |ρ_a − ρ_b| over the grid: how far the density has moved between two states (0 for a stationary state). */
export function densityDrift(a: Wave, b: Wave): number {
  const da = density(a)
  const db = density(b)
  let worst = 0
  for (let j = 0; j < da.length; j++) worst = Math.max(worst, Math.abs(da[j] - db[j]))
  return worst
}

/**
 * max |iψ_t + ½ψ_xx| for the sum (e^{ip₁x} + e^{ip₂x})/√2 at the point (x, t), with seven-point stencils (h = 0.02 in x, 0.01 in t): the free equation holds for each wave and so for their
 * sum (linearity, Unit 14.3). The residual is a finite-difference error, of order 1e-8, never exactly zero.
 */
export function twoWaveResidual(p1: number, p2: number, x: number, t: number): number {
  const c1 = [-1 / 60, 3 / 20, -3 / 4, 0, 3 / 4, -3 / 20, 1 / 60]
  const c2 = [1 / 90, -3 / 20, 3 / 2, -49 / 18, 3 / 2, -3 / 20, 1 / 90]
  const hx = 0.02
  const ht = 0.01
  const at = (xx: number, tt: number) => {
    const w = planeSamples([xx], [p1, p2], { time: tt })
    return [w.re[0], w.im[0]]
  }
  let tre = 0
  let tim = 0
  let xre = 0
  let xim = 0
  for (let q = -3; q <= 3; q++) {
    const a = at(x, t + q * ht)
    tre += (c1[q + 3] * a[0]) / ht
    tim += (c1[q + 3] * a[1]) / ht
    const b = at(x + q * hx, t)
    xre += (c2[q + 3] * b[0]) / (hx * hx)
    xim += (c2[q + 3] * b[1]) / (hx * hx)
  }
  // i(ψ_t) = (−Im ψ_t) + i(Re ψ_t)
  return Math.hypot(-tim + 0.5 * xre, tre + 0.5 * xim)
}
