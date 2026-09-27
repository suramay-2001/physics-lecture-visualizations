/**
 * 2×2 operators as A = a₀I + a⃗·σ⃗ (W-L1 §3.2; landed at W0 because the operator-space resolver needs
 * it; numpy fixtures by a different algorithm — Taylor with scaling and squaring — follow in W1).
 */
import { type C, abs, add, c, div, expi, mul, scale, sub } from './complex'
import { type Mat, type Vec, canonicalPhase, dagger, det2, identity, isHermitian, madd, matEq, matmul, mscale, normalize, vec } from './linalg'
import { SIGMA_X, SIGMA_Y, SIGMA_Z, type Vec3 } from './spin'

/** M = a₀I + a⃗·σ⃗ with complex coefficients (any 2×2). */
export interface Decomp {
  a0: C
  a: [C, C, C]
}

const trace = (M: Mat): C => add(M[0][0], M[1][1])

/** a₀ = tr M / 2, a_k = tr(M σ_k) / 2 */
export function decompose(M: Mat): Decomp {
  return {
    a0: scale(trace(M), 0.5),
    a: [scale(trace(matmul(M, SIGMA_X)), 0.5), scale(trace(matmul(M, SIGMA_Y)), 0.5), scale(trace(matmul(M, SIGMA_Z)), 0.5)],
  }
}

export function compose(d: Decomp): Mat {
  return madd(
    madd(mscale(identity(2), d.a0), mscale(SIGMA_X, d.a[0])),
    madd(mscale(SIGMA_Y, d.a[1]), mscale(SIGMA_Z, d.a[2])),
  )
}

export interface HermDecomp {
  a0: number
  a: Vec3
}

/** Real (a₀, a⃗) of a Hermitian M; null ⇔ M is not Hermitian (within eps). */
export function decomposeHermitian(M: Mat, eps = 1e-9): HermDecomp | null {
  if (!isHermitian(M, eps)) return null
  const d = decompose(M)
  return { a0: d.a0.re, a: [d.a[0].re, d.a[1].re, d.a[2].re] }
}

export interface OpClass {
  hermitian: boolean
  antiHermitian: boolean
  unitary: boolean
  normal: boolean
  projector: boolean
  involution: boolean
  scalar: boolean
  rank: 0 | 1 | 2
}

export function classify(M: Mat, eps = 1e-9): OpClass {
  const Md = dagger(M)
  const I2 = identity(2)
  const hermitian = matEq(M, Md, eps)
  const antiHermitian = matEq(M, mscale(Md, -1), eps)
  const MMd = matmul(M, Md)
  const MdM = matmul(Md, M)
  const unitary = matEq(MdM, I2, eps)
  const normal = matEq(MMd, MdM, eps)
  const M2 = matmul(M, M)
  const projector = hermitian && matEq(M2, M, eps)
  const involution = matEq(M2, I2, eps)
  const d = decompose(M)
  const scalar = d.a.every((x) => abs(x) <= eps)
  const zero = M.every((row) => row.every((x) => abs(x) <= eps))
  const rank: 0 | 1 | 2 = zero ? 0 : abs(det2(M)) <= eps ? 1 : 2
  return { hermitian, antiHermitian, unitary, normal, projector, involution, scalar, rank }
}

/** Complex square root (principal branch). */
function csqrt(z: C): C {
  const r = abs(z)
  const re = Math.sqrt(Math.max(0, (r + z.re) / 2))
  const im = Math.sqrt(Math.max(0, (r - z.re) / 2))
  return c(re, z.im < 0 ? -im : im)
}
const cexp = (z: C): C => scale(expi(z.im), Math.exp(z.re))
const ccosh = (z: C): C => scale(add(cexp(z), cexp(scale(z, -1))), 0.5)
const csinh = (z: C): C => scale(sub(cexp(z), cexp(scale(z, -1))), 0.5)

/**
 * e^M for any 2×2 M. s = tr M / 2, N = M − sI (traceless, so N² = q² I), q² = −det N.
 * e^M = e^s (cosh q · I + (sinh q / q) · N). Both factors are even in q, so the branch of √(q²) is irrelevant.
 * q → 0: sinh q / q = 1 + q²/6 + q⁴/120 and cosh q = 1 + q²/2 + q⁴/24 when |q| < 1e-4 (covers nilpotent N).
 */
export function expm2(M: Mat): Mat {
  const s = scale(trace(M), 0.5)
  const N = madd(M, mscale(identity(2), scale(s, -1)))
  const q2 = scale(det2(N), -1)
  let ch: C
  let shq: C
  if (abs(q2) < 1e-8) {
    const q4 = mul(q2, q2)
    ch = add(add(c(1), scale(q2, 0.5)), scale(q4, 1 / 24))
    shq = add(add(c(1), scale(q2, 1 / 6)), scale(q4, 1 / 120))
  } else {
    const q = csqrt(q2)
    ch = ccosh(q)
    shq = div(csinh(q), q)
  }
  const es = cexp(s)
  return mscale(madd(mscale(identity(2), ch), mscale(N, shq)), es)
}

