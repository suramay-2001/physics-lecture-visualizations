/**
 * Chapter Q16 scroll story (Physics 709; roles P + W). Beats per docs/roles/proposals/P-Q16-story.md §1, in both tracks, with the judge's
 * rulings (docs/roles/decisions/qc709-Q15Q17.md): the running examples are Deutsch–Jozsa on n = 3 with F_BALN and F_BAL = x·101 and
 * Bernstein–Vazirani on n = 4 with a = 1011, b = 1 (R1); Bergou's ancilla circuit is drawn only in dj:b1, the third classical-cost clue and
 * the classical queries, and every amplitude view is the phase form of Chapter Q5's kickback (R2); the randomized classical cost is kept
 * (R3); the minimax check of 2^{n-1} + 1 lives in the engine (R4); the Try-its are one-qubit stand-ins checked against the real widget code
 * (R5); the Part VII Blender opener is not built here (R6); Bergou's problem P7.3 is cited only (R7).
 *
 * Build notes against the plan (reported to the orchestrator):
 * - Phase `'books'` throughout (no 709 notes reach Chapter 7 yet): ramp beats are `books`, the clues are `clue`.
 * - The wires are named x₂ x₁ x₀ (top to bottom), so a string such as 101 reads x₂x₁x₀ = 1, 0, 1, which is index 5.
 * - The amplitudes view prints "mean = …" to three decimals; a caption quotes the dashed mean line only where the plan does.
 * - The two circuit forms differ only by the target wire: the ancilla form is drawn once (dj:b1) and the amplitude views use the phase form.
 *
 * Standing rules kept here: every derivation (both tracks) carries `view` on at least two steps, from kinds already shown in the SAME unit
 * (W-709 #11; circuit and amplitudes); exactly one notation beat per new notation (W-709 #12: the bit dot product); no TeX command outside
 * `$…$`; every number comes from Q16.values.ts (an engine call), never a typed literal; cross-chapter references are named in words, as
 * "Unit 16.2" or "Chapter Q5", never by plan ids.
 */
import type { Circuit } from '../../physics/qc/circuit'
import type { AmplitudesState, Beat, CircuitStageState, Scrub, StageLayout, StageState } from '../schema'
import { C_BV, C_BVQ, C_CLQ, C_DJ, C_DJA, C_H1, C_H2, C_H3, C_HH3, F_BAL, F_BALN, F_ONE, V, claim, close, d } from './Q16.values'

/* ---------------------------------------------------------------------------------------------- */
/* Stage shorthand (plan "Stage shorthand"), as plain builder functions                              */
/* ---------------------------------------------------------------------------------------------- */
const circ = (C: Circuit, upTo: Scrub): CircuitStageState => ({ kind: 'circuit', circuit: C, upTo, shot: 'Q-WIRES' })
const amp = (C: Circuit, upTo: Scrub, mode: AmplitudesState['mode']): AmplitudesState => ({ kind: 'amplitudes', state: { circuit: C, upTo }, mode, shot: 'A-BARS' })
const split = (top: StageState, bottom: StageState): StageLayout => ({ layout: 'split', top, bottom })

/** The number a bar or chance shows, with its sign written out. */
const plus = (x: number, k = 4): string => `$+${d(Math.abs(x), k)}$`
const minus = (x: number, k = 4): string => `$-${d(Math.abs(x), k)}$`

/* ---------------------------------------------------------------------------------------------- */
/* q16-hadamard-n — Hadamards on every wire, signs everywhere                                        */
/* ---------------------------------------------------------------------------------------------- */

