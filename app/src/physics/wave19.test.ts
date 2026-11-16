/**
 * Lecture 19's engine (physics/wave19.ts) against the numpy cases of pipeline/make_fixtures.py `lecture19_20_cases` (physics/__fixtures__/numpy.json, key lecture19_20): the four matching
 * conditions solved as a 4 x 4 complex system, plus the identities the state must satisfy (R + T = 1, continuity of ψ and ψ′ at both edges, the closed-form T of physics/scatter.ts).
 */
import { describe, expect, it } from 'vitest'
import fixtures from './__fixtures__/numpy.json'
import { abs2 } from './complex'
import { barrierT } from './scatter'
import { M_ELECTRON } from './constants'
import { momentumAverage } from './wave18'
import {
  M_PROTON, barrierFringes, barrierLeftCurrent, barrierStateSamples, barrierTEv, coulombTurningPoint, deltaBarrierT, deltaLimitT, filteredKineticMean, gamowExponent, gamowExponentQuad,
  kappaPerAngstrom, macroKappaA, matchResidual, regionEnergies, transmissionAmplitude,
} from './wave19'

const cases = fixtures.lecture19_20.barrier
const close = (a: number, b: number, eps: number, msg = '') => expect(Math.abs(a - b), `${msg} ${a} vs ${b}`).toBeLessThan(eps)

describe('transmissionAmplitude against np.linalg.solve of the matching conditions', () => {
  for (const cs of cases) {
    it(`E = ${cs.E}, V0 = ${cs.V0}, a = ${cs.a}`, () => {
      const t = transmissionAmplitude(cs.E, cs.V0, cs.a)
      for (const [name, got, want] of [['r', t.r, cs.r], ['A', t.A, cs.A], ['B', t.B, cs.B], ['tau', t.tau, cs.tau]] as const) {
        close(got.re, want.re, 1e-9, `${name}.re`)
        close(got.im, want.im, 1e-9, `${name}.im`)
      }
      close(t.R, cs.R, 1e-9)
      close(t.T, cs.T, 1e-9)
      close(t.R + t.T, 1, 1e-12, 'R + T')
    })
    it(`samples of the state agree with the numpy ψ (E = ${cs.E}, a = ${cs.a})`, () => {
      const w = barrierStateSamples(cs.xs, cs.E, cs.V0, cs.a)
      cs.xs.forEach((_, j) => {
        close(w.re[j], cs.re[j], 1e-9, `re ${j}`)
        close(w.im[j], cs.im[j], 1e-9, `im ${j}`)
      })
    })
  }
  it('the check values: k = κ = 2, a = 1/2 gives |τ| = 0.6481, T = 0.4200', () => {
    const t = transmissionAmplitude(2, 4, 0.5)
    close(Math.sqrt(abs2(t.tau)), 0.6481, 5e-5)
    close(t.T, 0.42, 5e-5)
    close(t.T, 1 / Math.cosh(1) ** 2, 1e-12) // E = V0/2: T = 1/cosh²(κa)
  })
  it('T is the closed form of physics/scatter.ts barrierT over a grid of energies and widths', () => {
    for (const V0 of [1, 4, 8]) for (const f of [0.05, 0.3, 0.5, 0.8, 0.97]) for (const a of [0.1, 0.7, 2, 4]) {
      const E = f * V0
      close(transmissionAmplitude(E, V0, a).T, barrierT(E, V0, a), 1e-9, `E=${E} V0=${V0} a=${a}`)
    }
  })
  it('refuses E outside (0, V0) and a <= 0', () => {
    expect(() => transmissionAmplitude(4, 4, 1)).toThrow()
    expect(() => transmissionAmplitude(0, 4, 1)).toThrow()
    expect(() => transmissionAmplitude(2, 4, 0)).toThrow()
  })
})

describe('barrierStateSamples: the state joins smoothly and carries one current', () => {
  it('ψ and ψ′ are continuous at x = 0 and x = a (finite differences)', () => {
    for (const [E, V0, a] of [[2, 4, 0.5], [1, 4, 2], [7, 8, 0.3]]) {
      const h = 1e-6
      for (const edge of [0, a]) {
        const w = barrierStateSamples([edge - 2 * h, edge - h, edge + h, edge + 2 * h], E, V0, a)
        // each side's slope from its two points; the values at the edge from the same pair
        const sl = (i: number, j: number) => [(w.re[j] - w.re[i]) / h, (w.im[j] - w.im[i]) / h]
        const left = sl(0, 1)
        const right = sl(2, 3)
        close(left[0], right[0], 2e-4)
        close(left[1], right[1], 2e-4)
        close(w.re[1], w.re[2], 1e-5)
        close(w.im[1], w.im[2], 1e-5)
      }
    }
  })
  it('the density far left oscillates between (1 − |r|)² and (1 + |r|)², far right it is |τ|²', () => {
    const t = transmissionAmplitude(1, 4, 1)
    const xs = Array.from({ length: 4001 }, (_, j) => -40 + j * 0.01)
    const w = barrierStateSamples(xs, 1, 4, 1)
    const d = Array.from(xs, (_, j) => w.re[j] ** 2 + w.im[j] ** 2)
    const r = Math.sqrt(t.R)
    close(Math.max(...d), (1 + r) ** 2, 1e-4)
    close(Math.min(...d), (1 - r) ** 2, 1e-4)
    const right = barrierStateSamples([5, 7.3, 11], 1, 4, 1)
    for (let j = 0; j < 3; j++) close(right.re[j] ** 2 + right.im[j] ** 2, t.T, 1e-12)
  })
})

