/**
 * Chapter Q16 review cards: the exam layer in both tracks (P-Q16-story §6). Ground-up ≤ 25 words per sentence, Formal ≤ 40; ≤ 5 points each.
 * Every displayed number comes from Q16.values.ts and is backed by a keyed claim.
 */
import type { ReviewCard } from '../schema'
import { V, claim, close, d } from './Q16.values'

export const Q16_REVIEW: Record<string, ReviewCard> = {
  'q16-hadamard-n': {
    points: [
      'One Hadamard gate puts a sign only on $|1\\rangle$: the input $|1\\rangle$ gives a minus sign in front of $|1\\rangle$.',
      'On $n$ wires the string $|z\\rangle$ gets the sign $(-1)^{x\\cdot z}$ and the size $2^{-n/2}$.',
      'Two columns of Hadamards return the starting string, because the signs cancel everywhere else.',
      'For $x = 101$, four of the eight strings get a minus sign, and the signs average to zero.',
    ],
    equations: 'H^{\\otimes n}|x\\rangle = 2^{-n/2}\\sum_z(-1)^{x\\cdot z}|z\\rangle',
    trap: 'Reading $x\\cdot z$ as the number of matching bits: it keeps only whether the number of places where both strings have a 1 is odd.',
    claims: [claim('q16MinusCount', 'four of the eight strings $z$ have $101\\cdot z = 1$', () => close(V.q16MinusCount, 4, 1e-9))],
    formal: {
      points: [
        '$H^{\\otimes n}|x\\rangle = 2^{-n/2}\\sum_z(-1)^{x\\cdot z}|z\\rangle$ with $x\\cdot z = \\sum_jx_jz_j \\bmod 2$ (Bergou Eqs. 7.1–7.2).',
        '$\\sum_x(-1)^{x\\cdot z} = 2^n\\delta_{z,0}$ (Eqs. 7.10–7.11): pair the terms with $x_k = 0$ and $x_k = 1$ for any $k$ with $z_k = 1$.',
        'Hence $(H^{\\otimes n})^2 = I$. For $x \\neq 0$ exactly $2^{n-1}$ strings carry a minus sign, so the mean amplitude is 0.',
      ],
      trap: 'Reading $x\\cdot z$ as a count of matching bits instead of the parity of $\\sum_jx_jz_j$.',
    },
  },
  'q16-dj': {
    points: [
      'A target in $|-\\rangle$ turns the query into signs on the strings.',
      'The last Hadamards make the $|000\\rangle$ amplitude the average of those signs.',
      'A balanced $f$ gives 0 and a constant $f$ gives $+1$ or $-1$, so one reading decides.',
      `For our balanced $f$ the chance of $000$ is 0 and the chance of each of four other strings is $${d(V.q16DjBalnP, 2)}$.`,
    ],
    equations: '\\langle0|\\psi_{\\text{out}}\\rangle = 2^{-n}\\sum_x(-1)^{f(x)}',
    trap: 'Expecting every balanced $f$ to land on one string: only a linear $f$ does.',
    claims: [
      claim('q16DjBalnZero', 'a balanced $f$ gives $000$ chance 0', () => close(V.q16DjBalnZero, 0, 1e-9)),
      claim('q16DjBalnP', 'each of four strings has chance $0.25$', () => close(V.q16DjBalnP, 0.25, 1e-9)),
    ],
    formal: {
      points: [
        'Fig. 7.1: $H^{\\otimes n}$, the f-CNOT with a target in $|-\\rangle$, $H^{\\otimes n}$; kickback gives $|\\psi_2\\rangle = 2^{-n/2}\\sum_x(-1)^{f(x)}|x\\rangle$ (Eqs. 7.4–7.5).',
        '$\\langle0|\\psi_{\\text{out}}\\rangle = 2^{-n}\\sum_x(-1)^{f(x)}$ (Eq. 7.7): 0 for balanced $f$, $(-1)^{f(0)}$ for constant $f$.',
        'All zeros means constant, any other string means balanced: one query, no error.',
      ],
      trap: 'Expecting a balanced $f$ always to land on one string: only a linear $f(x) = a\\cdot x$ gives $|a\\rangle$.',
    },
  },
  'q16-classical-cost': {
    points: [
      'A classical query reads one bit, and the query cost counts the queries in the worst case.',
      `A computer that must never err needs $2^{n-1}+1$ queries, which is ${V.q16DetWorst3} for $n = 3$.`,
      `Random queries with a tiny error chance need a handful: ten queries are fooled with chance only $${d(V.q16Miss1024k10, 4)}$.`,
      'So the exponential gap is against exact classical algorithms only.',
    ],
    equations: '2^{n-1} + 1',
    trap: 'Calling Deutsch–Jozsa a practical exponential speed-up: allow a small error and a classical computer keeps up.',
    claims: [
      claim('q16DetWorst3', 'five queries are needed for $n = 3$', () => close(V.q16DetWorst3, 5, 1e-9)),
      claim('q16Miss1024k10', 'ten random queries with $N = 1024$ are fooled with chance $0.0019$', () => close(V.q16Miss1024k10, 0.0018683827034757863, 1e-9)),
    ],
    formal: {
      points: [
        `Exact (zero-error) classical cost: $2^{n-1}+1$; an adversary answers the first $2^{n-1}$ queries alike (Bergou p. 117). An exact minimax confirms ${V.q16MinimaxN3} for $n = 3$.`,
        'Bounded-error cost: $k$ distinct random queries miss a balanced $f$ with probability $2\\binom{N/2}{k}/\\binom{N}{k}$, about $2^{1-k}$ when $N$ is much larger than $k$ (N&C p. 36, Exercise 1.1).',
        'The separation is exact against zero-error classical algorithms in the query model, and constant against bounded-error ones.',
      ],
      trap: 'Quoting $2^{n-1}+1$ against $1$ without saying that it is the zero-error model.',
    },
  },
  'q16-bv': {
    points: [
      'The function $f = a\\cdot x \\oplus b$ hides a string $a$ and a bit $b$.',
      'One query returns $a$: the output is $|a\\rangle$ times the sign $(-1)^b$.',
      'The sign $(-1)^b$ is an overall sign, which no reading can see, so $b$ stays hidden.',
      `Classically, ${V.q16BvClassical} queries are used for $n = 4$: one for $b$ and one for each bit of $a$.`,
    ],
    equations: '|\\text{out}\\rangle = (-1)^b|a\\rangle',
    trap: 'Thinking Bernstein–Vazirani also learns $b$: it is a global sign and no measurement can see it.',
    claims: [claim('q16BvClassical', 'Bergou’s classical method asks 5 queries for $n = 4$', () => close(V.q16BvClassical, 5, 1e-9))],
    formal: {
      points: [
        '$|\\text{out}\\rangle = 2^{-n}\\sum_{x,y}(-1)^{(a\\cdot x)\\oplus b}(-1)^{x\\cdot y}|y\\rangle = (-1)^b|a\\rangle$, since the Walsh sum keeps only $y = a$ (Eq. 7.9 and Eq. 7.12).',
        '$|\\psi_2\\rangle = (-1)^bH^{\\otimes n}|a\\rangle$, and $(H^{\\otimes n})^2 = I$; a global phase is unobservable.',
        'Classically at least $n$ queries are needed, and Bergou’s method uses $n + 1$ (p. 120).',
      ],
      trap: 'Thinking the algorithm also learns $b$: it appears only as the global sign $(-1)^b$.',
    },
  },
}
