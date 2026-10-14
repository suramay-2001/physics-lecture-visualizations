/**
 * The surface-code engine of the background chapter B1 (toric, planar, schedule, faults, spacetime, curves, frame) against its independent numpy routes
 * (pipeline/surface_numpy.py → pipeline/make_surface_fixtures.py → __fixtures__/qec-surface.json). Kitaev's torus, the rotated patch's faces, the planar
 * hypergraph product, the schedule rule (also checked by a Gottesman tableau in Python), every fault signature and the space-time failure counts are
 * reached there by routes that share no code with the engine.
 */
import { describe, expect, it, vi } from 'vitest'
import raw from '../__fixtures__/qec-surface.json?raw'
import { cssDistance, rotatedSurfaceCode } from './codes'
import { toricCode, toricInStabilizer, toricLit, toricMaxOverlap, toricOperator } from './toric'
import { planarSurfaceCode, surfaceSizes } from './planar'
import { scheduleCheck, scheduleCount, type Corner } from './schedule'
import { circuitDistance, memoryCircuit } from './faults'
import { failureSpectrum, repetitionGraph } from './spacetime'
import { cleanRun, dNeeded, logicalBudget, repetitionLogical, surfaceFit } from './curves'
import { frameThrough } from './frame'

vi.setConfig({ testTimeout: 60_000 })
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const FX: any = JSON.parse(raw)

const key = (rows: number[][]): string[] => rows.map((r) => r.join(',')).sort()
const supOf = (M: { rows: number; rowSupport(i: number): number[] }): number[][] => Array.from({ length: M.rows }, (_, i) => M.rowSupport(i))

describe('fixtures: the toric code', () => {
  it('check supports, ranks, k, overlaps and the exact distance agree (L = 3 … 6)', () => {
    for (const e of FX.toric.codes) {
      const t = toricCode(e.L)
      expect(t.n).toBe(e.n)
      expect(key(supOf(t.code.HX))).toEqual(key(e.hx))
      expect(key(supOf(t.code.HZ))).toEqual(key(e.hz))
      expect([t.code.rankX, t.code.rankZ, t.code.k]).toEqual([e.rankX, e.rankZ, e.k])
      if (e.L <= 4) expect(cssDistance(t.code, { maxWeight: e.L }).lower).toBe(e.d)
    }
    expect(toricMaxOverlap(toricCode(3))).toBe(Math.max(...FX.toric.codes[0].overlaps))
  })
  it('loops, cuts and chains behave as the twin says (L = 4)', () => {
    const t = toricCode(4)
    const o = FX.toric.operators
    const loop = toricOperator(t, 'z-loop-h', 0)
    expect(toricLit(t, 'Z', loop.qubits).length).toBe(o.loopLit)
    expect(toricInStabilizer(t, 'Z', loop.qubits)).toBe(o.loopStabilizer)
    const loop2 = toricOperator(t, 'z-loop-h', 2)
    expect(toricInStabilizer(t, 'Z', [...loop.qubits, ...loop2.qubits])).toBe(o.loopsSameClass)
    expect(toricInStabilizer(t, 'Z', toricOperator(t, 'plaquette', 1).qubits)).toBe(o.plaquetteStabilizer)
    const cut = toricOperator(t, 'x-cut-v', 1)
    expect(toricLit(t, 'X', cut.qubits).length).toBe(o.cutLit)
    expect(cut.qubits.filter((q) => loop.qubits.includes(q)).length).toBe(o.loopCutOverlap)
    expect(toricLit(t, 'Z', [t.hEdge(0, 0), t.hEdge(1, 0), t.hEdge(2, 0)]).length).toBe(o.chainLit)
  })
})

describe('fixtures: rotated and planar surface patches', () => {
  it('rotated patches d = 3 … 9: counts, k, the check supports, the qubits that light one or two checks, the exact distance', () => {
    for (const e of FX.surface.rotated) {
      const r = rotatedSurfaceCode(e.d)
      expect(r.code.n).toBe(e.data)
      expect(r.checks.length).toBe(e.checks)
      expect(r.checks.filter((c) => c.qubits.length === 4).length).toBe(e.w4)
      expect(r.checks.filter((c) => c.qubits.length === 2).length).toBe(e.w2)
      expect(r.code.k).toBe(e.k)
      expect(key(supOf(r.code.HX))).toEqual(key(e.hx))
      expect(key(supOf(r.code.HZ))).toEqual(key(e.hz))
      const lit = Array.from({ length: e.data }, (_, q) => r.code.HZ.colWeight(q))
      expect([lit.filter((x) => x === 1).length, lit.filter((x) => x === 2).length]).toEqual([e.litOne, e.litTwo])
      expect(r.code.degrees()).toEqual({ checkWeight: e.degrees[0], qubitDegree: e.degrees[1] })
      if (e.d_exact) expect(cssDistance(r.code, { maxWeight: e.d }).lower).toBe(e.d_exact)
      const s = surfaceSizes(e.d).rotated
      expect([s.data, s.checks, s.total]).toEqual([e.data, e.checks, e.data + e.checks])
    }
  })
  it('unrotated planar patches d = 3, 5, 7: data, checks, k, the check supports, the exact distance; the formulas agree', () => {
    for (const e of FX.surface.planar) {
      const p = planarSurfaceCode(e.d)
      expect(p.n).toBe(e.data)
      expect(p.code.HX.rows + p.code.HZ.rows).toBe(e.checks)
      expect(p.code.k).toBe(e.k)
      expect(key(supOf(p.code.HX))).toEqual(key(e.hx))
      expect(key(supOf(p.code.HZ))).toEqual(key(e.hz))
      if (e.d_exact) expect(cssDistance(p.code, { maxWeight: e.d }).lower).toBe(e.d_exact)
      const u = surfaceSizes(e.d).unrotated
      expect([u.data, u.checks]).toEqual([e.data, e.checks])
    }
  })
})

