/**
 * Photons and linear optics (Physics 709 chapter Q26, "Qubits made of light"; Bergou Chapter 14, pp. 253-267).
 *
 * Conventions. Ports 0 and 1 go in, ports 2 and 3 come out; the one-photon amplitudes transform with S = [[t', r], [r', t]] (rows = exit, columns = entrance). A Fock state
 * |n0 n1 ...> has n_j photons in mode j; the many-photon amplitudes are permanents of S (<m|U|n> = perm(S_{m,n}) / sqrt(prod n! prod m!)). A Fock label is a name for an occupation, NOT a
 * two-qubit register: where a circuit draws two occupation wires, bit strings stand for occupations (00 = |20>, 01 = |11>, 10 = |02> in the two-photon block). Three splitter
 * conventions are used and all are checked: real S = [[t, r], [-r, t]] (Bergou p. 255), symmetric (1/sqrt2)[[1, i], [i, 1]] (Fig. 14.5) and Chapter Q5's (1/sqrt2)[[1, -1], [1, 1]].
 * Wave plates: U(theta, varphi) = [[cos theta, i e^{-i varphi} sin theta], [i e^{i varphi} sin theta, cos theta]], so U|0> has relative phase varphi + 90 degrees (Correction K1).
 *
 * Checked against an independent numpy route (pipeline/photon_numpy.py: the exponential of the mode generator on a truncated Fock space, permanents by itertools, sympy
 * polynomials, scipy fsolve, explicit Bell projectors). Rule (l): imported only by the lazy chapter values (content/qc709/Q26.values.ts), the lazy `plot` tables and tests,
 * never by the entry closure. Pure TypeScript (qc/purity.test.ts).
 */
import { type C, ONE, abs, abs2, add, arg, c, conj, expi, mul, scale, sub } from '../complex'
import { type Mat, type Vec, apply, dagger, identity, inner, matmul, maxDiff } from '../linalg'
import { rng } from '../random'
import { eigh, kronM, randomUnitary } from './cmat'
import { type Circuit, type GateName, type GateOp, type Op, runCircuit } from './circuit'
import { cnot } from './gates'
import { kron, kronAll, ket } from './state'

const DEG = Math.PI / 180
const S2 = Math.SQRT1_2

const rows = (m: Mat): [number, number][][] => m.map((row) => row.map((z): [number, number] => [z.re, z.im]))
const box = (M: Mat, targets: number[], label?: string): Op => ({ op: 'unitary', matrix: rows(M), targets, ...(label ? { label } : {}) })
const gate = (g: GateName, targets: number[], extra: Partial<GateOp> = {}): Op => ({ op: 'gate', gate: g, targets, ...extra })
const zeros = (n: number): Mat => Array.from({ length: n }, () => Array.from({ length: n }, () => c(0)))
const maxAbsDiff = (a: Vec, b: Vec): number => Math.max(...a.map((z, i) => abs(sub(z, b[i]))))

/* ------------------------------------------------------------------ polarization and path qubits (Bergou pp. 253-258) ------------------------------------------------------------------ */

/** The wave-plate pair U(theta, varphi) (degrees): [[cos, i e^{-i varphi} sin], [i e^{i varphi} sin, cos]], unitary. */
export function waveUnitary(thetaDeg: number, phiDeg: number): Mat {
  const co = Math.cos(thetaDeg * DEG)
  const si = Math.sin(thetaDeg * DEG)
  return [
    [c(co), mul(c(0, si), expi(-phiDeg * DEG))],
    [mul(c(0, si), expi(phiDeg * DEG)), c(co)],
  ]
}
/** U(theta, varphi)|0>: cos theta |0> + i e^{i varphi} sin theta |1> (the page prints the phase as varphi; it is varphi + 90 degrees). */
export const waveKet = (thetaDeg: number, phiDeg: number): Vec => apply(waveUnitary(thetaDeg, phiDeg), [c(1), c(0)])
/** The dual-rail state cos theta |0> + e^{i varphi} sin theta |1> (a splitter of transmission cos theta, then a phase varphi on path 1; Fig. 14.3). */
export const dualRailKet = (thetaDeg: number, phiDeg: number): Vec => [c(Math.cos(thetaDeg * DEG)), mul(c(Math.sin(thetaDeg * DEG)), expi(phiDeg * DEG))]
/** The Bloch polar angle (degrees) of a one-qubit ket: 2 atan2(|b|, |a|). */
export const blochPolarDeg = (psi: Vec): number => (2 * Math.atan2(abs(psi[1]), abs(psi[0]))) / DEG
/** The relative phase arg(b/a) (degrees, (-180, 180]) of a one-qubit ket (a, b). */
export const relativePhaseDeg = (psi: Vec): number => arg(mul(psi[1], conj(psi[0]))) / DEG
/** The chance of |1> after the plates, from the engine's ket. */
export const waveP1 = (thetaDeg: number, phiDeg: number): number => abs2(waveKet(thetaDeg, phiDeg)[1])
/** The Bloch polar angle of cos theta |0> + sin theta e^{i phi}|1> by the page's own words: 2 theta (the doubling of Chapter L7). */
export const doubledAngleGap = (thetaDeg: number, phiDeg: number): number => Math.abs(blochPolarDeg(waveKet(thetaDeg, phiDeg)) - 2 * thetaDeg)

