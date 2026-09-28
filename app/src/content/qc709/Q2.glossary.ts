/**
 * Chapter Q2 glossary (Physics 709; P-Q2-story §5), merged into the lazy course pack by file name (pack.ts). Every
 * entry has a Ground-up sentence (`gloss`, ≤ 25 words) and a Formal one (`formal`, ≤ 40), paraphrased; `bridge`
 * names a Spin Lab unit (content/qc709/bridges.ts) that teaches the same idea. Ids start `qc-`.
 * Reused, not redefined here: `qc-amplitude` (F1), `qc-born-rule`, `qc-inner-product`, `qc-bra`, `qc-zero-vector` (Q1).
 */
import type { GlossEntry } from '../schema'

export const GLOSSARY: GlossEntry[] = [
  /* q2-basis */
  {
    id: 'qc-linearly-independent',
    term: 'linearly independent',
    gloss: 'Arrows none of which can be built from the others by scaling and adding.',
    formal: 'A list is LI when $\\sum_i c_i|\\alpha_i\\rangle = 0$ forces every $c_i = 0$; otherwise it is LD.',
    first: 'q2-basis:b1',
    bridge: 'qc-l4-basis',
  },
  {
    id: 'qc-dimension',
    term: 'dimension',
    gloss: 'The largest number of independent arrows a space holds; 2 for a qubit.',
    formal: 'A vector space $V(F)$ is $n$-dimensional when its largest LI set has $n$ members.',
    first: 'q2-basis:b2',
    bridge: 'qc-l2-three-bases',
  },
  {
    id: 'qc-basis',
    term: 'basis',
    gloss: 'Independent arrows from which every vector is built in exactly one way.',
    formal: 'An LI spanning list of $V^n$; the expansion of any $|\\alpha\\rangle \\in V^n$ in it is unique (Axler 2.28).',
    first: 'q2-basis:b3',
    bridge: 'qc-l4-basis',
  },
  {
    id: 'qc-component',
    term: 'component',
    gloss: 'How much of one basis arrow a vector contains.',
    formal: 'The number $c_i$ in $|\\alpha\\rangle = \\sum_i c_i|e_i\\rangle$; in an ON basis $c_i = \\langle e_i|\\alpha\\rangle$.',
    first: 'q2-basis:b3',
    bridge: 'qc-l2-inner-product',
  },
  {
    id: 'qc-orthonormal-basis',
    term: 'orthonormal',
    gloss: 'Arrows at right angles to each other, each of length 1.',
    formal: 'A list $\\{|\\alpha_i\\rangle\\}$ with $\\langle\\alpha_i|\\alpha_j\\rangle = \\delta_{ij}$.',
    first: 'q2-basis:b4',
    bridge: 'qc-l4-basis',
  },
  {
    id: 'qc-kronecker-delta',
    term: 'Kronecker delta $\\delta_{ij}$',
    gloss: 'A shorthand that is 1 when its two labels match and 0 when they differ.',
    formal: '$\\delta_{ij} = 1$ for $i = j$ and $0$ for $i \\ne j$.',
    first: 'q2-basis:b4',
    symbols: ['\\delta_{ij}'],
  },
  /* q2-gram-schmidt */
  {
    id: 'qc-gram-schmidt',
    term: 'Gram–Schmidt procedure',
    gloss: 'A recipe that makes independent arrows orthonormal: remove the shadows on earlier arrows, then rescale.',
    formal: '$|\\alpha_j\\rangle = |\\alpha\'_j\\rangle/\\sqrt{\\langle\\alpha\'_j|\\alpha\'_j\\rangle}$, with $|\\alpha\'_j\\rangle = |\\beta_j\\rangle - \\sum_{i<j}|\\alpha\'_i\\rangle\\langle\\alpha\'_i|\\beta_j\\rangle/\\langle\\alpha\'_i|\\alpha\'_i\\rangle$.',
    first: 'q2-gram-schmidt:b1',
    bridge: 'qc-l4-basis',
  },
  /* q2-operators */
  {
    id: 'qc-linear-operator',
    term: 'linear operator',
    gloss: 'A rule that turns vectors into vectors and respects adding and scaling.',
    formal: 'A linear map $A: V \\to V$, $A(a|\\psi_1\\rangle + b|\\psi_2\\rangle) = aA|\\psi_1\\rangle + bA|\\psi_2\\rangle$.',
    first: 'q2-operators:b1',
    bridge: 'qc-l3-operators',
  },
  {
    id: 'qc-outer-product',
    term: 'outer product $|\\alpha\\rangle\\langle\\beta|$',
    gloss: 'A ket followed by a bra: it makes a copy of the ket, scaled by an overlap.',
    formal: '$|\\alpha\\rangle\\langle\\beta|: |\\psi\\rangle \\mapsto \\langle\\beta|\\psi\\rangle|\\alpha\\rangle$; its matrix is $\\alpha\\beta^\\dagger$.',
    first: 'q2-operators:b4',
    bridge: 'qc-l3-projectors',
  },
  {
    id: 'qc-matrix-element',
    term: 'matrix element $A_{ij}$',
    gloss: 'One entry of an operator’s table: how much of arrow $i$ it makes from arrow $j$.',
    formal: '$A_{ij} = \\langle e_i|A|e_j\\rangle$ in an ON basis $\\{|e_i\\rangle\\}$.',
    first: 'q2-operators:b5',
    bridge: 'qc-l3-operators',
  },
  /* q2-change */
  {
    id: 'qc-change-of-basis-matrix',
    term: 'change-of-basis matrix $U$',
    gloss: 'The table that turns a vector’s old components into its new ones.',
    formal: '$U_{ij} = \\langle\\alpha\'_i|\\alpha_j\\rangle$, so $c\' = Uc$; Spin Lab’s B is $U^\\dagger$.',
    first: 'q2-change:b1',
    bridge: 'qc-l5-coordinates',
  },
  {
    id: 'qc-hadamard',
    term: 'Hadamard matrix $H$',
    gloss: 'The table that turns z components into x components; used twice, it undoes itself.',
    formal: '$H = \\tfrac{1}{\\sqrt2}\\begin{pmatrix}1&1\\\\1&-1\\end{pmatrix} = H^\\dagger = H^{-1}$ (Bergou p. 4).',
    first: 'q2-change:b6',
  },
  {
    id: 'qc-completeness',
    term: 'completeness relation',
    gloss: 'Adding every basis arrow times its own bra gives the operator that changes nothing.',
    formal: '$\\sum_k|\\alpha_k\\rangle\\langle\\alpha_k| = I$ for an orthonormal basis.',
    first: 'q2-change:b4',
    bridge: 'qc-l4-basis',
  },
  {
    id: 'qc-unitary',
    term: 'unitary',
    gloss: 'A table undone by its conjugated mirror image; it keeps all lengths and angles.',
    formal: 'A matrix $U$ with $UU^\\dagger = U^\\dagger U = I$.',
    first: 'q2-change:b4',
    bridge: 'qc-l5-coordinates',
  },
  {
    id: 'qc-similarity-transform',
    term: 'similarity transform',
    gloss: 'Rewriting an operator’s table for a new basis: U times the old table times U†.',
    formal: '$A\' = UAU^\\dagger$.',
    first: 'q2-change:b5',
    bridge: 'qc-l5-operators',
  },
  /* q2-photon */
  {
    id: 'qc-polarization',
    term: 'polarization',
    gloss: 'The direction in which a light wave’s electric field swings.',
    formal: 'A photon’s polarization state lies in $\\mathrm{span}\\{|x\\rangle, |y\\rangle\\}$, with $\\langle x|y\\rangle = 0$.',
    first: 'q2-photon:b1',
    bridge: 'qc-l1-average',
  },
  {
    id: 'qc-circular-polarization',
    term: 'circular polarization',
    gloss: 'Light whose field turns round in a circle; its states are $|R\\rangle$ and $|L\\rangle$.',
    formal: '$|R\\rangle, |L\\rangle = (|x\\rangle \\pm i|y\\rangle)/\\sqrt2$, the eigenstates of a frame turn.',
    first: 'q2-photon:b3',
  },
  {
    id: 'qc-generator',
    term: 'generator',
    gloss: 'The operator in the exponent of a turn; it sets how fast each state’s phase turns.',
    formal: 'The Hermitian $J_z$ with $U(\\chi) = e^{-iJ_z\\chi/\\hbar}$.',
    first: 'q2-photon:b5',
    bridge: 'qc-l6-generator',
  },
  {
    id: 'qc-helicity',
    term: 'helicity',
    gloss: 'A photon’s spin about its line of flight: +ħ or −ħ.',
    formal: 'The $J_z$ eigenvalue on $|R\\rangle$ or $|L\\rangle$: $\\pm\\hbar$ (the notes’ $R$ = positive helicity).',
    first: 'q2-photon:b5',
  },
]
