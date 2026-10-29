/**
 * Qubits in chips (Physics 709 chapter Q27, "Qubits in chips: transmons and quantum dots"; Bergou Chapter 15, pp. 269-297).
 *
 * Circuits are in SI (L in henry, C in farad, f in hertz, flux in weber); the Cooper toy model is in the units of its own energy scale; the charge qubit and the transmon are in
 * units of the charging energy E_C (the book's E_C = (2e)^2/2C_Sigma counts Cooper pairs and is FOUR times the common e^2/2C_Sigma); circuit QED and the spin qubit take angular
 * frequencies in rad/s or fields in tesla. hbar = 1 inside the 2 x 2 and 4 x 4 blocks (dimensionless couplings); the SI constants are the exact ones of `constants.ts`.
 *
 * The charge qubit is diagonalised in the charge basis |n>, n = -nMax..nMax, H = E_C (n - n_g)^2 - (E_J/2)(|n><n+1| + h.c.) (Eq. 15.8 with cos(theta) = (|n><n+1| + h.c.)/2); the
 * levels are cross-checked in the tests against the Mathieu characteristic values a_nu(q), q = -2 E_J/E_C (scipy's `mathieu_a`/`mathieu_b`, in the numpy twin).
 * Dispersions are differences of two doubles near -E_J: below about 1e-12 E_C (E_J/E_C above about 30) the diagonalisation is noise, so the chapter stops there.
 *
 * Rule (l): imported only by the lazy chapter values (content/qc709/Q27.values.ts), the lazy `plot` tables and tests; never by the entry closure.
 */
import { C_LIGHT, E_CHARGE, HBAR, H_PLANCK, K_BOLTZMANN, M_ELECTRON, bohrMagneton, boxEnergyEv } from '../constants'
import { type C, abs2, c, expi } from '../complex'
import { rabiFlipTime } from '../dynamics'
import { type Mat, type Vec, apply, identity, madd, matmul, maxDiff, mscale } from '../linalg'
import { type Circuit, circuitUnitary } from './circuit'
import { eigh, expmHermitian, kronM } from './cmat'
import { I2, SWAP2, pauliString } from './gates'

const TAU = 2 * Math.PI
/** The vacuum permeability, H/m (CODATA 2018; the 2019 SI no longer fixes it). */
export const MU_0 = 1.25663706212e-6

/* --------------------------------------------------------------------------- the LC circuit (Unit 27.1) --------------------------------------------------------------------------- */

/** omega = 1/sqrt(LC), rad/s (p. 271). */
export const lcOmega = (L: number, C: number): number => 1 / Math.sqrt(L * C)
/** f = omega/2 pi, Hz. */
export const lcFreq = (L: number, C: number): number => lcOmega(L, C) / TAU
/** lambda = c/f, metres. */
export const lcWavelength = (f: number): number => C_LIGHT / f
/** Z = sqrt(L/C), ohm. */
export const lcImpedance = (L: number, C: number): number => Math.sqrt(L / C)
/** One rung as a temperature, h f/k_B, kelvin. */
export const hfOverK = (f: number): number => (H_PLANCK * f) / K_BOLTZMANN
/** The mean photon number of a thermal oscillator, 1/(e^{hf/kT} - 1). */
export const thermalN = (f: number, T: number): number => 1 / Math.expm1(hfOverK(f) / T)
/** The chance of the ground state of a thermal oscillator, 1 - e^{-hf/kT}. */
export const thermalGround = (f: number, T: number): number => -Math.expm1(-hfOverK(f) / T)
/** The temperature (K) at which the ground-state chance of an oscillator of frequency f is p. */
export const groundTemperature = (f: number, p: number): number => hfOverK(f) / -Math.log1p(-p)

