/**
 * Chapter Q14 scroll story (Physics 709; roles P + W). Beats per docs/roles/proposals/P-Q14-story.md §1, in both
 * tracks, following the rulings of docs/roles/decisions/qc709-Q14.md and qc709-remap.md.
 *
 * Build notes against the plan (ruling 3 of qc709-Q14.md; reported to the orchestrator; see Q14.values.ts's header
 * for the engine/stage reasoning in full):
 * - The plan's new `matrix` POVM source `{povm:{key, which, index?, param?}}` was DECLINED. A POVM element with a
 *   coefficient outside the exact set `MATRIX_COEF_EXACT` (the trine's $\tfrac23$, the N&C constant $2-\sqrt2$, the
 *   Neumark isometry's $\sqrt{2/3}$) is drawn as its bare rank-one DIRECTION only (`{outer:[...]}`, values:'decimal'),
 *   with the real coefficient read off `V` in the caption via `d()`; $\sum_i E_i = I$ is drawn as `mx(pa('I'),
 *   {trace:true})`, captioned "$= \sum_i E_i$" — the plan's own §9.2 fallback. The trine's three directions ARE
 *   exact Bloch directions (θ=120°,φ=0°/180° and the north pole), so each is drawn exactly via `{dir:{...}}`; only
 *   the $\tfrac23$ SCALE is a caption number, never a drawn cell. The Neumark isometry V (a 6×2 matrix of irrational
 *   entries) is never drawn as a grid at all: `q14-neumark` shows the ancilla circuit and the completeness identity
 *   $V^\dagger V = I$ only, exactly as the plan's own fallback says ("the Neumark V/projectors as figures only").
 * - The unsharp-Z meter (q14-pointer) needs NO fallback: at η = ½ both operators are $\tfrac12I \pm \tfrac14Z$, and
 *   $\tfrac14 = \tfrac12\cdot\tfrac12$ is reachable by one level of NESTED `lin` (every coefficient at every level
 *   stays in the exact set `±1, ±½, ±i, ±1/√2`), so it is drawn exactly.
 * - The plan's `plot('usdSuccessVsOverlap'|'helstromErrorVsOverlap'|'discrimCompare', …)` views were DECLINED (the
 *   merged `plot` kind's `CURVE_FNS` has only the two CHSH curves; ruling 3 of qc709-Q14.md says use a
 *   `matrix{spectrum}` or `amplitudes` sweep instead, value in the caption). Every such view is replaced by the
 *   Helstrom operator Γ's own `spectrum:'bars'` view (already engine-exact — Γ = ½(ρ₊ − ρ₀) needs no fallback
 *   either, its coefficients ±½ are already exact) paired with a `bloch-ball` two-point comparison of the states
 *   themselves; the swept/marked NUMBER is stated in the caption from `V`, never drawn as a curve.
 * - `bloch`'s merged shape takes ONE `state: Dir`, not a list (plan §12 Q8 flagged this as unconfirmed): a beat that
 *   needs two states side by side uses `bloch-ball`'s `point`/`compare` (exactly two points) instead; the trine's
 *   three directions are shown one at a time on `bloch` (the running example ψ₀), with the other two named in the
 *   caption (all three share the same pairwise overlap, stated once).
 * - The qutrit ancilla of the trine's own Neumark dilation (q14-neumark:b4) cannot be drawn by the qubit-only
 *   `circuit` kind (as the plan itself notes, §0 "Circuits"): the beat keeps the generic qubit meter picture and
 *   states the qutrit numbers (the matched chances) in prose and caption, backed by engine claims.
 *
 * Standing rules kept here: every derivation (both tracks) carries `view` on at least two steps, from kinds already
 * shown elsewhere in the SAME unit (W-709 #7/#11); exactly one notation beat per new space/notation (W-709 #8/#12);
 * no TeX command outside `$…$`; every number comes from Q14.values.ts (an engine call), never a typed literal;
 * cross-chapter references (Q3, Q8, Q9, Q13) are named in WORDS or via existing glossary ids, never plan ids.
 */
import type { AmpSource, BallPoint, BallState, Beat, BlochState, CircuitStageState, Dir, MatrixCoef, MatrixGridState, MatrixSource, Scrub, StageLayout, StageState } from '../schema'
import { C_METER, PSI0_DIR, PSI1_DIR, V, claim, close } from './Q14.values'

/* ---------------------------------------------------------------------------------------------- */
/* Stage shorthand (plan §0 "Stage shorthand"), as plain builder functions                          */
/* ---------------------------------------------------------------------------------------------- */
const circ = (upTo?: Scrub, extra: Partial<Omit<CircuitStageState, 'kind' | 'circuit' | 'upTo'>> = {}): CircuitStageState => ({
  kind: 'circuit',
  circuit: C_METER,
  shot: 'Q-WIRES',
  ...(upTo !== undefined ? { upTo } : {}),
  ...extra,
})
const mx = (source: MatrixSource, extra: Partial<Omit<MatrixGridState, 'kind' | 'source' | 'labels'>> = {}): MatrixGridState => ({
  kind: 'matrix',
  source,
  labels: 'kets',
  values: 'decimal',
  shot: 'M-GRID',
  ...extra,
})
const bl = (state: Dir, extra: Partial<Omit<BlochState, 'kind' | 'state'>> = {}): BlochState => ({ kind: 'bloch', state, shot: 'B-STD', ...extra })
const ball = (point: BallPoint, extra: Partial<Omit<BallState, 'kind' | 'point'>> = {}): BallState => ({ kind: 'bloch-ball', point, purity: true, shot: 'B-STD', ...extra })
const split = (top: StageState, bottom: StageState): StageLayout => ({ layout: 'split', top, bottom })
const out = (k: AmpSource): MatrixSource => ({ outer: [k] })
const lin = (terms: { c: MatrixCoef; src: MatrixSource }[]): MatrixSource => ({ lin: terms })

/* ---------------------------------------------------------------------------------------------- */
/* Directions and sources reused across the chapter                                                 */
/* ---------------------------------------------------------------------------------------------- */
const D0: Dir = '+z' // |0⟩
const D1: Dir = '-z' // |1⟩
const DPLUS: Dir = '+x' // |+⟩
const HELSTROM_AXIS = { thetaDeg: 45, phiDeg: 0 } // bisector of |0⟩ and |+⟩: the optimal min-error split

/** E± = ½I ± ¼Z at η = ½: ¼ = ½·½, a NESTED `lin` whose every coefficient stays in the exact set. */
const unsharpE = (sign: '+' | '-'): MatrixSource =>
  lin([
    { c: '+1/2', src: { pauli: 'I' } },
    { c: '+1/2', src: { lin: [{ c: sign === '+' ? '+1/2' : '-1/2', src: { pauli: 'Z' } }] } },
  ])
