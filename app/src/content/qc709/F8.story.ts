/**
 * Chapter F8 scroll story (Physics 709; roles P + W), both tracks over one stage. Beats per docs/roles/proposals/P-F8-story.md §1–§2, with the
 * judge's rulings (docs/roles/decisions/qc709-F7F8.md, qc709-foundations.md). F8 is the ground-up owner of clock arithmetic and periods, gcd, inverses
 * and the order, the roots of unity and their sums, the discrete Fourier transform (a matrix, combs to spikes, a shift to a phase), geometric sums and
 * the 2/π bound, and binary and continued fractions. The Q chapters keep their inline teaching; Chapter Q18 (the quantum Fourier transform and Shor's
 * algorithm) reuses all of it and links here.
 *
 * Rules kept here: an F chapter has no lecture notes, so its own line is phase 'core', then 'books', then the clue. `text` is the Ground-up track
 * (sentences ≤ 25 words), `formal` the Formal track (≤ 40). Every number in the prose comes from F8.values.ts through a keyed claim. No TeX command
 * outside `$…$`. The number reader takes digits on either side of a point for a decimal, so a BINARY fraction is written `0{.}101_2`; and it takes
 * `\tfrac{1}{2M}` for ½, so a fraction with a letter in its denominator is written `1/(2M)`.
 *
 * Build notes against the plan (reported to the orchestrator):
 * - Nothing here draws two views of one kind in a `split` (a layout never repeats a kind, validated): the plan's `split(mx / mx)` (F†F beside F) and
 *   `split(amp / amp)` (a comb beside its transform) are each ONE picture per beat, the other half being the previous beat or the derivation's first step;
 *   fractions:b4 pairs the bars with the arrows (`amplitudes` beside `complex-plane`), which are two different kinds.
 * - The roots mode of the Try-it widget is built (`complex-plane` {mode: 'roots', N, j}); the clock, euclid, roots and dft units use it.
 * - Page citations: N&C Appendix 4 theorems are cited by printed page in the prose (the number reader would take "Thm A4.5" for a decimal); the
 *   theorem numbers are in each unit's `books` list. The plan's "Unit F8.k" mentions are words ("the roots unit"), and its "Unit F7.3" is a bridge chip.
 * - The Foundations units in this course are bridge chips `<<id|Unit F1.4>>`, never a bare unit number; chapters Q8 and Q18 are named in words.
 */
import type { AmplitudesState, Beat, ComplexPlaneState, MatrixGridState, MatrixSource, PlotState, StageLayout, StageState } from '../schema'
import { COMB32, COMB3_8, LISTS, V, claim, close } from './F8.values'

/* ---------------------------------------------------------------------------------------------- */
/* Stage shorthand (plan "Stage shorthand"), as plain builder functions                              */
/* ---------------------------------------------------------------------------------------------- */
const cp = (s: Omit<ComplexPlaneState, 'kind' | 'shot'>): ComplexPlaneState => ({ kind: 'complex-plane', shot: 'C-FLAT', ...s })
/** CLOCK(N): the face of a clock of N marks, 360°/N apart (numbered 0 … N − 1 up to N = 12; a bigger one numbers the marks its arrows point at). */
const CLOCK = (N: number): Pick<ComplexPlaneState, 'clock'> => ({ clock: N })
/** SPK(vals, N): one arrow from the centre to each of the marks `vals` on an N-mark clock. */
const SPK = (vals: readonly number[], N: number): Pick<ComplexPlaneState, 'spokes'> => ({ spokes: { phasesDeg: vals.map((v) => (360 * v) / N) } })
/** CHAIN(N, j, M): the arrows ω^{jt} for t < M (M = N by default), laid tip to tail. */
const CHAIN = (N: number, j: number, M = N): Pick<ComplexPlaneState, 'chain'> => ({ chain: { phasesDeg: Array.from({ length: M }, (_, t) => (360 * ((j * t) % N)) / N) } })
/** Eight arrows of total length 1, each turned 22.5° (δ = 1/16 of a turn) more than the last. */
const EIGHT_ARROWS = (): Pick<ComplexPlaneState, 'chain'> => ({ chain: { phasesDeg: Array.from({ length: 8 }, (_, t) => 22.5 * t), sizes: Array.from({ length: 8 }, () => 1 / 8) } })
const amp = (state: AmplitudesState['state'], extra: Partial<Omit<AmplitudesState, 'kind' | 'state'>> = {}): AmplitudesState => ({ kind: 'amplitudes', state, labels: 'index', shot: 'A-BARS', ...extra })
/** The step-6 comb on 32 places: its list, and its transform read as chances. */
const COMB_LIST = (): AmplitudesState => amp({ terms: COMB32 }, { mode: 'probability' })
const COMB_FOURIER = (): AmplitudesState => amp({ terms: COMB32 }, { dft: true, mode: 'probability' })
const mx = (source: MatrixSource, extra: Partial<Omit<MatrixGridState, 'kind' | 'source'>> = {}): MatrixGridState => ({ kind: 'matrix', source, shot: 'M-GRID', ...extra })
const plot = (fn: PlotState['curve']['fn'], x: { from: number; to: number }, extra: Partial<Omit<PlotState, 'kind' | 'curve'>> = {}): PlotState => ({
  kind: 'plot',
  curve: { fn, x, samples: 64 },
  shot: 'P-CURVE',
  ...extra,
})
const split = (top: StageState, bottom: StageState): StageLayout => ({ layout: 'split', top, bottom })
/** The dashed 2/π line of the kernel's plots. */
const TWO_OVER_PI = [{ y: 2 / Math.PI, label: '2/π' }]

/** The five stops 1, ω, ω², ω³, ω⁴ of the roots unit, and the eight of its second picture. */
const FIVE = [0, 1, 2, 3, 4]
const EIGHT = [0, 1, 2, 3, 4, 5, 6, 7]
const P2_SIX = LISTS.P2.slice(0, 6)
/** The four arrows of the first geometric sum: lengths 1, 0.5, 0.25, 0.125 (each half the last). */
const GEOM_SIZES = [1, 0.5, 0.25, 0.125]

/* ---------------------------------------------------------------------------------------------- */
/* f8-clock — Clock arithmetic and repeating patterns                                                 */
/* ---------------------------------------------------------------------------------------------- */

const clock: Beat[] = [
  {
    id: 'f8-clock:b1',
    phase: 'core',
    introduces: ['qc-congruence'],
    text:
      'On a 12-hour clock, 9 o’clock plus 5 hours is 2 o’clock. That is arithmetic mod 12: keep the remainder after dividing by 12. ' +
      'We write $14 \\equiv 2 \\pmod{12}$, a [[qc-congruence|congruence]].',
    formal:
      '$a \\equiv b \\pmod N$ means that $N$ divides $a - b$, and $a \\bmod N$ is the remainder of $a$, one of $0, \\ldots, N-1$ (N&C Appendix 4, p. 626). ' +
      'Sums and products pass to remainders, so $\\mathbf Z_N = \\{0, \\ldots, N-1\\}$ is a clock. XOR is the case $N = 2$ (<<qc-f7-xor|Unit F7.3>>).',
    caption: 'a clock face of 12 marks, numbered 0 to 11; the arrow for $9 + 5$ points at mark 2',
    captionFormal: '$\\mathbf Z_{12}$ as 12 marks, $30°$ apart; the arrow marks $14 \\bmod 12 = 2$, at $60°$',
    stage: cp({ ...CLOCK(12), ...SPK([2], 12) }),
    claims: [
      claim('f8Clock9p5', '9 o’clock plus 5 hours is 2 o’clock: (9 + 5) mod 12 = 2', () => V.f8Clock9p5 === 2),
      claim('f8Clock14', '14 ≡ 2 (mod 12): 12 divides 14 − 2', () => V.f8Clock14 === 2 && (14 - 2) % 12 === 0),
    ],
  },
  {
    id: 'f8-clock:b2',
    phase: 'core',
    introduces: ['qc-period'],
    text:
      'A list $f(x)$ has [[qc-period|period]] $r$ if every value comes back $r$ steps later: $f(x + r) = f(x)$. ' +
      'The powers of 2, kept mod 21, run 1, 2, 4, 8, 16, 11, then 1 again: period 6.',
    formal:
      '$f$ has period $r$ if $f(x + r) = f(x)$ for every whole $x$, with $r > 0$ the least such number. ' +
      '$f(x) = 2^x \\bmod 21$ runs $1, 2, 4, 8, 16, 11, 1, \\ldots$, so $r = 6$; N&C (p. 633) calls this number the order of 2 mod 21.',
    caption: 'a clock of 21 marks with arrows to 1, 2, 4, 8, 16 and 11, the values of $2^x \\bmod 21$; the next value is 1 again',
    captionFormal: '$f(x) = 2^x \\bmod 21$: arrows at the marks $1, 2, 4, 8, 16, 11$ of 21, then back to 1; $r = 6$',
    stage: cp({ ...CLOCK(21), ...SPK(P2_SIX, 21) }),
    claims: [
      claim('f8Pow2Sum6', '2⁰ … 2⁵ mod 21 are 1, 2, 4, 8, 16, 11', () => LISTS.P2.slice(0, 6).join() === '1,2,4,8,16,11' && V.f8Pow2Sum6 === 42),
      claim('f8Pow2Back', 'the next value, 2⁶ mod 21, is 1 again', () => V.f8Pow2Back === 1 && LISTS.P2[6] === LISTS.P2[0]),
      claim('f8Period2Pow', 'the list 2^x mod 21 repeats with period 6: it equals itself shifted by 6, and by no smaller step', () => V.f8Period2Pow === 6),
    ],
  },
  {
    id: 'f8-clock:b3',
    phase: 'core',
    text:
      'Mark the inputs from 0 to 31 where $2^x \\bmod 21 = 1$: 0, 6, 12, 18, 24 and 30. They are evenly spaced, 6 apart. ' +
      'This chapter turns such a spacing into a reading.',
    formal:
      'The places $x < 32$ with $2^x \\equiv 1 \\pmod{21}$ form the comb $\\{0, 6, 12, 18, 24, 30\\}$ of step $r = 6$. ' +
      'A quantum computer can prepare such a comb as a state (Chapter Q18); the units that follow read $r$ off it.',
    caption: '32 inputs, numbered 0 to 31, with six equal bars 6 apart; each bar is a chance of $\\tfrac16$',
    captionFormal: 'the comb of step $r = 6$ on 32 places: six bars, each of chance $\\tfrac16$',
    stage: COMB_LIST(),
    claims: [
      claim('f8Comb32Sum', 'the places x < 32 with 2^x ≡ 1 (mod 21) are 0, 6, 12, 18, 24, 30, and the stage’s six bars are those places', () => LISTS.PLACES32.join() === '0,6,12,18,24,30' && LISTS.COMB32_PLACES.join() === LISTS.PLACES32.join() && V.f8Comb32Sum === 90),
      claim('f8Comb32Count', 'there are six of them', () => V.f8Comb32Count === 6),
      claim('f8Comb32Step', 'they are 6 apart', () => V.f8Comb32Step === 6 && LISTS.PLACES32.every((x, i) => i === 0 || x - LISTS.PLACES32[i - 1] === 6)),
      claim('f8CombChance', 'each of the six bars is a chance of 1/6', () => close(V.f8CombChance, 1 / 6)),
    ],
  },
  {
    id: 'f8-clock:b4',
    phase: 'clue',
    text: 'What is $2^{100} \\bmod 21$? Must you multiply 100 times?',
    formal: 'Use the period to evaluate $2^{100} \\bmod 21$.',
    caption: 'the six values of $2^x \\bmod 21$ as arrows on the 21-mark clock',
    captionFormal: '$f(x) = 2^x \\bmod 21$: the six marks before the pattern repeats',
    stage: cp({ ...CLOCK(21), ...SPK(P2_SIX, 21) }),
    reveal: {
      text:
        'No. The pattern repeats every 6, and $100 = 16 \\times 6 + 4$, so $2^{100}$ matches $2^4 = 16$. A period lets you skip whole cycles.',
      formal:
        '$2^{100} = (2^6)^{16}\\,2^4 \\equiv 2^4 = 16$, because $2^6 \\equiv 1 \\pmod{21}$: the exponent matters only mod $r$.',
      caption: 'the arrow for $2^{100} \\bmod 21$: mark 16, the same as for $2^4$',
      captionFormal: '$2^{100} \\equiv 2^4 \\equiv 16 \\pmod{21}$: the single arrow at mark 16',
      stage: cp({ ...CLOCK(21), ...SPK([16], 21) }),
      claims: [
        claim('f8Pow2e100', '2^100 mod 21 is 16', () => V.f8Pow2e100 === 16),
        claim('f8HundredMod6', '100 leaves remainder 4 on division by 6', () => V.f8HundredMod6 === 4 && 16 * 6 + 4 === 100),
        claim('f8Pow2e4', '2^4 mod 21 is 16, the same value', () => V.f8Pow2e4 === 16 && V.f8Pow2e4 === V.f8Pow2e100),
      ],
    },
  },
]

