/**
 * `bb84` with `protocol: 'b92'` (W-709 Q15; rulings qc709-deferred-features D2): the seeded B92 ledger. The rows are the engine's rounds
 * (physics/qc/crypto.ts `b92Rounds`, whose numpy twin is checked in crypto.test.ts), the readouts set the run beside the exact rates of
 * `b92Rates`, and every BB84 state resolves exactly as before. These tests check the passport and its fidelity drawer, the rows and tallies against a
 * direct engine call, the readouts, the validation limits, interpolation, that the one scene draws each row with no NaN in every mode, and that a
 * state without `protocol` is untouched.
 */
import { renderToString } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { fidelityOf } from '../../content/fidelity'
import '../../content/qc709/fidelity'
import type { Bb84State } from '../../content/stage'
import { KIND_RENDER, PASSPORT, PASSPORT_VARIANT, passportOf } from '../../content/stage'
import { b92Overlap, b92Rates, b92Rounds, b92Tally } from '../../physics/qc/crypto'
import { binomialStd } from '../../physics/random'
import { interpolate } from '../interp'
import { resolve, validateLayout, validateStage } from '../resolve'
import { svgKindDef } from '../svgKinds'
import type { ResolvedBb84 } from '../types'
import { BB84_LIMITS, bb84Inputs, bb84Readouts } from './bb84'
import { Bb84Scene, bb84Layout, shownRows } from './Bb84Scene'
import './kinds'

const led = (x: Omit<Bb84State, 'kind'>): Bb84State => ({ kind: 'bb84', ...x })
const b92 = (x: Omit<Bb84State, 'kind' | 'protocol'>): Bb84State => led({ protocol: 'b92', ...x })
const R = (st: Bb84State, s = 1) => resolve(st, s) as ResolvedBb84
const close = (a: number, b: number, eps = 1e-12) => expect(Math.abs(a - b), `${a} vs ${b}`).toBeLessThan(eps)

describe('bb84 protocol b92: the passport and its drawer', () => {
  it('a B92 ledger takes the B92 passport and fidelity key; every other bb84 state keeps the BB84 passport', () => {
    expect(KIND_RENDER.bb84).toBe('svg')
    const p = passportOf(b92({ rounds: { seed: 1, count: 5 } }))
    expect(p).toBe(PASSPORT_VARIANT.bb84B92)
    expect(p).toMatchObject({ title: 'PROTOCOL LEDGER · B92', fidelityKey: 'bb84-b92', axes: ['Alice', 'Eve', 'Bob'] })
    expect(p.note).toMatch(/one qubit/)
    expect(passportOf(led({ rounds: { seed: 1, count: 5 } }))).toBe(PASSPORT.bb84)
    expect(passportOf(led({ protocol: 'bb84', rounds: { seed: 1, count: 5 } }))).toBe(PASSPORT.bb84)
    expect(PASSPORT.bb84.title).toBe('PROTOCOL LEDGER · BB84')
  })
  it('the drawer has an item in each of its three lists, in Physics 709 only (ids start qc-); Spin Lab’s BB84 drawer is unchanged', () => {
    const f = fidelityOf('bb84-b92', 'qc709')
    for (const list of Object.values(f)) expect(list.length).toBeGreaterThan(0)
    for (const item of [...f.exact, ...f.schematic, ...f.misleading]) expect(item.id).toMatch(/^qc-b92-/)
    expect(fidelityOf('bb84-b92')).toEqual({ exact: [], schematic: [], misleading: [] })
    expect(fidelityOf('bb84', 'qc709')).toBe(fidelityOf('bb84'))
    expect(fidelityOf('bb84').exact[0].id).toBe('bb84-born-engine')
  })
})

