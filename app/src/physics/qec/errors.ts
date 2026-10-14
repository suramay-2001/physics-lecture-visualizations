/**
 * What errors do to a code (Physics 709 Chapter Q21; Bergou Ch. 9, N&C §10.1–10.3): the helpers the first error-correction chapter needs on top of the
 * engine's codes, code words and failure rates. Pure TypeScript (qec/purity.test.ts); every function has an independent numpy twin in
 * pipeline/make_qec_q21_fixtures.py (dense Kronecker products, enumeration and closed forms), read by errors.test.ts.
 *
 *   - `codeSyndrome`        the ±1 reading of every check for a Pauli error (Table 9.1), and `denseCheckValues`, the same readings found by acting on the dense
 *                           code state a|0̄⟩ + b|1̄⟩ (a different route: no symplectic algebra);
 *   - `klMatrix`            the Knill–Laflamme table C_ba = ⟨0̄|E_b†E_a|0̄⟩ of a set of Pauli errors, its eigenvalues, and the gap to the condition
 *                           ⟨j̄|E_b†E_a|k̄⟩ = C_ba δ_jk (Bergou Eq. 9.16, N&C Thm 10.1);
 *   - `pauliCoefficients`   A = Σ_P c_P P with c_P = Tr(PA)/2 for a 2 × 2 matrix (Eq. 9.4), and `envPauliExpansion`, the environment's four notes |e_P⟩ of a
 *                           system–environment unitary (Eqs. 9.5–9.6);
 *   - `paulisOfWeight`      every Pauli string of weight ≤ t on n qubits, in a fixed order (Σ_{j≤t} C(n,j) 3^j of them);
 *   - `dephasingFactor`, `gaussianDephasingFactor`, `uniformDephasingFactor`   the factor z = ∫p(φ)e^{iφ}dφ by which random phases shrink a coherence (Eqs. 9.55–9.57);
 *   - `repetitionBreakEven` the flip chance at which an n-copy majority vote stops helping.
 */
import { type C, abs, c, expi, scale } from '../complex'
import { type Mat, type Vec, apply, matmul } from '../linalg'
import { I2, X, Y, Z } from '../qc/gates'
import { eigh, traceN } from '../qc/cmat'
import { type CodeAmp, applyPauli, codewords } from './codewords'
import { Pauli } from './pauli'
import { repetitionFail } from './rates'
import type { RegisteredCode } from './registry'

type Dense = { re: Float64Array; im: Float64Array }

/** The ±1 reading of every check (generator order of the registry) when the code state has suffered the Pauli error: +1 if the check commutes with it, −1 if it anticommutes. */
export function codeSyndrome(entry: RegisteredCode, error: Pauli): (1 | -1)[] {
  return entry.stabilizer.syndrome(error).map((b) => (b === 0 ? 1 : -1))
}

/** The Pauli string of a generator or an error written compactly, e.g. 'ZZIIIIIII' → 'Z1Z2' (qubits counted from 1). */
export function pauliName(p: Pauli): string {
  return p
    .letters()
    .map((l, j) => (l === 'I' ? '' : `${l}${j + 1}`))
    .join('')
}

const toDense = (words: readonly CodeAmp[], n: number): Dense => {
  const re = new Float64Array(2 ** n)
  const im = new Float64Array(2 ** n)
  for (const w of words) {
    re[parseInt(w.bits, 2)] = w.amp.re
    im[parseInt(w.bits, 2)] = w.amp.im
  }
  return { re, im }
}
const dInner = (a: Dense, b: Dense): C => {
  let re = 0
  let im = 0
  for (let k = 0; k < a.re.length; k++) {
    re += a.re[k] * b.re[k] + a.im[k] * b.im[k]
    im += a.re[k] * b.im[k] - a.im[k] * b.re[k]
  }
  return c(re, im)
}
const dAdd = (a: Dense, ka: number, b: Dense, kb: number): Dense => ({
  re: a.re.map((x, i) => ka * x + kb * b.re[i]),
  im: a.im.map((x, i) => ka * x + kb * b.im[i]),
})

