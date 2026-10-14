/**
 * Chapter Q22 review cards: the exam layer in both tracks (P-Q22-story §6). Ground-up ≤ 25 words per sentence, Formal ≤ 40; ≤ 5 points each.
 * Every displayed number comes from Q22.values.ts and is backed by a keyed claim.
 */
import type { ReviewCard } from '../schema'
import { V, claim, close, d } from './Q22.values'

export const Q22_REVIEW: Record<string, ReviewCard> = {
  'q22-linear-codes': {
    points: [
      'Basic words make a code, and checks test it: the same code, written two ways.',
      `The $[6, 2]$ code has ${V.q22G62Words} words, a rate of $${d(V.q22Rate62, 3)}$ and distance ${V.q22D62}.`,
      'A distance $d$ fixes $t = (d - 1)/2$ flips, because each has its own syndrome.',
      'The dual swaps the roles of basic words and checks.',
    ],
    equations: 'MG = 0',
    trap: 'Bergou’s “dual distance 3”: every nonzero word of the Hamming dual weighs 4, so its distance is 4.',
    claims: [claim('q22Rate62', 'the rate of the $[6, 2]$ code is $0.333$', () => close(V.q22Rate62, 1 / 3, 1e-12))],
    formal: {
      points: [
        'Eqs. 9.35–9.40: $C = \\mathrm{col}\\,G = \\ker M$, $MG = 0$, and $M^{T}$ generates $C^\\perp$.',
        'The distance $d = \\min\\mathrm{wt}(x)$ is the least distance between words; $d \\ge 2t + 1$ gives distinct syndromes for errors of weight at most $t$.',
        `For the Hamming code $d = ${V.q22HamD}$ and $d(C^\\perp) = ${V.q22DualD}$; the $[6, 2]$ single-flip table fails on weight-2 errors.`,
      ],
      trap: 'Copying Bergou’s statement that the dual has distance 3.',
    },
  },
  'q22-stabilizer': {
    points: [
      'A code is the $+1$ space of commuting checks that leave the state alone.',
      `Each independent check keeps $\\tfrac12$ of the dimensions, so $k = n - r$: the bit-flip code stores ${V.q22KBitflip}, Shor’s ${V.q22KShor}.`,
      'A set containing $-I$, or two checks that anticommute, has no common state.',
      'An error shows up as the checks it anticommutes with.',
    ],
    equations: '\\dim V_S = 2^{n-r}',
    trap: 'Counting dependent checks: $Z_1Z_3$ is the product of $Z_1Z_2$ and $Z_2Z_3$, so it does not reduce $k$.',
    claims: [claim('q22HalfKept', 'one check keeps half the dimensions', () => close(V.q22HalfKept, 0.5, 1e-12))],
    formal: {
      points: [
        'Theorem 2: $n - k$ independent commuting generators with $-I \\notin S$ give $\\dim V_S = 2^k$ (Bergou p. 181).',
        'The projectors $P_x$ split the space into $2^{n-k}$ equal blocks, one per syndrome.',
        'The syndrome bit of $g$ is its commutation sign with the error $E$.',
      ],
      trap: 'Applying $\\dim V_S = 2^{n-r}$ with $r$ the number of generators listed rather than the number that are independent.',
    },
  },
  'q22-check-matrix': {
    points: [
      'Each check is a row of bits, an $X$ half and a $Z$ half; multiplying checks XORs rows.',
      'Two checks commute exactly when they clash on an even number of qubits.',
      'Checks are independent exactly when their rows are, so $k = n - \\mathrm{rank}$.',
      'The distance is the fewest qubits a logical operator touches; the five-qubit code has $d = 3$.',
    ],
    equations: 'x z\'^{T} + z x\'^{T}',
    trap: 'Calling $Z_1Z_2$ a logical operator of Shor’s code: it is one of its checks.',
    claims: [claim('q22FiveRate', 'the five-qubit rate is $0.2$', () => close(V.q22FiveRate, 0.2, 1e-12))],
    formal: {
      points: [
        'Eq. 10.3 and Eq. 10.15: $r(gg\') = r(g) + r(g\')$ and $g$, $g\'$ commute iff $x z\'^{T} + z x\'^{T} = 0$.',
        `Theorem 1: commuting generators with $-I \\notin S$ are independent iff their rows are, so $k = n - \\mathrm{rank}$ (Shor: rank ${V.q22RankShor}).`,
        `The distance is the least weight in $N(S) \\setminus S$; the five-qubit code has rank ${V.q22RankFive}, $d = ${V.q22FiveD}$ and rate $${d(V.q22FiveRate, 1)}$.`,
      ],
      trap: 'Treating a generator as a logical operator: logical operators lie in $N(S) \\setminus S$, so no generator qualifies.',
    },
  },
  'q22-css': {
    points: [
      'Use $X$-only checks $H_X$ and $Z$-only checks $H_Z$; they all commute exactly when $H_XH_Z^{T} = 0$.',
      `Steane’s code takes the Hamming checks twice: ${V.q22KSteane} stored qubit, distance ${V.q22DSteane}.`,
      `Its zero code word is an even mix of ${V.q22SteaneWords} Hamming words, each of amplitude $${d(V.q22SteaneAmp, 4)}$.`,
      'Bit flips and sign flips are read by separate tables.',
    ],
    equations: 'H_X H_Z^{T} = 0',
    trap: 'Assuming any two classical codes make a quantum code: the $[6, 2]$ checks fail $H_XH_Z^{T} = 0$.',
    claims: [claim('q22SteaneAmp', 'each word of the zero code word has amplitude $0.3536$', () => close(V.q22SteaneAmp, 1 / Math.sqrt(8), 1e-12))],
    formal: {
      points: [
        'Eqs. 9.41–9.52 and Eq. 10.106: $C_2 \\subset C_1$ gives $[[n, k_1 - k_2]]$, and the CSS checks commute iff $H_XH_Z^{T} = 0$.',
        `$k = n - \\mathrm{rank}\\,H_X - \\mathrm{rank}\\,H_Z$; Steane: $7 - 3 - 3 = ${V.q22KSteane}$, $d = ${V.q22DSteane}$, all ${V.q22SteaneAll1} one-qubit errors corrected.`,
        `$H^{\\otimes7}|\\bar 0\\rangle$ puts amplitude $${d(V.q22SteaneH, 2)}$ on each of the 16 Hamming words.`,
      ],
      trap: 'Copying Bergou p. 173’s strict inequality $d_1 > 2t_f + 1$: the correct condition is $\\ge$.',
    },
  },
  'q22-decode': {
    points: [
      'A lookup decoder maps each syndrome to the lightest error that makes it.',
      'Steane’s code reads bit flips and sign flips separately, so every one-qubit error and every pair of one of each is fixed.',
      'Two bit flips can look like a third and complete a logical operator: a logical error.',
      `With flip chance $p$ the failure chance is about $21p^2$: $${d(V.q22PL001, 4)}$ at $p = ${d(V.q22PIn001, 2)}$.`,
    ],
    equations: 'P_L(p) \\approx 21p^2',
    trap: 'Believing a code always helps: above $p^* = ' + d(V.q22PStar, 4) + '$ it makes things worse.',
    claims: [
      claim('q22PL001', 'the failure chance at $p = 0.01$ is $0.0020$', () => close(V.q22PL001, 0.002004, 1e-6)),
      claim('q22PIn001', 'the flip chance is $0.01$', () => close(V.q22PIn001, 0.01, 1e-12)),
      claim('q22PStar', 'the curves cross at $0.0646$', () => close(V.q22PStar, 0.0646, 5e-5)),
      claim('q22PIn05', 'the flip chance in the challenge is $0.05$', () => close(V.q22PIn05, 0.05, 1e-12)),
      claim('q22PL005', 'and the failure chance there is $0.0415$', () => close(V.q22PL005, 0.041486, 1e-6)),
    ],
    formal: {
      points: [
        'A lookup decoder stores a minimum-weight Pauli for each of the $2^{n-k}$ syndromes (N&C p. 466).',
        'A round succeeds exactly when the error times the fix lies in $S$; the weight-2 patterns all fail.',
        `Failures by weight give $P_L(p) \\approx 21p^2$, below $p$ for $p < p^* = ${d(V.q22PStar, 4)}$ (our calculation).`,
      ],
      trap: 'Taking $P_L < p$ for granted: the code helps only below the pseudo-threshold.',
    },
  },
  'q22-clifford': {
    points: [
      'If $g$ fixes a state, then $UgU^\\dagger$ fixes the state after $U$.',
      '$H$, the phase gate and CNOT turn Pauli strings into Pauli strings, so a circuit of them is followed by relabelling checks.',
      `Measuring a Pauli that clashes with a check gives each outcome with chance $${d(V.q22MeasX, 1)}$ and replaces that check.`,
      '$T$ is not Clifford: it turns $X$ into half of $X$ plus half of $Y$.',
    ],
    equations: 'U g U^\\dagger',
    trap: 'Bergou’s last line of Eq. 10.9: the phase gate leaves $Z$ alone, not $Y$.',
    claims: [claim('q22MeasX', 'the measurement outcomes have chance $0.5$', () => close(V.q22MeasX, 0.5, 1e-12))],
    formal: {
      points: [
        'Eqs. 10.8–10.13: $U|\\psi\\rangle$ is stabilized by $UgU^\\dagger$; the Clifford group is generated by $H$, the phase gate and CNOT.',
        `$SXS^\\dagger = Y$, $SYS^\\dagger = -X$, $SZS^\\dagger = Z$; there are ${V.q22Cliff24} one-qubit Cliffords up to phase.`,
        `$TXT^\\dagger = (X + Y)/\\sqrt2$, with weight $${d(V.q22TXT, 4)}$ on each, lies outside $\\mathcal P_1$.`,
      ],
      trap: 'Copying Bergou’s $FYF^\\dagger = Z$: our calculation finds $FYF^\\dagger = -X$.',
    },
  },
  'q22-gottesman-knill': {
    points: [
      `A stabilizer state of $n$ qubits needs $n(2n + 1)$ bits: ${V.q22Tab50} at $n = 50$, against about $${d(V.q22Amp50Mant, 2)} \\times 10^{15}$ amplitudes.`,
      'Clifford gates and Pauli measurements update the tableau cheaply, so a laptop follows any such circuit.',
      'The Steane code is entangled, yet six checks and a logical operator describe it.',
      'Order finding needs gates like $T$ that are not Clifford.',
    ],
    equations: 'n(2n + 1)',
    trap: 'Thinking entanglement alone makes a circuit hard to simulate.',
    claims: [claim('q22Amp50Mant', '$2^{50}$ is about $1.13 \\times 10^{15}$', () => close(V.q22Amp50Mant, 1.1259, 1e-4))],
    formal: {
      points: [
        `Gottesman–Knill (Bergou p. 184; N&C p. 464): a stabilizer circuit of $m$ operations on $n$ qubits is simulated in $O(mn^2)$ steps.`,
        `The tableau is an $n \\times 2n$ binary matrix plus $n$ signs: $n(2n + 1)$ bits, ${V.q22Tab100} at $n = 100$.`,
        `The Steane zero code word has ${V.q22SteaneGens} generators; $T$ escapes the theorem.`,
      ],
      trap: 'Taking “entangled” to mean “hard to simulate”: the theorem covers highly entangled stabilizer states.',
    },
  },
}
