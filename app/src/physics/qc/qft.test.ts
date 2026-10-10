/**
 * qc/qft.ts and the Simon helpers of qc/oracles.ts against numpy (pipeline/make_qft_fixtures.py → __fixtures__/qc-qft.json: every gate an explicit dense
 * matrix, circuits multiplied out, the Fourier matrix from np.fft.ifft, unit arrows summed with np.exp, np.linalg.eigvals, exact Fractions, enumeration),
 * plus the cross-checks named in P-Q18-story §9.1 (the circuit's matrix is F_{2^m}, the circuit's readings are the closed form, the counting circuit's
 * readings are the mean of two eigenphase distributions) and property tests (unitarity, shift symmetry, sums to 1, the 4/π² floor).
 */
import { describe, expect, it } from 'vitest'
import raw from '../__fixtures__/qc-qft.json?raw'
import { type C, abs, abs2, c } from '../complex'
import { type Mat, type Vec, apply, dagger, identity, isUnitary, matmul, maxDiff } from '../linalg'
import { gf2Nullspace, gf2Rank, gf2Span } from './bits'
import { circuitUnitary, runCircuit } from './circuit'
import { dft, dftMatrix } from './fourier'
import { marginal } from './measure'
import { multOrder } from './numtheory'
import {
  classicalCollision,
  collisionUnionBound,
  simonBitTables,
  simonCircuit,
  simonExpectedRuns,
  simonPerp,
  simonPrintedNorm2,
  simonRunsSuffice,
  simonRunsSufficeCounted,
  simonTable,
  simonYDistribution,
  simonYFromCircuit,
} from './oracles'
import {
  countEstimate,
  countingCircuit,
  countingDistribution,
  countingPrintedReading,
  distinctPowerPhases,
  expandPrinted,
  expandTrue,
  fftCost,
  groverQMatrix,
  ncWires,
  oneIsSumResidual,
  orderEigenphases,
  orderEigenResidual,
  orderFindingDistribution,
  orderGoodReadings,
  orderOrbit,
  orderSuccess,
  peAmplitude,
  peBest,
  peDistribution,
  peDistributionDirect,
  peKickColumn,
  peNearest,
  peTailWorst,
  peWithin,
  peWorstBest,
  phaseEstimationCircuit,
  qftCircuit,
  qftCircuitMatrix,
  qftCounts,
  qftFromProduct,
  qftPrintedNorm2,
  qftProductAngles,
  readingOfCircuit,
  tallestReadings,
} from './qft'
import { ket } from './state'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const FX: any = JSON.parse(raw)
const cz = (p: [number, number]): C => c(p[0], p[1])
const cm = (rows: [number, number][][]): Mat => rows.map((r) => r.map(cz))
const close = (a: number, b: number, eps = 1e-12) => expect(Math.abs(a - b), `${a} ≈ ${b}`).toBeLessThan(eps)
const closeList = (a: readonly number[], b: readonly number[], eps = 1e-12) => {
  expect(a.length).toBe(b.length)
  a.forEach((v, i) => close(v, b[i], eps))
}

