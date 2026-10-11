/**
 * Physics 709's fidelity notes (W-709-platform §E: "fidelity (content/fidelity.qc.ts)"; kept under content/qc709/ so
 * chunk rule (h) keeps them out of 448's first paint). Registered with content/fidelity.ts by the lazy course pack
 * (pack.ts), so a 709 passport's drawer shows them; 448's drawers never change.
 *   kinds      a drawer only 709 has: `plane-photon`, the photon-polarization variant of the WebGL hilbert-plane kind, and `bb84-b92`, the B92 ledger
 *              (the `bb84` SVG kind with protocol 'b92', Chapter Q15);
 *   additions  items a 709 chapter adds to a shared kind's drawer (hilbert-plane: Q1's vectors that are not states).
 * The notes of the SVG kinds (complex-plane, amplitudes, circuit, matrix, two-qubit, plot) moved to the shared
 * content/fidelity.svg.ts when those kinds became shared stage code (W-448 #5, rulings 448-L8L11 P6); the import below
 * keeps them registered wherever the 709 pack loads (and in the 709 tests that import this file).
 * Ids start `qc-` (the 709 namespace, content/courses.test.ts); every sentence ≤ 25 words (content/symbols.test.ts).
 */
import '../fidelity.svg'
import { registerCourseFidelity, type CourseFidelity } from '../fidelity'

export const QC_FIDELITY: CourseFidelity = {
  kinds: {
    // P-Q2-story §9.2 S1: the photon-polarization unit of the hilbert-plane kind, named |x⟩, |y⟩ (no ± sign);
    // a fresh fidelityKey ('plane-photon'), so 448's and 709's own spin-labelled 'hilbert-plane' drawer never changes
    'plane-photon': {
      exact: [
        {
          id: 'qc-plane-photon-angles',
          text: 'For light the state turns by the filter’s own angle: no halving.',
        },
      ],
      schematic: [
        {
          id: 'qc-plane-photon-real-slice',
          text: 'This plane holds only real states, like |x⟩ turned by an angle. Circular light, such as |R⟩, needs a complex arrow and leaves it.',
        },
      ],
      misleading: [
        {
          id: 'qc-plane-photon-not-lab',
          text: 'The arrows are numbers in a state, not directions of the light beam itself. The beam always travels the same way.',
        },
      ],
    },
    // W-709 Q15 (rulings qc709-deferred-features D2): the seeded B92 ledger, the `bb84` kind with protocol 'b92'. A fresh fidelityKey ('bb84-b92'),
    // so Spin Lab's BB84 drawer (photons, two bases) never changes and this one speaks of qubits and a never-wrong receiver
    'bb84-b92': {
      exact: [
        {
          id: 'qc-b92-born-engine',
          text: 'Every reading Eve and Bob make is a draw from the engine’s own chances for the qubit in front of them. The run is seeded, so it replays exactly.',
        },
        {
          id: 'qc-b92-tally-engine',
          text: 'The kept, wrong and Eve-right counts, and the exact rates beside them, are computed from every round sent, not read off the rows you see.',
        },
      ],
      schematic: [
        {
          id: 'qc-b92-last-rows',
          text: 'Only the latest rounds are drawn as rows. Every tally and the “kept bits wrong” share still cover all the qubits sent.',
        },
        {
          id: 'qc-b92-ideal-channel',
          text: 'The channel is ideal: no qubit is lost and no device is noisy. The chips name the two states; they do not picture a qubit in flight.',
        },
      ],
      misleading: [
        {
          id: 'qc-b92-scatter',
          text: '**A finite run scatters.** The kept share and the wrong share land near their exact values but are rarely equal to them.',
        },
        {
          id: 'qc-b92-eve-right',
          text: 'The “Eve right” count includes lucky guesses. Eve knew a bit for certain only when her never-wrong reading says “sure”.',
        },
      ],
    },
  },
  additions: {
    // P-709-NC §4.1 (ruling qc709-nc "Q1"): the hydrogen beat q1-two-spots:b8 tells N&C's 1927 hydrogen version on the silver bench
    'lab-r3': {
      schematic: [
        {
          id: 'qc-lab-silver-not-hydrogen',
          text: 'The bench always draws silver atoms from a furnace. The 1927 hydrogen beam splits the same way, into two spots, but no hydrogen is drawn.',
        },
      ],
    },
    // P-Q1-story §9.2 S6: Q1's unit on vector spaces draws vectors of every length (sums, multiples), not only states
    'hilbert-plane': {
      misleading: [
        {
          id: 'qc-plane-vectors-not-states',
          text: 'In this unit the arrows are vectors of a vector space. Only arrows of length 1 are states; the others are sums and multiples.',
        },
      ],
    },
  },
}

registerCourseFidelity('qc709', QC_FIDELITY)

/** Every 709 fidelity item id (the namespace test, content/courses.test.ts). */
export const QC_FIDELITY_IDS: readonly string[] = [...Object.values(QC_FIDELITY.kinds), ...Object.values(QC_FIDELITY.additions)].flatMap((f) => [
  ...(f?.exact ?? []),
  ...(f?.schematic ?? []),
  ...(f?.misleading ?? []),
]).map((i) => i.id)
