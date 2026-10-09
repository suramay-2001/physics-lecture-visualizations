/**
 * Arcade truth (P): every level is solvable, no level starts solved, every par is honest, and every "spot the
 * error" correction states the engine's number.
 */
import { describe, expect, it } from 'vitest'
import { benchTheory } from '../physics/sg'
import { KET, Rz, blochAngle, expectation, nDotSigma, prob, probUpAlong, rayAngle, relativeSign, samePhysicalState, sandwich, spread, variance } from '../physics/spin'
import { tiltXZ } from '../physics/spin'
import { ERROR_ROUNDS, GAMES, GOLF_LEVELS, SG_LEVELS } from './games'
import { applyMoves, phaseOf, reached, sequences } from './golf'
import { LECTURES } from '../content'
import { apply, bilinear, charPoly2, commutator, fromColumns, identity, inner, madd, mat, matEq, matmul, maxDiff, mscale, norm2, vec, vscale } from '../physics/linalg'
import { c, conj, div, mul } from '../physics/complex'
import { SX, SY, SZ, basisChange, blochVector, eigenHermitian2, eigenvectorFor, ketFromBloch, operatorInBasis, projector, rotation, toBasis } from '../physics/spin'
import { classify } from '../physics/operators'

const close = (a: number, b: number, eps = 1e-12) => expect(Math.abs(a - b)).toBeLessThan(eps)

describe('Route the beam', () => {
  for (const l of SG_LEVELS) {
    it(`${l.id}: the solution lands exactly ${l.target.label} on the ${l.target.spot} spot; the start does not`, () => {
      close(benchTheory({ source: l.source, ...l.solution })[l.target.spot], l.target.fraction)
      expect(Math.abs(benchTheory({ source: l.source, ...l.start })[l.target.spot] - l.target.fraction)).toBeGreaterThan(1e-6)
      expect(l.solution.axes.length).toBeLessThanOrEqual(l.maxDevices)
      expect(l.start.axes.length).toBeLessThanOrEqual(l.maxDevices)
      expect(l.solution.keep).toHaveLength(l.solution.axes.length - 1)
    })
  }
})