/* ---------------------------------------------------------------------------------------------- */
/* f8-euclid — Common factors, inverses and the order                                                 */
/* ---------------------------------------------------------------------------------------------- */

const euclid: Beat[] = [
  {
    id: 'f8-euclid:b1',
    phase: 'core',
    introduces: ['qc-gcd'],
    text:
      'The [[qc-gcd|greatest common divisor]] $\\gcd(a, b)$ is the largest number dividing both. ' +
      'Euclid’s shortcut swaps the pair for the smaller number and the remainder: $\\gcd(84, 36) = \\gcd(36, 12) = 12$. ' +
      'The gcd also reduces fractions: divide the top and bottom of $84/36$ by 12 and you get $7/3$.',
    formal:
      '$\\gcd(a, b) = \\gcd(b, a \\bmod b)$ (N&C Appendix 4, p. 628); repeat until the remainder is 0, which is Euclid’s algorithm. ' +
      'Here $84 = 2 \\cdot 36 + 12$ and $36 = 3 \\cdot 12$, so $\\gcd = 12 = 1 \\cdot 84 - 2 \\cdot 36$, the least positive value of $ax + by$ (N&C p. 626). ' +
      'Dividing by the gcd puts a fraction in lowest terms: $84/36 = 7/3$.',
    caption: '84 on a clock of 36 marks lands on mark 12: the arrow points at it',
    captionFormal: '$\\gcd(84, 36) = \\gcd(36, 12) = 12$: 84 wraps round 36 marks to mark 12',
    stage: cp({ ...CLOCK(36), ...SPK([12], 36) }),
    claims: [
      claim('f8Gcd8436', 'gcd(84, 36) = 12', () => V.f8Gcd8436 === 12),
      claim('f8Mod8436', '84 mod 36 = 12: 84 on a 36-mark clock lands on mark 12', () => V.f8Mod8436 === 12 && 84 - 2 * 36 === 12),
      claim('f8Ratio8436', '84/36 reduces to 7/3: dividing both by their gcd 12 leaves 7 and 3, and the value is 2.3333… either way', () => 84 / V.f8Gcd8436 === 7 && 36 / V.f8Gcd8436 === 3 && close(V.f8Ratio8436, 7 / 3)),
      claim('f8EuclidLines8436', 'Euclid’s algorithm on 84 and 36 takes two division lines: 84 = 2·36 + 12 and 36 = 3·12', () => V.f8EuclidLines8436 === 2),
      claim('f8BezoutX', '12 = 1·84 − 2·36: the coefficient of 84 is 1', () => V.f8BezoutX === 1 && 84 * V.f8BezoutX + 36 * V.f8BezoutY === 12),
      claim('f8BezoutY', '… and the coefficient of 36 is −2', () => V.f8BezoutY === -2),
    ],
    derivation: {
      result: '\\gcd(84, 36) = 12',
      ground: [
        {
          tex: '84 - 2 \\cdot 36 = 12',
          why: 'Any number that divides both 84 and 36 also divides 84 − 2 · 36, which is 12. On a clock of 36 marks, 84 lands on mark 12.',
          view: cp({ ...CLOCK(36), ...SPK([12], 36) }),
          viewCaption: '84 on 36 marks: mark 12',
        },
        {
          tex: '\\gcd(84, 36) = \\gcd(36, 12)',
          why: 'It works the other way too: whatever divides 36 and 12 divides 84 = 2 · 36 + 12. So the two pairs have the same common divisors.',
        },
        {
          tex: '36 = 3 \\cdot 12,\\quad \\gcd(84, 36) = 12',
          why: 'Now 36 = 3 · 12 exactly, with remainder 0. So 12 divides both numbers, and nothing larger divides 12.',
          view: cp({ ...CLOCK(12), ...SPK([0], 12) }),
          viewCaption: '36 on 12 marks: back at mark 0',
        },
      ],
      formal: [
        {
          tex: '\\gcd(a, b) = \\gcd(b, a \\bmod b)',
          why: 'A common divisor of $a$ and $b$ divides $a - qb = a \\bmod b$, and a common divisor of $b$ and $a \\bmod b$ divides $a = qb + (a \\bmod b)$. The two pairs share their common divisors.',
          view: cp({ ...CLOCK(36), ...SPK([12], 36) }),
        },
        {
          tex: '84 = 2 \\cdot 36 + 12,\\; 36 = 3 \\cdot 12 + 0 \\;\\Rightarrow\\; \\gcd(84, 36) = 12',
          why: 'The remainder reaches 0 after two lines, and the last divisor is the gcd. Substituting back writes it as $84 - 2 \\cdot 36$.',
          view: cp({ ...CLOCK(12), ...SPK([0], 12) }),
        },
      ],
    },
  },
  {
    id: 'f8-euclid:b2',
    phase: 'core',
    introduces: ['qc-modular-inverse'],
    text:
      'Dividing on a clock means finding an [[qc-modular-inverse|inverse]]: a number $b$ with $ab \\equiv 1$. ' +
      'Mod 21, $2 \\times 11 = 22 \\equiv 1$, so 11 undoes doubling. But 3 has no inverse, because 3 divides 21.',
    formal:
      '$a^{-1} \\bmod N$ exists exactly when $\\gcd(a, N) = 1$ (N&C Appendix 4, p. 627), and Euclid run backwards finds it. ' +
      'Mod 21, $2^{-1} \\equiv 11$ and $4^{-1} \\equiv 16$, while $\\gcd(3, 21) = 3$ leaves 3 with none. ' +
      'Mod 2 the only nonzero number is 1, its own inverse: that is the field $\\mathrm{GF}(2)$ of <<qc-f7-gf2|Unit F7.4>>.',
    caption: 'the 21-mark clock with arrows to 2 and 11, and to 1, where $2 \\times 11 = 22$ lands',
    captionFormal: '$2 \\cdot 11 = 22 \\equiv 1 \\pmod{21}$: arrows at the marks 2, 11 and 1 of 21',
    stage: cp({ ...CLOCK(21), ...SPK([2, 11, 1], 21) }),
    claims: [
      claim('f8Inv2mod21', 'the inverse of 2 mod 21 is 11', () => V.f8Inv2mod21 === 11),
      claim('f8Mul2x11', '2 × 11 = 22 leaves remainder 1 on division by 21', () => V.f8Mul2x11 === 1 && 2 * 11 === 22),
      claim('f8Inv4mod21', 'the inverse of 4 mod 21 is 16', () => V.f8Inv4mod21 === 16),
      claim('f8Mul4x16', '4 × 16 = 64 leaves remainder 1 on division by 21', () => V.f8Mul4x16 === 1 && 4 * 16 === 64),
      claim('f8Gcd321', 'gcd(3, 21) = 3', () => V.f8Gcd321 === 3),
      claim('f8Inv3Exists', '3 has no inverse mod 21', () => V.f8Inv3Exists === 0),
    ],
  },
  {
    id: 'f8-euclid:b3',
    phase: 'core',
    introduces: ['qc-multiplicative-order'],
    text:
      'On a clock of $N$ marks, multiply by $x$ again and again until you reach 1. The number of steps is the [[qc-multiplicative-order|order]] of $x$. ' +
      'Doubling mod 21 needs 6 steps: the period you met before.',
    formal:
      'For $\\gcd(x, N) = 1$ the order $r$ is the least $r > 0$ with $x^r \\equiv 1 \\pmod N$ (N&C Appendix 4, p. 633); it is the period of $a \\mapsto x^a \\bmod N$. ' +
      'It divides the count of residues that have an inverse, which is 12 for $N = 21$ (N&C p. 631): $\\mathrm{ord}(2) = \\mathrm{ord}(5) = 6$.',
    caption: 'the six powers of 2 mod 21 as arrows on the 21-mark clock; the sixth step comes back to 1, so the order is 6',
    captionFormal: '$\\mathrm{ord}_{21}(2) = 6$: arrows at the powers $2^0, 2^1, \\ldots, 2^5$',
    stage: cp({ ...CLOCK(21), ...SPK(P2_SIX, 21) }),
    claims: [
      claim('f8Order2mod21', 'the order of 2 mod 21 is 6: 2^6 ≡ 1 and no smaller power is', () => V.f8Order2mod21 === 6 && [1, 2, 3, 4, 5].every((k) => LISTS.P2[k] !== 1)),
      claim('f8Order5mod21', 'the order of 5 mod 21 is also 6', () => V.f8Order5mod21 === 6),
      claim('f8Units21', 'of the residues 1 … 21, twelve have an inverse mod 21', () => V.f8Units21 === 12),
      claim('f8OrderDividesUnits', 'the order of every residue with an inverse divides 12', () => V.f8OrderDividesUnits === 1),
    ],
  },
  {
    id: 'f8-euclid:b4',
    phase: 'books',
    text:
      'Knowing the order splits 21. The order 6 is even, so take $2^3 = 8$. ' +
      'Then $8^2 - 1 = 63 = 7 \\times 9$ is a multiple of 21, and $\\gcd(7, 21) = 7$ and $\\gcd(9, 21) = 3$ are factors of 21.',
    formal:
      'If $r$ is even and $x^{r/2} \\not\\equiv -1 \\pmod N$, then $N$ divides $(x^{r/2} - 1)(x^{r/2} + 1)$ but neither factor, so $\\gcd(x^{r/2} \\pm 1, N)$ are proper factors of $N$ (N&C Appendix 4, pp. 633–635). ' +
      'Here $2^3 = 8$ gives $21 = 7 \\times 3$. Finding $r$ fast is the task of Chapter Q18.',
    caption: 'the arrows at marks 1 and 8 of the 21-mark clock: $8 = 2^3$, and $8 \\times 8 = 64$ lands back on mark 1',
    captionFormal: 'the order 6 is even: $2^{r/2} = 2^3 = 8$ and $8^2 \\equiv 1$; arrows at the marks 1 and 8 of 21',
    stage: cp({ ...CLOCK(21), ...SPK([1, 8], 21) }),
    claims: [
      claim('f8HalfPow', '2^3 mod 21 is 8, and 8 is not 20 (that is, not −1)', () => V.f8HalfPow === 8 && V.f8HalfPow !== 21 - 1),
      claim('f8EightSqMinus1', '8² − 1 = 63 = 7 × 9', () => V.f8EightSqMinus1 === 63 && 7 * 9 === 63),
      claim('f8EightSqMinus1Mod21', '63 is a multiple of 21', () => V.f8EightSqMinus1Mod21 === 0),
      claim('f8FacA', 'gcd(7, 21) = 7', () => V.f8FacA === 7),
      claim('f8FacB', 'gcd(9, 21) = 3', () => V.f8FacB === 3),
      claim('f8FacProduct', 'the two factors from the even order 6 multiply to 21', () => V.f8FacProduct === 21),
    ],
  },
  {
    id: 'f8-euclid:b5',
    phase: 'clue',
    text: 'Keep multiplying 3 by itself mod 21. Do you ever get back to 1?',
    formal: 'Does 3 have an order mod 21?',
    caption: 'the clock of 21 marks with an arrow to 3: where do the powers of 3 go next?',
    captionFormal: '$\\mathbf Z_{21}$ with the arrow at $3^1$: where do the later powers of 3 land?',
    stage: cp({ ...CLOCK(21), ...SPK([3], 21) }),
    reveal: {
      text:
        'Never. The powers run 3, 9, 6, 18, 12, 15, then 3 again, without 1. Each is a multiple of 3, and 1 is not. Only numbers sharing no factor with 21 have an order.',
      formal:
        'No: $\\gcd(3, 21) = 3$, so $3^k \\equiv 1 \\pmod{21}$ would make 3 divide 1. The powers repeat with period 6 but never reach 1. An order exists exactly when $\\gcd(x, N) = 1$ (N&C Appendix 4, p. 633).',
      caption: 'the powers of 3 mod 21: six marks, 3, 9, 6, 18, 12 and 15, and none at 1',
      captionFormal: '$3^1, \\ldots, 3^6 \\bmod 21$: six marks, all multiples of 3, none at 1',
      stage: cp({ ...CLOCK(21), ...SPK(LISTS.P3.slice(1, 7), 21) }),
      claims: [
        claim('f8Pow3Sum6', '3¹ … 3⁶ mod 21 are 3, 9, 6, 18, 12, 15', () => LISTS.P3.slice(1, 7).join() === '3,9,6,18,12,15' && V.f8Pow3Sum6 === 63),
        claim('f8Pow3Back', '3⁷ mod 21 is 3 again', () => V.f8Pow3Back === 3 && LISTS.P3[7] === LISTS.P3[1]),
        claim('f8Pow3Hits1', 'none of 3¹ … 3⁶ is 1, and each is a multiple of 3', () => V.f8Pow3Hits1 === 0 && LISTS.P3.slice(1, 7).every((v) => v % 3 === 0)),
        claim('f8Order3Exists', '3 has no order mod 21', () => V.f8Order3Exists === 0),
      ],
    },
  },
]