const hadamardN: Beat[] = [
  {
    id: 'q16-hadamard-n:b1',
    phase: 'books',
    text:
      'One [[qc-hadamard|Hadamard gate]] sends $|0\\rangle$ to $|+\\rangle$ and $|1\\rangle$ to $|-\\rangle$. Both results are even mixes of $|0\\rangle$ and $|1\\rangle$. ' +
      'Only the sign in front of $|1\\rangle$ remembers which one went in. ' +
      'In Chapter Q5 an H on every wire of $|00\\cdots0\\rangle$ was called the [[qc-walsh-hadamard|Walsh–Hadamard transform]]. Here the input can be any string of bits.',
    formal:
      '$H|x\\rangle = (|0\\rangle + (-1)^x|1\\rangle)/\\sqrt2$ for $x \\in \\{0,1\\}$ (Bergou §7.1, Eq. 7.1 with $n = 1$, p. 117). ' +
      'Chapter Q5’s [[qc-walsh-hadamard|Walsh–Hadamard transform]] $H^{\\otimes n}$ took the all-zeros string to the uniform state; here the input is any string $x$.',
    caption: `$H|1\\rangle$ on one wire: the bar of $|0\\rangle$ is ${plus(V.q16H1Bar)} and the bar of $|1\\rangle$ is ${minus(V.q16H1Bar)}`,
    captionFormal: `$H|1\\rangle$: amplitudes ${plus(V.q16H1Bar)} on $|0\\rangle$ and ${minus(V.q16H1Bar)} on $|1\\rangle$, the signs of $|-\\rangle$`,
    stage: split(circ(C_H1, 1), amp(C_H1, 1, 'signed')),
    claims: [
      claim('q16H1Bar', 'after H both bars have size $0.7071$', () => close(V.q16H1Bar, Math.SQRT1_2, 1e-9)),
      claim('q16H1Minus', 'the bar of $|1\\rangle$ in $H|1\\rangle$ is $-0.7071$', () => close(V.q16H1Minus, -Math.SQRT1_2, 1e-9)),
    ],
  },
  {
    id: 'q16-hadamard-n:b2',
    phase: 'books',
    introduces: ['qc-bit-dot'],
    text:
      'Now take $n$ wires and a starting string $x$. Write $x\\cdot z$ for the [[qc-bit-dot|bit dot product]] of two strings: multiply matching bits, add them, and keep only whether the total is odd. ' +
      'After a column of Hadamards, each string $|z\\rangle$ has size $2^{-n/2}$ and sign $(-1)^{x\\cdot z}$. ' +
      `For two wires and $x = 11$ the four signs are plus, minus, minus, plus, each of size $${d(V.q16H2Pos, 1)}$.`,
    formal:
      'With the [[qc-bit-dot|bit dot product]] $x\\cdot z = \\sum_j x_jz_j \\bmod 2$, the transform acts as $H^{\\otimes n}|x\\rangle = 2^{-n/2}\\sum_z(-1)^{x\\cdot z}|z\\rangle$ (Bergou Eqs. 7.1–7.2). ' +
      `For $n = 2$ and $x = 11$ this is $\\tfrac12(|00\\rangle - |01\\rangle - |10\\rangle + |11\\rangle)$, four amplitudes of size $${d(V.q16H2Pos, 1)}$.`,
    caption: `$H\\otimes H|11\\rangle$: four bars, ${plus(V.q16H2Pos, 1)}, ${minus(V.q16H2Pos, 1)}, ${minus(V.q16H2Pos, 1)}, ${plus(V.q16H2Pos, 1)} for $|00\\rangle$, $|01\\rangle$, $|10\\rangle$, $|11\\rangle$`,
    captionFormal: `$H^{\\otimes 2}|11\\rangle$: the signs $(-1)^{11\\cdot z}$ for $z = 00, 01, 10, 11$ are $+, -, -, +$, each of size $${d(V.q16H2Pos, 1)}$`,
    stage: split(circ(C_H2(0b11), 1), amp(C_H2(0b11), 1, 'signed')),
    claims: [
      claim('q16H2Pos', 'the bar of $|00\\rangle$ in $H\\otimes H|11\\rangle$ is $+0.5$', () => close(V.q16H2Pos, 0.5, 1e-9)),
      claim('q16H2Neg', 'the bar of $|01\\rangle$ in $H\\otimes H|11\\rangle$ is $-0.5$', () => close(V.q16H2Neg, -0.5, 1e-9)),
    ],
    derivation: {
      result: 'H^{\\otimes n}|x\\rangle = 2^{-n/2}\\sum_z(-1)^{x\\cdot z}|z\\rangle',
      ground: [
        {
          tex: 'H|x_j\\rangle = \\tfrac{1}{\\sqrt2}\\big(|0\\rangle + (-1)^{x_j}|1\\rangle\\big)',
          why: 'One wire at a time. The gate keeps $|0\\rangle$ positive and puts the sign $(-1)^{x_j}$ in front of $|1\\rangle$. Here $x_j$ is the bit on wire $j$.',
          view: amp(C_H1, 1, 'signed'),
          viewCaption: 'one wire: H turns $|1\\rangle$ into a plus bar and a minus bar',
        },
        {
          tex: 'H^{\\otimes n}|x\\rangle = \\bigotimes_{j}\\tfrac{1}{\\sqrt2}\\big(|0\\rangle + (-1)^{x_j}|1\\rangle\\big)',
          why: 'The gates act on separate wires, so the result for the whole register is the product of the results for the single wires.',
          view: circ(C_H2(0b11), 1),
          viewCaption: 'two wires, two separate Hadamards',
        },
        {
          tex: 'H^{\\otimes n}|x\\rangle = 2^{-n/2}\\sum_z\\Big(\\prod_{j:\\,z_j = 1}(-1)^{x_j}\\Big)|z\\rangle',
          why: 'Multiply out. The string $|z\\rangle$ takes $|1\\rangle$ on the wires where $z_j = 1$, and each of those wires brings the sign $(-1)^{x_j}$.',
          view: amp(C_H2(0b11), 1, 'signed'),
          viewCaption: 'two wires: the four strings and their signs',
        },
        {
          tex: 'H^{\\otimes n}|x\\rangle = 2^{-n/2}\\sum_z(-1)^{x\\cdot z}|z\\rangle',
          why: 'Signs multiply by adding exponents, and only whether the exponent is odd matters. The exponent $\\sum_j x_jz_j$ is odd exactly when $x\\cdot z = 1$.',
        },
      ],
      formal: [
        {
          tex: 'H^{\\otimes n}|x\\rangle = \\bigotimes_j H|x_j\\rangle = \\bigotimes_j\\tfrac{1}{\\sqrt2}\\big(|0\\rangle + (-1)^{x_j}|1\\rangle\\big)',
          why: 'The operator is a tensor product of one-wire gates, and each acts by the one-wire rule $H|x_j\\rangle = (|0\\rangle + (-1)^{x_j}|1\\rangle)/\\sqrt2$.',
          view: circ(C_H2(0b11), 1),
        },
        {
          tex: '= 2^{-n/2}\\sum_z\\prod_j(-1)^{x_jz_j}|z\\rangle = 2^{-n/2}\\sum_z(-1)^{\\sum_jx_jz_j}|z\\rangle',
          why: 'Expand the product over wires: each choice $z_j \\in \\{0,1\\}$ selects $|z_j\\rangle$ and carries the factor $(-1)^{x_jz_j}$, and the exponents then add.',
          view: amp(C_H2(0b11), 1, 'signed'),
        },
        {
          tex: 'H^{\\otimes n}|x\\rangle = 2^{-n/2}\\sum_z(-1)^{x\\cdot z}|z\\rangle',
          why: 'A sign depends only on the parity of its exponent, and $\\sum_jx_jz_j \\bmod 2$ is $x\\cdot z$ by definition.',
          view: amp(C_H3(0b101), 1, 'signed'),
        },
      ],
    },
  },
  {
    id: 'q16-hadamard-n:b3',
    phase: 'books',
    text:
      'Apply the Hadamards twice and you are back at $|x\\rangle$. The signs cancel everywhere except at the start. ' +
      'The reason is a sum: for any string $z$ other than $000$, the eight signs $(-1)^{x\\cdot z}$, one for each $x$, add up to 0. For $z = 000$ they are all plus and add up to 8. ' +
      `With $x = 101$ the first column gives eight bars of size $${d(V.q16H3Amp, 4)}$, and the second column puts all the chance back on $|101\\rangle$.`,
    formal:
      '$\\sum_x(-1)^{x\\cdot z} = 2^n\\delta_{z,0}$ (Bergou Eqs. 7.10–7.11), where $\\delta_{z,0}$ is 1 for $z = 0\\cdots0$ and 0 otherwise: pair the terms with $x_k = 0$ and $x_k = 1$ for any $k$ with $z_k = 1$. ' +
      `Hence $(H^{\\otimes n})^2 = I$: $|101\\rangle$ goes to bars of size $${d(V.q16H3Amp, 4)}$ and back to $|101\\rangle$.`,
    caption: 'two Hadamard columns on $|101\\rangle$, read after the second: the chance of $|101\\rangle$ is 1, and every other string has chance 0',
    captionFormal: '$(H^{\\otimes 3})^2|101\\rangle = |101\\rangle$: after column 2 the chance of $101$ is 1',
    stage: split(circ(C_HH3(0b101), 2), amp(C_HH3(0b101), 2, 'probability')),
    claims: [
      claim('q16H3Amp', 'after one column the eight bars have size $0.3536$', () => close(V.q16H3Amp, 1 / Math.sqrt(8), 1e-9)),
      claim('q16HHBack', 'after two columns $|101\\rangle$ has chance 1', () => close(V.q16HHBack, 1, 1e-9)),
      claim('q16WalshZ010', 'the eight signs $(-1)^{x\\cdot 010}$ add up to 0', () => close(V.q16WalshZ010, 0, 1e-9)),
      claim('q16WalshZ000', 'the eight signs $(-1)^{x\\cdot 000}$ add up to 8', () => close(V.q16WalshZ000, 8, 1e-9)),
    ],
    derivation: {
      result: '\\sum_x(-1)^{x\\cdot z} = 2^n\\delta_{z,0}',
      ground: [
        {
          tex: '\\sum_x(-1)^{x\\cdot z} = \\prod_{j}\\Big(\\sum_{x_j=0}^{1}(-1)^{x_jz_j}\\Big)',
          why: 'The sign of a string is a product with one factor per bit. So adding over all strings equals adding over each bit alone and multiplying the results.',
          view: amp(C_H3(0b010), 1, 'signed'),
          viewCaption: 'the eight signs of $H^{\\otimes 3}|010\\rangle$: four up, four down, mean 0',
        },
        {
          tex: '\\sum_{x_j=0}^{1}(-1)^{x_jz_j} = 1 + (-1)^{z_j}',
          why: 'A bit with $z_j = 1$ gives $1 + (-1) = 0$, and a single factor of 0 makes the whole product 0.',
        },
        {
          tex: 'z = 000:\\quad \\sum_x(-1)^{0} = 2^3 = 8',
          why: 'If $z$ is all zeros every sign is plus, so the eight signs add up to 8.',
          view: amp(C_H3(0), 1, 'signed'),
          viewCaption: 'all plus: eight bars of the same size, mean $0.3536$',
        },
        {
          tex: '\\sum_x(-1)^{x\\cdot z} = 2^n\\delta_{z,0}',
          why: 'So the sum is $2^n$ at $z = 0$ and 0 everywhere else. Two Hadamard columns therefore cancel everywhere except at the starting string.',
          view: amp(C_HH3(0b101), 2, 'probability'),
          viewCaption: 'two columns on $|101\\rangle$: all the chance is back on $|101\\rangle$',
        },
      ],
      formal: [
        {
          tex: '\\sum_x(-1)^{x\\cdot z} = \\prod_{j}\\sum_{x_j=0}^{1}(-1)^{x_jz_j} = \\prod_j\\big(1 + (-1)^{z_j}\\big)',
          why: 'Eq. 7.10: the sum over $x$ factors over the bits, and a factor with $z_j = 1$ is $1 + (-1) = 0$.',
          view: amp(C_H3(0b010), 1, 'signed'),
        },
        {
          tex: '\\sum_x(-1)^{x\\cdot 0} = 2^n,\\quad \\langle y|(H^{\\otimes n})^2|x\\rangle = 2^{-n}\\sum_z(-1)^{(x\\oplus y)\\cdot z}',
          why: 'Every factor is 2 at $z = 0$. For two columns, $(-1)^{x\\cdot z}(-1)^{z\\cdot y} = (-1)^{(x\\oplus y)\\cdot z}$, so the sum is the same Walsh sum with $z$ replaced by $x \\oplus y$.',
          view: amp(C_H3(0), 1, 'signed'),
        },
        {
          tex: '\\sum_x(-1)^{x\\cdot z} = 2^n\\delta_{z,0}',
          why: 'Eq. 7.11: the sum is $2^n$ at $z = 0$ and 0 elsewhere, which gives $\\langle y|(H^{\\otimes n})^2|x\\rangle = \\delta_{xy}$.',
          view: amp(C_HH3(0b101), 2, 'probability'),
        },
      ],
    },
  },
  {
    id: 'q16-hadamard-n:b4',
    phase: 'clue',
    text: 'Apply $H^{\\otimes 3}$ to $|101\\rangle$. Of the eight strings, how many get a minus sign?',
    formal: 'For $x = 101$, count the strings $z$ with $x\\cdot z = 1$. What holds for every $x \\neq 000$?',
    stage: circ(C_H3(0b101), 0),
    reveal: {
      text: 'Four: $001$, $011$, $100$ and $110$. Every nonzero $x$ splits the eight strings in half, so the signs average to zero.',
      formal: 'For $x \\neq 0$, $x\\cdot z = 1$ holds for exactly $2^{n-1}$ strings $z$, so the mean amplitude is 0; only $x = 0$ gives all plus signs.',
      caption: '$H^{\\otimes 3}|101\\rangle$: four bars down, four bars up, and the dashed mean line at 0',
      captionFormal: '$H^{\\otimes 3}|101\\rangle$: four minus signs of eight, mean amplitude 0',
      stage: split(circ(C_H3(0b101), 1), amp(C_H3(0b101), 1, 'signed')),
      claims: [
        claim('q16MinusCount', 'exactly four of the eight strings $z$ have $101\\cdot z = 1$', () => close(V.q16MinusCount, 4, 1e-9)),
        claim('q16H3Mean', 'the mean of the eight bars of $H^{\\otimes 3}|101\\rangle$ is 0', () => close(V.q16H3Mean, 0, 1e-9)),
      ],
    },
  },
]

