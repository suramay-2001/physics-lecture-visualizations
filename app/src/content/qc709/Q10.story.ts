/**
 * Chapter Q10 scroll story (Physics 709; roles P + W). Beats per docs/roles/proposals/P-Q10-story.md §1, in both
 * tracks, with the rulings of docs/roles/decisions/qc709-Q10Q13.md and qc709-remap.md.
 *
 * Adaptations against the literal plan (both forced by the engine/stage as merged, not stylistic choices):
 * - The plan's `tab(...)` (Pauli tableau) shorthand is used nowhere here. `MatrixTableauState.tableau` rows must be
 *   1-3 letters of I/X/Y/Z (stage/svg/matrix.ts `validateTableau`); the plan's abstract ±1 instruction-set rows
 *   ('a1', 'a1·b1', …) are not Pauli strings, so they fail validation. Per the plan's own §12 Q5 fallback, the
 *   `q10-hidden` and `q10-chsh` units (and derivations D3, D4) use `two-qubit`/`matrix{rho}` grid views instead — the
 *   box (Q8/Q10's own working example of a card-reproducible correlation) stands in for "a table of numbers".
 * - `tqAx` never sets `readouts: ['chsh']`: `TwoQubitState.readouts` still rejects 'chsh'/'concurrence' (the field is
 *   structural only, per `content/stage.ts`'s own comment "purely structural until chsh lands"). Every S value is
 *   read from `Q10.values.ts`'s own engine call and printed in the beat's text/caption instead.
 * - Q9 ("parts of a whole": the reduced state, the partial trace) is merged; `q10-no-signal:b2` links
 *   `[[qc-reduced-density-matrix]]` / `[[qc-partial-trace]]` directly (fix-pass item 5, P-Q10-review.md).
 *
 * Standing rules kept here (as Q8.story.ts):
 * - Every derivation list (both tracks) carries `view`/`viewCaption` on at least two distinct `StageState`s, each a
 *   kind already shown elsewhere in the SAME unit (W-709 #7/#11).
 * - Every new space or notation has exactly one notation beat (`Beat.introduces`), with a caption in both tracks
 *   (W-709 #8/#12).
 * - No TeX command outside `$…$` in learner-visible text.
 * - Every number comes from Q10.values.ts (an engine call), never a typed literal.
 */
import type { Circuit, GateOp } from '../../physics/qc/circuit'
import type { AmpSource, BallState, Beat, Dir, MatrixCoef, MatrixGridState, MatrixSource, PlotState, Scrub, StageLayout, StageState, TwoQubitState } from '../schema'
import { V, cChiS, cDial45, cHalf, cNCS, cR2, cThird, cTsirelson, d } from './Q10.values'

/* ---------------------------------------------------------------------------------------------- */
/* Stage shorthand (plan §0 "Stage shorthand"), as plain builder functions                          */
/* ---------------------------------------------------------------------------------------------- */
const DEG = Math.PI / 180

const mx = (source: MatrixSource, extra: Partial<Omit<MatrixGridState, 'kind' | 'source' | 'labels'>> = {}): MatrixGridState => ({
  kind: 'matrix',
  source,
  labels: 'kets',
  values: 'exact',
  shot: 'M-GRID',
  ...extra,
})
type RhoSrc = { ket: AmpSource } | { mixture: { w: Scrub; ket: AmpSource }[] }
const tq = (ketSource: AmpSource, extra: Partial<Omit<TwoQubitState, 'kind' | 'source' | 'labels' | 'arrows' | 'grid'>> = {}): TwoQubitState => ({
  kind: 'two-qubit',
  source: { ket: ketSource },
  labels: 'A-B',
  arrows: 'reduced',
  grid: 'T',
  shot: 'TQ-PAIR',
  ...extra,
})
const tqR = (rho: RhoSrc, extra: Partial<Omit<TwoQubitState, 'kind' | 'source' | 'labels' | 'arrows' | 'grid'>> = {}): TwoQubitState => ({
  kind: 'two-qubit',
  source: { rho },
  labels: 'A-B',
  arrows: 'reduced',
  grid: 'T',
  shot: 'TQ-PAIR',
  ...extra,
})
/** The CHSH-settings variant: two measurement directions drawn on each ball. `readouts` is never set (see header). */
const tqAx = (ketSource: AmpSource, a: [Dir, Dir], b: [Dir, Dir], extra: Partial<Omit<TwoQubitState, 'kind' | 'source' | 'labels' | 'arrows' | 'grid' | 'axes'>> = {}): TwoQubitState => ({
  kind: 'two-qubit',
  source: { ket: ketSource },
  labels: 'A-B',
  arrows: 'reduced',
  grid: 'T',
  axes: { a, b },
  shot: 'TQ-PAIR',
  ...extra,
})
const ball = (point: 'oven'): BallState => ({ kind: 'bloch-ball', point, shot: 'B-STD' })
const plot = (spec: Omit<PlotState, 'kind' | 'shot'>): PlotState => ({ kind: 'plot', shot: 'P-CURVE', ...spec })
const split = (top: StageState, bottom: StageState): StageLayout => ({ layout: 'split', top, bottom })

const pa = (letters: string): MatrixSource => ({ pauli: letters })
const prod = (...srcs: MatrixSource[]): MatrixSource => ({ product: srcs })
const lin = (...terms: [MatrixCoef, MatrixSource][]): MatrixSource => ({ lin: terms.map(([c, src]) => ({ c, src })) })

/* Running states (plan §0 "Name / Source / Value") */
const BOX_MIX: RhoSrc = { mixture: [{ w: 0.5, ket: { ket: '00' } }, { w: 0.5, ket: { ket: '11' } }] }
const SEP33_MIX: RhoSrc = { mixture: [{ w: 1 / 3, ket: { ket: '00' } }, { w: 2 / 3, ket: { ket: '11' } }] }
const PHI_KET: AmpSource = { bell: 'Phi+' }
const PSI_MINUS_KET: AmpSource = { bell: 'Psi-' }
const PRODX_KET: AmpSource = { ket: '++' }
const AX: [Dir, Dir] = ['+x', '+y']
const BX: [Dir, Dir] = ['+x', '+y']
/** Bob's N&C axes: S = −(Z+X)/√2 at (θ=135°, φ=180°), T = (Z−X)/√2 at (θ=45°, φ=180°) — P-Q10-story §1 vi:b5. */
const NC_B: [Dir, Dir] = [{ thetaDeg: 135, phiDeg: 180 }, { thetaDeg: 45, phiDeg: 180 }]
const NC_A: [Dir, Dir] = ['+x', '+z']

