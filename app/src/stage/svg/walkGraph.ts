/**
 * `walk-graph` (SVG; Chapter Q19, P-Q19-story §9.2 S1): the graphs of the scattering walk. A STAR with a centre 0 and N spokes carries a walker whose chance on each
 * spoke (the two edge states |0,j> and |j,0>) is drawn as the spoke's width and shade, with the marked spoke ringed or the extra edge a chord; or a RING of n
 * vertices carries a bit string, its vertices filled by bit and its cut edges thick (MaxCut, Bergou §7.8). Content writes only INPUTS (the graph, the walker's step,
 * start and sign, the string, the readouts); this resolver takes every chance from physics/qc/walk.ts (`starSpokeChances`, the full sparse walk) and every cut from
 * physics/qc/variational.ts, so the picture cannot disagree with the engine. A step is discrete: a change of step cross-fades the widths; a change of graph switches at
 * the half-way point. Lazy chunk (stage/svg/kinds.ts); fidelity `qc-walk-graph-*`.
 */
import { WALK_GRAPH_READOUTS, WALK_GRAPH_SHOW, type WalkGraphReadout, type WalkGraphShow, type WalkGraphState } from '../../content/stage'
import { cutValue, maxCut, ringEdges } from '../../physics/qc/variational'
import { starSpokeChances } from '../../physics/qc/walk'
import type { SvgReadout } from '../svgKinds'
import type { ResolvedWalkGraph, WalkGraphInputs } from '../types'
import { fix } from './draw'

export const WALK_GRAPH_LIMITS = { spokes: [3, 16], ring: [3, 8], steps: 40, readouts: 3 } as const

const isInt = (x: unknown): x is number => typeof x === 'number' && Number.isInteger(x)
const isObj = (x: unknown): x is Record<string, unknown> => typeof x === 'object' && x !== null && !Array.isArray(x)

export function walkGraphInputs(st: WalkGraphState): WalkGraphInputs {
  const star = 'star' in st.graph ? st.graph.star : null
  const graph: WalkGraphInputs['graph'] = star
    ? { star: { N: star.N, marked: star.marked ?? null, extra: star.extra ? [star.extra[0], star.extra[1]] : null } }
    : { ring: { n: (st.graph as { ring: { n: number } }).ring.n } }
  const walker = st.walker ? { step: st.walker.step, start: st.walker.start ?? 'out', sign: st.walker.sign ?? -1 } : null
  const show: WalkGraphShow[] = st.show ? [...st.show] : walker ? ['labels', 'chances'] : ['labels']
  let readouts: WalkGraphReadout[]
  if (st.readouts) readouts = [...st.readouts]
  else if (star && walker) readouts = star.marked !== undefined ? ['step', 'marked'] : ['step', 'near', 'edge']
  else readouts = !star && st.cut !== undefined ? ['cut'] : []
  return { graph, walker: walker as WalkGraphInputs['walker'], cut: st.cut ?? null, show, readouts, shot: st.shot }
}

/** Every derived field from the inputs (shared by resolve and interpolate). */
export function walkGraphFrom(inp: WalkGraphInputs): ResolvedWalkGraph {
  const base = { show: inp.show, readouts: inp.readouts, inputs: inp, shot: inp.shot }
  if ('ring' in inp.graph) {
    const n = inp.graph.ring.n
    const edges = ringEdges(n)
    const bits = inp.cut
    return {
      kind: 'walk-graph',
      topology: 'ring',
      N: n,
      marked: null,
      extra: null,
      step: null,
      start: null,
      sign: null,
      spokes: [],
      extraChance: null,
      markedChance: null,
      nearChance: null,
      ring: {
        edges: edges.map(([j, k]): [number, number] => [j, k]),
        bits,
        cutEdges: edges.map(([j, k]) => bits !== null && bits[j] !== bits[k]),
        cut: bits === null ? null : cutValue(bits, edges),
        best: maxCut(n, edges).value,
      },
      ...base,
    }
  }
  const { N, marked, extra } = inp.graph.star
  const spec = marked !== null ? { marked } : extra !== null ? { extra } : {}
  const w = inp.walker
  const ch = w ? starSpokeChances(N, spec, w.step, { start: w.start, sign: w.sign }) : null
  return {
    kind: 'walk-graph',
    topology: 'star',
    N,
    marked,
    extra,
    step: w ? w.step : null,
    start: w ? w.start : null,
    sign: w ? w.sign : null,
    spokes: ch ? ch.spokes : [],
    extraChance: ch && extra ? ch.extra : null,
    markedChance: ch && marked !== null ? ch.spokes[marked - 1] : null,
    nearChance: ch && extra ? ch.spokes[extra[0] - 1] + ch.spokes[extra[1] - 1] : null,
    ring: null,
    ...base,
  }
}

