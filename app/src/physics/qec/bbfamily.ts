/**
 * The bivariate bicycle (BB) family of the Papers background chapter B2 (plan P-B2-story §9.1; rulings papers-B1B2 R4-R9), built on bb.ts. Pure TypeScript.
 *
 *   presets     the seven codes of Table 3 of Bravyi et al. (arXiv:2308.07915) in the form that paper prints them (A = x^a + y^b + y^c ...), the paper-tdg forms of the gross and
 *               two-gross codes (bb.ts), and two small examples of our own (a 24-qubit BB code and the 3 × 3 toric code written as a BB code)
 *   distances   `bbDistanceRecord`: where a printed distance comes from. Only [[72,12,6]] was settled by an exhaustive search (kept as a fixture, `exact-offline`); the others
 *               are the reference's own numbers, REPORTED (and two are only bounds)
 *   isomorphism `bbIsomorphism`: two presentations are one code when shifting the L qubits by α, the R qubits by β and (for the two-gross code) the rows of the torus by y → y^u
 *               maps the rows of H_X and H_Z of one onto those of the other
 *   layers      `bbLayers`: the Tanner graph's edges split by term (Bravyi et al.'s thickness-2 argument): degree and component sizes of each layer
 *   cycle       `bbCycleSlots` / `bbScheduleCheck` / `bbCycleDetectors`: the depth-8 syndrome cycle of Table 5 and its tests (clashes, the parity rule for neighbouring X / Z checks,
 *               and a run on the stabilizer tableau whose detectors must stay silent)
 *   shifts      `bbShiftSummary`: what the translations of the torus do to the 12 logical qubits (matrix order, group size, distinct actions), in the paper's basis
 * Numpy twins: pipeline/make_bb2_fixtures.py (fixture qec-bb2.json) and pipeline/claims_papers/b2.py (every claim number).
 */
import { BBCode, GROSS_SPEC, TWO_GROSS_SPEC, bbCode, logicalXAction, makeLogicalSolver, paperLogicalBasis, type BBSpec, type Mono, type TannerEdge } from './bb'
import { cssDistance } from './codes'
import { GF2Matrix } from './gf2'
import { Tableau } from './tableau'
import { rng } from '../random'

/* ------------------------------------------------------------------ presets ------------------------------------------------------------------ */

export const BB_PRESET_NAMES = ['gross', 'two-gross', 'b72', 'b90', 'b108', 'b144', 'b288', 'b360', 'b756', 'toy-24', 'toric-3x3'] as const
export type BBPresetName = (typeof BB_PRESET_NAMES)[number]
export type BBForm = 'toric' | 'bravyi'

const mk = (name: string, l: number, m: number, A: Mono[], B: Mono[]): BBSpec => ({ name, l, m, A, B })

/** Table 3 of Bravyi et al. (v2): ℓ, m, A and B as printed (A, B = sums of monomials x^i y^j written as exponent pairs). */
export const BB_PRESETS: Readonly<Record<BBPresetName, BBSpec>> = {
  gross: GROSS_SPEC,
  'two-gross': TWO_GROSS_SPEC,
  b72: mk('b72', 6, 6, [[3, 0], [0, 1], [0, 2]], [[0, 3], [1, 0], [2, 0]]),
  b90: mk('b90', 15, 3, [[9, 0], [0, 1], [0, 2]], [[0, 0], [2, 0], [7, 0]]),
  b108: mk('b108', 9, 6, [[3, 0], [0, 1], [0, 2]], [[0, 3], [1, 0], [2, 0]]),
  b144: mk('b144', 12, 6, [[3, 0], [0, 1], [0, 2]], [[0, 3], [1, 0], [2, 0]]),
  b288: mk('b288', 12, 12, [[3, 0], [0, 2], [0, 7]], [[0, 3], [1, 0], [2, 0]]),
  b360: mk('b360', 30, 6, [[9, 0], [0, 1], [0, 2]], [[0, 3], [25, 0], [26, 0]]),
  b756: mk('b756', 21, 18, [[3, 0], [0, 10], [0, 17]], [[0, 5], [3, 0], [19, 0]]),
  'toy-24': mk('toy-24', 2, 6, [[0, 0], [0, 1], [0, 2]], [[0, 0], [0, 1], [1, 2]]),
  'toric-3x3': mk('toric-3x3', 3, 3, [[0, 0], [1, 0]], [[0, 0], [0, 1]]),
}

