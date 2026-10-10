/**
 * qc/fourier.ts against numpy (pipeline/make_numtheory_fixtures.py → __fixtures__/qc-numtheory.json: the matrices are numpy's `ifft(..., norm='ortho')`
 * of the identity (N&C's sign +), comb transforms and geometric sums are numpy sums, the Dirichlet kernel is the modulus of a numpy sum of unit
 * arrows, binary fractions are exact Fractions, continued fractions repeat x → 1/(x − floor x) on exact Fractions and the convergents are evaluated
 * from the nested form), plus properties: F_N is unitary for every N, F² reverses the places, F⁴ = I, a shift only turns the spikes, Parseval,
 * a comb of step r | N goes to spikes N/r apart, D_M ≥ 2/π on |δ| ≤ 1/(2M), doubling a binary fraction drops its first digit.
 */
import { describe, expect, it } from 'vitest'
import raw from '../__fixtures__/qc-numtheory.json?raw'
import { type C, abs, abs2, c, expi, mul } from '../complex'
import { type Vec, apply, dagger, identity, isUnitary, matmul, maxDiff, norm } from '../linalg'
import { binaryFraction, chord, comb, continuedFraction, convergents, dft, dftMatrix, dirichlet, geometricSum, geometricSumDirect, orderFromPeak, peakSuccesses } from './fourier'
import { gcd, multOrder } from './numtheory'
import { ket } from './state'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const FX: any = JSON.parse(raw)
const cz = (p: [number, number]): C => c(p[0], p[1])
const cv = (v: [number, number][]): Vec => v.map(cz)
const vecGap = (a: Vec, b: Vec): number => Math.max(0, ...a.map((x, i) => abs({ re: x.re - b[i].re, im: x.im - b[i].im })))
const close = (a: number, b: number, eps = 1e-12) => expect(Math.abs(a - b), `${a} ≈ ${b}`).toBeLessThan(eps)

describe('fourier: the matrix F_N (sign +, N&C Eq. 5.1)', () => {
  it('matches numpy’s ifft(…, norm="ortho") of the identity for N = 1, 2, 3, 4, 5, 6, 8, 12', () => {
    for (const [N, rows] of Object.entries(FX.dft as Record<string, [number, number][][]>)) {
      const F = dftMatrix(Number(N))
      const want = rows.map((row) => cv(row))
      expect(maxDiff(F, want), `N = ${N}`).toBeLessThan(1e-13)
    }
  })
  it('the sign is + : (F_8)₁₁ = 0.25 + 0.25i and (F_8)₀₀ = 0.3536 (the claims of the story), and F is the conjugate of numpy’s fft', () => {
    const F = dftMatrix(8)
    close(F[1][1].re, 0.25)
    close(F[1][1].im, 0.25)
    close(F[0][0].re, 1 / Math.sqrt(8))
    // the first row and column are all 1/√N; F is symmetric
    for (let k = 0; k < 8; k++) {
      close(F[0][k].re, 1 / Math.sqrt(8))
      close(F[k][0].re, 1 / Math.sqrt(8))
      for (let j = 0; j < 8; j++) expect(abs({ re: F[k][j].re - F[j][k].re, im: F[k][j].im - F[j][k].im })).toBeLessThan(1e-15)
    }
    // the sign: row 1 turns by +45° per step (numpy's fft would turn by −45°)
    expect(F[1][1].im).toBeGreaterThan(0)
    expect(F[1][2].re).toBeCloseTo(0, 12)
    expect(F[1][2].im).toBeCloseTo(1 / Math.sqrt(8), 12)
  })
  it('property: F_N is unitary for every N from 1 to 16 (N&C Ex. 5.1)', () => {
    for (let N = 1; N <= 16; N++) {
      const F = dftMatrix(N)
      expect(isUnitary(F, 1e-12), `N = ${N}`).toBe(true)
      expect(maxDiff(matmul(dagger(F), F), identity(N))).toBeLessThan(1e-13)
    }
  })
  it('property: F² sends place j to −j (mod N) and F⁴ = I; the inverse is F†, which turns the other way', () => {
    for (const N of [4, 5, 8]) {
      const F = dftMatrix(N)
      const F2 = matmul(F, F)
      for (let j = 0; j < N; j++) for (let k = 0; k < N; k++) close(abs(F2[k][j]), k === (N - j) % N ? 1 : 0, 1e-12)
      expect(maxDiff(matmul(F2, F2), identity(N))).toBeLessThan(1e-12)
      expect(maxDiff(dagger(F), F.map((row) => row.map((z) => c(z.re, -z.im))))).toBeLessThan(1e-15)
    }
  })
})

