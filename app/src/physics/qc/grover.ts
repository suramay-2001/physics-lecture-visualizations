/**
 * Grover's search (P-Q17-story §9.1; Bergou §7.3 pp. 120–125, N&C §6.1–6.2 pp. 248–254 and §6.6 pp. 269–271): one engine
 * for the numbers, the circuits and the plane the learner sees. Every number here has TWO routes that agree in a test:
 * the closed forms of the invariant real plane (`groverPlane`, `groverSuccess`, `reflect2D`) and a full state-vector
 * simulation of the circuit built from the circuit module (`groverCircuit`, `diffusionCircuit`, then `runCircuit`). The
 * numpy twins (pipeline/make_grover_fixtures.py) are a third, independent route: explicit 2ⁿ × 2ⁿ matrices.
 *
 * Conventions. N = 2ⁿ strings, M of them marked (default 1); a string is read as an index with q0 the most significant bit
 * (state.ts). α = arcsin √(M/N) (Bergou's α; N&C write θ/2). The plane has the unit axes |x₀⊥⟩ (the unmarked strings,
 * evenly) and |x₀⟩ (the marked strings, evenly); a state in it is (cos φ, sin φ), φ its angle from |x₀⊥⟩. The start |w₀⟩ = H^{⊗n}|0…0⟩
 * sits at α, and ONE Grover step Q = −U_H U₀ U_H U_f turns it by 2α, so after k steps the angle is (2k+1)α (Eq. 7.18).
 * The circuit form of Q uses a third column "flip every string but 0…0", which is −U₀ (U₀ = I − 2|0⟩⟨0|): the minus sign of Q
 * is already inside it, so the circuit's state is EXACTLY Q^k|w₀⟩ (dropping that sign would change the state by the global
 * phase (−1)^k, which no reading sees).
 */
import { c } from '../complex'
import { type Mat, type Vec, apply } from '../linalg'
import { type Circuit, type GateOp, type Op, type OracleOp, circuitUnitary, runCircuit } from './circuit'
import { MAX_QUBITS } from './state'

const DEG = Math.PI / 180

/** The most qubits `bbbvD` simulates in full (it runs the circuit once per string). */
export const GROVER_BBBV_MAX_N = 6

function checkNM(N: number, M: number, who: string): void {
  if (!Number.isInteger(N) || N < 2) throw new Error(`${who}: N must be a whole number of at least 2 (got ${N})`)
  if (!Number.isInteger(M) || M < 1 || M >= N) throw new Error(`${who}: M must be a whole number with 1 ≤ M < N (got ${M} of ${N})`)
}
function checkK(k: number, who: string): void {
  if (!Number.isInteger(k) || k < 0) throw new Error(`${who}: k must be a whole number of steps, 0 or more (got ${k})`)
}

/** α = arcsin √(M/N) in radians: |w₀⟩ sits at α above |x₀⊥⟩, and a Grover step turns it by 2α (Bergou Eq. 7.17; N&C θ/2). */
export function groverAngle(N: number, M = 1): number {
  checkNM(N, M, 'groverAngle')
  return Math.asin(Math.sqrt(M / N))
}

/** The state after k steps in the plane's basis (|x₀⊥⟩, |x₀⟩): [cos((2k+1)α), sin((2k+1)α)] (Eq. 7.18). */
export function groverPlane(N: number, M: number, k: number): [number, number] {
  checkNM(N, M, 'groverPlane')
  checkK(k, 'groverPlane')
  const phi = (2 * k + 1) * groverAngle(N, M)
  return [Math.cos(phi), Math.sin(phi)]
}

/** The chance that a reading after k steps lands on ANY marked string: sin²((2k+1)α) (Bergou p. 123; N&C Eq. 6.12 ff.). */
export function groverSuccess(N: number, M: number, k: number): number {
  return groverPlane(N, M, k)[1] ** 2
}

