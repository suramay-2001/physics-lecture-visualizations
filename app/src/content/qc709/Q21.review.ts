/**
 * Chapter Q21 review cards: the exam layer in both tracks (P-Q21-story §6). Ground-up ≤ 25 words per sentence, Formal ≤ 40; ≤ 5 points each.
 * Every displayed number comes from Q21.values.ts and is backed by a keyed claim.
 */
import type { ReviewCard } from '../schema'
import { V, claim, close, d } from './Q21.values'

export const Q21_REVIEW: Record<string, ReviewCard> = {
  'q21-classical': {
    points: [
      'Three copies and a majority vote fail only when two or three copies flip.',
      `That has chance $p^2(3 - 2p)$, which is $${d(V.q21RepFail01, 3)}$ at $p = ${d(V.q21P, 1)}$.`,
      `The vote beats a lone bit exactly when $p < ${d(V.q21BreakEven, 1)}$.`,
      'Two parity checks name the flipped bit. Their answers are the syndrome.',
    ],
    equations: 'p^2(3-2p) - p = -p(1-p)(1-2p)',
    trap: 'Believing that more copies always help. They help only when each copy is more likely right than wrong.',
    claims: [
      claim('q21RepFail01', 'at $p = 0.1$ the vote fails with chance $0.028$', () => close(V.q21RepFail01, 0.028, 1e-9)),
      claim('q21P', 'the flip chance is $0.1$', () => close(V.q21P, 0.1, 1e-12)),
      claim('q21BreakEven', 'the vote helps below $0.5$', () => close(V.q21BreakEven, 0.5, 1e-9)),
    ],
    formal: {
      points: [
        'Majority decoding of the repetition code fails with probability $\\sum_{k\\ge2}\\binom3kp^k(1-p)^{3-k} = p^2(3 - 2p)$.',
        `The factor $1 - 2p$ decides: encoding helps exactly when $p < ${d(V.q21BreakEven, 1)}$.`,
        'The syndrome $Me$ depends on the error $e$ only, and the code words are the null space of $M$.',
      ],
      trap: 'Assuming that the gain survives for $p \\ge \\tfrac12$: there the vote fails more often than a bare bit.',
    },
  },
  'q21-bit-flip': {
    points: [
      'Two CNOTs encode a qubit as $a|000\\rangle + b|111\\rangle$, which is not three copies.',
      'Two helpers read $Z_1Z_2$ and $Z_2Z_3$. A flip of one qubit leaves its own pattern of signs.',
      'The fix is applied on the pattern, and the amplitudes are never read.',
      `A small error becomes none (chance $${d(V.q21SmallP00, 2)}$) or a whole flip (chance $${d(V.q21SmallP11, 2)}$).`,
    ],
    equations: 'a|000\\rangle + b|111\\rangle',
    trap: 'Saying that the helpers measure the data qubits. They read only the parities of pairs.',
    claims: [
      claim('q21SmallP00', 'nothing happened with chance $0.75$', () => close(V.q21SmallP00, 0.75, 1e-9)),
      claim('q21SmallP11', 'a whole flip with chance $0.25$', () => close(V.q21SmallP11, 0.25, 1e-9)),
    ],
    formal: {
      points: [
        'The code space is $\\mathrm{span}\\{|000\\rangle, |111\\rangle\\}$; $Z_1Z_2$ and $Z_2Z_3$ commute and equal $+1$ on it.',
        'A single $X_j$ gives the signs $(-1,+1)$, $(-1,-1)$, $(+1,-1)$ for $j = 1, 2, 3$ (Bergou p. 163).',
        `Measuring projects $R_x(\\theta)$ onto $I$ or $X_2$ with probabilities $1 - \\epsilon^2 = ${d(V.q21SmallP00, 2)}$ and $\\epsilon^2 = ${d(V.q21SmallP11, 2)}$ (Eqs. 9.1–9.2).`,
      ],
      trap: 'Applying the fix on the readings $+1, +1$: that is the reading of no flip (Correction box).',
    },
  },
  'q21-phase-flip': {
    points: [
      'A sign flip $Z_1$ commutes with both parity checks, so the bit-flip code never sees it.',
      `It changes the stored qubit: the overlap with the original is $-${d(V.q21Z1OverlapSize, 2)}$.`,
      'A Hadamard on each qubit turns $Z$ into $X$.',
      'So the phase-flip code stores $|0\\rangle$ as $|{+}{+}{+}\\rangle$ and $|1\\rangle$ as $|{-}{-}{-}\\rangle$, with checks $X_1X_2$ and $X_2X_3$.',
    ],
    equations: '|{+}{+}{+}\\rangle,\\ |{-}{-}{-}\\rangle',
    trap: 'Thinking that the bit-flip code sees sign flips. They leave both of its checks at $+1$.',
    claims: [claim('q21Z1OverlapSize', 'the overlap has size $0.28$', () => close(V.q21Z1OverlapSize, 0.28, 1e-9))],
    formal: {
      points: [
        'Conjugation by $H^{\\otimes3}$ maps $X_j \\leftrightarrow Z_j$, so the phase-flip code corrects $Z_j$ with the bit-flip decoder.',
        '$Z_1$ acts on the bit-flip code as a logical $Z$, so its syndrome is 00 and its overlap is $a^2 - b^2$.',
        'Each three-qubit code has a weight-1 logical operator for the error it cannot see.',
      ],
      trap: 'Treating one three-qubit code as protection from both kinds of flip.',
    },
  },
  'q21-shor': {
    points: [
      'Nest the codes: three groups of three qubits.',
      'Six $ZZ$ checks inside the groups catch bit flips.',
      'Two big $X$ checks across the groups catch sign flips.',
      '$Y$ is both kinds at once and lights both kinds of check.',
      'Sign flips on qubit 1 and qubit 2 share one fix, so the code is degenerate.',
    ],
    equations: '(|000\\rangle \\pm |111\\rangle)^{\\otimes3}/\\sqrt8',
    trap: 'Reading the book’s group-1 line as correct: the big checks read $(-1, +1)$ for group 1, and the printed pair is group 3’s.',
    claims: [claim('q21ShorBar', 'each string has amplitude $0.3536$', () => close(V.q21ShorBar, 0.3536, 5e-5))],
    formal: {
      points: [
        `The Shor code is the joint $+1$ space of ${V.q21ShorChecks} commuting checks (Eq. 9.3); each code word has ${V.q21ShorTerms} strings of amplitude $${d(V.q21ShorBar, 4)}$.`,
        `The ${V.q21ShorWt1} errors of weight at most 1 give ${V.q21ShorDistinct} distinct syndromes, because $Z_1, Z_2, Z_3$ share one.`,
        'A weight-2 $X$ error in one group is decoded wrongly and ends as a logical $Z$.',
      ],
      trap: 'The printed readings for group 1 (Correction box).',
    },
  },
  'q21-digitize': {
    points: [
      'Every one-qubit error is a mix of $I$, $X$, $Y$ and $Z$.',
      'Each weight is a trace, halved.',
      'Reading the checks keeps one part of the mix.',
      `So a code that fixes the four on each qubit fixes every error: ${V.q21Wt1n3} cases on three qubits, ${V.q21Wt1n9} on nine.`,
    ],
    equations: 'c_P = \\mathrm{Tr}(PA)/2',
    trap: 'Thinking that a small error needs a small correction. The reading forces none or a whole Pauli.',
    claims: [
      claim('q21Wt1n3', 'ten cases on three qubits', () => V.q21Wt1n3 === 10),
      claim('q21Wt1n9', 'twenty-eight on nine', () => V.q21Wt1n9 === 28),
    ],
    formal: {
      points: [
        '$A = \\sum_Pc_PP$ with $c_P = \\mathrm{Tr}(PA)/2$ (Eq. 9.4), and $U_{AE}$ splits into $\\sum_PP|\\psi\\rangle|e_P\\rangle$ (Eqs. 9.5–9.6).',
        'The syndrome measurement projects onto one $E_a$ (Eq. 9.9), so correcting a basis set corrects its span.',
        `A Pauli set of weight at most $t$ has $\\sum_{j\\le t}\\binom nj3^j$ elements: ${V.q21Wt1n3} for $n = 3$, ${V.q21Wt1n9} for $n = 9$.`,
      ],
      trap: 'Correcting only the basis set and forgetting that the span includes every mix.',
    },
  },
  'q21-kl': {
    points: [
      'Each fixable error must move the code into its own room.',
      'The exact rule lets an error act alike on both code words.',
      'An error that treats the code words differently has read the stored qubit.',
      `Rooms must fit: one stored qubit and one error need at least ${V.q21QhbMinN} qubits.`,
    ],
    equations: '\\langle\\bar j|E_b^\\dagger E_a|\\bar k\\rangle = C_{ba}\\delta_{jk}',
    trap: 'Requiring the table $C$ to be the identity. A degenerate code has a table that is not.',
    claims: [claim('q21QhbMinN', 'the least number of qubits is 5', () => V.q21QhbMinN === 5)],
    formal: {
      points: [
        'The Knill–Laflamme condition $\\langle\\bar j|E_b^\\dagger E_a|\\bar k\\rangle = C_{ba}\\delta_{jk}$, with $C$ Hermitian, is necessary and sufficient (Eq. 9.16 and Eq. 9.34).',
        `For $\\{I, Z_1, Z_2\\}$ on the Shor code $C$ has eigenvalues $${d(V.q21KlShorEig0, 0)}, ${d(V.q21KlShorEig1, 0)}, ${d(V.q21KlShorEig2, 0)}$: a degenerate code.`,
        `A nondegenerate $[\\![n, k]\\!]$ code obeys $2^k\\sum_{j\\le t}\\binom nj3^j \\le 2^n$; for $k = t = 1$ the least $n$ is ${V.q21QhbMinN}$.`,
      ],
      trap: 'Applying the counting bound to degenerate codes: it covers nondegenerate codes only.',
    },
  },
  'q21-dfs': {
    points: [
      `A random phase shrinks the off-diagonal entry of $\\rho$ by the factor $z$: from $${d(V.q21Off0, 2)}$ to $${d(V.q21Off1, 2)}$ for $\\pm60°$.`,
      'If both qubits feel the same phase, the states 01 and 10 turn together.',
      'A common turn of the whole state changes nothing.',
      `So the pair keeps its coherence, $${d(V.q21DfsOff, 2)}$, with no checks at all.`,
    ],
    equations: 'R(\\varphi)^{\\otimes2}(a|01\\rangle + b|10\\rangle) = e^{i\\varphi}(a|01\\rangle + b|10\\rangle)',
    trap: 'Expecting it to work for independent noise on each qubit. Then the coherence drops to a smaller value.',
    claims: [
      claim('q21Off0', 'the entry starts at $0.48$', () => close(V.q21Off0, 0.48, 1e-9)),
      claim('q21Off1', 'a lone qubit keeps $0.24$', () => close(V.q21Off1, 0.24, 1e-9)),
      claim('q21DfsOff', 'the pair keeps $0.48$', () => close(V.q21DfsOff, 0.48, 1e-9)),
    ],
    formal: {
      points: [
        '$\\rho_{10} \\to a^*b\\,z$ with $z = \\int p(\\varphi)e^{i\\varphi}d\\varphi$ (Eq. 9.57); uniform noise gives $z = 0$.',
        '$R(\\varphi)^{\\otimes2}$ multiplies $|x_1x_2\\rangle$ by $e^{i\\varphi(x_1+x_2)}$ and is a global phase on $\\mathrm{span}\\{|01\\rangle, |10\\rangle\\}$ (Eqs. 9.58–9.59).',
        `With independent phases the entry becomes $ab\\,|z|^2 = ${d(V.q21IndOff, 2)}$.`,
      ],
      trap: 'Calling the subspace decoherence-free for noise that is not collective.',
    },
  },
}
