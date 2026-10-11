/**
 * Oracle algorithms with a hidden pattern (P-Q16-story §9.1; Bergou §7.1 Deutsch–Jozsa pp. 117–119 and §7.2 Bernstein–Vazirani
 * pp. 119–120; N&C §1.4.4 pp. 34–36): the helpers chapter Q16 reads. The circuits are built here from the circuit module, so the
 * story, the tests and the numpy twin (pipeline/make_oracles_fixtures.py) all look at one object per circuit.
 *
 * Conventions. n input bits, N = 2ⁿ strings; a string is read as an index with q0 (the top wire) the most significant bit
 * (state.ts); a truth table is f[x] for x = 0 … N − 1. x·z = Σ_j x_j z_j mod 2 (`dotMod2`). Two circuit forms, exactly as the plan
 * names them:
 *   - 'ancilla' (Bergou's Fig. 7.1): n input wires and one target in |−⟩, H on the inputs, the f-CNOT U_f, H on the inputs;
 *   - 'phase' (Q5's kickback form): n wires, H, the phase oracle |x⟩ → (−1)^{f(x)}|x⟩, H. Both end in the same n-bit state, because
 *     the target in |−⟩ turns U_f into the phase oracle (phase kickback).
 * The cost helpers count queries to a classical black box: an exact minimax over every decision tree (n ≤ 3, where the whole game fits
 * in memory), the closed form 2^{n−1} + 1 that the minimax confirms, and the chance that k distinct random queries miss a balanced f.
 */
import type { Vec } from '../linalg'
import { type Bit, type TruthTable, dotMod2, gf2Rank, hammingWeight, isBalanced, isConstant } from './bits'
import { type Circuit, type GateOp, type MeasureOp, type Op, type OracleOp, runCircuit } from './circuit'
import { marginal, probs } from './measure'

const SUB = '₀₁₂₃₄₅₆₇₈₉'
const sub = (k: number): string => String(k).split('').map((d) => SUB[Number(d)]).join('')

/** The most input bits any helper here takes (the circuit stage draws at most 5 wires: 4 inputs and a target). */
export const ORACLE_MAX_N = 4

function checkN(n: number, who: string, max = ORACLE_MAX_N): void {
  if (!Number.isInteger(n) || n < 1 || n > max) throw new Error(`${who}: n must be a whole number from 1 to ${max} (got ${n})`)
}

/* ------------------------------------------------------------------ the Walsh sum and the sign formula ------------------------------------------------------------------ */

/**
 * Σ over all x of (−1)^{x·z}, by enumeration of the 2ⁿ strings (Bergou Eqs. 7.10–7.11): 2ⁿ when z = 0 (every term is +1) and 0 for every
 * other z (half the strings give −1). z is an index 0 … 2ⁿ − 1.
 */
export function walshSum(z: number, n: number): number {
  checkN(n, 'walshSum', 12)
  if (!Number.isInteger(z) || z < 0 || z >= 2 ** n) throw new Error(`walshSum: z must be a string of ${n} bits (0 … ${2 ** n - 1})`)
  let s = 0
  for (let x = 0; x < 2 ** n; x++) s += dotMod2(x, z) ? -1 : 1
  return s
}

/** The amplitudes of H^{⊗n}|x⟩ in the closed form 2^{−n/2}(−1)^{x·z}, for z = 0 … 2ⁿ − 1 (Bergou Eqs. 7.1–7.2). */
export function hadamardColumn(x: number, n: number): number[] {
  checkN(n, 'hadamardColumn', 12)
  if (!Number.isInteger(x) || x < 0 || x >= 2 ** n) throw new Error(`hadamardColumn: x must be a string of ${n} bits (0 … ${2 ** n - 1})`)
  const k = 1 / Math.sqrt(2 ** n)
  return Array.from({ length: 2 ** n }, (_, z) => (dotMod2(x, z) ? -k : k))
}

/** The number of strings z for which x·z = 1: 2^{n−1} for every x ≠ 0, none for x = 0. */
export const dotOddCount = (x: number, n: number): number => Array.from({ length: 2 ** n }, (_, z) => dotMod2(x, z)).reduce<number>((s, v) => s + v, 0)

/* ------------------------------------------------------------------ the functions ------------------------------------------------------------------ */

