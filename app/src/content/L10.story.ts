/**
 * Lecture 10 scroll story (owner: P). Beats per docs/roles/proposals/P-L10-story.md §1, with the judge's rulings
 * (docs/roles/decisions/448-L8L11.md, L10 section):
 * - R1: the class marker "Class 11 starts here" sits on the first beat of `l10-quantum-wins` (`Beat.classMark`); the notes' Lecture 11
 *   §11.1 recap (the classical proof re-run with measurement names) is folded into unit 6 as the sentence that says so.
 * - R2: Lecture 11's names throughout (A_Z, A_X, answers ±1, instruction strings ZZZ, ZXX, XZX, XXZ). The one Rosetta beat for Lecture 10's
 *   bit encoding is `l10-no-table:b1`; the notes' X, Y, Z for the Pauli matrices has its own (`l10-local:b2`).
 * - R3: the preparer of the instruction tables is "the source" (Charlie is a player two units later); the players are Alice, Bob,
 *   Charlie, and "the referee" (the notes' "Davie" and "referee Charlie" of Lecture 11 are named once, in the Rosetta caption).
 * - R4: Go-deeper material uses the `'deeper'` phase (unit 3 has two beats, units 7 and 8 one each).
 * - R5: the two-spin pictures use the matrix kind's pair view (`labels: 'ud'`, L9 R1) and the two-qubit kind's additive fields
 *   (`family.pair`, tableau `targets`, the `{terms}` amplitude source); no `labels: 'ud'` on the amplitude bars (A4 dropped).
 *
 * Rules kept here (as in L1–L9.story.ts): stage states carry physics inputs only (the resolvers compute every box, bar, arrow, cell and
 * verdict); a plan's answers on a card come from the engine (L10.values.ts `CARD`); every number in the prose comes from L10.values.ts and
 * is backed by a keyed claim; clue beats are click-to-reveal; core text keeps sentences ≤ 25 words and defines symbols before use. Chips
 * into Physics 709 (`<<sl-…|…>>`, content/bridges448.ts) sit in clue reveals and Go-deeper beats, never in the notes' own line.
 */
import type { AmpSource, AmplitudesState, BallPoint, BallState, Beat, MatrixGridState, MatrixSource, MatrixTableauState, PairSource, PlotPointsState, PlotState, Ref, Scrub, TwoQubitSource, TwoQubitState } from './schema'
import type { Circuit, GateName, GateOp } from '../physics/qc/circuit'
import { CARD, GT, V, claim, close, d, tf, uf } from './L10.values'

/* ---------------------------------------------------------------------------------------------- */
/* Small builders (plain data out)                                                                 */
/* ---------------------------------------------------------------------------------------------- */

const sweep = (from: number, to: number): Scrub => ({ from, to })
const susskind = (where: string, adds: string): Ref => ({ source: 'susskind', where, adds })

/** One gate on one wire (a controlled gate carries `ctl`); a column holds gates on different wires. */
const gate = (g: GateName, target: number, ctl?: number): GateOp => ({ op: 'gate', gate: g, targets: [target], ...(ctl === undefined ? {} : { controls: [ctl] }) })
const circuit = (qubits: number, init: string, columns: GateOp[][]): Circuit => ({ version: 1, qubits, init, columns })
/** The singlet as a circuit (X on both wires, H on Alice, CNOT 0 → 1): a circuit starts from a bit string, so the state is built, then acted on. */
const SING_COLS: GateOp[][] = [[gate('X', 0), gate('X', 1)], [gate('H', 0)], [gate('X', 1, 0)]]
/** |G⟩ as a circuit (H on Alice, CNOT 0 → 1 and 0 → 2, then H and S on every wire): the engine confirms it equals `{terms}` exactly. */
const G_COLS: GateOp[][] = [[gate('H', 0)], [gate('X', 1, 0)], [gate('X', 2, 0)], [gate('H', 0), gate('H', 1), gate('H', 2)], [gate('S', 0), gate('S', 1), gate('S', 2)]]
/** The state a gate list leaves a base state in: "the operator acting on the state", from the engine, one gate per column. */
const onSing = (gates: GateOp[]): AmpSource => ({ circuit: circuit(2, '00', [...SING_COLS, ...gates.map((g) => [g])]) })
const onDu = (gates: GateOp[]): AmpSource => ({ circuit: circuit(2, '10', gates.map((g) => [g])) })
const onG = (gates: GateOp[], upTo?: Scrub): AmpSource => ({ circuit: circuit(3, '000', [...G_COLS, ...gates.map((g) => [g])]), ...(upTo === undefined ? {} : { upTo }) })

/** Two spins as a table of boxes (the matrix kind's pair view, Alice's letter down the rows). */
type PairExtra = Omit<MatrixGridState, 'kind' | 'source'>
const state = (src: PairSource, extra: PairExtra = {}): MatrixGridState => ({ kind: 'matrix', shot: 'M-GRID', source: { coef: src }, labels: 'ud', cells: 'amplitudes', ...extra })
const SING_SRC: PairSource = { bell: '01-10' }
const DU_SRC: PairSource = { ket: '10' }
/** Three spins as bars (the amplitudes kind). */
const amp = (src: AmpSource, extra: Partial<AmplitudesState> = {}): AmplitudesState => ({ kind: 'amplitudes', shot: 'A-BARS', state: src, ...('circuit' in src ? { showColumn: false } : {}), ...extra })
const G_SRC: AmpSource = { terms: GT }
/** Two reduced Bloch balls and the 3 × 3 table of averages. */
const tq = (source: TwoQubitSource, extra: Partial<TwoQubitState> = {}): TwoQubitState => ({ kind: 'two-qubit', shot: 'TQ-PAIR', source, arrows: 'reduced', labels: 'A-B', ...extra })
const SING_TQ: TwoQubitSource = { ket: { bell: '01-10' } }
const UD_TQ: TwoQubitSource = { ket: { ket: '01' } }
const PATH = (thetaDeg: Scrub): TwoQubitSource => ({ family: 'cos-sin', thetaDeg, pair: '01-10' })
/** The tableau of Pauli strings (one row per string), with optional needs, a card of answers, or a state. */
type TabExtra = Omit<MatrixTableauState, 'kind' | 'tableau'>
const tab = (rows: string[], extra: TabExtra = {}): MatrixTableauState => ({ kind: 'matrix', shot: 'M-GRID', tableau: rows, players: rows[0].length === 2 ? ['Alice', 'Bob'] : ['Alice', 'Bob', 'Charlie'], ...extra })
const GAME = ['ZZZ', 'ZXX', 'XZX', 'XXZ']
const NEED: Record<string, 1 | -1> = { ZZZ: 1, ZXX: -1, XZX: -1, XXZ: -1 }
const game = (extra: TabExtra = {}): MatrixTableauState => tab(GAME, { targets: NEED, ...extra })

/* Townsend pass (G3): pictures of the engine's matrices, the instruction tables, Bell's margin and a teleportation prefix */
const townsend = (where: string, adds: string): Ref => ({ source: 'townsend', where, adds })
const half = (...paulis: string[]): MatrixSource => ({ lin: paulis.map((p) => ({ c: '+1/2' as const, src: { pauli: p } })) })
/** S_z of the pair, (Z ⊗ I + I ⊗ Z)/2: bars at 1, 0, 0 and −1. */
const SZ_TOTAL: MatrixGridState = { kind: 'matrix', shot: 'M-GRID', source: half('ZI', 'IZ'), spectrum: 'bars', values: 'exact' }
/** The hyperfine energy matrix in units of A, (XX + YY + ZZ)/2, in the pair basis and in the total-spin basis. */
const HYPER: MatrixGridState = { kind: 'matrix', shot: 'M-GRID', source: half('XX', 'YY', 'ZZ'), spectrum: 'bars', values: 'exact' }
const HYPER_TOTAL: MatrixGridState = { ...HYPER, basis: [{ ket: '00' }, { bell: '01+10' }, { ket: '11' }, { bell: '01-10' }] }
const rhoOf = (source: MatrixSource): MatrixGridState => ({ kind: 'matrix', shot: 'M-GRID', source, partialTrace: 'B' })
const RHO_SING = rhoOf({ rho: { ket: { bell: '01-10' } } })
const RHO_MIX = rhoOf({ rho: { mixture: [{ w: 1 / 2, ket: { ket: '01' } }, { w: 1 / 2, ket: { ket: '10' } }] } })
/** The eight instruction tables of three axes (x = the table's number), each point the chance that Alice's and Bob's results differ. */
const TABLE_POINTS: PlotPointsState = {
  kind: 'plot',
  shot: 'P-CURVE',
  xLabel: 'kind of pair, 1 to 8',
  yLabel: 'chance results differ',
  points: Array.from({ length: 8 }, (_, k) => ({ x: k + 1, y: k === 0 || k === 7 ? V.l10TwTableSame : V.l10TwTableMixed, group: k === 0 || k === 7 ? 'all pairings' : 'a third of them' })),
  yLines: [
    { y: V.l10TwDeckFloor, label: 'tables' },
    { y: V.l10TwQuant120, label: 'singlet' },
  ],
}
/** Bell's margin for a middle axis halfway between a and b (engine `bellBisectGap`): above 0 the rule fails. */
const BELL_CURVE: PlotState = {
  kind: 'plot',
  shot: 'P-CURVE',
  curve: { fn: 'bellBisectGap', x: { from: 0, to: 180 } },
  markers: [
    { x: 60, label: 'worst' },
    { x: 90, label: 'no violation' },
  ],
  yLines: [{ y: 0, label: 'rule holds on or below' }],
}
/** Townsend's teleportation set-up: spin 1 in an unknown state (Ry 50°), a singlet on spins 2 and 3, then Alice's change to the Bell basis on spins 1 and 2. */
const TELE_CIRCUIT = circuit(3, '000', [
  [{ op: 'gate', gate: 'Ry', targets: [0], params: [(50 * Math.PI) / 180] }],
  [gate('X', 1), gate('X', 2)],
  [gate('H', 1)],
  [gate('X', 2, 1)],
  [gate('X', 1, 0)],
  [gate('H', 0)],
])
/** One spin as a Bloch ball: a point, a mixture, the centre. */
const ball = (point: BallPoint, extra: Partial<BallState> = {}): BallState => ({ kind: 'bloch-ball', shot: 'B-STD', point, ...extra })

/* ---------------------------------------------------------------------------------------------- */
/* l10-local — Alice's operators touch only Alice's spin                                           */
/* ---------------------------------------------------------------------------------------------- */

