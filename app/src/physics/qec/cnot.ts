/**
 * A CNOT from three Pauli measurements (Chapter B3, unit b3-surgery; the idea of Horsman, Fowler, Devitt & Van Meter 2012, arXiv:1111.4022 §4.1 and Fig. 7, written here as three
 * product measurements with a final readout of the helper). Wires: control c, helper a (starts in |+⟩), target t. Measure
 *   Z_c Z_a  (outcome m1),   X_a X_t  (outcome m2),   Z_a  (outcome m3)
 * (outcome bit 0 means +1, 1 means −1). The helper is then in |m3⟩ and the control and target are left in
 *   M_m = ⟨m3|_a Π_{Z_a}^{m3} Π_{X_aX_t}^{m2} Π_{Z_cZ_a}^{m1} |+⟩_a  =  (1/(2√2)) · Z_c^{[m2 = 1]} X_t^{[m1 ⊕ m3 = 1]} · CNOT   (up to a global sign),
 * so every one of the 8 outcome triples has chance 1/8 for every input, and a Pauli fix chosen from the outcomes finishes the CNOT. All amplitudes are real (only X and Z letters occur),
 * so the dense 8-dimensional work is done with plain numbers. Pure TypeScript.
 */

export type Bit = 0 | 1
export type Triple = readonly [Bit, Bit, Bit]

/** Basis index of (c, a, t) with c the most significant bit, as everywhere in the engine. */
const idx3 = (c: number, a: number, t: number): number => c * 4 + a * 2 + t

/** Apply a Pauli string over the wires (c, a, t) made of I, X, Z only. */
function applyString(v: readonly number[], s: string): number[] {
  const out = new Array<number>(8).fill(0)
  for (let i = 0; i < 8; i++) {
    let j = i
    let sign = 1
    for (let w = 0; w < 3; w++) {
      const bit = (i >> (2 - w)) & 1
      if (s[w] === 'X') j ^= 1 << (2 - w)
      else if (s[w] === 'Z' && bit) sign = -sign
    }
    out[j] += sign * v[i]
  }
  return out
}

const project = (v: readonly number[], s: string, bit: Bit): number[] => {
  const pv = applyString(v, s)
  const sgn = bit ? -1 : 1
  return v.map((x, i) => 0.5 * (x + sgn * pv[i]))
}

/** All 8 outcome triples in the order m1, m2, m3 = 000, 001, …, 111. */
export const TRIPLES: readonly Triple[] = Array.from({ length: 8 }, (_, i) => [(i >> 2) & 1, (i >> 1) & 1, i & 1] as unknown as Triple)

/** The 4 × 4 Kraus matrix M_m on (control, target), basis order 00, 01, 10, 11 (rows = output). */
export function kraus(m: Triple): number[][] {
  const cols: number[][] = []
  for (let b = 0; b < 4; b++) {
    const c = b >> 1
    const t = b & 1
    // |c⟩|+⟩_a|t⟩
    let v = new Array<number>(8).fill(0)
    v[idx3(c, 0, t)] = Math.SQRT1_2
    v[idx3(c, 1, t)] = Math.SQRT1_2
    v = project(v, 'ZZI', m[0])
    v = project(v, 'IXX', m[1])
    v = project(v, 'IZI', m[2])
    cols.push([0, 1, 2, 3].map((r) => v[idx3(r >> 1, m[2], r & 1)]))
  }
  return [0, 1, 2, 3].map((r) => cols.map((col) => col[r]))
}

export const CNOT4: readonly (readonly number[])[] = [
  [1, 0, 0, 0],
  [0, 1, 0, 0],
  [0, 0, 0, 1],
  [0, 0, 1, 0],
]

/** The Pauli fix the outcomes call for: Z on the control when m2 = 1, X on the target when m1 ⊕ m3 = 1. */
export const fixOf = (m: Triple): { z: Bit; x: Bit } => ({ z: m[1], x: (m[0] ^ m[2]) as Bit })

