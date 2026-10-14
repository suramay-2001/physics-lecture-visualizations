/**
 * Lattice surgery on two rotated surface-code patches (Chapter B3, unit b3-surgery; Horsman, Fowler, Devitt & Van Meter 2012, arXiv:1111.4022 §3.1-3.2; the face rule is the
 * one of codes.ts `rotatedSurfaceCode`, generalised to a rows × cols grid of data qubits). Two distance-d patches A and B sit side by side with a SEAM column of d fresh qubits between them
 * (stacked with a seam row for a Z-type product). The merged code is the (d × (2d+1)) rotated patch; against the checks of the two separate patches
 *   kept     the same check (same type, same qubits),
 *   widened  an old boundary check of the OTHER type that grew to reach the seam,
 *   new      the d + 1 checks of the measured type that touch the seam and have no predecessor.
 * Merging means measuring the new checks on the state (patches in a code state, seam qubits in |0⟩ for an XX merge, |+⟩ for a ZZ merge): each is a fair coin, their PRODUCT is the logical
 * product X̄_A X̄_B (Z̄_A Z̄_B), and that product is the data. Splitting means measuring the seam qubits in the seam basis; the patches are alone again and the other logical product
 * (Z̄_A Z̄_B for XX) picks up a sign set by one seam outcome. The run is done on the tableau simulator (n ≤ 105), the chances by enumerating every branch (2^measurements).
 * Pure TypeScript, deterministic: a random outcome comes from the caller (`choice`) or from a seed.
 */
import { GF2Matrix } from './gf2'
import { Pauli } from './pauli'
import { Tableau, type OutcomeChoice } from './tableau'
import { cssDistances, type CssDistances } from './cssdist'
import { rng } from '../random'

/* ------------------------------------------------------------------ a rotated patch of any shape ------------------------------------------------------------------ */

export interface PatchCheck {
  type: 'X' | 'Z'
  /** Increasing qubit indices (4 for a face, 2 for a boundary half-face). */
  qubits: number[]
  boundary: boolean
  /** Centre in (column, row) coordinates, qubit (r, c) sits at (c, r). */
  center: [number, number]
}

export interface RotatedPatch {
  rows: number
  cols: number
  n: number
  checks: PatchCheck[]
  /** Data qubit index of grid position (row, col): row · cols + col. */
  q: (r: number, c: number) => number
}

/** The rotated surface code on a rows × cols grid (qubit (r, c) = r · cols + c): X faces where r + c is even, X half-faces on the top and bottom edges, Z half-faces on the left and right edges. */
export function rotatedPatch(rows: number, cols: number): RotatedPatch {
  if (!Number.isInteger(rows) || !Number.isInteger(cols) || rows < 2 || cols < 2) throw new Error('rotatedPatch: rows and cols must be whole numbers ≥ 2')
  const q = (r: number, c: number): number => r * cols + c
  const at = (r: number, c: number): number | null => (r >= 0 && r < rows && c >= 0 && c < cols ? q(r, c) : null)
  const checks: PatchCheck[] = []
  for (let r = -1; r <= rows - 1; r++)
    for (let c = -1; c <= cols - 1; c++) {
      const type: 'X' | 'Z' = (((r + c) % 2) + 2) % 2 === 0 ? 'X' : 'Z'
      const qs = [at(r, c), at(r, c + 1), at(r + 1, c), at(r + 1, c + 1)].filter((x): x is number => x !== null).sort((a, b) => a - b)
      const center: [number, number] = [c + 0.5, r + 0.5]
      if (qs.length === 4) checks.push({ type, qubits: qs, boundary: false, center })
      else if (qs.length === 2) {
        const top = r === -1 || r === rows - 1
        const side = c === -1 || c === cols - 1
        if (top && !side && type === 'X') checks.push({ type, qubits: qs, boundary: true, center })
        if (side && !top && type === 'Z') checks.push({ type, qubits: qs, boundary: true, center })
      }
    }
  return { rows, cols, n: rows * cols, checks, q }
}

const supportsOf = (p: RotatedPatch, type: 'X' | 'Z'): number[][] => p.checks.filter((k) => k.type === type).map((k) => k.qubits)

/* ------------------------------------------------------------------ the merged layout ------------------------------------------------------------------ */

export type SurgeryProduct = 'XX' | 'ZZ'
export type CheckClass = 'kept' | 'new' | 'widened'

export interface SurgeryCheck extends PatchCheck {
  cls: CheckClass
}

