/**
 * Lecture 9 scroll story (owner: P). Beats per docs/roles/proposals/P-L9-story.md §1, with the judge's rulings
 * (docs/roles/decisions/448-L8L11.md, L9 section):
 * - R1: no `pair-grid` kind. Every picture is the `matrix` stage kind's pair view (content/stage.ts `PairSource`, `PairTable`;
 *   stage/svg/matrix.ts): the table of boxes of H_A ⊗ H_B with ket labels, the coin–die 2 × 6 table, a classical table of CHANCES.
 * - R2: class marker "Class 9 · from minute 23" on `l9-tensor:b1` (the first 23 minutes of Class 9 finished BB84, Lecture 8).
 * - R3 (Rosetta): the notes' |ϕ⟩_B is |ψ_B⟩ here (`l9-product:b1`); the proof's coefficients a, b, c, d are α_u, α_d, β_u, β_d, because
 *   d already labels |d⟩ (`l9-singlet:b3`); σ_A and σ_B are numbers painted on coins, not Pauli matrices (`l9-classical:b1`).
 * - R4: the determinant test and its live readout (and the verdict "product / not a product") appear ONLY in the two Go-deeper
 *   beats (`l9-counting:b7`, `l9-singlet:b8`); the exit-check clues show amplitudes alone, so a readout never answers a question.
 * - R6: L9 stops at "the pair has a state, the spins do not". "Nothing is known about each spin" is Lecture 10's; `l9-singlet:b5`
 *   only forwards to it.
 * - R8: Susskind's coin dealer is "the dealer" (Charlie plays in Lecture 10); the notes' name is said once, in a caption.
 *
 * Rules kept here (as in L1–L7.story.ts): stage states carry physics inputs only (the resolver computes every box, total and
 * determinant); every number in the prose comes from L9.values.ts and is backed by a keyed claim; clue beats are click-to-reveal;
 * core text keeps sentences ≤ 25 words and defines symbols before use. Chips into Physics 709 (`<<sl-…|…>>`, content/bridges448.ts)
 * sit in clue reveals and Go-deeper beats, never in the notes' own line.
 */
import type { Beat, Dir, MatrixGridState, MatrixSource, PairSource, Ref, Scrub, StageKind, TermTarget } from './schema'
import type { Anchor } from './stageVocab'
import { V, claim, close, d, tf } from './L9.values'

/* ---------------------------------------------------------------------------------------------- */
/* Small builders (plain data out)                                                                 */
/* ---------------------------------------------------------------------------------------------- */

const t = (kind: StageKind, anchor: Anchor): TermTarget => ({ kind, anchor })
type Extra = Omit<MatrixGridState, 'kind' | 'source'>
const mx = (source: MatrixSource, extra: Extra = {}): MatrixGridState => ({ kind: 'matrix', shot: 'M-GRID', source, ...extra })
/** The boxes of photon ⊗ die (2 × 6, labels only) and of two spins (2 × 2, labels only). */
const DIE = (extra: Extra = {}): MatrixGridState => mx({ table: { frame: 'photon-die' } }, extra)
const SPINS = (extra: Extra = {}): MatrixGridState => mx({ table: { frame: 'spins' } }, extra)
/** The dealer's coins and two independent coins: tables of CHANCES. */
const DEALER = (extra: Extra = {}): MatrixGridState => mx({ table: { classical: 'dealer' } }, extra)
const INDEP = (pA: Scrub, pB: Scrub, extra: Extra = {}): MatrixGridState => mx({ table: { classical: 'independent', pA, pB } }, extra)
/** A pair STATE as a table of amplitudes (Alice's letter down the rows, Bob's across the columns). */
const state = (src: PairSource, extra: Extra = {}): MatrixGridState => mx({ coef: src }, { labels: 'ud', cells: 'amplitudes', ...extra })

const sweep = (from: number, to: number): Scrub => ({ from, to })
const P60: Dir = { thetaDeg: 60, phiDeg: 0 }
const prod = (a: Dir, b: Dir): PairSource => ({ pair: [a, b] })
const FAM = (tDeg: Scrub): PairSource => ({ family: 'ud-du', tDeg })
const SING: PairSource = { bell: '01-10' }
const UNI: PairSource = { named: 'uniform' }
const FLIP: PairSource = { named: 'flip' }
/** The boxes (row, column) of |ud⟩ and |du⟩: Alice's letter is the row, Bob's the column. */
const UD: [number, number] = [0, 1]
const DU: [number, number] = [1, 0]
const UU: [number, number] = [0, 0]

const susskind = (where: string, adds: string): Ref => ({ source: 'susskind', where, adds })

/* ---------------------------------------------------------------------------------------------- */
/* l9-tensor — Two systems need one new space                                                      */
/* ---------------------------------------------------------------------------------------------- */

