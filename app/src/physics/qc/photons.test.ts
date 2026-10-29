/**
 * qc/photons.ts against numpy (pipeline/make_photon_fixtures.py -> __fixtures__/qc-photons.json; routes in pipeline/photon_numpy.py: the exponential of the mode generator on a truncated
 * Fock space, itertools permanents, sympy polynomials, scipy fsolve, a six-index tensor for gate teleportation), plus the cross-checks of P-Q26-story §9.1 and properties.
 */
import { describe, expect, it } from 'vitest'
import raw from '../__fixtures__/qc-photons.json?raw'
import { abs, abs2, c } from '../complex'
import { type Mat, type Vec, dagger, identity, matEq, matmul } from '../linalg'
import { photonTurn } from '../polarization'
import { rng } from '../random'
import { circuitUnitary, runCircuit, validateCircuit } from './circuit'
import { eigh, randomUnitary } from './cmat'
import { Ry } from './gates'
import {
  bellAnalyzerSuccess,
  blochPolarDeg,
  bsQ5,
  bsReal,
  bsSym,
  catFock,
  catNorm,
  cnotPlusZeroCircuit,
  cnotTeleport,
  cnotTeleportSweep,
  coherentFock,
  coherentOverlap,
  coherentOverlapSeries,
  compositions,
  conventionGap,
  conventions,
  czCircuit,
  czDualRail,
  czLeak,
  czPrinted,
  czSuccess,
  distinguishable,
  dualRailCircuit,
  dualRailKet,
  entCircuit,
  fockAmp,
  fockApply,
  fockBlock,
  fockNorm,
  fockNs,
  fockVacuum,
  gtCircuit,
  homBox,
  homCancelGap,
  homCircuit,
  homCircuitGap,
  homDip,
  homPhaseDeg,
  jcChi,
  jcEigenGap,
  jcLevels,
  jcMixDeg,
  jcPiTime,
  jcShift,
  kerrCircuit,
  kerrGate,
  klmNeeded,
  klmSuccess,
  meanPhotons,
  nsAmplitudes,
  nsClosed,
  nsFormulaGap,
  nsSignGap,
  nsSolve,
  permanent,
  randomBalanced,
  relativePhaseDeg,
  resCircuit,
  resourceGap,
  resourcePrinted,
  splitterCircuit,
  stokesGap,
  stokesGapSweep,
  stokesRelations,
  teleportOneCircuit,
  teleportOutput,
  twoPhoton,
  twoPhotonFormulaGap,
  twoSplitterCircuit,
  unitarityGap,
  waveCircuit,
  waveKet,
  waveP1,
  waveUnitary,
} from './photons'

const FX: any = JSON.parse(raw)
const cz = (p: [number, number]) => c(p[0], p[1])
const cm = (m: [number, number][][]): Mat => m.map((r) => r.map(cz))
const cv = (v: [number, number][]): Vec => v.map(cz)
const gap = (a: Mat, b: Mat) => Math.max(...a.flatMap((r, i) => r.map((z, j) => abs(c(z.re - b[i][j].re, z.im - b[i][j].im)))))
const vgap = (a: Vec, b: Vec) => Math.max(...a.map((z, i) => abs(c(z.re - b[i].re, z.im - b[i].im))))
const SPL: Record<string, Mat> = {}
for (const e of FX.splitters) SPL[e.name] = cm(e.S)

