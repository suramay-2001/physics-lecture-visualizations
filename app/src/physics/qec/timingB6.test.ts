/** physics/qec/timing.ts, B6's functions (idle twirl, readout error, the toy U-curve, fault counting, loss) against their numpy twin (pipeline/claims_papers/b6.py: Kraus channels and the chi diagonal, scipy Poisson sums, enumerations). */
import { describe, expect, it } from 'vitest'
import checks from '../__fixtures__/timing-b6.json'
import claims from '../__fixtures__/claims-papers/b6.json'
import { bestThreshold } from '../optics/imaging'
import { surfaceFit, repetitionLogical } from './curves'
import * as T from './timing'

const X = checks.values as Record<string, number | number[]>
const K = claims.values as Record<string, number>
const near = (got: number, want: number, tol = 1e-12): void => expect(Math.abs(got - want), `${got} vs ${want}`).toBeLessThan(tol)

describe('the Pauli twirl of a waiting qubit', () => {
  it('equals the chi diagonal of the Kraus channels (the twin) at 4 ms and 200 ms, to 1e-14', () => {
    for (const [tag, ms] of [['4ms', 4], ['200ms', 200]] as const) {
      const q = T.pauliTwirl(ms / 1000, 10, 1)
      const want = X[`eng.twirl.chi.${tag}`] as number[]
      near(q.pX, want[0], 1e-14)
      near(q.pY, want[1], 1e-14)
      near(q.pZ, want[2], 1e-14)
    }
  })
  it('the total and the straight-line rule agree with the twin; the rule is the small-t limit', () => {
    for (const ms of [1, 100]) {
      near(T.idleTotal(ms / 1000, 10, 1), X[`eng.idleTotal.${ms}.0`] as number)
      near(T.idleSmallT(ms / 1000, 10, 1), X[`eng.idleSmallT.${ms}.0`] as number)
    }
    expect(T.idleTotal(1e-6, 10, 1) / T.idleSmallT(1e-6, 10, 1)).toBeCloseTo(1, 5)
  })
  it('the Bloch vector shrinks like e^(−t/T1) in z and e^(−t/T2) in x and y', () => {
    const t = 0.004
    const s = T.blochShrink(T.pauliTwirl(t, 10, 1))
    near(s.z, Math.exp(-t / 10), 1e-15)
    near(s.x, Math.exp(-t / 1), 1e-15)
    near(s.y, s.x, 1e-15)
  })
  it('Z dominates when T2 << T1; with T1 infinite only Z remains; a longer T2 than 2 T1 is refused', () => {
    const q = T.pauliTwirl(0.004, 10, 1)
    expect(q.pZ / q.pX).toBeGreaterThan(18)
    const inf = T.pauliTwirl(0.01, 1e12, 0.25)
    expect(inf.pX).toBeLessThan(1e-14)
    near(100 * (inf.pX + inf.pY + inf.pZ), X['ch.twirl.infPct'] as number, 1e-9)
    expect(() => T.pauliTwirl(0.1, 1, 3)).toThrow(RangeError)
    expect(() => T.pauliTwirl(-1, 1, 1)).toThrow(RangeError)
    expect(T.pauliTwirl(0, 1, 1)).toEqual({ pX: 0, pY: 0, pZ: 0 })
  })
})

describe('reading error, the toy effective rate and the optimum', () => {
  it('the reading error is the best cutoff on the track’s Poisson histograms', () => {
    near(T.readoutError(6, 0.3, 2), bestThreshold(12, 0.6).err)
    near(T.readoutError(6, 0.3, 1), K.b6PmAt1ms)
    near(T.readoutError(6, 0.3, 2), K.b6PmAt2ms)
    expect(() => T.readoutError(0.3, 6, 1)).toThrow(RangeError)
  })
  it('p_eff at 2, 4, 10 ms and the grid optimum agree with the twin', () => {
    const f = (t: number) => T.effectiveRate(0.002, t, 10, 1, 6, 0.3)
    for (const t of [2, 4, 10]) near(f(t), K[`b6PeffAt${t}`])
    const best = T.argminTime(f, 0.05, 20, 0.05)
    near(best.t, K.b6TStar, 1e-9)
    near(best.value, K.b6PeffStar)
  })
  it('the golden-section refinement lands where the bounded scipy minimiser does (1e-4)', () => {
    const f = (t: number) => T.effectiveRate(0.002, t, 10, 1, 6, 0.3)
    near(T.refineMinimum(f, 2.9, 3.0).t, X['eng.refine.tstar'] as number, 1e-4)
  })
  it('the optimum does not depend on d, and the toy scaling is B1’s bev22 fit', () => {
    const f = (t: number) => T.effectiveRate(0.002, t, 10, 1, 6, 0.3)
    for (const d of [3, 11, 25]) near(T.argminTime((t) => T.logicalToy(f(t), 0.03, 0.01, d), 0.05, 20, 0.05).t, K.b6TStar, 1e-9)
    near(T.logicalToy(0.004, 0.03, 0.01, 11), surfaceFit(11, 0.004, 'bev22'), 1e-15)
    expect(() => T.logicalToy(0.004, 0.03, 0.01, 10)).toThrow(RangeError)
  })
})

