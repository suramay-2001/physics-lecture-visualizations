/**
 * Chapter Q5 glossary (Physics 709; P-Q5-story §5), merged into the lazy course pack by file name (pack.ts). Every
 * entry has a Ground-up sentence (`gloss`, ≤ 25 words) and a Formal one (`formal`, ≤ 40), paraphrased; `bridge`
 * names a Spin Lab unit (content/qc709/bridges.ts) that teaches the same idea, offered in the popover. Ids start
 * `qc-` (the "gloss at first use" lint, content/symbols.test.ts).
 */
import type { GlossEntry } from '../schema'

export const GLOSSARY: GlossEntry[] = [
  /* q5-problem */
  {
    id: 'qc-constant',
    term: 'constant function',
    gloss: 'A one-bit function that gives the same answer for 0 and for 1.',
    formal: 'A Boolean function f with f(0) = f(1).',
    first: 'q5-problem:b1',
  },
  {
    id: 'qc-balanced',
    term: 'balanced function',
    gloss: 'A function that gives 0 for half its inputs and 1 for the other half.',
    formal: 'A Boolean function f with |f⁻¹(0)| = |f⁻¹(1)|.',
    first: 'q5-problem:b1',
  },
  {
    id: 'qc-deutsch-problem',
    term: "Deutsch's problem",
    gloss: 'Decide whether a hidden one-bit function is constant or balanced.',
    formal: 'Compute f(0) ⊕ f(1) with oracle access to f alone.',
    first: 'q5-problem:b2',
  },
  /* q5-oracle */
  {
    id: 'qc-oracle',
    term: 'oracle',
    gloss: 'A gate we may use but never look inside; here the f-CNOT $U_f$.',
    formal: 'A black-box unitary $U_f$ we may apply but not decompose.',
    first: 'q5-oracle:b1',
  },
  {
    id: 'qc-query',
    term: 'query',
    gloss: 'One use of an oracle.',
    formal: 'One application of $U_f$ to the register.',
    first: 'q5-oracle:b1',
  },
  {
    id: 'qc-phase-kickback',
    term: 'phase kickback',
    gloss: "With the target in $|-\\rangle$, the oracle's answer comes back as a sign on the control.",
    formal: '$U_f|x\\rangle|-\\rangle = (-1)^{f(x)}|x\\rangle|-\\rangle$.',
    first: 'q5-oracle:b3',
  },
  {
    id: 'qc-phase-oracle',
    term: 'phase oracle',
    gloss: 'The sign gate that f becomes on the input qubit alone.',
    formal: '$O_f = \\sum_x(-1)^{f(x)}|x\\rangle\\langle x|$.',
    first: 'q5-oracle:b4',
  },
  {
    id: 'qc-toffoli',
    term: 'Toffoli gate',
    gloss: 'A three-bit gate that flips the third bit when the first two are both 1.',
    formal: '$(a, b, c) \\mapsto (a, b, c \\oplus ab)$, its own inverse.',
    first: 'q5-oracle:b5',
  },
  /* q5-one-value */
  {
    id: 'qc-quantum-parallelism',
    term: 'quantum parallelism',
    gloss: 'One query on a superposed input puts every value of f into one state.',
    formal: '$U_f\\sum_x|x\\rangle|0\\rangle = \\sum_x|x, f(x)\\rangle$ (unnormalized).',
    first: 'q5-one-value:b1',
  },
  {
    id: 'qc-walsh-hadamard',
    term: 'Walsh–Hadamard transform',
    gloss: 'An H on every qubit of a register, together.',
    formal: '$H^{\\otimes n}$; $H^{\\otimes n}|0\\rangle^{\\otimes n} = 2^{-n/2}\\sum_x|x\\rangle$.',
    first: 'q5-one-value:b3',
  },
  /* q5-interferometer */
  {
    id: 'qc-beam-splitter',
    term: 'beam splitter',
    gloss: 'A half-silvered mirror that sends a photon on in two directions at once.',
    formal: '$a^\\dagger \\mapsto (a^\\dagger + b^\\dagger)/\\sqrt2,\\ b^\\dagger \\mapsto (b^\\dagger - a^\\dagger)/\\sqrt2$.',
    first: 'q5-interferometer:b1',
  },
  {
    id: 'qc-phase-shifter',
    term: 'phase shifter',
    gloss: "A piece of glass on one arm that adds a phase to that arm's amplitude.",
    formal: '$U_\\varphi a^\\dagger U_\\varphi^\\dagger = e^{i\\varphi}a^\\dagger$.',
    first: 'q5-interferometer:b2',
    bridge: 'qc-l2-complex',
  },
  {
    id: 'qc-mach-zehnder',
    term: 'Mach–Zehnder interferometer',
    gloss: 'Two splitters, two mirrors and phase shifters: one photon, two paths, recombined.',
    formal: 'Two splitters and phase shifters recombining one photon\'s two paths into interference.',
    first: 'q5-interferometer:b2',
  },
  /* q5-other-models */
  {
    id: 'qc-adiabatic-computing',
    term: 'adiabatic computing',
    gloss: 'Computing by changing an energy operator so slowly that the system stays in its lowest state.',
    formal: '$\\mathcal H(s) = (1-s)\\mathcal H_0 + s\\mathcal H_1$, $s = t/t_f$.',
    first: 'q5-other-models:b1',
    bridge: 'qc-l6-generator',
  },
  {
    id: 'qc-spectral-gap',
    term: 'gap',
    gloss: 'The distance between the two lowest energy levels.',
    formal: '$\\Delta(s) = E_1(s) - E_0(s)$.',
    first: 'q5-other-models:b1',
  },
  {
    id: 'qc-measurement-based',
    term: 'measurement-based computing',
    gloss: 'Computing by measuring the qubits of a prepared entangled state, one after another.',
    formal: 'One-way computing on a cluster state.',
    first: 'q5-other-models:b3',
  },
  {
    id: 'qc-cluster-state',
    term: 'cluster state',
    gloss: 'A many-qubit state made by CZ gates on qubits that all start in $|+\\rangle$.',
    formal: '$\\prod_{ij}\\mathrm{CZ}_{ij}|+\\rangle^{\\otimes n}$.',
    first: 'q5-other-models:b3',
  },
  {
    id: 'qc-byproduct',
    term: 'byproduct',
    gloss: 'A known extra Pauli gate left behind by a random measurement result.',
    formal: 'X or Z fixed by the outcome, removed by relabelling the results.',
    first: 'q5-other-models:b4',
  },
]
