/**
 * Qubit-count arithmetic the lectures show: how many physical qubits one logical qubit costs in a rotated surface code of distance d, what a bivariate
 * bicycle module (data plus check qubits) holds, the ratios between them, and the counts of the bicycle instructions. Pure TypeScript.
 *
 * The rule of this file: a function here is ARITHMETIC on a stated layout, and its docstring says where the layout is stated. Anything that comes from a
 * simulation or an estimate in the paper (logical error rates, the size of a magic-state factory, the LPU census, a whole-machine qubit total) is NOT computed:
 * it is a REPORTED constant with its location, so a lecture can show it in the "reported" style and no displayed computation can silently depend on it.
 * Where a formula uses a distance (the adapter size 2(d − 1)), the distance is a parameter; the paper's d = 12 and 18 are inputs, not results.
 */

/* ------------------------------------------------------------------ surface code ------------------------------------------------------------------ */

/** Data qubits of the rotated surface code of distance d: d² (layout of codes.ts `rotatedSurfaceCode`, the one in Horsman et al. 2012 / Fowler et al. 2012). */
export const surfaceDataQubits = (d: number): number => {
  checkOdd(d, 'surfaceDataQubits')
  return d * d
}

/** Check (measurement) qubits of the rotated surface code of distance d: one per check, d² − 1. */
export const surfaceCheckQubits = (d: number): number => {
  checkOdd(d, 'surfaceCheckQubits')
  return d * d - 1
}

/** Physical qubits for ONE logical qubit in a rotated surface code of distance d, counting a measurement qubit per check: d² + (d² − 1) = 2d² − 1. */
export const surfaceQubitsPerLogical = (d: number): number => surfaceDataQubits(d) + surfaceCheckQubits(d)

/** Physical qubits for L logical qubits as L separate surface-code patches of distance d (no sharing of boundaries, no routing space): L(2d² − 1). */
export function surfaceQubitsForLogical(logical: number, d: number): number {
  if (!Number.isInteger(logical) || logical < 0) throw new Error('surfaceQubitsForLogical: the number of logical qubits must be a whole number ≥ 0')
  return logical * surfaceQubitsPerLogical(d)
}

function checkOdd(d: number, who: string): void {
  if (!Number.isInteger(d) || d < 1 || d % 2 === 0) throw new Error(`${who}: d must be an odd whole number (the rotated surface code is defined for odd d); got ${d}`)
}

/* ------------------------------------------------------------------ bivariate bicycle modules ------------------------------------------------------------------ */

export interface ModuleCount {
  /** data qubits, 2ℓm */
  data: number
  /** check qubits, one per check: ℓm X checks and ℓm Z checks */
  checks: number
  /** c = data + checks = 4ℓm (paper-tdg §2.2 "Idle instruction parameters", p. 10: 288 and 576 for the gross and two-gross codes; Table 1, p. 6, column c) */
  total: number
}

/** The qubits of one code module on an ℓ × m torus: 2ℓm data, 2ℓm check qubits, c = 4ℓm in all (paper-tdg p. 10). */
export function bbModuleQubits(l: number, m: number): ModuleCount {
  if (!Number.isInteger(l) || !Number.isInteger(m) || l < 1 || m < 1) throw new Error('bbModuleQubits: ℓ and m must be positive whole numbers')
  return { data: 2 * l * m, checks: 2 * l * m, total: 4 * l * m }
}

/** n / k: data qubits per logical qubit, the encoding cost of the code alone (no check qubits). */
export function dataPerLogical(n: number, k: number): number {
  if (k <= 0) throw new Error('dataPerLogical: k must be positive')
  return n / k
}

/** c / k: physical qubits (data and check) per logical qubit in a module that holds k logical qubits. */
export function modulePerLogical(total: number, k: number): number {
  if (k <= 0) throw new Error('modulePerLogical: k must be positive')
  return total / k
}

/**
 * How many times more physical qubits k separate rotated surface codes of distance d use than one module of `moduleTotal` qubits holding k logical qubits:
 * k(2d² − 1) / c. Arithmetic only: whether a distance-d surface code has "comparable" protection is a claim about error rates, which is reported by the paper
 * (§4, Fig. 1, p. 3 and p. 17), not computed here.
 */
export function surfaceToModuleRatio(k: number, moduleTotal: number, dSurface: number): number {
  return surfaceQubitsForLogical(k, dSurface) / moduleTotal
}