describe('counting the cheapest failing fault sets', () => {
  it('the vote and its leading term: exact failure (B1’s sum), enumeration values of the twin, the ratios', () => {
    near(T.voteExact(5, 0.1), X['eng.vote.5.0.1'] as number)
    near(T.voteExact(7, 0.05), X['eng.vote.7.0.05'] as number)
    for (const d of [3, 5, 7, 11, 13]) near(T.voteExact(d, 0.001) / T.voteLeading(d, 0.001), K[`b6RepRatio${d}`])
    expect(T.voteExact(5, 0.1)).toBe(repetitionLogical(5, 0.1))
  })
  it('elementary symmetric polynomials: equal rates give the binomial, the mixed value is the twin’s, e_k ≤ Maclaurin', () => {
    near(T.elementarySymmetric(Array(11).fill(0.003), 6), X['eng.esym.equal'] as number, 1e-25)
    near(T.elementarySymmetric([0.001, 0.001, 0.001, 0.005, 0.005, 0.005], 3) / 1, T.elementarySymmetric([0.005, 0.001, 0.005, 0.001, 0.005, 0.001], 3), 1e-18)
    const ps = [...Array(5).fill(0.001), ...Array(6).fill(0.005)]
    near(T.elementarySymmetric(ps, 3), X['eng.esym.mixed.k3'] as number, 1e-18)
    expect(T.elementarySymmetric(ps, 6)).toBeLessThanOrEqual(T.maclaurinBound(ps, 6) * (1 + 1e-12))
    near(T.maclaurinBound(Array(11).fill(0.003), 6), T.elementarySymmetric(Array(11).fill(0.003), 6), 1e-25)
  })
  it('the Poisson-binomial tail (a dynamic programme over the count) equals the twin and the plain binomial when rates are equal', () => {
    const ps = [...Array(5).fill(0.001), ...Array(6).fill(0.005)]
    near(T.poissonBinomialTail(ps, 4), X['eng.tail.mixed.k4'] as number)
    near(T.poissonBinomialTail(Array(7).fill(0.05), 4), T.voteExact(7, 0.05))
    expect(T.poissonBinomialTail([0.3, 0.4], 0)).toBeCloseTo(1, 15)
    expect(T.poissonBinomialTail([0.3, 0.4], 3)).toBe(0)
  })
  it('erasures: e^d/2 at d = 5, e = 0.01; the fewest faults are (d+1)/2 flips against d erasures', () => {
    near(T.erasureRepetition(5, 0.01), 5e-11, 1e-24)
    expect(T.minFaults(11, 'flip')).toBe(6)
    expect(T.minFaults(11, 'erasure')).toBe(11)
    expect(() => T.minFaults(10, 'flip')).toThrow(RangeError)
    expect(() => T.erasureRepetition(0, 0.1)).toThrow(RangeError)
  })
})

describe('atoms that leave', () => {
  it('the reported survival per image gives the plan’s numbers on 241 atoms and 11 rounds', () => {
    const S = 1 - 1.048e-4
    near(T.lossPerRound(241, S), K.b6LossPerRound)
    near(T.noLossChance(241, S, 11), K.b6NoLoss11Rounds)
    near(T.roundsPerLoss(241, S), K.b6RoundsToOneLoss, 1e-9)
    near(T.noLossChance(97, 1 - 1e-4, 20), X['eng.noloss.7.1e-4.20'] as number)
    near(100 * T.lossPerRound(97, 1 - 1e-4), X['ch.loss.per100'] as number, 1e-10)
  })
  it('refuses nonsense', () => {
    expect(() => T.lossPerRound(0, 0.9)).toThrow(RangeError)
    expect(() => T.noLossChance(5, 1.5, 1)).toThrow(RangeError)
  })
})