/* ---------------------------------------------------------------------------------------------- */
/* f8-roots — Roots of unity: arrows that cancel                                                      */
/* ---------------------------------------------------------------------------------------------- */

const roots: Beat[] = [
  {
    id: 'f8-roots:b1',
    phase: 'core',
    introduces: ['qc-root-of-unity'],
    text:
      'Start at the arrow 1 and turn by $360°/N$ again and again (<<qc-f1-euler|Unit F1.4>>). After $N$ turns you are back at 1. ' +
      'The $N$ stops are the $N$th [[qc-root-of-unity|roots of unity]], the corners of a regular $N$-gon.',
    formal:
      '$\\omega = e^{2\\pi i/N}$ has $\\omega^N = 1$, and $\\omega^k$ for $k = 0, \\ldots, N-1$ are all $N$ roots of $z^N = 1$, the corners of a regular $N$-gon (de Moivre, Axler p. 125; a polynomial of degree $N$ has at most $N$ zeros, Axler p. 123). ' +
      'For $N = 5$, $\\omega = 0.309 + 0.951i$, and neighbouring roots are $72°$ apart. Rosetta: in Chapter Q8, ħω is an energy, not this ω.',
    caption: 'five arrows of length 1, $72°$ apart: the 5th roots of unity',
    captionFormal: '$\\omega_5 = e^{2\\pi i/5} = 0.309 + 0.951i$ and its powers $\\omega_5^k$',
    stage: cp({ ...SPK(FIVE, 5) }),
    fidelity: ['qc-cplane-arithmetic'],
    claims: [
      claim('f8Omega5Re', 'ω = e^{2πi/5} has real part 0.309', () => close(V.f8Omega5Re, 0.309, 5e-4)),
      claim('f8Omega5Im', '… and imaginary part 0.951', () => close(V.f8Omega5Im, 0.951, 5e-4)),
      claim('f8Omega5pow5Gap', 'ω to the fifth power is 1', () => close(V.f8Omega5pow5Gap, 0, 1e-12)),
      claim('f8Angle5', 'neighbouring 5th roots are 72° apart', () => close(V.f8Angle5, 72, 1e-9)),
      claim('f8Roots5AllRoots', 'every ω^k, k = 0 … 4, satisfies z^5 = 1', () => close(V.f8Roots5AllRoots, 0, 1e-12)),
      claim('f8Roots5MinGap', 'the five roots are different arrows (the closest pair is 2 sin 36° ≈ 1.18 apart)', () => V.f8Roots5MinGap > 1.17 && V.f8Roots5MinGap < 1.18),
    ],
    derivation: {
      result: 'z^N = 1',
      ground: [
        {
          tex: '\\omega \\text{ turns by } 72^\\circ',
          why: 'Start at 1 and turn by 72°, a fifth of a full turn. Call the arrow you reach ω.',
          view: cp({ ...SPK([0, 1], 5) }),
          viewCaption: 'the arrows 1 and ω',
        },
        {
          tex: '\\omega^5 = 1',
          why: 'Five turns of 72° make 360°, a full turn. So after five turns you are back at 1: ω to the fifth power is 1.',
        },
        {
          tex: '1, \\omega, \\omega^2, \\omega^3, \\omega^4 \\text{ solve } z^5 = 1',
          why: 'The five stops are all different, and the next turn returns to 1. These five arrows are the 5th roots of unity.',
          view: cp({ ...SPK(FIVE, 5) }),
          viewCaption: 'all five stops',
        },
      ],
      formal: [
        {
          tex: '(\\omega^k)^N = (\\omega^N)^k = 1',
          why: 'Each $\\omega^k$ is a root of $z^N = 1$. The $N$ numbers are different, because their angles $2\\pi k/N$ differ.',
          view: cp({ ...SPK(FIVE, 5) }),
        },
        {
          tex: 'z^N - 1 \\text{ has at most } N \\text{ zeros, so } 1, \\omega, \\ldots, \\omega^{N-1} \\text{ solve all of } z^N = 1',
          why: 'A polynomial of degree $N$ has at most $N$ zeros (Axler p. 123), so these are all of them: the roots of unity are exactly the corners of the $N$-gon.',
          view: cp({ ...SPK(EIGHT, 8) }),
        },
      ],
    },
  },
  {
    id: 'f8-roots:b2',
    phase: 'core',
    text:
      'You have seen two opposite arrows add to 0 (<<qc-f1-phase|Unit F1.5>>). The same works for any $N$: laid tip to tail, the $N$ roots close into the $N$-gon. ' +
      'Turning the whole set by $\\omega$ only relabels it.',
    formal:
      '$S = \\sum_{k=0}^{N-1}\\omega^k = 0$ for $N \\ge 2$: multiplying by $\\omega$ permutes the roots, so $\\omega S = S$, and $\\omega \\ne 1$ forces $S = 0$. ' +
      'The case $N = 2$ is $1 + (-1) = 0$, the cancelling pair of <<qc-f1-phase|Unit F1.5>>.',
    caption: 'five unit arrows laid tip to tail close up: the sum is 0',
    captionFormal: '$N = 5$: $\\sum_k\\omega^k = 0$, the closed pentagon',
    stage: cp({ ...CHAIN(5, 1) }),
    claims: [
      claim('f8RootSum5', 'the five 5th roots of unity add to 0', () => close(V.f8RootSum5, 0, 1e-12)),
      claim('f8RootSum2', 'the two 2nd roots, 1 and −1, add to 0', () => close(V.f8RootSum2, 0, 1e-12)),
      claim('f8ShiftSum5', 'multiplying the sum of the 5th roots by ω leaves it unchanged: ωS = S', () => close(V.f8ShiftSum5, 0, 1e-12)),
    ],
    derivation: {
      result: 'S = 0',
      ground: [
        {
          tex: 'S = 1 + \\omega + \\omega^2 + \\omega^3 + \\omega^4',
          why: 'Add the five arrows tip to tail and call the total $S$.',
          view: cp({ ...CHAIN(5, 1) }),
          viewCaption: 'the five arrows tip to tail',
        },
        {
          tex: '\\omega S = \\omega + \\omega^2 + \\omega^3 + \\omega^4 + 1',
          why: 'Multiply by ω. Each arrow turns 72° and lands on the next corner, so you get the same five arrows in a new order.',
          view: cp({ ...SPK([1, 2, 3, 4, 0], 5) }),
          viewCaption: 'the same five arrows, each turned on one corner',
        },
        {
          tex: '\\omega S = S',
          why: 'The same five arrows, added in a different order, give the same total.',
        },
        {
          tex: '(\\omega - 1)S = 0 \\;\\Rightarrow\\; S = 0',
          why: 'Move $S$ to one side: $(\\omega - 1)S = 0$. Since ω is not 1, $S$ must be 0.',
          view: cp({ ...CHAIN(5, 1) }),
          viewCaption: 'it closes: the sum is 0',
        },
      ],
      formal: [
        {
          tex: '\\omega S = \\sum_{k=0}^{N-1}\\omega^{k+1} = S',
          why: 'Multiplying by $\\omega$ sends $\\omega^k$ to $\\omega^{k+1}$, and $\\omega^N = 1$ closes the list, so $\\omega S$ is the same sum in a new order.',
          view: cp({ ...SPK([1, 2, 3, 4, 0], 5) }),
        },
        {
          tex: '(\\omega - 1)S = 0,\\; \\omega \\ne 1 \\;\\Rightarrow\\; S = 0',
          why: 'A product of two numbers is 0 only if a factor is, and $\\omega - 1 \\ne 0$, so $S = 0$.',
          view: cp({ ...CHAIN(5, 1) }),
        },
      ],
    },
  },
  {
    id: 'f8-roots:b3',
    phase: 'core',
    text:
      'Now step $j$ corners at a time and add $\\omega^{jk}$ for $k = 0$ to $N - 1$. If $j$ is a multiple of $N$, every arrow points at 1 and the sum is $N$. ' +
      'Otherwise they still cancel.',
    formal:
      '$\\sum_{k=0}^{N-1}\\omega^{jk} = N$ if $N$ divides $j$, and 0 otherwise: put $z = \\omega^j$, so $zS = S$ as before. ' +
      'For $N = 8$, $j = 2$ and $j = 3$ give 0 and $j = 8$ gives 8. The sum $\\sum_x(-1)^{a \\cdot x}$ of <<qc-f7-xor|Unit F7.3>> is this sum at $N = 2$, one bit at a time.',
    caption: 'eight arrows, each turned $135°$ more than the last, laid tip to tail: they close into a star, and the sum is 0',
    captionFormal: '$N = 8$, $j = 3$: $\\sum_k\\omega^{3k} = 0$, the closed star of eight arrows',
    stage: cp({ ...CHAIN(8, 3) }),
    claims: [
      claim('f8PowSum8j3', 'for N = 8 and j = 3 the eight arrows add to 0', () => close(V.f8PowSum8j3, 0, 1e-12)),
      claim('f8PowSum8j2', 'for N = 8 and j = 2 they add to 0', () => close(V.f8PowSum8j2, 0, 1e-12)),
      claim('f8PowSum8j8', 'for N = 8 and j = 8 they add to 8', () => close(V.f8PowSum8j8, 8, 1e-12)),
      claim('f8Star8Corners', 'stepping 3 corners at a time on 8 reaches eight different corners', () => V.f8Star8Corners === 8),
    ],
    derivation: {
      result: 'S = 0 \\text{ unless } N \\mid j, \\text{ when } S = N',
      ground: [
        {
          tex: 'z = \\omega^j,\\quad S = 1 + z + z^2 + \\cdots + z^7',
          why: 'Call the arrow you step by $z = \\omega^j$. With $N = 8$ and $j = 3$, the sum $S$ is eight arrows, each turned 135° more than the last.',
          view: cp({ ...CHAIN(8, 3) }),
          viewCaption: 'j = 3: eight arrows close',
        },
        {
          tex: 'z \\ne 1:\\; zS = S \\;\\Rightarrow\\; S = 0',
          why: 'If $j$ is not a multiple of $N$, then $z$ is not 1, but $z^8 = 1$. The argument of the last beat works again: $zS = S$, so $S = 0$.',
        },
        {
          tex: 'N \\mid j \\;\\Rightarrow\\; z = 1 \\;\\Rightarrow\\; S = N',
          why: 'If $j$ is a multiple of $N$, then $z$ is 1: all eight arrows are the arrow 1, laid in a row. The sum is 8.',
          view: cp({ ...CHAIN(8, 8) }),
          viewCaption: 'j = 8: eight arrows in a row, the sum is 8',
        },
      ],
      formal: [
        {
          tex: 'z \\ne 1:\\; zS = S \\;\\Rightarrow\\; (z - 1)S = 0 \\;\\Rightarrow\\; S = 0',
          why: 'For $z = \\omega^j \\ne 1$, multiplying $S$ by $z$ moves every term on one step round the list, and $z^N = 1$ closes it, so $zS = S$ and $S = 0$.',
          view: cp({ ...CHAIN(8, 3) }),
        },
        {
          tex: 'N \\mid j \\;\\Leftrightarrow\\; z = 1 \\;\\Rightarrow\\; S = N',
          why: 'The number $z$ is 1 exactly when $N$ divides $j$, and then all $N$ terms equal 1, so $S = N$.',
          view: cp({ ...CHAIN(8, 8) }),
        },
      ],
    },
  },
  {
    id: 'f8-roots:b4',
    phase: 'clue',
    text:
      'Add the twelve 12th roots. Now add only every third one, $1, \\omega^3, \\omega^6, \\omega^9$. And the first three alone. Which sums are 0?',
    formal: 'For $N = 12$, evaluate $\\sum_{k<12}\\omega^k$, $\\sum_{k<4}\\omega^{3k}$ and $|1 + \\omega + \\omega^2|$.',
    caption: 'the twelve 12th roots of unity laid tip to tail',
    captionFormal: '$N = 12$: the twelve arrows $\\omega^k$ tip to tail',
    stage: cp({ ...CHAIN(12, 1) }),
    reveal: {
      text:
        'The first two. Every third 12th root is a 4th root, $1, i, -1, -i$, and those cancel too. Three neighbours do not: their sum has length 2.732, far from 0. Only an even spread cancels.',
      formal:
        '$\\sum_{k<12}\\omega^k = 0$. Since $\\omega^3 = i$, $\\sum_{k<4}i^k = 0$. But $|1 + \\omega + \\omega^2| = 2.7321$. Cancelling needs a full lap round the circle, not just any few neighbours.',
      caption: 'every third arrow, 1, $i$, $-1$, $-i$, laid tip to tail: a closed square',
      captionFormal: '$\\omega^0, \\omega^3, \\omega^6, \\omega^9 = 1, i, -1, -i$: a closed square, sum 0',
      stage: cp({ ...CHAIN(12, 3, 4) }),
      claims: [
        claim('f8RootSum12', 'the twelve 12th roots add to 0', () => close(V.f8RootSum12, 0, 1e-12)),
        claim('f8Every3rd12', '1, ω³, ω⁶, ω⁹ add to 0', () => close(V.f8Every3rd12, 0, 1e-12)),
        claim('f8Omega12CubeGap', 'ω³ is i for N = 12', () => close(V.f8Omega12CubeGap, 0, 1e-12)),
        claim('f8First3of12', '1 + ω + ω² has length 2.7321', () => close(V.f8First3of12, 2.7321, 5e-5)),
      ],
    },
  },
]

