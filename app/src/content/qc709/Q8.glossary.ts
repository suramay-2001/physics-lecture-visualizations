/**
 * Chapter Q8 glossary (Physics 709; P-Q8-story §5), merged into the lazy course pack by file name (pack.ts). Every
 * entry has a Ground-up sentence (`gloss`, ≤ 25 words) and a Formal one (`formal`, ≤ 40), paraphrased. Ids start
 * `qc-` (the "gloss at first use" lint, content/symbols.test.ts). `introduces` marks the notation/space beats
 * (interface change W-709 #12): each such entry is introduced by exactly one beat of this chapter (content.test.tsx).
 *
 * Reused without a new entry here: qc-mixture (Q1), qc-outer-product, qc-kronecker-delta, qc-hadamard, qc-unitary
 * (Q2), qc-projector, qc-bloch-sphere, qc-pauli-matrices, qc-expectation, qc-eigenvalue, qc-commutator,
 * qc-anticommutator, qc-spectral-representation, qc-selective-measurement (Q3), qc-tensor-operator (Q4),
 * qc-pauli-string, qc-correlation-grid (Q6), qc-ghz (Q7).
 */
import type { GlossEntry } from '../schema'

export const GLOSSARY: GlossEntry[] = [
  {
    id: 'qc-pure-state',
    term: 'pure state',
    gloss: 'A state that one ket describes completely.',
    formal: 'A state with $\\rho = |\\psi\\rangle\\langle\\psi|$; equivalently $\\rho^2 = \\rho$, $\\mathrm{Tr}\\,\\rho^2 = 1$.',
    first: 'q8-why:b4',
  },
  {
    id: 'qc-density-matrix',
    term: 'density matrix',
    gloss: 'A state written as a table: $|\\psi\\rangle\\langle\\psi|$ for one state, a chance-weighted sum for a mixture.',
    formal: 'A density operator $\\rho = \\sum_np_n|\\psi_n\\rangle\\langle\\psi_n|$: $\\rho \\ge 0$, $\\mathrm{Tr}\\,\\rho = 1$.',
    first: 'q8-pure-rho:b1',
    introduces: 'notation',
    bridge: 'qc-l6-mixture',
  },
  {
    id: 'qc-trace',
    term: 'trace',
    gloss: 'The sum of a square matrix’s diagonal entries, written Tr.',
    formal: 'The trace $\\mathrm{Tr}\\,A = \\sum_i\\langle e_i|A|e_i\\rangle$, the same in every orthonormal basis; $\\mathrm{Tr}(AB) = \\mathrm{Tr}(BA)$.',
    first: 'q8-pure-rho:b3',
    introduces: 'notation',
  },
  {
    id: 'qc-coherence',
    term: 'coherence',
    gloss: 'An off-diagonal entry of ρ: it carries a relative phase, and a coin mixture of basis states has none.',
    formal: 'An off-diagonal entry $\\rho_{ij}$, $i \\ne j$, with $\\rho_{ji} = \\rho_{ij}^*$.',
    first: 'q8-pure-rho:b4',
    introduces: 'notation',
  },
  {
    id: 'qc-von-neumann-equation',
    term: 'von Neumann equation',
    gloss: 'The rule that moves ρ in time; the dot means a rate of change and Ĥ is the energy operator.',
    formal: 'The equation of motion $i\\hbar\\dot\\rho = [\\hat H, \\rho]$, from $i\\hbar|\\dot\\psi\\rangle = \\hat H|\\psi\\rangle$; its sign is opposite to Heisenberg’s.',
    first: 'q8-trace-rule:b2',
    introduces: 'notation',
  },
  {
    id: 'qc-ensemble',
    term: 'ensemble',
    gloss: 'A collection of states with chances; its ρ weights each state’s matrix by its chance.',
    formal: 'A collection $\\{p_n, |\\psi_n\\rangle\\}$ with $\\rho = \\sum_np_n|\\psi_n\\rangle\\langle\\psi_n|$; many ensembles can share one ρ.',
    first: 'q8-mixed:b1',
    introduces: 'notation',
    bridge: 'qc-l1-average',
  },
  {
    id: 'qc-purity',
    term: 'purity',
    gloss: 'A number, $\\mathrm{Tr}\\,\\rho^2$: 1 for a pure state and less for a mixture; at least ½ for a qubit.',
    formal: 'The purity $\\mathrm{Tr}\\,\\rho^2 = \\sum_k\\lambda_k^2$: 1 iff pure; $\\tfrac12(1 + |\\mathbf r|^2)$ for a qubit.',
    first: 'q8-mixed:b2',
    introduces: 'notation',
  },
  {
    id: 'qc-mixed-state',
    term: 'mixed state',
    gloss: 'A state that no single ket describes: a mixture, with purity below 1.',
    formal: 'A state with $\\rho^2 \\ne \\rho$, $\\mathrm{Tr}\\,\\rho^2 < 1$.',
    first: 'q8-mixed:b2',
  },
  {
    id: 'qc-bloch-ball',
    term: 'Bloch ball',
    gloss: 'The solid ball of one-qubit states: pure on the surface, mixed inside, ½I at the centre.',
    formal: 'The set $\\rho = \\tfrac12(I + \\mathbf r\\cdot\\boldsymbol\\sigma)$, $|\\mathbf r| \\le 1$, $r_j = \\mathrm{Tr}(\\rho\\sigma_j)$ (the notes and Bergou write $\\mathbf n$; we keep $\\mathbf r$).',
    first: 'q8-mixed:b3',
    introduces: 'space',
    bridge: 'qc-l6-bloch',
  },
  {
    id: 'qc-thermal-state',
    term: 'thermal state',
    gloss: 'The mixture a warm source makes in a field: lower energies are more likely.',
    formal: 'The Gibbs state $\\rho = e^{-\\hat H/k_BT}/\\mathrm{Tr}\\,e^{-\\hat H/k_BT}$; for a spin, $\\langle S_z\\rangle = \\tfrac\\hbar2\\tanh(E_Z/2k_BT)$.',
    first: 'q8-mixed:b5',
  },
  {
    id: 'qc-maximally-mixed',
    term: 'maximally mixed state',
    gloss: 'The centre of the ball: every reading there is a fair coin.',
    formal: 'The state $\\tfrac12I$ for a qubit, $I/d$ in dimension d.',
    first: 'q8-mixed:b7',
  },
  {
    id: 'qc-positive-operator',
    term: 'positive operator',
    gloss: 'A Hermitian matrix with no negative eigenvalue; for ρ the eigenvalues act as chances.',
    formal: 'An operator with $A \\ge 0$: $\\langle\\varphi|A|\\varphi\\rangle \\ge 0$ for every $\\varphi$, equivalently every eigenvalue is non-negative.',
    first: 'q8-ball:b2',
    introduces: 'notation',
  },
  {
    id: 'qc-convex-set',
    term: 'convex set',
    gloss: 'A set that contains the straight segment between any two of its points, like the ball of states.',
    formal: 'A set $\\mathcal D$ with $t\\rho_1 + (1 - t)\\rho_2 \\in \\mathcal D$ for every $0 \\le t \\le 1$ and $\\rho_1, \\rho_2 \\in \\mathcal D$; its extreme points are the pure states.',
    first: 'q8-recipes:b3',
    introduces: 'space',
  },
  {
    id: 'qc-unitary-freedom',
    term: 'unitary freedom',
    gloss: 'Two recipes give the same ρ exactly when their chance-weighted kets are linked by a unitary table.',
    formal: 'The relation $\\sqrt{p_i}|\\psi_i\\rangle = \\sum_jU_{ij}\\sqrt{q_j}|\\varphi_j\\rangle$ for a unitary U, the shorter list padded with zero vectors (Bergou; N&C Theorem 2.6).',
    first: 'q8-recipes:b4',
  },
]
