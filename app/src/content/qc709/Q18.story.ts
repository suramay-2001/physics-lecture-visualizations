/**
 * Chapter Q18 scroll story (Physics 709; roles P + W). Beats per docs/roles/proposals/P-Q18-story.md §1, in both tracks, with the judge's rulings
 * (docs/roles/decisions/qc709-Q18.md): φ stays an ANGLE (R1), so the books' eigenphase "φ", a fraction of a turn, is written τ = φ/2π here, with one Rosetta line at
 * q18-kickback:b1 (Formal); five Correction boxes live in Q18.ts (R2); order finding is a `'books'` unit (R3); the plot curve `peBest3` and `amplitudes.keep` are built (R4);
 * Simon runs at n = 3, s = 110 on five wires (R5); counting at N = 4, m = 3 (R6); the Try-its use existing widgets (R7); N&C Ex. 5.8 and Bergou P7.2 are cited only (R8).
 *
 * Build notes against the plan (reported to the orchestrator):
 * - Phase `'books'` throughout (no 709 notes reach Chapter 7): ramp beats are `books`, the clues are `clue`, the one Go-deeper beat (the classical search for a collision)
 *   is `deeper` and last in its unit.
 * - The number reader takes digits on either side of a point for a decimal, so a BINARY fraction is written `0{.}101_2`; and it takes `\tfrac{1}{2M}` or `1/2^m` for ½, so a
 *   power of two with a letter in the exponent is written `2^{-m}`, never `1/2^m`. Fractions that ARE shown (1/3, 1/6, 5/32) each have an exact claim.
 * - A stage `split` never repeats a kind, so "the QFT table beside the QFT bars" is one picture per beat; the pairs below are circuit + bars, bars + arrows, arrows + curve.
 * - The N&C appendix theorems are cited by printed page in the prose (the number reader would take "Thm A4.11" for a decimal); the theorem numbers are in each unit's `books`.
 * - Unit mentions inside Foundations are bridge chips `<<id|Unit F8.4>>`; the units of this chapter are named by number ("Unit 18.2").
 */
import type { Circuit } from '../../physics/qc/circuit'
import type { AmplitudesState, Beat, BitsState, CircuitStageState, ComplexPlaneState, GroverPlaneState, MatrixGridState, MatrixSource, PlotState, Scrub, StageLayout, StageState } from '../schema'
import { C_CNT, C_K, C_PE, C_QFT3, C_S, SIMON_OUTCOMES, TAU, TAU_ELEVEN, TAU_THIRD, V, claim, close, d } from './Q18.values'
import { simonTable } from '../../physics/qc/oracles'

/* ---------------------------------------------------------------------------------------------- */
/* Stage shorthand (plan "Stage shorthand"), as plain builder functions                              */
/* ---------------------------------------------------------------------------------------------- */
const circ = (C: Circuit, upTo: Scrub, outcomes?: string): CircuitStageState => ({ kind: 'circuit', circuit: C, upTo, ...(outcomes !== undefined ? { outcomes } : {}), shot: 'Q-WIRES' })
const amp = (C: Circuit, upTo: Scrub, mode: AmplitudesState['mode'], extra: Partial<Omit<AmplitudesState, 'kind' | 'state' | 'mode'>> = {}, outcomes?: string): AmplitudesState => ({
  kind: 'amplitudes',
  state: { circuit: C, upTo, ...(outcomes !== undefined ? { outcomes } : {}) },
  mode,
  shot: 'A-BARS',
  ...extra,
})
/** Chances of the first `keep` wires of the circuit's state after column `upTo` (the other wires summed over). */
const ampK = (C: Circuit, upTo: Scrub, keep: number, outcomes?: string): AmplitudesState => amp(C, upTo, 'probability', { keep }, outcomes)
/** The quantum Fourier transform of |a⟩: the Fourier view of the ket (U_F|a⟩), bars labelled by the strings y. */
const qamp = (a: string, extra: Partial<Omit<AmplitudesState, 'kind' | 'state'>> = {}): AmplitudesState => ({ kind: 'amplitudes', state: { ket: a }, dft: true, shot: 'A-BARS', ...extra })
const mx = (source: MatrixSource, extra: Partial<Omit<MatrixGridState, 'kind' | 'source'>> = {}): MatrixGridState => ({ kind: 'matrix', source, labels: 'none', values: 'decimal', shot: 'M-GRID', ...extra })
const cp = (s: Omit<ComplexPlaneState, 'kind' | 'shot'>): ComplexPlaneState => ({ kind: 'complex-plane', shot: 'C-FLAT', ...s })
const SPK = (degs: readonly number[], clock?: number): Pick<ComplexPlaneState, 'spokes' | 'clock'> => ({ spokes: { phasesDeg: [...degs] }, ...(clock !== undefined ? { clock } : {}) })
/** Eight arrows of total length 1, each turned 22.5° (δ = one sixteenth of a turn) more than the last: the worst case of Bergou's Eq. 7.39 for three wires. */
const EIGHT_ARROWS = (): Pick<ComplexPlaneState, 'chain'> => ({ chain: { phasesDeg: Array.from({ length: 8 }, (_, t) => 22.5 * t), sizes: Array.from({ length: 8 }, () => 1 / 8) } })
const plot = (markers: number[] = [], extra: Partial<Omit<PlotState, 'kind' | 'curve'>> = {}): PlotState => ({
  kind: 'plot',
  curve: { fn: 'peBest3', samples: 256 },
  markers: markers.map((x) => ({ x })),
  shot: 'P-CURVE',
  ...extra,
})
/** The line 4/π², the lowest the best reading ever falls. */
const FOUR_OVER_PI2 = [{ y: 4 / Math.PI ** 2, label: '4/π²' }]
const gp = (n: number, k: Scrub, extra: Partial<Omit<GroverPlaneState, 'kind' | 'search' | 'k'>> = {}, marked?: number): GroverPlaneState => ({
  kind: 'grover-plane',
  search: { n, ...(marked !== undefined ? { marked } : {}) },
  k,
  shot: 'G-PLANE',
  ...extra,
})
const bits = (b: Omit<BitsState, 'kind' | 'shot'>): BitsState => ({ kind: 'bits', shot: 'B-BITS', ...b })
/** Simon's function as an authored table: four answers (two bits), the inputs 000 … 111. */
const F_S = simonTable(6, 3)
const bm = (view: 'table' | 'map', mark?: string[]): BitsState => bits({ fn: { source: { table: F_S, n: 3, m: 2 }, view, ...(mark ? { mark } : {}) } })
const br = (strings: string[], combine?: 'xor' | 'dot'): BitsState => bits({ rows: { strings, ...(combine ? { combine } : {}) } })
const bx = (strings: string[], upTo: Scrub): BitsState => bits({ reduce: { strings, upTo } })
const split = (top: StageState, bottom: StageState): StageLayout => ({ layout: 'split', top, bottom })
const DEG = Math.PI / 180

/** The comb of period 6 on 32 places, 0, 6, …, 30 (Chapter F8's picture), drawn in its Fourier view as chances. */
const COMB32 = '00000+00110+01100+10010+11000+11110'
const combFourier = (): AmplitudesState => ({ kind: 'amplitudes', state: { terms: COMB32 }, dft: true, mode: 'probability', labels: 'index', shot: 'A-BARS' })
/** The six eigenvalues of multiplying by 2 mod 21: arrows 60° apart on a clock of six marks. */
const EIG6 = (): ComplexPlaneState => cp({ ...SPK([0, 60, 120, 180, 240, 300], 6) })

/** The marks of a clock of 21: the arrows to 1, 2, 4, 8, 16, 11 (the powers of 2 mod 21). */
const CLOCK21 = (): ComplexPlaneState => cp({ ...SPK([1, 2, 4, 8, 16, 11].map((v) => (360 * v) / 21), 21) })

/* ---------------------------------------------------------------------------------------------- */
/* q18-simon — A hidden string from a few runs                                                       */
/* ---------------------------------------------------------------------------------------------- */

