/**
 * The gauging measurement of a logical operator (Chapter B3, units b3-gauging, b3-distance, b3-bridges; Williamson & Yoder 2024, arXiv:2410.02213 Algorithm 1 and Theorem 1;
 * bridges and adapters after Cross et al. 2024, arXiv:2407.18393 §3.6-3.8 and Swaroop et al. 2024, arXiv:2410.03628 Def. 8). To measure the X-type logical L = X on a support
 * (a CSS code with checks X_i and Z_j): take a connected graph G = (V, E) whose vertices are the qubits of the support, add one NEW qubit in |0⟩ per edge, and measure
 *   vertex checks   A_v = X_v · Π_{e ∋ v} X_e                       (one per vertex),
 *   cycle checks    B_c = Π_{e ∈ c} Z_e                             (one per cycle of a cycle basis),
 *   the old X checks unchanged and the old Z checks DEFORMED: s → s · Π_{e ∈ γ_s} Z_e, where γ_s is a set of edges whose odd-degree vertices are exactly the support qubits s touches.
 * Every edge lies in two vertex checks, so Π_v A_v = L (the measured value is the product of the vertex outcomes), and the deformed code has one stored qubit fewer. The deformed
 * distances depend on the graph: Lemma 2 of the paper bounds the distance below by min(h, 1) · d with h the Cheeger constant (graph.ts). Hosts (fixed d = 3 teaching systems):
 *   patch3-x       one distance-3 patch, L = X̄ on column 0: a path of three vertices.
 *   patches3-xx    two patches, L = X̄_A X̄_B on the columns that face each other: the path edges forced by the boundary Z checks plus 1-3 rungs between the facing columns.
 *   patch3-steane  a patch and a Steane block, L = X̄ of each (weight 3 + weight 3): the two paths joined by an adapter of 1-3 matching edges (any order).
 *   seam3          lattice surgery's own graph: the d + 1 = 4 new checks are the vertices, the d = 3 seam qubits are the edges (a path); the code is the merged 3 × 7 patch.
 * Pure TypeScript, deterministic.
 */
import { GF2Matrix } from './gf2'
import { type CheegerResult, type Graph, cheeger, components, cycleBasis, isConnected } from './graph'
import { rotatedPatch, surgeryDistances, surgeryLayout } from './surgery'
import { cssDistances } from './cssdist'

/* ------------------------------------------------------------------ the builder ------------------------------------------------------------------ */

export interface GaugeSpec {
  /** Qubits of the host code. */
  n: number
  /** Check supports of the CSS host code. */
  xChecks: readonly (readonly number[])[]
  zChecks: readonly (readonly number[])[]
  /** The measured logical L = X on these qubits; they are the vertices of the graph, in this order. */
  support: readonly number[]
  /** The graph's edges as pairs of support qubits (not vertex numbers); edge j becomes qubit n + j. */
  edges: ReadonlyArray<readonly [number, number]>
}

export interface GaugedCode {
  nOriginal: number
  /** n + E. */
  n: number
  V: number
  E: number
  connected: boolean
  /** All X checks / Z checks of the deformed code (supports): old X checks then the vertex checks; deformed Z checks then the cycle checks. */
  xChecks: number[][]
  zChecks: number[][]
  vertexChecks: number[][]
  cycleChecks: number[][]
  /** Cycles as edge-index lists (a basis of the graph's cycle space). */
  cycles: number[][]
  /** The deformed copies of the old Z checks. */
  deformedZ: number[][]
  /** Π_v A_v as a support: equals the support of L. */
  vertexProduct: number[]
  /** Every X check commutes with every Z check. */
  commutes: boolean
  kBefore: number
  kAfter: number
}

const rankOfSupports = (cs: readonly (readonly number[])[], n: number): number => (cs.length ? GF2Matrix.fromSupports(cs, n).rank() : 0)
const kOf = (xs: readonly (readonly number[])[], zs: readonly (readonly number[])[], n: number): number => n - rankOfSupports(xs, n) - rankOfSupports(zs, n)

const overlapEven = (a: readonly number[], b: readonly number[]): boolean => {
  const s = new Set(a)
  return b.filter((q) => s.has(q)).length % 2 === 0
}

