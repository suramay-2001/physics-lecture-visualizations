/**
 * physics/qec/tdg.ts against the paper's printed results and against properties that do not need the paper (the numpy fixture comparison is tdg.fixtures.test.ts).
 * Each expected number below is the paper's own printed figure (or our recomputation of it, where the lecture states a difference).
 */
import { describe, expect, it } from 'vitest'
import {
  TDG_FIG10A_BICYCLE,
  TDG_FIG10A_SURFACE,
  tdgBasisFacts,
  tdgBeta,
  tdgBlocks,
  tdgCrossing,
  tdgCultivationTime,
  tdgDistribute,
  tdgDurations,
  tdgFamily,
  tdgLpuGraph,
  tdgLpuModes,
  tdgLpuModeOf,
  tdgMaxModules,
  tdgNativeSets,
  tdgPairingRows,
  tdgPiid,
  tdgQubits,
  tdgShiftClasses,
  tdgSlope,
  tdgSurfaceRow,
  tdgSurfaceTfim,
  tdgTfim,
  tdgTfimRotations,
  tdgYield,
} from './tdg'

const log10 = Math.log10

describe('Eq. 25: the machine', () => {
  it('reproduces Table 1 sums and the six bicycle rows of Fig. 10a', () => {
    expect(tdgQubits('gross', 1, null)).toMatchObject({ c: 288, u: 90, a: 22, perModule: 400 })
    expect(tdgQubits('gross', 3, '1e-3')).toMatchObject({ n: 33, q: 1661, aPrime: 29, f: 454 })
    expect(TDG_FIG10A_BICYCLE.map(([code, fac, budget]) => 11 * tdgMaxModules(code, budget, fac))).toEqual([121, 704, 110, 1342, 440, 6886])
  })
  it('the TFIM machines: 8138 for two-gross, 4801 (not the printed 4817) for gross, and 4817 needs a-prime 29', () => {
    expect(tdgQubits('two-gross', 10, '1e-3').q).toBe(8138)
    expect(tdgQubits('gross', 10, '1e-4').q).toBe(4801)
    expect(tdgQubits('gross', 10, '1e-4', 29).q).toBe(4817)
    expect(tdgQubits('gross', 10, '1e-4').aPrime).toBe(13)
  })
  it('refuses M < 1', () => expect(() => tdgQubits('gross', 0, null)).toThrow())
})

describe('yield, durations, cultivation', () => {
  it('y^J with two couplers per qubit: 1 in 2983 for 5000 qubits, 1 in 66 086 for a 12-patch d = 17 module', () => {
    expect(Math.round(tdgYield(5000).oneIn)).toBe(2983)
    expect(Math.round(tdgYield(12 * 2 * 17 * 17).oneIn)).toBe(66086)
    expect(tdgYield(5000).junctions).toBe(40000)
  })
  it('durations 8, 14, 12C', () => {
    expect(tdgDurations('gross')).toMatchObject({ idle: 8, shift: 14, measure: 120, cycleSteps: 81 })
    expect(tdgDurations('two-gross').measure).toBe(216)
  })
  it('cultivation mean time: 351 and 2167 from the printed coefficients, 352.5 and 2243 from unrounded inputs', () => {
    const c3 = tdgCultivationTime(3)
    const c5 = tdgCultivationTime(5)
    expect(Math.round(c3.fromPrinted)).toBe(351)
    expect(Math.round(c5.fromPrinted)).toBe(2167)
    expect(c3.exact).toBeCloseTo(352.5, 1)
    expect(Math.round(c5.exact)).toBe(2243)
    expect(Math.round(c3.escape * 100)).toBe(69)
  })
})

