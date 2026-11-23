/**
 * `timeline` (SVG; GANDALF platform G2, P-P2-story §9.2 and P-B6-story §9.2): ordered boxes on a time axis, one lane per row. Content (or a recipe from physics/qec/timing.ts) writes the boxes;
 * the resolver derives each row's end, each schedule's total, the axis span and the saving. These tests check the registration, the derived totals against the engine's, the validation (unknown
 * fields refused by name; `move` and `reset` boxes accepted), interpolation, the readout text, and that the scene keeps its lanes inside the box (all modes and slots) and draws no NaN.
 */
import { renderToString } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { fidelityOf } from '../../content/fidelity'
import type { TimelineState } from '../../content/stage'
import { KIND_RENDER, PASSPORT, STAGE_KINDS_709, passportOf } from '../../content/stage'
import { ANCHORS, SHOTS } from '../../content/stageVocab'
import { pipelinedTotal, unpipelinedTotal } from '../../physics/qec/timing'
import { FIGURE_KINDS, FigureFor } from '../figures/FigureFor'
import { interpolate } from '../interp'
import { resolve, validateStage } from '../resolve'
import { svgKindDef } from '../svgKinds'
import type { ResolvedTimeline } from '../types'
import { TimelineScene, timelineLayout, timelineTicks } from './TimelineScene'
import { timelineReadouts } from './timeline'
import './kinds'

type Seg = TimelineState['rows'][number]['segments'][number]
/** The schedule of d rounds with gates g, acquisition r and classification c, as the pages' segment builders will lay it out (here a test helper): two groups, serial and overlapped. */
function schedule(d: number, g: number, r: number, c: number): TimelineState {
  const serial: Seg[] = []
  let t = 0
  for (let k = 0; k < d; k++) {
    serial.push({ kind: 'gate', from: t, to: t + g }, { kind: 'acquire', from: t + g, to: t + g + r }, { kind: 'classify', from: t + g + r, to: t + g + r + c })
    t += g + r + c
  }
  const front: Seg[] = []
  const cls: Seg[] = []
  let a = 0
  let ce = 0
  for (let k = 0; k < d; k++) {
    front.push({ kind: 'gate', from: a, to: a + g }, { kind: 'acquire', from: a + g, to: a + g + r })
    a += g + r
    const s = Math.max(ce, a)
    cls.push({ kind: 'classify', from: s, to: s + c })
    ce = s + c
  }
  return { kind: 'timeline', rows: [{ label: 'unpipelined', segments: serial }, { label: 'gates and reads', group: 'pipelined', segments: front }, { label: 'classifier', group: 'pipelined', segments: cls }], readouts: ['total', 'saving'] }
}
const R = (st: TimelineState) => resolve(st, 1) as ResolvedTimeline
const problems = (st: unknown): string[] => validateStage(st as TimelineState)
const simple = (o: Partial<TimelineState> = {}): TimelineState => ({ kind: 'timeline', rows: [{ label: 'one', segments: [{ kind: 'gate', from: 0, to: 1 }, { kind: 'move', from: 1, to: 2.5 }, { kind: 'reset', from: 2.5, to: 3 }] }], ...o })

describe('timeline: the SVG route, the passport and the vocabulary', () => {
  it('is an SVG kind registered by the lazy module, with its own passport, drawer, shots and anchors', () => {
    expect(KIND_RENDER.timeline).toBe('svg')
    expect(STAGE_KINDS_709).toContain('timeline')
    expect(FIGURE_KINDS).toContain('timeline')
    expect(svgKindDef('timeline')!.print).toEqual({ w: 320, h: 220 })
    expect(PASSPORT.timeline).toMatchObject({ title: 'TIMELINE · boxes on a time axis', fidelityKey: 'timeline' })
    expect(passportOf(simple())).toBe(PASSPORT.timeline)
    const f = fidelityOf('timeline')
    expect(f.exact.map((n) => n.id)).toEqual(['timeline-boxes'])
    expect(f.schematic.map((n) => n.id)).toEqual(['timeline-lanes'])
    expect(f.misleading.map((n) => n.id)).toEqual(['timeline-overlap'])
    expect(SHOTS.timeline).toEqual(['TL-LANES'])
    expect(ANCHORS.timeline).toEqual(['lane', 'box', 'mark', 'total'])
  })
})

