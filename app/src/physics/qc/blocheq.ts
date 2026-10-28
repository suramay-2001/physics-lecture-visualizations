/**
 * Lindblad and Bloch equations for one qubit (Physics 709, Chapter Q24; Bergou Ch. 12, pp. 201-209). hbar = 1; |g> = |0> = |+z> (north), |e> = |1>;
 * rho = (I + r.sigma)/2, so r_x = 2 Re rho_ge, r_y = -2 Im rho_ge, r_z = rho_gg - rho_ee = -w (w = rho_ee - rho_gg is the inversion).
 *
 * What is here: a matrix exponential for any small complex matrix, the Lindblad right-hand side, the 4 x 4 superoperator and its exponential, the short Kraus step it
 * comes from, the qubit jump operators, T1 and T2 read off the superoperator, the positivity bound on T2, the optical Bloch equations in the rotating-wave form
 * (Eqs. 12.4: RK4, the steady state by a linear solve, the exact time average), and a reference without the rotating-wave step (lab frame, periodic steady state).
 *
 * Numpy twin: pipeline/q24_numpy.py (scipy expm, solve_ivp, linear solves) -> physics/__fixtures__/qc-q24.json (pipeline/make_q24_fixtures.py), read by blocheq.test.ts.
 * NOT in the first-paint closure (rule (l)): imported only by qc709/Q24.values.ts, stage/svg/plot.ts (lazy) and tests.
 */
import { type C, ZERO, abs, add, c, conj, mul, scale } from '../complex'
import { type Mat, dagger, identity, madd, matmul, mscale, msub } from '../linalg'
import { kronM } from './cmat'
import { Z } from './gates'

const transpose = (A: Mat): Mat => A[0].map((_, j) => A.map((row) => row[j]))
const conjM = (A: Mat): Mat => A.map((row) => row.map(conj))
const trace = (A: Mat): C => A.reduce((s, row, i) => add(s, row[i]), ZERO)
const rowNorm = (A: Mat): number => Math.max(...A.map((row) => row.reduce((s, x) => s + abs(x), 0)))

/** exp(A) for a small complex matrix: scale by 2^-s, Taylor to order 22, square s times. */
export function expmGeneral(A: Mat): Mat {
  const n = A.length
  const s = Math.max(0, Math.ceil(Math.log2(Math.max(rowNorm(A), 1e-300))) + 2)
  const B = mscale(A, 1 / 2 ** s)
  let term = identity(n)
  let sum = identity(n)
  for (let k = 1; k <= 22; k++) {
    term = mscale(matmul(term, B), 1 / k)
    sum = madd(sum, term)
  }
  for (let i = 0; i < s; i++) sum = matmul(sum, sum)
  return sum
}

/* ------------------------------------------------------------------------------------------ */
/* Lindblad equation (Eq. 12.1 and the form on p. 203)                                           */
/* ------------------------------------------------------------------------------------------ */

/** d rho / dt = -i[H, rho] + sum_j (L_j rho L_j† - (1/2) L_j† L_j rho - (1/2) rho L_j† L_j). */
export function lindbladRhs(rho: Mat, H: Mat, Ls: readonly Mat[]): Mat {
  let out = mscale(msub(matmul(H, rho), matmul(rho, H)), c(0, -1))
  for (const L of Ls) {
    const Ld = dagger(L)
    const LdL = matmul(Ld, L)
    out = madd(out, msub(msub(matmul(matmul(L, rho), Ld), mscale(matmul(LdL, rho), 0.5)), mscale(matmul(rho, LdL), 0.5)))
  }
  return out
}

/** The superoperator of the Lindblad equation on vec(rho) (row-major), using vec(A rho B) = (A kron B^T) vec(rho). */
export function liouvillian(H: Mat, Ls: readonly Mat[]): Mat {
  const n = H.length
  const Id = identity(n)
  let S = mscale(msub(kronM(H, Id), kronM(Id, transpose(H))), c(0, -1))
  for (const L of Ls) {
    const LdL = matmul(dagger(L), L)
    S = madd(S, msub(msub(kronM(L, conjM(L)), mscale(kronM(LdL, Id), 0.5)), mscale(kronM(Id, transpose(LdL)), 0.5)))
  }
  return S
}

