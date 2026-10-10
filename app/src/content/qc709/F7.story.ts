/**
 * Chapter F7 scroll story (Physics 709; roles P + W), both tracks over one stage. Beats per docs/roles/proposals/P-F7-story.md §1–§2, with the
 * judge's rulings (docs/roles/decisions/qc709-F7F8.md, qc709-foundations.md). F7 is the ground-up owner of classical bits: Boolean functions as
 * truth tables, reversibility as a bijection, permutation matrices, Landauer and uncomputation, XOR as addition mod 2, GF(2) and its linear
 * algebra, and cost counting. The Q chapters keep their inline teaching; F7 only supplies the places they link to.
 *
 * Rules kept here: an F chapter has no lecture notes, so its own line is phase 'core', then 'books', then the clue. `text` is the Ground-up track
 * (sentences ≤ 25 words), `formal` the Formal track (≤ 40). Bit strings print q0 first = most significant (engine C2). Every number in the prose comes
 * from F7.values.ts through a keyed claim; a string a claim names is stored as the number it spells (110 is 6). No TeX command outside `$…$`.
 *
 * Build notes against the plan (reported to the orchestrator):
 * - Nothing here draws two `bits` views in one `split` (a layout never repeats a kind, validated): AND's arrows beside CNOT's are ONE `bits` state with
 *   `fn.versus`, and n² beside 2ⁿ is ONE `plot` with `curve.vs`; the Simon table of gf2:b4 is the last view of its derivation, the beat's own picture
 *   being the row reduction.
 * - gf2:b3 (the check matrix) is phase 'core', not 'books': the phases of a unit must run core → books → clue, and the row reduction (b4) is 'core'.
 * - The field is written $\mathrm{GF}(2)$ throughout (the symbol lint rejects \mathbb); the sign map of xor:b3 is χ (σ and φ are taken); the name of
 *   Q5's `qc-parity` (agree = +1) is not reused, since F7's parity is "an odd number of 1s".
 * - Cross-references to other chapters are in words ("Chapter Q16"); a Foundations unit in this course is a bridge chip `<<id|Unit F6.1>>`, never a
 *   bare "Unit F6.1" (the number reader would take 6.1 for a result).
 * - The plan's "Unit F8.3" is not named (F8 is built in parallel; its unit numbers are not settled).
 */
import type { Circuit } from '../../physics/qc/circuit'
import type { BitsGate } from '../../physics/qc/bits'
import type { AmplitudesState, Beat, BitsSource, BitsState, CircuitStageState, MatrixGridState, PlotState, StageLayout, StageState } from '../schema'
import { C_AND3, C_CLEAN, C_GARB, C_TOF, C_TOF2, M_7, ROWS_DEP, ROWS_Y, T_BAL3, T_SIM, V, WORD_RX, claim, close } from './F7.values'

/* ---------------------------------------------------------------------------------------------- */
/* Stage shorthand (plan "Stage shorthand"), as plain builder functions                              */
/* ---------------------------------------------------------------------------------------------- */
const G = (gate: BitsGate): BitsSource => ({ gate })
const TAB = (table: number[], n: number, m: number): BitsSource => ({ table, n, m })
/** bm: a truth table or a map of a gate or table. */
const bm = (source: BitsSource, view: 'table' | 'map', extra: Partial<Omit<NonNullable<BitsState['fn']>, 'source' | 'view'>> = {}): BitsState => ({ kind: 'bits', fn: { source, view, ...extra }, shot: 'B-BITS' })
/** br: rows of strings, optionally with a computed row (xor, dot) or checked against a word. */
const br = (strings: string[], extra: Partial<NonNullable<BitsState['rows']>> = {}): BitsState => ({ kind: 'bits', rows: { strings, ...extra }, shot: 'B-BITS' })
/** bx: the elimination of a matrix over GF(2), after `upTo` moves. */
const bx = (strings: string[], upTo: number): BitsState => ({ kind: 'bits', reduce: { strings, upTo }, shot: 'B-BITS' })
const circ = (C: Circuit, upTo: number): CircuitStageState => ({ kind: 'circuit', circuit: C, upTo, shot: 'Q-WIRES' })
const amp = (C: Circuit, upTo: number, mode: AmplitudesState['mode'] = 'probability'): AmplitudesState => ({ kind: 'amplitudes', state: { circuit: C, upTo }, mode, shot: 'A-BARS' })
const signs = (terms: string): AmplitudesState => ({ kind: 'amplitudes', state: { terms }, mode: 'signed', shot: 'A-BARS' })
const mx = (gate: 'Toffoli'): MatrixGridState => ({ kind: 'matrix', source: { gate: { name: gate } }, labels: 'kets', values: 'none', shot: 'M-GRID' })
const plot = (fn: PlotState['curve']['fn'], extra: Partial<Omit<PlotState, 'kind' | 'curve'>> & { vs?: PlotState['curve']['vs']; x?: { from: number; to: number } } = {}): PlotState => {
  const { vs, x, ...rest } = extra
  return { kind: 'plot', curve: { fn, ...(vs ? { vs } : {}), ...(x ? { x } : {}), samples: x ? x.to - x.from : 49 }, shot: 'P-CURVE', ...rest }
}
const split = (top: StageState, bottom: StageState): StageLayout => ({ layout: 'split', top, bottom })

/** The x range of the cost plots: 1 … 50 for the growths, 1 … 20 for the ratio and the query counts. */
const X50 = { from: 1, to: 50 }
const X20 = { from: 1, to: 20 }
const X4_20 = { from: 4, to: 20 }
const M50 = [{ x: 10, label: 'n = 10' }, { x: 30, label: 'n = 30' }, { x: 50, label: 'n = 50' }]

const ALL_PLUS = '000+001+010+011+100+101+110+111'
const SIGNS_110 = '000+001-010-011-100-101+110+111'

/* ---------------------------------------------------------------------------------------------- */
/* f7-boolean — Functions of bits as truth tables                                                    */
/* ---------------------------------------------------------------------------------------------- */

