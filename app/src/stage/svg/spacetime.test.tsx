/**
 * `spacetime` (P-B1-story §9.2 K-ST): the detector history of the repetition code. Content writes inputs only (n, rounds, faults or a seed, what to show, a cursor, a spectrum);
 * the resolver takes every lit detector, matching arc, weight, verdict and failure count from physics/qec/spacetime.ts. These tests check the resolved picture against the engine
 * (and against a hand reading of small histories), that the drawn matching adds up to the engine's weight and ends on the side that gives the engine's answer, the failure spectrum
 * against the engine's own counts and a few facts that hold by construction, interpolation, every validation limit with a message that names the field, the readout text, the
 * passport / drawer / vocabulary, and that the one scene draws with no NaN in both modes and packs inside the box (down to a 375 px phone) clear of the text lines.
 */
import { renderToString } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { fidelityOf } from '../../content/fidelity'
import type { SpacetimeState } from '../../content/stage'
import { KIND_RENDER, PASSPORT, SPACETIME_SHOW, STAGE_KINDS_709, passportOf } from '../../content/stage'
import { ANCHORS, SHOTS } from '../../content/stageVocab'
import { MATCH_MAX_EVENTS, SPECTRUM_LIMITS, decodeHistory, detectorIndex, failureSpectrum, historyOf, repetitionGraph, runHistory, sampleHistory } from '../../physics/qec/spacetime'
import { FigureFor, FIGURE_KINDS } from '../figures/FigureFor'
import { interpolate } from '../interp'
import { resolve, validateLayout, validateStage } from '../resolve'
import { svgKindDef } from '../svgKinds'
import type { ResolvedSpacetime } from '../types'
import { packLines } from './CodeScene'
import { SpacetimeScene, barLength, spacetimeGeometry, spectrumGeometry } from './SpacetimeScene'
import { SPACETIME_LIMITS, matchingArcs, spacetimeReadouts, validateSpacetimeStage, verdictText } from './spacetime'
import './kinds'

const S = (st: Omit<SpacetimeState, 'kind'>): SpacetimeState => ({ kind: 'spacetime', ...st })
const R = (st: Omit<SpacetimeState, 'kind'>, s = 1) => resolve(S(st), s) as ResolvedSpacetime
const texts = (r: ResolvedSpacetime) => spacetimeReadouts(r).map((x) => x.text)
const bad = (st: Omit<SpacetimeState, 'kind'>) => validateSpacetimeStage(S(st))
type Mode = 'stage' | 'print'
const draw = (r: ResolvedSpacetime, mode: Mode, w: number, h: number, bare = false, slot: 'full' | 'top' | 'bottom' = 'full') =>
  renderToString(
    <svg viewBox={`0 0 ${w} ${h}`}>
      <SpacetimeScene state={r} mode={mode} width={w} height={h} bare={bare} slot={slot} />
    </svg>,
  )

describe('spacetime: the SVG route, the passport, the drawer and the vocabulary', () => {
  it('is an SVG kind registered by the lazy module, with the plan’s passport, drawer, shot and anchors', () => {
    expect(KIND_RENDER.spacetime).toBe('svg')
    expect(STAGE_KINDS_709).toContain('spacetime')
    expect(FIGURE_KINDS).toContain('spacetime')
    expect(svgKindDef('spacetime')).toBeDefined()
    expect(PASSPORT.spacetime).toMatchObject({ title: 'SPACE-TIME · detector history', fidelityKey: 'spacetime' })
    expect(PASSPORT.spacetime.note).toBe('not a place · the repetition code; a surface code has two space dimensions')
    expect(passportOf(S({ history: { code: 'rep', n: 3, rounds: 1 } }))).toBe(PASSPORT.spacetime)
    const f = fidelityOf('spacetime')
    for (const list of Object.values(f)) expect(list.length).toBeGreaterThan(0)
    expect(f.exact.map((i) => i.id)).toEqual(['qc-spacetime-engine'])
    expect(f.schematic.map((i) => i.id)).toEqual(['qc-spacetime-layout'])
    expect(f.misleading.map((i) => i.id)).toEqual(['qc-spacetime-repetition-only'])
    expect(SHOTS.spacetime).toEqual(['ST-HISTORY', 'ST-READOUT'])
    expect(ANCHORS.spacetime).toEqual(['detector', 'fault', 'edge', 'matching', 'boundary', 'verdict', 'bar', 'reading', 'product', 'vote'])
    expect(svgKindDef('spacetime')!.print).toEqual({ w: 320, h: 300 })
    expect([...SPACETIME_SHOW]).toEqual(['faults', 'detectors', 'matching', 'verdict'])
  })
  it('resolve / validateStage reach it like any kind; an unknown shot is caught by the shared check; a split with another kind validates', () => {
    const st = S({ history: { code: 'rep', n: 5, rounds: 2 }, shot: 'ST-HISTORY' })
    expect((resolve(st, 1) as ResolvedSpacetime).detectors).toHaveLength(4 * 3)
    expect(validateStage(st)).toEqual([])
    expect(validateStage({ ...st, shot: 'X-NOPE' as never })).toEqual(['spacetime: unknown shot "X-NOPE"'])
    expect(validateLayout({ layout: 'split', top: st, bottom: { kind: 'plot', curve: { fn: 'identityP' } } })).toEqual([])
    expect(validateLayout({ layout: 'split', top: st, bottom: st })).toEqual(['layout repeats a kind: spacetime + spacetime'])
  })
})

