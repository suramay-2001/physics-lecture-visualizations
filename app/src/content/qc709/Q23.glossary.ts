/**
 * Chapter Q23 glossary (Physics 709; P-Q23-story §5), merged into the lazy course pack by file name (pack.ts). Every entry has a Ground-up sentence (`gloss`, ≤ 25 words) and a Formal
 * one (`formal`, ≤ 40), paraphrased, one sentence each (a printed equation is cited by page here, because "Eq. 11.1" would split the sentence). Ids start `qc-`. `introduces` marks the three
 * notation beats: the relative entropy $H(p\|q)$ (q23-classical-compare:b4), the mutual information $I(X{:}Y)$ (q23-two-variables:b2) and the Holevo number $\chi$ (q23-holevo:b1), each
 * introduced by exactly one beat of this chapter (content.test.tsx).
 *
 * Reused without a new entry here: qc-shannon-entropy and qc-binary-entropy (F5), qc-von-neumann-entropy, qc-trace-distance and qc-fidelity (Q9), qc-conditional-entropy (Q12: its classical
 * twin is used under the same tag, with a one-line note), qc-maximally-mixed, qc-ensemble and qc-mixture (Q8), qc-helstrom-bound and qc-unambiguous-discrimination (Q14), qc-dense-coding (Q11),
 * and the Spin Lab glosses qubit and ghz-state.
 */
import type { GlossEntry } from '../schema'

export const GLOSSARY: GlossEntry[] = [
  {
    id: 'qc-kolmogorov-distance',
    term: 'classical trace distance',
    gloss: 'Half the total gap between two chance tables.',
    formal: '$D(p,q) = \\tfrac12\\sum_x|p(x) - q(x)|$ is the $L^1$ or Kolmogorov distance of two chance tables, and it is a metric (Bergou p. 190).',
    first: 'q23-classical-compare:b1',
    bridge: 'qc-q9-distance',
  },
  {
    id: 'qc-classical-fidelity',
    term: 'classical fidelity',
    gloss: 'The cosine of the angle between the square-root arrows of two chance tables.',
    formal: '$F(p,q) = \\sum_x\\sqrt{p(x)q(x)}$, where the angle $\\cos^{-1}F$ is a metric and $F$ itself is not (Bergou p. 190).',
    first: 'q23-classical-compare:b3',
  },
  {
    id: 'qc-relative-entropy',
    term: 'relative entropy $H(p\\|q)$',
    gloss: 'How surprised you are, in bits, when the truth is $p$ and you believed $q$.',
    formal: '$H(p\\|q) = \\sum_xp(x)\\log_2\\frac{p(x)}{q(x)} \\ge 0$ is zero only if $p = q$, and it is not symmetric (Bergou p. 191).',
    first: 'q23-classical-compare:b4',
    introduces: 'notation',
    bridge: 'qc-f5-surprise',
  },
  {
    id: 'qc-quantum-relative-entropy',
    term: 'quantum relative entropy',
    gloss: 'The same comparison for two quantum states.',
    formal: '$S(\\rho\\|\\sigma) = \\mathrm{Tr}\\,\\rho(\\log\\rho - \\log\\sigma)$ is $+\\infty$ unless the support of $\\rho$ lies inside that of $\\sigma$ (Bergou p. 48).',
    first: 'q23-quantum-compare:b3',
  },
  {
    id: 'qc-klein-inequality',
    term: 'Klein inequality',
    gloss: 'The rule that relative entropy is never negative.',
    formal: '$S(\\rho\\|\\sigma) \\ge 0$, with equality only for $\\rho = \\sigma$ (Bergou p. 48; N&C p. 511).',
    first: 'q23-quantum-compare:b4',
  },
  {
    id: 'qc-subadditivity',
    term: 'subadditivity',
    gloss: 'The whole is never more uncertain than its two parts added.',
    formal: '$S(\\rho_{AB}) \\le S(\\rho_A) + S(\\rho_B)$ for every state of two systems (Bergou p. 50).',
    first: 'q23-entropy-props:b3',
  },
  {
    id: 'qc-concavity-of-entropy',
    term: 'concavity of entropy',
    gloss: 'Mixing states never gives less entropy than the average of the parts.',
    formal: '$S(\\sum_ip_i\\rho_i) \\ge \\sum_ip_iS(\\rho_i)$ for every mixture of states (Bergou pp. 50–51).',
    first: 'q23-entropy-props:b4',
  },
  {
    id: 'qc-strong-subadditivity',
    term: 'strong subadditivity',
    gloss: 'A deeper entropy rule for three systems, stated here without proof.',
    formal: '$S(\\rho_{ABC}) + S(\\rho_B) \\le S(\\rho_{AB}) + S(\\rho_{BC})$ for every state of three systems (Bergou p. 195; N&C pp. 519–521).',
    first: 'q23-entropy-props:b5',
  },
  {
    id: 'qc-joint-entropy',
    term: 'joint entropy',
    gloss: 'The uncertainty of two variables read together.',
    formal: '$H(X,Y) = -\\sum p(x,y)\\log p(x,y) = H(X) + H(Y|X)$, the entropy of the pair (Bergou p. 193).',
    first: 'q23-two-variables:b1',
  },
  {
    id: 'qc-mutual-information',
    term: 'mutual information $I(X{:}Y)$',
    gloss: 'How much knowing one variable tells you about the other, in bits.',
    formal: '$I(X{:}Y) = H(p_{XY}\\|p_Xp_Y) = H(X) + H(Y) - H(X,Y)$ is symmetric in $X$ and $Y$ (Bergou p. 194).',
    first: 'q23-two-variables:b2',
    introduces: 'notation',
  },
  {
    id: 'qc-channel-capacity',
    term: 'channel capacity',
    gloss: 'The most information per use that a noisy wire can carry.',
    formal: '$C = \\max_{p_X}I(X{:}Y)$ is the largest rate of reliable communication, a coding theorem that Bergou states without proof (p. 194).',
    first: 'q23-two-variables:b3',
  },
  {
    id: 'qc-quantum-mutual-information',
    term: 'quantum mutual information',
    gloss: 'The mutual information of two quantum systems, worked out from their entropies.',
    formal: '$S(A{:}B) = S(\\rho_A) + S(\\rho_B) - S(\\rho_{AB})$ is never raised by discarding a system or by acting locally (Bergou p. 195).',
    first: 'q23-quantum-mutual:b1',
    bridge: 'qc-q12-entropy',
  },
  {
    id: 'qc-holevo-bound',
    term: 'Holevo bound $\\chi$',
    gloss: 'The limit on how much Bob can learn from the states Alice sends.',
    formal: '$I(X{:}Y) \\le \\chi = S(\\rho) - \\sum_xp_xS(\\rho_x)$ holds for every measurement Bob can make (Bergou p. 196).',
    first: 'q23-holevo:b1',
    introduces: 'notation',
  },
  {
    id: 'qc-accessible-information',
    term: 'accessible information',
    gloss: 'The most Bob can learn, over all the measurements he could choose.',
    formal: 'The maximum over POVMs of $I(X{:}Y)$ for a given ensemble is at most $\\chi$, and in general smaller.',
    first: 'q23-holevo:b1',
  },
]