describe('bb84 protocol b92: the rows are the engine’s rounds', () => {
  it('the last rows equal b92Rounds, the tallies cover every round, the exact rates are b92Rates (never-wrong Eve)', () => {
    const r = R(b92({ rounds: { seed: 84, count: 1000 }, eve: 'usd', sift: true, readouts: ['kept', 'qber', 'eve-knows'] }))
    const rounds = b92Rounds(1000, 84, 'usd')
    expect(r.protocol).toBe('b92')
    expect(r.rows).toEqual([])
    expect(r.b92!.rows).toHaveLength(12)
    r.b92!.rows.forEach((row, i) => {
      const e = rounds[988 + i]
      expect([row.n, row.aBit, row.eRead, row.eBit, row.bBit, row.kept, row.error, row.eveRight, row.eveSure]).toEqual([e.n, e.aBit, e.eRead, e.eBit, e.bBit, e.kept, e.error, e.eveRight, e.eveSure])
      expect(row.aState).toBe(e.aBit === 0 ? '0' : '+')
    })
    const t = b92Tally(rounds)
    expect([r.count, r.kept, r.errors, r.eveKnows]).toEqual([1000, t.kept, t.errors, t.eveRight])
    expect(r.qhat).toBe(t.errors / t.kept)
    const rates = b92Rates('usd')
    close(r.b92!.exactKept, 1 - b92Overlap())
    close(r.exactQ, rates.qber)
    close(r.exactQ, Math.SQRT1_2 / 2, 1e-9)
    close(r.b92!.exactRight, rates.eveRight)
    close(r.exactKnown, rates.eveRight)
    close(r.sigma!, binomialStd(t.kept, rates.qber) / t.kept)
    expect(r.test).toBeNull()
  })
  it('no Eve: no Eve column, Q is exactly 0 with no error band, and every kept bit is Alice’s; the minimum-error Eve has her own exact rates', () => {
    const clean = R(b92({ rounds: { seed: 84, count: 400 }, sift: true, readouts: ['kept', 'qber'] }))
    expect(clean.show).toEqual({ alice: true, eve: false, bob: true })
    expect(clean.errors).toBe(0)
    expect(clean.exactQ).toBe(0)
    expect(clean.sigma).toBeNull()
    expect(clean.b92!.eve).toBe('none')
    expect(clean.b92!.rows.every((x) => x.eRead === null && x.eBit === null && !x.error)).toBe(true)
    const min = R(b92({ rounds: { seed: 84, count: 400 }, eve: 'minerr', sift: true }))
    expect(min.show.eve).toBe(true)
    close(min.exactQ, b92Rates('minerr').qber)
    close(min.exactQ, 0.5 * (1 - Math.sqrt(1 - b92Overlap() ** 2)))
    close(min.b92!.exactRight, 0.5 * (1 + Math.sqrt(1 - b92Overlap() ** 2)))
    expect(min.b92!.rows.every((x) => x.eRead === 'axis')).toBe(true)
  })
  it('Alice’s bits are the same with and without Eve; `last` sets how many rows are drawn (3-12, default 12) and the tallies still cover all rounds', () => {
    const a = R(b92({ rounds: { seed: 9, count: 200 } }))
    const e = R(b92({ rounds: { seed: 9, count: 200 }, eve: 'usd' }))
    expect(a.b92!.rows.map((x) => x.aBit)).toEqual(e.b92!.rows.map((x) => x.aBit))
    const few = R(b92({ rounds: { seed: 9, count: 200 }, eve: 'usd', last: 5 }))
    expect(few.b92!.rows.map((x) => x.n)).toEqual([196, 197, 198, 199, 200])
    expect(few.kept).toBe(e.kept)
    expect(few.count).toBe(200)
    expect(R(b92({ rounds: { seed: 3, count: 4 } })).b92!.rows).toHaveLength(4)
    expect(bb84Inputs(b92({ rounds: { seed: 9, count: 200 }, last: 5 }), 1).last).toBe(5)
    expect(bb84Inputs(b92({ rounds: { seed: 9, count: 200 } }), 1).last).toBeUndefined()
  })
  it('a count sweep resolves to a whole number at each hold progress, as in BB84', () => {
    const st = b92({ rounds: { seed: 9, count: { from: 12, to: 2000 } }, eve: 'usd' })
    expect(R(st, 0).count).toBe(12)
    expect(R(st, 1).count).toBe(2000)
    expect(R(st, 0.5).count).toBe(1006)
  })
  it('a state without `protocol` resolves exactly as before: no protocol or b92 field, BB84 rows, the BB84 inputs', () => {
    const r = R(led({ rounds: { seed: 9, count: 400 }, eve: 'all', sift: true }))
    expect(r.protocol).toBeUndefined()
    expect(r.b92).toBeUndefined()
    expect(r.rows).toHaveLength(12)
    expect(Object.keys(r.inputs)).not.toContain('protocol')
    expect(Object.keys(r.inputs)).not.toContain('b92Eve')
    expect(Object.keys(r.inputs)).not.toContain('last')
    expect(R(led({ protocol: 'bb84', rounds: { seed: 9, count: 400 }, eve: 'all', sift: true })).rows).toEqual(r.rows)
    expect(shownRows(r)).toBe(12)
  })
})

