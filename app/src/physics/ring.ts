/**
 * The discrete shifts of Lecture 13: the cyclic shift of n sites (T|j⟩ = |j + 1 mod n⟩, Go deeper 1 of Unit 13.3), whose eigenvectors the discrete
 * Fourier matrix of qc/fourier.ts supplies, and the trace of a commutator (Go deeper 2 of Unit 13.5). Pure complex linear algebra on the `Mat` of
 * linalg.ts. The numpy twins (pipeline/make_fixtures.py `lecture13_cases`) use np.roll, np.linalg.eig and np.trace.
 */
import { type C, abs, add, arg, c, sub } from './complex'
import { type Mat, dagger, identity, matmul, maxDiff } from './linalg'
import { dftMatrix } from './qc/fourier'

/** The cyclic shift on n sites: column j has a single 1, in row (j + 1) mod n. */
export function ringShift(n: number): Mat {
  if (!Number.isInteger(n) || n < 2) throw new Error('ringShift: n must be a whole number ≥ 2')
  return Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => (i === (j + 1) % n ? c(1) : c(0))))
}

/** F†TF where F is the n-point Fourier matrix: the shift written in the Fourier basis (diagonal when the columns of F are its eigenvectors). */
export function ringInFourierBasis(n: number): Mat {
  const F = dftMatrix(n)
  return matmul(dagger(F), matmul(ringShift(n), F))
}

/** The eigenphases of the shift in degrees, one for each Fourier column m = 0 … n − 1: the phase of (F†TF)_mm, in (−180, 180]. The exact values are −360m/n. */
export function ringEigenphases(n: number): number[] {
  const D = ringInFourierBasis(n)
  return D.map((row, m) => (arg(row[m]) * 180) / Math.PI)
}

/** The largest size of an entry of F†TF off its diagonal (0: the Fourier columns are eigenvectors of the shift). */
export function ringOffDiagonal(n: number): number {
  const D = ringInFourierBasis(n)
  let m = 0
  D.forEach((row, i) =>
    row.forEach((z, j) => {
      if (i !== j) m = Math.max(m, abs(z))
    }),
  )
  return m
}

/** The largest entry of T†T − I in size (0: the shift is unitary). */
export function ringUnitaryGap(n: number): number {
  return maxDiff(matmul(dagger(ringShift(n)), ringShift(n)), identity(n))
}

/** tr(XP − PX): zero for every pair of finite square matrices, so none satisfy XP − PX = iħI (whose trace is n·iħ). */
export function traceCommutator(X: Mat, P: Mat): C {
  const XP = matmul(X, P)
  const PX = matmul(P, X)
  let t = c(0)
  for (let i = 0; i < X.length; i++) t = add(t, sub(XP[i][i], PX[i][i]))
  return t
}
