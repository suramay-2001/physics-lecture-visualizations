/**
 * The Chapter F7 additions to qc/bits.ts against numpy (pipeline/make_bits_fixtures.py → __fixtures__/qc-bits.json: gates as Python lambdas
 * over tuples of bits, the function census over numpy columns, itertools for the reversible maps and the sort count, elimination on integer
 * bitmasks with every null space found by trying all vectors, a threshold scanned in exact Fractions), plus properties: every named gate's
 * reversibility, the involution of the f-CNOT, Landauer's value, the steps of the elimination replaying to the same reduced form, the
 * Hamming syndromes.
 */
import { describe, expect, it } from 'vitest'
import raw from '../__fixtures__/qc-bits.json?raw'
import { dagger, identity, matmul, maxDiff } from '../linalg'
import {
  BITS_GATES,
  type Bit,
  EV,
  K_B,
  bigORatio,
  bigOThreshold,
  bitString,
  booleanCount,
  checkTable,
  composeMaps,
  exponentialCost,
  functionCensus,
  gateTable,
  gf2MatVec,
  gf2Nullspace,
  gf2RowReduce,
  gf2RowReduceSteps,
  gf2Span,
  hammingParity,
  isBijection,
  isInvolution,
  landauerEV,
  landauerJ,
  mapCensus,
  maxPreimages,
  pairwiseSortComparisons,
  parseBits,
  periodicTable,
  permutationMatrix,
  preimageCount,
  quadraticCost,
  reversibleOracle,
  rootExponentialCost,
  syndromeOf,
  truthTable,
} from './bits'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const FX: any = JSON.parse(raw)
const close = (a: number, b: number, rel = 1e-12) => expect(Math.abs(a - b), `${a} ≈ ${b}`).toBeLessThanOrEqual(rel * Math.max(1, Math.abs(b)))

describe('bit strings', () => {
  it('bitString and parseBits are inverse, first bit most significant', () => {
    expect(bitString(6, 3)).toBe('110')
    expect(bitString(0, 4)).toBe('0000')
    expect(parseBits('101')).toBe(5)
    for (let n = 1; n <= 5; n++) for (let x = 0; x < 2 ** n; x++) expect(parseBits(bitString(x, n))).toBe(x)
    expect(() => parseBits('10a')).toThrow()
    expect(() => parseBits('')).toThrow()
  })
})

describe('gateTable against Python lambdas over tuples of bits', () => {
  it('every named gate: the same n, m and outputs', () => {
    for (const name of BITS_GATES) expect(gateTable(name), name).toEqual(FX.gates[name])
  })
  it('AND is 0001, OR 0111, XOR 0110, NAND 1110 (N&C pp. 130–131)', () => {
    expect(gateTable('AND').out).toEqual([0, 0, 0, 1])
    expect(gateTable('OR').out).toEqual([0, 1, 1, 1])
    expect(gateTable('XOR').out).toEqual([0, 1, 1, 0])
    expect(gateTable('NAND').out).toEqual([1, 1, 1, 0])
  })
  it('the reversible gates are bijections and the others are not', () => {
    for (const name of ['NOT', 'CNOT', 'SWAP', 'Toffoli', 'Fredkin'] as const) {
      const g = gateTable(name)
      expect(g.n, name).toBe(g.m)
      expect(isBijection(g.out, g.m), name).toBe(true)
      expect(maxPreimages(g.out), name).toBe(1)
    }
    for (const name of ['AND', 'OR', 'XOR', 'NAND'] as const) {
      const g = gateTable(name)
      expect(isBijection(g.out, g.m), name).toBe(false)
    }
  })
  it('AND sends three inputs to 0 and one to 1; OR, NAND the other way round; XOR two and two', () => {
    expect(preimageCount(gateTable('AND').out, 0)).toBe(3)
    expect(preimageCount(gateTable('AND').out, 1)).toBe(1)
    expect(preimageCount(gateTable('OR').out, 0)).toBe(1)
    expect(preimageCount(gateTable('NAND').out, 1)).toBe(3)
    expect(maxPreimages(gateTable('XOR').out)).toBe(2)
    expect(maxPreimages(gateTable('AND').out)).toBe(3)
  })
  it('Toffoli at c = 0 is AND of the first two bits; at c = 1 it is NAND (N&C Fig. 3.18)', () => {
    const t = gateTable('Toffoli').out
    const c0 = [0, 1, 2, 3].map((ab) => t[ab * 2] & 1)
    const c1 = [0, 1, 2, 3].map((ab) => t[ab * 2 + 1] & 1)
    expect(c0).toEqual(gateTable('AND').out)
    expect(c1).toEqual(gateTable('NAND').out)
  })
  it('Toffoli, Fredkin, CNOT and NOT are their own inverses; SWAP too', () => {
    for (const name of ['NOT', 'CNOT', 'SWAP', 'Toffoli', 'Fredkin'] as const) expect(isInvolution(gateTable(name).out), name).toBe(true)
  })
  it('the f-CNOT (x, y) → (x, y ⊕ f(x)) is an involution for all 16 two-bit functions', () => {
    for (let code = 0; code < 16; code++) {
      const t = truthTable((x) => (code >> x) & 1, 2)
      const perm = reversibleOracle(t)
      expect(isBijection(perm, 3)).toBe(true)
      expect(isInvolution(perm)).toBe(true)
      expect(composeMaps(perm, perm)).toEqual([0, 1, 2, 3, 4, 5, 6, 7])
    }
  })
  it('a permutation matrix of a reversible gate is a real unitary: PᵀP = I, matching numpy', () => {
    const P = permutationMatrix(gateTable('Toffoli').out)
    const real = P.map((row) => row.map((z) => z.re))
    expect(real.map((r) => r.map((v) => Math.round(v)))).toEqual(FX.toffoliPermMatrix)
    expect(maxDiff(matmul(dagger(P), P), identity(8))).toBeLessThan(1e-15)
    expect(FX.toffoliPtP).toBe(0)
  })
  it('checkTable accepts a good table and says what is wrong with a bad one', () => {
    expect(checkTable([0, 1, 2, 3, 2, 3, 0, 1], 3, 2)).toEqual({ n: 3, m: 2, out: [0, 1, 2, 3, 2, 3, 0, 1] })
    expect(() => checkTable([0, 1, 2], 2, 1)).toThrow(/4 rows/)
    expect(() => checkTable([0, 1, 2, 3], 2, 1)).toThrow(/every output/)
    expect(() => checkTable([0, 0, 0, 0], 4, 1)).toThrow(/n is/)
    expect(() => checkTable([0, 0, 0, 0], 2, 4)).toThrow(/m is/)
  })
})

