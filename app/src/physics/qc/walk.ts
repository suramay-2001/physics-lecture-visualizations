/**
 * Walks (Chapter Q19; Bergou §7.6, pp. 130-139). Pure functions, ħ = 1; numpy twin pipeline/make_walk_fixtures.py (+ walk_numpy.py) → __fixtures__/qc-walk.json.
 *
 *   classical   the random walk on a line (p(x; n) = C(n, (n+x)/2) 2^-n), its spread, the 2N³ path test, a hitting time by a linear solve
 *   coin walk   the Hadamard-coin walk on a line (beyond the book: Q19 random-walk:b5), by direct stepping
 *   scattering  the vertex rule of Eq. 7.45 (r = (n-2)/n, t = 2/n), the edge states |v1, v2> of a star graph, the walk step U built VERTEX BY VERTEX,
 *               as a circuit (N = 2, 4, 8: one `unitary` box W on 1 + log2 N wires), and the walker's state after n steps
 *   reduced     the 4-dimensional invariant subspace of the marked-spoke search (7.50-7.53) and the 5-dimensional one of the extra-edge search
 *               (7.65-7.68): their matrices, characteristic polynomials, eigenphases, and the first peaks
 *
 * Conventions. The centre of a star is vertex 0, the N outer vertices (spokes) are 1…N: N counts SPOKES here (Q19 R10; Bergou's §7.8 counts graph vertices).
 * The edge state |u, v> is "on the edge {u, v}, moving from u to v". Basis order of `starStates`: |0,1>…|0,N> (leaving the centre), |1,0>…|N,0> (arriving),
 * then the extra edge's |a,b>, |b,a>. So the index of |0,j> is j-1 and of |j,0> is N+j-1: with N = 2^m, that is (direction bit d)(spoke bits of j-1), q0 = d = the top wire.
 * Every amplitude of every walk here is real (r, t, ±1), so states are plain number[].
 *
 * Lazy chunks only (the walk-graph kind and Q19's values): physics/qc is never in the entry closure (build/chunks.test.ts (h), (l)).
 */
import { type Mat, identity } from '../linalg'
import { c } from '../complex'
import { type Circuit, type Op, circuitUnitary } from './circuit'
import { groverSuccess } from './grover'

/* --------------------------------------------------------------------- helpers --------------------------------------------------------------------- */

const need = (ok: boolean, why: string): void => {
  if (!ok) throw new Error(why)
}
const isInt = (x: number): boolean => Number.isInteger(x)
const nz = (x: number): number => (x === 0 ? 0 : x) // -0 → 0

/** The largest |entry| of a real matrix or vector. */
const maxAbsReal = (A: number[] | number[][]): number => Math.max(0, ...(A as unknown[]).flat().map((x) => Math.abs(x as number)))

/** Solve A x = b by Gaussian elimination with partial pivoting (small dense real systems). */
function solveReal(A: number[][], b: number[]): number[] {
  const n = b.length
  const M = A.map((row, i) => [...row, b[i]])
  for (let k = 0; k < n; k++) {
    let p = k
    for (let i = k + 1; i < n; i++) if (Math.abs(M[i][k]) > Math.abs(M[p][k])) p = i
    need(Math.abs(M[p][k]) > 1e-300, 'solveReal: singular system')
    ;[M[k], M[p]] = [M[p], M[k]]
    for (let i = k + 1; i < n; i++) {
      const f = M[i][k] / M[k][k]
      for (let j = k; j <= n; j++) M[i][j] -= f * M[k][j]
    }
  }
  const x = new Array<number>(n).fill(0)
  for (let i = n - 1; i >= 0; i--) {
    let s = M[i][n]
    for (let j = i + 1; j < n; j++) s -= M[i][j] * x[j]
    x[i] = s / M[i][i]
  }
  return x
}

/** Coefficients [1, c_{n-1}, …, c_0] of det(λI − A) by the Faddeev-LeVerrier recursion (exact up to rounding for the small matrices here). */
export function charPoly(A: number[][]): number[] {
  const n = A.length
  const coeffs = [1]
  let Mk = identity(n).map((row) => row.map((z) => z.re))
  for (let k = 1; k <= n; k++) {
    const AM = A.map((row) => Mk[0].map((_, j) => row.reduce((s, a, i) => s + a * Mk[i][j], 0)))
    const ck = -AM.reduce((s, row, i) => s + row[i], 0) / k
    coeffs.push(nz(ck))
    Mk = AM.map((row, i) => row.map((x, j) => x + (i === j ? ck : 0)))
  }
  return coeffs
}