/** One wire from |0>: the plates as a `unitary` box 'U'. */
export const waveCircuit = (thetaDeg: number, phiDeg: number): Circuit => ({ version: 1, qubits: 1, init: '0', wires: ['H'], columns: [[box(waveUnitary(thetaDeg, phiDeg), [0], 'U')]] })
/** One wire from |0>: a real splitter of transmission cos theta (box 'BS'), then the phase P(varphi) on path 1; bar 0 = path 0 (Fig. 14.3). */
export function dualRailCircuit(thetaDeg: number, phiDeg: number): Circuit {
  const th = thetaDeg * DEG
  const bs: Mat = [
    [c(Math.cos(th)), c(-Math.sin(th))],
    [c(Math.sin(th)), c(Math.cos(th))],
  ]
  return { version: 1, qubits: 1, init: '0', wires: ['path'], columns: [[box(bs, [0], 'BS')], [gate('P', [0], { params: [phiDeg * DEG] })]] }
}

/* ------------------------------------------------------------------ splitters and the Stokes relations (Eqs. 14.1-14.2) ------------------------------------------------------------------ */

/** The real splitter of reflectivity R: S = [[t, r], [-r, t]], t = sqrt(1 - R), r = sqrt(R) (so t' = t, r' = -r). */
export function bsReal(R: number): Mat {
  const t = Math.sqrt(1 - R)
  const r = Math.sqrt(R)
  return [
    [c(t), c(r)],
    [c(-r), c(t)],
  ]
}
/** Fig. 14.5's balanced splitter (1/sqrt2)[[1, i], [i, 1]]. */
export const bsSym = (): Mat => [
  [c(S2), c(0, S2)],
  [c(0, S2), c(S2)],
]
/** Chapter Q5's balanced splitter R_y(pi/2) = (1/sqrt2)[[1, -1], [1, 1]]. */
export const bsQ5 = (): Mat => [
  [c(S2), c(-S2)],
  [c(S2), c(S2)],
]
/** The four numbers of S = [[t', r], [r', t]]. */
export const stokesNumbers = (S: Mat): { t1: C; r: C; r1: C; t: C } => ({ t1: S[0][0], r: S[0][1], r1: S[1][0], t: S[1][1] })
/** The six Stokes relations as residuals: the four squared-size sums minus 1, then r t'* + r'* t and r t* + r'* t' (all 0 for a lossless splitter). */
export function stokesRelations(S: Mat): number[] {
  const { t1, r, r1, t } = stokesNumbers(S)
  const a = abs2(r) + abs2(t) - 1
  const b = abs2(r1) + abs2(t1) - 1
  const cc = abs2(r) + abs2(t1) - 1
  const dd = abs2(r1) + abs2(t) - 1
  const e = abs(add(mul(r, conj(t1)), mul(conj(r1), t)))
  const f = abs(add(mul(r, conj(t)), mul(conj(r1), t1)))
  return [a, b, cc, dd, e, f].map(Math.abs)
}
/** The largest Stokes residual of S. */
export const stokesGap = (S: Mat): number => Math.max(...stokesRelations(S))
/** The gap of S S-dagger to the identity. */
export const unitarityGap = (S: Mat): number => maxDiff(matmul(S, dagger(S)), identity(2))
/** The three conventions of the chapter, and the real one at eleven reflectivities. */
export const conventions = (): Mat[] => [bsSym(), bsQ5(), ...Array.from({ length: 11 }, (_, k) => bsReal(k / 10))]
/** The largest Stokes residual over the conventions and `count` seeded random lossless splitters (Haar unitaries). */
export function stokesGapSweep(count = 200, seed = 26): number {
  const rand = rng(seed)
  const set = [...conventions(), ...Array.from({ length: count }, () => randomUnitary(2, rand))]
  return Math.max(...set.map(stokesGap))
}
/** The largest of the Stokes residual and the unitarity gap over the three named conventions (50:50 real, symmetric, Q5). */
export const conventionGap = (): number => Math.max(...[bsReal(0.5), bsSym(), bsQ5()].map((S) => Math.max(stokesGap(S), unitarityGap(S))))
/** A seeded random lossless 50:50 splitter: [[a, b], [-e^{i chi} b*, e^{i chi} a*]] with |a| = |b| = 1/sqrt2. */
export function randomBalanced(rand: () => number): Mat {
  const a = scale(expi(2 * Math.PI * rand()), S2)
  const b = scale(expi(2 * Math.PI * rand()), S2)
  const e = expi(2 * Math.PI * rand())
  return [
    [a, b],
    [scale(mul(e, conj(b)), -1), mul(e, conj(a))],
  ]
}

/** One wire from |0>: the splitter as a `unitary` box 'S' (a photon entering port 0 leaves as the first column (t', r')). */
export const splitterCircuit = (S: Mat): Circuit => ({ version: 1, qubits: 1, init: '0', wires: ['exit'], columns: [[box(S, [0], 'S')]] })
/** Two splitters in a row, one wire from |0>. */
export const twoSplitterCircuit = (S: Mat): Circuit => ({ version: 1, qubits: 1, init: '0', wires: ['exit'], columns: [[box(S, [0], 'S')], [box(S, [0], 'S')]] })
/**
 * One photon in port 0 as two occupation wires (modes 2 and 3 of the exits): the box carries the one-photon block of S on {|10>, |01>} and the identity on |00>, |11>. The input
 * state |10> leaves as t'|10> + r'|01>: entangled exits.
 */
