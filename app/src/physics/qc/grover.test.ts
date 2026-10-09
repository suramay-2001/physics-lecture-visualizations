/**
 * qc/grover.ts against numpy (pipeline/make_grover_fixtures.py → __fixtures__/qc-grover.json: explicit 2ⁿ × 2ⁿ matrices, Q = −U_H U₀ U_H U_f
 * multiplied out, matrix_power for the state, a scan for the best k, np.linalg.eigvals for the eigenphase), plus the cross-check named in
 * P-Q17-story §9.1: a full simulation of the circuit (`runCircuit` on `groverCircuit`) equals the plane's closed form for n ≤ 5, k ≤ 6
 * (the 28 circuit-versus-plane cases, and several marked strings), and property tests on the invariants (unitarity, the closed plane,
 * equal unmarked amplitudes, two reflections = one rotation, D_k ≤ 4k²).
 */
import { describe, expect, it } from 'vitest'
import raw from '../__fixtures__/qc-grover.json?raw'
import { c } from '../complex'
import { type Mat, type Vec, apply, isUnitary, maxDiff } from '../linalg'
import { rng } from '../random'
import { circuitUnitary } from './circuit'
import {
  GROVER_BBBV_MAX_N,
  bbbvD,
  bbbvDLowerBound,
  bbbvLowerBound,
  bbbvStepBound,
  closestIntegerHalvesDown,
  cosAlphaMeasured,
  diffusionCircuit,
  eq715Gaps,
  finalState,
  groverAngle,
  groverCircuit,
  groverEigenphase,
  groverOptimalK,
  groverPlane,
  groverStateVector,
  groverStepMatrix,
  groverSuccess,
  markTable,
  markedIndex,
  minusUfVersusUw0,
  missChances,
  nonzeroTable,
  perpOverlap,
  reflect2D,
  rotate2D,
  startState,
} from './grover'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const FX: any = JSON.parse(raw)
const DEG = Math.PI / 180
const close = (a: number, b: number, eps = 1e-12) => expect(Math.abs(a - b), `${a} ≈ ${b}`).toBeLessThan(eps)
const cv = (v: [number, number][]): Vec => v.map(([re, im]) => c(re, im))
const vecGap = (a: Vec, b: Vec): number => Math.max(...a.map((x, i) => Math.hypot(x.re - b[i].re, x.im - b[i].im)))
const realMat = (m: number[][]): Mat => m.map((row) => row.map((x) => c(x)))

describe('grover: the closed forms', () => {
  it('N = 8: α = 20.70°, the chance after k steps is sin²((2k+1)α) = 0.78125, 0.9453125, 0.330078125 for k = 1, 2, 3', () => {
    close(groverAngle(8) / DEG, FX.angle.find((a: { N: number; M: number }) => a.N === 8).alphaDeg, 1e-11)
    close(groverAngle(8) / DEG, 20.7048110546354, 1e-11)
    close(groverSuccess(8, 1, 0), 0.125)
    close(groverSuccess(8, 1, 1), 0.78125)
    close(groverSuccess(8, 1, 2), 0.9453125)
    close(groverSuccess(8, 1, 3), 0.330078125)
  })
  it('N = 4 is exact in one step (α = 30°, 3α = 90°), and N = 16 with M = 4 is the same angle', () => {
    close(groverAngle(4) / DEG, 30, 1e-12)
    close(groverSuccess(4, 1, 1), 1)
    close(groverAngle(16, 4) / DEG, 30, 1e-12)
    close(groverSuccess(16, 4, 1), 1)
  })
  it('the plane coordinates are (cos, sin) of (2k+1)α, a unit vector, and agree with numpy', () => {
    for (const a of FX.angle) {
      close(groverAngle(a.N, a.M), a.alpha, 1e-12)
      a.success.forEach((p: number, k: number) => close(groverSuccess(a.N, a.M, k), p, 1e-12))
      for (let k = 0; k < 8; k++) {
        const [co, si] = groverPlane(a.N, a.M, k)
        close(co * co + si * si, 1)
      }
    }
  })
  it('N = 1024: k* = 25, chance 0.9995 (numpy: success at the scanned best k)', () => {
    const a = FX.angle.find((x: { N: number; M: number }) => x.N === 1024 && x.M === 1)
    expect(groverOptimalK(1024)).toBe(a.kopt)
    expect(a.kopt).toBe(25)
    close(groverSuccess(1024, 1, 25), a.successAtKopt, 1e-12)
    expect(groverSuccess(1024, 1, 25)).toBeGreaterThan(0.99946)
    close(groverSuccess(1024, 1, 12), 0.4960, 5e-5)
  })
  it('the eigenphase is 2α, the turn of one step', () => {
    close(groverEigenphase(8), 2 * groverAngle(8))
    close(groverEigenphase(16, 4), 60 * DEG, 1e-12)
  })
  it('rejects a malformed N, M or k', () => {
    expect(() => groverAngle(1)).toThrow(/at least 2/)
    expect(() => groverAngle(8, 8)).toThrow(/1 ≤ M < N/)
    expect(() => groverAngle(8, 0)).toThrow(/1 ≤ M < N/)
    expect(() => groverPlane(8, 1, -1)).toThrow(/whole number of steps/)
    expect(() => groverPlane(8, 1, 1.5)).toThrow(/whole number of steps/)
    expect(() => groverAngle(2.5)).toThrow()
  })
})

