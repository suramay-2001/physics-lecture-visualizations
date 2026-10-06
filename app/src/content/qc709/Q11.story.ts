/**
 * Chapter Q11 scroll story (Physics 709; roles P + W). Beats per docs/roles/proposals/P-Q11-story.md §1, in both
 * tracks, following the rulings of docs/roles/decisions/qc709-Q10Q13.md (Φ+ is the shared resource throughout;
 * Bergou's singlet tables are [B] asides).
 *
 * Two build notes against the plan (reported to the orchestrator):
 * - `AmplitudesState` has no `inBasis` field (the §9.2 "amplitudes-fields batch" never shipped it). Every `amp(...)`
 *   view below is the plain computational-basis picture instead of a Bell-basis bar; captions describe what is
 *   actually drawn (e.g. "two bars at 01, 10" rather than "one bar: Ψ+"). Still engine-backed, still a distinct
 *   picture per step.
 * - `MatrixTableauState.tableau` rows must be Pauli strings (I/X/Y/Z per wire), so arbitrary labels like '00→I'
 *   do not fit it (the plan's own §12 Q5 flagged this risk). The correction-table beat instead shows one concrete
 *   correction operator as a `matrix{gate}` grid, with the text spelling out all four cases in words and TeX.
 * - `C_TELE`'s two measurements are NOT terminal (the classically-controlled corrections read their bits later),
 *   so every stage view built on `C_TELE` needs an explicit `outcomes` string, even before the measurement column
 *   (the resolver runs the WHOLE circuit regardless of `upTo`). Early views (upTo ≤ 5) all use `outcomes:'00'`,
 *   which does not affect the displayed pre-measurement state.
 * - The plan's own circuit-shorthand table put `C_CYCLE`'s Pauli on wire 1; this build puts it on wire 0 (Alice),
 *   agreeing with both the prose ("Alice does one gate on her qubit alone") and `teleport.ts bellCycle`'s own
 *   (op⊗I)|Φ+⟩ convention.
 * - The plan's §3 Try-it widgets propose a `{kind:'circuit', ...}` WidgetSpec; `WidgetKind` (schema.ts) has no such
 *   kind yet (W5 `protocol-runner` is correctly marked deferred). Each unit below uses an existing widget kind
 *   instead (`bloch`, `amplitude-bars`), rehearsing the same one-qubit intuition, as Q4–Q7 do for their own
 *   circuit-heavy units.
 *
 * Standing rules kept here:
 * - Every derivation list (both tracks) carries `view` on at least two steps, from kinds already shown elsewhere in
 *   the SAME unit (W-709 #7/#11).
 * - Every new space or notation has exactly one notation beat (`Beat.introduces`), at or before its glossary entry's
 *   `first` use, with a caption in both tracks (W-709 #8/#12).
 * - No TeX command outside `$…$` in learner-visible text.
 * - Every number comes from Q11.values.ts (an engine call), never a typed literal.
 * - Q10 is merged; `qc-no-signalling` is now linked directly where it is invoked (fix-pass item 5,
 *   P-Q11-review.md). Q4's no-cloning rule is still named in WORDS: Q4 never gave it its own gloss entry.
 */
import type { Circuit } from '../../physics/qc/circuit'
import type { AmpSource, AmplitudesState, BallPoint, BallState, Beat, CircuitStageState, MatrixGateName, MatrixGridState, MatrixSource, Scrub, StageLayout, StageState, TwoQubitState } from '../schema'
import { C_CYCLE, C_DC, C_SWAP, C_TELE, TELE_THETA_DEG, V, claim, close } from './Q11.values'

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
const tq = (ketSource: AmpSource, extra: Partial<Omit<TwoQubitState, 'kind' | 'source' | 'labels' | 'arrows' | 'grid'>> = {}): TwoQubitState => ({
  kind: 'two-qubit',
  source: { ket: ketSource },
  labels: 'A-B',
  arrows: 'reduced',
  grid: 'T',
  shot: 'TQ-PAIR',
  ...extra,
})
const ball = (point: BallPoint, extra: Partial<Omit<BallState, 'kind' | 'point'>> = {}): BallState => ({ kind: 'bloch-ball', point, purity: true, shot: 'B-STD', ...extra })
const split = (top: StageState, bottom: StageState): StageLayout => ({ layout: 'split', top, bottom })

const out = (k: AmpSource): MatrixSource => ({ outer: [k] })
const gateSrc = (name: MatrixGateName): MatrixSource => ({ gate: { name } })

/* Running states */
const PSI_SRC: AmpSource = { circuit: C_TELE, upTo: 3, outcomes: '00' }
const PSI_DIR: BallPoint = { thetaDeg: TELE_THETA_DEG, phiDeg: 0 }

/** Reusable claims (the handful of amplitude sizes that recur across many beats' "$\tfrac12$" / "$\tfrac14$"). */
const cHalf = claim('q11Half', 'a chance, coherence or Bloch component of size one half', () => close(V.q11Half, 0.5))
const cQuarter = claim('q11Quarter', 'a chance or branch weight of one quarter', () => close(V.q11Quarter, 0.25))

/* ---------------------------------------------------------------------------------------------- */
/* q11-bell-tools — The Bell basis as a toolkit                                                     */
/* ---------------------------------------------------------------------------------------------- */