describe('Spot the error: the corrections', () => {
  it('tilt-45: spin gives cos²(22.5°) ≈ 0.854, not ½', () => {
    const p = probUpAlong([0, 0, 1], tiltXZ(Math.PI / 4))
    close(p, Math.cos(Math.PI / 8) ** 2)
    expect(p.toFixed(3)).toBe('0.854')
  })
  it('memory: after an x magnet, z splits 50/50 (two equal spots)', () => {
    const t = benchTheory({ source: '+z', axes: ['x', 'z'], keep: ['+'] })
    close(t.plus, t.minus)
    close(t.plus, 1 / 4)
  })
  it('average-zero: at 90° the average is 0 while each reading is ±1, half the time each', () => {
    const n = tiltXZ(Math.PI / 2)
    close(expectation(nDotSigma(n), KET['+z']), 0)
    close(probUpAlong([0, 0, 1], n), 0.5)
  })
  it('amplitude-not-probability: |⟨+z|+x⟩|² = ½', () => close(prob(KET['+z'], KET['+x']), 0.5))
  it('order: with x first, "up or right" is false ¼ of the time; with z first, never', () => {
    close(benchTheory({ source: '+z', axes: ['x', 'z'], keep: ['-'] }).minus, 1 / 4)
    close(benchTheory({ source: '+z', axes: ['z', 'x'], keep: ['-'] }).minus, 0)
  })
  it('minus-is-down: −|+z⟩ is the same state as |+z⟩, with overlap −1, not 0', () => {
    expect(samePhysicalState(KET['+z'], vscale(KET['+z'], -1))).toBe(true)
    close(inner(KET['+z'], vscale(KET['+z'], -1)).re, -1)
  })
  it('x-probs-add: the squared x coordinates of (0.866, 0.5) add to 1', () => {
    const [dl, ep] = toBasis([c(Math.sqrt(3) / 2), c(0.5)], [KET['+x'], KET['-x']])
    expect(dl.re.toFixed(3)).toBe('0.966')
    expect(ep.re.toFixed(3)).toBe('0.259')
    close(dl.re ** 2 + ep.re ** 2, 1)
  })
  it('modulus-square: z*z = 2 for z = 1 + i, while z² = 2i', () => {
    const z = c(1, 1)
    close(mul(conj(z), z).re, 2)
    close(mul(z, z).im, 2)
  })
  it('forgot-conjugate: ⟨+y|+y⟩ = 1; the unconjugated row gives 0', () => {
    close(inner(KET['+y'], KET['+y']).re, 1)
    close(Math.hypot(bilinear(KET['+y'], KET['+y']).re, bilinear(KET['+y'], KET['+y']).im), 0)
  })
  it('rows-or-columns: with the images as columns, B₁₂ = 0 and B₂₁ = 2', () => {
    const B = fromColumns([vec(1, 2), vec(0, 3)])
    close(inner(KET['+z'], apply(B, KET['-z'])).re, 0)
    close(inner(KET['-z'], apply(B, KET['+z'])).re, 2)
  })
  it('completeness-any-two: P(+z) + P(+x) = 1.5 for |+z⟩, and P̂+z + P̂+x is not a projector', () => {
    close(prob(KET['+z'], KET['+z']) + prob(KET['+x'], KET['+z']), 1.5)
    expect(classify(madd(projector(KET['+z']), projector(KET['+x']))).projector).toBe(false)
  })
  it('magnet-applies-operator: the kept |+z⟩ splits ¼ / ¼ on an x magnet, though Ŝz|+x⟩ points along |−x⟩', () => {
    const t = benchTheory({ source: '+x', axes: ['z', 'x'], keep: ['+'] })
    close(t.plus, 1 / 4)
    close(t.minus, 1 / 4)
    expect(samePhysicalState(apply(SZ, KET['+x']), KET['-x'])).toBe(true)
  })
  it('three-quarters-of-what (Townsend Ex. 1.2): +ħ/2 has 25 %, −ħ/2 has 75 %', () => {
    const psiT = vec(0.5, c(0, Math.sqrt(3) / 2))
    close(prob(KET['+z'], psiT), 0.25)
    close(prob(KET['-z'], psiT), 0.75)
    close(expectation(SZ, psiT), -0.25)
  })
  it('eigenbasis-for-free: I has the eigenvalue 1 twice, and (1, 0), (1, 1)/√2 overlap by 1/√2 ≈ 0.707', () => {
    const e = eigenHermitian2(identity(2))
    close(e.values[0], e.values[1])
    close(inner(KET['+z'], KET['+x']).re, Math.SQRT1_2)
    expect(inner(KET['+z'], KET['+x']).re.toFixed(3)).toBe('0.707')
  })
  it('mean-is-zero: ⟨Sz⟩ = ħ/4 for (√3/2)|+z⟩ + ½|−z⟩, not 0', () => {
    const psi = ketFromBloch(Math.PI / 3, 0)
    close(prob(KET['+z'], psi), 0.75)
    close(expectation(SZ, psi), 0.25)
  })
  it('forgotten-conjugate: the unconjugated "P₊y" is not Hermitian and squares to zero; the real P₊y is a projector', () => {
    const bad = mscale(mat([[1, c(0, 1)], [c(0, 1), -1]]), 0.5)
    expect(classify(bad).hermitian).toBe(false)
    expect(classify(bad).projector).toBe(false)
    close(maxDiff(matmul(bad, bad), mscale(identity(2), 0)), 0)
    expect(classify(projector(KET['+y'])).projector).toBe(true)
  })
  it('half-not-normal: (½, ½) has squared length ½; the normalized + eigenvector of Sx has components 1/√2', () => {
    close(norm2(vec(0.5, 0.5)), 0.5)
    const v = eigenvectorFor(SX, 0.5)
    close(v[0].re, Math.SQRT1_2)
    close(v[1].re, Math.SQRT1_2)
  })
  it('l5-eigen-sign: for [[1, 2], [2, 1]], λ = −1 gives (1, −1)/√2 by back-substitution, orthogonal to the λ = 3 vector', () => {
    const M = mat([[1, 2], [2, 1]])
    const cp = charPoly2(M)
    close(cp[1].re, -2)
    close(cp[2].re, -3)
    const vMinus = eigenvectorFor(M, -1)
    close(vMinus[0].re, Math.SQRT1_2)
    close(vMinus[1].re, -Math.SQRT1_2)
    close(Math.hypot(inner(vMinus, eigenvectorFor(M, 3)).re, inner(vMinus, eigenvectorFor(M, 3)).im), 0)
  })
  it('l5-arrow: B_{z←y}|+y⟩ = ½(1 + i, 1 + i) (the slip), while B_{y←z}|+y⟩ = (1, 0)', () => {
    const wrong = apply(basisChange('y', 'z'), KET['+y'])
    for (const z of wrong) {
      close(z.re, 0.5)
      close(z.im, 0.5)
    }
    close(wrong[0].re ** 2 + wrong[0].im ** 2, 0.5)
    const right = apply(basisChange('z', 'y'), KET['+y'])
    close(right[0].re, 1)
    close(Math.hypot(right[1].re, right[1].im), 0)
  })
  it('l5-label: Sz in the x basis has the entries of Sx, yet ⟨Sx⟩ = 0 for |+z⟩ in either basis', () => {
    const xb = [KET['+x'], KET['-x']]
    expect(matEq(operatorInBasis(SZ, xb), SX)).toBe(true)
    close(expectation(SX, KET['+z']), 0)
    close(expectation(operatorInBasis(SX, xb), toBasis(KET['+z'], xb)), 0)
  })
  it('l5-mixed-bases: c_x† Sz⁽ᶻ⁾ c_x = 0 is the slip; c_x† Sz⁽ˣ⁾ c_x = ½ (every atom up)', () => {
    const xb = [KET['+x'], KET['-x']]
    const cx = toBasis(KET['+z'], xb)
    close(expectation(SZ, cx), 0)
    close(expectation(operatorInBasis(SZ, xb), cx), 0.5)
    close(prob(KET['+z'], KET['+z']), 1)
  })
  it('l5-aim-by-averages: the target’s averages are (0, 0, −½): it is |−z⟩', () => {
    close(expectation(SX, KET['-z']), 0)
    close(expectation(SY, KET['-z']), 0)
    close(expectation(SZ, KET['-z']), -0.5)
  })
  it('opposite-is-minus: ⟨+z|−z⟩ = 0, while −|+z⟩ is |+z⟩ on the north pole (overlap −1)', () => {
    close(Math.hypot(inner(KET['+z'], KET['-z']).re, inner(KET['+z'], KET['-z']).im), 0)
    expect(samePhysicalState(vscale(KET['+z'], -1), KET['+z'])).toBe(true)
    close(blochVector(vscale(KET['+z'], -1))[2], 1)
    close(inner(KET['+z'], vscale(KET['+z'], -1)).re, -1)
  })
  it('phase-in-disguise: i|+y⟩ is still |+y⟩, not |−x⟩; (−1)/i = i', () => {
    const iy = vscale(KET['+y'], c(0, 1))
    expect(samePhysicalState(iy, KET['+y'])).toBe(true)
    expect(samePhysicalState(iy, KET['-x'])).toBe(false)
    close(iy[1].re, -Math.SQRT1_2)
    const ratio = div(iy[1], iy[0])
    close(ratio.re, 0)
    close(ratio.im, 1)
  })
  it('small-turn-sign: I + i dφ Sz sends |+x⟩ toward −y; I − i dφ Sz toward +y', () => {
    const wrong = blochVector(apply(madd(identity(2), mscale(SZ, c(0, 0.001))), KET['+x']))
    const right = blochVector(apply(madd(identity(2), mscale(SZ, c(0, -0.001))), KET['+x']))
    expect(wrong[1]).toBeLessThan(0)
    expect(right[1]).toBeGreaterThan(0)
    close(right[1], Math.sin(0.001), 1e-9)
    expect(maxDiff(rotation([0, 0, 1], 0.001), madd(identity(2), mscale(SZ, c(0, -0.001))))).toBeLessThan(1e-6)
  })
  it('three-sixteenths: a 60° first magnet keeping + sends ¾ × ¼ = 3/16 of |+z⟩ to −z; z first sends none', () => {
    close(benchTheory({ source: '+z', axes: [60, 'z'], keep: ['+'] }).minus, 3 / 16)
    close(benchTheory({ source: '+z', axes: ['z', 'z'], keep: ['+'] }).minus, 0)
  })
  it('long-way-round: 10° and 350° are 20° apart on the sphere, η = 10°, overlap probability cos²10° ≈ 0.970', () => {
    const [a, b] = [ketFromBloch(Math.PI / 2, (10 * Math.PI) / 180), ketFromBloch(Math.PI / 2, (350 * Math.PI) / 180)]
    close(blochAngle(a, b), (20 * Math.PI) / 180, 1e-9)
    close(rayAngle(a, b), (10 * Math.PI) / 180, 1e-9)
    expect(prob(a, b).toFixed(3)).toBe('0.970')
  })
  it('arrow-back-ket-back: after Rz(2π) the point and p(+x) are back, but the ket is −|+x⟩ (sandwich −1); Rz(4π) = I', () => {
    const psi = apply(Rz(2 * Math.PI), KET['+x'])
    close(blochVector(psi)[0], 1)
    close(prob(KET['+x'], psi), 1)
    close(sandwich(Rz(2 * Math.PI), KET['+x']).re, -1)
    close(relativeSign(KET['+x'], psi).re, -1)
    expect(matEq(Rz(2 * Math.PI), mscale(identity(2), -1))).toBe(true)
    expect(matEq(Rz(4 * Math.PI), identity(2))).toBe(true)
  })
  it('commuting-means-certain: [Sz, I + 4Sz] = 0, yet |+x⟩ has spread ½ in Sz (and 2 in I + 4Sz)', () => {
    const B = madd(identity(2), mscale(SZ, 4))
    close(maxDiff(commutator(SZ, B), mscale(identity(2), 0)), 0)
    close(spread(SZ, KET['+x']), 0.5)
    close(spread(B, KET['+x']), 2)
  })
  it('shrinking-spread: ΔSx = ½ in |+z⟩ for every N; ½/√10000 = 1/200 is the error of the average', () => {
    close(spread(SX, KET['+z']), 0.5)
    close(spread(SX, KET['+z']) / Math.sqrt(10000), 1 / 200)
  })
  it('zero-floor: ⟨+x|[Sx, Sy]|+x⟩ = 0 while [Sx, Sy] ≠ 0; ΔSx = 0 and ΔSy = ½ in |+x⟩', () => {
    const z = sandwich(commutator(SX, SY), KET['+x'])
    close(Math.hypot(z.re, z.im), 0)
    close(maxDiff(commutator(SX, SY), mscale(identity(2), 0)), 0.5)
    close(variance(SX, KET['+x']), 0)
    close(spread(SY, KET['+x']), 0.5)
  })
  it('purify-then-tilt: after a + filter the 60° magnet passes cos²30° = ¾ of the ½ that is left', () => {
    close(benchTheory({ source: '+z', axes: [60], keep: [] }).plus, Math.cos(Math.PI / 6) ** 2)
    close(benchTheory({ source: 'oven', axes: [60], keep: [] }).plus, 0.5)
  })
  it('every level of a built lecture trains a real chapter of it', () => {
    const all = [...SG_LEVELS, ...ERROR_ROUNDS, ...GOLF_LEVELS].map((l) => l.trains)
    for (const t of all) {
      const lec = LECTURES.find((l) => l.id === t.lecture)
      if (lec) expect(lec.units.map((u) => u.id), `${t.lecture} ${t.unit}`).toContain(t.unit)
    }
  })
  it('every round has at least three steps and one wrong step inside them', () => {
    for (const r of ERROR_ROUNDS) {
      expect(r.steps.length).toBeGreaterThanOrEqual(3)
      expect(r.wrong).toBeGreaterThanOrEqual(0)
      expect(r.wrong).toBeLessThan(r.steps.length)
    }
  })
})

