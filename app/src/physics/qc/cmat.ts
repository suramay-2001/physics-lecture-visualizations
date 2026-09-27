/**
 * n×n complex linear algebra for Physics 709 (P-709-map §(b) "linalg-n"; chapters F2–F4 and everything after).
 * The 448 engine's `linalg.ts` already works for any size (matmul, dagger, inner, outer, Gram–Schmidt); this module
 * adds what needs an algorithm: determinant, inverse, rank, the Hermitian eigenproblem (cyclic Jacobi), functions of a
 * Hermitian matrix, the SVD (one-sided Jacobi), the polar decomposition, projections and basis changes.
 *
 * Conventions: matrices are row-major, M[i][j] = ⟨i|M|j⟩; inner products are conjugate-linear in the FIRST slot;
 * `eigh` returns eigenvalues in ascending order (as numpy does) with unit eigenvectors whose first non-negligible
 * component is real and positive (the 448 phase convention); `svd` returns singular values in descending order.
 * Every function is checked against an independent numpy route (pipeline/make_qc_fixtures.py, block "cmat").
 * Size budget (decisions/qc709-map.md): eigh up to 64×64.
 */
import { type C, ZERO, abs, abs2, add, c, conj, div, mul, sub } from '../complex'
import {
  type Mat,
  type Vec,
  apply,
  canonicalPhase,
  dagger,
  fromColumns,
  identity,
  inner,
  madd,
  matmul,
  msub,
  norm,
  outer,
  vscale,
  vsub,
} from '../linalg'
import { basisMatrix } from '../spin'

export type { Mat, Vec }
export { apply, column, dagger, fromColumns, identity, inner, isHermitian, isUnitary, madd, matEq, matmul, maxDiff, mscale, msub, outer } from '../linalg'
export { rayAngle as hermitianAngle } from '../spin'

/* ---------------------------------------------------------------- basics ---------------------------------------------------------------- */

/** An r×cols matrix of zeros. */
export const zeros = (r: number, cols = r): Mat => Array.from({ length: r }, () => Array.from({ length: cols }, () => ZERO))

/** The largest |M_ij| (0 for an empty matrix). */
export const maxAbs = (M: Mat): number => M.reduce((m, row) => row.reduce((mm, x) => Math.max(mm, abs(x)), m), 0)

function assertSquare(M: Mat, who: string): number {
  const n = M.length
  if (n === 0 || M.some((row) => row.length !== n)) throw new Error(`${who}: the matrix must be square and non-empty`)
  return n
}

/** A ⊗ B (Kronecker product; any shapes). Row index i·rows(B) + k, column index j·cols(B) + l. */
export function kronM(A: Mat, B: Mat): Mat {
  const ra = A.length
  const ca = A[0].length
  const rb = B.length
  const cb = B[0].length
  const out: Mat = new Array(ra * rb)
  for (let i = 0; i < ra; i++)
    for (let k = 0; k < rb; k++) {
      const row: C[] = new Array(ca * cb)
      for (let j = 0; j < ca; j++) for (let l = 0; l < cb; l++) row[j * cb + l] = mul(A[i][j], B[k][l])
      out[i * rb + k] = row
    }
  return out
}
/** A₁ ⊗ A₂ ⊗ … (left to right: A₁ is the leftmost factor, i.e. qubit 0 when each factor is one qubit). */
export const kronMAll = (Ms: readonly Mat[]): Mat => Ms.reduce((acc, M) => kronM(acc, M))

/** tr M = Σ M_ii */
export function traceN(M: Mat): C {
  const n = assertSquare(M, 'traceN')
  let t = ZERO
  for (let i = 0; i < n; i++) t = add(t, M[i][i])
  return t
}

/** det M by LU decomposition with partial pivoting (each row swap flips the sign). */
export function detN(M: Mat): C {
  const n = assertSquare(M, 'detN')
  const A = M.map((row) => row.slice())
  let det: C = c(1)
  for (let k = 0; k < n; k++) {
    let p = k
    for (let i = k + 1; i < n; i++) if (abs(A[i][k]) > abs(A[p][k])) p = i
    if (abs(A[p][k]) === 0) return ZERO
    if (p !== k) {
      ;[A[p], A[k]] = [A[k], A[p]]
      det = c(-det.re, -det.im)
    }
    det = mul(det, A[k][k])
    for (let i = k + 1; i < n; i++) {
      const f = div(A[i][k], A[k][k])
      for (let j = k; j < n; j++) A[i][j] = sub(A[i][j], mul(f, A[k][j]))
    }
  }
  return det
}

