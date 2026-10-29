/**
 * Chapter Q25, part one: neutral atoms (Bergou Ch. 13, §13.1-13.5, pp. 221-236). SI units where a unit is shown, hbar = 1 inside the gate matrices.
 *
 * Laser cooling REUSES the Optics Lab engine (physics/optics/cooling.ts, judge's ruling Z4): the recoil speed, the largest force, the recoil and Doppler temperatures and the
 * stopping row are `recoilVelocity`, `maxAcceleration`, `recoilTemperature`, `dopplerTemperature` and `slowRow`; this file only supplies the four atoms of Bergou's Table 13.1 as
 * STATED model inputs (the wavelength and linewidth the book prints) and the arithmetic that chapter adds (heating per photon, thermal photons, loading, readout, thermal dephasing,
 * the Raman loss and the Rydberg gate). Every function is checked against the numpy/scipy twin (pipeline/q25_numpy.py -> __fixtures__/qc-q25.json) and against a closed form.
 *
 * NOT in the entry closure: imported only by `Q25.values.ts`, the lazy `plot` kind and tests (qc/atoms.test.ts guards it).
 */
import { type C, c } from '../complex'
import { type Mat, type Vec, matmul, mscale } from '../linalg'
import { C_LIGHT, H_PLANCK, K_BOLTZMANN, U_ATOMIC } from '../constants'
import { type AtomLine, G_STANDARD, dopplerTemperature, maxAcceleration, recoilTemperature, recoilVelocity, slowRow } from '../optics/cooling'
import { expmGeneral } from './blocheq'
import { eigh, kronM } from './cmat'
import { Rx, Ry, Rz } from './gates'

/* ---------------------------------------------------------------------------------------------- */
/* Table 13.1 (the atoms are stated inputs; the book prints wavelength and gamma/2pi)                  */
/* ---------------------------------------------------------------------------------------------- */

const line = (name: string, lambdaNm: number, gammaOver2PiMHz: number, massU: number): AtomLine => ({ name, lambdaM: lambdaNm * 1e-9, gamma: 2 * Math.PI * gammaOver2PiMHz * 1e6, massKg: massU * U_ATOMIC })

/** The four columns of Table 13.1: rubidium-87 (780.2 nm), caesium-133 (852.3 nm), strontium (standard atomic weight 87.62 u) at 461 nm and at 689 nm (wavelength nm, gamma/2pi MHz as printed). */
export const TABLE_13_1 = {
  Rb: line('Rb-87', 780.2, 6.07, 86.909180527),
  Cs: line('Cs-133', 852.3, 5.23, 132.905451961),
  Sr461: line('Sr 461 nm', 461, 30.5, 87.62),
  Sr689: line('Sr 689 nm', 689, 0.0074, 87.62),
} as const
export type TableColumn = keyof typeof TABLE_13_1
export const TABLE_COLUMNS: readonly TableColumn[] = ['Rb', 'Cs', 'Sr461', 'Sr689']
/** The Doppler temperatures the table prints, in microkelvin (the last one is the entry Chapter Q25's Correction questions). */
export const PRINTED_T_DOPPLER_UK: Readonly<Record<TableColumn, number>> = { Rb: 146, Cs: 125, Sr461: 720, Sr689: 1.02 }