const bellTools: Beat[] = [
  {
    id: 'q11-bell-tools:b1',
    phase: 'books',
    introduces: ['qc-bell-cycle'],
    text:
      "Alice and Bob share $\\Phi^+$ (N&C: $\\beta_{00}$; Bergou: $\\Psi_+$). Alice does one gate on her own [[qubit|qubit]] alone. A $Z$ turns the pair into $\\Phi^-$. This is the [[qc-bell-cycle|Bell cycle]]: a local Pauli walks the shared pair from one Bell state to another, without touching Bob's qubit.",
    formal:
      "On $\\Phi^+ = (|00\\rangle + |11\\rangle)/\\sqrt2$, a Pauli on [[qubit|qubit]] A alone gives $(P_A\\otimes I)|\\Phi^+\\rangle$, another Bell state (the [[qc-bell-cycle|Bell cycle]]): $Z\\otimes I$ gives $\\Phi^-$ (N&C §2.3). Only the shared state changes; Bob's reduced state stays $\\tfrac12I$, so Bob sees nothing until the qubit arrives.",
    caption: "a $Z$ on Alice's qubit: $\\Phi^+ \\to \\Phi^-$",
    captionFormal: '$(Z\\otimes I)\\Phi^+ = \\Phi^-$',
    stage: split(tq({ bell: 'Phi+' }, { local: [{ qubit: 0, gate: 'Z' }] }), amp({ bell: 'Phi-' })),
    claims: [claim('q11CycleZ', 'a $Z$ on Alice\'s qubit sends $\\Phi^+$ to $\\Phi^-$ exactly, fidelity 1', () => close(V.q11CycleZ, 1))],
  },
  {
    id: 'q11-bell-tools:b2',
    phase: 'books',
    text:
      'Try each Pauli on Alice\'s qubit. $I$ leaves $\\Phi^+$; $Z$ gives $\\Phi^-$; $X$ gives $\\Psi^+$; $Y$ gives $\\Psi^-$. Four local gates reach all four Bell states. Each is [[orthogonal|orthogonal]], so a Bell reading tells them apart 100% of the time.',
    formal:
      "$\\{I, Z, X, Y\\}\\otimes I$ map $\\Phi^+$ to $\\Phi^+, \\Phi^-, \\Psi^+, \\Psi^-$ (the phase in $Y$'s image is global, invisible to a Bell measurement). The four images are [[orthonormal-basis|orthonormal]], so one Bell measurement (Chapter Q6) distinguishes which Pauli was applied.",
    caption: '$I, Z, X, Y$: the four Bell states',
    captionFormal: '$\\{I, Z, X, Y\\}\\otimes I\\,\\Phi^+$ = the Bell basis',
    stage: split(amp({ circuit: C_CYCLE('X'), upTo: 3 }), mx(out({ bell: 'Psi+' }), { blocks: 2 })),
    derivation: {
      result: '\\{I, Z, X, Y\\}\\otimes I\\,|\\Phi^+\\rangle = \\{\\Phi^+, \\Phi^-, \\Psi^+, \\Psi^-\\}',
      ground: [
        { tex: '(I\\otimes I)|\\Phi^+\\rangle = \\Phi^+', why: 'Do nothing: the pair stays $\\Phi^+$.', view: amp({ bell: 'Phi+' }), viewCaption: 'two bars, at 00 and 11: $\\Phi^+$' },
        { tex: '(Z\\otimes I)|\\Phi^+\\rangle = \\tfrac1{\\sqrt2}(|00\\rangle - |11\\rangle) = \\Phi^-', why: '$Z$ flips the sign of the $|11\\rangle$ term.', view: amp({ circuit: C_CYCLE('Z'), upTo: 3 }), viewCaption: 'two bars, opposite sign: $\\Phi^-$' },
        { tex: '(X\\otimes I)|\\Phi^+\\rangle = \\tfrac1{\\sqrt2}(|10\\rangle + |01\\rangle) = \\Psi^+', why: "$X$ flips Alice's bit.", view: amp({ circuit: C_CYCLE('X'), upTo: 3 }), viewCaption: 'the bars move to 01, 10: $\\Psi^+$' },
        {
          tex: '(Y\\otimes I)|\\Phi^+\\rangle = \\tfrac i{\\sqrt2}(|10\\rangle - |01\\rangle) = -i\\,\\Psi^-',
          why: '$Y$ flips and signs; the overall $i$ is a [[global-phase|global phase]].',
          view: tq({ bell: 'Phi+' }, { local: [{ qubit: 0, gate: 'Y' }] }),
          viewCaption: 'the pair after $Y$: $\\Psi^-$',
        },
        { tex: '\\{I, Z, X, Y\\}\\otimes I\\,|\\Phi^+\\rangle = \\{\\Phi^+, \\Phi^-, \\Psi^+, \\Psi^-\\}', why: 'Four local gates reach all four Bell states.' },
      ],
      formal: [
        { tex: '(P\\otimes I)|\\Phi^+\\rangle,\\ P \\in \\{I, Z, X, Y\\}', why: 'A local Pauli on qubit A alone maps $\\Phi^+$ to another Bell state.', view: amp({ circuit: C_CYCLE('X'), upTo: 3 }) },
        {
          tex: '\\{I, Z, X, Y\\}\\otimes I\\,|\\Phi^+\\rangle = \\{\\Phi^+, \\Phi^-, \\Psi^+, \\Psi^-\\}',
          why: "The four images are orthonormal; $Y$'s phase is invisible to a Bell reading.",
          view: tq({ bell: 'Phi+' }, { local: [{ qubit: 0, gate: 'Y' }] }),
        },
      ],
    },
    claims: [
      claim('q11CycleI', '$I$ leaves $\\Phi^+$ unchanged, fidelity 1', () => close(V.q11CycleI, 1)),
      claim('q11CycleZ', '$Z$ gives $\\Phi^-$, fidelity 1', () => close(V.q11CycleZ, 1)),
      claim('q11CycleX', '$X$ gives $\\Psi^+$, fidelity 1', () => close(V.q11CycleX, 1)),
      claim('q11CycleY', '$Y$ gives $\\Psi^-$, fidelity 1', () => close(V.q11CycleY, 1)),
      claim('q11CycleOrtho', 'the four images are mutually orthogonal', () => close(V.q11CycleOrtho, 0, 1e-6)),
    ],
    fidelity: ['qc-amp-engine'],
  },
  {
    id: 'q11-bell-tools:b3',
    phase: 'clue',
    text: "Alice wants to turn the shared $\\Phi^+$ into $\\Psi^+ = (|01\\rangle + |10\\rangle)/\\sqrt2$. Which one gate on her qubit does it?",
    formal: 'Which single Pauli on qubit A sends $\\Phi^+$ to $\\Psi^+$?',
    stage: tq({ bell: 'Phi+' }),
    reveal: {
      text: "An $X$. It flips Alice's bit, so $|00\\rangle \\to |10\\rangle$ and $|11\\rangle \\to |01\\rangle$: the pair becomes $\\Psi^+$. A $Z$ would give $\\Phi^-$ instead.",
      formal: '$X\\otimes I$: it maps $|00\\rangle \\to |10\\rangle$, $|11\\rangle \\to |01\\rangle$, so $\\Phi^+ \\to \\Psi^+$ ($Z$ gives $\\Phi^-$, $Y$ gives $\\Psi^-$).',
      caption: '$X$ on Alice: $\\Phi^+ \\to \\Psi^+$',
      stage: amp({ circuit: C_CYCLE('X'), upTo: 3 }),
      claims: [claim('q11CycleX', 'the gate $X$ sends $\\Phi^+$ to $\\Psi^+$, fidelity 1', () => close(V.q11CycleX, 1))],
    },
  },
]

