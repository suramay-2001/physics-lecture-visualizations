/**
 * qc/blocheq.ts against numpy/scipy (pipeline/make_q24_fixtures.py -> __fixtures__/qc-q24.json; routes in pipeline/q24_numpy.py: a Kronecker superoperator with scipy's expm,
 * solve_ivp, complex linear solves, DOP853 over one drive period), plus the cross-checks of P-Q24-story §9.1: the Lindblad solution against iterated Kraus steps and against the
 * composed Chapter Q13 channels, the steady state against Eq. 12.5a, RK4 against the exact solution, the lab-frame scalar equations against the general matrix RK4.
 */
import { describe, expect, it } from 'vitest'
import raw from '../__fixtures__/qc-q24.json?raw'
import { abs, c } from '../complex'
import { type Mat, madd, mscale } from '../linalg'
import { amplitudeDamping, applyKraus, dephasing } from './channels'
import { X, Z } from './gates'
import {
  type LabParams,
  blochAverageExcited,
  blochExact,
  blochOf,
  blochRhs,
  blochSteady,
  decayTimes,
  dephasingJump,
  eulerStep,
  expmGeneral,
  gaussLegendre,
  integrateBloch,
  integrateLab,
  krausStep,
  labHamiltonian,
  labJumps,
  labSteadyAverages,
  lindbladL0,
  lindbladRhs,
  lindbladRk4,
  lindbladSolve,
  losslessAverage,
  minEigenvalue,
  positivityMin,
  purityOf,
  qubitJump,
  relaxedState,
  rhoOfBloch,
  solveReal,
  steadyCoherenceForm,
  steadyExcited,
  steadyInversion,
  steadyWidth,
  steadyWidthBisect,
  traceOf,
} from './blocheq'

type CM = number[][][]
const F = JSON.parse(raw) as Record<string, any>
const toMat = (m: CM): Mat => m.map((row) => row.map(([re, im]) => c(re, im)))
const maxd = (A: Mat, B: Mat): number => Math.max(...A.flatMap((row, i) => row.map((x, j) => abs(c(x.re - B[i][j].re, x.im - B[i][j].im)))))
const H0: Mat = [[c(0), c(0)], [c(0), c(0)]]

describe('expmGeneral', () => {
  it('exp of a diagonal and of i*theta*X match the closed forms; exp(A)exp(-A) = I', () => {
    const E = expmGeneral([[c(1), c(0)], [c(0), c(-2)]])
    expect(E[0][0].re).toBeCloseTo(Math.E, 13)
    expect(E[1][1].re).toBeCloseTo(Math.exp(-2), 14)
    const th = 3.7
    const U = expmGeneral(mscale(X, c(0, th)))
    expect(U[0][0].re).toBeCloseTo(Math.cos(th), 13)
    expect(U[0][1].im).toBeCloseTo(Math.sin(th), 13)
    const big = expmGeneral(mscale(Z, c(0, 60)))
    expect(big[0][0].re).toBeCloseTo(Math.cos(60), 12)
    expect(big[1][1].im).toBeCloseTo(-Math.sin(60), 12)
  })
})

