/**
 * Spin-½ physics in the conventions of the Physics 448 lectures.
 *
 * Units: ħ = 1 internally, so S_i = σ_i / 2 and outcomes are ±½. The UI appends "ħ".
 * Basis: every matrix here is in the z basis unless a function says otherwise.
 * Phases: |+x⟩ = (1, 1)/√2, |+y⟩ = (1, i)/√2 (Lecture 2), R_z(φ) = diag(e^{-iφ/2}, e^{iφ/2}) (Lecture 6).
 */
import { type C, c, I, abs2, conj, mul, expi, scale, neg, div } from './complex'
import {
  type Vec,
  type Mat,
  mat,
  vec,
  inner,
  apply,
  normalize,
  outer,
  identity,
  madd,
  mscale,
  canonicalPhase,
  dagger,
  matmul,
  fromColumns,
  isHermitian,
  norm2,
  vscale,
  norm,
  msub,
} from './linalg'

export type Vec3 = [number, number, number]

const r = Math.SQRT1_2

export const SIGMA_X: Mat = mat([[0, 1], [1, 0]])
export const SIGMA_Y: Mat = mat([[0, c(0, -1)], [I, 0]])
export const SIGMA_Z: Mat = mat([[1, 0], [0, -1]])
export const SX = mscale(SIGMA_X, 0.5)
export const SY = mscale(SIGMA_Y, 0.5)
export const SZ = mscale(SIGMA_Z, 0.5)

export const KET = {
  '+z': vec(1, 0),
  '-z': vec(0, 1),
  '+x': vec(r, r),
  '-x': vec(r, -r),
  '+y': vec(r, c(0, r)),
  '-y': vec(r, c(0, -r)),
} as const
export type NamedKet = keyof typeof KET

export const AXIS: Record<'x' | 'y' | 'z', Vec3> = { x: [1, 0, 0], y: [0, 1, 0], z: [0, 0, 1] }

/** n·σ for a unit (or any) 3-vector n. */
export function nDotSigma(n: Vec3): Mat {
  return madd(madd(mscale(SIGMA_X, n[0]), mscale(SIGMA_Y, n[1])), mscale(SIGMA_Z, n[2]))
}
/** S_n = (ħ/2) n·σ — the observable measured by a Stern–Gerlach device pointing along n. */
export const spinAlong = (n: Vec3): Mat => mscale(nDotSigma(n), 0.5)

/** Pure state on the Bloch sphere at polar angle θ (from +z) and azimuth φ (from +x toward +y). */
export function ketFromBloch(theta: number, phi: number): Vec {
  return vec(c(Math.cos(theta / 2)), scale(expi(phi), Math.sin(theta / 2)))
}

export function ketAlong(n: Vec3): Vec {
  const [x, y, z] = unit(n)
  // At a pole the azimuth is undefined; fix it at 0 so ketAlong(-z) = |1⟩ = KET['-z']. Without this,
  // Math.atan2(-0, -0) = -π turns the south pole into -|1⟩, a stray global phase that readouts show as a sign.
  const phi = Math.hypot(x, y) < 1e-12 ? 0 : Math.atan2(y, x)
  return ketFromBloch(Math.acos(Math.max(-1, Math.min(1, z))), phi)
}

/** Bloch vector r = 2(⟨Sx⟩, ⟨Sy⟩, ⟨Sz⟩) = (2 Re α*β, 2 Im α*β, |α|² − |β|²) — Lecture 6. */
export function blochVector(psi: Vec): Vec3 {
  const [a, b] = normalize(psi)
  const ab = mul(conj(a), b)
  return [2 * ab.re, 2 * ab.im, abs2(a) - abs2(b)]
}

export function blochAngles(psi: Vec): { theta: number; phi: number } {
  const [x, y, z] = blochVector(psi)
  return { theta: Math.acos(Math.max(-1, Math.min(1, z))), phi: Math.atan2(y, x) }
}

/** ⟨ψ|A|ψ⟩ (real for Hermitian A). */
/** ⟨ψ|A|ψ⟩ as a complex number, for any A (Lecture 3: it is real exactly when A is Hermitian). */
export const sandwich = (A: Mat, psi: Vec): C => inner(psi, apply(A, psi))

