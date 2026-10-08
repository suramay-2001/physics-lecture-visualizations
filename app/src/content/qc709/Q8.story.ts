/**
 * Chapter Q8 scroll story (Physics 709; roles P + W). Beats per docs/roles/proposals/P-Q8-story.md §1, in both
 * tracks, with the rulings of docs/roles/decisions/qc709-Q8Q9.md: the box reads qubit 3 (q2); the Bloch-ball space
 * beat sits in `q8-mixed:b3` (the first one-qubit mixture, not `q8-ball`); the Hamiltonian is written Ĥ throughout
 * (H is the Hadamard gate elsewhere in 709); no Bergou ⚑ problems as challenges; no swept-chord field.
 *
 * Standing rules kept here:
 * - Every derivation list (both tracks) carries `view`/`viewCaption` on at least two distinct `StageState`s drawn
 *   from kinds already shown elsewhere in the SAME unit (W-709 #7/#11; docs/patterns/derivation.md).
 * - Every new space or notation has exactly one notation beat (`Beat.introduces`), at or before its glossary
 *   entry's `first` use, with a caption in both tracks (W-709 #8/#12).
 * - No TeX command outside `$…$` in learner-visible text (ruling, qc709-remap.md).
 * - Every number comes from Q8.values.ts (an engine call), never a typed literal.
 */
import type { Circuit } from '../../physics/qc/circuit'
import type {
  AmpSource,
  AmplitudesState,
  BallPoint,
  BallState,
  Beat,
  BlochState,
  CircuitStageState,
  Dir,
  MatrixCoef,
  MatrixGateName,
  MatrixGridState,
  MatrixSource,
  OperatorState,
  Scrub,
  StageLayout,
  StageState,
  TwoQubitState,
} from '../schema'
import { C_GHZM, V, claim, close } from './Q8.values'

/* ---------------------------------------------------------------------------------------------- */
/* Stage shorthand (plan §0 "Stage shorthand"), as plain builder functions                          */
/* ---------------------------------------------------------------------------------------------- */
const amp = (state: AmpSource, extra: Partial<Omit<AmplitudesState, 'kind' | 'state'>> = {}): AmplitudesState => ({ kind: 'amplitudes', state, shot: 'A-BARS', ...extra })
const circ = (circuit: Circuit, upTo?: Scrub, extra: Partial<Omit<CircuitStageState, 'kind' | 'circuit' | 'upTo'>> = {}): CircuitStageState => ({
  kind: 'circuit',
  circuit,
  shot: 'Q-WIRES',
  ...(upTo !== undefined ? { upTo } : {}),
  ...extra,
})
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
  labels: 'q1-q2',
  arrows: 'reduced',
  grid: 'T',
  shot: 'TQ-PAIR',
  ...extra,
})
const tqR = (rho: RhoSrc, extra: Partial<Omit<TwoQubitState, 'kind' | 'source' | 'labels' | 'arrows' | 'grid'>> = {}): TwoQubitState => ({
  kind: 'two-qubit',
  source: { rho },
  labels: 'q1-q2',
  arrows: 'reduced',
  grid: 'T',
  shot: 'TQ-PAIR',
  ...extra,
})
const ball = (point: BallPoint, extra: Partial<Omit<BallState, 'kind' | 'point'>> = {}): BallState => ({ kind: 'bloch-ball', point, purity: true, shot: 'B-STD', ...extra })
const bl = (state: Dir, extra: Partial<Omit<BlochState, 'kind' | 'state'>> = {}): BlochState => ({ kind: 'bloch', state, shot: 'B-STD', ...extra })
const ops = (a0: Scrub, a: [Scrub, Scrub, Scrub], extra: Partial<Omit<OperatorState, 'kind' | 'op'>> = {}): OperatorState => ({ kind: 'operator-space', op: { a0, a }, eigen: true, shot: 'O-STD', ...extra })
const split = (top: StageState, bottom: StageState): StageLayout => ({ layout: 'split', top, bottom })

const out = (k: AmpSource): MatrixSource => ({ outer: [k] })
const mixSrc = (...parts: [Scrub, AmpSource][]): RhoSrc => ({ mixture: parts.map(([w, ket]) => ({ w, ket })) })
const pa = (letters: string): MatrixSource => (letters.length === 1 ? { pauli: letters } : { kron: [...letters].map((ch) => ({ pauli: ch })) as [MatrixSource, MatrixSource] })
const prod = (...srcs: MatrixSource[]): MatrixSource => ({ product: srcs })
const lin = (...terms: [MatrixCoef, MatrixSource][]): MatrixSource => ({ lin: terms.map(([c, src]) => ({ c, src })) })
const gateSrc = (name: MatrixGateName): MatrixSource => ({ gate: { name } })

/* Running states (plan §0 "Name / Source / Value") */
const N: AmpSource = { dir: { thetaDeg: 60, phiDeg: 45 } }
const Nt: AmpSource = { dir: { thetaDeg: 60, phiDeg: { from: 45, to: 135 } } }
const bN: BallPoint = { thetaDeg: 60, phiDeg: 45 }
const ZX_MIX: RhoSrc = mixSrc([0.5, { ket: '0' }], [0.5, { ket: '+' }])
const BOX_MIX: RhoSrc = mixSrc([0.5, { ket: '00' }], [0.5, { ket: '11' }])
const bZX: BallPoint = { mix: [{ of: '+z', w: 0.5 }, { of: '+x', w: 0.5 }] }
const TH_MIX: RhoSrc = mixSrc([V.q8ThermPUp, { ket: '0' }], [V.q8ThermPDown, { ket: '1' }])
const bTH: BallPoint = { r: [0, 0, V.q8ThermR] }
const p4Mix = (p: Scrub, q: Scrub): RhoSrc => mixSrc([p, { ket: '1' }], [q, { ket: '+' }])
const measMix = (p0: Scrub, p1: Scrub): RhoSrc => mixSrc([p0, { ket: '0' }], [p1, { ket: '1' }])
const bU: BallPoint = { mix: [{ of: { thetaDeg: 45, phiDeg: 0 }, w: V.q8ZXEigLarge }, { of: { thetaDeg: 135, phiDeg: 180 }, w: V.q8ZXEigSmall }] }
const convMix25 = (): RhoSrc => mixSrc([0.25, { ket: '0' }], [0.75, { ket: '+' }])
/** Ĥ = (ħω/2) Z, in units of ħω (the Hadamard gate keeps the letter H; the Hamiltonian is Ĥ). */
const Hs: MatrixSource = lin(['+1/2', pa('Z')])
const PHI_PLUS_KET: AmpSource = { bell: 'Phi+' }

/* Reusable claims (the handful of amplitude sizes that recur across many beats). */
const cHalf = claim('q8Half', 'a chance, coherence or Bloch component of size one half', () => close(V.q8Half, 0.5))
const cQuarter = claim('q8Quarter', 'a chance or component of one quarter', () => close(V.q8Quarter, 0.25))
const cThreeQuarter = claim('q8ThreeQuarter', 'a chance or component of three quarters', () => close(V.q8ThreeQuarter, 0.75))
const cEighth = claim('q8Eighth', 'a determinant or eigenvalue-product of one eighth', () => close(V.q8Eighth, 0.125))
const cThird = claim('q8Third', 'a trine weight of one third', () => close(V.q8Third, 1 / 3))
const cR2 = claim('q8R2', 'a length of 0.707', () => close(V.q8R2, Math.SQRT1_2))

/* ---------------------------------------------------------------------------------------------- */
/* q8-why — The GHZ box: a coin, not a superposition                                                */
/* ---------------------------------------------------------------------------------------------- */

const why: Beat[] = [
  {
    id: 'q8-why:b1',
    phase: 'lecture',
    text:
      "Take Chapter Q7's GHZ state, $(|000\\rangle + |111\\rangle)/\\sqrt2$. Read [[qubit|qubit]] 3 alone, and shut qubits 1 and 2 in a box. The reading is 0 or 1, each with chance ½. After a 0 the box holds $|00\\rangle$; after a 1 it holds $|11\\rangle$.",
    formal:
      'Measure [[qubit|qubit]] 3 of $|\\mathrm{GHZ}\\rangle = (|000\\rangle + |111\\rangle)/\\sqrt2$ in the 0, 1 basis and keep qubits 1 and 2 (notes p. 34, which reads qubit 1; by symmetry nothing changes). Each outcome has probability ½, and the pair is left in $|00\\rangle$ or $|11\\rangle$ accordingly.',
    caption: 'read qubit 3: 000 or 111, chance ½ each',
    captionFormal: '$P(0) = P(1) = \\tfrac12$; the pair is left in $|00\\rangle$ or $|11\\rangle$',
    stage: split(circ(C_GHZM(2), 4, { outcomes: '0' }), amp({ circuit: C_GHZM(2), upTo: 4, outcomes: '0' })),
    claims: [claim('q8GhzP3', 'reading qubit 3 of GHZ gives 0 with chance $\\tfrac12$', () => close(V.q8GhzP3, 0.5))],
  },
  {
    id: 'q8-why:b2',
    phase: 'lecture',
    text:
      'Now someone hands us the box but not the record. We open it and read both qubits. We find 00 or 11, each half the time, and never 01 or 10. It is as if a fair coin had chosen $|00\\rangle$ or $|11\\rangle$.',
    formal:
      'Without the record, z readings of the pair give 00 or 11 with probability ½ each, never 01 or 10 (notes pp. 34–35). The box behaves like an ensemble prepared by a fair coin: $|00\\rangle$ or $|11\\rangle$, each with probability ½.',
    caption: "the box's table: chances ½ at 00 and 11; the bits always agree",
    captionFormal: 'box: $P(00) = P(11) = \\tfrac12$, $\\langle Z_1Z_2\\rangle = 1$',
    stage: split(tqR(BOX_MIX, { highlight: ['zz'] }), mx({ rho: BOX_MIX })),
    claims: [cHalf],
    fidelity: ['qc-tq-not-two-places'],
  },
  {
    id: 'q8-why:b3',
    phase: 'lecture',
    text:
      "Could the box hold Chapter Q6's $\\Phi^+ = (|00\\rangle + |11\\rangle)/\\sqrt2$ instead (the notes' $\\beta_{00}$)? In z it gives the same outcomes with the same chances. Now read x on both qubits and multiply the two results. $\\Phi^+$ always gives +1. The coin box gives +1 and −1 equally often, so its average is 0.",
    formal:
      'The [[qc-superposition|superposition]] $\\Phi^+$ (notes, N&C: $\\beta_{00}$; Bergou: $\\Psi_+$) has the same z statistics. But $\\langle X_1X_2\\rangle_{\\Phi^+} = +1$, while the coin ensemble gives $\\tfrac12\\langle00|XX|00\\rangle + \\tfrac12\\langle11|XX|11\\rangle = 0$ (notes p. 35). Repeated XX readings tell the two apart.',
    caption: 'x test: $\\Phi^+$ gives +1, the box 0',
    captionFormal: '$\\langle XX\\rangle$: 1 against 0',
    stage: split(tqR(BOX_MIX, { highlight: ['xx'] }), amp(PHI_PLUS_KET, { mode: 'probability' })),
    derivation: {
      result: '\\langle X_1X_2\\rangle_{\\mathrm{box}} = 0 \\ne \\langle X_1X_2\\rangle_{\\Phi^+} = 1',
      ground: [
        { tex: '|\\mathrm{GHZ}\\rangle = \\tfrac1{\\sqrt2}(|000\\rangle + |111\\rangle)', why: "Chapter Q7's state has two bars, at 000 and 111.", view: amp({ circuit: C_GHZM(2), upTo: 3 }), viewCaption: 'GHZ: two bars' },
        {
          tex: '\\text{qubit 3 reads 0} \\Rightarrow |00\\rangle,\\quad \\text{reads 1} \\Rightarrow |11\\rangle',
          why: 'Reading qubit 3 keeps one bar and leaves the pair in a product.',
          view: amp({ circuit: C_GHZM(2), upTo: 4, outcomes: '0' }),
          viewCaption: 'after a 0, only 000 is left',
        },
        { tex: '\\langle00|X_1X_2|00\\rangle = 0,\\quad \\langle11|X_1X_2|11\\rangle = 0', why: "On a product state the x averages multiply, and each qubit's x average is 0." },
        { tex: '\\langle X_1X_2\\rangle_{\\mathrm{box}} = \\tfrac12\\cdot0 + \\tfrac12\\cdot0 = 0', why: 'The box averages the two cases with chance ½ each.', view: tqR(BOX_MIX, { highlight: ['xx'] }), viewCaption: 'the box: $xx$ cell 0' },
        { tex: '\\langle X_1X_2\\rangle_{\\Phi^+} = 1', why: 'Φ+ is one state, and X on both qubits maps it to itself (Unit 6.6).', view: tq(PHI_PLUS_KET, { highlight: ['xx'] }), viewCaption: '$\\Phi^+$: $xx$ cell +1' },
        { tex: '\\langle X_1X_2\\rangle_{\\mathrm{box}} = 0 \\ne \\langle X_1X_2\\rangle_{\\Phi^+} = 1', why: 'Same z readings, different x readings: the box is not $\\Phi^+$.' },
      ],
      formal: [
        { tex: '\\langle XX\\rangle_{\\mathrm{box}} = \\tfrac12\\langle00|XX|00\\rangle + \\tfrac12\\langle11|XX|11\\rangle = 0', why: 'The ensemble average (notes p. 35).', view: tqR(BOX_MIX, { highlight: ['xx'] }) },
        { tex: '\\langle X_1X_2\\rangle_{\\mathrm{box}} = 0 \\ne \\langle X_1X_2\\rangle_{\\Phi^+} = 1', why: '$XX\\Phi^+ = \\Phi^+$, a stabilizer (Unit 6.6).', view: tq(PHI_PLUS_KET, { highlight: ['xx'] }) },
      ],
    },
    claims: [claim('q8BoxXX', "the coin box's $\\langle X_1X_2\\rangle$ is 0", () => close(V.q8BoxXX, 0)), claim('q8PhiXX', '$\\Phi^+$ has $\\langle X_1X_2\\rangle = 1$', () => close(V.q8PhiXX, 1))],
    fidelity: ['qc-tq-grid-signed'],
  },
  {
    id: 'q8-why:b4',
    phase: 'lecture',
    text:
      "$\\Phi^+$ is ruled out, and Unit 8.4 shows that no single state of the pair can describe the box. It is a [[qc-mixture|mixture]], the word from Chapter Q1: states with chances. Both members, $|00\\rangle$ and $|11\\rangle$, are products, so the box holds no entanglement. Losing one qubit destroyed the three-way GHZ link.",
    formal:
      "Φ⁺ fails the x test, and no ket passes every test: the box has purity $\\tfrac12$ (Unit 8.4), while every ket has purity 1, so the pair is in no [[qc-pure-state|pure state]]; it is a [[qc-mixture|mixture]] (notes p. 35). A mixture of the products $|00\\rangle$ and $|11\\rangle$ carries no entanglement: GHZ entanglement does not survive the loss of one qubit, unlike the W state's. Chapter Q9 obtains this box from GHZ without reading qubit 3 at all (HW2 P7(e)).",
    caption: 'the box: no arrows, one grid cell',
    captionFormal: 'box: $r_1 = r_2 = 0$, only $T_{zz} = 1$',
    stage: tqR(BOX_MIX),
    claims: [claim('q8BoxArrowsZero', "the box's two reduced arrows have length 0", () => close(V.q8BoxArrowsZero, 0, 1e-9)), claim('q8BoxPur', 'the box has purity $\\tfrac12$', () => close(V.q8BoxPur, 0.5))],
    fidelity: ['qc-tq-local-arrows'],
  },
  {
    id: 'q8-why:b5',
    phase: 'clue',
    text: 'Read y on both qubits and multiply. What is the average for $\\Phi^+$, and what is it for the box?',
    formal: 'Compute $\\langle Y_1Y_2\\rangle$ for $\\Phi^+$ and for the coin ensemble.',
    stage: amp(PHI_PLUS_KET, { mode: 'probability' }),
    reveal: {
      text: 'For $\\Phi^+$ it is −1: the two y readings always disagree. For the box it is 0, as for x. Only the [[qc-superposition|superposition]] links the qubits along x and y.',
      formal: '$\\langle YY\\rangle_{\\Phi^+} = -1$ and $\\langle YY\\rangle_{\\mathrm{box}} = 0$: $\\Phi^+$’s grid is $\\mathrm{diag}(1, -1, 1)$, the box’s $\\mathrm{diag}(0, 0, 1)$.',
      caption: '$yy$: −1 against 0',
      captionFormal: '$yy$: −1 against 0',
      stage: tq(PHI_PLUS_KET, { highlight: ['xx', 'yy'] }),
      claims: [
        claim('q8PhiYY', '$\\Phi^+$ has $\\langle Y_1Y_2\\rangle = -1$', () => close(V.q8PhiYY, -1)),
        claim('q8BoxYY', "the box's $\\langle Y_1Y_2\\rangle$ is 0", () => close(V.q8BoxYY, 0)),
      ],
    },
  },
]

