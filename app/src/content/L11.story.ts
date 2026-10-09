/**
 * Lecture 11 scroll story (owner: P). Beats per docs/roles/proposals/P-L11-story.md §1, with the judge's rulings
 * (docs/roles/decisions/448-L8L11.md, L11 section):
 * - R1: the `clocks` kind and the `two-clocks` widget draw the two energy components of a two-level state as phase clocks beside an
 *   energy ladder (physics/dynamics.ts is their one engine).
 * - R2: every picture uses E₊ = 3ε and E₋ = ε (Ē = 2ε, ħω = 2ε): a quarter Bloch turn at εt/ħ = 45°, a full lap at 180°, and U = −I
 *   exactly at εt/ħ = 180° (T = π in units of ħ/ε).
 * - R3: Go deeper 3 (`l11-two-level:b10`) supplies P(+x; t) = cos²(ωt/2), labelled beyond the notes (p. 2 plans it as an optional §11.10
 *   that the notes never carry out).
 * - R4: no class marker inside this chapter (the opener's "Class 11, second half" is the lecture's `date`); the GHZ recap is the single
 *   link-back beat `l11-wait:b1`.
 * - R5: "≅" for the notes' "∼" (same state up to an overall phase), stated once in `l11-two-level:b2`.
 * - R6: the `hamiltonian` gloss keeps `first` at L6's beyond-lecture beat; `l11-generator:b2` introduces the notation in the notes' own line.
 * - R7: the N-step overshoot numbers are only in Go deeper 2 (`l11-generator:b7`), never in the notes' own beat `l11-generator:b3`.
 * - R8: Susskind & Friedman Lecture 4 is the books layer (Townsend Chapter 4 is not ingested, so it is not cited).
 * Rosettas: the notes' θ(t) = ωt is the azimuth φ(t) (`l11-two-level:b4`); the notes' Z is σ_z (`l11-two-level:b2`); ∼ becomes ≅.
 * Lecture 10 names: the GHZ recap (`l11-wait:b1`) calls Lecture 10's closing unit "Unit 10.8".
 * P2: the three Go-deeper beats use phase 'deeper' and are optional: the notes' own line never relies on them.
 * P3: the six derivations are one-track `{result, ground}` with two or more distinct views each.
 * P4: chips into Physics 709 (`<<sl-…|…>>`, content/bridges448.ts) sit in Go-deeper beats, never in the notes' own line.
 *
 * Rules kept here (as in L1–L9.story.ts): stage states carry physics inputs only (the resolvers compute every angle, length, chance and
 * entry); every number in the prose comes from L11.values.ts and is backed by a keyed claim; clue beats are click-to-reveal; core text
 * keeps sentences ≤ 25 words and defines symbols before use; link-back beats name the unit they recall and define nothing.
 */
import type { AmplitudesState, Beat, BlochState, ClocksState, ComplexPlaneState, MatrixGridState, MatrixSource, OperatorState, Ref, Scrub, TermTarget } from './schema'
import type { Anchor } from './stageVocab'
import type { StageKind } from './schema'
import { GHZ_CIRCUIT, V, claim, close, d, uf } from './L11.values'

/* ---------------------------------------------------------------------------------------------- */
/* Small builders (plain data out)                                                                 */
/* ---------------------------------------------------------------------------------------------- */

const t = (kind: StageKind, anchor: Anchor): TermTarget => ({ kind, anchor })
const sweep = (from: number, to: number): Scrub => ({ from, to })
const bl = (state: BlochState['state'], o: Omit<BlochState, 'kind' | 'state'> = {}): BlochState => ({ kind: 'bloch', state, shot: 'B-STD', ...o })
const op = (o: Omit<OperatorState, 'kind'>): OperatorState => ({ kind: 'operator-space', shot: 'O-STD', gauge: false, ...o })
/** A one-spin matrix in the z basis, drawn without row and column labels (the captions say the order: |+z⟩ first, |−z⟩ second). */
const mx = (source: MatrixSource, o: Omit<MatrixGridState, 'kind' | 'source'> = {}): MatrixGridState => ({ kind: 'matrix', source, labels: 'none', values: 'decimal', shot: 'M-GRID', ...o })
const amp = (state: AmplitudesState['state'], o: Omit<AmplitudesState, 'kind' | 'state'> = {}): AmplitudesState => ({ kind: 'amplitudes', state, labels: 'spin', dials: true, shot: 'A-BARS', ...o })
const cp = (o: Omit<ComplexPlaneState, 'kind'>): ComplexPlaneState => ({ kind: 'complex-plane', shot: 'C-FLAT', ...o })
/** The two phase clocks: E₊ = 3ε, E₋ = ε, start |+x⟩, time as the angle εt/ħ in degrees. */
const K = (timeDeg: Scrub, o: Omit<ClocksState, 'kind' | 'levels' | 'timeDeg'> & { levels?: ClocksState['levels'] } = {}): ClocksState => ({
  kind: 'clocks',
  levels: { upper: 3, lower: 1 },
  start: '+x',
  timeDeg,
  shot: 'K-STD',
  ...o,
})

/**
 * |+x⟩ after εt/ħ = t° under H = diag(3ε, ε): (e^{−3it}|+z⟩ + e^{−it}|−z⟩)/√2 = e^{−3it} × the equator state at azimuth 2t, so the
 * amplitudes picture is the equator state at azimuth 2t with the overall phase −3t. `eq(a, b)` sweeps t from a° to b°.
 */
const eq = (from: number, to: number = from): AmplitudesState => {
  const moving = from !== to
  return amp(
    { dir: { thetaDeg: 90, phiDeg: moving ? sweep(2 * from, 2 * to) : 2 * from } },
    { globalPhaseDeg: moving ? sweep(0 - 3 * from, 0 - 3 * to) : 0 - 3 * from },
  )
}

/** H = 2εI + εσ_z = diag(3ε, ε) as an operator: a₀ = Ē = 2, a⃗ = (0, 0, ħω/2 = 1) in units of ε. */
const HEX: OperatorState['op'] = { a0: 2, a: [0, 0, 1] }
const RZ60: MatrixSource = { gate: { name: 'Rz', params: [60] } }
const RZ60DAG_RZ60: MatrixSource = { product: [{ adjoint: RZ60 }, RZ60] }
/** A = −iσ_z, the example anti-Hermitian step. */
const A_EX: MatrixSource = { lin: [{ c: '-i', src: { pauli: 'Z' } }] }
/** U₁ = [[1, 1/√2], [0, 1/√2]] = |+z⟩⟨+z| + (1/√2)(|+z⟩⟨−z| + |−z⟩⟨−z|): keeps |±z⟩ and |+y⟩ at length 1, stretches |+x⟩. */
const U1: MatrixSource = {
  lin: [
    { c: '+1', src: { outer: [{ dir: '+z' }] } },
    { c: '+1/sqrt2', src: { outer: [{ dir: '+z' }, { dir: '-z' }] } },
    { c: '+1/sqrt2', src: { outer: [{ dir: '-z' }] } },
  ],
}
/** U₂ = [[1, i/√2], [0, 1/√2]]: keeps |±z⟩ and |+x⟩ at length 1, shrinks |+y⟩. */
const U2: MatrixSource = {
  lin: [
    { c: '+1', src: { outer: [{ dir: '+z' }] } },
    { c: '+i', src: { lin: [{ c: '+1/sqrt2', src: { outer: [{ dir: '+z' }, { dir: '-z' }] } }] } },
    { c: '+1/sqrt2', src: { outer: [{ dir: '-z' }] } },
  ],
}