/* --------------------------------------------------------------- the classical walk on a line --------------------------------------------------------------- */

/** The chances of x = -n, -n+2, …, n after n fair steps (n+1 entries), by repeated halving and adding (Pascal's triangle over 2^n). */
export function walkDistribution(n: number): number[] {
  need(isInt(n) && n >= 0 && n <= 2000, 'walkDistribution: n is a whole number of steps, 0…2000')
  let p = [1]
  for (let s = 0; s < n; s++) p = Array.from({ length: p.length + 1 }, (_, k) => ((k > 0 ? p[k - 1] : 0) + (k < p.length ? p[k] : 0)) / 2)
  return p
}

/** p(x; n) = C(n, (n+x)/2) 2^-n (Bergou p. 130): 0 when n + x is odd or |x| > n. */
export function walkChance(n: number, x: number): number {
  need(isInt(x), 'walkChance: x is a whole number')
  const p = walkDistribution(n)
  return Math.abs(x) > n || (n + x) % 2 !== 0 ? 0 : p[(n + x) / 2]
}

/** The spread σ(n): the square root of Σ x² p(x; n) from the exact chances (= √n). */
export function walkSigmaClassical(n: number): number {
  const p = walkDistribution(n)
  return Math.sqrt(p.reduce((s, q, k) => s + (2 * k - n) ** 2 * q, 0))
}

/** Steps of the random-walk path test (Bergou p. 131): 2N³ on a graph of N vertices. */
export function connectSteps(N: number): number {
  need(isInt(N) && N >= 1, 'connectSteps: N is a whole number of vertices')
  return 2 * N ** 3
}
/** m independent runs miss an existing path with chance below 2^-m. */
export function connectFail(m: number): number {
  need(isInt(m) && m >= 0, 'connectFail: m is a whole number of runs')
  return 2 ** -m
}

/** The mean number of steps from one end of a path of N vertices to the other (reflecting at the start): E_0 = 1 + E_1, E_k = 1 + (E_{k-1} + E_{k+1})/2, E_{N-1} = 0 (= (N-1)²). */
export function pathHitting(N: number): number {
  need(isInt(N) && N >= 2 && N <= 400, 'pathHitting: a path of 2…400 vertices')
  const n = N - 1
  const A = Array.from({ length: n }, () => new Array<number>(n).fill(0))
  for (let k = 0; k < n; k++) {
    A[k][k] = 1
    if (k === 0) {
      if (n > 1) A[0][1] = -1
    } else {
      A[k][k - 1] = -0.5
      if (k + 1 < n) A[k][k + 1] = -0.5
    }
  }
  return solveReal(A, new Array<number>(n).fill(1))[0]
}

/* ----------------------------------------------------------- the Hadamard coin walk (beyond the book) ----------------------------------------------------------- */

