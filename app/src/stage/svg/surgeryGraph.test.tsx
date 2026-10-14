/**
 * `surgery-graph` (P-B3 S-a): the gauging graph of a logical operator. Content writes inputs only (a host and its options, what to show, a focus dot, the product, a subset, the readouts); the
 * resolver takes every dot, link, cycle, Cheeger constant, n, k and distance from physics/qec/gauge.ts. These tests check the five reference systems against the plan's numbers, the links and
 * cycles as graphs, the Cheeger set and its boundary, every validation limit with a message that names the field, the readout text, the passport / drawer / vocabulary, interpolation, and that the
 * one scene draws in the live stage, the reading version and the print figure with no NaN, packs inside the box clear of the text lines, keeps its labels off each other and names every dot, link and cycle.
 */
import { renderToString } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { fidelityOf } from '../../content/fidelity'
import type { SurgeryGraphState } from '../../content/stage'
import { KIND_RENDER, PASSPORT, STAGE_KINDS_709, SURGERY_GRAPH_HOSTS, SURGERY_GRAPH_READOUTS, SURGERY_GRAPH_SHOW, passportOf } from '../../content/stage'
import { ANCHORS, SHOTS } from '../../content/stageVocab'
import { gaugeSystem } from '../../physics/qec/gauge'
import { FigureFor, FIGURE_KINDS } from '../figures/FigureFor'
import { interpolate } from '../interp'
import { resolve, validateLayout, validateStage } from '../resolve'
import { svgKindDef } from '../svgKinds'
import type { ResolvedSurgeryGraph } from '../types'
import { SurgeryGraphScene, drawn, footLines, surgeryGraphGeometry } from './SurgeryGraphScene'
import { SURGERY_GRAPH_LIMITS, checksText, cheegerText, subsetText, surgeryGraphReadouts, surgeryGraphSummary, validateSurgeryGraphStage } from './surgeryGraph'
import './kinds'

type Gauge = SurgeryGraphState['gauge']
const S = (gauge: Gauge, extra: Omit<SurgeryGraphState, 'kind' | 'gauge'> = {}): SurgeryGraphState => ({ kind: 'surgery-graph', gauge, ...extra })
const R = (gauge: Gauge, extra: Omit<SurgeryGraphState, 'kind' | 'gauge'> = {}) => resolve(S(gauge, extra), 1) as ResolvedSurgeryGraph
const bad = (gauge: Gauge, extra: Omit<SurgeryGraphState, 'kind' | 'gauge'> = {}) => validateSurgeryGraphStage(S(gauge, extra))
const texts = (r: ResolvedSurgeryGraph) => surgeryGraphReadouts(r).map((x) => x.text)
const ALL = [...SURGERY_GRAPH_READOUTS]
type Mode = 'stage' | 'print'
const draw = (r: ResolvedSurgeryGraph, mode: Mode, w: number, h: number, bare = false, slot: 'full' | 'top' | 'bottom' = 'full') =>
  renderToString(
    <svg viewBox={`0 0 ${w} ${h}`}>
      <SurgeryGraphScene state={r} mode={mode} width={w} height={h} bare={bare} slot={slot} />
    </svg>,
  )