export interface Eigen2 {
  /** λ₊ = t/2 + √(t²/4 − det M), then λ₋ (complex in general) */
  values: [C, C]
  /** unit eigenvectors, first nonzero entry real ≥ 0; one vector when the matrix is defective */
  vectors: Vec[]
  defective: boolean
}

/**
 * Eigenvalues and eigenvectors of ANY 2×2 matrix (Lecture 3: a non-Hermitian R has eigenvalues ±i).
 * `eigenHermitian2` (spin.ts) is the Hermitian case with real, ordered values; this one never assumes Hermitian.
 * Eigenvector for λ: (M₀₁, λ − M₀₀) if M₀₁ ≠ 0, else (λ − M₁₁, M₁₀) if M₁₀ ≠ 0, else the basis vector.
 */
export function eigen2(M: Mat, eps = 1e-12): Eigen2 {
  const t = trace(M)
  const half = scale(t, 0.5)
  const root = csqrt(sub(mul(half, half), det2(M)))
  const values: [C, C] = [add(half, root), sub(half, root)]
  const diagonal = abs(M[0][1]) < eps && abs(M[1][0]) < eps
  const vectorFor = (lam: C): Vec => {
    if (abs(M[0][1]) >= eps) return vec(M[0][1], sub(lam, M[0][0]))
    if (abs(M[1][0]) >= eps) return vec(sub(lam, M[1][1]), M[1][0])
    // diagonal: λ is one of the diagonal entries, and its eigenvector is that entry's basis vector
    return abs(sub(lam, M[0][0])) <= abs(sub(lam, M[1][1])) ? vec(1, 0) : vec(0, 1)
  }
  const repeated = abs(root) < 1e-9
  if (repeated && !diagonal) return { values, vectors: [canonicalPhase(normalize(vectorFor(values[0])))], defective: true }
  if (repeated) return { values, vectors: [vec(1, 0), vec(0, 1)], defective: false }
  return { values, vectors: [canonicalPhase(normalize(vectorFor(values[0]))), canonicalPhase(normalize(vectorFor(values[1])))], defective: false }
}

/** Partial sum Σ_{k=0}^{K} M^k/k!, built term by term T_k = T_{k−1}M/k (Lecture 6: watch the series reach e^M). */
export function expmSeries(M: Mat, K: number): Mat {
  let term = identity(2)
  let sum = identity(2)
  for (let k = 1; k <= K; k++) {
    term = mscale(matmul(term, M), 1 / k)
    sum = madd(sum, term)
  }
  return sum
}

/**
 * The generator G of a one-parameter family U(φ) = e^{−iφG}, from the central difference
 * G ≈ i (U(h) − U(−h)) / 2h, error O(h²) (Lecture 6 §6.3: S_z generates R_z; Lecture 7 §7.3).
 */
export function generatorOf(U: (phi: number) => Mat, h = 1e-5): Mat {
  return mscale(madd(U(h), mscale(U(-h), -1)), c(0, 1 / (2 * h)))
}

/** e^{−iHt} (ħ = 1). */
export const evolve = (H: Mat, t: number): Mat => expm2(mscale(H, c(0, -t)))

/**
 * The unitary U = e^{−iτA} of a Hermitian A = a₀I + a⃗·σ⃗, read as geometry (the /lab Operator Lab, D-lab §2.2):
 * it turns every Bloch vector about â = a⃗/|a⃗| by the angle 2|a⃗|τ (right-handed) and multiplies the ket by the
 * global phase e^{−ia₀τ}. With a⃗ = 0 there is no axis: U is that phase alone. For A = S_z (a⃗ = ẑ/2) the angle is τ,
 * so U = R_z(τ). Null when A is not Hermitian (then U is not a turn). ħ = 1.
 */
export interface UnitaryAction {
  U: Mat
  axis: Vec3 | null
  angle: number
  phase: number
}
export function unitaryAction(A: Mat, tau: number, eps = 1e-9): UnitaryAction | null {
  const d = decomposeHermitian(A, eps)
  if (!d) return null
  const len = Math.hypot(d.a[0], d.a[1], d.a[2])
  return {
    U: expm2(mscale(A, c(0, -tau))),
    axis: len > eps ? [d.a[0] / len, d.a[1] / len, d.a[2] / len] : null,
    angle: 2 * len * tau,
    phase: -d.a0 * tau,
  }
}
