/**
 * Density matrices of n qubits (P-709-map §(b) "density"; chapters Q6, Q7). The 448 `density.ts` covers one qubit
 * through its Bloch vector; this module works for any register up to 5 qubits (32×32, decisions/qc709-map.md), with
 * partial traces over ANY subset of qubits, the partial transpose, Schmidt decompositions, purification and the
 * distances between states. Fidelity is the ROOT fidelity F = Tr√(√ρ σ √ρ) (Bergou 2.61; decisions C8); Bergou
 * Ch. 8's ⟨ψ|ρ|ψ⟩ is its square, `fidelitySq`. Qubit order as in state.ts (q0 = most significant bit).
 */
import { ZERO, abs2, add, c, conj, mul } from '../complex'
import { type Mat, type Vec, column, dagger, fromColumns, inner, madd, matmul, mscale, norm, outer, vscale, vsub } from '../linalg'
import { eigh, expmHermitian, gaussian, maxAbs, sqrtPSD, svd, traceN } from './cmat'
import { checkWires, coefMatrix, nQubits, qubitMask, subsetOffsets } from './state'

/** Density features stop at this many qubits (32×32). */
export const MAX_DENSITY_QUBITS = 5

const isMat = (x: Vec | Mat): x is Mat => Array.isArray(x[0])

/** |ψ⟩⟨ψ| (a pure state's density matrix; ψ is not renormalized). */
export const densityOf = (psi: Vec): Mat => outer(psi, psi)

/** Σ w_k |ψ_k⟩⟨ψ_k| (weights not renormalized). */
export function mixtureN(parts: readonly { w: number; psi: Vec }[]): Mat {
  return parts.map((p) => mscale(outer(p.psi, p.psi), p.w)).reduce((a, b) => madd(a, b))
}

/** A state as a density matrix: a Vec becomes |ψ⟩⟨ψ|, a Mat is returned as is. */
export const asDensity = (x: Vec | Mat): Mat => (isMat(x) ? x : densityOf(x))

/** Is ρ a density matrix? Hermitian, Tr ρ = 1 and every eigenvalue ≥ −eps. */
export function isDensity(rho: Mat, eps = 1e-9): boolean {
  const n = rho.length
  if (!n || rho.some((row) => row.length !== n)) return false
  for (let i = 0; i < n; i++) for (let j = i; j < n; j++) if (Math.hypot(rho[i][j].re - rho[j][i].re, rho[i][j].im + rho[j][i].im) > eps) return false
  const t = traceN(rho)
  if (Math.abs(t.re - 1) > eps || Math.abs(t.im) > eps) return false
  return eigh(rho).values[0] >= -eps
}

/** Tr ρ² = Σ_ij ρ_ij ρ_ji (1 for a pure state, 1/d for the maximally mixed state). */
export function purityN(rho: Mat): number {
  let s = 0
  for (let i = 0; i < rho.length; i++) for (let j = 0; j < rho.length; j++) s += mul(rho[i][j], rho[j][i]).re
  return s
}

/**
 * Tr over the qubits in `traceOut`: the reduced density matrix of the remaining qubits, which keep their original
 * (ascending) order. (ρ_A)_{ab} = Σ_t ρ_{(a,t),(b,t)}.
 */
export function partialTrace(rho: Mat, traceOut: readonly number[]): Mat {
  const n = nQubits(rho.length)
  if (traceOut.length === 0) return rho.map((row) => row.slice())
  checkWires(n, traceOut, [], 'partialTrace')
  const keep = Array.from({ length: n }, (_, k) => k).filter((q) => !traceOut.includes(q))
  const offK = subsetOffsets(keep, n)
  const offT = subsetOffsets(traceOut, n)
  return offK.map((ia) =>
    offK.map((ib) => {
      let s = ZERO
      for (const t of offT) s = add(s, rho[ia | t][ib | t])
      return s
    }),
  )
}

