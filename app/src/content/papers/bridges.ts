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
  'pp-q11-teleport': { course: 'qc709', lecture: 'Q11', unit: 'q11-teleport-circuit', label: 'teleportation: the circuit and the call' },
}