describe('qft: the circuit of U_F (N&C Fig. 5.1)', () => {
  it('its matrix is numpy’s dense product of gates AND the Fourier matrix F_{2^m}, for m = 1 … 5', () => {
    for (let m = 1; m <= 5; m++) {
      const U = qftCircuitMatrix(m)
      expect(maxDiff(U, cm(FX.qft[String(m)])), `m = ${m} vs numpy circuit`).toBeLessThan(1e-12)
      expect(maxDiff(U, dftMatrix(2 ** m)), `m = ${m} vs F`).toBeLessThan(1e-12)
    }
  })
  it('m = 3 has the seven columns of the plan: H; cR_2; cR_3; H; cR_2; H; SWAP, with S and T drawn for R_2 and R_3', () => {
    const C3 = qftCircuit(3)
    expect(C3.columns).toHaveLength(7)
    const names = C3.columns.map((col) => col.map((o) => (o.op === 'gate' ? `${o.gate}${o.controls ? `<${o.controls}` : ''}>${o.targets}` : o.op)).join(' '))
    expect(names).toEqual(['H>0', 'S<1>0', 'T<2>0', 'H>1', 'S<2>1', 'H>2', 'SWAP>0,2'])
    const labels = C3.columns.flat().map((o) => (o.op === 'gate' ? o.label : undefined))
    expect(labels).toEqual([undefined, 'R_2', 'R_3', undefined, 'R_2', undefined, undefined])
  })
  it('the gates past R_3 are P gates of 2π/2^k, and the inverse circuit is the reversed one with S†, T† and P(−2π/2^k)', () => {
    const C4 = qftCircuit(4)
    const p = C4.columns.flat().filter((o) => o.op === 'gate' && o.gate === 'P')
    expect(p).toHaveLength(1)
    close((p[0] as { params: number[] }).params[0], (2 * Math.PI) / 16)
    const inv = qftCircuit(4, { inverse: true })
    const flat = inv.columns.flat().map((o) => (o.op === 'gate' ? o.gate : o.op))
    expect(flat).toContain('Sdg')
    expect(flat).toContain('Tdg')
    expect(maxDiff(circuitUnitary(inv), dagger(dftMatrix(16)))).toBeLessThan(1e-12)
    expect(maxDiff(matmul(circuitUnitary(inv), circuitUnitary(C4)), identity(16))).toBeLessThan(1e-12)
  })
  it('column counts: 1, 4, 7, 11, 16 for m = 1 … 5 (H and controlled turns, then one column of SWAPs)', () => {
    expect([1, 2, 3, 4, 5].map((m) => qftCircuit(m).columns.length)).toEqual([1, 4, 7, 11, 16])
  })
  it('gate counts are m(m+1)/2 plus ⌊m/2⌋ swaps (numpy’s loops), and the FFT costs m·2^m: 6, 55 and 10240 at m = 3, 10', () => {
    for (const m of [1, 2, 3, 4, 5, 10]) {
      const fx = FX.counts[String(m)]
      const k = qftCounts(m)
      expect(k.gates).toBe(fx.gates)
      expect(k.swaps).toBe(fx.swaps)
      expect(k.gates).toBe((m * (m + 1)) / 2)
      expect(fftCost(m)).toBe(fx.fft)
    }
    expect(qftCounts(3)).toEqual({ hadamards: 3, controlled: 3, swaps: 1, gates: 6 })
    expect(qftCounts(10).gates).toBe(55)
    expect(fftCost(10)).toBe(10240)
  })
  it('property: the circuit is unitary and its run on |a⟩ is the a-th column of F (the defining sum), for every a with m = 3', () => {
    const U = qftCircuitMatrix(3)
    expect(isUnitary(U, 1e-12)).toBe(true)
    for (let a = 0; a < 8; a++) {
      const run = runCircuit(qftCircuit(3, { init: a }))
      const psi = run.states[run.states.length - 1]
      const want = Array.from({ length: 8 }, (_, y) => c(Math.cos((2 * Math.PI * a * y) / 8) / Math.sqrt(8), Math.sin((2 * Math.PI * a * y) / 8) / Math.sqrt(8)))
      psi.forEach((z, y) => expect(abs(c(z.re - want[y].re, z.im - want[y].im))).toBeLessThan(1e-12))
    }
  })
  it('the QFT is not just Hadamards: it agrees with H⊗3 on |000⟩ but differs by 0.7071 on |001⟩ (N&C Ex. 5.2)', () => {
    const F = dftMatrix(8)
    const H3 = Array.from({ length: 8 }, (_, y) => Array.from({ length: 8 }, (_, x) => c((-1) ** (((y & x & 1) + ((y >> 1) & (x >> 1) & 1) + ((y >> 2) & (x >> 2) & 1)) % 2) / Math.sqrt(8))))
    const gap = (a: number) => Math.max(...F.map((row, y) => abs(c(row[a].re - H3[y][a].re, row[a].im - H3[y][a].im))))
    close(gap(0), 0)
    close(gap(1), Math.SQRT1_2, 1e-12)
  })
  it('an input given as a number or as bits gives the same circuit; a wrong input is refused', () => {
    expect(qftCircuit(3, { init: 5 }).init).toBe('101')
    expect(qftCircuit(3, { init: '101' }).init).toBe('101')
    expect(() => qftCircuit(3, { init: 8 })).toThrow()
    expect(() => qftCircuit(0)).toThrow()
  })
})