const susskind = (where: string, adds: string): Ref => ({ source: 'susskind', where, adds })
const townsend = (where: string, adds: string): Ref => ({ source: 'townsend', where, adds })
const lecture = (where: string, adds: string): Ref => ({ source: 'lecture', where, adds })

/* ---------------------------------------------------------------------------------------------- */
/* l11-wait — What happens if we wait?                                                             */
/* ---------------------------------------------------------------------------------------------- */

const wait: Beat[] = [
  {
    id: 'l11-wait:b1',
    phase: 'lecture',
    text: 'Lecture 10 closed the GHZ argument (Unit 10.8). No table of answers written in advance can meet all four conditions, because their product would have to be both $+1$ and $-1$. The entangled state meets all four with certainty. So quantum randomness is not ignorance of hidden local answers. That chapter is done, and a new one begins.',
    caption: `the winning entangled state: four basis states of size ${uf(V.l11GhzAmp)}, and ZZZ reads +1 where the other three settings read −1`,
    stage: amp({ circuit: GHZ_CIRCUIT }, { labels: 'bits', dials: false }),
    claims: [
      claim('l11GhzRequired', 'the four required answers multiply to −1', () => close(V.l11GhzRequired, -1)),
      claim('l11GhzState', 'the circuit builds ½(|000⟩ − |011⟩ − |101⟩ − |110⟩)', () => V.l11GhzState === 1),
      claim('l11GhzAmp', 'each of the four amplitudes has size ½', () => close(V.l11GhzAmp, 0.5)),
      claim('l11GhzEigen', 'ZZZ has the eigenvalue +1 and ZXX, XZX, XXZ have −1 on that state', () => V.l11GhzEigen === 1),
    ],
  },
  {
    id: 'l11-wait:b2',
    phase: 'lecture',
    text: 'So far quantum mechanics has been static: we described states, measured them, joined systems and turned them. We have not asked how a state changes by itself. Prepare $|\\psi\\rangle$ at time $t = 0$. Which state do we hold at a later time $t$?',
    caption: 'a prepared state, here $|{+x}\\rangle$: the question is where its point is at a later time',
    stage: bl('+x'),
  },
  {
    id: 'l11-wait:b3',
    phase: 'lecture',
    text: 'Unit 6.4 wrote a turn as $R_z(\\varphi) = e^{-i\\varphi S_z/\\hbar}$. For a tiny turn this is $R_z(d\\varphi) \\approx I - \\tfrac{i}{\\hbar}S_z\\,d\\varphi$, so $S_z$ generates turns about $z$. Waiting will turn out to have the same structure.',
    caption: 'a quarter turn about $z$ takes $|{+x}\\rangle$ to $|{+y}\\rangle$',
    stage: bl('+x', { rotate: { axis: 'z', angleDeg: sweep(0, 90) }, trail: true, shot: 'B-EQUATOR' }),
    claims: [
      claim('l11Rz90', 'R_z(90°)|+x⟩ is the state |+y⟩', () => V.l11Rz90 === 1),
      claim('l11TinyRz', 'R_z(dφ) = I − i S_z dφ up to a term of order dφ²', () => V.l11TinyRz === 1),
    ],
  },
  {
    id: 'l11-wait:b4',
    phase: 'books',
    text: 'Susskind and Friedman stress what waiting does and does not fix. Given the ket at $t = 0$, the law of motion fixes the ket at every later time. Yet a measurement still returns a random outcome, unlike classical determinism, where the state fixes the result.',
    caption: 'the ket’s future is exact; each reading along $z$ is still a coin toss',
    stage: bl('+x', { measure: 'z' }),
    refs: [
      susskind(
        '§4.1–4.3',
        'The state vector evolves by a deterministic law, yet measurement outcomes stay probabilistic. His §4.5, previewed in Unit 6.4, gives the step that this lecture derives.',
      ),
    ],
  },
  {
    id: 'l11-wait:b5',
    phase: 'clue',
    text: 'If the ket’s future is fixed exactly, can we still predict one measurement?',
    stage: bl('+x', { measure: 'z' }),
    reveal: {
      text: 'No. The law fixes the state, and the state fixes only the chances. A known $|{+x}\\rangle$ still reads $\\pm\\hbar/2$ along $z$ with chance ½ each.',
      caption: `chance of the $+z$ reading for $|{+x}\\rangle$: ${d(V.l11Px, 1)}`,
      stage: bl('+x', { measure: 'z', readouts: ['averages'] }),
      claims: [claim('l11Px', 'P(+z) for |+x⟩ is ½', () => close(V.l11Px, 0.5))],
    },
  },
]

/* ---------------------------------------------------------------------------------------------- */
/* l11-unitary — Waiting keeps every length                                                        */
/* ---------------------------------------------------------------------------------------------- */

