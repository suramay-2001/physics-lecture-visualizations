/**
 * qc/machines.ts against numpy (pipeline/make_machines_fixtures.py -> __fixtures__/qc-machines.json; the routes are in pipeline/machines_numpy.py: dense Kronecker CNOTs,
 * reshaped partial traces, leggauss and brentq, a grid for the discriminator optimum), plus the cross-checks of P-Q20-story §9.1 (circuit against matrices, Eqs. 8.4-8.8,
 * 8.23, 8.26-8.28, 8.38-8.47) and properties.
 */
import { describe, expect, it } from 'vitest'
import raw from '../__fixtures__/qc-machines.json?raw'
import { abs, c } from '../complex'
import { type Mat, type Vec, identity, matmul, mscale } from '../linalg'
import { validateCircuit } from './circuit'
import { I2, X, Y, Z } from './gates'
import {
  type ProgramSpec,
  BELL_PAULI,
  PSI_RUN,
  XI00,
  XI0X,
  antisymmetric,
  bellProgramGap,
  blochAzimuthDeg,
  blochKet,
  blochLength,
  blochVector,
  choiMinEig,
  choiSpectrum,
  clonerCircuit,
  clonerCircuitGap,
  clonerFidelities,
  clonerFormulaGap,
  clonerOutputs,
  clonerPairOverlap,
  clonerProgram,
  cnotBranchGap,
  cnotProcessor,
  copyFidelity,
  discBasis,
  discBlock,
  discBlockGap,
  discGridBest,
  distinctOperations,
  expectationSpread,
  failureOverlap,
  maxC0C1,
  maxOperations,
  measureCorrectOperations,
  measurePrepareClone,
  measurePrepareUnot,
  outputPurity,
  pairAtOverlap,
  perpKet,
  phaseFlipFormulaGap,
  phaseFlipGap,
  phaseFlipProgram,
  phaseFlipRun,
  prCircuit,
  processorExpectation,
  processorOverlapGap,
  programBox,
  rayGap,
  programNormGap,
  programmableUsd,
  programmableUsdBest,
  rusBranchGap,
  rusCircuit,
  rusCircuitGap,
  rusCircuitSuccess,
  rusRounds,
  rusSuccess,
  sphereAverage,
  toffoliGap,
  toffoliProcessor,
  U0,
  uAlpha,
  uinMatrix,
  uinOverlap,
  uinProgram,
  uinUnitaryGap,
  unotLimit,
  unotShrunk,
  unotTurned,
  unotYTYGap,
  universalSpread,
  usdKnown,
  usdProgrammableAt,
  xiProgram,
} from './machines'
import { reducedDensity } from './density'
import { unotMap } from './channels'

type Cx = [number, number]
const FX = JSON.parse(raw) as Record<string, any>
const cx = (m: Cx[][]): Mat => m.map((row) => row.map(([re, im]) => c(re, im)))
const cvec = (v: Cx[]): Vec => v.map(([re, im]) => c(re, im))
const close = (a: number, b: number, eps = 1e-12): void => expect(Math.abs(a - b)).toBeLessThan(eps)
const gapM = (A: Mat, B: Mat): number => Math.max(...A.flatMap((row, i) => row.map((z, j) => abs(c(z.re - B[i][j].re, z.im - B[i][j].im)))))
const PSI_PLUS = blochKet(90, 0)