/** f(x) = a·x ⊕ b on n bits (Bergou Eq. 7.8): a is the hidden string (an index), b the hidden bit. */
export function bvTable(a: number, b: number, n: number): TruthTable {
  checkN(n, 'bvTable')
  if (!Number.isInteger(a) || a < 0 || a >= 2 ** n) throw new Error(`bvTable: a must be a string of ${n} bits (0 … ${2 ** n - 1})`)
  if (b !== 0 && b !== 1) throw new Error('bvTable: b must be 0 or 1')
  return Array.from({ length: 2 ** n }, (_, x) => (dotMod2(a, x) ^ b) as Bit)
}

/** Every balanced truth table on n bits (n ≤ 4), in increasing order of their bit pattern: C(2ⁿ, 2ⁿ⁻¹) of them. */
export function balancedTables(n: number): TruthTable[] {
  checkN(n, 'balancedTables')
  const N = 2 ** n
  const out: TruthTable[] = []
  for (let m = 0; m < 2 ** N; m++)
    if (hammingWeight(m) === N / 2) out.push(Array.from({ length: N }, (_, x) => ((m >> x) & 1) as Bit))
  return out
}

/** What a promised f is: 'constant', 'balanced', or 'neither' (outside the promise). */
export const djVerdict = (t: readonly Bit[]): 'constant' | 'balanced' | 'neither' => (isConstant(t) ? 'constant' : isBalanced(t) ? 'balanced' : 'neither')

/**
 * The balanced "step" function on n bits (the plan's F_BALN at n = 3): f(x) = 1 exactly for x = 1 … 2^{n−1}, so N/2 strings are marked and 0 is not. It is balanced
 * for every n ≥ 1 and is NOT of the form a·x ⊕ b once n ≥ 3 (for n ≤ 2 every balanced function is linear or the complement of a linear one). The oracle bench's
 * "balanced, not linear" function.
 */
export function balancedStepTable(n: number): TruthTable {
  checkN(n, 'balancedStepTable')
  const N = 2 ** n
  return Array.from({ length: N }, (_, x) => (x >= 1 && x <= N / 2 ? 1 : 0) as Bit)
}

/** The three functions the oracle bench offers for Deutsch–Jozsa: f ≡ b, f = a·x ⊕ b (a = 0 gives the constant b), and the balanced step function. */
export const DJ_FAMILIES = ['constant', 'linear', 'balanced'] as const
export type DjFamily = (typeof DJ_FAMILIES)[number]

/** The truth table of a bench function: `constant` ignores a, `balanced` ignores a and b, `linear` is `bvTable(a, b, n)`. */
export function djFamilyTable(family: DjFamily, n: number, a: number, b: Bit): TruthTable {
  checkN(n, 'djFamilyTable')
  if (family === 'constant') return Array.from({ length: 2 ** n }, () => b)
  if (family === 'balanced') return balancedStepTable(n)
  return bvTable(a, b, n)
}

/** How many strings x have f(x) = 1 (the minus signs of the phase oracle). */
export const onesCount = (t: readonly Bit[]): number => t.reduce<number>((s, v) => s + v, 0)

/**
 * The most likely reading of a register state: the string (first wire = most significant bit) with the largest chance, `p` its chance, and `ties` how many strings
 * share that chance (within 1e-9; the smallest index is reported). A state that lands on one string has ties = 1 and p = 1.
 */
export function mostLikelyString(psi: Vec): { index: number; bits: string; p: number; ties: number } {
  const n = Math.log2(psi.length)
  if (!Number.isInteger(n) || n < 1) throw new Error('mostLikelyString: a register of at least one qubit (2ⁿ amplitudes)')
  const p = probs(psi)
  const best = Math.max(...p)
  const index = p.findIndex((v) => best - v < 1e-9)
  return { index, bits: index.toString(2).padStart(n, '0'), p: p[index], ties: p.filter((v) => best - v < 1e-9).length }
}

/* ------------------------------------------------------------------ the circuits ------------------------------------------------------------------ */

const hLayer = (n: number): GateOp[] => Array.from({ length: n }, (_, q) => ({ op: 'gate', gate: 'H', targets: [q] }))
/** Wire names x_{n−1} … x_0, top to bottom (q0 is the most significant bit), with the target named y in the ancilla form. */
export const inputWires = (n: number): string[] => Array.from({ length: n }, (_, q) => `x${sub(n - 1 - q)}`)

