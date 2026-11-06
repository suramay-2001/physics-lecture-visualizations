/**
 * Chapter Q23's six Arcade "Spot the error" rounds (P-Q23-story §11.2): each wrong step is recomputed through the engine here (physics/qc/infoq.ts, density.ts),
 * so the correction a round states is the engine's number and the flagged step really is false (the generic checks of games.test.ts cover the shape and the
 * chapter links).
 */
import { describe, expect, it } from 'vitest'
import { densityOf, partialTrace, vonNeumann } from '../../physics/qc/density'
import {
  accessibleProjective,
  classicalFidelity,
  dephasedBell,
  fidelityAngleDeg,
  holevoChi,
  mutualInfoPovm,
  quantumMutualInfo,
  relEntropy,
} from '../../physics/qc/infoq'
import { bell, ket } from '../../physics/qc/state'
import { QC_ERROR_ROUNDS } from './games'
import { Q23 } from './Q23'
import { V } from './Q23.values'

const close = (a: number, b: number, eps = 1e-9) => expect(Math.abs(a - b)).toBeLessThan(eps)
const round = (id: string) => QC_ERROR_ROUNDS.find((r) => r.id === id)!
const sentences = (s: string) => s.split(/(?<=[.?!])\s+(?=[A-Z$])/)
const words = (s: string) => s.split(/\s+/).filter((w) => /[\p{L}\p{N}]/u.test(w)).length

const P = [0.5, 0.5]
const Q = [0.9, 0.1]
const R = [0.7, 0.3]
const BELL = bell('00+11')
const PS2 = [0.5, 0.5]
const PAIR = [densityOf(ket('0')), densityOf(ket('+'))]
const BB84_PS = [0.25, 0.25, 0.25, 0.25]
const BB84 = ['0', '1', '+', '-'].map((k) => densityOf(ket(k)))
const Z_BASIS = [densityOf(ket('0')), densityOf(ket('1'))]

describe('Q23 Spot the error rounds', () => {
  const IDS = ['qc-rel-distance', 'qc-fid-metric', 'qc-whole-part', 'qc-local-noise', 'qc-holevo-reach', 'qc-bb84-full']
  it('there are six, each four steps long, each training a real unit of Q23, the flagged step inside the argument', () => {
    const mine = QC_ERROR_ROUNDS.filter((r) => r.trains.lecture === 'Q23')
    expect(mine.map((r) => r.id)).toEqual(IDS)
    for (const r of mine) {
      expect(r.steps).toHaveLength(4)
      expect(Q23.units.map((u) => u.id)).toContain(r.trains.unit)
      expect(r.wrong).toBeGreaterThanOrEqual(1)
      expect(r.wrong).toBeLessThan(4)
      expect(r.id.startsWith('qc-')).toBe(true)
    }
  })
  it('every sentence of a round is at most 25 words', () => {
    for (const r of QC_ERROR_ROUNDS.filter((x) => x.trains.lecture === 'Q23'))
      for (const s of [...r.steps, r.why].flatMap(sentences)) expect(words(s), `${r.id}: ${s}`).toBeLessThanOrEqual(25)
  })
  it('qc-rel-distance: H(p||q) = 0.737 bits but H(q||p) = 0.531 bits, so it is not symmetric', () => {
    close(relEntropy(P, Q), 0.7369656, 1e-6)
    close(relEntropy(Q, P), 0.5310044, 1e-6)
    expect(Math.abs(relEntropy(P, Q) - relEntropy(Q, P))).toBeGreaterThan(0.2)
    close(relEntropy(P, P), 0)
    expect(V.q23Hpq).toBe(relEntropy(P, Q))
    expect(round('qc-rel-distance').why).toContain('0.531')
    expect(round('qc-rel-distance').steps[1]).toContain('0.737')
  })
  it('qc-fid-metric: 1 - F breaks the triangle rule through r = (0.7, 0.3) (0.106 against 0.054) while the angle keeps it (26.57 = 11.79 + 14.78)', () => {
    const direct = 1 - classicalFidelity(P, Q)
    const detour = 1 - classicalFidelity(P, R) + (1 - classicalFidelity(R, Q))
    close(direct, 0.10557, 1e-4)
    close(detour, 0.05418, 1e-4)
    expect(direct).toBeGreaterThan(detour)
    close(fidelityAngleDeg(P, Q), 26.56505, 1e-4)
    close(fidelityAngleDeg(P, R) + fidelityAngleDeg(R, Q), fidelityAngleDeg(P, Q), 1e-9)
    close(classicalFidelity(P, P), 1)
    expect(round('qc-fid-metric').why).toContain('26.57')
  })
  it('qc-whole-part: a Bell pair has S = 0, one of its qubits has S = 1 bit', () => {
    close(vonNeumann(densityOf(BELL)), 0)
    close(vonNeumann(partialTrace(densityOf(BELL), [1])), 1)
    expect(vonNeumann(densityOf(BELL))).toBeLessThan(vonNeumann(partialTrace(densityOf(BELL), [1])))
    expect(V.q23SBell).toBeLessThan(1e-9)
    close(V.q23SBellA, 1)
  })
  it('qc-local-noise: dephasing one half of a Bell pair with chance 0.1 lowers S(A:B) from 2 to 1.531', () => {
    close(quantumMutualInfo(BELL), 2)
    close(quantumMutualInfo(dephasedBell(0.1)), 1.531, 1e-3)
    close(quantumMutualInfo(BELL) - quantumMutualInfo(dephasedBell(0.1)), 0.4689956, 1e-6)
    for (const p of [0.05, 0.1, 0.25, 0.5]) expect(quantumMutualInfo(dephasedBell(p))).toBeLessThanOrEqual(quantumMutualInfo(BELL) + 1e-9)
    expect(round('qc-local-noise').why).toContain('$0.469$')
  })
  it('qc-holevo-reach: for |0>, |+> chi = 0.601, along z Bob gets 0.311 and his best projective measurement 0.399, both below chi', () => {
    const chi = holevoChi(PS2, PAIR)
    close(chi, 0.600876, 1e-6)
    close(mutualInfoPovm(PS2, PAIR, Z_BASIS), 0.3112781, 1e-6)
    const best = accessibleProjective(PS2, PAIR, 3601)
    close(best.I, 0.399124, 1e-6)
    expect(best.I).toBeLessThan(chi - 0.1)
    expect(V.q23IBestZP).toBe(best.I)
    expect(round('qc-holevo-reach').steps[0]).toContain('0.601')
    expect(round('qc-holevo-reach').steps[2]).toContain('0.311')
    expect(round('qc-holevo-reach').why).toContain('0.399')
  })
  it('qc-bb84-full: the BB84 ensemble has chi = 1, but reading along z gives 0.5 bit and so does the best axis', () => {
    close(holevoChi(BB84_PS, BB84), 1, 1e-9)
    close(mutualInfoPovm(BB84_PS, BB84, Z_BASIS), 0.5, 1e-9)
    close(accessibleProjective(BB84_PS, BB84, 3601).I, 0.5, 1e-9)
    close(V.q23IBB84z, 0.5)
    expect(round('qc-bb84-full').why).toContain('$0.5$')
  })
})