/* ---------------------------------------------------------------------------------------------- */
/* q11-dense-coding — Dense coding: two bits, one qubit                                             */
/* ---------------------------------------------------------------------------------------------- */

const denseCoding: Beat[] = [
  {
    id: 'q11-dense-coding:b1',
    phase: 'books',
    introduces: ['qc-ebit'],
    text:
      'Before any message, Alice and Bob already share a Bell pair: one [[qc-ebit|ebit]] of entanglement, set up in advance. Alice holds one qubit, Bob the other. This shared resource is what lets one qubit later carry two bits.',
    formal:
      "An [[qc-ebit|ebit]] is one shared maximally entangled pair, the unit of entanglement as a resource. Alice and Bob pre-share $\\Phi^+$; no message has yet passed, so Bob's half is $\\tfrac12I$. Dense coding spends this one ebit, plus one sent qubit, to transmit two classical bits (N&C §2.3).",
    caption: 'one shared Bell pair: an ebit, ready in advance',
    captionFormal: "a pre-shared ebit: $\\Phi^+$, Bob's half $\\tfrac12I$",
    stage: split(tq({ bell: 'Phi+' }), ball('oven')),
    claims: [claim('q11BobHalf', "Bob's half, before any message, has $|\\mathbf r| = 0$", () => close(V.q11BobHalf, 0, 1e-9))],
  },
  {
    id: 'q11-dense-coding:b2',
    phase: 'books',
    text:
      "To send two bits, Alice picks one of four gates — $I, Z, X, Y$ — on her qubit, turning the pair into one of the four Bell states. She sends her one qubit to Bob. Bob now holds both and reads the Bell state, recovering both bits.",
    formal:
      'Alice encodes two bits by $I, Z, X, Y$ on her qubit, sending $\\Phi^+$ to one of the four [[orthogonal|orthogonal]] Bell states. She sends that qubit; Bob, holding both, performs a Bell measurement and distinguishes the four with certainty, so one transmitted qubit carried two classical bits.',
    caption: 'four gates, four Bell states, two bits read',
    captionFormal: 'one qubit sent $\\Rightarrow$ two bits received',
    stage: split(circ(C_DC('X'), 6), amp({ circuit: C_DC('X'), upTo: 6 })),
    derivation: {
      result: '\\text{one sent qubit} \\Rightarrow \\text{two bits}',
      ground: [
        { tex: "\\text{share }\\Phi^+;\\ \\text{Alice picks }I, Z, X\\text{ or }Y", why: 'The pair is set up in advance; Alice chooses one gate for her two bits.', view: circ(C_DC('X'), 3), viewCaption: "after Alice's gate: a Bell state" },
        { tex: '\\Phi^+ \\to \\{\\Phi^+, \\Phi^-, \\Psi^+, \\Psi^-\\}', why: 'Her gate sends the shared pair to one of the four Bell states.', view: amp({ circuit: C_DC('X'), upTo: 3 }), viewCaption: "the two bars of her chosen Bell state" },
        { tex: '\\text{Bob Bell-measures both} \\Rightarrow \\text{reads the two bits}', why: 'Holding both qubits, Bob distinguishes the four exactly.', view: circ(C_DC('X'), 6), viewCaption: 'the two classical bits read out' },
        { tex: '\\text{one sent qubit} \\Rightarrow \\text{two bits}', why: 'One transmitted qubit carried two classical bits.' },
      ],
      formal: [
        { tex: '\\Phi^+ \\xrightarrow{\\{I,Z,X,Y\\}} \\{\\Phi^+, \\Phi^-, \\Psi^+, \\Psi^-\\}', why: 'Four orthogonal encodings, one Pauli each.', view: amp({ circuit: C_DC('X'), upTo: 3 }) },
        { tex: '\\text{one sent qubit} \\Rightarrow \\text{two bits}', why: 'A Bell measurement resolves all four with certainty.', view: circ(C_DC('X'), 6) },
      ],
    },
    claims: [claim('q11DCprob', 'every dense-coding readout is certain, probability 1', () => close(V.q11DCprob, 1))],
    fidelity: ['qc-circuit-engine-state'],
  },
  {
    id: 'q11-dense-coding:b3',
    phase: 'clue',
    text: "Eve steals Alice's qubit on its way to Bob. Can she learn the two bits from it alone?",
    formal: "An eavesdropper intercepts the one qubit Alice sends. Can she recover the two bits without Bob's half?",
    stage: tq({ circuit: C_DC('X'), upTo: 3 }),
    reveal: {
      text: 'No. One qubit of a Bell pair is just $\\tfrac12I$, a fair coin in every basis. The two bits live in the correlation between the halves, which needs both qubits to read.',
      formal:
        "No: each encoded state has reduced state $\\tfrac12I$ on Alice's qubit, independent of the bits. The information is in the joint state, so Eve with one qubit learns nothing; Bob needs both halves.",
      caption: 'one qubit alone: $\\tfrac12I$, no bits',
      stage: ball('oven'),
      claims: [claim('q11EveHalf', "the sent qubit's own reduced state has $|\\mathbf r| = 0$, for every encoding", () => close(V.q11EveHalf, 0, 1e-9))],
    },
  },
]