/** The truncated oscillator (hbar = 1): the lowering operator a, flux Phi = sqrt(Z/2)(a + a†) and charge Q = i sqrt(1/2Z)(a† - a), D levels. */
export function oscillatorOps(D: number, Z0 = 1): { a: Mat; Phi: Mat; Q: Mat } {
  const a: Mat = Array.from({ length: D }, (_, i) => Array.from({ length: D }, (_, j) => (j === i + 1 ? c(Math.sqrt(i + 1)) : c(0))))
  const ad: Mat = a[0].map((_, j) => a.map((row) => row[j]))
  const Phi = mscale(madd(a, ad), Math.sqrt(Z0 / 2))
  const Q = mscale(madd(ad, mscale(a, -1)), c(0, Math.sqrt(1 / (2 * Z0))))
  return { a, Phi, Q }
}
/** The largest |[Phi, Q] - i| entry over the levels below the cut-off (the last level of a truncated oscillator is wrong by construction). */
export function commutatorGap(D = 8): number {
  const { Phi, Q } = oscillatorOps(D)
  const PQ = matmul(Phi, Q)
  const QP = matmul(Q, Phi)
  let m = 0
  for (let i = 0; i < D - 1; i++)
    for (let j = 0; j < D - 1; j++) {
      m = Math.max(m, Math.hypot(PQ[i][j].re - QP[i][j].re, PQ[i][j].im - QP[i][j].im - (i === j ? 1 : 0)))
    }
  return m
}
/** The largest gap between Q^2/2C + Phi^2/2L (hbar = 1) and omega (n + 1/2) on the diagonal below the cut-off, for the given L and C, in units of omega. */
export function oscillatorHGap(L: number, C: number, D = 8): number {
  const Z0 = Math.sqrt(L / C)
  const w = 1 / Math.sqrt(L * C)
  const { Phi, Q } = oscillatorOps(D, Z0)
  const H = madd(mscale(matmul(Q, Q), 1 / (2 * C)), mscale(matmul(Phi, Phi), 1 / (2 * L)))
  let m = 0
  for (let n = 0; n < D - 2; n++) m = Math.max(m, Math.abs(H[n][n].re - w * (n + 0.5)) / w)
  return m
}
/** |<2|Q|1>| / |<1|Q|0>| from the matrix of Q (sqrt 2): the 1 -> 2 pulse is stronger than 0 -> 1. */
export function leakRatio(): number {
  const { Q } = oscillatorOps(6)
  const q = (i: number, j: number): number => Math.hypot(Q[i][j].re, Q[i][j].im)
  return q(2, 1) / q(1, 0)
}

/** The diagonal of H = Q^2/2C + Phi^2/2L on the truncated oscillator in units of hbar omega (n + 1/2 below the cut-off), levels 0 .. D-2. */
export function oscillatorLevels(L: number, C: number, D = 8): number[] {
  const Z0 = Math.sqrt(L / C)
  const w = 1 / Math.sqrt(L * C)
  const { Phi, Q } = oscillatorOps(D, Z0)
  const H = madd(mscale(matmul(Q, Q), 1 / (2 * C)), mscale(matmul(Phi, Phi), 1 / (2 * L)))
  return Array.from({ length: D - 1 }, (_, n) => H[n][n].re / w)
}
/** |<n+1|Q|n>| / |<1|Q|0>| from the matrix of Q: sqrt(n + 1), the pulse strength of the step n -> n+1 relative to the first. */
export function oscillatorCoupling(n: number, D = 8): number {
  const { Q } = oscillatorOps(D)
  const q = (i: number, j: number): number => Math.hypot(Q[i][j].re, Q[i][j].im)
  return q(n + 1, n) / q(1, 0)
}

/* ----------------------------------------------------------- Cooper pairs, flux, London (Unit 27.2) ----------------------------------------------------------- */

/** The Cooper binding energy b = 2 E_c/(e^{2/N_F V} - 1) from the toy model's gap equation 1 = (N_F V/2) ln((2E_c + b)/b). */
export const cooperBinding = (NV: number, Ec: number): number => (2 * Ec) / Math.expm1(2 / NV)
/** The weak-coupling form 2 E_c e^{-2/N_F V}. */
export const cooperBindingExp = (NV: number, Ec: number): number => 2 * Ec * Math.exp(-2 / NV)

/** Gauss-Legendre nodes and weights on [-1, 1] by Newton's method. */
function gaussLegendre(n: number): { x: number[]; w: number[] } {
  const x: number[] = []
  const w: number[] = []
  for (let i = 0; i < n; i++) {
    let z = Math.cos((Math.PI * (i + 0.75)) / (n + 0.5))
    let dp = 1
    for (let it = 0; it < 100; it++) {
      let p1 = 1
      let p2 = 0
      for (let j = 0; j < n; j++) {
        const p3 = p2
        p2 = p1
        p1 = ((2 * j + 1) * z * p2 - j * p3) / (j + 1)
      }
      dp = (n * (z * p1 - p2)) / (z * z - 1)
      const z1 = z
      z = z1 - p1 / dp
      if (Math.abs(z - z1) < 1e-15) break
    }
    x.push(z)
    w.push(2 / ((1 - z * z) * dp * dp))
  }
  return { x, w }
}
const GL = gaussLegendre(8)

