/**
 * The SG bench's model against the engine (P truth: every number a learner reads comes from app/src/physics):
 *   - fractions per path: the Born fractions equal the engine's `sequenceOutcomes` path by path, for random setups
 *     (every source, arbitrary tilts, both kept signs);
 *   - each magnet's "passes" is P(kept | arrived), equal to the engine's ratios wherever atoms arrive;
 *   - the three-magnet surprise (z → z has no − spot; z → x → z brings it back at 1/8);
 *   - keep-± bookkeeping (counts add up; a flipped stop sends the atoms the other way);
 *   - seeded counts are reproducible and equal `fireMany`'s; a new seed per volley;
 *   - the binomial scatter is the engine's `binomialStd`/N, and the readouts print it;
 *   - the preset allowlist (crafted ids rejected; every tilt a multiple of 90°: no middle tilt strictly between 0°
 *     and 90°, the Physics 709 HW1 P2 guard);
 *   - the Try this is true (9/32 vs 12/32) and states no maximum;
 *   - the fidelity note is well formed.
 */
import { describe, expect, it } from 'vitest'
import { FIDELITY, FIDELITY_VARIANT } from '../../../content/fidelity'
import { texSpans } from '../../../content/walk'
import { binomialStd, rng } from '../../../physics/random'
import { benchTheory, fireMany, sequenceOutcomes, type Sign } from '../../../physics/sg'
import { renderAuthoredTexStrict } from '../../../ui/tex'
import { presetFrom } from '../../presets'
import { SG_FIDELITY } from './fidelity'
import {
  addCounts,
  benchOf,
  chainText,
  cleanSetup,
  count,
  emptyCounts,
  fractionScatter,
  passOf,
  pct1,
  PRESET_ORDER,
  readoutsOf,
  seedOf,
  SETUPS,
  snapTilt,
  SOURCES,
  stepTilt,
  theoryOf,
  TRY_SETUPS,
  TRY_THIS,
  tryThisAnswer,
  volleyOf,
  wrapTilt,
  type SgSetup,
  type SgSource,
} from './model'

const NBSP = '\u00a0'
const NNBSP = '\u202f'
const ro = (s: SgSetup, c = emptyCounts(s.tilts.length)) => Object.fromEntries(readoutsOf(s, c).map((r) => [r.key, r.text]))

/** Random setups: every source, 1–4 magnets, tilts anywhere in [0, 360), both kept signs. */
function randomSetups(n: number, seed = 7): SgSetup[] {
  const r = rng(seed)
  return Array.from({ length: n }, () => {
    const m = 1 + Math.floor(r() * 4)
    const tilts = Array.from({ length: m }, () => Math.floor(r() * 360))
    const keep = Array.from({ length: m - 1 }, (): Sign => (r() < 0.5 ? '+' : '-'))
    return { source: SOURCES[Math.floor(r() * SOURCES.length)], tilts, keep }
  })
}