/* ---------------------------------------------------------------------------------------------- */
/* f8-dft — The Fourier transform finds the rhythm                                                    */
/* ---------------------------------------------------------------------------------------------- */

const dftUnit: Beat[] = [
  {
    id: 'f8-dft:b1',
    phase: 'core',
    introduces: ['qc-dft'],
    text:
      'The [[qc-dft|discrete Fourier transform]] turns a list $c_0, \\ldots, c_{N-1}$ into a new list $\\hat c_0, \\ldots, \\hat c_{N-1}$. ' +
      'Entry $k$ adds each $c_j$ times the arrow $\\omega^{jk}$, then divides by $\\sqrt N$. Arrows that point the same way add up; the rest cancel.',
    formal:
      '$\\hat c_k = \\frac{1}{\\sqrt N}\\sum_{j=0}^{N-1}c_j\\,\\omega^{jk}$, that is, $(F_N)_{kj} = \\omega^{jk}/\\sqrt N$ (N&C Eq. 5.1, p. 217; Bergou’s $U_F$, Eq. 7.34). ' +
      'The sign is $+$, as for the quantum Fourier transform; numpy’s fft uses $-$. Two entries of $F_8$ are $(F_8)_{11} = 0.25 + 0.25i$ and $(F_8)_{00} = 0.3536$.',
    caption: 'the table $F_8$, eight rows by eight columns: the hue of box $(k, j)$ is the turn $45jk$ degrees',
    captionFormal: '$(F_N)_{kj} = \\omega^{jk}/\\sqrt N$ for $N = 8$: every box has the same size, and the hue of box $(k, j)$ is $45jk$ degrees',
    stage: mx({ dft: 8 }, { values: 'none', labels: 'indices' }),
    claims: [
      claim('f8DftEntry11Re', '(F_8)₁₁ has real part 0.25', () => close(V.f8DftEntry11Re, 0.25, 1e-12)),
      claim('f8DftEntry11Im', '… and imaginary part 0.25', () => close(V.f8DftEntry11Im, 0.25, 1e-12)),
      claim('f8DftEntry00', '(F_8)₀₀ is 1/√8 = 0.3536', () => close(V.f8DftEntry00, 0.3536, 5e-5)),
      claim('f8DftEntry12Im', 'the sign is +: the imaginary part of (F_8)₁₂ is +0.3536, where numpy’s fft would give −0.3536', () => close(V.f8DftEntry12Im, 0.3536, 5e-5)),
      claim('f8DftPhaseGap', 'the hue of box (k, j) is 45jk degrees: the largest gap over all 64 boxes is 0', () => close(V.f8DftPhaseGap, 0, 1e-9)),
    ],
  },
  {
    id: 'f8-dft:b2',
    phase: 'core',
    text:
      'Can the transform be undone? Yes. The overlap of two different columns (<<qc-f2-inner-product|Unit F2.2>>) is an arrow sum like those of the roots unit, and it cancels. ' +
      'So the columns are perpendicular unit vectors, and $F$ is unitary (<<qc-f4-unitary|Unit F4.4>>).',
    formal:
      '$(F^\\dagger F)_{jl} = \\frac1N\\sum_k\\omega^{k(l - j)} = \\delta_{jl}$ by the sum of the roots unit, so $F_N$ is unitary (N&C ⚑ Ex. 5.1, p. 217) and $F^{-1} = F^\\dagger$ has the entries $\\omega^{-jk}/\\sqrt N$. ' +
      'No course sheet assigns this exercise, so it is derived in full below.',
    caption: 'the table $F_8^{\\dagger}F_8$: a full box on each diagonal place and nothing elsewhere',
    captionFormal: '$F_8^{\\dagger}F_8 = I$: a unit box on the diagonal, 0 everywhere else',
    stage: mx({ product: [{ adjoint: { dft: 8 } }, { dft: 8 }] }, { values: 'exact', labels: 'indices' }),
    claims: [claim('f8DftUnitary', 'F_8† F_8 is the identity: the largest entry of F†F − I is 0', () => close(V.f8DftUnitary, 0, 1e-12))],
    derivation: {
      result: '\\delta_{jl}',
      ground: [
        {
          tex: '\\text{box } (j, l) \\text{ compares column } j \\text{ with column } l',
          why: 'Box $(j, l)$ of the product $F^\\dagger F$ compares column $j$ of $F$ with column $l$: it multiplies them place by place and adds.',
          view: mx({ dft: 8 }, { values: 'none', labels: 'indices' }),
          viewCaption: 'the table $F_8$ whose columns are compared',
        },
        {
          tex: '\\frac1N\\sum_k\\omega^{k(l-j)}',
          why: 'Each product of two column entries is one arrow, $\\omega$ to the power $(l - j)k$. So the box is $1/N$ times a sum of arrows of the roots kind.',
        },
        {
          tex: '\\frac1N\\sum_k\\omega^{k(l-j)} = \\delta_{jl}',
          why: 'If $l = j$ every arrow is 1 and the box is $N/N = 1$. If $l \\ne j$ the arrows cancel and the box is 0. So $F^\\dagger F$ is 1 on the diagonal and 0 elsewhere.',
          view: mx({ product: [{ adjoint: { dft: 8 } }, { dft: 8 }] }, { values: 'exact', labels: 'indices' }),
          viewCaption: 'the identity table',
        },
      ],
      formal: [
        {
          tex: '(F^\\dagger F)_{jl} = \\sum_k\\overline{F_{kj}}\\,F_{kl} = \\frac1N\\sum_k\\omega^{k(l-j)}',
          why: 'The entry is the overlap of columns $j$ and $l$: conjugate the first, multiply, add. Since $\\overline{\\omega^{jk}} = \\omega^{-jk}$, the exponents combine to $k(l - j)$.',
          view: mx({ dft: 8 }, { values: 'none', labels: 'indices' }),
        },
        {
          tex: '\\frac1N\\sum_k\\omega^{k(l-j)} = \\delta_{jl}',
          why: 'By the roots unit with $l - j$ in place of $j$, the sum is $N$ when $l = j$ and 0 otherwise. A square matrix with $F^\\dagger F = I$ is unitary.',
          view: mx({ product: [{ adjoint: { dft: 8 } }, { dft: 8 }] }, { values: 'exact', labels: 'indices' }),
        },
      ],
    },
  },
  {
    id: 'f8-dft:b3',
    phase: 'core',
    text:
      'Feed in a comb: equal values at every second place of eight, 0, 2, 4 and 6. Out come two spikes, at 0 and 4, each 0.7071. ' +
      'Step $r$ in gives spikes $N/r$ apart out.',
    formal:
      'For $c_j = \\sqrt{r/N}$ on the places $j \\equiv 0 \\pmod r$, with $r$ dividing $N$, one gets $\\hat c_k = 1/\\sqrt r$ when $N/r$ divides $k$ and 0 otherwise. ' +
      'For $N = 8$, $r = 2$ gives 0.7071 at $k = 0$ and $k = 4$; $r = 4$ gives 0.5 at $k = 0, 2, 4, 6$.',
    caption: 'the transform of the comb of step 2 in 8 places: two spikes, at places 0 and 4',
    captionFormal: '$F_8$ applied to the comb $\\{0, 2, 4, 6\\}$: $\\hat c_0 = \\hat c_4 = 0.7071$, every other entry 0',
    stage: amp({ ket: '++0' }, { dft: true }),
    fidelity: ['qc-amp-fourier-engine'],
    claims: [
      claim('f8Comb2Peak', 'the two spikes of the step-2 comb are each 0.7071', () => close(V.f8Comb2Peak, 0.7071, 5e-5)),
      claim('f8Comb2Others', 'every other entry of its transform is 0', () => close(V.f8Comb2Others, 0, 1e-12)),
      claim('f8Comb4Peak', 'the step-4 comb has four spikes of 0.5', () => close(V.f8Comb4Peak, 0.5, 1e-12)),
      claim('f8Comb4Others', 'and zero at the odd places', () => close(V.f8Comb4Others, 0, 1e-12)),
      claim('f8Spike2Spacing', 'the spikes of the step-2 comb are 8/2 = 4 apart', () => V.f8Spike2Spacing === 8 / 2),
    ],
    derivation: {
      result: '\\hat c_k = 0 \\text{ unless } 4 \\mid k',
      ground: [
        {
          tex: 'c = \\tfrac12\\,(1, 0, 1, 0, 1, 0, 1, 0)',
          why: 'The comb has four equal values, ½ each, at the places 0, 2, 4 and 6.',
          view: amp({ ket: '++0' }),
          viewCaption: 'the comb: four equal bars',
        },
        {
          tex: '\\hat c_k = \\tfrac{1}{\\sqrt8}\\cdot\\tfrac12\\,(1 + \\omega^{2k} + \\omega^{4k} + \\omega^{6k})',
          why: 'Entry $k$ adds four arrows, $\\omega^{2tk}$ for $t = 0$ to 3. They are the 4th roots of unity, each raised to the power $k$.',
        },
        {
          tex: '\\hat c_k = 0 \\text{ unless } 4 \\mid k',
          why: 'Those four arrows cancel unless $k$ is a multiple of 4, when all four are 1. So the only spikes are at $k = 0$ and $k = 4$.',
          view: amp({ ket: '++0' }, { dft: true }),
          viewCaption: 'the transform: spikes at 0 and 4',
        },
      ],
      formal: [
        {
          tex: '\\hat c_k = \\frac{\\sqrt r}{N}\\sum_{t<N/r}\\big(\\omega^{rk}\\big)^t',
          why: 'Put $j = rt$ and $c_j = \\sqrt{r/N}$: the entry is a sum of powers of $\\omega^{rk}$, a root of unity of order dividing $N/r$.',
          view: amp({ ket: '++0' }),
        },
        {
          tex: '\\hat c_k = \\frac{1}{\\sqrt r}\\text{ if } \\tfrac Nr \\mid k,\\ 0 \\text{ otherwise; for } N = 8,\\ r = 2:\\ \\hat c_k = 0 \\text{ unless } 4 \\mid k',
          why: 'By the roots unit with $N/r$ in place of $N$, the sum is $N/r$ when $N/r$ divides $k$ and 0 otherwise. Multiply by $\\sqrt r/N$.',
          view: amp({ ket: '++0' }, { dft: true }),
        },
      ],
    },
  },
  {
    id: 'f8-dft:b4',
    phase: 'core',
    text:
      'Slide the comb one place, to 1, 3, 5 and 7. The spikes stay at 0 and 4, the same size. Only their arrows turn: the spike at 4 now points the other way, $-0.7071$.',
    formal:
      'Shifting the list, $c_j \\to c_{j-s}$, multiplies $\\hat c_k$ by $\\omega^{sk}$ and leaves every size unchanged. ' +
      'For the comb $\\{1, 3, 5, 7\\}$, $\\hat c_0 = 0.7071$ and $\\hat c_4 = \\omega^4 \\cdot 0.7071 = -0.7071$. Reading $|\\hat c_k|^2$ ignores where the comb starts.',
    caption: 'the transform of the comb at places 1, 3, 5 and 7: the same two spikes, and the one at 4 has the opposite colour',
    captionFormal: 'comb $\\{1, 3, 5, 7\\}$: $|\\hat c_0| = |\\hat c_4| = 0.7071$, and $\\hat c_4$ has the phase $\\pi$',
    stage: amp({ ket: '++1' }, { dft: true }),
    claims: [
      claim('f8ShiftC0Re', 'ĉ₀ of the shifted comb is 0.7071', () => close(V.f8ShiftC0Re, 0.7071, 5e-5)),
      claim('f8ShiftC4Re', 'ĉ₄ of the shifted comb is −0.7071', () => close(V.f8ShiftC4Re, -0.7071, 5e-5)),
      claim('f8ShiftSizeGap', 'shifting the comb leaves every size |ĉ_k| unchanged', () => close(V.f8ShiftSizeGap, 0, 1e-12)),
      claim('f8Omega84Re', 'ω⁴ = −1 for N = 8', () => close(V.f8Omega84Re, -1, 1e-12)),
    ],
  },
  {
    id: 'f8-dft:b5',
    phase: 'clue',
    text:
      'Now a comb with step 3 in a list of 8: places 0, 3 and 6. Three does not divide 8. Do clean spikes still appear?',
    formal: 'What does $F_8$ do to a comb of step $r = 3$, where 3 does not divide 8?',
    caption: 'the comb with step 3 in 8 places: bars at places 0, 3 and 6',
    captionFormal: 'the comb $\\{0, 3, 6\\}$ on eight places: three bars',
    stage: amp({ terms: COMB3_8 }),
    reveal: {
      text:
        'Not clean ones. The tallest bars sit at 0, 3 and 5, near the multiples 0, 2.67 and 5.33 of $8/3$, with chances 0.375, 0.243 and 0.243. The rest leaks into small bars.',
      formal:
        '$|\\hat c_k|^2$ peaks near $k \\approx 8m/3$: 0.375 at 0, and 0.2429 at 3 and at 5, with the rest leaked. When $r$ does not divide $N$ the spikes blur; the next unit bounds what survives.',
      caption: 'its transform as chances: tall bars at places 0, 3 and 5, and small leaks elsewhere',
      captionFormal: '$|\\hat c_k|^2$ for the comb $\\{0, 3, 6\\}$: peaks at $k = 0, 3, 5$, near $8m/3$',
      stage: amp({ terms: COMB3_8 }, { dft: true, mode: 'probability' }),
      claims: [
        claim('f8Comb3P0', 'the chance at place 0 is 0.375', () => close(V.f8Comb3P0, 0.375, 1e-12) && LISTS.TOP3_OF_COMB3.join() === '0,3,5'),
        claim('f8Comb3P3', 'the chance at place 3 is 0.2429', () => close(V.f8Comb3P3, 0.2429, 5e-5)),
        claim('f8Comb3P5', 'the chance at place 5 equals the chance at 3', () => close(V.f8Comb3P5, V.f8Comb3P3, 1e-12)),
        claim('f8NoverR83a', '8/3 is 2.67 to two places', () => close(V.f8NoverR83a, 2.67, 5e-3)),
        claim('f8NoverR83b', '2 × 8/3 is 5.33 to two places', () => close(V.f8NoverR83b, 5.33, 5e-3)),
      ],
    },
  },
]