export function gaugeBuild(spec: GaugeSpec): GaugedCode {
  const { n, support } = spec
  const V = support.length
  const E = spec.edges.length
  const vOf = new Map<number, number>(support.map((q, i) => [q, i]))
  const edgesV: Array<[number, number]> = spec.edges.map(([a, b], j) => {
    const va = vOf.get(a)
    const vb = vOf.get(b)
    if (va === undefined || vb === undefined) throw new Error(`gaugeBuild: edge ${j} (${a}, ${b}) joins a qubit outside the support`)
    return [va, vb]
  })
  const g: Graph = { V, edges: edgesV }
  const connected = isConnected(g)
  if (!connected) throw new Error('gaugeBuild: the graph must be connected')
  // spanning tree (breadth first from vertex 0) for the deformation paths
  const adj: Array<Array<[number, number]>> = Array.from({ length: V }, () => [])
  edgesV.forEach(([a, b], j) => {
    adj[a].push([b, j])
    adj[b].push([a, j])
  })
  const parent: Array<[number, number] | null> = new Array(V).fill(null)
  const seen = new Array<boolean>(V).fill(false)
  seen[0] = true
  const queue = [0]
  for (let h = 0; h < queue.length; h++)
    for (const [w, j] of adj[queue[h]])
      if (!seen[w]) {
        seen[w] = true
        parent[w] = [queue[h], j]
        queue.push(w)
      }
  const toRoot = (v: number): number[] => {
    const es: number[] = []
    for (let p = parent[v]; p; p = parent[p[0]]) es.push(p[1])
    return es
  }
  const pathEdges = (a: number, b: number): number[] => {
    const set = new Set<number>()
    for (const e of [...toRoot(a), ...toRoot(b)]) set.has(e) ? set.delete(e) : set.add(e)
    return [...set]
  }
  const vertexChecks = support.map((q, v) => [q, ...edgesV.flatMap(([a, b], j) => (a === v || b === v ? [n + j] : []))].sort((x, y) => x - y))
  const cycles = cycleBasis(g)
  const cycleChecks = cycles.map((c) => c.map((e) => n + e))
  const deformedZ = spec.zChecks.map((s, i) => {
    const touched = support.flatMap((q, v) => (s.includes(q) ? [v] : []))
    if (touched.length % 2 !== 0) throw new Error(`gaugeBuild: Z check ${i} meets the support in an odd number of qubits, so L is not a logical operator of this code`)
    const flip = new Set<number>()
    for (let t = 0; t < touched.length; t += 2) for (const e of pathEdges(touched[t], touched[t + 1])) flip.has(e) ? flip.delete(e) : flip.add(e)
    return [...s, ...[...flip].map((e) => n + e)].sort((x, y) => x - y)
  })
  const xChecks = [...spec.xChecks.map((s) => [...s]), ...vertexChecks]
  const zChecks = [...deformedZ, ...cycleChecks]
  const prod = new Map<number, number>()
  for (const a of vertexChecks) for (const q of a) prod.set(q, (prod.get(q) ?? 0) + 1)
  const vertexProduct = [...prod.entries()].filter(([, c]) => c % 2 === 1).map(([q]) => q).sort((x, y) => x - y)
  const commutes = xChecks.every((x) => zChecks.every((z) => overlapEven(x, z)))
  return {
    nOriginal: n,
    n: n + E,
    V,
    E,
    connected,
    xChecks,
    zChecks,
    vertexChecks,
    cycleChecks,
    cycles,
    deformedZ,
    vertexProduct,
    commutes,
    kBefore: kOf(spec.xChecks, spec.zChecks, n),
    kAfter: kOf(xChecks, zChecks, n + E),
  }
}

/** Stored qubits when only the first `keep` cycle checks are measured (the others become gauge qubits: they add to k but carry no data). */
export function gaugeKTotal(code: GaugedCode, keep: number): number {
  return kOf(code.xChecks, [...code.deformedZ, ...code.cycleChecks.slice(0, keep)], code.n)
}

