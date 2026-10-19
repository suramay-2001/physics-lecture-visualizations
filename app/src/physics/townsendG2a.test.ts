/**
 * Engine addition of the 448 Townsend pass, group G2a (Lectures 5-6) against its numpy twin
 * (pipeline/claims_448/g2a.py -> __fixtures__/claims-448/g2a.json `cases`): `portProbs` in `spin.ts`, the two-arm spin interferometer.
 */
import { describe, expect, it } from 'vitest'
import fx from './__fixtures__/claims-448/g2a.json'
import { KET, ketFromBloch, portProbs } from './spin'
import type { Vec } from './linalg'

const close = (a: number, b: number, eps = 1e-12) => expect(Math.abs(a - b), `${a} vs ${b}`).toBeLessThan(eps)
const ketOf = (name: string): Vec => (name === 'bloch(50,30)' ? ketFromBloch((50 * Math.PI) / 180, (30 * Math.PI) / 180) : KET[name as keyof typeof KET])

describe('spin.ts portProbs: the two ports of a spin interferometer (Townsend Ch. 2)', () => {
  it.each(fx.cases.portProbs)('agrees with the matrix twin: $ket at $phiDeg degrees', (k) => {
    const p = portProbs(ketOf(k.ket), k.phiDeg)
    close(p.plus, k.plus)
    close(p.minus, k.minus)
  })

  it('the two ports share the beam: the chances add to 1', () => {
    for (const phi of [0, 17, 90, 150, 333, 720]) {
      const p = portProbs(ketFromBloch(1.1, 0.7), phi)
      close(p.plus + p.minus, 1)
    }
  })

  it('for |+x> the + port reads (1 + cos(phi/2))/2, so a full turn of 360 degrees sends everything to the other port', () => {
    for (const phi of [0, 60, 150, 240, 300]) close(portProbs(KET['+x'], phi).plus, (1 + Math.cos((phi * Math.PI) / 360)) / 2)
    close(portProbs(KET['+x'], 360).plus, 0)
    close(portProbs(KET['+x'], 720).plus, 1)
  })

  it('an eigenstate of R_z only picks up a phase, but the other arm gives it something to interfere with: P+ = cos^2(phi/4)', () => {
    for (const phi of [30, 123, 300]) close(portProbs(KET['+z'], phi).plus, Math.cos((phi * Math.PI) / 720) ** 2)
  })
})