/** The spec of a preset; `form: 'bravyi'` turns the gross and two-gross presets into the same codes as Bravyi et al. write them (b144, b288). */
export function bbPreset(name: BBPresetName, form: BBForm = 'toric'): BBSpec {
  if (form === 'bravyi') {
    if (name === 'gross') return BB_PRESETS.b144
    if (name === 'two-gross') return BB_PRESETS.b288
  }
  return BB_PRESETS[name]
}

const CODES = new Map<string, BBCode>()
/** The built code of a preset (cached: building a 756-qubit code is not free). */
export function bbCodeOf(name: BBPresetName, form: BBForm = 'toric'): BBCode {
  const spec = bbPreset(name, form)
  const hit = CODES.get(spec.name)
  if (hit) return hit
  const code = bbCode(spec)
  CODES.set(spec.name, code)
  return code
}

/** A code from an authored spec (the recipe's `spec` parameter), cached by its content. */
export function bbCodeOfSpec(spec: BBSpec): BBCode {
  const key = JSON.stringify([spec.l, spec.m, spec.A, spec.B])
  const hit = CODES.get(key)
  if (hit) return hit
  const code = bbCode(spec)
  CODES.set(key, code)
  return code
}

/* ------------------------------------------------------------------ distances: computed, proved offline, or reported ------------------------------------------------------------------ */

export interface DistanceRecord {
  /** the number (for a bound: the bound) */
  value: number
  /** 'exact' computed by the page's own engine (n ≤ 32) · 'exact-offline' proved by a search kept as a fixture · 'reported' printed in the reference · 'bound' an upper bound printed in the reference */
  kind: 'exact' | 'exact-offline' | 'reported' | 'bound'
  source: string
}

const T3 = 'Bravyi et al. (arXiv:2308.07915 v2) Table 3'
const RECORDS: Partial<Record<BBPresetName, DistanceRecord>> = {
  b72: { value: 6, kind: 'exact-offline', source: 'meet-in-the-middle search over syndromes, weights up to 6 (fixture qec-bb2.json); printed in ' + T3 },
  b90: { value: 10, kind: 'reported', source: T3 },
  b108: { value: 10, kind: 'reported', source: T3 },
  b144: { value: 12, kind: 'reported', source: T3 },
  gross: { value: 12, kind: 'reported', source: T3 + ' and paper-tdg §2.1' },
  b288: { value: 18, kind: 'reported', source: T3 },
  'two-gross': { value: 18, kind: 'reported', source: T3 + ' and paper-tdg §2.1' },
  b360: { value: 24, kind: 'bound', source: T3 + ' (an upper bound: d ≤ 24)' },
  b756: { value: 34, kind: 'bound', source: T3 + ' (an upper bound: d ≤ 34)' },
}

/** Where the distance of a preset comes from. The two small examples are searched live (n ≤ 32). */
export function bbDistanceRecord(name: BBPresetName): DistanceRecord {
  const rec = RECORDS[name]
  if (rec) return rec
  const code = bbCodeOf(name)
  if (code.n > 32) throw new Error(`bbDistanceRecord: no distance on record for ${name}`)
  const r = cssDistance(code.css, { maxWeight: 6 })
  if (!r.exact) throw new Error(`bbDistanceRecord: the search for ${name} did not finish`)
  return { value: r.lower, kind: 'exact', source: `exhaustive search over all patterns of weight ≤ ${r.lower} (this page's engine)` }
}

/** k·d²/n with the distance on record (the Bravyi–Poulin–Terhal ratio). */
export const kd2n = (k: number, d: number, n: number): number => (k * d * d) / n

/* ------------------------------------------------------------------ presentations ------------------------------------------------------------------ */

export interface BBIsoMap {
  /** shift every L qubit by this monomial (after the row relabelling) */
  alpha: Mono
  /** shift every R qubit by this monomial */
  beta: Mono
  /** relabel the rows of the torus by y → y^u (u coprime to m); 1 = no relabelling */
  u: number
}

/** The maps that turn the paper-tdg form of each code into Bravyi et al.'s: A → yA, B → xB, and for the two-gross code also y → y^7. */
export const ISO_HINTS: Readonly<Record<'gross' | 'two-gross', BBIsoMap>> = {
  gross: { alpha: [0, 1], beta: [1, 0], u: 1 },
  'two-gross': { alpha: [0, 7], beta: [1, 0], u: 7 },
}

const wrap = (v: number, mod: number): number => ((v % mod) + mod) % mod

