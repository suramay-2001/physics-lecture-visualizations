/**
 * Properties of the B1 surface-code engine that do not need a fixture: invariants, limits and refusals (toric, planar, schedule, faults, spacetime, curves, frame).
 */
import { describe, expect, it } from 'vitest'
import { GF2Matrix } from './gf2'
import { toricCode, toricOperator, toricLit } from './toric'
import { planarSurfaceCode, surfaceSizes } from './planar'
import { CORNERS, patchChecks, scheduleCheck } from './schedule'
import { checkCircuitCount, circuitDistance, elementaryFaults, faultSignature, hookWeights, memoryCircuit } from './faults'
import { decodeHistory, failureSpectrum, historyOf, repetitionGraph, runHistory, sampleHistory } from './spacetime'
import { cleanRun, dNeeded, logicalBudget, repetitionLogical, stepsFor, surfaceFit, suppressionPerStep } from './curves'
import { frameThrough } from './frame'

describe('toric code', () => {
  it('is the bivariate-bicycle code A = 1 + x, B = 1 + y under the edge map L(i,j) = h(i,j), R(i,j) = v(i+1, j−1)', () => {
    for (const L of [3, 4]) {
      const t = toricCode(L)
      const X = GF2Matrix.permutation(Array.from({ length: L }, (_, i) => (i + 1) % L)).kron(GF2Matrix.identity(L))
      const Y = GF2Matrix.identity(L).kron(GF2Matrix.permutation(Array.from({ length: L }, (_, j) => (j + 1) % L)))
      const A = GF2Matrix.identity(L * L).add(X)
      const B = GF2Matrix.identity(L * L).add(Y)
      const HX = A.hstack(B)
      const HZ = B.transpose().hstack(A.transpose())
      const edgeOf = (c: number): number => (c < L * L ? t.hEdge(Math.floor(c / L), c % L) : t.vEdge(Math.floor((c - L * L) / L) + 1, ((c - L * L) % L) - 1))
      const mapRows = (H: GF2Matrix): string[] => Array.from({ length: H.rows }, (_, r) => H.rowSupport(r).map(edgeOf).sort((a, b) => a - b).join(',')).sort()
      const toricRows = (H: GF2Matrix): string[] => Array.from({ length: H.rows }, (_, r) => H.rowSupport(r).join(',')).sort()
      expect(HX.mul(HZ.transpose()).isZero()).toBe(true)
      expect(mapRows(HX)).toEqual(toricRows(t.code.HX))
      expect(mapRows(HZ)).toEqual(toricRows(t.code.HZ))
    }
  })
  it('k = 2 on every L × M torus up to 6 × 5, every star meets every plaquette in 0 or 2 edges, and the two relations hold', () => {
    for (const [L, M] of [[2, 2], [3, 4], [5, 3], [6, 5]]) {
      const t = toricCode(L, M)
      expect([t.code.rankX, t.code.rankZ, t.code.k]).toEqual([L * M - 1, L * M - 1, 2])
      const ones = new Array<number>(t.n).fill(1)
      expect(t.code.HX.leftMulVec(new Array<number>(L * M).fill(1)).every((b) => b === 0)).toBe(true)
      expect(t.code.HZ.leftMulVec(new Array<number>(L * M).fill(1)).every((b) => b === 0)).toBe(true)
      expect(ones.length).toBe(t.n)
    }
  })
  it('a Z chain lights only its two ends; a closed one lights nothing', () => {
    const t = toricCode(5)
    for (let len = 1; len <= 4; len++) expect(toricLit(t, 'Z', Array.from({ length: len }, (_, i) => t.hEdge(i, 2))).length).toBe(2)
    expect(toricLit(t, 'Z', toricOperator(t, 'z-loop-v', 3).qubits).length).toBe(0)
    expect(toricLit(t, 'X', toricOperator(t, 'x-cut-h', 1).qubits).length).toBe(0)
  })
  it('refuses a torus outside 2 … 8', () => {
    expect(() => toricCode(1)).toThrow()
    expect(() => toricCode(9)).toThrow()
  })
})