/**
 * Deutsch–Jozsa on a truth table of 2ⁿ entries, n ≤ 4. 'ancilla' = Bergou's Fig. 7.1: n + 1 wires, init 0…0 and |−⟩, columns [H on the
 * inputs], [U_f], [H on the inputs]. 'phase' = the kickback form: n wires, init 0…0, columns [H], [phase oracle O_f], [H].
 */
export function djCircuit(table: readonly Bit[], form: 'ancilla' | 'phase'): Circuit {
  const n = Math.log2(table.length)
  checkN(n, 'djCircuit')
  const t = [...table] as Bit[]
  const inputs = Array.from({ length: n }, (_, q) => q)
  if (form === 'ancilla') {
    const U: OracleOp = { op: 'oracle', mode: 'xor', table: t, inputs, target: n, label: 'U_f' }
    return { version: 1, qubits: n + 1, init: `${'0'.repeat(n)}-`, wires: [...inputWires(n), 'y'], columns: [hLayer(n), [U], hLayer(n)] }
  }
  const O: OracleOp = { op: 'oracle', mode: 'phase', table: t, inputs, label: 'O_f' }
  return { version: 1, qubits: n, init: '0'.repeat(n), wires: inputWires(n), columns: [hLayer(n), [O], hLayer(n)] }
}

/** Bernstein–Vazirani on f(x) = a·x ⊕ b: the Deutsch–Jozsa circuit in its phase form, on the table of `bvTable`. */
export const bvCircuit = (a: number, b: number, n: number): Circuit => djCircuit(bvTable(a, b, n), 'phase')

/** A column of H on every one of n wires, starting from the string x: the circuit of H^{⊗n}|x⟩ (one column, or two when `twice`). */
export function hadamardRun(x: number, n: number, twice = false): Circuit {
  checkN(n, 'hadamardRun')
  if (!Number.isInteger(x) || x < 0 || x >= 2 ** n) throw new Error(`hadamardRun: x must be a string of ${n} bits (0 … ${2 ** n - 1})`)
  return { version: 1, qubits: n, init: x.toString(2).padStart(n, '0'), wires: inputWires(n), columns: twice ? [hLayer(n), hLayer(n)] : [hLayer(n)] }
}

/** One classical query: the f-CNOT alone, inputs set to the string x and the target to 0, so the target ends as f(x). */
export function queryCircuit(table: readonly Bit[], x: number): Circuit {
  const n = Math.log2(table.length)
  checkN(n, 'queryCircuit')
  if (!Number.isInteger(x) || x < 0 || x >= 2 ** n) throw new Error(`queryCircuit: x must be a string of ${n} bits (0 … ${2 ** n - 1})`)
  const U: OracleOp = { op: 'oracle', mode: 'xor', table: [...table] as Bit[], inputs: Array.from({ length: n }, (_, q) => q), target: n, label: 'f' }
  return { version: 1, qubits: n + 1, init: `${x.toString(2).padStart(n, '0')}0`, wires: [...inputWires(n), 'y'], columns: [[U]] }
}

/* ------------------------------------------------------------------ the closed forms the circuits must reproduce ------------------------------------------------------------------ */

/**
 * The amplitude of |z⟩ at the end of Deutsch–Jozsa: 2^{−n} Σ_x (−1)^{f(x) + x·z} (Bergou Eqs. 7.6–7.7; z = 0 is the all-zeros string).
 * For a constant f it is (−1)^{f(0)} at z = 0 and 0 elsewhere; for a balanced f it is 0 at z = 0.
 */
export function djOutputAmplitude(table: readonly Bit[], z = 0): number {
  const n = Math.log2(table.length)
  checkN(n, 'djOutputAmplitude')
  let s = 0
  for (let x = 0; x < table.length; x++) s += (table[x] ^ dotMod2(x, z)) & 1 ? -1 : 1
  return s / table.length
}

/** The mean of the signs (−1)^{f(x)}: the amplitude at z = 0 is this mean (Eq. 7.7). */
export const signMean = (table: readonly Bit[]): number => table.reduce<number>((s, v) => s + (v ? -1 : 1), 0) / table.length

/* ------------------------------------------------------------------ classical query cost ------------------------------------------------------------------ */