describe('grover: the best number of steps (N&C CI rule, halves round down)', () => {
  it('matches the scan in numpy for every N = 2…1024 and the M-marked cases', () => {
    for (const row of FX.kopt) expect(groverOptimalK(row.N, row.M ?? 1), `N=${row.N} M=${row.M ?? 1}`).toBe(row.kopt)
  })
  it('CI rounds a half DOWN and an exact integer stays: the N = 2 tie gives 0', () => {
    expect(closestIntegerHalvesDown(0.5)).toBe(0)
    expect(closestIntegerHalvesDown(3.5)).toBe(3)
    expect(closestIntegerHalvesDown(3.5000001)).toBe(4)
    expect(closestIntegerHalvesDown(2)).toBe(2)
    expect(closestIntegerHalvesDown(-0.3)).toBe(0)
    expect(groverOptimalK(2)).toBe(0)
  })
  it('for every N = 4…1100 it leaves the arrow nearest straight up on the first approach (the best chance of k = 0 … k* + 1), and it equals Bergou’s closest integer to (π/4)√N − ½', () => {
    for (let N = 4; N <= 1100; N++) {
      const k = groverOptimalK(N)
      // the first approach to straight up: k = 0 … k* + 1 (the arrow comes round again after a full lap, which is not the question)
      const best = Math.max(...Array.from({ length: k + 2 }, (_, j) => groverSuccess(N, 1, j)))
      expect(groverSuccess(N, 1, k), `N=${N}`).toBeGreaterThanOrEqual(best - 1e-12)
      const bergou = Math.round((Math.PI / 4) * Math.sqrt(N) - 0.5)
      // Bergou's rule uses α ≈ 1/√N (large N); the exact N&C rule differs only where a half falls between: allow 1 at the boundary
      expect(Math.abs(k - bergou), `N=${N}`).toBeLessThanOrEqual(1)
    }
    for (const N of [4, 8, 16, 64, 256, 1024]) expect(groverOptimalK(N)).toBe(Math.round((Math.PI / 4) * Math.sqrt(N) - 0.5))
  })
  it('the miss chance at k* is at most sin²α = 1/N, for M = 1 and for N up to 1100', () => {
    for (let N = 4; N <= 1100; N++) expect(1 - groverSuccess(N, 1, groverOptimalK(N)), `N=${N}`).toBeLessThanOrEqual(1 / N + 1e-12)
  })
})