describe('lindblad (numpy: Kronecker superoperator, expm, solve_ivp)', () => {
  for (const [i, k] of (F.lindblad as any[]).entries()) {
    it(`case ${i}: the exponential of the superoperator and the right-hand side agree with numpy to 1e-13`, () => {
      const H = madd(mscale(X, k.hx), mscale(Z, k.hz))
      const Ls = [qubitJump(k.gamma), ...(k.gphi ? [dephasingJump(k.gphi)] : [])]
      const rho0 = rhoOfBloch(k.r0)
      expect(maxd(lindbladSolve(rho0, H, Ls, k.t), toMat(k.rho))).toBeLessThan(1e-13)
      expect(maxd(lindbladRhs(rho0, H, Ls), toMat(k.rhs))).toBeLessThan(1e-14)
      expect(abs(traceOf(lindbladRhs(rho0, H, Ls)))).toBeLessThan(1e-15)
    })
  }
  it('the Kraus step and the Euler step differ by O(dt^2): the gap matches numpy and halving dt divides it by 4', () => {
    const rho0 = rhoOfBloch([1, 0, 0])
    const Ls = [qubitJump(1)]
    const gaps = (F.kraus as any[]).map((k) => {
      const g = maxd(krausStep(rho0, lindbladL0(H0, Ls), Ls, k.dt), eulerStep(rho0, H0, Ls, k.dt))
      expect(g / k.gap).toBeCloseTo(1, 6)
      return g
    })
    expect(gaps[0] / gaps[1]).toBeCloseTo(4, 3)
  })
  it('Q13 amplitude damping (gamma = 1 - e^{-t}) composed with dephasing gives the solved equation', () => {
    const t = 0.8
    const rho0 = rhoOfBloch([0.3, -0.4, 0.5])
    const sol = lindbladSolve(rho0, H0, [qubitJump(1), dephasingJump(1)], t)
    const p = (1 - Math.exp(-t)) / 2
    const viaKraus = applyKraus(dephasing(p), applyKraus(amplitudeDamping(1 - Math.exp(-t)), rho0))
    // damping gives rho_ge e^{-t/2}; the dephasing set gives (1 - 2p) = e^{-t} on top, so the coherence is e^{-3t/2}: the rates 1/2 + 1 of gamma and gamma_phi
    expect(abs(sol[0][1])).toBeCloseTo(abs(viaKraus[0][1]), 12)
    expect(sol[1][1].re).toBeCloseTo(viaKraus[1][1].re, 12)
  })
  it('T1 and T2 read off the superoperator match numpy; T2 = 2 T1 for pure decay and 1/T2 = 1/2T1 + 1/Tphi with dephasing', () => {
    for (const k of F.decayTimes as any[]) {
      const d = decayTimes(H0, [qubitJump(k.gamma), ...(k.gphi ? [dephasingJump(k.gphi)] : [])])
      expect(d.T1).toBeCloseTo(k.T1, 13)
      expect(d.T2).toBeCloseTo(k.T2, 13)
    }
    expect(decayTimes(H0, [qubitJump(0.5)]).T2 / decayTimes(H0, [qubitJump(0.5)]).T1).toBeCloseTo(2, 13)
  })
  it('Bloch vector, state and purity: rhoOfBloch inverts blochOf and purity is (1 + |r|^2)/2', () => {
    const r: [number, number, number] = [0.3, -0.4, 0.5]
    expect(blochOf(rhoOfBloch(r))).toEqual(r)
    expect(purityOf(rhoOfBloch(r))).toBeCloseTo((1 + 0.5) / 2, 14)
  })
})

describe('T2 <= 2 T1: the smaller eigenvalue of the relaxed state (numpy: eigvalsh and a bounded minimiser)', () => {
  for (const k of F.positivity as any[])
    it(`T2 = ${k.T2} T1: least eigenvalue ${k.min.toExponential(3)} at t = ${k.at.toFixed(3)}`, () => {
      const p = positivityMin(k.T1, k.T2)
      expect(p.min).toBeCloseTo(k.min, 12)
      expect(p.at).toBeCloseTo(k.at, 6)
    })
  it('closed form (1 - |r|)/2 equals the smaller eigenvalue; T2 = 2 T1 never goes negative', () => {
    expect(minEigenvalue(relaxedState(0.3, 1, 2))).toBeGreaterThan(-1e-15)
    expect(positivityMin(1, 2).min).toBeGreaterThan(-1e-15)
    expect(positivityMin(1, 3).min).toBeLessThan(-0.009)
  })
})

