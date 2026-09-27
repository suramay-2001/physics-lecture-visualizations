/**
 * state.ts against numpy (block "state": np.kron, format(i, '0nb'), explicit basis-vector sums, reshape/transpose
 * coefficient matrices with np.linalg.svd/matrix_rank, and embed via kron + qubit PERMUTATION matrices), plus
 * properties: kron norms multiply, (A⊗B)(u⊗v) = Au⊗Bv, embed is unitary for unitary A.
 */
import { describe, expect, it } from 'vitest'
import { c } from '../complex'
import { type Vec, apply, isUnitary, norm } from '../linalg'
import { rng } from '../random'
import { randomUnitary, svd } from './cmat'
import {
  BELL_BASIS,
  basisKet,
  bell,
  bitsOfIndex,
  coefMatrix,
  embed,
  ghz,
  indexOfBits,
  isNormalized,
  isProduct,
  ket,
  kron,
  kronAll,
  kronM,
  meanAmplitude,
  nQubits,
  randomState,
  schmidtRank,
  wState,
} from './state'
import { FX, cm, cv, matGap, vecGap } from './testkit'

const D = FX.state

describe('kron and bit strings (F6)', () => {
  it('kron = np.kron; kronAll of three kets = reduce(np.kron)', () => {
    expect(vecGap(kron(cv(D.a), cv(D.b)), cv(D.ab))).toBeLessThan(1e-14)
    expect(vecGap(kronAll(D.k3.map(cv)), cv(D.k3all))).toBeLessThan(1e-14)
  })

  it('bitsOfIndex / indexOfBits = python format(i, "0nb") for n = 1…4, both ways; q0 is the most significant bit', () => {
    for (const [n, list] of Object.entries(D.bits) as [string, string[]][])
      list.forEach((s, i) => {
        expect(bitsOfIndex(i, Number(n))).toBe(s)
        expect(indexOfBits(s)).toBe(i)
        expect(indexOfBits([...s].map(Number))).toBe(i)
      })
    expect(indexOfBits('100')).toBe(4)
    expect(() => bitsOfIndex(8, 3)).toThrow()
    expect(() => indexOfBits('012')).toThrow()
  })

  it('named states: Bell by content, GHZ, W, ket labels with ±', () => {
    for (const [content, v] of Object.entries(D.named.bell)) expect(vecGap(bell(content), cv(v as never))).toBeLessThan(1e-15)
    expect(vecGap(ghz(3), cv(D.named.ghz3))).toBeLessThan(1e-15)
    expect(vecGap(ghz(4), cv(D.named.ghz4))).toBeLessThan(1e-15)
    expect(vecGap(wState(3), cv(D.named.w3))).toBeLessThan(1e-15)
    expect(vecGap(wState(4), cv(D.named.w4))).toBeLessThan(1e-15)
    expect(vecGap(ket('0-'), cv(D.named.ket0m))).toBeLessThan(1e-15)
    expect(vecGap(ket('+1-'), cv(D.named.ketp1m))).toBeLessThan(1e-15)
  })

  it('Bell aliases are the STANDARD names (decisions #1): Φ± = 00±11, Ψ± = 01±10', () => {
    expect(bell('Phi+')).toEqual(bell('00+11'))
    expect(bell('Φ−')).toEqual(bell('00-11'))
    expect(bell('Psi+')).toEqual(bell('01+10'))
    expect(bell('Ψ-')).toEqual(bell('01-10'))
    expect(BELL_BASIS.map((b) => b.name)).toEqual(['Φ+', 'Φ−', 'Ψ+', 'Ψ−'])
    expect(bell('000+111')).toEqual(ghz(3))
    for (const bad of ['00+00', '0+11', 'xx', '00*11']) expect(() => bell(bad)).toThrow()
  })

  it('the basis ket of index i has its 1 at i; nQubits rejects a length that is not a power of two', () => {
    expect(basisKet(5, 3)[5]).toEqual(c(1))
    expect(vecGap(basisKet(indexOfBits('101'), 3), ket('101'))).toBe(0)
    expect(nQubits(1024)).toBe(10)
    expect(() => nQubits(6)).toThrow()
  })
})