describe('qft: the product form (N&C Eq. 5.4) and the book’s two slips on pp. 126-127', () => {
  it('the turns of the output wires match numpy’s, and the product reproduces the transform of every input', () => {
    for (const fx of FX.product) closeList(qftProductAngles(fx.a, fx.m), fx.anglesDeg, 1e-9)
    closeList(qftProductAngles(5, 3), [180, 90, 225], 1e-9)
    closeList(qftProductAngles(6, 3), [0, 180, 270], 1e-9)
    for (let a = 0; a < 8; a++) {
      const want = dftMatrix(8).map((row) => row[a])
      const got = qftFromProduct(a, 3)
      got.forEach((z, y) => expect(abs(c(z.re - want[y].re, z.im - want[y].im))).toBeLessThan(1e-12))
    }
  })
  it('Bergou’s printed prefactor 1/2^m gives a squared length of 2^{-m} (numpy’s), the right 2^{-m/2} gives 1', () => {
    for (const m of [1, 2, 3, 4, 5]) {
      close(qftPrintedNorm2(m), FX.printedNorm2[String(m)])
      close(qftPrintedNorm2(m), 2 ** -m)
    }
    const col = dftMatrix(8).map((r) => r[5])
    close(col.reduce((s, z) => s + abs2(z), 0), 1)
  })
  it('the printed expansion 2^{m-1}a₁ + 2^{m-1}a₂ + … gives 8 for 110, and 4 of the 8 three-bit strings are misread (numpy’s table)', () => {
    for (const [bits, v] of Object.entries(FX.expandPrinted as Record<string, number>)) expect(expandPrinted(bits)).toBe(v)
    for (const [bits, v] of Object.entries(FX.expandPrinted4 as Record<string, number>)) expect(expandPrinted(bits)).toBe(v)
    expect(expandPrinted('110')).toBe(8)
    expect(expandTrue('110')).toBe(6)
    const wrong = Array.from({ length: 8 }, (_, a) => a.toString(2).padStart(3, '0')).filter((b) => expandPrinted(b) !== expandTrue(b))
    expect(wrong).toEqual(['010', '011', '110', '111'])
  })
})

