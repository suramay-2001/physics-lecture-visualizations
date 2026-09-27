/**
 * THE circuit format (P-709-map §(b) "circuit"; chapters Q4–Q5, Q9, Q14–Q17): one versioned, serializable JSON used
 * by lesson content, the `circuit` stage and the films. Plain data only (numbers, strings, arrays), so a circuit can
 * sit in a content file, travel through JSON and be re-validated anywhere.
 *
 *   { version: 1, qubits: 2, init: '00', columns: [
 *       [{ op: 'gate', gate: 'H', targets: [0] }],
 *       [{ op: 'gate', gate: 'X', controls: [0], targets: [1] }],          // CNOT 0 → 1
 *       [{ op: 'measure', qubit: 0, bit: 0 }, { op: 'measure', qubit: 1, bit: 1 }] ] }
 *
 * - Wires: q0 is the top wire = the leftmost factor = the most significant bit (state.ts). `init` is a ket label
 *   (one of 0 1 + - per wire; default all 0). `wires` are optional display labels.
 * - A column holds operations on DISJOINT wires; columns run left to right (the matrices multiply right to left).
 * - Ops: `gate` (a named gate with optional controls and angle params), `oracle` (a truth table as an f-CNOT or a
 *   phase oracle), `unitary` (an explicit k-qubit matrix as [re, im] pairs), `measure` (computational basis, into a
 *   classical bit). Any gate, oracle or unitary may carry `cond`: apply it only when the listed classical bits read
 *   `equals` (bits measured in an EARLIER column): the classical control of teleportation.
 * - `validateCircuit` rejects malformed input with a reason and never throws (content and URLs reach React through it).
 *
 * Simulation: `runCircuit` (the state after every column, along one measurement branch), `branches` (every
 * measurement branch with its probability), `circuitUnitary` / `columnUnitary` (dense, n ≤ 6). States are updated in
 * place with gates.applyGate, so a run costs O(2ⁿ) per gate up to the 10-qubit cap.
 */
import { c } from '../complex'
import { type Mat, type Vec, identity, matmul, normalize } from '../linalg'
import { type Bit } from './bits'
import { GATES_1P, GATES_1Q, SWAP2, applyGate, applyOraclePhase, applyOracleXor, oraclePhase, oracleXor } from './gates'
import { measureQubit, postMeasure } from './measure'
import { MAX_DENSE_QUBITS, MAX_QUBITS, embed, ket } from './state'

export const CIRCUIT_VERSION = 1
/** Limits that keep a hostile or mistaken JSON cheap to reject. */
export const CIRCUIT_LIMITS = { qubits: MAX_QUBITS, clbits: 64, columns: 1000, opsPerColumn: 64, unitaryQubits: 4, label: 120, title: 200, branches: 1024 } as const

export type GateName = 'I' | 'X' | 'Y' | 'Z' | 'H' | 'S' | 'Sdg' | 'T' | 'Tdg' | 'P' | 'Rx' | 'Ry' | 'Rz' | 'SWAP'
const PARAM_GATES = ['P', 'Rx', 'Ry', 'Rz'] as const
const PLAIN_GATES = ['I', 'X', 'Y', 'Z', 'H', 'S', 'Sdg', 'T', 'Tdg'] as const
const GATE_NAMES: readonly string[] = [...PLAIN_GATES, ...PARAM_GATES, 'SWAP']

/** Classical control: the op runs only when bits[k] reads equals[k] for every k (equals is a 0/1 string). */
export interface Cond {
  bits: number[]
  equals: string
}
export interface GateOp {
  op: 'gate'
  gate: GateName
  /** one wire (two for SWAP) */
  targets: number[]
  controls?: number[]
  /** one angle for P, Rx, Ry, Rz (radians); none otherwise */
  params?: number[]
  cond?: Cond
  label?: string
}
export interface OracleOp {
  op: 'oracle'
  /** 'xor': |x⟩|y⟩ → |x⟩|y ⊕ f(x)⟩ (needs `target`); 'phase': |x⟩ → (−1)^{f(x)}|x⟩ */
  mode: 'xor' | 'phase'
  /** f[x] for x read from `inputs` (inputs[0] most significant) */
  table: Bit[]
  inputs: number[]
  target?: number
  cond?: Cond
  label?: string
}
export interface UnitaryOp {
  op: 'unitary'
  /** 2ᵏ×2ᵏ rows of [re, im]; must be unitary */
  matrix: [number, number][][]
  targets: number[]
  controls?: number[]
  cond?: Cond
  label?: string
}
export interface MeasureOp {
  op: 'measure'
  qubit: number
  bit: number
  label?: string
}
export type Op = GateOp | OracleOp | UnitaryOp | MeasureOp