/** The whole number nearest x, where a half rounds DOWN (N&C's CI(x), p. 253). The 1e-9 keeps an exact half exact. */
export const closestIntegerHalvesDown = (x: number): number => Math.max(0, Math.ceil(x - 0.5 - 1e-9))

/**
 * The best number of steps: R = CI(arccos √(M/N) / θ) with θ = 2α (N&C Eq. 6.15), which is CI(π/(4α) − ½): the whole number
 * of steps that leaves the arrow nearest straight up (Bergou's n̄ = the closest integer to (π/4)√N − ½ for large N; the two
 * rules agree for every N ≥ 4, and at N = 2 every k gives a half).
 */
export function groverOptimalK(N: number, M = 1): number {
  const alpha = groverAngle(N, M)
  return closestIntegerHalvesDown(Math.PI / (4 * alpha) - 0.5)
}

/** The reflection about the line through the origin at angle `deg` from the first axis: [[cos 2θ, sin 2θ], [sin 2θ, −cos 2θ]], a real 2×2 matrix. */
export function reflect2D(deg: number): Mat {
  const t = 2 * deg * DEG
  return [
    [c(Math.cos(t)), c(Math.sin(t))],
    [c(Math.sin(t)), c(-Math.cos(t))],
  ]
}

/** The rotation by `deg` degrees, counter-clockwise: [[cos, −sin], [sin, cos]]. */
export function rotate2D(deg: number): Mat {
  const t = deg * DEG
  return [
    [c(Math.cos(t)), c(-Math.sin(t))],
    [c(Math.sin(t)), c(Math.cos(t))],
  ]
}

/** Q's eigenphase on the plane: Q = R(2α) there, so its eigenvalues are e^{±2iα}; this returns 2α (radians), for phase estimation of Q. */
export function groverEigenphase(N: number, M = 1): number {
  return 2 * groverAngle(N, M)
}

/* ------------------------------------------------------------ circuits ------------------------------------------------------------ */

/** The index of a string label such as '101' (q0 first): 5. */
export function markedIndex(label: string | number, n: number): number {
  if (typeof label === 'number') return label
  if (label.length !== n || !/^[01]+$/.test(label)) throw new Error(`markedIndex: "${label}" must be ${n} bits`)
  return parseInt(label, 2)
}

/** f(x) = 1 exactly at the marked strings (the table of the marking oracle U_f). */
export function markTable(n: number, marked: readonly (string | number)[]): (0 | 1)[] {
  const set = new Set(marked.map((m) => markedIndex(m, n)))
  return Array.from({ length: 2 ** n }, (_, x) => (set.has(x) ? 1 : 0))
}

/** f(x) = 1 for every string except 0…0: the phase oracle of "flip all but 0…0", which is −U₀ (the third column of a Grover step). */
export const nonzeroTable = (n: number): (0 | 1)[] => Array.from({ length: 2 ** n }, (_, x) => (x === 0 ? 0 : 1))

const hAll = (n: number): Op[] => Array.from({ length: n }, (_, q): GateOp => ({ op: 'gate', gate: 'H', targets: [q] }))
const phaseOracle = (n: number, table: (0 | 1)[], label: string): OracleOp => ({ op: 'oracle', mode: 'phase', table, inputs: Array.from({ length: n }, (_, q) => q), label })

function checkCircuitSize(n: number, k: number, who: string): void {
  if (!Number.isInteger(n) || n < 1 || n > MAX_QUBITS) throw new Error(`${who}: n must be a whole number of qubits in 1…${MAX_QUBITS} (got ${n})`)
  checkK(k, who)
}

/**
 * Grover's circuit on n wires from 0…0, the marked strings given as indices or labels: [H on every wire], then k times
 * ([phase oracle U_f], [H's], [phase oracle −U₀ = flip all but 0…0], [H's]), so 1 + 4k columns (the first, H's, makes |w₀⟩).
 * After step j the cursor is 1 + 4j; right after that step's marking oracle it is 2 + 4(j − 1).
 */
