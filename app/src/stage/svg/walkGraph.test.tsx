/**
 * `walk-graph` (SVG; Chapter Q19, P-Q19-story §9.2 S1): the star and ring graphs of the scattering walk. Content writes only inputs (the graph, the walker's step,
 * start and sign, the cut string, the readouts); the resolver takes every chance and cut from physics/qc/walk.ts and variational.ts. These tests check the resolved
 * numbers against direct engine calls and the plan's numbers, the validation messages, interpolation, the readout text, and that the one scene keeps its vertices and
 * labels inside the box (all three modes, every pane slot) and draws no NaN.
 */
import { renderToString } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { fidelityOf } from '../../content/fidelity'
import type { WalkGraphState } from '../../content/stage'
import { KIND_RENDER, PASSPORT, STAGE_KINDS_709, passportOf } from '../../content/stage'
import { ANCHORS, SHOTS } from '../../content/stageVocab'
import { cutValue, ringEdges } from '../../physics/qc/variational'
import { extraWalkChances, starSpokeChances, starWalkMarked } from '../../physics/qc/walk'
import { FIGURE_KINDS, FigureFor } from '../figures/FigureFor'
import { interpolate } from '../interp'
import { resolve, validateStage } from '../resolve'
import { svgKindDef } from '../svgKinds'
import type { ResolvedWalkGraph } from '../types'
import { WalkGraphScene, ringPoint, starPoint, walkGraphLayout } from './WalkGraphScene'
import { walkGraphReadouts } from './walkGraph'
import './kinds'

type G = WalkGraphState['graph']
const S = (graph: G, o: Omit<WalkGraphState, 'kind' | 'graph'> = {}): WalkGraphState => ({ kind: 'walk-graph', graph, ...o })
const star = (N: number, o: { marked?: number; extra?: [number, number] } = {}): G => ({ star: { N, ...o } })
const ring = (n: number): G => ({ ring: { n } })
const R = (st: WalkGraphState, s = 1) => resolve(st, s) as ResolvedWalkGraph
const close = (a: number, b: number, eps = 1e-9) => expect(Math.abs(a - b), `${a} vs ${b}`).toBeLessThan(eps)
const problems = (st: unknown): string[] => validateStage(st as WalkGraphState)

describe('walk-graph: the SVG route, the passport and the vocabulary', () => {
  it('is an SVG kind registered by the lazy module, with its own passport, drawer, shots and anchors', () => {
    expect(KIND_RENDER['walk-graph']).toBe('svg')
    expect(STAGE_KINDS_709).toContain('walk-graph')
    expect(FIGURE_KINDS).toContain('walk-graph')
    expect(svgKindDef('walk-graph')).toBeDefined()
    expect(svgKindDef('walk-graph')!.print).toEqual({ w: 320, h: 300 })
    expect(PASSPORT['walk-graph']).toMatchObject({ title: 'WALK GRAPH · edge chances', fidelityKey: 'walk-graph' })
    expect(passportOf(S(star(8)))).toBe(PASSPORT['walk-graph'])
    const f = fidelityOf('walk-graph')
    expect(f.exact.map((n) => n.id)).toEqual(['qc-walk-graph-chances'])
    expect(f.schematic.map((n) => n.id)).toEqual(['qc-walk-graph-layout'])
    expect(f.misleading.map((n) => n.id)).toEqual(['qc-walk-graph-width'])
    expect(SHOTS['walk-graph']).toEqual(['WG-STAR', 'WG-RING'])
    expect(ANCHORS['walk-graph']).toEqual(['vertex', 'spoke', 'extra', 'cut'])
  })
})