/** The deformed code's exact (d_X, d_Z) by searching the logical operators of the CSS code (n ≤ 40 here). */
export function deformedDistance(code: GaugedCode): { dX: number | null; dZ: number | null; d: number | null } {
  const r = cssDistances(code.xChecks, code.zChecks, code.n)
  return { dX: r.dX, dZ: r.dZ, d: r.d }
}

/** Edges forced by the host's Z checks: a Z check meeting the support in exactly two qubits needs those two joined (an edge, or a path). Pairs in check order. */
export function forcedEdges(zChecks: readonly (readonly number[])[], support: readonly number[]): Array<[number, number]> {
  const out: Array<[number, number]> = []
  for (const z of zChecks) {
    const o = support.filter((q) => z.includes(q))
    if (o.length === 2) out.push([o[0], o[1]])
  }
  return out
}

/* ------------------------------------------------------------------ hosts ------------------------------------------------------------------ */

export type GaugeHostId = 'patch3-x' | 'patches3-xx' | 'patch3-steane' | 'seam3'
export const GAUGE_HOSTS: readonly GaugeHostId[] = ['patch3-x', 'patches3-xx', 'patch3-steane', 'seam3']

/** Rungs are added in this order of the three rows (top, bottom, middle): the same order the plan's numbers use. */
export const RUNG_ORDER = [0, 2, 1] as const

export interface GaugeOptions {
  /** patches3-xx: bridge edges between the facing columns, 0-3 (default 3). */
  rungs?: number
  /** patch3-steane: matching edges of the adapter, 1-3 (default 3). */
  w?: number
  /** Cycle checks left out (a design choice; the omitted ones become gauge qubits), 0 … cycle rank (default 0). */
  drop?: number
  /** patch3-steane / patches3-xx: which partner each patch vertex is matched to, a permutation of 0,1,2 (default identity). */
  order?: readonly number[]
}

export interface GaugeVertex {
  id: number
  /** The host qubit this vertex is (or −1 for a surgery check vertex). */
  qubit: number
  side: 'A' | 'B' | 'S'
  /** Position along the path on its side (0 = top). */
  row: number
  label: string
}

export interface GaugeEdge {
  id: number
  u: number
  v: number
  kind: 'path' | 'rung' | 'seam'
  /** The new qubit this edge becomes: n + id. */
  qubit: number
}

export interface GaugeSystem {
  host: GaugeHostId
  options: { rungs: number; w: number; drop: number; order: number[] }
  vertices: GaugeVertex[]
  edges: GaugeEdge[]
  V: number
  E: number
  /** E − V + 1. */
  cycleRank: number
  /** Cycles as edge-id lists. */
  cycles: number[][]
  /** Cycle checks measured: cycleRank − drop. */
  keptCycles: number
  nOriginal: number
  /** Qubits of the deformed code. */
  n: number
  kBefore: number
  kAfter: number
  /** k when the dropped cycle checks are left out: kAfter + drop (the extras are gauge qubits). */
  kTotal: number
  cheeger: CheegerResult
  dX: number | null
  dZ: number | null
  d: number | null
  /** Π_v A_v equals L (true for every connected graph; reported so a test can assert it). */
  productOk: boolean
  commutes: boolean
}

const steaneRows = (): number[][] => [0, 1, 2].map((b) => Array.from({ length: 7 }, (_, j) => j).filter((j) => ((j + 1) >> b) & 1))

interface HostBuild {
  spec: Omit<GaugeSpec, 'edges'>
  /** Path edges (forced by the Z checks). */
  path: Array<[number, number]>
  /** Candidate rungs / matching pairs in order of use, given the permutation. */
  pairs: (order: readonly number[]) => Array<[number, number]>
  vertices: GaugeVertex[]
}