export const resolveWalkGraphStage = (st: WalkGraphState): ResolvedWalkGraph => walkGraphFrom(walkGraphInputs(st))

/* ------------------------------------------------ interpolation ------------------------------------------------ */
export function interpWalkGraphStage(a: ResolvedWalkGraph, b: ResolvedWalkGraph, t: number): ResolvedWalkGraph {
  if (t <= 0) return a
  if (t >= 1) return b
  const pick = t < 0.5 ? a : b
  const sameGraph = JSON.stringify(a.inputs.graph) === JSON.stringify(b.inputs.graph)
  if (!sameGraph || a.spokes.length === 0 || a.spokes.length !== b.spokes.length) return pick
  // the same star with a walker before and after: the widths cross-fade (the engine's chances at the two steps), the text follows the nearer step
  const mix = (x: number, y: number): number => x + (y - x) * t
  const mixN = (x: number | null, y: number | null): number | null => (x === null || y === null ? pick === a ? x : y : mix(x, y))
  return {
    ...pick,
    spokes: a.spokes.map((x, i) => mix(x, b.spokes[i])),
    extraChance: mixN(a.extraChance, b.extraChance),
    markedChance: mixN(a.markedChance, b.markedChance),
    nearChance: mixN(a.nearChance, b.nearChance),
  }
}

/* ------------------------------------------------ validation ------------------------------------------------ */
function onlyKeys(o: Record<string, unknown>, allowed: readonly string[], where: string, errs: string[]): void {
  for (const k of Object.keys(o)) if (!allowed.includes(k)) errs.push(`walk-graph ${where}: unknown field "${k.slice(0, 40)}"`)
}

