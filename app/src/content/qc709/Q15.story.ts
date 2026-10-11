/**
 * Chapter Q15 scroll story (Physics 709; roles P + W). Beats per docs/roles/proposals/P-Q15-story.md §1, in both tracks, with the judge's rulings
 * (docs/roles/decisions/qc709-Q15Q17.md): Bergou's unit order (R2), five units with B92's two attacks in one (R3), BB84 bridged to Spin Lab Lecture 8 and
 * never re-derived (R4: the `bb84` kind draws it), the seeded B92 ledger first deferred (R4) and since built (rulings qc709-deferred-features D2: beat
 * q15-b92:b3 draws it in a split with the exact-rate sphere; the engine is `b92Rounds`, the kind is `bb84` with protocol 'b92'), θ = 22.5° for secret sharing (R5), the
 * probe attack in a `'deeper'` beat (R6), ⚑ P6.1–P6.4 cited only (R7), `crypto.ts` and the two POVM helpers built with the chapter (R8).
 *
 * Build notes against the plan (reported to the orchestrator):
 * - Phase `'books'` throughout (no 709 notes cover Bergou's Ch. 6): ramp beats are `books`, the clues `clue`, the probe beat `deeper`.
 * - Symbols. The plan's ciphertext `c` and Charlie's sign `c` clashed, and so did the probe angle `φ` and Bergou's probe states `|φ_jk⟩`: Charlie's and Bob's signs
 *   are `γ` and `β`, the probe angle is `ξ`, the overlap is `s`, a share is `u`. The two chapters that number B92's states and Bob's elements differently are
 *   reconciled in place: Chapter Q14 counts its states from 1 and calls the inconclusive element `E₀`; here the bit gives the number (`E₀`, `E₁` conclusive).
 * - Fractions in formulas are written `(…)/2`, never `\tfrac12`, where the half is a formula constant: the number reader would otherwise demand a claim
 *   for a constant. Where a half is a result (Eve's wrong guesses per failure), it has a claim (`q15EveWrongShare`).
 * - Bergou's "35.3%" for the never-wrong Eve is the truncation of 35.36%, not an error: no Correction box (the rulings list only Eq. 6.6 and p. 113).
 * - Two-qubit pictures label their balls `q1`, `q2` (the captions say whose qubit each is: Alice's and Eve's probe, then Bob's and Charlie's).
 *
 * Standing rules kept here: every derivation (both tracks) carries `view` on at least two steps, from kinds already shown in the SAME unit (W-709 #11); exactly one
 * notation beat per new space/notation (W-709 #12); no TeX command outside `$…$`; every number comes from Q15.values.ts (an engine call), never a typed literal;
 * cross-chapter references are named in words or via glossary ids and bridges, never plan ids.
 */
import type { AmpSource, BallState, Beat, CircuitStageState, AmplitudesState, Dir, MatrixGridState, MatrixSource, Scrub, StageLayout, StageState, TwoQubitState, Bb84State } from '../schema'
import type { Circuit } from '../../physics/qc/circuit'
import { B92_LEDGER, CH_MINUS, CH_PLUS, C_B92, C_COPY, C_PAD, C_PROBE, C_REUSE, C_SHARE, C_SPLIT, C_SX, HAX, NC_B_DIR, THETA_SHARE_DEG, V, at, claim, close, d } from './Q15.values'

/* ---------------------------------------------------------------------------------------------- */
/* Stage shorthand (plan "Stage shorthand"), as plain builder functions                              */
/* ---------------------------------------------------------------------------------------------- */
const circ = (C: Circuit, upTo: Scrub): CircuitStageState => ({ kind: 'circuit', circuit: C, upTo, shot: 'Q-WIRES' })
const amp = (C: Circuit, upTo: Scrub, mode: AmplitudesState['mode']): AmplitudesState => ({ kind: 'amplitudes', state: { circuit: C, upTo }, mode, shot: 'A-BARS' })
const ampBell = (bell: string, mode: AmplitudesState['mode'] = 'amplitude'): AmplitudesState => ({ kind: 'amplitudes', state: { bell }, mode, shot: 'A-BARS' })
const ball = (point: Dir, extra: Partial<Omit<BallState, 'kind' | 'point'>> = {}): BallState => ({ kind: 'bloch-ball', point, purity: true, shot: 'B-STD', ...extra })
const mx = (source: MatrixSource, extra: Partial<Omit<MatrixGridState, 'kind' | 'source'>> = {}): MatrixGridState => ({ kind: 'matrix', source, labels: 'kets', values: 'decimal', shot: 'M-GRID', ...extra })
const tq = (ket: AmpSource, extra: Partial<Omit<TwoQubitState, 'kind' | 'source'>> = {}): TwoQubitState => ({ kind: 'two-qubit', source: { ket }, labels: 'A-B', arrows: 'reduced', grid: 'T', shot: 'TQ-PAIR', ...extra })
const led = (s: Omit<Bb84State, 'kind'>): Bb84State => ({ kind: 'bb84', shot: 'K-LEDGER', ...s })
/** The seeded B92 ledger (the `bb84` kind with protocol 'b92', W-709 Q15 D2): one row per qubit, drawn from physics/qc/crypto.ts `b92Rounds`. */
const b92led = (s: Omit<Bb84State, 'kind' | 'protocol'>): Bb84State => ({ kind: 'bb84', protocol: 'b92', shot: 'K-LEDGER', ...s })
const split = (top: StageState, bottom: StageState): StageLayout => ({ layout: 'split', top, bottom })

/* The running states and matrices */
const D0: Dir = '+z' // |0⟩, B92's bit 0
const DPLUS: Dir = '+x' // |+⟩, B92's bit 1
/** Bob's detector for bit 0, drawn as its bare dyad |−⟩⟨−| (the real element is V.q15UsdScale times it). */
const E0_DYAD: MatrixSource = { outer: [{ ket: '-' }] }
/** Γ = (ρ₁ − ρ₀)/2, the Helstrom operator at even odds (coefficients ±½ are in the exact set). */
const GAMMA_SRC: MatrixSource = { lin: [{ c: '+1/2', src: { rho: { ket: { ket: '+' } } } }, { c: '-1/2', src: { rho: { ket: { ket: '0' } } } }] }
const NC_A: [Dir, Dir] = ['+x', '+z']
const NC_B: [Dir, Dir] = [NC_B_DIR[0], NC_B_DIR[1]]
const C_B92_1 = C_B92(1)
const PROBE0 = C_PROBE(0)
const PROBE90 = C_PROBE(90)
const SHARE0 = C_SHARE(0)
const TH = d(THETA_SHARE_DEG, 1)
/** How many rounds the bb84 stage kind draws (BB84_LIMITS.rows, asserted equal in Q15.test.ts): a longer seeded run shows its last rows only. */
const BB84_ROWS = 12