function hostBuild(host: Exclude<GaugeHostId, 'seam3'>): HostBuild {
  const P = rotatedPatch(3, 3)
  const px = P.checks.filter((k) => k.type === 'X').map((k) => k.qubits)
  const pz = P.checks.filter((k) => k.type === 'Z').map((k) => k.qubits)
  const shift = (cs: readonly (readonly number[])[], by: number): number[][] => cs.map((s) => s.map((q) => q + by))
  if (host === 'patch3-x') {
    const support = [0, 3, 6]
    return {
      spec: { n: 9, xChecks: px, zChecks: pz, support },
      path: forcedEdges(pz, support),
      pairs: () => [],
      vertices: support.map((q, i) => ({ id: i, qubit: q, side: 'A' as const, row: i, label: `q${q}` })),
    }
  }
  if (host === 'patches3-xx') {
    const LA = [2, 5, 8]
    const LB = [9, 12, 15]
    const support = [...LA, ...LB]
    const xChecks = [...px, ...shift(px, 9)]
    const zChecks = [...pz, ...shift(pz, 9)]
    return {
      spec: { n: 18, xChecks, zChecks, support },
      path: forcedEdges(zChecks, support),
      pairs: (order) => RUNG_ORDER.map((i) => [LA[i], LB[order[i]]] as [number, number]),
      vertices: [
        ...LA.map((q, i) => ({ id: i, qubit: q, side: 'A' as const, row: i, label: `A${i + 1}` })),
        ...LB.map((q, i) => ({ id: 3 + i, qubit: q, side: 'B' as const, row: i, label: `B${i + 1}` })),
      ],
    }
  }
  const sr = steaneRows()
  const LP = [0, 3, 6]
  const LS = [9, 10, 11]
  const support = [...LP, ...LS]
  const xChecks = [...px, ...shift(sr, 9)]
  const zChecks = [...pz, ...shift(sr, 9)]
  const path = forcedEdges(zChecks, support)
  // the Steane vertices sit along their path (9, 11, 10): the order in which the forced edges chain them
  const sPath = [9, 11, 10]
  return {
    spec: { n: 16, xChecks, zChecks, support },
    path,
    pairs: (order) => [0, 1, 2].map((i) => [LP[i], sPath[order[i]]] as [number, number]),
    vertices: [
      ...LP.map((q, i) => ({ id: i, qubit: q, side: 'A' as const, row: i, label: `P${i + 1}` })),
      ...sPath.map((q, i) => ({ id: 3 + LS.indexOf(q), qubit: q, side: 'B' as const, row: i, label: `S${q - 8}` })),
    ].sort((a, b) => a.id - b.id),
  }
}

const isPermutation = (o: readonly number[]): boolean => o.length === 3 && [0, 1, 2].every((i) => o.includes(i))

