/**
 * Lecture 11 numbers, computed once with the engine (owner: P). Same contract as L1–L9.values.ts: every number a learner reads in
 * L11 comes from `V` and is backed by a keyed claim; the numpy twin of each key is in physics/__fixtures__/claims.json
 * (pipeline/make_claim_fixtures.py, "Lecture 11" block), and for the Townsend-pass keys (`l11T…`, `l11Pr…`) in physics/__fixtures__/claims-448/g4a.json
 * (pipeline/claims_448/g4a.py). Keys start with `l11`.
 *
 * Conventions (physics/dynamics.ts): ħ = 1, energies in a unit ε, time as the angle εt/ħ. The example two-level system has
 * E₊ = 3ε and E₋ = ε, so Ē = 2ε and ħω = 2ε: the arrow makes a quarter Bloch turn at εt/ħ = 45°, a full lap at 180°, and
 * U(T) = −I exactly (rulings 448-L8L11, L11 R2). "At every ..." sweeps store the worst sample (`worst`), so the value equals its
 * target only if every sample does. A displayed magnitude of a negative number gets its own key (the number reader sees digits,
 * not signs). Yes/no facts are 1 or 0. Angles in degrees are inputs: they are written with ° in the prose and are never read as
 * results; each still has a key so the claim ledger covers it.
 *
 * This file imports physics/qc (shared engine) but no stage module: a lecture chunk must not pull in stage/svg.
 */
import { abs, arg, c } from '../physics/complex'
import {
  ammoniaChances, ammoniaH, ammoniaPeriod, clockHands, energyAverage, energySpread, evolveKet, ketRate, meanPhase, precession, precessionPeriod, stepProduct, tinyStep,
  twoLevelEnergies, twoLevelH, twoLevelWeak,
} from '../physics/dynamics'
import { E_CHARGE, photonEnergy, photonFrequency } from '../physics/constants'
import { type Mat, type Vec, apply, dagger, diag2, identity, inner, isUnitary, madd, mat, matEq, matmul, maxDiff, mpow, mscale, msub, norm2, normalize, vec } from '../physics/linalg'
import { eigen2, evolve, generatorOf } from '../physics/operators'
import { applyGate, pauliEigenvalue, pauliString } from '../physics/qc/gates'
import { expectationN } from '../physics/qc/measure'
import { bell } from '../physics/qc/state'
import { type Circuit, runCircuit } from '../physics/qc/circuit'
import { eulerLimit } from '../physics/qc/complexExtra'
import { KET, Rz, SIGMA_X, SIGMA_Z, SZ, blochVector, eigenHermitian2, prob, samePhysicalState } from '../physics/spin'
import { keyedClaim } from './claimKit'

const DEG = Math.PI / 180
const yes = (b: boolean) => (b ? 1 : 0)
/** The sample farthest from `target`: equal to the target only if EVERY sample is (a minimum would only prove "at least"). */
const worst = (xs: number[], target: number) => xs.reduce((w, x) => (Math.abs(x - target) > Math.abs(w - target) ? x : w), target)

/* the lecture's example: E₊ = 3ε, E₋ = ε, start |+x⟩ */
const L31 = { upper: 3, lower: 1 }
const TL = twoLevelH(L31.upper, L31.lower)
const HEX = TL.H
const PX = KET['+x']
const U = (deg: number): Mat => evolve(HEX, deg * DEG)
const psiAt = (deg: number, start: Vec = PX): Vec => evolveKet(HEX, deg * DEG, start)

