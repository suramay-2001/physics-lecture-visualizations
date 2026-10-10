/**
 * Chapter Q15 glossary (Physics 709; P-Q15-story §5), merged into the lazy course pack by file name (pack.ts). Every entry has a Ground-up sentence
 * (`gloss`, ≤ 25 words) and a Formal one (`formal`, ≤ 40), paraphrased. Ids start `qc-` (the "gloss at first use" lint, content/symbols.test.ts).
 * `introduces` marks the three notation beats (interface change W-709 #12): the key error rate Q, device-independent security and the logical
 * states, each introduced by exactly one beat of this chapter (content.test.tsx).
 *
 * Reused without a new entry here: qc-unambiguous-discrimination, qc-minimum-error-discrimination (Q14), qc-ancilla (Q14), qc-no-cloning (Q13),
 * qc-singlet (Q6), qc-lhv-model (Q10), qc-xor and qc-cnot and qc-bell-state (Q4), and the Spin Lab gloss qubit (named by its 448 id).
 */
import type { GlossEntry } from '../schema'

export const GLOSSARY: GlossEntry[] = [
  {
    id: 'qc-cipher',
    term: 'cipher',
    gloss: 'A rule that swaps each letter or bit for another one, using a key.',
    formal: 'A keyed substitution or transposition acting on symbols (Bergou §6.2).',
    first: 'q15-otp:b1',
  },
  {
    id: 'qc-secret-key',
    term: 'secret key',
    gloss: 'The shared secret a cipher needs; the rule itself can be public.',
    formal: 'The parameter of a public encryption algorithm, known only to sender and receiver.',
    first: 'q15-otp:b1',
  },
  {
    id: 'qc-one-time-pad',
    term: 'one-time pad',
    gloss: 'A random key as long as the message, added once and never reused; it hides the message completely.',
    formal: '$c = m \\oplus k$ with $k$ uniform and used once: perfectly secret (Vernam; Bergou §6.2, N&C §12.6.1).',
    first: 'q15-otp:b2',
    bridge: 'qc-l8-key',
  },
  {
    id: 'qc-key-distribution',
    term: 'key distribution',
    gloss: 'Getting the same secret key to two people without anyone else seeing it.',
    formal: 'Establishing a shared uniformly random key over channels an adversary may read.',
    first: 'q15-otp:b3',
  },
  {
    id: 'qc-qkd',
    term: 'quantum key distribution',
    gloss: 'Sharing a key by sending quantum states, so that spying leaves errors behind.',
    formal: 'Key distribution whose security rests on no-cloning and on the disturbance a measurement causes.',
    first: 'q15-b92:b1',
  },
  {
    id: 'qc-b92',
    term: 'B92',
    gloss: 'Bennett’s key scheme of 1992: two overlapping states carry the bits 0 and 1.',
    formal: 'QKD with the states $|0\\rangle$ and $|+\\rangle$ and an unambiguous measurement at the receiver (Bergou §6.3).',
    first: 'q15-b92:b1',
  },
  {
    id: 'qc-raw-key',
    term: 'raw key',
    gloss: 'The bits Alice and Bob keep after throwing away the rounds that failed.',
    formal: 'The conclusive (or basis-matched) rounds, before any error check.',
    first: 'q15-b92:b2',
  },
  {
    id: 'qc-qber',
    term: 'key error rate $Q$',
    gloss: 'The share of kept key bits on which Alice and Bob disagree.',
    formal: 'The quantum bit error rate $Q$: the fraction of raw or sifted key bits that differ between Alice and Bob.',
    first: 'q15-b92:b2',
    introduces: 'notation',
    bridge: 'qc-l8-attack',
  },
  {
    id: 'qc-bb84',
    term: 'BB84',
    gloss: 'The four-state key scheme: two bases chosen at random, then compared in public.',
    formal: 'QKD with the $z$ and $x$ bases and basis sifting (Bergou §6.4).',
    first: 'q15-bb84:b1',
    bridge: 'qc-l8-bb84',
  },
  {
    id: 'qc-intercept-resend',
    term: 'intercept–resend',
    gloss: 'Eve measures each qubit and sends on a fresh one in the state she found.',
    formal: 'The measure-and-prepare attack on BB84, which leaves $Q = 1/4$ on the sifted key.',
    first: 'q15-bb84:b2',
    bridge: 'qc-l8-test',
  },
  {
    id: 'qc-information-disturbance',
    term: 'information–disturbance rule',
    gloss: 'Any attack that learns something about the key must cause some errors.',
    formal: 'Zero error in two unbiased bases forces Eve’s ancilla to decouple from Alice’s qubit (eqs. 6.1–6.5).',
    first: 'q15-bb84:b4',
  },
  {
    id: 'qc-e91',
    term: 'E91',
    gloss: 'Ekert’s key scheme: a shared singlet, random bases, and a Bell test of the source.',
    formal: 'Entanglement-based QKD that uses a CHSH test as its security check (Bergou §6.5).',
    first: 'q15-e91:b1',
  },
  {
    id: 'qc-device-independent',
    term: 'device-independent',
    gloss: 'Trusting no box: only the Bell score of the outputs certifies that the key is safe.',
    formal: 'Security derived from $P(a, b|x, y)$ alone; it needs a violation of every local model (eq. 6.7).',
    first: 'q15-e91:b3',
    introduces: 'notation',
  },
  {
    id: 'qc-secret-sharing',
    term: 'secret sharing',
    gloss: 'Splitting a secret so that it opens only when all holders work together.',
    formal: 'A scheme whose shares are individually uninformative and jointly sufficient (Bergou §6.6).',
    first: 'q15-sharing:b1',
  },
  {
    id: 'qc-logical-bit',
    term: 'logical states $|\\bar 0\\rangle, |\\bar 1\\rangle$',
    gloss: 'Two entangled pair states that stand for one bit of the key.',
    formal: '$|\\bar a\\rangle = \\cos\\theta|00\\rangle \\pm \\sin\\theta|11\\rangle$, with the minus sign for $a = 1$ (eq. 6.8).',
    first: 'q15-sharing:b2',
    introduces: 'notation',
  },
]