/** The qubit permutation of an isomorphism map on a code (L qubits and R qubits separately). */
export function isoPermutation(code: BBCode, map: BBIsoMap): number[] {
  const { l, m, cells } = code
  const perm = new Array<number>(code.n)
  for (let i = 0; i < l; i++)
    for (let j = 0; j < m; j++) {
      const c = i * m + j
      const jp = wrap(map.u * j, m)
      perm[c] = wrap(i + map.alpha[0], l) * m + wrap(jp + map.alpha[1], m)
      perm[cells + c] = cells + wrap(i + map.beta[0], l) * m + wrap(jp + map.beta[1], m)
    }
  return perm
}

const rowKeys = (H: GF2Matrix, perm: readonly number[]): string[] =>
  Array.from({ length: H.rows }, (_, r) =>
    H.rowSupport(r)
      .map((q) => perm[q])
      .sort((a, b) => a - b)
      .join(','),
  ).sort()

/** Does the map take the rows of H_X and H_Z of `from` exactly onto those of `to`? Returns the qubit permutation when it does, null otherwise. */
export function bbIsomorphism(from: BBCode, to: BBCode, map: BBIsoMap): number[] | null {
  if (from.l !== to.l || from.m !== to.m) return null
  const perm = isoPermutation(from, map)
  const same = (a: string[], b: string[]): boolean => a.length === b.length && a.every((s, i) => s === b[i])
  const ok = same(rowKeys(from.HX, perm), rowKeys(to.HX, Array.from({ length: to.n }, (_, q) => q))) && same(rowKeys(from.HZ, perm), rowKeys(to.HZ, Array.from({ length: to.n }, (_, q) => q)))
  return ok ? perm : null
}

/* ------------------------------------------------------------------ layers (thickness 2) ------------------------------------------------------------------ */

/** The name of the term an edge belongs to: X checks reach L by A and R by B, Z checks reach L by Bᵀ and R by Aᵀ ("A2" = the second monomial of A, or its transpose). */
export function edgeTerm(e: TannerEdge): string {
  const poly = e.checkKind === 'X' ? (e.qubitKind === 'L' ? 'A' : 'B') : e.qubitKind === 'L' ? 'B' : 'A'
  return `${poly}${e.term + 1}`
}

/** Bravyi et al.'s split (Lemma 2): the terms A2, A3, B3 in one layer, A1, B1, B2 in the other. */
export const BRAVYI_LAYER_1: readonly string[] = ['A2', 'A3', 'B3']

export interface LayerInfo {
  edges: number
  maxDegree: number
  /** sizes of the connected pieces, sorted, with how many there are of each size */
  components: { size: number; count: number }[]
}

export function bbLayers(code: BBCode, layer1: readonly string[] = BRAVYI_LAYER_1): { layers: [LayerInfo, LayerInfo]; layerOf: (e: TannerEdge) => 0 | 1 } {
  const layerOf = (e: TannerEdge): 0 | 1 => (layer1.includes(edgeTerm(e)) ? 0 : 1)
  const edges = code.tanner().edges
  const info = (layer: 0 | 1): LayerInfo => {
    const mine = edges.filter((e) => layerOf(e) === layer)
    const id = (e: TannerEdge): [string, string] => [`${e.checkKind}${e.check}`, `${e.qubitKind}${e.qubit % code.cells}`]
    const parent = new Map<string, string>()
    const find = (a: string): string => {
      let r = a
      while (parent.get(r) !== r) r = parent.get(r)!
      parent.set(a, r)
      return r
    }
    const degree = new Map<string, number>()
    for (const e of mine) {
      const [a, b] = id(e)
      for (const v of [a, b]) {
        if (!parent.has(v)) parent.set(v, v)
        degree.set(v, (degree.get(v) ?? 0) + 1)
      }
      parent.set(find(a), find(b))
    }
    const sizes = new Map<string, number>()
    for (const v of parent.keys()) sizes.set(find(v), (sizes.get(find(v)) ?? 0) + 1)
    const bySize = new Map<number, number>()
    for (const s of sizes.values()) bySize.set(s, (bySize.get(s) ?? 0) + 1)
    return { edges: mine.length, maxDegree: Math.max(0, ...degree.values()), components: [...bySize.entries()].sort((a, b) => a[0] - b[0]).map(([size, count]) => ({ size, count })) }
  }
  return { layers: [info(0), info(1)], layerOf }
}

/* ------------------------------------------------------------------ the depth-8 syndrome cycle (Bravyi et al. Table 5) ------------------------------------------------------------------ */