/**
 * ⟨A⟩ = ⟨ψ|A|ψ⟩ for a Hermitian A. Throws when the sandwich has an imaginary part: dropping it silently would
 * turn, e.g., ⟨[Sx, Sy]⟩ = i⟨Sz⟩ into 0 (found by the L3 and L7 planners). Use `sandwich` for other operators.
 */
export function expectation(A: Mat, psi: Vec): number {
  const z = sandwich(A, psi)
  if (Math.abs(z.im) > 1e-9 * Math.max(1, norm2(psi))) throw new Error('expectation: ⟨ψ|A|ψ⟩ is not real, so A is not Hermitian; use sandwich')
  return z.re
}

/** (ΔA)² = ⟨A²⟩ − ⟨A⟩² */
export function variance(A: Mat, psi: Vec): number {
  const m = expectation(A, psi)
  return Math.max(0, expectation(matmul(A, A), psi) - m * m)
}

/** Born rule: P = |⟨a|ψ⟩|² for a normalized outcome state |a⟩. */
export const prob = (a: Vec, psi: Vec): number => abs2(inner(a, psi))

/** P(+ along n | prepared along m) = (1 + n·m)/2 = cos²(angle/2). */
export const probUpAlong = (n: Vec3, m: Vec3): number => (1 + dot(unit(n), unit(m))) / 2

export interface Eigen {
  values: number[]
  vectors: Vec[]
}

/**
 * Eigen-decomposition of a 2×2 Hermitian matrix via M = a₀I + a·σ.
 * Eigenvalues a₀ ± |a|, eigenvectors are the spin states along ±a. Ordered largest first,
 * with the lecture's phase convention (first component real and positive).
 */
export function eigenHermitian2(M: Mat): Eigen {
  // a non-Hermitian matrix would silently get wrong, real eigenvalues (R = [[0,−1],[1,0]] gave [1, −1]); use eigen2
  if (!isHermitian(M, 1e-9)) throw new Error('eigenHermitian2: the matrix is not Hermitian; use operators.ts eigen2')
  const a0 = (M[0][0].re + M[1][1].re) / 2
  const a: Vec3 = [M[1][0].re, M[1][0].im, (M[0][0].re - M[1][1].re) / 2]
  const len = Math.hypot(...a)
  if (len < 1e-12) return { values: [a0, a0], vectors: [KET['+z'], KET['-z']] }
  const n = a.map((x) => x / len) as Vec3
  return {
    values: [a0 + len, a0 - len],
    vectors: [canonicalPhase(ketAlong(n)), canonicalPhase(ketAlong([-n[0], -n[1], -n[2]]))],
  }
}

/**
 * Lecture 3's Rule 3 as arithmetic: the chance p = ⟨ψ|P|ψ⟩ of the outcome whose projector is P, and the state
 * afterward, P|ψ⟩/√p. No re-phasing, so |+y⟩ → i|−z⟩ stays visible (the same state as |−z⟩). `post` is null when
 * the outcome cannot happen (p ≈ 0).
 */
export function collapse(P: Mat, psi: Vec): { p: number; post: Vec | null } {
  const kept = apply(P, psi)
  const p = norm2(kept)
  return { p, post: p < 1e-12 ? null : vscale(kept, 1 / Math.sqrt(p)) }
}

/** Projector |a⟩⟨a| */
export const projector = (a: Vec): Mat => outer(a, a)

/** Spectral construction A = Σ a_i |a_i⟩⟨a_i| (Lecture 3 §4). */
export function fromSpectrum(values: number[], vectors: Vec[]): Mat {
  return values.reduce<Mat>(
    (acc, v, i) => madd(acc, mscale(projector(normalize(vectors[i])), v)),
    mscale(identity(vectors[0].length), 0),
  )
}

/** Rotation about unit axis n by angle φ: e^{-iφ n·S} = cos(φ/2) I − i sin(φ/2) n·σ. */
export function rotation(n: Vec3, phi: number): Mat {
  const u = unit(n)
  return madd(mscale(identity(2), Math.cos(phi / 2)), mscale(nDotSigma(u), c(0, -Math.sin(phi / 2))))
}
export const Rz = (phi: number): Mat => mat([[expi(-phi / 2), 0], [0, expi(phi / 2)]])

/** Same physical state? Global phase is ignored: |⟨a|b⟩|² = 1. */
export const samePhysicalState = (a: Vec, b: Vec, eps = 1e-9): boolean =>
  Math.abs(prob(normalize(a), normalize(b)) - 1) < eps

