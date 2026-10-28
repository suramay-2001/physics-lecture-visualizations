/**
 * Chapter Q23's engine (Physics 709, "Measuring information: distances, entropies and Holevo"; plan docs/roles/proposals/P-Q23-story.md §9.1): the classical distance, fidelity and
 * relative entropy of chance tables, the quantum relative entropy and the Klein chain, the table a measurement makes from two states, joint / conditional / mutual information and
 * the capacity of a binary channel, the quantum mutual information (with the dephased Bell pair, the three-qubit dephasing circuit and the GHZ circuit), and the Holevo quantities
 * (chi, the information of a POVM, the best projective reading, the failure bound of unambiguous discrimination, the two cq states of the proof). Entropies are in bits (log2);
 * a chance table is a plain number[] (or number[][] for a joint table, rows x, columns y); a quantum state is a Vec or a Mat (qubit order as in state.ts, q0 most significant).
 *
 * Every function is checked against an independent numpy/scipy route (pipeline/make_infoq_fixtures.py, helper pipeline/infoq_numpy.py: dense np.kron states, scipy.linalg.logm,
 * a brute-force grid and scipy.optimize for the accessible information); the cross-checks of the plan (mutualInfo against mutualInfoAsRel, holevoChi against h((1+s)/2), the
 * capacity against 1 - h(f), the circuit against the dephased mixture, the best table distance against traceDistance) are in infoq.test.ts.
 *
 * Rule (l) of the chunk contract: this module is imported ONLY by Q23.values.ts, the lazy `plot` kind (stage/svg/plot.ts) and tests, so it stays out of the entry closure. Do not
 * import it from info.ts, density.ts or any module the first paint reads.
 */
import { c } from '../complex'
import { type Mat, type Vec, madd, mscale, outer } from '../linalg'
import { bornPovm, usd } from './povm'
import { type Circuit, type Op } from './circuit'
import { eigh } from './cmat'
import { asDensity, partialTrace, vonNeumann } from './density'
import { marginals, shannon } from './info'
import { bell } from './state'

const LN2 = Math.LN2
const log2 = (x: number): number => Math.log(x) / LN2
const need = (ok: boolean, msg: string): void => {
  if (!ok) throw new Error(msg)
}
const flat = (t: readonly (readonly number[])[]): number[] => t.flatMap((row) => [...row])

/* ---------------------------------------------------------------------------------------------- */
/* Chance tables (Bergou §11.1-11.4)                                                                */
/* ---------------------------------------------------------------------------------------------- */

const checkTable = (p: readonly number[], who: string): void => need(p.length > 0 && p.every((x) => x >= -1e-12) && Math.abs(p.reduce((s, x) => s + x, 0) - 1) < 1e-9, `${who}: a table of chances that add to 1`)
const checkPair = (p: readonly number[], q: readonly number[], who: string): void => {
  checkTable(p, who)
  checkTable(q, who)
  need(p.length === q.length, `${who}: two tables of the same length`)
}

/** D(p, q) = half the sum of |p(x) - q(x)| (Eq. 11.1, the L1 or Kolmogorov distance). */
export function classicalDistance(p: readonly number[], q: readonly number[]): number {
  checkPair(p, q, 'classicalDistance')
  return 0.5 * p.reduce((s, x, k) => s + Math.abs(x - q[k]), 0)
}

/** F(p, q) = sum of sqrt(p(x) q(x)) (Eq. 11.2): the cosine of the angle between the two square-root arrows. */
export function classicalFidelity(p: readonly number[], q: readonly number[]): number {
  checkPair(p, q, 'classicalFidelity')
  return p.reduce((s, x, k) => s + Math.sqrt(Math.max(0, x * q[k])), 0)
}

/** The angle between the square-root arrows, arccos F, in degrees (a metric on tables, where F itself is not). */
export function fidelityAngleDeg(p: readonly number[], q: readonly number[]): number {
  return (Math.acos(Math.min(1, classicalFidelity(p, q))) * 180) / Math.PI
}

