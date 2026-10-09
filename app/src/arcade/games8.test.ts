/**
 * Arcade truth for Lecture 8 (P): the four Spot-the-error rounds each name a slip whose correction states the engine's number
 * (physics/polarization, density, bb84), and Catch Eve's five levels take their verdicts from the same seeded BB84 engine the
 * `bb84` ledger and the `bb84-bench` use. A level's answer is checked against the engine and against an independent count here.
 */
import { describe, expect, it } from 'vitest'
import { LECTURES } from '../content'
import { pauliVariances, varianceTotal } from '../physics/density'
import { BASES, bb84ErrorProb, bb84Q, bb84Rounds, bb84Tally, minTestSize, missProb, type Bit } from '../physics/bb84'
import { analyzerProb, photonSphereAngle, polBloch } from '../physics/polarization'
import { boardKey, boardRows, budgetState, catchEveAnswer, catchEveVerdict, eveQ, noErrorChance } from './catchEve'
import { CATCH_EVE_LEVELS, ERROR_ROUNDS, GAMES } from './games'

const close = (a: number, b: number, eps = 1e-12) => expect(Math.abs(a - b)).toBeLessThan(eps)
const L8_ROUNDS = ERROR_ROUNDS.filter((r) => r.trains.lecture === 'L8')
const L8_UNITS = LECTURES.find((l) => l.id === 'L8')!.units.map((u) => u.id)
const level = (id: string) => CATCH_EVE_LEVELS.find((l) => l.id === id)!

describe('Spot the error: Lecture 8', () => {
  it('has four rounds, each training a real unit of the lecture with a wrong step inside it', () => {
    expect(L8_ROUNDS.map((r) => r.id)).toEqual(['sum-three-small', 'light-half-angle', 'sphere-45', 'sift-halves-q'])
    for (const r of L8_ROUNDS) {
      expect(L8_UNITS, r.id).toContain(r.trains.unit)
      expect(r.steps).toHaveLength(4)
      expect(r.wrong).toBe(2)
    }
  })
  it('sum-three-small: equal squared averages of 1/3 give variances 2/3 and a total of 2; 2/3 each is not a state', () => {
    const a = 1 / Math.sqrt(3)
    for (const v of pauliVariances([a, a, a])) close(v, 2 / 3)
    close(varianceTotal([a, a, a]), 2)
    const b = Math.sqrt(2 / 3)
    expect(() => pauliVariances([b, b, b])).toThrow()
  })
  it('light-half-angle: a 60° analyzer passes cos² 60° = ¼ of horizontal light, not the spin value ¾', () => {
    close(analyzerProb(0, Math.PI / 3), 1 / 4)
    close(Math.cos(Math.PI / 6) ** 2, 3 / 4)
    expect(analyzerProb(0, Math.PI / 3)).not.toBeCloseTo(3 / 4, 3)
  })
  it('sphere-45: a 45° lab turn is 90° on the sphere, and |D⟩ sits on the equator at +x', () => {
    close(photonSphereAngle(Math.PI / 4), Math.PI / 2)
    const d = polBloch(Math.PI / 4)
    close(d[0], 1)
    close(d[1], 0)
    close(d[2], 0)
  })
  it('sift-halves-q: the error per photon sent is ⅛, the error per kept round is ¼ (half the rounds are kept)', () => {
    let perSent = 0
    let keptShare = 0
    for (const aBasis of BASES)
      for (const aBit of [0, 1] as Bit[])
        for (const bBasis of BASES)
          for (const eBasis of BASES) {
            if (aBasis !== bBasis) continue
            perSent += bb84ErrorProb({ alice: { basis: aBasis, bit: aBit }, bob: { basis: bBasis }, eve: { basis: eBasis } }) / 16
            keptShare += 1 / 16
          }
    close(keptShare, 1 / 2)
    close(perSent, 1 / 8)
    close(perSent / keptShare, 1 / 4)
    close(bb84Q(1), 1 / 4)
  })
})

