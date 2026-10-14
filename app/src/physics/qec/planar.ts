/**
 * The unrotated planar surface code and the size arithmetic of surface-code patches (P-B1-story §9.1, Rof19 §5). The planar code is the hypergraph
 * product of two open repetition codes: d² + (d−1)² data qubits, d(d−1) checks of each type, k = 1, distance d. The rotated patch (codes.ts
 * `rotatedSurfaceCode`) turns it by 45° and needs d² data qubits and d² − 1 checks. Numpy twin: pipeline/qec_numpy.py `planar_unrotated`.
 */
import { GF2Matrix } from './gf2'
import { CSSCode } from './codes'

export interface PlanarSurface {
  d: number
  n: number
  code: CSSCode
}

/** The (d−1) × d parity-check matrix of the open repetition code of length d. */
function openRepetition(d: number): GF2Matrix {
  return GF2Matrix.fromSupports(Array.from({ length: d - 1 }, (_, i) => [i, i + 1]), d)
}

export function planarSurfaceCode(d: number): PlanarSurface {
  if (!Number.isInteger(d) || d < 2 || d > 9) throw new Error('planarSurfaceCode: d must be a whole number from 2 to 9')
  const H = openRepetition(d)
  const r = d - 1
  const In = GF2Matrix.identity(d)
  const Ir = GF2Matrix.identity(r)
  const HX = H.kron(In).hstack(Ir.kron(H.transpose()))
  const HZ = In.kron(H).hstack(H.transpose().kron(Ir))
  return { d, n: HX.cols, code: new CSSCode(HX, HZ, `planar surface code d = ${d}`) }
}

export interface SurfaceSizes {
  d: number
  rotated: { data: number; checks: number; total: number }
  unrotated: { data: number; checks: number; total: number }
  /** unrotated total / rotated total */
  ratio: number
}

/** Qubit counts of the two layouts at odd distance d (formulas; planar.test.ts checks them against the built codes). */
export function surfaceSizes(d: number): SurfaceSizes {
  if (!Number.isInteger(d) || d < 3 || d % 2 === 0) throw new Error('surfaceSizes: d must be an odd whole number ≥ 3')
  const rotated = { data: d * d, checks: d * d - 1, total: 2 * d * d - 1 }
  const data = d * d + (d - 1) * (d - 1)
  const checks = 2 * d * (d - 1)
  const unrotated = { data, checks, total: data + checks }
  return { d, rotated, unrotated, ratio: unrotated.total / rotated.total }
}
