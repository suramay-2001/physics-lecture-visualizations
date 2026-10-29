/**
 * qc/iontrap.ts against numpy/scipy (pipeline/make_q25_fixtures.py -> __fixtures__/qc-q25.json; routes in pipeline/q25_numpy.py: solve_ivp Floquet monodromy with brentq, an analytic Hessian,
 * an 81-level oscillator with expm, dense Cirac-Zoller pulses, DOP853 over the Molmer-Sorensen force Hamiltonian, expm of S^2 for the GHZ scan) and the cross-checks of P-Q25-story §9.1.
 */
import { describe, expect, it } from 'vitest'
import raw from '../__fixtures__/qc-q25.json?raw'
import { runCircuit } from './circuit'
import { validateCircuit } from './circuit'
import { probs } from './measure'
import {
  BE_TRAP,
  annihilation,
  bchGap,
  kickCircuit,
  carrierExact,
  carrierGround,
  coolTime,
  coolTimeNaive,
  czBell,
  czCircuit,
  czRun,
  ghzScan,
  lambDicke,
  lambDickeMicrowave,
  localisation,
  mathieuBeta,
  mathieuBetaApprox,
  mathieuEdge,
  mathieuTrace,
  quadrupoleCurvatures,
  msBell,
  msBookTime,
  msCircuit,
  msLoops,
  msOmegaTilde,
  msTime,
  pulseFromGround,
  recoilOverQuantum,
  recoilState,
  secularExact,
  sidebandCircuit,
  sidebandExact,
  sidebandFirstOrder,
  smallestRf,
  trapParams,
  twoIonModes,
  twoIonPotential,
  twoIonSpacing,
  vacuumWeight,
  zeroPoint,
} from './iontrap'

const FX: any = JSON.parse(raw)
const rel = (a: number, b: number, eps: number) => expect(Math.abs(a - b) / Math.abs(b), `${a} vs ${b}`).toBeLessThan(eps)
const near = (a: number, b: number, eps: number) => expect(Math.abs(a - b), `${a} vs ${b}`).toBeLessThan(eps)

describe('the Paul trap: the Mathieu equation z\'\' = 2 q cos(2 tau) z', () => {
  it('the monodromy trace and the Floquet number equal the numpy DOP853 integration at six values of q', () => {
    for (const e of FX.mathieu) {
      near(mathieuTrace(e.q), e.trace, 1e-9)
      near(mathieuBeta(e.q), e.beta, 1e-8)
    }
  })
  it('the stability edge is 0.908046 (tr M = -2), beta is 1 beyond it and beta tends to q/sqrt(2) at small q', () => {
    near(mathieuEdge(), FX.mathieuEdge, 1e-9)
    expect(mathieuBeta(0.95)).toBe(1)
    expect(mathieuBeta(0.9)).toBeLessThan(1)
    expect(Math.abs(mathieuBeta(0.05) / mathieuBetaApprox(0.05) - 1)).toBeLessThan(1e-3)
  })
  it('the beryllium trap: q = 0.5411, omega_z/2pi = 1.913 MHz, depth 785 K at z_c/10, the smallest rf 7.72 MHz, micromotion q/2 of the macromotion, 8.0 nm at 10 microkelvin', () => {
    const t = trapParams(BE_TRAP)
    rel(t.q, FX.trap.q, 1e-12)
    rel(t.omegaZ, FX.trap.wz, 1e-12)
    rel(t.omegaXY, FX.trap.wxy, 1e-12)
    rel(t.zetaOverZ, FX.trap.zeta_over_Z, 1e-12)
    rel(t.uCoefK, FX.trap.ucoef, 1e-12)
    rel(t.depthK, FX.trap.depth, 1e-12)
    near(smallestRf(BE_TRAP, mathieuEdge()) / (2 * Math.PI) / 1e6, 7.72, 5e-3)
    const loc = localisation(1e-5, BE_TRAP)
    near(loc.Z * 1e9, 7.98, 5e-3)
    near(loc.zeta * 1e9, 2.16, 5e-3)
  })
  it('the exact secular frequency at q = 0.5411 is beta omega_rf/2 = 2.045 MHz, about 7 percent above the effective-potential value', () => {
    const q = trapParams(BE_TRAP).q
    const exact = secularExact(q, BE_TRAP.omegaRf)
    near(exact / (2 * Math.PI) / 1e6, 2.045, 2e-3)
    near(exact / trapParams(BE_TRAP).omegaZ - 1, 0.069, 2e-3)
  })
})