/** |χ(δ)⟩ as a circuit: H, CNOT, then a phase gate P(δ) on wire B (Bergou Eq. 3.12). */
const g = (gate: GateOp['gate'], target: number, param?: number): GateOp => ({ op: 'gate', gate, targets: [target], ...(param !== undefined ? { params: [param] } : {}) })
const cx = (ctrl: number, target: number): GateOp => ({ op: 'gate', gate: 'X', targets: [target], controls: [ctrl] })
const C_CHI = (deltaDeg: number): Circuit => ({ version: 1, qubits: 2, wires: ['A', 'B'], columns: [[g('H', 0)], [cx(0, 1)], [g('P', 1, deltaDeg * DEG)]] })
const CHI = (deltaDeg: number): AmpSource => ({ circuit: C_CHI(deltaDeg), upTo: 3 })

/** The CHSH operator C = XX + XY + YX − YY (Bergou Eq. 3.17). */
const C_SRC: MatrixSource = lin(['+1', pa('XX')], ['+1', pa('XY')], ['+1', pa('YX')], ['-1', pa('YY')])

/* ---------------------------------------------------------------------------------------------- */
/* q10-separable — Mixtures of products: separable states                                           */
/* ---------------------------------------------------------------------------------------------- */

const separable: Beat[] = [
  {
    id: 'q10-separable:b1',
    phase: 'books',
    introduces: ['qc-separable-state'],
    text:
      'Alice and Bob each prepare a [[qubit|qubit]] in their own lab and mix their choices by a shared coin. The result is a [[qc-separable-state|separable state]]: a chance-weighted sum of products. No quantum link is built this way, only shared instructions, <<qc-l6-mixture|Spin Lab\'s own name for this kind of coin-made state>>.',
    formal:
      'A density matrix is [[qc-separable-state|separable]] if it is [[qc-mixture|a mixture]] of products, $\\rho_{AB} = \\sum_kp_k\\,\\rho_A^k\\otimes\\rho_B^k$ with $p_k \\ge 0$, $\\sum_kp_k = 1$ (Bergou Eq. 3.2). Local operations and classical communication (LOCC) can make any separable state but never an entangled one.',
    caption: 'a coin picks which product to prepare',
    captionFormal: '$\\rho = \\sum_kp_k\\,\\rho_A^k\\otimes\\rho_B^k$: LOCC only',
    stage: split(tqR(SEP33_MIX), mx({ rho: SEP33_MIX }, { blocks: 2 })),
    claims: [cThird],
  },
  {
    id: 'q10-separable:b2',
    phase: 'books',
    text:
      "Chapter Q8's box, half $|00\\rangle\\langle00|$ and half $|11\\rangle\\langle11|$, is separable too: both members are products. Its $z$ readings always agree, like $\\Phi^+$ (notes, N&C: $\\beta_{00}$; Bergou: $\\Psi_+$). But its $x$ readings do not: $\\langle X_1X_2\\rangle = 0$ for the box, $+1$ for $\\Phi^+$.",
    formal:
      'The coin box $\\tfrac12(|00\\rangle\\langle00| + |11\\rangle\\langle11|)$ is separable; $\\Phi^+$ (notes, N&C: $\\beta_{00}$; Bergou: $\\Psi_+$) is [[qc-maximally-entangled|maximally entangled]]. They share the $z$ grid ($\\langle Z_1Z_2\\rangle = 1$) and the reduced state ($\\rho_A = \\tfrac12I$ for both), yet $\\langle X_1X_2\\rangle = 0$ for the box, against $1$ for $\\Phi^+$.',
    caption: 'box: only the $zz$ cell; $\\Phi^+$: $xx$, $yy$, $zz$',
    captionFormal: 'box grid $\\mathrm{diag}(0,0,1)$; $\\Phi^+$ grid $\\mathrm{diag}(1,-1,1)$',
    stage: split(tqR(BOX_MIX), mx({ rho: { ket: PHI_KET } })),
  },
  {
    id: 'q10-separable:b3',
    phase: 'books',
    text:
      'There is a quick test, the [[qc-ppt|PPT criterion]]. Flip the direction of Bob\'s part only — the partial transpose — and look at the chances. A separable state stays a proper state: no negative chance. The box passes. $\\Phi^+$ fails, with a chance of $-$½: it is entangled.',
    formal:
      'The partial transpose $\\rho^{T_B}$ of a separable state is still positive (Peres): separable $\\Rightarrow$ [[qc-ppt|PPT]] (Bergou §3.5 p. 40). The box\'s $\\rho^{T_B}$ has eigenvalues $(\\tfrac12, \\tfrac12, 0, 0) \\ge 0$; $\\Phi^+$\'s has $(\\tfrac12, \\tfrac12, \\tfrac12, -\\tfrac12)$, a negative eigenvalue, so $\\Phi^+$ is entangled. For two [[qubit|qubits]] the test is exact (a later chapter).',
    caption: 'flip Bob: box stays a state; $\\Phi^+$ gets a $-$½',
    captionFormal: '$\\rho^{T_B}$: box $\\ge 0$; $\\Phi^+$ has $-\\tfrac12$',
    stage: mx({ rho: BOX_MIX }, { ptranspose: 'B', spectrum: 'bars' }),
    claims: [cHalf],
    fidelity: ['qc-matrix-not-a-space'],
    derivation: {
      result: '\\rho^{T_B} \\ge 0 \\text{ (box)},\\quad \\lambda_{\\min} = -\\tfrac12\\ (\\Phi^+)',
      ground: [
        {
          tex: '\\rho = \\tfrac12(|00\\rangle\\langle00| + |11\\rangle\\langle11|)',
          why: 'A coin picks $|00\\rangle$ or $|11\\rangle$: [[qc-mixture|a mixture]] of products.',
          view: tqR(BOX_MIX),
          viewCaption: 'the box: only the $zz$ cell',
        },
        {
          tex: '\\langle X_1X_2\\rangle_{\\mathrm{box}} = 0,\\ \\langle X_1X_2\\rangle_{\\Phi^+} = 1',
          why: 'The box has no $x$ correlation; $\\Phi^+$ does.',
          view: tq(PHI_KET),
          viewCaption: '$\\Phi^+$: $xx$, $yy$, $zz$ all set',
        },
        {
          tex: '\\rho^{T_B} = \\tfrac12(|00\\rangle\\langle00| + |11\\rangle\\langle11|)',
          why: "Transposing Bob's index moves nothing here: still a state.",
          view: mx({ rho: BOX_MIX }, { ptranspose: 'B', spectrum: 'bars' }),
          viewCaption: 'box $\\rho^{T_B}$: eigenvalues $(\\tfrac12, \\tfrac12, 0, 0)$',
        },
        {
          tex: '\\rho_{\\Phi^+}^{T_B}\\text{ has eigenvalues }(\\tfrac12, \\tfrac12, \\tfrac12, -\\tfrac12)',
          why: 'The same flip on $\\Phi^+$ swaps a corner in, giving a negative eigenvalue.',
          view: mx({ rho: { ket: PHI_KET } }, { ptranspose: 'B', spectrum: 'bars' }),
          viewCaption: '$\\Phi^+$ $\\rho^{T_B}$: a $-\\tfrac12$',
        },
        {
          tex: '\\rho^{T_B} \\ge 0 \\text{ (box)},\\quad \\lambda_{\\min} = -\\tfrac12\\ (\\Phi^+)',
          why: 'A negative chance after the flip means entangled; the box passes, $\\Phi^+$ fails.',
        },
      ],
      formal: [
        {
          tex: '\\rho^{T_B} \\ge 0',
          why: 'Separable $\\Rightarrow$ PPT (Bergou §3.5): the box\'s partial transpose is positive.',
          view: mx({ rho: BOX_MIX }, { ptranspose: 'B', spectrum: 'bars' }),
        },
        {
          tex: '\\rho^{T_B} \\ge 0 \\text{ (box)},\\quad \\lambda_{\\min} = -\\tfrac12\\ (\\Phi^+)',
          why: '$\\Phi^+$\'s is not positive, so $\\Phi^+$ is entangled (the test is exact for two qubits).',
          view: mx({ rho: { ket: PHI_KET } }, { ptranspose: 'B', spectrum: 'bars' }),
        },
      ],
    },
  },
  {
    id: 'q10-separable:b4',
    phase: 'clue',
    text: 'Here is a pair with $\\langle Z_1Z_2\\rangle = 1$ and $\\langle X_1X_2\\rangle = 0$. Is it entangled?',
    formal: 'A two-qubit state has $\\langle Z_1Z_2\\rangle = 1$, $\\langle X_1X_2\\rangle = \\langle Y_1Y_2\\rangle = 0$. Entangled or separable?',
    stage: tqR(BOX_MIX),
    reveal: {
      text: 'Separable. Those numbers are the coin box, a mixture of $|00\\rangle$ and $|11\\rangle$. Its partial transpose has no negative chance. Only the $x$ and $y$ correlations of $\\Phi^+$ reveal entanglement.',
      formal: 'Separable: it is the box, $\\mathrm{diag}(1,0,0,1)/2$ in $zz$ only, and $\\rho^{T_B} \\ge 0$. Equal $z$ correlation with $\\Phi^+$ is not enough; the missing $xx$, $yy$ cells are the tell.',
      caption: 'box: PPT, so separable',
      captionFormal: 'box: PPT, so separable',
      stage: mx({ rho: BOX_MIX }, { ptranspose: 'B', spectrum: 'bars' }),
    },
  },
]

