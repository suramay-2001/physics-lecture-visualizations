/**
 * Chapter Q22 scroll story (Physics 709; roles P + W): "Stabilizers, CSS codes and Gottesman–Knill". Beats per docs/roles/proposals/P-Q22-story.md §1, in both tracks, with the
 * judge's rulings (docs/roles/decisions/qc709-Q21Q22.md): the Pauli group is 𝒫ₙ (R3), H_X and H_Z are the CSS check matrices (R3), Bergou §9.2 sits here (R2), the four Bergou
 * slips are Correction boxes in Q22.ts (R6), and the code stage kind `code` (K1) is built (R4).
 *
 * Build notes against the plan (reported to the orchestrator):
 * - Phase `'books'` throughout (no 709 notes reach Chapters 9–10 of Bergou): ramp beats are `books`, the seven clues are `clue`, the one Go-deeper beat (the forward hook) is `deeper`.
 * - S1 (the matrix tableau `stabilizerOf`) was not built, so the authored fallback of the plan is used: `tableau` rows per column on three qubits, each row's eigenvalue checked
 *   on the page against the circuit's state (`state`), and the engine's tableau trace asserted equal to the authored rows in Q22.test.ts. The five-qubit bit-flip cycle (Unit 22.7)
 *   shows the helper readings in the amplitude bars instead of a tableau; the tableau itself is asserted in the test.
 * - The number reader takes digit strings around a point as decimals: no theorem numbers in prose (cited by printed page), no `\cdot` between bit strings (this chapter writes the
 *   dot of two bit rows as "share a place" and the symplectic product with transposes), and a nested gloss tag cannot hold TeX with double brackets ([[n,k,d]] sits beside its tag).
 * - Unit mentions inside Foundations are bridge chips `<<id|Unit F7.4>>`; the units of this chapter are named by number ("Unit 22.3").
 */
import type { Claim } from '../schema'
import type { Circuit } from '../../physics/qc/circuit'
import type { AmplitudesState, Beat, BitsRowsState, BitsState, CircuitStageState, CodeId, CodeState, MatrixGridState, MatrixSource, MatrixTableauState, PlotCurveName, PlotState, Scrub, StageLayout, StageState } from '../stage'
import { C_BF0_X2, C_ENC3, C_ENC_PF, C_MX, ENC_ROWS, FAILS_X, G_62, M_62, M_7, ROWS3_MOVES, V, claim, close, d } from './Q22.values'

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
const tb = (rows: readonly string[], extra: Partial<Omit<MatrixTableauState, 'kind' | 'tableau'>> = {}): MatrixTableauState => ({ kind: 'matrix', tableau: [...rows], shot: 'M-GRID', ...extra })
const mx = (source: MatrixSource, extra: Partial<Omit<MatrixGridState, 'kind' | 'source'>> = {}): MatrixGridState => ({ kind: 'matrix', source, labels: 'none', values: 'decimal', shot: 'M-GRID', ...extra })
const G = (name: 'H' | 'S' | 'T' | 'Tdg' | 'CNOT'): MatrixSource => ({ gate: { name } })
const pa = (letters: string): MatrixSource => ({ pauli: letters })
const bits = (b: Omit<BitsState, 'kind' | 'shot'>): BitsState => ({ kind: 'bits', shot: 'B-BITS', ...b })
const br = (strings: readonly string[], extra: Partial<BitsRowsState> = {}): BitsState => bits({ rows: { strings: [...strings], ...extra } })
const bx = (strings: readonly string[], upTo: Scrub): BitsState => bits({ reduce: { strings: [...strings], upTo } })
const code = (id: CodeId, extra: Partial<Omit<CodeState, 'kind' | 'code'>> = {}): CodeState => ({ kind: 'code', code: id, shot: 'CD-CODE', ...extra })
const pl = (fn: PlotCurveName, extra: Partial<Omit<PlotState, 'kind' | 'curve'>> = {}, curve: Omit<PlotState['curve'], 'fn'> = {}): PlotState => ({ kind: 'plot', curve: { fn, ...curve }, shot: 'P-CURVE', ...extra })
const split = (top: StageState, bottom: StageState): StageLayout => ({ layout: 'split', top, bottom })

/* ---------------------------------------------------------------------------------------------- */
/* q22-linear-codes — Classical codes from two matrices                                              */
/* ---------------------------------------------------------------------------------------------- */

const linear: Beat[] = [
  {
    id: 'q22-linear-codes:b1',
    phase: 'books',
    introduces: ['qc-generator-matrix'],
    text:
      `A linear code builds every word from a few basic words. The $[6, 2]$ code has two, 111000 and 000111. Write them side by side as columns: that table is the [[qc-generator-matrix|generator matrix]] $G$. ` +
      `Their XOR sums (<<qc-f7-gf2|Unit F7.4>>) give ${V.q22G62Words} code words, so 2 bits ride in 6: a rate of $${d(V.q22Rate62, 3)}$.`,
    formal:
      `An $[n, k]$ linear code is the column space of a [[qc-generator-matrix|generator matrix]] $G$ ($n \\times k$, independent columns over GF(2), <<qc-f7-gf2|Unit F7.4>>); data $v$ is sent as $Gv$ (Bergou p. 170, Eqs. 9.35–9.36; N&C p. 445). ` +
      `For $[6, 2]$ the words are 000000, 111000, 000111 and 111111, and the rate is $k/n = 1/3$.`,
    caption: 'the two basic words and their XOR, 111111',
    captionFormal: 'the columns of $G$ and their sum',
    stage: br(G_62, { combine: 'xor' }),
    claims: [
      claim('q22G62Words', 'the code has four words: 000000, 000111, 111000, 111111', () => V.q22G62Words === 4),
      claim('q22Rate62', 'the rate is $0.333$', () => close(V.q22Rate62, 1 / 3, 1e-12)),
    ],
  },
  {
    id: 'q22-linear-codes:b2',
    phase: 'books',
    text:
      `The same code is also the set of words passing four checks. Bits 1 and 2 agree; bits 1 and 3 agree; likewise in the second half. The table of checks is the check matrix $M$ (<<qc-f7-gf2|Unit F7.4>>). ` +
      `Each basic word passes all four, and only the ${V.q22Null62} code words do. Call the set of code words $C$.`,
    formal:
      `Equivalently $C = \\ker M$ for an $(n-k) \\times n$ check matrix $M$ with independent rows (Bergou’s $H$, Eq. 9.37; F7’s $M$), and $MG = 0$. ` +
      `For $[6, 2]$ the rows are 110000, 101000, 000110 and 000101, and their null space is exactly the four words.`,
    caption: 'the four checks against 111000: all read 0',
    captionFormal: 'the rows of $M$ against the word 111000: all four read 0',
    stage: br(M_62, { against: '111000' }),
    claims: [
      claim('q22MG62', 'the check matrix times the generator matrix is the zero matrix', () => V.q22MG62 === 0),
      claim('q22Null62', 'exactly four words pass all four checks', () => V.q22Null62 === 4),
    ],
  },
  {
    id: 'q22-linear-codes:b3',
    phase: 'books',
    introduces: ['qc-code-distance'],
    text:
      `The [[qc-code-distance|distance]] $d$ is the fewest places in which two code words differ. For $[6, 2]$, $d = ${V.q22D62}$. ` +
      `Then each single flip leaves its own syndrome: ${V.q22Syn62} different patterns for six places.`,
    formal:
      `The [[qc-code-distance|distance]] $d = \\min\\{\\mathrm{wt}(x) : x \\in C, x \\ne 0\\}$ equals the least distance between words, as $x + y \\in C$ (Bergou p. 171). ` +
      `If $d \\ge 2t + 1$, errors of weight at most $t$ have distinct syndromes. For $[6, 2]$, $d = ${V.q22D62}$, and the columns of $M$ (1100, 1000, 0100, 0011, 0010, 0001) differ.`,
    caption: 'the checks against a flip at place 4: they read 0011, column 4 of the check matrix',
    captionFormal: 'the rows of $M$ against $e = 000100$: the syndrome 0011 is column 4 of $M$',
    stage: br(M_62, { against: '000100' }),
    claims: [
      claim('q22D62', 'the distance of the $[6, 2]$ code is 3', () => V.q22D62 === 3),
      claim('q22Syn62', 'the six single flips leave six different syndromes', () => V.q22Syn62 === 6),
    ],
    derivation: {
      result: 'e_1 = e_2',
      ground: [
        {
          tex: 'M e_1 = M e_2',
          why: 'Suppose two errors of at most $t$ flips leave the same syndrome.',
          view: br(M_62, { against: '011000' }),
          viewCaption: 'two errors, one syndrome',
        },
        {
          tex: 'M(e_1 + e_2) = 0 \\Rightarrow e_1 + e_2 \\in C',
          why: 'Their sum passes every check, so it is a code word.',
          view: br(['011000', '100000'], { combine: 'xor' }),
          viewCaption: 'their sum is a word',
        },
        {
          tex: '\\mathrm{wt}(e_1 + e_2) \\le 2t < d \\Rightarrow e_1 = e_2',
          why: 'A nonzero word weighs at least $d$, so the sum is zero and the errors are equal.',
          view: br(M_62, { against: '000100' }),
          viewCaption: 'place 4’s column',
        },
      ],
      formal: [
        {
          tex: 'M e_1 = M e_2 \\Rightarrow e_1 + e_2 \\in C',
          why: 'Equal syndromes put the sum of the errors in the code.',
          view: br(M_62, { against: '011000' }),
          viewCaption: 'two errors, one syndrome',
        },
        {
          tex: '\\mathrm{wt}(e_1 + e_2) \\le 2t < d \\Rightarrow e_1 = e_2',
          why: 'The sum is too light to be a nonzero word, so it is zero.',
          view: br(['011000', '100000'], { combine: 'xor' }),
          viewCaption: 'their sum is a word',
        },
      ],
    },
  },
  {
    id: 'q22-linear-codes:b4',
    phase: 'books',
    introduces: ['qc-dual-code'],
    text:
      `Swap roles: the checks of one code are the basic words of another, its [[qc-dual-code|dual]]. F7’s Hamming code has ${V.q22HamWords} words; its dual keeps the ${V.q22DualWords} of even weight. ` +
      `Every nonzero one has weight 4, so the dual’s distance is ${V.q22DualD}.`,
    formal:
      `$MG = 0$ gives $G^{T}M^{T} = 0$: $M^{T}$ generates the [[qc-dual-code|dual code]] $C^\\perp$, an $[n, n-k]$ code, and $\\sum_{x \\in C}(-1)^{x^{T}y} = 2^k$ for $y \\in C^\\perp$, else 0 (Eqs. 9.38–9.40). ` +
      `For Hamming, $C^\\perp \\subset C$ is the set of even words, $d(C^\\perp) = ${V.q22DualD}$ and $d(C) = ${V.q22HamD}$ (Bergou p. 175 gives the dual distance 3: Correction box).`,
    caption: 'F7’s three Hamming checks: weight 4 each, sharing 2 places pairwise',
    captionFormal: 'the rows of $M_7$, the generators of $C^\\perp$',
    stage: br(M_7),
    claims: [
      claim('q22HamW3', 'the Hamming code has 7 words of weight 3 (and 7 of weight 4, 16 in all)', () => V.q22HamW3 === 7 && V.q22HamW4 === 7 && V.q22HamWords === 16),
      claim('q22DualD', 'the dual has 8 words and distance 4', () => V.q22DualWords === 8 && V.q22DualD === 4),
      claim('q22HamD', 'the Hamming code has distance 3', () => V.q22HamD === 3),
    ],
  },
  {
    id: 'q22-linear-codes:b5',
    phase: 'clue',
    text: 'The word 000000 suffers flips at places 2 and 3. What does the one-flip table do?',
    formal: 'Decode $e = 011000$ with the $[6, 2]$ single-flip lookup table. Which word comes out?',
    caption: 'the checks against the error 011000: they read 1100',
    captionFormal: 'the rows of $M$ against $e = 011000$: the syndrome 1100',
    stage: br(M_62, { against: '011000' }),
    reveal: {
      text: 'The checks read 1100, the pattern of place 1. The table flips place 1 and outputs 111000: a different, wrong code word. Distance 3 handles one flip, not two.',
      formal: `$M e = 1100 = M\\,100000$, so the decoder adds 100000 and returns 111000: a decoding error, since $\\mathrm{wt}(e) = 2 > t = 1$.`,
      caption: 'the error 011000 and the table’s fix 100000: together 111000, a code word',
      captionFormal: 'the error 011000 plus the fix 100000 is 111000, a word of weight 3',
      stage: br(['011000', '100000'], { combine: 'xor' }),
      claims: [
        claim('q22TwoFlip62', 'the table reads the syndrome 1100 as place 1', () => V.q22TwoFlip62 === 1),
        claim('q22Wrong62', 'and outputs 111000, a code word of weight 3', () => V.q22Wrong62 === 3),
      ],
    },
  },
]

