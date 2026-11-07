/**
 * The Lecture 17 engine additions against pipeline/claims_448/l17.py (numpy only):
 *  scatter.ts  `stepAmplitudes` (the twin solves the matching conditions as a 2 x 2 complex system), `stepFringe`, `planeCurrent`, `forceMean`, `continuityResidual` with a potential,
 *              and the closed forms `ehrenfestConstMean`, `harmonicMean`, `harmonicWidth`;
 *  wave.ts     `evolveV` (Strang split step) and the potential samplers against a Crank–Nicolson march on a non-periodic grid with a banded solve (tolerance 2e-3, the stage's
 *              fidelity `wavefunction-potential-splitstep`).
 * Properties: the evolution is unitary, it reduces to the free one at V = 0, equal steps compose, a harmonic well turns the mean round, a constant force adds Ft²/2, a step splits
 * the chance into a reflected and a transmitted share that add to 1.
 */
import { describe, expect, it } from 'vitest'
import fx from './__fixtures__/scatter-l17.json'
import { ehrenfestConstMean, forceMean, harmonicMean, harmonicWidth, planeCurrent, stepAmplitudes, stepFringe, stepRT, continuityResidual } from './scatter'
import {
  GRID, type Wave, barrierPotential, chanceAbove, chanceBelow, density, evolveV, forcePotential, freeEvolve, harmonicPotential, meanX, norm, packet, spreadX, stepPotential,
} from './wave'

const C = fx.cases
const close = (a: number, b: number, eps = 1e-12, msg = '') => expect(Math.abs(a - b), `${msg} ${a} vs ${b}`).toBeLessThan(eps)
const P = (x0: number, sigma: number, p0 = 0) => packet(GRID, { x0, sigma, p0 })
const maxDiff = (a: Wave, b: Wave) => {
  let m = 0
  for (let j = 0; j < a.re.length; j++) m = Math.max(m, Math.hypot(a.re[j] - b.re[j], a.im[j] - b.im[j]))
  return m
}

describe('stepAmplitudes: the matching conditions (numpy np.linalg.solve) against the closed form', () => {
  it('r, τ, R, T and the wave numbers of every twin case agree to 1e-12, below the step too (k₂ → iκ)', () => {
    for (const c of C.stepAmps) {
      const s = stepAmplitudes(c.E, c.V0)
      close(s.k1, c.k1, 1e-12, `k1 at ${c.E}`)
      close(s.k2, c.k2, 1e-12, `k2 at ${c.E}`)
      close(s.r.re, c.r[0], 1e-12, `r.re at ${c.E}`)
      close(s.r.im, c.r[1], 1e-12, `r.im at ${c.E}`)
      close(s.tau.re, c.tau[0], 1e-12, `tau.re at ${c.E}`)
      close(s.tau.im, c.tau[1], 1e-12, `tau.im at ${c.E}`)
      close(s.R, c.R, 1e-12, `R at ${c.E}`)
      close(s.T, c.T, 1e-12, `T at ${c.E}`)
    }
  })
  it('1 + r = τ, R + T = 1, R and T agree with stepRT, and E = 4V₀/3 gives r = 1/3, τ = 4/3', () => {
    for (const E of [1.0001, 1.2, 2, 5, 40]) {
      const s = stepAmplitudes(E, 1)
      close(1 + s.r.re, s.tau.re, 1e-14)
      close(s.R + s.T, 1, 1e-14)
      close(s.R, stepRT(E, 1).R, 1e-14)
      close(s.T, stepRT(E, 1).T, 1e-14)
    }
    const s = stepAmplitudes(2, 1.5)
    close(s.r.re, 1 / 3, 1e-15)
    close(s.tau.re, 4 / 3, 1e-15)
    expect(() => stepAmplitudes(0, 1)).toThrow()
  })
  it('below the step the reflected wave has the size of the incident one and no current is transmitted', () => {
    const s = stepAmplitudes(0.5, 1)
    close(Math.hypot(s.r.re, s.r.im), 1, 1e-14)
    expect(s.T).toBe(0)
    expect(s.R).toBe(1)
  })
})