/**
 * The fewest queries that always settle "constant or balanced" for a deterministic classical algorithm: 2^{n−1} + 1 (Bergou p. 117; N&C
 * p. 35 writes 2ⁿ/2 + 1). An adversary may answer the first 2^{n−1} distinct queries alike, and a constant f and a balanced f still fit; one
 * more query then settles it. `djMinimaxQueries` checks this against every strategy for n ≤ 3.
 */
export function djDeterministicWorst(n: number): number {
  checkN(n, 'djDeterministicWorst', 30)
  return 2 ** (n - 1) + 1
}

/**
 * The exact worst case of the best deterministic strategy, by minimax over every decision tree (n = 1, 2, 3): the algorithm picks the next
 * string to ask, the adversary picks the answer (0 or 1) that keeps the verdict open, among the 2 constant and the C(2ⁿ, 2ⁿ⁻¹) balanced
 * functions still consistent with the answers so far. The value of a position is 0 once every consistent function shares one verdict.
 */
export function djMinimaxQueries(n: number): number {
  checkN(n, 'djMinimaxQueries', 3)
  const N = 2 ** n
  const full = 2 ** N - 1
  const funcs: number[] = [0, full]
  for (let m = 1; m < full; m++) if (hammingWeight(m) === N / 2) funcs.push(m)
  const isConst = (m: number): boolean => m === 0 || m === full
  const memo = new Map<number, number>()
  // a position is the set of strings already asked (a bit mask) and the answers given (bit x = the answer for x)
  const value = (asked: number, ans: number): number => {
    const key = asked * 2 ** N + ans
    const hit = memo.get(key)
    if (hit !== undefined) return hit
    const alive = funcs.filter((m) => (m & asked) === ans)
    const nConst = alive.filter(isConst).length
    let best = 0
    if (nConst !== 0 && nConst !== alive.length) {
      best = Infinity
      for (let x = 0; x < N; x++) {
        if ((asked >> x) & 1) continue
        let worst = 0
        for (const bit of [0, 1])
          if (alive.some((m) => ((m >> x) & 1) === bit)) worst = Math.max(worst, 1 + value(asked | (1 << x), ans | (bit << x)))
        best = Math.min(best, worst)
      }
    }
    memo.set(key, best)
    return best
  }
  return value(0, 0)
}

/**
 * The chance that k distinct random queries to a BALANCED f all give the same answer, so that "constant" would be announced wrongly:
 * 2·C(N/2, k)/C(N, k) for 1 ≤ k ≤ N/2 (0 beyond), which is about 2^{1−k} for N much larger than k. N is the number of strings (even); k = 0
 * gives 1. Computed as a running product so N = 1024 needs no huge binomial.
 */
export function djRandomMiss(N: number, k: number): number {
  if (!Number.isInteger(N) || N < 2 || N % 2 !== 0) throw new Error(`djRandomMiss: N must be an even whole number of at least 2 (got ${N})`)
  if (!Number.isInteger(k) || k < 0 || k > N) throw new Error(`djRandomMiss: k must be a whole number from 0 to N (got ${k})`)
  if (k === 0) return 1
  if (k > N / 2) return 0
  let p = 2
  for (let i = 0; i < k; i++) p *= (N / 2 - i) / (N - i)
  return p
}

/**
 * Bergou's classical method for f(x) = a·x ⊕ b (p. 120): ask for 00…0 to get b, then for each string with a single 1 to get one bit of
 * a (a_j = f(e_j) ⊕ b). That is n + 1 queries, listed in the order asked. Throws when the table is not of the form a·x ⊕ b.
 */
export function bvClassicalRun(table: readonly Bit[], n: number): { asked: number[]; a: number; b: Bit } {
  checkN(n, 'bvClassicalRun')
  if (table.length !== 2 ** n) throw new Error(`bvClassicalRun: a table on ${n} bits has ${2 ** n} entries`)
  const asked: number[] = [0]
  const b = table[0]
  let a = 0
  for (let j = n - 1; j >= 0; j--) {
    const e = 1 << j
    asked.push(e)
    if (table[e] ^ b) a |= e
  }
  // the method trusts the form: confirm the rebuilt function equals the table
  const back = bvTable(a, b, n)
  if (back.some((v, x) => v !== table[x])) throw new Error('bvClassicalRun: the table is not a·x ⊕ b')
  return { asked, a, b }
}

/* ------------------------------------------------------------------ Simon's problem (Chapter Q18; Bergou §7.4 p. 126, N&C §5.4.3 p. 241) ------------------------------------------------------------------ */