/** The integral of 1/(2 eps + b) over eps in [0, Ec] by 8-point Gauss-Legendre on panels that widen geometrically from b/2 (the integrand is steep near 0 when b is small). */
function pairIntegral(b: number, Ec: number): number {
  const edges = [0]
  let e = b / 2
  while (e < Ec) {
    edges.push(e)
    e *= 1.5
  }
  edges.push(Ec)
  let s = 0
  for (let k = 0; k + 1 < edges.length; k++) {
    const lo = edges[k]
    const hi = edges[k + 1]
    for (let i = 0; i < GL.x.length; i++) {
      const eps = ((hi - lo) * GL.x[i] + hi + lo) / 2
      s += (GL.w[i] * (hi - lo)) / 2 / (2 * eps + b)
    }
  }
  return s
}
/** The binding energy by solving N_F V * integral = 1 with bisection in ln b (no use of the closed form): agrees with `cooperBinding` to about 1e-9 relative. */
export function cooperBindingQuad(NV: number, Ec: number): number {
  let lo = Math.log(Ec * 1e-40)
  let hi = Math.log(Ec * 1e3)
  for (let it = 0; it < 200; it++) {
    const mid = (lo + hi) / 2
    if (NV * pairIntegral(Math.exp(mid), Ec) > 1) lo = mid
    else hi = mid
  }
  return Math.exp((lo + hi) / 2)
}

/** The flux quantum h/2e, weber. */
export const fluxQuantum = (): number => H_PLANCK / (2 * E_CHARGE)
/** B A / Phi_0: how many flux quanta a field B (T) pushes through an area A (m^2). */
export const loopFlux = (B: number, A: number): number => (B * A) / fluxQuantum()
/** The London length sqrt(m/(mu_0 n (2e)^2)) in metres, for the pair density n of the book (m^-3) and the electron mass. */
export const londonLength = (n: number): number => Math.sqrt(M_ELECTRON / (MU_0 * n * (2 * E_CHARGE) ** 2))

/* --------------------------------------------------------------------- Josephson (Unit 27.3) --------------------------------------------------------------------- */

/** The AC Josephson frequency 2 e V/h, Hz, for a voltage V (volt). */
export const josephsonFreq = (V: number): number => (2 * E_CHARGE * V) / H_PLANCK
/** The phase 2 e V t/hbar a junction at the fixed voltage V reaches after the time t. */
export const josephsonPhase = (V: number, t: number): number => (2 * E_CHARGE * V * t) / HBAR
/** I_0 = Phi_0/(2 pi L_J0), ampere, for the zero-phase inductance L_J0 (henry). */
export const josephsonI0 = (LJ0: number): number => fluxQuantum() / (TAU * LJ0)
/** L_J(theta) = Phi_0/(2 pi I_0 cos theta), henry. */
export const josephsonL = (I0: number, theta: number): number => fluxQuantum() / (TAU * I0 * Math.cos(theta))
/** E_J = Phi_0 I_0/2 pi, joule. */
export const josephsonEJ = (I0: number): number => (fluxQuantum() * I0) / TAU
/** The frequency (Hz) of the junction (I_0) with a shunt capacitor C at the phase theta. */
export const josephsonLcFreq = (I0: number, C: number, theta: number): number => lcFreq(josephsonL(I0, theta), C)
/** The SQUID's tuning |cos(pi Phi/Phi_0)| (Eq. 15.7), for the flux in units of Phi_0. */
export const squidScale = (fluxOverPhi0: number): number => Math.abs(Math.cos(Math.PI * fluxOverPhi0))
/** The flux (units of Phi_0, 0..1/2) at which the SQUID tuning equals s: arccos(s)/pi. */
export const squidFluxFor = (s: number): number => Math.acos(s) / Math.PI

