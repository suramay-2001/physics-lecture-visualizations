/**
 * `surgery-graph`, the lpu source (Papers P1): the ancilla graph of a logical processing unit of the bicycle machine (paper-tdg App. A.3). Content writes the code, the mode and the operator to
 * measure; the resolver takes every dot and link from physics/qec/tdg.ts (`tdgLpuGraph`, `tdgLpuModeOf`). These tests check the counts against the engine (gross full: 23 dots, 47 links, rank 25,
 * kept 19, u = 90; two-gross full: u = 158), the numbering and the bell dot, which part a measurement lights, the readout text, every validation limit with a message that names the field, that
 * the gauge source is untouched, interpolation, and that the one scene draws in the live stage, the reading version and the print figure with no NaN, packs inside the box, keeps its labels off
 * each other and names every dot and link.
 */
import { renderToString } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { fidelityOf } from '../../content/fidelity'
import type { SurgeryGraphState } from '../../content/stage'
import { PASSPORT, PASSPORT_VARIANT, SURGERY_LPU_CODES, SURGERY_LPU_MEASURES, SURGERY_LPU_MODES, SURGERY_LPU_READOUTS, passportOf } from '../../content/stage'
import { tdgLpuGraph, tdgLpuModeOf } from '../../physics/qec/tdg'
import { FigureFor } from '../figures/FigureFor'
import { interpolate } from '../interp'
import { firstNonFinite, resolve, validateLayout, validateStage } from '../resolve'
import type { ResolvedLpuGraph, ResolvedSurgeryGraph } from '../types'
import { SurgeryGraphScene } from './SurgeryGraphScene'
import { LPU_DIM, SurgeryLpuScene, dotLit, linkLit, lpuGeometry, lpuTitle } from './SurgeryLpuScene'
import { lpuOpLabel, surgeryGraphReadouts, surgeryGraphSummary, validateSurgeryGraphStage } from './surgeryGraph'
import './kinds'

type Lpu = NonNullable<SurgeryGraphState['lpu']>
const S = (lpu: Lpu, extra: Omit<SurgeryGraphState, 'kind' | 'lpu' | 'gauge'> = {}): SurgeryGraphState => ({ kind: 'surgery-graph', lpu, ...extra })
const R = (lpu: Lpu, extra: Omit<SurgeryGraphState, 'kind' | 'lpu' | 'gauge'> = {}) => resolve(S(lpu, extra), 1) as ResolvedLpuGraph
const bad = (lpu: Lpu, extra: Omit<SurgeryGraphState, 'kind' | 'lpu' | 'gauge'> = {}) => validateSurgeryGraphStage(S(lpu, extra))
const texts = (r: ResolvedLpuGraph) => surgeryGraphReadouts(r).map((x) => x.text)
const ALL = [...SURGERY_LPU_READOUTS]
/** "X-bar 1": the letter, a combining macron, the number. */
const bar = (op: string): string => `${op[0]}\u0304${op.slice(1)}`
type Mode = 'stage' | 'print'
const draw = (r: ResolvedLpuGraph, mode: Mode, w: number, h: number, bare = false, slot: 'full' | 'top' | 'bottom' = 'full') =>
  renderToString(
    <svg viewBox={`0 0 ${w} ${h}`}>
      <SurgeryGraphScene state={r} mode={mode} width={w} height={h} bare={bare} slot={slot} />
    </svg>,
  )

