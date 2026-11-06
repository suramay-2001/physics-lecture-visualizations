/**
 * One-dimensional scattering (Townsend §6.10, Lecture 13): a step and a square barrier, and the probability current. ħ = m = 1 unless a call
 * passes its own mass and ħ (the book's electron-volt and ångström examples). R and T are ratios of CURRENTS (Eqs. 6.125–6.126), not of squared
 * amplitudes: that is why T = 4kk₀/(k + k₀)² and not |C|²/|A|².
 */
import { type C, abs2, c, div } from './complex'
import { type Grid, type Wave, density, pOp } from './wave'

const wavenumber = (m: number, e: number, hbar: number): number => Math.sqrt(2 * m * e) / hbar

/**
 * The step V = 0 for x < 0 and V₀ for x > 0, a wave of energy E coming from the left. E > V₀: R = ((k − k₀)/(k + k₀))², T = 4kk₀/(k + k₀)² (Eq. 6.135),
 * R + T = 1. 0 < E ≤ V₀: total reflection, R = 1 and T = 0 (Eqs. 6.139–6.140; the wave enters the step as e^{−qx} but carries no current). Only the ratio E/V₀ matters.
 */
export function stepRT(E: number, V0: number): { R: number; T: number } {
  if (!(E > 0) || !(V0 >= 0)) throw new Error('stepRT: E must be positive and V0 not negative')
  if (E <= V0) return { R: 1, T: 0 }
  const k = Math.sqrt(2 * E)
  const k0 = Math.sqrt(2 * (E - V0))
  const s = (k + k0) * (k + k0)
  return { R: ((k - k0) * (k - k0)) / s, T: (4 * k * k0) / s }
}

/**
 * The transmission of a square barrier of height V₀ and width a (Eqs. 6.141–6.146), a wave of energy E from the left.
 * E < V₀: T = 1/[1 + ((k² + q²)/2kq)² sinh²(qa)]. E = V₀: T = 1/(1 + k²a²/4) (Example 6.7). E > V₀: the same with q → ik′:
 * T = 1/[1 + ((k² − k′²)/2kk′)² sin²(k′a)] (above the barrier the transmission oscillates with its width).
 */
export function barrierT(E: number, V0: number, a: number, m = 1, hbar = 1): number {
  if (!(E > 0) || !(V0 > 0) || !(a >= 0) || !(m > 0) || !(hbar > 0)) throw new Error('barrierT: E, V0, m and ħ must be positive and a not negative')
  const k = wavenumber(m, E, hbar)
  if (Math.abs(E - V0) <= 1e-14 * V0) return 1 / (1 + (k * a * k * a) / 4)
  if (E < V0) {
    const q = wavenumber(m, V0 - E, hbar)
    const f = (k * k + q * q) / (2 * k * q)
    return 1 / (1 + f * f * Math.sinh(q * a) ** 2)
  }
  const k2 = wavenumber(m, E - V0, hbar)
  const f = (k * k - k2 * k2) / (2 * k * k2)
  return 1 / (1 + f * f * Math.sin(k2 * a) ** 2)
}

/** The decay constant q = √(2m(V₀ − E))/ħ inside a barrier (E < V₀). */
export function decayConstant(E: number, V0: number, m = 1, hbar = 1): number {
  if (!(E > 0) || !(V0 > E)) throw new Error('decayConstant: needs 0 < E < V0')
  return wavenumber(m, V0 - E, hbar)
}

/** The thick-barrier form of Eq. 6.146: T → (4kq/(k² + q²))² e^{−2qa}, valid for qa ≫ 1 and E < V₀. */
export function barrierThick(E: number, V0: number, a: number, m = 1, hbar = 1): number {
  const q = decayConstant(E, V0, m, hbar)
  const k = wavenumber(m, E, hbar)
  const f = (4 * k * q) / (k * k + q * q)
  return f * f * Math.exp(-2 * q * a)
}