describe('Eqs. 12.4 (numpy: solve_ivp, a complex 3 x 3 linear solve)', () => {
  for (const k of F.blochSteady as any[]) {
    const p = { Omega: k.Omega, Delta: k.Delta, T1: k.T1, T2: k.T2 }
    it(`steady state at Omega = ${k.Omega.toFixed(3)}, Delta = ${k.Delta.toFixed(3)}: matches numpy, Eq. 12.5a and a long RK4 run`, () => {
      const s = blochSteady(p)
      expect(s.w).toBeCloseTo(k.w, 13)
      expect(s.rho.re).toBeCloseTo(k.rho[0], 13)
      expect(s.rho.im).toBeCloseTo(k.rho[1], 13)
      expect(s.w).toBeCloseTo(steadyInversion(p.Delta, p.T1, p.T2, p.Omega), 13)
      expect(blochRhs([s.w, s.rho.re, s.rho.im], p).map(Math.abs).every((x) => x < 1e-13)).toBe(true)
      const late = integrateBloch([-1, 0, 0], p, 400, 40000)
      expect(Math.abs(late[0] - s.w)).toBeLessThan(1e-8)
      // the exact solution at t = 1.3 equals scipy's and RK4's
      const ex = blochExact([-1, 0, 0], p, 1.3)
      k.at1p3.forEach((v: number, j: number) => expect(ex[j]).toBeCloseTo(v, 11))
      integrateBloch([-1, 0, 0], p, 1.3, 20000).forEach((v, j) => expect(v).toBeCloseTo(k.at1p3[j], 9))
    })
  }
  it('Eq. 12.5b: our sign (+i Delta T2) satisfies the steady equation and the printed sign (-i Delta T2) does not', () => {
    const p = { Omega: 1, Delta: 0.7, T1: 4, T2: 8 }
    const s = blochSteady(p)
    const ours = steadyCoherenceForm(p, false)
    const printed = steadyCoherenceForm(p, true)
    expect(ours.re).toBeCloseTo(s.rho.re, 13)
    expect(ours.im).toBeCloseTo(s.rho.im, 13)
    expect(ours.re).toBeCloseTo(-0.348042, 5)
    expect(printed.re).toBeCloseTo(0.348042, 5)
    expect(printed.im).toBeCloseTo(s.rho.im, 13)
  })
  it('steadyExcited: the on-resonance chance s/(2(1+s)) never reaches 1/2; the full width is 2 sqrt(1+s), found also by bisection', () => {
    expect(steadyExcited(0, 1)).toBe(0.25)
    expect(steadyExcited(0, 1e6)).toBeLessThan(0.5)
    for (const s of [0, 3, 8]) {
      expect(steadyWidth(s)).toBeCloseTo(steadyWidthBisect(s), 12)
      if (s > 0) expect(steadyExcited(steadyWidth(s) / 2, s)).toBeCloseTo(steadyExcited(0, s) / 2, 13)
    }
  })
  it('window averages of rho_ee along the exact solution match numpy (solve_ivp + quad); the lossless average is (1/2) Omega^2/(Omega^2 + Delta^2)', () => {
    for (const k of F.blochAverage as any[]) expect(blochAverageExcited({ Omega: k.Omega, Delta: k.Delta, T1: k.T1, T2: k.T2 }, k.t0, k.t1)).toBeCloseTo(k.value, 10)
    expect(losslessAverage(2 * Math.PI, 20 * Math.PI)).toBeCloseTo(0.0049505, 7)
  })
  it('solveReal solves a small system; gaussLegendre integrates a polynomial exactly', () => {
    const x = solveReal([[2, 1, 0], [1, 3, 1], [0, 1, 4]], [3, 5, 5])
    expect(x[0]).toBeCloseTo(1, 13)
    expect(gaussLegendre((u) => u ** 9, 0, 2, 1)).toBeCloseTo(2 ** 10 / 10, 12)
  })
})

describe('without the rotating-wave step (numpy: DOP853 one-period map, a fixed-point solve)', () => {
  const p: LabParams = { omegaQ: 40, Omega: 1, Delta: 0.7, T1: 4, T2: 8 }
  it('the periodic steady state matches numpy to 1e-9, and differs from the rotating-wave steady state by the Bloch-Siegert-sized amount', () => {
    const k = F.labSteady
    const s = labSteadyAverages(p)
    expect(s.w).toBeCloseTo(k.w, 9)
    expect(s.rho.re).toBeCloseTo(k.rho[0], 9)
    expect(s.rho.im).toBeCloseTo(k.rho[1], 9)
    const rwa = blochSteady(p)
    expect(Math.abs(s.w - rwa.w) / Math.abs(rwa.w)).toBeGreaterThan(0.008)
    expect(Math.abs(s.w - rwa.w) / Math.abs(rwa.w)).toBeLessThan(0.01)
  })
  it('the lab-frame scalar equations equal the general matrix RK4 at a few hundred steps (trace 1, same state)', () => {
    const rho0 = rhoOfBloch([0, 0, 1])
    const Ls = labJumps(p.T1, p.T2)
    const gen = lindbladRk4(rho0, (t) => labHamiltonian(p, t), Ls, 0.6, 600)
    const sc = integrateLab([-1, 0, 0], p, 0.6, 600)
    expect(sc[0]).toBeCloseTo(gen[1][1].re - gen[0][0].re, 10)
    expect(sc[1]).toBeCloseTo(gen[0][1].re, 10)
    expect(sc[2]).toBeCloseTo(gen[0][1].im, 10)
  })
})