/** The state of a coin walk: coin 0 steps left, coin 1 right; amplitudes at x = -n…n, [coin][x + n] as (re, im). */
interface CoinState {
  n: number
  re: [Float64Array, Float64Array]
  im: [Float64Array, Float64Array]
}
function coinStart(nMax: number): CoinState {
  const L = 2 * nMax + 3
  const mk = () => new Float64Array(L)
  const s: CoinState = { n: 0, re: [mk(), mk()], im: [mk(), mk()] }
  const mid = nMax + 1
  s.re[0][mid] = Math.SQRT1_2 // (|0> + i|1>)/√2, the symmetric start
  s.im[1][mid] = Math.SQRT1_2
  return s
}
function coinStep(s: CoinState): void {
  const L = s.re[0].length
  const h = Math.SQRT1_2
  const nr: [Float64Array, Float64Array] = [new Float64Array(L), new Float64Array(L)]
  const ni: [Float64Array, Float64Array] = [new Float64Array(L), new Float64Array(L)]
  for (let x = 1; x < L - 1; x++) {
    const ar = (s.re[0][x] + s.re[1][x]) * h // H on the coin: (a0 + a1)/√2 and (a0 − a1)/√2
    const ai = (s.im[0][x] + s.im[1][x]) * h
    const br = (s.re[0][x] - s.re[1][x]) * h
    const bi = (s.im[0][x] - s.im[1][x]) * h
    nr[0][x - 1] += ar // coin 0 moves one place left
    ni[0][x - 1] += ai
    nr[1][x + 1] += br // coin 1 moves one place right
    ni[1][x + 1] += bi
  }
  s.re = nr
  s.im = ni
  s.n += 1
}
function coinChances(s: CoinState): number[] {
  const mid = (s.re[0].length - 1) / 2
  return Array.from({ length: 2 * s.n + 1 }, (_, k) => {
    const x = mid - s.n + k
    return s.re[0][x] ** 2 + s.im[0][x] ** 2 + s.re[1][x] ** 2 + s.im[1][x] ** 2
  })
}
function coinSigma(s: CoinState): number {
  const p = coinChances(s)
  let m1 = 0
  let m2 = 0
  p.forEach((q, k) => {
    const x = k - s.n
    m1 += x * q
    m2 += x * x * q
  })
  return Math.sqrt(Math.max(0, m2 - m1 * m1))
}

/** The chances at x = -n…n (2n+1 entries; zero at the places a parity rule forbids) of the Hadamard-coin walk from (|0> + i|1>)/√2. */
export function coinWalk(n: number): number[] {
  need(isInt(n) && n >= 0 && n <= 400, 'coinWalk: n is a whole number of steps, 0…400')
  const s = coinStart(n)
  for (let k = 0; k < n; k++) coinStep(s)
  return coinChances(s)
}
/** σ(n) of the coin walk (beyond the book): about 0.5412 n for large n. */
export function coinWalkSigma(n: number): number {
  return coinWalkSigmas(n)[n]
}
/** σ(0), σ(1), …, σ(nMax) in one pass. */
export function coinWalkSigmas(nMax: number): number[] {
  need(isInt(nMax) && nMax >= 0 && nMax <= 400, 'coinWalkSigmas: nMax is a whole number, 0…400')
  const s = coinStart(nMax)
  const out = [coinSigma(s)]
  for (let k = 0; k < nMax; k++) {
    coinStep(s)
    out.push(coinSigma(s))
  }
  return out
}

/* ------------------------------------------------------------------ the vertex rule ------------------------------------------------------------------ */

/** Eq. 7.48: the reflection amplitude magnitude r = (n-2)/n and the transmission t = 2/n at a vertex with n edges (the arriving state goes back with -r). */
export function scatterRT(n: number): { r: number; t: number } {
  need(isInt(n) && n >= 1, 'scatterRT: n is a whole number of edges, 1 or more')
  return { r: (n - 2) / n, t: 2 / n }
}

/** U_v (Eq. 7.45) as an n×n real matrix: entry [k][j] is the amplitude to leave along edge k when arriving along edge j: -r on the diagonal, t elsewhere. */
export function scatterVertex(n: number): Mat {
  const { r, t } = scatterRT(n)
  return Array.from({ length: n }, (_, k) => Array.from({ length: n }, (_, j) => c(j === k ? nz(-r) : t)))
}

/** max |U_v U_v^T − I| (Eq. 7.46 on the diagonal, 7.47 off it). */
export function vertexUnitaryGap(n: number): number {
  const U = scatterVertex(n).map((row) => row.map((z) => z.re))
  let g = 0
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) g = Math.max(g, Math.abs(U[i].reduce((s, _, k) => s + U[i][k] * U[j][k], 0) - (i === j ? 1 : 0)))
  return g
}
/** max |U_v − (2|s><s| − I)|, s the uniform state on the n edges: the vertex IS the inversion about the mean (Q17). */
export function vertexInversionGap(n: number): number {
  const U = scatterVertex(n)
  let g = 0
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) g = Math.max(g, Math.abs(U[i][j].re - (2 / n - (i === j ? 1 : 0))))
  return g
}

/* ------------------------------------------------------------------- the star graph ------------------------------------------------------------------- */

/** One edge state |from, to> (vertex 0 is the centre). */
export interface EdgeState {
  from: number
  to: number
}
/** What is special about the star: one marked spoke (a phase flip on arrival), or one extra edge {a, b} between two spokes; neither = the plain star. */
export interface StarSpec {
  marked?: number
  extra?: readonly [number, number]
}