/* ---------------------------------------------------------------------------------------------- */
/* f8-geometric — Near misses: geometric sums and peaks                                               */
/* ---------------------------------------------------------------------------------------------- */

const geometric: Beat[] = [
  {
    id: 'f8-geometric:b1',
    phase: 'core',
    text:
      'A [[qc-geometric-series|geometric sum]] adds $1 + u + u^2 + \\cdots + u^{M-1}$, each term $u$ times the last. ' +
      'Multiply by $u$ and subtract: nearly everything cancels, leaving $(1 - u^M)/(1 - u)$. With $u = 0.5$ and $M = 4$ the sum is 1.875.',
    formal:
      '$\\sum_{t=0}^{M-1}u^t = \\frac{1 - u^M}{1 - u}$ for $u \\ne 1$, by the $S - uS$ trick. ' +
      'With $u = e^{i\\theta}$ the terms are arrows, each turned by $\\theta$ more than the last: a chain like those of the roots unit (Bergou Eq. 7.39, p. 128).',
    caption: 'four arrows along the real axis, tip to tail, each half the last; the sum has length 1.875',
    captionFormal: '$u = 0.5$, $M = 4$: $1 + u + u^2 + u^3 = 1.875$, four arrows on the real axis',
    stage: cp({ chain: { phasesDeg: [0, 0, 0, 0], sizes: GEOM_SIZES } }),
    claims: [
      claim('f8GeomU', 'each arrow is 0.5 times the one before it: lengths 1, 0.5, 0.25, 0.125 (the stage’s arrows)', () => GEOM_SIZES.every((x, t) => close(x, V.f8GeomU ** t, 1e-12))),
      claim('f8GeomHalf4', 'with u = 0.5 and M = 4 the closed form (1 − u⁴)/(1 − u) is 1.875', () => close(V.f8GeomHalf4, 1.875, 1e-12)),
      claim('f8GeomDirect', 'adding the four terms one by one also gives 1.875', () => close(V.f8GeomDirect, 1.875, 1e-12) && close(V.f8GeomDirect, V.f8GeomHalf4, 1e-12)),
    ],
  },
  {
    id: 'f8-geometric:b2',
    phase: 'core',
    text:
      'The gap from 1 to the arrow $e^{i\\theta}$ is a chord of the circle, of length $2\\sin(\\theta/2)$. ' +
      'It is 1 at $60°$, where the triangle is equilateral, and 1.4142 at $90°$.',
    formal:
      '$|1 - e^{i\\theta}| = 2|\\sin(\\theta/2)|$ (Bergou Eq. 7.40, p. 128). ' +
      'With $\\tfrac{2}{\\pi}\\beta \\le \\sin\\beta \\le \\beta$ on $[0, \\tfrac\\pi2]$ this gives $\\tfrac{2|\\theta|}{\\pi} \\le |1 - e^{i\\theta}| \\le |\\theta|$ for $|\\theta| \\le \\pi$ (Eq. 7.41). ' +
      'At $\\theta = 1$ radian: $0.6366 \\le 0.9589 \\le 1$.',
    caption: 'the arrow 1 followed by $e^{i240°} = -e^{i60°}$: their sum is the chord from $e^{i60°}$ to 1, and its length is 1',
    captionFormal: '$1 + e^{i240°} = 1 - e^{i60°}$, a chord of length $2\\sin 30° = 1$',
    stage: cp({ chain: { phasesDeg: [0, 240] } }),
    claims: [
      claim('f8Chain240', 'the sum of the arrows 1 and e^{i240°} has length 1', () => close(V.f8Chain240, 1, 1e-12)),
      claim('f8Chord60', 'the chord at 60° has length 1', () => close(V.f8Chord60, 1, 1e-12)),
      claim('f8Chord90', 'the chord at 90° has length 1.4142', () => close(V.f8Chord90, 1.4142, 5e-5)),
      claim('f8Chord1rad', 'the chord at 1 radian has length 0.9589', () => close(V.f8Chord1rad, 0.9589, 5e-5)),
      claim('f8TwoOverPi', '2/π is 0.6366, the lower bound at θ = 1', () => close(V.f8TwoOverPi, 0.6366, 5e-5) && V.f8TwoOverPi <= V.f8Chord1rad && V.f8Chord1rad <= 1),
    ],
  },
  {
    id: 'f8-geometric:b3',
    phase: 'core',
    text:
      'Add $M = 8$ arrows, each turned $\\delta$ of a full turn more than the last. At $\\delta = \\tfrac18$ the chain closes. ' +
      'If $\\delta$ is at most half that, $\\tfrac1{16}$, it curls but keeps at least $2/\\pi \\approx 0.637$ of its straight length.',
    formal:
      '$D_M(\\delta) = \\big|\\frac1M\\sum_{t<M}e^{2\\pi i\\delta t}\\big| = \\frac{|\\sin\\pi M\\delta|}{M|\\sin\\pi\\delta|}$ is at least $\\tfrac2\\pi$ for $|\\delta| \\le 1/(2M)$ (Bergou Eqs. 7.39–7.42, pp. 128–129). ' +
      'For $M = 8$ and $\\delta = \\tfrac1{16}$ it is 0.6407, and its square 0.4105 exceeds $4/\\pi^2 = 0.4053$.',
    caption: 'eight arrows of total length 1, each turned $22.5°$ more than the last: the sum has length 0.6407',
    captionFormal: '$M = 8$, $\\delta = \\tfrac1{16}$: eight arrows of total length 1; the sum has length 0.6407',
    stage: cp({ ...EIGHT_ARROWS() }),
    claims: [
      claim('f8Delta8Full', 'a full step for 8 arrows is δ = 1/8', () => V.f8Delta8Full === 1 / 8),
      claim('f8Delta8Half', 'half a step is δ = 1/16 = 0.0625', () => V.f8Delta8Half === 1 / 16),
      claim('f8Dir8Half', 'at δ = 1/16 the eight arrows keep 0.6407 of their straight length', () => close(V.f8Dir8Half, 0.6407, 5e-5)),
      claim('f8WorstChance8', 'its square is 0.4105', () => close(V.f8WorstChance8, 0.4105, 5e-5) && close(V.f8WorstChance8, V.f8Dir8Half ** 2, 1e-12)),
      claim('f8FourOverPi2', '4/π² is 0.4053, below it', () => close(V.f8FourOverPi2, 0.4053, 5e-5) && V.f8WorstChance8 > V.f8FourOverPi2),
      claim('f8MinOnWindow8', 'the least of D₈ over |δ| ≤ 1/16 is the value at the edge, 0.6407, and it is at least 2/π', () => close(V.f8MinOnWindow8, V.f8Dir8Half, 1e-9) && V.f8MinOnWindow8 >= V.f8TwoOverPi),
      claim('f8TwoOverPi', '2/π ≈ 0.637', () => close(V.f8TwoOverPi, 0.637, 5e-4)),
    ],
    derivation: {
      result: 'D_M(\\delta) \\ge \\frac2\\pi',
      ground: [
        {
          tex: 'M = 8,\\quad \\delta = \\tfrac1{16}',
          why: 'Take eight arrows of total length 1, each turned a sixteenth of a full turn, 22.5°, more than the last, laid tip to tail.',
          view: cp({ ...EIGHT_ARROWS() }),
          viewCaption: 'eight arrows, each turned 22.5° more',
        },
        {
          tex: 'D_M(\\delta) = \\frac{|\\sin \\pi M\\delta|}{M\\,|\\sin\\pi\\delta|}',
          why: 'Write $D_M(\\delta)$ for the fraction of the straight length that the sum keeps. The geometric sum and the chord make top and bottom two chords, $2\\sin\\pi M\\delta$ over $2\\sin\\pi\\delta$, and the 2s cancel.',
        },
        {
          tex: '|\\sin\\pi M\\delta| \\ge 2M|\\delta|,\\quad |\\sin\\pi\\delta| \\le \\pi|\\delta|',
          why: 'On top the angle $\\pi M\\delta$ is at most 90°, so its sine is at least $2/\\pi$ times the angle, which is $2M|\\delta|$. On the bottom the sine is at most the angle, $\\pi|\\delta|$.',
          view: plot('dirichlet8', { from: -0.25, to: 0.25 }, { markers: [{ x: 0.0625 }], yLines: TWO_OVER_PI }),
          viewCaption: 'the worst case, half a step',
        },
        {
          tex: '\\frac{2M|\\delta|}{M\\pi|\\delta|} = \\frac2\\pi \\text{ so } D_M(\\delta) \\ge \\frac2\\pi',
          why: 'Divide the top by the bottom, then by $M$. The fraction kept is at least $2/\\pi$, about 0.637.',
        },
      ],
      formal: [
        {
          tex: '|\\sin\\pi M\\delta| \\ge 2M|\\delta|,\\quad |\\sin\\pi\\delta| \\le \\pi|\\delta|',
          why: 'Jordan’s inequality $\\sin\\beta \\ge 2\\beta/\\pi$ on $[0, \\pi/2]$ applies to the top, since $\\pi M|\\delta| \\le \\pi/2$; and $\\sin\\beta \\le \\beta$ applies to the bottom.',
          view: plot('dirichlet8', { from: -0.25, to: 0.25 }, { markers: [{ x: 0.0625 }], yLines: TWO_OVER_PI }),
        },
        {
          tex: 'D_M(\\delta) \\ge \\frac{2M|\\delta|}{M\\pi|\\delta|} \\text{, that is, } D_M(\\delta) \\ge \\frac2\\pi',
          why: 'Divide: $D_M(\\delta) \\ge 2/\\pi$ on the whole window $|\\delta| \\le 1/(2M)$. As a check, $M = 8$ and $\\delta = \\tfrac1{16}$ give 0.6407.',
          view: cp({ ...EIGHT_ARROWS() }),
        },
      ],
    },
  },
  {
    id: 'f8-geometric:b4',
    phase: 'books',
    text:
      'Plot that length against $\\delta$. It is 1 at 0, 0.64 at half a step, and 0 at a full step, $\\delta = \\tfrac18$, where the chain closes. Fourier peaks have this shape.',
    formal:
      '$D_M(\\delta) = |\\sin\\pi M\\delta| / (M|\\sin\\pi\\delta|)$ equals 1 at 0, 0.6407 at $1/(2M)$ for $M = 8$, and 0 at $\\pm 1/M$. ' +
      'A comb of $A$ teeth has $|\\hat c_k| = \\sqrt{A/N}\\,D_A(rk/N)$, which is why the step-3 bars of the transform blur.',
    caption: 'the length kept by 8 arrows against $\\delta$ in turns: 1 at 0, 0.64 at half a step, 0 at a full step; the dashed line is $2/\\pi$',
    captionFormal: '$D_8(\\delta)$ with marks at $\\delta = 0$, $0.0625$ and $0.125$; the dashed line is $2/\\pi$',
    stage: plot('dirichlet8', { from: -0.25, to: 0.25 }, { markers: [{ x: 0 }, { x: 0.0625 }, { x: 0.125 }], yLines: TWO_OVER_PI }),
    claims: [
      claim('f8Dir80', 'D₈(0) = 1', () => V.f8Dir80 === 1),
      claim('f8Dir8Half', 'D₈(1/16) = 0.6407 ≈ 0.64', () => close(V.f8Dir8Half, 0.64, 5e-3) && close(V.f8Dir8Half, 0.6407, 5e-5)),
      claim('f8Dir8Full', 'D₈(1/8) = 0: a full step closes the chain', () => close(V.f8Dir8Full, 0, 1e-12)),
      claim('f8Delta8Full', 'a full step for 8 arrows is δ = 1/8 = 0.125', () => V.f8Delta8Full === 0.125),
      claim('f8Delta8Half', 'half a step is δ = 0.0625', () => V.f8Delta8Half === 0.0625),
      claim('f8CombKernelGap', 'for the step-3 comb on 8 places |ĉ_k| = √(3/8) D₃(3k/8) at every k', () => close(V.f8CombKernelGap, 0, 1e-12)),
    ],
  },
  {
    id: 'f8-geometric:b5',
    phase: 'clue',
    text: 'With 64 arrows instead of 8, is the worst case at half a step better or worse?',
    formal: 'How does $D_M(1/(2M))$ behave as $M$ grows?',
    caption: 'the 8-arrow chain: eight arrows of total length 1, each turned $22.5°$ more than the last',
    captionFormal: '$M = 8$ at half a step: eight arrows of total length 1, sum 0.6407',
    stage: cp({ ...EIGHT_ARROWS() }),
    reveal: {
      text:
        'Almost the same: 0.6367, just above $2/\\pi$. More arrows make the peak narrower, since it reaches 0 at $\\delta = 1/M$. The worst case settles at $2/\\pi$.',
      formal:
        '$D_{64}(\\tfrac1{128}) = 0.63668$ against $2/\\pi = 0.63662$: the value falls to $2/\\pi$ from above as $M$ grows, so the bound is sharp, while the peak’s width shrinks like $1/M$.',
      caption: 'the peak of 8 arrows near its top; the half-step mark sits just above the dashed $2/\\pi$ line, and 64 arrows would sit a hair above it',
      captionFormal: '$D_8$ near its peak, marked at $\\delta = 0.0625$; $D_{64}$ at half a step is 0.63668, a hair above the dashed $2/\\pi$',
      stage: plot('dirichlet8', { from: -0.125, to: 0.125 }, { markers: [{ x: 0.0625 }], yLines: TWO_OVER_PI }),
      claims: [
        claim('f8Dir64half', 'D₆₄ at half a step, δ = 1/128, is 0.63668 ≈ 0.6367', () => close(V.f8Dir64half, 0.63668, 5e-6) && close(V.f8Dir64half, 0.6367, 5e-5)),
        claim('f8TwoOverPi', '2/π = 0.63662', () => close(V.f8TwoOverPi, 0.63662, 5e-6) && V.f8Dir64half > V.f8TwoOverPi),
        claim('f8Dir64Zero', 'D₆₄ reaches 0 at δ = 1/64, a full step', () => close(V.f8Dir64Zero, 0, 1e-12)),
        claim('f8Delta64Half', 'half a step for 64 arrows is δ = 1/128', () => V.f8Delta64Half === 1 / 128),
        claim('f8DirLimitGap', 'D_M at half a step falls toward 2/π from above: for M = 10000 it is still above, by under 10⁻⁵', () => V.f8DirLimitGap > 0 && V.f8DirLimitGap < 1e-5 && V.f8Dir8Half > V.f8Dir64half && V.f8Dir64half > V.f8TwoOverPi),
      ],
    },
  },
]