/* ---------------------------------------------------------------------------------------------- */
/* q11-teleport-algebra — Teleportation: the regrouping                                             */
/* ---------------------------------------------------------------------------------------------- */

const teleportAlgebra: Beat[] = [
  {
    id: 'q11-teleport-algebra:b1',
    phase: 'books',
    text:
      "Alice has a qubit in an unknown state $|\\psi\\rangle$. She wants Bob to have it, but can send only classical bits. She and Bob also share a Bell pair $\\Phi^+$. The three qubits start as $|\\psi\\rangle$ times $\\Phi^+$.",
    formal:
      "Alice holds $|\\psi\\rangle = \\alpha|0\\rangle + \\beta|1\\rangle$ (unknown) and one half of a shared $\\Phi^+$; Bob holds the other half. The joint state is $|\\psi\\rangle|\\Phi^+\\rangle$. Measuring $|\\psi\\rangle$ outright would not let her send it, so another route is needed.",
    caption: '$|\\psi\\rangle$ and a shared Bell pair: three qubits',
    captionFormal: '$|\\psi\\rangle|\\Phi^+\\rangle$',
    stage: amp(PSI_SRC),
  },
  {
    id: 'q11-teleport-algebra:b2',
    phase: 'books',
    text:
      "Rewrite the three-qubit state by grouping Alice's two qubits. It splits into four equal parts. In each part Alice's pair is in one Bell state. Bob's qubit holds $|\\psi\\rangle$ with a small twist: the identity, or an $X$, a $Z$, or both.",
    formal:
      "Regrouping $|\\psi\\rangle|\\Phi^+\\rangle$ in the Bell basis of Alice's two qubits gives $\\tfrac12\\sum_{xy}|\\beta_{xy}\\rangle\\,(\\sigma|\\psi\\rangle)$, where $\\sigma$ is $I$, $X$, $Z$ or $XZ$. Bob's twist is $XZ$; undoing it takes $ZX$, $X$ first. Each of the four terms carries weight $\\tfrac14$ in probability.",
    caption: "four equal parts: Bob has $|\\psi\\rangle$, lightly twisted",
    captionFormal: '$\\tfrac12\\sum_{xy}|\\beta_{xy}\\rangle(\\sigma|\\psi\\rangle)$',
    stage: split(amp({ circuit: C_TELE, upTo: 5, outcomes: '00' }), circ(C_TELE, 5, { outcomes: '00' })),
    claims: [
      claim('q11TwistFid00', "the branch 00's pre-correction Bob state is $|\\psi\\rangle$ itself, fidelity 1", () => close(V.q11TwistFid00, 1)),
      claim('q11TwistFid01', "the branch 01's pre-correction Bob state is $X|\\psi\\rangle$, fidelity 1", () => close(V.q11TwistFid01, 1)),
      claim('q11TwistFid10', "the branch 10's pre-correction Bob state is $Z|\\psi\\rangle$, fidelity 1", () => close(V.q11TwistFid10, 1)),
      claim('q11TwistFid11', "the branch 11's pre-correction Bob state is $ZX|\\psi\\rangle$, fidelity 1", () => close(V.q11TwistFid11, 1)),
    ],
    fidelity: ['qc-amp-engine', 'qc-circuit-engine-state'],
    derivation: {
      result: '|\\psi\\rangle|\\Phi^+\\rangle = \\tfrac12\\sum_{xy}|\\beta_{xy}\\rangle(\\sigma_{xy}|\\psi\\rangle)',
      ground: [
        { tex: '|\\psi\\rangle|\\Phi^+\\rangle = \\tfrac1{\\sqrt2}(\\alpha|0\\rangle + \\beta|1\\rangle)(|00\\rangle + |11\\rangle)', why: 'Three qubits: the data qubit and the shared pair.', view: amp({ circuit: C_TELE, upTo: 3, outcomes: '00' }), viewCaption: 'eight bars: $\\psi\\otimes\\Phi^+$' },
        { tex: "\\text{CNOT then H on Alice's two qubits}", why: "Rotate Alice's pair into the measurement basis.", view: amp({ circuit: C_TELE, upTo: 5, outcomes: '00' }), viewCaption: 'after CNOT + H' },
        { tex: '= \\tfrac12\\sum_{xy}|xy\\rangle(\\sigma_{xy}|\\psi\\rangle)', why: "Regrouped: four equal parts, Bob's qubit twisted in each.", view: circ(C_TELE, 5, { outcomes: '00' }), viewCaption: 'the circuit at the regrouping' },
        { tex: '\\sigma_{00} = I,\\ \\sigma_{01} = X,\\ \\sigma_{10} = Z,\\ \\sigma_{11} = XZ', why: "Each of the four parts twists Bob's qubit by one Pauli; the $11$ twist is $XZ$, undone by $ZX$, $X$ first." },
        { tex: '|\\psi\\rangle|\\Phi^+\\rangle = \\tfrac12\\sum_{xy}|\\beta_{xy}\\rangle(\\sigma_{xy}|\\psi\\rangle)', why: "Bob holds $|\\psi\\rangle$ up to a Pauli set by Alice's own reading." },
      ],
      formal: [
        { tex: '|\\psi\\rangle|\\Phi^+\\rangle = \\tfrac12\\sum_{xy}|xy\\rangle(\\sigma_{xy}|\\psi\\rangle)', why: 'After CNOT + H, the computational regrouping.', view: amp({ circuit: C_TELE, upTo: 5, outcomes: '00' }) },
        { tex: '= \\tfrac12\\sum_{xy}|\\beta_{xy}\\rangle(\\sigma_{xy}|\\psi\\rangle)', why: "In Alice's Bell basis; $\\sigma_{xy} \\in \\{I, X, Z, ZX\\}$.", view: circ(C_TELE, 5, { outcomes: '00' }) },
      ],
    },
  },
  {
    id: 'q11-teleport-algebra:b3',
    phase: 'books',
    text:
      "Alice reads her two qubits and gets one of 00, 01, 10, 11, each a quarter of the time. She phones Bob the two bits. Bob then undoes the twist: nothing for 00, an $X$ for 01, a $Z$ for 10, both for 11. Now Bob has $|\\psi\\rangle$ exactly.",
    formal:
      "Alice's Bell (computational, after CNOT + H) measurement yields $M_1M_2$ with probability $\\tfrac14$ each. Bob applies $Z^{M_1}X^{M_2}$: $I$ for 00, $X$ for 01, $Z$ for 10, $ZX$ for 11, recovering $|\\psi\\rangle$ with fidelity 1. The two classical bits are the whole message.",
    caption: '00 nothing, 01 $X$, 10 $Z$, 11 both',
    captionFormal: 'Bob applies $Z^{M_1}X^{M_2}$, fidelity 1',
    stage: mx(gateSrc('Z')),
    claims: [
      claim('q11TeleP', "each of Alice's four outcomes has probability a quarter", () => close(V.q11TeleP, 0.25)),
      claim('q11TeleFid', 'after the right correction, fidelity is exactly 1', () => close(V.q11TeleFid, 1)),
    ],
  },
  {
    id: 'q11-teleport-algebra:b4',
    phase: 'clue',
    text: "Alice's two qubits read 10. Which gate must Bob apply to recover $|\\psi\\rangle$?",
    formal: 'For outcome $M_1M_2 = 10$, what is the correction $Z^{M_1}X^{M_2}$?',
    stage: circ(C_TELE, 6, { outcomes: '10' }),
    reveal: {
      text: "A $Z$. The first bit is 1, so $Z^1 = Z$; the second is 0, so $X^0 = I$. Bob applies $Z$ alone, turning $Z|\\psi\\rangle$ back into $|\\psi\\rangle$.",
      formal: '$Z^1X^0 = Z$: $Z^2 = I$, so a single $Z$ restores $|\\psi\\rangle$ from the twisted $Z|\\psi\\rangle$.',
      caption: 'outcome 10: Bob applies $Z$',
      stage: split(mx(gateSrc('Z')), circ(C_TELE, 8, { outcomes: '10' })),
      claims: [claim('q11TeleFid10', 'the correction for outcome 10 gives fidelity 1', () => close(V.q11TeleFid10, 1))],
    },
  },
]

