/**
 * The Optics Lab experiment track's engine (pages O7 to O11; plan P-optics-experiment-track §7, rulings G1, G3, G5): one cesium atom in a tweezer array, from the
 * cloud to the loaded array. Pure functions, SI where a unit shows, lazy-only (never in an entry chunk); the atom lines are STATED INPUTS (Steck, Cs D line data).
 * What is here: the MOT fill and the polarization-gradient step's inputs (a rate balance), the tweezer (waist, two-line polarizability, depth, frequencies,
 * scattering, heating, Lamb–Dicke size), the loading statistics (parity projection, a binomial target, a refill chain, the loss budget) and the
 * recoil and depumping limits of imaging. The count statistics live in imaging.ts (thresholdError and the rest). The numpy twins are
 * pipeline/claims_optics/o_track.py (every number a page prints) and the exports used by tests/fixtures; each takes another route (ODE, reduced matrix
 * elements, enumeration, Monte Carlo).
 */
import { C_LIGHT, E_CHARGE, HBAR, K_BOLTZMANN } from '../constants'
import { binomialPmf } from '../random'
import { CS_D2, recoilRate, waveNumber, type AtomLine } from './cooling'

/* ------------------------------------------------ atoms and constants ------------------------------------------------ */
/** The cesium D1 line (6S½ → 6P½), Steck: 894.593 nm, γ/2π = 4.561 MHz; the mass is the D2 entry's. A stated input beside `CS_D2`. */
export const CS_D1: AtomLine = { name: 'Cs D1', lambdaM: 894.593e-9, gamma: 2 * Math.PI * 4.561e6, massKg: CS_D2.massKg }
/** ε₀ (CODATA 2018), F/m. */
export const EPS0 = 8.8541878128e-12
const BOHR_RADIUS = 5.29177210903e-11
const HARTREE = 4.3597447222071e-18
/** The atomic unit of polarizability, e²a₀²/E_h, in C·m²/V. */
export const AU_POLARIZABILITY = (E_CHARGE * BOHR_RADIUS) ** 2 / HARTREE

/** A line that couples the ground state J = ½ to an excited level of angular momentum `Jp` (the weight (2J′ + 1) of the Γ form). */
export interface PolLine {
  atom: AtomLine
  Jp: number
}
/** The two lines of cesium that count at a 1 µm trap: D1 (J′ = ½) and D2 (J′ = 3/2). */
export const CS_LINES: readonly PolLine[] = [
  { atom: CS_D1, Jp: 0.5 },
  { atom: CS_D2, Jp: 1.5 },
]

/* ------------------------------------------------ the MOT fill ------------------------------------------------ */
/** The number of atoms in a trap filled at rate `R` (s⁻¹) and emptied at rate 1/τ, after `t` (s): N(t) = Rτ(1 − e^{−t/τ}) (the steady state is Rτ). */
export const motLoad = (R: number, tau: number, t: number): number => R * tau * (1 - Math.exp(-t / tau))
/** The time (in units of τ) at which a fraction `frac` (0 ≤ frac < 1) of the steady-state number is reached: −ln(1 − frac). */
export function loadTimeTo(frac: number, tau: number): number {
  if (!(frac >= 0 && frac < 1)) throw new RangeError('loadTimeTo: 0 <= frac < 1')
  return -tau * Math.log(1 - frac)
}

/* ------------------------------------------------ the tweezer: size, depth, frequencies ------------------------------------------------ */
/** The Rayleigh length π w₀²/λ, m. */
export const rayleighLength = (w0: number, lam: number): number => (Math.PI * w0 * w0) / lam
/** The Airy radius 0.61 λ/NA of a diffraction-limited focus, m (a stated scale, not the Gaussian waist). */
export const diffractionRadius = (lam: number, na: number): number => (0.61 * lam) / na
/** The waist (m) that two measured trap frequencies fix: ω_r/ω_z = √2 π w₀/λ, so w₀ = λ f_r / (√2 π f_z). */
export const waistFromFreqs = (fr: number, fz: number, lam: number): number => (lam * fr) / (Math.SQRT2 * Math.PI * fz)

/**
 * The static-limit polarizability of a J = ½ ground state at laser angular frequency ω = 2πc/λ (C·m²/V): α = (1/3) Σ_j ω_j |⟨J‖d‖J′⟩|²/(ħ(ω_j² − ω²)) with
 * |⟨J‖d‖J′⟩|² = 3π ε₀ ħ c³ (2J′ + 1) Γ_j/ω_j³ (the Γ form), both lines and both rotating terms. The sum is π ε₀ c³ Σ_j (2J′ + 1) Γ_j / (ω_j² (ω_j² − ω²)).
 */
