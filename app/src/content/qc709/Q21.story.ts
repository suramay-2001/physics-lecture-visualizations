/**
 * Chapter Q21 scroll story (Physics 709; roles P + W). Beats per docs/roles/proposals/P-Q21-story.md §1, in both tracks, with the judge's rulings
 * (docs/roles/decisions/qc709-Q21Q22.md): the ids are Q21/Q22 (R1), Bergou §9.2 (linear codes, CSS, Steane) sits in Chapter Q22 (R2), the Pauli group notation waits
 * for Q22 (R3), the `code` stage kind and the `amplitudes.keep` wire list are built (R4), the engine helpers live in physics/qec/errors.ts with numpy twins (R5), three
 * Correction boxes (R6), the quantum Hamming bound is taught from N&C's text (R7), forward hooks name the Papers background chapters in words (R8).
 *
 * Build notes against the plan (reported to the orchestrator):
 * - Phase `'books'` throughout (no 709 notes reach Chapter 9): ramp beats are `books`, the clues are `clue`, the one Go-deeper beat is the forward hook of the last unit.
 * - Every circuit with a mid-circuit measurement is run with its helper readings (`outcomesOf` in Q21.values.ts); the small-error pictures read the helper wires one
 *   column BEFORE the reading (column 8), where the chances 0.75 and 0.25 are still on the page.
 * - The number reader takes a decimal point between digits as a decimal and `a/b` as a fraction, so powers with a fraction in the exponent are written with a square root
 *   (`1/\sqrt8`), and the book's table and theorem numbers are cited by printed page, never by number.
 * - Double square brackets would open a glossary tag, so the code symbol is written `[\![n, k]\!]`.
 * - Unit mentions inside Foundations are bridge chips `<<id|Unit F7.4>>`; the units of this chapter are named by number ("Unit 21.4").
 */
import type { Circuit } from '../../physics/qc/circuit'
import type { AmpSource, AmplitudesState, Beat, BitsState, CircuitStageState, CodeState, MatrixGridState, MatrixSource, MatrixTableauState, PlotState, Scrub, StageLayout, StageState } from '../schema'
import { C_1, C_BF, C_DFS, C_ENC3, C_IND, C_PF, V, claim, close, d, outcomesOf } from './Q21.values'

/* ---------------------------------------------------------------------------------------------- */
/* Stage shorthand (plan "Stage shorthand"), as plain builder functions                              */
/* ---------------------------------------------------------------------------------------------- */
const circ = (C: Circuit, upTo: Scrub): CircuitStageState => ({ kind: 'circuit', circuit: C, upTo, ...(outcomesOf(C) !== undefined ? { outcomes: outcomesOf(C)! } : {}), shot: 'Q-WIRES' })
const src = (C: Circuit, upTo: Scrub): AmpSource => ({ circuit: C, upTo, ...(outcomesOf(C) !== undefined ? { outcomes: outcomesOf(C)! } : {}) })
const amp = (C: Circuit, upTo: Scrub, mode: AmplitudesState['mode'], extra: Partial<Omit<AmplitudesState, 'kind' | 'state' | 'mode'>> = {}): AmplitudesState => ({
  kind: 'amplitudes',
  state: src(C, upTo),
  mode,
  shot: 'A-BARS',
  ...extra,
})
/** Chances of the listed wires (counted from 0 at the top) after column `upTo`, the other wires summed over. */
const ampW = (C: Circuit, upTo: Scrub, wires: number[]): AmplitudesState => amp(C, upTo, 'probability', { keep: wires })
const pl = (fn: PlotState['curve']['fn'], extra: Partial<Omit<PlotState, 'kind' | 'curve'>> = {}, curve: Partial<PlotState['curve']> = {}): PlotState => ({
  kind: 'plot',
  curve: { fn, ...curve },
  shot: 'P-CURVE',
  ...extra,
})
const marks = (...xs: number[]): Pick<PlotState, 'markers'> => ({ markers: xs.map((x) => ({ x })) })
const bits = (b: Omit<BitsState, 'kind' | 'shot'>): BitsState => ({ kind: 'bits', shot: 'B-BITS', ...b })
const br = (strings: string[], extra: { combine?: 'xor' | 'dot'; against?: string } = {}): BitsState => bits({ rows: { strings, ...extra } })
const tb = (rows: string[], extra: Partial<Omit<MatrixTableauState, 'kind' | 'tableau'>> = {}): MatrixTableauState => ({ kind: 'matrix', tableau: rows, shot: 'M-GRID', ...extra })
const mx = (source: MatrixSource, extra: Partial<Omit<MatrixGridState, 'kind' | 'source'>> = {}): MatrixGridState => ({ kind: 'matrix', source, labels: 'none', values: 'decimal', shot: 'M-GRID', ...extra })
/** The density matrix of an equal mixture of the one- or two-qubit circuit states after their last column. */
const mxr = (kets: { C: Circuit; k: number }[]): MatrixGridState =>
  mx({ rho: { mixture: kets.map(({ C, k }) => ({ w: 1 / kets.length, ket: src(C, k) })) } }, { values: 'decimal' })
const code = (id: CodeState['code'], extra: Partial<Omit<CodeState, 'kind' | 'code'>> = {}): CodeState => ({ kind: 'code', code: id, shot: 'CD-CODE', ...extra })
const split = (top: StageState, bottom: StageState): StageLayout => ({ layout: 'split', top, bottom })

/** The four Pauli rows of the digitization pictures. */
const PAULI4 = ['I', 'X', 'Y', 'Z']

/** The running qubit's two amplitudes, for a beat that shows 0.6 and 0.8. */
const ampClaims = () => [
  claim('q21A', 'the running qubit has amplitude $0.6$ on $|0\\rangle$', () => close(V.q21A, 0.6, 1e-9)),
  claim('q21B', 'and $0.8$ on $|1\\rangle$', () => close(V.q21B, 0.8, 1e-9)),
]

/* ---------------------------------------------------------------------------------------------- */
/* q21-classical — Three copies and a majority vote                                                  */
/* ---------------------------------------------------------------------------------------------- */

