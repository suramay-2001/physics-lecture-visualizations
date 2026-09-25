/**
 * density.ts (W-L1 §3.3): the identity tests from the plan plus agreement with the independent numpy
 * `density` fixture (ρ as a matrix sum of Dirichlet-weighted kets, r from traces, P(+) from eigh projectors,
 * the non-selective update as Σ Π ρ Π, and the best P(+) from a 0.01° grid scan).
 */
import { describe, expect, it } from 'vitest'
import fx from './__fixtures__/numpy.json'
import { c } from './complex'
import { type Mat, type Vec, matEq, vadd } from './linalg'
import {
  blochFromRho,
  blochOfMixture,
  isPhysicalBloch,
  maxPPlus,
  measureNonSelective,
  measureSelective,
  pPlus,
  purity,
  purityOfNorm,
  recipeWeights,
  rhoFromBloch,
  rhoFromMixture,
} from './density'
import { rng } from './random'
import { KET, type Vec3, blochVector, ketAlong, ketFromBloch } from './spin'

const close = (a: number, b: number, eps = 1e-12) => expect(Math.abs(a - b)).toBeLessThan(eps)
const close3 = (a: Vec3, b: readonly number[], eps = 1e-12) => a.forEach((x, i) => close(x, b[i], eps))
const R = rng(4482)
const randInBall = (): Vec3 => {
  const z = 2 * R() - 1
  const p = 2 * Math.PI * R()
  const s = Math.sqrt(1 - z * z)
  const m = Math.cbrt(R())
  return [m * s * Math.cos(p), m * s * Math.sin(p), m * z]
}

describe('density.ts identities (W-L1 §3.3)', () => {
  it('blochFromRho ∘ rhoFromBloch = id and purity(rhoFromBloch(r)) = purityOfNorm(|r|) over 50 random r', () => {
    for (let k = 0; k < 50; k++) {
      const r = randInBall()
      close3(blochFromRho(rhoFromBloch(r)), r)
      close(purity(rhoFromBloch(r)), purityOfNorm(Math.hypot(...r)))
      expect(isPhysicalBloch(r)).toBe(true)
    }
  })

  it('a one-part mixture is pure (|r| = 1, purity 1); the oven (½ +z, ½ −z) is r = 0, purity ½', () => {
    for (let k = 0; k < 10; k++) {
      const rho = rhoFromMixture([{ w: 1, psi: ketFromBloch(Math.PI * R(), 2 * Math.PI * R()) }])
      close(Math.hypot(...blochFromRho(rho)), 1)
      close(purity(rho), 1)
    }
    const oven = rhoFromMixture([{ w: 0.5, psi: KET['+z'] }, { w: 0.5, psi: KET['-z'] }])
    close(Math.hypot(...blochFromRho(oven)), 0)
    close(purity(oven), 0.5)
  })

  it('decision #6: ½|+z⟩ + ½|+x⟩ has |r| = 1/√2 and maxPPlus = (1 + 1/√2)/2 ≈ 0.8536, vs 1 for the superposition', () => {
    const rho = rhoFromMixture([{ w: 0.5, psi: KET['+z'] }, { w: 0.5, psi: KET['+x'] }])
    const r = blochFromRho(rho)
    close(Math.hypot(...r), Math.SQRT1_2)
    close(maxPPlus(r), (1 + Math.SQRT1_2) / 2)
    expect(maxPPlus(r).toFixed(4)).toBe('0.8536')
    const sup = vadd(KET['+z'], KET['+x']) // the matching superposition (blochVector normalizes)
    close(Math.hypot(...blochVector(sup)), 1)
    close(maxPPlus(blochVector(sup)), 1)
  })

  it('the ±n̂ recipe with recipeWeights(|r|) reproduces ρ(r)', () => {
    for (let k = 0; k < 20; k++) {
      const r = randInBall()
      const m = Math.hypot(...r)
      const n: Vec3 = [r[0] / m, r[1] / m, r[2] / m]
      const [wp, wm] = recipeWeights(m)
      const mix = rhoFromMixture([{ w: wp, psi: ketAlong(n) }, { w: wm, psi: ketAlong([-n[0], -n[1], -n[2]]) }])
      expect(matEq(mix, rhoFromBloch(r), 1e-12)).toBe(true)
    }
  })

  it('isPhysicalBloch: |r| ≤ 1 + eps', () => {
    expect(isPhysicalBloch([0, 0, 1])).toBe(true)
    expect(isPhysicalBloch([0, 0, 1 + 1e-10])).toBe(true)
    expect(isPhysicalBloch([0, 0, 1 + 1e-8])).toBe(false)
    expect(isPhysicalBloch([0.8, 0, 0.8])).toBe(false)
  })
})