describe('counting functions', () => {
  it('the census of constant, balanced and other functions equals numpy’s, n = 1 … 4', () => {
    for (const n of [1, 2, 3, 4]) expect(functionCensus(n), `n=${n}`).toEqual(FX.census[String(n)])
  })
  it('there are 2^(2^n) functions: 4, 16, 256 (65536 for n = 4); 2 constant; C(2^n, 2^(n−1)) balanced', () => {
    const binom = (a: number, b: number): number => (b === 0 ? 1 : (binom(a - 1, b - 1) * a) / b)
    for (const n of [1, 2, 3, 4]) {
      const c = functionCensus(n)
      expect(c.total).toBe(2 ** 2 ** n)
      expect(c.constant).toBe(2)
      expect(c.balanced).toBe(binom(2 ** n, 2 ** (n - 1)))
      expect(c.total).toBe(c.constant + c.balanced + c.neither)
      expect(booleanCount(n)).toBe(c.total)
    }
    expect(functionCensus(3)).toEqual({ total: 256, constant: 2, balanced: 70, neither: 184 })
    expect(functionCensus(2)).toEqual({ total: 16, constant: 2, balanced: 6, neither: 8 })
  })
  it('the maps of two bits to two bits: 4⁴ = 256, of which 4! = 24 are permutations (itertools)', () => {
    let maps = 0
    let perms = 0
    for (let code = 0; code < 256; code++) {
      const out = [0, 1, 2, 3].map((x) => (code >> (2 * x)) & 3)
      maps++
      if (isBijection(out, 2)) perms++
    }
    expect({ total: maps, perms }).toEqual({ total: FX.maps22.total, perms: FX.maps22.perms })
    expect(FX.maps22.perms).toBe(FX.maps22.permutations)
  })
  it('mapCensus lists them: 256 maps of two bits, 24 bijections, matching numpy; one bit has 4 maps and 2 bijections', () => {
    expect(mapCensus(2, 2)).toEqual({ total: FX.maps22.total, bijections: FX.maps22.perms })
    expect(mapCensus(1, 1)).toEqual({ total: 4, bijections: 2 })
    expect(mapCensus(2, 1)).toEqual({ total: 16, bijections: 0 })
    expect(mapCensus(1, 2)).toEqual({ total: 16, bijections: 0 })
    expect(() => mapCensus(3, 3)).toThrow(/too many/)
    expect(() => mapCensus(0, 1)).toThrow()
  })
  it('rejects n outside 1 … 4', () => {
    expect(() => functionCensus(0)).toThrow()
    expect(() => functionCensus(5)).toThrow()
    expect(() => booleanCount(2.5)).toThrow()
  })
})