describe('walk-graph: the resolved numbers are the engine’s', () => {
  it('a marked star at N = 8: the chance on spoke 1 after 0, 2, 4 steps is 1/8, 0.781, 0.9453; the spokes add to 1', () => {
    for (const [step, p] of [[0, 0.125], [2, 0.78125], [4, 0.9453125]] as const) {
      const r = R(S(star(8, { marked: 1 }), { walker: { step } }))
      close(r.markedChance!, p, 1e-12)
      close(r.spokes[0], starWalkMarked(8, step), 1e-12)
      close(r.spokes.reduce((a, b) => a + b, 0), 1, 1e-12)
      expect(r.extraChance).toBeNull()
      expect(r.nearChance).toBeNull()
    }
    expect(R(S(star(8, { marked: 5 }), { walker: { step: 4 } })).markedChance).toBeCloseTo(0.9453125, 12)
    expect(R(S(star(16, { marked: 1 }), { walker: { step: 6 } })).markedChance).toBeCloseTo(0.9613, 4)
  })
  it('the arriving start gives the same peak (0.9453) one step later (step 5) and a different first picture', () => {
    const o = R(S(star(8, { marked: 1 }), { walker: { step: 0 } }))
    const i = R(S(star(8, { marked: 1 }), { walker: { step: 0, start: 'in' } }))
    expect(o.start).toBe('out')
    expect(i.start).toBe('in')
    close(o.markedChance!, 0.125, 1e-12)
    close(i.markedChance!, 0.125, 1e-12)
    close(R(S(star(8, { marked: 1 }), { walker: { step: 5, start: 'in' } })).markedChance!, 0.9453125, 1e-12)
    close(R(S(star(8, { marked: 1 }), { walker: { step: 4, start: 'in' } })).markedChance!, 0.78125, 1e-12)
    expect(R(S(star(8, { marked: 1 }), { walker: { step: 2, start: 'in' } })).spokes).not.toEqual(R(S(star(8, { marked: 1 }), { walker: { step: 2 } })).spokes)
  })
  it('an extra edge at N = 8, step 3: 0.625 on spokes 1, 2 and 0.28125 on the edge; the + start fails at N = 64', () => {
    const r = R(S(star(8, { extra: [1, 2] }), { walker: { step: 3 } }))
    close(r.nearChance!, 0.625, 1e-12)
    close(r.extraChance!, extraWalkChances(8, 3).edge, 1e-12)
    close(r.spokes.reduce((a, b) => a + b, 0) + r.extraChance!, 1, 1e-12)
    expect(r.sign).toBe(-1)
    const big = R(S(star(16, { extra: [1, 2] }), { walker: { step: 40, sign: 1 } }))
    expect(big.sign).toBe(1)
    expect(big.nearChance!).toBeLessThan(0.5)
    close(R(S(star(8, { extra: [3, 7] }), { walker: { step: 3 } })).nearChance!, starSpokeChances(8, { extra: [3, 7] }, 3).spokes[2] + starSpokeChances(8, { extra: [3, 7] }, 3).spokes[6], 1e-12)
  })
  it('a ring: the cut of 0101 is 4 of the best 4, every side cut; 0011 cuts 2; no string, no cut', () => {
    const r = R(S(ring(4), { cut: '0101' }))
    expect(r.ring).toMatchObject({ bits: '0101', cut: 4, best: 4, cutEdges: [true, true, true, true] })
    expect(r.ring!.edges).toEqual([[0, 1], [1, 2], [2, 3], [3, 0]])
    expect(R(S(ring(4), { cut: '0011' })).ring!.cut).toBe(cutValue('0011', ringEdges(4)))
    expect(R(S(ring(4), { cut: '0011' })).ring!.cutEdges).toEqual([false, true, false, true])
    expect(R(S(ring(5), { cut: '01010' })).ring!.best).toBe(4)
    const none = R(S(ring(4)))
    expect(none.ring).toMatchObject({ bits: null, cut: null, best: 4, cutEdges: [false, false, false, false] })
    expect(none.spokes).toEqual([])
  })
  it('a plain star has no walker numbers', () => {
    const r = R(S(star(8)))
    expect(r.spokes).toEqual([])
    expect(r.step).toBeNull()
    expect(r.markedChance).toBeNull()
  })
  it('defaults: labels (and chances with a walker); the natural readouts', () => {
    expect(R(S(star(8))).show).toEqual(['labels'])
    expect(R(S(star(8, { marked: 1 }), { walker: { step: 2 } })).show).toEqual(['labels', 'chances'])
    expect(R(S(star(8, { marked: 1 }), { walker: { step: 2 } })).readouts).toEqual(['step', 'marked'])
    expect(R(S(star(8, { extra: [1, 2] }), { walker: { step: 2 } })).readouts).toEqual(['step', 'near', 'edge'])
    expect(R(S(ring(4), { cut: '0101' })).readouts).toEqual(['cut'])
    expect(R(S(ring(4))).readouts).toEqual([])
    expect(R(S(star(8, { marked: 1 }), { walker: { step: 2 }, readouts: [], show: ['chances'] })).readouts).toEqual([])
    expect(R(S(star(8, { marked: 1 }), { walker: { step: 2 }, show: ['chances'] })).show).toEqual(['chances'])
  })
})

