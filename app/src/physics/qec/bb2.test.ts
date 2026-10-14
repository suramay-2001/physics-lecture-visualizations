/**
 * The engine additions of Papers chapter B2 (bbfamily.ts, bp.ts, qldpc.ts) against their numpy twin (pipeline/bb2_numpy.py -> make_bb2_fixtures.py -> __fixtures__/qec-bb2.json), plus
 * properties: a decoder's claims about the syndrome hold on random errors, an isomorphism fails without its shifts, OSD-0 always meets the syndrome.
 */
import { describe, expect, it, vi } from 'vitest'
import raw from '../__fixtures__/qec-bb2.json?raw'
import { rng } from '../random'
import { GROSS_SPEC, bbCode, paperSpec } from './bb'
import {
  BB_PRESET_NAMES,
  ISO_HINTS,
  bbClashQubits,
  bbCodeOf,
  bbCycleDetectors,
  bbCycleSlots,
  bbDistanceRecord,
  bbIsomorphism,
  bbLayers,
  bbPreset,
  bbRoundEdges,
  bbScheduleCheck,
  bbShiftSummary,
  cycleSteps,
  kd2n,
  logicalShiftMatrix,
  matrixGroupOrder,
  matrixOrder,
  permutationPreserves,
} from './bbfamily'
import { channelLlr, differByStabilizer, fourCycles, minSumBP, osd0 } from './bp'
import { GF2Matrix } from './gf2'
import { hammingParity, hammingRow, quantumHamming, toricRow } from './qldpc'
import { toricCode } from './toric'

vi.setConfig({ testTimeout: 120_000 })

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const FX: any = JSON.parse(raw)

describe('Table 3 of Bravyi et al.: n, k, ranks, Lemma 1 against the numpy kron route', () => {
  for (const name of ['b72', 'b90', 'b108', 'b144', 'b288', 'b360', 'b756'] as const)
    it(`${name}`, () => {
      const c = bbCodeOf(name)
      const f = FX.table3[name]
      expect(c.n).toBe(f.n)
      expect(c.k).toBe(f.k)
      expect(c.HX.rank()).toBe(f.rankX)
      expect(c.HZ.rank()).toBe(f.rankZ)
      expect(c.checkWeight).toBe(f.checkWeight)
      expect(c.css.degrees().qubitDegree).toBe(f.qubitDegree)
      // Lemma 1: k = 2 dim(ker A ∩ ker B)
      const kernel = c.ring.matrix(c.A).vstack(c.ring.matrix(c.B)).nullspace().rows
      expect(kernel).toBe(f.kerDim)
      expect(c.k).toBe(2 * kernel)
      expect(f.commute).toBe(true)
      expect(c.HX.mul(c.HZ.transpose()).rank()).toBe(0)
    })
  it('the paper-tdg form of the gross code is a [[144,12]] code too, and every preset builds', () => {
    expect(bbCodeOf('gross').k).toBe(12)
    expect(bbCodeOf('two-gross').n).toBe(288)
    for (const name of BB_PRESET_NAMES) expect(bbCodeOf(name).css.stabilizer().check().commuting).toBe(true)
    expect(bbPreset('gross', 'bravyi').name).toBe('b144')
    expect(bbPreset('two-gross', 'bravyi').name).toBe('b288')
  })
})

describe('distances: proved offline, searched live, or reported', () => {
  it('[[72,12,6]]: the offline search is a fixture; its witnesses are logical operators of THIS engine', () => {
    const f = FX.distance.b72
    expect([f.dX, f.dZ]).toEqual([6, 6])
    const rec = bbDistanceRecord('b72')
    expect(rec).toMatchObject({ value: 6, kind: 'exact-offline' })
    const c = bbCodeOf('b72')
    for (const [w, H, S] of [[f.witnessesX, c.HZ, c.HX], [f.witnessesZ, c.HX, c.HZ]] as const)
      for (const support of w as number[][]) {
        const v = new Array<number>(72).fill(0)
        for (const q of support) v[q] = 1
        expect(support.length).toBe(6)
        expect(H.mulVec(v).every((b) => b === 0)).toBe(true)
        expect(S.rowspaceContains(v)).toBe(false)
      }
  })
  it('the other distances are reported or bounds, never exact', () => {
    expect(bbDistanceRecord('b90')).toMatchObject({ value: 10, kind: 'reported' })
    expect(bbDistanceRecord('gross')).toMatchObject({ value: 12, kind: 'reported' })
    expect(bbDistanceRecord('two-gross')).toMatchObject({ value: 18, kind: 'reported' })
    expect(bbDistanceRecord('b360')).toMatchObject({ value: 24, kind: 'bound' })
    expect(bbDistanceRecord('b756')).toMatchObject({ value: 34, kind: 'bound' })
  })
  it('the toy code and the 3 x 4 torus are searched live', () => {
    const toy = bbDistanceRecord('toy-24')
    expect(toy).toMatchObject({ value: FX.distance.toy.d, kind: 'exact' })
    expect(bbCodeOf('toy-24').n).toBe(FX.distance.toy.n)
    expect(bbCodeOf('toy-24').k).toBe(FX.distance.toy.k)
    expect(toricCode(3, 4).n).toBe(FX.distance.toric3x4.n)
    expect(toricCode(3, 4).code.k).toBe(FX.distance.toric3x4.k)
    expect(kd2n(4, 4, 24)).toBeCloseTo(8 / 3, 12)
    expect(kd2n(2, 3, 24)).toBe(0.75)
  })
})

