/**
 * Chapter Q12 glossary (Physics 709; P-Q12-story §5), merged into the lazy course pack by file name (pack.ts). Every
 * entry has a Ground-up sentence (`gloss`, ≤ 25 words) and a Formal one (`formal`, ≤ 40), paraphrased. Ids start
 * `qc-` (the "gloss at first use" lint, content/symbols.test.ts). `introduces` marks the two notation beats
 * (interface change W-709 #12, plan §5's table): `qc-partial-transpose` and `qc-concurrence`.
 *
 * Reused without a new entry here: qc-separable, qc-chsh, qc-no-signalling (Q10, not yet built — link-backs are
 * plain prose, as Q9's forward references to Q10 already are); qc-entanglement-entropy, qc-partial-trace,
 * qc-schmidt-decomposition, qc-trace-distance (Q9); qc-density-matrix, qc-positive-operator, qc-bloch-ball (Q8);
 * qc-ghz (Q7); qc-bell-basis, qc-coefficient-matrix (Q6/Q4); qc-unitary (Q2).
 *
 * `qc-negativity`'s bridge to Q9's trace norm is dropped: `GlossEntry.bridge` (content/qc709/bridges.ts) targets
 * Spin Lab (448) units only, never another 709 chapter; the link-back to Q9 is plain prose instead.
 */
import type { GlossEntry } from '../schema'

export const GLOSSARY: GlossEntry[] = [
  {
    id: 'qc-partial-transpose',
    term: 'partial transpose',
    gloss: 'Transposing only one party’s half of a density matrix; a separable state stays a valid state, an entangled one need not.',
    formal: '$(\\rho^{T_B})_{m\\mu,n\\nu} = \\rho_{m\\nu,n\\mu}$; its eigenvalues are basis-independent.',
    first: 'q12-ppt:b2',
    introduces: 'notation',
  },
  {
    id: 'qc-ppt-criterion',
    term: 'PPT criterion',
    gloss: 'The test: a negative eigenvalue after the one-sided transpose proves entanglement; for two qubits it is exact.',
    formal: '$\\rho^{T_B}\\ge 0$ for separable $\\rho$; for $2\\otimes2$, $2\\otimes3$ also sufficient (Peres–Horodecki).',
    first: 'q12-ppt:b3',
  },
  {
    id: 'qc-entanglement-witness',
    term: 'entanglement witness',
    gloss: 'One Hermitian observable whose average is never negative on a separable state, but is on some entangled one.',
    formal: '$W = W^\\dagger$, $\\mathrm{Tr}(\\rho_sW)\\ge 0$ for all separable $\\rho_s$, $\\mathrm{Tr}(\\rho_eW) < 0$ for some $\\rho_e$.',
    first: 'q12-witness:b1',
    bridge: 'qc-l4-projectors',
  },
  {
    id: 'qc-locc',
    term: 'LOCC',
    gloss: 'Local gates, local measurements and a classical phone line — everything two distant labs can do without mailing qubits.',
    formal: 'Append / unitary / measure / discard locally, plus classical communication; cannot create entanglement.',
    first: 'q12-locc:b1',
  },
  {
    id: 'qc-entanglement-of-formation',
    term: 'entanglement of formation',
    gloss: 'For a mixed pair, the smallest average entanglement over all ways to write it as a mixture of pure states.',
    formal: '$E_F(\\rho) = \\inf\\sum_kp_kE(|\\psi^{(k)}\\rangle)$, over pure-state decompositions.',
    first: 'q12-entropy:b4',
  },
  {
    id: 'qc-concurrence',
    term: 'concurrence',
    gloss: 'How much a two-qubit state overlaps its own spin-flip; a single number from 0 (product) to 1 (Bell).',
    formal: '$C(|\\psi\\rangle) = |\\langle\\psi|\\tilde\\psi\\rangle|$, $|\\tilde\\psi\\rangle = (\\sigma_y\\otimes\\sigma_y)|\\psi^*\\rangle$; $C(\\rho) = \\max(0, \\lambda_1 - \\lambda_2 - \\lambda_3 - \\lambda_4)$.',
    first: 'q12-concurrence:b1',
    introduces: 'notation',
  },
  {
    id: 'qc-negativity',
    term: 'negativity',
    gloss: 'The total size of the negative eigenvalues left by the partial transpose: another entanglement measure.',
    formal: '$N(\\rho) = \\sum_j|\\lambda_j^-| = \\tfrac12(\\|\\rho^{T_B}\\|_1 - 1)$.',
    first: 'q12-concurrence:b4',
  },
  {
    id: 'qc-w-state',
    term: 'W state',
    gloss: 'The three-qubit state with exactly one excitation spread evenly; keeps pairwise entanglement when one qubit is lost.',
    formal: '$|W\\rangle = (|100\\rangle + |010\\rangle + |001\\rangle)/\\sqrt3$.',
    first: 'q12-multipartite:b1',
  },
  {
    id: 'qc-monogamy',
    term: 'monogamy',
    gloss: 'Entanglement cannot be freely shared: a qubit strongly entangled with one partner is only weakly entangled with others.',
    formal: 'CKW: $C_{A:B}^2 + C_{A:C}^2\\le C_{A:BC}^2$.',
    first: 'q12-multipartite:b3',
  },
  {
    id: 'qc-sloc',
    term: 'SLOCC',
    gloss: 'Local operations and a phone call, allowed to succeed only sometimes; it sorts three-qubit states into GHZ- and W-classes.',
    formal: '$|\\psi\\rangle\\to|\\varphi\\rangle$ by SLOCC iff $|\\varphi\\rangle = A\\otimes B\\otimes C|\\psi\\rangle$, local operators invertible.',
    first: 'q12-multipartite:b4',
  },
  {
    id: 'qc-bound-entanglement',
    term: 'bound entanglement',
    gloss: 'Entangled states from which no Bell pair can ever be distilled; they have a positive partial transpose.',
    formal: 'PPT entangled states; distillable entanglement 0, $E_F > 0$ (Bergou §3.7.7).',
    first: 'q12-multipartite:b4',
  },
]