const unitary: Beat[] = [
  {
    id: 'l11-unitary:b1',
    phase: 'lecture',
    text: 'Write the state after a wait of length $t$ as $|\\psi(t)\\rangle = U(t)|\\psi(0)\\rangle$. The operator $U(t)$ is the [[time-evolution-operator|time-evolution operator]]. Physics must say which matrix it is; the stage shows $R_z(60^\\circ)$ as one example.',
    caption: 'an example of a $U$: the turn $R_z(60^\\circ)$, as a table of numbers · rows and columns follow $|{+z}\\rangle$, $|{-z}\\rangle$',
    stage: mx(RZ60),
  },
  {
    id: 'l11-unitary:b2',
    phase: 'lecture',
    text: 'A [[closed-system|closed system]] keeps its total probability: $\\langle\\psi(t)|\\psi(t)\\rangle = \\langle\\psi(0)|\\psi(0)\\rangle$. The bra of $U|\\psi\\rangle$ is $\\langle\\psi|U^\\dagger$. Demanding this for every starting state forces $U^\\dagger U = I$.',
    caption: 'the same example $U$; the next view multiplies it by its own conjugate transpose · rows and columns follow $|{+z}\\rangle$, $|{-z}\\rangle$',
    stage: mx(RZ60),
    derivation: {
      result: 'U^\\dagger(t)\\,U(t) = I',
      ground: [
        {
          tex: '\\langle\\psi(t)|\\psi(t)\\rangle = \\langle\\psi(0)|U^\\dagger U|\\psi(0)\\rangle',
          why: 'The bra of $U|\\psi(0)\\rangle$ is $\\langle\\psi(0)|U^\\dagger$, so the length of the evolved state is this sandwich.',
          view: mx(RZ60),
          viewCaption: 'an example $U$',
        },
        {
          tex: '\\langle\\psi(0)|U^\\dagger U|\\psi(0)\\rangle = \\langle\\psi(0)|\\psi(0)\\rangle',
          why: 'A closed system keeps the total probability, and it must do so for every starting state.',
        },
        {
          tex: 'U^\\dagger(t)\\,U(t) = I',
          why: 'Only the identity leaves the length of every state alone.',
          view: mx(RZ60DAG_RZ60, { values: 'exact' }),
          viewCaption: '$U^\\dagger U$ for $R_z(60^\\circ)$ is the identity',
        },
      ],
    },
    claims: [claim('l11RzUnitary', 'R_z(60°) is unitary', () => V.l11RzUnitary === 1)],
  },
  {
    id: 'l11-unitary:b3',
    phase: 'lecture',
    text: 'So time evolution is [[unitary|unitary]], as Unit 5.3 defined the word. Rotations were unitary for the same reason: waiting cannot make the total probability stop being one.',
    caption: 'a full turn about $z$: the arrow keeps its length 1 all the way round',
    stage: bl('+x', { rotate: { axis: 'z', angleDeg: sweep(0, 360) }, readouts: ['averages'] }),
    claims: [claim('l11LenKept', 'the arrow has length 1 at 0°, 90° and 270° of a z turn', () => close(V.l11LenKept, 1))],
  },
  {
    id: 'l11-unitary:b4',
    phase: 'books',
    text: 'Susskind and Friedman reach the same condition from a different premise: distinct states must stay distinct. Two [[orthogonal|orthogonal]] states have to stay orthogonal, so the [[inner-product|inner products]] of basis states are kept. That again gives $U^\\dagger U = I$.',
    caption: '$U^\\dagger U$ for the example $R_z(60^\\circ)$ is the identity matrix · rows and columns follow $|{+z}\\rangle$, $|{-z}\\rangle$',
    stage: mx(RZ60DAG_RZ60, { values: 'exact' }),
    refs: [susskind('§4.2–4.4', 'Evolution must conserve distinctions: states that start orthogonal stay orthogonal, which makes the evolution operator unitary.')],
    claims: [claim('l11UdagU', 'U†U = I for R_z(60°)', () => V.l11UdagU === 1)],
  },
  {
    id: 'l11-unitary:b5',
    phase: 'clue',
    text: 'A matrix keeps $|{+z}\\rangle$ and $|{-z}\\rangle$ at length 1. Must it be unitary?',
    caption: 'the matrix $U_1$, as a table of numbers · rows and columns follow $|{+z}\\rangle$, $|{-z}\\rangle$',
    stage: mx(U1),
    reveal: {
      text: `No. The matrix $U_1 = \\begin{pmatrix}1 & 1/\\sqrt2\\\\ 0 & 1/\\sqrt2\\end{pmatrix}$ keeps both at length 1, but stretches $|{+x}\\rangle$ to squared length ${d(V.l11BadX, 3)}. That is why the condition must hold for every state, not only for a basis.`,
      caption: `$U_1^\\dagger U_1$ has the off-diagonal entry ${d(V.l11BadOff, 3)}, so it is not the identity · rows and columns follow $|{+z}\\rangle$, $|{-z}\\rangle$`,
      stage: mx({ product: [{ adjoint: U1 }, U1] }),
      claims: [
        claim('l11BadX', 'U₁ takes |+x⟩ to squared length 1.707', () => close(V.l11BadX, 1 + Math.SQRT1_2, 1e-9)),
        claim('l11BadOff', 'the off-diagonal entry of U₁†U₁ is 1/√2 = 0.707', () => close(V.l11BadOff, Math.SQRT1_2)),
        claim('l11BadZ', 'U₁ keeps |+z⟩ and |−z⟩ at squared length 1', () => close(V.l11BadZ, 1)),
        claim('l11U1NotUnitary', 'U₁ is not unitary', () => V.l11U1NotUnitary === 1),
      ],
    },
  },
  {
    id: 'l11-unitary:b6',
    phase: 'deeper',
    text: `Beyond the notes: four states are enough, and fewer are not. The matrix $M = U^\\dagger U$ is Hermitian. A length of 1 for $|{\\pm z}\\rangle$ fixes its diagonal. Then $|{+x}\\rangle$ fixes the real part of its corner entry and $|{+y}\\rangle$ the imaginary part.\n\nThree states can still mislead. The matrix $U_1$ passes $|{\\pm z}\\rangle$ and $|{+y}\\rangle$, yet gives $|{+x}\\rangle$ the squared length ${d(V.l11BadX, 3)}. Now take $U_2 = \\begin{pmatrix}1 & i/\\sqrt2\\\\ 0 & 1/\\sqrt2\\end{pmatrix}$. It passes $|{\\pm z}\\rangle$ and $|{+x}\\rangle$, yet gives $|{+y}\\rangle$ the squared length ${d(V.l11U2Y, 3)}. For complex vectors, $\\langle\\psi|A|\\psi\\rangle = 0$ for every $\\psi$ forces $A = 0$; for real ones it only kills the symmetric part. <<sl-f4-unitary|Go further in 709: unitary maps>>`,
    caption: `$U_2$ keeps $|{+x}\\rangle$ at length 1 but takes $|{+y}\\rangle$ to squared length ${d(V.l11U2Y, 3)} · rows and columns follow $|{+z}\\rangle$, $|{-z}\\rangle$`,
    stage: mx(U2),
    refs: [lecture('L11 p. 11 (§11.5)', 'The notes ask for the length to be kept for every state and move on; the four-state test is added here.')],
    claims: [
      claim('l11BadX', 'U₁ takes |+x⟩ to squared length 1.707', () => close(V.l11BadX, 1 + Math.SQRT1_2, 1e-9)),
      claim('l11BadY', 'U₁ keeps |+y⟩ at squared length 1', () => close(V.l11BadY, 1)),
      claim('l11U2Y', 'U₂ takes |+y⟩ to squared length 1 − 1/√2 = 0.293', () => close(V.l11U2Y, 1 - Math.SQRT1_2)),
      claim('l11U2X', 'U₂ keeps |+x⟩ at squared length 1', () => close(V.l11U2X, 1)),
      claim('l11U2Z', 'U₂ keeps |±z⟩ at squared length 1', () => close(V.l11U2Z, 1)),
    ],
  },
]

/* ---------------------------------------------------------------------------------------------- */
/* l11-generator — The Hamiltonian generates each tiny step                                        */
/* ---------------------------------------------------------------------------------------------- */