const simon: Beat[] = [
  {
    id: 'q18-simon:b1',
    phase: 'books',
    text:
      'A black box takes $n = 3$ bits $x$ and answers $f(x)$. Its [[qc-promise-problem|promise]]: two inputs share an answer exactly when they differ by a secret string $s$ (not all zeros), so $f(x) = f(x \\oplus s)$ (<<qc-f7-xor|Unit F7.3>>). ' +
      'Finding $s$ is [[qc-simon-problem|Simon’s problem]]. Here $s = 110$, and the eight inputs form four pairs.',
    formal:
      '[[qc-simon-problem|Simon’s problem]] (Bergou §7.4, Eq. 7.30, p. 126): $f$ on $\\{0,1\\}^n$ is 2-to-1 with $f(x) = f(y) \\Leftrightarrow y = x \\oplus s$ and $s \\ne 0$, and $s$ is to be found with poly($n$) queries. ' +
      'Bergou writes $\\xi$ for $s$. For $n = 3$, $s = 110$: the pairs are $\\{000, 110\\}$, $\\{001, 111\\}$, $\\{010, 100\\}$ and $\\{011, 101\\}$.',
    caption: 'the box as arrows from the eight inputs to the four answers: 001 and 111 both go to the answer 01',
    captionFormal: '$f(x) = f(x \\oplus 110)$: four answers, two inputs each, the inputs 001 and 111 outlined',
    stage: bm('map', ['001', '111']),
    claims: [
      claim('q18SimonAnswers', 'the box has four different answers', () => V.q18SimonAnswers === 4 && new Set(F_S).size === 4),
      claim('q18SimonPerAnswer', 'and every answer is given by exactly two inputs', () => V.q18SimonPerAnswer === 2 && [...new Set(F_S)].every((v) => F_S.filter((w) => w === v).length === 2)),
      claim('q18SimonF001', '$f(001) = f(111) = 01$', () => V.q18SimonF001 === 1 && V.q18SimonF111 === 1 && F_S[1] === F_S[7]),
    ],
  },
  {
    id: 'q18-simon:b2',
    phase: 'books',
    text:
      'Mix the three input wires with Hadamards and ask the box once: eight bars of $' + d(V.q18SimonQueryBar, 4) + '$, one per input with its answer. Now read only the two answer wires. ' +
      'Each answer has chance $' + d(V.q18SimonOutChance, 2) + '$; say it reads 01. Only 001 and 111 fit, so two bars of $' + d(V.q18SimonPairBar, 4) + '$ remain. Call the pair $z$ and $z \\oplus s$.',
    formal:
      'The Hadamards on the inputs and then $U_f|x\\rangle|y\\rangle = |x\\rangle|y \\oplus f(x)\\rangle$ give $2^{-n/2}\\sum_x|x\\rangle|f(x)\\rangle$ (Eqs. 7.31–7.32; two answer wires suffice, as $f$ takes four values). ' +
      'Reading them yields $f(z)$ for a uniform $z$, chance $' + d(V.q18SimonOutChance, 2) + '$ each, and leaves $(|z\\rangle + |z \\oplus s\\rangle)/\\sqrt2$ (Bergou’s $x_0$ is our $z$): here $(|001\\rangle + |111\\rangle)/\\sqrt2$, bars of $' + d(V.q18SimonPairBar, 4) + '$.',
    caption: 'after the answer wires read 01: two bars of ' + d(V.q18SimonPairBar, 4) + ', at 00101 and 11101 (the first three bits are the input)',
    captionFormal: 'the state after the readout 01: $(|001\\rangle + |111\\rangle)/\\sqrt2$ on the input wires, answer wires 01',
    stage: split(circ(C_S, 4, SIMON_OUTCOMES), amp(C_S, 4, 'amplitude', {}, SIMON_OUTCOMES)),
    claims: [
      claim('q18SimonQueryBar', 'after one query the eight live bars are $0.3536$ long', () => close(V.q18SimonQueryBar, 1 / Math.sqrt(8), 1e-9) && close(V.q18SimonQueryBarsEqual, 0, 1e-9)),
      claim('q18SimonOutChance', 'each of the four answers is read with chance $0.25$', () => close(V.q18SimonOutChance, 0.25, 1e-9)),
      claim('q18SimonPairBar', 'after reading 01 two bars of $0.7071$ remain', () => close(V.q18SimonPairBar, Math.SQRT1_2, 1e-9)),
    ],
  },
  {
    id: 'q18-simon:b3',
    phase: 'books',
    introduces: ['qc-s-perp'],
    text:
      'Put Hadamards on the input wires again. Each string $y$ gets one sign from 001 and one from 111, and they cancel when $y \\cdot s = 1$. ' +
      'Four bars survive, each $\\pm' + d(V.q18SimonYBar, 1) + '$: the [[qc-s-perp|perpendicular strings]] $s^\\perp$, those whose [[qc-bit-dot|bit dot product]] $y \\cdot s$ is 0, here 000, 001, 110 and 111.',
    formal:
      'By Chapter Q16’s sign rule, $H^{\\otimes n}(|z\\rangle + |z \\oplus s\\rangle)/\\sqrt2 = 2^{-(n+1)/2}\\sum_y(-1)^{z\\cdot y}(1 + (-1)^{s\\cdot y})|y\\rangle = 2^{-(n-1)/2}\\sum_{y\\in s^\\perp}(-1)^{z\\cdot y}|y\\rangle$, where ' +
      '[[qc-s-perp|$s^\\perp$ is the set of strings with $y\\cdot s = 0$]] (Eq. 7.33; the printed last line keeps $2^{-(n+1)/2}$: Correction box). Each of its $2^{n-1} = 4$ strings is read with chance $' + d(V.q18SimonYChance, 2) + '$. Here $z\\cdot y$ is the [[qc-bit-dot|bit dot product]] of Chapter Q16.',
    caption: 'after the second Hadamards, with the answer wires still 01: four signed bars of size ' + d(V.q18SimonYBar, 1) + ' at the inputs 000, 001, 110 and 111',
    captionFormal: '$H^{\\otimes3}$ on the pair: four bars $\\pm' + d(V.q18SimonYBar, 1) + '$ at $y = 000, 001, 110, 111$, answer wires 01',
    stage: split(circ(C_S, 5, SIMON_OUTCOMES), amp(C_S, 5, 'signed', {}, SIMON_OUTCOMES)),
    claims: [
      claim('q18SimonYBar', 'each surviving bar has size $0.5$', () => close(V.q18SimonYBar, 0.5, 1e-9) && V.q18SimonYSign === -1),
      claim('q18SimonPerpCount', 'exactly four strings survive', () => V.q18SimonPerpCount === 4),
      claim('q18SimonBadY', 'a string with $y \\cdot s = 1$ is never read', () => close(V.q18SimonBadY, 0, 1e-12)),
      claim('q18SimonYChance', 'each of the four strings has chance $0.25$', () => close(V.q18SimonYChance, V.q18SimonYBar ** 2, 1e-9) && close(V.q18SimonYChance, 1 / V.q18SimonPerpCount, 1e-9)),
      claim('q18SimonPrintedNorm2', 'the printed prefactor would make the four terms add to $0.25$, not $1$', () => close(V.q18SimonPrintedNorm2, 0.25, 1e-9) && close(V.q18SimonTrueNorm2, 1, 1e-9)),
    ],
    derivation: {
      result: 'H^{\\otimes n}\\tfrac{|z\\rangle + |z\\oplus s\\rangle}{\\sqrt2} = 2^{-(n-1)/2}\\sum_{y\\in s^\\perp}(-1)^{z\\cdot y}|y\\rangle',
      ground: [
        {
          tex: 'H^{\\otimes n}|z\\rangle = 2^{-n/2}\\sum_y(-1)^{z\\cdot y}|y\\rangle',
          why: 'One input string spreads over all strings $y$, with the sign $(-1)^{z \\cdot y}$ (Chapter Q16).',
          view: amp(C_S, 4, 'signed', {}, SIMON_OUTCOMES),
          viewCaption: 'the pair before the second Hadamards',
        },
        {
          tex: '(-1)^{(z\\oplus s)\\cdot y} = (-1)^{z\\cdot y}(-1)^{s\\cdot y}',
          why: 'The partner string $z \\oplus s$ gives the same sign times $(-1)^{s \\cdot y}$.',
          view: br(['110', '111'], 'dot'),
          viewCaption: '110 · 111 = 0: the signs agree',
          claims: [claim('q18Dot110x111', '$110 \\cdot 111 = 0$ (the two signs agree)', () => V.q18Dot110x111 === 0)],
        },
        {
          tex: '1 + (-1)^{s\\cdot y} = 2\\ \\text{or}\\ 0',
          why: 'The two signs add to 2 when $y \\cdot s = 0$ and cancel when $y \\cdot s = 1$.',
          view: br(['110', '010'], 'dot'),
          viewCaption: '110 · 010 = 1: they cancel',
          claims: [claim('q18Dot110x010', '$110 \\cdot 010 = 1$ (the two signs cancel)', () => V.q18Dot110x010 === 1)],
        },
        {
          tex: '= 2^{-(n-1)/2}\\sum_{y\\in s^\\perp}(-1)^{z\\cdot y}|y\\rangle',
          why: `The factor 2 turns the prefactor into $2^{-(n-1)/2}$: four bars of size $${d(V.q18SimonYBar, 1)}$.`,
          view: amp(C_S, 5, 'signed', {}, SIMON_OUTCOMES),
          viewCaption: 'four bars ±0.5',
        },
      ],
      formal: [
        {
          tex: '\\tfrac{1}{2^{(n+1)/2}}\\sum_y\\left((-1)^{z\\cdot y} + (-1)^{(z\\oplus s)\\cdot y}\\right)|y\\rangle',
          why: 'Expand both terms with $H^{\\otimes n}|x\\rangle = 2^{-n/2}\\sum_y(-1)^{x\\cdot y}|y\\rangle$.',
          view: amp(C_S, 4, 'signed', {}, SIMON_OUTCOMES),
        },
        {
          tex: '=\\tfrac{1}{2^{(n+1)/2}}\\sum_y(-1)^{z\\cdot y}\\left(1 + (-1)^{s\\cdot y}\\right)|y\\rangle',
          why: 'Factor out $(-1)^{z\\cdot y}$, since $(z\\oplus s)\\cdot y = z\\cdot y + s\\cdot y$ mod 2.',
          view: br(['110', '111'], 'dot'),
        },
        {
          tex: '=2^{-(n-1)/2}\\sum_{y\\in s^\\perp}(-1)^{z\\cdot y}|y\\rangle',
          why: 'The bracket is 2 on $s^\\perp$ and 0 off it, and $2\\cdot2^{-(n+1)/2} = 2^{-(n-1)/2}$.',
          view: amp(C_S, 5, 'signed', {}, SIMON_OUTCOMES),
        },
      ],
    },
  },
  {
    id: 'q18-simon:b4',
    phase: 'books',
    text:
      'Each run gives one check, $y \\cdot s = 0$. Two independent checks pin $s$ down. From 111 and 110, row moves leave 110 and 001, so $s = 110$ (<<qc-f7-gf2|Unit F7.4>>). ' +
      'Three independent checks would allow only $s = 000$.',
    formal:
      'Repeat until $n - 1 = 2$ independent strings $y$ are in hand, then solve $Ys = 0$ over $\\mathrm{GF}(2)$ (<<qc-f7-gf2|Unit F7.4>>): the rows 111 and 110 reduce to 110 and 001, with null space $\\{000, 110\\}$. ' +
      'All of $s^\\perp$ has rank $n - 1 = 2$; Bergou’s “$n$ independent equations” would force $s = 0$ (Correction box).',
    caption: 'the checks 111 and 110 after two row moves: rank 2, null space 000 and 110',
    captionFormal: '$Y$ = rows 111, 110 after two moves: rows 110 and 001, rank 2, null space $\\{000, 110\\}$',
    stage: bx(['111', '110'], 2),
    claims: [
      claim('q18SimonRank', 'two checks have rank $2$', () => V.q18SimonRank === 2 && V.q18SimonMoves === 2),
      claim('q18SimonNullSize', 'and leave a null space of two strings, 000 and 110', () => V.q18SimonNullSize === 2 && V.q18SimonSolved === 6),
      claim('q18PerpRank', 'all four strings of $s^\\perp$ together have rank $2$, one less than the three wires', () => V.q18PerpRank === 2),
      claim('q18ThreeForceZero', 'three independent checks leave a null space of one string, 000', () => V.q18ThreeForceZero === 1),
    ],
  },
  {
    id: 'q18-simon:b5',
    phase: 'clue',
    text: 'One run reads 000, and another repeats an earlier $y$. Do they help? On average, how many runs does $s = 110$ take?',
    formal: 'Each run returns $y$ uniform on $s^\\perp$. What is the chance that $n - 1 = 2$ runs suffice, and the expected number of runs?',
    caption: 'the four possible readings of the input wires, chance ' + d(V.q18SimonYChance, 2) + ' each',
    captionFormal: 'chances of the three input wires: $' + d(V.q18SimonYChance, 2) + '$ on each of 000, 001, 110, 111',
    stage: ampK(C_S, 5, 3, SIMON_OUTCOMES),
    fidelity: ['qc-amp-keep-sum'],
    claims: [claim('q18SimonYChance', 'each of the four readings has chance $0.25$', () => close(V.q18SimonYChance, 0.25, 1e-9) && V.q18SimonPerpCount === 4)],
    reveal: {
      text:
        'Neither helps: 000 passes every check, and a repeat adds nothing new. Two runs are enough with chance $' + d(V.q18SimonTwoRuns, 3) + '$. On average it takes $' + d(V.q18SimonExpRuns, 2) + '$ runs, a handful.',
      formal:
        '$y = 000$ and repeats add no rank: the first run adds rank with chance $' + d(V.q18SimonNew0, 2) + '$ and the second with chance $' + d(V.q18SimonNew1, 1) + '$, so $P(\\text{rank 2 after two runs}) = ' + d(V.q18SimonNew0, 2) + ' \\cdot ' + d(V.q18SimonNew1, 1) + ' = ' + d(V.q18SimonTwoRuns, 3) + '$, ' +
        'and the expected count is $1/' + d(V.q18SimonNew0, 2) + ' + 1/' + d(V.q18SimonNew1, 1) + ' = ' + d(V.q18SimonExpRuns, 2) + '$. It grows like $n$ ($' + d(V.q18SimonExpRuns10, 2) + '$ at $n = 10$): Bergou’s $O(n)$ runs.',
      caption: 'the checks 110 and 110 reduce to rank 1 (four candidates for s), beside the same four readings',
      captionFormal: 'two equal checks: one move, rank 1, null space of four strings; the readings are still four of chance 0.25',
      stage: split(bx(['110', '110'], 1), ampK(C_S, 5, 3, SIMON_OUTCOMES)),
      fidelity: ['qc-amp-keep-sum'],
      claims: [
        claim('q18SimonNew0', 'the first run adds rank unless it reads 000: chance $0.75$', () => close(V.q18SimonNew0, 0.75, 1e-12)),
        claim('q18SimonNew1', 'the second adds rank unless it repeats 000 or the first string: chance $0.5$', () => close(V.q18SimonNew1, 0.5, 1e-12)),
        claim('q18SimonTwoRuns', 'two runs reach rank 2 with chance $0.375$', () => close(V.q18SimonTwoRuns, V.q18SimonNew0 * V.q18SimonNew1, 1e-12)),
        claim('q18SimonExpRuns', 'the expected number of runs is $3.33$', () => close(V.q18SimonExpRuns, 1 / V.q18SimonNew0 + 1 / V.q18SimonNew1, 1e-12)),
        claim('q18SimonExpRuns10', 'for ten bits the expected number of runs is $10.60$', () => V.q18SimonExpRuns10 > 10.6 && V.q18SimonExpRuns10 < 10.61),
      ],
    },
  },
  {
    id: 'q18-simon:b6',
    phase: 'deeper',
    text:
      'Without quantum help, $s$ shows up when two queries collide (same answer, different inputs), and then $s$ is their XOR. It also shows up once every other string is ruled out. ' +
      'Three random queries collide with chance $' + d(V.q18SimonCollide3, 4) + '$ here; either way it takes about $2^{n/2}$ queries for $n$ bits.',
    formal:
      'Classically $s = x \\oplus x’$ comes from a collision $f(x) = f(x’)$ or, with none, by elimination: $k$ queries rule out their $\\binom{k}{2}$ XORs, so $s$ is fixed once $\\binom{k}{2} \\ge 2^n - 2$. Among $k$ distinct queries a collision occurs with probability at most $k(k-1)/(2(2^n - 1))$ (the union bound, our calculation), which is exactly $' + d(V.q18SimonCollide3, 4) + '$ at $n = 3$, $k = 3$. ' +
      'So $\\Omega(2^{n/2})$ queries are needed, against $O(n)$ runs (Simon’s 1994 paper, cited in N&C p. 246).',
    caption: 'a collision: 010 ⊕ 100 = 110, the secret string',
    captionFormal: '$f(010) = f(100)$, and $010 \\oplus 100 = 110 = s$',
    stage: br(['010', '100'], 'xor'),
    claims: [
      claim('q18SimonCollide3', 'three random distinct queries collide with chance $0.4286$, and the union bound is exactly that here', () => close(V.q18SimonCollide3, V.q18SimonCollideBound, 1e-12) && close(V.q18SimonCollide3, 3 / 7, 1e-12)),
      claim('q18CollisionXor', 'the colliding pair 010, 100 gives $010 \\oplus 100 = 110$, the secret string', () => V.q18CollisionXor === 6 && F_S[2] === F_S[4]),
    ],
  },
]

