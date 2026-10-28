/**
 * The Optics Lab engine, part one (Metcalf and van der Straten, Cooling and Trapping of Neutral Atoms): laser slowing, optical molasses,
 * sub-Doppler cooling, magnetic traps, dipole traps and the magneto-optical trap. SI units throughout (ħ from `constants.ts`; the 448
 * engine keeps ħ = 1 and is not touched). Detunings are δ/γ (negative = below resonance), s = I/I_s is the saturation per beam, γ = 1/τ
 * is the natural linewidth in rad/s (the book's), k = 2π/λ, γ_R = ħk²/2M (the book's recoil rate), temperatures are in kelvin.
 * Atoms are STATED INPUTS (Steck, "Alkali D Line Data"; NIST ASD): the pages show them with that citation. Every function returns a plain
 * number or a small record; the numpy twin of each (pipeline/make_optics_fixtures.py) takes a different route (ODE, quadrature,
 * numeric derivative, bounded minimisation, sympy Clebsch–Gordan, scipy Airy zeros), and the claim twins (pipeline/claims_optics/o.py)
 * recompute every displayed number. NOT in the entry closure: only the optics pages' values, the lazy `plot` kind and the bench presets import it.
 */
import { C_LIGHT, HBAR, H_PLANCK, K_BOLTZMANN, U_ATOMIC, bohrMagneton } from '../constants'

/** A D-line transition as a stated model input. `gamma` is 1/τ in rad/s; `gF` is the ground-state Landé factor where a page needs one. */
export interface AtomLine {
  name: string
  lambdaM: number
  gamma: number
  massKg: number
  gF?: number
}

const atom = (name: string, lambdaNm: number, gammaOver2PiMHz: number, massU: number, gF?: number): AtomLine => ({
  name,
  lambdaM: lambdaNm * 1e-9,
  gamma: 2 * Math.PI * gammaOver2PiMHz * 1e6,
  massKg: massU * U_ATOMIC,
  ...(gF === undefined ? {} : { gF }),
})

/** Standard atomic data (Steck, Alkali D Line Data; NIST ASD): wavelength nm, γ/2π MHz, mass u. */
export const NA_D2 = atom('Na D2', 589.158, 9.7946, 22.98976928)
export const RB87_D2 = atom('Rb-87 D2', 780.241, 6.0666, 86.909180527)
export const RB85_D2 = atom('Rb-85 D2', 780.241, 6.0666, 84.911789738, 1 / 3)
export const CS_D2 = atom('Cs D2', 852.347, 5.234, 132.905451961)
/** Hydrogen Lyman-α (Correction C2 only). */
export const H_LYA = atom('H Lyman-α', 121.567, 99.7, 1.00782503)

/** Standard gravity, m/s². */
export const G_STANDARD = 9.80665
/** One torr in pascal (101325/760). */
export const TORR_PA = 101325 / 760

const PI = Math.PI
/** k = 2π/λ, rad/m. */
export const waveNumber = (a: AtomLine): number => (2 * PI) / a.lambdaM

/* ----------------------------------------------------------------------------- basics (Ch. 1) */
/** ħk/M, m/s: the speed one absorbed photon gives the atom. */
export const recoilVelocity = (a: AtomLine): number => (HBAR * waveNumber(a)) / a.massKg
/** γ_R = ħk²/2M, s⁻¹ (the book's recoil rate). */
export const recoilRate = (a: AtomLine): number => (HBAR * waveNumber(a) ** 2) / (2 * a.massKg)
/** ħ²k²/(M k_B), K: the recoil temperature as Table 6.1 and p. 41 use it (twice the p. 20 value ħγ_R/k_B; Correction C6). */
export const recoilTemperature = (a: AtomLine): number => (HBAR * waveNumber(a)) ** 2 / (a.massKg * K_BOLTZMANN)
/** T_D = ħγ/2k_B, K. */
export const dopplerTemperature = (a: AtomLine): number => (HBAR * a.gamma) / (2 * K_BOLTZMANN)
/** a_max = ħkγ/2M, m/s²: half the time in the excited state. */
export const maxAcceleration = (a: AtomLine): number => (HBAR * waveNumber(a) * a.gamma) / (2 * a.massKg)
/** I_s = πhcγ/3λ³, W/m². */
export const saturationIntensity = (a: AtomLine): number => (PI * H_PLANCK * C_LIGHT * a.gamma) / (3 * a.lambdaM ** 3)
/** γ/k, m/s: the speed whose Doppler shift is one linewidth. */
export const gammaOverK = (a: AtomLine): number => a.gamma / waveNumber(a)
/** The scattering rate of one beam (Eq. 1.1), s⁻¹: (γ/2) s/(1 + s + 4(δ/γ)²). */
export const scatterRate = (a: AtomLine, s: number, dl: number): number => ((a.gamma / 2) * s) / (1 + s + 4 * dl * dl)

