/**
 * qc/walk.ts against numpy (pipeline/make_walk_fixtures.py → __fixtures__/qc-walk.json: math.comb, a momentum-space FFT for the coin walk, directed arcs with
 * the reflection 2J/n − I, the circuit form X_dir(|0><0| ⊗ O + |1><1| ⊗ D), np.poly / np.linalg.eigvals, a 5-dimensional reduced walk for N = 1024), plus the
 * cross-checks of P-Q19-story §9.1 (the circuit's matrix is the walk step; the reduced walks equal the full walk; the walk's chance is Grover's) and properties.
 */
import { describe, expect, it } from 'vitest'
import raw from '../__fixtures__/qc-walk.json?raw'
import { type Mat } from '../linalg'
import { runCircuit, validateCircuit } from './circuit'
import {
  charPoly,
  coinWalk,
  coinWalkSigma,
  coinWalkSigmas,
  connectFail,
  connectSteps,
  extraCharPoly,
  extraDeltaBergou,
  extraPolyGap,
  extraReducedGap,
  extraReducedM,
  extraStepsBergou,
  extraWalkChances,
  extraWalkPeak,
  extraWalkSeries,
  pathHitting,
  scatterRT,
  scatterVertex,
  starCharPoly,
  starCircuitGap,
  starDeltaBergou,
  starEigenAngles,
  starEigenGap,
  starInvariantGap,
  starReducedChance,
  starReducedGap,
  starReducedM,
  starSpokeChances,
  starStates,
  starStepsBergou,
  starUnitaryGap,
  starWalkCircuit,
  starWalkFirstPeak,
  starWalkMarked,
  starWalkMarkedSeries,
  starWalkStart,
  starWalkState,
  starWalkStep,
  starWalkU,
  vertexInversionGap,
  vertexUnitaryGap,
  walkChance,
  walkDistribution,
  walkGroverGap,
  walkSigmaClassical,
} from './walk'

const FX: any = JSON.parse(raw)
const real = (M: Mat): number[][] => M.map((row) => row.map((z) => z.re))
const gap = (a: number[], b: number[]): number => (a.length !== b.length ? Infinity : Math.max(0, ...a.map((x, i) => Math.abs(x - b[i]))))
const gapM = (A: number[][], B: number[][]): number => (A.length !== B.length ? Infinity : Math.max(0, ...A.map((row, i) => gap(row, B[i]))))
const sum = (xs: number[]): number => xs.reduce((s, x) => s + x, 0)

describe('the random walk on a line', () => {
  it('p(x; n) equals the binomial chances from numpy, sums to 1 and has parity', () => {
    for (const n of Object.keys(FX.classical.dist)) {
      const p = walkDistribution(Number(n))
      expect(gap(p, FX.classical.dist[n]), `n = ${n}`).toBeLessThan(1e-15)
      expect(Math.abs(sum(p) - 1)).toBeLessThan(1e-12)
    }
    expect(walkChance(2, -2)).toBe(0.25)
    expect(walkChance(2, 0)).toBe(0.5)
    expect(walkChance(2, 1)).toBe(0)
    expect(walkChance(2, 4)).toBe(0)
    expect(walkChance(10, 0)).toBeCloseTo(0.24609375, 12)
    expect(() => walkDistribution(-1)).toThrow()
  })
  it('σ(n) = √n, and matches numpy', () => {
    for (const n of Object.keys(FX.classical.sigma)) {
      expect(Math.abs(walkSigmaClassical(Number(n)) - FX.classical.sigma[n])).toBeLessThan(1e-12)
      expect(Math.abs(walkSigmaClassical(Number(n)) - Math.sqrt(Number(n)))).toBeLessThan(1e-12)
    }
  })
  it('the 2N³ path test and the hitting time of a path', () => {
    expect(connectSteps(10)).toBe(2000)
    expect(connectFail(5)).toBe(0.03125)
    for (const N of Object.keys(FX.classical.pathHitting)) {
      expect(Math.abs(pathHitting(Number(N)) - FX.classical.pathHitting[N])).toBeLessThan(1e-9)
      expect(Math.abs(pathHitting(Number(N)) - (Number(N) - 1) ** 2)).toBeLessThan(1e-8)
    }
    expect(() => pathHitting(1)).toThrow()
  })
})

