/**
 * Papers B2, stage additions (P-B2-story §9.2): the `code` kind's `bb` and `bp` sources and the `plot` kind's points mode. Every fact on the picture comes from physics/qec
 * (bbfamily.ts, bp.ts); here the resolver is checked against the engine, validation against hostile input, and the scenes against NaN, collisions and the box.
 */
import { renderToString } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import type { CodeState, PlotPointsState } from '../../content/stage'
import { bbCodeOf, bbScheduleCheck } from '../../physics/qec/bbfamily'
import { minSumBP } from '../../physics/qec/bp'
import { toricCode } from '../../physics/qec/toric'
import { interpolate } from '../interp'
import { resolve, validateStage } from '../resolve'
import type { ResolvedCode, ResolvedPlot } from '../types'
import { codeReadouts } from './code'
import { CodeScene, codeGeometry } from './CodeScene'
import { plotReadouts } from './plot'
import { PlotScene } from './PlotScene'
import './kinds'

const C = (st: Omit<CodeState, 'kind'>): CodeState => ({ kind: 'code', ...st })
const R = (st: Omit<CodeState, 'kind'>) => resolve(C(st), 1) as ResolvedCode
const bad = (st: Omit<CodeState, 'kind'>): string[] => validateStage(C(st))
const draw = (r: ResolvedCode, mode: 'stage' | 'print', w: number, h: number, bare = false, slot: 'full' | 'top' | 'bottom' = 'full') =>
  renderToString(
    <svg viewBox={`0 0 ${w} ${h}`}>
      <CodeScene state={r} mode={mode} width={w} height={h} bare={bare} slot={slot} />
    </svg>,
  )

describe('code: bb source resolves from the engine', () => {
  it('the gross code in its torus form: n, k, the reported distance, the six edges of one check (4 near, 2 long)', () => {
    const r = R({ bb: { preset: 'gross' }, check: { kind: 'X', cell: [0, 0] }, longEdges: true })
    expect(r.family).toBe('bb')
    expect(r.view).toBe('cells')
    expect([r.n, r.k]).toEqual([144, 12])
    expect(r.distance).toEqual({ d: null, reported: 12, exact: false })
    expect(r.qubits).toHaveLength(144)
    expect(r.checks).toHaveLength(144)
    const b = r.bbx!
    expect(b.edges).toHaveLength(6)
    expect(b.focus).toMatchObject({ near: 4, long: 2, longLabels: true })
    expect(b.edges.filter((e) => e.long).map((e) => e.term).sort()).toEqual(['A3', 'B3'])
  })
  it('[[72,12,6]] is proved offline, the toy code is searched live, b360 prints a bound', () => {
    expect(R({ bb: { preset: 'b72' } }).bbx!.distance).toMatchObject({ value: 6, kind: 'exact-offline' })
    expect(R({ bb: { preset: 'toy-24' } }).bbx!.distance).toMatchObject({ value: 4, kind: 'exact' })
    expect(R({ bb: { preset: 'b360' } }).bbx!.distance).toMatchObject({ value: 24, kind: 'bound' })
    expect(R({ bb: { preset: 'b360' } }).distance).toEqual({ d: null, reported: 24, exact: false })
  })
  it('a pattern: the cells of A from the anchor are the terms of the polynomial; a shift reports whether it keeps the checks', () => {
    const r = R({ bb: { preset: 'gross' }, pattern: { poly: 'A', anchor: [0, 0] }, shift: [1, 0] })
    expect(r.bbx!.pattern!.cells).toEqual([[0, 0], [0, 1], [3, 5]])
    expect(r.bbx!.shift).toMatchObject({ a: 1, b: 0, name: 'x', preserves: true })
    expect(R({ bb: { preset: 'gross' }, pattern: { poly: 'B', anchor: [2, 1] } }).bbx!.pattern!.cells).toEqual([[2, 1], [3, 1], [1, 4]].sort((p, q) => p[0] * 6 + p[1] - (q[0] * 6 + q[1])))
  })
  it('layers: two layers of 432 edges, degree 3, from one X and one Z check', () => {
    const r = R({ bb: { preset: 'gross', form: 'bravyi' }, view: 'layers' })
    expect(r.bbx!.layers).toMatchObject({ edges: [432, 432], maxDegree: [3, 3], pieces: [12, 6] })
    expect(r.bbx!.edges).toHaveLength(12)
    expect(new Set(r.bbx!.edges.map((e) => e.layer))).toEqual(new Set([0, 1]))
  })
  it('cycle: the printed schedule is clean, the swapped reads give 432 bad pairs of 5184 (the engine\'s count)', () => {
    const ok = R({ bb: { preset: 'gross', form: 'bravyi' }, view: 'cycle', cycle: { variant: 'printed', round: 3 } })
    const swapped = R({ bb: { preset: 'gross', form: 'bravyi' }, view: 'cycle', cycle: { variant: 'swap-z-reads', round: 3 } })
    expect(ok.bbx!.cycle).toMatchObject({ round: 3, conflictFree: true, valid: true, badPairs: 0, pairs: 5184 })
    expect(swapped.bbx!.cycle).toMatchObject({ conflictFree: true, valid: false, badPairs: 432 })
    expect(ok.bbx!.cycle!.badPairs).toBe(bbScheduleCheck(bbCodeOf('b144')).badPairs)
    expect(ok.bbx!.edges.length).toBe(ok.bbx!.cycle!.active)
    expect(codeReadouts(swapped).map((x) => x.text).join(' | ')).toContain('432 of 5184')
  })
})

