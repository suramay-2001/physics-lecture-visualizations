/**
 * Arcade truth for Lecture 11 (P): each of the five Spot-the-error rounds names a slip and its correction states the engine's
 * number (physics/dynamics.ts, physics/operators.ts); the Bloch-golf "Waiting game" offers one turn (a quarter period of waiting,
 * R_z(+90°)) and needs exactly three of them. One round per unit after the first; each trains a real unit.
 */
import { describe, expect, it } from 'vitest'
import { LECTURES } from '../content'
import { abs, c } from '../physics/complex'
import { clockHands, energyAverage, evolveKet, ketRate, precession, tinyStep, twoLevelH } from '../physics/dynamics'
import { type Mat, apply, dagger, identity, isUnitary, madd, mat, matEq, matmul, mscale, norm2 } from '../physics/linalg'
import { KET, blochVector } from '../physics/spin'
import { ERROR_ROUNDS, GOLF_LEVELS } from './games'
import { applyMoves, reached, sequences } from './golf'

const DEG = Math.PI / 180
const close = (a: number, b: number, eps = 1e-9) => expect(Math.abs(a - b), `${a} vs ${b}`).toBeLessThan(eps)
const L11_ROUNDS = ERROR_ROUNDS.filter((r) => r.trains.lecture === 'L11')
const H = twoLevelH(3, 1).H

describe('Spot the error: Lecture 11', () => {
  it('has five rounds, one for each unit but the first, each training a real unit with a wrong step inside it', () => {
    const units = LECTURES.find((l) => l.id === 'L11')!.units.map((u) => u.id)
    expect(L11_ROUNDS.map((r) => r.trains.unit)).toEqual(['l11-unitary', 'l11-generator', 'l11-schrodinger', 'l11-stationary', 'l11-two-level'])
    for (const r of L11_ROUNDS) expect(units).toContain(r.trains.unit)
    expect(L11_ROUNDS.map((r) => r.id)).toEqual(['l11-keeps-z', 'l11-step-exact', 'l11-drop-i', 'l11-energy-constant', 'l11-turn-rate'])
    for (const r of L11_ROUNDS) {
      expect(r.steps).toHaveLength(4)
      expect(r.wrong).toBeGreaterThanOrEqual(2)
      expect(r.wrong).toBeLessThan(4)
    }
  })

  it('l11-keeps-z: the matrix keeps |±z⟩ at length 1, is not unitary, and stretches |+x⟩ to 1 + 1/√2 = 1.707', () => {
    const U1: Mat = mat([[1, Math.SQRT1_2], [0, Math.SQRT1_2]])
    close(norm2(apply(U1, KET['+z'])), 1)
    close(norm2(apply(U1, KET['-z'])), 1)
    expect(isUnitary(U1)).toBe(false)
    close(norm2(apply(U1, KET['+x'])), 1 + 1 / Math.sqrt(2))
    expect((1 + 1 / Math.sqrt(2)).toFixed(3)).toBe('1.707')
  })
  it('l11-step-exact: U†U = I + H²dt² (not I), so the tiny step stretches |+x⟩ at second order only', () => {
    const dt = 0.01
    const U = tinyStep(H, dt)
    expect(matEq(matmul(dagger(U), U), identity(2))).toBe(false)
    expect(matEq(matmul(dagger(U), U), madd(identity(2), mscale(matmul(H, H), dt * dt)), 1e-12)).toBe(true)
    close(norm2(apply(U, KET['+x'])) - 1, 5 * dt * dt, 1e-12)
    // second order: halving dt cuts the stretch to a quarter
    close((norm2(apply(tinyStep(H, dt / 2), KET['+x'])) - 1) / (norm2(apply(U, KET['+x'])) - 1), 0.25, 1e-9)
  })
  it('l11-drop-i: i ħ d|ψ⟩/dt = H|ψ⟩ holds and ħ d|ψ⟩/dt = H|ψ⟩ does not (ħ = 1, a finite difference)', () => {
    const t = 0.7
    const h = 1e-6
    const psi = evolveKet(H, t, KET['+x'])
    const dpsi = [0, 1].map((k) => c((evolveKet(H, t + h, KET['+x'])[k].re - evolveKet(H, t - h, KET['+x'])[k].re) / (2 * h), (evolveKet(H, t + h, KET['+x'])[k].im - evolveKet(H, t - h, KET['+x'])[k].im) / (2 * h)))
    const Hpsi = apply(H, psi)
    // i·dψ/dt = Hψ
    dpsi.forEach((z, k) => {
      close(-z.im, Hpsi[k].re, 1e-6)
      close(z.re, Hpsi[k].im, 1e-6)
    })
    // dψ/dt alone is not Hψ: the entries differ (it is −iHψ)
    const bad = dpsi.map((z, k) => abs(c(z.re - Hpsi[k].re, z.im - Hpsi[k].im)))
    expect(Math.max(...bad)).toBeGreaterThan(1)
    // and the rate is −iHψ, the engine's ketRate
    ketRate(H, psi).forEach((z, k) => {
      close(z.re, dpsi[k].re, 1e-6)
      close(z.im, dpsi[k].im, 1e-6)
    })
  })
  it('l11-energy-constant: ⟨H⟩ = 2ε at every time, and the Bloch arrow of |+x⟩ moves (a quarter turn at εt/ħ = 45°)', () => {
    for (const deg of [0, 30, 45, 90, 135]) close(energyAverage(H, evolveKet(H, deg * DEG, KET['+x'])), 2)
    const r0 = blochVector(evolveKet(H, 0, KET['+x']))
    const r45 = blochVector(evolveKet(H, 45 * DEG, KET['+x']))
    expect(Math.hypot(r45[0] - r0[0], r45[1] - r0[1])).toBeGreaterThan(1)
  })
  it('l11-turn-rate: the arrow turns at (E₊ − E₋)/ħ = 2ε/ħ, not at E₊/ħ = 3ε/ħ', () => {
    const at = (deg: number) => clockHands({ upper: 3, lower: 1 }, KET['+x'], deg * DEG).gap!
    close((at(20) - at(10)) / (10 * DEG), 2)
    // the arrow is at azimuth 2t, so a quarter turn takes εt/ħ = 45°, not 30°
    close(precession({ upper: 3, lower: 1 }, 45 * DEG).bloch[1], 1)
    expect(Math.abs(precession({ upper: 3, lower: 1 }, 30 * DEG).bloch[1] - 1)).toBeGreaterThan(0.1)
  })
})