export function entCircuit(S: Mat): Circuit {
  const U = zeros(4)
  U[0][0] = c(1)
  U[3][3] = c(1)
  U[2][2] = S[0][0] // |10> -> t' |10>
  U[1][2] = S[1][0] // |10> -> r' |01>
  U[2][1] = S[0][1] // |01> -> r |10>
  U[1][1] = S[1][1] // |01> -> t |01>
  return { version: 1, qubits: 2, init: '10', wires: ['mode 2', 'mode 3'], columns: [[box(U, [0, 1], 'BS')]] }
}

/* ------------------------------------------------------------------ permanents and Fock amplitudes ------------------------------------------------------------------ */

/** The permanent of a square complex matrix, by a dynamic programme over the used columns (n at most 10). */
export function permanent(A: Mat): C {
  const n = A.length
  if (n > 10) throw new Error('permanent: at most 10 photons')
  const re = new Float64Array(1 << n)
  const im = new Float64Array(1 << n)
  re[0] = 1
  for (let mask = 0; mask < 1 << n; mask++) {
    if (re[mask] === 0 && im[mask] === 0) continue
    let row = 0
    for (let m = mask; m; m &= m - 1) row++
    if (row >= n) continue
    for (let j = 0; j < n; j++) {
      if (mask & (1 << j)) continue
      const a = A[row][j]
      re[mask | (1 << j)] += re[mask] * a.re - im[mask] * a.im
      im[mask | (1 << j)] += re[mask] * a.im + im[mask] * a.re
    }
  }
  return c(re[(1 << n) - 1], im[(1 << n) - 1])
}
const factorial = (n: number): number => (n <= 1 ? 1 : n * factorial(n - 1))
/** All occupations of `total` photons in `modes` modes, the first mode's count falling from `total` (so two modes give |N 0>, |N-1 1>, ..., |0 N>). */
export function compositions(total: number, modes: number): number[][] {
  if (modes === 1) return [[total]]
  const out: number[][] = []
  for (let k = total; k >= 0; k--) for (const rest of compositions(total - k, modes - 1)) out.push([k, ...rest])
  return out
}
/**
 * The amplitude <nout| U |nin> of the linear-optics unitary whose one-photon matrix is M (rows = exit modes, columns = entrance modes):
 * perm of the matrix with row j repeated nout[j] times and column k repeated nin[k] times, over sqrt(prod nin! prod nout!).
 */
export function fockAmp(M: Mat, nin: readonly number[], nout: readonly number[]): C {
  const N = nin.reduce((a, b) => a + b, 0)
  if (N !== nout.reduce((a, b) => a + b, 0)) throw new Error('fockAmp: photon number is conserved')
  if (M.length !== nout.length || M[0].length !== nin.length) throw new Error('fockAmp: M is (exit modes) x (entrance modes)')
  const rowMode = nout.flatMap((n, j) => Array(n).fill(j) as number[])
  const colMode = nin.flatMap((n, k) => Array(n).fill(k) as number[])
  const A = rowMode.map((j) => colMode.map((k) => M[j][k]))
  const norm = Math.sqrt(nin.reduce((p, n) => p * factorial(n), 1) * nout.reduce((p, n) => p * factorial(n), 1))
  return scale(permanent(A), 1 / norm)
}
/** The (n+1) x (n+1) unitary of n photons on two modes, in the basis |n-k, k> (index k = photons in the second mode). */
export function fockBlock(S: Mat, n: number): Mat {
  return Array.from({ length: n + 1 }, (_, a) => Array.from({ length: n + 1 }, (_, b) => fockAmp(S, [n - b, b], [n - a, a])))
}

/** A Fock state over several modes: occupations (as "n0,n1,...") to amplitudes. */
export type Fock = Map<string, C>
const fkey = (occ: readonly number[]): string => occ.join(',')
const addTo = (m: Fock, k: string, a: C) => m.set(k, add(m.get(k) ?? c(0), a))
/** A single occupation, amplitude 1. */
export const fockVacuum = (occ: readonly number[]): Fock => new Map([[fkey(occ), ONE]])
/** Apply the linear-optics unitary of M (square) to the listed modes of a Fock state; the other modes pass through. */
export function fockApply(state: Fock, M: Mat, modes: readonly number[]): Fock {
  const out: Fock = new Map()
  for (const [k, a] of state) {
    const occ = k.split(',').map(Number)
    const nin = modes.map((m) => occ[m])
    const N = nin.reduce((x, y) => x + y, 0)
    if (N === 0) {
      addTo(out, k, a)
      continue
    }
    for (const nout of compositions(N, modes.length)) {
      const amp = fockAmp(M, nin, nout)
      if (abs2(amp) < 1e-30) continue
      const o2 = occ.slice()
      modes.forEach((m, i) => (o2[m] = nout[i]))
      addTo(out, fkey(o2), mul(a, amp))
    }
  }
  return out
}
/** The ideal nonlinear sign gate on one mode: |0> and |1> unchanged, |2> turned over (every other count is outside the gate's definition and untouched). */
export function fockNs(state: Fock, mode: number): Fock {
  const out: Fock = new Map()
  for (const [k, a] of state) out.set(k, k.split(',').map(Number)[mode] === 2 ? scale(a, -1) : a)
  return out
}
/** The amplitude of one occupation (0 when absent). */
export const fockAmplitude = (state: Fock, occ: readonly number[]): C => state.get(fkey(occ)) ?? c(0)
/** The total chance of the occupations in the state. */
export const fockNorm = (state: Fock): number => [...state.values()].reduce((s, a) => s + abs2(a), 0)

