/**
 * `spacetime`, readout mode (B3, P-B3 S-b): the repeated product readout of a seam. Content writes inputs only (m checks, R rounds, authored flipped readings or a seeded draw with the chance q, what to
 * show); the resolver takes every flip, product reading, vote and chance from physics/qec/timelike.ts. These tests check the resolved picture against the engine (and against a hand reading of small
 * histories), the exact chances against the enumeration route, every validation limit with a message that names the field, the readout text, the passport / drawer / vocabulary, the second mode
 * leaving the first untouched, interpolation, and that the one scene draws with no NaN in three boxes (down to a 375 px phone), packs inside the box and names every flipped reading.
 */
import { renderToString } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { fidelityOf } from '../../content/fidelity'
import type { SpacetimeState } from '../../content/stage'
import { PASSPORT, SPACETIME_READOUT_SHOW, SPACETIME_SHOW, passportOf } from '../../content/stage'
import { ANCHORS, SHOTS } from '../../content/stageVocab'
import { history, productFlip, productFlipByPatterns, voteFail } from '../../physics/qec/timelike'
import { FigureFor } from '../figures/FigureFor'
import { interpolate } from '../interp'
import { resolve, validateLayout, validateStage } from '../resolve'
import type { ResolvedSpacetime } from '../types'
import { SpacetimeScene } from './SpacetimeScene'
import { READOUT_LIMITS, spacetimeReadouts, spacetimeSummary, validateSpacetimeStage } from './spacetime'
import { readoutGeometry } from './SpacetimeReadoutScene'
import './kinds'

type H = Extract<SpacetimeState['history'], { mode: 'readout' }>
const S = (history: Omit<H, 'mode'>, extra: Omit<SpacetimeState, 'kind' | 'history'> = {}): SpacetimeState => ({ kind: 'spacetime', history: { mode: 'readout', ...history }, ...extra })
const R = (history: Omit<H, 'mode'>, extra: Omit<SpacetimeState, 'kind' | 'history'> = {}, s = 1) => resolve(S(history, extra), s) as ResolvedSpacetime
const texts = (r: ResolvedSpacetime) => spacetimeReadouts(r).map((x) => x.text)
const bad = (history: Omit<H, 'mode'>, extra: Omit<SpacetimeState, 'kind' | 'history'> = {}) => validateSpacetimeStage(S(history, extra))
const draw = (r: ResolvedSpacetime, mode: 'stage' | 'print', w: number, h: number, bare: boolean, slot: 'full' | 'top' | 'bottom') =>
  renderToString(
    <svg viewBox={`0 0 ${w} ${h}`}>
      <SpacetimeScene state={r} mode={mode} width={w} height={h} bare={bare} slot={slot} />
    </svg>,
  )

describe('spacetime readout: the passport, the drawer and the vocabulary', () => {
  it('takes the repeated-readout passport and its own toy-model drawer; the repetition mode keeps its passport and drawer', () => {
    const st = S({ checks: 3, rounds: 3 })
    expect(passportOf(st)).toMatchObject({ title: 'SPACE-TIME · repeated readout', fidelityKey: 'spacetime-readout' })
    expect(passportOf(st).note).toMatch(/^not a place/)
    expect(passportOf({ kind: 'spacetime', history: { code: 'rep', n: 3, rounds: 1 } })).toBe(PASSPORT.spacetime)
    const f = fidelityOf('spacetime-readout')
    for (const list of Object.values(f)) expect(list.length).toBeGreaterThan(0)
    expect(f.misleading.map((i) => i.id)).toEqual(['qc-spacetime-toy'])
    expect(f.misleading[0].text).toMatch(/toy model.*independently.*majority vote/)
    expect(fidelityOf('spacetime').misleading.map((i) => i.id)).toEqual(['qc-spacetime-repetition-only'])
  })
  it('the shot ST-READOUT and the anchors reading, product and vote exist; the repetition names are unchanged', () => {
    expect(SHOTS.spacetime).toContain('ST-READOUT')
    expect(ANCHORS.spacetime).toEqual(expect.arrayContaining(['reading', 'product', 'vote']))
    expect([...SPACETIME_READOUT_SHOW]).toEqual(['readings', 'product', 'vote'])
    expect([...SPACETIME_SHOW]).toEqual(['faults', 'detectors', 'matching', 'verdict'])
    expect(validateStage(S({ checks: 3, rounds: 3 }, { shot: 'ST-READOUT' }))).toEqual([])
    expect(validateStage({ ...S({ checks: 3, rounds: 3 }), shot: 'X-NOPE' as never })).toEqual(['spacetime: unknown shot "X-NOPE"'])
  })
})

