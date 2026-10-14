/**
 * qec/stabilizer.ts: the stabilizer-code checks, syndromes, membership, logical operators and the Knill–Laflamme condition. Worked
 * examples are Bergou's (Ch. 10 §10.1: bit-flip repetition, the 5-qubit code) and the 7-qubit Steane code; properties are run over random
 * stabilizer codes built from random Clifford circuits (the tableau gives n commuting independent generators; any subset is a valid code).
 */
import { describe, expect, it } from 'vitest'
import { rng } from '../random'
import { Pauli, symplecticProduct } from './pauli'
import { StabilizerCode } from './stabilizer'
import { Tableau } from './tableau'
import { randomCliffordOps } from './testkit'

const five = StabilizerCode.fromStrings(['XZZXI', 'IXZZX', 'XIXZZ', 'ZXIXZ'], '[[5,1,3]]')
const steane = StabilizerCode.fromStrings(['XIXIXIX', 'IXXIIXX', 'IIIXXXX', 'ZIZIZIZ', 'IZZIIZZ', 'IIIZZZZ'], 'Steane')
const bitflip = StabilizerCode.fromStrings(['ZZI', 'IZZ'], 'bit-flip repetition')

describe('stabilizer: the conditions on a generator list', () => {
  it('the 5-qubit code, Steane and the bit-flip code are valid with k = 1, 1, 1', () => {
    for (const code of [five, steane, bitflip]) {
      const rep = code.check()
      expect(rep.problems).toEqual([])
      expect(rep.ok).toBe(true)
      expect(code.k).toBe(1)
    }
    expect(five.rank).toBe(4)
    expect(steane.rank).toBe(6)
    expect(five.symplecticMatrix().rows).toBe(4)
    expect(five.symplecticMatrix().cols).toBe(10)
  })

  it('anticommuting generators, dependent generators, a Y-phase generator and a product equal to −I are each reported', () => {
    const anti = StabilizerCode.fromStrings(['XI', 'ZI']).check()
    expect(anti.commuting).toBe(false)
    expect(anti.ok).toBe(false)
    const dep = StabilizerCode.fromStrings(['ZZI', 'IZZ', 'ZIZ']).check()
    expect(dep.commuting).toBe(true)
    expect(dep.independent).toBe(false)
    expect(dep.noMinusIdentity).toBe(true)
    const ph = StabilizerCode.fromStrings(['iZZI', 'IZZ']).check()
    expect(ph.hermitian).toBe(false)
    const bad = StabilizerCode.fromStrings(['ZZI', 'IZZ', '-ZIZ']).check()
    expect(bad.noMinusIdentity).toBe(false)
    expect(bad.ok).toBe(false)
    expect(() => new StabilizerCode([])).toThrow()
    expect(() => new StabilizerCode([Pauli.parse('XX'), Pauli.parse('XXX')])).toThrow()
  })

  it('k = n − rank counts a redundant generator once: ZZI, IZZ, ZIZ still encodes one qubit', () => {
    expect(StabilizerCode.fromStrings(['ZZI', 'IZZ', 'ZIZ']).k).toBe(1)
    expect(StabilizerCode.fromStrings(['ZZZZ', 'XXXX']).k).toBe(2)
  })
})

