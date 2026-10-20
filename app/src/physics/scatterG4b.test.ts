/**
 * The Townsend-pass (G4b, Lecture 13) engine additions against pipeline/claims_448/g4b.py (numpy only):
 * wave.ts `boxEnergy`, `boxPairEnergy`, `boxMomentumSpread`, `boxState`, `boxNodes`, `boxOverlap` and scatter.ts `stepRT`, `barrierT`, `barrierThick`,
 * `probabilityCurrent`, `totalCurrent`, `continuityResidual`. The twin solves the matching conditions as linear systems (Eqs. 6.133, 6.143) and integrates
 * the box overlaps by Simpson's rule; the engine uses the closed forms. Properties: R + T = 1, T → 1 as a → 0, T falls with width, the energy is E_n = n²π²/2L²,
 * eigenstates are normalised and orthogonal, a pair's density moves with period 2π/(E₂ − E₁).
 */
import { describe, expect, it } from 'vitest'
import fx from './__fixtures__/scatter-g4b.json'
import { E_CHARGE, HBAR, M_ELECTRON, boxEnergyEv } from './constants'
import { barrierT, barrierThick, continuityResidual, decayConstant, probabilityCurrent, stepRT, totalCurrent } from './scatter'
import {
  GRID, boxEnergy, boxMomentumSpread, boxNodes, boxOverlap, boxPairEnergy, boxState, density, meanX, momentumMoments, norm, packet, spreadP,
} from './wave'

const C = fx.cases
const close = (a: number, b: number, eps = 1e-12, msg = '') => expect(Math.abs(a - b), `${msg} ${a} vs ${b}`).toBeLessThan(eps)

describe('stepRT: the matching conditions (numpy np.linalg.solve) against the closed form', () => {
  it('R and T of the twin cases agree to 1e-12, including total reflection below the step', () => {
    for (const c of C.stepRT) {
      const r = stepRT(c.E, c.V0)
      close(r.R, c.R, 1e-12, `R at ${c.E}`)
      close(r.T, c.T, 1e-12, `T at ${c.E}`)
    }
  })
  it('R + T = 1 (Eq. 6.136); E = 2V0 gives 0.0294 and 0.9706; only E/V0 matters', () => {
    for (const E of [1.01, 1.5, 2, 5, 40]) close(stepRT(E, 1).R + stepRT(E, 1).T, 1, 1e-14)
    close(stepRT(2, 1).R, 0.029437251522859385, 1e-12)
    close(stepRT(6, 3).T, stepRT(2, 1).T, 1e-14)
    expect(stepRT(0.3, 1)).toEqual({ R: 1, T: 0 })
    expect(stepRT(1, 1)).toEqual({ R: 1, T: 0 })
    expect(() => stepRT(0, 1)).toThrow()
  })
})

describe('barrierT: four matching conditions against Eq. 6.144, Example 6.7 and the oscillating case above the top', () => {
  it('the twin cases (E below, at and above V0; hbar = m = 1) agree to 1e-12', () => {
    for (const c of C.barrierT) close(barrierT(c.E, c.V0, c.a), c.T, 1e-12, `E ${c.E} V0 ${c.V0} a ${c.a}`)
  })
  it('thin barriers pass (T → 1), wide ones stop; the thick-barrier form (6.146) is the twin’s and is within 1e-3 for qa ≈ 3', () => {
    expect(barrierT(0.5, 1, 1e-6)).toBeGreaterThan(1 - 1e-6)
    expect(barrierT(0.5, 1, 5)).toBeLessThan(barrierT(0.5, 1, 4))
    for (const c of C.barrierThick) close(barrierThick(c.E, c.V0, c.a), c.T, 1e-12)
    expect(barrierT(0.5, 1, 3) / barrierThick(0.5, 1, 3)).toBeGreaterThan(0.99)
  })
  it('the book’s electron: SI units give 0.706 for E = 5 eV, V0 = 10 eV, a = 0.53 Å (the page prints 0.68), with the same value in ħ²/2m units', () => {
    const eV = E_CHARGE
    close(barrierT(5 * eV, 10 * eV, 0.53e-10, M_ELECTRON, HBAR), 0.7061046476417303, 1e-12)
    close(barrierT(5 * eV, 10 * eV, 0.529177e-10, M_ELECTRON, HBAR), 0.7068263760880362, 1e-12)
    close(decayConstant(5 * eV, 10 * eV, M_ELECTRON, HBAR) * 0.53e-10, 0.6071547586544623, 1e-12)
  })
  it('Example 6.7: E = V0 gives 1/(1 + k²a²/4), exactly ½ for ka = 2; refuses non-positive inputs', () => {
    close(barrierT(2, 2, 1), 0.5, 1e-14)
    expect(() => barrierT(0, 1, 1)).toThrow()
    expect(() => decayConstant(2, 1)).toThrow()
  })
})