const classical: Beat[] = [
  {
    id: 'q21-classical:b1',
    phase: 'books',
    text:
      'To guard one bit, send three copies: 0 becomes 000 and 1 becomes 111. This is the [[qc-repetition-code|repetition code]]. The receiver takes a majority vote. ' +
      `Each copy flips with chance $p$, on its own (<<qc-f5-probability|Unit F5.1>>). At $p = ${d(V.q21P, 1)}$, zero to three flips have chances $${d(V.q21RepC0, 3)}$, $${d(V.q21RepC1, 3)}$, $${d(V.q21RepC2, 3)}$ and $${d(V.q21RepC3, 3)}$.`,
    formal:
      'The [[qc-repetition-code|repetition code]] $0 \\to 000$, $1 \\to 111$ with majority decoding (Bergou §9.1, p. 161; N&C p. 426). ' +
      `With independent flips of probability $p$, $w$ flips occur with probability $\\binom3w p^w(1-p)^{3-w}$ (<<qc-f5-probability|Unit F5.1>>): $${d(V.q21RepC0, 3)}$, $${d(V.q21RepC1, 3)}$, $${d(V.q21RepC2, 3)}$, $${d(V.q21RepC3, 3)}$ at $p = ${d(V.q21P, 1)}$.`,
    caption: '000 sent, 010 received: one flip, and the vote still says 0',
    captionFormal: '$000 \\oplus 010 = 010$: weight 1, majority 0',
    stage: br(['000', '010'], { combine: 'xor' }),
    claims: [
      claim('q21P', 'each copy flips with chance $0.1$', () => close(V.q21P, 0.1, 1e-12)),
      claim('q21RepC0', 'no flip has chance $0.729$', () => close(V.q21RepC0, 0.729, 1e-9)),
      claim('q21RepC1', 'one flip $0.243$', () => close(V.q21RepC1, 0.243, 1e-9)),
      claim('q21RepC2', 'two flips $0.027$', () => close(V.q21RepC2, 0.027, 1e-9)),
      claim('q21RepC3', 'three flips $0.001$', () => close(V.q21RepC3, 0.001, 1e-9) && close(V.q21RepC0 + V.q21RepC1 + V.q21RepC2 + V.q21RepC3, 1, 1e-12)),
    ],
  },
  {
    id: 'q21-classical:b2',
    phase: 'books',
    text:
      `The vote fails only when two or three copies flip. That has chance $p^2(3 - 2p)$, which is $${d(V.q21RepFail01, 3)}$ at $p = ${d(V.q21P, 1)}$. ` +
      `Three copies beat one exactly when $p < ${d(V.q21BreakEven, 1)}$.`,
    formal:
      `Failure needs weight $\\ge 2$: $3p^2(1-p) + p^3 = p^2(3 - 2p)$ (Bergou p. 161), $${d(V.q21RepFail01, 3)}$ at $p = ${d(V.q21P, 1)}$ and $${d(V.q21RepFail001, 6)}$ at $p = ${d(V.q21PLow, 2)}$. ` +
      `Since $p^2(3-2p) - p = -p(1-p)(1-2p)$, encoding helps exactly when $p < ${d(V.q21BreakEven, 1)}$.`,
    caption: 'the vote’s failure chance (curve) against a lone bit’s p (line): they cross at ½',
    captionFormal: '$p^2(3-2p)$ against $p$ on $[0, 1]$; markers at 0.1 and ½',
    stage: pl('repFail3', { ...marks(0.1, 0.5) }, { vs: 'identityP' }),
    claims: [
      claim('q21RepFail01', 'at $p = 0.1$ the vote fails with chance $0.028$', () => close(V.q21RepFail01, 0.028, 1e-9) && close(V.q21RepFail01, 3 * 0.1 ** 2 * 0.9 + 0.1 ** 3, 1e-12)),
      claim('q21PLow', 'a second flip chance, $0.01$', () => close(V.q21PLow, 0.01, 1e-12)),
      claim('q21RepFail001', 'at $p = 0.01$ it fails with chance $0.000298$', () => close(V.q21RepFail001, 0.000298, 1e-9)),
      claim('q21BreakEven', 'the vote beats one bit exactly below $p = 0.5$', () => close(V.q21BreakEven, 0.5, 1e-9)),
    ],
    derivation: {
      result: 'p^2(3 - 2p) - p = -p(1-p)(1-2p)',
      ground: [
        {
          tex: '\\binom32\\,p^2(1-p) = 3p^2(1-p)',
          why: 'Two flips can sit in 3 places, and each way has chance $p^2(1-p)$.',
          view: br(['000', '110'], { combine: 'xor' }),
          viewCaption: 'two flips outvote',
        },
        {
          tex: 'p^3',
          why: 'Three flips happen in one way only, with chance $p^3$.',
          view: br(['000', '111'], { combine: 'xor' }),
          viewCaption: 'three flips',
        },
        {
          tex: '3p^2(1-p) + p^3 = p^2(3 - 2p)',
          why: 'The vote fails in either case, so the two chances add.',
          view: pl('repFail3', { ...marks(0.1) }),
          viewCaption: 'failure at 0.1',
        },
        {
          tex: 'p^2(3 - 2p) - p = -p(1-p)(1-2p)',
          why: `Subtracting the lone bit’s chance $p$ leaves a product that is negative exactly when $p < ${d(V.q21BreakEven, 1)}$.`,
          view: pl('repFail3', { ...marks(0.5) }, { vs: 'identityP' }),
          viewCaption: 'the crossing at ½',
          claims: [claim('q21BreakEven', 'the product is negative below $0.5$', () => V.q21BreakEven === 0.5 || close(V.q21BreakEven, 0.5, 1e-9))],
        },
      ],
      formal: [
        {
          tex: '\\sum_{w\\ge2}\\binom3w p^w(1-p)^{3-w}',
          why: 'The vote fails when at least two of the three copies flip.',
          view: br(['000', '110'], { combine: 'xor' }),
        },
        {
          tex: '= p^2(3 - 2p)',
          why: 'Expand the two terms $3p^2(1-p)$ and $p^3$ and collect.',
          view: pl('repFail3', { ...marks(0.1) }),
        },
        {
          tex: 'p^2(3 - 2p) - p = -p(1-p)(1-2p)',
          why: `The factor $1 - 2p$ is positive exactly when $p < ${d(V.q21BreakEven, 1)}$, so the whole product is then negative.`,
          view: pl('repFail3', { ...marks(0.5) }, { vs: 'identityP' }),
        },
      ],
    },
  },
  {
    id: 'q21-classical:b3',
    phase: 'books',
    introduces: ['qc-syndrome'],
    text:
      'Two parity checks ask: do bits 1 and 2 agree, and do bits 2 and 3 agree? Their answers, the [[qc-syndrome|syndrome]], name the flipped bit without saying whether it is 0 or 1. ' +
      'A flip at place 1, 2 or 3 gives the answers 10, 11 or 01, where a 1 means that the pair disagrees (<<qc-f7-gf2|Unit F7.4>>). A table turns each syndrome into a fix: that is decoding.',
    formal:
      'The checks are the rows 110, 011 of a check matrix $M$ (<<qc-f7-gf2|Unit F7.4>>). The [[qc-syndrome|syndrome]] $Me$ depends only on the error $e$: 10, 11, 01 for a flip at place 1, 2, 3. ' +
      'A decoder maps each syndrome to its likeliest error; the code words 000, 111 are the null space of $M$.',
    caption: 'the checks 110 and 011 against the received 010: both read 1, so bit 2 flipped',
    captionFormal: '$M = (110;\\,011)$, $M\\,010 = 11$',
    stage: br(['110', '011'], { against: '010' }),
    claims: [
      claim('q21RepSyn1', 'a flip at place 1 gives the syndrome 10', () => V.q21RepSyn1 === 2),
      claim('q21RepSyn2', 'at place 2 the syndrome 11', () => V.q21RepSyn2 === 3),
      claim('q21RepSyn3', 'at place 3 the syndrome 01', () => V.q21RepSyn3 === 1),
      claim('q21RepNullWords', 'exactly two words, 000 and 111, give the syndrome 00', () => V.q21RepNullWords === 2),
    ],
  },
  {
    id: 'q21-classical:b4',
    phase: 'books',
    text:
      '[[qubit|Qubits]] are harder. An unknown state cannot be copied (Chapter Q13). Looking at it changes it (<<qc-l3-postulates|Lecture 3>>). ' +
      'And errors come in every size, including sign flips that turn $a|0\\rangle + b|1\\rangle$ into $a|0\\rangle - b|1\\rangle$. ' +
      `Our qubit to protect has $a = ${d(V.q21A, 1)}$ and $b = ${d(V.q21B, 1)}$, so its chances are $${d(V.q21Chance0, 2)}$ and $${d(V.q21Chance1, 2)}$.`,
    formal:
      'Three obstacles (Bergou p. 162; N&C p. 427): no-cloning forbids $|\\psi\\rangle \\to |\\psi\\rangle^{\\otimes3}$ (Chapter Q13); measuring in the computational basis destroys [[superposition|superpositions]] (<<qc-l3-postulates|Lecture 3>>); ' +
      'and errors form a continuum, the phase flip $Z$ and small changes $a + O(\\epsilon)$, $b + O(\\epsilon)$ among them. ' +
      `Running state: $|\\psi\\rangle = ${d(V.q21A, 1)}|0\\rangle + ${d(V.q21B, 1)}|1\\rangle$, with chances $${d(V.q21Chance0, 2)}$ and $${d(V.q21Chance1, 2)}$.`,
    caption: 'the qubit to protect, 0.6|0⟩ + 0.8|1⟩: chances 0.36 and 0.64',
    captionFormal: '$|\\psi\\rangle = 0.6|0\\rangle + 0.8|1\\rangle$',
    stage: amp(C_1(0), 2, 'probability'),
    claims: [
      ...ampClaims(),
      claim('q21Chance0', 'the chance of 0 is $0.36$', () => close(V.q21Chance0, 0.36, 1e-9)),
      claim('q21Chance1', 'and of 1 is $0.64$', () => close(V.q21Chance1, 0.64, 1e-9)),
    ],
  },
  {
    id: 'q21-classical:b5',
    phase: 'clue',
    text: `Five copies and a majority vote: at $p = ${d(V.q21P, 1)}$, how much safer than three?`,
    formal: `With five copies and majority decoding, what is the failure probability at $p = ${d(V.q21P, 1)}$, against $${d(V.q21RepFail01, 3)}$ for three?`,
    caption: 'three copies (curve): where does five copies’ curve lie?',
    captionFormal: 'the vote of three copies, marker at 0.1',
    stage: pl('repFail3', { ...marks(0.1) }),
    claims: [claim('q21P', 'the flip chance is $0.1$', () => close(V.q21P, 0.1, 1e-12))],
    reveal: {
      text:
        `Five copies fail only when three or more flip: chance $${d(V.q21RepFail5, 5)}$, about $${d(V.q21RepRatio, 2)}$ times safer. ` +
        `For any $p < ${d(V.q21BreakEven, 1)}$, more copies make failure rarer.`,
      formal:
        `Failure needs weight $\\ge 3$: $10p^3(1-p)^2 + 5p^4(1-p) + p^5 = ${d(V.q21RepFail5, 5)}$ at $p = ${d(V.q21P, 1)}$, a factor $${d(V.q21RepRatio, 2)}$ below three copies. ` +
        `Below $p = ${d(V.q21BreakEven, 1)}$ the binomial tail shrinks as copies are added.`,
      caption: 'three copies (curve) and five copies (dashed): five lie lower everywhere below ½',
      captionFormal: 'five copies against three, markers at 0.1: the dashed curve lies below the other until ½',
      stage: pl('repFail5', { ...marks(0.1) }, { vs: 'repFail3' }),
      claims: [
        claim('q21RepFail5', 'five copies fail with chance $0.00856$', () => close(V.q21RepFail5, 0.00856, 1e-9)),
        claim('q21RepRatio', 'about $3.27$ times less often than three', () => close(V.q21RepRatio, 3.27, 5e-3)),
        claim('q21BreakEven', 'below $p = 0.5$', () => close(V.q21BreakEven, 0.5, 1e-9)),
      ],
    },
  },
]

/* ---------------------------------------------------------------------------------------------- */
/* q21-bit-flip — Checking parities without looking                                                  */
/* ---------------------------------------------------------------------------------------------- */