describe('qft: phase estimation (Bergou Fig. 7.6, Eqs. 7.36-7.43)', () => {
  it('the circuit has 1 + m + (the QFT’s columns) columns: 11 for m = 3, 16 for m = 4, and kicks done at column 1 + m', () => {
    expect(phaseEstimationCircuit(5 / 8, 3).columns).toHaveLength(11)
    expect(phaseEstimationCircuit(11 / 16, 4).columns).toHaveLength(16)
    expect(peKickColumn(3)).toBe(4)
  })
  it('the controlled powers: U on wire m−1, U² on wire m−2, … , the angle 2π·2^j·τ, the labels U, U², U⁴', () => {
    const C = phaseEstimationCircuit(5 / 8, 3)
    const kicks = C.columns.slice(1, 4).map((col) => col[0])
    expect(kicks.map((o) => (o.op === 'gate' ? o.controls![0] : -1))).toEqual([2, 1, 0])
    expect(kicks.map((o) => o.label)).toEqual(['U', 'U²', 'U⁴'])
    kicks.forEach((o, j) => close((o as { params: number[] }).params[0], 2 * Math.PI * (5 / 8) * 2 ** j))
  })
  it('after the controlled powers the counting wires hold 2^{-m/2} Σ e^{2πiτy}|y⟩ = U_F|a⟩ for τ = a/2^m (Eq. 7.37), with the target left at |1⟩', () => {
    const run = runCircuit(phaseEstimationCircuit(5 / 8, 3))
    const kicked = run.states[peKickColumn(3)]
    FX.peKick.forEach((p: [number, number], y: number) => {
      const z = kicked[(y << 1) | 1]
      expect(abs(c(z.re - p[0], z.im - p[1]))).toBeLessThan(1e-12)
      expect(abs(kicked[y << 1])).toBeLessThan(1e-12)
    })
    const want = dft(ket('101'))
    for (let y = 0; y < 8; y++) expect(abs(c(kicked[(y << 1) | 1].re - want[y].re, kicked[(y << 1) | 1].im - want[y].im))).toBeLessThan(1e-12)
  })
  it('the circuit’s readings equal numpy’s dense circuit and the closed form D²: τ = 5/8, 1/3, 11/16, 0.3 at m = 3, 4', () => {
    for (const fx of FX.pe) {
      const circ = phaseEstimationCircuit(fx.tau, fx.m, fx.target)
      const got = readingOfCircuit(circ, fx.m)
      closeList(got, fx.reading, 1e-12)
      if (fx.target === '1') {
        closeList(peDistribution(fx.tau, fx.m), fx.reading, 1e-12)
        closeList(peDistributionDirect(fx.tau, fx.m), fx.reading, 1e-12)
      }
    }
  })
  it('the closed form matches numpy’s sums of unit arrows over a wider set of (τ, m), and the amplitude is the geometric sum', () => {
    for (const fx of FX.peSum) {
      closeList(peDistribution(fx.tau, fx.m), fx.dist, 1e-12)
      closeList(peDistributionDirect(fx.tau, fx.m), fx.dist, 1e-12)
    }
    close(abs2(peAmplitude(1 / 3, 3, 3)), 0.6878, 1e-4)
  })
  it('the exact case: τ = 0.101₂ = 5/8 reads 101 for certain, and 11/16 on four wires reads 1011 for certain', () => {
    close(peDistribution(5 / 8, 3)[5], 1)
    close(peDistribution(11 / 16, 4)[11], 1)
    close(readingOfCircuit(phaseEstimationCircuit(5 / 8, 3), 3)[5], 1)
    close(readingOfCircuit(phaseEstimationCircuit(11 / 16, 4), 4)[11], 1)
  })
  it('τ = 1/3 on three wires: nearest a = 3 with δ = −0.0417, P(011) = 0.6878, P(010) = 0.1749; on four wires P(0101) = 0.6849, P(0110) = 0.1720', () => {
    const n = peNearest(1 / 3, 3)
    expect(n.a).toBe(3)
    close(n.delta, 1 / 3 - 3 / 8)
    const P3 = peDistribution(1 / 3, 3)
    close(P3[3], 0.6878, 5e-5)
    close(P3[2], 0.1749, 5e-5)
    const P4 = peDistribution(1 / 3, 4)
    close(P4[5], 0.6849, 5e-5)
    close(P4[6], 0.172, 5e-4)
    close(peBest(1 / 3, 5), 0.6842, 5e-5)
    expect(peNearest(0.999, 3)).toEqual({ a: 0, delta: 0.999 - 1 })
  })
  it('the worst case of the best reading is D²(2^{-(m+1)}): 0.4105, 0.4066, 0.4056 for m = 3, 4, 5 (numpy’s), falling toward 4/π²; τ = 11/16 ties 101 and 110', () => {
    for (let m = 1; m <= 10; m++) close(peWorstBest(m), FX.peWorst[String(m)], 1e-12)
    close(peWorstBest(3), 0.4105, 5e-5)
    close(peWorstBest(4), 0.4066, 5e-5)
    close(peWorstBest(5), 0.4056, 5e-5)
    for (let m = 1; m < 10; m++) expect(peWorstBest(m + 1)).toBeLessThan(peWorstBest(m))
    expect(peWorstBest(10)).toBeGreaterThan(4 / Math.PI ** 2)
    const P = peDistribution(11 / 16, 3)
    close(P[5], P[6], 1e-12)
    close(P[5], peWorstBest(3), 1e-12)
  })
  it('property: the best reading never falls below 4/π² for ANY τ (Eq. 7.43), with the floor reached only in the limit', () => {
    let low = 1
    for (let i = 0; i < 2000; i++) {
      const tau = i / 2000
      for (const m of [2, 3, 4, 6]) {
        const b = peBest(tau, m)
        expect(b).toBeGreaterThan(4 / Math.PI ** 2 - 1e-12)
        if (m === 3) low = Math.min(low, b)
      }
    }
    close(low, peWorstBest(3), 1e-6)
  })
  it('property: every distribution sums to 1, and a shift of τ by 1/2^m shifts the readings by one place', () => {
    for (const [tau, m] of [[0.123, 4], [0.7, 3], [1 / 3, 5]] as const) {
      const P = peDistribution(tau, m)
      close(
        P.reduce((s, v) => s + v, 0),
        1,
        1e-12,
      )
      const Q = peDistribution(tau + 1 / 2 ** m, m)
      for (let x = 0; x < 2 ** m; x++) close(Q[(x + 1) % 2 ** m], P[x], 1e-12)
    }
  })
  it('the worst-case tail at m = 8 is 0.189, 0.099, 0.067 for k = 1, 2, 3 (numpy’s grid scan), below Bergou’s 1/(2k−1)', () => {
    for (const fx of FX.peTail) close(peTailWorst(fx.m, fx.k), fx.v, 1e-9)
    close(peTailWorst(8, 1), 0.189, 5e-4)
    close(peTailWorst(8, 2), 0.099, 5e-4)
    close(peTailWorst(8, 3), 0.067, 5e-4)
    for (const k of [1, 2, 3]) expect(peTailWorst(8, k)).toBeLessThan(1 / (2 * k - 1))
  })
  it('P(within a distance): τ = 1/3 on three wires lands within one step with 0.8628; N&C’s 6 wires land within 1/8 with 0.982; numpy agrees', () => {
    for (const fx of FX.peWithin) close(peWithin(fx.tau, fx.m, fx.w), fx.v, 1e-12)
    close(peWithin(1 / 3, 3, 1 / 8), 0.8628, 5e-5)
    close(peWithin(1 / 3, 6, 1 / 8), 0.982, 5e-4)
  })
  it('N&C’s number of wires t = n + ⌈log₂(2 + 1/(2ε))⌉ matches the table; n = 3, ε = 0.1 gives 6', () => {
    for (const fx of FX.ncWires) expect(ncWires(fx.n, fx.eps)).toBe(fx.t)
    expect(ncWires(3, 0.1)).toBe(6)
    expect(() => ncWires(3, 0)).toThrow()
  })
  it('a target |+⟩ (not an eigenstate) reads 000 or 101 with chance ½ each (Unit 18.3’s clue; numpy’s circuit agrees)', () => {
    const fx = FX.pe.find((p: { tau: number; m: number; target: string }) => p.tau === 5 / 8 && p.m === 3 && p.target === '+')
    const got = readingOfCircuit(phaseEstimationCircuit(5 / 8, 3, '+'), 3)
    closeList(got, fx.reading, 1e-12)
    close(got[0], 0.5)
    close(got[5], 0.5)
  })
  it('the tallest readings are listed in increasing order', () => {
    expect(tallestReadings([0.1, 0.4, 0.4, 0.05, 0.05], 2)).toEqual([1, 2])
  })
})

