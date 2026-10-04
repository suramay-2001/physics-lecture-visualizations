/**
 * Chapter Q13 glossary (Physics 709; P-Q13-story §5), merged into the lazy course pack by file name (pack.ts). Every
 * entry has a Ground-up sentence (`gloss`, ≤ 25 words) and a Formal one (`formal`, ≤ 40), paraphrased. Ids start
 * `qc-` (the "gloss at first use" lint, content/symbols.test.ts). `introduces` marks the two notation beats
 * (interface change W-709 #12): each is introduced by exactly one beat of this chapter (content.test.tsx).
 *
 * Reused without a new entry here: qc-density-matrix-station, qc-trace-rule, qc-bloch-ball-station,
 * qc-positive-operator (448/Q8 territory, named in words — Q8 owns them, not re-taught); qc-partial-trace-station,
 * qc-purification-station (Q9); qc-bell-cycle (Q11, the Bell basis); qc-cnot (Q4). The partial transpose itself
 * (ρ^{T_B}) and no-signalling are Q12's and Q10's own glossary territory and are named in words here, not re-taught.
 */
import type { GlossEntry } from '../schema'

export const GLOSSARY: GlossEntry[] = [
  {
    id: 'qc-quantum-channel',
    term: 'quantum channel',
    gloss: 'The most general evolution of an open qubit: a weighted spread of the state, one term per environment outcome.',
    formal: '$\\mathcal E(\\rho) = \\sum_m A_m\\rho A_m^\\dagger$ (the book also writes $T(\\rho)$); completely positive and trace-preserving.',
    first: 'q13-from-unitary:b2',
    introduces: 'notation',
    bridge: 'qc-l6-mixture',
  },
  {
    id: 'qc-kraus-operator',
    term: 'Kraus operator',
    gloss: "One of the operators in a channel's sum; each one reads off a single outcome of the hidden environment.",
    formal: '$A_m = \\langle m|U_{SE}|0\\rangle_E$, with $\\sum_m A_m^\\dagger A_m = I$ (completeness).',
    first: 'q13-from-unitary:b2',
  },
  {
    id: 'qc-complete-positivity',
    term: 'complete positivity',
    gloss: 'The real test for a channel: it must stay positive even acting on half of a larger entangled pair.',
    formal: '$\\mathcal E\\otimes I_B \\ge 0$ for an ancilla $B$ of any size — strictly stronger than positivity alone.',
    first: 'q13-properties:b2',
  },
  {
    id: 'qc-choi-matrix',
    term: 'Choi matrix',
    gloss: 'The state a map leaves behind when run on half of a maximally entangled pair; it tells you if the map is a channel.',
    formal: '$(\\mathcal E\\otimes I)|\\Phi^+\\rangle\\langle\\Phi^+|$; $\\mathcal E$ is completely positive iff this is $\\ge 0$ (Choi–Jamiołkowski).',
    first: 'q13-properties:b3',
  },
  {
    id: 'qc-stinespring',
    term: 'Stinespring dilation',
    gloss: 'The fact that every channel is one unitary on the qubit plus a fresh environment, the environment then forgotten.',
    formal: '$A_m|\\psi\\rangle = \\langle m|U_{SE}(|\\psi\\rangle\\otimes|0\\rangle_E)$ for a unitary $U_{SE}$; at most $N^2$ operators are ever needed.',
    first: 'q13-stinespring:b1',
  },
  {
    id: 'qc-depolarizing',
    term: 'depolarizing channel',
    gloss: 'The plainest noise: with chance $p$ the qubit is scrambled to the centre, shrinking the whole Bloch ball.',
    formal: '$\\mathcal E(\\rho) = (1-p)\\rho + \\tfrac p3(X\\rho X + Y\\rho Y + Z\\rho Z)$; the Bloch map $\\mathbf r \\to (1 - \\tfrac{4p}3)\\mathbf r$.',
    first: 'q13-depolarizing:b1',
    bridge: 'qc-l6-bloch',
  },
  {
    id: 'qc-amplitude-damping',
    term: 'amplitude damping',
    gloss: 'The decay channel: an excited qubit can drop to the ground state, squashing the ball into an off-centre egg.',
    formal: 'Kraus operators $\\{\\text{diag}(1,\\sqrt{1-\\gamma}),\\ \\sqrt\\gamma\\,|0\\rangle\\langle1|\\}$ (Bergou ⚑ P4.5).',
    first: 'q13-depolarizing:b3',
  },
  {
    id: 'qc-no-cloning',
    term: 'no-cloning theorem',
    gloss: 'No machine can copy an unknown quantum state; a perfect copier would have to be non-linear.',
    formal: 'No unitary gives $U(|\\psi\\rangle|0\\rangle) = |\\psi\\rangle|\\psi\\rangle$ for every $|\\psi\\rangle$; only mutually orthogonal states are clonable.',
    first: 'q13-no-cloning:b2',
  },
]
