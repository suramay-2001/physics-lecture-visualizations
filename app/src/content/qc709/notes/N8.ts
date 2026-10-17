/**
 * Physics 709 Lecture 8 notes (N8), a full companion: sections II.H (working with the density matrix), II.I (mixed states, the thermal
 * ensemble, the |0⟩ and |+x⟩ example, the Bloch ball, Eqs. 2.14 to 2.16), II.I.1 (pure state decomposition, Eqs. 2.17 to 2.22) and II.I.2 (the
 * bipartite density matrix, Eq. 2.23), printed pages 38 to 43 of the new edition. The prose paraphrases the notes in their Formal register and
 * links the Chapter Q8 and Q9 units that teach each section. Every number is a claim under its chapter's own key (Q8 or Q9): ruling W12.
 */
import type { Lecture } from '../../schema'
import { notesLecture } from './kit'
import { V as V8, claim as c8, close, d, tf } from '../Q8.values'
import { V as V9, claim as c9 } from '../Q9.values'

export const N8: Lecture = notesLecture({
  number: 8,
  title: 'Density matrices, mixed states and the Bloch ball',
  date: '2026-09-30',
  topics: [
    'the density matrix of a pure state and its coherences',
    'the trace rule and the von Neumann equation',
    'mixed states and the thermal ensemble',
    'the Bloch ball',
    'one density matrix, many ensembles',
    'the reduced density matrix of one party',
  ],
  length: 'full',
  symbols: {
    '|\\cdot\\rangle': 'n8-density:b1',
    '|\\psi\\rangle': 'n8-density:b1',
    '|e_i\\rangle': 'n8-density:b1',
    'c_i': 'n8-density:b1',
    '\\langle\\cdot|': 'n8-density:b1',
    '\\rho': 'n8-density:b1',
    '\\rho_ij': 'n8-density:b1',
    'c_j': 'n8-density:b1',
    '\\rho_ii': 'n8-density:b1',
    '\\langle\\cdot\\rangle': 'n8-density:b2',
    'A': 'n8-density:b2',
    'i': 'n8-density:b2',
    '\\hbar': 'n8-density:b2',
    '\\dot\\rho': 'n8-density:b2',
    'H': 'n8-density:b2',
    '|\\psi_n\\rangle': 'n8-mixed:b1',
    'p_n': 'n8-mixed:b1',
    '|0\\rangle': 'n8-mixed:b2',
    '|1\\rangle': 'n8-mixed:b2',
    'E_0': 'n8-mixed:b2',
    'E_1': 'n8-mixed:b2',
    'p_0': 'n8-mixed:b2',
    'p_1': 'n8-mixed:b2',
    'S_z': 'n8-mixed:b2',
    'E_Z': 'n8-mixed:b2',
    '\\tanh': 'n8-mixed:b2',
    'k_B': 'n8-mixed:b2',
    'T': 'n8-mixed:b2',
    '|+x\\rangle': 'n8-mixed:b3',
    'S_x': 'n8-mixed:b3',
    'I': 'n8-ball:b1',
    'n': 'n8-ball:b1',
    '\\sigma': 'n8-ball:b1',
    'r': 'n8-ball:b1',
    '|u\\rangle': 'n8-ball:b2',
    'n_j': 'n8-ball:b2',
    '\\sigma_j': 'n8-ball:b2',
    '|-x\\rangle': 'n8-recipes:b1',
    '|u_+\\rangle': 'n8-recipes:b1',
    '|u_-\\rangle': 'n8-recipes:b1',
    '\\lambda_i': 'n8-recipes:b2',
    '\\theta': 'n8-recipes:b3',
    '\\rho_1': 'n8-recipes:b3',
    '\\rho_2': 'n8-recipes:b3',
    '|\\psi^\\perp\\rangle': 'n8-recipes:b3',
    '|\\psi_i\\rangle': 'n8-recipes:b4',
    '|\\phi_j\\rangle': 'n8-recipes:b4',
    'p_i': 'n8-recipes:b4',
    'U_ij': 'n8-recipes:b4',
    'q_j': 'n8-recipes:b4',
    'U': 'n8-recipes:b4',
    '|\\psi_1\\rangle': 'n8-recipes:b4',
    '|\\psi_2\\rangle': 'n8-recipes:b4',
    '|\\phi_1,2\\rangle': 'n8-recipes:b4',
    '|u_\\pm\\rangle': 'n8-recipes:b4',
    'B': 'n8-bipartite:b1',
    'i_A': 'n8-bipartite:b1',
    'i_B': 'n8-bipartite:b1',
    'S_Az': 'n8-bipartite:b1',
    '\\rho_A': 'n8-bipartite:b1',
    '|01\\rangle': 'n8-bipartite:b2',
    '|10\\rangle': 'n8-bipartite:b2',
    '\\sigma_x': 'n8-bipartite:b3',
  },
  sections: [
    {
      id: 'n8-density',
      label: '§II.H',
      title: 'Working with the density matrix',
      pages: 'p. 38',
      summary: 'The density matrix of a pure state holds the chances on its diagonal and the relative phases off it, and it gives mean values and the motion of the state.',
      body: [
        {
          text: 'Why keep a matrix when a ket already holds the state? Because the matrix shows at a glance what a ket hides in its phases. Expand a pure state in an [[qc-orthonormal-basis|orthonormal basis]] as $|\\psi\\rangle = \\sum_ic_i|e_i\\rangle$. The density operator $\\rho = |\\psi\\rangle\\langle\\psi|$ then has the elements $\\rho_{ij} = c_ic_j^*$, and its diagonal $\\rho_{ii} = |c_i|^2$ lists the chances of the basis outcomes. Everything off the diagonal, the coherences, records the [[relative-phase|relative phases]] among the components, which a classical [[qc-mixture|mixture]] cannot carry. Two states with equal diagonals agree in this basis and part ways in a suitably chosen other one (<<qc-q8-pure-rho|Unit 8.2>>).',
        },
        {
          text: 'The matrix also tells us how a state moves. The Schrödinger equation acts on the ket and on the bra of $\\rho$, and collecting both terms gives the von Neumann equation $i\\hbar\\dot\\rho = [H,\\rho]$, with the Hamiltonian $H$ and the reduced Planck constant $\\hbar$. The commutator stands in the reverse order from the Heisenberg equation of motion for an operator, so the sign flips, as it should for a quantity that stands for a state and not an observable. Mean values come out as $\\langle A\\rangle = \\mathrm{Tr}\\{A\\rho\\}$ for any observable $A$: the components of $\\langle\\psi|A|\\psi\\rangle$ regroup into the trace of a matrix product, which ignores the order of its factors. Unlike the ket form, this survives for mixed states (<<qc-q8-trace-rule|Unit 8.3>>).',
        },
      ],
    },
    {
      id: 'n8-mixed',
      label: '§II.I',
      title: 'Mixed states and the thermal ensemble',
      pages: 'pp. 38–39',
      summary: 'An ensemble of pure states with given chances has a density matrix of unit trace and purity below one, and a spin ensemble in a magnetic field has a tanh polarization.',
      body: [
        {
          text: 'Suppose we know only that an atom is in $|\\psi_n\\rangle$ with chance $p_n$, as for the atoms leaving the oven of the Stern–Gerlach experiment. The chance-weighted sum of projectors, $\\rho = \\sum_np_n|\\psi_n\\rangle\\langle\\psi_n|$, then describes the whole beam. Its trace is $\\mathrm{Tr}\\,\\rho = \\sum_np_n = 1$, and mean values still follow from $\\langle A\\rangle = \\mathrm{Tr}\\{\\rho A\\}$. For a genuine [[qc-mixture|mixture]], $\\mathrm{Tr}\\,\\rho^2 < 1$. Two kinds of uncertainty sit in $\\rho$ together: classical ignorance about which member we hold, and the quantum amplitudes inside each member (<<qc-q8-mixed|Unit 8.4>>).',
        },
        {
          text: `The notes write $|0\\rangle$ and $|1\\rangle$ for the spin-up and spin-down states along the z axis since p. 23, with energies $E_0$ and $E_1$. For chances $p_0$ and $p_1$ the mean spin is $\\langle S_z\\rangle = \\tfrac{\\hbar}{2}(p_0 - p_1)$. At temperature $T$, with the Boltzmann constant $k_B$ and the Zeeman splitting $E_Z = E_1 - E_0$ in a magnetic field, the thermal weights give $\\langle S_z\\rangle = \\tfrac{\\hbar}{2}\\tanh(E_Z/2k_BT)$. At $E_Z/k_BT = 2$ the chances of $|0\\rangle$ and $|1\\rangle$ are ${d(V8.q8ThermPUp, 4)} and ${d(V8.q8ThermPDown, 4)}, and the polarization is ${d(V8.q8ThermR, 4)} of $\\hbar/2$. At high temperature the polarization falls toward zero and the mixture approaches the maximally mixed state, while at low temperature the polarization approaches one and the mixture approaches $|0\\rangle$.`,
          claims: [
            c8('q8ThermPUp', 'at E_Z/k_BT = 2 the chance of the lower state is 0.8808', () => close(V8.q8ThermPUp, 0.8808, 1e-4)),
            c8('q8ThermPDown', 'at E_Z/k_BT = 2 the chance of the upper state is 0.1192', () => close(V8.q8ThermPDown, 0.1192, 1e-4)),
            c8('q8ThermR', 'at E_Z/k_BT = 2 the polarization is tanh 1 = 0.7616 of hbar/2', () => close(V8.q8ThermR, Math.tanh(1), 1e-9)),
          ],
        },
        {
          text: `Now mix $|0\\rangle$ and $|{+x}\\rangle$ with equal chance. The off-diagonal entries show that this mixture keeps some coherence, because $|{+x}\\rangle$ fixes a phase relation between its two components. The result is $\\rho = \\tfrac{1}{2}|0\\rangle\\langle0| + \\tfrac{1}{2}|{+x}\\rangle\\langle{+x}|$, whose matrix has the diagonal entries $${tf(V8.q8ThreeQuarter)}$ and $${tf(V8.q8Quarter)}$ and the equal off-diagonal entries $${tf(V8.q8Quarter)}$. Its purity is $\\mathrm{Tr}\\,\\rho^2 = ${tf(V8.q8ZXPur)}$, and $\\langle S_z\\rangle = \\langle S_x\\rangle = \\hbar/4$ (<<qc-q8-mixed|Unit 8.4>>).`,
          figure: {
            stage: { kind: 'matrix', source: { rho: { mixture: [{ w: 0.5, ket: { ket: '0' } }, { w: 0.5, ket: { ket: '+' } }] } }, labels: 'kets', values: 'exact', shot: 'M-GRID' },
            caption: 'The density matrix of the equal mixture of the up state and the x-up state, drawn cell by cell.',
          },
          claims: [
            c8('q8Half', 'the two members of the mixture have weight one half each', () => close(V8.q8Half, 0.5, 1e-9)),
            c8('q8ThreeQuarter', 'the first diagonal entry of the mixture is three quarters', () => close(V8.q8ThreeQuarter, 0.75, 1e-9)),
            c8('q8Quarter', 'the second diagonal entry and the off-diagonal entries are one quarter', () => close(V8.q8Quarter, 0.25, 1e-9)),
            c8('q8ZXPur', 'the purity of the mixture is three quarters', () => close(V8.q8ZXPur, 0.75, 1e-9)),
          ],
        },
      ],
    },
    {
      id: 'n8-ball',
      label: '§II.I',
      title: 'The Bloch ball',
      pages: 'p. 39',
      summary: 'Every qubit density matrix is half the identity plus a real vector dotted into the Pauli matrices, and positivity confines that vector to the unit ball.',
      body: [
        {
          text: 'Every [[qubit|qubit]] density matrix is a combination of the identity and the Pauli matrices, $\\rho = \\tfrac{1}{2}(I + n\\cdot\\sigma)$ (Eq. 2.14). Hermiticity makes the components of the Bloch vector $n$ real (Eq. 2.15); Chapter Q8 writes this vector $r$. The determinant is $\\det\\rho = (1 - |n|^2)/4$, and positivity keeps it non-negative, so $|n| \\le 1$. A negative determinant would mean a negative eigenvalue, which would be a negative chance. The states therefore fill the [[qc-bloch-ball|Bloch ball]] (<<qc-q8-ball|Unit 8.5>>).',
          claims: [c8('q8Half', 'the identity and the Bloch term enter the density matrix with weight one half', () => close(V8.q8Half, 0.5, 1e-9))],
        },
        {
          text: `Pure states are the points of the sphere and mixed states are the interior points, with the maximally mixed state at the centre. A qubit mixture sits at the chance-weighted average of the Bloch vectors of its members. On the surface $|n| = 1$, the determinant vanishes, the eigenvalues are 1 and 0, and $\\rho = |u\\rangle\\langle u|$ is pure. Conversely $n_j = \\mathrm{Tr}(\\rho\\sigma_j)$ (Eq. 2.16). The equal mixture of $|0\\rangle$ and $|{+x}\\rangle$ has a Bloch vector of length ${d(V8.q8ZXRLen, 4)}, safely inside the ball, and a determinant of $${tf(V8.q8ZXDet)}$ (<<qc-q8-ball|Unit 8.5>>).`,
          figure: {
            stage: { kind: 'bloch-ball', point: { mix: [{ of: '+z', w: 0.5 }, { of: '+x', w: 0.5 }] }, recipe: true, purity: true, shot: 'B-STD' },
            caption: 'The equal mixture sits at the middle of the chord between its two members, inside the ball.',
          },
          claims: [
            c8('q8ZXRLen', 'the Bloch vector of the equal mixture has length 0.7071', () => close(V8.q8ZXRLen, Math.SQRT1_2, 1e-9)),
            c8('q8ZXDet', 'the determinant of the equal mixture is one eighth', () => close(V8.q8ZXDet, 0.125, 1e-9)),
          ],
        },
      ],
    },
    {
      id: 'n8-recipes',
      label: '§II.I.1',
      title: 'One density matrix, many ensembles',
      pages: 'pp. 40–41',
      summary: 'One density matrix arises from many ensembles, the canonical form is the one with right-angled members, and two ensembles are related by a unitary on their labels.',
      body: [
        {
          text: `Different ensembles can have the same density matrix. The maximally mixed state is $\\tfrac{1}{2}I$ whether we mix $|0\\rangle$ and $|1\\rangle$ or $|{+x}\\rangle$ and $|{-x}\\rangle$ (Eqs. 2.17–2.18). The equal mixture of $|0\\rangle$ and $|{+x}\\rangle$ is also an ensemble of two states $|u_+\\rangle$ and $|u_-\\rangle$ with weights $(2\\pm\\sqrt2)/4$, which are ${d(V8.q8ZXEigLarge, 3)} and ${d(V8.q8ZXEigSmall, 3)} (Eqs. 2.19–2.20). Only the ensemble we imagine changes, never the matrix, so no measurement can reveal which recipe the source used (<<qc-q8-recipes|Unit 8.6>>).`,
          figure: {
            stage: {
              kind: 'bloch-ball',
              point: { mix: [{ of: { thetaDeg: 45, phiDeg: 0 }, w: V8.q8ZXEigLarge }, { of: { thetaDeg: 135, phiDeg: 180 }, w: V8.q8ZXEigSmall }] },
              recipe: true,
              purity: true,
              shot: 'B-STD',
            },
            caption: 'The same mixed state drawn as the weighted pair of states $|u_+\\rangle$ and $|u_-\\rangle$ at the ends of a diameter.',
          },
          claims: [
            c8('q8Half', 'the maximally mixed state has the matrix one half times the identity', () => close(V8.q8Half, 0.5, 1e-9)),
            c8('q8ZXEigLarge', 'the larger weight of the canonical ensemble is 0.854', () => close(V8.q8ZXEigLarge, (2 + Math.SQRT2) / 4, 1e-9)),
            c8('q8ZXEigSmall', 'the smaller weight of the canonical ensemble is 0.146', () => close(V8.q8ZXEigSmall, (2 - Math.SQRT2) / 4, 1e-9)),
          ],
        },
        {
          text: `Which recipe could a measurement actually resolve? Only one whose members are mutually [[orthogonal|orthogonal]], since a single measurement then separates them without error. That is the eigen-decomposition $\\rho = \\sum_i\\lambda_i|e_i\\rangle\\langle e_i|$ with $\\lambda_i \\ge 0$ and $\\sum_i\\lambda_i = 1$ (Eq. 2.21): Hermiticity supplies orthonormal eigenvectors, positivity makes each eigenvalue non-negative, and unit trace makes them add up to one. The $\\lambda_i$ are honest probabilities of distinguishable alternatives, which is why entropy is built from them. Distinct eigenvalues fix the recipe, while $\\tfrac{1}{2}I$ is diagonal in every orthonormal basis. The pair $|u_+\\rangle$, $|u_-\\rangle$ is canonical, being the eigenvectors of its $\\rho$, but $|0\\rangle$ with $|{+x}\\rangle$ is not, since their overlap has size ${d(V8.q8CanonOverlap, 4)}. Lecture 9 meets these eigenvalues again as squared Schmidt coefficients (<<qc-q8-recipes|Unit 8.6>>).`,
          claims: [c8('q8CanonOverlap', 'the overlap of the up state and the x-up state has size 0.7071', () => close(V8.q8CanonOverlap, Math.SQRT1_2, 1e-9))],
        },
        {
          text: 'No genuine blend of other states produces a pure state, which makes it an extreme point of the set of density matrices. To see this, try to split $|\\psi\\rangle\\langle\\psi| = \\theta\\rho_1 + (1-\\theta)\\rho_2$ with $0 < \\theta < 1$, and probe both sides with any $|\\psi^\\perp\\rangle$ at right angles to $|\\psi\\rangle$. The left side gives zero. The right side is a sum of two non-negative terms, so each must be zero. Hence $\\rho_1$ and $\\rho_2$ have no weight outside $|\\psi\\rangle$, and unit trace forces both to equal $|\\psi\\rangle\\langle\\psi|$. A mixed state has many recipes, a pure state only the trivial one (<<qc-q8-recipes|Unit 8.6>>).',
        },
        {
          text: `When do two lists of pure states with weights, $p_i$ with $|\\psi_i\\rangle$ in one and $q_j$ with $|\\phi_j\\rangle$ in the other, give the same $\\rho$? Exactly when $\\sqrt{p_i}\\,|\\psi_i\\rangle = \\sum_jU_{ij}\\sqrt{q_j}\\,|\\phi_j\\rangle$ for a unitary matrix $U$ (Eq. 2.22), with the shorter list padded by zero vectors. Our example has $|\\psi_1\\rangle = |0\\rangle$, $|\\psi_2\\rangle = |{+x}\\rangle$ and $|\\phi_{1,2}\\rangle = |u_\\pm\\rangle$, so no padding is needed, and $U$ is the Hadamard matrix with entries of size ${d(V8.q8R2, 4)}. That is no accident, because the $|u_\\pm\\rangle$ are eigenvectors of the Hadamard gate. This $U$ does not rotate the qubit. It mixes the entries of the two ensemble lists and merely happens to equal a familiar gate (<<qc-q8-recipes|Unit 8.6>>).`,
          claims: [c8('q8R2', 'the Hadamard matrix has entries of size 0.7071', () => close(V8.q8R2, Math.SQRT1_2, 1e-9))],
        },
      ],
    },
    {
      id: 'n8-bipartite',
      label: '§II.I.2',
      title: 'The bipartite density matrix',
      pages: 'pp. 42–43',
      summary: 'Tracing out one party leaves a reduced density matrix for the other, and the singlet and its classical twin share the same reduced state.',
      body: [
        {
          text: 'What can party $A$ learn without help from $B$? Label the basis states of the two parties $i_A$ and $i_B$; before p. 42 the notes spoke of particles 1 and 2 instead. For a pair in the state $\\rho$, the mean of $S_{Az}$, the spin of $A$ along the z axis, comes out as $\\langle S_{Az}\\rangle = \\mathrm{Tr}\\{\\rho_AS_{Az}\\}$ once the sum over $i_B$ is carried out first. The matrix $\\rho_A = \\mathrm{Tr}_B\\rho$ is the reduced density operator, the full $\\rho$ traced over the states of $B$. The same holds for every observable of $A$ alone, so $\\rho_A$ holds all that $A$ can find out by itself (<<qc-q9-partial-trace|Unit 9.1>>).',
        },
        {
          text: `The singlet $(|01\\rangle - |10\\rangle)/\\sqrt2$ is a definite pure state of the pair, yet tracing out $B$ leaves $\\rho_A = \\tfrac{1}{2}I$, with diagonal entries ${d(V9.q9SingRA00, 1)}. Seen alone, $A$ is completely [[unpolarized|unpolarized]]. A part can thus be less certain than the whole it belongs to. A classical twin, an equal mixture of $|01\\rangle$ and $|10\\rangle$, gives exactly the same $\\rho_A$ (<<qc-q9-same-part|Unit 9.2>>).`,
          figure: {
            stage: {
              layout: 'split',
              top: { kind: 'matrix', source: { rho: { ket: { bell: 'Psi-' } } }, labels: 'kets', values: 'exact', blocks: 2, partialTrace: 'B', shot: 'M-GRID' },
              bottom: { kind: 'two-qubit', source: { rho: { mixture: [{ w: 0.5, ket: { ket: '01' } }, { w: 0.5, ket: { ket: '10' } }] } }, labels: 'A-B', arrows: 'reduced', grid: 'T', shot: 'TQ-PAIR' },
            },
            caption: 'The singlet density matrix with $B$ traced out (top), and its classical twin, which has the same reduced arrows (bottom).',
          },
          claims: [c9('q9SingRA00', 'the singlet has the reduced state one half times the identity, diagonal entries 0.5', () => close(V9.q9SingRA00, 0.5, 1e-9))],
        },
        {
          text: 'To tell the singlet of the figure from its twin we must compare the two particles. The mean of $\\sigma_x\\sigma_x$, the product of their spin readings along x, is $-1$ for the singlet and 0 for the twin, and only a joint measurement shows it. No measurement on $A$ alone separates an entangled pure state from a classical coin. This is what Bell’s argument will use: the twin stands for the story in which a coin fixed both readings in advance. The general bipartite state (Eq. 2.23) is a sum of products of a matrix unit on $A$ with a matrix unit on $B$ (<<qc-q9-same-part|Unit 9.2>>).',
          claims: [
            c9('q9SingXX', 'the singlet has the correlation -1 in the x basis', () => close(V9.q9SingXX, -1, 1e-9)),
            c9('q9CoinXX', 'the classical twin has the correlation 0 in the x basis', () => close(V9.q9CoinXX, 0, 1e-9)),
          ],
        },
      ],
    },
  ],
})