/* ---------------------------------------------------------------------------------------------- */
/* q8-pure-rho — One state as a matrix                                                              */
/* ---------------------------------------------------------------------------------------------- */

const pureRho: Beat[] = [
  {
    id: 'q8-pure-rho:b1',
    phase: 'lecture',
    introduces: ['qc-density-matrix'],
    text:
      'Here is a new way to write a state. Take the ket $|\\psi\\rangle$ and its bra $\\langle\\psi|$, and form $\\rho = |\\psi\\rangle\\langle\\psi|$, the [[qc-density-matrix|density matrix]]. It is Chapter Q3’s projector onto $|\\psi\\rangle$. For one qubit it is a 2 × 2 table. Our example is Unit 3.2’s state, with $\\theta$ = 60° and $\\varphi$ = 45°.',
    formal:
      'For a pure state the [[qc-density-matrix|density operator]] is the projector $\\rho = |\\psi\\rangle\\langle\\psi|$ (notes p. 35), and $\\rho^2 = |\\psi\\rangle\\langle\\psi|\\psi\\rangle\\langle\\psi| = \\rho$. The running example is Unit 3.2’s $|\\psi\\rangle = \\cos30^\\circ|0\\rangle + e^{i45^\\circ}\\sin30^\\circ|1\\rangle$.',
    caption: '$\\rho = |\\psi\\rangle\\langle\\psi|$: a 2 × 2 table',
    captionFormal: '$\\rho = |\\psi\\rangle\\langle\\psi|$ at $\\theta$ = 60°, $\\varphi$ = 45°',
    stage: split(amp(N, { dials: true }), mx(out(N))),
    claims: [claim('q8RhoNSqGap', 'the running example squares to itself, $\\rho^2 = \\rho$', () => close(V.q8RhoNSqGap, 0))],
  },
  {
    id: 'q8-pure-rho:b2',
    phase: 'lecture',
    text:
      'Write $|\\psi\\rangle = c_0|0\\rangle + c_1|1\\rangle$. The entry in row i and column j is $\\rho_{ij} = c_ic_j^*$, where the star is Chapter F1’s mirror. On the diagonal this is $|c_0|^2$ and $|c_1|^2$: the chances of reading 0 and 1.',
    formal: 'In an [[qc-orthonormal-basis|orthonormal basis]], $\\rho_{ij} = \\langle e_i|\\psi\\rangle\\langle\\psi|e_j\\rangle = c_ic_j^*$ (notes p. 35). The diagonal $\\rho_{ii} = |c_i|^2$ holds the Born probabilities of the basis states, here 0.75 and 0.25.',
    caption: 'diagonal: chances 0.75 and 0.25',
    captionFormal: '$\\rho_{ii} = |c_i|^2$',
    stage: split(amp(N, { mode: 'probability' }), mx(out(N), { highlight: [[0, 0], [1, 1]] })),
    derivation: {
      result: '\\rho_{ij} = c_ic_j^*,\\quad \\rho_{ii} = |c_i|^2',
      ground: [
        { tex: '|\\psi\\rangle = c_0|0\\rangle + c_1|1\\rangle', why: 'Two amplitudes, each with a size and a phase.', view: amp(N, { dials: true }), viewCaption: '$c_0$ and $c_1$, size and phase' },
        { tex: '\\langle\\psi| = c_0^*\\langle0| + c_1^*\\langle1|', why: 'The bra uses the mirrors of the amplitudes (Chapter Q1).' },
        { tex: '\\rho = |\\psi\\rangle\\langle\\psi| = \\sum_{i,j}c_ic_j^*|i\\rangle\\langle j|', why: 'Multiply out: one term for each ket–bra pair.', view: mx(out(N), { values: 'none' }), viewCaption: 'four cells, one per pair (i, j)' },
        { tex: '\\rho_{ij} = c_ic_j^*', why: 'The term with $|i\\rangle\\langle j|$ fills row i, column j.', view: mx(out(N)), viewCaption: 'the four entries' },
        { tex: '\\rho_{ii} = c_ic_i^* = |c_i|^2', why: 'On the diagonal an amplitude meets its own mirror: a chance.', view: mx(out(N), { highlight: [[0, 0], [1, 1]] }), viewCaption: 'diagonal: 0.75 and 0.25' },
        { tex: '\\rho_{ij} = c_ic_j^*,\\quad \\rho_{ii} = |c_i|^2', why: 'So $\\rho$ stores the chances, and off the diagonal the phases.' },
      ],
      formal: [
        { tex: '\\rho_{ij} = \\langle e_i|\\psi\\rangle\\langle\\psi|e_j\\rangle = c_ic_j^*', why: 'Components in an orthonormal basis (notes p. 35).', view: mx(out(N)) },
        { tex: '\\rho_{ij} = c_ic_j^*,\\quad \\rho_{ii} = |c_i|^2', why: 'The diagonal is the [[qc-born-rule|Born rule]].', view: amp(N, { mode: 'probability' }), viewCaption: '$|c_i|^2$: 0.75, 0.25' },
      ],
    },
    claims: [claim('q8RhoN00', 'the running example’s $\\rho_{00}$ is 0.75', () => close(V.q8RhoN00, 0.75)), claim('q8RhoN11', 'its $\\rho_{11}$ is 0.25', () => close(V.q8RhoN11, 0.25))],
  },
  {
    id: 'q8-pure-rho:b3',
    phase: 'lecture',
    introduces: ['qc-trace'],
    text:
      'Add up the diagonal of a square matrix and you get its [[qc-trace|trace]], written $\\mathrm{Tr}$. The diagonal of $\\rho$ holds the chances, so $\\mathrm{Tr}\\,\\rho = 1$. A [[qc-pure-state|pure]] $\\rho$ also squares to itself: $\\rho^2 = \\rho$.',
    formal:
      'The [[qc-trace|trace]] $\\mathrm{Tr}\\,A = \\sum_i\\langle e_i|A|e_i\\rangle$ sums the diagonal and is the same in every orthonormal basis. For a pure state $\\mathrm{Tr}\\,\\rho = \\sum_i\\langle e_i|\\psi\\rangle\\langle\\psi|e_i\\rangle = \\langle\\psi|\\psi\\rangle = 1$ (notes p. 35). Unit trace holds for every density matrix; $\\rho^2 = \\rho$ only for pure ones (Unit 8.4).',
    caption: '$\\mathrm{Tr}$: 0.75 + 0.25 = 1',
    captionFormal: '$\\mathrm{Tr}\\,\\rho = 1$',
    stage: mx(out(N), { trace: true }),
    derivation: {
      result: '\\mathrm{Tr}\\,\\rho = 1,\\quad \\rho^2 = \\rho',
      ground: [
        { tex: '\\mathrm{Tr}\\,\\rho = \\rho_{00} + \\rho_{11}', why: 'The trace adds the diagonal.', view: mx(out(N), { trace: true }), viewCaption: 'Tr: the diagonal sum' },
        { tex: '= |c_0|^2 + |c_1|^2', why: 'The diagonal entries are the chances.', view: amp(N, { mode: 'probability' }), viewCaption: 'the same two chances' },
        { tex: '= 1', why: 'Chances add to 1.' },
        { tex: '\\rho^2 = |\\psi\\rangle\\langle\\psi|\\psi\\rangle\\langle\\psi|', why: 'Square ρ: a bra meets a ket in the middle.', view: mx(prod(out(N), out(N))), viewCaption: '$\\rho\\cdot\\rho$: $\\rho$ again' },
        { tex: '\\langle\\psi|\\psi\\rangle = 1 \\Rightarrow \\rho^2 = \\rho', why: 'The middle is the squared length of the state, 1.' },
        { tex: '\\mathrm{Tr}\\,\\rho = 1,\\quad \\rho^2 = \\rho', why: 'Both come from the state being [[qc-normalized|normalized]].' },
      ],
      formal: [
        { tex: '\\mathrm{Tr}\\,\\rho = \\langle\\psi|\\Big(\\sum_i|e_i\\rangle\\langle e_i|\\Big)|\\psi\\rangle = \\langle\\psi|\\psi\\rangle = 1', why: 'Completeness (notes p. 35).', view: mx(out(N), { trace: true }) },
        { tex: '\\mathrm{Tr}\\,\\rho = 1,\\quad \\rho^2 = \\rho', why: '$\\rho^2 = |\\psi\\rangle\\langle\\psi|\\psi\\rangle\\langle\\psi|$.', view: mx(prod(out(N), out(N))) },
      ],
    },
    claims: [
      claim('q8RhoN00', 'the running example’s $\\rho_{00}$ is 0.75', () => close(V.q8RhoN00, 0.75)),
      claim('q8RhoN11', 'its $\\rho_{11}$ is 0.25', () => close(V.q8RhoN11, 0.25)),
      claim('q8RhoNTr', 'its trace is 1', () => close(V.q8RhoNTr, 1)),
      claim('q8RhoNSqGap', 'it squares to itself', () => close(V.q8RhoNSqGap, 0)),
    ],
    fidelity: ['qc-matrix-trace-engine'],
  },
  {
    id: 'q8-pure-rho:b4',
    phase: 'lecture',
    introduces: ['qc-coherence'],
    text:
      'The two corners, $\\rho_{01}$ and $\\rho_{10}$, are called [[qc-coherence|coherences]]. Their size here is 0.433, and their hue is the [[relative-phase|relative phase]] of $c_0$ and $c_1$. They are mirrors of each other, so $\\rho$ equals its own mirrored transpose. Turn $\\varphi$, and only the corners turn.',
    formal:
      'The off-diagonal entries $\\rho_{ij}$, $i \\ne j$, are the [[qc-coherence|coherences]]: they carry the [[relative-phase|relative phases]], exactly what a classical mixture lacks (notes p. 35). Since $\\rho_{ji} = \\rho_{ij}^*$, $\\rho$ is Hermitian, $(|\\psi\\rangle\\langle\\psi|)^\\dagger = |\\psi\\rangle\\langle\\psi|$. Here $\\rho_{01} = 0.433e^{-i\\varphi}$ with $\\varphi$ = 45°.',
    caption: "turning $\\varphi$ turns the corners; the diagonal stays",
    captionFormal: '$\\rho_{01} = c_0c_1^* = 0.433e^{-i\\varphi}$',
    stage: mx(out({ dir: { thetaDeg: 60, phiDeg: { from: 45, to: 225 } } }), { highlight: [[0, 1], [1, 0]] }),
    claims: [claim('q8RhoN01Abs', 'the running example’s coherence has size 0.433', () => close(V.q8RhoN01Abs, 0.4330127018922193))],
    fidelity: ['qc-matrix-hue-is-phase'],
  },
  {
    id: 'q8-pure-rho:b5',
    phase: 'clue',
    text: 'Multiply $|\\psi\\rangle$ by an overall phase $e^{i\\gamma}$. Which entries of $\\rho$ change?',
    formal: 'How does $\\rho$ change under $|\\psi\\rangle \\to e^{i\\gamma}|\\psi\\rangle$?',
    stage: amp(N, { dials: true, globalPhaseDeg: { from: 0, to: 180 } }),
    reveal: {
      text: 'None. Each entry is $c_i$ times the mirror of $c_j$, so the two phase factors cancel. $\\rho$ keeps only what readings can see: the two angles of Unit 3.2.',
      formal: '$\\rho \\to e^{i\\gamma}|\\psi\\rangle\\langle\\psi|e^{-i\\gamma} = \\rho$. The [[global-phase|global phase]] drops out, so $\\rho$ is the physical state itself: two real parameters for a pure qubit.',
      caption: 'the same $\\rho$ for every $\\gamma$',
      captionFormal: 'the same $\\rho$ for every $\\gamma$',
      stage: mx(out(N)),
      claims: [claim('q8PhaseGap', 'a global phase leaves $\\rho$ unchanged', () => close(V.q8PhaseGap, 0))],
    },
  },
]