const generator: Beat[] = [
  {
    id: 'l11-generator:b1',
    phase: 'lecture',
    text: 'Take a tiny wait $dt$. It is close to doing nothing, so write $U(dt) = I + A\\,dt$ for some operator $A$. Keeping lengths fixed to first order in $dt$ forces $A^\\dagger = -A$: the operator is [[anti-hermitian|anti-Hermitian]].',
    caption: 'an example of such an $A$: $-i\\sigma_z$. Its conjugate transpose is $+i\\sigma_z$, which is $-A$ · rows and columns follow $|{+z}\\rangle$, $|{-z}\\rangle$',
    stage: mx(A_EX, { values: 'exact' }),
    derivation: {
      result: 'A^\\dagger = -A',
      ground: [
        {
          tex: 'U(dt) = I + A\\,dt',
          why: 'A tiny wait is almost no change: the identity plus a small multiple of an operator $A$.',
          view: mx(A_EX, { values: 'exact' }),
          viewCaption: 'an example $A$',
        },
        {
          tex: 'U^\\dagger(dt) = I + A^\\dagger\\,dt',
          why: 'Take the conjugate transpose. The identity and the real number $dt$ are unchanged.',
        },
        {
          tex: 'U^\\dagger U = I + (A^\\dagger + A)\\,dt + A^\\dagger A\\,dt^2',
          why: 'Multiply the two brackets out.',
        },
        {
          tex: 'A^\\dagger + A = 0',
          why: 'Drop $dt^2$, which is far smaller than $dt$. Then $U^\\dagger U = I$ needs the first-order term to vanish.',
          view: mx({ adjoint: A_EX }, { values: 'exact' }),
          viewCaption: 'the conjugate transpose of the example: it is minus $A$',
        },
        {
          tex: 'A^\\dagger = -A',
          why: 'Move $A$ to the other side: the operator is minus its own conjugate transpose.',
        },
      ],
    },
    claims: [claim('l11AntiH', '(−iσ_z)† = −(−iσ_z)', () => V.l11AntiH === 1)],
  },
  {
    id: 'l11-generator:b2',
    phase: 'lecture',
    introduces: ['hamiltonian'],
    text: 'Pull out the factor $-i/\\hbar$ by writing $A = -\\tfrac{i}{\\hbar}H$, with $H^\\dagger = H$. Then $U(dt) = I - \\tfrac{i}{\\hbar}H\\,dt$. The mathematics only says that $H$ is Hermitian. Physics names it: the generator of [[time-translation|time translations]] is the [[hamiltonian|Hamiltonian]], the observable for energy.',
    caption: `an example: $H = \\mathrm{diag}(3\\varepsilon, \\varepsilon)$, where $\\varepsilon$ is a fixed unit of energy; its two energies are ${d(V.l11HUpper, 0)} and ${d(V.l11HLower, 0)} in that unit`,
    stage: op({ op: HEX, eigen: true, gauge: true }),
    claims: [
      claim('l11HUpper', 'the larger energy of diag(3ε, ε) is 3', () => close(V.l11HUpper, 3)),
      claim('l11HLower', 'the smaller energy is 1', () => close(V.l11HLower, 1)),
    ],
  },
  {
    id: 'l11-generator:b3',
    phase: 'lecture',
    text: 'For a time-independent $H$, chain $N$ tiny waits of length $t/N$. As $N$ grows, $\\left(I - \\tfrac{i}{\\hbar}H\\tfrac{t}{N}\\right)^N$ tends to $e^{-iHt/\\hbar}$, the [[matrix-exponential|matrix exponential]] of Unit 6.4. On one energy component the steps trace a polygon that closes onto the circle.',
    caption: '$N$ steps of one tiny turn: the polygon closes onto the unit circle as $N$ grows from 1 to 64',
    stage: cp({ euler: { rate: 'imag', phiDeg: -90, n: sweep(1, 64) } }),
    claims: [claim('l11Limit', 'the product of tiny turns tends to e^{−iπ/2} = −i', () => V.l11Limit === 1)],
  },
  {
    id: 'l11-generator:b4',
    phase: 'lecture',
    text: 'Rotation and time translation line up term by term. The angle $\\varphi$ plays the role of the time $t$, and the generator $S_z$ plays the role of $H$. So $R_z(\\varphi) = e^{-i\\varphi S_z/\\hbar}$ corresponds to $U(t) = e^{-iHt/\\hbar}$.',
    caption: 'a turn about $z$ (top) and the Hamiltonian that moves a state in time (bottom)',
    stage: {
      layout: 'split',
      top: bl('+x', { rotate: { axis: 'z', angleDeg: sweep(0, 90) }, trail: true }),
      bottom: op({ op: HEX, eigen: true }),
    },
    claims: [claim('l11RzIsExp', 'e^{−iφS_z/ħ} = R_z(φ) (checked at φ = 1.234)', () => V.l11RzIsExp === 1)],
  },
  {
    id: 'l11-generator:b5',
    phase: 'books',
    text: 'Susskind and Friedman get the same small step from unitarity plus continuity. They explain that the $-i$ is a convention chosen so that $H$ matches the classical energy, and that $\\hbar$ makes the units work. Townsend builds finite turns from tiny ones the same way.',
    caption: 'the Hamiltonian of the running example, $H = \\mathrm{diag}(3\\varepsilon, \\varepsilon)$',
    stage: op({ op: HEX, eigen: true }),
    refs: [
      susskind('§4.5–4.6', 'The tiny step I − iεH/ħ follows from unitarity and continuity; the −i is a convention, and ħ fixes the units of H.'),
      townsend('§2.2, pp. 36–37', 'Finite rotations are built by repeating tiny ones: the analogy this lecture draws for time.'),
    ],
  },
  {
    id: 'l11-generator:b6',
    phase: 'clue',
    text: 'Why write $A = -\\tfrac{i}{\\hbar}H$ instead of keeping $A$?',
    caption: 'the example $A = -i\\sigma_z$ · rows and columns follow $|{+z}\\rangle$, $|{-z}\\rangle$',
    stage: mx(A_EX, { values: 'exact' }),
    reveal: {
      text: `An anti-Hermitian $A$ has purely imaginary eigenvalues; for $-i\\sigma_z$ they are $-i$ and $+i$. Pulling out $-i/\\hbar$ leaves a Hermitian $H$ with real eigenvalues, here $3\\varepsilon$ and $\\varepsilon$: energies a measurement can return.`,
      caption: 'the Hamiltonian’s two eigenvalues are real numbers',
      stage: op({ op: HEX, eigen: true }),
      claims: [
        claim('l11AEig', 'the eigenvalues of −iσ_z are +i and −i', () => V.l11AEig === 1),
        claim('l11HUpper', 'the larger energy is 3', () => close(V.l11HUpper, 3)),
        claim('l11HLower', 'the smaller energy is 1', () => close(V.l11HLower, 1)),
      ],
    },
  },
  {
    id: 'l11-generator:b7',
    phase: 'deeper',
    text: `Beyond the notes: the product of finite steps is never exactly unitary; only its limit is. Take the energies $+\\varepsilon$ and $-\\varepsilon$, whose mean is zero, and a total turn of $180^\\circ$. One step ($N = 1$) stretches $|{+x}\\rangle$ to squared length ${d(V.l11Over1, 3)}. Ten steps give ${d(V.l11Over10, 3)}, a hundred ${d(V.l11Over100, 3)} and a thousand ${d(V.l11Over1000, 4)}.\n\nThe gap to $U(t)$ shrinks like $1/N$: its largest entry is ${d(V.l11Err1, 3)}, ${d(V.l11Err10, 3)}, ${d(V.l11Err100, 4)} and ${d(V.l11Err1000, 5)}. On one energy component this is the Euler polygon, whose size is ${d(V.l11Euler1, 3)}, ${d(V.l11Euler4, 3)} and ${d(V.l11Euler64, 4)} for $N = 1$, $4$ and $64$. <<sl-f1-euler|Go further in 709: the Euler polygon>>`,
    caption: 'the same polygon; the readout column gives the size of its last corner',
    stage: cp({ euler: { rate: 'imag', phiDeg: -90, n: sweep(1, 64) } }),
    refs: [lecture('L11 p. 13 (§11.6)', 'The notes state the limit and the exponential; its error at finite N is added here.')],
    claims: [
      claim('l11Over1', 'one step stretches |+x⟩ to squared length 1 + π²/4 = 3.467', () => close(V.l11Over1, 1 + (Math.PI / 2) ** 2, 1e-9)),
      claim('l11Over10', 'ten steps give 1.276', () => close(V.l11Over10, (1 + (Math.PI / 20) ** 2) ** 10, 1e-9)),
      claim('l11Over100', 'a hundred steps give 1.025', () => close(V.l11Over100, (1 + (Math.PI / 200) ** 2) ** 100, 1e-9)),
      claim('l11Over1000', 'a thousand steps give 1.0025', () => close(V.l11Over1000, (1 + (Math.PI / 2000) ** 2) ** 1000, 1e-9)),
      claim('l11Err1', 'the largest entry gap to U is 1.151 for N = 1', () => V.l11Err1 > 1.15 && V.l11Err1 < 1.152),
      claim('l11Err10', 'and 0.130 for N = 10', () => V.l11Err10 > 0.1303 && V.l11Err10 < 0.1304),
      claim('l11Err100', 'and 0.0124 for N = 100', () => V.l11Err100 > 0.0124 && V.l11Err100 < 0.0125),
      claim('l11Err1000', 'and 0.00123 for N = 1000', () => V.l11Err1000 > 0.00123 && V.l11Err1000 < 0.00124),
      claim('l11Euler1', 'the Euler polygon’s size is 1.862 for N = 1', () => close(V.l11Euler1, Math.sqrt(1 + (Math.PI / 2) ** 2), 1e-9)),
      claim('l11Euler4', 'and 1.332 for N = 4', () => close(V.l11Euler4, (1 + (Math.PI / 8) ** 2) ** 2, 1e-9)),
      claim('l11Euler64', 'and 1.0195 for N = 64', () => close(V.l11Euler64, (1 + (Math.PI / 128) ** 2) ** 32, 1e-9)),
    ],
  },
]