describe('wave plates and the dual-rail qubit (pp. 253-258)', () => {
  it('U(theta, varphi), U|0>, its Bloch polar angle and relative phase equal numpy; the relative phase is varphi + 90 degrees, the polar angle twice theta', () => {
    for (const k of FX.wave) {
      expect(gap(waveUnitary(k.theta, k.phi), cm(k.U))).toBeLessThan(1e-14)
      expect(Math.abs(blochPolarDeg(waveKet(k.theta, k.phi)) - k.polar)).toBeLessThan(1e-10)
      expect(Math.abs(blochPolarDeg(waveKet(k.theta, k.phi)) - 2 * k.theta)).toBeLessThan(1e-10)
      expect(Math.abs(relativePhaseDeg(waveKet(k.theta, k.phi)) - k.relPhase)).toBeLessThan(1e-10)
      expect(Math.abs(waveP1(k.theta, k.phi) - k.p1)).toBeLessThan(1e-14)
      expect(vgap(dualRailKet(k.theta, k.phi), cv(k.dual))).toBeLessThan(1e-14)
    }
    expect(relativePhaseDeg(waveKet(30, 40))).toBeCloseTo(130, 10)
    expect(relativePhaseDeg(waveKet(30, 40))).not.toBeCloseTo(40, 3)
  })
  it('U is unitary; the wave circuit and the dual-rail circuit run to the kets', () => {
    for (const [th, ph] of [[30, 40], [22.5, 112.5], [77, -20]]) {
      const U = waveUnitary(th, ph)
      expect(unitarityGap(U)).toBeLessThan(1e-14)
      expect(vgap(runCircuit(waveCircuit(th, ph)).states.at(-1)!, waveKet(th, ph))).toBeLessThan(1e-14)
      expect(validateCircuit(waveCircuit(th, ph)).ok).toBe(true)
      expect(vgap(runCircuit(dualRailCircuit(th, ph)).states.at(-1)!, dualRailKet(th, ph))).toBeLessThan(1e-14)
    }
  })
})

describe('the chapter reuses what is already built: Q5\'s splitter and 448\'s photon turn', () => {
  it('Chapter Q5\'s balanced splitter is R_y(pi/2), and the plate pair at varphi = -90 degrees is 448\'s photonTurn (a turn of the light by theta is a sphere turn of 2 theta about y)', () => {
    expect(matEq(bsQ5(), Ry(Math.PI / 2), 1e-12)).toBe(true)
    for (const th of [10, 30, 22.5, 45]) expect(matEq(waveUnitary(th, -90), photonTurn((th * Math.PI) / 180), 1e-12), `theta ${th}`).toBe(true)
  })
})

describe('splitters and the Stokes relations (Eqs. 14.1-14.2)', () => {
  it('the six residuals equal numpy for the named and the Haar-random splitters, and are about 1e-16', () => {
    for (const e of FX.splitters) {
      const mine = stokesRelations(SPL[e.name])
      mine.forEach((g, i) => expect(Math.abs(g - e.stokes[i]), `${e.name} ${i}`).toBeLessThan(1e-12))
      expect(Math.max(...mine)).toBeLessThan(1e-13)
    }
  })
  it('a lossy matrix breaks them (mutation): 0.9 times a splitter', () => {
    const bad = bsReal(0.3).map((r) => r.map((z) => c(0.9 * z.re, 0.9 * z.im)))
    expect(stokesGap(bad)).toBeGreaterThan(0.1)
    expect(unitarityGap(bad)).toBeGreaterThan(0.1)
  })
  it('the sweeps: three conventions and 200 random lossless splitters, all about 1e-16', () => {
    expect(stokesGapSweep(200, 26)).toBeLessThan(1e-13)
    expect(conventionGap()).toBeLessThan(1e-13)
    expect(conventions()).toHaveLength(13)
  })
  it('the one-photon block of the engine is the matrix itself; circuits for one photon (box S) give its first column', () => {
    for (const e of FX.splitters) expect(gap(fockBlock(SPL[e.name], 1), cm(e.block1))).toBeLessThan(1e-13)
    const S = bsReal(0.3)
    const st = runCircuit(splitterCircuit(S)).states.at(-1)!
    expect(abs2(st[0])).toBeCloseTo(0.7, 12)
    expect(abs2(st[1])).toBeCloseTo(0.3, 12)
    const two = runCircuit(twoSplitterCircuit(bsSym())).states.at(-1)!
    expect(abs2(two[1])).toBeCloseTo(1, 12)
    expect(abs(two[1])).toBeCloseTo(1, 12)
  })
  it('one photon in port 0 leaves entangled: the two occupation wires hold t\'|10> + r\'|01>', () => {
    const st = runCircuit(entCircuit(bsReal(0.3))).states.at(-1)!
    expect(abs2(st[2])).toBeCloseTo(0.7, 12)
    expect(abs2(st[1])).toBeCloseTo(0.3, 12)
    expect(abs2(st[0]) + abs2(st[3])).toBeLessThan(1e-14)
  })
})