/* ---------------------------------------------------------------------------------------------- */
/* q18-qft — A Fourier transform built from small gates                                              */
/* ---------------------------------------------------------------------------------------------- */

const qft: Beat[] = [
  {
    id: 'q18-qft:b1',
    phase: 'books',
    introduces: ['qc-qft'],
    text:
      'Simon used Hadamards. Shor’s algorithm uses the [[qc-qft|quantum Fourier transform]] $U_F$ instead: the transform of <<qc-f8-dft|Unit F8.4>>, applied to a register’s amplitudes. ' +
      'On $m$ wires it sends the number $a$ to an even spread over all strings $y$, each turned by $e^{2\\pi i a y/2^m}$. For $m = 3$ its table is $F_8$.',
    formal:
      '$U_F|a\\rangle = 2^{-m/2}\\sum_{y=0}^{2^m-1}e^{2\\pi iay/2^m}|y\\rangle$ (Bergou Eq. 7.34, prefactor corrected; N&C Eq. 5.2, p. 217), with $ay$ an ordinary product of integers, not §7.1’s bit dot. ' +
      'On amplitudes it is $F_{2^m}$ (<<qc-f8-dft|Unit F8.4>>). Shor’s step put it where Simon had $H^{\\otimes n}$ (N&C p. 246).',
    caption: 'U_F on three wires as an 8 × 8 grid of boxes: every box has size ' + d(V.q18F8Entry00, 4) + ', and its colour is the turn 45° times a·y (column a, row y)',
    captionFormal: '$U_F = F_8$: $(F_8)_{ya} = e^{2\\pi iay/8}/\\sqrt8$, every box of size $' + d(V.q18F8Entry00, 4) + '$, coloured by its phase',
    stage: mx({ dft: 8 }, { values: 'none', labels: 'indices' }),
    claims: [
      claim('q18F8Entry00', 'every entry of $F_8$ has size $0.3536$', () => close(V.q18F8Entry00, 1 / Math.sqrt(8), 1e-9)),
      claim('q18QftIsF8', 'the defining sum for $U_F|a\\rangle$ equals the columns of $F_8$ (largest gap zero)', () => close(V.q18QftIsF8, 0, 1e-9)),
    ],
  },
  {
    id: 'q18-qft:b2',
    phase: 'books',
    text:
      'Feed in $|101\\rangle$, the number 5. Out comes an even spread over all eight strings, each of size $' + d(V.q18Qft101Bar, 4) + '$, turning $225°$ from one string to the next. ' +
      'Read now, every string has chance $' + d(V.q18Qft101Chance, 3) + '$: the turns are hidden from a single reading.',
    formal:
      '$|\\langle y|U_F|101\\rangle| = 2^{-m/2} = ' + d(V.q18Qft101Bar, 4) + '$ with phase $225°\\cdot y$; one reading gives each $y$ with probability $' + d(V.q18Qft101Chance, 3) + '$, so the amplitudes cannot be read out (N&C p. 220). ' +
      'Bergou’s printed prefactor $2^{-m}$ would make the squared sizes add to $' + d(V.q18QftPrintedNorm2, 3) + '$ (Correction box); his Eq. 7.36 and Eq. 7.38 carry $2^{-m/2}$ and $2^{-m}$.',
    caption: 'the transform of 101: eight bars of ' + d(V.q18Qft101Bar, 4) + ', each with a dial; the dial turns 225° from one string to the next',
    captionFormal: '$U_F|101\\rangle$: eight bars $' + d(V.q18Qft101Bar, 4) + '$, dial phases $225°\\cdot y$',
    stage: qamp('101', { dials: true }),
    claims: [
      claim('q18Qft101Bar', 'each of the eight amplitudes has size $0.3536$', () => close(V.q18Qft101Bar, 1 / Math.sqrt(8), 1e-9) && close(V.q18Qft101BarsEqual, 0, 1e-9)),
      claim('q18Qft101Step', 'and the phase turns $225°$ per string', () => close(V.q18Qft101Step, 225, 1e-9)),
      claim('q18Qft101Chance', 'every string has chance $0.125$', () => close(V.q18Qft101Chance, 1 / 8, 1e-9) && close(V.q18QftTrueNorm2, 1, 1e-9)),
      claim('q18QftPrintedNorm2', 'with the printed prefactor the squared sizes add to $0.125$', () => close(V.q18QftPrintedNorm2, 2 ** -3, 1e-9)),
    ],
  },
  {
    id: 'q18-qft:b3',
    phase: 'books',
    text:
      'The spread is a [[qc-qft-product-form|product]]: each output wire gets its own turn. For 101 the top wire turns $180°$, the middle $90°$ and the bottom $225°$. ' +
      'Those are the binary fractions $0{.}1$, $0{.}01$ and $0{.}101$ of a turn (<<qc-f8-fractions|Unit F8.6>>).',
    formal:
      'With $a = 2^{m-1}a_1 + 2^{m-2}a_2 + \\cdots + a_m$ (Bergou p. 127 prints $2^{m-1}$ twice: Correction box), $U_F|a\\rangle = \\bigotimes_{l=1}^m(|0\\rangle + e^{2\\pi i\\,0{.}a_{m-l+1}\\cdots a_m}|1\\rangle)/\\sqrt2$, wire $l$ counted from the top (N&C Eq. 5.4, p. 218). ' +
      'For 101: $180°$, $90°$, $225°$.',
    caption: 'the transform of 101 (top) and three arrows from the centre of the plane at 180°, 90° and 225° (bottom): the turns of the top, middle and bottom wire',
    captionFormal: '$U_F|101\\rangle$ beside the three wire turns $0{.}1$, $0{.}01$, $0{.}101$ of a turn: arrows at $180°$, $90°$, $225°$',
    stage: split(qamp('101', { dials: true }), cp(SPK([V.q18ProdTop, V.q18ProdMid, V.q18ProdBot]))),
    claims: [
      claim('q18ProdTop', 'the top wire of $U_F|101\\rangle$ turns $180°$', () => close(V.q18ProdTop, 180, 1e-9)),
      claim('q18ProdMid', 'the middle wire turns $90°$', () => close(V.q18ProdMid, 90, 1e-9)),
      claim('q18ProdBot', 'and the bottom wire turns $225°$', () => close(V.q18ProdBot, 225, 1e-9)),
      claim('q18ProdIsQft', 'the product of the three wires equals $U_F|a\\rangle$ for all eight inputs (largest gap zero)', () => close(V.q18ProdIsQft, 0, 1e-9)),
      claim('q18ExpandPrinted110', 'the printed expansion gives 8 for 110, where the right one gives 6', () => V.q18ExpandPrinted110 === 8 && V.q18ExpandTrue110 === 6 && V.q18ExpandWrong === 4),
    ],
    derivation: {
      result: 'U_F|a\\rangle = \\bigotimes_{l=1}^m\\tfrac{|0\\rangle + e^{2\\pi i\\,0{.}a_{m-l+1}\\cdots a_m}|1\\rangle}{\\sqrt2}',
      ground: [
        {
          tex: 'U_F|a\\rangle = 2^{-m/2}\\sum_y e^{2\\pi i a y/2^m}|y\\rangle',
          why: 'Start from the defining sum: each string $y$ is turned by $e^{2\\pi i a y/2^m}$.',
          view: qamp('101', { dials: true }),
          viewCaption: 'the transform of 101',
        },
        {
          tex: 'e^{2\\pi i a y/2^m} = \\prod_l e^{2\\pi i a y_l/2^l}',
          why: 'Write $y$ in binary, $y = 2^{m-1}y_1 + \\cdots + y_m$. The turn then splits into one factor per output wire.',
        },
        {
          tex: 'e^{2\\pi i a/2^l} = e^{2\\pi i\\,0{.}a_{m-l+1}\\cdots a_m}',
          why: 'Whole turns drop out, so wire $l$ keeps only the last $l$ digits of $a$ as a binary fraction. For 101 that is $0{.}1$, $0{.}01$ and $0{.}101$ of a turn.',
          view: cp(SPK([V.q18ProdTop, V.q18ProdMid, V.q18ProdBot])),
          viewCaption: 'three wire turns',
        },
        {
          tex: 'U_F|a\\rangle = \\bigotimes_{l=1}^m\\tfrac{|0\\rangle + e^{2\\pi i\\,0{.}a_{m-l+1}\\cdots a_m}|1\\rangle}{\\sqrt2}',
          why: 'Each wire is then $|0\\rangle$ plus its own turn times $|1\\rangle$, over $\\sqrt2$. The product is the table $F_8$ column by column.',
          view: mx({ dft: 8 }, { values: 'none', labels: 'indices' }),
          viewCaption: 'the table $F_8$',
        },
      ],
      formal: [
        {
          tex: 'U_F|a\\rangle = 2^{-m/2}\\sum_{y_1\\cdots y_m}\\prod_{l=1}^m e^{2\\pi i a y_l/2^l}|y_1\\cdots y_m\\rangle',
          why: 'Put $y = \\sum_l 2^{m-l}y_l$ in the defining sum (N&C Eqs. 5.5–5.6).',
          view: qamp('101', { dials: true }),
        },
        {
          tex: '=\\bigotimes_{l=1}^m\\tfrac{|0\\rangle + e^{2\\pi i a/2^l}|1\\rangle}{\\sqrt2}',
          why: 'The sum over each $y_l$ factorises (Eqs. 5.7–5.9), one factor per wire.',
          view: cp(SPK([V.q18ProdTop, V.q18ProdMid, V.q18ProdBot])),
        },
        {
          tex: '=\\bigotimes_{l=1}^m\\tfrac{|0\\rangle + e^{2\\pi i\\,0{.}a_{m-l+1}\\cdots a_m}|1\\rangle}{\\sqrt2}',
          why: 'Only the last $l$ digits of $a$ survive modulo a whole turn (Eq. 5.10): the product form of Eq. 5.4.',
          view: qamp('101', { dials: true }),
        },
      ],
    },
  },
  {
    id: 'q18-qft:b4',
    phase: 'books',
    introduces: ['qc-controlled-rk'],
    text:
      'Build it from small gates. On each wire a Hadamard writes that wire’s digit, then the [[qc-controlled-rk|controlled turns]] $R_2 = S$ and $R_3 = T$ add the digits below it. A swap puts the wires in order. ' +
      'Three wires need ' + V.q18QftGates3 + ' gates and a swap; ten wires need ' + V.q18QftGates10 + ' and ' + V.q18QftSwaps10 + ' swaps.',
    formal:
      '$R_k = \\mathrm{diag}(1, e^{2\\pi i/2^k}) = P(2\\pi/2^k)$ (N&C Eq. 5.11), so $R_2 = S$ and $R_3 = T$ (Chapter Q4). H, $cR_2$, $cR_3$ on wire 1, H, $cR_2$ on wire 2, H on wire 3, then SWAP(1, 3), equals $F_8$ (N&C Fig. 5.1, Box 5.1). ' +
      'That is $m(m+1)/2$ gates plus $\\lfloor m/2\\rfloor$ swaps, $\\Theta(m^2)$, against $\\Theta(m2^m)$ for the fast Fourier transform: ' + V.q18QftGates10 + ' against ' + V.q18Fft10 + ' at $m = 10$ (pp. 219–220).',
    caption: 'the QFT circuit on 101 after all seven columns (top) and its output (bottom): the same eight bars, dials turning 225° per string',
    captionFormal: 'the circuit of $U_F$ on $|101\\rangle$, cursor after the last of seven columns, and the state it leaves: $U_F|101\\rangle$',
    stage: split(circ(C_QFT3(5), 7), amp(C_QFT3(5), 7, 'amplitude', { dials: true })),
    claims: [
      claim('q18QftCircuitIsF8', 'the circuit’s matrix equals $F_8$ (largest gap zero)', () => close(V.q18QftCircuitIsF8, 0, 1e-9) && close(V.q18QftOutIsF8Col, 0, 1e-9)),
      claim('q18QftGates3', 'three wires need 6 gates and 1 swap', () => V.q18QftGates3 === 6 && V.q18QftSwaps3 === 1 && V.q18QftGates3 === (3 * 4) / 2),
      claim('q18QftGates10', 'ten wires need 55 gates and 5 swaps', () => V.q18QftGates10 === 55 && V.q18QftSwaps10 === 5 && V.q18QftGates10 === (10 * 11) / 2),
      claim('q18Fft10', 'the fast Fourier transform on $2^{10}$ numbers takes $10 \\cdot 2^{10} = 10240$ steps', () => V.q18Fft10 === 10 * 2 ** 10),
    ],
  },
  {
    id: 'q18-qft:b5',
    phase: 'clue',
    text: 'What does the QFT do to $|000\\rangle$? Is it just a Hadamard on every wire?',
    formal: 'Compute $U_F|000\\rangle$ (N&C Ex. 5.2) and compare $U_F|001\\rangle$ with $H^{\\otimes3}|001\\rangle$.',
    caption: 'the transform of 000: eight equal bars',
    captionFormal: '$U_F|000\\rangle$: eight bars of $' + d(V.q18F8Entry00, 4) + '$',
    stage: qamp('000'),
    claims: [claim('q18F8Entry00', 'the bars are $0.3536$ high', () => close(V.q18F8Entry00, 1 / Math.sqrt(8), 1e-9))],
    reveal: {
      text:
        'On $|000\\rangle$ it gives the even mix, exactly as three Hadamards do. But on $|001\\rangle$ its arrows turn $45°$ per string, while Hadamards give only plus and minus. The controlled turns make the difference.',
      formal:
        '$U_F|0\\rangle = H^{\\otimes m}|0\\rangle$ (every digit 0, every factor $|+\\rangle$), but $U_F|001\\rangle$ has phases $45°\\cdot y$ while $H^{\\otimes3}|001\\rangle$ has equal bars with only the signs $\\pm$: their largest entry gap is $' + d(V.q18Qft001VsH, 4) + '$. ' +
        'Without the $R_k$ each wire would keep one digit only.',
      caption: 'the transform of 001, dials turning 45° per string (top), and the QFT circuit on 001 (bottom)',
      captionFormal: '$U_F|001\\rangle$ (top) beside the circuit of $U_F$ on $|001\\rangle$ (bottom)',
      stage: split(qamp('001', { dials: true }), circ(C_QFT3(1), 7)),
      claims: [
        claim('q18Qft000IsH', '$U_F|000\\rangle$ equals $H^{\\otimes3}|000\\rangle$ (largest gap zero)', () => close(V.q18Qft000IsH, 0, 1e-9)),
        claim('q18Qft001VsH', '$U_F|001\\rangle$ and $H^{\\otimes3}|001\\rangle$ differ by $0.7071$ in their largest entry', () => close(V.q18Qft001VsH, Math.SQRT1_2, 1e-9)),
      ],
    },
  },
]