/* ---------------------------------------------------------------------------------------------- */
/* f8-fractions — From a peak back to the period                                                      */
/* ---------------------------------------------------------------------------------------------- */

const fractions: Beat[] = [
  {
    id: 'f8-fractions:b1',
    phase: 'core',
    introduces: ['qc-binary-fraction'],
    text:
      'A [[qc-binary-fraction|binary fraction]] writes a number below 1 in halves, quarters and eighths: $0{.}101_2$ means $\\tfrac12 + 0 + \\tfrac18 = 0.625$. ' +
      'As a turn, 0.625 of a circle is $225°$.',
    formal:
      '$0{.}d_1d_2\\ldots d_m = \\sum_{l=1}^m d_l2^{-l}$ (N&C p. 218; Bergou p. 127 writes an $m$-bit integer over $2^m$). ' +
      'For example $0{.}101_2 = 0.625$, and $e^{2\\pi i \\cdot 0.625}$ points at $225°$.',
    caption: 'an arrow 0.625 of a full turn from the start, at 225°: the turn $0{.}101_2$',
    captionFormal: '$e^{2\\pi i\\cdot0.625}$ at $225°$, the turn $0{.}101_2$',
    stage: cp({ z: { r: 1, phiDeg: 225 }, show: ['arg'] }),
    claims: [
      claim('f8Bin1Half', 'the first digit of a binary fraction is worth one half', () => V.f8Bin1Half === 0.5),
      claim('f8Bin001Eighth', 'the third digit is worth one eighth', () => V.f8Bin001Eighth === 0.125),
      claim('f8Bin101', '0.101 in binary is 1/2 + 0 + 1/8 = 0.625', () => V.f8Bin101 === 0.625 && V.f8Bin101 === V.f8Bin1Half + V.f8Bin001Eighth),
      claim('f8Angle101', 'a turn of 0.625 is 225°', () => close(V.f8Angle101, 225, 1e-9)),
    ],
  },
  {
    id: 'f8-fractions:b2',
    phase: 'core',
    text:
      'Doubling shifts the digits left: $2 \\times 0{.}101_2 = 1{.}01_2$. A whole turn changes nothing, so the arrow lands at $0{.}01_2$ of a turn, $90°$. ' +
      'Squaring the arrow doubles its angle (<<qc-f1-multiply|Unit F1.3>>).',
    formal:
      '$e^{2\\pi i\\,2^s\\cdot0{.}d_1d_2\\ldots} = e^{2\\pi i\\cdot0{.}d_{s+1}d_{s+2}\\ldots}$: multiplying by $2^s$ moves $s$ digits into the integer part, a whole number of turns. ' +
      'Chapter Q18’s phase estimation uses this digit by digit. For $z = e^{2\\pi i\\cdot0{.}101_2}$, the square $z^2$ sits at $90°$.',
    caption: 'the arrow at 225° times itself: 225° + 225° = 450°, which is the same place as 90°',
    captionFormal: '$z \\cdot z$ for $z$ at 225°: the angles add, 450°, the same as 90°',
    stage: cp({ z: { r: 1, phiDeg: 225 }, w: { r: 1, phiDeg: 225 }, show: ['product', 'arc'] }),
    claims: [
      claim('f8Bin101x2frac', 'the part of 2 × 0.101 after the point is 0.01 binary, which is 0.25', () => close(V.f8Bin101x2frac, 0.25, 1e-12) && V.f8Bin101x2frac === 0.25),
      claim('f8Angle101x2', 'the square of the arrow at 225° is at 90°', () => close(V.f8Angle101x2, 90, 1e-9)),
      claim('f8Bin101', '0.625 doubled is 1.25, written 1.01 in binary', () => close(2 * V.f8Bin101, 1.25, 1e-12)),
    ],
    derivation: {
      result: 'e^{2\\pi i \\cdot 2x} = e^{2\\pi i \\cdot (2x \\bmod 1)}',
      ground: [
        {
          tex: 'x = 0{.}101_2 = \\tfrac12 + \\tfrac18',
          why: 'In binary, $0{.}101_2$ is a half plus an eighth: 0.625 of a full turn, which is 225°.',
          view: cp({ z: { r: 1, phiDeg: 225 }, show: ['arg'] }),
          viewCaption: 'the turn 0.101 in binary: 225°',
        },
        {
          tex: '2x = 1{.}01_2',
          why: 'Doubling moves every digit one place left, so $0{.}101_2$ becomes $1{.}01_2$. A 1 now sits before the point.',
        },
        {
          tex: 'e^{2\\pi i \\cdot 2x} = e^{2\\pi i \\cdot (2x \\bmod 1)}',
          why: 'A whole turn, $e^{2\\pi i}$, is 1 and changes nothing. What is left is 0.01 of a turn, which is 90°.',
          view: cp({ z: { r: 1, phiDeg: 225 }, w: { r: 1, phiDeg: 225 }, show: ['product', 'arc'] }),
          viewCaption: 'doubled: 450° lands at 90°',
        },
      ],
      formal: [
        {
          tex: '2^s x = d_1 \\ldots d_s\\,{.}\\,d_{s+1}d_{s+2}\\ldots',
          why: 'Multiplying by $2^s$ moves the point $s$ digits to the right, so $d_1 \\ldots d_s$ become the integer part of $2^s x$.',
          view: cp({ z: { r: 1, phiDeg: 225 }, show: ['arg'] }),
        },
        {
          tex: 'e^{2\\pi i \\cdot 2x} = e^{2\\pi i \\cdot (2x \\bmod 1)}',
          why: 'A whole number $n$ of turns is $e^{2\\pi i n} = 1$, so the integer part drops out. For $s = 1$ the leading digit goes; for larger $s$ apply this $s$ times.',
          view: cp({ z: { r: 1, phiDeg: 225 }, w: { r: 1, phiDeg: 225 }, show: ['product', 'arc'] }),
        },
      ],
    },
  },
  {
    id: 'f8-fractions:b3',
    phase: 'core',
    introduces: ['qc-continued-fraction'],
    text:
      'A [[qc-continued-fraction|continued fraction]] rewrites a fraction using whole numbers only: $5/32 = 1/(6 + 1/(2 + 1/2))$. ' +
      'Stopping early gives simpler fractions, its [[qc-convergent|convergents]]: $1/6$, then $2/13$, then $5/32$.',
    formal:
      '$p/q = [a_0; a_1, \\ldots, a_n]$, where the $a_l$ are the quotients of Euclid’s algorithm on $(p, q)$ (N&C Appendix 4, pp. 635–636). ' +
      'The convergents obey $p_l = a_lp_{l-1} + p_{l-2}$ and $q_l = a_lq_{l-1} + q_{l-2}$ (N&C p. 636). For $5/32 = [0; 6, 2, 2]$ they are $1/6$, $2/13$ and $5/32$.',
    caption: 'the transform of the comb with six teeth, as chances: tall bars at places 0, 5, 11, 16, 21 and 27; the bar at 5 is $5/32$ of the way round',
    captionFormal: 'the 32-point transform of the comb $\\{0, 6, \\ldots, 30\\}$ as chances; the next beat reads the bar at 5 as $5/32 = [0; 6, 2, 2]$',
    stage: COMB_FOURIER(),
    claims: [
      claim('f8CfLast', 'the last quotient of 5/32 is 2, so the innermost fraction is 1/2 = 0.5', () => LISTS.CF5_32.join() === '0,6,2,2' && V.f8CfLast === 0.5),
      claim('f8Conv1', 'the first convergent of 5/32 is 1/6', () => close(V.f8Conv1, 1 / 6) && LISTS.CONV5_32[1].p === 1 && LISTS.CONV5_32[1].q === 6),
      claim('f8Conv2', 'the second convergent is 2/13', () => close(V.f8Conv2, 2 / 13) && LISTS.CONV5_32[2].p === 2 && LISTS.CONV5_32[2].q === 13),
      claim('f8Conv3', 'the last convergent is 5/32 itself', () => close(V.f8Conv3, 5 / 32) && LISTS.CONV5_32[3].p === 5 && LISTS.CONV5_32[3].q === 32),
      claim('f8Comb6TopSum', 'the six tallest bars of the transform are at places 0, 5, 11, 16, 21 and 27', () => LISTS.TOP6.join() === '0,5,11,16,21,27' && V.f8Comb6TopSum === 80),
    ],
  },
  {
    id: 'f8-fractions:b4',
    phase: 'core',
    text:
      'The transform of the comb from the clock unit (step 6, 32 inputs) has a tall bar at 5. Read it as $5/32$. ' +
      'Its first convergent is $1/6$, and $2^6 \\equiv 1 \\pmod{21}$ checks out: the hidden period is 6.',
    formal:
      'If the place $y$ of a $2^m$-point transform satisfies $|y/2^m - k/r| \\le 1/(2r^2)$ for a whole $k$, then $k/r$ is a convergent of $y/2^m$ (N&C Appendix 4, p. 637). ' +
      'Here $|5/32 - 1/6| = 0.0104 \\le 0.0139$. Test each convergent’s denominator $q < 21$: $q = 6$ passes ($2^6 \\equiv 1$) and $q = 13$ fails ($2^{13} \\equiv 2$). ' +
      'Real runs take $2^m \\ge N^2$ places, here at least 441, which sharpens the peaks; $m = 5$ keeps the picture small (N&C pp. 227–229).',
    caption: 'above, the 32-point transform as chances, with its bar at 5; below, the arrow $z$ at $5/32$ of a turn (56.25°) and, unlabelled beside it, the arrow at $1/6$ of a turn (60°)',
    captionFormal: 'the bar at $y = 5$; and the arrows $e^{2\\pi i\\cdot5/32}$, labelled $z$ (56.25°), and $e^{2\\pi i/6}$ (60°), which differ by $0.0104$ of a turn',
    stage: split(COMB_FOURIER(), cp({ z: { r: 1, phiDeg: (360 * 5) / 32 }, ...SPK([1], 6), show: ['arg'] })),
    claims: [
      claim('f8Conv3', '5/32 = 0.15625', () => close(V.f8Conv3, 5 / 32)),
      claim('f8Conv1', 'the first convergent of 5/32 is 1/6', () => close(V.f8Conv1, 1 / 6)),
      claim('f8Gap5', '|5/32 − 1/6| = 0.0104', () => close(V.f8Gap5, 0.0104, 5e-5) && close(V.f8Gap5, Math.abs(V.f8Conv3 - V.f8Conv1), 1e-12)),
      claim('f8HalfQsq6', '1/(2·6²) = 0.0139, and the gap is below it', () => close(V.f8HalfQsq6, 0.0139, 5e-5) && V.f8Gap5 <= V.f8HalfQsq6),
      claim('f8Pow213mod21', '2^13 mod 21 = 2, not 1', () => V.f8Pow213mod21 === 2),
      claim('f8Order2mod21', '2^6 ≡ 1 mod 21', () => V.f8Order2mod21 === 6),
      claim('f8Pick5', 'the convergent test on bar 5 returns 6', () => V.f8Pick5 === 6),
    ],
  },
  {
    id: 'f8-fractions:b5',
    phase: 'clue',
    text: 'The bar at 11 is as tall as the bar at 5. What period does $11/32$ suggest?',
    formal: 'Which bars of the step-6 comb’s transform return $r = 6$ through the convergent test?',
    caption: 'the transform of the step-6 comb as chances: tall bars at places 0, 5, 11, 16, 21 and 27',
    captionFormal: 'the 32-point transform of the comb as chances: six tall bars, at $y = 0, 5, 11, 16, 21, 27$',
    stage: COMB_FOURIER(),
    reveal: {
      text:
        'It suggests 3, not 6. The fraction $11/32$ sits near $1/3$, which is $2/6$ in lowest terms. The 2 and the 6 shared a factor, so only a divisor of 6 came out. ' +
        'Bars 5 and 27 give 6, with total chance 0.234. A failed run is simply repeated.',
      formal:
        '$11/32 \\to 1/3$, since $k = 2$ shares a factor with $r = 6$; $16/32 \\to 1/2$ and $21/32 \\to 2/3$ likewise. Only $y \\in \\{5, 27\\}$, that is $k = 1, 5$, return $r = 6$, with total chance 0.2336. ' +
        'With $2^m \\ge N^2$ and a few repeats the method is reliable (N&C pp. 227–229).',
      caption: 'the same bars: only 5 and 27 return the period 6 when read as $y/32$; their chances add to 0.2336',
      captionFormal: 'bars $y = 5$ and $y = 27$ return $r = 6$; $11 \\to 3$, $16 \\to 2$ and $21 \\to 3$ return divisors of 6',
      stage: COMB_FOURIER(),
      claims: [
        claim('f8Frac1132', '11/32 = 0.34375', () => close(V.f8Frac1132, 11 / 32)),
        claim('f8Conv1132', '11/32 is near 1/3 = 2/6, the third convergent of 11/32', () => close(V.f8Conv1132, 1 / 3) && Math.abs(V.f8Frac1132 - V.f8Conv1132) < 0.011),
        claim('f8Conv1632', '16/32 is 1/2', () => close(V.f8Conv1632, 1 / 2)),
        claim('f8Frac2132', '21/32 = 0.65625', () => close(V.f8Frac2132, 21 / 32)),
        claim('f8Conv2132', '21/32 is near 2/3', () => close(V.f8Conv2132, 2 / 3)),
        claim('f8Pick11None', 'the convergent test on bar 11 finds no q < 21 with 2^q ≡ 1', () => V.f8Pick11None === 0),
        claim('f8Pow23mod21', '2³ ≡ 8, not 1: the 3 that bar 11 suggests is not the period', () => V.f8Pow23mod21 === 8),
        claim('f8Pick27', 'the convergent test on bar 27 returns 6, as on bar 5', () => V.f8Pick27 === 6 && V.f8Pick5 === 6),
        claim('f8SuccessCount', 'exactly two bars, 5 and 27, return the period 6', () => V.f8SuccessCount === 2 && LISTS.SUCCESS.join() === '5,27'),
        claim('f8SuccessP', 'the chances of bars 5 and 27 add to 0.2336', () => close(V.f8SuccessP, 0.2336, 5e-5) && close(V.f8SuccessP, 0.234, 5e-4)),
      ],
    },
  },
]

export const F8_STORY: Record<string, Beat[]> = {
  'f8-clock': clock,
  'f8-euclid': euclid,
  'f8-roots': roots,
  'f8-dft': dftUnit,
  'f8-geometric': geometric,
  'f8-fractions': fractions,
}

/** Every claim used anywhere in a unit's beats, for Unit.claims (content.test.tsx "claims hold"). */
function allClaims(beats: Beat[]) {
  return beats.flatMap((b) => [...(b.claims ?? []), ...(b.reveal?.claims ?? []), ...(b.derivation?.ground.flatMap((s) => s.claims ?? []) ?? []), ...(b.derivation?.formal?.flatMap((s) => s.claims ?? []) ?? [])])
}
export const F8_UNIT_CLAIMS_BY_ID: Record<string, ReturnType<typeof allClaims>> = Object.fromEntries(Object.entries(F8_STORY).map(([id, beats]) => [id, allClaims(beats)]))
