/**
 * `surgery-graph` (SVG; P-B3 S-a): the gauging graph of a logical operator, drawn from physics/qec/gauge.ts. To measure L = X on a support, put a DOT on each support qubit, a LINK between dots for
 * each new qubit, measure a vertex check at every dot (X on the dot and on its links) and a cycle check around every independent loop (Z on its links); the old Z checks are deformed along the links.
 * The host is a registry id (`patch3-x`, `patches3-xx` with `rungs`, `patch3-steane` with `w`, `seam3`), never coordinates, and `gaugeSystem(host, {rungs, w, drop, order})` builds everything:
 * the dots (side A / B / S, row), the links (path / rung / seam), the engine's cycle basis, the Cheeger constant h = min |boundary S| / |S| (graph.ts), n, k before and after, and the exact
 * deformed distances. Content writes INPUTS only; every count, fraction and distance printed is the engine's. Where a dot sits is a drawing choice (SurgeryGraphScene.tsx lays the sides out
 * as columns, the rows going down). Interpolation: any change switches at the half-way point. Lazy chunk (stage/svg/kinds.ts).
 *
 * P1 (additive): a SECOND source, `lpu: {code, mode, measure?}`, the ancilla graph of a logical processing unit of the bicycle machine (paper-tdg App. A.3; physics/qec/tdg.ts `tdgLpuGraph`):
 * one half graph on a circle ('l', 'r') or both halves with the shared `v_Bell` dot and the bridge links ('full'); `measure` lights the part that measures an operator (`tdgLpuModeOf`) and
 * writes it in a caption row. The counts V, Vq, E, E − V + 1 are the engine's; the cycles kept as checks are the paper's printed numbers (reported) and u = Vq + E + kept. A state names
 * exactly one of `gauge` and `lpu`; an lpu source refuses `show`, `focus`, `product` and `subset`. Drawing: stage/svg/SurgeryLpuScene.tsx.
 */
import type { SurgeryGraphReadout, SurgeryGraphShow, SurgeryGraphState, SurgeryLpuMeasure, SurgeryLpuMode, SurgeryLpuReadout } from '../../content/stage'
import { SURGERY_GRAPH_HOSTS, SURGERY_GRAPH_READOUTS, SURGERY_GRAPH_SHOW, SURGERY_LPU_CODES, SURGERY_LPU_MEASURES, SURGERY_LPU_MODES, SURGERY_LPU_READOUTS } from '../../content/stage'
import { type GaugeOptions, type GaugeSystem, gaugeSystem } from '../../physics/qec/gauge'
import { boundaryEdges } from '../../physics/qec/graph'
import { tdgLpuGraph, tdgLpuModeOf } from '../../physics/qec/tdg'
import type { SvgReadout } from '../svgKinds'
import type { ResolvedGraphCycle, ResolvedGraphEdge, ResolvedGraphSubset, ResolvedGraphVertex, ResolvedLpuEdge, ResolvedLpuGraph, ResolvedLpuVertex, ResolvedSurgeryGraph, SurgeryGraphInputs } from '../types'

/** Either source's resolved state (the kind's `Resolved` type). */
export type AnyResolvedSurgery = ResolvedSurgeryGraph | ResolvedLpuGraph

/** Limits (P-B3 S-a): at most 16 dots (the Cheeger search is exhaustive), at most 3 rungs or matching links, a distance search only for the small deformed codes. */
export const SURGERY_GRAPH_LIMITS = { vertices: 16, rungs: 3, w: 3 } as const

export const SURGERY_GRAPH_DEFAULT_SHOW: readonly SurgeryGraphShow[] = ['vertices', 'edges']

const isInt = (x: unknown): x is number => typeof x === 'number' && Number.isInteger(x)
const gcd = (a: number, b: number): number => (b === 0 ? Math.abs(a) : gcd(b, a % b))

/* ------------------------------------------------ the engine, once per host and options ------------------------------------------------ */
const SYSTEMS = new Map<string, GaugeSystem>()