describe('Born fractions come from the engine, path by path', () => {
  it('plus, minus and every stop equal the sums of sequenceOutcomes over the matching sign paths (200 random setups)', () => {
    for (const s of randomSetups(200)) {
      const th = theoryOf(s)
      const paths = sequenceOutcomes({ source: s.source, axes: s.tilts })
      const kept = s.keep.join('')
      expect(th.plus, chainText(s)).toBeCloseTo(paths[`${kept}+`], 12)
      expect(th.minus, chainText(s)).toBeCloseTo(paths[`${kept}-`], 12)
      th.blocked.forEach((b, k) => {
        const flip = s.keep[k] === '+' ? '-' : '+'
        const prefix = kept.slice(0, k) + flip
        const sum = Object.entries(paths)
          .filter(([p]) => p.startsWith(prefix))
          .reduce((a, [, v]) => a + v, 0)
        expect(b, `${chainText(s)} stop ${k}`).toBeCloseTo(sum, 12)
      })
      expect(th.plus + th.minus + th.blocked.reduce((a, b) => a + b, 0)).toBeCloseTo(1, 12)
      // the readouts print exactly these
      const r = ro(s)
      expect(r['born-plus']).toBe(`+ spot · Born ${pct1(th.plus)}`)
      expect(r['born-minus']).toBe(`− spot · Born ${pct1(th.minus)}`)
    }
  })

  it('"passes" is P(kept | arrived): the engine’s ratio wherever atoms arrive; ½ at the first magnet from the oven', () => {
    for (const s of randomSetups(200, 11)) {
      const th = theoryOf(s)
      let alive = 1
      for (let k = 0; k < s.tilts.length - 1; k++) {
        const p = passOf(s, k)!
        expect(p).toBeGreaterThanOrEqual(0)
        expect(p).toBeLessThanOrEqual(1)
        if (alive > 1e-9) expect(p, `${chainText(s)} magnet ${k + 1}`).toBeCloseTo(1 - th.blocked[k] / alive, 9)
        alive -= th.blocked[k]
      }
      expect(passOf(s, s.tilts.length - 1)).toBeNull()
      if (s.source === 'oven' && s.tilts.length > 1) expect(passOf(s, 0)).toBe(0.5)
    }
  })

  it('hand values: magnet 2 at 60° after z keeping + passes cos²30° = 75 % (D-lab’s example line)', () => {
    const s: SgSetup = { source: 'oven', tilts: [0, 60, 0], keep: ['+', '+'] }
    expect(passOf(s, 1)).toBeCloseTo(0.75, 12)
    expect(ro(s)['m2']).toBe(`magnet 2 · 60° · passes 75.0${NBSP}%`)
  })

  it('a sealed |±y⟩ source gives half and half on any magnet the bench can build (every n lies in the x–z plane)', () => {
    for (const src of ['+y', '-y'] as const)
      for (let t = 0; t < 360; t += 15) {
        const th = theoryOf({ source: src, tilts: [t], keep: [] })
        expect(th.plus).toBeCloseTo(0.5, 12)
        expect(th.minus).toBeCloseTo(0.5, 12)
      }
  })
})

describe('the three-magnet surprise', () => {
  it('z → z keeping + has no − spot; an x magnet between them brings it back at 1/8 of the atoms', () => {
    const zz = theoryOf(SETUPS['l1-zz'])
    expect(zz.plus).toBeCloseTo(0.5, 12)
    expect(zz.minus).toBeCloseTo(0, 12)
    const zxz = theoryOf(SETUPS['l1-zxz'])
    expect(zxz.plus).toBeCloseTo(1 / 8, 12)
    expect(zxz.minus).toBeCloseTo(1 / 8, 12)
    expect(zxz.blocked[0]).toBeCloseTo(1 / 2, 12)
    expect(zxz.blocked[1]).toBeCloseTo(1 / 4, 12)
    expect(ro(SETUPS['l1-zxz'])['born-minus']).toBe(`− spot · Born 12.5${NBSP}%`)
    expect(ro(SETUPS['l1-zz'])['born-minus']).toBe(`− spot · Born 0.0${NBSP}%`)
  })
  it('a magnet turned by 180° measures along −z: after z keeping +, every atom lands in its − spot', () => {
    const th = theoryOf(SETUPS['l1-flip'])
    expect(th.minus).toBeCloseTo(0.5, 12)
    expect(th.plus).toBeCloseTo(0, 12)
  })
})