/** The plane angle (degrees from the first axis) of the square-root arrow (sqrt p0, sqrt p1) of a two-outcome table: the angle the `hilbert-plane` draws. */
export function sqrtPlaneDeg(p: readonly number[]): number {
  need(p.length === 2, 'sqrtPlaneDeg: a two-outcome table')
  checkTable(p, 'sqrtPlaneDeg')
  return (Math.atan2(Math.sqrt(p[1]), Math.sqrt(p[0])) * 180) / Math.PI
}

/** Every table of `nOut` outcomes with chances in steps of 1/4 (nOut = 3 gives the 15 tables of the chapter's grids), in lexicographic order of the numerators. */
export function quarterTables(nOut: number): number[][] {
  need(Number.isInteger(nOut) && nOut >= 2 && nOut <= 5, 'quarterTables: 2 to 5 outcomes')
  const out: number[][] = []
  const rec = (left: number, slots: number, acc: number[]): void => {
    if (slots === 1) return void out.push([...acc, left].map((k) => k / 4))
    for (let k = 0; k <= left; k++) rec(left - k, slots - 1, [...acc, k])
  }
  rec(4, nOut, [])
  return out
}

/** The smallest of D(p, r) + D(r, q) - D(p, q) over every triple of the given tables: 0 (r = p) and never negative, the triangle rule on a grid. */
export function triangleSlack(tables: readonly (readonly number[])[]): number {
  let least = Infinity
  for (const p of tables) for (const q of tables) for (const r of tables) least = Math.min(least, classicalDistance(p, r) + classicalDistance(r, q) - classicalDistance(p, q))
  return least
}

/** H(p || q) = sum p log2(p/q) in bits (Eq. 11.4); +Infinity when q(x) = 0 where p(x) > 0; 0 for p = q. */
export function relEntropy(p: readonly number[], q: readonly number[]): number {
  checkPair(p, q, 'relEntropy')
  let s = 0
  for (let k = 0; k < p.length; k++) {
    if (p[k] <= 1e-15) continue
    if (q[k] <= 1e-15) return Infinity
    s += p[k] * log2(p[k] / q[k])
  }
  return s
}

/** Over every ordered pair of the given tables: the smallest finite H(p || q) and how many pairs are infinite. */
export function relEntropyGrid(tables: readonly (readonly number[])[]): { minFinite: number; infinite: number; pairs: number } {
  let minFinite = Infinity
  let infinite = 0
  for (const p of tables)
    for (const q of tables) {
      const h = relEntropy(p, q)
      if (h === Infinity) infinite++
      else minFinite = Math.min(minFinite, h)
    }
  return { minFinite, infinite, pairs: tables.length ** 2 }
}

/* ---------------------------------------------------------------------------------------------- */
/* Quantum relative entropy and what a measurement makes of two states (Eqs. 3.42-3.46, 11.5-11.9)  */
/* ---------------------------------------------------------------------------------------------- */

interface Spectral {
  p: number[]
  u: Vec[]
}
/** Eigenvalues (descending) with their eigenvectors; tiny negative noise is clamped to 0. */
function spectral(rho: Mat): Spectral {
  const { values, vectors } = eigh(rho)
  const order = values.map((_, k) => k).sort((a, b) => values[b] - values[a])
  return { p: order.map((k) => Math.max(0, values[k])), u: order.map((k) => vectors[k]) }
}
const overlap2 = (a: Vec, b: Vec): number => {
  let re = 0
  let im = 0
  for (let k = 0; k < a.length; k++) {
    re += a[k].re * b[k].re + a[k].im * b[k].im
    im += a[k].re * b[k].im - a[k].im * b[k].re
  }
  return re * re + im * im
}

/** The numbers behind S(rho || sigma): rho's eigenvalues p_i, sigma's eigenvalues q_j, and the overlap table |<u_i|v_j>|^2. */
function relParts(rho: Mat, sigma: Mat): { p: number[]; q: number[]; w: number[][] } {
  need(rho.length === sigma.length, 'quantumRelEntropy: two states of the same size')
  const a = spectral(rho)
  const b = spectral(sigma)
  return { p: a.p, q: b.p, w: a.u.map((ui) => b.u.map((vj) => overlap2(ui, vj))) }
}