/**
 * M⁻¹ by Gauss–Jordan elimination with partial pivoting, or null when M is singular: a pivot smaller than
 * `rtol`·max|M_ij| (default 1e-12) counts as zero.
 */
export function invN(M: Mat, rtol = 1e-12): Mat | null {
  const n = assertSquare(M, 'invN')
  const scaleM = maxAbs(M)
  if (scaleM === 0) return null
  const A = M.map((row) => row.slice())
  const B = identity(n)
  for (let k = 0; k < n; k++) {
    let p = k
    for (let i = k + 1; i < n; i++) if (abs(A[i][k]) > abs(A[p][k])) p = i
    if (abs(A[p][k]) <= rtol * scaleM) return null
    ;[A[p], A[k]] = [A[k], A[p]]
    ;[B[p], B[k]] = [B[k], B[p]]
    const piv = A[k][k]
    for (let j = 0; j < n; j++) {
      A[k][j] = div(A[k][j], piv)
      B[k][j] = div(B[k][j], piv)
    }
    for (let i = 0; i < n; i++) {
      if (i === k) continue
      const f = A[i][k]
      if (f.re === 0 && f.im === 0) continue
      for (let j = 0; j < n; j++) {
        A[i][j] = sub(A[i][j], mul(f, A[k][j]))
        B[i][j] = sub(B[i][j], mul(f, B[k][j]))
      }
    }
  }
  return B
}

/** rank M = the number of singular values above `rtol`·(largest singular value) (default rtol 1e-10). Any shape. */
export function rankN(M: Mat, rtol = 1e-10): number {
  const { s } = svd(M)
  if (s.length === 0 || s[0] === 0) return 0
  return s.filter((x) => x > rtol * s[0]).length
}

/* ------------------------------------------------------- Hermitian eigenproblem ------------------------------------------------------- */

export interface Eigh {
  /** ascending */
  values: number[]
  /** vectors[k] is the unit eigenvector for values[k]; first non-negligible component real ≥ 0 */
  vectors: Vec[]
}

/**
 * The 2×2 unitary G that diagonalizes the Hermitian block [[a, b], [b̄, d]] (a, d real, b = g e^{iφ} ≠ 0) as G†BG.
 * G = diag(1, e^{−iφ}) · [[cos, sin], [−sin, cos]]: the phase makes the block real symmetric, then the classic Jacobi
 * rotation (tan of the angle t = sgn θ / (|θ| + √(θ² + 1)), θ = (d − a)/2g; Numerical Recipes §11.1) zeroes it.
 * Returns cos, sin and e^{−iφ} as (er, ei).
 */
function jacobiRotation(a: number, d: number, br: number, bi: number): { cs: number; sn: number; er: number; ei: number } {
  const g = Math.hypot(br, bi)
  const theta = (d - a) / (2 * g)
  const t = Math.abs(theta) > 1e150 ? 1 / (2 * theta) : Math.sign(theta || 1) / (Math.abs(theta) + Math.sqrt(theta * theta + 1))
  const cs = 1 / Math.sqrt(t * t + 1)
  return { cs, sn: t * cs, er: br / g, ei: -bi / g }
}

/**
 * Eigenvalues and eigenvectors of a Hermitian matrix by the cyclic Jacobi method: sweep over every pair (p, q) and
 * zero H_pq with a complex plane rotation, until the off-diagonal part is below 1e-15 of ‖H‖_F. Quadratic
 * convergence; robust for repeated eigenvalues (the eigenvectors stay orthonormal). Throws when H is not square or
 * not Hermitian (within 1e-8·max(1, max|H_ij|)); the input is symmetrized before the sweep.
 */