/* ---------------------------------------------------------------------------------------------- */
/* q8-trace-rule — Averages and motion from the density matrix                                      */
/* ---------------------------------------------------------------------------------------------- */

const traceRule: Beat[] = [
  {
    id: 'q8-trace-rule:b1',
    phase: 'lecture',
    text:
      "Once we have $\\rho$, an average needs no ket. Multiply the operator's matrix by $\\rho$ and add up the diagonal: $\\langle A\\rangle = \\mathrm{Tr}(A\\rho)$. For $A = X$ this gives 0.612. That is the x part of the arrow of Unit 3.2.",
    formal:
      '$\\langle\\psi|A|\\psi\\rangle = \\sum_{i,j}c_i^*A_{ij}c_j = \\sum_{i,j}A_{ij}\\rho_{ji} = \\mathrm{Tr}(A\\rho) = \\mathrm{Tr}(\\rho A)$ (notes p. 36; Bergou Eq. 2.11). For $A = \\sigma_x$ this is 0.612, the x component of the Bloch vector. The form survives where no ket exists, which is why $\\rho$ is useful.',
    caption: '$\\mathrm{Tr}(X\\rho) = 0.612$',
    captionFormal: '$\\mathrm{Tr}(\\sigma_x\\rho) = \\langle\\psi|\\sigma_x|\\psi\\rangle = 0.612$',
    stage: mx(prod(pa('X'), out(N)), { trace: true }),
    derivation: {
      result: '\\langle A\\rangle = \\mathrm{Tr}(A\\rho)',
      ground: [
        { tex: '\\langle A\\rangle = \\langle\\psi|A|\\psi\\rangle = \\sum_{i,j}c_i^*A_{ij}c_j', why: "Unit 3.4's average, written with the amplitudes.", view: mx(pa('X')), viewCaption: 'A = X' },
        { tex: 'c_jc_i^* = \\rho_{ji}', why: "Each amplitude times a mirrored one is an entry of $\\rho$.", view: mx(out(N)), viewCaption: '$\\rho$' },
        { tex: '\\sum_{i,j}A_{ij}\\rho_{ji} = \\sum_i(A\\rho)_{ii}', why: 'The sum over j is a matrix product; the sum over i runs down the diagonal.', view: mx(prod(pa('X'), out(N)), { trace: true }), viewCaption: 'X$\\rho$ and its trace' },
        { tex: '\\langle A\\rangle = \\mathrm{Tr}(A\\rho)', why: 'So an average is a trace.' },
        { tex: '\\mathrm{Tr}(X\\rho) = 0.612', why: 'For our state it is the x part of the arrow.', view: bl(bN), viewCaption: 'the arrow: x part 0.612' },
        { tex: '\\langle A\\rangle = \\mathrm{Tr}(A\\rho)', why: 'The rule needs only $\\rho$, no ket.' },
      ],
      formal: [
        { tex: '\\langle\\psi|A|\\psi\\rangle = \\sum_{i,j}A_{ij}\\rho_{ji}', why: '$\\rho_{ji} = c_jc_i^*$.', view: mx(out(N)) },
        { tex: '\\langle A\\rangle = \\mathrm{Tr}(A\\rho)', why: '$= \\mathrm{Tr}(\\rho A)$ by cyclicity; 0.612 for $\\sigma_x$.', view: mx(prod(pa('X'), out(N)), { trace: true }) },
      ],
    },
    claims: [claim('q8TrXN', "Tr(Xρ) for the running example is 0.612", () => close(V.q8TrXN, 0.6123724356957945))],
    fidelity: ['qc-matrix-trace-engine'],
  },
  {
    id: 'q8-trace-rule:b2',
    phase: 'lecture',
    introduces: ['qc-von-neumann-equation'],
    text:
      'A state moves in time by the Schrödinger equation, $i\\hbar\\tfrac{d}{dt}|\\psi\\rangle = \\hat H|\\psi\\rangle$. Here $\\hat H$ is the energy operator, not the H gate. A dot means a rate of change in time. Applied to both halves of $\\rho = |\\psi\\rangle\\langle\\psi|$, the rule becomes the [[qc-von-neumann-equation|von Neumann equation]] $i\\hbar\\dot\\rho = [\\hat H, \\rho]$.',
    formal:
      'With $i\\hbar|\\dot\\psi\\rangle = \\hat H|\\psi\\rangle$ and $-i\\hbar\\langle\\dot\\psi| = \\langle\\psi|\\hat H$, differentiating $\\rho = |\\psi\\rangle\\langle\\psi|$ gives the [[qc-von-neumann-equation|von Neumann equation]] $i\\hbar\\dot\\rho = [\\hat H, \\rho]$ (notes p. 36). Its sign is opposite to Heisenberg’s $i\\hbar\\dot A = [A, \\hat H]$, because $\\rho$ is the state, not an observable. We write $\\hat H$ for the Hamiltonian, since H is the Hadamard gate.',
    caption: '$[\\hat H, \\rho]$ for $\\hat H = \\tfrac{\\hbar\\omega}2Z$: zero on the diagonal',
    captionFormal: '$[\\hat H, \\rho] = \\hbar\\omega\\begin{pmatrix}0 & \\rho_{01}\\\\ -\\rho_{10} & 0\\end{pmatrix}$',
    stage: mx(lin(['+1', prod(Hs, out(N))], ['-1', prod(out(N), Hs)])),
    derivation: {
      result: 'i\\hbar\\dot\\rho = [\\hat H, \\rho]',
      ground: [
        { tex: 'i\\hbar\\tfrac{d}{dt}|\\psi\\rangle = \\hat H|\\psi\\rangle', why: 'The Schrödinger equation moves the ket.', view: bl(bN), viewCaption: "the state's arrow" },
        { tex: '-i\\hbar\\tfrac{d}{dt}\\langle\\psi| = \\langle\\psi|\\hat H', why: 'Mirror both sides: the bra moves too, with i mirrored.' },
        { tex: '\\dot\\rho = |\\dot\\psi\\rangle\\langle\\psi| + |\\psi\\rangle\\langle\\dot\\psi|', why: '$\\rho$ is a product, so its rate of change has two terms.', view: mx(out(N)), viewCaption: '$\\rho$: both halves move' },
        { tex: 'i\\hbar\\dot\\rho = \\hat H|\\psi\\rangle\\langle\\psi| - |\\psi\\rangle\\langle\\psi|\\hat H', why: 'Put in the two rates.' },
        { tex: 'i\\hbar\\dot\\rho = \\hat H\\rho - \\rho\\hat H = [\\hat H, \\rho]', why: 'That is a commutator, from Chapter Q3.', view: mx(lin(['+1', prod(Hs, out(N))], ['-1', prod(out(N), Hs)])), viewCaption: '$[\\hat H, \\rho]$: zero diagonal' },
        { tex: 'i\\hbar\\dot\\rho = [\\hat H, \\rho]', why: 'For $\\hat H = \\tfrac{\\hbar\\omega}2Z$ the arrow circles the z axis.', view: bl(bN, { rotate: { axis: 'z', angleDeg: { from: 0, to: 90 } }, trail: true }), viewCaption: 'a quarter turn about z' },
      ],
      formal: [
        { tex: 'i\\hbar\\dot\\rho = i\\hbar(|\\dot\\psi\\rangle\\langle\\psi| + |\\psi\\rangle\\langle\\dot\\psi|)', why: 'Differentiate $\\rho = |\\psi\\rangle\\langle\\psi|$.', view: mx(out(N)) },
        { tex: '= \\hat H\\rho - \\rho\\hat H', why: '$i\\hbar|\\dot\\psi\\rangle = \\hat H|\\psi\\rangle$ and its adjoint.', view: mx(lin(['+1', prod(Hs, out(N))], ['-1', prod(out(N), Hs)])) },
        { tex: 'i\\hbar\\dot\\rho = [\\hat H, \\rho]', why: "Linear in $\\rho$, so it holds for every mixture; the sign is opposite to Heisenberg's.", view: bl(bN, { rotate: { axis: 'z', angleDeg: { from: 0, to: 90 } }, trail: true }) },
      ],
    },
    claims: [
      claim('q8VNComm01Abs', 'the commutator’s corner has size 0.433', () => close(V.q8VNComm01Abs, 0.4330127018922193)),
      claim('q8VNCheck', '$[\\hat H,\\rho]_{01}$ equals $\\rho_{01}$ times $(\\hat H_{00}-\\hat H_{11})$', () => close(V.q8VNCheck, 0, 1e-9)),
    ],
  },
  {
    id: 'q8-trace-rule:b3',
    phase: 'lecture',
    text:
      "Take $\\hat H = \\tfrac{\\hbar\\omega}{2}Z$, a spin in a field along z, as in Chapter Q1's [[qc-precession|precession]]. The diagonal of $\\rho$ never moves: the chances stay 0.75 and 0.25. The corners turn at rate $\\omega$. After a quarter period the corner's hue has gone from −45° to −135°.",
    formal:
      'For $\\hat H = \\tfrac{\\hbar\\omega}2\\sigma_z$ the commutator has zero diagonal and $[\\hat H, \\rho]_{01} = \\hbar\\omega\\rho_{01}$, so $\\rho_{01}(t) = \\rho_{01}(0)e^{-i\\omega t}$ while $\\rho_{00}$, $\\rho_{11}$ stay fixed. On the sphere the arrow [[qc-precession|precesses]] about z: $\\varphi$ goes from 45° to 135° in a quarter period.',
    caption: 'a quarter period: the corner turns, the diagonal stays',
    captionFormal: '$\\rho_{01}(t) = \\rho_{01}(0)e^{-i\\omega t}$',
    stage: split(bl(bN, { rotate: { axis: 'z', angleDeg: { from: 0, to: 90 } }, trail: true }), mx(out(Nt), { highlight: [[0, 1], [1, 0]] })),
    claims: [
      claim('q8RhoN00', 'the running example’s $\\rho_{00}$ is 0.75', () => close(V.q8RhoN00, 0.75)),
      claim('q8RhoN11', 'its $\\rho_{11}$ is 0.25', () => close(V.q8RhoN11, 0.25)),
    ],
    fidelity: ['bloch-rotation-exact', 'qc-matrix-hue-is-phase'],
  },
  {
    id: 'q8-trace-rule:b4',
    phase: 'books',
    text:
      'Readings work with $\\rho$ too. The chance of reading 0 is $\\mathrm{Tr}(P_0\\rho)$, here 0.75. Suppose we read but keep no record. Then $\\rho$ becomes the chance-weighted sum of the two outcomes, and its corners are gone. That is how the GHZ box of Unit 8.1 lost its link.',
    formal:
      'For projectors $P_j$, Bergou’s postulates 4a–6a give $p_j = \\mathrm{Tr}(P_j\\rho)$, the post-state $P_j\\rho P_j/p_j$ and, unrecorded, $\\sum_jP_j\\rho P_j$ (Bergou §5.2 p. 80; they reduce to the pure-state rules when $\\rho = |\\psi\\rangle\\langle\\psi|$). A z reading of our $\\rho$ gives $p_0 = 0.75$; unrecorded, $\\mathrm{diag}(0.75, 0.25)$: the coherences are erased.',
    caption: 'read, no record: the corners vanish',
    captionFormal: '$\\sum_jP_j\\rho P_j = \\mathrm{diag}(0.75, 0.25)$',
    stage: split(amp(N, { mode: 'probability' }), mx({ rho: measMix(V.q8MeasP0, V.q8MeasP1) })),
    claims: [
      claim('q8MeasP0', 'reading 0 on the running example has chance 0.75', () => close(V.q8MeasP0, 0.75)),
      claim('q8NonSelOffDiag', 'an unrecorded reading leaves no coherence', () => close(V.q8NonSelOffDiag, 0, 1e-9)),
      claim('q8NonSel0', 'the unrecorded diagonal is 0.75', () => close(V.q8NonSel0, 0.75)),
      claim('q8NonSel1', 'and 0.25', () => close(V.q8NonSel1, 0.25)),
    ],
  },
  {
    id: 'q8-trace-rule:b5',
    phase: 'clue',
    text: 'Under $\\hat H = \\tfrac{\\hbar\\omega}2Z$, which density matrices never change in time?',
    formal: 'For $\\hat H = \\tfrac{\\hbar\\omega}2\\sigma_z$, which $\\rho$ satisfy $\\dot\\rho = 0$?',
    stage: bl(bN, { rotate: { axis: 'z', angleDeg: { from: 0, to: 360 } } }),
    reveal: {
      text: "Those with no corners: the diagonal ones. Their commutator with $\\hat H$ is zero, so nothing turns. The unrecorded reading of the last beat is one; so is a thermal state (Unit 8.4), also diagonal.",
      formal: 'Exactly those commuting with $\\sigma_z$, the diagonal $\\rho$: $[\\hat H, \\mathrm{diag}(p_0, p_1)] = 0$. States without coherences in the energy basis are stationary; a thermal state (Unit 8.4) is diagonal too, so it is stationary.',
      caption: '$[\\hat H, \\mathrm{diag}(0.75, 0.25)] = 0$',
      captionFormal: '$[\\hat H, \\mathrm{diag}(0.75, 0.25)] = 0$',
      stage: mx({ rho: measMix(V.q8MeasP0, V.q8MeasP1) }),
      claims: [
        claim('q8CommDiagGap', "a diagonal ρ commutes with Ĥ", () => close(V.q8CommDiagGap, 0, 1e-9)),
        claim('q8NonSel0', 'the diagonal is 0.75', () => close(V.q8NonSel0, 0.75)),
        claim('q8NonSel1', 'and 0.25', () => close(V.q8NonSel1, 0.25)),
      ],
    },
  },
]