describe('surgery-graph lpu source: the passport, the drawer and the vocabulary', () => {
  it('an lpu state takes the LPU passport and its own drawer; the plain surgery-graph passport and drawer are unchanged', () => {
    const p = passportOf(S({ code: 'gross', mode: 'full' }))
    expect(p).toBe(PASSPORT_VARIANT.surgeryLpu)
    expect(p.title).toBe('LPU GRAPH · ancilla qubits')
    expect(p.note).toMatch(/^not a place/)
    expect(p.fidelityKey).toBe('surgery-lpu')
    const f = fidelityOf('surgery-lpu')
    for (const list of Object.values(f)) expect(list.length).toBeGreaterThan(0)
    expect(f.schematic.map((i) => i.id)).toEqual(['qc-lpu-layout'])
    expect(f.misleading.map((i) => i.id)).toEqual(['qc-lpu-kept-reported'])
    expect(f.exact.map((i) => i.id)).toEqual(['qc-lpu-counts'])
    expect(f.schematic[0].text).toMatch(/which dots a bridge link joins is a drawing choice/i)
    expect(f.misleading[0].text).toMatch(/cycles kept as checks.*printed counts/)
    // the gauge passport and its drawer are exactly what they were
    expect(passportOf({ kind: 'surgery-graph', gauge: { host: 'seam3' } })).toBe(PASSPORT['surgery-graph'])
    const g = fidelityOf('surgery-graph')
    expect(g.exact.map((i) => i.id)).toEqual(['qc-graph-counts'])
    expect(g.schematic.map((i) => i.id)).toEqual(['qc-graph-layout'])
    expect(g.misleading.map((i) => i.id)).toEqual(['qc-graph-one-choice'])
    expect([...SURGERY_LPU_CODES]).toEqual(['gross', 'two-gross'])
    expect([...SURGERY_LPU_MODES]).toEqual(['l', 'r', 'full'])
    expect([...SURGERY_LPU_MEASURES]).toEqual(['X1', 'Z1', 'Y1', 'X7', 'Z7', 'Y7'])
    expect(ALL).toEqual(['V', 'E', 'cycles', 'kept', 'u'])
  })
  it('resolve / validateStage reach it; an unknown shot is caught by the shared check; a split with another kind validates', () => {
    const st = S({ code: 'gross', mode: 'full' }, { shot: 'SG-GRAPH' })
    expect(validateStage(st)).toEqual([])
    expect(validateStage({ ...st, shot: 'X-NOPE' as never })).toEqual(['surgery-graph: unknown shot "X-NOPE"'])
    expect(validateLayout({ layout: 'split', top: st, bottom: { kind: 'code', code: 'steane7' } })).toEqual([])
  })
})

