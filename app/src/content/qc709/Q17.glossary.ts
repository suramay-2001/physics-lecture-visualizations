/**
 * Chapter Q17 glossary (Physics 709; P-Q17-story §5), merged into the lazy course pack by file name (pack.ts). Every entry has a Ground-up
 * sentence (`gloss`, ≤ 25 words) and a Formal one (`formal`, ≤ 40), paraphrased. Ids start `qc-` (the "gloss at first use" lint,
 * content/symbols.test.ts). `introduces` marks the two notation beats (interface change W-709 #12): the Grover step and the Grover plane,
 * each introduced by exactly one beat of this chapter (content.test.tsx).
 *
 * Reused without a new entry here: qc-oracle and qc-phase-oracle (Q5 owns the oracle and its phase form), qc-walsh-hadamard (Q5), and
 * the Spin Lab glosses bloch-sphere and global-phase (named by their 448 ids).
 */
import type { GlossEntry } from '../schema'

export const GLOSSARY: GlossEntry[] = [
  {
    id: 'qc-search-problem',
    term: 'unstructured search',
    gloss: 'Finding the one string a black box marks, when the strings come in no order you can use.',
    formal: 'Given $f$ with a unique $x_0$ such that $f(x_0) = 1$, find $x_0$ (Bergou eq. 7.13); classically a number of queries of order $N$ is needed.',
    first: 'q17-oracle:b1',
  },
  {
    id: 'qc-marked-item',
    term: 'marked item',
    gloss: 'The one string the box answers 1 for; the oracle flips the sign of its amplitude.',
    formal: 'The solution $x_0$; the marking oracle is $U_f = I - 2|x_0\\rangle\\langle x_0|$ (Bergou eq. 7.14).',
    first: 'q17-oracle:b2',
  },
  {
    id: 'qc-grover-iterate',
    term: 'Grover step',
    gloss: 'Mark the item, put an H on every wire, flip every string except the all-zero one, and put an H on every wire again.',
    formal: '$Q = -U_HU_0U_HU_f$ with $U_0 = I - 2|0\\rangle\\langle0|$ and $U_H = H^{\\otimes n}$ (Bergou p. 121); N&C call it the Grover iteration $G$ (p. 250).',
    first: 'q17-oracle:b3',
    introduces: 'notation',
  },
  {
    id: 'qc-grover-plane',
    term: 'Grover plane',
    gloss: 'The flat picture spanned by the marked string and the even mix of all the others; the whole search stays inside it.',
    formal: 'The set of $c_1|w_0\\rangle + c_2|x_0\\rangle$ with real $c_1, c_2$, drawn on the axes $|x_0^\\perp\\rangle$ and $|x_0\\rangle$ at right angles (Bergou p. 121).',
    first: 'q17-plane:b1',
    introduces: 'space',
    bridge: 'qc-l7-two-angles',
  },
  {
    id: 'qc-reflection',
    term: 'reflection',
    gloss: 'A mirror map: it keeps every point of one line and flips the direction at right angles to it.',
    formal: '$R = I - 2|u\\rangle\\langle u|$ on the plane, the reflection about the line at right angles to $|u\\rangle$; $\\det R = -1$.',
    first: 'q17-two-reflections:b1',
    bridge: 'qc-f3-matrix-of-map',
  },
  {
    id: 'qc-two-reflections',
    term: 'two reflections make a rotation',
    gloss: 'Two mirrors meeting at angle $\\alpha$, used one after the other, turn every point by $2\\alpha$.',
    formal: '$R_{M_2}R_{M_1} = R(2\\angle(M_1, M_2))$ (Bergou Theorem 1, p. 122).',
    first: 'q17-two-reflections:b3',
  },
  {
    id: 'qc-amplitude-amplification',
    term: 'amplitude amplification',
    gloss: 'Growing the marked part of a state, one turn at a time, by repeating the same two mirrors.',
    formal: '$Q^k|w_0\\rangle$ with $\\sin\\alpha = \\sqrt{M/N}$ gives $P_k = \\sin^2((2k+1)\\alpha)$ for $M$ marked strings (N&C eq. 6.12).',
    first: 'q17-iterate:b4',
  },
  {
    id: 'qc-inversion-about-mean',
    term: 'inversion about the mean',
    gloss: 'Reflecting every bar about the average bar, so a bar below the average jumps above it.',
    formal: '$D = 2|w_0\\rangle\\langle w_0| - I$ sends $a_x$ to $2\\bar a - a_x$, where $\\bar a$ is the mean amplitude (N&C eq. 6.7).',
    first: 'q17-iterate:b2',
  },
  {
    id: 'qc-overshoot',
    term: 'overshoot',
    gloss: 'Turning past the target, so the chance of the marked string falls again.',
    formal: '$P_k$ is periodic in $k$ because $Q$ is a rotation; steps beyond $k^*$ lower it.',
    first: 'q17-iterate:b5',
  },
  {
    id: 'qc-bbbv-bound',
    term: 'the square-root lower bound',
    gloss: 'No search method finds a marked item with fewer questions than a fixed multiple of $\\sqrt N$.',
    formal: 'Bennett\u2013Bernstein\u2013Brassard\u2013Vazirani: any algorithm needs $k = \\Omega(\\sqrt N)$ oracle calls (Bergou eqs. 7.19\u20137.29).',
    first: 'q17-optimal:b1',
  },
]