/** The most input bits Simon's circuit is built for: n inputs and n − 1 answer wires must fit the stage's five wires. The tables and counts take up to SIMON_MATH_MAX_N. */
export const SIMON_MAX_N = 3
export const SIMON_MATH_MAX_N = 6

function checkSimon(s: number, n: number, who: string, max = SIMON_MAX_N): void {
  if (!Number.isInteger(n) || n < 2 || n > max) throw new Error(`${who}: n must be a whole number from 2 to ${max} (got ${n})`)
  if (!Number.isInteger(s) || s < 1 || s >= 2 ** n) throw new Error(`${who}: s must be a nonzero string of ${n} bits (got ${s})`)
}

/**
 * Simon's function f(x) = f(x ⊕ s) on n bits: the two strings of a pair {x, x ⊕ s} answer alike and different pairs answer differently (Eq. 7.30). The answer of the
 * pair is the rank of its smaller member among the pairs' smaller members, so the answers are the numbers 0 … 2^{n−1} − 1 and n − 1 answer wires hold them. For
 * s = 110 on three bits this is [0, 1, 2, 3, 2, 3, 0, 1] (the pairs {000,110}, {001,111}, {010,100}, {011,101} answer 0, 1, 2, 3).
 */
export function simonTable(s: number, n: number): number[] {
  checkSimon(s, n, 'simonTable', SIMON_MATH_MAX_N)
  const reps = Array.from({ length: 2 ** n }, (_, x) => Math.min(x, x ^ s))
  const sorted = [...new Set(reps)].sort((a, b) => a - b)
  return reps.map((r) => sorted.indexOf(r))
}

/** The truth table of each answer bit, most significant first: bit j of the answer as a function of x (the tables of the oracle columns). */
export function simonBitTables(s: number, n: number): Bit[][] {
  const f = simonTable(s, n)
  return Array.from({ length: n - 1 }, (_, j) => f.map((v) => ((v >> (n - 2 - j)) & 1) as Bit))
}

/**
 * Simon's circuit on n + (n − 1) wires from 0…0 (Bergou Fig. 7.5 form): [H on the n input wires], one xor-oracle column per answer bit (inputs 0 … n−1, target n + j),
 * [measure every answer wire], [H on the input wires]. Five columns for n = 3. With `outcomes` (the answer read, e.g. '01') the stage collapses the answer wires.
 */
export function simonCircuit(s: number, n: number): Circuit {
  checkSimon(s, n, 'simonCircuit')
  const inputs = Array.from({ length: n }, (_, q) => q)
  const h = (): Op[] => inputs.map((q): GateOp => ({ op: 'gate', gate: 'H', targets: [q] }))
  const oracles: Op[][] = simonBitTables(s, n).map((table, j): Op[] => [{ op: 'oracle', mode: 'xor', table, inputs, target: n + j, label: 'U_f' }])
  const measures: Op[] = Array.from({ length: n - 1 }, (_, j): MeasureOp => ({ op: 'measure', qubit: n + j, bit: j }))
  const wires = [...inputs.map((q) => `x${sub(n - 1 - q)}`), ...Array.from({ length: n - 1 }, (_, j) => `f${sub(n - 2 - j)}`)]
  return { version: 1, qubits: 2 * n - 1, clbits: n - 1, init: '0'.repeat(2 * n - 1), wires, columns: [h(), ...oracles, measures, h()] }
}

/** The strings y with y·s = 0 (mod 2), as numbers in increasing order: s^⊥, 2^{n−1} of them. */
export function simonPerp(s: number, n: number): number[] {
  checkSimon(s, n, 'simonPerp', SIMON_MATH_MAX_N)
  return Array.from({ length: 2 ** n }, (_, y) => y).filter((y) => dotMod2(y, s) === 0)
}

/** The chance of each y after Simon's last H, whatever the answer read: 2^{-(n−1)} on s^⊥ and 0 elsewhere (Eq. 7.33 corrected). */
export function simonYDistribution(s: number, n: number): number[] {
  checkSimon(s, n, 'simonYDistribution', SIMON_MATH_MAX_N)
  return Array.from({ length: 2 ** n }, (_, y) => (dotMod2(y, s) === 0 ? 2 ** -(n - 1) : 0))
}