/** The code-code adapter of paper-tdg §2.4 (p. 14): a = 2|B| = 2(d − 1) check qubits for a bridge of d − 1 qubits (22 and 34 for d = 12 and 18). d is an input. */
export function adapterQubits(d: number): number {
  if (!Number.isInteger(d) || d < 2) throw new Error('adapterQubits: d must be a whole number ≥ 2')
  return 2 * (d - 1)
}

/** The code-factory adapter to a surface-code factory of distance d_f (paper-tdg p. 14): a′ = 2 d_f − 1. */
export function codeFactoryAdapterQubits(dFactory: number): number {
  if (!Number.isInteger(dFactory) || dFactory < 1) throw new Error('codeFactoryAdapterQubits: the factory distance must be a whole number ≥ 1')
  return 2 * dFactory - 1
}

/** The number of independent cycles of a connected graph with V vertices and E edges: E − V + 1 (paper-tdg App. A.3, p. 48: 18 − 12 + 1 = 7 for the gross LPU's left half). */
export function cycleBasisSize(vertices: number, edges: number): number {
  if (!Number.isInteger(vertices) || !Number.isInteger(edges) || vertices < 1 || edges < vertices - 1) throw new Error('cycleBasisSize: a connected graph needs edges ≥ vertices − 1')
  return edges - vertices + 1
}

/* ------------------------------------------------------------------ instruction counts ------------------------------------------------------------------ */

export interface InstructionCounts {
  /** shift automorphisms: six code automorphisms and their inverses (paper-tdg p. 5 and p. 10) */
  shifts: number
  /** in-module measurements: the non-trivial Paulis of the group ⟨X̄₁, Z̄₁, X̄₇, Z̄₇⟩, 2⁴ − 1 (paper-tdg p. 6) */
  inModule: number
  /** inter-module measurements: (⟨X̄₁, Z̄₇⟩ ∪ ⟨X̄₇, Z̄₁⟩)^{⊗2}, six non-trivial Paulis per side, 6 × 6 (paper-tdg p. 6) */
  interModule: number
  /** T injections: P̄ ∈ {X̄₁, Ȳ₁, Z̄₁, X̄₇, Ȳ₇, Z̄₇} (paper-tdg p. 6) */
  tInjection: number
  /** the logical classes of shift automorphisms: ℓm shifts reduced by the shifts that act trivially (⟨x⁶, y⁶⟩, order 4 for two-gross, 2 for gross); the paper says 36 (p. 6, p. 47) */
  shiftClasses: number
}

/**
 * The counts of the bicycle instructions from their definitions (paper-tdg p. 5-6), as counting rather than quoting: 2·6 shifts, 2⁴ − 1 in-module Paulis,
 * (3 + 3)² inter-module products (the two groups ⟨X̄₁, Z̄₇⟩ and ⟨X̄₇, Z̄₁⟩ each have three non-trivial elements and meet only in the identity), 6 T injections.
 * `shiftClasses` takes the torus size: ℓm divided by the order of the subgroup of shifts that act as the logical identity (x⁶ and y⁶ for the paper's ℓ = 12).
 */
export function instructionCounts(l: number, m: number): InstructionCounts {
  const trivialOrder = (l % 6 === 0 ? l / 6 : 1) * (m % 6 === 0 ? m / 6 : 1) // order of ⟨x⁶, y⁶⟩ on the torus: x⁶ has order ℓ/6, y⁶ has order m/6
  return {
    shifts: 6 * 2,
    inModule: 2 ** 4 - 1,
    interModule: (3 + 3) ** 2,
    tInjection: 6,
    shiftClasses: (l * m) / trivialOrder,
  }
}

/* ------------------------------------------------------------------ reported numbers (NOT computed here) ------------------------------------------------------------------ */

/**
 * paper-tdg Table 1 (p. 6): physical qubits per module component, as printed. c and a are reproduced by `bbModuleQubits` and `adapterQubits`; u (the LPU, a
 * census of its sets in Fig. 5 on p. 12), f (the T factory, from the cultivation and distillation estimates of §2.5) and a′ (from the factory distance) are the
 * paper's own estimates and are used only as reported. `f` is keyed by the physical error rate p of the estimate.
 */
export const REPORTED_TABLE_1 = {
  gross: { c: 288, u: 90, a: 22, f: { 'p=1e-3': 454, 'p=1e-4': 810 }, aPrime: { 'p=1e-3': 29, 'p=1e-4': 13 } },
  'two-gross': { c: 576, u: 158, a: 34, f: { 'p=1e-3': 463, 'p=1e-4': 18600 }, aPrime: { 'p=1e-3': 29, 'p=1e-4': 49 } },
  where: 'paper-tdg Table 1, p. 6 (u from Fig. 5, p. 12; a and a′ from §2.4, p. 14)',
} as const