/* ----------------------------------------------------------------------------- slowing (Ch. 1) */
export interface SlowRow {
  /** √(3k_BT/M) at the oven temperature, m/s. */
  vPeak: number
  /** v²/2a_max, m. */
  stopLength: number
  /** v/a_max, s. */
  stopTime: number
}
export function slowRow(a: AtomLine, ovenK: number): SlowRow {
  const v = Math.sqrt((3 * K_BOLTZMANN * ovenK) / a.massKg)
  const am = maxAcceleration(a)
  return { vPeak: v, stopLength: (v * v) / (2 * am), stopTime: v / am }
}

export interface ZeemanSlower {
  v0: number
  eta: number
  /** Deceleration η a_max, m/s². */
  decel: number
  /** z₀ = M v₀²/(η ħkγ), m: the length of the slower (Correction C1). */
  z0: number
  /** B₀ = ħk v₀/μ′, T. */
  B0: number
  /** v₀/(η a_max), s. */
  tStop: number
}
/** A slower for the atom entering at v₀ with the design fraction η of the maximum deceleration; μ′ = `muPrimeOverMuB` Bohr magnetons. */
export function zeemanSlower(a: AtomLine, v0: number, eta: number, muPrimeOverMuB = 1): ZeemanSlower {
  const decel = eta * maxAcceleration(a)
  return { v0, eta, decel, z0: (v0 * v0) / (2 * decel), B0: (HBAR * waveNumber(a) * v0) / (muPrimeOverMuB * bohrMagneton()), tStop: v0 / decel }
}
/** The field B(z) = B₀√(1 − z/z₀) and the resonant speed v_R(z) = v₀√(1 − z/z₀) along the slower; past z₀ the atom has stopped and both are 0. */
export function zeemanProfile(sl: ZeemanSlower, z: number): { B: number; vR: number } {
  if (!(z >= 0)) return { B: Number.NaN, vR: Number.NaN }
  const u = Math.sqrt(Math.max(0, 1 - z / sl.z0))
  return { B: sl.B0 * u, vR: sl.v0 * u }
}
/** The chirp rate k·η·a_max/2π, Hz/s. */
export const chirpRate = (a: AtomLine, eta: number): number => (waveNumber(a) * eta * maxAcceleration(a)) / (2 * PI)
/** kv/γ: how many linewidths the Doppler shift is at speed v. */
export const dopplerOverGamma = (a: AtomLine, v: number): number => (waveNumber(a) * v) / a.gamma
/**
 * The damping of a slowing beam tuned so that it gives the fraction η of the maximum force at saturation s: with x² = s(1−η)/η − 1,
 * β = 4Mγ_Rη²x/s (kg/s) and the damping time is M/β.
 */
export function slowerDamping(a: AtomLine, eta: number, s: number): { beta: number; time: number } {
  const x2 = (s * (1 - eta)) / eta - 1
  const beta = x2 >= 0 ? (4 * a.massKg * recoilRate(a) * eta * eta * Math.sqrt(x2)) / s : Number.NaN
  return { beta, time: a.massKg / beta }
}
/** Δx = (2ħk/3M)√(Γ t³), m: the sideways random walk of recoil during a slowing of duration t = v₀/(η a_max) at the rate Γ = ηγ/2. */
export function transverseDiffusion(a: AtomLine, v0: number, eta: number): number {
  const t = v0 / (eta * maxAcceleration(a))
  return ((2 * recoilVelocity(a)) / 3) * Math.sqrt(((eta * a.gamma) / 2) * t ** 3)
}
/** The beam's angle θ₀v₀/v after slowing from v₀ to v (the transverse speed is unchanged). */
export const divergence = (theta0: number, v0: number, v: number): number => (theta0 * v0) / v
/** The fractional shift −v²/2c² of a moving clock (second-order Doppler). */
export const secondOrderDoppler = (v: number): number => -(v * v) / (2 * C_LIGHT * C_LIGHT)
/** The transit-time limit v/L to a line width, Hz (Δν·Δt ≥ 1). */
export const flightLimit = (L: number, v: number): number => v / L