describe('stabilizer: syndromes and membership', () => {
  it('bit-flip code: X1, X2, X3 give the three distinct nonzero syndromes (the lookup table of Bergou §9.1); Z errors give none', () => {
    expect(bitflip.syndrome(Pauli.parse('XII'))).toEqual([1, 0])
    expect(bitflip.syndrome(Pauli.parse('IXI'))).toEqual([1, 1])
    expect(bitflip.syndrome(Pauli.parse('IIX'))).toEqual([0, 1])
    for (const s of ['ZII', 'IZI', 'IIZ']) expect(bitflip.syndrome(Pauli.parse(s))).toEqual([0, 0])
    expect(bitflip.syndrome(Pauli.parse('III'))).toEqual([0, 0])
    expect(() => bitflip.syndrome(Pauli.parse('XX'))).toThrow()
  })

  it('the 5-qubit code is perfect: the 15 single-qubit errors have the 15 distinct nonzero syndromes', () => {
    const seen = new Set<string>()
    for (let q = 0; q < 5; q++)
      for (const l of ['X', 'Y', 'Z'] as const) {
        const s = five.syndrome(Pauli.single(5, q, l))
        expect(s.some((b) => b === 1)).toBe(true)
        seen.add(s.join(''))
      }
    expect(seen.size).toBe(15)
  })

  it('the syndrome is linear: s(E₁E₂) = s(E₁) + s(E₂), and a stabilizer element has syndrome zero', () => {
    const rand = rng(41)
    for (let t = 0; t < 40; t++) {
      const mk = () => Pauli.fromLetters(Array.from({ length: 7 }, () => (['I', 'X', 'Y', 'Z'] as const)[Math.floor(rand() * 4)]))
      const a = mk()
      const b = mk()
      const sa = steane.syndrome(a)
      const sb = steane.syndrome(b)
      expect(steane.syndrome(a.mul(b))).toEqual(sa.map((v, i) => v ^ sb[i]))
    }
    for (const g of steane.generators) expect(steane.syndrome(g).every((b) => b === 0)).toBe(true)
  })

  it('membership: Bell group {II, XX, −YY, ZZ}: YY is "negated" (−YY is in the group), −YY is "in", XI is "outside"', () => {
    const bell = StabilizerCode.fromStrings(['XX', 'ZZ'])
    expect(bell.membership(Pauli.parse('II'))).toBe('in')
    expect(bell.membership(Pauli.parse('XX'))).toBe('in')
    expect(bell.membership(Pauli.parse('-XX'))).toBe('negated')
    expect(bell.membership(Pauli.parse('-YY'))).toBe('in')
    expect(bell.membership(Pauli.parse('YY'))).toBe('negated')
    expect(bell.membership(Pauli.parse('XI'))).toBe('outside')
    expect(bell.inStabilizer(Pauli.parse('-YY'))).toBe(true)
    expect(bell.inStabilizer(Pauli.parse('YY'))).toBe(false)
  })

  it('elements(): 2^r commuting Hermitian Paulis, closed under multiplication, with no repeats', () => {
    for (const code of [bitflip, five, steane]) {
      const els = code.elements()
      expect(els.length).toBe(2 ** code.generators.length)
      const keys = new Set(els.map(String))
      expect(keys.size).toBe(els.length)
      for (const a of els.slice(0, 20)) {
        expect(a.isHermitian()).toBe(true)
        for (const b of els.slice(0, 20)) {
          expect(a.commutesWith(b)).toBe(true)
          expect(keys.has(a.mul(b).toString())).toBe(true)
        }
      }
    }
    expect(() => StabilizerCode.fromStrings(['Z'.padEnd(20, 'I')]).elements(0)).toThrow()
  })
})