describe('the cloner circuit (Fig. 8.1, Eqs. 8.1-8.8)', () => {
  it('is a valid six-column circuit and equals the four CNOT matrices applied to psi (x) Xi', () => {
    for (const p of ['00', '0x', 'Phi+', 'Psi-', { uDeg: 22 }, { flip: [60, 0] }] as ProgramSpec[]) {
      expect(validateCircuit(clonerCircuit(p)).ok).toBe(true)
      expect(clonerCircuit(p).columns).toHaveLength(6)
      expect(clonerCircuitGap(p)).toBeLessThan(1e-12)
    }
  })
  it('programBox is unitary with the program as its first column', () => {
    const B = programBox(clonerProgram(17).xi)
    expect(gapM(matmul(B.map((r, i) => r.map((_, j) => B[j][i]).map((z) => c(z.re, -z.im))), B), identity(4))).toBeLessThan(1e-12)
    clonerProgram(17).xi.forEach((z, i) => close(abs(c(z.re - B[i][0].re, z.im - B[i][0].im)), 0))
  })
  it('program 00 leaves the state on wire 1 and program 0x moves it to wire 2, a pure state (Eq. 8.2); the programs overlap by one half', () => {
    expect(gapM(clonerOutputs('00')[0], proj1(PSI_RUN))).toBeLessThan(1e-12)
    expect(gapM(clonerOutputs('0x')[1], proj1(PSI_RUN))).toBeLessThan(1e-12)
    expect(outputPurity(clonerOutputs('0x')[1])).toBeCloseTo(1, 12)
    expect(XI00.reduce((s, z, i) => s + z.re * XI0X[i].re + z.im * XI0X[i].im, 0)).toBeCloseTo(0.5, 12)
  })
  it('matches numpy: c0, c1, both fidelities and the pair overlap over the program angle', () => {
    for (const k of FX.cloner.cases) {
      const p = clonerProgram(k.u)
      close(p.c0, k.c0)
      close(p.c1, k.c1)
      const f = clonerFidelities(k.u)
      close(f.f1, k.f1)
      close(f.f2, k.f2)
      close(clonerPairOverlap(k.u, PSI_RUN), k.pair)
    }
    const o = FX.cloner.other
    close(clonerFidelities(o.u, o.theta, o.phi).f1, o.f)
    close(clonerFidelities(o.u, o.theta, o.phi).f2, o.f2)
  })
  it('matches numpy: the three reduced outputs of the DRAWN circuit at three program angles', () => {
    for (const u of [0, 15, 30]) {
      const mine = clonerOutputs({ uDeg: u })
      FX.cloner.outputs[String(u)].forEach((m: Cx[][], k: number) => expect(gapM(mine[k], cx(m))).toBeLessThan(1e-12))
    }
  })
  it('Eqs. 8.4 and 8.6 and the cross term hold at four angles; the program is normalised; every input gets the same F_c at the equal split', () => {
    for (const u of [5, 17, 41, 55]) {
      const g = clonerFormulaGap(u)
      expect(Math.max(g.rho1, g.rho2, g.rho3, g.cross)).toBeLessThan(1e-12)
      expect(programNormGap(u)).toBeLessThan(1e-12)
    }
    expect(universalSpread(30, 200, 709)).toBeLessThan(1e-12)
    close(clonerFidelities(30).f1, 5 / 6)
    close(clonerFidelities(30).f2, 5 / 6)
    close(clonerFidelities(30, 120, 30).f1, 5 / 6)
  })
  it('the equal split shrinks the arrow by two thirds without turning it, and its root fidelity is sqrt(5/6)', () => {
    const [r1] = clonerOutputs({ uDeg: 30 })
    close(blochLength(r1) / blochLength(proj1(PSI_RUN)), 2 / 3)
    const rv = blochVector(r1)
    const pv = blochVector(proj1(PSI_RUN))
    rv.forEach((x, i) => close(x, (2 / 3) * pv[i]))
    close(Math.sqrt(copyFidelity(r1, PSI_RUN)), Math.sqrt(5 / 6))
    close(maxC0C1().value, FX.cloner.maxC0C1[0])
    close(maxC0C1().uDeg, FX.cloner.maxC0C1[1])
    close(maxC0C1().value, 1 / 3)
    close(universalSpread(30, 200, 709), FX.cloner.spread, 1e-12)
  })
})
const proj1 = (psi: Vec): Mat => psi.map((a) => psi.map((b) => c(a.re * b.re + a.im * b.im, a.im * b.re - a.re * b.im)))

