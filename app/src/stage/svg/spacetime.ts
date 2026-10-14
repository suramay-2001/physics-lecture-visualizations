/**
 * `spacetime` (709 / Papers; SVG; P-B1-story §9.2 K-ST): the detector history of the repetition code under noise, drawn from physics/qec/spacetime.ts. Columns are
 * the n − 1 checks (a boundary column at each side), rows are the rounds 1 … rounds + 1 (the last round is ideal): a DATA fault is a horizontal edge, a READOUT fault a
 * vertical one, a lit detector is a check whose reading changed from one round to the next. The matching decoder pairs the lit detectors with the fewest faults (a lit detector
 * at either end may pair with the boundary; the left boundary is the side that flips the logical bit) and says whether the logical qubit ended up flipped.
 *   history   faults (authored, or a seeded random sample), the lit detectors, the matching, a verdict line;
 *   spectrum  no history: a bar for each fault weight w (how many fault sets of that weight there are, how many make the lightest explanation wrong, how many are a tie).
 * Content writes INPUTS only (n, rounds, faults or a seed, what to show); every lit detector, matching arc, weight and count comes from the engine. Interpolation: the cursor
 * lerps when the two sides are the same history; any other change switches at the half-way point. Lazy chunk (stage/svg/kinds.ts).
 */
import type { SpacetimeState } from '../../content/stage'
import { SPACETIME_SHOW } from '../../content/stage'
import { MATCH_MAX_EVENTS, SPECTRUM_LIMITS, decodeHistory, edgeIndex, failureSpectrum, historyOf, repetitionGraph, sampleHistory, type Decoded, type RepFault, type RepGraph } from '../../physics/qec/spacetime'
import type { SvgReadout } from '../svgKinds'
import type { ResolvedSpacetime, ResolvedSpacetimeArc, ResolvedSpacetimeSpectrum, SpacetimeInputs } from '../types'

/** Validation limits (P-B1-story §9.2): small enough that every detector and edge stays readable on a phone-width stage. */
export const SPACETIME_LIMITS = { nMin: 3, nMax: 9, roundsMin: 1, roundsMax: 6, faultsMax: 12, matchEvents: MATCH_MAX_EVENTS, maxW: 4, ...SPECTRUM_LIMITS } as const

export const DEFAULT_SHOW = ['faults', 'detectors'] as const

/* ------------------------------------------------ matching arcs ------------------------------------------------ */

/**
 * The lines to draw for the engine's matching. A pair of lit detectors is drawn directly (their grid distance is the weight); a pair that goes round through the boundary is drawn as
 * two arcs, one from each detector to the boundary it uses; a detector paired with the boundary goes to the left boundary (which flips the logical bit) or the right one (which does not).
 * Which side each pair uses is fixed by the weight and by the total parity, which must be the decoder's answer (`decodedFlip`). The weights of the arcs add up to the matching weight.
 */
export function matchingArcs(g: RepGraph, decoded: Decoded): ResolvedSpacetimeArc[] {
  const n = g.n
  const L = (c: number): number => c + 1
  const R = (c: number): number => n - 1 - c
  type Opt = { q: 0 | 1; arcs: ResolvedSpacetimeArc[] }
  const optionsOf = (a: number, b: number | 'boundary', w: number): Opt[] => {
    const da = g.detectors[a]
    if (b === 'boundary') {
      const o: Opt[] = []
      if (w === L(da.check)) o.push({ q: 1, arcs: [{ from: a, to: 'left', weight: w }] })
      if (w === R(da.check)) o.push({ q: 0, arcs: [{ from: a, to: 'right', weight: w }] })
      return o
    }
    const db = g.detectors[b]
    const o: Opt[] = []
    if (w === Math.abs(da.check - db.check) + Math.abs(da.t - db.t)) o.push({ q: 0, arcs: [{ from: a, to: b, weight: w }] })
    const via = (sa: 'left' | 'right', sb: 'left' | 'right'): Opt => ({
      q: ((sa === 'left' ? 1 : 0) ^ (sb === 'left' ? 1 : 0)) as 0 | 1,
      arcs: [
        { from: a, to: sa, weight: sa === 'left' ? L(da.check) : R(da.check) },
        { from: b, to: sb, weight: sb === 'left' ? L(db.check) : R(db.check) },
      ],
    })
    for (const [sa, sb] of [['left', 'left'], ['right', 'right'], ['left', 'right'], ['right', 'left']] as const) {
      const v = via(sa, sb)
      if (v.arcs[0].weight + v.arcs[1].weight === w) o.push(v)
    }
    return o
  }
  const all = decoded.pairs.map((p) => optionsOf(p.a, p.b === 'boundary' ? 'boundary' : p.b, p.weight))
  const pick: Opt[] = []
  const search = (k: number, parity: number): boolean => {
    if (k === all.length) return parity === decoded.decodedFlip
    for (const o of all[k]) {
      pick[k] = o
      if (search(k + 1, parity ^ o.q)) return true
    }
    return false
  }
  if (all.every((o) => o.length > 0) && search(0, 0)) return pick.flatMap((o) => o.arcs)
  // (unreachable for the engine's own matchings; kept so a drawing never throws) direct lines with the engine's weights
  return decoded.pairs.map((p) => ({ from: p.a, to: p.b === 'boundary' ? ('right' as const) : p.b, weight: p.weight }))
}

