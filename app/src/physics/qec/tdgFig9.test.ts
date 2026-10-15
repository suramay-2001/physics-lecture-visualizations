/**
 * physics/qec/tdgFig9.ts against the offline computation of Fig. 9 of "Tour de gross" (pipeline/tdg_fig9.py -> __fixtures__/tdg-fig9.json: a breadth-first search over all 4^11 Paulis for each
 * code, reading and pivot letter). Four layers:
 *   1. cheap invariants of the fixture itself (histogram totals, beta values, means, the symmetry of X and Z, the minimum over Q),
 *   2. the fixture's native counts against the TypeScript engine (tdg.ts `tdgNativeSets`: 540 natives, 245 and 510 rotations) and against the native sets tdgFig9.ts rebuilds,
 *   3. the literal TDG_FIG9_OFFLINE against the fixture,
 *   4. an independent re-derivation in TypeScript: every sampled Pauli's cost by a meet-in-the-middle search (not the numpy algorithm), a plain two-rotation search for the
 *      claim "no route within two rotations" on the dear ones, and one complete breadth-first histogram.
 *
 * Histogram totals: for Q = X, Y, Z the histogram covers all 4^11 Paulis P (the identity costs beta = 1, because Q alone is native); for Q = I the identity I (x) I is no
 * measurement, so it is left out and the histogram covers 4^11 - 1.
 */
import { describe, expect, it, vi } from 'vitest'
import raw from '../__fixtures__/tdg-fig9.json?raw'
import { tdgBeta, tdgNativeSets, type TdgCode } from './tdg'
import {
  TDG_FIG9_BETAS,
  TDG_FIG9_OFFLINE,
  TDG_FIG9_Q,
  TDG_FIG9_READINGS,
  TDG_FIG9_STATES,
  tdgFig9Anticommute,
  tdgFig9Ball,
  tdgFig9Distance,
  tdgFig9Distances,
  tdgFig9Histogram,
  tdgFig9Native,
  tdgFig9Summary,
  type TdgFig9Reading,
} from './tdgFig9'

vi.setConfig({ testTimeout: 120_000 })

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const FX: any = JSON.parse(raw)
const CODES: readonly TdgCode[] = ['gross', 'two-gross']

