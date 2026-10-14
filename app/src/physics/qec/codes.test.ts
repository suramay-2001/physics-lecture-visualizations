/**
 * qec/codes.ts: the CSS constructor and its orthogonality check, k and the parameters of every named code, distances by exhaustive search
 * (two independent routes for the small codes: the CSS search on H_X, H_Z and the general Pauli enumeration on the stabilizer generators), the
 * rotated surface code layout, the lookup decoder, and the randomized low-weight search. The numpy twin of the distances and syndrome tables is
 * compared in fixtures.test.ts.
 */
import { describe, expect, it } from 'vitest'
import { rng } from '../random'
import { GF2Matrix, dot, support } from './gf2'
import { Pauli, symplecticProduct } from './pauli'
import {
  CSSCode,
  DISTANCE_BUDGET,
  correctionOutcome,
  cssDistance,
  fiveQubitCode,
  fourTwoTwoCode,
  hammingBound,
  lightLogicalSearch,
  lookupDecoder,
  pauliBallSize,
  repetitionCode,
  rotatedSurfaceCode,
  shorCode,
  stabilizerDistance,
  steaneCode,
} from './codes'

const letters = ['I', 'X', 'Y', 'Z'] as const
const binomial = (n: number, k: number): number => (k === 0 ? 1 : (binomial(n - 1, k - 1) * n) / k)

/** All Pauli errors on n qubits of weight exactly w (letters X, Y, Z on a choice of w qubits). */
function pauliErrors(n: number, w: number): Pauli[] {
  const out: Pauli[] = []
  const pos: number[] = []
  const rec = (start: number, ls: number[]): void => {
    if (ls.length === w) {
      const row = new Array<(typeof letters)[number]>(n).fill('I')
      pos.forEach((q, i) => (row[q] = letters[ls[i]]))
      out.push(Pauli.fromLetters(row))
      return
    }
    for (let q = start; q < n; q++) {
      pos.push(q)
      for (let l = 1; l <= 3; l++) rec(q + 1, [...ls, l])
      pos.pop()
    }
  }
  rec(0, [])
  return out
}

describe('codes: the CSS constructor', () => {
  it('refuses H_X, H_Z that overlap on an odd number of qubits, and mismatched widths', () => {
    expect(() => new CSSCode(GF2Matrix.fromText('1100'), GF2Matrix.fromText('1000'))).toThrow(/H_X · H_Zᵀ ≠ 0/)
    expect(() => new CSSCode(GF2Matrix.fromText('1100'), GF2Matrix.fromText('100'))).toThrow()
    expect(() => new CSSCode(GF2Matrix.fromText('1100'), GF2Matrix.fromText('1111'))).not.toThrow()
  })

  it('H_X · H_Zᵀ = 0 holds for every named code', () => {
    for (const code of [steaneCode(), shorCode(), fourTwoTwoCode(), repetitionCode(5), repetitionCode(5, 'phase-flip'), rotatedSurfaceCode(3).code, rotatedSurfaceCode(5).code])
      expect(code.HX.mul(code.HZ.transpose()).isZero(), code.name).toBe(true)
  })
})

describe('codes: n, k and the stabilizer view of every named code', () => {
  const table: [string, CSSCode, number, number][] = [
    ['Steane', steaneCode(), 7, 1],
    ['Shor', shorCode(), 9, 1],
    ['[[4,2,2]]', fourTwoTwoCode(), 4, 2],
    ['bit-flip 3', repetitionCode(3), 3, 1],
    ['bit-flip 7', repetitionCode(7), 7, 1],
    ['phase-flip 5', repetitionCode(5, 'phase-flip'), 5, 1],
    ['surface 3', rotatedSurfaceCode(3).code, 9, 1],
    ['surface 5', rotatedSurfaceCode(5).code, 25, 1],
    ['surface 7', rotatedSurfaceCode(7).code, 49, 1],
    ['surface 9', rotatedSurfaceCode(9).code, 81, 1],
  ]
  it.each(table)('%s: n, k = n − rank H_X − rank H_Z, and the generators pass check()', (_name, code, n, k) => {
    expect(code.n).toBe(n)
    expect(code.k).toBe(k)
    const st = code.stabilizer()
    expect(st.check().ok).toBe(true)
    expect(st.k).toBe(k)
    expect(st.n).toBe(n)
  })

  it('the five-qubit code is a valid stabilizer code with k = 1 (not CSS)', () => {
    const five = fiveQubitCode()
    expect(five.check().ok).toBe(true)
    expect(five.k).toBe(1)
    expect(five.n).toBe(5)
  })

  it('check weights: Steane 4, Shor X 6 / Z 2, surface 4 (bulk) with 2 on the boundary; Steane qubits sit in 3 + 3 checks', () => {
    expect(steaneCode().degrees()).toEqual({ checkWeight: 4, qubitDegree: 6 })
    expect(shorCode().degrees().checkWeight).toBe(6)
    const s5 = rotatedSurfaceCode(5)
    expect(s5.code.degrees().checkWeight).toBe(4)
    expect(s5.code.degrees().qubitDegree).toBe(4)
  })
})