const local: Beat[] = [
  {
    id: 'l10-local:b1',
    phase: 'lecture',
    text: 'Last class we met [[entangled|entangled]] states, above all the [[singlet|singlet]]. It is a complete description of the pair. Yet it seems to say nothing about either spin. Today we make both statements precise.',
    caption: 'the singlet as a table of boxes · Lecture 9’s pair, with Alice’s letter down the side',
    stage: state(SING_SRC),
    fidelity: ['qc-pair-boxes-engine'],
    claims: [claim('l10SingAmp', 'the singlet’s amplitude on |ud⟩ is 1/√2 = 0.707', () => close(V.l10SingAmp, Math.SQRT1_2))],
  },
  {
    id: 'l10-local:b2',
    phase: 'lecture',
    introduces: ['pauli-letters'],
    text: 'From now on we write [[pauli-letters|$X$, $Y$ and $Z$]] for the Pauli matrices of Lecture 4. Each reads $+1$ or $-1$. We have $Z|u\\rangle = |u\\rangle$ and $Z|d\\rangle = -|d\\rangle$. The matrix $X$ swaps $|u\\rangle$ and $|d\\rangle$.',
    caption: '$Y|u\\rangle = i|d\\rangle$ and $Y|d\\rangle = -i|u\\rangle$ · the notes’ $X$, $Y$, $Z$ are the $\\sigma_x$, $\\sigma_y$, $\\sigma_z$ of Lecture 4',
    stage: { kind: 'bloch', shot: 'B-STD', state: '+z', measure: 'z' },
    claims: [
      claim('l10YonU', 'Y|u⟩ = i|d⟩: the coefficient of |d⟩ is i, of size 1', () => close(V.l10YonU, 1)),
      claim('l10YonDsize', 'Y|d⟩ = −i|u⟩: the coefficient of |u⟩ is −i, of size 1', () => close(V.l10YonDsize, 1)),
    ],
  },
  {
    id: 'l10-local:b3',
    phase: 'lecture',
    introduces: ['local-operator'],
    text: 'The state now describes the pair, so how can Alice measure $Z$ on her spin alone? Her [[local-operator|local operator]] acts on her letter and leaves Bob’s alone: $Z_A = Z \\otimes I$ and $X_B = I \\otimes X$. The identity $I$ keeps the other spin untouched.',
    caption: '$Z_A = Z \\otimes I$ · the identity fills Bob’s slot',
    stage: { kind: 'matrix', shot: 'M-GRID', source: { kron: [{ pauli: 'Z' }, { gate: { name: 'I' } }] }, values: 'exact', blocks: 2 },
    derivation: {
      result: 'Z_A|du\\rangle = -|du\\rangle',
      ground: [
        {
          tex: 'Z_A|du\\rangle = (Z \\otimes I)(|d\\rangle \\otimes |u\\rangle)',
          why: 'Write $Z_A$ as $Z \\otimes I$: $Z$ on the first slot, $I$ on the second.',
          view: state(DU_SRC),
          viewCaption: 'before: the box $|du\\rangle$ (Alice down, Bob up)',
        },
        {
          tex: '= (Z|d\\rangle) \\otimes (I|u\\rangle)',
          why: 'Each factor of the operator acts on its own spin.',
        },
        {
          tex: '= (-|d\\rangle) \\otimes |u\\rangle = -|du\\rangle',
          why: '$Z$ gives $-1$ on $|d\\rangle$, and $I$ changes nothing.',
          view: state(onDu([gate('Z', 0)])),
          viewCaption: 'after $Z$ on Alice: the same box, now with the opposite phase',
        },
      ],
    },
    claims: [
      claim('l10ZAdu', 'Z_A|du⟩ = −|du⟩', () => V.l10ZAdu === -1),
      claim('l10XBdu', 'X_B|du⟩ = |dd⟩', () => V.l10XBdu === 1),
    ],
  },
  {
    id: 'l10-local:b4',
    phase: 'lecture',
    text: 'Alice’s and Bob’s operators never get in each other’s way: $(A \\otimes I)(I \\otimes B) = A \\otimes B = (I \\otimes B)(A \\otimes I)$. So $[A_A, B_B] = 0$. Lecture 7 called such observables compatible, so their order never matters.',
    caption: '$Z_A$ and $X_B$ multiply to the same $ZX$ in either order',
    stage: tab(['ZI', 'IX'], { product: true }),
    claims: [
      claim('l10LocalCommute', 'Z_A and X_B commute', () => V.l10LocalCommute === 1),
      claim('l10LocalCommuteHS', 'H on Alice and S on Bob commute as matrices too', () => V.l10LocalCommuteHS === 1),
    ],
  },
  {
    id: 'l10-local:b5a',
    phase: 'books',
    text: 'Susskind calls Alice’s spin operators $\\sigma$ and Bob’s $\\tau$. The notes keep $X$, $Y$ and $Z$ and attach labels, because the same letters carry straight into the GHZ game.',
    stage: tab(['ZI', 'IX'], { product: true }),
    refs: [susskind('§6.8', 'Alice’s operators written σ and Bob’s τ, each acting on its own factor of the pair’s product space.')],
  },
  {
    id: 'l10-local:b5b',
    phase: 'books',
    text: 'Townsend turns a pair by turning each spin through the same angle. The generator is therefore the sum of the two spin operators, the pair’s [[total-spin|total spin]] (Townsend §5.3, p. 147, Eq. 5.24). With $\\hbar = 1$ its components are $S_x = \\frac{X_A + X_B}{2}$, and likewise $S_y$ and $S_z$. The two spins’ operators commute (p. 142, Eq. 5.6), so the sum obeys the single-spin rule $[S_x, S_y] = iS_z$ (p. 148, Eq. 5.25). Its component $S_z$ takes the values 1, 0, 0 and $-1$.',
    caption: 'bars: the values of $S_z$ for the pair · Townsend keeps $\\hbar$ in every operator; we set $\\hbar = 1$',
    stage: SZ_TOTAL,
    derivation: {
      result: '[S_x, S_y] = iS_z',
      ground: [
        {
          tex: 'S_x = \\frac{X_A + X_B}{2},\\quad S_y = \\frac{Y_A + Y_B}{2}',
          why: 'Add the two spins’ operators, each acting on its own slot.',
          view: tab(['XI', 'YI'], { product: true }),
          viewCaption: 'on one spin, $X$ then $Y$ gives $iZ$: the source of the commutator',
        },
        { tex: '[S_x, S_y] = \\frac{[X_A, Y_A] + [X_B, Y_B]}{4}', why: 'The cross terms vanish, because an operator of Alice commutes with one of Bob.' },
        { tex: '[X_A, Y_A] = 2iZ_A,\\quad [X_B, Y_B] = 2iZ_B', why: 'Each spin follows the single-spin rule for its own Pauli letters.' },
        {
          tex: '[S_x, S_y] = \\frac{2iZ_A + 2iZ_B}{4} = iS_z',
          why: 'Collect the terms: half of $Z_A + Z_B$ is $S_z$.',
          view: SZ_TOTAL,
          viewCaption: 'the values of $S_z$: 1, 0, 0 and $-1$',
        },
      ],
    },
    refs: [townsend('§5.3, pp. 147–148 (eqs. 5.24–5.25); §5.1, p. 142 (eq. 5.6)', 'Turning a pair turns each spin by the same angle, so its generator is the sum of the two spin operators, and the sum obeys the single-spin commutators.')],
    claims: [
      claim('l10TwCommRes', 'the commutator [Sx, Sy] − iSz of the summed spin is 0', () => close(V.l10TwCommRes, 0, 1e-9)),
      claim('l10TwSzMax', 'the largest value of Sz is 1', () => close(V.l10TwSzMax, 1, 1e-9)),
      claim('l10TwSzZeros', 'the value 0 appears twice among the values of Sz', () => V.l10TwSzZeros === 2),
    ],
  },
  {
    id: 'l10-local:b6',
    phase: 'clue',
    text: 'On the singlet, Alice measures $Z$ and Bob measures $X$. Does it matter who goes first?',
    stage: tab(['ZI', 'IX']),
    reveal: {
      text: `No. The operators commute, so the four joint chances are the same in either order: ${uf(V.l10ZXjoint)} for each pair of results. <<sl-f6-operator|Go further in 709: machines acting on one part>>`,
      caption: 'Alice along $+z$, Bob along $+x$ · four equal chances',
      stage: tq(SING_TQ, { axes: { a: ['+z'], b: ['+x'] }, grid: 'none' }),
      claims: [claim('l10ZXjoint', 'each of the four joint chances is ¼', () => close(V.l10ZXjoint, 0.25))],
    },
  },
]

/* ---------------------------------------------------------------------------------------------- */
/* l10-empty-centre — A known pair with unknown parts                                              */
/* ---------------------------------------------------------------------------------------------- */