function checkStar(N: number, spec: StarSpec): void {
  need(isInt(N) && N >= 2 && N <= 4096, 'star walk: N is a whole number of spokes, 2…4096')
  need(!(spec.marked !== undefined && spec.extra !== undefined), 'star walk: a marked spoke and an extra edge do not go together')
  if (spec.marked !== undefined) need(isInt(spec.marked) && spec.marked >= 1 && spec.marked <= N, `star walk: marked is a spoke in 1…${N}`)
  if (spec.extra !== undefined) {
    const [a, b] = spec.extra
    need(N >= 3 && isInt(a) && isInt(b) && a >= 1 && b >= 1 && a <= N && b <= N && a !== b, `star walk: extra is two different spokes in 1…${N} (N ≥ 3)`)
  }
}

/** The 2N edge states of the star (+2 for the extra edge), in the order stated in the module header. */
export function starStates(N: number, opts: { extra?: readonly [number, number] } = {}): EdgeState[] {
  checkStar(N, { extra: opts.extra })
  const s: EdgeState[] = []
  for (let j = 1; j <= N; j++) s.push({ from: 0, to: j })
  for (let j = 1; j <= N; j++) s.push({ from: j, to: 0 })
  if (opts.extra) s.push({ from: opts.extra[0], to: opts.extra[1] }, { from: opts.extra[1], to: opts.extra[0] })
  return s
}

/** Index of |from, to> in `starStates` order. */
function stateIndex(N: number, extra: readonly [number, number] | undefined, from: number, to: number): number {
  if (from === 0) return to - 1
  if (to === 0) return N + from - 1
  return 2 * N + (from === extra![0] ? 0 : 1)
}

/** The edges at vertex v: the centre meets every spoke; a spoke meets the centre (and its partner when it carries the extra edge). */
function neighbours(N: number, extra: readonly [number, number] | undefined, v: number): number[] {
  if (v === 0) return Array.from({ length: N }, (_, j) => j + 1)
  if (extra && (v === extra[0] || v === extra[1])) return [0, v === extra[0] ? extra[1] : extra[0]]
  return [0]
}

/**
 * One step of the walk on the star, VERTEX BY VERTEX (Eq. 7.45): every vertex v with n edges sends the amplitude a_u arriving along edge u to -r a_u on the
 * same edge and t a_u on every other edge; a marked vertex also flips the sign of everything it sends (a phase oracle). The centre's N² terms are summed in
 * O(N) as t·(Σ a) − (r + t)·a_k. Returns a new vector.
 */
export function starWalkStep(N: number, spec: StarSpec, psi: readonly number[]): number[] {
  checkStar(N, spec)
  const extra = spec.extra
  need(psi.length === 2 * N + (extra ? 2 : 0), `starWalkStep: the state has ${2 * N + (extra ? 2 : 0)} edge states`)
  const out = new Array<number>(psi.length).fill(0)
  for (let v = 0; v <= N; v++) {
    const nb = neighbours(N, extra, v)
    const { r, t } = scatterRT(nb.length)
    const sign = v === spec.marked ? -1 : 1
    const arr = nb.map((u) => psi[stateIndex(N, extra, u, v)])
    const sum = arr.reduce((s, a) => s + a, 0)
    nb.forEach((w, k) => {
      out[stateIndex(N, extra, v, w)] += sign * (t * sum - (r + t) * arr[k])
    })
  }
  return out
}

/** The walk step U as a dense (2N or 2N+2)-square real matrix (columns = U applied to each edge state; N ≤ 64). */
export function starWalkU(N: number, spec: StarSpec = {}): Mat {
  checkStar(N, spec)
  need(N <= 64, 'starWalkU: the dense matrix stops at N = 64 spokes (use starWalkState)')
  const d = 2 * N + (spec.extra ? 2 : 0)
  const cols = Array.from({ length: d }, (_, k) => starWalkStep(N, spec, Array.from({ length: d }, (_, i) => (i === k ? 1 : 0))))
  return Array.from({ length: d }, (_, i) => cols.map((col) => c(col[i])))
}