describe('code: bp source resolves from the engine', () => {
  it('one flip on a repetition code converges in one round and names the bit', () => {
    const r = R({ bp: { code: 'rep7', error: [3], p: 0.05, iter: 1 } })
    expect(r.family).toBe('bp')
    expect(r.view).toBe('beliefs')
    const b = r.bpx!
    expect(b).toMatchObject({ converged: true, iter: 1, syndromeMet: true, hardWeight: 1, litChecks: 2 })
    expect(b.llr).toBeCloseTo(Math.log(0.95 / 0.05), 12)
    expect(b.bits[3]).toMatchObject({ error: true, hard: true })
    expect(b.bits[3].marginal).toBeCloseTo(-b.llr, 12)
  })
  it('the degenerate pair on the 3 x 3 torus: the star edges all flagged at round 2, never converged, OSD-0 repairs it', () => {
    const t = toricCode(3)
    const error = [t.hEdge(0, 0), t.vEdge(0, 0)]
    const r2 = R({ bp: { code: 'toric3', error, p: 0.05, iter: 2 } }).bpx!
    expect(r2.hardWeight).toBe(4)
    expect(r2.syndromeMet).toBe(false)
    const star = [t.hEdge(0, 0), t.vEdge(0, 0), t.hEdge(2, 0), t.vEdge(0, 2)]
    expect(star.every((q) => r2.bits[q].hard)).toBe(true)
    const r18 = R({ bp: { code: 'toric3', error, p: 0.05, iter: 18, osd: true } }).bpx!
    expect(r18.converged).toBe(false)
    expect(r18.osd).toMatchObject({ weight: 2, valid: true, differsByStabilizer: true })
    const direct = minSumBP(t.code.HZ, t.code.HZ.mulVec(new Array(18).fill(0).map((_, q) => (error.includes(q) ? 1 : 0))), 0.05, 18)
    expect(direct.converged).toBe(false)
  })
})