const emptyCentre: Beat[] = [
  {
    id: 'l10-empty-centre:b1',
    phase: 'lecture',
    text: 'Ask what the singlet predicts for Alice’s spin alone. Let $Z_A$ act on it. Each term keeps its letters and only its sign changes, so $Z_A|\\mathrm{sing}\\rangle = (|ud\\rangle + |du\\rangle)/\\sqrt2$.',
    caption: 'the singlet · the derivation below lets $Z_A$ act on it',
    stage: state(SING_SRC),
    derivation: {
      result: '\\langle Z_A\\rangle = 0',
      ground: [
        {
          tex: 'Z_A|\\mathrm{sing}\\rangle = \\tfrac{1}{\\sqrt2}\\big(Z_A|ud\\rangle - Z_A|du\\rangle\\big)',
          why: 'The operator acts on each term of the singlet.',
          view: state(SING_SRC),
          viewCaption: 'the singlet',
        },
        {
          tex: '= \\tfrac{1}{\\sqrt2}\\big(|ud\\rangle + |du\\rangle\\big)',
          why: '$Z_A$ gives $+1$ on $|ud\\rangle$ and $-1$ on $|du\\rangle$, which flips the sign of the second term.',
          view: state(onSing([gate('Z', 0)])),
          viewCaption: 'after $Z_A$: both boxes now have the same phase',
        },
        {
          tex: '\\langle Z_A\\rangle = \\tfrac12\\big(\\langle ud| - \\langle du|\\big)\\big(|ud\\rangle + |du\\rangle\\big)',
          why: 'The average is the bracket of the singlet with $Z_A|\\mathrm{sing}\\rangle$.',
        },
        {
          tex: '= \\tfrac12(1 - 1) = 0',
          why: 'The kets $|ud\\rangle$ and $|du\\rangle$ are [[orthonormal-basis|orthonormal]], so the cross terms vanish and the two squares have opposite signs.',
          view: tq(SING_TQ, { grid: 'none', readouts: ['rLength'] }),
          viewCaption: 'Alice’s arrow has length 0: her spin predicts nothing',
        },
      ],
    },
    claims: [claim('l10ZAavg', '⟨Z_A⟩ = 0', () => close(V.l10ZAavg, 0))],
  },
  {
    id: 'l10-empty-centre:b2',
    phase: 'lecture',
    text: 'The same happens for $X$ and $Y$. Now $X_A|\\mathrm{sing}\\rangle = (|dd\\rangle - |uu\\rangle)/\\sqrt2$, which is [[orthogonal|orthogonal]] to the singlet, so $\\langle X_A\\rangle = 0$. Likewise $\\langle Y_A\\rangle = 0$, and Bob’s three averages vanish too.',
    caption: 'the state after $X_A$ · no box in common with the singlet',
    stage: state(onSing([gate('X', 0)])),
    claims: [
      claim('l10XAoverlap', '⟨sing|X_A|sing⟩ = 0', () => close(V.l10XAoverlap, 0)),
      claim('l10YAavg', '⟨Y_A⟩ = 0', () => close(V.l10YAavg, 0)),
      claim('l10BobAvgs', '⟨X_B⟩ = ⟨Y_B⟩ = ⟨Z_B⟩ = 0', () => close(V.l10BobAvgs, 0)),
    ],
  },
  {
    id: 'l10-empty-centre:b3',
    phase: 'lecture',
    text: `Take any axis $\\hat n$. The spin along it is $n_x X + n_y Y + n_z Z$, so its average is $n_x\\langle X_A\\rangle + n_y\\langle Y_A\\rangle + n_z\\langle Z_A\\rangle = 0$. With only $+1$ and $-1$ possible, both have chance $${tf(V.l10Phalf)}$ for every axis.`,
    caption: 'Alice’s arrow is a dot at the centre of her ball · the dashed line is the axis she measures',
    stage: tq(SING_TQ, { grid: 'none', axes: { a: [{ thetaDeg: 60, phiDeg: 30 }] }, readouts: ['rLength'] }),
    fidelity: ['qc-tq-local-arrows', 'tq-centre-dot'],
    claims: [
      claim('l10RA', 'the length of Alice’s arrow is 0', () => close(V.l10RA, 0)),
      claim('l10Phalf', 'along an axis at 60° and 30° she reads +1 with chance ½', () => close(V.l10Phalf, 0.5)),
    ],
  },
  {
    id: 'l10-empty-centre:b4',
    phase: 'lecture',
    text: 'Lecture 6 showed that ordinary ignorance fills the inside of the ball. If the spin is prepared in state $i$, with Bloch vector $\\vec r_i$ and chance $p_i$, the averages are $\\vec r_{\\mathrm{avg}} = \\sum_i p_i\\vec r_i$. Half $|{+z}\\rangle$ and half $|{-z}\\rangle$ gives the centre.',
    caption: `three quarters up and one quarter down would give an arrow ${d(V.l10Mix3to1Rz, 1)} long, along $+z$`,
    stage: ball({ mix: [{ of: '+z', w: 0.5 }, { of: '-z', w: 0.5 }] }, { recipe: true }),
    fidelity: ['ball-inside-not-partly-up'],
    claims: [
      claim('l10MixCentre', 'half up and half down average to the centre', () => close(V.l10MixCentre, 0)),
      claim('l10Mix3to1Rz', 'three quarters up and one quarter down give r_z = 0.5', () => close(V.l10Mix3to1Rz, 0.5)),
    ],
  },
  {
    id: 'l10-empty-centre:b5',
    phase: 'lecture',
    text: `There are two different kinds of uncertainty. A surface point is a known pure state, yet $X$ and $Y$ can still be 50/50. An inside point records ignorance of which pure state was made. At the centre every axis gives $+1$ with chance ${uf(V.l10CentreChance)}.`,
    caption: `$|{+z}\\rangle$ gives $+x$ with chance ${uf(V.l10PlusZx)}, and so does the centre`,
    stage: ball('+z', { compare: 'oven', measure: 'x' }),
    fidelity: ['ball-surface-pure', 'ball-born-inside'],
    claims: [
      claim('l10PlusZx', '|+z⟩ gives +x with chance ½', () => close(V.l10PlusZx, 0.5)),
      claim('l10CentreChance', 'at the centre every axis gives chance ½', () => close(V.l10CentreChance, 0.5)),
    ],
  },
  {
    id: 'l10-empty-centre:b6',
    phase: 'lecture',
    introduces: ['maximally-entangled'],
    text: 'Alice’s half of the singlet sits at the centre. But nobody is ignorant of the pair: it is one known pure state. We call such a pair [[maximally-entangled|maximally entangled]]. Alice alone looks exactly like a spin in an unknown direction.',
    caption: 'the centre of the ball · the pair’s own purity is 1',
    stage: { layout: 'split', top: ball('oven'), bottom: tq(SING_TQ, { grid: 'T', readouts: ['purity', 'rLength'] }) },
    fidelity: ['qc-tq-engine', 'qc-tq-not-two-places'],
    claims: [claim('l10PairPure', 'the pair’s purity is 1', () => close(V.l10PairPure, 1))],
  },
  {
    id: 'l10-empty-centre:b7a',
    phase: 'books',
    text: 'Townsend traces out one particle of an entangled pair and finds the matrix of a completely [[unpolarized|unpolarized]] beam. Susskind calls such a pair maximally entangled. Alice’s density matrix has $\\mathrm{Tr}\\,\\rho_A^2 = \\tfrac12$, the smallest a spin can have.',
    caption: 'the readout “Tr ρ² = 1” is the pair’s, not Alice’s',
    stage: tq(SING_TQ, { grid: 'none', readouts: ['purity', 'rLength'] }),
    refs: [
      { source: 'townsend', where: '§5.7, pp. 179–180', adds: 'Tracing out one particle of an entangled pair leaves a density matrix of a completely unpolarized beam, the same centre of the ball.' },
      susskind('§6.7; end of §6.8', '§6.7 names the singlet maximally entangled; the end of §6.8 explains why nothing is known about either part.'),
    ],
    claims: [claim('l10RhoAPurity', 'Tr ρ_A² = ½', () => close(V.l10RhoAPurity, 0.5))],
  },
  {
    id: 'l10-empty-centre:b7b',
    phase: 'books',
    text: `Townsend writes a state as a matrix, $\\rho = |\\psi\\rangle\\langle\\psi|$ (Townsend §5.7, p. 171, Eq. 5.70). For the singlet the matrix has four nonzero entries, two of them off the diagonal, each of size $${tf(V.l10TwCohPure)}$ (p. 179, Eq. 5.94). A fifty-fifty [[mixture|mixture]] of $|ud\\rangle$ and $|du\\rangle$ has the same diagonal and no off-diagonal entries (p. 180, Eq. 5.96). Those entries tell an entangled pair from a mixture. Trace out one spin and both leave $\\tfrac12 I$ (Eq. 5.97).`,
    caption: 'the mixture’s matrix: the singlet’s diagonal with no off-diagonal entries · his reduced operator is our $\\rho_A$',
    stage: RHO_MIX,
    derivation: {
      result: '\\rho_A = \\tfrac12|u\\rangle\\langle u| + \\tfrac12|d\\rangle\\langle d|',
      ground: [
        {
          tex: '\\rho = |\\mathrm{sing}\\rangle\\langle\\mathrm{sing}|',
          why: 'The pair is in a pure state, so its matrix is the ket times its bra.',
          view: RHO_SING,
          viewCaption: 'the singlet’s matrix: four nonzero entries, two of them off the diagonal',
        },
        {
          tex: '\\rho_A = \\sum_j \\langle j|_B\\,\\rho\\,|j\\rangle_B',
          why: 'To find Alice’s state, sum over Bob’s two basis kets, which traces his spin out.',
          view: tq(SING_TQ, { grid: 'none', readouts: ['purity', 'rLength'] }),
          viewCaption: 'Alice’s arrow shrinks to the centre: her spin alone is unpolarized',
        },
        { tex: '\\rho_A = \\tfrac12|u\\rangle\\langle u| + \\tfrac12|d\\rangle\\langle d|', why: 'Each of Bob’s kets leaves Alice with one term of weight one half.' },
      ],
    },
    refs: [townsend('§5.7, pp. 171–174, 179–180 (eqs. 5.70, 5.85, 5.90, 5.94–5.97)', 'Defines the state as a matrix and shows that the singlet and a 50:50 mixture differ in the off-diagonal entries but leave each spin at the centre of the ball.')],
    claims: [
      claim('l10TwPurPair', 'the singlet’s matrix has purity 1', () => close(V.l10TwPurPair, 1, 1e-9)),
      claim('l10TwPurMix', 'the 50:50 mixture’s matrix has purity ½', () => close(V.l10TwPurMix, 0.5, 1e-9)),
      claim('l10TwCohPure', 'each off-diagonal entry of the singlet’s matrix has size ½', () => close(V.l10TwCohPure, 0.5, 1e-9)),
      claim('l10TwCohMix', 'the mixture has no off-diagonal entry', () => close(V.l10TwCohMix, 0, 1e-9)),
      claim('l10TwXXmix', 'the mixture has ⟨X_A X_B⟩ = 0', () => close(V.l10TwXXmix, 0, 1e-9)),
      claim('l10TwXXpureMag', 'the singlet has ⟨X_A X_B⟩ of size 1', () => close(V.l10TwXXpureMag, 1, 1e-9)),
      claim('l10TwRedGap', 'tracing out Bob leaves Alice at I/2 exactly', () => close(V.l10TwRedGap, 0, 1e-9)),
    ],
  },
  {
    id: 'l10-empty-centre:b8',
    phase: 'clue',
    text: 'Alice’s statistics match a beam that is half $|{+z}\\rangle$ and half $|{-z}\\rangle$. So is her spin secretly up or down?',
    stage: tq(SING_TQ, { grid: 'T', highlight: ['xx'] }),
    reveal: {
      text: `No single-spin test can tell, but the pair can. A half-and-half mix of $|ud\\rangle$ and $|du\\rangle$ has average $\\langle X_AX_B\\rangle = 0$. The singlet gave $-1$ every time. <<sl-q9-partial-trace|Go further in 709: tracing out one part>>`,
      caption: 'the mix’s $xx$ cell is empty · the singlet’s was $-1$',
      stage: tq({ rho: { mixture: [{ w: 0.5, ket: { ket: '01' } }, { w: 0.5, ket: { ket: '10' } }] } }, { grid: 'T', highlight: ['xx'] }),
      claims: [
        claim('l10MixXX', 'the mixture’s xx average is 0', () => close(V.l10MixXX, 0)),
        claim('l10SingXX', 'the singlet’s xx average is −1', () => close(V.l10SingXX, -1)),
      ],
    },
  },
]

/* ---------------------------------------------------------------------------------------------- */
/* l10-correlations — The information lives in the correlations                                    */
/* ---------------------------------------------------------------------------------------------- */

