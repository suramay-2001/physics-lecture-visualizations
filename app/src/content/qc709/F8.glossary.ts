/**
 * Chapter F8's glossary (plan: docs/roles/proposals/P-F8-story.md §5), in both tracks: `gloss` is one Ground-up sentence (≤ 25 words), `formal` one
 * Formal sentence (≤ 40), paraphrased. Ids start `qc-` (709's namespace); the "gloss at first use" lint (content/symbols.test.ts) reads them.
 *
 * All eleven ids are new (checked against the glossaries of F1–F7 and Q1–Q17 and 448's). F1's ideas (e^{iφ}, phasors, interference), F4's unitarity and F7's
 * XOR and GF(2) are reached by bridge chips, not relinked as terms. `introduces` marks the notation each introducing beat brings (interface change W-709 #12).
 */
import type { GlossEntry } from '../schema'

export const GLOSSARY: GlossEntry[] = [
  {
    id: 'qc-congruence',
    term: 'congruence mod $N$',
    gloss: 'Two whole numbers that leave the same remainder after dividing by $N$.',
    formal: '$a \\equiv b \\pmod N$ if and only if $N$ divides $a - b$ (N&C p. 626).',
    first: 'f8-clock:b1',
    introduces: 'notation',
  },
  {
    id: 'qc-period',
    term: 'period',
    gloss: 'The step after which a list repeats itself exactly.',
    formal: 'The least $r > 0$ with $f(x + r) = f(x)$ for every whole $x$.',
    first: 'f8-clock:b2',
    introduces: 'notation',
  },
  {
    id: 'qc-gcd',
    term: 'greatest common divisor',
    gloss: 'The largest whole number that divides both of two numbers.',
    formal: '$\\gcd(a, b)$, which is also the least positive value of $ax + by$ (N&C p. 626).',
    first: 'f8-euclid:b1',
    introduces: 'notation',
  },
  {
    id: 'qc-modular-inverse',
    term: 'inverse mod $N$',
    gloss: 'The number that undoes multiplying by $a$ on a clock of $N$ marks.',
    formal: '$a^{-1}$ with $aa^{-1} \\equiv 1 \\pmod N$; it exists exactly when $\\gcd(a, N) = 1$ (N&C p. 627).',
    first: 'f8-euclid:b2',
    introduces: 'notation',
  },
  {
    id: 'qc-multiplicative-order',
    term: 'order mod $N$',
    gloss: 'How many times you multiply by $x$, mod $N$, to get back to 1.',
    formal: 'The least $r > 0$ with $x^r \\equiv 1 \\pmod N$ (N&C p. 633).',
    first: 'f8-euclid:b3',
    introduces: 'notation',
  },
  {
    id: 'qc-root-of-unity',
    term: 'root of unity',
    gloss: 'An arrow of length 1 that comes back to 1 after $N$ equal turns.',
    formal: '$\\omega^k$ with $\\omega = e^{2\\pi i/N}$, the $N$ roots of $z^N = 1$.',
    first: 'f8-roots:b1',
    introduces: 'notation',
  },
  {
    id: 'qc-dft',
    term: 'discrete Fourier transform',
    gloss: 'A table of arrows that turns a list into its rhythms.',
    formal: '$(F_N)_{kj} = \\omega^{jk}/\\sqrt N$, a unitary matrix (N&C p. 217).',
    first: 'f8-dft:b1',
    introduces: 'notation',
  },
  {
    id: 'qc-geometric-series',
    term: 'geometric sum',
    gloss: 'A sum in which each term is a fixed multiple of the one before.',
    formal: '$\\sum_{t<M}u^t = (1 - u^M)/(1 - u)$ for $u \\ne 1$.',
    first: 'f8-geometric:b1',
  },
  {
    id: 'qc-binary-fraction',
    term: 'binary fraction',
    gloss: 'A number below 1 written in halves, quarters and eighths.',
    formal: '$0{.}d_1d_2\\ldots d_m = \\sum_l d_l2^{-l}$ (N&C p. 218).',
    first: 'f8-fractions:b1',
    introduces: 'notation',
  },
  {
    id: 'qc-continued-fraction',
    term: 'continued fraction',
    gloss: 'A fraction rewritten as whole numbers nested in one-over steps.',
    formal: '$[a_0; a_1, \\ldots, a_n]$, built from the quotients of Euclid’s algorithm (N&C pp. 635–636).',
    first: 'f8-fractions:b3',
    introduces: 'notation',
  },
  {
    id: 'qc-convergent',
    term: 'convergent',
    gloss: 'The simpler fraction you get by stopping a continued fraction early.',
    formal: '$p_l/q_l = [a_0; a_1, \\ldots, a_l]$ (N&C p. 636).',
    first: 'f8-fractions:b3',
  },
]