/* ---------------------------------------------------------------------------------------------- */
/* q11-teleport-circuit — Teleportation: the circuit and the call                                   */
/* ---------------------------------------------------------------------------------------------- */

const teleportCircuit: Beat[] = [
  {
    id: 'q11-teleport-circuit:b1',
    phase: 'books',
    text:
      "Here is the whole protocol as a circuit. Alice runs a CNOT from $|\\psi\\rangle$ onto her Bell half, then a Hadamard, then measures both her qubits. Two classical wires carry the bits to Bob, who runs an $X$ and a $Z$ switched by those bits.",
    formal:
      "The teleportation circuit: CNOT from $A_1$ to $A_2$, then H on $A_1$, then measure $A_1, A_2$; the two classical bits control $X$ then $Z$ on Bob's qubit. The pre-measurement rotation is exactly the Bell measurement of Chapter Q6, run as CNOT + H + readout: <<qc-l3-postulates|what a measurement does to a state>>.",
    caption: 'CNOT, H, measure, then switched $X$ and $Z$',
    captionFormal: 'CNOT + H + readout, then $Z^{M_1}X^{M_2}$',
    stage: circ(C_TELE, 6, { outcomes: '00' }),
    claims: [claim('q11TeleP', "the probability of this measured branch is one quarter", () => close(V.q11TeleP, 0.25))],
    fidelity: ['qc-circuit-wires-are-time'],
  },
  {
    id: 'q11-teleport-circuit:b2',
    phase: 'books',
    introduces: ['qc-teleport-correction'],
    text:
      "The two classically controlled gates are the [[qc-teleport-correction|correction]] $Z^{M_1}X^{M_2}$: raise $Z$ to the first bit and $X$ to the second. The bits are ordinary classical data, sent by phone or fibre. Without the call, Bob cannot choose the right gate.",
    formal:
      "The [[qc-teleport-correction|correction]] $Z^{M_1}X^{M_2}$ reads the two measured bits as exponents: $X^{M_2}$ first, then $Z^{M_1}$. The [[qc-classical-channel|classical channel]] carrying $M_1M_2$ is indispensable; it limits the protocol to light speed, as [[qc-no-signalling|no-signalling]] demands.",
    caption: '$Z^{M_1}X^{M_2}$: the bits pick the gates',
    captionFormal: '$Z^{M_1}X^{M_2}$, the two bits as exponents',
    stage: split(circ(C_TELE, 8, { outcomes: '11' }), amp({ circuit: C_TELE, upTo: 8, outcomes: '11' })),
    claims: [claim('q11TeleFid11', 'the correction for outcome 11 gives fidelity 1', () => close(V.q11TeleFid11, 1))],
  },
  {
    id: 'q11-teleport-circuit:b3',
    phase: 'books',
    text:
      "Before Bob hears the two bits, his qubit is the centre of the ball, $\\tfrac12I$ — a fair coin. It holds no hint of $|\\psi\\rangle$. Only after the classical call, when he applies the right gate, does his qubit become $|\\psi\\rangle$. So nothing travelled faster than light.",
    formal:
      "Averaged over Alice's four outcomes, Bob's pre-correction state is $\\mathrm{Tr}_{A}\\rho = \\tfrac12I$, independent of $|\\psi\\rangle$, exactly what [[qc-no-signalling|no-signalling]] requires. Only after the classical bits arrive and the correction is applied does Bob hold $|\\psi\\rangle$: the classical channel, bounded by $c$, carries the usable information.",
    caption: 'before the call: Bob is $\\tfrac12I$',
    captionFormal: 'pre-correction $\\rho_B = \\tfrac12I$, no $|\\psi\\rangle$ yet',
    stage: ball('oven', { compare: PSI_DIR }),
    claims: [claim('q11BobPre', "Bob's pre-correction state has $|\\mathbf r| = 0$", () => close(V.q11BobPre, 0, 1e-9))],
    fidelity: ['ball-born-inside'],
    derivation: {
      result: '\\rho_B^{\\mathrm{pre}} = \\tfrac12 I,\\quad \\rho_B^{\\mathrm{post}} = |\\psi\\rangle\\langle\\psi|',
      ground: [
        {
          tex: '\\rho_B^{\\mathrm{pre}} = \\mathrm{Tr}_{A_1A_2}\\big(\\tfrac14\\sum_{xy}|\\beta_{xy}\\rangle\\langle\\beta_{xy}|\\otimes\\sigma_{xy}|\\psi\\rangle\\langle\\psi|\\sigma_{xy}^\\dagger\\big)',
          why: "Average over Alice's four unread outcomes.",
          view: amp({ circuit: C_TELE, upTo: 6, outcomes: '00' }),
          viewCaption: 'one branch (00): Alice measured, Bob untouched',
        },
        { tex: '= \\tfrac14\\sum_{xy}\\sigma_{xy}|\\psi\\rangle\\langle\\psi|\\sigma_{xy}^\\dagger = \\tfrac12 I', why: 'The four Pauli-twisted copies average to the centre.', view: ball('oven'), viewCaption: 'Bob: $\\tfrac12 I$, no $|\\psi\\rangle$ yet' },
        { tex: "\\text{after the call: Bob applies }\\sigma_{xy},\\ \\rho_B^{\\mathrm{post}} = |\\psi\\rangle\\langle\\psi|", why: 'The correction turns the centre into $|\\psi\\rangle$.', view: ball(PSI_DIR), viewCaption: 'after correction: $|\\psi\\rangle$' },
        { tex: '\\rho_B^{\\mathrm{pre}} = \\tfrac12 I,\\quad \\rho_B^{\\mathrm{post}} = |\\psi\\rangle\\langle\\psi|', why: 'No information reaches Bob until the classical bits do.' },
      ],
      formal: [
        { tex: '\\rho_B^{\\mathrm{pre}} = \\tfrac14\\sum_{xy}\\sigma_{xy}|\\psi\\rangle\\langle\\psi|\\sigma_{xy}^\\dagger = \\tfrac12 I', why: 'The Pauli twirl of any state is the maximally mixed state.', view: ball('oven') },
        { tex: '\\rho_B^{\\mathrm{pre}} = \\tfrac12 I,\\ \\rho_B^{\\mathrm{post}} = |\\psi\\rangle\\langle\\psi|', why: 'Only the classical channel, bounded by $c$, carries the state.', view: ball(PSI_DIR) },
      ],
    },
  },
  {
    id: 'q11-teleport-circuit:b4',
    phase: 'books',
    text:
      "Teleportation does not copy $|\\psi\\rangle$. Alice's measurement destroys her qubit's state — it ends up as a plain 0 or 1. There is never a moment with two copies of $|\\psi\\rangle$, so no information is duplicated.",
    formal:
      "After the protocol Alice's data qubit is left in a computational basis state, a measured 0 or 1, not $|\\psi\\rangle$: the state moves, it is not copied. At no stage do two systems both hold $|\\psi\\rangle$, respecting the no-cloning rule of Chapter Q4.",
    caption: "Alice's qubit ends as 0 or 1, not $|\\psi\\rangle$",
    captionFormal: 'the state moves; no copy ever exists',
    stage: split(amp({ circuit: C_TELE, upTo: 6, outcomes: '10' }), ball(PSI_DIR)),
    claims: [claim('q11AliceGone', "Alice's data qubit, for outcome $M_1 = 1$, is exactly $|1\\rangle$", () => close(V.q11AliceGone, 1))],
  },
  {
    id: 'q11-teleport-circuit:b5',
    phase: 'clue',
    text: "After teleportation, do two qubits hold $|\\psi\\rangle$ — Alice's and Bob's?",
    formal: "Does teleportation leave $|\\psi\\rangle$ on both Alice's and Bob's qubits, duplicating it?",
    stage: ball(PSI_DIR),
    reveal: {
      text: "No. Only Bob's qubit holds $|\\psi\\rangle$. Alice's measurement collapsed her qubit to a plain 0 or 1, so there is one copy, not two. The state was moved, not duplicated.",
      formal: "No: Alice's qubit is a computational basis state after her measurement, so exactly one copy of $|\\psi\\rangle$ exists, on Bob's qubit. Teleportation transfers the state; it never clones it.",
      caption: "one copy, on Bob; Alice's is gone",
      stage: split(amp({ circuit: C_TELE, upTo: 6, outcomes: '10' }), ball(PSI_DIR)),
      claims: [claim('q11AliceGone', "Alice's data qubit is $|1\\rangle$, not $|\\psi\\rangle$", () => close(V.q11AliceGone, 1))],
    },
  },
]

