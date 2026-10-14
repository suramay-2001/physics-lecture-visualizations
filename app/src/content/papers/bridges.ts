/**
 * The Papers section's bridges (docs/specs/papers-platform.md §6): id → the 448 or 709 unit that teaches what a paper
 * lecture assumes. Prose links one with `<<id|shown text>>`; following it leaves a return bar back to the exact beat
 * (`?ret=papers~P1~…`). Ids are `pp-` + the target unit id (content/courses.test.ts). papers/papersContent.test.ts checks
 * that every id a paper uses is here, that every target resolves, and that no entry is unused.
 *
 * DATA ONLY (papers/specData.test.ts), like the specs: a tool may add rows. Part of the lazy papers pack (pack.ts).
 */
import type { BridgeTarget } from '../bridgeRegistry'

export const PAPER_BRIDGES: Readonly<Record<string, BridgeTarget>> = {
  'pp-l3-eigen': { course: 'sl448', lecture: 'L3', unit: 'l3-eigen', label: 'a measurement and its eigenvalues' },
  'pp-q6-bell-basis': { course: 'qc709', lecture: 'Q6', unit: 'q6-bell-basis', label: 'the four Bell states' },
  'pp-q13-depolarizing': { course: 'qc709', lecture: 'Q13', unit: 'q13-depolarizing', label: 'depolarizing noise, the shrinking Bloch ball' },
  'pp-f5-spread': { course: 'qc709', lecture: 'F5', unit: 'f5-spread', label: 'how widely repeated readings scatter' },
  'pp-f7-gf2': { course: 'qc709', lecture: 'F7', unit: 'f7-gf2', label: 'linear algebra with only 0 and 1' },
  'pp-f8-clock': { course: 'qc709', lecture: 'F8', unit: 'f8-clock', label: 'clock arithmetic and repeating patterns' },
  'pp-q22-css': { course: 'qc709', lecture: 'Q22', unit: 'q22-css', label: 'CSS codes: two classical codes that fit together' },
  'pp-q11-teleport': { course: 'qc709', lecture: 'Q11', unit: 'q11-teleport-circuit', label: 'teleportation: the circuit and the call' },
  'pp-q6-parities': { course: 'qc709', lecture: 'Q6', unit: 'q6-parities', label: 'two parities: what the detectors really ask' },
  'pp-q7-observables': { course: 'qc709', lecture: 'Q7', unit: 'q7-observables', label: 'products of Paulis with certain values' },
  'pp-q4-cnot': { course: 'qc709', lecture: 'Q4', unit: 'q4-cnot', label: 'the CNOT gate: flip the target when the control is 1' },
  'pp-q22-clifford': { course: 'qc709', lecture: 'Q22', unit: 'q22-clifford', label: 'Clifford gates move Pauli labels; the measurement update rule' },
  'pp-q22-check-matrix': { course: 'qc709', lecture: 'Q22', unit: 'q22-check-matrix', label: 'check matrices, logical operators and distance' },
  'pp-b1-planar': { course: 'papers', lecture: 'B1', unit: 'b1-planar', label: 'the rotated surface-code patch' },
  'pp-b1-spacetime': { course: 'papers', lecture: 'B1', unit: 'b1-spacetime', label: 'detectors, matching and Pauli frames' },
}