/** rho(t) = exp(S t) vec(rho0): the exact solution of the (time-independent) Lindblad equation. */
export function lindbladSolve(rho0: Mat, H: Mat, Ls: readonly Mat[], t: number): Mat {
  const n = rho0.length
  const E = expmGeneral(mscale(liouvillian(H, Ls), t))
  const v = rho0.flat()
  const out = E.map((row) => row.reduce((s, x, k) => add(s, mul(x, v[k])), ZERO))
  return Array.from({ length: n }, (_, i) => out.slice(i * n, (i + 1) * n))
}

/** L_0 = -iH - (1/2) sum_j L_j† L_j, the nearly-identity Kraus operator's generator (A_0 = I + L_0 dt). */
export function lindbladL0(H: Mat, Ls: readonly Mat[]): Mat {
  let L0 = mscale(H, c(0, -1))
  for (const L of Ls) L0 = msub(L0, mscale(matmul(dagger(L), L), 0.5))
  return L0
}

/** One short Kraus step: A_0 = I + L_0 dt and A_j = L_j sqrt(dt), rho -> sum_j A_j rho A_j†. */
export function krausStep(rho: Mat, L0: Mat, Ls: readonly Mat[], dt: number): Mat {
  const A0 = madd(identity(rho.length), mscale(L0, dt))
  let out = matmul(matmul(A0, rho), dagger(A0))
  for (const L of Ls) {
    const A = mscale(L, Math.sqrt(dt))
    out = madd(out, matmul(matmul(A, rho), dagger(A)))
  }
  return out
}

/** The Euler step of the Lindblad equation: rho + dt * rhs. */
export const eulerStep = (rho: Mat, H: Mat, Ls: readonly Mat[], dt: number): Mat => madd(rho, mscale(lindbladRhs(rho, H, Ls), dt))

/** The jump of spontaneous decay e -> g at rate gamma: L = sqrt(gamma) |g><e|. */
export const qubitJump = (gamma: number): Mat => [[ZERO, c(Math.sqrt(gamma))], [ZERO, ZERO]]
/** The dephasing jump sqrt(gamma_phi / 2) Z: it shrinks rho_ge at rate gamma_phi and leaves the populations alone. */
export const dephasingJump = (gammaPhi: number): Mat => mscale(Z, Math.sqrt(gammaPhi / 2))

/** The Bloch vector (r_x, r_y, r_z) of a qubit state. */
export const blochOf = (rho: Mat): [number, number, number] => [2 * rho[0][1].re + 0, -2 * rho[0][1].im + 0, rho[0][0].re - rho[1][1].re + 0]
/** rho = (I + r.sigma)/2 for a Bloch vector r (not necessarily of length 1). */
export const rhoOfBloch = (r: readonly number[]): Mat => [
  [c((1 + r[2]) / 2), c(r[0] / 2, -r[1] / 2)],
  [c(r[0] / 2, r[1] / 2), c((1 - r[2]) / 2)],
]
/** Tr(rho^2) = (1 + |r|^2)/2 for a qubit. */
export const purityOf = (rho: Mat): number => trace(matmul(rho, rho)).re
export const traceOf = (rho: Mat): C => trace(rho)

/** The population and phase-signal factors left at time t (units of 1/gamma, gamma = 1) for decay from |+x>: rho_ee(t)/rho_ee(0) and |rho_ge(t)|/|rho_ge(0)| from the solved Lindblad equation. */
export function decayFactors(t: number): { pop: number; coh: number } {
  const rho = lindbladSolve(rhoOfBloch([1, 0, 0]), [[ZERO, ZERO], [ZERO, ZERO]], [qubitJump(1)], t)
  return { pop: rho[1][1].re / 0.5, coh: abs(rho[0][1]) / 0.5 }
}

/** T1 and T2 read off the superoperator: minus the inverse of the diagonal entries for rho_ee and rho_ge (valid when H = 0 and the jumps leave populations and coherence unmixed). */
export function decayTimes(H: Mat, Ls: readonly Mat[]): { T1: number; T2: number } {
  const S = liouvillian(H, Ls)
  return { T1: -1 / S[3][3].re, T2: -1 / S[1][1].re }
}

/* ------------------------------------------------------------------------------------------ */
/* T2 <= 2 T1 (positivity)                                                                       */
/* ------------------------------------------------------------------------------------------ */

