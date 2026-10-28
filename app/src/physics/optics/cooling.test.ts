/**
 * The Optics Lab engine against its numpy twin (pipeline/make_optics_fixtures.py -> __fixtures__/optics.json): every key of the table is
 * one engine call and must agree within the tolerance the twin states (1e-11 for a closed form typed independently, 1e-6 and looser for
 * a numerical route), plus properties that need no twin (limits, symmetries, the book's formulas against the numerical ones).
 */
import { describe, expect, it } from 'vitest'
import fixture from '../__fixtures__/optics.json'
import { HBAR, K_BOLTZMANN } from '../constants'
import * as C from './collisions'
import * as E from './cooling'

const T = fixture.values as unknown as Record<string, [number, number]>
const ATOMS = { Na: E.NA_D2, Rb: E.RB87_D2, Cs: E.CS_D2, H: E.H_LYA }
const NA = E.NA_D2
const RB = E.RB87_D2
const RB85 = E.RB85_D2
const CS = E.CS_D2
const vc = E.captureVelocity(NA)
const gk = E.gammaOverK(NA)
const rbSlow = E.zeemanSlower(NA, 879, 0.5)
const motP = { s: 1, dl: -1, A: 0.1, muPrime: 9.2740100783e-24 }
const U1 = E.lightShiftGround(RB, 0.5, -4, 1)
const mNa = NA.massKg / 2
const mCs = CS.massKg / 2

