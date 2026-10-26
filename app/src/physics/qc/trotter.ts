/**
 * Simulating a spin chain with gates (Chapter Q19; Bergou §7.7, pp. 140-141; N&C §4.7, pp. 206-208). Pure functions, ħ = 1, S = σ/2;
 * numpy twin pipeline/make_walk_fixtures.py → __fixtures__/qc-walk.json.
 *
 * The Heisenberg chain H = −J Σ_{n=1}^{N-1} S_n·S_{n+1} (Eq. 7.80) has N − 1 terms, each touching two neighbouring spins. One bond has the closed form
 * e^{-iH_n t} = e^{-iJt/4}[cos(Jt/2) I + i sin(Jt/2) SWAP] (because XX + YY + ZZ = 2 SWAP − I). Neighbouring bonds do not commute, so the exact U(t) = e^{-iHt}
 * is only approached by Trotter's product (Eq. 7.81-7.82): M repeats of U_1(t/M) then U_2(t/M) … (order 1, error O(t²/M)), or the symmetric split of N&C
 * Eq. 4.104 (order 2, error O(t³/M²)). Qubit order: q0 = the leftmost spin = the top wire; chains stop at MAX_DENSE_QUBITS (6) because the matrices are dense.
 */
import { type C, c } from '../complex'
import { type Mat, apply, identity, madd, matmul, maxDiff, mscale, msub } from '../linalg'
import { type Circuit, type Op } from './circuit'
import { expmHermitian, svd } from './cmat'
import { SWAP2, pauliString } from './gates'
import { MAX_DENSE_QUBITS, embed } from './state'

const need = (ok: boolean, why: string): void => {
  if (!ok) throw new Error(why)
}
const isInt = (x: number): boolean => Number.isInteger(x)
const checkChain = (N: number, who: string): void => need(isInt(N) && N >= 2 && N <= MAX_DENSE_QUBITS, `${who}: a chain of 2…${MAX_DENSE_QUBITS} spins`)

/** The two-spin term −J S·S = −(J/4)(XX + YY + ZZ) as a 4×4 matrix. */
export function bondH(J = 1): Mat {
  const P = madd(madd(pauliString('XX'), pauliString('YY')), pauliString('ZZ'))
  return mscale(P, -J / 4)
}

/** The bond gate e^{-iH t} for H = −J S·S in closed form, with Jt given: e^{-iJt/4}[cos(Jt/2) I + i sin(Jt/2) SWAP]. */
export function heisenbergBond(Jt: number): Mat {
  const ph = c(Math.cos(Jt / 4), -Math.sin(Jt / 4))
  const co = Math.cos(Jt / 2)
  const si = Math.sin(Jt / 2)
  const entry = (i: number, j: number): C => {
    const m = c(i === j ? co : 0, SWAP2[i][j].re * si)
    return c(ph.re * m.re - ph.im * m.im, ph.re * m.im + ph.im * m.re)
  }
  return Array.from({ length: 4 }, (_, i) => Array.from({ length: 4 }, (_, j) => entry(i, j)))
}
/** The same gate from a matrix exponential of the bond Hamiltonian (J = 1, t = Jt). */
export const heisenbergBondExpm = (Jt: number): Mat => expmHermitian(bondH(1), Jt)

/** max |XX + YY + ZZ − (2 SWAP − I)|: the identity behind the closed form. */
export function swapIdentityGap(): number {
  const lhs = madd(madd(pauliString('XX'), pauliString('YY')), pauliString('ZZ'))
  return maxDiff(lhs, msub(mscale(SWAP2, 2), identity(4)))
}
/** max |closed-form bond − matrix exponential| at Jt. */
export const bondClosedGap = (Jt: number): number => maxDiff(heisenbergBond(Jt), heisenbergBondExpm(Jt))
/** The chance |10> → |01> under one bond gate at Jt (1 at Jt = π). */
export function bondSwapChance(Jt: number): number {
  const out = apply(heisenbergBond(Jt), [c(0), c(0), c(1), c(0)])
  return out[1].re ** 2 + out[1].im ** 2
}