describe('Fock amplitudes: permanents against the exponential of the mode generator', () => {
  it('the two- and three-photon blocks of every table splitter equal numpy to 1e-12 (and numpy\'s own two routes agree)', () => {
    for (const e of FX.splitters) {
      expect(gap(fockBlock(SPL[e.name], 2), cm(e.block2))).toBeLessThan(1e-12)
      expect(gap(fockBlock(SPL[e.name], 3), cm(e.block3))).toBeLessThan(1e-12)
      expect(gap(cm(e.block2), cm(e.block2perm))).toBeLessThan(1e-12)
      expect(gap(cm(e.block3perm), cm(e.block3))).toBeLessThan(1e-12)
    }
  })
  it('every block is unitary and its columns are probability distributions', () => {
    const rand = rng(7)
    for (let k = 0; k < 6; k++) {
      const S = randomUnitary(2, rand)
      for (const n of [1, 2, 3, 4]) {
        const B = fockBlock(S, n)
        expect(matEq(matmul(B, dagger(B)), identity(n + 1), 1e-12)).toBe(true)
        for (let b = 0; b <= n; b++) expect(Math.abs(B.reduce((s, row) => s + abs2(row[b]), 0) - 1)).toBeLessThan(1e-12)
      }
    }
  })
  it('permanents: the 2 x 2 rule, a rank-one matrix gives n! prod a_i, and the identity gives 1', () => {
    expect(permanent([[c(1), c(2)], [c(3), c(4)]]).re).toBeCloseTo(10, 12)
    const A = [1, 2, 3].map((a) => [1, 2, 3].map((b) => c(a * b)))
    expect(permanent(A).re).toBeCloseTo(6 * (1 * 2 * 3) * (1 * 2 * 3), 9)
    expect(permanent([[c(1), c(0)], [c(0), c(1)]]).re).toBeCloseTo(1, 12)
    expect(compositions(2, 2)).toEqual([[2, 0], [1, 1], [0, 2]])
    expect(compositions(3, 3)).toHaveLength(10)
  })
  it('fockApply conserves the norm and equals the block; the identity splitter does nothing', () => {
    const S = bsReal(0.3)
    const st = fockApply(fockVacuum([1, 1]), S, [0, 1])
    expect(fockNorm(st)).toBeCloseTo(1, 12)
    const w = twoPhoton(S)
    expect(abs(c(st.get('2,0')!.re - w.a20.re, st.get('2,0')!.im - w.a20.im))).toBeLessThan(1e-14)
    expect(fockNorm(fockApply(fockVacuum([2, 1, 1, 0]), bsSym(), [1, 2]))).toBeCloseTo(1, 12)
    expect(fockAmp([[c(1), c(0)], [c(0), c(1)]], [1, 1], [1, 1]).re).toBeCloseTo(1, 12)
  })
})

describe('Hong-Ou-Mandel (pp. 256-257)', () => {
  it('the three outputs and the dip (1 - 2R)^2 equal numpy at eleven reflectivities, and the closed forms', () => {
    for (const k of FX.dip) {
      const w = twoPhoton(bsReal(k.R))
      expect(abs(c(w.a20.re - k.a20[0], w.a20.im - k.a20[1]))).toBeLessThan(1e-12)
      expect(abs(c(w.a11.re - k.a11[0], w.a11.im - k.a11[1]))).toBeLessThan(1e-12)
      expect(abs(c(w.a02.re - k.a02[0], w.a02.im - k.a02[1]))).toBeLessThan(1e-12)
      expect(Math.abs(homDip(k.R) - k.p11)).toBeLessThan(1e-12)
      expect(Math.abs(homDip(k.R) - (1 - 2 * k.R) ** 2)).toBeLessThan(1e-12)
      expect(Math.abs(distinguishable(bsReal(k.R)) - k.dist)).toBeLessThan(1e-14)
      expect(Math.abs(k.dist - ((1 - k.R) ** 2 + k.R ** 2))).toBeLessThan(1e-14)
      expect(abs2(w.a20) + abs2(w.a11) + abs2(w.a02)).toBeCloseTo(1, 12)
    }
    expect(homDip(0.25)).toBeCloseTo(0.25, 12)
    expect(homDip(0.2)).toBeCloseTo(0.36, 12)
    expect(abs2(twoPhoton(bsReal(0.25)).a20)).toBeCloseTo(0.375, 12)
    expect(abs2(twoPhoton(bsReal(0.2)).a20)).toBeCloseTo(0.32, 12)
  })
  it('the middle amplitude cancels for 200 random lossless 50:50 splitters and the three named ones; the phase is 180, 0, 180', () => {
    expect(homCancelGap(200, 26)).toBeLessThan(1e-14)
    expect(Math.abs(homPhaseDeg(bsReal(0.5)) - FX.homPhase.real)).toBeLessThan(1e-9)
    expect(Math.abs(homPhaseDeg(bsQ5()) - FX.homPhase.q5)).toBeLessThan(1e-9)
    expect(homPhaseDeg(bsSym())).toBeLessThan(1e-9)
    expect(homPhaseDeg(bsReal(0.5))).toBeCloseTo(180, 9)
    const rand = rng(3)
    for (let k = 0; k < 20; k++) expect(abs(twoPhoton(randomBalanced(rand)).a11)).toBeLessThan(1e-14)
  })
  it('the box carries the block and the circuit runs to the amplitudes; the closed forms sqrt2 t\'r, t\'t + r\'r, sqrt2 r\'t hold for random splitters', () => {
    for (const S of [bsReal(0.25), bsSym(), bsQ5(), bsReal(0.2)]) {
      expect(homCircuitGap(S)).toBeLessThan(1e-14)
      expect(matEq(matmul(homBox(S), dagger(homBox(S))), identity(4), 1e-12)).toBe(true)
      expect(matEq(circuitUnitary(homCircuit(S)), homBox(S), 1e-12)).toBe(true)
    }
    expect(twoPhotonFormulaGap(50, 26)).toBeLessThan(1e-13)
  })
})