export type ScheduleVariant = 'printed' | 'swap-z-reads'
export const SCHEDULE_VARIANTS: readonly ScheduleVariant[] = ['printed', 'swap-z-reads']

export interface BBSlot {
  /** 1 … 8 */
  round: number
  check: 'X' | 'Z'
  /** which family of data qubit the check touches in this round */
  qubit: 'L' | 'R'
  /** the polynomial whose monomial gives the offset (X: L by A, R by B · Z: L by Bᵀ, R by Aᵀ) and which monomial (0, 1, 2 = the first, second, third) */
  poly: 'A' | 'B'
  term: 0 | 1 | 2
}

/**
 * The twelve (round, check, qubit family, term) slots of the cycle, from Table 5 of Bravyi et al. (as the tableau in the plan reads it): X acts on L by A2, A1, A3 in rounds 2, 6, 7 and on R by
 * B2, B1, B3 in rounds 3, 4, 5; Z reads R by A1ᵀ, A3ᵀ, A2ᵀ in rounds 1, 2, 6 and L by B1ᵀ, B2ᵀ, B3ᵀ in rounds 3, 4, 5. The Z checks are read out in round 7 and the X checks in round 8.
 * The variant swaps the rounds in which the Z checks read A1ᵀ and A2ᵀ.
 */
export function bbCycleSlots(variant: ScheduleVariant = 'printed'): BBSlot[] {
  const swap = variant === 'swap-z-reads'
  const s = (round: number, check: 'X' | 'Z', qubit: 'L' | 'R', poly: 'A' | 'B', term: 0 | 1 | 2): BBSlot => ({ round, check, qubit, poly, term })
  return [
    s(2, 'X', 'L', 'A', 1), s(6, 'X', 'L', 'A', 0), s(7, 'X', 'L', 'A', 2),
    s(3, 'X', 'R', 'B', 1), s(4, 'X', 'R', 'B', 0), s(5, 'X', 'R', 'B', 2),
    s(1, 'Z', 'R', 'A', swap ? 1 : 0), s(2, 'Z', 'R', 'A', 2), s(6, 'Z', 'R', 'A', swap ? 0 : 1),
    s(3, 'Z', 'L', 'B', 0), s(4, 'Z', 'L', 'B', 1), s(5, 'Z', 'L', 'B', 2),
  ].sort((a, b) => a.round - b.round || (a.check < b.check ? -1 : 1))
}

/** The data qubit a check in cell c touches in a slot (the polynomial's monomial added for an X check, subtracted for a Z check, whose matrices are transposed). */
export function slotQubit(code: BBCode, slot: BBSlot, c: number): number {
  const [i, j] = code.ring.cellOf(c)
  const [a, b] = (slot.poly === 'A' ? code.spec.A : code.spec.B)[slot.term]
  const sign = slot.check === 'X' ? 1 : -1
  const cell = code.ring.index(i + sign * a, j + sign * b)
  return slot.qubit === 'L' ? cell : code.cells + cell
}

export interface ScheduleReport {
  rounds: number
  /** (qubit, round) places asked for by two checks at once */
  clashes: number
  /** neighbouring ordered pairs (X check, Z check) whose shared qubits are reached by the X check first an odd number of times */
  badPairs: number
  /** the number of (X check, Z check) pairs looked at: cells² */
  pairs: number
  /** the most qubits any such pair shares */
  maxOverlap: number
  conflictFree: boolean
  valid: boolean
}

/** Clashes and the sequential-equivalence parity rule of Chapter B1, applied to the cycle on a BB code with three monomials in A and in B. */
export function bbScheduleCheck(code: BBCode, variant: ScheduleVariant = 'printed'): ScheduleReport {
  const slots = bbCycleSlots(variant)
  const cells = code.cells
  const touch: { X: Map<number, number>[]; Z: Map<number, number>[] } = { X: [], Z: [] }
  const use = new Map<string, number>()
  for (let c = 0; c < cells; c++) {
    for (const kind of ['X', 'Z'] as const) {
      const when = new Map<number, number>()
      for (const s of slots.filter((t) => t.check === kind)) {
        const q = slotQubit(code, s, c)
        when.set(q, s.round)
        const key = `${q}:${s.round}`
        use.set(key, (use.get(key) ?? 0) + 1)
      }
      touch[kind].push(when)
    }
  }
  const clashes = [...use.values()].filter((v) => v > 1).length
  let bad = 0
  let maxOverlap = 0
  for (let a = 0; a < cells; a++)
    for (let b = 0; b < cells; b++) {
      let shared = 0
      let xFirst = 0
      for (const [q, tx] of touch.X[a]) {
        const tz = touch.Z[b].get(q)
        if (tz === undefined) continue
        shared++
        if (tx < tz) xFirst++
      }
      if (shared > maxOverlap) maxOverlap = shared
      if (xFirst % 2) bad++
    }
  return { rounds: 8, clashes, badPairs: bad, pairs: cells * cells, maxOverlap, conflictFree: clashes === 0, valid: clashes === 0 && bad === 0 }
}

