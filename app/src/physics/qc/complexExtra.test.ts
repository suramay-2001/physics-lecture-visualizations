/**
 * complexExtra.ts against python (block "complex": (1 + 1j·φ/n)**n by Python's complex power, and
 * np.sum(a·exp(1j·φ)) for phasor sums), plus the F1 limits: (1 + iφ/n)ⁿ → e^{iφ}; evenly spread phasors cancel.
 */
import { describe, expect, it } from 'vitest'
import { abs, expi, sub } from '../complex'
import { eulerLimit, eulerPath, phasorPath, phasorSum } from './complexExtra'
import { FX, cz } from './testkit'

const D = FX.complex

describe('F1: e^{iφ} as a limit and interference as a sum of arrows', () => {
  it('eulerLimit(φ, n) = python (1 + iφ/n)**n for n = 1 … 1000 (relative 1e-12)', () => {
    for (const k of D.euler) {
      const z = eulerLimit(k.phi, k.n)
      expect(abs(sub(z, cz(k.value))) / Math.max(1, abs(cz(k.value)))).toBeLessThan(1e-12)
    }
  })

  it('the error |(1 + iφ/n)ⁿ − e^{iφ}| shrinks with n (like φ²/2n); e^{iπ} = −1 is the limit at φ = π', () => {
    for (const phi of [Math.PI, 1, -2.5]) {
      const errs = [1, 10, 100, 1000, 10000].map((n) => abs(sub(eulerLimit(phi, n), expi(phi))))
      errs.slice(1).forEach((e, i) => expect(e).toBeLessThan(errs[i]))
      expect(errs[4]).toBeLessThan((phi * phi) / 10000)
    }
    expect(abs(sub(eulerLimit(Math.PI, 100000), expi(Math.PI)))).toBeLessThan(1e-4)
  })

  it('eulerPath has n + 1 corners ending at eulerLimit', () => {
    const path = eulerPath(2, 50)
    expect(path.length).toBe(51)
    expect(abs(sub(path[50], eulerLimit(2, 50)))).toBeLessThan(1e-13)
  })

  it('phasorSum = np.sum(a·e^{iφ}); five evenly spread unit arrows cancel; phasorPath ends at the sum', () => {
    const P = D.phasor
    expect(abs(sub(phasorSum(P.phases, P.amps), cz(P.sum)))).toBeLessThan(1e-13)
    expect(abs(sub(phasorSum(P.phases), cz(P.unitSum)))).toBeLessThan(1e-13)
    expect(abs(phasorSum(P.spread))).toBeLessThan(1e-14)
    expect(abs(cz(P.spreadSum))).toBeLessThan(1e-14)
    const path = phasorPath(P.phases, P.amps)
    expect(abs(sub(path.at(-1)!, phasorSum(P.phases, P.amps)))).toBeLessThan(1e-14)
    expect(() => eulerLimit(1, 0)).toThrow()
  })
})