/* ------------------------------------------------ resolve ------------------------------------------------ */

const toFaults = (inp: SpacetimeInputs, g: RepGraph): RepFault[] => (inp.sample ? sampleHistory(g, inp.sample.p, inp.sample.q, inp.sample.seed) : (inp.faults ?? []).map((f) => ({ kind: f.kind, at: f.at, t: f.t })))

const MEMO = new Map<string, ResolvedSpacetime>()
const SPEC_MEMO = new Map<string, ResolvedSpacetimeSpectrum>()

function spectrumOf(g: RepGraph, maxW: number): ResolvedSpacetimeSpectrum {
  const key = `${g.n}:${g.rounds}:${maxW}`
  const hit = SPEC_MEMO.get(key)
  if (hit) return hit
  const sp = failureSpectrum(g, maxW)
  const out = { maxW, edges: sp.edges, rows: sp.rows.map((r) => ({ w: r.w, total: r.total, fail: r.fail, tie: r.tie, bad: r.bad })) }
  SPEC_MEMO.set(key, out)
  return out
}

/** Every derived field from the inputs (shared by resolve and interpolate), memoized by the inputs since a scroll re-resolves the same state every frame. */
export function spacetimeFrom(inp: SpacetimeInputs): ResolvedSpacetime {
  const key = JSON.stringify(inp)
  const hit = MEMO.get(key)
  if (hit) return hit
  const out = build(inp)
  if (MEMO.size > 48) MEMO.delete(MEMO.keys().next().value as string)
  MEMO.set(key, out)
  return out
}

function build(inp: SpacetimeInputs): ResolvedSpacetime {
  const g = repetitionGraph(inp.n, inp.rounds)
  const base = { kind: 'spacetime' as const, n: inp.n, rounds: inp.rounds, show: inp.show, cursor: inp.cursor, inputs: inp, shot: inp.shot }
  const detectors = g.detectors.map((d, index) => ({ index, check: d.check, t: d.t, lit: false }))
  if (inp.spectrum) {
    return {
      ...base,
      detectors,
      edges: g.edges.map((e) => ({ kind: e.kind, at: e.at, t: e.t, dets: e.dets, obs: e.obs, fault: false })),
      faults: [],
      lit: [],
      verdict: null,
      arcs: [],
      spectrum: spectrumOf(g, inp.spectrum.maxW),
      sample: null,
    }
  }
  const faults = toFaults(inp, g)
  const { lit, trueFlip } = historyOf(g, faults)
  const hasFault = new Set(faults.map((f) => edgeIndex(g, f)))
  for (const i of lit) detectors[i].lit = true
  let verdict: ResolvedSpacetime['verdict'] = null
  let arcs: ResolvedSpacetimeArc[] = []
  if ((inp.show.includes('matching') || inp.show.includes('verdict')) && lit.length <= MATCH_MAX_EVENTS) {
    const decoded = decodeHistory(g, lit)
    verdict = { trueFlip, decodedFlip: decoded.decodedFlip, tie: decoded.tie, failed: decoded.decodedFlip !== trueFlip, matchWeight: decoded.weight }
    arcs = matchingArcs(g, decoded)
  }
  return {
    ...base,
    detectors,
    edges: g.edges.map((e, i) => ({ kind: e.kind, at: e.at, t: e.t, dets: e.dets, obs: e.obs, fault: hasFault.has(i) })),
    faults: [...hasFault].sort((a, b) => a - b).map((i) => ({ kind: g.edges[i].kind, at: g.edges[i].at, t: g.edges[i].t })),
    lit,
    verdict,
    arcs,
    spectrum: null,
    sample: inp.sample ?? null,
  }
}

