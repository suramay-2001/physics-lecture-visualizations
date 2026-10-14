/**
 * `circuit` (709; SVG): a physics/qc/circuit.ts Circuit drawn by columns, q0 the top wire, with a cursor after column
 * `upTo`. Validation is the circuit module's own validator plus the stage's caps (5 qubits, 24 columns, a whole cursor,
 * a run that can be drawn: a mid-circuit measurement needs its outcomes). The state after the cursor is the engine's
 * (`runCircuit`): an `amplitudes` view beside it reads the same circuit and cursor (checked per layout), so in a split
 * (circuit on top, bars below) the bars ARE the state flowing along the wires. Interpolation moves the cursor; a
 * different circuit switches at t = ½. Lazy chunk (stage/svg/kinds.ts).
 * B1 (P-B1-story §9.2 K-F, additive): `faults` marks places a fault can happen (a slot on a wire just before a column) and `hook` highlights a fault on
 * the CHECK wire (the wire every leading CNOT column shares) with the data wires the CNOT columns after it still reach. Markers are places, not computed faults.
 */
import type { CircuitStageState, StageState } from '../../content/stage'
import type { Circuit, Op } from '../../physics/qc/circuit'
import type { SvgReadout } from '../svgKinds'
import type { CircuitGlyph, ResolvedCircuit } from '../types'
import { circuitCursor, stageCircuitProblems } from './amplitudes'
import { degs } from './draw'

const GATE_LABEL: Record<string, string> = { Sdg: 'S†', Tdg: 'T†' }

/** Validation limits of the fault markers (B1). */
export const CIRCUIT_FAULT_LIMITS = { faults: 24, label: 6, hookMax: 3 } as const

const isCnot = (op: Op): op is Extract<Op, { op: 'gate' }> => op.op === 'gate' && op.gate === 'X' && (op.controls?.length ?? 0) === 1 && op.targets.length === 1 && !op.cond

/**
 * The leading run of CNOT columns: from the first column that holds a CNOT, every column made only of CNOTs. The CHECK wire is the one wire all those CNOTs share (the
 * control of an X check's CNOTs, the target of a Z check's); null when they share none. `cnots[k]` lists the (control, target) of the CNOTs of column `first + k`.
 */
export function leadingCnots(c: Circuit): { first: number; count: number; check: number | null; role: 'control' | 'target' | null; cnots: { control: number; target: number }[][] } {
  const first = c.columns.findIndex((col) => col.some(isCnot))
  const none = { first: Math.max(first, 0), count: 0, check: null, role: null, cnots: [] as { control: number; target: number }[][] }
  if (first < 0) return none
  const cnots: { control: number; target: number }[][] = []
  for (let k = first; k < c.columns.length; k++) {
    const col = c.columns[k]
    if (!col.every(isCnot)) break
    cnots.push(col.map((op) => ({ control: (op as { controls: number[] }).controls[0], target: (op as { targets: number[] }).targets[0] })))
  }
  const all = cnots.flat()
  const common = (key: 'control' | 'target'): number | null => {
    const w = new Set(all.map((g) => g[key]))
    return w.size === 1 ? [...w][0] : null
  }
  const ctl = common('control')
  const tgt = common('target')
  // the check qubit is the control of every CNOT (X check) or the target of every CNOT (Z check); with a single CNOT, the control (the plan's "control wire")
  const role = ctl !== null ? 'control' : tgt !== null ? 'target' : null
  return { first, count: cnots.length, check: role === 'control' ? ctl : role === 'target' ? tgt : null, role, cnots }
}

function hookOf(c: Circuit, after: number): NonNullable<ResolvedCircuit['hook']> | null {
  const L = leadingCnots(c)
  if (L.check === null || L.role === null || after >= L.count) return null
  const reach: { col: number; wire: number }[] = []
  for (let k = after; k < L.count; k++) for (const g of L.cnots[k]) reach.push({ col: L.first + k, wire: L.role === 'control' ? g.target : g.control })
  return { after, slot: L.first + after, check: L.check, role: L.role, reach }
}

