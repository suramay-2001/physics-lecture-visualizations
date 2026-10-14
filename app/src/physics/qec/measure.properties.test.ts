/**
 * Properties of the B3 measurement engine that do not need the numpy fixtures: the general Pauli measurement on the tableau against the update rule, the surgery layout and runs
 * (product of the new checks, deterministic checks after preparation, the sign of the second product after a split), gauging invariants (checks commute, the vertex checks multiply to
 * L, Lemma 2's bound), the time-like history, and the CNOT branches for random real inputs.
 */
import { describe, expect, it } from 'vitest'
import { rng } from '../random'
import { GF2Matrix } from './gf2'
import { Pauli, type Letter } from './pauli'
import { Tableau } from './tableau'
import { makePicker, randomCliffordOps } from './testkit'
import { updateRule } from './update'
import { productOfNewChecks, prepareSurgery, rotatedPatch, runSurgery, surgeryLayout } from './surgery'
import { gaugeSystem, GAUGE_HOSTS } from './gauge'
import { cycleBasis } from './graph'
import { history, voteFail } from './timelike'
import { TRIPLES, byMeasurement } from './cnot'
import { rotatedSurfaceCode } from './codes'

const randomPauli = (n: number, pick: (k: number) => number): Pauli => {
  const letters: Letter[] = ['I', 'X', 'Y', 'Z']
  for (;;) {
    const p = Pauli.fromLetters(Array.from({ length: n }, () => letters[pick(4)]), pick(2) * 2)
    if (p.weight() > 0) return p
  }
}

describe('Tableau.measurePauli against the update rule', () => {
  it('after measuring P with outcome o every updated generator is stabilized, the tableau stays valid, and the case matches', () => {
    const rand = rng(31)
    const pick = makePicker(rand)
    for (let trial = 0; trial < 120; trial++) {
      const n = 2 + pick(5)
      const t = new Tableau(n)
      t.run(randomCliffordOps(n, 14, rand))
      const P = randomPauli(n, pick)
      const o = pick(2) as 0 | 1
      const upd = updateRule(t.stabilizers(), P, o)
      const peek = t.peekPauli(P)
      expect(peek !== null).toBe(upd.fixed)
      const res = t.measurePauli(P, o)
      expect(res.deterministic).toBe(upd.fixed)
      expect(res.outcome).toBe(upd.outcome)
      expect(t.invariantsHold()).toBe(true)
      for (const g of upd.after) expect(t.peekPauli(g)).toBe(0) // each updated generator, sign included, has eigenvalue +1 on the post-measurement state
      expect(t.peekPauli(P)).toBe(res.outcome)
    }
  })
  it('agrees with measureZ on a single Z', () => {
    const rand = rng(5)
    const pick = makePicker(rand)
    for (let trial = 0; trial < 40; trial++) {
      const n = 3 + pick(3)
      const ops = randomCliffordOps(n, 12, rand)
      const a = new Tableau(n)
      a.run(ops)
      const b = a.copy()
      const q = pick(n)
      const o = pick(2) as 0 | 1
      const ra = a.measureZ(q, o)
      const rb = b.measurePauli(Pauli.single(n, q, 'Z'), o)
      expect(rb.outcome).toBe(ra.outcome)
      expect(rb.deterministic).toBe(ra.deterministic)
      for (const g of a.stabilizers()) expect(b.peekPauli(g)).toBe(0)
    }
  })
})

describe('surgery layout and runs', () => {
  it('the generalised patch with rows = cols is the rotated surface code', () => {
    for (const d of [3, 5, 7]) {
      const a = rotatedPatch(d, d)
      const b = rotatedSurfaceCode(d)
      const key = (cs: { type: string; qubits: number[] }[]) => cs.map((c) => `${c.type}${c.qubits.join(',')}`).sort()
      expect(key(a.checks)).toEqual(key(b.checks))
    }
  })
  it('the product of the new checks is the measured logical product, for both products and d = 3, 5, 7', () => {
    for (const product of ['XX', 'ZZ'] as const)
      for (const d of [3, 5, 7]) {
        const L = surgeryLayout(d, product)
        expect(productOfNewChecks(L)).toEqual(L.measured.qubits)
        expect(L.newChecks).toBe(d + 1)
        expect(L.widened).toBe(d - 1)
        expect(L.seam.length).toBe(d)
        expect(L.n).toBe(product === 'XX' ? d * (2 * d + 1) : (2 * d + 1) * d)
        // every new check touches the seam; every kept check does not
        for (const k of L.checks) expect(k.qubits.some((q) => L.seam.includes(q))).toBe(k.cls !== 'kept')
      }
  })
  it('after preparation every merged check of the other type is +1 (the seam in its starting basis)', () => {
    const L = surgeryLayout(3, 'XX')
    const t = prepareSurgery(L, 'zero')
    for (const k of L.checks.filter((c) => c.type === 'Z')) {
      const P = Pauli.fromLetters(Array.from({ length: L.n }, (_, q) => (k.qubits.includes(q) ? 'Z' : 'I')))
      expect(t.peekPauli(P)).toBe(0)
    }
  })
  it('a run: the merge product equals the value read off the merged state; the split leaves X̄X̄ = product and Z̄Z̄ = the top seam outcome (XX); dual for ZZ', () => {
    for (const [d, product, prep] of [[3, 'XX', 'zero'], [3, 'XX', 'plus'], [5, 'XX', 'zero'], [3, 'ZZ', 'plus'], [3, 'ZZ', 'zero']] as const)
      for (const seed of [1, 2, 3, 4, 5, 6]) {
        const r = runSurgery(d, product, prep, { seed })
        expect(r.productPeek).toBe(r.product)
        // the product survives the split; the OTHER product is random unless the patches started in the matching basis, and then it carries the sign of the first seam outcome
        if (product === 'XX') {
          expect(r.after.xx).toBe(r.product)
          expect(r.after.zz).toBe(prep === 'zero' ? r.seamOutcomes[0] : null)
        } else {
          expect(r.after.zz).toBe(r.product)
          expect(r.after.xx).toBe(prep === 'plus' ? r.seamOutcomes[0] : null)
        }
        if (prep === 'plus' && product === 'XX') expect(r.product).toBe(0)
        expect(r.mergeOutcomes.length).toBe(d + 1)
      }
  })
  it('the seam measurements leave each patch alone random', () => {
    const r = runSurgery(3, 'XX', 'zero', { seed: 9 })
    expect(r.after.xa).toBeNull()
    expect(r.after.za).toBeNull()
  })
})

