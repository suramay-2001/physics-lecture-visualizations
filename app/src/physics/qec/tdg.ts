/**
 * Tour de gross (paper-tdg, arXiv:2506.03094) arithmetic and structures for the lecture P1 (rulings papers-P1.md R7, R8): the machine's qubit count (Eq. 25), the
 * fabrication-yield arithmetic, the instruction durations, the cultivation mean time, the failure-spectrum sum (Eqs. 82-83), the TFIM bill (Eq. 26), the surface-code
 * comparison (Eqs. 89 and 96), the code family, the LPU graph of the paper's App. A.3, the native-measurement sets (Eqs. 14-15), the shift-block check (App. A.2) and the
 * way a long Pauli is distributed over modules (Eq. 5). Everything here is computed from the paper's PRINTED inputs, which are collected below and used as given:
 * a printed input is never presented as a result of this file. Numpy twin: pipeline/tdg_numpy.py (a different route: exact integers, fractions, dense pairing).
 * Pure: no clock, no randomness (purity.test.ts).
 */
import { GF2Matrix } from './gf2'
import { bbCodeOf, bbShiftSummary, logicalShiftMatrix } from './bbfamily'
import { BBCode, PAPER_BASIC_SHIFTS, paperLogicalBasis, paperSpec, REPORTED } from './bb'
import { cycleRank } from './graph'
import { REPORTED_TABLE_1, adapterQubits, bbModuleQubits, codeFactoryAdapterQubits } from './overhead'
import { tcountLaw } from './tcount'

export type TdgCode = 'gross' | 'two-gross'
export type TdgFactory = '1e-3' | '1e-4'
export const TDG_CODES: readonly TdgCode[] = ['gross', 'two-gross']
export const TDG_FACTORIES: readonly TdgFactory[] = ['1e-3', '1e-4']

/* ------------------------------------------------------------------ the printed inputs ------------------------------------------------------------------ */

/** Table 3 (p. 14): the distance of the surface-code patch that holds the factory's output, by code and physical error rate (printed). */
export const TDG_FACTORY_D: Readonly<Record<TdgCode, Readonly<Record<TdgFactory, number>>>> = {
  gross: { '1e-3': 15, '1e-4': 7 },
  'two-gross': { '1e-3': 15, '1e-4': 25 },
}
/** Table 3: the factory's output error P_factory and mean time tau-bar (timesteps), as printed. */
export const TDG_FACTORY_PRINTED = {
  gross: { '1e-3': { error: 3e-6, time: 351 }, '1e-4': { error: 4e-8, time: 73 } },
  'two-gross': { '1e-3': { error: 2e-8, time: 2167 }, '1e-4': { error: 6e-25, time: 407 } },
} as const
/** Table 2/A.5: the number of cycles C of an in-module or inter-module measurement (printed). */
export const TDG_CYCLES: Readonly<Record<TdgCode, number>> = { gross: 10, 'two-gross': 18 }
/** Litinski's Table 1 (a reference's numbers, read online): the code cycles of the two distillation protocols the paper uses at 1e-4. */
export const TDG_LIT19B_CYCLES = { line1: 18.1, line5: 67.8 } as const
/** App. A.3 (pp. 48-51): cycles of each half graph and bridge edges the paper keeps as checks (printed), and the two added edges per half of two-gross. */
export const TDG_LPU_PRINTED: Readonly<Record<TdgCode, { keptL: number; keptR: number; bridge: number; extraPerHalf: number }>> = {
  gross: { keptL: 5, keptR: 3, bridge: 11, extraPerHalf: 0 },
  'two-gross': { keptL: 11, keptR: 9, bridge: 17, extraPerHalf: 2 },
}
/** Eqs. 37-38 as printed (p. 47): the 6 x 6 tables A_x and A_y of the logical action of the shifts x and y on qubits 1-6, row by row. */
export const TDG_PRINTED_A: Readonly<Record<TdgCode, { Ax: readonly string[]; Ay: readonly string[] }>> = {
  gross: {
    Ax: ['010100', '010001', '001100', '110110', '010010', '111101'],
    Ay: ['100001', '111001', '000010', '010000', '011001', '001101'],
  },
  'two-gross': {
    Ax: ['011101', '101011', '101010', '101111', '011111', '100110'],
    Ay: ['111110', '110111', '011000', '100010', '100111', '100001'],
  },
}

/* ------------------------------------------------------------------ Eq. 25: the machine ------------------------------------------------------------------ */