describe('walk-graph: validation messages name the field', () => {
  it('accepts every stated form', () => {
    for (const st of [S(star(3)), S(star(16, { marked: 16 }), { walker: { step: 40 } }), S(star(8, { extra: [1, 2] }), { walker: { step: 0, sign: 1 } }), S(ring(3)), S(ring(8), { cut: '01010101' })])
      expect(problems(st), JSON.stringify(st)).toEqual([])
  })
  it('refuses a bad graph', () => {
    expect(problems(S({ star: { N: 8 }, ring: { n: 4 } } as unknown as G)).join()).toContain('exactly one of star and ring')
    expect(problems(S({} as unknown as G)).join()).toContain('exactly one of star and ring')
    expect(problems(S(star(2))).join()).toContain('graph.star.N')
    expect(problems(S(star(17))).join()).toContain('graph.star.N')
    expect(problems(S(star(8, { marked: 9 }))).join()).toContain('graph.star.marked')
    expect(problems(S(star(8, { extra: [1, 1] }))).join()).toContain('graph.star.extra')
    expect(problems(S(star(8, { extra: [1, 9] }))).join()).toContain('graph.star.extra')
    expect(problems(S(star(8, { marked: 1, extra: [1, 2] }))).join()).toContain('marked and extra do not go together')
    expect(problems(S(ring(2))).join()).toContain('graph.ring.n')
    expect(problems(S(ring(9))).join()).toContain('graph.ring.n')
    expect(problems(S({ star: { N: 8, bogus: 1 } } as unknown as G)).join()).toContain('unknown field "bogus"')
  })
  it('refuses a walker without something hidden, and the start and sign on the wrong star', () => {
    expect(problems(S(star(8), { walker: { step: 1 } })).join()).toContain('needs a star with a marked spoke or an extra edge')
    expect(problems(S(ring(4), { walker: { step: 1 } })).join()).toContain('needs a star with a marked spoke or an extra edge')
    expect(problems(S(star(8, { marked: 1 }), { walker: { step: 41 } })).join()).toContain('walker.step')
    expect(problems(S(star(8, { marked: 1 }), { walker: { step: 1.5 } })).join()).toContain('walker.step')
    expect(problems(S(star(8, { marked: 1 }), { walker: { step: 1, sign: 1 } })).join()).toContain('walker.sign: only with an extra edge')
    expect(problems(S(star(8, { extra: [1, 2] }), { walker: { step: 1, start: 'in' } })).join()).toContain('walker.start: only with a marked spoke')
    expect(problems(S(star(8, { marked: 1 }), { walker: { step: 1, start: 'up' as 'in' } })).join()).toContain("walker.start: 'out' or 'in'")
  })
  it('refuses a cut that is not a ring’s, and bad shows and readouts', () => {
    expect(problems(S(star(8), { cut: '0101' })).join()).toContain('cut: only with a ring')
    expect(problems(S(ring(4), { cut: '010' })).join()).toContain('cut: a string of 4 bits')
    expect(problems(S(ring(4), { cut: '01a1' })).join()).toContain('cut: a string of 4 bits')
    expect(problems(S(star(8), { show: ['chances'] })).join()).toContain("'chances' needs a walker")
    expect(problems(S(star(8), { show: ['bogus' as 'labels'] })).join()).toContain('show: unknown')
    expect(problems(S(star(8, { marked: 1 }), { walker: { step: 1 }, readouts: ['step', 'step'] })).join()).toContain('each once')
    expect(problems(S(star(8, { extra: [1, 2] }), { walker: { step: 1 }, readouts: ['step', 'near', 'edge', 'marked'] })).join()).toContain('at most 3')
    expect(problems(S(star(8), { readouts: ['step'] })).join()).toContain("'step' needs a walker")
    expect(problems(S(star(8, { marked: 1 }), { walker: { step: 1 }, readouts: ['near'] })).join()).toContain("'near' and 'edge' need")
    expect(problems(S(star(8, { extra: [1, 2] }), { walker: { step: 1 }, readouts: ['marked'] })).join()).toContain("'marked' needs")
    expect(problems(S(ring(4), { readouts: ['cut'] })).join()).toContain("'cut' needs a ring with a cut string")
    expect(problems(S(star(8, { marked: 1 }), { walker: { step: 1 }, shot: 'WG-BOGUS' as 'WG-STAR' })).length).toBeGreaterThan(0)
    expect(problems({ kind: 'walk-graph', graph: null })).not.toEqual([])
  })
})

