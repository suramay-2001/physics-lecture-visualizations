/**
 * Chapter F7's five Arcade "Spot the error" rounds (P-F7-story §11.2): each wrong step is recomputed through the engine here, so the correction a round states is
 * the engine's number and the flagged step really is false (the generic checks of games.test.ts cover the shape and the chapter links).
 */
import { describe, expect, it } from 'vitest'
import { detN } from '../../physics/qc/cmat'
import { c } from '../../physics/complex'
import { bitString, exponentialCost, functionCensus, gateTable, gf2Rank, parseBits, preimageCount, rootExponentialCost, xor } from '../../physics/qc/bits'
import { QC_ERROR_ROUNDS } from './games'
import { F7 } from './F7'

const round = (id: string) => QC_ERROR_ROUNDS.find((r) => r.id === id)!

describe('F7 Spot the error rounds', () => {
  it('there are five, each four steps long, each training a real unit of F7', () => {
    const mine = QC_ERROR_ROUNDS.filter((r) => r.trains.lecture === 'F7')
    expect(mine.map((r) => r.id)).toEqual(['qc-and-undo', 'qc-balanced-common', 'qc-xor-carry', 'qc-gf2-independent', 'qc-root-exponential'])
    for (const r of mine) {
      expect(r.steps).toHaveLength(4)
      expect(F7.units.map((u) => u.id)).toContain(r.trains.unit)
      expect(r.wrong).toBeGreaterThan(0)
      expect(r.id.startsWith('qc-')).toBe(true)
    }
  })
  it('qc-and-undo: the output 0 of AND comes from three inputs, so it does not say which went in', () => {
    expect(preimageCount(gateTable('AND').out, 0)).toBe(3)
    expect([0, 1, 2, 3].filter((x) => gateTable('AND').out[x] === 0).map((x) => bitString(x, 2))).toEqual(['00', '01', '10'])
    const r = round('qc-and-undo')
    expect(r.wrong).toBe(2)
    expect(r.steps[r.wrong]).toContain('the input was 00')
    expect(r.why).toContain('three inputs, 00, 01 and 10')
  })
  it('qc-balanced-common: only 70 of the 256 three-bit functions are balanced, about 27 %: the even split is the likeliest single split but not the majority', () => {
    const k = functionCensus(3)
    expect(k.balanced).toBe(70)
    expect(k.total).toBe(256)
    expect(Math.round((100 * k.balanced) / k.total)).toBe(27)
    // the even split IS the likeliest single split: C(8,4) is the largest binomial of row 8
    const row = [0, 1, 2, 3, 4, 5, 6, 7, 8].map((j) => [1, 8, 28, 56, 70, 56, 28, 8, 1][j])
    expect(Math.max(...row)).toBe(k.balanced)
    expect(row.reduce((s, v) => s + v, 0)).toBe(k.total)
    const r = round('qc-balanced-common')
    expect(r.steps[r.wrong]).toContain('more likely than any other single split')
    expect(r.why).toContain('70 of the 256')
    expect(r.why).toContain('27 %')
  })
  it('qc-xor-carry: 1 ⊕ 1 = 0 (the carry is dropped), and 1011 ⊕ 0110 = 1101 stays four bits', () => {
    expect(gateTable('XOR').out[0b11]).toBe(0)
    expect(bitString(xor(parseBits('1011'), parseBits('0110')), 4)).toBe('1101')
    const r = round('qc-xor-carry')
    expect(r.wrong).toBe(2)
    expect(r.steps[r.wrong]).toContain('1 ⊕ 1 = 10')
    expect(r.why).toContain('1011 ⊕ 0110 = 1101')
  })
  it('qc-gf2-independent: the rows 110, 011, 101 have rank 2 over bits (110 ⊕ 011 = 101) and rank 3 over the real numbers', () => {
    const rows = ['110', '011', '101'].map((s) => [...s].map(Number))
    expect(gf2Rank(rows)).toBe(2)
    expect(xor(parseBits('110'), parseBits('011'))).toBe(parseBits('101'))
    expect(detN(rows.map((row) => row.map((v) => c(v)))).re).toBeCloseTo(2, 12)
    const r = round('qc-gf2-independent')
    expect(r.wrong).toBe(2)
    expect(r.why).toContain('110 ⊕ 011 = 101')
    expect(r.why).toContain('the rank is 2')
  })
  it('qc-root-exponential: √(2ⁿ) = 2^(n/2) doubles with every two extra bits, so it is exponential in n; the gap between 2ⁿ and its root is itself 2^(n/2)', () => {
    for (let n = 2; n <= 40; n += 2) {
      expect(rootExponentialCost(n + 2) / rootExponentialCost(n)).toBeCloseTo(2, 12)
      expect(exponentialCost(n) / rootExponentialCost(n)).toBeCloseTo(rootExponentialCost(n), 6)
    }
    const r = round('qc-root-exponential')
    expect(r.wrong).toBe(3)
    expect(r.why).toContain('still doubles with every two extra bits')
  })
})