describe('Earnshaw', () => {
  it('the quadrupole curvatures are 2, 2 and -4 and sum to zero', () => {
    const k = quadrupoleCurvatures()
    near(k[0], 2, 1e-6)
    near(k[1], 2, 1e-6)
    near(k[2], -4, 1e-6)
    near(k[0] + k[1] + k[2], 0, 1e-6)
  })
})

describe('two ions', () => {
  const wz = trapParams(BE_TRAP).omegaZ
  it('the spacing is 5.97 micrometres and the energy u(s) = s^2/4 + 1/2s has its minimum 0.75 at s = 1', () => {
    rel(twoIonSpacing(BE_TRAP.massKg, wz), FX.twoIon.Zeq, 1e-12)
    near(twoIonPotential(1), 0.75, 1e-15)
    expect(twoIonPotential(0.9)).toBeGreaterThan(0.75)
    expect(twoIonPotential(1.1)).toBeGreaterThan(0.75)
  })
  it('the modes are omega_z and sqrt(3) omega_z (finite-difference Hessian against the analytic one)', () => {
    const m = twoIonModes(BE_TRAP.massKg, wz)
    rel(m.com, FX.twoIon.com, 1e-6)
    rel(m.stretch, FX.twoIon.stretch, 1e-6)
    near(m.ratio, Math.sqrt(3), 1e-6)
  })
})

describe('Lamb-Dicke number, kicks, sidebands and cooling', () => {
  const wz = trapParams(BE_TRAP).omegaZ
  it('z_0 = 17.1 nm and eta_0 = 0.3433 for 313 nm; E_R/hbar omega_z = eta_0^2; a microwave gives 3.29e-6', () => {
    rel(zeroPoint(BE_TRAP.massKg, wz), FX.lambDicke.z0, 1e-12)
    rel(lambDicke(313e-9, BE_TRAP.massKg, wz), FX.lambDicke.eta, 1e-12)
    rel(recoilOverQuantum(313e-9, BE_TRAP.massKg, wz), FX.lambDicke.eta ** 2, 1e-12)
    rel(lambDickeMicrowave(9.19263177e9, BE_TRAP.massKg, wz), FX.lambDicke.etaMicro, 1e-12)
  })
  it('the blue sideband and the carrier of e^{i eta (a + a^dagger)} on 80 levels equal numpy; the first order eta sqrt(n+1) overestimates more as n grows; the carrier of the ground state is e^{-eta^2/2}', () => {
    for (const e of FX.sideband) {
      near(sidebandExact(e.eta, e.n), e.blue, 1e-13)
      near(carrierExact(e.eta, e.n), e.carrier, 1e-13)
    }
    expect(sidebandFirstOrder(0.1, 10)).toBeGreaterThan(sidebandExact(0.1, 10))
    near(carrierGround(0.1), carrierExact(0.1, 0), 1e-12)
    expect(sidebandExact(0.1, 0)).toBeCloseTo(0.1 * Math.exp(-0.005), 10)
  })
  it('the recoil state has amplitudes e^{-eta^2/2}(i eta)^n/sqrt(n!) and the BCH identity holds to machine precision', () => {
    const psi = recoilState(0.343, 24)
    const ref = FX.recoil.amps
    for (let n = 0; n < 4; n++) near(Math.hypot(psi[n].re - ref[n][0][0], psi[n].im - ref[n][0][1]), 0, 1e-12)
    for (let n = 0; n < 4; n++) near(Math.hypot(psi[n].re, psi[n].im), Math.exp(-(0.343 ** 2) / 2) * 0.343 ** n / Math.sqrt([1, 1, 2, 6][n]), 1e-12)
    near(bchGap(0.3), 0, 1e-12)
    expect(annihilation(3)[0][1].re).toBe(1)
  })
  it('the kick circuit is valid and its bars are the first four recoil amplitudes (renormalised)', () => {
    const circ = kickCircuit(0.343)
    expect(validateCircuit(circ)).toBeTruthy()
    const psi = runCircuit(circ).states.at(-1)!
    const ref = recoilState(0.343, 3)
    const nrm = Math.sqrt(ref.reduce((s, z) => s + z.re ** 2 + z.im ** 2, 0))
    for (let n = 0; n < 4; n++) near(Math.hypot(psi[n].re - ref[n].re / nrm, psi[n].im - ref[n].im / nrm), 0, 1e-9)
  })
  it('the cooling time is pi times the sum of k^{-1/2}: 15.77 against 31.42 from n = 10', () => {
    for (const e of FX.coolTime) near(coolTime(e.n), e.value, 1e-12)
    near(coolTimeNaive(10), 10 * Math.PI, 1e-12)
  })
})