const E_PLUS_SRC = unsharpE('+')
const E_MINUS_SRC = unsharpE('-')
const IDENTITY_SRC: MatrixSource = { pauli: 'I' }
/** Γ = ½(ρ₊ − ρ₀), the Helstrom operator at equal priors: coefficients ±½, already exact. */
const GAMMA_SRC: MatrixSource = lin([
  { c: '+1/2', src: { rho: { ket: { ket: '+' } } } },
  { c: '-1/2', src: { rho: { ket: { ket: '0' } } } },
])

/* ---------------------------------------------------------------------------------------------- */
/* q14-pointer — Reading a qubit through a meter                                                    */
/* ---------------------------------------------------------------------------------------------- */

const pointer: Beat[] = [
  {
    id: 'q14-pointer:b1',
    phase: 'books',
    text: 'A measurement is never magic. You couple the system to a meter — a pointer, a needle, a screen — let them interact, then read the meter. The meter is big enough to read by eye.',
    formal:
      "Bergou's model (§5.2) couples the observable $X$ to a pointer's momentum $P$ through $H \\supset \\hbar gXP$, evolves by $U = e^{-igtXP}$, and the pointer shifts to a position $x_j = gt\\lambda_j$ that reads off $X$'s eigenvalue $\\lambda_j$ (Eqs. 5.3–5.7).",
    caption: 'couple the system to a meter, then read the meter',
    captionFormal: '$H \\supset \\hbar gXP$, $U = e^{-igtXP}$: the pointer shifts by $gt\\lambda_j$',
    stage: circ(0),
  },
  {
    id: 'q14-pointer:b2',
    phase: 'books',
    text: 'Make the meter sharp and you get the usual measurement: $|0\\rangle$ or $|1\\rangle$, nothing between. Make it a little blurry and you get a softer reading — a lean toward up or down that is not quite certain.',
    formal:
      'A noisy $Z$ meter is described not by the projectors $|0\\rangle\\langle0|, |1\\rangle\\langle1|$ but by two operators $E_\\pm = \\tfrac12(I \\pm \\eta Z)$, with sharpness $0 \\le \\eta \\le 1$. At $\\eta = 1$ it is the sharp $Z$ measurement; below it the reading is unsharp but still positive.',
    caption: 'a sharp meter gives $|0\\rangle$ or $|1\\rangle$; a soft one, $E_+ = \\mathrm{diag}(0.75, 0.25)$, $E_- = \\mathrm{diag}(0.25, 0.75)$ at $\\eta=\\tfrac12$',
    captionFormal: '$E_\\pm = \\tfrac12(I \\pm \\eta Z)$: sharp at $\\eta = 1$; here $\\eta=\\tfrac12$, $E_+ = \\mathrm{diag}(0.75, 0.25)$',
    stage: split(mx(E_PLUS_SRC), mx(E_MINUS_SRC)),
    claims: [
      claim('q14UnsharpEPlus00', 'the soft meter\u2019s up-operator reads $0.75$ on its $|0\\rangle$ entry at $\\eta=\\tfrac12$', () => close(V.q14UnsharpEPlus00, 0.75)),
      claim('q14UnsharpEPlus11', 'and $0.25$ on its $|1\\rangle$ entry', () => close(V.q14UnsharpEPlus11, 0.25)),
      claim('q14UnsharpEMinus00', 'the down-operator reads $0.25$ on its $|0\\rangle$ entry', () => close(V.q14UnsharpEMinus00, 0.25)),
      claim('q14UnsharpEMinus11', 'and $0.75$ on its $|1\\rangle$ entry', () => close(V.q14UnsharpEMinus11, 0.75)),
    ],
  },
  {
    id: 'q14-pointer:b3',
    phase: 'books',
    text: 'Feed in $|0\\rangle$ and the soft meter reads up with chance $0.75$, down with $0.25$ — usually right. Feed in $|+\\rangle$ and it is a coin, $0.5$ each, because $|+\\rangle$ leans neither way.',
    formal:
      'The outcome probabilities are $p_\\pm = \\mathrm{Tr}(E_\\pm\\rho)$ — the projective rule, with $E_\\pm$ for the projectors. On $|0\\rangle$: $(0.75, 0.25)$ at $\\eta = \\tfrac12$; on $|+\\rangle$: $(0.5, 0.5)$. A blurry meter extracts less than a sharp one does.',
    caption: 'soft meter on $|0\\rangle$: $0.75$ up, $0.25$ down; on $|+\\rangle$: $0.5$ each',
    captionFormal: '$p_\\pm = \\mathrm{Tr}(E_\\pm\\rho)$: $(0.75, 0.25)$ on $|0\\rangle$, $(0.5, 0.5)$ on $|+\\rangle$',
    stage: split(bl(D0), mx(E_PLUS_SRC)),
    claims: [
      claim('q14UnsharpP0Plus', 'the soft meter reads up with chance $0.75$ on input $|0\\rangle$', () => close(V.q14UnsharpP0Plus, 0.75)),
      claim('q14UnsharpP0Minus', 'and down with chance $0.25$', () => close(V.q14UnsharpP0Minus, 0.25)),
      claim('q14UnsharpPPlusPlus', 'on $|+\\rangle$ the soft meter is a fair coin, $0.5$ up', () => close(V.q14UnsharpPPlusPlus, 0.5)),
    ],
    fidelity: ['qc-matrix-trace-engine'],
    derivation: {
      result: 'p_\\pm = \\mathrm{Tr}(E_\\pm\\rho),\\ p_+ = 0.75 \\text{ on } |0\\rangle',
      ground: [
        { tex: 'p_+ = \\mathrm{Tr}(E_+\\,|0\\rangle\\langle0|)', why: "The soft meter's up-chance is the [[qc-born-rule|Born rule]] with $E_+$ for the projector.", view: circ(2, { outcomes: '0' }), viewCaption: 'read the meter on input $|0\\rangle$' },
        { tex: 'E_+ = \\tfrac12(I + \\tfrac12 Z) = \\mathrm{diag}(\\tfrac34, \\tfrac14)', why: 'The up-element is a blurred $|0\\rangle\\langle0|$.', view: mx(E_PLUS_SRC), viewCaption: '$E_+ = \\mathrm{diag}(0.75, 0.25)$' },
        { tex: 'p_+ = \\tfrac12(1 + \\tfrac12) = 0.75', why: 'Its top-left entry is the chance on $|0\\rangle$.', view: bl(D0), viewCaption: 'input $|0\\rangle$' },
        { tex: 'p_\\pm = \\mathrm{Tr}(E_\\pm\\rho),\\quad p_+ = 0.75 \\text{ on } |0\\rangle', why: "The soft meter's rule, evaluated." },
      ],
      formal: [
        { tex: 'p_+ = \\mathrm{Tr}(E_+\\rho) = \\tfrac12\\mathrm{Tr}(\\rho) + \\tfrac{\\eta}{2}\\mathrm{Tr}(Z\\rho)', why: 'Linearity of the trace on $E_+ = \\tfrac12(I + \\eta Z)$.', view: mx(E_PLUS_SRC) },
        { tex: 'p_+ = \\tfrac12(1 + \\eta\\langle Z\\rangle) = 0.75', why: '$\\langle Z\\rangle = 1$ on $|0\\rangle$, $\\eta = \\tfrac12$.', view: bl(D0) },
      ],
    },
  },
  {
    id: 'q14-pointer:b4',
    phase: 'clue',
    text: 'A sharp meter forces one of two answers. Is that the only kind of measurement a [[qubit|qubit]] allows?',
    formal: 'A projective [[qubit|qubit]] measurement gives at most two outcomes. Is every physical measurement of a qubit projective?',
    stage: circ(1),
    reveal: {
      text: 'No. A measurement is any coupling-and-read. Blur the meter and you get soft outcomes; use a bigger meter and you can get more than two. The next unit names this freedom.',
      formal:
        'No. Reading a meter realises $p_i = \\mathrm{Tr}(E_i\\rho)$ for operators $E_i$ that need not be [[orthogonal|orthogonal]] projectors — only positive and summing to $I$. That is strictly more general than the projective postulate ([[qc-selective-measurement|Chapter Q3]]).',
      caption: 'a measurement is any meter you can read; projective is the sharp special case',
      stage: mx(IDENTITY_SRC, { trace: true }),
      claims: [claim('q14UnsharpSumGap', 'the soft meter\u2019s two operators still add to the identity exactly', () => close(V.q14UnsharpSumGap, 0, 1e-9))],
    },
  },
]