const orderOf = (x: string[]) => x as Corner[]

describe('fixtures: check schedules and the circuit distance', () => {
  it('576 ordered pairs, 96 clash-free, 16 valid (and the Python tableau agrees on all 96); the flagged example has 8 bad pairs', () => {
    const f = FX.schedule
    expect(scheduleCount(3)).toEqual({ total: f.total, conflictFree: f.conflictFree, valid: f.valid })
    expect(f.tableauAgree).toBe(f.tableauChecked)
    const r = scheduleCheck(3, orderOf(f.example.xOrder), orderOf(f.example.zOrder))
    expect([r.conflictFree, r.valid, r.violations.length]).toEqual([f.example.conflictFree, f.example.valid, f.example.badPairs])
  })
  it('d_circ of the good and the hook schedule, with the number of fault events and distinct signatures', () => {
    const good = circuitDistance(memoryCircuit(3, orderOf(['TL', 'TR', 'BL', 'BR']), orderOf(['TL', 'BL', 'TR', 'BR']), 3))
    const bad = circuitDistance(memoryCircuit(3, orderOf(['TL', 'BL', 'TR', 'BR']), orderOf(['TL', 'TR', 'BL', 'BR']), 3))
    const bad2 = circuitDistance(memoryCircuit(3, orderOf(['TL', 'BL', 'TR', 'BR']), orderOf(['TL', 'TR', 'BL', 'BR']), 2))
    expect(good).toEqual(FX.circuit.good)
    expect(bad).toEqual(FX.circuit.bad)
    expect(bad2).toEqual(FX.circuit.badTwoRounds)
  })
})

describe('fixtures: space-time failure counts', () => {
  it('every graph: the same detector graph and the same failures and ties by weight', () => {
    for (const e of FX.rep.graphs) {
      const g = repetitionGraph(e.n, e.R)
      expect(g.edges.length).toBe(e.edges)
      expect(g.detectors.length).toBe(e.detectors)
      const maxW = Math.max(...Object.keys(e.byWeight).map(Number))
      const sp = failureSpectrum(g, maxW)
      for (const row of sp.rows) expect({ total: row.total, fail: row.fail, tie: row.tie }).toEqual(e.byWeight[String(row.w)])
    }
  })
  it('the full n = 3, 3-round polynomial and the logical failure chance at three p', () => {
    const sp = failureSpectrum(repetitionGraph(3, 3), 15, true)
    sp.rows.forEach((r) => {
      expect(r.fail).toBe(FX.rep.full33.F[r.w])
      expect(r.tie).toBe(FX.rep.full33.T[r.w])
    })
    for (const [p, v] of Object.entries(FX.rep.full33.pL)) expect(sp.pL!(Number(p))).toBeCloseTo(v as number, 14)
  })
})

describe('fixtures: curves and frames', () => {
  it('clean-run chance, budget, vote failure, the three fits, the distance a budget needs', () => {
    const c = FX.curves
    for (const [N, v] of Object.entries(c.cleanRun)) expect(cleanRun(Number(N), 1e-3)).toBeCloseTo(v as number, 13)
    expect(logicalBudget(1e9, 2 / 3)).toBeCloseTo(c.budget, 20)
    const ps = [0.001, 0.01, 0.1, 0.4, 0.6]
    for (const [d, vs] of Object.entries(c.repTail)) (vs as number[]).forEach((v, i) => expect(repetitionLogical(Number(d), ps[i])).toBeCloseTo(v, 12))
    const presets: Record<string, string> = { 'tdg-2.6': 'tdg-2.6', 'tdg-A10': 'tdg-A10', bev22: 'bev22' }
    for (const [name, byD] of Object.entries(c.fits))
      for (const [d, vs] of Object.entries(byD as Record<string, number[]>)) [0.001, 0.005, 0.01].forEach((p, i) => expect(surfaceFit(Number(d), p, presets[name])).toBeCloseTo(vs[i], 18))
    const budget = logicalBudget(1e9, 2 / 3)
    for (const [name, d] of Object.entries(c.dNeeded)) expect(dNeeded((x) => surfaceFit(x, 1e-3, name), budget)).toBe(d)
    expect(dNeeded((x) => repetitionLogical(x, 0.01), budget)).toBe(c.repNeeded['0.01'])
    expect(dNeeded((x) => repetitionLogical(x, 0.1), budget)).toBe(c.repNeeded['0.1'])
  })
  it('Pauli frames through H, S and CNOT agree with the twin', () => {
    for (const e of FX.frame) {
      const n = e.x.length
      const start = Array.from({ length: n }, (_, i) => (e.x[i] ? (e.z[i] ? 'Y' : 'X') : e.z[i] ? 'Z' : 'I')).join('')
      const gates = e.gates.map(([gate, a, b]: [string, number, number]) => (gate === 'CNOT' ? { gate, control: a, target: b } : { gate, target: a }))
      const run = frameThrough(start, gates)
      e.after.forEach(([x, z]: number[][], k: number) => {
        const want = x.map((xi, i) => (xi ? (z[i] ? 'Y' : 'X') : z[i] ? 'Z' : 'I')).join('')
        expect(run.frames[k + 1]).toBe(want)
      })
    }
  })
})