/* ---------------------------------------------------------------------------------------------- */
/* l11-schrodinger — The Schrödinger equation                                                      */
/* ---------------------------------------------------------------------------------------------- */

const schrodinger: Beat[] = [
  {
    id: 'l11-schrodinger:b1',
    phase: 'lecture',
    text: '$U(t)$ says where the state is after a time $t$. Ask instead how fast it is changing at each instant. Starting from one tiny wait leads to the [[schrodinger-equation|Schrödinger equation]].',
    caption: 'the running example: $|{+x}\\rangle$ waiting under $H = \\mathrm{diag}(3\\varepsilon, \\varepsilon)$, shown at $t = 0$ as one dial per amplitude',
    stage: eq(0),
    derivation: {
      result: 'i\\hbar\\,\\frac{d}{dt}|\\psi(t)\\rangle = H|\\psi(t)\\rangle',
      ground: [
        {
          tex: '|\\psi(t+dt)\\rangle = \\left(I - \\tfrac{i}{\\hbar}H\\,dt\\right)|\\psi(t)\\rangle',
          why: 'One tiny wait, applied to the state we hold at time $t$.',
          view: eq(0),
          viewCaption: 'the state at time $t = 0$',
        },
        {
          tex: '|\\psi(t+dt)\\rangle = |\\psi(t)\\rangle - \\tfrac{i}{\\hbar}H|\\psi(t)\\rangle\\,dt',
          why: 'Multiply out the bracket.',
        },
        {
          tex: '|\\psi(t+dt)\\rangle - |\\psi(t)\\rangle = -\\tfrac{i}{\\hbar}H|\\psi(t)\\rangle\\,dt',
          why: 'Subtract the state we started from, on both sides.',
        },
        {
          tex: '\\frac{|\\psi(t+dt)\\rangle - |\\psi(t)\\rangle}{dt} = -\\tfrac{i}{\\hbar}H|\\psi(t)\\rangle',
          why: 'Divide by $dt$ to get the change per unit time. Both dials have turned a little, by different amounts.',
          view: eq(10),
          viewCaption: 'a little later: each dial has turned by its own amount',
        },
        {
          tex: '\\frac{d}{dt}|\\psi(t)\\rangle = -\\tfrac{i}{\\hbar}H|\\psi(t)\\rangle',
          why: 'Let $dt$ shrink to zero. The left side becomes the rate of change of the state.',
        },
        {
          tex: 'i\\hbar\\,\\frac{d}{dt}|\\psi(t)\\rangle = H|\\psi(t)\\rangle',
          why: 'Multiply both sides by $i\\hbar$.',
        },
      ],
    },
  },
  {
    id: 'l11-schrodinger:b2',
    phase: 'lecture',
    text: 'This is not a new law. For a time-independent $H$, the equation and $U(t) = e^{-iHt/\\hbar}$ say the same thing in two forms. One gives the state after a finite time. The other gives how fast it changes at each instant.',
    caption: 'time is read as the angle $\\varepsilon t/\\hbar$: at $10^\\circ$ the dial of $|{+z}\\rangle$ has turned $-30^\\circ$ and the other $-10^\\circ$ · at $t = 0$ the $|{+z}\\rangle$ amplitude changes at the rate $-3i$ in units of $\\varepsilon/\\hbar$',
    stage: eq(10),
    claims: [
      claim('l11FD', 'a finite difference of U(t)|+x⟩ equals −iH U(t)|+x⟩ (h = 10⁻⁶)', () => V.l11FD === 1),
      claim('l11DerivZ', 'the |+z⟩ amplitude changes at −3i at t = 0', () => close(V.l11DerivZ, -3)),
    ],
  },
  {
    id: 'l11-schrodinger:b3',
    phase: 'lecture',
    text: 'The object that evolves is the state itself. It may be a spin, a three-spin entangled state, or, later, the wavefunction of a particle. The Hamiltonian gives the direction in which the state moves at each instant.',
    caption: `the same two dials, now running from $\\varepsilon t/\\hbar = 0^\\circ$ to $45^\\circ$: each keeps its length ${d(V.l11AmpLen, 3)}`,
    stage: eq(0, 45),
    claims: [claim('l11AmpLen', 'each amplitude of |+x⟩ keeps the size 1/√2 = 0.707 as the dials turn', () => close(V.l11AmpLen, Math.SQRT1_2))],
  },
  {
    id: 'l11-schrodinger:b4',
    phase: 'lecture',
    text: 'The structure is the same as for rotations. For a rotation, $d|\\psi\\rangle/d\\varphi = -\\tfrac{i}{\\hbar}S_z|\\psi\\rangle$. For waiting, $d|\\psi\\rangle/dt = -\\tfrac{i}{\\hbar}H|\\psi\\rangle$. So $S_z$ drives the change as the angle grows, and $H$ drives it as time passes.',
    caption: 'the rotation side of the comparison: the point turns about $z$ as the angle $\\varphi$ grows',
    stage: bl('+x', { rotate: { axis: 'z', angleDeg: sweep(0, 90) }, trail: true }),
    claims: [claim('l11DerivRz', 'the generator of R_z(φ) is S_z', () => V.l11DerivRz === 1)],
  },
  {
    id: 'l11-schrodinger:b5',
    phase: 'books',
    text: 'Susskind and Friedman note that the equation for a wavefunction of position and time is a special case. They give its time-independent partner, $H|E_j\\rangle = E_j|E_j\\rangle$ for the states of definite energy. Their recipe: write $|\\psi(0)\\rangle$ as a sum of those states, then give each term its own factor $e^{-iE_jt/\\hbar}$.',
    caption: 'the recipe at $\\varepsilon t/\\hbar = 30^\\circ$: the $|{+z}\\rangle$ term has phase $-90^\\circ$ and the $|{-z}\\rangle$ term $-30^\\circ$',
    stage: eq(30),
    refs: [susskind('§4.12–4.13', 'The wavefunction equation as a special case; the time-independent equation H|E_j⟩ = E_j|E_j⟩; and the recipe of expanding in energy eigenstates and attaching e^{−iE_jt/ħ}.')],
    claims: [
      claim('l11PhaseUp30', 'at εt/ħ = 30° the |+z⟩ term has phase −90°', () => close(V.l11PhaseUp30, -90, 1e-9)),
      claim('l11PhaseDown30', 'and the |−z⟩ term −30°', () => close(V.l11PhaseDown30, -30, 1e-9)),
    ],
  },
  {
    id: 'l11-schrodinger:b6',
    phase: 'clue',
    text: 'The equation is first order in time. What fixes the whole future?',
    stage: eq(0),
    reveal: {
      text: 'The state at one instant. Unlike Newton’s law, no separate starting velocity is needed: the equation itself supplies the rate $d|\\psi\\rangle/dt = -\\tfrac{i}{\\hbar}H|\\psi\\rangle$.',
      caption: 'one state, one rule: the dials know where to go',
      stage: eq(0, 45),
    },
  },
]