const tensor: Beat[] = [
  {
    id: 'l9-tensor:b1',
    phase: 'lecture',
    classMark: { class: 9, from: 'minute 23' },
    text: 'Until now every state described one system. Real objects have parts: an atom has an electron and a nucleus, and a quantum processor has many two-level systems. What [[state-space|state space]] describes such a [[composite-system|composite system]] as a whole?',
    caption: 'the table of boxes the answer will fill · one box for every pair of labels',
    stage: DIE(),
  },
  {
    id: 'l9-tensor:b2',
    phase: 'lecture',
    introduces: ['composite-space'],
    text: 'Alice’s system has a state space $\\mathcal H_A$ and Bob’s has $\\mathcal H_B$. A ket of one cannot be added to a ket of the other, because they live in different spaces. The pair lives in a new space, the [[composite-space|composite space]] $\\mathcal H_{AB} = \\mathcal H_A \\otimes \\mathcal H_B$, built with the [[tensor-product|tensor product]] $\\otimes$.',
    caption: '$\\otimes$: the tensor product of the two spaces',
    stage: DIE(),
    fidelity: ['qc-pair-not-a-place'],
  },
  {
    id: 'l9-tensor:b3',
    phase: 'lecture',
    text: 'Let Alice hold a photon’s polarization, with basis kets $|H\\rangle$ and $|V\\rangle$, and Bob a quantum die with six faces, $|1\\rangle$ to $|6\\rangle$. The pair gets one basis state for each pair of labels, such as $|H4\\rangle = |H\\rangle_A \\otimes |4\\rangle_B$.',
    caption: 'the {{box|box}} in row $H$ and column 4 is $|H4\\rangle$',
    stage: DIE({ highlight: [[0, 3]] }),
    terms: { box: t('matrix', 'cell') },
    fidelity: ['qc-pair-labels-only'],
  },
  {
    id: 'l9-tensor:b4',
    phase: 'lecture',
    text: `Count the boxes: two rows times six columns give 12 basis states. In general $\\dim(\\mathcal H_A \\otimes \\mathcal H_B) = N_A N_B$, where $N_A$ and $N_B$ are the two dimensions. Dimensions multiply; they do not add. A pair state that favours no label would find each one with chance $${tf(V.l9Twelfth)}$.`,
    caption: '$2 \\times 6 = 12$ basis states, one box each',
    stage: DIE({ readouts: ['dims'] }),
    claims: [
      claim('l9DimCoinDie', 'photon ⊗ die has 2 · 6 = 12 basis states', () => V.l9DimCoinDie === 12),
      claim('l9Twelfth', 'an equal state finds each of the 12 labels with chance 1/12', () => close(V.l9Twelfth, 1 / 12)),
    ],
  },
  {
    id: 'l9-tensor:b5',
    phase: 'books',
    text: 'Susskind draws this very table. Alice’s labels run down the side, Bob’s across the top, and each box holds one combined state. He even writes Alice’s kets in a different bracket, so nobody adds them to Bob’s.',
    stage: DIE(),
    refs: [susskind('§6.1.2, Fig. 6.1', 'The coin–die table: Alice’s labels on the left, Bob’s across the top, one combined state per box, and Alice’s kets in a different bracket.')],
  },
  {
    id: 'l9-tensor:b6',
    phase: 'clue',
    text: 'The label $|H4\\rangle$ has two parts, $H$ and 4. Is it two states side by side?',
    stage: DIE({ highlight: [[0, 3]] }),
    reveal: {
      text: 'No. It is one state of the pair, and its two parts only record what each system shows. The tensor product builds a new space; it does not multiply two states into a number. <<sl-f6-pairs|Go further in 709: two systems, one joint space>>',
      caption: 'one box, one state of the pair',
      stage: DIE({ highlight: [[0, 3]], readouts: ['dims'] }),
    },
  },
]

/* ---------------------------------------------------------------------------------------------- */
/* l9-classical — Correlation without anything quantum                                             */
/* ---------------------------------------------------------------------------------------------- */