/** Basis-change matrix B_{o←e}: columns are the new basis kets written in old coordinates. */
export const basisMatrix = (newBasis: Vec[]): Mat => fromColumns(newBasis)
/** Coordinates of ψ (given in the old basis) in the new basis: c_new = B† c_old. */
export const toBasis = (psiOld: Vec, newBasis: Vec[]): Vec => apply(dagger(basisMatrix(newBasis)), psiOld)
/** A_new = B† A_old B */
export const operatorInBasis = (A: Mat, newBasis: Vec[]): Mat => {
  const B = basisMatrix(newBasis)
  return matmul(matmul(dagger(B), A), B)
}

/** The notes' trial family (L2 p.8): (|+z⟩ + c|−z⟩)/√(1 + |c|²). Real c gives only the x–z plane; |c| = 1 gives 50/50 along z. */
export const ketFromCoeff = (coef: C): Vec => normalize(vec(1, coef))
/** The inverse of ketFromCoeff: c = ψ₁/ψ₀, or null when ψ has no |+z⟩ part (it is |−z⟩ up to phase). */
export function relativeCoeff(psi: Vec, eps = 1e-12): C | null {
  return abs2(psi[0]) < eps ? null : div(psi[1], psi[0])
}
/** Two orthonormal bases are mutually unbiased when every cross overlap |⟨a|b⟩|² is 1/dim (L2 p.10). */
export function mutuallyUnbiased(A: Vec[], B: Vec[], eps = 1e-9): boolean {
  const d = A.length
  return A.every((a) => B.every((b) => Math.abs(prob(a, b) - 1 / d) < eps))
}

/* ---- Lectures 4–7 helpers (numpy fixtures "lectures4to7") ---- */

/**
 * The lecture's back-substitution for an eigenvector (Lectures 4–5): a nonzero row (r₁, r₂) of M − λI says
 * r₁c₁ + r₂c₂ = 0, so c ∝ (r₂, −r₁). Independent of `eigenHermitian2` (which uses the a·σ geometry).
 */
export function eigenvectorFor(M: Mat, lambda: number | C, eps = 1e-12): Vec {
  const l = typeof lambda === 'number' ? c(lambda) : lambda
  const rows: [C, C][] = [
    [c(M[0][0].re - l.re, M[0][0].im - l.im), M[0][1]],
    [M[1][0], c(M[1][1].re - l.re, M[1][1].im - l.im)],
  ]
  const row = rows.find(([a, b]) => abs2(a) + abs2(b) > eps)
  if (!row) return vec(1, 0) // M = λI: every vector is an eigenvector
  return canonicalPhase(normalize(vec(row[1], scale(row[0], -1))))
}

const BASIS_KETS: Record<'x' | 'y' | 'z', Vec[]> = { x: [KET['+x'], KET['-x']], y: [KET['+y'], KET['-y']], z: [KET['+z'], KET['-z']] }
/**
 * B_{to←from}: the matrix that turns a state's `from`-basis coordinates into its `to`-basis coordinates
 * (Lecture 5, output ← input): B_{to←from} = B_{z←to}† B_{z←from}.
 */
export const basisChange = (from: 'x' | 'y' | 'z', to: 'x' | 'y' | 'z'): Mat =>
  matmul(dagger(basisMatrix(BASIS_KETS[to])), basisMatrix(BASIS_KETS[from]))

/** diag(1, e^{iφ}): the notes' phase matrix before the phase split (Lecture 6). */
export const phaseShift = (phi: number): Mat => mat([[1, 0], [0, expi(phi)]])

/** Rodrigues: r turned by φ about the unit axis n (Lecture 6: the SO(3) picture of a spin rotation). */
export function rotateBloch(n: Vec3, phi: number, r: Vec3): Vec3 {
  const k = unit(n)
  const cr = cross(k, r)
  const kd = dot(k, r) * (1 - Math.cos(phi))
  return [0, 1, 2].map((i) => r[i] * Math.cos(phi) + cr[i] * Math.sin(phi) + k[i] * kd) as Vec3
}

/** ΔA = √(⟨A²⟩ − ⟨A⟩²), the spread of single readings (Lectures 3 and 7). */
export const spread = (A: Mat, psi: Vec): number => Math.sqrt(variance(A, normalize(psi)))