describe('stepFringe and planeCurrent', () => {
  it('E = 4V₀/3: the ripple runs between 16/9 and 4/9 with spacing π/k₁; the current of e^{ikx} is k, a wave moving left carries −k', () => {
    const f = stepFringe(2, 1.5)
    close(f.max, 16 / 9, 1e-14)
    close(f.min, 4 / 9, 1e-14)
    close(f.spacing, Math.PI / 2, 1e-14)
    expect(planeCurrent(2, 1)).toBe(2)
    expect(planeCurrent(-2, 1 / 3)).toBeCloseTo(-2 / 9, 14)
    expect(planeCurrent(3, { re: 0.6, im: 0.8 })).toBeCloseTo(3, 14)
  })
  it('the currents balance across the step: j_in + j_ref = j_tr for any energy', () => {
    for (const E of [1.1, 2, 3, 9]) {
      const s = stepAmplitudes(E, 1)
      const jin = planeCurrent(s.k1, 1)
      const jref = planeCurrent(-s.k1, s.r.re)
      const jtr = planeCurrent(s.k2, s.tau.re)
      close(jin + jref - jtr, 0, 1e-13)
    }
  })
})

describe('forceMean: ⟨F(x̂)⟩ is the average of the force over the density', () => {
  it('F = x² on a Gaussian gives μ² + σ², a linear force gives the force at the mean (exact for every shape), a nonlinear one does not', () => {
    close(forceMean(P(2, 1), GRID, (x) => x * x), 5, 1e-12)
    close(forceMean(P(3, 0.5), GRID, (x) => x * x), 9.25, 1e-12)
    for (const sigma of [0.5, 1, 2]) close(forceMean(P(1.5, sigma, 2), GRID, (x) => 0.7 - 1.3 * x), 0.7 - 1.3 * 1.5, 1e-12)
    close(forceMean(P(0, 1), GRID, (x) => x), 0, 1e-12)
    // F = −sin x on a Gaussian at π/2: the mean force is −e^{−σ²/2}, the force at the mean is −1
    close(forceMean(P(Math.PI / 2, 1), GRID, (x) => -Math.sin(x)), -Math.exp(-0.5), 1e-12)
  })
})

describe('continuityResidual with a potential: the V terms cancel', () => {
  it('a packet across a smooth step: the residual is rounding error, and it is the twin’s order of magnitude', () => {
    const smooth = Float64Array.from(GRID.x, (x) => (3.375 * (1 + Math.tanh(x / 0.5))) / 2)
    const w = packet(GRID, { x0: -6, sigma: 1.5, p0: 3 })
    const r = continuityResidual(w, GRID, smooth)
    expect(r).toBeLessThan(1e-12)
    expect(C.continuity.residual).toBeLessThan(1e-12)
    // no V = the free packet, as before
    expect(continuityResidual(P(0, 1, 1.5), GRID)).toBeLessThan(1e-9)
    expect(continuityResidual(P(0, 1, 1.5), GRID, new Float64Array(GRID.n))).toBeLessThan(1e-9)
    expect(() => continuityResidual(w, GRID, new Float64Array(3))).toThrow()
  })
})

describe('the potential samplers', () => {
  it('a step is 0 on the left, V₀ on the right and V₀/2 at x = 0; a barrier is V₀ on 0 < x < a with the half value at an edge on a grid point', () => {
    const s = stepPotential(GRID, 3)
    const j0 = Math.round(-GRID.x[0] / GRID.dx)
    expect(GRID.x[j0]).toBe(0)
    expect([s[j0 - 1], s[j0], s[j0 + 1]]).toEqual([0, 1.5, 3])
    const b = barrierPotential(GRID, 3, 1)
    const j1 = j0 + Math.round(1 / GRID.dx)
    expect([b[j0 - 1], b[j0], b[j0 + 1], b[j1 - 1], b[j1], b[j1 + 1]]).toEqual([0, 1.5, 3, 3, 1.5, 0])
    close(harmonicPotential(GRID, 2)[j0 + 64], 2, 1e-14) // Ω²x²/2 at x = 1, Ω = 2
    close(forcePotential(GRID, 0.5)[j0 + 64], -0.5, 1e-14)
  })
})