describe('spacetime: the picture is the engine’s', () => {
  it('a data fault on qubit 2 of five, in round 2, lights the two checks beside it in round 2 (and nothing flips the logical bit)', () => {
    const r = R({ history: { code: 'rep', n: 5, rounds: 3, faults: [{ kind: 'data', at: 2, t: 2 }] }, show: ['faults', 'detectors', 'matching', 'verdict'] })
    expect(r.lit).toEqual([detectorIndex(5, 1, 2), detectorIndex(5, 2, 2)])
    expect(r.detectors.filter((d) => d.lit).map((d) => [d.check, d.t])).toEqual([[1, 2], [2, 2]])
    expect(r.verdict).toEqual({ trueFlip: 0, decodedFlip: 0, tie: false, failed: false, matchWeight: 1 })
    expect(r.arcs).toEqual([{ from: detectorIndex(5, 1, 2), to: detectorIndex(5, 2, 2), weight: 1 }])
    expect(r.edges.filter((e) => e.fault).map((e) => [e.kind, e.at, e.t])).toEqual([['data', 2, 2]])
  })
  it('a readout fault lights the same check in two consecutive rounds; qubit 0 flips the logical bit and lights one detector', () => {
    const meas = R({ history: { code: 'rep', n: 4, rounds: 3, faults: [{ kind: 'meas', at: 1, t: 2 }] }, show: ['matching', 'verdict'] })
    expect(meas.lit).toEqual([detectorIndex(4, 1, 2), detectorIndex(4, 1, 3)])
    expect(meas.verdict).toMatchObject({ trueFlip: 0, failed: false, matchWeight: 1 })
    const edge = R({ history: { code: 'rep', n: 4, rounds: 3, faults: [{ kind: 'data', at: 0, t: 1 }] }, show: ['matching', 'verdict'] })
    expect(edge.lit).toEqual([detectorIndex(4, 0, 1)])
    expect(edge.verdict).toMatchObject({ trueFlip: 1, decodedFlip: 1, failed: false, matchWeight: 1 })
    // the one lit detector pairs with the LEFT boundary, the side that flips the logical bit
    expect(edge.arcs).toEqual([{ from: detectorIndex(4, 0, 1), to: 'left', weight: 1 }])
    const right = R({ history: { code: 'rep', n: 4, rounds: 3, faults: [{ kind: 'data', at: 3, t: 1 }] }, show: ['matching', 'verdict'] })
    expect(right.arcs).toEqual([{ from: detectorIndex(4, 2, 1), to: 'right', weight: 1 }])
    expect(right.verdict).toMatchObject({ trueFlip: 0, failed: false })
  })
  it('three data faults across a distance-3 chain in one round fool the decoder (weight 3 = the distance): it corrects the wrong side and the logical qubit flips', () => {
    const r = R({ history: { code: 'rep', n: 3, rounds: 1, faults: [{ kind: 'data', at: 0, t: 1 }, { kind: 'data', at: 1, t: 1 }] }, show: ['verdict', 'matching'] })
    // faults on qubits 0 and 1 (weight 2 of 3): the decoder explains the pattern with the single fault on qubit 2 and gets the wrong logical bit
    expect(r.verdict).toMatchObject({ trueFlip: 1, decodedFlip: 0, failed: true })
    expect(texts(r)).toContain('logical qubit: flipped')
    expect(texts(r)).toContain('decoder: wrong')
  })
  it('agrees with the engine on every sampled history of every shape (lit detectors, trueFlip, decoded flip, weight) and the drawn arcs add up to the engine’s weight', () => {
    let checked = 0
    for (const n of [3, 4, 5, 6, 7, 9])
      for (const rounds of [1, 2, 3, 5, 6])
        for (let seed = 1; seed <= 6; seed++) {
          const g = repetitionGraph(n, rounds)
          const faults = sampleHistory(g, 0.04, 0.03, seed * 17 + n)
          const lit = historyOf(g, faults).lit
          if (lit.length > MATCH_MAX_EVENTS) continue
          const r = R({ history: { code: 'rep', n, rounds, sample: { p: 0.04, q: 0.03, seed: seed * 17 + n } }, show: ['faults', 'detectors', 'matching', 'verdict'] })
          const want = runHistory(g, faults)
          const where = `n = ${n}, ${rounds} rounds, seed ${seed}`
          expect(r.lit, where).toEqual(want.lit)
          expect(r.verdict, where).toEqual({ trueFlip: want.trueFlip, decodedFlip: want.decoded.decodedFlip, tie: want.decoded.tie, failed: want.failed, matchWeight: want.decoded.weight })
          expect(r.arcs.reduce((s, a) => s + a.weight, 0), where).toBe(want.decoded.weight)
          // an arc that ends on the left boundary is a path that flips the logical bit: their parity is the decoder's answer
          expect(r.arcs.filter((a) => a.to === 'left').length % 2, where).toBe(want.decoded.decodedFlip)
          // every arc starts at a lit detector and every lit detector is on exactly one arc end
          for (const a of r.arcs) expect(lit, where).toContain(a.from)
          const ends = r.arcs.flatMap((a) => [a.from, ...(typeof a.to === 'number' ? [a.to] : [])])
          expect([...ends].sort((x, y) => x - y), where).toEqual([...lit].sort((x, y) => x - y))
          checked++
        }
    expect(checked).toBeGreaterThan(80)
  })
  it('matchingArcs routes a pair that goes round through the boundary as two arcs (an even n makes the two sides a tie)', () => {
    // n = 4: detectors at check 0 and check 2 in the same round: direct 2; via the left boundary 1 + 3; via both ends 1 + 1 (left of one, right of the other) = 2 with the opposite parity
    const g = repetitionGraph(4, 1)
    const lit = [detectorIndex(4, 0, 1), detectorIndex(4, 2, 1)]
    const dec = decodeHistory(g, lit)
    const arcs = matchingArcs(g, dec)
    expect(arcs.reduce((s, a) => s + a.weight, 0)).toBe(dec.weight)
    expect(arcs.filter((a) => a.to === 'left').length % 2).toBe(dec.decodedFlip)
  })
  it('the cursor only dims later rounds: nothing else about the picture changes', () => {
    const base = { history: { code: 'rep' as const, n: 5, rounds: 4, faults: [{ kind: 'data' as const, at: 1, t: 3 }] } }
    const a = R({ ...base })
    const b = R({ ...base, cursor: 2 })
    expect(a.cursor).toBe(5)
    expect(b.cursor).toBe(2)
    expect(b.lit).toEqual(a.lit)
    const html = draw(b, 'stage', 506, 640)
    expect(html).toContain('opacity="0.3"')
    expect(draw(a, 'stage', 506, 640)).not.toContain('opacity="0.3"')
  })
  it('a repeated fault place cancels in the engine, and a sample is deterministic in its seed', () => {
    const g = repetitionGraph(5, 3)
    expect(historyOf(g, [{ kind: 'data', at: 1, t: 2 }, { kind: 'data', at: 1, t: 2 }]).lit).toEqual([])
    const one = R({ history: { code: 'rep', n: 5, rounds: 3, sample: { p: 0.1, q: 0.1, seed: 4 } } })
    const two = R({ history: { code: 'rep', n: 5, rounds: 3, sample: { p: 0.1, q: 0.1, seed: 4 } } })
    expect(two.faults).toEqual(one.faults)
    expect(one.faults).toEqual(sampleHistory(g, 0.1, 0.1, 4).map((f) => ({ kind: f.kind, at: f.at, t: f.t })).sort((x, y) => (x.kind === y.kind ? x.t - y.t || x.at - y.at : x.kind === 'data' ? -1 : 1)))
  })
})