describe('codes: logical operators of CSS codes', () => {
  it('pure X and pure Z logicals, paired by the Gram matrix, in the normalizer and not stabilizers (every named code)', () => {
    for (const code of [steaneCode(), shorCode(), fourTwoTwoCode(), repetitionCode(5), rotatedSurfaceCode(3).code, rotatedSurfaceCode(5).code]) {
      const L = code.logicals()
      const st = code.stabilizer()
      expect(L.X.length).toBe(code.k)
      expect(L.Z.length).toBe(code.k)
      for (let i = 0; i < code.k; i++) {
        expect(L.X[i].z.every((b) => b === 0)).toBe(true) // pure X
        expect(L.Z[i].x.every((b) => b === 0)).toBe(true) // pure Z
        expect(st.isLogical(L.X[i]), code.name).toBe(true)
        expect(st.isLogical(L.Z[i]), code.name).toBe(true)
        for (let j = 0; j < code.k; j++) {
          expect(symplecticProduct(L.X[i], L.Z[j])).toBe(i === j ? 1 : 0)
          expect(symplecticProduct(L.X[i], L.X[j])).toBe(0)
          expect(symplecticProduct(L.Z[i], L.Z[j])).toBe(0)
        }
      }
    }
  })

  it('the [[4,2,2]] code: the logical group has two qubits, and Z̄ on a pair is a weight-2 logical operator', () => {
    const L = fourTwoTwoCode().logicals()
    expect(L.X.length).toBe(2)
    expect(Math.min(...L.X.map((p) => p.weight()), ...L.Z.map((p) => p.weight()))).toBe(2)
  })
})