export function spacetimeInputs(st: SpacetimeState): SpacetimeInputs {
  const h = st.history
  return {
    n: h.n,
    rounds: h.rounds,
    faults: h.faults,
    sample: h.sample,
    show: st.show ?? [...DEFAULT_SHOW],
    cursor: st.cursor ?? h.rounds + 1,
    spectrum: st.spectrum,
    shot: st.shot,
  }
}

export function resolveSpacetimeStage(st: SpacetimeState, _s: number): ResolvedSpacetime {
  void _s
  return spacetimeFrom(spacetimeInputs(st))
}

/* ------------------------------------------------ interpolation ------------------------------------------------ */
export function interpSpacetimeStage(a: ResolvedSpacetime, b: ResolvedSpacetime, t: number): ResolvedSpacetime {
  if (t <= 0) return a
  if (t >= 1) return b
  const A = { ...a.inputs, cursor: 0 }
  const B = { ...b.inputs, cursor: 0 }
  if (JSON.stringify(A) === JSON.stringify(B)) return spacetimeFrom({ ...a.inputs, cursor: a.cursor + (b.cursor - a.cursor) * t })
  return t < 0.5 ? a : b
}

/* ------------------------------------------------ validation ------------------------------------------------ */
const isInt = (x: unknown): x is number => typeof x === 'number' && Number.isInteger(x)

export function validateSpacetimeStage(st: SpacetimeState): string[] {
  const errs: string[] = []
  const h = st.history
  if (!h || typeof h !== 'object') return ['spacetime history: { code: "rep", n, rounds }']
  if (h.code !== 'rep') errs.push(`spacetime history.code: only 'rep' (the repetition code) is drawn`)
  if (!isInt(h.n) || h.n < SPACETIME_LIMITS.nMin || h.n > SPACETIME_LIMITS.nMax) errs.push(`spacetime history.n: a whole number ${SPACETIME_LIMITS.nMin}–${SPACETIME_LIMITS.nMax} (data qubits)`)
  if (!isInt(h.rounds) || h.rounds < SPACETIME_LIMITS.roundsMin || h.rounds > SPACETIME_LIMITS.roundsMax) errs.push(`spacetime history.rounds: a whole number ${SPACETIME_LIMITS.roundsMin}–${SPACETIME_LIMITS.roundsMax}`)
  if (errs.length) return errs
  const { n, rounds } = h
  if (h.faults !== undefined && h.sample !== undefined) errs.push('spacetime history: faults or sample, not both')
  if (h.faults !== undefined) {
    if (!Array.isArray(h.faults) || h.faults.length > SPACETIME_LIMITS.faultsMax) errs.push(`spacetime history.faults: a list of at most ${SPACETIME_LIMITS.faultsMax} faults`)
    else {
      const seen = new Set<string>()
      h.faults.forEach((f, i) => {
        const where = `spacetime history.faults[${i}]`
        if (!f || (f.kind !== 'data' && f.kind !== 'meas')) return void errs.push(`${where}.kind: 'data' or 'meas'`)
        const top = f.kind === 'data' ? n - 1 : n - 2
        if (!isInt(f.at) || f.at < 0 || f.at > top) errs.push(`${where}.at: ${f.kind === 'data' ? 'a data qubit' : 'a check'} from 0 to ${top} (n = ${n})`)
        if (!isInt(f.t) || f.t < 1 || f.t > rounds) errs.push(`${where}.t: a round from 1 to ${rounds}`)
        const key = `${f.kind}:${f.at}:${f.t}`
        if (seen.has(key)) errs.push(`${where}: the same fault place twice (a fault at one place is on or off)`)
        seen.add(key)
      })
    }
  }
  if (h.sample !== undefined) {
    const s = h.sample
    if (!s || typeof s !== 'object' || !(typeof s.p === 'number' && s.p >= 0 && s.p <= 1) || !(typeof s.q === 'number' && s.q >= 0 && s.q <= 1) || !isInt(s.seed)) errs.push('spacetime history.sample: { p, q, seed } with p and q chances from 0 to 1 and a whole seed')
  }
  if (st.show !== undefined) {
    if (!Array.isArray(st.show) || !st.show.every((x) => (SPACETIME_SHOW as readonly string[]).includes(x))) errs.push(`spacetime show: a list of ${SPACETIME_SHOW.map((v) => `'${v}'`).join(', ')}`)
    else if (new Set(st.show).size !== st.show.length) errs.push('spacetime show: each name once')
  }
  if (st.cursor !== undefined && (!isInt(st.cursor) || st.cursor < 0 || st.cursor > rounds + 1)) errs.push(`spacetime cursor: a whole number 0–${rounds + 1}`)
  if (st.spectrum !== undefined) {
    const maxW = st.spectrum?.maxW
    const edges = rounds * (2 * n - 1)
    if (!isInt(maxW) || maxW < 1 || maxW > SPACETIME_LIMITS.maxW) errs.push(`spacetime spectrum.maxW: a whole number 1–${SPACETIME_LIMITS.maxW}`)
    else if (maxW === 3 && edges > SPECTRUM_LIMITS.maxEdgesForW3) errs.push(`spacetime spectrum: weight 3 counts every set of 3 of the ${edges} fault places of this history; at most ${SPECTRUM_LIMITS.maxEdgesForW3} (use fewer rounds or qubits)`)
    else if (maxW === 4 && edges > SPECTRUM_LIMITS.maxEdgesForW4) errs.push(`spacetime spectrum: weight 4 counts every set of 4 of the ${edges} fault places of this history; at most ${SPECTRUM_LIMITS.maxEdgesForW4} (use fewer rounds or qubits)`)
    if (h.faults !== undefined || h.sample !== undefined) errs.push('spacetime spectrum: draws no history, so history.faults and history.sample must be absent')
    if (st.show !== undefined) errs.push('spacetime spectrum: draws no history, so show must be absent')
    if (st.cursor !== undefined) errs.push('spacetime spectrum: draws no history, so cursor must be absent')
  }
  if (errs.length) return errs
  // a history that cannot be matched exactly
  const show = st.show ?? [...DEFAULT_SHOW]
  if (st.spectrum === undefined && (show.includes('matching') || show.includes('verdict'))) {
    const g = repetitionGraph(n, rounds)
    const faults = h.sample ? sampleHistory(g, h.sample.p, h.sample.q, h.sample.seed) : (h.faults ?? [])
    const lit = historyOf(g, faults).lit.length
    if (lit > MATCH_MAX_EVENTS) errs.push(`spacetime show: ${show.includes('matching') ? "'matching'" : "'verdict'"} needs at most ${MATCH_MAX_EVENTS} lit detectors; this history lights ${lit} (use fewer faults or a smaller sample)`)
  }
  return errs
}