describe('timeline: the derived totals are the engine’s', () => {
  it('the serial and overlapped schedules of d = 11, g = 0.02, r = 2, c = 0.5 end at 27.72 and 22.72, saving 5.00 (the timing engine’s totals)', () => {
    const r = R(schedule(11, 0.02, 2, 0.5))
    expect(r.schedules.map((s) => s.name)).toEqual(['unpipelined', 'pipelined'])
    expect(r.schedules[0].end).toBeCloseTo(unpipelinedTotal(11, 0.02, 2, 0.5), 12)
    expect(r.schedules[1].end).toBeCloseTo(pipelinedTotal(11, 0.02, 2, 0.5), 12)
    expect(r.schedules[0].end).toBeCloseTo(27.72, 12)
    expect(r.schedules[1].end).toBeCloseTo(22.72, 12)
    expect(r.span).toBeCloseTo(27.72, 12)
    expect(r.rows[2].end).toBeCloseTo(22.72, 12)
    expect(r.rows[1].end).toBeCloseTo(11 * 2.02, 12)
    expect(timelineReadouts(r).map((x) => x.text)).toEqual(['unpipelined: 27.72 ms', 'pipelined: 22.72 ms', 'unpipelined − pipelined: 5 ms (18 %)'])
  })
  it('a slow classifier: the classifier lane is the bottleneck, ending at (g + r) + d c', () => {
    const r = R(schedule(11, 0.02, 0.3, 0.5))
    expect(r.schedules[1].end).toBeCloseTo(0.32 + 11 * 0.5, 12)
    expect(r.schedules[1].end).toBeCloseTo(5.82, 12)
  })
  it('a mark beyond the last box stretches the axis; a lone row is its own schedule', () => {
    const r = R(simple({ marks: [{ at: 4, label: 'limit' }] }))
    expect(r.span).toBe(4)
    expect(r.schedules).toEqual([{ name: 'one', end: 3 }])
    expect(timelineReadouts(r).map((x) => x.text)).toEqual(['one: 3 ms'])
    expect(timelineReadouts(R(simple({ unit: 's' }))).map((x) => x.text)).toEqual(['one: 3 s'])
  })
})

describe('timeline: validation names the problem', () => {
  it('accepts every box kind, including B6’s move and reset, and the lanes of a schedule', () => {
    expect(problems(simple())).toEqual([])
    expect(problems(schedule(4, 0.02, 1, 0.3))).toEqual([])
    expect(problems(simple({ unit: 'µs', marks: [{ at: 1, label: 'cut' }], readouts: ['total'] }))).toEqual([])
    for (const kind of ['gate', 'move', 'acquire', 'reset', 'classify', 'denoise'] as const) expect(problems({ kind: 'timeline', rows: [{ label: 'x', segments: [{ kind, from: 0, to: 1, label: 'b' }] }] })).toEqual([])
  })
  it('refuses an unknown field by name, at the top, in a row, in a box and in a mark', () => {
    expect(problems({ ...simple(), lanes: 2 }).join()).toContain('unknown field "lanes"')
    expect(problems({ kind: 'timeline', rows: [{ label: 'a', color: 'red', segments: [{ kind: 'gate', from: 0, to: 1 }] }] }).join()).toContain('unknown field "color"')
    expect(problems({ kind: 'timeline', rows: [{ label: 'a', segments: [{ kind: 'gate', from: 0, to: 1, height: 3 }] }] }).join()).toContain('unknown field "height"')
    expect(problems(simple({ marks: [{ at: 1, label: 'm', color: 'x' } as never] })).join()).toContain('unknown field "color"')
  })
  it('refuses a box kind that does not exist, overlapping or unordered boxes, empty and reversed boxes, too many rows or boxes', () => {
    expect(problems({ kind: 'timeline', rows: [{ label: 'a', segments: [{ kind: 'wait' as 'gate', from: 0, to: 1 }] }] }).join()).toContain('segments[0].kind')
    expect(problems({ kind: 'timeline', rows: [{ label: 'a', segments: [{ kind: 'gate', from: 0, to: 2 }, { kind: 'move', from: 1, to: 3 }] }] }).join()).toContain('do not overlap')
    expect(problems({ kind: 'timeline', rows: [{ label: 'a', segments: [{ kind: 'gate', from: 2, to: 1 }] }] }).join()).toContain('0 <= from < to')
    expect(problems({ kind: 'timeline', rows: [{ label: 'a', segments: [{ kind: 'gate', from: -1, to: 1 }] }] }).join()).toContain('0 <= from < to')
    expect(problems({ kind: 'timeline', rows: [{ label: 'a', segments: [] }] }).join()).toContain('one to 64 boxes')
    expect(problems({ kind: 'timeline', rows: [] }).join()).toContain('one to 8 rows')
    const many = Array.from({ length: 9 }, (_, i) => ({ label: `r${i}`, segments: [{ kind: 'gate' as const, from: 0, to: 1 }] }))
    expect(problems({ kind: 'timeline', rows: many }).join()).toContain('one to 8 rows')
    const heavy = Array.from({ length: 4 }, (_, i) => ({ label: `h${i}`, segments: Array.from({ length: 60 }, (_, k) => ({ kind: 'gate' as const, from: k, to: k + 0.5 })) }))
    expect(problems({ kind: 'timeline', rows: heavy }).join()).toContain('at most 200 boxes')
    expect(problems({ kind: 'timeline', rows: [{ label: 'a', segments: [{ kind: 'gate', from: 0, to: 1 }] }, { label: 'a', segments: [{ kind: 'gate', from: 0, to: 1 }] }] }).join()).toContain('its own label')
  })
  it('checks the unit, the readouts and the shot', () => {
    expect(problems(simple({ unit: 'h' as 'ms' })).join()).toContain('unit')
    expect(problems(simple({ readouts: ['saving'] })).join()).toContain('two schedules')
    expect(problems(simple({ readouts: ['total', 'total'] })).join()).toContain('each once')
    expect(problems(simple({ readouts: ['mean' as 'total'] })).join()).toContain('unknown "mean"')
    expect(problems(simple({ shot: 'TL-BOGUS' as 'TL-LANES' })).length).toBeGreaterThan(0)
    expect(problems(simple({ marks: Array.from({ length: 5 }, (_, i) => ({ at: i, label: 'm' })) })).join()).toContain('at most 4')
  })
})

