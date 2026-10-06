/**
 * Chapter Q11 glossary (Physics 709; P-Q11-story §5), merged into the lazy course pack by file name (pack.ts). Every
 * entry has a Ground-up sentence (`gloss`, ≤ 25 words) and a Formal one (`formal`, ≤ 40), paraphrased. Ids start
 * `qc-` (the "gloss at first use" lint, content/symbols.test.ts). `introduces` marks the notation/space beats
 * (interface change W-709 #12): each such entry is introduced by exactly one beat of this chapter (content.test.tsx).
 *
 * Reused without a new entry here: qc-bell-basis, qc-bell-measurement, qc-bell-projector, qc-beta-xy, qc-singlet,
 * qc-stabilizer (Q6); qc-cnot, qc-controlled-gate, qc-circuit, qc-readout (Q4); qc-pauli-matrices (Q3);
 * qc-maximally-mixed (Q8); qc-reduced-density-matrix (Q9). The no-cloning rule is named in words (its full treatment
 * is Chapter Q13's qc-no-cloning).
 */
import type { GlossEntry } from '../schema'

export const GLOSSARY: GlossEntry[] = [
  {
    id: 'qc-bell-cycle',
    term: 'Bell cycle',
    gloss: 'A local Pauli on one half of a Bell pair moves it to another Bell state.',
    formal: 'On $\\Phi^+$, $(P\\otimes I)|\\Phi^+\\rangle$ for $P \\in \\{I, Z, X, Y\\}$ gives the four Bell states ($Y$ for $\\Psi^-$, up to a global phase).',
    first: 'q11-bell-tools:b1',
    introduces: 'notation',
  },
  {
    id: 'qc-ebit',
    term: 'ebit',
    gloss: 'One shared Bell pair: the basic unit of entanglement as a resource.',
    formal: 'The entanglement of one maximally entangled two-qubit pair ($S(\\rho_A) = 1$), pre-shared and spent: dense coding and teleportation each use one ebit.',
    first: 'q11-dense-coding:b1',
    introduces: 'notation',
  },
  {
    id: 'qc-dense-coding',
    term: 'dense coding',
    gloss: 'Sending two classical bits with one qubit, using a shared pair set up in advance.',
    formal: '$\\Phi^+ \\xrightarrow{\\{I,Z,X,Y\\}}$ the Bell basis: one sent qubit plus one ebit carries two bits (N&C §2.3).',
    first: 'q11-dense-coding:b2',
  },
  {
    id: 'qc-teleportation',
    term: 'teleportation',
    gloss: 'Moving an unknown state to a far qubit, using a shared pair and two classical bits.',
    formal: '$|\\psi\\rangle_{A_1}|\\Phi^+\\rangle_{A_2B} \\to |\\psi\\rangle_B$ by a Bell measurement and the correction $Z^{M_1}X^{M_2}$ (N&C §1.3.7).',
    first: 'q11-teleport-algebra:b1',
  },
  {
    id: 'qc-teleport-correction',
    term: 'correction $Z^{M_1}X^{M_2}$',
    gloss: 'The gates Bob applies, chosen by the two bits Alice sends him.',
    formal: '$Z^{M_1}X^{M_2}$: $I$ for 00, $X$ for 01, $Z$ for 10, $ZX$ for 11; the bits are read as exponents (N&C).',
    first: 'q11-teleport-circuit:b2',
    introduces: 'notation',
    bridge: 'qc-l3-postulates',
  },
  {
    id: 'qc-classical-channel',
    term: 'classical channel',
    gloss: 'The ordinary link, a phone call or a fibre, that carries the measured bits.',
    formal: 'The light-speed-bounded channel carrying $M_1M_2$; without it teleportation conveys nothing, consistent with [[qc-no-signalling|no-signalling]].',
    first: 'q11-teleport-circuit:b2',
  },
  {
    id: 'qc-entanglement-swapping',
    term: 'entanglement swapping',
    gloss: "A middle party's Bell measurement links two particles that never met.",
    formal: '$|\\Phi^+\\rangle_{AB_1}|\\Phi^+\\rangle_{B_2C} \\to$ A, C entangled after a Bell measurement on $B_1B_2$ (Bergou §3.4.3).',
    first: 'q11-swapping:b2',
  },
  {
    id: 'qc-quantum-repeater',
    term: 'quantum repeater',
    gloss: "A chain of swaps that carries entanglement past one fibre's own reach.",
    formal: 'Nodes Bell-measure and announce, extending entanglement over many links without amplifying the signal (Bergou §3.4.3, p. 39).',
    first: 'q11-swapping:b3',
  },
  {
    id: 'qc-qudit-space',
    term: 'qudit',
    gloss: 'A $d$-level system (we write $N = d$): the generalisation of a two-level qubit.',
    formal: '$\\mathbb C^N$, $N = d$ levels; two qudits live in the tensor product space $\\mathbb C^N\\otimes\\mathbb C^N$.',
    first: 'q11-qudit:b1',
    introduces: 'space',
  },
  {
    id: 'qc-weyl-bell',
    term: 'generalized Bell basis',
    gloss: 'A full set of maximally entangled states built for two $N$-level systems.',
    formal: '$|\\chi_{n,m}\\rangle = \\tfrac1{\\sqrt N}\\sum_je^{2\\pi ijn/N}|j\\rangle|j\\oplus m\\rangle$, $N^2$ orthonormal states (Bergou P3.3).',
    first: 'q11-qudit:b1',
    introduces: 'notation',
  },
]