/** The two-site wave function after the time t, hbar = 1: i d(psi)/dt = [[U1, K], [K, U2]] psi. */
export function twoSiteStep(K: number, U1: number, U2: number, psi0: Vec, t: number): Vec {
  const H: Mat = [
    [c(U1), c(K)],
    [c(K), c(U2)],
  ]
  return apply(expmHermitian(H, t), psi0)
}
const phaseOf = (z: C): number => Math.atan2(z.im, z.re)
/**
 * The rates from the tunnelling equations by a centred difference of the evolved state (step h): d n_1/dt and d(theta_2 - theta_1)/dt, with theta_j = arg psi_j.
 * Returns the gap of the first to 2 K sqrt(n1 n2) sin(theta_2 - theta_1) and (when n1 = n2) of the second to U1 - U2.
 */
export function josephsonRateGaps(K: number, U1: number, U2: number, psi0: Vec, h = 1e-4): { rateGap: number; phaseGap: number } {
  const fwd = twoSiteStep(K, U1, U2, psi0, h)
  const bwd = twoSiteStep(K, U1, U2, psi0, -h)
  const n1 = (v: Vec): number => abs2(v[0])
  const dn1 = (n1(fwd) - n1(bwd)) / (2 * h)
  const th = (v: Vec): number => phaseOf(v[1]) - phaseOf(v[0])
  const dth = ((th(fwd) - th(bwd) + 3 * Math.PI) % TAU - Math.PI) / (2 * h)
  const na = abs2(psi0[0])
  const nb = abs2(psi0[1])
  const formula = 2 * K * Math.sqrt(na * nb) * Math.sin(th(psi0))
  return { rateGap: Math.abs(dn1 - formula), phaseGap: Math.abs(dth - (U1 - U2)) }
}

/* ------------------------------------------------------------ the charge qubit and the transmon (Unit 27.4) ------------------------------------------------------------ */

const N_MAX = 30
/** The charge-basis Hamiltonian (units of E_C... pass E_C), index i <-> n = i - nMax: E_C (n - n_g)^2 on the diagonal and -E_J/2 beside it. */
export function chargeH(EC: number, EJ: number, ng: number, nMax = N_MAX): Mat {
  const D = 2 * nMax + 1
  return Array.from({ length: D }, (_, i) =>
    Array.from({ length: D }, (_, j) => (i === j ? c(EC * (i - nMax - ng) ** 2) : Math.abs(i - j) === 1 ? c(-EJ / 2) : c(0))),
  )
}
/**
 * The k-th (0-based) eigenvalue of the symmetric tridiagonal matrix (diagonal d, off-diagonal e) by Sturm-sequence bisection to the last bit. The sequence is backward stable entry by
 * entry, so the error is a few units in the last place times the entries near the (localised) eigenvector, not times the largest entry: a dispersion of 1e-9 keeps six digits where a
 * Jacobi sweep over the whole matrix (entries up to 144) keeps four.
 */
function tridiagEigen(d: readonly number[], e: readonly number[], k: number): number {
  const n = d.length
  const count = (x: number): number => {
    let q = d[0] - x
    let cnt = q < 0 ? 1 : 0
    for (let i = 1; i < n; i++) {
      q = d[i] - x - (e[i - 1] * e[i - 1]) / (q === 0 ? 1e-300 : q)
      if (q < 0) cnt++
    }
    return cnt
  }
  let lo = Infinity
  let hi = -Infinity
  for (let i = 0; i < n; i++) {
    const r = (i > 0 ? Math.abs(e[i - 1]) : 0) + (i < n - 1 ? Math.abs(e[i]) : 0)
    lo = Math.min(lo, d[i] - r)
    hi = Math.max(hi, d[i] + r)
  }
  for (let it = 0; it < 400; it++) {
    const mid = (lo + hi) / 2
    if (hi - lo <= 2e-16 * Math.max(1, Math.abs(mid))) break
    if (count(mid) > k) hi = mid
    else lo = mid
  }
  return (lo + hi) / 2
}
/** The lowest k levels of the charge qubit (E_C, E_J, n_g), ascending (Sturm bisection on the tridiagonal charge-basis matrix, nMax charge states each side). */
export function transmonLevels(EC: number, EJ: number, ng: number, k = 5, nMax = N_MAX): number[] {
  const d = Array.from({ length: 2 * nMax + 1 }, (_, i) => EC * (i - nMax - ng) ** 2)
  const e = Array.from({ length: 2 * nMax }, () => -EJ / 2)
  return Array.from({ length: k }, (_, j) => tridiagEigen(d, e, j))
}
/** The book's charging energy (2e)^2/2 C_Sigma, joule, for the island capacitance C_Sigma (farad): it counts Cooper pairs. */
export const chargingEnergy = (CSigma: number): number => (2 * E_CHARGE) ** 2 / (2 * CSigma)
/** The common charging energy e^2/2 C_Sigma (one electron), joule: a quarter of the book's. */
export const chargingEnergyCommon = (CSigma: number): number => E_CHARGE ** 2 / (2 * CSigma)
/**
 * The two-level cut of the charge qubit on |1>, |0>: H ~ zco sigma_z + xco sigma_x (+ const), read off the 2 x 2 block of the matrix. U = sqrt(zco^2 + xco^2); the energies are +- U.
 * The coefficient of sigma_z is -E_C (n_g - 1/2) (the page prints the opposite sign).
 */
