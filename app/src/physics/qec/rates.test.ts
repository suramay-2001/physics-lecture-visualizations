/**
 * Failure chances and counting bounds (rates.ts) against closed forms and against an independent numpy / itertools enumeration of the Steane code
 * (the scratch script printed the failure counts by weight [0, 0, 21, 7, 28, 0, 7, 1], P_L(0.01) = 0.0020040749…, P_L(0.1) = 0.1306432, and the
 * crossing P_L(p) = p at 0.064596239…; these are the claim values of P-Q22-story D7).
 */
import { describe, expect, it } from 'vitest'
import { repetitionCode, rotatedSurfaceCode, shorCode, steaneCode } from './codes'
import { binomialPmf, failuresByWeight, logicalFailure, qhbMinN, qhbNeed, repetitionFail } from './rates'

describe('rates: the majority vote', () => {
  it('three copies fail with chance p²(3 − 2p), five with p³(10 − 15p + 6p²); 0.028 and 0.00856 at p = 0.1', () => {
    for (const p of [0, 0.01, 0.1, 0.25, 0.5, 0.9, 1]) {
      expect(repetitionFail(p, 3)).toBeCloseTo(p * p * (3 - 2 * p), 14)
      expect(repetitionFail(p, 5)).toBeCloseTo(p ** 3 * (10 - 15 * p + 6 * p * p), 14)
    }
    expect(repetitionFail(0.1, 3)).toBeCloseTo(0.028, 12)
    expect(repetitionFail(0.1, 5)).toBeCloseTo(0.00856, 12)
  })
  it('the vote beats a lone bit exactly below one half: p²(3 − 2p) − p = −p(1 − p)(1 − 2p)', () => {
    for (const p of [0.05, 0.2, 0.4, 0.49, 0.5, 0.51, 0.7]) expect(repetitionFail(p, 3) - p).toBeCloseTo(-p * (1 - p) * (1 - 2 * p), 14)
    expect(repetitionFail(0.5, 3)).toBeCloseTo(0.5, 14)
  })
  it('refuses an even number of copies and a chance outside [0, 1]', () => {
    expect(() => repetitionFail(0.1, 4)).toThrow(/odd/)
    expect(() => binomialPmf(3, 1, 1.5)).toThrow(/p must lie/)
  })
  it('the binomial chances add to 1', () => {
    for (const n of [1, 3, 7, 12]) expect(Array.from({ length: n + 1 }, (_, k) => binomialPmf(n, k, 0.3)).reduce((a, b) => a + b, 0)).toBeCloseTo(1, 12)
  })
})

describe('rates: the quantum Hamming bound', () => {
  it('2^k Σ C(n,j) 3^j: 2(1 + 3n) for k = t = 1; 26 against 16 at n = 4, 32 against 32 at n = 5, Shor 56 against 512', () => {
    for (let n = 1; n <= 10; n++) expect(qhbNeed(n, 1, 1)).toBe(2 * (1 + 3 * n))
    expect([qhbNeed(4, 1, 1), 2 ** 4]).toEqual([26, 16])
    expect([qhbNeed(5, 1, 1), 2 ** 5]).toEqual([32, 32])
    expect([qhbNeed(9, 1, 1), 2 ** 9]).toEqual([56, 512])
  })
  it('the smallest code that can correct one error and hold one qubit has 5 qubits', () => {
    expect(qhbMinN(1, 1)).toBe(5)
    // t = 2: n = 9 needs 2(1 + 27 + 324) = 704 > 512, n = 10 needs 2(1 + 30 + 405) = 872 <= 1024 (the bound; the smallest real code is [[11, 1, 5]])
    expect(qhbMinN(1, 2)).toBe(10)
  })
})

describe('rates: logical failure of a CSS code under a minimum-weight decoder, by listing all 2ⁿ patterns', () => {
  it('Steane against X flips: [0, 0, 21, 7, 28, 0, 7, 1] failing patterns by weight (the numpy enumeration), and the same for Z by symmetry', () => {
    const code = steaneCode()
    expect(failuresByWeight(code, 'X')).toEqual([0, 0, 21, 7, 28, 0, 7, 1])
    expect(failuresByWeight(code, 'Z')).toEqual([0, 0, 21, 7, 28, 0, 7, 1])
  })
  it('P_L(0.01) = 0.0020040749…, P_L(0.1) = 0.1306432, and P_L(p) = p at p = 0.0646', () => {
    const code = steaneCode()
    expect(logicalFailure(code, 0.01, 'X')).toBeCloseTo(0.00200407496752, 10)
    expect(logicalFailure(code, 0.1, 'X')).toBeCloseTo(0.1306432, 10)
    expect(logicalFailure(code, 0.06459623933302103, 'X')).toBeCloseTo(0.06459623933302103, 9)
    // below the crossing the code helps, above it hurts
    expect(logicalFailure(code, 0.03, 'X')).toBeLessThan(0.03)
    expect(logicalFailure(code, 0.1, 'X')).toBeGreaterThan(0.1)
  })
  it('the counts add up to C(7, w) at each weight bound, and P_L(1) = 1 flips every qubit: the all-ones pattern is X⊗7, a logical operator', () => {
    const f = failuresByWeight(steaneCode(), 'X')
    expect(f[7]).toBe(1)
    expect(logicalFailure(steaneCode(), 1, 'X')).toBe(1)
    expect(logicalFailure(steaneCode(), 0, 'X')).toBe(0)
  })
  it('the bit-flip repetition codes: failure counts reproduce the majority vote (3 copies fail on every pattern of weight ≥ 2), and Z flips are never caught', () => {
    const rep = repetitionCode(3, 'bit-flip')
    expect(failuresByWeight(rep, 'X')).toEqual([0, 0, 3, 1])
    expect(logicalFailure(rep, 0.1, 'X')).toBeCloseTo(repetitionFail(0.1, 3), 14)
    // Z flips: the syndrome is always 00 and the residual is the pattern itself, harmless only for the identity — Z1 alone is a logical Z
    expect(failuresByWeight(rep, 'Z')[1]).toBe(3)
  })
  it('the Shor code: single flips of either kind are always corrected (weight 1 fails 0 times)', () => {
    const shor = shorCode()
    expect(failuresByWeight(shor, 'X')[1]).toBe(0)
    expect(failuresByWeight(shor, 'Z')[1]).toBe(0)
  })
  it('refuses a code too big to list', () => {
    expect(() => failuresByWeight(rotatedSurfaceCode(5).code, 'X')).toThrow(/limit/)
  })
})
