/**
 * Test support for physics/qec (imported by *.test.ts only, never by the app; pure: no test-runner import, so the purity rule holds here too):
 * seeded random Clifford circuits, their dense form as a qc/circuit `Circuit` (the existing, separately tested state-vector route), and a
 * few matrix helpers. The numpy fixture (pipeline/make_qec_fixtures.py → __fixtures__/qec.json) is loaded by fixtures.test.ts.
 */
import type { Circuit, Op } from '../qc/circuit'
import { pauliEigenvalue } from '../qc/gates'
import type { Vec } from '../linalg'
import type { CliffordGate, Pauli } from './pauli'
import type { TableauOp } from './tableau'
import { GF2Matrix } from './gf2'

/** A deterministic random generator of integers: `pick(k)` is 0 … k−1 (uses the same mulberry32 stream as the rest of the engine). */
export function makePicker(rand: () => number): (k: number) => number {
  return (k) => Math.floor(rand() * k)
}

/** A random Clifford circuit of `len` gates (and, with `measure`, occasional Z measurements) on n ≥ 1 qubits. */
export function randomCliffordOps(n: number, len: number, rand: () => number, measure = false): TableauOp[] {
  const pick = makePicker(rand)
  const one: CliffordGate[] = ['H', 'S', 'Sdg', 'X', 'Y', 'Z']
  const two: CliffordGate[] = ['CNOT', 'CZ', 'SWAP']
  const ops: TableauOp[] = []
  for (let t = 0; t < len; t++) {
    const roll = rand()
    if (measure && roll < 0.12) ops.push({ measure: pick(n) })
    else if (n >= 2 && roll < 0.55) {
      const a = pick(n)
      let b = pick(n - 1)
      if (b >= a) b++
      ops.push({ gate: two[pick(two.length)], qubits: [a, b] })
    } else ops.push({ gate: one[pick(one.length)], qubits: [pick(n)] })
  }
  return ops
}

/** The dense route: a qc/circuit Circuit for the same list of steps (CZ and SWAP use the circuit format's own gates). */
export function toCircuit(n: number, ops: readonly TableauOp[]): Circuit {
  const columns: Op[][] = []
  let bit = 0
  for (const op of ops) {
    if ('measure' in op) {
      columns.push([{ op: 'measure', qubit: op.measure, bit: bit++ }])
      continue
    }
    const [a, b] = op.qubits
    switch (op.gate) {
      case 'CNOT':
        columns.push([{ op: 'gate', gate: 'X', targets: [b], controls: [a] }])
        break
      case 'CZ':
        columns.push([{ op: 'gate', gate: 'Z', targets: [b], controls: [a] }])
        break
      case 'SWAP':
        columns.push([{ op: 'gate', gate: 'SWAP', targets: [a, b] }])
        break
      default:
        columns.push([{ op: 'gate', gate: op.gate, targets: [a] }])
    }
  }
  return { version: 1, qubits: n, clbits: Math.max(1, bit), columns }
}

/** ±1 if the dense state is an eigenvector of the Pauli with exactly that eigenvalue (sign included), else null. */
export function eigenvalueOf(psi: Vec, p: Pauli): 1 | -1 | null {
  const lam = pauliEigenvalue(psi, p.letters().join(''))
  if (lam === null) return null
  return (lam * p.sign()) as 1 | -1
}

/** A symmetric-difference-free check that the rows of A, as a set, equal the rows of B (same row space). */
export function sameRowSpace(A: GF2Matrix, B: GF2Matrix): boolean {
  return A.rank() === B.rank() && A.vstack(B).rank() === A.rank()
}
