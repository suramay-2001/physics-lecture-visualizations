/**
 * qc/channels.ts against numpy (block "channels": explicit Kraus matrices, np.kron for the Choi matrix, closed-form
 * SWAP/|Φ⟩⟨Φ| for the two non-physical maps' Choi matrices), plus properties: every named channel is CPTP (isCPTP,
 * Choi positive) and keeps a density matrix a density matrix; transposeMap/unotMap are trace-preserving but NOT
 * completely positive (a negative Choi eigenvalue); composeChannels and pauliTwirl match a direct apply-then-apply
 * / apply-to-rotated-basis route.
 */
import { describe, expect, it } from 'vitest'
import { type Mat, dagger, identity, matmul } from '../linalg'
import { rng } from '../random'
import { eigh, traceN } from './cmat'
import {
  amplitudeDamping,
  applyKraus,
  bitFlip,
  choi,
  choiIsPositive,
  composeChannels,
  dephasing,
  depolarizing,
  isCPTP,
  pauliTwirl,
  transposeMap,
  unotMap,
} from './channels'
import { densityOf, isDensity, randomDensity } from './density'
import { randomState } from './state'
import { FX, cm, matGap } from './testkit'

const CH = FX.channels
const BUILDERS: Record<string, (p: number) => Mat[]> = { depolarizing, dephasing, bitFlip, amplitudeDamping }
const close = (a: number, b: number, eps = 1e-9) => expect(Math.abs(a - b), `${a} vs ${b}`).toBeLessThan(eps)
const sumKdK = (ks: readonly Mat[]): Mat => ks.map((K) => matmul(dagger(K), K)).reduce((a, b) => a.map((row, i) => row.map((x, j) => ({ re: x.re + b[i][j].re, im: x.im + b[i][j].im }))))

describe('named channels against numpy (explicit Kraus matrices, np.kron Choi)', () => {
  it('the Kraus operators, applyKraus, ΣK†K, and the Choi matrix all match the fixture for every (channel, parameter)', () => {
    for (const k of CH.named) {
      const ks = BUILDERS[k.name](k.p)
      const want: Mat[] = k.kraus.map(cm)
      ks.forEach((K, i) => expect(matGap(K, want[i]), `${k.name}(${k.p}) Kraus[${i}]`).toBeLessThan(1e-12))
      const rho = cm(k.rho)
      expect(matGap(applyKraus(ks, rho), cm(k.applied))).toBeLessThan(1e-10)
      expect(matGap(sumKdK(ks), cm(k.sumKdK))).toBeLessThan(1e-10)
      const J = choi(ks)
      expect(matGap(J, cm(k.choi))).toBeLessThan(1e-9)
      eigh(J).values.forEach((v, i) => close(v, k.choiEig[i], 1e-9))
    }
  })

  it('every named channel is CPTP: isCPTP(ks) and choiIsPositive(choi(ks)) are both true', () => {
    for (const k of CH.named) {
      const ks = BUILDERS[k.name](k.p)
      expect(isCPTP(ks), `${k.name}(${k.p})`).toBe(true)
      expect(choiIsPositive(choi(ks)), `${k.name}(${k.p}) Choi`).toBe(true)
    }
  })

  it('property: applyKraus keeps a density matrix a density matrix (trace 1, PSD) for every named channel, on random inputs', () => {
    const R = rng(70901)
    for (const [name, builder] of Object.entries(BUILDERS)) {
      for (const p of [0, 0.05, 0.37, 0.6, 1]) {
        const ks = builder(p)
        for (let t = 0; t < 5; t++) {
          const rho = randomDensity(2, R, 1 + (t % 2))
          expect(isDensity(applyKraus(ks, rho), 1e-8), `${name}(${p}) applied to a random mixed ρ`).toBe(true)
        }
        expect(isDensity(applyKraus(ks, densityOf(randomState(1, R))), 1e-8), `${name}(${p}) applied to a pure ρ`).toBe(true)
      }
    }
  })

  it('p = 0 is the identity channel for all four; depolarizing(¾) sends ANY state to the maximally mixed state (its Bloch-radius factor 1 − 4p/3 is exactly 0 there)', () => {
    const rho = randomDensity(2, rng(70902))
    for (const builder of [depolarizing, dephasing, bitFlip]) expect(matGap(applyKraus(builder(0), rho), rho)).toBeLessThan(1e-12)
    expect(matGap(applyKraus(amplitudeDamping(0), rho), rho)).toBeLessThan(1e-12)
    const maxMixed = cm([[[0.5, 0], [0, 0]], [[0, 0], [0.5, 0]]])
    expect(matGap(applyKraus(depolarizing(0.75), rho), maxMixed)).toBeLessThan(1e-9)
    expect(matGap(applyKraus(depolarizing(0.75), densityOf(randomState(1, rng(70903)))), maxMixed)).toBeLessThan(1e-9)
  })
})