export interface Circuit {
  version: 1
  qubits: number
  clbits?: number
  init?: string
  wires?: string[]
  title?: string
  columns: Op[][]
}

export type Validation = { ok: true; circuit: Circuit } | { ok: false; reason: string }

/* ------------------------------------------------------------- validation ------------------------------------------------------------- */

class Reject extends Error {}
const fail = (path: string, why: string): never => {
  throw new Reject(`${path}: ${why}`)
}
const isObj = (x: unknown): x is Record<string, unknown> => typeof x === 'object' && x !== null && !Array.isArray(x)
const isInt = (x: unknown): x is number => typeof x === 'number' && Number.isInteger(x)
/** Index loops (not forEach/every), so a sparse array's holes are seen as undefined and rejected. */
function each(a: readonly unknown[], f: (v: unknown, i: number) => void): void {
  for (let i = 0; i < a.length; i++) f(a[i], i)
}
function all(a: readonly unknown[], pred: (v: unknown) => boolean): boolean {
  for (let i = 0; i < a.length; i++) if (!pred(a[i])) return false
  return true
}

function onlyKeys(o: Record<string, unknown>, allowed: readonly string[], path: string): void {
  for (const k of Object.keys(o)) if (!allowed.includes(k)) fail(path, `unknown field "${k.slice(0, 40)}"`)
}
function wireList(x: unknown, n: number, path: string, minLen: number): number[] {
  if (!Array.isArray(x)) return fail(path, 'must be an array of wire numbers')
  if (x.length < minLen || x.length > n) fail(path, `needs ${minLen}…${n} wires`)
  each(x, (q, i) => {
    if (!isInt(q) || q < 0 || q >= n) fail(`${path}[${i}]`, `wire must be a whole number in 0…${n - 1}`)
  })
  if (new Set(x).size !== x.length) fail(path, 'a wire is listed twice')
  return x as number[]
}
function optLabel(o: Record<string, unknown>, path: string): void {
  if (o.label !== undefined && (typeof o.label !== 'string' || o.label.length > CIRCUIT_LIMITS.label)) fail(`${path}.label`, `must be a string of at most ${CIRCUIT_LIMITS.label} characters`)
}
function checkCond(x: unknown, clbits: number, written: ReadonlySet<number>, path: string): void {
  if (!isObj(x)) return fail(path, 'must be { bits, equals }')
  onlyKeys(x, ['bits', 'equals'], path)
  if (!Array.isArray(x.bits) || x.bits.length === 0 || x.bits.length > clbits) return fail(`${path}.bits`, 'must list 1 or more classical bits')
  each(x.bits, (b, i) => {
    if (!isInt(b) || b < 0 || b >= clbits) return fail(`${path}.bits[${i}]`, `classical bit must be in 0…${clbits - 1}`)
    if (!written.has(b)) fail(`${path}.bits[${i}]`, `bit ${b} is not measured in an earlier column`)
  })
  if (new Set(x.bits).size !== x.bits.length) fail(`${path}.bits`, 'a bit is listed twice')
  if (typeof x.equals !== 'string' || x.equals.length !== x.bits.length || !/^[01]+$/.test(x.equals)) fail(`${path}.equals`, 'must be a 0/1 string with one character per bit')
}
function isUnitaryPairs(m: [number, number][][]): boolean {
  const d = m.length
  for (let i = 0; i < d; i++)
    for (let j = 0; j < d; j++) {
      let re = 0
      let im = 0
      for (let k = 0; k < d; k++) {
        const [ar, ai] = m[k][i]
        const [br, bi] = m[k][j]
        re += ar * br + ai * bi
        im += ar * bi - ai * br
      }
      if (Math.abs(re - (i === j ? 1 : 0)) > 1e-6 || Math.abs(im) > 1e-6) return false
    }
  return true
}

/** Returns the wires the op occupies (for the disjointness check and the stage). */
export function opWires(op: Op): number[] {
  switch (op.op) {
    case 'gate':
    case 'unitary':
      return [...op.targets, ...(op.controls ?? [])]
    case 'oracle':
      return op.mode === 'xor' && op.target !== undefined ? [...op.inputs, op.target] : [...op.inputs]
    case 'measure':
      return [op.qubit]
  }
}