describe('timeline: interpolation', () => {
  it('the same shape with other times cross-fades the box edges; a different shape switches at the half-way point; the ends are the resolved states', () => {
    const a = R(schedule(3, 0.02, 1, 0.3))
    const b = R(schedule(3, 0.02, 2, 0.3))
    expect(interpolate(a, b, 0)).toBe(a)
    expect(interpolate(a, b, 1)).toBe(b)
    const mid = interpolate(a, b, 0.5) as ResolvedTimeline
    expect(mid.schedules[0].end).toBeCloseTo((a.schedules[0].end + b.schedules[0].end) / 2, 12)
    const c = R(schedule(4, 0.02, 1, 0.3))
    expect(interpolate(a, c, 0.25)).toBe(a)
    expect(interpolate(a, c, 0.75)).toBe(c)
  })
})

describe('timeline: the scene stays in its box and draws no NaN', () => {
  const states: TimelineState[] = [
    simple(),
    schedule(3, 0.02, 1, 0.3),
    schedule(11, 0.02, 2, 0.5),
    simple({ marks: [{ at: 3.5, label: 'limit' }, { at: 0.2, label: 'start' }] }),
    { kind: 'timeline', rows: [{ label: 'all six', segments: (['gate', 'move', 'acquire', 'reset', 'classify', 'denoise'] as const).map((kind, i) => ({ kind, from: i, to: i + 1 })) }] },
  ]
  it.each(states.map((st, i) => ({ i, st })))('state $i: lanes and axis inside the box, all modes and slots', ({ st }) => {
    const r = R(st)
    for (const [w, h, own, slot] of [[460, 560, false, null], [460, 560, false, 'top'], [460, 560, false, 'bottom'], [300, 420, false, null], [320, 220, true, null]] as const) {
      const L = timelineLayout(r, w, h, own, slot)
      expect(L.x0).toBeGreaterThanOrEqual(0)
      expect(L.x1).toBeLessThanOrEqual(w + 1e-9)
      expect(L.laneTop + L.laneH * r.rows.length).toBeLessThanOrEqual(h + 1e-9)
      expect(L.axisY).toBeGreaterThan(L.laneTop)
      expect(own ? 16 + 13 * (L.lines.length - 1) : 0).toBeLessThan(L.laneTop)
      const html = renderToString(<svg><TimelineScene state={r} mode={own ? 'print' : 'stage'} width={w} height={h} slot={slot} /></svg>)
      expect(html).not.toMatch(/NaN|undefined|Infinity/)
      expect(html).toContain('data-kind="timeline"')
      expect((html.match(/data-anchor="box"/g) ?? []).length).toBe(r.rows.reduce((n, row) => n + row.segments.length, 0))
    }
  })
  it('names each lane and box, and draws a tick label at nice values', () => {
    const html = renderToString(<svg><TimelineScene state={R(simple())} mode="print" width={320} height={220} /></svg>)
    expect(html).toContain('one: 3 boxes, ending at 3 ms')
    expect(html).toContain('move: 1 to 2.5 ms')
    expect(html).toContain('one: 3 ms')
    expect(timelineTicks(27.72)[0]).toBe(0)
    expect(timelineTicks(27.72).every((t) => t <= 27.72)).toBe(true)
    expect(timelineTicks(3)).toEqual([0, 0.5, 1, 1.5, 2, 2.5, 3])
  })
  it('the print figure is the stage picture: FigureFor draws it in print ink with the totals', () => {
    const html = renderToString(<FigureFor layout={schedule(11, 0.02, 2, 0.5)} number="B6.1" caption="serial and overlapped" />)
    expect(html).toContain('data-kind="timeline"')
    expect(html).toContain('unpipelined: 27.72 ms')
    expect(html).toContain('pipelined: 22.72 ms')
  })
})
