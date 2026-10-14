/**
 * qec/gf2.ts: the packed GF(2) matrices. Properties over random matrices (a seeded generator, so the run is repeatable): the product against a
 * plain triple loop, rank against the independent array-of-arrays routine in qc/bits.ts, rank-nullity, row-space membership, solutions of linear
 * systems, the mixed-product rule for the Kronecker product, the transpose of a product, and shapes that need more than one 32-bit word per row.
 * The numpy comparison (rank by an XOR basis on Python integers, null-space size by counting) is in fixtures.test.ts.
 */
import { describe, expect, it } from 'vitest'
import { rng } from '../random'
import { gf2Nullspace, gf2Rank, gf2Solve, hammingParity } from '../qc/bits'
import { GF2Matrix, dot, fromSupport, packBits, popcount, support, unpackBits, weight, xorBits } from './gf2'

function randomMatrix(r: number, c: number, rand: () => number, density = 0.5): GF2Matrix {
  const M = GF2Matrix.zeros(r, c)
  for (let i = 0; i < r; i++) for (let j = 0; j < c; j++) if (rand() < density) M.set(i, j, 1)
  return M
}

/** The product by the textbook triple loop on arrays, the check on the packed `mul`. */
function naiveMul(A: number[][], B: number[][]): number[][] {
  return A.map((row) => B[0].map((_, j) => row.reduce((s, a, k) => s ^ (a & B[k][j]), 0)))
}

describe('gf2: bits and vectors', () => {
  it('popcount agrees with a bit-by-bit count on edge words and random words', () => {
    const rand = rng(1)
    const naive = (x: number) => x.toString(2).split('').filter((b) => b === '1').length
    for (const x of [0, 1, 0x80000000, 0xffffffff, 0x55555555, 0xaaaaaaaa]) expect(popcount(x)).toBe(naive(x >>> 0))
    for (let t = 0; t < 200; t++) {
      const x = Math.floor(rand() * 2 ** 32)
      expect(popcount(x)).toBe(naive(x))
    }
  })

  it('pack and unpack are inverse, weight / dot / xor / support behave', () => {
    const rand = rng(2)
    for (const n of [1, 31, 32, 33, 64, 70]) {
      const v = Array.from({ length: n }, () => (rand() < 0.5 ? 1 : 0))
      expect(unpackBits(packBits(v), n)).toEqual(v)
      expect(support(v).length).toBe(weight(v))
      expect(fromSupport(support(v), n)).toEqual(v)
      expect(dot(v, v)).toBe(weight(v) & 1)
      const w = Array.from({ length: n }, () => (rand() < 0.5 ? 1 : 0))
      const both = support(v).filter((i) => w[i]).length
      expect(weight(xorBits(v, w))).toBe(weight(v) + weight(w) - 2 * both)
      expect(dot(v, w)).toBe(both & 1)
    }
    expect(() => dot([1], [1, 0])).toThrow()
    expect(() => fromSupport([3], 3)).toThrow()
  })
})

describe('gf2: building and reading matrices', () => {
  it('fromRows / fromSupports / fromText / toRows / toText round-trip, and get / set agree', () => {
    const rows = [
      [1, 0, 1, 0, 1, 0, 1],
      [0, 1, 1, 0, 0, 1, 1],
      [0, 0, 0, 1, 1, 1, 1],
    ]
    const H = GF2Matrix.fromRows(rows)
    expect(H.toRows()).toEqual(rows)
    expect(GF2Matrix.fromSupports(rows.map(support), 7).equals(H)).toBe(true)
    expect(GF2Matrix.fromText(H.toText().replace(/\n/g, ' ')).equals(H)).toBe(true)
    expect(H.rowSupport(1)).toEqual([1, 2, 5, 6])
    expect(H.rowWeight(2)).toBe(4)
    expect(H.colWeight(6)).toBe(3)
    expect(H.totalWeight()).toBe(12)
    H.set(0, 0, 0)
    expect(H.get(0, 0)).toBe(0)
    H.set(0, 0, 1)
    expect(H.toRows()).toEqual(rows)
  })

  it('refuses entries that are not 0 or 1, ragged rows, out-of-range positions and a bad permutation', () => {
    expect(() => GF2Matrix.fromRows([[0, 2]])).toThrow()
    expect(() => GF2Matrix.fromRows([[0, 1], [1]])).toThrow()
    expect(() => GF2Matrix.fromSupports([[5]], 3)).toThrow()
    expect(() => GF2Matrix.zeros(2, 2).set(2, 0, 1)).toThrow()
    expect(() => GF2Matrix.permutation([0, 0, 1])).toThrow()
    expect(() => GF2Matrix.zeros(2, 3).mul(GF2Matrix.zeros(2, 3))).toThrow()
  })

  it('a repeated column in fromSupports cancels (XOR), the empty matrix is allowed', () => {
    expect(GF2Matrix.fromSupports([[1, 1, 2]], 3).toRows()).toEqual([[0, 0, 1]])
    expect(GF2Matrix.zeros(0, 5).rank()).toBe(0)
    expect(GF2Matrix.fromRows([], 5).cols).toBe(5)
  })

  it('wide matrices (more than one word per row) read and write correctly', () => {
    const M = GF2Matrix.zeros(2, 70)
    for (const j of [0, 31, 32, 63, 64, 69]) M.set(1, j, 1)
    expect(M.rowSupport(1)).toEqual([0, 31, 32, 63, 64, 69])
    expect(M.rowWeight(1)).toBe(6)
    expect(M.rowWeight(0)).toBe(0)
    expect(M.stride).toBe(3)
  })
})