describe('spacetime readout: the picture is the engine’s', () => {
  it('a seeded history is the engine’s history(m, R, q, seed), reading for reading', () => {
    const r = R({ checks: 4, rounds: 7, q: 0.15, seed: 11 })
    const h = history(4, 7, 0.15, 11)
    expect(r.readout!.flips).toEqual(h.flips)
    expect(r.readout!.wrong).toEqual(h.wrong)
    expect(r.readout!.wrongRounds).toBe(h.wrongRounds)
    expect(r.readout!.voteWrong).toBe(h.voteWrong)
    expect(r.readout!.source).toBe('seeded')
    expect([r.n, r.rounds]).toEqual([4, 7])
    expect(r.readout!.flipped).toBe(h.flips.flat().reduce((a, b) => a + b, 0))
  })
  it('authored faults are counted from 1: two flips in a round cancel (the product is right), one flip is wrong, a majority of wrong rounds makes the vote wrong', () => {
    const a = R({ checks: 3, rounds: 3, faults: [{ round: 1, check: 1 }, { round: 1, check: 2 }, { round: 3, check: 3 }] })
    expect(a.readout!.flips).toEqual([[1, 1, 0], [0, 0, 0], [0, 0, 1]])
    expect(a.readout!.wrong).toEqual([0, 0, 1])
    expect([a.readout!.flipped, a.readout!.wrongRounds, a.readout!.voteWrong]).toEqual([3, 1, false])
    const b = R({ checks: 3, rounds: 3, faults: [{ round: 1, check: 1 }, { round: 2, check: 1 }, { round: 3, check: 2 }] })
    expect(b.readout!.wrong).toEqual([1, 1, 1])
    expect(b.readout!.voteWrong).toBe(true)
    expect(R({ checks: 2, rounds: 5 }).readout!.flipped).toBe(0)
    expect(R({ checks: 2, rounds: 5 }).readout!.source).toBe('authored')
  })
  it('with q the chances are the engine’s: p = (1 − (1 − 2q)^m) / 2 (also by listing the 2^m patterns) and the vote failure is the binomial tail', () => {
    const r = R({ checks: 3, rounds: 3, q: 0.1, faults: [{ round: 2, check: 2 }] })
    expect(r.readout!.p).toBeCloseTo((1 - 0.8 ** 3) / 2, 12)
    expect(r.readout!.p).toBeCloseTo(productFlipByPatterns(0.1, 3), 12)
    const p = productFlip(0.1, 3)
    expect(r.readout!.voteFail).toBeCloseTo(3 * p * p * (1 - p) + p ** 3, 12)
    expect(r.readout!.voteFail).toBe(voteFail(3, p))
    expect(texts(r)).toContain(`p = ${p.toPrecision(3)}`)
    expect(texts(r)).toContain(`vote failure ${voteFail(3, p).toPrecision(3)}`)
    // seven repeats of the three-check product at q = 0.05 reach the plan’s small numbers
    expect(R({ checks: 1, rounds: 1, q: 0.075, faults: [] }).readout!.voteFail).toBeCloseTo(0.075, 12)
  })
  it('without q there are no chances; the readouts follow `show`', () => {
    const r = R({ checks: 3, rounds: 5, faults: [{ round: 1, check: 1 }, { round: 2, check: 1 }, { round: 3, check: 1 }] }, { show: ['readings', 'product', 'vote'] })
    expect(r.readout!.p).toBeNull()
    expect(texts(r)).toEqual(['readings flipped: 3', 'wrong rounds: 3 of 5', 'vote: wrong'])
    expect(texts(R({ checks: 3, rounds: 5, faults: [{ round: 1, check: 1 }] }))).toEqual(['readings flipped: 1'])
    expect(texts(R({ checks: 3, rounds: 5, faults: [{ round: 1, check: 1 }] }, { show: ['vote'] }))).toEqual(['readings flipped: 1', 'vote: right'])
    expect(spacetimeSummary(r)).toMatch(/^repeated readout, 3 checks, 5 rounds; readings flipped: 3/)
  })
  it('the repetition mode is untouched: its resolved state has no readout and the same numbers', () => {
    const r = resolve({ kind: 'spacetime', history: { code: 'rep', n: 5, rounds: 2 } }, 1) as ResolvedSpacetime
    expect(r.readout).toBeNull()
    expect(r.detectors).toHaveLength(12)
  })
})