/* ----------------------------------------------------------------------------- molasses (Ch. 2) */
/** The force of the +z beam, the −z beam and their sum on an atom at speed v (Eq. 2.1), N. Atom of speed v along +z; δ/γ = dl. */
export function beamForces(a: AtomLine, s: number, dl: number, v: number): { plus: number; minus: number; sum: number } {
  const f0 = (HBAR * waveNumber(a) * a.gamma) / 2
  const kv = (waveNumber(a) * v) / a.gamma
  const plus = (f0 * s) / (1 + s + 4 * (dl - kv) ** 2)
  const minus = (-f0 * s) / (1 + s + 4 * (dl + kv) ** 2)
  return { plus, minus, sum: plus + minus }
}
/** The friction coefficient of the two-beam force at small v (Eq. 2.2), kg/s, positive for red detuning: F = −βv. */
export const molassesBeta = (a: AtomLine, s: number, dl: number): number => (-8 * HBAR * waveNumber(a) ** 2 * dl * s) / (1 + 4 * dl * dl + s) ** 2

/** The x of the largest f(x) on [lo, hi]: a 400-point scan, then a golden-section search inside the best interval. */
function argMax(f: (x: number) => number, lo: number, hi: number): number {
  const n = 400
  let best = 0
  let bv = -Infinity
  for (let i = 0; i <= n; i++) {
    const y = f(lo + ((hi - lo) * i) / n)
    if (y > bv) (bv = y), (best = i)
  }
  let a = lo + ((hi - lo) * Math.max(0, best - 1)) / n
  let b = lo + ((hi - lo) * Math.min(n, best + 1)) / n
  const g = (Math.sqrt(5) - 1) / 2
  let c = b - g * (b - a)
  let d = a + g * (b - a)
  for (let i = 0; i < 90; i++) {
    if (f(c) > f(d)) b = d
    else a = c
    c = b - g * (b - a)
    d = a + g * (b - a)
  }
  return (a + b) / 2
}
/** The speed at which the two-beam force is largest, m/s, found numerically (golden section on |F|). */
export function molassesPeak(a: AtomLine, s: number, dl: number): number {
  const vmax = (gammaOverK(a) * Math.max(3, 2 * Math.abs(dl) + 2)) * Math.sqrt(1 + s)
  return argMax((v) => -beamForces(a, s, dl, v).sum, 0, vmax)
}
/** The book's closed form for that speed (p. 18): (γ′/2k)X/√3 with γ′ = γ√(1+s), x = (2δ/γ′)², X = √(x − 1 + 2√(x² + x + 1)), m/s. */
export function molassesPeakFormula(a: AtomLine, s: number, dl: number): number {
  const gp = a.gamma * Math.sqrt(1 + s)
  const x = (2 * dl * a.gamma / gp) ** 2
  return ((gp / (2 * waveNumber(a))) * Math.sqrt(x - 1 + 2 * Math.sqrt(x * x + x + 1))) / Math.sqrt(3)
}
/** The capture velocity γ/2k, m/s. */
export const captureVelocity = (a: AtomLine): number => a.gamma / (2 * waveNumber(a))
/** The steady-state Doppler temperature (ħγ/4k_B)(2|δ|/γ + γ/2|δ|), K, minimal at δ = −γ/2 where it is ħγ/2k_B. */
export const dopplerSteadyT = (a: AtomLine, dl: number): number => ((HBAR * a.gamma) / (4 * K_BOLTZMANN)) * (2 * Math.abs(dl) + 1 / (2 * Math.abs(dl)))
/** The temperature k_BT = D₀/β with D₀ = (ħk)²·2Γ_sc (Γ_sc the rate of one beam), K; NaN when the friction is not positive (blue detuning). */
export function diffusionTemperature(a: AtomLine, s: number, dl: number): number {
  const beta = molassesBeta(a, s, dl)
  const d0 = (HBAR * waveNumber(a)) ** 2 * 2 * scatterRate(a, s, dl)
  return beta > 0 ? d0 / (beta * K_BOLTZMANN) : Number.NaN
}
/** How far below the linear law −βv the two-beam force falls at speed v: 1 − |F|/(β|v|). */
export const molassesLinearityError = (a: AtomLine, s: number, dl: number, v: number): number => 1 - Math.abs(beamForces(a, s, dl, v).sum) / (molassesBeta(a, s, dl) * Math.abs(v))

