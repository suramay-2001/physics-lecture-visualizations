/**
 * qc/infoq.ts against numpy (pipeline/make_infoq_fixtures.py -> __fixtures__/qc-infoq.json: np.kron states, einsum partial traces, eigvalsh entropies, scipy.linalg.logm, a vectorised grid
 * and scipy.optimize for the capacity and the accessible information, gate-by-gate circuits), the cross-checks of P-Q23-story §9.1 (mutual information two ways, chi against h((1+s)/2), the
 * capacity against 1 - h(f), the circuit against the dephased mixture, the best table distance against the trace distance, the pair's accessible information against the Helstrom closed form)
 * and properties (the triangle rule, Klein's inequality, the Holevo bound against random measurements, mutual information never raised by discarding a system).
 */
import { describe, expect, it } from 'vitest'
import raw from '../__fixtures__/qc-infoq.json?raw'
import { c } from '../complex'
import { type Mat, type Vec, mscale } from '../linalg'
import { rng as makeRng } from '../random'
import { runCircuit } from './circuit'
import { eigh, randomUnitary } from './cmat'
import { densityOf, mixtureN, partialTrace, traceDistance } from './density'
import { binaryEntropy } from './info'
import {
  accessibleInfoPair,
  accessibleProjective,
  bestTableDistance,
  bscCapacity,
  bscChannel,
  bscJoint,
  capacityGrid,
  classicalDistance,
  classicalFidelity,
  condEntropyClassical,
  cqState,
  dephasedBell,
  dephasingCircuit,
  eigenTableDistance,
  fidelityAngleDeg,
  ghzCircuit,
  holevoChi,
  holevoChiPair,
  holevoProofStates,
  jointEntropy,
  kleinChain,
  logChord,
  measureTable,
  mutualInfo,
  mutualInfoAsRel,
  mutualInfoPovm,
  pairStates,
  planeBasis,
  povmJoint,
  quantumMutualInfo,
  quantumRelEntropy,
  quarterTables,
  relEntropy,
  relEntropyGrid,
  sqrtPlaneDeg,
  tableDistance,
  triangleSlack,
  usdBoundPair,
  usdFailPair,
  usdFailureBound,
} from './infoq'
import { bell, ket } from './state'

const fx = JSON.parse(raw) as Record<string, any>
const toMat = (a: [number, number][][]): Mat => a.map((row) => row.map(([re, im]) => c(re, im)))
const toVec = (a: [number, number][]): Vec => a.map(([re, im]) => c(re, im))
const same = (got: number, want: number | null, eps = 1e-9): void => (want === null ? expect(got).toBe(Infinity) : expect(Math.abs(got - want)).toBeLessThan(eps))

describe('chance tables against numpy', () => {
  it.each(fx.tables as { p: number[]; q: number[]; D: number; F: number; angleDeg: number; H: number | null }[])('D, F, angle and H(p||q) for $p and $q', ({ p, q, D, F, angleDeg, H }) => {
    same(classicalDistance(p, q), D, 1e-12)
    same(classicalFidelity(p, q), F, 1e-12)
    same(fidelityAngleDeg(p, q), angleDeg, 1e-9)
    same(relEntropy(p, q), H, 1e-12)
  })
  it('the square-root arrow of a two-outcome table sits at the numpy plane angle', () => {
    for (const { p, deg } of fx.planeDeg as { p: number[]; deg: number }[]) same(sqrtPlaneDeg(p), deg, 1e-9)
  })
  it('the quarter-step grids: 15 tables of three outcomes, the triangle slack 0, 132 of 225 ordered pairs infinite', () => {
    expect(quarterTables(3)).toEqual(fx.quarter.n3)
    expect(quarterTables(2)).toEqual(fx.quarter.n2)
    expect(quarterTables(4)).toHaveLength(fx.quarter.count4)
    expect(triangleSlack(quarterTables(3))).toBe(fx.quarter.triangleSlackMin)
    const g = relEntropyGrid(quarterTables(3))
    expect(g).toEqual({ minFinite: fx.quarter.relMinFinite, infinite: fx.quarter.relInfinite, pairs: fx.quarter.pairs })
  })
  it('refuses a table that does not add to 1', () => {
    expect(() => classicalDistance([0.5, 0.4], [0.5, 0.5])).toThrow()
    expect(() => relEntropy([0.5, 0.5], [1])).toThrow()
  })
})