/* ---------------------------------------------------------------------------------------------- */
/* Claims shared across beats (each states the sentence it backs)                                    */
/* ---------------------------------------------------------------------------------------------- */
const K = {
  caesarOk: claim('q15CaesarOk', 'Caesar shifted by three letters reads Fdhvdu', () => V.q15CaesarOk === 1),
  caesarShift: claim('q15CaesarShift', 'the shift from C to F is three places', () => close(V.q15CaesarShift, 3)),
  padCipher: claim('q15PadCipher', 'with key 1 and message 1, the message wire reads c = 0 after one CNOT', () => close(V.q15PadCipher, 1 ^ 1)),
  padBack: claim('q15PadBack', 'a second CNOT returns the message bit 1', () => close(V.q15PadBack, 1 ^ 1 ^ 1)),
  copyOverlap: claim('q15CopyOverlap', 'a CNOT-copied |+⟩ is found as |++⟩ with chance 0.5', () => close(V.q15CopyOverlap, 0.5, 1e-9)),
  reuseLeak: claim('q15ReuseLeak', 'the third wire reads m₁ ⊕ m₂ = 1 for m₁ = 1, m₂ = 0', () => close(V.q15ReuseLeak, 1 ^ 0)),
  overlap: claim('q15Overlap', 'the overlap |⟨0|+⟩| is 0.7071', () => close(V.q15Overlap, Math.SQRT1_2, 1e-9)),
  b92Amp: claim('q15B92Amp', 'the bars on |10⟩ and |11⟩ are each 0.7071 long', () => {
    const v = at(C_B92_1, 1)
    return close(V.q15B92Amp, Math.SQRT1_2, 1e-9) && close(Math.hypot(v[2].re, v[2].im), V.q15B92Amp, 1e-9) && close(Math.hypot(v[0].re, v[0].im) + Math.hypot(v[1].re, v[1].im), 0, 1e-9)
  }),
  overlapSq: claim('q15OverlapSq', 'the squared overlap |⟨0|+⟩|² is 0.5', () => close(V.q15OverlapSq, 0.5, 1e-9)),
  usdScale: claim('q15UsdScale', 'Bob’s detector for bit 0 is 0.5858 times the dyad |−⟩⟨−|', () => close(V.q15UsdScale, 1 / (1 + Math.SQRT1_2), 1e-9)),
  kept: claim('q15B92Kept', 'Bob answers 0.2929 of the time', () => close(V.q15B92Kept, 1 - Math.SQRT1_2, 1e-9)),
  inconcl: claim('q15B92Inconcl', 'and is unsure the other 0.7071', () => close(V.q15B92Inconcl, Math.SQRT1_2, 1e-9)),
  q0: claim('q15B92Q0', 'with no Eve the key error rate is 0', () => close(V.q15B92Q0, 0)),
  eveFail: claim('q15EveUsdFail', 'a never-wrong Eve fails 0.7071 of the time', () => close(V.q15EveUsdFail, Math.SQRT1_2, 1e-9)),
  wrongShare: claim('q15EveWrongShare', 'half of her failures become wrong key bits', () => close(V.q15EveWrongShare, 0.5, 1e-9)),
  qUsd: claim('q15QUsdEve', 'so Q = 0.3536', () => close(V.q15QUsdEve, Math.SQRT1_2 / 2, 1e-9)),
  ledgerKept: claim('q15B92LedgerKept', 'Bob answers about 0.2929 of the seeded run (within 4.5 standard deviations)', () => {
    const n = B92_LEDGER.count
    return Number.isInteger(V.q15B92LedgerKept) && Math.abs(V.q15B92LedgerKept / n - V.q15B92Kept) < 4.5 * Math.sqrt((V.q15B92Kept * (1 - V.q15B92Kept)) / n)
  }),
  ledgerWrong: claim('q15B92LedgerWrong', 'about 0.3536 of the bits Bob kept in the seeded run are wrong (within 4.5 standard deviations)', () => {
    const m = V.q15B92LedgerKept
    return Number.isInteger(V.q15B92LedgerWrong) && Math.abs(V.q15B92LedgerWrong / m - V.q15QUsdEve) < 4.5 * Math.sqrt((V.q15QUsdEve * (1 - V.q15QUsdEve)) / m)
  }),
  usdRight: claim('q15EveUsdRight', 'the never-wrong Eve holds the right bit in 0.6464 of kept rounds', () => close(V.q15EveUsdRight, 1 - Math.SQRT1_2 / 2, 1e-9)),
  qMin: claim('q15QMinEve', 'the minimum-error Eve leaves Q = 0.1464', () => close(V.q15QMinEve, (1 - Math.SQRT1_2) / 2, 1e-9)),
  minRight: claim('q15EveMinRight', 'and holds the right bit in 0.8536 of kept rounds', () => close(V.q15EveMinRight, (1 + Math.SQRT1_2) / 2, 1e-9)),
  gammaNorm: claim('q15GammaNorm', 'Γ has trace norm 0.7071 = √(1 − s²)', () => close(V.q15GammaNorm, Math.sqrt(1 - V.q15Overlap ** 2), 1e-9)),
  gammaHi: claim('q15GammaHi', 'Γ’s eigenvalues are ±0.3536', () => close(V.q15GammaHi, Math.SQRT1_2 / 2, 1e-9)),
  bridgeQ: claim('q15BridgeQ', 'intercept–resend leaves Q = 0.25', () => close(V.q15BridgeQ, 0.25, 1e-9)),
  probeX0: claim('q15ProbeX0', 'an untouched qubit has x-error 0', () => close(V.q15ProbeX0, 0)),
  probeGuess0: claim('q15ProbeGuess0', 'a probe that does nothing guesses a z bit with chance 0.5', () => close(V.q15ProbeGuess0, 0.5, 1e-9)),
  probeX90: claim('q15ProbeX90', 'a quarter-turn probe gives Bob an x-error of 0.1464', () => close(V.q15ProbeX90, (1 - Math.cos(Math.PI / 4)) / 2, 1e-9)),
  probeGuess90: claim('q15ProbeGuess90', 'Eve then names a z bit with chance 0.8536', () => close(V.q15ProbeGuess90, (1 + Math.sin(Math.PI / 4)) / 2, 1e-9)),
  probeR90: claim('q15ProbeR90', 'Alice’s arrow shortens to 0.7071', () => close(V.q15ProbeR90, Math.cos(Math.PI / 4), 1e-9)),
  probeRE90: claim('q15ProbeRE90', 'and so does the probe’s arrow', () => close(V.q15ProbeRE90, Math.cos(Math.PI / 4), 1e-9)),
  probeQ180: claim('q15ProbeQ180', 'a half-turn probe leaves Q = 0.25', () => close(V.q15ProbeQ180, 0.25, 1e-9)),
  sameX: claim('q15SameX', 'both sides reading x agree with chance 0', () => close(V.q15SameX, 0)),
  sameY: claim('q15SameY', 'both sides reading y agree with chance 0', () => close(V.q15SameY, 0)),
  diffXY: claim('q15DiffXY', 'x on one side and y on the other agree with chance 0.5', () => close(V.q15DiffXY, 0.5, 1e-9)),
  chshSinglet: claim('q15ChshSinglet', 'the singlet scores 2.8284 at Chapter Q10’s settings', () => close(V.q15ChshSinglet, 2 * Math.SQRT2, 1e-9)),
  chshProduct: claim('q15ChshProduct', 'Eve’s fixed product scores 1.4142 there', () => close(V.q15ChshProduct, Math.SQRT2, 1e-9)),
  chshProductMax: claim('q15ChshProductMax', 'and 2 at best at any settings', () => close(V.q15ChshProductMax, 2, 1e-9)),
  eq66Chsh: claim('q15Eq66Chsh', 'Φ⁺ at the settings z, x scores exactly 2', () => close(V.q15Eq66Chsh, 2, 1e-9)),
  eq66Diff: claim('q15Eq66Diff', 'with different settings every pair (a, b) has chance 1/4', () => close(V.q15Eq66Diff, 0.25, 1e-9)),
  eq66Local: claim('q15Eq66LocalGap', 'two hidden coins reproduce the corrected table exactly', () => close(V.q15Eq66LocalGap, 0)),
  splitShare: claim('q15SplitShare', 'with k = 1 and r = 1 the share wire reads u = 0 after two columns', () => close(V.q15SplitShare, 1 ^ 1)),
  splitBack: claim('q15SplitBack', 'and k = 1 again after the third', () => close(V.q15SplitBack, 1 ^ 1 ^ 1)),
  shareR: claim('q15ShareR', 'each local arrow has length 0.7071', () => close(V.q15ShareR, Math.cos(2 * (Math.PI / 8)), 1e-9)),
  bobPlus: claim('q15ShareBobPlus', 'Bob reads +x with chance 0.5', () => close(V.q15ShareBobPlus, 0.5, 1e-9)),
  charlieX: claim('q15ShareCharlieX', 'Charlie’s arrow has x-part 0.7071', () => close(V.q15ShareCharlieX, Math.sin(2 * (Math.PI / 8)), 1e-9)),
  shareOverlap: claim('q15ShareOverlap', 'Charlie’s two states overlap by cos 2θ = 0.7071', () => close(V.q15ShareOverlap, Math.cos(2 * (Math.PI / 8)), 1e-9)),
  shareUsd: claim('q15ShareUsd', 'so his never-wrong reading succeeds with chance 0.2929', () => close(V.q15ShareUsd, 1 - Math.cos(2 * (Math.PI / 8)), 1e-9)),
  cheatGap: claim('q15CheatGap', 'a Charlie who reads first leaves the public record unchanged (largest gap 0)', () => close(V.q15CheatGap, 0)),
  cheatKnows: claim('q15CheatKnows', 'and names the bit every time', () => close(V.q15CheatKnows, 1, 1e-9)),
  zHonest: claim('q15ZAgreeHonest', 'an honest pair agrees on z readings every time', () => close(V.q15ZAgreeHonest, 1, 1e-9)),
  zGrab: claim('q15ZAgreeGrab', 'after the grab their z readings agree only 0.5 of the time', () => close(V.q15ZAgreeGrab, 0.5, 1e-9)),
  cheatEarly: claim('q15CheatEarlyGuess', 'a σ_z applied first leaves his guess at 0.5', () => close(V.q15CheatEarlyGuess, 0.5, 1e-9)),
}

/* ---------------------------------------------------------------------------------------------- */
/* q15-otp — A key used once hides anything                                                         */
/* ---------------------------------------------------------------------------------------------- */