const bitFlip: Beat[] = [
  {
    id: 'q21-bit-flip:b1',
    phase: 'books',
    introduces: ['qc-codeword'],
    text:
      `Encode $${d(V.q21A, 1)}|0\\rangle + ${d(V.q21B, 1)}|1\\rangle$ with two [[qc-cnot|CNOTs]] from qubit 1. The result is $${d(V.q21EncBar0, 1)}|000\\rangle + ${d(V.q21EncBar1, 1)}|111\\rangle$, ` +
      `carried by the two [[qc-codeword|code words]] $|\\bar0\\rangle = |000\\rangle$ and $|\\bar1\\rangle = |111\\rangle$. It is not three copies, which would overlap it only $${d(V.q21NotCopy, 4)}$.`,
    formal:
      `CNOTs from [[qubit|qubit]] 1 onto 2 and 3 map $a|0\\rangle + b|1\\rangle$ to $a|\\bar0\\rangle + b|\\bar1\\rangle$, with [[qc-codeword|code words]] $|\\bar0\\rangle = |000\\rangle$, $|\\bar1\\rangle = |111\\rangle$ spanning the code space (Bergou p. 162; N&C Fig. 10.2). ` +
      `It differs from $|\\psi\\rangle^{\\otimes3}$: the overlap is $a^4 + b^4 = ${d(V.q21NotCopy, 4)}$. Rosetta: code qubit $j$ is wire $q_{j-1}$.`,
    caption: `two CNOTs spread qubit 1 over qubits 2 and 3: bars ${d(V.q21EncBar0, 1)} and ${d(V.q21EncBar1, 1)}`,
    captionFormal: `$${d(V.q21EncBar0, 1)}|000\\rangle + ${d(V.q21EncBar1, 1)}|111\\rangle$, helpers still 00`,
    stage: split(circ(C_BF('none'), 3), amp(C_BF('none'), 3, 'amplitude')),
    claims: [
      ...ampClaims(),
      claim('q21EncBar0', 'after encoding the bar on 000 has size $0.6$', () => close(V.q21EncBar0, 0.6, 1e-9)),
      claim('q21EncBar1', 'and the bar on 111 has size $0.8$', () => close(V.q21EncBar1, 0.8, 1e-9)),
      claim('q21NotCopy', 'three copies would overlap the code state only $0.5392$', () => close(V.q21NotCopy, 0.5392, 1e-9) && close(V.q21NotCopy, V.q21A ** 4 + V.q21B ** 4, 1e-12)),
    ],
  },
  {
    id: 'q21-bit-flip:b2',
    phase: 'books',
    text:
      'Ask the two parity questions with two helper qubits. Each helper collects the [[qc-parity|parity]] of a pair: $Z_1Z_2$ or $Z_2Z_3$. Both code words give $+1$ twice. ' +
      'A flip of qubit 1, 2 or 3 gives its own pair of signs, read in the same two helpers (<<qc-l7-compatible|Lecture 7>>).',
    formal:
      'Measure $Z_1Z_2$ and $Z_2Z_3$ through helpers (two CNOTs each). They commute and are constant on the code (<<qc-l7-compatible|Lecture 7>>), so reading them leaves $a$, $b$ alone. ' +
      'Bergou’s table (p. 162): no flip $(+1, +1)$; $X_1$: $(-1, +1)$; $X_2$: $(-1, -1)$; $X_3$: $(+1, -1)$.',
    caption: 'the two checks and their product Z₁Z₃: each reads +1 on the code state',
    captionFormal: '$Z_1Z_2$, $Z_2Z_3$, product $Z_1Z_3$; eigenvalue $+1$ on the encoded state',
    stage: tb(['ZZI', 'IZZ'], { product: true, state: { circuit: C_ENC3, upTo: 3 } }),
    claims: [
      claim('q21EncChecks', 'the three checks $Z_1Z_2$, $Z_2Z_3$, $Z_1Z_3$ all read $+1$ on the code state (their readings add to 3)', () => V.q21EncChecks === 3),
      claim('q21T91None', 'no flip: helpers read 00', () => V.q21T91None === 0),
      claim('q21T91X1', 'a flip of qubit 1: 10', () => V.q21T91X1 === 2),
      claim('q21T91X2', 'of qubit 2: 11', () => V.q21T91X2 === 3),
      claim('q21T91X3', 'of qubit 3: 01', () => V.q21T91X3 === 1),
    ],
  },
  {
    id: 'q21-bit-flip:b3',
    phase: 'books',
    text:
      `Flip qubit 2 by mistake. The helpers read 1 and 1: both checks gave $-1$, which points to qubit 2. Flip it back. The bars return to $${d(V.q21EncBar0, 1)}$ and $${d(V.q21EncBar1, 1)}$, and nobody learned them.`,
    formal:
      'After $X_2$ the state $a|010\\rangle + b|101\\rangle$ is an eigenstate of both checks, so the helpers read 11 with probability 1. ' +
      'The conditioned $X_2$ restores $a|\\bar0\\rangle + b|\\bar1\\rangle$ without revealing $a, b$. Bergou p. 163 conditions this step on two $+1$ readings; both read $-1$ (Correction box).',
    caption: `qubit 2 flipped: helpers read 11, the conditioned X fires; bars ${d(V.q21EncBar0, 1)} at 00011 and ${d(V.q21EncBar1, 1)} at 11111`,
    captionFormal: `qubit 2 flipped: helpers read 11, the conditioned $X$ fires; bars ${d(V.q21EncBar0, 1)} at 00011 and ${d(V.q21EncBar1, 1)} at 11111`,
    stage: split(circ(C_BF('X2'), 10), amp(C_BF('X2'), 10, 'amplitude')),
    claims: [
      ...ampClaims(),
      claim('q21BfSynX2', 'after $X_2$ the helpers read 11 with chance $1$', () => close(V.q21BfSynX2, 1, 1e-9)),
      claim('q21BfRestored0', 'the chance of 0 is back to $0.36$', () => close(V.q21BfRestored0, 0.36, 1e-9)),
      claim('q21BfRestored1', 'and of 1 to $0.64$', () => close(V.q21BfRestored1, 0.64, 1e-9)),
    ],
  },
  {
    id: 'q21-bit-flip:b4',
    phase: 'books',
    text:
      `Now qubit 2 is only nudged by $R_x(60°)$: part “nothing”, part “flip”. Call the size of the flip part $\\epsilon = ${d(V.q21SmallEps, 1)}$. The helpers would read 00 or 11, nothing between. ` +
      `With chance $${d(V.q21SmallP00, 2)}$ nothing happened; with chance $${d(V.q21SmallP11, 2)}$ a whole flip did, and we fix it.`,
    formal:
      `$R_x(60°) = \\cos30°\\,I - i\\sin30°\\,X$ on qubit 2 has the form of Eq. 9.1 with $\\epsilon = ${d(V.q21SmallEps, 1)}$; the flip part also carries a factor $-i$, which changes no chance. ` +
      `Measuring $Z_1Z_2$ projects onto the unflipped branch with probability $1 - \\epsilon^2 = ${d(V.q21SmallP00, 2)}$ or the flipped one with $\\epsilon^2 = ${d(V.q21SmallP11, 2)}$ (Eq. 9.2); either branch ends exactly corrected.`,
    caption: `a 60° nudge on qubit 2: the helpers read 00 with chance ${d(V.q21SmallP00, 2)}, 11 with chance ${d(V.q21SmallP11, 2)}`,
    captionFormal: `a 60° nudge on qubit 2: the helper chances before the reading, 00 with ${d(V.q21SmallP00, 2)}, 11 with ${d(V.q21SmallP11, 2)}`,
    stage: split(circ(C_BF('rx60'), 8), ampW(C_BF('rx60'), 8, [3, 4])),
    claims: [
      claim('q21SmallEps', 'the flip part has size $0.5$', () => close(V.q21SmallEps, 0.5, 1e-9)),
      claim('q21SmallP00', 'the helpers read 00 with chance $0.75$', () => close(V.q21SmallP00, 0.75, 1e-9) && close(V.q21SmallP00, 1 - V.q21SmallEps ** 2, 1e-12)),
      claim('q21SmallP11', 'and 11 with chance $0.25$', () => close(V.q21SmallP11, 0.25, 1e-9) && close(V.q21SmallP11, V.q21SmallEps ** 2, 1e-12)),
    ],
    derivation: {
      result: 'p_{11} = \\epsilon^2',
      ground: [
        {
          tex: 'R_x(60^\\circ) = \\cos30^\\circ\\,I - i\\sin30^\\circ\\,X',
          why: 'The nudge is two branches: “nothing” with size $\\cos30°$ and “flip” with size $\\sin30°$.',
          view: circ(C_BF('rx60'), 4),
          viewCaption: 'two branches',
        },
        {
          tex: 'Z_1Z_2:\\ +1\\ \\text{on “nothing”},\\ -1\\ \\text{on “flip”}',
          why: 'The first check reads $+1$ on the first branch and $-1$ on the second.',
          view: tb(['ZZI', 'IZZ'], { product: true }),
          viewCaption: 'the checks’ signs',
        },
        {
          tex: 'p_{11} = \\sin^2 30^\\circ = \\epsilon^2',
          why: 'Reading the helpers keeps one branch, with chance equal to its size squared.',
          view: ampW(C_BF('rx60'), 8, [3, 4]),
          viewCaption: '00 or 11',
        },
      ],
      formal: [
        {
          tex: 'R_x(60^\\circ)|\\psi\\rangle = \\cos30^\\circ\\,|\\psi\\rangle - i\\sin30^\\circ\\,X_2|\\psi\\rangle',
          why: 'Eq. 9.1: the nudged state is a sum of the untouched one and the flipped one.',
          view: circ(C_BF('rx60'), 4),
        },
        {
          tex: 'p_{11} = \\sin^2 30^\\circ = \\epsilon^2',
          why: 'The projectors $(I \\pm Z_1Z_2)/2$ keep one branch; the flipped branch has chance $\\epsilon^2$ (Eq. 9.2).',
          view: ampW(C_BF('rx60'), 8, [3, 4]),
        },
      ],
    },
  },
  {
    id: 'q21-bit-flip:b5',
    phase: 'clue',
    text: 'Qubits 1 and 2 both flip. What do the helpers read, and what does the fix do?',
    formal: 'After $X_1X_2$, what syndrome appears, which correction is applied, and what is the final state?',
    caption: 'qubits 1 and 2 flipped: the helpers have been read, what happens next?',
    captionFormal: '$X_1X_2$ on the code state, helpers read',
    stage: circ(C_BF('X1X2'), 9),
    reveal: {
      text:
        `The helpers read 01, the pattern of qubit 3. Flipping qubit 3 completes $XXX$, which swaps the code words: $${d(V.q21TwoFlipBar0, 1)}|000\\rangle + ${d(V.q21TwoFlipBar1, 1)}|111\\rangle$. ` +
        `The code fails whenever two or more qubits flip: chance $${d(V.q21RepFail01, 3)}$ at $p = ${d(V.q21P, 1)}$, as for bits.`,
      formal:
        `$X_1X_2$ has syndrome 01, decoded as $X_3$; the net $X_1X_2X_3$ is a logical flip, $${d(V.q21TwoFlipBar0, 1)}|\\bar0\\rangle + ${d(V.q21TwoFlipBar1, 1)}|\\bar1\\rangle$. ` +
        `Under independent flips the code fails with probability $p^2(3 - 2p) = ${d(V.q21RepFail01, 3)}$ at $p = ${d(V.q21P, 1)}$, the classical rate of Unit 21.1.`,
      caption: `qubits 1 and 2 flipped: helpers read 01, the fix lands on qubit 3; bars ${d(V.q21TwoFlipBar0, 1)} at 00001, ${d(V.q21TwoFlipBar1, 1)} at 11101`,
      captionFormal: `$X_1X_2$: helpers read 01, the fix lands on qubit 3; bars ${d(V.q21TwoFlipBar0, 1)} at 00001, ${d(V.q21TwoFlipBar1, 1)} at 11101`,
      stage: split(circ(C_BF('X1X2'), 10), amp(C_BF('X1X2'), 10, 'amplitude')),
      claims: [
        claim('q21TwoFlipSyn', 'the helpers read 01', () => V.q21TwoFlipSyn === 1),
        claim('q21TwoFlipBar0', 'the bar on 00001 has size $0.8$', () => close(V.q21TwoFlipBar0, 0.8, 1e-9)),
        claim('q21TwoFlipBar1', 'and the bar on 11101 has size $0.6$', () => close(V.q21TwoFlipBar1, 0.6, 1e-9)),
        claim('q21RepFail01', 'two flips happen with chance $0.028$ at $p = 0.1$', () => close(V.q21RepFail01, 0.028, 1e-9)),
        claim('q21P', 'the flip chance is $0.1$', () => close(V.q21P, 0.1, 1e-12)),
      ],
    },
  },
]