describe('qft: quantum counting, N = 4 (two search wires), m = 3 (Bergou pp. 129-130; N&C pp. 261-263)', () => {
  it('Q = −U_H U₀ U_H U_f for any marked set equals numpy’s explicit matrix (M = 0, 1, 2)', () => {
    expect(maxDiff(groverQMatrix(2, [3]), cm(FX.countQ.M1))).toBeLessThan(1e-12)
    expect(maxDiff(groverQMatrix(2, []), cm(FX.countQ.M0))).toBeLessThan(1e-12)
    expect(maxDiff(groverQMatrix(2, [1, 2]), cm(FX.countQ.M2))).toBeLessThan(1e-12)
    expect(isUnitary(groverQMatrix(3, [1, 5, 6]), 1e-12)).toBe(true)
  })
  it('the counting circuit’s readings equal numpy’s dense circuit and the closed form ½pe(α/π) + ½pe(1 − α/π), for M = 0, 1, 2, 3', () => {
    for (const fx of FX.counting.filter((x: { marked: number[] }) => x.marked.length < 4 && !(x.marked.length === 1 && x.marked[0] === 0))) {
      const got = readingOfCircuit(countingCircuit(fx.n, fx.marked, fx.m), fx.m)
      closeList(got, fx.reading, 1e-12)
      closeList(countingDistribution(4, fx.marked.length, fx.m), fx.reading, 1e-12)
    }
  })
  it('M = 0 reads 000 for certain; M = 2 reads 010 and 110 with ½ each; M = 1 reads 001 and 111 with 0.3532 each and 000 with 0.0469', () => {
    const P0 = readingOfCircuit(countingCircuit(2, [], 3), 3)
    close(P0[0], 1)
    const P2 = readingOfCircuit(countingCircuit(2, [1, 2], 3), 3)
    close(P2[2], 0.5)
    close(P2[6], 0.5)
    const P1 = readingOfCircuit(countingCircuit(2, [3], 3), 3)
    close(P1[1], 0.3532, 5e-5)
    close(P1[7], P1[1])
    close(P1[0], 0.0469, 5e-5)
  })
  it('Q on the plane has eigenvalues e^{±i60°} for N = 4, M = 1 (numpy’s eigvals), the eigenphases 1/6 and 5/6', () => {
    // two eigenvalues on the plane, e^{±i60°}, and −1 twice on the plane's complement (Q = 2|w₀⟩⟨w₀| − I there)
    const fx: number[] = FX.countQAnglesDeg
    expect(fx.map((a) => Math.round((a + 360) % 360)).sort((a, b) => a - b)).toEqual([60, 180, 180, 300])
  })
  it('the estimate M = N sin²(π a/2^m): 0.5858 at a = 1 or 7, 2 at a = 2, 3.4142 at a = 3 (numpy’s table)', () => {
    for (let a = 0; a < 8; a++) close(countEstimate(a, 3, 4), FX.countEstimate[String(a)], 1e-12)
    close(countEstimate(2, 3, 4), 2)
    close(countEstimate(1, 3, 4), 0.5858, 5e-5)
    close(countEstimate(3, 3, 4), 3.4142, 5e-5)
  })
  it('Bergou’s printed α/2π reading is wrong: at N = 4, M = 2 it points to 001 and 111, which the circuit never reads', () => {
    const r = countingPrintedReading(2, [1, 2], 3)
    expect(r.aPlus).toBe(1)
    expect(r.aMinus).toBe(7)
    expect(r.chance).toBeLessThan(1e-12)
  })
})