export function groverCircuit(n: number, marked: readonly (string | number)[], k: number): Circuit {
  checkCircuitSize(n, k, 'groverCircuit')
  const N = 2 ** n
  const idx = marked.map((m) => markedIndex(m, n))
  if (!idx.length || idx.length >= N || new Set(idx).size !== idx.length || idx.some((x) => !Number.isInteger(x) || x < 0 || x >= N))
    throw new Error(`groverCircuit: marked must list 1 to ${N - 1} different strings of ${n} bits`)
  const columns: Op[][] = [hAll(n)]
  for (let j = 0; j < k; j++) columns.push([phaseOracle(n, markTable(n, idx), 'U_f')], hAll(n), [phaseOracle(n, nonzeroTable(n), '−U_0')], hAll(n))
  return { version: 1, qubits: n, init: '0'.repeat(n), columns }
}

/** The same circuit with every marking column removed (1 + 3k columns): the algorithm's fixed steps with no oracle. */
export function diffusionCircuit(n: number, k: number): Circuit {
  checkCircuitSize(n, k, 'diffusionCircuit')
  const columns: Op[][] = [hAll(n)]
  for (let j = 0; j < k; j++) columns.push(hAll(n), [phaseOracle(n, nonzeroTable(n), '−U_0')], hAll(n))
  return { version: 1, qubits: n, init: '0'.repeat(n), columns }
}

/** The state after k steps as a full vector, built from the plane's coordinates: unmarked evenly cos(φ)/√(N−M), marked evenly sin(φ)/√M. */
export function groverStateVector(n: number, marked: readonly (string | number)[], k: number): Vec {
  const N = 2 ** n
  const idx = new Set(marked.map((m) => markedIndex(m, n)))
  const M = idx.size
  const [co, si] = groverPlane(N, M, k)
  return Array.from({ length: N }, (_, x) => c(idx.has(x) ? si / Math.sqrt(M) : co / Math.sqrt(N - M)))
}

/** The state a full simulation of the circuit ends in (the last of `runCircuit`'s states). */
export function finalState(circuit: Circuit): Vec {
  const states = runCircuit(circuit).states
  return states[states.length - 1]
}

/* ------------------------------------------------------------ the √N lower bound ------------------------------------------------------------ */

/**
 * The lower bound on the number of oracle calls, N = 2ⁿ strings (Bergou Eq. 7.29, from 4k² ≥ D_k ≥ N(2 − √2) − 2√N):
 * k ≥ (√(2−√2)/2) √N (1 − 2/((2−√2)√N))^{1/2}. A real number: the smallest whole k is its ceiling.
 */
export function bbbvLowerBound(N: number): number {
  if (!Number.isInteger(N) || N < 2) throw new Error(`bbbvLowerBound: N must be a whole number of at least 2 (got ${N})`)
  const a = 2 - Math.SQRT2
  const inside = 1 - 2 / (a * Math.sqrt(N))
  if (inside < 0) return 0 // the bound says nothing for tiny N: 4k² ≥ a·N − 2√N is already met by k = 0
  return (Math.sqrt(a) / 2) * Math.sqrt(N) * Math.sqrt(inside)
}

/** The right side D_k ≥ N(2 − √2) − 2√N of Eq. 7.27: what success above one half forces on the total difference. */
export const bbbvDLowerBound = (N: number): number => N * (2 - Math.SQRT2) - 2 * Math.sqrt(N)

/**
 * D_k = Σ_x ‖ψ_k^x − ψ_k‖² for Grover's OWN algorithm (Bergou Eq. 7.20 ff.): ψ_k^x is the full simulation with the oracle marking
 * x, ψ_k the same fixed steps with no oracle at all (= |w₀⟩ for Grover). n ≤ GROVER_BBBV_MAX_N.
 */