describe('codes: distances by exhaustive search', () => {
  it('Steane [[7,1,3]]: d_X = d_Z = 3 with a witness; Shor [[9,1,3]]: d_X = d_Z = 3; the witnesses really are logical operators', () => {
    for (const code of [steaneCode(), shorCode()]) {
      const r = cssDistance(code)
      expect(r.exact).toBe(true)
      expect(r.X.upper).toBe(3)
      expect(r.Z.upper).toBe(3)
      expect(r.lower).toBe(3)
      expect(r.upper).toBe(3)
      for (const w of [r.X.witness!, r.Z.witness!]) {
        expect(w.weight()).toBe(3)
        expect(code.stabilizer().isLogical(w)).toBe(true)
      }
    }
  })

  it('repetition codes protect one error type only: bit-flip n has d_X = n and d_Z = 1 (a single Z is a logical operator)', () => {
    for (const n of [3, 4, 5, 8]) {
      const r = cssDistance(repetitionCode(n))
      expect(r.X.upper).toBe(n)
      expect(r.Z.upper).toBe(1)
      expect(r.upper).toBe(1)
      const p = cssDistance(repetitionCode(n, 'phase-flip'))
      expect(p.Z.upper).toBe(n)
      expect(p.X.upper).toBe(1)
    }
  })

  it('[[4,2,2]] has d = 2; the 5-qubit code has d = 3 (general Pauli enumeration)', () => {
    expect(cssDistance(fourTwoTwoCode()).upper).toBe(2)
    const five = stabilizerDistance(fiveQubitCode())
    expect(five.exact).toBe(true)
    expect(five.upper).toBe(3)
    expect(fiveQubitCode().isLogical(five.witness!)).toBe(true)
  })

  it('the two search routes (CSS on H_X, H_Z; Pauli enumeration on the generators) agree on every small CSS code', () => {
    for (const code of [steaneCode(), shorCode(), fourTwoTwoCode(), repetitionCode(4), rotatedSurfaceCode(3).code]) {
      const a = cssDistance(code)
      const b = stabilizerDistance(code.stabilizer())
      expect(b.exact).toBe(true)
      expect(b.upper, code.name).toBe(a.upper)
    }
  })

  it('rotated surface codes: d = 3 and d = 5 found exactly (n = 9 and 25); the exhibited row/column is a logical operator of weight d', () => {
    for (const d of [3, 5]) {
      const S = rotatedSurfaceCode(d)
      const r = cssDistance(S.code)
      expect(r.exact, `d = ${d}`).toBe(true)
      expect(r.upper).toBe(d)
      expect(r.X.upper).toBe(d)
      expect(r.Z.upper).toBe(d)
    }
  })

  it('d = 7 (n = 49): the budget proves d ≥ 7 (no logical operator of weight ≤ 6) and the lecture-drawn column gives d ≤ 7; the search says it stopped', () => {
    const S = rotatedSurfaceCode(7)
    const r = cssDistance(S.code)
    expect(r.exact).toBe(false) // the weight-7 layer has C(49,7) = 85.9M patterns, over the budget
    expect(r.lower).toBe(7)
    expect(r.X.searched).toBeLessThanOrEqual(DISTANCE_BUDGET)
    expect(r.Z.searched).toBeLessThanOrEqual(DISTANCE_BUDGET)
    expect(r.X.searched).toBe([1, 2, 3, 4, 5, 6].reduce((t, w) => t + Math.round(binomial(49, w)), 0)) // every pattern of weight 1 … 6, nothing more
    const col = Pauli.fromLetters(Array.from({ length: 49 }, (_, i) => (S.logicalX.includes(i) ? 'X' : 'I')))
    expect(S.code.stabilizer().isLogical(col)).toBe(true)
    expect(col.weight()).toBe(7)
  }, 60_000)

  it('a smaller budget stops earlier and reports a smaller proved bound; maxWeight caps the search', () => {
    const S = rotatedSurfaceCode(5)
    const small = cssDistance(S.code, { budget: 1000 })
    expect(small.exact).toBe(false)
    expect(small.lower).toBeLessThan(5)
    const capped = cssDistance(S.code, { maxWeight: 3 })
    expect(capped.exact).toBe(false)
    expect(capped.lower).toBe(4)
  })

  it('a k = 0 code is refused (no logical operators)', () => {
    const none = new CSSCode(GF2Matrix.fromText('11'), GF2Matrix.fromText('11'))
    expect(none.k).toBe(0)
    expect(() => cssDistance(none)).toThrow()
  })

  it('the quantum Hamming bound: the 5-qubit code is perfect (1 + 15 = 16 = 2⁴); Steane and Shor satisfy it with room', () => {
    expect(pauliBallSize(5, 1)).toBe(16)
    expect(hammingBound(5, 1, 1)).toEqual({ ball: 16, syndromes: 16, holds: true, perfect: true })
    expect(hammingBound(7, 1, 1).perfect).toBe(false)
    expect(hammingBound(7, 1, 1).holds).toBe(true)
    expect(hammingBound(9, 1, 1).holds).toBe(true)
  })
})