describe('code: validation refuses hostile input with a message that names the field', () => {
  it('sources and views', () => {
    expect(bad({ bb: { preset: 'gross' }, code: 'rep3' }).join()).toContain('exactly one')
    expect(bad({ bb: {} }).join()).toContain('exactly one of preset, spec')
    expect(bad({ bb: { preset: 'nope' as never } }).join()).toContain('bb.preset')
    expect(bad({ bb: { preset: 'gross' }, view: 'layout' }).join()).toContain('view')
    expect(bad({ bb: { spec: { l: 99, m: 2, A: [[0, 0]], B: [[0, 0]] } } }).join()).toContain('bb.spec')
    expect(bad({ bb: { spec: { l: 4, m: 4, A: [[0, 0], [1, 0], [2, 0], [3, 0], [0, 1]], B: [[0, 0]] } } }).join()).toContain('bb.spec')
    expect(bad({ bb: { preset: 'gross' }, error: 'X1' }).join()).toContain('error')
    expect(bad({ code: 'steane7', view: 'cells' }).join()).toContain('bb source')
    expect(bad({ code: 'steane7', check: { kind: 'X', cell: [0, 0] } }).join()).toContain('only a bb or bp source')
    expect(bad({ toric: { L: 3 }, bb: { preset: 'gross' } }).join()).toContain('exactly one')
  })
  it('overlays', () => {
    expect(bad({ bb: { preset: 'gross' }, check: { kind: 'X', cell: [12, 0] } }).join()).toContain('check')
    expect(bad({ bb: { preset: 'gross' }, longEdges: true }).join()).toContain('needs `check`')
    expect(bad({ bb: { preset: 'gross' }, pattern: { poly: 'C' as never, anchor: [0, 0] } }).join()).toContain('pattern')
    expect(bad({ bb: { preset: 'gross' }, shift: [1.5, 0] }).join()).toContain('shift')
    expect(bad({ bb: { preset: 'gross' }, view: 'layers' }).join()).toBe('')
    expect(bad({ bb: { preset: 'toric-3x3' }, view: 'layers' }).join()).toContain('three monomials')
    expect(bad({ bb: { preset: 'gross' }, view: 'cycle', cycle: { variant: 'printed', round: 3 } }).join()).toContain("form: 'bravyi'")
    expect(bad({ bb: { preset: 'b756' }, view: 'cycle', cycle: { variant: 'printed', round: 3 } }).join()).toContain('at most 144')
    expect(bad({ bb: { preset: 'b72' }, view: 'cycle', cycle: { variant: 'printed', round: 9 } }).join()).toContain('cycle')
    expect(bad({ bb: { preset: 'b72' }, view: 'cycle' }).join()).toContain('cycle')
    expect(bad({ bb: { preset: 'b72' }, cycle: { variant: 'printed', round: 2 } }).join()).toContain('only the')
    expect(bad({ bb: { preset: 'b72' }, check: { kind: 'X', cell: [0, 0] }, view: 'layers' }).join()).toContain("'cells' view")
  })
  it('bp', () => {
    expect(bad({ bp: { code: 'rep7', error: [3], p: 0.05, iter: 1 } })).toEqual([])
    expect(bad({ bp: { code: 'nope' as never, error: [3], p: 0.05, iter: 1 } }).join()).toContain('bp.code')
    expect(bad({ bp: { code: 'rep7', error: [7], p: 0.05, iter: 1 } }).join()).toContain('bp.error')
    expect(bad({ bp: { code: 'rep7', error: [1, 1], p: 0.05, iter: 1 } }).join()).toContain('bp.error')
    expect(bad({ bp: { code: 'rep7', error: [], p: 0.05, iter: 1 } }).join()).toContain('bp.error')
    expect(bad({ bp: { code: 'rep7', error: [3], p: 0.9, iter: 1 } }).join()).toContain('bp.p')
    expect(bad({ bp: { code: 'rep7', error: [3], p: 0.05, iter: 19 } }).join()).toContain('bp.iter')
    expect(bad({ bp: { code: 'rep7', error: [3], p: 0.05, iter: 1, tie: 'high' } }).join()).toContain('only with `osd`')
    expect(bad({ bp: { code: 'rep7', error: [3], p: 0.05, iter: 1 }, view: 'cells' }).join()).toContain('beliefs')
    expect(bad({ bp: { code: 'rep7', error: [3], p: 0.05, iter: 1 }, bb: { preset: 'gross' } }).join()).toContain('exactly one')
  })
})