describe('fourier: the transform of a list', () => {
  it('dft matches numpy on a list of awkward numbers and equals F·v', () => {
    for (const [N, io] of Object.entries(FX.dftVec as Record<string, { in: [number, number][]; out: [number, number][] }>)) {
      const v = cv(io.in)
      expect(vecGap(dft(v), cv(io.out)), `N = ${N}`).toBeLessThan(1e-12)
      expect(vecGap(dft(v), apply(dftMatrix(Number(N)), v))).toBeLessThan(1e-12)
    }
  })
  it('property: Parseval, the transform keeps the length', () => {
    const v = Array.from({ length: 16 }, (_, j) => c(Math.sin(1.3 * j + 0.2), Math.cos(0.7 * j * j)))
    close(norm(dft(v)), norm(v), 1e-12)
  })
  it('a comb of step r goes to spikes N/r apart (D6): 2 in 8 → 0.7071 at 0 and 4; 4 in 8 → 0.5 at 0, 2, 4, 6', () => {
    for (const [key, io] of Object.entries(FX.comb as Record<string, { vec: [number, number][]; dft: [number, number][] }>)) {
      const [N, r, s] = key.split(',').map(Number)
      expect(vecGap(comb(N, r, s), cv(io.vec)), key).toBeLessThan(1e-14)
      expect(vecGap(dft(comb(N, r, s)), cv(io.dft)), key).toBeLessThan(1e-12)
    }
    const two = dft(comb(8, 2))
    two.forEach((z, k) => close(abs(z), k === 0 || k === 4 ? Math.SQRT1_2 : 0, 1e-12))
    const four = dft(comb(8, 4))
    four.forEach((z, k) => close(abs(z), k % 2 === 0 ? 0.5 : 0, 1e-12))
    // the engine's comb is the state ket('++0') and ket('+00') of the stage
    expect(vecGap(comb(8, 2), ket('++0'))).toBeLessThan(1e-14)
    expect(vecGap(comb(8, 4), ket('+00'))).toBeLessThan(1e-14)
    expect(vecGap(comb(8, 2, 1), ket('++1'))).toBeLessThan(1e-14)
  })
  it('property: every r | N sends the comb to spikes 1/√r high at the multiples of N/r', () => {
    for (const N of [4, 6, 8, 12, 16, 32])
      for (let r = 1; r <= N; r++) {
        if (N % r !== 0) continue
        const out = dft(comb(N, r))
        out.forEach((z, k) => close(abs(z), k % (N / r) === 0 ? 1 / Math.sqrt(r) : 0, 1e-12))
      }
  })
  it('a shift only turns the spikes: the comb {1, 3, 5, 7} has the same sizes and ĉ₄ = −0.7071 (D6)', () => {
    const base = dft(comb(8, 2, 0))
    const shifted = dft(comb(8, 2, 1))
    shifted.forEach((z, k) => close(abs(z), abs(base[k]), 1e-12))
    close(shifted[0].re, Math.SQRT1_2)
    close(shifted[4].re, -Math.SQRT1_2)
    close(shifted[4].im, 0)
  })
  it('property: shifting c_j → c_{j−s} multiplies ĉ_k by ω^{sk}', () => {
    const N = 8
    const v = Array.from({ length: N }, (_, j) => c(Math.cos(2 * j + 1), Math.sin(j * 0.7)))
    const base = dft(v)
    for (const s of [1, 3, 5]) {
      const moved = v.map((_, j) => v[(j - s + N) % N])
      const got = dft(moved)
      got.forEach((z, k) => {
        const want = mul(base[k], expi((2 * Math.PI * s * k) / N))
        close(z.re, want.re, 1e-12)
        close(z.im, want.im, 1e-12)
      })
    }
  })
  it('a comb whose step does not divide N leaks: step 3 in 8 has chances 0.375 at 0, 0.2429 at 3 and 5 (the story’s reveal)', () => {
    const v = Array.from({ length: 8 }, (_, j) => (j % 3 === 0 ? c(1 / Math.sqrt(3)) : c(0)))
    const q = dft(v).map(abs2)
    close(q[0], 0.375, 1e-4)
    close(q[3], 0.24289, 1e-4)
    close(q[5], 0.24289, 1e-4)
    close(q.reduce((a, b) => a + b, 0), 1, 1e-12)
  })
})