const boolean: Beat[] = [
  {
    id: 'f7-boolean:b1',
    phase: 'core',
    introduces: ['qc-boolean-function', 'qc-truth-table'],
    text:
      'A bit is 0 or 1, and a string of $n$ bits labels one of $2^n$ cases (<<qc-f6-pairs|Unit F6.1>>). ' +
      'A [[qc-boolean-function|Boolean function]] $f$ reads a string and returns one bit. ' +
      'Its [[qc-truth-table|truth table]] lists every input with its output. AND returns 1 only on 11.',
    formal:
      'A Boolean function is $f : \\{0,1\\}^n \\to \\{0,1\\}$, fixed by its [[qc-truth-table|truth table]] of $2^n$ rows (N&C §3.1.2, p. 129). ' +
      'For $n = 2$, AND, OR, XOR and NAND have the output columns 0001, 0111, 0110, 1110 (N&C pp. 130–131).',
    caption: 'AND as a table: four inputs, and a 1 in the output column only on the input 11',
    captionFormal: '$f : \\{0,1\\}^n \\to \\{0,1\\}$: AND’s table of $2^n = 4$ rows, with output column 0001',
    stage: bm(G('AND'), 'table'),
    fidelity: ['qc-bits-cells'],
    claims: [
      claim('f7AndCol', 'AND’s output column is 0001', () => V.f7AndCol === 0b0001),
      claim('f7OrCol', 'OR’s output column is 0111', () => V.f7OrCol === 0b0111),
      claim('f7XorCol', 'XOR’s output column is 0110', () => V.f7XorCol === 0b0110),
      claim('f7NandCol', 'NAND’s output column is 1110', () => V.f7NandCol === 0b1110),
      claim('f7AndOnes', 'AND has exactly one row with output 1', () => V.f7AndOnes === 1),
      claim('f7AndOnlyAt', 'AND’s one 1 is on the input 11, row 3 counting from 0', () => V.f7AndOnlyAt === 0b11),
    ],
  },
  {
    id: 'f7-boolean:b2',
    phase: 'core',
    text:
      'With $n$ input bits the table has $2^n$ rows, and every row’s output is a free choice. ' +
      'So there are $2^{2^n}$ functions: 4 for one bit, 16 for two, 256 for three.',
    formal:
      'There are $2^{2^n}$ Boolean functions of $n$ bits, one free output per row: 4, 16, 256 for $n = 1, 2, 3$. ' +
      'Chapter Q5’s four one-bit functions are the case $n = 1$.',
    caption: 'two input bits: 4 rows, each with a free output, so $2^4 = 16$ functions (OR is one of them)',
    captionFormal: '$n = 2$: $2^n = 4$ rows, $2^{2^n} = 16$ tables; OR is one',
    stage: bm(G('OR'), 'table'),
    claims: [
      claim('f7Funcs1', 'there are 4 functions of one bit', () => V.f7Funcs1 === 4),
      claim('f7Funcs2', 'there are 16 functions of two bits', () => V.f7Funcs2 === 16),
      claim('f7Funcs3', 'there are 256 functions of three bits', () => V.f7Funcs3 === 256),
    ],
    derivation: {
      result: '2^{2^n}',
      ground: [
        {
          tex: 'n = 1:\\quad 2^1 = 2 \\text{ rows}',
          why: 'One input bit has two cases, 0 and 1, so its table has two rows.',
          view: bm(G('NOT'), 'table'),
          viewCaption: 'NOT: two rows, 0 and 1',
        },
        {
          tex: '2 \\times 2 = 4 \\text{ tables}',
          why: 'Each row’s output is 0 or 1, chosen freely. Two rows with two choices each give 4 tables.',
        },
        {
          tex: 'n \\text{ bits: } 2^n \\text{ rows}',
          why: 'With $n$ bits there are $2^n$ cases. For three bits that is eight rows.',
          view: bm(TAB(T_BAL3, 3, 1), 'table'),
          viewCaption: 'three input bits: eight rows',
        },
        {
          tex: '2 \\times 2 \\times \\cdots \\times 2 = 2^{2^n}',
          why: 'Multiply one factor of 2 for each of the $2^n$ rows. The product is $2^{2^n}$: for three bits, 256.',
        },
      ],
      formal: [
        {
          tex: 'f \\mapsto \\big(f(x)\\big)_x \\in \\{0,1\\}^{2^n}',
          why: 'A function is fixed by its column of outputs, a string of $2^n$ bits, and every such string is a function.',
          view: bm(G('AND'), 'table'),
        },
        {
          tex: '\\#\\{f\\} = \\big|\\{0,1\\}^{2^n}\\big| = 2^{2^n}',
          why: 'A string of $2^n$ free bits can be chosen in $2^{2^n}$ ways: 4, 16, 256 for $n = 1, 2, 3$.',
          view: bm(TAB(T_BAL3, 3, 1), 'table'),
        },
      ],
    },
  },
  {
    id: 'f7-boolean:b3',
    phase: 'core',
    text:
      'Chapter Q5 sorted functions into [[qc-constant|constant]] and [[qc-balanced|balanced]]. ' +
      'For three bits, 2 are constant, 70 are balanced (about 27 % of the 256 tables), and the other 184 are neither. A promise to be one or the other is a strong promise.',
    formal:
      'Constant: 2 functions; balanced: $\\binom{2^n}{2^{n-1}}$, which is 70 for $n = 3$, a share of 0.27; the remaining 184 of the 256 are neither. ' +
      'Deutsch–Jozsa’s promise (Chapter Q16) excludes most functions.',
    caption: 'a balanced 3-bit table: four 1s and four 0s in the output column',
    captionFormal: 'a balanced $f$ on three bits: $\\binom{8}{4} = 70$ such tables, this one among them',
    stage: bm(TAB(T_BAL3, 3, 1), 'table'),
    claims: [
      claim('f7Const', 'two of the 3-bit functions are constant', () => V.f7Const === 2),
      claim('f7Balanced3', 'seventy of the 3-bit functions are balanced', () => V.f7Balanced3 === 70),
      claim('f7Neither3', '184 of the 3-bit functions are neither', () => V.f7Neither3 === 184),
      claim('f7Funcs3', 'the 3-bit functions number 256 in all', () => V.f7Funcs3 === 256 && V.f7Const + V.f7Balanced3 + V.f7Neither3 === V.f7Funcs3),
      claim('f7BalancedShare3', 'about 27 % of the 3-bit tables are balanced (70 of 256, a share of 0.27)', () => close(V.f7BalancedShare3, 0.27, 0.005)),
      claim('f7BalIs', 'the table shown is balanced', () => V.f7BalIs === 1),
      claim('f7BalOnes', 'the table shown has four 1s', () => V.f7BalOnes === 4),
    ],
  },
  {
    id: 'f7-boolean:b4',
    phase: 'books',
    introduces: ['qc-xor'],
    text:
      'NAND is AND followed by NOT. Wire NANDs together and you get NOT, AND and OR, so every table can be built. ' +
      'To add two bits $a$ and $b$, the sum bit is [[qc-xor|XOR]], written $a \\oplus b$, and the carry is AND.',
    formal:
      'NAND is universal: NOT $a$ = NAND$(a, a)$, AND = NOT NAND, OR$(a, b)$ = NAND(NOT $a$, NOT $b$) (N&C p. 133; N&C ⚑ Ex. 3.8). ' +
      'The half-adder outputs $a \\oplus b$ and the carry $ab$; $1 + 1$ gives sum 0, carry 1 (Fig. 3.5, p. 132).',
    caption: 'half-adder, sum bit: XOR is 1 when the bits differ, so $1 \\oplus 1 = 0$ and the carry 1 goes to AND',
    captionFormal: 'XOR’s table: sum $1 \\oplus 1 = 0$ with carry $1 \\cdot 1 = 1$',
    stage: bm(G('XOR'), 'table'),
    claims: [
      claim('f7NandUniversal', 'NOT, AND and OR each equal a NAND circuit on every input', () => V.f7NandUniversal === 1),
      claim('f7HalfSum11', 'the sum bit of 1 + 1 is 0', () => V.f7HalfSum11 === 0),
      claim('f7HalfCarry11', 'the carry of 1 + 1 is 1', () => V.f7HalfCarry11 === 1),
    ],
  },
  {
    id: 'f7-boolean:b5',
    phase: 'clue',
    text: 'Of the 16 two-bit functions, how many are balanced, and how many are neither constant nor balanced?',
    formal: 'Count the balanced and the neither-constant-nor-balanced functions for $n = 2$.',
    caption: 'XOR is one of the 16 two-bit tables',
    captionFormal: 'XOR: one of the $2^{2^2} = 16$ tables',
    stage: bm(G('XOR'), 'table'),
    reveal: {
      text:
        'Six are balanced: choose which 2 of the 4 rows say 1. Two are constant, so 8 are neither, half of all 16. AND is one of them: a single 1.',
      formal:
        '$\\binom42 = 6$ balanced, 2 constant, $16 - 6 - 2 = 8$ neither (AND, OR and NAND among them). Bits obey fixed tables; for atoms, “up OR right” depended on the order of the tests (<<qc-l1-logic|Spin Lab’s logic unit>>).',
      caption: 'AND: one 1 in four rows, so it is neither constant nor balanced',
      captionFormal: 'AND: one 1 among 4 rows, neither constant nor balanced',
      stage: bm(G('AND'), 'table'),
      claims: [
        claim('f7Balanced2', 'six of the 16 two-bit functions are balanced', () => V.f7Balanced2 === 6),
        claim('f7Neither2', 'eight of the 16 two-bit functions are neither', () => V.f7Neither2 === 8),
      ],
    },
  },
]

/* ---------------------------------------------------------------------------------------------- */
/* f7-reversible — Gates that can run backwards                                                      */
/* ---------------------------------------------------------------------------------------------- */

const AND_VS_CNOT = bm(G('AND'), 'map', { versus: G('CNOT') })