export interface TdgParts {
  /** code module: 4 l m (computed) */
  c: number
  /** LPU qubits (the paper's Table 1 figure; the census of tdgLpuGraph reproduces it) */
  u: number
  /** code-code adapter: 2(d - 1) with the reported d (computed from d) */
  a: number
  /** code-factory adapter 2 d_factory - 1, or 0 with no factory (computed from Table 3's d_factory) */
  aPrime: number
  /** factory qubits (the paper's estimate, reported) or 0 */
  f: number
  /** the reported distance d of the code */
  d: number
  dFactory: number
}

const keyP = (f: TdgFactory): 'p=1e-3' | 'p=1e-4' => (f === '1e-3' ? 'p=1e-3' : 'p=1e-4')

export function tdgParts(code: TdgCode, factory: TdgFactory | null): TdgParts {
  const bb = bbCodeOf(code)
  const t1 = REPORTED_TABLE_1[code]
  const d = REPORTED[code].d
  const dFactory = factory ? TDG_FACTORY_D[code][factory] : 0
  return {
    c: bbModuleQubits(bb.l, bb.m).total,
    u: t1.u,
    a: adapterQubits(d),
    aPrime: factory ? codeFactoryAdapterQubits(dFactory) : 0,
    f: factory ? t1.f[keyP(factory)] : 0,
    d,
    dFactory,
  }
}

export interface TdgQubits extends TdgParts {
  M: number
  /** logical data qubits: 11 per module (qubit 1 is the pivot) */
  n: number
  /** Eq. 25: q = M (c + u + a) - a + a' + f */
  q: number
  /** c + u + a: the qubits one more module adds */
  perModule: number
}

/** Eq. 25 (p. 28). `aPrime` overrides the adapter (used to show that 4817 needs a' = 29). */
export function tdgQubits(code: TdgCode, M: number, factory: TdgFactory | null, aPrime?: number): TdgQubits {
  if (!Number.isInteger(M) || M < 1) throw new Error('tdgQubits: M must be a whole number >= 1')
  const p = tdgParts(code, factory)
  const ap = aPrime ?? p.aPrime
  const perModule = p.c + p.u + p.a
  return { ...p, aPrime: ap, M, n: 11 * M, q: M * perModule - p.a + (factory ? ap + p.f : 0), perModule }
}

/** The most modules whose machine fits in `budget` physical qubits (0 when not even one does). */
export function tdgMaxModules(code: TdgCode, budget: number, factory: TdgFactory | null): number {
  let M = 0
  while (tdgQubits(code, M + 1, factory).q <= budget) M++
  return M
}

/* ------------------------------------------------------------------ yield (S5, p. 31) ------------------------------------------------------------------ */

export const TDG_JUNCTION_YIELD = 0.9998

/** y^J with J = 2 per qubit + 3 per coupler (the paper's counts, p. 31); `couplersPerQubit` is OUR assumption (2) for a surface chip. */
export function tdgYield(qubits: number, couplersPerQubit = 2, y = TDG_JUNCTION_YIELD): { junctions: number; yieldProb: number; oneIn: number } {
  const junctions = 2 * qubits + 3 * couplersPerQubit * qubits
  const yieldProb = Math.exp(junctions * Math.log(y))
  return { junctions, yieldProb, oneIn: 1 / yieldProb }
}

/* ------------------------------------------------------------------ durations (Table 2, A.5) ------------------------------------------------------------------ */

export function tdgDurations(code: TdgCode): { C: number; idle: number; shift: number; measure: number; cycleSteps: number } {
  const C = TDG_CYCLES[code]
  return { C, idle: 8, shift: 4 + 2 + 8, measure: 12 * C, cycleSteps: 8 * C + 1 }
}

/** The t_C-style distillation time rule of the paper: code cycles x 6 timesteps. */
export const tdgDistillationTime = (cycles: number): number => 6 * cycles

/* ------------------------------------------------------------------ cultivation (A.6, Eqs. 73-80) ------------------------------------------------------------------ */

const CULTIVATION = {
  3: { pCult: 0.35, pE2e: 0.8, tCult: 39, tEsc: 90, coefCult: 1.54, coefEsc: 3.23 },
  5: { pCult: 0.85, pE2e: 0.99, tCult: 89, tEsc: 110, coefCult: 6.67, coefEsc: 14.3 },
} as const

export function tdgCultivationTime(d1: 3 | 5): { escape: number; fromPrinted: number; exact: number } {
  const c = CULTIVATION[d1]
  const escape = (c.pE2e - c.pCult) / (1 - c.pCult)
  return { escape, fromPrinted: c.coefCult * c.tCult + c.coefEsc * c.tEsc, exact: c.tCult / (1 - c.pCult) + c.tEsc / (1 - escape) }
}