describe('coefficient matrices, Schmidt rank and product tests', () => {
  it('coefMatrix = reshape/transpose for any cut (unsorted too); singular values = np.linalg.svd; rank = matrix_rank', () => {
    for (const k of D.cuts) {
      const psi = cv(k.psi)
      const C = coefMatrix(psi, k.A)
      expect(matGap(C, cm(k.C))).toBeLessThan(1e-15)
      svd(C).s.forEach((s, i) => expect(Math.abs(s - k.s[i])).toBeLessThan(1e-10))
      expect(schmidtRank(psi, k.A)).toBe(k.rank)
      expect(isProduct(psi, k.A)).toBe(k.rank === 1)
      expect(isProduct(psi)).toBe(k.fullyProduct)
    }
  })

  it('F6 D3: a two-qubit state is a product ⇔ ψ₀₀ψ₁₁ − ψ₀₁ψ₁₀ = 0; Bell states are not, |00⟩ and |+−⟩ are', () => {
    for (const b of BELL_BASIS) expect(isProduct(b.ket)).toBe(false)
    expect(isProduct(ket('00'))).toBe(true)
    expect(isProduct(ket('+-'))).toBe(true)
    expect(isProduct(ghz(3), [0])).toBe(false)
    expect(isProduct(wState(3), [2])).toBe(false)
  })
})

describe('embed (A on any wires, with controls) = kron + permutation matrices', () => {
  it('matches numpy for sorted, unsorted, non-adjacent and controlled wires', () => {
    for (const k of D.embeds) expect(matGap(embed(cm(k.U), k.n, k.targets, k.controls), cm(k.M))).toBeLessThan(1e-12)
  })

  it('properties: embed of a unitary is unitary; (A⊗B)(u⊗v) = Au⊗Bv; ‖u⊗v‖ = ‖u‖‖v‖; randomState is normalized', () => {
    const R = rng(7094)
    for (let t = 0; t < 10; t++) {
      const U = randomUnitary(4, R)
      expect(isUnitary(embed(U, 4, [3, 1], [0]), 1e-10)).toBe(true)
      const A = randomUnitary(2, R)
      const B = randomUnitary(4, R)
      const u: Vec = randomState(1, R)
      const v: Vec = randomState(2, R)
      expect(vecGap(apply(kronM(A, B), kron(u, v)), kron(apply(A, u), apply(B, v)))).toBeLessThan(1e-12)
      expect(Math.abs(norm(kron(u, v)) - norm(u) * norm(v))).toBeLessThan(1e-12)
      expect(isNormalized(randomState(1 + (t % 5), R))).toBe(true)
    }
    expect(() => embed(randomUnitary(2, R), 7, [0])).toThrow(/6 qubits/)
    expect(() => embed(randomUnitary(2, R), 3, [1], [1])).toThrow(/twice/)
  })
})

describe('meanAmplitude: the mean the amplitudes stage draws (Grover inversion about the mean)', () => {
  it('is (1/N) Σ ψ_k; the uniform state’s mean is 1/√N; 2|s⟩⟨s| − I maps each a_k to 2·mean − a_k', () => {
    const N = 8
    const s = Array.from({ length: N }, () => c(1 / Math.sqrt(N)))
    expect(meanAmplitude(s).re).toBeCloseTo(1 / Math.sqrt(N), 15)
    expect(meanAmplitude(bell('00+11'))).toEqual(c(Math.SQRT1_2 / 2, 0))
    const psi = randomState(3, rng(7))
    const m = meanAmplitude(psi)
    // (2|s⟩⟨s| − I)ψ, built from the inner product ⟨s|ψ⟩ (an independent route)
    let sre = 0
    let sim = 0
    for (let k = 0; k < N; k++) {
      sre += psi[k].re / Math.sqrt(N)
      sim += psi[k].im / Math.sqrt(N)
    }
    for (let k = 0; k < N; k++) {
      const out = { re: (2 * sre) / Math.sqrt(N) - psi[k].re, im: (2 * sim) / Math.sqrt(N) - psi[k].im }
      expect(Math.hypot(out.re - (2 * m.re - psi[k].re), out.im - (2 * m.im - psi[k].im))).toBeLessThan(1e-14)
    }
  })
})