const classical: Beat[] = [
  {
    id: 'l9-classical:b1',
    phase: 'lecture',
    text: 'A dealer holds a penny and a dime. He hands one coin to Alice and the other to Bob, at random, and they part without looking. Score a penny $+1$ and a dime $-1$; the two scores are $\\sigma_A$ and $\\sigma_B$. The two deals are equally likely, so $P(+1,-1) = P(-1,+1) = \\tfrac12$.',
    caption: 'here $\\sigma_A$ and $\\sigma_B$ are just numbers painted on coins · the notes call the dealer Charlie',
    stage: DEALER(),
    fidelity: ['qc-chances-not-amplitudes'],
    claims: [claim('l9CharlieP', 'P(+1, −1) = P(−1, +1) = ½', () => close(V.l9CharlieP, 0.5))],
  },
  {
    id: 'l9-classical:b2',
    phase: 'lecture',
    text: 'Over many deals each average is $\\langle\\sigma_A\\rangle = \\langle\\sigma_B\\rangle = 0$. But the coins always differ, so $\\langle\\sigma_A\\sigma_B\\rangle = -1$. The [[statistical-correlation|correlation]] $\\langle\\sigma_A\\sigma_B\\rangle - \\langle\\sigma_A\\rangle\\langle\\sigma_B\\rangle$ is $-1$, not 0.',
    caption: 'a perfect anticorrelation, made by the dealer',
    stage: DEALER({ readouts: ['means'] }),
    fidelity: ['qc-chances-engine'],
    claims: [
      claim('l9CoinMeanA', '⟨σ_A⟩ = 0', () => close(V.l9CoinMeanA, 0)),
      claim('l9CoinMeanB', '⟨σ_B⟩ = 0', () => close(V.l9CoinMeanB, 0)),
      claim('l9CoinAB', '⟨σ_Aσ_B⟩ = −1', () => close(V.l9CoinAB, -1)),
      claim('l9CoinCorr', 'the correlation is −1', () => close(V.l9CoinCorr, -1)),
    ],
  },
  {
    id: 'l9-classical:b3',
    phase: 'lecture',
    text: 'Write $a$ and $b$ for the two scores. [[independent-systems|Independence]] means the joint chances factor: $P(a,b) = P_A(a)\\,P_B(b)$. Then $\\langle ab\\rangle = \\langle a\\rangle\\langle b\\rangle$, and the correlation is zero.',
    caption: `$P_A(+1) = ${d(V.l9BiasedPA, 1)}$ and $P_B(+1) = ${d(V.l9BiasedPB, 1)}$ give $\\langle a\\rangle = ${d(V.l9BiasedA, 1)}$, $\\langle b\\rangle = -${d(V.l9BiasedBSize, 1)}$ and $\\langle ab\\rangle = -${d(V.l9BiasedABSize, 2)}$`,
    stage: INDEP(0.7, 0.4, { readouts: ['means'] }),
    derivation: {
      result: '\\langle ab\\rangle = \\langle a\\rangle\\langle b\\rangle',
      ground: [
        {
          tex: '\\langle ab\\rangle = \\sum_{a,b} ab\\,P(a,b)',
          why: 'An average weights each product by its chance.',
          view: INDEP(0.7, 0.4, { readouts: ['means'] }),
          viewCaption: 'two separate coins: the table is a column of chances times a row of chances',
        },
        { tex: '= \\sum_{a,b} ab\\,P_A(a)\\,P_B(b)', why: 'Independence lets the joint chance split into one factor for each person.' },
        { tex: '= \\Big(\\sum_a a\\,P_A(a)\\Big)\\Big(\\sum_b b\\,P_B(b)\\Big)', why: 'The double sum separates into a sum over $a$ times a sum over $b$.' },
        {
          tex: '= \\langle a\\rangle\\langle b\\rangle',
          why: 'Each bracket is a plain average.',
          view: INDEP(0.5, 0.5, { readouts: ['means'] }),
          viewCaption: 'two fair coins: every box has the same chance, and the correlation is zero',
        },
      ],
    },
    fidelity: ['qc-chances-engine'],
    claims: [
      claim('l9BiasedPA', 'P_A(+1) = 0.7', () => close(V.l9BiasedPA, 0.7)),
      claim('l9BiasedPB', 'P_B(+1) = 0.4', () => close(V.l9BiasedPB, 0.4)),
      claim('l9BiasedA', '⟨a⟩ = 0.4', () => close(V.l9BiasedA, 0.4)),
      claim('l9BiasedBSize', '⟨b⟩ = −0.2', () => close(V.l9BiasedBSize, 0.2)),
      claim('l9BiasedABSize', '⟨ab⟩ = −0.08 = ⟨a⟩⟨b⟩', () => close(V.l9BiasedABSize, 0.08)),
    ],
  },
  {
    id: 'l9-classical:b4',
    phase: 'lecture',
    text: 'Nothing strange happened. The dealer made the correlation while the two coins were together, and each coin was definite all along. Alice’s ignorance is only about which coin she holds. Looking at her own coin tells her which one Bob holds.',
    stage: DEALER(),
  },
  {
    id: 'l9-classical:b5',
    phase: 'books',
    text: 'Susskind’s point: classical probability is incomplete knowledge of something that could, in principle, be known. In a classical whole, knowing everything about the whole means knowing everything about each part. Quantum pairs will break that rule.',
    stage: DEALER(),
    refs: [susskind('§6.2', 'Charlie’s penny and dime: perfect correlation with nothing quantum in it, and classical probability read as ignorance of a definite fact.')],
  },
  {
    id: 'l9-classical:b6',
    phase: 'clue',
    text: 'Two dealers who never meet each give a fair coin to Alice and to Bob. What is the correlation now?',
    stage: INDEP(0.5, 0.5),
    reveal: {
      text: `Zero. Every pair of coin values now has chance $${tf(V.l9IndepChance)}$, the table factors, and $\\langle\\sigma_A\\sigma_B\\rangle = 0 = \\langle\\sigma_A\\rangle\\langle\\sigma_B\\rangle$.`,
      caption: 'independent coins: nothing links the two',
      stage: INDEP(0.5, 0.5, { readouts: ['means'] }),
      claims: [
        claim('l9IndepChance', 'each of the four pairs of values has chance ¼', () => close(V.l9IndepChance, 0.25)),
        claim('l9IndepAB', '⟨σ_Aσ_B⟩ = 0', () => close(V.l9IndepAB, 0)),
      ],
    },
  },
]

/* ---------------------------------------------------------------------------------------------- */
/* l9-two-spins — Two spins: four basis states                                                     */
/* ---------------------------------------------------------------------------------------------- */