/* ---------------------------------------------------------------------------------------------- */
/* q10-no-signal — No signalling: the partner learns nothing                                        */
/* ---------------------------------------------------------------------------------------------- */

const noSignal: Beat[] = [
  {
    id: 'q10-no-signal:b1',
    phase: 'books',
    text: 'Alice and Bob share $\\Phi^+$ far apart. When Alice reads her qubit as 0, Bob\'s jumps to $|0\\rangle$ at once. It looks as if Alice has sent a signal faster than light. Let us see why she has not.',
    formal: 'Alice and Bob share $\\Phi^+ = (|00\\rangle + |11\\rangle)/\\sqrt2$. If Alice measures $z$ and gets 0, Bob\'s qubit collapses to $|0\\rangle$ instantly, however far away (Bergou §3.2). The apparent faster-than-light influence is the puzzle this unit resolves.',
    caption: "Alice reads 0, Bob jumps to $|0\\rangle$",
    captionFormal: "$\\Phi^+$: a $z$ reading on A fixes B",
    stage: tq(PHI_KET, { condition: { qubit: 0, basis: 'z', outcome: 0 } }),
  },
  {
    id: 'q10-no-signal:b2',
    phase: 'books',
    introduces: ['qc-no-signalling'],
    text:
      'But Bob cannot see the jump without a phone call from Alice. Over many runs her outcome is 0 or 1 by chance. Bob\'s [[qc-reduced-density-matrix|reduced state]] — found by the [[qc-partial-trace|partial trace]] over Alice\'s part — then averages to the centre of the ball, half $I$. That is exactly what Bob has with no measurement at all. [[qc-no-signalling|No signal]] gets through.',
    formal:
      'Bob\'s state is his [[qc-reduced-density-matrix|reduced density matrix]], the result of a [[qc-partial-trace|partial trace]]: $\\rho_B = \\mathrm{Tr}_A\\rho$. For $\\Phi^+$, $\\rho_B = \\tfrac12I$ whether or not Alice measures, and in whatever basis: averaging her outcomes gives back $\\tfrac12I$ (Bergou Eqs. 3.5–3.7). This is the [[qc-no-signalling|no-signalling principle]]: a local operation cannot change the partner\'s reduced state, so no message passes.',
    caption: "averaged over Alice's outcomes: Bob is half $I$",
    captionFormal: '$\\rho_B = \\tfrac12I$, measured or not',
    claims: [cHalf],
    stage: split(ball('oven'), tq(PHI_KET, { condition: { qubit: 0, basis: 'z', outcome: 0 } })),
    derivation: {
      result: '\\rho_B = \\mathrm{Tr}_A\\rho = \\tfrac12 I,\\text{ measured or not}',
      ground: [
        { tex: '\\Phi^+ = \\tfrac1{\\sqrt2}(|00\\rangle + |11\\rangle)', why: 'The shared pair, before anyone measures.', view: tq(PHI_KET), viewCaption: 'the pair $\\Phi^+$' },
        {
          tex: '\\text{Alice reads }0 \\Rightarrow \\text{Bob }|0\\rangle;\\ \\text{reads }1 \\Rightarrow \\text{Bob }|1\\rangle',
          why: "Each outcome fixes Bob's qubit.",
          view: tq(PHI_KET, { condition: { qubit: 0, basis: 'z', outcome: 0 } }),
          viewCaption: "given Alice's 0: Bob at the north pole",
        },
        {
          tex: '\\rho_B = \\tfrac12|0\\rangle\\langle0| + \\tfrac12|1\\rangle\\langle1| = \\tfrac12 I',
          why: 'Averaged over her 50/50 outcomes, Bob is the centre of the ball.',
          view: ball('oven'),
          viewCaption: 'Bob: $\\tfrac12 I$, the centre',
        },
        { tex: '\\rho_B = \\tfrac12 I,\\text{ measured or not}', why: 'With no measurement Bob is also $\\tfrac12 I$: no signal.' },
      ],
      formal: [
        { tex: '\\rho_B = \\mathrm{Tr}_A|\\Phi^+\\rangle\\langle\\Phi^+| = \\tfrac12 I', why: "The reduced state of $\\Phi^+$.", view: ball('oven') },
        {
          tex: '\\rho_B = \\tfrac12 I,\\text{ measured or not}',
          why: '$\\sum_j p_j\\rho_B^{(j)} = \\mathrm{Tr}_A\\rho$ for any basis, so Alice\'s choice is invisible to Bob.',
          view: tq(PHI_KET, { condition: { qubit: 0, basis: 'x', outcome: 0 } }),
          viewCaption: "one of Alice's $x$ branches; its partner at $-x$ averages it away",
        },
      ],
    },
  },
  {
    id: 'q10-no-signal:b3',
    phase: 'books',
    text: "It makes no difference which way Alice turns her analyser. Read along $x$, $y$, or any tilt: averaged over her two outcomes, Bob's arrow is still the centre. Bob can run no experiment that tells him whether — or how — Alice measured.",
    formal: 'For any measurement basis Alice chooses, $\\sum_j p_j\\,\\rho_B^{(j)} = \\mathrm{Tr}_A\\rho = \\tfrac12I$ (the outcomes $j$ resolve the identity on A). Bob\'s statistics are independent of Alice\'s setting, so no protocol lets him detect her choice.',
    caption: '$x$, $y$ or $z$ on A: Bob stays at the centre',
    captionFormal: 'every basis: $\\rho_B = \\tfrac12I$',
    stage: split(tq(PHI_KET, { condition: { qubit: 0, basis: 'x', outcome: 0 } }), ball('oven')),
  },
  {
    id: 'q10-no-signal:b4',
    phase: 'clue',
    text: "Bergou tries harder: Bob sends his qubit through a phase gate and a Hadamard, hoping Alice's choice changes his interference pattern. Does it?",
    formal: "In Bergou's scheme Bob applies a phase gate then H and measures; can Alice's decision to measure (or not) change Bob's fringe visibility (Bergou Eqs. 3.5–3.7)?",
    stage: tq(PHI_KET),
    reveal: {
      text: "No. With or without Alice's measurement Bob's reduced state is half $I$, so his two outcomes stay 50/50. The interference he hoped for is washed out exactly because Alice cannot choose her result.",
      formal: "No. Both with and without Alice's measurement $\\rho_B = \\tfrac12I$, so $p_0 = p_1 = \\tfrac12$ after any gates: the fringe vanishes. Bergou notes such schemes are repeatedly rediscovered; the fix is always that Alice cannot control her outcome.",
      caption: 'phase gate and H: still 50/50',
      captionFormal: 'phase gate and H: still 50/50',
      stage: ball('oven'),
      claims: [cHalf],
    },
  },
]