describe('codes: the rotated surface code layout', () => {
  it.each([3, 5, 7, 9])('d = %i: n = d², d² − 1 checks (half X, half Z), 4-qubit bulk faces and 2-qubit boundary faces, valid data coordinates', (d) => {
    const S = rotatedSurfaceCode(d)
    expect(S.data.length).toBe(d * d)
    expect(new Set(S.data.map((p) => p.join(','))).size).toBe(d * d)
    expect(S.checks.length).toBe(d * d - 1)
    expect(S.checks.filter((c) => c.type === 'X').length).toBe((d * d - 1) / 2)
    expect(S.checks.filter((c) => c.type === 'Z').length).toBe((d * d - 1) / 2)
    expect(S.checks.filter((c) => !c.boundary).length).toBe((d - 1) ** 2)
    expect(S.checks.filter((c) => c.boundary).length).toBe(2 * (d - 1))
    for (const c of S.checks) {
      expect(c.qubits.length).toBe(c.boundary ? 2 : 4)
      // every qubit of a check sits within half a step of the check's center in each direction
      for (const q of c.qubits) {
        expect(Math.abs(S.data[q][0] - c.center[0])).toBeCloseTo(0.5, 12)
        expect(Math.abs(S.data[q][1] - c.center[1])).toBeCloseTo(0.5, 12)
      }
    }
    // boundary checks: X on the top and bottom rows, Z on the left and right columns
    for (const c of S.checks.filter((k) => k.boundary)) {
      const rows = c.qubits.map((q) => Math.floor(q / d))
      const cols = c.qubits.map((q) => q % d)
      if (c.type === 'X') expect(rows[0] === rows[1] && (rows[0] === 0 || rows[0] === d - 1)).toBe(true)
      else expect(cols[0] === cols[1] && (cols[0] === 0 || cols[0] === d - 1)).toBe(true)
    }
    expect(S.code.k).toBe(1)
  })

  it('the exhibited logical X (column 0) and logical Z (row 0): weight d, valid logical operators, overlapping on exactly one qubit so they anticommute', () => {
    for (const d of [3, 5, 7]) {
      const S = rotatedSurfaceCode(d)
      const x = Pauli.fromLetters(Array.from({ length: d * d }, (_, i) => (S.logicalX.includes(i) ? 'X' : 'I')))
      const z = Pauli.fromLetters(Array.from({ length: d * d }, (_, i) => (S.logicalZ.includes(i) ? 'Z' : 'I')))
      const st = S.code.stabilizer()
      expect(x.weight()).toBe(d)
      expect(z.weight()).toBe(d)
      expect(st.isLogical(x)).toBe(true)
      expect(st.isLogical(z)).toBe(true)
      expect(S.logicalX.filter((q) => S.logicalZ.includes(q)).length).toBe(1)
      expect(x.commutesWith(z)).toBe(false)
    }
  })

  it('refuses even d, d < 3 and non-integers', () => {
    for (const d of [2, 4, 1, 0, 3.5]) expect(() => rotatedSurfaceCode(d)).toThrow()
  })
})

describe('codes: the lookup decoder', () => {
  it('bit-flip code n = 3 reproduces the table of Bergou §9.1: three single-flip syndromes and the trivial one', () => {
    const code = repetitionCode(3).stabilizer()
    const dec = lookupDecoder(code, 1)
    expect(dec.total).toBe(4) // 2^rank, rank 2
    // weight-1 enumeration includes Z errors, which have the trivial syndrome and lose to the identity: 3 X + trivial = 4 entries
    expect(dec.covered).toBe(4)
    expect(dec.decode([0, 0])!.toString()).toBe('+III')
    expect(dec.decode([1, 0])!.toString()).toBe('+XII')
    expect(dec.decode([1, 1])!.toString()).toBe('+IXI')
    expect(dec.decode([0, 1])!.toString()).toBe('+IIX')
  })

  it('every weight-1 error is corrected by the Steane, Shor, 5-qubit and d = 3 surface decoders; the 5-qubit table is complete (perfect code)', () => {
    const subjects = [steaneCode().stabilizer(), shorCode().stabilizer(), fiveQubitCode(), rotatedSurfaceCode(3).code.stabilizer()]
    for (const code of subjects) {
      const dec = lookupDecoder(code, 1)
      for (const e of pauliErrors(code.n, 1)) expect(correctionOutcome(code, dec, e).outcome, `${code.name}: ${e}`).toBe('corrected')
    }
    const five = lookupDecoder(fiveQubitCode(), 1)
    expect(five.covered).toBe(16)
    expect(five.total).toBe(16)
  })

  it('d = 5 surface code: every error of weight ≤ 2 is corrected (2776 patterns); some weight-3 errors beat the decoder (d = 5 corrects only 2)', () => {
    const code = rotatedSurfaceCode(5).code.stabilizer()
    const dec = lookupDecoder(code, 2)
    expect(dec.covered).toBeLessThanOrEqual(dec.total)
    for (const w of [1, 2]) for (const e of pauliErrors(25, w)) expect(correctionOutcome(code, dec, e).outcome).toBe('corrected')
    // the three-flip string along the lightest logical X (a column of 5): its first three qubits make a weight-3 error that is nearer to the logical operator than to nothing
    const e3 = Pauli.fromLetters(Array.from({ length: 25 }, (_, i) => ([0, 5, 10].includes(i) ? 'X' : 'I')))
    expect(correctionOutcome(code, dec, e3).outcome).toBe('logical-error')
  })

  it('weight-2 errors on the Steane code are never corrected (no stabilizer has weight below 4, so a weight-2 error cannot be undone by a weight-1 correction); on the Shor code some are rescued by degeneracy', () => {
    const steane = steaneCode().stabilizer()
    const dS = lookupDecoder(steane, 1)
    const outS = pauliErrors(7, 2).map((e) => correctionOutcome(steane, dS, e).outcome)
    expect(outS).not.toContain('corrected')
    expect(outS).toContain('logical-error') // X₁X₂ looks like X₃: the decoder applies X₃ and leaves the logical operator X₁X₂X₃
    expect(outS).toContain('no-correction') // X₁Z₂ has a syndrome no single-qubit error makes
    const shor = shorCode().stabilizer()
    const dH = lookupDecoder(shor, 1)
    const outH = pauliErrors(9, 2).map((e) => correctionOutcome(shor, dH, e).outcome)
    expect(outH).toContain('corrected') // Z1Z2 is itself a stabilizer: the error does nothing to the logical state
    expect(outH).toContain('logical-error')
    const zz = Pauli.parse('ZZIIIIIII')
    expect(correctionOutcome(shor, dH, zz).outcome).toBe('corrected')
  })

  it('a syndrome the table does not cover returns null / no-correction', () => {
    const code = repetitionCode(5).stabilizer()
    const dec = lookupDecoder(code, 1)
    expect(dec.decode([1, 0, 1, 0])).toBeNull() // two separated flips cannot come from one X error
    const e = Pauli.fromLetters(['X', 'I', 'X', 'I', 'I'])
    expect(correctionOutcome(code, dec, e).outcome).toBe('no-correction')
  })

  it('the residual always commutes with every generator', () => {
    const code = shorCode().stabilizer()
    const dec = lookupDecoder(code, 1)
    for (const e of pauliErrors(9, 2)) {
      const r = correctionOutcome(code, dec, e)
      if (r.residual) expect(code.inNormalizer(r.residual)).toBe(true)
    }
  })
})