/* ---------------------------------------------------------------------------------------------- */
/* q8-mixed — Mixtures: chances without phases                                                      */
/* ---------------------------------------------------------------------------------------------- */

const mixed: Beat[] = [
  {
    id: 'q8-mixed:b1',
    phase: 'lecture',
    introduces: ['qc-ensemble'],
    text:
      'Now we can write down the box of Unit 8.1. Picture a collection whose members are in states $|\\psi_n\\rangle$ with chances $p_n$: an [[qc-ensemble|ensemble]]. Its density matrix weights each member’s $\\rho$ by its chance and adds them: $\\rho = \\sum_np_n|\\psi_n\\rangle\\langle\\psi_n|$. For the box, $\\rho = \\tfrac12|00\\rangle\\langle00| + \\tfrac12|11\\rangle\\langle11|$.',
    formal:
      'An [[qc-ensemble|ensemble]] $\\{p_n, |\\psi_n\\rangle\\}$ has $\\rho = \\sum_np_n|\\psi_n\\rangle\\langle\\psi_n|$ (notes p. 36; Bergou Eq. 2.2), where the $|\\psi_n\\rangle$ need not be [[orthogonal|orthogonal]]. Then $\\mathrm{Tr}\\,\\rho = \\sum_np_n = 1$ and $\\langle A\\rangle = \\sum_np_n\\langle\\psi_n|A|\\psi_n\\rangle = \\mathrm{Tr}(\\rho A)$ (Bergou Eq. 2.1). The GHZ box is $\\rho_{12} = \\tfrac12(|00\\rangle\\langle00| + |11\\rangle\\langle11|)$, with no coherence between 00 and 11.',
    caption: 'the box: ½ twice on the diagonal, empty corners',
    captionFormal: '$\\rho_{12}$: coherence 0, where $\\Phi^+$ has 0.5',
    stage: split(mx({ rho: BOX_MIX }, { highlight: [[0, 3], [3, 0]] }), tqR(BOX_MIX)),
    claims: [cHalf, claim('q8BoxCoh', "the box's coherence is 0", () => close(V.q8BoxCoh, 0)), claim('q8PhiCoh', '$\\Phi^+$’s coherence is 0.5', () => close(V.q8PhiCoh, 0.5))],
  },
  {
    id: 'q8-mixed:b2',
    phase: 'lecture',
    introduces: ['qc-purity'],
    text:
      'How mixed is a state? Square $\\rho$ and take the trace. For a pure state $\\rho^2 = \\rho$, so $\\mathrm{Tr}\\,\\rho^2 = 1$. For the box it is 0.5, less than 1, so the box is [[qc-mixed-state|mixed]]. This number is the [[qc-purity|purity]].',
    formal:
      'The [[qc-purity|purity]] $\\mathrm{Tr}\\,\\rho^2$ is 1 exactly for pure states and below 1 for [[qc-mixed-state|mixed]] ones (notes pp. 35–36). Bergou p. 18 proves both directions from the eigenvalues $0 \\le \\lambda_j \\le 1$ of $\\rho$. The box has $\\mathrm{Tr}\\,\\rho_{12}^2 = 0.5$; $\\Phi^+$ has 1.',
    caption: 'purity: box 0.5, $\\Phi^+$ 1',
    captionFormal: '$\\mathrm{Tr}\\,\\rho^2$: 0.5 against 1',
    stage: mx(prod({ rho: BOX_MIX }, { rho: BOX_MIX }), { trace: true }),
    claims: [claim('q8BoxPur', 'the box has purity 0.5', () => close(V.q8BoxPur, 0.5)), claim('q8PhiPur', '$\\Phi^+$ has purity 1', () => close(V.q8PhiPur, 1))],
  },
  {
    id: 'q8-mixed:b3',
    phase: 'lecture',
    introduces: ['qc-bloch-ball'],
    text:
      'Back to one qubit. Mix $|0\\rangle$ and $|+\\rangle$, half and half. Each member has its arrow on the sphere of Unit 3.2. The mixture’s arrow $\\mathbf r$ is their chance-weighted average. It ends inside the sphere, at the middle of the chord. Pure states sit on the surface and mixtures inside: the [[qc-bloch-ball|Bloch ball]].',
    formal:
      'For a qubit ensemble, $\\rho$’s Bloch vector is the weighted mean $\\mathbf r = \\sum_np_n\\mathbf r_n$ of the members’ unit vectors, so $|\\mathbf r| \\le 1$: pure states fill the sphere and mixed states its interior, the [[qc-bloch-ball|Bloch ball]] (notes p. 37; Bergou §2.3). Rosetta: the notes and Bergou write $\\mathbf n$ for this vector; we keep $\\mathbf r$. Here $\\mathbf r = (0.5, 0, 0.5)$, of length 0.707.',
    caption: "the mixture's arrow: inside, at the chord's middle",
    captionFormal: '$\\mathbf r = (0.5, 0, 0.5)$, $|\\mathbf r| = 0.707$',
    stage: split(ball(bZX, { recipe: true }), mx({ rho: ZX_MIX })),
    claims: [
      claim('q8ZXRx', 'the mixture’s arrow has x part 0.5', () => close(V.q8ZXRx, 0.5)),
      claim('q8ZXRz', 'and z part 0.5', () => close(V.q8ZXRz, 0.5)),
      claim('q8ZXRLen', 'of length 0.707', () => close(V.q8ZXRLen, Math.SQRT1_2)),
    ],
    fidelity: ['ball-direction-average', 'ball-inside-not-partly-up', 'ball-born-inside'],
  },
  {
    id: 'q8-mixed:b4',
    phase: 'lecture',
    text:
      "Its matrix is half of $|0\\rangle$'s plus half of $|+\\rangle$'s: $\\tfrac34$ and $\\tfrac14$ on the diagonal, $\\tfrac14$ in each corner. Its purity is 0.75. Its spin averages are $\\langle S_z\\rangle = \\langle S_x\\rangle = 0.25\\hbar$, and $\\langle S_y\\rangle = 0$.",
    formal:
      '$\\rho = \\tfrac12|0\\rangle\\langle0| + \\tfrac14(|0\\rangle + |1\\rangle)(\\langle0| + \\langle1|) = \\begin{pmatrix}3/4 & 1/4\\\\ 1/4 & 1/4\\end{pmatrix}$, with $\\mathrm{Tr}\\,\\rho^2 = 0.75$, $\\langle S_z\\rangle = \\langle S_x\\rangle = 0.25\\hbar$ and $\\langle S_y\\rangle = 0$ (notes pp. 36–37).',
    caption: 'purity 0.75; $\\langle S_z\\rangle = \\langle S_x\\rangle = 0.25\\hbar$',
    captionFormal: '$\\mathrm{Tr}\\,\\rho^2 = 0.75$',
    stage: split(ball(bZX, { recipe: true }), mx({ rho: ZX_MIX }, { trace: true })),
    derivation: {
      result: '\\mathrm{Tr}\\,\\rho^2 = \\tfrac34,\\quad \\langle S_z\\rangle = \\langle S_x\\rangle = \\tfrac\\hbar4',
      ground: [
        { tex: '\\rho = \\tfrac12|0\\rangle\\langle0| + \\tfrac12|+\\rangle\\langle+|', why: "Half of each member's matrix.", view: ball(bZX, { recipe: true }), viewCaption: 'two members, two dots' },
        { tex: '|+\\rangle\\langle+| = \\tfrac12\\begin{pmatrix}1 & 1\\\\ 1 & 1\\end{pmatrix}', why: 'Both amplitudes of $|+\\rangle$ are $1/\\sqrt2$, so every entry is ½.' },
        { tex: '\\rho = \\begin{pmatrix}3/4 & 1/4\\\\ 1/4 & 1/4\\end{pmatrix}', why: 'Add half of each.', view: mx({ rho: ZX_MIX }), viewCaption: "the notes' matrix" },
        {
          tex: '\\mathrm{Tr}\\,\\rho^2 = \\tfrac9{16} + \\tfrac1{16} + \\tfrac1{16} + \\tfrac1{16} = \\tfrac34',
          why: 'For a Hermitian matrix, $\\mathrm{Tr}\\,\\rho^2$ adds the squared sizes of all entries.',
          view: mx(prod({ rho: ZX_MIX }, { rho: ZX_MIX }), { trace: true }),
          viewCaption: 'purity 0.75',
          claims: [
            claim('q8ZX00Sq', 'the diagonal entry 0.75 squares to 9/16', () => close(V.q8ZX00Sq, 0.5625)),
            claim('q8ZX01Sq', 'each corner 0.25 squares to 1/16', () => close(V.q8ZX01Sq, 0.0625)),
          ],
        },
        { tex: '\\langle S_z\\rangle = \\tfrac\\hbar2\\big(\\tfrac34 - \\tfrac14\\big) = \\tfrac\\hbar4', why: '$S_z$ reads the diagonal.' },
        { tex: '\\langle S_x\\rangle = \\tfrac\\hbar2\\big(\\tfrac14 + \\tfrac14\\big) = \\tfrac\\hbar4', why: '$S_x$ reads the two corners.', view: ball(bZX), viewCaption: 'the point (0.5, 0, 0.5)' },
        { tex: '\\mathrm{Tr}\\,\\rho^2 = \\tfrac34,\\quad \\langle S_z\\rangle = \\langle S_x\\rangle = \\tfrac\\hbar4', why: 'The purity is below 1: the state is mixed.' },
      ],
      formal: [
        { tex: '\\mathrm{Tr}\\,\\rho^2 = \\sum_{ij}|\\rho_{ij}|^2 = \\tfrac34', why: 'For $\\rho = \\rho^\\dagger$ (notes p. 37).', view: mx({ rho: ZX_MIX }, { trace: true }) },
        { tex: '\\mathrm{Tr}\\,\\rho^2 = \\tfrac34,\\quad \\langle S_z\\rangle = \\langle S_x\\rangle = \\tfrac\\hbar4', why: '$\\langle S_j\\rangle = \\tfrac\\hbar2\\mathrm{Tr}(\\rho\\sigma_j)$.', view: ball(bZX) },
      ],
    },
    claims: [
      claim('q8ZXPur', 'the mixture has purity 0.75', () => close(V.q8ZXPur, 0.75)),
      claim('q8ZXAz', '$\\langle S_z\\rangle$ is 0.25$\\hbar$', () => close(V.q8ZXAz, 0.25)),
      claim('q8ZXAx', '$\\langle S_x\\rangle$ is 0.25$\\hbar$', () => close(V.q8ZXAx, 0.25)),
    ],
  },
  {
    id: 'q8-mixed:b5',
    phase: 'lecture',
    text:
      "Atoms in a field along z make a natural [[qc-thermal-state|thermal]] mixture. Spin up, $|0\\rangle$, has less energy than spin down, by $E_Z$. The thermal energy $k_BT$ sets the odds: $p_\\uparrow/p_\\downarrow = e^{E_Z/k_BT}$. At $E_Z = 2k_BT$ the chances are 0.881 and 0.119, so $\\langle S_z\\rangle = 0.381\\hbar$.",
    formal:
      'In equilibrium $p_\\uparrow/p_\\downarrow = e^{(E_\\downarrow - E_\\uparrow)/k_BT}$, so $\\rho = \\mathrm{diag}(p_\\uparrow, p_\\downarrow)$ is the [[qc-thermal-state|thermal]] state and $\\langle S_z\\rangle = \\tfrac\\hbar2(p_\\uparrow - p_\\downarrow) = \\tfrac\\hbar2\\tanh(E_Z/2k_BT)$, with $E_Z = E_\\downarrow - E_\\uparrow$ (notes p. 36). At $E_Z/k_BT = 2$: $p_\\uparrow = 0.881$, $\\langle S_z\\rangle = 0.381\\hbar$ and $\\mathbf r = (0, 0, 0.762)$.',
    caption: '$E_Z = 2k_BT$: chances 0.881 and 0.119',
    captionFormal: '$\\mathbf r = (0, 0, \\tanh 1) = (0, 0, 0.762)$',
    stage: split(ball(bTH), mx({ rho: TH_MIX })),
    derivation: {
      result: '\\langle S_z\\rangle = \\tfrac\\hbar2\\tanh(E_Z/2k_BT)',
      ground: [
        { tex: '\\rho = \\begin{pmatrix}p_\\uparrow & 0\\\\ 0 & p_\\downarrow\\end{pmatrix}', why: 'Each atom is up or down with its chance, so there are no coherences.', view: mx({ rho: TH_MIX }), viewCaption: 'diagonal only' },
        { tex: 'p_\\uparrow/p_\\downarrow = e^{E_Z/k_BT}', why: 'The lower energy is favoured by this Boltzmann factor.' },
        { tex: 'p_\\uparrow = \\frac{e^{x/2}}{e^{x/2} + e^{-x/2}},\\quad x = E_Z/k_BT', why: 'Scale the two chances so they add to 1.', view: ball('oven'), viewCaption: 'x = 0: equal chances, the centre' },
        { tex: '\\langle S_z\\rangle = \\tfrac\\hbar2(p_\\uparrow - p_\\downarrow)', why: 'Up reads $+\\tfrac\\hbar2$, down reads $-\\tfrac\\hbar2$.' },
        { tex: '= \\tfrac\\hbar2\\cdot\\frac{e^{x/2} - e^{-x/2}}{e^{x/2} + e^{-x/2}} = \\tfrac\\hbar2\\tanh\\tfrac x2', why: 'This ratio has a name: the hyperbolic tangent, tanh.', view: ball(bTH), viewCaption: 'x = 2: $r_z$ = 0.762' },
        { tex: '\\langle S_z\\rangle = \\tfrac\\hbar2\\tanh(E_Z/2k_BT)', why: 'A strong field or a cold oven pushes the point up; heat pulls it to the centre.' },
      ],
      formal: [
        { tex: '\\rho = e^{-\\hat H/k_BT}/\\mathrm{Tr}\\,e^{-\\hat H/k_BT} = \\mathrm{diag}(p_\\uparrow, p_\\downarrow)', why: 'The Gibbs state, with $\\hat H = \\mathrm{diag}(E_\\uparrow, E_\\downarrow)$.', view: mx({ rho: TH_MIX }) },
        { tex: '\\langle S_z\\rangle = \\tfrac\\hbar2\\tanh(E_Z/2k_BT)', why: '$\\mathrm{Tr}(\\rho S_z)$ (notes p. 36); at $E_Z/k_BT = 2$, $r_z = 0.762$.', view: ball(bTH) },
      ],
    },
    claims: [
      claim('q8ThermPUp', 'at $E_Z = 2k_BT$, $p_\\uparrow = 0.881$', () => close(V.q8ThermPUp, (1 + Math.tanh(1)) / 2)),
      claim('q8ThermPDown', '$p_\\downarrow = 0.119$', () => close(V.q8ThermPDown, (1 - Math.tanh(1)) / 2)),
      claim('q8ThermSz', '$\\langle S_z\\rangle = 0.381\\hbar$', () => close(V.q8ThermSz, Math.tanh(1) / 2)),
      claim('q8ThermR', '$r_z = \\tanh1 = 0.762$', () => close(V.q8ThermR, Math.tanh(1))),
    ],
    terms: {},
    refs: [],
    fidelity: [],
  },
  {
    id: 'q8-mixed:b6',
    phase: 'books',
    text:
      'Homework 2, Problem 4 mixes $|1\\rangle$ with chance p and $|+\\rangle$ with chance $1 - p$. The purity works out to $1 - p + p^2$, below 1 unless p is 0 or 1. The averages are $\\langle\\sigma_x\\rangle = 1 - p$, $\\langle\\sigma_y\\rangle = 0$ and $\\langle\\sigma_z\\rangle = -p$. At $p = 0.25$ the purity is 0.8125.',
    formal:
      'HW2 P4: $\\rho = p|1\\rangle\\langle1| + (1 - p)|+\\rangle\\langle+| = \\tfrac12\\begin{pmatrix}1 - p & 1 - p\\\\ 1 - p & 1 + p\\end{pmatrix}$, so $\\mathrm{Tr}\\,\\rho^2 = 1 - p + p^2 < 1$ for $0 < p < 1$ and $\\mathbf r = (1 - p, 0, -p)$. At $p = 0.25$: purity 0.8125 and $\\mathbf r = (0.75, 0, -0.25)$.',
    caption: 'p = 0.25: purity 0.8125',
    captionFormal: '$\\mathbf r = (1 - p, 0, -p)$ at $p = 0.25$',
    stage: split(ball({ mix: [{ of: '-z', w: 0.25 }, { of: '+x', w: 0.75 }] }, { recipe: true }), mx({ rho: p4Mix(0.25, 0.75) })),
    refs: [{ source: 'lecture', where: 'HW2 P4', adds: 'the mixed-state purity and averages of a $|1\\rangle$–$|+\\rangle$ mix.' }],
    derivation: {
      result: '\\mathrm{Tr}\\,\\rho^2 = 1 - p + p^2',
      ground: [
        { tex: '\\rho = p|1\\rangle\\langle1| + (1 - p)|+\\rangle\\langle+|', why: 'Chance p of $|1\\rangle$ and $1 - p$ of $|+\\rangle$.', view: ball({ mix: [{ of: '-z', w: 0.25 }, { of: '+x', w: 0.75 }] }, { recipe: true }), viewCaption: 'p = 0.25' },
        { tex: '\\rho = \\tfrac12\\begin{pmatrix}1 - p & 1 - p\\\\ 1 - p & 1 + p\\end{pmatrix}', why: '$|1\\rangle\\langle1|$ fills the lower corner, and $|+\\rangle\\langle+|$ is ½ everywhere.', view: mx({ rho: p4Mix({ from: 0, to: 1 }, { from: 1, to: 0 }) }), viewCaption: 'p swept from 0 to 1' },
        { tex: '\\mathrm{Tr}\\,\\rho^2 = \\tfrac14\\big(3(1 - p)^2 + (1 + p)^2\\big)', why: 'Add the squared sizes of the four entries.' },
        { tex: '= \\tfrac14(4 - 4p + 4p^2) = 1 - p + p^2', why: 'Expand and collect.' },
        { tex: '1 - p + p^2 = 1 - p(1 - p) < 1\\quad (0 < p < 1)', why: 'Between the ends, $p(1 - p)$ is positive.', view: ball({ mix: [{ of: '-z', w: 0.5 }, { of: '+x', w: 0.5 }] }, { recipe: true }), viewCaption: 'p = 0.5: the least pure, 0.75' },
        { tex: '\\mathrm{Tr}\\,\\rho^2 = 1 - p + p^2', why: 'Pure only at p = 0 and p = 1.' },
      ],
      formal: [
        { tex: '\\rho = \\tfrac12\\begin{pmatrix}1 - p & 1 - p\\\\ 1 - p & 1 + p\\end{pmatrix},\\quad \\mathbf r = (1 - p, 0, -p)', why: 'HW2 P4(a), (c).', view: mx({ rho: p4Mix({ from: 0, to: 1 }, { from: 1, to: 0 }) }) },
        { tex: '\\mathrm{Tr}\\,\\rho^2 = 1 - p + p^2', why: '$\\sum_{ij}|\\rho_{ij}|^2$; below 1 for $0 < p < 1$ (HW2 P4(b)).', view: ball({ mix: [{ of: '-z', w: 0.5 }, { of: '+x', w: 0.5 }] }, { recipe: true }) },
      ],
    },
    claims: [
      cQuarter,
      claim('q8P4Pur', 'at $p = 0.25$ the purity is 0.8125', () => close(V.q8P4Pur, 0.8125)),
      claim('q8P4SigX', '$\\mathbf r$ has x part 0.75', () => close(V.q8P4SigX, 0.75)),
      claim('q8P4SigZ', 'and z part −0.25', () => close(V.q8P4SigZ, -0.25)),
    ],
  },
  {
    id: 'q8-mixed:b7',
    phase: 'clue',
    text: 'What is the smallest purity a qubit can have, and where in the ball does that state sit?',
    formal: 'Minimize $\\mathrm{Tr}\\,\\rho^2$ over one-qubit density matrices. Where is the minimum in the ball?',
    stage: ball(bZX),
    reveal: {
      text: '0.5, at the centre: $\\rho = \\tfrac12I$, the [[qc-maximally-mixed|maximally mixed state]], an oven with no field. Its arrow has length 0, so every reading is a fair coin. Unit 8.5 shows why the purity grows with the arrow’s length.',
      formal: '$\\mathrm{Tr}\\,\\rho^2 = \\tfrac12(1 + |\\mathbf r|^2) \\ge \\tfrac12$ (derived in Unit 8.5), with equality only at $\\mathbf r = 0$, the [[qc-maximally-mixed|maximally mixed]] state $\\tfrac12I$.',
      caption: 'centre: purity 0.5',
      captionFormal: 'centre: purity 0.5',
      stage: ball('oven'),
      claims: [cHalf, claim('q8PurRCentre', 'the maximally mixed state has purity 0.5', () => close(V.q8PurRCentre, 0.5))],
    },
  },
]