/* ---------------------------------------------------------------------------------------------- */
/* q21-phase-flip — Phase flips are bit flips seen sideways                                          */
/* ---------------------------------------------------------------------------------------------- */

const phaseFlip: Beat[] = [
  {
    id: 'q21-phase-flip:b1',
    phase: 'books',
    text:
      `Flip the sign instead: $Z_1$ turns the code state into $${d(V.q21EncBar0, 1)}|000\\rangle - ${d(V.q21EncBar1, 1)}|111\\rangle$. Both checks still read $+1$, so nothing gets fixed. ` +
      `The damaged state’s overlap with the original is only $-${d(V.q21Z1OverlapSize, 2)}$.`,
    formal:
      '$Z_1$ commutes with $Z_1Z_2$ and $Z_2Z_3$, so the syndrome is 00 while $a|\\bar0\\rangle + b|\\bar1\\rangle \\to a|\\bar0\\rangle - b|\\bar1\\rangle$: $Z_1$ acts as a logical $Z$. ' +
      `The overlap is $a^2 - b^2 = -${d(V.q21Z1OverlapSize, 2)}$, the fidelity $${d(V.q21Z1Fid, 4)}$.`,
    caption: 'a sign flip on qubit 1: helpers read 00, and the 111 bar turns to −0.8',
    captionFormal: '$Z_1$ on the code state: helpers read 00, and the 111 bar turns to $-0.8$',
    stage: split(circ(C_BF('Z1'), 9), amp(C_BF('Z1'), 9, 'signed')),
    claims: [
      ...ampClaims(),
      claim('q21Z1Syn', 'the helpers read 00', () => V.q21Z1Syn === 0),
      claim('q21Z1Overlap', 'the overlap is $-0.28$', () => close(V.q21Z1Overlap, -V.q21Z1OverlapSize, 1e-12) && close(V.q21Z1Overlap, V.q21A ** 2 - V.q21B ** 2, 1e-12)),
      claim('q21Z1OverlapSize', 'its size is $0.28$', () => close(V.q21Z1OverlapSize, 0.28, 1e-9)),
      claim('q21Z1Fid', 'the fidelity is $0.0784$', () => close(V.q21Z1Fid, 0.0784, 1e-9)),
    ],
  },
  {
    id: 'q21-phase-flip:b2',
    phase: 'books',
    text:
      'A Hadamard turns a sign flip into a bit flip: $HZH = X$ (Chapter Q4). So encode sideways: $|0\\rangle \\to |{+}{+}{+}\\rangle$ and $|1\\rangle \\to |{-}{-}{-}\\rangle$. ' +
      `Now all eight strings carry some amplitude; $|000\\rangle$ has $${d(V.q21PfBar000, 3)}$.`,
    formal:
      'The phase-flip code $|\\bar0\\rangle = |{+}{+}{+}\\rangle$, $|\\bar1\\rangle = |{-}{-}{-}\\rangle$ (Bergou p. 163; N&C Fig. 10.3) is the bit-flip code turned by $H^{\\otimes3}$. ' +
      `Since $HZH = X$ (Chapter Q4), $Z$ errors here act like $X$ errors there. The amplitude of $|000\\rangle$ is $(a + b)/\\sqrt8 = ${d(V.q21PfBar000, 3)}$.`,
    caption: 'the encoder with three Hadamards: eight real bars, 0.495 at 000',
    captionFormal: 'the encoder with $H^{\\otimes3}$: eight real bars, $0.495$ at 000',
    stage: split(circ(C_PF('none'), 4), amp(C_PF('none'), 4, 'signed')),
    claims: [claim('q21PfBar000', 'the bar on 000 has size $0.495$', () => close(V.q21PfBar000, 0.495, 5e-4) && close(V.q21PfBar000, (V.q21A + V.q21B) / Math.sqrt(8), 1e-12))],
  },
  {
    id: 'q21-phase-flip:b3',
    phase: 'books',
    text:
      'The checks become $X_1X_2$ and $X_2X_3$. A sign flip on qubit 2 makes both read $-1$, and $Z_2$ undoes it. ' +
      'In the circuit, Hadamards turn the code back first, so the same helpers can ask.',
    formal:
      'Measure $X_1X_2$ and $X_2X_3$ as $H^{\\otimes3}$, the $Z$-parity helpers, then $H^{\\otimes3}$: $Z_1$ gives $(-1, +1)$, $Z_2$ gives $(-1, -1)$, $Z_3$ gives $(+1, -1)$, the same pattern as the bit-flip table; ' +
      'correct with $Z_j$ (Bergou p. 163; N&C p. 431).',
    caption: 'a sign flip on qubit 2: after the Hadamards the helpers read 11',
    captionFormal: '$Z_2$ in the sideways code: after $H^{\\otimes3}$ the helpers read 11',
    stage: split(circ(C_PF('Z2'), 11), ampW(C_PF('Z2'), 11, [3, 4])),
    claims: [
      claim('q21PfSynZ1', 'a sign flip on qubit 1 gives the helpers 10', () => V.q21PfSynZ1 === 2),
      claim('q21PfSynZ2', 'on qubit 2 gives 11', () => V.q21PfSynZ2 === 3),
      claim('q21PfSynZ3', 'on qubit 3 gives 01', () => V.q21PfSynZ3 === 1),
    ],
  },
  {
    id: 'q21-phase-flip:b4',
    phase: 'clue',
    text: 'The new code catches sign flips. What if qubit 1 suffers a bit flip instead?',
    formal: 'Which single-qubit Pauli errors does the phase-flip code miss, and what do they do to $a|\\bar0\\rangle + b|\\bar1\\rangle$?',
    caption: 'the sideways code after a bit flip on qubit 1: do the helpers notice?',
    captionFormal: '$X_1$ in the sideways code, helpers read',
    stage: circ(C_PF('X1'), 11),
    reveal: {
      text:
        `It is missed: both checks still read $+1$. Worse, the stored qubit’s sign flips; the 000 bar drops to $-${d(V.q21PfX1BarSize, 4)}$. ` +
        'Each three-qubit code fixes one kind of error and is blind to the other.',
      formal:
        '$X_j$ commutes with $X_1X_2$, $X_2X_3$, and $X_1|{\\pm}{\\pm}{\\pm}\\rangle = \\pm|{\\pm}{\\pm}{\\pm}\\rangle$ gives $a|\\bar0\\rangle - b|\\bar1\\rangle$: $X_1$ is this code’s logical $Z$. ' +
        'Each code has a weight-1 logical operator; Unit 21.4 removes both.',
      caption: 'a bit flip on qubit 1: the 000 bar falls from 0.495 to −0.0707',
      captionFormal: '$X_1$ in the sideways code: the 000 bar falls from $0.495$ to $-0.0707$',
      stage: split(circ(C_PF('X1'), 5), amp(C_PF('X1'), 5, 'signed')),
      claims: [
        claim('q21PfX1Syn', 'the helpers still read 00', () => V.q21PfX1Syn === 0),
        claim('q21PfX1BarSize', 'the 000 bar falls to a size of $0.0707$', () => close(V.q21PfX1BarSize, 0.0707, 5e-5) && close(V.q21PfX1Bar000, -V.q21PfX1BarSize, 1e-12) && close(V.q21PfX1Bar000, (V.q21A - V.q21B) / Math.sqrt(8), 1e-12)),
        claim('q21PfBar000', 'from $0.495$', () => close(V.q21PfBar000, 0.495, 5e-4)),
      ],
    },
  },
]

/* ---------------------------------------------------------------------------------------------- */
/* q21-shor — Nine qubits catch any single error                                                     */
/* ---------------------------------------------------------------------------------------------- */