function checkOp(x: unknown, n: number, clbits: number, written: ReadonlySet<number>, path: string): Op {
  if (!isObj(x)) return fail(path, 'must be an object with an "op" field')
  switch (x.op) {
    case 'gate': {
      onlyKeys(x, ['op', 'gate', 'targets', 'controls', 'params', 'cond', 'label'], path)
      if (typeof x.gate !== 'string' || !GATE_NAMES.includes(x.gate)) return fail(`${path}.gate`, `must be one of ${GATE_NAMES.join(', ')}`)
      const nt = x.gate === 'SWAP' ? 2 : 1
      const t = wireList(x.targets, n, `${path}.targets`, nt)
      if (t.length !== nt) fail(`${path}.targets`, `${x.gate} takes ${nt} target wire${nt > 1 ? 's' : ''}`)
      if (x.controls !== undefined && wireList(x.controls, n, `${path}.controls`, 0).some((q) => t.includes(q))) fail(`${path}.controls`, 'a wire is both a control and a target')
      const np = (PARAM_GATES as readonly string[]).includes(x.gate) ? 1 : 0
      const params = x.params === undefined ? [] : x.params
      if (!Array.isArray(params) || params.length !== np) return fail(`${path}.params`, np ? `${x.gate} takes one angle` : `${x.gate} takes no angle`)
      each(params, (v, i) => {
        if (typeof v !== 'number' || !Number.isFinite(v)) fail(`${path}.params[${i}]`, 'must be a finite number')
      })
      if (x.cond !== undefined) checkCond(x.cond, clbits, written, `${path}.cond`)
      optLabel(x, path)
      break
    }
    case 'oracle': {
      onlyKeys(x, ['op', 'mode', 'table', 'inputs', 'target', 'cond', 'label'], path)
      if (x.mode !== 'xor' && x.mode !== 'phase') return fail(`${path}.mode`, 'must be "xor" or "phase"')
      const inputs = wireList(x.inputs, n, `${path}.inputs`, 1)
      if (!Array.isArray(x.table) || x.table.length !== 2 ** inputs.length) return fail(`${path}.table`, `must list f(x) for all ${2 ** inputs.length} inputs`)
      each(x.table, (v, i) => {
        if (v !== 0 && v !== 1) fail(`${path}.table[${i}]`, 'must be 0 or 1')
      })
      if (x.mode === 'xor') {
        if (!isInt(x.target) || x.target < 0 || x.target >= n) return fail(`${path}.target`, `an xor oracle needs a target wire in 0…${n - 1}`)
        if (inputs.includes(x.target)) fail(`${path}.target`, 'the target is also an input')
      } else if (x.target !== undefined) fail(`${path}.target`, 'a phase oracle has no target')
      if (x.cond !== undefined) checkCond(x.cond, clbits, written, `${path}.cond`)
      optLabel(x, path)
      break
    }
    case 'unitary': {
      onlyKeys(x, ['op', 'matrix', 'targets', 'controls', 'cond', 'label'], path)
      const t = wireList(x.targets, n, `${path}.targets`, 1)
      if (t.length > CIRCUIT_LIMITS.unitaryQubits) fail(`${path}.targets`, `at most ${CIRCUIT_LIMITS.unitaryQubits} wires`)
      if (x.controls !== undefined && wireList(x.controls, n, `${path}.controls`, 0).some((q) => t.includes(q))) fail(`${path}.controls`, 'a wire is both a control and a target')
      const d = 2 ** t.length
      if (!Array.isArray(x.matrix) || x.matrix.length !== d) return fail(`${path}.matrix`, `must have ${d} rows`)
      each(x.matrix, (row, i) => {
        if (!Array.isArray(row) || row.length !== d) fail(`${path}.matrix[${i}]`, `must have ${d} entries`)
        each(row as unknown[], (z, j) => {
          if (!Array.isArray(z) || z.length !== 2 || !all(z, (v) => typeof v === 'number' && Number.isFinite(v))) fail(`${path}.matrix[${i}][${j}]`, 'must be [re, im]')
        })
      })
      if (!isUnitaryPairs(x.matrix as [number, number][][])) fail(`${path}.matrix`, 'is not unitary (U†U ≠ I within 1e-6)')
      if (x.cond !== undefined) checkCond(x.cond, clbits, written, `${path}.cond`)
      optLabel(x, path)
      break
    }
    case 'measure': {
      onlyKeys(x, ['op', 'qubit', 'bit', 'label'], path)
      if (!isInt(x.qubit) || x.qubit < 0 || x.qubit >= n) return fail(`${path}.qubit`, `must be a wire in 0…${n - 1}`)
      if (!isInt(x.bit) || x.bit < 0 || x.bit >= clbits) return fail(`${path}.bit`, clbits ? `must be a classical bit in 0…${clbits - 1}` : 'the circuit declares no classical bits (clbits)')
      optLabel(x, path)
      break
    }
    default:
      return fail(`${path}.op`, 'must be "gate", "oracle", "unitary" or "measure"')
  }
  return x as unknown as Op
}