describe('surgery-graph: the SVG route, the passport, the drawer and the vocabulary', () => {
  it('is an SVG kind registered by the lazy module, with the plan’s passport, drawer, shot and anchors', () => {
    expect(KIND_RENDER['surgery-graph']).toBe('svg')
    expect(STAGE_KINDS_709).toContain('surgery-graph')
    expect(FIGURE_KINDS).toContain('surgery-graph')
    expect(svgKindDef('surgery-graph')).toBeDefined()
    expect(PASSPORT['surgery-graph']).toMatchObject({ title: 'GAUGING GRAPH · new qubits', fidelityKey: 'surgery-graph' })
    expect(PASSPORT['surgery-graph'].note).toBe('not a place · dots are qubits, links are new qubits; a drawing')
    expect(passportOf(S({ host: 'seam3' }))).toBe(PASSPORT['surgery-graph'])
    const f = fidelityOf('surgery-graph')
    for (const list of Object.values(f)) expect(list.length).toBeGreaterThan(0)
    expect(f.exact.map((i) => i.id)).toEqual(['qc-graph-counts'])
    expect(f.schematic.map((i) => i.id)).toEqual(['qc-graph-layout'])
    expect(f.misleading.map((i) => i.id)).toEqual(['qc-graph-one-choice'])
    expect(f.misleading[0].text).toMatch(/one choice of many/)
    expect(SHOTS['surgery-graph']).toEqual(['SG-GRAPH'])
    expect(ANCHORS['surgery-graph']).toEqual(['vertex', 'edge', 'cycle', 'check', 'subset', 'link'])
    expect(svgKindDef('surgery-graph')!.print).toEqual({ w: 320, h: 300 })
    expect([...SURGERY_GRAPH_SHOW]).toEqual(['vertices', 'edges', 'cycles', 'checks'])
    expect([...SURGERY_GRAPH_READOUTS]).toEqual(['V', 'E', 'cycles', 'cheeger', 'n', 'k', 'distance'])
    expect([...SURGERY_GRAPH_HOSTS]).toEqual(['patch3-x', 'patches3-xx', 'patch3-steane', 'seam3'])
  })
  it('resolve / validateStage reach it like any kind; an unknown shot is caught by the shared check; a split with another kind validates', () => {
    const st = S({ host: 'patches3-xx', rungs: 2 }, { shot: 'SG-GRAPH' })
    expect(validateStage(st)).toEqual([])
    expect(validateStage({ ...st, shot: 'X-NOPE' as never })).toEqual(['surgery-graph: unknown shot "X-NOPE"'])
    expect(validateLayout({ layout: 'split', top: st, bottom: { kind: 'code', code: 'steane7' } })).toEqual([])
    expect(validateLayout({ layout: 'split', top: st, bottom: st })).toEqual(['layout repeats a kind: surgery-graph + surgery-graph'])
  })
})