/* ------------------------------------------------------------------ Eqs. 82-83: the failure spectrum ------------------------------------------------------------------ */

export type TdgSeries = 'g-idle' | 'g-aut' | 'g-X' | 'g-XX' | 'g-Y' | 'g-XxX' | '2g-idle' | '2g-aut'
/** Table 6 (p. 61), as printed: ln f0, gamma, w0, K, N. */
export const TDG_FIT: Readonly<Record<TdgSeries, { lnF0: number; gamma: number; w0: number; K: number; N: number }>> = {
  'g-idle': { lnF0: -31.02, gamma: 8.66, w0: 5, K: 24, N: 210960 },
  'g-aut': { lnF0: -28.63, gamma: 7.13, w0: 5, K: 24, N: 483840 },
  'g-X': { lnF0: -23.97, gamma: 6.31, w0: 5, K: 23, N: 324526 },
  'g-XX': { lnF0: -22.06, gamma: 5.87, w0: 5, K: 23, N: 398717 },
  'g-Y': { lnF0: -19.49, gamma: 4.65, w0: 5, K: 23, N: 400117 },
  'g-XxX': { lnF0: -18.32, gamma: 5.19, w0: 5, K: 23, N: 743456 },
  '2g-idle': { lnF0: -95.83, gamma: 25.78, w0: 9, K: 24, N: 762912 },
  '2g-aut': { lnF0: -108.53, gamma: 28.22, w0: 9, K: 24, N: 1748736 },
}
export const TDG_W_MAX = 3000

/** f(w) of Eq. 83 for a series: a (1 - exp(-(f0/a)(w/w0)^gamma)), a = 1 - 2^-K, by expm1 so that tiny f0 does not underflow. */
export function tdgF(series: TdgSeries, w: number): number {
  const s = TDG_FIT[series]
  const a = 1 - 2 ** -s.K
  return a * -Math.expm1(-(Math.exp(s.lnF0) / a) * (w / s.w0) ** s.gamma)
}

/**
 * Eq. 82: P(q) = sum over w >= w0 of f(w) C(N, w) q^w (1 - q)^(N - w), q = p/15. The binomial terms follow the exact recurrence
 * T(w + 1) = T(w) (N - w)/(w + 1) q/(1 - q), so no gamma function is needed; weights beyond TDG_W_MAX (or N) are below any shown digit.
 */
export function tdgPiid(series: TdgSeries, p: number): number {
  const s = TDG_FIT[series]
  const q = p / 15
  const lq = Math.log(q)
  const l1q = Math.log1p(-q)
  const ratio = q / (1 - q)
  let logC = 0
  for (let i = 1; i <= s.w0; i++) logC += Math.log((s.N - s.w0 + i) / i)
  // the first term C(N, w0) q^w0 (1 - q)^(N - w0) once in logarithms (small exponent), then each next term by the exact ratio (N - w)/(w + 1) q/(1 - q)
  let term = Math.exp(logC + s.w0 * lq + (s.N - s.w0) * l1q)
  let total = 0
  for (let w = s.w0; w <= Math.min(s.N, TDG_W_MAX); w++) {
    total += tdgF(series, w) * term
    term *= ((s.N - w) / (w + 1)) * ratio
  }
  return total
}

/** The log-log slope of P between two physical error rates (tends to w0 at small p). */
export function tdgSlope(series: TdgSeries, p1: number, p2: number): number {
  return (Math.log10(tdgPiid(series, p2)) - Math.log10(tdgPiid(series, p1))) / (Math.log10(p2) - Math.log10(p1))
}

/* ------------------------------------------------------------------ Eq. 26: the TFIM bill ------------------------------------------------------------------ */

/** Table 9 (p. 67): instruction counts of the TFIM program, as printed. */
export const TDG_T9: Readonly<Record<TdgCode, { NI: number; NU: number; NM: number; NC: number; NT: number }>> = {
  gross: { NI: 4.1634e10, NU: 2.2704e6, NM: 4.2152e6, NC: 9.468e5, NT: 1.5542e7 },
  'two-gross': { NI: 4.1637e10, NU: 2.2944e6, NM: 4.2388e6, NC: 9.468e5, NT: 1.5542e7 },
}
/** Table 2's bracketed assumptions for the two-gross measurements (no data): [P_M, P_C] at p = 1e-3 and 1e-4. */
const ASSUMED_2G = { '1e-3': { PM: 1e-11, PC: 1e-9 }, '1e-4': { PM: 1e-20, PC: 1e-18 } } as const