/** max |U U^T − I| of the dense walk step (Eqs. 7.46-7.47 for the whole walk). */
export function starUnitaryGap(N: number, spec: StarSpec = {}): number {
  const U = starWalkU(N, spec).map((row) => row.map((z) => z.re))
  let g = 0
  for (let i = 0; i < U.length; i++) for (let j = 0; j < U.length; j++) g = Math.max(g, Math.abs(U[i].reduce((s, _, k) => s + U[i][k] * U[j][k], 0) - (i === j ? 1 : 0)))
  return g
}

/** The walker's first state. Marked star: Σ_j |0,j>/√N (7.49, start 'out') or Σ_j |j,0>/√N ('in'). Extra edge: (Σ_j |0,j> + sign |j,0>)/√(2N), sign −1 (7.67) or +1 (the failing start). */
export function starWalkStart(N: number, spec: StarSpec = {}, opts: { start?: 'out' | 'in'; sign?: 1 | -1 } = {}): number[] {
  checkStar(N, spec)
  const psi = new Array<number>(2 * N + (spec.extra ? 2 : 0)).fill(0)
  if (spec.extra) {
    const s = opts.sign ?? -1
    for (let j = 1; j <= N; j++) {
      psi[j - 1] = 1 / Math.sqrt(2 * N)
      psi[N + j - 1] = s / Math.sqrt(2 * N)
    }
  } else {
    const off = opts.start === 'in' ? N : 0
    for (let j = 0; j < N; j++) psi[off + j] = 1 / Math.sqrt(N)
  }
  return psi
}

/** The state after `step` steps from `starWalkStart` (sparse stepping: any N up to 4096). */
export function starWalkState(N: number, spec: StarSpec, step: number, opts: { start?: 'out' | 'in'; sign?: 1 | -1 } = {}): number[] {
  need(isInt(step) && step >= 0 && step <= 4000, 'starWalkState: step is a whole number, 0…4000')
  let psi = starWalkStart(N, spec, opts)
  for (let k = 0; k < step; k++) psi = starWalkStep(N, spec, psi)
  return psi
}

/** What the star picture draws: the chance on each spoke's two edge states (index j-1 for spoke j) and on the extra edge's two (0 without one). They sum to 1. */
export function starSpokeChances(N: number, spec: StarSpec, step: number, opts: { start?: 'out' | 'in'; sign?: 1 | -1 } = {}): { spokes: number[]; extra: number } {
  const psi = starWalkState(N, spec, step, opts)
  return {
    spokes: Array.from({ length: N }, (_, j) => psi[j] ** 2 + psi[N + j] ** 2),
    extra: spec.extra ? psi[2 * N] ** 2 + psi[2 * N + 1] ** 2 : 0,
  }
}

/** The chance on the marked spoke (spoke 1) after n steps from the outgoing start. */
export function starWalkMarked(N: number, n: number): number {
  const psi = starWalkState(N, { marked: 1 }, n)
  return psi[0] ** 2 + psi[N] ** 2
}
/** The chances of the marked spoke after 0…nMax steps (one walk). */
export function starWalkMarkedSeries(N: number, nMax: number): number[] {
  need(isInt(nMax) && nMax >= 0 && nMax <= 4000, 'starWalkMarkedSeries: nMax is a whole number, 0…4000')
  let psi = starWalkStart(N, { marked: 1 })
  const out: number[] = []
  for (let k = 0; k <= nMax; k++) {
    out.push(psi[0] ** 2 + psi[N] ** 2)
    if (k < nMax) psi = starWalkStep(N, { marked: 1 }, psi)
  }
  return out
}

/** The first n at which the marked spoke's chance is largest (ties within 1e-12 go to the earlier n), searched over one period π/α of the walk. */
export function starWalkFirstPeak(N: number): number {
  const alpha = Math.asin(1 / Math.sqrt(N))
  const series = starWalkMarkedSeries(N, Math.ceil(Math.PI / alpha) + 2)
  const best = Math.max(...series)
  return series.findIndex((p) => p >= best - 1e-12)
}