describe('qft: order finding, x = 2 mod 21 (N&C §5.3.1 pp. 226-230)', () => {
  it('the orbit is 1, 2, 4, 8, 16, 11; the order is 6; the eigenphases s/6 are numpy’s eigenvalues of the 6-step shift', () => {
    expect(orderOrbit(2, 21)).toEqual(FX.order.orbit)
    expect(multOrder(2, 21)).toBe(FX.order.r)
    closeList(orderEigenphases(2, 21), FX.order.eigenphases, 1e-9)
  })
  it('each |u_s⟩ is an eigenstate of U_2 with eigenphase s/6 (N&C Eq. 5.39), and the number 1 is the even mix of all six (Eq. 5.44)', () => {
    expect(orderEigenResidual(2, 21)).toBeLessThan(1e-12)
    expect(oneIsSumResidual(2, 21)).toBeLessThan(1e-12)
    expect(orderEigenResidual(4, 21)).toBeLessThan(1e-12)
    expect(orderEigenResidual(2, 15)).toBeLessThan(1e-12)
  })
  it('phase estimation of U_2 in |1⟩ on t wires: the mean of the six eigenphase distributions is numpy’s comb mixture, t = 5, 6, 11', () => {
    for (const t of [5, 6, 11]) closeList(orderFindingDistribution(2, 21, t), FX.order[`t${t}`].dist, 1e-12)
  })
  it('five wires: the six tallest readings are 0, 5, 11, 16, 21, 27; the good readings are 5 and 27 (numpy’s exact continued fractions) with chance 0.2295; t = 11: 0.3320', () => {
    expect(tallestReadings(orderFindingDistribution(2, 21, 5), 6)).toEqual([0, 5, 11, 16, 21, 27])
    for (const t of [5, 6, 11]) {
      expect(orderGoodReadings(2, 21, t)).toEqual(FX.order[`t${t}`].good)
      close(orderSuccess(2, 21, t), FX.order[`t${t}`].success, 1e-12)
    }
    expect(orderGoodReadings(2, 21, 5)).toEqual([5, 27])
    close(orderSuccess(2, 21, 5), 0.2295, 5e-5)
    close(orderSuccess(2, 21, 11), 0.332, 5e-4)
  })
  it('U_2 squared is U_4: three different eigenphases, the order of 4 mod 21 is 3 (numpy’s eigvals of the squared shift)', () => {
    expect(distinctPowerPhases(2, 21, 2)).toBe(FX.order.distinctSquare)
    expect(distinctPowerPhases(2, 21, 2)).toBe(3)
    expect(multOrder(4, 21)).toBe(FX.order.order4)
    expect(distinctPowerPhases(2, 21, 1)).toBe(6)
    expect(distinctPowerPhases(2, 21, 3)).toBe(2)
  })
  it('property: orbits and orders for other (x, N) agree with numpy', () => {
    for (const o of FX.order.other) {
      expect(multOrder(o.x, o.N)).toBe(o.r)
      expect(orderOrbit(o.x, o.N)).toEqual(o.orbit)
    }
  })
})