describe('surgery-graph lpu source: the numbers are the engine’s', () => {
  it('gross, full graph: 23 dots, 24 check qubits, 47 links, 25 independent cycles, 19 kept as checks (reported), u = 90', () => {
    const r = R({ code: 'gross', mode: 'full' })
    expect([r.V, r.Vq, r.E, r.rank, r.kept, r.u, r.bridge]).toEqual([23, 24, 47, 25, 19, 90, 11])
    expect(r.rank).toBe(r.E - r.V + 1)
    expect(r.u).toBe(r.Vq + r.E + r.kept)
    const g = tdgLpuGraph('gross', 'full')
    expect([r.V, r.Vq, r.E, r.rank, r.kept, r.u, r.bridge]).toEqual([g.V, g.Vq, g.E, g.rank, g.kept, g.u, g.bridge])
  })
  it('two-gross, full graph: u = 158 (39 dots, 81 links, 17 bridge links, 37 kept); the half graphs carry the two added links each', () => {
    const r = R({ code: 'two-gross', mode: 'full' })
    expect([r.V, r.Vq, r.E, r.rank, r.kept, r.u, r.bridge]).toEqual([39, 40, 81, 43, 37, 158, 17])
    expect(r.edges.filter((e) => e.kind === 'bridge')).toHaveLength(17)
    expect(r.edges.filter((e) => e.kind === 'extra')).toHaveLength(4)
    expect(R({ code: 'gross', mode: 'full' }).edges.filter((e) => e.kind === 'extra')).toHaveLength(0)
  })
  it('each half graph alone: 12 dots and 18 links (gross), 7 independent cycles, 5 (left) or 3 (right) kept; u is 0 (it counts the whole graph)', () => {
    const l = R({ code: 'gross', mode: 'l' })
    const r = R({ code: 'gross', mode: 'r' })
    expect([l.V, l.Vq, l.E, l.rank, l.kept, l.u, l.bridge]).toEqual([12, 12, 18, 7, 5, 0, 0])
    expect([r.V, r.E, r.rank, r.kept]).toEqual([12, 18, 7, 3])
    expect(l.vertices.every((v) => v.half === 'l')).toBe(true)
    expect(r.vertices.every((v) => v.half === 'r')).toBe(true)
    expect(R({ code: 'two-gross', mode: 'l' }).E).toBe(32)
  })
  it('the dots are numbered from 1 within their half, the shared dot is v_Bell, and the i-th plain dots of the two halves (which a bridge joins) carry the same number', () => {
    const r = R({ code: 'gross', mode: 'full' })
    expect(r.vertices.filter((v) => v.half === 'bell').map((v) => v.label)).toEqual(['v_Bell'])
    expect(r.vertices.filter((v) => v.half === 'l').map((v) => v.label)).toEqual(Array.from({ length: 11 }, (_, i) => String(i + 1)))
    expect(r.vertices.filter((v) => v.half === 'r').map((v) => v.label)).toEqual(Array.from({ length: 11 }, (_, i) => String(i + 1)))
    for (const e of r.edges.filter((x) => x.kind === 'bridge')) expect([r.vertices[e.a].half, r.vertices[e.b].half, r.vertices[e.a].label === r.vertices[e.b].label]).toEqual(['l', 'r', true])
    expect(R({ code: 'gross', mode: 'l' }).vertices.map((v) => v.label)).toEqual(Array.from({ length: 12 }, (_, i) => String(i + 1)))
    expect(r.vertices.find((v) => v.half === 'bell')!.aria).toMatch(/v_Bell \(it stands for two check qubits\)/)
  })
  it('every link joins two dots of the graph; the half of each link is the half its ends are in (a bridge belongs to both)', () => {
    for (const code of ['gross', 'two-gross'] as const)
      for (const mode of ['l', 'r', 'full'] as const) {
        const r = R({ code, mode })
        for (const e of r.edges) {
          expect(e.a).not.toBe(e.b)
          expect(e.a).toBeGreaterThanOrEqual(0)
          expect(e.b).toBeLessThan(r.V)
          if (e.kind === 'bridge') expect(e.half).toBe('both')
          else if (e.kind === 'extra') expect(['l', 'r']).toContain(e.half)
          else expect(e.half).toBe(e.kind)
        }
      }
  })
})