/** key -> the engine's value */
const engine: Record<string, () => number> = {
  'scatterRate.Na.1.-0.5': () => E.scatterRate(NA, 1, -0.5),
  'scatterRate.Rb.0.3.-4': () => E.scatterRate(RB, 0.3, -4),
  'slowRow.Na.712.vPeak': () => E.slowRow(NA, 712).vPeak,
  'slowRow.Na.712.stopLength': () => E.slowRow(NA, 712).stopLength,
  'slowRow.Na.712.stopTime': () => E.slowRow(NA, 712).stopTime,
  'zeemanSlower.Na.879.0.5.z0': () => rbSlow.z0,
  'zeemanSlower.Na.879.0.5.B0': () => rbSlow.B0,
  'zeemanSlower.Na.879.0.5.tStop': () => rbSlow.tStop,
  'zeemanProfile.Na.0.3.vR': () => E.zeemanProfile(rbSlow, 0.3).vR,
  'zeemanProfile.Na.0.3.B': () => E.zeemanProfile(rbSlow, 0.3).B,
  'chirpRate.Na.0.5': () => E.chirpRate(NA, 0.5),
  'dopplerOverGamma.Na.879': () => E.dopplerOverGamma(NA, 879),
  'slowerDamping.Na.0.5.2.beta': () => E.slowerDamping(NA, 0.5, 2).beta,
  'slowerDamping.Na.0.5.2.time': () => E.slowerDamping(NA, 0.5, 2).time,
  'transverseDiffusion.Na.879.0.5': () => E.transverseDiffusion(NA, 879, 0.5),
  'divergence.0.01.1000.50': () => E.divergence(0.01, 1000, 50),
  'secondOrderDoppler.500': () => E.secondOrderDoppler(500),
  'flightLimit.3.500': () => E.flightLimit(3, 500),
  'beamForces.Na.1.-0.5.plus': () => E.beamForces(NA, 1, -0.5, 0.7 * gk).plus,
  'beamForces.Na.1.-0.5.minus': () => E.beamForces(NA, 1, -0.5, 0.7 * gk).minus,
  'beamForces.Na.1.-0.5.sum': () => E.beamForces(NA, 1, -0.5, 0.7 * gk).sum,
  'molassesBeta.Na.1.-0.5': () => E.molassesBeta(NA, 1, -0.5),
  'molassesBeta.Na.0.3.-2': () => E.molassesBeta(NA, 0.3, -2),
  'molassesPeak.Na.1.-0.5': () => E.molassesPeak(NA, 1, -0.5),
  'molassesPeakFormula.Na.1.-0.5': () => E.molassesPeakFormula(NA, 1, -0.5),
  'captureVelocity.Na': () => vc,
  'dopplerSteadyT.Na.-1': () => E.dopplerSteadyT(NA, -1),
  'dopplerSteadyT.Na.-0.5': () => E.dopplerSteadyT(NA, -0.5),
  'diffusionTemperature.Na.0.01.-0.5': () => E.diffusionTemperature(NA, 0.01, -0.5),
  'diffusionTemperature.Na.1.-0.5': () => E.diffusionTemperature(NA, 1, -0.5),
  'molassesLinearityError.Na.1.-0.5.vc': () => E.molassesLinearityError(NA, 1, -0.5, vc),
  'molassesLinearityError.Na.1.-0.5.half': () => E.molassesLinearityError(NA, 1, -0.5, vc / 2),
  'collimation.Rb.gOverGR': () => E.collimation(RB, 423.15).gOverGR,
  'collimation.Rb.compress1D': () => E.collimation(RB, 423.15).compress1D,
  'collimation.Rb.dvRms': () => E.collimation(RB, 423.15).dvRms,
  'collimation.Rb.vc': () => E.collimation(RB, 423.15).vc,
  'collimation.Rb.dx': () => E.collimation(RB, 423.15).dx,
  'collimation.Rb.psCompress': () => E.collimation(RB, 423.15).psCompress,
  'molassesWalk.Na.0.01.step': () => E.molassesWalk(NA, 0.01).step,
  'molassesWalk.Na.0.01.steps': () => E.molassesWalk(NA, 0.01).steps,
  'molassesWalk.Na.0.01.time': () => E.molassesWalk(NA, 0.01).time,
  'dressed.Na.2.1.omega': () => E.dressed(NA, 2, 1).omega,
  'dressed.Na.2.1.shift': () => E.dressed(NA, 2, 1).shift,
  'dressed.Na.2.1.cos2phi': () => E.dressed(NA, 2, 1).cos2phi,
  'dopplerSpeed1D.Rb': () => E.dopplerSpeed1D(RB),
  'clebschSquared.1/2.1/2.1': () => E.clebschSquared(0.5, 0.5, 1),
  'clebschSquared.1/2.-1/2.1': () => E.clebschSquared(0.5, -0.5, 1),
  'clebschSquared.1/2.1/2.-1': () => E.clebschSquared(0.5, 0.5, -1),
  'clebschSquared.1.1.1': () => E.clebschSquared(1, 1, 1),
  'clebschSquared.1.1.-1': () => E.clebschSquared(1, 1, -1),
  'clebschSquared.1.0.0': () => E.clebschSquared(1, 0, 0),
  'clebschSquared.3/2.1/2.0': () => E.clebschSquared(1.5, 0.5, 0),
  'lightShiftGround.Rb.0.5.-4.1': () => U1,
  'lightShiftGround.Rb.0.5.-4.0.5': () => E.lightShiftGround(RB, 0.5, -4, 0.5),
  'sisyphusPotential.0.1.plus': () => E.sisyphusPotential(U1, 0.1, 0.5),
  'sisyphusPotential.0.1.minus': () => E.sisyphusPotential(U1, 0.1, -0.5),
  sisyphusHill: () => E.sisyphusHill(U1),
  'sisyphusFriction.Rb.-4': () => E.sisyphusFriction(RB, -4),
  'dopplerFrictionMax.Rb': () => E.dopplerFrictionMax(RB),
  'subDopplerLimit.lin': () => E.subDopplerLimit(U1, 0.125),
  'subDopplerLimit.sigma': () => E.subDopplerLimit(U1, 0.097),
  'zeemanOmega.Rb85.1G': () => E.zeemanOmega(1 / 3, 1e-4),
  'vsrVelocity.sigma.1G': () => E.vsrVelocity(E.zeemanOmega(1 / 3, 1e-4), E.waveNumber(RB85), 'sigma'),
  'vsrVelocity.lin.1G': () => E.vsrVelocity(E.zeemanOmega(1 / 3, 1e-4), E.waveNumber(RB85), 'lin'),
  'vsrForce.0.2.1.1.5': () => E.vsrForce(0.2, 1, 1, 1.5),
  'vsrForcePair.0.2.1.1.5': () => E.vsrForcePair(0.2, 1, 1, 1.5),
  'milcWindow.Rb85.0.1G': () => E.milcWindow(RB85, 1 / 3, 1e-5).low,
  'trapAcceleration.Na.1.1': () => E.trapAcceleration(NA.massKg, 1, 1),
  'quadrupoleU.1.1.0.01.0.005': () => E.quadrupoleU(1, 1, 0.01, 0.005),
  'circularOrbit.v': () => E.circularOrbit(E.trapAcceleration(NA.massKg, 1, 1), 0.01).v,
  'circularOrbit.period': () => E.circularOrbit(E.trapAcceleration(NA.massKg, 1, 1), 0.01).period,
  'adiabaticLimits.rhoMin': () => E.adiabaticLimits(E.trapAcceleration(NA.massKg, 1, 1), NA.massKg).rhoMin,
  'adiabaticLimits.vMin': () => E.adiabaticLimits(E.trapAcceleration(NA.massKg, 1, 1), NA.massKg).vMin,
  orbitN: () => E.orbitN(NA.massKg, E.circularOrbit(E.trapAcceleration(NA.massKg, 1, 1), 0.01).v, 0.01),
  heuristicE1: () => E.heuristicE1(NA.massKg, E.trapAcceleration(NA.massKg, 1, 1)),
  'heuristicLevel.2': () => E.heuristicLevel(NA.massKg, E.trapAcceleration(NA.massKg, 1, 1), 2),
  'vTrapLevels.Na.1T.1': () => E.vTrapLevels(NA.massKg, 9.2740100783e-24, 3)[0],
  'vTrapLevels.Na.1T.3': () => E.vTrapLevels(NA.massKg, 9.2740100783e-24, 3)[2],
  'zeemanEnergyK.1.1e-4': () => E.zeemanEnergyK(1, 1e-4),
  'trapDepthK.1.0.02': () => E.trapDepthK(1, 0.02),
  'dipoleDepth.Na.2e8.-1e6': () => E.dipoleDepth(NA, 2e8, -1e6),
  'dipoleScatterRate.Na.2e8.-1e6': () => E.dipoleScatterRate(NA, 2e8, -1e6),
  recoilHeatingTime: () => E.recoilHeatingTime(E.dipoleDepth(NA, 2e8, -1e6), NA, E.dipoleScatterRate(NA, 2e8, -1e6)),
  latticeVibration: () => E.latticeVibration((2 / 3) * Math.abs(U1), HBAR * E.recoilRate(RB)),
  'latticeVibration.bandGap': () => E.latticeVibration((2 / 3) * Math.abs(U1), HBAR * E.recoilRate(RB)),
  'motForce.Rb.0.002.0.5': () => E.motForce(RB, motP, 0.002, 0.5),
  'motLinear.kappa': () => E.motLinear(RB, motP).kappa,
  'motLinear.beta': () => E.motLinear(RB, motP).beta,
  'motLinear.omega': () => E.motLinear(RB, motP).omega,
  'motLinear.size': () => E.motLinear(RB, motP).size,
  'motLinear.zeta': () => E.motLinear(RB, motP).zeta,
  'capture.Cs.0.03.v': () => E.capture(CS, 0.03).v,
  'capture.Cs.0.03.energyK': () => E.capture(CS, 0.03).energyK,
  'boltzmannBelow.Cs.5.300': () => E.boltzmannBelow(5, 300, CS.massKg),
  'boltzmannBelow.Cs.10.300': () => E.boltzmannBelow(10, 300, CS.massKg),
  'boltzmannBelow.Cs.200.300': () => E.boltzmannBelow(200, 300, CS.massKg),
  'boltzmannBelow.Cs.59.300': () => E.boltzmannBelow(59, 300, CS.massKg),
  'boltzmannBelow.Cs.118.300': () => E.boltzmannBelow(118, 300, CS.massKg),
  'boltzmannBelow.Cs.5.300.erf': () => E.boltzmannBelow(5, 300, CS.massKg),
  'vaporDensity.1e-5.300': () => E.vaporDensity(1e-5, 300),
  'deBroglie.1e-27': () => E.deBroglie(1e-27),
  'thermalDeBroglie.Na.1e-6': () => E.thermalDeBroglie(NA.massKg, 1e-6),
  'erf.0.5': () => E.erf(0.5),
  'erf.2.5': () => E.erf(2.5),
  'langevinBarrier.Na.1.Rc': () => C.langevinBarrier(6, C.C6_NA_AU * C.AU_C6, mNa, 1).Rc,
  'langevinBarrier.Na.1.Vc': () => C.langevinBarrier(6, C.C6_NA_AU * C.AU_C6, mNa, 1).Vc,
  'barrierTop.Na.1': () => C.barrierTop(6, C.C6_NA_AU * C.AU_C6, mNa, 1),
  'langevinPotential.Na.1.8e-9': () => C.langevinPotential(6, C.C6_NA_AU * C.AU_C6, mNa, 1, 8e-9),
  'quantumOnsetT.Na': () => C.quantumOnsetT(6, C.C6_NA_AU * C.AU_C6, mNa),
  'quantumOnsetT.Cs': () => C.quantumOnsetT(6, C.C6_CS_AU * C.AU_C6, mCs),
  'partialWaves.Na.1e-3': () => C.partialWaves(6, C.C6_NA_AU * C.AU_C6, mNa, 1e-3),
  'partialWaves.Na.1e-4': () => C.partialWaves(6, C.C6_NA_AU * C.AU_C6, mNa, 1e-4),
  'thresholdCross.Na.1e-30': () => C.thresholdCross(6, C.C6_NA_AU * C.AU_C6, mNa, 1e-30),
  'thresholdCross.Na.slope': () => Math.log(C.thresholdCross(6, C.C6_NA_AU * C.AU_C6, mNa, 2e-30) / C.thresholdCross(6, C.C6_NA_AU * C.AU_C6, mNa, 1e-30)) / Math.log(2),
  'ramseyChance.0.4.0.35': () => C.ramseyChance(0.4, 0.35),
  'ramseyWidth.0.35': () => C.ramseyWidth(0.35),
  'fountainTime.0.15': () => C.fountainTime(0.15),
  'bounceTime.0.003': () => C.bounceTime(0.003),
  'kapitzaDiracAngle.Na.1000.1': () => C.kapitzaDiracAngle(NA, 1000, 1),
  'dopplerFwhm.Na.300': () => C.dopplerFwhm(NA, 300),
  'wavenumberToK.17': () => C.wavenumberToK(17),
  'hzToK.9192631770': () => C.hzToK(C.CS_HFS_HZ),
  'releaseSpeed.Cs': () => C.releaseSpeed(CS.massKg, 6.62607015e-34 * C.CS_HFS_HZ),
}
for (const [nm, A] of Object.entries(ATOMS)) {
  engine[`recoilVelocity.${nm}`] = () => E.recoilVelocity(A)
  engine[`recoilRate.${nm}`] = () => E.recoilRate(A)
  engine[`recoilTemperature.${nm}`] = () => E.recoilTemperature(A)
  engine[`dopplerTemperature.${nm}`] = () => E.dopplerTemperature(A)
  engine[`maxAcceleration.${nm}`] = () => E.maxAcceleration(A)
  engine[`saturationIntensity.${nm}`] = () => E.saturationIntensity(A)
  engine[`gammaOverK.${nm}`] = () => E.gammaOverK(A)
}
for (let i = 1; i <= 8; i++) engine[`vTrapUnits.${i}`] = () => E.vTrapUnits(8)[i - 1]