describe('spacetime readout: validation names the field', () => {
  it('accepts the plan’s histories and the limits', () => {
    expect(bad({ checks: 3, rounds: 7, q: 0.05, seed: 3 })).toEqual([])
    expect(bad({ checks: 8, rounds: 11, faults: Array.from({ length: 24 }, (_, i) => ({ round: (i % 11) + 1, check: (i % 8) + 1 })).filter((f, i, a) => a.findIndex((g) => g.round === f.round && g.check === f.check) === i) })).toEqual([])
    expect(bad({ checks: 1, rounds: 1 }, { show: ['readings', 'product', 'vote'] })).toEqual([])
    expect(bad({ checks: 3, rounds: 3, q: 0.1, faults: [{ round: 1, check: 1 }] })).toEqual([])
    expect([READOUT_LIMITS.mMax, READOUT_LIMITS.rMax, READOUT_LIMITS.faultsMax]).toEqual([8, 11, 24])
  })
  it('refuses checks outside 1–8, an even or out-of-range number of rounds, and a bad q or seed', () => {
    expect(bad({ checks: 0, rounds: 3 })).toEqual(['spacetime history.checks: a whole number 1–8 (seam checks)'])
    expect(bad({ checks: 9, rounds: 3 })[0]).toMatch(/history\.checks/)
    expect(bad({ checks: 2.5, rounds: 3 })[0]).toMatch(/history\.checks/)
    expect(bad({ checks: 3, rounds: 4 })).toEqual(['spacetime history.rounds: an odd whole number 1–11 (so the majority vote cannot tie)'])
    expect(bad({ checks: 3, rounds: 13 })[0]).toMatch(/history\.rounds/)
    expect(bad({ checks: 3, rounds: 3, q: 1.5, faults: [] })[0]).toMatch(/history\.q: a chance/)
    expect(bad({ checks: 3, rounds: 3, q: 0.1, seed: 1.5 })[0]).toMatch(/history\.seed: a whole number/)
  })
  it('seed needs q and excludes faults; q alone (no faults, no seed) is refused; faults are checked place by place', () => {
    expect(bad({ checks: 3, rounds: 3, seed: 1 })).toEqual(['spacetime history.seed: the flips are drawn with chance q; give q too'])
    expect(bad({ checks: 3, rounds: 3, q: 0.1, seed: 1, faults: [{ round: 1, check: 1 }] })).toEqual(['spacetime history: faults or seed, not both (a seed draws the flips)'])
    expect(bad({ checks: 3, rounds: 3, q: 0.1 })[0]).toMatch(/history\.q: without faults it needs a seed/)
    expect(bad({ checks: 3, rounds: 3, faults: [{ round: 4, check: 1 }] })).toEqual(['spacetime history.faults[0].round: a round from 1 to 3'])
    expect(bad({ checks: 3, rounds: 3, faults: [{ round: 1, check: 0 }] })).toEqual(['spacetime history.faults[0].check: a check from 1 to 3'])
    expect(bad({ checks: 3, rounds: 3, faults: [{ round: 1, check: 1 }, { round: 1, check: 1 }] })).toEqual(['spacetime history.faults[1]: the same reading twice (a reading is flipped or not)'])
    expect(bad({ checks: 8, rounds: 11, faults: Array.from({ length: 25 }, (_, i) => ({ round: (i % 11) + 1, check: Math.floor(i / 11) + 1 })) })[0]).toMatch(/at most 24 flipped readings/)
  })
  it('show takes the readout names only (a repetition name says which mode it belongs to); cursor and spectrum are for the other mode', () => {
    expect(bad({ checks: 3, rounds: 3 }, { show: ['faults' as never] })[0]).toMatch(/'faults' is for the repetition-code mode/)
    expect(bad({ checks: 3, rounds: 3 }, { show: ['readings', 'readings'] })).toEqual(['spacetime show: each name once'])
    expect(bad({ checks: 3, rounds: 3 }, { cursor: 1 })).toEqual(['spacetime cursor: for the repetition-code mode only'])
    expect(bad({ checks: 3, rounds: 3 }, { spectrum: { maxW: 2 } })).toEqual(['spacetime spectrum: for the repetition-code mode only'])
    // and a readout name in the repetition mode points to the readout mode
    const rep = validateSpacetimeStage({ kind: 'spacetime', history: { code: 'rep', n: 3, rounds: 1 }, show: ['vote' as never] })
    expect(rep[0]).toMatch(/readout names are for history\.mode "readout"/)
  })
  it('a mode that is neither is refused, and the layout checks reach it', () => {
    expect(validateSpacetimeStage({ kind: 'spacetime', history: { mode: 'x', checks: 3, rounds: 3 } as never })[0]).toMatch(/history\.mode: 'readout'/)
    expect(validateLayout({ layout: 'split', top: S({ checks: 3, rounds: 3 }), bottom: { kind: 'plot', curve: { fn: 'identityP' } } })).toEqual([])
  })
})