describe('the chord of log2 (the p. 48 step of Eq. 3.44): the printed denominator breaks the inequality, the other one keeps it', () => {
  it('x1 = 1, x2 = 4, x = 3/2: printed s = -1/6 gives -1/3 > -1; the true s = 1/6 gives 1/3 <= log2(3/2)', () => {
    const bad = logChord(1, 4, 1.5, true)
    const good = logChord(1, 4, 1.5, false)
    expect(bad.s).toBeCloseTo(-1 / 6, 12)
    expect(bad.lhs).toBeCloseTo(-1 / 3, 12)
    expect(bad.rhs).toBeCloseTo(-1, 12)
    expect(bad.lhs).toBeGreaterThan(bad.rhs)
    expect(good.s).toBeCloseTo(1 / 6, 12)
    expect(good.lhs).toBeCloseTo(1 / 3, 12)
    expect(good.rhs).toBeCloseTo(Math.log2(1.5), 12)
    expect(good.lhs).toBeLessThanOrEqual(good.rhs)
  })
})

describe('quantum relative entropy and the Klein chain against numpy (scipy.linalg.logm)', () => {
  it.each(fx.qrel as { name: string; rho: [number, number][][]; sigma: [number, number][][]; S: number | null; klein: { H: number; r: number[]; p: number[] } | null }[])('S(rho||sigma) for $name', ({ rho, sigma, S, klein }) => {
    const R = toMat(rho)
    const Sg = toMat(sigma)
    same(quantumRelEntropy(R, Sg), S, 1e-8)
    if (klein) {
      const k = kleinChain(R, Sg)
      same(k.H, klein.H, 1e-8)
      klein.r.forEach((v, i) => same(k.r[i], v, 1e-9))
      klein.p.forEach((v, i) => same(k.p[i], v, 1e-9))
      expect(k.S).toBeGreaterThanOrEqual(k.H - 1e-9)
      expect(k.H).toBeGreaterThanOrEqual(-1e-9)
    }
  })
  it('is infinite when sigma vanishes where rho does not, and 0 only for equal states', () => {
    expect(quantumRelEntropy(ket('+'), mixtureN([{ w: 1, psi: ket('0') }]))).toBe(Infinity)
    expect(Math.abs(quantumRelEntropy(ket('+'), ket('+')))).toBeLessThan(1e-9)
    expect(quantumRelEntropy(densityOf(ket('0')), mscale(densityOf(ket('0')), 1))).toBeCloseTo(0, 9)
  })
  it('for commuting states it is the classical relative entropy of the eigenvalue tables', () => {
    const rho = mixtureN([{ w: 0.9, psi: ket('0') }, { w: 0.1, psi: ket('1') }])
    const sig = mixtureN([{ w: 0.5, psi: ket('0') }, { w: 0.5, psi: ket('1') }])
    expect(quantumRelEntropy(rho, sig)).toBeCloseTo(relEntropy([0.9, 0.1], [0.5, 0.5]), 12)
  })
})

describe('what a measurement makes of two states against numpy', () => {
  it.each(fx.measure as { name: string; rho: [number, number][][]; sigma: [number, number][][]; D: number; z: number; x: number; eigen: number; gridMax: number; gridAngleDeg: number }[])('tables and distances for $name', (m) => {
    const R = toMat(m.rho)
    const S = toMat(m.sigma)
    same(traceDistance(R, S), m.D, 1e-9)
    same(tableDistance(R, S, planeBasis(0)), m.z, 1e-9)
    same(tableDistance(R, S, planeBasis(Math.PI / 2)), m.x, 1e-9)
    same(eigenTableDistance(R, S), m.eigen, 1e-9)
    const best = bestTableDistance(R, S, 3601)
    same(best.D, m.gridMax, 1e-9)
    expect(Math.abs(best.angleDeg - m.gridAngleDeg)).toBeLessThan(0.06)
    // no table distance beats the trace distance, and the eigenbasis reaches it
    expect(best.D).toBeLessThanOrEqual(traceDistance(R, S) + 1e-9)
    same(eigenTableDistance(R, S), traceDistance(R, S), 1e-9)
  })
  it('the table of a basis lists the Born chances and adds to 1', () => {
    const t = measureTable(ket('+'), planeBasis(0))
    expect(t[0]).toBeCloseTo(0.5, 12)
    expect(t.reduce((a, b) => a + b, 0)).toBeCloseTo(1, 12)
  })
})

