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
  // F2 "Vectors and inner products": bridges INTO other Foundations chapters (course: 'qc709')
  'qc-f1-plane': { course: 'qc709', lecture: 'F1', unit: 'f1-plane', label: 'numbers as points and arrows' },
  'qc-f1-phase': { course: 'qc709', lecture: 'F1', unit: 'f1-phase', label: 'phases you can and cannot see' },
  // F2's one forward reference (f2-orthonormal:b4, both tracks): into F3's change-of-basis unit
  'qc-f3-change-of-basis': { course: 'qc709', lecture: 'F3', unit: 'f3-change-of-basis', label: 'the matrix that turns one frame’s coordinates into another’s' },
  // F3 "Matrices and linear maps": built in parallel with F2 and F4, so two F2 recaps and three F4 forward
  // references were written as plain words (F3.story.ts header); now real bridges, each reused at its own count
  // of sites (content/qc709/bridges.test.ts: an id used more than once is fine, only an unused id fails).
  'qc-f2-orthonormal': { course: 'qc709', lecture: 'F2', unit: 'f2-orthonormal', label: 'a right-angled frame of unit vectors' },
  'qc-f4-spectral': { course: 'qc709', lecture: 'F4', unit: 'f4-spectral', label: 'a Hermitian table as a sum of eigenvalues and projectors' },
  // F6 "Tensor products": into F2 (vectors, merged) and F3 (matrices, merged)
  'qc-f2-vectors': { course: 'qc709', lecture: 'F2', unit: 'f2-vectors', label: 'states as lists of amplitudes' },
  'qc-f3-matrix-of-map': { course: 'qc709', lecture: 'F3', unit: 'f3-matrix-of-map', label: 'a map written as a table of numbers' },
  // F5 "Chance with numbers": into F2 (the inner product, for the Born-rule link P = |⟨a|ψ⟩|²)
  'qc-f2-inner-product': { course: 'qc709', lecture: 'F2', unit: 'f2-inner-product', label: 'the overlap and its size' },
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
  // Optional Foundations forward links, where a Q chapter's own inline Ground-up teaching starts (brief-709-
  // widgets-wiring Job 2): Q3's eigenvectors/eigenvalues into F4, Q6's joint space into F6. Q2 reuses `qc-f2-vectors`
  // above, already registered for F6's own bridge into the same F2 unit.
  'qc-f4-eigen': { course: 'qc709', lecture: 'F4', unit: 'f4-eigen', label: 'the arrows a machine only stretches' },
  'qc-f6-pairs': { course: 'qc709', lecture: 'F6', unit: 'f6-pairs', label: 'the joint space of two systems' },
  // Chapter Q15 (P-Q15-story §11.1): the four Spin Lab Lecture 8 units that teach the key protocols it builds on, linked and never re-derived
  'qc-l8-key': { course: 'sl448', lecture: 'L8', unit: 'l8-key', label: 'the one-time pad and why the key must be shared' },
  'qc-l8-bb84': { course: 'sl448', lecture: 'L8', unit: 'l8-bb84', label: 'BB84 with photons, step by step' },
  'qc-l8-attack': { course: 'sl448', lecture: 'L8', unit: 'l8-attack', label: 'intercept\u2013resend and its error rate' },
  'qc-l8-test': { course: 'sl448', lecture: 'L8', unit: 'l8-test', label: 'a public test sample that catches Eve' },
  // Chapter F7 "Bits and logic that can run backwards" (P-F7-story §11.3): out of F7 into F4's unitaries and Q4's Hadamard unit ...
  'qc-f4-unitary': { course: 'qc709', lecture: 'F4', unit: 'f4-unitary', label: 'machines that keep every length' },
  'qc-q4-one-qubit-gates': { course: 'qc709', lecture: 'Q4', unit: 'q4-one-qubit-gates', label: 'the Hadamard gate among the one-qubit gates' },
  // Q22 names the phase gate S: the same unit, on the beat that introduces it (the Hadamard link above stays at the unit)
  'qc-q4-phase-gate': { course: 'qc709', lecture: 'Q4', unit: 'q4-one-qubit-gates', beat: 'q4-one-qubit-gates:b6', label: 'the phase gate S among the one-qubit gates' },
  // ... and into F7 from Q4 (CNOT as XOR; CNOT undoes itself), Q16 (the functions DJ promises about; the dot product and its pairing; the query count)
  // and Q17 (the cost of searching)
  'qc-f7-boolean': { course: 'qc709', lecture: 'F7', unit: 'f7-boolean', label: 'functions of bits as truth tables' },
  'qc-f7-reversible': { course: 'qc709', lecture: 'F7', unit: 'f7-reversible', label: 'gates that can run backwards' },
  'qc-f7-xor': { course: 'qc709', lecture: 'F7', unit: 'f7-xor', label: 'XOR, signs and the bit dot product' },
  'qc-f7-cost': { course: 'qc709', lecture: 'F7', unit: 'f7-cost', label: 'counting the cost of a method' },
  // Chapter F8 "Hidden rhythms" (P-F8-story §11.3): out of F8 into F1 (e^{iφ} as a turn; multiplying arrows) and F7 (linear algebra over bits) ...
  'qc-f1-euler': { course: 'qc709', lecture: 'F1', unit: 'f1-euler', label: 'eⁱᵠ: walking round the unit circle' },
  'qc-f1-multiply': { course: 'qc709', lecture: 'F1', unit: 'f1-multiply', label: 'multiplying arrows: sizes multiply, angles add' },
  'qc-f7-gf2': { course: 'qc709', lecture: 'F7', unit: 'f7-gf2', label: 'linear algebra with only 0 and 1' },
  // ... and into F8 from Q11 (the clock behind j ⊕ m, the roots behind the phases of the generalized Bell basis) and Q16 (the cancelling sum of the
  // Hadamard column is the N = 2 sum of roots of unity)
  'qc-f8-clock': { course: 'qc709', lecture: 'F8', unit: 'f8-clock', label: 'clock arithmetic: adding mod N' },
  'qc-f8-roots': { course: 'qc709', lecture: 'F8', unit: 'f8-roots', label: 'roots of unity and the sums that cancel' },
  // Chapter Q18 (P-Q18-story §11.3): into F8's Fourier transform (the QFT is its table), geometric sums (the 4/π² bound), binary and continued fractions (the QFT's wire turns
  // and the reading of an order) and the Euclidean algorithm (gcd, the order and the factors); F8's roots and clock bridges above are reused
  'qc-f8-dft': { course: 'qc709', lecture: 'F8', unit: 'f8-dft', label: 'the Fourier transform as a table of roots of unity' },
  'qc-f8-geometric': { course: 'qc709', lecture: 'F8', unit: 'f8-geometric', label: 'geometric sums and the shape of a near miss' },
  'qc-f8-fractions': { course: 'qc709', lecture: 'F8', unit: 'f8-fractions', label: 'binary and continued fractions' },
  'qc-f8-euclid': { course: 'qc709', lecture: 'F8', unit: 'f8-euclid', label: 'common factors, inverses and the order' },
  // Chapter Q21 (P-Q21-story §11.3): into F5's chances over a list of outcomes (independent flips); F7's GF(2) bridge and Spin Lab's bridges above are reused
  'qc-f5-probability': { course: 'qc709', lecture: 'F5', unit: 'f5-probability', label: 'chances over a list of outcomes' },
  // Lecture notes N1 (docs/roles/proposals/W-709-notes.md): notes -> the built Chapter Q1 units that teach each section (709 -> 709; the generated
  // `qc-n<k>-<slug>` rows that lead back from a chapter unit to a notes section are built at load by qc709/registry.ts and are not in this table)
  'qc-q1-sequences': { course: 'qc709', lecture: 'Q1', unit: 'q1-sequences', label: 'sequences of magnets, with the chances worked out' },
  'qc-q1-superposition': { course: 'qc709', lecture: 'Q1', unit: 'q1-superposition', label: 'adding two states and rescaling the sum' },
  'qc-q1-inner-product': { course: 'qc709', lecture: 'Q1', unit: 'q1-inner-product', label: 'the inner product, with its length and angle' },
  // Q10 notes delta (L10 pp. 47-58): the hidden-label cards in Spin Lab, and the convexity of states in Q8
  'qc-l10-instructions': { course: 'sl448', lecture: 'L10', unit: 'l10-instructions', label: 'instruction cards behind a correlation' },
  'qc-q8-recipes': { course: 'qc709', lecture: 'Q8', unit: 'q8-recipes', label: 'one density matrix, many recipes; the convex set of states' },
  // Q12 notes delta (L10 pp. 48-55): Q9's entropy, Q10's CHSH violation, Q8's Bloch ball, and Q9's link forward to Q12's conditional entropy
  'qc-q9-entropy': { course: 'qc709', lecture: 'Q9', unit: 'q9-entropy', label: 'the entropy of a state' },
  'qc-q10-violation': { course: 'qc709', lecture: 'Q10', unit: 'q10-violation', label: 'breaking the CHSH ceiling' },
  'qc-q8-ball': { course: 'qc709', lecture: 'Q8', unit: 'q8-ball', label: 'a mixed qubit as a point inside the ball' },
  'qc-q12-entropy': { course: 'qc709', lecture: 'Q12', unit: 'q12-entropy', label: 'the conditional entropy of a pair' },
  // Lecture notes N1 (docs/roles/proposals/P-709-remap-L8L11.md §6.1): the Chapter Q1 units not yet linked
  'qc-q1-two-spots': { course: 'qc709', lecture: 'Q1', unit: 'q1-two-spots', label: 'two spots, not a smear, and the quantized spin' },
  'qc-q1-vector-space': { course: 'qc709', lecture: 'Q1', unit: 'q1-vector-space', label: 'the rules a vector space obeys, with examples' },
  // Lecture notes N2: the chapter units its sections teach
  'qc-q2-basis': { course: 'qc709', lecture: 'Q2', unit: 'q2-basis', label: 'bases and components in an orthonormal basis' },
  'qc-q2-gram-schmidt': { course: 'qc709', lecture: 'Q2', unit: 'q2-gram-schmidt', label: 'building a right-angled basis from any independent set' },
  'qc-q2-spin-space': { course: 'qc709', lecture: 'Q2', unit: 'q2-spin-space', label: 'the spin states as a two-dimensional space' },
  'qc-q2-change': { course: 'qc709', lecture: 'Q2', unit: 'q2-change', label: 'components in a new basis, and the unitary that gives them' },
  'qc-q2-photon': { course: 'qc709', lecture: 'Q2', unit: 'q2-photon', label: 'photon polarization as a second two-dimensional space' },
  'qc-q2-operators': { course: 'qc709', lecture: 'Q2', unit: 'q2-operators', label: 'an operator as a table of matrix elements' },
  // Lecture notes N3: the chapter units its sections teach
  'qc-q3-born': { course: 'qc709', lecture: 'Q3', unit: 'q3-born', label: 'chances as squared overlaps, and projectors' },
  'qc-q3-bloch': { course: 'qc709', lecture: 'Q3', unit: 'q3-bloch', label: 'a spin state as a point on the Bloch sphere' },
  'qc-q3-spin-operators': { course: 'qc709', lecture: 'Q3', unit: 'q3-spin-operators', label: 'the spin operators and the Pauli matrices' },
  'qc-q3-observables': { course: 'qc709', lecture: 'Q3', unit: 'q3-observables', label: 'observables as Hermitian operators' },
  // Lecture notes N4: the chapter units its sections teach
  'qc-q3-spectral': { course: 'qc709', lecture: 'Q3', unit: 'q3-spectral', label: 'eigenvalues, eigenvectors and the spectral form' },
  'qc-q3-uncertainty': { course: 'qc709', lecture: 'Q3', unit: 'q3-uncertainty', label: 'commutators, compatible observables and the uncertainty relation' },
  // Lecture notes N5: the chapter units its sections teach
  'qc-q6-many': { course: 'qc709', lecture: 'Q6', unit: 'q6-many', label: 'how many amplitudes N qubits carry' },
  'qc-q6-entangled': { course: 'qc709', lecture: 'Q6', unit: 'q6-entangled', label: 'product states against entangled states' },
  'qc-q6-tensor': { course: 'qc709', lecture: 'Q6', unit: 'q6-tensor', label: 'the tensor product of states and operators' },
  'qc-q4-cnot': { course: 'qc709', lecture: 'Q4', unit: 'q4-cnot', label: 'the controlled-NOT gate' },
  'qc-q6-bell-basis': { course: 'qc709', lecture: 'Q6', unit: 'q6-bell-basis', label: 'the four Bell states as a basis' },
  'qc-q6-bell-circuit': { course: 'qc709', lecture: 'Q6', unit: 'q6-bell-circuit', label: 'preparing and measuring in the Bell basis' },
  // Lecture notes N6: the chapter units its sections teach
  'qc-q6-parities': { course: 'qc709', lecture: 'Q6', unit: 'q6-parities', label: 'the commuting parities behind the Bell measurement' },
  'qc-q7-ghz': { course: 'qc709', lecture: 'Q7', unit: 'q7-ghz', label: 'the GHZ state and its correlations' },
  'qc-q7-parity-table': { course: 'qc709', lecture: 'Q7', unit: 'q7-parity-table', label: 'the table of allowed outcomes in the x and y bases' },
  'qc-q7-bit-strings': { course: 'qc709', lecture: 'Q7', unit: 'q7-bit-strings', label: 'bit-string chances for every choice of bases' },
  // Lecture notes N7: the chapter units its sections teach
  'qc-q7-observables': { course: 'qc709', lecture: 'Q7', unit: 'q7-observables', label: 'the four commuting Pauli-product observables' },
  'qc-q7-mermin': { course: 'qc709', lecture: 'Q7', unit: 'q7-mermin', label: 'Mermin’s contradiction and where quantum mechanics escapes it' },
  'qc-q8-why': { course: 'qc709', lecture: 'Q8', unit: 'q8-why', label: 'the box that forces a density matrix' },
  'qc-q8-pure-rho': { course: 'qc709', lecture: 'Q8', unit: 'q8-pure-rho', label: 'the density matrix of a pure state' },
  // Lecture notes N8: the Chapter Q8 and Q9 units its sections teach
  'qc-q8-trace-rule': { course: 'qc709', lecture: 'Q8', unit: 'q8-trace-rule', label: 'mean values from the trace, and the von Neumann equation' },
  'qc-q8-mixed': { course: 'qc709', lecture: 'Q8', unit: 'q8-mixed', label: 'ensembles, purity and the thermal state' },
  'qc-q9-partial-trace': { course: 'qc709', lecture: 'Q9', unit: 'q9-partial-trace', label: 'tracing out one party to get its reduced state' },
  'qc-q9-same-part': { course: 'qc709', lecture: 'Q9', unit: 'q9-same-part', label: 'different pairs with the same reduced state' },
  // Lecture notes N9: the Chapter Q9 units its sections teach
  'qc-q9-schmidt': { course: 'qc709', lecture: 'Q9', unit: 'q9-schmidt', label: 'the Schmidt form of a pure pair' },
  'qc-q9-purification': { course: 'qc709', lecture: 'Q9', unit: 'q9-purification', label: 'every mixed state as half of a pure pair' },
  // Lecture notes N10: the Chapter Q10 and Q12 units its sections teach
  'qc-q10-separable': { course: 'qc709', lecture: 'Q10', unit: 'q10-separable', label: 'separable and entangled states, pure and mixed' },
  'qc-q10-bell': { course: 'qc709', lecture: 'Q10', unit: 'q10-bell', label: 'Bell’s three-direction inequality and the singlet correlation' },
  'qc-q12-coherence': { course: 'qc709', lecture: 'Q12', unit: 'q12-coherence', label: 'two populations and a coherence that bound separable states' },
  'qc-q12-concurrence': { course: 'qc709', lecture: 'Q12', unit: 'q12-concurrence', label: 'the concurrence and the entanglement of formation' },
  'qc-q12-ppt': { course: 'qc709', lecture: 'Q12', unit: 'q12-ppt', label: 'the partial transpose test' },
  'qc-q12-family': { course: 'qc709', lecture: 'Q12', unit: 'q12-family', label: 'one worked family compared across every test' },
  // Lecture notes N11: the Chapter Q10 units its sections teach
  'qc-q10-hidden': { course: 'qc709', lecture: 'Q10', unit: 'q10-hidden', label: 'hidden labels behind the correlations' },
  'qc-q10-chsh': { course: 'qc709', lecture: 'Q10', unit: 'q10-chsh', label: 'the CHSH inequality for two settings per side' },
  'qc-q10-no-signal': { course: 'qc709', lecture: 'Q10', unit: 'q10-no-signal', label: 'why the correlations carry no signal' },
  // Chapter Q19 (P-Q19-story §11.3): into Spin Lab's lecture 11, for the generator e^{-iHt} and the Schrödinger equation behind quantum simulation
  'qc-l11-generator': { course: 'sl448', lecture: 'L11', unit: 'l11-generator', label: 'the Hamiltonian generates each tiny step' },
  'qc-l11-schrodinger': { course: 'sl448', lecture: 'L11', unit: 'l11-schrodinger', label: 'the Schrödinger equation' },
  // Optics Lab (P-optics-lab §0, ruling O4): the Spin Lab and Chapter Q5 units its sections lean on (eight new rows)
  'qc-l11-two-level': { course: 'sl448', lecture: 'L11', unit: 'l11-two-level', label: 'a two-level atom in a field' },
  'qc-l11-stationary': { course: 'sl448', lecture: 'L11', unit: 'l11-stationary', label: 'stationary states and their phases' },
  'qc-l12-driven': { course: 'sl448', lecture: 'L12', unit: 'l12-driven', label: 'a driven two-level atom and its resonance' },
  'qc-l13-plane-wave': { course: 'sl448', lecture: 'L13', unit: 'l13-plane-wave', label: 'the plane wave and its momentum' },
  'qc-l13-generator': { course: 'sl448', lecture: 'L13', unit: 'l13-generator', label: 'momentum generates the shifts' },
  'qc-l13-stationary': { course: 'sl448', lecture: 'L13', unit: 'l13-stationary', label: 'stationary states of a wave' },
  'qc-l13-flow': { course: 'sl448', lecture: 'L13', unit: 'l13-flow', label: 'the flow of probability' },
  'qc-q5-interferometer': { course: 'qc709', lecture: 'Q5', unit: 'q5-interferometer', label: 'interference as a way to compute' },
}
