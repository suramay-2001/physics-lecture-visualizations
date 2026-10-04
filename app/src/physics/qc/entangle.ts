/**
 * Two-qubit entanglement and nonlocality (E2 `entangle`; P-709-map/P-709-remap §6, P-Q10-story §9.1, P-Q12-story §9.1
 * concurrence/eof). Pure TypeScript; numpy twin pipeline/make_qc_fixtures.py block "entangle" (independent routes:
 * explicit 4×4 matrices, np.kron, SVD for negativity/concurrence, itertools for the LHV bound).
 *
 * Conventions: q0 is the LEFT factor (Alice/A), q1 the right factor (Bob/B); every state here is exactly two qubits
 * (dimension 4). A Pauli observable is the UNscaled σ_x, σ_y, σ_z (physics/spin.ts SIGMA_*, nDotSigma), so a
 * correlator is ⟨σ_a ⊗ σ_b⟩, not ⟨S_a ⊗ S_b⟩ (ħ = 1, S = σ/2 is a UI/content concern, not this module's).
 */
import { abs, c, conj } from '../complex'
import { apply, inner, matmul, type Mat, type Vec } from '../linalg'
import { nDotSigma, SIGMA_X, SIGMA_Y, SIGMA_Z, type Vec3 } from '../spin'
import { eigh, kronM, sqrtPSD, svd, traceN } from './cmat'
import { asDensity } from './density'
import { binaryEntropy } from './info'

/** A measurement setting as a unit direction on the Bloch sphere (physics/qc §9.1's "Dir": n̂ in n̂·σ). */
export type Dir = Vec3

/** The three unscaled Pauli operators, in order x, y, z (physics/spin.ts). */
export const PAULIS: readonly Mat[] = [SIGMA_X, SIGMA_Y, SIGMA_Z]

export { nDotSigma }

/* ------------------------------------------------------------------------------------------------ */
/* Correlations                                                                                      */
/* ------------------------------------------------------------------------------------------------ */

/**
 * ⟨A ⊗ B⟩ = Tr(ρ A⊗B) for a two-qubit state (a ket or a density matrix): the engine's one route to every two-qubit
 * correlator, CHSH score and correlation-tensor entry below.
 */
export function correlator(state: Mat | Vec, A: Mat, B: Mat): number {
  const rho = asDensity(state)
  return traceN(matmul(rho, kronM(A, B))).re
}

/** The 3×3 grid T_ij = ⟨σ_i ⊗ σ_j⟩ (i, j ∈ {x, y, z}): the two-qubit stage kind's `grid: 'T'`. */
export function correlationTensor(state: Mat | Vec): number[][] {
  return PAULIS.map((A) => PAULIS.map((B) => correlator(state, A, B)))
}

/** S = ⟨a₁b₁⟩ + ⟨a₁b₂⟩ + ⟨a₂b₁⟩ − ⟨a₂b₂⟩ (the CHSH combination; the minus sign always on the last term). */
export function chsh(state: Mat | Vec, a1: Mat, a2: Mat, b1: Mat, b2: Mat): number {
  return correlator(state, a1, b1) + correlator(state, a1, b2) + correlator(state, a2, b1) - correlator(state, a2, b2)
}

/** `chsh`, with each setting a direction n̂·σ instead of a raw operator (the two-qubit stage's `axes`). */
export function chshFromAxes(state: Mat | Vec, a: readonly [Dir, Dir], b: readonly [Dir, Dir]): number {
  const [a1, a2] = a.map(nDotSigma)
  const [b1, b2] = b.map(nDotSigma)
  return chsh(state, a1, a2, b1, b2)
}

/** S at one value of a swept parameter (e.g. a relative phase δ), for a dial plot's curve: `stateOf(x)` then CHSH. */
export function chshCurve(stateOf: (x: number) => Vec, a: readonly [Dir, Dir], b: readonly [Dir, Dir], x: number): number {
  return chshFromAxes(stateOf(x), a, b)
}

/** Real 3×3 (or any real matrix) lifted to a complex `Mat`, for `cmat.ts`'s SVD/eigh routines. */
const realMat = (T: readonly (readonly number[])[]): Mat => T.map((row) => row.map((x) => c(x)))

/**
 * Horodecki's bound: the largest CHSH score ANY pair of settings can reach for this state, M(ρ) = 2√(t₁ + t₂), t₁ ≥
 * t₂ the two largest eigenvalues of TᵀT (= the two largest squared singular values of T). Tsirelson-capped: ≤ 2√2.
 */