export function bbbvD(n: number, k: number): number {
  if (!Number.isInteger(n) || n < 1 || n > GROVER_BBBV_MAX_N) throw new Error(`bbbvD: n must be in 1…${GROVER_BBBV_MAX_N} (got ${n})`)
  checkK(k, 'bbbvD')
  const ref = finalState(diffusionCircuit(n, k))
  let sum = 0
  for (let x = 0; x < 2 ** n; x++) {
    const psi = finalState(groverCircuit(n, [x], k))
    sum += psi.reduce((s, a, i) => s + (a.re - ref[i].re) ** 2 + (a.im - ref[i].im) ** 2, 0)
  }
  return sum
}

/**
 * One step of the induction in Eq. 7.22 for Grover's run: the sum Σ_x(‖Δ_x‖² + 4‖Δ_x‖|⟨x|ψ_k⟩| + w·|⟨x|ψ_k⟩|²), where Δ_x = ψ_k^x − ψ_k and
 * w is the weight of the last term: 4 is what the algebra gives ((U_x − I)ψ_k = −2|x⟩⟨x|ψ_k⟩ has norm² 4|⟨x|ψ_k⟩|²), 1 is what
 * the middle line of Eq. 7.22 prints. It bounds D_{k+1}; the printed weight makes the bound fail (D_1 = 4 against a printed bound of 1 at k = 0).
 */
export function bbbvStepBound(n: number, k: number, lastWeight: number): number {
  const ref = finalState(diffusionCircuit(n, k))
  let sum = 0
  for (let x = 0; x < 2 ** n; x++) {
    const psi = finalState(groverCircuit(n, [x], k))
    const d2 = psi.reduce((s, a, i) => s + (a.re - ref[i].re) ** 2 + (a.im - ref[i].im) ** 2, 0)
    const ax = Math.hypot(ref[x].re, ref[x].im)
    sum += d2 + 4 * Math.sqrt(d2) * ax + lastWeight * ax * ax
  }
  return sum
}

/* ------------------------------------------------------------ the book's slips (every one is computed, never typed) ------------------------------------------------------------ */

const norm2v = (v: Vec): number => v.reduce((s, z) => s + z.re * z.re + z.im * z.im, 0)
const innerRe = (a: Vec, b: Vec): number => a.reduce((s, z, i) => s + z.re * b[i].re + z.im * b[i].im, 0)
const unit = (N: number, x: number): Vec => Array.from({ length: N }, (_, i) => c(i === x ? 1 : 0))
const combo = (a: number, u: Vec, b: number, v: Vec): Vec => u.map((z, i) => c(a * z.re + b * v[i].re, a * z.im + b * v[i].im))
const distance = (u: Vec, v: Vec): number => Math.sqrt(norm2v(u.map((z, i) => c(z.re - v[i].re, z.im - v[i].im))))

/** |w₀⟩ for n wires, by running the first column of Grover's circuit (the H's) on 0…0. */
export const startState = (n: number): Vec => finalState({ version: 1, qubits: n, init: '0'.repeat(n), columns: [hAll(n)] })

/** Q = −U_H U₀ U_H U_f as a dense matrix: the product of the four columns after the first of Grover's circuit (n ≤ 6). */
export function groverStepMatrix(n: number, x0: number): Mat {
  const full = groverCircuit(n, [x0], 1)
  return circuitUnitary({ ...full, columns: full.columns.slice(1) })
}

/**
 * Bergou Eq. 7.15 (p. 121), for one marked string x₀: the engine's own Q applied to c₁|w₀⟩ + c₂|x₀⟩, set beside the right-hand side as PRINTED
 * (c₁|w₀⟩ + (2/√N + c₂)(|x₀⟩ − (2/√N)|x₀⟩)) and as CORRECTED (c₁|w₀⟩ + (2c₁/√N + c₂)(|x₀⟩ − (2/√N)|w₀⟩)). Each returned number is the
 * length of the vector between that right side and Q|ψ⟩, in the full 2ⁿ-dimensional space.
 */