/* ---------------------------------------------------------------------------------------------- */
/* q8-ball — The Bloch ball: mixed states inside                                                    */
/* ---------------------------------------------------------------------------------------------- */

const ball8: Beat[] = [
  {
    id: 'q8-ball:b1',
    phase: 'lecture',
    text:
      'Unit 3.3 showed that every 2 × 2 Hermitian matrix is $a_0I + \\mathbf a\\cdot\\boldsymbol\\sigma$, four real numbers. For $\\rho$ the trace must be 1, which fixes $a_0 = \\tfrac12$. The arrow is then half the Bloch vector: $\\rho = \\tfrac12(I + \\mathbf r\\cdot\\boldsymbol\\sigma)$.',
    formal:
      'Since $I, \\sigma_x, \\sigma_y, \\sigma_z$ span the 2 × 2 matrices and $\\rho$ is Hermitian with unit trace, $\\rho = \\tfrac12(I + r_x\\sigma_x + r_y\\sigma_y + r_z\\sigma_z)$ with real $r_j$ (notes Eq. 2.14; Bergou Eq. 2.18). In Unit 3.3’s operator space this is $a_0 = \\tfrac12$ and $\\mathbf a = \\mathbf r/2$.',
    caption: '$\\rho$ as an operator: $a_0 = 0.5$, arrow $(0.25, 0, 0.25)$',
    captionFormal: '$a_0 = \\tfrac12$, $\\mathbf a = \\mathbf r/2$',
    stage: split(ops(V.q8ZXA0, [V.q8ZXAx, V.q8ZXAy, V.q8ZXAz]), ball(bZX)),
    claims: [
      claim('q8ZXA0', 'the mixture has $a_0 = 0.5$', () => close(V.q8ZXA0, 0.5)),
      claim('q8ZXAx', 'and arrow x part 0.25', () => close(V.q8ZXAx, 0.25)),
      claim('q8ZXAz', 'and z part 0.25', () => close(V.q8ZXAz, 0.25)),
    ],
    fidelity: ['op-one-point', 'op-a0-gauge'],
  },
  {
    id: 'q8-ball:b2',
    phase: 'lecture',
    introduces: ['qc-positive-operator'],
    text:
      'Written out, $\\rho = \\tfrac12\\begin{pmatrix}1 + r_z & r_x - ir_y\\\\ r_x + ir_y & 1 - r_z\\end{pmatrix}$. Its two eigenvalues act as chances, so neither may be negative: $\\rho$ is [[qc-positive-operator|positive]], written $\\rho \\ge 0$. Their product, the determinant, is $(1 - |\\mathbf r|^2)/4$. So $|\\mathbf r| \\le 1$, and the arrow never leaves the ball.',
    formal:
      'Hermiticity makes the $r_j$ real (notes Eq. 2.15). A density matrix is [[qc-positive-operator|positive]], $\\langle\\varphi|\\rho|\\varphi\\rangle = \\sum_np_n|\\langle\\varphi|\\psi_n\\rangle|^2 \\ge 0$ (Bergou Eq. 2.13), written $\\rho \\ge 0$; so both eigenvalues are non-negative and $\\det\\rho = (1 - |\\mathbf r|^2)/4 \\ge 0$, that is $|\\mathbf r| \\le 1$. Our mixture has $\\det\\rho = 0.125$.',
    caption: '$\\det\\rho = 0.125 \\ge 0$: inside the ball',
    captionFormal: '$\\det\\rho = (1 - |\\mathbf r|^2)/4$',
    stage: split(ball(bZX), mx({ rho: ZX_MIX })),
    derivation: {
      result: '\\det\\rho = \\tfrac14(1 - |\\mathbf r|^2) \\ge 0 \\Rightarrow |\\mathbf r| \\le 1',
      ground: [
        { tex: '\\rho = a_0I + \\mathbf a\\cdot\\boldsymbol\\sigma', why: 'Unit 3.3: any Hermitian 2 × 2 matrix, four real numbers.', view: ops(V.q8ZXA0, [V.q8ZXAx, V.q8ZXAy, V.q8ZXAz]), viewCaption: '$\\rho$ as an operator' },
        { tex: '\\mathrm{Tr}\\,\\rho = 2a_0 = 1', why: 'The Pauli matrices have trace 0, and I has trace 2.' },
        { tex: '\\rho = \\tfrac12(I + \\mathbf r\\cdot\\boldsymbol\\sigma),\\quad \\mathbf r = 2\\mathbf a', why: 'Call twice the arrow $\\mathbf r$.', view: ball(bZX), viewCaption: '$\\mathbf r = (0.5, 0, 0.5)$' },
        { tex: '\\rho = \\tfrac12\\begin{pmatrix}1 + r_z & r_x - ir_y\\\\ r_x + ir_y & 1 - r_z\\end{pmatrix}', why: 'Write out the three Pauli matrices.', view: mx({ rho: ZX_MIX }), viewCaption: "our mixture's entries" },
        { tex: '\\det\\rho = \\tfrac14\\big((1 + r_z)(1 - r_z) - (r_x^2 + r_y^2)\\big) = \\tfrac14(1 - |\\mathbf r|^2)', why: 'Diagonal product minus corner product.' },
        { tex: '\\det\\rho = \\tfrac14(1 - |\\mathbf r|^2) \\ge 0 \\Rightarrow |\\mathbf r| \\le 1', why: 'The determinant is the product of two non-negative eigenvalues.', view: ball(bZX, { compare: { thetaDeg: 45, phiDeg: 0 } }), viewCaption: 'inside; the surface point beyond it has determinant 0' },
      ],
      formal: [
        { tex: '\\rho = \\tfrac12(I + \\mathbf r\\cdot\\boldsymbol\\sigma),\\ \\mathbf r \\in \\mathbb R^3', why: '$\\mathrm{Tr}\\,\\rho = 1$ and $\\rho = \\rho^\\dagger$ (notes Eq. 2.14).', view: ops(V.q8ZXA0, [V.q8ZXAx, V.q8ZXAy, V.q8ZXAz]) },
        { tex: '\\det\\rho = \\tfrac14(1 - |\\mathbf r|^2) \\ge 0 \\Rightarrow |\\mathbf r| \\le 1', why: 'Eq. 2.15 and $\\rho \\ge 0$.', view: ball(bZX, { compare: { thetaDeg: 45, phiDeg: 0 } }) },
      ],
    },
    claims: [claim('q8ZXDet', 'our mixture has $\\det\\rho = 0.125$', () => close(V.q8ZXDet, 0.125))],
  },
  {
    id: 'q8-ball:b3',
    phase: 'lecture',
    text:
      'On the surface $|\\mathbf r| = 1$, so the determinant is 0. Then one eigenvalue is 0 and the other is 1. So $\\rho$ is $|u\\rangle\\langle u|$ for a single state $|u\\rangle$: a pure state. That is why Unit 8.2’s $\\rho$ sits on the surface.',
    formal:
      'If $|\\mathbf r| = 1$, then $\\det\\rho = 0$ and $\\mathrm{Tr}\\,\\rho = 1$ force eigenvalues 1 and 0, so $\\rho = |u\\rangle\\langle u|$ with $|u\\rangle$ the eigenvector of eigenvalue 1 (notes p. 37; Bergou p. 19). The surface is exactly the set of pure states; Unit 8.2’s $\\rho$ has eigenvalues 1 and 0.',
    caption: 'the surface: eigenvalues 1 and 0',
    captionFormal: '$|\\mathbf r| = 1 \\Leftrightarrow \\rho = |u\\rangle\\langle u|$',
    stage: split(ball(bN), mx(out(N), { spectrum: 'bars' })),
    claims: [
      claim('q8NDet', 'a pure $\\rho$ has determinant 0', () => close(V.q8NDet, 0)),
      claim('q8NEigLarge', 'the surface eigenvalue 1', () => close(V.q8NEigLarge, 1)),
      claim('q8NEigSmall', 'and eigenvalue 0', () => close(V.q8NEigSmall, 0)),
      claim('q8NRLen', 'the running example has $|\\mathbf r| = 1$', () => close(V.q8NRLen, 1)),
    ],
    fidelity: ['ball-surface-pure'],
  },
  {
    id: 'q8-ball:b4',
    phase: 'lecture',
    text:
      'To find the arrow from $\\rho$, take the average of each Pauli matrix: $r_j = \\mathrm{Tr}(\\rho\\sigma_j)$. It works because $\\mathrm{Tr}(\\sigma_j\\sigma_k)$ is 2 when $j = k$ and 0 otherwise. For our mixture, $\\mathrm{Tr}(\\rho\\sigma_x) = 0.5$, $\\mathrm{Tr}(\\rho\\sigma_y) = 0$ and $\\mathrm{Tr}(\\rho\\sigma_z) = 0.5$.',
    formal:
      'From $\\mathrm{Tr}\\,\\sigma_j = 0$ and $\\mathrm{Tr}(\\sigma_j\\sigma_k) = 2\\delta_{jk}$, $\\mathrm{Tr}(\\rho\\sigma_j) = \\tfrac12\\sum_kr_k\\mathrm{Tr}(\\sigma_k\\sigma_j) = r_j$ (notes Eq. 2.16; Bergou Eq. 2.20). So $\\mathbf r = (\\langle\\sigma_x\\rangle, \\langle\\sigma_y\\rangle, \\langle\\sigma_z\\rangle)$: the ball’s coordinates are the three averages.',
    caption: '$\\mathrm{Tr}(\\rho\\sigma_x) = 0.5$',
    captionFormal: '$r_j = \\mathrm{Tr}(\\rho\\sigma_j)$',
    stage: split(ball(bZX), mx(prod({ rho: ZX_MIX }, pa('X')), { trace: true })),
    derivation: {
      result: 'r_j = \\mathrm{Tr}(\\rho\\sigma_j)',
      ground: [
        { tex: '\\rho\\sigma_x = \\tfrac12(\\sigma_x + r_x\\sigma_x^2 + r_y\\sigma_y\\sigma_x + r_z\\sigma_z\\sigma_x)', why: 'Multiply $\\rho$ by $\\sigma_x$, term by term.', view: mx(prod({ rho: ZX_MIX }, pa('X'))), viewCaption: '$\\rho\\sigma_x$ for our mixture' },
        { tex: '\\mathrm{Tr}\\,\\sigma_x = 0,\\ \\mathrm{Tr}\\,\\sigma_x^2 = 2,\\ \\mathrm{Tr}(\\sigma_y\\sigma_x) = \\mathrm{Tr}(\\sigma_z\\sigma_x) = 0', why: '$\\sigma_x^2 = I$, and each mixed product is $\\pm i$ times a Pauli matrix, with trace 0.' },
        { tex: '\\mathrm{Tr}(\\rho\\sigma_x) = \\tfrac12\\cdot2r_x = r_x', why: 'Only one term survives.', view: mx(prod({ rho: ZX_MIX }, pa('X')), { trace: true }), viewCaption: 'trace 0.5' },
        { tex: 'r_j = \\mathrm{Tr}(\\rho\\sigma_j)', why: 'The same works for y and z.', view: ball(bZX), viewCaption: '(0.5, 0, 0.5)' },
      ],
      formal: [
        { tex: '\\mathrm{Tr}(\\sigma_j\\sigma_k) = 2\\delta_{jk}', why: 'Pauli algebra (Unit 3.3).', view: mx(prod({ rho: ZX_MIX }, pa('X')), { trace: true }) },
        { tex: 'r_j = \\mathrm{Tr}(\\rho\\sigma_j)', why: 'Bergou Eq. 2.20: the coordinates are averages.', view: ball(bZX) },
      ],
    },
    claims: [claim('q8ZXRx', 'Tr(ρσₓ) is 0.5', () => close(V.q8ZXRx, 0.5)), claim('q8ZXRz', 'Tr(ρσ_z) is also 0.5', () => close(V.q8ZXRz, 0.5))],
    fidelity: [],
  },
  {
    id: 'q8-ball:b5',
    phase: 'books',
    text:
      "Homework 2, Problem 6 runs the same idea backwards. Squaring $\\rho$ gives the purity $\\tfrac12(1 + |\\mathbf r|^2)$. That is 1 exactly when $|\\mathbf r| = 1$, and less inside: 0.625 at length 0.5. Each average is one component, $\\langle\\sigma_j\\rangle = r_j$. A surface point at angles $\\theta$ and $\\varphi$ is Unit 3.2's state $\\cos\\tfrac\\theta2|0\\rangle + e^{i\\varphi}\\sin\\tfrac\\theta2|1\\rangle$.",
    formal:
      'HW2 P6 (which writes $\\mathbf a$ for our $\\mathbf r$): $(\\mathbf r\\cdot\\boldsymbol\\sigma)^2 = |\\mathbf r|^2I$ gives $\\rho^2 = \\tfrac14\\big((1 + |\\mathbf r|^2)I + 2\\mathbf r\\cdot\\boldsymbol\\sigma\\big)$, so $\\mathrm{Tr}\\,\\rho^2 = \\tfrac12(1 + |\\mathbf r|^2)$, which is 1 iff $|\\mathbf r| = 1$. Also $\\langle\\sigma_\\alpha\\rangle = r_\\alpha$; for $|\\mathbf r| = 1$ at angles ($\\theta$, $\\varphi$) the state is $\\cos\\tfrac\\theta2|0\\rangle + e^{i\\varphi}\\sin\\tfrac\\theta2|1\\rangle$.',
    caption: 'purity 0.5, 0.625, 1 at lengths 0, 0.5, 1',
    captionFormal: '$\\mathrm{Tr}\\,\\rho^2 = \\tfrac12(1 + |\\mathbf r|^2)$',
    stage: split(ball(bN), mx(out(N))),
    refs: [{ source: 'lecture', where: 'HW2 P6', adds: 'the purity-vs-length identity and the surface state in Bloch angles.' }],
    derivation: {
      result: '\\mathrm{Tr}\\,\\rho^2 = \\tfrac12(1 + |\\mathbf r|^2) = 1 \\Leftrightarrow |\\mathbf r| = 1',
      ground: [
        { tex: '\\rho = \\tfrac12(I + \\mathbf r\\cdot\\boldsymbol\\sigma)', why: 'The form of Unit 8.5.', view: ops(V.q8ZXA0, [V.q8ZXAx, V.q8ZXAy, V.q8ZXAz]), viewCaption: '$\\rho$ as an operator' },
        { tex: '(\\mathbf r\\cdot\\boldsymbol\\sigma)^2 = |\\mathbf r|^2I', why: "Unit 3.3's rule: the cross terms cancel in pairs." },
        { tex: '\\rho^2 = \\tfrac14\\big((1 + |\\mathbf r|^2)I + 2\\mathbf r\\cdot\\boldsymbol\\sigma\\big)', why: 'Square the bracket.', view: mx(prod({ rho: ZX_MIX }, { rho: ZX_MIX })), viewCaption: '$\\rho^2$ for our mixture' },
        { tex: '\\mathrm{Tr}\\,\\rho^2 = \\tfrac14\\cdot2(1 + |\\mathbf r|^2) = \\tfrac12(1 + |\\mathbf r|^2)', why: 'I has trace 2; the Pauli part has trace 0.' },
        { tex: '\\tfrac12(1 + |\\mathbf r|^2) = 1 \\Leftrightarrow |\\mathbf r| = 1', why: 'Pure exactly on the surface.', view: ball(bN), viewCaption: 'a surface point: purity 1' },
        { tex: '\\mathrm{Tr}\\,\\rho^2 = \\tfrac12(1 + |\\mathbf r|^2) = 1 \\Leftrightarrow |\\mathbf r| = 1', why: 'Inside, the purity is below 1.' },
      ],
      formal: [
        { tex: '\\rho^2 = \\tfrac14\\big((1 + |\\mathbf r|^2)I + 2\\mathbf r\\cdot\\boldsymbol\\sigma\\big)', why: 'From $\\{\\sigma_j, \\sigma_k\\} = 2\\delta_{jk}I$ (HW2 P6(b)).', view: mx(prod({ rho: ZX_MIX }, { rho: ZX_MIX })) },
        { tex: '\\mathrm{Tr}\\,\\rho^2 = \\tfrac12(1 + |\\mathbf r|^2) = 1 \\Leftrightarrow |\\mathbf r| = 1', why: 'With Bergou p. 18, pure ⇔ $|\\mathbf r| = 1$.', view: ball(bN) },
      ],
    },
    claims: [cHalf, claim('q8PurRHalf', 'purity 0.625 at $|\\mathbf r| = 0.5$', () => close(V.q8PurRHalf, 0.625))],
  },
  {
    id: 'q8-ball:b6',
    phase: 'clue',
    text: 'Is $\\begin{pmatrix}1/2 & 1/\\sqrt2\\\\ 1/\\sqrt2 & 1/2\\end{pmatrix}$ a density matrix? Its trace is 1, it equals its own mirrored transpose, and every entry lies between 0 and 1.',
    formal: 'Is $\\begin{pmatrix}1/2 & 1/\\sqrt2\\\\ 1/\\sqrt2 & 1/2\\end{pmatrix}$ a density matrix?',
    stage: mx(lin(['+1/2', pa('I')], ['+1/sqrt2', pa('X')])),
    reveal: {
      text: 'No. Its arrow is $(1.414, 0, 0)$, outside the ball. Its determinant is −0.25, so one eigenvalue is negative: −0.207. A chance cannot be negative.',
      formal: 'No: $\\mathbf r = (\\sqrt2, 0, 0)$, $\\det\\rho = -0.25 < 0$, eigenvalues 1.207 and −0.207. Unit trace and Hermiticity are not enough; positivity fails.',
      caption: 'eigenvalues 1.207 and −0.207',
      captionFormal: 'eigenvalues 1.207 and −0.207',
      stage: mx(lin(['+1/2', pa('I')], ['+1/sqrt2', pa('X')]), { spectrum: 'bars' }),
      claims: [
        claim('q8BadRx', 'the bad matrix’s arrow has x length 1.414', () => close(V.q8BadRx, Math.SQRT2)),
        claim('q8BadDet', 'its determinant is −0.25', () => close(V.q8BadDet, -0.25)),
        claim('q8BadEigLarge', 'its larger eigenvalue is 1.207', () => close(V.q8BadEigLarge, 0.5 + Math.SQRT1_2)),
        claim('q8BadEigSmall', 'its smaller eigenvalue is −0.207', () => close(V.q8BadEigSmall, 0.5 - Math.SQRT1_2)),
      ],
    },
  },
]

