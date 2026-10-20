/**
 * Engine additions of the 448 Townsend pass, group G1 (Lectures 1-4) against their numpy twin
 * (pipeline/claims_448/g1.py -> __fixtures__/claims-448/g1.json `cases`): the recombining device in `sg.ts` (`Bench.merge`),
 * `sgGradientForSeparation` and `bohrMagneton` in `constants.ts`, and `pathLedger` in `townsend448.ts`.
 */
import { describe, expect, it } from 'vitest'
import fx from './__fixtures__/claims-448/g1.json'
import { type Axis, type Bench, benchTheory, fireMany, sequenceOutcomes } from './sg'
import { M_SILVER, bohrMagneton, sgGradientForSeparation } from './constants'
import { rng } from './random'
import { KET, type NamedKet } from './spin'
import { pathLedger } from './townsend448'
import { c } from './complex'
import { vec } from './linalg'

const close = (a: number, b: number, eps = 1e-12) => expect(Math.abs(a - b), `${a} vs ${b}`).toBeLessThan(eps)

describe('sg.ts merge: a recombining device is the identity (Townsend Fig. 1.4)', () => {
  it.each(fx.cases.merge)('benchTheory agrees with the density-matrix twin: $source $axes keep $keep merge $merge', (k) => {
    const t = benchTheory({ source: k.source as NamedKet, axes: k.axes as Axis[], keep: k.keep as ('+' | '-')[], merge: k.merge })
    close(t.plus, k.plus)
    close(t.minus, k.minus)
    k.blocked.forEach((b, i) => close(t.blocked[i], b))
  })

  it('Experiment 4 is the bench with no x magnet at all, and Experiment 3 is not', () => {
    const none = benchTheory({ source: '+z', axes: ['z'], keep: [] })
    const merged = benchTheory({ source: '+z', axes: ['x', 'z'], keep: ['+'], merge: [true, false] })
    close(merged.plus, none.plus)
    close(merged.minus, none.minus)
    const measured = benchTheory({ source: '+z', axes: ['x', 'z'], keep: ['+'] })
    close(measured.minus, 0.25)
  })

  it('a bench without `merge` is unchanged (the field is optional)', () => {
    const a = benchTheory({ source: 'oven', axes: ['z', 'x', 'z'], keep: ['+', '+'] })
    const b = benchTheory({ source: 'oven', axes: ['z', 'x', 'z'], keep: ['+', '+'], merge: [false, false, false] })
    expect(b).toEqual(a)
  })

  it('fireAtom/fireMany: a merged device blocks nothing and the counts follow benchTheory within 5 sigma', () => {
    const b: Bench = { source: '+z', axes: ['x', 'z'], keep: ['+'], merge: [true, false] }
    const N = 20000
    const t = fireMany(b, N, rng(11))
    expect(t.blocked).toEqual([0])
    expect(t.minus).toBe(0)
    expect(t.plus).toBe(N)
    const b2: Bench = { source: '+z', axes: ['x', 'x', 'z'], keep: ['+', '+'], merge: [false, true, false] }
    const th = benchTheory(b2)
    const t2 = fireMany(b2, N, rng(12))
    expect(t2.blocked[1]).toBe(0)
    for (const [k, p] of [[t2.plus, th.plus], [t2.minus, th.minus], [t2.blocked[0], th.blocked[0]]] as const)
      expect(Math.abs(k / N - p)).toBeLessThan(5 * Math.sqrt((p * (1 - p)) / N))
  })

  it('sequenceOutcomes: a merged device adds no letter to the path key', () => {
    const o = sequenceOutcomes({ source: '+z', axes: ['x', 'z'], merge: [true, false] })
    expect(Object.keys(o).sort()).toEqual(['+', '-'])
    close(o['+'], 1)
    close(o['-'], 0)
    const p = sequenceOutcomes({ source: '+z', axes: ['x', 'z'] })
    close(p['+-'], 0.25)
  })
})

describe('townsend448.ts pathLedger: path amplitudes, diagonal and interference terms (Townsend Eqs. 2.54-2.56)', () => {
  const bases: Record<string, ReturnType<typeof vec>[]> = {
    x: [KET['+x'], KET['-x']],
    z: [KET['+z'], KET['-z']],
    tilt30: [vec(Math.cos(Math.PI / 12), Math.sin(Math.PI / 12)), vec(Math.sin(Math.PI / 12), -Math.cos(Math.PI / 12))],
  }
  it.each(fx.cases.pathLedger)('matches the numpy sums: $initial to $final through $basis', (k) => {
    const r = pathLedger(KET[k.initial as NamedKet], KET[k.final as NamedKet], bases[k.basis] ?? [])
    k.paths.forEach(([re, im], i) => {
      close(r.paths[i].re, re)
      close(r.paths[i].im, im)
    })
    close(r.diagonal, k.diagonal)
    close(r.interference, k.interference)
    close(r.total, k.total)
  })
  it('total = diagonal + interference, and a complex amplitude keeps its phase', () => {
    const r = pathLedger(vec(c(0.6), c(0, 0.8)), KET['+y'], [KET['+z'], KET['-z']])
    close(r.total, r.diagonal + r.interference)
    close(r.sum.re * r.sum.re + r.sum.im * r.sum.im, r.total)
  })
})

describe('constants.ts: the Bohr magneton and the Stern-Gerlach gradient (Townsend Eq. 1.3 in SI, Problem 1.1 type)', () => {
  it('mu_B = e hbar / 2 m_e agrees with e h / 4 pi m_e', () => {
    close(bohrMagneton() / 1e-24, fx.cases.bohrMagneton / 1e-24)
    expect(bohrMagneton()).toBeGreaterThan(9.27e-24)
    expect(bohrMagneton()).toBeLessThan(9.28e-24)
  })
  it.each(fx.cases.gradient)('the gradient for a $separationM m spot separation matches the mass-free closed form', (k) => {
    const g = sgGradientForSeparation({ lengthM: k.lengthM, driftM: k.driftM, tempK: k.tempK, separationM: k.separationM, massKg: M_SILVER })
    close(g / k.gradient, 1, 1e-13)
  })
  it('the gradient does not depend on the atom mass (it cancels), and doubles when the spots are twice as far apart', () => {
    const a = { lengthM: 0.2, driftM: 0.4, tempK: 1000, separationM: 5e-4 }
    close(sgGradientForSeparation({ ...a, massKg: M_SILVER }) / sgGradientForSeparation({ ...a, massKg: 3 * M_SILVER }), 1, 1e-13)
    close(sgGradientForSeparation({ ...a, separationM: 1e-3, massKg: M_SILVER }) / sgGradientForSeparation({ ...a, massKg: M_SILVER }), 2, 1e-13)
  })
})