/** The probability current j(x) = (ħ/2mi)(ψ*ψ′ − ψψ*′) = Re(ψ*(p̂ψ))/m (Eq. 6.115) on the grid, ħ = m = 1, with the spectral p̂. */
export function probabilityCurrent(psi: Wave, g: Grid): Float64Array {
  const pp = pOp(psi, g)
  const j = new Float64Array(g.n)
  for (let i = 0; i < g.n; i++) j[i] = psi.re[i] * pp.re[i] + psi.im[i] * pp.im[i]
  return j
}

/** ∫ j dx over the whole grid: for a packet it is ⟨p⟩/m. */
export function totalCurrent(psi: Wave, g: Grid): number {
  return probabilityCurrent(psi, g).reduce((s, v) => s + v, 0) * g.dx
}

/**
 * The residual of the continuity equation ∂ρ/∂t + ∂j/∂x = 0 on the grid (Lecture 13: a free packet; Lecture 17: with a potential). ∂ψ/∂t comes from the equation,
 * i∂ψ/∂t = p̂²ψ/2 + Vψ (the optional array V, one value per grid point; none means free), so ∂ρ/∂t = 2Re(ψ*∂ψ/∂t), and ∂j/∂x is the spectral derivative of j.
 * The largest |∂ρ/∂t + ∂j/∂x| over the grid (rounding error, about 1e-14 for the unit packet). The V terms cancel in ∂ρ/∂t: that is the point of Lecture 17.
 */
export function continuityResidual(psi: Wave, g: Grid, V?: ArrayLike<number>): number {
  if (V && V.length !== g.n) throw new Error('continuityResidual: V needs one value per grid point')
  const p2 = pOp(pOp(psi, g), g)
  const rho = new Float64Array(g.n)
  for (let i = 0; i < g.n; i++) {
    // h = p̂²ψ/2 + Vψ and ∂ψ/∂t = −ih = (Im h) − i(Re h)
    const v = V ? V[i] : 0
    const hre = p2.re[i] / 2 + v * psi.re[i]
    const him = p2.im[i] / 2 + v * psi.im[i]
    rho[i] = 2 * (psi.re[i] * him - psi.im[i] * hre)
  }
  // f′ = i p̂ f for a real f: the real part of i·(p̂f) is −Im(p̂f)
  const dj = pOp({ re: Float64Array.from(probabilityCurrent(psi, g)), im: new Float64Array(g.n) }, g)
  let worst = 0
  for (let i = 0; i < g.n; i++) worst = Math.max(worst, Math.abs(rho[i] - dj.im[i]))
  return worst
}

/* ---------------------------------------------------- Lecture 17: the step as amplitudes, the current of a wave, the mean force ---------------------------------------------------- */
export interface StepAmplitudes {
  k1: number
  /** √(2m(E − V₀))/ħ for E > V₀; for E ≤ V₀ the decay constant κ = √(2m(V₀ − E))/ħ (the wave is e^{−κx}) */
  k2: number
  /** r = B/A, the reflected over the incident amplitude */
  r: C
  /** τ = C/A, the transmitted over the incident amplitude (the notes' t; written τ because t is time) */
  tau: C
  /** R = |j_ref|/j_in and T = j_tr/j_in: ratios of CURRENTS */
  R: number
  T: number
}

/**
 * The amplitudes of the step V = 0 (x < 0), V₀ (x > 0) for a wave Ae^{ik₁x} from the left (notes §17.3–17.6, Townsend Eqs. 6.133–6.136), ħ = m = 1. Matching φ and φ′ at
 * x = 0 gives A + B = C and k₁(A − B) = k₂C, so r = (k₁ − k₂)/(k₁ + k₂) and τ = 2k₁/(k₁ + k₂) = 1 + r. Below the step k₂ → iκ: |r| = 1, R = 1, T = 0 (the wave
 * enters as e^{−κx} but carries no current). R = |r|² and T = (k₂/k₁)|τ|² for E > V₀.
 */
