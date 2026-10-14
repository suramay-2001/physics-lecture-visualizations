/**
 * Families for the first unit of the background chapter B2 (plan P-B2-story §9.1, `b2-ldpc`): codes whose checks stay small as the code grows (the toric code) against codes whose
 * checks grow with it (the CSS codes of the Hamming codes, "quantum Hamming codes"), and the rate arithmetic of the surface code. Pure TypeScript.
 * Numpy twin: pipeline/make_bb2_fixtures.py (Hamming matrices from the binary expansion of 1 … n, the torus from its edge lattice).
 */
import { CSSCode } from './codes'
import { GF2Matrix } from './gf2'
import { toricCode } from './toric'

/** The r × (2^r − 1) parity-check matrix of the Hamming code: column j is the binary expansion of j + 1, most significant bit on top. */
export function hammingParity(r: number): GF2Matrix {
  if (!Number.isInteger(r) || r < 2 || r > 8) throw new Error('hammingParity: r must be a whole number from 2 to 8')
  const n = 2 ** r - 1
  return GF2Matrix.fromRows(Array.from({ length: r }, (_, i) => Array.from({ length: n }, (_, c) => ((c + 1) >> (r - 1 - i)) & 1)), n)
}

/** The CSS code with H_X = H_Z = the Hamming matrix (needs r ≥ 3 so that the rows are even and overlap evenly): [[2^r − 1, 2^r − 1 − 2r]]. */
export function quantumHamming(r: number): CSSCode {
  if (r < 3) throw new Error('quantumHamming: r must be at least 3 (for r = 2 the rows do not commute with themselves)')
  const H = hammingParity(r)
  return new CSSCode(H, H, `quantum Hamming r=${r}`)
}

export interface FamilyRow {
  n: number
  k: number
  checkWeight: number
  qubitDegree: number
}

export function hammingRow(r: number): FamilyRow {
  const c = quantumHamming(r)
  return { n: c.n, k: c.k, ...c.degrees() }
}

export function toricRow(L: number): FamilyRow {
  const t = toricCode(L)
  return { n: t.n, k: t.code.k, ...t.code.degrees() }
}

/** The rate k/n of the rotated surface-code patch of distance d (one logical qubit in d² data qubits). */
export const surfaceRate = (d: number): number => 1 / (d * d)

/** Data qubits of the rotated patch of distance d. */
export const surfaceData = (d: number): number => d * d

/** Data qubits of `count` separate patches of distance d. */
export const patchesData = (count: number, d: number): number => count * d * d
