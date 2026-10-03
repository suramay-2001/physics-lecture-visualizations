/**
 * Chapter Q7 glossary (Physics 709; P-Q7-story §5), merged into the lazy course pack by file name (pack.ts). Every
 * entry has a Ground-up sentence (`gloss`, ≤ 25 words) and a Formal one (`formal`, ≤ 40), paraphrased from the
 * notes; `bridge` names a Spin Lab unit (content/qc709/bridges.ts) offered in the popover. Ids start `qc-` (the
 * "gloss at first use" lint, content/symbols.test.ts). `introduces` marks the one notation beat that names each
 * term (W-709 #12, content.test.tsx).
 *
 * Reused without a new entry here: `qc-pauli-string`, `qc-parity`, `qc-stabilizer` (Q6); `qc-compatible`,
 * `qc-dispersion`, `qc-eigenvalue` (Q3); `qc-hidden-label` (Q1).
 */
import type { GlossEntry } from '../schema'

export const GLOSSARY: GlossEntry[] = [
  /* q7-ghz */
  {
    id: 'qc-ghz',
    term: 'GHZ state',
    gloss: 'The three-qubit state $(|000\\rangle + |111\\rangle)/\\sqrt2$: all zero or all one, in superposition.',
    formal: '$|\\mathrm{GHZ}_N\\rangle = (|0\\cdots0\\rangle + |1\\cdots1\\rangle)/\\sqrt2$, here for $N = 3$ (Bergou eq. 3.81).',
    first: 'q7-ghz:b1',
    introduces: 'notation',
    symbols: ['\\mathrm{GHZ}'],
  },
  /* q7-brackets */
  {
    id: 'qc-ghz-run',
    term: 'run',
    gloss: 'One trial: a basis, x or y, for each qubit, and the ±1 reading it gave.',
    formal: '$(b_k, \\varepsilon_k)_{k=1}^3$ with $b_k \\in \\{x, y\\}$ and $\\varepsilon_k = \\pm1$, one pair per qubit.',
    first: 'q7-brackets:b2',
    introduces: 'notation',
    symbols: ['b_k', '\\varepsilon_k'],
  },
  {
    id: 'qc-zeta',
    term: '$\\zeta_k$',
    gloss: 'The size-1 factor by which a qubit’s bracket with $|1\\rangle$ differs from $1/\\sqrt2$.',
    formal: '$\\langle\\varepsilon_kb_k|1\\rangle = \\zeta_k/\\sqrt2$; $\\zeta_k = \\varepsilon_k$ in the x basis, $-i\\varepsilon_k$ in the y basis (eq. 2.9).',
    first: 'q7-brackets:b3',
    introduces: 'notation',
    symbols: ['\\zeta_k'],
  },
  /* q7-parity-table */
  {
    id: 'qc-ny-pi',
    term: '$n_y$ and $\\Pi$',
    gloss: '$n_y$ counts the qubits read in y; $\\Pi$ multiplies the three ±1 readings together.',
    formal: '$n_y$ is the number of y-basis readings; $\\Pi = \\varepsilon_1\\varepsilon_2\\varepsilon_3$, so $s = (-i)^{n_y}\\Pi$ (eq. 2.10).',
    first: 'q7-parity-table:b2',
    introduces: 'notation',
    symbols: ['n_y', '\\Pi', 's'],
  },
  /* q7-observables */
  {
    id: 'qc-mermin-observables',
    term: 'Mermin observables',
    gloss: 'The four three-qubit products XXX, YYX, YXY and XYY, each with values ±1.',
    formal: '$\\hat O_{XXX} = \\sigma_{x1}\\sigma_{x2}\\sigma_{x3}$ and its three partners (eq. 2.11); each squares to the identity and commutes with the rest.',
    first: 'q7-observables:b1',
    introduces: 'notation',
  },
  /* q7-mermin */
  {
    id: 'qc-local-realism',
    term: 'local realism',
    gloss: 'The idea that each part carries its own answers in advance, whatever is measured elsewhere.',
    formal: 'Predetermined local values exist for every possible measurement on each separate part of a system, fixed before any reading.',
    first: 'q7-mermin:b1',
    bridge: 'qc-l1-logic',
  },
  {
    id: 'qc-hidden-values',
    term: 'predetermined values',
    gloss: 'The answers, $x_i$ and $y_i$, a qubit would carry in advance for an X or a Y reading.',
    formal: '$x_i, y_i = \\pm1$ fixed in advance for each party, with $\\varepsilon_k$ equal to whichever the chosen basis reads.',
    first: 'q7-mermin:b1',
    introduces: 'notation',
    symbols: ['x_i', 'y_i'],
  },
  {
    id: 'qc-mermin-argument',
    term: 'Mermin’s argument',
    gloss: 'One run of each of four settings shows no predetermined answers can explain GHZ’s results.',
    formal: 'The three y-relations force $x_1x_2x_3 = -1$ while XXX measures $+1$: no hidden values reproduce all four (notes p. 34).',
    first: 'q7-mermin:b2',
  },
]
