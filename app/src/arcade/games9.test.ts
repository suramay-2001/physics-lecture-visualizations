/**
 * Arcade truth for Lecture 9 (P): each of the six Spot-the-error rounds names a slip, and its correction states the engine's
 * number (physics/qc: kron, classicalPair, ket, randomState, paramCount, namedPair). One round per unit; each trains a real unit.
 */
import { describe, expect, it } from 'vitest'
import { LECTURES } from '../content'
import { c } from '../physics/complex'
import { type Vec, inner, norm2 } from '../physics/linalg'
import { rng } from '../physics/random'
import { classicalPair, correlatorC } from '../physics/qc/info'
import { isProduct, ket, kron, namedPair, paramCount, randomState } from '../physics/qc/state'
import { KET, samePhysicalState } from '../physics/spin'
import { ERROR_ROUNDS } from './games'

const close = (a: number, b: number, eps = 1e-12) => expect(Math.abs(a - b)).toBeLessThan(eps)
const uniform = (n: number): Vec => Array.from({ length: n }, () => c(1 / Math.sqrt(n)))
const L9_ROUNDS = ERROR_ROUNDS.filter((r) => r.trains.lecture === 'L9')

describe('Spot the error: Lecture 9', () => {
  it('has one round for each unit of the lecture, each training a real unit with a wrong step inside it', () => {
    const units = LECTURES.find((l) => l.id === 'L9')!.units.map((u) => u.id)
    expect(L9_ROUNDS.map((r) => r.trains.unit)).toEqual(units)
    expect(L9_ROUNDS.map((r) => r.id)).toEqual(['dims-add', 'correlated-so-quantum', 'ud-is-du', 'normalize-the-product', 'eight-parameters', 'four-terms-entangled'])
    for (const r of L9_ROUNDS) {
      expect(r.steps).toHaveLength(4)
      expect(r.wrong).toBe(2)
    }
  })

  it('dims-add: photon ⊗ die has 2 · 6 = 12 basis states, not 2 + 6 = 8', () => {
    expect(kron(uniform(2), uniform(6))).toHaveLength(12)
    expect(2 + 6).not.toBe(12)
  })
  it('correlated-so-quantum: the dealer’s table of chances already gives ⟨σ_Aσ_B⟩ = −1 (no state vector, no phases)', () => {
    close(correlatorC(classicalPair('dealer')), -1)
  })
  it('ud-is-du: ⟨ud|du⟩ = 0, since Alice’s letter comes first', () => {
    close(inner(ket('01'), ket('10')).re, 0)
    close(inner(ket('01'), ket('01')).re, 1)
  })
  it('normalize-the-product: the four chances of any product of normalized spins already add to 1 (50 seeded pairs)', () => {
    const R = rng(909)
    for (let k = 0; k < 50; k++) close(norm2(kron(randomState(1, R), randomState(1, R))), 1, 1e-12)
  })
  it('eight-parameters: 8 − 1 − 1 = 6 for a general pair, 4 for two separate spins', () => {
    expect(paramCount(2)).toEqual({ general: 6, product: 4 })
  })
  it('four-terms-entangled: ½(uu + ud + du + dd) is |+x⟩ ⊗ |+x⟩, a product', () => {
    expect(isProduct(namedPair('uniform'), [0])).toBe(true)
    expect(samePhysicalState(namedPair('uniform'), kron(KET['+x'], KET['+x']))).toBe(true)
  })
})