describe('fourier: geometric sums, the chord and the kernel D_M', () => {
  it('geometricSum (closed form) matches numpy’s sum of powers and the engine’s own term-by-term sum', () => {
    for (const [u, M, want] of FX.geom as [[number, number], number, [number, number]][]) {
      const z = cz(u)
      const w = cz(want)
      expect(abs({ re: geometricSum(z, M).re - w.re, im: geometricSum(z, M).im - w.im }), `${u} ${M}`).toBeLessThan(1e-11)
      expect(abs({ re: geometricSumDirect(z, M).re - w.re, im: geometricSumDirect(z, M).im - w.im })).toBeLessThan(1e-11)
    }
    close(geometricSum(c(0.5), 4).re, 1.875)
    close(geometricSum(c(1), 7).re, 7)
  })
  it('the chord is 2 sin(θ/2): 1 at 60°, √2 at 90°, 0.9589 at 1 radian, and equals numpy’s |1 − e^{iθ}|', () => {
    for (const [t, want] of Object.entries(FX.chord as Record<string, number>)) close(chord(Number(t)), want, 1e-12)
    close(chord(Math.PI / 3), 1)
    close(chord(Math.PI / 2), Math.SQRT2)
    close(chord(1), 0.9589, 1e-4)
    // the bounds of the story: 2θ/π ≤ chord ≤ θ for 0 ≤ θ ≤ π
    for (let t = 0.05; t <= Math.PI; t += 0.05) {
      expect(chord(t)).toBeGreaterThanOrEqual((2 * t) / Math.PI - 1e-12)
      expect(chord(t)).toBeLessThanOrEqual(t + 1e-12)
    }
  })
  it('dirichlet matches the modulus of a numpy sum of unit arrows, at the awkward points too (δ whole, δ = 1/M)', () => {
    for (const [key, want] of Object.entries(FX.dirichlet as Record<string, number>)) {
      const [M, delta] = key.split(',').map(Number)
      close(dirichlet(M, delta), want, 1e-12)
    }
    close(dirichlet(8, 0), 1)
    close(dirichlet(8, 0.125), 0, 1e-12)
    close(dirichlet(8, 1 / 16), 0.6407, 1e-4)
    close(dirichlet(64, 1 / 128), 0.63668, 1e-5)
  })
  it('property (D7): D_M(δ) ≥ 2/π whenever |δ| ≤ 1/(2M), for every M up to 200, and the worst case tends to 2/π from above', () => {
    for (let M = 1; M <= 200; M++) {
      for (let k = -50; k <= 50; k++) expect(dirichlet(M, k / (100 * M))).toBeGreaterThanOrEqual(2 / Math.PI - 1e-12)
      expect(dirichlet(M, 1 / (2 * M))).toBeGreaterThan(2 / Math.PI)
    }
    for (const [M, want] of Object.entries(FX.dirichletMin as Record<string, number>)) close(dirichlet(Number(M), 1 / (2 * Number(M))), want, 1e-6)
    expect(dirichlet(8, 1 / 16) ** 2).toBeGreaterThan(4 / Math.PI ** 2)
    expect(dirichlet(1000, 1 / 2000) - 2 / Math.PI).toBeLessThan(1e-5)
  })
  it('D_M at the full-step zero: M arrows each 1/M of a turn further close up', () => {
    for (const M of [2, 3, 8, 64]) close(dirichlet(M, 1 / M), 0, 1e-12)
  })
  it('a comb of A teeth has |ĉ_k| = √(A/N)·D_A(rk/N) (the story’s link between the kernel and the leak)', () => {
    const N = 8
    const r = 3
    const teeth = 3 // places 0, 3, 6
    const v = Array.from({ length: N }, (_, j) => (j % r === 0 ? c(1 / Math.sqrt(teeth)) : c(0)))
    const out = dft(v)
    out.forEach((z, k) => close(abs(z), Math.sqrt(teeth / N) * dirichlet(teeth, (r * k) / N), 1e-12))
  })
})