describe('the Hadamard coin walk', () => {
  it('chances and spreads agree with the momentum-space route', () => {
    for (const n of Object.keys(FX.coin.chances)) {
      const p = coinWalk(Number(n))
      expect(gap(p, FX.coin.chances[n]), `n = ${n}`).toBeLessThan(1e-12)
      expect(Math.abs(sum(p) - 1)).toBeLessThan(1e-12)
    }
    for (const n of Object.keys(FX.coin.sigma)) expect(Math.abs(coinWalkSigma(Number(n)) - FX.coin.sigma[n]), `σ(${n})`).toBeLessThan(1e-10)
    const all = coinWalkSigmas(30)
    expect(Math.abs(all[30] - coinWalkSigma(30))).toBeLessThan(1e-14)
    expect(all[0]).toBe(0)
  })
  it('three steps equal the classical chances; the spread is linear', () => {
    const p = coinWalk(3)
    const q = walkDistribution(3)
    expect(gap([p[0], p[2], p[4], p[6]], q)).toBeLessThan(1e-15)
    expect(p[1] + p[3] + p[5]).toBeLessThan(1e-15)
    expect(coinWalkSigma(100) / 100).toBeGreaterThan(0.54)
    expect(coinWalkSigma(100) / 100).toBeLessThan(0.543)
    expect(coinWalkSigma(100)).toBeGreaterThan(5 * walkSigmaClassical(100))
  })
})

describe('the vertex rule (7.45-7.48)', () => {
  it('r = (n-2)/n, t = 2/n, the matrix equals 2J/n − I, unitarity and inversion gaps are 0', () => {
    expect(scatterRT(8)).toEqual({ r: 0.75, t: 0.25 })
    for (const n of Object.keys(FX.vertex)) {
      expect(gapM(real(scatterVertex(Number(n))), FX.vertex[n]), `n = ${n}`).toBeLessThan(1e-15)
      expect(vertexUnitaryGap(Number(n))).toBeLessThan(1e-14)
      expect(vertexInversionGap(Number(n))).toBeLessThan(1e-14)
    }
    const { r, t } = scatterRT(8)
    expect(Math.abs(r * r + 7 * t * t - 1)).toBeLessThan(1e-15) // 7.46
    expect(Math.abs(-2 * r * t + 6 * t * t)).toBeLessThan(1e-15) // 7.47
  })
  it('a dead end turns the walker back (+1) and two edges are a wire (r = 0, t = 1)', () => {
    expect(real(scatterVertex(1))).toEqual([[1]])
    expect(real(scatterVertex(2))).toEqual([[0, 1], [1, 0]])
    expect(real(scatterVertex(3))[0][0]).toBeCloseTo(-1 / 3, 14)
    expect(real(scatterVertex(3))[0][1]).toBeCloseTo(2 / 3, 14)
    expect(() => scatterRT(0)).toThrow()
  })
})

