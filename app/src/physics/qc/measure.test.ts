/**
 * measure.ts against numpy (block "measure": |ψ|² with reshape/sum marginals, embedded projectors P ψ / ‖P ψ‖ for
 * computational, rotated and Bell measurements, full-matrix expectation values), plus sampleCounts' multinomial
 * moments over seeded repetitions (the RNG streams of numpy and mulberry32 differ, so counts are tested statistically).
 */
import { describe, expect, it } from 'vitest'
import { c } from '../complex'
import { rng, zScore } from '../random'
import { H, X, Y, Z } from './gates'
import {
  amplitude,
  bellMeasure,
  expectationN,
  frequencies,
  marginal,
  measureInBasis,
  measureQubit,
  moment,
  postMeasure,
  probs,
  robertsonBound,
  sampleCounts,
  varianceN,
} from './measure'
import { bell, ghz, ket, randomState } from './state'
import { FX, cm, cv, vecGap } from './testkit'

const D = FX.measure
const close = (a: number, b: number, eps = 1e-12) => expect(Math.abs(a - b), `${a} vs ${b}`).toBeLessThan(eps)

describe('Born rule on registers', () => {
  it('probs = |ψ|²; marginals over any qubit list (in the listed order) = reshape/sum', () => {
    const psi = cv(D.psi4)
    probs(psi).forEach((p, i) => close(p, D.probs4[i]))
    for (const m of D.marginals) marginal(psi, m.qubits).forEach((p, i) => close(p, m.p[i]))
    close(marginal(psi, [1, 3]).reduce((s, x) => s + x, 0), 1)
  })

  it('measureQubit: outcome probabilities and post-states = embedded projectors', () => {
    const psi = cv(D.psi3)
    for (const k of D.measureQubit) {
      const m = measureQubit(psi, k.q)
      m.p.forEach((p, b) => close(p, k.p[b]))
      m.post.forEach((v, b) => expect(vecGap(v!, cv(k.post[b]))).toBeLessThan(1e-12))
    }
  })

  it('postMeasure on two unsorted qubits = (|10⟩⟨10| on [2, 0]) ψ, renormalized; an impossible outcome gives null', () => {
    const k = D.postMeasure
    const r = postMeasure(cv(D.psi4), k.qubits, k.bits)
    close(r.p, k.p)
    expect(vecGap(r.post!, cv(k.post))).toBeLessThan(1e-12)
    expect(postMeasure(ket('00'), [0], '1')).toEqual({ p: 0, post: null })
  })

  it('measureInBasis x and y = the rotated projectors; post-states hold |±x⟩, |±y⟩ on the measured qubit', () => {
    const psi = cv(D.psi2)
    for (const k of D.inBasis) {
      const m = measureInBasis(psi, k.q, k.basis)
      m.p.forEach((p, b) => close(p, k.p[b]))
      m.post.forEach((v, b) => expect(vecGap(v!, cv(k.post[b]))).toBeLessThan(1e-12))
    }
    // measuring z via the general route = measureQubit
    const z = measureInBasis(psi, 1, 'z')
    const q = measureQubit(psi, 1)
    z.p.forEach((p, b) => close(p, q.p[b]))
  })

  it('bellMeasure on (0, 1) and (2, 0) = Bell projectors; a Bell state is found with certainty', () => {
    const psi = cv(D.psi3)
    for (const k of D.bell) {
      const out = bellMeasure(psi, k.a, k.b)
      expect(out.map((o) => o.content)).toEqual(['00+11', '00-11', '01+10', '01-10'])
      out.forEach((o, i) => {
        close(o.p, k.outcomes[i].p)
        expect(vecGap(o.post!, cv(k.outcomes[i].post))).toBeLessThan(1e-12)
      })
      close(out.reduce((s, o) => s + o.p, 0), 1)
    }
    const singlet = bellMeasure(bell('01-10'), 0, 1)
    close(singlet[3].p, 1)
    expect(singlet[0].post).toBeNull()
  })

  it('amplitude reads one basis string (q0 first)', () => {
    expect(amplitude(ghz(3), '111').re).toBeCloseTo(Math.SQRT1_2, 15)
    expect(amplitude(ket('01'), '01')).toEqual(c(1))
  })
})