/** The phenomenological state from |+x>: rho_ee = (1/2) e^{-t/T1} and |rho_ge| = (1/2) e^{-t/T2}. */
export const relaxedState = (t: number, T1: number, T2: number): Mat => [
  [c(1 - 0.5 * Math.exp(-t / T1)), c(0.5 * Math.exp(-t / T2))],
  [c(0.5 * Math.exp(-t / T2)), c(0.5 * Math.exp(-t / T1))],
]
/** The smaller eigenvalue of a qubit density matrix, in closed form: (1 - |r|)/2 for the Bloch length |r|. */
export const minEigenvalue = (rho: Mat): number => (1 - Math.hypot(...blochOf(rho))) / 2
/** The least smaller eigenvalue of `relaxedState(t, T1, T2)` over 0 <= t <= tMax: a coarse grid, then golden-section refinement. */
export function positivityMin(T1: number, T2: number, tMax = 12, n = 2400): { min: number; at: number } {
  const f = (t: number) => minEigenvalue(relaxedState(t, T1, T2))
  let best = 0
  for (let i = 1; i <= n; i++) if (f((tMax * i) / n) < f((tMax * best) / n)) best = i
  let lo = (tMax * Math.max(best - 1, 0)) / n
  let hi = (tMax * Math.min(best + 1, n)) / n
  const g = (Math.sqrt(5) - 1) / 2
  for (let k = 0; k < 90; k++) {
    const a = hi - g * (hi - lo)
    const b = lo + g * (hi - lo)
    if (f(a) < f(b)) hi = b
    else lo = a
  }
  const at = (lo + hi) / 2
  return { min: f(at), at }
}

/* ------------------------------------------------------------------------------------------ */
/* Optical Bloch equations in the rotating-wave form (Eqs. 12.4), real Rabi frequency            */
/* ------------------------------------------------------------------------------------------ */

export interface BlochParams {
  /** Rabi frequency Omega (real here) */
  Omega: number
  /** detuning Delta = omega - omega_q */
  Delta: number
  T1: number
  T2: number
}
/** The state (w, Re rho~_eg, Im rho~_eg) of Eqs. 12.4, with w = rho_ee - rho_gg. */
export type BlochState = [number, number, number]

/** Eqs. 12.4: w' = -(1 + w)/T1 + 2 Omega Im rho~; rho~' = (i Delta - 1/T2) rho~ - i (Omega/2) w. */
export function blochRhs(s: BlochState, p: BlochParams): BlochState {
  const [w, a, b] = s
  return [-(1 + w) / p.T1 + 2 * p.Omega * b, -a / p.T2 - p.Delta * b, p.Delta * a - b / p.T2 - (p.Omega * w) / 2]
}

/** RK4 integration of Eqs. 12.4 over time t with `steps` steps. */
export function integrateBloch(s0: BlochState, p: BlochParams, t: number, steps = 4000): BlochState {
  const h = t / steps
  let s: BlochState = [...s0]
  const lin = (u: BlochState, k: BlochState, f: number): BlochState => [u[0] + f * k[0], u[1] + f * k[1], u[2] + f * k[2]]
  for (let i = 0; i < steps; i++) {
    const k1 = blochRhs(s, p)
    const k2 = blochRhs(lin(s, k1, h / 2), p)
    const k3 = blochRhs(lin(s, k2, h / 2), p)
    const k4 = blochRhs(lin(s, k3, h), p)
    s = [0, 1, 2].map((j) => s[j] + (h / 6) * (k1[j] + 2 * k2[j] + 2 * k3[j] + k4[j])) as BlochState
  }
  return s
}

/** Solve the real linear system A x = b by Gaussian elimination with partial pivoting. */
export function solveReal(A: number[][], b: number[]): number[] {
  const n = b.length
  const M = A.map((row, i) => [...row, b[i]])
  for (let col = 0; col < n; col++) {
    let piv = col
    for (let r = col + 1; r < n; r++) if (Math.abs(M[r][col]) > Math.abs(M[piv][col])) piv = r
    ;[M[col], M[piv]] = [M[piv], M[col]]
    for (let r = col + 1; r < n; r++) {
      const f = M[r][col] / M[col][col]
      for (let k = col; k <= n; k++) M[r][k] -= f * M[col][k]
    }
  }
  const x = new Array<number>(n).fill(0)
  for (let r = n - 1; r >= 0; r--) {
    let s = M[r][n]
    for (let k = r + 1; k < n; k++) s -= M[r][k] * x[k]
    x[r] = s / M[r][r]
  }
  return x
}