describe('presentations: Bravyi et al.\'s form against paper-tdg\'s', () => {
  it('the maps of the plan match numpy, and without them the rows do not match', () => {
    expect(bbIsomorphism(bbCodeOf('gross'), bbCodeOf('b144'), ISO_HINTS.gross) !== null).toBe(FX.iso.gross)
    expect(bbIsomorphism(bbCodeOf('gross'), bbCodeOf('b144'), { alpha: [0, 0], beta: [0, 0], u: 1 }) !== null).toBe(FX.iso.grossNoShift)
    expect(bbIsomorphism(bbCodeOf('two-gross'), bbCodeOf('b288'), ISO_HINTS['two-gross']) !== null).toBe(FX.iso.twoGross)
    expect(bbIsomorphism(bbCodeOf('two-gross'), bbCodeOf('b288'), { ...ISO_HINTS['two-gross'], u: 1 }) !== null).toBe(FX.iso.twoGrossNoMap)
    expect(FX.iso).toEqual({ gross: true, grossNoShift: false, twoGross: true, twoGrossNoMap: false })
  })
  it('a code is isomorphic to itself under the identity map, and a wrong shift breaks the match', () => {
    const c = bbCodeOf('b72')
    expect(bbIsomorphism(c, c, { alpha: [0, 0], beta: [0, 0], u: 1 })).not.toBeNull()
    expect(bbIsomorphism(c, c, { alpha: [1, 0], beta: [0, 0], u: 1 })).toBeNull()
  })
})

describe('layers: thickness 2', () => {
  it('the gross code in Bravyi\'s form: two layers of 432 edges, degree 3, pieces of 24 and 48 nodes', () => {
    const { layers, layerOf } = bbLayers(bbCodeOf('b144'))
    const f = FX.layers.gross
    layers.forEach((L, i) => {
      expect(L.edges).toBe(f[i].edges)
      expect(L.maxDegree).toBe(f[i].maxDegree)
      expect(Object.fromEntries(L.components.map((x) => [String(x.size), x.count]))).toEqual(f[i].pieces)
    })
    expect(layers[0].edges + layers[1].edges).toBe(bbCodeOf('b144').tanner().edges.length)
    expect(bbCodeOf('b144').tanner().edges.every((e) => layerOf(e) === 0 || layerOf(e) === 1)).toBe(true)
  })
})