describe('grover: the circuit versus the plane (the cross-check)', () => {
  it('a full simulation of the circuit equals the plane’s closed form, n = 2…5 and k = 0…6, one marked string (28 cases) and several', () => {
    let cases = 0
    for (const row of FX.plane) {
      const circ = groverCircuit(row.n, row.marked, row.k)
      const sim = finalState(circ)
      expect(vecGap(sim, groverStateVector(row.n, row.marked, row.k)), `n=${row.n} k=${row.k} marked=${row.marked}`).toBeLessThan(1e-12)
      // numpy: the matrix route Q^k|w0⟩ and the numpy circuit-column route, both agree with the engine's circuit
      expect(vecGap(sim, cv(row.state)), 'numpy matrix').toBeLessThan(1e-12)
      expect(vecGap(sim, cv(row.circuit)), 'numpy columns').toBeLessThan(1e-12)
      const [co, si] = groverPlane(2 ** row.n, row.marked.length, row.k)
      close(co, row.plane[0])
      close(si, row.plane[1])
      close(sim.reduce((s, z, i) => s + (row.marked.includes(i) ? z.re * z.re + z.im * z.im : 0), 0), row.pMarked)
      close(row.pMarked, groverSuccess(2 ** row.n, row.marked.length, row.k), 1e-12)
      cases++
    }
    expect(cases).toBeGreaterThanOrEqual(28 + 25)
    expect(FX.plane.filter((r: { marked: number[] }) => r.marked.length === 1).length).toBeGreaterThanOrEqual(28)
  })
  it('the running example: N = 8, x₀ = 101: the circuit has 1 + 4k columns; after one step the seven others read 0.1768 and the marked 0.8839', () => {
    const circ = groverCircuit(3, ['101'], 2)
    expect(circ.columns).toHaveLength(9)
    expect(circ.init).toBe('000')
    const s1 = finalState(groverCircuit(3, ['101'], 1))
    close(s1[5].re, 0.883883476483184, 1e-12)
    for (let i = 0; i < 8; i++) if (i !== 5) close(s1[i].re, 0.176776695296637, 1e-12)
  })
  it('the marking column is the phase oracle of f (1 only at 101), the third column the phase oracle of "flip all but 000" = −U₀', () => {
    const circ = groverCircuit(3, ['101'], 1)
    const mark = circ.columns[1][0]
    const flip = circ.columns[3][0]
    expect(mark).toMatchObject({ op: 'oracle', mode: 'phase', label: 'U_f' })
    expect(flip).toMatchObject({ op: 'oracle', mode: 'phase', label: '−U_0' })
    expect((mark as { table: number[] }).table).toEqual([0, 0, 0, 0, 0, 1, 0, 0])
    expect((flip as { table: number[] }).table).toEqual([0, 1, 1, 1, 1, 1, 1, 1])
    expect(markTable(3, ['101'])).toEqual([0, 0, 0, 0, 0, 1, 0, 0])
    expect(nonzeroTable(3)).toEqual([0, 1, 1, 1, 1, 1, 1, 1])
    expect(markedIndex('101', 3)).toBe(5)
  })
  it('the circuit’s step IS Bergou’s Q = −U_H U₀ U_H U_f, entry by entry (max |circuit − Q| = 0), not only up to a sign', () => {
    for (const [n, x0] of [[2, 3], [3, 5], [4, 9]] as const) {
      const N = 2 ** n
      const circ = circuitUnitary({ ...groverCircuit(n, [x0], 1), columns: groverCircuit(n, [x0], 1).columns.slice(1) })
      // Q = −H U0 H Uf, from explicit matrices
      const H1 = [[1, 1], [1, -1]].map((r) => r.map((x) => x / Math.SQRT2))
      let H: number[][] = [[1]]
      for (let q = 0; q < n; q++) H = kronReal(H, H1)
      const U0 = Array.from({ length: N }, (_, i) => Array.from({ length: N }, (_, j) => (i === j ? (i === 0 ? -1 : 1) : 0)))
      const Uf = Array.from({ length: N }, (_, i) => Array.from({ length: N }, (_, j) => (i === j ? (i === x0 ? -1 : 1) : 0)))
      const Q = matmulReal(matmulReal(matmulReal(H, U0), H), Uf).map((r) => r.map((x) => -x))
      expect(maxDiff(circ, realMat(Q))).toBeLessThan(1e-12)
    }
  })
  it('rejects a marked list that is empty, repeated, out of range or everything, and a circuit that is too big', () => {
    expect(() => groverCircuit(3, [], 1)).toThrow(/marked must list/)
    expect(() => groverCircuit(3, [2, 2], 1)).toThrow(/marked must list/)
    expect(() => groverCircuit(3, [8], 1)).toThrow(/marked must list/)
    expect(() => groverCircuit(2, [0, 1, 2, 3], 1)).toThrow(/marked must list/)
    expect(() => groverCircuit(0, [0], 1)).toThrow(/qubits/)
    expect(() => groverCircuit(11, [0], 1)).toThrow(/qubits/)
    expect(() => groverCircuit(3, [1], -1)).toThrow(/steps/)
    expect(() => markedIndex('10', 3)).toThrow(/3 bits/)
  })
})

