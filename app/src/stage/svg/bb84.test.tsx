/**
 * `bb84` (SVG; W-448 L8-B): the protocol ledger. Content writes only inputs; the resolver draws every bit, basis, outcome and
 * tally from the one seeded engine (physics/bb84.ts). These tests check the rows against a direct engine call, the sifting
 * and test marks, the tallies and the exact Q, interpolation (a longer run only appends), the validation limits, the
 * readout text, the plot's new `bb84Miss` curve with a log axis, and that the one scene draws all of it with no NaN.
 */
import { renderToString } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { FIDELITY } from '../../content/fidelity'
import { fidelityOf } from '../../content/fidelity'
import type { Bb84State, PlotState } from '../../content/stage'
import { KIND_RENDER, PASSPORT, passportOf } from '../../content/stage'
import { BOARD_P8, bb84Q, bb84Rounds, bb84Tally, eveKnown, missProb, stateLetter } from '../../physics/bb84'
import { interpolate } from '../interp'
import { resolve, validateLayout, validateStage } from '../resolve'
import { svgKindDef } from '../svgKinds'
import type { ResolvedBb84, ResolvedPlot } from '../types'
import { BB84_LIMITS, bb84Inputs, bb84Readouts, missText } from './bb84'
import { Bb84Scene, bb84Layout } from './Bb84Scene'
import { sci } from './draw'
import { plotReadouts, yText } from './plot'
import { PlotScene } from './PlotScene'
import './kinds'

const led = (x: Omit<Bb84State, 'kind'>): Bb84State => ({ kind: 'bb84', ...x })
const R = (st: Bb84State, s = 1) => resolve(st, s) as ResolvedBb84
const close = (a: number, b: number, eps = 1e-12) => expect(Math.abs(a - b), `${a} vs ${b}`).toBeLessThan(eps)

describe('bb84: the SVG route and the passport', () => {
  it('is an SVG kind registered by the lazy module, with the plan’s passport and its own drawer', () => {
    expect(KIND_RENDER.bb84).toBe('svg')
    expect(svgKindDef('bb84')).toBeDefined()
    expect(PASSPORT.bb84).toMatchObject({ title: 'PROTOCOL LEDGER · BB84', fidelityKey: 'bb84' })
    expect(PASSPORT.bb84.note).toMatch(/Born rule \(seeded\)/)
    expect(passportOf(led({ rounds: { seed: 1, count: 5 } }))).toBe(PASSPORT.bb84)
    for (const list of Object.values(fidelityOf('bb84'))) expect(list.length).toBeGreaterThan(0)
    expect(fidelityOf('bb84', 'qc709')).toBe(fidelityOf('bb84'))
    expect(Object.keys(FIDELITY)).not.toContain('bb84')
  })
})

