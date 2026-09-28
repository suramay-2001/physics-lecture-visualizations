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
  // F1 "Numbers that turn" (keyed by the target unit id)
  'qc-l2-complex': { course: 'sl448', lecture: 'L2', unit: 'l2-complex', label: 'complex numbers as turns in the plane' },
  'qc-l2-plus-y': { course: 'sl448', lecture: 'L2', unit: 'l2-plus-y', label: 'why real amplitudes cannot make the state along +y' },
  'qc-l6-equator': { course: 'sl448', lecture: 'L6', unit: 'l6-equator', label: 'the relative phase picks the point on the equator' },
  'qc-l7-full-turn': { course: 'sl448', lecture: 'L7', unit: 'l7-full-turn', label: 'a full turn multiplies the state by −1, the same state' },
  'qc-l1-vectors': { course: 'sl448', lecture: 'L1', unit: 'l1-vectors', label: 'states as vectors, with amplitudes as their parts' },
  'qc-l2-vector-space': { course: 'sl448', lecture: 'L2', unit: 'l2-vector-space', label: 'many vectors, one physical state' },
}