/* ---------------------------------------------------------------------------------------------- */
/* q16-dj — Constant or balanced in one query                                                        */
/* ---------------------------------------------------------------------------------------------- */

const dj: Beat[] = [
  {
    id: 'q16-dj:b1',
    phase: 'books',
    text:
      'Now $f$ reads $n$ bits and returns one bit. A [[qc-constant|constant]] $f$ gives the same bit for every input. A [[qc-balanced|balanced]] $f$ gives 1 for exactly half of the inputs. ' +
      'We are promised that $f$ is one of the two, nothing in between. Which is it? That is a [[qc-promise-problem|promise problem]], and Bergou’s circuit settles it with one question.',
    formal:
      '[[qc-deutsch-jozsa|Deutsch–Jozsa]]: $f : \\{0,1\\}^n \\to \\{0,1\\}$ is promised to be constant or balanced (Bergou §7.1, p. 117). ' +
      'Fig. 7.1 puts $n$ wires in $|0\\rangle$ and the target in $|-\\rangle$, then applies $H^{\\otimes n}$, one f-CNOT $U_f$ and $H^{\\otimes n}$ again.',
    caption: 'Bergou’s circuit for $n = 3$: three input wires start in $|0\\rangle$, the target wire $y$ starts in $|-\\rangle$; H’s, the box $U_f$, H’s; the cursor is still at the start',
    captionFormal: 'Fig. 7.1 with $n = 3$: inputs $x_2, x_1, x_0$ in $|0\\rangle$, target $y$ in $|-\\rangle$; columns $H^{\\otimes 3}$, $U_f$, $H^{\\otimes 3}$, cursor at column 0',
    stage: circ(C_DJA(F_BALN), 0),
  },
  {
    id: 'q16-dj:b2',
    phase: 'books',
    text:
      'With the target in $|-\\rangle$, the query writes $f$ into signs: this is the [[qc-phase-kickback|phase kickback]] of Chapter Q5. From here on we draw the circuit in that form, without the target wire. ' +
      `After the query each of the eight strings has size $${d(V.q16DjBar, 4)}$ and sign $(-1)^{f(x)}$. For our $f$, four signs are minus and four are plus.`,
    formal:
      'Kickback (Eq. 7.4, with the target’s $1/\\sqrt2$ kept) turns the f-CNOT into the phase oracle: $|\\psi_2\\rangle = 2^{-n/2}\\sum_x(-1)^{f(x)}|x\\rangle$ is the state after the query (Eq. 7.5). ' +
      'This balanced $f$ has four minus signs among the eight, so the mean amplitude is 0.',
    caption: `after the query: the bars of $001$, $010$, $011$ and $100$ point down, the other four point up, all of size $${d(V.q16DjBar, 4)}$; the dashed mean line is at 0`,
    captionFormal: `$|\\psi_2\\rangle$ for a balanced $f$: amplitudes $(-1)^{f(x)}$ of size $${d(V.q16DjBar, 4)}$, mean 0`,
    stage: split(circ(C_DJ(F_BALN), 2), amp(C_DJ(F_BALN), 2, 'signed')),
    claims: [
      claim('q16DjBar', 'after the query each of the eight bars has size $0.3536$', () => close(V.q16DjBar, 1 / Math.sqrt(8), 1e-9)),
      claim('q16DjMean', 'with four plus and four minus bars the mean amplitude is 0', () => close(V.q16DjMean, 0, 1e-9)),
    ],
  },
  {
    id: 'q16-dj:b3',
    phase: 'books',
    text:
      'The last Hadamards turn the $|000\\rangle$ amplitude into the average of the eight signs. For a balanced $f$ they cancel and the amplitude is 0. ' +
      'For a constant $f$ they all agree, so the amplitude is $+1$ or $-1$. One reading therefore decides, for certain: all zeros means constant, anything else means balanced.',
    formal:
      '$\\langle 0|\\psi_{\\text{out}}\\rangle = 2^{-n}\\sum_x(-1)^{f(x)}$ (Eq. 7.7), where $|\\psi_{\\text{out}}\\rangle$ is the state after the last column. It is 0 if $f$ is balanced and $(-1)^{f(0)}$ if $f$ is constant, so $-1$ for $f \\equiv 1$. ' +
      'Reading all zeros means constant, any other string means balanced: one query.',
    caption: `a balanced $f$ after the last Hadamards: the chance $${d(V.q16DjBalnP, 2)}$ sits on each of $100$, $101$, $110$, $111$ and none on $000$`,
    captionFormal: `$|\\psi_{\\text{out}}\\rangle$ for a balanced $f$: chance $${d(V.q16DjBalnP, 2)}$ on each of four strings, and amplitude 0 on $000$`,
    stage: split(circ(C_DJ(F_BALN), 3), amp(C_DJ(F_BALN), 3, 'probability')),
    claims: [
      claim('q16DjBalnZero', 'a balanced $f$ gives $000$ chance 0', () => close(V.q16DjBalnZero, 0, 1e-9)),
      claim('q16DjBalnP', 'each of $100$–$111$ has chance $0.25$', () => close(V.q16DjBalnP, 0.25, 1e-9)),
      claim('q16DjConstAmp', 'for $f \\equiv 1$ the $|000\\rangle$ amplitude is $-1$', () => close(V.q16DjConstAmp, -1, 1e-9)),
    ],
    derivation: {
      result: '\\langle0|\\psi_{\\text{out}}\\rangle = 2^{-n}\\sum_x(-1)^{f(x)}',
      ground: [
        {
          tex: '|\\psi_1\\rangle = 2^{-n/2}\\sum_x|x\\rangle',
          why: 'The first column of Hadamards turns the all-zeros string into the even mix of all strings: every bar has the same size and sign.',
          view: amp(C_DJ(F_BALN), 1, 'signed'),
          viewCaption: 'the even mix: eight equal bars',
        },
        {
          tex: '|\\psi_2\\rangle = 2^{-n/2}\\sum_x(-1)^{f(x)}|x\\rangle',
          why: 'The query puts the sign $(-1)^{f(x)}$ on each string and changes no size.',
          view: amp(C_DJ(F_BALN), 2, 'signed'),
          viewCaption: 'after the query: signs from $f$',
        },
        {
          tex: '\\langle0|H^{\\otimes n} = 2^{-n/2}\\sum_x\\langle x|',
          why: 'Every entry in the all-zeros row of the Walsh–Hadamard matrix is the same, $+2^{-n/2}$. So the last column adds up all the amplitudes and scales the sum.',
        },
        {
          tex: '\\langle0|\\psi_{\\text{out}}\\rangle = 2^{-n/2}\\sum_x\\langle x|\\psi_2\\rangle',
          why: `A constant $f \\equiv 1$ has eight bars of $-${d(V.q16DjBar, 4)}$; their sum times $${d(V.q16DjBar, 4)}$ is $-1$.`,
          view: amp(C_DJ(F_ONE), 2, 'signed'),
          viewCaption: 'a constant $f \\equiv 1$: all eight bars are down',
          claims: [claim('q16DjOneMean', 'for $f \\equiv 1$ the mean bar after the query is $-0.3536$', () => close(V.q16DjOneMean, -1 / Math.sqrt(8), 1e-9))],
        },
        {
          tex: '\\langle0|\\psi_{\\text{out}}\\rangle = 2^{-n}\\sum_x(-1)^{f(x)}',
          why: 'Put in the amplitudes $2^{-n/2}(-1)^{f(x)}$. The sum counts plus signs minus minus signs: a balanced $f$ has equally many, so it gives 0, and a constant $f$ gives $\\pm1$.',
          view: amp(C_DJ(F_BALN), 3, 'probability'),
          viewCaption: 'a balanced $f$: nothing lands on $000$',
        },
      ],
      formal: [
        {
          tex: '|\\psi_2\\rangle = 2^{-n/2}\\sum_x(-1)^{f(x)}|x\\rangle',
          why: 'Eq. 7.5: the state after the query, from the uniform state of Eq. 7.3.',
          view: amp(C_DJ(F_BALN), 2, 'signed'),
        },
        {
          tex: '\\langle0|H^{\\otimes n} = 2^{-n/2}\\sum_x\\langle x|',
          why: 'The row of $H^{\\otimes n}$ for the all-zeros string has every entry $2^{-n/2}$; for $f \\equiv 1$ the bars of $|\\psi_2\\rangle$ all read $-2^{-n/2}$.',
          view: amp(C_DJ(F_ONE), 2, 'signed'),
        },
        {
          tex: '\\langle0|\\psi_{\\text{out}}\\rangle = 2^{-n}\\sum_x(-1)^{f(x)}',
          why: 'Contract the row with $|\\psi_2\\rangle$ (Eq. 7.7): 0 when $f$ is balanced, and $(-1)^{f(0)}$ when $f$ is constant.',
          view: amp(C_DJ(F_BALN), 3, 'probability'),
        },
      ],
    },
  },
  {
    id: 'q16-dj:b4',
    phase: 'clue',
    text: 'Take $f(x) = x\\cdot 101$, which is also balanced. Where does the output land now?',
    formal: 'For the linear balanced $f(x) = x\\cdot 101$, what is $|\\psi_{\\text{out}}\\rangle$?',
    stage: circ(C_DJ(F_BAL), 3),
    reveal: {
      text: 'On $|101\\rangle$, with chance 1. The signs after the query are exactly those of $H^{\\otimes 3}|101\\rangle$, and the last Hadamards undo them (Unit 16.1). Unit 16.4 turns this into a method.',
      formal:
        '$(-1)^{x\\cdot 101}$ is the sign pattern of $H^{\\otimes 3}|101\\rangle$, so $|\\psi_{\\text{out}}\\rangle = |101\\rangle$ (Unit 16.1). Deutsch–Jozsa reads a linear $f$’s coefficient string exactly: that is Bernstein–Vazirani.',
      caption: '$f(x) = x\\cdot 101$: all the chance, 100 %, sits on $|101\\rangle$',
      captionFormal: '$f(x) = x\\cdot 101$: $|\\psi_{\\text{out}}\\rangle = |101\\rangle$, chance 1',
      stage: split(circ(C_DJ(F_BAL), 3), amp(C_DJ(F_BAL), 3, 'probability')),
      claims: [claim('q16DjBalLands', 'for $f(x) = x\\cdot 101$ the output $|101\\rangle$ has chance 1', () => close(V.q16DjBalLands, 1, 1e-9))],
    },
  },
]