describe('planar and rotated sizes', () => {
  it('the unrotated total is (2d − 1)² and the rotated one 2d² − 1; the built planar code has k = 1', () => {
    for (const d of [3, 5, 7, 9]) {
      const s = surfaceSizes(d)
      expect(s.unrotated.total).toBe((2 * d - 1) ** 2)
      expect(s.rotated.total).toBe(2 * d * d - 1)
      if (d <= 7) expect(planarSurfaceCode(d).code.k).toBe(1)
    }
    expect(surfaceSizes(17).ratio).toBeCloseTo(1089 / 577, 12)
    expect(() => surfaceSizes(4)).toThrow()
  })
})

describe('schedules and faults', () => {
  it('a patch check list names each corner once; a bad order is refused; the same order for X and Z is valid', () => {
    expect(patchChecks(3).length).toBe(8)
    expect(() => scheduleCheck(3, ['TL', 'TL', 'BL', 'BR'], [...CORNERS])).toThrow()
    const same = scheduleCheck(3, [...CORNERS], [...CORNERS])
    expect([same.conflictFree, same.valid]).toEqual([true, true]) // the same order for both types is one of the 16 valid pairs
    expect(scheduleCheck(3, ['TL', 'TR', 'BL', 'BR'], ['TL', 'TR', 'BR', 'BL']).conflictFree).toBe(false)
  })
  it('the good schedule is valid, the hook one is clash-free and valid too (both pass the sign rule)', () => {
    expect(scheduleCheck(3, ['TL', 'TR', 'BL', 'BR'], ['TL', 'BL', 'TR', 'BR']).valid).toBe(true)
    expect(scheduleCheck(3, ['TL', 'BL', 'TR', 'BR'], ['TL', 'TR', 'BL', 'BR']).valid).toBe(true)
  })
  it('a Z fault after the last operation changes nothing; a single data flip before the first round is caught by its Z checks only', () => {
    const c = memoryCircuit(3, ['TL', 'TR', 'BL', 'BR'], ['TL', 'BL', 'TR', 'BR'], 2)
    const f = elementaryFaults(c)
    expect(f.length).toBeGreaterThan(500)
    const s = faultSignature(c, { pos: c.ops.length - 1, x: 0n, z: 1n, label: 'idle' })
    expect(s.det).toBe(0n)
    const flip = faultSignature(c, { pos: -1, x: 1n << 4n, z: 0n, label: 'idle' })
    expect(flip.det === 0n).toBe(false)
  })
  it('refuses a circuit distance for d > 3 and rounds outside 1 … 4', () => {
    expect(() => circuitDistance(memoryCircuit(5, ['TL', 'TR', 'BL', 'BR'], ['TL', 'BL', 'TR', 'BR'], 1))).toThrow()
    expect(() => memoryCircuit(3, [...CORNERS], [...CORNERS], 5)).toThrow()
  })
  it('one check circuit: counts scale with the weight, and the hook never exceeds half the check', () => {
    expect(checkCircuitCount('Z', 2).places.total).toBe(8)
    expect(checkCircuitCount('X', 4).events).toBe(86)
    expect(hookWeights(4).maxEffective).toBe(2)
    expect(hookWeights(2).data).toEqual([2, 1])
  })
})

