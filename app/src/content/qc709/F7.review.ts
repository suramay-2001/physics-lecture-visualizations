/**
 * Chapter F7 review cards: the exam layer in both tracks (P-F7-story §6). Ground-up ≤ 25 words per sentence, Formal ≤ 40; ≤ 5 points each.
 * Every displayed number comes from F7.values.ts and is backed by a keyed claim.
 */
import type { ReviewCard } from '../schema'
import { V, claim, close, d } from './F7.values'

export const F7_REVIEW: Record<string, ReviewCard> = {
  'f7-boolean': {
    points: [
      'A function of bits is a table: every input string with its output bit.',
      `With $n$ input bits the table has $2^n$ rows, so there are $2^{2^n}$ functions: ${V.f7Funcs3} for three bits.`,
      `Few are constant or balanced: of those ${V.f7Funcs3}, only ${V.f7Const} are constant and ${V.f7Balanced3} are balanced.`,
      'NAND alone builds NOT, AND and OR, and so every table.',
    ],
    equations: '2^{2^n}',
    trap: `Thinking most functions are constant or balanced: for three bits, ${V.f7Neither3} of ${V.f7Funcs3} are neither.`,
    claims: [
      claim('f7Funcs3', 'three bits give 256 functions', () => V.f7Funcs3 === 256),
      claim('f7Const', 'two of them are constant', () => V.f7Const === 2),
      claim('f7Balanced3', 'seventy are balanced', () => V.f7Balanced3 === 70),
      claim('f7Neither3', '184 are neither', () => V.f7Neither3 === 184),
    ],
    formal: {
      points: [
        '$f : \\{0,1\\}^n \\to \\{0,1\\}$ is fixed by its truth table of $2^n$ rows (N&C §3.1.2, pp. 129, 132–133).',
        `There are $2^{2^n}$ such functions; 2 are constant and $\\binom{2^n}{2^{n-1}}$ are balanced, which is ${V.f7Balanced3} for $n = 3$.`,
        'NAND is universal: NOT $a$ = NAND$(a, a)$, AND = NOT NAND, OR = NAND(NOT $a$, NOT $b$) (N&C pp. 133–134; N&C ⚑ Ex. 3.8).',
      ],
      trap: `Taking constant and balanced functions for typical ones: for $n = 3$ they are only ${V.f7Const + V.f7Balanced3} of ${V.f7Funcs3}.`,
    },
  },
  'f7-reversible': {
    points: [
      'A reversible gate never merges two inputs onto one output: each output comes from exactly one input.',
      `AND is not reversible: ${V.f7AndZeroPre} inputs give the output 0.`,
      'Any function becomes reversible by keeping $x$ and XOR-ing $f(x)$ into a spare bit $y$. Doing it twice undoes it.',
      'Erasing a bit costs at least $k_BT\\ln 2$ of heat. Uncomputation wipes the scrap bits without erasing anything.',
      `A scrap left on a work wire spoils interference: a test that should read 00 every time reads it with chance ${d(V.f7GarbageP00, 3)}.`,
    ],
    equations: '(x, y) \\mapsto (x, y \\oplus f(x))',
    trap: 'Thinking AND can run backwards if we keep its output: the output 0 still has three possible inputs.',
    claims: [
      claim('f7AndZeroPre', 'three inputs of AND give 0', () => V.f7AndZeroPre === 3),
      claim('f7GarbageP00', 'with garbage the test reads 00 with chance 0.625', () => close(V.f7GarbageP00, 0.625, 1e-9)),
    ],
    formal: {
      points: [
        'Reversible means a bijection of $\\{0,1\\}^n$; its matrix is a permutation matrix, so $P^{\\top}P = I$ and the gate is a real unitary.',
        '$(x, y) \\mapsto (x, y \\oplus f(x))$ is an involution (N&C Eq. 3.8, p. 158); Toffoli gives AND at $c = 0$ and NAND at $c = 1$ (Fig. 3.17, p. 159; Fig. 3.18, p. 160).',
        'Landauer: erasure dissipates at least $k_BT\\ln 2$ per bit (N&C p. 153); uncomputation, Eqs. 3.7–3.8, leaves no garbage.',
        `Garbage on a work wire entangles it with the inputs: the chance of reading 00 falls from 1 to ${d(V.f7GarbageP00, 3)}.`,
      ],
      trap: 'Counting only the answer wire: the work wires must return to 0, or the garbage spoils interference.',
    },
  },
  'f7-xor': {
    points: [
      'XOR adds bits mod 2 with no carry: $1 \\oplus 1 = 0$, and $a \\oplus a = 0$.',
      'On strings XOR works place by place: $1011 \\oplus 0110 = 1101$.',
      'Signs turn XOR into multiplying: $(-1)^{a \\oplus b} = (-1)^a(-1)^b$.',
      'The dot product $a \\cdot x$ keeps whether the number of shared 1s is odd. For $a \\ne 000$ it is 1 for exactly half the strings.',
      `So the signs $(-1)^{a\\cdot x}$ add to 0 for $a \\ne 000$, and to ${V.f7SignSum000} at $a = 000$ (three bits).`,
    ],
    equations: '\\sum_x(-1)^{a\\cdot x} = 2^n\\delta_{a,0}',
    trap: 'Reading $a\\cdot x$ as the number of matching bits: it keeps only whether that number is odd.',
    claims: [claim('f7SignSum000', 'at a = 000 the eight signs add to 8', () => V.f7SignSum000 === 8)],
    formal: {
      points: [
        '$a \\oplus b = a + b \\bmod 2$ and $a \\oplus a = 0$, bitwise on strings (Bergou §7.4, p. 126).',
        '$\\chi(a) = (-1)^a$ turns $(\\{0,1\\}, \\oplus)$ into $(\\{\\pm1\\}, \\times)$.',
        '$a\\cdot x = \\sum_ja_jx_j \\bmod 2$ is linear in $x$ (Bergou Eqs. 7.1–7.2, p. 118).',
        'For $a \\ne 0$, $x \\mapsto x \\oplus e_k$ pairs the strings and flips $a \\cdot x$, so $\\sum_x(-1)^{a\\cdot x} = 2^n\\delta_{a,0}$.',
      ],
      trap: 'Reading $a \\cdot x$ as a count of matching bits instead of the parity of $\\sum_ja_jx_j$.',
    },
  },
  'f7-gf2': {
    points: [
      'Bit strings form a space: add with XOR and scale by 0 or 1. Every string is its own negative.',
      `The weight of a string counts its 1s. The distance of two strings is the weight of their XOR: $d(1011, 0110) = ${V.f7Dist1011To0110}$.`,
      'Parity checks find a single flipped bit: the three checks on seven bits spell its place in binary.',
      'XOR-ing and swapping rows solves bit equations: the checks $001$ and $111$ leave the hidden string $110$.',
      'Independence depends on the numbers: rows tied over bits can be independent over the real numbers.',
    ],
    equations: 'd(x, z) = \\mathrm{wt}(x \\oplus z)',
    trap: 'Carrying real-number independence over to bits: $110$, $011$, $101$ are tied, since $110 \\oplus 011 = 101$.',
    claims: [claim('f7Dist1011To0110', '1011 and 0110 are at distance 3', () => V.f7Dist1011To0110 === 3)],
    formal: {
      points: [
        '$\\mathrm{GF}(2)^n$ has $2^n$ vectors and $-x = x$; $\\mathrm{wt}(x) = \\#\\{j : x_j = 1\\}$ and $d(x, z) = \\mathrm{wt}(x \\oplus z)$ (Bergou §9.2, p. 171).',
        'A check matrix $M$ accepts $c$ if and only if $Mc = 0$. An error $e$ shows as the syndrome $Me$: here $M\\,1110010 = 110$, so place 6.',
        'Elimination over $\\mathrm{GF}(2)$ uses row swaps and row XORs: $\\begin{pmatrix}0&0&1\\\\1&1&1\\end{pmatrix}$ has rank 2 and $\\ker = \\{000, 110\\}$.',
        'Rank depends on the field: the rows $110, 011, 101$ have rank 2 over $\\mathrm{GF}(2)$ and rank 3 over the real numbers, where the determinant is 2.',
      ],
      trap: 'Using the real-number rank for bit rows: an even determinant vanishes mod 2.',
    },
  },
  'f7-cost': {
    points: [
      `Cost counts basic steps as the input grows: sorting 10 names pair by pair takes ${V.f7Sort10} comparisons.`,
      `Big-O keeps the growth and drops constants: $3n^2 + 5n + 7$ is $O(n^2)$, below $4n^2$ from $n = ${V.f7BigOn0}$ on.`,
      'A polynomial like $n^2$ is tame; an exponential like $2^n$ is not. One more bit doubles $2^n$.',
      `Quantum speed-ups are counted in queries: Grover needs ${V.f7Grover2e20} steps for $2^{20}$ items, not about a million.`,
      'The square root of $2^n$ is $2^{n/2}$, still exponential: Grover’s gain is a square root, not an exponential.',
    ],
    equations: 'f = O(g)',
    trap: 'Calling a search that costs $\\sqrt N$ queries an exponential speed-up.',
    claims: [
      claim('f7Sort10', 'sorting 10 names pair by pair takes 45 comparisons', () => V.f7Sort10 === 45),
      claim('f7BigOn0', 'the bound holds from n = 7', () => V.f7BigOn0 === 7),
      claim('f7Grover2e20', 'Grover needs 804 steps for 2²⁰ items', () => V.f7Grover2e20 === 804),
    ],
    formal: {
      points: [
        '$f = O(g)$ means $f(n) \\le c\\,g(n)$ for $n \\ge n_0$; $\\Omega$ and $\\Theta$ are the lower and two-sided versions (N&C pp. 136–137).',
        '$3n^2 + 5n + 7 \\le 4n^2$ for $n \\ge 7$. Polynomial cost is called efficient, exponential cost is not (N&C pp. 138–139).',
        `Query counts: Deutsch–Jozsa 1 against $2^{n-1} + 1$, which is ${V.f7Dj10} at $n = 10$; Grover $k^* = ${V.f7Grover2e20}$ against $N - 1$ for $N = 2^{20}$.`,
        '$\\sqrt N = 2^{n/2}$ is exponential in $n$: a quadratic speed-up, optimal by the BBBV bound. P, BPP and BQP are named in N&C p. 153.',
      ],
      trap: 'Calling a quadratic speed-up exponential: $\\sqrt N = 2^{n/2}$ is still $2^{\\Theta(n)}$ in $n$.',
    },
  },
}