describe('codes: the randomized light-logical search (information-set decoding)', () => {
  it('on the Steane code it finds weight 3 = d; on the d = 5 surface code it finds weight 5 within a few hundred rounds (seeded, repeatable)', () => {
    const st = steaneCode()
    const a = lightLogicalSearch(st.HZ, st.HX, rng(7), { rounds: 50, pairs: true })
    expect(a!.weight).toBe(3)
    const S = rotatedSurfaceCode(5).code
    const b = lightLogicalSearch(S.HZ, S.HX, rng(7), { rounds: 300, pairs: true })
    expect(b!.weight).toBe(5)
    const again = lightLogicalSearch(S.HZ, S.HX, rng(7), { rounds: 300, pairs: true })
    expect(again).toEqual(b)
  })

  it('a witness is always a real logical operator: zero syndrome, outside the stabilizer span, and never lighter than the true distance (random seeds)', () => {
    const S = rotatedSurfaceCode(5).code
    for (let seed = 1; seed <= 8; seed++) {
      const r = lightLogicalSearch(S.HZ, S.HX, rng(seed), { rounds: 20 })
      expect(r).not.toBeNull()
      const x = new Array<number>(25).fill(0)
      for (const j of r!.support) x[j] = 1
      expect(S.HZ.mulVec(x).every((b) => b === 0)).toBe(true)
      expect(S.HX.rowspaceContains(x)).toBe(false)
      expect(support(x).length).toBe(r!.weight)
      expect(r!.weight).toBeGreaterThanOrEqual(5)
    }
  })

  it('returns null when there is nothing to find: the whole kernel lies in the stabilizer space (k = 0)', () => {
    const none = new CSSCode(GF2Matrix.fromText('11'), GF2Matrix.fromText('11'))
    expect(lightLogicalSearch(none.HZ, none.HX, rng(1), { rounds: 5 })).toBeNull()
  })
})

describe('codes: dot product sanity for the pairing used by logicals()', () => {
  it('dot of the X-part of X̄_i and the Z-part of Z̄_j is δ_ij for the d = 5 surface code', () => {
    const L = rotatedSurfaceCode(5).code.logicals()
    expect(dot(L.X[0].x, L.Z[0].z)).toBe(1)
  })
})
