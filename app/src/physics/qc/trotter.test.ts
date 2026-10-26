/**
 * qc/trotter.ts against numpy (pipeline/make_walk_fixtures.py → __fixtures__/qc-walk.json: np.kron Paulis, scipy.linalg.expm, np.linalg.norm(·, 2)), plus the
 * cross-checks of P-Q19-story §9.1 (the closed-form bond is the exponential; trotterU(M=1, order 1) = U₂U₁; the circuit's matrix is the product; the hopping
 * matrix reproduces the one-flip chances) and properties (unitarity, the 1/M and 1/M² laws, the bound).
 */
import { describe, expect, it } from 'vitest'
import raw from '../__fixtures__/qc-walk.json?raw'
import { c } from '../complex'
import { type Mat, identity, isUnitary, matmul, maxDiff } from '../linalg'
import { circuitUnitary, runCircuit, validateCircuit } from './circuit'
import {
  amplitudeCount,
  amplitudePB,
  bondClosedGap,
  bondH,
  bondSwapChance,
  chainH,
  chainTerms,
  chainU,
  commutatorNorm,
  heisenbergBond,
  heisenbergBondExpm,
  magnonBlockGap,
  magnonChances,
  magnonHopping,
  magnonRoutesGap,
  swapIdentityGap,
  trotterBound,
  trotterCircuit,
  trotterError,
  trotterMFor,
  trotterU,
} from './trotter'
import { embed } from './state'

const FX: any = JSON.parse(raw)
const cm = (m: [number, number][][]): Mat => m.map((row) => row.map(([re, im]) => c(re, im)))
const gap = (a: number[], b: number[]): number => Math.max(0, ...a.map((x, i) => Math.abs(x - b[i])))

describe('one bond', () => {
  it('XX + YY + ZZ = 2 SWAP − I, so the bond is e^{-iJt/4}[cos(Jt/2) I + i sin(Jt/2) SWAP]', () => {
    expect(swapIdentityGap()).toBeLessThan(1e-15)
    for (const Jt of [0.3, 0.7, Math.PI, 2.5]) {
      expect(maxDiff(heisenbergBond(Jt), cm(FX.trotter.bond[String(Jt)])), `closed form vs scipy, Jt = ${Jt}`).toBeLessThan(1e-13)
      expect(maxDiff(heisenbergBondExpm(Jt), cm(FX.trotter.bond[String(Jt)])), `eigenbasis vs scipy, Jt = ${Jt}`).toBeLessThan(1e-13)
      expect(bondClosedGap(Jt)).toBeLessThan(1e-13)
      expect(isUnitary(heisenbergBond(Jt), 1e-12)).toBe(true)
    }
    expect(maxDiff(bondH(0.8), bondH(1).map((row) => row.map((z) => c(z.re * 0.8, z.im * 0.8))))).toBeLessThan(1e-15)
  })
  it('at Jt = π the bond is a pure swap: |10> → |01> with chance 1; at Jt = π/2 it is half and half', () => {
    expect(bondSwapChance(Math.PI)).toBeCloseTo(1, 14)
    expect(bondSwapChance(Math.PI / 2)).toBeCloseTo(0.5, 14)
    expect(bondSwapChance(0)).toBeCloseTo(0, 14)
  })
})

describe('the chain', () => {
  it('H and U(t) equal numpy (J = 1, N = 3; J = 0.8, N = 4)', () => {
    expect(maxDiff(chainH(3, 1), cm(FX.trotter.H['3']))).toBeLessThan(1e-14)
    expect(maxDiff(chainH(4, 0.8), cm(FX.trotter.H['4']))).toBeLessThan(1e-14)
    expect(maxDiff(chainU(3, 1, 2), cm(FX.trotter.U['3_1_2']))).toBeLessThan(1e-12)
    expect(maxDiff(chainU(4, 0.8, 1.5), cm(FX.trotter.U['4_0.8_1.5']))).toBeLessThan(1e-12)
    expect(() => chainH(7)).toThrow()
    expect(() => chainH(1)).toThrow()
  })
  it('neighbouring bonds do not commute: ‖[H₁, H₂]‖ = √3/4; far bonds do', () => {
    expect(Math.abs(commutatorNorm(3, 1) - FX.trotter.comm)).toBeLessThan(1e-12)
    expect(commutatorNorm(3, 1)).toBeCloseTo(Math.sqrt(3) / 4, 12)
    expect(commutatorNorm(4, 1, 0, 2)).toBeLessThan(1e-12)
    expect(commutatorNorm(3, 2)).toBeCloseTo(Math.sqrt(3), 12) // scales as J²: 4 × 0.433
  })
})