/* ------------------------------------------------------------------ one photon in, two photons in (pp. 256-257) ------------------------------------------------------------------ */

/** The outputs {a20, a11, a02} for one photon in each port (input |11>: the middle column of the 3 x 3 block). */
export function twoPhoton(S: Mat): { a20: C; a11: C; a02: C } {
  const B = fockBlock(S, 2)
  return { a20: B[0][1], a11: B[1][1], a02: B[2][1] }
}
/** The chance of one photon at each exit for the real splitter of reflectivity R (the dip (1 - 2R)^2, by the permanent). */
export const homDip = (R: number): number => abs2(twoPhoton(bsReal(R)).a11)
/** The same chance for two photons that can be told apart: their chances add, |t'|^2 |t|^2 + |r|^2 |r'|^2 = (1 - R)^2 + R^2. */
export const distinguishable = (S: Mat): number => abs2(S[0][0]) * abs2(S[1][1]) + abs2(S[0][1]) * abs2(S[1][0])
/** The relative phase (degrees, 0 to 180) between the |02> and |20> amplitudes of one photon per port. */
export const homPhaseDeg = (S: Mat): number => {
  const { a20, a02 } = twoPhoton(S)
  return Math.abs(arg(mul(a02, conj(a20)))) / DEG
}
/** The middle amplitude t't + r'r (zero for every lossless 50:50 splitter). */
export const homMiddle = (S: Mat): C => twoPhoton(S).a11
/** max |t't + r'r| over `count` seeded random lossless 50:50 splitters, and over the named balanced ones. */
export function homCancelGap(count = 200, seed = 26): number {
  const rand = rng(seed)
  const set = [bsReal(0.5), bsSym(), bsQ5(), ...Array.from({ length: count }, () => randomBalanced(rand))]
  return Math.max(...set.map((S) => abs(add(mul(S[0][0], S[1][1]), mul(S[1][0], S[0][1])))))
}
/** The 4 x 4 box of the two-photon block: indices 00, 01, 10 stand for |20>, |11>, |02>; 11 is untouched. */
export function homBox(S: Mat): Mat {
  const B = fockBlock(S, 2)
  const U = zeros(4)
  for (let a = 0; a < 3; a++) for (let b = 0; b < 3; b++) U[a][b] = B[a][b]
  U[3][3] = c(1)
  return U
}
/** Two wires from |01> (= |11> as occupations): the box carries the two-photon block of S; bars 00, 01, 10 are |20>, |11>, |02>. */
export const homCircuit = (S: Mat): Circuit => ({ version: 1, qubits: 2, init: '01', wires: ['mode 2', 'mode 3'], columns: [[box(homBox(S), [0, 1], 'BS')]] })
/** The gap between the embedded block's circuit and the closed forms sqrt2 t'r, t't + r'r, sqrt2 r't, over `count` random lossless splitters. */
export function twoPhotonFormulaGap(count = 50, seed = 26): number {
  const rand = rng(seed)
  let g = 0
  for (const S of [bsReal(0.25), bsSym(), bsQ5(), ...Array.from({ length: count }, () => randomUnitary(2, rand))]) {
    const { t1, r, r1, t } = stokesNumbers(S)
    const w = twoPhoton(S)
    g = Math.max(g, abs(sub(w.a20, scale(mul(t1, r), Math.SQRT2))), abs(sub(w.a11, add(mul(t1, t), mul(r1, r)))), abs(sub(w.a02, scale(mul(r1, t), Math.SQRT2))))
  }
  return g
}
/** The gap between `circuitUnitary`-style evolution of the circuit (runCircuit) and the block (the drawn state against the amplitudes). */
export function homCircuitGap(S: Mat): number {
  const st = runCircuit(homCircuit(S)).states.at(-1)!
  const w = twoPhoton(S)
  return maxAbsDiff(st, [w.a20, w.a11, w.a02, c(0)])
}

/* ------------------------------------------------------------------ the nonlinear sign gate (Fig. 14.4, pp. 258-259) ------------------------------------------------------------------ */

/**
 * The linear map of Fig. 14.4 from the entrance modes (signal in H, ancilla in V) to the exits (signal out, detector 0, detector 1): rotator theta, PBS (H on, V to detector 0),
 * the ancilla's V joining the signal's H, rotator varphi, PBS (H out, V to detector 1). 3 x 2, columns orthonormal.
 */
export function nsMatrix(thetaDeg: number, phiDeg: number): Mat {
  const ct = Math.cos(thetaDeg * DEG)
  const st = Math.sin(thetaDeg * DEG)
  const cp = Math.cos(phiDeg * DEG)
  const sp = Math.sin(phiDeg * DEG)
  return [
    [c(ct * cp), c(-sp)],
    [c(st), c(0)],
    [c(ct * sp), c(cp)],
  ]
}
/** The amplitude A_n of |n> in the signal exit with the detectors reading 0 and 1 (n signal photons and the ancilla in), n = 0..nMax, by permanents. */
export const nsAmplitudes = (thetaDeg: number, phiDeg: number, nMax: number): number[] =>
  Array.from({ length: nMax + 1 }, (_, n) => fockAmp(nsMatrix(thetaDeg, phiDeg), [n, 1], [n, 0, 1]).re)