/** sqrt(3 k_B T / m), m/s. */
export const thermalSpeed = (T: number, massKg: number): number => Math.sqrt((3 * K_BOLTZMANN * T) / massKg)
/** The speed one absorbed photon gives the atom, m/s (the Optics Lab's `recoilVelocity`). */
export const recoilSpeed = (a: AtomLine): number => recoilVelocity(a)
/** The largest scattering rate gamma/2, per second. */
export const maxScatterRate = (a: AtomLine): number => a.gamma / 2
/** The largest push in units of the acceleration of gravity (the Optics Lab's `maxAcceleration`). */
export const forceOverGravity = (a: AtomLine): number => maxAcceleration(a) / G_STANDARD
/** Photons to stop an atom of speed v, and the time and length at the largest rate (the Optics Lab's `slowRow` at the oven temperature). */
export const stopPhotons = (v: number, a: AtomLine): number => v / recoilVelocity(a)
export const stopRow = (a: AtomLine, ovenK: number): { speed: number; photons: number; time: number; length: number } => {
  const row = slowRow(a, ovenK)
  return { speed: row.vPeak, photons: row.vPeak / recoilVelocity(a), time: row.stopTime, length: row.stopLength }
}
/** Heating per scattered photon, K: a third of the recoil temperature (Eq. 13.5, random emission in three directions). */
export const heatPerPhoton = (a: AtomLine): number => recoilTemperature(a) / 3
/** The temperature after n scattered photons, K (Eq. 13.5). */
export const heatAfter = (a: AtomLine, n: number): number => n * heatPerPhoton(a)
/** The recoil temperature, K (the Optics Lab's, equal to 2 U_r/k_B, Bergou's T_r). */
export const recoilT = (a: AtomLine): number => recoilTemperature(a)
/** The Doppler limit hbar gamma/2k_B, K (the Optics Lab's). */
export const dopplerT = (a: AtomLine): number => dopplerTemperature(a)
/** The thermal photon number 1/(e^{h nu/kT} - 1) of a mode, and the exponent h nu/kT. */
export const thermalPhotons = (nu: number, T: number): number => 1 / Math.expm1((H_PLANCK * nu) / (K_BOLTZMANN * T))
export const photonExponent = (nu: number, T: number): number => (H_PLANCK * nu) / (K_BOLTZMANN * T)
/** The frequency of a light of wavelength lambda, Hz. */
export const lightFrequency = (lambdaM: number): number => C_LIGHT / lambdaM

/* ---------------------------------------------------------------------------------------------- */
/* Poisson and binomial chances (Chapter F5 owns the laws; here they are the loading and the readout)    */
/* ---------------------------------------------------------------------------------------------- */

const LOGF: number[] = [0]
const logFactorial = (n: number): number => {
  for (let k = LOGF.length; k <= n; k++) LOGF.push(LOGF[k - 1] + Math.log(k))
  return LOGF[n]
}
/** P(N = n) for a Poisson law of mean `mean`. */
export const poissonPmf = (n: number, mean: number): number => (mean === 0 ? (n === 0 ? 1 : 0) : Math.exp(-mean + n * Math.log(mean) - logFactorial(n)))
/** P(N <= n). */
export const poissonCdf = (n: number, mean: number): number => {
  let s = 0
  for (let k = 0; k <= n; k++) s += poissonPmf(k, mean)
  return s
}
/** P(N > n), summed from the tail so that a small chance keeps its digits. */
export const poissonSf = (n: number, mean: number): number => {
  let s = 0
  for (let k = n + 1; k <= n + 400 + 10 * mean; k++) s += poissonPmf(k, mean)
  return s
}
/** The chance that a site holds an odd number of atoms when the loading is Poisson(mu) (collisions remove atoms in pairs): the series over odd n. */
export const parityLoad = (mu: number): number => {
  let s = 0
  for (let n = 1; n <= 200; n += 2) s += poissonPmf(n, mu)
  return s
}
/** P(X >= k) for X ~ Binomial(n, p). */
export const binomialTail = (n: number, p: number, k: number): number => {
  let s = 0
  for (let j = k; j <= n; j++) s += Math.exp(logFactorial(n) - logFactorial(j) - logFactorial(n - j) + j * Math.log(p) + (n - j) * Math.log(1 - p))
  return s
}
/** The smallest number of sites N (each full with chance p) that gives at least k atoms with confidence conf. */
export const sitesFor = (k: number, conf: number, p = 0.5): number => {
  let N = k
  while (binomialTail(N, p, k) < conf) N++
  return N
}

/* ---------------------------------------------------------------------------------------------- */
/* Fluorescence readout (Eq. 13.6 and the threshold error, pp. 228-229)                                  */
/* ---------------------------------------------------------------------------------------------- */