describe('the star graph walk step', () => {
  it('edge states: 2N, and 2N + 2 with the extra edge, in the documented order', () => {
    const s = starStates(8)
    expect(s.length).toBe(16)
    expect(s[0]).toEqual({ from: 0, to: 1 })
    expect(s[7]).toEqual({ from: 0, to: 8 })
    expect(s[8]).toEqual({ from: 1, to: 0 })
    const e = starStates(8, { extra: [1, 2] })
    expect(e.length).toBe(18)
    expect(e[16]).toEqual({ from: 1, to: 2 })
    expect(e[17]).toEqual({ from: 2, to: 1 })
    expect(() => starStates(8, { extra: [1, 1] })).toThrow()
    expect(() => starStates(8, { extra: [1, 9] })).toThrow()
  })
  it('the dense U equals numpy (arc route and circuit route) and is orthogonal', () => {
    for (const N of [2, 4, 8, 16]) expect(gapM(real(starWalkU(N, { marked: 1 })), FX.star.U[String(N)]), `marked, N = ${N}`).toBeLessThan(1e-14)
    expect(gapM(real(starWalkU(8, { marked: 3 })), FX.star.U['8m3'])).toBeLessThan(1e-14)
    expect(gapM(real(starWalkU(4)), FX.star.Uplain4)).toBeLessThan(1e-14)
    for (const N of [3, 4, 8]) expect(gapM(real(starWalkU(N, { extra: [1, 2] })), FX.extra.U[String(N)]), `extra, N = ${N}`).toBeLessThan(1e-14)
    for (const spec of [{ marked: 1 }, { extra: [1, 2] as [number, number] }, {}]) expect(starUnitaryGap(8, spec)).toBeLessThan(1e-14)
    expect(starUnitaryGap(16, { marked: 5 })).toBeLessThan(1e-14)
  })
  it('refuses a marked spoke with an extra edge, or an out-of-range choice', () => {
    expect(() => starWalkU(8, { marked: 1, extra: [1, 2] })).toThrow()
    expect(() => starWalkU(8, { marked: 9 })).toThrow()
    expect(() => starWalkU(70, { marked: 1 })).toThrow()
    expect(() => starWalkStep(8, { marked: 1 }, [1, 2, 3])).toThrow()
  })
  it('the start states', () => {
    const o = starWalkStart(8, { marked: 1 })
    expect(Math.abs(sum(o.map((x) => x * x)) - 1)).toBeLessThan(1e-14)
    expect(o.slice(0, 8).every((x) => Math.abs(x - 1 / Math.sqrt(8)) < 1e-15)).toBe(true)
    expect(o.slice(8).every((x) => x === 0)).toBe(true)
    const i = starWalkStart(8, { marked: 1 }, { start: 'in' })
    expect(i.slice(0, 8).every((x) => x === 0)).toBe(true)
    const e = starWalkStart(8, { extra: [1, 2] })
    expect(e[0]).toBeCloseTo(1 / 4, 14)
    expect(e[8]).toBeCloseTo(-1 / 4, 14)
    expect(e[16]).toBe(0)
    expect(starWalkStart(8, { extra: [1, 2] }, { sign: 1 })[8]).toBeCloseTo(1 / 4, 14)
  })
})

describe('the marked-spoke search', () => {
  it('the chance on the marked spoke equals numpy for N = 4, 8, 16, the arriving start, and N = 1024 (4-dimensional route)', () => {
    for (const N of [4, 8, 16]) expect(gap(starWalkMarkedSeries(N, 40), FX.star.chances[String(N)]), `N = ${N}`).toBeLessThan(1e-12)
    const inn = starWalkStart(8, { marked: 1 }, { start: 'in' })
    let psi = inn
    const series: number[] = []
    for (let n = 0; n <= 14; n++) {
      series.push(psi[0] ** 2 + psi[8] ** 2)
      psi = starWalkStep(8, { marked: 1 }, psi)
    }
    expect(gap(series, FX.star.chances['8in'])).toBeLessThan(1e-12)
    expect(gap(starWalkMarkedSeries(1024, 110), FX.star.chances['1024'])).toBeLessThan(1e-12)
    expect(starWalkMarked(8, 4)).toBeCloseTo(0.9453125, 12)
    expect(starWalkMarked(8, 2)).toBeCloseTo(0.78125, 12)
  })
  it('first peaks: 4 at N = 8, 6 at N = 16, 50 at N = 1024 (twice Grover\'s best number of steps)', () => {
    for (const N of [4, 8, 16, 1024]) expect(starWalkFirstPeak(N), `N = ${N}`).toBe(FX.star.peak[String(N)])
    expect([starWalkFirstPeak(8), starWalkFirstPeak(16), starWalkFirstPeak(1024)]).toEqual([4, 6, 50])
    expect(starWalkMarked(1024, 50)).toBeGreaterThan(0.9994)
  })
  it('the walk IS Grover: P_walk(n) = sin²((2⌊n/2⌋+1)α) for N = 4, 8, 16, n ≤ 30', () => {
    expect(walkGroverGap(30)).toBeLessThan(1e-13)
    const alpha = Math.asin(1 / Math.sqrt(8))
    for (let n = 0; n <= 12; n++) expect(Math.abs(starWalkMarked(8, n) - Math.sin((2 * Math.floor(n / 2) + 1) * alpha) ** 2)).toBeLessThan(1e-13)
  })
  it('at the peak the walker is on the marked edge with amplitude ±0.9723 (even n: |0,1>, odd n: −|1,0>)', () => {
    const a4 = starWalkState(8, { marked: 1 }, 4)
    const a5 = starWalkState(8, { marked: 1 }, 5)
    expect(a4[0]).toBeCloseTo(0.9723, 3)
    expect(a5[8]).toBeCloseTo(-0.9723, 3)
  })
  it('spoke chances sum to 1 and mark the right spoke', () => {
    for (const [N, spec, step] of [[8, { marked: 1 }, 3], [8, { marked: 5 }, 4], [16, { marked: 2 }, 6], [8, { extra: [1, 2] as [number, number] }, 3], [8, {}, 5]] as const) {
      const r = starSpokeChances(N, spec, step)
      expect(Math.abs(sum(r.spokes) + r.extra - 1), `${N} ${JSON.stringify(spec)}`).toBeLessThan(1e-13)
    }
    const r = starSpokeChances(8, { marked: 5 }, 4)
    expect(r.spokes[4]).toBeCloseTo(0.9453125, 12)
    expect(r.extra).toBe(0)
  })
})