/* l11-wait: the GHZ recap (Unit 10.8) and the first look at waiting */
/** |G⟩ = ½(|000⟩ − |011⟩ − |101⟩ − |110⟩), the entangled state of Lecture 10's GHZ game, built by H on q0, two CNOTs, H and S on every wire. */
export const GHZ_CIRCUIT: Circuit = {
  version: 1,
  qubits: 3,
  columns: [
    [{ op: 'gate', gate: 'H', targets: [0] }],
    [{ op: 'gate', gate: 'X', controls: [0], targets: [1] }],
    [{ op: 'gate', gate: 'X', controls: [0], targets: [2] }],
    [{ op: 'gate', gate: 'H', targets: [0] }, { op: 'gate', gate: 'H', targets: [1] }, { op: 'gate', gate: 'H', targets: [2] }],
    [{ op: 'gate', gate: 'S', targets: [0] }, { op: 'gate', gate: 'S', targets: [1] }, { op: 'gate', gate: 'S', targets: [2] }],
  ],
}
const ghzPsi = runCircuit(GHZ_CIRCUIT).states[GHZ_CIRCUIT.columns.length]
const ghzWant = [0.5, 0, 0, -0.5, 0, -0.5, -0.5, 0] // |000⟩ … |111⟩
const GHZ_ROWS = ['ZZZ', 'ZXX', 'XZX', 'XXZ']
const GHZ_REQUIRED = [1, -1, -1, -1]
const ghzEigen = GHZ_ROWS.map((s) => pauliEigenvalue(ghzPsi, s))
const hTiny = 1e-3
const tinyErr = maxDiff(Rz(hTiny), madd(identity(2), mscale(SZ, c(0, -hTiny))))
const rz90 = apply(Rz(90 * DEG), PX)

/* l11-unitary */
const RZ60 = Rz(60 * DEG)
const lens = [0, 90, 270].map((d) => Math.hypot(...blochVector(apply(Rz(d * DEG), PX))))
const U1: Mat = mat([[1, Math.SQRT1_2], [0, Math.SQRT1_2]])
const U2: Mat = mat([[1, c(0, Math.SQRT1_2)], [0, Math.SQRT1_2]])
const sq = (M: Mat, k: keyof typeof KET) => norm2(apply(M, KET[k]))
const U1dU1 = matmul(dagger(U1), U1)
const unitaryCandidates = [RZ60, diag2(1, 2), mat([[1, 1], [0, 1]]), mscale(identity(2), 0.5)]

/* l11-generator */
const A_EX = mscale(SIGMA_Z, c(0, -1)) // −iσ_z, the example anti-Hermitian A
const hEig = [TL.H[0][0].re, TL.H[1][1].re] // the energies of H = diag(3ε, ε)
const eigA = eigen2(A_EX)
const rzExp = evolve(SZ, 1.234)
const dtStep = tinyStep(HEX, 0.01)
// Go deeper 2: the N-step product of H = diag(1, −1), t = π/2 (Ē = 0, ωt = 180°)
const HG = diag2(1, -1)
const TG = Math.PI / 2
const stepLen2 = (N: number) => norm2(apply(stepProduct(HG, TG, N), PX))
const stepErr = (N: number) => maxDiff(stepProduct(HG, TG, N), evolve(HG, TG))
const eulerMod = (N: number) => abs(eulerLimit(-Math.PI / 2, N))
const bigEuler = eulerLimit(-Math.PI / 2, 1_000_000)

/* l11-schrodinger */
const fdT = 0.7
const fdH = 1e-6
const fd = apply(mscale(madd(evolve(HEX, fdT + fdH), mscale(evolve(HEX, fdT), -1)), 1 / fdH), PX)
const fdWant = ketRate(HEX, evolveKet(HEX, fdT, PX))
const fdGap = Math.max(...fd.map((z, i) => abs({ re: z.re - fdWant[i].re, im: z.im - fdWant[i].im })))
const rateZ = ketRate(HEX, KET['+z'])
const genRz = generatorOf((phi) => Rz(phi))
const ph30 = psiAt(30)
const ampLens = [0, 10, 30, 45, 90, 135].flatMap((deg) => psiAt(deg).map((z) => Math.hypot(z.re, z.im)))

/* l11-stationary */
const statTimes = [10, 30, 60, 100, 200]
const statOk = statTimes.every((d) => samePhysicalState(psiAt(d, KET['+z']), KET['+z']) && Math.abs(energyAverage(HEX, psiAt(d, KET['+z'])) - 3) < 1e-12)
const statProb = statTimes.map((d) => prob(KET['+z'], psiAt(d, KET['+z'])))
const statMinus = statTimes.map((d) => prob(KET['-z'], psiAt(d, KET['-z'])))
const energyTimes = [0, 30, 45, 90].map((d) => energyAverage(HEX, psiAt(d)))
const weightTimes = [0, 30, 45, 90, 135].map((d) => prob(KET['+z'], psiAt(d)))
const ph45 = psiAt(45)

