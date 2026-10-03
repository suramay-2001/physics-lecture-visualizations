/**
 * Chapter Q6 review cards: the exam layer in both tracks (P-Q6-story §6). Ground-up ≤ 25 words per sentence, Formal ≤
 * 40; ≤ 5 points each. Every number comes from Q6.values.ts and is backed by a keyed claim.
 */
import type { ReviewCard } from '../schema'

export const Q6_REVIEW: Record<string, ReviewCard> = {
  'q6-many': {
    points: [
      'Two qubits have $2\\times2 = 4$ basis states, not $2 + 2$.',
      'N qubits carry $2^N$ amplitudes against N bits for N coins.',
      'Two independently prepared qubits form a product state.',
    ],
    equations: '|\\Psi\\rangle = \\sum_{i_1, i_2}c_{i_1i_2}|i_1\\rangle_1\\otimes|i_2\\rangle_2',
    trap: 'Adding dimensions, $2 + 2$, instead of multiplying them.',
    formal: {
      points: [
        '$\\dim(V^{(1)}\\otimes V^{(2)}) = d_1d_2$.',
        '$2^N$ amplitudes against N classical bits: the memory wall.',
        'A product state $|\\psi_1\\rangle\\otimes|\\psi_2\\rangle$ has an outer-product amplitude array.',
      ],
      trap: 'Adding dimensions instead of multiplying them.',
    },
  },
  'q6-tensor': {
    points: [
      'An operator on qubit 1 alone is $A\\otimes I$.',
      '$A\\otimes B$: each entry of A times a copy of B.',
      '$XZ$ names $X\\otimes Z$, one letter per qubit, never the one-qubit product $X\\cdot Z$.',
      'A product state’s averages multiply.',
    ],
    equations: 'A\\otimes B = [A_{ij}B],\\quad \\langle\\psi_1\\psi_2|A\\otimes B|\\psi_1\\psi_2\\rangle = \\langle A\\rangle\\langle B\\rangle',
    trap: 'Reading $XZ$ as the 2 × 2 product $X\\cdot Z$, or expecting a product operator to be diagonal somewhere.',
    formal: {
      points: [
        'The block rule, $A\\otimes B = [A_{ij}B]$.',
        '$\\langle A\\otimes B\\rangle = \\langle A\\rangle\\langle B\\rangle$ for product states.',
        '$T = r_Ar_B^{\\mathsf T}$ for a product state’s correlation grid.',
      ],
      trap: 'Reading a Pauli string as a one-qubit matrix product.',
    },
  },
  'q6-entangled': {
    points: [
      'Two qubits: 6 real parameters; a product state uses only 4.',
      'The product share of parameters collapses as the qubit count grows.',
      '$\\Phi^+$ is not a product state.',
      'Product test: $c_{00}c_{11} - c_{01}c_{10} = 0$ exactly for products.',
    ],
    equations: '\\det C = c_{00}c_{11} - c_{01}c_{10}',
    trap: 'Thinking four nonzero amplitudes means entangled: $|{+}{+}\\rangle$ has four and is a product.',
    formal: {
      points: [
        '$2\\cdot2^N - 2$ general real parameters against $2N$ for a product.',
        'Rank-1 coefficient matrix is equivalent to a product state.',
        'Singular values: one for a product, two equal ones for an entangled pair.',
      ],
      trap: 'Thinking every nonzero entry means entangled: the test is $\\det C = 0$, not a count of entries.',
    },
  },
  'q6-bell-basis': {
    points: [
      'Four entangled states, $\\Phi^\\pm$ and $\\Psi^\\pm$, together form a basis.',
      '$\\beta_{xy}$: y says agree or differ, x says plus or minus.',
      'Single-qubit readings are random; the pair’s readings are perfectly correlated.',
      '$\\Psi^+$ is a triplet state and $\\Psi^-$ is the singlet.',
    ],
    equations: '|\\beta_{xy}\\rangle = \\tfrac1{\\sqrt2}\\big(|0, y\\rangle + (-1)^x|1, 1\\oplus y\\rangle\\big)',
    trap: 'Mixing name systems: the notes’ $\\beta_{10}$ is $\\Phi^-$, and Bergou’s $\\Psi_\\pm$ are our $\\Phi^\\pm$.',
    formal: {
      points: [
        'Orthonormality, $\\langle\\beta_{xy}|\\beta_{x\'y\'}\\rangle = \\delta_{xx\'}\\delta_{yy\'}$.',
        '$r_A = r_B = 0$ and $T$ diagonal with entries $\\pm1$, for every Bell state.',
        'HW2 P1: $|{\\pm x},{\\pm x}\\rangle = |{\\pm1_x}\\rangle$; $S^{\\rm tot}_x$ is block-diagonal, triplet and singlet.',
      ],
      trap: 'Mixing the name systems between the notes, N&C and Bergou.',
    },
  },
  'q6-bell-circuit': {
    points: [
      'Rotate the Bell basis onto the 0/1 basis, then read two ordinary bits.',
      'CNOT, then H on qubit 1: $\\beta_{xy} \\to |xy\\rangle$ with certainty.',
      'Run the circuit backwards and it makes Bell states.',
      'An outcome’s chance is $\\langle\\Psi|\\Pi_{xy}|\\Psi\\rangle$, as in Chapter Q3.',
    ],
    equations: '(H\\otimes I)\\,\\mathrm{CNOT}\\,|\\beta_{xy}\\rangle = |xy\\rangle',
    trap: 'Reversing the gate order: the measuring circuit runs CNOT first, then H.',
    formal: {
      points: [
        '$U = (H\\otimes I)\\mathrm{CNOT}$, $U^\\dagger = \\mathrm{CNOT}(H\\otimes I)$.',
        'The complete orthogonal projectors $\\Pi_{xy} = |\\beta_{xy}\\rangle\\langle\\beta_{xy}|$.',
        'HW2 P2(a), (c): a product input gives four equal outcomes; an entangled input is lopsided.',
      ],
      trap: 'Reversing the gate order in $U$.',
    },
  },
  'q6-parities': {
    points: [
      'Reading Z after the gates reads a two-qubit parity before them.',
      '$X_1X_2$ and $Z_1Z_2$ commute, so both can be read at once.',
      'The two recorded bits are exactly the two parities.',
      '$X_1X_2$ and $Z_1Z_2$ both stabilize $\\Phi^+$.',
    ],
    equations: 'U^\\dagger(Z\\otimes I)U = X\\otimes X,\\quad U^\\dagger(I\\otimes Z)U = Z\\otimes Z',
    trap: 'Conjugating the wrong way: the observable moves as $U\\hat MU^\\dagger$, not $U^\\dagger\\hat MU$.',
    formal: {
      points: [
        'Heisenberg conjugation: $U^\\dagger(Z\\otimes I)U = X\\otimes X$, $U^\\dagger(I\\otimes Z)U = Z\\otimes Z$.',
        'The factorized projector $\\Pi_{xy} = \\tfrac12(I + (-1)^xXX)\\cdot\\tfrac12(I + (-1)^yZZ)$.',
        '$U\\hat MU^\\dagger = 2\\hat n_1 + \\hat n_2$, moving nonlocality into U.',
      ],
      trap: 'Conjugating $\\hat M$ the wrong way round.',
    },
  },
}
