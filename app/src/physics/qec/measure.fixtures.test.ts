/**
 * The measurement engine of the background chapter B3 (update rule, Pauli measurement on the tableau, lattice surgery, gauging, graphs, distances, time-like readout, CNOT by
 * measurement) against its independent numpy routes (pipeline/b3_numpy.py → pipeline/make_b3_fixtures.py → __fixtures__/qec-b3.json): a dense 21-qubit state vector for the merge and
 * the split, GF(2) integers for ranks, null spaces and brute-force distances, the incidence system solved for the deformation paths, every flip pattern summed for the readout chances.
 */
import { describe, expect, it, vi } from 'vitest'
import raw from '../__fixtures__/qec-b3.json?raw'
import { Pauli } from './pauli'
import { census, updateRule } from './update'
import { surgeryCensus, surgeryDistances, surgeryLayout } from './surgery'
import { GAUGE_HOSTS, gaugeSystem, matchingOrders } from './gauge'
import { cheeger, components, cycleBasis, cycleRank, incidence } from './graph'
import { productFlip, productFlipByPatterns, roundsFor, voteFail } from './timelike'
import { fixCensus } from './cnot'

vi.setConfig({ testTimeout: 120_000 })
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const FX: any = JSON.parse(raw)
const near = (a: number, b: number, eps = 1e-12): void => expect(Math.abs(a - b)).toBeLessThan(eps)

describe('fixtures: the measurement update rule and its census', () => {
  it('the three cases and the generators they leave agree with the symplectic route', () => {
    for (const c of FX.update.cases) {
      const res = updateRule(c.gens.map((s: string) => Pauli.parse(s)), Pauli.parse(c.measure), 0)
      expect(res.kind).toBe(c.kind)
      expect(res.after.map((p) => p.letters().join(''))).toEqual(c.after)
      expect(res.kBefore).toBe(c.kBefore)
      expect(res.kAfter).toBe(c.kAfter)
    }
  })
  it('counts of Paulis that are fixed / logical / clashing', () => {
    const groups: Record<string, [string[], number]> = { bell: [['XX', 'ZZ'], 2], bitflip3: [['ZZI', 'IZZ'], 3], c422: [['XXXX', 'ZZZZ'], 4], plus2: [['XI', 'IX'], 2] }
    for (const [name, [gens, n]] of Object.entries(groups)) {
      const c = census(gens.map((s) => Pauli.parse(s)), n)
      expect(c).toMatchObject(FX.update.census[name])
      expect(c.fixed + c.logical + c.clashing).toBe(4 ** n - 1)
    }
  })
  it('clash counts between logical products', () => {
    for (const [k, v] of Object.entries(FX.update.clashes as Record<string, number>)) {
      const [a, b] = k.split('/')
      const pa = Pauli.parse(a)
      const pb = Pauli.parse(b)
      let n = 0
      for (let j = 0; j < pa.n; j++) if ((pa.x[j] & pb.z[j]) ^ (pa.z[j] & pb.x[j])) n++
      expect(n).toBe(v)
    }
  })
})

describe('fixtures: lattice surgery', () => {
  it('sizes, new and widened checks, stored qubits for d = 3, 5, 7 and both products', () => {
    for (const [key, s] of Object.entries(FX.surgery.stats as Record<string, { n: number; k: number; seam: number; new: number; widened: number }>)) {
      const L = surgeryLayout(Number(key.slice(2)), key.slice(0, 2) as 'XX' | 'ZZ')
      expect([L.n, L.k, L.seam.length, L.newChecks, L.widened]).toEqual([s.n, s.k, s.seam, s.new, s.widened])
    }
  })
  it('the merged code distances (d = 3)', () => {
    for (const p of ['XX', 'ZZ'] as const) {
      const d = surgeryDistances(3, p)
      expect([d.dX, d.dZ]).toEqual(FX.surgery.distances[`${p}3`])
    }
  })
  it('the merge and split chances agree with the dense 21-qubit run', () => {
    const z = surgeryCensus(3, 'XX', 'zero')
    const dz = FX.surgery.dense.zero
    expect(z.patterns.length).toBe(dz.nPatterns)
    near(Math.min(...z.patterns.map((p) => p.chance)), dz.minChance)
    near(Math.max(...z.patterns.map((p) => p.chance)), dz.maxChance)
    near(z.pProductPlus, dz.pPlus)
    expect(z.split.count).toBe(FX.surgery.dense.split.count)
    near(z.split.chance, FX.surgery.dense.split.chance)
    expect(z.split.flips).toBe(FX.surgery.dense.split.flips)
    const p = surgeryCensus(3, 'XX', 'plus')
    const dp = FX.surgery.dense.plus
    expect(p.patterns.length).toBe(dp.nPatterns)
    near(p.pProductPlus, dp.pPlus)
    near(Math.min(...p.patterns.map((x) => x.chance)), dp.minChance)
  })
})