/** The rotations of the TFIM program: steps x 5 x (2 bonds + sites) with bonds = 2 s (s - 1) on an s x s lattice (A.10, p. 67). */
export function tdgTfimRotations(side = 10, steps = 80): number {
  const bonds = 2 * side * (side - 1)
  return steps * 5 * (2 * bonds + side * side)
}

export interface TdgTfim {
  PI: number
  PU: number
  PM: number
  PC: number
  /** Eq. 26 first-order sum (can exceed 1: it is not a probability) */
  failure: number
}
export function tdgTfim(code: TdgCode, p: number): TdgTfim {
  const n = TDG_T9[code]
  const PI = tdgPiid(code === 'gross' ? 'g-idle' : '2g-idle', p)
  const PU = tdgPiid(code === 'gross' ? 'g-aut' : '2g-aut', p)
  let PM: number
  let PC: number
  if (code === 'gross') {
    PM = tdgPiid('g-Y', p)
    PC = tdgPiid('g-XxX', p)
  } else {
    const key = p === 1e-3 ? '1e-3' : p === 1e-4 ? '1e-4' : null
    if (!key) throw new Error('tdgTfim: two-gross has assumed measurement rates only at p = 1e-3 and 1e-4')
    PM = ASSUMED_2G[key].PM
    PC = ASSUMED_2G[key].PC
  }
  return { PI, PU, PM, PC, failure: n.NI * PI + n.NU * PU + n.NM * PM + n.NC * PC + n.NT * PC }
}

/** A power law F = a p^b through two points, and the p where it reaches `target` (A.10). */
export function tdgPowerLaw(p1: number, F1: number, p2: number, F2: number, target: number): { exponent: number; crossing: number } {
  const exponent = Math.log(F1 / F2) / Math.log(p1 / p2)
  const a = F1 / p1 ** exponent
  return { exponent, crossing: (target / a) ** (1 / exponent) }
}

/** The threshold the paper states for a code: the power law through two failure values of Eq. 26 (gross: p = 3e-5 and 1e-5; two-gross: 1e-3 and 1e-4). */
export function tdgCrossing(code: TdgCode, target = 1e-3): { exponent: number; crossing: number } {
  const [pa, pb] = code === 'gross' ? [3e-5, 1e-5] : [1e-3, 1e-4]
  return tdgPowerLaw(pa, tdgTfim(code, pa).failure, pb, tdgTfim(code, pb).failure, target)
}

/* ------------------------------------------------------------------ the surface-code baseline (A.10, Eqs. 89 and 96) ------------------------------------------------------------------ */

/** P_1 = 0.03 (p / 0.01)^(d/2): one logical operation of a distance-d patch in the baseline model of A.10. */
export const tdgSurfaceP1 = (p: number, d: number): number => 0.03 * (p / 0.01) ** (d / 2)

export interface TdgSurfaceRow {
  /** logical qubits: floor((q - f) / (4 d^2)) (2 d^2 per patch, half routing) */
  n: number
  /** random pi/4 rotations at failure <= 1/3: (1/3) / (2 n P_1 d) (Eq. 89) */
  NT: number
  /** tau-bar + 6 d timesteps per rotation */
  time: number
}
export function tdgSurfaceRow(p: number, q: number, d: number, f: number, factoryTime: number): TdgSurfaceRow {
  const n = Math.floor((q - f) / (4 * d * d))
  return { n, NT: 1 / 3 / (2 * n * tdgSurfaceP1(p, d) * d), time: factoryTime + 6 * d }
}
/** The six surface rows of Fig. 10a (p. 29) as their inputs: [p, q, d, f, tau-bar] with the printed factory figures. */
export const TDG_FIG10A_SURFACE: readonly (readonly [number, number, number, number, number])[] = [
  [1e-3, 5000, 5, 454, 351],
  [1e-3, 50000, 17, 463, 2167],
  [1e-4, 5000, 7, 810, 73],
  [1e-4, 50000, 7, 810, 73],
  [1e-4, 50000, 17, 18600, 407],
  [1e-4, 500000, 17, 18600, 407],
]
/** The bicycle rows of Fig. 10a as [code, factory, budget] (n is computed by Eq. 25). */
export const TDG_FIG10A_BICYCLE: readonly (readonly [TdgCode, TdgFactory, number])[] = [
  ['gross', '1e-3', 5000],
  ['two-gross', '1e-3', 50000],
  ['gross', '1e-4', 5000],
  ['gross', '1e-4', 50000],
  ['two-gross', '1e-4', 50000],
  ['two-gross', '1e-4', 500000],
]
/** Eq. 96: the physical error rate at which the distance-d surface-code TFIM run fails with chance 1e-3, for a T count N_T. */
export function tdgSurfaceTfim(d: number, NT: number, target = 1e-3, nL = 100): number {
  const NR = tdgTfimRotations()
  const K = 2 * nL * NR + NT - NR
  return 0.01 * (target / (0.03 * d * K)) ** (2 / d)
}

