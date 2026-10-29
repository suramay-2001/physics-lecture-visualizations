/**
 * Chapter Q25, part two: trapped ions (Bergou Ch. 13, §13.6-13.10, pp. 236-247). SI units for the trap numbers, hbar = 1 in the gate matrices.
 *
 *  - The Paul trap: the Mathieu equation z'' = 2 q cos(2 tau) z for the axial motion (tau = omega_rf t/2) is integrated by RK4 over one period pi, and the Floquet number beta follows from
 *    cos(pi beta) = tr(M)/2 (`mathieuBeta`); the stability edge is found by bisection on tr(M) = -2. `trapParams` gives q-tilde, the secular frequencies and the depth.
 *  - Two ions: the spacing from the force balance, the potential u(s) = s^2/4 + 1/2s, and the two mode frequencies from a finite-difference Hessian.
 *  - The motion: the Lamb-Dicke number, the exponential of i eta (a + a^dagger) on a truncated oscillator (`expmGeneral`), the sideband strengths and the cooling time.
 *  - The gates: Cirac-Zoller's three pulses on two ions and a truncated phonon register, and Molmer-Sorensen's force Hamiltonian, whose time evolution is exact in closed form (the
 *    commutator of H(t) at two times is a number, so the Magnus series stops at second order): U(t) = prod_s P_s e^{i Phi_s} D(alpha_s) over the eigenvalues s of S = sum sigma_y.
 *
 * Checked against the numpy/scipy twin (pipeline/q25_numpy.py -> __fixtures__/qc-q25.json: a Floquet monodromy by solve_ivp, a finite-difference Hessian, dense expm of an 81-level oscillator,
 * pulse unitaries by expm and the force Hamiltonian by DOP853). NOT in the entry closure: imported only by `Q25.values.ts`, the lazy `plot` kind and tests (qc/atoms.test.ts guards it).
 */
import { type C, c } from '../complex'
import { type Mat, type Vec, dagger, fromColumns, gramSchmidt, identity, madd, matmul, mscale, normalize } from '../linalg'
import { C_LIGHT, E_CHARGE, H_PLANCK, K_BOLTZMANN } from '../constants'
import { expmGeneral } from './blocheq'
import type { Circuit, UnitaryOp } from './circuit'
import { eigh, kronM, kronMAll } from './cmat'

const HBAR_ = H_PLANCK / (2 * Math.PI)
/** The vacuum permittivity, F/m (CODATA 2018). */
export const EPS0 = 8.8541878128e-12

/* ---------------------------------------------------------------------------------------------- */
/* The Paul trap (p. 238): the Mathieu equation                                                          */
/* ---------------------------------------------------------------------------------------------- */

/** The trace of the monodromy matrix of z'' = 2 q cos(2 tau) z over tau = 0 ... pi (RK4, `steps` steps). */
export function mathieuTrace(q: number, steps = 2000): number {
  const h = Math.PI / steps
  let y = [1, 0, 0, 1]
  const f = (tau: number, v: number[]): number[] => {
    const k = 2 * q * Math.cos(2 * tau)
    return [v[1], k * v[0], v[3], k * v[2]]
  }
  for (let i = 0; i < steps; i++) {
    const t = i * h
    const k1 = f(t, y)
    const k2 = f(t + h / 2, y.map((v, j) => v + (h / 2) * k1[j]))
    const k3 = f(t + h / 2, y.map((v, j) => v + (h / 2) * k2[j]))
    const k4 = f(t + h, y.map((v, j) => v + h * k3[j]))
    y = y.map((v, j) => v + (h / 6) * (k1[j] + 2 * k2[j] + 2 * k3[j] + k4[j]))
  }
  return y[0] + y[3]
}
/** The Floquet number beta in 0 ... 1: the motion is stable, with secular frequency beta omega_rf/2, while |tr M| < 2; beta is 1 from the edge on. */
export const mathieuBeta = (q: number): number => Math.acos(Math.max(-1, Math.min(1, mathieuTrace(q) / 2))) / Math.PI
/** The effective-potential value q/sqrt(2) that beta approaches at small q. */
export const mathieuBetaApprox = (q: number): number => q / Math.SQRT2
/** The edge of the first stability region of z'' = 2 q cos(2 tau) z (tr M = -2), found by bisection on [0.5, 1.5]: 0.908046. */
export function mathieuEdge(): number {
  let lo = 0.5
  let hi = 1.5
  for (let i = 0; i < 60; i++) {
    const mid = (lo + hi) / 2
    if (mathieuTrace(mid) + 2 > 0) lo = mid
    else hi = mid
  }
  return (lo + hi) / 2
}