function kronReal(A: number[][], B: number[][]): number[][] {
  return A.flatMap((ra) => B.map((rb) => ra.flatMap((a) => rb.map((b) => a * b))))
}
function matmulReal(A: number[][], B: number[][]): number[][] {
  return A.map((row) => B[0].map((_, j) => row.reduce((s, a, k) => s + a * B[k][j], 0)))
}

describe('grover: properties of Q (random inputs)', () => {
  const rand = rng(17)
  it('Q is unitary and real; it keeps the plane S′ closed: Q(c₁|w₀⟩ + c₂|x₀⟩) stays in span{|w₀⟩, |x₀⟩} for random c₁, c₂ and n = 2…5', () => {
    for (let t = 0; t < 12; t++) {
      const n = 2 + Math.floor(rand() * 4)
      const N = 2 ** n
      const x0 = Math.floor(rand() * N)
      const Q = groverStepMatrix(n, x0)
      expect(isUnitary(Q, 1e-9)).toBe(true)
      expect(Math.max(...Q.flat().map((z) => Math.abs(z.im)))).toBeLessThan(1e-12)
      const c1 = rand() * 2 - 1
      const c2 = rand() * 2 - 1
      const w0 = startState(n)
      const psi = w0.map((z, i) => c(c1 * z.re + (i === x0 ? c2 : 0)))
      const out = apply(Q, psi)
      // express out = a|w0⟩ + b|x0⟩ by two entries, then check every other entry
      const other = x0 === 0 ? 1 : 0
      const a = out[other].re * Math.sqrt(N)
      const b = out[x0].re - a / Math.sqrt(N)
      const resid = Math.max(...out.map((z, i) => Math.abs(z.re - (a * w0[i].re + (i === x0 ? b : 0))) + Math.abs(z.im)))
      expect(resid, `n=${n} x0=${x0}`).toBeLessThan(1e-12)
    }
  })
  it('the unmarked amplitudes stay equal at every step (spread 0), and the marked one follows sin((2k+1)α)', () => {
    for (const n of [2, 3, 4, 5]) {
      const N = 2 ** n
      for (let k = 0; k <= 6; k++) {
        const s = finalState(groverCircuit(n, [N - 1], k))
        const rest = s.slice(0, N - 1).map((z) => z.re)
        expect(Math.max(...rest) - Math.min(...rest), `n=${n} k=${k}`).toBeLessThan(1e-12)
        close(s[N - 1].re, Math.sin((2 * k + 1) * groverAngle(N)), 1e-12)
      }
    }
  })
  it('without the oracle the fixed steps never move |w₀⟩ (exactly, not up to a sign)', () => {
    for (const n of [2, 3, 4]) for (let k = 0; k <= 5; k++) expect(vecGap(finalState(diffusionCircuit(n, k)), startState(n))).toBeLessThan(1e-12)
    expect(diffusionCircuit(3, 2).columns).toHaveLength(7)
  })
  it('Q turns by 2α: applying the step circuit to the plane vector |x₀⊥⟩ − i|x₀⟩ gives e^{2iα} times it (eigenphase 2α)', () => {
    for (const [n, x0] of [[3, 5], [4, 2], [5, 30]] as const) {
      const N = 2 ** n
      const Q = groverStepMatrix(n, x0)
      const w0 = startState(n)
      const a = groverAngle(N)
      // |x₀⊥⟩ = (|w₀⟩ − sin α |x₀⟩)/cos α
      const perp = w0.map((z, i) => c((z.re - (i === x0 ? Math.sin(a) : 0)) / Math.cos(a)))
      const v: Vec = perp.map((z, i) => c(z.re, i === x0 ? -1 : 0))
      const out = apply(Q, v)
      const ph = c(Math.cos(2 * a), Math.sin(2 * a))
      expect(vecGap(out, v.map((z) => c(z.re * ph.re - z.im * ph.im, z.re * ph.im + z.im * ph.re)))).toBeLessThan(1e-12)
    }
    for (const e of FX.eigen) close(groverEigenphase(2 ** e.n, e.marked.length), e.maxPhase, 1e-8)
  })
  it('M marked strings: the same picture with sin α = √(M/N); the marked state is their even mix', () => {
    for (const row of FX.plane.filter((r: { marked: number[] }) => r.marked.length > 1)) {
      const N = 2 ** row.n
      const M = row.marked.length
      const s = finalState(groverCircuit(row.n, row.marked, row.k))
      const marked = row.marked.map((i: number) => s[i].re)
      expect(Math.max(...marked) - Math.min(...marked)).toBeLessThan(1e-12)
      close(marked[0] * Math.sqrt(M), Math.sin((2 * row.k + 1) * Math.asin(Math.sqrt(M / N))), 1e-12)
    }
  })
})