export function twoLevelCut(EC: number, EJ: number, ng: number): { zco: number; xco: number; U: number } {
  const H = chargeH(EC, EJ, ng, 1)
  const zco = (H[2][2].re - H[1][1].re) / 2
  const xco = H[2][1].re
  return { zco, xco, U: Math.hypot(zco, xco) }
}
/** The full gap E_1 - E_0 at n_g, and the cut's 2U. */
export const fullGap = (EC: number, EJ: number, ng: number): number => {
  const L = transmonLevels(EC, EJ, ng, 2)
  return L[1] - L[0]
}
export const cutGap = (EC: number, EJ: number, ng: number): number => 2 * twoLevelCut(EC, EJ, ng).U
/** d(gap)/d(n_g) by a centred difference (step 1e-4), in units of E_C per unit of n_g. */
export function gapSlope(EC: number, EJ: number, ng: number, h = 1e-4): number {
  return (fullGap(EC, EJ, ng + h) - fullGap(EC, EJ, ng - h)) / (2 * h)
}
/** f_01(n_g)/f_01(1/2) at E_J/E_C = r (E_C = 1). */
export const f01Band = (r: number, ng: number): number => fullGap(1, r, ng) / fullGap(1, r, 0.5)
/** The swing of the qubit frequency over a period, f_01(0)/f_01(1/2). */
export const f01Spread = (r: number): number => f01Band(r, 0)
/** The charge dispersion eps_k = E_k(n_g = 1/2) - E_k(n_g = 0) in units of E_C, at E_J/E_C = r. */
export function chargeDispersion(r: number, k = 0): number {
  return transmonLevels(1, r, 0.5, k + 1)[k] - transmonLevels(1, r, 0, k + 1)[k]
}
const factorial = (k: number): number => (k <= 1 ? 1 : k * factorial(k - 1))
/** The page's formula for eps_k (E_C = 1): (-1)^k 2^{4k+3}/k! sqrt(2/pi) (2r)^{k/2+3/4} e^{-sqrt(2r)}. */
export const dispersionPrinted = (r: number, k = 0): number => ((-1) ** k * 2 ** (4 * k + 3)) / factorial(k) * Math.sqrt(2 / Math.PI) * (2 * r) ** (k / 2 + 0.75) * Math.exp(-Math.sqrt(2 * r))
/** The same with the exponent that the exact levels need, e^{-sqrt(32 r)} (the common-E_C result of Koch et al. rewritten for the book's E_C). */
export const dispersionKoch = (r: number, k = 0): number => ((-1) ** k * 2 ** (4 * k + 3)) / factorial(k) * Math.sqrt(2 / Math.PI) * (2 * r) ** (k / 2 + 0.75) * Math.exp(-Math.sqrt(32 * r))
/** alpha = (E_21 - E_10)/E_10 at n_g = 1/2, E_J/E_C = r. */
export function anharmonicity(r: number): number {
  const L = transmonLevels(1, r, 0.5, 3)
  return (L[2] - L[1] - (L[1] - L[0])) / (L[1] - L[0])
}
/** The page's large-ratio form of alpha, -1/sqrt(32 E_J/E_C). */
export const anharmonicityFormula = (r: number): number => -1 / Math.sqrt(32 * r)
/** (E_n - E_0)/(E_1 - E_0), n = 0..4, at n_g = 1/2, E_J/E_C = r: the ladder in units of the first gap. */
export function transmonLadder(r: number): number[] {
  const L = transmonLevels(1, r, 0.5, 5)
  return L.map((e) => (e - L[0]) / (L[1] - L[0]))
}
/** The harmonic estimate of the first gap, sqrt(2 E_J E_C) (E_C = 1). */
export const harmonicGap = (r: number): number => Math.sqrt(2 * r)
/** The first gap E_1 - E_0 in units of E_C at n_g = 1/2. */
export const firstGap = (r: number): number => fullGap(1, r, 0.5)