describe('box eigenstates: Eq. 6.110, Eq. 6.108 with the wall at 0', () => {
  it('E_n = n²π²/2L² against the twin, the pair’s mean energy, and the SI energy of an electron in a 0.4 nm well (2.35 eV)', () => {
    for (const c of C.boxEnergy) close(boxEnergy(c.L, c.n), c.E, 1e-12)
    close(boxPairEnergy(2, 1, 3), (boxEnergy(2, 1) + boxEnergy(2, 3)) / 2, 1e-15)
    close(boxEnergyEv(0.4e-9, M_ELECTRON), 2.350188516354609, 1e-9)
    close(boxEnergyEv(0.4e-9, M_ELECTRON, 3), 9 * boxEnergyEv(0.4e-9, M_ELECTRON), 1e-9)
    expect(() => boxEnergy(0, 1)).toThrow()
    expect(() => boxEnergy(1, 0)).toThrow()
    expect(() => boxEnergy(1, 1.5)).toThrow()
  })
  it('the grid state is normalised, vanishes outside the walls, has n − 1 nodes, and is orthogonal to the other levels', () => {
    for (const n of [1, 2, 3, 4, 7]) {
      const w = boxState(GRID, 4, n)
      close(norm(w, GRID), 1, 5e-3, `norm n=${n}`)
      expect(boxNodes(w, GRID, 0, 4)).toBe(n - 1)
      expect(w.re[GRID.n / 2 - 3]).toBe(0) // x = -3/64: outside the box
      expect(w.re[GRID.n - 1]).toBe(0)
    }
    const a = boxState(GRID, 4, 2)
    const b = boxState(GRID, 4, 3)
    let s = 0
    for (let j = 0; j < GRID.n; j++) s += a.re[j] * b.re[j] * GRID.dx
    close(s, 0, 1e-12)
  })
  it('the momentum spread nπ/L equals the spectral spread of the grid state to about 1%, the mean momentum is zero, and halving L doubles it', () => {
    const w = boxState(GRID, 4, 1)
    const m = momentumMoments(w, GRID)
    close(m.mean, 0, 1e-6)
    expect(Math.abs(m.spread / boxMomentumSpread(4, 1) - 1)).toBeLessThan(0.01)
    close(spreadP(boxState(GRID, 2, 1), GRID) / spreadP(w, GRID), 2, 0.02)
    close(boxMomentumSpread(2, 1) / boxMomentumSpread(4, 1), 2, 1e-15)
  })
  it('a pair sloshes: the mean position returns after 2π/(E₂ − E₁), and a single level never moves (a stationary state)', () => {
    const L = 4
    const T = (2 * Math.PI) / (boxEnergy(L, 2) - boxEnergy(L, 1))
    const x0 = meanX(boxState(GRID, L, [1, 2], 0), GRID)
    const xHalf = meanX(boxState(GRID, L, [1, 2], T / 2), GRID)
    close(meanX(boxState(GRID, L, [1, 2], T), GRID), x0, 1e-9)
    expect(Math.abs(xHalf - x0)).toBeGreaterThan(0.5)
    const d0 = density(boxState(GRID, L, 2, 0))
    const d1 = density(boxState(GRID, L, 2, 3.7))
    for (let j = 0; j < GRID.n; j += 97) close(d0[j], d1[j], 1e-12)
    expect(() => boxState(GRID, L, [2, 2])).toThrow()
    expect(() => boxState(GRID, 70, 1)).toThrow()
  })
})

describe('boxOverlap: the closed form against Simpson integrals (numpy)', () => {
  it('the twin cases agree to 1e-12, with equal wave numbers (the limit) and disjoint boxes (zero) among them', () => {
    for (const c of C.boxOverlap) {
      const [la, ha, na] = c.a
      const [lb, hb, nb] = c.b
      close(boxOverlap({ lo: la, hi: ha, n: na }, { lo: lb, hi: hb, n: nb }), c.value, 1e-12, JSON.stringify([c.a, c.b]))
    }
  })
  it('Example 6.6: 8/(3π) = 0.8488 for both walls moving out, so the chance is 0.7205; symmetric in its arguments; an eigenstate overlaps itself with 1', () => {
    const old = { lo: -0.5, hi: 0.5, n: 1 }
    close(Math.abs(boxOverlap(old, { lo: -1, hi: 1, n: 1 })), 8 / (3 * Math.PI), 1e-12)
    close(boxOverlap(old, { lo: -1, hi: 1, n: 3 }) ** 2, 64 / (25 * Math.PI ** 2), 1e-12)
    expect(Math.abs(boxOverlap(old, { lo: -1, hi: 1, n: 2 }))).toBeLessThan(1e-12)
    const b = { lo: 0, hi: 2, n: 3 }
    close(boxOverlap(old, b), boxOverlap(b, old), 1e-14)
    close(boxOverlap(b, b), 1, 1e-14)
    close(
      Array.from({ length: 399 }, (_, i) => boxOverlap(old, { lo: -1, hi: 1, n: i + 1 }) ** 2).reduce((s, v) => s + v, 0),
      1,
      1e-7,
    )
  })
})

describe('the probability current (Eq. 6.115) on the grid', () => {
  const pk = packet(GRID, { x0: 0, sigma: 1, p0: 1.5 })
  it('the packet’s total current is ⟨p⟩/m = 1.5, as the twin finds with np.fft; the continuity residual is rounding error', () => {
    close(totalCurrent(pk, GRID), fx.cases.momentum.meanCurrent, 1e-12)
    close(totalCurrent(pk, GRID), 1.5, 1e-9)
    expect(continuityResidual(pk, GRID)).toBeLessThan(1e-12)
    expect(continuityResidual(pk, GRID)).toBeGreaterThanOrEqual(0)
  })
  it('a packet at rest carries zero current at every x; a packet with p0 carries j = p0 ρ at its centre', () => {
    const rest = probabilityCurrent(packet(GRID, { x0: 0, sigma: 1 }), GRID)
    for (let j = 0; j < GRID.n; j += 101) close(rest[j], 0, 1e-12)
    const mid = GRID.n / 2
    const rho = density(pk)[mid]
    close(probabilityCurrent(pk, GRID)[mid], 1.5 * rho, 1e-9)
  })
})
