/**
 * The fidelity notes of the SVG stage kinds (interface change W-448 #5, rulings 448-L8L11 P6 and L10 R6): complex-plane,
 * amplitudes (and its Bell-basis reading), circuit, matrix, two-qubit and plot. They were written for Physics 709 and
 * lived in content/qc709/fidelity.ts, registered by the lazy 709 pack, so a 448 lecture that draws one of these kinds got
 * an EMPTY drawer. The kinds are SHARED stage code now (a 448 lecture names a kind by data, like any other), so their notes
 * are shared too: this module registers them for every course (content/fidelity.ts `registerSharedFidelity`), and
 * `fidelityOf(key, course)` finds them in either. stage/svg/kinds.ts imports it, so a page whose chapter uses an SVG kind
 * has the notes once the kinds' lazy chunk has loaded; the entry never carries them (build/chunks.test.ts (m)).
 *
 * The ids keep their `qc-` prefix (they were authored for 709; renaming would churn every beat's `fidelity` list), so
 * content/courses.test.ts counts them with 709's ids. Two things stay in the 709 pack: the `plane-photon` drawer (a
 * variant of the WebGL hilbert-plane kind) and the `additions` a 709 chapter makes to a WebGL kind's drawer. A kind a
 * 448 lecture adds later puts its own notes HERE, in the same shape. Every sentence <= 25 words (content/symbols.test.ts).
 */
import { registerSharedFidelity } from './fidelity'
import type { Fidelity, FidelityKey } from './stage'

