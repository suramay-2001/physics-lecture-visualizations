/**
 * qc/variational.ts against numpy (pipeline/make_walk_fixtures.py → __fixtures__/qc-walk.json: enumerated cut tables, dense Kronecker mixers with scipy expm,
 * a CNOT-phase-CNOT circuit, a grid search, a pattern search), plus the cross-checks of P-Q19-story §9.1 (the circuit equals the dense exponentials; the ring's
 * closed form equals F at three points; H_C from σ^z equals the cut table) and properties.
 */
import { describe, expect, it } from 'vitest'
import raw from '../__fixtures__/qc-walk.json?raw'
import { circuitUnitary, runCircuit, validateCircuit } from './circuit'
import {
  costHamiltonianGap,
  cutDistribution,
  cutHistogram,
  cutOfIndex,
  cutValue,
  maxCut,
  meanCut,
  optimalGuessChance,
  qaoaChance,
  qaoaCircuit,
  qaoaCircuitGap,
  qaoaF,
  qaoaGridBest,
  qaoaPatternSearch,
  qaoaRingClosed,
  qaoaRingFormulaGap,
  qaoaState,
  ringEdges,
  shotsFor,
} from './variational'

const FX: any = JSON.parse(raw)
const ring4 = ringEdges(4)
const ring5 = ringEdges(5)
const kite = [[0, 1], [1, 2], [2, 3], [0, 2]] as const

describe('cuts', () => {
  it('the 4-cycle: 16 strings, cut 0 twice, cut 2 twelve times, cut 4 twice (0101, 1010); mean 2', () => {
    expect(ring4).toEqual([[0, 1], [1, 2], [2, 3], [3, 0]])
    expect(cutHistogram(4, ring4)).toEqual(FX.qaoa.hist4)
    expect(cutHistogram(4, ring4)).toEqual([2, 0, 12, 0, 2])
    expect(maxCut(4, ring4)).toEqual({ value: 4, strings: ['0101', '1010'] })
    expect(meanCut(4, ring4)).toBe(2)
    expect(optimalGuessChance(4, ring4)).toBe(0.125)
    expect(cutValue('0101', ring4)).toBe(4)
    expect(cutValue('0000', ring4)).toBe(0)
    expect(cutValue('0011', ring4)).toBe(2)
    expect(Array.from({ length: 16 }, (_, x) => cutOfIndex(x, 4, ring4))).toEqual(FX.qaoa.cutTable4)
    expect(() => ringEdges(2)).toThrow()
    expect(() => cutValue('01a', ring4)).toThrow()
  })
  it('H_C from σ^z (½(1 − z_j z_k) per edge) is the cut table', () => {
    expect(costHamiltonianGap(4, ring4)).toBe(0)
    expect(costHamiltonianGap(5, ring5)).toBe(0)
    expect(() => costHamiltonianGap(4, [[0, 4]])).toThrow()
  })
})

describe('the QAOA state', () => {
  it('F(γ, β) equals numpy on the 4-cycle, the 5-cycle and a 4-vertex graph', () => {
    for (const k of Object.keys(FX.qaoa.ring4)) {
      const [g, b] = k.split('_').map(Number)
      expect(Math.abs(qaoaF(4, ring4, g, b) - FX.qaoa.ring4[k]), `ring 4 ${k}`).toBeLessThan(1e-12)
    }
    for (const k of Object.keys(FX.qaoa.ring5)) {
      const [g, b] = k.split('_').map(Number)
      expect(Math.abs(qaoaF(5, ring5, g, b) - FX.qaoa.ring5[k]), `ring 5 ${k}`).toBeLessThan(1e-12)
      expect(Math.abs(qaoaF(4, kite, g, b) - FX.qaoa.kite[k]), `kite ${k}`).toBeLessThan(1e-12)
    }
  })
  it('the amplitudes at (0.7, 0.3) equal numpy, and the state is normalised', () => {
    const psi = qaoaState(4, ring4, 0.7, 0.3)
    expect(Math.max(...psi.map((z, i) => Math.hypot(z.re - FX.qaoa.amp4[i][0], z.im - FX.qaoa.amp4[i][1])))).toBeLessThan(1e-12)
    expect(Math.abs(psi.reduce((s, z) => s + z.re ** 2 + z.im ** 2, 0) - 1)).toBeLessThan(1e-14)
  })
  it('F = 2 at γ = 0 or β = 0 (nothing to interfere), and F = 2 + sin 4β sin 2γ on the ring', () => {
    expect(qaoaF(4, ring4, 0, 0.3)).toBeCloseTo(2, 12)
    expect(qaoaF(4, ring4, 0.7, 0)).toBeCloseTo(2, 12)
    expect(qaoaRingFormulaGap()).toBeLessThan(1e-12)
    expect(qaoaRingFormulaGap([[2.4, 1.1], [0.05, 0.9]])).toBeLessThan(1e-12)
    expect(qaoaRingClosed(Math.PI / 4, Math.PI / 8)).toBeCloseTo(3, 14)
  })
  it('the best angles on a 0.5° grid: F = 3 at γ = 45°, β = 22.5° (three quarters of the best cut); the chances there', () => {
    const best = qaoaGridBest(4, ring4)
    expect(best).toEqual(FX.qaoa.gridBest)
    expect(best.F).toBeCloseTo(3, 12)
    const d = cutDistribution(4, ring4, Math.PI / 4, Math.PI / 8)
    expect(d.length).toBe(5)
    expect(d.map((x, k) => Math.abs(x - FX.qaoa.bestByCut[k])).every((g) => g < 1e-12)).toBe(true)
    expect(d[4]).toBeCloseTo(17 / 32, 12)
    expect(d[2]).toBeCloseTo(14 / 32, 12)
    expect(d[0]).toBeCloseTo(1 / 32, 12)
    expect(qaoaChance(4, ring4, Math.PI / 4, Math.PI / 8, '0101')).toBeCloseTo(0.265625, 12)
    expect(qaoaChance(4, ring4, Math.PI / 4, Math.PI / 8, '1010')).toBeCloseTo(0.265625, 12)
    FX.qaoa.bestChances.forEach((p: number, x: number) => expect(Math.abs(qaoaChance(4, ring4, Math.PI / 4, Math.PI / 8, x.toString(2).padStart(4, '0')) - p)).toBeLessThan(1e-12))
  })
})