describe('the nonlinear sign gate (Fig. 14.4, pp. 258-259)', () => {
  it('the amplitudes A_0..A_3 equal numpy\'s matrix exponential and sympy polynomials, and the closed form, at three settings', () => {
    for (const k of FX.ns.amps) {
      const mine = nsAmplitudes(k.theta, k.phi, 3)
      mine.forEach((a, n) => {
        expect(Math.abs(a - k.expm[n])).toBeLessThan(1e-12)
        expect(Math.abs(a - k.sympy[n])).toBeLessThan(1e-12)
        expect(Math.abs(a - nsClosed(k.theta, k.phi, n))).toBeLessThan(1e-12)
      })
      expect(nsFormulaGap(k.theta, k.phi, 4)).toBeLessThan(1e-12)
    }
  })
  it('the solution equals fsolve on the printed conditions: 150.49, 61.58 degrees, success 0.2265 = (3 - sqrt2)/7, the other root cos theta 3.04', () => {
    const s = nsSolve()
    expect(Math.abs(s.thetaDeg - FX.ns.solve.theta)).toBeLessThan(1e-8)
    expect(Math.abs(s.phiDeg - FX.ns.solve.phi)).toBeLessThan(1e-8)
    expect(Math.abs(s.success - FX.ns.solve.success)).toBeLessThan(1e-12)
    expect(Math.abs(s.otherCosTheta - FX.ns.solve.otherCos)).toBeLessThan(1e-9)
    expect(s.success).toBeCloseTo((3 - Math.SQRT2) / 7, 14)
    expect(s.otherRoot).toBeCloseTo((3 + Math.SQRT2) / 7, 14)
    expect(Math.abs(s.otherCosTheta)).toBeGreaterThan(1)
    expect(nsSignGap()).toBeLessThan(1e-12)
    const A = nsAmplitudes(s.thetaDeg, s.phiDeg, 3)
    expect(A[3] / A[0]).toBeCloseTo(FX.ns.ratio3, 9)
    expect(Math.abs(A[3] / A[0])).toBeLessThan(0.7)
    expect(czSuccess()).toBeCloseTo(s.success ** 2, 14)
  })
})

