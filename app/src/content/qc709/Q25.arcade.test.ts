/**
 * Chapter Q25's six Arcade "Spot the error" rounds (P-Q25-story §11.2): each wrong step is recomputed through the engine here (physics/qc/atoms.ts, iontrap.ts),
 * so the correction a round states is the engine's number and the flagged step really is false (the generic checks of games.test.ts cover the shape and the
 * chapter links).
 */
import { describe, expect, it } from 'vitest'
import { PRINTED_T_DOPPLER_UK, TABLE_13_1, dopplerT, parityLoad, recoilT, rydbergBest } from '../../physics/qc/atoms'
import { czBell, msBell, msBookTime, msTime, quadrupoleCurvatures } from '../../physics/qc/iontrap'
import { QC_ERROR_ROUNDS } from './games'
import { Q25 } from './Q25'
import { V } from './Q25.values'

const close = (a: number, b: number, eps = 1e-9) => expect(Math.abs(a - b)).toBeLessThan(eps)
const round = (id: string) => QC_ERROR_ROUNDS.find((r) => r.id === id)!
const sentences = (s: string) => s.split(/(?<=[.?!])\s+(?=[A-Z$])/)
const words = (s: string) => s.split(/\s+/).filter((w) => /[\p{L}\p{N}]/u.test(w)).length