/* ---------------------------------------------------------------------------------------------- */
/* q14-povm — More answers than dimensions                                                          */
/* ---------------------------------------------------------------------------------------------- */

const povm: Beat[] = [
  {
    id: 'q14-povm:b1',
    phase: 'books',
    text: 'A sharp measurement sorts states into boxes that do not overlap — at most one box per dimension. Drop that rule. Keep only what you cannot do without: each outcome a positive operator, and all adding to the identity.',
    formal:
      "Abandon Bergou's Postulate 2 (orthogonality, $P_iP_j = \\delta_{ij}P_i$). Keep Postulate 1 as $\\sum_i E_i = I$ with each $E_i \\ge 0$. Orthogonality was the only thing capping the outcome count at the dimension (§5.3).",
    caption: 'keep only this: each outcome positive, all adding to $I$',
    captionFormal: 'drop orthogonality; keep $\\sum_i E_i = I$, $E_i \\ge 0$',
    stage: split(mx(out({ ket: '0' })), mx(out({ ket: '1' }))),
  },
  {
    id: 'q14-povm:b2',
    phase: 'books',
    introduces: ['qc-povm-element'],
    text:
      'This is a POVM: a set of positive operators $E_i$ that add to the identity. Each is an outcome. The chance of outcome $i$ on a state $\\rho$ is $\\mathrm{Tr}(E_i\\rho)$, the same rule as before with $E_i$ in place of the projector. (Bergou writes $\\Pi_j$.)',
    formal:
      'A POVM is a decomposition of the identity into positive operators, $\\sum_i E_i = I$, $E_i \\ge 0$ (Bergou §5.3; N&C Eq. 2.117). The elements $E_i$ give $p_i = \\mathrm{Tr}(E_i\\rho)$ (Postulate 5′): positivity keeps $p_i \\ge 0$, completeness keeps $\\sum_i p_i = 1$.',
    caption: 'a POVM: positive $E_i$ with $\\sum_i E_i = I$; one of the trine\u2019s three directions, $120°$ from the others',
    captionFormal: '$\\sum_i E_i = I$, $E_i \\ge 0$ (Bergou $\\Pi_j$, N&C $E_m$)',
    stage: split(bl(PSI0_DIR), mx(IDENTITY_SRC, { trace: true })),
    claims: [claim('q14TrineSumGap', 'the trine\u2019s three elements sum to the identity exactly', () => close(V.q14TrineSumGap, 0, 1e-9))],
    fidelity: ['qc-matrix-not-a-space'],
    derivation: {
      result: '\\sum_{j=0}^{2}\\tfrac23|\\psi_j\\rangle\\langle\\psi_j| = I',
      ground: [
        { tex: '|\\psi_0\\rangle, |\\psi_1\\rangle, |\\psi_2\\rangle \\text{ at } 120°', why: 'Three symmetric states on a great circle.', view: bl(PSI0_DIR), viewCaption: 'one of the trine, $120°$ from the others' },
        { tex: 'E_j = \\tfrac23|\\psi_j\\rangle\\langle\\psi_j| \\ge 0', why: 'Each element is a positive rank-one operator.', view: mx(out({ dir: PSI0_DIR })), viewCaption: '$|\\psi_0\\rangle\\langle\\psi_0|$; $E_0$ is $\\tfrac23$ of this' },
        { tex: '\\sum_j E_j = \\tfrac23\\sum_j|\\psi_j\\rangle\\langle\\psi_j| = \\tfrac23\\cdot\\tfrac32 I', why: 'The three rank-ones sum to $\\tfrac32 I$.', view: mx(IDENTITY_SRC, { trace: true }), viewCaption: '$\\sum_j E_j = I$' },
        { tex: '\\sum_{j=0}^{2}\\tfrac23|\\psi_j\\rangle\\langle\\psi_j| = I', why: 'A legitimate three-outcome POVM on a qubit.' },
      ],
      formal: [
        { tex: '\\sum_j|\\psi_j\\rangle\\langle\\psi_j| = \\tfrac32 I', why: 'The symmetric trine resolves $\\tfrac32 I$ by equal spacing.', view: bl(PSI0_DIR) },
        { tex: '\\sum_j\\tfrac23|\\psi_j\\rangle\\langle\\psi_j| = I,\\ E_j \\ge 0', why: 'Positivity and completeness: a POVM.', view: mx(IDENTITY_SRC, { trace: true }) },
      ],
    },
  },
  {
    id: 'q14-povm:b3',
    phase: 'books',
    text:
      'Where do the elements come from? Each outcome has a detection operator $A_i$, with $E_i = A_i^\\dagger A_i$ — positive by construction. The trine uses three, $A_j = \\sqrt{2/3}\\,|\\psi_j\\rangle\\langle\\psi_j|$, for three states $120°$ apart.',
    formal:
      'Each $E_i = A_i^\\dagger A_i$ for a detection operator $A_i = U_i\\sqrt{E_i}$ (Bergou Eq. 5.11, the polar form, $U_i$ an arbitrary unitary) — the measurement twin of Chapter Q13’s Kraus operators. The trine ensemble (Eq. 5.24) takes $A_j = \\sqrt{2/3}\\,|\\psi_j\\rangle\\langle\\psi_j|$.',
    caption: 'detection operator $A_i$: $E_i = A_i^\\dagger A_i$; here, $|\\psi_1\\rangle\\langle\\psi_1|$, the direction behind $E_1$',
    captionFormal: '$E_i = A_i^\\dagger A_i$, $A_i = U_i\\sqrt{E_i}$ (polar); trine $A_j = \\sqrt{2/3}|\\psi_j\\rangle\\langle\\psi_j|$',
    stage: mx(out({ dir: PSI1_DIR })),
    claims: [
      claim('q14TrineCorrect', 'feeding $|\\psi_0\\rangle$ into the trine gives the correct outcome with chance $0.667$', () => close(V.q14TrineCorrect, 2 / 3, 1e-9)),
      claim('q14TrineError', 'and a wrong outcome with chance $0.167$', () => close(V.q14TrineError, 1 / 6, 1e-9)),
    ],
  },
  {
    id: 'q14-povm:b4',
    phase: 'clue',
    text: 'A sharp qubit measurement has two outcomes. The trine has three. Is there a ceiling on how many a POVM can have?',
    formal: 'Projective measurement caps outcomes at the dimension ($2$ for a qubit). What caps the number of POVM elements?',
    stage: mx(out({ ket: '0' })),
    reveal: {
      text: 'No ceiling. [[orthogonal|Orthogonality]] was the only thing holding the count to the dimension, and a POVM drops it. A qubit POVM can have three, four or more — as many positive operators as you can make add to $I$.',
      formal:
        'Nothing caps it. Without the constraint $P_iP_j = \\delta_{ij}P_i$, the number of terms in $\\sum_i E_i = I$ is unbounded (Bergou §5.3). Only positivity and completeness remain; a qubit admits POVMs with arbitrarily many outcomes.',
      caption: 'no ceiling: a qubit POVM can have any number of outcomes',
      stage: mx(IDENTITY_SRC, { trace: true }),
      claims: [claim('q14TrineSumGap', 'the trine\u2019s three elements already sum to the identity exactly', () => close(V.q14TrineSumGap, 0, 1e-9))],
    },
  },
]