const STATES: Omit<CodeState, 'kind'>[] = [
  { bb: { preset: 'gross' } },
  { bb: { preset: 'gross' }, check: { kind: 'X', cell: [0, 0] }, longEdges: true },
  { bb: { preset: 'gross' }, check: { kind: 'Z', cell: [5, 3] } },
  { bb: { preset: 'gross' }, pattern: { poly: 'A', anchor: [0, 0] } },
  { bb: { preset: 'gross' }, shift: [3, -1] },
  { bb: { preset: 'two-gross' }, pattern: { poly: 'Bt', anchor: [2, 5] } },
  { bb: { preset: 'b756' } },
  { bb: { preset: 'toy-24' }, check: { kind: 'X', cell: [1, 2] }, longEdges: true },
  { bb: { preset: 'gross', form: 'bravyi' }, view: 'layers' },
  { bb: { preset: 'gross', form: 'bravyi' }, view: 'cycle', cycle: { variant: 'printed', round: 3 } },
  { bb: { preset: 'gross', form: 'bravyi' }, view: 'cycle', cycle: { variant: 'swap-z-reads', round: 1 } },
  { bb: { preset: 'b72' }, view: 'cycle', cycle: { variant: 'printed', round: 7 } },
  { bp: { code: 'rep7', error: [3], p: 0.05, iter: 1 } },
  { bp: { code: 'toric3', error: [0, 9], p: 0.05, iter: 2 } },
  { bp: { code: 'toric3', error: [0, 9], p: 0.05, iter: 18, osd: true, tie: 'high' } },
]
const BOXES: ['stage' | 'print', number, number, boolean, 'full' | 'top' | 'bottom'][] = [
  ['stage', 506, 785, false, 'full'],
  ['stage', 700, 560, false, 'full'],
  ['stage', 506, 360, false, 'top'],
  ['stage', 320, 360, true, 'full'],
  ['print', 320, 360, false, 'full'],
]

describe('code scene: bb and bp drawn from the resolved state only', () => {
  it('every state validates, draws in every box with no NaN, and keeps its marks inside the drawing area', () => {
    for (const st of STATES) {
      expect(bad(st), JSON.stringify(st)).toEqual([])
      const r = R(st)
      for (const [mode, w, h, bare, slot] of BOXES) {
        const html = draw(r, mode, w, h, bare, slot)
        expect(html, JSON.stringify(st)).not.toMatch(/NaN|undefined|Infinity/)
        expect(html).toContain(r.bbx ? 'data-anchor="cells"' : 'data-anchor="bits"')
        const g = codeGeometry(r, w, h, mode === 'print' || bare, slot)
        const [x0, y0, x1, y1] = r.bounds
        const a = g.at(x0, y0)
        const z = g.at(x1, y1)
        expect(a.x).toBeGreaterThanOrEqual(0)
        expect(z.x).toBeLessThanOrEqual(w)
        expect(Math.min(a.y, z.y)).toBeGreaterThanOrEqual(g.area.y - 1)
        expect(Math.max(a.y, z.y)).toBeLessThanOrEqual(g.area.y + g.area.h)
      }
      expect(codeReadouts(r).length).toBeGreaterThan(0)
    }
  })
  it('the cycle view rings the clashing qubits, none for the printed schedule', () => {
    const html = draw(R({ bb: { preset: 'b72' }, view: 'cycle', cycle: { variant: 'printed', round: 2 } }), 'stage', 506, 785)
    expect(html).not.toContain('used twice')
  })
  it('a change of source is a different picture: it switches at the half-way point', () => {
    const a = R({ bb: { preset: 'gross' } })
    const b = R({ bp: { code: 'rep7', error: [3], p: 0.05, iter: 1 } })
    expect(interpolate(a, b, 0.2)).toEqual(a)
    expect(interpolate(a, b, 0.8)).toEqual(b)
  })
})