describe('Q25 Spot the error rounds', () => {
  const IDS = ['qc-table-doppler', 'qc-load-full', 'qc-blockade-fast', 'qc-trap-static', 'qc-cz-hot', 'qc-ms-time']
  it('there are six, each four steps long, each training a real unit of Q25, the flagged step inside the argument', () => {
    const mine = QC_ERROR_ROUNDS.filter((r) => r.trains.lecture === 'Q25')
    expect(mine.map((r) => r.id)).toEqual(IDS)
    for (const r of mine) {
      expect(r.steps).toHaveLength(4)
      expect(Q25.units.map((u) => u.id)).toContain(r.trains.unit)
      expect(r.wrong).toBeGreaterThanOrEqual(1)
      expect(r.wrong).toBeLessThan(4)
      expect(r.id.startsWith('qc-')).toBe(true)
    }
  })
  it('every sentence of a round is at most 25 words', () => {
    for (const r of QC_ERROR_ROUNDS.filter((x) => x.trains.lecture === 'Q25'))
      for (const s of [...r.steps, r.why].flatMap(sentences)) expect(words(s), `${r.id}: ${s}`).toBeLessThanOrEqual(25)
  })
  it('qc-table-doppler: ħγ/2k_B is 145.7 µK for Rb and 0.178 µK for the 689 nm line (the 1.02 near it is the 461 nm recoil temperature, 1.03 µK)', () => {
    close(dopplerT(TABLE_13_1.Rb) * 1e6, 145.657, 1e-3)
    close(dopplerT(TABLE_13_1.Sr689) * 1e6, 0.177572, 1e-5)
    expect(dopplerT(TABLE_13_1.Sr689) * 1e6).toBeLessThan(0.2)
    expect(PRINTED_T_DOPPLER_UK.Sr689).toBe(1.02)
    close(recoilT(TABLE_13_1.Sr461) * 1e6, 1.02843, 1e-4)
    expect(Math.abs(recoilT(TABLE_13_1.Sr461) * 1e6 - PRINTED_T_DOPPLER_UK.Sr689)).toBeLessThan(0.02)
    expect(TABLE_13_1.Sr689.gamma / (2 * Math.PI * 1e6)).toBeCloseTo(0.0074, 6)
    expect(TABLE_13_1.Rb.gamma / (2 * Math.PI * 1e6)).toBeCloseTo(6.07, 6)
    close(V.q25TDSr689, 0.177572, 1e-5)
    expect(round('qc-table-doppler').why).toContain('0.178\\,\\mu$K')
  })
  it('qc-load-full: with pairs removed a site ends with one atom only if it caught an odd number: 0.432 at µ = 1, never above 1/2', () => {
    const pmf = (n: number, mu: number) => Math.exp(-mu) * mu ** n / [1, 1, 2, 6, 24, 120, 720, 5040, 40320, 362880, 3628800][n]
    close(parityLoad(1), pmf(1, 1) + pmf(3, 1) + pmf(5, 1) + pmf(7, 1) + pmf(9, 1), 1e-6)
    close(parityLoad(1), (1 - Math.exp(-2)) / 2, 1e-9)
    close(parityLoad(1), 0.4323324, 1e-6)
    for (const mu of [0.5, 1, 2, 5, 20]) expect(parityLoad(mu)).toBeLessThan(0.5)
    expect(pmf(2, 1)).toBeGreaterThan(0.1) // a site that catches two atoms is common, and ends empty
    expect(round('qc-load-full').why).toContain('0.432')
  })
  it('qc-blockade-fast: the best error keeps falling as (Bτ)^-2/3, 0.00915 then 0.00199 then 0.000423, about 0.22 per tenfold', () => {
    const e = [1e-4, 1e-5, 1e-6].map((g) => rydbergBest(g).error)
    close(e[0], 0.009145209, 1e-8)
    close(e[1], 0.001989875, 1e-8)
    close(e[2], 0.0004228921, 1e-9)
    expect(e[1]).toBeLessThan(e[0])
    expect(e[2]).toBeLessThan(e[1])
    close(e[1] / e[0], 0.2176, 1e-3)
    close(V.q25TenfoldFactor, 0.2154435, 1e-6)
    close(V.q25RydSlopeErr, 0.667482, 1e-6)
    expect(round('qc-blockade-fast').why).toContain('$0.00915$')
    expect(round('qc-blockade-fast').why).toContain('$0.00199$')
  })
  it('qc-trap-static: the quadrupole curvatures are 2, 2 and -4, so they sum to 0 and one direction always curves down', () => {
    const k = quadrupoleCurvatures()
    close(k[0], 2, 1e-5)
    close(k[1], 2, 1e-5)
    close(k[2], -4, 1e-5)
    close(k[0] + k[1] + k[2], 0, 1e-5)
    expect(Math.min(...k)).toBeLessThan(0)
    expect(Math.abs(V.q25EarnshawSum)).toBeLessThan(1e-9)
  })
  it('qc-cz-hot: the Cirac–Zoller Bell chance is 1.000, 0.254, 0.138 for 0, 1, 2 phonons; Mølmer–Sørensen keeps 1.000 at 4', () => {
    close(czBell(0, 8), 1, 1e-6)
    close(czBell(1, 8), 0.254153, 1e-6)
    close(czBell(2, 8), 0.138386, 1e-6)
    expect(czBell(1, 8)).toBeLessThan(0.3)
    const ms = msBell({ n0: 4, etaOmega: 0.1, delta: 1, N: 2, nmax: 14, t: msTime(25, 1) })
    close(ms, 1, 1e-6)
    expect(round('qc-cz-hot').why).toContain('$0.254$')
  })
  it('qc-ms-time: stopped at 17.36 loops the infidelity is 0.0229, at 17 whole loops it is 2.7e-4', () => {
    const base = { etaOmega: 0.12, delta: 1, N: 2, nmax: 14, n0: 0 }
    close(1 - msBell({ ...base, t: msBookTime(0.12, 1) }), 0.022874, 1e-5)
    close(1 - msBell({ ...base, t: msTime(17, 1) }), 0.0002669, 1e-6)
    close(msBookTime(0.12, 1) / msTime(1, 1), 17.36111, 1e-4)
    expect(1 - msBell({ ...base, t: msBookTime(0.12, 1) })).toBeGreaterThan(50 * (1 - msBell({ ...base, t: msTime(17, 1) })))
    close(V.q25MSloops1736, 17.36111, 1e-4)
    expect(round('qc-ms-time').why).toContain('$17.36$')
  })
})
