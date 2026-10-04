/**
 * Generalized measurements: POVMs, the Born rule for them, the Neumark/Naimark dilation to an ordinary projective
 * measurement, and the two discrimination bounds that frame "why generalize past projective measurements" (P-709-
 * remap-L1L7 §6 "E3"; Q13/Q14's state-discrimination arc). ħ = 1.
 *
 * A POVM is a list {E_i} of Hermitian positive-semidefinite operators with Σ_i E_i = I (`isPOVM`); outcome i occurs
 * with probability Tr(E_iρ) (`bornPovm`, the Born rule generalized past orthogonal projectors). Every POVM can be
 * realized as an ordinary projective measurement on a larger space (`neumark`): embed the system by the isometry
 * V = Σ_i √E_i ⊗ |i⟩ (V†V = Σ_i E_i = I) and measure the ancilla in the computational basis — Tr[(I⊗|i⟩⟨i|)VρV†] =
 * Tr(√E_i†√E_iρ) = Tr(E_iρ), the same probabilities `bornPovm` gives directly.
 *
 * `helstrom` is the minimum-error bound for telling two given states apart (always succeeds, sometimes wrongly);
 * `usd` is the success probability of a measurement that NEVER errs but sometimes declines to answer (unambiguous
 * discrimination, possible only for non-orthogonal PURE states) — `usd` ≤ `helstrom`'s success probability, the
 * price of never guessing wrong.
 *
 * Every function here is checked against an independent numpy/scipy route (pipeline/make_qc_fixtures.py, block
 * "povm"): `scipy.linalg.sqrtm` (a Schur-based route, independent of the engine's eigh-based `sqrtPSD`) for the
 * Neumark isometry, and the SVD trace norm for `helstrom`.
 */
import { ONE, ZERO, abs } from '../complex'
import { type Mat, type Vec, identity, inner, isHermitian, madd, matEq, matmul, mscale, msub } from '../linalg'
import { eigh, sqrtPSD, traceN, zeros } from './cmat'
import { traceNorm } from './density'

/** Is {E_i} a POVM: every E_i Hermitian with eigenvalues ≥ −eps, and Σ_i E_i = I (to tolerance eps)? */
export function isPOVM(es: readonly Mat[], eps = 1e-9): boolean {
  const n = es[0]?.length ?? 0
  if (!n || es.some((E) => E.length !== n || E[0]?.length !== n)) return false
  const sum = es.reduce((a, E) => madd(a, E), zeros(n))
  if (!matEq(sum, identity(n), eps)) return false
  return es.every((E) => {
    if (!isHermitian(E, Math.max(eps, 1e-7))) return false
    try {
      return eigh(E).values[0] >= -eps
    } catch {
      return false
    }
  })
}

/** The Born-rule outcome probabilities p_i = Tr(E_iρ) of a POVM {E_i} on a density matrix (or pure-state |ψ⟩⟨ψ|). */
export const bornPovm = (es: readonly Mat[], rho: Mat): number[] => es.map((E) => traceN(matmul(E, rho)).re)

export interface Neumark {
  /** (d·m)×d isometry V (V†V = I_d) embedding the system into system ⊗ ancilla, ancilla dimension m = outcomes. */
  V: Mat
  /** The m projective operators I_d⊗|i⟩⟨i| on the dilated (d·m)-dimensional space, same order as the input POVM. */
  projectors: Mat[]
}

/**
 * The Neumark/Naimark dilation of a POVM {E_i} (m outcomes on a d-dimensional system) to a projective measurement
 * {I_d⊗|i⟩⟨i|} on system⊗ancilla (ancilla dimension m): V = Σ_i √E_i ⊗ |i⟩, laid out with the system as the coarse
 * index and the ancilla as the fine one (row a·m+i of V is √E_i's row a). `bornPovm` on ρ equals
 * Tr[projectors[i]·(VρV†)] exactly, for every i (checked as a property in povm.test.ts).
 */
export function neumark(es: readonly Mat[]): Neumark {
  const m = es.length
  const d = es[0]?.length ?? 0
  const roots = es.map((E) => sqrtPSD(E))
  const V: Mat = Array.from({ length: d * m }, () => new Array(d).fill(ZERO))
  for (let a = 0; a < d; a++) for (let i = 0; i < m; i++) for (let b = 0; b < d; b++) V[a * m + i][b] = roots[i][a][b]
  const projectors = Array.from({ length: m }, (_, i) => {
    const P = zeros(d * m)
    for (let a = 0; a < d; a++) P[a * m + i][a * m + i] = ONE
    return P
  })
  return { V, projectors }
}

/**
 * The Helstrom minimum-error bound for discriminating ρ0 (prior p0) from ρ1 (prior 1 − p0) by ANY measurement:
 * P_success = ½(1 + ‖p0ρ0 − p1ρ1‖₁) (Helstrom 1976; Bergou §8.2). 1 for orthogonal states, ½ for identical ones.
 */
export function helstrom(rho0: Mat, rho1: Mat, p0: number): number {
  const diff = msub(mscale(rho0, p0), mscale(rho1, 1 - p0))
  return 0.5 * (1 + traceNorm(diff))
}

/**
 * The success probability of UNAMBIGUOUS state discrimination (IDP bound, Ivanovic–Dieks–Peres) between two pure
 * non-orthogonal states with equal priors: 1 − |⟨ψ0|ψ1⟩| — strictly less than `helstrom`'s success probability
 * except in the limit of orthogonal states, where both reach 1 (checked as a property in povm.test.ts): USD never
 * errs, but sometimes declines to answer, which costs it success probability that minimum-error discrimination
 * "spends" on guessing (and sometimes being wrong) instead.
 */
export function usd(states: readonly [Vec, Vec]): number {
  return 1 - abs(inner(states[0], states[1]))
}