describe('surgery-graph: the numbers are the engine’s', () => {
  it('two patches joined by 1, 2, 3 rungs: cycles 0, 1, 2; Cheeger constant 1/3, 2/3, 1; distance 1, 2, 3; qubits 23, 24, 25', () => {
    const want = [
      { rungs: 1, cycles: 0, h: [1, 3], d: 1, n: 23 },
      { rungs: 2, cycles: 1, h: [2, 3], d: 2, n: 24 },
      { rungs: 3, cycles: 2, h: [1, 1], d: 3, n: 25 },
    ]
    for (const w of want) {
      const r = R({ host: 'patches3-xx', rungs: w.rungs })
      expect([r.V, r.E, r.cycleRank, r.n]).toEqual([6, 4 + w.rungs, w.cycles, w.n])
      expect([r.cheeger.num, r.cheeger.den]).toEqual(w.h)
      expect(r.cheeger.h).toBeCloseTo(w.h[0] / w.h[1], 12)
      expect([r.dX, r.dZ, r.d].every((v) => v === w.d || v === 3 || v === 7)).toBe(true)
      expect(r.d).toBe(w.d)
      expect([r.kBefore, r.kAfter]).toEqual([2, 1])
      expect(r.cycleRank).toBe(r.E - r.V + 1)
      // the same numbers as the engine itself
      const s = gaugeSystem('patches3-xx', { rungs: w.rungs })
      expect([r.n, r.d, r.cheeger.h, r.kAfter, r.kTotal]).toEqual([s.n, s.d, s.cheeger.h, s.kAfter, s.kTotal])
    }
  })
  it('a patch and a Steane block with three matching links: 23 qubits, k from 2 to 1; the other widths', () => {
    const r = R({ host: 'patch3-steane', w: 3 })
    expect([r.V, r.E, r.n, r.kBefore, r.kAfter, r.cycleRank]).toEqual([6, 7, 23, 2, 1, 2])
    expect(R({ host: 'patch3-steane', w: 1 }).cycleRank).toBe(0)
    expect(R({ host: 'patch3-steane', w: 2 }).cycleRank).toBe(1)
    expect(R({ host: 'patch3-steane' }).options).toMatchObject({ w: 3, rungs: 0 })
  })
  it('the surgery seam: four checks as dots, three seam qubits as links, 21 qubits, deformed distance (3, 7)', () => {
    const r = R({ host: 'seam3' })
    expect([r.V, r.E, r.n, r.cycleRank]).toEqual([4, 3, 21, 0])
    expect([r.dX, r.dZ, r.d]).toEqual([3, 7, 3])
    expect(r.vertices.map((v) => v.label)).toEqual(['c1', 'c2', 'c3', 'c4'])
    expect(r.edges.every((e) => e.kind === 'seam')).toBe(true)
    expect(r.edges.map((e) => [e.u, e.v])).toEqual([[0, 1], [1, 2], [2, 3]])
  })
  it('one patch alone: a path of three dots and two links, and no stored qubit left', () => {
    const r = R({ host: 'patch3-x' })
    expect([r.V, r.E, r.cycleRank, r.kBefore, r.kAfter, r.dX, r.dZ, r.d]).toEqual([3, 2, 0, 1, 0, null, null, null])
    expect(r.vertices.map((v) => v.side)).toEqual(['A', 'A', 'A'])
    expect(texts(R({ host: 'patch3-x' }, { readouts: ['distance', 'k'] }))).toEqual(['no stored qubit left', 'k: 1 → 0'])
  })
  it('the links join the right dots, each lies in two vertex checks, and the cycles are loops of the engine’s basis', () => {
    const r = R({ host: 'patches3-xx', rungs: 3 })
    expect(r.edges.filter((e) => e.kind === 'path').map((e) => [e.u, e.v])).toEqual([[0, 1], [1, 2], [3, 4], [4, 5]])
    expect(r.edges.filter((e) => e.kind === 'rung').map((e) => [e.u, e.v])).toEqual([[0, 3], [2, 5], [1, 4]])
    expect(r.edges.every((e) => e.mult === 2)).toBe(true)
    expect(r.edges.map((e) => e.qubit)).toEqual([18, 19, 20, 21, 22, 23, 24])
    expect(r.vertices.map((v) => v.weight)).toEqual([3, 4, 3, 3, 4, 3])
    expect(r.cycles).toHaveLength(2)
    for (const cy of r.cycles) {
      expect(cy.vertices).toHaveLength(4)
      // consecutive dots around the loop are joined by one of its links
      cy.vertices.forEach((v, i) => {
        const w = cy.vertices[(i + 1) % cy.vertices.length]
        expect(cy.edges.some((id) => [r.edges[id].u, r.edges[id].v].sort().join() === [v, w].sort().join())).toBe(true)
      })
    }
    // a different matching order moves the rungs
    expect(R({ host: 'patches3-xx', rungs: 3, order: [1, 0, 2] }).edges.filter((e) => e.kind === 'rung').map((e) => [e.u, e.v])).toEqual([[0, 4], [2, 5], [1, 3]])
  })
  it('drop leaves cycle checks out: those cycles are marked, k counts the gauge qubits', () => {
    const r = R({ host: 'patches3-xx', rungs: 3, drop: 1 })
    expect([r.keptCycles, r.options.drop, r.kAfter, r.kTotal]).toEqual([1, 1, 1, 2])
    expect(r.cycles.map((c) => c.dropped)).toEqual([false, true])
    expect(texts(R({ host: 'patches3-xx', rungs: 3, drop: 1 }, { readouts: ['k'] }))).toEqual(['k: 2 → 1 · 2 with 1 gauge'])
    expect(checksText(r)).toEqual(['6 vertex checks A_v · 1 cycle check B_c', 'gauge qubits: 1 (cycle checks left out)'])
  })
})