const otp: Beat[] = [
  {
    id: 'q15-otp:b1',
    phase: 'books',
    text:
      'A [[qc-cipher|cipher]] swaps each letter for another letter. Julius Caesar moved every letter three places on, so Caesar became Fdhvdu. ' +
      'The shift of three is the [[qc-secret-key|secret key]]. Anyone who knows the key can undo the swap.',
    formal:
      'A substitution [[qc-cipher|cipher]] maps letters to letters (Bergou §6.2, p. 106). Caesar\u2019s shift by three sends \u201cCaesar\u201d to \u201cFdhvdu\u201d. ' +
      'The shift is the [[qc-secret-key|key]], and one fixed shift falls at once to anyone who tries all twenty-six.',
    caption: 'a key wire and a message wire, with the cursor before the first gate',
    stage: circ(C_PAD, 0),
    claims: [K.caesarOk, K.caesarShift],
  },
  {
    id: 'q15-otp:b2',
    phase: 'books',
    text:
      'Now use a fresh random shift for every letter, and never use it again. The cipher can then never be broken: this is the [[qc-one-time-pad|one-time pad]]. ' +
      'For bits, the message bit is $m$, the key bit is $k$, and [[qc-xor|XOR]] $\\oplus$ adds bits and drops the carry. ' +
      'The cipher bit is $c = m \\oplus k$ (<<qc-l8-key|Spin Lab 8.5>>). Adding $k$ a second time gives $m$ back. <<qc-f7-xor|Chapter F7>> has more on XOR.',
    formal:
      'With a random key as long as the message, used once, the cipher cannot be broken: the [[qc-one-time-pad|one-time pad]] (Bergou §6.2, p. 106). ' +
      'On bits, with message $m$ and key $k$, the cipher is $c = m \\oplus k$ and $c \\oplus k = m$ (<<qc-l8-key|Spin Lab 8.5>>). The algorithm may be public; only the key is secret. <<qc-f7-xor|Chapter F7>> develops XOR and its signs.',
    caption: 'a CNOT from the key adds $k$ to $m$: with $k = 1$ and $m = 1$ the message wire now reads $c = 0$',
    captionFormal: 'CNOT is XOR on basis states: $|k, m\\rangle \\to |k, m \\oplus k\\rangle$, here $|11\\rangle \\to |10\\rangle$',
    stage: split(circ(C_PAD, 1), amp(C_PAD, 1, 'probability')),
    claims: [K.padCipher, K.padBack],
    derivation: {
      result: 'c \\oplus k = m',
      ground: [
        { tex: 'c = m \\oplus k', why: 'XOR adds the key bit to the message bit.', view: circ(C_PAD, 1), viewCaption: 'the key added: the message wire now holds $c$' },
        {
          tex: 'c \\oplus k = (m \\oplus k) \\oplus k',
          why: 'The receiver adds the same key bit to the cipher bit.',
          view: amp(C_PAD, 1, 'probability'),
          viewCaption: 'after the first CNOT the register is $|10\\rangle$: key 1, cipher bit 0',
        },
        {
          tex: 'c \\oplus k = m \\oplus (k \\oplus k) = m',
          why: 'A bit added to itself is 0, and adding 0 changes nothing.',
          view: amp(C_PAD, 2, 'probability'),
          viewCaption: 'after the second CNOT the message wire is back to $m = 1$',
        },
      ],
      formal: [
        { tex: '|k, m\\rangle \\to |k, m \\oplus k\\rangle', why: 'CNOT acts as XOR on the basis states.', view: circ(C_PAD, 1) },
        { tex: 'c \\oplus k = m \\oplus (k \\oplus k) = m', why: 'XOR is associative and $k \\oplus k = 0$.', view: amp(C_PAD, 2, 'probability') },
      ],
    },
  },
  {
    id: 'q15-otp:b3',
    phase: 'books',
    text:
      'The pad moves the problem to [[qc-key-distribution|key distribution]]: two people must share the same secret key. A courier can be robbed, and a classical key can be copied unseen. ' +
      'A [[qc-cnot|CNOT]] copies a [[qubit|qubit]] that is $|0\\rangle$ or $|1\\rangle$. But it turns $|+\\rangle$ into an entangled pair, not two copies, ' +
      `and the pair has chance $${d(V.q15CopyOverlap, 1)}$ of being found as $|{+}{+}\\rangle$.`,
    formal:
      'Key distribution is the hard part (Bergou §6.2, p. 106). A classical bit is copied silently; an unknown [[qubit|qubit]] state is not, by the [[qc-no-cloning|no-cloning theorem]] of Chapter Q13. ' +
      `A CNOT copies $|0\\rangle$ and $|1\\rangle$, but sends $|{+}\\rangle|0\\rangle$ to the [[qc-bell-state|Bell state]] $\\Phi^+$, which is found as the wanted $|{+}{+}\\rangle$ with chance $${d(V.q15CopyOverlap, 1)}$.`,
    caption: 'copying $|+\\rangle$ with a CNOT gives an entangled pair, not two copies',
    captionFormal: `$\\mathrm{CNOT}|{+}0\\rangle = \\Phi^+$ and $|\\langle{+}{+}|\\Phi^+\\rangle|^2 = ${d(V.q15CopyOverlap, 1)}$`,
    stage: split(circ(C_COPY, 1), amp(C_COPY, 1, 'amplitude')),
    claims: [K.copyOverlap],
  },
  {
    id: 'q15-otp:b4',
    phase: 'clue',
    text:
      'Alice pads a first message $m_1$ and a second message $m_2$ with the same key $k$. Eve sees the two cipher texts $c_1 = m_1 \\oplus k$ and $c_2 = m_2 \\oplus k$. ' +
      'What can she work out without the key?',
    formal:
      'Two messages share one pad: $c_1 = m_1 \\oplus k$ and $c_2 = m_2 \\oplus k$. What does $c_1 \\oplus c_2$ equal, and does Eve need the key to compute it?',
    caption: 'two messages under one key: the third column will add the two cipher texts',
    stage: circ(C_REUSE, 0),
    reveal: {
      text:
        'The key cancels: $c_1 \\oplus c_2 = m_1 \\oplus m_2$. Eve learns how the messages differ, with no key at all. That is why the pad is used once.',
      formal:
        '$c_1 \\oplus c_2 = m_1 \\oplus m_2$, because $k \\oplus k = 0$: reusing a pad hands Eve the XOR of the two messages, so the secrecy needs every key bit used once.',
      caption: 'the third wire ends as $c_1 \\oplus c_2 = m_1 \\oplus m_2$, and its column never touches the key wire; here it reads 1',
      stage: split(circ(C_REUSE, 3), amp(C_REUSE, 3, 'probability')),
      claims: [K.reuseLeak],
    },
  },
]

/* ---------------------------------------------------------------------------------------------- */
/* q15-b92 — Two look-alike states carry a key                                                      */
/* ---------------------------------------------------------------------------------------------- */