/* ---------------------------------------------------------------------------------------------- */
/* q10-hidden — Instruction sets: a classical story                                                 */
/* ---------------------------------------------------------------------------------------------- */

const hidden: Beat[] = [
  {
    id: 'q10-hidden:b1',
    phase: 'books',
    introduces: ['qc-lhv-model'],
    text:
      'Suppose each particle carries a card fixing, in advance, the answer to every reading Alice or Bob might choose. Alice can read $a_1$ or $a_2$, Bob $b_1$ or $b_2$, each giving $\\pm1$. A [[qc-lhv-model|local hidden-variable model]] says the source hands out such cards with fixed chances, <<qc-l1-logic|the same hidden-label idea Spin Lab tests with a truth table>>.',
    formal:
      'A [[qc-lhv-model|local hidden-variable model]] assigns definite values $a_1, a_2, b_1, b_2 = \\pm1$ to every measurement, drawn from a joint distribution $P(a_1, a_2, b_1, b_2)$ (Bergou Eq. 3.8; N&C §2.6). "Local" means Alice\'s card does not depend on Bob\'s choice. This is Chapter Q7\'s predetermined-values idea, now for correlations over many runs.',
    caption: 'the box: a coin hands out one of two cards',
    captionFormal: '$P(a_1, a_2, b_1, b_2)$, each value $\\pm1$',
    stage: tqR(BOX_MIX),
  },
  {
    id: 'q10-hidden:b2',
    phase: 'books',
    text: 'Form the combination $X = a_1(b_1 + b_2) + a_2(b_1 - b_2)$. Here $X$ is the card\'s score, not the Pauli $X$. Since $b_1$ and $b_2$ are each $\\pm1$, one bracket is $\\pm2$ and the other is 0. So $X$ is $+2$ or $-2$ for every card: ½ of the 16 cards give each sign.',
    formal: 'Define $X = a_1(b_1 + b_2) + a_2(b_1 - b_2)$. Here $X$ is the card\'s score, not the Pauli $X$. If $b_1 = b_2$ then $b_1 - b_2 = 0$ and $X = a_1(b_1 + b_2) = \\pm2$; if $b_1 = -b_2$ then $X = a_2(b_1 - b_2) = \\pm2$ (Bergou Eq. 3.9). Every one of the 16 cards gives $|X| = 2$, ½ of them $+2$ and ½ $-2$.',
    caption: "the box's two cards (every setting $z$): both $X = +2$",
    captionFormal: '$X = \\pm2$ for all 16 cards, ½ each sign',
    claims: [cHalf],
    stage: mx({ rho: BOX_MIX }),
    derivation: {
      result: 'X = a_1(b_1 + b_2) + a_2(b_1 - b_2) = \\pm2',
      ground: [
        { tex: 'a_1, a_2, b_1, b_2 = \\pm1', why: 'Each card fixes four $\\pm1$ answers, like the box fixes one of two outcomes.', view: tqR(BOX_MIX), viewCaption: 'a working card: the box, 00 or 11' },
        {
          tex: 'b_1 = b_2:\\ X = a_1(b_1 + b_2) = \\pm2,\\ a_2\\text{ term }0',
          why: "When Bob's two answers agree, the second bracket vanishes.",
          view: mx({ rho: BOX_MIX }, { highlight: [[0, 0], [3, 3]] }),
          viewCaption: 'the box with every setting along $z$: two cards, all $+1$ or all $-1$, each $X = +2$',
        },
        {
          tex: 'b_1 = -b_2:\\ X = a_2(b_1 - b_2) = \\pm2,\\ a_1\\text{ term }0',
          why: 'When they differ, the first bracket vanishes instead.',
        },
        { tex: 'X = a_1(b_1 + b_2) + a_2(b_1 - b_2) = \\pm2', why: 'Either way $|X| = 2$, for all 16 cards.' },
      ],
      formal: [
        { tex: 'X = a_1(b_1 + b_2) + a_2(b_1 - b_2)', why: 'One of $b_1 \\pm b_2$ is 0 and the other $\\pm2$ (Bergou Eq. 3.9).', view: tqR(BOX_MIX) },
        { tex: 'X = \\pm2', why: 'So $|X| = 2$ for every one of the 16 cards.', view: mx({ rho: BOX_MIX }, { highlight: [[0, 0], [3, 3]] }) },
      ],
    },
  },
  {
    id: 'q10-hidden:b3',
    phase: 'books',
    text: "This is Chapter Q7's idea again, but softer. Mermin's cards failed a single run of each of four settings. Here the cards never fail one run — they fail only on average, over many runs. That is why this test needs statistics.",
    formal: "Chapter Q7's Mermin argument refuted local realism with one run of each of four GHZ settings, because each prediction was certain. Here no single run is impossible for a card; the clash appears only in the averaged score S. The CHSH test is statistical, the GHZ test is not.",
    caption: 'Mermin: one run; CHSH: many runs',
    captionFormal: 'Mermin: one run; CHSH: many runs',
    stage: tq(PHI_KET),
  },
]