/**
 * Check that `x` is a well-formed circuit. Never throws: malformed input (from content, JSON or a URL) comes back as
 * { ok: false, reason } with a path to the first problem, e.g. "columns[2][0].targets[0]: wire must be … in 0…1".
 * On success the circuit is a deep copy of the input.
 */
export function validateCircuit(x: unknown): Validation {
  try {
    if (!isObj(x)) return { ok: false, reason: 'circuit: must be an object' }
    onlyKeys(x, ['version', 'qubits', 'clbits', 'init', 'wires', 'title', 'columns'], 'circuit')
    if (x.version !== CIRCUIT_VERSION) fail('circuit.version', `must be ${CIRCUIT_VERSION} (got ${JSON.stringify(x.version)?.slice(0, 20)})`)
    if (!isInt(x.qubits) || x.qubits < 1 || x.qubits > CIRCUIT_LIMITS.qubits) fail('circuit.qubits', `must be a whole number in 1…${CIRCUIT_LIMITS.qubits}`)
    const n = x.qubits as number
    const clbits = x.clbits ?? 0
    if (!isInt(clbits) || clbits < 0 || clbits > CIRCUIT_LIMITS.clbits) fail('circuit.clbits', `must be a whole number in 0…${CIRCUIT_LIMITS.clbits}`)
    if (x.init !== undefined && (typeof x.init !== 'string' || x.init.length !== n || !/^[01+-]+$/.test(x.init))) fail('circuit.init', `must be ${n} characters from 0 1 + -`)
    if (x.wires !== undefined && (!Array.isArray(x.wires) || x.wires.length !== n || !all(x.wires, (w) => typeof w === 'string' && w.length <= CIRCUIT_LIMITS.label)))
      fail('circuit.wires', `must be ${n} short strings`)
    if (x.title !== undefined && (typeof x.title !== 'string' || x.title.length > CIRCUIT_LIMITS.title)) fail('circuit.title', 'must be a short string')
    if (!Array.isArray(x.columns) || x.columns.length > CIRCUIT_LIMITS.columns) fail('circuit.columns', `must be an array of at most ${CIRCUIT_LIMITS.columns} columns`)
    const written = new Set<number>()
    each(x.columns as unknown[], (col, k) => {
      if (!Array.isArray(col) || col.length > CIRCUIT_LIMITS.opsPerColumn) fail(`columns[${k}]`, 'must be an array of operations')
      const used = new Set<number>()
      const measuredHere: number[] = []
      each(col as unknown[], (o, j) => {
        const op = checkOp(o, n, clbits as number, written, `columns[${k}][${j}]`)
        for (const q of opWires(op)) {
          if (used.has(q)) fail(`columns[${k}][${j}]`, `wire ${q} is already used in this column`)
          used.add(q)
        }
        if (op.op === 'measure') measuredHere.push(op.bit)
      })
      if (new Set(measuredHere).size !== measuredHere.length) fail(`columns[${k}]`, 'two measurements write the same bit')
      measuredHere.forEach((b) => written.add(b))
    })
    return { ok: true, circuit: JSON.parse(JSON.stringify(x)) as Circuit }
  } catch (e) {
    if (e instanceof Reject) return { ok: false, reason: e.message }
    return { ok: false, reason: `circuit: unreadable (${e instanceof Error ? e.message.slice(0, 80) : 'unknown error'})` }
  }
}

/** JSON text of a circuit (the format is plain data, so this is JSON.stringify). */
export const serializeCircuit = (circuit: Circuit): string => JSON.stringify(circuit)

/** Parse and validate JSON text; never throws. */
export function parseCircuit(text: string): Validation {
  let x: unknown
  try {
    x = JSON.parse(text)
  } catch {
    return { ok: false, reason: 'circuit: not valid JSON' }
  }
  return validateCircuit(x)
}