/** S(rho || sigma) = Tr rho (log2 rho - log2 sigma) (Eq. 3.42); +Infinity when sigma vanishes somewhere rho does not. */
export function quantumRelEntropy(rho: Vec | Mat, sigma: Vec | Mat): number {
  const { p, q, w } = relParts(asDensity(rho), asDensity(sigma))
  let s = 0
  for (let i = 0; i < p.length; i++) {
    if (p[i] <= 1e-13) continue
    s += p[i] * log2(p[i])
    for (let j = 0; j < q.length; j++) {
      if (w[i][j] <= 1e-13) continue
      if (q[j] <= 1e-13) return Infinity
      s -= p[i] * w[i][j] * log2(q[j])
    }
  }
  return s
}

/**
 * The chain of Eqs. 3.43-3.46: S(rho || sigma) >= H(p || r) >= 0, with p the eigenvalues of rho and r_i = sum_j |<u_i|v_j>|^2 q_j the table of overlaps (an average of sigma's
 * eigenvalues). Eigenvalues are listed from the largest down.
 */
export function kleinChain(rho: Vec | Mat, sigma: Vec | Mat): { S: number; H: number; r: number[]; p: number[] } {
  const { p, q, w } = relParts(asDensity(rho), asDensity(sigma))
  const r = p.map((_, i) => q.reduce((s, qj, j) => s + w[i][j] * qj, 0))
  return { S: quantumRelEntropy(rho, sigma), H: relEntropy(p, r), r, p }
}

/** The table a measurement in the orthonormal basis makes of a state: p_i = <b_i|rho|b_i>. */
export function measureTable(state: Vec | Mat, basis: readonly Vec[]): number[] {
  const rho = asDensity(state)
  return basis.map((b) => {
    let s = 0
    for (let i = 0; i < b.length; i++)
      for (let j = 0; j < b.length; j++) {
        // <b|rho|b> = sum b_i* rho_ij b_j (real part: the sum is real for a Hermitian rho)
        const bi = b[i]
        const bj = b[j]
        const r = rho[i][j]
        const tr = bi.re * r.re + bi.im * r.im // b_i* rho_ij, real part
        const ti = bi.re * r.im - bi.im * r.re // imaginary part
        s += tr * bj.re - ti * bj.im
      }
    return s
  })
}

/** The distance between the two tables a measurement in `basis` makes of rho and sigma (never above the trace distance, Eq. 11.5 and Bergou p. 27). */
export function tableDistance(rho: Vec | Mat, sigma: Vec | Mat, basis: readonly Vec[]): number {
  return classicalDistance(measureTable(rho, basis), measureTable(sigma, basis))
}

/** The same distance in the eigenbasis of rho - sigma (the Helstrom measurement): equal to the trace distance. */
export function eigenTableDistance(rho: Vec | Mat, sigma: Vec | Mat): number {
  const a = asDensity(rho)
  const b = asDensity(sigma)
  const diff = a.map((row, i) => row.map((x, j) => c(x.re - b[i][j].re, x.im - b[i][j].im)))
  return tableDistance(a, b, eigh(diff).vectors)
}

/** The orthonormal basis of a qubit along the real axis at polar angle t (radians) in the x-z plane: (cos t/2, sin t/2) and (-sin t/2, cos t/2). */
export function planeBasis(t: number): [Vec, Vec] {
  return [
    [c(Math.cos(t / 2)), c(Math.sin(t / 2))],
    [c(-Math.sin(t / 2)), c(Math.cos(t / 2))],
  ]
}