/* ---------------------------------------------------------------------------------------------- */
/* q14-neumark — Every POVM is projective upstairs                                                  */
/* ---------------------------------------------------------------------------------------------- */

const neumark: Beat[] = [
  {
    id: 'q14-neumark:b1',
    phase: 'books',
    introduces: ['qc-dilation-space'],
    text:
      'Is a POVM a real measurement, or just arithmetic? It is real. Add a second system — an ancilla — couple the two with one unitary, then make an ordinary sharp measurement on the ancilla. The system feels a POVM.',
    formal:
      'Work in the enlarged space $H_A \\otimes H_B$ — the system $A$ and an ancilla $B$ in a fixed state $|\\psi_B\\rangle$ (Bergou §5.4). A joint unitary $U_{AB}$, then a projective measurement $I_A \\otimes |m_B\\rangle\\langle m_B|$ on the ancilla, gives outcome $m$ with probability $\\lVert(I_A\\otimes|m_B\\rangle\\langle m_B|)U_{AB}|\\psi_A\\rangle|\\psi_B\\rangle\\rVert^2$ (Eq. 5.15).',
    caption: 'add an ancilla, couple, then measure the ancilla sharply',
    captionFormal: 'in $H_A\\otimes H_B$: a unitary $U_{AB}$, then a projective measurement on $B$',
    stage: circ(1),
  },
  {
    id: 'q14-neumark:b2',
    phase: 'books',
    text:
      'Reading the ancilla in state $|m\\rangle$ leaves the system acted on by $A_m$, where $A_m|\\psi\\rangle = \\langle m|U_{AB}(|\\psi\\rangle|\\psi_B\\rangle)$. Because $U_{AB}$ is unitary, $\\sum_m A_m^\\dagger A_m = I$ — so $\\{A_m^\\dagger A_m\\}$ is a POVM.',
    formal:
      'Define $A_m|\\psi_A\\rangle = \\langle m_B|U_{AB}(|\\psi_A\\rangle\\otimes|\\psi_B\\rangle)$ (Eq. 5.16). Then $p_m = \\langle\\psi_A|A_m^\\dagger A_m|\\psi_A\\rangle$ (Eq. 5.17), and unitarity forces $\\sum_m A_m^\\dagger A_m = I_A$ (Eqs. 5.18–5.19). An ancilla measurement always realises the POVM $\\{A_m^\\dagger A_m\\}$ — the first half of Neumark\u2019s theorem.',
    caption: '$A_m|\\psi\\rangle = \\langle m|U_{AB}(|\\psi\\rangle|\\psi_B\\rangle)$; $\\sum_m A_m^\\dagger A_m = I$',
    captionFormal: '$p_m = \\langle\\psi|A_m^\\dagger A_m|\\psi\\rangle$, $\\sum_m A_m^\\dagger A_m = I_A$ (unitarity)',
    stage: split(circ(2, { outcomes: '0' }), mx(IDENTITY_SRC, { trace: true })),
    claims: [claim('q14NeumarkVdagVGap', 'the ancilla construction\u2019s isometry keeps $V^\\dagger V = I$ exactly', () => close(V.q14NeumarkVdagVGap, 0, 1e-9))],
  },
  {
    id: 'q14-neumark:b3',
    phase: 'books',
    text:
      'The converse also holds. Given any POVM, build $V|\\psi\\rangle = \\sum_m A_m|\\psi\\rangle\\otimes|m\\rangle$. Because $\\sum_m A_m^\\dagger A_m = I$, it keeps [[inner-product|inner products]]: $V^\\dagger V = I$. So it extends to a unitary — every POVM is a sharp measurement upstairs.',
    formal:
      'Given $\\{A_m\\}$ with $\\sum_m A_m^\\dagger A_m = I$, set $U_{AB}(|\\psi_A\\rangle|\\psi_B\\rangle) = \\sum_m A_m|\\psi_A\\rangle\\otimes|m_B\\rangle$ (Eq. 5.22). This is inner-product preserving (Eq. 5.23: $V^\\dagger V = \\sum_m A_m^\\dagger A_m = I$), so it is an isometry that extends to a unitary. Neumark: POVMs and ancilla measurements correspond one-to-one.',
    caption: '$V = \\sum_m A_m\\otimes|m\\rangle$, $V^\\dagger V = I$: extends to a unitary',
    captionFormal: '$V^\\dagger V = \\sum_m A_m^\\dagger A_m = I$: an isometry, extended to $U_{AB}$',
    stage: split(circ(2, { outcomes: '0' }), mx(IDENTITY_SRC, { trace: true })),
    claims: [claim('q14NeumarkVdagVGap', 'the trine\u2019s own isometry satisfies $V^\\dagger V = I$ exactly', () => close(V.q14NeumarkVdagVGap, 0, 1e-9))],
    fidelity: ['qc-matrix-trace-engine'],
    derivation: {
      result: 'V^\\dagger V = I \\Rightarrow V \\text{ extends to a unitary } U_{AB}',
      ground: [
        { tex: 'V|\\psi\\rangle = \\sum_m A_m|\\psi\\rangle\\otimes|m\\rangle', why: "File each outcome's detection into a fresh ancilla slot.", view: circ(1), viewCaption: '$V$: system into system + ancilla' },
        { tex: 'V^\\dagger V = \\sum_{m} A_m^\\dagger A_m', why: 'Its inner-product matrix is exactly the POVM\u2019s own completeness sum.' },
        { tex: 'V^\\dagger V = I', why: 'So $V$ preserves every inner product: an isometry, which extends to a unitary.', view: mx(IDENTITY_SRC, { trace: true }), viewCaption: '$V^\\dagger V = I$' },
        { tex: 'V^\\dagger V = I \\Rightarrow V \\text{ extends to a unitary } U_{AB}', why: 'Every POVM is a sharp measurement upstairs.' },
      ],
      formal: [
        { tex: 'V^\\dagger V = \\sum_m A_m^\\dagger A_m = I', why: '$V$ is an isometry on $H_A$, by completeness (Unit 14.2).', view: mx(IDENTITY_SRC, { trace: true }) },
        { tex: 'V^\\dagger V = I \\Rightarrow U_{AB} \\text{ unitary}', why: 'Extend $V$ by the identity on the complement of $|\\psi_B\\rangle$.', view: circ(1) },
      ],
    },
  },
  {
    id: 'q14-neumark:b4',
    phase: 'clue',
    text: 'The trine needs three outcomes. How big an ancilla does its sharp-measurement version need, and does it give the same chances?',
    formal: 'What ancilla dimension realises the trine POVM, and does the dilated projective measurement reproduce $\\mathrm{Tr}(E_j\\rho)$?',
    stage: circ(1),
    reveal: {
      text: 'A qutrit — a three-level ancilla, one level per outcome. The sharp measurement on the enlarged space gives exactly the trine chances: on $|0\\rangle$, $(0.167, 0.167, 0.667)$, the same as $\\mathrm{Tr}(E_j\\rho)$. Nothing is lost in the lift.',
      formal:
        'A three-dimensional ancilla ($m = 3$; Bergou Eqs. 5.26–5.31). The dilated measurement $I_A\\otimes|m\\rangle\\langle m|$ on $V\\rho V^\\dagger$ returns $\\mathrm{Tr}(E_j\\rho)$ exactly — on $|0\\rangle$, $(0.167, 0.167, 0.667)$ — the defining property of the dilation.',
      caption: 'a qutrit ancilla; the lift reproduces $\\mathrm{Tr}(E_j\\rho)$ exactly',
      stage: circ(2, { outcomes: '0' }),
      claims: [
        claim('q14NeumarkAncillaDim', 'the trine\u2019s dilation needs a three-level ancilla', () => close(V.q14NeumarkAncillaDim, 3)),
        claim('q14NeumarkMatch2', 'and the dilated measurement\u2019s third outcome matches the POVM\u2019s own chance, $0.667$', () => close(V.q14NeumarkMatch2, 2 / 3, 1e-9)),
      ],
    },
  },
]

