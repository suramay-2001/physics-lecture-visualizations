/**
 * Physics 709 Lecture 9 notes (N9), a full companion: section II.J (the Schmidt decomposition and purification, Eqs. 2.24 to 2.33),
 * printed pages 44 to 46 of the new edition. The prose paraphrases the notes in their Formal register and links the Chapter Q9 units that
 * teach each section. Every number is a claim under Chapter Q9's own key (ruling W12).
 */
import type { Lecture } from '../../schema'
import { notesLecture } from './kit'
import { V, claim, close, d, C_PUR, C_PUR_H } from '../Q9.values'

/** The running pair of Chapter Q9 (its A part is the equal mixture of |0⟩ and |+x⟩ of Lecture 8) and the same pair after a Hadamard gate on B. */
const PP = { circuit: C_PUR, upTo: 2 } as const
const PPH = { circuit: C_PUR_H, upTo: 3 } as const

export const N9: Lecture = notesLecture({
  number: 9,
  title: 'Schmidt decomposition and purification',
  date: '2026-10-05',
  topics: [
    'the Schmidt decomposition of a pure pair',
    'equal spectra of the two reduced states',
    'purification of a mixed state',
    'the smallest ancilla and the pure case',
    'purifications related by a unitary on the ancilla',
  ],
  length: 'full',
  symbols: {
    '|\\cdot\\rangle': 'n9-opening:b2',
    '|\\psi\\rangle': 'n9-opening:b2',
    'A': 'n9-opening:b2',
    'B': 'n9-opening:b2',
    'i_A': 'n9-schmidt:b1',
    '|\\tildev_i_A\\rangle': 'n9-schmidt:b1',
    '|u_i_A\\rangle': 'n9-schmidt:b2',
    '\\langle\\cdot|': 'n9-schmidt:b2',
    '\\rho_A': 'n9-schmidt:b2',
    '\\lambda_i_A': 'n9-schmidt:b2',
    '|w_i_A\\rangle': 'n9-schmidt:b3',
    'N': 'n9-schmidt:b3',
    '\\rho_B': 'n9-schmidt:b3',
    '|0\\rangle': 'n9-schmidt:b3',
    '|+x\\rangle': 'n9-schmidt:b3',
    '|\\Phi\\rangle': 'n9-purification:b1',
    '|\\psi_i\\rangle': 'n9-purification:b1',
    'p_i': 'n9-purification:b1',
    '|v_i\\rangle': 'n9-purification:b1',
    '|v_j\\rangle': 'n9-purification:b2',
    'i': 'n9-purification:b2',
    'j': 'n9-purification:b2',
    '\\lambda_k': 'n9-unitary:b1',
    '|u_k\\rangle': 'n9-unitary:b1',
    'U_B': 'n9-unitary:b1',
    '|\\Phi_2\\rangle': 'n9-unitary:b1',
    '|\\Phi_1\\rangle': 'n9-unitary:b1',
    'I_A': 'n9-unitary:b1',
    '\\otimes': 'n9-unitary:b1',
  },
  sections: [
    {
      id: 'n9-opening',
      label: '§II.J',
      title: 'Two ends of one fact',
      pages: 'p. 44',
      summary: 'The Schmidt decomposition and purification are one statement approached from two sides, and the notes derive them together.',
      body: [
        {
          text: 'Lecture 9 treats two results that are one fact approached from either side. A pure state of a pair can be brought to a canonical form with a single sum over product terms, and a mixed state of one party can always be viewed as one half of a pure pair. The second result is built from the first, so the notes derive them in one go (<<qc-q9-schmidt|Unit 9.4>>, <<qc-q9-purification|Unit 9.5>>).',
        },
        {
          text: 'Both statements concern a pure state $|\\psi\\rangle_{AB}$ of two parties $A$ and $B$, as named in Lecture 8. The Schmidt form says what such a state looks like in suitable local bases, and purification says which pure states have a given reduced state. Reading them in this order shows why the eigenvalues of a reduced state appear in both (<<qc-q9-schmidt|Unit 9.4>>).',
        },
      ],
    },
    {
      id: 'n9-schmidt',
      label: '§II.J.1',
      title: 'Schmidt decomposition',
      pages: 'pp. 44–45',
      summary: 'Choosing the eigenbasis of one reduced state puts the grouped partner vectors at right angles, which collapses the double sum into a single one.',
      body: [
        {
          text: 'Expand a pure state of the pair in [[qc-orthonormal-basis|orthonormal bases]] of $A$ and of $B$, then group the terms by the index $i_A$ of the first party (Eq. 2.24). The result is a sum over $i_A$ of a basis ket of $A$ times a grouped vector $|\\tilde v_{i_A}\\rangle$. These vectors live in $B$ but carry the label of $A$, and in general they are not orthonormal. For arbitrary bases the double sum has no further structure, so the next step is to choose the bases cleverly (<<qc-q9-schmidt|Unit 9.4>>).',
        },
        {
          text: 'The grouped vectors turn out to be [[orthogonal|orthogonal]] after all, once the basis of $A$ is chosen well. Let the kets $|u_{i_A}\\rangle$ be the eigenbasis of the reduced state, $\\rho_A = \\sum_{i_A}\\lambda_{i_A}|u_{i_A}\\rangle\\langle u_{i_A}|$ (Eq. 2.25). The same $\\rho_A$, computed straight from the grouped form, is a matrix of overlaps between grouped vectors (Eq. 2.26). Two expressions for one matrix must agree entry by entry, so every off-diagonal overlap vanishes and the squared length of each grouped vector is $\\lambda_{i_A}$. We never orthogonalized anything by hand: the eigenbasis did it, and this one step turns the double sum into a single sum.',
        },
        {
          text: `Dividing each grouped vector by its length gives $|w_{i_A}\\rangle$ and the Schmidt decomposition $|\\psi\\rangle_{AB} = \\sum_{i_A=1}^N\\sqrt{\\lambda_{i_A}}\\,|u_{i_A}\\rangle|w_{i_A}\\rangle$ (Eq. 2.27). The Schmidt rank $N$ cannot exceed the smaller of the two dimensions. The reduced state of $B$ is $\\rho_B = \\sum\\lambda_{i_A}|w_{i_A}\\rangle\\langle w_{i_A}|$ (Eq. 2.28), so $\\rho_A$ and $\\rho_B$ have the same non-zero eigenvalues. The number of terms is the number of non-zero eigenvalues: a product state has one term, and a maximally entangled pair of [[qubit|qubits]] has two equal ones. For the running pair of Chapter Q9, whose part $A$ is the equal [[qc-mixture|mixture]] of $|0\\rangle$ and $|{+x}\\rangle$ from Lecture 8, both reduced states have eigenvalues ${d(V.q9SpecALarge, 4)} and ${d(V.q9SpecASmall, 4)}, and the Schmidt coefficients are ${d(V.q9PSchmidtLarge, 4)} and ${d(V.q9PSchmidtSmall, 4)} (<<qc-q9-schmidt|Unit 9.4>>).`,
          figure: {
            stage: { kind: 'matrix', source: { coef: PP }, labels: 'kets', values: 'exact', svd: true, shot: 'M-GRID' },
            caption: 'The coefficient matrix of the running pair, with two bars for its singular values, which are the Schmidt coefficients.',
          },
          claims: [
            claim('q9SpecALarge', 'the larger eigenvalue of the reduced state is 0.8536', () => close(V.q9SpecALarge, (2 + Math.SQRT2) / 4, 1e-9)),
            claim('q9SpecASmall', 'the smaller eigenvalue of the reduced state is 0.1464', () => close(V.q9SpecASmall, (2 - Math.SQRT2) / 4, 1e-9)),
            claim('q9PSchmidtLarge', 'the larger Schmidt coefficient is 0.9239, the root of the larger eigenvalue', () => close(V.q9PSchmidtLarge, Math.sqrt((2 + Math.SQRT2) / 4), 1e-9)),
            claim('q9PSchmidtSmall', 'the smaller Schmidt coefficient is 0.3827, the root of the smaller eigenvalue', () => close(V.q9PSchmidtSmall, Math.sqrt((2 - Math.SQRT2) / 4), 1e-9)),
          ],
        },
        {
          text: 'A remark on names: the two Schmidts are one person, Erhard Schmidt, who studied integral equations. The procedures that carry his name do opposite jobs. Gram–Schmidt takes a list of vectors without right angles and builds an orthonormal basis from it. The decomposition claims that a pair of orthonormal bases, one for each party, was already waiting to be found, and all that remains of the older procedure here is the division by a length that produced $|w_{i_A}\\rangle$ (<<qc-q9-schmidt|Unit 9.4>>).',
        },
      ],
    },
    {
      id: 'n9-purification',
      label: '§II.J.2',
      title: 'Purification',
      pages: 'pp. 45–46',
      summary: 'Giving each term of any recipe for a mixed state its own orthonormal ancilla state builds a pure state of a larger pair in which the first party is left in that mixture.',
      body: [
        {
          text: 'Start from any recipe $\\rho_A = \\sum_ip_i|\\psi_i\\rangle\\langle\\psi_i|$ for a mixed state and attach a second system, the ancilla, with one orthonormal state $|v_i\\rangle$ for every term. The entangled sum $|\\Phi\\rangle = \\sum_i\\sqrt{p_i}\\,|\\psi_i\\rangle|v_i\\rangle$ (Eq. 2.30) is then a pure state of the larger pair whose reduced state on $A$ is $\\rho_A = \\mathrm{Tr}_B|\\Phi\\rangle\\langle\\Phi|$ (Eq. 2.29). Such a $|\\Phi\\rangle$ is called a [[qc-purification|purification]] of $\\rho_A$. Every mixed state has one, because the ancilla is ours to invent and can always be made large enough (<<qc-q9-purification|Unit 9.5>>).',
        },
        {
          text: 'Why does this always work? Three requirements must hold, and the first one carries the work. Tracing out the ancilla returns $\\rho_A$, because the cross terms contain $\\mathrm{Tr}\\,|v_i\\rangle\\langle v_j|$, which is zero unless $i = j$. The state $|\\Phi\\rangle$ is [[qc-normalized|normalized]] for the same reason: orthonormal ancilla states and weights summing to one give $|\\Phi\\rangle$ unit length. Finally, a recipe has to exist to start from, and one does, since $\\rho_A$ is Hermitian and positive and its canonical form supplies the weights and the states (<<qc-q9-purification|Unit 9.5>>).',
        },
        {
          text: `The construction does not care whether the members of the recipe overlap. Take $|0\\rangle$ and $|{+x}\\rangle$ with equal weights, a non-orthogonal pair: the traced purification still equals the mixture of Lecture 8, the gap being ${d(V.q9PurNonOrthGap, 0)}. Only the ancilla must be roomy enough to hold one orthonormal state per term. How few states suffice? The canonical recipe has the fewest terms, the rank of $\\rho_A$, which is ${d(V.q9PurMinAncilla, 0)} for this mixture. A pure state has rank ${d(V.q9PurPureAncilla, 0)}, so it needs no ancilla and is its own purification (<<qc-q9-purification|Unit 9.5>>).`,
          figure: {
            stage: {
              layout: 'split',
              top: { kind: 'amplitudes', state: PP, shot: 'A-BARS' },
              bottom: { kind: 'matrix', source: { outer: [PP] }, labels: 'kets', values: 'exact', blocks: 2, partialTrace: 'B', shot: 'M-GRID' },
            },
            caption: 'A purified pair (top) and its density matrix with the ancilla traced out (bottom), which is the mixture of Lecture 8.',
          },
          claims: [
            claim('q9PurNonOrthGap', 'the traced purification of two overlapping members equals their mixture (gap 0)', () => close(V.q9PurNonOrthGap, 0, 1e-9)),
            claim('q9PurMinAncilla', 'the smallest ancilla for the mixture has 2 states', () => V.q9PurMinAncilla === 2),
            claim('q9PurPureAncilla', 'a pure state needs an ancilla of 1 state', () => V.q9PurPureAncilla === 1),
          ],
        },
        {
          text: 'Compare this with Lecture 8, where one density matrix had many ensembles related by a unitary on the list of labels. Purification realizes that unitary physically. Measuring the ancilla in different bases prepares different recipes for $A$, while $\\rho_A$ itself stays fixed, because the observer of $A$ never sees the ancilla (<<qc-q8-recipes|Unit 8.6>>).',
        },
      ],
    },
    {
      id: 'n9-unitary',
      label: '§II.J.2',
      title: 'Purifications differ by a unitary on the ancilla',
      pages: 'p. 46',
      summary: 'Two purifications of the same state on the same spaces share their weights and their basis on the first party and differ only by a unitary on the ancilla.',
      body: [
        {
          text: 'Suppose two people purify the same $\\rho_A$ on the same pair of spaces. Their Schmidt decompositions share the weights $\\sqrt{\\lambda_k}$, which come from the eigenvalues of $\\rho_A$, and the basis $|u_k\\rangle$ of $A$, which is its eigenbasis, chosen the same way in both if an eigenvalue repeats (Eqs. 2.31–2.32). Only the ancilla bases can differ, and a unitary $U_B$ connects them. Hence $|\\Phi_2\\rangle = (I_A\\otimes U_B)|\\Phi_1\\rangle$ (Eq. 2.33): the purifying pair is unique up to a relabelling of the ancilla (<<qc-q9-purification|Unit 9.5>>).',
        },
        {
          text: `Take the mixture of $|0\\rangle$ and $|{+x}\\rangle$ again and apply a Hadamard gate to the ancilla alone. The new purification overlaps the old one by ${d(V.q9PurOverlap, 1)} in size, so it is a different state, yet the reduced state of $A$ is unchanged, the gap being ${d(V.q9PurUBGap, 0)}. The freedom lives entirely on the side that an observer of $A$ cannot reach (<<qc-q9-purification|Unit 9.5>>).`,
          figure: {
            stage: {
              layout: 'split',
              top: { kind: 'amplitudes', state: PPH, shot: 'A-BARS' },
              bottom: { kind: 'matrix', source: { outer: [PPH] }, labels: 'kets', values: 'exact', blocks: 2, partialTrace: 'B', shot: 'M-GRID' },
            },
            caption: 'The pair after a Hadamard gate on the ancilla alone (top) has a new amplitude pattern but the same reduced matrix (bottom).',
          },
          claims: [
            claim('q9PurOverlap', 'the two purifications overlap by 0.5 in size', () => close(V.q9PurOverlap, 0.5, 1e-9)),
            claim('q9PurUBGap', 'a turn of the ancilla alone leaves the reduced state of A unchanged (gap 0)', () => close(V.q9PurUBGap, 0, 1e-9)),
          ],
        },
        {
          text: 'In summary, the spectrum of $\\rho_A$ fixes the weights in every purification, its eigenvectors fix the states of $A$, and only the choice of ancilla basis is left free. The common spectrum of $\\rho_A$ and $\\rho_B$ is the quantity that Lecture 10 turns into the entanglement entropy (<<qc-q9-entropy|Unit 9.3>>).',
        },
      ],
    },
  ],
})
