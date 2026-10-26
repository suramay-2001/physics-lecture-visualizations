/**
 * A quantum circuit with a classical tuner: the MaxCut QAOA of Chapter Q19 (Bergou §7.8, pp. 141-142). Pure functions, ħ = 1;
 * numpy twin pipeline/make_walk_fixtures.py → __fixtures__/qc-walk.json.
 *
 * A graph is a list of edges [j, k] between vertices 0…n-1 (vertex j is qubit j: q0 = the top wire = the most significant bit of a string x). The cut of a
 * string x counts the edges whose two ends differ. The cost Hamiltonian H_C = Σ_{jk} ½(1 − σ^z_j σ^z_k) (7.83) is diagonal with H_C|x> = cut(x)|x>. The QAOA
 * state is |γ, β> = e^{-iβ H_B} e^{-iγ H_C} |+…+> with H_B = Σ_j σ^x_j (7.84-7.85), and F(γ, β) = <γ,β|H_C|γ,β> (7.86) is what a classical optimiser raises.
 * The circuit form uses one two-qubit phase box diag(1, e^{-iγ}, e^{-iγ}, 1) per edge and R_x(2β) on every wire.
 */
import { type C, c } from '../complex'
import { type Vec } from '../linalg'
import { type Circuit, type Op } from './circuit'
import { finalState } from './grover'

export type Edge = readonly [number, number]

const need = (ok: boolean, why: string): void => {
  if (!ok) throw new Error(why)
}
const isInt = (x: number): boolean => Number.isInteger(x)
function checkGraph(n: number, edges: readonly Edge[], who: string): void {
  need(isInt(n) && n >= 2 && n <= 10, `${who}: n is a whole number of vertices, 2…10`)
  need(edges.length > 0, `${who}: at least one edge`)
  for (const [j, k] of edges) need(isInt(j) && isInt(k) && j >= 0 && k >= 0 && j < n && k < n && j !== k, `${who}: an edge joins two different vertices in 0…${n - 1}`)
}

/** The n-cycle's edges [0,1], [1,2], …, [n-1,0] (3 ≤ n ≤ 10). */
export function ringEdges(n: number): Edge[] {
  need(isInt(n) && n >= 3 && n <= 10, 'ringEdges: a ring of 3…10 vertices')
  return Array.from({ length: n }, (_, j): Edge => [j, (j + 1) % n])
}

/** The cut of a string of 0/1 characters (character j = vertex j): the number of edges whose ends differ. */
export function cutValue(x: string, edges: readonly Edge[]): number {
  need(/^[01]+$/.test(x), 'cutValue: a string of 0 and 1')
  return edges.reduce((s, [j, k]) => s + (x[j] !== x[k] ? 1 : 0), 0)
}
const bitsOf = (x: number, n: number): string => x.toString(2).padStart(n, '0')
/** cut(x) for the basis index x of n bits (q0 = the most significant bit). */
export const cutOfIndex = (x: number, n: number, edges: readonly Edge[]): number => cutValue(bitsOf(x, n), edges)

/** counts[k] = how many of the 2^n strings have cut k, k = 0…|E|. */
export function cutHistogram(n: number, edges: readonly Edge[]): number[] {
  checkGraph(n, edges, 'cutHistogram')
  const h = new Array<number>(edges.length + 1).fill(0)
  for (let x = 0; x < 2 ** n; x++) h[cutOfIndex(x, n, edges)] += 1
  return h
}
/** The largest cut and every string that reaches it (ascending). */
export function maxCut(n: number, edges: readonly Edge[]): { value: number; strings: string[] } {
  checkGraph(n, edges, 'maxCut')
  const hist = cutHistogram(n, edges)
  const value = hist.reduce((m, cnt, k) => (cnt > 0 ? k : m), 0)
  return { value, strings: Array.from({ length: 2 ** n }, (_, x) => bitsOf(x, n)).filter((s) => cutValue(s, edges) === value) }
}
/** The mean cut over all strings (= |E|/2): what an unbiased guess gets. */
export const meanCut = (n: number, edges: readonly Edge[]): number => cutHistogram(n, edges).reduce((s, cnt, k) => s + cnt * k, 0) / 2 ** n
/** The chance that a uniformly random string is a best cut. */
export function optimalGuessChance(n: number, edges: readonly Edge[]): number {
  const h = cutHistogram(n, edges)
  return h[maxCut(n, edges).value] / 2 ** n
}