/** H = −J Σ S_n·S_{n+1} on N spins (a 2^N-square Hermitian matrix). */
export function chainH(N: number, J = 1): Mat {
  checkChain(N, 'chainH')
  return Array.from({ length: N - 1 }, (_, b) => embed(bondH(J), N, [b, b + 1])).reduce((A, B) => madd(A, B))
}
/** The exact U(t) = e^{-iHt}. */
export const chainU = (N: number, J: number, t: number): Mat => expmHermitian(chainH(N, J), t)

/** The bond Hamiltonian H_b = −J S_b·S_{b+1} (b = 0…N-2) on the whole chain. */
const bondOnChain = (N: number, J: number, b: number): Mat => embed(bondH(J), N, [b, b + 1])
const bondGate = (N: number, J: number, b: number, tau: number): Mat => embed(heisenbergBond(J * tau), N, [b, b + 1])

/** One Trotter piece for time step tau: order 1: bond 1, then bond 2, … (the circuit's order); order 2: the symmetric split, half-steps up the chain, then back down (the last bond whole). */
function trotterPiece(N: number, J: number, tau: number, order: 1 | 2): Mat {
  const seq: [number, number][] = []
  if (order === 1) for (let b = 0; b < N - 1; b++) seq.push([b, tau])
  else {
    for (let b = 0; b < N - 2; b++) seq.push([b, tau / 2])
    seq.push([N - 2, tau])
    for (let b = N - 3; b >= 0; b--) seq.push([b, tau / 2])
  }
  return seq.reduce((U, [b, s]) => matmul(bondGate(N, J, b, s), U), identity(2 ** N))
}

/** [piece]^M: Trotter's product for total time t in M pieces. */
export function trotterU(N: number, J: number, t: number, M: number, order: 1 | 2 = 1): Mat {
  checkChain(N, 'trotterU')
  need(isInt(M) && M >= 1 && M <= 1000, 'trotterU: M is a whole number of pieces, 1…1000')
  need(order === 1 || order === 2, 'trotterU: order 1 or 2')
  const P = trotterPiece(N, J, t / M, order)
  let U = identity(2 ** N)
  for (let k = 0; k < M; k++) U = matmul(P, U)
  return U
}

/** The operator 2-norm (largest singular value) of a matrix. */
export const opNorm = (A: Mat): number => svd(A).s[0]

/** ‖U(t) − [Trotter piece]^M‖ in the operator 2-norm. */
export function trotterError(N: number, J: number, t: number, M: number, order: 1 | 2 = 1): number {
  return opNorm(msub(trotterU(N, J, t, M, order), chainU(N, J, t)))
}
/** ‖[H_a, H_b]‖ of two bond Hamiltonians (default the first two bonds; 0.4330 = √3/4 at J = 1). */
export function commutatorNorm(N: number, J = 1, a = 0, b = 1): number {
  checkChain(N, 'commutatorNorm')
  need(isInt(a) && isInt(b) && a >= 0 && b >= 0 && a < N - 1 && b < N - 1, 'commutatorNorm: bond numbers 0…N-2')
  const A = bondOnChain(N, J, a)
  const B = bondOnChain(N, J, b)
  return opNorm(msub(matmul(A, B), matmul(B, A)))
}
/** The first-order bound t²/(2M) Σ_{a<b} ‖[H_a, H_b]‖ on ‖U(t) − [U_1(t/M)U_2(t/M)…]^M‖ (Bergou 7.82; N&C Thm 4.3). */
export function trotterBound(N: number, J: number, t: number, M: number): number {
  checkChain(N, 'trotterBound')
  let s = 0
  for (let a = 0; a < N - 1; a++) for (let b = a + 1; b < N - 1; b++) s += commutatorNorm(N, J, a, b)
  return (t * t * s) / (2 * M)
}
/** The least number of pieces M (1…maxM) with ‖U(t) − product‖ < eps; null if none. */
export function trotterMFor(N: number, J: number, t: number, order: 1 | 2, eps: number, maxM = 200): number | null {
  const exact = chainU(N, J, t)
  for (let M = 1; M <= maxM; M++) if (opNorm(msub(trotterU(N, J, t, M, order), exact)) < eps) return M
  return null
}

/**
 * The Trotter circuit on the 3-spin chain from |100> (one spin flipped on the top wire): per piece one `unitary` box per bond gate (two wires each,
 * heisenbergBond), order 1: U₁ on wires 0-1 then U₂ on wires 1-2 (2M columns); order 2: U₁(½), U₂, U₁(½) (3M columns). t is the total time.
 */