/** How one operation is drawn (labels are the gate names; an angle parameter is shown in degrees). */
export function glyphOf(op: Op): CircuitGlyph {
  const cond = op.op !== 'measure' && op.cond ? `if ${op.cond.bits.map((b) => `c${b}`).join(',')} = ${op.cond.equals}` : null
  switch (op.op) {
    case 'gate': {
      if (op.gate === 'SWAP') return { type: 'swap', label: 'SWAP', targets: op.targets, controls: op.controls ?? [], cond }
      if (op.gate === 'X' && op.controls?.length) return { type: 'not', label: '⊕', targets: op.targets, controls: op.controls, cond }
      const base = GATE_LABEL[op.gate] ?? op.gate
      return { type: 'gate', label: op.label ?? (op.params?.length ? `${base}(${degs(op.params[0], 0)})` : base), targets: op.targets, controls: op.controls ?? [], cond }
    }
    case 'oracle':
      return { type: 'oracle', label: op.label ?? 'U_f', targets: op.mode === 'xor' && op.target !== undefined ? [...op.inputs, op.target] : [...op.inputs], controls: [], cond }
    case 'unitary':
      return { type: 'unitary', label: op.label ?? 'U', targets: op.targets, controls: op.controls ?? [], cond }
    case 'measure':
      return { type: 'measure', label: `c${op.bit}`, targets: [op.qubit], controls: [], cond: null }
  }
}

export function resolveCircuitStage(st: CircuitStageState, s: number): ResolvedCircuit {
  const c: Circuit = st.circuit
  const init = [...(c.init ?? '0'.repeat(c.qubits))]
  return {
    kind: 'circuit',
    n: c.qubits,
    wires: c.wires ?? Array.from({ length: c.qubits }, (_, q) => `q${q}`),
    init,
    columns: c.columns.map((col) => col.map(glyphOf)),
    cursor: circuitCursor(c, st.upTo, s),
    key: JSON.stringify(c),
    title: c.title ?? null,
    observable: st.observable ?? null,
    faults: (st.faults ?? []).map((f) => ({ col: f.col, wires: [...f.wires], label: f.label ?? null })),
    hook: st.hook ? hookOf(c, st.hook.after) : null,
    shot: st.shot,
  }
}

export function interpCircuitStage(a: ResolvedCircuit, b: ResolvedCircuit, t: number): ResolvedCircuit {
  if (t <= 0) return a
  if (t >= 1) return b
  if (a.key !== b.key) return t < 0.5 ? a : b
  return { ...(t < 0.5 ? a : b), cursor: a.cursor + (b.cursor - a.cursor) * t }
}

export function validateCircuitStage(st: CircuitStageState): string[] {
  if (!st.circuit || typeof st.circuit !== 'object') return ['circuit: a circuit (physics/qc/circuit.ts format)']
  const errs = stageCircuitProblems(st.circuit, st.upTo, st.outcomes, 'circuit')
  if (errs.length) return errs
  if (st.observable) errs.push(...observableProblems(st.observable, st.circuit))
  if (st.faults !== undefined) errs.push(...faultProblems(st.faults, st.circuit))
  if (st.hook !== undefined) errs.push(...hookProblems(st.hook, st.circuit))
  return errs
}

/** B1: the fault markers sit on wires of the circuit, in a slot before one of its columns (or after the last). */
function faultProblems(faults: NonNullable<CircuitStageState['faults']>, circuit: Circuit): string[] {
  const errs: string[] = []
  if (!Array.isArray(faults) || faults.length > CIRCUIT_FAULT_LIMITS.faults) return [`circuit faults: a list of at most ${CIRCUIT_FAULT_LIMITS.faults} fault places`]
  const seen = new Set<string>()
  faults.forEach((f, i) => {
    const where = `circuit faults[${i}]`
    if (!f || !Number.isInteger(f.col) || f.col < 0 || f.col > circuit.columns.length) errs.push(`${where}.col: a whole number 0–${circuit.columns.length} (the slot just before that column; ${circuit.columns.length} is after the last)`)
    if (!f || !Array.isArray(f.wires) || f.wires.length < 1 || !f.wires.every((w) => Number.isInteger(w) && w >= 0 && w < circuit.qubits)) errs.push(`${where}.wires: one or more wires from 0 to ${circuit.qubits - 1}`)
    else if (new Set(f.wires).size !== f.wires.length) errs.push(`${where}.wires: each wire once`)
    else for (const w of f.wires) {
      const key = `${f.col}:${w}`
      if (seen.has(key)) errs.push(`${where}: wire ${w} already has a marker in the slot before column ${f.col}`)
      seen.add(key)
    }
    if (f && f.label !== undefined && (typeof f.label !== 'string' || f.label.length < 1 || f.label.length > CIRCUIT_FAULT_LIMITS.label)) errs.push(`${where}.label: 1–${CIRCUIT_FAULT_LIMITS.label} characters`)
  })
  return errs
}

