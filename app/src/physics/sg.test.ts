import { describe, expect, it } from 'vitest'
import { benchTheory, fireMany, averageDeflection, type Bench } from './sg'
import { rng } from './random'

const close = (a: number, b: number, eps = 1e-9) => expect(Math.abs(a - b)).toBeLessThan(eps)

describe('Stern–Gerlach benches (Lecture 1)', () => {
  it('oven → SGz: 50/50', () => {
    const t = benchTheory({ source: 'oven', axes: ['z'], keep: [] })
    close(t.plus, 0.5)
  })

  it('SGz(+) → SGz: all up again', () => {
    const t = benchTheory({ source: 'oven', axes: ['z', 'z'], keep: ['+'] })
    close(t.plus, 0.5)
    close(t.minus, 0)
    close(t.blocked[0], 0.5)
  })

  it('SGz(+) → SGx: random left/right', () => {
    const t = benchTheory({ source: 'oven', axes: ['z', 'x'], keep: ['+'] })
    close(t.plus, 0.25)
    close(t.minus, 0.25)
  })

  it('SGz(+) → SGx(+) → SGz: the z memory is erased', () => {
    const t = benchTheory({ source: 'oven', axes: ['z', 'x', 'z'], keep: ['+', '+'] })
    close(t.plus, 0.125)
    close(t.minus, 0.125)
  })

  it('prepared |+z⟩ → SG at 45°: P(+) = cos²(22.5°) ≈ 0.854; 3/4 needs 60°', () => {
    close(benchTheory({ source: '+z', axes: [45], keep: [] }).plus, Math.cos(Math.PI / 8) ** 2)
    close(benchTheory({ source: '+z', axes: [60], keep: [] }).plus, 0.75)
  })

  it('average deflection is n·m', () => {
    close(averageDeflection(45, 'z'), Math.SQRT1_2)
    close(averageDeflection('x', 'z'), 0)
    close(averageDeflection('y', 'y'), 1)
  })

  it('probabilities of all fates sum to 1', () => {
    const benches: Bench[] = [
      { source: 'oven', axes: ['z', 30, 'y'], keep: ['-', '+'] },
      { source: '+x', axes: ['y', 'x'], keep: ['+'] },
    ]
    for (const b of benches) {
      const t = benchTheory(b)
      close(t.plus + t.minus + t.blocked.reduce((a, x) => a + x, 0), 1)
    }
  })

  it('simulation agrees with theory within 5σ', () => {
    const b: Bench = { source: 'oven', axes: ['z', 45, 'x'], keep: ['+', '-'] }
    const N = 40000
    const t = fireMany(b, N, rng(1))
    const th = benchTheory(b)
    for (const [k, p] of [[t.plus, th.plus], [t.minus, th.minus]] as const) {
      expect(Math.abs(k / N - p)).toBeLessThan(5 * Math.sqrt((p * (1 - p)) / N))
    }
  })
})
