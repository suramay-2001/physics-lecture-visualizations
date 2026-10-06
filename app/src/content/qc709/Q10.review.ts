/**
 * Chapter Q10 review cards: the exam layer in both tracks (P-Q10-story §6). Ground-up ≤ 25 words per sentence, Formal
 * ≤ 40; ≤ 5 points each. Every displayed number comes from Q10.values.ts and is backed by a keyed claim.
 */
import type { ReviewCard } from '../schema'
import { V, cChiS, cHalf, cNCS, cThird, cTsirelson, d } from './Q10.values'

export const Q10_REVIEW: Record<string, ReviewCard> = {
  'q10-separable': {
    points: [
      'A separable state is a coin mixture of products.',
      'Its correlations are only classical.',
      'The coin box and $\\Phi^+$ share $z$ statistics but differ in $x$.',
      "Flip Bob's index: a negative chance means entangled.",
    ],
    equations: '\\rho_{AB} = \\sum_kp_k\\,\\rho_A^k\\otimes\\rho_B^k,\\quad \\rho^{T_B} \\ge 0 \\text{ (separable)}',
    trap: 'Thinking the same $z$ correlation means the same state: the box and $\\Phi^+$ agree in $z$ but differ in $x$ and $y$.',
    claims: [cThird, cHalf],
    formal: {
      points: [
        '$\\rho = \\sum_kp_k\\,\\rho_A^k\\otimes\\rho_B^k$; LOCC makes these, never entanglement.',
        'Separable $\\Rightarrow$ PPT; for two qubits PPT $\\Rightarrow$ separable.',
        '$\\rho_{\\Phi^+}^{T_B}$ has an eigenvalue $-\\tfrac12$.',
      ],
      trap: 'Assuming matching $z$ statistics force a matching state.',
    },
  },
  'q10-no-signal': {
    points: [
      'Measuring one half of $\\Phi^+$ jumps the other, but Bob cannot see it.',
      'Averaged over Alice\'s outcomes, Bob is $\\tfrac12I$.',
      'This holds for any axis Alice picks.',
      'So entanglement sends no message.',
    ],
    equations: '\\rho_B = \\mathrm{Tr}_A\\rho = \\tfrac12I',
    trap: 'Thinking the collapse itself is a signal: the jump is real but invisible until a classical call arrives.',
    claims: [cHalf],
    formal: {
      points: [
        '$\\rho_B = \\mathrm{Tr}_A\\rho = \\tfrac12I$, with or without Alice\'s measurement.',
        '$\\sum_jp_j\\rho_B^{(j)} = \\mathrm{Tr}_A\\rho$ for every basis.',
        "Bergou's interference scheme fails for the same reason.",
      ],
      trap: 'Treating the collapse as a message: it is real but statistically invisible to Bob.',
    },
  },
  'q10-hidden': {
    points: [
      'A local hidden-variable model gives each particle a card of fixed answers.',
      "It is Chapter Q7's idea, now for averages.",
      'The combination $X = a_1(b_1 + b_2) + a_2(b_1 - b_2) = \\pm2$.',
      'So every card scores $|X| = 2$.',
    ],
    equations: 'X = a_1(b_1 + b_2) + a_2(b_1 - b_2) = \\pm2',
    trap: 'Thinking one run refutes it: no single CHSH run is impossible for a card; only the average betrays it.',
    formal: {
      points: [
        '$P(a_1, a_2, b_1, b_2)$ with values $\\pm1$; local.',
        'One of $b_1 \\pm b_2$ is 0, so $X = \\pm2$.',
        "Unlike Mermin's single-run clash, this is statistical.",
      ],
      trap: 'Confusing a statistical refutation with a single-run one.',
    },
  },
  'q10-chsh': {
    points: [
      'The correlator averages the product of two readings.',
      '$S$ adds four correlators in a set pattern.',
      'A classical story caps $S$ at 2.',
      'This ceiling $|S| \\le 2$ is a Bell inequality.',
    ],
    equations: 'S = \\langle a_1b_1\\rangle + \\langle a_1b_2\\rangle + \\langle a_2b_1\\rangle - \\langle a_2b_2\\rangle,\\ |S| \\le 2',
    trap: "Confusing this $S$ with Chapter Q9's entropy $S(\\rho)$: different quantity, same letter.",
    formal: {
      points: [
        '$\\langle ab\\rangle = \\sum ab\\,P(a, b)$.',
        '$S = \\langle a_1b_1\\rangle + \\langle a_1b_2\\rangle + \\langle a_2b_1\\rangle - \\langle a_2b_2\\rangle$.',
        '$|S| = |\\sum P\\,X| \\le 2$.',
      ],
      trap: 'Writing the CHSH $S$ and the entropy $S(\\rho)$ as if they were the same quantity.',
    },
  },
  'q10-violation': {
    points: [
      `The entangled $\\chi$ scores ${d(V.q10ChiS, 3)}, above the classical 2.`,
      'A product state never beats 2, so a violation proves entanglement.',
      `Quantum mechanics itself stops at ${d(V.q10Tsirelson, 3)} (Tsirelson).`,
      'A stronger "PR box" would still send no signal, but nature has none.',
    ],
    equations: `S_\\chi = 2\\sqrt2,\\quad \\|C\\| \\le ${d(V.q10Tsirelson, 3)}`,
    trap: `Thinking quantum mechanics can reach $S = 4$: only the unphysical PR box does; nature stops at ${d(V.q10Tsirelson, 3)}.`,
    claims: [cChiS, cTsirelson, cNCS],
    formal: {
      points: [
        `$S_\\chi = ${d(V.q10ChiS, 3)}$ with $x, y$ settings.`,
        'Product (and separable) states obey $S \\le 2$.',
        `$C^2 = 4I - [a_1, a_2]\\otimes[b_1, b_2] \\le 8I$, so $\\|C\\| \\le ${d(V.q10Tsirelson, 3)}$.`,
      ],
      trap: 'Assuming more entanglement can push $S$ past the Tsirelson bound.',
    },
  },
}