describe('the photonic CZ (Fig. 14.5, pp. 259-260)', () => {
  it('four-mode Fock simulation: diag(i, 1, -1, i) without the sign gates and diag(i, 1, 1, i) with them, equal to numpy and to the printed tables, with no leakage', () => {
    expect(gap(czDualRail(false), cm(FX.cz.lin))).toBeLessThan(1e-12)
    expect(gap(czDualRail(true), cm(FX.cz.ns))).toBeLessThan(1e-12)
    expect(gap(czDualRail(false), czPrinted(false))).toBeLessThan(1e-13)
    expect(gap(czDualRail(true), czPrinted(true))).toBeLessThan(1e-13)
    expect(czLeak(false)).toBeLessThan(1e-12)
    expect(czLeak(true)).toBeLessThan(1e-12)
  })
  it('the gate is an entangler with the sign gates and not without (concurrence 1 and 0 on |++>)', () => {
    const st = (w: boolean) => runCircuit(czCircuit(w)).states.at(-1)!
    const conc = (v: Vec) => 2 * abs(c(v[0].re * v[3].re - v[0].im * v[3].im - (v[1].re * v[2].re - v[1].im * v[2].im), v[0].re * v[3].im + v[0].im * v[3].re - (v[1].re * v[2].im + v[1].im * v[2].re)))
    expect(conc(st(true))).toBeCloseTo(1, 12)
    expect(conc(st(false))).toBeLessThan(1e-12)
  })
  it('the ideal sign gate flips only |2>', () => {
    const s = fockNs(new Map([['0', c(1)], ['1', c(2)], ['2', c(3)]]), 0)
    expect(s.get('0')!.re).toBe(1)
    expect(s.get('1')!.re).toBe(2)
    expect(s.get('2')!.re).toBe(-3)
  })
})

describe('gate teleportation and KLM (Figs. 14.6-14.8, pp. 260-263)', () => {
  it('the resource circuit prepares the printed state, equal to numpy', () => {
    expect(resourceGap()).toBeLessThan(1e-14)
    expect(vgap(runCircuit(resCircuit()).states.at(-1)!, cv(FX.gt.resource))).toBeLessThan(1e-14)
    expect(vgap(resourcePrinted(), cv(FX.gt.printed))).toBe(0)
    expect(resCircuit().columns).toHaveLength(5)
  })
  it('all sixteen readings: chance 1/16 and one Pauli fixes the output to CNOT|c, t>, the chances and overlaps equal numpy (a seeded random pair)', () => {
    const ck = cv(FX.gt.c)
    const tk = cv(FX.gt.t)
    for (const o of FX.gt.outcomes) {
      const r = cnotTeleport(ck, tk, o.bits)
      expect(Math.abs(r.chance - o.chance)).toBeLessThan(1e-12)
      expect(Math.abs(1 - r.gap - o.best)).toBeLessThan(1e-9)
      expect(r.fixed).toBe(true)
      expect(r.chance).toBeCloseTo(1 / 16, 12)
    }
    const s = cnotTeleportSweep(6, 26)
    expect(s.allFixed).toBe(true)
    expect(s.gap).toBeLessThan(1e-12)
    expect(s.minChance).toBeCloseTo(1 / 16, 12)
    expect(s.maxChance).toBeCloseTo(1 / 16, 12)
  })
  it('input |+>|0> with readings 0000 leaves the Bell pair, which the ideal gate makes too; a wrong gate (a CZ) is not fixable by Paulis for all inputs', () => {
    const plus = [c(Math.SQRT1_2), c(Math.SQRT1_2)]
    const out = teleportOutput(plus, [c(1), c(0)], '0000')
    expect(vgap(out, cv(FX.gt.plusZero.out))).toBeLessThan(1e-12)
    expect(abs2(out[0])).toBeCloseTo(0.5, 12)
    expect(abs2(out[3])).toBeCloseTo(0.5, 12)
    const ideal = runCircuit(cnotPlusZeroCircuit()).states.at(-1)!
    expect(vgap(ideal.map((z) => z), out)).toBeLessThan(1e-12)
    expect(validateCircuit(gtCircuit()).ok).toBe(true)
    expect(validateCircuit(teleportOneCircuit()).ok).toBe(true)
  })
  it('KLM: (n/(n+1))^2 and the photons needed, equal to numpy\'s search; the analyser gets half the Bell states', () => {
    for (const k of FX.klm.table) expect(klmSuccess(k.n)).toBeCloseTo(k.p, 14)
    for (const F of [0.9, 0.99]) {
      expect(klmNeeded(F).n).toBe(FX.klm.least[String(F)])
      expect(Math.abs(klmNeeded(F).exact - FX.klm.exact[String(F)])).toBeLessThan(1e-9)
    }
    expect(klmNeeded(0.99).n).toBe(199)
    expect(klmSuccess(18)).toBeLessThan(0.9)
    expect(klmSuccess(19)).toBeGreaterThan(0.9)
    expect(Math.abs(bellAnalyzerSuccess() - FX.analyzer)).toBeLessThan(1e-12)
    expect(bellAnalyzerSuccess()).toBeCloseTo(0.5, 12)
  })
})