describe('surgery-graph lpu source: a measurement lights the part that makes it', () => {
  it('X̄1 and Z̄7 the left half, X̄7 and Z̄1 the right half, the Y products the whole graph: the part is the engine’s', () => {
    const want: Record<Lpu['measure'] & string, ResolvedLpuGraph['litPart']> = { X1: 'l', Z7: 'l', X7: 'r', Z1: 'r', Y1: 'full', Y7: 'full' }
    for (const op of SURGERY_LPU_MEASURES) {
      const r = R({ code: 'gross', mode: 'full', measure: op })
      expect(r.litPart, op).toBe(want[op])
      expect(r.litPart).toBe(tdgLpuModeOf(op))
    }
    expect(R({ code: 'gross', mode: 'full' }).litPart).toBeNull()
  })
  it('the caption row says which half measures which operator', () => {
    expect(R({ code: 'gross', mode: 'full', measure: 'X1' }).caption).toBe(`measures ${bar('X1')} with the left half`)
    expect(R({ code: 'gross', mode: 'full', measure: 'Z1' }).caption).toBe(`measures ${bar('Z1')} with the right half`)
    expect(R({ code: 'two-gross', mode: 'full', measure: 'Y7' }).caption).toBe(`measures ${bar('Y7')} with the whole graph`)
    expect(R({ code: 'gross', mode: 'l', measure: 'Z7' }).caption).toBe(`measures ${bar('Z7')} with the left half`)
    expect(R({ code: 'gross', mode: 'full' }).caption).toBeNull()
    expect(lpuOpLabel('X7')).toBe('X̄1'.replace('1', '7'))
  })
  it('lit dots and links: the measuring half and the shared dot are lit, the other half and the bridges dim; the whole graph lights all', () => {
    const left = R({ code: 'gross', mode: 'full', measure: 'X1' })
    expect(left.vertices.map((v) => dotLit(left, v.half))).toEqual(left.vertices.map((v) => v.half !== 'r'))
    expect(left.edges.filter((e) => linkLit(left, e.half)).every((e) => e.half === 'l')).toBe(true)
    expect(left.edges.filter((e) => e.kind === 'bridge').some((e) => linkLit(left, e.half))).toBe(false)
    const right = R({ code: 'two-gross', mode: 'full', measure: 'Z1' })
    expect(right.vertices.filter((v) => dotLit(right, v.half)).every((v) => v.half !== 'l')).toBe(true)
    const whole = R({ code: 'gross', mode: 'full', measure: 'Y1' })
    expect(whole.vertices.every((v) => dotLit(whole, v.half))).toBe(true)
    expect(whole.edges.every((e) => linkLit(whole, e.half))).toBe(true)
    const none = R({ code: 'gross', mode: 'full' })
    expect(none.edges.every((e) => linkLit(none, e.half))).toBe(true)
  })
  it('the scene marks it: dimmed dots and links carry the dim strength, lit ones do not', () => {
    const r = R({ code: 'gross', mode: 'full', measure: 'X1' })
    const html = draw(r, 'print', 320, 300)
    expect((html.match(/data-half="r"[^>]*data-lit="0"/g) ?? []).length).toBe(11)
    expect((html.match(/data-half="l"[^>]*data-lit="1"/g) ?? []).length).toBe(11)
    expect((html.match(/data-half="bell"[^>]*data-lit="1"/g) ?? []).length).toBe(1)
    expect(html).toContain(`opacity="${LPU_DIM}"`)
    expect(html).toContain('measures X̄1 with the left half')
    expect(draw(R({ code: 'gross', mode: 'full' }), 'print', 320, 300)).not.toContain(`opacity="${LPU_DIM}"`)
  })
})

describe('surgery-graph lpu source: the readouts print the engine’s numbers in the plan’s words', () => {
  it('V (and the check qubits of the full graph), E, cycles, the kept cycles (reported), u', () => {
    expect(texts(R({ code: 'gross', mode: 'full' }, { readouts: ALL }))).toEqual([
      'V = 23 dots (24 qubits)',
      'E = 47 links',
      'cycles: 47 − 23 + 1 = 25',
      'kept: 19 (reported)',
      'u = 24+47+19 = 90',
    ])
    expect(texts(R({ code: 'two-gross', mode: 'full' }, { readouts: ['u'] }))).toEqual(['u = 40+81+37 = 158'])
    expect(texts(R({ code: 'gross', mode: 'l' }, { readouts: ['V', 'E', 'cycles', 'kept'] }))).toEqual(['V = 12 dots', 'E = 18 links', 'cycles: 18 − 12 + 1 = 7', 'kept: 5 (reported)'])
    expect(texts(R({ code: 'gross', mode: 'full' }))).toEqual([])
    expect(surgeryGraphReadouts(R({ code: 'gross', mode: 'full' }, { readouts: ['kept'] }))[0].name).toBe('kept')
  })
  it('the accessible text names the code, the part, the counts, the caption and the readouts', () => {
    expect(surgeryGraphSummary(R({ code: 'gross', mode: 'full', measure: 'X1' }, { readouts: ['kept'] }))).toBe(
      'LPU graph of the gross code: both halves with the shared dot v_Bell and the bridge links; 23 dots, 47 links, 25 independent cycles; measures X̄1 with the left half; kept: 19 (reported)',
    )
    expect(lpuTitle(R({ code: 'two-gross', mode: 'r' }))).toBe('LPU graph · two-gross code · right half graph')
  })
})