/* l11-two-level */
const clocks30 = clockHands(L31, PX, 30 * DEG)
const clocks45 = clockHands(L31, PX, 45 * DEG)
const r30 = blochVector(psiAt(30))
const r45 = blochVector(psiAt(45))
const uT = evolve(HEX, precessionPeriod(L31))
const uTx = inner(PX, apply(uT, PX))
const minusI: Mat = mscale(identity(2), -1)
const uIsRz = [30, 77].every((d) => matEq(U(d), mscale(Rz(TL.hbarOmega * d * DEG), meanPhase(TL.mean, d * DEG)), 1e-12))
const szs = [0, 20, 45, 90, 135, 180].map((d) => blochVector(psiAt(d))[2] / 2)
const shifted = twoLevelH(6, 4)
const pxShift = precession({ upper: 6, lower: 4 }, 30 * DEG).pPlusX
const gapShift = clockHands({ upper: 6, lower: 4 }, PX, 30 * DEG).gap! / DEG
const prec = (omegaT: number) => precession(L31, (omegaT / 2) * DEG)
const rThree = blochVector(apply(mpow(Rz(30 * DEG), 3), PX))
const steps3 = Math.atan2(rThree[1], rThree[0]) / DEG

/* Townsend pass G4a (Townsend Ch. 4; claim twins in pipeline/claims_448/g4a.py). Composition, the operator equation, ⟨H⟩ for a generic state, the field along z, ammonia, the levels in a field, practice. */
const composeGap = maxDiff(evolve(HEX, 0.3 + 0.45), matmul(evolve(HEX, 0.45), evolve(HEX, 0.3)))
const opEq = [0.2, 0.9, 1.7].every((t) => {
  const h = 1e-5
  const dU = mscale(msub(evolve(HEX, t + h), evolve(HEX, t - h)), 1 / (2 * h))
  return maxDiff(dU, mscale(matmul(HEX, evolve(HEX, t)), c(0, -1))) < 1e-8
})
const GENERIC = normalize([c(Math.cos(20 * DEG), 0), c(Math.sin(20 * DEG) * Math.cos(0.7), Math.sin(20 * DEG) * Math.sin(0.7))])
const energyGap = Math.max(...[0.4, 1.1, 2.5, 4].map((t) => Math.abs(energyAverage(HEX, evolveKet(HEX, t, GENERIC)) - energyAverage(HEX, GENERIC))))
const uIsRotation = [0.4, 1.3, 2.9].every((t) => matEq(evolve(mscale(SZ, 0.7), t), Rz(0.7 * t), 1e-12))
/** The ammonia pair with E₀ = 2ε and A = ε: its energies are the lecture's own 3ε and ε. */
const AMM = { E0: 2, A: 1 }
const ammH = ammoniaH(AMM.E0, AMM.A)
const ammEig = eigenHermitian2(ammH).values // [E₀ + A, E₀ − A]
const ammT = ammoniaPeriod(AMM.A)
const ammSame = Math.max(...[0.1, 0.4, 0.8, 1.3, 2.2, 3.0].map((t) => Math.abs(ammoniaChances(AMM.E0, AMM.A, t).above - precession(L31, t).pPlusX)))
const ammDE = energySpread(ammH, vec(1, 0))
/** The real molecule's line: a wavelength of about one and a quarter centimetres (an input, quoted in words only). */
const LAMBDA_AMM = 0.0125
const ammFreq = photonFrequency(LAMBDA_AMM)
const lv = (x: number) => twoLevelEnergies(x)[1]
/** The weak field of the example, x = μ|E|/A (an input, like an angle). */
const FIELD_WEAK = 0.3
/* practice questions (types as in Townsend's chapter problems and the course homework; fresh numbers) */
const Uph = evolve(mscale(SIGMA_Z, 0.8 / 2), 2.5)
const psiDir = evolveKet(mscale(SIGMA_Z, 0.5), 1.5 * Math.PI, PX)
const bellPsi = bell('Phi+')
const bellAfter = applyGate(bellPsi, evolve(mscale(SIGMA_Z, 0.5), 2.4), [0])

