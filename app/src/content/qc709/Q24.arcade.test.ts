/**
 * Chapter Q24's six Arcade "Spot the error" rounds (P-Q24-story §11.2): each wrong step is recomputed through the engine here (physics/qc/blocheq.ts, pulses.ts),
 * so the correction a round states is the engine's number and the flagged step really is false (the generic checks of games.test.ts cover the shape and the
 * chapter links).
 */
import { describe, expect, it } from 'vitest'
import { apply } from '../../physics/linalg'
import { Rx } from '../../physics/qc/gates'
import { positivityMin, steadyExcited } from '../../physics/qc/blocheq'
import { compositeU, echoCoherence, errorComposite, errorPlain, gateDistance, ouCoherence, rabiU, t2star } from '../../physics/qc/pulses'
import { KET, blochVector } from '../../physics/spin'
import { QC_ERROR_ROUNDS } from './games'
import { Q24 } from './Q24'
import { V } from './Q24.values'

const close = (a: number, b: number, eps = 1e-9) => expect(Math.abs(a - b)).toBeLessThan(eps)
const round = (id: string) => QC_ERROR_ROUNDS.find((r) => r.id === id)!
const sentences = (s: string) => s.split(/(?<=[.?!])\s+(?=[A-Z$])/)
const words = (s: string) => s.split(/\s+/).filter((w) => /[\p{L}\p{N}]/u.test(w)).length

describe('Q24 Spot the error rounds', () => {
  const IDS = ['qc-t2-longer', 'qc-steady-invert', 'qc-rabi-sign', 'qc-composite-zero', 'qc-fast-noise', 'qc-echo-any']
  it('there are six, each four steps long, each training a real unit of Q24, the flagged step inside the argument', () => {
    const mine = QC_ERROR_ROUNDS.filter((r) => r.trains.lecture === 'Q24')
    expect(mine.map((r) => r.id)).toEqual(IDS)
    for (const r of mine) {
      expect(r.steps).toHaveLength(4)
      expect(Q24.units.map((u) => u.id)).toContain(r.trains.unit)
      expect(r.wrong).toBeGreaterThanOrEqual(1)
      expect(r.wrong).toBeLessThan(4)
      expect(r.id.startsWith('qc-')).toBe(true)
    }
  })
  it('every sentence of a round is at most 25 words', () => {
    for (const r of QC_ERROR_ROUNDS.filter((x) => x.trains.lecture === 'Q24'))
      for (const s of [...r.steps, r.why].flatMap(sentences)) expect(words(s), `${r.id}: ${s}`).toBeLessThanOrEqual(25)
  })
  it('qc-t2-longer: T2 = 2 T1 keeps the state positive, T2 = 3 T1 dips to -0.0096 near t = 3.2 T1', () => {
    expect(positivityMin(1, 2).min).toBeGreaterThan(-1e-9)
    const bad = positivityMin(1, 3)
    close(bad.min, -0.009556608, 1e-6)
    close(bad.at, 3.17, 0.02)
    expect(V.q24MinEig3Sign).toBe(-1)
    expect(round('qc-t2-longer').why).toContain('$-0.0096$')
  })
  it('qc-steady-invert: the steady excited share on resonance is s/(2(1+s)), 0.495 at s = 100, always below 1/2', () => {
    close(steadyExcited(0, 100), 0.4950495, 1e-6)
    close(steadyExcited(0, 3), 0.375)
    for (const s of [1, 10, 100, 1e4, 1e6]) expect(steadyExcited(0, s)).toBeLessThan(0.5)
    close(V.q24ReeRes100, 0.4950495, 1e-6)
    expect(round('qc-steady-invert').why).toContain('$0.495$')
  })
  it('qc-rabi-sign: a real positive drive gives R_x(-θ), which takes |0> to +y; R_x(θ) is 1.414 away and takes it to -y', () => {
    const U = rabiU(1, 0, Math.PI / 2)
    expect(gateDistance(U, Rx(-Math.PI / 2))).toBeLessThan(1e-12)
    close(gateDistance(U, Rx(Math.PI / 2)), Math.SQRT2, 1e-9)
    const out = blochVector(apply(U, KET['+z']))
    close(out[1], 1, 1e-9)
    const wrongOut = blochVector(apply(Rx(Math.PI / 2), KET['+z']))
    close(wrongOut[1], -1, 1e-9)
    close(V.q24SignRxPlus, Math.SQRT2, 1e-9)
    expect(round('qc-rabi-sign').why).toContain('$1.414$')
  })
  it('qc-composite-zero: the sequence is exactly R_x(π) with exact angles but still has error 0.000247 (against 0.0157 plain) at ε = 0.01', () => {
    expect(gateDistance(compositeU(0), Rx(Math.PI))).toBeLessThan(1e-9)
    close(errorPlain(0.01), 0.0157078, 1e-6)
    close(errorComposite(0.01), 0.0002467274, 1e-8)
    expect(errorComposite(0.01)).toBeGreaterThan(0)
    expect(errorComposite(0.1)).toBeGreaterThan(0)
    close(errorComposite(0.1) / errorComposite(0.01), 100, 5)
    expect(round('qc-composite-zero').why).toContain('$0.000247$')
  })
  it('qc-fast-noise: T2* is 1.448 for slow noise (τc = 10) and 10.1 for fast noise (τc = 0.1), almost seven times longer', () => {
    close(t2star(1, 10), 1.448348, 1e-4)
    close(t2star(1, 0.1), 10.1, 0.05)
    expect(t2star(1, 0.1)).toBeGreaterThan(6.9 * t2star(1, 10))
    expect(t2star(1, 0.1)).toBeLessThan(7 * t2star(1, 10))
    close(V.q24T2starFast, t2star(1, 0.1))
    expect(round('qc-fast-noise').why).toContain('$1.448$')
  })
  it('qc-echo-any: at correlation time 0.1 the echo keeps 0.844 and Ramsey 0.827 over the same time 2; at correlation time 10 it is 0.940 against 0.154', () => {
    close(echoCoherence(1, 1, 0.1), 0.8436633, 1e-6)
    close(ouCoherence(2, 1, 0.1), 0.8269591, 1e-6)
    close(echoCoherence(1, 1, 10), 0.9399845, 1e-6)
    close(ouCoherence(2, 1, 10), 0.1536504, 1e-6)
    expect(echoCoherence(1, 1, 0.1) - ouCoherence(2, 1, 0.1)).toBeLessThan(0.02)
    expect(echoCoherence(1, 1, 0.1)).toBeLessThan(1)
    expect(round('qc-echo-any').why).toContain('$0.844$')
  })
})