describe('the fixture of pipeline/tdg_fig9.py: invariants', () => {
  it('names its script and the size of the search', () => {
    expect(FX.about).toMatch(/pipeline\/tdg_fig9\.py/)
    expect(FX.about).toMatch(/4\^11/)
    expect(FX.states).toBe(4 ** 11)
    expect(FX.states).toBe(TDG_FIG9_STATES)
    expect(FX.sizes).toEqual({ native: 540, rotations245: 245, rotations510: 510 })
  })

  it('is public: no local path and no e-mail address', () => {
    expect(raw).not.toMatch(/\/Users\/|\/home\/|\/private\/|\/tmp\//)
    expect(raw).not.toMatch(/[A-Za-z0-9._-]+@[A-Za-z0-9-]+\./)
  })

  it('every histogram has the five beta values, sums to 4^11 (4^11 - 1 for Q = I), and its mean is sum(beta count) / total', () => {
    for (const code of CODES)
      for (const reading of TDG_FIG9_READINGS) {
        const entry = FX.codes[code][reading]
        const all = [...TDG_FIG9_Q.map((q) => ({ q, s: entry.byQ[q] })), { q: 'best', s: entry.minOverQ }]
        for (const { q, s } of all) {
          expect(Object.keys(s.hist).map(Number), `${code} ${reading} ${q}`).toEqual([...TDG_FIG9_BETAS])
          const counts = TDG_FIG9_BETAS.map((b) => s.hist[b] as number)
          const total = counts.reduce((u, c) => u + c, 0)
          expect(total, `${code} ${reading} ${q}`).toBe(q === 'I' ? 4 ** 11 - 1 : 4 ** 11)
          expect(s.total).toBe(total)
          const sum = counts.reduce((u, c, i) => u + TDG_FIG9_BETAS[i] * c, 0)
          expect(s.sum).toBe(sum)
          expect(s.mean).toBe(sum / total)
        }
      }
  })

  it('beta is 1 + 6k: the five values are 1, 7, 13, 19, 25 for k = 0 .. 4', () => {
    expect([0, 1, 2, 3, 4].map(tdgBeta)).toEqual([...TDG_FIG9_BETAS])
  })

  it('the cheapest pivot letter per Pauli beats every single letter, and the means are the ones the lecture quotes', () => {
    for (const code of CODES)
      for (const reading of TDG_FIG9_READINGS) {
        const e = FX.codes[code][reading]
        for (const q of ['X', 'Y', 'Z']) expect(e.minOverQ.mean).toBeLessThan(e.byQ[q].mean)
        // X and Z play the same role in the native set: the same histogram
        expect(e.byQ.X.hist).toEqual(e.byQ.Z.hist)
      }
    const best = (code: TdgCode, reading: TdgFig9Reading): number => FX.codes[code][reading].minOverQ.mean
    expect(best('gross', 'rotations245')).toBeCloseTo(18.526, 3)
    expect(best('two-gross', 'rotations245')).toBeCloseTo(18.482, 3)
    expect(best('gross', 'rotations510')).toBeCloseTo(16.483, 3)
    expect(best('two-gross', 'rotations510')).toBeCloseTo(16.457, 3)
    // the single-letter histograms behind them
    expect(FX.codes.gross.rotations245.byQ.X.hist).toEqual({ 1: 112, 7: 9605, 13: 441315, 19: 3528309, 25: 214963 })
    expect(FX.codes.gross.rotations245.byQ.Y.hist).toEqual({ 1: 32, 7: 3603, 13: 218669, 19: 3291416, 25: 680584 })
  })

  it('more rotations never cost more: the 510-rotation means are below the 245-rotation means', () => {
    for (const code of CODES) {
      for (const q of TDG_FIG9_Q) expect(FX.codes[code].rotations510.byQ[q].mean).toBeLessThan(FX.codes[code].rotations245.byQ[q].mean)
      expect(FX.codes[code].rotations510.minOverQ.mean).toBeLessThan(FX.codes[code].rotations245.minOverQ.mean)
    }
  })

  it('the one-rotation-free Paulis are exactly the targets: hist[1] equals the number of natives with that pivot letter', () => {
    for (const code of CODES)
      for (const reading of TDG_FIG9_READINGS)
        for (const q of TDG_FIG9_Q) {
          const e = FX.codes[code][reading]
          expect(e.byQ[q].hist[1], `${code} ${reading} ${q}`).toBe(e.seeds[q])
        }
  })

  it('the sample is stratified (6, 10, 16, 20, 12 per beta level), non-identity, and in range', () => {
    const quota = [6, 10, 16, 20, 12]
    for (const code of CODES)
      for (const q of TDG_FIG9_Q) {
        const s = FX.sample[code][q] as { pauli: number[]; beta: number[] }
        expect(s.pauli).toHaveLength(64)
        expect(s.beta).toHaveLength(64)
        expect(new Set(s.pauli).size).toBe(64)
        for (const p of s.pauli) {
          expect(p).toBeGreaterThan(0)
          expect(p).toBeLessThan(TDG_FIG9_STATES)
        }
        expect(TDG_FIG9_BETAS.map((b) => s.beta.filter((x) => x === b).length)).toEqual(quota)
      }
  })
})

describe('the native sets of the fixture against the engine', () => {
  it('540 natives, 245 rotations with a pivot letter X, Y or Z, 510 with the pivot letter I allowed (tdg.ts tdgNativeSets)', () => {
    for (const code of CODES) {
      const n = tdgNativeSets(code)
      expect(n.native).toBe(FX.sizes.native)
      expect(n.rotations).toBe(FX.sizes.rotations245)
      expect(n.rotationsAny).toBe(FX.sizes.rotations510)
      expect(FX.codes[code].rotations245.native).toBe(540)
      expect(FX.codes[code].rotations245.rotations).toBe(245)
      expect(FX.codes[code].rotations510.rotations).toBe(510)
      expect(FX.codes[code].hypothetical245.rotations).toBe(245)
    }
  })

  it('the native sets tdgFig9.ts rebuilds have the same sizes and the pivot-letter census of the fixture', () => {
    for (const code of CODES) {
      const nat = tdgFig9Native(code)
      const eng = tdgNativeSets(code)
      expect(nat.native).toBe(eng.native)
      expect(nat.rotations245).toHaveLength(eng.rotations)
      expect(nat.rotations510).toHaveLength(eng.rotationsAny)
      for (const q of TDG_FIG9_Q) expect(nat.targets[q], `${code} ${q}`).toHaveLength(FX.codes[code].rotations245.seeds[q])
      expect(nat.targets.I).toHaveLength(eng.pivotI)
      expect(nat.targets.X.length + nat.targets.Y.length + nat.targets.Z.length).toBe(eng.pivotLetter)
      const hyp = tdgFig9Native(code, 'hypothetical')
      expect(hyp.native).toBe(FX.codes[code].hypothetical245.native)
      expect(hyp.rotations245).toHaveLength(FX.codes[code].hypothetical245.rotations)
    }
  })
})

describe('TDG_FIG9_OFFLINE is the fixture', () => {
  it('every histogram and mean of the literal equals the fixture', () => {
    for (const code of CODES)
      for (const reading of TDG_FIG9_READINGS) {
        const e = FX.codes[code][reading]
        for (const q of TDG_FIG9_Q) {
          expect(TDG_FIG9_OFFLINE[code][reading].byQ[q].hist, `${code} ${reading} ${q}`).toEqual(e.byQ[q].hist)
          expect(TDG_FIG9_OFFLINE[code][reading].byQ[q].mean).toBe(e.byQ[q].mean)
        }
        expect(TDG_FIG9_OFFLINE[code][reading].minOverQ.hist).toEqual(e.minOverQ.hist)
        expect(TDG_FIG9_OFFLINE[code][reading].minOverQ.mean).toBe(e.minOverQ.mean)
        expect(tdgFig9Summary(code, reading, 'best')).toBe(TDG_FIG9_OFFLINE[code][reading].minOverQ)
        expect(tdgFig9Summary(code, reading, 'Y')).toBe(TDG_FIG9_OFFLINE[code][reading].byQ.Y)
      }
  })
})

describe('the sampled costs, re-derived in TypeScript', () => {
  const plainTwoRotations = (p: number, rot: readonly number[], targets: ReadonlySet<number>): boolean => {
    // is a target within two rotations of p? (breadth-first, 245 + 245 x 245 walks)
    if (targets.has(p)) return true
    for (const g of rot) {
      if (!tdgFig9Anticommute(p, g)) continue
      const s1 = p ^ g
      if (targets.has(s1)) return true
      for (const h of rot) if (tdgFig9Anticommute(s1, h) && targets.has(s1 ^ h)) return true
    }
    return false
  }

  for (const code of CODES)
    it(`${code}: all 256 sampled Paulis (64 per pivot letter) cost what the full search said`, () => {
      const nat = tdgFig9Native(code)
      let checked = 0
      let found = 0
      for (const q of TDG_FIG9_Q) {
        const targets = nat.targets[q]
        const back = tdgFig9Ball(nat.rotations245, targets, 2)
        const set = new Set(targets)
        const s = FX.sample[code][q] as { pauli: number[]; beta: number[] }
        s.pauli.forEach((p, i) => {
          const k = tdgFig9Distance(p, nat.rotations245, back)
          // beta <= 13: the search finds the same cost; beta >= 19: no walk of two rotations reaches a target, and the search finds the recorded cost all the same (4 at most)
          expect(k, `${code} ${q} pauli ${p}`).not.toBeNull()
          expect(tdgBeta(k as number), `${code} ${q} pauli ${p}`).toBe(s.beta[i])
          if (s.beta[i] <= 13) {
            expect(plainTwoRotations(p, nat.rotations245, set), `${code} ${q} pauli ${p}`).toBe(true)
            found++
          } else expect(plainTwoRotations(p, nat.rotations245, set), `${code} ${q} pauli ${p}`).toBe(false)
          checked++
        })
      }
      expect(checked).toBe(256)
      expect(found).toBe(4 * (6 + 10 + 16))
    })

  it('gross, pivot letter Y: a complete breadth-first search in TypeScript gives the fixture histogram and mean', () => {
    const nat = tdgFig9Native('gross')
    const dist = tdgFig9Distances(nat.rotations245, nat.targets.Y)
    const h = tdgFig9Histogram(dist)
    expect(h.hist).toEqual(FX.codes.gross.rotations245.byQ.Y.hist)
    expect(h.mean).toBe(FX.codes.gross.rotations245.byQ.Y.mean)
    expect(dist[0]).toBe(0) // Y alone is native
  })

  it('two-gross, pivot letter I: the identity is the one Pauli no rotation reaches, and the rest match the fixture', () => {
    const nat = tdgFig9Native('two-gross')
    const dist = tdgFig9Distances(nat.rotations245, nat.targets.I)
    expect(dist[0]).toBe(-1)
    const h = tdgFig9Histogram(dist)
    expect(h.hist).toEqual(FX.codes['two-gross'].rotations245.byQ.I.hist)
    expect(h.mean).toBe(FX.codes['two-gross'].rotations245.byQ.I.mean)
  })
})
