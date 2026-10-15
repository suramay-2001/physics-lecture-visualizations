/**
 * physics/qec/tdg.ts against its independent route (pipeline/tdg_numpy.py → pipeline/make_tdg_fixtures.py → __fixtures__/qec-tdg.json): the machine arithmetic, the yield, the cultivation
 * time, Eq. 82 by 50-digit Decimal sums, Eq. 26, the thresholds, Eqs. 89 and 96, the code family, the basis facts, the shift blocks and classes, the native sets and the LPU census.
 */
import { describe, expect, it, vi } from 'vitest'
import raw from '../__fixtures__/qec-tdg.json?raw'
import {
  TDG_FIG10A_BICYCLE,
  TDG_FIG10A_SURFACE,
  tdgBasisFacts,
  tdgBlocks,
  tdgCrossing,
  tdgCultivationTime,
  tdgFamily,
  tdgLpuGraph,
  tdgMaxModules,
  tdgNativeSets,
  tdgPiid,
  tdgQubits,
  tdgShiftClasses,
  tdgSurfaceRow,
  tdgSurfaceTfim,
  tdgTfim,
  tdgTfimRotations,
  tdgYield,
  type TdgCode,
  type TdgFactory,
  type TdgSeries,
} from './tdg'

vi.setConfig({ testTimeout: 120_000 })
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const FX: any = JSON.parse(raw)
const rel = (a: number, b: number, tol = 1e-12): void => expect(Math.abs(a - b) / Math.max(Math.abs(b), 1e-300)).toBeLessThan(tol)

describe('tdg ↔ numpy', () => {
  it('Eq. 25: parts and q', () => {
    for (const r of FX.machine) {
      const t = tdgQubits(r.code as TdgCode, r.M, r.factory as TdgFactory)
      expect([t.c, t.u, t.a, t.aPrime, t.f, t.d, t.dFactory, t.q, t.n]).toEqual([r.c, r.u, r.a, r.aPrime, r.f, r.d, r.dFactory, r.q, r.n])
    }
    expect(tdgQubits('gross', 10, '1e-4', 29).q).toBe(FX.qA29)
    expect(TDG_FIG10A_BICYCLE.map(([c, f, b]) => tdgMaxModules(c, b, f))).toEqual(FX.maxModules)
  })
  it('yield, cultivation', () => {
    for (const [n, v] of Object.entries<{ J: number; yld: number; oneIn: number }>(FX.yield)) {
      const y = tdgYield(Number(n))
      expect(y.junctions).toBe(v.J)
      rel(y.yieldProb, v.yld)
      rel(y.oneIn, v.oneIn)
    }
    for (const d of [3, 5] as const) {
      const c = tdgCultivationTime(d)
      const [esc, fromPrinted, exact] = FX.cultivation[String(d)]
      rel(c.escape, esc)
      rel(c.fromPrinted, fromPrinted)
      rel(c.exact, exact)
    }
  })
  it('Eq. 82 at p = 1e-3 and 1e-4 for every series (Decimal sum)', () => {
    for (const [s, p, v] of FX.piid) rel(tdgPiid(s as TdgSeries, p), v, 1e-11)
  })
  it('Eq. 26, thresholds, rotations, Eqs. 89 and 96', () => {
    for (const [c, p, v] of FX.tfim) rel(tdgTfim(c as TdgCode, p).failure, v, 1e-10)
    for (const c of ['gross', 'two-gross'] as const) {
      const [exp, cross] = FX.crossing[c]
      rel(tdgCrossing(c).exponent, exp, 1e-9)
      rel(tdgCrossing(c).crossing, cross, 1e-9)
    }
    expect(tdgTfimRotations()).toBe(FX.rotations)
    for (const [d, nt, v] of FX.eq96) rel(tdgSurfaceTfim(d, nt), v, 1e-12)
    TDG_FIG10A_SURFACE.forEach(([p, q, d, f, t], i) => {
      const r = tdgSurfaceRow(p, q, d, f, t)
      expect([r.n, r.time]).toEqual([FX.surface[i][0], FX.surface[i][2]])
      rel(r.NT, FX.surface[i][1])
    })
  })
  it('the family', () => {
    ;[[1, 0], [1, 1], [2, 0], [2, 1], [3, 0]].forEach(([r, b], i) => {
      const f = tdgFamily(r, b)
      expect([f.n, f.k, f.d]).toEqual(FX.family[i].slice(0, 3))
      rel(f.ratio, FX.family[i][3])
    })
  })
  it('basis facts, shift blocks, classes, native sets, LPU census (both codes)', () => {
    for (const c of ['gross', 'two-gross'] as const) {
      const b = tdgBasisFacts(c)
      const x = FX.basis[c]
      expect([b.weights, b.overlaps, b.meetsMin, b.meetsMax, b.rankAbove]).toEqual([x.weights, x.overlaps, x.meetsMin, x.meetsMax, x.rankAbove])
      const bl = tdgBlocks(c, 1, 0, 'x')
      expect([bl.offBlockOnes, bl.gapUpper, bl.gapLowerT, bl.gapLowerPrinted, bl.printedVsTranspose]).toEqual([FX.blocks[c].offBlock, FX.blocks[c].gapUpper, FX.blocks[c].gapLowerT, FX.blocks[c].gapLowerPrinted, FX.blocks[c].printedAsym])
      const by = tdgBlocks(c, 0, 1, 'y')
      expect([by.gapUpper, by.gapLowerT]).toEqual([FX.blocksY[c].gapUpper, FX.blocksY[c].gapLowerT])
      const sc = tdgShiftClasses(c)
      expect([sc.classes, sc.orderX, sc.maxFactors, sc.trivial]).toEqual([FX.shifts[c].classes, FX.shifts[c].order, FX.shifts[c].maxFactors, FX.shifts[c].trivial])
      for (const reading of ['actual', 'as-printed'] as const) {
        const n = tdgNativeSets(c, reading)
        const y = FX.native[c][reading]
        expect([n.native, n.rotations, n.rotationsAny, n.pivotI, n.pivotLetter]).toEqual([y.native, y.rot, y.rotAll, y.pivotI, y.pivotLetter])
      }
      const f = tdgLpuGraph(c, 'full')
      const l = tdgLpuGraph(c, 'l')
      const L = FX.lpu[c]
      expect([l.V, l.E, l.rank, f.V, f.Vq, f.E, f.rank, f.kept, f.u, f.bridge]).toEqual([L.lV, L.lE, L.lRank, L.V, L.Vq, L.E, L.rank, L.kept, L.u, L.bridge])
    }
  })
})