/* -------------------------------------------------------------------- circuit QED (Unit 27.5) -------------------------------------------------------------------- */

/** C = g^2/(kappa gamma) (p. 286); the three rates in the same unit. */
export const cooperativity = (g: number, kappa: number, gamma: number): number => (g * g) / (kappa * gamma)
/** chi = g^2/Delta (the shift of the dispersive limit). */
export const dispersiveShift = (g: number, Delta: number): number => (g * g) / Delta
/** t = (pi/2) Delta/g^2: the time for the exchange tau = g^2 t/Delta to reach pi/2. */
export const iswapTime = (g: number, Delta: number): number => (Math.PI / 2) * (Delta / (g * g))
/** The Jaynes-Cummings block of n photons (hbar = 1): [[Delta/2, g sqrt(n+1)], [g sqrt(n+1), -Delta/2]] relative to the mean level. */
export const jcBlock = (Delta: number, g: number, n: number): Mat => [
  [c(Delta / 2), c(g * Math.sqrt(n + 1))],
  [c(g * Math.sqrt(n + 1)), c(-Delta / 2)],
]
/** The two dressed levels [lower, upper] of the block. */
export const jcLevels = (Delta: number, g: number, n: number): number[] => eigh(jcBlock(Delta, g, n)).values
/** The splitting at resonance, 2 g sqrt(n+1), from the block. */
export function vacuumRabi(g: number, n: number): number {
  const L = jcLevels(0, g, n)
  return L[1] - L[0]
}
/** The upper level of the n = 0 block minus Delta/2 for Delta > 0: the exact first-order shift (about g^2/Delta). */
export const dispersiveShiftExact = (g: number, Delta: number): number => jcLevels(Delta, g, 0)[1] - Delta / 2
/** The gap between the upper level of the block and Delta/2 + g^2 (n+1)/Delta (the expansion for |Delta| >> g). */
export const dispersiveExpansionGap = (g: number, Delta: number, n: number): number => Math.abs(jcLevels(Delta, g, n)[1] - (Delta / 2 + (g * g * (n + 1)) / Delta))
/** The exchange evolution exp(-i tau (|01><10| + |10><01|)) on the basis 00, 01, 10, 11. */
export function exchangeEvolution(tau: number): Mat {
  const H: Mat = Array.from({ length: 4 }, (_, i) => Array.from({ length: 4 }, (_, j) => ((i === 1 && j === 2) || (i === 2 && j === 1) ? c(1) : c(0))))
  return expmHermitian(H, tau)
}
/** The chance that |01> is found as |10> after the exchange tau: sin^2 tau. */
export const swapChance = (tau: number): number => abs2(exchangeEvolution(tau)[2][1])
/** The gap between exchangeEvolution(pi/2) and the iSWAP matrix (|01> -> -i|10>, |10> -> -i|01>, 00 and 11 fixed). */
export function iswapGap(): number {
  const mi = c(0, -1)
  const U: Mat = [
    [c(1), c(0), c(0), c(0)],
    [c(0), c(0), mi, c(0)],
    [c(0), mi, c(0), c(0)],
    [c(0), c(0), c(0), c(1)],
  ]
  return maxDiff(exchangeEvolution(Math.PI / 2), U)
}

/* ------------------------------------------------------------------ the spin qubit in a dot (Unit 27.6) ------------------------------------------------------------------ */