describe('the 4-dimensional invariant subspace (7.50-7.58)', () => {
  it('M (7.53) equals numpy, equals the projection of the full U, and the span is closed', () => {
    for (const N of [8, 16, 32]) {
      expect(gapM(starReducedM(N), FX.star.M[String(N)]), `N = ${N}`).toBeLessThan(1e-15)
      expect(starReducedGap(N)).toBeLessThan(1e-14)
      expect(starInvariantGap(N)).toBeLessThan(1e-14)
    }
    const M = starReducedM(8)
    expect(M[0][1]).toBe(-0.75)
    expect(M[0][3]).toBeCloseTo(0.25 * Math.sqrt(7), 14)
  })
  it('the characteristic polynomial λ⁴ − 2rλ² + 1 and the eigenphases ±α, π ± α with sin²α = 1/N', () => {
    for (const N of [8, 16, 32]) {
      expect(gap(starCharPoly(N), FX.star.poly[String(N)]), `N = ${N}`).toBeLessThan(1e-12)
      expect(starEigenGap(N)).toBeLessThan(1e-12)
    }
    expect(starCharPoly(8)).toEqual([1, 0, -1.5, 0, 1])
    const ang = [...starEigenAngles(8)].sort((a, b) => a - b)
    expect(gap(ang, FX.star.eig['8'])).toBeLessThan(1e-12)
    expect(gap([...starEigenAngles(16)].sort((a, b) => a - b), FX.star.eig['16'])).toBeLessThan(1e-12)
    expect((starEigenAngles(8)[0] * 180) / Math.PI).toBeCloseTo(20.7048, 3)
    expect(Math.sin(starEigenAngles(8)[0]) ** 2).toBeCloseTo(1 / 8, 14)
  })
  it("Bergou's large-N values: Δ = 1/√N (20.26° at N = 8) and π/(2Δ) = 4.44", () => {
    expect(starDeltaBergou(8)).toBeCloseTo(1 / Math.sqrt(8), 14)
    expect((starDeltaBergou(8) * 180) / Math.PI).toBeCloseTo(20.257, 3)
    expect(starStepsBergou(8)).toBeCloseTo(4.4429, 3)
    expect(starStepsBergou(1024)).toBeCloseTo(50.265, 3)
  })
  it('the reduced walk equals the full walk for N ≤ 32', () => {
    for (const N of [4, 8, 16, 32]) for (let n = 0; n <= 20; n++) expect(Math.abs(starReducedChance(N, n) - starWalkMarked(N, n))).toBeLessThan(1e-13)
    expect(starReducedChance(8, 4)).toBeCloseTo(0.9453125, 12)
  })
  it('charPoly is a general Faddeev-LeVerrier (identity, a rotation)', () => {
    expect(charPoly([[1, 0], [0, 1]])).toEqual([1, -2, 1])
    expect(charPoly([[0, -1], [1, 0]])).toEqual([1, 0, 1])
  })
})

