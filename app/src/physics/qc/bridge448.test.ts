/**
 * The 709 ↔ 448 bridge (decisions/qc709-map.md #2, #8; C1, C6, C7, C14): the qubit engine uses the SAME conventions
 * as the spin engine, so a bridge from a 709 chapter to a 448 lecture never changes a sign or a phase.
 *   |0⟩ ≡ |+z⟩ (north), |1⟩ ≡ |−z⟩; H|0⟩ = |+x⟩; X, Y, Z = σ_x, σ_y, σ_z; S = P(π/2), T = P(π/4) with P = phaseShift;
 *   R_n(θ) = e^{−iθ n·σ/2} = spin.rotation (R_z(2π) = −I); the notes' z→x change of basis U is H (U_notes = B†).
 */
import { describe, expect, it } from 'vitest'
import { c } from '../complex'
import { identity, matmul, mscale } from '../linalg'
import { classify, evolve } from '../operators'
import { KET, Rz as spinRz, SIGMA_X, SIGMA_Y, SIGMA_Z, SX, SZ, basisChange, blochVector, phaseShift, rotation } from '../spin'
import { changeU, expmHermitian } from './cmat'
import { reducedBloch } from './density'
import { H, P, Rx, Ry, Rz, S, T, X, Y, Z } from './gates'
import { ket } from './state'
import { matGap, vecGap } from './testkit'

describe('709 conventions are 448 conventions', () => {
  it('|0⟩ = |+z⟩ (north, Bloch vector +ẑ), |1⟩ = |−z⟩, |±⟩ = |±x⟩', () => {
    expect(vecGap(ket('0'), KET['+z'])).toBe(0)
    expect(vecGap(ket('1'), KET['-z'])).toBe(0)
    expect(vecGap(ket('+'), KET['+x'])).toBe(0)
    expect(vecGap(ket('-'), KET['-x'])).toBe(0)
    const same3 = (a: number[], b: number[]) => a.forEach((x, i) => expect(Math.abs(x - b[i])).toBeLessThan(1e-15))
    same3(blochVector(ket('0')), [0, 0, 1])
    same3(reducedBloch(ket('0'), 0), [0, 0, 1])
    same3(reducedBloch(ket('10'), 0), [0, 0, -1])
    same3(reducedBloch(ket('0+'), 1), blochVector(KET['+x']))
  })

  it('X, Y, Z are the Pauli matrices of spin.ts (S_i = σ_i/2)', () => {
    expect(matGap(X, SIGMA_X)).toBe(0)
    expect(matGap(Y, SIGMA_Y)).toBe(0)
    expect(matGap(Z, SIGMA_Z)).toBe(0)
  })

  it('H is the notes\' z→x change of basis: H = basisChange(z, x) = changeU([|+x⟩, |−x⟩]); H|0⟩ = |+x⟩, H|1⟩ = |−x⟩', () => {
    expect(matGap(H, basisChange('z', 'x'))).toBeLessThan(1e-15)
    expect(matGap(H, changeU([KET['+x'], KET['-x']]))).toBeLessThan(1e-15)
    expect(vecGap(matmul(H, [[c(1)], [c(0)]]).map((r) => r[0]), KET['+x'])).toBeLessThan(1e-15)
    expect(vecGap(matmul(H, [[c(0)], [c(1)]]).map((r) => r[0]), KET['-x'])).toBeLessThan(1e-15)
  })

  it('P(φ) = phaseShift(φ); S = P(π/2) (Bergou\'s F); T = P(π/4)', () => {
    expect(matGap(P(0.37), phaseShift(0.37))).toBe(0)
    expect(matGap(S, [[c(1), c(0)], [c(0), c(0, 1)]])).toBeLessThan(1e-15)
    expect(matGap(T, phaseShift(Math.PI / 4))).toBe(0)
  })

  it('R_x, R_y, R_z = spin.rotation about x̂, ŷ, ẑ; R_z = 448 Rz; R_z(2π) = −I, R_z(4π) = I (L7 §7.2)', () => {
    for (const th of [0.4, -1.9, 3.3]) {
      expect(matGap(Rx(th), rotation([1, 0, 0], th))).toBe(0)
      expect(matGap(Ry(th), rotation([0, 1, 0], th))).toBe(0)
      expect(matGap(Rz(th), spinRz(th))).toBe(0)
      expect(matGap(Rz(th), rotation([0, 0, 1], th))).toBeLessThan(1e-15)
    }
    expect(matGap(Rz(2 * Math.PI), mscale(identity(2), -1))).toBeLessThan(1e-15)
    expect(matGap(Rz(4 * Math.PI), identity(2))).toBeLessThan(1e-15)
  })

  it('R_z(φ) = e^{−iφS_z} by operators.ts evolve (closed form) and by cmat expmHermitian (eigenbasis); R_x likewise', () => {
    for (const phi of [0.9, -2.4, 2 * Math.PI]) {
      expect(matGap(Rz(phi), evolve(SZ, phi))).toBeLessThan(1e-14)
      expect(matGap(Rz(phi), expmHermitian(SZ, phi))).toBeLessThan(1e-14)
      expect(matGap(Rx(phi), evolve(SX, phi))).toBeLessThan(1e-14)
    }
  })

  it('operators.ts classify: H, X, Y, Z are Hermitian, unitary involutions; S and T are unitary but not Hermitian', () => {
    for (const G of [H, X, Y, Z]) expect(classify(G)).toMatchObject({ hermitian: true, unitary: true, involution: true })
    for (const G of [S, T]) expect(classify(G)).toMatchObject({ hermitian: false, unitary: true })
  })

  it('Q4 D2–D3: Z = i R_z(π), X = i R_x(π), H = i R_{(x̂+ẑ)/√2}(π)', () => {
    expect(matGap(mscale(Rz(Math.PI), c(0, 1)), Z)).toBeLessThan(1e-15)
    expect(matGap(mscale(Rx(Math.PI), c(0, 1)), X)).toBeLessThan(1e-15)
    expect(matGap(mscale(rotation([1, 0, 1], Math.PI), c(0, 1)), H)).toBeLessThan(1e-15)
  })
})