describe('gf2: products, transposes, stacking, Kronecker', () => {
  it('mul agrees with the triple loop on random shapes, including wide ones; the identity is neutral', () => {
    const rand = rng(3)
    for (const [r, k, c] of [[3, 4, 5], [7, 7, 7], [5, 40, 33], [34, 9, 66], [1, 1, 1]] as const) {
      const A = randomMatrix(r, k, rand)
      const B = randomMatrix(k, c, rand)
      expect(A.mul(B).toRows()).toEqual(naiveMul(A.toRows(), B.toRows()))
      expect(GF2Matrix.identity(r).mul(A).equals(A)).toBe(true)
      expect(A.mul(GF2Matrix.identity(k)).equals(A)).toBe(true)
    }
  })

  it('associativity, distributivity and (AB)ᵀ = BᵀAᵀ', () => {
    const rand = rng(4)
    for (let t = 0; t < 20; t++) {
      const A = randomMatrix(6, 8, rand)
      const B = randomMatrix(8, 5, rand)
      const C = randomMatrix(5, 9, rand)
      const D = randomMatrix(8, 5, rand)
      expect(A.mul(B).mul(C).equals(A.mul(B.mul(C)))).toBe(true)
      expect(A.mul(B.add(D)).equals(A.mul(B).add(A.mul(D)))).toBe(true)
      expect(A.mul(B).transpose().equals(B.transpose().mul(A.transpose()))).toBe(true)
      expect(A.transpose().transpose().equals(A)).toBe(true)
    }
  })

  it('mulVec is the syndrome H·x and leftMulVec is y·H; both agree with mul on a vector', () => {
    const rand = rng(5)
    const H = randomMatrix(9, 40, rand)
    const x = Array.from({ length: 40 }, () => (rand() < 0.5 ? 1 : 0))
    const y = Array.from({ length: 9 }, () => (rand() < 0.5 ? 1 : 0))
    const col = GF2Matrix.fromRows(x.map((b) => [b]))
    expect(H.mulVec(x)).toEqual(H.mul(col).toRows().map((r) => r[0]))
    const row = GF2Matrix.fromRows([y])
    expect(H.leftMulVec(y)).toEqual(row.mul(H).toRows()[0])
    expect(() => H.mulVec([1, 0])).toThrow()
  })

  it('hstack / vstack / slices / pickRows fit together', () => {
    const rand = rng(6)
    const A = randomMatrix(5, 37, rand)
    const B = randomMatrix(5, 40, rand)
    const AB = A.hstack(B)
    expect(AB.sliceCols(0, 37).equals(A)).toBe(true)
    expect(AB.sliceCols(37, 77).equals(B)).toBe(true)
    const C = randomMatrix(3, 37, rand)
    const AC = A.vstack(C)
    expect(AC.sliceRows(0, 5).equals(A)).toBe(true)
    expect(AC.sliceRows(5, 8).equals(C)).toBe(true)
    expect(AC.pickRows([7, 0]).toRows()).toEqual([C.rowBits(2), A.rowBits(0)])
  })

  it('Kronecker: shape, a worked 2×2 example, and the mixed-product rule (A⊗B)(C⊗D) = AC⊗BD', () => {
    const X = GF2Matrix.fromText('01 10')
    const I = GF2Matrix.identity(2)
    expect(X.kron(I).toText()).toBe('0010\n0001\n1000\n0100')
    expect(I.kron(X).toText()).toBe('0100\n1000\n0001\n0010')
    const rand = rng(7)
    for (let t = 0; t < 10; t++) {
      const A = randomMatrix(3, 4, rand)
      const C = randomMatrix(4, 2, rand)
      const B = randomMatrix(2, 5, rand)
      const D = randomMatrix(5, 3, rand)
      const lhs = A.kron(B).mul(C.kron(D))
      expect(lhs.rows).toBe(6)
      expect(lhs.cols).toBe(6)
      expect(lhs.equals(A.mul(C).kron(B.mul(D)))).toBe(true)
    }
  })

  it('a permutation matrix permutes the columns of a vector it multiplies', () => {
    const P = GF2Matrix.permutation([2, 0, 1])
    expect(P.mulVec([1, 0, 0])).toEqual([0, 1, 0])
    expect(P.mul(P).mul(P).equals(GF2Matrix.identity(3))).toBe(true)
  })
})