describe('surgery-graph lpu source: validation names the field', () => {
  it('accepts every code and mode, every measure that fits the mode, and the readouts', () => {
    for (const code of SURGERY_LPU_CODES) for (const mode of SURGERY_LPU_MODES) expect(bad({ code, mode }), `${code} ${mode}`).toEqual([])
    for (const op of SURGERY_LPU_MEASURES) expect(bad({ code: 'gross', mode: 'full', measure: op }, { readouts: ALL }), op).toEqual([])
    expect(bad({ code: 'gross', mode: 'l', measure: 'X1' })).toEqual([])
    expect(bad({ code: 'gross', mode: 'l', measure: 'Z7' })).toEqual([])
    expect(bad({ code: 'gross', mode: 'r', measure: 'Z1' })).toEqual([])
    expect(bad({ code: 'gross', mode: 'r', measure: 'X7' }, { readouts: ['V', 'E', 'cycles', 'kept'] })).toEqual([])
  })
  it('exactly one of gauge and lpu', () => {
    expect(validateSurgeryGraphStage({ kind: 'surgery-graph', gauge: { host: 'seam3' }, lpu: { code: 'gross', mode: 'full' } })).toEqual(['surgery-graph exactly one of gauge, lpu (this state names both)'])
    expect(validateSurgeryGraphStage({ kind: 'surgery-graph' })[0]).toMatch(/^surgery-graph exactly one of gauge, lpu \(this state names neither\)/)
  })
  it('refuses an unknown code, mode, measure or field', () => {
    expect(bad({ code: 'b144' as never, mode: 'full' })).toEqual([`surgery-graph lpu.code: one of 'gross', 'two-gross'`])
    expect(bad({ code: 'gross', mode: 'half' as never })).toEqual([`surgery-graph lpu.mode: one of 'l', 'r', 'full'`])
    expect(bad({ code: 'gross', mode: 'full', measure: 'X2' as never })).toEqual([`surgery-graph lpu.measure: one of 'X1', 'Z1', 'Y1', 'X7', 'Z7', 'Y7'`])
    expect(bad({ code: 'gross', mode: 'full', zz: 1 } as never)).toEqual(['surgery-graph lpu.zz: unknown (code, mode, measure)'])
    expect(validateSurgeryGraphStage({ kind: 'surgery-graph', lpu: 3 as never })).toEqual(['surgery-graph lpu: { code, mode, measure? }'])
  })
  it('a measurement must fit the half that is drawn', () => {
    expect(bad({ code: 'gross', mode: 'l', measure: 'X7' })).toEqual(["surgery-graph lpu.measure: X̄7 is measured with the right half, but mode 'l' draws the left half; use mode 'r' or 'full'"])
    expect(bad({ code: 'gross', mode: 'r', measure: 'Z7' })).toEqual(["surgery-graph lpu.measure: Z̄7 is measured with the left half, but mode 'r' draws the right half; use mode 'l' or 'full'"])
    expect(bad({ code: 'gross', mode: 'l', measure: 'Y1' })).toEqual(["surgery-graph lpu.measure: Ȳ1 needs the whole graph; use mode 'full'"])
    expect(bad({ code: 'gross', mode: 'r', measure: 'Y7' })).toEqual(["surgery-graph lpu.measure: Ȳ7 needs the whole graph; use mode 'full'"])
  })
  it('show, focus, product and subset are refused with an lpu source', () => {
    const l: Lpu = { code: 'gross', mode: 'full' }
    expect(bad(l, { show: ['edges'] })).toEqual(['surgery-graph show: not for an lpu source (an lpu source takes lpu and readouts only)'])
    expect(bad(l, { focus: { vertex: 0 } })).toEqual(['surgery-graph focus: not for an lpu source (an lpu source takes lpu and readouts only)'])
    expect(bad(l, { product: true })).toEqual(['surgery-graph product: not for an lpu source (an lpu source takes lpu and readouts only)'])
    expect(bad(l, { subset: 'worst' })).toEqual(['surgery-graph subset: not for an lpu source (an lpu source takes lpu and readouts only)'])
    expect(bad(l, { show: ['edges'], subset: [0] }).length).toBe(2)
  })
  it('readouts: the lpu names only, each once; u needs the whole graph', () => {
    const l: Lpu = { code: 'gross', mode: 'full' }
    expect(bad(l, { readouts: ['cheeger'] })).toEqual([`surgery-graph readouts: an lpu source takes a list of 'V', 'E', 'cycles', 'kept', 'u'`])
    expect(bad(l, { readouts: ['n', 'k', 'distance'] })[0]).toMatch(/^surgery-graph readouts: an lpu source takes/)
    expect(bad(l, { readouts: ['V', 'V'] })).toEqual(['surgery-graph readouts: each name once'])
    expect(bad({ code: 'gross', mode: 'l' }, { readouts: ['u'] })).toEqual(["surgery-graph readouts: 'u' = Vq + E + kept counts the whole graph; it needs mode 'full'"])
    expect(bad({ code: 'gross', mode: 'r' }, { readouts: ['V', 'kept'] })).toEqual([])
  })
  it('the gauge source keeps its checks and its messages; the new readout names are not its own', () => {
    const g: SurgeryGraphState = { kind: 'surgery-graph', gauge: { host: 'patches3-xx', rungs: 3 } }
    expect(validateSurgeryGraphStage(g)).toEqual([])
    expect(validateSurgeryGraphStage({ ...g, readouts: ['kept'] })[0]).toMatch(/^surgery-graph readouts: a list of 'V', 'E', 'cycles', 'cheeger'/)
    expect(validateSurgeryGraphStage({ ...g, readouts: ['u'] })[0]).toMatch(/^surgery-graph readouts: a list of 'V', 'E'/)
    expect(validateSurgeryGraphStage({ kind: 'surgery-graph', gauge: { host: 'lpu-gross' as never } })).toEqual([`surgery-graph gauge.host: one of 'patch3-x', 'patches3-xx', 'patch3-steane', 'seam3'`])
    const r = resolve(g, 1) as ResolvedSurgeryGraph
    expect(r.source).toBe('gauge')
    expect(r.V).toBe(6)
  })
})