export function eq715Gaps(n: number, x0: number, c1: number, c2: number): { printed: number; corrected: number } {
  const N = 2 ** n
  const t = 2 / Math.sqrt(N)
  const w0 = startState(n)
  const x = unit(N, x0)
  const psi = combo(c1, w0, c2, x)
  const Qpsi = apply(groverStepMatrix(n, x0), psi)
  const printed = combo(c1, w0, (t + c2) * (1 - t), x)
  const corrected = combo(c1 - t * (t * c1 + c2), w0, t * c1 + c2, x)
  return { printed: distance(printed, Qpsi), corrected: distance(corrected, Qpsi) }
}

/**
 * |⟨x₀|x₀⊥⟩| for the vector (|w₀⟩ + s⟨x₀|w₀⟩|x₀⟩)/√(1 − |⟨x₀|w₀⟩|²): s = +1 is Bergou's |x₀⊥⟩ as printed (p. 121), s = −1 the true one. The
 * overlap is computed from the engine's own |w₀⟩ and |x₀⟩, and is 0 only for the minus sign.
 */
export function perpOverlap(n: number, x0: number, sign: 1 | -1): number {
  const N = 2 ** n
  const w0 = startState(n)
  const x = unit(N, x0)
  const o = innerRe(x, w0)
  const perp = combo(1 / Math.sqrt(1 - o * o), w0, (sign * o) / Math.sqrt(1 - o * o), x)
  return Math.abs(innerRe(x, perp))
}

/** The gap max|entry| between −U_f and −(I − 2|w₀⟩⟨w₀|) (Bergou p. 122 prints the first where the second is meant): the two are different matrices. */
export function minusUfVersusUw0(n: number, x0: number): number {
  const N = 2 ** n
  const w0 = startState(n)
  const x = unit(N, x0)
  let gap = 0
  for (let i = 0; i < N; i++)
    for (let j = 0; j < N; j++) {
      const mUf = -((i === j ? 1 : 0) - 2 * x[i].re * x[j].re) // −U_f = −(I − 2|x₀⟩⟨x₀|)
      const mUw = -((i === j ? 1 : 0) - 2 * w0[i].re * w0[j].re) // −U_{w₀} = −(I − 2|w₀⟩⟨w₀|)
      gap = Math.max(gap, Math.abs(mUf - mUw))
    }
  return gap
}

/** cos α measured from the engine's own vectors, ⟨w₀|x₀⊥⟩ with the true (minus) |x₀⊥⟩, and Bergou's printed form √(1 − 1/√N) (p. 123) beside it. */
export function cosAlphaMeasured(n: number, x0: number): { measured: number; printed: number } {
  const N = 2 ** n
  const w0 = startState(n)
  const x = unit(N, x0)
  const o = innerRe(x, w0)
  const perp = combo(1 / Math.sqrt(1 - o * o), w0, -o / Math.sqrt(1 - o * o), x)
  return { measured: innerRe(w0, perp), printed: Math.sqrt(1 - 1 / Math.sqrt(N)) }
}

/**
 * The miss chance after k steps from a full simulation, one marked string: `total` = the chance of reading ANY unmarked string,
 * `perItem` = the chance of reading one particular unmarked string, `bound` = 1/N. Bergou p. 123 calls the first O(1/N²); it is O(1/N),
 * and it is the PER-ITEM chance that is O(1/N²).
 */
export function missChances(n: number, x0: number, k: number): { total: number; perItem: number; bound: number } {
  const N = 2 ** n
  const psi = finalState(groverCircuit(n, [x0], k))
  const p = psi.map((z) => z.re * z.re + z.im * z.im)
  const other = x0 === 0 ? 1 : 0
  return { total: p.reduce((s, v, i) => s + (i === x0 ? 0 : v), 0), perItem: p[other], bound: 1 / N }
}