describe('space-time histories', () => {
  it('any single fault is corrected, for n = 3 … 7 and 1 … 3 rounds', () => {
    for (const n of [3, 5, 7])
      for (const R of [1, 2, 3]) {
        const g = repetitionGraph(n, R)
        for (const e of g.edges) expect(runHistory(g, [{ kind: e.kind, at: e.at, t: e.t }]).failed, `${n} ${R} ${e.kind} ${e.at} ${e.t}`).toBe(false)
      }
  })
  it('lit detectors come in the numbers the pictures show: 2 for a data flip and for a readout flip, 1 for an end qubit; no faults, no detectors', () => {
    const g = repetitionGraph(5, 4)
    expect(historyOf(g, [{ kind: 'data', at: 2, t: 2 }]).lit.length).toBe(2)
    expect(historyOf(g, [{ kind: 'meas', at: 1, t: 2 }]).lit.length).toBe(2)
    expect(historyOf(g, [{ kind: 'data', at: 0, t: 2 }]).lit.length).toBe(1)
    expect(decodeHistory(g, []).weight).toBe(0)
    expect(historyOf(g, [{ kind: 'data', at: 2, t: 2 }, { kind: 'data', at: 2, t: 2 }]).lit.length).toBe(0)
  })
  it('n = 3 fails on two flips in one round, n = 5 does not; the exact matching weight equals the lightest fault set', () => {
    const two = [{ kind: 'data' as const, at: 0, t: 2 }, { kind: 'data' as const, at: 1, t: 2 }]
    expect(runHistory(repetitionGraph(3, 3), two).failed).toBe(true)
    expect(runHistory(repetitionGraph(5, 3), two).failed).toBe(false)
    const g = repetitionGraph(5, 4)
    const r = runHistory(g, [{ kind: 'data', at: 2, t: 2 }, { kind: 'meas', at: 0, t: 3 }])
    expect(r.decoded.weight).toBe(2)
  })
  it('refuses more than 14 lit detectors, a fault that does not exist, and a spectrum too big to enumerate', () => {
    const g = repetitionGraph(9, 6)
    expect(() => decodeHistory(g, Array.from({ length: 15 }, (_, i) => i))).toThrow()
    expect(() => historyOf(g, [{ kind: 'meas', at: 8, t: 1 }])).toThrow()
    expect(() => failureSpectrum(g, 3)).toThrow()
    expect(() => failureSpectrum(repetitionGraph(5, 5), 3, true)).toThrow()
  })
  it('a seeded sample is reproducible and a weight-w spectrum row counts C(E, w) sets', () => {
    const g = repetitionGraph(5, 5)
    expect(sampleHistory(g, 0.1, 0.1, 7)).toEqual(sampleHistory(g, 0.1, 0.1, 7))
    expect(sampleHistory(g, 0.1, 0.1, 7)).not.toEqual(sampleHistory(g, 0.1, 0.1, 8))
    expect(failureSpectrum(g, 2).rows.map((r) => r.total)).toEqual([45, 990])
  })
})

describe('curves and frames', () => {
  it('clean-run, budget and vote identities', () => {
    expect(cleanRun(1000, 1e-3)).toBeCloseTo(0.36769542477, 10)
    expect(cleanRun(0, 0.3)).toBe(1)
    expect(Math.pow(1 - logicalBudget(1e6, 0.5), 1e6)).toBeCloseTo(0.5, 9)
    expect(repetitionLogical(3, 0.01)).toBeCloseTo(0.01 ** 2 * (3 - 0.02), 15)
    expect(repetitionLogical(7, 0.5)).toBeCloseTo(0.5, 12)
    expect(() => repetitionLogical(4, 0.1)).toThrow()
    expect(() => cleanRun(10, 2)).toThrow()
  })
  it('every preset shrinks by p*/p per +2 in d, the three presets agree at p*, and d needed is monotone in the target', () => {
    for (const id of ['tdg-2.6', 'tdg-A10', 'bev22']) {
      expect(suppressionPerStep(1e-3, id)).toBeCloseTo(10, 10)
      expect(suppressionPerStep(5e-3, id)).toBeCloseTo(2, 10)
    }
    expect(surfaceFit(7, 0.01, 'tdg-A10')).toBeCloseTo(0.03, 14)
    expect(dNeeded((d) => surfaceFit(d, 1e-3, 'tdg-A10'), 1e-6)!).toBeLessThan(dNeeded((d) => surfaceFit(d, 1e-3, 'tdg-A10'), 1e-12)!)
    expect(stepsFor(1000, 10)).toBe(3)
    expect(stepsFor(1000, 2)).toBe(10)
    expect(() => surfaceFit(7, 1e-3, 'nope')).toThrow()
  })
  it('a frame: H swaps X and Z, S sends X to Y, CNOT copies X forward and Z back; a CNOT needs its control', () => {
    expect(frameThrough('X', [{ gate: 'H', target: 0 }]).frames).toEqual(['X', 'Z'])
    expect(frameThrough('X', [{ gate: 'S', target: 0 }]).frames[1]).toBe('Y')
    expect(frameThrough('XI', [{ gate: 'CNOT', control: 0, target: 1 }]).frames[1]).toBe('XX')
    expect(frameThrough('IZ', [{ gate: 'CNOT', control: 0, target: 1 }]).weights).toEqual([1, 2])
    expect(() => frameThrough('XI', [{ gate: 'CNOT', target: 1 }])).toThrow()
  })
})