describe('grover: two reflections make a rotation', () => {
  it('matches numpy: reflect2D(θ) = 2|u⟩⟨u| − I for the line at θ, including the product and the reverse for N = 8', () => {
    for (const r of FX.reflect.cases) expect(maxDiff(reflect2D(r.deg), realMat(r.R))).toBeLessThan(1e-12)
    const alpha = FX.reflect.alphaDeg8
    expect(maxDiff(matmulC(reflect2D(alpha), reflect2D(0)), realMat(FX.reflect.rot2a))).toBeLessThan(1e-12)
    expect(maxDiff(matmulC(reflect2D(0), reflect2D(alpha)), realMat(FX.reflect.rotMinus2a))).toBeLessThan(1e-12)
    expect(maxDiff(matmulC(reflect2D(alpha), reflect2D(0)), realMat(FX.reflect.product))).toBeLessThan(1e-12)
    expect(maxDiff(matmulC(reflect2D(0), reflect2D(alpha)), realMat(FX.reflect.reverse))).toBeLessThan(1e-12)
  })
  it('property: for random line angles, a reflection squares to I, has determinant −1, and R(β)·R(γ) is the rotation by 2(β − γ)', () => {
    const rand = rng(23)
    for (let t = 0; t < 30; t++) {
      const b = (rand() - 0.5) * 360
      const g = (rand() - 0.5) * 360
      const R = reflect2D(b)
      expect(maxDiff(matmulC(R, R), realMat([[1, 0], [0, 1]]))).toBeLessThan(1e-12)
      close(R[0][0].re * R[1][1].re - R[0][1].re * R[1][0].re, -1)
      expect(maxDiff(matmulC(reflect2D(b), reflect2D(g)), rotate2D(2 * (b - g)))).toBeLessThan(1e-12)
    }
  })
  it('Theorem 1 inside the engine: the full N×N step restricted to the plane IS R(2α)R(0): the plane coordinates after k steps equal R(2α)^k (cos α, sin α)', () => {
    for (const N of [4, 8, 16, 1024]) {
      const a = groverAngle(N) / DEG
      let v: [number, number] = [Math.cos(a * DEG), Math.sin(a * DEG)]
      const step = matmulC(reflect2D(a), reflect2D(0))
      for (let k = 1; k <= 5; k++) {
        v = [step[0][0].re * v[0] + step[0][1].re * v[1], step[1][0].re * v[0] + step[1][1].re * v[1]]
        const [co, si] = groverPlane(N, 1, k)
        close(v[0], co)
        close(v[1], si)
      }
    }
  })
})
function matmulC(A: Mat, B: Mat): Mat {
  return A.map((row) => B[0].map((_, j) => row.reduce((s, a, k) => c(s.re + a.re * B[k][j].re - a.im * B[k][j].im, s.im + a.re * B[k][j].im + a.im * B[k][j].re), c(0))))
}