const correlations: Beat[] = [
  {
    id: 'l10-correlations:b1',
    phase: 'lecture',
    introduces: ['product-observable'],
    text: 'Both players measure $Z$ and multiply their results. The observable for that product is $Z_AZ_B = Z \\otimes Z$, a [[product-observable|product observable]]. Let it act on the singlet: each term is a ket with one up and one down, so it flips a sign.',
    caption: 'the singlet · its two boxes have opposite phases',
    stage: state(SING_SRC),
    derivation: {
      result: 'Z_AZ_B|\\mathrm{sing}\\rangle = -|\\mathrm{sing}\\rangle',
      ground: [
        {
          tex: 'Z_AZ_B|\\mathrm{sing}\\rangle = \\tfrac{1}{\\sqrt2}\\big(Z_AZ_B|ud\\rangle - Z_AZ_B|du\\rangle\\big)',
          why: 'The operator acts on each term of the singlet.',
          view: state(SING_SRC),
          viewCaption: 'the singlet',
        },
        {
          tex: 'Z_AZ_B|ud\\rangle = (Z|u\\rangle) \\otimes (Z|d\\rangle) = -|ud\\rangle,\\quad Z_AZ_B|du\\rangle = -|du\\rangle',
          why: 'In both terms one spin is up (factor $+1$) and the other is down (factor $-1$).',
        },
        {
          tex: '= \\tfrac{1}{\\sqrt2}\\big(-|ud\\rangle + |du\\rangle\\big)',
          why: 'Both terms pick up the same factor $-1$.',
          view: state(onSing([gate('Z', 0), gate('Z', 1)])),
          viewCaption: 'after $Z_A$ and $Z_B$: every phase is reversed',
        },
        {
          tex: '= -|\\mathrm{sing}\\rangle',
          why: 'Factor out $-1$: the singlet comes back, reversed. It is an eigenstate with eigenvalue $-1$.',
          view: tq(SING_TQ, { grid: 'T', highlight: ['zz'] }),
          viewCaption: 'the $zz$ cell is $-1$: the two results are opposite',
        },
      ],
    },
    claims: [claim('l10ZZ', 'Z_AZ_B|sing⟩ = −|sing⟩', () => V.l10ZZ === -1)],
  },
  {
    id: 'l10-correlations:b2',
    phase: 'lecture',
    text: `So $z_Az_B = -1$ with certainty. Each result alone is a coin toss; the relation is certain. Lecture 9’s dealer, handing out a penny and a dime, behaves the same way. So far this still looks classical. The two results are never equal.`,
    caption: 'the $zz$ cell · opposite results, each pair with chance ½',
    stage: tq(SING_TQ, { grid: 'T', highlight: ['zz'] }),
    claims: [
      claim('l10ZZequal', 'the two Z results are never equal', () => close(V.l10ZZequal, 0)),
      claim('l10ZZoneSide', 'each opposite pair has chance ½', () => close(V.l10ZZoneSide, 0.5)),
    ],
  },
  {
    id: 'l10-correlations:b3',
    phase: 'lecture',
    text: 'Now both measure $X$. Then $X_AX_B|\\mathrm{sing}\\rangle = -|\\mathrm{sing}\\rangle$, so $x_Ax_B = -1$. The same holds for $Y$. For every matched axis the two results are opposite.',
    caption: 'the diagonal of the table is $-1$ in all three cells',
    stage: tq(SING_TQ, { grid: 'T', highlight: ['xx', 'yy', 'zz'] }),
    claims: [
      claim('l10XX', 'X_AX_B|sing⟩ = −|sing⟩', () => V.l10XX === -1),
      claim('l10YY', 'Y_AY_B|sing⟩ = −|sing⟩', () => V.l10YY === -1),
      claim('l10TgridDev', 'the whole table is −1 on the diagonal and 0 elsewhere', () => close(V.l10TgridDev, 0)),
    ],
  },
  {
    id: 'l10-correlations:b4',
    phase: 'lecture',
    introduces: ['correlation-grid'],
    text: `The key sentence: no single answer is predictable, yet the correlations are exact. Slide along $\\cos t\\,|ud\\rangle - \\sin t\\,|du\\rangle$ from $t = 0$, the product $|ud\\rangle$, to $t = 45^\\circ$, the singlet. Alice’s arrow shrinks from ${d(V.l10PathR0, 0)} to ${d(V.l10PathR30, 1)} to ${d(V.l10PathR45, 0)} while the [[correlation-grid|correlation grid]] fills in to $-1$.`,
    caption: `at $t = 30^\\circ$ each arrow is ${d(V.l10PathR30, 1)} long and the $xx$ cell is $-${d(V.l10PathXX30Size)}$ · at $t = 45^\\circ$ the singlet`,
    stage: tq(PATH(sweep(0, 45)), { grid: 'T', highlight: ['xx'] }),
    fidelity: ['qc-tq-grid-signed'],
    claims: [
      claim('l10PathR0', 'at 0° Alice’s arrow has length 1', () => close(V.l10PathR0, 1)),
      claim('l10PathR30', 'at 30° her arrow has length 0.5', () => close(V.l10PathR30, 0.5)),
      claim('l10PathR45', 'at 45° her arrow has length 0', () => close(V.l10PathR45, 0)),
      claim('l10PathXX0', 'at 0° the xx cell is 0', () => close(V.l10PathXX0, 0)),
      claim('l10PathXX30Size', 'at 30° the xx cell has size 0.866', () => close(V.l10PathXX30Size, Math.sqrt(3) / 2)),
      claim('l10PathXX45Size', 'at 45° the xx cell has size 1', () => close(V.l10PathXX45Size, 1)),
    ],
  },
  {
    id: 'l10-correlations:b5a',
    phase: 'books',
    text: 'Susskind adds the operator $\\vec\\sigma\\cdot\\vec\\tau = XX + YY + ZZ$, which no pair of separate detectors can read. The singlet is its eigenvector, with eigenvalue $-3$ (Susskind’s Exercise 6.9).',
    stage: tq(SING_TQ, { grid: 'T' }),
    refs: [susskind('§6.9, Exercise 6.9', 'The scalar product σ·τ of the two spin vectors as one observable of the pair. His Exercise 6.9 asks for the eigenvalues of the singlet and the triplets; the singlet is an eigenvector.')],
    claims: [
      claim('l10DotST', 'the singlet’s σ·τ average is −3', () => close(V.l10DotST, -3)),
      claim('l10DotSTeigen', 'the singlet is an eigenvector of XX + YY + ZZ', () => V.l10DotSTeigen === 1),
    ],
  },
  {
    id: 'l10-correlations:b5b',
    phase: 'books',
    text: `In hydrogen, the electron’s and proton’s spins feel a weak [[hyperfine|hyperfine]] coupling. Townsend writes its energy operator as $H = \\frac{2A}{\\hbar^2}\\,\\vec S_1 \\cdot \\vec S_2$, with a constant $A > 0$ (Townsend §5.2, p. 143, Eq. 5.9). In the pair basis it is a four-by-four matrix with one two-by-two block (p. 145, Eq. 5.14). Three states share the energy $\\tfrac12 A$, the triplet, and the singlet sits at $-\\tfrac32 A$ (pp. 145–146, Eqs. 5.16–5.20). The gap $2A$ is the radio line that astronomers use to map hydrogen in space. The total spin squared is 2 on the triplet and 0 on the singlet, in units of $\\hbar^2$ (pp. 148–149, Eqs. 5.26–5.27).`,
    caption: 'bars: the energies in units of $A$ · in our letters $H = \\tfrac A2\\,\\vec\\sigma\\cdot\\vec\\tau$, which reads $+1$ on the triplet and $-3$ on the singlet',
    stage: HYPER,
    derivation: {
      result: 'E_{\\text{triplet}} = \\tfrac{A}{2},\\quad E_{\\text{singlet}} = -\\tfrac{3A}{2}',
      ground: [
        {
          tex: 'H = \\frac{A}{2}\\,(XX + YY + ZZ)',
          why: 'Write the dot product of the two spin operators with Pauli letters, taking $\\hbar = 1$.',
          view: HYPER,
          viewCaption: 'the energy matrix in the pair basis, in units of $A$',
        },
        { tex: 'XX|ud\\rangle = YY|ud\\rangle = |du\\rangle,\\quad ZZ|ud\\rangle = -|ud\\rangle', why: 'The letters $X$ and $Y$ flip both spins, while $ZZ$ gives the sign.' },
        {
          tex: 'H = \\frac{A}{2}\\begin{pmatrix} 1 & 0 & 0 & 0 \\\\ 0 & -1 & 2 & 0 \\\\ 0 & 2 & -1 & 0 \\\\ 0 & 0 & 0 & 1 \\end{pmatrix}',
          why: 'Tabulate the results: $ZZ$ fills the diagonal, and $XX + YY$ links $|ud\\rangle$ with $|du\\rangle$.',
        },
        {
          tex: 'E_{\\text{triplet}} = \\tfrac{A}{2},\\quad E_{\\text{singlet}} = -\\tfrac{3A}{2}',
          why: 'In the total-spin basis the matrix is diagonal: three entries $\\tfrac{A}{2}$ and one $-\\tfrac{3A}{2}$.',
          view: HYPER_TOTAL,
          viewCaption: 'the same matrix in the basis of triplet and singlet: diagonal',
        },
      ],
    },
    refs: [townsend('§5.2, pp. 143–147 (eqs. 5.9–5.20); §5.3, pp. 148–149 (eqs. 5.26–5.27)', 'Couples the electron’s and proton’s spins as a multiple of S1·S2, finds a four-by-four matrix with a triplet of equal energies and a lone singlet, and links the gap to the radio line of hydrogen.')],
    claims: [
      claim('l10TwH11', 'the matrix entry for |uu⟩ is ½ (in units of A)', () => close(V.l10TwH11, 0.5, 1e-9)),
      claim('l10TwH22Mag', 'the entry for |ud⟩ has size ½ (it is negative)', () => close(V.l10TwH22Mag, 0.5, 1e-9)),
      claim('l10TwH23', 'the entry linking |ud⟩ and |du⟩ is 1', () => close(V.l10TwH23, 1, 1e-9)),
      claim('l10TwEUp', 'the triplet energy is ½ (in units of A)', () => close(V.l10TwEUp, 0.5, 1e-9)),
      claim('l10TwEDownMag', 'the singlet energy has size 3/2 (it is negative)', () => close(V.l10TwEDownMag, 1.5, 1e-9)),
      claim('l10TwEUpDeg', 'three states share the triplet energy', () => V.l10TwEUpDeg === 3),
      claim('l10TwGap', 'the gap is 2 (in units of A)', () => close(V.l10TwGap, 2, 1e-9)),
      claim('l10TwSigTauTrip', 'σ·τ reads +1 on the triplet', () => close(V.l10TwSigTauTrip, 1, 1e-9)),
      claim('l10TwSigTauSingMag', 'σ·τ has size 3 on the singlet (it is −3)', () => close(V.l10TwSigTauSingMag, 3, 1e-9)),
      claim('l10TwS2Trip', 'the total spin squared is 2 on the triplet', () => close(V.l10TwS2Trip, 2, 1e-9)),
      claim('l10TwS2Sing', 'the total spin squared is 0 on the singlet', () => close(V.l10TwS2Sing, 0, 1e-9)),
      claim('l10TwSdotTrip', '2 S1·S2 is ½ on the triplet', () => close(V.l10TwSdotTrip, 0.5, 1e-9)),
      claim('l10TwSdotSingMag', '2 S1·S2 has size 3/2 on the singlet', () => close(V.l10TwSdotSingMag, 1.5, 1e-9)),
    ],
  },
  {
    id: 'l10-correlations:b6',
    phase: 'clue',
    text: 'Alice measures $Z$ and Bob measures $X$. Is their product certain too?',
    stage: tq(SING_TQ, { grid: 'T', highlight: ['zx'] }),
    reveal: {
      text: `No. Here $\\langle Z_AX_B\\rangle = 0$, and all four pairs of results have chance ${uf(V.l10ZXjoint)}. Certainty needs matched axes. <<sl-q6-parities|Go further in 709: two parities>>`,
      caption: 'the $zx$ cell is empty',
      stage: tq(SING_TQ, { grid: 'T', highlight: ['zx'], axes: { a: ['+z'], b: ['+x'] } }),
      claims: [
        claim('l10ZX', '⟨Z_AX_B⟩ = 0', () => close(V.l10ZX, 0)),
        claim('l10ZXjoint', 'each of the four joint chances is ¼', () => close(V.l10ZXjoint, 0.25)),
      ],
    },
  },
  {
    id: 'l10-correlations:b7',
    phase: 'clue',
    text: 'The product state $|ud\\rangle$ also gives $z_Az_B = -1$ every time. What does the singlet have that $|ud\\rangle$ lacks?',
    stage: tq(UD_TQ, { grid: 'T' }),
    reveal: {
      text: 'The product $|ud\\rangle$ has definite single answers, so its arrows reach the surface, and it has no $xx$ or $yy$ correlation. The singlet has no single answers and all three correlations.',
      caption: 'the singlet · arrows at the centre, the whole diagonal filled',
      stage: tq(SING_TQ, { grid: 'T' }),
      claims: [
        claim('l10UDzz', '|ud⟩ has a zz correlation of −1', () => close(V.l10UDzz, -1)),
        claim('l10UDxx', '|ud⟩ has an xx correlation of 0', () => close(V.l10UDxx, 0)),
        claim('l10UDrz', '|ud⟩ gives Alice an arrow of length 1', () => close(V.l10UDrz, 1)),
      ],
    },
  },
  {
    id: 'l10-correlations:b8',
    phase: 'deeper',
    text: `For the singlet, $\\langle\\sigma_{\\hat n}\\otimes\\sigma_{\\hat m}\\rangle = -\\hat n\\cdot\\hat m$. With Alice along $z$ and Bob's axis $0^\\circ$, $60^\\circ$, $90^\\circ$, $120^\\circ$ and $180^\\circ$ away, the average runs $-1$, $-${d(V.l10Ang60size, 1)}$, $0$, $+${d(V.l10Ang120, 1)}$ and $+1$. At $60^\\circ$ the results differ with chance ${d(V.l10Opp60, 2)}$.`,
    caption: 'Bob’s axis turns from $0^\\circ$ to $180^\\circ$ while Alice’s stays along $z$',
    stage: tq(SING_TQ, { grid: 'T', axes: { a: ['+z'], b: [{ thetaDeg: sweep(0, 180), phiDeg: 0 }] } }),
    claims: [
      claim('l10Ang0', 'at 0° the average is −1', () => close(V.l10Ang0, -1)),
      claim('l10Ang60size', 'at 60° the average is −0.5', () => close(V.l10Ang60size, 0.5)),
      claim('l10Ang90', 'at 90° the average is 0', () => close(V.l10Ang90, 0)),
      claim('l10Ang120', 'at 120° the average is +0.5', () => close(V.l10Ang120, 0.5)),
      claim('l10Ang180', 'at 180° the average is +1', () => close(V.l10Ang180, 1)),
      claim('l10Opp60', 'at 60° the results differ with chance 0.75', () => close(V.l10Opp60, 0.75)),
    ],
  },
  {
    id: 'l10-correlations:b9',
    phase: 'deeper',
    text: `Bell's inequality combines four such settings. For any instruction table the combination $S$ cannot exceed ${d(V.l10LhvMax, 0)}. The singlet reaches $2\\sqrt2 \\approx ${d(V.l10Tsirelson, 2)}$ at the settings drawn. <<sl-q10-chsh|Go further in 709: the CHSH score>>`,
    caption: `the four settings drawn on the balls score $S = ${d(V.l10ChshDrawn, 2)}$`,
    stage: tq(SING_TQ, { grid: 'T', readouts: ['chsh'], axes: { a: ['+z', '+x'], b: [{ thetaDeg: 135, phiDeg: 180 }, { thetaDeg: 135, phiDeg: 0 }] } }),
    claims: [
      claim('l10LhvMax', 'an instruction table scores at most 2', () => close(V.l10LhvMax, 2)),
      claim('l10Tsirelson', 'the singlet reaches 2√2 = 2.83', () => close(V.l10Tsirelson, 2 * Math.SQRT2)),
      claim('l10ChshDrawn', 'the drawn settings score 2.83', () => close(V.l10ChshDrawn, 2 * Math.SQRT2)),
    ],
  },
]