describe('surgery-graph: the Cheeger set, the focus and the product', () => {
  it('the worst set of the one-rung ladder is a whole side (3 dots, 1 boundary link): the ratio is h, and the text says so', () => {
    const r = R({ host: 'patches3-xx', rungs: 1 }, { subset: 'worst' })
    expect(r.subset!.worst).toBe(true)
    expect(r.subset!.vertices.length).toBe(3)
    expect(r.subset!.boundary.length / r.subset!.vertices.length).toBeCloseTo(r.cheeger.h, 12)
    expect(subsetText(r)).toBe('|S| = 3, boundary = 1, 1/3 (worst set)')
    expect(cheegerText(r)).toBe('h = 1/3')
    expect(texts(R({ host: 'patches3-xx', rungs: 1 }, { subset: 'worst', readouts: ['cheeger'] }))).toEqual(['h = 1/3 · worst set'])
    // the boundary links really have exactly one end in the set
    const inS = new Set(r.subset!.vertices)
    for (const id of r.subset!.boundary) expect(inS.has(r.edges[id].u)).not.toBe(inS.has(r.edges[id].v))
    expect(r.edges.filter((e) => inS.has(e.u) !== inS.has(e.v)).map((e) => e.id)).toEqual(r.subset!.boundary)
  })
  it('an authored set is counted the same way; the full-rung ladder has h = 1 and the text drops the denominator', () => {
    const r = R({ host: 'patches3-xx', rungs: 3 }, { subset: [0, 1] })
    expect(r.subset!.worst).toBe(false)
    expect(r.subset!.boundary.length).toBe(R({ host: 'patches3-xx', rungs: 3 }).edges.filter((e) => [e.u, e.v].filter((x) => x <= 1).length === 1).length)
    expect(subsetText(r)).toMatch(/^\|S\| = 2, boundary = \d, /)
    expect(cheegerText(R({ host: 'patches3-xx', rungs: 3 }))).toBe('h = 1')
    expect(cheegerText(R({ host: 'patches3-xx', rungs: 2 }))).toBe('h = 2/3')
  })
  it('focus names the dot’s vertex check; product counts the links in the product of all vertex checks (2 each)', () => {
    const f = R({ host: 'patches3-xx', rungs: 3 }, { focus: { vertex: 1 }, show: ['checks'] })
    expect(f.focus).toBe(1)
    expect(checksText(f)[checksText(f).length - 1]).toBe('A_v at A2: X on the dot and on 3 links (weight 4)')
    const p = R({ host: 'patch3-steane', w: 3 }, { product: true })
    expect(p.product).toBe(true)
    expect(p.edges.map((e) => e.mult)).toEqual(p.edges.map(() => 2))
    expect(footLines(p)).toEqual(['each link is in 2 vertex checks: ×2 cancels', 'only X on the dots remains'])
  })
  it('the readouts print the engine’s numbers in the plan’s words', () => {
    expect(texts(R({ host: 'patches3-xx', rungs: 2 }, { readouts: ALL }))).toEqual([
      'V = 6 dots',
      'E = 6 links',
      'cycles: 6 − 6 + 1 = 1',
      'h = 2/3',
      'deformed code: 24 qubits',
      'k: 2 → 1',
      'distance (X, Z) = (2, 7)',
    ])
    expect(texts(R({ host: 'seam3' }, { readouts: ['n', 'distance'] }))).toEqual(['deformed code: 21 qubits', 'distance (X, Z) = (3, 7)'])
    expect(texts(R({ host: 'seam3' }))).toEqual([])
    expect(surgeryGraphSummary(R({ host: 'seam3' }, { readouts: ['n'] }))).toBe('gauging graph of seam3: 4 dots, 3 links (new qubits), 0 cycles; deformed code: 21 qubits')
  })
})

