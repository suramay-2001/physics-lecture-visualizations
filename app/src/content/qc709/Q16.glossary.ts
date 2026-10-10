/**
 * Chapter Q16 glossary (Physics 709; P-Q16-story §5), merged into the lazy course pack by file name (pack.ts). Every entry has a Ground-up
 * sentence (`gloss`, ≤ 25 words) and a Formal one (`formal`, ≤ 40), paraphrased. Ids start `qc-` (the "gloss at first use" lint,
 * content/symbols.test.ts). `introduces` marks the one notation beat (interface change W-709 #12): the bit dot product, introduced by
 * exactly one beat of this chapter (content.test.tsx).
 *
 * Reused without a new entry here: qc-hadamard (Q2), qc-walsh-hadamard, qc-constant, qc-balanced, qc-query, qc-phase-kickback,
 * qc-phase-oracle (Q5), qc-xor (Q4), and the Spin Lab gloss global-phase (named by its 448 id).
 */
import type { GlossEntry } from '../schema'

export const GLOSSARY: GlossEntry[] = [
  {
    id: 'qc-bit-dot',
    term: 'bit dot product',
    gloss: 'Multiply matching bits of two strings, add the products, and keep only whether the total is odd.',
    formal: '$x\\cdot z = \\sum_j x_jz_j \\bmod 2$, the parity of the number of places where both strings have a 1.',
    first: 'q16-hadamard-n:b2',
    introduces: 'notation',
  },
  {
    id: 'qc-promise-problem',
    term: 'promise problem',
    gloss: 'A question whose input is guaranteed to be one of a few kinds, so nothing else needs an answer.',
    formal: 'A decision problem defined only on inputs that satisfy a promise, here that $f$ is constant or balanced.',
    first: 'q16-dj:b1',
  },
  {
    id: 'qc-deutsch-jozsa',
    term: 'Deutsch–Jozsa algorithm',
    gloss: 'One query, framed by two columns of Hadamards, tells a constant $n$-bit function from a balanced one.',
    formal: '$H^{\\otimes n}$, $U_f$, $H^{\\otimes n}$ on $|0\\cdots0\\rangle$; the all-zeros outcome means constant (Bergou eq. 7.7).',
    first: 'q16-dj:b1',
  },
  {
    id: 'qc-query-cost',
    term: 'query cost',
    gloss: 'How many times an algorithm must ask the black box, counted in the worst case.',
    formal: 'The number of oracle calls an algorithm needs on its worst input, counted exactly or with a bounded error.',
    first: 'q16-classical-cost:b1',
  },
  {
    id: 'qc-bounded-error',
    term: 'bounded error',
    gloss: 'An algorithm that may be wrong, but only with a small chance that stays fixed.',
    formal: 'Success probability at least $1 - \\varepsilon$ on every input, for a fixed $\\varepsilon < \\tfrac12$.',
    first: 'q16-classical-cost:b2',
  },
  {
    id: 'qc-bernstein-vazirani',
    term: 'Bernstein–Vazirani algorithm',
    gloss: 'The same circuit reads a hidden string $a$ out of the function $a\\cdot x \\oplus b$ in a single query.',
    formal: 'Applied to $f(x) = a\\cdot x \\oplus b$ the Deutsch–Jozsa circuit outputs $(-1)^b|a\\rangle$ (Bergou eq. 7.12).',
    first: 'q16-bv:b1',
  },
  {
    id: 'qc-hidden-string',
    term: 'hidden string',
    gloss: 'The unknown bits $a$ that the linear function $a\\cdot x \\oplus b$ keeps out of sight.',
    formal: 'The string $a \\in \\{0,1\\}^n$ in $f(x) = a\\cdot x + b \\pmod 2$.',
    first: 'q16-bv:b1',
  },
]
