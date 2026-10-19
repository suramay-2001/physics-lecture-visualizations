/**
 * The Townsend-pass engine additions for Lectures 9 and 10 (G3) against the numpy block "townsendG3" of pipeline/make_qc_fixtures.py:
 * `localBasisAmplitudes` (measure.ts; one np.kron of the conjugate-transposed basis matrices), `singletJoint`, `bellBisectGap`,
 * `differChance` (entangle.ts; the squared overlap of the singlet ket with np.kron of two +n kets) and `threeAxisTables` (bits.ts;
 * itertools.product). Plus the properties that make each readable: the squares add to 1, the chances are the engine's old readout.
 */
import { describe, expect, it } from 'vitest'
import { abs2 } from '../complex'
import { threeAxisTables } from './bits'
import { bellBisectGap, differChance, singletJoint } from './entangle'
import { localBasisAmplitudes, localBasisProbs } from './measure'
import { bell } from './state'
import { FX, cv } from './testkit'

const D = FX.townsendG3
const close = (a: number, b: number, eps = 1e-12) => expect(Math.abs(a - b), `${a} vs ${b}`).toBeLessThan(eps)

describe('localBasisAmplitudes (448 L9 x-basis picture)', () => {
  it('matches numpy: one kron of the per-wire basis changes, on the singlet and on random two- and three-qubit states', () => {
    expect(D.local.length).toBeGreaterThanOrEqual(14)
    for (const k of D.local) {
      const got = localBasisAmplitudes(cv(k.psi), [...k.bases] as ('x' | 'y' | 'z')[])
      const want = cv(k.amps)
      expect(got.length).toBe(want.length)
      got.forEach((a, i) => {
        close(a.re, want[i].re)
        close(a.im, want[i].im)
      })
    }
  })

  it('the squared sizes are localBasisProbs and add to 1; z everywhere is the state itself', () => {
    for (const k of D.local) {
      const bases = [...k.bases] as ('x' | 'y' | 'z')[]
      const amps = localBasisAmplitudes(cv(k.psi), bases)
      const p = localBasisProbs(cv(k.psi), bases)
      amps.forEach((a, i) => close(abs2(a), p[i]))
      close(amps.reduce((s, a) => s + abs2(a), 0), 1)
    }
    const psi = bell('01-10')
    localBasisAmplitudes(psi, ['z', 'z']).forEach((a, i) => close(a.re, psi[i].re))
  })

  it('names the two worked cases: the triplet |1,0> reads (1/2, 0, 0, 1/2) along x, x; the singlet (0, 1/2, 1/2, 0)', () => {
    const trip = localBasisAmplitudes(bell('01+10'), ['x', 'x']).map(abs2)
    const sing = localBasisAmplitudes(bell('01-10'), ['x', 'x']).map(abs2)
    ;[0.5, 0, 0, 0.5].forEach((v, i) => close(trip[i], v))
    ;[0, 0.5, 0.5, 0].forEach((v, i) => close(sing[i], v))
  })

  it('refuses a list of bases of the wrong length', () => {
    expect(() => localBasisAmplitudes(bell('01-10'), ['x'])).toThrow()
  })
})

describe('singletJoint, bellBisectGap, differChance (Townsend Eqs. 5.48-5.60)', () => {
  it('singletJoint = numpy |<+a,+b|singlet>|^2 and equals the closed form 1/2 sin^2((a-b)/2)', () => {
    for (const k of D.joint) {
      close(singletJoint(k.a, k.b), k.p)
      close(singletJoint(k.a, k.b), 0.5 * Math.sin((k.a - k.b) / 2) ** 2)
    }
  })

  it('bellBisectGap = numpy; largest 1/8 at 60 degrees, zero at 90 degrees, negative beyond', () => {
    for (const k of D.gap) close(bellBisectGap(k.theta), k.gap)
    close(bellBisectGap(Math.PI / 3), 1 / 8)
    close(bellBisectGap(Math.PI / 2), 0)
    expect(bellBisectGap(Math.PI)).toBeLessThan(0)
    let best = -Infinity
    let at = 0
    for (let deg = 0; deg <= 180; deg += 0.5) {
      const g = bellBisectGap((deg * Math.PI) / 180)
      if (g > best) {
        best = g
        at = deg
      }
    }
    close(at, 60, 1e-9)
    close(best, 1 / 8)
  })

  it('differChance = numpy and cos^2 of half the angle', () => {
    for (const k of D.differ) {
      close(differChance(k.deg), k.p)
      close(differChance(k.deg), Math.cos((k.deg * Math.PI) / 360) ** 2)
    }
    close(differChance(120), 0.25)
  })
})

describe('threeAxisTables (Townsend Eq. 5.41)', () => {
  it('matches itertools.product: eight tables in his order, 1 for the two uniform ones and 1/3 for the other six', () => {
    const got = threeAxisTables()
    expect(got.length).toBe(8)
    got.forEach((t, i) => {
      expect([...t.signs]).toEqual(D.tables[i].signs)
      close(t.differFraction, D.tables[i].differFraction)
    })
    expect(got.filter((t) => t.differFraction === 1).length).toBe(2)
    expect(got.filter((t) => Math.abs(t.differFraction - 1 / 3) < 1e-12).length).toBe(6)
    close(got.reduce((s, t) => s + t.differFraction, 0) / 8, 0.5)
  })
})