describe('Bloch golf', () => {
  for (const l of GOLF_LEVELS) {
    it(`${l.id}: the solution reaches ${l.target} in par ${l.par}; no shorter route exists`, () => {
      expect(reached(applyMoves(l.start, l.solution), l.target)).toBe(true)
      expect(l.solution.length).toBeLessThanOrEqual(l.par)
      const shortest = l.minMoves ?? 1
      for (let n = shortest; n < l.par; n++) for (const s of sequences(n, l.allowed)) expect(reached(applyMoves(l.start, s), l.target), `${l.id} in ${n}`).toBe(false)
      if (!l.minMoves) expect(samePhysicalState(KET[l.start], KET[l.target])).toBe(false)
    })
  }
  it('full-turn: four quarter turns about x bring back −|+z⟩ (same state, opposite sign)', () => {
    const psi = applyMoves('+z', GOLF_LEVELS.find((l) => l.id === 'full-turn')!.solution)
    const ph = phaseOf(psi, '+z')
    expect([ph.re, ph.im]).toEqual([-1, 0])
  })
})

describe('Arcade index', () => {
  it('lists four games, each with levels and the chapters it trains', () => {
    expect(GAMES.map((g) => g.kind)).toEqual(['sg-puzzle', 'spot-the-error', 'bloch-golf', 'catch-eve'])
    for (const g of GAMES) {
      expect(g.levels).toBeGreaterThan(0)
      expect(g.trains.length).toBeGreaterThan(0)
    }
  })
})