export interface TrapInputs {
  /** ion mass, kg */
  massKg: number
  /** rf amplitude, volts */
  V0: number
  /** rf angular frequency, rad/s */
  omegaRf: number
  /** distance from the centre to the endcap, m */
  zc: number
}
/** Bergou's beryllium trap (p. 238): m = 1.5e-26 kg, V0 = 100 V, omega_rf/2pi = 10 MHz, z_c = 1 mm. */
export const BE_TRAP: TrapInputs = { massKg: 1.5e-26, V0: 100, omegaRf: 2 * Math.PI * 10e6, zc: 1e-3 }
export interface TrapNumbers {
  /** q-tilde_z = 2 e V0/(m zc^2 omega_rf^2) */
  q: number
  /** axial secular frequency q omega_rf/2^{3/2}, rad/s */
  omegaZ: number
  /** transverse secular frequency, half of it */
  omegaXY: number
  /** the micromotion amplitude over the macromotion amplitude, q/2 */
  zetaOverZ: number
  /** the effective well U/k_B = uCoef Z^2, K per m^2 */
  uCoefK: number
  /** the depth at z_c/10, K */
  depthK: number
}
export function trapParams(p: TrapInputs): TrapNumbers {
  const q = (2 * E_CHARGE * p.V0) / (p.massKg * p.zc ** 2 * p.omegaRf ** 2)
  const omegaZ = (q * p.omegaRf) / 2 ** 1.5
  const uCoefK = (0.5 * p.massKg * omegaZ ** 2) / K_BOLTZMANN
  return { q, omegaZ, omegaXY: omegaZ / 2, zetaOverZ: q / 2, uCoefK, depthK: uCoefK * (p.zc / 10) ** 2 }
}
/** The smallest rf frequency (rad/s) that keeps q at or below the edge: omega_rf sqrt(q/edge). */
export const smallestRf = (p: TrapInputs, edge: number): number => p.omegaRf * Math.sqrt(trapParams(p).q / edge)
/** The macromotion spread Z = sqrt(k_B T/(m omega_z^2)) at temperature T (half k_B T per direction), m, and the micromotion amplitude q Z/2. */
export const localisation = (T: number, p: TrapInputs): { Z: number; zeta: number } => {
  const t = trapParams(p)
  const Z = Math.sqrt((K_BOLTZMANN * T) / (p.massKg * t.omegaZ ** 2))
  return { Z, zeta: (t.q / 2) * Z }
}
/** The exact secular angular frequency beta omega_rf/2 at q, rad/s. */
export const secularExact = (q: number, omegaRf: number): number => (mathieuBeta(q) * omegaRf) / 2

/* ---------------------------------------------------------------------------------------------- */
/* Two ions (p. 239)                                                                                     */
/* ---------------------------------------------------------------------------------------------- */

/** Z_eq = (q^2/2 pi eps0 m omega_z^2)^{1/3}, m. */
export const twoIonSpacing = (massKg: number, omegaZ: number): number => (E_CHARGE ** 2 / (2 * Math.PI * EPS0 * massKg * omegaZ ** 2)) ** (1 / 3)
/** The energy of the pair in units of m omega_z^2 Z_eq^2 at separation s Z_eq: s^2/4 + 1/(2 s). */
export const twoIonPotential = (s: number): number => (s * s) / 4 + 1 / (2 * s)
/** The curvatures of the quadrupole potential x^2 + y^2 - 2 z^2 along x, y and z by central second differences: 2, 2, -4, which sum to 0 (Earnshaw: the Laplacian vanishes, so no rest point). */
export function quadrupoleCurvatures(h = 1e-3): [number, number, number] {
  const phi = (x: number, y: number, z: number): number => x * x + y * y - 2 * z * z
  const d2 = (f: (t: number) => number): number => (f(h) - 2 * f(0) + f(-h)) / (h * h)
  return [d2((t) => phi(t, 0, 0)), d2((t) => phi(0, t, 0)), d2((t) => phi(0, 0, t))]
}
/** The two normal-mode angular frequencies from a central-difference Hessian of U(z1, z2) = m omega^2 (z1^2 + z2^2)/2 + e^2/(4 pi eps0 |z2 - z1|) at z = -/+ Z_eq/2. */
export function twoIonModes(massKg: number, omegaZ: number): { com: number; stretch: number; ratio: number } {
  const Zeq = twoIonSpacing(massKg, omegaZ)
  const U = (z1: number, z2: number): number => 0.5 * massKg * omegaZ ** 2 * (z1 * z1 + z2 * z2) + E_CHARGE ** 2 / (4 * Math.PI * EPS0 * Math.abs(z2 - z1))
  const h = Zeq * 1e-4
  const z1 = -Zeq / 2
  const z2 = Zeq / 2
  const a = (U(z1 + h, z2) - 2 * U(z1, z2) + U(z1 - h, z2)) / (h * h)
  const d = (U(z1, z2 + h) - 2 * U(z1, z2) + U(z1, z2 - h)) / (h * h)
  const b = (U(z1 + h, z2 + h) - U(z1 + h, z2 - h) - U(z1 - h, z2 + h) + U(z1 - h, z2 - h)) / (4 * h * h)
  const mean = (a + d) / 2
  const disc = Math.hypot((a - d) / 2, b)
  const lo = Math.sqrt((mean - disc) / massKg)
  const hi = Math.sqrt((mean + disc) / massKg)
  return { com: lo, stretch: hi, ratio: hi / lo }
}