/* ---------------------------------------------------------------------------------------------- */
/* q14-usd — Never wrong, sometimes unsure                                                          */
/* ---------------------------------------------------------------------------------------------- */

const usd: Beat[] = [
  {
    id: 'q14-usd:b1',
    phase: 'books',
    text:
      'Alice hands Bob a state, either $|\\psi_1\\rangle$ or $|\\psi_2\\rangle$ — he knows both, not which. If they are not perpendicular, no measurement can name the state and never be wrong. Perfect sorting would force $\\langle\\psi_1|\\psi_2\\rangle = 0$.',
    formal:
      'Two non-orthogonal states $|\\psi_1\\rangle, |\\psi_2\\rangle$, priors $\\eta_1, \\eta_2$. Suppose detectors $E_1 + E_2 = I$ never err: $E_1|\\psi_2\\rangle = E_2|\\psi_1\\rangle = 0$ (Eqs. 5.32–5.33). Sandwiching $E_1 + E_2 = I$ between $\\langle\\psi_1|$ and $|\\psi_2\\rangle$ gives $\\langle\\psi_1|\\psi_2\\rangle = 0$ — only orthogonal states allow it (§5.5.1).',
    caption: 'never-wrong sorting of non-perpendicular states would force $\\langle\\psi_1|\\psi_2\\rangle = 0$',
    captionFormal: '$E_1|\\psi_2\\rangle = E_2|\\psi_1\\rangle = 0$, $E_1+E_2 = I \\Rightarrow \\langle\\psi_1|\\psi_2\\rangle = 0$',
    stage: ball(D0, { compare: DPLUS }),
    claims: [claim('q14Overlap0Plus', 'the running pair $|0\\rangle, |+\\rangle$ overlap at $0.707$, so they are not orthogonal', () => close(V.q14Overlap0Plus, Math.SQRT1_2, 1e-9))],
    fidelity: ['ball-surface-pure'],
    derivation: {
      result: 'E_1 + E_2 = I,\\ E_1|\\psi_2\\rangle = E_2|\\psi_1\\rangle = 0 \\Rightarrow \\langle\\psi_1|\\psi_2\\rangle = 0',
      ground: [
        { tex: 'E_1 + E_2 = I,\\quad E_1|\\psi_2\\rangle = 0,\\ E_2|\\psi_1\\rangle = 0', why: 'Assume two detectors that never err.', view: ball(D0, { compare: DPLUS }), viewCaption: 'the two non-perpendicular states' },
        { tex: '\\langle\\psi_1|(E_1 + E_2)|\\psi_2\\rangle = \\langle\\psi_1|\\psi_2\\rangle', why: 'Sandwich the identity between the two states.', view: mx(IDENTITY_SRC, { trace: true }), viewCaption: '$E_1 + E_2 = I$' },
        { tex: '\\langle\\psi_1|E_1|\\psi_2\\rangle + \\langle\\psi_1|E_2|\\psi_2\\rangle = 0 + 0', why: 'Both terms vanish by the never-err condition.', view: ball(D0, { compare: DPLUS, measure: { thetaDeg: 90, phiDeg: 0 } }), viewCaption: 'a detector aimed at the other\u2019s perpendicular' },
        { tex: '\\langle\\psi_1|\\psi_2\\rangle = 0', why: 'Perfect sorting forces orthogonality — $|0\\rangle, |+\\rangle$, overlap $0.707$, cannot be perfectly sorted.' },
      ],
      formal: [
        { tex: '\\langle\\psi_1|(E_1 + E_2)|\\psi_2\\rangle = \\langle\\psi_1|E_1|\\psi_2\\rangle + \\langle\\psi_1|E_2|\\psi_2\\rangle = 0', why: '$E_1|\\psi_2\\rangle = 0$ and $\\langle\\psi_1|E_2 = 0$ (Hermitian).', view: mx(IDENTITY_SRC, { trace: true }) },
        { tex: '\\langle\\psi_1|\\psi_2\\rangle = 0', why: 'But the left side is $\\langle\\psi_1|I|\\psi_2\\rangle$; possible only if orthogonal.', view: ball(D0, { compare: DPLUS }) },
      ],
    },
  },
  {
    id: 'q14-usd:b2',
    phase: 'books',
    introduces: ['qc-inconclusive-outcome'],
    text:
      'The fix is to allow a third answer: don\u2019t know. Keep two detectors that never lie — $E_1$ fires only on $|\\psi_2\\rangle$\u2019s side, $E_2$ only on $|\\psi_1\\rangle$\u2019s. Sweep the rest into $E_0$, the inconclusive one: $E_1 + E_2 + E_0 = I$.',
    formal:
      'Introduce a third POVM element $E_0 \\ge 0$ with $E_1 + E_2 + E_0 = I$ (Eq. 5.34), keeping $E_1|\\psi_2\\rangle = E_2|\\psi_1\\rangle = 0$. The inconclusive outcome $E_0$ can fire for either state; it is not an error, Bob simply declines. Then $p_1 + q_1 = p_2 + q_2 = 1$.',
    caption: "add a third 'don't know' outcome $E_0$: $E_1 + E_2 + E_0 = I$; here, N&C's $E_1 = (2-\\sqrt2)|1\\rangle\\langle1|$",
    captionFormal: '$E_1 + E_2 + E_0 = I$; $E_0 \\ge 0$ inconclusive, never an error',
    stage: mx(out({ ket: '1' })),
    claims: [claim('q14NcConst', 'N&C\u2019s never-err coefficient is $2-\\sqrt2 = 0.586$', () => close(V.q14NcConst, 2 - Math.SQRT2, 1e-9))],
    terms: {},
  },
  {
    id: 'q14-usd:b3',
    phase: 'books',
    text: "How often can Bob answer? For $|0\\rangle$ and $|+\\rangle$ at even odds, he succeeds with chance $0.293$ and is unsure the rest, $0.707$. The closer the two states, the more often he must say 'don't know'.",
    formal:
      "At equal priors the optimal success is $1 - |\\langle\\psi_1|\\psi_2\\rangle|$ (Bergou's $Q^{\\mathrm{POVM}} = 2\\sqrt{\\eta_1\\eta_2}\\cos\\Theta$, Eq. 5.42, at $\\eta_i = \\tfrac12$). For $|0\\rangle, |+\\rangle$: $0.293$, inconclusive $0.707$. The N&C scheme (Eqs. 2.118–2.120) achieves it — $E_1$ never fires for $|0\\rangle$, so a click means $|+\\rangle$.",
    caption: '$|0\\rangle$ vs $|+\\rangle$: answer $0.293$, unsure $0.707$',
    captionFormal: 'optimal success $1 - |\\langle\\psi_1|\\psi_2\\rangle| = 0.293$ for $|0\\rangle, |+\\rangle$',
    stage: split(ball(D0, { compare: DPLUS }), mx(out({ ket: '1' }))),
    claims: [
      claim('q14UsdSucc', 'Bob succeeds with chance $0.293$', () => close(V.q14UsdSucc, 1 - Math.SQRT1_2, 1e-9)),
      claim('q14UsdInconcl', 'and is unsure the rest, $0.707$, of the time', () => close(V.q14UsdInconcl, Math.SQRT1_2, 1e-9)),
    ],
  },
  {
    id: 'q14-usd:b4',
    phase: 'clue',
    text: 'Push the two states together until they coincide. What does unambiguous discrimination give then?',
    formal: 'As $|\\langle\\psi_1|\\psi_2\\rangle| \\to 1$, what happens to the USD success probability, and why?',
    stage: ball(D0, { compare: DPLUS }),
    reveal: {
      text: "Nothing. At overlap $1$ the states are the same, and the success chance $1 - |\\langle\\psi_1|\\psi_2\\rangle|$ drops to $0$: Bob always says 'don't know'. Only perpendicular states, overlap $0$, let him answer every time.",
      formal:
        'It vanishes: $1 - |\\langle\\psi_1|\\psi_2\\rangle| \\to 0$ as the overlap $\\to 1$; identical states carry no distinguishing information. At the other end, orthogonal states (overlap $0$) give success $1$ — USD reduces to a sharp projective measurement.',
      caption: 'success $1 - |\\langle\\psi_1|\\psi_2\\rangle|$: $0$ at identical, $1$ at orthogonal',
      stage: ball(D0, { compare: D1 }),
      claims: [claim('q14CompareC0Usd', 'at orthogonal states (overlap $0$) USD succeeds with certainty, $1$', () => close(V.q14CompareC0Usd, 1, 1e-9))],
    },
  },
]