describe('spacetime readout: interpolation', () => {
  it('the same history stays; another history switches at the half-way point', () => {
    const a = resolve(S({ checks: 3, rounds: 3, faults: [{ round: 1, check: 1 }] }), 1)
    const b = resolve(S({ checks: 3, rounds: 5, faults: [{ round: 1, check: 1 }] }), 1)
    expect(interpolate(a, b, 0.4)).toBe(a)
    expect(interpolate(a, b, 0.6)).toBe(b)
    const same = interpolate(a, resolve(S({ checks: 3, rounds: 3, faults: [{ round: 1, check: 1 }] }), 1), 0.5) as ResolvedSpacetime
    expect(same.readout!.flipped).toBe(1)
  })
})

const BOXES = [
  ['stage', 640, 560, false, 'full'],
  ['stage', 375, 520, false, 'full'],
  ['stage', 375, 420, false, 'top'],
  ['print', 320, 300, false, 'full'],
  ['stage', 360, 320, true, 'full'],
] as const

describe('spacetime readout: the scene', () => {
  const cases: SpacetimeState[] = [
    S({ checks: 3, rounds: 7, q: 0.1, seed: 5 }, { show: ['readings', 'product', 'vote'] }),
    S({ checks: 8, rounds: 11, q: 0.2, seed: 9 }, { show: ['readings', 'product', 'vote'] }),
    S({ checks: 1, rounds: 1, faults: [{ round: 1, check: 1 }] }, { show: ['readings', 'product', 'vote'] }),
    S({ checks: 5, rounds: 5 }),
    S({ checks: 4, rounds: 9, faults: [{ round: 2, check: 2 }, { round: 2, check: 3 }, { round: 9, check: 4 }] }, { show: ['product'] }),
  ]
  it('draws with no NaN in every box, names every flipped reading and every product reading, and writes the vote', () => {
    for (const st of cases) {
      const r = resolve(st, 1) as ResolvedSpacetime
      for (const [mode, w, h, bare, slot] of BOXES) {
        const html = draw(r, mode, w, h, bare, slot)
        const where = `${JSON.stringify(st.history)} ${mode} ${w}x${h}`
        expect(html, where).not.toMatch(/NaN|Infinity|undefined/)
        expect(html).toContain('data-kind="spacetime"')
        expect(html).toContain('data-view="readout"')
        const flipped = (html.match(/data-flipped="1"/g) ?? []).length
        expect(flipped, where).toBe(r.show.includes('readings') ? r.readout!.flipped : 0)
        expect((html.match(/aria-label="flipped reading: check \d+, round \d+"/g) ?? []).length, where).toBe(flipped)
        expect((html.match(/aria-label="round \d+: product reading (wrong|right)/g) ?? []).length, where).toBe(r.show.includes('product') ? r.rounds : 0)
        if (r.show.includes('vote')) expect(html).toContain(`vote: ${r.readout!.voteWrong ? 'wrong' : 'right'}`)
        else expect(html).not.toContain('vote: ')
      }
    }
  })
  it('packs inside the box, clear of the figure’s text lines, with the product column and the vote row in the area', () => {
    for (const st of cases) {
      const r = resolve(st, 1) as ResolvedSpacetime
      const o = r.readout!
      for (const [mode, w, h, bare, slot] of BOXES) {
        const g = readoutGeometry(r, w, h, mode === 'print' || bare, slot)
        const where = `${JSON.stringify(st.history)} ${mode} ${w}x${h} ${slot}`
        for (let t = 0; t < o.R; t++)
          for (let i = 0; i < o.m; i++) {
            expect(g.colX(i) - g.disc, where).toBeGreaterThanOrEqual(0)
            expect(g.colX(i) + g.disc, where).toBeLessThanOrEqual(w)
            expect(g.rowY(t) - g.disc, where).toBeGreaterThanOrEqual(g.area.y)
            expect(g.rowY(t) + g.disc, where).toBeLessThanOrEqual(g.area.y + g.area.h - 22)
          }
        if (g.prodX !== null) expect(g.prodX + g.box + 40, where).toBeLessThanOrEqual(w)
        if (g.voteY !== null) {
          expect(g.voteY, where).toBeGreaterThan(g.rowY(o.R - 1) + g.disc)
          expect(g.voteY + 24, where).toBeLessThanOrEqual(g.legendY)
        }
        if (g.lines.length) expect(6 + 13 * g.lines.length, where).toBeLessThanOrEqual(g.area.y + 1)
        // neighbouring readings never touch
        if (o.m > 1) expect(g.dx - 2 * g.disc, where).toBeGreaterThan(0)
        if (o.R > 1) expect(g.dy - 2 * g.disc, where).toBeGreaterThan(0)
      }
    }
  })
  it('the print figure carries the plan’s numbers as text lines', () => {
    const html = renderToString(<FigureFor layout={cases[0]} number="B3.4" />)
    expect(html).toContain('repeated readout')
    expect(html).toMatch(/readings flipped: \d+/)
    expect(html).toContain('vote failure')
    expect(html).not.toMatch(/NaN|Infinity|undefined|no print drawing yet/)
  })
})