const shor: Beat[] = [
  {
    id: 'q21-shor:b1',
    phase: 'books',
    text:
      'Shor’s idea: encode with the phase-flip code, then guard each of its three qubits with the bit-flip code. That takes nine qubits in three groups of three. ' +
      `The [[qc-shor-code|Shor code]] word $|\\bar0\\rangle$ is a sum of ${V.q21ShorTerms} strings, each with amplitude $${d(V.q21ShorBar, 4)}$.`,
    formal:
      'The [[qc-shor-code|Shor code]] concatenates the phase-flip code with the bit-flip code (Bergou Eq. 9.3; N&C p. 432): $|\\bar0\\rangle, |\\bar1\\rangle = (|000\\rangle \\pm |111\\rangle)^{\\otimes3}/\\sqrt8$. ' +
      `Each is a sum of $2^3 = ${V.q21ShorTerms}$ strings of amplitude $1/\\sqrt8 = ${d(V.q21ShorBar, 4)}$.`,
    caption: 'nine qubits in three groups, with their eight checks',
    captionFormal: 'the Shor code: six $ZZ$ checks inside groups, two six-qubit $X$ checks across them',
    stage: code('shor9', { view: 'layout' }),
    fidelity: ['qc-code-lit'],
    claims: [
      claim('q21ShorBar', 'each string of $|\\bar0\\rangle$ has amplitude $0.3536$', () => close(V.q21ShorBar, 0.3536, 5e-5) && close(V.q21ShorBar, 1 / Math.sqrt(8), 1e-12)),
      claim('q21ShorTerms', '$|\\bar0\\rangle$ has 8 strings', () => V.q21ShorTerms === 8),
      claim('q21ShorChecks', 'the code has 8 checks', () => V.q21ShorChecks === 8),
    ],
  },
  {
    id: 'q21-shor:b2',
    phase: 'books',
    text:
      'Inside each group, two $ZZ$ checks find a bit flip as before. A flip of qubit 5 lights $Z_4Z_5$ and $Z_5Z_6$, and nothing else.',
    formal:
      'The six checks $Z_1Z_2, Z_2Z_3, Z_4Z_5, Z_5Z_6, Z_7Z_8, Z_8Z_9$ locate any single $X_j$ in its group (Bergou p. 163): $X_5$ anticommutes with exactly $Z_4Z_5$ and $Z_5Z_6$, and $X_5$ undoes it.',
    caption: 'a bit flip on qubit 5 lights the two Z checks beside it',
    captionFormal: '$X_5$ lights $Z_4Z_5$ and $Z_5Z_6$',
    stage: code('shor9', { error: 'X5', show: ['syndrome'] }),
    fidelity: ['qc-code-lit'],
    claims: [claim('q21ShorX5Lit', 'exactly 2 checks light for a flip of qubit 5', () => V.q21ShorX5Lit === 2)],
  },
  {
    id: 'q21-shor:b3',
    phase: 'books',
    text:
      'A sign flip on any qubit flips its group’s sign. Two big checks compare groups: $X_1\\cdots X_6$ and $X_4\\cdots X_9$. ' +
      'Group 1 gives $(-1, +1)$, group 2 gives $(-1, -1)$, group 3 gives $(+1, -1)$.',
    formal:
      '$Z_j$ maps its group’s $|000\\rangle + |111\\rangle$ to $|000\\rangle - |111\\rangle$; $X_1\\cdots X_6$ and $X_4\\cdots X_9$ read the group as $(-1, +1)$, $(-1, -1)$, $(+1, -1)$ for groups 1, 2, 3, and any $Z$ in that group repairs it. ' +
      'Bergou p. 164 prints group 1 as $(+1, -1)$, group 3’s pattern (Correction box).',
    caption: 'a sign flip on qubit 2: the first big check reads −1, the second +1',
    captionFormal: '$Z_2$: the first big check reads $-1$, the second $+1$',
    stage: code('shor9', { error: 'Z2', show: ['syndrome'] }),
    fidelity: ['qc-code-lit'],
    claims: [
      claim('q21ShorZg1', 'a sign flip in group 1 gives the readings 10', () => V.q21ShorZg1 === 2),
      claim('q21ShorZg2', 'in group 2, 11', () => V.q21ShorZg2 === 3),
      claim('q21ShorZg3', 'in group 3, 01', () => V.q21ShorZg3 === 1),
    ],
  },
  {
    id: 'q21-shor:b4',
    phase: 'books',
    text:
      '$Y = iXZ$ is a bit flip and a sign flip at once, so it lights both kinds of check. Sign flips on qubit 1 or qubit 2 light the same checks. ' +
      'Fixing either works, because $Z_1Z_2$ does nothing to a code word.',
    formal:
      `$Y_j = iX_jZ_j$ lights one $ZZ$ pattern and one $X$ pattern. The ${V.q21ShorWt1} errors of weight $\\le 1$ give only ${V.q21ShorDistinct} distinct syndromes: $Z_1, Z_2, Z_3$ share one, ` +
      'yet $Z_2$ after $Z_1$ leaves $Z_1Z_2$, which fixes every code word. Such a code is [[qc-degenerate-code|degenerate]] (Bergou p. 165).',
    caption: 'a sign flip on qubit 1, repaired on qubit 2: what is left, Z₁Z₂, is one of the checks',
    captionFormal: '$Z_1$ repaired by $Z_2$: what is left, $Z_1Z_2$, is a check',
    stage: code('shor9', { error: 'Z1', correction: 'Z2', show: ['syndrome', 'correction', 'residual'] }),
    fidelity: ['qc-code-lit'],
    claims: [
      claim('q21ShorWt1', 'there are 28 errors of weight at most 1', () => V.q21ShorWt1 === 28 && V.q21ShorWt1 === 1 + 3 * 9),
      claim('q21ShorDistinct', 'they give 22 different syndromes', () => V.q21ShorDistinct === 22),
      claim('q21Z1Z2Trivial', '$Z_1Z_2$ leaves every code word unchanged', () => close(V.q21Z1Z2Trivial, 0, 1e-12)),
    ],
  },
  {
    id: 'q21-shor:b5',
    phase: 'clue',
    text: 'Two qubits suffer bit flips. When does the Shor code still recover?',
    formal: `For a weight-2 $X$ error, when does minimum-weight decoding succeed? How many of the ${V.q21ShorW2} pairs?`,
    caption: 'two bit flips, in groups 1 and 2: the checks light up',
    captionFormal: '$X_1X_4$: the checks light up',
    stage: code('shor9', { error: 'X1X4', show: ['syndrome'] }),
    fidelity: ['qc-code-lit'],
    reveal: {
      text:
        `When the flips sit in different groups, each group repairs its own: ${V.q21ShorW2Fixed} of the ${V.q21ShorW2} pairs. Two flips in one group fool its vote, and the fix completes a logical error.`,
      formal:
        `$X_iX_j$ in different groups decodes group by group: ${V.q21ShorW2Fixed} of $\\binom92 = ${V.q21ShorW2}$. In one group, $X_1X_2$ is decoded as $X_3$, leaving $X_1X_2X_3$, which passes every check yet acts as a logical $Z$.`,
      caption: 'two bit flips in group 1: the fix lands on qubit 3 and X₁X₂X₃ is left',
      captionFormal: '$X_1X_2$ repaired by $X_3$: the residual $X_1X_2X_3$ is a logical operator',
      stage: code('shor9', { error: 'X1X2', correction: 'X3', show: ['syndrome', 'correction', 'residual'] }),
      fidelity: ['qc-code-lit'],
      claims: [
        claim('q21ShorW2Fixed', 'the Shor code recovers from 27 of the weight-2 flips', () => V.q21ShorW2Fixed === 27),
        claim('q21ShorW2', 'out of 36 pairs', () => V.q21ShorW2 === 36 && V.q21ShorW2 === (9 * 8) / 2),
      ],
    },
  },
]

/* ---------------------------------------------------------------------------------------------- */
/* q21-digitize — Any error is a mix of four                                                         */
/* ---------------------------------------------------------------------------------------------- */

const RX60 = (): MatrixGridState => mx({ gate: { name: 'Rx', params: [60] } }, { values: 'decimal' })