describe('Landauer and the cost curves', () => {
  it('k_B T ln 2 at several temperatures equals numpy’s, in joules and in electron-volts', () => {
    for (const [T, v] of Object.entries(FX.landauer) as [string, { J: number; eV: number }][]) {
      close(landauerJ(Number(T)), v.J)
      close(landauerEV(Number(T)), v.eV)
    }
    expect(K_B).toBe(1.380649e-23)
    expect(EV).toBe(1.602176634e-19)
  })
  it('at 300 K the floor is 2.87 × 10⁻²¹ J = 0.0179 eV; it grows in proportion to T', () => {
    expect(landauerJ(300) / 1e-21).toBeCloseTo(2.871, 3)
    expect(landauerEV(300)).toBeCloseTo(0.0179, 4)
    close(landauerJ(600), 2 * landauerJ(300))
    expect(() => landauerJ(0)).toThrow()
    expect(() => landauerJ(-5)).toThrow()
  })
  it('the pairwise sort count n(n−1)/2 equals itertools.combinations’s length', () => {
    for (const [n, v] of Object.entries(FX.sort)) {
      expect(pairwiseSortComparisons(Number(n)), `n=${n}`).toBe(v)
      expect(pairwiseSortComparisons(Number(n))).toBe(Math.abs((Number(n) * (Number(n) - 1)) / 2))
    }
    expect(pairwiseSortComparisons(10)).toBe(45)
    expect(() => pairwiseSortComparisons(-1)).toThrow()
  })
  it('n², 2ⁿ, 2^(n/2) and the ratio (3n²+5n+7)/n² equal numpy’s', () => {
    for (const [n, v] of Object.entries(FX.cost) as [string, { sq: number; exp: number; root: number; ratio: number }][]) {
      expect(quadraticCost(Number(n))).toBe(v.sq)
      expect(exponentialCost(Number(n))).toBe(v.exp)
      close(rootExponentialCost(Number(n)), v.root)
      close(bigORatio(Number(n)), v.ratio)
    }
  })
  it('doubling: one more bit doubles 2ⁿ and adds 2n + 1 to n²; two more bits double 2^(n/2)', () => {
    for (let n = 1; n < 40; n++) {
      expect(exponentialCost(n + 1)).toBe(2 * exponentialCost(n))
      expect(quadraticCost(n + 1) - quadraticCost(n)).toBe(2 * n + 1)
      close(rootExponentialCost(n + 2), 2 * rootExponentialCost(n))
    }
  })
  it('the threshold of 3n² + 5n + 7 = O(n²) with c = 4 is n₀ = 7 (numpy: the last failure is n = 6)', () => {
    const f = (n: number) => 3 * n * n + 5 * n + 7
    expect(bigOThreshold(f, quadraticCost, 4)).toBe(FX.bigO.n0)
    expect(bigOThreshold(f, quadraticCost, 4)).toBe(7)
    expect(FX.bigO.lastFail).toBe(6)
    // with c = 3 the bound never holds (the ratio stays above 3), so no threshold exists
    expect(bigOThreshold(f, quadraticCost, 3)).toBeNull()
    expect(FX.bigOc3.fails_up_to_2000).toBe(2000)
    expect(bigORatio(6)).toBeGreaterThan(4)
    expect(bigORatio(7)).toBeLessThanOrEqual(4)
  })
})

describe('Simon-style tables', () => {
  it('periodicTable(s, n): f(x) = f(x ⊕ s), every value taken exactly twice, equal to numpy’s', () => {
    for (const [key, v] of Object.entries(FX.periodic) as [string, { table: number[]; classes: number[] }][]) {
      const [n, s] = key.split('-').map(Number)
      const t = periodicTable(s, n)
      expect(t).toEqual(v.table)
      for (let x = 0; x < 2 ** n; x++) expect(t[x]).toBe(t[x ^ s])
      expect(v.classes.every((k) => k === 2)).toBe(true)
    }
    expect(periodicTable(6, 3)).toEqual([0, 1, 2, 3, 2, 3, 0, 1])
    expect(() => periodicTable(0, 3)).toThrow()
    expect(() => periodicTable(8, 3)).toThrow()
  })
})