describe('keep-± bookkeeping', () => {
  it('counts add up: plus + minus + every stop = the atoms fired; cumulative over volleys', () => {
    for (const s of randomSetups(40, 3)) {
      const a = volleyOf(s, 500, 1).counts
      const b = volleyOf(s, 300, 2).counts
      const c = addCounts(a, b)
      expect(c.n).toBe(800)
      expect(c.plus + c.minus + c.blocked.reduce((x, y) => x + y, 0)).toBe(800)
      expect(c.blocked).toHaveLength(s.tilts.length - 1)
    }
  })
  it('flipping a stop sends the atoms the other way (z → z: keep + lands all +, keep − lands all −)', () => {
    const plus = theoryOf({ source: 'oven', tilts: [0, 0], keep: ['+'] })
    const minus = theoryOf({ source: 'oven', tilts: [0, 0], keep: ['-'] })
    expect([plus.plus, plus.minus]).toEqual([0.5, 0])
    expect(minus.plus).toBeCloseTo(0, 12)
    expect(minus.minus).toBeCloseTo(0.5, 12)
    const v = volleyOf({ source: 'oven', tilts: [0, 0], keep: ['-'] }, 1000, 99).counts
    expect(v.plus).toBe(0)
    expect(v.minus + v.blocked[0]).toBe(1000)
  })
  it('cleanSetup: 1–4 magnets, whole degrees in [0, 360), one kept sign per stop', () => {
    expect(cleanSetup({ source: 'oven', tilts: [], keep: [] }).tilts).toEqual([0])
    expect(cleanSetup({ source: 'oven', tilts: [0, 1, 2, 3, 4, 5], keep: [] })).toEqual({ source: 'oven', tilts: [0, 1, 2, 3], keep: ['+', '+', '+'] })
    expect(cleanSetup({ source: 'bad' as SgSource, tilts: [-15, 720.4, NaN], keep: ['-', '-', '-'] })).toEqual({ source: 'oven', tilts: [345, 0, 0], keep: ['-', '-'] })
  })
})

describe('seeded samples', () => {
  it('the same seed gives the same fates, and the counts equal the engine’s fireMany with that seed', () => {
    for (const s of randomSetups(30, 5)) {
      const seed = seedOf(4)
      const a = volleyOf(s, 1000, seed)
      const b = volleyOf(s, 1000, seed)
      expect(a.fates).toEqual(b.fates)
      const t = fireMany(benchOf(s), 1000, rng(seed))
      expect({ plus: a.counts.plus, minus: a.counts.minus, blocked: a.counts.blocked }).toEqual(t)
    }
  })
  it('a new seed per volley: the first 1 000 seeds are distinct and never 0; two volleys scatter differently', () => {
    const seeds = Array.from({ length: 1000 }, (_, k) => seedOf(k))
    expect(new Set(seeds).size).toBe(1000)
    expect(seeds.every((x) => x > 0 && Number.isInteger(x))).toBe(true)
    const s = SETUPS['l1-zx']
    const c = [0, 1, 2, 3].map((k) => volleyOf(s, 1000, seedOf(k)).counts.plus)
    expect(new Set(c).size).toBeGreaterThan(1)
  })
  it('samples scatter like the engine says: 200 volleys of 1 000 have a spread near binomialStd', () => {
    const s = SETUPS['l1-zx']
    const p = theoryOf(s).plus
    const xs = Array.from({ length: 200 }, (_, k) => volleyOf(s, 1000, seedOf(k)).counts.plus)
    const mean = xs.reduce((a, b) => a + b, 0) / xs.length
    const sd = Math.sqrt(xs.reduce((a, b) => a + (b - mean) ** 2, 0) / (xs.length - 1))
    expect(Math.abs(mean - 1000 * p)).toBeLessThan(4 * (binomialStd(1000, p) / Math.sqrt(200)))
    expect(sd / binomialStd(1000, p)).toBeGreaterThan(0.8)
    expect(sd / binomialStd(1000, p)).toBeLessThan(1.2)
  })
})

