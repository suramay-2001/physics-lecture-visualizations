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
import { type Bit, type TruthTable, dotMod2, hammingWeight, isBalanced, isConstant } from './bits'
import type { Circuit, GateOp, OracleOp } from './circuit'

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

/* ------------------------------------------------------------------ the circuits ------------------------------------------------------------------ */

const hLayer = (n: number): GateOp[] => Array.from({ length: n }, (_, q) => ({ op: 'gate', gate: 'H', targets: [q] }))
/** Wire names x_{n−1} … x_0, top to bottom (q0 is the most significant bit), with the target named y in the ancilla form. */
const inputWires = (n: number): string[] => Array.from({ length: n }, (_, q) => `x${sub(n - 1 - q)}`)

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