/**
 * The dense route to the same readings: ⟨ψ|E†gE|ψ⟩ for the state |ψ⟩ = a|0̄⟩ + b|1̄⟩ (real a, b with a² + b² = 1) and each generator g, found by acting on the
 * state vector. For an error that the code can tell apart the value is exactly ±1 whatever a and b are.
 */
export function denseCheckValues(entry: RegisteredCode, error: Pauli, a: number, b: number): number[] {
  const n = entry.n
  const w = codewords(entry)
  const psi = dAdd(toDense(w.zero, n), a, toDense(w.one, n), b)
  const hit = applyPauli(error, psi)
  return entry.stabilizer.generators.map((g) => dInner(hit, applyPauli(g, hit)).re)
}

export interface KLReport {
  /** The Knill–Laflamme table C_ba = ⟨0̄|E_b†E_a|0̄⟩ (Hermitian). */
  C: C[][]
  /** The same table taken on |1̄⟩: the condition needs it equal to C. */
  C1: C[][]
  /** Eigenvalues of C, ascending (a zero one marks an error that annihilates the code; a degenerate pair gives a rank below the number of errors). */
  eigenvalues: number[]
  /** The largest |⟨j̄|E_b†E_a|k̄⟩ − C_ba δ_jk| over all errors and both code words: 0 exactly when the condition holds. */
  gap: number
}

/** The Knill–Laflamme table of a set of Pauli errors on a registered k = 1 code. */
export function klMatrix(entry: RegisteredCode, errors: readonly Pauli[]): KLReport {
  const n = entry.n
  const w = codewords(entry)
  const words = [toDense(w.zero, n), toDense(w.one, n)]
  const m = errors.length
  const table = (j: number, k: number): C[][] => {
    const hit = errors.map((e) => applyPauli(e, words[k]))
    const left = errors.map((e) => applyPauli(e, words[j]))
    return Array.from({ length: m }, (_, bi) => Array.from({ length: m }, (_, ai) => dInner(left[bi], hit[ai])))
  }
  const C = table(0, 0)
  const C1 = table(1, 1)
  const cross = [table(0, 1), table(1, 0)]
  let gap = 0
  for (let bi = 0; bi < m; bi++)
    for (let ai = 0; ai < m; ai++) {
      gap = Math.max(gap, abs(c(C1[bi][ai].re - C[bi][ai].re, C1[bi][ai].im - C[bi][ai].im)), abs(cross[0][bi][ai]), abs(cross[1][bi][ai]))
    }
  return { C, C1, eigenvalues: eigh(C).values.slice().sort((x, y) => x - y), gap }
}

export interface PauliCoefficients {
  I: C
  X: C
  Y: C
  Z: C
}
const PAULI_MATS: Record<keyof PauliCoefficients, Mat> = { I: I2, X, Y, Z }

/** A = Σ_P c_P P over {I, X, Y, Z} with c_P = Tr(PA)/2 (Bergou Eq. 9.4: Tr(PQ) = 2δ_PQ), for a 2 × 2 matrix. */
export function pauliCoefficients(A: Mat): PauliCoefficients {
  if (A.length !== 2 || A[0].length !== 2) throw new Error('pauliCoefficients: A must be 2 × 2')
  const out = {} as PauliCoefficients
  for (const k of Object.keys(PAULI_MATS) as (keyof PauliCoefficients)[]) out[k] = scale(traceN(matmul(PAULI_MATS[k], A)), 1 / 2)
  return out
}