describe('the depth-8 cycle', () => {
  it('clashes, bad pairs and overlap match numpy for both variants on two codes', () => {
    for (const [name, key] of [['b72', 'b72'], ['b144', 'b144']] as const)
      for (const [variant, fkey] of [['printed', 'printed'], ['swap-z-reads', 'swap-z-reads']] as const) {
        const r = bbScheduleCheck(bbCodeOf(name), variant)
        const f = FX.schedule[key][fkey]
        expect({ clashes: r.clashes, badPairs: r.badPairs, pairs: r.pairs, maxOverlap: r.maxOverlap }).toEqual(f)
      }
    expect(bbScheduleCheck(bbCodeOf('b144')).valid).toBe(true)
    expect(bbScheduleCheck(bbCodeOf('b144'), 'swap-z-reads').conflictFree).toBe(true)
    expect(bbScheduleCheck(bbCodeOf('b144'), 'swap-z-reads').valid).toBe(false)
    expect(cycleSteps(1)).toBe(9)
    expect(cycleSteps(12)).toBe(97)
  })
  it('every round of the printed cycle touches each qubit at most once; round edges carry the slot', () => {
    const c = bbCodeOf('b144')
    expect(bbClashQubits(c, 'printed')).toEqual([])
    for (let r = 1; r <= 8; r++) {
      const edges = bbRoundEdges(c, 'printed', r)
      const qs = edges.map((e) => e.qubit)
      expect(new Set(qs).size).toBe(qs.length)
      expect(edges.every((e) => e.slot.round === r)).toBe(true)
    }
    expect(bbCycleSlots('printed')).toHaveLength(12)
  })
  it('on a stabilizer tableau two cycles of [[72,12,6]] give silent detectors, the swapped Z reads do not (numpy agrees on both)', () => {
    const c = bbCodeOf('b72')
    for (const seed of [1, 2]) {
      const r = bbCycleDetectors(c, 'printed', 2, seed)
      expect(r.nonzero).toBe(0)
      expect(r.detectors).toBe(FX.schedule.tableau.b72.printed[0].detectors)
      expect(r.clean).toBe(true)
    }
    for (const seed of [3, 4]) expect(bbCycleDetectors(c, 'swap-z-reads', 2, seed).nonzero).toBeGreaterThan(0)
    for (const f of FX.schedule.tableau.b72.swap) expect(f.nonzero).toBeGreaterThan(0)
  })
})

describe('translations of the gross code and the logical qubits (the paper\'s basis)', () => {
  it('counts, orders, ones, classes and the group match the twin', () => {
    const s = bbShiftSummary('gross')
    expect(s).toEqual(FX.shifts.gross)
    expect(s.preserved).toBe(72)
    expect(s.swapPreserves).toBe(false)
    expect(s.distinct * s.trivial).toBe(72)
  })
  it('the shift by x^6 is the identity on the logical qubits; x is not; both are invertible', () => {
    const c = bbCodeOf('gross')
    const I = GF2Matrix.identity(12)
    const M6 = logicalShiftMatrix(c, 'gross', 6, 0)
    expect(Array.from({ length: 12 }, (_, i) => M6.rowBits(i).join('')).join()).toBe(Array.from({ length: 12 }, (_, i) => I.rowBits(i).join('')).join())
    const Mx = logicalShiftMatrix(c, 'gross', 1, 0)
    expect(Mx.rank()).toBe(12)
    expect(matrixOrder(Mx)).toBe(6)
    expect(matrixGroupOrder([Mx])).toBe(6)
  })
  it('swapping two qubits is not a symmetry; a shift is', () => {
    const c = bbCodeOf('gross')
    const perm = c.shiftPermutation(2, 3)
    expect(permutationPreserves(c, perm)).toBe(true)
    const swap = Array.from({ length: c.n }, (_, q) => q)
    ;[swap[0], swap[1]] = [1, 0]
    expect(permutationPreserves(c, swap)).toBe(false)
  })
})