/** `gaugeSystem` for the authored options, built once (the distance search is exhaustive); throws the engine's message on bad options. */
export function gaugeOf(g: NonNullable<SurgeryGraphState['gauge']>): GaugeSystem {
  const opts: GaugeOptions = {
    ...(g.rungs !== undefined ? { rungs: g.rungs } : {}),
    ...(g.w !== undefined ? { w: g.w } : {}),
    ...(g.drop !== undefined ? { drop: g.drop } : {}),
    ...(g.order !== undefined ? { order: g.order } : {}),
  }
  const key = JSON.stringify([g.host, opts])
  let hit = SYSTEMS.get(key)
  if (!hit) {
    hit = gaugeSystem(g.host, opts)
    if (SYSTEMS.size > 24) SYSTEMS.delete(SYSTEMS.keys().next().value as string)
    SYSTEMS.set(key, hit)
  }
  return hit
}

/* ------------------------------------------------ resolve ------------------------------------------------ */
const MEMO = new Map<string, AnyResolvedSurgery>()

/** The dots around one cycle, in walking order (a fundamental cycle is a simple loop). */
function loopOf(edges: readonly ResolvedGraphEdge[], ids: readonly number[]): number[] {
  const adj = new Map<number, number[]>()
  for (const id of ids) {
    const e = edges[id]
    adj.set(e.u, [...(adj.get(e.u) ?? []), e.v])
    adj.set(e.v, [...(adj.get(e.v) ?? []), e.u])
  }
  const start = Math.min(...adj.keys())
  const out = [start]
  let prev = -1
  let cur = start
  for (let guard = 0; guard < ids.length + 1; guard++) {
    const next = (adj.get(cur) ?? []).find((w) => w !== prev && !(w === start && out.length < 3))
    if (next === undefined || next === start) break
    out.push(next)
    prev = cur
    cur = next
  }
  return out
}

/** Every derived field from the inputs (shared by resolve and interpolate); memoized, since a scroll re-resolves the same state every frame. */
export function surgeryGraphFrom(inp: SurgeryGraphInputs): AnyResolvedSurgery {
  const key = JSON.stringify(inp)
  const hit = MEMO.get(key)
  if (hit) return hit
  const out = build(inp)
  if (MEMO.size > 48) MEMO.delete(MEMO.keys().next().value as string)
  MEMO.set(key, out)
  return out
}

function build(inp: SurgeryGraphInputs): AnyResolvedSurgery {
  if (inp.lpu) return buildLpu(inp)
  const s = gaugeOf(inp.gauge!)
  const links = (v: number): number[] => s.edges.flatMap((e) => (e.u === v || e.v === v ? [e.id] : []))
  const vertices: ResolvedGraphVertex[] = s.vertices.map((v) => {
    const l = links(v.id)
    const what = v.side === 'S' ? `surgery check ${v.label}` : `support qubit ${v.label} (code qubit ${v.qubit})`
    return { id: v.id, label: v.label, side: v.side, row: v.row, qubit: v.qubit, weight: 1 + l.length, links: l, aria: `${what}: its vertex check acts on ${1 + l.length} qubits` }
  })
  const name = (id: number): string => vertices[id].label
  const edges: ResolvedGraphEdge[] = s.edges.map((e) => ({
    id: e.id,
    u: e.u,
    v: e.v,
    kind: e.kind,
    qubit: e.qubit,
    mult: vertices.filter((v) => v.links.includes(e.id)).length,
    aria: `new qubit ${e.qubit}: ${e.kind === 'seam' ? 'seam qubit' : `${e.kind} link`} between ${name(e.u)} and ${name(e.v)}`,
  }))
  const cycles: ResolvedGraphCycle[] = s.cycles.map((c, i) => ({ index: i, edges: [...c], vertices: loopOf(edges, c), dropped: i >= s.keptCycles }))
  const g = gcd(s.cheeger.num, s.cheeger.den) || 1
  let subset: ResolvedGraphSubset | null = null
  if (inp.subset === 'worst') subset = { vertices: [...s.cheeger.set], boundary: [...s.cheeger.boundary], worst: true }
  else if (inp.subset) {
    const set = [...inp.subset].sort((a, b) => a - b)
    subset = { vertices: set, boundary: boundaryEdges({ V: s.V, edges: s.edges.map((e) => [e.u, e.v] as const) }, set), worst: false }
  }
  return {
    kind: 'surgery-graph',
    source: 'gauge',
    host: s.host,
    options: s.options,
    V: s.V,
    E: s.E,
    cycleRank: s.cycleRank,
    keptCycles: s.keptCycles,
    nOriginal: s.nOriginal,
    n: s.n,
    kBefore: s.kBefore,
    kAfter: s.kAfter,
    kTotal: s.kTotal,
    cheeger: { h: s.cheeger.h, num: s.cheeger.num / g, den: s.cheeger.den / g, set: [...s.cheeger.set], boundary: [...s.cheeger.boundary] },
    dX: s.dX,
    dZ: s.dZ,
    d: s.d,
    vertices,
    edges,
    cycles,
    show: inp.show,
    readouts: inp.readouts as SurgeryGraphReadout[],
    focus: inp.focus ? inp.focus.vertex : null,
    product: inp.product,
    subset,
    inputs: inp,
    shot: inp.shot,
  }
}