describe('spacetime: the failure spectrum is the engine’s count over every fault set', () => {
  it('draws no history; each weight has the engine’s total, fail and tie', () => {
    for (const [n, rounds, maxW] of [[3, 1, 3], [3, 2, 3], [4, 1, 4], [5, 1, 2], [5, 2, 2], [7, 3, 2]] as const) {
      const r = R({ history: { code: 'rep', n, rounds }, spectrum: { maxW } })
      const want = failureSpectrum(repetitionGraph(n, rounds), maxW)
      expect(r.spectrum!.edges).toBe(want.edges)
      expect(r.spectrum!.rows).toEqual(want.rows.map((x) => ({ w: x.w, total: x.total, fail: x.fail, tie: x.tie, bad: x.bad })))
      expect(r.lit).toEqual([])
      expect(r.faults).toEqual([])
      expect(r.verdict).toBeNull()
    }
  })
  it('facts that hold by construction: a lone fault is always corrected, the totals are binomial, and a distance-5 chain survives any two faults', () => {
    const c = (n: number, k: number): number => (k === 0 ? 1 : (c(n - 1, k - 1) * n) / k)
    for (const [n, rounds] of [[3, 1], [5, 2], [7, 2]] as const) {
      const rows = R({ history: { code: 'rep', n, rounds }, spectrum: { maxW: 2 } }).spectrum!.rows
      const E = rounds * (2 * n - 1)
      expect(rows[0].bad).toBe(0)
      expect(rows.map((x) => x.total)).toEqual([c(E, 1), c(E, 2)])
    }
    expect(R({ history: { code: 'rep', n: 5, rounds: 2 }, spectrum: { maxW: 2 } }).spectrum!.rows[1].bad).toBe(0)
    // n = 3 is only distance 3 in space: some pairs of faults fool it
    expect(R({ history: { code: 'rep', n: 3, rounds: 1 }, spectrum: { maxW: 2 } }).spectrum!.rows[1].fail).toBeGreaterThan(0)
  })
  it('readouts name the places, each weight’s failures, and the first weight with a bad set', () => {
    expect(texts(R({ history: { code: 'rep', n: 3, rounds: 1 }, spectrum: { maxW: 2 } }))).toEqual(['5 fault places', 'w = 1: 0 fail, 0 tie', 'w = 2: 3 fail, 0 tie', 'first bad weight: 2'])
    expect(texts(R({ history: { code: 'rep', n: 5, rounds: 1 }, spectrum: { maxW: 2 } })).at(-1)).toBe('none bad up to w = 2')
  })
})