describe('Bloch golf: the Waiting game', () => {
  const level = GOLF_LEVELS.find((l) => l.id === 'waiting-game')!
  it('offers one turn, R_z(+90°), and reaches |−y⟩ from |+x⟩ in exactly three of them; fewer cannot', () => {
    expect(level.allowed).toEqual([{ axis: 'z', sign: 1 }])
    expect(level.par).toBe(3)
    expect(level.trains).toMatchObject({ lecture: 'L11', unit: 'l11-two-level' })
    expect(reached(applyMoves(level.start, level.solution), level.target)).toBe(true)
    for (let n = 0; n < 3; n++) for (const s of sequences(n, level.allowed)) expect(reached(applyMoves(level.start, s), level.target), `${n} waits`).toBe(false)
    // with every turn on offer one turn (z −90°) would do: the restriction is the game
    expect([...sequences(1)].some((s) => reached(applyMoves(level.start, s), level.target))).toBe(true)
  })
  it('a quarter period of waiting is R_z(+90°): U(εt/ħ = 45°) ≅ R_z(90°), the engine’s own evolution', () => {
    const psi = evolveKet(H, 45 * DEG, KET['+x'])
    expect(reached(psi, '+y')).toBe(true)
    const three = evolveKet(H, 135 * DEG, KET['+x'])
    expect(reached(three, '-y')).toBe(true)
  })
})
