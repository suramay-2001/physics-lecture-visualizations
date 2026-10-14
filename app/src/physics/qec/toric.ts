/**
 * Kitaev's toric code on an L × M torus (P-B1-story §9.1): one qubit on every edge, an X check ("star") at every vertex and a Z check ("plaquette")
 * at every face. Conventions (the plan's): vertex (i, j), 0 ≤ i < L, 0 ≤ j < M; h(i, j) is the edge east of vertex (i, j), v(i, j) the edge north of it;
 * edge index h(i, j) = j·L + i and v(i, j) = L·M + j·L + i; star(i, j) = X on h(i,j), h(i−1,j), v(i,j), v(i,j−1); plaquette(i, j) = Z on the four
 * edges of the face whose south-west corner is (i, j): h(i,j), h(i,j+1), v(i,j), v(i+1,j). Checks are listed vertex by vertex, j-major (index j·L + i).
 * Numpy twin: pipeline/qec_numpy.py `kitaev_torus`; the bivariate-bicycle form A = 1 + x, B = 1 + y is the same code (toric.test.ts).
 */
import { GF2Matrix } from './gf2'
import { CSSCode } from './codes'

export interface ToricEdge {
  /** index = qubit number */
  id: number
  dir: 'h' | 'v'
  i: number
  j: number
}

export type ToricOperatorName = 'z-loop-h' | 'z-loop-v' | 'x-cut-h' | 'x-cut-v' | 'plaquette'

export interface ToricCode {
  L: number
  M: number
  n: number
  code: CSSCode
  edges: ToricEdge[]
  /** qubits of each star, then each plaquette, in check order */
  stars: number[][]
  plaquettes: number[][]
  hEdge(i: number, j: number): number
  vEdge(i: number, j: number): number
}

const mod = (a: number, m: number): number => ((a % m) + m) % m

export function toricCode(L: number, M: number = L): ToricCode {
  if (!Number.isInteger(L) || !Number.isInteger(M) || L < 2 || M < 2 || L > 8 || M > 8) throw new Error('toricCode: L and M must be whole numbers from 2 to 8')
  const hEdge = (i: number, j: number): number => mod(j, M) * L + mod(i, L)
  const vEdge = (i: number, j: number): number => L * M + mod(j, M) * L + mod(i, L)
  const n = 2 * L * M
  const edges: ToricEdge[] = []
  for (let j = 0; j < M; j++) for (let i = 0; i < L; i++) edges[hEdge(i, j)] = { id: hEdge(i, j), dir: 'h', i, j }
  for (let j = 0; j < M; j++) for (let i = 0; i < L; i++) edges[vEdge(i, j)] = { id: vEdge(i, j), dir: 'v', i, j }
  const stars: number[][] = []
  const plaquettes: number[][] = []
  for (let j = 0; j < M; j++)
    for (let i = 0; i < L; i++) {
      stars.push([hEdge(i, j), hEdge(i - 1, j), vEdge(i, j), vEdge(i, j - 1)])
      plaquettes.push([hEdge(i, j), hEdge(i, j + 1), vEdge(i, j), vEdge(i + 1, j)])
    }
  const code = new CSSCode(GF2Matrix.fromSupports(stars, n), GF2Matrix.fromSupports(plaquettes, n), `toric code ${L} × ${M}`)
  return { L, M, n, code, edges, stars, plaquettes, hEdge, vEdge }
}

/** The qubits of a named operator: a loop of Z round the torus, a cut of X across it, or one contractible plaquette. */
export function toricOperator(t: ToricCode, name: ToricOperatorName, at: number): { type: 'X' | 'Z'; qubits: number[] } {
  const { L, M } = t
  if (name === 'z-loop-h') return { type: 'Z', qubits: Array.from({ length: L }, (_, i) => t.hEdge(i, at)) }
  if (name === 'z-loop-v') return { type: 'Z', qubits: Array.from({ length: M }, (_, j) => t.vEdge(at, j)) }
  if (name === 'x-cut-v') return { type: 'X', qubits: Array.from({ length: M }, (_, j) => t.hEdge(at, j)) }
  if (name === 'x-cut-h') return { type: 'X', qubits: Array.from({ length: L }, (_, i) => t.vEdge(i, at)) }
  return { type: 'Z', qubits: t.plaquettes[mod(at, M) * L + mod(at, L)].slice().sort((a, b) => a - b) }
}

/** Which checks anticommute with a pure-X or pure-Z operator on `qubits`: a Z operator is seen by the stars, an X operator by the plaquettes. Check indices. */
export function toricLit(t: ToricCode, type: 'X' | 'Z', qubits: readonly number[]): number[] {
  const bits = new Array<number>(t.n).fill(0)
  for (const q of qubits) bits[q] ^= 1
  const H = type === 'Z' ? t.code.HX : t.code.HZ
  return H.mulVec(bits).flatMap((b, i) => (b ? [i] : []))
}

/** Is a pure-X (or pure-Z) operator an element of the stabilizer group (a product of stars / plaquettes)? */
export function toricInStabilizer(t: ToricCode, type: 'X' | 'Z', qubits: readonly number[]): boolean {
  const bits = new Array<number>(t.n).fill(0)
  for (const q of qubits) bits[q] ^= 1
  return (type === 'X' ? t.code.HX : t.code.HZ).rowspaceContains(bits)
}

/** The largest overlap between a star and a plaquette (2: they share 0 or 2 edges, never 1, so they commute). */
export function toricMaxOverlap(t: ToricCode): number {
  let m = 0
  for (const s of t.stars) for (const p of t.plaquettes) m = Math.max(m, s.filter((q) => p.includes(q)).length)
  return m
}
