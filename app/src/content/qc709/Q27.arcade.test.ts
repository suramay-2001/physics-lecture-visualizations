/**
 * Chapter Q27's four Arcade "Spot the error" rounds (P-Q27-story §11.2): each wrong step is recomputed through the engine here (physics/qc/solid.ts), so the
 * correction a round states is the engine's number and the flagged step really is false (the generic checks of games.test.ts cover the shape and the chapter links).
 */
import { describe, expect, it } from 'vitest'
import { E_CHARGE, H_PLANCK } from '../../physics/constants'
import { anharmonicity, chargeDispersion, exchangeEnergies, fluxQuantum, leakRatio, oscillatorLevels } from '../../physics/qc/solid'
import { QC_ERROR_ROUNDS } from './games'
import { Q27 } from './Q27'
import { V } from './Q27.values'

const close = (a: number, b: number, eps = 1e-9) => expect(Math.abs(a - b)).toBeLessThan(eps)
const round = (id: string) => QC_ERROR_ROUNDS.find((r) => r.id === id)!
const sentences = (s: string) => s.split(/(?<=[.?!])\s+(?=[A-Z$])/)
const words = (s: string) => s.split(/\s+/).filter((w) => /[\p{L}\p{N}]/u.test(w)).length

describe('Q27 Spot the error rounds', () => {
  const IDS = ['qc-lc-qubit', 'qc-flux-h-over-e', 'qc-transmon-anharm', 'qc-dot-dipole']
  it('there are four, each four steps long, each training a real unit of Q27, the flagged step inside the argument', () => {
    const mine = QC_ERROR_ROUNDS.filter((r) => r.trains.lecture === 'Q27')
    expect(mine.map((r) => r.id)).toEqual(IDS)
    for (const r of mine) {
      expect(r.steps).toHaveLength(4)
      expect(Q27.units.map((u) => u.id)).toContain(r.trains.unit)
      expect(r.wrong).toBeGreaterThanOrEqual(1)
      expect(r.wrong).toBeLessThan(4)
      expect(r.id.startsWith('qc-')).toBe(true)
    }
  })
  it('every sentence of a round is at most 25 words', () => {
    for (const r of QC_ERROR_ROUNDS.filter((x) => x.trains.lecture === 'Q27'))
      for (const s of [...r.steps, r.why].flatMap(sentences)) expect(words(s), `${r.id}: ${s}`).toBeLessThanOrEqual(25)
  })
  it('qc-lc-qubit: the LC rungs are equally spaced (n + 1/2), so the 1 → 2 step is driven √2 = 1.414 times more strongly than 0 → 1', () => {
    const lv = oscillatorLevels(3e-9, 0.3e-12)
    for (let n = 0; n < 4; n++) close(lv[n + 1] - lv[n], 1, 1e-9)
    close(leakRatio(), Math.SQRT2, 1e-9)
    close(V.q27LeakRatio, 1.414214, 1e-6)
    expect(round('qc-lc-qubit').why).toContain('= 1.414$')
  })
  it('qc-flux-h-over-e: the flux quantum is h/2e = 2.068e-15 Wb, half of h/e', () => {
    close(fluxQuantum(), H_PLANCK / (2 * E_CHARGE), 1e-30)
    close(fluxQuantum() * 1e15, 2.067834, 1e-5)
    close(H_PLANCK / E_CHARGE / fluxQuantum(), 2, 1e-12)
    close(V.q27Phi0, 2.067834, 1e-5)
    expect(round('qc-flux-h-over-e').why).toContain('2.068')
  })
  it('qc-transmon-anharm: |α| = 0.0457 at E_J/E_C = 20 (0.0696 at 10), a fall of 1.52, while the charge dependence falls 967 times', () => {
    close(Math.abs(anharmonicity(20)), 0.045746, 1e-5)
    close(Math.abs(anharmonicity(10)), 0.069556, 1e-5)
    close(Math.abs(anharmonicity(10) / anharmonicity(20)), 1.52, 5e-3)
    close(Math.abs(chargeDispersion(10) / chargeDispersion(20)), 966.8, 0.2)
    expect(Math.abs(anharmonicity(20))).toBeLessThan(0.1) // far below "tens of percent"
    close(V.q27AnhRatio1020, 1.52, 5e-3)
    close(V.q27DispRatio1020, 966.8, 0.2)
    expect(round('qc-transmon-anharm').why).toContain('$-0.0457$')
  })
  it('qc-dot-dipole: with exchange D = 1, K = 0.1 the singlet state sits at 1.1 and the triplet at 0.9, a gap of 2K', () => {
    const e = exchangeEnergies(1, 0.1)
    close(e.singlet, 1.1, 1e-9)
    close(e.triplet, 0.9, 1e-9)
    close(e.singlet - e.triplet, 0.2, 1e-9)
    close(V.q27ES, 1.1, 1e-9)
    close(V.q27ET, 0.9, 1e-9)
    expect(round('qc-dot-dipole').why).toContain('$1.1$')
  })
})
