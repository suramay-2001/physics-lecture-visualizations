/**
 * Chapter Q19's six Arcade "Spot the error" rounds (P-Q19-story §11.2): each wrong step is recomputed through the engine here (physics/qc/walk.ts, trotter.ts,
 * variational.ts), so the correction a round states is the engine's number and the flagged step really is false (the generic checks of games.test.ts cover the
 * shape and the chapter links).
 */
import { describe, expect, it } from 'vitest'
import { cutDistribution, maxCut, meanCut, optimalGuessChance, qaoaGridBest, ringEdges } from '../../physics/qc/variational'
import { commutatorNorm, trotterError } from '../../physics/qc/trotter'
import {
  coinWalkSigma,
  extraWalkChances,
  extraWalkPeak,
  extraWalkSeries,
  scatterVertex,
  starReducedChance,
  starStepsBergou,
  starWalkFirstPeak,
  walkSigmaClassical,
} from '../../physics/qc/walk'
import { QC_ERROR_ROUNDS } from './games'
import { Q19 } from './Q19'
import { V } from './Q19.values'

const close = (a: number, b: number, eps = 1e-9) => expect(Math.abs(a - b)).toBeLessThan(eps)
const round = (id: string) => QC_ERROR_ROUNDS.find((r) => r.id === id)!
const sentences = (s: string) => s.split(/(?<=[.?!])\s+(?=[A-Z$])/)
const words = (s: string) => s.split(/\s+/).filter((w) => /[\p{L}\p{N}]/u.test(w)).length

describe('Q19 Spot the error rounds', () => {
  const IDS = ['qc-walk-spread', 'qc-vertex-equal', 'qc-walk-slow', 'qc-extra-plus', 'qc-trotter-exact', 'qc-qaoa-sure']
  it('there are six, each four steps long, each training a real unit of Q19, the flagged step inside the argument', () => {
    const mine = QC_ERROR_ROUNDS.filter((r) => r.trains.lecture === 'Q19')
    expect(mine.map((r) => r.id)).toEqual(IDS)
    for (const r of mine) {
      expect(r.steps).toHaveLength(4)
      expect(Q19.units.map((u) => u.id)).toContain(r.trains.unit)
      expect(r.wrong).toBeGreaterThanOrEqual(1)
      expect(r.wrong).toBeLessThan(4)
      expect(r.id.startsWith('qc-')).toBe(true)
    }
    expect(new Set(mine.map((r) => r.trains.unit)).size).toBe(6)
  })
  it('every sentence of a round is at most 25 words', () => {
    for (const r of QC_ERROR_ROUNDS.filter((x) => x.trains.lecture === 'Q19'))
      for (const s of [...r.steps, r.why].flatMap(sentences)) expect(words(s), `${r.id}: ${s}`).toBeLessThanOrEqual(25)
  })
  it('qc-walk-spread: the classical spread at n = 100 is 10; the quantum walker’s is 54.12, about 0.54 n', () => {
    close(walkSigmaClassical(100), 10, 1e-9)
    close(coinWalkSigma(100), 54.12414, 1e-4)
    close(coinWalkSigma(100) / 100, 0.5412414, 1e-6)
    expect(coinWalkSigma(100)).toBeGreaterThan(5 * walkSigmaClassical(100))
    expect(V.q19CoinSigma100).toBe(coinWalkSigma(100))
    expect(round('qc-walk-spread').steps[3]).toContain('$10$')
    expect(round('qc-walk-spread').why).toContain('54.1')
  })
  it('qc-vertex-equal: eight amplitudes of 1/8 carry chance 1/8; the centre gives -0.75 back and 0.25 to each of the other seven (squares add to 1)', () => {
    close(8 * (1 / 8) ** 2, 0.125)
    const U = scatterVertex(8)
    close(U[0][0].re, -0.75)
    for (let k = 1; k < 8; k++) close(U[k][0].re, 0.25)
    close(U.reduce((s, row) => s + row[0].re ** 2, 0), 1)
    expect(V.q19Vertex8R).toBe(0.75)
    expect(V.q19Vertex8T).toBe(0.25)
    expect(round('qc-vertex-equal').why).toContain('$-0.75$')
  })
  it('qc-walk-slow: at N = 1024 the first peak is at step 50 (π/2 √N = 50.27), chance 0.9995; the classical average is 512.5 looks', () => {
    const peak = starWalkFirstPeak(1024)
    expect(peak).toBe(50)
    close(starStepsBergou(1024), 50.26548, 1e-4)
    close(starReducedChance(1024, peak), 0.9994612, 1e-6)
    close((1024 + 1) / 2, 512.5)
    expect(peak).toBeLessThan(1024 / 10)
    expect(round('qc-walk-slow').steps[1]).toContain('512.5')
    expect(round('qc-walk-slow').why).toContain('50.27')
  })
  it('qc-extra-plus: with the plus sign the chance on spokes 1 and 2 stays below 0.083 over 40 steps; with the minus sign it reaches 0.70 at step 11', () => {
    const plus = Math.max(...extraWalkSeries(64, 40, 1).near)
    close(plus, 0.08290584, 1e-6)
    expect(plus).toBeLessThan(0.083)
    expect(extraWalkPeak(64)).toBe(11)
    close(extraWalkChances(64, 11).near, 0.7001665, 1e-6)
    close(Math.max(...extraWalkSeries(64, 40, -1).near), 0.7001665, 1e-6)
    expect(round('qc-extra-plus').steps[1]).toContain('$0.70$')
    expect(round('qc-extra-plus').why).toContain('$0.083$')
  })
  it('qc-trotter-exact: the bonds do not commute (norm 0.433), one piece misses by 0.733 at t = 2, eight pieces by 0.0911', () => {
    close(commutatorNorm(3, 1), Math.sqrt(3) / 4, 1e-9)
    close(trotterError(3, 1, 2, 1, 1), 0.7326812, 1e-6)
    close(trotterError(3, 1, 2, 8, 1), 0.09112942, 1e-6)
    expect(trotterError(3, 1, 2, 1, 1)).toBeGreaterThan(0.1)
    expect(round('qc-trotter-exact').why).toContain('0.433')
    expect(round('qc-trotter-exact').why).toContain('$0.733$')
    expect(round('qc-trotter-exact').why).toContain('$0.0911$')
  })
  it('qc-qaoa-sure: on the four-cycle the best layer averages 3 of a best 4 and reads the best cut with chance 0.531 (cut 2: 0.4375; a random pattern: 0.125)', () => {
    const E = ringEdges(4)
    expect(meanCut(4, E)).toBe(2)
    expect(maxCut(4, E).value).toBe(4)
    const best = qaoaGridBest(4, E)
    close(best.F, 3, 1e-9)
    close(best.gammaDeg, 45)
    close(best.betaDeg, 22.5)
    const dist = cutDistribution(4, E, Math.PI / 4, Math.PI / 8)
    close(dist[4], 0.53125, 1e-9)
    close(dist[2], 0.4375, 1e-9)
    close(optimalGuessChance(4, E), 0.125)
    expect(dist[4]).toBeLessThan(1)
    expect(round('qc-qaoa-sure').why).toContain('$0.531$')
  })
})