describe('the binomial scatter and the readouts', () => {
  it('fractionScatter = binomialStd(N, p)/N; D-lab’s example prints “Born 25.0 % ± 1.4 %” at N = 1 000', () => {
    expect(fractionScatter(0, 0.25)).toBeNull()
    expect(fractionScatter(1000, 0.25)).toBeCloseTo(binomialStd(1000, 0.25) / 1000, 15)
    expect(fractionScatter(1000, 0.25)).toBeCloseTo(Math.sqrt(0.25 * 0.75 / 1000), 15)
    expect(pct1(fractionScatter(1000, 0.25)!)).toBe(`1.4${NBSP}%`)
    // the default bench (oven → z keep + → x): + and − spots 25 % each, half the atoms stopped
    const s = SETUPS['l1-zx']
    const v = volleyOf(s, 1000, seedOf(0)).counts
    const r = ro(s, v)
    expect(r['born-plus']).toBe(`+ spot · Born 25.0${NBSP}% ± 1.4${NBSP}%`)
    expect(r['born-minus']).toBe(`− spot · Born 25.0${NBSP}% ± 1.4${NBSP}%`)
    expect(r['tally']).toBe(`+ ${v.plus} · − ${v.minus} · stopped ${v.blocked[0]} / 1${NNBSP}000`)
    expect(r['counted']).toBe(`counted: + ${pct1(v.plus / 1000)} · − ${pct1(v.minus / 1000)}`)
    expect(r['m1']).toBe(`magnet 1 · 0° · passes 50.0${NBSP}%`)
    expect(r['m2']).toBe('magnet 2 · 90° · to the plate')
    expect(r['source']).toBe('source · oven (unpolarized)')
  })
  it('before any volley the tally says so and no scatter is printed', () => {
    const r = ro(SETUPS['l1-zx'])
    expect(r['tally']).toBe('nothing fired yet')
    expect(r['born-plus']).not.toMatch(/±/)
    expect(r['counted']).toBeUndefined()
  })
  it('counts are grouped in thousands with a narrow no-break space; percentages never break before %', () => {
    expect(count(10000)).toBe(`10${NNBSP}000`)
    expect(count(999)).toBe('999')
    expect(pct1(1 / 3)).toBe(`33.3${NBSP}%`)
    expect(pct1(-1e-15)).toBe(`0.0${NBSP}%`)
  })
})

describe('tilts', () => {
  it('wrap, snap to 15° (Shift: 1°) and step to the next mark', () => {
    expect([wrapTilt(-15), wrapTilt(360), wrapTilt(725), wrapTilt(NaN)]).toEqual([345, 0, 5, 0])
    expect([snapTilt(52), snapTilt(52.6, true), snapTilt(359)]).toEqual([45, 53, 0])
    expect([stepTilt(0, 1), stepTilt(0, -1), stepTilt(7, 1), stepTilt(7, -1), stepTilt(45, 1), stepTilt(59, 1, true)]).toEqual([15, 345, 15, 0, 60, 60])
  })
})

describe('preset allowlist (decisions/lab.md ruling 7; qc709-pilots ruling 3)', () => {
  it('each id is allowlisted and reads as it is; crafted ids are not', () => {
    for (const id of PRESET_ORDER) {
      expect(presetFrom(SETUPS, id)).toBe(id)
      const p = SETUPS[id]
      expect(cleanSetup(p)).toEqual({ source: p.source, tilts: p.tilts, keep: p.keep })
    }
    expect(Object.keys(SETUPS).sort()).toEqual([...PRESET_ORDER].sort())
    for (const bad of ['', 'L1-ZXZ', 'l1-zxz ', 'l1-zxz&tilts=60', '__proto__', 'constructor', 'toString', 'l1-z60z', '%6c1-zxz', 'a'.repeat(40), '../l1-zx'])
      expect(presetFrom(SETUPS, bad), bad).toBeNull()
  })
  it('HW1 P2 guard: every preset tilt is a multiple of 90° (no middle magnet strictly between 0° and 90°)', () => {
    for (const id of PRESET_ORDER) {
      const t = SETUPS[id].tilts
      for (const d of t) expect(d % 90, `${id}: ${d}°`).toBe(0)
      for (const d of t.slice(1, -1)) expect(d > 0 && d < 90, `${id}: middle ${d}°`).toBe(false)
    }
  })
  it('the default bench is D-lab’s example (oven → z keep + → x)', () => {
    expect(chainText(SETUPS['l1-zx'])).toBe('oven → z keep + → x')
    expect(chainText(SETUPS['l1-zxz'])).toBe('oven → z keep + → x keep + → z')
  })
})

