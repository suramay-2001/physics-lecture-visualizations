/**
 * Chapter Q7 review cards: the exam layer in both tracks (P-Q7-story §6). Ground-up ≤ 25 words per sentence, Formal
 * ≤ 40; ≤ 5 points each. Every number comes from Q7.values.ts and is backed by a keyed claim.
 */
import type { ReviewCard } from '../schema'
import { V, claim, close } from './Q7.values'

export const Q7_REVIEW: Record<string, ReviewCard> = {
  'q7-ghz': {
    points: [
      'GHZ is $(|000\\rangle + |111\\rangle)/\\sqrt2$.',
      'In the computational basis: 000 or 111, half each.',
      'One reading fixes the other two.',
      'Its count of zeros has variance 2.25, against 0.75 for three coins.',
    ],
    equations: '|\\mathrm{GHZ}\\rangle = \\tfrac1{\\sqrt2}(|000\\rangle + |111\\rangle)',
    trap: 'Reading "all three agree" as "three copies of one coin": the variance shows the readings move together.',
    formal: {
      points: [
        '$|\\mathrm{GHZ}_N\\rangle$; Bergou’s GHZ and W classes of three-party entanglement.',
        '$P(000) = P(111) = \\tfrac12$, every other string probability 0.',
        'HW2 P5(b)–(c): the same mean, three times the variance of three independent coins.',
      ],
      trap: 'Treating a zero-reading rate the same as the coin rate: the mean agrees but the spread does not.',
    },
    claims: [
      claim('q7GhzP000', 'P(000) = 0.5', () => close(V.q7GhzP000, 0.5)),
      claim('q7GhzP111', 'P(111) = 0.5', () => close(V.q7GhzP111, 0.5)),
      claim('q7ZerosVar', 'the variance of the zero-count is 2.25 for GHZ', () => close(V.q7ZerosVar, 2.25)),
      claim('q7ZerosPlusVar', 'the variance of the zero-count is 0.75 for three independent coins', () => close(V.q7ZerosPlusVar, 0.75)),
    ],
  },
  'q7-brackets': {
    points: [
      'A run picks x or y for each qubit and records ±1.',
      'Every bracket with $|0\\rangle$ is $1/\\sqrt2$.',
      'A bracket with $|1\\rangle$ is $\\zeta/\\sqrt2$, with $\\zeta = \\varepsilon$ (x) or $-i\\varepsilon$ (y).',
    ],
    equations: '\\langle\\varepsilon_kb_k|1\\rangle = \\zeta_k/\\sqrt2',
    trap: 'Forgetting that a bra conjugates: $\\langle{+y}|1\\rangle = -i/\\sqrt2$, not $+i/\\sqrt2$.',
    formal: {
      points: ['$|\\varepsilon x\\rangle$, $|\\varepsilon y\\rangle$ in one line each.', 'eq. 2.9: $\\zeta_k$ real in x, imaginary in y.', '$\\zeta_k$ is a number, unrelated to the Pauli matrices.'],
      trap: 'Confusing $\\zeta_k$ with a Pauli matrix: it is a single complex number of size 1.',
    },
    claims: [
      claim('q7PlusYRe', 'Re⟨0|+y⟩ = 0.7071', () => close(V.q7PlusYRe, Math.SQRT1_2, 1e-4)),
      claim('q7BraPlusYOneIm', 'Im⟨+y|1⟩ = −0.7071', () => close(V.q7BraPlusYOneIm, -Math.SQRT1_2, 1e-4)),
    ],
  },
  'q7-parity-table': {
    points: [
      'Every GHZ bracket is $(1 + s)/4$.',
      '$s = (-i)^{n_y}\\Pi$: bases and outcomes separate.',
      'Chances are $\\tfrac14$, 0 or $\\tfrac18$.',
    ],
    equations: '\\langle\\varepsilon_kb_k|\\mathrm{GHZ}\\rangle = \\tfrac{1 + s}4,\\quad s = (-i)^{n_y}\\Pi',
    trap: 'Taking the chance to be $|1 + s|/4$ instead of $|1 + s|^2/16$.',
    formal: {
      points: ['eq. 2.10 in full.', 'The p. 31 table, by $n_y$ and $\\Pi$.', 'HW2 P7(d): two runs checked directly against $(1+s)/4$.'],
      trap: 'Dropping the square: a size is not a chance until it is squared.',
    },
    claims: [
      claim('q7P1AtS1', '|1+1|²/16 = 0.25', () => close(V.q7P1AtS1, 0.25)),
      claim('q7P1AtSNegI', '|1−i|²/16 = 0.125', () => close(V.q7P1AtSNegI, 0.125)),
      claim('q7AbsOnePlusSNegI', '|1 − i| = 1.41421356', () => close(V.q7AbsOnePlusSNegI, Math.SQRT2, 1e-6)),
    ],
  },
  'q7-bit-strings': {
    points: [
      '+1 is bit 0, −1 is bit 1.',
      'XXX keeps the even strings; two y’s keep the odd ones.',
      'An odd $n_y$ keeps all eight, equally.',
      'The product of the readings is itself a reading.',
    ],
    equations: 'P_{XXX}(\\text{even}) = \\tfrac14,\\quad P_{YYX}(\\text{odd}) = \\tfrac14',
    trap: 'Thinking random single readings mean a random product.',
    formal: {
      points: ['Which strings survive names the sign: it is their shared parity.', '$\\Pi$ is a measured value of $\\sigma_{x1}\\sigma_{x2}\\sigma_{x3}$, not a separate fact.'],
      trap: 'Treating the string and the product as two different measurements: writing the string already records $\\Pi$.',
    },
    claims: [
      claim('q7Table011', 'P(011) = 0.25 in an XXX run', () => close(V.q7Table011, 0.25)),
      claim('q7Table010', 'P(010) = 0 in an XXX run', () => close(V.q7Table010, 0)),
      claim('q7TableXxy101', 'P(101) = 0.125 in an XXY run', () => close(V.q7TableXxy101, 0.125)),
    ],
  },
  'q7-observables': {
    points: [
      'XXX, YYX, YXY, XYY are observables with values ±1.',
      'They all commute.',
      'GHZ gives +1, −1, −1, −1, every run.',
      'A single qubit’s own X reading is still a 50/50 coin.',
    ],
    equations: '\\hat O_{XXX}|\\mathrm{GHZ}\\rangle = +|\\mathrm{GHZ}\\rangle,\\quad \\hat O_{YYX}|\\mathrm{GHZ}\\rangle = -|\\mathrm{GHZ}\\rangle',
    trap: 'Reading $-|\\mathrm{GHZ}\\rangle$ as a new state: the −1 is the eigenvalue, not a different ket.',
    formal: {
      points: [
        'eqs. 2.11–2.12: four commuting Pauli strings, GHZ their common eigenstate.',
        'Zero dispersion: $\\langle(\\Delta\\hat O)^2\\rangle = 0$, against $\\langle(\\Delta\\sigma_{x1})^2\\rangle = 1$.',
        'HW2 P7(a)–(b): the permutation symmetry of GHZ carries one computation to the other two.',
      ],
      trap: 'Mistaking an eigenvalue equation for an average: every single run gives the eigenvalue, not just the mean.',
    },
    claims: [
      claim('q7MeanXxx', '⟨XXX⟩ = 1 on GHZ', () => close(V.q7MeanXxx, 1)),
      claim('q7MeanYyx', '⟨YYX⟩ = −1 on GHZ', () => close(V.q7MeanYyx, -1)),
      claim('q7VarXxx', 'Var(XXX) = 0 on GHZ', () => close(V.q7VarXxx, 0)),
      claim('q7VarX1', 'Var(single-qubit X) = 1 on GHZ', () => close(V.q7VarX1, 1)),
      claim('q7Half', 'a chance of ½', () => close(V.q7Half, 0.5)),
    ],
  },
  'q7-mermin': {
    points: [
      'Cards carry answers $x_i$, $y_i$ fixed in advance.',
      'The three y-results force $x_1x_2x_3 = -1$; XXX gives +1.',
      'The best card matches three of four.',
      'Operators escape because $Y\\cdot X\\cdot Y = -X$.',
    ],
    equations: '(Y_1Y_2X_3)(Y_1X_2Y_3)(X_1Y_2Y_3) = -X_1X_2X_3',
    trap: 'Treating operators as numbers, which drops the minus sign the anticommutation supplies.',
    formal: {
      points: [
        'Local realism is refuted by single runs, not averages.',
        'eq. 2.13: the Heisenberg-picture product carries a sign the classical product cannot.',
        'GHZ’s stabilizers XXX, ZZI, IZZ (Bergou ⚑ Problem 10.1(a)).',
      ],
      trap: 'Expecting a statistical violation like Bell’s: here one run of each setting already decides the question.',
    },
    claims: [
      claim('q7MerminBest', 'the best instruction card matches 3 of the 4 relations', () => close(V.q7MerminBest, 3)),
      claim('q7Forced', 'the three y-relations force x₁x₂x₃ = −1', () => close(V.q7Forced, -1)),
      claim('q7EigXxx', 'the quantum value of XXX on GHZ is +1', () => close(V.q7EigXxx, 1)),
      claim('q7ProdPlusXxx', '(YYX)(YXY)(XYY) + XXX = 0 as matrices', () => close(V.q7ProdPlusXxx, 0)),
    ],
  },
}