export const SVG_FIDELITY: Partial<Record<FidelityKey, Fidelity>> = {
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
  // amplitudes with inBasis 'bell' (W-709 platform): the same state read against Φ+, Φ−, Ψ+, Ψ−; a fresh fidelityKey, so the
  // computational-basis 'amplitudes' drawer never changes
  'amplitudes-bell': {
    exact: [
      {
        id: 'qc-amp-bell-engine',
        text: 'Each bar is the engine’s overlap of the state with one Bell state. Its length is the size, and the squared lengths add to 1.',
      },
    ],
    schematic: [
      {
        id: 'qc-amp-bell-hue-is-phase',
        text: 'A bar’s colour shows its phase on the same wheel of hues as the number plane. It is a code for an angle, not light.',
      },
    ],
    misleading: [
      {
        id: 'qc-amp-bell-same-state',
        text: 'Reading in the Bell basis changes the list of bars, not the state. A product state can spread over several Bell bars.',
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
        text: 'A drawn trace, reduced matrix or Schmidt coefficient is computed by the engine from the same matrix, never typed by hand.',
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
      {
        id: 'qc-tq-entangle-engine',
        text: 'The concurrence C and the CHSH scores are the engine’s numbers for the whole pair, not read off the arrows.',
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
        id: 'qc-tq-chsh-ceiling',
        text: 'Max S is a ceiling over every choice of settings. The settings drawn on the balls may score less than it.',
      },
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
  // the `plot` stage kind (P-Q10-story §9.2): a 2-D curve sampled from a named engine function
  plot: {
    exact: [
      {
        id: 'qc-plot-engine-curve',
        text: 'Every point of the curve, and every marker on it, is computed by the engine from the named function; none is drawn by hand.',
      },
    ],
    schematic: [
      {
        id: 'qc-plot-sampled',
        text: 'The curve is a finite row of computed points joined by straight lines. More points draw a smoother curve, never a different one.',
      },
    ],
    misleading: [
      {
        id: 'qc-plot-not-a-measurement',
        text: 'This curve is the theory’s prediction, not a recorded run. No atoms or photons produced these numbers.',
      },
    ],
  },
  // matrix v3 (W-448 L9-A, Physics 448 Lecture 9): the pair view of the `matrix` kind, a table of boxes for two systems. Keys of
  // their own, so the operator-matrix drawer above never changes. The ids keep the shared `qc-` prefix of this module.
  'matrix-pair': {
    exact: [
      {
        id: 'qc-pair-boxes-engine',
        text: 'Each box is the engine’s amplitude for one pair of labels. Its size is the amplitude’s size, and the squared sizes add to 1.',
      },
      {
        id: 'qc-pair-readouts-engine',
        text: 'A drawn total, determinant or product verdict is computed by the engine from the boxes on stage, never typed by hand.',
      },
    ],
    schematic: [
      {
        id: 'qc-pair-hue-is-phase',
        text: 'A box’s colour is a code for its phase, not light or an outcome. An empty box is a zero amplitude.',
      },
      {
        id: 'qc-pair-first-letter',
        text: 'The first letter always names Alice’s spin and the second Bob’s. Alice’s labels run down the rows and Bob’s across the columns.',
      },
      {
        id: 'qc-pair-labels-only',
        text: 'A table of labels shows only which basis states exist. Bob’s die has no physics here: it just supplies six labels.',
      },
    ],
    misleading: [
      {
        id: 'qc-pair-not-two-states',
        text: 'A grid is not two separate states side by side. Only a product state’s grid is a column of Alice’s amplitudes times a row of Bob’s.',
      },
      {
        id: 'qc-pair-not-a-place',
        text: 'The grid is a table, not a picture of a place. A box’s position is a pair of labels, not a point in the lab.',
      },
    ],
  },
  'matrix-chances': {
    exact: [
      {
        id: 'qc-chances-engine',
        text: 'Each box is the chance of one pair of coin values, from the engine. The boxes add to 1, and the means come from them.',
      },
    ],
    schematic: [
      {
        id: 'qc-chances-no-phase',
        text: 'A box’s size is its chance. A chance has no phase, so this table has no colours.',
      },
    ],
    misleading: [
      {
        id: 'qc-chances-not-amplitudes',
        text: 'This table holds chances, not amplitudes. Nothing interferes here, and each coin was definite all along.',
      },
    ],
  },
}

// W-448 L8-B: Lecture 8's protocol ledger is a 448-owned kind, so its notes carry 448's own (unprefixed) ids
SVG_FIDELITY.bb84 = {
  exact: [
    {
      id: 'bb84-born-engine',
      text: 'Every bit Eve and Bob read is a draw from the engine’s own chances for the photon in front of them. The run is seeded, so it replays exactly.',
    },
    {
      id: 'bb84-tally-engine',
      text: 'The kept, error and Eve-knows counts, and the exact Q, are computed from every round sent, not read off the rows you see.',
    },
  ],
  schematic: [
    {
      id: 'bb84-last-rows',
      text: 'Only the latest twelve rounds are drawn as rows. Every tally and every Q̂ still covers all the photons sent.',
    },
    {
      id: 'bb84-ideal-channel',
      text: 'The channel is ideal: no photon is lost and no device is noisy. A line at an angle names a polarization; it does not picture a photon in flight.',
    },
  ],
  misleading: [
    {
      id: 'bb84-scatter',
      text: '**A finite run scatters.** Q̂ lands near the exact Q but is rarely equal to it, and a short test can show no error at all.',
    },
    {
      id: 'bb84-q-this-attack',
      text: 'The exact Q drawn belongs to this one attack. It is not an abort threshold and not the error rate of every attack.',
    },
  ],
}

// W-448 L11: Lecture 11's phase clocks are a 448-owned kind, so their notes carry 448's own (unprefixed) ids
SVG_FIDELITY.clocks = {
  exact: [
    {
      id: 'clocks-hands-exact',
      text: 'Each hand points where its energy component’s phase is: its starting angle minus E·t/ħ, turning clockwise. Its length is the size of that amplitude. Both are computed by the engine.',
    },
    {
      id: 'clocks-gap-azimuth',
      text: 'The angle between the two hands is the state’s Bloch azimuth φ = ωt, exactly. The arrow on the equator turns when, and only when, that gap changes.',
    },
  ],
  schematic: [
    {
      id: 'clocks-ladder-zero',
      text: 'The ladder’s spacing is to scale, but its zero is a choice. Only the difference E₊ − E₋ is observable, so Ē could be drawn at any height.',
    },
    {
      id: 'clocks-dial-not-space',
      text: 'A dial is a way to read a phase, not a place in space. Nothing in the lab turns round at E/ħ; the hands record how an amplitude’s phase changes.',
    },
  ],
  misleading: [
    {
      id: 'clocks-both-turn',
      text: '**Both hands turn, but only their gap is seen.** One hand alone is an overall phase, which changes no prediction. Turn both by the same angle and nothing observable moves.',
    },
    {
      id: 'clocks-hue-code',
      text: 'The hue is a code for the hand’s angle, not an outcome. Amber and cobalt keep their meaning for a + and a − reading.',
    },
  ],
}

registerSharedFidelity(SVG_FIDELITY)

/** Every fidelity item id here (the namespace test, content/courses.test.ts). */
export const SVG_FIDELITY_IDS: readonly string[] = Object.values(SVG_FIDELITY)
  .flatMap((f) => [...(f?.exact ?? []), ...(f?.schematic ?? []), ...(f?.misleading ?? [])])
  .map((i) => i.id)
/** The ids a 448 lecture added to the shared kinds (no `qc-` prefix): they count in 448's id space, not 709's. */
export const SVG_FIDELITY_IDS_448: readonly string[] = SVG_FIDELITY_IDS.filter((id) => !id.startsWith('qc-'))