describe('bb84 protocol b92: readouts', () => {
  it('lines and names: tally, Eve, kept with its exact share, the wrong share ± σ against the exact error rate, Eve’s right share against its exact value', () => {
    const r = R(b92({ rounds: { seed: 84, count: 1000 }, eve: 'usd', sift: true, readouts: ['kept', 'qber', 'eve-knows'] }))
    expect(bb84Readouts(r).map((x) => x.name)).toEqual(['tally', 'eve', 'kept', 'kept-exact', 'qber', 'band', 'exact', 'eve-knows', 'eve-exact'])
    const text = Object.fromEntries(bb84Readouts(r).map((x) => [x.name, x.text]))
    expect(text.tally).toBe('1000 qubits sent')
    expect(text.eve).toBe('Eve: never-wrong')
    expect(text.kept).toMatch(/^kept \d+ of 1000$/)
    expect(text['kept-exact']).toBe('exact share 0.2929')
    expect(text.qber).toMatch(/^kept bits wrong 0\.\d{3}$/)
    expect(text.qber).not.toContain('Q̂')
    expect(text.band).toMatch(/^1σ band ±0\.0\d+$/)
    expect(text.exact).toBe('exact error rate 0.3536')
    expect(text['eve-knows']).toMatch(/^Eve right on \d+ of \d+$/)
    expect(text['eve-exact']).toBe('exact share 0.6464')
    const min = Object.fromEntries(bb84Readouts(R(b92({ rounds: { seed: 84, count: 1000 }, eve: 'minerr', readouts: ['qber', 'eve-knows'] }))).map((x) => [x.name, x.text]))
    expect(min.eve).toBe('Eve: best axis')
    expect(min.exact).toBe('exact error rate 0.1464')
    expect(min['eve-exact']).toBe('exact share 0.8536')
  })
  it('no Eve: Q is 0 (exact 0, no band), one qubit is singular', () => {
    const t = Object.fromEntries(bb84Readouts(R(b92({ rounds: { seed: 84, count: 400 }, readouts: ['kept', 'qber'] }))).map((x) => [x.name, x.text]))
    expect(t.qber).toBe('kept bits wrong 0')
    expect(t.exact).toBe('exact error rate 0')
    expect(t.band).toBeUndefined()
    expect(t.eve).toBeUndefined()
    expect(bb84Readouts(R(b92({ rounds: { seed: 1, count: 1 } })))[0].text).toBe('1 qubit sent')
  })
})

describe('bb84 protocol b92: interpolation', () => {
  it('the same seed and attack lerp the count; a different attack, seed or protocol cuts at the half-way point; the ends are returned as they are', () => {
    const a = R(b92({ rounds: { seed: 9, count: 100 }, eve: 'usd' }), 1)
    const b = R(b92({ rounds: { seed: 9, count: 300 }, eve: 'usd' }), 0)
    const mid = interpolate(a, b, 0.5) as ResolvedBb84
    expect(mid.count).toBe(200)
    expect(mid.protocol).toBe('b92')
    expect(mid.eve).toBe(1)
    expect(interpolate(a, b, 0)).toBe(a)
    expect(interpolate(a, b, 1)).toBe(b)
    const other = R(b92({ rounds: { seed: 9, count: 100 }, eve: 'minerr' }), 1)
    expect((interpolate(a, other, 0.25) as ResolvedBb84).b92!.eve).toBe('usd')
    expect((interpolate(a, other, 0.75) as ResolvedBb84).b92!.eve).toBe('minerr')
    const off = R(b92({ rounds: { seed: 9, count: 100 } }), 1)
    expect((interpolate(off, a, 0.25) as ResolvedBb84).b92!.eve).toBe('none')
    const bb = R(led({ rounds: { seed: 9, count: 100 }, eve: 'all' }), 1)
    expect((interpolate(bb, a, 0.25) as ResolvedBb84).protocol).toBeUndefined()
    expect((interpolate(bb, a, 0.75) as ResolvedBb84).protocol).toBe('b92')
  })
})