export interface Collimation {
  /** γ/γ_R. */
  gOverGR: number
  /** √(γ/γ_R): the one-axis compression of the momentum width. */
  compress1D: number
  /** The rms transverse speed √(ħγ/2M), m/s. */
  dvRms: number
  /** γ/2k, m/s. */
  vc: number
  /** (2v_c)²/2a_max, m (Correction C3). */
  dx: number
  /** (γ/γ_R)(v_th/√(ħγ/2M)): both the transverse and the longitudinal compression, with v_th = √(3k_BT/M) at the oven temperature. */
  psCompress: number
}
export function collimation(a: AtomLine, ovenK: number): Collimation {
  const gr = recoilRate(a)
  const dvRms = Math.sqrt((HBAR * a.gamma) / (2 * a.massKg))
  const vc = captureVelocity(a)
  return {
    gOverGR: a.gamma / gr,
    compress1D: Math.sqrt(a.gamma / gr),
    dvRms,
    vc,
    dx: (2 * vc) ** 2 / (2 * maxAcceleration(a)),
    psCompress: (a.gamma / gr) * (Math.sqrt((3 * K_BOLTZMANN * ovenK) / a.massKg) / dvRms),
  }
}
/** The random walk in unbalanced-free molasses: step √(ħγ/M)/γ_R, the steps to diffuse a distance L, and the time at γ_R steps per second. */
export function molassesWalk(a: AtomLine, L: number): { step: number; steps: number; time: number } {
  const step = Math.sqrt((HBAR * a.gamma) / a.massKg) / recoilRate(a)
  const steps = (L / step) ** 2
  return { step, steps, time: steps / recoilRate(a) }
}
/** The dressed pair in strong light: Ω = γ√(s/2 + (δ/γ)²) (rad/s), the light shift ħ(Ω − |δ|)/2 (J) and cos 2φ = −δ/Ω. */
export function dressed(a: AtomLine, s: number, dl: number): { omega: number; shift: number; cos2phi: number } {
  const omega = a.gamma * Math.sqrt(s / 2 + dl * dl)
  return { omega, shift: (HBAR * (omega - Math.abs(dl) * a.gamma)) / 2, cos2phi: (-dl * a.gamma) / omega }
}
/** The one-dimensional Doppler speed √(7ħγ/20M) of the MILC model (Correction C4), m/s. */
export const dopplerSpeed1D = (a: AtomLine): number => Math.sqrt((7 * HBAR * a.gamma) / (20 * a.massKg))

/* ----------------------------------------------------------------------------- sub-Doppler cooling (Ch. 3) */
/** |⟨Jg mg; 1 q | Je mg+q⟩|² for Je = Jg + 1 (q = +1, 0, −1 for σ⁺, π, σ⁻): the relative strength of the transition. */
export function clebschSquared(Jg: number, mg: number, q: -1 | 0 | 1): number {
  const d = (2 * Jg + 1) * (2 * Jg + 2)
  if (q === 1) return ((Jg + mg + 1) * (Jg + mg + 2)) / d
  if (q === -1) return ((Jg - mg + 1) * (Jg - mg + 2)) / d
  return (2 * (Jg - mg + 1) * (Jg + mg + 1)) / ((2 * Jg + 1) * (2 * Jg + 2))
}
/** The ground-state light shift of Eq. 3.1, J: U = 2ħδ s C²/(1 + 4δ²/γ²); `c2` is the squared Clebsch–Gordan weight (1 for the stretched state). */
export const lightShiftGround = (a: AtomLine, s: number, dl: number, c2 = 1): number => (2 * HBAR * dl * a.gamma * s * c2) / (1 + 4 * dl * dl)
/**
 * The lin⊥lin potential of the m = ±½ sublevel of a Jg = ½ → Je = 3/2 atom (Fig. 3.2): U₁[⅓ + ⅔cos²(kz)] for m = +½, sin² for m = −½,
 * z in wavelengths, in units of whatever U₁ is in. MODEL (ruling O3): the polarization cycle σ⁺, linear, σ⁻, linear with the weights ⅓ and 1.
 */
