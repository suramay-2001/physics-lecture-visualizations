/**
 * Angular momentum of any spin j = 1/2 .. 2 (Physics 448 Townsend pass, G2b; Townsend Ch. 3), ħ = 1.
 *
 * Basis: |j, m⟩ with m running DOWN from +j to −j, so the first row and column are m = +j (Townsend's order for spin 1: |1,1⟩, |1,0⟩, |1,−1⟩;
 * his Eq. 3.28). Every matrix is built from the raising coefficient √(j(j+1) − m(m+1)) (Eq. 3.59), never typed. Angles in the axis
 * specs are DEGREES (polar from +z, azimuth from +x); `rotJ` takes the turn in RADIANS. The numpy twin is pipeline/claims_448/g2b.py.
 */
import { c, abs2 } from './complex'
import { type Mat, type Vec, dagger, madd, matmul, mscale, msub } from './linalg'
import { eigh, expmHermitian, zeros } from './qc/cmat'

export const J_VALUES = [0.5, 1, 1.5, 2] as const
export type JValue = (typeof J_VALUES)[number]
export type AxisName = 'x' | 'y' | 'z'
/** A direction: a coordinate axis, or polar and azimuth angles in degrees. */
export type AxisSpec = AxisName | { thetaDeg: number; phiDeg: number }
export type Triple = [number, number, number]

const DEG = Math.PI / 180

/** 2j + 1, the number of levels. */
export const levelCount = (j: number): number => Math.round(2 * j + 1)
/** m = j, j − 1, …, −j (Eq. 3.53). */
export const mLevels = (j: number): number[] => Array.from({ length: levelCount(j) }, (_, k) => j - k)
/** The row (and column) of the level m in this basis. */
export const levelIndex = (j: number, m: number): number => Math.round(j - m)

/** The coefficient of J₊|j,m⟩ = c|j,m+1⟩ (dir '+', Eq. 3.59) or J₋|j,m⟩ = c|j,m−1⟩ (dir '−', Eq. 3.60), in units of ħ. */
export const ladderCoeff = (j: number, m: number, dir: '+' | '-'): number => Math.sqrt(Math.max(0, j * (j + 1) - m * (m + (dir === '+' ? 1 : -1))))

export interface JMatrices {
  Jx: Mat
  Jy: Mat
  Jz: Mat
  Jp: Mat
  Jm: Mat
  J2: Mat
}

/** The matrices of J_x, J_y, J_z, J₊, J₋ and J² for spin j: J₊ from the coefficient, J₋ its adjoint, J_x = (J₊ + J₋)/2, J_y = (J₊ − J₋)/2i. */
export function jMatrices(j: number): JMatrices {
  const n = levelCount(j)
  const ms = mLevels(j)
  const Jp = zeros(n)
  for (let k = 1; k < n; k++) Jp[k - 1][k] = c(ladderCoeff(j, ms[k], '+'))
  const Jm = dagger(Jp)
  const Jx = mscale(madd(Jp, Jm), 0.5)
  const Jy = mscale(msub(Jp, Jm), c(0, -0.5))
  const Jz = zeros(n)
  ms.forEach((m, k) => (Jz[k][k] = c(m)))
  const J2 = madd(madd(matmul(Jx, Jx), matmul(Jy, Jy)), matmul(Jz, Jz))
  return { Jx, Jy, Jz, Jp, Jm, J2 }
}

/** The unit vector of an axis spec. */
export function axisVec(a: AxisSpec): Triple {
  if (a === 'x') return [1, 0, 0]
  if (a === 'y') return [0, 1, 0]
  if (a === 'z') return [0, 0, 1]
  const t = a.thetaDeg * DEG
  const p = a.phiDeg * DEG
  return [Math.sin(t) * Math.cos(p), Math.sin(t) * Math.sin(p), Math.cos(t)]
}

/** J·n for spin j (Eq. 3.125). */
export function jAlong(j: number, axis: AxisSpec): Mat {
  const { Jx, Jy, Jz } = jMatrices(j)
  const [nx, ny, nz] = axisVec(axis)
  return madd(madd(mscale(Jx, nx), mscale(Jy, ny)), mscale(Jz, nz))
}

/** R(t n) = e^{−i t J·n} for spin j, t in radians (Eq. 3.10). */
export const rotJ = (j: number, axis: AxisSpec, t: number): Mat => expmHermitian(jAlong(j, axis), t)

/** The eigenket |j, m⟩ of J·n in the z basis (first non-negligible component real and positive). */
export function eigAlong(j: number, axis: AxisSpec, m: number): Vec {
  const { values, vectors } = eigh(jAlong(j, axis))
  let best = 0
  values.forEach((v, k) => {
    if (Math.abs(v - m) < Math.abs(values[best] - m)) best = k
  })
  if (Math.abs(values[best] - m) > 1e-9) throw new Error(`eigAlong: ${m} is not an eigenvalue of J·n for j = ${j}`)
  return vectors[best]
}

/** The chances of the levels m = j, …, −j of an SGz for the beam |j, m⟩ along `axis` (the squared sizes of its column). */
export const zChances = (j: number, axis: AxisSpec, m: number): number[] => eigAlong(j, axis, m).map(abs2)

/** |J| = √(j(j+1)) in units of ħ (Eq. 3.54). */
export const jLength = (j: number): number => Math.sqrt(j * (j + 1))
/** The cone angle arccos(m/|J|) in radians: the angle a vector of length |J| with projection m would make with z (Townsend Fig. 3.4; a picture of |J| and J_z only). */
export const coneAngle = (j: number, m: number): number => Math.acos(m / jLength(j))

/** The ordinary 3 x 3 rotation of a vector by phi (radians) about a coordinate axis, counterclockwise seen from +axis (Eqs. 3.3, 3.5, 3.7). */
export function rot3(axis: AxisName, phi: number): number[][] {
  const cs = Math.cos(phi)
  const sn = Math.sin(phi)
  if (axis === 'z') return [[cs, -sn, 0], [sn, cs, 0], [0, 0, 1]]
  if (axis === 'x') return [[1, 0, 0], [0, cs, -sn], [0, sn, cs]]
  return [[cs, 0, sn], [0, 1, 0], [-sn, 0, cs]]
}