/** The largest entry of A − Σ c_P P: 0 when the four coefficients rebuild A. */
export function pauliExpansionResidual(A: Mat): number {
  const co = pauliCoefficients(A)
  let worst = 0
  for (let i = 0; i < 2; i++)
    for (let j = 0; j < 2; j++) {
      let re = A[i][j].re
      let im = A[i][j].im
      for (const k of Object.keys(PAULI_MATS) as (keyof PauliCoefficients)[]) {
        const t = PAULI_MATS[k][i][j]
        re -= co[k].re * t.re - co[k].im * t.im
        im -= co[k].re * t.im + co[k].im * t.re
      }
      worst = Math.max(worst, Math.hypot(re, im))
    }
  return worst
}

export interface EnvExpansion {
  /** The environment's notes |e_I⟩, |e_X⟩, |e_Y⟩, |e_Z⟩ (vectors of the environment's dimension). */
  e: { I: Vec; X: Vec; Y: Vec; Z: Vec }
  /** The largest entry of U(|ψ⟩|0⟩_E) − Σ_P (P|ψ⟩)|e_P⟩: 0 when the four-part split of Eqs. 9.5–9.6 holds. */
  gap: number
}

/**
 * Split a system–environment unitary on one qubit and a one-qubit environment (a 4 × 4 matrix U acting on |system⟩|environment⟩, the system the left factor)
 * into Bergou's four parts: U(|j⟩|0⟩_E) = |0⟩|e_j0⟩ + |1⟩|e_j1⟩ and |e_I⟩, |e_Z⟩ = (|e_00⟩ ± |e_11⟩)/2, |e_X⟩ = (|e_01⟩ + |e_10⟩)/2, |e_Y⟩ = i(|e_10⟩ − |e_01⟩)/2.
 * `gap` compares both sides on the state `psi` (any normalised one-qubit vector).
 */
export function envPauliExpansion(U: Mat, psi: Vec): EnvExpansion {
  if (U.length !== 4 || psi.length !== 2) throw new Error('envPauliExpansion: U must be 4 × 4 (qubit ⊗ one-qubit environment) and psi a qubit')
  // |e_jk⟩ has environment index e: ⟨k|_A⟨e|_E U |j⟩_A|0⟩_E = U[2k + e][2j]
  const eVec = (j: number, k: number): Vec => [U[2 * k][2 * j], U[2 * k + 1][2 * j]]
  const e00 = eVec(0, 0)
  const e01 = eVec(0, 1)
  const e10 = eVec(1, 0)
  const e11 = eVec(1, 1)
  const lin = (parts: [C, Vec][]): Vec => [0, 1].map((e) => parts.reduce((s, [k, v]) => c(s.re + k.re * v[e].re - k.im * v[e].im, s.im + k.re * v[e].im + k.im * v[e].re), c(0)))
  const half = c(0.5)
  const eI = lin([[half, e00], [half, e11]])
  const eZ = lin([[half, e00], [c(-0.5), e11]])
  const eX = lin([[half, e01], [half, e10]])
  const eY = lin([[c(0, 0.5), e10], [c(0, -0.5), e01]])
  const lhs = apply(U, [psi[0], c(0), psi[1], c(0)]) // |ψ⟩_A ⊗ |0⟩_E, system first: index 2a + e
  const rhs: Vec = [c(0), c(0), c(0), c(0)]
  const parts: [Mat, Vec][] = [[I2, eI], [X, eX], [Y, eY], [Z, eZ]]
  for (const [P, ev] of parts) {
    const Ppsi = apply(P, psi)
    for (let a = 0; a < 2; a++)
      for (let e = 0; e < 2; e++) {
        const t = c(Ppsi[a].re * ev[e].re - Ppsi[a].im * ev[e].im, Ppsi[a].re * ev[e].im + Ppsi[a].im * ev[e].re)
        rhs[2 * a + e] = c(rhs[2 * a + e].re + t.re, rhs[2 * a + e].im + t.im)
      }
  }
  let gap = 0
  for (let k = 0; k < 4; k++) gap = Math.max(gap, Math.hypot(lhs[k].re - rhs[k].re, lhs[k].im - rhs[k].im))
  return { e: { I: eI, X: eX, Y: eY, Z: eZ }, gap }
}

