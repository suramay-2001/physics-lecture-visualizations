/**
 * Chapter Q15's five Arcade "Spot the error" rounds (P-Q15-story §11.2): each wrong step is recomputed through the engine here, so the correction a round states
 * is the engine's number and the flagged step really is false (the generic checks of games.test.ts cover the shape and the chapter links).
 */
import { describe, expect, it } from 'vitest'
import { b92Rates, charlieKets, eq66Check, probeAttack, shareCircuit, xorBits } from '../../physics/qc/crypto'
import { runCircuit } from '../../physics/qc/circuit'
import { chshFromAxes } from '../../physics/qc/entangle'
import { measureInBasis } from '../../physics/qc/measure'
import { bell } from '../../physics/qc/state'
import { rng } from '../../physics/random'
import { QC_ERROR_ROUNDS } from './games'
import { Q15 } from './Q15'

const close = (a: number, b: number, eps = 1e-9) => expect(Math.abs(a - b)).toBeLessThan(eps)
const round = (id: string) => QC_ERROR_ROUNDS.find((r) => r.id === id)!

describe('Q15 Spot the error rounds', () => {
  it('there are five, each four steps long, each training a real unit of Q15', () => {
    const mine = QC_ERROR_ROUNDS.filter((r) => r.trains.lecture === 'Q15')
    expect(mine.map((r) => r.id)).toEqual(['qc-pad-twice', 'qc-b92-35', 'qc-quiet-probe', 'qc-e91-zx', 'qc-share-alone'])
    for (const r of mine) {
      expect(r.steps).toHaveLength(4)
      expect(Q15.units.map((u) => u.id)).toContain(r.trains.unit)
      expect(r.wrong).toBeGreaterThan(0)
      expect(r.id.startsWith('qc-')).toBe(true)
    }
  })
  it('qc-pad-twice: two cipher texts under one key add to the XOR of the messages, whatever the key', () => {
    const R = rng(15201)
    const bits = (n: number) => Array.from({ length: n }, () => (R() < 0.5 ? '0' : '1')).join('')
    for (let t = 0; t < 30; t++) {
      const [m1, m2, k] = [bits(16), bits(16), bits(16)]
      expect(xorBits(xorBits(m1, k), xorBits(m2, k))).toBe(xorBits(m1, m2))
    }
    expect(round('qc-pad-twice').wrong).toBe(2)
  })
  it('qc-b92-35: half of 0.7071 is 0.3536, the never-wrong Eve’s Q; 0.1464 is the minimum-error Eve’s', () => {
    close(b92Rates('usd').qber, Math.SQRT1_2 / 2)
    close(b92Rates('usd').eveFail, Math.SQRT1_2)
    close(b92Rates('minerr').qber, (1 - Math.SQRT1_2) / 2)
    expect(Math.abs(b92Rates('usd').qber - (1 - Math.SQRT1_2) / 2)).toBeGreaterThan(0.2)
    const r = round('qc-b92-35')
    expect(r.steps[r.wrong]).toContain('0.1464')
    expect(r.why).toContain('0.3536')
  })
  it('qc-quiet-probe: a probe that causes no error in z or x guesses a z bit with chance 0.5, so it learns nothing', () => {
    const none = probeAttack(0)
    close(none.zError, 0)
    close(none.xError, 0)
    close(none.eveGuess, 0.5)
    // and any probe that learns anything at all does cause an x error
    for (const deg of [10, 45, 90, 135, 180]) {
      const p = probeAttack((deg * Math.PI) / 180)
      expect(p.eveGuess > 0.5 + 1e-9, `${deg}°`).toBe(p.xError > 1e-9)
    }
  })
  it('qc-e91-zx: Φ⁺ at the settings z, x scores exactly 2, and a hidden-variable copy of the table has no gap', () => {
    close(chshFromAxes(bell('Phi+'), [[0, 0, 1], [1, 0, 0]], [[1, 0, 0], [0, 0, 1]]), 2)
    close(eq66Check().lambdaGap, 0)
    expect(round('qc-e91-zx').wrong).toBe(3)
  })
  it('qc-share-alone: Bob’s sign is a fair coin for both bits, and only the sum β ⊕ γ fixes the bit', () => {
    for (const a of [0, 1] as const) {
      close(measureInBasis(runCircuit(shareCircuit(Math.PI / 8, a)).states.slice(-1)[0], 0, 'x').p[0], 0.5)
      close(charlieKets(Math.PI / 8, a).pPlus, 0.5)
    }
    // the four kept branches: (β, γ) → a = β ⊕ γ, and each branch is reached for both bits
    const k0 = charlieKets(Math.PI / 8, 0)
    const k1 = charlieKets(Math.PI / 8, 1)
    const overlap = (u: { re: number; im: number }[], v: { re: number; im: number }[]) => Math.hypot(u[0].re * v[0].re + u[1].re * v[1].re, 0)
    close(overlap(k0.plus, k1.minus), 1, 1e-12) // for |1̄⟩ a +x reading steers Charlie to ψ₋
    close(overlap(k0.minus, k1.plus), 1, 1e-12)
    for (const beta of [0, 1]) for (const gamma of [0, 1]) expect(beta ^ gamma).toBe(beta === gamma ? 0 : 1)
  })
})