/** The steady state of Eqs. 12.4 by setting the three derivatives to zero and solving the linear system: {w, rho~_eg}. */
export function blochSteady(p: BlochParams): { w: number; rho: C } {
  const { Omega, Delta, T1, T2 } = p
  const [w, a, b] = solveReal(
    [
      [1 / T1, 0, -2 * Omega],
      [0, 1 / T2, Delta],
      [Omega / 2, -Delta, 1 / T2],
    ],
    [-1 / T1, 0, 0],
  )
  return { w, rho: c(a, b) }
}
/** Eq. 12.5a: w = -(1 + x^2) / (1 + x^2 + s) with x = Delta T2 and s = T1 T2 Omega^2 (the closed form the linear solve must match). */
export const steadyInversion = (Delta: number, T1: number, T2: number, Omega: number): number => -(1 + (Delta * T2) ** 2) / (1 + (Delta * T2) ** 2 + T1 * T2 * Omega * Omega)
/** The steady excited share rho_ee = (1 + w)/2 = (1/2) s / (1 + x^2 + s), as a function of x = Delta T2 and the saturation s. */
export const steadyExcited = (x: number, s: number): number => (0.5 * s) / (1 + x * x + s)
/** Eq. 12.5b with the sign of the imaginary part as OUR calculation finds it (+i Delta T2), and as printed (-i Delta T2). */
export function steadyCoherenceForm(p: BlochParams, printed: boolean): C {
  const w = steadyInversion(p.Delta, p.T1, p.T2, p.Omega)
  const x = p.Delta * p.T2
  const lead = scale(mul(c(0, -1), c(w)), (p.Omega * p.T2) / 2 / (1 + x * x))
  return mul(lead, c(1, printed ? -x : x))
}
/** The full width at half height of the steady curve rho_ee(x) at saturation s, in units of 1/T2: the half height is where 1 + x^2 = 1 + s, so 2 sqrt(1 + s). */
export const steadyWidth = (s: number): number => 2 * Math.sqrt(1 + s)
/** The same width found numerically by bisection on the line shape 1 / (1 + x^2 + s) (steadyExcited divided by s/2; defined at s = 0 too), with no formula. */
export function steadyWidthBisect(s: number): number {
  const shape = (x: number) => 1 / (1 + x * x + s)
  const half = shape(0) / 2
  let lo = 0
  let hi = 1e3
  for (let k = 0; k < 200; k++) {
    const mid = (lo + hi) / 2
    if (shape(mid) > half) lo = mid
    else hi = mid
  }
  return 2 * ((lo + hi) / 2)
}

/** The two saturation parameters s = T1 T2 Omega^2 of the weak- and strong-drive curves drawn in Unit 24.3. */
export const S_WEAK = 0.2
export const S_STRONG = 5

/** Ten-point Gauss-Legendre nodes and weights on [-1, 1]. */
const GL_X = [0.14887433898163122, 0.4333953941292472, 0.6794095682990244, 0.8650633666889845, 0.9739065285171717]
const GL_W = [0.29552422471475287, 0.26926671930999635, 0.21908636251598204, 0.1494513491505806, 0.06667134430868814]
/** Composite Gauss-Legendre quadrature of f on [a, b] with `panels` panels of ten nodes each. */
export function gaussLegendre(f: (x: number) => number, a: number, b: number, panels = 1): number {
  let total = 0
  const h = (b - a) / panels
  for (let p = 0; p < panels; p++) {
    const mid = a + (p + 0.5) * h
    const half = h / 2
    for (let k = 0; k < 5; k++) total += GL_W[k] * half * (f(mid - half * GL_X[k]) + f(mid + half * GL_X[k]))
  }
  return total
}

/**
 * The exact solution of Eqs. 12.4 from the ground state at time t, from the exponential of the 4 x 4 affine system: y(t) = exp(M t) (w0, a0, b0, 1)^T.
 * The 4 x 4 matrix is real; expmGeneral is used on it as a complex matrix.
 */