describe('bb84: the rows are the engine’s rounds', () => {
  it('a seeded run: the last 12 rows equal bb84Rounds, the tallies cover all rounds, Q exact is ¼', () => {
    const r = R(led({ rounds: { seed: 9, count: 400 }, eve: 'all', sift: true, readouts: ['kept', 'qber', 'eve-knows'] }))
    const rounds = bb84Rounds(400, 9, 1)
    expect(r.rows).toHaveLength(12)
    r.rows.forEach((row, i) => {
      const e = rounds[388 + i]
      expect([row.n, row.aBit, row.aBasis, row.bBit, row.bBasis, row.eBit, row.eBasis, row.kept, row.error]).toEqual([e.n, e.aBit, e.aBasis, e.bBit, e.bBasis, e.eBit, e.eBasis, e.kept, e.error])
      expect(row.aState).toBe(stateLetter(e.aBasis, e.aBit))
    })
    const t = bb84Tally(rounds)
    expect([r.count, r.kept, r.errors, r.eveKnows]).toEqual([400, t.kept, t.errors, t.eveKnows])
    close(r.exactQ, 0.25)
    close(r.exactKnown, 0.5)
    expect(r.qhat).toBe(t.errors / t.kept)
    close(r.sigma!, Math.sqrt((0.25 * 0.75) / t.kept), 1e-12)
  })
  it('the notes’ board: eight rounds, kept [1, 4, 5, 6], both sifted strings 0010, no Eve, rounds 2 and 8 flagged as luck', () => {
    const r = R(led({ rounds: { board: 'notes-p8' }, sift: true, highlight: [2, 8] }))
    expect(r.board).toBe(true)
    expect(r.rows.map((x) => x.n)).toEqual([1, 2, 3, 4, 5, 6, 7, 8])
    expect(r.rows.filter((x) => x.kept).map((x) => x.n)).toEqual([1, 4, 5, 6])
    expect(r.rows.map((x) => x.aState).join('')).toBe('HAVDAHDV')
    expect(r.rows.filter((x) => x.luck).map((x) => x.n)).toEqual([2, 8])
    expect(r.rows.filter((x) => x.highlighted).map((x) => x.n)).toEqual([2, 8])
    expect(r.kept).toBe(4)
    expect(r.errors).toBe(0)
    expect(r.exactQ).toBe(0)
    expect(r.rows.every((x) => !x.eIntercept)).toBe(true)
    expect(r.rows.map((x) => x.aBit).join('')).toBe(BOARD_P8.map((x) => x.aBit).join(''))
  })
  it('with no Eve every kept round agrees; Eve’s column holds her basis, reading and resent state', () => {
    const clean = R(led({ rounds: { seed: 84, count: 200 }, sift: true }))
    expect(clean.errors).toBe(0)
    expect(clean.rows.every((x) => x.eState === null)).toBe(true)
    const dirty = R(led({ rounds: { seed: 84, count: 200 }, eve: 'all', sift: true }))
    expect(dirty.rows.every((x) => x.eIntercept && x.eBit !== null && x.eState === stateLetter(x.eBasis, x.eBit))).toBe(true)
    expect(dirty.errors).toBeGreaterThan(0)
    // Alice’s and Bob’s choices are the same with and without Eve
    clean.rows.forEach((x, i) => expect([x.aBit, x.aBasis, x.bBasis]).toEqual([dirty.rows[i].aBit, dirty.rows[i].aBasis, dirty.rows[i].bBasis]))
  })
  it('a fraction of interceptions: exact Q = f/4 and Eve knows f/2', () => {
    const r = R(led({ rounds: { seed: 20, count: 1000 }, eve: { fraction: 0.5 }, sift: true, readouts: ['qber', 'eve-knows'] }))
    close(r.exactQ, bb84Q(0.5))
    close(r.exactQ, 0.125)
    close(r.exactKnown, eveKnown(0.5))
    close(r.eve, 0.5)
    expect(r.rows.some((x) => !x.eIntercept)).toBe(true)
    expect(r.rows.some((x) => x.eIntercept)).toBe(true)
  })
  it('a sweep of the count resolves to a whole number at each hold progress; fewer than 12 rounds draws what exists', () => {
    const st = led({ rounds: { seed: 9, count: { from: 12, to: 2000 } }, eve: 'all' })
    expect(R(st, 0).count).toBe(12)
    expect(R(st, 1).count).toBe(2000)
    expect(R(st, 0.5).count).toBe(1006)
    expect(R(led({ rounds: { seed: 3, count: 5 } })).rows).toHaveLength(5)
    expect(bb84Inputs(st, 0.37).count).toBe(Math.round(12 + (2000 - 12) * 0.37))
  })
})