describe('optics engine <-> numpy twin (pipeline/make_optics_fixtures.py)', () => {
  it('every fixture key has an engine call and every engine call a fixture key', () => {
    expect(Object.keys(engine).sort()).toEqual(Object.keys(T).sort())
  })
  it.each(Object.keys(T))('%s', (key) => {
    const [want, tol] = T[key]
    const got = engine[key]()
    expect(Math.abs(got - want), `${key}: engine ${got} vs numpy ${want}`).toBeLessThanOrEqual(tol * Math.max(Math.abs(want), 1e-300))
  })
})

describe('optics engine properties', () => {
  it('Table 1.1 comes out near the printed rows (Na stopping length 0.426 m against 0.42)', () => {
    const r = E.slowRow(NA, 712)
    expect(r.stopLength / 0.42).toBeGreaterThan(0.98)
    expect(r.stopLength / 0.42).toBeLessThan(1.03)
  })
  it("the slower's profile starts at B0, v0 and ends at 0 at z0; beyond z0 it is 0; the book's z0 is a length (Correction C1)", () => {
    expect(E.zeemanProfile(rbSlow, 0)).toEqual({ B: rbSlow.B0, vR: 879 })
    expect(E.zeemanProfile(rbSlow, rbSlow.z0).B).toBeCloseTo(0, 12)
    expect(E.zeemanProfile(rbSlow, 2 * rbSlow.z0).vR).toBe(0)
    expect(rbSlow.z0).toBeCloseTo((NA.massKg * 879 ** 2) / (0.5 * HBAR * E.waveNumber(NA) * NA.gamma), 12)
    expect(E.zeemanSlower(NA, 879, 1).z0).toBeCloseTo(E.slowRow(NA, 712).stopLength * (879 / E.slowRow(NA, 712).vPeak) ** 2, 9)
  })
  it("Eq. 2.2 is exactly the derivative of the two-beam force, and the book's force peak equals the numerical one", () => {
    const dv = 1e-3
    const num = -(E.beamForces(NA, 1, -0.5, dv).sum - E.beamForces(NA, 1, -0.5, -dv).sum) / (2 * dv)
    expect(num / E.molassesBeta(NA, 1, -0.5)).toBeCloseTo(1, 7)
    for (const [s, dl] of [[1, -0.5], [0.2, -1.5], [3, -0.3]]) expect(E.molassesPeak(NA, s, dl) / E.molassesPeakFormula(NA, s, dl)).toBeCloseTo(1, 6)
  })
  it('the molasses temperature is minimal at δ = −γ/2 and approaches ħγ/2k_B as s → 0; blue detuning has no temperature', () => {
    expect(E.dopplerSteadyT(NA, -0.5)).toBeCloseTo(E.dopplerTemperature(NA), 15)
    expect(E.dopplerSteadyT(NA, -0.3)).toBeGreaterThan(E.dopplerTemperature(NA))
    expect(E.dopplerSteadyT(NA, -0.8)).toBeGreaterThan(E.dopplerTemperature(NA))
    expect(E.diffusionTemperature(NA, 1e-4, -0.5) / E.dopplerTemperature(NA)).toBeCloseTo(1, 3)
    expect(E.diffusionTemperature(NA, 1, 0.5)).toBeNaN()
  })
  it('Clebsch–Gordan weights: σ⁺ on the stretched state is 1, the other sublevel one third; the three polarizations of a state sum to (2Je+1)/(2Jg+1)', () => {
    expect(E.clebschSquared(0.5, 0.5, 1)).toBe(1)
    expect(E.clebschSquared(0.5, -0.5, 1)).toBeCloseTo(1 / 3, 15)
    for (const [J, m] of [[1, 0], [1, 1], [1.5, 0.5], [0.5, -0.5]]) expect(E.clebschSquared(J, m, 1) + E.clebschSquared(J, m, 0) + E.clebschSquared(J, m, -1)).toBeCloseTo((2 * J + 3) / (2 * J + 1), 12)
  })
  it('sisyphus potentials: the two sublevels are out of phase and one takes ⅓|U₁| at the other\'s extreme', () => {
    expect(E.sisyphusPotential(-1, 0, 0.5)).toBeCloseTo(-1, 15)
    expect(E.sisyphusPotential(-1, 0, -0.5)).toBeCloseTo(-1 / 3, 15)
    expect(E.sisyphusPotential(-1, 0.25, 0.5)).toBeCloseTo(-1 / 3, 15)
    expect(E.sisyphusHill(-3)).toBeCloseTo(2, 15)
    expect(E.sisyphusFriction(RB, -4) / E.dopplerFrictionMax(RB)).toBeCloseTo(8, 12)
  })
  it('V-shaped well: the levels alternate between the zeros of Ai′ and Ai and the n^{2/3} law is only asymptotic', () => {
    const u = E.vTrapUnits(6)
    expect(u[0]).toBeCloseTo(1.0187929716, 6)
    expect(u[1]).toBeCloseTo(2.3381074105, 6)
    expect(u[2]).toBeCloseTo(3.2481975822, 6)
    expect(u[1] / u[0]).toBeGreaterThan(2 ** (2 / 3))
  })
  it('the dipole depth is positive, small against ħΩ and stable at huge detunings (no cancellation)', () => {
    const far = E.dipoleDepth(NA, 2e8, -1e6)
    expect(far).toBeGreaterThan(0)
    expect(far / ((HBAR * NA.gamma ** 2 * 2e8) / (8 * 1e6 * NA.gamma))).toBeCloseTo(1, 3)
  })
  it('the MOT force is odd in z and v, restoring and damping near 0, and κ/β = μ′A/ħk exactly', () => {
    expect(E.motForce(RB, motP, 0.003, 0.2)).toBeCloseTo(-E.motForce(RB, motP, -0.003, -0.2), 20)
    expect(E.motForce(RB, motP, 0.0005, 0)).toBeLessThan(0)
    expect(E.motForce(RB, motP, 0, 0.1)).toBeLessThan(0)
    const l = E.motLinear(RB, motP)
    expect(l.kappa / l.beta).toBeCloseTo((motP.muPrime * motP.A) / (HBAR * E.waveNumber(RB)), 9)
  })
  it('the share of a vapour below v_c grows as v_c³ (Correction C7) and tends to 1 at large v_c', () => {
    expect(E.boltzmannBelow(10, 300, CS.massKg) / E.boltzmannBelow(5, 300, CS.massKg)).toBeCloseTo(8, 1)
    expect(E.boltzmannBelow(2000, 300, CS.massKg)).toBeCloseTo(1, 12)
    expect(E.boltzmannBelow(0.5, 300, CS.massKg)).toBeGreaterThan(0)
  })
  it('doubling v_c multiplies the share by 7.99 only while v_c is small (5 to 10 m/s); at the 59 m/s capture speed the ratio is 6.8, not 8 (review B2)', () => {
    const ratio = (v: number): number => E.boltzmannBelow(2 * v, 300, CS.massKg) / E.boltzmannBelow(v, 300, CS.massKg)
    expect(ratio(5)).toBeCloseTo(7.99, 2)
    expect(ratio(59)).toBeCloseTo(6.8, 2)
    expect(ratio(59)).toBeLessThan(ratio(5) - 1)
  })
  it('the 3D sub-Doppler limit is a fraction of |U₁| and the recoil temperatures follow the book\'s two conventions (Correction C6)', () => {
    expect(E.subDopplerLimit(U1, 0.125) * K_BOLTZMANN).toBeCloseTo(0.125 * Math.abs(U1), 25)
    expect(E.recoilTemperature(NA) * 1e6).toBeCloseTo(2.4, 1)
    expect(E.recoilTemperature(NA)).toBeCloseTo((2 * HBAR * E.recoilRate(NA)) / K_BOLTZMANN, 18)
  })
})
