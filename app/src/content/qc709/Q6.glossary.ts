/**
 * Chapter Q6 glossary (Physics 709; P-Q6-story §5), merged into the lazy course pack by file name (pack.ts). Every
 * entry has a Ground-up sentence (`gloss`, ≤ 25 words) and a Formal one (`formal`, ≤ 40), paraphrased. Ids start
 * `qc-` (the "gloss at first use" lint, content/symbols.test.ts). `introduces` marks the notation/space beats
 * (interface change W-709 #12): each such entry is introduced by exactly one beat of this chapter (content.test.tsx).
 *
 * Reused without a new entry here (already glossed by Q3/Q4): qc-tensor-product, qc-register, qc-cnot,
 * qc-controlled-gate, qc-bell-state, qc-circuit, qc-xor, qc-projector, qc-pauli-matrices, qc-expectation,
 * qc-commutator, qc-anticommutator, qc-compatible, qc-simultaneous-eigenvector, qc-degenerate, qc-dispersion.
 */
import type { GlossEntry } from '../schema'

export const GLOSSARY: GlossEntry[] = [
  {
    id: 'qc-composite-space',
    term: 'joint space',
    gloss: 'The space of two systems together. Its dimension is the product of theirs, and its amplitudes fill a grid.',
    formal: 'The joint space $V^{(1)}\\otimes V^{(2)}$, spanned by $|i_1\\rangle\\otimes|i_2\\rangle$, has dimension $d_1d_2$.',
    first: 'q6-many:b1',
    introduces: 'space',
  },
  {
    id: 'qc-product-state',
    term: 'product state',
    gloss: 'A state of a pair in which each part has a state of its own.',
    formal: 'A state $|\\Psi\\rangle = |\\psi_1\\rangle\\otimes|\\psi_2\\rangle$ (the notes: separable, in the pure case).',
    first: 'q6-many:b3',
  },
  {
    id: 'qc-operator-tensor',
    term: 'tensor product of operators',
    gloss: 'One operator per part, each acting on its own part only.',
    formal: '$(A\\otimes B)(u\\otimes v) = Au\\otimes Bv$; as a matrix, $A\\otimes B = [A_{ij}B]$, and $A_1 \\equiv A\\otimes I$.',
    first: 'q6-tensor:b1',
    introduces: 'notation',
  },
  {
    id: 'qc-parity',
    term: 'parity',
    gloss: 'Whether two bits agree (+1) or differ (−1).',
    formal: '$Z\\otimes Z\\,|ab\\rangle = (-1)^{a\\oplus b}|ab\\rangle$; $X\\otimes X$ gives the same in the ± basis.',
    first: 'q6-tensor:b3',
  },
  {
    id: 'qc-pauli-string',
    term: 'Pauli string',
    gloss: 'One Pauli letter per qubit, left to right: $XZ$ means X on qubit 1 and Z on qubit 2.',
    formal: 'A Pauli string $P_1P_2\\cdots P_n \\equiv P_1\\otimes P_2\\otimes\\cdots\\otimes P_n$, each $P_k \\in \\{I, X, Y, Z\\}$.',
    first: 'q6-tensor:b3',
    introduces: 'notation',
  },
  {
    id: 'qc-correlation-grid',
    term: 'correlation grid',
    gloss: 'The 3 × 3 table of averages of a reading on qubit 1 times a reading on qubit 2.',
    formal: 'The grid $T_{ij} = \\langle\\sigma_i\\otimes\\sigma_j\\rangle$, beside the reduced vectors $r_A$, $r_B$; $T = r_Ar_B^{\\mathsf T}$ for a product state.',
    first: 'q6-tensor:b5',
    introduces: 'notation',
  },
  {
    id: 'qc-entangled',
    term: 'entangled state',
    gloss: 'A state of a pair that is not a product: neither part has a state of its own.',
    formal: 'A state with $|\\Psi\\rangle \\ne |\\psi_1\\rangle\\otimes|\\psi_2\\rangle$ for any $\\psi_1$, $\\psi_2$ (pure case; Chapter Q10 widens this to mixtures).',
    first: 'q6-entangled:b2',
  },
  {
    id: 'qc-factoring-test',
    term: 'product test',
    gloss: 'Two qubits are in a product state exactly when the cross products of their amplitude grid agree.',
    formal: 'A state is a product iff $\\det C = c_{00}c_{11} - c_{01}c_{10} = 0$, equivalently rank $C = 1$.',
    first: 'q6-entangled:b4',
  },
  {
    id: 'qc-bell-basis',
    term: 'Bell basis',
    gloss: 'Four entangled two-qubit states that together form a basis.',
    formal: 'The orthonormal basis $\\{\\Phi^\\pm, \\Psi^\\pm\\}$ of $\\mathbb C^2\\otimes\\mathbb C^2$, every member maximally entangled.',
    first: 'q6-bell-basis:b1',
    introduces: 'space',
    bridge: 'qc-l2-three-bases',
  },
  {
    id: 'qc-beta-xy',
    term: '$\\beta_{xy}$',
    gloss: 'A Bell state’s two-bit name: y says whether the qubits differ, x whether the terms subtract.',
    formal: '$|\\beta_{xy}\\rangle = \\big(|0, y\\rangle + (-1)^x|1, 1\\oplus y\\rangle\\big)/\\sqrt2$.',
    first: 'q6-bell-basis:b2',
    introduces: 'notation',
  },
  {
    id: 'qc-triplet',
    term: 'triplet',
    gloss: 'The three two-spin states that stay the same when the spins swap: total spin 1.',
    formal: '$|1,1\\rangle = |{\\uparrow\\uparrow}\\rangle$, $|1,0\\rangle = \\Psi^+$, $|1,-1\\rangle = |{\\downarrow\\downarrow}\\rangle$.',
    first: 'q6-bell-basis:b5',
  },
  {
    id: 'qc-singlet',
    term: 'singlet',
    gloss: 'The two-spin state that changes sign when the spins swap: total spin 0.',
    formal: '$|0,0\\rangle = \\Psi^- = \\big(|{\\uparrow\\downarrow}\\rangle - |{\\downarrow\\uparrow}\\rangle\\big)/\\sqrt2$.',
    first: 'q6-bell-basis:b5',
  },
  {
    id: 'qc-bell-measurement',
    term: 'Bell measurement',
    gloss: 'A reading that tells which Bell state a pair is in: a CNOT, an H, then two ordinary readings.',
    formal: 'The projective measurement $\\{\\Pi_{xy}\\}$, realised by $U = (H\\otimes I)\\,\\mathrm{CNOT}$ followed by Z on each line.',
    first: 'q6-bell-circuit:b1',
  },
  {
    id: 'qc-bell-projector',
    term: '$\\Pi_{xy}$',
    gloss: 'The projector that keeps the $\\beta_{xy}$ part of a pair’s state.',
    formal: '$\\Pi_{xy} = |\\beta_{xy}\\rangle\\langle\\beta_{xy}|$, with $\\sum_{xy}\\Pi_{xy} = I$.',
    first: 'q6-bell-circuit:b4',
    introduces: 'notation',
    bridge: 'qc-l4-projectors',
  },
  {
    id: 'qc-stabilizer',
    term: 'stabilizer',
    gloss: 'An operator that leaves a state exactly unchanged.',
    formal: 'An operator g stabilizes $|\\psi\\rangle$ when $g|\\psi\\rangle = +|\\psi\\rangle$; $XX$ and $ZZ$ generate the stabilizer of $\\Phi^+$.',
    first: 'q6-parities:b4',
    introduces: 'notation',
  },
  {
    id: 'qc-number-operator',
    term: 'bit operator $\\hat n$',
    gloss: 'The operator that reads one qubit’s bit: 0 on $|0\\rangle$, 1 on $|1\\rangle$.',
    formal: '$\\hat n_i = |1\\rangle\\langle1|_i = (I - Z_i)/2$.',
    first: 'q6-parities:b5',
    introduces: 'notation',
  },
]