describe('gauging invariants', () => {
  it('every hosted system is a valid CSS code whose vertex checks multiply to L, and Lemma 2 bounds the distance', () => {
    for (const host of GAUGE_HOSTS) {
      const variants = host === 'patches3-xx' ? [{ rungs: 1 }, { rungs: 2 }, { rungs: 3 }] : host === 'patch3-steane' ? [{ w: 1 }, { w: 2 }, { w: 3 }] : [{}]
      for (const opts of variants) {
        const s = gaugeSystem(host, opts)
        expect(s.commutes).toBe(true)
        expect(s.productOk).toBe(true)
        expect(s.kAfter).toBe(s.kBefore - 1)
        expect(s.cycleRank).toBe(s.E - s.V + 1)
        if (host === 'patches3-xx' || host === 'patch3-steane') expect(s.d!).toBeGreaterThanOrEqual(Math.min(s.cheeger.h, 1) * 3 - 1e-12)
        if (host === 'patches3-xx' || host === 'patch3-steane') expect(s.d).toBe(Math.round(Math.min(s.cheeger.h, 1) * 3))
      }
    }
  })
  it('a cycle basis is independent over GF(2) and dropping cycle checks adds gauge qubits one for one', () => {
    const s = gaugeSystem('patches3-xx', { rungs: 3 })
    const G = { V: s.V, edges: s.edges.map((e) => [e.u, e.v] as [number, number]) }
    const rows = cycleBasis(G).map((c) => Array.from({ length: s.E }, (_, j) => (c.includes(j) ? 1 : 0)))
    expect(GF2Matrix.fromRows(rows).rank()).toBe(s.cycleRank)
    for (const drop of [0, 1, 2]) expect(gaugeSystem('patches3-xx', { rungs: 3, drop }).kTotal).toBe(1 + drop)
  })
  it('refuses a disconnected graph and an out-of-range option', () => {
    expect(() => gaugeSystem('patches3-xx', { rungs: 0 })).toThrow(/connected/)
    expect(() => gaugeSystem('patches3-xx', { rungs: 4 })).toThrow()
    expect(() => gaugeSystem('patch3-steane', { w: 0 })).toThrow()
    expect(() => gaugeSystem('patches3-xx', { drop: 3 })).toThrow()
    expect(() => gaugeSystem('patches3-xx', { order: [0, 0, 1] })).toThrow()
  })
})

describe('time-like readout history', () => {
  it('is deterministic for a seed, the verdict follows the parity of each round, and an authored fault list overrides the draw', () => {
    const a = history(4, 7, 0.1, 3)
    const b = history(4, 7, 0.1, 3)
    expect(a).toEqual(b)
    expect(a.wrong).toEqual(a.flips.map((r) => r.reduce((x, y) => x ^ y, 0)))
    expect(a.voteWrong).toBe(a.wrongRounds > 3.5)
    const c = history(4, 5, 0, 1, [[0, 1], [1, 2], [2, 3]])
    expect(c.wrongRounds).toBe(3)
    expect(c.voteWrong).toBe(true)
    expect(() => history(4, 4, 0.1, 1)).toThrow()
    expect(voteFail(1, 0.3)).toBeCloseTo(0.3, 12)
  })
  it('the average of many seeded histories approaches the vote failure chance', () => {
    let wrong = 0
    const N = 4000
    for (let s = 0; s < N; s++) if (history(4, 5, 0.05, s).voteWrong) wrong++
    // p = (1 - 0.9^4)/2 = 0.17195, voteFail(5, p) = 0.0307
    expect(Math.abs(wrong / N - 0.0307)).toBeLessThan(0.01)
  })
})

describe('CNOT by measurement', () => {
  it('every branch finishes a CNOT for random real inputs', () => {
    const rand = rng(77)
    for (let trial = 0; trial < 20; trial++) {
      const v = [0, 1, 2, 3].map(() => rand() - 0.5)
      const nrm = Math.hypot(...v)
      const input = v.map((x) => x / nrm)
      for (const m of TRIPLES) {
        const b = byMeasurement(m, input)
        expect(b.matchesCnot).toBe(true)
        expect(b.agrees).toBe(true)
        expect(b.chance).toBeCloseTo(1 / 8, 12)
      }
    }
  })
})