export function eigh(H: Mat, maxSweeps = 100): Eigh {
  const n = assertSquare(H, 'eigh')
  const tolH = 1e-8 * Math.max(1, maxAbs(H))
  for (let i = 0; i < n; i++)
    for (let j = i; j < n; j++)
      if (abs(sub(H[i][j], conj(H[j][i]))) > tolH) throw new Error('eigh: the matrix is not Hermitian')
  const ar = new Float64Array(n * n)
  const ai = new Float64Array(n * n)
  const vr = new Float64Array(n * n)
  const vi = new Float64Array(n * n)
  let fro = 0
  for (let i = 0; i < n; i++) {
    vr[i * n + i] = 1
    for (let j = 0; j < n; j++) {
      ar[i * n + j] = (H[i][j].re + H[j][i].re) / 2
      ai[i * n + j] = (H[i][j].im - H[j][i].im) / 2
      fro += ar[i * n + j] ** 2 + ai[i * n + j] ** 2
    }
  }
  const stop = (1e-15 * 1e-15) * fro
  for (let sweep = 0; sweep < maxSweeps; sweep++) {
    let off = 0
    for (let p = 0; p < n; p++) for (let q = p + 1; q < n; q++) off += ar[p * n + q] ** 2 + ai[p * n + q] ** 2
    if (off <= stop || off === 0) break
    for (let p = 0; p < n; p++)
      for (let q = p + 1; q < n; q++) {
        const br = ar[p * n + q]
        const bi = ai[p * n + q]
        if (br === 0 && bi === 0) continue
        const { cs, sn, er, ei } = jacobiRotation(ar[p * n + p], ar[q * n + q], br, bi)
        // A ← A·G on columns p, q:  A_kp ← cs·A_kp − sn·e·A_kq,  A_kq ← sn·A_kp + cs·e·A_kq  (e = er + i·ei)
        for (let k = 0; k < n; k++) {
          const xr = ar[k * n + p], xi = ai[k * n + p], yr = ar[k * n + q], yi = ai[k * n + q]
          const eyr = er * yr - ei * yi, eyi = er * yi + ei * yr
          ar[k * n + p] = cs * xr - sn * eyr
          ai[k * n + p] = cs * xi - sn * eyi
          ar[k * n + q] = sn * xr + cs * eyr
          ai[k * n + q] = sn * xi + cs * eyi
        }
        // A ← G†·A on rows p, q:  A_pk ← cs·A_pk − sn·ē·A_qk,  A_qk ← sn·A_pk + cs·ē·A_qk
        for (let k = 0; k < n; k++) {
          const xr = ar[p * n + k], xi = ai[p * n + k], yr = ar[q * n + k], yi = ai[q * n + k]
          const eyr = er * yr + ei * yi, eyi = er * yi - ei * yr
          ar[p * n + k] = cs * xr - sn * eyr
          ai[p * n + k] = cs * xi - sn * eyi
          ar[q * n + k] = sn * xr + cs * eyr
          ai[q * n + k] = sn * xi + cs * eyi
        }
        ar[p * n + q] = ai[p * n + q] = ar[q * n + p] = ai[q * n + p] = 0
        ai[p * n + p] = ai[q * n + q] = 0
        // V ← V·G
        for (let k = 0; k < n; k++) {
          const xr = vr[k * n + p], xi = vi[k * n + p], yr = vr[k * n + q], yi = vi[k * n + q]
          const eyr = er * yr - ei * yi, eyi = er * yi + ei * yr
          vr[k * n + p] = cs * xr - sn * eyr
          vi[k * n + p] = cs * xi - sn * eyi
          vr[k * n + q] = sn * xr + cs * eyr
          vi[k * n + q] = sn * xi + cs * eyi
        }
      }
  }
  const order = Array.from({ length: n }, (_, k) => k).sort((a, b) => ar[a * n + a] - ar[b * n + b])
  return {
    values: order.map((k) => ar[k * n + k]),
    vectors: order.map((k) => canonicalPhase(Array.from({ length: n }, (_, i) => c(vr[i * n + k], vi[i * n + k])))),
  }
}

/** Σ_k w_k |v_k⟩⟨v_k| */
export function fromEigen(weights: readonly (C | number)[], vectors: readonly Vec[]): Mat {
  const n = vectors[0].length
  let M = zeros(n)
  vectors.forEach((v, k) => {
    const w = weights[k]
    const wc = typeof w === 'number' ? c(w) : w
    if (wc.re !== 0 || wc.im !== 0) M = madd(M, outer(vscale(v, wc), v))
  })
  return M
}

/** f(H) = Σ f(λ_k)|v_k⟩⟨v_k| for a Hermitian H (f may return a complex number). */
export function funcHermitian(H: Mat, f: (x: number) => C | number): Mat {
  const { values, vectors } = eigh(H)
  return fromEigen(values.map(f), vectors)
}

function psdEigen(M: Mat, who: string): Eigh {
  const e = eigh(M)
  const floor = -1e-9 * Math.max(1, Math.abs(e.values[e.values.length - 1]))
  if (e.values[0] < floor) throw new Error(`${who}: the matrix is not positive semidefinite (eigenvalue ${e.values[0]})`)
  return e
}