/** The closed form A_n = cos^n theta cos^{n-1} varphi (cos^2 varphi - n sin^2 varphi). */
export function nsClosed(thetaDeg: number, phiDeg: number, n: number): number {
  const ct = Math.cos(thetaDeg * DEG)
  const cp = Math.cos(phiDeg * DEG)
  const sp = Math.sin(phiDeg * DEG)
  return ct ** n * cp ** (n - 1) * (cp * cp - n * sp * sp)
}
/** The gap between the permanents and the closed form for n = 0..nMax. */
export const nsFormulaGap = (thetaDeg: number, phiDeg: number, nMax = 4): number =>
  Math.max(...nsAmplitudes(thetaDeg, phiDeg, nMax).map((a, n) => Math.abs(a - nsClosed(thetaDeg, phiDeg, n))))
/** The ratios A_n / A_0 (n = 0..nMax). */
export const nsRatios = (thetaDeg: number, phiDeg: number, nMax: number): number[] => {
  const A = nsAmplitudes(thetaDeg, phiDeg, nMax)
  return A.map((a) => a / A[0])
}
/**
 * The two printed conditions A_1/A_0 = 1 and A_2/A_0 = -1 reduce, with x = cos^2 varphi, to 7x^2 - 6x + 1 = 0, x = (3 -+ sqrt2)/7, and cos theta = cos varphi / cos 2 varphi.
 * The root x = 0.2265 keeps |cos theta| <= 1; the other gives cos theta = 3.04. Returns the angles (degrees), the success chance A_0^2 = x and the other root's cos theta.
 */
export function nsSolve(): { thetaDeg: number; phiDeg: number; success: number; cosTheta: number; otherRoot: number; otherCosTheta: number } {
  const disc = Math.sqrt(36 - 28)
  const roots = [(6 - disc) / 14, (6 + disc) / 14]
  const cosThetaOf = (x: number) => Math.sqrt(x) / (2 * x - 1)
  const good = roots.find((x) => Math.abs(cosThetaOf(x)) <= 1)!
  const other = roots.find((x) => x !== good)!
  return { thetaDeg: Math.acos(cosThetaOf(good)) / DEG, phiDeg: Math.acos(Math.sqrt(good)) / DEG, success: good, cosTheta: cosThetaOf(good), otherRoot: other, otherCosTheta: cosThetaOf(other) }
}
/** The chance both gates of a controlled-sign gate fire: P_NS squared. */
export const czSuccess = (): number => nsSolve().success ** 2
/** The mean number of attempts per success, 1 / p. */
export const attempts = (p: number): number => 1 / p
/** The sign gate on the Fock simulation, as a check: input c0|0> + c1|1> + c2|2> on the signal mode comes out as A_0 (c0, c1, -c2) when theta, varphi solve the conditions (the gap). */
export function nsSignGap(): number {
  const { thetaDeg, phiDeg } = nsSolve()
  const A = nsAmplitudes(thetaDeg, phiDeg, 2)
  return Math.max(Math.abs(A[1] - A[0]), Math.abs(A[2] + A[0]))
}

/* ------------------------------------------------------------------ the photonic CZ (Fig. 14.5, pp. 259-260) ------------------------------------------------------------------ */

const XSWAP: Mat = [
  [c(0), c(1)],
  [c(1), c(0)],
]
/**
 * Two dual-rail qubits on four modes (qubit 1 on modes 0, 1; qubit 2 on modes 2, 3); the inner rails (modes 1 and 2) meet on the symmetric splitter, optionally pass an ideal nonlinear
 * sign gate each, cross, and meet again. Returns the 4 x 4 gate on the code space (index = 2 q1 + q2): diag(i, 1, -1, i) without the gates, diag(i, 1, 1, i) with them.
 */
export function czDualRail(withNs: boolean): Mat {
  const U = zeros(4)
  for (let q = 0; q < 4; q++) {
    const occ = [0, 0, 0, 0]
    occ[q >> 1] = 1
    occ[2 + (q & 1)] = 1
    let st = fockApply(fockVacuum(occ), bsSym(), [1, 2])
    if (withNs) st = fockNs(fockNs(st, 1), 2)
    st = fockApply(st, XSWAP, [1, 2])
    st = fockApply(st, bsSym(), [1, 2])
    for (let p = 0; p < 4; p++) {
      const out = [0, 0, 0, 0]
      out[p >> 1] = 1
      out[2 + (p & 1)] = 1
      U[p][q] = fockAmplitude(st, out)
    }
  }
  return U
}
/** The largest chance that the network leaves the code space (one photon in each qubit's rails), over the four inputs. */
export function czLeak(withNs: boolean): number {
  let worst = 0
  for (let q = 0; q < 4; q++) {
    const occ = [0, 0, 0, 0]
    occ[q >> 1] = 1
    occ[2 + (q & 1)] = 1
    let st = fockApply(fockVacuum(occ), bsSym(), [1, 2])
    if (withNs) st = fockNs(fockNs(st, 1), 2)
    st = fockApply(fockApply(st, XSWAP, [1, 2]), bsSym(), [1, 2])
    let inside = 0
    for (let p = 0; p < 4; p++) {
      const out = [0, 0, 0, 0]
      out[p >> 1] = 1
      out[2 + (p & 1)] = 1
      inside += abs2(fockAmplitude(st, out))
    }
    worst = Math.max(worst, Math.abs(fockNorm(st) - inside))
  }
  return worst
}
/** The gate table diag(i, 1, -1, i) or diag(i, 1, 1, i) as it is printed (the check of `czDualRail`). */
export const czPrinted = (withNs: boolean): Mat => {
  const d = [c(0, 1), c(1), c(withNs ? 1 : -1), c(0, 1)]
  return d.map((z, i) => d.map((_, j) => (i === j ? z : c(0))))
}
/** Two wires from |++>: the gate as a `unitary` box 'U'. */
export const czCircuit = (withNs: boolean): Circuit => ({ version: 1, qubits: 2, init: '++', wires: ['qubit 1', 'qubit 2'], columns: [[box(czDualRail(withNs), [0, 1], 'U')]] })

