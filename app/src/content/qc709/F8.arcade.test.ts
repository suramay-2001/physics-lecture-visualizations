/**
 * Chapter F8's six Arcade "Spot the error" rounds (P-F8-story §11.2): each wrong step is recomputed through the engine here, so the correction a round states is the engine's
 * number and the flagged step really is false (the generic checks of games.test.ts cover the shape and the chapter links).
 */
import { describe, expect, it } from 'vitest'
import { abs, c, sub } from '../../physics/complex'
import { phasorSum } from '../../physics/qc/complexExtra'
import { dftMatrix, dirichlet } from '../../physics/qc/fourier'
import { mod, modPow, multOrder, powersMod } from '../../physics/qc/numtheory'
import { orderFromPeak } from '../../physics/qc/fourier'
import { QC_ERROR_ROUNDS } from './games'
import { F8 } from './F8'

const round = (id: string) => QC_ERROR_ROUNDS.find((r) => r.id === id)!

describe('F8 Spot the error rounds', () => {
  it('there are six, each four steps long, each training a real unit of F8', () => {
    const mine = QC_ERROR_ROUNDS.filter((r) => r.trains.lecture === 'F8')
    expect(mine.map((r) => r.id)).toEqual(['qc-negative-mod', 'qc-every-order', 'qc-any-arrows-cancel', 'qc-numpy-sign', 'qc-more-arrows', 'qc-first-convergent'])
    expect(mine.map((r) => r.trains.unit)).toEqual(['f8-clock', 'f8-euclid', 'f8-roots', 'f8-dft', 'f8-geometric', 'f8-fractions'])
    for (const r of mine) {
      expect(r.steps).toHaveLength(4)
      expect(F8.units.map((u) => u.id)).toContain(r.trains.unit)
      expect(r.wrong).toBeGreaterThan(0)
      expect(r.id.startsWith('qc-')).toBe(true)
    }
  })
  it('qc-negative-mod: −3 mod 12 is 9, three marks back from 0; a remainder is never negative', () => {
    expect(mod(-3, 12)).toBe(9)
    expect(-3 + 12).toBe(9)
    for (let a = -30; a <= 30; a++) expect(mod(a, 12)).toBeGreaterThanOrEqual(0)
    const r = round('qc-negative-mod')
    expect(r.wrong).toBe(3)
    expect(r.steps[r.wrong]).toContain('$-3 \\bmod 12$ is $-3$')
    expect(r.why).toContain('mark 9')
    expect(r.why).toContain('$-3 \\bmod 12 = 9$')
  })
  it('qc-every-order: the powers of 3 mod 21 run 3, 9, 6, 18, 12, 15, 3 and never reach 1, each a multiple of 3, so 3 has no order', () => {
    expect(powersMod(3, 21, 8).slice(1)).toEqual([3, 9, 6, 18, 12, 15, 3])
    expect(powersMod(3, 21, 40).slice(1).every((v) => v !== 1 && v % 3 === 0)).toBe(true)
    expect(multOrder(3, 21)).toBeNull()
    const r = round('qc-every-order')
    expect(r.wrong).toBe(3)
    expect(r.steps[1]).toContain('3, 9, 6, 18, 12, 15, then 3 again')
    expect(r.steps[r.wrong]).toContain('so 3 has an order')
    expect(r.why).toContain('without ever reaching 1')
  })
  it('qc-any-arrows-cancel: arrows at 0°, 120° and 0° add to a sum of length 1.732, not 0, while the cube roots of unity add to 0', () => {
    const deg = (d: number[]) => d.map((x) => (x * Math.PI) / 180)
    expect(abs(phasorSum(deg([0, 120, 240])))).toBeCloseTo(0, 12)
    expect(abs(phasorSum(deg([0, 120, 0])))).toBeCloseTo(1.7321, 4)
    expect(abs(phasorSum(deg([0, 120, 0])))).toBeCloseTo(Math.sqrt(3), 12)
    const r = round('qc-any-arrows-cancel')
    expect(r.wrong).toBe(2)
    expect(r.steps[r.wrong]).toContain('Any three arrows of length 1 are three arrows like these')
    expect(r.why).toContain('1.732')
  })
  it('qc-numpy-sign: numpy’s fft divided by √N has the entries ω^(−jk)/√N, the conjugate of F_N, which is not F_N (numpy’s ifft with the orthonormal norm is F_N)', () => {
    const N = 8
    const F = dftMatrix(N)
    const fftOverRoot = Array.from({ length: N }, (_, k) => Array.from({ length: N }, (_, j) => c(Math.cos((2 * Math.PI * ((j * k) % N)) / N) / Math.sqrt(N), -Math.sin((2 * Math.PI * ((j * k) % N)) / N) / Math.sqrt(N))))
    let worst = 0
    for (let k = 0; k < N; k++) for (let j = 0; j < N; j++) worst = Math.max(worst, abs(sub(fftOverRoot[k][j], F[k][j])))
    expect(worst).toBeGreaterThan(0.1)
    // it is exactly the conjugate
    for (let k = 0; k < N; k++) for (let j = 0; j < N; j++) expect(abs(sub(fftOverRoot[k][j], c(F[k][j].re, -F[k][j].im)))).toBeLessThan(1e-12)
    const r = round('qc-numpy-sign')
    expect(r.wrong).toBe(2)
    expect(r.steps[r.wrong]).toContain('the same table as $F_N$')
    expect(r.why).toContain('conjugate')
  })
  it('qc-more-arrows: at half a step 64 arrows keep 0.6367, a little less than the 0.6407 of 8 arrows, and 2/π = 0.6366', () => {
    const d8 = dirichlet(8, 1 / 16)
    const d64 = dirichlet(64, 1 / 128)
    expect(d8).toBeCloseTo(0.6407, 4)
    expect(d64).toBeCloseTo(0.6367, 4)
    expect(d64).toBeLessThan(d8)
    expect(d64).toBeGreaterThan(2 / Math.PI)
    expect(2 / Math.PI).toBeCloseTo(0.6366, 4)
    const r = round('qc-more-arrows')
    expect(r.wrong).toBe(2)
    expect(r.steps[0]).toContain('0.6407')
    expect(r.steps[r.wrong]).toContain('More arrows keep more of the length')
    expect(r.why).toContain('0.6367')
    expect(r.why).toContain('0.6366')
  })
  it('qc-first-convergent: the candidate 3 from 11/32 fails the test, since 2³ mod 21 = 8, and the convergent test on bar 11 finds no period', () => {
    expect(modPow(2, 3, 21)).toBe(8)
    expect(orderFromPeak(11, 5, 2, 21)).toBeNull()
    expect(orderFromPeak(5, 5, 2, 21)).toBe(6)
    expect(6 % 3).toBe(0)
    const r = round('qc-first-convergent')
    expect(r.wrong).toBe(3)
    expect(r.steps[2]).toContain('$2^3 \\bmod 21 = 8$')
    expect(r.steps[r.wrong]).toContain('we accept 3 as the period')
    expect(r.why).toContain('$2^3 = 8$ fails')
  })
})