describe('the U-NOT (Eqs. 8.6-8.12)', () => {
  it('wire 3 holds c0 c1 of the conjugate state; a half turn about y makes 2/3 psi-perp + 1/3 psi (matches numpy)', () => {
    const turned = unotTurned(clonerOutputs({ uDeg: 30 })[2])
    expect(gapM(turned, cx(FX.unot.turned))).toBeLessThan(1e-12)
    const want = proj1(perpKet(PSI_RUN)).map((r, i) => r.map((z, j) => c((2 / 3) * z.re + (1 / 3) * proj1(PSI_RUN)[i][j].re, (2 / 3) * z.im + (1 / 3) * proj1(PSI_RUN)[i][j].im)))
    expect(gapM(turned, want)).toBeLessThan(1e-12)
    const rv = blochVector(turned)
    close(rv[0] * blochVector(proj1(PSI_RUN))[0] + rv[1] * blochVector(proj1(PSI_RUN))[1] + rv[2] * blochVector(proj1(PSI_RUN))[2], -1 / 3)
    close(blochVector(clonerOutputs({ uDeg: 30 })[2])[1], -0.5 * Math.sqrt(3) / 3)
    expect(U0[0][1].re).toBe(-1) // U0|1> = -|0>, U0|0> = +|1>
    expect(U0[1][0].re).toBe(1)
  })
  it('the ideal U-NOT is sigma_y (transpose) sigma_y and has the Choi spectrum -1/2, 1/2, 1/2, 1/2 (matches numpy)', () => {
    close(Math.max(...choiSpectrum(unotMap).map((x, i) => Math.abs(x - FX.unot.ideal[i]))), 0)
    close(choiMinEig(unotMap), -0.5)
    expect(unotYTYGap([proj1(PSI_RUN), proj1(blochKet(120, 30)), mscale(identity(2), 0.5)])).toBeLessThan(1e-12)
  })
  it('the shrunk U-NOT is completely positive exactly up to p = 1/3 (Choi spectra match numpy; the limit is the root)', () => {
    for (const k of FX.unot.choiMin) {
      const mine = choiSpectrum(unotShrunk(k.p))
      k.spectrum.forEach((x: number, i: number) => close(mine[i], x, 1e-12))
      close(mine[0], 0.25 - 0.75 * k.p, 1e-12)
    }
    close(unotLimit(), FX.unot.limit, 1e-12)
    close(unotLimit(), 1 / 3, 1e-12)
  })
  it('measure-and-prepare: the U-NOT average and the cloning fidelities match numpy and the closed forms', () => {
    expect(gapM(measurePrepareUnot(PSI_RUN), cx(FX.unot.mpUnot))).toBeLessThan(1e-12)
    const mc = measurePrepareClone(PSI_RUN)
    close(mc.single, FX.unot.mpClone[0])
    close(mc.both, FX.unot.mpClone[1])
    close(mc.single, 2 / 3)
    close(mc.both, 1 / 2)
    const mo = measurePrepareClone(blochKet(120, 30))
    close(mo.single, FX.unot.mpCloneOther[0])
    close(mo.both, FX.unot.mpCloneOther[1])
    close(clonerPairOverlap(30, PSI_RUN), 2 / 3)
  })
  it('sphereAverage integrates the sphere: the mean of |psi><psi| over all directions is I/2 and of x^2 + (1-x)^2 is 2/3', () => {
    expect(gapM(sphereAverage(proj1), mscale(identity(2), 0.5))).toBeLessThan(1e-13)
    const fid = sphereAverage((eta) => {
      const x = overlapSq(eta, PSI_RUN)
      return [[c(x * x + (1 - x) * (1 - x)), c(0)], [c(0), c(0)]]
    })
    close(fid[0][0].re, 2 / 3)
  })
})
const overlapSq = (a: Vec, b: Vec): number => {
  const ip = a.reduce((s, z, i) => ({ re: s.re + z.re * b[i].re + z.im * b[i].im, im: s.im + z.re * b[i].im - z.im * b[i].re }), { re: 0, im: 0 })
  return ip.re * ip.re + ip.im * ip.im
}