/* ---------------------------------------------------------------------------------------------- */
/* q22-stabilizer — Naming states by the checks they pass                                            */
/* ---------------------------------------------------------------------------------------------- */

const stabilizer: Beat[] = [
  {
    id: 'q22-stabilizer:b1',
    phase: 'books',
    introduces: ['qc-pauli-group'],
    text:
      `Chapter Q6 named $\\Phi^+$ by two operators that leave it alone. Codes can be named the same way. ` +
      `The pieces are [[qc-pauli-string|Pauli strings]] with a sign: one [[qubit|qubit]] has ${V.q22G1} of them: $\\pm 1$ or $\\pm i$ times $I$, $X$, $Y$, $Z$.`,
    formal:
      `The [[qc-pauli-group|Pauli group]] of one [[qubit|qubit]] is $\\mathcal P_1 = \\{\\pm1, \\pm i\\} \\times \\{I, X, Y, Z\\}$, with ${V.q22G1} elements (Bergou’s $G_1$, Eq. 10.1), and $\\mathcal P_n$ holds its $n$-fold products; ` +
      `any two elements commute or anticommute (Bergou p. 179). A [[qc-stabilizer|stabilizer]] of $|\\psi\\rangle$ is an element with $g|\\psi\\rangle = |\\psi\\rangle$ (Chapter Q6). Rosetta: $\\mathcal P_n$ is the books’ $G_n$.`,
    caption: 'the product $XY$ as a Pauli row: $iZ$',
    captionFormal: 'the product $XY = iZ$ as a Pauli row',
    stage: tb(['X', 'Y'], { product: true }),
    claims: [
      claim('q22G1', 'the one-qubit Pauli group has 16 elements', () => V.q22G1 === 16),
      claim('q22XYisZ', 'the product $XY$ is $iZ$', () => close(V.q22XYisZ, 0, 1e-12)),
    ],
  },
  {
    id: 'q22-stabilizer:b2',
    phase: 'books',
    introduces: ['qc-stabilizer-group'],
    text:
      `Collect every Pauli string that leaves all code states alone. They form the [[qc-stabilizer-group|stabilizer group]] $S$. For the bit-flip code there are ${V.q22SBitflip}: $I$, $Z_1Z_2$, $Z_2Z_3$ and $Z_1Z_3$. ` +
      `Two generate the rest. The states all four fix are exactly the combinations of $|000\\rangle$ and $|111\\rangle$.`,
    formal:
      `A [[qc-stabilizer-group|stabilizer group]] $S \\subset \\mathcal P_n$ defines $V_S = \\{|\\psi\\rangle : g|\\psi\\rangle = |\\psi\\rangle\\ \\forall g \\in S\\}$. ` +
      `For $S = \\{I, Z_1Z_2, Z_1Z_3, Z_2Z_3\\} = \\langle Z_1Z_2, Z_2Z_3\\rangle$, $V_S = \\mathrm{span}\\{|000\\rangle, |111\\rangle\\}$, the code space of Chapter Q21 (Bergou pp. 179–180; N&C p. 455).`,
    caption: 'the two generators and their product $Z_1Z_3$, each reading +1 on the encoded state',
    captionFormal: 'the generators $Z_1Z_2$, $Z_2Z_3$ and their product $Z_1Z_3$, each with eigenvalue $+1$ on the encoded state',
    stage: tb(['ZZI', 'IZZ'], { product: true, state: { circuit: C_ENC3 } }),
    claims: [
      claim('q22SBitflip', 'the bit-flip code’s stabilizer group has four elements', () => V.q22SBitflip === 4),
      claim('q22VSdim', 'the projector onto the +1 space of both checks has trace 2', () => close(V.q22VSdim, 2, 1e-9)),
    ],
    derivation: {
      result: 'V_S = \\mathrm{span}\\{|000\\rangle, |111\\rangle\\}',
      ground: [
        {
          tex: 'Z_1Z_2 = +1 \\Rightarrow x_1 = x_2',
          why: 'A Z gives a minus sign on a 1, so a +1 reading means the two bits agree.',
          view: tb(['ZZI']),
          viewCaption: 'Z₁Z₂ alone',
        },
        {
          tex: 'Z_2Z_3 = +1 \\Rightarrow x_2 = x_3',
          why: 'The second check ties bit 3 to bit 2.',
          view: tb(['ZZI', 'IZZ'], { product: true, state: { circuit: C_ENC3 } }),
          viewCaption: 'both checks',
        },
        {
          tex: 'V_S = \\mathrm{span}\\{|000\\rangle, |111\\rangle\\}',
          why: 'All three bits agree, so the code space holds only 000 and 111 and their combinations.',
          view: code('rep3', { view: 'layout' }),
          viewCaption: 'the code space',
        },
      ],
      formal: [
        {
          tex: 'Z_1Z_2 = Z_2Z_3 = +1 \\Rightarrow x_1 = x_2 = x_3',
          why: 'Each eigenspace of a check keeps the strings where its two bits agree (Bergou p. 180).',
          view: tb(['ZZI']),
          viewCaption: 'Z₁Z₂ alone',
        },
        {
          tex: 'V_S = \\mathrm{span}\\{|000\\rangle, |111\\rangle\\}',
          why: 'The common eigenspace is the intersection, spanned by the two constant strings.',
          view: tb(['ZZI', 'IZZ'], { product: true, state: { circuit: C_ENC3 } }),
          viewCaption: 'both checks',
        },
      ],
    },
  },
  {
    id: 'q22-stabilizer:b3',
    phase: 'books',
    text:
      `Two rules keep $V_S$ from being empty. $-I$ is not allowed, since $-|\\psi\\rangle = |\\psi\\rangle$ forces $|\\psi\\rangle = 0$. And all members commute: if $gh = -hg$, the same argument gives zero again.`,
    formal:
      `$V_S \\ne \\{0\\}$ needs $-I \\notin S$ and $S$ abelian (Bergou p. 180; commuting checks share eigenstates, <<qc-l7-compatible|Lecture 7>>): $g_1g_2 = -g_2g_1$ would give $|\\psi\\rangle = -|\\psi\\rangle$. ` +
      `Hence each $g \\in S$ is Hermitian with $g^2 = I$, and $\\pm iI \\notin S$.`,
    caption: '$X_1$ against $Z_1Z_2$: they anticommute, so no state passes both',
    captionFormal: '$X_1$ and $Z_1Z_2$ anticommute, so no common $+1$ eigenstate exists',
    stage: tb(['XII', 'ZZI'], { product: true }),
    claims: [claim('q22AntiX1', 'the dense matrices of $X_1$ and $Z_1Z_2$ anticommute', () => V.q22AntiX1 === 1)],
  },
  {
    id: 'q22-stabilizer:b4',
    phase: 'books',
    text:
      `Each independent check keeps $\\tfrac12$ of what passed the earlier ones. So $r$ checks on $n$ qubits leave $2^{n-r}$ dimensions: $k = n - r$ stored qubits. ` +
      `Bit-flip code: $3 - 2 = ${V.q22KBitflip}$. Shor: $9 - 8 = ${V.q22KShor}$. A code defined by its checks like this is a [[qc-stabilizer-code|stabilizer code]].`,
    formal:
      `Each independent generator keeps $\\tfrac12$ of the space: $\\mathrm{tr}\\,\\tfrac{I + g}{2} = \\tfrac12\\,\\mathrm{tr}\\,I$. Theorem 2 (Bergou p. 181, proof pp. 184–186): $n - k$ independent commuting generators with $-I \\notin S$ give $\\dim V_S = 2^k$. ` +
      `The projectors $P_x = 2^{-(n-k)}\\prod_j(I + (-1)^{x_j}g_j)$ split the space into $2^{n-k}$ equal blocks, one per syndrome $x$ (Eqs. 10.16–10.22). $V_S$ is a [[qc-stabilizer-code|stabilizer code]].`,
    caption: 'Shor’s code: 8 checks on 9 qubits leave 1 stored qubit',
    captionFormal: 'the 8 generators of Shor’s code: $9 - 8 = 1$ stored qubit',
    stage: code('shor9', { view: 'checks' }),
    claims: [
      claim('q22HalfKept', 'one check $(I + Z_1Z_2)/2$ keeps half of the dimensions', () => close(V.q22HalfKept, 0.5, 1e-12)),
      claim('q22KBitflip', 'the bit-flip code stores 1 qubit', () => V.q22KBitflip === 1),
      claim('q22KShor', 'Shor’s code stores 1 qubit', () => V.q22KShor === 1),
      claim('q22TrP', 'the projector onto one syndrome block of the bit-flip code has trace 2', () => close(V.q22TrP, 2, 1e-9)),
    ],
    derivation: {
      result: '\\dim V_S = 2^{n-r}',
      ground: [
        {
          tex: '\\mathrm{tr}\\,\\tfrac{I + Z_1Z_2}{2} = \\tfrac12 \\times 2^3',
          why: 'The projector (I + g)/2 keeps the +1 half of the whole space.',
          view: tb(['ZZI']),
          viewCaption: 'half kept',
        },
        {
          tex: 'r \\text{ checks} \\Rightarrow 2^r \\text{ blocks}',
          why: 'The sign patterns of the r checks cut the space into blocks, one for each pattern.',
          view: code('rep3', { view: 'checks', errors: ['III', 'XII', 'IXI', 'IIX'] }),
          viewCaption: 'four blocks',
        },
        {
          tex: 'E P_0 E^\\dagger = P_x',
          why: 'An error E that flips one sign maps one block onto another, so the blocks are equal.',
          view: code('rep3', { error: 'X1', show: ['syndrome'] }),
          viewCaption: 'an error swaps blocks',
        },
        {
          tex: '\\dim V_S = \\tfrac{2^n}{2^r} = 2^{n-r}',
          why: 'The whole space of $2^n$ dimensions is cut into $2^r$ equal blocks.',
          view: code('shor9', { view: 'checks' }),
          viewCaption: 'Shor’s 8 checks',
        },
      ],
      formal: [
        {
          tex: 'P_x = 2^{-r}\\prod_j(I + (-1)^{x_j}g_j)',
          why: 'The projector onto one syndrome multiplies the single-check projectors (Eq. 10.16).',
          view: code('rep3', { view: 'checks', errors: ['III', 'XII', 'IXI', 'IIX'] }),
          viewCaption: 'four blocks',
        },
        {
          tex: '\\sum_x P_x = I',
          why: 'The blocks fill the whole space (Eqs. 10.17–10.19).',
        },
        {
          tex: 'g P_0 g^\\dagger = P_x \\Rightarrow \\dim V_S = 2^{n-r}',
          why: 'A suitable error carries the block of syndrome 0 onto any other, so all blocks have equal trace (Eqs. 10.21–10.22).',
          view: code('rep3', { error: 'X1', show: ['syndrome'] }),
          viewCaption: 'an error swaps blocks',
        },
      ],
    },
  },
  {
    id: 'q22-stabilizer:b5',
    phase: 'books',
    text:
      `Errors are Pauli strings too. An error that anticommutes with a check makes it read $-1$; one that commutes leaves $+1$. ` +
      `$X_2$ anticommutes with both checks: the same pair of readings, $(-1, -1)$, as in Bergou’s table of syndromes.`,
    formal:
      `If $Eg = -gE$ then $g(E|\\psi\\rangle) = -E|\\psi\\rangle$: the syndrome bit of $g$ is its commutation sign with $E$ (N&C p. 466). ` +
      `Measuring the generators reads the syndrome without touching what $V_S$ stores.`,
    caption: 'the error $X_2$ on the bit-flip code: both checks light',
    captionFormal: '$E = X_2$: both generators read $-1$',
    stage: code('rep3', { error: 'X2', show: ['syndrome'] }),
    fidelity: ['qc-code-lit'],
    claims: [claim('q22SynX2', '$X_2$ makes both checks read $-1$', () => V.q22SynX2 === 2)],
  },
  {
    id: 'q22-stabilizer:b6',
    phase: 'clue',
    text: 'Add $Z_1Z_3$ as a third check of the bit-flip code. Does it now store no qubit, since $3 - 3 = 0$?',
    formal: 'Is $\\{Z_1Z_2, Z_2Z_3, Z_1Z_3\\}$ independent? What is $\\dim V_S$?',
    caption: 'three checks, but the third is the product of the first two',
    captionFormal: 'the three generators $Z_1Z_2$, $Z_2Z_3$, $Z_1Z_3$',
    stage: tb(['ZZI', 'IZZ', 'ZIZ']),
    reveal: {
      text: 'No. $Z_1Z_3$ is the product of the other two, so it adds nothing. Only 2 checks are independent, and one qubit is still stored.',
      formal: '$Z_1Z_3 = (Z_1Z_2)(Z_2Z_3)$, so the set is dependent (Eq. 10.2): $r = 2$ and $\\dim V_S = 2$. Theorem 2 counts independent generators; Unit 22.3 tests independence by a rank.',
      caption: 'the product of the first two checks is the third',
      captionFormal: 'the product row of $Z_1Z_2$ and $Z_2Z_3$ is $Z_1Z_3$',
      stage: tb(['ZZI', 'IZZ'], { product: true }),
      claims: [claim('q22RankDep', 'the three checks have rank 2', () => V.q22RankDep === 2)],
    },
  },
]