const reversible: Beat[] = [
  {
    id: 'f7-reversible:b1',
    phase: 'core',
    introduces: ['qc-reversible-gate'],
    text:
      'Can you run AND backwards? If it says 0, the input was 00, 01 or 10: three inputs, one answer. ' +
      'A [[qc-reversible-gate|reversible gate]] never merges, so each output comes from exactly one input. ' +
      '[[qc-cnot|CNOT]], which flips the second bit exactly when the first is 1, is reversible.',
    formal:
      'A gate is reversible when its output fixes its input: a bijection of bit strings (N&C §3.2.5, p. 153). ' +
      'AND sends 00, 01, 10 to 0, so it erases information; quantum gates are unitary, hence invertible, so AND has no quantum version (Bergou §1.2, p. 3).',
    caption: 'AND’s arrows: three of them meet at the output 0; CNOT’s arrows each reach a different output',
    captionFormal: 'reversible if and only if a bijection of strings: AND merges three inputs, CNOT merges none',
    stage: AND_VS_CNOT,
    fidelity: ['qc-bits-arrows'],
    claims: [
      claim('f7AndZeroPre', 'three inputs of AND give the output 0', () => V.f7AndZeroPre === 3),
      claim('f7CnotBij', 'CNOT is a bijection of the four strings', () => V.f7CnotBij === 1 && V.f7CnotMaxPre === 1),
    ],
    derivation: {
      result: '\\#\\{x : \\text{AND}(x) = 0\\} = 3',
      ground: [
        {
          tex: '\\text{AND}(00) = \\text{AND}(01) = \\text{AND}(10) = 0',
          why: 'List what AND outputs. The inputs 00, 01 and 10 all give 0.',
          view: bm(G('AND'), 'map'),
          viewCaption: 'AND: three arrows meet at 0',
        },
        {
          tex: '\\text{output } 0 \\text{ came from } 00, 01 \\text{ or } 10',
          why: 'Run backwards from the output 0 and you cannot tell which of the three inputs went in.',
        },
        {
          tex: '\\text{an undo gate would send } 0 \\text{ to three places}',
          why: 'An undo gate must give one input for each output, so it cannot send 0 back to three places at once.',
        },
        {
          tex: '\\#\\{x : \\text{AND}(x) = 0\\} = 3',
          why: 'So AND has no undo. In CNOT each output has one arrow into it, so CNOT can be undone.',
          view: AND_VS_CNOT,
          viewCaption: 'CNOT: one arrow into each output',
        },
      ],
      formal: [
        {
          tex: '\\text{AND}(00) = \\text{AND}(01) = \\text{AND}(10) = 0',
          why: 'Three inputs map to 0, so AND is not one-to-one and has no inverse map.',
          view: bm(G('AND'), 'map'),
        },
        {
          tex: '\\#\\{x : \\text{AND}(x) = 0\\} = 3',
          why: 'A unitary $U$ is invertible, with $U^{-1} = U^{\\dagger}$, so no unitary computes AND in place. CNOT is a bijection and does.',
          view: AND_VS_CNOT,
        },
      ],
    },
  },
  {
    id: 'f7-reversible:b2',
    phase: 'core',
    introduces: ['qc-permutation-matrix'],
    text:
      'A reversible gate on $n$ bits shuffles the $2^n$ strings. ' +
      'Written as a table of 0s and 1s, with one 1 in each row and column, it is a [[qc-permutation-matrix|permutation matrix]]. ' +
      'Only 24 of the 256 two-bit maps are reversible.',
    formal:
      'A reversible gate permutes $\\{0,1\\}^n$; its matrix $P$ has one 1 per row and column, so $P^{\\top}P = I$: a real unitary (<<qc-f4-unitary|Unit F4.4>>, <<qc-f3-matrix-of-map|Unit F3.2>>). ' +
      'Of the $4^4 = 256$ maps from two bits to two bits, $4! = 24$ are permutations.',
    caption: 'Toffoli as a table: one filled cell in every row and every column',
    captionFormal: 'the Toffoli permutation matrix $P$: one 1 in each row and column, and $P^{\\top}P = I$',
    stage: mx('Toffoli'),
    claims: [
      claim('f7Maps22', 'there are 256 maps from two bits to two bits', () => V.f7Maps22 === 256),
      claim('f7Perms22', 'of them 24 are reversible', () => V.f7Perms22 === 24),
      claim('f7TofUnitary', 'the Toffoli matrix satisfies PᵀP = I', () => close(V.f7TofUnitary, 0, 1e-12)),
    ],
  },
  {
    id: 'f7-reversible:b3',
    phase: 'core',
    text:
      'Any function can be made reversible: keep $x$ and add $f(x)$ to a spare bit $y$ with XOR. Doing it twice adds $f(x)$ twice, which cancels. ' +
      '[[qc-toffoli|Toffoli]] does this for AND: it keeps $a, b$ and adds $ab$, their AND, to a third bit.',
    formal:
      '$(x, y) \\mapsto (x, y \\oplus f(x))$ is its own inverse, hence a permutation (N&C Eq. 3.8, p. 158); Chapter Q5’s f-CNOT is its quantum form. ' +
      'Toffoli $(a, b, c) \\mapsto (a, b, c \\oplus ab)$ (Fig. 3.17, p. 159) gives AND at $c = 0$ and NAND at $c = 1$ (Fig. 3.18, p. 160).',
    caption: 'Toffoli on $|110\\rangle$: both controls are 1, so the third bit flips and the single bar sits on $|111\\rangle$',
    captionFormal: 'Toffoli: $|110\\rangle \\to |111\\rangle$, the one basis state with all the chance',
    stage: split(circ(C_TOF('110'), 1), amp(C_TOF('110'), 1)),
    claims: [
      claim('f7Tof110', 'Toffoli sends 110 to 111', () => V.f7Tof110 === 0b111),
      claim('f7TofAnd', 'at c = 0 the Toffoli output c is AND (column 0001)', () => V.f7TofAnd === 0b0001),
      claim('f7TofNand', 'at c = 1 the Toffoli output c is NAND (column 1110)', () => V.f7TofNand === 0b1110),
      claim('f7OracleSelfInv16', '(x, y) → (x, y ⊕ f(x)) undoes itself for all 16 two-bit f', () => V.f7OracleSelfInv16 === 1),
    ],
    derivation: {
      result: '\\big((x, y) \\mapsto (x, y \\oplus f(x))\\big)^2 = \\text{identity}',
      ground: [
        {
          tex: '|110\\rangle \\to |111\\rangle',
          why: 'Apply Toffoli once to 110. The two control bits are both 1, so the third bit flips: 110 becomes 111.',
          view: circ(C_TOF2('110'), 1),
          viewCaption: 'one Toffoli: 110 becomes 111',
        },
        {
          tex: 'c \\oplus ab \\oplus ab',
          why: 'Apply it a second time. The controls $a$ and $b$ did not change, so it adds the same bit $ab$ to $c$ again.',
        },
        {
          tex: 'ab \\oplus ab = 0',
          why: 'A bit added to itself gives 0, so the second Toffoli cancels the first. The strings go back: 111 returns to 110.',
          view: amp(C_TOF2('110'), 2),
          viewCaption: 'after two Toffolis the single bar is back on 110',
        },
        {
          tex: '\\big((x, y) \\mapsto (x, y \\oplus f(x))\\big)^2 = \\text{identity}',
          why: 'An undo exists, so no two strings share an output: the eight strings are only shuffled. The table has one 1 in each row and column.',
          view: mx('Toffoli'),
          viewCaption: 'the Toffoli table: a shuffle of 8 strings',
        },
      ],
      formal: [
        {
          tex: '(x, y) \\mapsto (x, y \\oplus f(x)) \\mapsto (x, y \\oplus f(x) \\oplus f(x)) = (x, y)',
          why: 'The first part $x$ is untouched, so the second application adds the same $f(x)$ again, and $f(x) \\oplus f(x) = 0$.',
          view: circ(C_TOF2('110'), 2),
        },
        {
          tex: '\\big((x, y) \\mapsto (x, y \\oplus f(x))\\big)^2 = \\text{identity}',
          why: 'A map that undoes itself is a bijection; its matrix is a permutation matrix, hence a real unitary.',
          view: mx('Toffoli'),
        },
      ],
    },
  },
  {
    id: 'f7-reversible:b4',
    phase: 'books',
    text:
      'Erasing a bit has a price. [[qc-landauer|Landauer’s principle]]: wiping one bit releases at least $k_BT\\ln 2$ of heat, with $k_B$ Boltzmann’s constant and $T$ the temperature. ' +
      'At 300 K, about room temperature, that is $2.87 \\times 10^{-21}$ joules.',
    formal:
      'Landauer: erasing one bit dissipates at least $k_BT\\ln 2$ (N&C §3.2.5, p. 153): $2.87 \\times 10^{-21}$ J $= 0.0179$ eV at $T = 300$ K. ' +
      'Reversible logic erases nothing, so no such floor applies to it (N&C p. 155).',
    caption: 'AND erases: three inputs become one output, and erasing one bit at 300 K costs at least $2.87 \\times 10^{-21}$ J',
    captionFormal: 'AND’s merge is the erasure: at least $2.87 \\times 10^{-21}$ J per bit at $T = 300$ K',
    stage: bm(G('AND'), 'map'),
    claims: [
      claim('f7Landauer300Mant', 'k_B T ln 2 at 300 K is 2.87 × 10⁻²¹ J', () => close(V.f7Landauer300Mant, 2.87, 0.005)),
      claim('f7Landauer300eV', 'k_B T ln 2 at 300 K is 0.0179 eV', () => close(V.f7Landauer300eV, 0.0179, 5e-5)),
    ],
  },
  {
    id: 'f7-reversible:b5',
    phase: 'books',
    text:
      'Bigger reversible circuits leave scraps on work bits. Take the AND of three bits $x_0, x_1, x_2$. ' +
      'Store $x_0x_1$ on a work wire $w$, write the answer on $y$, then undo the first step. That undoing is [[qc-uncompute|uncomputation]], and $w$ ends at 0 again.',
    formal:
      'A reversible circuit gives $(x, 0, 0) \\to (x, f(x), g(x))$ with garbage $g$; adding $f$ into $y$ and running the circuit backwards gives $(x, 0, 0, y) \\to (x, 0, 0, y \\oplus f(x))$ ([[qc-uncompute|uncomputation]], N&C Eqs. 3.7–3.8, p. 158). ' +
      'Here $|111\\,0\\,0\\rangle \\to |111\\,0\\,1\\rangle$; run on all eight inputs, it leaves $w = 0$ and $y = x_0x_1x_2$.',
    caption: 'three-bit AND on 1, 1, 1: after the last column the work wire is back at 0 and $y$ holds the answer 1',
    captionFormal: '$|11100\\rangle \\to |11101\\rangle$: $w$ returns to 0 and $y = 1$',
    stage: split(circ(C_AND3('11100'), 3), amp(C_AND3('11100'), 3)),
    claims: [
      claim('f7And3In11100', 'the three-bit AND takes 11100 to 11101', () => V.f7And3In11100 === 0b11101),
      claim('f7And3WorkMid', 'after the first column the work wire holds x₀x₁ = 1', () => V.f7And3WorkMid === 1),
      claim('f7And3WorkEnd', 'after the last column the work wire is 0', () => V.f7And3WorkEnd === 0),
      claim('f7And3CleanAll', 'for all eight inputs the work wire ends at 0 and y holds the AND', () => V.f7And3CleanAll === 1),
    ],
  },
  {
    id: 'f7-reversible:b6',
    phase: 'clue',
    text:
      'Quantum algorithms (Chapter Q5) send every input through at once, then let them interfere. ' +
      'If a work wire keeps a scrap of the input, can they still interfere perfectly? ' +
      'The test uses two mixing gates, labelled H, before and after (<<qc-q4-one-qubit-gates|Chapter Q4’s Hadamard gate>>).',
    formal:
      'With a column of two mixing gates $H$ before and after (<<qc-q4-one-qubit-gates|Chapter Q4’s Hadamard unit>>), does leaving $x_0x_1$ on the work wire change the chance of reading 00?',
    caption: 'the clean test: mixing gates, the Toffoli, the Toffoli again to wipe the work wire, mixing gates',
    captionFormal: 'two mixing gates, Toffoli onto $w$, Toffoli again, two mixing gates; $w$ starts and ends at 0',
    stage: circ(C_CLEAN, 4),
    reveal: {
      text:
        'No. In a test that should return 00 every time, a leftover AND bit drops the chance to $0.625$. Undo it first and the chance is 1 again. Garbage tells which input went in.',
      formal:
        'Clean: $P(00) = 1$. With garbage, the amplitudes of $|000\\rangle$ and $|001\\rangle$ are $3/4$ and $1/4$, so $P(00) = (3/4)^2 + (1/4)^2 = 0.5625 + 0.0625 = 0.625$. ' +
        'The work wire is then entangled with the inputs; their reduced state has purity $0.625$, a separate quantity (Chapter Q8’s purity).',
      caption: 'garbage left on $w$: the inputs read 00 with chance $0.5625 + 0.0625 = 0.625$',
      captionFormal: 'no wipe: $P(000) + P(001) = 0.5625 + 0.0625 = 0.625$',
      stage: split(circ(C_GARB, 3), amp(C_GARB, 3, 'probability')),
      claims: [
        claim('f7GarbageP00', 'with garbage the inputs read 00 with chance 0.625', () => close(V.f7GarbageP00, 0.625, 1e-9)),
        claim('f7GarbageP000', 'the chance of 000 is 0.5625', () => close(V.f7GarbageP000, 0.5625, 1e-9)),
        claim('f7GarbageP001', 'the chance of 001 is 0.0625', () => close(V.f7GarbageP001, 0.0625, 1e-9)),
        claim('f7GarbageAmp000', 'the amplitude of |000⟩ is 3/4', () => close(V.f7GarbageAmp000, 0.75, 1e-9)),
        claim('f7GarbageAmp001', 'the amplitude of |001⟩ is 1/4', () => close(V.f7GarbageAmp001, 0.25, 1e-9)),
        claim('f7CleanP00', 'with the work wire wiped the inputs read 00 with chance 1', () => close(V.f7CleanP00, 1, 1e-9)),
        claim('f7GarbagePurity', 'the inputs’ reduced state has purity 0.625', () => close(V.f7GarbagePurity, 0.625, 1e-9)),
      ],
    },
  },
]

