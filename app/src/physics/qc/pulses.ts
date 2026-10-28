/**
 * Pulses, Ramsey interference and noise for one qubit (Physics 709, Chapter Q24; Bergou Ch. 12, pp. 201-216). hbar = 1; |g> = |0>, |e> = |1>; R_n(theta) = e^{-i theta n.sigma/2}.
 *
 * What is here: the Rabi evolution operator of Eq. 12.7 (as printed, complex Omega) and its independent twin by a matrix exponential, the chances of Eq. 12.8, the composite
 * pulse of p. 210 and its error, the Ramsey sequence, precession of a Bloch vector in a field (Eq. 12.10), the average of a noisy phase (Eq. 12.11: Gaussian and an
 * Ornstein-Uhlenbeck correlation, OUR model for Eq. 12.12), the spin echo and imperfect pulse trains (p. 216), the DiVincenzo list and the gate budget (p. 201).
 *
 * Numpy twin: pipeline/q24_numpy.py -> physics/__fixtures__/qc-q24.json (pipeline/make_q24_fixtures.py), read by pulses.test.ts.
 * NOT in the first-paint closure (rule (l)): imported only by qc709/Q24.values.ts, stage/svg/plot.ts (lazy) and tests.
 */
import { type C, abs, abs2, c, conj, expi, mul } from '../complex'
import { type Mat, apply, dagger, madd, matmul, maxDiff, mscale } from '../linalg'
import { blochOf, expmGeneral, gaussLegendre } from './blocheq'
import { expmHermitian, svd } from './cmat'
import { Rx, Ry, Rz, X, Y, Z } from './gates'

const asC = (z: C | number): C => (typeof z === 'number' ? c(z) : z)

/* ------------------------------------------------------------------------------------------ */
/* Rabi pulses (Eqs. 12.6-12.8)                                                                  */
/* ------------------------------------------------------------------------------------------ */

/** Omega' = sqrt(|Omega|^2 + Delta^2). */
export const omegaPrime = (Omega: C | number, Delta: number): number => Math.hypot(abs(asC(Omega)), Delta)

/** Eq. 12.7 as printed: the evolution operator of a drive Omega (complex) at detuning Delta for time t, acting on (c_g, c_e). */
export function rabiU(Omega: C | number, Delta: number, t: number): Mat {
  const O = asC(Omega)
  const Op = omegaPrime(O, Delta)
  const co = Math.cos((Op * t) / 2)
  const si = Math.sin((Op * t) / 2)
  const eP = expi((Delta * t) / 2)
  const eM = expi((-Delta * t) / 2)
  const off = (z: C): C => mul(c(0, si / Op), z)
  return [
    [mul(eP, c(co, (-Delta / Op) * si)), mul(eP, off(conj(O)))],
    [mul(eM, off(O)), mul(eM, c(co, (Delta / Op) * si))],
  ]
}

/** The same operator by a different route: the constant-coefficient frame (a, b) = (c_g e^{-i Delta t/2}, c_e e^{i Delta t/2}) obeys (a, b)' = K (a, b), K = (i/2)[[-Delta, Omega*], [Omega, Delta]]. */
export function rabiUExpm(Omega: C | number, Delta: number, t: number): Mat {
  const O = asC(Omega)
  const K: Mat = [
    [c(0, -Delta / 2), mul(c(0, 0.5), conj(O))],
    [mul(c(0, 0.5), O), c(0, Delta / 2)],
  ]
  const E = expmGeneral(mscale(K, t))
  const eP = expi((Delta * t) / 2)
  const eM = expi((-Delta * t) / 2)
  return [E[0].map((x) => mul(eP, x)), E[1].map((x) => mul(eM, x))]
}

/** Eq. 12.8 from the ground state: P_e = (|Omega|^2 / Omega'^2) sin^2(Omega' t / 2). */
export function rabiPe(Omega: C | number, Delta: number, t: number): number {
  const Op = omegaPrime(Omega, Delta)
  return (abs2(asC(Omega)) / (Op * Op)) * Math.sin((Op * t) / 2) ** 2
}
/** The ceiling of P_e: |Omega|^2 / (|Omega|^2 + Delta^2). */
export const rabiCeiling = (Omega: C | number, Delta: number): number => abs2(asC(Omega)) / (abs2(asC(Omega)) + Delta * Delta)
/** The pi-pulse time pi / |Omega| (on resonance, P_e = 1 at t = pi / |Omega|). */
export const piPulseTime = (Omega: C | number): number => Math.PI / abs(asC(Omega))
/** P_e read from the operator: |U_eg|^2 (the second component of U applied to the ground state). */
export const rabiPeFromU = (U: Mat): number => abs2(U[1][0])