/* ---------------------------------------------------------------------------------------------- */
/* q22-check-matrix — Pauli strings as bits                                                          */
/* ---------------------------------------------------------------------------------------------- */

const checkMatrix: Beat[] = [
  {
    id: 'q22-check-matrix:b1',
    phase: 'books',
    introduces: ['qc-check-matrix'],
    text:
      `Write each check as bits, an $X$ half $x$ and a $Z$ half $z$, so a row is $(x|z)$. Then $X$ is 1|0, $Z$ is 0|1 and $Y$ is 1|1. $Z_1Z_2$ becomes 000|110. The table of such rows is the [[qc-check-matrix|check matrix]]. ` +
      `Multiplying two checks XORs their rows; the sign is kept aside.`,
    formal:
      `The [[qc-check-matrix|check matrix]] has one row $r(g) = (x|z) \\in \\mathrm{GF}(2)^{2n}$ per generator (Bergou p. 180, Eq. 10.4; N&C p. 456), and $r(gg') = r(g) + r(g')$ up to phase (Eq. 10.3). ` +
      `For example $XY = iZ$ is $(1|0) + (1|1) = (0|1)$. The bit-flip code has rows 000|110 and 000|011.`,
    caption: 'the rows of $Z_1Z_2$ and $Z_2Z_3$ XOR to the row of $Z_1Z_3$, 000101',
    captionFormal: '$r(Z_1Z_2) + r(Z_2Z_3) = r(Z_1Z_3)$',
    stage: br(['000110', '000011'], { combine: 'xor' }),
    claims: [claim('q22RowSum', 'the XOR of the rows 000110 and 000011 is 000101', () => V.q22RowSum === 5)],
  },
  {
    id: 'q22-check-matrix:b2',
    phase: 'books',
    introduces: ['qc-symplectic-product'],
    text:
      `Do two checks commute? Compare them qubit by qubit: two different letters, neither $I$, clash. An even number of clashes means they commute. ` +
      `In bits: line one row up with the other row’s halves swapped and count the shared 1s. That count, kept mod 2, is the [[qc-symplectic-product|symplectic product]]. ` +
      `Write one row as $(x|z)$ and the other as $(x'|z')$. A superscript $T$ turns a row on its side, so the count is $x z'^{T} + z x'^{T}$.`,
    formal:
      `$g, g'$ commute iff the [[qc-symplectic-product|symplectic product]] $r(g)\\Lambda r(g')^{T} = x z'^{T} + z x'^{T}$ is 0, where $\\Lambda = \\begin{pmatrix}0&I\\\\I&0\\end{pmatrix}$ (Eq. 10.15; Bergou pp. 184–185). ` +
      `For $X_1$ against $Z_1Z_2$ the halves 100 and 110 share one place and the other halves none: the product is 1, so they anticommute.`,
    caption: '000110 beside 000100, the row of $X_1$ with its halves swapped: they share one place, so the checks anticommute',
    captionFormal: '$r(Z_1Z_2)$ against $r(X_1)$ with its halves swapped: one shared place',
    stage: br(['000110', '000100'], { combine: 'dot' }),
    claims: [
      claim('q22SympX1', 'the symplectic product of $X_1$ and $Z_1Z_2$ is 1', () => V.q22SympX1 === 1),
      claim('q22SympAll', 'the symplectic product and the dense commutator agree on all 256 pairs of two-qubit strings', () => V.q22SympAll === 0),
    ],
    derivation: {
      result: 'x z\'^{T} + z x\'^{T} = 0',
      ground: [
        {
          tex: 'XZ = -ZX',
          why: 'On one qubit, two different letters that are not I anticommute.',
          view: br(['10', '10'], { combine: 'dot' }),
          viewCaption: 'one clash',
        },
        {
          tex: 'X_1 \\text{ vs } Z_1Z_2: \\ 1 \\text{ clash} \\Rightarrow gg\' = -g\'g',
          why: 'Count the clashes qubit by qubit; one clash is an odd number, so the checks anticommute.',
          view: br(['000110', '000100'], { combine: 'dot' }),
          viewCaption: 'one clash',
        },
        {
          tex: 'X_1X_2 \\text{ vs } Z_1Z_2: \\ 2 \\text{ clashes} \\Rightarrow x z\'^{T} + z x\'^{T} = 0',
          why: 'Two clashes is an even number, so the checks commute.',
          view: br(['110000', '110000'], { combine: 'dot' }),
          viewCaption: 'two clashes',
        },
      ],
      formal: [
        {
          tex: 'x z\'^{T} + z x\'^{T} = \\sum_{j}(x_j z\'_j + z_j x\'_j)',
          why: 'Each qubit adds 1 exactly when its two letters clash.',
          view: br(['000110', '000100'], { combine: 'dot' }),
          viewCaption: 'one clash',
        },
        {
          tex: '\\sum_{j}(x_j z\'_j + z_j x\'_j) = 1 + 1 = 0',
          why: 'For X₁X₂ against Z₁Z₂ both qubits clash, and the sum is zero mod 2.',
          view: br(['110000', '110000'], { combine: 'dot' }),
          viewCaption: 'two clashes',
        },
      ],
    },
  },
  {
    id: 'q22-check-matrix:b3',
    phase: 'books',
    text:
      `Checks are independent exactly when their rows are, over bits. So $k = n - \\mathrm{rank}$, found by row moves (<<qc-f7-gf2|Unit F7.4>>). ` +
      `Shor’s ${V.q22RankShor} rows have rank ${V.q22RankShor}; the rows of $Z_1Z_2$, $Z_2Z_3$, $Z_1Z_3$ only rank ${V.q22Rank3}.`,
    formal:
      `Theorem 1 (Bergou p. 180, proof p. 181; N&C p. 457): commuting generators with $-I \\notin S$ are independent iff their rows are linearly independent over GF(2), so $k = n - \\mathrm{rank}$ (<<qc-f7-gf2|Unit F7.4>>). ` +
      `Shor: rank ${V.q22RankShor}, $k = 1$; $\\{Z_1Z_2, Z_2Z_3, Z_1Z_3\\}$: rank ${V.q22Rank3}.`,
    caption: 'the rows 000110, 000011, 000101 reduced: rank 2',
    captionFormal: 'row reduction of $r(Z_1Z_2)$, $r(Z_2Z_3)$, $r(Z_1Z_3)$: rank 2',
    stage: bx(['000110', '000011', '000101'], ROWS3_MOVES),
    claims: [
      claim('q22Rank3', 'the three rows have rank 2', () => V.q22Rank3 === 2),
      claim('q22RankShor', 'Shor’s eight rows have rank 8', () => V.q22RankShor === 8),
    ],
  },
  {
    id: 'q22-check-matrix:b4',
    phase: 'books',
    introduces: ['qc-logical-operator'],
    text:
      `Some Pauli strings pass every check yet are not checks. They change the stored qubit and leave no trace: [[qc-logical-operator|logical operators]]. In the bit-flip code $Z_1$ is one; it flips the stored sign.`,
    formal:
      `[[qc-logical-operator|Logical operators]] $\\bar X, \\bar Z$ lie in $N(S) \\setminus S$: they commute with every generator but are not in $S$ (N&C p. 465; $N(S)$ is the centralizer when $-I \\notin S$). ` +
      `Bit-flip code: $\\bar Z = Z_1$, $\\bar X = X_1X_2X_3$. Shor (for Bergou’s code words): $\\bar Z = X_1X_2X_3$, $\\bar X = Z_1Z_4Z_7$.`,
    caption: '$Z_1$ on the bit-flip code: no check lights, yet the stored sign flips',
    captionFormal: '$Z_1 \\in N(S) \\setminus S$: no generator reads $-1$',
    stage: code('rep3', { error: 'Z1', show: ['syndrome', 'logical'] }),
    fidelity: ['qc-code-lit'],
    claims: [
      claim('q22LogZ1', '$Z_1$ commutes with both checks of the bit-flip code', () => close(V.q22LogZ1, 0, 1e-12)),
      claim('q22ShorZbar', '$X_1X_2X_3$ commutes with all 8 checks of Shor’s code', () => close(V.q22ShorZbar, 0, 1e-12)),
      claim('q22ShorXbar', '$Z_1Z_4Z_7$ commutes with all 8 checks of Shor’s code', () => close(V.q22ShorXbar, 0, 1e-12)),
    ],
  },
  {
    id: 'q22-check-matrix:b5',
    phase: 'books',
    introduces: ['qc-code-nkd'],
    text:
      `The distance $d$ is the fewest qubits a logical operator touches. A code with $d = 2t + 1$ fixes any $t$ errors. We write the [[qc-code-nkd|bracket notation]] $[[n, k, d]]$: bit-flip $[[3, 1, 1]]$, Shor $[[9, 1, 3]]$, ` +
      `and the [[qc-five-qubit-code|five-qubit code]] $[[5, 1, 3]]$. It stores 1 qubit in 5, a rate of $${d(V.q22FiveRate, 1)}$, where Shor’s code manages $${d(V.q22ShorRate, 3)}$. The bit-flip code has $d = 1$: it fixes only the flips it was built for.`,
    formal:
      `The distance is the least weight in $N(S) \\setminus S$ (N&C p. 467). A code of [[qc-code-nkd|bracket type]] $[[n, k, d]]$ with $d \\ge 2t + 1$ corrects any $t$-qubit error (N&C p. 466). ` +
      `The [[qc-five-qubit-code|five-qubit code]] has generators $XZZXI$ and its cyclic shifts, $\\bar X = X^{\\otimes5}$, $\\bar Z = Z^{\\otimes5}$ (N&C Fig. 10.12), rank ${V.q22RankFive}$, $d = ${V.q22FiveD}$.`,
    caption: 'the five-qubit code round a ring, with $Y$ on qubit 3 lighting three of its four checks',
    captionFormal: 'the five-qubit code, $E = Y_3$: three of the four generators read $-1$',
    stage: code('five5', { error: 'Y3', show: ['syndrome'] }),
    fidelity: ['qc-code-lit'],
    claims: [
      claim('q22DBitflip', 'the bit-flip code has distance 1', () => V.q22DBitflip === 1),
      claim('q22DShor', 'Shor’s code has distance 3', () => V.q22DShor === 3),
      claim('q22RankFive', 'the five-qubit code has 4 independent checks', () => V.q22RankFive === 4),
      claim('q22FiveD', 'the five-qubit code has distance 3', () => V.q22FiveD === 3),
      claim('q22FiveRate', 'the five-qubit rate is $0.2$', () => close(V.q22FiveRate, 0.2, 1e-12)),
      claim('q22ShorRate', 'Shor’s rate is $0.111$', () => close(V.q22ShorRate, 1 / 9, 1e-12)),
    ],
  },
  {
    id: 'q22-check-matrix:b6',
    phase: 'clue',
    text: 'The five-qubit code has 4 checks, so 16 possible syndromes. It must tell apart 15 one-qubit errors and “no error”. Is there room?',
    formal: 'Are the 15 weight-1 errors’ syndromes distinct and nonzero for the five-qubit code? Compare with the quantum Hamming bound.',
    caption: 'the four checks of the five-qubit code',
    captionFormal: 'the generators of the five-qubit code',
    stage: code('five5', { view: 'checks' }),
    reveal: {
      text: 'Exactly: the 15 errors give 15 different patterns, and “no error” takes the 16th. No pattern is wasted: the room count of Chapter Q21 is met with equality.',
      formal: 'All 15 syndromes are distinct and nonzero, so $1 + 15 = 2^4$: the code is perfect, saturating $2(1 + 3n) \\le 2^n$ at $n = 5$ (N&C Ex. 10.50, cited).',
      caption: 'five of the 15 one-qubit errors, each with its own nonzero syndrome',
      captionFormal: 'five of the 15 weight-1 errors and their distinct syndromes',
      stage: code('five5', { view: 'checks', errors: ['XIIII', 'YIIII', 'ZIIII', 'IXIII', 'IIIIZ'] }),
      claims: [claim('q22FiveSyn', 'the 15 one-qubit errors leave 15 different nonzero syndromes', () => V.q22FiveSyn === 15)],
    },
  },
]