const b92: Beat[] = [
  {
    id: 'q15-b92:b1',
    phase: 'books',
    text:
      '[[qc-qkd|Quantum key distribution]] shares a key by sending quantum states. In Bennett\u2019s [[qc-b92|B92 scheme]], Alice\u2019s bit $a$ picks a qubit: bit 0 is $|\\psi_0\\rangle = |0\\rangle$ and bit 1 is $|\\psi_1\\rangle = |+\\rangle$. ' +
      `The two states overlap by $s = |\\langle\\psi_0|\\psi_1\\rangle| = ${d(V.q15Overlap, 4)}$, so no reading tells them apart every time (Chapter Q14).`,
    formal:
      'B92 (Bergou §6.3, p. 107) encodes the bit $a$ as $|\\psi_0\\rangle = |0\\rangle$ or $|\\psi_1\\rangle = |+\\rangle$, ' +
      `with overlap $s = |\\langle\\psi_0|\\psi_1\\rangle| = ${d(V.q15Overlap, 4)}$. Overlapping states admit no perfect discrimination (Chapter Q14), which is the protocol\u2019s protection.`,
    caption: `bit 1 sends $|+\\rangle$: the bars sit on $|10\\rangle$ and $|11\\rangle$, each ${d(V.q15B92Amp, 4)} long`,
    captionFormal: `controlled-H: $|a\\rangle|0\\rangle \\to |a\\rangle|\\psi_a\\rangle$; for $a = 1$ the bars on $|10\\rangle$ and $|11\\rangle$ are ${d(V.q15B92Amp, 4)} long`,
    stage: split(circ(C_B92_1, 1), amp(C_B92_1, 1, 'amplitude')),
    claims: [K.overlap, K.b92Amp],
  },
  {
    id: 'q15-b92:b2',
    phase: 'books',
    introduces: ['qc-qber'],
    text:
      'Bob reads each qubit with the [[qc-unambiguous-discrimination|never-wrong measurement]] of Chapter Q14. ' +
      `It answers ${d(V.q15B92Kept, 4)} of the time and otherwise says \u201cunsure\u201d. Bob tells Alice which rounds worked, not the answers. ` +
      'Those bits are the [[qc-raw-key|raw key]]. Its error rate is $Q$, the share of bits on which Alice and Bob differ. With no Eve, $Q = 0$.',
    formal:
      `Bob applies the optimal unambiguous measurement: success $1 - s = ${d(V.q15B92Kept, 4)}$, inconclusive $s = ${d(V.q15B92Inconcl, 4)}$. ` +
      'His conclusive elements are $E_0 \\propto |{-}\\rangle\\langle{-}|$ and $E_1 \\propto |1\\rangle\\langle 1|$, so $E_0|\\psi_1\\rangle = 0$ and a click of $E_i$ names bit $i$ (Chapter Q14 counts its states from 1 and calls the inconclusive element $E_0$). ' +
      'The conclusive rounds form the [[qc-raw-key|raw key]]; the key error rate $Q$ is the fraction of its bits on which Alice and Bob differ, here $Q = 0$.',
    caption: `Bob\u2019s detector for bit 0 (its dyad along $|-\\rangle$, real size ${d(V.q15UsdScale, 4)} times it) never fires on $|+\\rangle$; below, the two states`,
    captionFormal: `$E_0 = |{-}\\rangle\\langle{-}|/(1 + s)$ with $1/(1 + s) = ${d(V.q15UsdScale, 4)}$ (dyad drawn), so $E_0|\\psi_1\\rangle = 0$; below, $|0\\rangle$ and $|+\\rangle$`,
    stage: split(mx(E0_DYAD), ball(D0, { compare: DPLUS })),
    claims: [K.kept, K.inconcl, K.q0, K.usdScale, K.overlap],
  },
  {
    id: 'q15-b92:b3',
    phase: 'books',
    text:
      `Eve can read each qubit with the same never-wrong method. She fails ${d(V.q15EveUsdFail, 4)} of the time, and must then guess what to send on. ` +
      `Half of those guesses are wrong. Bob\u2019s answers name the state he received, so each wrong guess becomes a wrong key bit: $Q = ${d(V.q15QUsdEve, 4)}$. ` +
      'In the ledger, her \u201cunsure\u201d rows are the guesses, and the wrong kept bits sit in those rows.',
    formal:
      `A never-wrong Eve fails with probability $s = ${d(V.q15EveUsdFail, 4)}$ and then resends one of the two states at random, wrong half the time. ` +
      `Bob\u2019s success is $1 - s$ whichever state he receives, so $Q = s/2 = ${d(V.q15QUsdEve, 4)}$ (Bergou p. 107). ` +
      'In the seeded ledger a kept bit is wrong exactly when Eve resent the other state, which happens only after a failed reading.',
    caption:
      `above, a seeded run of ${B92_LEDGER.count} qubits, the last ${B92_LEDGER.last} rows drawn: Eve\u2019s \u201cunsure\u201d rows are her guesses. Bob kept ${d(V.q15B92LedgerKept, 0)} and ${d(V.q15B92LedgerWrong, 0)} of those are wrong, ` +
      `near $Q = ${d(V.q15QUsdEve, 4)}$; below, the two states Eve cannot always tell apart`,
    captionFormal:
      `seeded run of ${B92_LEDGER.count} qubits with a never-wrong Eve, the last ${B92_LEDGER.last} rows drawn: ${d(V.q15B92LedgerWrong, 0)} of the ${d(V.q15B92LedgerKept, 0)} kept bits are wrong, near $Q = s/2 = ${d(V.q15QUsdEve, 4)}$; ` +
      'below, $|\\psi_0\\rangle$ and $|\\psi_1\\rangle$',
    stage: split(
      b92led({ rounds: { seed: B92_LEDGER.seed, count: B92_LEDGER.count }, eve: 'usd', sift: true, last: B92_LEDGER.last, readouts: ['kept', 'qber'] }),
      ball(D0, { compare: DPLUS }),
    ),
    claims: [K.eveFail, K.wrongShare, K.qUsd, K.ledgerKept, K.ledgerWrong],
    derivation: {
      result: 'Q = s/2',
      ground: [
        {
          tex: '\\text{Eve fails} = s',
          why: `Her never-wrong reading fails as often as Bob\u2019s: ${d(V.q15EveUsdFail, 4)} of the time.`,
          view: ball(D0, { compare: DPLUS }),
          viewCaption: 'the two states Eve cannot always tell apart',
        },
        {
          tex: '\\text{wrong resend} = \\text{Eve fails} \\times \\text{half}',
          why: `She guesses between two states, and half of her failures send the wrong one: ${d(V.q15QUsdEve, 4)} of all rounds.`,
        },
        {
          tex: 'Q = s/2',
          why: `Bob keeps the same share of every kind of round, so the wrong resends are ${d(V.q15QUsdEve, 4)} of his kept rounds.`,
          view: mx(E0_DYAD),
          viewCaption: 'Bob\u2019s detector for bit 0, drawn as its dyad: it clicks on the state he received, not the one Alice sent',
        },
      ],
      formal: [
        { tex: 'P_{\\text{fail}} = s,\\quad P_{\\text{wrong}} = s/2', why: 'A random resend after a failure is wrong half the time.', view: ball(D0, { compare: DPLUS }) },
        { tex: 'Q = P_{\\text{wrong}} = s/2', why: 'Bob\u2019s conclusive rate is $1 - s$ for either state, independent of the error, so the conditional rate is the same share.', view: mx(E0_DYAD) },
      ],
    },
  },
  {
    id: 'q15-b92:b4',
    phase: 'books',
    text:
      `A smarter Eve always answers. She uses the [[qc-minimum-error-discrimination|best split]] of Chapter Q14, and is right ${d(V.q15EveMinRight, 4)} of the time. ` +
      `Each wrong guess becomes a wrong key bit, so Bob\u2019s raw key has $Q = ${d(V.q15QMinEve, 4)}$. That is less noise than before, and she knows more. ` +
      'Call her error rate $P_E$. Chapter Q14 found it from Helstrom\u2019s operator $\\Gamma$, half the difference of the two states\u2019 density matrices.',
    formal:
      'A minimum-error Eve measures along the eigen-axis of $\\Gamma = (\\rho_1 - \\rho_0)/2$, where $\\rho_a = |\\psi_a\\rangle\\langle\\psi_a|$ (Unit 14.5). ' +
      `Her error is $P_E = (1 - \\sqrt{1 - s^2})/2 = ${d(V.q15QMinEve, 4)}$. Each wrong resend is a wrong raw-key bit, so $Q = P_E$, and she holds the right bit in ${d(V.q15EveMinRight, 4)} of the kept rounds.`,
    caption: `Eve\u2019s best axis, drawn for $|0\\rangle$: P(+) is her chance of guessing right, ${d(V.q15EveMinRight, 4)}, and by symmetry the same for $|+\\rangle$`,
    captionFormal: `$P_E = ${d(V.q15QMinEve, 4)}$: right ${d(V.q15EveMinRight, 4)} for either state, along the axis of $\\Gamma$`,
    stage: ball(D0, { compare: DPLUS, measure: HAX }),
    claims: [K.qMin, K.minRight, K.overlapSq, K.gammaNorm, K.gammaHi],
    derivation: {
      result: 'Q = P_E = (1 - \\sqrt{1 - s^2})/2',
      ground: [
        {
          tex: 'P_E = (1 - \\sqrt{1 - s^2})/2',
          why: 'This is the fewest mistakes any guess can make for two equally likely states (Chapter Q14, Helstrom).',
          view: ball(D0, { compare: DPLUS, measure: HAX }),
          viewCaption: 'the best axis for telling $|0\\rangle$ from $|+\\rangle$',
        },
        {
          tex: `s^2 = ${d(V.q15OverlapSq, 1)} \\Rightarrow \\sqrt{1 - s^2} = ${d(V.q15GammaNorm, 4)}`,
          why: `The squared overlap of $|0\\rangle$ and $|+\\rangle$ is ${d(V.q15OverlapSq, 1)}, and Helstrom\u2019s operator $\\Gamma$ has eigenvalues $\\pm ${d(V.q15GammaHi, 4)}$.`,
          view: mx(GAMMA_SRC, { spectrum: 'bars' }),
          viewCaption: `$\\Gamma$\u2019s eigenvalues are $\\pm ${d(V.q15GammaHi, 4)}$`,
        },
        {
          tex: 'Q = P_E = (1 - \\sqrt{1 - s^2})/2',
          why: `Each wrong guess is a wrong kept bit, so the key error rate is her error rate, ${d(V.q15QMinEve, 4)}.`,
          view: ball(D0, { compare: DPLUS, measure: HAX }),
          viewCaption: `right ${d(V.q15EveMinRight, 4)} of the time`,
        },
      ],
      formal: [
        {
          tex: `P_E = (1 - \\lVert\\Gamma\\rVert_1)/2,\\quad \\lVert\\Gamma\\rVert_1 = ${d(V.q15GammaNorm, 4)}`,
          why: 'Helstrom\u2019s bound, with $\\lVert\\Gamma\\rVert_1 = \\sqrt{1 - s^2}$ the trace norm of $\\Gamma$ (Unit 14.5).',
          view: mx(GAMMA_SRC, { spectrum: 'bars' }),
        },
        { tex: 'Q = P_E = (1 - \\sqrt{1 - s^2})/2', why: 'Bob\u2019s conclusive rate does not depend on the resent state, so every wrong resend is a wrong kept bit.', view: ball(D0, { compare: DPLUS, measure: HAX }) },
      ],
    },
  },
  {
    id: 'q15-b92:b5',
    phase: 'clue',
    text:
      `One Eve causes $Q = ${d(V.q15QUsdEve, 4)}$, the other $Q = ${d(V.q15QMinEve, 4)}$. Alice and Bob will test the error rate. Which Eve must they design the test against?`,
    formal:
      'Rank the two attacks by the key error rate $Q$ they leave and by the share of kept bits Eve holds. Which one sets the bar for Alice and Bob\u2019s check?',
    caption: 'the two states Eve must tell apart; the quieter attack uses the best axis',
    stage: ball(D0, { compare: DPLUS }),
    reveal: {
      text:
        `The quieter one. The minimum-error Eve causes fewer errors and knows more: ${d(V.q15EveMinRight, 4)} of the bits against ${d(V.q15EveUsdRight, 4)}. ` +
        `Alice and Bob\u2019s check must notice an error rate near ${d(V.q15QMinEve, 4)}, above the channel\u2019s own noise.`,
      formal:
        `The minimum-error attack dominates: lower $Q$ (${d(V.q15QMinEve, 4)} against ${d(V.q15QUsdEve, 4)}) and more information (${d(V.q15EveMinRight, 4)} against ${d(V.q15EveUsdRight, 4)} of the kept bits). ` +
        `The test must resolve $Q$ near ${d(V.q15QMinEve, 4)} above the channel\u2019s own noise (Bergou p. 108).`,
      caption: `Eve\u2019s best axis beside $\\Gamma$\u2019s two eigenvalues, $\\pm ${d(V.q15GammaHi, 4)}$: her error is ${d(V.q15QMinEve, 4)}`,
      captionFormal: `the quieter attack: $Q = ${d(V.q15QMinEve, 4)}$ and right ${d(V.q15EveMinRight, 4)}`,
      stage: split(mx(GAMMA_SRC, { spectrum: 'bars' }), ball(D0, { compare: DPLUS, measure: HAX })),
      claims: [K.qMin, K.qUsd, K.minRight, K.usdRight, K.gammaHi],
    },
  },
]

