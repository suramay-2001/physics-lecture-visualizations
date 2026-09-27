/**
 * Arcade truth (P): every level is solvable, no level starts solved, every par is honest, and every "spot the
 * error" correction states the engine's number.
 */
import { describe, expect, it } from 'vitest'
import { benchTheory } from '../physics/sg'
import { KET, expectation, nDotSigma, prob, probUpAlong, samePhysicalState } from '../physics/spin'
import { tiltXZ } from '../physics/spin'
import { ERROR_ROUNDS, GAMES, GOLF_LEVELS, SG_LEVELS } from './games'
import { applyMoves, phaseOf, reached, sequences } from './golf'
import { LECTURES } from '../content'
import { apply, bilinear, fromColumns, inner, madd, vec, vscale } from '../physics/linalg'
import { c, conj, mul } from '../physics/complex'
import { SZ, projector, toBasis } from '../physics/spin'
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
      for (let n = shortest; n < l.par; n++) for (const s of sequences(n)) expect(reached(applyMoves(l.start, s), l.target), `${l.id} in ${n}`).toBe(false)
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
  it('lists three games, each with levels and the chapters it trains', () => {
    expect(GAMES.map((g) => g.kind)).toEqual(['sg-puzzle', 'spot-the-error', 'bloch-golf'])
    for (const g of GAMES) {
      expect(g.levels).toBeGreaterThan(0)
      expect(g.trains.length).toBeGreaterThan(0)
    }
  })
})