export function surgeryGraphInputs(st: SurgeryGraphState): SurgeryGraphInputs {
  if (st.lpu) return { lpu: st.lpu, show: [], readouts: st.readouts ?? [], product: false, shot: st.shot }
  return { gauge: st.gauge, show: st.show ?? [...SURGERY_GRAPH_DEFAULT_SHOW], readouts: st.readouts ?? [], focus: st.focus, product: st.product === true, subset: st.subset, shot: st.shot }
}

export function resolveSurgeryGraphStage(st: SurgeryGraphState, _s: number): AnyResolvedSurgery {
  void _s
  return surgeryGraphFrom(surgeryGraphInputs(st))
}

/* ------------------------------------------------ interpolation ------------------------------------------------ */
/** Nothing is continuous here (a rung, a cycle, a shaded set): a change of host, option, focus, subset or show switches at the half-way point. */
export function interpSurgeryGraphStage(a: AnyResolvedSurgery, b: AnyResolvedSurgery, t: number): AnyResolvedSurgery {
  if (t <= 0) return a
  if (t >= 1) return b
  return t < 0.5 ? a : b
}

/* ------------------------------------------------ validation ------------------------------------------------ */
const where = (f: string): string => `surgery-graph ${f}`
const list = (xs: readonly string[]): string => xs.map((v) => `'${v}'`).join(', ')

