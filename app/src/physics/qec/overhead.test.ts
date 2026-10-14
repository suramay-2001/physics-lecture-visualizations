/**
 * qec/overhead.ts: every formula is checked against the engine object it describes (the surface-code layout of codes.ts, the BB code of bb.ts, the logical
 * shift classes) and against the numbers the paper prints in Table 1 and the text of §2.2 and §2.4. The reported-only numbers (u, f, a′) are checked only for
 * being carried verbatim, with their location.
 */
import { describe, expect, it } from 'vitest'
import { GROSS_SPEC, TWO_GROSS_SPEC, REPORTED, bbCode, logicalXAction, makeLogicalSolver, paperLogicalBasis } from './bb'
import { rotatedSurfaceCode } from './codes'
import {
  REPORTED_TABLE_1,
  adapterQubits,
  bbModuleQubits,
  codeFactoryAdapterQubits,
  cycleBasisSize,
  dataPerLogical,
  instructionCounts,
  modulePerLogical,
  surfaceCheckQubits,
  surfaceDataQubits,
  surfaceQubitsForLogical,
  surfaceQubitsPerLogical,
  surfaceToModuleRatio,
} from './overhead'

describe('overhead: the surface code', () => {
  it('data, check and total qubits agree with the layout the engine builds, for d = 3 … 9', () => {
    for (const d of [3, 5, 7, 9]) {
      const S = rotatedSurfaceCode(d)
      expect(surfaceDataQubits(d)).toBe(S.data.length)
      expect(surfaceCheckQubits(d)).toBe(S.checks.length)
      expect(surfaceQubitsPerLogical(d)).toBe(S.data.length + S.checks.length)
      expect(surfaceQubitsPerLogical(d)).toBe(2 * d * d - 1)
      expect(S.code.k).toBe(1) // so "per logical qubit" is the whole patch
    }
    expect(surfaceQubitsPerLogical(3)).toBe(17)
    expect(surfaceQubitsPerLogical(11)).toBe(241)
  })

  it('L patches cost L times one patch; zero logical qubits cost nothing; bad input is refused', () => {
    expect(surfaceQubitsForLogical(12, 11)).toBe(12 * 241)
    expect(surfaceQubitsForLogical(0, 5)).toBe(0)
    expect(() => surfaceQubitsPerLogical(4)).toThrow()
    expect(() => surfaceQubitsForLogical(-1, 5)).toThrow()
    expect(() => surfaceDataQubits(0)).toThrow()
  })
})