describe('walk-graph: interpolation and text', () => {
  const mk = (step: number) => R(S(star(8, { marked: 1 }), { walker: { step } }))
  it('a change of step cross-fades the widths; the ends are the resolved states themselves', () => {
    const a = mk(2)
    const b = mk(4)
    expect(interpolate(a, b, 0)).toBe(a)
    expect(interpolate(a, b, 1)).toBe(b)
    const mid = interpolate(a, b, 0.5) as ResolvedWalkGraph
    close(mid.spokes[0], (a.spokes[0] + b.spokes[0]) / 2, 1e-12)
    close(mid.markedChance!, (a.markedChance! + b.markedChance!) / 2, 1e-12)
    close(mid.spokes.reduce((x, y) => x + y, 0), 1, 1e-12)
    expect((interpolate(a, b, 0.25) as ResolvedWalkGraph).step).toBe(2)
    expect((interpolate(a, b, 0.75) as ResolvedWalkGraph).step).toBe(4)
  })
  it('a change of graph switches at the half-way point; a walker appearing switches too', () => {
    const a = mk(2)
    const b = R(S(star(16, { marked: 1 }), { walker: { step: 2 } }))
    expect((interpolate(a, b, 0.25) as ResolvedWalkGraph).N).toBe(8)
    expect((interpolate(a, b, 0.75) as ResolvedWalkGraph).N).toBe(16)
    const none = R(S(star(8, { marked: 1 })))
    expect((interpolate(none, a, 0.25) as ResolvedWalkGraph).spokes).toEqual([])
    expect((interpolate(none, a, 0.75) as ResolvedWalkGraph).spokes).toHaveLength(8)
    const r1 = R(S(ring(4), { cut: '0101' }))
    const r2 = R(S(ring(4), { cut: '0011' }))
    expect((interpolate(r1, r2, 0.25) as ResolvedWalkGraph).ring!.bits).toBe('0101')
    expect((interpolate(r1, r2, 0.75) as ResolvedWalkGraph).ring!.bits).toBe('0011')
  })
  it('writes the readouts the way the page quotes them', () => {
    const t = (st: WalkGraphState) => walkGraphReadouts(R(st)).map((x) => x.text)
    expect(t(S(star(8, { marked: 1 }), { walker: { step: 4 } }))).toEqual(['step 4', 'marked spoke 94.5 %'])
    expect(t(S(star(8, { extra: [1, 2] }), { walker: { step: 3 } }))).toEqual(['step 3', 'spokes 1, 2: 62.5 %', 'extra edge 28.1 %'])
    expect(t(S(ring(4), { cut: '0101' }))).toEqual(['cut 4 of 4 sides (0101)'])
    expect(t(S(star(8)))).toEqual([])
    expect(walkGraphReadouts(R(S(star(8, { marked: 1 }), { walker: { step: 4 } }))).map((x) => x.name)).toEqual(['step', 'marked'])
  })
})