/**
 * The reduced state of the qubits `keep` (in the order given, keep[0] most significant) straight from a pure state:
 * ρ_A = C C† with C the coefficient matrix of the cut keep | rest. Works to the 10-qubit cap without forming |ψ⟩⟨ψ|.
 */
export function reducedDensity(psi: Vec, keep: readonly number[]): Mat {
  const C = coefMatrix(psi, keep)
  return matmul(C, dagger(C))
}

/**
 * The Bloch vector r = (Tr ρ_q σ_x, Tr ρ_q σ_y, Tr ρ_q σ_z) of qubit q of a pure state (Vec) or a density matrix (Mat):
 * r_x = 2 Re ρ₀₁, r_y = −2 Im ρ₀₁, r_z = ρ₀₀ − ρ₁₁. |r| < 1 means qubit q is entangled with (or mixed by) the rest.
 */
export function reducedBloch(state: Vec | Mat, q: number): [number, number, number] {
  let r1: Mat
  if (isMat(state)) {
    const n = nQubits(state.length)
    r1 = partialTrace(state, Array.from({ length: n }, (_, k) => k).filter((k) => k !== q))
  } else r1 = reducedDensity(state, [q])
  return [2 * r1[0][1].re, -2 * r1[0][1].im, r1[0][0].re - r1[1][1].re]
}

/**
 * The partial transpose on `qubits`: swap those qubits' bits between the row and the column index,
 * (ρ^{T_S})_{ij} = ρ_{i'j'}. A negative eigenvalue proves entanglement (Peres; Q10).
 */
export function ptranspose(rho: Mat, qubits: readonly number[]): Mat {
  const n = nQubits(rho.length)
  const m = qubits.reduce((acc, q) => acc | qubitMask(q, n), 0)
  return rho.map((row, i) => row.map((_, j) => rho[(i & ~m) | (j & m)][(j & ~m) | (i & m)]))
}

export interface Schmidt {
  /** Schmidt coefficients λ_k > 0, descending, Σ λ_k² = ‖ψ‖² */
  coeffs: number[]
  /** orthonormal states of the qubits A (in the order given) */
  a: Vec[]
  /** orthonormal states of the other qubits (ascending order) */
  b: Vec[]
  rank: number
}

/**
 * ψ = Σ_k λ_k |a_k⟩|b_k⟩ across the cut A | rest, from the SVD of the coefficient matrix C = U diag(λ) V†:
 * a_k = U's column k, b_k = the conjugate of V's column k. Coefficients below `rtol`·λ₁ are dropped.
 */
export function schmidt(psi: Vec, A: readonly number[], rtol = 1e-10): Schmidt {
  const { U, s, V } = svd(coefMatrix(psi, A))
  const keep = s.map((x, k) => [x, k] as const).filter(([x]) => x > rtol * Math.max(s[0], 1e-300))
  return {
    coeffs: keep.map(([x]) => x),
    a: keep.map(([, k]) => U.map((row) => row[k])),
    b: keep.map(([, k]) => V.map((row) => conj(row[k]))),
    rank: keep.length,
  }
}

/**
 * A purification of ρ (d×d): |Ψ⟩ = Σ_i √p_i |e_i⟩ ⊗ |i⟩ on the system ⊗ a d-dimensional ancilla (system first), so
 * Tr_ancilla |Ψ⟩⟨Ψ| = ρ. For ρ on n qubits the ancilla is n more qubits, placed after them.
 */
export function purify(rho: Mat): Vec {
  const d = rho.length
  const { values, vectors } = eigh(rho)
  const out: Vec = new Array(d * d).fill(ZERO)
  values.forEach((p, i) => {
    const w = Math.sqrt(Math.max(0, p))
    if (w === 0) return
    for (let s = 0; s < d; s++) out[s * d + i] = add(out[s * d + i], c(vectors[i][s].re * w, vectors[i][s].im * w))
  })
  return out
}

/** ‖M‖₁ = Tr√(M†M) = Σ singular values (Σ|λ| for a Hermitian M). */
export const traceNorm = (M: Mat): number => svd(M).s.reduce((a, b) => a + b, 0)