const twoSpins: Beat[] = [
  {
    id: 'l9-two-spins:b1',
    phase: 'lecture',
    introduces: ['two-spin-basis'],
    text: 'Now swap the coin and die for two spins. Write $|u\\rangle$ for $|{+z}\\rangle$ and $|d\\rangle$ for $|{-z}\\rangle$. Each spin’s state space has two dimensions, so the pair has $2 \\times 2 = 4$.',
    caption: 'four boxes, one for each way two spins can point along $z$',
    stage: SPINS(),
    claims: [claim('l9DimSpins', 'two spins have 2 · 2 = 4 basis states', () => V.l9DimSpins === 4)],
  },
  {
    id: 'l9-two-spins:b2',
    phase: 'lecture',
    text: '[[two-spin-basis|The pair’s $z$ basis]] is $|uu\\rangle$, $|ud\\rangle$, $|du\\rangle$ and $|dd\\rangle$. The first letter always belongs to Alice and the second to Bob, so $|du\\rangle = |d\\rangle_A \\otimes |u\\rangle_B$.',
    caption: 'row $d$ (Alice down), column $u$ (Bob up): the box $|du\\rangle$',
    stage: SPINS({ highlight: [DU] }),
    fidelity: ['qc-pair-first-letter'],
  },
  {
    id: 'l9-two-spins:b3',
    phase: 'lecture',
    text: 'The four are [[orthonormal-basis|orthonormal]]: $\\langle ab|a\'b\'\\rangle = \\delta_{aa\'}\\delta_{bb\'}$, with the [[kronecker-delta|Kronecker delta]] making both letters match. For example $\\langle ud|ud\\rangle = 1$, but $\\langle ud|du\\rangle = 0$.',
    caption: 'the two highlighted boxes are different basis states',
    stage: SPINS({ highlight: [UD, DU] }),
    claims: [
      claim('l9UdUd', '⟨ud|ud⟩ = 1', () => close(V.l9UdUd, 1)),
      claim('l9UdDu', '⟨ud|du⟩ = 0', () => close(V.l9UdDu, 0)),
    ],
  },
  {
    id: 'l9-two-spins:b4',
    phase: 'lecture',
    text: 'With an orthonormal basis, any combination is allowed: $|\\Psi\\rangle = \\psi_{uu}|uu\\rangle + \\psi_{ud}|ud\\rangle + \\psi_{du}|du\\rangle + \\psi_{dd}|dd\\rangle$. One four-dimensional state describes the pair, not two separate kets.',
    caption: 'here every $\\psi_{ab} = \\tfrac12$',
    stage: state(UNI),
    fidelity: ['qc-pair-boxes-engine'],
    claims: [
      claim('l9UniAmp', 'every amplitude is ½', () => close(V.l9UniAmp, 0.5)),
      claim('l9UniNorm', 'the four chances add to 1', () => close(V.l9UniNorm, 1)),
    ],
  },
  {
    id: 'l9-two-spins:b5',
    phase: 'books',
    text: 'Susskind gives Bob’s spin its own letter, so that it never mixes with Alice’s. He also asks you to read each pair label $ab$ as a single index: one state, one box.',
    stage: SPINS(),
    refs: [susskind('§§6.3–6.4', 'Alice’s spin and Bob’s spin named apart, and the pair’s four basis states written with a combined label.')],
  },
  {
    id: 'l9-two-spins:b6',
    phase: 'clue',
    text: 'Are $|ud\\rangle$ and $|du\\rangle$ the same state?',
    stage: SPINS({ highlight: [UD, DU] }),
    reveal: {
      text: 'No. In $|ud\\rangle$ Alice points up and Bob down; in $|du\\rangle$ it is the other way round. The two are [[orthogonal]].',
      caption: 'two different boxes · overlap 0',
      stage: SPINS({ highlight: [UD, DU] }),
      claims: [claim('l9UdDu', 'their overlap is 0', () => close(V.l9UdDu, 0))],
    },
  },
]

/* ---------------------------------------------------------------------------------------------- */
/* l9-product — Independent preparations give product states                                       */
/* ---------------------------------------------------------------------------------------------- */