describe('expectation values, variance and Robertson', () => {
  const E = D.expect
  const psi = cv(E.psi)
  it('⟨A⟩ for a Hermitian A on wires [2, 0] and a complex ⟨N⟩ for a non-Hermitian N on wire 1 = full-matrix numpy', () => {
    const a = expectationN(psi, cm(E.A), E.qubitsAB)
    close(a.re, E.expA[0])
    close(a.im, 0)
    const nn = expectationN(psi, cm(E.N), E.qubitsN)
    close(nn.re, E.expN[0])
    close(nn.im, E.expN[1])
    const m3 = moment(psi, cm(E.A), 3, E.qubitsAB)
    close(m3.re, E.momentA3[0], 1e-11)
  })

  it('varianceN = ⟨A²⟩ − ⟨A⟩² (Hermitian) and ⟨N†N⟩ − |⟨N⟩|² (general); Robertson product and bound', () => {
    close(varianceN(psi, cm(E.A), E.qubitsAB), E.varA)
    close(varianceN(psi, cm(E.B), E.qubitsAB), E.varB)
    close(varianceN(psi, cm(E.N), E.qubitsN), E.varN)
    const r = robertsonBound(psi, cm(E.A), cm(E.B), E.qubitsAB)
    close(r.product, E.robertson.product)
    close(r.bound, E.robertson.bound)
    expect(r.slack).toBeGreaterThanOrEqual(0)
  })

  it('Pauli checks: ⟨Z⟩ on |0⟩ is 1, ⟨X⟩ on |+⟩ is 1, ⟨Z⊗Z⟩ on Φ+ is 1 (on both wires); ΔX ΔY ≥ |⟨Z⟩| on 200 seeded states', () => {
    close(expectationN(ket('0'), Z).re, 1)
    close(expectationN(ket('+'), X).re, 1)
    close(expectationN(bell('00+11'), [[c(1), c(0), c(0), c(0)], [c(0), c(-1), c(0), c(0)], [c(0), c(0), c(-1), c(0)], [c(0), c(0), c(0), c(1)]]).re, 1)
    const R = rng(7097)
    for (let t = 0; t < 200; t++) {
      const psi1 = randomState(2, R)
      const r = robertsonBound(psi1, X, Y, [1])
      // [X, Y] = 2iZ, so the bound is |⟨Z⟩| on that wire
      close(r.bound, Math.abs(expectationN(psi1, Z, [1]).re), 1e-12)
      expect(r.slack).toBeGreaterThan(-1e-12)
    }
    close(varianceN(ket('0'), H), 0.5, 1e-12) // ⟨H⟩ = 1/√2 and H² = I, so (ΔH)² = 1 − ½
  })
})

describe('sampleCounts (seeded multinomial)', () => {
  it('counts sum to the shots; each count\'s mean over 400 runs is N p (|z| < 4) and its spread is √(N p (1 − p)) within 15 %', () => {
    const p = [0.1, 0.25, 0.05, 0.6]
    const N = 500
    const runs = 400
    const R = rng(7098)
    const sums = [0, 0, 0, 0]
    const sq = [0, 0, 0, 0]
    for (let r = 0; r < runs; r++) {
      const k = sampleCounts(p, N, R)
      expect(k.reduce((s, x) => s + x, 0)).toBe(N)
      k.forEach((x, i) => {
        sums[i] += x
        sq[i] += x * x
      })
    }
    p.forEach((pi, i) => {
      expect(Math.abs(zScore(sums[i], N * runs, pi))).toBeLessThan(4)
      const mean = sums[i] / runs
      const sd = Math.sqrt(sq[i] / runs - mean * mean)
      expect(Math.abs(sd / Math.sqrt(N * pi * (1 - pi)) - 1)).toBeLessThan(0.15)
    })
  })

  it('zero-probability outcomes never occur; a seed replays; frequencies are the fractions; an all-zero distribution throws', () => {
    const p = probs(bell('00+11'))
    const a = sampleCounts(p, 1000, rng(5))
    expect(a[1]).toBe(0)
    expect(a[2]).toBe(0)
    expect(sampleCounts(p, 1000, rng(5))).toEqual(a)
    close(frequencies(a).reduce((s, x) => s + x, 0), 1)
    expect(() => sampleCounts([0, 0], 10, rng(1))).toThrow()
  })
})