export function validateSurgeryGraphStage(st: SurgeryGraphState): string[] {
  const errs: string[] = []
  if (st.lpu !== undefined && st.gauge !== undefined) return [where('exactly one of gauge, lpu (this state names both)')]
  if (st.lpu !== undefined) return validateLpuSource(st)
  const g = st.gauge
  if (!g || typeof g !== 'object') return [where('exactly one of gauge, lpu (this state names neither): gauge: { host, rungs?, w?, drop?, order? } or lpu: { code, mode, measure? }')]
  if (!(SURGERY_GRAPH_HOSTS as readonly string[]).includes(g.host)) return [where(`gauge.host: one of ${list(SURGERY_GRAPH_HOSTS)}`)]
  const host = g.host
  if (g.rungs !== undefined) {
    if (host !== 'patches3-xx') errs.push(where('gauge.rungs: only the host patches3-xx has rungs'))
    else if (g.rungs === 0) errs.push(where('gauge.rungs: a ladder with no rung is two separate paths and is not connected; use 1–3'))
    else if (!isInt(g.rungs) || g.rungs < 1 || g.rungs > SURGERY_GRAPH_LIMITS.rungs) errs.push(where(`gauge.rungs: a whole number 1–${SURGERY_GRAPH_LIMITS.rungs}`))
  }
  if (g.w !== undefined) {
    if (host !== 'patch3-steane') errs.push(where('gauge.w: only the host patch3-steane has an adapter width'))
    else if (!isInt(g.w) || g.w < 1 || g.w > SURGERY_GRAPH_LIMITS.w) errs.push(where(`gauge.w: a whole number 1–${SURGERY_GRAPH_LIMITS.w}`))
  }
  if (g.order !== undefined) {
    if (host !== 'patches3-xx' && host !== 'patch3-steane') errs.push(where('gauge.order: only the hosts patches3-xx and patch3-steane match their dots'))
    else if (!Array.isArray(g.order) || g.order.length !== 3 || ![0, 1, 2].every((i) => (g.order as number[]).includes(i))) errs.push(where('gauge.order: a permutation of 0, 1, 2'))
  }
  if (g.drop !== undefined && !isInt(g.drop)) errs.push(where('gauge.drop: a whole number'))
  for (const key of Object.keys(g)) if (!['host', 'rungs', 'w', 'drop', 'order'].includes(key)) errs.push(where(`gauge.${key}: unknown (host, rungs, w, drop, order)`))
  if (st.show !== undefined) {
    if (!Array.isArray(st.show) || !st.show.every((x) => (SURGERY_GRAPH_SHOW as readonly string[]).includes(x))) errs.push(where(`show: a list of ${list(SURGERY_GRAPH_SHOW)}`))
    else if (new Set(st.show).size !== st.show.length) errs.push(where('show: each name once'))
  }
  if (st.readouts !== undefined) {
    if (!Array.isArray(st.readouts) || !st.readouts.every((x) => (SURGERY_GRAPH_READOUTS as readonly string[]).includes(x))) errs.push(where(`readouts: a list of ${list(SURGERY_GRAPH_READOUTS)}`))
    else if (new Set(st.readouts).size !== st.readouts.length) errs.push(where('readouts: each name once'))
  }
  if (st.product !== undefined && typeof st.product !== 'boolean') errs.push(where('product: true or false'))
  if (errs.length) return errs
  // the engine decides the rest (connectivity, the cycle rank, the number of dots)
  let sys: GaugeSystem
  try {
    sys = gaugeOf({ host, rungs: g.rungs, w: g.w, order: g.order })
  } catch (e) {
    return [where(`gauge: ${(e as Error).message.replace(/^gaugeSystem: /, '')}`)]
  }
  if (g.drop !== undefined && (g.drop < 0 || g.drop > sys.cycleRank)) errs.push(where(`gauge.drop: a whole number 0–${sys.cycleRank} (this graph has ${sys.cycleRank} independent cycle${sys.cycleRank === 1 ? '' : 's'})`))
  if (sys.V > SURGERY_GRAPH_LIMITS.vertices) errs.push(where(`gauge: ${sys.V} dots; at most ${SURGERY_GRAPH_LIMITS.vertices}`))
  if (st.focus !== undefined) {
    if (!st.focus || typeof st.focus !== 'object' || !isInt(st.focus.vertex) || st.focus.vertex < 0 || st.focus.vertex >= sys.V) errs.push(where(`focus.vertex: a dot from 0 to ${sys.V - 1}`))
  }
  if (st.subset !== undefined && st.subset !== 'worst') {
    const half = Math.floor(sys.V / 2)
    const s = st.subset
    if (!Array.isArray(s) || s.length < 1 || !s.every((v) => isInt(v) && v >= 0 && v < sys.V)) errs.push(where(`subset: 'worst' or a list of dots from 0 to ${sys.V - 1}`))
    else if (new Set(s).size !== s.length) errs.push(where('subset: each dot once'))
    else if (s.length > half) errs.push(where(`subset: at most ${half} of the ${sys.V} dots (the Cheeger constant looks at sets of at most half the dots)`))
  }
  return errs
}