const digitize: Beat[] = [
  {
    id: 'q21-digitize:b1',
    phase: 'books',
    text:
      `Any $2\\times2$ table is a mix of $I$, $X$, $Y$ and $Z$ (the [[qc-pauli-matrices|Pauli matrices]]). Each weight comes from a trace, the sum down the diagonal, halved. ` +
      `The nudge $R_x(60^\\circ)$ is $${d(V.q21RxCI, 3)}\\,I$ plus $-${d(V.q21RxCX, 1)}i\\,X$: part nothing, part flip.`,
    formal:
      'Since $\\mathrm{Tr}(PQ) = 2\\delta_{PQ}$ on $\\{I, X, Y, Z\\}$, every $2\\times2$ matrix is $A = \\sum_Pc_PP$ with $c_P = \\mathrm{Tr}(PA)/2$ (Pauli expansion: Bergou p. 164; the trace formula is our working-out). ' +
      `For $R_x(60^\\circ)$: $c_I = \\cos30^\\circ = ${d(V.q21RxCI, 3)}$, $c_X = -i\\sin30^\\circ = -${d(V.q21RxCX, 1)}i$, $c_Y = c_Z = ${V.q21RxCYZ}$.`,
    caption: 'the nudge R_x(60°) as a table: 0.866 on the diagonal, −0.5i off it',
    captionFormal: '$R_x(60^\\circ)$ as a table: $0.866$ on the diagonal, $-0.5i$ off it',
    stage: RX60(),
    claims: [
      claim('q21RxCI', 'the weight of $I$ is $0.866$', () => close(V.q21RxCI, 0.866, 5e-4) && close(V.q21RxCI, Math.cos(Math.PI / 6), 1e-12)),
      claim('q21RxCX', 'the weight of $X$ has size $0.5$', () => close(V.q21RxCX, 0.5, 1e-12)),
      claim('q21RxCXIm', 'and is minus $i$ times that', () => close(V.q21RxCXIm, -V.q21RxCX, 1e-12)),
      claim('q21RxCYZ', 'the weights of $Y$ and $Z$ are 0', () => close(V.q21RxCYZ, 0, 1e-12)),
    ],
    derivation: {
      result: 'c_P = \\mathrm{Tr}(PA)/2',
      ground: [
        {
          tex: '\\mathrm{Tr}(PQ) = 2\\delta_{PQ}',
          why: 'A product of two different ones among $I$, $X$, $Y$, $Z$ has trace 0, and one of a letter with itself has trace 2.',
          view: tb(PAULI4),
          viewCaption: 'the four building blocks',
        },
        {
          tex: 'A = \\sum_P c_P\\,P',
          why: 'Any $2\\times2$ table is a sum of the four, each with its own weight $c_P$.',
          view: RX60(),
          viewCaption: 'the nudge’s table',
        },
        {
          tex: '\\mathrm{Tr}(QA) = \\sum_P c_P\\,\\mathrm{Tr}(QP) = 2c_Q',
          why: 'Multiply by $Q$ and take the trace: only the term $P = Q$ survives.',
          view: tb(PAULI4),
        },
        {
          tex: 'c_P = \\mathrm{Tr}(PA)/2',
          why: `For $R_x(60^\\circ)$ this gives $c_I = ${d(V.q21RxCI, 3)}$ and $c_X = -${d(V.q21RxCX, 1)}i$.`,
          view: RX60(),
          claims: [claim('q21RxCI', '$c_I = 0.866$', () => close(V.q21RxCI, 0.866, 5e-4)), claim('q21RxCX', '$|c_X| = 0.5$', () => close(V.q21RxCX, 0.5, 1e-12))],
        },
      ],
      formal: [
        {
          tex: '\\mathrm{Tr}(PQ) = 2\\delta_{PQ}',
          why: 'Two different ones among the four have a product of trace 0; each one times itself is $I$, of trace 2.',
          view: tb(PAULI4),
        },
        {
          tex: '\\mathrm{Tr}(QA) = \\sum_P c_P\\,\\mathrm{Tr}(QP) = 2c_Q',
          why: 'Expand $A$ and use the trace rule: one term survives.',
          view: RX60(),
        },
        {
          tex: 'c_P = \\mathrm{Tr}(PA)/2',
          why: 'Solve for the weight (Pauli expansion: Bergou p. 164; the trace formula is our working-out).',
          view: tb(PAULI4),
        },
      ],
    },
  },
  {
    id: 'q21-digitize:b2',
    phase: 'books',
    text:
      'Real noise couples a qubit to its surroundings (Chapter Q13). The joint state splits into four parts. In each the qubit got $I$, $X$, $Y$ or $Z$, and the surroundings keep a note.',
    formal:
      '$U_{AE}(|\\psi\\rangle|0\\rangle_E) = \\sum_PP|\\psi\\rangle|e_P\\rangle_E$ with $|e_{I,Z}\\rangle = \\tfrac12(|e_{00}\\rangle \\pm |e_{11}\\rangle)$, $|e_X\\rangle = \\tfrac12(|e_{01}\\rangle + |e_{10}\\rangle)$, $|e_Y\\rangle = \\tfrac i2(|e_{10}\\rangle - |e_{01}\\rangle)$ (Eqs. 9.4–9.6). ' +
      'This is Chapter Q13’s [[qc-kraus-operator|Kraus]] form (Eqs. 9.10–9.12); on $n$ qubits the sum runs over $4^n$ strings (Eq. 9.7).',
    caption: 'the four building blocks: one of them happened, and the environment knows which',
    captionFormal: 'the four Pauli rows $I, X, Y, Z$: the environment’s note $|e_P\\rangle$ goes with each',
    stage: tb(PAULI4),
    claims: [claim('q21EnvSplit', 'the four-part split agrees with the unitary to better than a trillionth', () => V.q21EnvSplit < 1e-12)],
  },
  {
    id: 'q21-digitize:b3',
    phase: 'books',
    text:
      `Measuring the checks keeps one part of the mix. So a code that fixes $X$, $Y$ and $Z$ on any one qubit fixes every one-qubit error. On $n$ qubits that is $1 + 3n$ cases: ${V.q21Wt1n3} for three qubits, ${V.q21Wt1n9} for nine. ` +
      `The 60° nudge again: the helpers read 00 with chance $${d(V.q21SmallP00, 2)}$ or 11 with chance $${d(V.q21SmallP11, 2)}$, never between.`,
    formal:
      'Measuring the syndrome projects $\\sum_aE_a|\\bar\\psi\\rangle|e_a\\rangle$ onto one $E_a$ (Eq. 9.9), so correcting a basis set $\\mathcal E$ corrects its span. ' +
      `Usually $\\mathcal E$ is every Pauli string of [[qc-error-weight|weight]] $\\le t$: $\\sum_{j\\le t}\\binom nj3^j$ strings, ${V.q21Wt1n3} for $n = 3$ and ${V.q21Wt1n9} for $n = 9$ ($t = 1$).`,
    caption: `the 60° nudge again: helpers read 00 (${d(V.q21SmallP00, 2)}) or 11 (${d(V.q21SmallP11, 2)}), never between`,
    captionFormal: `the 60° nudge again: helper chances ${d(V.q21SmallP00, 2)} for 00 and ${d(V.q21SmallP11, 2)} for 11`,
    stage: split(circ(C_BF('rx60'), 8), ampW(C_BF('rx60'), 8, [3, 4])),
    claims: [
      claim('q21Wt1n3', 'ten errors of weight at most 1 on three qubits', () => V.q21Wt1n3 === 10 && V.q21Wt1n3 === 1 + 3 * 3),
      claim('q21Wt1n9', 'twenty-eight on nine', () => V.q21Wt1n9 === 28 && V.q21Wt1n9 === 1 + 3 * 9),
      claim('q21SmallP00', 'the helpers read 00 with chance $0.75$', () => close(V.q21SmallP00, 0.75, 1e-9)),
      claim('q21SmallP11', 'and 11 with chance $0.25$', () => close(V.q21SmallP11, 0.25, 1e-9)),
    ],
  },
  {
    id: 'q21-digitize:b4',
    phase: 'clue',
    text: `Qubit 1 of the bit-flip code decays: the error is $\\sqrt\\gamma\\,|0\\rangle\\langle1|$ with $\\gamma = ${d(V.q21Gamma, 2)}$. Does the bit-flip code repair it?`,
    formal: `Expand $K = \\sqrt\\gamma|0\\rangle\\langle1|$ in the Pauli basis, with $\\gamma = ${d(V.q21Gamma, 2)}$. Does the three-qubit bit-flip code correct $K$ on qubit 1?`,
    caption: 'a Y error on qubit 1 of the bit-flip code: which checks light?',
    captionFormal: '$Y_1$ on the bit-flip code: the checks that light',
    stage: code('rep3', { error: 'Y1', show: ['syndrome'] }),
    fidelity: ['qc-code-lit'],
    claims: [claim('q21Gamma', 'the decay strength is $0.36$', () => close(V.q21Gamma, 0.36, 1e-12) && close(V.q21Gamma, V.q21A ** 2, 1e-12))],
    reveal: {
      text:
        `$K$ is half $X$ plus half $iY$, each with weight $${d(V.q21DampCoef, 1)}$ when $\\gamma = ${d(V.q21Gamma, 2)}$. The checks read both as “qubit 1 flipped” and flip it back. ` +
        'The $Y$ part leaves a sign flip behind, which this code cannot see.',
      formal:
        `$K = \\tfrac{\\sqrt\\gamma}2(X + iY)$, coefficients $${d(V.q21DampCoef, 1)}$ at $\\gamma = ${d(V.q21Gamma, 2)}$. $X_1$ and $Y_1$ share the syndrome $(-1, +1)$; after the fix $X_1$ the $Y_1$ branch carries $X_1Y_1 = iZ_1$, a logical $Z$. ` +
        'The Shor code separates the two.',
      caption: 'a Y on qubit 1, repaired by X on qubit 1: Z₁ is left',
      captionFormal: '$Y_1$ repaired by $X_1$: the residual $Z_1$ is a logical operator of the bit-flip code',
      stage: code('rep3', { error: 'Y1', correction: 'X1', show: ['syndrome', 'correction', 'residual'] }),
      fidelity: ['qc-code-lit'],
      claims: [claim('q21DampCoef', 'each part has weight $0.3$', () => close(V.q21DampCoef, 0.3, 1e-9) && close(V.q21DampCoef, Math.sqrt(V.q21Gamma) / 2, 1e-12))],
    },
  },
]

/* ---------------------------------------------------------------------------------------------- */
/* q21-kl — The test every code must pass                                                            */
/* ---------------------------------------------------------------------------------------------- */

const QHB_X = { from: 1, to: 10 }