function mustValidate(circuit: Circuit, who: string): Circuit {
  const v = validateCircuit(circuit)
  if (!v.ok) throw new Error(`${who}: ${v.reason}`)
  return v.circuit
}

/* ------------------------------------------------------------- simulation ------------------------------------------------------------- */

const pairsToMat = (m: [number, number][][]): Mat => m.map((row) => row.map(([re, im]) => c(re, im)))

/** The matrix of a gate or unitary op (on its targets, before controls). */
export function opMatrix(op: GateOp | UnitaryOp): Mat {
  if (op.op === 'unitary') return pairsToMat(op.matrix)
  if (op.gate === 'SWAP') return SWAP2
  const f = GATES_1P[op.gate]
  return f ? f(op.params![0]) : GATES_1Q[op.gate]
}

const condHolds = (cond: Cond | undefined, bits: readonly Bit[]): boolean => !cond || cond.bits.every((b, i) => bits[b] === (cond.equals[i] === '1' ? 1 : 0))

/** Apply one non-measurement op to psi in place. */
function applyOp(psi: Vec, op: GateOp | OracleOp | UnitaryOp): void {
  if (op.op === 'oracle') {
    if (op.mode === 'xor') applyOracleXor(psi, op.table, op.inputs, op.target!)
    else applyOraclePhase(psi, op.table, op.inputs)
  } else applyGate(psi, opMatrix(op), op.targets, op.controls ?? [])
}

/** The dense matrix of one column (n ≤ 6); throws on a measurement or a classically controlled op. */
export function columnUnitary(circuit: Circuit, k: number): Mat {
  const cc = mustValidate(circuit, 'columnUnitary')
  return columnMatrix(cc, k)
}

function columnMatrix(cc: Circuit, k: number): Mat {
  const n = cc.qubits
  if (n > MAX_DENSE_QUBITS) throw new Error(`columnUnitary: dense matrices stop at ${MAX_DENSE_QUBITS} qubits`)
  let U = identity(2 ** n)
  for (const op of cc.columns[k]) {
    if (op.op === 'measure') throw new Error('columnUnitary: the column measures')
    if (op.cond) throw new Error('columnUnitary: the column has a classically controlled op')
    const M =
      op.op === 'oracle'
        ? op.mode === 'xor'
          ? embed(oracleXor(op.table, op.inputs.length), n, [...op.inputs, op.target!])
          : embed(oraclePhase(op.table, op.inputs.length), n, op.inputs)
        : embed(opMatrix(op), n, op.targets, op.controls ?? [])
    U = matmul(M, U)
  }
  return U
}

/** U = U_K ⋯ U₂U₁, the whole circuit as one matrix (no measurements or classical control; n ≤ 6). */
export function circuitUnitary(circuit: Circuit): Mat {
  const cc = mustValidate(circuit, 'circuitUnitary')
  return cc.columns.reduce((U, _, k) => matmul(columnMatrix(cc, k), U), identity(2 ** cc.qubits))
}

export interface RunOptions {
  /** start here instead of `init` (normalized; length 2ⁿ) */
  psi0?: Vec
  /** one character per measurement (in circuit order): collapse onto these outcomes */
  outcomes?: string
  /** or sample each measurement with this generator */
  rand?: () => number
}

export interface Run {
  /** states[0] is the input; states[k] is the state after column k */
  states: Vec[]
  /** the measurement outcomes in circuit order ('' when no measurement collapsed) */
  outcomes: string
  /** the classical register at the end, bit 0 first */
  bits: string
  /** the probability of this branch (1 when nothing collapsed) */
  prob: number
}

function startState(cc: Circuit, psi0?: Vec): Vec {
  const n = cc.qubits
  if (!psi0) return ket(cc.init ?? '0'.repeat(n))
  if (psi0.length !== 2 ** n) throw new Error(`runCircuit: psi0 must have ${2 ** n} amplitudes`)
  return normalize(psi0)
}

/** The measurements in circuit order, each marked terminal when nothing later touches its wire or reads its bit. */
function measurements(cc: Circuit): { k: number; op: MeasureOp; terminal: boolean }[] {
  const out: { k: number; op: MeasureOp; terminal: boolean }[] = []
  cc.columns.forEach((col, k) =>
    col.forEach((op) => {
      if (op.op !== 'measure') return
      const later = cc.columns.slice(k + 1).flat()
      const terminal = later.every((o) => !opWires(o).includes(op.qubit) && !(o.op !== 'measure' && o.cond?.bits.includes(op.bit)))
      out.push({ k, op, terminal })
    }),
  )
  return out
}

