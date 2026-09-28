/**
 * Physics 709's bridges into Spin Lab (W-709-platform §C): id → the 448 unit (or 709 Foundations chapter) that
 * teaches what a 709 chapter assumes. Prose links one with `<<id|shown text>>`; a gloss entry offers one with
 * `bridge: id`. Ids start `qc-` (content/courses.test.ts). content/qc709/bridges.test.ts checks that every id a chapter
 * or gloss uses is here, that every target resolves in its course (lecture, unit, beat), and that no entry is unused.
 *
 * Empty until the first chapters land (F1, Q1 are being planned); the DEV demo chapter Q0 carries its own table
 * (`DEMO_BRIDGES`), which never ships. Part of the lazy course pack (pack.ts), never the main chunk.
 */
import type { BridgeTarget } from '../bridgeRegistry'

export const BRIDGES: Readonly<Record<string, BridgeTarget>> = {
  // Chapter Q1 (ids: qc- + the target unit id)
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
}