/** The Zeeman frequency f = 2 mu_B B/h in Hz, for the field B (T). */
export const zeemanFreq = (B: number): number => (2 * bohrMagneton() * B) / H_PLANCK
/** The field (T) at which the Zeeman frequency is f. */
export const zeemanField = (f: number): number => (H_PLANCK * f) / (2 * bohrMagneton())
/** The chance of the lower level of a two-level system at the temperature T, 1/(1 + e^{-hf/kT}). */
export const spinDownChance = (f: number, T: number): number => 1 / (1 + Math.exp(-hfOverK(f) / T))
/** B_x = hbar Omega/mu_B, tesla, for the Rabi rate Omega = mu_B B_x/hbar (rad/s). */
export const rabiField = (Omega: number): number => (HBAR * Omega) / bohrMagneton()
/** The pi-pulse time pi/Omega, from Townsend's flip time 2 pi/omega_1 with omega_1 = 2 Omega (448 `dynamics.ts rabiFlipTime`). */
export const piTime = (Omega: number): number => rabiFlipTime(2 * Omega)

/** s_1 . s_2 = (XX + YY + ZZ)/4 on two spins. */
export function s1s2(): Mat {
  return mscale(madd(madd(pauliString('XX'), pauliString('YY')), pauliString('ZZ')), 0.25)
}
/** The eigenvalues of s_1 . s_2, ascending: -3/4 once and 1/4 three times. */
export const s1s2Eigen = (): number[] => eigh(s1s2()).values
/** The exchange Hamiltonian D - K/2 - 2 K s_1.s_2 (Eq. 15.12 with the constant of the page), as a matrix. */
export const exchangeH = (D: number, K: number): Mat => madd(mscale(identity(4), D - K / 2), mscale(s1s2(), -2 * K))
function expectation(H: Mat, psi: Vec): number {
  const Hpsi = apply(H, psi)
  return psi.reduce((s, x, i) => s + x.re * Hpsi[i].re + x.im * Hpsi[i].im, 0)
}
/** The energies of the spin singlet and of the triplet |00> under the exchange Hamiltonian: D + K and D - K. */
export function exchangeEnergies(D: number, K: number): { singlet: number; triplet: number } {
  const H = exchangeH(D, K)
  const s = Math.SQRT1_2
  const singlet: Vec = [c(0), c(s), c(-s), c(0)]
  const triplet: Vec = [c(1), c(0), c(0), c(0)]
  return { singlet: expectation(H, singlet), triplet: expectation(H, triplet) }
}
/** exp(i phi sigma_1.sigma_2/4): the exchange pulse of total angle phi = integral of 2K dt/hbar (Eq. 15.13). */
export const heisenbergEvolution = (phi: number): Mat => expmHermitian(mscale(s1s2(), 1), -phi)
const phaseScale = (M: Mat, angle: number): Mat => mscale(M, expi(angle))
/** The half pulse sqrt(SWAP) = exp(i pi sigma.sigma/8), which carries the phase e^{i pi/8} of the page. */
export const sqrtSwap = (): Mat => heisenbergEvolution(Math.PI / 2)
/** The gap between the full pulse (phi = pi) and e^{i pi/4} SWAP. */
export const swapPulseGap = (): number => maxDiff(heisenbergEvolution(Math.PI), phaseScale(SWAP2, Math.PI / 4))
/** The gap between sqrt(SWAP)^2 and e^{i pi/4} SWAP. */
export const sqrtSwapSquareGap = (): number => maxDiff(matmul(sqrtSwap(), sqrtSwap()), phaseScale(SWAP2, Math.PI / 4))
/** The chance that |01> is found as |10> after the half pulse. */
export const halfSwapChance = (): number => abs2(sqrtSwap()[2][1])
const zTurn = (angle: number): Mat => [
  [expi(angle), c(0)],
  [c(0), expi(-angle)],
]
/** Eq. 15.14's product e^{-3 i pi/4} e^{i pi Z1/4} e^{-i pi Z2/4} sqrt(SWAP) e^{i pi Z1/2} sqrt(SWAP), phase included. */
export function czProduct(): Mat {
  const S = sqrtSwap()
  const before = kronM(zTurn(Math.PI / 2), I2)
  const after = kronM(zTurn(Math.PI / 4), zTurn(-Math.PI / 4))
  return phaseScale(matmul(after, matmul(S, matmul(before, S))), (-3 * Math.PI) / 4)
}
/** The gap between Eq. 15.14's product and diag(1, 1, 1, -1) (exact with the page's own sqrt(SWAP) phase). */
export function sqrtSwapCzGap(): number {
  const CZ: Mat = Array.from({ length: 4 }, (_, i) => Array.from({ length: 4 }, (_, j) => (i === j ? c(i === 3 ? -1 : 1) : c(0))))
  return maxDiff(czProduct(), CZ)
}
const unitaryOp = (M: Mat, targets: number[], label: string) => ({ op: 'unitary' as const, matrix: M.map((row) => row.map((z): [number, number] => [z.re, z.im])), targets, label })
const rz = (q: number, theta: number) => ({ op: 'gate' as const, gate: 'Rz' as const, targets: [q], params: [theta] })
/** Eq. 15.14 as a circuit on |+>|+>: H columns, the half pulse, Rz for e^{i pi Z1/2}, the half pulse, Rz for e^{i pi Z1/4} and e^{-i pi Z2/4} (5 columns; the global phase e^{-3 i pi/4} is not drawn). */
export function czDotCircuit(): Circuit {
  const S = sqrtSwap()
  return {
    version: 1,
    qubits: 2,
    init: '00',
    wires: ['1', '2'],
    columns: [
      [
        { op: 'gate', gate: 'H', targets: [0] },
        { op: 'gate', gate: 'H', targets: [1] },
      ],
      [unitaryOp(S, [0, 1], 'ex')],
      [rz(0, -Math.PI)],
      [unitaryOp(S, [0, 1], 'ex')],
      [rz(0, -Math.PI / 2), rz(1, Math.PI / 2)],
    ],
  }
}
/** The gap between the drawn circuit (with the dropped global phase restored) and the product of Eq. 15.14, on the Hadamard-free part: max over |circuit unitary| entries after removing the first column's H. */
export function czCircuitGap(): number {
  const C0 = czDotCircuit()
  const full = circuitUnitary(C0)
  const hh = kronM(pauliH(), pauliH())
  const rest = matmul(full, hh) // undo the two H gates: the remaining product is U_after S U_before S
  return maxDiff(phaseScale(rest, (-3 * Math.PI) / 4), czProduct())
}
function pauliH(): Mat {
  const r = Math.SQRT1_2
  return [
    [c(r), c(r)],
    [c(r), c(-r)],
  ]
}
/** One wire from |0> with Rx(pi): the pi pulse of the spin qubit. */
export function piPulseCircuit(): Circuit {
  return { version: 1, qubits: 1, init: '0', wires: ['spin'], columns: [[{ op: 'gate', gate: 'Rx', targets: [0], params: [Math.PI] }]] }
}
/** Two wires from |01> with the exchange evolution exp(-i tau (|01><10| + h.c.)) as one box (the circuit-QED exchange; tau = pi/2 is the iSWAP type). */
export function iswapCircuit(tau: number): Circuit {
  return { version: 1, qubits: 2, init: '01', wires: ['1', '2'], columns: [[unitaryOp(exchangeEvolution(tau), [0, 1], 'iSW')]] }
}
/** Two wires from |01> with the exchange pulse exp(i phi sigma_1.sigma_2/4) as one box (phi = pi is SWAP up to a phase, phi = pi/2 the half pulse). */
export function exchangeCircuit(phi: number): Circuit {
  return { version: 1, qubits: 2, init: '01', wires: ['1', '2'], columns: [[unitaryOp(heisenbergEvolution(phi), [0, 1], 'ex')]] }
}
/** The box E1, the gap and the thermal energy for a dot modelled as an infinite box (L metres, effective mass ratio): in meV, meV and kelvin. */
export function dotBox(L: number, massRatio: number): { E1meV: number; gapMeV: number; gapK: number } {
  const m = massRatio * M_ELECTRON
  const E1 = boxEnergyEv(L, m, 1)
  const E2 = boxEnergyEv(L, m, 2)
  return { E1meV: E1 * 1e3, gapMeV: (E2 - E1) * 1e3, gapK: ((E2 - E1) * E_CHARGE) / K_BOLTZMANN }
}
/** k_B T in micro-electronvolt for T in kelvin. */
export const thermalMicroEv = (T: number): number => (K_BOLTZMANN * T * 1e6) / E_CHARGE
