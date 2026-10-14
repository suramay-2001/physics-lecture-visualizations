/**
 * Small graph tools for the gauging measurement (Chapter B3, units b3-gauging and b3-distance; Williamson & Yoder 2024, arXiv:2410.02213): the incidence matrix
 * over GF(2), the cycle rank E − V + (components), a cycle basis (one fundamental cycle per non-tree edge, deterministic), and the Cheeger constant
 *   h(G) = min over vertex sets S, 0 < |S| ≤ |V|/2, of |∂S| / |S|        (∂S = the edges with exactly one end in S)
 * found by brute force over all 2^V subsets (V ≤ 16). Pure TypeScript; vertices are 0 … V−1, edges are index pairs, an edge's index is its position in the list.
 */
import { GF2Matrix } from './gf2'

export interface Graph {
  readonly V: number
  readonly edges: ReadonlyArray<readonly [number, number]>
}

/** Largest vertex count the Cheeger brute force accepts. */
export const CHEEGER_MAX_V = 16

export function checkGraph(g: Graph): void {
  if (!Number.isInteger(g.V) || g.V < 1) throw new Error('graph: V must be a whole number ≥ 1')
  g.edges.forEach(([a, b], j) => {
    if (!Number.isInteger(a) || !Number.isInteger(b) || a < 0 || b < 0 || a >= g.V || b >= g.V) throw new Error(`graph: edge ${j} (${a}, ${b}) leaves 0 … ${g.V - 1}`)
    if (a === b) throw new Error(`graph: edge ${j} is a loop`)
  })
}

/** The V × E incidence matrix over GF(2): entry (v, e) is 1 when v is an end of e. */
export function incidence(g: Graph): GF2Matrix {
  checkGraph(g)
  const M = GF2Matrix.zeros(g.V, g.edges.length)
  g.edges.forEach(([a, b], j) => {
    M.set(a, j, 1)
    M.set(b, j, 1)
  })
  return M
}

/** The connected components, as a list of vertex lists (each increasing, components ordered by their smallest vertex). */
export function components(g: Graph): number[][] {
  checkGraph(g)
  const adj: number[][] = Array.from({ length: g.V }, () => [])
  g.edges.forEach(([a, b]) => {
    adj[a].push(b)
    adj[b].push(a)
  })
  const seen = new Array<boolean>(g.V).fill(false)
  const out: number[][] = []
  for (let s = 0; s < g.V; s++) {
    if (seen[s]) continue
    const comp: number[] = []
    const stack = [s]
    seen[s] = true
    while (stack.length) {
      const u = stack.pop()!
      comp.push(u)
      for (const w of adj[u]) if (!seen[w]) (seen[w] = true), stack.push(w)
    }
    out.push(comp.sort((x, y) => x - y))
  }
  return out
}

export const isConnected = (g: Graph): boolean => components(g).length === 1

/** E − V + (number of components): how many independent loops the graph has. */
export function cycleRank(g: Graph): number {
  return g.edges.length - g.V + components(g).length
}

/**
 * A cycle basis: a spanning forest by breadth-first search from each component's smallest vertex, then for every edge outside the forest the edge plus the forest
 * path between its ends. Each cycle is a sorted list of edge indices; there are exactly `cycleRank(g)` of them.
 */
export function cycleBasis(g: Graph): number[][] {
  checkGraph(g)
  const adj: Array<Array<[number, number]>> = Array.from({ length: g.V }, () => [])
  g.edges.forEach(([a, b], j) => {
    adj[a].push([b, j])
    adj[b].push([a, j])
  })
  const parent: Array<[number, number] | null> = new Array(g.V).fill(null)
  const seen = new Array<boolean>(g.V).fill(false)
  const treeEdge = new Set<number>()
  for (let s = 0; s < g.V; s++) {
    if (seen[s]) continue
    seen[s] = true
    const queue = [s]
    for (let h = 0; h < queue.length; h++) {
      const u = queue[h]
      for (const [w, j] of adj[u])
        if (!seen[w]) {
          seen[w] = true
          parent[w] = [u, j]
          treeEdge.add(j)
          queue.push(w)
        }
    }
  }
  const toRoot = (v: number): number[] => {
    const es: number[] = []
    for (let p = parent[v]; p; p = parent[p[0]]) es.push(p[1])
    return es
  }
  const cycles: number[][] = []
  g.edges.forEach(([a, b], j) => {
    if (treeEdge.has(j)) return
    const sym = new Set<number>([j])
    for (const e of [...toRoot(a), ...toRoot(b)]) sym.has(e) ? sym.delete(e) : sym.add(e)
    cycles.push([...sym].sort((x, y) => x - y))
  })
  return cycles
}

/** The edges with exactly one end in S. */
export function boundaryEdges(g: Graph, S: readonly number[]): number[] {
  const inS = new Set(S)
  return g.edges.flatMap(([a, b], j) => (inS.has(a) !== inS.has(b) ? [j] : []))
}

export interface CheegerResult {
  /** |∂S| / |S| for the worst set. */
  h: number
  /** The worst set (increasing) and its boundary edges; the first minimum when subsets are listed by their bit pattern. */
  set: number[]
  boundary: number[]
  /** h = num / den exactly. */
  num: number
  den: number
}

/** The Cheeger constant by trying every vertex set of at most half the vertices (V ≤ 16). A graph with V = 1 has no admissible set: h = 0 by convention (num 0, den 1, empty set). */
export function cheeger(g: Graph): CheegerResult {
  checkGraph(g)
  if (g.V > CHEEGER_MAX_V) throw new Error(`cheeger: brute force is limited to V ≤ ${CHEEGER_MAX_V} (got ${g.V})`)
  const half = Math.floor(g.V / 2)
  let best: { num: number; den: number; mask: number } | null = null
  for (let m = 1; m < 2 ** g.V; m++) {
    let size = 0
    for (let v = 0; v < g.V; v++) if ((m >> v) & 1) size++
    if (size > half) continue
    let bd = 0
    for (const [a, b] of g.edges) if (((m >> a) & 1) !== ((m >> b) & 1)) bd++
    // bd / size < best.num / best.den, compared exactly
    if (best === null || bd * best.den < best.num * size) best = { num: bd, den: size, mask: m }
  }
  if (best === null) return { h: 0, set: [], boundary: [], num: 0, den: 1 }
  const set = Array.from({ length: g.V }, (_, v) => v).filter((v) => (best!.mask >> v) & 1)
  return { h: best.num / best.den, set, boundary: boundaryEdges(g, set), num: best.num, den: best.den }
}