/** The largest table distance over `nAngles` axes of the x-z great circle (t from 0 to 180 degrees, both ends included) for two one-qubit states, with the first angle that reaches it. */
export function bestTableDistance(rho: Vec | Mat, sigma: Vec | Mat, nAngles: number): { D: number; angleDeg: number } {
  need(nAngles >= 2, 'bestTableDistance: at least two axes')
  let best = -1
  let at = 0
  for (let k = 0; k < nAngles; k++) {
    const t = (Math.PI * k) / (nAngles - 1)
    const D = tableDistance(rho, sigma, planeBasis(t))
    if (D > best + 1e-13) {
      best = D
      at = (t * 180) / Math.PI
    }
  }
  return { D: best, angleDeg: at }
}

/**
 * The chord of log2 between x1 < x2 (the step before Eq. 3.45): the parameter s and the two sides log x1 + s (log x2 - log x1) and log[x1 + s (x2 - x1)]. With `printed` the parameter is
 * s = (x - x1)/(x1 - x2), the denominator as the page of Eq. 3.44 prints it; otherwise s = (x - x1)/(x2 - x1). The inequality lhs <= rhs is the concavity of log: it holds for the second form
 * (0 <= s <= 1) and fails for the first (s < 0), which is what a Correction box shows.
 */
export function logChord(x1: number, x2: number, x: number, printed: boolean): { s: number; lhs: number; rhs: number } {
  need(x1 > 0 && x2 > x1 && x >= x1 && x <= x2, 'logChord: 0 < x1 < x2 and x between them')
  const s = (x - x1) / (printed ? x1 - x2 : x2 - x1)
  return { s, lhs: log2(x1) + s * (log2(x2) - log2(x1)), rhs: log2(x1 + s * (x2 - x1)) }
}

/* ---------------------------------------------------------------------------------------------- */
/* Two variables (Bergou §11.3-11.4)                                                                */
/* ---------------------------------------------------------------------------------------------- */

const checkJoint = (pxy: readonly (readonly number[])[], who: string): void => need(pxy.length > 0 && pxy.every((row) => row.length === pxy[0].length) && Math.abs(flat(pxy).reduce((s, x) => s + x, 0) - 1) < 1e-9, `${who}: a joint table that adds to 1`)

/** H(X, Y) = -sum p(x, y) log2 p(x, y) (Eq. 11.10). */
export function jointEntropy(pxy: readonly (readonly number[])[]): number {
  checkJoint(pxy, 'jointEntropy')
  return shannon(flat(pxy))
}

/** H(Y | X) = H(X, Y) - H(X) = sum_x p_X(x) H(Y | X = x) (Eqs. 11.11-11.12); rows are x. */
export function condEntropyClassical(pxy: readonly (readonly number[])[]): number {
  checkJoint(pxy, 'condEntropyClassical')
  return shannon(flat(pxy)) - shannon(marginals(pxy).px)
}

/** I(X:Y) = H(X) + H(Y) - H(X, Y) (Eqs. 11.13-11.16). */
export function mutualInfo(pxy: readonly (readonly number[])[]): number {
  checkJoint(pxy, 'mutualInfo')
  const { px, py } = marginals(pxy)
  return shannon(px) + shannon(py) - shannon(flat(pxy))
}

/** The same number as the relative entropy of the joint table from the table of independent variables: H(p_XY || p_X p_Y). */
export function mutualInfoAsRel(pxy: readonly (readonly number[])[]): number {
  checkJoint(pxy, 'mutualInfoAsRel')
  const { px, py } = marginals(pxy)
  return relEntropy(
    flat(pxy),
    px.flatMap((a) => py.map((b) => a * b)),
  )
}

/** The joint table of a binary symmetric channel with flip chance f and input chances px: p(x, y) = p_X(x) (1 - f if y = x, else f); rows are the sent bit. */
export function bscJoint(f: number, px: readonly [number, number] = [0.5, 0.5]): number[][] {
  need(f >= 0 && f <= 1, 'bscJoint: f is a chance')
  checkTable(px, 'bscJoint')
  return [
    [px[0] * (1 - f), px[0] * f],
    [px[1] * f, px[1] * (1 - f)],
  ]
}

/** The channel table p(y | x) of a binary symmetric channel (rows are x). */
export const bscChannel = (f: number): number[][] => [
  [1 - f, f],
  [f, 1 - f],
]

