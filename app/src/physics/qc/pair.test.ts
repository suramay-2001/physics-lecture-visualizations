/**
 * Lecture 9's pair helpers against numpy (qc.json block "lecture9", pipeline/make_qc_fixtures.py): pairDet = np.linalg.det of
 * the reshaped coefficient matrix, udFamily = a scipy.linalg.expm turn of |ud⟩, namedPair = np.kron / a diagonal gate on
 * |+x⟩|+x⟩, covariancePM = E[ab] − E[a]E[b] over explicit ±1 arrays, classicalPair = an enumeration of the dealer's two deals
 * and np.outer for independent coins. Plus properties: a product's determinant is zero for any seeded product; no
 * normalized pair exceeds ½; the family is normalized and passes through the singlet; a factoring table has zero correlation.
 * The conventions are asserted by name: |u⟩ = |0⟩ = |+z⟩, Alice is the first letter, |ud⟩ = ket('01').
 */
import { describe, expect, it } from 'vitest'
import { abs, c } from '../complex'
import { norm } from '../linalg'
import { rng } from '../random'
import { classicalPair, correlatorC, covariancePM, marginals } from './info'
import { bell, coefMatrix, isProduct, ket, kron, namedPair, nQubits, pairDet, paramCount, randomState, udFamily } from './state'
import { FX, cv, cz, vecGap } from './testkit'

const D = FX.lecture9
const close = (a: number, b: number, eps = 1e-12) => expect(Math.abs(a - b), `${a} vs ${b}`).toBeLessThan(eps)

describe('pairDet = np.linalg.det of the reshaped coefficient matrix', () => {
  it('matches numpy on random, product, singlet and basis pairs', () => {
    expect(D.pairDet.length).toBeGreaterThan(10)
    for (const k of D.pairDet) {
      const z = pairDet(cv(k.psi))
      const ref = cz(k.det)
      close(z.re, ref.re)
      close(z.im, ref.im)
    }
  })

  it('is ψ_uu ψ_dd − ψ_ud ψ_du: the singlet gives ½, a basis pair 0, and the sign follows the swap of the two off-diagonal letters', () => {
    close(pairDet(bell('01-10')).re, 0.5)
    close(pairDet(bell('01+10')).re, -0.5)
    close(abs(pairDet(ket('01'))), 0)
    close(abs(pairDet(ket('00'))), 0)
    // the convention itself: the first letter is Alice's, so the cell (row u, column d) is ket('01')
    const C = coefMatrix(ket('01'), 1)
    expect([C[0][1].re, C[0][0].re, C[1][0].re, C[1][1].re]).toEqual([1, 0, 0, 0])
  })

  it('is zero for every seeded product of two single-spin states, with isProduct agreeing', () => {
    const R = rng(9001)
    for (let t = 0; t < 200; t++) {
      const psi = kron(randomState(1, R), randomState(1, R))
      expect(abs(pairDet(psi)), `product ${t}`).toBeLessThan(1e-12)
      expect(isProduct(psi, [0])).toBe(true)
    }
  })

  it('never exceeds ½ in size for a normalized pair (2000 seeded Haar-random states) and is nonzero exactly when the pair is entangled', () => {
    const R = rng(9002)
    let worst = 0
    for (let t = 0; t < 2000; t++) {
      const psi = randomState(2, R)
      const det = abs(pairDet(psi))
      worst = Math.max(worst, det)
      expect(det > 1e-9, `state ${t}`).toBe(!isProduct(psi, [0]))
    }
    expect(worst).toBeLessThanOrEqual(0.5 + 1e-12)
    expect(worst).toBeGreaterThan(0.4) // the bound is approached, not just respected
  })

  it('needs exactly two qubits', () => {
    expect(() => pairDet(ket('0'))).toThrow()
    expect(() => pairDet(ket('000'))).toThrow()
  })
})

