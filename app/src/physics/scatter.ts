/**
 * One-dimensional scattering (Townsend §6.10, Lecture 13): a step and a square barrier, and the probability current. ħ = m = 1 unless a call
 * passes its own mass and ħ (the book's electron-volt and ångström examples). R and T are ratios of CURRENTS (Eqs. 6.125–6.126), not of squared
 * amplitudes: that is why T = 4kk₀/(k + k₀)² and not |C|²/|A|².
 */
import { type Grid, type Wave, pOp } from './wave'

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
 * The residual of the continuity equation ∂ρ/∂t + ∂j/∂x = 0 for a FREE packet (V = 0) on the grid: ∂ψ/∂t from the equation (i∂ψ/∂t = p̂²ψ/2), so
 * ∂ρ/∂t = 2Re(ψ*∂ψ/∂t), and ∂j/∂x with the spectral derivative of j. The largest |∂ρ/∂t + ∂j/∂x| over the grid (rounding error, about 1e-14 for the unit packet).
 */
export function continuityResidual(psi: Wave, g: Grid): number {
  const p2 = pOp(pOp(psi, g), g)
  const rho = new Float64Array(g.n)
  for (let i = 0; i < g.n; i++) {
    // ∂ψ/∂t = −i p̂²ψ/2 = (Im p̂²ψ − i Re p̂²ψ)/2
    const tre = p2.im[i] / 2
    const tim = -p2.re[i] / 2
    rho[i] = 2 * (psi.re[i] * tre + psi.im[i] * tim)
  }
  // f′ = i p̂ f for a real f: the real part of i·(p̂f) is −Im(p̂f)
  const dj = pOp({ re: Float64Array.from(probabilityCurrent(psi, g)), im: new Float64Array(g.n) }, g)
  let worst = 0
  for (let i = 0; i < g.n; i++) worst = Math.max(worst, Math.abs(rho[i] - dj.im[i]))
  return worst
}