/* ---------------------------------------------------------------------------------------------- */
/* The motion and the light: Lamb-Dicke number, sidebands, cooling (pp. 240-243)                          */
/* ---------------------------------------------------------------------------------------------- */

/** z_0 = sqrt(hbar/2 m omega_z), m. */
export const zeroPoint = (massKg: number, omegaZ: number): number => Math.sqrt(HBAR_ / (2 * massKg * omegaZ))
/** eta_0 = k z_0 with k = 2 pi/lambda (cos theta = 1). */
export const lambDicke = (lambdaM: number, massKg: number, omegaZ: number): number => ((2 * Math.PI) / lambdaM) * zeroPoint(massKg, omegaZ)
/** The recoil energy over the oscillator quantum, (hbar k)^2/2m / hbar omega_z, which equals eta_0^2. */
export const recoilOverQuantum = (lambdaM: number, massKg: number, omegaZ: number): number => (HBAR_ * ((2 * Math.PI) / lambdaM) ** 2) / (2 * massKg * omegaZ)
/** The Lamb-Dicke number of a microwave of frequency nu (wavelength c/nu). */
export const lambDickeMicrowave = (nuHz: number, massKg: number, omegaZ: number): number => lambDicke(C_LIGHT / nuHz, massKg, omegaZ)

/** The annihilation operator on levels 0 ... nmax. */
export const annihilation = (nmax: number): Mat => Array.from({ length: nmax + 1 }, (_, i) => Array.from({ length: nmax + 1 }, (_, j) => (j === i + 1 ? c(Math.sqrt(j)) : c(0))))
const creation = (nmax: number): Mat => dagger(annihilation(nmax))
const kick = new Map<string, Mat>()
/** exp(i eta (a + a^dagger)) on levels 0 ... nmax (the operator e^{ikz} of a light kick). */
export function kickOperator(eta: number, nmax: number): Mat {
  const key = `${eta}:${nmax}`
  const hit = kick.get(key)
  if (hit) return hit
  const A = annihilation(nmax)
  const out = expmGeneral(mscale(madd(A, creation(nmax)), c(0, eta)))
  kick.set(key, out)
  return out
}
/** |<n+1| e^{i eta (a + a^dagger)} |n>| on an oscillator truncated at 80 levels. */
export const sidebandExact = (eta: number, n: number, nmax = 80): number => Math.hypot(kickOperator(eta, nmax)[n + 1][n].re, kickOperator(eta, nmax)[n + 1][n].im)
/** The carrier strength |<n|e^{i eta (a + a^dagger)}|n>|. */
export const carrierExact = (eta: number, n: number, nmax = 80): number => Math.hypot(kickOperator(eta, nmax)[n][n].re, kickOperator(eta, nmax)[n][n].im)
/** The first-order blue sideband strength eta sqrt(n+1) and the carrier e^{-eta^2/2} of the ground state. */
export const sidebandFirstOrder = (eta: number, n: number): number => eta * Math.sqrt(n + 1)
export const carrierGround = (eta: number): number => Math.exp(-(eta * eta) / 2)
/** The oscillator after a light kick from the ground state: the first column of e^{i eta (a + a^dagger)}, levels 0 ... nmax (amplitudes e^{-eta^2/2}(i eta)^n/sqrt(n!)). */
export const recoilState = (eta: number, nmax: number): Vec => kickOperator(eta, nmax).map((row) => row[0])
/**
 * Unit 25.5: two wires for the oscillator levels n = 0 ... 3 (binary), one box whose first column is the (renormalised) light-kick state of `recoilState(eta, 3)`, completed to a unitary by
 * Gram-Schmidt: the bars after the box are the amplitudes e^{-eta^2/2}(i eta)^n/sqrt(n!) up to the tiny weight beyond n = 3.
 */