/**
 * √M for a positive-semidefinite Hermitian M. Eigenvalues below 1e-14·max|λ| are rounding noise around 0 and are set
 * to 0 (otherwise √(1e-17) ≈ 3e-9 would leak into, e.g., the fidelity of a pure state); an eigenvalue below −1e-9
 * means M is not PSD, and it throws.
 */
export function sqrtPSD(M: Mat): Mat {
  const e = psdEigen(M, 'sqrtPSD')
  const floor = 1e-14 * Math.max(Math.abs(e.values[0]), Math.abs(e.values[e.values.length - 1]))
  return fromEigen(e.values.map((x) => (x <= floor ? 0 : Math.sqrt(x))), e.vectors)
}

/** log M (natural log) for a positive-DEFINITE Hermitian M, or null when an eigenvalue ≤ `eps` (the log diverges). */
export function logPSD(M: Mat, eps = 1e-14): Mat | null {
  const e = eigh(M)
  if (e.values[0] <= eps) return null
  return fromEigen(e.values.map(Math.log), e.vectors)
}

/** e^{−iHt} for a Hermitian H (ħ = 1), through the eigenbasis: Σ e^{−iλ_k t}|v_k⟩⟨v_k|. */
export const expmHermitian = (H: Mat, t = 1): Mat => funcHermitian(H, (x) => c(Math.cos(x * t), -Math.sin(x * t)))

/**
 * A common orthonormal eigenbasis of two COMMUTING Hermitian matrices (F4 "commuting"), or null when ‖[A, B]‖ > eps.
 * Diagonalize A, then diagonalize B inside each eigenspace of A (eigenvalues of A closer than `eps`·scale are one
 * eigenspace). The pairs (valuesA[k], valuesB[k]) label vectors[k].
 */
export function simultaneousEigenbasis(A: Mat, B: Mat, eps = 1e-9): { vectors: Vec[]; valuesA: number[]; valuesB: number[] } | null {
  const comm = msub(matmul(A, B), matmul(B, A))
  const scaleAB = Math.max(1, maxAbs(A), maxAbs(B))
  if (maxAbs(comm) > eps * scaleAB * scaleAB) return null
  const ea = eigh(A)
  const vectors: Vec[] = []
  const valuesA: number[] = []
  const valuesB: number[] = []
  const tol = 1e-7 * scaleAB
  let start = 0
  while (start < ea.values.length) {
    let end = start + 1
    while (end < ea.values.length && ea.values[end] - ea.values[end - 1] < tol) end++
    const Q = ea.vectors.slice(start, end)
    // B restricted to the eigenspace: Q†BQ
    const BQ = Q.map((qi) => Q.map((qj) => inner(qi, apply(B, qj))))
    const eb = eigh(BQ)
    eb.vectors.forEach((w, k) => {
      const v = canonicalPhase(Q.reduce<Vec>((acc, q, j) => acc.map((x, i) => add(x, mul(q[i], w[j]))), Q[0].map(() => ZERO)))
      vectors.push(v)
      valuesA.push(ea.values.slice(start, end).reduce((s, x) => s + x, 0) / (end - start))
      valuesB.push(eb.values[k])
    })
    start = end
  }
  return { vectors, valuesA, valuesB }
}

/* ------------------------------------------------------------------ SVD ------------------------------------------------------------------ */

export interface SVD {
  /** m×k, orthonormal columns (k = min(m, n)) */
  U: Mat
  /** k singular values, descending, ≥ 0 */
  s: number[]
  /** n×k, orthonormal columns */
  V: Mat
}

/**
 * Thin singular value decomposition M = U·diag(s)·V† of any m×n complex matrix, by one-sided (Hestenes) Jacobi:
 * rotate pairs of columns until all columns are mutually orthogonal; the column lengths are the singular values.
 * Columns of U for zero singular values are completed to an orthonormal set (so a square M gets a unitary U).
 * Each pair (u_k, v_k) is phased so that v_k's first non-negligible component is real ≥ 0.
 */