/** D(ρ, σ) = ½‖ρ − σ‖₁ (pure states may be passed as kets). */
export function traceDistance(rho: Vec | Mat, sigma: Vec | Mat): number {
  const A = asDensity(rho)
  const B = asDensity(sigma)
  return traceNorm(A.map((row, i) => row.map((x, j) => c(x.re - B[i][j].re, x.im - B[i][j].im)))) / 2
}

/**
 * The ROOT fidelity F(ρ, σ) = Tr√(√ρ σ √ρ) = ‖√ρ √σ‖₁ (Bergou 2.61), in [0, 1]; for pure states F = |⟨ψ|φ⟩|.
 * Kets or density matrices may be passed.
 */
export function fidelity(rho: Vec | Mat, sigma: Vec | Mat): number {
  if (!isMat(rho) && !isMat(sigma)) {
    const s = rho.reduce((acc, x, i) => add(acc, mul(conj(x), sigma[i])), ZERO)
    return Math.sqrt(abs2(s))
  }
  // one pure state: F = √⟨ψ|σ|ψ⟩ exactly (no square root of a singular matrix)
  if (!isMat(rho) || !isMat(sigma)) {
    const [psi, S] = isMat(rho) ? [sigma as Vec, rho] : [rho, sigma as Mat]
    const q = psi.reduce((acc, x, i) => acc + mul(conj(x), S[i].reduce((a, sij, j) => add(a, mul(sij, psi[j])), ZERO)).re, 0)
    return Math.sqrt(Math.max(0, q))
  }
  return traceNorm(matmul(sqrtPSD(rho), sqrtPSD(sigma)))
}

/** F² (Bergou Ch. 8's "fidelity" ⟨ψ|ρ|ψ⟩ when one state is pure; label it "(= F²)" in the UI). */
export const fidelitySq = (rho: Vec | Mat, sigma: Vec | Mat): number => fidelity(rho, sigma) ** 2

/** The Fuchs–van de Graaf sandwich 1 − F ≤ D ≤ √(1 − F²) with its two sides (Q7, Q21). */
export function fvdg(rho: Vec | Mat, sigma: Vec | Mat): { D: number; F: number; lower: number; upper: number } {
  const D = traceDistance(rho, sigma)
  const F = fidelity(rho, sigma)
  return { D, F, lower: 1 - F, upper: Math.sqrt(Math.max(0, 1 - F * F)) }
}

/**
 * Selective measurement of `qubits` with result `bits` on a density matrix: p = Tr(ΠρΠ), post = ΠρΠ/p (null when
 * p = 0). Π is the computational-basis projector, so ΠρΠ keeps the entries whose row and column both show `bits`.
 */
export function postMeasureRho(rho: Mat, qubits: readonly number[], bits: string): { p: number; post: Mat | null } {
  const n = nQubits(rho.length)
  checkWires(n, qubits, [], 'postMeasureRho')
  if (bits.length !== qubits.length || !/^[01]+$/.test(bits)) throw new Error('postMeasureRho: one bit per measured qubit')
  const off = subsetOffsets(qubits, n)
  const mask = off[off.length - 1]
  const want = off[parseInt(bits, 2)]
  const hit = (i: number) => (i & mask) === want
  const out = rho.map((row, i) => row.map((x, j) => (hit(i) && hit(j) ? x : ZERO)))
  const p = out.reduce((s, row, i) => s + row[i].re, 0)
  return { p, post: p > 1e-15 ? mscale(out, 1 / p) : null }
}

/** A random density matrix of dimension d and the given rank (Wishart: G G† / Tr, G a d×rank Ginibre matrix). */
export function randomDensity(d: number, rand: () => number, rank = d): Mat {
  const G: Mat = Array.from({ length: d }, () => Array.from({ length: rank }, () => c(gaussian(rand), gaussian(rand))))
  const W = matmul(G, dagger(G))
  const t = traceN(W).re
  return mscale(W, 1 / t)
}

