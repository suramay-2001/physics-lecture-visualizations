/**
 * complexExtra.ts against python (block "complex": (1 + 1j·φ/n)**n by Python's complex power, and
 * np.sum(a·exp(1j·φ)) for phasor sums), plus the F1 limits: (1 + iφ/n)ⁿ → e^{iφ}; evenly spread phasors cancel.
 */
import { describe, expect, it } from 'vitest'
import { I, abs, c, expi, sub } from '../complex'
import { cexpSeries, eulerLimit, eulerPath, phasorPath, phasorSum, rootsOfUnity } from './complexExtra'
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

describe('G1 cexpSeries and G2 rootsOfUnity (the stage-kind batch)', () => {
  it('cexpSeries(z, K) = python Σ_{k<K} z**k/k! (relative 1e-12), and tends to e^z', () => {
    expect(D.series.length).toBe(35)
    for (const k of D.series) {
      const got = cexpSeries(cz(k.z), k.K)
      expect(abs(sub(got, cz(k.value))) / Math.max(1, abs(cz(k.value))), `z=${k.z} K=${k.K}`).toBeLessThan(1e-12)
      if (k.K === 30) expect(abs(sub(got, cz(k.limit))), `z=${k.z}: 30 terms reach e^z`).toBeLessThan(1e-9)
    }
  })
  it('the F1 numbers: at iπ, 10 terms give −0.9760 + 0.0069i and 20 give −1.0000; K = 0 is 0; bad K throws', () => {
    const z = c(0, Math.PI)
    const s10 = cexpSeries(z, 10)
    expect([+s10.re.toFixed(4), +s10.im.toFixed(4)]).toEqual([-0.976, 0.0069])
    expect(+cexpSeries(z, 20).re.toFixed(4)).toBe(-1)
    expect(abs(sub(cexpSeries(I, 25), expi(1)))).toBeLessThan(1e-15)
    expect(cexpSeries(z, 0)).toEqual(c(0))
    expect(() => cexpSeries(z, 1.5)).toThrow()
    expect(() => cexpSeries(z, -1)).toThrow()
  })
  it('rootsOfUnity(N) = np.exp(2j·π·k/N) (1e-14); each has size 1 and the N-th power 1; they sum to 0 for N ≥ 2', () => {
    for (const r of D.roots) {
      const got = rootsOfUnity(r.N)
      expect(got.length).toBe(r.N)
      got.forEach((w, k) => {
        expect(abs(sub(w, cz(r.roots[k])))).toBeLessThan(1e-14)
        expect(Math.abs(abs(w) - 1)).toBeLessThan(1e-15)
      })
      const sum = phasorSum(got.map((w) => Math.atan2(w.im, w.re)))
      if (r.N >= 2) expect(abs(sum)).toBeLessThan(1e-12)
      expect(abs(sub(sum, cz(r.sum)))).toBeLessThan(1e-12)
    }
    expect(rootsOfUnity(1)).toEqual([c(1, 0)])
    expect(() => rootsOfUnity(0)).toThrow()
  })
})