// ---------------------------------------------------------------------------------------------------------
type Cx = { re: number; im: number }
type FxDensity = {
  label: string
  parts: { w: number; psi: Cx[]; r: number[] }[]
  rho: Cx[][]
  r: number[]
  purity: number
  n: number[]
  pPlus: number
  nonSelective: number[]
  selectivePlus: { p: number; r: number[] | null }
  selectiveMinus: { p: number; r: number[] | null }
  maxPPlusScan: number
}
const CASES = fx.density as unknown as FxDensity[]
const toVec = (xs: Cx[]): Vec => xs.map((z) => c(z.re, z.im))
const toMat = (xs: Cx[][]): Mat => xs.map((r) => r.map((z) => c(z.re, z.im)))
const v3 = (xs: number[]): Vec3 => [xs[0], xs[1], xs[2]]

describe('density.ts agrees with numpy (density fixture)', () => {
  it('has the random 2–4-ket mixtures and the decision #6 cases', () => {
    expect(CASES.filter((k) => k.label.startsWith('random-')).length).toBe(12)
    expect(CASES.every((k) => k.parts.length >= 1 && k.parts.length <= 4)).toBe(true)
    const d6 = CASES.find((k) => k.label === 'decision6-mixture')!
    close(Math.hypot(...d6.r), Math.SQRT1_2)
    close(d6.maxPPlusScan, (1 + Math.SQRT1_2) / 2, 5e-9)
    close(CASES.find((k) => k.label === 'decision6-superposition')!.maxPPlusScan, 1, 5e-9)
  })

  it('ρ = Σ w |ψ⟩⟨ψ|, r from traces, Σ w r⃗ and purity tr ρ²', () => {
    for (const k of CASES) {
      const rho = rhoFromMixture(k.parts.map((p) => ({ w: p.w, psi: toVec(p.psi) })))
      expect(matEq(rho, toMat(k.rho), 1e-12), k.label).toBe(true)
      close3(blochFromRho(rho), k.r)
      close3(blochOfMixture(k.parts.map((p) => ({ w: p.w, r: blochVector(toVec(p.psi)) }))), k.r)
      close(purity(rho), k.purity)
      close(purityOfNorm(Math.hypot(...k.r)), k.purity)
      close3(blochFromRho(rhoFromBloch(v3(k.r))), k.r)
      expect(isPhysicalBloch(v3(k.r))).toBe(true)
    }
  })

  it('P(+ along n̂) and the non-selective / selective updates (n not normalized in the fixture)', () => {
    for (const k of CASES) {
      const r = v3(k.r)
      const n = v3(k.n)
      close(pPlus(r, n), k.pPlus)
      close3(measureNonSelective(r, n), k.nonSelective)
      const plus = measureSelective(r, n, '+')
      close(plus.p, k.selectivePlus.p)
      if (k.selectivePlus.r) close3(plus.r, k.selectivePlus.r, 1e-9)
      const minus = measureSelective(r, n, '-')
      close(minus.p, k.selectiveMinus.p)
      if (k.selectiveMinus.r) close3(minus.r, k.selectiveMinus.r, 1e-9)
    }
  })

  it('maxPPlus = (1 + |r|)/2 matches the 0.01° grid scan (the scan sits ≤ 2e-9 below the exact maximum)', () => {
    for (const k of CASES) {
      const gap = maxPPlus(v3(k.r)) - k.maxPPlusScan
      expect(gap, k.label).toBeGreaterThan(-1e-12)
      expect(gap, k.label).toBeLessThan(5e-9)
    }
  })
})