export function kickCircuit(eta: number): Circuit {
  const xi = normalize(recoilState(eta, 3))
  const unit = (k: number): Vec => Array.from({ length: 4 }, (_, i) => (i === k ? c(1) : c(0)))
  const U = fromColumns(gramSchmidt([xi, unit(1), unit(2), unit(3)]).basis)
  return { version: 1, qubits: 2, init: '00', wires: ['n1', 'n0'], columns: [[unitaryOp(U, [0, 1], 'kick')]] }
}
/** The largest entry difference over the first 10 levels between e^{A+B} and e^{-eta^2/2} e^A e^B with A = i eta a^dagger, B = i eta a (the Baker-Campbell-Hausdorff identity). */
export function bchGap(eta: number, nmax = 40): number {
  const A = mscale(creation(nmax), c(0, eta))
  const B = mscale(annihilation(nmax), c(0, eta))
  const lhs = expmGeneral(madd(A, B))
  const rhs = mscale(matmul(expmGeneral(A), expmGeneral(B)), Math.exp(-(eta * eta) / 2))
  let m = 0
  for (let i = 0; i < 10; i++) for (let j = 0; j < 10; j++) m = Math.max(m, Math.hypot(lhs[i][j].re - rhs[i][j].re, lhs[i][j].im - rhs[i][j].im))
  return m
}
/** The time (units of 1/eta Omega) to cool from phonon number n by red pi pulses at the time each level needs: pi times the sum of k^{-1/2}. */
export const coolTime = (n: number): number => {
  let s = 0
  for (let k = 1; k <= n; k++) s += 1 / Math.sqrt(k)
  return Math.PI * s
}
/** The time if every pulse took as long as the first, n pi. */
export const coolTimeNaive = (n: number): number => n * Math.PI

/* ---------------------------------------------------------------------------------------------- */
/* Pulses on ions and phonons                                                                           */
/* ---------------------------------------------------------------------------------------------- */

const SP: Mat = [
  [c(0), c(0)],
  [c(1), c(0)],
]
const SM: Mat = dagger(SP)
const I2m: Mat = identity(2)
export type PulseKind = 'carrier' | 'red' | 'blue'
/** The generator of a pulse on one ion with the phonon register (levels 0 ... nmax): carrier sigma^+ + sigma^-, red sigma^+ a + sigma^- a^dagger, blue sigma^+ a^dagger + sigma^- a (ion |g> = 0, |e> = 1). */
function generator(kind: PulseKind, nmax: number, extra: (ion: Mat, ph: Mat) => Mat): Mat {
  const a = annihilation(nmax)
  const ad = creation(nmax)
  const im = identity(nmax + 1)
  if (kind === 'carrier') return madd(extra(SP, im), extra(SM, im))
  if (kind === 'red') return madd(extra(SP, a), extra(SM, ad))
  return madd(extra(SP, ad), extra(SM, a))
}
/** exp(-i (theta/2) G): the pulse of "area" theta (pi = a pi pulse of the n = 1 red or n = 0 blue sideband, or the carrier) on one ion and a phonon register: (2 (nmax+1)) square. */
export const sidebandU = (kind: PulseKind, theta: number, nmax: number): Mat => expmGeneral(mscale(generator(kind, nmax, (ion, ph) => kronM(ion, ph)), c(0, -theta / 2)))
/** The same pulse on ion 1 or ion 2 of a pair, with the phonon register: 4 (nmax+1) square, order ion 1, ion 2, phonon. */
export const pairPulseU = (ion: 1 | 2, kind: PulseKind, theta: number, nmax: number): Mat =>
  expmGeneral(mscale(generator(kind, nmax, (op, ph) => (ion === 1 ? kronMAll([op, I2m, ph]) : kronMAll([I2m, op, ph]))), c(0, -theta / 2)))