/* ---------------------------------------------------------------------------------------------- */
/* q18-kickback — Controlled powers write a phase on controls                                        */
/* ---------------------------------------------------------------------------------------------- */

const kickback: Beat[] = [
  {
    id: 'q18-kickback:b1',
    phase: 'books',
    introduces: ['qc-eigenphase'],
    text:
      'A gate $U$ can have [[qc-eigenvector|special states]] $|u\\rangle$ that it only turns, never moves: $U|u\\rangle = e^{i\\varphi}|u\\rangle$. The angle $\\varphi$ is the turn. ' +
      'Counted as a fraction of a full turn, from 0 up to 1, it is the [[qc-eigenphase|eigenphase]] $\\tau = \\varphi/2\\pi$. Here $\\tau = 0{.}101_2 = ' + d(V.q18Tau, 3) + '$ of a turn, which is $225°$.',
    formal:
      'A unitary’s eigenvalues have size 1 (<<qc-f4-unitary|Unit F4.4>>), so $U|u\\rangle = e^{i\\varphi}|u\\rangle$ with $\\varphi = 2\\pi\\tau$ and $0 \\le \\tau < 1$ (Bergou p. 127, who writes $|\\psi\\rangle$; N&C p. 221). ' +
      'Rosetta: the books write $e^{2\\pi i\\varphi}$ for this eigenvalue; here $\\varphi$ stays the angle and $\\tau$ is the fraction of a turn. Running example: $U = P(2\\pi\\tau)$ (Chapter Q4), $|u\\rangle = |1\\rangle$, $\\tau = ' + d(V.q18Tau, 3) + '$.',
    caption: 'the eigenvalue as one arrow of size 1 at 225° (arg z = 225°), the turn for τ = ' + d(V.q18Tau, 3),
    captionFormal: '$e^{i\\varphi}$ for $\\tau = ' + d(V.q18Tau, 3) + '$: the arrow of size 1 at $\\varphi = 225°$',
    stage: cp({ z: { r: 1, phiDeg: V.q18TauDeg }, show: ['arg'] }),
    claims: [
      claim('q18Tau', '$0{.}101_2 = \\tfrac12 + \\tfrac18 = 0.625$ of a turn', () => V.q18Tau === 0.625 && V.q18Tau === 1 / 2 + 1 / 8),
      claim('q18TauDeg', 'and $225°$ as an angle', () => close(V.q18TauDeg, 360 * V.q18Tau, 1e-9)),
    ],
  },
  {
    id: 'q18-kickback:b2',
    phase: 'books',
    text:
      'Put a control wire in $|+\\rangle$ and run controlled-$U$ on $|u\\rangle$. The target stays $|u\\rangle$. The turn lands on the control: its $|1\\rangle$ part gains the [[relative-phase|relative phase]] $e^{i\\varphi}$, so it becomes $(|0\\rangle + e^{i\\varphi}|1\\rangle)/\\sqrt2$. ' +
      'This is Chapter Q5’s [[qc-phase-kickback|phase kickback]], with any angle instead of a sign.',
    formal:
      '$(|0\\rangle + |1\\rangle)|u\\rangle/\\sqrt2 \\mapsto (|0\\rangle|u\\rangle + |1\\rangle U|u\\rangle)/\\sqrt2 = (|0\\rangle + e^{i\\varphi}|1\\rangle)|u\\rangle/\\sqrt2$: the eigenvalue becomes the control’s [[relative-phase|relative phase]], $225°$ here, and the target is untouched. ' +
      'Chapter Q5’s oracle was the case $e^{i\\varphi} = -1$.',
    caption: 'controlled-U on |+⟩|1⟩ (top) and the state after it (bottom): the |11⟩ bar’s dial has turned 225°, and the target still reads 1',
    captionFormal: 'the circuit after column 2 and its state: $|01\\rangle$ at phase $0$, $|11\\rangle$ at phase $225°$; the target is still $|1\\rangle$',
    stage: split(circ(C_K, 2), amp(C_K, 2, 'amplitude', { dials: true })),
    claims: [
      claim('q18KickTarget', 'afterwards the target wire still reads 1 with chance $1$', () => close(V.q18KickTarget, 1, 1e-9)),
      claim('q18KickPhase', 'and the control’s $|1\\rangle$ part has turned $225°$ relative to its $|0\\rangle$ part', () => close(V.q18KickPhase, V.q18TauDeg, 1e-9)),
    ],
    derivation: {
      result: '\\text{controlled-}U\\text{ on }|+\\rangle|u\\rangle = (|0\\rangle + e^{i\\varphi}|1\\rangle)|u\\rangle/\\sqrt2',
      ground: [
        {
          tex: '\\tfrac{|0\\rangle|u\\rangle + |1\\rangle|u\\rangle}{\\sqrt2}',
          why: 'A control in $|+\\rangle$ over $|u\\rangle$ is two branches: control 0 and control 1, each with the same $|u\\rangle$.',
          view: circ(C_K, 1),
          viewCaption: 'the control after its Hadamard: two branches',
        },
        {
          tex: '\\tfrac{|0\\rangle|u\\rangle + |1\\rangle e^{i\\varphi}|u\\rangle}{\\sqrt2}',
          why: 'Controlled-$U$ acts on the control-1 branch only, and there $U|u\\rangle = e^{i\\varphi}|u\\rangle$.',
          view: amp(C_K, 2, 'amplitude', { dials: true }),
          viewCaption: 'the |11⟩ dial at 225°',
        },
        {
          tex: '(|0\\rangle + |1\\rangle e^{i\\varphi})|u\\rangle/\\sqrt2 = (|0\\rangle + e^{i\\varphi}|1\\rangle)|u\\rangle/\\sqrt2',
          why: 'Factor out $|u\\rangle$. The number $e^{i\\varphi}$ now sits on the control, as one arrow of size 1.',
          view: cp({ z: { r: 1, phiDeg: V.q18TauDeg }, show: ['arg'] }),
          viewCaption: 'the eigenvalue arrow',
        },
      ],
      formal: [
        {
          tex: '\\tfrac{|0\\rangle|u\\rangle + |1\\rangle U|u\\rangle}{\\sqrt2}',
          why: 'Linearity: controlled-$U$ applies $U$ to the target in the control-1 branch only.',
          view: circ(C_K, 2),
        },
        {
          tex: '(|0\\rangle + e^{i\\varphi}|1\\rangle)|u\\rangle/\\sqrt2',
          why: 'Insert $U|u\\rangle = e^{i\\varphi}|u\\rangle$ and factor out $|u\\rangle$ (Bergou Eq. 7.37 for one wire).',
          view: amp(C_K, 2, 'amplitude', { dials: true }),
        },
      ],
    },
  },
  {
    id: 'q18-kickback:b3',
    phase: 'books',
    text:
      'Give three controls the powers $U^4$, $U^2$ and $U$. Doubling a turn shifts its binary digits left, and whole turns drop out (<<qc-f8-fractions|Unit F8.6>>). ' +
      'The controls turn $180°$, $90°$ and $225°$: exactly the wire turns of $U_F|101\\rangle$ in Unit 18.2.',
    formal:
      'Write $\\tau = 0{.}\\tau_1\\tau_2\\ldots$ in binary. Controlled-$U^{2^j}$ writes $e^{2\\pi i2^j\\tau}$, and $2^j\\tau$ keeps the digits after the $j$th: $0{.}\\tau_1\\tau_2\\tau_3$, $0{.}\\tau_2\\tau_3$, $0{.}\\tau_3$ on the wires taking $U$, $U^2$, $U^4$ (Fig. 7.6). ' +
      'Multiplied out, $2^{-m/2}\\bigotimes_j(|0\\rangle + e^{2\\pi i2^j\\tau}|1\\rangle) = 2^{-m/2}\\sum_y e^{2\\pi i\\tau y}|y\\rangle$ (Eq. 7.37), which is $U_F|a\\rangle$ when $\\tau = a/2^m$.',
    caption: 'after the controlled powers (top): the eight live bars of the four wires (bottom) have the dials of the transform of 101, the target being 1',
    captionFormal: 'the state after column 4: controls $= U_F|101\\rangle$, target $|1\\rangle$; dial phases $225°\\cdot y$',
    stage: split(circ(C_PE(TAU, 3), 4), amp(C_PE(TAU, 3), 4, 'amplitude', { dials: true })),
    claims: [
      claim('q18KickQ0', 'the top control, with $U^4$, turns $180°$', () => close(V.q18KickQ0, V.q18ProdTop, 1e-9)),
      claim('q18KickQ1', 'the middle control, with $U^2$, turns $90°$', () => close(V.q18KickQ1, V.q18ProdMid, 1e-9)),
      claim('q18KickQ2', 'the bottom control, with $U$, turns $225°$', () => close(V.q18KickQ2, V.q18ProdBot, 1e-9)),
      claim('q18KickIsQft', 'the controls then hold $U_F|101\\rangle$ (largest gap zero)', () => close(V.q18KickIsQft, 0, 1e-9)),
    ],
  },
  {
    id: 'q18-kickback:b4',
    phase: 'clue',
    text: 'Run the three controls with the target in $|+\\rangle$, which $U$ does more than turn. Then undo the QFT and read. What comes out?',
    formal: 'With the target $|+\\rangle = (|0\\rangle + |1\\rangle)/\\sqrt2$, apply the controlled powers and $U_F^{-1}$. What is the distribution of the reading?',
    caption: 'the circuit up to the controlled powers, with the target started in |+⟩',
    captionFormal: 'phase estimation of $U = P(2\\pi\\tau)$ with target $|+\\rangle$, cursor after column 4',
    stage: circ(C_PE(TAU, 3, '+'), 4),
    reveal: {
      text:
        '$|+\\rangle$ is half $|0\\rangle$, which $U$ leaves alone, and half $|1\\rangle$, which $U$ turns by $225°$. The controls carry both patterns. The reading is 000 or 101, each with chance $' + d(V.q18PlusHalf0, 1) + '$.',
      formal:
        '$|+\\rangle = \\sum_u c_u|u\\rangle$ mixes the eigenphases 0 and $' + d(V.q18Tau, 3) + '$ with weights $|c_u|^2 = \\tfrac12$, so the output is $(|000\\rangle|0\\rangle + |101\\rangle|1\\rangle)/\\sqrt2$: 000 or 101, each with probability $' + d(V.q18PlusHalf0, 1) + '$ (N&C pp. 224–225; Ex. 5.8 cited only). Unit 18.5 uses exactly this.',
      caption: 'the whole circuit with target |+⟩ (top) and the chances of the three control wires (bottom): 000 and 101, half each',
      captionFormal: 'the full circuit and $P(\\text{reading})$: $\\tfrac12$ at 000 and at 101',
      stage: split(circ(C_PE(TAU, 3, '+'), 11), ampK(C_PE(TAU, 3, '+'), 11, 3)),
      fidelity: ['qc-amp-keep-sum'],
      claims: [
        claim('q18PlusHalf0', 'the reading is 000 with chance $0.5$', () => close(V.q18PlusHalf0, 0.5, 1e-9)),
        claim('q18PlusHalf5', 'and 101 with chance $0.5$', () => close(V.q18PlusHalf5, 0.5, 1e-9) && close(V.q18PlusHalf0 + V.q18PlusHalf5, 1, 1e-9)),
      ],
    },
  },
]