/** max |H_C built from σ^z (½(1 − z_j z_k) per edge, z = +1 for bit 0, −1 for bit 1) − the cut table|: the cost Hamiltonian is the cut count. */
export function costHamiltonianGap(n: number, edges: readonly Edge[]): number {
  checkGraph(n, edges, 'costHamiltonianGap')
  let g = 0
  for (let x = 0; x < 2 ** n; x++) {
    const z = (q: number) => 1 - 2 * ((x >> (n - 1 - q)) & 1)
    const hc = edges.reduce((s, [j, k]) => s + 0.5 * (1 - z(j) * z(k)), 0)
    g = Math.max(g, Math.abs(hc - cutOfIndex(x, n, edges)))
  }
  return g
}

/** |γ, β> = e^{-iβ ΣX} e^{-iγ H_C} |+…+> as a vector of 2^n amplitudes. */
export function qaoaState(n: number, edges: readonly Edge[], gamma: number, beta: number): Vec {
  checkGraph(n, edges, 'qaoaState')
  const N = 2 ** n
  const re = new Float64Array(N)
  const im = new Float64Array(N)
  const a = 1 / Math.sqrt(N)
  for (let x = 0; x < N; x++) {
    const ph = -gamma * cutOfIndex(x, n, edges)
    re[x] = a * Math.cos(ph)
    im[x] = a * Math.sin(ph)
  }
  const co = Math.cos(beta)
  const si = Math.sin(beta)
  for (let q = 0; q < n; q++) {
    const m = 1 << (n - 1 - q)
    for (let x = 0; x < N; x++) {
      if (x & m) continue
      const y = x | m
      // e^{-iβX} = cos β I − i sin β X
      const ar = re[x]
      const ai = im[x]
      const br = re[y]
      const bi = im[y]
      re[x] = co * ar + si * bi
      im[x] = co * ai - si * br
      re[y] = co * br + si * ai
      im[y] = co * bi - si * ar
    }
  }
  return Array.from({ length: N }, (_, x): C => c(re[x], im[x]))
}

/** F(γ, β) = <γ,β|H_C|γ,β> (7.86): the average cut the state gives. */
export function qaoaF(n: number, edges: readonly Edge[], gamma: number, beta: number): number {
  const psi = qaoaState(n, edges, gamma, beta)
  return psi.reduce((s, z, x) => s + (z.re ** 2 + z.im ** 2) * cutOfIndex(x, n, edges), 0)
}
/** The chance of each cut value 0…|E| in |γ, β>. */
export function cutDistribution(n: number, edges: readonly Edge[], gamma: number, beta: number): number[] {
  const psi = qaoaState(n, edges, gamma, beta)
  const d = new Array<number>(edges.length + 1).fill(0)
  psi.forEach((z, x) => (d[cutOfIndex(x, n, edges)] += z.re ** 2 + z.im ** 2))
  return d
}
/** The chance of one string in |γ, β>. */
export function qaoaChance(n: number, edges: readonly Edge[], gamma: number, beta: number, x: string): number {
  const z = qaoaState(n, edges, gamma, beta)[parseInt(x, 2)]
  return z.re ** 2 + z.im ** 2
}

/** The 4-cycle's closed form (ours, checked against the circuit): F(γ, β) = 2 + sin 4β sin 2γ. */
export const qaoaRingClosed = (gamma: number, beta: number): number => 2 + Math.sin(4 * beta) * Math.sin(2 * gamma)
/** max over three test points of |F from the state − closed form| on the 4-cycle. */
export function qaoaRingFormulaGap(points: readonly (readonly [number, number])[] = [[0.7, 0.3], [1.9, 2.2], [0.2, 0.1]]): number {
  const E = ringEdges(4)
  return Math.max(...points.map(([g, b]) => Math.abs(qaoaF(4, E, g, b) - qaoaRingClosed(g, b))))
}

/** The first (γ, β) on a grid of `degStep`-degree spacing (γ in [0°, 180°], β in [0°, 90°]) with the largest F (ties within 1e-12 go to the first found, γ outer, β inner). */
export function qaoaGridBest(n: number, edges: readonly Edge[], degStep = 0.5): { F: number; gammaDeg: number; betaDeg: number } {
  checkGraph(n, edges, 'qaoaGridBest')
  need(degStep >= 0.25 && degStep <= 10, 'qaoaGridBest: degStep 0.25…10')
  let best = { F: -Infinity, gammaDeg: 0, betaDeg: 0 }
  const DEG = Math.PI / 180
  for (let g = 0; g <= 180 + 1e-9; g += degStep)
    for (let b = 0; b <= 90 + 1e-9; b += degStep) {
      const f = qaoaF(n, edges, g * DEG, b * DEG)
      if (f > best.F + 1e-12) best = { F: f, gammaDeg: g, betaDeg: b }
    }
  return best
}