/* ---------------------------------------------------------------------------------------------- */
/* q8-recipes — One matrix, many recipes                                                            */
/* ---------------------------------------------------------------------------------------------- */

const recipes: Beat[] = [
  {
    id: 'q8-recipes:b1',
    phase: 'lecture',
    text:
      'Mix $|0\\rangle$ and $|1\\rangle$ half and half. In another box, mix $|+\\rangle$ and $|-\\rangle$ half and half. Both give $\\rho = \\tfrac12I$, the centre of the ball. The boxes were made differently, yet no reading can ever tell them apart.',
    formal:
      '$\\tfrac12I = \\tfrac12(|0\\rangle\\langle0| + |1\\rangle\\langle1|) = \\tfrac12(|{+x}\\rangle\\langle{+x}| + |{-x}\\rangle\\langle{-x}|)$ (notes Eqs. 2.17–2.18; Bergou Eq. 2.22). Every prediction is $\\mathrm{Tr}(A\\rho)$, so two ensembles with one $\\rho$ are indistinguishable: $\\rho$, not the recipe, is the state.',
    caption: 'two recipes, one centre',
    captionFormal: '$\\tfrac12I$ from the z poles or the x poles',
    stage: ball({ mix: [{ of: '+z', w: 0.5 }, { of: '-z', w: 0.5 }] }, { recipe: true }),
    claims: [
      claim('q8HalfGapZ', 'the z poles average to $\\tfrac12I$', () => close(V.q8HalfGapZ, 0, 1e-9)),
      claim('q8HalfGapX', 'the x poles average to $\\tfrac12I$ too', () => close(V.q8HalfGapX, 0, 1e-9)),
    ],
    fidelity: ['ball-many-recipes'],
  },
  {
    id: 'q8-recipes:b2',
    phase: 'lecture',
    text:
      "Unit 8.4's mixture has a second recipe too. Its matrix has two eigenvectors, $|u_+\\rangle$ and $|u_-\\rangle$, which are the eigenstates of the H gate. Mix them with chances 0.854 and 0.146 and you get the same $\\rho$. These chances are $\\rho$'s eigenvalues.",
    formal:
      'With $|u_\\pm\\rangle = ((\\sqrt2 \\pm 1)|0\\rangle \\pm |1\\rangle)/\\sqrt{4 \\pm 2\\sqrt2}$, the eigenstates of H, $\\tfrac12(|0\\rangle\\langle0| + |{+x}\\rangle\\langle{+x}|) = \\tfrac{2 + \\sqrt2}4|u_+\\rangle\\langle u_+| + \\tfrac{2 - \\sqrt2}4|u_-\\rangle\\langle u_-|$ (notes Eqs. 2.19–2.20; Bergou Eqs. 2.23–2.24, bracket corrected). The weights 0.854 and 0.146 are $\\rho$’s eigenvalues, and $|u_\\pm\\rangle$ sit at $\\theta$ = 45° and 135° on the x–z circle.',
    caption: 'the eigen-recipe: 0.854 and 0.146',
    captionFormal: 'spectrum of $\\rho$: $\\tfrac{2 \\pm \\sqrt2}4$',
    stage: split(ball(bU, { recipe: true }), mx({ rho: ZX_MIX }, { spectrum: 'bars' })),
    derivation: {
      result: '\\tfrac12(|0\\rangle\\langle0| + |{+x}\\rangle\\langle{+x}|) = \\tfrac{2 + \\sqrt2}4|u_+\\rangle\\langle u_+| + \\tfrac{2 - \\sqrt2}4|u_-\\rangle\\langle u_-|',
      ground: [
        { tex: '\\tfrac12I = \\tfrac12(|0\\rangle\\langle0| + |1\\rangle\\langle1|)', why: 'First recipe for the centre: the z poles.', view: ball({ mix: [{ of: '+z', w: 0.5 }, { of: '-z', w: 0.5 }] }, { recipe: true }), viewCaption: 'z poles' },
        { tex: '\\tfrac12I = \\tfrac12(|{+x}\\rangle\\langle{+x}| + |{-x}\\rangle\\langle{-x}|)', why: 'Second recipe, the x poles: the same centre.', view: ball({ mix: [{ of: '+x', w: 0.5 }, { of: '-x', w: 0.5 }] }, { recipe: true }), viewCaption: 'x poles, same centre' },
        { tex: '\\rho = \\tfrac12(|0\\rangle\\langle0| + |{+x}\\rangle\\langle{+x}|) = \\begin{pmatrix}3/4 & 1/4\\\\ 1/4 & 1/4\\end{pmatrix}', why: "Unit 8.4's mixture.", view: ball(bZX, { recipe: true }), viewCaption: '$|0\\rangle$ and $|+\\rangle$' },
        { tex: '\\lambda_\\pm = \\tfrac{2 \\pm \\sqrt2}4', why: 'Its eigenvalues: they add to 1 and multiply to $\\det\\rho = \\tfrac18$.', view: mx({ rho: ZX_MIX }, { spectrum: 'bars' }), viewCaption: 'eigenvalues 0.854 and 0.146' },
        { tex: '|u_\\pm\\rangle = \\frac{(\\sqrt2 \\pm 1)|0\\rangle \\pm |1\\rangle}{\\sqrt{4 \\pm 2\\sqrt2}}', why: 'Its eigenvectors, which are also the eigenstates of the H gate.' },
        { tex: '\\rho = \\tfrac{2 + \\sqrt2}4|u_+\\rangle\\langle u_+| + \\tfrac{2 - \\sqrt2}4|u_-\\rangle\\langle u_-|', why: "A Hermitian matrix is the sum of its eigenvalues times its eigenvectors' projectors (Unit 3.5).", view: ball(bU, { recipe: true }), viewCaption: 'the eigen-recipe: the same point' },
      ],
      formal: [
        { tex: '\\rho = \\sum_k\\lambda_k|k\\rangle\\langle k|,\\quad \\lambda_\\pm = \\tfrac{2 \\pm \\sqrt2}4', why: 'The spectral recipe (Unit 3.5).', view: mx({ rho: ZX_MIX }, { spectrum: 'bars' }) },
        { tex: '\\tfrac12(|0\\rangle\\langle0| + |{+x}\\rangle\\langle{+x}|) = \\tfrac{2 + \\sqrt2}4|u_+\\rangle\\langle u_+| + \\tfrac{2 - \\sqrt2}4|u_-\\rangle\\langle u_-|', why: 'Notes Eq. 2.20; Bergou Eq. 2.24, bracket corrected.', view: ball(bU, { recipe: true }) },
      ],
    },
    claims: [
      claim('q8ZXEigLarge', "$\\rho$'s larger eigenvalue is 0.854", () => close(V.q8ZXEigLarge, (2 + Math.SQRT2) / 4)),
      claim('q8ZXEigSmall', 'its smaller eigenvalue is 0.146', () => close(V.q8ZXEigSmall, (2 - Math.SQRT2) / 4)),
      claim('q8UHEigPlus', '$|u_+\\rangle$ is an eigenstate of H with eigenvalue 1', () => close(V.q8UHEigPlus, 1, 1e-9)),
      claim('q8UHEigMinus', '$|u_-\\rangle$ is an eigenstate of H with eigenvalue −1', () => close(V.q8UHEigMinus, -1, 1e-9)),
      claim('q8EigRecipeGap', 'the eigen-recipe gives the same $\\rho$', () => close(V.q8EigRecipeGap, 0, 1e-9)),
    ],
  },
  {
    id: 'q8-recipes:b3',
    phase: 'lecture',
    introduces: ['qc-convex-set'],
    text:
      'Mix any two density matrices with weights t and $1 - t$, and you get another density matrix. On the ball, the new point lies on the straight segment between the two. So the set has no dents: it is [[qc-convex-set|convex]]. A surface point is no mixture of two other states, so a pure state has exactly one recipe.',
    formal:
      'For $0 \\le t \\le 1$, $\\rho(t) = t\\rho_1 + (1 - t)\\rho_2$ is a density matrix (notes Eq. 2.21; Bergou Eq. 2.25; both call the weight $\\theta$): density matrices form a [[qc-convex-set|convex set]], the ball. A pure $\\rho$ is an extreme point. If $|\\psi\\rangle\\langle\\psi| = t\\rho_1 + (1 - t)\\rho_2$ with $0 < t < 1$, then $\\langle\\psi^\\perp|\\rho_k|\\psi^\\perp\\rangle = 0$ forces $\\rho_1 = \\rho_2 = |\\psi\\rangle\\langle\\psi|$ (Bergou Eqs. 2.26–2.27).',
    caption: 'weights 0.25 and 0.75: a point on the chord, inside',
    captionFormal: '$\\mathbf r(t) = t\\mathbf r_1 + (1 - t)\\mathbf r_2$',
    stage: split(ball({ mix: [{ of: '+z', w: 0.25 }, { of: '+x', w: 0.75 }] }, { recipe: true }), mx({ rho: convMix25() })),
    derivation: {
      result: 't\\rho_1 + (1 - t)\\rho_2\\ \\text{is a density matrix; a pure state has one recipe}',
      ground: [
        { tex: '\\rho(t) = t\\rho_1 + (1 - t)\\rho_2,\\quad 0 \\le t \\le 1', why: 'Mix two boxes in the proportion t to $1 - t$.', view: ball({ mix: [{ of: '+z', w: 0.25 }, { of: '+x', w: 0.75 }] }, { recipe: true }), viewCaption: 't = 0.25' },
        { tex: '\\mathrm{Tr}\\,\\rho(t) = t + (1 - t) = 1', why: 'Both traces are 1.' },
        { tex: '\\langle\\varphi|\\rho(t)|\\varphi\\rangle = t\\langle\\varphi|\\rho_1|\\varphi\\rangle + (1 - t)\\langle\\varphi|\\rho_2|\\varphi\\rangle \\ge 0', why: 'Two non-negative terms, so the mix is still positive.', view: mx({ rho: convMix25() }, { spectrum: 'bars' }), viewCaption: 'both eigenvalues positive' },
        { tex: '\\mathbf r(t) = t\\mathbf r_1 + (1 - t)\\mathbf r_2', why: 'The arrows mix the same way: the point slides along the chord.', view: ball({ mix: [{ of: '+z', w: 0.75 }, { of: '+x', w: 0.25 }] }, { recipe: true }), viewCaption: 't = 0.75' },
        { tex: '|\\psi\\rangle\\langle\\psi| = t\\rho_1 + (1 - t)\\rho_2 \\Rightarrow \\rho_1 = \\rho_2 = |\\psi\\rangle\\langle\\psi|', why: 'Sandwich with $|\\psi^\\perp\\rangle$, the state [[orthogonal|orthogonal]] to $|\\psi\\rangle$: the left gives 0, so both terms on the right are 0.', view: ball('+z'), viewCaption: 'a surface point: one recipe only' },
        { tex: 't\\rho_1 + (1 - t)\\rho_2\\ \\text{is a density matrix; a pure state has one recipe}', why: 'The set is convex, and its surface points are its corners.' },
      ],
      formal: [
        { tex: 't\\rho_1 + (1 - t)\\rho_2 \\ge 0,\\quad \\mathrm{Tr}\\big(t\\rho_1 + (1 - t)\\rho_2\\big) = 1', why: 'Positivity and trace survive convex combinations (notes Eq. 2.21).', view: mx({ rho: convMix25() }, { spectrum: 'bars' }) },
        { tex: 't\\rho_1 + (1 - t)\\rho_2\\ \\text{is a density matrix; a pure state has one recipe}', why: 'Bergou Eqs. 2.26–2.27, with $|\\psi^\\perp\\rangle$.', view: ball('+z') },
      ],
    },
    claims: [cQuarter, cThreeQuarter],
    fidelity: ['ball-surface-pure'],
  },
  {
    id: 'q8-recipes:b4',
    phase: 'books',
    text:
      "How are two recipes for one $\\rho$ related? Weight each member's ket by the square root of its chance. Then each weighted ket of one recipe is a combination of the other recipe's. The table of combinations is a unitary matrix, like a gate. For both pairs of recipes above, it is the H gate.",
    formal:
      'Two ensembles give the same $\\rho$ iff $\\sqrt{p_i}|\\psi_i\\rangle = \\sum_jU_{ij}\\sqrt{q_j}|\\varphi_j\\rangle$ for a unitary U, the shorter list padded with zero vectors: the [[qc-unitary-freedom|unitary-freedom theorem]] (notes p. 38; Bergou pp. 20–21, Eq. 2.28; N&C’s own theorem, p. 103). From the z poles to the x poles, U = H; from $\\{|0\\rangle, |{+x}\\rangle\\}$ to $\\{|u_\\pm\\rangle\\}$, U = H again. The trine, three states 120° apart with weight $\\tfrac13$ each, needs a 3 × 3 U.',
    caption: 'the combination table: the H gate',
    captionFormal: 'U = H for both pairs',
    stage: split(ball(bZX, { recipe: true }), mx(gateSrc('H'))),
    refs: [{ source: 'nc', where: 'Theorem 2.6, p. 103', adds: 'the unitary-freedom theorem in the language this beat uses.' }],
    derivation: {
      result: '\\sqrt{p_i}|\\psi_i\\rangle = \\sum_jU_{ij}\\sqrt{q_j}|\\varphi_j\\rangle \\Rightarrow \\sum_ip_i|\\psi_i\\rangle\\langle\\psi_i| = \\sum_jq_j|\\varphi_j\\rangle\\langle\\varphi_j|',
      ground: [
        { tex: '|\\tilde\\psi_i\\rangle = \\sqrt{p_i}|\\psi_i\\rangle,\\quad \\rho = \\sum_i|\\tilde\\psi_i\\rangle\\langle\\tilde\\psi_i|', why: 'Fold each chance into its ket as a square root, with the second recipe’s chances $q_j$ and kets $|\\varphi_j\\rangle$ folded the same way.', view: ball(bZX, { recipe: true }), viewCaption: 'recipe 1: $|0\\rangle$ and $|+\\rangle$' },
        { tex: '|\\tilde\\psi_1\\rangle = \\tfrac1{\\sqrt2}(|\\tilde\\varphi_1\\rangle + |\\tilde\\varphi_2\\rangle),\\quad |\\tilde\\psi_2\\rangle = \\tfrac1{\\sqrt2}(|\\tilde\\varphi_1\\rangle - |\\tilde\\varphi_2\\rangle)', why: 'For our mixture, with $|\\tilde\\varphi_{1,2}\\rangle$ the weighted $|u_\\pm\\rangle$, each weighted ket is a sum or a difference.', view: mx(gateSrc('H')), viewCaption: 'the combination table: H' },
        { tex: '\\sum_i|\\tilde\\psi_i\\rangle\\langle\\tilde\\psi_i| = \\sum_{j,k}\\Big(\\sum_iU_{ij}U_{ik}^*\\Big)|\\tilde\\varphi_j\\rangle\\langle\\tilde\\varphi_k|', why: 'Multiply out with a general table U.' },
        { tex: '\\sum_iU_{ij}U_{ik}^* = (U^\\dagger U)_{kj} = \\delta_{jk}', why: 'A unitary table has [[qc-orthonormal-basis|orthonormal]] columns.' },
        { tex: '= \\sum_j|\\tilde\\varphi_j\\rangle\\langle\\tilde\\varphi_j|', why: 'Only the matching terms survive: the same $\\rho$.', view: ball(bU, { recipe: true }), viewCaption: 'recipe 2: $|u_\\pm\\rangle$, the same point' },
        { tex: '\\sqrt{p_i}|\\psi_i\\rangle = \\sum_jU_{ij}\\sqrt{q_j}|\\varphi_j\\rangle \\Rightarrow \\sum_ip_i|\\psi_i\\rangle\\langle\\psi_i| = \\sum_jq_j|\\varphi_j\\rangle\\langle\\varphi_j|', why: 'Any unitary table gives a recipe for the same $\\rho$.' },
      ],
      formal: [
        { tex: '\\sum_i|\\tilde\\psi_i\\rangle\\langle\\tilde\\psi_i| = \\sum_{j,k}(U^\\dagger U)_{kj}|\\tilde\\varphi_j\\rangle\\langle\\tilde\\varphi_k| = \\sum_j|\\tilde\\varphi_j\\rangle\\langle\\tilde\\varphi_j|', why: 'Bergou Eq. 2.28; the converse uses the spectral argument of Bergou pp. 21–24 and padding.', view: mx(gateSrc('H')) },
        { tex: '\\sqrt{p_i}|\\psi_i\\rangle = \\sum_jU_{ij}\\sqrt{q_j}|\\varphi_j\\rangle \\Rightarrow \\sum_ip_i|\\psi_i\\rangle\\langle\\psi_i| = \\sum_jq_j|\\varphi_j\\rangle\\langle\\varphi_j|', why: 'Here U = H.', view: ball(bU, { recipe: true }) },
      ],
    },
    claims: [
      claim('q8UfreePolesGap', 'the z-poles-to-x-poles table is H', () => close(V.q8UfreePolesGap, 0, 1e-6)),
      claim('q8UfreeZXGap', 'the $|0\\rangle$, $|{+x}\\rangle$ to eigen-recipe table is H too', () => close(V.q8UfreeZXGap, 0, 1e-6)),
      cThird,
      claim('q8TrineUUnitary', 'the trine’s 3 × 3 combination table is unitary (the engine fix)', () => close(V.q8TrineUUnitary, 0, 1e-6)),
      claim('q8TrineGap', 'the trine also gives $\\tfrac12I$', () => close(V.q8TrineGap, 0, 1e-9)),
    ],
  },
  {
    id: 'q8-recipes:b5',
    phase: 'clue',
    text: 'One friend says her box is half $|{+y}\\rangle$ and half $|{-y}\\rangle$. Another says his is half $|0\\rangle$ and half $|1\\rangle$. Can any experiment tell the two boxes apart?',
    formal: 'Can any measurement distinguish $\\tfrac12(|{+y}\\rangle\\langle{+y}| + |{-y}\\rangle\\langle{-y}|)$ from $\\tfrac12(|0\\rangle\\langle0| + |1\\rangle\\langle1|)$?',
    stage: ball({ mix: [{ of: '+z', w: 0.5 }, { of: '-z', w: 0.5 }] }, { recipe: true }),
    reveal: {
      text: 'No. Both are $\\tfrac12I$, the centre of the ball. Every prediction is a trace with $\\rho$, and the two $\\rho$ are equal.',
      formal: 'No: both equal $\\tfrac12I$, and all statistics are $\\mathrm{Tr}(A\\rho)$. The y poles are a third recipe for the same point.',
      caption: 'the y poles: the same centre',
      captionFormal: 'the y poles: the same centre',
      stage: ball({ mix: [{ of: '+y', w: 0.5 }, { of: '-y', w: 0.5 }] }, { recipe: true }),
      claims: [cHalf, claim('q8HalfGapY', 'the y poles also average to $\\tfrac12I$', () => close(V.q8HalfGapY, 0, 1e-9))],
    },
  },
]