const product: Beat[] = [
  {
    id: 'l9-product:b1',
    phase: 'lecture',
    text: 'Let Alice prepare $|\\psi_A\\rangle = \\alpha_u|u\\rangle + \\alpha_d|d\\rangle$ and, separately, let Bob prepare $|\\psi_B\\rangle = \\beta_u|u\\rangle + \\beta_d|d\\rangle$, each [[normalized]]. The pair’s state is the tensor product $|\\psi_A\\rangle \\otimes |\\psi_B\\rangle$.',
    caption: `the notes write $|\\phi\\rangle_B$ for Bob’s state; here $|\\psi_B\\rangle$ · Alice at $\\theta = 60^\\circ$: {{fa|$\\alpha_u = ${d(V.l9AlphaU)}$, $\\alpha_d = ${d(V.l9AlphaD, 1)}$}} · Bob along $+x$: {{fb|$\\beta_u = \\beta_d = ${d(V.l9BetaU)}$}}`,
    stage: state(prod(P60, '+x'), { factors: true }),
    terms: { fa: t('matrix', 'factor-a'), fb: t('matrix', 'factor-b') },
    fidelity: ['qc-pair-not-two-states'],
    claims: [
      claim('l9AlphaU', 'α_u = cos 30° = 0.866', () => close(V.l9AlphaU, Math.cos(Math.PI / 6))),
      claim('l9AlphaD', 'α_d = sin 30° = 0.5', () => close(V.l9AlphaD, 0.5)),
      claim('l9BetaU', 'β_u = 0.707', () => close(V.l9BetaU, Math.SQRT1_2)),
      claim('l9BetaD', 'β_d = 0.707', () => close(V.l9BetaD, Math.SQRT1_2)),
    ],
  },
  {
    id: 'l9-product:b2',
    phase: 'lecture',
    text: 'Multiply out term by term. Each joint amplitude is one of Alice’s times one of Bob’s: $\\psi_{uu} = \\alpha_u\\beta_u$, $\\psi_{ud} = \\alpha_u\\beta_d$, $\\psi_{du} = \\alpha_d\\beta_u$ and $\\psi_{dd} = \\alpha_d\\beta_d$.',
    caption: `the four boxes read ${d(V.l9ProdUU)}, ${d(V.l9ProdUD)}, ${d(V.l9ProdDU)}, ${d(V.l9ProdDD)}`,
    stage: state(prod(P60, '+x'), { factors: true }),
    derivation: {
      result: '\\psi_{ab} = \\alpha_a\\beta_b',
      ground: [
        {
          tex: '|\\psi_A\\rangle \\otimes |\\psi_B\\rangle = (\\alpha_u|u\\rangle + \\alpha_d|d\\rangle) \\otimes (\\beta_u|u\\rangle + \\beta_d|d\\rangle)',
          why: 'Write out both factors.',
          view: state(prod(P60, '+x'), { factors: true, cells: 'labels' }),
          viewCaption: 'the four empty boxes, and the two factors beside them',
        },
        {
          tex: '= \\alpha_u\\beta_u\\,|u\\rangle \\otimes |u\\rangle + \\alpha_u\\beta_d\\,|u\\rangle \\otimes |d\\rangle + \\alpha_d\\beta_u\\,|d\\rangle \\otimes |u\\rangle + \\alpha_d\\beta_d\\,|d\\rangle \\otimes |d\\rangle',
          why: 'The tensor product distributes over sums, and the numbers slide out of it.',
        },
        {
          tex: '= \\sum_{a,b} \\alpha_a\\beta_b\\,|ab\\rangle',
          why: 'Name the four basis kets $|ab\\rangle$ and sum over both letters, each running over $u$ and $d$.',
        },
        {
          tex: '\\psi_{ab} = \\alpha_a\\beta_b',
          why: 'The amplitude of $|ab\\rangle$ is the number multiplying it: one of Alice’s times one of Bob’s.',
          view: state(prod(P60, '+x'), { factors: true }),
          viewCaption: 'every box is Alice’s number for its row times Bob’s number for its column',
        },
      ],
    },
    fidelity: ['qc-pair-boxes-engine'],
    claims: [
      claim('l9ProdUU', 'ψ_uu = 0.612', () => close(V.l9ProdUU, V.l9AlphaU * V.l9BetaU)),
      claim('l9ProdUD', 'ψ_ud = 0.612', () => close(V.l9ProdUD, V.l9AlphaU * V.l9BetaD)),
      claim('l9ProdDU', 'ψ_du = 0.354', () => close(V.l9ProdDU, V.l9AlphaD * V.l9BetaU)),
      claim('l9ProdDD', 'ψ_dd = 0.354', () => close(V.l9ProdDD, V.l9AlphaD * V.l9BetaD)),
    ],
  },
  {
    id: 'l9-product:b3',
    phase: 'lecture',
    text: 'So the four amplitudes are not four free choices: two small states made them all. In the grid, {{fa|Alice’s column}} times {{fb|Bob’s row}} fills every box.',
    caption: 'each row is Bob’s row times one of Alice’s amplitudes',
    stage: state(prod({ thetaDeg: sweep(0, 180), phiDeg: 0 }, '+x'), { factors: true }),
    terms: { fa: t('matrix', 'factor-a'), fb: t('matrix', 'factor-b') },
    claims: [claim('l9ProdIsProduct', 'a product of an Alice state and a Bob state is a product state', () => V.l9ProdIsProduct === 1)],
  },
  {
    id: 'l9-product:b4',
    phase: 'lecture',
    text: 'Normalization comes free. The four chances add to $(|\\alpha_u|^2 + |\\alpha_d|^2)(|\\beta_u|^2 + |\\beta_d|^2)$, which is $1 \\cdot 1$, so no new condition is needed.',
    caption: `the four chances: ${d(V.l9ProdChanceTop, 3)}, ${d(V.l9ProdChanceTop, 3)}, ${d(V.l9ProdChanceBottom, 3)}, ${d(V.l9ProdChanceBottom, 3)}, and they add to 1`,
    stage: state(prod(P60, '+x'), { factors: true, cells: 'chances' }),
    derivation: {
      result: '\\langle\\Psi|\\Psi\\rangle = 1',
      ground: [
        {
          tex: '\\langle\\Psi|\\Psi\\rangle = |\\alpha_u\\beta_u|^2 + |\\alpha_u\\beta_d|^2 + |\\alpha_d\\beta_u|^2 + |\\alpha_d\\beta_d|^2',
          why: 'Add the chances of the four boxes.',
          view: state(prod(P60, '+x'), { factors: true, cells: 'chances' }),
          viewCaption: 'the four chances',
        },
        {
          tex: '= (|\\alpha_u|^2 + |\\alpha_d|^2)\\,|\\beta_u|^2 + (|\\alpha_u|^2 + |\\alpha_d|^2)\\,|\\beta_d|^2',
          why: 'Group the two terms that share each of Bob’s amplitudes.',
        },
        { tex: '= (|\\alpha_u|^2 + |\\alpha_d|^2)(|\\beta_u|^2 + |\\beta_d|^2)', why: 'Factor out the common bracket.' },
        {
          tex: '\\langle\\Psi|\\Psi\\rangle = 1',
          why: 'Each bracket is 1, because each spin was normalized on its own.',
          view: state(prod(P60, '+x'), { factors: true, cells: 'chances', readouts: ['norm'] }),
          viewCaption: 'the chances add to 1, with no extra condition',
        },
      ],
    },
    fidelity: ['qc-pair-boxes-engine'],
    claims: [
      claim('l9ProdChanceTop', 'the top two chances are 0.375 …', () => close(V.l9ProdChanceTop, V.l9AlphaU ** 2 * V.l9BetaU ** 2)),
      claim('l9ProdChanceBottom', '… and the bottom two are 0.125', () => close(V.l9ProdChanceBottom, V.l9AlphaD ** 2 * V.l9BetaD ** 2)),
      claim('l9ProdNorm', 'the chances add to 1', () => close(V.l9ProdNorm, 1)),
    ],
  },
  {
    id: 'l9-product:b5',
    phase: 'lecture',
    text: 'Two uses of the word product. The tensor-product space $\\mathcal H_A \\otimes \\mathcal H_B$ holds every state of the pair. A [[product-state|product state]] is one special vector in it, made by independent preparations.',
    stage: state(prod(P60, '+x'), { factors: true }),
  },
  {
    id: 'l9-product:b6',
    phase: 'clue',
    text: 'Turning Alice’s state changes every box of the grid. Does it change anything Bob can measure?',
    stage: state(prod({ thetaDeg: sweep(0, 180), phiDeg: 0 }, '+x'), { factors: true }),
    reveal: {
      text: 'No. Bob’s chance of $u$ is $|\\alpha_u\\beta_u|^2 + |\\alpha_d\\beta_u|^2 = |\\beta_u|^2$, whatever Alice did. His predictions are those of $|\\psi_B\\rangle$. <<sl-f6-kron|Go further in 709: the tensor product on vectors>>',
      caption: `Bob’s column totals stay ${d(V.l9BobPu, 1)} as Alice turns`,
      stage: state(prod({ thetaDeg: sweep(0, 180), phiDeg: 0 }, '+x'), { factors: true, cells: 'chances', readouts: ['marginals'] }),
      claims: [claim('l9BobPu', 'Bob’s chance of u is 0.5 at θ_A = 0°, 60°, 120° and 180°', () => close(V.l9BobPu, 0.5))],
    },
  },
]