export function svd(M: Mat, maxSweeps = 100): SVD {
  const m = M.length
  const n = M[0]?.length ?? 0
  if (m === 0 || n === 0 || M.some((row) => row.length !== n)) throw new Error('svd: the matrix must be rectangular and non-empty')
  if (m < n) {
    const t = svd(dagger(M), maxSweeps)
    return { U: t.V, s: t.s, V: t.U }
  }
  const aR = Array.from({ length: n }, (_, j) => Float64Array.from(M, (row) => row[j].re))
  const aI = Array.from({ length: n }, (_, j) => Float64Array.from(M, (row) => row[j].im))
  const vR = Array.from({ length: n }, (_, j) => Float64Array.from({ length: n }, (_, i) => (i === j ? 1 : 0)))
  const vI = Array.from({ length: n }, () => new Float64Array(n))
  const rotate = (xr: Float64Array, xi: Float64Array, yr: Float64Array, yi: Float64Array, cs: number, sn: number, er: number, ei: number) => {
    for (let k = 0; k < xr.length; k++) {
      const eyr = er * yr[k] - ei * yi[k], eyi = er * yi[k] + ei * yr[k]
      const x0 = xr[k], x1 = xi[k]
      xr[k] = cs * x0 - sn * eyr
      xi[k] = cs * x1 - sn * eyi
      yr[k] = sn * x0 + cs * eyr
      yi[k] = sn * x1 + cs * eyi
    }
  }
  for (let sweep = 0; sweep < maxSweeps; sweep++) {
    let rotated = false
    for (let p = 0; p < n; p++)
      for (let q = p + 1; q < n; q++) {
        let alpha = 0, beta = 0, gr = 0, gi = 0
        for (let k = 0; k < m; k++) {
          alpha += aR[p][k] ** 2 + aI[p][k] ** 2
          beta += aR[q][k] ** 2 + aI[q][k] ** 2
          // γ = a_p† a_q
          gr += aR[p][k] * aR[q][k] + aI[p][k] * aI[q][k]
          gi += aR[p][k] * aI[q][k] - aI[p][k] * aR[q][k]
        }
        const g = Math.hypot(gr, gi)
        if (g === 0 || g <= 1e-15 * Math.sqrt(alpha * beta)) continue
        rotated = true
        const { cs, sn, er, ei } = jacobiRotation(alpha, beta, gr, gi)
        rotate(aR[p], aI[p], aR[q], aI[q], cs, sn, er, ei)
        rotate(vR[p], vI[p], vR[q], vI[q], cs, sn, er, ei)
      }
    if (!rotated) break
  }
  const sv = aR.map((col, j) => Math.sqrt(col.reduce((s, x, k) => s + x * x + aI[j][k] ** 2, 0)))
  const order = Array.from({ length: n }, (_, j) => j).sort((a, b) => sv[b] - sv[a])
  const s = order.map((j) => sv[j])
  const tiny = Math.max(s[0], 1e-300) * 1e-13
  const uCols: Vec[] = []
  const vCols: Vec[] = []
  for (const j of order) {
    let v: Vec = Array.from({ length: n }, (_, i) => c(vR[j][i], vI[j][i]))
    let u: Vec | null = sv[j] > tiny ? Array.from({ length: m }, (_, i) => c(aR[j][i] / sv[j], aI[j][i] / sv[j])) : null
    const lead = v.find((x) => abs2(x) > 1e-12)
    if (lead) {
      const r = abs(lead)
      const ph = c(lead.re / r, -lead.im / r)
      v = vscale(v, ph)
      if (u) u = vscale(u, ph)
    }
    vCols.push(v)
    uCols.push(u ?? [])
  }
  // complete U's columns for zero singular values with the standard basis, by Gram–Schmidt
  for (let j = 0; j < n; j++) {
    if (uCols[j].length) continue
    for (let e = 0; e < m; e++) {
      let w: Vec = Array.from({ length: m }, (_, i) => c(i === e ? 1 : 0))
      for (const u of uCols) if (u.length) w = vsub(w, vscale(u, inner(u, w)))
      const nw = norm(w)
      if (nw > 1e-6) {
        uCols[j] = vscale(w, 1 / nw)
        break
      }
    }
  }
  return { U: fromColumns(uCols), s, V: fromColumns(vCols) }
}

/** Right polar decomposition M = U·P of a square M: U unitary, P = √(M†M) positive semidefinite (Bergou's A = U|A|). */
export function polar(M: Mat): { U: Mat; P: Mat } {
  assertSquare(M, 'polar')
  const { U, s, V } = svd(M)
  const Vd = dagger(V)
  return { U: matmul(U, Vd), P: matmul(matmul(V, s.map((x, i) => s.map((_, j) => c(i === j ? x : 0)))), Vd) }
}

/* ---------------------------------------------------- vectors, projections, bases ---------------------------------------------------- */

