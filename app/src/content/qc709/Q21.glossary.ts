/**
 * Chapter Q21 glossary (Physics 709; P-Q21-story §5), merged into the lazy course pack by file name (pack.ts). Every entry has a Ground-up
 * sentence (`gloss`, ≤ 25 words) and a Formal one (`formal`, ≤ 40), paraphrased. Ids start `qc-` (the "gloss at first use" lint, content/symbols.test.ts).
 * `introduces` marks the four notation beats (interface change W-709 #12): the syndrome, the code words, the Knill–Laflamme condition and the [[n, k]] code, each
 * introduced by exactly one beat of this chapter (content.test.tsx).
 *
 * Reused without a new entry here: qc-cnot (Q4), qc-parity (Q6), qc-pauli-matrices (Q3), qc-kraus-operator (Q13), and the Spin Lab gloss relative-phase.
 */
import type { GlossEntry } from '../schema'

export const GLOSSARY: GlossEntry[] = [
  {
    id: 'qc-repetition-code',
    term: 'repetition code',
    gloss: 'Send each bit several times and take a vote.',
    formal: '$0 \\to 0^n$, $1 \\to 1^n$, decoded by majority vote.',
    first: 'q21-classical:b1',
    bridge: 'qc-f5-probability',
  },
  {
    id: 'qc-syndrome',
    term: 'syndrome',
    gloss: 'The answers of the parity checks, which name the error and say nothing about the data.',
    formal: 'The vector $Me$ of check outcomes for a classical error $e$; for a quantum code, the $\\pm1$ outcomes of the commuting checks.',
    first: 'q21-classical:b3',
    introduces: 'notation',
    bridge: 'qc-f7-gf2',
  },
  {
    id: 'qc-codeword',
    term: 'code words',
    gloss: 'The two states that stand for 0 and for 1 inside a code.',
    formal: 'The basis $|\\bar0\\rangle, |\\bar1\\rangle$ of the code space $\\mathcal H_C$, the subspace that stores the logical qubit.',
    first: 'q21-bit-flip:b1',
    introduces: 'notation',
  },
  {
    id: 'qc-shor-code',
    term: 'Shor code',
    gloss: 'Nine qubits in three groups: each group fixes bit flips, and the groups are compared to fix sign flips.',
    formal: 'The $[\\![9, 1]\\!]$ code with words $(|000\\rangle \\pm |111\\rangle)^{\\otimes3}/\\sqrt8$ (Bergou Eq. 9.3).',
    first: 'q21-shor:b1',
  },
  {
    id: 'qc-degenerate-code',
    term: 'degenerate code',
    gloss: 'A code where different errors may share one fix.',
    formal: 'A code that fails the orthogonality of Eq. 9.8 yet satisfies the Knill–Laflamme condition of Eq. 9.16.',
    first: 'q21-shor:b4',
  },
  {
    id: 'qc-error-weight',
    term: 'weight of an error',
    gloss: 'How many qubits a Pauli error touches.',
    formal: 'The number of non-identity factors of $E \\in \\{I, X, Y, Z\\}^{\\otimes n}$.',
    first: 'q21-digitize:b3',
    bridge: 'qc-f7-gf2',
  },
  {
    id: 'qc-kl-condition',
    term: 'Knill–Laflamme condition',
    gloss: 'Errors must treat both code words alike and keep their rooms apart.',
    formal: '$\\langle\\bar j|E_b^\\dagger E_a|\\bar k\\rangle = C_{ba}\\delta_{jk}$ for all error pairs, with $C$ Hermitian (Bergou Eq. 9.16).',
    first: 'q21-kl:b2',
    introduces: 'notation',
  },
  {
    id: 'qc-code-nk',
    term: '$[\\![n, k]\\!]$ code',
    gloss: 'A code that stores $k$ qubits in $n$ qubits.',
    formal: 'A $2^k$-dimensional code space inside $(\\mathbb{C}^2)^{\\otimes n}$.',
    first: 'q21-kl:b4',
    introduces: 'notation',
  },
  {
    id: 'qc-quantum-hamming-bound',
    term: 'quantum Hamming bound',
    gloss: 'Every fixable error needs its own room, and the rooms must fit in the space.',
    formal: '$2^k\\sum_{j\\le t}\\binom nj3^j \\le 2^n$ for a nondegenerate $[\\![n, k]\\!]$ code correcting $t$ errors.',
    first: 'q21-kl:b4',
  },
  {
    id: 'qc-collective-dephasing',
    term: 'collective dephasing',
    gloss: 'One random phase shared by all the qubits.',
    formal: 'The channel $R(\\varphi)^{\\otimes n}$ averaged over a distribution $p(\\varphi)$ (Bergou Eq. 9.58).',
    first: 'q21-dfs:b2',
    bridge: 'qc-l6-mixture',
  },
  {
    id: 'qc-dfs',
    term: 'decoherence-free subspace',
    gloss: 'A set of states that the shared noise only turns as a whole.',
    formal: 'The span of $|01\\rangle$ and $|10\\rangle$, on which Eq. 9.58 leaves every density matrix unchanged.',
    first: 'q21-dfs:b3',
  },
]