export const sisyphusPotential = (U1: number, zOverLambda: number, m: 0.5 | -0.5): number => {
  const c = Math.cos(2 * PI * zOverLambda)
  const s = Math.sin(2 * PI * zOverLambda)
  return U1 * (1 / 3 + (2 / 3) * (m > 0 ? c * c : s * s))
}
/** The height ⅔|U₁| of the hills one sublevel climbs. */
export const sisyphusHill = (U1: number): number => (2 / 3) * Math.abs(U1)
/** The friction ħk²|δ|/γ of lin⊥lin cooling, kg/s. */
export const sisyphusFriction = (a: AtomLine, dl: number): number => HBAR * waveNumber(a) ** 2 * Math.abs(dl)
/** The largest Doppler friction ħk²/2 (δ = −γ/2, s = 2), kg/s. */
export const dopplerFrictionMax = (a: AtomLine): number => (HBAR * waveNumber(a) ** 2) / 2
/** The 3D limit k_BT = c|U₁| (Eq. 3.13; c = 0.125 lin⊥lin, 0.097 σ⁺σ⁻), K. */
export const subDopplerLimit = (U1: number, c: number): number => (c * Math.abs(U1)) / K_BOLTZMANN
/** The Larmor frequency ω_Z = g_F μ_B B/ħ, rad/s (B in tesla). */
export const zeemanOmega = (gF: number, B: number): number => (gF * bohrMagneton() * B) / HBAR
/** The resonance speed of velocity-selective resonance: ω_Z/2k (lin⊥lin and MILC) or ω_Z/k (σ⁺σ⁻), m/s (Correction C5). */
export const vsrVelocity = (omegaZ: number, k: number, kind: 'sigma' | 'lin'): number => (kind === 'sigma' ? omegaZ / k : omegaZ / (2 * k))
/** Eq. 3.3: F = −β(v − v_r)/(1 + ((v − v_r)/v_c)²). */
export const vsrForce = (v: number, beta: number, vr: number, vc: number): number => (-beta * (v - vr)) / (1 + ((v - vr) / vc) ** 2)
/** The two Raman resonances at +v_r and −v_r together (the model of the two-peak splitting, p. 34). */
export const vsrForcePair = (v: number, beta: number, vr: number, vc: number): number => vsrForce(v, beta, vr, vc) + vsrForce(v, beta, -vr, vc)
/** The lower edge ω_Z/k (m/s) of the speeds where MILC cooling works (ω_Z < kv < γ_p), for a ground-state factor g_F and B in tesla. */
export const milcWindow = (a: AtomLine, gF: number, B: number): { low: number } => ({ low: zeemanOmega(gF, B) / waveNumber(a) })

/* ----------------------------------------------------------------------------- magnetic traps (Ch. 4) */
/** U = (μ/μ_B) μ_B A √(ρ² + 4z²), J: the quadrupole potential (radial gradient A in T/m). */
export const quadrupoleU = (muOverMuB: number, A: number, rho: number, z: number): number => muOverMuB * bohrMagneton() * A * Math.sqrt(rho * rho + 4 * z * z)
/** a = μA/M, m/s²: the constant radial acceleration. */
export const trapAcceleration = (massKg: number, muOverMuB: number, A: number): number => (muOverMuB * bohrMagneton() * A) / massKg
/** The circular orbit at radius ρ: v = √(ρa) and T = 2π√(ρ/a). */
export const circularOrbit = (accel: number, rho: number): { v: number; period: number } => ({ v: Math.sqrt(rho * accel), period: 2 * PI * Math.sqrt(rho / accel) })
/** The adiabaticity limits ρ ≫ (ħ²/M²a)^{1/3} and v ≫ (ħa/M)^{1/3}. */
export const adiabaticLimits = (accel: number, massKg: number): { rhoMin: number; vMin: number } => ({ rhoMin: (HBAR ** 2 / (massKg ** 2 * accel)) ** (1 / 3), vMin: ((HBAR * accel) / massKg) ** (1 / 3) })
/** n = Mvρ/ħ = ω_Z/ω_T, the angular momentum of the orbit in units of ħ. */
export const orbitN = (massKg: number, v: number, rho: number): number => (massKg * v * rho) / HBAR
/** E₁ = (Ma²ħ²)^{1/3}, J. */
export const heuristicE1 = (massKg: number, accel: number): number => (massKg * (accel * HBAR) ** 2) ** (1 / 3)
/** E_n = (3/2)E₁n^{2/3}, J: the circular orbits with L = nħ (p. 51). */
export const heuristicLevel = (massKg: number, accel: number, n: number): number => 1.5 * heuristicE1(massKg, accel) * n ** (2 / 3)