export const V = {
  /* l11-wait */
  l11GhzRequired: GHZ_REQUIRED.reduce((a, b) => a * b, 1), // −1: the four required answers multiply to −1 (every answer squared gives +1)
  l11GhzState: yes(ghzPsi.every((z, i) => Math.abs(z.re - ghzWant[i]) < 1e-12 && Math.abs(z.im) < 1e-12)), // 1: the circuit builds ½(|000⟩ − |011⟩ − |101⟩ − |110⟩)
  l11GhzAmp: Math.max(...ghzPsi.map((z) => abs(z))), // 0.5: the size of each of the four amplitudes
  l11GhzEigen: yes(ghzEigen.join() === '1,-1,-1,-1'), // 1: ZZZ|G⟩ = +|G⟩, ZXX|G⟩ = XZX|G⟩ = XXZ|G⟩ = −|G⟩
  l11Rz90: yes(samePhysicalState(rz90, KET['+y'])), // 1: R_z(90°)|+x⟩ is |+y⟩
  l11TinyRz: yes(tinyErr < 2 * hTiny * hTiny), // 1: R_z(dφ) = I − i S_z dφ up to a term of order dφ²
  l11Px: prob(KET['+z'], PX), // 0.5: P(+z) for |+x⟩
  /* l11-unitary */
  l11RzUnitary: yes(isUnitary(RZ60)), // 1
  l11LenKept: worst(lens, 1), // 1: |r| at 0°, 90°, 270° of a z turn
  l11UdagU: yes(matEq(matmul(dagger(RZ60), RZ60), identity(2))), // 1
  l11UnWhich: yes(unitaryCandidates.map((M) => isUnitary(M)).join() === 'true,false,false,false'), // 1: only R_z(60°) can describe waiting
  l11BadX: sq(U1, '+x'), // 1.7071
  l11BadZ: worst([sq(U1, '+z'), sq(U1, '-z')], 1), // 1
  l11BadY: sq(U1, '+y'), // 1
  l11BadOff: U1dU1[0][1].re, // 0.7071: the off-diagonal entry of U1†U1
  l11U2X: sq(U2, '+x'), // 1
  l11U2Y: sq(U2, '+y'), // 0.2929
  l11U2Z: worst([sq(U2, '+z'), sq(U2, '-z')], 1), // 1
  l11U1NotUnitary: yes(!isUnitary(U1) && !isUnitary(U2)), // 1
  /* l11-generator */
  l11AntiH: yes(matEq(dagger(A_EX), mscale(A_EX, -1))), // 1: (−iσ_z)† = −(−iσ_z)
  l11HUpper: hEig[0], // 3: the energies of H = diag(3ε, ε)
  l11HLower: hEig[1], // 1
  l11AntiWhich: yes([A_EX, SIGMA_Z, SIGMA_X, madd(identity(2), SIGMA_Z)].map((M) => matEq(dagger(M), mscale(M, -1))).join() === 'true,false,false,false'), // 1: only −iσ_z is anti-Hermitian
  l11AEig: yes(Math.abs(eigA.values[0].re) < 1e-12 && Math.abs(eigA.values[1].re) < 1e-12 && Math.abs(eigA.values[0].im - 1) < 1e-12 && Math.abs(eigA.values[1].im + 1) < 1e-12), // 1: −iσ_z has eigenvalues +i and −i
  l11Limit: yes(abs(c(bigEuler.re, bigEuler.im + 1)) < 1e-5), // 1: the product of tiny turns closes on −i
  l11RzIsExp: yes(matEq(rzExp, Rz(1.234), 1e-12)), // 1: e^{−iφS_z} = R_z(φ)
  l11DtLen2: norm2(apply(dtStep, PX)), // 1.0005: one tiny step of 0.01 stretches |+x⟩ by a second-order amount
  l11Over1: stepLen2(1), // 3.4674: squared length after N = 1 (Go deeper 2)
  l11Over10: stepLen2(10), // 1.2760
  l11Over100: stepLen2(100), // 1.0250
  l11Over1000: stepLen2(1000), // 1.0025
  l11Err1: stepErr(1), // 1.1514: largest entry gap to U
  l11Err10: stepErr(10), // 0.1303
  l11Err100: stepErr(100), // 0.01241
  l11Err1000: stepErr(1000), // 0.001234
  l11Euler1: eulerMod(1), // 1.8621
  l11Euler4: eulerMod(4), // 1.3322
  l11Euler64: eulerMod(64), // 1.0195
  /* l11-schrodinger */
  l11FD: yes(fdGap < 1e-5), // 1: (U(t+h)ψ − U(t)ψ)/h = −iH U(t)ψ for h = 10⁻⁶
  l11DerivZ: rateZ[0].im, // −3: d/dt of the |+z⟩ amplitude at t = 0, in units of iε/ħ
  l11DerivZMag: Math.abs(rateZ[0].im), // 3
  l11DerivRz: yes(matEq(genRz, SZ, 1e-8)), // 1: the generator of R_z is S_z
  l11AmpLen: worst(ampLens, Math.SQRT1_2), // 0.7071: each amplitude of |+x⟩ keeps its size while its phase turns
  l11PhaseUp30: arg(ph30[0]) / DEG, // −90: the |+z⟩ phase at εt/ħ = 30°
  l11PhaseDown30: arg(ph30[1]) / DEG, // −30
  /* l11-stationary */
  l11StatZ: yes(statOk), // 1: |+z⟩ only gains a phase and ⟨H⟩ = 3 at every sampled time
  l11StatProb: worst(statProb, 1), // 1: P(+z) at every sampled time
  l11RelPhase45: (arg(ph45[1]) - arg(ph45[0])) / DEG, // 90: the relative phase at εt/ħ = 45°
  l11EnergyConst: worst(energyTimes, 2), // 2: ⟨H⟩ for |+x⟩ at 0°, 30°, 45°, 90°
  l11WeightConst: worst(weightTimes, 0.5), // 0.5: the chance of the energy 3ε for |+x⟩ at every time (the other is 1 − that)
  l11StatMinus: worst(statMinus, 1), // 1: P(−z) after any wait from |−z⟩
  l11EnergyAt90: energyAverage(HEX, psiAt(90)), // 2
  /* l11-two-level */
  l11Mean: TL.mean, // 2
  l11HbarOmega: TL.hbarOmega, // 2
  l11UisRz: yes(uIsRz), // 1: U(t) = e^{−iĒt/ħ} R_z(ωt)
  l11Hand30Up: clocks30.angle[0] / DEG, // −90
  l11Hand30Down: clocks30.angle[1] / DEG, // −30
  l11Gap30: clocks30.gap! / DEG, // 60
  l11Gap45: clocks45.gap! / DEG, // 90
  l11R30x: r30[0], // 0.5: the arrow at ωt = 60°
  l11R30y: r30[1], // 0.8660
  l11R30z: r30[2], // 0
  l11R45y: r45[1], // 1: the arrow at ωt = 90° points along +y
  l11LapDeg: precessionPeriod(L31) / DEG, // 180: one lap of the arrow, as εt/ħ
  l11SzConst: worst(szs, 0), // 0: ⟨S_z⟩ never changes
  l11UT: yes(matEq(uT, minusI, 1e-12)), // 1: U(T) = −I for 3ε and ε
  l11UTx: uTx.re, // −1: ⟨+x|U(T)|+x⟩
  l11UTxMag: Math.abs(uTx.re), // 1
  l11Px60: prec(60).pPlusX, // 0.75: P(+x) at ωt = 60° with levels 3ε, ε
  l11Px60Shift: pxShift, // 0.75: the same with both levels raised by 2ε
  l11Gap60Shift: gapShift, // 60
  l11ShiftHbarOmega: shifted.hbarOmega, // 2: the splitting does not change
  l11PxT0: prec(0).pPlusX, // 1
  l11PxT90: prec(90).pPlusX, // 0.5
  l11PxT180: prec(180).pPlusX, // 0
  l11SxT0: prec(0).sx, // 0.5 (units of ħ)
  l11SxT60: prec(60).sx, // 0.25
  l11SxT90: prec(90).sx, // 0
  l11SxT180: prec(180).sx, // −0.5
  l11SxT180Mag: Math.abs(prec(180).sx), // 0.5
  /* challenges */
  l11Steps3: steps3, // 90: three R_z(30°) turns are one turn of 90°
  /* Townsend pass G4a */
  l11TComposeGap: composeGap, // 0 (a rounding error): U(t₁ + t₂) against U(t₂)U(t₁)
  l11TOpEq: yes(opEq), // 1: the finite-difference derivative of U(t) equals −iH U(t) at three times
  l11TEnergyConstGap: energyGap, // 0 (a rounding error): ⟨H⟩ of a generic superposition at four later times against its start
  l11TUisRotation: yes(uIsRotation), // 1: H = ω₀S_z gives exactly R_z(ω₀t), with no overall phase
  l11TAmmLow: ammEig[1], // 1: the lower energy of the ammonia pair (E₀ = 2ε, A = ε)
  l11TAmmHigh: ammEig[0], // 3
  l11TAmmSameAsClocks: ammSame, // 0 (a rounding error): P(nitrogen above) against the lecture's P(+x; t)
  l11TAmmFlipDeg: ammT / 2 / DEG, // 90: εt/ħ at which the nitrogen is on the other side
  l11TAmmBelowAtFlip: ammoniaChances(AMM.E0, AMM.A, ammT / 2).below, // 1
  l11TAmmPeriodDeg: ammT / DEG, // 180: one full period T = πħ/A as εt/ħ
  l11TAmmPAboveQuarter: ammoniaChances(AMM.E0, AMM.A, ammT / 4).above, // 0.5
  l11TAmmDeltaE: ammDE, // 1 (in A): the energy spread of the state with the nitrogen above
  l11TAmmDtRatio: 1 / (2 * ammDE) / (ammT / 2), // 0.3183: (ħ/2ΔE) against the half period
  l11TAmmFreqGHz: ammFreq / 1e9, // 23.983: c/λ for λ of one and a quarter centimetres
  l11TAmmEnergyUeV: (photonEnergy(LAMBDA_AMM) / E_CHARGE) * 1e6, // 99.187: hc/λ in micro-electron-volts, the level gap 2A
  l11TAmmPeriodPs: (1 / ammFreq) * 1e12, // 41.696: the period T
  l11TLevelAt1: lv(1), // 1.41421
  l11TLevelApproxAt1: twoLevelWeak(1), // 1.5
  l11TFieldWeak: FIELD_WEAK, // 0.3: the weak field of the example (an input)
  l11TLevelAtP3: lv(FIELD_WEAK), // 1.04403
  l11TLevelApproxAtP3: twoLevelWeak(FIELD_WEAK), // 1.045
  l11TLevelErr1: twoLevelWeak(1) / lv(1) - 1, // 0.0607: the weak-field form is 6 percent high at x = 1
  l11PrPhase: (arg(Uph[1][1]) - arg(Uph[0][0])) / DEG, // 114.59: the diagonal phases of U differ by Ωt = 2 rad
  l11PrPx: prob(PX, evolveKet(mscale(SIGMA_Z, 0.3), 3.5, PX)), // 0.2476
  l11PrYComp: blochVector(psiDir)[1], // −1: after three quarters of a period the arrow points along −y
  l11PrXX: expectationN(bellAfter, pauliString('XX')).re, // −0.7374
  l11PrZZ: expectationN(bellAfter, pauliString('ZZ')).re, // 1
} as const

export type ValueKey = keyof typeof V

/** A claim tied to one L11 engine value: its text starts with `key · ` (read by content/claims.test.ts). */
export const claim = keyedClaim<ValueKey>()

export { close, d, pct, tf, uf } from './claimKit'