describe('Eqs. 82-83: the failure spectrum reproduces Table 2', () => {
  const rows: [Parameters<typeof tdgPiid>[0], number, number][] = [
    ['g-idle', -8.8, -14.8],
    ['2g-idle', -20.1, -38.3],
    ['g-aut', -6.4, -12.2],
    ['2g-aut', -14.5, -37],
    ['g-Y', -5.0, -9.0],
    ['g-XxX', -2.7, -7.3],
  ]
  it.each(rows)('%s at 1e-3 and 1e-4 matches the printed exponent', (series, e3, e4) => {
    expect(Math.round(log10(tdgPiid(series, 1e-3)) * 10) / 10).toBe(e3)
    expect(Math.abs(log10(tdgPiid(series, 1e-4)) - e4)).toBeLessThan(series === '2g-aut' ? 0.5 : 0.06) // the table prints 10^-37 with one significant digit
  })
  it('the slope at small p tends to w0 = 5', () => expect(Math.abs(tdgSlope('g-idle', 1e-6, 1e-5) - 5)).toBeLessThan(0.05))
  it('P is monotone in p', () => expect(tdgPiid('g-XxX', 1e-4)).toBeLessThan(tdgPiid('g-XxX', 1e-3)))
})

describe('Eq. 26 and the thresholds', () => {
  it('184 000 rotations', () => expect(tdgTfimRotations()).toBe(184000))
  it('gross failure at 1e-4 is about 0.8 and at 1e-3 above 3e4 (a first-order sum, not a probability)', () => {
    expect(tdgTfim('gross', 1e-4).failure).toBeGreaterThan(0.79)
    expect(tdgTfim('gross', 1e-4).failure).toBeLessThan(0.8)
    expect(tdgTfim('gross', 1e-3).failure).toBeGreaterThan(3e4)
  })
  it('the power-law thresholds 2.09e-5 and 7.32e-4', () => {
    expect(tdgCrossing('gross').crossing / 2.09e-5).toBeCloseTo(1, 2)
    expect(tdgCrossing('two-gross').crossing / 7.32e-4).toBeCloseTo(1, 2)
  })
})

describe('the surface-code baseline', () => {
  it('the five matching Fig. 10a rows and the d = 5 row that needs n = 50', () => {
    const rows = TDG_FIG10A_SURFACE.map(([p, q, d, f, t]) => tdgSurfaceRow(p, q, d, f, t))
    expect(rows.map((r) => r.n)).toEqual([45, 42, 21, 250, 27, 416])
    expect(rows.map((r) => r.time)).toEqual([381, 2269, 115, 115, 509, 509])
    expect(rows[1].NT / 2.46e6).toBeCloseTo(1, 2)
    expect(rows[0].NT).toBeCloseTo(7.8, 1)
    expect(tdgSurfaceRow(1e-3, 5000, 5, 0, 351).n).toBe(50)
    expect(tdgSurfaceRow(1e-3, 5000, 5, 0, 351).NT).toBeCloseTo(7.0, 1)
  })
  it('Eq. 96 reproduces the printed thresholds only with the text’s 1.9e7 T count', () => {
    const text = [7, 9, 17, 19].map((d) => tdgSurfaceTfim(d, 1.9e7))
    expect(text.map((p) => Number(p.toPrecision(3)))).toEqual([1.33e-5, 5.48e-5, 5.89e-4, 7.85e-4])
    expect(Number(tdgSurfaceTfim(17, 1.5542e7).toPrecision(3))).toBe(5.94e-4)
  })
})

describe('the family, the basis, the shift blocks', () => {
  it('family sizes and ratios', () => {
    expect([tdgFamily(1, 0), tdgFamily(1, 1), tdgFamily(2, 0), tdgFamily(2, 1), tdgFamily(3, 0)].map((f) => [f.n, f.k, Math.round(f.ratio * 100) / 100])).toEqual([
      [72, 12, 6],
      [144, 12, 12],
      [288, 12, 13.5],
      [432, 12, 16],
      [648, 12, 16.67],
    ])
  })
  it('the four basis operators (Eq. 31): weights, overlaps, 0-or-2 meeting with the Z checks, canonical pairing', () => {
    expect(tdgBasisFacts('gross')).toMatchObject({ weights: [12, 12, 12, 12], overlaps: [1, 1, 0, 0, 0, 0], meetsMin: 0, meetsMax: 2, rankAbove: 12 })
    expect(tdgBasisFacts('two-gross').weights).toEqual([20, 20, 20, 20])
    expect(tdgPairingRows('gross').join('')).toBe(Array.from({ length: 12 }, (_, i) => '0'.repeat(i) + '1' + '0'.repeat(11 - i)).join(''))
  })
  it('shift x: upper block = printed A_x, lower block = its transpose, differing in 16 places; 36 classes, order 6', () => {
    const b = tdgBlocks('gross', 1, 0, 'x')
    expect(b).toMatchObject({ offBlockOnes: 0, gapUpper: 0, gapLowerT: 0, gapLowerPrinted: 16, printedVsTranspose: 16 })
    expect(tdgBlocks('gross', 0, 1, 'y')).toMatchObject({ gapUpper: 0, gapLowerT: 0 })
    expect(tdgBlocks('two-gross', 1, 0, 'x')).toMatchObject({ gapUpper: 0, gapLowerT: 0 })
    const col0 = b.M.toRows().map((r) => r[0])
    expect(col0.flatMap((v, i) => (v ? [i + 1] : []))).toEqual([4, 6])
    expect(tdgShiftClasses('gross')).toMatchObject({ classes: 36, maxFactors: 2, orderX: 6 })
  })
})