const kl: Beat[] = [
  {
    id: 'q21-kl:b1',
    phase: 'books',
    text:
      'Picture each error moving the code into its own room, at right angles to the others. One measurement tells which room; undoing that error finishes the job. ' +
      'For the bit-flip code, $I, X_1, X_2, X_3$ give four separate rooms.',
    formal:
      'If $\\langle\\bar j|E_b^\\dagger E_a|\\bar k\\rangle = \\delta_{ab}\\delta_{jk}$ (Eq. 9.8), the spaces $E_a\\mathcal H_C$ are [[orthogonal|orthogonal]], measuring $\\sum_a\\lambda_aP_a$ reveals $a$, and $E_a^\\dagger$ recovers (Bergou p. 165). ' +
      'For the bit-flip code with $\\{I, X_1, X_2, X_3\\}$ this table is the $4\\times4$ identity.',
    caption: 'four errors, four different check patterns: four rooms',
    captionFormal: 'the checks $Z_1Z_2$, $Z_2Z_3$ against $I, X_1, X_2, X_3$: four distinct syndromes',
    stage: code('rep3', { view: 'checks', errors: ['III', 'XII', 'IXI', 'IIX'] }),
    claims: [claim('q21KlBitflipI', 'the table of the four errors differs from the identity by 0', () => close(V.q21KlBitflipI, 0, 1e-12))],
  },
  {
    id: 'q21-kl:b2',
    phase: 'books',
    introduces: ['qc-kl-condition'],
    text:
      'The exact rule allows more. An error may shrink or tilt the code, as long as it treats $|\\bar0\\rangle$ and $|\\bar1\\rangle$ alike. If it treats them differently, it has read the stored qubit. ' +
      `$Z_1$ does: $+1$ on $|000\\rangle$, $-1$ on $|111\\rangle$. It turns the bar ${d(V.q21EncBar1, 1)} on 111 into $-${d(V.q21EncBar1, 1)}$ and leaves the bar ${d(V.q21EncBar0, 1)} on 000 alone.`,
    formal:
      'The [[qc-kl-condition|Knill–Laflamme condition]] $\\langle\\bar j|E_b^\\dagger E_a|\\bar k\\rangle = C_{ba}\\delta_{jk}$, with $C$ Hermitian and the same for every $j$, is necessary and sufficient (Bergou Eq. 9.16 and Eq. 9.34; N&C p. 436). ' +
      'Bit-flip code: $\\langle\\bar0|Z_1|\\bar0\\rangle = 1 \\ne \\langle\\bar1|Z_1|\\bar1\\rangle = -1$, so $\\{I, Z_1\\}$ fails.',
    caption: 'Z₁ on 0.6|000⟩ + 0.8|111⟩: the 000 bar stays +0.6, the 111 bar turns −0.8',
    captionFormal: '$Z_1$ on $0.6|000\\rangle + 0.8|111\\rangle$: the 000 bar stays $+0.6$, the 111 bar turns $-0.8$',
    stage: amp(C_BF('Z1'), 4, 'signed'),
    claims: [
      ...ampClaims(),
      claim('q21KlZ1Zero', '$\\langle\\bar0|Z_1|\\bar0\\rangle = 1$', () => close(V.q21KlZ1Zero, 1, 1e-12)),
      claim('q21KlZ1One', '$\\langle\\bar1|Z_1|\\bar1\\rangle = -1$', () => close(V.q21KlZ1One, -1, 1e-12)),
    ],
  },
  {
    id: 'q21-kl:b3',
    phase: 'books',
    text:
      'In the Shor code, $Z_1$ and $Z_2$ act identically on every code word. The rule still holds, with a table $C$ that is not the identity. ' +
      'Mix them: $Z_1 - Z_2$ gives zero on the code, and $Z_1 + Z_2$ is one clean error.',
    formal:
      'For $\\{I, Z_1, Z_2\\}$ on the Shor code, $C = \\begin{pmatrix}1&0&0\\\\0&1&1\\\\0&1&1\\end{pmatrix}$, eigenvalues $0, 1, 2$. ' +
      'A unitary remix of the errors diagonalizes $C$ (Eqs. 9.23–9.25) into $(Z_1 \\pm Z_2)/\\sqrt2$; the minus one annihilates the code, and $R_\\nu$ (Eq. 9.26) undoes the other.',
    caption: 'sign flips on qubit 1 and on qubit 2 light the same checks',
    captionFormal: '$Z_1$ and $Z_2$ light the same checks of the Shor code',
    stage: code('shor9', { error: 'Z1', show: ['syndrome'] }),
    fidelity: ['qc-code-lit'],
    claims: [
      claim('q21KlShorC', 'the table is exactly the matrix with a block of ones', () => close(V.q21KlShorC, 0, 1e-12)),
      claim('q21KlShorEig0', 'its smallest eigenvalue is 0', () => close(V.q21KlShorEig0, 0, 1e-12)),
      claim('q21KlShorEig1', 'the middle one is 1', () => close(V.q21KlShorEig1, 1, 1e-12)),
      claim('q21KlShorEig2', 'the largest is 2', () => close(V.q21KlShorEig2, 2, 1e-12)),
    ],
    derivation: {
      result: '\\tilde Z = (Z_1 + Z_2)/\\sqrt2',
      ground: [
        {
          tex: 'E = Z_1',
          why: 'A sign flip on qubit 1 lights one pattern of checks.',
          view: code('shor9', { error: 'Z1', show: ['syndrome'] }),
          viewCaption: 'Z on qubit 1',
        },
        {
          tex: 'E = Z_2',
          why: 'A sign flip on qubit 2 lights exactly the same pattern.',
          view: code('shor9', { error: 'Z2', show: ['syndrome'] }),
          viewCaption: 'Z on qubit 2',
        },
        {
          tex: '(Z_1 - Z_2)|\\bar\\psi\\rangle = 0,\\quad \\tilde Z = (Z_1 + Z_2)/\\sqrt2',
          why: 'The difference vanishes on every code word, and the sum is one clean error that a single fix undoes.',
          view: code('shor9', { error: 'Z1', correction: 'Z2', show: ['syndrome', 'correction', 'residual'] }),
          viewCaption: 'what is left is a check',
        },
      ],
      formal: [
        {
          tex: 'u^\\dagger Cu = \\mathrm{diag}(0, 1, 2)',
          why: 'Eq. 9.24: a unitary $u$ diagonalizes the Hermitian table $C$, here with eigenvalues 0, 1, 2.',
          view: code('shor9', { error: 'Z1', show: ['syndrome'] }),
        },
        {
          tex: 'R_\\nu\\,\\tilde E_\\nu|\\bar\\psi\\rangle \\propto |\\bar\\psi\\rangle',
          why: 'Eq. 9.26: each new error with a nonzero eigenvalue gets its own recovery operator $R_\\nu$.',
          view: code('shor9', { error: 'Z2', show: ['syndrome'] }),
        },
        {
          tex: 'P^\\perp + \\sum_\\nu R_\\nu^\\dagger R_\\nu = I,\\quad \\tilde Z = (Z_1 + Z_2)/\\sqrt2',
          why: 'Eqs. 9.27–9.30: the recoveries and a projector $P^\\perp$ onto the rest complete a valid operation; the remix of $Z_1, Z_2$ is $\\tilde Z$.',
          view: code('shor9', { error: 'Z1', correction: 'Z2', show: ['syndrome', 'correction', 'residual'] }),
        },
      ],
    },
  },
  {
    id: 'q21-kl:b4',
    phase: 'books',
    introduces: ['qc-code-nk'],
    text:
      'Count rooms. An [[qc-code-nk|$[\\![n, k]\\!]$ code]] stores $k$ qubits in $n$. Separate rooms for $1 + 3n$ errors need $2^k(1 + 3n) \\le 2^n$. ' +
      `For one stored qubit, five is the least: $2 \\times ${V.q21Qhb5Rooms} = ${V.q21Qhb5} = 2^5$.`,
    formal:
      'A nondegenerate [[qc-code-nk|$[\\![n, k]\\!]$ code]] correcting $t$ errors needs $2^k\\sum_{j\\le t}\\binom nj3^j \\le 2^n$, the [[qc-quantum-hamming-bound|quantum Hamming bound]] ' +
      `(N&C §10.3.4, pp. 444–445; Bergou’s end-of-chapter problem, p. 177, cited only). For $k = t = 1$: $n \\ge ${V.q21QhbMinN}$, equality at $n = 5$; Shor uses $${V.q21QhbShorNeed} \\le ${V.q21QhbShorHave}$.`,
    caption: 'rooms needed, 2(1 + 3n), against dimensions available, 2ⁿ: they meet at n = 5',
    captionFormal: 'rooms needed, $2(1 + 3n)$, against dimensions available, $2^n$: they meet at $n = 5$',
    stage: pl('qhbNeed1', { ...marks(5) }, { vs: 'twoToN', x: QHB_X }),
    claims: [
      claim('q21QhbMinN', 'the least $n$ for one stored qubit and one error is 5', () => V.q21QhbMinN === 5),
      claim('q21Qhb5Rooms', 'five qubits need 16 rooms per stored state', () => V.q21Qhb5Rooms === 16 && V.q21Qhb5Rooms === 1 + 3 * 5),
      claim('q21Qhb5', 'so $2 \\times 16 = 32$ in all', () => V.q21Qhb5 === 32 && V.q21Qhb5 === 2 ** 5),
      claim('q21QhbShorNeed', 'the Shor code needs 56', () => V.q21QhbShorNeed === 56),
      claim('q21QhbShorHave', 'out of 512', () => V.q21QhbShorHave === 512),
    ],
  },
  {
    id: 'q21-kl:b5',
    phase: 'clue',
    text: 'Could four qubits protect one qubit from any single error, with separate rooms?',
    formal: 'Does the quantum Hamming bound allow a nondegenerate $[\\![4, 1]\\!]$ code with $t = 1$?',
    caption: 'rooms needed against dimensions available, for n from 1 to 10',
    captionFormal: '$2(1 + 3n)$ against $2^n$ for $n = 1, \\dots, 10$',
    stage: pl('qhbNeed1', {}, { vs: 'twoToN', x: QHB_X }),
    reveal: {
      text:
        `No: four qubits offer ${V.q21Qhb4Have} dimensions, but separate rooms need $2 \\times 13 = ${V.q21Qhb4Need}$. The five-qubit code of Chapter Q22 fills its ${V.q21Qhb5} exactly.`,
      formal:
        `$2(1 + 12) = ${V.q21Qhb4Need} > ${V.q21Qhb4Have}$: no nondegenerate $[\\![4, 1]\\!]$ code corrects one error. The counting covers nondegenerate codes only (N&C p. 445); the five-qubit code of Chapter Q22 meets the bound with equality.`,
      caption: 'at n = 4: 26 needed, 16 available',
      captionFormal: 'at $n = 4$: 26 needed, 16 available',
      stage: pl('qhbNeed1', { ...marks(4, 5) }, { vs: 'twoToN', x: QHB_X }),
      claims: [
        claim('q21Qhb4Need', 'four qubits need 26 rooms', () => V.q21Qhb4Need === 26 && V.q21Qhb4Need === 2 * (1 + 3 * 4)),
        claim('q21Qhb4Have', 'but offer 16 dimensions', () => V.q21Qhb4Have === 16),
        claim('q21Qhb5', 'five qubits fill 32 exactly', () => V.q21Qhb5 === 32),
      ],
    },
  },
]

/* ---------------------------------------------------------------------------------------------- */
/* q21-dfs — Hiding where the noise cannot reach                                                     */
/* ---------------------------------------------------------------------------------------------- */

/** ρ of an equal mixture of the one-qubit state turned by +60° and by −60°. */
const MIX_ONE = (): MatrixGridState =>
  mxr([
    { C: C_1(60), k: 2 },
    { C: C_1(-60), k: 2 },
  ])
const MIX_DFS = (): MatrixGridState =>
  mxr([
    { C: C_DFS(60), k: 4 },
    { C: C_DFS(-60), k: 4 },
  ])