describe('spacetime: interpolation', () => {
  const base = { history: { code: 'rep' as const, n: 5, rounds: 4, faults: [{ kind: 'data' as const, at: 1, t: 3 }] }, show: ['faults' as const, 'detectors' as const] }
  it('the same history slides its cursor; a different history switches at the half-way point', () => {
    const a = R({ ...base, cursor: 1 })
    const b = R({ ...base, cursor: 5 })
    expect(interpolate(a, b, 0)).toBe(a)
    expect(interpolate(a, b, 1)).toBe(b)
    expect((interpolate(a, b, 0.5) as ResolvedSpacetime).cursor).toBe(3)
    const other = R({ history: { code: 'rep', n: 5, rounds: 4, faults: [{ kind: 'data', at: 2, t: 3 }] }, cursor: 5 })
    expect(interpolate(a, other, 0.4)).toBe(a)
    expect(interpolate(a, other, 0.6)).toBe(other)
  })
})

describe('spacetime: validation — every limit, with a message that names the field', () => {
  const ok = { code: 'rep' as const, n: 5, rounds: 3 }
  it('accepts a good history and the limits themselves', () => {
    expect(bad({ history: ok })).toEqual([])
    expect(bad({ history: { code: 'rep', n: 3, rounds: 1 } })).toEqual([])
    expect(bad({ history: { code: 'rep', n: 9, rounds: 6, faults: Array.from({ length: 12 }, (_, i) => ({ kind: 'data' as const, at: i % 9, t: 1 + Math.floor(i / 9) })) }, show: ['faults', 'detectors'] })).toEqual([])
  })
  it('n and rounds', () => {
    expect(bad({ history: { ...ok, n: 2 } })).toEqual(['spacetime history.n: a whole number 3–9 (data qubits)'])
    expect(bad({ history: { ...ok, n: 10 } })[0]).toMatch(/^spacetime history\.n/)
    expect(bad({ history: { ...ok, n: 4.5 } })[0]).toMatch(/^spacetime history\.n/)
    expect(bad({ history: { ...ok, rounds: 0 } })).toEqual(['spacetime history.rounds: a whole number 1–6'])
    expect(bad({ history: { ...ok, rounds: 7 } })[0]).toMatch(/^spacetime history\.rounds/)
    expect(bad({ history: { ...ok, code: 'surface' as never } })[0]).toMatch(/^spacetime history\.code/)
  })
  it('faults: at most 12, indices in range, each place once, not together with a sample', () => {
    const many = Array.from({ length: 13 }, (_, i) => ({ kind: 'meas' as const, at: i % 4, t: 1 + Math.floor(i / 4) }))
    expect(bad({ history: { ...ok, faults: many } })[0]).toMatch(/^spacetime history\.faults: a list of at most 12 faults/)
    expect(bad({ history: { ...ok, faults: [{ kind: 'data', at: 5, t: 1 }] } })).toEqual(['spacetime history.faults[0].at: a data qubit from 0 to 4 (n = 5)'])
    expect(bad({ history: { ...ok, faults: [{ kind: 'meas', at: 4, t: 1 }] } })).toEqual(['spacetime history.faults[0].at: a check from 0 to 3 (n = 5)'])
    expect(bad({ history: { ...ok, faults: [{ kind: 'data', at: 1, t: 4 }] } })).toEqual(['spacetime history.faults[0].t: a round from 1 to 3'])
    expect(bad({ history: { ...ok, faults: [{ kind: 'data', at: 1, t: 0 }] } })[0]).toMatch(/faults\[0\]\.t/)
    expect(bad({ history: { ...ok, faults: [{ kind: 'x' as never, at: 1, t: 1 }] } })).toEqual([`spacetime history.faults[0].kind: 'data' or 'meas'`])
    expect(bad({ history: { ...ok, faults: [{ kind: 'data', at: 1, t: 1 }, { kind: 'data', at: 1, t: 1 }] } })[0]).toMatch(/faults\[1\]: the same fault place twice/)
    expect(bad({ history: { ...ok, faults: [], sample: { p: 0.1, q: 0.1, seed: 1 } } })).toEqual(['spacetime history: faults or sample, not both'])
  })
  it('sample, show and cursor', () => {
    expect(bad({ history: { ...ok, sample: { p: 1.5, q: 0, seed: 1 } } })[0]).toMatch(/^spacetime history\.sample/)
    expect(bad({ history: { ...ok, sample: { p: 0.1, q: 0.1, seed: 1.5 } } })[0]).toMatch(/^spacetime history\.sample/)
    expect(bad({ history: ok, show: ['faults', 'nope' as never] })[0]).toMatch(/^spacetime show: a list of 'faults', 'detectors', 'matching', 'verdict'/)
    expect(bad({ history: ok, show: ['faults', 'faults'] })).toEqual(['spacetime show: each name once'])
    expect(bad({ history: ok, cursor: 5 })).toEqual(['spacetime cursor: a whole number 0–4'])
    expect(bad({ history: ok, cursor: 1.5 })[0]).toMatch(/^spacetime cursor/)
    expect(bad({ history: ok, cursor: 4 })).toEqual([])
  })
  it('matching and the verdict need at most 14 lit detectors', () => {
    const dense = { code: 'rep' as const, n: 9, rounds: 6, sample: { p: 0.3, q: 0.3, seed: 2 } }
    expect(historyOf(repetitionGraph(9, 6), sampleHistory(repetitionGraph(9, 6), 0.3, 0.3, 2)).lit.length).toBeGreaterThan(MATCH_MAX_EVENTS)
    expect(bad({ history: dense, show: ['faults', 'detectors', 'matching'] })[0]).toMatch(/^spacetime show: 'matching' needs at most 14 lit detectors; this history lights \d+/)
    expect(bad({ history: dense, show: ['verdict'] })[0]).toMatch(/^spacetime show: 'verdict' needs at most 14/)
    expect(bad({ history: dense, show: ['faults', 'detectors'] })).toEqual([])
    expect(SPACETIME_LIMITS.matchEvents).toBe(MATCH_MAX_EVENTS)
  })
  it('spectrum: weight 1–4, weight 3 needs at most 45 fault places and weight 4 at most 15, and no history fields', () => {
    expect(bad({ history: { code: 'rep', n: 3, rounds: 1 }, spectrum: { maxW: 4 } })).toEqual([])
    expect(bad({ history: { code: 'rep', n: 9, rounds: 6 }, spectrum: { maxW: 2 } })).toEqual([])
    expect(bad({ history: { code: 'rep', n: 3, rounds: 1 }, spectrum: { maxW: 5 } })).toEqual(['spacetime spectrum.maxW: a whole number 1–4'])
    expect(bad({ history: { code: 'rep', n: 3, rounds: 1 }, spectrum: { maxW: 0 } })[0]).toMatch(/^spacetime spectrum\.maxW/)
    // 5 qubits × 3 rounds = 27 places: weight 3 fine, weight 4 too many; 9 × 6 = 102 places: weight 3 too many
    expect(bad({ history: { code: 'rep', n: 5, rounds: 3 }, spectrum: { maxW: 3 } })).toEqual([])
    expect(bad({ history: { code: 'rep', n: 5, rounds: 3 }, spectrum: { maxW: 4 } })[0]).toMatch(/^spacetime spectrum: weight 4 counts every set of 4 of the 27 fault places.*at most 15/)
    expect(bad({ history: { code: 'rep', n: 9, rounds: 6 }, spectrum: { maxW: 3 } })[0]).toMatch(/^spacetime spectrum: weight 3 counts every set of 3 of the 102 fault places.*at most 45/)
    expect(SPECTRUM_LIMITS).toMatchObject({ maxEdgesForW3: 45, maxEdgesForW4: 15 })
    const h = { code: 'rep' as const, n: 3, rounds: 1 }
    expect(bad({ history: { ...h, faults: [{ kind: 'data', at: 0, t: 1 }] }, spectrum: { maxW: 2 } })).toEqual(['spacetime spectrum: draws no history, so history.faults and history.sample must be absent'])
    expect(bad({ history: { ...h, sample: { p: 0.1, q: 0.1, seed: 1 } }, spectrum: { maxW: 2 } })[0]).toMatch(/history\.faults and history\.sample must be absent/)
    expect(bad({ history: h, show: ['faults'], spectrum: { maxW: 2 } })).toEqual(['spacetime spectrum: draws no history, so show must be absent'])
    expect(bad({ history: h, cursor: 1, spectrum: { maxW: 2 } })).toEqual(['spacetime spectrum: draws no history, so cursor must be absent'])
  })
})