/* ---------------------------------------------------------------------------------------------- */
/* q14-min-error — The fewest mistakes: Helstrom                                                    */
/* ---------------------------------------------------------------------------------------------- */

const minError: Beat[] = [
  {
    id: 'q14-min-error:b1',
    phase: 'books',
    text: "Sometimes you must answer every time — no 'don't know' allowed. Then for non-perpendicular states you will sometimes be wrong. The goal shifts: not 'never wrong' but 'wrong as rarely as possible'.",
    formal:
      'Minimum-error discrimination forbids the inconclusive outcome: $E_1 + E_2 = I$, a two-outcome POVM, always conclusive (§5.5.2). Errors are then unavoidable for non-orthogonal states; the task is to minimise $P_{\\mathrm{err}} = \\eta_1\\mathrm{Tr}(\\rho_1 E_2) + \\eta_2\\mathrm{Tr}(\\rho_2 E_1)$ (Eq. 5.49).',
    caption: 'answer every time; minimise how often you are wrong',
    captionFormal: '$E_1 + E_2 = I$; minimise $P_{\\mathrm{err}} = \\eta_1\\mathrm{Tr}(\\rho_1E_2) + \\eta_2\\mathrm{Tr}(\\rho_2E_1)$',
    stage: ball(D0, { compare: DPLUS }),
    terms: {},
  },
  {
    id: 'q14-min-error:b2',
    phase: 'books',
    introduces: ['qc-helstrom-bound'],
    text: 'The trick: form $\\Gamma = \\eta_2\\rho_2 - \\eta_1\\rho_1$ and look at its eigenvalues. Guess state $2$ where $\\Gamma$ is positive, state $1$ where it is negative. The leftover error is the Helstrom bound, fixed by the size of $\\Gamma$.',
    formal:
      'Form the Hermitian $\\Gamma = \\eta_2\\rho_2 - \\eta_1\\rho_1$ (Eq. 5.51). The optimal measurement projects onto its positive ($E_2$) and negative ($E_1$) eigenspaces, giving the Helstrom bound $P_E = \\tfrac12(1 - \\lVert\\Gamma\\rVert_1)$ (Eq. 5.58), $\\lVert\\cdot\\rVert_1$ the trace norm ([[qc-trace-norm|Chapter Q9]]).',
    caption: '$\\Gamma = \\eta_2\\rho_2 - \\eta_1\\rho_1$; the error is set by its size, the Helstrom bound',
    captionFormal: '$P_E = \\tfrac12(1 - \\lVert\\eta_2\\rho_2 - \\eta_1\\rho_1\\rVert_1)$ (project on $\\Gamma$\u2019s $\\pm$ eigenspaces)',
    stage: mx(GAMMA_SRC, { spectrum: 'bars' }),
    claims: [
      claim('q14HelstromGammaLo', '$\\Gamma$\u2019s negative eigenvalue is $-0.354$', () => close(V.q14HelstromGammaLo, -Math.SQRT1_2 / 2, 1e-9)),
      claim('q14HelstromGammaHi', 'and its positive one is $+0.354$', () => close(V.q14HelstromGammaHi, Math.SQRT1_2 / 2, 1e-9)),
    ],
  },
  {
    id: 'q14-min-error:b3',
    phase: 'books',
    text: 'For $|0\\rangle$ and $|+\\rangle$ at even odds, the best you can do is be right $0.854$ of the time, wrong $0.146$. That answers far more often than the unambiguous scheme — but it is sometimes wrong, which that never is.',
    formal:
      'For two equiprobable pure states, $P_E = \\tfrac12(1 - \\sqrt{1 - |\\langle\\psi_1|\\psi_2\\rangle|^2})$ (Eq. 5.59). For $|0\\rangle, |+\\rangle$: success $0.854$, error $0.146$. Here $\\lVert\\Gamma\\rVert_1 = 2(0.354) = 0.707$, so $P_{\\mathrm{succ}} = \\tfrac12(1 + 0.707)$.',
    caption: '$|0\\rangle$ vs $|+\\rangle$: right $0.854$, wrong $0.146$',
    captionFormal: 'P_E = \\tfrac12(1 - \\sqrt{1 - |\\langle\\psi_1|\\psi_2\\rangle|^2}) = 0.146',
    stage: split(ball(D0, { compare: DPLUS, measure: HELSTROM_AXIS }), mx(GAMMA_SRC, { spectrum: 'bars' })),
    claims: [
      claim('q14HelstromSucc', 'the best possible success rate is $0.854$', () => close(V.q14HelstromSucc, 0.5 * (1 + Math.SQRT1_2), 1e-9)),
      claim('q14HelstromErr', 'leaving an error rate of $0.146$', () => close(V.q14HelstromErr, 0.5 * (1 - Math.SQRT1_2), 1e-9)),
    ],
    fidelity: ['qc-matrix-spectrum-engine'],
    derivation: {
      result: 'P_E = \\tfrac12(1 - \\sqrt{1 - |\\langle\\psi_1|\\psi_2\\rangle|^2}) = 0.146',
      ground: [
        { tex: '\\Gamma = \\tfrac12(\\rho_2 - \\rho_1),\\quad \\lambda = \\pm0.354', why: 'Form the Helstrom operator at equal priors; read its eigenvalues.', view: mx(GAMMA_SRC, { spectrum: 'bars' }), viewCaption: '$\\Gamma$\u2019s spectrum $\\pm0.354$' },
        { tex: 'P_E = \\tfrac12(1 - \\lVert\\Gamma\\rVert_1) = \\tfrac12(1 - 0.707)', why: 'Guess by the sign of $\\Gamma$; the error is set by its trace norm.', view: ball(D0, { compare: DPLUS, measure: HELSTROM_AXIS }), viewCaption: 'the optimal split between the two states' },
        { tex: 'P_E = 0.146', why: 'The fewest mistakes for this pair.' },
        { tex: 'P_E = \\tfrac12(1 - \\sqrt{1 - |\\langle\\psi_1|\\psi_2\\rangle|^2}) = 0.146', why: 'The pure-state Helstrom bound.' },
      ],
      formal: [
        { tex: 'P_E = \\tfrac12(1 - \\lVert\\eta_2\\rho_2 - \\eta_1\\rho_1\\rVert_1)', why: "Project on $\\Gamma$'s positive and negative eigenspaces (Eq. 5.58).", view: mx(GAMMA_SRC, { spectrum: 'bars' }) },
        { tex: '= \\tfrac12(1 - \\sqrt{1 - 4\\eta_1\\eta_2|\\langle\\psi_1|\\psi_2\\rangle|^2}) = 0.146', why: 'The pure, equal-prior form (Eq. 5.59).', view: ball(D0, { compare: DPLUS, measure: HELSTROM_AXIS }) },
      ],
    },
  },
  {
    id: 'q14-min-error:b4',
    phase: 'clue',
    text: 'Suppose one state is far more likely than the other. Is a clever measurement always worth it?',
    formal: 'If $\\Gamma = \\eta_2\\rho_2 - \\eta_1\\rho_1$ has no negative eigenvalue, what is the minimum-error strategy?',
    stage: mx(GAMMA_SRC, { spectrum: 'bars' }),
    reveal: {
      text: 'Not always. If one state is likely enough, the best move is to skip the measurement and always guess that state. A measurement helps only when both guesses are live — when $\\Gamma$ has a positive and a negative eigenvalue.',
      formal: 'If $\\Gamma$ has no negative eigenvalue then $E_1 = 0$, $E_2 = I$: always guess $\\rho_2$, no measurement, error $\\eta_{\\min}$ (Bergou p. 97). A measurement lowers the error only when $\\Gamma$ straddles zero.',
      caption: 'if $\\Gamma$ has one sign, always guess the likelier state — no measurement',
      stage: mx({ rho: { ket: { ket: '+' } } }, { spectrum: 'bars' }),
      claims: [claim('q14CompareC0Helstrom', 'at the opposite extreme (orthogonal states) a measurement always succeeds, $1$', () => close(V.q14CompareC0Helstrom, 1, 1e-9))],
    },
  },
]

