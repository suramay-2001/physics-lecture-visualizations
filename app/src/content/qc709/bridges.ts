/**
 * Physics 709's bridges into Spin Lab (W-709-platform §C): id → the 448 unit (or 709 Foundations chapter) that
 * teaches what a 709 chapter assumes. Prose links one with `<<id|shown text>>`; a gloss entry offers one with
 * `bridge: id`. Ids start `qc-` (content/courses.test.ts). content/qc709/bridges.test.ts checks that every id a chapter
 * or gloss uses is here, that every target resolves in its course (lecture, unit, beat), and that no entry is unused.
 *
 * The DEV demo chapter Q0 carries its own table (`DEMO_BRIDGES`), which never ships. Part of the lazy course pack (pack.ts), never the main chunk.
 */
import type { BridgeTarget } from '../bridgeRegistry'

export const BRIDGES: Readonly<Record<string, BridgeTarget>> = {
  // F1 "Numbers that turn" (keyed by the target unit id)
  'qc-l2-complex': { course: 'sl448', lecture: 'L2', unit: 'l2-complex', label: 'complex numbers as turns in the plane' },
  'qc-l6-equator': { course: 'sl448', lecture: 'L6', unit: 'l6-equator', label: 'the relative phase picks the point on the equator' },
  'qc-l7-full-turn': { course: 'sl448', lecture: 'L7', unit: 'l7-full-turn', label: 'a full turn multiplies the state by −1, the same state' },
  // Chapter Q1 (ids: qc- + the target unit id; the three shared with F1 keep the target unit's own title as label)
  'qc-l1-quantized': { course: 'sl448', lecture: 'L1', unit: 'l1-quantized', label: 'two spots, not a smear' },
  'qc-l1-sequential': { course: 'sl448', lecture: 'L1', unit: 'l1-sequential', label: 'a new axis erases the old answer' },
  'qc-l1-vectors': { course: 'sl448', lecture: 'L1', unit: 'l1-vectors', label: 'states are vectors' },
  'qc-l2-vector-space': { course: 'sl448', lecture: 'L2', unit: 'l2-vector-space', label: 'kets add and scale like vectors' },
  'qc-l2-inner-product': { course: 'sl448', lecture: 'L2', unit: 'l2-inner-product', label: 'the inner product gives coordinates' },
  'qc-l2-plus-y': { course: 'sl448', lecture: 'L2', unit: 'l2-plus-y', label: 'real numbers cannot make +y' },
  'qc-l3-eigen': { course: 'sl448', lecture: 'L3', unit: 'l3-eigen', label: 'Hermitian operators and their eigenvectors' },
  'qc-l3-projectors': { course: 'sl448', lecture: 'L3', unit: 'l3-projectors', label: 'projectors keep one part of a state' },
  'qc-l3-postulates': { course: 'sl448', lecture: 'L3', unit: 'l3-postulates', label: 'the Born rule and the state after a measurement' },
  'qc-l4-projectors': { course: 'sl448', lecture: 'L4', unit: 'l4-projectors', label: 'a projector asks a yes/no question' },
  'qc-l6-mixture': { course: 'sl448', lecture: 'L6', unit: 'l6-mixture', label: 'superposition or mixture?' },
  'qc-l7-order': { course: 'sl448', lecture: 'L7', unit: 'l7-order', label: 'swapping the order of two measurements' },
  'qc-l7-compatible': { course: 'sl448', lecture: 'L7', unit: 'l7-compatible', label: 'compatible measurements share a basis and commute' },
  // Chapter Q2 (ids: qc- + the target unit id, as Q1's)
  'qc-l4-basis': { course: 'sl448', lecture: 'L4', unit: 'l4-basis', label: 'bases from the same idea' },
  'qc-l2-three-bases': { course: 'sl448', lecture: 'L2', unit: 'l2-three-bases', label: 'meets the third frame, y' },
  'qc-l3-operators': { course: 'sl448', lecture: 'L3', unit: 'l3-operators', label: 'starts operators the same way' },
  'qc-l5-coordinates': { course: 'sl448', lecture: 'L5', unit: 'l5-coordinates', label: 'writes the same rule with B' },
  'qc-l1-average': { course: 'sl448', lecture: 'L1', unit: 'l1-average', label: 'compares polarizers and magnets' },
  'qc-l6-generator': { course: 'sl448', lecture: 'L6', unit: 'l6-generator', label: 'Sz generates the turn' },
  // Chapter Q3
  'qc-l6-bloch': { course: 'sl448', lecture: 'L6', unit: 'l6-bloch', label: 'three averages make a point' },
  'qc-l7-two-angles': { course: 'sl448', lecture: 'L7', unit: 'l7-two-angles', label: 'sphere angles are twice state angles' },
  'qc-l5-averages': { course: 'sl448', lecture: 'L5', unit: 'l5-averages', label: 'three averages from one column' },
  'qc-l5-operators': { course: 'sl448', lecture: 'L5', unit: 'l5-operators', label: 'operators change coordinates too' },
  'qc-l7-spreads': { course: 'sl448', lecture: 'L7', unit: 'l7-spreads', label: 'spreads you can read off the sphere' },
  'qc-l7-uncertainty': { course: 'sl448', lecture: 'L7', unit: 'l7-uncertainty', label: 'a floor under the product of spreads' },
  'qc-l4-matrices': { course: 'sl448', lecture: 'L4', unit: 'l4-matrices', label: 'spin matrices built from their outcomes' },
  'qc-l4-average': { course: 'sl448', lecture: 'L4', unit: 'l4-average', label: 'the average that no atom reads' },
  'qc-l4-eigen': { course: 'sl448', lecture: 'L4', unit: 'l4-eigen', label: 'eigenvectors and eigenvalues, a second look' },
  'qc-l3-spread': { course: 'sl448', lecture: 'L3', unit: 'l3-spread', label: 'the spread of single readings' },
  // Chapter Q4
  'qc-l6-active': { course: 'sl448', lecture: 'L6', unit: 'l6-active', label: 'turn the state, keep the axes' },
  // Chapter Q7
  'qc-l1-logic': { course: 'sl448', lecture: 'L1', unit: 'l1-logic', label: 'hidden labels and their truth table' },
}