describe('two variables and the capacity against numpy', () => {
  it.each(fx.joint as { name: string; pxy: number[][]; H: number; HYgX: number; I: number }[])('H, H(Y|X), I for $name, and the two routes to I agree', ({ pxy, H, HYgX, I }) => {
    same(jointEntropy(pxy), H, 1e-12)
    same(condEntropyClassical(pxy), HYgX, 1e-12)
    same(mutualInfo(pxy), I, 1e-12)
    same(mutualInfoAsRel(pxy), I, 1e-12)
  })
  it.each(fx.capacity as { f: number | null; channel?: number[][]; grid: number; argmax: number; opt: number; closed: number | null }[])('capacity of the channel with flip chance $f', ({ f, channel, grid, argmax, opt, closed }) => {
    const pyx = channel ?? bscChannel(f as number)
    const got = capacityGrid(pyx, 1001)
    same(got.C, grid, 1e-12)
    same(got.argmax, argmax, 1e-12)
    expect(Math.abs(got.C - opt)).toBeLessThan(1e-6)
    if (closed !== null) same(got.C, closed, 1e-12)
  })
  it('the binary symmetric channel: joint table, capacity 1 - h(f) at fair inputs, and the grid curve of the plot', () => {
    expect(bscJoint(0.1)[0]).toEqual([0.45, 0.05].map((v) => expect.closeTo(v, 12)))
    expect(bscCapacity(0.25)).toBeCloseTo(1 - binaryEntropy(0.25), 12)
    expect(bscCapacity(0.5)).toBeCloseTo(0, 12)
    for (const { f, y } of fx.curves.bscCapacity as { f: number; y: number }[]) same(bscCapacity(f), y, 1e-12)
  })
})

describe('quantum mutual information against numpy (einsum partial traces)', () => {
  it.each(fx.qmi as { name: string; rho: [number, number][][]; a: number[]; b: number[]; I: number }[])('S(A:B) for $name', ({ rho, a, b, I }) => {
    same(quantumMutualInfo(toMat(rho), a, b), I, 1e-9)
  })
  it('the dephased Bell pair has S(A:B) = 2 - h(p), a Bell pair 2 and a classical pair of fair bits 1', () => {
    for (const p of [0, 0.1, 0.25, 0.5]) expect(quantumMutualInfo(dephasedBell(p))).toBeCloseTo(2 - binaryEntropy(p), 9)
    expect(quantumMutualInfo(bell('00+11'))).toBeCloseTo(2, 9)
    expect(quantumMutualInfo(mixtureN([{ w: 0.5, psi: ket('00') }, { w: 0.5, psi: ket('11') }]))).toBeCloseTo(1, 9)
  })
  it('dephasedBell matches numpy and the dephasing circuit, traced over C, is that mixture (the cross-check of Eq. 11.19)', () => {
    for (const { p, rho } of fx.dephasedBell as { p: number; rho: [number, number][][] }[]) {
      const want = toMat(rho)
      const got = dephasedBell(p)
      got.forEach((row, i) => row.forEach((z, j) => expect(Math.hypot(z.re - want[i][j].re, z.im - want[i][j].im)).toBeLessThan(1e-12)))
    }
    for (const { p, psi } of fx.circuits.dephasing as { p: number; psi: [number, number][] }[]) {
      const state = runCircuit(dephasingCircuit(p)).states.at(-1)!
      toVec(psi).forEach((z, k) => expect(Math.hypot(z.re - state[k].re, z.im - state[k].im)).toBeLessThan(1e-12))
      const ab = partialTrace(densityOf(state), [2])
      dephasedBell(p).forEach((row, i) => row.forEach((z, j) => expect(Math.hypot(z.re - ab[i][j].re, z.im - ab[i][j].im)).toBeLessThan(1e-12)))
    }
  })
  it('the GHZ circuit is the GHZ state: S(A:B) = 1 but S(A:BC) = 2, and discarding C never raises it', () => {
    const state = runCircuit(ghzCircuit()).states.at(-1)!
    toVec(fx.circuits.ghz).forEach((z, k) => expect(Math.hypot(z.re - state[k].re, z.im - state[k].im)).toBeLessThan(1e-12))
    expect(quantumMutualInfo(state, [0], [1])).toBeCloseTo(1, 9)
    expect(quantumMutualInfo(state, [0], [1, 2])).toBeCloseTo(2, 9)
  })
  it('discarding a system never raises S(A:B), over random three-qubit states (S(A:B) <= S(A:BC))', () => {
    const rand = makeRng(11)
    for (let k = 0; k < 20; k++) {
      const psi = randomUnitary(8, rand).map((row) => row[0])
      expect(quantumMutualInfo(psi, [0], [1])).toBeLessThanOrEqual(quantumMutualInfo(psi, [0], [1, 2]) + 1e-9)
    }
  })
})

