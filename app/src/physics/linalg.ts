/**
 * Complex vectors and matrices of any size. Spin-½ only needs 2×2, but the Gram–Schmidt
 * homework is 3×3 and future courses will need more, so nothing here assumes n = 2.
 * Matrices are row-major: M[row][col], so M[i][j] = ⟨i|M|j⟩.
 */
import { type C, ZERO, add, mul, conj, scale, abs2, approxEq, sub, c } from './complex'

export type Vec = C[]
export type Mat = C[][]

export const vec = (...xs: (C | number)[]): Vec => xs.map((x) => (typeof x === 'number' ? c(x) : x))
export const mat = (rows: (C | number)[][]): Mat => rows.map((r) => vec(...r))

export const identity = (n: number): Mat =>
  Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => c(i === j ? 1 : 0)))

/** ⟨a|b⟩ = Σ a_i* b_i — conjugate-linear in the first slot, as in the lecture. */
export function inner(a: Vec, b: Vec): C {
  return a.reduce((acc, ai, i) => add(acc, mul(conj(ai), b[i])), ZERO)
}

export const norm2 = (v: Vec): number => v.reduce((s, x) => s + abs2(x), 0)
export const norm = (v: Vec): number => Math.sqrt(norm2(v))
export const vscale = (v: Vec, k: C | number): Vec =>
  v.map((x) => (typeof k === 'number' ? scale(x, k) : mul(x, k)))
export const vadd = (a: Vec, b: Vec): Vec => a.map((x, i) => add(x, b[i]))
export const vsub = (a: Vec, b: Vec): Vec => a.map((x, i) => sub(x, b[i]))
export const normalize = (v: Vec): Vec => vscale(v, 1 / norm(v))

export const apply = (M: Mat, v: Vec): Vec =>
  M.map((row) => row.reduce((acc, m, k) => add(acc, mul(m, v[k])), ZERO))

export function matmul(A: Mat, B: Mat): Mat {
  return A.map((row) => B[0].map((_, j) => row.reduce((acc, a, k) => add(acc, mul(a, B[k][j])), ZERO)))
}

/** Conjugate transpose A†. */
export const dagger = (A: Mat): Mat => A[0].map((_, j) => A.map((row) => conj(row[j])))
export const mscale = (A: Mat, k: C | number): Mat => A.map((r) => vscale(r, k))
export const madd = (A: Mat, B: Mat): Mat => A.map((r, i) => vadd(r, B[i]))
export const msub = (A: Mat, B: Mat): Mat => A.map((r, i) => vsub(r, B[i]))

/** |a⟩⟨b| */
export const outer = (a: Vec, b: Vec): Mat => a.map((ai) => b.map((bj) => mul(ai, conj(bj))))

/** Columns are the given vectors: B_{o←e} when the vectors are basis e written in basis o. */
export const fromColumns = (cols: Vec[]): Mat => cols[0].map((_, i) => cols.map((col) => col[i]))
export const column = (M: Mat, j: number): Vec => M.map((row) => row[j])

export function matEq(A: Mat, B: Mat, eps = 1e-9): boolean {
  return A.every((row, i) => row.every((x, j) => approxEq(x, B[i][j], eps)))
}
export const isHermitian = (A: Mat, eps = 1e-9): boolean => matEq(A, dagger(A), eps)
export const isUnitary = (U: Mat, eps = 1e-9): boolean => matEq(matmul(dagger(U), U), identity(U.length), eps)

export function det2(M: Mat): C {
  return sub(mul(M[0][0], M[1][1]), mul(M[0][1], M[1][0]))
}

/**
 * Gram–Schmidt as taught in Lecture 4: normalize the first vector, subtract components
 * along earlier ones, normalize the remainder. Returns the steps so the UI can replay them.
 */
export function gramSchmidt(vs: Vec[]): { basis: Vec[]; steps: { raw: Vec; residual: Vec; e: Vec }[] } {
  const basis: Vec[] = []
  const steps: { raw: Vec; residual: Vec; e: Vec }[] = []
  for (const v of vs) {
    let w = v
    for (const e of basis) w = vsub(w, vscale(e, inner(e, v)))
    if (norm(w) < 1e-10) continue // linearly dependent: contributes nothing new
    const e = normalize(w)
    basis.push(e)
    steps.push({ raw: v, residual: w, e })
  }
  return { basis, steps }
}

/** Fix the global phase so the first non-negligible component is real and positive. */
export function canonicalPhase(v: Vec): Vec {
  const k = v.find((x) => abs2(x) > 1e-12)
  if (!k) return v
  const r = Math.sqrt(abs2(k))
  return vscale(v, c(k.re / r, -k.im / r))
}
