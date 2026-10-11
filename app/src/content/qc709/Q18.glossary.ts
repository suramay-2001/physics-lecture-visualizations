/**
 * Chapter Q18 glossary (Physics 709; P-Q18-story §5), merged into the lazy course pack by file name (pack.ts). Every entry has a Ground-up
 * sentence (`gloss`, ≤ 25 words) and a Formal one (`formal`, ≤ 40), paraphrased. Ids start `qc-` (the "gloss at first use" lint, content/symbols.test.ts).
 * `introduces` marks the five notation beats (interface change W-709 #12): the strings s⊥, the quantum Fourier transform, the controlled turns R_k, the
 * eigenphase and order finding, each introduced by exactly one beat of this chapter (content.test.tsx).
 *
 * Reused without a new entry here: qc-promise-problem and qc-bit-dot (Q16), qc-phase-kickback (Q5), qc-grover-iterate and qc-grover-plane (Q17),
 * qc-eigenvector (Q3), qc-gf2 and qc-xor (F7, Q4), and the Spin Lab gloss relative-phase.
 */
import type { GlossEntry } from '../schema'

export const GLOSSARY: GlossEntry[] = [
  {
    id: 'qc-simon-problem',
    term: 'Simon’s problem',
    gloss: 'A box answers alike for exactly the pairs of inputs that differ by one secret string $s$; find $s$.',
    formal: '$f$ is 2-to-1 on $\\{0,1\\}^n$ with $f(x) = f(y) \\Leftrightarrow y \\in \\{x, x \\oplus s\\}$ (Bergou eq. 7.30); find $s \\ne 0$ with poly($n$) queries.',
    first: 'q18-simon:b1',
    bridge: 'qc-f7-xor',
  },
  {
    id: 'qc-s-perp',
    term: 'the strings perpendicular to $s$',
    gloss: 'The strings whose bit dot product with $s$ is 0; there are half of all strings, and they are all that Simon’s circuit ever reads.',
    formal: '$s^\\perp = \\{y : y \\cdot s = 0\\}$, a subspace of dimension $n - 1$ over $\\mathrm{GF}(2)$, with $2^{n-1}$ strings (Bergou eq. 7.33).',
    first: 'q18-simon:b3',
    introduces: 'notation',
    bridge: 'qc-f7-gf2',
  },
  {
    id: 'qc-qft',
    term: 'quantum Fourier transform',
    gloss: 'The gate that Fourier-transforms a register’s amplitudes: the number $a$ goes to an even spread, turned by $a$ times the string.',
    formal: '$U_F|a\\rangle = 2^{-m/2}\\sum_y e^{2\\pi iay/2^m}|y\\rangle$, which is $F_{2^m}$ on amplitudes (Bergou eq. 7.34, prefactor corrected; N&C eq. 5.2).',
    first: 'q18-qft:b1',
    introduces: 'notation',
    bridge: 'qc-f8-dft',
  },
  {
    id: 'qc-qft-product-form',
    term: 'product form of the QFT',
    gloss: 'Each output wire gets its own turn, the binary fraction of the last few digits of the input.',
    formal: '$U_F|a\\rangle = \\bigotimes_l(|0\\rangle + e^{2\\pi i\\,0{.}a_{m-l+1}\\cdots a_m}|1\\rangle)/\\sqrt2$, wire $l$ counted from the top (N&C eq. 5.4).',
    first: 'q18-qft:b3',
    bridge: 'qc-f8-fractions',
  },
  {
    id: 'qc-controlled-rk',
    term: 'controlled turns',
    gloss: 'A turn by one over $2^k$ of a circle on $|1\\rangle$, done only when the control reads 1; S and T are two of them.',
    formal: '$R_k = \\mathrm{diag}(1, e^{2\\pi i/2^k}) = P(2\\pi/2^k)$, so $R_2 = S$ and $R_3 = T$ (N&C eq. 5.11).',
    first: 'q18-qft:b4',
    introduces: 'notation',
  },
  {
    id: 'qc-eigenphase',
    term: 'eigenphase',
    gloss: 'The fraction $\\tau$ of a full turn by which a gate multiplies one of its special states; the angle of that turn is $2\\pi\\tau$.',
    formal: '$U|u\\rangle = e^{i\\varphi}|u\\rangle$ with $\\varphi = 2\\pi\\tau$ and $0 \\le \\tau < 1$, so $\\tau$ counts the turn in full turns (Bergou p. 127).',
    first: 'q18-kickback:b1',
    introduces: 'notation',
    bridge: 'qc-f4-unitary',
  },
  {
    id: 'qc-phase-estimation',
    term: 'phase estimation',
    gloss: 'Reading a gate’s eigenphase digit by digit, with controlled powers of the gate and a backwards Fourier transform.',
    formal: 'Hadamards, controlled $U^{2^j}$ and $U_F^{-1}$ read $\\tau$ to $m$ bits; the nearest answer has chance at least $4/\\pi^2$ (Bergou eq. 7.43).',
    first: 'q18-phase-est:b1',
    bridge: 'qc-f8-geometric',
  },
  {
    id: 'qc-quantum-counting',
    term: 'quantum counting',
    gloss: 'Counting the marked items from the turn of one Grover step, which phase estimation reads.',
    formal: 'Phase estimation of $Q$ on $|w_0\\rangle$ reads $a_\\pm/2^m \\approx \\alpha/\\pi, 1 - \\alpha/\\pi$, so $M = N\\sin^2(\\pi a/2^m)$ (Bergou p. 130; N&C §6.3).',
    first: 'q18-counting:b3',
  },
  {
    id: 'qc-order-finding',
    term: 'order finding',
    gloss: 'Finding how many times a number must be multiplied by itself, mod $N$, to return to 1, using the gate that multiplies by it.',
    formal: '$U_x|y\\rangle = |xy \\bmod N\\rangle$ has eigenphases $s/r$, with $r$ the order of $x$ (N&C eqs. 5.36–5.39).',
    first: 'q18-order:b1',
    introduces: 'notation',
    bridge: 'qc-f8-euclid',
  },
  {
    id: 'qc-hidden-subgroup',
    term: 'hidden subgroup problem',
    gloss: 'Finding the shifts that leave a function unchanged, from samples of a Fourier transform.',
    formal: '$f$ is constant and distinct on the cosets of a subgroup $K \\subseteq G$; find $K$ (N&C Fig. 5.5, eq. 5.77).',
    first: 'q18-order:b4',
  },
]