describe('Catch Eve', () => {
  it('lists five levels in the Arcade index, each training a real unit of Lecture 8', () => {
    expect(CATCH_EVE_LEVELS.map((l) => l.id)).toEqual(['ce-sift', 'ce-one-round', 'ce-average', 'ce-test-size', 'ce-budget'])
    const g = GAMES.find((x) => x.id === 'catch-eve')!
    expect(g.kind).toBe('catch-eve')
    expect(g.levels).toBe(CATCH_EVE_LEVELS.length)
    for (const l of CATCH_EVE_LEVELS) {
      expect(L8_UNITS, l.id).toContain(l.trains.unit)
      expect(l.goal.length).toBeGreaterThan(20)
      expect(l.hint.length).toBeGreaterThan(10)
    }
    expect(g.trains.every((t) => t.lecture === 'L8')).toBe(true)
  })

  it('ce-sift: the kept rounds are the matched bases, 1, 4, 5 and 6; rounds 2 and 8 agree only by luck', () => {
    const a = catchEveAnswer(level('ce-sift'))
    expect(a).toEqual({ kind: 'rounds', rounds: [1, 4, 5, 6] })
    expect(boardRows().filter((r) => r.aBasis === r.bBasis).map((r) => r.n)).toEqual([1, 4, 5, 6])
    expect(boardRows().filter((r) => r.aBasis !== r.bBasis && r.aBit === r.bBit).map((r) => r.n)).toEqual([2, 8])
    expect(boardKey()).toEqual({ alice: '0010', bob: '0010' })
  })
  it('ce-sift verdict: only the exact set of matched rounds (in any order) clears the level', () => {
    const l = level('ce-sift')
    expect(catchEveVerdict(l, { rounds: [6, 1, 5, 4] })).toBe(true)
    expect(catchEveVerdict(l, { rounds: [1, 4, 5] })).toBe(false)
    expect(catchEveVerdict(l, { rounds: [1, 4, 5, 6, 2] })).toBe(false)
    expect(catchEveVerdict(l, { rounds: [] })).toBe(false)
    expect(catchEveVerdict(l, { m: 4 })).toBe(false)
  })

  it('ce-one-round: D sent, Bob in D/A, Eve in H/V gives an error chance of ½; exactly one option carries it', () => {
    const l = level('ce-one-round')
    expect(catchEveAnswer(l)).toEqual({ kind: 'value', value: 0.5 })
    expect(l.options!.filter((o) => catchEveVerdict(l, { value: o.value })).map((o) => o.label)).toEqual(['½'])
  })
  it('ce-average: the average over Eve’s basis is ¼, which is also the enumerated Q of the whole attack', () => {
    const l = level('ce-average')
    close(eveQ(), 1 / 4)
    expect(catchEveAnswer(l)).toEqual({ kind: 'value', value: 0.25 })
    expect(l.options!.filter((o) => catchEveVerdict(l, { value: o.value })).map((o) => o.label)).toEqual(['¼'])
  })
  it('option labels carry the numbers they name', () => {
    const NUM: Record<string, number> = { '0': 0, '⅛': 0.125, '¼': 0.25, '½': 0.5, '¾': 0.75, '1': 1 }
    for (const l of CATCH_EVE_LEVELS) for (const o of l.options ?? []) expect(o.value, `${l.id} ${o.label}`).toBe(NUM[o.label])
  })

  it('ce-test-size: 17 is the fewest bits, since (¾)^16 is above 1% and (¾)^17 is below it', () => {
    const l = level('ce-test-size')
    expect(catchEveAnswer(l)).toEqual({ kind: 'size', m: 17 })
    expect(missProb(1 / 4, 16)).toBeGreaterThan(0.01)
    expect(missProb(1 / 4, 17)).toBeLessThanOrEqual(0.01)
    close(noErrorChance(17), Math.pow(0.75, 17))
    for (let m = 0; m <= 40; m++) expect(catchEveVerdict(l, { m }), `m = ${m}`).toBe(m === 17)
  })

  it('ce-budget: 200 intercepted photons leave 101 sifted bits, so a test of 17 to 21 bits catches Eve and keeps 80', () => {
    const l = level('ce-budget')
    const t = bb84Tally(bb84Rounds(l.budget!.photons, l.budget!.seed, 1))
    expect(t.intercepted).toBe(200)
    expect(t.kept).toBe(101)
    expect(catchEveAnswer(l)).toEqual({ kind: 'range', lo: minTestSize(1 / 4, 0.01), hi: 101 - 80, sifted: 101 })
    for (let m = 0; m <= 101; m++) expect(catchEveVerdict(l, { m }), `m = ${m}`).toBe(m >= 17 && m <= 21)
    expect(catchEveVerdict(l, { m: 17.5 })).toBe(false)
  })
  it('ce-budget live numbers: the miss chance and the key left come from the engine at every m', () => {
    const l = level('ce-budget')
    const s = budgetState(l, 17)
    expect(s).toMatchObject({ sifted: 101, left: 84, caught: true, enough: true })
    close(s.miss, Math.pow(0.75, 17))
    expect(budgetState(l, 16).caught).toBe(false)
    expect(budgetState(l, 22)).toMatchObject({ left: 79, enough: false, caught: true })
  })
  it('the run is seeded: the same photons come back, and Eve on or off never changes Alice or Bob', () => {
    const on = bb84Rounds(200, 20, 1)
    const again = bb84Rounds(200, 20, 1)
    expect(again).toEqual(on)
    const off = bb84Rounds(200, 20, 0)
    expect(off.map((r) => [r.aBit, r.aBasis, r.bBasis])).toEqual(on.map((r) => [r.aBit, r.aBasis, r.bBasis]))
  })
})