/* ------------------------------------------------------------------ the code family (Section 5, p. 32) ------------------------------------------------------------------ */

export interface TdgFamilyRow {
  r: number
  b: number
  l: number
  m: number
  n: number
  k: number
  /** the conjectured distance 6 (2 r + b - 1), a reported conjecture */
  d: number
  ratio: number
}
const familyCache = new Map<string, TdgFamilyRow>()
export function tdgFamily(r: number, b: number): TdgFamilyRow {
  const key = `${r}/${b}`
  const hit = familyCache.get(key)
  if (hit) return hit
  const l = 6 * (r + b)
  const m = 6 * r
  const code = new BBCode(paperSpec(`family-${r}-${b}`, l, m, 3, -1, -1, -3))
  const d = 6 * (2 * r + b - 1)
  const row = { r, b, l, m, n: code.n, k: code.k, d, ratio: (code.k * d * d) / code.n }
  familyCache.set(key, row)
  return row
}

/* ------------------------------------------------------------------ the basis operators (Eqs. 31-36) ------------------------------------------------------------------ */

export function tdgBasisFacts(code: TdgCode): { weights: number[]; overlaps: number[]; meetsMin: number; meetsMax: number; touching: number; rankAbove: number } {
  const bb = bbCodeOf(code)
  const b = paperLogicalBasis(bb, code)
  const { X1, X7, Z1, Z7 } = b.generators
  const ov = (u: typeof X1, v: typeof X1): number => u.support().filter((i) => v.support().includes(i)).length
  // X-type vs Z-type operators overlap on the qubits where both have a letter; for two X-type operators the same count of shared qubits
  const meets = Array.from({ length: bb.HZ.rows }, (_, i) => bb.HZ.rowBits(i).reduce((s, bit, j) => s + (bit & X1.x[j]), 0))
  return {
    weights: [X1, X7, Z1, Z7].map((p) => p.weight()),
    overlaps: [ov(X1, Z1), ov(X7, Z7), ov(X1, Z7), ov(X7, Z1), ov(X1, X7), ov(Z1, Z7)],
    meetsMin: Math.min(...meets),
    meetsMax: Math.max(...meets),
    touching: meets.filter((m) => m > 0).length,
    rankAbove: GF2Matrix.fromRows([...bb.HX.toRows(), ...b.X.map((p) => [...p.x])], bb.n).rank() - bb.HX.rank(),
  }
}

/** The 12 x 12 table of "X-bar_i anticommutes with Z-bar_j" for the paper's basis, as rows of 0/1 text. */
export function tdgPairingRows(code: TdgCode): string[] {
  const bb = bbCodeOf(code)
  const b = paperLogicalBasis(bb, code)
  return b.X.map((x) => b.Z.map((z) => (x.commutesWith(z) ? '0' : '1')).join(''))
}

/* ------------------------------------------------------------------ App. A.2: the logical action of a shift ------------------------------------------------------------------ */

const rowsText = (M: GF2Matrix, r0: number, r1: number, c0: number, c1: number): string[] =>
  Array.from({ length: r1 - r0 }, (_, i) => M.rowBits(r0 + i).slice(c0, c1).join(''))

export interface TdgBlocks {
  M: GF2Matrix
  upper: string[]
  lower: string[]
  /** entries of the 1-6 x 7-12 and 7-12 x 1-6 corners (0 when the halves never mix) */
  offBlockOnes: number
  /** engine upper block vs the printed table of Eq. 37/38 (x or y): entries that differ */
  gapUpper: number
  /** engine lower block vs the TRANSPOSE of the printed table */
  gapLowerT: number
  /** engine lower block vs the printed table itself (p. 47 says M = A (+) A) */
  gapLowerPrinted: number
  /** entries where the printed table differs from its own transpose */
  printedVsTranspose: number
}