/* Lecture 19's own functions (numpy twins: pipeline/claims_448/l19.py, compared key by key in content/claims.test.ts) */
describe('Lecture 19 functions', () => {
  it('the fringe extremes are (1 ± |r|)², the left current is k(1 − |r|²) = k|τ|², and the matching conditions hold', () => {
    for (const [E, V0, a] of [[2, 4, 0.5], [1, 4, 2], [3, 3.5, 0.7]]) {
      const t = transmissionAmplitude(E, V0, a)
      const f = barrierFringes(E, V0, a)
      close(f.max, (1 + Math.sqrt(t.R)) ** 2, 1e-12)
      close(f.min, (1 - Math.sqrt(t.R)) ** 2, 1e-12)
      close(barrierLeftCurrent(E, V0, a), t.k * t.T, 1e-12)
      expect(matchResidual(E, V0, a)).toBeLessThan(1e-12)
    }
  })
  it('both regions give one energy', () => {
    const e = regionEnergies(2, 4, 0.5)
    close(e.outside, 2, 1e-12)
    close(e.inside, 2, 1e-12)
  })
  it('the delta barrier: T = 1/(1 + g²/4k²) is the limit of the exact barrier at fixed V₀a, and it refuses k ≤ 0', () => {
    close(deltaBarrierT(3, 2), 0.64, 1e-12)
    close(deltaLimitT(3, 2, 1e-4), deltaBarrierT(3, 2), 1e-3)
    close(deltaLimitT(3, 2, 1e-3) - deltaBarrierT(3, 2), -0.0002, 1e-4)
    expect(() => deltaBarrierT(3, 0)).toThrow()
  })
  it('the mass: κ scales as √m, the proton’s κ is 42.85 times the electron’s, and the heavier particle transmits far less', () => {
    const ratio = M_PROTON / M_ELECTRON
    close(kappaPerAngstrom(1, ratio) / kappaPerAngstrom(1), Math.sqrt(ratio), 1e-12)
    expect(barrierTEv(1, 2, 1, ratio)).toBeLessThan(1e-18)
    expect(barrierTEv(1, 2, 1)).toBeGreaterThan(0.7)
  })
  it('the macroscopic κa of Townsend p. 231 (1 g, 1 erg, 1 cm) is 1.341e27, to a relative 1e-3', () => {
    expect(Math.abs(macroKappaA(1, 1, 1) / 1.341e27 - 1)).toBeLessThan(1e-3)
  })
  it('the Gamow exponent: the closed form and the quadrature agree, it falls as the energy rises, and the model refuses E above the top', () => {
    for (const E of [2, 4.27, 8, 20]) close(gamowExponent(E, 90, 7.4), gamowExponentQuad(E, 90, 7.4), 1e-8)
    expect(gamowExponent(4.27, 90, 7.4)).toBeGreaterThan(gamowExponent(8, 90, 7.4))
    close(coulombTurningPoint(4.27, 90), 60.7, 0.01)
    expect(() => gamowExponent(40, 90, 7.4)).toThrow()
  })
  it('the barrier filters a packet’s momenta: the transmitted part has more kinetic energy than the packet, the reflected part less, and the two parts recombine to the packet’s', () => {
    const inc = momentumAverage(2, 2, (p) => (p * p) / 2)
    close(inc, 2 + 1 / (8 * 2 * 2), 1e-12)
    const t = filteredKineticMean(2, 2, 4, 0.5, 'T')
    const r = filteredKineticMean(2, 2, 4, 0.5, 'R')
    expect(t).toBeGreaterThan(inc)
    expect(r).toBeLessThan(inc)
    const wT = momentumAverage(2, 2, (p) => barrierT((p * p) / 2, 4, 0.5))
    close(wT * t + (1 - wT) * r, inc, 1e-9)
  })
})