describe('bb84: sifting and the public test sample', () => {
  it('a test of the first m kept rounds: the tested rows leave the key; the remaining bits stay secret', () => {
    const r = R(led({ rounds: { seed: 20, count: 60 }, eve: 'all', sift: true, test: { size: 8 } }))
    expect(r.test!.m).toBe(8)
    expect(r.test!.tested).toHaveLength(8)
    expect(r.test!.remaining).toBe(r.kept - 8)
    close(r.test!.miss, missProb(0.25, 8))
    expect(r.test!.nErr).toBe(r.test!.tested.filter((n) => bb84Rounds(60, 20, 1)[n - 1].error).length)
  })
  it('the board’s sample is rounds 1 and 5: both agree (0 of 2); rounds 4 and 6 remain', () => {
    const r = R(led({ rounds: { board: 'notes-p8' }, sift: true, test: { rounds: [1, 5] } }))
    expect(r.test).toMatchObject({ m: 2, nErr: 0, qhat: 0, remaining: 2, tested: [1, 5] })
    expect(r.rows.filter((x) => x.tested).map((x) => x.n)).toEqual([1, 5])
    close(r.test!.miss, 1) // no attack: nothing to miss
  })
  it('the miss chance for the full attack is (¾)^m; m = 17 is the first below 1 %', () => {
    const at = (m: number) => R(led({ rounds: { seed: 84, count: 200 }, eve: 'all', sift: true, test: { size: m } })).test!.miss
    expect(at(16)).toBeGreaterThan(0.01)
    expect(at(17)).toBeLessThan(0.01)
    close(at(20), 0.0031712119, 1e-9)
    expect(missText(at(20))).toBe('0.0032')
    expect(missText(missProb(0.25, 100))).toBe('3.2 × 10⁻¹³')
  })
})

describe('bb84: interpolation and readouts', () => {
  it('the same seed lerps the count and Eve’s fraction; a different seed or the board switches at the half-way point', () => {
    const a = R(led({ rounds: { seed: 9, count: 100 }, eve: 'all' }), 1)
    const b = R(led({ rounds: { seed: 9, count: 300 }, eve: 'all' }), 0)
    const mid = interpolate(a, b, 0.5) as ResolvedBb84
    expect(mid.count).toBe(200)
    // a longer run only appends: the first 100 rounds are unchanged
    expect(bb84Rounds(200, 9, 1).slice(0, 100)).toEqual(bb84Rounds(100, 9, 1))
    const off = R(led({ rounds: { seed: 9, count: 100 } }), 1)
    close((interpolate(off, a, 0.5) as ResolvedBb84).eve, 0.5) // same seed: Eve’s fraction lerps (she fades in)
    const board = R(led({ rounds: { board: 'notes-p8' } }))
    expect((interpolate(board, a, 0.25) as ResolvedBb84).board).toBe(true)
    expect((interpolate(board, a, 0.75) as ResolvedBb84).board).toBe(false)
    expect(interpolate(a, b, 0)).toBe(a)
    expect(interpolate(a, b, 1)).toBe(b)
  })
  it('the readouts: tally, kept, the kept-bits-wrong share ± σ against the exact error rate, what Eve knows, the test and its miss chance', () => {
    const r = R(led({ rounds: { seed: 84, count: 400 }, eve: 'all', sift: true, test: { size: 17 }, readouts: ['kept', 'qber', 'eve-knows'] }))
    const t = bb84Readouts(r).map((x) => x.name)
    expect(t).toEqual(['tally', 'eve', 'kept', 'qber', 'band', 'exact', 'eve-knows', 'test', 'test-q', 'miss', 'key'])
    const text = Object.fromEntries(bb84Readouts(r).map((x) => [x.name, x.text]))
    expect(text.tally).toBe('400 photons sent')
    expect(text.eve).toBe('Eve: every photon')
    expect(text.kept).toMatch(/^kept \d+ of 400$/)
    // P-L8 item 6: the all-kept tally is not called Q̂ (that is the test sample's n_err/m, the 'test Q̂' line); no Q symbol is printed
    expect(text.qber).toMatch(/^kept bits wrong 0\.\d+$/)
    expect(text.qber).not.toContain('Q̂')
    expect(text.band).toMatch(/^1σ band ±0\.0\d+$/)
    expect(text.exact).toBe('exact error rate 0.25')
    expect(text['eve-knows']).toMatch(/^Eve knows \d+ of \d+$/)
    expect(text.test).toMatch(/^test: 17 bits, \d+ errors?$/)
    expect(text['test-q']).toMatch(/^test Q̂ = [\d.]+$/)
    expect(text.miss).toBe('no-error chance 0.0075')
    expect(bb84Readouts(R(led({ rounds: { board: 'notes-p8' }, sift: true, readouts: ['kept'] }))).map((x) => x.text)).toEqual(['8 photons (notes p. 8)', 'kept 4 of 8'])
    expect(bb84Readouts(R(led({ rounds: { seed: 1, count: 1 } })))[0].text).toBe('1 photon sent')
  })
})