/** The capacity of a channel with two inputs: the largest I(X:Y) over `nGrid` input chances p_X(0) = k/(nGrid - 1), and the first p_X(0) that reaches it (Bergou p. 194, grid form). */
export function capacityGrid(pyx: readonly (readonly number[])[], nGrid: number): { C: number; argmax: number } {
  need(pyx.length === 2 && nGrid >= 3, 'capacityGrid: two inputs and at least three grid points')
  pyx.forEach((row) => checkTable(row, 'capacityGrid'))
  let C = -1
  let argmax = 0
  for (let k = 0; k < nGrid; k++) {
    const a = k / (nGrid - 1)
    const I = mutualInfo([pyx[0].map((v) => a * v), pyx[1].map((v) => (1 - a) * v)])
    if (I > C + 1e-13) {
      C = I
      argmax = a
    }
  }
  return { C, argmax }
}

/* ---------------------------------------------------------------------------------------------- */
/* Quantum mutual information (Bergou §11.5, Eqs. 11.17-11.19)                                      */
/* ---------------------------------------------------------------------------------------------- */

const entropyOf = (rho: Mat, keep: readonly number[]): number => {
  const n = Math.round(Math.log2(rho.length))
  const out = Array.from({ length: n }, (_, q) => q).filter((q) => !keep.includes(q))
  return vonNeumann(out.length ? partialTrace(rho, out) : rho)
}

/** S(A:B) = S(A) + S(B) - S(AB) in bits, for the wires `a` and `b` (disjoint lists, default q0 and q1) of a state of n qubits. */
export function quantumMutualInfo(state: Vec | Mat, a: readonly number[] = [0], b: readonly number[] = [1]): number {
  const rho = asDensity(state)
  need(a.length > 0 && b.length > 0 && a.every((q) => !b.includes(q)), 'quantumMutualInfo: two disjoint, non-empty lists of wires')
  return entropyOf(rho, a) + entropyOf(rho, b) - entropyOf(rho, [...a, ...b])
}

/** (1 - p) Phi+ + p Phi-: a Bell pair after a phase error Z on one half with chance p (four-by-four density matrix). */
export function dephasedBell(p: number): Mat {
  need(p >= 0 && p <= 1, 'dephasedBell: p is a chance')
  const a = bell('00+11')
  const b = bell('00-11')
  return madd(mscale(outer(a, a), 1 - p), mscale(outer(b, b), p))
}

const gate = (g: 'H' | 'X' | 'Z' | 'Ry', targets: number[], controls?: number[], params?: number[]): Op => ({ op: 'gate', gate: g, targets, ...(controls ? { controls } : {}), ...(params ? { params } : {}) })

/**
 * The phase error written as a circuit (the picture of Eq. 11.19's argument): wires A, B, C from 000; H on A, CNOT A -> B (a Bell pair), Ry on C so that C is |1> with chance p, then
 * Z on B controlled by C. Tracing out C leaves dephasedBell(p) on A, B.
 */
export function dephasingCircuit(p: number): Circuit {
  need(p >= 0 && p <= 1, 'dephasingCircuit: p is a chance')
  return {
    version: 1,
    qubits: 3,
    init: '000',
    wires: ['A', 'B', 'C'],
    columns: [[gate('H', [0])], [gate('X', [1], [0])], [gate('Ry', [2], undefined, [2 * Math.asin(Math.sqrt(p))])], [gate('Z', [1], [2])]],
  }
}

/** The GHZ state as a circuit on three wires: H on q0, then CNOT q0 -> q1 and CNOT q1 -> q2. */
export function ghzCircuit(): Circuit {
  return { version: 1, qubits: 3, init: '000', wires: ['A', 'B', 'C'], columns: [[gate('H', [0])], [gate('X', [1], [0])], [gate('X', [2], [1])]] }
}

/* ---------------------------------------------------------------------------------------------- */
/* The Holevo bound (Bergou §11.5-11.7)                                                             */
/* ---------------------------------------------------------------------------------------------- */