describe('the extra-edge search (7.64-7.79)', () => {
  it('M (7.68) equals numpy and the projection of the full U; the characteristic polynomial is 7.69', () => {
    for (const N of [8, 16, 64]) {
      expect(gapM(extraReducedM(N), FX.extra.M[String(N)]), `N = ${N}`).toBeLessThan(1e-15)
      expect(extraReducedGap(N)).toBeLessThan(1e-14)
      expect(gap(extraCharPoly(N), FX.extra.poly[String(N)]), `poly N = ${N}`).toBeLessThan(1e-12)
      expect(extraPolyGap(N)).toBeLessThan(1e-14)
    }
  })
  it('chances on spokes 1, 2 and on the extra edge equal numpy (N = 8, 64, both starting signs) and the 5-dimensional route (N = 64, 1024)', () => {
    for (const [N, key, sign] of [[8, '8', -1], [64, '64', -1], [8, '8plus', 1], [64, '64plus', 1]] as const) {
      const s = extraWalkSeries(N, FX.extra.near[key].length - 1, sign)
      expect(gap(s.near, FX.extra.near[key]), key).toBeLessThan(1e-12)
      expect(gap(s.edge, FX.extra.edge[key]), key).toBeLessThan(1e-12)
    }
    const s1024 = extraWalkSeries(1024, 130)
    expect(gap(s1024.near, FX.extra.near['1024r'])).toBeLessThan(1e-12)
    expect(gap(s1024.edge, FX.extra.edge['1024r'])).toBeLessThan(1e-12)
    expect(gap(extraWalkSeries(64, 130).near, FX.extra.near['64r'])).toBeLessThan(1e-12)
  })
  it('the first peaks: 11 at N = 64 (0.7002), 3 at N = 8 (0.625), 44 at N = 1024; the + start fails', () => {
    for (const N of [8, 64, 1024]) expect(extraWalkPeak(N), `N = ${N}`).toBe(FX.extra.peak[String(N)])
    expect(extraWalkPeak(64)).toBe(11)
    expect(extraWalkPeak(1024)).toBe(44)
    const p = extraWalkChances(64, 11)
    expect(p.near).toBeCloseTo(0.7002, 4)
    expect(p.edge).toBeCloseTo(0.2928, 4)
    expect(extraWalkChances(8, 3).near).toBeCloseTo(0.625, 12)
    const plus = extraWalkSeries(64, 40, 1)
    expect(Math.max(...plus.near)).toBeLessThan(0.083)
    expect(Math.max(...plus.edge)).toBeLessThan(0.059)
  })
  it("Δ = 2/√(3N) = 0.1443 at N = 64, and π/(2Δ) = 10.88 (43.53 at N = 1024); the asymptotic split 2/3 : 1/3", () => {
    expect(extraDeltaBergou(64)).toBeCloseTo(0.1443, 4)
    expect(extraStepsBergou(64)).toBeCloseTo(10.8828, 3)
    expect(extraStepsBergou(1024)).toBeCloseTo(43.5312, 3)
    const p = extraWalkChances(1024, 44)
    expect(p.near).toBeGreaterThan(0.66)
    expect(p.near).toBeLessThan(0.68)
    expect(p.edge).toBeGreaterThan(0.32)
    expect(p.edge).toBeLessThan(0.34)
  })
})

describe('the walk as a circuit (N = 2, 4, 8)', () => {
  it('is a valid circuit of 1 + log2 N wires with one W box per step and a Hadamard column', () => {
    const c = starWalkCircuit(8, 1, 4)
    expect(validateCircuit(c).ok).toBe(true)
    expect(c.qubits).toBe(4)
    expect(c.columns.length).toBe(5)
    expect(c.columns[0].length).toBe(3)
    expect(c.columns[1].length).toBe(1)
    expect(c.wires).toEqual(['d', 'j₂', 'j₁', 'j₀'])
    expect(starWalkCircuit(2, 1, 0).columns.length).toBe(1)
    expect(() => starWalkCircuit(16, 1, 1)).toThrow()
    expect(() => starWalkCircuit(6, 1, 1)).toThrow()
  })
  it('its matrix is W^k (I ⊗ H^m): the gap to the vertex-by-vertex walk is 0, and the run reproduces the chances', () => {
    expect(starCircuitGap(8, 1, 1)).toBeLessThan(1e-13)
    expect(starCircuitGap(8, 3, 4)).toBeLessThan(1e-13)
    expect(starCircuitGap(4, 2, 3)).toBeLessThan(1e-13)
    expect(starCircuitGap(2, 1, 2)).toBeLessThan(1e-13)
    for (const steps of [0, 1, 4, 5]) {
      const run = runCircuit(starWalkCircuit(8, 1, steps))
      const psi = run.states[run.states.length - 1]
      const ref = starWalkState(8, { marked: 1 }, steps)
      expect(Math.max(...psi.map((z, i) => Math.hypot(z.re - ref[i], z.im))), `${steps} steps`).toBeLessThan(1e-12)
    }
  })
})
