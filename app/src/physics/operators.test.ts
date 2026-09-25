/**
 * Identity tests for operators.ts and density.ts (W0), plus (W1) agreement with the independent numpy
 * `operators` fixture (Taylor series with scaling and squaring, np.allclose classes). The `density` fixture is
 * checked in density.test.ts (W-L1 §3.2–3.3).
 */
import { describe, expect, it } from 'vitest'
import fx from './__fixtures__/numpy.json'
import { abs, c, expi, sub } from './complex'
import { type Mat, det2, identity, isUnitary, mat, matEq, mscale, outer } from './linalg'
import { rng } from './random'
import {
  blochFromRho,
  blochOfMixture,
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
import { classify, compose, decompose, decomposeHermitian, evolve, expm2 } from './operators'
import { KET, SIGMA_X, SIGMA_Y, SIGMA_Z, type Vec3, blochVector, eigenHermitian2, ketFromBloch, nDotSigma, rotation } from './spin'

const close = (a: number, b: number, eps = 1e-12) => expect(Math.abs(a - b)).toBeLessThan(eps)
const R = rng(448)
const randUnit = (): Vec3 => {
  const z = 2 * R() - 1
  const p = 2 * Math.PI * R()
  const s = Math.sqrt(1 - z * z)
  return [s * Math.cos(p), s * Math.sin(p), z]
}
const randMat = (): Mat => mat([[c(R() - 0.5, R() - 0.5), c(R() - 0.5, R() - 0.5)], [c(R() - 0.5, R() - 0.5), c(R() - 0.5, R() - 0.5)]])

describe('operators.ts', () => {
  it('expm2(−i(φ/2) n̂·σ⃗) equals rotation(n̂, φ) over 50 random (n̂, φ)', () => {
    for (let k = 0; k < 50; k++) {
      const n = randUnit()
      const phi = 4 * Math.PI * R()
      expect(matEq(expm2(mscale(nDotSigma(n), c(0, -phi / 2))), rotation(n, phi), 1e-12)).toBe(true)
    }
  })

  it('expm2(0) = I; nilpotent [[0,1],[0,0]] ↦ [[1,1],[0,1]]; det e^M = e^{tr M}', () => {
    expect(matEq(expm2(mat([[0, 0], [0, 0]])), identity(2), 1e-15)).toBe(true)
    expect(matEq(expm2(mat([[0, 1], [0, 0]])), mat([[1, 1], [0, 1]]), 1e-15)).toBe(true)
    for (let k = 0; k < 20; k++) {
      const M = randMat()
      const d = det2(expm2(M))
      const tr = c(M[0][0].re + M[1][1].re, M[0][0].im + M[1][1].im)
      const want = mscale([[expi(tr.im)]], Math.exp(tr.re))[0][0]
      expect(abs(sub(d, want))).toBeLessThan(1e-12)
    }
  })

  it('the q → 0 series agrees with the closed form on both sides of the switch', () => {
    for (const q of [1e-9, 1e-5, 2e-4]) {
      // N = q σ_x has q² = q²; compare with cosh/sinh directly
      const E = expm2(mscale(SIGMA_X, q))
      close(E[0][0].re, Math.cosh(q), 1e-15)
      close(E[0][1].re, Math.sinh(q), 1e-15)
    }
  })

  it('evolve(H, t) is unitary for random Hermitian H', () => {
    for (let k = 0; k < 20; k++) {
      const H = compose({ a0: c(R() - 0.5), a: [c(R() - 0.5), c(R() - 0.5), c(R() - 0.5)] })
      expect(isUnitary(evolve(H, 3 * R()), 1e-12)).toBe(true)
    }
  })

  it('decompose ∘ compose = id; decomposeHermitian agrees with eigenHermitian2 (a₀ ± |a⃗|)', () => {
    for (let k = 0; k < 20; k++) {
      const M = randMat()
      expect(matEq(compose(decompose(M)), M, 1e-14)).toBe(true)
    }
    const H = compose({ a0: c(0.3), a: [c(0.2), c(-0.5), c(0.7)] })
    const h = decomposeHermitian(H)!
    const e = eigenHermitian2(H)
    const len = Math.hypot(...h.a)
    close(e.values[0], h.a0 + len)
    close(e.values[1], h.a0 - len)
    expect(decomposeHermitian(mat([[0, 1], [0, 0]]))).toBeNull()
  })

  it('classify: σ_x is Hermitian, unitary, an involution, not a projector; |+x⟩⟨+x| is a rank-1 projector', () => {
    const sx = classify(SIGMA_X)
    expect([sx.hermitian, sx.unitary, sx.involution, sx.projector, sx.rank]).toEqual([true, true, true, false, 2])
    const P = classify(outer(KET['+x'], KET['+x']))
    expect([P.hermitian, P.projector, P.rank, P.unitary]).toEqual([true, true, 1, false])
    expect(classify(identity(2)).scalar).toBe(true)
    expect(classify(mscale(SIGMA_Y, c(0, 1))).antiHermitian).toBe(true)
    expect(classify(mat([[0, 0], [0, 0]])).rank).toBe(0)
  })
})

describe('density.ts', () => {
  it('blochFromRho ∘ rhoFromBloch = id; purity(ρ) = (1 + |r|²)/2', () => {
    for (let k = 0; k < 20; k++) {
      const n = randUnit()
      const m = R()
      const r: Vec3 = [n[0] * m, n[1] * m, n[2] * m]
      const back = blochFromRho(rhoFromBloch(r))
      for (let j = 0; j < 3; j++) close(back[j], r[j])
      close(purity(rhoFromBloch(r)), purityOfNorm(m))
    }
  })

  it('a one-part mixture is pure (|r| = 1); the oven (½ +z, ½ −z) is r = 0', () => {
    const psi = ketFromBloch(1.1, 0.4)
    const r1 = blochFromRho(rhoFromMixture([{ w: 1, psi }]))
    close(Math.hypot(...r1), 1)
    const oven = blochFromRho(rhoFromMixture([{ w: 0.5, psi: KET['+z'] }, { w: 0.5, psi: KET['-z'] }]))
    close(Math.hypot(...oven), 0)
  })

  it('decision #6: ½|+z⟩ + ½|+x⟩ has |r| = 1/√2 and best P(+) = (1 + 1/√2)/2 ≈ 0.8536, vs 1 for the superposition', () => {
    const r = blochOfMixture([{ w: 0.5, r: blochVector(KET['+z']) }, { w: 0.5, r: blochVector(KET['+x']) }])
    close(Math.hypot(...r), Math.SQRT1_2)
    close(maxPPlus(r), (1 + Math.SQRT1_2) / 2)
    expect(maxPPlus(r).toFixed(4)).toBe('0.8536')
    close(maxPPlus(blochVector(KET['+x'])), 1)
  })

  it('P(+) inside the ball; selective and non-selective updates', () => {
    const r: Vec3 = [0.3, -0.2, 0.5]
    const n: Vec3 = [0, 0, 2]
    close(pPlus(r, n), 0.75)
    expect(measureNonSelective(r, n)).toEqual([0, 0, 0.5])
    const sel = measureSelective(r, n, '-')
    close(sel.p, 0.25)
    expect(sel.r).toEqual([-0, -0, -1])
    expect(recipeWeights(0.5)).toEqual([0.75, 0.25])
    // the ±n̂ recipe with those weights reproduces ρ
    const [wp, wm] = recipeWeights(0.5)
    const mix = rhoFromMixture([{ w: wp, psi: KET['+z'] }, { w: wm, psi: KET['-z'] }])
    expect(matEq(mix, rhoFromBloch([0, 0, 0.5]), 1e-14)).toBe(true)
    expect(matEq(rhoFromBloch([0, 0, 1]), outer(KET['+z'], KET['+z']), 1e-14)).toBe(true)
    expect(SIGMA_Z[0][0].re).toBe(1)
  })
})

// ---------------------------------------------------------------------------------------------------------
// W1: the numpy `operators` fixture (pipeline/make_fixtures.py operator_cases()).
type Cx = { re: number; im: number }
type FxOpClass = { hermitian: boolean; antiHermitian: boolean; unitary: boolean; normal: boolean; projector: boolean; involution: boolean; scalar: boolean; rank: number }
type FxOpCase = { kind: string; M: Cx[][]; a0: Cx; a: [Cx, Cx, Cx]; class: FxOpClass | null; expm: Cx[][] }
type FxEvolve = { H: Cx[][]; t: number; U: Cx[][] }
const OPS = fx.operators as unknown as { cases: FxOpCase[]; evolve: FxEvolve[] }
const toMat = (xs: Cx[][]): Mat => xs.map((r) => r.map((z) => c(z.re, z.im)))
/** max |A − B| componentwise, relative to max(1, max |B|) */
const relDev = (A: Mat, B: Mat): number => {
  const s = Math.max(1, ...B.flat().map(abs))
  return Math.max(...A.flatMap((row, i) => row.map((x, j) => abs(sub(x, B[i][j]))))) / s
}

describe('operators.ts agrees with numpy (operators fixture)', () => {
  it('covers every matrix family the plan lists', () => {
    const kinds = new Set(OPS.cases.map((k) => k.kind))
    for (const k of ['general', 'hermitian', 'antiHermitian', 'unitary', 'projector', 'nilpotent', 'scalar', 'involution', 'near-degenerate']) expect(kinds.has(k)).toBe(true)
    expect(OPS.cases.length).toBeGreaterThanOrEqual(30)
  })

  it('decompose: a₀ = tr M / 2 and a_k = tr(M σ_k) / 2 (Pauli σ, not S); compose round-trips', () => {
    for (const k of OPS.cases) {
      const M = toMat(k.M)
      const d = decompose(M)
      expect(abs(sub(d.a0, c(k.a0.re, k.a0.im)))).toBeLessThan(1e-12)
      d.a.forEach((x, i) => expect(abs(sub(x, c(k.a[i].re, k.a[i].im)))).toBeLessThan(1e-12))
      expect(relDev(compose(d), M)).toBeLessThan(1e-14)
    }
  })

  it('expm2 (closed form) matches the Taylor series with scaling and squaring, incl. q = 1e-9, 1e-5 (series) and 2e-4, 1e-3 (closed form)', () => {
    for (const k of OPS.cases) expect(relDev(expm2(toMat(k.M)), toMat(k.expm)), k.kind).toBeLessThan(1e-12)
    const nearQ = OPS.cases.filter((k) => k.kind === 'near-degenerate')
    expect(nearQ.length).toBe(12)
  })

  it('classify matches the np.allclose classes (threshold-ambiguous matrices are excluded by the script)', () => {
    let checked = 0
    for (const k of OPS.cases) {
      if (!k.class) continue
      checked++
      const got = classify(toMat(k.M))
      expect(got, `${k.kind} ${JSON.stringify(k.M)}`).toEqual(k.class)
      // decomposeHermitian is non-null exactly for the Hermitian ones
      expect(decomposeHermitian(toMat(k.M)) !== null).toBe(k.class.hermitian)
    }
    expect(checked).toBeGreaterThanOrEqual(30)
  })

  it('evolve(H, t) = e^{−iHt} matches the Taylor series and is unitary', () => {
    for (const e of OPS.evolve) {
      const U = evolve(toMat(e.H), e.t)
      expect(relDev(U, toMat(e.U))).toBeLessThan(1e-12)
      expect(isUnitary(U, 1e-12)).toBe(true)
    }
  })
})