/* ---------------------------------------------------------------------------------------------- */
/* q22-css — Two classical codes that fit together                                                   */
/* ---------------------------------------------------------------------------------------------- */

const css: Beat[] = [
  {
    id: 'q22-css:b1',
    phase: 'books',
    introduces: ['qc-css-code'],
    text:
      `Use two kinds of check: strings of only $X$s and strings of only $Z$s, listed as bit matrices $H_X$ and $H_Z$. An $X$-check and a $Z$-check commute when they share an even number of qubits. ` +
      `So all checks commute exactly when $H_XH_Z^{T} = 0$, where $H_Z^{T}$ is $H_Z$ turned on its side. A code built this way is a [[qc-css-code|CSS code]].`,
    formal:
      `A [[qc-css-code|CSS code]] has $X$-type checks (rows of $H_X$) and $Z$-type checks (rows of $H_Z$), with check matrix $\\begin{pmatrix}H_X&0\\\\0&H_Z\\end{pmatrix}$ (N&C Eq. 10.106). ` +
      `The symplectic products are the entries of $H_XH_Z^{T}$, so the checks commute iff $H_XH_Z^{T} = 0$. Rosetta: a subscripted $H$ is a check matrix, a bare $H$ the Hadamard.`,
    caption: 'a Steane X-check (0001111) beside a Z-check (0110011): two shared places, so they commute',
    captionFormal: 'one row of $H_X$ and one of $H_Z$: they overlap in 2 places, an even number',
    stage: br(['0001111', '0110011'], { combine: 'dot' }),
    claims: [
      claim('q22SteaneHXHZ', 'the Steane matrices satisfy $H_XH_Z^T = 0$', () => V.q22SteaneHXHZ === 0),
      claim('q22Overlap', 'the two rows share 2 places', () => V.q22Overlap === 2),
    ],
    derivation: {
      result: 'H_X H_Z^{T} = 0',
      ground: [
        {
          tex: 'a \\text{ and } b \\text{ clash where both have a } 1',
          why: 'An $X$-row $a$ and a $Z$-row $b$ clash on every qubit where both have a 1.',
          view: br(['0001111', '0110011'], { combine: 'dot' }),
          viewCaption: 'overlap 2',
        },
        {
          tex: '\\text{overlap } 2 \\Rightarrow \\text{commute}',
          why: 'An even count of clashes means the two checks commute.',
        },
        {
          tex: 'H_X H_Z^{T} = 0',
          why: 'Every pair at once is the matrix product, and it is zero when every overlap is even.',
          view: code('steane7', { view: 'checks' }),
          viewCaption: 'all checks',
        },
      ],
      formal: [
        {
          tex: 'r = (a|0),\\ r\' = (0|b) \\Rightarrow r\\Lambda r\'^{T} = a b^{T}',
          why: 'For an $X$-row and a $Z$-row the symplectic product reduces to the overlap of the two rows.',
          view: br(['0001111', '0110011'], { combine: 'dot' }),
          viewCaption: 'overlap 2',
        },
        {
          tex: 'a b^{T} = 0 \\text{ for every pair} \\Rightarrow H_X H_Z^{T} = 0',
          why: 'The entries of the matrix product are all these overlaps.',
          view: code('steane7', { view: 'checks' }),
          viewCaption: 'all checks',
        },
      ],
    },
  },
  {
    id: 'q22-css:b2',
    phase: 'books',
    text:
      `Let both matrices be F7’s Hamming checks. Each row has weight 4 and any two share 2 places, so all checks commute. ` +
      `Seven qubits minus 3 $X$-checks minus 3 $Z$-checks leave ${V.q22KSteane} stored qubit: the [[qc-steane-code|Steane code]].`,
    formal:
      `$k = n - \\mathrm{rank}\\,H_X - \\mathrm{rank}\\,H_Z$. With $H_X = H_Z = M_7$, $M_7M_7^{T} = 0$ and $k = 7 - 3 - 3 = ${V.q22KSteane}$: the [[qc-steane-code|Steane code]] (Bergou pp. 174–175; N&C Fig. 10.6). ` +
      `Shor’s code is CSS too, with ranks ${V.q22ShorRankX} and ${V.q22ShorRankZ}, so $k = 9 - 2 - 6 = 1$.`,
    caption: 'the Steane code: seven qubits, three X checks and three Z checks on the same three circles',
    captionFormal: 'the Steane code: seven qubits, $H_X = H_Z = M_7$',
    stage: code('steane7', { view: 'layout' }),
    claims: [
      claim('q22KSteane', 'the Steane code stores 1 qubit', () => V.q22KSteane === 1),
      claim('q22ShorRankX', 'Shor’s X checks have rank 2', () => V.q22ShorRankX === 2),
      claim('q22ShorRankZ', 'and its Z checks rank 6', () => V.q22ShorRankZ === 6),
    ],
  },
  {
    id: 'q22-css:b3',
    phase: 'books',
    text:
      `Bergou writes the code words out. The zero code word is an even mix of the ${V.q22SteaneWords} even-weight Hamming words. The one code word is the same for the 8 odd ones. Each word has amplitude $${d(V.q22SteaneAmp, 4)}$. ` +
      `Hadamards on all seven qubits spread the zero code word over all 16 Hamming words, $${d(V.q22SteaneH, 2)}$ each.`,
    formal:
      `For $C_2 \\subset C_1$, $|x + C_2\\rangle = \\tfrac{1}{\\sqrt{|C_2|}}\\sum_{y \\in C_2}|x + y\\rangle$ (Eq. 9.41) gives $[[n, k_1 - k_2]]$, and $H^{\\otimes n}|x + C_2\\rangle = 2^{-(n-k_2)/2}\\sum_{u \\in C_2^\\perp}(-1)^{x^{T}u}|u\\rangle$ (Eq. 9.43). ` +
      `Steane: $C_1$ is the Hamming code and $C_2 = C_1^\\perp$; the amplitudes are $1/\\sqrt8 = ${d(V.q22SteaneAmp, 4)}$, then $${d(V.q22SteaneH, 2)}$.`,
    caption: 'the zero code word of the Steane code: the 8 even Hamming words, 0.3536 each',
    captionFormal: '$|\\bar 0\\rangle = |C_2\\rangle$: eight words of amplitude 0.3536',
    stage: code('steane7', { view: 'words', word: 0 }),
    claims: [
      claim('q22SteaneAmp', 'each of the 8 words has amplitude $0.3536$', () => close(V.q22SteaneAmp, 1 / Math.sqrt(8), 1e-12)),
      claim('q22SteaneWords', 'there are 8 even-weight Hamming words', () => V.q22SteaneWords === 8),
      claim('q22SteaneH', 'after the Hadamards each of 16 words has amplitude $0.25$', () => close(V.q22SteaneH, 0.25, 1e-12)),
    ],
    derivation: {
      result: 'H^{\\otimes 7}|\\bar 0\\rangle = \\tfrac14 \\sum_{u \\in C_1}|u\\rangle',
      ground: [
        {
          tex: '|\\bar 0\\rangle = \\tfrac{1}{\\sqrt8}\\sum_{y \\in C_2}|y\\rangle',
          why: 'The zero code word is an even mix of the eight even-weight Hamming words.',
          view: code('steane7', { view: 'words', word: 0 }),
          viewCaption: 'the zero code word’s words',
        },
        {
          tex: '\\sum_{y \\in C_2}(-1)^{y^{T}u} = 8 \\text{ if } u \\in C_1, \\text{ else } 0',
          why: 'The signs cancel unless the string $u$ passes every check $y$.',
          view: br(['0001111', '1110000'], { combine: 'dot' }),
          viewCaption: 'a sign test',
        },
        {
          tex: 'H^{\\otimes 7}|\\bar 0\\rangle = \\tfrac14 \\sum_{u \\in C_1}|u\\rangle',
          why: 'Sixteen words survive, each with amplitude one quarter.',
          view: code('steane7', { view: 'words', word: 'plus' }),
          viewCaption: '16 words',
        },
      ],
      formal: [
        {
          tex: '|\\bar 0\\rangle = |C_2\\rangle = \\tfrac{1}{\\sqrt8}\\sum_{y \\in C_2}|y\\rangle',
          why: 'Eq. 9.41 with $x = 0$.',
          view: code('steane7', { view: 'words', word: 0 }),
          viewCaption: 'the zero code word’s words',
        },
        {
          tex: '\\sum_{y \\in C_2}(-1)^{y^{T}u} = |C_2|\\,[u \\in C_1]',
          why: 'Eq. 9.38 for the dual pair $C_1 = C_2^\\perp$.',
          view: br(['0001111', '1110000'], { combine: 'dot' }),
          viewCaption: 'a sign test',
        },
        {
          tex: 'H^{\\otimes 7}|\\bar 0\\rangle = \\tfrac14 \\sum_{u \\in C_1}|u\\rangle',
          why: 'Eq. 9.43 with $n - k_2 = 4$.',
          view: code('steane7', { view: 'words', word: 'plus' }),
          viewCaption: '16 words',
        },
      ],
    },
  },
  {
    id: 'q22-css:b4',
    phase: 'books',
    text:
      `Bit flips are read by the $Z$-checks, sign flips by the $X$-checks, each with the Hamming table. $X$ on qubits 1, 2, 3 passes every check but swaps the two code words. ` +
      `So $d \\le ${V.q22DSteane}$. No lighter string does this (every string was checked), so $d = ${V.q22DSteane}$: the Steane code is $[[7, 1, 3]]$.`,
    formal:
      `Bit flips are read through $H_Z$ ($= H_1$), phase flips after $H^{\\otimes n}$ through $H_X$ ($= G_2^{T}$) (Eqs. 9.44–9.52). $\\bar X = X^{\\otimes7}$, $\\bar Z = Z^{\\otimes7}$ (N&C Eq. 10.107), with weight-3 forms $X_1X_2X_3$, $Z_1Z_2Z_3$, and no lighter logical operator exists (every string checked): ` +
      `$[[7, 1, ${V.q22DSteane}]]$, correcting all ${V.q22SteaneAll1} one-qubit errors. Bergou p. 173 writes $d_1 > 2t_f + 1$ (Correction box).`,
    caption: '$X_1X_2X_3$ on the Steane code: no check lights, and it is a logical X',
    captionFormal: '$E = X_1X_2X_3 \\in N(S) \\setminus S$: no generator reads $-1$',
    stage: code('steane7', { error: 'X1X2X3', show: ['syndrome', 'logical'] }),
    fidelity: ['qc-code-lit'],
    claims: [
      claim('q22DSteane', 'the Steane code has distance 3', () => V.q22DSteane === 3),
      claim('q22SteaneAll1', 'lookup decoding corrects all 21 one-qubit errors', () => V.q22SteaneAll1 === 21),
      claim('q22SteaneXbar3', '$X_1X_2X_3$ commutes with all 6 checks', () => close(V.q22SteaneXbar3, 0, 1e-12)),
    ],
  },
  {
    id: 'q22-css:b5',
    phase: 'clue',
    text: 'Could the $[6, 2]$ code’s four checks serve as both $H_X$ and $H_Z$?',
    formal: 'Is $M_{62}M_{62}^{T} = 0$? What fails if not?',
    caption: 'the Steane checks, for comparison',
    captionFormal: 'the generators of the Steane code',
    stage: code('steane7', { view: 'checks' }),
    reveal: {
      text: 'No. Checks 110000 and 101000 share one place, so the $X$ version of one and the $Z$ version of the other anticommute. No state passes both, so there is no code.',
      formal: '$M_{62}M_{62}^{T} \\ne 0$: rows 1 and 2 overlap once, so $X_1X_2$ and $Z_1Z_3$ anticommute and $S$ is not abelian (Unit 22.2). Bergou’s $C_2 \\subset C_1$ is exactly $H_1G_2 = 0$, that is $H_ZH_X^{T} = 0$.',
      caption: '110000 beside 101000: one shared place, an odd count',
      captionFormal: 'the rows 110000 and 101000 overlap in 1 place',
      stage: br(['110000', '101000'], { combine: 'dot' }),
      claims: [claim('q22Css62Fails', 'two rows of the $[6, 2]$ checks overlap in an odd number of places', () => V.q22Css62Fails === 1)],
    },
  },
]