const toPairs = (M: Mat): [number, number][][] => M.map((row) => row.map((z): [number, number] => [z.re, z.im]))
const unitaryOp = (M: Mat, targets: number[], label: string): UnitaryOp => ({ op: 'unitary', matrix: toPairs(M), targets, label })

/** Unit 25.5: one wire for the ion (g = 0, e = 1) and two for the phonon number n = 0 ... 3 (binary), from |g, 1> = 001: red pi, blue pi, carrier pi. */
export function sidebandCircuit(): Circuit {
  return {
    version: 1,
    qubits: 3,
    init: '001',
    wires: ['ion', 'n1', 'n0'],
    columns: [[unitaryOp(sidebandU('red', Math.PI, 3), [0, 1, 2], 'red π')], [unitaryOp(sidebandU('blue', Math.PI, 3), [0, 1, 2], 'blue π')], [{ op: 'gate', gate: 'Rx', targets: [0], params: [Math.PI] }]],
  }
}
/** Unit 25.6: ion 1, ion 2 and the phonon (n = 0, 1) from |g, g; 0> = 000: blue pi/2 on ion 1, carrier pi on ion 2, blue pi on ion 2 (the Cirac-Zoller Bell sequence). */
export function czCircuit(): Circuit {
  return {
    version: 1,
    qubits: 3,
    init: '000',
    wires: ['ion 1', 'ion 2', 'n'],
    columns: [[unitaryOp(sidebandU('blue', Math.PI / 2, 1), [0, 2], 'blue ½π')], [{ op: 'gate', gate: 'Rx', targets: [1], params: [Math.PI] }], [unitaryOp(sidebandU('blue', Math.PI, 1), [1, 2], 'blue π')]],
  }
}

/** The chance the red pi pulse (blue pi pulse) moves an ion that starts in |g, 0> (|e, 0>): zero, since there is no level below. */
export function pulseFromGround(kind: 'red' | 'blue'): number {
  const U = sidebandU(kind, Math.PI, 3)
  const start = kind === 'red' ? 0 : 4 // |g,0> = index 0, |e,0> = index (1)(4) + 0
  return 1 - (U[start][start].re ** 2 + U[start][start].im ** 2)
}

/** The state of two ions and a phonon register after the three Cirac-Zoller pulses from |g, g; n0>; index (2 i1 + i2)(nmax+1) + n. */
export function czRun(n0: number, nmax: number): Vec {
  const dim = 4 * (nmax + 1)
  let psi: Vec = Array.from({ length: dim }, (_, i) => (i === n0 ? c(1) : c(0)))
  for (const [ion, kind, th] of [[1, 'blue', Math.PI / 2], [2, 'carrier', Math.PI], [2, 'blue', Math.PI]] as const) {
    const U = pairPulseU(ion, kind, th, nmax)
    psi = U.map((row) => row.reduce((s, z, j): C => c(s.re + z.re * psi[j].re - z.im * psi[j].im, s.im + z.re * psi[j].im + z.im * psi[j].re), c(0)))
  }
  return psi
}
/** The best chance, over the relative phase, of the Bell pair (|ge> + e^{i alpha}|eg>)/sqrt(2) with any phonon number: S/2 + |sum_n conj(x_n) y_n|, S = sum |x_n|^2 + |y_n|^2. */
export function bellChance(psi: Vec, nmax: number): number {
  let S = 0
  let re = 0
  let im = 0
  for (let n = 0; n <= nmax; n++) {
    const x = psi[1 * (nmax + 1) + n] // |g e; n>
    const y = psi[2 * (nmax + 1) + n] // |e g; n>
    S += x.re ** 2 + x.im ** 2 + y.re ** 2 + y.im ** 2
    re += x.re * y.re + x.im * y.im
    im += x.re * y.im - x.im * y.re
  }
  return S / 2 + Math.hypot(re, im)
}
/** The weight of the phonon vacuum after the sequence. */
export const vacuumWeight = (psi: Vec, nmax: number): number => {
  let w = 0
  for (let s = 0; s < 4; s++) w += psi[s * (nmax + 1)].re ** 2 + psi[s * (nmax + 1)].im ** 2
  return w
}
/** The Cirac-Zoller Bell chance from the phonon number n0 (oscillator truncated at nmax). */
export const czBell = (n0: number, nmax: number): number => bellChance(czRun(n0, nmax), nmax)

