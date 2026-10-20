/**
 * Engine helpers that only the Physics 448 Townsend-pass lectures (L3, L6, L7, L8) and one lazy plot curve use. They live here and not in
 * `spin.ts` / `polarization.ts` because those two are statically imported by the first-paint closure (stage/resolve.ts), and a bundler
 * keeps every export that ANY chunk uses in the shared chunk: a helper that only a lecture reads would ride in the entry. This module is
 * imported by lecture value files, tests and the lazy SVG `plot` kind only (build/chunks.test.ts rule (l) guards the entry budget).
 * Numpy twins: pipeline/claims_448/g1.py (pathLedger), g2a.py (portProbs), g2b.py (schwarzParts, chainTransmission, plateDelta, circularChance,
 * quarterWaveThickness, photonJz).
 */
import { type C, abs2, add, c, mul, ZERO } from './complex'
import { type Mat, type Vec, apply, dagger, identity, inner, madd, matmul, mscale, msub, norm2, normalize, vec } from './linalg'
import { Rz, expectation, variance, SIGMA_Y } from './spin'

/**
 * A two-arm spin interferometer (Townsend Ch. 2, interferometer problems): the beam splits into two equal arms, one arm is turned by
 * R_z(φ) (φ in DEGREES), the arms recombine, and the two output ports receive (I ± R_z)ψ/2. The chances of the + and − port add to 1;
 * the + port reads (1 + ⟨ψ|R_z|ψ⟩.re)/2.
 */
export function portProbs(psi: Vec, phiDeg: number): { plus: number; minus: number } {
  const R = Rz((phiDeg * Math.PI) / 180)
  const port = (sign: 1 | -1): number => norm2(apply(mscale(madd(identity(2), mscale(R, sign)), 0.5), psi))
  return { plus: port(1), minus: port(-1) }
}

/**
 * The two pieces of Townsend's Schwarz proof (Eqs. 3.65-3.72) for Hermitian A, B on a pure state: with O = (A - <A>)(B - <B>), F = O + O† and [A, B] = iC,
 * `cov` = <F>²/4 (the piece the bound drops), `comm` = <C>²/4 (the piece it keeps) and `prod` = (ΔA ΔB)². For a qubit the Schwarz inequality is an equality,
 * so prod = cov + comm. Computed through the operators F and C, not the shifted kets (the numpy twin uses the kets).
 */
export function schwarzParts(A: Mat, B: Mat, psi: Vec): { cov: number; comm: number; prod: number } {
  const p = normalize(psi)
  const O = matmul(msub(A, mscale(identity(2), expectation(A, p))), msub(B, mscale(identity(2), expectation(B, p))))
  const F = madd(O, dagger(O))
  const C = mscale(msub(matmul(A, B), matmul(B, A)), c(0, -1))
  return { cov: expectation(F, p) ** 2 / 4, comm: expectation(C, p) ** 2 / 4, prod: variance(A, p) * variance(B, p) }
}

/**
 * Townsend Eqs. 2.53–2.56: the amplitude for `initial` to end in `final` through each state of a complete orthonormal `basis`,
 * a_i = ⟨final|b_i⟩⟨b_i|initial⟩. `diagonal` = Σ|a_i|² (add the chances: the route is recorded), `interference` = |Σa_i|² − Σ|a_i|²
 * (the cross terms), `total` = |Σa_i|² (add the amplitudes: nothing records the route) and `sum` = Σa_i.
 */
export function pathLedger(initial: Vec, final: Vec, basis: Vec[]): { paths: C[]; sum: C; diagonal: number; interference: number; total: number } {
  const paths = basis.map((b) => mul(inner(final, b), inner(b, initial)))
  const sum = paths.reduce((s, a) => add(s, a), ZERO)
  const diagonal = paths.reduce((s, a) => s + abs2(a), 0)
  const total = abs2(sum)
  return { paths, sum, diagonal, interference: total - diagonal, total }
}

/* Townsend pass, G2b (Lecture 8): a chain of polarizers, a wave plate, the spin a beam carries. Numpy twin: pipeline/claims_448/g2b.py. */

/** N polarizers, each turned by phi/N (degrees) from the one before, a total turn of phi: the photon passes each with chance cos²(phi/N), and each pass leaves it in the next polarizer's state. P = cos^{2N}(phi/N). */
export const chainTransmission = (n: number, phiDeg: number): number => Math.cos((phiDeg * Math.PI) / 180 / n) ** (2 * n)
/** The relative phase (radians) a plate of thickness d (same unit as lambda) with index difference dn puts between the two linear parts: 2π dn d / λ. */
export const plateDelta = (dn: number, d: number, lambda: number): number => (2 * Math.PI * dn * d) / lambda
/** The chance that light at 45° to a plate's axes leaves as |C₊⟩ = (|H⟩ + i|V⟩)/√2 after a relative phase delta (radians): (1 + sin δ)/2. */
export const circularChance = (delta: number): number => (1 + Math.sin(delta)) / 2
/** The thickness of a zero-order quarter-wave plate: λ/(4 dn). */
export const quarterWaveThickness = (dn: number, lambda: number): number => lambda / (4 * dn)
/** ⟨J_z⟩ in units of ħ for the polarization a|H⟩ + b|V⟩: the expectation of the matrix [[0, −i], [i, 0]] (Townsend Ex. 2.8), which equals 2 Im(a* b) for a normalized state. */
export const photonJz = (a: C, b: C): number => expectation(SIGMA_Y, vec(a, b))