describe('bb84: validation', () => {
  const v = (x: Omit<Bb84State, 'kind'>) => validateStage(led(x))
  it('a valid ledger passes at every shape the lecture uses', () => {
    expect(v({ rounds: { board: 'notes-p8' }, sift: true, test: { rounds: [1, 5] }, highlight: [2, 8] })).toEqual([])
    expect(v({ rounds: { seed: 84, count: { from: 8, to: 400 } }, sift: true, readouts: ['kept', 'qber'] })).toEqual([])
    expect(v({ rounds: { seed: 9, count: 12 }, eve: 'all', show: ['alice', 'eve', 'bob'] })).toEqual([])
    expect(v({ rounds: { seed: 9, count: 2000 }, eve: { fraction: { from: 0, to: 1 } }, sift: true, readouts: ['qber', 'eve-knows'] })).toEqual([])
    expect(v({ rounds: { seed: 20, count: 400 }, eve: 'all', sift: true, test: { fraction: 0.2 }, readouts: ['qber'] })).toEqual([])
  })
  it('limits: the count, the seed, Eve’s fraction, the columns, the readouts, the sample', () => {
    expect(v({ rounds: { seed: 1, count: 0 } }).join()).toMatch(/count/)
    expect(v({ rounds: { seed: 1, count: BB84_LIMITS.countMax + 1 } }).join()).toMatch(/count/)
    expect(v({ rounds: { seed: 1, count: 3.5 } }).join()).toMatch(/whole number/)
    expect(v({ rounds: { seed: -1, count: 10 } }).join()).toMatch(/seed/)
    expect(v({ rounds: { seed: 1, count: 10 }, eve: { fraction: 1.5 } }).join()).toMatch(/fraction/)
    expect(v({ rounds: { board: 'notes-p8' }, eve: 'all' }).join()).toMatch(/no eavesdropper/)
    expect(v({ rounds: { seed: 1, count: 10 }, show: ['alice', 'eve'] }).join()).toMatch(/Eve's column needs an eavesdropper/)
    expect(v({ rounds: { seed: 1, count: 10 }, show: [] as never }).join()).toMatch(/non-empty list/)
    expect(v({ rounds: { seed: 1, count: 10 }, readouts: ['eve-knows'] }).join()).toMatch(/needs an eavesdropper/)
    expect(v({ rounds: { seed: 1, count: 10 }, readouts: ['bogus' as never] }).join()).toMatch(/unknown/)
    expect(v({ rounds: { seed: 1, count: 10 }, show: ['alice'], readouts: ['kept'] }).join()).toMatch(/show Bob/)
    expect(v({ rounds: { seed: 1, count: 100 }, test: { size: 3 } }).join()).toMatch(/set sift: true/)
    expect(v({ rounds: { board: 'notes-p8' }, sift: true, test: { rounds: [2] } }).join()).toMatch(/not a kept round/)
    expect(v({ rounds: { board: 'notes-p8' }, sift: true, test: { size: 5 } }).join()).toMatch(/more than the 4 kept/)
    expect(v({ rounds: { seed: 1, count: 30 }, highlight: [1] }).join()).toMatch(/not one of the drawn rows/)
    expect(v({ rounds: { seed: 1, count: 30 }, test: { fraction: 2 }, sift: true }).join()).toMatch(/between 0 and 1/)
  })
  it('the shot is the ledger’s', () => {
    expect(v({ rounds: { seed: 1, count: 10 }, shot: 'K-LEDGER' })).toEqual([])
    expect(v({ rounds: { seed: 1, count: 10 }, shot: 'P-CURVE' as never })[0]).toMatch(/unknown shot/)
  })
  it('a ledger beside a sphere is a different kind, so a split validates', () => {
    expect(validateLayout({ layout: 'split', top: led({ rounds: { seed: 1, count: 10 } }), bottom: { kind: 'bloch', state: '+z', labels: 'poincare' } })).toEqual([])
  })
})

describe('bb84: the one scene (stage, reading version, print, bench)', () => {
  const draw = (r: ResolvedBb84, mode: 'stage' | 'print', w: number, h: number, bare = false) =>
    renderToString(
      <svg viewBox={`0 0 ${w} ${h}`}>
        <Bb84Scene state={r} mode={mode} width={w} height={h} bare={bare} />
      </svg>,
    )
  it('draws one row per photon with its glyph, no NaN, in every mode', () => {
    const r = R(led({ rounds: { seed: 9, count: 400 }, eve: 'all', sift: true, test: { size: 6 }, readouts: ['kept', 'qber', 'eve-knows'] }))
    for (const [mode, w, h, bare] of [['stage', 640, 560, false], ['stage', 560, 440, true], ['print', 320, 340, false]] as const) {
      const html = draw(r, mode, w, h, bare)
      expect(html.match(/data-row="/g)?.length, mode).toBe(12)
      expect(html, mode).not.toMatch(/NaN|Infinity|undefined/)
      expect(html).toContain('data-anchor="qber"')
      expect(html).toContain('data-kind="bb84"')
    }
  })
  it('the marks: a check for a kept round, a boxed cross for a kept error, "T" for a tested row, a dim row when not kept', () => {
    const r = R(led({ rounds: { seed: 9, count: 400 }, eve: 'all', sift: true }))
    const html = draw(r, 'stage', 640, 560)
    const keptRows = r.rows.filter((x) => x.kept && !x.error).length
    const errRows = r.rows.filter((x) => x.error).length
    expect(html.match(/<path d="M[^"]*l3\.5,4 l7,-8"/g)?.length ?? 0).toBe(keptRows)
    expect(html.match(/data-mark="error"/g)?.length ?? 0).toBe(errRows)
    expect(html.match(/opacity="0\.38"/g)?.length ?? 0).toBe(r.rows.filter((x) => !x.kept).length)
  })
  it('hidden parties have no column; the board draws no Eve column', () => {
    const html = draw(R(led({ rounds: { board: 'notes-p8' }, sift: true })), 'stage', 640, 560)
    expect(html).not.toContain('data-anchor="eve"')
    expect(html).toContain('data-anchor="alice"')
    const onlyAlice = draw(R(led({ rounds: { seed: 1, count: 6 }, show: ['alice'] })), 'stage', 640, 560)
    expect(onlyAlice).not.toContain('data-anchor="bob"')
  })
  it('the layout never leaves the drawing box: rows end above the caption strip, columns inside the width', () => {
    const r = R(led({ rounds: { seed: 9, count: 400 }, eve: 'all', sift: true, readouts: ['kept', 'qber', 'eve-knows'] }))
    for (const [w, h, own] of [[640, 560, false], [480, 520, false], [560, 440, true], [320, 340, true]] as const) {
      const L = bb84Layout(r, w, h, own)
      const bottom = L.rowsY + r.rows.length * L.rowH + (L.gauge ? 36 : 0)
      expect(bottom, `${w}x${h}`).toBeLessThanOrEqual(h - (own ? 4 : 80))
      expect(L.cols.mark[1]).toBeLessThanOrEqual(w)
      expect(L.cols.n[0]).toBeGreaterThanOrEqual(0)
    }
  })
  it('the print figure reads the same ledger (resolve → FigureFor path): the scene is the svg kind’s own', () => {
    expect(svgKindDef('bb84')!.print).toEqual({ w: 320, h: 340 })
  })
})

describe('plot: the bb84Miss curve and the log axis', () => {
  const pl = (x: Omit<PlotState, 'kind'>): PlotState => ({ kind: 'plot', ...x })
  const P = (st: PlotState) => resolve(st, 1) as ResolvedPlot
  it('the curve is (¾)^m from the engine, its markers are missProb at whole m, in linear and log', () => {
    const lin = P(pl({ curve: { fn: 'bb84Miss' }, markers: [{ x: 20 }, { x: 16 }, { x: 17 }] }))
    expect(lin.yScale).toBe('linear')
    close(lin.markers[0].y, missProb(0.25, 20), 1e-15)
    close(lin.markers[1].y, missProb(0.25, 16), 1e-15)
    close(lin.markers[2].y, missProb(0.25, 17), 1e-15)
    expect(lin.range).toEqual({ from: 0, to: 40 })
    const log = P(pl({ curve: { fn: 'bb84Miss', x: { from: 0, to: 100 } }, yScale: 'log', markers: [{ x: 20 }, { x: 100 }] }))
    expect(log.yScale).toBe('log')
    close(log.markers[1].y, missProb(0.25, 100), 1e-25)
    expect(log.yMin).toBeLessThan(log.markers[1].y)
    expect(log.yMax).toBeGreaterThan(1)
  })
  it('readout text: three decimals above 0.1, four to 0.001, scientific below', () => {
    expect(yText(0.25)).toBe('0.25')
    expect(yText(0.0031712)).toBe('0.0032')
    expect(yText(3.2e-13)).toBe('3.2 × 10⁻¹³')
    expect(sci(9.96e-7, 1)).toBe('1 × 10⁻⁶')
    const r = P(pl({ curve: { fn: 'bb84Miss', x: { from: 0, to: 100 } }, yScale: 'log', markers: [{ x: 20 }, { x: 100 }] }))
    expect(plotReadouts(r).map((x) => x.text)).toContain('marker: y(100) = 3.2 × 10⁻¹³')
    expect(plotReadouts(r).map((x) => x.text)).toContain('marker: y(20) = 0.0032')
  })
  it('validation: log needs positive lines and bands; the scale is linear or log; a linear plot is unchanged', () => {
    expect(validateStage(pl({ curve: { fn: 'bb84Miss' }, yScale: 'log', yLines: [{ y: 0.01 }] }))).toEqual([])
    expect(validateStage(pl({ curve: { fn: 'bb84Miss' }, yScale: 'log', yLines: [{ y: 0 }] })).join()).toMatch(/yLines above 0/)
    expect(validateStage(pl({ curve: { fn: 'bb84Miss' }, yScale: 'log', bands: [{ yFrom: -1, yTo: 1 }] })).join()).toMatch(/bands above 0/)
    expect(validateStage(pl({ curve: { fn: 'chshVsPhase' }, yScale: 'log' })).join()).not.toMatch(/stays above/)
    expect(validateStage(pl({ curve: { fn: 'bb84Miss' }, yScale: 'cubic' as never })).join()).toMatch(/linear' or 'log'/)
    expect(validateStage(pl({ curve: { fn: 'bb84Miss' }, markers: [{ x: 20 }], yLines: [{ y: 0.01, label: '1%' }] }))).toEqual([])
  })
  it('interpolation: a different scale hard-switches; the same scale lerps the range', () => {
    const a = P(pl({ curve: { fn: 'bb84Miss' }, markers: [{ x: 20 }] }))
    const b = P(pl({ curve: { fn: 'bb84Miss', x: { from: 0, to: 100 } }, yScale: 'log', markers: [{ x: 20 }, { x: 100 }] }))
    expect((interpolate(a, b, 0.25) as ResolvedPlot).yScale).toBe('linear')
    expect((interpolate(a, b, 0.75) as ResolvedPlot).yScale).toBe('log')
    const c = P(pl({ curve: { fn: 'bb84Miss', x: { from: 0, to: 60 } }, markers: [{ x: 20 }] }))
    expect((interpolate(a, c, 0.5) as ResolvedPlot).range.to).toBe(50)
  })
  it('the scene draws decades on a log axis and two values on a linear one, no NaN', () => {
    const lin = renderToString(<svg><PlotScene state={P(pl({ curve: { fn: 'bb84Miss' }, markers: [{ x: 20 }] }))} mode="stage" width={560} height={420} /></svg>)
    const log = renderToString(<svg><PlotScene state={P(pl({ curve: { fn: 'bb84Miss', x: { from: 0, to: 100 } }, yScale: 'log', markers: [{ x: 20 }, { x: 100 }] }))} mode="stage" width={560} height={420} /></svg>)
    expect(log).toContain('10⁻¹')
    expect(log).toMatch(/10⁻[⁰¹²³⁴⁵⁶⁷⁸⁹]+/)
    for (const h of [lin, log]) expect(h).not.toMatch(/NaN|Infinity|undefined/)
    expect(lin).not.toContain('10⁻')
  })
})
