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
        id: 'qc-cplane-clock',
        text: 'The numbered marks of a clock face are equally spaced points on the unit circle. Mark $k$ is $k$ equal steps from the arrow 1.',
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
      {
        id: 'qc-amp-keep-sum',
        text: 'Under “first k wires”, each bar adds the engine’s chances over every string of the other wires; the bars still add to 1.',
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
  // amplitudes with dft (W-709 F8-A): the Fourier transform of the list, bars numbered by place; a fresh fidelityKey so the
  // computational-basis 'amplitudes' drawer never changes
  'amplitudes-fourier': {
    exact: [
      {
        id: 'qc-amp-fourier-engine',
        text: 'Each bar is the engine’s Fourier transform of the list at one place: its length is the size, and the squared lengths add to 1.',
      },
    ],
    schematic: [
      {
        id: 'qc-amp-fourier-hue-is-phase',
        text: 'A bar’s colour shows its phase on the same wheel of hues as the number plane. It is a code for an angle, not light.',
      },
    ],
    misleading: [
      {
        id: 'qc-amp-fourier-not-sound',
        text: 'The numbers under the bars are places in a list, not frequencies you can hear. A spike at place k means a repeat in step with k turns.',
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
        id: 'qc-circuit-fault-markers',
        text: 'A marker is a place a fault can happen, not a computed fault. The circuit has a marker at every place the plan lists; none says that a fault did happen.',
      },
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
      {
        id: 'tableau-verdict-engine',
        text: 'A ✓ or ✗ compares a row’s card, or the state’s own eigenvalue, with the number the row needs. The count of ✓ marks is the engine’s.',
      },
      {
        id: 'qc-update-rule',
        text: 'In an update picture, the clash marks, the generators after the measurement, the case and the stored-qubit counts all come from the engine’s update rule.',
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
        id: 'tq-centre-dot',
        text: 'An arrow of length 0 is drawn as a dot at the centre of its ball, never hidden. The dot is the engine’s exact reduced vector: no direction at all.',
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
        id: 'qc-plot-printed-constants',
        text: '**A fitted curve is arithmetic on constants a paper prints, not a measurement.** The engine only evaluates the formula. A hollow mark is a value as printed in the paper.',
      },
      {
        id: 'qc-plot-not-a-measurement',
        text: 'This curve is the theory’s prediction, not a recorded run. No atoms or photons produced these numbers.',
      },
      {
        id: 'qc-plot-points-printed',
        text: '**A hollow dot is a number a reference prints, used in the arithmetic as it stands.** A filled dot is computed by the engine. A distance printed as an upper bound is drawn with a tick and means "at most".',
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
      text: 'The kept, error and Eve-knows counts, and the exact error rate, are computed from every round sent, not read off the rows you see.',
    },
  ],
  schematic: [
    {
      id: 'bb84-last-rows',
      text: 'Only the latest twelve rounds are drawn as rows. Every tally and the “kept bits wrong” share still cover all the photons sent.',
    },
    {
      id: 'bb84-ideal-channel',
      text: 'The channel is ideal: no photon is lost and no device is noisy. A line at an angle names a polarization; it does not picture a photon in flight.',
    },
  ],
  misleading: [
    {
      id: 'bb84-scatter',
      text: '**A finite run scatters.** The “kept bits wrong” share lands near the exact error rate but is rarely equal to it. A short test can show no error at all.',
    },
    {
      id: 'bb84-q-this-attack',
      text: 'The exact error rate drawn belongs to this one attack. It is not an abort threshold and not the error rate of every attack.',
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

// P-Q17-story §9.2: Chapter Q17's plane is a 709-owned kind, so its notes carry the `qc-` prefix
SVG_FIDELITY['grover-plane'] = {
  exact: [
    {
      id: 'qc-gp-engine',
      text: 'The arrow is the engine’s state after k steps: cos((2k+1)α) across and sin((2k+1)α) up. A full simulation of the circuit gives the same numbers.',
    },
    {
      id: 'qc-gp-slice',
      text: 'Only this plane is drawn. Every other direction of the full space has amplitude 0 at every step, so nothing the search does is left out.',
    },
    {
      id: 'qc-gp-shadow',
      text: 'The arrow’s vertical shadow is the amplitude of the marked string. Its square is the chance of reading a marked string.',
    },
  ],
  schematic: [
    {
      id: 'qc-gp-not-bloch',
      text: 'Angles here are state angles, never doubled. Two states at right angles share no answer; on a Bloch sphere such states sit 180° apart.',
    },
  ],
  misleading: [
    {
      id: 'qc-gp-real',
      text: '**This plane is real only because the start and every step are real.** A general quantum state has complex amplitudes and does not fit a flat picture like this.',
    },
  ],
}

// P-F7-story §9.2: Chapter F7's classical bits are a 709-owned kind, so its notes carry the `qc-` prefix
SVG_FIDELITY.bits = {
  exact: [
    {
      id: 'qc-bits-engine',
      text: 'Every output, sum, dot product, syndrome and reduced row is computed by the engine from the inputs shown. Nothing is typed in by hand.',
    },
    {
      id: 'qc-bits-bitmap',
      text: 'In a check-matrix picture every filled pixel is a 1 of the code’s matrix, and the counts beside it are the engine’s. Nothing is typed in by hand.',
    },
    {
      id: 'qc-bits-arrows',
      text: 'In the map view each input has exactly one arrow. An output that several arrows reach is outlined and counted: that gate merges inputs and cannot run backwards.',
    },
  ],
  schematic: [
    {
      id: 'qc-bits-cells',
      text: 'A filled cell is a 1 and an empty cell is a 0. The colours carry no meaning beyond that: the picture shows ordinary bits, not amplitudes.',
    },
    {
      id: 'qc-bits-moves',
      text: 'The row reduction is drawn one move at a time: a row swap, or one row XORed into another. The order is the engine’s.',
    },
  ],
  misleading: [
    {
      id: 'qc-bits-basis-dependent',
      text: '**A matrix of 1s and 0s depends on how the qubits are numbered.** Another numbering, or another choice of logical operators, gives a different table for the same code.',
    },
    {
      id: 'qc-bits-classical',
      text: '**This is classical.** A bit here is 0 or 1, never a superposition. A reversible gate is drawn as a shuffle of strings, which is only the tip of what a quantum gate does.',
    },
  ],
}

// P-Q21-story §9.2 K1: the error-correcting code kind is shared by Chapters Q21 and Q22 and the Papers chapters; its notes carry the `qc-` prefix
SVG_FIDELITY.code = {
  exact: [
    {
      id: 'qc-code-bb-cycle',
      text: 'The engine counts the edges in a round, the places used twice and the out-of-order pairs from Table 5 of Bravyi et al. The length of a stub is a drawing choice.',
    },
    {
      id: 'qc-code-bp-engine',
      text: 'Every belief, hard decision and OSD-0 answer is computed by the engine’s own min-sum and ordered-statistics routines from the error shown. Nothing is typed in by hand.',
    },
    {
      id: 'qc-code-engine',
      text: 'Every syndrome, correction, residual, logical operator, code word and distance is computed by the engine from the error shown. Nothing is typed in by hand.',
    },
    {
      id: 'qc-code-edges',
      text: 'An edge joins a check to exactly the qubits it acts on, in the colour of the letter it applies there. These edges are the check matrix.',
    },
  ],
  schematic: [
    {
      id: 'qc-code-schedule-order',
      text: 'The numbers on a check’s spokes are the engine’s order of steps. Where the spokes and faces are drawn is a drawing choice.',
    },
    {
      id: 'qc-code-layout',
      text: 'Where a disc or a square is drawn is a drawing choice. Only which qubits a check touches carries meaning, never how far apart they are drawn.',
    },
    {
      id: 'qc-code-bb-layout',
      text: 'The cell blocks follow the paper’s torus picture, and a long edge is drawn as a short stub toward its qubit, labelled with the offset. Only which qubits a check touches carries meaning, never how far apart they are drawn.',
    },
    {
      id: 'qc-code-surgery-schematic',
      text: 'The seam is drawn between the patches to show which checks exist. The outcomes of the new checks are random; this picture is not a run.',
    },
    {
      id: 'qc-code-distance',
      text: 'The distance $d$ is the weight of the lightest logical operator. The search is complete for 25 qubits or fewer. For the bicycle codes it is the paper’s number, and the operator drawn is only an upper bound.',
    },
  ],
  misleading: [
    {
      id: 'qc-code-bp-plain',
      text: '**This is plain min-sum belief propagation on a tiny code, not the decoder the paper uses.** It shows why a decoder can stall; it says nothing about how the paper’s decoder performs at scale.',
    },
    {
      id: 'qc-code-lit',
      text: '**A lit check is a $-1$ reading, not a broken qubit.** It says some error anticommutes with that check. The qubit at fault may be several edges away.',
    },
  ],
}

// P-B1-story §9.2 K-ST: the detector history of the repetition code
SVG_FIDELITY.spacetime = {
  exact: [
    {
      id: 'qc-spacetime-engine',
      text: 'Every lit detector, every pairing of the matching, its weight and the verdict are computed by the engine from the faults shown. Nothing is typed in by hand.',
    },
  ],
  schematic: [
    {
      id: 'qc-spacetime-layout',
      text: 'Where a detector or an edge is drawn is a drawing choice: columns are checks and rows are rounds. In the spectrum a bar’s length is the logarithm of its count, which is written beside it.',
    },
  ],
  misleading: [
    {
      id: 'qc-spacetime-repetition-only',
      text: '**This is the repetition code: one dimension of space, plus time.** A surface code has two space dimensions, so its history is a three-dimensional lattice.',
    },
  ],
}

// P-B3 S-b: the repeated product readout of a seam, a toy model (its own drawer: the spacetime drawer above is about the repetition code)
SVG_FIDELITY['spacetime-readout'] = {
  exact: [
    {
      id: 'qc-spacetime-readout-engine',
      text: 'Every flipped reading, every product reading, the vote and the chances are computed by the engine from the faults shown.',
    },
  ],
  schematic: [
    {
      id: 'qc-spacetime-readout-layout',
      text: 'Where a reading is drawn is a drawing choice: columns are the seam checks and rows are the rounds, going down.',
    },
  ],
  misleading: [
    {
      id: 'qc-spacetime-toy',
      text: '**This is a toy model: every reading flips independently, and the verdict is a plain majority vote.** The theorem asks for $d$ rounds for a reason this picture does not show.',
    },
  ],
}

// P-B4-story §9.2 S-a: a program of Pauli operations on wires (built in B3 for the measurement programs)
SVG_FIDELITY['pauli-program'] = {
  exact: [
    {
      id: 'qc-program-letters',
      text: 'The Pauli letters, the signs of the angles and outcomes, and the counts of measurements, rotations and injections are the authored data, drawn as written.',
    },
  ],
  schematic: [
    {
      id: 'qc-program-layout',
      text: 'The spacing of the columns is a drawing choice. Only their order, left to right, is the order of the operations.',
    },
  ],
  misleading: [
    {
      id: 'qc-program-magic-lane',
      text: '**The magic lane is drawn for reading; it is not a wire of the program.** Reading it as one more qubit gives the wrong count of wires.',
    },
  ],
}

// P-B3 S-a: the gauging graph of a logical operator
SVG_FIDELITY['surgery-graph'] = {
  exact: [
    {
      id: 'qc-graph-counts',
      text: 'The counts of dots, links and cycles, the Cheeger constant, the qubits and the distances are computed by the engine from the graph shown.',
    },
  ],
  schematic: [
    {
      id: 'qc-graph-layout',
      text: 'Where a dot or a link is drawn is a drawing choice. Only which dots a link joins carries meaning, never how long it is drawn.',
    },
  ],
  misleading: [
    {
      id: 'qc-graph-one-choice',
      text: '**The drawn graph is one choice of many.** Another connected graph on the same dots gives other cycles, another Cheeger constant and another distance.',
    },
  ],
}

// Papers P1: the bicycle machine of Tour de gross as modules, adapters and a T factory
SVG_FIDELITY['module-map'] = {
  exact: [
    {
      id: 'qc-module-map-counts',
      text: 'Every count comes from the engine’s version of Eq. 25. The block sizes c, a and a′ are computed, while u and f are the paper’s Table 1 estimates, marked reported.',
    },
  ],
  schematic: [
    {
      id: 'qc-module-map-schematic',
      text: 'Block areas grow with the square root of the qubit counts, and positions are a drawing. The counts u and f are the paper’s estimates.',
    },
    {
      id: 'qc-module-map-wires',
      text: 'The 12 logical wires of a module are 12 dots in two columns. Qubit 1 is the pivot and qubit 7 is ringed; where the others sit is a drawing choice.',
    },
  ],
  misleading: [
    {
      id: 'qc-module-map-not-a-chip',
      text: '**This is a diagram of the parts, not a chip layout.** The linear and the triangular drawings count the same qubits, and neither shows where wires or couplers run.',
    },
    {
      id: 'qc-module-map-yield-ours',
      text: '**The chip yield assumes two couplers per qubit, which is our assumption.** The paper gives the junction yield, and the coupler count is not from the paper.',
    },
  ],
}

/**
 * Papers P1: drawers of two VARIANTS of existing kinds, each with its own key so the drawers of the plain kinds never change (the passports PASSPORT_VARIANT.surgeryLpu and .codePaperOps name them).
 * They are registered with the shared notes, their ids count with the other `qc-` ids, and every sentence is at most 25 words (stage/svg/surgeryGraph.lpu.test.tsx checks it).
 */
export const SVG_FIDELITY_VARIANTS: Partial<Record<FidelityKey, Fidelity>> = {
  // surgery-graph with an `lpu` source: the ancilla graph of a logical processing unit (App. A.3)
  'surgery-lpu': {
    exact: [
      {
        id: 'qc-lpu-counts',
        text: 'The dots and links of each half graph come from the Z checks that meet the operator twice. The counts of dots, links and E − V + 1 are computed from them.',
      },
    ],
    schematic: [
      {
        id: 'qc-lpu-layout',
        text: 'Dots sit on circles in the order of the qubits, and the shared dot stands between them. Which dots a bridge link joins is a drawing choice.',
      },
    ],
    misleading: [
      {
        id: 'qc-lpu-kept-reported',
        text: '**The cycles kept as checks, the bridge links and the added edges of the two-gross graph are the paper’s printed counts.** The engine does not choose which cycles to keep.',
      },
    ],
  },
  // code with a `bb.paperOps` overlay: the paper’s logical operators on the cells of the bicycle code
  'code-paper-ops': {
    exact: [
      {
        id: 'qc-code-paper-ops',
        text: 'The marked qubits are the support of the paper’s logical operators, rebuilt by the engine from its polynomials. A shift moves them by the monomial x^a y^b.',
      },
    ],
    schematic: [
      {
        id: 'qc-code-paper-ops-layout',
        text: 'The cells follow the paper’s torus picture. Only which qubits an operator touches carries meaning, never how far apart they are drawn.',
      },
    ],
    misleading: [
      {
        id: 'qc-code-paper-ops-basis',
        text: '**The name X̄1 is the paper’s choice of basis, one of many.** Another representative of the same logical operator has another support and shares other qubits.',
      },
    ],
  },
}

registerSharedFidelity(SVG_FIDELITY)
registerSharedFidelity(SVG_FIDELITY_VARIANTS)

/** Every fidelity item id here (the namespace test, content/courses.test.ts). */
export const SVG_FIDELITY_IDS: readonly string[] = [...Object.values(SVG_FIDELITY), ...Object.values(SVG_FIDELITY_VARIANTS)]
  .flatMap((f) => [...(f?.exact ?? []), ...(f?.schematic ?? []), ...(f?.misleading ?? [])])
  .map((i) => i.id)
/** The ids a 448 lecture added to the shared kinds (no `qc-` prefix): they count in 448's id space, not 709's. */
export const SVG_FIDELITY_IDS_448: readonly string[] = SVG_FIDELITY_IDS.filter((id) => !id.startsWith('qc-'))