/* ---------------------------------------------------------------------------------------------- */
/* q11-swapping — Entanglement swapping and repeaters                                               */
/* ---------------------------------------------------------------------------------------------- */

const swapping: Beat[] = [
  {
    id: 'q11-swapping:b1',
    phase: 'books',
    text:
      'Alice shares a Bell pair with Bob, and Bob shares another with Charlie. Alice and Charlie have never met. Bob holds one qubit from each pair. Bob performs a Bell measurement on his two qubits.',
    formal: "Alice–Bob share $|\\Phi^+\\rangle$ and Bob–Charlie share $|\\Phi^+\\rangle$; Alice and Charlie are unentangled. Bob holds $B_1, B_2$ and performs a Bell measurement on them.",
    caption: 'two Bell pairs, Bob in the middle',
    captionFormal: '$|\\Phi^+\\rangle|\\Phi^+\\rangle$, Bob reads $B_1B_2$',
    stage: circ(C_SWAP, 4),
  },
  {
    id: 'q11-swapping:b2',
    phase: 'books',
    text:
      "Rewrite the four qubits by grouping Bob's pair. Whatever Bell state Bob reads, Alice and Charlie are left in the matching Bell state — entangled, though they never interacted. Bob phones them his result so they know which pair they share.",
    formal:
      "Grouping $B_1B_2$ in the Bell basis, $|\\Phi^+\\rangle|\\Phi^+\\rangle = \\tfrac12\\sum_{xy}|\\beta_{xy}\\rangle|\\beta_{xy}\\rangle$: Bob's outcome leaves A and C in the same Bell state, each with probability $\\tfrac14$. Alice and Charlie are now entangled, without ever interacting.",
    caption: 'Bob reads a Bell state; A and C share the same one',
    captionFormal: '$\\tfrac12\\sum_{xy}|\\beta_{xy}\\rangle|\\beta_{xy}\\rangle$',
    stage: split(circ(C_SWAP, 7, { outcomes: '00' }), tq({ bell: 'Phi+' })),
    claims: [
      claim('q11SwapP', "each of Bob's four outcomes has probability a quarter", () => close(V.q11SwapP, 0.25)),
      claim('q11SwapAc00', 'when Bob reads 00, Alice and Charlie share exactly $\\Phi^+$', () => close(V.q11SwapAc00, 1)),
    ],
    fidelity: ['qc-tq-grid-signed'],
    derivation: {
      result: '|\\Phi^+\\rangle|\\Phi^+\\rangle = \\tfrac12\\sum_{xy}|\\beta_{xy}\\rangle|\\beta_{xy}\\rangle',
      ground: [
        { tex: '|\\Phi^+\\rangle|\\Phi^+\\rangle', why: 'Two separate Bell pairs; A and C are not yet linked.', view: circ(C_SWAP, 4), viewCaption: 'two $\\Phi^+$ pairs' },
        { tex: '= \\tfrac12\\sum_{xy}|\\beta_{xy}\\rangle|\\beta_{xy}\\rangle', why: "Regroup Bob's two qubits in the Bell basis.", view: circ(C_SWAP, 6), viewCaption: "after Bob's CNOT + H" },
        { tex: '\\text{Bob reads }\\beta_{xy} \\Rightarrow A, C\\text{ in }\\beta_{xy}', why: 'Each outcome leaves A and C in the matching Bell state.', view: tq({ bell: 'Phi+' }), viewCaption: 'A and C: the Bell pair they now share' },
        { tex: '|\\Phi^+\\rangle|\\Phi^+\\rangle = \\tfrac12\\sum_{xy}|\\beta_{xy}\\rangle|\\beta_{xy}\\rangle', why: 'A and C are entangled, though they never met.' },
      ],
      formal: [
        { tex: 'B_1B_2\\text{ in the Bell basis: } = \\tfrac12\\sum_{xy}|\\beta_{xy}\\rangle|\\beta_{xy}\\rangle', why: "Regrouping in Bob's own Bell basis.", view: circ(C_SWAP, 6) },
        {
          tex: '|\\Phi^+\\rangle|\\Phi^+\\rangle = \\tfrac12\\sum_{xy}|\\beta_{xy}\\rangle|\\beta_{xy}\\rangle',
          why: 'Each outcome, probability $\\tfrac14$, swaps the entanglement onto A, C.',
          view: tq({ bell: 'Phi+' }),
        },
      ],
    },
  },
  {
    id: 'q11-swapping:b3',
    phase: 'books',
    text:
      'Swapping extends entanglement over distance. A fibre loses photons, so a direct link fails past about a hundred kilometres (Bergou p. 39). Chain swaps instead: link A to B, B to C, swap at B, and A and C share a pair across twice the distance.',
    formal:
      'Entanglement over a fibre degrades with length, capping a direct link near 100 km (Bergou p. 39). A quantum repeater chains swaps: each node Bell-measures and announces, extending shared entanglement across many links without amplifying the signal. This builds long-distance quantum networks.',
    caption: 'chain swaps: entanglement across many links',
    captionFormal: 'repeaters: swap and announce, link by link',
    stage: circ(C_SWAP, 7, { outcomes: '00' }),
    claims: [claim('q11SwapP', 'one repeater swap: probability a quarter for this outcome', () => close(V.q11SwapP, 0.25))],
  },
  {
    id: 'q11-swapping:b4',
    phase: 'clue',
    text: "Right after Bob's measurement but before he phones, are Alice and Charlie already entangled?",
    formal: "Immediately after Bob's Bell measurement, before any classical call, do Alice and Charlie share a usable entangled state?",
    stage: circ(C_SWAP, 7, { outcomes: '00' }),
    reveal: {
      text: 'Their two qubits are in a definite Bell state, but they cannot use it: they do not know which one until Bob calls. Averaged over his outcomes, each of A and C alone is still $\\tfrac12I$, and the averaged A–C pair itself is $\\tfrac14I$: not entangled at all.',
      formal: "A and C are in a definite Bell state, but which one is unknown without Bob's two bits; their marginal states are $\\tfrac12I$, so no information has travelled: [[qc-no-signalling|no-signalling]] holds.",
      caption: 'entangled, but unusable until Bob calls',
      stage: tq({ bell: 'Phi+' }),
      claims: [claim('q11SwapAc00', "A and C's state matches Bob's own Bell outcome exactly", () => close(V.q11SwapAc00, 1))],
    },
  },
]

