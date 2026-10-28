/**
 * Chapter Q20 glossary (Physics 709; P-Q20-story §5), merged into the lazy course pack by file name (pack.ts). Every entry has a Ground-up sentence (`gloss`, ≤ 25 words)
 * and a Formal one (`formal`, ≤ 40), paraphrased. Ids start `qc-`. `introduces` marks the two notation beats: the copy fidelity F_c (q20-cloner:b1) and the programmable
 * processor (q20-no-go:b1), each introduced by exactly one beat of this chapter (content.test.tsx).
 *
 * Reused without a new entry here: qc-no-cloning, qc-fidelity, qc-choi-matrix, qc-complete-positivity, qc-depolarizing, qc-povm, qc-unambiguous-discrimination, qc-toffoli, qc-cnot,
 * qc-bell-state and qc-mixed-state.
 */
import type { GlossEntry } from '../schema'

export const GLOSSARY: GlossEntry[] = [
  {
    id: 'qc-quantum-cloner',
    term: 'quantum cloner',
    gloss: 'A machine that makes two imperfect copies of an unknown qubit.',
    formal: 'A unitary on input, blank and ancilla whose two outputs each have high copy fidelity for every input; exact cloning is impossible (Bergou §8.2).',
    first: 'q20-cloner:b1',
    bridge: 'qc-q13-no-cloning',
  },
  {
    id: 'qc-copy-fidelity',
    term: 'copy fidelity $F_{\\rm c}$',
    gloss: 'How well a copy matches the original: the chance that it passes a test for the original state.',
    formal: "$F_{\\rm c} = \\langle\\psi|\\rho|\\psi\\rangle$, the square of the root fidelity $F$ of Chapter Q9; it is what Bergou's Chapter 8 calls the fidelity.",
    first: 'q20-cloner:b1',
    introduces: 'notation',
    symbols: ['F_{\\rm c}'],
  },
  {
    id: 'qc-universal-cloner',
    term: 'universal cloner',
    gloss: 'A cloner that copies every input state equally well.',
    formal: 'A cloner whose copy fidelity is the same for all inputs; the four-CNOT cloner at the equal split has $F_{\\rm c} = 5/6$ (eq. 8.5).',
    first: 'q20-cloner:b5',
  },
  {
    id: 'qc-u-not',
    term: 'U-NOT',
    gloss: 'A machine that turns a qubit into its exact opposite state; it cannot be built exactly.',
    formal: 'The map $\\psi \\mapsto \\psi^\\perp = \\beta^*|0\\rangle - \\alpha^*|1\\rangle$: antipodal on the ball and not completely positive; the best physical approximation has $F_{\\rm c} = 2/3$.',
    first: 'q20-unot:b1',
    bridge: 'qc-q13-properties',
  },
  {
    id: 'qc-anti-unitary',
    term: 'anti-unitary',
    gloss: 'A map that conjugates numbers; no quantum gate can do that.',
    formal: 'A map with $\\langle A\\psi|A\\varphi\\rangle = \\langle\\psi|\\varphi\\rangle^*$, such as complex conjugation; the ideal U-NOT is one, while a physical gate is unitary.',
    first: 'q20-unot:b1',
  },
  {
    id: 'qc-measure-and-prepare',
    term: 'measure-and-prepare',
    gloss: 'A machine that measures the input and builds a new state from the result.',
    formal: 'Measure along a random axis $\\eta$, then prepare a state chosen by the outcome; optimal for the U-NOT, not for cloning (eqs. 8.9–8.12).',
    first: 'q20-unot:b5',
  },
  {
    id: 'qc-programmable-processor',
    term: 'programmable processor',
    gloss: 'A fixed circuit whose job is chosen by a second input, the program.',
    formal: 'A unitary $G$ on $\\mathcal H_d \\otimes \\mathcal H_p$ with $G(|\\psi\\rangle|\\Pi\\rangle) = U|\\psi\\rangle|\\Pi\'\\rangle$ for every data state (eq. 8.13).',
    first: 'q20-no-go:b1',
    introduces: 'space',
    symbols: ['\\mathcal H_d', '\\mathcal H_p', 'G'],
  },
  {
    id: 'qc-program-register',
    term: 'program register',
    gloss: 'The wires that carry the program.',
    formal: 'The factor $\\mathcal H_p$ holding $|\\Pi\\rangle$; its dimension bounds how many operations the processor can run deterministically.',
    first: 'q20-no-go:b1',
  },
  {
    id: 'qc-probabilistic-gate',
    term: 'probabilistic gate',
    gloss: 'A gate that works only some of the time and tells you when.',
    formal: 'An operation realised with chance $p < 1$, announced by a measurement of the program output (Bergou §8.4).',
    first: 'q20-probabilistic:b1',
    bridge: 'qc-q4-cnot',
  },
  {
    id: 'qc-repeat-until-success',
    term: 'repeat until success',
    gloss: 'Try again after a failure, with a changed program, until the gate works.',
    formal: 'After $k$ rounds with the programs $\\Xi(2^{j-1}\\alpha)$ the chance of success is $1 - 2^{-k}$.',
    first: 'q20-probabilistic:b3',
  },
  {
    id: 'qc-bell-program',
    term: 'Bell program',
    gloss: 'A Bell state used as the program: the circuit applies one of the four Pauli gates.',
    formal: 'In the cloner circuit $|\\psi\\rangle_1|B_k\\rangle_{23} \\to \\sigma_k|\\psi\\rangle_1|B_k\\rangle_{23}$ (eq. 8.23); mixes of Bell states give any combination of Paulis.',
    first: 'q20-bell-programs:b1',
    bridge: 'qc-q6-bell-basis',
  },
  {
    id: 'qc-antisymmetric-projector',
    term: 'antisymmetric projector',
    gloss: 'A test for whether two qubits are in the opposite-sign singlet state.',
    formal: 'The projector $P^{\\rm as} = |\\psi^-\\rangle\\langle\\psi^-|$ on two qubits; it gives 0 on every state that is symmetric under their swap.',
    first: 'q20-discriminator:b2',
  },
  {
    id: 'qc-programmable-discriminator',
    term: 'programmable discriminator',
    gloss: 'A state discriminator whose two target states are supplied as data.',
    formal: 'A POVM on registers A and B (the states) and C (the input) that names $\\psi_1$ or $\\psi_2$ without error from one copy of each (eqs. 8.31–8.47).',
    first: 'q20-discriminator:b1',
    bridge: 'qc-q14-usd',
  },
]