export function trotterCircuit(M: number, order: 1 | 2 = 1, t = 2, J = 1): Circuit {
  need(isInt(M) && M >= 1 && M <= 40, 'trotterCircuit: M is a whole number of pieces, 1…40')
  need(order === 1 || order === 2, 'trotterCircuit: order 1 or 2')
  const tau = t / M
  const box = (b: number, s: number, label: string): Op[] => [
    { op: 'unitary', matrix: heisenbergBond(J * s).map((row) => row.map((z): [number, number] => [z.re, z.im])), targets: [b, b + 1], label },
  ]
  const piece: Op[][] = order === 1 ? [box(0, tau, 'U₁'), box(1, tau, 'U₂')] : [box(0, tau / 2, 'U₁/2'), box(1, tau, 'U₂'), box(0, tau / 2, 'U₁/2')]
  return { version: 1, qubits: 3, init: '100', wires: ['s₁', 's₂', 's₃'], columns: Array.from({ length: M }, () => piece).flat() }
}

/** The chance of the flipped spin on each of the N sites, from |10…0>: exact (M omitted) or after M Trotter pieces. */
export function magnonChances(N: number, J: number, t: number, M?: number, order: 1 | 2 = 1): number[] {
  const U = M === undefined ? chainU(N, J, t) : trotterU(N, J, t, M, order)
  const out = U.map((row) => row[2 ** (N - 1)]) // the column of |10…0>
  return Array.from({ length: N }, (_, k) => {
    const z = out[2 ** (N - 1 - k)]
    return z.re ** 2 + z.im ** 2
  })
}
/** The same exact chances from the N×N hopping matrix of the one-flip subspace: −J/2 between neighbours, J(N-1)/4 − (J/2)(bonds not touching the site) on the diagonal. */
export function magnonHopping(N: number, J: number, t: number): number[] {
  checkChain(N, 'magnonHopping')
  const h: Mat = Array.from({ length: N }, (_, i) =>
    Array.from({ length: N }, (_, j) => {
      if (i === j) {
        const touching = (i > 0 ? 1 : 0) + (i < N - 1 ? 1 : 0)
        return c((J * (N - 1)) / 4 - (J / 2) * (N - 1 - touching))
      }
      return Math.abs(i - j) === 1 ? c(-J / 2) : c(0)
    }),
  )
  const col = expmHermitian(h, t).map((row) => row[0])
  return col.map((z) => z.re ** 2 + z.im ** 2)
}
/** max |exact chances − hopping-matrix chances|: two routes to the same numbers. */
export function magnonRoutesGap(N: number, J: number, t: number): number {
  const a = magnonChances(N, J, t)
  const b = magnonHopping(N, J, t)
  return Math.max(...a.map((x, i) => Math.abs(x - b[i])))
}
/** The one-flip subspace's block of the full Hamiltonian, to compare with the hopping matrix (max entry gap). */
export function magnonBlockGap(N: number, J: number): number {
  const H = chainH(N, J)
  const idx = Array.from({ length: N }, (_, k) => 2 ** (N - 1 - k))
  let g = 0
  idx.forEach((a, i) =>
    idx.forEach((b, j) => {
      const want = i === j ? (J * (N - 1)) / 4 - (J / 2) * (N - 1 - ((i > 0 ? 1 : 0) + (i < N - 1 ? 1 : 0))) : Math.abs(i - j) === 1 ? -J / 2 : 0
      g = Math.max(g, Math.abs(H[a][b].re - want), Math.abs(H[a][b].im))
    }),
  )
  return g
}

/** 2^N, the amplitudes a classical computer must store for N spins. */
export function amplitudeCount(N: number): number {
  need(isInt(N) && N >= 0 && N <= 1000, 'amplitudeCount: N is a whole number of spins, 0…1000')
  return 2 ** N
}
/** Petabytes (10^15 bytes) for 2^N amplitudes at `bytes` each (16: two doubles). */
export const amplitudePB = (N: number, bytes = 16): number => (amplitudeCount(N) * bytes) / 1e15
/** The N − 1 two-spin terms of the chain. */
export const chainTerms = (N: number): number => {
  need(isInt(N) && N >= 2, 'chainTerms: N ≥ 2')
  return N - 1
}