describe('nonlinear media (Eq. 14.3, pp. 263-266)', () => {
  it('the Kerr gate and circuit: diag(1, 1, 1, e^{i phi}), CZ at pi', () => {
    expect(gap(kerrGate(Math.PI), cm(FX.kerr))).toBeLessThan(1e-14)
    expect(matEq(circuitUnitary(kerrCircuit(Math.PI)), kerrGate(Math.PI), 1e-12)).toBe(true)
  })
  it('the dressed levels, the shifts and chi equal numpy; the dispersive line -chi n is close; chi t = pi at t = 125.7', () => {
    for (const k of FX.jc) {
      const lv = jcLevels(k.n, 10, 1)
      expect(Math.abs(lv[0] - k.levels[0])).toBeLessThan(1e-12)
      expect(Math.abs(lv[1] - k.levels[1])).toBeLessThan(1e-12)
      expect(Math.abs(jcShift(k.n, 10, 1) - k.shift)).toBeLessThan(1e-12)
    }
    FX.jcOther.levels.forEach((l: number[], n: number) => {
      const lv = jcLevels(n, FX.jcOther.delta, FX.jcOther.om0)
      expect(Math.abs(lv[0] - l[0]) + Math.abs(lv[1] - l[1])).toBeLessThan(1e-12)
    })
    expect(jcChi(FX.jcOther.delta, FX.jcOther.om0)).toBeCloseTo(FX.jcOther.chi, 14)
    expect(jcEigenGap(10, 1, 5)).toBeLessThan(1e-12)
    expect(jcChi(10, 1)).toBeCloseTo(0.025, 14)
    expect(jcShift(1, 10, 1)).toBeCloseTo(-0.024815, 5)
    expect(Math.abs(jcShift(1, 10, 1) + jcChi(10, 1))).toBeLessThan(2e-4)
    expect(jcPiTime(10, 1)).toBeCloseTo(125.66, 2)
    expect(jcMixDeg(0, 10, 1)).toBeCloseTo(5.711, 3)
  })
  it('coherent and cat states equal numpy\'s series; overlaps e^{-4 alpha^2}; the even cat has no odd photons and the norm 0.70699 at alpha = 2', () => {
    const a2 = coherentFock(2, 11)
    a2.forEach((a, n) => expect(Math.abs(a - FX.coherent.alpha2[n])).toBeLessThan(1e-14))
    catFock(2, 1, 11).forEach((a, n) => expect(Math.abs(a - FX.coherent.even2[n])).toBeLessThan(1e-14))
    catFock(2, -1, 11).forEach((a, n) => expect(Math.abs(a - FX.coherent.odd2[n])).toBeLessThan(1e-14))
    expect(coherentOverlap(1, -1)).toBeCloseTo(FX.coherent.overlap1, 14)
    expect(Math.abs(coherentOverlap(2, -2) - FX.coherent.overlap2)).toBeLessThan(1e-20)
    expect(coherentOverlapSeries(1, -1, 80)).toBeCloseTo(FX.coherent.series1, 12)
    expect(Math.abs(coherentOverlapSeries(2, -2, 90) - coherentOverlap(2, -2))).toBeLessThan(1e-15)
    const even = catFock(2, 1, 40)
    expect(even.filter((_, n) => n % 2 === 1).every((a) => Math.abs(a) < 1e-15)).toBe(true)
    expect(catNorm(2, 1)).toBeCloseTo(0.70699, 5)
    expect(even[0] ** 2).toBeCloseTo((2 * Math.exp(-4)) / (1 + Math.exp(-8)), 12)
    expect(meanPhotons(even)).toBeCloseTo(4 * Math.tanh(4), 9)
    expect(meanPhotons(coherentFock(2, 60))).toBeCloseTo(4, 9)
    // a symmetric pair of eigenvalues: the block is Hermitian with trace 0
    const E = eigh([[c(0.5), c(0.1)], [c(0.1), c(-0.5)]])
    expect(E.values[0] + E.values[1]).toBeCloseTo(0, 12)
  })
})