describe('udFamily(t) = cos t |ud⟩ − sin t |du⟩', () => {
  it('= scipy.linalg.expm of the (ud, du) rotation applied to |ud⟩, at 8 angles', () => {
    for (const k of D.udFamily) expect(vecGap(udFamily(k.t), cv(k.psi))).toBeLessThan(1e-14)
  })

  it('starts at the product |ud⟩, passes through the singlet at 45°, and stays normalized; its test value is ½ sin 2t', () => {
    expect(vecGap(udFamily(0), ket('01'))).toBeLessThan(1e-15)
    expect(vecGap(udFamily(Math.PI / 4), bell('01-10'))).toBeLessThan(1e-15)
    expect(vecGap(udFamily(Math.PI / 2), [c(0), c(0), c(-1), c(0)])).toBeLessThan(1e-15)
    for (let deg = -180; deg <= 180; deg += 7.5) {
      const t = (deg * Math.PI) / 180
      const psi = udFamily(t)
      close(norm(psi), 1, 1e-14)
      close(pairDet(psi).re, 0.5 * Math.sin(2 * t), 1e-14)
    }
    close(pairDet(udFamily((15 * Math.PI) / 180)).re, 0.25)
    close(pairDet(udFamily((30 * Math.PI) / 180)).re, Math.sqrt(3) / 4)
    expect(isProduct(udFamily(0))).toBe(true)
    expect(isProduct(udFamily((10 * Math.PI) / 180))).toBe(false)
    expect(() => udFamily(Number.NaN)).toThrow()
  })
})

describe('namedPair: the exit check and its sign flip', () => {
  it("'uniform' = |+x⟩ ⊗ |+x⟩ (np.kron) and 'flip' = CZ|+x⟩|+x⟩ (a diagonal gate)", () => {
    expect(vecGap(namedPair('uniform'), cv(D.named.uniform))).toBeLessThan(1e-15)
    expect(vecGap(namedPair('flip'), cv(D.named.flip))).toBeLessThan(1e-15)
    expect(vecGap(namedPair('uniform'), ket('++'))).toBeLessThan(1e-15)
  })

  it('uniform factors (test value 0), flip does not (test value −½, as entangled as a pair can be)', () => {
    expect(isProduct(namedPair('uniform'), [0])).toBe(true)
    expect(isProduct(namedPair('flip'), [0])).toBe(false)
    close(abs(pairDet(namedPair('uniform'))), 0)
    close(pairDet(namedPair('flip')).re, -0.5)
    expect(nQubits(namedPair('flip'))).toBe(2)
    expect(() => namedPair('other' as never)).toThrow()
  })
})

describe('covariancePM and classicalPair (the dealer and independent coins)', () => {
  it('covariancePM = E[ab] − E[a]E[b] over explicit ±1 arrays, on 10 tables (4 hand-set, 6 seeded Dirichlet)', () => {
    for (const k of D.covariance) {
      close(covariancePM(k.pxy), k.cov)
      close(correlatorC(k.pxy), k.eAB)
      close(marginals(k.pxy).px[0] - marginals(k.pxy).px[1], k.eA)
      close(marginals(k.pxy).py[0] - marginals(k.pxy).py[1], k.eB)
    }
  })

  it("the dealer's table is the enumeration of his two deals; both means are 0, ⟨ab⟩ = −1, the correlation −1", () => {
    const T = classicalPair('dealer')
    T.forEach((row, i) => row.forEach((x, j) => close(x, D.dealer[i][j])))
    close(marginals(T).px[0] - marginals(T).px[1], 0)
    close(marginals(T).py[0] - marginals(T).py[1], 0)
    close(correlatorC(T), -1)
    close(covariancePM(T), -1)
  })

  it('independent coins give the np.outer table, which sums to 1 and has zero correlation for every chance', () => {
    for (const k of D.independent) {
      const T = classicalPair({ pA: k.pA, pB: k.pB })
      T.forEach((row, i) => row.forEach((x, j) => close(x, k.table[i][j])))
      close(T[0][0] + T[0][1] + T[1][0] + T[1][1], 1)
      close(covariancePM(T), 0)
    }
    // ⟨ab⟩ = ⟨a⟩⟨b⟩ for P_A(+1) = 0.7, P_B(+1) = 0.4: 0.4 · (−0.2) = −0.08
    close(correlatorC(classicalPair({ pA: 0.7, pB: 0.4 })), -0.08)
    close(covariancePM(classicalPair({ pA: 0.5, pB: 0.5 })), 0)
  })

  it('refuses chances outside 0…1, and a table that is not 2×2', () => {
    expect(() => classicalPair({ pA: 1.2, pB: 0.5 })).toThrow()
    expect(() => classicalPair({ pA: 0.5, pB: -0.1 })).toThrow()
    expect(() => covariancePM([[0.5, 0.5]])).toThrow()
  })
})

describe('the counting behind the pair-grid beats (paramCount)', () => {
  it('two separate spins need 4 real numbers, a general pair 6', () => {
    expect(paramCount(1).general).toBe(2)
    expect(paramCount(2)).toEqual({ general: 6, product: 4 })
  })
})