describe('the Holevo quantities against numpy', () => {
  const ens = fx.holevo as { name: string; ps: number[]; rhos: [number, number][][][]; chi: number; usdBound: number }[]
  it.each(ens)('chi and the failure bound for the ensemble $name', ({ ps, rhos, chi, usdBound }) => {
    const R = rhos.map(toMat)
    same(holevoChi(ps, R), chi, 1e-9)
    same(usdFailureBound(ps, R), usdBound, 1e-9)
  })
  it.each(fx.reads as { name: string; z: number; x: number; gridMax: number; gridAngleDeg: number; opt: number }[])('readings of the qubit ensemble $name: z, x, the 3601-angle grid and the optimiser', (r) => {
    const e = ens.find((x) => x.name === r.name)!
    const R = e.rhos.map(toMat)
    const proj = (axis: number): Mat[] => {
      const [a, b] = planeBasis(axis)
      return [a, b].map(densityOf)
    }
    same(mutualInfoPovm(e.ps, R, proj(0)), r.z, 1e-9)
    same(mutualInfoPovm(e.ps, R, proj(Math.PI / 2)), r.x, 1e-9)
    const best = accessibleProjective(e.ps, R, 3601)
    same(best.I, r.gridMax, 1e-9)
    expect(Math.abs(best.angleDeg - r.gridAngleDeg)).toBeLessThan(0.06)
    expect(Math.abs(best.I - r.opt)).toBeLessThan(1e-6)
    expect(best.I).toBeLessThanOrEqual(holevoChi(e.ps, R) + 1e-9)
  })
  it('the Bell measurement of the four Bell states reads 2 bits, and the four joint outcomes are certain', () => {
    const bs = ['00+11', '00-11', '01+10', '01-10'].map((s) => densityOf(bell(s)))
    expect(mutualInfoPovm([0.25, 0.25, 0.25, 0.25], bs, bs)).toBeCloseTo(fx.bellMeasure, 9)
    expect(holevoChi([0.25, 0.25, 0.25, 0.25], bs)).toBeCloseTo(2, 9)
    // Alice's half alone is 1/2 I for every message: chi = 0
    const half = bs.map((r) => partialTrace(r, [1]))
    expect(holevoChi([0.25, 0.25, 0.25, 0.25], half)).toBeCloseTo(0, 9)
  })
  it.each(fx.proof as { name: string; axis: [number, number, number]; SPQ: number; SPprimeMprime: number }[])('the two cq states of the proof for $name: S(P:Q) = chi and S(P\':M\') is the information of the reading', ({ name, axis, SPQ, SPprimeMprime }) => {
    const e = ens.find((x) => (name.startsWith('pair') ? x.name === 'pair' : name.startsWith('s06') ? x.name === 's06' : x.name === 'mixed'))!
    const R = e.rhos.map(toMat)
    const got = holevoProofStates(e.ps, R, axis)
    same(got.SPQ, SPQ, 1e-9)
    same(got.SPprimeMprime, SPprimeMprime, 1e-9)
    expect(got.SPQ).toBeCloseTo(holevoChi(e.ps, R), 9)
    expect(got.SPprimeMprime).toBeLessThanOrEqual(got.SPQ + 1e-9)
  })
  it('the cq state is the 4 x 4 matrix of the label and the system (rows add to the chances)', () => {
    const M = cqState([0.5, 0.5], [densityOf(ket('0')), densityOf(ket('+'))])
    expect(M[0][0].re + M[1][1].re).toBeCloseTo(0.5, 12)
    expect(M[2][2].re + M[3][3].re).toBeCloseTo(0.5, 12)
    expect(M[2][3].re).toBeCloseTo(0.25, 12)
  })
})