describe('surgery-graph: validation names the field', () => {
  it('accepts every host with its own options', () => {
    for (const g of [{ host: 'patch3-x' }, { host: 'patches3-xx', rungs: 3, order: [2, 1, 0] }, { host: 'patch3-steane', w: 2, order: [1, 2, 0], drop: 1 }, { host: 'seam3' }, { host: 'patches3-xx', rungs: 3, drop: 2 }] as Gauge[])
      expect(bad(g), JSON.stringify(g)).toEqual([])
    expect(bad({ host: 'patches3-xx', rungs: 2 }, { show: ['vertices', 'edges', 'cycles', 'checks'], readouts: ALL, focus: { vertex: 5 }, product: true, subset: [0, 1, 2] })).toEqual([])
    expect([SURGERY_GRAPH_LIMITS.vertices, SURGERY_GRAPH_LIMITS.rungs, SURGERY_GRAPH_LIMITS.w]).toEqual([16, 3, 3])
  })
  it('refuses an unknown host and options that do not belong to the host', () => {
    expect(bad({ host: 'lpu-gross' as never })).toEqual([`surgery-graph gauge.host: one of 'patch3-x', 'patches3-xx', 'patch3-steane', 'seam3'`])
    expect(bad({ host: 'patch3-steane', rungs: 2 })).toEqual(['surgery-graph gauge.rungs: only the host patches3-xx has rungs'])
    expect(bad({ host: 'patches3-xx', w: 2 })).toEqual(['surgery-graph gauge.w: only the host patch3-steane has an adapter width'])
    expect(bad({ host: 'patch3-x', order: [0, 1, 2] })).toEqual(['surgery-graph gauge.order: only the hosts patches3-xx and patch3-steane match their dots'])
    expect(bad({ host: 'seam3', rungs: 1 })[0]).toMatch(/gauge\.rungs: only the host patches3-xx/)
  })
  it('rungs 0 is two separate paths and says so; rungs and w stay in 1–3; the order is a permutation', () => {
    expect(bad({ host: 'patches3-xx', rungs: 0 })).toEqual(['surgery-graph gauge.rungs: a ladder with no rung is two separate paths and is not connected; use 1–3'])
    expect(bad({ host: 'patches3-xx', rungs: 4 })).toEqual(['surgery-graph gauge.rungs: a whole number 1–3'])
    expect(bad({ host: 'patches3-xx', rungs: 1.5 })).toEqual(['surgery-graph gauge.rungs: a whole number 1–3'])
    expect(bad({ host: 'patch3-steane', w: 0 })).toEqual(['surgery-graph gauge.w: a whole number 1–3'])
    expect(bad({ host: 'patch3-steane', w: 4 })).toEqual(['surgery-graph gauge.w: a whole number 1–3'])
    expect(bad({ host: 'patches3-xx', order: [0, 0, 1] })).toEqual(['surgery-graph gauge.order: a permutation of 0, 1, 2'])
    expect(bad({ host: 'patches3-xx', order: [0, 1] })).toEqual(['surgery-graph gauge.order: a permutation of 0, 1, 2'])
  })
  it('drop runs from 0 to the number of independent cycles of this graph', () => {
    expect(bad({ host: 'patches3-xx', rungs: 1, drop: 1 })).toEqual(['surgery-graph gauge.drop: a whole number 0–0 (this graph has 0 independent cycles)'])
    expect(bad({ host: 'patches3-xx', rungs: 3, drop: 3 })).toEqual(['surgery-graph gauge.drop: a whole number 0–2 (this graph has 2 independent cycles)'])
    expect(bad({ host: 'patches3-xx', rungs: 2, drop: 2 })[0]).toMatch(/0–1 \(this graph has 1 independent cycle\)/)
    expect(bad({ host: 'patches3-xx', drop: -1 })[0]).toMatch(/gauge\.drop/)
    expect(bad({ host: 'seam3', drop: 1 })[0]).toMatch(/0–0/)
  })
  it('show and readouts: known names, each once; focus is a dot; subset is a Cheeger-sized set of distinct dots', () => {
    const g: Gauge = { host: 'patches3-xx', rungs: 3 }
    expect(bad(g, { show: ['links' as never] })).toEqual([`surgery-graph show: a list of 'vertices', 'edges', 'cycles', 'checks'`])
    expect(bad(g, { show: ['edges', 'edges'] })).toEqual(['surgery-graph show: each name once'])
    expect(bad(g, { readouts: ['h' as never] })[0]).toMatch(/^surgery-graph readouts: a list of 'V', 'E'/)
    expect(bad(g, { readouts: ['V', 'V'] })).toEqual(['surgery-graph readouts: each name once'])
    expect(bad(g, { focus: { vertex: 6 } })).toEqual(['surgery-graph focus.vertex: a dot from 0 to 5'])
    expect(bad(g, { focus: { vertex: 1.5 } })).toEqual(['surgery-graph focus.vertex: a dot from 0 to 5'])
    expect(bad(g, { subset: [0, 0] })).toEqual(['surgery-graph subset: each dot once'])
    expect(bad(g, { subset: [0, 9] })).toEqual([`surgery-graph subset: 'worst' or a list of dots from 0 to 5`])
    expect(bad(g, { subset: [] })).toEqual([`surgery-graph subset: 'worst' or a list of dots from 0 to 5`])
    expect(bad(g, { subset: [0, 1, 2, 3] })).toEqual(['surgery-graph subset: at most 3 of the 6 dots (the Cheeger constant looks at sets of at most half the dots)'])
    expect(bad({ host: 'patch3-x' }, { subset: [0, 1] })[0]).toMatch(/at most 1 of the 3 dots/)
    expect(bad(g, { product: 1 as never })).toEqual(['surgery-graph product: true or false'])
    expect(bad({ host: 'patch3-x', zz: 1 } as never)[0]).toMatch(/gauge\.zz: unknown/)
  })
})