/* ---------------------------------------------------------------------------------------------- */
/* l10-instructions — Could the answers be written in advance?                                     */
/* ---------------------------------------------------------------------------------------------- */

const SING_ZZXX = tab(['ZZ', 'XX'], { values: { ZZ: -1, XX: -1 }, state: { bell: '01-10' } })

const instructions: Beat[] = [
  {
    id: 'l10-instructions:b1',
    phase: 'lecture',
    text: 'Lecture 1 asked whether each atom carries [[hidden-label|hidden labels]]. Here too the source could hand each particle an [[instruction-table|instruction table]]: a fixed answer for every measurement it might meet. For example $A_Z = +1$ and $A_X = -1$ for Alice’s, and the opposite for Bob’s.',
    caption: 'a table that matches the singlet’s two perfect relations',
    stage: SING_ZZXX,
    fidelity: ['qc-matrix-tableau-engine'],
    claims: [claim('l10TableRows', 'the tables’ row products are the singlet’s eigenvalues −1 and −1', () => V.l10TableRows === 1)],
  },
  {
    id: 'l10-instructions:b2',
    phase: 'lecture',
    text: `Alice’s result then looks random only because she does not know which table came. Let the source pick one of the four matching tables at random. Alice’s $A_Z$ is $+1$ in ${d(V.l10Tables2AliceUp, 0)} of those ${d(V.l10Tables2, 0)} tables, so she reads $+1$ with chance ${uf(V.l10Tables2AliceShare)}.`,
    caption: `${d(V.l10Tables2, 0)} of the ${d(V.l10Tables2Of, 0)} two-setting tables give $ZZ = XX = -1$`,
    stage: SING_ZZXX,
    claims: [
      claim('l10Tables2', 'four two-setting tables match ZZ = XX = −1', () => V.l10Tables2 === 4),
      claim('l10Tables2Of', 'there are 16 two-setting tables in all', () => V.l10Tables2Of === 16),
      claim('l10Tables2AliceShare', 'Alice gets +1 for Z with chance ½', () => close(V.l10Tables2AliceShare, 0.5)),
    ],
  },
  {
    id: 'l10-instructions:b3',
    phase: 'lecture',
    text: 'Here is Bell’s question as a test we could run. Could all the quantum correlations be copied by tables written before any measurement? With these two settings the answer is still yes: nothing contradicts a table.',
    stage: SING_ZZXX,
  },
  {
    id: 'l10-instructions:b4a',
    phase: 'lecture',
    text: 'Here [[locality|local]] means this. A player’s answer may use her own setting and anything agreed in advance, but never a partner’s later choice. Shared randomness is allowed. Talking after the settings arrive is not.',
    caption: 'each player has two settings · neither sees the other’s',
    stage: tq(SING_TQ, { grid: 'none', axes: { a: ['+z', '+x'], b: ['+z', '+x'] } }),
  },
  {
    id: 'l10-instructions:b4b',
    phase: 'books',
    text: 'In Townsend §5.5, p. 157 (Eq. 5.40), the simplest model gives each particle an [[instruction-table|instruction]], such as ($+z$, $+x$). It holds an answer for a $z$ reading and one for an $x$ reading, though only one of them can be read. The partner carries every sign reversed. Four equal groups reproduce the $z$–$z$ and $x$–$x$ anticorrelation, and the independence of a $z$ and an $x$ reading.',
    caption: 'two readings, one row each: both rows read $-1$ for the singlet',
    stage: tab(['ZZ', 'XX'], { values: { ZZ: -1, XX: -1 }, state: { bell: '01-10' } }),
    refs: [townsend('§5.5, p. 157 (eq. 5.40)', 'A first model of hidden instructions: each particle carries a sign for a z reading and one for an x reading, its partner the opposite signs, in four equal groups.')],
  },
  {
    id: 'l10-instructions:b4c',
    phase: 'books',
    text: `Now let each player pick one of three flat axes $120^\\circ$ apart. An instruction becomes three signs, so there are ${d(V.l10TwTablesCount, 0)} kinds of pair (Townsend §5.5, p. 158, Eq. 5.41). Two kinds give opposite results every time when the axes differ. The other ${d(V.l10TwTablesMixedCount, 0)} do so in a third of the pairings. So when the players pick two different axes at random, any mixture of tables gives opposite results at least $${tf(V.l10TwDeckFloor)}$ of the time. Equal groups give $${tf(V.l10TwDeckUniform)}$ under the same picking. The singlet gives only $${tf(V.l10TwQuant120)}$ (pp. 159–160, Eqs. 5.48–5.49), which is $${tf(V.l10TwBelow)}$ below the floor.`,
    caption: 'the eight kinds of pair, numbered 1 to 8: the chance that the two results differ for each, against the floor and the singlet · kinds 1 and 8 are all plus and all minus',
    stage: TABLE_POINTS,
    derivation: {
      result: 'P^{\\text{tables}}_{\\text{differ}} \\ge \\tfrac13 > \\tfrac14 = P^{\\text{singlet}}_{\\text{differ}}',
      ground: [
        {
          tex: '\\text{each table: signs } (s_a, s_b, s_c) \\text{ for particle 1, the opposite signs for particle 2}',
          why: 'A table fixes a sign for each of the three axes, and the partner carries every sign reversed.',
          view: tab(['ZZ', 'XX'], { values: { ZZ: -1, XX: -1 }, state: { bell: '01-10' } }),
          viewCaption: 'with two axes, a pair reads opposite on each; three axes allow eight tables',
        },
        {
          tex: '\\text{tables } {+}{+}{+} \\text{ and } {-}{-}{-}:\\ \\text{results differ in every pairing}',
          why: 'Opposite signs on every axis mean opposite results whichever two axes are picked.',
          view: TABLE_POINTS,
          viewCaption: 'the first and last dots sit at the top',
        },
        { tex: '\\text{each of the other six tables}:\\ \\text{results differ in a fraction } \\tfrac13', why: 'Two of the six ordered pairs of different axes give opposite results.' },
        { tex: '\\text{any mixture of tables}:\\ P_{\\text{differ}} \\ge \\tfrac13', why: 'An average of numbers that are all at least a third is at least a third.' },
        {
          tex: 'P^{\\text{tables}}_{\\text{differ}} \\ge \\tfrac13 > \\tfrac14 = P^{\\text{singlet}}_{\\text{differ}}',
          why: 'For axes $120^\\circ$ apart the singlet gives $\\cos^2 60^\\circ$, below every mixture of tables.',
        },
      ],
    },
    refs: [townsend('§5.5, pp. 158–160 (eqs. 5.41–5.49; figs. 5.5–5.6)', 'Eight instruction tables for three axes 120 degrees apart: any mixture gives opposite results at least a third of the time, while the singlet gives a quarter.')],
    claims: [
      claim('l10TwTablesCount', 'three axes give 8 kinds of pair', () => V.l10TwTablesCount === 8),
      claim('l10TwTablesMixedCount', '6 of the 8 tables differ in a third of the pairings', () => V.l10TwTablesMixedCount === 6),
      claim('l10TwTableSame', 'two tables differ in every pairing', () => close(V.l10TwTableSame, 1, 1e-9)),
      claim('l10TwTableMixed', 'the other six differ in ⅓ of the pairings', () => close(V.l10TwTableMixed, 1 / 3, 1e-9)),
      claim('l10TwDeckFloor', 'no mixture of tables differs less than ⅓ of the time', () => close(V.l10TwDeckFloor, 1 / 3, 1e-9)),
      claim('l10TwDeckUniform', 'equal groups of the eight tables differ ½ of the time', () => close(V.l10TwDeckUniform, 0.5, 1e-9)),
      claim('l10TwQuant120', 'the singlet differs ¼ of the time at 120°', () => close(V.l10TwQuant120, 0.25, 1e-9)),
      claim('l10TwBelow', 'the singlet is 1/12 below the floor', () => close(V.l10TwBelow, 1 / 12, 1e-9)),
    ],
  },
  {
    id: 'l10-instructions:b4d',
    phase: 'books',
    text: `From the same eight kinds Townsend gets Bell’s inequality, $P({+a};{+b}) \\le P({+a};{+c}) + P({+c};{+b})$ (Townsend §5.5, p. 161, Eq. 5.54). The singlet gives $P({+a};{+b}) = \\tfrac12\\sin^2(\\theta_{ab}/2)$ (Eq. 5.57). Put $c$ halfway between $a$ and $b$, an angle $\\Theta$ from each. The rule then demands $\\sin^2\\Theta \\le 2\\sin^2(\\Theta/2)$ (p. 162, Eq. 5.59). At $60^\\circ$ the book’s two sides are $${tf(V.l10TwBell60Left)}$ and $${tf(V.l10TwBell60Right)}$, which breaks the rule; in plain chances they are $${tf(V.l10TwBellLeft)}$ and $${tf(V.l10TwBellRight)}$ (Eq. 5.60). Our calculation finds that the rule fails for every $\\Theta$ between $0^\\circ$ and $${d(V.l10TwBellCross, 0)}^\\circ$. It fails most at $${d(V.l10TwBellGapMaxAt, 0)}^\\circ$, with margin $${tf(V.l10TwBellGapMax)}$, and holds from $${d(V.l10TwBellCross, 0)}^\\circ$ on. Photon tests, such as Aspect’s, sided with quantum theory by many standard deviations (p. 164).`,
    caption: 'the margin $P({+a};{+b}) - P({+a};{+c}) - P({+c};{+b})$ against $\\Theta$: above zero, Bell’s rule fails',
    stage: BELL_CURVE,
    refs: [townsend('§5.5, pp. 161–162 (eqs. 5.50–5.60); pp. 163–164', 'Turns the eight kinds into Bell’s three-term inequality and shows with the singlet that it fails, for example at 60 degrees. The photon experiments are reported in words.')],
    claims: [
      claim('l10TwBell60Left', 'Townsend’s left side at Θ = 60° is ¾', () => close(V.l10TwBell60Left, 0.75, 1e-9)),
      claim('l10TwBell60Right', 'Townsend’s right side at Θ = 60° is ½', () => close(V.l10TwBell60Right, 0.5, 1e-9)),
      claim('l10TwBellLeft', 'the plain chance P(+a;+b) at Θ = 60° is ⅜', () => close(V.l10TwBellLeft, 3 / 8, 1e-9)),
      claim('l10TwBellRight', 'the plain chance P(+a;+c) + P(+c;+b) is ¼', () => close(V.l10TwBellRight, 0.25, 1e-9)),
      claim('l10TwBellGapMaxAt', 'the margin is largest at 60°', () => close(V.l10TwBellGapMaxAt, 60, 1e-9)),
      claim('l10TwBellGapMax', 'the largest margin is ⅛', () => close(V.l10TwBellGapMax, 0.125, 1e-9)),
      claim('l10TwBellCross', 'the margin returns to 0 at 90°', () => close(V.l10TwBellCross, 90, 1e-6)),
    ],
  },
  {
    id: 'l10-instructions:b5',
    phase: 'clue',
    text: 'Give each particle an answer for $X$, $Y$ and $Z$. Can a table match all three singlet correlations?',
    stage: tab(['XX', 'YY', 'ZZ']),
    reveal: {
      text: `Yes: ${d(V.l10Tables3, 0)} of the ${d(V.l10Tables3Of, 0)} tables do, with Bob’s answer the opposite of Alice’s on each axis. Matched axes alone can never refute tables, so we need a sharper test. <<sl-q10-hidden|Go further in 709: instruction sets>>`,
      caption: 'one such table · every row product is $-1$',
      stage: tab(['XX', 'YY', 'ZZ'], { values: { XX: -1, YY: -1, ZZ: -1 }, state: { bell: '01-10' } }),
      claims: [
        claim('l10Tables3', '8 of the three-setting tables match all three', () => V.l10Tables3 === 8),
        claim('l10Tables3Of', 'there are 64 three-setting tables in all', () => V.l10Tables3Of === 64),
      ],
    },
  },
]