export const Q8_STORY: Record<string, Beat[]> = {
  'q8-why': why,
  'q8-pure-rho': pureRho,
  'q8-trace-rule': traceRule,
  'q8-mixed': mixed,
  'q8-ball': ball8,
  'q8-recipes': recipes,
}

/**
 * Generic reusable claims (the small set of exact fractions — ½, ¼, ¾, ⅛, ⅓, 0.707 — that recur in $\tfrac{}{}$ form
 * across many beats and derivation lines of every unit). Exported so Q8.ts can attach them at the Unit level,
 * where they back every occurrence within that unit's scope (content/claims.test.ts `unbacked`).
 */
export const Q8_UNIT_CLAIMS = [cHalf, cQuarter, cThreeQuarter, cEighth, cThird, cR2]
const cBadEigSmallAbs = claim('q8BadEigSmallAbs', 'the bad matrix’s smaller eigenvalue has size 0.207', () => close(V.q8BadEigSmallAbs, Math.SQRT1_2 - 0.5))
export const Q8_UNIT_CLAIMS_BY_ID: Record<string, typeof Q8_UNIT_CLAIMS> = {
  'q8-why': Q8_UNIT_CLAIMS,
  'q8-pure-rho': Q8_UNIT_CLAIMS,
  'q8-trace-rule': Q8_UNIT_CLAIMS,
  'q8-mixed': Q8_UNIT_CLAIMS,
  'q8-ball': [...Q8_UNIT_CLAIMS, cBadEigSmallAbs],
  'q8-recipes': Q8_UNIT_CLAIMS,
}
