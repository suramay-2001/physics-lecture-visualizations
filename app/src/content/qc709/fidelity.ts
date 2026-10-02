/**
 * Physics 709's fidelity notes (W-709-platform §E: "fidelity (content/fidelity.qc.ts)"; kept under content/qc709/ so
 * chunk rule (h) keeps them out of 448's first paint). Registered with content/fidelity.ts by the lazy course pack
 * (pack.ts), so a 709 passport's drawer shows them; 448's drawers never change.
 *   kinds      the whole drawer of a kind only 709 uses (complex-plane, amplitudes, circuit);
 *   additions  items a 709 chapter adds to a shared kind's drawer (hilbert-plane: Q1's vectors that are not states).
 * Ids start `qc-` (the 709 namespace, content/courses.test.ts); every sentence ≤ 25 words (content/symbols.test.ts).
 */
import { registerCourseFidelity, type CourseFidelity } from '../fidelity'

export const QC_FIDELITY: CourseFidelity = {
  kinds: {
    // P-F1-story §9.2 S3
    'complex-plane': {
      exact: [
        {
          id: 'qc-cplane-arithmetic',
          text: 'Positions, sizes and angles are the numbers themselves. A sum is drawn tip to tail, and a product multiplies the sizes and adds the angles, exactly.',
        },
      ],
      schematic: [
        {
          id: 'qc-cplane-not-space',
          text: 'This plane is a picture of numbers, not of the lab. Across is the real part and up is the imaginary part.',
        },
        {
          id: 'qc-cplane-hue-is-angle',
          text: 'An arrow’s colour shows its angle on a wheel of hues. The colour is a code for the angle, never a colour of light or an outcome.',
        },
      ],
      misleading: [
        {
          id: 'qc-cplane-arrows-not-forces',
          text: 'An arrow here is a number, not a push. Adding two arrows adds two numbers; nothing in the lab moves.',
        },
      ],
    },
    // P-F1-story §9.2 S2 (the stage-kind batch)
    amplitudes: {
      exact: [
        {
          id: 'qc-amp-engine',
          text: 'Each bar is the engine’s amplitude for one basis state: its length is the size, and the squared lengths add to 1.',
        },
      ],
      schematic: [
        {
          id: 'qc-amp-hue-is-phase',
          text: 'A bar’s colour shows its phase on the same wheel of hues as the number plane. It is a code for an angle, not light.',
        },
        {
          id: 'qc-amp-zero-is-up',
          text: 'In this course the basis state |0⟩ is the spin state |+z⟩ and |1⟩ is |−z⟩, the same amber and cobalt as in Spin Lab.',
        },
      ],
      misleading: [
        {
          id: 'qc-amp-bars-not-places',
          text: 'A bar is not a place where the particle waits. Before a measurement there is one state, the whole list of amplitudes.',
        },
      ],
    },
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
    circuit: {
      exact: [
        {
          id: 'qc-circuit-engine-state',
          text: 'The state after the cursor is the engine’s run of this circuit, one column at a time. The bars beside it are that state.',
        },
        {
          id: 'qc-circuit-observable-engine',
          text: 'The bracketed Pauli string names what is measured; its eigenvalue, when shown, is the engine’s, never a typed outcome.',
        },
      ],
      schematic: [
        {
          id: 'qc-circuit-layout',
          text: 'Box sizes, spacing and wire lengths are drawn for reading. Only the order of the columns and the wires each gate touches mean anything.',
        },
      ],
      misleading: [
        {
          id: 'qc-circuit-wires-are-time',
          text: 'A wire is not a path through space. It is one qubit, and left to right is the order in time in which the gates act on it.',
        },
      ],
    },
    // the stage-kind batch (P-709-map §(b)): every entry is the engine's, a cell's size and hue are its size and phase
    matrix: {
      exact: [
        {
          id: 'qc-matrix-entries',
          text: 'Every cell is the engine’s entry ⟨i|A|j⟩. Its size is the entry’s size, and its colour is its phase, the same wheel as the number plane.',
        },
        {
          id: 'qc-matrix-trace-engine',
          text: 'A drawn trace, reduced matrix or Schmidt weight is computed by the engine from the same matrix, never typed by hand.',
        },
        {
          id: 'qc-matrix-basis-change',
          text: 'A chosen basis shows B†AB, computed by the engine from the same operator; the row and column labels name that basis’s own kets.',
        },
        {
          id: 'qc-matrix-spectrum-engine',
          text: 'Eigenvalue bars and the entropy figure come from the engine’s own eigensolver on the matrix as drawn, even after a basis change or transpose.',
        },
        {
          id: 'qc-matrix-tableau-engine',
          text: 'A tableau’s product string and phase come from Pauli multiplication. An eigenvalue badge comes from applying the string to the given state, never typed by hand.',
        },
      ],
      schematic: [
        {
          id: 'qc-matrix-hue-is-phase',
          text: 'A cell’s colour is a code for its phase, not light or an outcome. Zero entries are drawn blank, with no hue.',
        },
        {
          id: 'qc-matrix-reduced-arrows',
          text: 'Arrows from the big matrix to the small one only show which block feeds which cell; drawn sizes along the way are not to scale.',
        },
        {
          id: 'qc-matrix-spectrum-negative',
          text: 'An eigenvalue bar can sit below the zero line: a real negative eigenvalue, most often after a partial transpose, not a drawing mistake.',
        },
        {
          id: 'qc-matrix-tableau-letters',
          text: 'A Pauli letter’s colour is a fixed code (I neutral, X, Y, Z each their own hue), not this stage’s phase wheel.',
        },
      ],
      misleading: [
        {
          id: 'qc-matrix-not-a-space',
          text: 'The grid is a table of numbers, not a picture of a space: a cell’s position is an index pair (i, j), not a direction.',
        },
        {
          id: 'qc-matrix-ptranspose-not-physical',
          text: 'The partial transpose is a mathematical test (the Peres criterion), not an operation any device performs on the state.',
        },
      ],
    },
    // the two-qubit stage kind (P-709-remap §6.1): two reduced Bloch balls plus a 3×3 correlation grid
    'two-qubit': {
      exact: [
        {
          id: 'qc-tq-engine',
          text: 'Each arrow is the engine’s exact reduced Bloch vector, and every grid cell is the engine’s exact ⟨σᵢ⊗σⱼ⟩.',
        },
      ],
      schematic: [
        {
          id: 'qc-tq-grid-signed',
          text: 'A cell’s colour is amber for a positive correlation and cobalt for a negative one, the same code as a chance bar — never a phase.',
        },
      ],
      misleading: [
        {
          id: 'qc-tq-local-arrows',
          text: 'A short arrow means that qubit’s own part is a mix, not a weaker spin. Every single atom still reads exactly ±ħ/2.',
        },
        {
          id: 'qc-tq-not-two-places',
          text: 'The two balls are not two places in the lab. Each is the reduced state of one qubit; the grid beside them is not a third place either.',
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