describe('grover: the √N lower bound (Bergou Eqs. 7.19–7.29)', () => {
  it('D_k of Grover’s own run matches numpy (n = 1…5, k = 0…5), D_1 = 4 for every N, and D_k ≤ 4k²', () => {
    for (const row of FX.bbbv.D) {
      const got = bbbvD(row.n, row.k)
      close(got, row.D, 1e-9)
      expect(got, `n=${row.n} k=${row.k}`).toBeLessThanOrEqual(4 * row.k * row.k + 1e-9)
      if (row.k === 1) close(got, 4, 1e-9)
      if (row.k === 0) close(got, 0, 1e-12)
    }
    close(bbbvD(3, 2), 14, 1e-9)
    close(bbbvD(3, 3), 25, 1e-9)
  })
  it('the lower bound of Eq. 7.29 matches numpy’s √(D_low/4), is 11.57 for N = 1024, and Grover’s own k* always respects it', () => {
    for (const b of FX.bbbv.bounds) {
      close(bbbvDLowerBound(b.N), b.dLow, 1e-9)
      close(bbbvLowerBound(b.N), b.k, 1e-9)
    }
    close(bbbvLowerBound(1024), 11.574166407672, 1e-9)
    for (let n = 1; n <= 12; n++) expect(groverOptimalK(2 ** n), `n=${n}`).toBeGreaterThanOrEqual(bbbvLowerBound(2 ** n) - 1e-9)
    // the bound is nearly tight at success one half: Grover after 12 steps sits near it for N = 1024
    close(groverSuccess(1024, 1, 12), 0.496, 1e-3)
  })
  it('the induction step of Eq. 7.22: with the weight 4 on the last term the bound holds (and is tight at k = 0); with the printed weight 1 it fails', () => {
    for (const row of FX.stepBound) {
      close(bbbvStepBound(row.n, row.k, 1), row.w1, 1e-9)
      close(bbbvStepBound(row.n, row.k, 4), row.w4, 1e-9)
      close(bbbvD(row.n, row.k + 1), row.dNext, 1e-9)
      expect(row.w4).toBeGreaterThanOrEqual(row.dNext - 1e-9)
    }
    // at k = 0 the printed weight gives a bound of 1 while D_1 = 4
    expect(bbbvStepBound(3, 0, 1)).toBeLessThan(bbbvD(3, 1) - 1)
    close(bbbvStepBound(3, 0, 4), 4, 1e-9)
  })
  it('bbbvD stops at n = 6; the bound is 0 for the tiny N where it says nothing', () => {
    expect(() => bbbvD(GROVER_BBBV_MAX_N + 1, 1)).toThrow(/n must be/)
    expect(() => bbbvD(3, -1)).toThrow(/steps/)
    expect(bbbvLowerBound(2)).toBe(0)
    expect(() => bbbvLowerBound(1)).toThrow()
  })
})

describe('grover: the book’s slips, computed (Corrections B18, B19, B20, Eq. 7.22)', () => {
  it('Eq. 7.15 (B18): the corrected right side matches Q|ψ⟩ exactly, the printed one misses (numpy: the matrix Q)', () => {
    for (const row of FX.slips.eq715) {
      const got = eq715Gaps(row.n, row.x0, row.c1, row.c2)
      close(got.printed, row.printed, 1e-9)
      expect(got.corrected, `n=${row.n}`).toBeLessThan(1e-12)
      expect(got.printed).toBeGreaterThan(0.1)
    }
  })
  it('the printed |x₀⊥⟩ (a plus sign) overlaps |x₀⟩ by 0.756 at N = 8; with the minus it is exactly orthogonal and unit length (B19)', () => {
    for (const row of FX.slips.perp) {
      const n = row.n
      if (n > 6) continue
      close(perpOverlap(n, 1, row.sign), row.overlap, 1e-9)
    }
    close(perpOverlap(3, 5, 1), 0.7559289460184544, 1e-12)
    expect(perpOverlap(3, 5, -1)).toBeLessThan(1e-12)
  })
  it('−U_f is not −(I − 2|w₀⟩⟨w₀|) (B19): they differ by 1.75 in the biggest entry at N = 8', () => {
    for (const row of FX.slips.minusUf) close(minusUfVersusUw0(row.n, 1), row.gap, 1e-12)
    close(minusUfVersusUw0(3, 5), 1.75, 1e-12)
  })
  it('cos α = √(1 − 1/N) from the engine’s own vectors, not √(1 − 1/√N) (B20)', () => {
    for (const row of FX.slips.cosAlpha) {
      if (row.N > 64) continue
      const n = Math.log2(row.N)
      const got = cosAlphaMeasured(n, 1)
      close(got.measured, row.overlapWith, 1e-12)
      close(got.measured, row.correct, 1e-12)
      close(got.printed, row.printed, 1e-12)
      if (row.N <= 32) expect(Math.abs(got.measured - got.printed), `N=${row.N}`).toBeGreaterThan(0.05)
    }
  })
  it('the miss chance at k* is O(1/N) in total and O(1/N²) per wrong string (B20): total = (N − 1) × per-item, ≤ 1/N', () => {
    for (const row of FX.slips.miss) {
      const m = missChances(row.n, 1, row.k)
      close(m.total, row.total, 1e-9)
      close(m.perItem, row.perItem, 1e-9)
      close(m.bound, row.bound)
      expect(m.total).toBeLessThanOrEqual(m.bound + 1e-12)
      close(m.total, (2 ** row.n - 1) * m.perItem, 1e-12)
    }
    const m8 = missChances(3, 5, 2)
    close(m8.total, 0.0546875, 1e-12)
    close(m8.perItem, 1 / 128, 1e-12)
  })
})
