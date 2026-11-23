/**
 * physics/readout/gandalf.ts (the P2 arithmetic) against its numpy twin (pipeline/claims_papers/p2.py -> __fixtures__/claims-papers/p2.json and readout-p2.json) and against the
 * schedule oracle of physics/qec/timing.ts (an event simulation): Eqs. 4 and 5, the printed Fig. 15 bars read back, the η factor, throughput against latency, the boxes of
 * the timeline kind, the toy post-selection and the toy trade-off between reading error and idle error.
 */
import { describe, expect, it } from 'vitest'
import claims from '../__fixtures__/claims-papers/p2.json'
import checks from '../__fixtures__/readout-p2.json'
import { idleTotal, pauliTwirl, pipelineSim } from '../qec/timing'
import * as G from './gandalf'

const K = claims.values as Record<string, number>
const X = checks.values as Record<string, number>
const near = (got: number, want: number, tol = 1e-12): void => expect(Math.abs(got - want), `${got} vs ${want}`).toBeLessThan(tol)

describe('Eqs. 4 and 5 and the printed bars of Fig. 15', () => {
  it('the schedules wrap timing.ts and agree with the event loop', () => {
    near(G.cycleUnpipelined(100, 0.01, 3, 0.4), K.p2TUnp)
    near(G.cyclePipelined(100, 0.01, 3, 0.1, 0.4), K.p2TPip)
    near(pipelineSim(100, 0.01, 3, 0.5), G.cyclePipelined(100, 0.01, 3, 0.1, 0.4))
    near(G.pipelineGain(100, 0.01, 3, 0.1, 0.4), K.p2Saving)
    expect(G.hidesCleanly(0.01, 3, 0.1, 0.4)).toBe(true)
    expect(G.hidesCleanly(0.01, 0.3, 0.1, 0.4)).toBe(false)
    near(G.cyclePipelined(10, 0.01, 0.3, 0.1, 0.4), pipelineSim(10, 0.01, 0.3, 0.5)) // a stalling classifier is still the real total
  })
  it('reads the printed bars back: t_c = 0.5, t_r + t_g at three tolerances, the GANDALF bars, the equal-readout comparison', () => {
    near(G.impliedClassTime(451, 401.5, 100), K.p2TclImplied)
    near(451 - 401.5, K.p2Save)
    near((451 - 401.5) / 451, K.p2SavePct)
    ;[451, 371, 271].forEach((u, i) => near(G.impliedReadGate(u, 100, 0.5), K[`p2TroImplied${i + 1}`]))
    ;[291.1, 181.1, 151.1].forEach((g, i) => near(G.impliedReadGatePipelined(g, 100, 0.1), K[`p2GanTro${i + 1}`]))
    ;[
      [401.5, 291.1],
      [321.5, 181.1],
      [221.5, 151.1],
    ].forEach(([a, b], i) => near(G.ratio(a, b), K[`p2Ratio${i + 1}`]))
    near(G.cyclePipelined(100, 0.01, 1.5, 0, 0.5) - G.cyclePipelined(100, 0.01, 1.5, 0.05, 0.05), K.p2EqualTro)
    near(G.ratio(0.19, 0.152), K.p2TextRatio)
    expect(G.ratio(321.5, 181.1)).toBeCloseTo(1.775, 3)
  })
  it('Table 1 arithmetic and Eq. 1', () => {
    near(G.ratio(1e-3, 400e-9), K.p2GapNA)
    near(G.ratio(500e-9, 34e-9), K.p2GapSC)
    near(G.gateReadShare(400e-9, 1e-3), K.p2ReadFracNA)
    near(G.gateReadShare(34e-9, 500e-9), K.p2ReadFracSC)
    near(G.runtimeScale(1000), K.p2RuntimeScale)
    near(G.snrRatio(10), K.p2SnrSqrt)
  })
})

describe('η, throughput and the printed ratios', () => {
  it('η gives the factor by which the error is divided', () => {
    near(G.etaFactor(0.609), K.p2EtaMF)
    near(G.etaFactor(0.621), K.p2EtaCNN)
    near(G.etaFactor(0.661), K.p2EtaFNN)
    near(G.etaFactor(0.64), K.p2Eta5)
    near(G.etaFactor(0.53), K.p2Eta9)
    near(G.etaFactor(0.609), X['eng.eta60.9'])
    near(G.errorAfter(4, 0.621), X['ch.eta.newErr'])
    expect(() => G.etaFactor(1)).toThrow()
  })
  it('latency from throughput reproduces Table 4; the batch time; the per-site cost of Table 3', () => {
    const tp = [460.0, 3330.3, 9225.0, 11721.4, 12711.4]
    const lat = [2.174, 0.3, 0.108, 0.085, 0.079]
    near(Math.max(...tp.map((t, i) => Math.abs(G.latencyFromThroughput(t) - lat[i]))), K.p2LatTP)
    near(G.batchTime(128, 12711.4), K.p2BatchTime)
    near(G.batchTime(128, 12711.4), X['ch.batch'])
    near(G.perSiteMicros(0.201, 4), K.p2PerSite4)
    near(G.perSiteMicros(33.49, 64), K.p2PerSite64)
    near(G.ratio(33.49, 0.201), K.p2LatRatio)
    near(G.ratio(2.174, 0.201), K.p2Lat34)
  })
  it('the printed parameter and crossing ratios', () => {
    near(G.ratio(355000, 0.2 * 100000), K.p2ParRatioMF)
    near(G.ratio(12.7 * 100000, 355000), K.p2ParRatioFNN)
    near(G.ratio(4.7e6, 355000), K.p2DenoiserRatio)
    near(G.ratio(3.6, 2.9), K.p2CrossRatio5)
    near(G.ratio(4, 3.2), K.p2CrossRatio9)
    near(G.ratio(15, 4), K.p2MisRatio)
  })
})