/** Apply Z_c^z X_t^x to a 4-vector over (c, t). */
export function applyFix(v: readonly number[], fix: { z: Bit; x: Bit }): number[] {
  const out = new Array<number>(4).fill(0)
  for (let b = 0; b < 4; b++) {
    const c = b >> 1
    const t = (b & 1) ^ fix.x
    out[c * 2 + t] += (fix.z && c ? -1 : 1) * v[b]
  }
  return out
}

const matVec = (M: readonly (readonly number[])[], v: readonly number[]): number[] => M.map((row) => row.reduce((s, x, j) => s + x * v[j], 0))
const normSq = (v: readonly number[]): number => v.reduce((s, x) => s + x * x, 0)

export interface CnotBranch {
  triple: Triple
  /** M_m, the operator the three measurements apply to (control, target). */
  kraus: number[][]
  fix: { z: Bit; x: Bit }
  /** √8 · M_m equals ± Z_c^z X_t^x · CNOT entry by entry. */
  matchesCnot: boolean
  /** Chance of this triple for the given input (1/8 for every normalised input). */
  chance: number
  /** The (control, target) state after the measurements, normalised, and after the fix; and CNOT applied to the input. */
  raw: number[]
  fixed: number[]
  expected: number[]
  /** The fixed output equals CNOT·input up to a global sign. */
  agrees: boolean
}

/** One outcome triple on a normalised real input over (c, t) (default |+⟩_c |0⟩_t). */
export function byMeasurement(m: Triple, input: readonly number[] = [Math.SQRT1_2, 0, Math.SQRT1_2, 0]): CnotBranch {
  const K = kraus(m)
  const fix = fixOf(m)
  const target = CNOT4.map((row) => row.map((x) => x)) // CNOT
  const fixedCnot = [0, 1, 2, 3].map((b) => applyFix(CNOT4.map((row) => row[b]), fix)) // columns of Z^z X^x CNOT
  const U = [0, 1, 2, 3].map((r) => fixedCnot.map((col) => col[r]))
  const scaled = K.map((row) => row.map((x) => x * Math.sqrt(8)))
  const sgnFor = (s: number): boolean => scaled.every((row, i) => row.every((x, j) => Math.abs(x - s * U[i][j]) < 1e-12))
  const matchesCnot = sgnFor(1) || sgnFor(-1)
  const out = matVec(K, input)
  const chance = normSq(out)
  const raw = chance > 0 ? out.map((x) => x / Math.sqrt(chance)) : out
  const fixed = applyFix(raw, fix)
  const expected = matVec(target, input)
  const agrees = fixed.every((x, i) => Math.abs(x - expected[i]) < 1e-12) || fixed.every((x, i) => Math.abs(x + expected[i]) < 1e-12)
  return { triple: m, kraus: K, fix, matchesCnot, chance, raw, fixed, expected, agrees }
}

export interface CnotCensus {
  /** Triples that need no fix, a Z on the control, an X on the target (out of 8). */
  noFix: number
  zFix: number
  xFix: number
  /** Every branch agrees with CNOT after its fix, and M†M = I/8 for every triple. */
  allAgree: boolean
  /** The chance of each triple for the input (all 1/8). */
  chances: number[]
}

export function fixCensus(input?: readonly number[]): CnotCensus {
  const branches = TRIPLES.map((t) => byMeasurement(t, input))
  const fixes = branches.map((b) => b.fix)
  const mtm = branches.every((b) => {
    // M†M = I/8: columns are orthogonal with squared length 1/8
    const K = b.kraus
    for (let i = 0; i < 4; i++)
      for (let j = 0; j < 4; j++) {
        const s = K.reduce((acc, row) => acc + row[i] * row[j], 0)
        if (Math.abs(s - (i === j ? 1 / 8 : 0)) > 1e-12) return false
      }
    return true
  })
  return {
    noFix: fixes.filter((f) => f.z === 0 && f.x === 0).length,
    zFix: fixes.filter((f) => f.z === 1).length,
    xFix: fixes.filter((f) => f.x === 1).length,
    allAgree: mtm && branches.every((b) => b.agrees && b.matchesCnot),
    chances: branches.map((b) => b.chance),
  }
}