/**
 * Run a circuit column by column. With `outcomes` (or `rand`) every measurement collapses the state onto its outcome
 * and `prob` is that branch's probability. Without them, a circuit whose measurements are all TERMINAL (nothing later
 * touches the wire or reads the bit) runs without collapsing, so the last state is the one the readout samples; a
 * mid-circuit measurement then throws (use `branches`). Throws on an invalid circuit (validate first) and on an
 * outcome of probability 0.
 */
export function runCircuit(circuit: Circuit, opts: RunOptions = {}): Run {
  const cc = mustValidate(circuit, 'runCircuit')
  const ms = measurements(cc)
  const collapse = opts.outcomes !== undefined || opts.rand !== undefined
  if (!collapse && ms.some((m) => !m.terminal)) throw new Error('runCircuit: a mid-circuit measurement needs `outcomes` or `rand` (or use branches)')
  if (opts.outcomes !== undefined && (opts.outcomes.length !== ms.length || !/^[01]*$/.test(opts.outcomes)))
    throw new Error(`runCircuit: outcomes must be ${ms.length} bits, one per measurement`)
  let psi = startState(cc, opts.psi0)
  const states: Vec[] = [psi.slice()]
  const bits: Bit[] = new Array(cc.clbits ?? 0).fill(0)
  let outcomes = ''
  let prob = 1
  for (const col of cc.columns) {
    for (const op of col) {
      if (op.op !== 'measure') {
        if (condHolds(op.cond, bits)) applyOp(psi, op)
        continue
      }
      if (!collapse) continue
      const m = measureQubit(psi, op.qubit)
      const idx = outcomes.length
      const b: Bit = opts.outcomes !== undefined ? (opts.outcomes[idx] === '1' ? 1 : 0) : opts.rand!() < m.p[0] / (m.p[0] + m.p[1]) ? 0 : 1
      const post = m.post[b]
      if (!post || m.p[b] < 1e-15) throw new Error(`runCircuit: outcome ${b} of measurement ${idx} has probability 0`)
      psi = post
      prob *= m.p[b]
      bits[op.bit] = b
      outcomes += b
    }
    states.push(psi.slice())
  }
  return { states, outcomes, bits: bits.join(''), prob }
}

export type Branch = Run

/**
 * Every measurement branch of a circuit (mid-circuit measurement and classical control; Q9 teleportation): each
 * measurement splits the run into its outcomes of probability > `minProb`, so the branch probabilities sum to 1.
 * Terminal measurements split too. At most CIRCUIT_LIMITS.branches branches.
 */
export function branches(circuit: Circuit, opts: { psi0?: Vec; minProb?: number } = {}): Branch[] {
  const cc = mustValidate(circuit, 'branches')
  const minProb = opts.minProb ?? 1e-12
  const out: Branch[] = []
  const walk = (k: number, j: number, psi: Vec, states: Vec[], bits: Bit[], outcomes: string, prob: number): void => {
    // (k, j) = the next op to run; states = the states after columns < k (plus the input)
    while (k < cc.columns.length) {
      const col = cc.columns[k]
      while (j < col.length) {
        const op = col[j]
        j++
        if (op.op !== 'measure') {
          if (condHolds(op.cond, bits)) applyOp(psi, op)
          continue
        }
        for (const b of [0, 1] as const) {
          const r = postMeasure(psi, [op.qubit], String(b))
          if (r.p <= minProb || !r.post) continue
          const nb = bits.slice()
          nb[op.bit] = b
          walk(k, j, r.post, states.slice(), nb, outcomes + b, prob * r.p)
        }
        return
      }
      states.push(psi.slice())
      k++
      j = 0
    }
    if (out.length >= CIRCUIT_LIMITS.branches) throw new Error(`branches: more than ${CIRCUIT_LIMITS.branches} branches`)
    out.push({ states, outcomes, bits: bits.join(''), prob })
  }
  const psi = startState(cc, opts.psi0)
  walk(0, 0, psi, [psi.slice()], new Array<Bit>(cc.clbits ?? 0).fill(0), '', 1)
  return out
}

/** How many measurement ops the circuit has. */
export const measurementCount = (circuit: Circuit): number => circuit.columns.flat().filter((op) => op.op === 'measure').length