/* ---------------------------------------------------------------------------------------------- */
/* q22-decode — From syndrome to correction                                                          */
/* ---------------------------------------------------------------------------------------------- */

const decode: Beat[] = [
  {
    id: 'q22-decode:b1',
    phase: 'books',
    introduces: ['qc-decoder'],
    text:
      `Decoding turns a syndrome into a fix. For small codes a table does it: for each syndrome, store the lightest error that makes it. That table is a [[qc-decoder|lookup decoder]]. ` +
      `Steane’s $Z$-checks read 101 for a bit flip on qubit 5, so the table says: flip qubit 5.`,
    formal:
      `A [[qc-decoder|lookup decoder]] stores, for each of the $2^{n-k}$ syndromes, a minimum-weight Pauli with that syndrome, and applies it (N&C p. 466). ` +
      `Steane: $H_Ze$ is the binary number of the flipped place, $X_5 \\mapsto 101$; ${V.q22Syn64} syndromes are 8 for the $X$ part times 8 for the $Z$ part.`,
    caption: 'a bit flip on qubit 5: the Z checks read 101, and the table’s fix is X on qubit 5',
    captionFormal: '$E = X_5$: $H_Ze = 101$, the table returns $X_5$',
    stage: code('steane7', { error: 'X5', show: ['syndrome', 'correction'] }),
    fidelity: ['qc-code-lit'],
    claims: [
      claim('q22SynX5', 'the syndrome of $X_5$ is 101, the number 5', () => V.q22SynX5 === 5),
      claim('q22Syn64', 'the Steane code has 64 syndromes', () => V.q22Syn64 === 64),
    ],
  },
  {
    id: 'q22-decode:b2',
    phase: 'books',
    text:
      `A CSS code decodes bit flips and sign flips separately, each with its own small table. A $Y$ on qubit 3 reads 011 in both. ` +
      `Every one-qubit error is fixed, and so is any bit flip paired with any sign flip.`,
    formal:
      `With $H_X = H_Z = M_7$ the $X$ and $Z$ parts of $E$ decode independently (Bergou pp. 173–174): $Y_3 \\mapsto (011, 011)$. ` +
      `The 21 weight-1 errors and all ${V.q22SteaneXZ} products $X_iZ_j$ are corrected; with the identity, 7 + 7 + ${V.q22SteaneXZ} + 1 = ${V.q22Syn64} patterns fill the ${V.q22Syn64} syndromes.`,
    caption: 'a $Y$ on qubit 3: both sets of checks read 011',
    captionFormal: '$E = Y_3$: the syndromes $(011, 011)$',
    stage: code('steane7', { error: 'Y3', show: ['syndrome', 'correction'] }),
    fidelity: ['qc-code-lit'],
    claims: [
      claim('q22SynY3', 'a $Y$ on qubit 3 reads 011 in both, the number 3', () => V.q22SynY3 === 3),
      claim('q22SteaneXZ', 'all 49 products of a bit flip and a sign flip are corrected', () => V.q22SteaneXZ === 49),
    ],
  },
  {
    id: 'q22-decode:b3',
    phase: 'books',
    text:
      `Bit flips on qubits 1 and 2 read 011, the pattern of qubit 3. The table flips qubit 3, completing $X_1X_2X_3$. That is a [[qc-logical-error|logical error]]: a logical $X$. ` +
      `The stored qubit is now wrong, and no check says so.`,
    formal:
      `$H_Z(e_1 + e_2) = 001 + 010 = 011 = H_Ze_3$, so lookup applies $X_3$ and leaves $X_1X_2X_3 \\in N(S) \\setminus S$, a [[qc-logical-error|logical error]]. ` +
      `A correction succeeds exactly when error times fix lies in $S$ (the degeneracy of Chapter Q21).`,
    caption: 'bit flips on qubits 1 and 2, fixed on qubit 3: what is left is a logical X',
    captionFormal: '$E = X_1X_2$, fix $X_3$: the residual $X_1X_2X_3$ is a logical operator',
    stage: code('steane7', { error: 'X1X2', correction: 'X3', show: ['syndrome', 'correction', 'residual'] }),
    fidelity: ['qc-code-lit'],
    claims: [
      claim('q22TwoFlipSyn', 'flips on 1 and 2 read 011, the number 3', () => V.q22TwoFlipSyn === 3),
      claim('q22Residual', 'the residual is 1110000, a logical X', () => V.q22Residual === 112),
    ],
  },
  {
    id: 'q22-decode:b4',
    phase: 'books',
    text:
      `Let each qubit flip with chance $p$ (bit flips only), and count every pattern the table gets wrong. At $p = ${d(V.q22PIn001, 2)}$ the stored qubit fails with chance $${d(V.q22PL001, 4)}$, five times less than a bare qubit. ` +
      `From $p = ${d(V.q22PStar, 4)}$ up to one half the code makes things worse.`,
    formal:
      `With independent $X$ flips and lookup decoding, $P_L(p) = \\sum_e p^{|e|}(1-p)^{7-|e|}[e\\,c(e) \\notin S]$, where $c(e)$ is the table’s fix. Failures by weight 0 to 7 number 0, 0, 21, 7, 28, 0, 7, 1, so $P_L \\approx 21p^2$: ` +
      `$${d(V.q22PL001, 4)}$ at $p = ${d(V.q22PIn001, 2)}$ and $${d(V.q22PL01, 4)}$ at $p = ${d(V.q22PIn01, 1)}$. $P_L < p$ below $p^* = ${d(V.q22PStar, 4)}$ (our calculation, exact enumeration), and $P_L > p$ from $p^*$ up to $p = \\tfrac12$, where $P_L = ${d(V.q22PLHalf, 1)}$.`,
    caption: 'Steane’s logical failure (curve) against a bare qubit’s p (line): they cross at 0.0646',
    captionFormal: '$P_L(p)$ for the Steane code against $p$: the curves cross at $p^* = 0.0646$',
    stage: pl('steaneFailX', { markers: [{ x: V.q22PIn001 }, { x: V.q22PStar }] }, { vs: 'identityP', x: { from: 0, to: 0.2 } }),
    claims: [
      claim('q22PIn001', 'the flip chance is $0.01$', () => close(V.q22PIn001, 0.01, 1e-12)),
      claim('q22PIn01', 'or $0.1$', () => close(V.q22PIn01, 0.1, 1e-12)),
      claim('q22PL001', 'the failure chance at $p = 0.01$ is $0.0020$', () => close(V.q22PL001, 0.002004, 1e-6)),
      claim('q22PL01', 'at $p = 0.1$ it is $0.1306$', () => close(V.q22PL01, 0.130643, 1e-6)),
      claim('q22PStar', 'the curves cross at $p^* = 0.0646$', () => close(V.q22PStar, 0.0646, 5e-5)),
      claim('q22FailTotal', 'the failures by weight are 0, 0, 21, 7, 28, 0, 7, 1', () => V.q22FailTotal === 64 && FAILS_X.join() === '0,0,21,7,28,0,7,1'),
      claim('q22PLHalf', 'at $p = 0.5$ the failure chance is $0.5$, level with a bare qubit', () => close(V.q22PLHalf, 0.5, 1e-12)),
    ],
    derivation: {
      result: 'P_L(p) \\approx 21p^2',
      ground: [
        {
          tex: '\\text{one flip: always fixed}',
          why: 'Every single flip has its own syndrome, so the table fixes it.',
          view: code('steane7', { error: 'X5', show: ['syndrome', 'correction'] }),
          viewCaption: 'one flip fixed',
        },
        {
          tex: '\\text{two flips: } 21 \\text{ patterns fail}',
          why: 'Two flips look like a third flip, and the fix completes a logical operator: all 21 pairs fail.',
          view: code('steane7', { error: 'X1X2', correction: 'X3', show: ['syndrome', 'correction', 'residual'] }),
          viewCaption: 'two flips fail',
        },
        {
          tex: '\\text{failures by weight: } 21,\\ 7,\\ 28,\\ 0,\\ 7,\\ 1',
          why: 'Counting the patterns the table gets wrong for each number of flips gives these totals.',
        },
        {
          tex: '\\text{for small } p:\\ P_L(p) \\approx 21p^2',
          why: 'For a small chance the two-flip patterns dominate, so the failure chance is about 21 times $p^2$.',
          view: pl('steaneFailX', { markers: [{ x: V.q22PIn001 }, { x: V.q22PStar }] }, { vs: 'identityP', x: { from: 0, to: 0.2 } }),
          viewCaption: 'failure vs p',
        },
      ],
      formal: [
        {
          tex: 'e\\,c(e) \\in S \\Leftrightarrow \\text{success}',
          why: 'A round succeeds exactly when the error times the table’s fix lies in the stabilizer group.',
          view: code('steane7', { error: 'X1X2', correction: 'X3', show: ['syndrome', 'correction', 'residual'] }),
          viewCaption: 'two flips fail',
        },
        {
          tex: 'P_L(p) = 21p^2(1-p)^5 + 7p^3(1-p)^4 + 28p^4(1-p)^3 + 7p^6(1-p) + p^7',
          why: 'Sum the failing patterns of each weight with their chances.',
        },
        {
          tex: '\\text{for small } p:\\ P_L(p) \\approx 21p^2',
          why: 'The weight-2 term dominates for small $p$; bisection on $P_L = p$ gives $p^*$.',
          view: pl('steaneFailX', { markers: [{ x: V.q22PIn001 }, { x: V.q22PStar }] }, { vs: 'identityP', x: { from: 0, to: 0.2 } }),
          viewCaption: 'failure vs p',
        },
      ],
    },
  },
  {
    id: 'q22-decode:b5',
    phase: 'clue',
    text: 'Three bit flips exceed what the Steane code promises. Can the table still save some of them?',
    formal: 'Of the 35 weight-3 $X$ errors, how many does lookup decoding correct, and why?',
    caption: 'flips on qubits 1, 2 and 4: the Z checks read 111, the pattern of qubit 7',
    captionFormal: '$E = X_1X_2X_4$: the syndrome 111 is the column of qubit 7',
    stage: code('steane7', { error: 'X1X2X4', show: ['syndrome'] }),
    fidelity: ['qc-code-lit'],
    reveal: {
      text: 'Yes, 28 of the 35. The fix lands on a fourth qubit, and the four flips together form an $X$-check, which changes nothing. The other 7 are logical operators themselves.',
      formal: '28 of 35: the residual $e + c$ is an even Hamming word, a product of $X$-checks, so it lies in $S$. The 7 failures are the weight-3 code words: syndrome 000, nothing applied, $e \\in N(S) \\setminus S$.',
      caption: 'flips on 1, 2, 4, fixed on 7: the four together are an X check',
      captionFormal: '$e = X_1X_2X_4$, $c = X_7$: $e + c$ is the check 1101001',
      stage: code('steane7', { error: 'X1X2X4', correction: 'X7', show: ['syndrome', 'correction', 'residual'] }),
      fidelity: ['qc-code-lit'],
      claims: [claim('q22W3Fixed', 'the table corrects 28 of the 35 weight-3 patterns', () => V.q22W3Fixed === 28)],
    },
  },
]