describe("Trotter's product", () => {
  it('trotterU(M = 1, order 1) = U₂U₁ and is unitary', () => {
    const U1 = matmul(heisenbergBondOnChain(0, 2), identity(8))
    const U2 = heisenbergBondOnChain(1, 2)
    expect(maxDiff(trotterU(3, 1, 2, 1, 1), matmul(U2, U1))).toBeLessThan(1e-13)
    expect(isUnitary(trotterU(3, 1, 2, 5, 2), 1e-12)).toBe(true)
  })
  it('the operator-norm errors equal numpy (order 1 and 2; N = 3 and N = 4)', () => {
    for (const M of Object.keys(FX.trotter.err1)) expect(Math.abs(trotterError(3, 1, 2, Number(M), 1) - FX.trotter.err1[M]), `order 1, M = ${M}`).toBeLessThan(1e-11)
    for (const M of Object.keys(FX.trotter.err2)) expect(Math.abs(trotterError(3, 1, 2, Number(M), 2) - FX.trotter.err2[M]), `order 2, M = ${M}`).toBeLessThan(1e-11)
    expect(Math.abs(trotterError(4, 0.8, 1.5, 3, 1) - FX.trotter.n4.err1_M3)).toBeLessThan(1e-11)
    expect(Math.abs(trotterError(4, 0.8, 1.5, 3, 2) - FX.trotter.n4.err2_M3)).toBeLessThan(1e-11)
  })
  it('the error halves as M doubles (order 1) and quarters (order 2); the bound holds', () => {
    expect(trotterError(3, 1, 2, 16, 1) / trotterError(3, 1, 2, 32, 1)).toBeGreaterThan(1.99)
    expect(trotterError(3, 1, 2, 16, 1) / trotterError(3, 1, 2, 32, 1)).toBeLessThan(2.01)
    expect(trotterError(3, 1, 2, 8, 2) / trotterError(3, 1, 2, 16, 2)).toBeGreaterThan(3.9)
    expect(trotterError(3, 1, 2, 8, 2) / trotterError(3, 1, 2, 16, 2)).toBeLessThan(4.1)
    expect(Math.abs(trotterBound(3, 1, 2, 8) - FX.trotter.bound1_M8)).toBeLessThan(1e-12)
    expect(trotterBound(3, 1, 2, 8)).toBeCloseTo(0.1083, 4)
    for (const M of [1, 2, 4, 8, 16]) expect(trotterError(3, 1, 2, M, 1)).toBeLessThanOrEqual(trotterBound(3, 1, 2, M) + 1e-12)
    expect(trotterError(3, 1, 2, 1, 1)).toBeCloseTo(0.7327, 4)
    expect(trotterError(3, 1, 2, 8, 1)).toBeCloseTo(0.0911, 4)
  })
  it('the least M with error < 0.05 at t = 2: 15 (order 1) and 3 (order 2)', () => {
    expect(trotterMFor(3, 1, 2, 1, 0.05)).toBe(FX.trotter.mFor05['1'])
    expect(trotterMFor(3, 1, 2, 2, 0.05)).toBe(FX.trotter.mFor05['2'])
    expect([trotterMFor(3, 1, 2, 1, 0.05), trotterMFor(3, 1, 2, 2, 0.05)]).toEqual([15, 3])
    expect(trotterError(3, 1, 2, 14, 1)).toBeGreaterThan(0.05)
    expect(trotterError(3, 1, 2, 15, 1)).toBeLessThan(0.05)
    expect(trotterMFor(3, 1, 2, 1, 1e-9, 5)).toBeNull()
  })
})

// bond gate b on a 3-spin chain, from the closed form (the same construction a circuit box places)
function heisenbergBondOnChain(b: number, Jt: number): Mat {
  return embed(heisenbergBond(Jt), 3, [b, b + 1])
}

describe('a flipped spin on three sites', () => {
  it('exact chances equal scipy and the hopping matrix; the Trotter chances equal numpy', () => {
    expect(gap(magnonChances(3, 1, 2), FX.trotter.magnon.exact)).toBeLessThan(1e-12)
    expect(gap(magnonHopping(3, 1, 2), FX.trotter.magnon.hopping)).toBeLessThan(1e-12)
    expect(magnonRoutesGap(3, 1, 2)).toBeLessThan(1e-12)
    expect(magnonBlockGap(3, 1)).toBeLessThan(1e-14)
    expect(magnonBlockGap(4, 0.7)).toBeLessThan(1e-14)
    for (const M of [1, 2, 4, 8]) expect(gap(magnonChances(3, 1, 2, M, 1), FX.trotter.magnon[`t1_${M}`]), `order 1, M = ${M}`).toBeLessThan(1e-11)
    for (const M of [1, 2, 4]) expect(gap(magnonChances(3, 1, 2, M, 2), FX.trotter.magnon[`t2_${M}`]), `order 2, M = ${M}`).toBeLessThan(1e-11)
    expect(magnonChances(3, 1, 2).reduce((s, x) => s + x, 0)).toBeCloseTo(1, 12)
    expect(magnonChances(3, 1, 2, 1)[2]).toBeCloseTo(0.5014, 4)
    expect(magnonChances(3, 1, 2, 8)[2]).toBeCloseTo(0.2027, 4)
  })
})

describe('the circuit', () => {
  it('is valid; its matrix is the Trotter product; its run reproduces the chances', () => {
    for (const [M, order] of [[1, 1], [4, 1], [2, 2]] as const) {
      const circ = trotterCircuit(M, order)
      expect(validateCircuit(circ).ok, `M = ${M}, order ${order}`).toBe(true)
      expect(circ.columns.length).toBe(order === 1 ? 2 * M : 3 * M)
      expect(maxDiff(circuitUnitary(circ), trotterU(3, 1, 2, M, order))).toBeLessThan(1e-12)
    }
    const run = runCircuit(trotterCircuit(8, 1))
    const psi = run.states[run.states.length - 1]
    const chances = [psi[4], psi[2], psi[1]].map((z) => z.re ** 2 + z.im ** 2)
    expect(gap(chances, magnonChances(3, 1, 2, 8, 1))).toBeLessThan(1e-12)
    expect(trotterCircuit(1, 1, 2, 1).init).toBe('100')
    expect(() => trotterCircuit(0)).toThrow()
  })
})

describe('the 2^N wall', () => {
  it('2^50 amplitudes, 18.0 PB, 49 terms', () => {
    expect(amplitudeCount(50)).toBe(1125899906842624)
    expect(amplitudePB(50)).toBeCloseTo(18.014, 3)
    expect(chainTerms(50)).toBe(49)
    expect(() => amplitudeCount(-1)).toThrow()
  })
})