/** The distance max |U - V| after removing nothing (no global phase freedom): used to compare U with R_x(+-theta) and the like. */
export const gateDistance = (U: Mat, V: Mat): number => maxDiff(U, V)

/* ------------------------------------------------------------------------------------------ */
/* Composite pulses (p. 210)                                                                     */
/* ------------------------------------------------------------------------------------------ */

/** The angle with an error: every angle scaled by 1 + eps ('scale') or every angle increased by eps ('add'). */
const angle = (a: number, eps: number, mode: 'scale' | 'add'): number => (mode === 'scale' ? a * (1 + eps) : a + eps)

/** The sequence R_z(-pi) R_x(pi/2) R_y(pi) R_x(pi/2) (the rightmost pulse first), with each angle wrong by eps. At eps = 0 it equals R_x(pi). */
export function compositeU(eps: number, mode: 'scale' | 'add' = 'scale'): Mat {
  const a = (x: number) => angle(x, eps, mode)
  return matmul(matmul(Rz(-a(Math.PI)), Rx(a(Math.PI / 2))), matmul(Ry(a(Math.PI)), Rx(a(Math.PI / 2))))
}
/** A plain pi pulse about x with its angle wrong by eps. */
export const plainU = (eps: number, mode: 'scale' | 'add' = 'scale'): Mat => Rx(angle(Math.PI, eps, mode))
/** The operator 2-norm (largest singular value) of U - R_x(pi). */
export function pulseError(U: Mat): number {
  const R = Rx(Math.PI)
  return svd(U.map((row, i) => row.map((x, j) => c(x.re - R[i][j].re, x.im - R[i][j].im)))).s[0]
}
export const errorPlain = (eps: number, mode: 'scale' | 'add' = 'scale'): number => pulseError(plainU(eps, mode))
export const errorComposite = (eps: number, mode: 'scale' | 'add' = 'scale'): number => pulseError(compositeU(eps, mode))

/* ------------------------------------------------------------------------------------------ */
/* Ramsey (pp. 210-211) and precession (Eqs. 12.9-12.10)                                         */
/* ------------------------------------------------------------------------------------------ */

/** The state after R_y(pi/2), a wait that turns the phase by phi, and R_y(pi/2), from |0>: (amplitude of |0>, amplitude of |1>). */
export function ramseyState(phi: number): [C, C] {
  const wait: Mat = [[c(1), c(0)], [c(0), expi(phi)]]
  const out = apply(matmul(Ry(Math.PI / 2), matmul(wait, Ry(Math.PI / 2))), [c(1), c(0)])
  return [out[0], out[1]]
}
export const ramseyP1 = (phi: number): number => abs2(ramseyState(phi)[1])

type V3 = readonly [number, number, number]
const cross = (a: V3, b: V3): [number, number, number] => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]
const dot = (a: V3, b: V3): number => a[0] * b[0] + a[1] * b[1] + a[2] * b[2]

/** The solution of dM/dt = B x M: M turns about B by |B| t (Rodrigues' formula). */
export function precessM(B: V3, M0: V3, t: number): [number, number, number] {
  const nB = Math.hypot(...B)
  const n: V3 = [B[0] / nB, B[1] / nB, B[2] / nB]
  const th = nB * t
  const k = cross(n, M0)
  const p = dot(n, M0)
  return [0, 1, 2].map((i) => M0[i] * Math.cos(th) + k[i] * Math.sin(th) + n[i] * p * (1 - Math.cos(th))) as [number, number, number]
}
/** RK4 integration of dM/dt = B x M with `steps` steps (the equation as written, no formula for the solution). */
export function crossIntegrate(B: V3, M0: V3, t: number, steps = 4000): [number, number, number] {
  const h = t / steps
  let M: [number, number, number] = [...M0]
  const f = (m: V3) => cross(B, m)
  const lin = (m: V3, k: V3, g: number): [number, number, number] => [m[0] + g * k[0], m[1] + g * k[1], m[2] + g * k[2]]
  for (let i = 0; i < steps; i++) {
    const k1 = f(M)
    const k2 = f(lin(M, k1, h / 2))
    const k3 = f(lin(M, k2, h / 2))
    const k4 = f(lin(M, k3, h))
    M = [0, 1, 2].map((j) => M[j] + (h / 6) * (k1[j] + 2 * k2[j] + 2 * k3[j] + k4[j])) as [number, number, number]
  }
  return M
}
/** The Bloch vector after the same turn computed on the density matrix: H = (1/2) B.sigma, rho -> U rho U†, then r from rho. */
export function precessDensity(B: V3, M0: V3, t: number): [number, number, number] {
  const H = madd(madd(mscale(X, B[0] / 2), mscale(Y, B[1] / 2)), mscale(Z, B[2] / 2))
  const rho: Mat = [
    [c((1 + M0[2]) / 2), c(M0[0] / 2, -M0[1] / 2)],
    [c(M0[0] / 2, M0[1] / 2), c((1 - M0[2]) / 2)],
  ]
  const U = expmHermitian(H, t)
  return blochOf(matmul(matmul(U, rho), dagger(U)))
}
/** The tilt of the field B = (Omega, 0, delta) from the x axis, in degrees: arctan(delta / Omega). */
export const fieldTiltDeg = (Omega: number, delta: number): number => (Math.atan2(delta, Omega) * 180) / Math.PI
export const fieldStrength = (Omega: number, delta: number): number => Math.hypot(Omega, delta)