describe('walk-graph: the scene stays in its box and draws no NaN', () => {
  const states: WalkGraphState[] = [
    S(star(8)),
    S(star(3, { marked: 2 }), { walker: { step: 1 } }),
    S(star(8, { marked: 1 }), { walker: { step: 4 } }),
    S(star(16, { marked: 7 }), { walker: { step: 6, start: 'in' } }),
    S(star(8, { extra: [1, 2] }), { walker: { step: 3 }, readouts: ['step', 'near', 'edge'] }),
    S(star(16, { extra: [15, 16] }), { walker: { step: 12, sign: 1 } }),
    S(ring(3)),
    S(ring(4), { cut: '0101' }),
    S(ring(8), { cut: '01100110' }),
  ]
  it.each(states.map((st, i) => ({ i, st })))('state $i: vertices and labels inside the box, all modes and slots', ({ st }) => {
    const r = R(st)
    for (const [w, h, own, slot] of [[460, 560, false, null], [460, 560, false, 'top'], [460, 560, false, 'bottom'], [300, 420, false, null], [320, 300, true, null]] as const) {
      const L = walkGraphLayout(r, w, h, own, slot)
      expect(L.area.x).toBeGreaterThanOrEqual(0)
      expect(L.area.x + L.area.w).toBeLessThanOrEqual(w + 1e-9)
      expect(L.area.y + L.area.h).toBeLessThanOrEqual(h + 1e-9)
      expect(L.R).toBeGreaterThan(20)
      for (let k = 0; k < r.N; k++) {
        const p = r.topology === 'star' ? starPoint(k + 1, r.N, L.cx, L.cy, L.R) : ringPoint(k, r.N, L.cx, L.cy, L.R)
        // the vertex plus its label (about 28 px out) stays in the drawing area
        expect(p.x - 28, `x ${k}`).toBeGreaterThanOrEqual(L.area.x - 1e-9)
        expect(p.x + 28, `x ${k}`).toBeLessThanOrEqual(L.area.x + L.area.w + 1e-9)
        expect(p.y - 28, `y ${k}`).toBeGreaterThanOrEqual(L.area.y - 1e-9)
        expect(p.y + 28, `y ${k}`).toBeLessThanOrEqual(L.area.y + L.area.h + 1e-9)
      }
      // the figure's own text lines sit above the drawing area
      expect(own ? 16 + 13 * (L.lines.length - 1) : 0).toBeLessThan(L.area.y)
      const html = renderToString(<svg><WalkGraphScene state={r} mode={own ? 'print' : 'stage'} width={w} height={h} slot={slot} /></svg>)
      expect(html).not.toMatch(/NaN|undefined|Infinity/)
      expect(html).toContain('data-kind="walk-graph"')
    }
  })
  it('outer vertices are at least 28 px apart on the circle (N = 16, the print box): their labels cannot collide', () => {
    const r = R(S(star(16, { marked: 1 }), { walker: { step: 6 } }))
    const L = walkGraphLayout(r, 320, 300, true)
    const a = starPoint(1, 16, L.cx, L.cy, L.R)
    const b = starPoint(2, 16, L.cx, L.cy, L.R)
    expect(Math.hypot(a.x - b.x, a.y - b.y)).toBeGreaterThan(28)
  })
  it('the marked vertex is ringed, the extra edge is a chord, a cut side is thick, and every piece has an accessible name', () => {
    const m = renderToString(<svg><WalkGraphScene state={R(S(star(8, { marked: 3 }), { walker: { step: 4 } }))} mode="print" width={320} height={300} /></svg>)
    expect(m).toContain('vertex 3 (marked)')
    expect(m).toContain('spoke 3: 94.5 %')
    expect(m).toContain('spoke 1: 0.8 %')
    const e = renderToString(<svg><WalkGraphScene state={R(S(star(8, { extra: [1, 2] }), { walker: { step: 3 } }))} mode="print" width={320} height={300} /></svg>)
    expect(e).toContain('extra edge 1-2: 28.1 %')
    const g = renderToString(<svg><WalkGraphScene state={R(S(ring(4), { cut: '0101' }))} mode="print" width={320} height={300} /></svg>)
    expect(g).toContain('side 0-1: cut')
    expect(g).toContain('vertex 1: team 1')
    const g2 = renderToString(<svg><WalkGraphScene state={R(S(ring(4), { cut: '0011' }))} mode="print" width={320} height={300} /></svg>)
    expect(g2).toContain('side 0-1: not cut')
  })
  it('the print figure is the stage picture: FigureFor draws it in print ink', () => {
    const html = renderToString(<FigureFor layout={S(star(8, { marked: 1 }), { walker: { step: 4 } })} number="Q19.4" caption="the walker at step 4" />)
    expect(html).toContain('data-kind="walk-graph"')
    expect(html).toContain('marked spoke 94.5 %')
    const r = renderToString(<FigureFor layout={S(ring(4), { cut: '0101' })} number="Q19.5" />)
    expect(r).toContain('cut 4 of 4 sides')
  })
})
