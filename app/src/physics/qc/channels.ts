/**
 * Open-system maps: Kraus operators, channel composition, the Pauli twirl, and the Choi matrix that makes complete
 * positivity checkable (P-709-remap-L1L7 §6 "E3"; Q13 "Open-system maps: Kraus operators and impossible machines").
 *
 * A channel is given as a Kraus list {K_m}: ℰ(ρ) = Σ_m K_m ρ K_m† (`applyKraus`). Trace preservation is the
 * completeness relation Σ_m K_m†K_m = I (`isCPTP`); complete positivity is automatic for any FINITE Kraus list — an
 * operator-sum representation is always CP (Kraus's theorem) — which is exactly why the chapter's two "impossible
 * machines", `transposeMap` and `unotMap`, are given as raw functions on matrices instead: they are POSITIVE (they
 * send every density matrix to another density matrix) but have NO Kraus representation, because they are not
 * completely positive.
 *
 * The Choi matrix J(ℰ) = Σ_{i,j} ℰ(|i⟩⟨j|) ⊗ |i⟩⟨j| (the UNNORMALIZED convention: Tr J = d for a trace-preserving ℰ
 * on a d-dimensional system) makes complete positivity checkable either way — J(ℰ) ⪰ 0 iff ℰ is CP (Choi's theorem,
 * Bergou — this is the "catch" the chapter builds to) — so `choi` accepts a Kraus list OR a raw map, and
 * `choiIsPositive` reads the verdict off its spectrum.
 *
 * Conventions: ħ = 1; the four named single-qubit channels (`depolarizing`, `dephasing`, `amplitudeDamping`,
 * `bitFlip`) and `pauliTwirl` are 2×2 only; `applyKraus`/`isCPTP`/`choi`/`choiIsPositive`/`composeChannels` work at
 * any dimension. Every function here is checked against an independent numpy/scipy route
 * (pipeline/make_qc_fixtures.py, block "channels"): explicit Kraus matrices, np.kron for the Choi matrix (Φ+ built
 * from np.eye, never the engine's elementary-basis loop), and closed-form SWAP/identity matrices for the two
 * non-physical maps' Choi matrices (no basis loop at all there).
 */
import { ONE, ZERO, c } from '../complex'
import { type Mat, dagger, identity, isHermitian, madd, matEq, matmul, mscale, msub } from '../linalg'
import { eigh, maxAbs, traceN, zeros } from './cmat'
import { I2, X, Y, Z } from './gates'

/** Σ_m K_m ρ K_m† (the Kraus/operator-sum action of a channel on a density matrix, or any matrix). */
export function applyKraus(ks: readonly Mat[], rho: Mat): Mat {
  if (ks.length === 0) throw new Error('applyKraus: at least one Kraus operator is required')
  return ks.map((K) => matmul(matmul(K, rho), dagger(K))).reduce((a, b) => madd(a, b))
}

/**
 * Is {K_m} trace-preserving, Σ_m K_m†K_m = I, to tolerance `eps`? (Complete positivity is automatic for a finite
 * Kraus list — see the module doc — so this is the one condition that can actually fail for a hand-built set.)
 */
export function isCPTP(ks: readonly Mat[], eps = 1e-9): boolean {
  const n = ks[0]?.length ?? 0
  if (!n || ks.some((K) => K.length !== n || K[0]?.length !== n)) return false
  const sum = ks.map((K) => matmul(dagger(K), K)).reduce((a, b) => madd(a, b))
  return matEq(sum, identity(n), eps)
}

/** The depolarizing channel: with probability p, replace the qubit by the maximally mixed state (Bergou §8.5). */
export const depolarizing = (p: number): Mat[] => [
  mscale(I2, Math.sqrt(1 - p)),
  mscale(X, Math.sqrt(p / 3)),
  mscale(Y, Math.sqrt(p / 3)),
  mscale(Z, Math.sqrt(p / 3)),
]

/** The dephasing (phase-flip) channel: with probability p, apply Z — destroys x/y coherence, leaves z alone. */
export const dephasing = (p: number): Mat[] => [mscale(I2, Math.sqrt(1 - p)), mscale(Z, Math.sqrt(p))]

/** The bit-flip channel: with probability p, apply X. */
export const bitFlip = (p: number): Mat[] => [mscale(I2, Math.sqrt(1 - p)), mscale(X, Math.sqrt(p))]

/** Amplitude damping (spontaneous emission at rate γ): |1⟩ decays to |0⟩ with probability γ. */
export function amplitudeDamping(gamma: number): Mat[] {
  const g = c(Math.sqrt(gamma))
  const g1 = c(Math.sqrt(1 - gamma))
  return [
    [[ONE, ZERO], [ZERO, g1]],
    [[ZERO, g], [ZERO, ZERO]],
  ]
}

/**
 * The Kraus set of "apply `first`, then `second`": (ℰ₂∘ℰ₁)(ρ) = Σ_j B_j(Σ_i A_iρA_i†)B_j† = Σ_{i,j}(B_jA_i)ρ(B_jA_i)†,
 * so the composite's Kraus operators are every product B_jA_i (Nielsen & Chuang §8.2.3).
 */