export function tdgBlocks(code: TdgCode, a: number, b: number, printed: 'x' | 'y' | null = null): TdgBlocks {
  const M = logicalShiftMatrix(bbCodeOf(code), code, a, b)
  const up = rowsText(M, 0, 6, 0, 6)
  const lo = rowsText(M, 6, 12, 6, 12)
  const off = rowsText(M, 0, 6, 6, 12).join('') + rowsText(M, 6, 12, 0, 6).join('')
  const pr = printed ? TDG_PRINTED_A[code][printed === 'x' ? 'Ax' : 'Ay'] : up
  const transposed = Array.from({ length: 6 }, (_, i) => pr.map((row) => row[i]).join(''))
  const diff = (u: readonly string[], v: readonly string[]): number => u.join('').split('').filter((ch, i) => ch !== v.join('')[i]).length
  return {
    M,
    upper: up,
    lower: lo,
    offBlockOnes: off.split('').filter((ch) => ch === '1').length,
    gapUpper: diff(up, pr),
    gapLowerT: diff(lo, transposed),
    gapLowerPrinted: diff(lo, pr),
    printedVsTranspose: diff(pr, transposed),
  }
}

/** The distinct logical actions of all l m shifts as text keys, and how many basic shifts (and inverses) are needed to reach every class. */
export function tdgShiftClasses(code: TdgCode): { classes: number; maxFactors: number; trivial: number; orderX: number } {
  const bb = bbCodeOf(code)
  const s = bbShiftSummary(code)
  const key = (a: number, b: number): string => logicalShiftMatrix(bb, code, ((a % bb.l) + bb.l) % bb.l, ((b % bb.m) + bb.m) % bb.m).toRows().map((r) => r.join('')).join('/')
  const gens = [...PAPER_BASIC_SHIFTS, ...PAPER_BASIC_SHIFTS.map(([x, y]) => [-x, -y] as const)]
  const seen = new Set<string>([key(0, 0)])
  let reach: [number, number][] = [[0, 0]]
  let maxFactors = 0
  for (let step = 1; step <= 3 && seen.size < s.distinct; step++) {
    const next: [number, number][] = []
    for (const [x, y] of reach)
      for (const [gx, gy] of gens) {
        const k = key(x + gx, y + gy)
        if (!seen.has(k)) {
          seen.add(k)
          next.push([x + gx, y + gy])
          maxFactors = step
        }
      }
    reach = next
  }
  return { classes: s.distinct, maxFactors, trivial: s.trivial, orderX: s.orderX }
}

/* ------------------------------------------------------------------ Eqs. 14-15: native measurements ------------------------------------------------------------------ */

export interface TdgNative {
  /** |N|: the distinct images of the 15 LPU Paulis under all logical shift actions */
  native: number
  /** rotations R(pi/2) from Eq. 15 as written: pivot letter X, Y or Z */
  rotations: number
  /** the same count with the pivot letter I allowed (what the printed 510 counts) */
  rotationsAny: number
  /** members of N whose pivot letter is I */
  pivotI: number
  /** members with a pivot letter X, Y or Z */
  pivotLetter: number
}
const nativeCache = new Map<string, TdgNative>()
export function tdgNativeSets(code: TdgCode, reading: 'actual' | 'as-printed' = 'actual'): TdgNative {
  const ck = `${code}/${reading}`
  const hit = nativeCache.get(ck)
  if (hit) return hit
  const bb = bbCodeOf(code)
  const mats = new Map<string, GF2Matrix>()
  for (let a = 0; a < bb.l; a++)
    for (let b = 0; b < bb.m; b++) {
      let M = logicalShiftMatrix(bb, code, a, b)
      if (reading === 'as-printed') {
        // p. 47 states M = A (+) A: copy the upper block onto the lower one
        const copy = GF2Matrix.zeros(12, 12)
        for (let i = 0; i < 6; i++) for (let j = 0; j < 6; j++) if (M.get(i, j)) { copy.set(i, j, 1); copy.set(i + 6, j + 6, 1) }
        M = copy
      }
      mats.set(M.toRows().map((r) => r.join('')).join('/'), M)
    }
  const paulis: number[][] = []
  for (let m = 1; m < 16; m++) {
    const v = new Array<number>(24).fill(0)
    const [x1, z1, x7, z7] = [m & 1, (m >> 1) & 1, (m >> 2) & 1, (m >> 3) & 1]
    v[0] = x1
    v[12] = z1
    v[6] = x7
    v[18] = z7
    paulis.push(v)
  }
  const members = new Set<string>()
  for (const M of mats.values()) {
    const Zmap = M.inverse().transpose()
    for (const v of paulis) members.add([...M.mulVec(v.slice(0, 12)), ...Zmap.mulVec(v.slice(12))].join(''))
  }
  const rest = (s: string): string => s.slice(1, 12) + s.slice(13, 24)
  const nonzero = (s: string): boolean => /1/.test(rest(s))
  const lit = new Set<string>()
  const any = new Set<string>()
  let pivotI = 0
  for (const s of members) {
    const pivotIsI = s[0] === '0' && s[12] === '0'
    if (pivotIsI) pivotI++
    if (nonzero(s)) {
      any.add(rest(s))
      if (!pivotIsI) lit.add(rest(s))
    }
  }
  const out = { native: members.size, rotations: lit.size, rotationsAny: any.size, pivotI, pivotLetter: members.size - pivotI }
  nativeCache.set(ck, out)
  return out
}