/* ---------------------------------------------------------------------------------------------- */
/* q18-phase-est — Reading a phase digit by digit                                                    */
/* ---------------------------------------------------------------------------------------------- */

const phaseEst: Beat[] = [
  {
    id: 'q18-phase-est:b1',
    phase: 'books',
    text:
      '[[qc-phase-estimation|Phase estimation]] finishes the job: run the QFT backwards on the controls. For $\\tau = 0{.}101_2$ they hold $U_F|101\\rangle$, so undoing it leaves 101 for certain. ' +
      'Three digits of $\\tau$ are read straight off the wires.',
    formal:
      'Apply $U_F^{-1}$ (the QFT circuit reversed, $S \\to S^\\dagger$, $T \\to T^\\dagger$; N&C Ex. 5.5) to Eq. 7.37. For $\\tau = a/2^m$ it returns $|a\\rangle$ (Bergou p. 128; N&C Eqs. 5.21–5.22): ' +
      'the reading is 101 with probability 1, so $\\tau = 0{.}101_2$ exactly.',
    caption: 'the whole circuit for τ = ' + d(V.q18Tau, 3) + ' (top) and the chances of its first three wires (bottom): 101 with chance 1',
    captionFormal: 'phase estimation with $m = 3$ and $\\tau = ' + d(V.q18Tau, 3) + '$: all eleven columns, and $P(101) = 1$ on the counting wires',
    stage: split(circ(C_PE(TAU, 3), 11), ampK(C_PE(TAU, 3), 11, 3)),
    fidelity: ['qc-amp-keep-sum'],
    claims: [
      claim('q18PeExact', 'the reading is 101 with chance $1$', () => close(V.q18PeExact, 1, 1e-9)),
      claim('q18Tau', 'the running eigenphase is $0.625$ of a turn, $0{.}101_2$', () => V.q18Tau === 0.625),
    ],
    derivation: {
      result: 'U_F^{-1}\\,2^{-m/2}\\sum_y e^{2\\pi i a y/2^m}|y\\rangle = |a\\rangle',
      ground: [
        {
          tex: '2^{-m/2}\\sum_y e^{2\\pi i\\tau y}|y\\rangle',
          why: 'After the controlled powers the three controls hold this spread, with $\\tau y$ turns on the string $y$.',
          view: amp(C_PE(TAU, 3), 4, 'amplitude', { dials: true }),
          viewCaption: 'the controls after the kicks',
        },
        {
          tex: '2^{-m/2}\\sum_y e^{2\\pi i a y/2^m}|y\\rangle = U_F|a\\rangle',
          why: 'For $\\tau = 0{.}101_2$, that is $a/2^m$ with $a = 5$: the transform of 101.',
          view: circ(C_PE(TAU, 3), 4),
          viewCaption: 'the circuit at the kicks',
        },
        {
          tex: 'U_F^{-1}\\,2^{-m/2}\\sum_y e^{2\\pi i a y/2^m}|y\\rangle = |a\\rangle',
          why: 'Undoing the transform returns the number: the reading is 101.',
          view: ampK(C_PE(TAU, 3), 11, 3),
          viewCaption: 'the reading 101',
        },
      ],
      formal: [
        {
          tex: '2^{-m/2}\\sum_y e^{2\\pi i a y/2^m}|y\\rangle = U_F|a\\rangle',
          why: 'Eq. 7.37 with $\\tau = a/2^m$ is Eq. 7.34 with the right prefactor.',
          view: circ(C_PE(TAU, 3), 4),
        },
        {
          tex: 'U_F^{-1}\\,2^{-m/2}\\sum_y e^{2\\pi i a y/2^m}|y\\rangle = |a\\rangle',
          why: 'Apply $U_F^{-1}$: the counting wires read $a$ with probability 1.',
          view: ampK(C_PE(TAU, 3), 11, 3),
        },
      ],
    },
  },
  {
    id: 'q18-phase-est:b2',
    phase: 'books',
    text:
      'Most phases never end in binary. One third is $0{.}0101\\ldots_2$, which three wires cannot hold, so the reading spreads. ' +
      'The nearest answer, 011 (that is $' + d(V.q18Pe13Grid, 3) + '$), still has chance $' + d(V.q18Pe13Best, 4) + '$; the next, 010, has $' + d(V.q18Pe13Next, 4) + '$. The leftover $\\delta = \\tau - 3/8 = -' + d(V.q18Pe13Delta, 4) + '$ is the small gap to 011.',
    formal:
      'Write $\\tau = a/2^m + \\delta$ with $a$ the nearest $m$-bit integer, so $|\\delta| \\le 2^{-(m+1)}$ (Bergou p. 128). After $U_F^{-1}$ the string $x$ has amplitude $2^{-m}\\sum_y e^{2\\pi i(\\tau - x/2^m)y}$ (Eq. 7.38). ' +
      'For $\\tau = \\tfrac13$, $m = 3$: $a = 3$, $\\delta = -' + d(V.q18Pe13Delta, 4) + '$, $P(011) = ' + d(V.q18Pe13Best, 4) + '$ and $P(010) = ' + d(V.q18Pe13Next, 4) + '$.',
    caption: 'τ = 1/3 on three wires: the tallest bar is 011 at ' + d(V.q18Pe13Best, 4) + ', then 010 at ' + d(V.q18Pe13Next, 4) + ' (chances of the first three wires)',
    captionFormal: '$m = 3$, $\\tau = \\tfrac13$: $P(011) = ' + d(V.q18Pe13Best, 4) + '$, $P(010) = ' + d(V.q18Pe13Next, 4) + '$',
    stage: split(circ(C_PE(TAU_THIRD, 3), 11), ampK(C_PE(TAU_THIRD, 3), 11, 3)),
    fidelity: ['qc-amp-keep-sum'],
    claims: [
      claim('q18TauThird', 'one third of a turn is $0.3333$, between 0.25 and 0.375', () => close(V.q18TauThird, 1 / 3, 1e-12)),
      claim('q18Pe13Grid', 'the nearest three-bit fraction is $3/8 = 0.375$', () => close(V.q18Pe13Grid, 3 / 8, 1e-12) && V.q18Pe13a === 3),
      claim('q18Pe13Best', 'the reading 011 has chance $0.6878$', () => close(V.q18Pe13Best, 0.6878, 5e-5)),
      claim('q18Pe13Next', 'and 010 has $0.1749$', () => close(V.q18Pe13Next, 0.1749, 5e-5)),
      claim('q18Pe13Delta', 'the leftover is $-0.0417$ of a turn, below the grid point', () => 1 / 3 < 3 / 8 && close(V.q18Pe13Delta, 3 / 8 - 1 / 3, 1e-12)),
    ],
  },
  {
    id: 'q18-phase-est:b3',
    phase: 'books',
    text:
      'How bad can it get? The best answer’s amplitude is a chain of eight arrows, each turned a little more than the last (<<qc-f8-geometric|Unit F8.5>>). ' +
      'The worst case is halfway between two answers. Even there the chance is at least $4/\\pi^2$, about $' + d(V.q18FourOverPi2, 4) + '$.',
    formal:
      'The coefficient of $|a\\rangle$ is $2^{-m}(1 - e^{2\\pi i\\delta2^m})/(1 - e^{2\\pi i\\delta})$ (Eq. 7.39). With $2|\\theta|/\\pi \\le |1 - e^{i\\theta}| \\le |\\theta|$ (Eqs. 7.40–7.42) and $|2\\pi\\delta2^m| \\le \\pi$, ' +
      '$P(a) \\ge 4/\\pi^2 = ' + d(V.q18FourOverPi2, 4) + '$ (Eq. 7.43; Bergou rounds it to 0.4). The worst case $\\tau = 0{.}1011_2$ ties 101 and 110 at $' + d(V.q18PeWorst3, 4) + '$ each.',
    caption: 'eight arrows, each turned 22.5° more than the last (top); the best three-bit answer for every τ (bottom): 1 at each eighth, ' + d(V.q18PeWorst3, 4) + ' midway',
    captionFormal: 'eight arrows of size $' + d(V.q18Pe3Arrow, 3) + '$, each $22.5°$ further turned; $\\max_x P(x)$ for $m = 3$ against $\\tau$, with the line $4/\\pi^2$',
    stage: split(cp({ ...EIGHT_ARROWS() }), plot([V.q18Tau, V.q18TauEleven], { yLines: FOUR_OVER_PI2 })),
    claims: [
      claim('q18FourOverPi2', 'the floor $4/\\pi^2$ is $0.4053$ (Bergou rounds it to 0.4)', () => close(V.q18FourOverPi2, 4 / Math.PI ** 2, 1e-12) && V.q18PeWorst3 > V.q18FourOverPi2),
      claim('q18PeWorst3', 'the worst case on three wires is $0.4105$', () => close(V.q18PeWorst3, 0.4105, 5e-5) && close(V.q18PeTie, V.q18PeWorst3, 1e-9) && close(V.q18PeTieNext, V.q18PeWorst3, 1e-9)),
      claim('q18TauEleven', 'the worst-case phase $0{.}1011_2$ is $0.6875$ of a turn', () => close(V.q18TauEleven, 11 / 16, 1e-12)),
      claim('q18Pe3Arrow', 'each of the eight arrows has size $0.125$, and eight of them, 22.5° further turned each, add to a chain of squared length $0.4105$', () => {
        const re = Array.from({ length: 8 }, (_, t) => V.q18Pe3Arrow * Math.cos(22.5 * DEG * t)).reduce((a, b) => a + b, 0)
        const im = Array.from({ length: 8 }, (_, t) => V.q18Pe3Arrow * Math.sin(22.5 * DEG * t)).reduce((a, b) => a + b, 0)
        return close(8 * V.q18Pe3Arrow, 1, 1e-12) && close(re * re + im * im, V.q18PeWorst3, 1e-9)
      }),
    ],
    derivation: {
      result: 'P(a) \\ge 4/\\pi^2',
      ground: [
        {
          tex: '\\text{amplitude of } a = \\tfrac18\\sum_{y=0}^{7}e^{2\\pi i\\delta y}',
          why: 'The amplitude of the best answer is one eighth of eight arrows, each $360°\\delta$ further turned than the last.',
          view: cp({ ...EIGHT_ARROWS() }),
          viewCaption: 'eight arrows 22.5° apart',
        },
        {
          tex: '=\\tfrac18\\,\\tfrac{1 - e^{2\\pi i\\delta 8}}{1 - e^{2\\pi i\\delta}}',
          why: 'The chain is a geometric sum, which has a closed form (<<qc-f8-geometric|Unit F8.5>>).',
        },
        {
          tex: '\\tfrac{\\text{top}}{\\text{bottom}} \\ge \\tfrac{2}{\\pi}',
          why: 'The top chord is at least $2/\\pi$ of its arc, and the bottom chord is at most its arc. Their ratio is at least $2/\\pi$.',
        },
        {
          tex: 'P(a) \\ge 4/\\pi^2',
          why: 'Squaring the amplitude gives the chance: at least $4/\\pi^2$ for every phase.',
          view: plot([V.q18Tau, V.q18TauEleven], { yLines: FOUR_OVER_PI2 }),
          viewCaption: 'the best answer’s chance for every τ',
        },
      ],
      formal: [
        {
          tex: '2^{-m}\\,\\tfrac{1 - e^{2\\pi i\\delta2^m}}{1 - e^{2\\pi i\\delta}}',
          why: 'The coefficient of $|a\\rangle$ (Eq. 7.39), the geometric sum of the chain.',
          view: cp({ ...EIGHT_ARROWS() }),
        },
        {
          tex: '\\tfrac{2|\\theta|}{\\pi} \\le |1 - e^{i\\theta}| \\le |\\theta|',
          why: 'Apply Eqs. 7.40–7.42 to the numerator at $\\theta = 2\\pi\\delta2^m$ ($|\\theta| \\le \\pi$) and to the denominator at $\\theta = 2\\pi\\delta$.',
        },
        {
          tex: 'P(a) \\ge 4/\\pi^2',
          why: 'Square the bound (Eq. 7.43).',
          view: plot([V.q18Tau, V.q18TauEleven], { yLines: FOUR_OVER_PI2 }),
        },
      ],
    },
  },
  {
    id: 'q18-phase-est:b4',
    phase: 'books',
    text:
      'A fourth wire halves the step between answers. Now $\\tau = 0{.}1011_2$ fits, and four wires read 1011 for certain. ' +
      'Extra wires sharpen where the answer lands; the worst case still sits just above $4/\\pi^2$.',
    formal:
      'Each wire halves $2^{-m}$; the worst-case best-answer chance is $' + d(V.q18PeWorst3, 4) + '$, $' + d(V.q18PeWorst4, 4) + '$, $' + d(V.q18PeWorst5, 4) + '$ for $m = 3, 4, 5$, falling to $4/\\pi^2$. ' +
      'For $n$ correct bits with failure at most $\\varepsilon$, use $t = n + \\lceil\\log_2(2 + 1/(2\\varepsilon))\\rceil$ wires and accept answers within $2^{t-n} - 1$ steps (N&C Eq. 5.35, p. 224). ' +
      '$n = 3$, $\\varepsilon = ' + d(V.q18NcEps, 1) + '$ gives $t = ' + V.q18NcT + '$; $\\tau = \\tfrac13$ then lands within $' + d(V.q18NcRadius, 3) + '$ of a turn with chance $' + d(V.q18NcWithin, 3) + '$.',
    caption: 'τ = ' + d(V.q18TauEleven, 4) + ' on four wires (top, sixteen columns) and the chances of its first four wires (bottom): 1011 with chance 1',
    captionFormal: '$m = 4$, $\\tau = ' + d(V.q18TauEleven, 4) + '$: $P(1011) = 1$ on the counting wires',
    stage: split(circ(C_PE(TAU_ELEVEN, 4), 16), ampK(C_PE(TAU_ELEVEN, 4), 16, 4)),
    fidelity: ['qc-amp-keep-sum'],
    claims: [
      claim('q18Pe4Exact', 'four wires read 1011 with chance $1$', () => close(V.q18Pe4Exact, 1, 1e-9)),
      claim('q18PeWorst4', 'the worst case on four wires is $0.4066$', () => close(V.q18PeWorst4, 0.4066, 5e-5)),
      claim('q18PeWorst5', 'on five wires $0.4056$', () => close(V.q18PeWorst5, 0.4056, 5e-5) && V.q18PeWorst3 > V.q18PeWorst4 && V.q18PeWorst4 > V.q18PeWorst5),
      claim('q18NcT', 'three bits with failure at most $0.1$ need $t = 6$ wires', () => V.q18NcT === 6 && V.q18NcT === 3 + Math.ceil(Math.log2(2 + 1 / (2 * V.q18NcEps)))),
      claim('q18NcRadius', 'the accuracy asked for three bits is $0.125$ of a turn', () => close(V.q18NcRadius, 2 ** -3, 1e-12)),
      claim('q18NcWithin', 'and the chance of landing that close is $0.982$', () => close(V.q18NcWithin, 0.982, 5e-4)),
    ],
  },
  {
    id: 'q18-phase-est:b5',
    phase: 'clue',
    text: 'Keep adding wires for $\\tau = \\tfrac13$. Does the best answer ever become certain?',
    formal: 'How do $P(\\text{best})$ and $P(\\text{within one step})$ behave for $\\tau = \\tfrac13$ as $m$ grows?',
    caption: 'the best three-bit answer’s chance for every τ, with marks at ' + d(V.q18Tau, 3) + ', ' + d(V.q18TauEleven, 4) + ' and 1/3',
    captionFormal: '$\\max_x P(x)$ for $m = 3$ against $\\tau$, marked at $' + d(V.q18Tau, 3) + '$, $' + d(V.q18TauEleven, 4) + '$ and $\\tfrac13$',
    stage: plot([V.q18Tau, V.q18TauEleven, V.q18TauThird], { yLines: FOUR_OVER_PI2 }),
    claims: [claim('q18Tau', 'the first mark is at $0.625$, an exact eighth', () => V.q18Tau === 0.625), claim('q18TauThird', 'and the third is at one third, $0.3333$', () => close(V.q18TauThird, 1 / 3, 1e-12))],
    reveal: {
      text:
        'No. One third is $0{.}010101\\ldots$ in binary with no end, so a small miss always remains. The best answer stays near chance $' + d(V.q18Pe13Limit, 2) + '$: $' + d(V.q18Pe13Best, 4) + '$, then $' + d(V.q18Pe13m4, 4) + '$ with four wires. ' +
        'With three wires, landing within one step has chance $' + d(V.q18Pe13Near, 4) + '$.',
      formal:
        '$\\delta \\ne 0$ for every $m$, so $P(\\text{best})$ runs $' + d(V.q18Pe13Best, 4) + ', ' + d(V.q18Pe13m4, 4) + ', ' + d(V.q18Pe13m5, 4) + '$ for $m = 3, 4, 5$ toward $' + d(V.q18Pe13Limit, 4) + '$, and $P(|x - 2^m\\tau| \\le 1) = ' + d(V.q18Pe13Near, 4) + '$ at $m = 3$. ' +
        'The worst-case tails at $m = 8$, $P(\\text{off by more than } k \\text{ steps})$, are $' + d(V.q18Tail8k1, 3) + ', ' + d(V.q18Tail8k2, 3) + ', ' + d(V.q18Tail8k3, 3) + '$ for $k = 1, 2, 3$: each under Bergou’s $1/(2k-1)$ (p. 129).',
      caption: 'τ = 1/3 on four wires (top) and the chances of its first four wires (bottom): the tallest bar 0101 at ' + d(V.q18Pe13m4, 4) + ', then 0110 at ' + d(V.q18Pe13m4Next, 3),
      captionFormal: '$m = 4$, $\\tau = \\tfrac13$: $P(0101) = ' + d(V.q18Pe13m4, 4) + '$, $P(0110) = ' + d(V.q18Pe13m4Next, 3) + '$',
      stage: split(circ(C_PE(TAU_THIRD, 4), 16), ampK(C_PE(TAU_THIRD, 4), 16, 4)),
      fidelity: ['qc-amp-keep-sum'],
      claims: [
        claim('q18Pe13m4', 'on four wires the best reading, 0101, has chance $0.6849$', () => close(V.q18Pe13m4, 0.6849, 5e-5)),
        claim('q18Pe13m4Next', 'and the next, 0110, has $0.172$', () => close(V.q18Pe13m4Next, 0.172, 5e-4)),
        claim('q18Pe13m5', 'on five wires the best reading has chance $0.6842$', () => close(V.q18Pe13m5, 0.6842, 5e-5)),
        claim('q18Pe13Limit', 'and in the limit $0.6839$, which is $0.68$ to two places', () => close(V.q18Pe13Limit, 0.6839, 5e-5) && V.q18Pe13Best > V.q18Pe13m4 && V.q18Pe13m4 > V.q18Pe13m5 && V.q18Pe13m5 > V.q18Pe13Limit),
        claim('q18Pe13Near', 'on three wires the reading lands within one step with chance $0.8628$', () => close(V.q18Pe13Near, V.q18Pe13Best + V.q18Pe13Next, 1e-12) && close(V.q18Pe13Near, 0.8628, 5e-5)),
        claim('q18Tail8k1', 'the worst-case tail beyond one step at $m = 8$ is $0.189$, under Bergou’s bound $1/(2k-1)$', () => close(V.q18Tail8k1, 0.189, 5e-4) && V.q18Tail8k1 < 1 / (2 * 1 - 1)),
        claim('q18Tail8k2', 'beyond two steps $0.099$', () => close(V.q18Tail8k2, 0.099, 5e-4) && V.q18Tail8k2 < 1 / (2 * 2 - 1)),
        claim('q18Tail8k3', 'beyond three steps $0.067$', () => close(V.q18Tail8k3, 0.067, 5e-4) && V.q18Tail8k3 < 1 / (2 * 3 - 1)),
      ],
    },
  },
]