/** The error of a cutoff nc: a dark atom read as bright (counts >= nc) with weight c0, a bright atom read as dark (counts < nc) with weight c1. */
export const readoutError = (nc: number, mDark: number, mBright: number, c0 = 0.5, c1 = 0.5): number => c0 * poissonSf(nc - 1, mDark) + c1 * poissonCdf(nc - 1, mBright)
/** The best cutoff 1 ... 60 and its error. */
export function bestCutoff(mDark: number, mBright: number, c0 = 0.5, c1 = 0.5): { nc: number; error: number } {
  let best = { nc: 1, error: Infinity }
  for (let nc = 1; nc <= 60; nc++) {
    const e = readoutError(nc, mDark, mBright, c0, c1)
    if (e < best.error) best = { nc, error: e }
  }
  return best
}
/** The first scale t (in steps of 0.01 from 0.1) at which both means scaled by t give a best error below `target`. */
export function scaleFor(target: number, mDark: number, mBright: number, c0 = 0.5, c1 = 0.5): { scale: number; nc: number } {
  for (let k = 10; k < 1000; k++) {
    const t = k / 100
    const b = bestCutoff(mDark * t, mBright * t, c0, c1)
    if (b.error < target) return { scale: t, nc: b.nc }
  }
  throw new Error('scaleFor: no scale below 10 reaches the target')
}
/** Gamma(n, x)/(n-1)! (the upper incomplete gamma ratio) by composite five-point Gauss-Legendre on [x, x + 80]: the book's form of the Poisson cumulative sum. */
export function upperGammaRatio(n: number, x: number): number {
  const f = (t: number): number => Math.exp((n - 1) * Math.log(t) - t - logFactorial(n - 1))
  const GL_X = [0.9061798459386640, 0.5384693101056831, 0]
  const GL_W = [0.2369268850561891, 0.4786286704993665, 0.5688888888888889]
  const panels = 400
  const h = 80 / panels
  let total = 0
  for (let p = 0; p < panels; p++) {
    const mid = x + (p + 0.5) * h
    const half = h / 2
    total += GL_W[2] * half * f(mid) + GL_W[0] * half * (f(mid - half * GL_X[0]) + f(mid + half * GL_X[0])) + GL_W[1] * half * (f(mid - half * GL_X[1]) + f(mid + half * GL_X[1]))
  }
  return total
}
/** The identity gap |Gamma(nc, m)/(nc-1)! - P(N <= nc-1)| for a Poisson law of mean m. */
export const gammaIdentityGap = (nc: number, mean: number): number => Math.abs(upperGammaRatio(nc, mean) - poissonCdf(nc - 1, mean))

/* ---------------------------------------------------------------------------------------------- */
/* Motion dephases the qubit (Eqs. 13.9-13.10, Fig. 13.5)                                                  */
/* ---------------------------------------------------------------------------------------------- */

const HBAR_ = H_PLANCK / (2 * Math.PI)
/** T_0 = 2 hbar/(eta k_B T), s, for the light-shift fraction eta (the book's eta-bar). */
export const thermalT0 = (T: number, eta: number): number => (2 * HBAR_) / (eta * K_BOLTZMANN * T)
/** (1 + (t/T0)^2)^{-3/2}: the envelope of three independent exponentially spread shifts. */
export const semiEnvelope = (t: number, T0: number): number => (1 + (t / T0) ** 2) ** -1.5
/** The 1/e time of the semiclassical envelope, by bisection on the envelope itself (a route independent of the closed form). */
export function t2starSemi(T: number, eta: number): number {
  const T0 = thermalT0(T, eta)
  let lo = 0
  let hi = 10 * T0
  for (let i = 0; i < 200; i++) {
    const mid = (lo + hi) / 2
    if (semiEnvelope(mid, T0) > Math.exp(-1)) lo = mid
    else hi = mid
  }
  return (lo + hi) / 2
}
/** The closed form of the 1/e time over T0, sqrt(e^{2/3} - 1), and the coefficient 2 sqrt(e^{2/3} - 1) of hbar/(eta k_B T). */
export const t2starOverT0 = (): number => Math.sqrt(Math.exp(2 / 3) - 1)
export const t2starCoeff = (): number => 2 * t2starOverT0()
/** The exact thermal product |prod_j (1 - x_j)/(1 - x_j e^{i phi_j})|, x_j = e^{-hbar w_j/kT}, phi_j = eta w_j t/2, over the trap frequencies `omegas` (rad/s). */
export function quantumEnvelope(t: number, T: number, eta: number, omegas: readonly number[]): number {
  let re = 1
  let im = 0
  for (const w of omegas) {
    const x = Math.exp(-(HBAR_ * w) / (K_BOLTZMANN * T))
    const ph = (eta * w * t) / 2
    // (1 - x) / (1 - x e^{i ph})
    const dr = 1 - x * Math.cos(ph)
    const di = -x * Math.sin(ph)
    const den = dr * dr + di * di
    const nr = ((1 - x) * dr) / den
    const ni = (-(1 - x) * di) / den
    const r2 = re * nr - im * ni
    im = re * ni + im * nr
    re = r2
  }
  return Math.hypot(re, im)
}
/** The 1/e time of the exact thermal envelope (bisection; the envelope falls monotonically up to the first revival). */
export function t2starQuantum(T: number, eta: number, omegas: readonly number[]): number {
  let lo = 0
  let hi = 4 * t2starSemi(T, eta)
  for (let i = 0; i < 200; i++) {
    const mid = (lo + hi) / 2
    if (quantumEnvelope(mid, T, eta, omegas) > Math.exp(-1)) lo = mid
    else hi = mid
  }
  return (lo + hi) / 2
}