describe('bb84 protocol b92: validation', () => {
  const v = (x: Omit<Bb84State, 'kind'>) => validateStage(led(x))
  it('valid ledgers: no Eve, either attack, a sweep, the shot, fewer rows', () => {
    expect(v({ protocol: 'b92', rounds: { seed: 84, count: 1000 } })).toEqual([])
    expect(v({ protocol: 'b92', rounds: { seed: 84, count: 1000 }, eve: 'off', sift: true, readouts: ['kept', 'qber'] })).toEqual([])
    expect(v({ protocol: 'b92', rounds: { seed: 84, count: 1000 }, eve: 'usd', sift: true, readouts: ['kept', 'qber', 'eve-knows'], show: ['alice', 'eve', 'bob'], last: 6, shot: 'K-LEDGER' })).toEqual([])
    expect(v({ protocol: 'b92', rounds: { seed: 84, count: { from: 8, to: 400 } }, eve: 'minerr', highlight: [] })).toEqual([])
    expect(v({ protocol: 'bb84', rounds: { seed: 84, count: 100 }, eve: 'all' })).toEqual([])
  })
  it('limits: only the two attacks the unit describes, seeded rounds, no test sample, the protocol, the rows drawn', () => {
    expect(v({ protocol: 'b92', rounds: { seed: 1, count: 10 }, eve: 'all' }).join()).toMatch(/'off', 'usd'/)
    expect(v({ protocol: 'b92', rounds: { seed: 1, count: 10 }, eve: { fraction: 0.5 } }).join()).toMatch(/'off', 'usd'/)
    expect(v({ protocol: 'b92', rounds: { board: 'notes-p8' } }).join()).toMatch(/seeded rounds only/)
    expect(v({ protocol: 'b92', rounds: { seed: 1, count: 100 }, eve: 'usd', sift: true, test: { size: 3 } }).join()).toMatch(/no public test sample/)
    expect(v({ protocol: 'b93' as never, rounds: { seed: 1, count: 10 } }).join()).toMatch(/'bb84' or 'b92'/)
    expect(v({ protocol: 'b92', rounds: { seed: 1, count: 10 }, last: 2 }).join()).toMatch(/last/)
    expect(v({ protocol: 'b92', rounds: { seed: 1, count: 10 }, last: 13 }).join()).toMatch(/last/)
    expect(v({ protocol: 'b92', rounds: { seed: 1, count: 10 }, last: 4.5 }).join()).toMatch(/last/)
    expect(v({ rounds: { seed: 1, count: 10 }, last: 2 }).join()).toMatch(/last/)
    expect(v({ protocol: 'b92', rounds: { seed: 1, count: BB84_LIMITS.countMax + 1 } }).join()).toMatch(/count/)
  })
  it('the B92 attacks belong to the B92 protocol only; Eve’s column and the Eve readout need an attack; a highlight must be a drawn round', () => {
    expect(v({ rounds: { seed: 1, count: 10 }, eve: 'usd' }).join()).toMatch(/belong to protocol 'b92'/)
    expect(v({ protocol: 'bb84', rounds: { seed: 1, count: 10 }, eve: 'minerr' }).join()).toMatch(/belong to protocol 'b92'/)
    expect(v({ protocol: 'b92', rounds: { seed: 1, count: 10 }, show: ['alice', 'eve'] }).join()).toMatch(/Eve's column needs an eavesdropper/)
    expect(v({ protocol: 'b92', rounds: { seed: 1, count: 10 }, readouts: ['eve-knows'] }).join()).toMatch(/needs an eavesdropper/)
    expect(v({ protocol: 'b92', rounds: { seed: 1, count: 10 }, eve: 'usd', show: ['alice'], readouts: ['kept'] }).join()).toMatch(/show Bob/)
    expect(v({ protocol: 'b92', rounds: { seed: 1, count: 30 }, highlight: [1] }).join()).toMatch(/not one of the drawn rows \(19–30\)/)
    expect(v({ protocol: 'b92', rounds: { seed: 1, count: 30 }, last: 5, highlight: [25] }).join()).toMatch(/not one of the drawn rows \(26–30\)/)
    expect(v({ protocol: 'b92', rounds: { seed: 1, count: 30 }, last: 5, highlight: [27] })).toEqual([])
  })
  it('a B92 ledger beside the exact-rate sphere is a different kind, so the split validates; two ledgers in one layout do not', () => {
    expect(validateLayout({ layout: 'split', top: b92({ rounds: { seed: 1, count: 10 }, eve: 'usd' }), bottom: { kind: 'bloch-ball', point: '+z', compare: '+x' } })).toEqual([])
    expect(validateLayout({ layout: 'split', top: b92({ rounds: { seed: 1, count: 10 } }), bottom: led({ rounds: { seed: 1, count: 10 } }) }).join()).toMatch(/repeats a kind/)
  })
})

describe('bb84 protocol b92: the one scene (stage, reading version, print)', () => {
  const draw = (r: ResolvedBb84, mode: 'stage' | 'print', w: number, h: number, bare = false, slot?: 'top') =>
    renderToString(
      <svg viewBox={`0 0 ${w} ${h}`}>
        <Bb84Scene state={r} mode={mode} width={w} height={h} bare={bare} slot={slot} />
      </svg>,
    )
  const ALL = ['kept', 'qber', 'eve-knows'] as const
  it('draws one row per qubit with its chips, no NaN, in every mode', () => {
    const r = R(b92({ rounds: { seed: 84, count: 1000 }, eve: 'usd', sift: true, readouts: [...ALL] }))
    for (const [mode, w, h, bare] of [['stage', 640, 560, false], ['stage', 560, 440, true], ['print', 320, 340, false]] as const) {
      const html = draw(r, mode, w, h, bare)
      expect(html.match(/data-row="/g)?.length, mode).toBe(12)
      expect(html, mode).not.toMatch(/NaN|Infinity|undefined/)
      expect(html).toContain('data-anchor="qber"')
      expect(html).toContain('data-kind="bb84"')
      expect(html).toContain('data-anchor="eve"')
    }
  })
  it('each row shows Alice’s state and bit, Eve’s reading and resent state, Bob’s detector or the word unsure, and the marks of a kept row', () => {
    const r = R(b92({ rounds: { seed: 84, count: 1000 }, eve: 'usd', sift: true }))
    const html = draw(r, 'stage', 640, 560)
    const rows = r.b92!.rows
    // a chip per row for Alice, one for Eve; a detector chip per kept row; "unsure" in Bob's cell for each blank row (and in Eve's cell for each failure)
    expect(html.match(/\|0⟩|\|\+⟩/g)?.length).toBe(rows.length * 2)
    expect(html.match(/>E₀<|>E₁</g)?.length ?? 0).toBe(rows.filter((x) => x.kept).length)
    expect(html.match(/>unsure</g)?.length ?? 0).toBe(rows.filter((x) => !x.kept).length + rows.filter((x) => x.eRead === 'unsure').length)
    expect(html.match(/>sure</g)?.length ?? 0).toBe(rows.filter((x) => x.eRead === 'click').length)
    expect(html.match(/data-eread="(click|unsure)"/g)?.length).toBe(rows.length)
    expect(html.match(/<path d="M[^"]*l3\.5,4 l7,-8"/g)?.length ?? 0).toBe(rows.filter((x) => x.kept && !x.error).length)
    expect(html.match(/data-mark="error"/g)?.length ?? 0).toBe(rows.filter((x) => x.error).length)
    expect(html.match(/opacity="0\.38"/g)?.length ?? 0).toBe(rows.filter((x) => !x.kept).length)
  })
  it('the minimum-error Eve’s cell reads "best"; with no Eve there is no Eve column; without sift nothing dims', () => {
    const min = draw(R(b92({ rounds: { seed: 84, count: 400 }, eve: 'minerr', sift: true })), 'stage', 640, 560)
    expect(min).toContain('>best<')
    expect(min).not.toContain('>sure<')
    const none = draw(R(b92({ rounds: { seed: 84, count: 400 }, sift: false })), 'stage', 640, 560)
    expect(none).not.toContain('data-anchor="eve"')
    expect(none).not.toMatch(/opacity="0\.38"/)
    expect(none).not.toContain('data-mark="error"')
  })
  it('the highlight outlines the named row', () => {
    const r = R(b92({ rounds: { seed: 84, count: 400 }, eve: 'usd', highlight: [395] }))
    expect(r.b92!.rows.filter((x) => x.highlighted).map((x) => x.n)).toEqual([395])
  })
  it('the layout never leaves the drawing box, in a full stage, a split’s top half with fewer rows, and the print and bare versions', () => {
    const full = R(b92({ rounds: { seed: 84, count: 1000 }, eve: 'usd', sift: true, readouts: ['kept', 'qber'] }))
    for (const [w, h, own, slot] of [[640, 560, false, null], [480, 520, false, null], [560, 440, true, null], [320, 340, true, null]] as const) {
      const L = bb84Layout(full, w, h, own, slot)
      const bottom = L.rowsY + shownRows(full) * L.rowH + (L.gauge ? 36 : 0)
      expect(bottom, `${w}x${h}`).toBeLessThanOrEqual(h - (own ? 4 : 80))
      expect(L.cols.mark[1]).toBeLessThanOrEqual(w)
    }
    const half = R(b92({ rounds: { seed: 84, count: 1000 }, eve: 'usd', sift: true, readouts: ['kept'], last: 6 }))
    const L = bb84Layout(half, 640, 270, false, 'top')
    expect(L.rowsY + shownRows(half) * L.rowH, 'split top').toBeLessThanOrEqual(270 - 14)
  })
  it('is the same svg kind as the BB84 ledger: registered, with its print size', () => {
    expect(svgKindDef('bb84')!.print).toEqual({ w: 320, h: 340 })
  })
})