export function blochExact(s0: BlochState, p: BlochParams, t: number): BlochState {
  const { Omega, Delta, T1, T2 } = p
  const M = [
    [-1 / T1, 0, 2 * Omega, -1 / T1],
    [0, -1 / T2, -Delta, 0],
    [-Omega / 2, Delta, -1 / T2, 0],
    [0, 0, 0, 0],
  ]
  const E = expmGeneral(M.map((row) => row.map((x) => c(x * t))))
  const y = [s0[0], s0[1], s0[2], 1]
  return [0, 1, 2].map((i) => E[i].reduce((s, x, k) => s + x.re * y[k], 0)) as BlochState
}

/** The time average of rho_ee = (1 + w)/2 over t0 <= t <= t1 along the exact solution from the ground state (composite Gauss-Legendre in time). */
export function blochAverageExcited(p: BlochParams, t0: number, t1: number, s0: BlochState = [-1, 0, 0]): number {
  const panels = Math.max(8, Math.ceil(((t1 - t0) * Math.abs(p.Delta)) / 2))
  const integral = gaussLegendre((t) => (1 + blochExact(s0, p, t)[0]) / 2, t0, t1, panels)
  return integral / (t1 - t0)
}

/** The time average of the lossless Rabi chance P_e = (Omega^2/Omega'^2) sin^2(Omega' t/2): (1/2) Omega^2 / (Omega^2 + Delta^2). */
export const losslessAverage = (Omega: number, Delta: number): number => (0.5 * Omega * Omega) / (Omega * Omega + Delta * Delta)

/* ------------------------------------------------------------------------------------------ */
/* Without the rotating-wave step: the lab frame (the reference for Eq. 12.5b and the RWA error) */
/* ------------------------------------------------------------------------------------------ */

export interface LabParams extends BlochParams {
  /** the qubit's frequency omega_q (the drive's is omega_q + Delta) */
  omegaQ: number
}

/**
 * The lab-frame equations for (w, Re rho_ge, Im rho_ge) with H = diag(-omega_q/2, omega_q/2) - Omega cos(omega t) sigma_x and decay rates 1/T1, 1/T2:
 * w' = 4 x Im rho_ge - (1 + w)/T1, rho_ge' = (i omega_q - 1/T2) rho_ge - i x w, where x(t) = -Omega cos(omega t) is the coupling.
 */
export function labRhs(s: BlochState, t: number, p: LabParams): BlochState {
  const [w, br, bi] = s
  const x = -p.Omega * Math.cos((p.omegaQ + p.Delta) * t)
  return [4 * x * bi - (1 + w) / p.T1, -br / p.T2 - p.omegaQ * bi, p.omegaQ * br - bi / p.T2 - x * w]
}

/** One RK4 step of the lab-frame equations from time t. */
function labStep(s: BlochState, t: number, h: number, p: LabParams): BlochState {
  const lin = (u: BlochState, k: BlochState, f: number): BlochState => [u[0] + f * k[0], u[1] + f * k[1], u[2] + f * k[2]]
  const k1 = labRhs(s, t, p)
  const k2 = labRhs(lin(s, k1, h / 2), t + h / 2, p)
  const k3 = labRhs(lin(s, k2, h / 2), t + h / 2, p)
  const k4 = labRhs(lin(s, k3, h), t + h, p)
  return [0, 1, 2].map((j) => s[j] + (h / 6) * (k1[j] + 2 * k2[j] + 2 * k3[j] + k4[j])) as BlochState
}

/** RK4 integration of the lab-frame equations from `s0` at t = 0 to time t. */
export function integrateLab(s0: BlochState, p: LabParams, t: number, steps: number): BlochState {
  let s = s0
  const h = t / steps
  for (let i = 0; i < steps; i++) s = labStep(s, i * h, h, p)
  return s
}

/**
 * The periodic steady state of the driven qubit WITHOUT the rotating-wave step. The one-period map of the affine system is found by RK4 on four columns;
 * its fixed point solves (I - Phi) y* = p. Returns the averages over one drive period of w and of rho~_eg = rho_eg e^{i omega t}, and the largest step error check.
 */