describe('the no-go (Eqs. 8.13-8.19)', () => {
  it('<psi|sigma_z|psi> = cos(theta) changes with the state; a pure phase never does (matches numpy)', () => {
    for (const k of FX.nogo.expect) {
      const e = processorExpectation(I2, Z, blochKet(k.theta, 0))
      close(e.re, k.value[0])
      close(e.im, k.value[1])
    }
    const S = FX.nogo.spread
    const ph = mscale(I2, c(Math.cos(0.7), Math.sin(0.7)))
    close(expectationSpread(I2, Z), S.Z)
    close(expectationSpread(I2, Z), 2)
    close(expectationSpread(I2, X), S.X)
    close(expectationSpread(ph, I2), S.phase)
    close(expectationSpread(ph, I2), 0)
    close(expectationSpread(Y, X), S.YX)
  })
  it('the controlled-U processor obeys the overlap identity (Eq. 8.16) (matches numpy)', () => {
    const g = FX.nogo.processorGap as number[]
    expect(g.every((x) => x < 1e-12)).toBe(true)
    expect(processorOverlapGap(I2, Z, PSI_RUN)).toBeLessThan(1e-12)
    expect(processorOverlapGap(X, Y, PSI_RUN)).toBeLessThan(1e-12)
  })
  it('a register of n qubits holds 2^n operations; measure-and-correct holds two, not four; phases do not count', () => {
    expect(maxOperations(10)).toBe(1024)
    expect(maxOperations(8)).toBe(256)
    const Rz4: Mat = [[c(Math.cos(0.2), -Math.sin(0.2)), c(0)], [c(0), c(Math.cos(0.2), Math.sin(0.2))]]
    expect(measureCorrectOperations(Rz4, X, 40)).toBe(FX.nogo.distinct)
    expect(measureCorrectOperations(Rz4, X, 40)).toBe(2)
    expect(distinctOperations([I2, X, Y, Z])).toBe(FX.nogo.distinctAll)
    expect(distinctOperations([I2, mscale(I2, c(0, 1)), mscale(I2, c(-1, 0))])).toBe(1)
  })
})