/** The chance of each y read from Simon's circuit itself (the first n wires of the final state, the answer wires collapsed on `outcomes`): route A of `simonYDistribution`. */
export function simonYFromCircuit(s: number, n: number, outcomes: string): number[] {
  const run = runCircuit(simonCircuit(s, n), { outcomes })
  return marginal(run.states[run.states.length - 1], Array.from({ length: n }, (_, q) => q))
}

/**
 * The squared length of the state as Bergou prints Eq. 7.33's last line (p. 126): the amplitudes (−1)^{z·y} 2^{-(n+1)/2} on the 2^{n−1} strings of s^⊥, so
 * 2^{n−1} · 2^{-(n+1)} = ¼ for every n. The right prefactor is 2^{-(n−1)/2}, which gives 1. Built term by term for the pair z, z ⊕ s with z = 1.
 */
export function simonPrintedNorm2(n: number, s: number): number {
  checkSimon(s, n, 'simonPrintedNorm2', SIMON_MATH_MAX_N)
  return simonPerp(s, n).reduce((acc, y) => acc + ((-1) ** dotMod2(1, y) * 2 ** (-(n + 1) / 2)) ** 2, 0)
}

/** The expected number of runs until n − 1 independent strings: Σ_{k=0}^{n−2} 1/(1 − 2^{k−n+1}) (each new run adds rank with chance 1 − 2^{k−(n−1)} once the rank is k). */
export function simonExpectedRuns(n: number): number {
  if (!Number.isInteger(n) || n < 2) throw new Error('simonExpectedRuns: n is a whole number of at least 2')
  let sum = 0
  for (let k = 0; k <= n - 2; k++) sum += 1 / (1 - 2 ** (k - n + 1))
  return sum
}

/** The chance that n − 1 runs already give n − 1 independent strings: Π_{k=1}^{n−1} (1 − 2^{-k}). */
export function simonRunsSuffice(n: number): number {
  if (!Number.isInteger(n) || n < 2) throw new Error('simonRunsSuffice: n is a whole number of at least 2')
  let p = 1
  for (let k = 1; k <= n - 1; k++) p *= 1 - 2 ** -k
  return p
}

/** The same chance by counting: the share of ordered (n − 1)-tuples from s^⊥ whose GF(2) rank is n − 1 (route B; n ≤ 4). */
export function simonRunsSufficeCounted(s: number, n: number): number {
  if (n > 4) throw new Error('simonRunsSufficeCounted: n ≤ 4')
  const perp = simonPerp(s, n)
  const rows = (tuple: number[]) => tuple.map((y) => Array.from({ length: n }, (_, j) => (y >> (n - 1 - j)) & 1))
  let good = 0
  let total = 0
  const walk = (tuple: number[]): void => {
    if (tuple.length === n - 1) {
      total++
      if (gf2Rank(rows(tuple)) === n - 1) good++
      return
    }
    for (const y of perp) walk([...tuple, y])
  }
  walk([])
  return good / total
}

/**
 * The chance that k distinct random inputs contain a pair x, x ⊕ s (a classical collision that gives away s), by counting the k-subsets of the 2^n strings
 * that hold a pair (n ≤ 4). The union bound over pairs is `collisionUnionBound`.
 */
export function classicalCollision(s: number, n: number, k: number): number {
  if (!Number.isInteger(n) || n < 2 || n > 4) throw new Error('classicalCollision: n is 2, 3 or 4')
  if (!Number.isInteger(s) || s < 1 || s >= 2 ** n) throw new Error(`classicalCollision: s must be a nonzero string of ${n} bits`)
  if (!Number.isInteger(k) || k < 0 || k > 2 ** n) throw new Error('classicalCollision: k is a whole number of queries')
  const N = 2 ** n
  let hit = 0
  let total = 0
  const walk = (start: number, chosen: number[]): void => {
    if (chosen.length === k) {
      total++
      if (chosen.some((a) => chosen.includes(a ^ s))) hit++
      return
    }
    for (let x = start; x < N; x++) walk(x + 1, [...chosen, x])
  }
  walk(0, [])
  return hit / total
}

/** k(k − 1)/(2(2^n − 1)): the union bound over the k(k − 1)/2 pairs of queries, each a collision with chance 1/(2^n − 1). */
export function collisionUnionBound(n: number, k: number): number {
  if (!Number.isInteger(n) || n < 2) throw new Error('collisionUnionBound: n is a whole number of at least 2')
  return (k * (k - 1)) / (2 * (2 ** n - 1))
}