describe('the Try this is true (checked with the engine) and does no homework', () => {
  it('z → 60° → z keeping + from the oven: 9/32 reach the + spot; swapped to z → z → 60°: 12/32', () => {
    const [a, b] = TRY_SETUPS
    expect(chainText(a)).toBe('oven → z keep + → 60° keep + → z')
    expect(chainText(b)).toBe('oven → z keep + → z keep + → 60°')
    expect(benchTheory(benchOf(a)).plus).toBeCloseTo(9 / 32, 12)
    expect(benchTheory(benchOf(b)).plus).toBeCloseTo(12 / 32, 12)
    // the reasons the answer gives: the 60° magnet passes ¾ of |+z⟩; the last z magnet reads |+60°⟩ as + three times in four;
    // in the other order the second z magnet passes every |+z⟩ atom
    expect(passOf(a, 1)).toBeCloseTo(3 / 4, 12)
    const lastReadsPlus = sequenceOutcomes({ source: 'oven', axes: [0, 60, 0] })
    expect(lastReadsPlus['+++'] / (lastReadsPlus['+++'] + lastReadsPlus['++-'])).toBeCloseTo(3 / 4, 12)
    expect(passOf(b, 1)).toBeCloseTo(1, 12)
    const ans = tryThisAnswer()
    expect(ans).toContain(`${pct1(9 / 32)} of the atoms to the + spot (9/32)`)
    expect(ans).toContain(`sends ${pct1(12 / 32)} (12/32)`)
    expect(pct1(9 / 32)).toBe(`28.1${NBSP}%`)
    expect(pct1(12 / 32)).toBe(`37.5${NBSP}%`)
  })
  it('it states no maximum, no − spot fraction and no curve; the bench is built by hand (no preset has a 60° magnet)', () => {
    for (const text of [TRY_THIS, tryThisAnswer()]) {
      expect(text).not.toMatch(/maxim|optim|largest|smallest|best tilt|as a function/i)
      expect(text).not.toMatch(/− spot|minus spot/)
    }
    for (const id of PRESET_ORDER) expect(SETUPS[id].tilts).not.toContain(60)
    expect(TRY_THIS).toMatch(/fire 10 000/)
  })
})

describe('fidelity note', () => {
  it('items in every group; ids unique, well-formed, distinct from the lecture notes; TeX typesets; D-lab’s three claims', () => {
    const lecture = new Set([...Object.values(FIDELITY), ...Object.values(FIDELITY_VARIANT)].flatMap((f) => [...f.exact, ...f.schematic, ...f.misleading]).map((i) => i.id))
    const all = [...SG_FIDELITY.exact, ...SG_FIDELITY.schematic, ...SG_FIDELITY.misleading]
    for (const grp of [SG_FIDELITY.exact, SG_FIDELITY.schematic, SG_FIDELITY.misleading]) expect(grp.length).toBeGreaterThan(0)
    const ids = all.map((i) => i.id)
    expect(new Set(ids).size).toBe(ids.length)
    for (const id of ids) {
      expect(/^[a-z0-9-]+$/.test(id), id).toBe(true)
      expect(lecture.has(id), id).toBe(false)
    }
    for (const i of all) for (const sp of texSpans(i.text)) expect(() => renderAuthoredTexStrict(sp.tex), i.id).not.toThrow()
    const exact = JSON.stringify(SG_FIDELITY.exact)
    expect(exact).toMatch(/Born fraction/)
    expect(exact).toMatch(/honest sample/)
    expect(JSON.stringify(SG_FIDELITY.schematic)).toMatch(/not to scale/)
    expect(JSON.stringify(SG_FIDELITY.misleading)).toMatch(/turn only about the beam/)
    expect(JSON.stringify(SG_FIDELITY.misleading)).toMatch(/sealed box/)
  })
})