/* ---------------------------------------------------------------------------------------------- */
/* l10-ghz-game — Three spins and a three-player game                                              */
/* ---------------------------------------------------------------------------------------------- */

const ghzGame: Beat[] = [
  {
    id: 'l10-ghz-game:b1',
    phase: 'lecture',
    introduces: ['bit-labels'],
    text: `Add a third spin, Charlie’s. The space becomes $\\mathcal H_A \\otimes \\mathcal H_B \\otimes \\mathcal H_C$, of dimension $2 \\times 2 \\times 2 = ${d(V.l10Dim3, 0)}$. For this game we [[bit-labels|relabel]] $|0\\rangle \\equiv |u\\rangle$ and $|1\\rangle \\equiv |d\\rangle$. The basis runs from $|000\\rangle$ to $|111\\rangle$.`,
    caption: 'eight basis states · one bar for each',
    stage: amp({ ket: '000' }),
    fidelity: ['qc-amp-engine', 'qc-amp-zero-is-up'],
    claims: [claim('l10Dim3', 'three spins have 2 · 2 · 2 = 8 basis states', () => V.l10Dim3 === 8)],
  },
  {
    id: 'l10-ghz-game:b2',
    phase: 'lecture',
    text: `Local operators work as before: $Z_A = Z \\otimes I \\otimes I$, and likewise $X_B$ and $X_C$. If all three measure and multiply their results, the observable is $Z \\otimes X \\otimes X$, written $ZXX$. It is an $${d(V.l10ZXXsize, 0)} \\times ${d(V.l10ZXXsize, 0)}$ matrix. Nothing new but one more label.`,
    caption: '$ZXX$ as an $8 \\times 8$ matrix · exact entries only',
    stage: { kind: 'matrix', shot: 'M-GRID', source: { pauli: 'ZXX' }, values: 'exact', blocks: 2 },
    claims: [claim('l10ZXXsize', 'ZXX is an 8 × 8 matrix', () => V.l10ZXXsize === 8)],
  },
  {
    id: 'l10-ghz-game:b3',
    phase: 'lecture',
    text: 'Now the [[ghz-game|GHZ game]]. Alice, Bob and Charlie agree a plan, then cannot talk. The referee picks one of four strings, $ZZZ$, $ZXX$, $XZX$ or $XXZ$. Each player sees only their own letter, measures that, and answers $+1$ or $-1$. They win if the [[parity|parity]] is right: an even number of $-1$ answers for $ZZZ$, an odd number for the other three.',
    caption: 'the four inputs, and the product each needs · $ZZZ$ needs $+1$, the rest need $-1$',
    stage: game(),
    fidelity: ['qc-matrix-tableau-engine', 'tableau-verdict-engine'],
  },
  {
    id: 'l10-ghz-game:b4',
    phase: 'lecture',
    text: `A simple plan: always answer $-1$. It wins $ZXX$, $XZX$ and $XXZ$, where the product of three $-1$s is $-1$. It loses $ZZZ$. That is ${d(V.l10AllMinusWins, 0)} of the four inputs, so it wins ${uf(V.l10AllMinusRate)} of the rounds. Can a cleverer plan reach all four?`,
    caption: 'the plan “always −1” · a ✓ for each input it wins',
    stage: game({ values: CARD.minus }),
    claims: [
      claim('l10AllMinusWins', '“always −1” wins 3 of the 4 inputs', () => V.l10AllMinusWins === 3),
      claim('l10AllMinusRate', '“always −1” wins ¾ of the rounds', () => close(V.l10AllMinusRate, 0.75)),
      claim('l10AllMinusLoses', '“always −1” loses ZZZ and wins the other three', () => V.l10AllMinusLoses === 1),
    ],
  },
  {
    id: 'l10-ghz-game:b5',
    phase: 'clue',
    text: 'Plan anything you like. Share coins, assign roles. Can you guarantee a win for every input?',
    stage: game(),
    reveal: {
      text: `You cannot. Each of the ${d(V.l10Tables, 0)} plans fails on an odd number of inputs: ${d(V.l10Wins3, 0)} fail on one, ${d(V.l10Wins1, 0)} on three, none on zero. The next unit shows why.`,
      caption: 'one plan: Alice $+1$ for $Z$ and $-1$ for $X$, the others always $-1$',
      stage: game({ values: CARD.t1 }),
      claims: [
        claim('l10Tables', 'a plan is six answers: 2⁶ = 64 plans', () => V.l10Tables === 64),
        claim('l10Wins3', '32 plans win exactly three inputs', () => V.l10Wins3 === 32),
        claim('l10Wins1', '32 plans win exactly one input', () => V.l10Wins1 === 32),
        claim('l10Wins0or2or4', 'no plan wins zero, two or four inputs', () => V.l10Wins0or2or4 === 0),
      ],
    },
  },
]

/* ---------------------------------------------------------------------------------------------- */
/* l10-no-table — No instruction table wins every round                                            */
/* ---------------------------------------------------------------------------------------------- */