/* ---------------------------------------------------------------------------------------------- */
/* Site-selective rotations (p. 233): the sandwich of two global turns around a local z turn              */
/* ---------------------------------------------------------------------------------------------- */

const maxAbsDiff = (A: Mat, B: Mat): number => Math.max(...A.flatMap((row, i) => row.map((z, j) => Math.hypot(z.re - B[i][j].re, z.im - B[i][j].im))))
/** R_y(pi/2) R_z(theta) R_y(-pi/2), which is R_x(theta). */
export const sandwichX = (theta: number): Mat => matmul(matmul(Ry(Math.PI / 2), Rz(theta)), Ry(-Math.PI / 2))
/** R_x(-pi/2) R_z(theta) R_x(pi/2), which is R_y(theta). */
export const sandwichY = (theta: number): Mat => matmul(matmul(Rx(-Math.PI / 2), Rz(theta)), Rx(Math.PI / 2))
export const sandwichGapX = (theta: number): number => maxAbsDiff(sandwichX(theta), Rx(theta))
export const sandwichGapY = (theta: number): number => maxAbsDiff(sandwichY(theta), Ry(theta))

/* ---------------------------------------------------------------------------------------------- */
/* The Raman loss (p. 233): a three-level lambda atom with a decaying intermediate state                  */
/* ---------------------------------------------------------------------------------------------- */

const lambdaH = (Delta: number, gamma: number): Mat => {
  const H: Mat = [
    [c(0), c(0), c(0.5)],
    [c(0), c(0), c(0.5)],
    [c(0.5), c(0.5), c(Delta, -gamma / 2)],
  ]
  return H
}
const propagate = (H: Mat, t: number): Mat => expmGeneral(mscale(H, c(0, -t)))
const col0 = (U: Mat): Vec => U.map((row) => row[0])
const pop1 = (Delta: number, t: number): number => {
  const psi = col0(propagate(lambdaH(Delta, 0), t))
  return psi[1].re ** 2 + psi[1].im ** 2
}
/**
 * The pi-pulse time of the Raman transition without decay (Omega_1 = Omega_2 = 1): the time at which the bright state (|0> + |1>)/sqrt(2) has gained a phase pi against the dark state
 * (|0> - |1>)/sqrt(2). The bright state couples to |2> with Omega_B = sqrt(2) and its amplitude is e^{-i Delta t/2}[cos x + i (Delta/W) sin x], x = W t/2, W = sqrt(Delta^2 + 2); the net phase
 * theta(x) - (Delta/W) x (theta the unwrapped arctangent) never decreases, so a bisection finds it. `peak` is the chance of |1> at that time, from the matrix exponential.
 */
export function ramanPiPulse(Delta: number): { time: number; peak: number } {
  const W = Math.sqrt(Delta * Delta + 2)
  const r = Delta / W
  const net = (x: number): number => {
    const k = Math.floor((x + Math.PI / 2) / Math.PI)
    return Math.PI * k + Math.atan(r * Math.tan(x - Math.PI * k)) - r * x
  }
  let lo = 0
  let hi = (Math.PI * 1.2) / Math.abs(1 - r) + 10
  for (let i = 0; i < 200; i++) {
    const mid = (lo + hi) / 2
    if (net(mid) < Math.PI) lo = mid
    else hi = mid
  }
  const time = (2 * (lo + hi)) / (2 * W)
  return { time, peak: pop1(Delta, time) }
}
/** The chance that the atom has left the three levels during the pi pulse: 1 - |psi|^2 with the decay gamma of the intermediate state (gamma in units of Omega_1 = 1). */
export function ramanLoss(Delta: number, gamma: number): { loss: number; time: number } {
  const { time } = ramanPiPulse(Delta)
  const psi = col0(propagate(lambdaH(Delta, gamma), time))
  return { loss: 1 - psi.reduce((s, z) => s + z.re * z.re + z.im * z.im, 0), time }
}
/** The estimate (pi/2) gamma/|Delta| for the loss of one pi pulse. */
export const ramanLossEstimate = (Delta: number, gamma: number): number => ((Math.PI / 2) * gamma) / Math.abs(Delta)

