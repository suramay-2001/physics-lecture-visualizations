/**
 * Space-time histories of the repetition code under phenomenological noise (P-B1-story §9.1, b1-spacetime; Dennis et al. 2002, section III.3 and IV):
 * n data qubits, n − 1 checks Z_iZ_{i+1}, `rounds` noisy rounds and one final ideal round. A DETECTOR D(i, t) compares check i's reading in round t with
 * round t − 1, for t = 1 … rounds + 1. A fault is an EDGE of the detector graph:
 *   data(q, t): a bit flip of qubit q between rounds t − 1 and t, lighting D(q−1, t) and D(q, t) (only the one that exists at an end qubit);
 *   meas(i, t): a wrong reading of check i in round t, lighting D(i, t) and D(i, t+1).
 * The logical bit is read from qubit 0, so a data edge on qubit 0 flips it ("obs").
 * A minimum-weight matching decoder pairs the lit detectors using the fewest faults, a lit detector at an end qubit being allowed to pair with a
 * boundary. `decodeHistory` is exact (dynamic programming over subsets of the lit detectors, at most 14) and tracks, for both values of the logical
 * flip, the lightest fault set that explains the readout, so ties are reported rather than hidden. `failureSpectrum` counts, for every fault set of
 * weight w, how often the lightest explanation has the wrong logical flip ("fail") or both ("tie").
 * Numpy twin: pipeline/qec_numpy.py (rep_graph, build_lookup, logical_failure_counts).
 */
import { rng } from '../random'

export interface RepEdge {
  kind: 'data' | 'meas'
  /** data: the qubit 0 … n−1; meas: the check 0 … n−2 */
  at: number
  /** the round 1 … rounds */
  t: number
  /** detector indices it lights (1 or 2) */
  dets: number[]
  /** 1 if it flips the logical bit */
  obs: 0 | 1
}

export interface RepGraph {
  n: number
  rounds: number
  /** detector index = (t − 1)(n − 1) + check */
  detectors: { check: number; t: number }[]
  edges: RepEdge[]
}

export const detectorIndex = (n: number, check: number, t: number): number => (t - 1) * (n - 1) + check

export function repetitionGraph(n: number, rounds: number): RepGraph {
  if (!Number.isInteger(n) || n < 3 || n > 9 || !Number.isInteger(rounds) || rounds < 1 || rounds > 6) throw new Error('repetitionGraph: n from 3 to 9 and rounds from 1 to 6')
  const detectors: { check: number; t: number }[] = []
  for (let t = 1; t <= rounds + 1; t++) for (let check = 0; check < n - 1; check++) detectors.push({ check, t })
  const edges: RepEdge[] = []
  for (let t = 1; t <= rounds; t++)
    for (let q = 0; q < n; q++) {
      const dets: number[] = []
      if (q >= 1) dets.push(detectorIndex(n, q - 1, t))
      if (q <= n - 2) dets.push(detectorIndex(n, q, t))
      edges.push({ kind: 'data', at: q, t, dets, obs: q === 0 ? 1 : 0 })
    }
  for (let t = 1; t <= rounds; t++) for (let i = 0; i < n - 1; i++) edges.push({ kind: 'meas', at: i, t, dets: [detectorIndex(n, i, t), detectorIndex(n, i, t + 1)], obs: 0 })
  return { n, rounds, detectors, edges }
}

export interface RepFault {
  kind: 'data' | 'meas'
  at: number
  t: number
}

export const edgeIndex = (g: RepGraph, f: RepFault): number => {
  const i = g.edges.findIndex((e) => e.kind === f.kind && e.at === f.at && e.t === f.t)
  if (i < 0) throw new Error(`no ${f.kind} fault at ${f.at}, round ${f.t} in the n = ${g.n}, ${g.rounds}-round history`)
  return i
}

/** The detectors lit (sorted) and the logical flip caused by a set of faults (each fault applied once; repeated faults cancel). */
export function historyOf(g: RepGraph, faults: readonly RepFault[]): { lit: number[]; trueFlip: 0 | 1 } {
  const lit = new Set<number>()
  let obs = 0
  const seen = new Set<number>()
  for (const f of faults) {
    const idx = edgeIndex(g, f)
    if (seen.has(idx)) {
      seen.delete(idx)
    } else seen.add(idx)
  }
  for (const idx of seen) {
    const e = g.edges[idx]
    for (const d of e.dets) {
      if (lit.has(d)) lit.delete(d)
      else lit.add(d)
    }
    obs ^= e.obs
  }
  return { lit: [...lit].sort((a, b) => a - b), trueFlip: obs as 0 | 1 }
}