/* ---------------------------------------------------------------------------------------------- */
/* q10-chsh — The CHSH inequality: a classical ceiling                                               */
/* ---------------------------------------------------------------------------------------------- */

const chshUnit: Beat[] = [
  {
    id: 'q10-chsh:b1',
    phase: 'books',
    introduces: ['qc-correlator'],
    text:
      "To score the link, run the experiment many times and average the product of the two readings. This average is the [[qc-correlator|correlator]] $\\langle a\\,b\\rangle$: $+1$ if the two readings always agree, $-1$ if they always disagree, 0 if they agree and disagree equally. So they end up agreeing ½ the time.",
    formal:
      "The [[qc-correlator|correlator]] of two $\\pm1$ readings is $\\langle ab\\rangle = \\sum_{a,b}ab\\,P(a, b)$, the average of their product (Bergou Eq. 3.8; a later Foundations chapter's classical correlator). Quantum-mechanically $\\langle a\\otimes b\\rangle = \\mathrm{Tr}(\\rho\\,a\\otimes b)$, the correlation-grid entries of Chapter Q6. A correlator of 0 means the readings agree ½ the time, as unbiased as a coin; here $S$ is the CHSH value, not Chapter Q9's entropy $S(\\rho)$.",
    caption: '$\\langle ab\\rangle$: $+1$ agree, $-1$ disagree, 0 unrelated',
    captionFormal: '$\\langle ab\\rangle = \\sum ab\\,P(a, b)$',
    claims: [cHalf],
    stage: split(tq(PHI_KET, { highlight: ['zz'] }), mx({ rho: BOX_MIX }, { highlight: [[0, 0], [3, 3]] })),
  },
  {
    id: 'q10-chsh:b2',
    phase: 'books',
    introduces: ['qc-chsh'],
    text: 'Add four correlators in the special pattern $S = \\langle a_1b_1\\rangle + \\langle a_1b_2\\rangle + \\langle a_2b_1\\rangle - \\langle a_2b_2\\rangle$: the [[qc-chsh|CHSH value]]. Averaging the last unit\'s $X = \\pm2$ over the cards, $S$ can never pass 2. This ceiling, $|S| \\le 2$, is a Bell inequality.',
    formal:
      'The [[qc-chsh|CHSH value]] is $S = \\langle a_1b_1\\rangle + \\langle a_1b_2\\rangle + \\langle a_2b_1\\rangle - \\langle a_2b_2\\rangle$. Since each card has $X = \\pm2$, $|S| = |\\sum P(\\cdots)X| \\le \\sum P(\\cdots)\\cdot2 = 2$ (Bergou Eq. 3.10): the CHSH (Clauser–Horne–Shimony–Holt) inequality $|S| \\le 2$ holds for every local hidden-variable model.',
    caption: 'average of $\\pm2$: $|S| \\le 2$',
    captionFormal: '$|S| \\le 2$ for any classical story',
    stage: plot({ curve: { fn: 'chshClassicalBound' }, bands: [{ yFrom: -2, yTo: 2, label: 'classical' }], yLines: [{ y: 2 }, { y: -2 }] }),
    derivation: {
      result: '|S| \\le 2',
      ground: [
        { tex: 'S = \\langle a_1b_1\\rangle + \\langle a_1b_2\\rangle + \\langle a_2b_1\\rangle - \\langle a_2b_2\\rangle', why: 'The CHSH score: four averaged products.', view: mx({ rho: BOX_MIX }), viewCaption: 'the box, all settings $z$: $S = 1 + 1 + 1 - 1 = 2$, exactly the ceiling' },
        { tex: 'S = \\sum P(a_1, a_2, b_1, b_2)\\,X', why: "Each card contributes its $X$, weighted by its chance.", view: tqR(BOX_MIX), viewCaption: "two cards, each $X = +2$, chance ½" },
        { tex: '|S| \\le \\sum P\\cdot2 = 2', why: 'Since every $X = \\pm2$ and the chances sum to 1.', view: plot({ curve: { fn: 'chshClassicalBound' }, bands: [{ yFrom: -2, yTo: 2, label: 'classical' }] }), viewCaption: 'the allowed band $|S| \\le 2$' },
        { tex: '|S| \\le 2', why: 'The CHSH inequality, for every local hidden-variable model.' },
      ],
      formal: [
        { tex: 'S = \\sum P(a_1, a_2, b_1, b_2)\\,X,\\quad X = \\pm2', why: 'The averaged CHSH quantity (Bergou Eq. 3.10).', view: mx({ rho: BOX_MIX }) },
        { tex: '|S| \\le 2', why: 'A convex average of $\\pm2$ cannot leave $[-2, 2]$.', view: plot({ curve: { fn: 'chshClassicalBound' }, bands: [{ yFrom: -2, yTo: 2 }] }) },
      ],
    },
    fidelity: ['qc-plot-engine-curve'],
  },
]