/* ------------------------------------------------------------------ gate teleportation and KLM (Figs. 14.6-14.8, pp. 260-263) ------------------------------------------------------------------ */

/** The resource |r> as four wires from |0000>: H on 0 and 2, CNOT 0->1, CNOT 2->3, CNOT 0->3 (five columns). */
export const resCircuit = (): Circuit => ({
  version: 1,
  qubits: 4,
  init: '0000',
  wires: ['r₀', 'r₁', 'r₂', 'r₃'],
  columns: [[gate('H', [0])], [gate('H', [2])], [gate('X', [1], { controls: [0] })], [gate('X', [3], { controls: [2] })], [gate('X', [3], { controls: [0] })]],
})
/** The printed state |r> = (|0000> + |0011> + |1110> + |1101>)/2 as a vector. */
export function resourcePrinted(): Vec {
  const v = Array.from({ length: 16 }, () => c(0))
  for (const s of ['0000', '0011', '1110', '1101']) v[parseInt(s, 2)] = c(0.5)
  return v
}
/** The gap between the prepared resource and the printed state. */
export const resourceGap = (): number => maxAbsDiff(runCircuit(resCircuit()).states.at(-1)!, resourcePrinted())
/**
 * The whole gate-teleportation circuit of Fig. 14.7 on six wires (c, t, r0, r1, r2, r3): the five preparation columns of |r>, then CNOT c->r0 and t->r2, then H on c and t, then the four
 * readings c, r0, t, r2 (bits 0 to 3). Six wires: the engine runs it, the stage cannot draw it (five-wire cap).
 */
export const gtCircuit = (): Circuit => ({
  version: 1,
  qubits: 6,
  clbits: 4,
  init: '000000',
  wires: ['c', 't', 'r₀', 'r₁', 'r₂', 'r₃'],
  columns: [
    [gate('H', [2])],
    [gate('H', [4])],
    [gate('X', [3], { controls: [2] })],
    [gate('X', [5], { controls: [4] })],
    [gate('X', [5], { controls: [2] })],
    [gate('X', [2], { controls: [0] }), gate('X', [4], { controls: [1] })],
    [gate('H', [0]), gate('H', [1])],
    [
      { op: 'measure', qubit: 0, bit: 0 },
      { op: 'measure', qubit: 2, bit: 1 },
      { op: 'measure', qubit: 1, bit: 2 },
      { op: 'measure', qubit: 4, bit: 3 },
    ],
  ],
})
/** One qubit teleported through half of a Bell pair (three wires c, r0, r1; two readings): the single-qubit pattern each input of the gate circuit follows. */
export const teleportOneCircuit = (): Circuit => ({
  version: 1,
  qubits: 3,
  clbits: 2,
  init: '000',
  wires: ['c', 'r₀', 'r₁'],
  columns: [[gate('H', [1])], [gate('X', [2], { controls: [1] })], [gate('X', [1], { controls: [0] })], [gate('H', [0])], [{ op: 'measure', qubit: 0, bit: 0 }, { op: 'measure', qubit: 1, bit: 1 }]],
})
const PAULI_LIST: Mat[] = [
  [[c(1), c(0)], [c(0), c(1)]],
  [[c(0), c(1)], [c(1), c(0)]],
  [[c(0), c(0, -1)], [c(0, 1), c(0)]],
  [[c(1), c(0)], [c(0), c(-1)]],
]
/**
 * Run the circuit of Fig. 14.7 on the inputs c and t with the four readings `outcome` (a 4-bit string, bits 0 to 3 = c, r0, t, r2): the chance of those readings, and whether one Pauli
 * on the two outputs (wires r1, r3) leaves exactly CNOT|c, t>. `gap` is one minus the best overlap over all sixteen Paulis (about 1e-16 when one works). No table of which Pauli is
 * exposed (Bergou's third problem).
 */