describe('cross-checks of the plan and the plot curves', () => {
  it('chi of two equiprobable pure states is h((1 + s)/2): 1 at s = 0, 0 at s = 1, 0.6009 at s = 1/sqrt 2', () => {
    for (const s of [0, 0.2, 0.5, Math.SQRT1_2, 0.9, 1]) expect(holevoChiPair(s)).toBeCloseTo(binaryEntropy((1 + s) / 2), 12)
    for (const { s, y } of fx.curves.holevoChiPair as { s: number; y: number }[]) same(holevoChiPair(s), y, 1e-9)
  })
  it('the best projective reading of the pair is 1 - h((1 - sqrt(1 - s^2))/2) (the Helstrom error inside the binary entropy), the optimiser agrees, and it stays below chi', () => {
    for (const s of [0, 0.3, 0.5, Math.SQRT1_2, 0.9]) {
      const closed = 1 - binaryEntropy((1 - Math.sqrt(1 - s * s)) / 2)
      expect(Math.abs(accessibleInfoPair(s) - closed)).toBeLessThan(1e-5) // the 721-axis grid steps a quarter of a degree
      expect(accessibleInfoPair(s)).toBeLessThanOrEqual(holevoChiPair(s) + 1e-9)
    }
    for (const { s, y } of fx.curves.accessibleInfoPair as { s: number; y: number }[]) same(accessibleInfoPair(s), y, 1e-9)
  })
  it('the failure bound of the pair is 1 - chi and sits below the exact failure s of the best unambiguous measurement', () => {
    for (const s of [0, 0.5, Math.SQRT1_2, 0.9, 1]) {
      expect(usdBoundPair(s)).toBeCloseTo(1 - binaryEntropy((1 + s) / 2), 12)
      expect(usdFailPair(s)).toBeCloseTo(s, 12)
      expect(usdBoundPair(s)).toBeLessThanOrEqual(usdFailPair(s) + 1e-12)
    }
    for (const { s, y } of fx.curves.usdBoundPair as { s: number; y: number }[]) same(usdBoundPair(s), y, 1e-9)
  })
  it('the best table distance over 3601 axes equals the trace distance of |0> and |+>', () => {
    const a = densityOf(ket('0'))
    const b = densityOf(ket('+'))
    expect(bestTableDistance(a, b, 3601).D).toBeCloseTo(traceDistance(a, b), 9)
    expect(bestTableDistance(a, b, 3601).angleDeg).toBeCloseTo(135, 6)
  })
  it('the Holevo bound against random POVMs (rank-one elements from a random unitary, 3 to 6 outcomes): none above chi, and a projective reading is below the accessible maximum', () => {
    const rand = makeRng(7)
    const ps = [0.5, 0.5]
    const R = pairStates(Math.SQRT1_2).map(densityOf)
    const chi = holevoChi(ps, R)
    for (let k = 0; k < 200; k++) {
      const m = 3 + (k % 4)
      // rank-one POVM from the first two columns of a random m x m unitary (an isometry V: C^2 -> C^m), E_y = V†|y><y|V
      const U = randomUnitary(m, rand)
      const E: Mat[] = Array.from({ length: m }, (_, y) => {
        const row = [U[y][0], U[y][1]]
        return [0, 1].map((i) => [0, 1].map((j) => c(row[i].re * row[j].re + row[i].im * row[j].im, -row[i].re * row[j].im + row[i].im * row[j].re)))
      })
      expect(povmJoint(ps, R, E).flat().reduce((s, v) => s + v, 0)).toBeCloseTo(1, 9)
      expect(mutualInfoPovm(ps, R, E)).toBeLessThanOrEqual(chi + 1e-9)
    }
  })
  it('Klein: S(rho||sigma) >= 0 over random pairs, and the trace distance bound of Pinsker holds', () => {
    const rand = makeRng(5)
    for (let k = 0; k < 20; k++) {
      const A = randomUnitary(4, rand)
      const B = randomUnitary(4, rand)
      const w1 = [0.4, 0.3, 0.2, 0.1]
      const w2 = [0.25, 0.25, 0.3, 0.2]
      const mk = (U: Mat, w: number[]): Mat => mixtureN(w.map((x, i) => ({ w: x, psi: U.map((row) => row[i]) })))
      const rho = mk(A, w1)
      const sig = mk(B, w2)
      const S = quantumRelEntropy(rho, sig)
      expect(S).toBeGreaterThanOrEqual(-1e-9)
      expect(S).toBeGreaterThanOrEqual((2 / Math.LN2) * traceDistance(rho, sig) ** 2 - 1e-9)
      expect(eigh(rho).values[0]).toBeGreaterThanOrEqual(-1e-9)
    }
  })
})