/* ------------------------------------------------ readouts ------------------------------------------------ */
/** h = num / den, exactly (reduced), as text. */
export const cheegerText = (r: ResolvedSurgeryGraph): string => (r.cheeger.num === 0 ? 'h = 0' : r.cheeger.den === 1 ? `h = ${r.cheeger.num}` : `h = ${r.cheeger.num}/${r.cheeger.den}`)

/** The numbers under the shaded set, as one line: "S = {A1, A2, A3}: |S| = 3, boundary 1, 1/3 (worst set)". */
export function subsetText(r: ResolvedSurgeryGraph): string | null {
  const s = r.subset
  if (!s) return null
  const a = s.vertices.length
  const b = s.boundary.length
  const gg = gcd(b, a) || 1
  const ratio = b === 0 ? '0' : a / gg === 1 ? `${b / gg}` : `${b / gg}/${a / gg}`
  return `|S| = ${a}, boundary = ${b}, ${ratio}${s.worst ? ' (worst set)' : ''}`
}

/** The deformed distances as text; the patch alone has no stored qubit left. */
export function distanceText(r: ResolvedSurgeryGraph): string {
  if (r.kAfter === 0) return 'no stored qubit left'
  if (r.dX === null || r.dZ === null) return 'deformed distance: not found'
  return `distance (X, Z) = (${r.dX}, ${r.dZ})`
}

export function kText(r: ResolvedSurgeryGraph): string {
  const base = `k: ${r.kBefore} → ${r.kAfter}`
  return r.options.drop > 0 ? `${base} · ${r.kTotal} with ${r.options.drop} gauge` : base
}

const PRINTERS: { readonly [K in SurgeryGraphReadout]: (r: ResolvedSurgeryGraph) => SvgReadout } = {
  V: (r) => ({ name: 'V', text: `V = ${r.V} dots`, tone: 'text' }),
  E: (r) => ({ name: 'E', text: `E = ${r.E} links`, tone: 'text' }),
  cycles: (r) => ({ name: 'cycles', text: `cycles: ${r.E} − ${r.V} + 1 = ${r.cycleRank}`, tone: 'op' }),
  cheeger: (r) => ({ name: 'cheeger', text: `${cheegerText(r)}${r.subset?.worst ? ' · worst set' : ''}`, tone: 'plus' }),
  n: (r) => ({ name: 'n', text: `deformed code: ${r.n} qubits`, tone: 'silver' }),
  k: (r) => ({ name: 'k', text: kText(r), tone: 'state' }),
  distance: (r) => ({ name: 'distance', text: distanceText(r), tone: 'state' }),
}

export function surgeryGraphReadouts(r: AnyResolvedSurgery): SvgReadout[] {
  if (r.source === 'lpu') return r.readouts.map((name) => LPU_PRINTERS[name](r))
  return r.readouts.map((name) => PRINTERS[name](r))
}

/** What the `checks` summary under the picture says: how many vertex and cycle checks are measured (and the gauge qubits left out). */
export function checksText(r: ResolvedSurgeryGraph): string[] {
  const lines = [`${r.V} vertex checks A_v · ${r.keptCycles} cycle check${r.keptCycles === 1 ? '' : 's'} B_c`]
  if (r.options.drop > 0) lines.push(`gauge qubits: ${r.options.drop} (cycle checks left out)`)
  if (r.focus !== null) {
    const v = r.vertices[r.focus]
    lines.push(`A_v at ${v.label}: X on the dot and on ${v.links.length} link${v.links.length === 1 ? '' : 's'} (weight ${v.weight})`)
  }
  return lines
}