/* ---------------------------------------------------------------------------------------------- */
/* q18-counting — Counting marked items by Grover's turn                                             */
/* ---------------------------------------------------------------------------------------------- */

/** The step of Q on the plane as a table: a turn by 2α, i.e. Ry(4α) (a rotation by θ about y is the table [[cos θ/2, −sin θ/2], [sin θ/2, cos θ/2]]). */
const TURN_TABLE = (alphaDeg: number): MatrixGridState => mx({ gate: { name: 'Ry', params: [4 * alphaDeg] } })

const counting: Beat[] = [
  {
    id: 'q18-counting:b1',
    phase: 'books',
    text:
      'In Chapter Q17 one [[qc-grover-iterate|Grover step]] $Q$ turns the [[qc-grover-plane|Grover plane]] by $2\\alpha$. A turn has two special complex states $|\\alpha_\\pm\\rangle$ that it only multiplies, by $e^{\\pm2i\\alpha}$. ' +
      'For $N = 4$ with one marked item, $\\alpha = 30°$, so the turns are $\\pm60°$.',
    formal:
      'In the plane’s basis $|w_0\\rangle$, $|w_0^\\perp\\rangle$ (with $|w_0^\\perp\\rangle$ at right angles to $|w_0\\rangle$, on the side of $|x_0\\rangle$), $Q = \\begin{pmatrix}\\cos2\\alpha&-\\sin2\\alpha\\\\\\sin2\\alpha&\\cos2\\alpha\\end{pmatrix}$ (Bergou Eq. 7.44, p. 129). ' +
      'Its eigenvalues are $e^{\\pm2i\\alpha}$ and its eigenvectors $|\\alpha_\\pm\\rangle = (|w_0\\rangle \\mp i|w_0^\\perp\\rangle)/\\sqrt2$. For $N = 4$, $M = 1$ the eigenphases are $\\tau_\\pm = 1/6$ and $5/6$ of a turn.',
    caption: 'the table of one 60° step (top) and the Grover plane for four strings, one marked (bottom): the arcs α = 30° and 2α = 60°',
    captionFormal: 'the table of the turn by $2\\alpha$ (top), and the Grover plane for $N = 4$, $M = 1$, $k = 1$ (bottom): arcs $\\alpha = 30°$ and $2\\alpha = 60°$',
    stage: split(TURN_TABLE(V.q18CntAlpha), gp(2, 1, { arcs: ['alpha', 'step'] })),
    claims: [
      claim('q18CntAlpha', 'for four strings with one marked, $\\alpha = 30°$', () => close(V.q18CntAlpha, 30, 1e-9)),
      claim('q18CntTurn', 'so one step turns the arrow $60°$', () => close(V.q18CntTurn, 2 * V.q18CntAlpha, 1e-9)),
      claim('q18CntTau', 'the eigenphase $+60°$ is $\\tfrac16$ of a turn', () => close(V.q18CntTau, 1 / 6, 1e-12)),
      claim('q18CntTauMinus', 'and $-60°$ is $\\tfrac56$ of a turn', () => close(V.q18CntTauMinus, 5 / 6, 1e-12) && close(V.q18CntTau + V.q18CntTauMinus, 1, 1e-12)),
      claim('q18CntEig', '$Q|\\alpha_+\\rangle$ equals $e^{i60°}|\\alpha_+\\rangle$ (largest gap zero)', () => close(V.q18CntEig, 0, 1e-9)),
    ],
  },
  {
    id: 'q18-counting:b2',
    phase: 'books',
    text:
      'Bergou asks a sharper question: does the box mark anything at all? If nothing is marked, $Q$ leaves the start $|w_0\\rangle$ alone. Phase estimation of $Q$ on $|w_0\\rangle$ then reads 000 every time.',
    formal:
      'If $f \\equiv 0$ then $U_f = I$, and $Q = -U_{w_0}$, with $U_{w_0} = I - 2|w_0\\rangle\\langle w_0|$ from Chapter Q17, has $Q|w_0\\rangle = |w_0\\rangle$: eigenphase 0 (Bergou p. 129). Controlled-$Q^{2^j}$ on the target $|w_0\\rangle$ (two search wires, $N = 4$) with three controls reads 000 with probability 1.',
    caption: 'nothing marked: the whole counting circuit (top) and the chances of its three counting wires (bottom): 000 with chance 1',
    captionFormal: '$M = 0$, $m = 3$: $P(000) = 1$ on the counting wires',
    stage: split(circ(C_CNT([]), 11), ampK(C_CNT([]), 11, 3)),
    fidelity: ['qc-amp-keep-sum'],
    claims: [claim('q18Cnt0', 'with nothing marked the reading is 000 with chance $1$', () => close(V.q18Cnt0, 1, 1e-9))],
  },
  {
    id: 'q18-counting:b3',
    phase: 'books',
    text:
      'With marked items, $|w_0\\rangle$ is an even mix of the two special states. So a reading $a_\\pm$ points to one of the two turns, each half the time. Two marked of four gives $\\alpha = 45°$, a quarter turn each way: ' +
      'the reading is 010 or 110, with chance $' + d(V.q18Cnt2, 1) + '$ each.',
    formal:
      '$|w_0\\rangle = (|\\alpha_+\\rangle + |\\alpha_-\\rangle)/\\sqrt2$, so [[qc-quantum-counting|quantum counting]] outputs $(|a_+\\rangle|\\alpha_+\\rangle + |a_-\\rangle|\\alpha_-\\rangle)/\\sqrt2$ with $a_+/2^m \\approx \\alpha/\\pi$ and $a_-/2^m \\approx 1 - \\alpha/\\pi$ ' +
      '(Bergou p. 130 prints $\\alpha/2\\pi$: Correction box; N&C p. 262 writes $\\theta = 2\\alpha$). Here $M = 2$ is exact: 010 and 110, $' + d(V.q18Cnt2, 1) + '$ each.',
    caption: 'two of four marked: the whole counting circuit (top) and the chances of its counting wires (bottom): the readings 010 and 110, chance 0.5 each',
    captionFormal: '$M = 2$, $m = 3$: $P(010) = P(110) = ' + d(V.q18Cnt2, 1) + '$',
    stage: split(circ(C_CNT([1, 2]), 11), ampK(C_CNT([1, 2]), 11, 3)),
    fidelity: ['qc-amp-keep-sum'],
    claims: [
      claim('q18Cnt2', 'the reading 010 has chance $0.5$', () => close(V.q18Cnt2, 0.5, 1e-9)),
      claim('q18Cnt2b', 'and 110 has $0.5$', () => close(V.q18Cnt2b, 0.5, 1e-9) && close(V.q18Cnt2 + V.q18Cnt2b, 1, 1e-9)),
      claim('q18CntPrinted', 'the readings the printed $\\alpha/2\\pi$ points to, 001 and 111, have chance $0$', () => close(V.q18CntPrinted, 0, 1e-9)),
    ],
    derivation: {
      result: 'a_\\pm/2^m \\approx \\alpha/\\pi\\ \\text{and}\\ 1 - \\alpha/\\pi',
      ground: [
        {
          tex: 'Q\\ \\text{turns the plane by}\\ 2\\alpha = 90°',
          why: 'With two of four strings marked, $\\alpha = 45°$, so one step is a quarter turn of the plane.',
          view: gp(2, 1, { arcs: ['step'] }, 2),
          viewCaption: 'two of four marked: a 90° turn',
        },
        {
          tex: 'Q|\\alpha_\\pm\\rangle = e^{\\pm2i\\alpha}|\\alpha_\\pm\\rangle',
          why: 'The two special states only get multiplied, by $e^{+2i\\alpha}$ and $e^{-2i\\alpha}$. The start $|w_0\\rangle$ is half of each.',
          view: TURN_TABLE(45),
          viewCaption: 'the step’s table',
        },
        {
          tex: '2\\alpha/360° = \\alpha/\\pi\\ \\text{or}\\ 1 - \\alpha/\\pi',
          why: 'Phase estimation reads each turn as a fraction of a full turn: $2\\alpha$ out of $360°$ is $\\alpha/\\pi$, and $-2\\alpha$ is $1 - \\alpha/\\pi$.',
          view: circ(C_CNT([1, 2]), 11),
          viewCaption: 'the counting circuit',
        },
        {
          tex: 'a_\\pm/2^m \\approx \\alpha/\\pi\\ \\text{and}\\ 1 - \\alpha/\\pi',
          why: 'For $\\alpha = 45°$ these are a quarter and three quarters of eight places: the readings 010 and 110.',
          view: ampK(C_CNT([1, 2]), 11, 3),
          viewCaption: 'readings 010 and 110',
        },
      ],
      formal: [
        {
          tex: 'Q = R(2\\alpha),\\ Q|\\alpha_\\pm\\rangle = e^{\\pm2i\\alpha}|\\alpha_\\pm\\rangle',
          why: 'Eq. 7.44: the plane’s step is a rotation, with eigenvalues $e^{\\pm2i\\alpha}$.',
          view: TURN_TABLE(45),
        },
        {
          tex: '|w_0\\rangle = (|\\alpha_+\\rangle + |\\alpha_-\\rangle)/\\sqrt2',
          why: 'The start state is the equal mix of the two eigenvectors (Bergou p. 129).',
          view: gp(2, 1, { arcs: ['step'] }, 2),
        },
        {
          tex: 'a_\\pm/2^m \\approx \\alpha/\\pi\\ \\text{and}\\ 1 - \\alpha/\\pi',
          why: 'By linearity phase estimation reads each eigenphase $\\pm2\\alpha/2\\pi$ (mod 1), with chance ½ for each (N&C §6.3).',
          view: ampK(C_CNT([1, 2]), 11, 3),
        },
      ],
    },
  },
  {
    id: 'q18-counting:b4',
    phase: 'books',
    text:
      'The reading $a$ gives the angle back, $\\alpha = 180°\\cdot a/8$, and then $M = N\\sin^2\\alpha$. For one marked of four, the likeliest readings, 001 and 111, have chance $' + d(V.q18Cnt1Peak, 4) + '$ each. ' +
      'Both give $M \\approx ' + d(V.q18CntEst1, 3) + '$: rounded, one item.',
    formal:
      '$M = N\\sin^2(\\pi a/2^m)$: $a = 2$ gives $' + d(V.q18CntEst2, 0) + '$; $a = 1$ or $7$ gives $' + d(V.q18CntEst1, 4) + '$, because $\\tau_\\pm = 1/6, 5/6$ fall between the grid points ($P(001) = P(111) = ' + d(V.q18Cnt1Peak, 4) + '$). ' +
      'The error falls like $2^{-m}$ (N&C Eq. 6.33, p. 263, written for a search space of $2N$ strings).',
    caption: 'one of four marked: the whole counting circuit (top) and the chances of its counting wires (bottom): the tallest readings, 001 and 111, at ' + d(V.q18Cnt1Peak, 4) + ' each',
    captionFormal: '$M = 1$, $m = 3$: $P(001) = P(111) = ' + d(V.q18Cnt1Peak, 4) + '$',
    stage: split(circ(C_CNT([3]), 11), ampK(C_CNT([3]), 11, 3)),
    fidelity: ['qc-amp-keep-sum'],
    claims: [
      claim('q18Cnt1Peak', 'the readings 001 and 111 each have chance $0.3532$', () => close(V.q18Cnt1Peak, 0.3532, 5e-5) && close(V.q18Cnt1PeakB, V.q18Cnt1Peak, 1e-12)),
      claim('q18CntEst1', 'reading 1 or 7 gives $M = 0.586$', () => close(V.q18CntEst1, 0.586, 5e-4) && close(V.q18CntEst1, 4 * Math.sin(Math.PI / 8) ** 2, 1e-12)),
      claim('q18CntEst2', 'reading 2 gives $M = 2$', () => close(V.q18CntEst2, 2, 1e-12)),
      claim('q18CntTau', 'the eigenphases are $\\tfrac16$ of a turn', () => close(V.q18CntTau, 1 / 6, 1e-12)),
      claim('q18CntTauMinus', 'and $\\tfrac56$ of a turn', () => close(V.q18CntTauMinus, 5 / 6, 1e-12)),
    ],
  },
  {
    id: 'q18-counting:b5',
    phase: 'clue',
    text: 'One item of four is marked, and the reading is 000. Would you call the box empty? How often does that happen?',
    formal: 'For $N = 4$, $M = 1$, $m = 3$, what is $P(000)$, the chance of the wrong verdict “empty”?',
    caption: 'one of four marked: the whole counting circuit',
    captionFormal: '$M = 1$, $m = 3$: the circuit of Unit 18.5, cursor after the last column',
    stage: circ(C_CNT([3]), 11),
    reveal: {
      text:
        'You would, wrongly, with chance $' + d(V.q18CntFalseEmpty, 4) + '$: the turns of one sixth and five sixths leak a little onto 000. An empty box never reads anything else, so any other reading proves a mark. Repeating the run shrinks the risk.',
      formal:
        '$P(000 \\mid M = 1) = ' + d(V.q18CntFalseEmpty, 4) + '$. With $M = 0$ the reading is 000 surely, so “non-zero implies marked” never errs and “zero implies empty” errs with $' + d(V.q18CntFalseEmpty, 4) + '$ per run. ' +
        'Bergou takes $m > n/2$, since $\\alpha = O(2^{-n/2})$ (p. 129).',
      caption: 'one of four marked: the chances of the three counting wires; 000 still has chance 0.0469',
      captionFormal: '$M = 1$: $P(000) = ' + d(V.q18CntFalseEmpty, 4) + '$ on the counting wires',
      stage: ampK(C_CNT([3]), 11, 3),
      fidelity: ['qc-amp-keep-sum'],
      claims: [claim('q18CntFalseEmpty', 'with one item marked the reading is 000 with chance $0.0469$', () => close(V.q18CntFalseEmpty, 0.0469, 5e-5) && close(V.q18CntFalseEmpty, 3 / 64, 1e-12) && close(V.q18Cnt0, 1, 1e-9))],
    },
  },
]