/* ---------------------------------------------------------------------------------------------- */
/* q15-bb84 — BB84: no error means no information                                                    */
/* ---------------------------------------------------------------------------------------------- */

const bb84: Beat[] = [
  {
    id: 'q15-bb84:b1',
    phase: 'books',
    text:
      '[[qc-bb84|BB84]] uses two bases: $z$ with $|0\\rangle, |1\\rangle$ and $x$ with $|{+}\\rangle, |{-}\\rangle$. ' +
      'Alice sends a random bit in a random basis, and Bob measures in a random basis. They keep the rounds where the bases match. <<qc-l8-bb84|Spin Lab sent them as photons>>.',
    formal:
      'Alice sends a random bit in a random basis, $z$ or $x$; Bob measures in a random basis; they keep the matching-basis rounds (Bergou §6.4, p. 108; <<qc-l8-bb84|Spin Lab 8.6>>). ' +
      'The ledger writes $z$ as H/V and $x$ as D/A polarization.',
    caption: `a seeded run of 16 photons, the last ${BB84_ROWS} drawn: the rounds with matching bases are kept, the rest dimmed; the readout counts all 16`,
    captionFormal: `a seeded run of 16 rounds, the last ${BB84_ROWS} drawn: matching-basis rounds are marked kept; the readout counts all 16`,
    stage: led({ rounds: { seed: 84, count: 16 }, sift: true, readouts: ['kept'] }),
  },
  {
    id: 'q15-bb84:b2',
    phase: 'books',
    text:
      `Suppose Eve measures every photon in a random basis and sends on what she found. Then the kept bits have error rate $Q = ${d(V.q15BridgeQ, 2)}$. ` +
      '<<qc-l8-attack|Spin Lab works this out step by step>>, and <<qc-l8-test|shows how a test sample catches her>>.',
    formal:
      `[[qc-intercept-resend|Intercept\u2013resend]] gives $Q = ${d(V.q15BridgeQ, 2)}$ on the sifted key (Bergou p. 109; <<qc-l8-attack|Spin Lab 8.7>>). ` +
      'A public test sample of $N_{\\text{test}}$ bits misses her with chance $(1 - Q)^{N_{\\text{test}}}$ (<<qc-l8-test|Spin Lab 8.8>>, where the sample size is called $m$).',
    caption: 'a seeded run of 1000 photons with Eve on every one: the share of kept bits that are wrong, with its 1σ band, beside the exact error rate, and how many kept bits Eve knows',
    captionFormal: 'one seeded run, Eve on every photon: the kept bits that are wrong, with a 1σ band, against the exact error rate $Q$, and how many kept bits Eve knows',
    stage: led({ rounds: { seed: 84, count: 1000 }, eve: 'all', sift: true, readouts: ['qber', 'eve-knows'] }),
    claims: [K.bridgeQ],
  },
  {
    id: 'q15-bb84:b3',
    phase: 'books',
    text:
      'A subtler Eve touches each qubit with a probe of her own, an [[qc-ancilla|ancilla]] that starts in $|0\\rangle$. After she acts, her probe and Alice\u2019s qubit are in one joint state. ' +
      'For an input $|0\\rangle$ it is $|0\\rangle|\\varphi_{00}\\rangle + |1\\rangle|\\varphi_{01}\\rangle$, where $|\\varphi_{jk}\\rangle$ is the probe\u2019s state when Alice\u2019s qubit started in $j$ and ends in $k$.',
    formal:
      'Eve appends an ancilla $|0\\rangle_e$ and applies a unitary $U$: $U|0\\rangle|0\\rangle_e = |0\\rangle|\\varphi_{00}\\rangle + |1\\rangle|\\varphi_{01}\\rangle$ and ' +
      '$U|1\\rangle|0\\rangle_e = |0\\rangle|\\varphi_{10}\\rangle + |1\\rangle|\\varphi_{11}\\rangle$ (Eq. 6.1, p. 109). Unitarity imposes Eq. 6.2 on the unnormalized probe states $|\\varphi_{jk}\\rangle$.',
    caption: 'one example of Eve\u2019s $U$: a rotation of her probe, controlled by Alice\u2019s qubit',
    stage: circ(PROBE90, 1),
  },
  {
    id: 'q15-bb84:b4',
    phase: 'books',
    text:
      'Ask for no errors in either basis. In the $z$ basis that means $|\\varphi_{01}\\rangle = |\\varphi_{10}\\rangle = 0$. In the $x$ basis it forces $|\\varphi_{00}\\rangle = |\\varphi_{11}\\rangle$. ' +
      'Then Eve\u2019s probe ends the same whatever Alice sent. This is the [[qc-information-disturbance|rule of information and disturbance]]: no errors, no information.',
    formal:
      'No $z$ errors force $|\\varphi_{01}\\rangle = |\\varphi_{10}\\rangle = 0$; no $x$ errors force Eqs. 6.4\u20136.5, hence $|\\varphi_{00}\\rangle = |\\varphi_{11}\\rangle$. ' +
      'Then $U|a\\rangle|0\\rangle_e = |a\\rangle|\\varphi_{00}\\rangle$ is a product state, so the probe holds nothing about $a$ (Bergou p. 110).',
    caption: 'a probe that causes no error leaves a product state: both arrows keep full length (q1 is Alice\u2019s qubit, q2 Eve\u2019s probe)',
    captionFormal: 'no-error probe: a product state, $|r_1| = |r_2| = 1$ (q1 Alice\u2019s qubit, q2 Eve\u2019s probe)',
    stage: tq({ circuit: PROBE0, upTo: 1 }, { labels: 'q1-q2', readouts: ['rLength'], grid: 'none' }),
    claims: [K.probeX0, K.probeGuess0],
    derivation: {
      result: 'U|a\\rangle|0\\rangle_e = |a\\rangle|\\varphi_{00}\\rangle',
      ground: [
        {
          tex: 'U|0\\rangle|0\\rangle_e = |0\\rangle|\\varphi_{00}\\rangle + |1\\rangle|\\varphi_{01}\\rangle',
          why: 'Eve\u2019s probe may leave Alice\u2019s qubit alone or flip it, each with its own probe state.',
          view: circ(PROBE90, 1),
          viewCaption: 'one example of Eve\u2019s $U$',
        },
        {
          tex: '|\\varphi_{01}\\rangle = |\\varphi_{10}\\rangle = 0',
          why: 'No error in the $z$ basis means a 0 never turns into a 1, and a 1 never turns into a 0.',
          view: tq({ circuit: PROBE90, upTo: 1 }, { labels: 'q1-q2', readouts: ['rLength'], grid: 'none' }),
          viewCaption: 'a probe that does act shortens both arrows (q1 Alice\u2019s qubit, q2 Eve\u2019s probe)',
        },
        {
          tex: '|\\varphi_{00}\\rangle = |\\varphi_{11}\\rangle',
          why: 'With those two zeros, no error in the $x$ basis leaves only this (Eqs. 6.4–6.5).',
          view: tq({ circuit: PROBE0, upTo: 1 }, { labels: 'q1-q2', readouts: ['rLength'], grid: 'none' }),
          viewCaption: 'no error: a product state, both arrows full length',
        },
        {
          tex: 'U|a\\rangle|0\\rangle_e = |a\\rangle|\\varphi_{00}\\rangle',
          why: 'Alice\u2019s qubit and the probe are not entangled: the probe ends the same for $a = 0$ and $a = 1$, so it tells Eve nothing.',
        },
      ],
      formal: [
        { tex: 'U|0\\rangle|0\\rangle_e = |0\\rangle|\\varphi_{00}\\rangle + |1\\rangle|\\varphi_{01}\\rangle', why: 'Eqs. 6.1–6.2: a unitary on Alice\u2019s qubit and the ancilla.', view: circ(PROBE90, 1) },
        {
          tex: '|\\varphi_{01}\\rangle = |\\varphi_{10}\\rangle = 0,\\quad |\\varphi_{00}\\rangle = |\\varphi_{11}\\rangle',
          why: 'The $z$ condition gives the zeros; the $x$ condition (Eqs. 6.4\u20136.5) then gives the equality.',
          view: tq({ circuit: PROBE90, upTo: 1 }, { labels: 'q1-q2', readouts: ['rLength'], grid: 'none' }),
        },
        {
          tex: 'U|a\\rangle|0\\rangle_e = |a\\rangle|\\varphi_{00}\\rangle',
          why: 'A product state: the probe is independent of $a$.',
          view: tq({ circuit: PROBE0, upTo: 1 }, { labels: 'q1-q2', readouts: ['rLength'], grid: 'none' }),
        },
      ],
    },
  },
  {
    id: 'q15-bb84:b5',
    phase: 'deeper',
    text:
      'Beyond the notes: can a probe learn a little and cause only a few errors? Turn Eve\u2019s probe only part of the way, by an angle $\\xi$ (a rotation of the probe, controlled by Alice\u2019s qubit). ' +
      `At a quarter turn, $\\xi = 90°$, Bob\u2019s $x$ readings are wrong ${d(V.q15ProbeX90, 4)} of the time, and Eve names a $z$ bit with chance ${d(V.q15ProbeGuess90, 4)}. ` +
      `Both arrows shrink to ${d(V.q15ProbeR90, 4)}. At a half turn she knows every $z$ bit, and the key error rate is $Q = ${d(V.q15ProbeQ180, 2)}$.`,
    formal:
      'Beyond the notes: take the controlled-$R_y(\\xi)$ probe on an input $|+\\rangle$. ' +
      `At $\\xi = 90°$ the $x$ error is $(1 - \\cos 45^\\circ)/2 = ${d(V.q15ProbeX90, 4)}$, Eve\u2019s Helstrom guess of a $z$ bit is $(1 + \\sin 45^\\circ)/2 = ${d(V.q15ProbeGuess90, 4)}$, ` +
      `and both reduced arrows have length $\\cos 45^\\circ = ${d(V.q15ProbeR90, 4)}$. At $\\xi = 180°$ (a CNOT) she learns every $z$ bit and $Q = ${d(V.q15ProbeQ180, 2)}$.`,
    caption: `a quarter-turn probe: both arrows shortened to ${d(V.q15ProbeR90, 4)} (q1 is Alice\u2019s qubit, q2 Eve\u2019s probe)`,
    captionFormal: `$\\xi = 90°$: $|r_1| = |r_2| = ${d(V.q15ProbeR90, 4)}$ (q1 Alice\u2019s qubit, q2 Eve\u2019s probe)`,
    stage: tq({ circuit: PROBE90, upTo: 1 }, { labels: 'q1-q2', readouts: ['rLength'], grid: 'none' }),
    claims: [K.probeX90, K.probeGuess90, K.probeR90, K.probeRE90, K.probeQ180],
  },
]