describe('Eqs. 14-15: native measurements', () => {
  it('540 native measurements; 245 rotations as Eq. 15 is written, 510 with the pivot letter I allowed; 284 have I on the pivot', () => {
    for (const code of ['gross', 'two-gross'] as const) expect(tdgNativeSets(code)).toMatchObject({ native: 540, rotations: 245, rotationsAny: 510, pivotI: 284 })
  })
  it('nothing downstream depends on the transposed block: the printed reading A (+) A gives the same counts', () => {
    expect(tdgNativeSets('gross', 'as-printed')).toMatchObject({ native: 540, rotations: 245, rotationsAny: 510 })
  })
  it('beta = 1 + 6k', () => expect([0, 1, 2, 3, 4].map(tdgBeta)).toEqual([1, 7, 13, 19, 25]))
})

describe('App. A.3: the LPU graph census', () => {
  it('gross: G_l has 12 dots and 18 links (rank 7); the whole graph has 23 dots (24 check qubits), 47 links, rank 25, 19 kept cycles, u = 90', () => {
    expect(tdgLpuGraph('gross', 'l')).toMatchObject({ V: 12, E: 18, rank: 7 })
    expect(tdgLpuGraph('gross', 'r')).toMatchObject({ V: 12, E: 18 })
    expect(tdgLpuGraph('gross', 'full')).toMatchObject({ V: 23, Vq: 24, E: 47, rank: 25, kept: 19, u: 90, bridge: 11 })
  })
  it('two-gross: 20 dots and 30 + 2 links per half; whole graph 39 dots (40), 81 links, rank 43, 37 kept, u = 158', () => {
    expect(tdgLpuGraph('two-gross', 'l')).toMatchObject({ V: 20, E: 32 })
    expect(tdgLpuGraph('two-gross', 'full')).toMatchObject({ V: 39, Vq: 40, E: 81, rank: 43, kept: 37, u: 158 })
    expect(tdgLpuGraph('two-gross', 'l').edges.filter((e) => e.kind === 'extra')).toHaveLength(2)
  })
  it('every edge joins two distinct dots, no link repeats, and the bell dot is identified', () => {
    for (const code of ['gross', 'two-gross'] as const) {
      const g = tdgLpuGraph(code, 'full')
      expect(g.edges.every((e) => e.a !== e.b && e.a < g.V && e.b < g.V)).toBe(true)
      expect(new Set(g.edges.map((e) => `${Math.min(e.a, e.b)}-${Math.max(e.a, e.b)}`)).size).toBe(g.E)
      expect(g.vertices.filter((v) => v.half === 'bell')).toHaveLength(1)
    }
  })
  it('modes: 3 + 3 + 9 = 15, and which part measures which operator', () => {
    expect(tdgLpuModes()).toEqual({ left: 3, right: 3, full: 9, total: 15 })
    expect(['X1', 'Z7', 'X7', 'Z1', 'Y1', 'Y7'].map((o) => tdgLpuModeOf(o as 'X1'))).toEqual(['l', 'l', 'r', 'r', 'full', 'full'])
  })
})

describe('Eq. 5: distributing a long Pauli', () => {
  it('33 qubits on 3 modules with 2 ZZ links; 100 qubits on 10 modules with 9', () => {
    expect(tdgDistribute(33)).toEqual({ M: 3, zz: 2, local: 3 })
    expect(tdgDistribute(100)).toEqual({ M: 10, zz: 9, local: 10 })
  })
})