/* ------------------------------------------------ plot points ------------------------------------------------ */
const P = (st: Omit<PlotPointsState, 'kind'>): PlotPointsState => ({ kind: 'plot', ...st })
const PR = (st: Omit<PlotPointsState, 'kind'>) => resolve(P(st), 1) as ResolvedPlot
const SAMPLE: Omit<PlotPointsState, 'kind'> = {
  points: [
    { x: 72, y: 6, label: '[[72,12,6]]', status: 'computed', group: 'BB codes' },
    { x: 90, y: 8.889, label: 'd=10', status: 'reported', group: 'BB codes' },
    { x: 360, y: 14.4, label: 'd≤24', status: 'bound', group: 'BB codes' },
    { x: 24, y: 0.75, status: 'computed', group: 'toric' },
  ],
  xLabel: 'qubits n',
  yLabel: 'k d²/n',
  xScale: 'log',
  yLines: [{ y: 1, label: 'planar: 1' }],
}

describe('plot points mode', () => {
  it('resolves with padded ranges, groups in order of first use, statuses defaulting to computed', () => {
    const r = PR(SAMPLE)
    expect(r.pointSet!.groups).toEqual(['BB codes', 'toric'])
    expect(r.pointSet!.points.map((p) => p.status)).toEqual(['computed', 'reported', 'bound', 'computed'])
    expect(r.pointSet!.xMin).toBeLessThan(24)
    expect(r.pointSet!.xMax).toBeGreaterThan(360)
    expect(r.pointSet!.yMin).toBeLessThan(0.75)
    expect(plotReadouts(r).map((x) => x.text)).toEqual(['4 points in 2 groups', '2 as printed (hollow)'])
  })
  it('draws every dot with a title, hollow for printed values, no NaN, in every box', () => {
    const r = PR(SAMPLE)
    for (const [mode, w, h, bare, slot] of BOXES) {
      const html = renderToString(
        <svg viewBox={`0 0 ${w} ${h}`}>
          <PlotScene state={r} mode={mode} width={w} height={h} bare={bare} slot={slot} />
        </svg>,
      )
      expect(html).not.toMatch(/NaN|undefined|Infinity/)
      expect(html).toContain('data-status="reported"')
      expect(html).toContain('as printed in the reference')
    }
  })
  it('validation: counts, finite numbers, labels, log axes need positive values, at most four groups', () => {
    expect(validateStage(P(SAMPLE))).toEqual([])
    expect(validateStage(P({ points: [] })).join()).toContain('one to 24')
    expect(validateStage(P({ points: [{ x: NaN, y: 1 }] })).join()).toContain('finite')
    expect(validateStage(P({ points: [{ x: 1, y: 1, label: 'x'.repeat(30) }] })).join()).toContain('label')
    expect(validateStage(P({ points: [{ x: 1, y: 1, status: 'maybe' as never }] })).join()).toContain('status')
    expect(validateStage(P({ points: [{ x: -1, y: 1 }], xScale: 'log' })).join()).toContain('above 0')
    expect(validateStage(P({ points: [{ x: 1, y: 0 }], yScale: 'log' })).join()).toContain('above 0')
    expect(validateStage(P({ points: ['a', 'b', 'c', 'd', 'e'].map((g, i) => ({ x: i + 1, y: 1, group: g })) })).join()).toContain('at most 4 groups')
    expect(validateStage({ kind: 'plot', points: [{ x: 1, y: 1 }], curve: { fn: 'nSquared' } } as never).join()).toContain('not with curve')
  })
  it('a scatter and a curve switch at the half-way point', () => {
    const a = PR(SAMPLE)
    const b = resolve({ kind: 'plot', curve: { fn: 'nSquared' } }, 1) as ResolvedPlot
    expect(interpolate(a, b, 0.3)).toEqual(a)
    expect(interpolate(a, b, 0.7)).toEqual(b)
  })
})