/* ---------------------------------------------------------------------------------------------- */
/* l11-stationary — Energy eigenstates stand still                                                 */
/* ---------------------------------------------------------------------------------------------- */

const stationary: Beat[] = [
  {
    id: 'l11-stationary:b1',
    phase: 'lecture',
    text: 'Suppose $|E\\rangle$ is an [[energy-eigenstate|energy eigenstate]]: $H|E\\rangle = E|E\\rangle$. Every power of $H$ then just multiplies by $E$, and the series of Unit 6.4 sums to $e^{-iHt/\\hbar}|E\\rangle = e^{-iEt/\\hbar}|E\\rangle$.',
    caption: '$|{+z}\\rangle$ is an energy eigenstate of the example $H$, with energy $3\\varepsilon$: the overall phase turns, the point does not move',
    stage: bl('+z', { globalPhaseDeg: sweep(0, -360) }),
    fidelity: ['bloch-global-phase-hidden'],
    derivation: {
      result: 'e^{-iHt/\\hbar}|E\\rangle = e^{-iEt/\\hbar}|E\\rangle',
      ground: [
        {
          tex: 'e^{-iHt/\\hbar}|E\\rangle = \\sum_{n=0}^{\\infty}\\frac{1}{n!}\\left(\\frac{-iHt}{\\hbar}\\right)^n|E\\rangle',
          why: 'Write the exponential as the power series of Unit 6.4 and let it act on $|E\\rangle$.',
          view: bl('+z'),
          viewCaption: 'an energy eigenstate',
        },
        {
          tex: 'H^n|E\\rangle = E^n|E\\rangle',
          why: '$H$ acting on its own eigenvector only multiplies it by $E$, every time.',
        },
        {
          tex: 'e^{-iHt/\\hbar}|E\\rangle = e^{-iEt/\\hbar}|E\\rangle',
          why: 'Every term is now $|E\\rangle$ times a number, and those numbers add up to the series of $e^{-iEt/\\hbar}$.',
          view: amp({ dir: '+z' }, { globalPhaseDeg: -90 }),
          viewCaption: 'the dial has turned; the bar has not changed',
        },
      ],
    },
    claims: [claim('l11StatZ', '|+z⟩ only gains a phase: same state, P(+z) = 1 and ⟨H⟩ = 3 at every sampled time', () => V.l11StatZ === 1)],
  },
  {
    id: 'l11-stationary:b2',
    phase: 'lecture',
    text: 'The ket gained only an overall phase, and an overall phase changes no probability, as Unit 1.5 and Unit 7.2 showed. So $|E\\rangle$ is a [[stationary-state|stationary state]]: every prediction about it is the same at every time. The ket itself is not constant; its phase turns.',
    caption: `one dial turns while its bar stays at length ${d(V.l11StatProb, 0)}: the chance $P(+z)$ is ${d(V.l11StatProb, 0)} at every time`,
    stage: amp({ dir: '+z' }, { globalPhaseDeg: sweep(0, -540) }),
    claims: [claim('l11StatProb', 'P(+z) = 1 at every sampled time', () => close(V.l11StatProb, 1))],
  },
  {
    id: 'l11-stationary:b3',
    phase: 'lecture',
    text: 'If every state only gained an overall phase, nothing would ever happen. Observable change needs a [[relative-phase|relative phase]] between the parts of a [[superposition|superposition]], the idea behind every equator state in Unit 6.2.',
    caption: 'after $\\varepsilon t/\\hbar = 45^\\circ$ the two dials differ by $90^\\circ$',
    stage: eq(0, 45),
    claims: [claim('l11RelPhase45', 'at εt/ħ = 45° the relative phase is 90°', () => close(V.l11RelPhase45, 90, 1e-9))],
  },
  {
    id: 'l11-stationary:b4',
    phase: 'books',
    text: `Susskind and Friedman show that energy is conserved because $H$ commutes with itself. The average energy $\\langle H\\rangle$ never changes, even for a state that moves. The chances ${uf(V.l11WeightConst)} and ${uf(1 - V.l11WeightConst)} of the two energies stay put, and an overall phase factor can be ignored.`,
    caption: 'for $|{+x}\\rangle$, $\\langle H\\rangle$ stays at $2\\varepsilon$, the midpoint of the two levels, while the state moves',
    stage: op({ op: HEX, eigen: true }),
    refs: [susskind('§4.8, §4.10', 'Energy conservation: the average of H is constant in time, also for states that move; an overall phase factor can be dropped.')],
    claims: [
      claim('l11EnergyConst', '⟨H⟩ for |+x⟩ is 2 at εt/ħ = 0°, 30°, 45° and 90°', () => close(V.l11EnergyConst, 2, 1e-9)),
      claim('l11WeightConst', 'the two energies of |+x⟩ have chance ½ and ½ at every sampled time', () => close(V.l11WeightConst, 0.5, 1e-9)),
    ],
  },
  {
    id: 'l11-stationary:b5',
    phase: 'clue',
    text: 'Prepare $|{-z}\\rangle$ and wait. What changes?',
    stage: bl('-z'),
    reveal: {
      text: 'Only its overall phase, $e^{-iEt/\\hbar}$ with $E = \\varepsilon$ the energy of $|{-z}\\rangle$. The chance $P(-z)$ stays 1, and the point stays at the south pole.',
      caption: 'the phase turns, the point does not move',
      stage: bl('-z', { globalPhaseDeg: sweep(0, -180) }),
      fidelity: ['bloch-global-phase-hidden'],
      claims: [claim('l11StatMinus', 'P(−z) = 1 after any wait from |−z⟩', () => close(V.l11StatMinus, 1))],
    },
  },
]

/* ---------------------------------------------------------------------------------------------- */
/* l11-two-level — Two energies make the arrow turn                                                */
/* ---------------------------------------------------------------------------------------------- */