/* ---------------------------------------------------------------------------------------------- */
/* q18-order — Order finding: the quantum step of factoring                                          */
/* ---------------------------------------------------------------------------------------------- */

const order: Beat[] = [
  {
    id: 'q18-order:b1',
    phase: 'books',
    introduces: ['qc-order-finding'],
    text:
      'Chapter F8 cracked 21 once it knew that 2 has order 6 mod 21 (<<qc-f8-euclid|Unit F8.2>>). Finding the [[qc-order-finding|order]] is the hard step. The gate $U_2$ multiplies by 2 mod 21. ' +
      'Its eigenstates $|u_s\\rangle$, for $s = 0$ to 5, have eigenphases $s/6$: sixth roots of unity (<<qc-f8-roots|Unit F8.3>>).',
    formal:
      '[[qc-order-finding|Order finding]] (N&C §5.3.1, pp. 226–227; Bergou p. 127 leaves Shor to other texts): for $\\gcd(x, N) = 1$, $U_x|y\\rangle = |xy \\bmod N\\rangle$ is unitary (Eq. 5.36), and ' +
      '$|u_s\\rangle = \\tfrac{1}{\\sqrt r}\\sum_k e^{-2\\pi isk/r}|x^k \\bmod N\\rangle$ has $U_x|u_s\\rangle = e^{2\\pi is/r}|u_s\\rangle$ (Eqs. 5.37–5.39). For $N = 21$, $x = 2$: $r = 6$.',
    caption: 'six arrows 60° apart on a clock of six marks: the eigenvalues of multiplying by 2 mod 21',
    captionFormal: 'the eigenvalues $e^{2\\pi is/6}$ of $U_2$ on a clock of six marks, $s = 0, \\ldots, 5$',
    stage: EIG6(),
    claims: [
      claim('q18Ord', 'the order of 2 mod 21 is $6$', () => V.q18Ord === 6 && V.q18OrdPhases === 6),
      claim('q18OrdEig', 'each $|u_s\\rangle$ is an eigenstate of $U_2$ with eigenphase $s/6$ (largest gap zero)', () => close(V.q18OrdEig, 0, 1e-9)),
    ],
    derivation: {
      result: 'U_2|u_s\\rangle = e^{2\\pi is/6}|u_s\\rangle',
      ground: [
        {
          tex: '1 \\to 2 \\to 4 \\to 8 \\to 16 \\to 11 \\to 1',
          why: 'Multiplying by 2 mod 21 walks round a cycle of 6 numbers on the clock of 21 marks (<<qc-f8-clock|Unit F8.1>>).',
          view: CLOCK21(),
          viewCaption: 'multiplying by 2 on a 21-mark clock',
        },
        {
          tex: 'U_2\\sum_k e^{-2\\pi isk/6}|2^k \\bmod 21\\rangle = e^{2\\pi is/6}\\sum_k e^{-2\\pi is(k+1)/6}|2^{k+1} \\bmod 21\\rangle',
          why: 'The state $|u_s\\rangle$ weights step $k$ of the cycle by $e^{-2\\pi isk/6}$. Multiplying by 2 moves every step along by one, which shifts each weight, and the state gains the factor $e^{2\\pi is/6}$.',
        },
        {
          tex: 'U_2|u_s\\rangle = e^{2\\pi is/6}|u_s\\rangle',
          why: 'There is one such state for each $s = 0$ to 5, so there are six eigenvalues, 60° apart.',
          view: EIG6(),
          viewCaption: 'six eigenvalues',
        },
      ],
      formal: [
        {
          tex: 'U_x\\,|u_s\\rangle = \\tfrac{1}{\\sqrt r}\\sum_k e^{-2\\pi isk/r}|x^{k+1} \\bmod N\\rangle',
          why: 'Eq. 5.38: $U_x$ sends $|x^k\\rangle$ to $|x^{k+1}\\rangle$, a shift $k \\to k + 1$ of the cycle.',
          view: CLOCK21(),
        },
        {
          tex: 'U_x|u_s\\rangle = e^{2\\pi is/r}|u_s\\rangle = e^{2\\pi is/6}|u_s\\rangle',
          why: 'Shifting the index by one in the sum gains $e^{2\\pi is/r}$, as $x^r \\equiv 1 \\pmod N$ closes the cycle (Eq. 5.39); here $x = 2$ and $r = 6$.',
          view: EIG6(),
        },
      ],
    },
  },
  {
    id: 'q18-order:b2',
    phase: 'books',
    text:
      'To use one eigenstate we would have to know $r$ already. But the plain number $|1\\rangle$ is an even mix of all six. So phase estimation reads some $s/6$ at random. ' +
      'With five wires the readings pile up at 0, 5, 11, 16, 21 and 27 of 32.',
    formal:
      '$\\sum_s|u_s\\rangle/\\sqrt r = |1\\rangle$ (N&C Eq. 5.44, p. 227), so phase estimation on $|1\\rangle$ estimates $s/r$ for a uniform $s$, with $t = 2L + 1 + \\lceil\\log_2(2 + 1/(2\\varepsilon))\\rceil$ wires, $L = 5$ for $N = 21$. ' +
      'At $t = 5$ the six peaks are the multiples of $2^t/r$ rounded: 0, 5, 11, 16, 21, 27.',
    caption: 'the six eigenvalues (top); the Fourier view of the comb 0, 6, …, 30, which is what the first register holds once the second reads 1 (bottom): six tall bars at 0, 5, 11, 16, 21 and 27',
    captionFormal: '$\\sum_s|u_s\\rangle/\\sqrt r = |1\\rangle$: the six eigenphases $s/6$, and the transform of the comb of step 6: peaks at 0, 5, 11, 16, 21, 27',
    stage: split(EIG6(), combFourier()),
    claims: [
      claim('q18OrdPeakA', 'the six tallest readings at five wires are 0, 5, 11, 16, 21 and 27', () => [V.q18OrdPeakA, V.q18OrdPeakB, V.q18OrdPeakC, V.q18OrdPeakD, V.q18OrdPeakE, V.q18OrdPeakF].join() === '0,5,11,16,21,27'),
      claim('q18OrdPeaksComb', 'and the comb’s transform has its six tall bars at the same places (zero difference)', () => V.q18OrdPeaksComb === 0),
      claim('q18OneIsSum', '$|1\\rangle$ equals the even mix of the six eigenstates (largest gap zero)', () => close(V.q18OneIsSum, 0, 1e-9)),
    ],
  },
  {
    id: 'q18-order:b3',
    phase: 'books',
    text:
      'A reading of 5 means $\\tau \\approx \\tfrac5{32}$. Its continued fraction gives $\\tfrac16$, so $r = 6$ (<<qc-f8-fractions|Unit F8.6>>). Then $\\gcd(2^3 \\pm 1, 21)$ gives the factors ' + V.q18OrdGcdMinus + ' and ' + V.q18OrdGcdPlus + '. ' +
      'Only the readings 5 and 27 work, so repeat a few times.',
    formal:
      'The convergent test (N&C pp. 229–230) returns $r = 6$ from $y \\in \\{5, 27\\}$; per run that succeeds with probability $' + d(V.q18OrdSuccess5, 4) + '$ at $t = 5$ and $' + d(V.q18OrdSuccess11, 4) + '$ at $t = 2L + 1 = 11$. ' +
      'Then $\\gcd(x^{r/2} \\pm 1, N) = ' + V.q18OrdGcdMinus + ', ' + V.q18OrdGcdPlus + '$ (N&C pp. 233–234; <<qc-f8-euclid|Unit F8.2>>).',
    caption: 'the reading 5 of 32 on a clock of 32 marks, a turn of 56.25°, beside the true sixth of a turn, 60° (top); the Fourier view of the comb (bottom): six peaks, of which 5 and 27 give the order',
    captionFormal: '$\\tau \\approx \\tfrac5{32}$ is $56.25°$ and $\\tfrac16$ is $60°$ (top); the transform of the comb of step 6 (bottom), peaks at 5 and 27 among the six',
    stage: split(cp(SPK([V.q18OrdRead5, V.q18OrdTrue], 32)), combFourier()),
    claims: [
      claim('q18OrdTauHat', 'the reading 5 of 32 is $\\tfrac5{32}$ of a turn', () => close(V.q18OrdTauHat, 5 / 32, 1e-12)),
      claim('q18OrdRead5', 'that is $56.25°$', () => close(V.q18OrdRead5, 360 * V.q18OrdTauHat, 1e-12)),
      claim('q18OrdSixth', 'the true eigenphase, $\\tfrac16$ of a turn, is $60°$', () => close(V.q18OrdSixth, 1 / 6, 1e-12) && close(V.q18OrdTrue, 360 * V.q18OrdSixth, 1e-9)),
      claim('q18OrdGoodA', 'only the readings 5 and 27 return the order', () => V.q18OrdGoodA === 5 && V.q18OrdGoodB === 27 && V.q18OrdGoodCount === 2),
      claim('q18OrdSuccess5', 'with five wires a run succeeds with chance $0.2295$', () => close(V.q18OrdSuccess5, 0.2295, 5e-5)),
      claim('q18OrdSuccess11', 'with eleven wires $0.3320$', () => close(V.q18OrdSuccess11, 0.332, 5e-5)),
      claim('q18OrdGcdMinus', '$\\gcd(2^3 - 1, 21) = 7$ and $\\gcd(2^3 + 1, 21) = 3$', () => V.q18OrdGcdMinus === 7 && V.q18OrdGcdPlus === 3 && V.q18OrdGcdMinus * V.q18OrdGcdPlus === 21),
    ],
  },
  {
    id: 'q18-order:b4',
    phase: 'books',
    text:
      'Simon’s string, the period of $2^x$ mod 21 and the order are one kind of puzzle: find the shifts that leave a function unchanged. Each yields to a Fourier transform plus a little classical algebra.',
    formal:
      'All are [[qc-hidden-subgroup|hidden subgroup problems]] (N&C §5.4.3, Fig. 5.5, pp. 241–242): Simon has $G = \\{0,1\\}^n$ with $K = \\{0, s\\}$; period finding and order finding have $K$ the multiples of $r$. ' +
      'The Fourier transform over $G$ samples labels $\\ell$ with $\\sum_{h\\in K}e^{-2\\pi i\\ell h/|G|} = |K|$ (Eq. 5.77), and classical algebra recovers $K$.',
    caption: 'Simon’s check 110 · 111 = 0 as rows of bits (top) beside the order-finding peaks (bottom)',
    captionFormal: 'the check $y \\cdot s = 0$ for $y = 111$, $s = 110$ (top); the peaks of the comb’s transform (bottom)',
    stage: split(br(['110', '111'], 'dot'), combFourier()),
    claims: [claim('q18Dot110x111', 'the check $110 \\cdot 111$ gives $0$, so 111 is in $s^\\perp$', () => V.q18Dot110x111 === 0)],
  },
  {
    id: 'q18-order:b5',
    phase: 'clue',
    text: '$U_2$ twice multiplies by 4. How many different turns does it have, and what is the order of 4 mod 21?',
    formal: 'What are the eigenphases of $U_x^2 = U_{x^2}$, and how do they match $\\mathrm{ord}(4) \\bmod 21$?',
    caption: 'the six eigenvalues of U₂ on a clock of six marks',
    captionFormal: 'the eigenvalues $e^{2\\pi is/6}$ of $U_2$',
    stage: EIG6(),
    reveal: {
      text:
        'Three. Doubling each of the six turns lands on only three, and 4 has order 3 mod 21: 4, 16, 1. Phase estimation needs exactly these powers, built by repeated squaring.',
      formal:
        '$U_x^2|u_s\\rangle = e^{2\\pi i\\,2s/6}|u_s\\rangle$ takes three distinct values, matching $\\mathrm{ord}(4) = 3$. The controlled-$U^{2^j}$ come from repeated squaring mod $N$ (modular exponentiation, N&C Box 5.2, p. 228), $O(L^3)$ gates in all.',
      caption: 'the turns of U₂ twice on the same clock: only 0°, 120° and 240° are left',
      captionFormal: 'the eigenvalues $e^{2\\pi i\\,2s/6}$ of $U_2^2 = U_4$: three marks, $0°, 120°, 240°$',
      stage: cp({ ...SPK([0, 120, 240], 6) }),
      claims: [
        claim('q18U2Distinct', 'doubling the six turns leaves $3$ different ones', () => V.q18U2Distinct === 3),
        claim('q18Ord4', 'and 4 has order $3$ mod 21', () => V.q18Ord4 === 3 && V.q18Ord4 === V.q18U2Distinct),
      ],
    },
  },
]

export const Q18_STORY: Record<string, Beat[]> = {
  'q18-simon': simon,
  'q18-qft': qft,
  'q18-kickback': kickback,
  'q18-phase-est': phaseEst,
  'q18-counting': counting,
  'q18-order': order,
}

/** Every claim used anywhere in a unit's beats, for Unit.claims (content.test.tsx "claims hold"). */
function allClaims(beats: Beat[]) {
  return beats.flatMap((b) => [...(b.claims ?? []), ...(b.reveal?.claims ?? []), ...(b.derivation?.ground.flatMap((s) => s.claims ?? []) ?? []), ...(b.derivation?.formal?.flatMap((s) => s.claims ?? []) ?? [])])
}
export const Q18_UNIT_CLAIMS_BY_ID: Record<string, ReturnType<typeof allClaims>> = Object.fromEntries(Object.entries(Q18_STORY).map(([id, beats]) => [id, allClaims(beats)]))