describe('surgery-graph: interpolation', () => {
  it('everything switches at the half-way point, even a single rung', () => {
    const a = resolve(S({ host: 'patches3-xx', rungs: 1 }), 1)
    const b = resolve(S({ host: 'patches3-xx', rungs: 2 }), 1)
    expect(interpolate(a, b, 0)).toBe(a)
    expect(interpolate(a, b, 0.49)).toBe(a)
    expect(interpolate(a, b, 0.5)).toBe(b)
    expect(interpolate(a, b, 1)).toBe(b)
    const c = resolve(S({ host: 'patches3-xx', rungs: 1 }, { subset: 'worst' }), 1)
    expect(interpolate(a, c, 0.3)).toBe(a)
    expect(interpolate(a, c, 0.7)).toBe(c)
  })
})

/** Every text element of a rendered figure with its box (6.2 px a character at 10–12 px type, 11 px tall). */
function textBoxes(html: string): { text: string; x0: number; x1: number; y0: number; y1: number }[] {
  const out: { text: string; x0: number; x1: number; y0: number; y1: number }[] = []
  for (const m of html.matchAll(/<text([^>]*)>(.*?)<\/text>/g)) {
    const attrs = m[1]
    const x = Number(/\bx="([-\d.]+)"/.exec(attrs)?.[1])
    const y = Number(/\by="([-\d.]+)"/.exec(attrs)?.[1])
    const anchor = /text-anchor="(\w+)"/.exec(attrs)?.[1] ?? 'start'
    const size = Number(/font-size:\s*([\d.]+)/.exec(attrs)?.[1] ?? 11)
    const text = m[2].replace(/<[^>]*>/g, '')
    if (!Number.isFinite(x) || !Number.isFinite(y) || !text) continue
    const w = text.length * size * 0.56
    const x0 = anchor === 'end' ? x - w : anchor === 'middle' ? x - w / 2 : x
    out.push({ text, x0, x1: x0 + w, y0: y - size * 0.8, y1: y + 2 })
  }
  return out
}
const clash = (a: ReturnType<typeof textBoxes>[number], b: ReturnType<typeof textBoxes>[number]) => a.x0 < b.x1 - 0.5 && b.x0 < a.x1 - 0.5 && a.y0 < b.y1 - 0.5 && b.y0 < a.y1 - 0.5