/** The edges of the cycle active in one round, as (check kind, check cell, qubit): at most one edge per qubit when the cycle is clash-free. */
export function bbRoundEdges(code: BBCode, variant: ScheduleVariant, round: number): { check: 'X' | 'Z'; cell: number; qubit: number; slot: BBSlot }[] {
  const out: { check: 'X' | 'Z'; cell: number; qubit: number; slot: BBSlot }[] = []
  for (const slot of bbCycleSlots(variant).filter((s) => s.round === round)) for (let c = 0; c < code.cells; c++) out.push({ check: slot.check, cell: c, qubit: slotQubit(code, slot, c), slot })
  return out
}

/** Qubits touched by two checks in the same round (the places the clash count counts). */
export function bbClashQubits(code: BBCode, variant: ScheduleVariant): number[] {
  const seen = new Map<string, number>()
  const bad = new Set<number>()
  for (let r = 1; r <= 8; r++)
    for (const e of bbRoundEdges(code, variant, r)) {
      const key = `${e.qubit}:${r}`
      if (seen.has(key)) bad.add(e.qubit)
      seen.set(key, 1)
    }
  return [...bad].sort((a, b) => a - b)
}

/** Steps for C cycles: the first cycle starts the checks (the plan's and the paper's 8C + 1 timesteps). */
export const cycleSteps = (cycles: number): number => 8 * cycles + 1

export interface DetectorReport {
  detectors: number
  nonzero: number
  clean: boolean
}

/**
 * Run `cycles` rounds of the syndrome cycle on a stabilizer tableau (data qubits first, then one ancilla per X check and one per Z check) from the all-zero state, with the
 * random measurement outcomes of a seeded generator, and compare every check's reading with its previous one. A correct cycle gives a detector that never fires; a cycle in
 * the wrong order does not. The Z readings of the first cycle are fixed by the start state, so the Z detectors begin there; the X detectors begin with the second cycle.
 */
export function bbCycleDetectors(code: BBCode, variant: ScheduleVariant = 'printed', cycles = 2, seed = 5): DetectorReport {
  const cells = code.cells
  const n = code.n
  const qX = (c: number): number => n + c
  const qZ = (c: number): number => n + cells + c
  const t = new Tableau(n + 2 * cells)
  const rand = rng(seed)
  const slots = bbCycleSlots(variant)
  const readZ = new Map<string, number>()
  const readX = new Map<string, number>()
  const out = (): 0 | 1 => (rand() < 0.5 ? 0 : 1)
  for (let cyc = 0; cyc < cycles; cyc++)
    for (let r = 1; r <= 8; r++) {
      for (let c = 0; c < cells; c++) {
        if (r === 1) t.reset(qX(c), out).h(qX(c))
        for (const s of slots.filter((u) => u.round === r)) {
          const q = slotQubit(code, s, c)
          if (s.check === 'X') t.cnot(qX(c), q)
          else t.cnot(q, qZ(c))
        }
        if (r === 7) readZ.set(`${c}:${cyc}`, t.measureZ(qZ(c), out).outcome)
        if (r === 8) {
          t.h(qX(c))
          readX.set(`${c}:${cyc}`, t.measureZ(qX(c), out).outcome)
          t.reset(qZ(c), out)
        }
      }
    }
  let detectors = 0
  let nonzero = 0
  for (let c = 0; c < cells; c++)
    for (let cyc = 0; cyc < cycles; cyc++) {
      detectors++
      if ((readZ.get(`${c}:${cyc}`)! ^ (cyc ? readZ.get(`${c}:${cyc - 1}`)! : 0)) === 1) nonzero++
      if (cyc) {
        detectors++
        if ((readX.get(`${c}:${cyc}`)! ^ readX.get(`${c}:${cyc - 1}`)!) === 1) nonzero++
      }
    }
  return { detectors, nonzero, clean: nonzero === 0 }
}

/* ------------------------------------------------------------------ what the translations do to the logical qubits ------------------------------------------------------------------ */