export function cnotTeleport(cKet: Vec, tKet: Vec, outcome: string): { chance: number; fixed: boolean; gap: number } {
  const psi0 = kronAll([cKet, tKet, ket('0000')])
  const run = runCircuit(gtCircuit(), { outcomes: outcome, psi0 })
  const fin = run.states.at(-1)!
  const o = [...outcome].map(Number)
  const out: Vec = []
  for (let a = 0; a < 2; a++) for (let b = 0; b < 2; b++) {
    const bits = [o[0], o[2], o[1], a, o[3], b] // wires c, t, r0, r1, r2, r3
    out.push(fin[parseInt(bits.join(''), 2)])
  }
  const target = apply(cnot(0, 1, 2), kron(cKet, tKet))
  let best = 0
  for (const P1 of PAULI_LIST) for (const P2 of PAULI_LIST) best = Math.max(best, abs(inner(target, apply(kronM(P1, P2), out))))
  return { chance: run.prob, fixed: 1 - best < 1e-9, gap: 1 - best }
}
/** The largest `gap` over all sixteen readings and `count` seeded random pairs of inputs, and the smallest and largest chance of a reading. */
export function cnotTeleportSweep(count = 6, seed = 26): { gap: number; minChance: number; maxChance: number; allFixed: boolean } {
  const rand = rng(seed)
  const rk = (): Vec => {
    const th = Math.acos(1 - 2 * rand())
    return [c(Math.cos(th / 2)), mul(c(Math.sin(th / 2)), expi(2 * Math.PI * rand()))]
  }
  let gap = 0
  let lo = 1
  let hi = 0
  let all = true
  for (let k = 0; k < count; k++) {
    const cK = rk()
    const tK = rk()
    for (let m = 0; m < 16; m++) {
      const r = cnotTeleport(cK, tK, m.toString(2).padStart(4, '0'))
      gap = Math.max(gap, r.gap)
      lo = Math.min(lo, r.chance)
      hi = Math.max(hi, r.chance)
      all &&= r.fixed
    }
  }
  return { gap, minChance: lo, maxChance: hi, allFixed: all }
}
/** The two output wires (r1, r3) after the readings 0000 for the inputs c and t (the unfixed state): its two-qubit amplitudes. */
export function teleportOutput(cKet: Vec, tKet: Vec, outcome = '0000'): Vec {
  const fin = runCircuit(gtCircuit(), { outcomes: outcome, psi0: kronAll([cKet, tKet, ket('0000')]) }).states.at(-1)!
  const o = [...outcome].map(Number)
  const out: Vec = []
  for (let a = 0; a < 2; a++) for (let b = 0; b < 2; b++) out.push(fin[parseInt([o[0], o[2], o[1], a, o[3], b].join(''), 2)])
  return out
}
/** The ideal gate on |+>|0>: CNOT as a two-wire circuit (the picture of the teleported gate; its output is a Bell pair). */
export const cnotPlusZeroCircuit = (): Circuit => ({ version: 1, qubits: 2, init: '+0', wires: ['c', 't'], columns: [[gate('X', [1], { controls: [0] })]] })
/** The success chance of the KLM gate teleportation with n extra photons: (n/(n+1))^2. */
export const klmSuccess = (n: number): number => (n / (n + 1)) ** 2
/** The photons needed for a success F: n >= sqrt F / (1 - sqrt F); `exact` is the real bound, `n` the least whole number. */
export function klmNeeded(F: number): { exact: number; n: number } {
  const s = Math.sqrt(F)
  const exact = s / (1 - s)
  return { exact, n: Math.ceil(exact - 1e-9) }
}
/**
 * The chance that linear optics tells a Bell state from the other three on a balanced splitter with polarization-resolving detectors: two photons, one per port, in the four Bell
 * states of their polarizations; a detection pattern identifies a state when no other state can make it. Average over the four states: 1/2 (Psi+ and Psi- only).
 */
export function bellAnalyzerSuccess(): number {
  const M = kronM(bsSym(), identity(2)) // modes: port (a, b) x polarization (H, V)
  // Phi+- = (|aH bH> +- |aV bV>)/sqrt2 and Psi+- = (|aH bV> +- |aV bH>)/sqrt2, as occupations of [aH, aV, bH, bV]
  const bell: { first: number[]; second: number[]; sign: number }[] = [
    { first: [1, 0, 1, 0], second: [0, 1, 0, 1], sign: 1 },
    { first: [1, 0, 1, 0], second: [0, 1, 0, 1], sign: -1 },
    { first: [1, 0, 0, 1], second: [0, 1, 1, 0], sign: 1 },
    { first: [1, 0, 0, 1], second: [0, 1, 1, 0], sign: -1 },
  ]
  const patterns = bell.map(({ first, second, sign }) => {
    const out = fockApply(
      new Map([
        [fkey(first), c(S2)],
        [fkey(second), c(sign * S2)],
      ]),
      M,
      [0, 1, 2, 3],
    )
    return new Map([...out].map(([k, z]) => [k, abs2(z)] as const).filter(([, p]) => p > 1e-12))
  })
  let total = 0
  patterns.forEach((pm, i) => {
    for (const [k, p] of pm) if (patterns.every((q, j) => j === i || !q.has(k))) total += p
  })
  return total / 4
}

/* ------------------------------------------------------------------ nonlinear media (Eq. 14.3, pp. 263-266) ------------------------------------------------------------------ */