const BOXES = [
  ['stage', 640, 560, false, 'full'],
  ['stage', 375, 520, false, 'full'],
  ['stage', 375, 380, false, 'top'],
  ['stage', 375, 340, false, 'bottom'],
  ['print', 320, 300, false, 'full'],
  ['stage', 360, 320, true, 'full'],
] as const

const ALL_SHOW: SurgeryGraphState['show'] = ['vertices', 'edges', 'cycles', 'checks']
const CASES: SurgeryGraphState[] = [
  S({ host: 'patch3-x' }),
  S({ host: 'patches3-xx', rungs: 3 }, { show: ALL_SHOW, readouts: ALL }),
  S({ host: 'patches3-xx', rungs: 1 }, { show: ALL_SHOW, subset: 'worst', readouts: ['cheeger', 'distance'] }),
  S({ host: 'patches3-xx', rungs: 3, drop: 1, order: [2, 0, 1] }, { show: ALL_SHOW, product: true, readouts: ['k'] }),
  S({ host: 'patch3-steane', w: 3 }, { show: ALL_SHOW, focus: { vertex: 4 }, readouts: ALL }),
  S({ host: 'seam3' }, { show: ['edges', 'checks'], readouts: ['n', 'distance'] }),
  S({ host: 'patch3-steane', w: 2 }, { show: ['cycles'], subset: [3, 4] }),
]