/* ---------------------------------------------------------------------------------------------- */
/* q11-qudit — Larger alphabets (Formal)                                                            */
/* ---------------------------------------------------------------------------------------------- */

const qudit: Beat[] = [
  {
    id: 'q11-qudit:b1',
    phase: 'books',
    introduces: ['qc-qudit-space', 'qc-weyl-bell'],
    text:
      'These tricks are not just for qubits. Replace the two-level qubit with an $N$-level [[qc-qudit-space|qudit]], and there is still a full set of maximally entangled states to build on. For two levels this set is just the four Bell states.',
    formal:
      "On $\\mathbb C^N\\otimes\\mathbb C^N$ (two [[qc-qudit-space|qudits]]) the [[qc-weyl-bell|generalized Bell basis]] is $|\\chi_{n, m}\\rangle = \\tfrac1{\\sqrt N}\\sum_{j}e^{2\\pi ijn/N}|j\\rangle|j \\oplus m\\rangle$. The $N^2$ states are orthonormal, and dense coding and teleportation generalize to send $\\log_2N^2$ bits per qudit.",
    caption: 'bigger alphabets: still a full entangled basis',
    captionFormal: '$|\\chi_{n, m}\\rangle = \\tfrac1{\\sqrt N}\\sum_j e^{2\\pi ijn/N}|j\\rangle|j \\oplus m\\rangle$',
    stage: split(mx(out({ bell: 'Phi+' }), { blocks: 2 }), amp({ bell: 'Phi+' })),
    claims: [
      claim('q11WeylOrtho2', 'the four $N = 2$ generalized Bell states are orthonormal', () => close(V.q11WeylOrtho2, 0, 1e-9)),
      claim('q11WeylOrtho3', 'the nine $N = 3$ generalized Bell states are orthonormal', () => close(V.q11WeylOrtho3, 0, 1e-9)),
    ],
    derivation: {
      result: "\\langle\\chi_{n, m}|\\chi_{n', m'}\\rangle = \\delta_{nn'}\\delta_{mm'}",
      ground: [
        { tex: 'N = 2:\\ |\\chi_{n, m}\\rangle = \\{\\Phi^+, \\Phi^-, \\Psi^+, \\Psi^-\\}', why: 'For two levels, the generalized basis is just the Bell basis.', view: amp({ bell: 'Phi+' }), viewCaption: 'the $N=2$ case: one Bell state' },
        { tex: "\\langle\\chi_{n, m}|\\chi_{n', m'}\\rangle = \\delta_{nn'}\\delta_{mm'}", why: 'They are [[orthonormal-basis|orthonormal]], exactly as the Bell states are.', view: mx(out({ bell: 'Phi+' }), { blocks: 2 }), viewCaption: '$|\\Phi^+\\rangle\\langle\\Phi^+|$, one of four orthogonal projectors' },
      ],
      formal: [
        { tex: '|\\chi_{n, m}\\rangle = \\tfrac1{\\sqrt N}\\sum_j e^{2\\pi ijn/N}|j\\rangle|j \\oplus m\\rangle', why: 'The generalized (Weyl) Bell basis on $\\mathbb C^N\\otimes\\mathbb C^N$.', view: amp({ bell: 'Phi+' }) },
        { tex: "\\langle\\chi_{n, m}|\\chi_{n', m'}\\rangle = \\delta_{nn'}\\delta_{mm'}", why: 'The $m$ index sets the shift, $n$ the phases; $N^2$ orthonormal states.', view: mx(out({ bell: 'Phi+' }), { blocks: 2 }) },
      ],
    },
  },
]

/* ---------------------------------------------------------------------------------------------- */

export const Q11_STORY: Record<string, Beat[]> = {
  'q11-bell-tools': bellTools,
  'q11-dense-coding': denseCoding,
  'q11-teleport-algebra': teleportAlgebra,
  'q11-teleport-circuit': teleportCircuit,
  'q11-swapping': swapping,
  'q11-qudit': qudit,
}

/**
 * Unit-level claims (plan §0's reusable "Name / Source / Value" constants, as Q8's `cHalf`/`cQuarter`): in scope
 * for every beat, reveal and the review card of that unit, so a bare "$\tfrac12$" or "$\tfrac14$" anywhere in the
 * unit's prose or a derivation line is backed without re-attaching a claim at every single site.
 */
export const Q11_UNIT_CLAIMS_BY_ID: Record<string, ReturnType<typeof claim>[]> = {
  'q11-bell-tools': [cHalf, cQuarter],
  'q11-dense-coding': [cHalf, cQuarter],
  'q11-teleport-algebra': [cHalf, cQuarter],
  'q11-teleport-circuit': [cHalf, cQuarter],
  'q11-swapping': [cHalf, cQuarter],
  'q11-qudit': [cHalf, cQuarter],
}