describe('surgery-graph lpu source: interpolation', () => {
  it('everything switches at the half-way point, also between the two sources', () => {
    const a = resolve(S({ code: 'gross', mode: 'full' }), 1)
    const b = resolve(S({ code: 'two-gross', mode: 'full', measure: 'Y1' }), 1)
    const g = resolve({ kind: 'surgery-graph', gauge: { host: 'seam3' } }, 1)
    expect(interpolate(a, b, 0)).toBe(a)
    expect(interpolate(a, b, 0.49)).toBe(a)
    expect(interpolate(a, b, 0.5)).toBe(b)
    expect(interpolate(a, b, 1)).toBe(b)
    expect(interpolate(a, g, 0.3)).toBe(a)
    expect(interpolate(g, a, 0.7)).toBe(a)
    expect(() => draw(interpolate(a, b, 0.6) as ResolvedLpuGraph, 'print', 320, 300)).not.toThrow()
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
    const text = m[2].replace(/<[^>]*>/g, '').replace(/&#x27;/g, "'").replace(/&amp;/g, '&')
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

const CASES: SurgeryGraphState[] = [
  S({ code: 'gross', mode: 'full', measure: 'X1' }, { readouts: ALL }),
  S({ code: 'two-gross', mode: 'full', measure: 'Y7' }, { readouts: ['V', 'u'] }),
  S({ code: 'gross', mode: 'l', measure: 'Z7' }, { readouts: ['V', 'E', 'cycles', 'kept'] }),
  S({ code: 'gross', mode: 'r' }),
  S({ code: 'two-gross', mode: 'l', measure: 'X1' }, { readouts: ['E'] }),
  S({ code: 'two-gross', mode: 'full', measure: 'Z1' }, {}),
  S({ code: 'gross', mode: 'full' }, { readouts: ['kept'] }),
]

describe('surgery-graph lpu source: the scene', () => {
  it('draws in the live stage, the reading version and the print figure with no NaN, and names every dot and link', () => {
    for (const st of CASES)
      for (const [mode, w, h, bare, slot] of BOXES) {
        const r = resolve(st, 1) as ResolvedLpuGraph
        const html = draw(r, mode, w, h, bare, slot)
        const where = `${r.code} ${r.mode} ${r.measure} ${mode} ${w}x${h} ${slot}`
        expect(html, where).not.toMatch(/NaN|Infinity|undefined/)
        expect(html).toContain('data-kind="surgery-graph"')
        expect(html).toContain('data-source="lpu"')
        expect(html).toContain('data-anchor="vertex"')
        expect(html).toContain('data-anchor="edge"')
        const count = (re: RegExp) => (html.match(re) ?? []).length
        expect(count(/data-vertex="/g), `${where}: dots`).toBe(r.V)
        expect(count(/data-edge="/g), `${where}: links`).toBe(r.E)
        expect(count(/data-kind="bridge"/g), `${where}: bridge links`).toBe(r.bridge)
        expect(count(/data-kind="extra"/g), where).toBe(r.edges.filter((e) => e.kind === 'extra').length)
        expect(count(/data-bell="1"/g), `${where}: the double dot`).toBe(r.mode === 'full' ? 1 : 0)
        expect(html.includes('>v_Bell<'), where).toBe(r.mode === 'full')
        // every plain dot shows its number
        for (const v of r.vertices.filter((x) => x.half !== 'bell')) expect(html, `${where}: dot ${v.label}`).toContain(`>${v.label}<`)
        expect(count(/aria-label="[^"]*(dot|v_Bell)[^"]*"/g), `${where}: names`).toBeGreaterThanOrEqual(r.V + r.E)
        if (r.caption) expect(html, where).toContain(r.caption)
        else expect(html).not.toContain('measures')
        if (r.mode === 'full') {
          expect(html).toContain('bridge link')
          expect(html).toContain('two check qubits')
        }
      }
  })
  it('the bridge links and the added links are drawn in their own strokes; the half graphs’ links in the plain one', () => {
    const html = draw(R({ code: 'two-gross', mode: 'full' }), 'print', 320, 300)
    expect((html.match(/<line [^>]*class="fg-plus"[^>]*stroke-width="2\.4"/g) ?? []).length).toBe(17)
    expect((html.match(/<line [^>]*class="fg-state"[^>]*stroke-dasharray="4 3"/g) ?? []).length).toBe(4)
    expect((html.match(/<line [^>]*class="fg-state"[^>]*stroke-width="1\.3"/g) ?? []).length).toBe(81 - 17)
  })
  it('the two circles sit side by side with the shared dot between them; the i-th dots of the halves face each other (a bridge is level)', () => {
    const r = R({ code: 'gross', mode: 'full' })
    const g = lpuGeometry(r, 640, 560, false)
    expect(g.circles).toHaveLength(2)
    const bell = r.vertices.find((v) => v.half === 'bell')!
    const b = g.at(bell.id)
    expect(b.x).toBeGreaterThan(g.circles[0].cx + g.circles[0].R)
    expect(b.x).toBeLessThan(g.circles[1].cx - g.circles[1].R)
    for (const e of r.edges.filter((x) => x.kind === 'bridge')) expect(g.at(e.a).y).toBeCloseTo(g.at(e.b).y, 9)
    expect(lpuGeometry(R({ code: 'gross', mode: 'l' }), 640, 560, false).circles).toHaveLength(1)
  })
  it('packs inside the box: every dot clear of the text lines, the caption and the legend, no two dots touching', () => {
    for (const st of CASES)
      for (const [mode, w, h, bare, slot] of BOXES) {
        const r = resolve(st, 1) as ResolvedLpuGraph
        const g = lpuGeometry(r, w, h, mode === 'print' || bare, slot)
        const where = `${r.code} ${r.mode} ${mode} ${w}x${h} ${slot}`
        const dots = r.vertices.map((v) => ({ ...g.at(v.id), bell: v.half === 'bell' }))
        for (const p of dots) {
          const rr = p.bell ? g.rad * 1.5 : g.rad
          expect(p.x - rr, where).toBeGreaterThanOrEqual(g.area.x - 1)
          expect(p.x + rr, where).toBeLessThanOrEqual(g.area.x + g.area.w + 1)
          expect(p.y - rr, where).toBeGreaterThanOrEqual(g.area.y)
          expect(p.y + rr, where).toBeLessThanOrEqual((g.foot.length ? g.footY : g.legendY) - 6)
        }
        let minGap = Infinity
        for (let i = 0; i < dots.length; i++) for (let j = i + 1; j < dots.length; j++) minGap = Math.min(minGap, Math.hypot(dots[i].x - dots[j].x, dots[i].y - dots[j].y) - 2 * g.rad)
        expect(minGap, `${where}: two dots touch`).toBeGreaterThan(0.5)
        if (g.lines.length) expect(6 + 13 * g.lines.length, where).toBeLessThanOrEqual(g.area.y + 1)
        expect(g.area.y + g.area.h, where).toBeLessThanOrEqual(h)
      }
  })
  it('no two text labels overlap, in any box, and none leaves it', () => {
    for (const st of CASES)
      for (const [mode, w, h, bare, slot] of BOXES) {
        const r = resolve(st, 1) as ResolvedLpuGraph
        const t = textBoxes(draw(r, mode, w, h, bare, slot))
        const where = `${r.code} ${r.mode} ${r.measure} ${mode} ${w}x${h} ${slot}`
        for (let i = 0; i < t.length; i++) for (let j = i + 1; j < t.length; j++) expect(clash(t[i], t[j]), `${where}: "${t[i].text}" and "${t[j].text}"`).toBe(false)
        for (const b of t) {
          expect(b.x0, `${where}: ${b.text}`).toBeGreaterThanOrEqual(-1)
          expect(b.x1, `${where}: ${b.text}`).toBeLessThanOrEqual(w + 1)
        }
      }
  })
  it('the print figure is 320 × 300 and carries the readouts and the caption as text', () => {
    const html = renderToString(<FigureFor layout={CASES[0]} number="P1.3" />)
    expect(html).toContain('viewBox="0 0 320 300"')
    expect(html).toContain('<title>Fig. P1.3: LPU GRAPH · ancilla qubits</title>')
    expect(html).toContain('u = 24+47+19 = 90')
    expect(html).toContain('measures X̄1 with the left half')
    expect(html).toContain('svgk-print')
    expect(html).not.toMatch(/NaN|Infinity|undefined|no print drawing yet/)
  })
  it('the lpu scene alone (the component the kind’s scene hands an lpu source to) draws the same markup', () => {
    const r = R({ code: 'gross', mode: 'full', measure: 'Y1' }, { readouts: ['V'] })
    const direct = renderToString(
      <svg viewBox="0 0 320 300">
        <SurgeryLpuScene state={r} mode="print" width={320} height={300} />
      </svg>,
    )
    expect(direct).toBe(draw(r, 'print', 320, 300))
    expect(firstNonFinite(r)).toBeNull()
  })
})