describe('surgery-graph: the scene', () => {
  it('draws in the live stage, the reading version and the print figure with no NaN, and names every dot, link and cycle', () => {
    for (const st of CASES)
      for (const [mode, w, h, bare, slot] of BOXES) {
        const r = resolve(st, 1) as ResolvedSurgeryGraph
        const html = draw(r, mode, w, h, bare, slot)
        const where = `${r.host} ${JSON.stringify(st.show)} ${mode} ${w}x${h}`
        expect(html, where).not.toMatch(/NaN|Infinity|undefined/)
        expect(html).toContain('data-kind="surgery-graph"')
        expect(html).toContain('data-anchor="vertex"')
        expect((html.match(/aria-label="[^"]*(support qubit|surgery check) [^"]*vertex check acts on \d+ qubits"/g) ?? []).length, `${where}: dots`).toBe(r.V)
        const links = drawn(r).links
        expect((html.match(/aria-label="new qubit \d+: /g) ?? []).length, `${where}: links`).toBe(links ? r.E : 0)
        expect((html.match(/aria-label="cycle B\d/g) ?? []).length, `${where}: cycles`).toBe(drawn(r).cycles ? r.cycles.length : 0)
        if (links) expect(html).toContain('data-anchor="edge"')
        if (drawn(r).checks) expect(html).toContain('vertex checks A_v')
        if (r.subset) expect(html).toContain(subsetText(r)!)
        if (r.subset) expect((html.match(/data-shaded="1"/g) ?? []).length).toBe(r.subset.vertices.length)
        if (r.product) expect((html.match(/>×2</g) ?? []).length).toBe(r.E)
        if (r.focus !== null) expect(html).toContain('data-focus="1"')
        expect(html, where).toContain('link = new qubit')
      }
  })
  it('a link is a new qubit: the tag of each link is the qubit number (or the seam row), and the dots keep the engine’s labels', () => {
    const html = draw(R({ host: 'patches3-xx', rungs: 2 }, { show: ['vertices', 'edges'] }), 'print', 320, 300)
    for (const q of [18, 19, 20, 21, 22, 23]) expect(html).toContain(`>q${q}<`)
    for (const l of ['A1', 'A2', 'A3', 'B1', 'B2', 'B3']) expect(html).toContain(`>${l}<`)
    expect(html).toContain('>q2<') // the code qubit A1 sits on
    const seam = draw(R({ host: 'seam3' }, { show: ['edges'] }), 'print', 320, 300)
    for (const l of ['seam 1', 'seam 2', 'seam 3', 'c1', 'c4']) expect(seam).toContain(`>${l}<`)
  })
  it('packs inside the box: every dot clear of the text lines and of the legend, side by side without touching', () => {
    for (const st of CASES)
      for (const [mode, w, h, bare, slot] of BOXES) {
        const r = resolve(st, 1) as ResolvedSurgeryGraph
        const g = surgeryGraphGeometry(r, w, h, mode === 'print' || bare, slot)
        const where = `${r.host} ${mode} ${w}x${h} ${slot}`
        const dots = r.vertices.map((v) => g.at(v.id))
        for (const p of dots) {
          expect(p.x - g.rad - g.stub - 20, where).toBeGreaterThanOrEqual(0)
          expect(p.x + g.rad + g.stub + 20, where).toBeLessThanOrEqual(w)
          expect(p.y - g.rad, where).toBeGreaterThanOrEqual(g.area.y)
          expect(p.y + g.rad, where).toBeLessThanOrEqual(g.footY - 12)
        }
        let minGap = Infinity
        for (let i = 0; i < dots.length; i++) for (let j = i + 1; j < dots.length; j++) minGap = Math.min(minGap, Math.hypot(dots[i].x - dots[j].x, dots[i].y - dots[j].y) - 2 * g.rad)
        expect(minGap, `${where}: two dots touch`).toBeGreaterThan(2)
        if (g.lines.length) expect(6 + 13 * g.lines.length, where).toBeLessThanOrEqual(g.area.y + 1)
        expect(g.footY + 13 * Math.max(0, g.foot.length - 1), where).toBeLessThanOrEqual(g.legendY - 8)
        expect(g.area.y + g.area.h, where).toBeLessThanOrEqual(h)
      }
  })
  it('no two text labels overlap, in any box, and none leaves it', () => {
    for (const st of CASES)
      for (const [mode, w, h, bare, slot] of BOXES) {
        const r = resolve(st, 1) as ResolvedSurgeryGraph
        const t = textBoxes(draw(r, mode, w, h, bare, slot))
        const where = `${r.host} ${JSON.stringify(st.show)} ${mode} ${w}x${h} ${slot}`
        for (let i = 0; i < t.length; i++) for (let j = i + 1; j < t.length; j++) expect(clash(t[i], t[j]), `${where}: "${t[i].text}" and "${t[j].text}"`).toBe(false)
        for (const b of t) {
          expect(b.x0, `${where}: ${b.text}`).toBeGreaterThanOrEqual(-1)
          expect(b.x1, `${where}: ${b.text}`).toBeLessThanOrEqual(w + 1)
        }
      }
  })
  it('the print figure is 320 × 300 and carries the readouts as text lines', () => {
    const html = renderToString(<FigureFor layout={CASES[1]} number="B3.2" />)
    expect(html).toContain('viewBox="0 0 320 300"')
    expect(html).toContain('<title>Fig. B3.2: GAUGING GRAPH · new qubits</title>')
    expect(html).toContain('deformed code: 25 qubits')
    expect(html).toContain('svgk-print')
    expect(html).not.toMatch(/NaN|Infinity|undefined|no print drawing yet/)
  })
})