describe('spacetime: readouts', () => {
  it('lit events, the faults, the matching weight and the verdict, as short lines', () => {
    const r = R({ history: { code: 'rep', n: 5, rounds: 3, faults: [{ kind: 'data', at: 2, t: 2 }, { kind: 'meas', at: 0, t: 1 }] }, show: ['faults', 'detectors', 'matching', 'verdict'] })
    expect(texts(r)).toEqual(['lit events: 4', '2 faults (1 data)', 'matching weight: 2', 'logical qubit: not flipped', 'decoder: right'])
    for (const t of texts(r)) expect(t.length).toBeLessThanOrEqual(28)
    expect(texts(R({ history: { code: 'rep', n: 5, rounds: 3, sample: { p: 0.02, q: 0.02, seed: 9 } } }))[0]).toMatch(/^lit events: \d+$/)
    expect(texts(R({ history: { code: 'rep', n: 5, rounds: 3 } }))).toEqual(['lit events: 0'])
  })
  it('says tie when the lightest explanations disagree', () => {
    // two faults, on qubits 0 and 3 of four, light one detector each (checks 0 and 2): pairing them directly (weight 2) or each with its own boundary (1 + 1) costs the same
    // and the two explanations disagree about the logical bit
    const two = R({ history: { code: 'rep', n: 4, rounds: 1, faults: [{ kind: 'data', at: 0, t: 1 }, { kind: 'data', at: 3, t: 1 }] }, show: ['matching', 'verdict'] })
    expect(two.lit).toHaveLength(2)
    expect(two.verdict!.tie).toBe(true)
    expect(verdictText(two)!.decoder).toBe('decoder: tie')
    expect(texts(two)).toContain('decoder: tie')
  })
})