/** A seeded random history: every data edge fires with chance p, every readout edge with chance q. */
export function sampleHistory(g: RepGraph, p: number, q: number, seed: number): RepFault[] {
  const rand = rng(seed)
  const out: RepFault[] = []
  for (const e of g.edges) if (rand() < (e.kind === 'data' ? p : q)) out.push({ kind: e.kind, at: e.at, t: e.t })
  return out
}

/* ------------------------------------------------------------------ matching ------------------------------------------------------------------ */

export const MATCH_MAX_EVENTS = 14

export interface MatchPair {
  /** a lit detector index */
  a: number
  /** the partner detector, or 'boundary' */
  b: number | 'boundary'
  weight: number
}

export interface Decoded {
  /** fewest faults that explain the lit detectors */
  weight: number
  /** the logical flips some lightest explanation has (one entry, or both when it is a tie) */
  flips: (0 | 1)[]
  tie: boolean
  /** the decoder's answer: 0 unless every lightest explanation flips the logical bit */
  decodedFlip: 0 | 1
  /** one lightest matching that gives `decodedFlip` */
  pairs: MatchPair[]
}

/** Shortest path lengths from every lit detector over (node, logical parity) states; the boundary is node D. */
function parityDistances(g: RepGraph, lit: readonly number[]): Map<number, number[][]> {
  const D = g.detectors.length
  const adj: { to: number; obs: number }[][] = Array.from({ length: D + 1 }, () => [])
  for (const e of g.edges) {
    const [a, b] = e.dets.length === 2 ? e.dets : [e.dets[0], D]
    adj[a].push({ to: b, obs: e.obs })
    adj[b].push({ to: a, obs: e.obs })
  }
  const out = new Map<number, number[][]>()
  for (const s of lit) {
    const dist: number[][] = Array.from({ length: D + 1 }, () => [Infinity, Infinity])
    dist[s][0] = 0
    let frontier: [number, number][] = [[s, 0]]
    while (frontier.length) {
      const next: [number, number][] = []
      for (const [u, p] of frontier)
        for (const { to, obs } of adj[u]) {
          const np = p ^ obs
          if (dist[to][np] === Infinity) {
            dist[to][np] = dist[u][p] + 1
            next.push([to, np])
          }
        }
      frontier = next
    }
    out.set(s, dist)
  }
  return out
}

export function decodeHistory(g: RepGraph, lit: readonly number[]): Decoded {
  const m = lit.length
  if (m > MATCH_MAX_EVENTS) throw new Error(`decodeHistory: ${m} lit detectors; the exact matching handles at most ${MATCH_MAX_EVENTS}`)
  if (m === 0) return { weight: 0, flips: [0], tie: false, decodedFlip: 0, pairs: [] }
  const D = g.detectors.length
  const dist = parityDistances(g, lit)
  const pairCost = (i: number, j: number | 'b', p: number): number => dist.get(lit[i])![j === 'b' ? D : lit[j]][p]
  const size = 1 << m
  // best[mask][p]: fewest faults that pair up exactly the detectors in `mask` with total logical parity p
  const best: number[][] = Array.from({ length: size }, () => [Infinity, Infinity])
  const back: ({ j: number | 'b'; q: number } | null)[][] = Array.from({ length: size }, () => [null, null])
  best[0][0] = 0
  for (let mask = 1; mask < size; mask++) {
    let i = 0
    while (!((mask >> i) & 1)) i++
    const rest = mask & ~(1 << i)
    for (let q = 0; q < 2; q++) {
      const c = pairCost(i, 'b', q)
      if (c === Infinity) continue
      for (let p = 0; p < 2; p++) {
        const w = best[rest][p ^ q] + c
        if (w < best[mask][p]) {
          best[mask][p] = w
          back[mask][p] = { j: 'b', q }
        }
      }
    }
    for (let j = i + 1; j < m; j++) {
      if (!((mask >> j) & 1)) continue
      const rest2 = rest & ~(1 << j)
      for (let q = 0; q < 2; q++) {
        const c = pairCost(i, j, q)
        if (c === Infinity) continue
        for (let p = 0; p < 2; p++) {
          const w = best[rest2][p ^ q] + c
          if (w < best[mask][p]) {
            best[mask][p] = w
            back[mask][p] = { j, q }
          }
        }
      }
    }
  }
  const full = size - 1
  const weight = Math.min(best[full][0], best[full][1])
  const flips = ([0, 1] as const).filter((p) => best[full][p] === weight)
  const decodedFlip: 0 | 1 = flips.includes(0) ? 0 : 1
  const pairs: MatchPair[] = []
  let mask = full
  let p = decodedFlip as number
  while (mask) {
    const step = back[mask][p]!
    let i = 0
    while (!((mask >> i) & 1)) i++
    const partner = step.j
    pairs.push({ a: lit[i], b: partner === 'b' ? 'boundary' : lit[partner], weight: pairCost(i, partner, step.q) })
    mask &= ~(1 << i)
    if (partner !== 'b') mask &= ~(1 << partner)
    p ^= step.q
  }
  return { weight, flips: [...flips], tie: flips.length === 2, decodedFlip, pairs }
}