/* ---------------------------------------------------------------------------------------------- */
/* f7-xor — XOR: adding bits without carrying                                                        */
/* ---------------------------------------------------------------------------------------------- */

const xorUnit: Beat[] = [
  {
    id: 'f7-xor:b1',
    phase: 'core',
    text:
      'XOR is adding without carrying: $1 \\oplus 1 = 0$. That is arithmetic mod 2: keep only the remainder after dividing by 2. ' +
      'So $a \\oplus a = 0$, and adding the same bit twice changes nothing.',
    formal:
      '$a \\oplus b = a + b \\bmod 2$, with $a \\oplus 0 = a$ and $a \\oplus a = 0$: every bit is its own inverse. ' +
      'Hence $y \\oplus f \\oplus f = y$ (the unit on reversible gates), and a one-time pad decodes (Chapter Q15).',
    caption: 'XOR’s table: $1 \\oplus 1 = 0$, add then drop the carry; the output column reads 0, 1, 1, 0',
    captionFormal: '$a \\oplus b$ for the four rows: output column 0110',
    stage: bm(G('XOR'), 'table'),
    claims: [claim('f7XorCol', 'XOR’s output column is 0110', () => V.f7XorCol === 0b0110)],
  },
  {
    id: 'f7-xor:b2',
    phase: 'core',
    text: 'XOR two strings place by place: $1011 \\oplus 0110 = 1101$. Each place is its own little sum. XOR with $0110$ again and $1011$ comes back.',
    formal:
      'On $\\{0,1\\}^n$, $x \\oplus z$ is bitwise addition mod 2 (Bergou §7.4, p. 126): $1011 \\oplus 0110 = 1101$ and $(x \\oplus k) \\oplus k = x$. ' +
      'Simon’s promise $f(x) = f(x \\oplus s)$ (Chapter Q18) is written in it.',
    caption: 'the strings 1011 and 0110 in two rows, and below them their XOR 1101, place by place',
    captionFormal: '$1011 \\oplus 0110 = 1101$, each place added mod 2',
    stage: br(['1011', '0110'], { combine: 'xor' }),
    claims: [
      claim('f7Xor1011With0110', '1011 ⊕ 0110 = 1101', () => V.f7Xor1011With0110 === 0b1101),
      claim('f7OtpBack', 'XOR with 0110 again returns 1011', () => V.f7OtpBack === 0b1011),
    ],
  },
  {
    id: 'f7-xor:b3',
    phase: 'core',
    text:
      'Turn bits into signs: 0 becomes $+1$ and 1 becomes $-1$, written $(-1)^a$. Then XOR becomes multiplying: $(-1)^{a \\oplus b} = (-1)^a(-1)^b$. ' +
      'Two minus signs make a plus, just as $1 \\oplus 1 = 0$.',
    formal:
      '$a \\mapsto (-1)^a$ turns $(\\{0,1\\}, \\oplus)$ into $(\\{\\pm1\\}, \\times)$: $(-1)^{a \\oplus b} = (-1)^a(-1)^b$, checked on all four cases. ' +
      'Chapter Q16’s Hadamard signs and Chapter Q7’s $\\pm1$ products rest on it.',
    caption: 'the sign of $a \\oplus b$ for 00, 01, 10, 11: plus, minus, minus, plus',
    captionFormal: '$(-1)^{a \\oplus b}$ for 00, 01, 10, 11: $+, -, -, +$',
    stage: signs('00-01-10+11'),
    claims: [claim('f7SignsMultiply', '(−1)^(a⊕b) = (−1)^a (−1)^b on all four rows', () => V.f7SignsMultiply === 1)],
    derivation: {
      result: '(-1)^{a \\oplus b} = (-1)^a(-1)^b',
      ground: [
        {
          tex: '0 \\oplus 0 = 0,\\ 0 \\oplus 1 = 1,\\ 1 \\oplus 0 = 1,\\ 1 \\oplus 1 = 0',
          why: 'List the four rows of XOR. The sum is 1 exactly when the two bits differ.',
          view: bm(G('XOR'), 'table'),
          viewCaption: 'XOR: four rows',
        },
        {
          tex: '(+1)(+1) = +1,\\ (+1)(-1) = -1,\\ (-1)(+1) = -1',
          why: 'Now multiply signs. A plus times a plus is a plus, and a plus times a minus is a minus.',
        },
        {
          tex: '(-1)(-1) = +1:\\quad (-1)^{a \\oplus b} = (-1)^a(-1)^b',
          why: 'A minus times a minus is a plus, matching $1 \\oplus 1 = 0$. All four rows agree.',
          view: signs('00-01-10+11'),
          viewCaption: 'signs of $a \\oplus b$: plus, minus, minus, plus',
        },
      ],
      formal: [
        {
          tex: '\\chi(a) = (-1)^a',
          why: 'Define $\\chi(a) = (-1)^a$, which sends 0 to $+1$ and 1 to $-1$.',
          view: bm(G('XOR'), 'table'),
        },
        {
          tex: '\\chi(a \\oplus b) = (-1)^{a \\oplus b} = (-1)^a(-1)^b',
          why: 'On the four cases, $\\chi$ turns $\\oplus$ into multiplication: $(+)(+) = +$, $(+)(-) = -$, $(-)(+) = -$, $(-)(-) = +$.',
          view: signs('00-01-10+11'),
        },
      ],
    },
  },
  {
    id: 'f7-xor:b4',
    phase: 'core',
    introduces: ['qc-bit-dot'],
    text:
      'The [[qc-bit-dot|bit dot product]] $a \\cdot x$ multiplies matching bits, adds them, and keeps the remainder mod 2. ' +
      'For $a = 110$ it asks whether the first two bits of $x$ hold an odd number of 1s: $110 \\cdot 011 = 1$ and $110 \\cdot 111 = 0$.',
    formal:
      '$a \\cdot x = \\sum_j a_jx_j \\bmod 2$ (Bergou Eqs. 7.1–7.2, p. 118), linear in $x$: $a \\cdot (x \\oplus z) = a \\cdot x \\oplus a \\cdot z$. ' +
      'For $a = 110$, $a \\cdot x = x_0 \\oplus x_1$.',
    caption: 'the strings 110 and 011: their AND is 010, which holds one 1, an odd number, so $110 \\cdot 011 = 1$',
    captionFormal: '$110 \\cdot 011$: the AND row 010 has weight 1, odd, so the dot product is 1',
    stage: br(['110', '011'], { combine: 'dot', names: ['a', 'x'] }),
    claims: [
      claim('f7Dot110With011', '110 · 011 = 1', () => V.f7Dot110With011 === 1),
      claim('f7Dot110With111', '110 · 111 = 0', () => V.f7Dot110With111 === 0),
    ],
  },
  {
    id: 'f7-xor:b5',
    phase: 'core',
    text:
      'Take $f(x) = 110 \\cdot x$. Flip the first bit of $x$ and $f$ flips too. The eight inputs pair up, one 0 and one 1 per pair: four of each, a share of ½. ' +
      'So the eight signs add to 0.',
    formal:
      'For $a \\ne 0$ pick $k$ with $a_k = 1$, and let $e_k$ be the string with a single 1 at $k$. $x \\mapsto x \\oplus e_k$ pairs the strings and flips $a \\cdot x$, so exactly ½ of the strings have $a \\cdot x = 1$ and $\\sum_x(-1)^{a\\cdot x} = 0$. ' +
      'Thus $a \\cdot x \\oplus b$ is balanced if and only if $a \\ne 0$ (all 16 cases, $n = 3$).',
    caption: 'the signs of $110 \\cdot x$ over the eight strings: four up and four down, so their mean is 0',
    captionFormal: '$(-1)^{110\\cdot x}$ for the eight $x$: $\\sum_x(-1)^{110\\cdot x} = 0$',
    stage: signs(SIGNS_110),
    claims: [
      claim('f7Count110', 'four of the eight strings have 110 · x = 1', () => V.f7Count110 === 4),
      claim('f7MinusShare110', 'so exactly half of the strings have 110 · x = 1', () => close(V.f7MinusShare110, 0.5, 1e-9)),
      claim('f7SignSum110', 'the eight signs (−1)^(110·x) add up to 0', () => V.f7SignSum110 === 0),
      claim('f7PairFlips', 'flipping the first bit of x flips 110 · x for every x', () => V.f7PairFlips === 1),
      claim('f7LinBalancedIff', 'a·x ⊕ b is balanced exactly when a ≠ 0, for all 16 pairs with n = 3', () => V.f7LinBalancedIff === 1),
    ],
    derivation: {
      result: '\\sum_x (-1)^{a \\cdot x} = 0',
      ground: [
        {
          tex: '110 \\cdot x = x_0 \\oplus x_1',
          why: 'The string $a = 110$ has a 1 in place 0, so flipping bit 0 of $x$ flips $110 \\cdot x$.',
          view: br(['110', '011'], { combine: 'dot', names: ['a', 'x'] }),
          viewCaption: '110 · 011 = 1',
        },
        {
          tex: 'x \\mapsto x \\oplus 100',
          why: 'Pair each $x$ with $x \\oplus 100$, the same string with its first bit flipped. For example 011 pairs with 111.',
          view: br(['011', '100'], { combine: 'xor', names: ['x', 'e'] }),
          viewCaption: '011 ⊕ 100 = 111: 011 pairs with 111',
        },
        {
          tex: '110 \\cdot (x \\oplus 100) = 110 \\cdot x \\oplus 1',
          why: 'Adding 100 flips exactly the dot product, so one member of each pair gives 0 and the other gives 1.',
        },
        {
          tex: '\\sum_x (-1)^{110 \\cdot x} = 4(+1) + 4(-1) = 0',
          why: 'Four pairs, each with one plus and one minus: the eight signs add to 0.',
          view: signs(SIGNS_110),
          viewCaption: 'four up, four down',
        },
      ],
      formal: [
        {
          tex: 'a \\cdot (x \\oplus e_k) = a \\cdot x \\oplus a_k = a \\cdot x \\oplus 1',
          why: 'The dot product is linear and $a_k = 1$, so adding $e_k$ flips it. The map $x \\mapsto x \\oplus e_k$ pairs the strings.',
          view: br(['011', '100'], { combine: 'xor', names: ['x', 'e'] }),
        },
        {
          tex: '\\sum_x (-1)^{a \\cdot x} = \\sum_{\\text{pairs}}\\big((-1)^u + (-1)^{u \\oplus 1}\\big) = 0',
          why: 'A fixed-point-free pairing that flips the sign: each pair adds to $(+1) + (-1) = 0$.',
          view: signs(SIGNS_110),
        },
      ],
    },
  },
  {
    id: 'f7-xor:b6',
    phase: 'clue',
    text: 'For $a = 000$, do the eight signs $(-1)^{a \\cdot x}$ also cancel?',
    formal: 'Evaluate $\\sum_x(-1)^{a\\cdot x}$ at $a = 0$.',
    caption: 'the signs of $110 \\cdot x$ again: four up and four down',
    captionFormal: 'the cancelling sum for $a = 110$',
    stage: signs(SIGNS_110),
    reveal: {
      text: 'No. Every $000 \\cdot x$ is 0, so all eight signs are $+1$ and they add to 8. Only $a = 000$ survives: Chapter Q16 builds Deutsch–Jozsa on this.',
      formal:
        '$\\sum_x(-1)^{a\\cdot x} = 2^n\\delta_{a,0}$: 8 at $a = 0$, else 0. This is Chapter Q16’s Walsh sum, and the case of one bit in the roots-of-unity sum of Chapter F8.',
      caption: '$a = 000$: all eight bars up, sum 8',
      captionFormal: '$a = 0$: eight plus signs, sum 8',
      stage: signs(ALL_PLUS),
      claims: [claim('f7SignSum000', 'for a = 000 the eight signs add up to 8', () => V.f7SignSum000 === 8)],
    },
  },
]