/* ---------------------------------------------------------------------------------------------- */
/* Molmer-Sorensen (pp. 244-246): the force Hamiltonian, exact                                          */
/* ---------------------------------------------------------------------------------------------- */

const SIGMA_Y: Mat = [
  [c(0), c(0, -1)],
  [c(0, 1), c(0)],
]
/** S = sum_j sigma_y^(j) on N ions. */
export function spinS(N: number): Mat {
  let S: Mat = Array.from({ length: 2 ** N }, () => Array.from({ length: 2 ** N }, () => c(0)))
  for (let j = 0; j < N; j++) S = madd(S, kronMAll(Array.from({ length: N }, (_, k) => (k === j ? SIGMA_Y : I2m))))
  return S
}
/**
 * H(t) = g S (a e^{-i Delta t} + a^dagger e^{i Delta t}) with g = eta Omega/2 acts on N ions and an oscillator truncated at nmax. Magnus: for S = s, U_s = e^{i Phi} D(alpha) with
 * Phi = g^2 s^2 (t/Delta - sin(Delta t)/Delta^2) and alpha = -i conj(Lambda), Lambda = s g (1 - e^{-i Delta t})/(i Delta). Returns the final state from |g ... g; n0>, spin index first.
 */
export function msRun(o: { n0: number; etaOmega: number; delta: number; N: number; nmax: number; t: number }): Vec {
  const { n0, etaOmega, delta, N, nmax, t } = o
  const g = etaOmega / 2
  const dimS = 2 ** N
  const { values, vectors } = eigh(spinS(N))
  const out: Vec = Array.from({ length: dimS * (nmax + 1) }, () => c(0))
  for (let k = 0; k < dimS; k++) {
    const s = values[k]
    const v = vectors[k]
    // <v_k | g...g> = conj(v_k[0])
    const amp0 = c(v[0].re, -v[0].im)
    const phi = g * g * s * s * (t / delta - Math.sin(delta * t) / (delta * delta))
    // Lambda = s g (1 - e^{-i delta t})/(i delta): (1 - cos + i sin)/(i delta) = (sin - i (1 - cos))/delta ... computed below
    const lr = (s * g * Math.sin(delta * t)) / delta
    const li = (-s * g * (1 - Math.cos(delta * t))) / delta
    // alpha = -i conj(Lambda) = -i (lr - i li) = -li - i lr
    const alpha = c(-li, -lr)
    const A = annihilation(nmax)
    const gen = madd(mscale(creation(nmax), alpha), mscale(A, c(-alpha.re, alpha.im)))
    const D = expmGeneral(gen)
    const ph = c(Math.cos(phi), Math.sin(phi))
    for (let n = 0; n <= nmax; n++) {
      const d = D[n][n0]
      const w = c(ph.re * d.re - ph.im * d.im, ph.re * d.im + ph.im * d.re)
      const wa = c(w.re * amp0.re - w.im * amp0.im, w.re * amp0.im + w.im * amp0.re)
      for (let i = 0; i < dimS; i++) {
        // |v_k> component i times wa
        const e = c(v[i].re * wa.re - v[i].im * wa.im, v[i].re * wa.im + v[i].im * wa.re)
        out[i * (nmax + 1) + n] = c(out[i * (nmax + 1) + n].re + e.re, out[i * (nmax + 1) + n].im + e.im)
      }
    }
  }
  return out
}
/** The best GHZ chance, over the relative phase, of (|g..g> + e^{i alpha}|e..e>)/sqrt(2) with any phonon number: S/2 + |sum_n conj(a_n) b_n|. */
export function ghzChance(psi: Vec, N: number, nmax: number): number {
  const last = 2 ** N - 1
  let S = 0
  let re = 0
  let im = 0
  for (let n = 0; n <= nmax; n++) {
    const a = psi[n]
    const b = psi[last * (nmax + 1) + n]
    S += a.re ** 2 + a.im ** 2 + b.re ** 2 + b.im ** 2
    re += a.re * b.re + a.im * b.im
    im += a.re * b.im - a.im * b.re
  }
  return S / 2 + Math.hypot(re, im)
}
/** The Molmer-Sorensen GHZ chance from phonon number n0. */
export const msBell = (o: { n0: number; etaOmega: number; delta: number; N: number; nmax: number; t: number }): number => ghzChance(msRun(o), o.N, o.nmax)
/** The effective two-ion rate (eta Omega)^2/Delta. */
export const msOmegaTilde = (etaOmega: number, delta: number): number => (etaOmega * etaOmega) / delta
/** The number of loops K = ((Delta/eta Omega)^2)/4 that a gate of area pi/2 takes (a whole number only for special eta Omega). */
export const msLoops = (etaOmega: number, delta: number): number => (delta / etaOmega) ** 2 / 4
/** The time 2 pi K/Delta of K loops. */
export const msTime = (K: number, delta: number): number => (2 * Math.PI * K) / delta
/** The time pi/(2 Omega-tilde) the book gives (it may stop in the middle of a loop). */
export const msBookTime = (etaOmega: number, delta: number): number => Math.PI / (2 * msOmegaTilde(etaOmega, delta))