/* ---------------------------------------------------------------------------------------------- */
/* Rydberg interaction and the pi - 2 pi - pi gate (pp. 233-236, Fig. 13.7)                                */
/* ---------------------------------------------------------------------------------------------- */

/** U_vdW grows as n^11 (the dipole as n^2 gives n^8, the level spacing as n^-3 divides) and the blockade radius as n^{11/6}. */
export const vdwScale = (n1: number, n2: number): number => (n2 / n1) ** 11
export const blockadeRadiusScale = (n1: number, n2: number): number => (n2 / n1) ** (11 / 6)

const L3 = 3
const eye3 = (): Mat => [
  [c(1), c(0), c(0)],
  [c(0), c(1), c(0)],
  [c(0), c(0), c(1)],
]
/** The coupling |r><1| + |1><r| and the number operator |r><r| on one atom with levels |0>, |1>, |r>. */
const COUPLE: Mat = [
  [c(0), c(0), c(0)],
  [c(0), c(0), c(1)],
  [c(0), c(1), c(0)],
]
const NUMBER_R: Mat = [
  [c(0), c(0), c(0)],
  [c(0), c(0), c(0)],
  [c(0), c(0), c(1)],
]
const madd9 = (A: Mat, B: Mat): Mat => A.map((row, i) => row.map((z, j) => c(z.re + B[i][j].re, z.im + B[i][j].im)))
const on = (M: Mat, atom: 1 | 2): Mat => (atom === 1 ? kronM(M, eye3()) : kronM(eye3(), M))
/** One pulse of area `area` on `atom` (Omega = 1 sets the time to `area`), with blockade B between |rr> and decay gamma of |r>, on the nine states |ab>, index 3a + b. B = Infinity removes |rr>. */
function rydPulse(atom: 1 | 2, area: number, Omega: number, B: number, gamma: number): Mat {
  let H: Mat = mscale(on(COUPLE, atom), 0.5 * Omega)
  H = madd9(H, mscale(madd9(on(NUMBER_R, 1), on(NUMBER_R, 2)), c(0, -gamma / 2)))
  if (Number.isFinite(B)) {
    const rr: Mat = Array.from({ length: L3 * L3 }, (_, i) => Array.from({ length: L3 * L3 }, (_, j) => (i === 8 && j === 8 ? c(B) : c(0))))
    H = madd9(H, rr)
  } else {
    H = H.map((row, i) => row.map((z, j) => (i === 8 || j === 8 ? c(0) : z)))
  }
  return propagate(H, area / Omega)
}
const BLOCK = [0, 1, 3, 4]
/** The 4 x 4 block (|00>, |01>, |10>, |11>) of the three-pulse sequence: pi on atom 1, 2 pi on atom 2, pi on atom 1. */
export function rydbergGate(Omega: number, B: number, gamma: number): Mat {
  const P1 = rydPulse(1, Math.PI, Omega, B, gamma)
  const P2 = rydPulse(2, 2 * Math.PI, Omega, B, gamma)
  const U = matmul(P1, matmul(P2, P1))
  return BLOCK.map((i) => BLOCK.map((j) => U[i][j]))
}
/** diag(1, -1, -1, -1) = (Z kron Z) CZ. */
export const RYD_IDEAL: Mat = [
  [c(1), c(0), c(0), c(0)],
  [c(0), c(-1), c(0), c(0)],
  [c(0), c(0), c(-1), c(0)],
  [c(0), c(0), c(0), c(-1)],
]
/** max |entry difference| between the blockade-limit gate (B = infinity, no decay) and diag(1, -1, -1, -1). */
export const rydbergIdealGap = (): number => maxAbsDiff(rydbergGate(1, Infinity, 0), RYD_IDEAL)
/** The same product built from the gates: (Z kron Z) times CZ, against diag(1, -1, -1, -1). */
export function zzCzGap(): number {
  const Z: Mat = [
    [c(1), c(0)],
    [c(0), c(-1)],
  ]
  const CZ: Mat = [
    [c(1), c(0), c(0), c(0)],
    [c(0), c(1), c(0), c(0)],
    [c(0), c(0), c(1), c(0)],
    [c(0), c(0), c(0), c(-1)],
  ]
  return maxAbsDiff(matmul(kronM(Z, Z), CZ), RYD_IDEAL)
}
/** The error of a (possibly leaky) block M against diag(1, -1, -1, -1): 1 - (Tr M†M + |Tr U†M|^2)/20. */
export function gateError(M: Mat): number {
  let tr = 0
  for (let j = 0; j < 4; j++) for (let i = 0; i < 4; i++) tr += M[i][j].re ** 2 + M[i][j].im ** 2
  let ov: C = c(0)
  for (let i = 0; i < 4; i++) ov = c(ov.re + RYD_IDEAL[i][i].re * M[i][i].re, ov.im + RYD_IDEAL[i][i].re * M[i][i].im)
  return 1 - (tr + ov.re ** 2 + ov.im ** 2) / 20
}
export const rydbergError = (Omega: number, B: number, gamma: number): number => gateError(rydbergGate(Omega, B, gamma))
/**
 * The best Omega (in units of the blockade B = 1) at decay gamma, read from a scan of 200 values of Omega spaced evenly in log10 from 10^-3.2 to 10^-0.3. The error curve has small wiggles
 * (the blockade's leak turns with the phase of the pulses), so the minimum is the best GRID value, not a refined one; the twin scans the same grid.
 */