describe('gf2: elimination, rank, null space, solving', () => {
  it('rank of the [7,4] Hamming parity-check matrix is 3 (Bergou Eq. 9.53) and has the row space of qc/bits hammingParity', () => {
    const H = GF2Matrix.fromText('1010101 0110011 0001111')
    const other = GF2Matrix.fromRows(hammingParity(3)) // the same three rows in the order qc/bits writes them
    expect(H.rank()).toBe(3)
    expect(H.nullspace().rows).toBe(4)
    expect(H.vstack(other).rank()).toBe(3)
    expect(other.rowspaceContains(H.rowBits(0))).toBe(true)
  })

  it('rank agrees with the independent array-of-arrays gf2Rank on random matrices of many shapes (and densities)', () => {
    const rand = rng(8)
    for (let t = 0; t < 60; t++) {
      const r = 1 + Math.floor(rand() * 20)
      const c = 1 + Math.floor(rand() * 70)
      const M = randomMatrix(r, c, rand, [0.1, 0.5, 0.9][t % 3])
      expect(M.rank(), `${r}×${c}`).toBe(gf2Rank(M.toRows()))
    }
  })

  it('rref: pivots increase, pivot columns are unit columns, R keeps the row space, input unchanged', () => {
    const rand = rng(9)
    for (let t = 0; t < 20; t++) {
      const M = randomMatrix(8, 45, rand, 0.3)
      const before = M.clone()
      const { R, pivots } = M.rref()
      expect(M.equals(before)).toBe(true)
      expect([...pivots].sort((a, b) => a - b)).toEqual(pivots)
      pivots.forEach((pc, r) => {
        expect(R.colWeight(pc)).toBe(1)
        expect(R.get(r, pc)).toBe(1)
      })
      for (let i = pivots.length; i < R.rows; i++) expect(R.rowWeight(i)).toBe(0)
      expect(M.vstack(R).rank()).toBe(pivots.length)
      expect(M.rowBasis().rows).toBe(pivots.length)
      expect(M.rowBasis().rank()).toBe(pivots.length)
    }
  })

  it('rank–nullity: the null space has cols − rank independent rows, each killed by H; it matches qc/bits gf2Nullspace in size', () => {
    const rand = rng(10)
    for (let t = 0; t < 40; t++) {
      const r = 1 + Math.floor(rand() * 15)
      const c = 1 + Math.floor(rand() * 66)
      const H = randomMatrix(r, c, rand, 0.3)
      const N = H.nullspace()
      expect(N.rows).toBe(c - H.rank())
      expect(N.rank()).toBe(N.rows)
      for (let i = 0; i < N.rows; i++) expect(H.mulVec(N.rowBits(i)).every((b) => b === 0)).toBe(true)
      expect(gf2Nullspace(H.toRows(), c).length).toBe(N.rows)
    }
  })

  it('rowspaceContains / solveRowCombination: a combination of rows is found and rebuilds the vector; a vector outside is refused', () => {
    const rand = rng(11)
    for (let t = 0; t < 30; t++) {
      const H = randomMatrix(6, 50, rand, 0.2)
      const y = Array.from({ length: 6 }, () => (rand() < 0.5 ? 1 : 0))
      const v = H.leftMulVec(y)
      const c = H.solveRowCombination(v)
      expect(c).not.toBeNull()
      expect(H.leftMulVec(c!)).toEqual(v)
      expect(H.rowspaceContains(v)).toBe(true)
    }
    const H = GF2Matrix.fromText('1100 0011')
    expect(H.rowspaceContains([1, 1, 1, 1])).toBe(true)
    expect(H.rowspaceContains([1, 0, 0, 0])).toBe(false)
    expect(H.solveRowCombination([1, 0, 1, 0])).toBeNull()
  })

  it('solve: a consistent system is solved, an inconsistent one is refused, and adding a null-space row gives another solution; matches qc/bits gf2Solve on solvability', () => {
    const rand = rng(12)
    for (let t = 0; t < 40; t++) {
      const H = randomMatrix(7, 12, rand, 0.4)
      const x0 = Array.from({ length: 12 }, () => (rand() < 0.5 ? 1 : 0))
      const b = H.mulVec(x0)
      const x = H.solve(b)
      expect(x).not.toBeNull()
      expect(H.mulVec(x!)).toEqual(b)
      const N = H.nullspace()
      if (N.rows > 0) expect(H.mulVec(xorBits(x!, N.rowBits(0)))).toEqual(b)
      const bad = Array.from({ length: 7 }, () => (rand() < 0.5 ? 1 : 0))
      expect(H.solve(bad) === null).toBe(gf2Solve(H.toRows(), bad) === null)
    }
  })
})