const noTable: Beat[] = [
  {
    id: 'l10-no-table:b1',
    phase: 'lecture',
    text: 'Each answer is a sign, $+1$ or $-1$; Lecture 10 wrote it as a bit, with $(-1)^{\\text{bit}}$ the sign. An even number of $-1$s means a product of $+1$. A plan is then six fixed answers: $A_Z$, $A_X$, $B_Z$, $B_X$, $C_Z$ and $C_X$, each $+1$ or $-1$.',
    caption: 'Rosetta · Lecture 10 names the inputs by bits (0 means $Z$, 1 means $X$) and the answers $A_0$, $A_1$; Lecture 11 names them by the measurement, and so do we · Lecture 11 calls Charlie “Davie” and the referee “Charlie”',
    stage: game({ values: CARD.t1 }),
  },
  {
    id: 'l10-no-table:b2',
    phase: 'lecture',
    text: 'To win every input, one plan must meet all four needs at once. Multiply them. On the left every answer appears exactly twice, so the product is a product of squares, and every square is $+1$.',
    caption: 'the four needs · the left sides multiply to $+1$, the right sides to $-1$',
    stage: game(),
    derivation: {
      result: '+1 = -1',
      ground: [
        {
          tex: 'A_ZB_ZC_Z = +1,\\ \\ A_ZB_XC_X = -1,\\ \\ A_XB_ZC_X = -1,\\ \\ A_XB_XC_Z = -1',
          why: 'A winning plan meets the four needs together.',
          view: game(),
          viewCaption: 'the four needs',
        },
        {
          tex: '(A_ZB_ZC_Z)(A_ZB_XC_X)(A_XB_ZC_X)(A_XB_XC_Z) = (+1)(-1)(-1)(-1)',
          why: 'Multiply the four left sides, and the four right sides.',
        },
        {
          tex: 'A_Z^2A_X^2B_Z^2B_X^2C_Z^2C_X^2 = -1',
          why: 'Each of the six answers appears exactly twice on the left: look down each column of the table.',
          view: game({ values: CARD.t1 }),
          viewCaption: 'any plan: the four row products of its answers always multiply to $+1$',
        },
        {
          tex: '+1 = -1',
          why: 'Each answer squares to $+1$, so the left side is $+1$. The right side is $-1$. That is impossible.',
          view: game(),
          viewCaption: 'the needs multiply to $-1$',
        },
      ],
    },
    claims: [
      claim('l10ProdCard', 'the four row products of any plan multiply to +1', () => V.l10ProdCard === 1),
      claim('l10ProdTarget', 'the four needs multiply to −1', () => V.l10ProdTarget === -1),
    ],
  },
  {
    id: 'l10-no-table:b3',
    phase: 'lecture',
    text: `So no plan wins all four inputs. Each plan fails at least one of four equally likely inputs, so $P_{\\mathrm{win}} \\le ${tf(V.l10Classical)}$, and “always $-1$” reaches it. Lecture 11 opened by re-running this proof with the measurement names. Shared randomness only picks a plan at random, so it cannot beat ${uf(V.l10Classical)}.`,
    caption: `the best any plan does: ${d(V.l10MaxWins, 0)} of 4`,
    stage: game({ values: CARD.minus }),
    claims: [
      claim('l10Classical', 'the best classical win chance is ¾', () => close(V.l10Classical, 0.75)),
      claim('l10MaxWins', 'no plan wins more than 3 inputs', () => V.l10MaxWins === 3),
    ],
  },
  {
    id: 'l10-no-table:b4',
    phase: 'lecture',
    text: 'What failed is not cleverness or coordination. The players could plan together and share anything in advance. What failed is the assumption that each answer is fixed beforehand by the player’s own instruction alone.',
    stage: game({ values: CARD.minus }),
  },
  {
    id: 'l10-no-table:b5',
    phase: 'clue',
    text: 'Alice answers $+1$ to $Z$ and $-1$ to $X$. Bob and Charlie always answer $-1$. Which input loses?',
    stage: game(),
    reveal: {
      text: 'The input $ZXX$. Alice’s $+1$ times Bob’s $-1$ times Charlie’s $-1$ is $+1$, but $ZXX$ needs $-1$. The other three inputs win.',
      caption: 'this plan wins three inputs and loses $ZXX$',
      stage: game({ values: CARD.t1 }),
      claims: [
        claim('l10T1Wins', 'the plan wins 3 inputs', () => V.l10T1Wins === 3),
        claim('l10T1Loses', 'it loses ZXX only', () => V.l10T1Loses === 1),
      ],
    },
  },
  {
    id: 'l10-no-table:b6',
    phase: 'clue',
    text: 'Pick a plan at random each round. Can the average win rate beat three quarters?',
    stage: game(),
    reveal: {
      text: `No. An average of numbers that are each at most ${uf(V.l10Classical)} is at most ${uf(V.l10Classical)}. A plan picked uniformly from all ${d(V.l10Tables, 0)} wins half the time.`,
      caption: 'this plan’s four products are all $-1$, so it wins 3 of the 4 inputs',
      stage: game({ values: CARD.minus }),
      claims: [
        claim('l10RandomTable', 'a uniformly random plan wins half the time', () => close(V.l10RandomTable, 0.5)),
        claim('l10Classical', 'no plan wins more than ¾ of the inputs', () => close(V.l10Classical, 0.75)),
      ],
    },
  },
]

/* ---------------------------------------------------------------------------------------------- */
/* l10-quantum-wins — Sharing one state wins every round                                           */
/* ---------------------------------------------------------------------------------------------- */

const quantumWins: Beat[] = [
  {
    id: 'l10-quantum-wins:b1',
    phase: 'lecture',
    classMark: { class: 11 },
    text: 'The quantum plan is almost trivial to state. Told $Z$, measure $Z$; told $X$, measure $X$; report the result, $+1$ or $-1$. We need a state where $ZZZ$ is certainly $+1$ and $ZXX$, $XZX$, $XXZ$ are certainly $-1$.',
    caption: 'the same four needs · now met by measuring, not by looking up',
    stage: game(),
  },
  {
    id: 'l10-quantum-wins:b2',
    phase: 'lecture',
    text: `Let the three share the [[ghz-state|GHZ state]] $|G\\rangle = \\tfrac12\\big(|000\\rangle - |011\\rangle - |101\\rangle - |110\\rangle\\big)$. It has ${d(V.l10Gterms, 0)} terms, each of size ${uf(V.l10GampSize)}. The three local measurements commute, so their results can be multiplied.`,
    caption: `four bars of size ${uf(V.l10GampSize)} · the sign is the hue`,
    stage: amp(G_SRC, { dials: true }),
    fidelity: ['qc-amp-hue-is-phase'],
    claims: [
      claim('l10GampSize', 'each term of |G⟩ has size ½', () => close(V.l10GampSize, 0.5)),
      claim('l10Gnorm', '|G⟩ is normalized', () => close(V.l10Gnorm, 1)),
      claim('l10Gterms', '|G⟩ has 4 terms', () => V.l10Gterms === 4),
    ],
  },
  {
    id: 'l10-quantum-wins:b3',
    phase: 'lecture',
    text: 'First input $ZZZ$. Under $Z$, each $|1\\rangle$ picks up a factor $-1$. Every term of $|G\\rangle$ holds an even number of 1s, so each term is multiplied by $+1$. Hence $ZZZ|G\\rangle = +|G\\rangle$.',
    caption: 'the bars before and after $ZZZ$ are the same',
    stage: amp(G_SRC, { dials: true }),
    derivation: {
      result: 'ZZZ|G\\rangle = +|G\\rangle',
      ground: [
        {
          tex: 'Z|0\\rangle = +|0\\rangle,\\quad Z|1\\rangle = -|1\\rangle',
          why: 'Each $|1\\rangle$ in a term gives one factor $-1$.',
          view: amp(G_SRC),
          viewCaption: '$|G\\rangle$ before the operator',
        },
        {
          tex: '\\text{terms of } |G\\rangle:\\ 000,\\ 011,\\ 101,\\ 110',
          why: 'Every term has zero or two 1s: an even number.',
          view: amp(G_SRC, { mode: 'probability' }),
          viewCaption: 'the four terms and their chances',
        },
        {
          tex: 'ZZZ|G\\rangle = +|G\\rangle',
          why: 'An even number of factors $-1$ multiplies to $+1$, so every term keeps its sign.',
          view: amp(onG([gate('Z', 0), gate('Z', 1), gate('Z', 2)]), { dials: true }),
          viewCaption: 'after $Z$ on all three: the bars are unchanged',
        },
      ],
    },
    claims: [claim('l10ZZZ', 'ZZZ|G⟩ = +|G⟩', () => V.l10ZZZ === 1)],
  },
  {
    id: 'l10-quantum-wins:b4',
    phase: 'lecture',
    text: `The product is certain, but the single results are not. For example $(+1, -1, -1)$ also multiplies to $+1$. Under $ZZZ$ the strings 000, 011, 101 and 110 each come up with chance ${uf(V.l10GzzzProbs)}, and Alice alone gets $+1$ with chance ${uf(V.l10AliceHalf)}.`,
    caption: 'the chances of the eight strings when all three measure $Z$',
    stage: amp(G_SRC, { mode: 'probability' }),
    claims: [
      claim('l10GzzzProbs', 'under ZZZ each of the four allowed strings has chance ¼', () => close(V.l10GzzzProbs, 0.25)),
      claim('l10AliceHalf', 'under ZZZ Alice reads +1 with chance ½', () => close(V.l10AliceHalf, 0.5)),
    ],
  },
  {
    id: 'l10-quantum-wins:b5',
    phase: 'lecture',
    text: 'Second input $ZXX$. First $X_BX_C$ flips the last two bits of every term. Then $Z_A$ flips the sign of the terms that start with 1. The result is $-|G\\rangle$.',
    caption: 'the bars after $X_BX_C$, then after $Z_A$',
    stage: amp(onG([gate('X', 1), gate('X', 2), gate('Z', 0)], sweep(7, 8)), { dials: true }),
    derivation: {
      result: 'ZXX|G\\rangle = -|G\\rangle',
      ground: [
        {
          tex: 'X_BX_C|G\\rangle = \\tfrac12\\big(|011\\rangle - |000\\rangle - |110\\rangle - |101\\rangle\\big)',
          why: '$X$ turns $|0\\rangle$ into $|1\\rangle$ and back. Applied to the last two bits it swaps 000 with 011 and 101 with 110.',
          view: amp(onG([gate('X', 1), gate('X', 2)]), { dials: true }),
          viewCaption: 'after $X$ on Bob and Charlie',
        },
        {
          tex: 'ZXX|G\\rangle = \\tfrac12\\big(|011\\rangle - |000\\rangle + |110\\rangle + |101\\rangle\\big)',
          why: '$Z_A$ flips the sign of every term whose first bit is 1: the last two terms.',
          view: amp(onG([gate('X', 1), gate('X', 2), gate('Z', 0)]), { dials: true }),
          viewCaption: 'then $Z$ on Alice',
        },
        {
          tex: '= -\\tfrac12\\big(|000\\rangle - |011\\rangle - |101\\rangle - |110\\rangle\\big) = -|G\\rangle',
          why: 'Factor out $-1$: the original $|G\\rangle$ appears.',
          view: amp(G_SRC, { dials: true, globalPhaseDeg: 180 }),
          viewCaption: '$-|G\\rangle$: every bar turned by 180°, the same state as $|G\\rangle$',
        },
      ],
    },
    claims: [
      claim('l10ZXX', 'ZXX|G⟩ = −|G⟩', () => V.l10ZXX === -1),
      claim('l10ZXXvec', 'X_BX_C then Z_A gives exactly −|G⟩', () => V.l10ZXXvec === 1),
    ],
  },
  {
    id: 'l10-quantum-wins:b6',
    phase: 'lecture',
    text: `The state $|G\\rangle$ is symmetric among the three players. So the same argument gives $XZX|G\\rangle = -|G\\rangle$ and $XXZ|G\\rangle = -|G\\rangle$. All four conditions hold with certainty, and $P_{\\mathrm{win}} = ${d(V.l10QWin, 0)}$.`,
    caption: 'each row now meets its need · wins 4 of 4',
    stage: game({ state: { terms: GT } }),
    fidelity: ['tableau-verdict-engine'],
    claims: [
      claim('l10XZX', 'XZX|G⟩ = −|G⟩', () => V.l10XZX === -1),
      claim('l10XXZ', 'XXZ|G⟩ = −|G⟩', () => V.l10XXZ === -1),
      claim('l10QWin', 'the win chance is 1 for each input', () => close(V.l10QWin, 1)),
    ],
  },
  {
    id: 'l10-quantum-wins:b7',
    phase: 'clue',
    text: 'Every round is a win. Can Alice at least predict her own answer?',
    stage: amp(G_SRC, { mode: 'probability' }),
    reveal: {
      text: `No. For every input her answer is $+1$ with chance ${uf(V.l10AliceZXX)}. Only the product of the three answers is fixed.`,
      caption: 'the chances of the eight strings when Alice measures $Z$ and Bob and Charlie measure $X$ · only 001, 010, 100, 111 occur',
      stage: amp(onG([gate('H', 1), gate('H', 2)]), { mode: 'probability' }),
      claims: [claim('l10AliceZXX', 'under every input Alice reads +1 with chance ½', () => close(V.l10AliceZXX, 0.5))],
    },
  },
  {
    id: 'l10-quantum-wins:b8',
    phase: 'deeper',
    text: 'Is $|G\\rangle$ “the” GHZ state? Turn each spin by the same fixed operation: a Hadamard, then a phase. The textbook state $(|000\\rangle + |111\\rangle)/\\sqrt2$ becomes exactly $|G\\rangle$. The same turns carry Mermin’s four strings to $ZZZ$, $ZXX$, $XZX$ and $XXZ$, with the same ceiling of three. <<sl-q7-mermin|Go further in 709: Mermin’s argument>>',
    caption: 'the bars slide from the textbook state to $|G\\rangle$ · Hadamard, then phase, on each spin',
    stage: amp(onG([], sweep(3, 5)), { dials: true }),
    claims: [
      claim('l10Rotated', 'H then S on each spin turns the textbook GHZ state into |G⟩', () => V.l10Rotated === 1),
      claim('l10ConjXletterIsZ', 'the turn carries X to +Z', () => V.l10ConjXletterIsZ === 1 && V.l10ConjX === 1),
      claim('l10ConjYletterIsX', 'the turn carries Y to +X', () => V.l10ConjYletterIsX === 1),
      claim('l10MerminMax', 'Mermin’s strings also have a ceiling of three', () => V.l10MerminMax === 3),
    ],
  },
]