describe('the boxes of the timeline kind', () => {
  const o = { drawn: 3, tg: 0.5, tr: 3, tden: 0.4, tc: 0.6 }
  const end = (rows: ReturnType<typeof G.timelineSegments>): number => Math.max(...rows.flatMap((r) => r.segments.map((s) => s.to)))
  it('the baseline, the unpipelined and the pipelined schedules end where the totals say', () => {
    near(end(G.timelineSegments('a', o)), G.cycleUnpipelined(3, o.tg, o.tr, o.tc))
    near(end(G.timelineSegments('b', o)), G.cycleUnpipelined(3, o.tg, o.tr, o.tden + o.tc))
    near(end(G.timelineSegments('c', o)), G.cyclePipelined(3, o.tg, o.tr, o.tden, o.tc))
    near(end(G.timelineSegments('c', { ...o, tr: 0.3 })), pipelineSim(3, o.tg, 0.3, o.tden + o.tc)) // the classical row stalls the schedule
  })
  it('boxes in a row are in order and never overlap; a cycle is gate, readout, reset', () => {
    for (const mode of ['a', 'b', 'c'] as const)
      for (const r of G.timelineSegments(mode, o)) r.segments.forEach((s, i) => expect(i === 0 || s.from >= r.segments[i - 1].to - 1e-12).toBe(true))
    expect(G.timelineSegments('cycle', { ...o, treset: 0.2 })[0].segments.map((s) => s.kind)).toEqual(['gate', 'acquire', 'reset'])
    expect(() => G.timelineSegments('cycle', o)).toThrow()
    expect(() => G.timelineSegments('a', { ...o, drawn: 9 })).toThrow()
  })
})

describe('the toy post-selection and the toy trade-off (our inputs)', () => {
  it('keeping only confident scores keeps a share and lowers the error', () => {
    near(G.keepFraction(2, 1), K.p2KeepFrac)
    near(G.keptError(2, 1), K.p2KeptErr)
    near(G.keptError(2, 0), K.p2PlainErr)
    near(G.keepFraction(2, 0), 1)
  })
  const toy = { rb: 6, rd: 0.6, pg: 0.002, T1: 8000, T2: 300 }
  it('the twirl is timing.pauliTwirl; the Poisson overlap error; the minimum is inside the range; a worse classifier costs most at short readout', () => {
    near(G.poissonOverlapError(3, 0.3), X['eng.overlap.3.0.3'])
    const tw = pauliTwirl(4, toy.T1, toy.T2)
    near(tw.pX, X['eng.twirl.pX.4'])
    near(tw.pY, X['eng.twirl.pY.4'])
    near(tw.pZ, X['eng.twirl.pZ.4'])
    near(idleTotal(1, toy.T1, toy.T2), X['eng.twirl.total.1.2'])
    near(G.effectiveRate(4, toy).total, X['eng.peff.4ms'])
    const pL = (t: number): number => G.logicalToy(G.effectiveRate(t, toy).total, 0.1, 0.03, 11)
    const m = G.argminGrid(pL, 0.5, 10, 950)
    expect(m.interior).toBe(true)
    near(m.t, X['eng.tStar'], 1e-9)
    expect(K.p2UMin).toBe(1)
    const rr = [1.5, 4, 10].map((t) => (G.effectiveRate(t, { ...toy, mScale: 3 }).total / G.effectiveRate(t, toy).total) ** 6)
    near(rr[0], X['eng.ratio1p5'], 1e-8)
    near(rr[1], X['eng.ratio4'], 1e-10)
    near(rr[2], X['eng.ratio10'], 1e-10)
    expect(rr[0] > rr[1] && rr[1] > rr[2] && rr[2] > 1).toBe(true)
    expect(K.p2RatioGrows).toBe(1)
    expect(() => G.logicalToy(0.01, 0.1, 0.03, 4)).toThrow()
  })
})