export const composeChannels = (first: readonly Mat[], second: readonly Mat[]): Mat[] =>
  second.flatMap((B) => first.map((A) => matmul(B, A)))

/**
 * The Pauli twirl of {K_m}: 𝒯(ρ) = ¼Σ_{P∈{I,X,Y,Z}} P·ℰ(PρP)·P, which symmetrizes any single-qubit channel into a
 * Pauli channel (the same diagonal shape as `depolarizing`'s Bloch map). Returned as a 4·|ks| Kraus list
 * {½PK_mP}: ¼Σ_P PℰP = Σ_{P,m}(½PK_mP)ρ(½PK_mP)† term by term (P is Hermitian, so (PK_mP)† = PK_m†P).
 */
export function pauliTwirl(ks: readonly Mat[]): Mat[] {
  if (ks[0]?.length !== 2) throw new Error('pauliTwirl: single-qubit (2×2) Kraus operators only')
  return [I2, X, Y, Z].flatMap((P) => ks.map((K) => mscale(matmul(matmul(P, K), P), 0.5)))
}

/**
 * The transpose map Λ(ρ) = ρᵀ — NOT ρ† (no conjugation). POSITIVE: ρᵀ has the same (real) eigenvalues as ρ, so a
 * density matrix stays a density matrix. NOT completely positive: Λ⊗id sends half of an entangled pair's density
 * matrix to something with a negative eigenvalue (this IS the Peres partial-transpose criterion from Q12/`ptranspose`,
 * seen here as "the transpose itself is not a physical channel" — Q13's first impossible machine).
 */
export const transposeMap = (rho: Mat): Mat => rho.map((row, i) => row.map((_, j) => rho[j][i]))

/**
 * The universal-NOT map Λ(ρ) = (Tr(ρ)·I − ρ)/(d − 1): antipodal on the Bloch ball (sends every pure state to the
 * orthogonal one) and, more generally, flips the sign of ρ's traceless part. POSITIVE for a density matrix (its
 * eigenvalues are (Tr ρ − λ_k)/(d − 1) ≥ 0 whenever every λ_k ≤ Tr ρ, as for any density matrix) but NOT completely
 * positive — there is no physical "universal NOT gate" (Bužek–Hillery–Werner; Q13's second impossible machine).
 */
export function unotMap(rho: Mat): Mat {
  const d = rho.length
  if (d < 2) throw new Error('unotMap: needs dimension ≥ 2')
  return mscale(msub(mscale(identity(d), traceN(rho).re), rho), 1 / (d - 1))
}

/** A linear map on d×d matrices, given either as a Kraus list (applied through `applyKraus`) or as a raw function —
 * the only way to reach `transposeMap`/`unotMap`, which have no Kraus form. */
export type ChannelMap = readonly Mat[] | ((rho: Mat) => Mat)

function elementary(d: number, i: number, j: number): Mat {
  return Array.from({ length: d }, (_, a) => Array.from({ length: d }, (_, b) => (a === i && b === j ? ONE : ZERO)))
}

/**
 * The (unnormalized) Choi matrix J(ℰ) = Σ_{i,j} ℰ(|i⟩⟨j|) ⊗ |i⟩⟨j| of a linear map on d×d matrices, built by applying
 * ℰ to every elementary basis matrix |i⟩⟨j| and scattering the result: J[a·d+i][b·d+j] = ℰ(|i⟩⟨j|)_{ab} (the map's
 * output is the OUTER/coarse tensor factor, the basis label the INNER/fine one — `kronM`'s own convention). Tr J = d
 * when ℰ is trace-preserving. `d` is required for a raw-function map; inferred from the first Kraus operator
 * otherwise. J ⪰ 0 iff ℰ is completely positive (Choi's theorem) — see `choiIsPositive`.
 */
export function choi(map: ChannelMap, d?: number): Mat {
  const dim = d ?? (Array.isArray(map) ? (map[0]?.length ?? 0) : 0)
  if (!dim) throw new Error('choi: give the dimension d for a raw-function map')
  const apply = (rho: Mat): Mat => (Array.isArray(map) ? applyKraus(map, rho) : (map as (rho: Mat) => Mat)(rho))
  const J: Mat = zeros(dim * dim)
  for (let i = 0; i < dim; i++)
    for (let j = 0; j < dim; j++) {
      const M = apply(elementary(dim, i, j))
      for (let a = 0; a < dim; a++) for (let b = 0; b < dim; b++) J[a * dim + i][b * dim + j] = M[a][b]
    }
  return J
}

/** Is the Choi matrix J positive semidefinite (to tolerance `eps`)? False (not just "not CP") when J is not even
 * Hermitian — a map that is not Hermiticity-preserving cannot be CP either. */
export function choiIsPositive(J: Mat, eps = 1e-9): boolean {
  if (!isHermitian(J, Math.max(eps, 1e-7 * Math.max(1, maxAbs(J))))) return false
  try {
    return eigh(J).values[0] >= -eps
  } catch {
    return false
  }
}