const twoLevel: Beat[] = [
  {
    id: 'l11-two-level:b1',
    phase: 'lecture',
    text: 'A [[two-level-system|two-level system]] has just two energies. Take $|{+z}\\rangle$ and $|{-z}\\rangle$ as its energy eigenstates, with $E_\\pm = \\bar E \\pm \\hbar\\omega/2$. Here $\\bar E$ is the [[mean-energy|mean energy]], and the [[angular-frequency|angular frequency]] $\\omega$ is set by the gap. In the $z$ basis $H = \\mathrm{diag}(E_+, E_-) = \\bar E I + \\tfrac{\\hbar\\omega}{2}\\sigma_z$.',
    caption: `the energy ladder of the example: the {{up|upper level}} is $3\\varepsilon$, the {{lo|lower level}} is $\\varepsilon$, and the {{hw|splitting}} is $\\hbar\\omega = ${d(V.l11HbarOmega, 0)}\\varepsilon$ around $\\bar E = ${d(V.l11Mean, 0)}\\varepsilon$`,
    stage: K(0, { show: ['levels'] }),
    terms: { up: t('clocks', 'level-upper'), lo: t('clocks', 'level-lower'), hw: t('clocks', 'gap-arrow') },
    fidelity: ['clocks-ladder-zero'],
    claims: [
      claim('l11Mean', 'Ē = (3ε + ε)/2 = 2ε', () => close(V.l11Mean, 2)),
      claim('l11HbarOmega', 'ħω = 3ε − ε = 2ε', () => close(V.l11HbarOmega, 2)),
    ],
  },
  {
    id: 'l11-two-level:b2',
    phase: 'lecture',
    text: 'The notes write $Z$ for $\\sigma_z$, and $\\cong$ for “is the same state as” (equal up to an overall phase). Now solve it. $I$ and $Z$ commute, so the exponential splits. The $\\bar E$ factor is an overall phase, and the other factor is the rotation $R_z(\\omega t)$.',
    caption: 'at $\\varepsilon t/\\hbar = 30^\\circ$ the turn is $R_z(60^\\circ)$, because $\\omega t = 60^\\circ$; the overall phase is left out of the table · rows and columns follow $|{+z}\\rangle$, $|{-z}\\rangle$',
    stage: mx(RZ60),
    derivation: {
      result: 'U(t) \\cong R_z(\\omega t)',
      ground: [
        {
          tex: 'H = \\bar E\\,I + \\tfrac{\\hbar\\omega}{2}Z',
          why: 'The Hamiltonian of the two-level system, with the two energies as its diagonal.',
          view: K(0, { show: ['levels'] }),
          viewCaption: 'the two energies, their mean and their splitting',
        },
        {
          tex: 'e^{-iHt/\\hbar} = e^{-i\\bar Et/\\hbar}\\,e^{-i\\omega tZ/2}',
          why: '$I$ commutes with $Z$, so the exponential of the sum is the product of the two exponentials.',
        },
        {
          tex: 'U(t) \\cong e^{-i\\omega tZ/2}',
          why: 'The first factor is a number of size 1 multiplying the whole ket: an overall phase. It changes no prediction, so drop it.',
        },
        {
          tex: 'e^{-i\\omega tZ/2} = R_z(\\omega t)',
          why: 'This is the rotation operator of Unit 6.3 with the angle $\\varphi = \\omega t$.',
          view: mx(RZ60),
          viewCaption: 'the rotation $R_z(60^\\circ)$',
        },
        {
          tex: 'U(t) \\cong R_z(\\omega t)',
          why: 'Up to an overall phase, waiting turns the Bloch arrow about $z$ through the angle $\\omega t$.',
        },
      ],
    },
    claims: [claim('l11UisRz', 'U(t) = e^{−iĒt/ħ} R_z(ωt) at εt/ħ = 30° and 77°', () => V.l11UisRz === 1)],
  },
  {
    id: 'l11-two-level:b3',
    phase: 'lecture',
    text: 'Start in $|{+x}\\rangle = (|{+z}\\rangle + |{-z}\\rangle)/\\sqrt2$. Each part carries its own [[phase-clock|phase clock]], turning clockwise at its energy over $\\hbar$: $|\\psi(t)\\rangle = \\tfrac{1}{\\sqrt2}\\left(|{+z}\\rangle\\,e^{-iE_+t/\\hbar} + |{-z}\\rangle\\,e^{-iE_-t/\\hbar}\\right)$. The upper clock turns three times as fast as the lower one.',
    caption: `at $\\varepsilon t/\\hbar = 30^\\circ$ the two {{ck|hands}} sit at $-90^\\circ$ and $-30^\\circ$: a {{gp|gap}} of $${d(V.l11Gap30, 0)}^\\circ$`,
    stage: K(sweep(0, 30), { readouts: ['phases', 'gap'] }),
    terms: { ck: t('clocks', 'clock-upper'), gp: t('clocks', 'gap-dial') },
    fidelity: ['clocks-both-turn'],
    claims: [
      claim('l11Hand30Up', 'at εt/ħ = 30° the |+z⟩ hand is at −90°', () => close(V.l11Hand30Up, -90, 1e-9)),
      claim('l11Hand30Down', 'and the |−z⟩ hand at −30°', () => close(V.l11Hand30Down, -30, 1e-9)),
      claim('l11Gap30', 'a gap of 60°', () => close(V.l11Gap30, 60, 1e-9)),
    ],
  },
  {
    id: 'l11-two-level:b4',
    phase: 'lecture',
    text: 'The notes call the azimuth $\\theta(t)$; here it is $\\varphi(t)$, because $\\theta$ always means the angle from $+z$ (Unit 7.1). Factor out the overall phases $e^{-i\\bar Et/\\hbar}$ and $e^{-i\\omega t/2}$. What is left is the equator state of Unit 6.2, with azimuth $\\varphi(t) = \\omega t$.',
    caption: `at $\\omega t = 60^\\circ$ the {{ar|arrow}} is at $(${d(V.l11R30x, 1)},\\ ${d(V.l11R30y, 3)},\\ ${d(V.l11R30z, 0)})$; at $\\omega t = 90^\\circ$ it points along $+y$`,
    stage: K(30, { readouts: ['gap'] }),
    terms: { ar: t('clocks', 'top-arrow') },
    derivation: {
      result: '\\varphi(t) = \\omega t',
      ground: [
        {
          tex: '|\\psi(t)\\rangle = \\tfrac{1}{\\sqrt2}\\left(|{+z}\\rangle\\,e^{-iE_+t/\\hbar} + |{-z}\\rangle\\,e^{-iE_-t/\\hbar}\\right)',
          why: 'The state with its two clocks, as in the last beat.',
          view: K(30, { readouts: ['gap'] }),
          viewCaption: 'two hands, 60° apart at $\\varepsilon t/\\hbar = 30^\\circ$',
        },
        {
          tex: 'E_\\pm = \\bar E \\pm \\tfrac{\\hbar\\omega}{2}',
          why: 'Write both energies with the mean and the splitting.',
        },
        {
          tex: '|\\psi(t)\\rangle \\cong \\tfrac{1}{\\sqrt2}\\left(|{+z}\\rangle + e^{i\\omega t}|{-z}\\rangle\\right)',
          why: 'Factor out $e^{-i\\bar Et/\\hbar}e^{-i\\omega t/2}$, an overall phase. The relative factor left on $|{-z}\\rangle$ is $e^{+i\\omega t}$.',
          view: bl('+x', { rotate: { axis: 'z', angleDeg: 60 }, shot: 'B-POLE' }),
          viewCaption: 'the equator state at azimuth $60^\\circ$, seen from above',
        },
        {
          tex: '\\varphi(t) = \\omega t',
          why: 'The state $(|{+z}\\rangle + e^{i\\varphi}|{-z}\\rangle)/\\sqrt2$ sits at azimuth $\\varphi$ on the equator, so the azimuth grows as $\\omega t$.',
        },
      ],
    },
    claims: [
      claim('l11R30x', 'at ωt = 60° the arrow has x = 0.5', () => close(V.l11R30x, 0.5)),
      claim('l11R30y', 'and y = sin 60° = 0.866', () => close(V.l11R30y, Math.sqrt(3) / 2)),
      claim('l11R30z', 'and z = 0', () => close(V.l11R30z, 0)),
      claim('l11R45y', 'at ωt = 90° the arrow has y = 1', () => close(V.l11R45y, 1)),
    ],
  },
  {
    id: 'l11-two-level:b5',
    phase: 'lecture',
    text: 'The arrow turns about $z$ at $\\omega = (E_+ - E_-)/\\hbar$, the [[precession|precession]] of Unit 1.1. The central message: energy eigenstates gain only overall phases, while a superposition of different energies gains a changing relative phase. That relative phase is all the observable motion.',
    caption: `one lap of the arrow takes $\\varepsilon t/\\hbar = ${d(V.l11LapDeg, 0)}^\\circ$, since $\\omega = 2\\varepsilon/\\hbar$`,
    stage: bl('+x', { rotate: { axis: 'z', angleDeg: sweep(0, 360) }, trail: true, shot: 'B-POLE' }),
    fidelity: ['bloch-phase-is-longitude'],
    claims: [claim('l11LapDeg', 'one lap takes εt/ħ = 180° for ħω = 2ε', () => close(V.l11LapDeg, 180, 1e-9))],
  },
  {
    id: 'l11-two-level:b6',
    phase: 'lecture',
    text: 'Today closed one chapter and opened another. The turns of Lectures 6 and 7 were already time evolution: the Hamiltonian says which turn nature performs as time passes. Next the same equation is applied to a particle, whose state is a wavefunction of position and time.',
    caption: 'the whole lap, from the clocks’ side: the two hands and the arrow, from $0^\\circ$ to $180^\\circ$',
    stage: K(sweep(0, 180)),
  },
  {
    id: 'l11-two-level:b7',
    phase: 'books',
    text: 'Susskind and Friedman treat a spin in a magnetic field along $z$. Its Hamiltonian is proportional to $\\sigma_z$, so the averages $\\langle\\sigma_x\\rangle$ and $\\langle\\sigma_y\\rangle$ precess like a gyroscope while $\\langle\\sigma_z\\rangle$ stays put. Each single reading is still $+1$ or $-1$.',
    caption: '$\\langle S_z\\rangle$ stays at 0 as the point goes round',
    stage: bl('+x', { rotate: { axis: 'z', angleDeg: sweep(0, 360) }, readouts: ['averages'] }),
    refs: [susskind('§4.11', 'A spin in a field along z has H proportional to σ_z; the averages of σ_x and σ_y precess while σ_z is constant, and each single reading is still ±1.')],
    claims: [claim('l11SzConst', '⟨S_z⟩ stays 0 throughout the turn', () => close(V.l11SzConst, 0, 1e-9))],
  },
  {
    id: 'l11-two-level:b8',
    phase: 'clue',
    text: 'After one period $T = 2\\pi/\\omega$ the arrow is back at $+x$. Is the ket back too?',
    stage: K(180),
    reveal: {
      text: 'Not quite. $U(T) = -e^{-i\\bar ET/\\hbar}I$, and for our energies $U(T) = -I$ exactly. The same state with a different ket: the [[full-turn-sign|full-turn sign]] of Unit 7.2.',
      caption: 'the arrow has made one lap; the ket carries the sign $-1$',
      stage: { kind: 'hopf', fibers: 'one', marked: { state: '+x', rotate: { axis: 'z', angleDeg: 360 } }, mini: true, shot: 'HF-FIBER' },
      fidelity: ['hopf-fiber-state'],
      claims: [
        claim('l11UT', 'U(T) = −I for 3ε and ε', () => V.l11UT === 1),
        claim('l11UTx', '⟨+x|U(T)|+x⟩ = −1', () => close(V.l11UTx, -1)),
      ],
    },
  },
  {
    id: 'l11-two-level:b9',
    phase: 'clue',
    text: 'Raise both energies by the same amount. Does any prediction change?',
    stage: K(30, { readouts: ['gap', 'px'] }),
    reveal: {
      text: `No. $\\bar E$ only multiplies the ket by an overall phase: both clocks run faster, but their gap does not change. At $\\omega t = 60^\\circ$ the chance $P(+x)$ is ${d(V.l11Px60, 2)} for both pairs of levels.`,
      caption: 'levels $6\\varepsilon$ and $4\\varepsilon$: faster hands, the same gap and the same arrow',
      stage: K(30, { levels: { upper: 6, lower: 4 }, readouts: ['gap', 'px'] }),
      fidelity: ['clocks-both-turn'],
      claims: [
        claim('l11Px60', 'P(+x) at ωt = 60° is 0.75 for levels 3ε and ε', () => close(V.l11Px60, 0.75)),
        claim('l11Px60Shift', 'and 0.75 for levels 6ε and 4ε', () => close(V.l11Px60Shift, 0.75)),
        claim('l11Gap60Shift', 'with the same gap of 60°', () => close(V.l11Gap60Shift, 60, 1e-9)),
      ],
    },
  },
  {
    id: 'l11-two-level:b10',
    phase: 'deeper',
    text: `Beyond the notes: an $x$ magnet would see the motion. The chance of $+x$ is $P(+x;t) = |\\langle{+x}|\\psi(t)\\rangle|^2 = \\cos^2(\\omega t/2)$, and the average is $\\langle S_x\\rangle = \\tfrac{\\hbar}{2}\\cos\\omega t$. At $\\omega t = 0^\\circ$, $60^\\circ$, $90^\\circ$ and $180^\\circ$ the chance is ${d(V.l11PxT0, 0)}, ${d(V.l11Px60, 2)}, ${d(V.l11PxT90, 1)} and ${d(V.l11PxT180, 0)}. The average is $${d(V.l11SxT0, 1)}\\hbar$, $${d(V.l11SxT60, 2)}\\hbar$, $0$ and $-${d(V.l11SxT180Mag, 1)}\\hbar$. Waiting under this $H$ is the gate $R_z(\\omega t)$ of a quantum computer. <<sl-q4-one-qubit-gates|Go further in 709: R_z as a gate>>`,
    caption: 'the point goes round once; the $x$ magnet’s chance and average follow the cosine',
    stage: bl('+x', { rotate: { axis: 'z', angleDeg: sweep(0, 360) }, measure: 'x', readouts: ['averages'] }),
    refs: [lecture('L11 p. 2 (§11.10, planned)', 'The notes plan this calculation as an optional extension, or the start of Lecture 12, but do not carry it out.')],
    claims: [
      claim('l11PxT0', 'P(+x; 0) = 1', () => close(V.l11PxT0, 1)),
      claim('l11Px60', 'P(+x) at ωt = 60° is cos² 30° = 0.75', () => close(V.l11Px60, Math.cos(Math.PI / 6) ** 2)),
      claim('l11PxT90', 'P(+x) at ωt = 90° is ½', () => close(V.l11PxT90, 0.5)),
      claim('l11PxT180', 'P(+x) at ωt = 180° is 0', () => close(V.l11PxT180, 0, 1e-9)),
      claim('l11SxT0', '⟨S_x⟩ at ωt = 0° is 0.5ħ', () => close(V.l11SxT0, 0.5)),
      claim('l11SxT60', '⟨S_x⟩ at ωt = 60° is 0.25ħ', () => close(V.l11SxT60, 0.25)),
      claim('l11SxT90', '⟨S_x⟩ at ωt = 90° is 0', () => close(V.l11SxT90, 0, 1e-9)),
      claim('l11SxT180Mag', '⟨S_x⟩ at ωt = 180° is −0.5ħ (size 0.5ħ)', () => close(V.l11SxT180Mag, 0.5)),
    ],
  },
]

export const L11_STORY: Record<string, Beat[]> = {
  'l11-wait': wait,
  'l11-unitary': unitary,
  'l11-generator': generator,
  'l11-schrodinger': schrodinger,
  'l11-stationary': stationary,
  'l11-two-level': twoLevel,
}
