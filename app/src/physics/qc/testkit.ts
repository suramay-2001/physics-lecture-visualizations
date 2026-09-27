/**
 * Test support for physics/qc (imported by *.test.ts only, never by the app): the numpy fixture
 * (pipeline/make_qc_fixtures.py → __fixtures__/qc.json, loaded as text so tsc does not type a 450 KB literal) and
 * converters from its [re, im] encoding. Pure: no test-runner import, so the purity rule holds here too.
 */
import raw from '../__fixtures__/qc.json?raw'
import { type C, c } from '../complex'
import { type Mat, type Vec, maxDiff } from '../linalg'

/** The parsed fixture; blocks: cmat, state, gates, circuit, measure, density, bits, complex (see the generator). */
export const FX: any = JSON.parse(raw)

export type Pair = [number, number]
export const cz = (p: Pair): C => c(p[0], p[1])
export const cv = (v: Pair[]): Vec => v.map(cz)
export const cm = (m: Pair[][]): Mat => m.map((row) => row.map(cz))

/** The largest entry-wise gap between two vectors. */
export const vecGap = (a: Vec, b: Vec): number => (a.length !== b.length ? Infinity : Math.max(0, ...a.map((x, i) => Math.hypot(x.re - b[i].re, x.im - b[i].im))))
/** The largest entry-wise gap between two matrices (Infinity when the shapes differ). */
export const matGap = (A: Mat, B: Mat): number =>
  A.length !== B.length || A.some((row, i) => row.length !== B[i].length) ? Infinity : maxDiff(A, B)
/** |⟨a|b⟩| for unit vectors: 1 when they are the same state up to a global phase. */
export function overlap(a: Vec, b: Vec): number {
  let re = 0
  let im = 0
  a.forEach((x, i) => {
    re += x.re * b[i].re + x.im * b[i].im
    im += x.re * b[i].im - x.im * b[i].re
  })
  return Math.hypot(re, im)
}

/** The deterministic Hermitian test matrix that make_qc_fixtures.py `formula_hermitian` also builds. */
export function formulaHermitian(n: number): Mat {
  const A = (j: number, k: number): C => c(Math.sin(0.37 * (j + 1) * (k + 2) + 0.11 * j), Math.cos(0.23 * (j + 2) * (k + 1) - 0.05 * k))
  return Array.from({ length: n }, (_, j) =>
    Array.from({ length: n }, (_, k) => {
      const a = A(j, k)
      const b = A(k, j)
      return c((a.re + b.re) / 2, (a.im - b.im) / 2)
    }),
  )
}