/* ---------------------------------------------------------------------------------------------- */
/* q16-classical-cost — What one quantum query beats                                                 */
/* ---------------------------------------------------------------------------------------------- */

const cost: Beat[] = [
  {
    id: 'q16-classical-cost:b1',
    phase: 'books',
    text:
      'A classical query puts in one string and reads one bit. The [[qc-query-cost|query cost]] is how many queries are needed, in the worst case. ' +
      'Suppose you must always be right. A balanced $f$ may answer 0 to the first four inputs you try, just as the always-0 function would. So four queries prove nothing. ' +
      `A fifth settles it. In general $2^{n-1} + 1$ queries are needed: $${V.q16DetWorst3}$ for $n = 3$.`,
    formal:
      'Deterministically, an adversary may answer the first $2^{n-1}$ distinct queries alike, and a constant and a balanced $f$ both still fit. So $2^{n-1} + 1$ queries are needed and enough (Bergou p. 117; N&C p. 35 writes $2^n/2 + 1$). ' +
      `For $n = 3$ that is $${V.q16DetWorst3}$, and an exact minimax over all strategies gives $${V.q16MinimaxN3}$ too; for $n = 10$ it is $${V.q16DetWorst10}$.`,
    caption: 'one classical query on three input wires: the string $011$ goes in, and after the box the target reads $1$, which is $f(011)$',
    captionFormal: 'one query of $U_f$ on $|011\\rangle|0\\rangle$: the target reads $f(011) = 1$ and the inputs are unchanged',
    stage: split(circ(C_CLQ(0b011), 1), amp(C_CLQ(0b011), 1, 'probability')),
    claims: [
      claim('q16ClqBit', 'the query of $011$ returns $f(011) = 1$', () => close(V.q16ClqBit, 1, 1e-9)),
      claim('q16DetWorst3', 'five queries are needed for $n = 3$', () => close(V.q16DetWorst3, 5, 1e-9)),
      claim('q16MinimaxN3', 'an exact minimax over all strategies also gives five for $n = 3$', () => close(V.q16MinimaxN3, 5, 1e-9)),
      claim('q16DetWorst10', '$2^9 + 1 = 513$ queries are needed for $n = 10$', () => close(V.q16DetWorst10, 513, 1e-9)),
    ],
    derivation: {
      result: '2^{n-1} + 1',
      ground: [
        {
          tex: 'f(011) = 1',
          why: 'One query reads one value: the string $011$ goes in and the bit $f(011)$ comes out on the target.',
          view: circ(C_CLQ(0b011), 1),
          viewCaption: 'one query: input $011$, answer $1$',
        },
        {
          tex: '\\tfrac{N}{2} = 2^{n-1} = 4',
          why: 'A balanced $f$ can give the same answer to the first $N/2 = 4$ inputs you try, and so can a constant one. Four equal answers prove nothing.',
          view: amp(C_CLQ(0b011), 1, 'probability'),
          viewCaption: 'a query touches one input; the chance sits on one string',
        },
        {
          tex: '\\tfrac{N}{2} + 1 = 2^{n-1} + 1',
          why: 'One more query settles it. A different answer rules out a constant $f$. The same answer rules out a balanced one, which would then have too many zeros.',
          view: amp(C_CLQ(0b110), 1, 'probability'),
          viewCaption: 'another query: input $110$, answer $0$',
        },
      ],
      formal: [
        {
          tex: '\\text{answer } 0 \\text{ to the first } 2^{n-1} \\text{ distinct queries}',
          why: 'An adversary can do this and stay consistent with both the constant $f \\equiv 0$ and a balanced $f$ whose ones lie on the other $2^{n-1}$ strings.',
          view: circ(C_CLQ(0b011), 1),
        },
        {
          tex: '\\tfrac{N}{2} + 1 = 2^{n-1} + 1',
          why: 'The next answer rules one of them out. So $2^{n-1} + 1$ queries always suffice and no fewer do; an exact minimax over every strategy confirms it for $n \\le 3$.',
          view: amp(C_CLQ(0b110), 1, 'probability'),
        },
      ],
    },
  },
  {
    id: 'q16-classical-cost:b2',
    phase: 'books',
    text:
      'Query random inputs instead, and say “constant” if all the answers agree. A constant $f$ always passes. ' +
      `A balanced $f$ passes by luck with chance only $${d(V.q16Miss8k3, 4)}$ when there are $n = 3$ and three different queries. With $n = 10$ and ten different queries the luck chance is $${d(V.q16Miss1024k10, 4)}$.`,
    formal:
      'Allow a [[qc-bounded-error|bounded error]]. With $k$ distinct random queries, a balanced $f$ looks constant with probability $2\\binom{N/2}{k}/\\binom{N}{k}$, about $2^{1-k}$ (N&C p. 35): ' +
      `$${d(V.q16Miss8k3, 4)}$ for $N = 8$, $k = 3$ and $${d(V.q16Miss1024k10, 4)}$ for $N = 1024$, $k = 10$. The chance depends on $k$, and hardly on $n$.`,
    caption: 'another classical query: the string $110$ goes in, and the target reads $0$, which is $f(110)$',
    captionFormal: 'one query of $U_f$ on $|110\\rangle|0\\rangle$: the target reads $f(110) = 0$',
    stage: split(circ(C_CLQ(0b110), 1), amp(C_CLQ(0b110), 1, 'probability')),
    claims: [
      claim('q16Miss8k3', 'three random distinct queries on a balanced $f$ with $N = 8$ all agree with chance $0.1429$', () => close(V.q16Miss8k3, 1 / 7, 1e-9)),
      claim('q16Miss1024k10', 'ten random distinct queries with $N = 1024$ all agree with chance $0.0019$', () => close(V.q16Miss1024k10, 0.0018683827034757863, 1e-9)),
      claim('q16ClqBit110', 'the query of $110$ returns $f(110) = 0$', () => close(V.q16ClqBit110, 0, 1e-9)),
    ],
  },
  {
    id: 'q16-classical-cost:b3',
    phase: 'clue',
    text: `One quantum query against $${V.q16DetWorst10}$ classical ones for $n = 10$. Is that an exponential speed-up in practice?`,
    formal: 'Against which classical model is Deutsch–Jozsa’s advantage exponential in $n$, and against which is it constant?',
    stage: circ(C_DJA(F_BALN), 3),
    reveal: {
      text:
        `Only against a classical computer that must never err. Allow a tiny error and about ten random queries do, for any $n$: the luck chance was $${d(V.q16Miss1024k10, 4)}$. ` +
        'The real gift of Deutsch–Jozsa is certainty.',
      formal:
        `Exact (zero-error) query cost: 1 versus $2^{n-1}+1 = ${V.q16DetWorst10}$ at $n = 10$. Bounded-error cost: $O(1)$ queries classically too ($${d(V.q16Miss1024k10, 4)}$ at $k = 10$). The separation holds for exact algorithms in the query model.`,
      caption: 'the quantum answer after one query: no chance on $000$, so $f$ is balanced for certain',
      captionFormal: 'one quantum query: amplitude 0 on $000$ certifies a balanced $f$ with no error',
      stage: split(circ(C_DJ(F_BALN), 3), amp(C_DJ(F_BALN), 3, 'probability')),
      claims: [
        claim('q16DetWorst10', 'exact classical cost for $n = 10$ is 513 queries', () => close(V.q16DetWorst10, 513, 1e-9)),
        claim('q16Miss1024k10', 'ten random queries with $N = 1024$ are fooled with chance $0.0019$', () => close(V.q16Miss1024k10, 0.0018683827034757863, 1e-9)),
      ],
    },
  },
]

