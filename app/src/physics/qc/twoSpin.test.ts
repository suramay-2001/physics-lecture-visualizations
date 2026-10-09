/**
 * physics/qc/twoSpin.ts against numpy (qc.json block "lecture10".twoSpin): the joint chances of Alice's and Bob's answers for every
 * pair of axes on the singlet, |ud⟩ and the path cos t|ud⟩ − sin t|du⟩ are |⟨e_a ⊗ e_b|ψ⟩|² with eigh eigenvectors; the correlator is
 * checked against ⟨ψ|σ_a ⊗ σ_b|ψ⟩ with explicit matrices. Plus properties of the lecture: Alice's operators commute with Bob's, so
 * sampling pairs with Alice first and with Bob first give the same joint chances (statistically, from seeded runs); the singlet gives
 * ¼ each for different axes and a certain opposite answer for the same axis; each spin alone is 50/50; the path's matched-axis
 * correlator is −sin 2t for x and y and −1 for z.
 */
import { describe, expect, it } from 'vitest'
import { rng } from '../random'
import { ghzRun, ghzState } from './ghz'
import { type Axis, twoSpinJoint, twoSpinRound, twoSpinState, twoSpinSummary, twoSpinTally } from './twoSpin'
import { FX } from './testkit'

const D = FX.lecture10.twoSpin
const close = (a: number, b: number, eps = 1e-12) => expect(Math.abs(a - b), `${a} vs ${b}`).toBeLessThan(eps)
const AXES: Axis[] = ['x', 'y', 'z']

describe('twoSpinJoint = |⟨e_a ⊗ e_b|ψ⟩|² with numpy eigenvectors', () => {
  it('matches numpy for 6 states × 9 axis pairs, and the summary agrees with ⟨ψ|σ_a⊗σ_b|ψ⟩', () => {
    expect(D.length).toBe(54)
    for (const k of D) {
      const psi = twoSpinState(k.kind, k.tDeg)
      const joint = twoSpinJoint(psi, k.a, k.b)
      joint.forEach((p, i) => close(p, k.joint[i]))
      const s = twoSpinSummary(joint)
      close(s.alicePlus, k.alicePlus)
      close(s.bobPlus, k.bobPlus)
      close(s.productMinus, k.productMinus)
      close(s.correlator, k.correlator)
      close(s.correlator, k.corrCheck)
    }
  })

  it('the singlet: the same axis always gives opposite answers; different axes give ¼ each; each spin alone is ½', () => {
    const sing = twoSpinState('singlet')
    for (const a of AXES)
      for (const b of AXES) {
        const j = twoSpinJoint(sing, a, b)
        const s = twoSpinSummary(j)
        close(s.alicePlus, 0.5)
        close(s.bobPlus, 0.5)
        if (a === b) {
          close(s.productMinus, 1)
          close(s.correlator, -1)
        } else {
          j.forEach((p) => close(p, 0.25))
          close(s.correlator, 0)
        }
      }
  })

  it('|ud⟩: Alice is always +1 along z and Bob always −1; along x each is a coin toss; no correlation off z', () => {
    const ud = twoSpinState('ud')
    const z = twoSpinSummary(twoSpinJoint(ud, 'z', 'z'))
    close(z.alicePlus, 1)
    close(z.bobPlus, 0)
    close(z.correlator, -1)
    const x = twoSpinSummary(twoSpinJoint(ud, 'x', 'x'))
    close(x.alicePlus, 0.5)
    close(x.bobPlus, 0.5)
    close(x.correlator, 0)
  })

  it('the path: matched-axis correlators are −sin 2t (x and y) and −1 (z); 0° is |ud⟩ and 45° is the singlet', () => {
    for (const t of [0, 15, 30, 45, 60, 90]) {
      const psi = twoSpinState('path', t)
      const rad = (t * Math.PI) / 180
      close(twoSpinSummary(twoSpinJoint(psi, 'x', 'x')).correlator, -Math.sin(2 * rad))
      close(twoSpinSummary(twoSpinJoint(psi, 'y', 'y')).correlator, -Math.sin(2 * rad))
      close(twoSpinSummary(twoSpinJoint(psi, 'z', 'z')).correlator, -1)
    }
    twoSpinJoint(twoSpinState('path', 45), 'x', 'y').forEach((p) => close(p, 0.25))
    close(twoSpinSummary(twoSpinJoint(twoSpinState('path', 45), 'x', 'x')).correlator, -1)
  })

  it('rejects an unknown state', () => {
    expect(() => twoSpinState('triplet' as never)).toThrow()
  })
})

describe('sampled pairs: the order of the two measurements does not matter', () => {
  const N = 40000
  for (const [a, b] of [['z', 'x'], ['x', 'x'], ['z', 'z'], ['y', 'x']] as [Axis, Axis][]) {
    it(`singlet, Alice ${a} and Bob ${b}: Alice-first and Bob-first sampling both reproduce the joint chances`, () => {
      const sing = twoSpinState('singlet')
      const joint = twoSpinJoint(sing, a, b)
      for (const first of ['A', 'B'] as const) {
        const counts = twoSpinTally(sing, a, b, first, N, rng(first === 'A' ? 11 : 12))
        expect(counts.reduce((s, x) => s + x, 0)).toBe(N)
        counts.forEach((k, i) => expect(Math.abs(k / N - joint[i]), `${first} first, outcome ${i}`).toBeLessThan(0.012))
      }
    })
  }

  it('on the path at 30° the sampled order never changes the tallies beyond sampling noise', () => {
    const psi = twoSpinState('path', 30)
    const A = twoSpinTally(psi, 'x', 'z', 'A', N, rng(21))
    const B = twoSpinTally(psi, 'x', 'z', 'B', N, rng(22))
    const j = twoSpinJoint(psi, 'x', 'z')
    A.forEach((k, i) => expect(Math.abs(k / N - j[i])).toBeLessThan(0.012))
    B.forEach((k, i) => expect(Math.abs(k / N - j[i])).toBeLessThan(0.012))
  })

  it('a seeded run replays exactly; |ud⟩ with Z on Alice is +1 every time', () => {
    const ud = twoSpinState('ud')
    const run = (seed: number) => Array.from({ length: 50 }, ((R) => () => twoSpinRound(ud, 'z', 'x', 'A', R))(rng(seed)))
    expect(JSON.stringify(run(5))).toBe(JSON.stringify(run(5)))
    expect(run(5).every((r) => r.a === 1)).toBe(true)
    // Bob measuring x on |d⟩ is a coin toss: both answers occur in 50 pairs
    expect(new Set(run(5).map((r) => r.b)).size).toBe(2)
  })
})

describe('ghzRun: a replayable run of referee inputs and answers', () => {
  it('draws the same inputs and answers from the same seed; |G⟩ wins every round', () => {
    const G = ghzState()
    const a = ghzRun({ state: G }, 40, rng(77))
    const b = ghzRun({ state: G }, 40, rng(77))
    expect(JSON.stringify(a)).toBe(JSON.stringify(b))
    expect(a.length).toBe(40)
    expect(a.every((r) => r.win)).toBe(true)
    expect(new Set(a.map((r) => r.row)).size).toBe(4) // all four inputs appear in 40 rounds
  })
})