/** B1: the hook needs leading CNOT columns that share one wire, and `after` fewer than there are. */
function hookProblems(hook: NonNullable<CircuitStageState['hook']>, circuit: Circuit): string[] {
  if (!hook || ![0, 1, 2, 3].includes(hook.after)) return [`circuit hook.after: 0, 1, 2 or 3 (the CNOT columns done before the fault)`]
  const L = leadingCnots(circuit)
  if (L.count === 0) return ['circuit hook: the circuit has no CNOT column to spread a fault through']
  if (L.check === null) return ['circuit hook: the leading CNOT columns share no wire (the check qubit is the wire every one of them uses)']
  if (hook.after >= L.count) return [`circuit hook.after: ${hook.after}, but the circuit has ${L.count} leading CNOT column${L.count === 1 ? '' : 's'}; after must be below that`]
  return []
}

/** `matrix` v2 (W-709 #15): the observable's Pauli string must have one letter per wire, and `at` a whole column
 *  the circuit actually has. */
function observableProblems(obs: NonNullable<CircuitStageState['observable']>, circuit: Circuit): string[] {
  const errs: string[] = []
  if (typeof obs.pauli !== 'string' || obs.pauli.length !== circuit.qubits || !/^[IXYZ]+$/.test(obs.pauli))
    errs.push(`circuit observable: pauli must be ${circuit.qubits} letters of I, X, Y, Z (one per wire)`)
  if (!Number.isInteger(obs.at) || obs.at < 0 || obs.at > circuit.columns.length) errs.push(`circuit observable: at must be a whole column 0–${circuit.columns.length}`)
  return errs
}

/**
 * Across one layout: an `amplitudes` view that reads a circuit beside a `circuit` view must read THE SAME circuit, cursor
 * and outcomes, so the bars are the state after the drawn cursor.
 */
export function circuitLayoutProblems(states: readonly StageState[]): string[] {
  const circ = states.find((s): s is CircuitStageState => s.kind === 'circuit')
  const amps = states.find((s) => s.kind === 'amplitudes')
  if (!circ || !amps || amps.kind !== 'amplitudes' || !('circuit' in amps.state)) return []
  const src = amps.state
  const same = JSON.stringify(src.circuit) === JSON.stringify(circ.circuit) && JSON.stringify(src.upTo) === JSON.stringify(circ.upTo) && src.outcomes === circ.outcomes
  return same ? [] : ['circuit + amplitudes: the bars must read the same circuit, cursor (upTo) and outcomes as the circuit beside them']
}

/** The print figure of a circuit: 320 × 200, a little taller (and a line more for each extra readout) when it carries fault markers or a hook, which add text lines and labels above the wires. */
export function circuitPrintSize(r: ResolvedCircuit): { w: number; h: number } {
  return r.faults.length || r.hook ? { w: 320, h: 200 + 26 + 13 * ((r.faults.length ? 1 : 0) + (r.hook ? 1 : 0)) + (r.n >= 4 ? 24 : 0) } : { w: 320, h: 200 }
}

export function circuitReadouts(r: ResolvedCircuit): SvgReadout[] {
  const out: SvgReadout[] = [{ name: 'cursor', text: `after column ${Math.round(r.cursor)} of ${r.columns.length}` }]
  if (r.observable) out.push({ name: 'observable', text: `measuring ${r.observable.pauli} after column ${r.observable.at}` })
  if (r.faults.length) {
    const places = r.faults.reduce((s, f) => s + f.wires.length, 0)
    out.push({ name: 'faults', text: `${places} fault place${places === 1 ? '' : 's'}` })
  }
  if (r.hook) {
    const wires = [...new Set(r.hook.reach.map((x) => r.wires[x.wire]))]
    out.push({ name: 'hook', text: `hook after ${r.hook.after}: reaches ${wires.join(', ')}`, tone: 'minus' })
  }
  return out
}