/* ---------------------------------------------------------------------------------------------- */
/* q10-violation — Breaking the ceiling: 2√2                                                        */
/* ---------------------------------------------------------------------------------------------- */

const violation: Beat[] = [
  {
    id: 'q10-violation:b1',
    phase: 'books',
    text: `Quantum mechanics breaks the ceiling. Take the pair $(|00\\rangle + e^{i45°}|11\\rangle)/\\sqrt2$ and let Alice read $\\sigma_x$ or $\\sigma_y$, Bob the same. Three correlators are $+${d(V.q10R2, 3)}$ and one is $-${d(V.q10R2, 3)}$, so $S = ${d(V.q10ChiS, 3)}$. No card can do this.`,
    formal: `For $|\\chi\\rangle = (|00\\rangle + e^{i\\pi/4}|11\\rangle)/\\sqrt2$ with $a_1 = \\sigma_x$, $a_2 = \\sigma_y$, $b_1 = \\sigma_x$, $b_2 = \\sigma_y$: $\\langle a_1b_1\\rangle = \\langle a_1b_2\\rangle = \\langle a_2b_1\\rangle = \\tfrac{\\sqrt2}2$ and $\\langle a_2b_2\\rangle = -\\tfrac{\\sqrt2}2$ (Bergou Eqs. 3.11–3.13), so $S = ${d(V.q10ChiS, 3)} > 2$: the Bell inequality is violated.`,
    caption: `three $+${d(V.q10R2, 3)}$, one $-${d(V.q10R2, 3)}$: $S = ${d(V.q10ChiS, 3)}$`,
    captionFormal: '$S = 2\\sqrt2$, above the classical 2',
    stage: tqAx(CHI(45), AX, BX, {}),
    claims: [cR2, cChiS],
    fidelity: ['qc-tq-grid-signed'],
    derivation: {
      result: 'S_{\\chi} = 2\\sqrt2 > 2',
      ground: [
        { tex: '|\\chi\\rangle = \\tfrac1{\\sqrt2}(|00\\rangle + e^{i\\pi/4}|11\\rangle)', why: 'An entangled pair with a quarter-turn phase.', view: tqAx(CHI(45), AX, BX, {}), viewCaption: '$\\chi$ with $x, y$ axes on each ball' },
        { tex: '\\langle\\sigma_x\\sigma_x\\rangle = \\langle\\sigma_x\\sigma_y\\rangle = \\langle\\sigma_y\\sigma_x\\rangle = \\tfrac{\\sqrt2}2', why: `Three of the four correlators are $+${d(V.q10R2, 3)}$.`, view: tqAx(CHI(45), AX, BX, { highlight: ['xx', 'xy', 'yx'] }), viewCaption: `three cells at $+${d(V.q10R2, 3)}$` },
        { tex: '\\langle\\sigma_y\\sigma_y\\rangle = -\\tfrac{\\sqrt2}2', why: `The fourth, entering with a minus, is $-${d(V.q10R2, 3)}$.`, view: tqAx(CHI(45), AX, BX, { highlight: ['yy'] }), viewCaption: `the $yy$ cell at $-${d(V.q10R2, 3)}$` },
        { tex: `S_{\\chi} = 3\\cdot\\tfrac{\\sqrt2}2 - (-\\tfrac{\\sqrt2}2) = 2\\sqrt2`, why: `Four correlators give ${d(V.q10ChiS, 3)}.` },
        { tex: 'S_{\\chi} = 2\\sqrt2 > 2', why: 'Above the classical ceiling: the Bell inequality is violated.', view: plot({ curve: { fn: 'chshVsPhase', x: { from: 0, to: 90 } }, markers: [{ x: 45 }], yLines: [{ y: 2 }] }), viewCaption: 'the dial at 45°, above the line' },
      ],
      formal: [
        { tex: '\\langle a_ib_j\\rangle:\\ \\tfrac{\\sqrt2}2, \\tfrac{\\sqrt2}2, \\tfrac{\\sqrt2}2, -\\tfrac{\\sqrt2}2', why: 'The four correlators of $\\chi$ with $x, y$ settings (Bergou Eq. 3.13).', view: tqAx(CHI(45), AX, BX, {}) },
        { tex: 'S_{\\chi} = 2\\sqrt2 > 2', why: 'The CHSH value exceeds 2.', view: plot({ curve: { fn: 'chshVsPhase', x: { from: 0, to: 90 } }, markers: [{ x: 45 }], yLines: [{ y: 2 }] }) },
      ],
    },
  },
  {
    id: 'q10-violation:b2',
    phase: 'books',
    text: 'Turn the phase of the pair from 0° up to 90°. The score rises from 2, swells to $2\\sqrt2$ at 45°, and falls back to 2. The whole bulge above 2 is forbidden to any classical story.',
    formal: 'Sweeping the phase $\\delta$ of $|\\chi(\\delta)\\rangle$ with the fixed $x, y$ settings gives $S(\\delta) = 2\\cos\\delta + 2\\sin\\delta$: $S = 2$ at $\\delta = 0°$ and $90°$, peaking at $2\\sqrt2$ when $\\delta = 45°$. Every point of the curve above the line $S = 2$ is a region no local hidden-variable model can reach.',
    caption: 'the dial: $S$ swells to $2\\sqrt2$ at 45°',
    captionFormal: '$S(\\delta) = 2\\cos\\delta + 2\\sin\\delta$',
    stage: plot({ curve: { fn: 'chshVsPhase', x: { from: 0, to: 90 } }, bands: [{ yFrom: -2, yTo: 2, label: 'classical' }], markers: [{ x: 45, label: `${d(V.q10DialAt45, 3)}` }], yLines: [{ y: 2 }, { y: V.q10Tsirelson, label: 'Tsirelson' }] }),
    claims: [cDial45],
    fidelity: ['qc-plot-engine-curve'],
  },
  {
    id: 'q10-violation:b3',
    phase: 'books',
    text: `A product state cannot win. If each qubit answers on its own, the correlators factor, and the same algebra as the cards gives $S \\le 2$. Try $|+x\\rangle|+x\\rangle$: its score is only 1. Beating 2 proves the pair is entangled.`,
    formal: 'For a product state $\\langle a_ib_j\\rangle = \\langle a_i\\rangle\\langle b_j\\rangle$, so with $x_i = \\langle a_i\\rangle$, $y_j = \\langle b_j\\rangle \\in [-1, 1]$, $S = x_1(y_1 + y_2) + x_2(y_1 - y_2) \\le 2$ (Bergou Eqs. 3.14–3.16); this extends to separable states by convexity. $|+x\\rangle|+x\\rangle$ gives $S = 1$. A violation therefore certifies entanglement.',
    caption: '$|+x\\rangle|+x\\rangle$: $S = 1$, below 2',
    captionFormal: 'product (and separable): $S \\le 2$',
    stage: split(tqAx(PRODX_KET, AX, BX, {}), plot({ curve: { fn: 'chshClassicalBound' }, bands: [{ yFrom: -2, yTo: 2, label: 'classical' }] })),
    fidelity: ['qc-tq-local-arrows'],
    derivation: {
      result: 'S_{\\text{product}} \\le 2',
      ground: [
        { tex: '\\langle a_ib_j\\rangle = \\langle a_i\\rangle\\langle b_j\\rangle = x_iy_j', why: 'On a product state the averages factor.', view: tqAx(PRODX_KET, AX, BX, {}), viewCaption: '$|+x\\rangle|+x\\rangle$: the grid is an outer product of arrows' },
        { tex: 'S = x_1(y_1 + y_2) + x_2(y_1 - y_2)', why: 'The same algebra as the instruction cards.', view: tqAx(PRODX_KET, AX, BX, { highlight: ['xx'] }), viewCaption: 'only $\\langle XX\\rangle = 1$ is nonzero here' },
        { tex: '|S| \\le |x_1||y_1 + y_2| + |x_2||y_1 - y_2| \\le 2', why: 'With $|x_i|, |y_j| \\le 1$, the bound is 2.', view: plot({ curve: { fn: 'chshClassicalBound' }, bands: [{ yFrom: -2, yTo: 2, label: 'classical' }] }), viewCaption: "every product state's $S$ stays in this band ($|+x\\rangle|+x\\rangle$: 1)" },
        { tex: 'S_{\\text{product}} \\le 2', why: 'A product (and, by convexity, any separable) state never beats 2.' },
      ],
      formal: [
        { tex: 'S = x_1(y_1 + y_2) + x_2(y_1 - y_2),\\quad |x_i|, |y_j| \\le 1', why: 'Product correlators factor (Bergou Eq. 3.14).', view: tqAx(PRODX_KET, AX, BX, {}) },
        { tex: 'S_{\\text{product}} \\le 2', why: 'So a CHSH violation certifies entanglement.', view: plot({ curve: { fn: 'chshClassicalBound' }, bands: [{ yFrom: -2, yTo: 2, label: 'classical' }] }) },
      ],
    },
  },
  {
    id: 'q10-violation:b4',
    phase: 'books',
    text: `How high can quantum mechanics go? Build the operator $C = a_1b_1 + a_1b_2 + a_2b_1 - a_2b_2$ and square it. The square is $4$ plus a correction that can reach $4$ more, so $C^2$ is at most $8$, and $S$ at most $\\sqrt8 = ${d(V.q10Tsirelson, 3)}$. Quantum mechanics stops exactly there.`,
    formal: `With $a_j^2 = b_j^2 = I$, $C^2 = 4I - [a_1, a_2]\\otimes[b_1, b_2]$ (N&C Problem 2.3, Eq. 2.233, p. 118; N&C's $[Q, R]$ is our $-[a_1, a_2]$); since $\\|[a_1, a_2]\\| \\le 2$, $C^2 \\le 8I$, so $\\|C\\| \\le ${d(V.q10Tsirelson, 3)}$. Bergou reaches the same bound by a sum of squares (Eq. 3.17, erratum B7). This is the [[qc-tsirelson|Tsirelson bound]]: quantum mechanics violates CHSH but only up to $2\\sqrt2$.`,
    caption: `$C^2 \\le 8$, so $S \\le ${d(V.q10Tsirelson, 3)}$`,
    captionFormal: `$C^2 = 4I - [a_1, a_2]\\otimes[b_1, b_2] \\le 8I$`,
    stage: mx(prod(C_SRC, C_SRC), { spectrum: 'bars' }),
    claims: [cTsirelson],
    derivation: {
      result: '\\|C\\| \\le 2\\sqrt2',
      ground: [
        { tex: 'C = a_1b_1 + a_1b_2 + a_2b_1 - a_2b_2', why: 'The CHSH operator, a sum of Pauli strings.', view: mx(C_SRC), viewCaption: '$C = XX + XY + YX - YY$' },
        { tex: 'C^2 = 4I - [a_1, a_2]\\otimes[b_1, b_2]', why: 'Squaring: the $a_j^2 = b_j^2 = I$ terms give $4I$, the cross terms a commutator product.', view: mx(prod(C_SRC, C_SRC)), viewCaption: '$C^2$: $4I$ plus a correction' },
        { tex: '\\|[a_1, a_2]\\| \\le 2 \\Rightarrow C^2 \\le 8I', why: 'A commutator of $\\pm1$ observables is at most 2 in size, so $C^2$ peaks at 8.', view: mx(prod(C_SRC, C_SRC), { spectrum: 'bars' }), viewCaption: '$C^2$ eigenvalues $(0, 0, 8, 8)$' },
        { tex: '\\|C\\| \\le 2\\sqrt2', why: 'A square root of 8 is $2\\sqrt2$: the quantum score cannot pass it, the Tsirelson bound.' },
      ],
      formal: [
        { tex: 'C^2 = 4I - [a_1, a_2]\\otimes[b_1, b_2] \\le 8I', why: 'With $a_j^2 = b_j^2 = I$ and $\\|[a_1, a_2]\\| \\le 2$ (N&C Problem 2.3, Eq. 2.233).', view: mx(prod(C_SRC, C_SRC), { spectrum: 'bars' }) },
        { tex: '\\|C\\| \\le 2\\sqrt2', why: 'So $|S| = |\\langle C\\rangle| \\le 2\\sqrt2$, the Tsirelson bound.', view: mx(C_SRC, { spectrum: 'bars' }) },
      ],
    },
  },
  {
    id: 'q10-violation:b5',
    phase: 'books',
    text: `There is more than one way to break the ceiling. Nielsen and Chuang use the singlet $\\Psi^- = (|01\\rangle - |10\\rangle)/\\sqrt2$ and tilted readings on Bob. The four correlators again give $S = ${d(V.q10NCS, 3)}$. Same ceiling, different pair and settings.`,
    formal: `N&C take $|\\Psi^-\\rangle$ with $Q = Z_1$, $R = X_1$, $S = -(Z_2 + X_2)/\\sqrt2$, $T = (Z_2 - X_2)/\\sqrt2$: $\\langle QS\\rangle = \\langle RS\\rangle = \\langle RT\\rangle = \\tfrac1{\\sqrt2}$ and $\\langle QT\\rangle = -\\tfrac1{\\sqrt2}$, so $S = ${d(V.q10NCS, 3)}$ (N&C Eqs. 2.227–2.230). N&C call Bob's two settings $S$ and $T$ (a setting, not the score); the score is again $${d(V.q10NCS, 3)}$. The violation does not depend on Bergou's particular $\\chi$ or its $x, y$ settings.`,
    caption: `the singlet, tilted readings: $S = ${d(V.q10NCS, 3)}$ again`,
    captionFormal: 'N&C singlet: $S = 2\\sqrt2$',
    stage: tqAx(PSI_MINUS_KET, NC_A, NC_B, {}),
    claims: [cNCS],
  },
  {
    id: 'q10-violation:b6',
    phase: 'clue',
    text: 'Could a stronger-than-quantum link exist, scoring the maximum $S = 4$, while still sending no signal?',
    formal: 'Is there a no-signalling correlation that violates CHSH more strongly than quantum mechanics — up to the algebraic maximum $S = 4$ (Bergou p. 37, Eq. 3.19)?',
    stage: plot({ curve: { fn: 'chshVsPhase', x: { from: 0, to: 90 } }, yLines: [{ y: 2, label: 'classical' }, { y: V.q10Tsirelson, label: 'Tsirelson' }] }),
    reveal: {
      text: 'Yes, on paper: the Popescu–Rohrlich box scores $S = 4$ and still lets no message through. But nature has never shown one; real correlations stop at the quantum $2\\sqrt2$.',
      formal: 'Yes mathematically: Popescu and Rohrlich found no-signalling distributions with $S = 4$, the algebraic maximum (Bergou p. 37, Eq. 3.19). Such [[qc-pr-box|PR boxes]] respect relativity yet exceed Tsirelson\'s $2\\sqrt2$; they do not occur in nature.',
      caption: 'PR box: $S = 4$, still no signal',
      captionFormal: 'PR box: $S = 4$, still no signal',
      stage: plot({ curve: { fn: 'chshVsPhase', x: { from: 0, to: 90 } }, yLines: [{ y: 2, label: 'classical' }, { y: V.q10Tsirelson, label: 'Tsirelson' }, { y: 4, label: 'PR box' }] }),
    },
  },
]

export const Q10_STORY: Record<string, Beat[]> = {
  'q10-separable': separable,
  'q10-no-signal': noSignal,
  'q10-hidden': hidden,
  'q10-chsh': chshUnit,
  'q10-violation': violation,
}