export function polarizability(lines: readonly PolLine[], lamTrap: number): number {
  const om = (2 * Math.PI * C_LIGHT) / lamTrap
  let s = 0
  for (const { atom, Jp } of lines) {
    const w = (2 * Math.PI * C_LIGHT) / atom.lambdaM
    s += ((2 * Jp + 1) * atom.gamma) / (w * w * (w * w - om * om))
  }
  return Math.PI * EPS0 * C_LIGHT ** 3 * s
}
/** The peak intensity 2P/(π w₀²) of a Gaussian beam of power `P` (W) and waist `w0` (m), W/m². */
export const peakIntensity = (P: number, w0: number): number => (2 * P) / (Math.PI * w0 * w0)
/** The depth of one tweezer, |U| = α I₀/(2 ε₀ c), J (positive for an attractive, red-detuned trap). */
export function tweezerDepth(P: number, w0: number, lamTrap: number, lines: readonly PolLine[] = CS_LINES): number {
  return (polarizability(lines, lamTrap) * peakIntensity(P, w0)) / (2 * EPS0 * C_LIGHT)
}
/** The potential U(r, z) of the Gaussian focus, J (negative well): −U₀ e^{−2r²/w(z)²}/(1 + (z/z_R)²), `U0` the depth (positive), `r` and `z` in m. */
export function tweezerPotential(U0: number, w0: number, lam: number, r: number, z = 0): number {
  const zr = rayleighLength(w0, lam)
  const f = 1 + (z / zr) ** 2
  return -(U0 / f) * Math.exp((-2 * r * r) / (w0 * w0 * f))
}
/** The harmonic frequencies of a well of depth `U` (J): f_r = (1/2π)√(4U/(M w₀²)) and f_z = (1/2π)√(2U/(M z_R²)) (Hz), and z_R (m). */
export function tweezerFreqs(U: number, massKg: number, w0: number, lam: number): { fr: number; fz: number; zR: number } {
  const zR = rayleighLength(w0, lam)
  return { fr: Math.sqrt((4 * U) / (massKg * w0 * w0)) / (2 * Math.PI), fz: Math.sqrt((2 * U) / (massKg * zR * zR)) / (2 * Math.PI), zR }
}
/** The depth (J) a measured radial frequency (Hz) implies at waist `w0`: U = M ω_r² w₀²/4. */
export const depthFromRadialFreq = (fr: number, massKg: number, w0: number): number => (massKg * (2 * Math.PI * fr) ** 2 * w0 * w0) / 4
/**
 * The photon scattering rate of the trap light, s⁻¹ (rotating-wave, each line j with its light shift U_j = π c² Γ_j (2J′ + 1) I₀/(4 ω_j³ Δ_j) and Δ_j = ω_j − ω):
 * R = Σ_j (U_j/ħ)(Γ_j/Δ_j) (the book's two-level form, summed; the counter-rotating terms are left out of the rate).
 */
export function tweezerScatter(P: number, w0: number, lamTrap: number, lines: readonly PolLine[] = CS_LINES): number {
  const om = (2 * Math.PI * C_LIGHT) / lamTrap
  const I0 = peakIntensity(P, w0)
  let R = 0
  for (const { atom, Jp } of lines) {
    const w = (2 * Math.PI * C_LIGHT) / atom.lambdaM
    const D = w - om
    const U = (Math.PI * C_LIGHT ** 2 * atom.gamma * (2 * Jp + 1) * I0) / (4 * w ** 3 * D)
    R += (U / HBAR) * (atom.gamma / D)
  }
  return R
}
/** The recoil gain per scattered photon of wavelength `lam` on mass `massKg`: 2E_R/k_B = ħ²k²/(M k_B), K. */
export const recoilGainKAt = (lam: number, massKg: number): number => (HBAR * ((2 * Math.PI) / lam)) ** 2 / (massKg * K_BOLTZMANN)
/** depth/(2E_R R), s: how long recoil heating by the trap light's own photons takes to warm an atom to the depth (E_R at the trap wavelength). */
export const trapHeatTime = (U: number, rate: number, massKg: number, lamTrap: number): number => U / (2 * ((HBAR * (2 * Math.PI / lamTrap)) ** 2 / (2 * massKg)) * rate)
/** The Lamb–Dicke parameter η = k√(ħ/2Mω) for a light of wave number `k` and a trap frequency ω (rad/s). */
export const lambDicke = (massKg: number, omega: number, k: number): number => k * Math.sqrt(HBAR / (2 * massKg * omega))
/** The thermal rms position √(k_B T/(M ω²)), m. */
export const thermalRms = (massKg: number, omega: number, T: number): number => Math.sqrt((K_BOLTZMANN * T) / (massKg * omega * omega))

