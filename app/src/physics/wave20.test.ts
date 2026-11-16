/**
 * Lecture 20's engine (physics/wave20.ts) against pipeline/make_fixtures.py `lecture19_20_cases` (physics/__fixtures__/numpy.json, key lecture19_20): scipy brentq on a fine scan of the two
 * smooth matching forms, a finite-difference Hamiltonian (2e-4 on levels well below the top), scipy quad of the unnormalised state; plus the identities (k² + κ² = 2V₀, the level count,
 * normalisation to 1, the mismatch vanishing at each level and only at its own parity).
 */
import { describe, expect, it } from 'vitest'
import fixtures from './__fixtures__/numpy.json'
import { wellCount, wellLevels, wellMismatch, wellNorm, wellStateSamples, wellTail } from './wave20'

const wells = fixtures.lecture19_20.wells
const close = (a: number, b: number, eps: number, msg = '') => expect(Math.abs(a - b), `${msg} ${a} vs ${b}`).toBeLessThan(eps)

describe('wellLevels', () => {
  for (const w of wells) {
    it(`V0 = ${w.V0}, a = ${w.a}: ${w.count} levels, the energies of brentq to 1e-9, of the finite-difference Hamiltonian to 2e-4`, () => {
      const lv = wellLevels(w.V0, w.a)
      expect(lv.length).toBe(w.count)
      expect(wellCount(w.V0, w.a)).toBe(w.count)
      lv.forEach((l, i) => {
        expect(l.n).toBe(i + 1)
        expect(l.parity).toBe(w.levels[i].parity)
        expect(l.parity).toBe(i % 2 === 0 ? 'even' : 'odd')
        close(l.E, w.levels[i].E, 1e-9, `E${l.n}`)
        close(l.k * l.k + l.kappa * l.kappa, 2 * w.V0, 1e-9, 'k² + κ²')
        close(l.k * l.k / 2, l.E, 1e-12)
        if (l.kappa >= 1) close(l.E, w.fd[i].E, 2e-4, `FD E${l.n}`)
      })
    })
  }
  it('the check values: V0 = 8, a = 2 gives 0.7842 (even), 3.0618 (odd), 6.4631 (even)', () => {
    const lv = wellLevels(8, 2)
    expect(lv.map((l) => l.parity)).toEqual(['even', 'odd', 'even'])
    close(lv[0].E, 0.7842, 5e-5)
    close(lv[1].E, 3.0618, 5e-5)
    close(lv[2].E, 6.4631, 5e-5)
  })
  it('the count is ⌈a√(2V0)/π⌉ and equals the roots found, over a grid; the levels rise and stay below V0', () => {
    for (const V0 of [0.3, 1, 2.5, 8]) for (const a of [0.1, 1, 2, 3.7, 6]) {
      const lv = wellLevels(V0, a)
      expect(lv.length).toBe(wellCount(V0, a))
      expect(lv.length).toBeGreaterThanOrEqual(1)
      lv.forEach((l, i) => {
        expect(l.E).toBeGreaterThan(0)
        expect(l.E).toBeLessThan(V0)
        if (i) expect(l.E).toBeGreaterThan(lv[i - 1].E)
      })
    }
  })
  it('a level exactly at the top is not bound: a√(2V0) = 2π keeps two levels', () => {
    expect(wellCount(2, Math.PI)).toBe(2) // z0 = π, a√(2V0) = 2π
    expect(wellLevels(2, Math.PI).length).toBe(2)
  })
  it('refuses a non-positive V0 or a', () => {
    expect(() => wellLevels(0, 1)).toThrow()
    expect(() => wellCount(1, 0)).toThrow()
  })
})

describe('wellMismatch', () => {
  for (const w of wells) {
    it(`V0 = ${w.V0}, a = ${w.a}: matches the numpy closed form and lies in [−1, 1]`, () => {
      for (const m of w.mismatch) {
        close(wellMismatch(m.E, w.V0, w.a, 'even'), m.even, 1e-12)
        close(wellMismatch(m.E, w.V0, w.a, 'odd'), m.odd, 1e-12)
        expect(Math.abs(m.even)).toBeLessThanOrEqual(1 + 1e-12)
        expect(Math.abs(m.odd)).toBeLessThanOrEqual(1 + 1e-12)
      }
    })
  }
  it('vanishes at each level for its own parity, and not for the other', () => {
    for (const l of wellLevels(8, 2)) {
      close(wellMismatch(l.E, 8, 2, l.parity), 0, 1e-12)
      expect(Math.abs(wellMismatch(l.E, 8, 2, l.parity === 'even' ? 'odd' : 'even'))).toBeGreaterThan(0.05)
    }
  })
  it('the even form starts at +1 at E = 0 (k = 0, κ = √(2V0))', () => {
    close(wellMismatch(0, 8, 2, 'even'), 1, 1e-12)
  })
})

describe('wellStateSamples, wellTail, wellNorm', () => {
  for (const w of wells) {
    it(`V0 = ${w.V0}, a = ${w.a}: ψ and the tail agree with scipy quad (1e-9) and the finite-difference eigenvector (2e-4)`, () => {
      for (const s of w.states) {
        const psi = wellStateSamples(s.xs, w.V0, w.a, s.n)
        s.xs.forEach((_, j) => close(psi[j], s.psi[j], 1e-9, `n=${s.n} x=${s.xs[j]}`))
        close(wellTail(w.V0, w.a, s.n), s.tail, 1e-9, `tail n=${s.n}`)
        if (wellLevels(w.V0, w.a)[s.n - 1].kappa >= 1) close(wellTail(w.V0, w.a, s.n), w.fd[s.n - 1].tail, 2e-4, `FD tail n=${s.n}`)
        close(wellNorm(w.V0, w.a, s.n), 1, 1e-6, `norm n=${s.n}`)
      }
    })
  }
  it('the ground state of V0 = 8, a = 2 has tail 0.0204; even states are symmetric, odd ones antisymmetric, odd positive at x > 0', () => {
    close(wellTail(8, 2, 1), 0.0204, 5e-5)
    const xs = [0.2, 0.9, 1.4, 2.5]
    const neg = xs.map((x) => -x)
    for (const n of [1, 2, 3]) {
      const p = wellStateSamples(xs, 8, 2, n)
      const m = wellStateSamples(neg, 8, 2, n)
      const sign = n % 2 === 1 ? 1 : -1
      xs.forEach((_, j) => close(m[j], sign * p[j], 1e-14))
    }
    expect(wellStateSamples([0.3], 8, 2, 2)[0]).toBeGreaterThan(0)
    expect(wellStateSamples([0], 8, 2, 1)[0]).toBeGreaterThan(0)
  })
  it('ψ and ψ′ are continuous at the wall (finite differences)', () => {
    const h = 1e-6
    for (const n of [1, 2, 3]) {
      const w = wellStateSamples([1 - 2 * h, 1 - h, 1 + h, 1 + 2 * h], 8, 2, n)
      close((w[1] - w[0]) / h, (w[3] - w[2]) / h, 1e-3)
      close(w[1], w[2], 1e-5)
    }
  })
  it('a level that is not bound throws', () => {
    expect(() => wellStateSamples([0], 8, 2, 4)).toThrow()
    expect(() => wellTail(8, 2, 0)).toThrow()
  })
})