/** The largest |ρ_ij − σ_ij| (for tests and readouts). */
export const densityGap = (rho: Mat, sigma: Mat): number => maxAbs(rho.map((row, i) => row.map((x, j) => c(x.re - sigma[i][j].re, x.im - sigma[i][j].im))))

/**
 * The von Neumann entropy S(ρ) = −Σ λ_k log₂ λ_k, in bits (0·log 0 = 0; eigenvalues ≤ 0 from rounding noise
 * contribute 0): 0 for a pure state, log₂ d for the maximally mixed state of dimension d (Bergou §2.5; Q8, Q9).
 */
export function vonNeumann(rho: Mat): number {
  return -eigh(rho).values.reduce((s, lam) => s + (lam > 1e-15 ? lam * Math.log2(lam) : 0), 0)
}

/**
 * The entanglement entropy across the cut A | rest of a pure state: S(ρ_A) (= S(ρ_rest), Q8 D10). A is a qubit
 * list (A[0] most significant) or a count k meaning the first k qubits; 1 for each Bell state, 0 for a product.
 */
export function entanglementEntropy(psi: Vec, A: readonly number[] | number): number {
  const n = nQubits(psi)
  const keep = typeof A === 'number' ? Array.from({ length: A }, (_, k) => k) : [...A]
  if (keep.length === 0 || keep.length >= n) throw new Error('entanglementEntropy: A must be a proper, non-empty subset of the qubits')
  return vonNeumann(reducedDensity(psi, keep))
}

/** The eigenvalues of ρ (the probabilities of its ensemble), descending and clamped to ≥ 0 (Q8, Q9). */
export const spectrum = (rho: Mat): number[] => eigh(rho).values.map((x) => Math.max(0, x)).reverse()

/** ρ(t) = Uρ(0)U† under the (time-independent) Hamiltonian H, ħ = 1, U = e^{−iHt} (`cmat.expmHermitian`; Q8's
 * `bloch-ball` trajectory, [H, ρ] ≠ 0 precesses ρ). */
export function evolveRho(H: Mat, rho: Mat, t = 1): Mat {
  const U = expmHermitian(H, t)
  return matmul(matmul(U, rho), dagger(U))
}

/** The thermal-state polarization r(x) = tanh(x/2): ρ = e^{−xσ_z/2}/Z (Bergou p. 36) has Bloch vector z = tanh(x/2)
 * (Q9; x = 0 is the maximally mixed state, x → ∞ is the ground state). */
export const thermalPolarization = (x: number): number => Math.tanh(x / 2)

/** One decomposition of ρ as weights `p` (> 0, descending) and orthonormal kets (Σ p_k |k⟩⟨k| = ρ). */
export interface Ensemble {
  p: number[]
  kets: Vec[]
}

/**
 * The eigen-ensemble of ρ: ρ = Σ p_k |k⟩⟨k| from its eigendecomposition, p_k > 0 (zero-weight eigenvectors
 * dropped) — the "natural" recipe among the infinitely many ensembles that give the same ρ (Bergou (2.19)–(2.20);
 * Q8 "one ρ, many ensembles": a pure state has exactly one).
 */
export function eigenEnsemble(rho: Mat, eps = 1e-12): Ensemble {
  const { values, vectors } = eigh(rho)
  const kept = values.map((lam, k) => ({ lam, ket: vectors[k] })).filter(({ lam }) => lam > eps)
  kept.sort((a, b) => b.lam - a.lam)
  return { p: kept.map((k) => k.lam), kets: kept.map((k) => k.ket) }
}

/** A d×n matrix whose column i is √p_i |ket_i⟩ (i < e.p.length) or the zero vector (padding to n columns). */
function ensembleMatrix(e: Ensemble, n: number, d: number): Mat {
  const cols: Vec[] = Array.from({ length: n }, (_, i) => (i < e.p.length ? vscale(e.kets[i], Math.sqrt(e.p[i])) : new Array(d).fill(ZERO)))
  return fromColumns(cols)
}