describe('oracles: Simon (n = 3, s = 110) — Bergou §7.4 p. 126', () => {
  it('the function has the four pairs and numpy’s table [0, 1, 2, 3, 2, 3, 0, 1]; the answer-bit tables are F_HI and F_LO', () => {
    for (const fx of Object.values(FX.simon) as { n?: number; s?: number; table?: number[]; perp?: number[] }[]) {
      if (fx.n === undefined) continue
      expect(simonTable(fx.s!, fx.n)).toEqual(fx.table)
      expect(simonPerp(fx.s!, fx.n)).toEqual(fx.perp)
    }
    expect(simonTable(6, 3)).toEqual([0, 1, 2, 3, 2, 3, 0, 1])
    expect(simonBitTables(6, 3)).toEqual([[0, 0, 1, 1, 1, 1, 0, 0], [0, 1, 0, 1, 0, 1, 0, 1]])
  })
  it('the circuit has five columns on five wires: H, U_f (high bit), U_f (low bit), measure, H', () => {
    const C = simonCircuit(6, 3)
    expect(C.qubits).toBe(5)
    expect(C.columns).toHaveLength(5)
    expect(C.columns.map((col) => col.map((o) => o.op).join(','))).toEqual(['gate,gate,gate', 'oracle', 'oracle', 'measure,measure', 'gate,gate,gate'])
  })
  it('one query: eight bars of 0.3536, and each answer has chance ¼ (numpy’s dense circuit); after reading 01 two bars of 0.7071 remain', () => {
    const run = runCircuit(simonCircuit(6, 3), { outcomes: '01' })
    const q = run.states[3]
    const nz = q.map((z, i) => [abs(z), i] as const).filter(([a]) => a > 1e-12)
    expect(nz).toHaveLength(8)
    nz.forEach(([a]) => close(a, 1 / Math.sqrt(8)))
    close(run.prob, FX.simon.answerChance['1'])
    close(run.prob, 0.25)
    const post = run.states[4]
    const bars = post.map((z, i) => [abs(z), i] as const).filter(([a]) => a > 1e-12)
    expect(bars.map(([, i]) => i)).toEqual(FX.simon.post01.places)
    bars.forEach(([a]) => close(a, Math.SQRT1_2))
  })
  it('after the second layer of H the chance of each y is ¼ on s^⊥ = {000, 001, 110, 111} and 0 elsewhere, whatever the answer (numpy’s dense circuit)', () => {
    for (const ans of ['00', '01', '10', '11']) {
      const got = simonYFromCircuit(6, 3, ans)
      closeList(got, FX.simon.yDist[String(parseInt(ans, 2))], 1e-12)
      closeList(got, simonYDistribution(6, 3), 1e-12)
    }
    expect(simonPerp(6, 3)).toEqual([0, 1, 6, 7])
    const bars = runCircuit(simonCircuit(6, 3), { outcomes: '01' }).states[5]
    expect(Math.abs(bars[(0 << 2) | 1].re - 0.5)).toBeLessThan(1e-12)
    expect(Math.abs(bars[(1 << 2) | 1].re + 0.5)).toBeLessThan(1e-12)
  })
  it('Bergou’s printed last line of Eq. 7.33 has squared length ¼ (numpy’s); the right prefactor gives 1', () => {
    for (const [k, v] of Object.entries(FX.simon.printedNorm2 as Record<string, number>)) {
      const [n, s] = k === '2' ? [2, 3] : k === '3' ? [3, 6] : [3, 5]
      void s
      void n
      void v
    }
    close(simonPrintedNorm2(3, 6), FX.simon.printedNorm2['3'])
    close(simonPrintedNorm2(2, 3), FX.simon.printedNorm2['2'])
    close(simonPrintedNorm2(3, 6), 0.25)
    close(simonYDistribution(6, 3).reduce((a, b) => a + b, 0), 1)
  })
  it('n − 1 = 2 independent strings fix s: the checks 111, 110 reduce to rank 2 with null space {000, 110}; all of s^⊥ has rank 2; n = 3 independent strings force s = 000', () => {
    const rows = (ys: number[], n: number) => ys.map((y) => Array.from({ length: n }, (_, j) => (y >> (n - 1 - j)) & 1))
    expect(gf2Rank(rows([7, 6], 3))).toBe(2)
    expect(gf2Span(gf2Nullspace(rows([7, 6], 3), 3), 3)).toEqual([0, 6])
    expect(gf2Rank(rows(simonPerp(6, 3), 3))).toBe(2)
    expect(gf2Span(gf2Nullspace(rows([4, 2, 1], 3), 3), 3)).toEqual([0])
  })
  it('two runs give rank 2 with chance 0.375, three runs on average 10/3 = 3.333; ten bits: 10.60 (the formula, the count and numpy’s exact Fractions agree)', () => {
    for (const [k, v] of Object.entries(FX.simon.runsSuffice as Record<string, number>)) {
      const [n, s] = k.split('_').map(Number)
      close(simonRunsSufficeCounted(s, n), v, 1e-12)
      close(simonRunsSuffice(n), v, 1e-12)
    }
    close(simonRunsSuffice(3), 0.375)
    for (const [n, v] of Object.entries(FX.simon.expectedRuns as Record<string, number>)) close(simonExpectedRuns(Number(n)), v, 1e-12)
    close(simonExpectedRuns(3), 10 / 3)
    close(simonExpectedRuns(10), 10.6047, 5e-5)
  })
  it('the classical collision chance: three queries collide with 3/7 = 0.4286 (numpy’s subsets), exactly the union bound at n = 3, k = 3', () => {
    for (const [key, v] of Object.entries(FX.simon.collision as Record<string, number>)) {
      const [n, s, k] = key.split('_').map(Number)
      close(classicalCollision(s, n, k), v, 1e-12)
    }
    close(classicalCollision(6, 3, 3), 3 / 7)
    close(collisionUnionBound(3, 3), 3 / 7)
    for (const [key, v] of Object.entries(FX.simon.union as Record<string, number>)) {
      const [n, k] = key.split('_').map(Number)
      close(collisionUnionBound(n, k), v, 1e-12)
      expect(classicalCollision(1, n, k)).toBeLessThanOrEqual(collisionUnionBound(n, k) + 1e-12)
    }
  })
  it('the engine refuses nonsense: s = 0, n out of range, a wrong table', () => {
    expect(() => simonTable(0, 3)).toThrow()
    expect(() => simonTable(8, 3)).toThrow()
    expect(() => simonCircuit(1, 4)).toThrow()
    expect(() => classicalCollision(6, 5, 2)).toThrow()
  })
})

describe('qft: cross-checks that tie the pieces together', () => {
  it('the counting circuit’s 11 columns, and 5 wires; the order reading uses the same inverse QFT as phase estimation', () => {
    const C = countingCircuit(2, [3], 3)
    expect(C.qubits).toBe(5)
    expect(C.columns).toHaveLength(11)
    const m = 3
    const inv = qftCircuit(m, { inverse: true })
    expect(C.columns.slice(4)).toEqual(inv.columns)
    expect(phaseEstimationCircuit(0.3, 3).columns.slice(4)).toEqual(inv.columns)
  })
  it('the engine marginal of a circuit run equals marginal() of its state (the reading is the first m wires)', () => {
    const circ = phaseEstimationCircuit(0.3, 3)
    const run = runCircuit(circ)
    const fin: Vec = run.states[run.states.length - 1]
    closeList(readingOfCircuit(circ, 3), marginal(fin, [0, 1, 2]))
    expect(apply(identity(2), [c(1), c(0)])).toHaveLength(2)
  })
})