/* ---------------------------------------------------------------------------------------------- */
/* q22-clifford — Gates that move Pauli labels around                                                */
/* ---------------------------------------------------------------------------------------------- */

const clifford: Beat[] = [
  {
    id: 'q22-clifford:b1',
    phase: 'books',
    introduces: ['qc-clifford'],
    text:
      `If $g$ fixes $|\\psi\\rangle$, then after a gate $U$ the new state is fixed by $UgU^\\dagger$. For some gates that is again a Pauli string. Those are [[qc-clifford|Clifford gates]]. ` +
      `A circuit of them can be followed by relabelling checks, never touching amplitudes.`,
    formal:
      `$U|\\psi\\rangle = UgU^\\dagger U|\\psi\\rangle$, so $UV_S$ is stabilized by $U\\Sigma U^\\dagger$ (Eq. 10.8; here $\\Sigma$ is the stabilizer group $S$ of Unit 22.1, because $S$ now names the phase gate). Unitaries with $U\\mathcal P_nU^\\dagger = \\mathcal P_n$ form the normalizer of $\\mathcal P_n$, the [[qc-clifford|Clifford group]] (Bergou p. 182), ` +
      `generated by $H$, the phase gate and CNOT (N&C p. 462).`,
    caption: 'H, then X, then H: the product is the table of Z',
    captionFormal: '$HXH^\\dagger = Z$ as a matrix product',
    stage: mx({ product: [G('H'), pa('X'), G('H')] }, { values: 'exact' }),
    claims: [claim('q22HXH', '$HXH^\\dagger$ is exactly $Z$', () => close(V.q22HXH, 0, 1e-12))],
  },
  {
    id: 'q22-clifford:b2',
    phase: 'books',
    text:
      `Three tables do most of the work. $H$ swaps $X$ and $Z$. The phase gate $S$ turns $X$ into $Y$ and leaves $Z$ alone. CNOT copies an $X$ forward from control to target, and a $Z$ backward.`,
    formal:
      `$H$: $X \\to Z$, $Y \\to -Y$, $Z \\to X$; the phase gate $S$ (Bergou’s $F$, <<qc-q4-phase-gate|Unit 4.2>>): $X \\to Y$, $Y \\to -X$, $Z \\to Z$ (the last line of Eq. 10.9 prints $FYF^\\dagger = Z$: Correction box); ` +
      `CNOT: $X_1 \\to X_1X_2$, $Z_2 \\to Z_1Z_2$, with $Z_1$ and $X_2$ fixed (Eq. 10.11). Up to phase there are ${V.q22Cliff24} one-qubit Cliffords.`,
    caption: 'CNOT around X on the control: X on both',
    captionFormal: '$\\mathrm{CNOT}\\,(X \\otimes I)\\,\\mathrm{CNOT} = X \\otimes X$',
    stage: mx({ product: [G('CNOT'), pa('XI'), G('CNOT')] }, { values: 'exact' }),
    claims: [
      claim('q22SXS', 'the phase gate turns $X$ into $Y$', () => close(V.q22SXS, 0, 1e-12)),
      claim('q22SZS', 'and leaves $Z$ alone', () => close(V.q22SZS, 0, 1e-12)),
      claim('q22CnotX1', 'CNOT turns $X$ on the control into $X$ on both', () => close(V.q22CnotX1, 0, 1e-12)),
      claim('q22Cliff24', 'there are 24 one-qubit Cliffords up to phase', () => V.q22Cliff24 === 24),
    ],
  },
  {
    id: 'q22-clifford:b3',
    phase: 'books',
    text:
      `Follow the phase-flip encoder by its checks alone. Name the group of checks $\\Sigma_0$ at the start and $\\Sigma_1$, $\\Sigma_2$, $\\Sigma_3$ after each later step. Start from $Z_1$, $Z_2$, $Z_3$. Two CNOTs give $Z_1$, $Z_1Z_2$, $Z_1Z_3$. ` +
      `Three Hadamards give $X_1$, $X_1X_2$, $X_1X_3$: the checks of $|{+}{+}{+}\\rangle$, the zero code word of that code.`,
    formal:
      `$|000\\rangle$ has $\\Sigma_0 = \\langle Z_1, Z_2, Z_3\\rangle$; CNOT$_{1\\to2}$, CNOT$_{1\\to3}$ give $\\Sigma_2 = \\langle Z_1, Z_1Z_2, Z_1Z_3\\rangle$; $H^{\\otimes3}$ gives $\\Sigma_3 = \\langle X_1, X_1X_2, X_1X_3\\rangle$, the stabilizer of $|{+}{+}{+}\\rangle$ (Chapter Q21). ` +
      `Bergou’s Problem 10.1 and Problem 10.3 circuits are cited, not worked.`,
    caption: 'the encoder and its three checks, column by column',
    captionFormal: 'the encoder circuit and the generators of its state after every column',
    stage: split(circ(C_ENC_PF, 3), tb(ENC_ROWS[3], { state: { circuit: C_ENC_PF, upTo: 3 } })),
    claims: [claim('q22TrackEnd', 'the tableau trace ends on the group of $X_1$, $X_1X_2$, $X_1X_3$', () => V.q22TrackEnd === 1)],
    derivation: {
      result: '\\Sigma_3 = \\langle X_1, X_1X_2, X_1X_3\\rangle',
      ground: [
        {
          tex: '\\Sigma_0 = \\langle Z_1, Z_2, Z_3\\rangle',
          why: 'The state 000 is fixed by a Z on each qubit.',
          view: tb(ENC_ROWS[0], { state: { circuit: C_ENC_PF, upTo: 0 } }),
          viewCaption: 'start',
        },
        {
          tex: '\\Sigma_1 = \\langle Z_1, Z_1Z_2, Z_3\\rangle',
          why: 'CNOT from qubit 1 to qubit 2 turns $Z_2$ into $Z_1Z_2$.',
          view: tb(ENC_ROWS[1], { state: { circuit: C_ENC_PF, upTo: 1 } }),
          viewCaption: 'after CNOT 1→2',
        },
        {
          tex: '\\Sigma_2 = \\langle Z_1, Z_1Z_2, Z_1Z_3\\rangle',
          why: 'CNOT from qubit 1 to qubit 3 turns $Z_3$ into $Z_1Z_3$.',
          view: tb(ENC_ROWS[2], { state: { circuit: C_ENC_PF, upTo: 2 } }),
          viewCaption: 'after CNOT 1→3',
        },
        {
          tex: '\\Sigma_3 = \\langle X_1, X_1X_2, X_1X_3\\rangle',
          why: 'The three Hadamards swap every $X$ and $Z$.',
          view: tb(ENC_ROWS[3], { state: { circuit: C_ENC_PF, upTo: 3 } }),
          viewCaption: 'after the Hadamards',
        },
      ],
      formal: [
        {
          tex: '\\Sigma_2 = \\langle Z_1, Z_1Z_2, Z_1Z_3\\rangle',
          why: 'The two CNOTs conjugate $Z_2 \\to Z_1Z_2$ and $Z_3 \\to Z_1Z_3$ (Eq. 10.11).',
          view: tb(ENC_ROWS[2], { state: { circuit: C_ENC_PF, upTo: 2 } }),
          viewCaption: 'after both CNOTs',
        },
        {
          tex: '\\Sigma_3 = \\langle X_1, X_1X_2, X_1X_3\\rangle',
          why: 'Conjugation by $H^{\\otimes3}$ exchanges $X$ and $Z$ (Eq. 10.9).',
          view: tb(ENC_ROWS[3], { state: { circuit: C_ENC_PF, upTo: 3 } }),
          viewCaption: 'after the Hadamards',
        },
      ],
    },
  },
  {
    id: 'q22-clifford:b4',
    phase: 'books',
    text:
      `Measuring a check the state already passes changes nothing: the answer is certain. Measuring $X_1$ on $|000\\rangle$ differs. ` +
      `$X_1$ clashes with the check $Z_1$, so the answer is $\\pm1$ with chance $${d(V.q22MeasX, 1)}$ each, and $\\pm X_1$ replaces $Z_1$.`,
    formal:
      `If $g$ commutes with all generators the outcome is fixed and the group is unchanged. Otherwise rewrite so only $g_1$ anticommutes ($g_j \\to g_1g_j$, Eq. 10.12); ` +
      `outcomes $\\pm1$ have probability $\\tfrac12$ and $g_1 \\to \\pm g$ (Eq. 10.13). Syndrome checks commute with the group, so reading them never disturbs the code.`,
    caption: 'measuring X on qubit 1 of |000⟩: outcome 0 (that is +1) with chance 0.5; the first check becomes X₁',
    captionFormal: '$g = X_1$ anticommutes with $Z_1$ only: outcome $+1$ with probability $\\tfrac12$, and $Z_1 \\to X_1$',
    stage: split(circ(C_MX, 3, '0'), tb(['XII', 'IZI', 'IIZ'], { state: { circuit: C_MX, upTo: 3, outcomes: '0' } })),
    claims: [claim('q22MeasX', 'the measurement of $X_1$ gives outcome 0 with chance $0.5$', () => close(V.q22MeasX, 0.5, 1e-12))],
  },
  {
    id: 'q22-clifford:b5',
    phase: 'clue',
    text: 'Is the gate $T$ a Clifford gate? What does it do to $X$?',
    formal: 'Compute $TXT^\\dagger$. Is it in $\\mathcal P_1$?',
    caption: 'the matrix of the T gate',
    captionFormal: 'the matrix of $T$',
    stage: mx({ gate: { name: 'T' } }, { values: 'exact' }),
    reveal: {
      text: 'No. $TXT^\\dagger = (X + Y)/\\sqrt2$: half-way between two Pauli tables, $' + d(V.q22TXT, 4) + '$ of each. No relabelling can follow it; Unit 22.7 shows why that matters.',
      formal: '$TXT^\\dagger = (X + Y)/\\sqrt2 \\notin \\mathcal P_1$, so $T$ lies outside the normalizer (N&C p. 462; the Toffoli likewise, Bergou Problem 10.2, cited). Adding $T$ to $H$, the phase gate and CNOT gives a universal set (N&C §4.5).',
      caption: 'T, then X, then T†: 0.7071 times (X + Y)',
      captionFormal: '$TXT^\\dagger$ as a matrix: entries of size 0.7071',
      stage: mx({ product: [G('T'), pa('X'), G('Tdg')] }, { values: 'decimal' }),
      claims: [claim('q22TXT', 'the weight of $X$ in $TXT^\\dagger$ is $0.7071$', () => close(V.q22TXT, Math.SQRT1_2, 1e-12) && close(V.q22TXTY, Math.SQRT1_2, 1e-12))],
    },
  },
]