/** Eigenvalues below index `count` of a symmetric tridiagonal matrix by Sturm bisection. */
function tridiagLowest(diag: number[], off: number, count: number): number[] {
  const n = diag.length
  const below = (x: number): number => {
    let c = 0
    let q = diag[0] - x
    if (q < 0) c++
    for (let i = 1; i < n; i++) {
      q = diag[i] - x - (off * off) / (q === 0 ? 1e-300 : q)
      if (q < 0) c++
    }
    return c
  }
  const out: number[] = []
  const hi0 = Math.max(...diag) + 2 * Math.abs(off) + 1
  let lo0 = Math.min(...diag) - 2 * Math.abs(off) - 1
  for (let j = 0; j < count; j++) {
    let lo = lo0
    let hi = hi0
    for (let it = 0; it < 80; it++) {
      const mid = (lo + hi) / 2
      if (below(mid) > j) hi = mid
      else lo = mid
    }
    out.push((lo + hi) / 2)
  }
  return out
}
const unitCache = new Map<number, number[]>()
/**
 * The levels of V = F|x| in units of (ħ²F²/2M)^{1/3}: the zeros of Ai′ (even states) and Ai (odd) taken alternately, found WITHOUT the Airy
 * function by diagonalising −d²/dx² + |x| on a grid (second differences) at two spacings and extrapolating the error away (Richardson).
 */
export function vTrapUnits(count: number): number[] {
  const hit = unitCache.get(count)
  if (hit) return hit
  const L = 14 + count
  const grid = (n: number): number[] => {
    const dx = (2 * L) / (n + 1)
    const diag = Array.from({ length: n }, (_, i) => 2 / (dx * dx) + Math.abs(-L + (i + 1) * dx))
    return tridiagLowest(diag, -1 / (dx * dx), count)
  }
  const coarse = grid(1500)
  const fine = grid(3000)
  const out = fine.map((e, i) => (4 * e - coarse[i]) / 3)
  unitCache.set(count, out)
  return out
}
/** The first `count` levels of the V-shaped well F|x| (F = μA in N), J, measured from the bottom. */
export function vTrapLevels(massKg: number, F: number, count: number): number[] {
  const scale = ((HBAR * F) ** 2 / (2 * massKg)) ** (1 / 3)
  return vTrapUnits(count).map((e) => e * scale)
}
/** The energy g m μ_B B of a moment in a field, in kelvin (B in tesla). */
export const zeemanEnergyK = (gm: number, B: number): number => (gm * bohrMagneton() * B) / K_BOLTZMANN
/** The depth of a magnetic trap whose wall field is B: the same energy, kelvin. */
export const trapDepthK = (gm: number, Bwall: number): number => zeemanEnergyK(gm, Bwall)

/* ----------------------------------------------------------------------------- optical traps and the MOT (Ch. 5) */
/** The depth of one beam's trap, ħ(Ω − |δ|)/2 (J), by the stable form (γ²s/2)/(Ω + |δ|) (the book's dressed shift, Gordon–Ashkin's model). */
export function dipoleDepth(a: AtomLine, s: number, dl: number): number {
  const omega = a.gamma * Math.sqrt(s / 2 + dl * dl)
  return (HBAR * ((a.gamma * a.gamma * s) / 2 / (omega + Math.abs(dl) * a.gamma))) / 2
}
/** The scattering rate of the trapping light, s⁻¹ (the same law as Eq. 1.1). */
export const dipoleScatterRate = (a: AtomLine, s: number, dl: number): number => scatterRate(a, s, dl)
/** depth/(2E_R Γ), s: how long recoil heating alone takes to warm an atom to the trap depth (E_R = ħγ_R). */
export const recoilHeatingTime = (depthJ: number, a: AtomLine, rate: number): number => depthJ / (2 * HBAR * recoilRate(a) * rate)
/** ħω = 2√(U_b E_R), J: the vibrational quantum of a lattice of modulation depth U_b. */
export const latticeVibration = (Ub: number, ER: number): number => 2 * Math.sqrt(Ub * ER)

