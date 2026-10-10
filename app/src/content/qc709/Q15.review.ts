/**
 * Chapter Q15 review cards: the exam layer in both tracks (P-Q15-story §6). Ground-up ≤ 25 words per sentence, Formal ≤ 40; ≤ 5 points each.
 * Every displayed number comes from Q15.values.ts and is backed by a keyed claim.
 */
import type { ReviewCard } from '../schema'
import { V, d } from './Q15.values'
import { K } from './Q15.story'

export const Q15_REVIEW: Record<string, ReviewCard> = {
  'q15-otp': {
    points: [
      'A key used once hides anything: add it with XOR to lock the message, add it again to unlock.',
      'The rule can be public. Only the key must stay secret.',
      'Getting the key to both people is the hard part, and a quantum state cannot be copied.',
      `A CNOT copies $|0\\rangle$ and $|1\\rangle$, but a copied $|+\\rangle$ is found as two copies with chance only ${d(V.q15CopyOverlap, 1)}.`,
    ],
    equations: 'c = m \\oplus k,\\ c \\oplus k = m',
    trap: 'Reusing a pad: then $c_1 \\oplus c_2 = m_1 \\oplus m_2$ shows Eve how the two messages differ.',
    claims: [K.copyOverlap],
    formal: {
      points: [
        '$c = m \\oplus k$ and $c \\oplus k = m$; perfect secrecy needs a uniform key used once.',
        'The algorithm is public. Key distribution is the whole problem.',
        `By linearity a CNOT sends $|{+}\\rangle|0\\rangle$ to $\\Phi^+$, which overlaps $|{+}{+}\\rangle$ with chance ${d(V.q15CopyOverlap, 1)}$ (Chapter Q13).`,
      ],
      trap: 'Using one pad twice: $c_1 \\oplus c_2 = m_1 \\oplus m_2$ because $k \\oplus k = 0$.',
    },
  },
  'q15-b92': {
    points: [
      `B92 sends bit 0 as $|0\\rangle$ and bit 1 as $|+\\rangle$, which overlap by ${d(V.q15Overlap, 4)}.`,
      `Bob keeps ${d(V.q15B92Kept, 4)} of the rounds, and with no Eve the kept bits agree.`,
      `A never-wrong Eve leaves $Q = ${d(V.q15QUsdEve, 4)}$.`,
      `A minimum-error Eve leaves only $Q = ${d(V.q15QMinEve, 4)}$ and holds the right bit in ${d(V.q15EveMinRight, 4)} of the rounds.`,
    ],
    equations: 'Q = (1 - \\sqrt{1 - s^2})/2',
    trap: 'Guarding only against the noisy attack: the quieter minimum-error Eve is the one the test must catch.',
    claims: [K.overlap, K.kept, K.qUsd, K.qMin, K.minRight],
    formal: {
      points: [
        `Unambiguous success is $1 - s = ${d(V.q15B92Kept, 4)}$ for $s = |\\langle\\psi_0|\\psi_1\\rangle|$; kept rounds form the raw key.`,
        `A never-wrong Eve gives $Q = s/2 = ${d(V.q15QUsdEve, 4)}$.`,
        `A minimum-error Eve gives $Q = P_E = (1 - \\sqrt{1 - s^2})/2 = ${d(V.q15QMinEve, 4)}$ and holds ${d(V.q15EveMinRight, 4)} of the kept bits.`,
      ],
      trap: 'Designing the error check against the louder attack alone: the minimum-error attack has lower $Q$ and more information.',
    },
  },
  'q15-bb84': {
    points: [
      'BB84 keeps the rounds in which the two bases match.',
      `Intercept–resend leaves $Q = ${d(V.q15BridgeQ, 2)}$, as Spin Lab works out.`,
      'A probe that causes no error in either basis ends in the same state whatever Alice sent.',
      'So no errors means no information.',
    ],
    equations: 'U|a\\rangle|0\\rangle_e = |a\\rangle|\\varphi_{00}\\rangle',
    trap: `Thinking $Q = ${d(V.q15BridgeQ, 2)}$ is the error rate of every attack: it belongs to intercept–resend alone.`,
    claims: [K.bridgeQ],
    formal: {
      points: [
        'No $z$ errors force $|\\varphi_{01}\\rangle = |\\varphi_{10}\\rangle = 0$, and no $x$ errors force $|\\varphi_{00}\\rangle = |\\varphi_{11}\\rangle$ (Eqs. 6.1–6.5).',
        '$U|a\\rangle|0\\rangle_e = |a\\rangle|\\varphi_{00}\\rangle$ is a product state, so Eve’s ancilla holds nothing about $a$.',
        `Intercept–resend gives $Q = ${d(V.q15BridgeQ, 2)}$ on the sifted key; it is one attack, not the bound.`,
      ],
      trap: 'Reading the zero-error theorem as a bound for every attack: a probe that accepts some error can learn some information.',
    },
  },
  'q15-e91': {
    points: [
      'A singlet gives Alice and Bob opposite results whenever they use the same basis.',
      `Different bases agree half the time: the chance is ${d(V.q15DiffXY, 1)}.`,
      `A CHSH score of ${d(V.q15ChshSinglet, 4)} shows that no preset answers exist.`,
      `Fixed states from Eve score only ${d(V.q15ChshProduct, 4)}, so the test catches her.`,
    ],
    equations: '|S| \\le 2 \\text{ against } 2\\sqrt2',
    trap: 'Thinking the key settings alone certify security: with $z$ and $x$ only, two hidden coins copy the whole table.',
    claims: [K.diffXY, K.chshSinglet, K.chshProduct],
    formal: {
      points: [
        '$E_{nn} = -1$ for the singlet, so equal-basis results always differ; mismatched bases agree half the time.',
        `A violation of $|S| \\le 2$ rules out Eq. 6.7, hence Eve’s $\\lambda$; the singlet reaches $2\\sqrt2 = ${d(V.q15ChshSinglet, 4)}$ at Chapter Q10’s settings.`,
        `Eve’s product $|{+x}\\rangle|{-x}\\rangle$ scores $${d(V.q15ChshProduct, 4)}$ there and at most $${d(V.q15ChshProductMax, 0)}$.`,
      ],
      trap: 'Treating the key-generating settings as a Bell test: for $\\Phi^+$ with $z$ and $x$ only, $P(a, b|x, y)$ has a local model.',
    },
  },
  'q15-sharing': {
    points: [
      'XOR splits a key: one person holds $u = k \\oplus r$ and the other holds $r$.',
      'An entangled code splits one bit between two qubits, one for Bob and one for Charlie.',
      `Charlie’s never-wrong reading succeeds with chance ${d(V.q15ShareUsd, 4)}; then $a = \\beta \\oplus \\gamma$.`,
      'Neither person alone can read the bit.',
    ],
    equations: 'a = \\beta \\oplus \\gamma',
    trap: 'Trusting the random $\\sigma_z$ switch to catch a Charlie who reads first: our calculation finds it leaves no trace.',
    claims: [K.shareUsd, K.cheatGap],
    formal: {
      points: [
        'Splitting: $u = k \\oplus r$ and $r$ are each uniformly random, and $u \\oplus r = k$.',
        `Eq. 6.9 gives the steering; Charlie’s unambiguous success is $1 - |\\cos 2\\theta| = ${d(V.q15ShareUsd, 4)}$ and $a = \\beta \\oplus \\gamma$.`,
        'Eve faces the overlap $\\cos 2\\theta$, which is B92’s at $\\theta = 22.5°$.',
      ],
      trap: 'Trusting Bergou’s $\\sigma_z$ switch: it only relabels Bob’s $x$ reading, and the public record of a Charlie who reads first matches an honest run.',
    },
  },
}