/* ---------------------------------------------------------------------------------------------- */
/* q22-gottesman-knill — When a quantum computer is easy to fake                                     */
/* ---------------------------------------------------------------------------------------------- */

const gk: Beat[] = [
  {
    id: 'q22-gottesman-knill:b1',
    phase: 'books',
    text:
      `A stabilizer state of $n$ qubits needs only $n$ checks of $2n$ bits, plus signs. That bit table is a [[qc-tableau|stabilizer tableau]]. For 50 qubits it is ${V.q22Tab50} bits. ` +
      `Its list of amplitudes would hold $${d(V.q22Amp50Mant, 2)} \\times 10^{15}$ numbers.`,
    formal:
      `A [[qc-tableau|stabilizer tableau]] stores $n$ generators as an $n \\times 2n$ binary matrix plus $n$ signs, $n(2n + 1)$ bits: ${V.q22Tab50} at $n = 50$ and ${V.q22Tab100} at $n = 100$, ` +
      `against $2^{50} = ${d(V.q22Amp50Mant, 2)} \\times 10^{15}$ and $2^{100} = ${d(V.q22Amp100Mant, 2)} \\times 10^{30}$ amplitudes. Bergou’s sample row in Eq. 10.14 has a factor $-iY$ (Correction box).`,
    caption: 'tableau bits, about 2n² (dashed shows n², the same growth), against amplitudes, 2ⁿ; log scale, marker at 50 qubits',
    captionFormal: 'the cost of a tableau, about $2n^2$ bits (dashed shows $n^2$, the same growth), against $2^n$ amplitudes, on a log scale',
    stage: pl('twoToN', { yScale: 'log', markers: [{ x: 50, label: 'n = 50' }] }, { vs: 'nSquared', x: { from: 1, to: 50 } }),
    claims: [
      claim('q22Tab50', 'a 50-qubit tableau is 5050 bits', () => V.q22Tab50 === 5050),
      claim('q22Tab100', 'a 100-qubit tableau is 20100 bits', () => V.q22Tab100 === 20100),
      claim('q22Amp50Mant', '$2^{50}$ is about $1.13 \\times 10^{15}$', () => close(V.q22Amp50Mant, 1.1259, 1e-4)),
      claim('q22Amp100Mant', '$2^{100}$ is about $1.27 \\times 10^{30}$', () => close(V.q22Amp100Mant, 1.2677, 1e-4)),
    ],
  },
  {
    id: 'q22-gottesman-knill:b2',
    phase: 'books',
    text:
      `Run the bit-flip code’s cycle on $|0\\rangle$: encode, flip qubit 2, read both checks onto two helper qubits, fix. The full simulation and the tableau (checked in a test) agree: the helpers read 11 for certain.`,
    formal:
      `With $|\\psi\\rangle = |0\\rangle$ every gate of the cycle is Clifford. $H$ and the phase gate update one column pair of the tableau, CNOT two: $O(n)$ bits per gate (Aaronson–Gottesman, cited by Bergou). ` +
      `The helper outcomes 11 are deterministic, matching the full state-vector run (an engine test on random Clifford circuits, $n \\le 5$).`,
    caption: 'the cycle with a flip on qubit 2, just before the helpers are read: they hold 11 with chance 1',
    captionFormal: 'the cycle $C_{BF0}$ with $E = X_2$: both helper readings are certain, 11',
    stage: split(circ(C_BF0_X2, 7, '11'), amp(C_BF0_X2, 7, 'probability', { keep: [3, 4] }, '11')),
    claims: [claim('q22TabSyn', 'the helpers read 11 with chance 1', () => close(V.q22TabSyn, 1, 1e-12))],
  },
  {
    id: 'q22-gottesman-knill:b3',
    phase: 'books',
    text:
      `The [[qc-gottesman-knill|Gottesman–Knill theorem]] says circuits of $H$, the phase gate, CNOT and Pauli measurements are easy for an ordinary computer. They start in 0s and 1s. ` +
      `Entanglement alone does not make a quantum computer powerful.`,
    formal:
      `[[qc-gottesman-knill|Gottesman–Knill]] (Bergou p. 184; N&C p. 464): computational-basis preparation, $H$, the phase gate, Paulis, CNOT, Pauli measurements and classical control simulate classically in $O(mn^2)$ steps for $m$ operations. ` +
      `Steane’s zero code word is entangled, yet its ${V.q22SteaneGens} generators (6 checks and $\\bar Z$) describe it.`,
    caption: 'the Steane code’s checks: 6 generators, and $\\bar Z$ makes 7',
    captionFormal: 'the six generators of the Steane code; with $\\bar Z$ they fix $|\\bar 0\\rangle$',
    stage: code('steane7', { view: 'checks' }),
    claims: [claim('q22SteaneGens', 'six checks and the logical Z make 7 independent generators', () => V.q22SteaneGens === 7)],
  },
  {
    id: 'q22-gottesman-knill:b4',
    phase: 'clue',
    text: 'Could a machine with only $H$, the phase gate, CNOT and Pauli measurements run Chapter Q18’s order finding for 21 faster than a laptop?',
    formal: 'Is order finding (Chapter Q18) possible with stabilizer operations alone?',
    caption: 'the Steane checks: the kind of circuit a laptop copies',
    captionFormal: 'stabilizer data: the generators of the Steane code',
    stage: code('steane7', { view: 'checks' }),
    reveal: {
      text: 'No: a laptop copies any such machine cheaply. Order finding needs turns like $T$, which are not Clifford. Supplying them safely is a topic for the Papers section.',
      formal: 'By Gottesman–Knill a speed-up needs non-Clifford resources; the QFT’s $R_3 = T$ (Unit 18.2) lies outside the normalizer (Unit 22.6). Fault-tolerant non-Clifford gates, via magic states, belong to the Papers background chapters.',
      caption: 'T, then X, then T†: not a Pauli table',
      captionFormal: '$TXT^\\dagger$ is not a Pauli string',
      stage: mx({ product: [G('T'), pa('X'), G('Tdg')] }, { values: 'decimal' }),
      claims: [claim('q22TXT', '$TXT^\\dagger$ weighs $0.7071$ on each of $X$ and $Y$', () => close(V.q22TXT, Math.SQRT1_2, 1e-12))],
    },
  },
  {
    id: 'q22-gottesman-knill:b5',
    phase: 'deeper',
    text:
      `This chapter named codes by their checks and decoded them with tables. The Papers section builds on it: codes on a grid, operations between code blocks, and the codes of IBM’s *Tour de gross*.`,
    formal:
      `Stabilizer codes, CSS pairs $(H_X, H_Z)$, logical operators, distance and decoding are the vocabulary of the Papers section’s background chapters (surface codes, lattice surgery, magic states, Pauli-based computation, bivariate bicycle codes) and of *Tour de gross*, its first paper.`,
    caption: 'the Steane code by its checks',
    captionFormal: 'the Steane code by its generators',
    stage: code('steane7', { view: 'checks' }),
  },
]

export const Q22_STORY: Record<string, Beat[]> = {
  'q22-linear-codes': linear,
  'q22-stabilizer': stabilizer,
  'q22-check-matrix': checkMatrix,
  'q22-css': css,
  'q22-decode': decode,
  'q22-clifford': clifford,
  'q22-gottesman-knill': gk,
}

/** Every claim used anywhere in a unit's beats, for Unit.claims (content.test.tsx "claims hold"). */
function allClaims(beats: Beat[]): Claim[] {
  return beats.flatMap((b) => [
    ...(b.claims ?? []),
    ...(b.reveal?.claims ?? []),
    ...(b.derivation?.ground.flatMap((s) => s.claims ?? []) ?? []),
    ...(b.derivation?.formal?.flatMap((s) => s.claims ?? []) ?? []),
  ])
}
export const Q22_UNIT_CLAIMS_BY_ID: Record<string, Claim[]> = Object.fromEntries(Object.entries(Q22_STORY).map(([id, beats]) => [id, allClaims(beats)]))