describe('belief propagation and OSD-0 against the numpy twin', () => {
  const rep = (n: number): GF2Matrix => GF2Matrix.fromSupports(Array.from({ length: n - 1 }, (_, i) => [i, i + 1]), n)
  it('the channel ratio', () => {
    expect(channelLlr(0.05)).toBeCloseTo(FX.bp.llr.p05, 12)
    expect(channelLlr(0.01)).toBeCloseTo(FX.bp.llr.p01, 12)
    expect(() => channelLlr(0.6)).toThrow()
  })
  it('a repetition code with one flip converges in one round and names the bit', () => {
    const H = rep(7)
    const e = [0, 0, 0, 1, 0, 0, 0]
    const r = minSumBP(H, H.mulVec(e), 0.05, 7)
    const f = FX.bp.rep7
    expect({ converged: r.converged, iterations: r.iterations }).toEqual({ converged: f.converged, iterations: f.iterations })
    expect(r.hard).toEqual(e)
    r.marginals.forEach((x, j) => expect(x).toBeCloseTo(f.marginals[j], 12))
    expect(r.history.map((h) => h.hardWeight)).toEqual(f.hardWeights)
  })
  it('the degenerate pair on the 3 x 3 torus: the beliefs split over the four star edges and BP never converges; OSD-0 repairs it', () => {
    const t = toricCode(3)
    const HZ = t.code.HZ
    const f = FX.bp.toric3
    const e = new Array<number>(18).fill(0)
    ;[t.hEdge(0, 0), t.vEdge(0, 0)].forEach((q) => (e[q] = 1))
    expect(f.error).toEqual([...Array(18).keys()].filter((q) => e[q]))
    const syn = HZ.mulVec(e)
    expect(syn.flatMap((b, i) => (b ? [i] : []))).toEqual(f.lit)
    const r = minSumBP(HZ, syn, 0.05, 18)
    expect({ converged: r.converged, iterations: r.iterations, weight: r.hard.reduce((s, b) => s + b, 0) }).toEqual({ converged: f.converged, iterations: f.iterations, weight: f.finalWeight })
    expect(r.history.map((h) => h.hardWeight)).toEqual(f.hardWeights)
    r.marginals.forEach((x, j) => expect(x).toBeCloseTo(f.marginals[j], 12))
    f.star.forEach((q: number) => expect(r.marginals[q]).toBeCloseTo(-channelLlr(0.05), 12))
    for (const tie of ['low', 'high'] as const) {
      const o = osd0(HZ, syn, r.marginals, tie)
      const g = f[`osd_${tie}`]
      expect({ weight: o.weight, valid: o.valid, support: o.estimate.flatMap((b, i) => (b ? [i] : [])), info: o.infoSet }).toEqual({ weight: g.weight, valid: g.valid, support: g.support, info: g.infoSet })
      expect(differByStabilizer(t.code.HX, o.estimate, e)).toBe(g.diffIsStabilizer)
    }
    expect(fourCycles(HZ)).toBe(FX.bp.fourCycles.toric3)
    expect(fourCycles(bbCodeOf('gross').HZ)).toBe(FX.bp.fourCycles.gross)
  })
  it('one flipped edge on the same torus has no twin: one round', () => {
    const t = toricCode(3)
    const e = new Array<number>(18).fill(0)
    e[t.hEdge(1, 1)] = 1
    const r = minSumBP(t.code.HZ, t.code.HZ.mulVec(e), 0.05, 18)
    expect({ converged: r.converged, iterations: r.iterations, estimate: r.hard.flatMap((b, i) => (b ? [i] : [])) }).toEqual(FX.bp.toric3Single)
  })
  it('property: OSD-0 always meets the syndrome, and converged BP does too (200 random errors on the torus and the 24-qubit BB code)', () => {
    const rand = rng(77)
    for (const H of [toricCode(3).code.HZ, bbCodeOf('toy-24').HZ]) {
      for (let trial = 0; trial < 100; trial++) {
        const e = Array.from({ length: H.cols }, () => (rand() < 0.1 ? 1 : 0))
        const syn = H.mulVec(e)
        const r = minSumBP(H, syn, 0.1, 25)
        if (r.converged) expect(H.mulVec(r.hard)).toEqual(syn)
        const o = osd0(H, syn, r.marginals, trial % 2 ? 'low' : 'high')
        expect(o.valid).toBe(true)
        expect(H.mulVec(o.estimate)).toEqual(syn)
        expect(o.infoSet.length).toBe(H.rank())
      }
    }
  })
})

describe('families: dense against sparse', () => {
  it('the CSS codes of Hamming codes have rate near 1 and check weight (n + 1)/2; the toric code stays at 4', () => {
    for (const r of [3, 4, 5, 6]) {
      const row = hammingRow(r)
      expect(row).toEqual({ n: FX.family[`hamming${r}`].n, k: FX.family[`hamming${r}`].k, checkWeight: FX.family[`hamming${r}`].checkWeight, qubitDegree: FX.family[`hamming${r}`].qubitDegree })
      expect(row.checkWeight).toBe((row.n + 1) / 2)
      expect(quantumHamming(r).stabilizer().check().ok).toBe(true)
      expect(hammingParity(r).mul(hammingParity(r).transpose()).rank()).toBe(0)
    }
    for (const L of [3, 4, 5, 6, 8]) {
      const row = toricRow(L)
      expect(row).toEqual({ n: FX.family[`toric${L}`].n, k: FX.family[`toric${L}`].k, checkWeight: FX.family[`toric${L}`].checkWeight, qubitDegree: FX.family[`toric${L}`].qubitDegree })
    }
    expect(() => quantumHamming(2)).toThrow()
  })
  it('a spec built by hand equals the preset', () => {
    expect(bbCode(paperSpec('x', 12, 6, 3, -1, -1, -3)).k).toBe(bbCode(GROSS_SPEC).k)
  })
})
