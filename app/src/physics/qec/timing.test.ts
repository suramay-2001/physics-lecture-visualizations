/** physics/qec/timing.ts against its numpy twin (an event loop for the pipelined total) and the numbers of P-B6-story §1.7 and P-P2-story §9. */
import { describe, expect, it } from 'vitest'
import fixture from '../__fixtures__/gandalf-platform.json'
import * as T from './timing'

const V = fixture.values as unknown as Record<string, [number, number]>
const near = (key: string, got: number): void => {
  const [want, tol] = V[key]
  expect(Math.abs(got - want) / Math.abs(want), `${key}: ${got} vs ${want}`).toBeLessThanOrEqual(tol)
}
const CASES = { p2: [11, 0.02, 2.0, 0.5], slow: [11, 0.02, 0.3, 0.5], eq5: [100, 0.01, 3.0, 0.5], fig: [9, 0.01, 1.0, 0.4], fig2: [9, 0.01, 1.0, 1.5] } as const

describe('unpipelined and pipelined totals', () => {
  it('agree with the twin (the pipelined one by an event loop) in every case', () => {
    for (const [tag, [d, g, r, c]] of Object.entries(CASES)) {
      near(`unpipelined.${tag}`, T.unpipelinedTotal(d, g, r, c))
      near(`pipelined.${tag}`, T.pipelinedTotal(d, g, r, c))
      expect(T.pipelineSim(d, g, r, c)).toBeCloseTo(T.pipelinedTotal(d, g, r, c), 12)
    }
  })
  it('the plan’s numbers: 27.72 serial, 22.72 pipelined, saving 5.00; the slow classifier 9.02 and 5.82', () => {
    expect(T.serialTime(11, 0.02, 2, 0.5)).toBeCloseTo(27.72, 12)
    expect(T.pipelinedTime(11, 0.02, 2, 0.5)).toBeCloseTo(22.72, 12)
    expect(T.pipelineSaving(11, 0.02, 2, 0.5)).toBeCloseTo(5, 12)
    expect(T.unpipelinedTotal(11, 0.02, 0.3, 0.5)).toBeCloseTo(9.02, 12)
    expect(T.pipelinedTotal(11, 0.02, 0.3, 0.5)).toBeCloseTo(5.82, 12)
  })
  it('Eq. 5 of the paper is the generic total with c = t_den + t_c when c <= g + r: d = 100, t_r = 3, t_g = 0.01, t_den = 0.1, t_c = 0.4 gives 301.5 pipelined; the unpipelined run without the denoiser is 341.0 ms', () => {
    expect(T.pipelinedTotal(100, 0.01, 3, 0.5)).toBeCloseTo(100 * 3.01 + 0.5, 10)
    expect(T.pipelinedTotal(100, 0.01, 3, 0.5)).toBeCloseTo(301.5, 10)
    expect(T.unpipelinedTotal(100, 0.01, 3, 0.4)).toBeCloseTo(341, 10)
    expect(T.pipelineSaving(100, 0.01, 3, 0.4)).toBeCloseTo(99 * 0.4, 10)
  })
  it('overlap stops helping at c = g + r: the saving is (d − 1) min(c, g + r), and no pipeline beats d·max(g + r, c)', () => {
    for (const c of [0.1, 0.32, 0.9, 5]) expect(T.pipelineSaving(9, 0.02, 0.3, c)).toBeCloseTo(8 * Math.min(c, 0.32), 12)
    expect(T.pipelinedTotal(1, 1, 2, 3)).toBe(T.unpipelinedTotal(1, 1, 2, 3))
  })
  it('refuses a round count that is not a whole number and a negative time', () => {
    expect(() => T.unpipelinedTotal(0, 1, 1, 1)).toThrow(RangeError)
    expect(() => T.pipelinedTotal(2.5, 1, 1, 1)).toThrow(RangeError)
    expect(() => T.pipelinedTotal(3, -1, 1, 1)).toThrow(RangeError)
  })
})

describe('a round’s parts', () => {
  const parts: T.RoundPart[] = [{ kind: 'gate', ms: 0.02 }, { kind: 'move', ms: 0.3 }, { kind: 'acquire', ms: 2 }, { kind: 'classify', ms: 0.5 }, { kind: 'reset', ms: 0.1 }]
  it('the round time and the readout share agree with the twin; other kinds may be counted', () => {
    near('roundTime.mixed', T.roundTime(parts))
    near('readoutFraction.mixed', T.readoutFraction(parts))
    expect(T.readoutFraction(parts, ['acquire'])).toBeCloseTo(2 / 2.92, 12)
  })
  it('a round of gates alone has no readout share; a part of unknown kind or negative length, or an empty round, is refused', () => {
    expect(T.readoutFraction([{ kind: 'gate', ms: 1 }])).toBe(0)
    expect(() => T.roundTime([{ kind: 'wait' as never, ms: 1 }])).toThrow(RangeError)
    expect(() => T.roundTime([{ kind: 'gate', ms: -1 }])).toThrow(RangeError)
    expect(() => T.readoutFraction([])).toThrow(RangeError)
  })
})