/** The accessible text of a picture: the host, the counts and the readouts. */
export const surgeryGraphSummary = (r: AnyResolvedSurgery): string =>
  r.source === 'lpu'
    ? lpuSummary(r)
    : [`gauging graph of ${r.host}: ${r.V} dots, ${r.E} links (new qubits), ${r.cycleRank} cycle${r.cycleRank === 1 ? '' : 's'}`, ...surgeryGraphReadouts(r).map((x) => x.text), ...(subsetText(r) ? [subsetText(r)!] : [])].join('; ')

/* ================================================ the lpu source (Papers P1) ================================================ */

const MACRON = '̄'
/** "X̄1": a logical operator of the paper's basis, with a combining macron after its letter. */
export const lpuOpLabel = (op: SurgeryLpuMeasure): string => `${op[0]}${MACRON}${op.slice(1)}`
/** The part of the graph that measures an operator, in words. */
export const lpuPartWords = (part: SurgeryLpuMode): string => (part === 'l' ? 'the left half' : part === 'r' ? 'the right half' : 'the whole graph')

function buildLpu(inp: SurgeryGraphInputs): ResolvedLpuGraph {
  const l = inp.lpu!
  const g = tdgLpuGraph(l.code, l.mode)
  // dots are numbered from 1 within their half, in the engine's order: the i-th plain dot of the left half is bridged to the i-th plain dot of the right half, and carries the same number
  const rank = { l: 0, r: 0, bell: 0 }
  const halfName = { l: 'left', r: 'right', bell: 'shared' } as const
  const vertices: ResolvedLpuVertex[] = g.vertices.map((v) => {
    rank[v.half] += 1
    const number = rank[v.half]
    const label = v.half === 'bell' ? 'v_Bell' : String(number)
    const what = v.half === 'bell' ? 'the shared dot v_Bell (it stands for two check qubits), on code qubit ' : `${l.mode === 'full' ? `${halfName[v.half]} half dot ` : 'dot '}${number}, on code qubit `
    return { id: v.id, half: v.half, qubit: v.qubit, label, aria: `${what}${v.qubit}` }
  })
  const nameOf = (id: number): string => (vertices[id].half === 'bell' ? 'v_Bell' : `${l.mode === 'full' ? `${halfName[vertices[id].half]} ` : ''}dot ${vertices[id].label}`)
  const edges: ResolvedLpuEdge[] = g.edges.map((e, id) => {
    let half: ResolvedLpuEdge['half']
    if (e.kind === 'bridge') half = 'both'
    else if (e.kind === 'l' || e.kind === 'r') half = e.kind
    else {
      // an added edge belongs to the half its ends are in (the shared dot is in both halves)
      const hs = [vertices[e.a].half, vertices[e.b].half].filter((h) => h !== 'bell')
      half = hs.length === 0 ? 'both' : hs.every((h) => h === hs[0]) ? (hs[0] as 'l' | 'r') : 'both'
    }
    const name = e.kind === 'bridge' ? 'bridge link' : e.kind === 'extra' ? 'added link' : 'link'
    return { id, a: e.a, b: e.b, kind: e.kind, half, aria: `${name} between ${nameOf(e.a)} and ${nameOf(e.b)}${e.kind === 'bridge' ? ' (which dots a bridge joins is a drawing choice)' : ''}` }
  })
  const litPart = l.measure ? tdgLpuModeOf(l.measure) : null
  return {
    kind: 'surgery-graph',
    source: 'lpu',
    code: l.code,
    mode: l.mode,
    measure: l.measure ?? null,
    litPart,
    caption: l.measure && litPart ? `measures ${lpuOpLabel(l.measure)} with ${lpuPartWords(litPart)}` : null,
    vertices,
    edges,
    V: g.V,
    Vq: g.Vq,
    E: g.E,
    rank: g.rank,
    kept: g.kept,
    u: g.u,
    bridge: g.bridge,
    readouts: inp.readouts as SurgeryLpuReadout[],
    inputs: inp,
    shot: inp.shot,
  }
}