/* ------------------------------------------------ readouts ------------------------------------------------ */
export const flipWord = (b: 0 | 1): string => (b ? 'flipped' : 'not flipped')

/** The verdict as two short pieces of text (the scene writes them on one line when it has the room). */
export function verdictText(r: ResolvedSpacetime): { qubit: string; decoder: string } | null {
  const v = r.verdict
  if (!v) return null
  return {
    qubit: `logical qubit: ${flipWord(v.trueFlip)}`,
    decoder: v.tie ? 'decoder: tie' : `decoder: ${v.failed ? 'wrong' : 'right'}`,
  }
}

export function spacetimeReadouts(r: ResolvedSpacetime): SvgReadout[] {
  const out: SvgReadout[] = []
  if (r.spectrum) {
    const s = r.spectrum
    out.push({ name: 'places', text: `${s.edges} fault places` })
    for (const row of s.rows) out.push({ name: `w${row.w}`, text: `w = ${row.w}: ${row.fail} fail, ${row.tie} tie`, tone: row.bad ? 'minus' : 'plus' })
    const first = s.rows.find((x) => x.bad > 0)
    out.push({ name: 'first', text: first ? `first bad weight: ${first.w}` : `none bad up to w = ${s.maxW}`, tone: 'state' })
    return out
  }
  out.push({ name: 'lit', text: `lit events: ${r.lit.length}`, tone: 'minus' })
  if (r.sample) out.push({ name: 'faults', text: `seed ${r.sample.seed}: ${r.faults.length} fault${r.faults.length === 1 ? '' : 's'}`, tone: 'op' })
  else if (r.faults.length) out.push({ name: 'faults', text: `${r.faults.length} fault${r.faults.length === 1 ? '' : 's'} (${r.faults.filter((f) => f.kind === 'data').length} data)`, tone: 'op' })
  if (r.verdict) {
    out.push({ name: 'matching', text: `matching weight: ${r.verdict.matchWeight}`, tone: 'plus' })
    if (r.show.includes('verdict')) {
      const t = verdictText(r)!
      out.push({ name: 'qubit', text: t.qubit, tone: 'state' })
      out.push({ name: 'decoder', text: t.decoder, tone: r.verdict.tie ? 'silver' : r.verdict.failed ? 'minus' : 'plus' })
    }
  }
  return out
}

/** The accessible text of a picture: its readouts joined. */
export const spacetimeSummary = (r: ResolvedSpacetime): string => `repetition code, ${r.n} qubits, ${r.rounds} rounds; ${spacetimeReadouts(r).map((x) => x.text).join('; ')}`
