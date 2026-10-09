/**
 * Spin Lab's bridges INTO Physics 709 ("Go further in 709"; interface change W-448 #4, rulings 448-L8L11 P4): id → the
 * 709 chapter and unit that takes up what a 448 lecture only starts. The mirror of content/qc709/bridges.ts, which holds
 * the other direction. Prose links one with `<<id|shown text>>` (content/walk.ts); a gloss entry offers one with
 * `bridge: id`. Following it opens the 709 unit with a return bar back to the exact 448 beat
 * (components/BridgeLink.tsx, components/ReturnBar.tsx; ids parsed field by field, never a URL: ui/returnParam.ts).
 *
 * ADDING A BRIDGE (a 448 lecture's builder):
 *   1. Add the entry here. The id is `sl-` + the target unit id (`sl-q14-min-error`; `BRIDGE_ID_448`); `course` is
 *      always 'qc709'; `lecture` the 709 chapter ('Q14'), `unit` its unit id, optionally `beat` to put one beat of a
 *      long unit under the centre line; `label` 1–80 characters, what the reader finds there, in a few words.
 *   2. Write `<<sl-q14-min-error|the shown words>>` in the beat's text (or `bridge: 'sl-q14-min-error'` on a gloss
 *      entry). Only a 709 unit that is WRITTEN can be a target (content/bridges448.test.ts resolves every entry).
 *   3. Put `import './bridges448'` in the lecture's own file (`content/L8.ts`). That registers the table with
 *      content/bridgeRegistry.ts when the LECTURE'S CHUNK loads: the entry never carries it (and the test scans every
 *      `L*.ts` that uses a bridge for the import, so a forgotten one fails there, not silently on the page).
 * Every id must be used (an unused entry fails the test); a bridge is OPTIONAL reading, never part of the notes' line.
 *
 * Empty until Lectures 8–11 add theirs; the machinery is exercised by the DEV fixture chip (__fixtures__/devBridge448.ts).
 */
import { registerBridges, type BridgeTarget } from './bridgeRegistry'

export const BRIDGES_448: Readonly<Record<string, BridgeTarget>> = {
  // Lecture 9 (composite systems): 709's F6 and Q6 teach the same pairs in their own notation, Q9 the degrees of entanglement
  'sl-f6-pairs': { course: 'qc709', lecture: 'F6', unit: 'f6-pairs', label: 'Two systems, one joint space' },
  'sl-f6-kron': { course: 'qc709', lecture: 'F6', unit: 'f6-kron', label: 'The tensor product on vectors' },
  'sl-f6-growth': { course: 'qc709', lecture: 'F6', unit: 'f6-growth', label: 'How the gap grows with more qubits' },
  'sl-f6-product-or-not': { course: 'qc709', lecture: 'F6', unit: 'f6-product-or-not', label: 'The product-versus-entangled test' },
  'sl-q6-entangled': { course: 'qc709', lecture: 'Q6', unit: 'q6-entangled', label: 'Product and entangled states' },
  'sl-q9-schmidt': { course: 'qc709', lecture: 'Q9', unit: 'q9-schmidt', label: 'Degrees of entanglement' },
  // Lecture 8 (polarization and BB84): 709's Q2 turns photon frames, Q13 proves no machine copies an unknown qubit, Q14 finds the best guess between two states
  'sl-q2-photon': { course: 'qc709', lecture: 'Q2', unit: 'q2-photon', label: 'Photon polarization and turning frames' },
  'sl-q13-no-cloning': { course: 'qc709', lecture: 'Q13', unit: 'q13-no-cloning', label: 'Why you cannot copy a qubit' },
  'sl-q14-min-error': { course: 'qc709', lecture: 'Q14', unit: 'q14-min-error', label: 'The fewest mistakes' },
  // Lecture 11 (quantum dynamics): 709's F4 treats unitary maps, F1 the Euler polygon, Q4 the gate R_z
  'sl-f4-unitary': { course: 'qc709', lecture: 'F4', unit: 'f4-unitary', label: 'Unitary maps keep every length' },
  'sl-f1-euler': { course: 'qc709', lecture: 'F1', unit: 'f1-euler', label: 'Tiny turns that close on the circle' },
  'sl-q4-one-qubit-gates': { course: 'qc709', lecture: 'Q4', unit: 'q4-one-qubit-gates', label: 'One-qubit gates, R_z among them' },
}

registerBridges(BRIDGES_448)