function validateLpuSource(st: SurgeryGraphState): string[] {
  const errs: string[] = []
  const l = st.lpu
  if (!l || typeof l !== 'object' || Array.isArray(l)) return [where('lpu: { code, mode, measure? }')]
  for (const key of Object.keys(l)) if (!['code', 'mode', 'measure'].includes(key)) errs.push(where(`lpu.${key}: unknown (code, mode, measure)`))
  const codeOk = (SURGERY_LPU_CODES as readonly string[]).includes(l.code)
  const modeOk = (SURGERY_LPU_MODES as readonly string[]).includes(l.mode)
  if (!codeOk) errs.push(where(`lpu.code: one of ${list(SURGERY_LPU_CODES)}`))
  if (!modeOk) errs.push(where(`lpu.mode: one of ${list(SURGERY_LPU_MODES)}`))
  if (l.measure !== undefined) {
    if (!(SURGERY_LPU_MEASURES as readonly string[]).includes(l.measure)) errs.push(where(`lpu.measure: one of ${list(SURGERY_LPU_MEASURES)}`))
    else if (modeOk && l.mode !== 'full') {
      const needs = tdgLpuModeOf(l.measure)
      if (needs === 'full') errs.push(where(`lpu.measure: ${lpuOpLabel(l.measure)} needs the whole graph; use mode 'full'`))
      else if (needs !== l.mode) errs.push(where(`lpu.measure: ${lpuOpLabel(l.measure)} is measured with ${lpuPartWords(needs)}, but mode '${l.mode}' draws the ${l.mode === 'l' ? 'left' : 'right'} half; use mode '${needs}' or 'full'`))
    }
  }
  for (const [f, v] of [['show', st.show], ['focus', st.focus], ['product', st.product], ['subset', st.subset]] as const) if (v !== undefined) errs.push(where(`${f}: not for an lpu source (an lpu source takes lpu and readouts only)`))
  if (st.readouts !== undefined) {
    const rs = st.readouts
    if (!Array.isArray(rs) || !rs.every((x) => (SURGERY_LPU_READOUTS as readonly string[]).includes(x))) errs.push(where(`readouts: an lpu source takes a list of ${list(SURGERY_LPU_READOUTS)}`))
    else {
      if (new Set(rs).size !== rs.length) errs.push(where('readouts: each name once'))
      if (rs.includes('u') && modeOk && l.mode !== 'full') errs.push(where("readouts: 'u' = Vq + E + kept counts the whole graph; it needs mode 'full'"))
    }
  }
  return errs
}

const LPU_PRINTERS: { readonly [K in SurgeryLpuReadout]: (r: ResolvedLpuGraph) => SvgReadout } = {
  V: (r) => ({ name: 'V', text: `V = ${r.V} dots${r.mode === 'full' ? ` · ${r.Vq} check qubits` : ''}`, tone: 'text' }),
  E: (r) => ({ name: 'E', text: `E = ${r.E} links`, tone: 'text' }),
  cycles: (r) => ({ name: 'cycles', text: `cycles: ${r.E} − ${r.V} + 1 = ${r.rank}`, tone: 'op' }),
  kept: (r) => ({ name: 'kept', text: `cycles kept as checks: ${r.kept} (reported)`, tone: 'plus' }),
  u: (r) => ({ name: 'u', text: `u = Vq + E + kept = ${r.Vq} + ${r.E} + ${r.kept} = ${r.u}`, tone: 'state' }),
}

/** The accessible text of an lpu picture: the code and mode, the counts and the readouts. */
export function lpuSummary(r: ResolvedLpuGraph): string {
  const part = r.mode === 'full' ? 'both halves with the shared dot v_Bell and the bridge links' : r.mode === 'l' ? 'the left half graph' : 'the right half graph'
  return [`LPU graph of the ${r.code} code: ${part}; ${r.V} dots, ${r.E} links, ${r.rank} independent cycles`, ...(r.caption ? [r.caption] : []), ...surgeryGraphReadouts(r).map((x) => x.text)].join('; ')
}