/** The cross-Kerr gate exp(i phi n1 n2) on the dual-rail code space: diag(1, 1, 1, e^{i phi}) from the two occupations. */
export const kerrGate = (phi: number): Mat => {
  const d = [0, 1, 2, 3].map((q) => expi(phi * (q >> 1) * (q & 1)))
  return d.map((z, i) => d.map((_, j) => (i === j ? z : c(0))))
}
/** Two wires from |++>: the controlled phase P(phi) on wire 1 controlled by wire 0 (the Kerr gate; CZ at phi = pi). */
export const kerrCircuit = (phi: number): Circuit => ({ version: 1, qubits: 2, init: '++', wires: ['qubit 1', 'qubit 2'], columns: [[gate('P', [1], { controls: [0], params: [phi] })]] })
/** Omega_n = Omega_0 sqrt(n + 1). */
export const jcRabi = (n: number, omega0: number): number => omega0 * Math.sqrt(n + 1)
/** The Jaynes-Cummings block on {|e, n>, |g, n+1>} measured from the bare level (n + 1/2) hbar omega: (1/2)[[Delta, Omega_n], [Omega_n, -Delta]], hbar = 1. */
export const jcBlock = (n: number, delta: number, omega0: number): Mat => {
  const w = jcRabi(n, omega0)
  return [
    [c(delta / 2), c(w / 2)],
    [c(w / 2), c(-delta / 2)],
  ]
}
/** The two dressed levels (lower, upper) of the block, by the eigenvalues of the 2 x 2 matrix. */
export const jcLevels = (n: number, delta: number, omega0: number): [number, number] => {
  const v = eigh(jcBlock(n, delta, omega0)).values
  return [v[0], v[1]]
}
/** The closed form (1/2) sqrt(Delta^2 + Omega_n^2). */
export const jcHalfSplit = (n: number, delta: number, omega0: number): number => 0.5 * Math.sqrt(delta * delta + jcRabi(n, omega0) ** 2)
/** The largest gap between the eigenvalues of the block and -+(1/2) sqrt(Delta^2 + Omega_n^2), for n = 0..nMax. */
export const jcEigenGap = (delta: number, omega0: number, nMax = 5): number =>
  Math.max(...Array.from({ length: nMax + 1 }, (_, n) => {
    const [lo, hi] = jcLevels(n, delta, omega0)
    const h = jcHalfSplit(n, delta, omega0)
    return Math.max(Math.abs(lo + h), Math.abs(hi - h))
  }))
/** The shift of the lower level against n = 0: E_-(n) - E_-(0) = -(1/2)(sqrt(Delta^2 + Omega_n^2) - sqrt(Delta^2 + Omega_0^2)). */
export const jcShift = (n: number, delta: number, omega0: number): number => jcLevels(n, delta, omega0)[0] - jcLevels(0, delta, omega0)[0]
/** The dispersive straight line -chi n. */
export const jcLine = (n: number, delta: number, omega0: number): number => 0 - jcChi(delta, omega0) * n
/** chi = Omega_0^2 / (4 |Delta|). */
export const jcChi = (delta: number, omega0: number): number => (omega0 * omega0) / (4 * Math.abs(delta))
/** The mixing angle tan^{-1}(Omega_n / |Delta|) in degrees. */
export const jcMixDeg = (n: number, delta: number, omega0: number): number => Math.atan2(jcRabi(n, omega0), Math.abs(delta)) / DEG
/** The time for a phase chi t = pi: pi / chi. */
export const jcPiTime = (delta: number, omega0: number): number => Math.PI / jcChi(delta, omega0)
/** The coherent-state amplitudes e^{-alpha^2/2} alpha^n / sqrt(n!) (real alpha), n = 0..N, by the ratio c_n = c_{n-1} alpha / sqrt n. */
export function coherentFock(alpha: number, N: number): number[] {
  const out = [Math.exp(-(alpha * alpha) / 2)]
  for (let n = 1; n <= N; n++) out.push((out[n - 1] * alpha) / Math.sqrt(n))
  return out
}
/** The photon-number chances |c_n|^2 of a Fock vector. */
export const fockChances = (amps: readonly number[]): number[] => amps.map((a) => a * a)
/** The mean photon number of a Fock vector. */
export const meanPhotons = (amps: readonly number[]): number => amps.reduce((s, a, n) => s + n * a * a, 0)
/** The normalised cat state (|alpha> + parity |-alpha>) in the Fock basis (parity +1 even, -1 odd), n = 0..N. */
export function catFock(alpha: number, parity: 1 | -1, N: number): number[] {
  const plus = coherentFock(alpha, N)
  const raw = plus.map((a, n) => a * (1 + parity * (n % 2 === 0 ? 1 : -1)))
  const norm = Math.sqrt(raw.reduce((s, a) => s + a * a, 0))
  return raw.map((a) => a / norm)
}
/** The closed-form norm 1/sqrt(2 (1 + parity e^{-2 alpha^2})) of the cat's un-normalised sum, from the series. */
export const catNorm = (alpha: number, parity: 1 | -1): number => 1 / Math.sqrt(2 * (1 + parity * Math.exp(-2 * alpha * alpha)))
/** |<beta|alpha>|^2 = e^{-|alpha - beta|^2} for real alpha, beta. */
export const coherentOverlap = (alpha: number, beta: number): number => Math.exp(-((alpha - beta) ** 2))
/** The same overlap by the Fock series (to N = 80): the gap to the closed form. */
export function coherentOverlapSeries(alpha: number, beta: number, N = 80): number {
  const a = coherentFock(alpha, N)
  const b = coherentFock(beta, N)
  return a.reduce((s, x, n) => s + x * b[n], 0) ** 2
}