const ensembleRho = (ps: readonly number[], rhos: readonly Mat[]): Mat => rhos.map((r, k) => mscale(r, ps[k])).reduce((a, b) => madd(a, b))
const checkEnsemble = (ps: readonly number[], rhos: readonly (Vec | Mat)[], who: string): Mat[] => {
  need(ps.length === rhos.length && ps.length >= 2, `${who}: one state per chance, at least two`)
  checkTable(ps, who)
  return rhos.map(asDensity)
}

/** chi = S(sum p_x rho_x) - sum p_x S(rho_x) (Eq. 11.20): the largest Bob can learn from a measurement of the states Alice sends. */
export function holevoChi(ps: readonly number[], rhos: readonly (Vec | Mat)[]): number {
  const R = checkEnsemble(ps, rhos, 'holevoChi')
  return vonNeumann(ensembleRho(ps, R)) - R.reduce((s, r, k) => s + ps[k] * vonNeumann(r), 0)
}

/** The joint table p(x, y) = p_x Tr(E_y rho_x) of Alice's label and the outcome of the POVM {E_y}. */
export function povmJoint(ps: readonly number[], rhos: readonly (Vec | Mat)[], povm: readonly Mat[]): number[][] {
  const R = checkEnsemble(ps, rhos, 'povmJoint')
  return R.map((r, k) => bornPovm(povm, r).map((v) => ps[k] * Math.max(0, v)))
}

/** I(X:Y) for the POVM {E_y} on the ensemble (Eq. 11.27's classical side). */
export function mutualInfoPovm(ps: readonly number[], rhos: readonly (Vec | Mat)[], povm: readonly Mat[]): number {
  return mutualInfo(povmJoint(ps, rhos, povm))
}

/** The mutual information of a projective reading of a qubit ensemble along the x-z axis at polar angle t (radians), by real arithmetic on the density matrices. */
function planeInfo(ps: readonly number[], R: readonly Mat[], t: number): number {
  const e0 = [Math.cos(t / 2), Math.sin(t / 2)]
  const e1 = [-Math.sin(t / 2), Math.cos(t / 2)]
  const chance = (rho: Mat, e: number[]): number => e[0] * e[0] * rho[0][0].re + e[1] * e[1] * rho[1][1].re + 2 * e[0] * e[1] * rho[0][1].re
  return mutualInfo(R.map((r, k) => [ps[k] * Math.max(0, chance(r, e0)), ps[k] * Math.max(0, chance(r, e1))]))
}

/** The largest I(X:Y) over `nAngles` projective readings of a qubit ensemble along axes of the x-z great circle (0 to 180 degrees, both ends in), and the first angle that reaches it. */
export function accessibleProjective(ps: readonly number[], rhos: readonly (Vec | Mat)[], nAngles: number): { I: number; angleDeg: number } {
  const R = checkEnsemble(ps, rhos, 'accessibleProjective')
  need(R.every((r) => r.length === 2) && nAngles >= 2, 'accessibleProjective: qubit states and at least two axes')
  let best = -1
  let at = 0
  for (let k = 0; k < nAngles; k++) {
    const t = (Math.PI * k) / (nAngles - 1)
    const I = planeInfo(ps, R, t)
    if (I > best + 1e-13) {
      best = I
      at = (t * 180) / Math.PI
    }
  }
  return { I: best, angleDeg: at }
}

/** The lower bound of Eq. 11.40 on the chance that an unambiguous measurement fails: (H({p_x}) - S(rho)) / log2 N, never below 0. */
export function usdFailureBound(ps: readonly number[], rhos: readonly (Vec | Mat)[]): number {
  const R = checkEnsemble(ps, rhos, 'usdFailureBound')
  return Math.max(0, (shannon(ps) - vonNeumann(ensembleRho(ps, R))) / log2(ps.length))
}