/* ------------------------------------------------ loading statistics ------------------------------------------------ */
/**
 * A tweezer that holds an atom pair only briefly (light-assisted collisions) ends with n mod 2 atoms: for a Poisson mean μ, P(1) = (1 − e^{−2μ})/2 and
 * P(0) = (1 + e^{−2μ})/2. A MODEL (the collisions are taken as perfect pair loss), stated on the page.
 */
export function parityDistribution(mu: number): { p0: number; p1: number } {
  if (!(mu >= 0)) throw new RangeError('parityDistribution: mu >= 0')
  const e = Math.exp(-2 * mu)
  return { p0: (1 + e) / 2, p1: (1 - e) / 2 }
}
/** The Poisson chance of exactly one atom, μ e^{−μ} (largest, 1/e, at μ = 1). */
export const poissonP1 = (mu: number): number => mu * Math.exp(-mu)
/** P(Bin(N, p) ≥ M): the chance that at least M of N sites are loaded (the tail is summed from the top, so a tiny tail is exact). */
export function fillChance(N: number, M: number, p: number): number {
  if (!Number.isInteger(N) || !Number.isInteger(M) || N < 0 || M < 0 || !(p >= 0 && p <= 1)) throw new RangeError('fillChance: whole N, M >= 0, 0 <= p <= 1')
  if (M > N) return 0
  let s = 0
  for (let k = N; k >= M; k--) s += binomialPmf(k, N, p)
  return Math.min(1, s)
}
/** The smallest number of sites N for which the chance to load at least M of them is at least `conf`. */
export function sitesNeeded(M: number, p: number, conf: number): number {
  if (!(p > 0 && p < 1 && conf > 0 && conf < 1) || !Number.isInteger(M) || M < 1) throw new RangeError('sitesNeeded: whole M >= 1, 0 < p < 1, 0 < conf < 1')
  let N = M
  while (fillChance(N, M, p) < conf) N++
  return N
}
/** One round of refilling: the empty fraction e becomes e(1 − q) + (1 − e)ε (an empty site is refilled with chance q, a filled one lost with chance ε). */
export const refillStep = (e: number, eps: number, q: number): number => e * (1 - q) + (1 - e) * eps
/** The empty fractions after rounds 0 … `rounds` starting from `e0` (default all empty): element 0 is e0. */
export function refillTrace(rounds: number, eps: number, q: number, e0 = 1): number[] {
  const out = [e0]
  for (let i = 0; i < rounds; i++) out.push(refillStep(out[i], eps, q))
  return out
}
/** The fixed point of the refilling chain, ε/(q + ε). */
export const refillEquilibrium = (eps: number, q: number): number => eps / (q + eps)
/** Atoms lost per second from N atoms of vacuum lifetime τ (s) and per image at per-image survival S: {perSecond: N/τ, perImage: N(1 − S)}. */
export const lossBudget = (N: number, tau: number, S: number): { perSecond: number; perImage: number } => ({ perSecond: N / tau, perImage: N * (1 - S) })
/** The product of a readout fidelity and a survival probability (the quantity a single plot of both cannot show). */
export const fidelityTimesSurvival = (F: number, S: number): number => F * S

/* ------------------------------------------------ the limits of imaging (also see imaging.ts) ------------------------------------------------ */
/** The recoil energy gained per scattered photon, in kelvin: 2E_R/k_B = ħ²k²/(M k_B) of the atom line `a` (E_R = ħγ_R). */
export const recoilGainK = (a: AtomLine): number => (2 * HBAR * recoilRate(a)) / K_BOLTZMANN
/** How many photons of that gain a trap of depth `depthK` (K) absorbs, with no cooling at all: depth over gain. */
export const photonsToDepth = (depthK: number, gainK: number): number => depthK / gainK
/** The chance that an atom has not been pumped into the wrong hyperfine level after `N` scattered photons, each with chance `p`: (1 − p)^N. */
export const depumpSurvival = (N: number, p: number): number => (1 - p) ** N
/** The number of photons after which that chance is 1/e: −1/ln(1 − p) (about 1/p for a small p). */
export const depumpPhotonsOneOverE = (p: number): number => -1 / Math.log(1 - p)
/** The wave number of the D2 line (for the Lamb–Dicke parameter of the imaging light): k = 2π/λ. */
export const imagingWaveNumber = (a: AtomLine = CS_D2): number => waveNumber(a)