/* ---------------------------------------------------------------------------------------------- */
/* q14-compare — The price of certainty                                                             */
/* ---------------------------------------------------------------------------------------------- */

const compare: Beat[] = [
  {
    id: 'q14-compare:b1',
    phase: 'books',
    text: 'Two ways to tell $|\\psi_1\\rangle$ from $|\\psi_2\\rangle$. Unambiguous: never wrong, but often unsure. Minimum-error: always answers, but sometimes wrong. They are two faces of one limit — you cannot have both at once.',
    formal:
      'The two strategies are complementary (§5.5). Unambiguous discrimination (Unit 14.4) never errs but has an inconclusive rate; minimum-error (Unit 14.5) is always conclusive but has an error rate. Neither tells non-orthogonal states apart perfectly — the overlap $|\\langle\\psi_1|\\psi_2\\rangle|$ prices both.',
    caption: 'unambiguous: never wrong, often unsure; minimum-error: always answers, sometimes wrong',
    captionFormal: 'complementary strategies; the overlap $|\\langle\\psi_1|\\psi_2\\rangle|$ prices both',
    stage: ball(D0, { compare: DPLUS }),
    terms: {},
  },
  {
    id: 'q14-compare:b2',
    phase: 'books',
    text: 'Compare the two outright. Minimum-error always succeeds more often — it spends its mistakes to answer every time. The two numbers meet only at the ends: both perfect when the states are perpendicular, both useless when they coincide.',
    formal:
      'At equal priors: minimum-error success $\\tfrac12(1 + \\sqrt{1 - c^2})$, unambiguous success $1 - c$, for overlap $c = |\\langle\\psi_1|\\psi_2\\rangle|$. The first dominates throughout $(0, 1)$; they coincide at $c = 0$ (both $1$), and at $c = 1$ the min-error curve ends at $\\tfrac12$, the unambiguous at $0$.',
    caption: 'for $|0\\rangle, |+\\rangle$: min-error $0.854$ beats unambiguous $0.293$; both reach $1$ at orthogonal',
    captionFormal: 'min-error $\\tfrac12(1 + \\sqrt{1 - c^2})$ vs unambiguous $1 - c$; equal at $c = 0$',
    stage: split(mx(GAMMA_SRC, { spectrum: 'bars' }), mx(out({ ket: '1' }))),
    claims: [
      claim('q14HelstromSucc', 'minimum-error succeeds $0.854$ of the time', () => close(V.q14HelstromSucc, 0.5 * (1 + Math.SQRT1_2), 1e-9)),
      claim('q14UsdSucc', 'unambiguous discrimination only $0.293$', () => close(V.q14UsdSucc, 1 - Math.SQRT1_2, 1e-9)),
      claim('q14CompareC0Helstrom', 'both reach $1$ at orthogonal states', () => close(V.q14CompareC0Helstrom, 1, 1e-9)),
    ],
    fidelity: ['qc-matrix-trace-engine'],
    derivation: {
      result: '1 - c \\le \\tfrac12(1 + \\sqrt{1 - c^2}),\\ P_E \\le \\tfrac12 Q_{\\mathrm{opt}}',
      ground: [
        { tex: 'P_{\\mathrm{succ}}^{\\text{min-err}} = \\tfrac12(1 + \\sqrt{1 - c^2}),\\ P_{\\mathrm{succ}}^{\\text{usd}} = 1 - c', why: 'The two success chances, for the overlap $c$ at hand.', view: mx(GAMMA_SRC, { spectrum: 'bars' }), viewCaption: 'min-error\u2019s own spectrum, this pair\u2019s $c$' },
        { tex: 'c = 0.707:\\ 0.854 \\text{ vs } 0.293', why: 'Minimum-error answers far more often for $|0\\rangle, |+\\rangle$.', view: ball(D0, { compare: DPLUS }), viewCaption: 'the overlap $c = 0.707$' },
        { tex: 'P_E = 0.146 \\le \\tfrac12(0.707) = 0.354', why: 'The error is at most half the inconclusive rate.', view: mx(out({ ket: '1' })), viewCaption: 'the USD detector $E_1$' },
        { tex: '1 - c \\le \\tfrac12(1 + \\sqrt{1 - c^2}),\\quad P_E \\le \\tfrac12 Q_{\\mathrm{opt}}', why: 'The exact price of certainty.' },
      ],
      formal: [
        { tex: '\\tfrac12(1 + \\sqrt{1 - c^2}) \\ge 1 - c \\text{ on } [0, 1)', why: 'Min-error dominates USD, with equality only at $c = 0$.', view: mx(GAMMA_SRC, { spectrum: 'bars' }) },
        { tex: 'P_E \\le \\tfrac12 Q_{\\mathrm{opt}}', why: 'The minimum error is at most half the optimal inconclusive rate (Eq. 5.61).', view: ball(D0, { compare: DPLUS }) },
      ],
    },
  },
  {
    id: 'q14-compare:b3',
    phase: 'books',
    text: 'The exact rule: the fewest mistakes you can make is at most half the fraction you fail to answer. Pay with answered trials — $0.707$ unsure — and you never err; pay with errors — $0.146$ — and you answer every time.',
    formal:
      'The two optima satisfy $P_E \\le \\tfrac12 Q_{\\mathrm{opt}}$ (Eq. 5.61): the minimum error is at most half the minimum inconclusive rate. For $|0\\rangle, |+\\rangle$: $P_E = 0.146 \\le \\tfrac12(0.707) = 0.354$. Certainty costs answered trials; answers cost accuracy.',
    caption: '$P_E \\le \\tfrac12 Q$: never-wrong costs answers; always-answer costs accuracy',
    captionFormal: 'P_E \\le \\tfrac12 Q_{\\mathrm{opt}}; 0.146 \\le 0.354 \\text{ for } |0\\rangle, |+\\rangle',
    stage: split(ball(D0, { compare: DPLUS, measure: HELSTROM_AXIS }), mx(GAMMA_SRC, { spectrum: 'bars' })),
    claims: [
      claim('q14HelstromErr', 'the minimum error here is $0.146$', () => close(V.q14HelstromErr, 0.5 * (1 - Math.SQRT1_2), 1e-9)),
      claim('q14UsdInconcl', 'at most half the inconclusive rate, $0.707$', () => close(V.q14UsdInconcl, Math.SQRT1_2, 1e-9)),
    ],
  },
  {
    id: 'q14-compare:b4',
    phase: 'clue',
    text: 'Quantum key distribution asks an eavesdropper to tell apart non-orthogonal states. Which strategy would she pick?',
    formal: 'In the B92 protocol an eavesdropper must distinguish $|0\\rangle$ and $|+\\rangle$. Does unambiguous or minimum-error discrimination bound her best attack?',
    stage: ball(D0, { compare: DPLUS }),
    reveal: {
      text: "Both describe attacks. An unambiguous eavesdropper learns for sure but only sometimes; a minimum-error one always guesses but adds errors the receiver can catch. The $0.293$ and $0.146$ here are the exact numbers the next part's analysis uses.",
      formal:
        "Both: the B92 security argument (Bergou §6.3, next part) weighs an unambiguous Eve against a minimum-error Eve using exactly these bounds for $|0\\rangle, |+\\rangle$. The overlap $1/\\sqrt2$ fixes her success and the error she imposes — this chapter's numbers return as a key rate.",
      caption: "both bound an eavesdropper; the next part's B92 protocol uses these exact numbers",
      stage: mx(GAMMA_SRC, { spectrum: 'bars' }),
      claims: [
        claim('q14UsdSucc', 'an unambiguous Eve succeeds $0.293$ of the time', () => close(V.q14UsdSucc, 1 - Math.SQRT1_2, 1e-9)),
        claim('q14HelstromErr', 'a minimum-error Eve errs $0.146$ of the time', () => close(V.q14HelstromErr, 0.5 * (1 - Math.SQRT1_2), 1e-9)),
      ],
    },
  },
]

export const Q14_STORY: Record<string, Beat[]> = {
  'q14-pointer': pointer,
  'q14-povm': povm,
  'q14-neumark': neumark,
  'q14-usd': usd,
  'q14-min-error': minError,
  'q14-compare': compare,
}

/** Every claim used anywhere in a unit's beats, for Unit.claims (content.test.tsx "claims hold"). */
function allClaims(beats: Beat[]) {
  return beats.flatMap((b) => [...(b.claims ?? []), ...(b.reveal?.claims ?? []), ...(b.derivation?.ground.flatMap((s) => s.claims ?? []) ?? []), ...(b.derivation?.formal.flatMap((s) => s.claims ?? []) ?? [])])
}
export const Q14_UNIT_CLAIMS_BY_ID: Record<string, ReturnType<typeof allClaims>> = Object.fromEntries(Object.entries(Q14_STORY).map(([id, beats]) => [id, allClaims(beats)]))