describe('fixtures: three measurements make a CNOT', () => {
  it('outcome triples that need no fix / a Z / an X, and M†M = I/8', () => {
    const c = fixCensus()
    expect([c.noFix, c.zFix, c.xFix]).toEqual([FX.cnot.noFix, FX.cnot.zFix, FX.cnot.xFix])
    expect(c.allAgree).toBe(FX.cnot.allMatch)
    c.chances.forEach((x) => near(x, FX.cnot.chance))
  })
})

describe('fixtures: gauging systems', () => {
  const rows: Array<[string, Parameters<typeof gaugeSystem>[0], Parameters<typeof gaugeSystem>[1]]> = [
    ['patch3-x', 'patch3-x', {}],
    ['seam3', 'seam3', {}],
    ['patches3-xx:rungs1', 'patches3-xx', { rungs: 1 }],
    ['patches3-xx:rungs2', 'patches3-xx', { rungs: 2 }],
    ['patches3-xx:rungs3', 'patches3-xx', { rungs: 3 }],
    ['patches3-xx:rungs3:drop1', 'patches3-xx', { rungs: 3, drop: 1 }],
    ['patches3-xx:rungs3:drop2', 'patches3-xx', { rungs: 3, drop: 2 }],
    ['patch3-steane:w1', 'patch3-steane', { w: 1 }],
    ['patch3-steane:w2', 'patch3-steane', { w: 2 }],
    ['patch3-steane:w3', 'patch3-steane', { w: 3 }],
  ]
  for (const [key, host, opts] of rows)
    it(`${key}: V, E, cycles, n, k, h and both distances`, () => {
      const f = FX.gauge.systems[key]
      const s = gaugeSystem(host, opts)
      expect([s.V, s.E, s.cycleRank, s.n, s.kBefore, s.kAfter, s.kTotal]).toEqual([f.V, f.E, f.cycles, f.n, f.kBefore, f.kAfter, f.kTotal])
      expect([s.dX, s.dZ, s.d]).toEqual([f.dX, f.dZ, f.d])
      if (f.h !== undefined) near(s.cheeger.h, f.h)
      expect(s.productOk && s.commutes).toBe(true)
    })
  it('every ordering of the three adapter edges gives h = 1 and distance 3', () => {
    for (const [perm, v] of Object.entries(FX.gauge.steaneOrders as Record<string, { h: number; d: number }>)) {
      const s = gaugeSystem('patch3-steane', { w: 3, order: perm.split('').map(Number) })
      near(s.cheeger.h, v.h)
      expect(s.d).toBe(v.d)
    }
    const m = matchingOrders('patch3-steane')
    expect([m.total, m.good]).toEqual([6, 6])
  })
  it('the host list matches', () => {
    expect([...GAUGE_HOSTS]).toEqual(['patch3-x', 'patches3-xx', 'patch3-steane', 'seam3'])
  })
})

describe('fixtures: graph tools', () => {
  for (const [name, g] of Object.entries(FX.graph as Record<string, { V: number; edges: [number, number][]; rank: number; cycleRank: number; components: number; h?: number }>))
    it(`${name}: incidence rank, components, cycle rank, cycle basis and Cheeger constant`, () => {
      const G = { V: g.V, edges: g.edges }
      expect(incidence(G).rank()).toBe(g.rank)
      expect(components(G).length).toBe(g.components)
      expect(cycleRank(G)).toBe(g.cycleRank)
      const basis = cycleBasis(G)
      expect(basis.length).toBe(g.cycleRank)
      // every cycle has even degree at every vertex
      for (const c of basis) {
        const deg = new Array<number>(g.V).fill(0)
        for (const e of c) {
          deg[g.edges[e][0]]++
          deg[g.edges[e][1]]++
        }
        expect(deg.every((x) => x % 2 === 0)).toBe(true)
      }
      if (g.h !== undefined) near(cheeger(G).h, g.h)
    })
})

describe('fixtures: the time-like readout', () => {
  it('the product flips with the summed odd-pattern chance', () => {
    for (const f of FX.timelike.flips) {
      near(productFlip(f.q, f.m), f.p)
      near(productFlipByPatterns(f.q, f.m), f.p)
    }
  })
  it('the vote fails with the tail of the binomial; the least odd R below 1e-3', () => {
    for (const [R, v] of Object.entries(FX.timelike.votes as Record<string, number>)) near(voteFail(Number(R), FX.timelike.p), v)
    for (const o of FX.timelike.otherVotes) near(voteFail(o.R, o.p), o.v)
    expect(roundsFor(FX.timelike.p, 1e-3)).toBe(FX.timelike.roundsFor1e3)
  })
})