export function chshMaxHorodecki(state: Mat | Vec): number {
  const s = svd(realMat(correlationTensor(state))).s
  return 2 * Math.sqrt(s[0] ** 2 + s[1] ** 2)
}

/** Every local-hidden-variable instruction set (±1 for a₁, a₂, b₁, b₂) and its CHSH value X = a₁(b₁+b₂) + a₂(b₁−b₂). */
export function lhvChsh(): { assignments: number[][]; maxS: number; xValues: number[] } {
  const bits = [1, -1]
  const assignments: number[][] = []
  const xValues: number[] = []
  for (const a1 of bits)
    for (const a2 of bits)
      for (const b1 of bits)
        for (const b2 of bits) {
          assignments.push([a1, a2, b1, b2])
          xValues.push(a1 * b1 + a1 * b2 + a2 * b1 - a2 * b2)
        }
  return { assignments, maxS: Math.max(...xValues), xValues }
}

/** The PR-box correlations: the maximal (non-quantum) no-signalling point, S = 4. */
export function prBox(): { S: number; table: number[][] } {
  const table = [
    [1, 1],
    [1, -1],
  ]
  const S = table[0][0] + table[0][1] + table[1][0] - table[1][1]
  return { S, table }
}

/* ------------------------------------------------------------------------------------------------ */
/* Separability: PPT, negativity                                                                     */
/* ------------------------------------------------------------------------------------------------ */

/** ρ^{T_B} (the partial transpose on the second qubit, q1): swap q1's bit between the row and the column index. */
function ptransposeB(rho: Mat): Mat {
  return rho.map((row, i) => row.map((_, j) => rho[(i & ~1) | (j & 1)][(j & ~1) | (i & 1)]))
}

/** The Peres criterion: ρ^{T_B} ⪰ 0 (within `eps`, for rounding). True for every separable two-qubit state. */
export function isPPT(rho: Mat, eps = 1e-9): boolean {
  return eigh(ptransposeB(rho)).values.every((v) => v >= -eps)
}

/** Σ_{λ<0} |λ| of ρ^{T_B} (0 for a product or PPT state; ½ for a Bell state, the maximum for two qubits). */
export function negativity(rho: Mat): number {
  return eigh(ptransposeB(rho)).values.reduce((s, v) => (v < 0 ? s - v : s), 0)
}

/* ------------------------------------------------------------------------------------------------ */
/* Concurrence and entanglement of formation (P-Q12-story §9.1; Wootters)                            */
/* ------------------------------------------------------------------------------------------------ */

const YY: Mat = kronM(SIGMA_Y, SIGMA_Y)
const matConj = (M: Mat): Mat => M.map((row) => row.map(conj))

/** C(|ψ⟩) = |⟨ψ|ψ̃⟩|, the overlap with the spin-flipped state |ψ̃⟩ = (σ_y⊗σ_y)|ψ*⟩ (Bergou Eqs. 3.65–3.66). */
export function concurrencePure(psi: Vec): number {
  const psiTilde = apply(YY, psi.map(conj))
  return abs(inner(psi, psiTilde))
}

/**
 * Wootters' concurrence for a (possibly mixed) two-qubit state: C(ρ) = max(0, λ₁ − λ₂ − λ₃ − λ₄), λ descending, the
 * square roots of the eigenvalues of ρρ̃ (ρ̃ = (σ_y⊗σ_y)ρ*(σ_y⊗σ_y)) — computed as the eigenvalues of the HERMITIAN
 * M = √ρ ρ̃ √ρ (cmat.ts `sqrtPSD`), which shares ρρ̃'s nonzero spectrum, so no non-Hermitian eigenproblem is needed.
 */
export function concurrence(rho: Mat): number {
  const rhoTilde = matmul(matmul(YY, matConj(rho)), YY)
  const R = sqrtPSD(rho)
  const lambdas = eigh(matmul(matmul(R, rhoTilde), R))
    .values.map((v) => Math.sqrt(Math.max(0, v)))
    .sort((a, b) => b - a)
  return Math.max(0, lambdas[0] - lambdas[1] - lambdas[2] - lambdas[3])
}

/** The entanglement of formation from the concurrence: E(C) = h((1 + √(1 − C²))/2), h the binary entropy. */
export function eofFromC(C: number): number {
  return binaryEntropy((1 + Math.sqrt(Math.max(0, 1 - C * C))) / 2)
}