export interface SurgeryLayout {
  d: number
  product: SurgeryProduct
  /** Merged grid: d × (2d+1) for XX, (2d+1) × d for ZZ. */
  rows: number
  cols: number
  n: number
  /** Stored qubits of the merged code (1). */
  k: number
  /** Data qubits of patch A, of patch B (each d², local row-major order) and the d seam qubits, in merged indices. */
  A: number[]
  B: number[]
  seam: number[]
  checks: SurgeryCheck[]
  /** Counts: checks of the measured type that are new; checks of the other type that widened. */
  newChecks: number
  widened: number
  /** The measured product as a Pauli support: X on A's column d−1 and B's column 0 (XX), Z on A's row d−1 and B's row 0 (ZZ). Equals the product of the new checks. */
  measured: { type: 'X' | 'Z'; qubits: number[] }
  /** Each patch's own logical operators in merged indices: X̄ = column 0, Z̄ = row 0 of its grid. */
  logicals: { XA: number[]; XB: number[]; ZA: number[]; ZB: number[] }
  /** Patch geometry for the stage: where A's and B's local grids sit in the merged grid. */
  offsetB: [number, number]
}

const key = (type: string, qs: readonly number[]): string => `${type}:${[...qs].sort((a, b) => a - b).join(',')}`

export function surgeryLayout(d: number, product: SurgeryProduct = 'XX'): SurgeryLayout {
  if (!Number.isInteger(d) || d < 3 || d % 2 === 0) throw new Error('surgeryLayout: d must be an odd whole number ≥ 3')
  const xx = product === 'XX'
  const rows = xx ? d : 2 * d + 1
  const cols = xx ? 2 * d + 1 : d
  const merged = rotatedPatch(rows, cols)
  const small = rotatedPatch(d, d)
  const offsetB: [number, number] = xx ? [0, d + 1] : [d + 1, 0]
  const mapA = (r: number, c: number): number => merged.q(r, c)
  const mapB = (r: number, c: number): number => merged.q(r + offsetB[0], c + offsetB[1])
  const A: number[] = []
  const B: number[] = []
  for (let r = 0; r < d; r++)
    for (let c = 0; c < d; c++) {
      A.push(mapA(r, c))
      B.push(mapB(r, c))
    }
  const seam = xx ? Array.from({ length: d }, (_, r) => merged.q(r, d)) : Array.from({ length: d }, (_, c) => merged.q(d, c))
  const old: Array<{ type: 'X' | 'Z'; qubits: number[] }> = []
  for (const k of small.checks) {
    old.push({ type: k.type, qubits: k.qubits.map((i) => A[i]) })
    old.push({ type: k.type, qubits: k.qubits.map((i) => B[i]) })
  }
  const oldKeys = new Set(old.map((k) => key(k.type, k.qubits)))
  const measuredType: 'X' | 'Z' = xx ? 'X' : 'Z'
  const checks: SurgeryCheck[] = merged.checks.map((k) => {
    if (oldKeys.has(key(k.type, k.qubits))) return { ...k, cls: 'kept' as const }
    const grew = old.some((o) => o.type === k.type && o.qubits.every((i) => k.qubits.includes(i)))
    return { ...k, cls: grew ? ('widened' as const) : ('new' as const) }
  })
  const lost = old.filter((o) => !merged.checks.some((k) => k.type === o.type && o.qubits.every((i) => k.qubits.includes(i))))
  if (lost.length) throw new Error('surgeryLayout: an old check has no successor in the merged patch (internal error)')
  const newChecks = checks.filter((k) => k.cls === 'new').length
  const widened = checks.filter((k) => k.cls === 'widened').length
  const HX = GF2Matrix.fromSupports(supportsOf(merged, 'X'), merged.n)
  const HZ = GF2Matrix.fromSupports(supportsOf(merged, 'Z'), merged.n)
  const k = merged.n - HX.rank() - HZ.rank()
  const col = (m: (r: number, c: number) => number, c: number): number[] => Array.from({ length: d }, (_, r) => m(r, c))
  const row = (m: (r: number, c: number) => number, r: number): number[] => Array.from({ length: d }, (_, c) => m(r, c))
  const measured = xx ? { type: 'X' as const, qubits: [...col(mapA, d - 1), ...col(mapB, 0)].sort((a, b) => a - b) } : { type: 'Z' as const, qubits: [...row(mapA, d - 1), ...row(mapB, 0)].sort((a, b) => a - b) }
  void measuredType
  return {
    d,
    product,
    rows,
    cols,
    n: merged.n,
    k,
    A,
    B,
    seam,
    checks,
    newChecks,
    widened,
    measured,
    logicals: { XA: col(mapA, 0), XB: col(mapB, 0), ZA: row(mapA, 0), ZB: row(mapB, 0) },
    offsetB,
  }
}