/** An orthonormal basis of span(vs) by Gram–Schmidt; vectors whose residual is below `rtol`·‖v‖ add nothing. */
export function orthonormalize(vs: readonly Vec[], rtol = 1e-10): Vec[] {
  const out: Vec[] = []
  for (const v of vs) {
    let w = v
    for (const e of out) w = vsub(w, vscale(e, inner(e, w)))
    const nw = norm(w)
    if (nw > rtol * Math.max(norm(v), 1e-300)) out.push(vscale(w, 1 / nw))
  }
  return out
}

/** The orthogonal projector onto span(vs): Σ|e_k⟩⟨e_k| over an orthonormal basis e of the span. */
export function projectorOnto(vs: readonly Vec[]): Mat {
  const es = orthonormalize(vs)
  return es.reduce((P, e) => madd(P, outer(e, e)), zeros(vs[0].length))
}

/** The shadow of v on span(vs): Σ_k |e_k⟩⟨e_k|v⟩ (F2 "shadow"; vs need not be orthonormal or independent). */
export function projectOnto(v: Vec, vs: readonly Vec[]): Vec {
  return orthonormalize(vs).reduce((acc, e) => acc.map((x, i) => add(x, mul(e[i], inner(e, v)))), v.map(() => ZERO))
}

/**
 * The angle between two vectors as arrows, arccos(Re⟨a|b⟩ / ‖a‖‖b‖) ∈ [0, π]: the law-of-cosines angle for real
 * vectors (F2 D2). For the angle between two quantum states' RAYS use `hermitianAngle` (= 448's rayAngle, ∈ [0, π/2]).
 */
export function angleBetween(a: Vec, b: Vec): number {
  const x = inner(a, b).re / (norm(a) * norm(b))
  return Math.acos(Math.max(-1, Math.min(1, x)))
}

/** Are the vectors linearly independent? Each Gram–Schmidt residual must exceed `rtol`·‖v‖ (F2 "independence"). */
export const isIndependent = (vs: readonly Vec[], rtol = 1e-10): boolean => orthonormalize(vs, rtol).length === vs.length

/**
 * The unique components c of ψ in a basis b (ψ = Σ c_k b_k), for any basis of the whole space (not necessarily
 * orthonormal); null when the vectors are not a basis. For an orthonormal basis c_k = ⟨b_k|ψ⟩ (F2 D5).
 */
export function components(psi: Vec, basis: readonly Vec[]): Vec | null {
  if (basis.length !== psi.length) return null
  const Binv = invN(fromColumns([...basis]))
  return Binv ? apply(Binv, psi) : null
}

/** ⟨a, b⟩_M = a†Mb, an inner product when M is Hermitian positive definite (F2 Formal). */
export const weightedInner = (M: Mat, a: Vec, b: Vec): C => inner(a, apply(M, b))

/**
 * The change-of-basis matrix U_ij = ⟨new_i|old_j⟩ (the notes' U; decisions C7: U_notes = B_448†), so coordinates
 * change as d = U c and operators as A' = U A U†. With the old basis omitted it is the standard basis, and
 * U = basisMatrix(new)† (spin.ts). The notes' z→x U is H.
 */
export function changeU(newBasis: readonly Vec[], oldBasis?: readonly Vec[]): Mat {
  const Bn = dagger(basisMatrix([...newBasis]))
  return oldBasis ? matmul(Bn, basisMatrix([...oldBasis])) : Bn
}

/* ------------------------------------------------------------- randomness ------------------------------------------------------------- */

/** A standard normal sample from a uniform generator (Box–Muller). */
export function gaussian(rand: () => number): number {
  const u = 1 - rand()
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * rand())
}

/** A complex Gaussian matrix (entries (x + iy)/√2 with x, y standard normal). */
export const ginibre = (r: number, cols: number, rand: () => number): Mat =>
  Array.from({ length: r }, () => Array.from({ length: cols }, () => c(gaussian(rand) / Math.SQRT2, gaussian(rand) / Math.SQRT2)))

/** A Haar-random d×d unitary: Gram–Schmidt (QR with a positive diagonal R) of a Ginibre matrix. */
export function randomUnitary(d: number, rand: () => number): Mat {
  const G = ginibre(d, d, rand)
  const cols = orthonormalize(Array.from({ length: d }, (_, j) => G.map((row) => row[j])), 1e-8)
  if (cols.length !== d) return randomUnitary(d, rand)
  return fromColumns(cols)
}

/** A random Hermitian matrix (G + G†)/2 with G Ginibre. */
export function randomHermitian(d: number, rand: () => number): Mat {
  const G = ginibre(d, d, rand)
  return madd(G, dagger(G)).map((row) => row.map((x) => c(x.re / 2, x.im / 2)))
}