/** The circuit: H on every wire; then one two-qubit box diag(1, e^{-iγ}, e^{-iγ}, 1) per edge, packed first-fit into columns whose boxes share no wire; then R_x(2β) on every wire. */
export function qaoaCircuit(n: number, edges: readonly Edge[], gamma: number, beta: number): Circuit {
  checkGraph(n, edges, 'qaoaCircuit')
  const sub = '₀₁₂₃₄₅₆₇₈₉'
  const columns: { wires: Set<number>; ops: Op[] }[] = []
  const phase: [number, number][][] = [
    [[1, 0], [0, 0], [0, 0], [0, 0]],
    [[0, 0], [Math.cos(gamma), -Math.sin(gamma)], [0, 0], [0, 0]],
    [[0, 0], [0, 0], [Math.cos(gamma), -Math.sin(gamma)], [0, 0]],
    [[0, 0], [0, 0], [0, 0], [1, 0]],
  ]
  for (const [j, k] of edges) {
    let col = columns.find((cl) => !cl.wires.has(j) && !cl.wires.has(k))
    if (!col) columns.push((col = { wires: new Set(), ops: [] }))
    col.wires.add(j).add(k)
    col.ops.push({ op: 'unitary', matrix: phase, targets: [j, k], label: `U${sub[j]}${sub[k]}` })
  }
  const all = (f: (q: number) => Op): Op[] => Array.from({ length: n }, (_, q) => f(q))
  return {
    version: 1,
    qubits: n,
    init: '0'.repeat(n),
    wires: Array.from({ length: n }, (_, q) => `v${sub[q]}`),
    columns: [all((q): Op => ({ op: 'gate', gate: 'H', targets: [q] })), ...columns.map((cl) => cl.ops), all((q): Op => ({ op: 'gate', gate: 'Rx', targets: [q], params: [2 * beta] }))],
  }
}
/** max |amplitude of the circuit's final state − qaoaState|: the circuit is the dense exponentials. */
export function qaoaCircuitGap(n: number, edges: readonly Edge[], gamma: number, beta: number): number {
  const a = finalState(qaoaCircuit(n, edges, gamma, beta))
  const b = qaoaState(n, edges, gamma, beta)
  return Math.max(...a.map((z, x) => Math.hypot(z.re - b[x].re, z.im - b[x].im)))
}

export interface PatternPoint {
  gamma: number
  beta: number
  f: number
}
/**
 * The classical loop (Bergou p. 142), as a deterministic pattern search: try the four neighbours at distance `step` in the order +γ, −γ, +β, −β; move to the
 * best one (the first wins a tie) if it raises f by more than 1e-12, else halve the step; stop when the step drops below `tol`. `evals` counts calls of f.
 */
export function qaoaPatternSearch(f: (gamma: number, beta: number) => number, start: readonly [number, number], step: number, tol: number): { path: PatternPoint[]; moves: number; evals: number } {
  need(step > 0 && tol > 0 && step < 10, 'qaoaPatternSearch: positive step and tolerance')
  let cur: PatternPoint = { gamma: start[0], beta: start[1], f: f(start[0], start[1]) }
  const path = [cur]
  let evals = 1
  let s = step
  while (s >= tol) {
    const nb: [number, number][] = [[cur.gamma + s, cur.beta], [cur.gamma - s, cur.beta], [cur.gamma, cur.beta + s], [cur.gamma, cur.beta - s]]
    let best: PatternPoint | null = null
    for (const [g, b] of nb) {
      const v = f(g, b)
      evals += 1
      if (best === null || v > best.f) best = { gamma: g, beta: b, f: v }
    }
    if (best !== null && best.f > cur.f + 1e-12) {
      cur = best
      path.push(cur)
    } else s /= 2
  }
  return { path, moves: path.length - 1, evals }
}

/** The fewest runs that see an event of chance p at least once with confidence `conf`: ⌈ln(1 − conf) / ln(1 − p)⌉. */
export function shotsFor(p: number, conf: number): number {
  need(p > 0 && p <= 1 && conf > 0 && conf < 1, 'shotsFor: 0 < p ≤ 1 and 0 < conf < 1')
  return p === 1 ? 1 : Math.ceil(Math.log(1 - conf) / Math.log(1 - p) - 1e-12)
}