describe('probabilistic processors (Eqs. 8.20-8.21, 8.29-8.30)', () => {
  it('the CNOT processor succeeds half the time with U(alpha) psi and fails with U^-1(alpha) psi (matches numpy)', () => {
    for (const k of FX.proc.cnot) {
      const psi = k.psi === '+x' ? PSI_PLUS : PSI_RUN
      const r = cnotProcessor(k.alpha, psi)
      close(r.pSuccess, k.p0)
      close(r.pFail, k.p1)
      close(r.pSuccess, 0.5)
      close(rayGap(r.success, cvec(k.success)), 0)
      close(rayGap(r.failure, cvec(k.failure)), 0)
      expect(cnotBranchGap(k.alpha, psi)).toBeLessThan(1e-12)
      close(blochAzimuthDeg(r.success), k.azimuth, 1e-9)
    }
    close(blochAzimuthDeg(cnotProcessor(20, PSI_PLUS).success), -40, 1e-9)
    const b = blochVector(proj1(cnotProcessor(30, PSI_PLUS).success))
    close(b[0], 0.5)
    close(b[1], -Math.sqrt(3) / 2)
  })
  it('retry gives 1 - 2^-k (matches numpy), every success branch is U(alpha) psi, and 7 and 10 rounds pass 99 % and 99.9 %', () => {
    for (const k of FX.proc.rus) {
      close(rusSuccess(k.k), k.p)
      close(rusSuccess(k.k), 1 - 2 ** -k.k)
    }
    expect(rusBranchGap(7)).toBeLessThan(1e-12)
    expect(rusBranchGap(5, 20, PSI_RUN)).toBeLessThan(1e-12)
    expect(rusRounds(0.99)).toBe(7)
    expect(rusRounds(0.999)).toBe(10)
  })
  it('the drawn circuits are valid; the coherent two-round circuit equals the Toffoli processor and its readings give 3/4 (matches numpy)', () => {
    expect(validateCircuit(prCircuit(30)).ok).toBe(true)
    expect(validateCircuit(rusCircuit(30)).ok).toBe(true)
    expect(rusCircuit(30).columns).toHaveLength(5)
    expect(rusCircuitGap(30)).toBeLessThan(1e-12)
    close(rusCircuitSuccess(30), FX.proc.rusCircuit30)
    close(rusCircuitSuccess(30), 0.75)
  })
  it('the Toffoli processor: three readings of four succeed, each with chance 1/4, and the failing one overlaps the goal by 1/4 (matches numpy)', () => {
    for (const k of FX.proc.toffoli) {
      const psi = k.psi === '+x' ? PSI_PLUS : PSI_RUN
      const t = toffoliProcessor(k.alpha, psi)
      t.pReadings.forEach((p, i) => close(p, k.readings[i]))
      k.data.forEach((d: Cx[], i: number) => close(rayGap(i < 3 ? t.success[i] : t.failure, cvec(d)), 0))
      expect(toffoliGap(k.alpha, psi)).toBeLessThan(1e-12)
    }
    close(toffoliProcessor(30, PSI_PLUS).pSuccess, 0.75)
    close(toffoliProcessor(30, PSI_PLUS).pFail, 0.25)
    close(failureOverlap(30, PSI_PLUS), 0.25)
  })
  it('xiProgram and uAlpha are unit and unitary', () => {
    close(xiProgram(30).reduce((s, z) => s + z.re * z.re + z.im * z.im, 0), 1)
    close(abs(uAlpha(30)[0][0]), 1)
    close(uAlpha(30)[0][0].im, 0.5)
  })
})

describe('Bell programs and the phase flip (Eqs. 8.22-8.28)', () => {
  it('each Bell program applies its Pauli and leaves the program unchanged (Eq. 8.23)', () => {
    expect(bellProgramGap()).toBeLessThan(1e-12)
    expect(bellProgramGap(120, 40)).toBeLessThan(1e-12)
    expect(Object.keys(BELL_PAULI)).toHaveLength(4)
  })
  it('the flip coefficients, program, chance 1/3 and data match numpy at six directions; cx X + cy(-iY) + cz Z = U_phi', () => {
    for (const k of FX.bell.flips) {
      const f = phaseFlipProgram(k.theta, k.phi)
      f.coef.forEach((z, i) => {
        close(z.re, k.coef[i][0])
        close(z.im, k.coef[i][1])
      })
      f.xi.forEach((z, i) => close(abs(c(z.re - k.xi[i][0], z.im - k.xi[i][1])), 0))
      expect(phaseFlipFormulaGap(k.theta, k.phi)).toBeLessThan(1e-12)
      const r = phaseFlipRun(PSI_RUN, k.theta, k.phi)
      close(r.p, k.p)
      close(r.p, 1 / 3)
      close(rayGap(r.data, cvec(k.data)), 0)
      close(uinOverlap(k.theta, k.phi), k.uin)
      close(uinOverlap(k.theta, k.phi), 1)
    }
    expect(phaseFlipGap(PSI_RUN, [[60, 0], [120, 0], [90, 90], [45, 200]])).toBeLessThan(1e-12)
    expect(phaseFlipGap(PSI_PLUS, [[60, 0], [90, 0]])).toBeLessThan(1e-12)
  })
  it('U_in is unitary and equals the matrix of Eq. 8.27; a flip about +x is the single program Psi+ up to sign', () => {
    expect(uinUnitaryGap()).toBeLessThan(1e-12)
    expect(gapM(uinMatrix(), cx(FX.bell.uinMatrix))).toBe(0)
    const f = phaseFlipProgram(90, 0)
    close(f.coef[0].re, -1)
    close(Math.abs(f.coef[1].im) + Math.abs(f.coef[2].re), 0)
    close(abs(phaseFlipProgram(90, 90).coef[1]), 1)
    close(phaseFlipProgram(120, 0).coef[2].re, 0.5)
    expect(uinProgram(60, 0)).toHaveLength(4)
  })
})