describe('composeChannels and pauliTwirl against a direct apply-then-apply / apply-to-rotated-basis route', () => {
  it('composeChannels(A, B) applied once = applyKraus(B, applyKraus(A, ·)) applied twice, against the fixture', () => {
    const A = depolarizing(0.2)
    const B = bitFlip(0.3)
    const rho = cm(CH.compose.rhoIn)
    const composed = composeChannels(A, B)
    expect(isCPTP(composed)).toBe(true)
    expect(matGap(applyKraus(composed, rho), applyKraus(B, applyKraus(A, rho)))).toBeLessThan(1e-10)
    expect(matGap(applyKraus(composed, rho), cm(CH.compose.result))).toBeLessThan(1e-9)
  })

  it('composeChannels is associative in effect: (A then B) then C = A then (B then C), on a random ρ', () => {
    const R = rng(70909)
    const A = bitFlip(0.15)
    const B = dephasing(0.4)
    const C = depolarizing(0.3)
    const rho = randomDensity(2, R)
    const left = applyKraus(composeChannels(composeChannels(A, B), C), rho)
    const right = applyKraus(composeChannels(A, composeChannels(B, C)), rho)
    expect(matGap(left, right)).toBeLessThan(1e-9)
  })

  it('pauliTwirl of depolarizing(0.4) applied to the fixture ρ matches ¼Σ_P P·E(PρP)·P', () => {
    const ks = depolarizing(0.4)
    const twirled = pauliTwirl(ks)
    expect(isCPTP(twirled)).toBe(true)
    expect(matGap(applyKraus(twirled, cm(CH.twirl.rho)), cm(CH.twirl.result))).toBeLessThan(1e-9)
  })

  it('depolarizing is already a Pauli channel: Pauli-twirling it changes nothing (every PQP = ±Q for single-qubit Paulis)', () => {
    const R = rng(70904)
    const ks = depolarizing(0.4)
    const rho = randomDensity(2, R)
    expect(matGap(applyKraus(pauliTwirl(ks), rho), applyKraus(ks, rho))).toBeLessThan(1e-9)
  })
})

describe('transposeMap and unotMap: positive and trace-preserving, but NOT completely positive — the chapter\'s "impossible machines"', () => {
  it('match the fixture on a worked ρ', () => {
    const rho = cm(CH.nonphys.rho)
    expect(matGap(transposeMap(rho), cm(CH.nonphys.transposed))).toBe(0)
    expect(matGap(unotMap(rho), cm(CH.nonphys.unot))).toBeLessThan(1e-12)
  })

  it('property: both are trace-preserving on random density matrices', () => {
    const R = rng(70905)
    for (let t = 0; t < 20; t++) {
      const rho = randomDensity(2, R, 1 + (t % 2))
      close(traceN(transposeMap(rho)).re, 1, 1e-10)
      close(traceN(unotMap(rho)).re, 1, 1e-10)
    }
  })

  it('property: both are POSITIVE (map a density matrix to another density matrix)', () => {
    const R = rng(70906)
    for (let t = 0; t < 20; t++) {
      const rho = randomDensity(2, R, 1 + (t % 2))
      expect(isDensity(transposeMap(rho), 1e-8)).toBe(true)
      expect(isDensity(unotMap(rho), 1e-8)).toBe(true)
    }
  })

  it('are NOT completely positive: their Choi matrices match the fixture spectrum and have a NEGATIVE eigenvalue', () => {
    const d = CH.nonphys.d
    const Jt = choi(transposeMap, d)
    const Ju = choi(unotMap, d)
    eigh(Jt).values.forEach((v, i) => close(v, CH.nonphys.choiTransposeEig[i]))
    eigh(Ju).values.forEach((v, i) => close(v, CH.nonphys.choiUnotEig[i]))
    expect(choiIsPositive(Jt)).toBe(false)
    expect(choiIsPositive(Ju)).toBe(false)
    expect(eigh(Jt).values[0]).toBeLessThan(-1e-6)
    expect(eigh(Ju).values[0]).toBeLessThan(-1e-6)
  })

  it('sanity: a genuinely CP map (the identity map) has a POSITIVE Choi matrix — the contrast that makes "not CP" visible', () => {
    const J = choi((rho: Mat) => rho, 2)
    expect(choiIsPositive(J)).toBe(true)
    expect(eigh(J).values[0]).toBeGreaterThanOrEqual(-1e-9)
  })

  it('unotMap is an involution on a qubit (d = 2): applying it twice returns ρ', () => {
    const R = rng(70907)
    for (let t = 0; t < 10; t++) {
      const rho = randomDensity(2, R)
      expect(matGap(unotMap(unotMap(rho)), rho)).toBeLessThan(1e-9)
    }
  })

  it('mutation guard: transposeMap must NOT conjugate — a conjugate transpose (ρ†= ρ for Hermitian ρ, i.e. a no-op) would be a DIFFERENT, completely positive map and would wrongly pass the "not CP" test above for the wrong reason', () => {
    const rho = randomDensity(2, rng(70908))
    const conjugateTranspose = rho.map((row, i) => row.map((_, j) => ({ re: rho[j][i].re, im: -rho[j][i].im })))
    expect(matGap(transposeMap(rho), rho)).toBeGreaterThan(1e-6) // transposeMap(ρ) ≠ ρ in general (ρ has nonzero imaginary off-diagonal parts)
    expect(matGap(conjugateTranspose, rho)).toBe(0) // ρ† = ρ always (Hermitian) — the two maps are genuinely different
  })
})

describe('isCPTP rejects an incomplete or over-complete Kraus set', () => {
  it('the trivial (no-op) channel passes; a doubled identity (ΣK†K = 2I) fails', () => {
    expect(isCPTP([identity(2)])).toBe(true)
    expect(isCPTP([identity(2), identity(2)])).toBe(false)
  })

  it('every named channel fails isCPTP if its last Kraus operator is dropped (breaks completeness)', () => {
    for (const builder of [depolarizing, bitFlip, dephasing, amplitudeDamping]) expect(isCPTP(builder(0.3).slice(0, -1))).toBe(false)
  })
})