/** The state exp(-i theta S^2)|g ... g> of N ions (the effective Hamiltonian is proportional to S^2): spin amplitudes only. */
export function ghzState(N: number, theta: number): Vec {
  const { values, vectors } = eigh(spinS(N))
  const out: Vec = Array.from({ length: 2 ** N }, () => c(0))
  values.forEach((s, k) => {
    const v = vectors[k]
    const amp0 = c(v[0].re, -v[0].im)
    const ph = c(Math.cos(theta * s * s), -Math.sin(theta * s * s))
    const w = c(ph.re * amp0.re - ph.im * amp0.im, ph.re * amp0.im + ph.im * amp0.re)
    for (let i = 0; i < out.length; i++) out[i] = c(out[i].re + v[i].re * w.re - v[i].im * w.im, out[i].im + v[i].re * w.im + v[i].im * w.re)
  })
  return out
}
const ghzFid = (N: number, theta: number): number => ghzChance(ghzState(N, theta), N, 0)
/** The best GHZ fidelity over the angle theta in 0 ... pi (a 2001-point scan, then golden section around the first best point) and the angle. */
export function ghzScan(N: number): { fidelity: number; theta: number } {
  const n = 2000
  const vals = Array.from({ length: n + 1 }, (_, i) => ghzFid(N, (Math.PI * i) / n))
  const top = Math.max(...vals)
  const bi = vals.findIndex((v) => v > top - 1e-12)
  let lo = (Math.PI * Math.max(bi - 1, 0)) / n
  let hi = (Math.PI * Math.min(bi + 1, n)) / n
  const g = (Math.sqrt(5) - 1) / 2
  let x1 = hi - g * (hi - lo)
  let x2 = lo + g * (hi - lo)
  let f1 = ghzFid(N, x1)
  let f2 = ghzFid(N, x2)
  for (let i = 0; i < 60; i++) {
    if (f1 > f2) {
      hi = x2
      x2 = x1
      f2 = f1
      x1 = hi - g * (hi - lo)
      f1 = ghzFid(N, x1)
    } else {
      lo = x1
      x1 = x2
      f1 = f2
      x2 = lo + g * (hi - lo)
      f2 = ghzFid(N, x2)
    }
  }
  const theta = (lo + hi) / 2
  return { fidelity: Math.max(ghzFid(N, theta), top), theta }
}
/** Unit 25.6: N = 4 ions from |gggg>, one box exp(-i theta S^2) at theta = pi/8 (at most 4 wires in a unitary box). */
export function msCircuit(N: number, theta: number): Circuit {
  const { values, vectors } = eigh(spinS(N))
  let U: Mat = Array.from({ length: 2 ** N }, () => Array.from({ length: 2 ** N }, () => c(0)))
  values.forEach((s, k) => {
    const ph = c(Math.cos(theta * s * s), -Math.sin(theta * s * s))
    const v = vectors[k]
    for (let i = 0; i < 2 ** N; i++)
      for (let j = 0; j < 2 ** N; j++) {
        // ph * v_i conj(v_j)
        const vv = c(v[i].re * v[j].re + v[i].im * v[j].im, v[i].im * v[j].re - v[i].re * v[j].im)
        U[i][j] = c(U[i][j].re + ph.re * vv.re - ph.im * vv.im, U[i][j].im + ph.re * vv.im + ph.im * vv.re)
      }
  })
  return { version: 1, qubits: N, init: '0'.repeat(N), wires: Array.from({ length: N }, (_, i) => `ion ${i + 1}`), columns: [[unitaryOp(U, Array.from({ length: N }, (_, i) => i), 'MS')]] }
}