/** A measurement on one module costs beta = 1 + 6k bicycle measurements when it needs k native rotations around it (Eq. 17). */
export const tdgBeta = (k: number): number => 1 + 6 * k

/* ------------------------------------------------------------------ App. A.3: the LPU graph ------------------------------------------------------------------ */

export type LpuMode = 'l' | 'r' | 'full'
export type LpuMeasure = 'X1' | 'Z1' | 'Y1' | 'X7' | 'Z7' | 'Y7'
export interface LpuVertex {
  id: number
  /** which half graph the dot belongs to ('bell' is the shared dot v_Bell of the full graph) */
  half: 'l' | 'r' | 'bell'
  /** the code qubit the dot sits on (the left one for the bell dot) */
  qubit: number
}
export interface LpuEdge {
  a: number
  b: number
  /** 'l' / 'r': a link of the half graph, from a Z check meeting the operator twice · 'extra': one of the added edges of two-gross · 'bridge': a bridge edge (the end dots are a drawing's choice) */
  kind: 'l' | 'r' | 'extra' | 'bridge'
}
export interface LpuGraph {
  code: TdgCode
  mode: LpuMode
  vertices: LpuVertex[]
  edges: LpuEdge[]
  /** dots, and check qubits for the dots (the bell dot counts twice) */
  V: number
  Vq: number
  E: number
  /** E - V + 1 */
  rank: number
  /** cycles the paper keeps as checks (reported) */
  kept: number
  /** v + e + kept qubits of the full graph, else 0 */
  u: number
  bridge: number
}

const lpuCache = new Map<string, LpuGraph>()
const halfOf = (code: TdgCode, which: 'X1' | 'X7'): { support: number[]; edges: [number, number][] } => {
  const bb = bbCodeOf(code)
  const g = paperLogicalBasis(bb, code).generators[which]
  const support = g.support()
  const index = new Map(support.map((q, i) => [q, i]))
  const edges: [number, number][] = []
  for (let r = 0; r < bb.HZ.rows; r++) {
    const hit = bb.HZ.rowSupport(r).filter((q) => index.has(q))
    if (hit.length === 2) edges.push([index.get(hit[0])!, index.get(hit[1])!])
    else if (hit.length !== 0) throw new Error(`tdgLpuGraph: a Z check meets ${which} in ${hit.length} qubits (expected 0 or 2)`)
  }
  return { support, edges }
}