/** The merged code's exact distances (n ≤ 105 is too many for the exhaustive search: only d = 3 and 5 are searched; d = 7 is refused). */
export function surgeryDistances(d: number, product: SurgeryProduct = 'XX'): CssDistances {
  const L = surgeryLayout(d, product)
  const px = L.checks.filter((k) => k.type === 'X').map((k) => k.qubits)
  const pz = L.checks.filter((k) => k.type === 'Z').map((k) => k.qubits)
  return cssDistances(px, pz, L.n)
}

/** The product of the new checks as a qubit support (symmetric difference of their supports): equals `layout.measured.qubits` (tested). */
export function productOfNewChecks(L: SurgeryLayout): number[] {
  const count = new Map<number, number>()
  for (const k of L.checks) if (k.cls === 'new') for (const q of k.qubits) count.set(q, (count.get(q) ?? 0) + 1)
  return [...count.entries()].filter(([, c]) => c % 2 === 1).map(([q]) => q).sort((a, b) => a - b)
}

/* ------------------------------------------------------------------ a run on the tableau ------------------------------------------------------------------ */

export type SurgeryPrep = 'zero' | 'plus'

const pauliOn = (n: number, letter: 'X' | 'Z', qubits: readonly number[]): Pauli => Pauli.fromLetters(Array.from({ length: n }, (_, q) => (qubits.includes(q) ? letter : 'I')))

/** A copy of the tableau after measuring P with the given outcome (used where the outcome is fixed or one branch is followed). */
const after = (t: Tableau, P: Pauli, o: 0 | 1): Tableau => {
  const u = t.copy()
  u.measurePauli(P, o)
  return u
}

export interface SurgeryRun {
  layout: SurgeryLayout
  prep: SurgeryPrep
  /** Outcome bits of the new checks, in layout order (0 = +1), and whether each was already fixed. */
  mergeOutcomes: (0 | 1)[]
  mergeFixed: boolean[]
  /** XOR of the merge outcomes: the value of the measured logical product (0 = +1). */
  product: 0 | 1
  /** The measured product read directly off the merged state (must equal `product`). */
  productPeek: 0 | 1 | null
  /** Outcome bits of the seam measurements, top to bottom (left to right for ZZ). */
  seamOutcomes: (0 | 1)[]
  /** After the split: the values of X̄_A X̄_B, Z̄_A Z̄_B (0 = +1, null = a fair coin), and of the single-patch logicals. */
  after: { xx: 0 | 1 | null; zz: 0 | 1 | null; xa: 0 | 1 | null; za: 0 | 1 | null }
}

/** The tableau of two patches in a logical state and the seam in its starting basis. */
export function prepareSurgery(L: SurgeryLayout, prep: SurgeryPrep): Tableau {
  const t = new Tableau(L.n)
  const small = rotatedPatch(L.d, L.d)
  // the patches: start from |0…0⟩ and project onto +1 of every X check (|0̄⟩ each); a ZZ merge starts the other way round
  const xx = L.product === 'XX'
  if (!xx) for (const q of L.seam) t.h(q)
  for (const k of small.checks)
    if (k.type === 'X')
      for (const patch of [L.A, L.B]) t.measurePauli(pauliOn(L.n, 'X', k.qubits.map((i) => patch[i])), 0)
  if (prep === 'plus') {
    t.measurePauli(pauliOn(L.n, 'X', L.logicals.XA), 0)
    t.measurePauli(pauliOn(L.n, 'X', L.logicals.XB), 0)
  }
  return t
}

/** Merge (measure the new checks) then split (measure the seam), one random branch. `choice` supplies the coins, a bit (always that outcome) or a generator. */
export function runSurgery(d: number, product: SurgeryProduct, prep: SurgeryPrep, choice: OutcomeChoice | { seed: number }): SurgeryRun {
  const L = surgeryLayout(d, product)
  const coin: OutcomeChoice = typeof choice === 'object' ? rng(choice.seed) : choice
  const t = prepareSurgery(L, prep)
  const xx = product === 'XX'
  const mergeOutcomes: (0 | 1)[] = []
  const mergeFixed: boolean[] = []
  for (const k of L.checks)
    if (k.cls === 'new') {
      const r = t.measurePauli(pauliOn(L.n, k.type, k.qubits), coin)
      mergeOutcomes.push(r.outcome)
      mergeFixed.push(r.deterministic)
    }
  const product01 = mergeOutcomes.reduce<number>((a, b) => a ^ b, 0) as 0 | 1
  const productPeek = t.peekPauli(pauliOn(L.n, L.measured.type, L.measured.qubits))
  const seamOutcomes: (0 | 1)[] = []
  const seamLetter = xx ? 'Z' : 'X'
  for (const q of L.seam) seamOutcomes.push(t.measurePauli(pauliOn(L.n, seamLetter, [q]), coin).outcome)
  const peek = (letter: 'X' | 'Z', qs: readonly number[]): 0 | 1 | null => t.peekPauli(pauliOn(L.n, letter, qs))
  return {
    layout: L,
    prep,
    mergeOutcomes,
    mergeFixed,
    product: product01,
    productPeek,
    seamOutcomes,
    after: {
      xx: peek('X', [...L.logicals.XA, ...L.logicals.XB]),
      zz: peek('Z', [...L.logicals.ZA, ...L.logicals.ZB]),
      xa: peek('X', L.logicals.XA),
      za: peek('Z', L.logicals.ZA),
    },
  }
}

