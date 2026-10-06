/**
 * Chapter Q9 glossary (Physics 709; P-Q9-story §5), merged into the lazy course pack by file name (pack.ts). Every
 * entry has a Ground-up sentence (`gloss`, <= 25 words) and a Formal one (`formal`, <= 40), paraphrased. Ids start
 * `qc-` (the "gloss at first use" lint, content/symbols.test.ts). `introduces` marks the notation/space beats
 * (interface change W-709 #12): each such entry is introduced by exactly one beat of this chapter (content.test.tsx).
 *
 * Reused without a new entry here: qc-density-matrix, qc-trace, qc-coherence, qc-purity, qc-pure-state,
 * qc-mixed-state, qc-ensemble, qc-bloch-ball, qc-maximally-mixed, qc-unitary-freedom (Q8); qc-ghz (Q7);
 * qc-singlet, qc-beta-xy, qc-correlation-grid, qc-entangled, qc-factoring-test (Q6); qc-tensor-operator (Q4);
 * qc-hilbert-space (Q1).
 */
import type { GlossEntry } from '../schema'

export const GLOSSARY: GlossEntry[] = [
  {
    id: 'qc-reduced-density-matrix',
    term: 'reduced density matrix',
    gloss: 'The state of one part of a pair, found by adding over the other part.',
    formal: '$\\rho_A = \\mathrm{Tr}_B\\,\\rho$; $\\langle O\\otimes I\\rangle = \\mathrm{Tr}(\\rho_AO)$ (the notes write $\\rho(1)$).',
    first: 'q9-partial-trace:b1',
    introduces: 'notation',
  },
  {
    id: 'qc-partial-trace',
    term: 'partial trace',
    gloss: "Adding over one part's basis states to leave a matrix for the other part.",
    formal: '$\\mathrm{Tr}_B\\,\\rho = \\sum_b\\langle b|_B\\rho|b\\rangle_B$; $\\mathrm{Tr}_B(X\\otimes Y) = X\\,\\mathrm{Tr}\\,Y$.',
    first: 'q9-partial-trace:b1',
    introduces: 'notation',
  },
  {
    id: 'qc-von-neumann-entropy',
    term: 'von Neumann entropy',
    gloss: 'The bits left unknown in a state: 0 if pure, 1 for a fair coin.',
    formal: '$S(\\rho) = -\\mathrm{Tr}(\\rho\\log_2\\rho) = -\\sum\\lambda_i\\log_2\\lambda_i$, $0 \\le S \\le \\log_2d$.',
    first: 'q9-entropy:b1',
    introduces: 'notation',
  },
  {
    id: 'qc-entanglement-entropy',
    term: 'entanglement entropy',
    gloss: 'How entangled a pure pair is: the entropy of either half.',
    formal: '$E(\\psi_{AB}) = S(\\rho_A) = S(\\rho_B)$, the entropy of either half of a pure pair.',
    first: 'q9-entropy:b4',
    introduces: 'notation',
  },
  {
    id: 'qc-schmidt-decomposition',
    term: 'Schmidt form',
    gloss: 'A pure pair written with one term per shared chance, each term a product of orthonormal partners.',
    formal: '$|\\psi\\rangle = \\sum_k\\sqrt{\\lambda_k}|u_k\\rangle_A|w_k\\rangle_B$, $\\lambda_k$ the nonzero eigenvalues of $\\rho_A$ and $\\rho_B$.',
    first: 'q9-schmidt:b2',
    introduces: 'notation',
  },
  {
    id: 'qc-schmidt-rank',
    term: 'Schmidt rank',
    gloss: 'The number of terms in the Schmidt form: 1 exactly for a product.',
    formal: '$N = \\mathrm{rank}\\,C \\le \\min(\\dim\\mathcal H_A, \\dim\\mathcal H_B)$.',
    first: 'q9-schmidt:b3',
  },
  {
    id: 'qc-singular-values',
    term: 'singular values',
    gloss: "The stretch factors of a matrix; for a pair's amplitude grid, the Schmidt coefficients.",
    formal: '$C = U\\,\\mathrm{diag}(s_k)\\,V^\\dagger$, $s_k \\ge 0$, $s_k^2$ the eigenvalues of $CC^\\dagger$.',
    first: 'q9-schmidt:b5',
  },
  {
    id: 'qc-purification',
    term: 'purification',
    gloss: 'A pure pair whose part is a given mixed state.',
    formal: '$|\\Psi\\rangle_{AB}$ with $\\mathrm{Tr}_B|\\Psi\\rangle\\langle\\Psi| = \\rho_A$, e.g. $\\sum_i\\sqrt{p_i}|\\psi_i\\rangle|i\\rangle$; unique up to $I\\otimes U_B$.',
    first: 'q9-purification:b1',
    introduces: 'notation',
  },
  {
    id: 'qc-trace-norm',
    term: 'trace norm',
    gloss: "The sum of a matrix's singular values; for a Hermitian matrix, of its eigenvalues' sizes.",
    formal: '$\\|A\\|_1 = \\mathrm{Tr}\\sqrt{A^\\dagger A}$.',
    first: 'q9-distance:b1',
    introduces: 'notation',
  },
  {
    id: 'qc-trace-distance',
    term: 'trace distance',
    gloss: 'How far apart two states are: the largest gap one yes-or-no reading can open between their chances.',
    formal: '$D(\\rho, \\sigma) = \\tfrac12\\|\\rho - \\sigma\\|_1 = \\max_\\Pi\\mathrm{Tr}\\,\\Pi(\\rho - \\sigma)$; qubits $\\tfrac12\\|\\mathbf r - \\mathbf s\\|$.',
    first: 'q9-distance:b1',
    introduces: 'notation',
  },
  {
    id: 'qc-fidelity',
    term: 'fidelity',
    gloss: 'How much two states overlap: 1 if equal, 0 if orthogonal.',
    formal: '$F(\\rho, \\sigma) = \\mathrm{Tr}\\sqrt{\\rho^{1/2}\\sigma\\rho^{1/2}}$; pure: $|\\langle\\psi|\\varphi\\rangle|$ (root fidelity).',
    first: 'q9-distance:b3',
    introduces: 'notation',
  },
]