/* ---------------------------------------------------------------------------------------------- */
/* q15-e91 — Entanglement as the key's source                                                       */
/* ---------------------------------------------------------------------------------------------- */

const e91: Beat[] = [
  {
    id: 'q15-e91:b1',
    phase: 'books',
    text:
      'In [[qc-e91|Ekert\u2019s scheme]] a source sends Alice and Bob one half each of a [[qc-singlet|singlet]]. Each measures $x$ or $y$ at random, and they announce which. ' +
      'When both chose the same basis, their results are always opposite, so Bob flips his bit and they share a key.',
    formal:
      'Ekert\u2019s scheme, simplified (Bergou §6.5, p. 110): a source sends the two halves of a singlet $\\Psi^-$, and each party measures $x$ or $y$ at random. ' +
      'In the same basis the results are perfectly anticorrelated, $E_{nn} = \\langle\\sigma_n \\otimes \\sigma_n\\rangle = -1$, so Bob flips his bit; different bases agree half the time and are dropped.',
    caption: 'the singlet\u2019s grid is \u22121 on xx, yy and zz (xx and yy outlined); below, an x reading on both sides leaves only $|01\\rangle$ and $|10\\rangle$',
    captionFormal: '$E_{nn} = -1$ for $n = x, y, z$; after $H \\otimes H$ only $|01\\rangle$ and $|10\\rangle$ remain',
    stage: split(tq({ bell: 'Psi-' }, { highlight: ['xx', 'yy'] }), amp(C_SX, 4, 'probability')),
    claims: [K.sameX, K.sameY, K.diffXY],
    derivation: {
      result: 'P(a = b \\mid \\text{same basis}) = 0',
      ground: [
        {
          tex: '|\\Psi^-\\rangle = (|01\\rangle - |10\\rangle)/\\sqrt2',
          why: 'In the $z$ basis the two halves are always opposite: a 0 with a 1, or a 1 with a 0.',
          view: ampBell('Psi-'),
          viewCaption: 'the singlet: weight only on $|01\\rangle$ and $|10\\rangle$',
        },
        {
          tex: '(H \\otimes H)|\\Psi^-\\rangle = -|\\Psi^-\\rangle',
          why: 'An $H$ on each wire turns $x$ readings into $z$ readings, and the state only changes sign, so the chances stay on $|01\\rangle$ and $|10\\rangle$.',
          view: amp(C_SX, 4, 'probability'),
          viewCaption: 'after $H$ on both wires the chances still sit on $|01\\rangle$ and $|10\\rangle$',
        },
        {
          tex: 'E_{nn} = -1 \\Rightarrow P(a = b \\mid \\text{same basis}) = (1 + E_{nn})/2 = 0',
          why: 'Call the correlation of the two results $E_{nn}$. It is $-1$ when they never agree, so the chance of agreeing, $(1 + E_{nn})/2$, is $0$.',
          view: tq({ bell: 'Psi-' }, { highlight: ['xx', 'yy'] }),
          viewCaption: 'the grid reads \u22121 on the diagonal',
        },
      ],
      formal: [
        { tex: '(U \\otimes U)|\\Psi^-\\rangle = \\det U\\,|\\Psi^-\\rangle', why: 'The singlet is unchanged, up to a phase, by the same rotation on both sides.', view: amp(C_SX, 4, 'probability') },
        { tex: 'E_{nn} = -1 \\Rightarrow P(a = b) = (1 + E_{nn})/2 = 0', why: 'For results $\\pm 1$ the chance of agreeing is $(1 + E_{nn})/2$.', view: tq({ bell: 'Psi-' }, { highlight: ['xx', 'yy'] }) },
      ],
    },
  },
  {
    id: 'q15-e91:b2',
    phase: 'books',
    text:
      `Ekert also uses the rounds with different bases. At suitable settings they score $S = ${d(V.q15ChshSinglet, 4)}$ on Chapter Q10\u2019s CHSH test, and no preset answers can pass $2$. ` +
      'A score above $2$ shows the pair is really entangled.',
    formal:
      'Ekert\u2019s full scheme measures along three axes per side and uses the mismatched rounds to estimate the CHSH value. ' +
      `At Chapter Q10\u2019s settings the singlet reaches $S = 2\\sqrt2 = ${d(V.q15ChshSinglet, 4)}$ (Unit 10.5), whereas every local model obeys $|S| \\le 2$.`,
    caption: `the singlet at Chapter Q10\u2019s settings: $S = ${d(V.q15ChshSinglet, 4)}$ (a ceiling of 2 holds for preset answers)`,
    captionFormal: `the singlet at Chapter Q10\u2019s settings: $S = ${d(V.q15ChshSinglet, 4)}$, against $|S| \\le 2$ for local models`,
    stage: tq({ bell: 'Psi-' }, { axes: { a: NC_A, b: NC_B }, readouts: ['chsh'] }),
    claims: [K.chshSinglet],
  },
  {
    id: 'q15-e91:b3',
    phase: 'books',
    introduces: ['qc-device-independent'],
    text:
      'What if Eve builds the source and sends fixed states, $|{+x}\\rangle$ to Alice and $|{-x}\\rangle$ to Bob? ' +
      `At the same settings the score is only $S = ${d(V.q15ChshProduct, 4)}$, and no settings pass $${d(V.q15ChshProductMax, 0)}$. The test catches her. ` +
      'Treating every box as a black box, with only inputs and outputs, is [[qc-device-independent|device-independent]] security.',
    formal:
      'Treat the devices as boxes with chance $P(a, b|x, y)$ for results $a, b$ given settings $x, y$. ' +
      'If $P = \\sum_\\lambda D(a|x, \\lambda)D(b|y, \\lambda)\\mu(\\lambda)$ (Eq. 6.7), a [[qc-lhv-model|local hidden-variable model]], then an Eve who knows $\\lambda$ knows $a$ and $b$. ' +
      `A CHSH violation rules this out: device-independent security (Bergou p. 111). Eve\u2019s fixed product $|{+x}\\rangle|{-x}\\rangle$ scores $S = ${d(V.q15ChshProduct, 4)}$ here, and at most $${d(V.q15ChshProductMax, 0)}$ at any settings.`,
    caption: `Eve\u2019s fixed product: $S = ${d(V.q15ChshProduct, 4)}$ at these settings, and 2 at best at any`,
    captionFormal: `$|{+x}\\rangle|{-x}\\rangle$: $S = ${d(V.q15ChshProduct, 4)}$ here, $\\max S = ${d(V.q15ChshProductMax, 0)}$`,
    stage: tq({ ket: '+-' }, { axes: { a: NC_A, b: NC_B }, readouts: ['chsh'] }),
    claims: [K.chshProduct, K.chshProductMax],
  },
  {
    id: 'q15-e91:b4',
    phase: 'clue',
    text:
      'Alice and Bob share $|\\Phi^+\\rangle = (|00\\rangle + |11\\rangle)/\\sqrt2$ and use only the settings $z$ and $x$. With the same setting their results are always equal; with different settings they are random. ' +
      'Does this beat the classical limit $2$?',
    formal:
      'For $|\\Phi^+\\rangle$ with each setting $z$ or $x$ (settings $0$ and $1$ in Bergou\u2019s labels), the chances are $P(a, b|x, y) = \\delta_{ab}/2$ when the settings agree and $1/4$ otherwise (Eq. 6.6, corrected in the box). ' +
      'Do they violate CHSH?',
    caption: '$|\\Phi^+\\rangle$ and its grid: +1 on xx and zz, \u22121 on yy',
    stage: tq({ bell: 'Phi+' }),
    claims: [K.eq66Diff],
    reveal: {
      text:
        'No. Two hidden coins, one for each setting, copy the whole table: each side just reads out its own coin. So the best score is $2$. ' +
        'The key settings alone prove nothing, which is why Ekert adds test settings.',
      formal:
        'No: let $\\lambda = (\\lambda_0, \\lambda_1)$ be two fair bits and let each side output the bit named by its own setting, $a = \\lambda_x$ and $b = \\lambda_y$; this reproduces the corrected Eq. 6.6 exactly, so the score is at most $2$ (here exactly $2$). ' +
        'The key-generating settings need extra, non-aligned test settings.',
      caption: `at the settings z, x (Alice) and x, z (Bob) the score is $S = ${d(V.q15Eq66Chsh, 4)}$, the classical ceiling; the max S readout is what other settings could reach`,
      captionFormal: `$S = ${d(V.q15Eq66Chsh, 4)}$ at these settings; $\\max S$ is the best over all settings`,
      stage: tq({ bell: 'Phi+' }, { axes: { a: ['+z', '+x'], b: ['+x', '+z'] }, readouts: ['chsh'] }),
      claims: [K.eq66Chsh, K.eq66Local],
    },
  },
]