describe('Cirac-Zoller', () => {
  it('a red pi pulse from |g, 0> and a blue pi pulse from |e, 0> do nothing (the chance of leaving is 0)', () => {
    near(pulseFromGround('red'), FX.czPulse.red, 1e-12)
    near(pulseFromGround('blue'), FX.czPulse.blue, 1e-12)
  })
  it('the Bell chance and the vacuum weight equal numpy for n = 0 (1, 6 and 8 phonon levels: exactly 1) and 0.254, 0.138 for n = 1, 2', () => {
    for (const e of FX.czBell) {
      near(czBell(e.n0, e.nmax), e.bell, 1e-9)
      near(vacuumWeight(czRun(e.n0, e.nmax), e.nmax), e.vacuum, 1e-9)
    }
  })
  it('the circuits are valid; the three-wire Cirac-Zoller circuit ends in |g e; 0> and |e g; 0> with half chance each, the sideband circuit ends in |g, 0> = 000', () => {
    const cz = czCircuit()
    expect(validateCircuit(cz)).toBeTruthy()
    const p = probs(runCircuit(cz).states.at(-1)!)
    near(p[0b010] + p[0b100], 1, 1e-12)
    near(p[0b010], 0.5, 1e-12)
    const sb = sidebandCircuit()
    expect(validateCircuit(sb)).toBeTruthy()
    const states = runCircuit(sb).states
    near(probs(states[1])[0b100], 1, 1e-12)
    near(probs(states[2])[0b100], 1, 1e-12)
    near(probs(states[3])[0b000], 1, 1e-12)
  })
})

describe('Molmer-Sorensen', () => {
  it('the closed (Magnus) evolution equals the numpy DOP853 integration of the force Hamiltonian for n = 0, 1, 4, a non-whole loop count and three ions', () => {
    for (const e of FX.ms) near(msBell({ n0: e.n0, etaOmega: e.etaOmega, delta: e.delta, N: e.N, nmax: e.nmax, t: e.t }), e.bell, 1e-8)
  })
  it('the Bell chance is 1 for every n at whole loops; the loops K = ((Delta/eta Omega)^2)/4 are 25 for eta Omega = 0.1 and the time is 157.08; the effective rate is 0.01', () => {
    for (const n0 of [0, 1, 2, 4]) near(msBell({ n0, etaOmega: 0.1, delta: 1, N: 2, nmax: 14, t: msTime(25, 1) }), 1, 1e-9)
    near(msLoops(0.1, 1), 25, 1e-12)
    near(msTime(25, 1), 157.0796326794897, 1e-9)
    near(msOmegaTilde(0.1, 1), 0.01, 1e-15)
    near(msLoops(0.05, 1), 100, 1e-9)
    near(msBookTime(0.12, 1) / (2 * Math.PI), 17.36, 5e-3)
  })
  it('the GHZ scan gives fidelity 1 at theta = pi/8 for two and four ions and 0.5 for three; the circuit box ends in |gggg> and |eeee> with half chance each', () => {
    for (const e of FX.ghz) {
      const g = ghzScan(e.N)
      near(g.fidelity, e.fidelity, 1e-9)
      if (e.N !== 3) near(g.theta, e.theta, 1e-6)
    }
    const circ = msCircuit(4, Math.PI / 8)
    expect(validateCircuit(circ)).toBeTruthy()
    const p = probs(runCircuit(circ).states.at(-1)!)
    near(p[0] + p[15], 1, 1e-12)
    near(p[0], 0.5, 1e-12)
  })
})
