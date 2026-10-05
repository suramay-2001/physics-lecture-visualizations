/**
 * Chapter Q14 glossary (Physics 709; P-Q14-story §5), merged into the lazy course pack by file name (pack.ts). Every
 * entry has a Ground-up sentence (`gloss`, ≤ 25 words) and a Formal one (`formal`, ≤ 40), paraphrased. Ids start
 * `qc-` (the "gloss at first use" lint, content/symbols.test.ts). `introduces` marks the four notation beats
 * (interface change W-709 #12): each is introduced by exactly one beat of this chapter (content.test.tsx).
 *
 * Reused without a new entry here: qc-selective-measurement, qc-observable, qc-spectral-representation (Q3, named in
 * words — Q3 owns the projective measurement and the spectral theorem); qc-density-matrix, qc-trace, qc-bloch-ball,
 * qc-positive-operator (Q8); qc-trace-distance, qc-trace-norm, qc-partial-trace, qc-purification (Q9);
 * qc-quantum-channel, qc-kraus-operator, qc-stinespring (Q13).
 */
import type { GlossEntry } from '../schema'

export const GLOSSARY: GlossEntry[] = [
  {
    id: 'qc-generalized-measurement',
    term: 'generalized measurement',
    gloss: 'Any way to read a system: couple it to a meter, let them interact, then read the meter.',
    formal: 'Reading an ancilla after a joint unitary gives $p_i = \\mathrm{Tr}(E_i\\rho)$ for positive $E_i$, not just projectors (Bergou §5.2–5.3).',
    first: 'q14-pointer:b1',
  },
  {
    id: 'qc-povm',
    term: 'POVM',
    gloss: 'A set of measurement outcomes as positive operators that add to the identity — a measurement without the orthogonality rule.',
    formal: 'A decomposition of the identity $\\sum_i E_i = I$ into positive operators $E_i \\ge 0$ (Bergou §5.3; N&C §2.2.6).',
    first: 'q14-povm:b2',
  },
  {
    id: 'qc-povm-element',
    term: 'POVM element',
    gloss: 'One of the positive operators $E_i$ in a POVM; outcome $i$ has chance $\\mathrm{Tr}(E_i\\rho)$.',
    formal: '$E_i \\ge 0$ with $\\sum_i E_i = I$; $p_i = \\mathrm{Tr}(E_i\\rho)$ (Bergou writes $\\Pi_j$; N&C $E_m$).',
    first: 'q14-povm:b2',
    introduces: 'notation',
    bridge: 'qc-l3-postulates',
  },
  {
    id: 'qc-detection-operator',
    term: 'detection operator',
    gloss: 'The operator $A_i$ behind an outcome; the element is $E_i = A_i^\\dagger A_i$.',
    formal: '$A_i = U_i\\sqrt{E_i}$ (polar form, Bergou Eq. 5.11); the measurement twin of a Kraus operator.',
    first: 'q14-povm:b3',
  },
  {
    id: 'qc-trine',
    term: 'trine',
    gloss: 'Three qubit states 120° apart, giving a three-outcome measurement a sharp one cannot.',
    formal: '$|\\psi_j\\rangle$ (Bergou Eq. 5.24), $E_j = \\tfrac23|\\psi_j\\rangle\\langle\\psi_j|$; $p_{\\text{correct}} = \\tfrac23$, $p_{\\text{error}} = \\tfrac16$.',
    first: 'q14-povm:b3',
  },
  {
    id: 'qc-neumark',
    term: "Neumark's theorem",
    gloss: 'Every POVM is an ordinary sharp measurement on the system plus an added ancilla.',
    formal: 'A one-to-one correspondence between POVMs and projective measurements on $H_A\\otimes H_B$ (Bergou §5.4, Eqs. 5.15–5.23).',
    first: 'q14-neumark:b2',
  },
  {
    id: 'qc-dilation-space',
    term: 'dilation space',
    gloss: 'The enlarged space — system plus ancilla — on which the POVM becomes a sharp measurement.',
    formal: '$H_A\\otimes H_B$, ancilla $B$ in a fixed $|\\psi_B\\rangle$; the measurement analog of Chapter Q13’s dilation.',
    first: 'q14-neumark:b1',
    introduces: 'space',
  },
  {
    id: 'qc-ancilla',
    term: 'ancilla',
    gloss: 'A helper system you couple in, measure, and discard — the meter made quantum.',
    formal: 'The auxiliary factor $H_B$ whose sharp measurement realises the POVM on $H_A$ (Bergou §5.4).',
    first: 'q14-neumark:b1',
  },
  {
    id: 'qc-unambiguous-discrimination',
    term: 'unambiguous discrimination',
    gloss: 'Telling two states apart with a measurement that is never wrong but sometimes answers “don’t know”.',
    formal: 'USD: $E_1|\\psi_2\\rangle = E_2|\\psi_1\\rangle = 0$, success $1 - |\\langle\\psi_1|\\psi_2\\rangle|$ at equal priors (Bergou §5.5.1).',
    first: 'q14-usd:b1',
  },
  {
    id: 'qc-inconclusive-outcome',
    term: 'inconclusive outcome',
    gloss: 'The “don’t know” result $E_0$ — not an error, just no conclusion.',
    formal: '$E_0 = I - E_1 - E_2 \\ge 0$ (Bergou Eq. 5.34; N&C $E_3$, Eq. 2.120); fires for either state.',
    first: 'q14-usd:b2',
    introduces: 'notation',
  },
  {
    id: 'qc-prior',
    term: 'prior',
    gloss: 'How likely each state was to be sent, before any measurement.',
    formal: 'The a priori probability $\\eta_i$, $\\sum_i\\eta_i = 1$ (Bergou §5.5.1).',
    first: 'q14-usd:b1',
  },
  {
    id: 'qc-minimum-error-discrimination',
    term: 'minimum-error discrimination',
    gloss: 'Always guessing, with the fewest possible mistakes, when “don’t know” is not allowed.',
    formal: 'A two-outcome POVM $E_1 + E_2 = I$ minimising $P_{\\mathrm{err}}$ (Bergou §5.5.2).',
    first: 'q14-min-error:b1',
  },
  {
    id: 'qc-helstrom-bound',
    term: 'Helstrom bound',
    gloss: 'The smallest error rate any measurement can reach when telling two states apart.',
    formal: '$P_E = \\tfrac12(1 - \\lVert\\eta_2\\rho_2 - \\eta_1\\rho_1\\rVert_1)$ (Bergou Eq. 5.58); pure form $\\tfrac12(1 - \\sqrt{1 - 4\\eta_1\\eta_2|\\langle\\psi_1|\\psi_2\\rangle|^2})$.',
    first: 'q14-min-error:b2',
    introduces: 'notation',
  },
]