export function validateWalkGraphStage(st: WalkGraphState): string[] {
  const errs: string[] = []
  const g = st.graph as unknown
  if (!isObj(g)) return ['walk-graph graph: { star: { N, marked?, extra? } } or { ring: { n } }']
  const hasStar = 'star' in g
  const hasRing = 'ring' in g
  if (hasStar === hasRing) return ['walk-graph graph: exactly one of star and ring']
  onlyKeys(g, [hasStar ? 'star' : 'ring'], 'graph', errs)
  let N = 0
  let marked = false
  let extra = false
  if (hasStar) {
    const s = g.star
    if (!isObj(s)) return ['walk-graph graph.star: { N, marked?, extra? }']
    onlyKeys(s, ['N', 'marked', 'extra'], 'graph.star', errs)
    const [lo, hi] = WALK_GRAPH_LIMITS.spokes
    if (!isInt(s.N) || s.N < lo || s.N > hi) errs.push(`walk-graph graph.star.N: a whole number of spokes, ${lo}…${hi}`)
    else N = s.N
    if (s.marked !== undefined) {
      marked = true
      if (!isInt(s.marked) || s.marked < 1 || s.marked > (N || hi)) errs.push(`walk-graph graph.star.marked: a spoke in 1…N`)
    }
    if (s.extra !== undefined) {
      extra = true
      const e = s.extra
      if (!Array.isArray(e) || e.length !== 2 || !isInt(e[0]) || !isInt(e[1]) || e[0] < 1 || e[1] < 1 || e[0] > (N || hi) || e[1] > (N || hi) || e[0] === e[1]) errs.push('walk-graph graph.star.extra: two different spokes [a, b] in 1…N')
    }
    if (marked && extra) errs.push('walk-graph graph.star: marked and extra do not go together')
  } else {
    const r = g.ring
    if (!isObj(r)) return ['walk-graph graph.ring: { n }']
    onlyKeys(r, ['n'], 'graph.ring', errs)
    const [lo, hi] = WALK_GRAPH_LIMITS.ring
    if (!isInt(r.n) || r.n < lo || r.n > hi) errs.push(`walk-graph graph.ring.n: a whole number of vertices, ${lo}…${hi}`)
    else N = r.n
  }
  const hasWalker = st.walker !== undefined
  if (hasWalker) {
    const w = st.walker as unknown
    if (!hasStar || (!marked && !extra)) errs.push('walk-graph walker: needs a star with a marked spoke or an extra edge')
    if (!isObj(w)) errs.push('walk-graph walker: { step, start?, sign? }')
    else {
      onlyKeys(w, ['step', 'start', 'sign'], 'walker', errs)
      if (!isInt(w.step) || w.step < 0 || w.step > WALK_GRAPH_LIMITS.steps) errs.push(`walk-graph walker.step: a whole number, 0…${WALK_GRAPH_LIMITS.steps}`)
      if (w.start !== undefined) {
        if (w.start !== 'out' && w.start !== 'in') errs.push("walk-graph walker.start: 'out' or 'in'")
        if (!marked) errs.push('walk-graph walker.start: only with a marked spoke')
      }
      if (w.sign !== undefined) {
        if (w.sign !== 1 && w.sign !== -1) errs.push('walk-graph walker.sign: 1 or -1')
        if (!extra) errs.push('walk-graph walker.sign: only with an extra edge')
      }
    }
  }
  if (st.cut !== undefined) {
    if (!hasRing) errs.push('walk-graph cut: only with a ring')
    else if (typeof st.cut !== 'string' || !new RegExp(`^[01]{${N || 0}}$`).test(st.cut)) errs.push(`walk-graph cut: a string of ${N} bits, 0 or 1`)
  }
  const show = st.show ?? []
  for (const s of show) if (!(WALK_GRAPH_SHOW as readonly string[]).includes(s)) errs.push(`walk-graph show: unknown "${String(s)}"`)
  if (new Set(show).size !== show.length) errs.push('walk-graph show: each once')
  if (show.includes('chances') && !hasWalker) errs.push("walk-graph show: 'chances' needs a walker")
  const ro = st.readouts ?? []
  for (const r of ro) if (!(WALK_GRAPH_READOUTS as readonly string[]).includes(r)) errs.push(`walk-graph readouts: unknown "${String(r)}"`)
  if (new Set(ro).size !== ro.length) errs.push('walk-graph readouts: each once')
  if (ro.length > WALK_GRAPH_LIMITS.readouts) errs.push(`walk-graph readouts: at most ${WALK_GRAPH_LIMITS.readouts}`)
  if (ro.includes('step') && !hasWalker) errs.push("walk-graph readouts: 'step' needs a walker")
  if (ro.includes('marked') && !(hasWalker && marked)) errs.push("walk-graph readouts: 'marked' needs a walker on a star with a marked spoke")
  if ((ro.includes('near') || ro.includes('edge')) && !(hasWalker && extra)) errs.push("walk-graph readouts: 'near' and 'edge' need a walker on a star with an extra edge")
  if (ro.includes('cut') && !(hasRing && st.cut !== undefined)) errs.push("walk-graph readouts: 'cut' needs a ring with a cut string")
  return errs
}

/* ------------------------------------------------ readouts ------------------------------------------------ */
const pct = (p: number): string => `${fix(100 * p, 1)} %`

export function walkGraphReadouts(r: ResolvedWalkGraph): SvgReadout[] {
  const out: SvgReadout[] = []
  for (const name of r.readouts) {
    if (name === 'step' && r.step !== null) out.push({ name, text: `step ${r.step}` })
    else if (name === 'marked' && r.markedChance !== null) out.push({ name, text: `marked spoke ${pct(r.markedChance)}` })
    else if (name === 'near' && r.nearChance !== null && r.extra) out.push({ name, text: `spokes ${r.extra[0]}, ${r.extra[1]}: ${pct(r.nearChance)}` })
    else if (name === 'edge' && r.extraChance !== null) out.push({ name, text: `extra edge ${pct(r.extraChance)}` })
    else if (name === 'cut' && r.ring && r.ring.cut !== null) out.push({ name, text: `cut ${r.ring.cut} of ${r.ring.edges.length} sides (${r.ring.bits})` })
  }
  return out
}