const keyOf = (M: GF2Matrix): string => Array.from({ length: M.rows }, (_, i) => M.rowBits(i).join('')).join('/')
const onesOf = (M: GF2Matrix): number => Array.from({ length: M.rows }, (_, i) => M.rowWeight(i)).reduce((s, w) => s + w, 0)

/** The smallest e ≥ 1 with M^e = I (null when it exceeds `cap`). */
export function matrixOrder(M: GF2Matrix, cap = 200): number | null {
  const id = keyOf(GF2Matrix.identity(M.rows))
  let P = M
  for (let e = 1; e <= cap; e++) {
    if (keyOf(P) === id) return e
    P = P.mul(M)
  }
  return null
}

/** The number of elements of the group generated by the matrices (null above `cap`). */
export function matrixGroupOrder(gens: readonly GF2Matrix[], cap = 100000): number | null {
  const I = GF2Matrix.identity(gens[0].rows)
  const seen = new Set<string>([keyOf(I)])
  let frontier = [I]
  while (frontier.length) {
    const next: GF2Matrix[] = []
    for (const M of frontier)
      for (const g of gens) {
        const P = M.mul(g)
        const k = keyOf(P)
        if (!seen.has(k)) {
          seen.add(k)
          next.push(P)
        }
      }
    frontier = next
    if (seen.size > cap) return null
  }
  return seen.size
}

/** The 12 × 12 matrix of the translation x^a y^b on the paper's X logical basis (row i, column j = 1 when the image of X̄_j contains X̄_i). */
export function logicalShiftMatrix(code: BBCode, which: 'gross' | 'two-gross', a: number, b: number): GF2Matrix {
  const basis = paperLogicalBasis(code, which)
  const solver = makeLogicalSolver(code, basis.X)
  const M = logicalXAction(code, basis.X, code.shiftPermutation(a, b), solver)
  if (!M) throw new Error(`logicalShiftMatrix: the shift x^${a} y^${b} leaves the logical space`)
  return M
}

/** Does a permutation of the qubits take the rows of H_X onto rows of H_X and those of H_Z onto rows of H_Z (as sets)? */
export function permutationPreserves(code: BBCode, perm: readonly number[]): boolean {
  const identity = Array.from({ length: code.n }, (_, q) => q)
  return [code.HX, code.HZ].every((H) => {
    const have = new Set(rowKeys(H, identity))
    return rowKeys(H, perm).every((k) => have.has(k))
  })
}

export interface ShiftSummary {
  /** how many of the ℓm translations keep both check spaces */
  preserved: number
  /** swapping two qubits (0 and 1) keeps them? */
  swapPreserves: boolean
  orderX: number
  orderY: number
  /** ones in the matrix of x in the paper's basis (depends on the basis) */
  onesX: number
  /** distinct logical actions among the ℓm translations, and how many are the identity */
  distinct: number
  trivial: number
  /** the order of the group the actions of x and y generate */
  groupOrder: number
}

const SUMMARIES = new Map<string, ShiftSummary>()
export function bbShiftSummary(which: 'gross' | 'two-gross'): ShiftSummary {
  const hit = SUMMARIES.get(which)
  if (hit) return hit
  const code = bbCodeOf(which)
  const basis = paperLogicalBasis(code, which)
  const solver = makeLogicalSolver(code, basis.X)
  const act = (a: number, b: number): GF2Matrix => logicalXAction(code, basis.X, code.shiftPermutation(a, b), solver)!
  let preserved = 0
  const classes = new Map<string, number>()
  const idKey = keyOf(GF2Matrix.identity(12))
  for (let a = 0; a < code.l; a++)
    for (let b = 0; b < code.m; b++) {
      if (code.shiftPreservesCode(a, b)) preserved++
      const k = keyOf(act(a, b))
      classes.set(k, (classes.get(k) ?? 0) + 1)
    }
  const Mx = act(1, 0)
  const My = act(0, 1)
  const swap = Array.from({ length: code.n }, (_, q) => q)
  ;[swap[0], swap[1]] = [1, 0]
  const out: ShiftSummary = {
    preserved,
    swapPreserves: permutationPreserves(code, swap),
    orderX: matrixOrder(Mx)!,
    orderY: matrixOrder(My)!,
    onesX: onesOf(Mx),
    distinct: classes.size,
    trivial: classes.get(idKey) ?? 0,
    groupOrder: matrixGroupOrder([Mx, My])!,
  }
  SUMMARIES.set(which, out)
  return out
}