describe('overhead: bivariate bicycle modules (paper-tdg p. 10, Table 1)', () => {
  it('c = 4ℓm: 288 qubits for the gross code and 576 for the two-gross code, split 2ℓm data and 2ℓm checks, matching the engine matrices', () => {
    for (const [spec, c] of [[GROSS_SPEC, 288], [TWO_GROSS_SPEC, 576]] as const) {
      const code = bbCode(spec)
      const mod = bbModuleQubits(spec.l, spec.m)
      expect(mod.total).toBe(c)
      expect(mod.data).toBe(code.n)
      expect(mod.checks).toBe(code.HX.rows + code.HZ.rows)
      expect(mod.data + mod.checks).toBe(mod.total)
    }
    expect(bbModuleQubits(12, 6).total).toBe(REPORTED_TABLE_1.gross.c)
    expect(bbModuleQubits(12, 12).total).toBe(REPORTED_TABLE_1['two-gross'].c)
    expect(() => bbModuleQubits(0, 6)).toThrow()
  })

  it('per logical qubit: n/k = 12 (gross) and 24 (two-gross) data qubits, c/k = 24 and 48 with the check qubits', () => {
    expect(dataPerLogical(144, 12)).toBe(12)
    expect(dataPerLogical(288, 12)).toBe(24)
    expect(modulePerLogical(288, 12)).toBe(24)
    expect(modulePerLogical(576, 12)).toBe(48)
    expect(() => dataPerLogical(144, 0)).toThrow()
  })

  it('the ratio to separate surface patches is plain arithmetic: 12 patches at d = 11 against the 288-qubit gross module is 12·241/288 ≈ 10.04', () => {
    expect(surfaceToModuleRatio(12, 288, 11)).toBeCloseTo((12 * 241) / 288, 12)
    expect(surfaceToModuleRatio(12, 288, 11)).toBeCloseTo(10.04, 2)
    expect(surfaceToModuleRatio(12, 576, 17)).toBeCloseTo((12 * (2 * 289 - 1)) / 576, 12)
    // a bigger surface-code distance costs more: monotone in d
    expect(surfaceToModuleRatio(12, 288, 13)).toBeGreaterThan(surfaceToModuleRatio(12, 288, 11))
  })

  it('the adapter sizes: a = 2(d − 1) gives the printed 22 and 34 for the reported distances 12 and 18; a′ = 2d_f − 1 is consistent with Table 1 (distances 15, 7, 25)', () => {
    expect(adapterQubits(REPORTED.gross.d)).toBe(REPORTED_TABLE_1.gross.a)
    expect(adapterQubits(REPORTED['two-gross'].d)).toBe(REPORTED_TABLE_1['two-gross'].a)
    expect(codeFactoryAdapterQubits(15)).toBe(REPORTED_TABLE_1.gross.aPrime['p=1e-3'])
    expect(codeFactoryAdapterQubits(7)).toBe(REPORTED_TABLE_1.gross.aPrime['p=1e-4'])
    expect(codeFactoryAdapterQubits(15)).toBe(REPORTED_TABLE_1['two-gross'].aPrime['p=1e-3'])
    expect(codeFactoryAdapterQubits(25)).toBe(REPORTED_TABLE_1['two-gross'].aPrime['p=1e-4'])
    expect(() => adapterQubits(1)).toThrow()
  })

  it('cycle count of a connected graph: 18 edges on 12 vertices leave 7 independent cycles (the gross LPU’s left half, p. 48)', () => {
    expect(cycleBasisSize(12, 18)).toBe(7)
    expect(cycleBasisSize(5, 4)).toBe(0) // a tree
    expect(() => cycleBasisSize(5, 3)).toThrow()
  })

  it('Table 1 is carried verbatim with its location; u, f and a′ are reported, not derived', () => {
    expect(REPORTED_TABLE_1.gross).toMatchObject({ c: 288, u: 90, a: 22 })
    expect(REPORTED_TABLE_1['two-gross']).toMatchObject({ c: 576, u: 158, a: 34 })
    expect(REPORTED_TABLE_1.gross.f).toEqual({ 'p=1e-3': 454, 'p=1e-4': 810 })
    expect(REPORTED_TABLE_1['two-gross'].f['p=1e-4']).toBe(18600)
    expect(REPORTED_TABLE_1.where).toMatch(/Table 1, p\. 6/)
  })
})

describe('overhead: instruction counts (paper-tdg p. 5-6)', () => {
  it('12 shifts, 15 in-module measurements, 36 inter-module measurements, 6 T injections, 36 logical shift classes, for both codes', () => {
    for (const [l, m] of [[12, 6], [12, 12]] as const) {
      const c = instructionCounts(l, m)
      expect(c).toEqual({ shifts: 12, inModule: 15, interModule: 36, tInjection: 6, shiftClasses: 36 })
    }
  })

  it('the shift-class count agrees with the engine: the logical actions of all ℓm shifts of the paper’s basis fall into exactly that many classes', () => {
    for (const [which, spec] of [['gross', GROSS_SPEC], ['two-gross', TWO_GROSS_SPEC]] as const) {
      const code = bbCode(spec)
      const B = paperLogicalBasis(code, which)
      const solver = makeLogicalSolver(code, B.X)
      const classes = new Set<string>()
      for (let a = 0; a < spec.l; a++) for (let b = 0; b < spec.m; b++) classes.add(logicalXAction(code, B.X, code.shiftPermutation(a, b), solver)!.toText())
      expect(classes.size).toBe(instructionCounts(spec.l, spec.m).shiftClasses)
    }
  })

  it('the count follows the torus: on a 6 × 6 torus only x⁶ = y⁶ = 1 already, so no shift is trivial and there are 36 classes from 36 shifts', () => {
    expect(instructionCounts(6, 6).shiftClasses).toBe(36)
    expect(instructionCounts(12, 12).shiftClasses).toBe(36)
    expect(instructionCounts(24, 6).shiftClasses).toBe((24 * 6) / 4)
  })
})
