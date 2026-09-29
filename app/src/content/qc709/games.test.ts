/**
 * Physics 709 Arcade truth (P, mirroring arcade/games.test.ts): every level is solvable, no level starts solved,
 * and every "spot the error" correction states the engine's number, recomputed independently here.
 */
import { describe, expect, it } from 'vitest'
import { abs2, c, mul, expi } from '../../physics/complex'
import { phasorSum } from '../../physics/qc/complexExtra'
import { apply, bilinear, commutator, inner, matmul, vadd, vec } from '../../physics/linalg'
import { SILVER, sgDeflection } from '../../physics/field'
import { benchTheory } from '../../physics/sg'
import { H, Z, cnot } from '../../physics/qc/gates'
import { kron } from '../../physics/qc/state'
import { KET, SX, SY, SZ, expectation } from '../../physics/spin'
import { varianceN } from '../../physics/qc/measure'
import { courseOfId } from '../courses'
import { applyMoves, reached, sequences } from '../../arcade/golf'
import { QC_CHAPTERS } from './index'
import { P0 } from './Q1.values'
import { QC_ERROR_ROUNDS, QC_GAMES, QC_GOLF_LEVELS, QC_SG_LEVELS } from './games'

const close = (a: number, b: number, eps = 1e-9) => expect(Math.abs(a - b)).toBeLessThan(eps)

describe('709 Route the beam', () => {
  for (const l of QC_SG_LEVELS) {
    it(`${l.id}: the solution lands exactly ${l.target.label} on the ${l.target.spot} spot; the start does not`, () => {
      close(benchTheory({ source: l.source, ...l.solution })[l.target.spot], l.target.fraction)
      expect(Math.abs(benchTheory({ source: l.source, ...l.start })[l.target.spot] - l.target.fraction)).toBeGreaterThan(1e-6)
      expect(l.solution.axes.length).toBeLessThanOrEqual(l.maxDevices)
      expect(l.start.axes.length).toBeLessThanOrEqual(l.maxDevices)
      expect(l.solution.keep).toHaveLength(l.solution.axes.length - 1)
    })
  }
})

