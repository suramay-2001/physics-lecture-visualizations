/**
 * Chapter Q19 glossary (Physics 709; P-Q19-story §5), merged into the lazy course pack by file name (pack.ts). Every entry has a Ground-up sentence (`gloss`, ≤ 25 words)
 * and a Formal one (`formal`, ≤ 40), paraphrased. Ids start `qc-`. `introduces` marks the two notation beats: the edge state |v₁, v₂⟩ (q19-scatter:b1) and the cost
 * Hamiltonian H_C (q19-qaoa:b2), each introduced by exactly one beat of this chapter (content.test.tsx).
 *
 * Reused without a new entry here: qc-inversion-about-mean and qc-grover-iterate (Q17), qc-swap-gate (Q4), qc-commutator (Q3), qc-orthogonal and qc-orthonormal-basis,
 * qc-superposition, and the Spin Lab glosses eigenvalue, qubit and relative-phase.
 */
import type { GlossEntry } from '../schema'

export const GLOSSARY: GlossEntry[] = [
  {
    id: 'qc-random-walk',
    term: 'random walk',
    gloss: 'A walker that flips a coin and steps left or right each time.',
    formal: 'The position after $n$ independent $\\pm1$ steps, with spread $\\sqrt n$ (Bergou p. 130).',
    first: 'q19-random-walk:b1',
    bridge: 'qc-f5-probability',
  },
  {
    id: 'qc-graph',
    term: 'graph',
    gloss: 'Dots, called vertices, joined by lines, called edges.',
    formal: 'A vertex set $V$ together with a set $E$ of unordered pairs of vertices, the edges.',
    first: 'q19-random-walk:b3',
  },
  {
    id: 'qc-edge-state',
    term: 'edge state $|v_1, v_2\\rangle$',
    gloss: 'The state of a walker on an edge, moving from one end to the other.',
    formal: '$|v_1, v_2\\rangle$ is on the edge $\\{v_1, v_2\\}$ moving from $v_1$ to $v_2$; the $2E$ edge states of a graph are orthonormal.',
    first: 'q19-scatter:b1',
    introduces: 'notation',
  },
  {
    id: 'qc-scattering-walk',
    term: 'scattering walk',
    gloss: 'A quantum walk whose walker lives on edges and bounces or passes on at every vertex.',
    formal: 'A walk on edge states advanced by $U = \\prod_vU_v$, each $U_v$ a local unitary at the vertex $v$ (Bergou p. 131).',
    first: 'q19-scatter:b1',
  },
  {
    id: 'qc-star-graph',
    term: 'star graph',
    gloss: 'A centre joined to $N$ outer dots by $N$ lines, the spokes.',
    formal: 'A centre vertex 0 joined to the outer vertices $1, \\ldots, N$ by $N$ edges (Bergou Fig. 7.7).',
    first: 'q19-scatter:b1',
  },
  {
    id: 'qc-invariant-subspace',
    term: 'invariant subspace',
    gloss: 'A set of states that one step of the walk never leaves.',
    formal: 'A subspace $S$ with $US \\subseteq S$: four-dimensional for the marked-spoke search, five-dimensional for the extra-edge search.',
    first: 'q19-star-search:b2',
    bridge: 'qc-f4-unitary',
  },
  {
    id: 'qc-quantum-simulation',
    term: 'quantum simulation',
    gloss: 'Using a quantum computer to imitate how another quantum system changes in time.',
    formal: 'Implementing $U(t) = e^{-itH}$ for a many-body $H$ by a circuit of few-qubit gates (Bergou §7.7, p. 140).',
    first: 'q19-simulation:b1',
    bridge: 'qc-l11-schrodinger',
  },
  {
    id: 'qc-heisenberg-chain',
    term: 'Heisenberg chain',
    gloss: 'A row of spins, each coupled to its neighbours by the term $-J\\,\\mathbf S\\cdot\\mathbf S$.',
    formal: '$H = -J\\sum_n\\mathbf S_n\\cdot\\mathbf S_{n+1}$ (Bergou eq. 7.80); $J > 0$ favours parallel neighbours.',
    first: 'q19-simulation:b1',
  },
  {
    id: 'qc-trotter-formula',
    term: 'Trotter’s formula',
    gloss: 'Alternate short pieces of each term to imitate the whole evolution.',
    formal: '$e^{i(A+B)\\Delta t} = e^{iA\\Delta t}e^{iB\\Delta t} + O(\\Delta t^2)$ (Bergou eq. 7.81; N&C eq. 4.103, p. 208; limit form p. 207); the symmetric split is correct to $O(\\Delta t^3)$.',
    first: 'q19-simulation:b3',
  },
  {
    id: 'qc-maxcut',
    term: 'MaxCut',
    gloss: 'Split a graph’s dots into two teams so that as many lines as possible join different teams.',
    formal: 'Choose $x \\in \\{0,1\\}^V$ to maximise the number of edges $\\{j,k\\}$ with $x_j \\ne x_k$.',
    first: 'q19-qaoa:b1',
  },
  {
    id: 'qc-cost-hamiltonian',
    term: 'cost $H_C$',
    gloss: 'A diagonal operator that gives each string its score, here the number of cut sides.',
    formal: '$H_C = \\sum_{jk\\in E}\\tfrac12(1 - \\sigma^z_j\\sigma^z_k)$ with $H_C|x\\rangle = \\mathrm{cut}(x)|x\\rangle$ (Bergou eq. 7.83).',
    first: 'q19-qaoa:b2',
    introduces: 'notation',
  },
  {
    id: 'qc-qaoa',
    term: 'QAOA',
    gloss: 'A circuit with two knobs, $\\gamma$ and $\\beta$, which a classical computer tunes to give a good cut.',
    formal: '$|\\gamma,\\beta\\rangle = e^{-i\\beta H_B}e^{-i\\gamma H_C}|\\psi_{\\mathrm{in}}\\rangle$, with the angles tuned to maximise $\\langle H_C\\rangle$ (Bergou eqs. 7.84–7.86).',
    first: 'q19-qaoa:b3',
  },
  {
    id: 'qc-hybrid-algorithm',
    term: 'hybrid algorithm',
    gloss: 'A method where a quantum computer runs a circuit and a classical computer tunes it.',
    formal: 'A quantum–classical loop in which a classical optimiser sets the circuit’s parameters from the readings it returns (Bergou pp. 141–142).',
    first: 'q19-qaoa:b5',
  },
]