/** The classical-quantum state sum_x p_x |x><x| (x) rho_x of a label qubit and a qubit system (Eq. 11.21's register P with the system Q), as a 4 x 4 matrix; two states only. */
export function cqState(ps: readonly number[], rhos: readonly (Vec | Mat)[]): Mat {
  const R = checkEnsemble(ps, rhos, 'cqState')
  need(R.length === 2 && R.every((r) => r.length === 2), 'cqState: two one-qubit states')
  const label = (x: number): Mat => (x === 0 ? [[c(1), c(0)], [c(0), c(0)]] : [[c(0), c(0)], [c(0), c(1)]])
  const kr = (A: Mat, B: Mat): Mat => A.flatMap((ra) => B.map((rb) => ra.flatMap((a) => rb.map((b) => c(a.re * b.re - a.im * b.im, a.re * b.im + a.im * b.re)))))
  return [0, 1].map((x) => mscale(kr(label(x), R[x]), ps[x])).reduce((a, b) => madd(a, b))
}

/**
 * The two cq states of the proof of the bound (Eqs. 11.21-11.29) for two qubit states measured along the Bloch direction `axis` (a vector, any length): S(P:Q) = chi, taken from the state
 * before the reading, and S(P':M') from the classical table after it (the label and the readout as two wires). The second never exceeds the first.
 */
export function holevoProofStates(ps: readonly number[], rhos: readonly (Vec | Mat)[], axis: readonly [number, number, number]): { SPQ: number; SPprimeMprime: number } {
  const R = checkEnsemble(ps, rhos, 'holevoProofStates')
  const len = Math.hypot(axis[0], axis[1], axis[2])
  need(len > 0, 'holevoProofStates: a non-zero axis')
  const n = axis.map((v) => v / len)
  // the two outcome projectors (I +- n.sigma)/2
  const E = (s: 1 | -1): Mat => [
    [c((1 + s * n[2]) / 2), c((s * n[0]) / 2, (-s * n[1]) / 2)],
    [c((s * n[0]) / 2, (s * n[1]) / 2), c((1 - s * n[2]) / 2)],
  ]
  const P = [E(1), E(-1)]
  const table = R.map((r, k) => bornPovm(P, r).map((v) => ps[k] * Math.max(0, v)))
  const after: Mat = Array.from({ length: 4 }, (_, i) => Array.from({ length: 4 }, (_, j) => c(i === j ? table[i >> 1][i & 1] : 0)))
  return { SPQ: quantumMutualInfo(cqState(ps, rhos)), SPprimeMprime: quantumMutualInfo(after) }
}

/* ---------------------------------------------------------------------------------------------- */
/* The two-state ensemble of the chapter's curves                                                   */
/* ---------------------------------------------------------------------------------------------- */

/** Two real one-qubit pure states with overlap s: (1, 0) and (s, sqrt(1 - s^2)). */
export function pairStates(s: number): [Vec, Vec] {
  need(s >= -1e-12 && s <= 1 + 1e-12, 'pairStates: the overlap is between 0 and 1')
  const t = Math.sqrt(Math.max(0, 1 - s * s))
  return [[c(1), c(0)], [c(s), c(t)]]
}
const PAIR_P: [number, number] = [0.5, 0.5]
/** chi of two equiprobable pure states with overlap s: h((1 + s)/2). */
export const holevoChiPair = (s: number): number => holevoChi(PAIR_P, pairStates(s))
/** The best projective reading of the same pair over 721 axes. */
export const accessibleInfoPair = (s: number): number => accessibleProjective(PAIR_P, pairStates(s), 721).I
/** The bound on the failure chance of unambiguous discrimination of the pair: 1 - chi. */
export const usdBoundPair = (s: number): number => usdFailureBound(PAIR_P, pairStates(s))
/** The exact failure chance of the best unambiguous measurement of the pair (Chapter Q14): the overlap s itself. */
export const usdFailPair = (s: number): number => 1 - usd(pairStates(s))
/** The capacity of the binary symmetric channel with flip chance f (grid of 1001 inputs). */
export const bscCapacity = (f: number): number => capacityGrid(bscChannel(f), 1001).C