/* ---------------------------------------------------------------------------------------------- */
/* q15-sharing — Splitting a secret between two people                                              */
/* ---------------------------------------------------------------------------------------------- */

const sharing: Beat[] = [
  {
    id: 'q15-sharing:b1',
    phase: 'books',
    text:
      'In [[qc-secret-sharing|secret sharing]] the secret is split so that no one can open it alone. Alice adds a random string $r$ to her key $k$ with [[qc-xor|XOR]]. ' +
      'Bob gets the sum $u = k \\oplus r$ and Charlie gets $r$. Each alone holds pure noise. Together, $u \\oplus r = k$.',
    formal:
      'Secret sharing splits a secret so that all parties must cooperate (Bergou §6.6, p. 112). Alice gives Bob $u = k \\oplus r$ and Charlie $r$, for a random $r$; each share alone is uniformly random, and $u \\oplus r = k$. ' +
      'With QKD, Alice\u2019s key is the XOR of the BB84 keys she shares with Bob and with Charlie.',
    caption: 'after two columns the share wire holds $u = k \\oplus r$; a third column adds $r$ again and brings back $k$',
    stage: split(circ(C_SPLIT, 2), amp(C_SPLIT, 2, 'probability')),
    claims: [K.splitShare, K.splitBack],
  },
  {
    id: 'q15-sharing:b2',
    phase: 'books',
    introduces: ['qc-logical-bit'],
    text:
      'A second way uses entanglement. For each key bit Alice sends one entangled pair, written with the [[qc-logical-bit|logical states]] $|\\bar 0\\rangle = \\cos\\theta|00\\rangle + \\sin\\theta|11\\rangle$ for bit 0 ' +
      'and $|\\bar 1\\rangle = \\cos\\theta|00\\rangle - \\sin\\theta|11\\rangle$ for bit 1. Bob gets one qubit and Charlie the other. ' +
      `Here $\\theta = ${TH}°$. Each qubit alone points along an arrow of length ${d(V.q15ShareR, 4)}, shorter than 1.`,
    formal:
      'Alice encodes the bit in the [[qc-logical-bit|logical states]] $|\\bar 0\\rangle = \\cos\\theta|00\\rangle + \\sin\\theta|11\\rangle$ and $|\\bar 1\\rangle = \\cos\\theta|00\\rangle - \\sin\\theta|11\\rangle$ ' +
      '(Eq. 6.8, p. 112; Bergou writes them in bold) and sends one qubit to Bob, one to Charlie. ' +
      `At $\\theta = ${TH}°$ each local Bloch arrow has length $\\cos 2\\theta = ${d(V.q15ShareR, 4)}$.`,
    caption: `$|\\bar 0\\rangle$ at $\\theta = ${TH}°$: both arrows shortened to ${d(V.q15ShareR, 4)} (q1 is Bob\u2019s qubit, q2 Charlie\u2019s)`,
    captionFormal: `$|\\bar 0\\rangle$: $|r_1| = |r_2| = \\cos 2\\theta = ${d(V.q15ShareR, 4)}$ (q1 Bob\u2019s qubit, q2 Charlie\u2019s)`,
    stage: tq({ circuit: SHARE0, upTo: 2 }, { labels: 'q1-q2', readouts: ['rLength'], grid: 'none' }),
    claims: [K.shareR],
  },
  {
    id: 'q15-sharing:b3',
    phase: 'books',
    text:
      'Bob measures his qubit along $x$. If he reads $+x$, Charlie\u2019s qubit is left in $|\\psi_+\\rangle = \\cos\\theta|0\\rangle + \\sin\\theta|1\\rangle$. ' +
      `If he reads $-x$, it is left in $|\\psi_-\\rangle = \\cos\\theta|0\\rangle - \\sin\\theta|1\\rangle$. Each happens with chance ${d(V.q15ShareBobPlus, 1)}. For $|\\bar 1\\rangle$ the two swap.`,
    formal:
      'Writing Bob\u2019s qubit in the $x$ basis gives $|\\bar 0\\rangle = (|{+x}\\rangle|\\psi_+\\rangle + |{-x}\\rangle|\\psi_-\\rangle)/\\sqrt2$ with $|\\psi_\\pm\\rangle = \\cos\\theta|0\\rangle \\pm \\sin\\theta|1\\rangle$ ' +
      `(Eq. 6.9, p. 112), each term with chance ${d(V.q15ShareBobPlus, 1)}; $|\\bar 1\\rangle$ swaps $|\\psi_+\\rangle$ and $|\\psi_-\\rangle$.`,
    caption: `Bob read $+x$: his arrow points along $+x$ and Charlie\u2019s is $|\\psi_+\\rangle$, with $x$-part ${d(V.q15ShareCharlieX, 4)} (q1 Bob\u2019s qubit, q2 Charlie\u2019s)`,
    captionFormal: `Bob read $+x$ (chance ${d(V.q15ShareBobPlus, 1)}): Charlie\u2019s arrow is $|\\psi_+\\rangle$ with $x$-part $\\sin 2\\theta = ${d(V.q15ShareCharlieX, 4)}$`,
    stage: tq({ circuit: SHARE0, upTo: 2 }, { labels: 'q1-q2', condition: { qubit: 0, basis: 'x', outcome: 0 }, grid: 'none' }),
    claims: [K.bobPlus, K.charlieX],
  },
  {
    id: 'q15-sharing:b4',
    phase: 'books',
    text:
      `Charlie must tell $|\\psi_+\\rangle$ from $|\\psi_-\\rangle$. He uses the [[qc-unambiguous-discrimination|never-wrong measurement]]: it succeeds ${d(V.q15ShareUsd, 4)} of the time. ` +
      'Call Bob\u2019s result $\\beta$ ($0$ for $+x$, $1$ for $-x$) and Charlie\u2019s $\\gamma$ ($0$ for $|\\psi_+\\rangle$, $1$ for $|\\psi_-\\rangle$). When Charlie succeeds, Alice\u2019s bit is $a = \\beta \\oplus \\gamma$. ' +
      'Neither of them alone knows it.',
    formal:
      `The overlap is $|\\langle\\psi_+|\\psi_-\\rangle| = \\cos 2\\theta = ${d(V.q15ShareOverlap, 4)}$, so Charlie\u2019s optimal unambiguous measurement succeeds with $1 - \\cos 2\\theta = ${d(V.q15ShareUsd, 4)}$. ` +
      'On a kept round with Bob\u2019s result $\\beta$ and Charlie\u2019s result $\\gamma$ (0 for $+x$ and $|\\psi_+\\rangle$, 1 for $-x$ and $|\\psi_-\\rangle$) the bit is $a = \\beta \\oplus \\gamma$. ' +
      `An eavesdropper faces the overlap $\\cos 2\\theta = ${d(V.q15ShareOverlap, 4)}$, B92\u2019s own.`,
    caption: 'Charlie\u2019s two states $|\\psi_+\\rangle$ and $|\\psi_-\\rangle$ on the sphere, 90° apart',
    stage: ball(CH_PLUS, { compare: CH_MINUS }),
    claims: [K.shareOverlap, K.shareUsd],
    derivation: {
      result: 'a = \\beta \\oplus \\gamma',
      ground: [
        {
          tex: '|\\bar 0\\rangle = (|{+x}\\rangle|\\psi_+\\rangle + |{-x}\\rangle|\\psi_-\\rangle)/\\sqrt2',
          why: 'Write Bob\u2019s qubit in the $x$ basis (Eq. 6.9).',
          view: tq({ circuit: SHARE0, upTo: 2 }, { labels: 'q1-q2', readouts: ['rLength'], grid: 'none' }),
          viewCaption: 'the pair: both arrows shortened (q1 Bob\u2019s qubit, q2 Charlie\u2019s)',
        },
        {
          tex: '\\text{Bob reads } +x \\Rightarrow \\text{Charlie holds } |\\psi_+\\rangle',
          why: 'A reading by Bob leaves Charlie\u2019s qubit in the matching state.',
          view: tq({ circuit: SHARE0, upTo: 2 }, { labels: 'q1-q2', condition: { qubit: 0, basis: 'x', outcome: 0 }, grid: 'none' }),
          viewCaption: 'Bob read $+x$; Charlie\u2019s arrow is $|\\psi_+\\rangle$',
        },
        {
          tex: `|\\langle\\psi_+|\\psi_-\\rangle| = \\cos 2\\theta = ${d(V.q15ShareOverlap, 4)}`,
          why: 'The two states are 90° apart on the sphere, so they overlap by the cosine of half that angle.',
          view: ball(CH_PLUS, { compare: CH_MINUS }),
          viewCaption: 'Charlie\u2019s two states, 90° apart',
        },
        {
          tex: 'a = \\beta \\oplus \\gamma',
          why: `When Charlie succeeds (${d(V.q15ShareUsd, 4)} of the time), Bob\u2019s sign and Charlie\u2019s sign together give Alice\u2019s bit.`,
        },
      ],
      formal: [
        {
          tex: '|\\bar 0\\rangle = (|{+x}\\rangle|\\psi_+\\rangle + |{-x}\\rangle|\\psi_-\\rangle)/\\sqrt2',
          why: 'Eq. 6.9: the logical state written in the $x$ basis on Bob\u2019s side.',
          view: tq({ circuit: SHARE0, upTo: 2 }, { labels: 'q1-q2', condition: { qubit: 0, basis: 'x', outcome: 0 }, grid: 'none' }),
        },
        {
          tex: `|\\langle\\psi_+|\\psi_-\\rangle| = \\cos 2\\theta = ${d(V.q15ShareOverlap, 4)}`,
          why: `Hence Charlie\u2019s unambiguous success is $1 - \\cos 2\\theta = ${d(V.q15ShareUsd, 4)}$ (Unit 14.4).`,
          view: ball(CH_PLUS, { compare: CH_MINUS }),
        },
        { tex: 'a = \\beta \\oplus \\gamma', why: '$|\\bar 1\\rangle$ swaps $\\psi_+$ and $\\psi_-$, so the sum of the two signs is the bit.' },
      ],
    },
  },
  {
    id: 'q15-sharing:b5',
    phase: 'clue',
    text:
      'Charlie grabs Bob\u2019s qubit on its way, measures it along $x$, and sends it on. What does he learn, and can anyone notice?',
    formal:
      'If Charlie measures Bob\u2019s qubit along $x$ and forwards it, what does he learn, and does Bergou\u2019s random $\\sigma_z$ switch applied by Bob expose him?',
    caption: 'the honest pair, before Charlie touches anything (q1 is Bob\u2019s qubit, q2 Charlie\u2019s)',
    stage: tq({ circuit: SHARE0, upTo: 2 }, { labels: 'q1-q2', grid: 'none' }),
    reveal: {
      text:
        'He learns the bit every time, and causes no error. Bob\u2019s random flip only relabels Bob\u2019s own $x$ reading, so the public record looks exactly like an honest run. ' +
        'Our calculation finds the record unchanged; see the Corrections box. Only a round in which Bob reads along $z$ would show the grab. Honest $z$ readings agree every time; after the grab they agree only ' +
        `${d(V.q15ZAgreeGrab, 1)} of the time.`,
      formal:
        'Charlie knows the $x$ reading he took of Bob\u2019s qubit, $\\beta\'$, and his own result $\\gamma$, hence $a = \\beta\' \\oplus \\gamma$, with no error. A $\\sigma_z$ applied by Bob afterwards only swaps $+x$ and $-x$, so the public record matches an honest run exactly (largest gap $0$). ' +
        `A $\\sigma_z$ applied before Charlie can touch the qubit hides the bit from him (his guess is ${d(V.q15CheatEarlyGuess, 1)}), but it still causes no error. ` +
        `A round in which Bob reads along $z$ would expose the grab: his reading and Charlie\u2019s agree with chance $${d(V.q15ZAgreeHonest, 0)}$ honestly but ${d(V.q15ZAgreeGrab, 1)} after it (the scheme as described has no such round).`,
      caption: 'if Charlie read Bob\u2019s qubit along $x$ first and found $+x$, Bob\u2019s arrow sits on the $+x$ axis and Charlie\u2019s is $|\\psi_+\\rangle$ (q1 Bob\u2019s qubit, q2 Charlie\u2019s)',
      stage: tq({ circuit: SHARE0, upTo: 2 }, { labels: 'q1-q2', condition: { qubit: 0, basis: 'x', outcome: 0 }, grid: 'none' }),
      claims: [K.cheatGap, K.cheatKnows, K.cheatEarly, K.zHonest, K.zGrab],
    },
  },
]

export const Q15_STORY: Record<string, Beat[]> = {
  'q15-otp': otp,
  'q15-b92': b92,
  'q15-bb84': bb84,
  'q15-e91': e91,
  'q15-sharing': sharing,
}

/** Every claim used anywhere in a unit's beats, for Unit.claims (content.test.tsx "claims hold"). */
function allClaims(beats: Beat[]) {
  const seen = new Set<string>()
  return beats
    .flatMap((b) => [...(b.claims ?? []), ...(b.reveal?.claims ?? []), ...(b.derivation?.ground.flatMap((s) => s.claims ?? []) ?? []), ...(b.derivation?.formal?.flatMap((s) => s.claims ?? []) ?? [])])
    .filter((c) => (seen.has(c.text) ? false : (seen.add(c.text), true)))
}
export const Q15_UNIT_CLAIMS_BY_ID: Record<string, ReturnType<typeof allClaims>> = Object.fromEntries(Object.entries(Q15_STORY).map(([id, beats]) => [id, allClaims(beats)]))
export { K, NC_A, NC_B }