/* ---------------------------------------------------------------------------------------------- */
/* f7-gf2 — Linear algebra with only 0 and 1                                                         */
/* ---------------------------------------------------------------------------------------------- */

const gf2: Beat[] = [
  {
    id: 'f7-gf2:b1',
    phase: 'core',
    introduces: ['qc-gf2'],
    text:
      'Bit strings form a space of their own. Add them with XOR, and scale only by 0 or 1. This is [[qc-gf2|GF(2)]] arithmetic. ' +
      'Every string is its own negative, since $x \\oplus x = 0$: $101 \\oplus 011 = 110$.',
    formal:
      '$\\mathrm{GF}(2) = \\{0, 1\\}$ with $+ = \\oplus$ and $\\times$ = AND is a field; $\\mathrm{GF}(2)^n$ is an $n$-dimensional space with $2^n$ vectors and $-x = x$ ' +
      '(<<qc-f2-vectors|Unit F2.1>> with new scalars; Bergou §9.2, p. 170, works mod 2).',
    caption: 'two strings in GF(2): XOR adds them place by place, 101 ⊕ 011 = 110',
    captionFormal: '$\\mathrm{GF}(2)^3$ has 8 vectors; $101 \\oplus 011 = 110$',
    stage: br(['101', '011'], { combine: 'xor' }),
    claims: [claim('f7Xor101With011', '101 ⊕ 011 = 110', () => V.f7Xor101With011 === 0b110)],
  },
  {
    id: 'f7-gf2:b2',
    phase: 'core',
    introduces: ['qc-hamming-weight'],
    text:
      'The [[qc-hamming-weight|Hamming weight]] of a string counts its 1s. ' +
      'The [[qc-hamming-distance|Hamming distance]] of two strings counts the places where they differ: the weight of their XOR. $1011$ and $0110$ differ in 3 places.',
    formal:
      '$\\mathrm{wt}(x) = \\#\\{j : x_j = 1\\}$ and $d(x, z) = \\mathrm{wt}(x \\oplus z)$ (Bergou §9.2, p. 171). ' +
      '$d(1011, 0110) = \\mathrm{wt}(1101) = 3$.',
    caption: '1011 ⊕ 0110 = 1101 has three 1s, so the two strings are three places apart',
    captionFormal: '$d(1011, 0110) = \\mathrm{wt}(1101) = 3$',
    stage: br(['1011', '0110'], { combine: 'xor' }),
    claims: [
      claim('f7Wt1101', 'the string 1101 has weight 3', () => V.f7Wt1101 === 3),
      claim('f7Dist1011To0110', '1011 and 0110 are at distance 3', () => V.f7Dist1011To0110 === 3),
    ],
  },
  {
    id: 'f7-gf2:b3',
    phase: 'core',
    introduces: ['qc-parity-check'],
    text:
      'A [[qc-parity-check|parity check]] is a rule like “these bits must XOR to 0”. ' +
      'Three checks on seven bits can find any single flip. Their three answers spell the flipped place in binary, counting places 1 to 7 from the left. ' +
      'Seven bits carry four bits of data, a rate of 4/7, about 0.57.',
    formal:
      'A check matrix $M$ (Bergou’s $H$, not the Hadamard) accepts $c$ if and only if $Mc = 0$ over $\\mathrm{GF}(2)$; an error $e$ shows as the syndrome $Me$ (Bergou pp. 170–171). ' +
      'With column $j$ equal to $j$ in binary (the $[7,4]$ Hamming code, Chapter Q22, of rate $4/7 = 0.57$), a flip at place 6 reads 110.',
    caption: 'the word 1110010 against the three checks: they read 110, which is 6 in binary, the flipped place',
    captionFormal: '$M\\,1110010 = 110$: the flip of 1110000 at place 6',
    stage: br(M_7, { against: WORD_RX }),
    claims: [
      claim('f7HammingCodeword', 'the word 1110000 passes all three checks (syndrome 000)', () => V.f7HammingCodeword === 0),
      claim('f7Syndrome6', 'the received word 1110010 reads 110, that is 6', () => V.f7Syndrome6 === 0b110),
      claim('f7HammingAllFlips', 'a single flip at place j reads j in binary, for all seven places', () => V.f7HammingAllFlips === 1),
      claim('f7HammingN', 'the code has 7 bits', () => V.f7HammingN === 7),
      claim('f7HammingK', 'and 4 data bits', () => V.f7HammingK === 4),
      claim('f7HammingRate', 'so its rate is 4/7, about 0.57', () => close(V.f7HammingRate, 4 / 7, 1e-12)),
    ],
  },
  {
    id: 'f7-gf2:b4',
    phase: 'core',
    text:
      'Some machines hide a string $s$ by giving the same output for $x$ and $x \\oplus s$. Measurements then yield strings $y$ with $y \\cdot s = 0$. ' +
      'From $001$ and $111$, XOR-ing rows leaves one nonzero answer: $s = 110$.',
    formal:
      'Gaussian elimination works over $\\mathrm{GF}(2)$ with row swaps and row XORs. $\\begin{pmatrix}0&0&1\\\\1&1&1\\end{pmatrix}$ reduces to $\\begin{pmatrix}1&1&0\\\\0&0&1\\end{pmatrix}$: rank 2, null space $\\{000, 110\\}$. ' +
      'The four strings with $y \\cdot 110 = 0$ are 000, 001, 110, 111. Simon’s algorithm (Chapter Q18) ends this way.',
    caption: 'the checks 001 and 111, reduced: the rows 110 and 001 are left, and the null space is 000 and 110',
    captionFormal: 'rank 2 and null space $\\{000, 110\\}$ after the two moves',
    stage: bx(ROWS_Y, 2),
    fidelity: ['qc-bits-moves'],
    claims: [
      claim('f7ReduceMoves', 'the elimination of the two checks takes two moves', () => V.f7ReduceMoves === 2),
      claim('f7RankY', 'the two checks have rank 2', () => V.f7RankY === 2),
      claim('f7NullYVec', 'the nonzero null-space vector is 110', () => V.f7NullYVec === 0b110 && V.f7NullYSize === 2),
      claim('f7PerpOf110', 'four strings y have y · 110 = 0', () => V.f7PerpOf110 === 4),
      claim('f7SimonPeriod110', 'the table f(x) = f(x ⊕ 110) gives every output to exactly two inputs', () => V.f7SimonPeriod110 === 1),
    ],
    derivation: {
      result: 's = 110',
      ground: [
        {
          tex: '\\begin{pmatrix}0&0&1\\\\1&1&1\\end{pmatrix}',
          why: 'Write the two checks as rows. We look for every $s$ that gives 0 when each row is dotted with it.',
          view: bx(ROWS_Y, 0),
          viewCaption: 'the two checks as rows',
        },
        {
          tex: '\\begin{pmatrix}1&1&1\\\\0&0&1\\end{pmatrix}',
          why: 'Swap the rows so that a 1 leads the top row.',
          view: bx(ROWS_Y, 1),
          viewCaption: 'after the swap',
        },
        {
          tex: '\\begin{pmatrix}1&1&0\\\\0&0&1\\end{pmatrix}',
          why: 'XOR row 2 into row 1: 111 ⊕ 001 = 110. The rows are now 110 and 001.',
          view: bx(ROWS_Y, 2),
          viewCaption: 'after the XOR',
        },
        {
          tex: '110 \\cdot s = 0,\\ 001 \\cdot s = 0:\\quad s = 110',
          why: 'Row 2 says the last bit of $s$ is 0, and row 1 says the first two bits agree. So $s = 110$ (or 000).',
          view: bm(TAB(T_SIM, 3, 2), 'map', { mark: ['001', '111'] }),
          viewCaption: 'x and x ⊕ 110 share an output',
        },
      ],
      formal: [
        {
          tex: 'M = \\begin{pmatrix}0&0&1\\\\1&1&1\\end{pmatrix}',
          why: 'Eliminate over $\\mathrm{GF}(2)$ as over the reals, but with $1 \\oplus 1 = 0$. The null space is the set of $s$ with $Ms = 0$.',
          view: bx(ROWS_Y, 0),
        },
        {
          tex: '\\begin{pmatrix}1&1&0\\\\0&0&1\\end{pmatrix}',
          why: 'After a swap and one row XOR the pivots stand in columns 0 and 2, so the rank is 2.',
          view: bx(ROWS_Y, 2),
        },
        {
          tex: '\\ker M = \\{000, 110\\}, \\text{ so } s = 110',
          why: 'The free column 1 gives one basis vector, $s = 110$. It pairs $x$ with $x \\oplus s$ in the table.',
          view: bm(TAB(T_SIM, 3, 2), 'map', { mark: ['001', '111'] }),
        },
      ],
    },
  },
  {
    id: 'f7-gf2:b5',
    phase: 'clue',
    text: 'Are $110$, $011$ and $101$ independent: can none be built from the others?',
    formal: 'What is the rank of the rows 110, 011, 101 over $\\mathrm{GF}(2)$, and over the real numbers?',
    caption: 'the rows 110, 011 and 101 as three strings',
    captionFormal: 'the rows 110, 011, 101',
    stage: br(ROWS_DEP),
    reveal: {
      text: 'Not over bits: $110 \\oplus 011 = 101$. With ordinary numbers the same three rows are independent. In GF(2), $1 + 1 = 0$ creates new ties.',
      formal:
        '$\\mathrm{rank}_{\\mathrm{GF}(2)} = 2$; over the real numbers the determinant is 2, so the rank is 3. An even determinant vanishes mod 2: rank depends on the field.',
      caption: 'the elimination ends with a row of zeros: the three rows are tied, rank 2',
      captionFormal: 'the reduced rows have a zero row: $\\mathrm{rank} = 2$ over $\\mathrm{GF}(2)$',
      stage: bx(ROWS_DEP, 3),
      claims: [
        claim('f7RowsDepXor', '110 ⊕ 011 = 101', () => V.f7RowsDepXor === 0b101),
        claim('f7RankGF2Dep', 'over bits the three rows have rank 2', () => V.f7RankGF2Dep === 2),
        claim('f7DetRealDep', 'over the real numbers their determinant is 2', () => close(V.f7DetRealDep, 2, 1e-9)),
        claim('f7RankRealDep', 'so over the real numbers their rank is 3', () => V.f7RankRealDep === 3),
      ],
    },
  },
]