export function stepAmplitudes(E: number, V0: number): StepAmplitudes {
  if (!(E > 0) || !(V0 >= 0)) throw new Error('stepAmplitudes: E must be positive and V0 not negative')
  const k1 = Math.sqrt(2 * E)
  if (E > V0) {
    const k2 = Math.sqrt(2 * (E - V0))
    const r = c((k1 - k2) / (k1 + k2))
    const tau = c((2 * k1) / (k1 + k2))
    return { k1, k2, r, tau, R: abs2(r), T: (k2 / k1) * abs2(tau) }
  }
  const kappa = Math.sqrt(2 * (V0 - E))
  // k₂ = iκ: r = (k₁ − iκ)/(k₁ + iκ), τ = 2k₁/(k₁ + iκ)
  const den = c(k1, kappa)
  return { k1, k2: kappa, r: div(c(k1, -kappa), den), tau: div(c(2 * k1), den), R: 1, T: 0 }
}

/**
 * The standing ripple on the incident side, |Ae^{ik₁x} + Be^{−ik₁x}|² = |A|²(1 + |r|² + 2|r|cos(2k₁x − arg r)) (notes §17.6): its maximum (1 + |r|)²|A|², its minimum
 * (1 − |r|)²|A|² and its spacing π/k₁ between neighbouring maxima. Here |A| = 1.
 */
export function stepFringe(E: number, V0: number): { max: number; min: number; spacing: number } {
  const { k1, r } = stepAmplitudes(E, V0)
  const m = Math.sqrt(abs2(r))
  return { max: (1 + m) ** 2, min: (1 - m) ** 2, spacing: Math.PI / k1 }
}

/** The current j = ħk|A|²/m = v|A|² of the plane wave Ae^{ikx} (ħ = m = 1); A real or complex. A negative k moves left. */
export function planeCurrent(k: number, A: number | C = 1): number {
  const a2 = typeof A === 'number' ? A * A : abs2(A)
  return k * a2
}

/** ⟨F(x̂)⟩ = ∫ρ(x)F(x)dx on the grid (a Riemann sum; spectrally exact for a smooth, localised ρF), for a force given as a function of x. */
export function forceMean(psi: Wave, g: Grid, F: (x: number) => number): number {
  const rho = density(psi)
  let s = 0
  for (let j = 0; j < g.n; j++) s += rho[j] * F(g.x[j])
  return s * g.dx
}

/* closed forms, used only as checks of the evolution in wave.ts */
/** ⟨x⟩ for a constant force F₀: x₀ + p₀t/m + F₀t²/2m (exact for every width and shape). */
export function ehrenfestConstMean(x0: number, p0: number, F0: number, t: number, m = 1): number {
  return x0 + (p0 * t) / m + (F0 * t * t) / (2 * m)
}
/** ⟨x⟩ in the harmonic well F = −mΩ²x: x₀cos Ωt + (p₀/mΩ) sin Ωt (exact for every width and shape). */
export function harmonicMean(x0: number, p0: number, omega: number, t: number, m = 1): number {
  if (!(omega > 0)) throw new Error('harmonicMean: Ω must be positive')
  return x0 * Math.cos(omega * t) + (p0 / (m * omega)) * Math.sin(omega * t)
}
/** Δx(t) in the well Ω for a Gaussian packet of width σ and Δp = ħ/2σ (ħ = m = 1): √(σ²cos²Ωt + sin²Ωt/(4σ²Ω²)). It breathes unless σ² = 1/2Ω. */
export function harmonicWidth(sigma: number, omega: number, t: number): number {
  if (!(sigma > 0) || !(omega > 0)) throw new Error('harmonicWidth: σ and Ω must be positive')
  return Math.sqrt((sigma * Math.cos(omega * t)) ** 2 + Math.sin(omega * t) ** 2 / (4 * sigma * sigma * omega * omega))
}