/** One authored or sampled history, decoded: the faults, the lit detectors, the verdict. */
export function runHistory(g: RepGraph, faults: readonly RepFault[]): { lit: number[]; trueFlip: 0 | 1; decoded: Decoded; failed: boolean } {
  const { lit, trueFlip } = historyOf(g, faults)
  const decoded = decodeHistory(g, lit)
  return { lit, trueFlip, decoded, failed: decoded.decodedFlip !== trueFlip }
}

/* ------------------------------------------------------------------ failure counts ------------------------------------------------------------------ */

export interface WeightRow {
  w: number
  total: number
  fail: number
  tie: number
  /** fail + tie */
  bad: number
}

export interface Spectrum {
  edges: number
  rows: WeightRow[]
  /** exact logical failure chance, ties split evenly; only when every subset was enumerated (full) */
  pL?: (p: number) => number
}

function eachSubset(E: number, w: number, visit: (idx: number[]) => void): void {
  const idx: number[] = []
  const rec = (start: number): void => {
    if (idx.length === w) return visit(idx)
    for (let e = start; e <= E - (w - idx.length); e++) {
      idx.push(e)
      rec(e + 1)
      idx.pop()
    }
  }
  rec(0)
}

export const SPECTRUM_LIMITS = { maxEdgesForW3: 45, maxEdgesForW4: 15, maxEdgesFull: 15 }

/**
 * For every set of w faults (w = 1 … maxW, or every size when `full`), compare the true logical flip with the lightest explanations of its detector
 * pattern (a table built from the lighter sets first). `fail`: every lightest explanation flips the other way; `tie`: lightest explanations of both kinds.
 */
export function failureSpectrum(g: RepGraph, maxW: number, full = false): Spectrum {
  const E = g.edges.length
  const top = full ? E : maxW
  if (full && E > SPECTRUM_LIMITS.maxEdgesFull) throw new Error(`failureSpectrum: a full enumeration is limited to ${SPECTRUM_LIMITS.maxEdgesFull} fault places (this history has ${E})`)
  if (!full && ((maxW >= 4 && E > SPECTRUM_LIMITS.maxEdgesForW4) || (maxW === 3 && E > SPECTRUM_LIMITS.maxEdgesForW3) || maxW > 4)) throw new Error(`failureSpectrum: weight ${maxW} on ${E} fault places is too large`)
  const table = new Map<bigint, { w: number; obs: number }>()
  const key = (idx: readonly number[]): { m: bigint; o: number } => {
    let m = 0n
    let o = 0
    for (const e of idx) {
      for (const d of g.edges[e].dets) m ^= 1n << BigInt(d)
      o ^= g.edges[e].obs
    }
    return { m, o }
  }
  table.set(0n, { w: 0, obs: 1 })
  for (let w = 1; w <= top; w++)
    eachSubset(E, w, (idx) => {
      const { m, o } = key(idx)
      const cur = table.get(m)
      if (!cur) table.set(m, { w, obs: 1 << o })
      else if (cur.w === w) cur.obs |= 1 << o
    })
  const rows: WeightRow[] = []
  for (let w = 1; w <= top; w++) {
    let total = 0
    let fail = 0
    let tie = 0
    eachSubset(E, w, (idx) => {
      const { m, o } = key(idx)
      const t = table.get(m)!
      total++
      if (t.obs === 3) tie++
      else if (t.obs !== 1 << o) fail++
    })
    rows.push({ w, total, fail, tie, bad: fail + tie })
  }
  const spectrum: Spectrum = { edges: E, rows }
  if (full) spectrum.pL = (p: number): number => rows.reduce((s, r) => s + (r.fail + 0.5 * r.tie) * p ** r.w * (1 - p) ** (E - r.w), 0)
  return spectrum
}