export interface MotParams {
  s: number
  dl: number
  /** Gradient A, T/m. */
  A: number
  /** μ′, J/T (the stretched-state moment: one Bohr magneton unless stated). */
  muPrime: number
}
/** The MOT force on an atom at z (m) moving at v (m/s) (§5.2.1): both beams' detunings carry the Doppler shift kv and the Zeeman shift μ′Az/ħ, N. */
export function motForce(a: AtomLine, p: MotParams, z: number, v: number): number {
  const f0 = (HBAR * waveNumber(a) * a.gamma) / 2
  const shift = (waveNumber(a) * v) / a.gamma + (p.muPrime * p.A * z) / (HBAR * a.gamma)
  return (f0 * p.s) / (1 + p.s + 4 * (p.dl - shift) ** 2) - (f0 * p.s) / (1 + p.s + 4 * (p.dl + shift) ** 2)
}
export interface MotLinear {
  /** Spring constant, N/m. */
  kappa: number
  /** Damping, kg/s. */
  beta: number
  /** √(κ/M), rad/s. */
  omega: number
  /** ħ|δ|/μ′A, m: the half-size where the Zeeman shift reaches the detuning. */
  size: number
  /** β/2√(κM): the damping ratio (above 1: overdamped). */
  zeta: number
}
export function motLinear(a: AtomLine, p: MotParams): MotLinear {
  const beta = molassesBeta(a, p.s, p.dl)
  const kappa = (beta * p.muPrime * p.A) / (HBAR * waveNumber(a))
  return { kappa, beta, omega: Math.sqrt(kappa / a.massKg), size: (HBAR * Math.abs(p.dl) * a.gamma) / (p.muPrime * p.A), zeta: beta / (2 * Math.sqrt(kappa * a.massKg)) }
}
/** The capture speed √(2 a_max d) over a beam of diameter d and the kinetic energy it corresponds to (K). */
export function capture(a: AtomLine, d: number): { v: number; energyK: number } {
  const v = Math.sqrt(2 * maxAcceleration(a) * d)
  return { v, energyK: (a.massKg * v * v) / (2 * K_BOLTZMANN) }
}
/** erf by its Taylor series (|x| < 2) and by the continued fraction of erfc beyond; about 1e-15 absolute. */
export function erf(x: number): number {
  const ax = Math.abs(x)
  if (ax < 2) {
    let term = ax
    let sum = ax
    for (let n = 1; n < 80; n++) {
      term *= (-ax * ax) / n
      sum += term / (2 * n + 1)
    }
    return (Math.sign(x) * 2 * sum) / Math.sqrt(PI)
  }
  let f = 0
  for (let n = 60; n >= 1; n--) f = n / 2 / (ax + f)
  return Math.sign(x) * (1 - Math.exp(-ax * ax) / (Math.sqrt(PI) * (ax + f)))
}
/** The share of a Maxwell–Boltzmann vapour at T whose speed is below v_c: erf(x) − 2x e^{−x²}/√π, x = v_c/√(2k_BT/M), by the small-x series where erf would cancel. */
export function boltzmannBelow(vc: number, T: number, massKg: number): number {
  const x = vc / Math.sqrt((2 * K_BOLTZMANN * T) / massKg)
  if (x < 1) {
    let term = x
    let sum = 0
    for (let n = 1; n < 60; n++) {
      term *= (-x * x) / n // (−1)ⁿ x^{2n+1}/n!, from x^{2(n−1)+1}/(n−1)! with its sign
      sum += (-term * 2 * n) / (2 * n + 1)
    }
    return (2 / Math.sqrt(PI)) * sum
  }
  return erf(x) - (2 * x * Math.exp(-x * x)) / Math.sqrt(PI)
}
/** The number density p/(k_BT) of a vapour at `torr` and `T`, m⁻³. */
export const vaporDensity = (torr: number, T: number): number => (torr * TORR_PA) / (K_BOLTZMANN * T)
/** λ_dB = h/p, m. */
export const deBroglie = (p: number): number => H_PLANCK / p
/** λ_dB = h/√(2πMk_BT), m: the thermal de Broglie wavelength. */
export const thermalDeBroglie = (massKg: number, T: number): number => H_PLANCK / Math.sqrt(2 * PI * massKg * K_BOLTZMANN * T)
