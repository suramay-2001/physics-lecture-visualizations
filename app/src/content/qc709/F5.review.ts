/**
 * Chapter F5 review cards, both tracks (plan: docs/roles/proposals/P-F5-story.md §6). ≤ 5 points; Ground-up
 * sentences ≤ 25 words, Formal ≤ 40; every number is an F5 claim already used in the story.
 */
import type { ReviewCard } from '../schema'
import { C } from './F5.story'

export const F5_REVIEW: Record<string, ReviewCard> = {
  'f5-probability': {
    points: [
      'The sample space lists the outcomes; a probability is a chance from 0 to 1.',
      'A list of chances adds to 1.',
      'Independent events multiply: two heads is $\\tfrac14$, not added.',
      'A quantum chance is a Born probability $|\\langle a|\\psi\\rangle|^2$.',
    ],
    equations: '\\sum_x P(x) = 1,\\quad P(A\\cap B) = P(A)P(B),\\quad P(a) = |\\langle a|\\psi\\rangle|^2',
    trap: 'Adding chances that should multiply: two sixes is $\\tfrac1{36}$, not $\\tfrac13$.',
    claims: [C.twoCoin, C.twoSix, C.sixOrFive],
    formal: {
      points: [
        '$\\Omega$ is the outcome set, $P(x) \\in [0,1]$, $\\sum_x P(x) = 1$ (Bergou §3.3).',
        '$f_n \\to P$: the law of large numbers ties frequency to chance.',
        '$P(A\\cap B) = P(A)P(B)$ exactly when $A$ and $B$ are independent.',
      ],
      trap: 'Union-or-addition and independent-and-multiplication answer different questions about different trials.',
    },
  },
  'f5-average': {
    points: [
      '$\\langle X\\rangle = \\sum_x x\\,P(x)$: the chance-weighted sum.',
      'It is the long-run average of many readings.',
      'It need not be a possible value: $3.5$ for a fair die, no face shows it.',
      'Expectation is linear: $\\langle aX+b\\rangle = a\\langle X\\rangle + b$.',
    ],
    equations: '\\langle X\\rangle = \\sum_x x\\,P(x),\\quad \\langle aX + b\\rangle = a\\langle X\\rangle + b',
    trap: 'Expecting $\\langle X\\rangle$ to be an outcome. No die face shows $3.5$.',
    claims: [C.dieMean],
    formal: {
      points: [
        '$\\langle X\\rangle = \\sum_x x\\,P(x)$ (Bergou §3.3, p. 35; the notes’ $\\langle M\\rangle = \\sum_\\alpha M_\\alpha P_\\alpha$).',
        '$\\langle aX+b\\rangle = a\\langle X\\rangle + b$, even for dependent sums $\\langle X+Y\\rangle = \\langle X\\rangle + \\langle Y\\rangle$.',
        'For a spin, $\\langle S_z\\rangle = \\tfrac\\hbar2(2p-1)$, the same number Chapter Q3’s operator gives.',
      ],
      trap: 'The expectation is a balance point of the distribution, never a guarantee about any single reading.',
    },
  },
  'f5-spread': {
    points: [
      'The variance is the average squared distance from the mean, $(\\Delta X)^2 = \\langle X^2\\rangle - \\langle X\\rangle^2$.',
      'The standard deviation $\\sigma = \\sqrt{\\mathrm{Var}}$ is in the reading’s own units.',
      'A Binomial count has mean $Np$, variance $Np(1-p)$.',
      'The average of $N$ readings has spread $\\sigma/\\sqrt N$.',
    ],
    equations: '(\\Delta X)^2 = \\langle X^2\\rangle - \\langle X\\rangle^2,\\quad \\Delta\\bar X = \\sigma/\\sqrt N',
    trap: 'Thinking the mean’s spread scales as $\\sigma/N$. Variances scale as $1/N$, so the spread (their square root) scales as $1/\\sqrt N$.',
    claims: [C.dieVar, C.dieSD, C.binMean, C.binVar],
    formal: {
      points: [
        '$(\\Delta X)^2 = \\langle X^2\\rangle - \\langle X\\rangle^2 \\ge 0$: a mean of squares minus a squared mean.',
        '$\\mathrm{Var}(\\bar X) = \\sigma^2/N$ for $N$ independent readings, so $\\Delta\\bar X = \\sigma/\\sqrt N$.',
        'For a spin, $(\\Delta S_z)^2 = \\hbar^2 p(1-p)$, zero at $p=0,1$ and maximal at $p=\\tfrac12$.',
      ],
      trap: 'The $N^2$ in $\\mathrm{Var}(\\bar X) = \\sigma^2 N/N^2$ is easy to drop, turning a $1/\\sqrt N$ law into a false $1/N$ one.',
    },
  },
  'f5-surprise': {
    points: [
      'Information is measured in bits: one bit answers one yes/no question.',
      '$N$ equally likely outcomes carry $\\log_2 N$ bits.',
      '$H = -\\sum_x P(x)\\log_2 P(x)$, the average surprise.',
      'A sure outcome carries no information: $H = 0$.',
    ],
    equations: 'H = -\\sum_x P(x)\\log_2 P(x),\\quad h(p) = -p\\log_2 p - (1-p)\\log_2(1-p)',
    trap: 'Thinking a certain event still carries information. $H = 0$ exactly when $P$ is a point mass.',
    claims: [C.hThreeQuarter, C.hSure],
    formal: {
      points: [
        '$H = -\\sum_x P(x)\\log_2 P(x)$ bits (Bergou §11.1), the average number of yes/no questions.',
        '$h(p)$ is concave, peaking at $1$ bit when $p = \\tfrac12$, and $0$ at the endpoints.',
        '$H$ is largest for the uniform distribution and zero for a point mass, for any $\\Omega$.',
      ],
      trap: 'Entropy measures the distribution’s own uncertainty, not the size of $\\Omega$: a huge but near-certain $\\Omega$ still carries little $H$.',
    },
  },
}