/* ---------------------------------------------------------------------------------------------- */
/* l10-what-ghz-proves — What the game proves about nature                                         */
/* ---------------------------------------------------------------------------------------------- */

const whatGhzProves: Beat[] = [
  {
    id: 'l10-what-ghz-proves:b1',
    phase: 'lecture',
    text: 'Suppose hidden information $\\lambda$ sits behind the randomness. The randomness would then be ordinary ignorance. Any extra local coin can be folded into [[local-hidden-variables|$\\lambda$]], so $\\lambda$ fixes one answer for every measurement a player might make.',
    caption: 'one value of $\\lambda$ is one plan · its product for each of the four inputs',
    stage: game({ values: CARD.t1 }),
  },
  {
    id: 'l10-what-ghz-proves:b2',
    phase: 'lecture',
    text: 'Locality adds a rule. For each $\\lambda$, Alice has $A_Z(\\lambda)$ and $A_X(\\lambda)$, and so on. The value of $\\lambda$ may change from round to round. But Alice’s entry never depends on what Bob and Charlie measure. That is the game’s no-talking rule.',
    caption: 'another value of $\\lambda$, another plan',
    stage: game({ values: CARD.other }),
  },
  {
    id: 'l10-what-ghz-proves:b3',
    phase: 'lecture',
    text: 'To copy the quantum correlations, every $\\lambda$ that ever occurs would need all four GHZ conditions at once. That is the same contradiction as before. Local hidden variables give one plan per $\\lambda$, and no plan fits. Quantum mechanics fits all four with certainty: this is [[bell-theorem|Bell’s theorem]].',
    caption: '|G⟩ meets all four needs · no plan does',
    stage: game({ state: { terms: GT } }),
    claims: [claim('l10ProdCard', 'every plan’s four row products multiply to +1', () => V.l10ProdCard === 1)],
  },
  {
    id: 'l10-what-ghz-proves:b4',
    phase: 'lecture',
    text: 'Bell’s own argument used a statistical bound, a [[bell-inequality|Bell inequality]], that experiments can test. They violate it, as quantum mechanics predicts. The 2022 Nobel Prize went to Clauser, Aspect and Zeilinger for tests with entangled photons.',
    caption: 'four settings, two per player · the test of Bell’s bound',
    stage: tq(SING_TQ, { grid: 'T', axes: { a: ['+z', '+x'], b: [{ thetaDeg: 135, phiDeg: 180 }, { thetaDeg: 135, phiDeg: 0 }] } }),
  },
  {
    id: 'l10-what-ghz-proves:b5',
    phase: 'lecture',
    text: `What it does not imply: no message travels ([[no-signalling|no signalling]]). Alice cannot choose whether her result is $+1$ or $-1$. Her chance stays ${uf(V.l10NoSignal)} whatever Bob and Charlie measure. The correlation shows only when the results are compared.`,
    caption: 'the input $ZXX$: Alice’s bit is 0 in two of the four strings that occur, so $+1$ has chance one half',
    stage: amp(onG([gate('H', 1), gate('H', 2)]), { mode: 'probability' }),
    claims: [claim('l10NoSignal', 'Alice’s chance of +1 is ½ under every input', () => close(V.l10NoSignal, 0.5))],
  },
  {
    id: 'l10-what-ghz-proves:b6',
    phase: 'lecture',
    text: 'In 1935 Einstein asked whether a distant choice could change what happens here. If Alice predicts Bob’s result without touching his spin, the answer may seem already to be there. GHZ shows that quantum randomness is not ignorance of local properties.',
    stage: tq(SING_TQ, { grid: 'T' }),
  },
  {
    id: 'l10-what-ghz-proves:b7a',
    phase: 'books',
    text: 'Susskind shows that anything Bob does to his own spin leaves Alice’s statistics unchanged. His “quantum simulation” cannot fake entangled correlations on two unconnected computers.',
    stage: tq(SING_TQ, { grid: 'T' }),
    refs: [
      susskind('§7.9', 'Bob’s local operations leave Alice’s statistics unchanged: no signal passes.'),
      susskind('§7.10', 'A classical simulation of the pair on two unconnected computers cannot reproduce the entangled correlations.'),
    ],
    claims: [claim('l10RAstill', 'after a gate on Bob, Alice’s arrow is still at the centre', () => close(V.l10RAstill, 0))],
  },
  {
    id: 'l10-what-ghz-proves:b7b',
    phase: 'books',
    text: `Townsend tilts Alice’s analyser by an angle $\\theta$ in the $x$–$z$ plane while Bob keeps $z$ (Townsend §5.4, pp. 155–156, Ex. 5.1). Adding the chances of Alice’s two results, Bob finds $+z$ with chance $\\tfrac12\\sin^2\\tfrac\\theta2 + \\tfrac12\\cos^2\\tfrac\\theta2 = \\tfrac12$ for every $\\theta$. Alice’s choice leaves Bob’s own data unchanged. Given her $+n$ at $60^\\circ$, Bob’s chance of $+z$ is $${tf(V.l10TwEprCond60)}$ and the joint chance is $${tf(V.l10TwEprJoint60)}$.`,
    caption: 'Alice’s analyser tilted to $60^\\circ$, Bob’s along $z$ · the book prints one of the four amplitudes with the opposite sign; every chance agrees',
    stage: tq(SING_TQ, { grid: 'none', axes: { a: [{ thetaDeg: 60, phiDeg: 0 }], b: ['+z'] } }),
    refs: [townsend('§5.4, pp. 152–156 (Ex. 5.1; figs. 5.3–5.4)', 'Shows that Bob’s own readings are 50:50 whatever angle Alice chooses, so Alice cannot send him a signal.')],
    claims: [
      claim('l10TwEprMargDev', 'Bob’s chance of +z stays ½ at every tilt (worst deviation 0)', () => close(V.l10TwEprMargDev, 0, 1e-9)),
      claim('l10TwEprCond60', 'given Alice’s +n at 60°, Bob’s chance of +z is ¼', () => close(V.l10TwEprCond60, 0.25, 1e-9)),
      claim('l10TwEprJoint60', 'the joint chance of Alice’s +n and Bob’s +z at 60° is ⅛', () => close(V.l10TwEprJoint60, 0.125, 1e-9)),
    ],
  },
  {
    id: 'l10-what-ghz-proves:b7c',
    phase: 'books',
    text: `Townsend uses a singlet as a resource. Alice holds spin 1 in an unknown state $a|{+z}\\rangle + b|{-z}\\rangle$ and shares a singlet of spins 2 and 3 with Bob (Townsend §5.6, pp. 166–168, Eqs. 5.62–5.66). Her joint measurement of spins 1 and 2 has four outcomes, each with chance $${tf(V.l10TwTeleP)}$ (Eq. 5.69). Each leaves Bob’s spin in her state up to a known turn (Ex. 5.3, pp. 170–171), and after the turn the match is complete: fidelity ${d(V.l10TwTeleFid, 0)}. Without her message Bob holds the unpolarized state, so no signal passed (p. 181, Eq. 5.101). His $|\\Psi^{(-)}\\rangle$ is the singlet. <<sl-q11-teleport-circuit|Go further in 709: teleportation>> <<sl-q13-no-cloning|Go further in 709: no cloning>>`,
    caption: 'bars: the chances of Alice’s four outcomes, one fourth each',
    stage: amp({ circuit: TELE_CIRCUIT }, { mode: 'probability', keep: [0, 1] }),
    refs: [townsend('§5.6, pp. 165–171 (eqs. 5.62–5.69; Ex. 5.3); §5.7, p. 181 (eq. 5.101)', 'Teleports a spin state using a singlet and a Bell measurement, with a known turn for each outcome; without the message Bob’s spin is the unpolarized state.')],
    claims: [
      claim('l10TwTeleP', 'each of Alice’s four outcomes has chance ¼', () => close(V.l10TwTeleP, 0.25, 1e-9)),
      claim('l10TwTeleFid', 'after Bob’s turn the fidelity is 1', () => close(V.l10TwTeleFid, 1, 1e-9)),
      claim('l10TwTeleMixDev', 'without the message Bob holds I/2 exactly', () => close(V.l10TwTeleMixDev, 0, 1e-9)),
      claim('l10TwTeleRawAvg', 'without the turn the fidelity averages ½ over the outcomes', () => close(V.l10TwTeleRawAvg, 0.5, 1e-9)),
    ],
  },
  {
    id: 'l10-what-ghz-proves:b8',
    phase: 'clue',
    text: 'The players always win without talking. Did a message pass between them?',
    stage: amp(G_SRC, { mode: 'probability' }),
    reveal: {
      text: 'No. Alice’s own answer is a fair coin whatever the others do. Only when the three compare notes does the product show. <<sl-q10-no-signal|Go further in 709: why the partner learns nothing>>',
      caption: 'the bars with Alice’s bit 0 total one half',
      stage: amp(onG([gate('H', 1), gate('H', 2)]), { mode: 'probability' }),
      claims: [claim('l10NoSignal', 'Alice’s chance of +1 is ½ whatever the others measure', () => close(V.l10NoSignal, 0.5))],
    },
  },
  {
    id: 'l10-what-ghz-proves:b9',
    phase: 'deeper',
    text: 'Why the minus sign? As operators, the four strings multiply to $-III$: the same $-1$ that the needs multiply to. Numbers on an instruction card cannot do this, because they multiply to $+1$. The difference is that $Z$ and $X$ of one spin do not commute.',
    caption: 'the product row · $ZZZ \\cdot ZXX \\cdot XZX \\cdot XXZ = -III$',
    stage: game({ state: { terms: GT }, product: true }),
    claims: [
      claim('l10OpProductSign', 'the operators multiply to a phase of −1', () => V.l10OpProductSign === -1),
      claim('l10OpProductIsIdentity', 'the product is the identity string III', () => V.l10OpProductIsIdentity === 1),
    ],
  },
]

export const L10_STORY: Record<string, Beat[]> = {
  'l10-local': local,
  'l10-empty-centre': emptyCentre,
  'l10-correlations': correlations,
  'l10-instructions': instructions,
  'l10-ghz-game': ghzGame,
  'l10-no-table': noTable,
  'l10-quantum-wins': quantumWins,
  'l10-what-ghz-proves': whatGhzProves,
}