/* ------------------------------------------------------------------------------------------ */
/* Noise on the phase (Eq. 12.11 and our Ornstein-Uhlenbeck model for Eq. 12.12)                */
/* ------------------------------------------------------------------------------------------ */

/** <cos chi> for a Gaussian phase chi of rms sigma, by composite Gauss-Legendre quadrature over +-14 sigma (no formula). */
export const gaussianCoherence = (sigma: number): number =>
  gaussLegendre((x) => (Math.cos(x) * Math.exp(-(x * x) / (2 * sigma * sigma))) / (sigma * Math.sqrt(2 * Math.PI)), -14 * sigma, 14 * sigma, 56)
/** The closed form e^{-sigma^2/2}. */
export const gaussianCoherenceClosed = (sigma: number): number => Math.exp((-sigma * sigma) / 2)

/** <chi^2> for noise of rms sigma and correlation time tauC after time t: 2 sigma^2 tauC^2 (t/tauC - 1 + e^{-t/tauC}). */
export const ouVariance = (t: number, sigma: number, tauC: number): number => 2 * sigma * sigma * tauC * tauC * (t / tauC - 1 + Math.exp(-t / tauC))
/** The coherence e^{-<chi^2>/2} of a Gaussian phase with that variance. */
export const ouCoherence = (t: number, sigma: number, tauC: number): number => Math.exp(-ouVariance(t, sigma, tauC) / 2)

interface Piece {
  a: number
  b: number
  sign: number
}
/** <chi^2> = sigma^2 double integral of f(s) f(u) e^{-|u-s|/tauC} over the pieces of a +-1 switching function f, by Gauss-Legendre (the kink at u = s is split off). */
function phaseVarianceQuad(pieces: readonly Piece[], sigma: number, tauC: number): number {
  const panels = 12
  let total = 0
  for (const P of pieces)
    total += gaussLegendre(
      (s) => {
        let inner = 0
        for (const Q of pieces) {
          const cuts = s > Q.a && s < Q.b ? [Q.a, s, Q.b] : [Q.a, Q.b]
          for (let i = 0; i + 1 < cuts.length; i++) inner += Q.sign * gaussLegendre((u) => Math.exp(-Math.abs(u - s) / tauC), cuts[i], cuts[i + 1], panels)
        }
        return P.sign * inner
      },
      P.a,
      P.b,
      panels,
    )
  return sigma * sigma * total
}
/** The Ramsey phase variance over time t by double quadrature (checks `ouVariance`). */
export const ouVarianceQuad = (t: number, sigma: number, tauC: number): number => phaseVarianceQuad([{ a: 0, b: t, sign: 1 }], sigma, tauC)

/** The slow-noise limit of T2*: sqrt(2)/sigma (the Gaussian e^{-sigma^2 t^2/2} falls to 1/e there). */
export const t2starStaticLimit = (sigma: number): number => Math.SQRT2 / sigma
/** The fast-noise limit of T2*: 1/(sigma^2 tau_c) (the exponential e^{-sigma^2 tau_c t}). */
export const t2starFastLimit = (sigma: number, tauC: number): number => 1 / (sigma * sigma * tauC)