/* ---------------------------------------------------------------------------------------------- */
/* l9-counting — Counting parameters: six is more than four                                        */
/* ---------------------------------------------------------------------------------------------- */

const counting: Beat[] = [
  {
    id: 'l9-counting:b1',
    phase: 'lecture',
    text: 'The rules allow every normalized vector of the four-dimensional space, not only products. The general state has four amplitudes $\\psi_{ab}$ with $|\\psi_{uu}|^2 + |\\psi_{ud}|^2 + |\\psi_{du}|^2 + |\\psi_{dd}|^2 = 1$.',
    caption: `an example: $\\psi_{ud} = ${d(V.l9Fam30Ud)}$ and $\\psi_{du} = -${d(V.l9Fam30Du, 1)}$, and the chances add to 1`,
    stage: state(FAM(30), { readouts: ['norm'] }),
    claims: [
      claim('l9Fam30Ud', 'ψ_ud = cos 30° = 0.866', () => close(V.l9Fam30Ud, Math.cos(Math.PI / 6))),
      claim('l9Fam30Du', 'ψ_du = −sin 30° = −0.5', () => close(V.l9Fam30Du, 0.5)),
      claim('l9Fam30Norm', 'the chances add to 1', () => close(V.l9Fam30Norm, 1)),
    ],
  },
  {
    id: 'l9-counting:b2',
    phase: 'lecture',
    text: 'Count real numbers. One spin has two complex amplitudes, which is four reals. Normalization removes one and the overall [[global-phase|phase]] another, leaving 2: the two Bloch angles. These are its [[parameter-count|real parameters]].',
    caption: 'one spin needs 2 real parameters, the product of two needs 4, a general pair 6',
    stage: state(prod(P60, '+x'), { factors: true, readouts: ['params'] }),
    claims: [claim('l9ParamsOne', 'one spin has 4 − 1 − 1 = 2 real parameters', () => V.l9ParamsOne === 2)],
  },
  {
    id: 'l9-counting:b3',
    phase: 'lecture',
    text: 'Two independent spins need $2 + 2 = 4$ real numbers. A general pair state has eight reals, minus one for normalization and one for the phase: $8 - 1 - 1 = 6$. Six is more than four.',
    caption: 'a general pair has 6 real parameters, a product of two spins only 4',
    stage: state(prod(P60, '+x'), { factors: true, readouts: ['params'] }),
    derivation: {
      result: '6 > 4',
      ground: [
        {
          tex: '\\text{one spin: } 4 - 1 - 1 = 2',
          why: 'A spin state has two complex amplitudes. Normalization and the overall phase each remove one real number.',
          view: state(prod(P60, '+x'), { factors: true, readouts: ['params'] }),
          viewCaption: 'two separate spins: a column times a row',
        },
        { tex: '\\text{two separate spins: } 2 + 2 = 4', why: 'Each spin is prepared on its own, so the counts add.' },
        { tex: '\\text{general pair: } 8 - 1 - 1 = 6', why: 'Four complex amplitudes are eight reals, with one normalization and one overall phase.' },
        {
          tex: '6 > 4',
          why: 'Six is more than four, so not every pair state is a product.',
          view: state(SING, { readouts: ['params'] }),
          viewCaption: 'a pair state that no two separate spins can make',
        },
      ],
    },
    claims: [
      claim('l9ParamsProduct', 'two separate spins need 2 + 2 = 4', () => V.l9ParamsProduct === 4),
      claim('l9ParamsGeneral', 'a general pair needs 8 − 1 − 1 = 6', () => V.l9ParamsGeneral === 6),
    ],
  },
  {
    id: 'l9-counting:b4',
    phase: 'lecture',
    text: 'So some states of the pair cannot be written $|\\psi_A\\rangle \\otimes |\\psi_B\\rangle$. They are called [[entangled]] states.',
    caption: 'one of them: no column times row gives this grid',
    stage: state(SING, { readouts: ['params'] }),
    fidelity: ['qc-pair-not-two-states'],
  },
  {
    id: 'l9-counting:b5',
    phase: 'books',
    text: 'Susskind counts the product state from both factors: eight reals, minus two normalizations and two phases, is four. He adds that entanglement has degrees: one pair state can be more entangled than another.',
    caption: 'the path $\\cos t\\,|ud\\rangle - \\sin t\\,|du\\rangle$, with $t$ from $0^\\circ$ to $45^\\circ$',
    stage: state(FAM(sweep(0, 45))),
    refs: [susskind('§§6.6–6.7', 'The parameter count for a product state and for a general state, and the remark that entanglement comes in degrees.')],
  },
  {
    id: 'l9-counting:b6',
    phase: 'clue',
    text: 'A product state and a general state both have four amplitudes. Why do they count differently?',
    stage: state(prod(P60, '+x'), { factors: true, readouts: ['params'] }),
    reveal: {
      text: 'A product’s four amplitudes come from two small states and must follow their pattern. The general four are free, up to normalization and one phase.',
      caption: '4 amplitudes, but 4 free parameters against 6',
    },
  },
  {
    id: 'l9-counting:b7',
    phase: 'deeper',
    text: 'Products form a thin four-parameter surface inside a six-parameter space. Pick a pair state at random and it is almost never a product: of 20 000 seeded random states, none was. <<sl-f6-growth|Go further in 709: how fast the gap grows with more spins>>',
    caption: 'along $\\cos t\\,|ud\\rangle - \\sin t\\,|du\\rangle$, with $t$ from $0^\\circ$ to $45^\\circ$: only $t = 0$ is a product',
    stage: state(FAM(sweep(0, 45)), { readouts: ['product'] }),
    refs: [susskind('§6.7', 'Entanglement comes in degrees, and a general pair state has six real parameters against four for a product; counting random states is beyond the book.')],
    claims: [claim('l9RandomProducts', 'none of 20 000 seeded random pair states was a product', () => V.l9RandomProducts === 0)],
  },
]