describe('709 Spot the error: the corrections', () => {
  it('qc-root-minus-4: (−2)² = 4, not −4; the roots of x² = −4 are ±2i', () => {
    close(mul(c(-2), c(-2)).re, 4)
    close(mul(c(0, 2), c(0, 2)).re, -4)
  })
  it('qc-size-by-adding: |3 + 4i| = 5, the hypotenuse, not 3 + 4', () => {
    close(Math.hypot(3, 4), 5)
    close(3 + 4, 7) // the wrong step's arithmetic, for contrast
  })
  it('qc-sizes-add: sizes multiply: |(2 + i)(1 + 3i)| = 7.071, not 2.236 + 3.162 = 5.398', () => {
    close(Math.hypot(2, 1) * Math.hypot(1, 3), Math.sqrt(50))
    close(Math.hypot(2, 1) + Math.hypot(1, 3), 5.398, 1e-3)
  })
  it('qc-degrees-in-euler: e^{iπ} = −1; reading 180 as radians misses by a mile', () => {
    close(expi(Math.PI).re, -1)
    close(expi(Math.PI).im, 0)
    expect(Math.hypot(expi(180).re + 1, expi(180).im)).toBeGreaterThan(0.3)
  })
  it('qc-global-phase-seen: multiplying by e^{iγ} keeps every interference chance the same, for any γ', () => {
    for (const g of [0, 1, 2.5, 4, 5.5]) close(abs2(phasorSum([g, g + Math.PI / 3], [0.5, 0.5])), 0.75)
  })
  it('qc-smear: halving μ_z halves the deflection (a smear of heights, not two fixed spots)', () => {
    close(sgDeflection({ ...P0, muZ: SILVER.muB / 2 }) / sgDeflection(P0), 0.5)
  })
  it('qc-superposition-is-mixture: an x magnet sends every |+x⟩ atom to the + spot, not half', () => {
    close(benchTheory({ source: '+x', axes: ['x'], keep: [] }).plus, 1)
  })
  it('qc-degree-exactly-two: (x² + x) + (−x² + 1) = x + 1 has no x² term (not closed)', () => {
    close(vadd(vec(0, 1, 1), vec(1, 0, -1))[2].re, 0)
  })
  it('qc-no-conjugate-3-4i: ⟨(3,4i)|(3,4i)⟩ = 25 with the conjugate; the bilinear form gives −7', () => {
    close(inner(vec(3, c(0, 4)), vec(3, c(0, 4))).re, 25)
    close(bilinear(vec(3, c(0, 4)), vec(3, c(0, 4))).re, -7)
  })
  it('qc-diagonal-everywhere: S_z in the x basis is (ħ/2)(0 1; 1 0), off-diagonal', () => {
    const sZinX = matmul(matmul(H, SZ), H)
    close(sZinX[0][0].re, 0)
    close(sZinX[0][1].re, 0.5)
  })
  it('qc-floor-not-compatible: [S_x, S_y] = iħS_z (never 0), yet the floor vanishes at |+x⟩ since ⟨S_z⟩ = 0', () => {
    const comm = commutator(SX, SY)
    close(comm[0][0].im, 0.5) // iħS_z has top-left entry i(1/2), so its imaginary part is 0.5
    close(varianceN(KET['+x'], SX), 0)
    close(expectation(SZ, KET['+x']), 0)
  })
  it('qc-cnot-copies: CNOT(a|0⟩+b|1⟩, 0) = a|00⟩+b|11⟩, not two copies of a|0⟩+b|1⟩', () => {
    const out = apply(cnot(), kron(vec(0.6, 0.8), KET['+z']))
    close(out[0].re, 0.6)
    close(out[3].re, 0.8)
    close(out[1].re, 0)
    close(out[2].re, 0)
    const twoCopies = kron(vec(0.6, 0.8), vec(0.6, 0.8))
    expect(Math.hypot(out[1].re - twoCopies[1].re, out[2].re - twoCopies[2].re)).toBeGreaterThan(0.1)
  })
  it('qc-circuit-order: the circuit H then Z is the matrix ZH (→ |−⟩), not HZ (→ |+⟩)', () => {
    const zh = apply(matmul(Z, H), KET['+z'])
    const hz = apply(matmul(H, Z), KET['+z'])
    close(zh[0].re, Math.SQRT1_2)
    close(zh[1].re, -Math.SQRT1_2)
    close(hz[0].re, Math.SQRT1_2)
    close(hz[1].re, Math.SQRT1_2)
  })
  it('qc-plus-chance-square: a chance is a size squared, |0.6+0.8i|²/2 = 0.5, not (0.6+0.8i)²/2', () => {
    const z = c(0.6, 0.8)
    close(abs2(z) / 2, 0.5)
    const wrong = mul(z, z)
    close(wrong.re / 2, -0.14)
    close(wrong.im / 2, 0.48)
  })
  it('every level of a written chapter trains a real chapter of it', () => {
    const all = [...QC_SG_LEVELS, ...QC_ERROR_ROUNDS, ...QC_GOLF_LEVELS].map((l) => l.trains)
    for (const t of all) {
      const lec = QC_CHAPTERS.find((l) => l.id === t.lecture)
      if (lec) expect(lec.units.map((u) => u.id), `${t.lecture} ${t.unit}`).toContain(t.unit)
    }
  })
  it('every round has at least three steps and one wrong step inside them', () => {
    for (const r of QC_ERROR_ROUNDS) {
      expect(r.steps.length).toBeGreaterThanOrEqual(3)
      expect(r.wrong).toBeGreaterThanOrEqual(0)
      expect(r.wrong).toBeLessThan(r.steps.length)
    }
  })
})

describe('709 Bloch golf', () => {
  for (const l of QC_GOLF_LEVELS) {
    it(`${l.id}: the solution reaches the target in par moves; nothing shorter does`, () => {
      expect(reached(applyMoves(l.start, l.solution), l.target)).toBe(true)
      expect(l.solution.length).toBe(l.par)
      for (let n = 0; n < l.par; n++) for (const s of sequences(n)) expect(reached(applyMoves(l.start, s), l.target), `${l.id} in ${n}`).toBe(false)
    })
  }
})

describe('709 Arcade index', () => {
  it('lists three games, each with levels and the chapters it trains', () => {
    expect(QC_GAMES.map((g) => g.kind)).toEqual(['sg-puzzle', 'spot-the-error', 'bloch-golf'])
    for (const g of QC_GAMES) {
      expect(g.levels).toBeGreaterThan(0)
      expect(g.trains.length).toBeGreaterThan(0)
    }
  })
  it('every 709 game id starts qc- and resolves to the 709 course', () => {
    for (const g of QC_GAMES) {
      expect(g.id.startsWith('qc-')).toBe(true)
      expect(courseOfId(g.id)).toBe('qc709')
    }
  })
})