/** The 1/e time of the noise-averaged coherence: the root of ouCoherence(t) = e^{-1} by bisection. */
export function t2star(sigma: number, tauC: number): number {
  let lo = 0
  let hi = 1
  while (ouCoherence(hi, sigma, tauC) > Math.exp(-1)) hi *= 2
  for (let k = 0; k < 200; k++) {
    const mid = (lo + hi) / 2
    if (ouCoherence(mid, sigma, tauC) > Math.exp(-1)) lo = mid
    else hi = mid
  }
  return (lo + hi) / 2
}

/** The echo's phase variance over total time 2 tau: sigma^2 [4 tauC^2 (tau/tauC - 1 + e^{-tau/tauC}) - 2 tauC^2 (1 - e^{-tau/tauC})^2]. */
export function echoVariance(tau: number, sigma: number, tauC: number): number {
  const e = Math.exp(-tau / tauC)
  return sigma * sigma * (4 * tauC * tauC * (tau / tauC - 1 + e) - 2 * tauC * tauC * (1 - e) ** 2)
}
/** The same variance by double quadrature of the switching function -1 on [0, tau), +1 on [tau, 2 tau]. */
export const echoVarianceQuad = (tau: number, sigma: number, tauC: number): number =>
  phaseVarianceQuad(
    [
      { a: 0, b: tau, sign: -1 },
      { a: tau, b: 2 * tau, sign: 1 },
    ],
    sigma,
    tauC,
  )
export const echoCoherence = (tau: number, sigma: number, tauC: number): number => Math.exp(-echoVariance(tau, sigma, tauC) / 2)

/** The echo sequence R_x(pi) W R_x(pi) W with W = R_z(delta tau) (a static frequency error delta): it equals -I (the two flips' sign) for every delta. */
export function echoSequence(delta: number, tau: number): Mat {
  const W = Rz(delta * tau)
  return matmul(Rx(Math.PI), matmul(W, matmul(Rx(Math.PI), W)))
}

/** P(0) after 2N pi pulses about x, each of area pi (1 + eps): all in the same sense, or alternately +x and -x. */
export function pulseTrainP0(eps: number, N: number, alternate: boolean): number {
  let U: Mat = [[c(1), c(0)], [c(0), c(1)]]
  for (let k = 0; k < 2 * N; k++) U = matmul(Rx((alternate && k % 2 === 1 ? -1 : 1) * Math.PI * (1 + eps)), U)
  return abs2(U[0][0])
}
/** The rotation angle of the product of the same 2N pulses, read off the matrix (2 atan2(|U_eg|, |U_gg|)), in degrees: a whole number of full turns is invisible, so this is the error angle. */
export function pulseTrainAngleDeg(eps: number, N: number, alternate: boolean): number {
  let U: Mat = [[c(1), c(0)], [c(0), c(1)]]
  for (let k = 0; k < 2 * N; k++) U = matmul(Rx((alternate && k % 2 === 1 ? -1 : 1) * Math.PI * (1 + eps)), U)
  return (2 * Math.atan2(abs(U[1][0]), abs(U[0][0])) * 180) / Math.PI
}
/** The accumulated angle error of 2N same-sense pulses, in degrees: each is pi eps (180 eps degrees) too large, so 2N of them are 360 N eps. */
export const accumulatedErrorDeg = (eps: number, N: number): number => 360 * N * eps

/* ------------------------------------------------------------------------------------------ */
/* Criteria and the gate budget (p. 201)                                                         */
/* ------------------------------------------------------------------------------------------ */

export interface Criterion {
  id: string
  kind: 'computer' | 'network'
}
/** DiVincenzo's seven criteria: five for a quantum computer, two more for a quantum network. */
export function divincenzo(): { criteria: Criterion[]; platforms: string[] } {
  return {
    criteria: [
      { id: 'scalable', kind: 'computer' },
      { id: 'initialise', kind: 'computer' },
      { id: 'coherence', kind: 'computer' },
      { id: 'gates', kind: 'computer' },
      { id: 'measure', kind: 'computer' },
      { id: 'convert', kind: 'network' },
      { id: 'transmit', kind: 'network' },
    ],
    platforms: ['neutral atoms', 'trapped ions', 'photons', 'superconducting circuits', 'quantum dots'],
  }
}
/** How many gates of duration tGate fit in a coherence time T2 (same units). */
export const gatesPerCoherence = (T2: number, tGate: number): number => T2 / tGate
/** The coherence factor e^{-t/T2} left after time t. */
export const coherenceFactor = (t: number, T2: number): number => Math.exp(-t / T2)
