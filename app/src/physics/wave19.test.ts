/**
 * Lecture 19's engine (physics/wave19.ts) against the numpy cases of pipeline/make_fixtures.py `lecture19_20_cases` (physics/__fixtures__/numpy.json, key lecture19_20): the four matching
 * conditions solved as a 4 x 4 complex system, plus the identities the state must satisfy (R + T = 1, continuity of ψ and ψ′ at both edges, the closed-form T of physics/scatter.ts).
 */
import { describe, expect, it } from 'vitest'
import fixtures from './__fixtures__/numpy.json'
import { abs2 } from './complex'
import { barrierT } from './scatter'
import { barrierStateSamples, transmissionAmplitude } from './wave19'

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