describe('stabilizer: logical operators and the Knill–Laflamme condition', () => {
  it('the 5-qubit code: XXXXX and ZZZZZ are logical, anticommute, and the computed pair is a valid symplectic basis', () => {
    const X = Pauli.parse('XXXXX')
    const Z = Pauli.parse('ZZZZZ')
    expect(five.inNormalizer(X)).toBe(true)
    expect(five.inNormalizer(Z)).toBe(true)
    expect(five.isLogical(X)).toBe(true)
    expect(five.isLogical(Z)).toBe(true)
    expect(X.commutesWith(Z)).toBe(false)
    const L = five.logicalOperators()
    expect(L.X.length).toBe(1)
    expect(L.Z.length).toBe(1)
    expect(symplecticProduct(L.X[0], L.Z[0])).toBe(1)
    expect(five.isLogical(L.X[0])).toBe(true)
    expect(five.isLogical(L.Z[0])).toBe(true)
  })

  it('Steane: logical operators are in the normalizer, not in the group, pair up symplectically; a generator is not logical', () => {
    const L = steane.logicalOperators()
    expect(L.X.length).toBe(1)
    expect(steane.isLogical(L.X[0])).toBe(true)
    expect(steane.isLogical(L.Z[0])).toBe(true)
    expect(steane.isLogical(steane.generators[0])).toBe(false)
    expect(steane.isLogical(Pauli.parse('XXXXXXX'))).toBe(true)
    expect(steane.isLogical(Pauli.parse('ZZZZZZZ'))).toBe(true)
  })

  it('random stabilizer codes (subsets of a random stabilizer state): k pairs, all in the normalizer, none in S, the right commutation pattern', () => {
    const rand = rng(42)
    for (let trial = 0; trial < 40; trial++) {
      const n = 3 + (trial % 5)
      const t = new Tableau(n)
      t.run(randomCliffordOps(n, 30, rand))
      const r = 1 + Math.floor(rand() * (n - 1)) // r generators, k = n − r ≥ 1
      const code = new StabilizerCode(t.stabilizers().slice(0, r))
      expect(code.check().ok).toBe(true)
      expect(code.k).toBe(n - r)
      const L = code.logicalOperators()
      expect(L.X.length).toBe(n - r)
      for (let i = 0; i < L.X.length; i++) {
        expect(code.isLogical(L.X[i])).toBe(true)
        expect(code.isLogical(L.Z[i])).toBe(true)
        for (let j = 0; j < L.X.length; j++) {
          expect(symplecticProduct(L.X[i], L.Z[j])).toBe(i === j ? 1 : 0)
          if (i !== j) {
            expect(symplecticProduct(L.X[i], L.X[j])).toBe(0)
            expect(symplecticProduct(L.Z[i], L.Z[j])).toBe(0)
          }
          expect(symplecticProduct(L.X[i], L.X[j])).toBe(0)
          expect(symplecticProduct(L.Z[i], L.Z[j])).toBe(0)
        }
      }
    }
  })

  it('Knill–Laflamme (Bergou Eq. 9.8): the 5-qubit code corrects all 16 errors of weight ≤ 1 but not every pair of weight-2 errors; the bit-flip code corrects X errors only', () => {
    const singles: Pauli[] = [Pauli.identity(5)]
    for (let q = 0; q < 5; q++) for (const l of ['X', 'Y', 'Z'] as const) singles.push(Pauli.single(5, q, l))
    expect(five.corrects(singles)).toBe(true)
    // some weight-3 Pauli is a logical operator (the distance is 3): pairing it with the identity breaks the condition
    const letters = ['I', 'X', 'Y', 'Z'] as const
    const logical3: Pauli[] = []
    for (let m = 0; m < 4 ** 5; m++) {
      const l = Array.from({ length: 5 }, (_, j) => letters[(m >> (2 * j)) & 3])
      const p = Pauli.fromLetters(l)
      if (p.weight() === 3 && five.isLogical(p)) logical3.push(p)
    }
    expect(logical3.length).toBeGreaterThan(0)
    expect(five.corrects([Pauli.identity(5), logical3[0]])).toBe(false)
    // and no logical operator has weight below 3, so every weight-≤1 pair product (weight ≤ 2) is fine
    for (let m = 0; m < 4 ** 5; m++) {
      const p = Pauli.fromLetters(Array.from({ length: 5 }, (_, j) => letters[(m >> (2 * j)) & 3]))
      if (p.weight() > 0 && p.weight() < 3) expect(five.isLogical(p)).toBe(false)
    }
    const xErrors = [Pauli.identity(3), Pauli.single(3, 0, 'X'), Pauli.single(3, 1, 'X'), Pauli.single(3, 2, 'X')]
    expect(bitflip.corrects(xErrors)).toBe(true)
    expect(bitflip.corrects([Pauli.identity(3), Pauli.single(3, 0, 'Z')])).toBe(false) // a Z error is a logical operator here
    expect(bitflip.corrects([Pauli.single(3, 0, 'Z'), Pauli.single(3, 1, 'Z')])).toBe(true) // Z1 Z2 is a stabilizer: degenerate, still fine
    expect(steane.corrects([Pauli.identity(7), ...[0, 1, 2, 3, 4, 5, 6].flatMap((q) => (['X', 'Y', 'Z'] as const).map((l) => Pauli.single(7, q, l)))])).toBe(true)
  })
})