/** Extends `dim`-long orthonormal columns to `n` of them by Gram–Schmidt against the standard basis of C^dim (the
 * same recipe `svd`'s own U-completion and this function's row-completion already use). A no-op when `cols` is
 * already `n` long — the common k ≤ d case, where A's SVD already returns a full square V. */
function completeOrthonormal(cols: readonly Vec[], dim: number, n: number): Vec[] {
  const out = cols.slice()
  for (let e = 0; out.length < n && e < dim; e++) {
    let w: Vec = Array.from({ length: dim }, (_, k) => c(k === e ? 1 : 0))
    for (const v of out) w = vsub(w, vscale(v, inner(v, w)))
    const nw = norm(w)
    if (nw > 1e-6) out.push(vscale(w, 1 / nw))
  }
  return out
}

/**
 * The unitary-freedom theorem (Bergou (2.19)–(2.20)): if ensembles e1 (n₁ terms) and e2 (n₂ terms) both sum to the
 * same ρ, there is an n×n unitary U (n = max(n₁, n₂), the shorter padded with zero-weight terms) with A·U = B, A
 * and B the d×n matrices of √p-weighted kets. From A's SVD A = Ua·diag(s)·Va†, the n×n matrix D := Va†U is forced
 * on the rows where s > 0 (D_i = Ua_i†B / s_i — the least-squares answer, reproduced independently by the numpy
 * twin's `lstsq`); the rows where s ≈ 0 (A's kernel: the padding, and any excess terms beyond ρ's rank) are
 * genuinely free — ANY orthonormal completion of those rows works, since that part of A is already zero and
 * cannot see it. U = Va·D is then always unitary by construction, not only on the non-padded part.
 *
 * `svd`'s own V is only the THIN n×k (k = min(d, n)) right-singular-vector matrix, not the full n×n one, whenever
 * the ensembles have MORE terms than the Hilbert dimension (n > d — e.g. the trine against the z poles, n = 3,
 * d = 2): the missing n − k columns are exactly A's right null space, the part `U = Va·D` needs to reach the rows
 * of D beyond k. Without completing them, `matmul` silently uses only Va's first k rows of D (dropping the rest),
 * giving a U that is not unitary — the bug this completion fixes. When n ≤ d, `svd` already returns a full n×n V
 * (k = n) and this is a no-op.
 */
export function ensembleUnitary(e1: Ensemble, e2: Ensemble): Mat {
  const d = (e1.kets[0] ?? e2.kets[0])?.length ?? 0
  const n = Math.max(e1.p.length, e2.p.length)
  const A = ensembleMatrix(e1, n, d)
  const B = ensembleMatrix(e2, n, d)
  const { U: Ua, s, V: VaThin } = svd(A)
  const Va = fromColumns(completeOrthonormal(Array.from({ length: VaThin[0]?.length ?? 0 }, (_, j) => column(VaThin, j)), n, n))
  const UaB = matmul(dagger(Ua), B) // d×n; row i = Ua_i† B, i < d
  const tol = 1e-9 * Math.max(s[0] ?? 0, 1e-300)
  const D: Vec[] = new Array(n)
  const free: Vec[] = []
  for (let i = 0; i < n; i++) {
    if (s[i] > tol) {
      D[i] = vscale(UaB[i], 1 / s[i])
      free.push(D[i])
    }
  }
  for (let i = 0; i < n; i++) {
    if (D[i]) continue
    for (let e = 0; e < n; e++) {
      let w: Vec = Array.from({ length: n }, (_, k) => c(k === e ? 1 : 0))
      for (const f of free) w = vsub(w, vscale(f, inner(f, w)))
      const nw = norm(w)
      if (nw > 1e-6) {
        D[i] = vscale(w, 1 / nw)
        free.push(D[i])
        break
      }
    }
  }
  return matmul(Va, D)
}