/** Build a hosted gauging system with its graph, deformed code, Cheeger constant and exact distances. */
export function gaugeSystem(host: GaugeHostId, opts: GaugeOptions = {}): GaugeSystem {
  if (!GAUGE_HOSTS.includes(host)) throw new Error(`gaugeSystem: unknown host "${String(host)}"`)
  const order = opts.order ? [...opts.order] : [0, 1, 2]
  if (!isPermutation(order)) throw new Error('gaugeSystem: order must be a permutation of 0, 1, 2')
  const drop = opts.drop ?? 0
  if (host === 'seam3') {
    const L = surgeryLayout(3, 'XX')
    const news = L.checks.map((k, i) => ({ k, i })).filter((x) => x.k.cls === 'new')
    // vertices: the new checks from top to bottom (by the row of their centre); edges: the seam qubits, each shared by two consecutive new checks
    news.sort((a, b) => a.k.center[1] - b.k.center[1] || a.k.center[0] - b.k.center[0])
    const vertices: GaugeVertex[] = news.map((x, i) => ({ id: i, qubit: -1, side: 'S' as const, row: i, label: `c${i + 1}` }))
    const edges: GaugeEdge[] = L.seam.map((q, j) => {
      const ends = news.flatMap((x, i) => (x.k.qubits.includes(q) ? [i] : []))
      if (ends.length !== 2) throw new Error('gaugeSystem: a seam qubit must lie in exactly two new checks')
      return { id: j, u: ends[0], v: ends[1], kind: 'seam' as const, qubit: L.n + j }
    })
    const g: Graph = { V: vertices.length, edges: edges.map((e) => [e.u, e.v] as [number, number]) }
    const cyc = cycleBasis(g)
    const dist = surgeryDistances(3, 'XX')
    const kBefore = 2
    return {
      host,
      options: { rungs: 0, w: 0, drop: 0, order },
      vertices,
      edges,
      V: g.V,
      E: edges.length,
      cycleRank: cyc.length,
      cycles: cyc,
      keptCycles: cyc.length,
      nOriginal: 2 * 9,
      n: L.n,
      kBefore,
      kAfter: L.k,
      kTotal: L.k,
      cheeger: cheeger(g),
      dX: dist.dX,
      dZ: dist.dZ,
      d: dist.d,
      productOk: true,
      commutes: true,
    }
  }
  const hb = hostBuild(host)
  const rungs = host === 'patches3-xx' ? (opts.rungs ?? 3) : 0
  const w = host === 'patch3-steane' ? (opts.w ?? 3) : 0
  if (host === 'patches3-xx' && (!Number.isInteger(rungs) || rungs < 0 || rungs > 3)) throw new Error('gaugeSystem: rungs must be 0 … 3')
  if (host === 'patch3-steane' && (!Number.isInteger(w) || w < 1 || w > 3)) throw new Error('gaugeSystem: w must be 1 … 3')
  const take = host === 'patches3-xx' ? rungs : w
  const extra = hb.pairs(order).slice(0, take)
  const edgeList = [...hb.path, ...extra]
  // a patch of two columns with no rung is two separate paths: not connected, so refuse it with a clear message
  const spec: GaugeSpec = { ...hb.spec, edges: edgeList }
  const vOf = new Map(hb.spec.support.map((q, i) => [q, i]))
  const g: Graph = { V: hb.spec.support.length, edges: edgeList.map(([a, b]) => [vOf.get(a)!, vOf.get(b)!] as [number, number]) }
  if (components(g).length !== 1) throw new Error('gaugeSystem: this host with no bridge or matching edge is not connected (rungs ≥ 1 for patches3-xx)')
  const code = gaugeBuild(spec)
  if (drop < 0 || drop > code.cycles.length || !Number.isInteger(drop)) throw new Error(`gaugeSystem: drop must be a whole number 0 … ${code.cycles.length}`)
  const dist = deformedDistance(code)
  const edges: GaugeEdge[] = edgeList.map(([a, b], j) => ({ id: j, u: vOf.get(a)!, v: vOf.get(b)!, kind: j < hb.path.length ? ('path' as const) : ('rung' as const), qubit: hb.spec.n + j }))
  return {
    host,
    options: { rungs, w, drop, order },
    vertices: hb.vertices,
    edges,
    V: code.V,
    E: code.E,
    cycleRank: code.cycles.length,
    cycles: code.cycles,
    keptCycles: code.cycles.length - drop,
    nOriginal: hb.spec.n,
    n: code.n,
    kBefore: code.kBefore,
    kAfter: code.kAfter,
    kTotal: gaugeKTotal(code, code.cycles.length - drop),
    cheeger: cheeger(g),
    dX: dist.dX,
    dZ: dist.dZ,
    d: dist.d,
    productOk: JSON.stringify(code.vertexProduct) === JSON.stringify([...hb.spec.support].sort((a, b) => a - b)),
    commutes: code.commutes,
  }
}

/** The six ways to match three patch vertices to three partner vertices: how many give Cheeger constant 1 and deformed distance 3 (all six for patch3-steane). */
export function matchingOrders(host: 'patches3-xx' | 'patch3-steane'): { total: number; good: number; perms: Array<{ order: number[]; h: number; d: number | null }> } {
  const perms: number[][] = [[0, 1, 2], [0, 2, 1], [1, 0, 2], [1, 2, 0], [2, 0, 1], [2, 1, 0]]
  const rows = perms.map((order) => {
    const s = gaugeSystem(host, host === 'patches3-xx' ? { rungs: 3, order } : { w: 3, order })
    return { order, h: s.cheeger.h, d: s.d }
  })
  return { total: rows.length, good: rows.filter((r) => Math.abs(r.h - 1) < 1e-12 && r.d === 3).length, perms: rows }
}

/** Cycles a bridge of w edges adds when it joins two connected graphs: (E_A − V_A + 1) + (E_B − V_B + 1) + w − 1 for the joined graph, minus the two parts' own cycles. */
export function bridgeCycles(w: number): number {
  if (!Number.isInteger(w) || w < 1) throw new Error('bridgeCycles: w must be a whole number ≥ 1')
  return w - 1
}
