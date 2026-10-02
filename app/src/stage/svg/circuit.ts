/**
 * `circuit` (709; SVG): a physics/qc/circuit.ts Circuit drawn by columns, q0 the top wire, with a cursor after column
 * `upTo`. Validation is the circuit module's own validator plus the stage's caps (5 qubits, 24 columns, a whole cursor,
 * a run that can be drawn: a mid-circuit measurement needs its outcomes). The state after the cursor is the engine's
 * (`runCircuit`): an `amplitudes` view beside it reads the same circuit and cursor (checked per layout), so in a split
 * (circuit on top, bars below) the bars ARE the state flowing along the wires. Interpolation moves the cursor; a
 * different circuit switches at t = ½. Lazy chunk (stage/svg/kinds.ts).
 */
import type { CircuitStageState, StageState } from '../../content/stage'
import type { Circuit, Op } from '../../physics/qc/circuit'
import type { SvgReadout } from '../svgKinds'
import type { CircuitGlyph, ResolvedCircuit } from '../types'
import { circuitCursor, stageCircuitProblems } from './amplitudes'
import { degs } from './draw'

const GATE_LABEL: Record<string, string> = { Sdg: 'S†', Tdg: 'T†' }

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
  return errs
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

export function circuitReadouts(r: ResolvedCircuit): SvgReadout[] {
  const out: SvgReadout[] = [{ name: 'cursor', text: `after column ${Math.round(r.cursor)} of ${r.columns.length}` }]
  if (r.observable) out.push({ name: 'observable', text: `measuring ${r.observable.pauli} after column ${r.observable.at}` })
  return out
}