describe('fourier: binary and continued fractions', () => {
  it('binaryFraction matches exact Fractions', () => {
    for (const [s, want] of Object.entries(FX.binary as Record<string, number>)) close(binaryFraction(s), want, 1e-15)
    expect(binaryFraction('101')).toBe(0.625)
    expect(() => binaryFraction('102')).toThrow()
  })
  it('doubling drops the leading digit: frac(2·0.d₁d₂…d_m) = 0.d₂…d_m, so e^{2πi·2x} = e^{2πi·0.d₂…} (D8)', () => {
    for (const bits of ['101', '011', '1101', '0011', '111']) {
      const x = binaryFraction(bits)
      const doubled = (2 * x) % 1
      close(doubled, binaryFraction(bits.slice(1)), 1e-15)
      const a = expi(2 * Math.PI * 2 * x)
      const b = expi(2 * Math.PI * binaryFraction(bits.slice(1)))
      close(a.re, b.re, 1e-12)
      close(a.im, b.im, 1e-12)
    }
    // the story: 0.101 is 225°, doubled it is 0.01, 90°
    close(binaryFraction('101') * 360, 225)
    close(binaryFraction('01') * 360, 90)
  })
  it('continuedFraction and convergents match the exact-Fraction evaluation, including 5/32 = [0; 6, 2, 2] and 11/32 = [0; 2, 1, 10]', () => {
    for (const [key, want] of Object.entries(FX.cf as Record<string, { cf: number[]; convergents: number[][] }>)) {
      const [p, q] = key.split(',').map(Number)
      const cf = continuedFraction(p, q)
      expect(cf, key).toEqual(want.cf)
      expect(convergents(cf).map((x) => [x.p, x.q]), key).toEqual(want.convergents)
    }
    expect(continuedFraction(5, 32)).toEqual([0, 6, 2, 2])
    expect(convergents([0, 6, 2, 2])).toEqual([
      { p: 0, q: 1 },
      { p: 1, q: 6 },
      { p: 2, q: 13 },
      { p: 5, q: 32 },
    ])
  })
  it('property: the last convergent is p/q itself, in lowest terms; each earlier one is within 1/q_l² of it', () => {
    for (let q = 1; q <= 40; q++)
      for (let p = 0; p <= 2 * q; p++) {
        const conv = convergents(continuedFraction(p, q))
        const last = conv[conv.length - 1]
        const g = gcd(p, q)
        expect([last.p, last.q]).toEqual([p / g, q / g])
        for (const cn of conv) expect(Math.abs(p / q - cn.p / cn.q)).toBeLessThan(1 / (cn.q * cn.q) + 1e-12)
      }
  })
})

describe('fourier: reading the order off a peak (N&C Thm A4.16)', () => {
  it('orderFromPeak matches the Python scan: bars 5 and 27 of a 32-point transform return 6, the others do not', () => {
    for (const [key, want] of Object.entries(FX.peak as Record<string, number | null>)) {
      const [y, m, x, N] = key.split(',').map(Number)
      expect(orderFromPeak(y, m, x, N), key).toBe(want)
    }
    expect(orderFromPeak(5, 5, 2, 21)).toBe(6)
    expect(orderFromPeak(27, 5, 2, 21)).toBe(6)
    expect(orderFromPeak(11, 5, 2, 21)).toBeNull() // 11/32 → 1/3, and 2³ = 8 ≠ 1
    expect(orderFromPeak(16, 5, 2, 21)).toBeNull() // 16/32 = 1/2, 2² = 4
  })
  it('peakSuccesses is the whole set, for several (m, x, N)', () => {
    for (const [key, want] of Object.entries(FX.success as Record<string, number[]>)) {
      const [m, x, N] = key.split(',').map(Number)
      expect(peakSuccesses(m, x, N), key).toEqual(want)
    }
    expect(peakSuccesses(5, 2, 21)).toEqual([5, 27])
    expect(peakSuccesses(5, 3, 21)).toEqual([]) // 3 has no order mod 21
  })
  it('the chance of the success set for the comb that starts at 0 (5 qubits: 0.2336) matches numpy; with more qubits it climbs', () => {
    for (const [key, want] of Object.entries(FX.successChance as Record<string, number>)) {
      const [m, x, N] = key.split(',').map(Number)
      const r = multOrder(x, N)!
      const probs = dft(comb(2 ** m, r, 0)).map(abs2)
      const got = peakSuccesses(m, x, N).reduce((a, y) => a + probs[y], 0)
      close(got, want, 1e-12)
    }
  })
  it('the check of the story: |5/32 − 1/6| = 0.0104 ≤ 1/(2·6²) = 0.0139', () => {
    expect(Math.abs(5 / 32 - 1 / 6)).toBeLessThan(1 / (2 * 36))
    close(Math.abs(5 / 32 - 1 / 6), 0.0104, 1e-4)
    close(1 / 72, 0.0139, 1e-4)
  })
  it('refuses a place outside the transform', () => {
    expect(() => orderFromPeak(32, 5, 2, 21)).toThrow()
    expect(() => orderFromPeak(-1, 5, 2, 21)).toThrow()
  })
})