export function rydbergBest(gamma: number): { omega: number; error: number } {
  const n = 200
  let best = { omega: 0, error: Infinity }
  for (let i = 0; i < n; i++) {
    const omega = 10 ** (-3.2 + (2.9 * i) / (n - 1))
    const error = rydbergError(omega, 1, gamma)
    if (error < best.error) best = { omega, error }
  }
  return best
}
/** The least-squares slope of log y against log x. */
export function logSlope(xs: readonly number[], ys: readonly number[]): number {
  const lx = xs.map(Math.log)
  const ly = ys.map(Math.log)
  const mx = lx.reduce((s, v) => s + v, 0) / lx.length
  const my = ly.reduce((s, v) => s + v, 0) / ly.length
  return lx.reduce((s, v, i) => s + (v - mx) * (ly[i] - my), 0) / lx.reduce((s, v) => s + (v - mx) ** 2, 0)
}

/** The collective coupling of N atoms in one blockade: twice the largest eigenvalue of the single-excitation block (|0..0> to each |r_j> with Omega/2), by the dense solver. */
export function wCoupling(N: number): number {
  const H: Mat = Array.from({ length: N + 1 }, (_, i) => Array.from({ length: N + 1 }, (_, j) => ((i === 0) !== (j === 0) ? c(0.5) : c(0))))
  const vals = eigh(H).values
  return 2 * vals[vals.length - 1]
}
/** sqrt(N): the closed form of the same number (the W state couples sqrt(N) times faster). */
export const wCouplingClosed = (N: number): number => Math.sqrt(N)

/** The number of ground sublevels, the sum of 2F + 1 over F = |I - J| ... I + J, for nuclear spin I and electronic angular momentum J (caesium I = 7/2, J = 1/2: 7 + 9 = 16; strontium-87 I = 9/2, J = 0: 10). */
export function groundSublevels(I: number, J: number): number {
  let n = 0
  for (let F = Math.abs(I - J); F <= I + J + 1e-9; F += 1) n += 2 * F + 1
  return Math.round(n)
}
/** max over n = 0 ... nMax of |sum_m P(m, a) P(n - m, b) - P(n, a + b)|: signal and background counts add into one Poisson law (Eq. 13.6). */
export function poissonConvolutionGap(a: number, b: number, nMax = 40): number {
  let gap = 0
  for (let n = 0; n <= nMax; n++) {
    let s = 0
    for (let m = 0; m <= n; m++) s += poissonPmf(m, a) * poissonPmf(n - m, b)
    gap = Math.max(gap, Math.abs(s - poissonPmf(n, a + b)))
  }
  return gap
}