export function labSteadyAverages(p: LabParams, stepsPerPeriod = 1200): { w: number; rho: C } {
  const omega = p.omegaQ + p.Delta
  const T = (2 * Math.PI) / omega
  const h = T / stepsPerPeriod
  // columns of the monodromy and the inhomogeneous part: integrate the linear part from each unit vector, and the full system from zero minus the linear part
  const cols: BlochState[] = [[1, 0, 0], [0, 1, 0], [0, 0, 1]]
  const flow = (s0: BlochState, inhom: boolean): BlochState => {
    let s = s0
    for (let i = 0; i < stepsPerPeriod; i++) s = labStepAffine(s, i * h, h, p, inhom)
    return s
  }
  const phi = cols.map((e) => flow(e, false))
  const q = flow([0, 0, 0], true)
  const A = [0, 1, 2].map((i) => [0, 1, 2].map((j) => (i === j ? 1 : 0) - phi[j][i]))
  const y0 = solveReal(A, q)
  // average over the period (trapezoid over a full period is spectrally accurate), at the step nodes
  let s: BlochState = y0 as BlochState
  let wSum = 0
  let aSum = 0
  let bSum = 0
  for (let i = 0; i < stepsPerPeriod; i++) {
    const t = i * h
    const rt = mul(c(s[1], -s[2]), c(Math.cos(omega * t), Math.sin(omega * t)))
    wSum += s[0]
    aSum += rt.re
    bSum += rt.im
    s = labStepAffine(s, t, h, p, true)
  }
  return { w: wSum / stepsPerPeriod, rho: c(aSum / stepsPerPeriod, bSum / stepsPerPeriod) }
}

/** A lab-frame RK4 step, with or without the constant (inhomogeneous) terms (used to build the one-period map). */
function labStepAffine(s: BlochState, t: number, h: number, p: LabParams, inhom: boolean): BlochState {
  const f = (u: BlochState, tt: number): BlochState => {
    const r = labRhs(u, tt, p)
    return inhom ? r : [r[0] + 1 / p.T1, r[1], r[2]]
  }
  const lin = (u: BlochState, k: BlochState, g: number): BlochState => [u[0] + g * k[0], u[1] + g * k[1], u[2] + g * k[2]]
  const k1 = f(s, t)
  const k2 = f(lin(s, k1, h / 2), t + h / 2)
  const k3 = f(lin(s, k2, h / 2), t + h / 2)
  const k4 = f(lin(s, k3, h), t + h)
  return [0, 1, 2].map((j) => s[j] + (h / 6) * (k1[j] + 2 * k2[j] + 2 * k3[j] + k4[j])) as BlochState
}

/**
 * The general time-dependent Lindblad equation by RK4 on 2 x 2 matrices (slow but unrestricted): d rho/dt = lindbladRhs(rho, Ht(t), Ls).
 * The lab-frame scalar form above is the fast twin of this for the driven, decaying qubit; the tests compare the two at a few hundred steps.
 */
export function lindbladRk4(rho0: Mat, Ht: (t: number) => Mat, Ls: readonly Mat[], t: number, steps: number): Mat {
  const h = t / steps
  let rho = rho0
  for (let i = 0; i < steps; i++) {
    const t0 = i * h
    const k1 = lindbladRhs(rho, Ht(t0), Ls)
    const k2 = lindbladRhs(madd(rho, mscale(k1, h / 2)), Ht(t0 + h / 2), Ls)
    const k3 = lindbladRhs(madd(rho, mscale(k2, h / 2)), Ht(t0 + h / 2), Ls)
    const k4 = lindbladRhs(madd(rho, mscale(k3, h)), Ht(t0 + h), Ls)
    rho = madd(rho, mscale(madd(madd(k1, mscale(k2, 2)), madd(mscale(k3, 2), k4)), h / 6))
  }
  return rho
}

/** The drive's Hamiltonian as a matrix: H(t) = diag(-omega_q/2, omega_q/2) - Omega cos(omega t) sigma_x. */
export const labHamiltonian = (p: LabParams, t: number): Mat => {
  const x = -p.Omega * Math.cos((p.omegaQ + p.Delta) * t)
  return [[c(-p.omegaQ / 2), c(x)], [c(x), c(p.omegaQ / 2)]]
}

/** The jump operators matching decay rates 1/T1 and 1/T2: spontaneous decay at 1/T1 and dephasing at 1/T2 - 1/(2 T1). */
export const labJumps = (T1: number, T2: number): Mat[] => [qubitJump(1 / T1), dephasingJump(1 / T2 - 1 / (2 * T1))]