export function tdgLpuGraph(code: TdgCode, mode: LpuMode): LpuGraph {
  const ck = `${code}/${mode}`
  const hit = lpuCache.get(ck)
  if (hit) return hit
  const pr = TDG_LPU_PRINTED[code]
  const L = halfOf(code, 'X1')
  const R = halfOf(code, 'X7')
  const g1 = paperLogicalBasis(bbCodeOf(code), code).generators
  const bellL = L.support.findIndex((q) => g1.Z1.support().includes(q))
  const bellR = R.support.findIndex((q) => g1.Z7.support().includes(q))
  // the extra edges of two-gross: the first non-adjacent pairs in a fixed order (their endpoints are a drawing's choice)
  const extras = (edges: [number, number][], V: number): [number, number][] => {
    const have = new Set(edges.map(([a, b]) => `${Math.min(a, b)}-${Math.max(a, b)}`))
    const out: [number, number][] = []
    for (let a = 0; a < V && out.length < pr.extraPerHalf; a++) for (let b = a + 2; b < V && out.length < pr.extraPerHalf; b += 3) if (!have.has(`${a}-${b}`)) out.push([a, b])
    return out
  }
  const vertices: LpuVertex[] = []
  const edges: LpuEdge[] = []
  const addHalf = (H: { support: number[]; edges: [number, number][] }, half: 'l' | 'r', map: (i: number) => number): void => {
    H.edges.forEach(([a, b]) => edges.push({ a: map(a), b: map(b), kind: half }))
    extras(H.edges, H.support.length).forEach(([a, b]) => edges.push({ a: map(a), b: map(b), kind: 'extra' }))
  }
  let kept = 0
  if (mode === 'l' || mode === 'r') {
    const H = mode === 'l' ? L : R
    H.support.forEach((q, i) => vertices.push({ id: i, half: mode, qubit: q }))
    addHalf(H, mode, (i) => i)
    kept = mode === 'l' ? pr.keptL : pr.keptR
  } else {
    // the left half keeps its dots (the bell dot is one of them), the right half keeps all but its own bell dot, which is identified with the left one
    L.support.forEach((q, i) => vertices.push({ id: i, half: i === bellL ? 'bell' : 'l', qubit: q }))
    const rid: number[] = []
    let next = L.support.length
    R.support.forEach((q, i) => {
      if (i === bellR) rid.push(bellL)
      else {
        rid.push(next)
        vertices.push({ id: next, half: 'r', qubit: q })
        next++
      }
    })
    addHalf(L, 'l', (i) => i)
    addHalf(R, 'r', (i) => rid[i])
    // bridge edges: the i-th plain dot of the left half to the i-th plain dot of the right half (a drawing's pairing; only the count d - 1 is the paper's)
    const plainL = vertices.filter((v) => v.half === 'l').map((v) => v.id)
    const plainR = vertices.filter((v) => v.half === 'r').map((v) => v.id)
    for (let i = 0; i < pr.bridge; i++) edges.push({ a: plainL[i], b: plainR[i], kind: 'bridge' })
    kept = pr.keptL + pr.keptR + pr.bridge
  }
  const V = vertices.length
  const E = edges.length
  const Vq = mode === 'full' ? V + 1 : V
  const rank = cycleRank({ V, edges: edges.map((e) => [e.a, e.b] as [number, number]) })
  const out: LpuGraph = { code, mode, vertices, edges, V, Vq, E, rank, kept, u: mode === 'full' ? Vq + E + kept : 0, bridge: mode === 'full' ? pr.bridge : 0 }
  lpuCache.set(ck, out)
  return out
}

/** Which part of the LPU measures an operator: X1 and Z7 the left half, X7 and Z1 the right half, the Y products the whole graph (A.4). */
export const tdgLpuModeOf = (op: LpuMeasure): LpuMode => (op === 'X1' || op === 'Z7' ? 'l' : op === 'X7' || op === 'Z1' ? 'r' : 'full')

/** The three modes cover 3 + 3 + 9 of the 15 non-trivial Paulis of the LPU (A.4): the groups <X1, Z7> and <X7, Z1> have 3 each, the other products need the whole graph. */
export function tdgLpuModes(): { left: number; right: number; full: number; total: number } {
  const all = Array.from({ length: 15 }, (_, i) => i + 1) // bit 0 = X1, 1 = Z1, 2 = X7, 3 = Z7
  const left = all.filter((m) => (m & 0b0110) === 0).length
  const right = all.filter((m) => (m & 0b1001) === 0).length
  return { left, right, full: all.length - left - right, total: all.length }
}

/* ------------------------------------------------------------------ Eq. 5: a long Pauli over modules ------------------------------------------------------------------ */

export function tdgDistribute(n: number): { M: number; zz: number; local: number } {
  if (!Number.isInteger(n) || n < 1) throw new Error('tdgDistribute: n must be a whole number >= 1')
  const M = Math.ceil(n / 11)
  return { M, zz: M - 1, local: M }
}

/* ------------------------------------------------------------------ small helpers ------------------------------------------------------------------ */

/** Rotation synthesis: the T gates per rotation at accuracy eps from Table 9's count and from the leading term 3 log2(1/eps). */
export const tdgTPerRotation = (NT: number, rotations: number): number => NT / rotations
export const tdgSynthesisLaw = tcountLaw

/* ------------------------------------------------------------------ stage helper (module-map readout) ------------------------------------------------------------------ */

/** Physical qubits per logical qubit of ONE module: (c + u) / k, the code block and its LPU over the k = 12 logical qubits (the adapters are not counted). u is the paper's reported figure. */
export function tdgPerLogical(code: TdgCode): { physical: number; logical: number; ratio: number } {
  const p = tdgParts(code, null)
  const logical = bbCodeOf(code).k
  return { physical: p.c + p.u, logical, ratio: (p.c + p.u) / logical }
}