/** (ΔS_x, ΔS_y, ΔS_z) read off a pure state's Bloch vector: ½√(1 − r_j²) each (ħ = 1; Lecture 7 §7.7). */
export const spreadsFromBloch = (r: Vec3): Vec3 => r.map((x) => 0.5 * Math.sqrt(Math.max(0, 1 - x * x))) as Vec3

/**
 * Robertson's bound for A, B on ψ (Lecture 7 §7.8–7.9): product ΔA·ΔB, bound ½|⟨ψ|[A, B]|ψ⟩|, their gap, and
 * whether the bound is met. Uses the complex sandwich: dropping its imaginary part would make the bound 0.
 */
export function uncertaintyCheck(A: Mat, B: Mat, psi: Vec, eps = 1e-9): { product: number; bound: number; slack: number; saturated: boolean } {
  const p = normalize(psi)
  const product = spread(A, p) * spread(B, p)
  const z = sandwich(msub(matmul(A, B), matmul(B, A)), p)
  const bound = 0.5 * Math.hypot(z.re, z.im)
  const slack = product - bound
  return { product, bound, slack, saturated: Math.abs(slack) < eps }
}

/** Angle between the RAYS of two states, η = arccos(|⟨a|b⟩| / ‖a‖‖b‖) ∈ [0, π/2] (Lecture 7 §7.1). */
export const rayAngle = (a: Vec, b: Vec): number => {
  const x = Math.sqrt(abs2(inner(a, b))) / (norm(a) * norm(b))
  return Math.acos(Math.min(1, x))
}
/** Angle between the two states' Bloch vectors ∈ [0, π]: twice the ray angle (Lecture 7 §7.1). */
export const blochAngle = (a: Vec, b: Vec): number => {
  const ra = blochVector(normalize(a))
  const rb = blochVector(normalize(b))
  return Math.acos(Math.max(-1, Math.min(1, dot(ra, rb))))
}

/**
 * The phase ⟨a|b⟩/|⟨a|b⟩| between two kets on ONE ray (Lecture 7 §7.2: R_z(2π)|ψ⟩ = −|ψ⟩ gives −1). Throws if
 * the kets are not the same state.
 */
export function relativeSign(a: Vec, b: Vec): C {
  if (!samePhysicalState(a, b)) throw new Error('relativeSign: the kets are different states')
  const z = inner(normalize(a), normalize(b))
  const m = Math.hypot(z.re, z.im)
  return c(z.re / m, z.im / m)
}

/** ‖P_k ⋯ P_1 ψ‖²: the chance that filters P_1, then P_2, … all pass (applied in array order; Lecture 7). */
export const jointProb = (projectors: Mat[], psi: Vec): number => norm2(projectors.reduce((v, P) => apply(P, v), normalize(psi)))

export interface Measurement {
  outcome: number // index into the basis
  value: number // eigenvalue (in units of ħ for spin)
  post: Vec // conditional state after the measurement
  probs: number[]
}

/** Ideal projective measurement of observable A on ψ, using the supplied random number u ∈ [0,1). */
export function measure(A: Mat, psi: Vec, u: number): Measurement {
  const { values, vectors } = eigenHermitian2(A)
  const probs = vectors.map((v) => prob(v, normalize(psi)))
  let acc = 0
  let outcome = probs.length - 1
  for (let i = 0; i < probs.length; i++) {
    acc += probs[i]
    if (u < acc) {
      outcome = i
      break
    }
  }
  return { outcome, value: values[outcome], post: vectors[outcome], probs }
}

// ---- small 3-vector helpers -------------------------------------------------
export const dot = (a: Vec3, b: Vec3): number => a[0] * b[0] + a[1] * b[1] + a[2] * b[2]
export const cross = (a: Vec3, b: Vec3): Vec3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]
export const unit = (a: Vec3): Vec3 => {
  const l = Math.hypot(...a) || 1
  return [a[0] / l, a[1] / l, a[2] / l]
}
export const neg3 = (a: Vec3): Vec3 => [-a[0], -a[1], -a[2]]
/** Unit vector in the x–z plane at angle θ from +z toward +x (a Stern–Gerlach tilt). */
export const tiltXZ = (theta: number): Vec3 => [Math.sin(theta), 0, Math.cos(theta)]

export { neg, type C }