describe('evolveV: the Strang split step', () => {
  it('is unitary, a copy at t = 0, the free evolution at V = 0, and equal steps compose exactly', () => {
    const w = P(0, 1, 2)
    const V = stepPotential(GRID, 2)
    close(norm(evolveV(w, GRID, V, 3), GRID), 1, 1e-12)
    expect(maxDiff(evolveV(w, GRID, V, 0), w)).toBe(0)
    expect(evolveV(w, GRID, V, 0)).not.toBe(w)
    expect(maxDiff(evolveV(w, GRID, new Float64Array(GRID.n), 2, 0.05), freeEvolve(w, GRID, 2))).toBeLessThan(1e-12)
    const once = evolveV(w, GRID, V, 2, 0.01)
    const twice = evolveV(evolveV(w, GRID, V, 1, 0.01), GRID, V, 1, 0.01)
    expect(maxDiff(once, twice)).toBeLessThan(1e-12)
    expect(() => evolveV(w, GRID, new Float64Array(3), 1)).toThrow()
    expect(() => evolveV(w, GRID, V, -1)).toThrow()
  })
  it('a constant force adds F t²/2 to ⟨x⟩ and leaves the width alone (Ehrenfest, exact); the twin’s Crank–Nicolson march agrees', () => {
    const c = C.force
    const w = evolveV(P(c.x0, c.sigma, c.p0), GRID, forcePotential(GRID, c.F), c.t)
    close(meanX(w, GRID), ehrenfestConstMean(c.x0, c.p0, c.F, c.t), 1e-4)
    close(meanX(w, GRID), c.mean, 2e-3)
    close(spreadX(w, GRID), c.spread, 2e-3)
    close(spreadX(w, GRID), Math.sqrt(2), 1e-4)
  })
  it('the harmonic well turns the mean round and breathes the width of a σ = 1 packet between 1/2 and 1; the twin agrees', () => {
    for (const [c, t] of [[C.harmonic, Math.PI / 2], [C.harmonicPi, Math.PI]] as const) {
      const w = evolveV(P(c.x0, c.sigma, c.p0), GRID, harmonicPotential(GRID, c.omega), t)
      close(meanX(w, GRID), harmonicMean(c.x0, c.p0, c.omega, t), 1e-3, `mean at ${t}`)
      close(spreadX(w, GRID), harmonicWidth(c.sigma, c.omega, t), 1e-3, `width at ${t}`)
      close(meanX(w, GRID), c.mean, 2e-3, `twin mean at ${t}`)
      close(spreadX(w, GRID), c.spread, 2e-3, `twin width at ${t}`)
    }
  })
  it('a packet at a step: the chances left and right of x = 0 and the density at probe points agree with the twin to 2e-3; the two chances add to 1', () => {
    for (const [name, c] of [['step', C.step], ['stepWide', C.stepWide]] as const) {
      const w = evolveV(P(c.x0, c.sigma, c.p0), GRID, stepPotential(GRID, c.V0), c.t)
      close(norm(w, GRID), 1, 1e-8)
      close(chanceBelow(w, GRID, 0), c.below0, 2e-3, `${name} below`)
      close(chanceAbove(w, GRID, 0), c.above0, 2e-3, `${name} above`)
      close(chanceBelow(w, GRID, 0) + chanceAbove(w, GRID, 0), 1, 1e-5) // the spline of the density has a kink at the step
      if (name === 'step') {
        const rho = density(w)
        c.probes!.forEach((x, i) => close(rho[Math.round((x - GRID.x[0]) / GRID.dx)], c.density![i], 2e-3, `density at ${x}`))
      }
    }
  })
  it('a broad packet at the step splits near R(E), T(E) of its mean energy; a barrier below its top still lets a share through; the twin agrees', () => {
    const c = C.stepWide
    const w = evolveV(P(c.x0, c.sigma, c.p0), GRID, stepPotential(GRID, c.V0), c.t)
    expect(Math.abs(chanceBelow(w, GRID, 0) - stepRT(4.5, 3.375).R)).toBeLessThan(0.05)
    const b = C.barrier
    const wb = evolveV(P(b.x0, b.sigma, b.p0), GRID, barrierPotential(GRID, b.V0, b.a), b.t)
    close(chanceAbove(wb, GRID, b.a), b.above1, 2e-3)
    expect(chanceAbove(wb, GRID, b.a)).toBeGreaterThan(0.05)
  })
})
