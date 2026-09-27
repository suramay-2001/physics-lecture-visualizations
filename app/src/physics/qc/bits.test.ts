/**
 * bits.ts against python (block "bits": bin(x).count('1') dot products and distances, exhaustive truth tables on
 * 2 and 3 bits, tuple-built reversible permutations, and an independent Gauss–Jordan mod 2 whose RREF is unique and so
 * compared entry by entry), plus properties: null-space vectors satisfy Mx = 0, solutions satisfy Mx = b, the
 * Hamming code's single-flip syndromes are the flip positions, Σ_x (−1)^{x·z} = 2ⁿ δ_{z,0} (F7 D4).
 */
import { describe, expect, it } from 'vitest'
import { rng } from '../random'
import {
  dotMod2,
  gf2MatVec,
  gf2Nullspace,
  gf2Rank,
  gf2RowReduce,
  gf2Solve,
  hammingDistance,
  hammingParity,
  hammingWeight,
  isBalanced,
  isConstant,
  parity,
  permutationMatrix,
  randomBalanced,
  reversibleOracle,
  truthTable,
  xor,
} from './bits'
import { FX } from './testkit'

const D = FX.bits

describe('bit strings and Boolean functions (F7)', () => {
  it('dotMod2, hammingDistance, xor over all pairs of 4-bit strings; weights and parity to 63', () => {
    for (const k of D.pairs) {
      expect(dotMod2(k.x, k.z)).toBe(k.dot)
      expect(hammingDistance(k.x, k.z)).toBe(k.dist)
      expect(hammingWeight(xor(k.x, k.z))).toBe(k.dist)
    }
    D.weights.forEach((w: number, x: number) => {
      expect(hammingWeight(x)).toBe(w)
      expect(parity(x)).toBe(w % 2)
    })
  })

  it('isConstant / isBalanced on all 16 two-bit and all 256 three-bit functions', () => {
    for (const f of D.funcs2) {
      expect(isConstant(f.table)).toBe(f.constant)
      expect(isBalanced(f.table)).toBe(f.balanced)
    }
    D.funcs3.forEach(([constant, balanced]: [number, number], f: number) => {
      const t = truthTable((x) => (f >> (7 - x)) & 1, 3)
      expect(isConstant(t)).toBe(constant === 1)
      expect(isBalanced(t)).toBe(balanced === 1)
    })
    expect(D.funcs3.filter(([, b]: [number, number]) => b).length).toBe(70) // C(8, 4)
  })

  it('reversibleOracle = the (x, y) → (x, y ⊕ f(x)) permutation; it is its own inverse; permutationMatrix puts column j\'s 1 at π[j]', () => {
    for (const k of D.reversible) {
      const p = reversibleOracle(k.table)
      expect(p).toEqual(k.perm)
      p.forEach((j, i) => expect(p[j]).toBe(i))
      const M = permutationMatrix(p)
      p.forEach((pj, j) => expect(M[pj][j].re).toBe(1))
    }
    expect(() => permutationMatrix([0, 0])).toThrow()
  })

  it('F7 D4: Σ_x (−1)^{x·z} = 2ⁿ when z = 0 and 0 otherwise (n = 1…5)', () => {
    for (let n = 1; n <= 5; n++)
      for (let z = 0; z < 2 ** n; z++) {
        let s = 0
        for (let x = 0; x < 2 ** n; x++) s += dotMod2(x, z) ? -1 : 1
        expect(s).toBe(z === 0 ? 2 ** n : 0)
      }
  })

  it('randomBalanced is balanced and seeded', () => {
    for (let n = 1; n <= 6; n++) expect(isBalanced(randomBalanced(n, rng(n)))).toBe(true)
    expect(randomBalanced(5, rng(3))).toEqual(randomBalanced(5, rng(3)))
  })
})

describe('GF(2) linear algebra', () => {
  it('RREF, pivots and rank = the independent python elimination; nullity = cols − rank', () => {
    for (const k of D.gf2) {
      const r = gf2RowReduce(k.M)
      expect(r.R).toEqual(k.R)
      expect(r.pivots).toEqual(k.pivots)
      expect(gf2Rank(k.M)).toBe(k.rank)
      const N = gf2Nullspace(k.M)
      expect(N.length).toBe(k.nullity)
      for (const x of N) expect(gf2MatVec(k.M, x).every((v) => v === 0)).toBe(true)
      if (N.length) expect(gf2Rank(N)).toBe(N.length) // a basis, not just a spanning list
    }
  })

  it('gf2Solve: a consistent b gets a solution with Mx = b; an inconsistent b gets null', () => {
    for (const k of D.gf2) {
      const x = gf2Solve(k.M, k.bOk)
      expect(x).not.toBeNull()
      expect(gf2MatVec(k.M, x!)).toEqual(k.bOk)
      if (k.bBad) expect(gf2Solve(k.M, k.bBad)).toBeNull()
    }
  })

  it('hammingParity(r) = the python matrix; every single flip at position j has syndrome j (Q20)', () => {
    for (const [r, Hm] of Object.entries(D.hamming) as [string, number[][]][]) {
      const Hp = hammingParity(Number(r))
      expect(Hp).toEqual(Hm)
      const n = Hp[0].length
      for (let j = 0; j < n; j++) {
        const e = Array.from({ length: n }, (_, i) => (i === j ? 1 : 0))
        const syn = gf2MatVec(Hp, e)
        expect(parseInt(syn.join(''), 2)).toBe(j + 1)
      }
      expect(gf2Rank(Hp)).toBe(Number(r))
    }
  })

  it('Simon-style recovery: the null space of strings y with y·s = 0 is {0, s}', () => {
    const s = [1, 0, 1, 1]
    const R = rng(7107)
    const ys: number[][] = []
    while (gf2Rank(ys.length ? ys : [[0, 0, 0, 0]]) < 3) {
      const y: number[] = Array.from({ length: 4 }, () => (R() < 0.5 ? 1 : 0))
      if (y.reduce((acc, v, i) => acc + v * s[i], 0) % 2 === 0) ys.push(y)
    }
    expect(gf2Nullspace(ys)).toEqual([s])
  })
})