/** Bergou's large-N angle step Δ = √(t/2) = 1/√N (7.58) and the step count π/(2Δ) he reads off n Δ = π/2. */
export const starDeltaBergou = (N: number): number => Math.sqrt(scatterRT(N).t / 2)
export const starStepsBergou = (N: number): number => Math.PI / (2 * starDeltaBergou(N))
/** The extra-edge walk's Δ = √(2t/3) = 2/√(3N) (7.73) and π/(2Δ). */
export const extraDeltaBergou = (N: number): number => Math.sqrt((2 * scatterRT(N).t) / 3)
export const extraStepsBergou = (N: number): number => Math.PI / (2 * extraDeltaBergou(N))

/* --------------------------------------------------------- the 4-dimensional subspace of the marked-spoke search --------------------------------------------------------- */

/** M of Eq. 7.53 in the basis ψ1 = |0,1>, ψ2 = |1,0>, ψ3 = Σ_{j≥2}|0,j>/√(N-1), ψ4 = Σ_{j≥2}|j,0>/√(N-1): M[j][k] = <ψ_j|U|ψ_k>. */
export function starReducedM(N: number): number[][] {
  need(isInt(N) && N >= 2, 'starReducedM: N ≥ 2')
  const { r, t } = scatterRT(N)
  const q = t * Math.sqrt(N - 1)
  return [
    [0, nz(-r), 0, q],
    [-1, 0, 0, 0],
    [0, q, 0, r],
    [0, 0, 1, 0],
  ]
}
/** The four basis vectors ψ1…ψ4 of Eq. 7.50 as vectors on the 2N edge states. */
function starBasis(N: number): number[][] {
  const z = () => new Array<number>(2 * N).fill(0)
  const b = [z(), z(), z(), z()]
  b[0][0] = 1
  b[1][N] = 1
  for (let j = 1; j < N; j++) {
    b[2][j] = 1 / Math.sqrt(N - 1)
    b[3][N + j] = 1 / Math.sqrt(N - 1)
  }
  return b
}
/** <ψ_j|U|ψ_k> for a list of basis vectors, from the sparse step. */
function projectM(basis: number[][], step: (v: number[]) => number[]): number[][] {
  const img = basis.map(step)
  return basis.map((bj) => img.map((uk) => bj.reduce((s, x, i) => s + x * uk[i], 0)))
}
/** max |M(7.53) − <ψ_j|U|ψ_k>| from the full walk: the subspace is closed and M is right (the plan's `q19MGap`). */
export function starReducedGap(N: number): number {
  const P = projectM(starBasis(N), (v) => starWalkStep(N, { marked: 1 }, v))
  const M = starReducedM(N)
  return Math.max(...M.flatMap((row, i) => row.map((x, j) => Math.abs(x - P[i][j]))))
}
/** Does U keep the span closed? max over k of |U ψ_k − Σ_j M_jk ψ_j| (zero when the four states are an invariant subspace). */
export function starInvariantGap(N: number): number {
  const B = starBasis(N)
  const M = starReducedM(N)
  let g = 0
  B.forEach((bk, k) => {
    const u = starWalkStep(N, { marked: 1 }, bk)
    const rec = u.map((_, i) => B.reduce((s, bj, j) => s + M[j][k] * bj[i], 0))
    g = Math.max(g, maxAbsReal(u.map((x, i) => x - rec[i])))
  })
  return g
}
/** The chance on the marked spoke after n steps from the 4-dimensional walk (|ψ_init> = N^-1/2 ψ1 + √((N-1)/N) ψ3, 7.52): equal to the full walk. */
export function starReducedChance(N: number, n: number): number {
  const M = starReducedM(N)
  let v = [1 / Math.sqrt(N), 0, Math.sqrt((N - 1) / N), 0]
  for (let k = 0; k < n; k++) v = M.map((row) => row.reduce((s, a, j) => s + a * v[j], 0))
  return v[0] ** 2 + v[1] ** 2
}
/** The coefficients of det(λI − M) (Eq. 7.54: λ⁴ − 2rλ² + 1), by Faddeev-LeVerrier on M. */
export const starCharPoly = (N: number): number[] => charPoly(starReducedM(N))
/** The four eigenphases of M in radians: α, -α, π - α, -(π - α), with sin²α = 1/N (Q17's Grover angle): λ² = e^{±iθ}, cos θ = r. */
export function starEigenAngles(N: number): number[] {
  const alpha = Math.acos(scatterRT(N).r) / 2
  return [alpha, -alpha, Math.PI - alpha, -(Math.PI - alpha)]
}
/** max over the four angles of |det(e^{iφ}I − M)|: the closed-form eigenphases solve the characteristic equation. */
export function starEigenGap(N: number): number {
  const p = starCharPoly(N)
  return Math.max(
    ...starEigenAngles(N).map((phi) => {
      let re = 0
      let im = 0
      p.forEach((a, k) => {
        re += a * Math.cos((p.length - 1 - k) * phi)
        im += a * Math.sin((p.length - 1 - k) * phi)
      })
      return Math.hypot(re, im)
    }),
  )
}
/** max over n ≤ nMax of |chance on the marked spoke after n steps − Grover's chance after ⌊n/2⌋ steps| (Q17's sin²((2k+1)α)), over N = 4, 8, 16 by default. */
export function walkGroverGap(nMax: number, Ns: readonly number[] = [4, 8, 16]): number {
  let g = 0
  for (const N of Ns) starWalkMarkedSeries(N, nMax).forEach((p, n) => (g = Math.max(g, Math.abs(p - groverSuccess(N, 1, Math.floor(n / 2))))))
  return g
}