describe('spacetime: the one scene', () => {
  const BOXES: [Mode, number, number, boolean, 'full' | 'top' | 'bottom'][] = [
    ['stage', 506, 785, false, 'full'],
    ['stage', 375, 640, false, 'full'],
    ['stage', 700, 560, false, 'full'],
    ['stage', 506, 360, false, 'top'],
    ['stage', 320, 300, true, 'full'],
    ['print', 320, 300, false, 'full'],
  ]
  const STATES: Omit<SpacetimeState, 'kind'>[] = [
    { history: { code: 'rep', n: 3, rounds: 1 } },
    { history: { code: 'rep', n: 5, rounds: 3, faults: [{ kind: 'data', at: 2, t: 2 }, { kind: 'meas', at: 0, t: 1 }] }, show: ['faults', 'detectors', 'matching', 'verdict'] },
    { history: { code: 'rep', n: 9, rounds: 6, sample: { p: 0.02, q: 0.01, seed: 11 } }, show: ['faults', 'detectors'] },
    { history: { code: 'rep', n: 7, rounds: 4, faults: [{ kind: 'data', at: 0, t: 1 }, { kind: 'data', at: 6, t: 4 }] }, show: ['faults', 'detectors', 'matching', 'verdict'], cursor: 2 },
    { history: { code: 'rep', n: 3, rounds: 2 }, spectrum: { maxW: 3 } },
    { history: { code: 'rep', n: 9, rounds: 6 }, spectrum: { maxW: 2 } },
  ]
  it('draws every state in every box with no NaN, with its anchors and one named mark for each lit detector and fault', () => {
    for (const st of STATES)
      for (const [mode, w, h, bare, slot] of BOXES) {
        const r = R(st)
        const html = draw(r, mode, w, h, bare, slot)
        const where = `${JSON.stringify(st.history)} ${mode} ${w}x${h} ${slot}`
        expect(html, where).not.toMatch(/NaN|Infinity|undefined/)
        expect(html).toContain('data-kind="spacetime"')
        if (r.spectrum) {
          expect(html.match(/data-bar="/g)?.length, where).toBe(3 * r.spectrum.maxW)
          expect(html).toContain('data-anchor="bar"')
          continue
        }
        expect(html).toContain('data-anchor="boundary"')
        expect(html).toContain('data-anchor="edge"')
        expect(html.match(/data-lit="1"/g)?.length ?? 0, where).toBe(r.show.includes('detectors') ? r.lit.length : 0)
        expect(html.match(/data-fault="(data|meas)"/g)?.length ?? 0, where).toBe(r.show.includes('faults') ? r.faults.length : 0)
        expect(html.match(/data-arc="/g)?.length ?? 0, where).toBe(r.show.includes('matching') ? r.arcs.length : 0)
        if (r.show.includes('verdict')) expect(html).toContain('data-anchor="verdict"')
        if (r.show.includes('matching') && r.arcs.length) expect(html).toContain('data-anchor="matching"')
      }
  })
  it('data faults are orchid, readout faults amber, lit detectors cobalt, the matching dashed white', () => {
    const html = draw(R(STATES[1]), 'stage', 506, 785)
    expect(html).toMatch(/data-fault="data"[^>]*><title>[^<]*<\/title><line[^>]*class="fg-op"/)
    expect(html).toMatch(/data-fault="meas"[^>]*><title>[^<]*<\/title><line[^>]*class="fg-plus"/)
    expect(html).toContain('class="fg-minus-fill"')
    expect(html).toMatch(/class="fg-state"[^>]*stroke-dasharray="5 3"/)
  })
  it('a lit detector and a fault carry accessible names', () => {
    const html = draw(R(STATES[1]), 'stage', 506, 785)
    expect(html).toContain('lit detector: check 1, round 2')
    expect(html).toContain('data fault: qubit 2, round 2')
    expect(html).toContain('readout fault: check 0, round 1')
    expect(html).toContain('left boundary: a path of faults that ends here flips the logical qubit')
  })
  it('packing: every node and label sits inside the box, nodes are clear of one another and of the text lines, in every box down to 375 px', () => {
    for (const st of STATES.filter((s) => !s.spectrum))
      for (const [mode, w, h, bare, slot] of BOXES) {
        const r = R(st)
        const g = spacetimeGeometry(r, w, h, mode === 'print' || bare, slot)
        const where = `${JSON.stringify(st.history)} ${mode} ${w}x${h} ${slot}`
        const pts = r.detectors.map((d) => ({ x: g.colX(d.check + 1), y: g.rowY(d.t) }))
        for (const p of pts) {
          expect(p.x - g.disc, `${where} left`).toBeGreaterThanOrEqual(g.area.x)
          expect(p.x + g.disc, `${where} right`).toBeLessThanOrEqual(w)
          expect(p.y - g.disc, `${where} top`).toBeGreaterThanOrEqual(g.area.y)
          expect(p.y + g.disc, `${where} bottom`).toBeLessThanOrEqual(g.area.y + g.area.h)
        }
        // the boundary columns, and the round labels at the left of the first column, fit
        expect(g.colX(0) - 10 - 7 * 6.2, `${where} labels`).toBeGreaterThanOrEqual(g.area.x - 2)
        expect(g.colX(r.n) + 30, `${where} right boundary`).toBeLessThanOrEqual(w + 30)
        // neighbouring nodes (a lit disc is the biggest mark) never touch
        expect(Math.min(g.dx, g.dy) - 2 * g.disc, `${where}: discs touch`).toBeGreaterThan(1)
        // the figure's text lines sit above the drawing, and the live stage leaves the readout column its room
        if (g.lines.length) expect(6 + 13 * g.lines.length, where).toBeLessThanOrEqual(g.area.y + 1)
        if (mode === 'stage' && !bare && slot !== 'bottom') expect(g.area.y, where).toBeGreaterThanOrEqual(Math.min(26 + 17 * spacetimeReadouts(r).length, 112))
        expect(g.area.y + g.area.h, where).toBeLessThanOrEqual(h)
      }
  })
  it('the spectrum’s bars fit: logarithmic lengths inside the area, a number at every bar’s end', () => {
    for (const st of STATES.filter((s) => s.spectrum))
      for (const [mode, w, h, bare, slot] of BOXES) {
        const r = R(st)
        const g = spacetimeGeometry(r, w, h, mode === 'print' || bare, slot)
        const G = spectrumGeometry(r, g)
        const biggest = Math.max(...r.spectrum!.rows.map((x) => x.total))
        const where = `${JSON.stringify(st.history)} ${mode} ${w}x${h}`
        expect(G.barX + G.barW + 40, where).toBeLessThanOrEqual(w + 2)
        expect(G.y0 + G.group * r.spectrum!.rows.length, where).toBeLessThanOrEqual(g.area.y + g.area.h)
        expect(barLength(biggest, biggest, G.barW)).toBeCloseTo(G.barW, 9)
        expect(barLength(0, biggest, G.barW)).toBe(0)
        expect(barLength(10, biggest, G.barW)).toBeLessThan(barLength(100, biggest, G.barW))
        expect(G.bh, where).toBeGreaterThanOrEqual(6)
      }
  })
  it('packLines packs short texts into lines of at most the width', () => {
    expect(packLines(['aaa', 'bbb', 'ccc'], 9)).toEqual(['aaa · bbb', 'ccc'])
    expect(packLines(['one'], 50)).toEqual(['one'])
  })
})

describe('spacetime: the print figure', () => {
  it('is the same scene in print ink, numbered, titled with the passport, with the readouts as its own lines', () => {
    const html = renderToString(<FigureFor layout={S({ history: { code: 'rep', n: 5, rounds: 3, faults: [{ kind: 'data', at: 2, t: 2 }] }, show: ['faults', 'detectors', 'matching', 'verdict'], shot: 'ST-HISTORY' })} number="B1.7" caption="a flip" />)
    expect(html).toContain('<figure class="print-figure"')
    expect(html).toContain('<title>Fig. B1.7: SPACE-TIME · detector history</title>')
    expect(html).toContain('viewBox="0 0 320 300"')
    expect(html).toContain('svgk-print')
    expect(html).toContain('repetition code · 5 qubits · 3 rounds')
    expect(html).toContain('lit events: 2')
    expect(html).not.toMatch(/NaN|Infinity|undefined|no print drawing yet/)
  })
  it('draws the spectrum as a figure too', () => {
    const html = renderToString(<FigureFor layout={S({ history: { code: 'rep', n: 3, rounds: 2 }, spectrum: { maxW: 3 } })} number="B1.8" />)
    expect(html).toContain('data-view="spectrum"')
    expect(html).toContain('10 fault places')
    expect(html).not.toMatch(/NaN|Infinity|undefined|no print drawing yet/)
  })
})