describe('the programmable discriminator (Eqs. 8.31-8.47)', () => {
  it('the two operators never err and the chance is c (1 - s^2)/2 each (matches numpy); the antisymmetric projector is a projector', () => {
    for (const k of FX.disc.cases) {
      const r = programmableUsd(cvec(k.psi1), cvec(k.psi2), k.c1, k.c2)
      close(r.p1, k.p1)
      close(r.p2, k.p2)
      close(r.P, k.P)
      close(r.pi0MinEig, k.minEig, 1e-12)
      close(r.zeroGap, k.zeroGap, 1e-12)
      expect(r.zeroGap).toBeLessThan(1e-12)
      close(r.p1, (k.c1 * (1 - k.s * k.s)) / 2, 1e-12)
    }
    const P = antisymmetric(1, 2)
    expect(gapM(matmul(P, P), P)).toBeLessThan(1e-12)
  })
  it('Eq. 8.40 is an orthonormal basis and Eq. 8.41 is Pi0 in it (matches numpy); the printed constant breaks the block', () => {
    const B = discBasis()
    B.forEach((a, i) => B.forEach((b, j) => close(a.reduce((s, z, k) => s + z.re * b[k].re + z.im * b[k].im, 0), i === j ? 1 : 0)))
    for (const k of FX.disc.block) {
      const d = discBlock(k.c1, k.c2)
      expect(gapM(d.matrix, cx(k.matrix))).toBeLessThan(1e-12)
      close(d.trace, k.trace)
      close(d.detTrue, k.detTrue)
      close(d.detPrinted, k.detPrinted)
      close(d.discPrinted, k.discPrinted)
      d.eigs.forEach((x, i) => close(x, k.eigs[i], 1e-12))
      close(discBlockGap(k.c1, k.c2), k.gap, 1e-12)
      expect(discBlockGap(k.c1, k.c2)).toBeLessThan(1e-12)
    }
    const d = discBlock(2 / 3, 2 / 3)
    close(d.detTrue, 0)
    close(d.detPrinted, 2 / 3)
    close(d.discPrinted, -20 / 9)
    close(d.eigs[0], 0)
    close(d.eigs[1], 2 / 3)
  })
  it('the optimum is c = 2/3 and P = (1 - s^2)/3 (bisection on Pi0 >= 0; a grid never beats it); the curves match the closed forms', () => {
    const [a, b] = pairAtOverlap(0.5)
    const best = programmableUsdBest(a, b)
    close(best.c, FX.disc.optC, 1e-12)
    close(best.c, 2 / 3, 1e-12)
    close(best.P, 0.25, 1e-12)
    expect(discGridBest(30).sum).toBeLessThanOrEqual(2 * best.c + 1e-9)
    close(discGridBest(30).sum, FX.disc.grid[2])
    for (const k of FX.disc.known) {
      close(usdKnown(k.s), k.known, 1e-12)
      close(usdProgrammableAt(k.s), k.prog, 1e-12)
    }
  })
  it('reducedDensity of the cloner and the reduced states are consistent with the pure output purity', () => {
    const run = clonerOutputs({ uDeg: 30 })
    expect(run).toHaveLength(3)
    expect(reducedDensity(PSI_RUN, [0])[0][0].re).toBeCloseTo(0.75, 12)
  })
})