/* ----------------------------------------------------------- the 5-dimensional subspace of the extra-edge search ----------------------------------------------------------- */

/** M of Eq. 7.68 in the basis ψ1 = (|0,1>+|0,2>)/√2, ψ2 = (|1,0>+|2,0>)/√2, ψ3, ψ4 the uniform sums over j ≥ 3, ψ5 = (|1,2>+|2,1>)/√2 (extra edge on spokes 1, 2). */
export function extraReducedM(N: number): number[][] {
  need(isInt(N) && N >= 3, 'extraReducedM: N ≥ 3')
  const { r, t } = scatterRT(N)
  const q = 2 * Math.sqrt(r * t)
  return [
    [0, nz(-(r - t)), 0, q, 0],
    [0, 0, 0, 0, 1],
    [0, q, 0, r - t, 0],
    [0, 0, 1, 0, 0],
    [1, 0, 0, 0, 0],
  ]
}
function extraBasis(N: number): number[][] {
  const d = 2 * N + 2
  const z = () => new Array<number>(d).fill(0)
  const b = [z(), z(), z(), z(), z()]
  const h = Math.SQRT1_2
  b[0][0] = h
  b[0][1] = h
  b[1][N] = h
  b[1][N + 1] = h
  for (let j = 2; j < N; j++) {
    b[2][j] = 1 / Math.sqrt(N - 2)
    b[3][N + j] = 1 / Math.sqrt(N - 2)
  }
  b[4][2 * N] = h
  b[4][2 * N + 1] = h
  return b
}
/** max |M(7.68) − <ψ_j|U|ψ_k>| from the full walk with the extra edge {1,2}. */
export function extraReducedGap(N: number): number {
  const P = projectM(extraBasis(N), (v) => starWalkStep(N, { extra: [1, 2] }, v))
  const M = extraReducedM(N)
  return Math.max(...M.flatMap((row, i) => row.map((x, j) => Math.abs(x - P[i][j]))))
}
/** The coefficients of det(λI − M) for the 5-dimensional M: λ⁵ − (r−t)λ³ + (r−t)λ² − 1 (Eq. 7.69). */
export const extraCharPoly = (N: number): number[] => charPoly(extraReducedM(N))
/** max |charPoly − (7.69)|: the printed polynomial is the matrix's. */
export function extraPolyGap(N: number): number {
  const { r, t } = scatterRT(N)
  const want = [1, 0, -(r - t), r - t, 0, -1]
  return Math.max(...extraCharPoly(N).map((a, k) => Math.abs(a - want[k])))
}