/* ---------------------------------------------------------------------------------------------- */
/* l9-singlet — The singlet: a pair with no separate states                                        */
/* ---------------------------------------------------------------------------------------------- */

const singlet: Beat[] = [
  {
    id: 'l9-singlet:b1',
    phase: 'lecture',
    text: 'Susskind’s central example is the [[singlet]], $|\\mathrm{sing}\\rangle = (|ud\\rangle - |du\\rangle)/\\sqrt2$. It is a perfectly good normalized state of the pair.',
    caption: `two boxes off the diagonal: +${d(V.l9SingUd)} at $ud$ and −${d(V.l9SingDu)} at $du$`,
    stage: state(SING, { readouts: ['norm'] }),
    claims: [
      claim('l9SingUd', 'ψ_ud = 0.707', () => close(V.l9SingUd, Math.SQRT1_2)),
      claim('l9SingDu', 'the size of ψ_du is 0.707', () => close(V.l9SingDu, Math.SQRT1_2)),
      claim('l9SingNorm', 'the chances add to 1', () => close(V.l9SingNorm, 1)),
    ],
  },
  {
    id: 'l9-singlet:b2',
    phase: 'lecture',
    text: 'Yet no product of an Alice state and a Bob state equals it. The pair has a definite state, while neither spin has a state vector of its own.',
    stage: state(SING, { readouts: ['norm'] }),
    fidelity: ['qc-pair-not-two-states'],
    claims: [claim('l9SingIsProduct', 'the singlet is not a product state', () => V.l9SingIsProduct === 0)],
  },
  {
    id: 'l9-singlet:b3',
    phase: 'lecture',
    text: 'Suppose the singlet did factor, as $(\\alpha_u|u\\rangle + \\alpha_d|d\\rangle) \\otimes (\\beta_u|u\\rangle + \\beta_d|d\\rangle)$. Matching the four amplitudes needs $\\alpha_u\\beta_u = 0$, $\\alpha_u\\beta_d = 1/\\sqrt2$, $\\alpha_d\\beta_u = -1/\\sqrt2$ and $\\alpha_d\\beta_d = 0$.',
    caption: 'the notes call these four numbers a, b, c, d; here $\\alpha_u, \\alpha_d, \\beta_u, \\beta_d$, because d already labels $|d\\rangle$',
    stage: state(SING, { highlight: [UD] }),
    derivation: {
      result: '|\\mathrm{sing}\\rangle \\ne |\\psi_A\\rangle \\otimes |\\psi_B\\rangle',
      ground: [
        {
          tex: '\\alpha_u\\beta_u = 0,\\quad \\alpha_u\\beta_d = \\tfrac{1}{\\sqrt2},\\quad \\alpha_d\\beta_u = -\\tfrac{1}{\\sqrt2},\\quad \\alpha_d\\beta_d = 0',
          why: 'Assume the singlet is a product and match its four amplitudes.',
          view: state(SING, { highlight: [UD] }),
          viewCaption: 'the box $ud$ needs $\\alpha_u\\beta_d$ to be $1/\\sqrt2$',
        },
        { tex: '\\alpha_u\\beta_d \\ne 0 \\;\\Rightarrow\\; \\alpha_u \\ne 0', why: 'A product of two numbers is not zero only if neither factor is zero.' },
        {
          tex: '\\alpha_u\\beta_u = 0 \\text{ and } \\alpha_u \\ne 0 \\;\\Rightarrow\\; \\beta_u = 0',
          why: 'The box $uu$ is empty, so with $\\alpha_u \\ne 0$ the other factor must vanish.',
          view: state(SING, { highlight: [UU] }),
          viewCaption: 'the box $uu$ is empty',
        },
        {
          tex: '\\alpha_d\\beta_u = 0 \\ne -\\tfrac{1}{\\sqrt2}',
          why: 'With $\\beta_u = 0$ the box $du$ would be empty, but the singlet fills it.',
          view: state(SING, { highlight: [DU] }),
          viewCaption: 'the box $du$ is not empty',
        },
        { tex: '|\\mathrm{sing}\\rangle \\ne |\\psi_A\\rangle \\otimes |\\psi_B\\rangle', why: 'The assumption led to a contradiction, so no such product exists.' },
      ],
    },
  },
  {
    id: 'l9-singlet:b4',
    phase: 'lecture',
    text: 'That is the new feature: we can know the pair’s state exactly while the two spins have no state vectors of their own. Lecture 10 asks what measurements on such a pair predict.',
    stage: state(SING, { readouts: ['norm'] }),
  },
  {
    id: 'l9-singlet:b5',
    phase: 'books',
    text: 'Susskind calls the singlet maximally entangled, as entangled as a pair can be, and leaves the no-factor proof as an exercise. What that means for each spin alone is Lecture 10’s question.',
    stage: state(SING),
    refs: [susskind('§6.7, Exercise 6.3', 'The singlet named as maximally entangled, and the proof that it is not a product left to the reader.')],
  },
  {
    id: 'l9-singlet:b6',
    phase: 'clue',
    text: 'Does $\\tfrac12(|uu\\rangle + |ud\\rangle + |du\\rangle + |dd\\rangle)$ split into one state for Alice and one for Bob? Try to factor it instead of counting terms.',
    stage: state(UNI),
    reveal: {
      text: 'Yes. It is $\\tfrac{|u\\rangle + |d\\rangle}{\\sqrt2}$ for Alice times the same for Bob: $|{+x}\\rangle$ twice. Many terms do not make a state entangled.',
      caption: 'Alice along $+x$ times Bob along $+x$: the same four boxes',
      stage: state(prod('+x', '+x'), { factors: true }),
      claims: [
        claim('l9ExitPlusPlus', 'the four-term state is |+x⟩ ⊗ |+x⟩', () => V.l9ExitPlusPlus === 1),
        claim('l9ExitProduct', 'it is a product state', () => V.l9ExitProduct === 1),
      ],
    },
  },
  {
    id: 'l9-singlet:b7',
    phase: 'clue',
    text: 'Flip one sign: $\\tfrac12(|uu\\rangle + |ud\\rangle + |du\\rangle - |dd\\rangle)$. Product or not?',
    stage: state(FLIP),
    reveal: {
      text: 'Not. Equal $\\alpha_u\\beta_u$ and $\\alpha_u\\beta_d$ force $\\beta_u = \\beta_d$; equal $\\alpha_u\\beta_u$ and $\\alpha_d\\beta_u$ force $\\alpha_u = \\alpha_d$. Then $\\alpha_d\\beta_d$ would equal $+\\tfrac12$, never $-\\tfrac12$.',
      caption: 'one sign changed, and no column times row reaches it',
      stage: state(FLIP, { highlight: [[1, 1]] }),
      claims: [claim('l9FlipProduct', 'the sign-flipped state is not a product', () => V.l9FlipProduct === 0), claim('l9UniAmp', 'the boxes have size ½', () => close(V.l9UniAmp, 0.5))],
    },
  },
  {
    id: 'l9-singlet:b8',
    phase: 'deeper',
    text: 'A quick [[product-test|test]]: a pair state is a product exactly when $\\psi_{uu}\\psi_{dd} - \\psi_{ud}\\psi_{du} = 0$. The singlet gives $\\tfrac12$, the most any state can reach. Along $\\cos t\\,|ud\\rangle - \\sin t\\,|du\\rangle$ the test value grows from 0 to $\\tfrac12$. <<sl-f6-product-or-not|Go further in 709: the same test as a rank>> <<sl-q9-schmidt|Go further in 709: degrees of entanglement>> <<sl-q6-entangled|Go further in 709: product and entangled states>>',
    caption: `$t = 15^\\circ$: ${d(V.l9Det15)} · $30^\\circ$: ${d(V.l9Det30)} · $45^\\circ$ (singlet): ${d(V.l9SingDet)}`,
    stage: state(FAM(sweep(0, 45)), { readouts: ['det', 'product'] }),
    refs: [susskind('§6.7', 'The singlet named as maximally entangled, and entanglement in degrees; the determinant as a number for the degree is beyond the book.')],
    claims: [
      claim('l9Det15', 'at t = 15° the test value is 0.250', () => close(V.l9Det15, 0.25)),
      claim('l9Det30', 'at t = 30° it is 0.433', () => close(V.l9Det30, Math.sqrt(3) / 4)),
      claim('l9SingDet', 'the singlet gives 0.500', () => close(V.l9SingDet, 0.5)),
      claim('l9ProdDet', 'a product state gives 0', () => close(V.l9ProdDet, 0)),
      claim('l9DetMax', 'no state of 20 000 random ones beats ½', () => V.l9DetMax === 1),
    ],
  },
]

export const L9_STORY: Record<string, Beat[]> = {
  'l9-tensor': tensor,
  'l9-classical': classical,
  'l9-two-spins': twoSpins,
  'l9-product': product,
  'l9-counting': counting,
  'l9-singlet': singlet,
}