/** Every Pauli string on n qubits of weight at most t: first the identity, then by weight, then by the places hit (left to right), then by the letters X, Y, Z. There are Σ_{j≤t} C(n,j) 3^j of them. */
export function paulisOfWeight(n: number, t: number): Pauli[] {
  if (!Number.isInteger(n) || n < 1 || n > 16) throw new Error('paulisOfWeight: n must be a whole number from 1 to 16')
  if (!Number.isInteger(t) || t < 0 || t > n) throw new Error('paulisOfWeight: t must be a whole number from 0 to n')
  const out: Pauli[] = [Pauli.identity(n)]
  const letters = ['X', 'Y', 'Z']
  for (let w = 1; w <= t; w++) {
    const places = new Array<number>(w).fill(0)
    const rec = (start: number, depth: number): void => {
      if (depth === w) {
        const assign = (i: number, row: string[]): void => {
          if (i === w) {
            out.push(Pauli.parse(row.join('')))
            return
          }
          for (const l of letters) {
            const next = row.slice()
            next[places[i]] = l
            assign(i + 1, next)
          }
        }
        assign(0, new Array<string>(n).fill('I'))
        return
      }
      for (let q = start; q <= n - (w - depth); q++) {
        places[depth] = q
        rec(q + 1, depth + 1)
      }
    }
    rec(0, 0)
  }
  return out
}

/** z = Σ_k w_k e^{iφ_k} (φ in radians; weights default to equal and must be non-negative and add to 1): the factor by which a coherence shrinks when the phase is φ_k with chance w_k (Eq. 9.57). */
export function dephasingFactor(phases: readonly number[], weights?: readonly number[]): C {
  const w = weights ?? phases.map(() => 1 / phases.length)
  if (w.length !== phases.length) throw new Error('dephasingFactor: one weight per phase')
  if (w.some((x) => x < 0) || Math.abs(w.reduce((s, x) => s + x, 0) - 1) > 1e-9) throw new Error('dephasingFactor: the weights must be non-negative and add to 1')
  return phases.reduce((s, p, k) => c(s.re + w[k] * Math.cos(p), s.im + w[k] * Math.sin(p)), c(0))
}

/** The same factor for a phase spread evenly round the whole circle (N equally spaced phases; the weights are equal). */
export function uniformDephasingFactor(N = 360): C {
  return dephasingFactor(Array.from({ length: N }, (_, k) => (2 * Math.PI * k) / N))
}

/** The same factor for a Gaussian phase of mean 0 and width σ (radians), by the trapezoid rule over ±10σ (the integrand is smooth and the tails negligible). */
export function gaussianDephasingFactor(sigma: number, samples = 4001): C {
  if (!(sigma > 0)) throw new Error('gaussianDephasingFactor: σ must be positive')
  const h = (20 * sigma) / (samples - 1)
  let re = 0
  let norm = 0
  for (let k = 0; k < samples; k++) {
    const x = -10 * sigma + k * h
    const p = Math.exp(-(x * x) / (2 * sigma * sigma))
    const wgt = k === 0 || k === samples - 1 ? 0.5 : 1
    re += wgt * p * expi(x).re
    norm += wgt * p
  }
  return c(re / norm, 0)
}

/** The flip chance p in (0, 1) at which an n-copy majority vote fails exactly as often as one bare bit: the root of repetitionFail(p, n) = p, found by bisection on [0.1, 0.9]. */
export function repetitionBreakEven(n: number): number {
  let lo = 0.1
  let hi = 0.9
  const f = (p: number): number => repetitionFail(p, n) - p
  if (!(f(lo) < 0 && f(hi) > 0)) throw new Error('repetitionBreakEven: no sign change on [0.1, 0.9]')
  for (let i = 0; i < 80; i++) {
    const mid = (lo + hi) / 2
    if (f(mid) < 0) lo = mid
    else hi = mid
  }
  return (lo + hi) / 2
}