/* ---------------------------------------------------------------------------------------------- */
/* f7-cost — Counting the cost of a method                                                           */
/* ---------------------------------------------------------------------------------------------- */

const cost: Beat[] = [
  {
    id: 'f7-cost:b1',
    phase: 'core',
    text:
      'How long does a method take? Count its basic steps as the input grows. ' +
      'Sorting $n$ names by comparing every pair takes $n(n - 1)/2$ comparisons: 45 for 10 names, about half of $10^2$.',
    formal:
      'Cost counts basic operations as a function of the input size $n$ (N&C §3.2.1, p. 136); the pairwise compare-and-swap sort uses $n(n-1)/2$, 45 at $n = 10$ (p. 138). ' +
      'For a black box the cost is its number of [[qc-query|queries]] ([[qc-query-cost|query cost]]).',
    caption: 'the curve $n^2$ from $n = 1$ to 50, marked at $n = 10$ where it reads 100; doubling $n$ multiplies it by 4',
    captionFormal: '$n^2$: doubling $n$ gives four times the cost; at $n = 10$ it is 100, and the sort uses 45',
    stage: plot('nSquared', { x: X50, markers: [{ x: 10, label: 'n = 10' }] }),
    claims: [
      claim('f7Sort10', 'sorting 10 names pair by pair takes 45 comparisons', () => V.f7Sort10 === 45),
      claim('f7Sq10', 'n² at n = 10 is 100', () => V.f7Sq10 === 100),
      claim('f7SqDouble', 'doubling n multiplies n² by 4', () => V.f7SqDouble === 4),
    ],
  },
  {
    id: 'f7-cost:b2',
    phase: 'core',
    introduces: ['qc-big-o'],
    text:
      'For large $n$, constants and small terms stop mattering. [[qc-big-o|Big-O]] keeps only the growth: $3n^2 + 5n + 7$ is $O(n^2)$, because it stays below $4n^2$ from $n = 7$ on.',
    formal:
      '$f = O(g)$ if $f(n) \\le c\\,g(n)$ for all $n > n_0$ (N&C p. 136); $\\Omega$ and $\\Theta$ are the lower and two-sided versions (p. 137). ' +
      'With $c = 4$ and $n_0 = 6$: $3n^2 + 5n + 7 \\le 4n^2$ for $n \\ge 7$.',
    caption: 'the ratio $(3n^2 + 5n + 7)/n^2$ against the line at 4: above it at $n = 6$, below it from $n = 7$',
    captionFormal: '$f(n)/n^2$ crosses $c = 4$ between $n = 6$ and $n = 7$',
    stage: plot('bigORatio', { x: X4_20, yLines: [{ y: 4, label: '4' }], markers: [{ x: 6, label: 'n = 6' }, { x: 7, label: 'n = 7' }] }),
    claims: [claim('f7BigOn0', 'the bound 3n² + 5n + 7 ≤ 4n² holds from n = 7 on and fails at n = 6', () => V.f7BigOn0 === 7)],
    derivation: {
      result: 'n_0 = 7',
      ground: [
        {
          tex: '4n^2 - (3n^2 + 5n + 7) = n^2 - 5n - 7',
          why: 'The bound holds when this gap is at least 0. The picture shows the ratio; it must stay under the line at 4.',
          view: plot('bigORatio', { x: X4_20, yLines: [{ y: 4, label: '4' }], markers: [{ x: 6, label: 'n = 6' }, { x: 7, label: 'n = 7' }] }),
          viewCaption: 'the ratio crosses the line at 4 between 6 and 7',
        },
        {
          tex: 'n = 6:\\ 36 - 37 = -1, \\qquad n = 7:\\ 49 - 42 = 7',
          why: 'At $n = 6$ the gap is $-1$, so the bound fails. At $n = 7$ it is $7$, so the bound holds.',
        },
        {
          tex: 'n^2 \\text{ outgrows } 5n + 7:\\quad n_0 = 7',
          why: 'Beyond 7 the square grows faster than $5n + 7$, so the gap stays above 0 for good.',
          view: plot('nSquared', { x: X20 }),
          viewCaption: '$n^2$ keeps climbing faster and faster',
        },
      ],
      formal: [
        {
          tex: '\\frac{f(n)}{n^2} = 3 + \\frac{5}{n} + \\frac{7}{n^2}',
          why: 'Take $c = 4$: the ratio must stay at most 4. It falls as $n$ grows.',
          view: plot('bigORatio', { x: X4_20, yLines: [{ y: 4, label: '4' }], markers: [{ x: 6, label: 'n = 6' }, { x: 7, label: 'n = 7' }] }),
        },
        {
          tex: '3 + \\frac{5}{n} + \\frac{7}{n^2} \\le 4 \\text{ for } n \\ge n_0 = 7',
          why: 'This needs $5/n + 7/n^2 \\le 1$, first true at $n = 7$, so $f = O(n^2)$.',
          view: plot('nSquared', { x: X20 }),
        },
      ],
    },
  },
  {
    id: 'f7-cost:b3',
    phase: 'core',
    text:
      'Compare $n^2$ with $2^n$. At $n = 10$: 100 against 1024. At $n = 50$: 2500 against about $1.1 \\times 10^{15}$. ' +
      'Each extra bit doubles $2^n$ but adds only $2n + 1$ to $n^2$.',
    formal:
      'Polynomial cost $O(n^k)$ is called efficient, [[qc-exponential-cost|exponential]] cost is not (N&C pp. 138–139). ' +
      '$n \\to n + 1$ doubles $2^n$ but adds $2n + 1$ to $n^2$; at $n = 30$: 900 against $1.07 \\times 10^9$.',
    caption: 'both curves on a log axis: at $n = 50$ the dashed $n^2$ reads 2500 and $2^n$ reads about $1.1 \\times 10^{15}$',
    captionFormal: 'log axis, $n = 10, 30, 50$: $n^2 = 100, 900, 2500$ against $2^n = 1024$, $1.07 \\times 10^9$, $1.1 \\times 10^{15}$',
    stage: plot('twoToN', { vs: 'nSquared', x: X50, yScale: 'log', markers: M50 }),
    claims: [
      claim('f7Sq10', 'n² at n = 10 is 100', () => V.f7Sq10 === 100),
      claim('f7Exp10', '2ⁿ at n = 10 is 1024', () => V.f7Exp10 === 1024),
      claim('f7Sq30', 'n² at n = 30 is 900', () => V.f7Sq30 === 900),
      claim('f7Exp30Mant9', '2³⁰ is 1.07 × 10⁹', () => close(V.f7Exp30Mant9, 1.07, 0.005)),
      claim('f7Sq50', 'n² at n = 50 is 2500', () => V.f7Sq50 === 2500),
      claim('f7Exp50Mant15', '2⁵⁰ is about 1.1 × 10¹⁵', () => close(V.f7Exp50Mant15, 1.1, 0.05)),
      claim('f7Exp21over20', 'one more bit doubles 2ⁿ', () => V.f7Exp21over20 === 2),
      claim('f7Sq21minus20', 'n² grows by 2n + 1 = 41 from n = 20 to 21', () => V.f7Sq21minus20 === 41),
    ],
  },
  {
    id: 'f7-cost:b4',
    phase: 'books',
    text:
      'Quantum algorithms are judged by this yardstick. Deutsch–Jozsa answers in 1 query where a certain classical answer may need 513, at $n = 10$. ' +
      'Grover searches $2^{20}$ items in 804 steps, not about a million.',
    formal:
      'Query counts: DJ, 1 against $2^{n-1} + 1$ exact classical queries, 513 at $n = 10$ (Chapter Q16); search over $N = 2^{20}$: Grover’s $k^* = 804$ against $N - 1 = 1\\,048\\,575$ classical queries in the worst case (Chapter Q17).',
    caption: 'log axis up to $n = 20$: $2^n$ reaches 1048576, while $2^{n/2}$, the square-root curve, reaches 1024',
    captionFormal: '$n = 20$: $2^n = 1\\,048\\,576$ and $2^{n/2} = 1024$, the size of a square-root cost',
    stage: plot('twoToN', { vs: 'sqrtTwoToN', x: X20, yScale: 'log', markers: [{ x: 20, label: 'n = 20' }] }),
    claims: [
      claim('f7Dj10', 'the exact classical Deutsch–Jozsa cost at n = 10 is 513 queries', () => V.f7Dj10 === 513),
      claim('f7Grover2e20', 'Grover’s best number of steps for 2²⁰ items is 804', () => V.f7Grover2e20 === 804),
      claim('f7Classical2e20', 'a classical worst-case search of 2²⁰ items takes 1048575 queries', () => V.f7Classical2e20 === 1048575),
      claim('f7Exp20', '2²⁰ is 1048576', () => V.f7Exp20 === 1048576),
      claim('f7Sqrt2e20', '√(2²⁰) is 1024', () => V.f7Sqrt2e20 === 1024),
    ],
  },
  {
    id: 'f7-cost:b5',
    phase: 'clue',
    text: 'For $N = 2^n$ items, Grover needs about $\\sqrt N$ queries instead of $N$. Is that an exponential speed-up?',
    formal: 'Is $O(\\sqrt N)$ search exponentially faster in $n = \\log_2N$?',
    caption: '$2^n$ on a log axis: a straight line, the mark of exponential growth',
    captionFormal: '$2^n$ against $n$ on a log axis',
    stage: plot('twoToN', { x: X20, yScale: 'log', markers: [{ x: 20, label: 'n = 20' }] }),
    reveal: {
      text:
        'No. $\\sqrt{2^n} = 2^{n/2}$ still doubles with every two extra bits: it is still exponential. Grover’s gain is a square root. Deutsch–Jozsa’s gap is exponential only against a method that must never err.',
      formal:
        '$\\sqrt N = 2^{n/2}$ is exponential in $n$: a quadratic speed-up, optimal (Chapter Q17’s BBBV bound). Exponential gaps need structure (Q16 exact, Q18 Simon); the classes P, BPP, BQP are named in N&C p. 153.',
      caption: '$2^{n/2}$ beside $2^n$: both are straight lines on a log axis, the root curve half as steep',
      captionFormal: '$2^{n/2}$ against $2^n$: the same shape, half the slope on a log axis',
      stage: plot('sqrtTwoToN', { vs: 'twoToN', x: X20, yScale: 'log', markers: [{ x: 20, label: 'n = 20' }] }),
      claims: [claim('f7SqrtDoubles', '2^(n/2) doubles when n grows by 2', () => V.f7SqrtDoubles === 2)],
    },
  },
]

export const F7_STORY: Record<string, Beat[]> = {
  'f7-boolean': boolean,
  'f7-reversible': reversible,
  'f7-xor': xorUnit,
  'f7-gf2': gf2,
  'f7-cost': cost,
}

/** Every claim used anywhere in a unit's beats, for Unit.claims (content.test.tsx "claims hold"). */
function allClaims(beats: Beat[]) {
  return beats.flatMap((b) => [...(b.claims ?? []), ...(b.reveal?.claims ?? []), ...(b.derivation?.ground.flatMap((s) => s.claims ?? []) ?? []), ...(b.derivation?.formal?.flatMap((s) => s.claims ?? []) ?? [])])
}
export const F7_UNIT_CLAIMS_BY_ID: Record<string, ReturnType<typeof allClaims>> = Object.fromEntries(Object.entries(F7_STORY).map(([id, beats]) => [id, allClaims(beats)]))