describe('the circuit', () => {
  it('is valid; its boxes are packed into two phase columns for the 4-cycle; it equals the dense exponentials and numpy', () => {
    const circ = qaoaCircuit(4, ring4, 0.7, 0.3)
    expect(validateCircuit(circ).ok).toBe(true)
    expect(circ.columns.map((col) => col.length)).toEqual([4, 2, 2, 4])
    expect(qaoaCircuitGap(4, ring4, 0.7, 0.3)).toBeLessThan(1e-13)
    expect(qaoaCircuitGap(5, ring5, 1.3, 0.4)).toBeLessThan(1e-13)
    expect(qaoaCircuitGap(4, kite, 0.2, 2.5)).toBeLessThan(1e-13)
    const run = runCircuit(circ)
    const psi = run.states[run.states.length - 1]
    expect(Math.max(...psi.map((z, i) => Math.hypot(z.re - FX.qaoa.amp4[i][0], z.im - FX.qaoa.amp4[i][1])))).toBeLessThan(1e-12)
    // after the phase step (3 columns) every string has chance 1/16 and the phase is −γ·cut
    const after = runCircuit({ ...circ, columns: circ.columns.slice(0, 3) }).states.slice(-1)[0]
    after.forEach((z, x) => {
      expect(Math.abs(z.re ** 2 + z.im ** 2 - 1 / 16)).toBeLessThan(1e-14)
      const ph = Math.atan2(z.im, z.re)
      const want = -0.7 * cutOfIndex(x, 4, ring4)
      expect(Math.abs(Math.cos(ph) - Math.cos(want))).toBeLessThan(1e-12)
    })
    expect(circuitUnitary(qaoaCircuit(3, ringEdges(3), 0.5, 0.2)).length).toBe(8)
  })
})

describe('the classical loop', () => {
  it('pattern search from (0.3, 0.2): 7 moves, 49 evaluations, F from 2.4050 to 2.9998 (equals numpy)', () => {
    const r = qaoaPatternSearch((g, b) => qaoaF(4, ring4, g, b), [0.3, 0.2], 0.2, 0.01)
    expect(r.moves).toBe(FX.qaoa.loop.moves)
    expect(r.evals).toBe(FX.qaoa.loop.evals)
    expect([r.moves, r.evals]).toEqual([7, 49])
    r.path.forEach((p, i) => {
      expect(Math.abs(p.gamma - FX.qaoa.loop.path[i][0])).toBeLessThan(1e-12)
      expect(Math.abs(p.beta - FX.qaoa.loop.path[i][1])).toBeLessThan(1e-12)
      expect(Math.abs(p.f - FX.qaoa.loop.path[i][2])).toBeLessThan(1e-12)
    })
    expect(r.path[0].f).toBeCloseTo(2.405, 3)
    expect(r.path[r.path.length - 1].f).toBeCloseTo(2.9998, 4)
    expect(((r.path[r.path.length - 1].gamma * 180) / Math.PI)).toBeCloseTo(45.1, 1)
    expect(((r.path[r.path.length - 1].beta * 180) / Math.PI)).toBeCloseTo(22.2, 1)
  })
  it('neighbour order +γ, −γ, +β, −β with the first best winning ties; refuses a bad step', () => {
    const calls: [number, number][] = []
    const r = qaoaPatternSearch((g, b) => (calls.push([g, b]), 1), [0, 0], 1, 0.9)
    expect(r.moves).toBe(0)
    expect(calls.slice(1, 5)).toEqual([[1, 0], [-1, 0], [0, 1], [0, -1]])
    expect(() => qaoaPatternSearch(() => 0, [0, 0], 0, 0.1)).toThrow()
  })
  it('shots to see an optimal cut with confidence 0.9: 4 at chance 17/32, 18 at 1/8', () => {
    expect(shotsFor(17 / 32, 0.9)).toBe(FX.qaoa.shots.p17_32)
    expect(shotsFor(1 / 8, 0.9)).toBe(FX.qaoa.shots.p1_8)
    expect(shotsFor(0.5, 0.9)).toBe(FX.qaoa.shots.p1_2)
    expect([shotsFor(17 / 32, 0.9), shotsFor(1 / 8, 0.9)]).toEqual([4, 18])
    expect(shotsFor(1, 0.9)).toBe(1)
    expect(() => shotsFor(0, 0.9)).toThrow()
  })
})