/* ---------------------------------------------------------------------------------------------- */
/* q16-bv — A hidden string in one query                                                             */
/* ---------------------------------------------------------------------------------------------- */

const bv: Beat[] = [
  {
    id: 'q16-bv:b1',
    phase: 'books',
    text:
      'Now $f(x) = a\\cdot x \\oplus b$, with a [[qc-hidden-string|hidden string]] $a$ and a hidden bit $b$. Here $a\\cdot x$ is the bit dot product of Unit 16.1, and $\\oplus$ is the XOR of Chapter Q4. ' +
      `Classically, query $0000$ to learn $b$, then each string with a single 1 to learn one bit of $a$: ${V.q16BvClassical} queries for $n = 4$.`,
    formal:
      '[[qc-bernstein-vazirani|Bernstein–Vazirani]]: $f(x) = a\\cdot x \\oplus b$ with $a \\in \\{0,1\\}^n$ and $b \\in \\{0,1\\}$ (Bergou §7.2, Eq. 7.8, p. 119). ' +
      `Each classical query yields one bit and $a$ has $n$ bits, so at least $n$ queries are needed; Bergou’s method (p. 120) uses $n + 1 = ${V.q16BvClassical}$ for $n = 4$.`,
    caption: 'a classical query of $1000$ for $a = 1011$, $b = 1$: the target reads $f(1000) = 1 \\oplus 1 = 0$',
    captionFormal: 'one query of $U_f$ on $|1000\\rangle|0\\rangle$ with $a = 1011$, $b = 1$: the target reads $(a\\cdot 1000)\\oplus b = 0$',
    stage: split(circ(C_BVQ(0b1000), 1), amp(C_BVQ(0b1000), 1, 'probability')),
    claims: [
      claim('q16BvClassical', 'Bergou’s classical method asks 5 queries for $n = 4$', () => close(V.q16BvClassical, 5, 1e-9)),
      claim('q16BvQ1000', 'the query of $1000$ returns $f(1000) = 0$', () => close(V.q16BvQ1000, 0, 1e-9)),
    ],
  },
  {
    id: 'q16-bv:b2',
    phase: 'books',
    text:
      'Run the same circuit as in Unit 16.2. The output is the string $a$ itself: $|1011\\rangle$, with amplitude $-1$. All four bits of $a$ come out of one query.',
    formal:
      'The Deutsch–Jozsa circuit gives $|\\text{out}\\rangle = 2^{-n}\\sum_{x,y}(-1)^{(a\\cdot x)\\oplus b}(-1)^{x\\cdot y}|y\\rangle = (-1)^b|a\\rangle$ (Bergou Eq. 7.9 and Eq. 7.12). ' +
      'The Walsh sum keeps only $y = a$. Bergou writes the bitwise sum $a + y$; here it is $a \\oplus y$.',
    caption: `one bar: amplitude ${minus(V.q16BvAmp, 0)} on $|1011\\rangle$ after the last Hadamards, and nothing on the other fifteen strings`,
    captionFormal: `$|\\text{out}\\rangle = (-1)^b|a\\rangle$ for $a = 1011$, $b = 1$: amplitude ${minus(V.q16BvAmp, 0)} on $1011$`,
    stage: split(circ(C_BV, 3), amp(C_BV, 3, 'signed')),
    claims: [
      claim('q16BvAmp', 'for $a = 1011$, $b = 1$ the output amplitude on $|1011\\rangle$ is $-1$', () => close(V.q16BvAmp, -1, 1e-9)),
      claim('q16BvP', 'the chance of $1011$ is 1', () => close(V.q16BvP, 1, 1e-9)),
    ],
    derivation: {
      result: '|\\text{out}\\rangle = (-1)^b|a\\rangle',
      ground: [
        {
          tex: '(-1)^{(a\\cdot x)\\oplus b} = (-1)^b\\,(-1)^{a\\cdot x}',
          why: 'A sign to the power of a sum is a product of signs. So the constant $b$ splits off as one sign $(-1)^b$ in front of everything.',
          view: amp(C_BV, 2, 'signed'),
          viewCaption: 'after the query: sixteen bars, signs from $f$',
        },
        {
          tex: '|\\psi_2\\rangle = (-1)^b\\,2^{-n/2}\\sum_x(-1)^{a\\cdot x}|x\\rangle = (-1)^b\\,H^{\\otimes n}|a\\rangle',
          why: 'The sum over $x$ is the Hadamard column of Unit 16.1 for the string $a$: these are the signs of $H^{\\otimes 4}|1011\\rangle$, times $(-1)^b$.',
          view: circ(C_BV, 2),
          viewCaption: 'the circuit up to the query',
        },
        {
          tex: 'H^{\\otimes n}\\big((-1)^bH^{\\otimes n}|a\\rangle\\big) = (-1)^b|a\\rangle',
          why: 'The last column of Hadamards undoes the first, because two columns return the starting string (Unit 16.1).',
          view: amp(C_BV, 3, 'signed'),
          viewCaption: 'after the last Hadamards: one bar',
        },
        {
          tex: '|\\text{out}\\rangle = (-1)^b|a\\rangle',
          why: 'All the chance is on the string $a$. For $a = 1011$ and $b = 1$ its amplitude is $-1$.',
        },
      ],
      formal: [
        {
          tex: '|\\text{out}\\rangle = 2^{-n}\\sum_{x,y}(-1)^{(a\\cdot x)\\oplus b}(-1)^{x\\cdot y}|y\\rangle',
          why: 'The last column sends $|x\\rangle$ to $2^{-n/2}\\sum_y(-1)^{x\\cdot y}|y\\rangle$ (Eq. 7.9), and $|\\psi_2\\rangle$ carries the signs $(-1)^{(a\\cdot x)\\oplus b}$.',
          view: amp(C_BV, 2, 'signed'),
        },
        {
          tex: '= (-1)^b\\,2^{-n}\\sum_y\\Big[\\sum_x(-1)^{x\\cdot(a\\oplus y)}\\Big]|y\\rangle',
          why: 'Combine the signs with $(-1)^{a\\cdot x}(-1)^{x\\cdot y} = (-1)^{x\\cdot(a\\oplus y)}$. The bracket is the Walsh sum of Eq. 7.10, equal to $2^n\\delta_{y,a}$.',
          view: amp(C_BV, 3, 'signed'),
        },
        {
          tex: '|\\text{out}\\rangle = (-1)^b|a\\rangle',
          why: 'Only $y = a$ survives (Eq. 7.12).',
          view: circ(C_BV, 3),
        },
      ],
    },
  },
  {
    id: 'q16-bv:b3',
    phase: 'books',
    text:
      'After the query the sixteen signs are those of $H^{\\otimes 4}|1011\\rangle$, times one [[global-phase|overall sign]] $(-1)^b$. The last Hadamards undo the first ones. ' +
      'An overall sign changes no chance, so $b$ stays hidden.',
    formal:
      `$|\\psi_2\\rangle = (-1)^b H^{\\otimes 4}|a\\rangle$: sixteen bars of size $${d(V.q16BvPreAmp, 2)}$, mean 0. Since $(H^{\\otimes n})^2 = I$, the last column returns $(-1)^b|a\\rangle$. ` +
      'A [[global-phase|global phase]] cannot be observed, so Bernstein–Vazirani learns $a$ and nothing about $b$.',
    caption: `before the last Hadamards: sixteen bars of size $${d(V.q16BvPreAmp, 2)}$, eight up and eight down, mean 0`,
    captionFormal: `$|\\psi_2\\rangle = (-1)^bH^{\\otimes 4}|1011\\rangle$: sixteen amplitudes of size $${d(V.q16BvPreAmp, 2)}$`,
    stage: split(circ(C_BV, 2), amp(C_BV, 2, 'signed')),
    claims: [claim('q16BvPreAmp', 'before the last Hadamards all sixteen bars have size $0.25$', () => close(V.q16BvPreAmp, 0.25, 1e-9))],
  },
  {
    id: 'q16-bv:b4',
    phase: 'clue',
    text: 'Every $f = a\\cdot x \\oplus b$ with $a \\neq 0$ is balanced. What does the Deutsch–Jozsa verdict “not all zeros” tell you about it?',
    formal: 'For functions $f = a\\cdot x \\oplus b$, relate the Deutsch–Jozsa verdict to the output string.',
    stage: amp(C_BV, 3, 'probability'),
    reveal: {
      text:
        'The output is $a$, so all zeros means $a = 0$, and then $f$ is the constant $b$. Anything else means $a \\neq 0$, and $f$ is balanced. Deutsch–Jozsa only asks whether the hidden string is zero.',
      formal:
        'On these functions the Deutsch–Jozsa output is $|a\\rangle$: $f$ is constant exactly when $a = 0$ (checked here for all 32 pairs $(a, b)$ with $n = 4$). Deutsch–Jozsa reads one bit of the information that Bernstein–Vazirani reads in full.',
      caption: 'the linear $f$ of Unit 16.2: all the chance on its string $101$',
      captionFormal: '$f = x\\cdot 101$: output $|101\\rangle$ with $a = 101 \\neq 0$, so $f$ is balanced',
      stage: split(circ(C_DJ(F_BAL), 3), amp(C_DJ(F_BAL), 3, 'probability')),
      claims: [claim('q16BalIffA', 'for all 32 pairs $(a, b)$ with $n = 4$, $f$ is balanced exactly when $a \\neq 0$', () => close(V.q16BalIffA, 1, 1e-9))],
    },
  },
]

export const Q16_STORY: Record<string, Beat[]> = {
  'q16-hadamard-n': hadamardN,
  'q16-dj': dj,
  'q16-classical-cost': cost,
  'q16-bv': bv,
}

/** Every claim used anywhere in a unit's beats, for Unit.claims (content.test.tsx "claims hold"). */
function allClaims(beats: Beat[]) {
  return beats.flatMap((b) => [...(b.claims ?? []), ...(b.reveal?.claims ?? []), ...(b.derivation?.ground.flatMap((s) => s.claims ?? []) ?? []), ...(b.derivation?.formal?.flatMap((s) => s.claims ?? []) ?? [])])
}
export const Q16_UNIT_CLAIMS_BY_ID: Record<string, ReturnType<typeof allClaims>> = Object.fromEntries(Object.entries(Q16_STORY).map(([id, beats]) => [id, allClaims(beats)]))