const dfs: Beat[] = [
  {
    id: 'q21-dfs:b1',
    phase: 'books',
    text:
      `Suppose $|1\\rangle$ picks up a random phase, $+60°$ or $-60°$ with equal chance (<<qc-l6-mixture|Lecture 6>>). On average, the off-diagonal entry of the density matrix $\\rho$ shrinks by half: from $${d(V.q21Off0, 2)}$ to $${d(V.q21Off1, 2)}$. ` +
      'A phase spread evenly round the circle wipes it out.',
    formal:
      '$R(\\varphi) = e^{i\\varphi(I - Z)/2}$ (Chapter Q4’s $P(\\varphi)$) with random $\\varphi$ gives $\\rho_{10} = a^*b\\,z$, $z = \\int p(\\varphi)e^{i\\varphi}d\\varphi$ ' +
      `(Eqs. 9.55–9.57; the printed last term should be $|0\\rangle\\langle1|$: Correction box). Here $z = ${d(V.q21Z60, 1)}$, so $${d(V.q21Off0, 2)} \\to ${d(V.q21Off1, 2)}$; uniform $\\varphi$ gives $0$, a Gaussian of width 1 rad $${d(V.q21ZGauss, 4)}$.`,
    caption: `ρ after a ±60° random phase: ${d(V.q21Chance0, 2)} and ${d(V.q21Chance1, 2)} on the diagonal, ${d(V.q21Off1, 2)} off it`,
    captionFormal: `$\\rho$ after a $\\pm60°$ random phase: ${d(V.q21Chance0, 2)} and ${d(V.q21Chance1, 2)} on the diagonal, ${d(V.q21Off1, 2)} off it`,
    stage: MIX_ONE(),
    claims: [
      claim('q21Chance0', 'the diagonal holds $0.36$', () => close(V.q21Chance0, 0.36, 1e-9)),
      claim('q21Chance1', 'and $0.64$', () => close(V.q21Chance1, 0.64, 1e-9)),
      claim('q21Z60', 'the factor for $\\pm60°$ is $0.5$', () => close(V.q21Z60, 0.5, 1e-9)),
      claim('q21Off0', 'the off-diagonal entry starts at $0.48$', () => close(V.q21Off0, 0.48, 1e-9) && close(V.q21Off0, V.q21A * V.q21B, 1e-12)),
      claim('q21Off1', 'and falls to $0.24$', () => close(V.q21Off1, 0.24, 1e-9) && close(V.q21Off1, V.q21Off0 * V.q21Z60, 1e-12)),
      claim('q21ZUniform', 'a phase spread evenly round the circle leaves 0', () => close(V.q21ZUniform, 0, 1e-12)),
      claim('q21ZGauss', 'a Gaussian of width 1 leaves $0.6065$', () => close(V.q21ZGauss, 0.6065, 5e-5) && close(V.q21ZGauss, Math.exp(-0.5), 1e-9)),
      claim('q21PrintedTrace', 'as printed, the matrix would have trace $1.24$', () => close(V.q21PrintedTrace, 1.24, 1e-9) && close(V.q21TrueTrace, 1, 1e-12) && close(V.q21PrintedTrace, 1 + V.q21Off1, 1e-12)),
    ],
  },
  {
    id: 'q21-dfs:b2',
    phase: 'books',
    text:
      'Now two qubits feel the same random phase. $|01\\rangle$ and $|10\\rangle$ each hold one 1, so both turn by the same angle. $|00\\rangle$ does not turn, and $|11\\rangle$ turns twice as far.',
    formal:
      '[[qc-collective-dephasing|Collective dephasing]] $R(\\varphi)\\otimes R(\\varphi)$ (Eq. 9.58) multiplies $|x_1x_2\\rangle$ by $e^{i\\varphi(x_1 + x_2)}$: phases $0$, $\\varphi$, $\\varphi$, $2\\varphi$, here $0°, 60°, 60°, 120°$. ' +
      'On $a|01\\rangle + b|10\\rangle$ it is a [[global-phase|global phase]] (Eq. 9.59).',
    caption: `${d(V.q21A, 1)}|01⟩ + ${d(V.q21B, 1)}|10⟩ after a 60° shared turn: both dials at 60°`,
    captionFormal: `${d(V.q21A, 1)}|01⟩ + ${d(V.q21B, 1)}|10⟩ after a 60° shared turn: both dials at 60°`,
    stage: amp(C_DFS(60), 4, 'amplitude', { dials: true }),
    claims: [
      ...ampClaims(),
      claim('q21DfsPh01', '$|01\\rangle$ and $|10\\rangle$ turn by 60°', () => close(V.q21DfsPh01, 60, 1e-9)),
      claim('q21DfsPh11', '$|11\\rangle$ turns by 120°', () => close(V.q21DfsPh11, 120, 1e-9)),
    ],
  },
  {
    id: 'q21-dfs:b3',
    phase: 'books',
    text:
      `So store the qubit as $|0\\rangle \\to |01\\rangle$ and $|1\\rangle \\to |10\\rangle$. The shared phase now turns the whole state only, which changes nothing. Its $\\rho$ keeps the $${d(V.q21DfsOff, 2)}$ that a lone qubit lost half of.`,
    formal:
      `On the [[qc-dfs|decoherence-free subspace]] $\\mathrm{span}\\{|01\\rangle, |10\\rangle\\}$, averaging Eq. 9.58 over any $p(\\varphi)$ leaves $\\rho$ unchanged (Bergou pp. 176–177): the coherence stays $${d(V.q21DfsOff, 2)}$, against $${d(V.q21Off1, 2)}$ for the bare qubit under the same noise.`,
    caption: `ρ of ${d(V.q21A, 1)}|01⟩ + ${d(V.q21B, 1)}|10⟩ after the same ±60° noise: still ${d(V.q21DfsOff, 2)} off the diagonal`,
    captionFormal: `$\\rho$ of ${d(V.q21A, 1)}|01⟩ + ${d(V.q21B, 1)}|10⟩ after the same $\\pm60°$ noise: still ${d(V.q21DfsOff, 2)} off the diagonal`,
    stage: MIX_DFS(),
    claims: [
      ...ampClaims(),
      claim('q21DfsOff', 'the coherence of the pair stays $0.48$', () => close(V.q21DfsOff, 0.48, 1e-9) && close(V.q21DfsOff, V.q21Off0, 1e-12)),
      claim('q21Off1', 'while a lone qubit under the same noise keeps $0.24$', () => close(V.q21Off1, 0.24, 1e-9)),
    ],
    derivation: {
      result: "\\rho' = \\rho",
      ground: [
        {
          tex: 'e^{i\\varphi(x_1 + x_2)} = e^{i\\varphi}\\quad\\text{for } x_1 + x_2 = 1',
          why: '$|01\\rangle$ and $|10\\rangle$ each hold one 1, so both turn by the same angle.',
          view: amp(C_DFS(60), 4, 'amplitude', { dials: true }),
          viewCaption: 'both dials turn alike',
        },
        {
          tex: 'e^{i\\varphi}|\\psi\\rangle\\langle\\psi|e^{-i\\varphi} = |\\psi\\rangle\\langle\\psi|',
          why: 'A phase common to the whole state cancels in $|\\psi\\rangle\\langle\\psi|$.',
        },
        {
          tex: "\\rho' = \\int p(\\varphi)\\,\\rho\\,d\\varphi = \\rho",
          why: 'Every phase gives the same $\\rho$, so their average is that $\\rho$.',
          view: MIX_DFS(),
          viewCaption: 'ρ unchanged',
        },
      ],
      formal: [
        {
          tex: 'R(\\varphi)^{\\otimes2}(a|01\\rangle + b|10\\rangle) = e^{i\\varphi}(a|01\\rangle + b|10\\rangle)',
          why: 'Eq. 9.59: on the subspace the shared turn is a global phase.',
          view: amp(C_DFS(60), 4, 'amplitude', { dials: true }),
        },
        {
          tex: "\\rho' = \\int p(\\varphi)\\,\\rho\\,d\\varphi = \\rho",
          why: 'Eq. 9.58 averaged: a global phase drops out of $\\rho$, so every $p(\\varphi)$ leaves it unchanged.',
          view: MIX_DFS(),
        },
      ],
    },
  },
  {
    id: 'q21-dfs:b4',
    phase: 'clue',
    text: 'What if each qubit gets its own random $\\pm60°$, chosen separately?',
    formal: 'With independent $\\varphi_1, \\varphi_2 = \\pm60°$, what becomes of the coherence between $|01\\rangle$ and $|10\\rangle$?',
    caption: 'independent phases +60° and −60°: the two dials no longer agree',
    captionFormal: '$\\varphi_1 = +60°$, $\\varphi_2 = -60°$: the two dials differ',
    stage: amp(C_IND(60, -60), 4, 'amplitude', { dials: true }),
    reveal: {
      text:
        `Then the pair is not quiet. The coherence falls from $${d(V.q21DfsOff, 2)}$ to $${d(V.q21IndOff, 2)}$, worse than a lone qubit’s $${d(V.q21Off1, 2)}$. The trick needs noise that hits both qubits alike.`,
      formal:
        `The [[relative-phase|relative phase]] $\\varphi_1 - \\varphi_2$ survives: the entry becomes $ab\\,|z|^2 = ${d(V.q21DfsOff, 2)} \\times ${d(V.q21Z60Sq, 2)} = ${d(V.q21IndOff, 2)}$. The subspace is decoherence-free only for collective noise (Bergou p. 176); otherwise a code is needed.`,
      caption: `independent ±60° phases: the off-diagonal drops to ${d(V.q21IndOff, 2)}`,
      captionFormal: `independent $\\pm60°$ phases: the off-diagonal drops to ${d(V.q21IndOff, 2)}`,
      stage: mxr([
        { C: C_IND(60, 60), k: 4 },
        { C: C_IND(60, -60), k: 4 },
        { C: C_IND(-60, 60), k: 4 },
        { C: C_IND(-60, -60), k: 4 },
      ]),
      claims: [
        claim('q21DfsOff', 'the shared-noise coherence was $0.48$', () => close(V.q21DfsOff, 0.48, 1e-9)),
        claim('q21Z60Sq', 'the square of the factor is $0.25$', () => close(V.q21Z60Sq, 0.25, 1e-9) && close(V.q21Z60Sq, V.q21Z60 ** 2, 1e-12)),
        claim('q21IndOff', 'independent noise leaves $0.12$', () => close(V.q21IndOff, 0.12, 1e-9) && close(V.q21IndOff, V.q21Off0 * V.q21Z60Sq, 1e-12)),
        claim('q21Off1', 'against $0.24$ for a lone qubit', () => close(V.q21Off1, 0.24, 1e-9)),
      ],
    },
  },
  {
    id: 'q21-dfs:b5',
    phase: 'deeper',
    text:
      'Each code here was fixed by a short list of commuting checks. Chapter Q22 makes the list the definition of a code. The Papers section then builds larger codes the same way.',
    formal:
      'Every code above is the joint $+1$ space of commuting Pauli checks: $Z_1Z_2, Z_2Z_3$; $X_1X_2, X_2X_3$; Shor’s eight. Chapter Q22 takes the checks as the definition (stabilizer codes); ' +
      'the Papers section’s background chapters on the surface code, logical measurement, magic states, Pauli-based computation and quantum LDPC codes carry this to larger codes.',
    caption: 'the Shor code named by its eight checks',
    captionFormal: 'the Shor code as a table of its eight Pauli checks',
    stage: code('shor9', { view: 'checks' }),
    claims: [claim('q21ShorChecks', 'the Shor code is named by 8 checks', () => V.q21ShorChecks === 8)],
  },
]

export const Q21_STORY: Record<string, Beat[]> = {
  'q21-classical': classical,
  'q21-bit-flip': bitFlip,
  'q21-phase-flip': phaseFlip,
  'q21-shor': shor,
  'q21-digitize': digitize,
  'q21-kl': kl,
  'q21-dfs': dfs,
}

/** Every claim used anywhere in a unit's beats, for Unit.claims (content.test.tsx "claims hold"). */
function allClaims(beats: Beat[]) {
  return beats.flatMap((b) => [...(b.claims ?? []), ...(b.reveal?.claims ?? []), ...(b.derivation?.ground.flatMap((s) => s.claims ?? []) ?? []), ...(b.derivation?.formal?.flatMap((s) => s.claims ?? []) ?? [])])
}
export const Q21_UNIT_CLAIMS_BY_ID: Record<string, ReturnType<typeof allClaims>> = Object.fromEntries(Object.entries(Q21_STORY).map(([id, beats]) => [id, allClaims(beats)]))