describe('Gauss–Jordan, one move at a time', () => {
  it('the last snapshot is the RREF of gf2RowReduce and of the bitmask elimination, with the same rank and pivots', () => {
    for (const k of FX.rref) {
      const steps = gf2RowReduceSteps(k.M)
      expect(steps.R).toEqual(k.R)
      expect(steps.R).toEqual(gf2RowReduce(k.M).R)
      expect(steps.pivots).toEqual(k.pivots)
      expect(steps.rank).toBe(k.rank)
      expect(steps.steps.filter((s) => s.op === 'swap').length).toBe(k.swaps)
      expect(steps.steps.filter((s) => s.op === 'xor').length).toBe(k.xors)
      if (steps.steps.length) expect(steps.steps.at(-1)!.R).toEqual(k.R)
      else expect(steps.start).toEqual(k.R)
    }
  })
  it('each snapshot is the previous one after exactly the move it names', () => {
    for (const k of FX.rref) {
      const { start, steps } = gf2RowReduceSteps(k.M)
      let prev: Bit[][] = start
      for (const s of steps) {
        const want = prev.map((row) => [...row])
        if (s.op === 'swap') [want[s.a], want[s.b]] = [want[s.b], want[s.a]]
        else want[s.b] = want[s.b].map((x, j) => (x ^ prev[s.a][j]) as Bit)
        expect(s.R).toEqual(want)
        prev = s.R
      }
    }
  })
  it('the running example: 001 over 111 → swap, then XOR; rank 2; null space {000, 110}', () => {
    const r = gf2RowReduceSteps([
      [0, 0, 1],
      [1, 1, 1],
    ])
    expect(r.steps.map((s) => s.op)).toEqual(['swap', 'xor'])
    expect(r.steps[0].R).toEqual([
      [1, 1, 1],
      [0, 0, 1],
    ])
    expect(r.R).toEqual([
      [1, 1, 0],
      [0, 0, 1],
    ])
    expect(r.rank).toBe(2)
    expect(gf2Span(gf2Nullspace([[0, 0, 1], [1, 1, 1]]), 3)).toEqual([0, 6])
  })
  it('the null space, listed whole by gf2Span, equals the vectors numpy finds by trying all of them; its size is 2^(cols − rank)', () => {
    for (const k of FX.rref) {
      const cols = k.M[0].length
      const span = gf2Span(gf2Nullspace(k.M, cols), cols)
      expect(span).toEqual(k.null)
      expect(span.length).toBe(2 ** (cols - gf2RowReduce(k.M).rank))
      for (const x of span) expect(gf2MatVec(k.M, [...bitString(x, cols)].map(Number)).every((v) => v === 0)).toBe(true)
    }
  })
  it('the null space of the rows 001 and 011 is {000, 100}; of 110, 011, 101 it is {000, 111}', () => {
    expect(gf2Span(gf2Nullspace([[0, 0, 1], [0, 1, 1]]), 3)).toEqual([0, 4])
    expect(gf2Span(gf2Nullspace([[1, 1, 0], [0, 1, 1], [1, 0, 1]]), 3)).toEqual([0, 7])
  })
  it('gf2Span rejects a vector of the wrong length', () => {
    expect(() => gf2Span([[1, 0]], 3)).toThrow()
  })
})

describe('check matrices and syndromes', () => {
  it('Hamming [7,4]: every single flip at position j reads j in binary; the received word 1110010 reads 110 (numpy)', () => {
    const M = hammingParity(3)
    expect(M).toEqual(FX.hamming3.M)
    for (let j = 1; j <= 7; j++) {
      const e = Array.from({ length: 7 }, (_, i) => (i === j - 1 ? '1' : '0')).join('')
      expect(syndromeOf(M, e)).toBe(FX.hamming3.syndromes[String(j)])
      expect(parseBits(syndromeOf(M, e))).toBe(j)
    }
    expect(syndromeOf(M, FX.hamming3.word)).toBe(FX.hamming3.wordSyndrome)
    expect(FX.hamming3.wordSyndrome).toBe('110')
  })
  it('the code words (syndrome 000) number 2⁴ = 16, equal numpy’s list; 1110000 is one, and 1110010 is it with place 6 flipped', () => {
    const M = hammingParity(3)
    const words = Array.from({ length: 128 }, (_, w) => bitString(w, 7)).filter((w) => syndromeOf(M, w) === '000')
    expect(words).toEqual(FX.hamming3.codewords)
    expect(words.length).toBe(16)
    expect(words).toContain('1110000')
    expect(syndromeOf(M, '1110010')).toBe('110')
  })
  it('syndromeOf checks the word length', () => {
    expect(() => syndromeOf(hammingParity(3), '101')).toThrow()
  })
})