/** The chances on spokes 1 and 2 (`near`: their four edge states) and on the extra edge (`edge`) after n steps from (7.67) with the given sign (default −1). */
export function extraWalkChances(N: number, n: number, sign: 1 | -1 = -1): { near: number; edge: number } {
  const psi = starWalkState(N, { extra: [1, 2] }, n, { sign })
  return { near: psi[0] ** 2 + psi[1] ** 2 + psi[N] ** 2 + psi[N + 1] ** 2, edge: psi[2 * N] ** 2 + psi[2 * N + 1] ** 2 }
}
/** The chances of `near` and `edge` after 0…nMax steps (one walk). */
export function extraWalkSeries(N: number, nMax: number, sign: 1 | -1 = -1): { near: number[]; edge: number[] } {
  need(isInt(nMax) && nMax >= 0 && nMax <= 4000, 'extraWalkSeries: nMax is a whole number, 0…4000')
  const spec: StarSpec = { extra: [1, 2] }
  let psi = starWalkStart(N, spec, { sign })
  const near: number[] = []
  const edge: number[] = []
  for (let k = 0; k <= nMax; k++) {
    near.push(psi[0] ** 2 + psi[1] ** 2 + psi[N] ** 2 + psi[N + 1] ** 2)
    edge.push(psi[2 * N] ** 2 + psi[2 * N + 1] ** 2)
    if (k < nMax) psi = starWalkStep(N, spec, psi)
  }
  return { near, edge }
}
/** The first n at which the chance on spokes 1, 2 is largest (ties within 1e-12 to the earlier n), searched over n ≤ ⌈π/Δ⌉. */
export function extraWalkPeak(N: number): number {
  const series = extraWalkSeries(N, Math.ceil(Math.PI / extraDeltaBergou(N))).near
  const best = Math.max(...series)
  return series.findIndex((p) => p >= best - 1e-12)
}

/* --------------------------------------------------------------------- as a circuit --------------------------------------------------------------------- */

/**
 * The marked-spoke walk as a circuit (Bergou pp. 131-132): N = 2, 4 or 8 spokes on 1 + log2 N wires (q0 = the direction bit d: 0 = leaving the centre,
 * 1 = arriving; the others are the bits of j - 1, most significant first). Column 0 puts a Hadamard on every spoke wire (the start Σ_j |0,j>/√N), then
 * `steps` columns each hold ONE `unitary` box W = the dense walk step with the spoke `marked` flagged (at most 4 wires: CIRCUIT_LIMITS.unitaryQubits).
 */
export function starWalkCircuit(N: number, marked: number, steps: number): Circuit {
  need(N === 2 || N === 4 || N === 8, 'starWalkCircuit: N = 2, 4 or 8 spokes (at most 4 wires in a unitary box)')
  need(isInt(steps) && steps >= 0 && steps <= 60, 'starWalkCircuit: steps is a whole number, 0…60')
  const m = Math.log2(N)
  const n = m + 1
  const W: Op = {
    op: 'unitary',
    matrix: starWalkU(N, { marked }).map((row) => row.map((z): [number, number] => [z.re, z.im])),
    targets: Array.from({ length: n }, (_, q) => q),
    label: 'W',
  }
  const hs: Op[] = Array.from({ length: m }, (_, q): Op => ({ op: 'gate', gate: 'H', targets: [q + 1] }))
  const sub = '₀₁₂'
  return {
    version: 1,
    qubits: n,
    init: '0'.repeat(n),
    wires: ['d', ...Array.from({ length: m }, (_, q) => `j${sub[m - 1 - q]}`)],
    columns: [hs, ...Array.from({ length: steps }, () => [W])],
  }
}
/** max |circuit − vertex-by-vertex|: the circuit's matrix W^k (I⊗H^{⊗m}) against U^k built from the sparse step (N = 8, k = 1 by default). */
export function starCircuitGap(N = 8, marked = 1, steps = 1): number {
  const C = circuitUnitary(starWalkCircuit(N, marked, steps))
  const d = 2 * N
  let g = 0
  for (let col = 0; col < d; col++) {
    // column `col` of (U^steps · (I ⊗ H^{⊗m})): H^{⊗m} on the spoke bits of basis state col, then `steps` walk steps
    const j = col % N
    const dir = Math.floor(col / N)
    let psi = new Array<number>(d).fill(0)
    for (let k = 0; k < N; k++) {
      let sign = 1
      for (let b = 0; b < Math.log2(N); b++) if (((j >> b) & 1) === 1 && ((k >> b) & 1) === 1) sign = -sign
      psi[dir * N + k] = sign / Math.sqrt(N)
    }
    for (let s = 0; s < steps; s++) psi = starWalkStep(N, { marked }, psi)
    for (let i = 0; i < d; i++) g = Math.max(g, Math.abs(C[i][col].re - psi[i]), Math.abs(C[i][col].im))
  }
  return g
}