export interface SurgeryCensus {
  layout: SurgeryLayout
  prep: SurgeryPrep
  /** Every merge outcome pattern that can occur (as bit strings) with its chance. */
  patterns: Array<{ outcomes: string; chance: number; product: 0 | 1 }>
  /** Chance that the measured product reads +1. */
  pProductPlus: number
  /** After the merge outcomes all 0 (+1): the chance of each seam outcome pattern, the smallest and largest, how many patterns flip Z̄_A Z̄_B (XX) and the chance of the all-zero merge. */
  split: { count: number; chance: number; minChance: number; maxChance: number; flips: number; patterns: Array<{ outcomes: string; chance: number; zz: 0 | 1 | null }> }
}

/** Enumerate every branch of the merge, and of the split after the all-+1 merge, exactly (chance = 2^−(coins)). Practical for d = 3 (21 qubits). */
export function surgeryCensus(d: number, product: SurgeryProduct, prep: SurgeryPrep): SurgeryCensus {
  const L = surgeryLayout(d, product)
  const base = prepareSurgery(L, prep)
  const news = L.checks.filter((k) => k.cls === 'new')
  const patterns: SurgeryCensus['patterns'] = []
  const walk = (t: Tableau, i: number, bits: string, chance: number): void => {
    if (i === news.length) {
      const prod = (bits.split('').reduce<number>((a, c) => a ^ Number(c), 0) as 0 | 1)
      patterns.push({ outcomes: bits, chance, product: prod })
      return
    }
    const P = pauliOn(L.n, news[i].type, news[i].qubits)
    const fixed = t.peekPauli(P)
    if (fixed !== null) return walk(after(t, P, 0), i + 1, bits + String(fixed), chance)
    for (const o of [0, 1] as const) walk(after(t, P, o), i + 1, bits + String(o), chance / 2)
  }
  walk(base, 0, '', 1)
  const pProductPlus = patterns.filter((p) => p.product === 0).reduce((s, p) => s + p.chance, 0)
  // the split after the all-zero merge (or the first pattern if all-zero cannot happen)
  const first = patterns.find((p) => /^0*$/.test(p.outcomes)) ?? patterns[0]
  const merged = base.copy()
  first.outcomes.split('').forEach((o, i) => merged.measurePauli(pauliOn(L.n, news[i].type, news[i].qubits), Number(o) as 0 | 1))
  const seamLetter = L.product === 'XX' ? 'Z' : 'X'
  const sp: SurgeryCensus['split']['patterns'] = []
  const zzOp = L.product === 'XX' ? pauliOn(L.n, 'Z', [...L.logicals.ZA, ...L.logicals.ZB]) : pauliOn(L.n, 'X', [...L.logicals.XA, ...L.logicals.XB])
  const walkSeam = (t: Tableau, i: number, bits: string, chance: number): void => {
    if (i === L.seam.length) {
      sp.push({ outcomes: bits, chance, zz: t.peekPauli(zzOp) })
      return
    }
    const P = pauliOn(L.n, seamLetter, [L.seam[i]])
    const fixed = t.peekPauli(P)
    if (fixed !== null) return walkSeam(after(t, P, 0), i + 1, bits + String(fixed), chance)
    for (const o of [0, 1] as const) walkSeam(after(t, P, o), i + 1, bits + String(o), chance / 2)
  }
  walkSeam(merged, 0, '', 1)
  const chances = sp.map((p) => p.chance)
  return {
    layout: L,
    prep,
    patterns,
    pProductPlus,
    split: {
      count: sp.length,
      chance: chances[0],
      minChance: Math.min(...chances),
      maxChance: Math.max(...chances),
      flips: sp.filter((p) => p.zz === 1).length,
      patterns: sp,
    },
  }
}
