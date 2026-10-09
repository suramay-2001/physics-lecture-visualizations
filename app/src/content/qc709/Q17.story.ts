/**
 * Chapter Q17 scroll story (Physics 709; roles P + W). Beats per docs/roles/proposals/P-Q17-story.md §1, in both tracks, with the judge's
 * rulings (docs/roles/decisions/qc709-Q15Q17.md): the `grover-plane` kind is built (R1); the running example is N = 8, x₀ = 101 (R2); the circuit's
 * third column is labelled −U₀, "flip all but 000", and the caption says the sign is a global phase (R3); the four Correction boxes live in Q17.ts (R4);
 * the optimality unit is in both tracks (R5); k* is N&C's closest-integer rule, named in the text (R6); the Try-its are one-qubit stand-ins (R7).
 *
 * Build notes against the plan (reported to the orchestrator):
 * - Phase `'books'` throughout (no 709 notes yet): ramp beats are `books`, the clues are `clue`.
 * - Theorem 1's picture proof (q17-two-reflections:b3) asks for the two mirror lines, so every `proof` view also passes `mirrors: ['x0perp', 'w0']`.
 * - A matrix cell prints two decimals, so a caption that describes a drawn table quotes two ($0.66$); the text quotes $0.6614$.
 * - The threshold "one half" of the optimality unit is written in words (a half written as a number would need a claim of its own, and it is a threshold,
 *   not a result); $k^*$'s rule is written $\mathrm{CI}((\pi - 2\alpha)/(4\alpha))$, which equals N&C's $\mathrm{CI}(\arccos\sqrt{M/N}/\theta)$ and has no half in it.
 * - The plan's Q16 prerequisites (Walsh sums, "oracle-kickback") are cited through the Q5 glosses that exist today (`qc-walsh-hadamard`, `qc-phase-oracle`).
 *
 * Standing rules kept here: every derivation (both tracks) carries `view` on at least two steps, from kinds already shown in the SAME unit (W-709 #11); exactly one
 * notation beat per new space/notation (W-709 #12); no TeX command outside `$…$`; every number comes from Q17.values.ts (an engine call), never a typed literal;
 * cross-chapter references are named in words or via existing glossary ids and bridges, never plan ids.
 */
import type { Circuit } from '../../physics/qc/circuit'
import type { AmplitudesState, Beat, CircuitStageState, GroverPlaneState, MatrixGridState, MatrixSource, Scrub, StageLayout, StageState } from '../schema'
import { C_D, C_G, C_G4, TWO_A, V, claim, close, d } from './Q17.values'

/* ---------------------------------------------------------------------------------------------- */
/* Stage shorthand (plan "Stage shorthand"), as plain builder functions                              */
/* ---------------------------------------------------------------------------------------------- */
const circ = (C: Circuit, upTo: Scrub): CircuitStageState => ({ kind: 'circuit', circuit: C, upTo, shot: 'Q-WIRES' })
const amp = (C: Circuit, upTo: Scrub, mode: AmplitudesState['mode']): AmplitudesState => ({ kind: 'amplitudes', state: { circuit: C, upTo }, mode, shot: 'A-BARS' })
const gp = (k: Scrub, extra: Partial<Omit<GroverPlaneState, 'kind' | 'search' | 'k'>> = {}): GroverPlaneState => ({ kind: 'grover-plane', search: { n: 3 }, k, shot: 'G-PLANE', ...extra })
const gp10 = (k: Scrub, extra: Partial<Omit<GroverPlaneState, 'kind' | 'search' | 'k'>> = {}): GroverPlaneState => ({ kind: 'grover-plane', search: { n: 10 }, k, shot: 'G-PLANE', ...extra })
const mx = (source: MatrixSource): MatrixGridState => ({ kind: 'matrix', source, labels: 'none', values: 'decimal', shot: 'M-GRID' })
const split = (top: StageState, bottom: StageState): StageLayout => ({ layout: 'split', top, bottom })

/** The mirror in the horizontal axis (U_f on the plane): diag(1, −1). */
const R0: MatrixSource = { pauli: 'Z' }
/** The mirror through |w₀⟩ (the diffusion on the plane): cos 2α Z + sin 2α X, the angle 2α computed in code from `groverAngle`. */
const RW: MatrixSource = {
  lin: [
    { c: { trig: 'cos', angleDeg: TWO_A, name: '2α' }, src: { pauli: 'Z' } },
    { c: { trig: 'sin', angleDeg: TWO_A, name: '2α' }, src: { pauli: 'X' } },
  ],
}
const MIRRORS: ('x0perp' | 'w0')[] = ['x0perp', 'w0']

/* ---------------------------------------------------------------------------------------------- */
/* q17-oracle — A black box that marks one item                                                      */
/* ---------------------------------------------------------------------------------------------- */

const oracle: Beat[] = [
  {
    id: 'q17-oracle:b1',
    phase: 'books',
    text:
      'A black box, the [[qc-oracle|oracle]], answers 1 for one secret string $x_0$ of $n$ bits and 0 for every other. Finding $x_0$ is the [[qc-search-problem|search problem]]. ' +
      'There are $N = 2^n$ strings, and they come in no useful order. Checking them one at a time takes about half the list on average. Grover\u2019s method needs only about $\\sqrt N$ questions.',
    formal:
      'Find the one $x_0$ with $f(x_0) = 1$ among the $N = 2^n$ strings of $n$ bits, where $f(x) = 1$ only at $x = x_0$ (Eq. 7.13, p. 120). ' +
      'Classically a number of queries of order $N$ is needed; Grover\u2019s algorithm uses a number of order $\\sqrt N$ (Bergou p. 121, after Jozsa; N&C p. 248).',
    caption: 'one search step on three wires, eight strings: the cursor is still at the start, before anything has run',
    captionFormal: '$n = 3$, $N = 8$: the circuit of one Grover step, cursor at column 0',
    stage: circ(C_G(1), 0),
  },
  {
    id: 'q17-oracle:b2',
    phase: 'books',
    text:
      'The box does not shout the answer. It flips the sign of the [[qc-marked-item|marked item]] only, as a [[qc-phase-oracle|phase oracle]] does. ' +
      `Start from an even mix of all eight strings: every amplitude is $${d(V.q17Bar, 4)}$. After the box, $101$ alone has amplitude $-${d(V.q17Bar, 4)}$. The average of the eight bars drops to $${d(V.q17MeanAfterOracle, 4)}$.`,
    formal:
      '$U_f|x\\rangle = (-1)^{f(x)}|x\\rangle = (I - 2|x_0\\rangle\\langle x_0|)|x\\rangle$, with $I$ the identity (Eq. 7.14): the [[qc-phase-oracle|phase oracle]] with one marked row, as in the earlier chapter on the Deutsch problem (N&C Eq. 6.3, p. 249). ' +
      `On the even mix, seven amplitudes stay $${d(V.q17Bar, 4)}$ and one becomes $-${d(V.q17Bar, 4)}$, so the mean falls to $${d(V.q17MeanAfterOracle, 4)}$.`,
    caption: `after the mark: the signed bars, seven at $${d(V.q17Bar, 4)}$ and the marked one at $-${d(V.q17Bar, 4)}$; the dashed mean line sits at $${d(V.q17MeanAfterOracle, 4)}$`,
    captionFormal: `$U_f$ applied to the even mix: bar $x_0 = 101$ flipped; the mean $${d(V.q17MeanAfterOracle, 4)}$`,
    stage: split(circ(C_G(1), 2), amp(C_G(1), 2, 'signed')),
    claims: [
      claim('q17Bar', 'seven of the eight bars read $0.3536$ in size', () => close(V.q17Bar, 1 / Math.sqrt(8), 1e-9)),
      claim('q17MeanAfterOracle', 'after the mark the mean amplitude is $0.2652$', () => close(V.q17MeanAfterOracle, 0.75 / Math.sqrt(8), 1e-9)),
    ],
  },
  {
    id: 'q17-oracle:b3',
    phase: 'books',
    introduces: ['qc-grover-iterate'],
    text:
      'Name the parts. The even mix of all strings is $|w_0\\rangle$. $U_f$ is the mark. $U_H$ puts an H gate on every wire. $U_0$ flips the sign of $000$ only. ' +
      'One [[qc-grover-iterate|Grover step]] $Q$ has four moves: mark the item, apply $U_H$, flip every string except $000$, apply $U_H$ again.',
    formal:
      '$U_0 = I - 2|0\\rangle\\langle0|$ and $U_H = H^{\\otimes n}$, the Hadamard gate $H$ on each of the $n$ wires (the [[qc-walsh-hadamard|Walsh\u2013Hadamard transform]]); the even mix is $|w_0\\rangle = U_H|0\\rangle$. One step is $Q = -U_HU_0U_HU_f$ (Bergou p. 121; N&C Eq. 6.5, p. 250). ' +
      'The circuit\u2019s third column flips every string except $000$: that is $-U_0$, and it carries the minus sign of $Q$.',
    caption: 'one Grover step: mark, H\u2019s, flip all but $000$ (this box is $-U_0$; its minus sign is only a [[global-phase|global phase]]), H\u2019s',
    captionFormal: 'columns 2\u20135 are $U_f$, $U_H$, $-U_0$, $U_H$; dropping the minus sign changes $Q$ only by a [[global-phase|global phase]]',
    stage: circ(C_G(1), 5),
    claims: [claim('q17QIsCircuit', 'the circuit\u2019s step equals $-U_HU_0U_HU_f$ entry by entry (largest gap zero)', () => close(V.q17QIsCircuit, 0, 1e-9))],
  },
  {
    id: 'q17-oracle:b4',
    phase: 'clue',
    text: 'Read the register right after the first mark. Is $x_0$ more likely than a blind guess?',
    formal: 'What is the chance of reading $x_0$ after $U_f$ alone acts on $|w_0\\rangle$?',
    stage: amp(C_G(1), 1, 'probability'),
    reveal: {
      text: `No: every string still has chance $${d(V.q17Blind, 3)}$. A sign changes no chance. The rest of the step must turn the sign into a bigger amplitude.`,
      formal:
        `$|\\langle x|U_f|w_0\\rangle|^2 = 1/N = ${d(V.q17Blind, 3)}$ for every $x$: a phase oracle is invisible to one reading. The second half of $Q$ converts the sign into amplitude.`,
      caption: `after the mark every chance is still $${d(V.q17Blind, 3)}$`,
      captionFormal: `$|\\langle x|U_f|w_0\\rangle|^2 = ${d(V.q17Blind, 3)}$ for all eight $x$`,
      stage: split(circ(C_G(1), 2), amp(C_G(1), 2, 'probability')),
      claims: [claim('q17Blind', 'after the mark each of the eight strings still has chance $0.125$', () => close(V.q17Blind, 1 / 8, 1e-9))],
    },
  },
]

/* ---------------------------------------------------------------------------------------------- */
/* q17-plane — The whole search in one flat plane                                                    */
/* ---------------------------------------------------------------------------------------------- */

const plane: Beat[] = [
  {
    id: 'q17-plane:b1',
    phase: 'books',
    introduces: ['qc-grover-plane'],
    text:
      'Draw the [[qc-grover-plane|Grover plane]]. Up is $|x_0\\rangle$, the marked string. Across is $|x_0^\\perp\\rangle$, the even mix of the seven others. ' +
      `The start $|w_0\\rangle$ sits at an angle $\\alpha$ above the across axis. Here $\\sin\\alpha = ${d(V.q17SinA, 4)}$, so $\\alpha = ${d(V.q17AlphaDeg, 2)}°$.`,
    formal:
      'Take the basis $|x_0\\rangle$ and $|x_0^\\perp\\rangle = (|w_0\\rangle - \\langle x_0|w_0\\rangle|x_0\\rangle)/\\sqrt{1 - 1/N}$ (Bergou p. 121; the printed sign is a plus, see the Corrections box). ' +
      `Then $|w_0\\rangle = \\sin\\alpha|x_0\\rangle + \\cos\\alpha|x_0^\\perp\\rangle$ (Eq. 7.17), with $\\sin\\alpha = 1/\\sqrt N = ${d(V.q17SinA, 4)}$ and $\\cos\\alpha = ${d(V.q17CosA, 4)}$. N&C write $\\theta/2$ for $\\alpha$ (p. 252).`,
    caption: `the plane: $|w_0\\rangle$ at $\\alpha = ${d(V.q17AlphaDeg, 2)}°$ above the across axis; its shadow on the up axis is $${d(V.q17SinA, 3)}$ long, and squared it is $${d(V.q17StartChance, 3)}$`,
    captionFormal: `$|w_0\\rangle$ at angle $\\alpha$; shadow $\\sin\\alpha = ${d(V.q17SinA, 3)}$ on $|x_0\\rangle$, chance $\\sin^2\\alpha = ${d(V.q17StartChance, 3)}$`,
    stage: gp(0, { arcs: ['alpha'], readouts: ['angle', 'success'] }),
    claims: [
      claim('q17SinA', 'the start\u2019s shadow on the marked axis is $0.3536$', () => close(V.q17SinA, 1 / Math.sqrt(8), 1e-9)),
      claim('q17AlphaDeg', 'so the start sits at $20.70°$', () => close(V.q17AlphaDeg, (Math.asin(1 / Math.sqrt(8)) * 180) / Math.PI, 1e-9)),
      claim('q17CosA', 'its part along the other axis is $0.9354$', () => close(V.q17CosA, Math.sqrt(7 / 8), 1e-9)),
      claim('q17StartChance', 'the shadow squared, the start\u2019s chance of reading $x_0$, is $0.125$', () => close(V.q17StartChance, 1 / 8, 1e-9)),
    ],
    fidelity: ['qc-gp-shadow'],
    derivation: {
      result: '\\sin\\alpha = 1/\\sqrt N,\\ \\cos\\alpha = \\sqrt{1 - 1/N}',
      ground: [
        {
          tex: '\\sin^2\\alpha = \\text{chance of } x_0 = \\tfrac{1}{N}',
          why: 'The shadow of $|w_0\\rangle$ on the up axis, squared, is the chance of $x_0$, and all $N$ strings are equally likely.',
          view: amp(C_G(1), 1, 'probability'),
          viewCaption: 'the even mix: every string has the same chance',
        },
        {
          tex: '\\sin\\alpha = \\tfrac{1}{\\sqrt N}',
          why: 'Take the square root of both sides.',
          view: gp(0),
          viewCaption: 'the start at angle $\\alpha$',
        },
        {
          tex: '\\cos^2\\alpha = 1 - \\sin^2\\alpha = 1 - \\tfrac{1}{N}',
          why: `The arrow has length 1, so the squares of its two parts add to 1; for $N = 8$ this gives $\\cos\\alpha = ${d(V.q17CosA, 4)}$.`,
          view: gp(0, { arcs: ['alpha'] }),
          viewCaption: 'the right triangle with the arrow as its long side',
          claims: [claim('q17CosA', 'for eight strings $\\cos\\alpha = 0.9354$', () => close(V.q17CosA, Math.sqrt(7 / 8), 1e-9))],
        },
        {
          tex: '\\sin\\alpha = 1/\\sqrt N,\\ \\cos\\alpha = \\sqrt{1 - 1/N}',
          why: 'Both parts of the start are now known.',
        },
      ],
      formal: [
        {
          tex: '|x_0^\\perp\\rangle = \\frac{|w_0\\rangle - \\langle x_0|w_0\\rangle|x_0\\rangle}{\\sqrt{1 - |\\langle x_0|w_0\\rangle|^2}}',
          why: 'Gram\u2013Schmidt with a minus sign removes the $|x_0\\rangle$ part of $|w_0\\rangle$ and rescales (Bergou prints a plus sign: a slip).',
          view: gp(0),
        },
        {
          tex: '\\sin\\alpha = \\langle x_0|w_0\\rangle = 1/\\sqrt N,\\ \\cos\\alpha = \\sqrt{1 - 1/N}',
          why: 'Each string has amplitude $1/\\sqrt N$ in $|w_0\\rangle$, and $\\cos\\alpha = \\langle x_0^\\perp|w_0\\rangle = \\sqrt{1 - \\sin^2\\alpha}$.',
          view: amp(C_G(1), 1, 'probability'),
        },
      ],
    },
  },
  {
    id: 'q17-plane:b2',
    phase: 'books',
    text:
      `The mark turns $|w_0\\rangle$ into $|w_0\\rangle$ minus $${d(V.q17TwoOverRootN, 4)}$ of $|x_0\\rangle$. Call the last three moves of the step $-U_{w_0}$: it keeps $|w_0\\rangle$ and flips whatever is at right angles to it. ` +
      'Any mix $c_1|w_0\\rangle + c_2|x_0\\rangle$ of the two is sent to another mix of just these two, so the state never leaves the Grover plane.',
    formal:
      '$U_f|w_0\\rangle = |w_0\\rangle - \\tfrac{2}{\\sqrt N}|x_0\\rangle$. With $U_{w_0} = U_HU_0U_H = I - 2|w_0\\rangle\\langle w_0|$ we get $-U_{w_0}|x_0\\rangle = \\tfrac{2}{\\sqrt N}|w_0\\rangle - |x_0\\rangle$. ' +
      'So $Q$ maps $S = \\mathrm{span}\\{|w_0\\rangle, |x_0\\rangle\\}$ into itself, and real vectors to real vectors (Eq. 7.15, corrected in the Corrections box).',
    caption: `after the mark: the arrow\u2019s mirror image below the across axis, and the eight bars, seven at $${d(V.q17Bar, 4)}$ and one at $-${d(V.q17Bar, 4)}$`,
    captionFormal: 'the state after $U_f$, two ways: eight amplitudes, and one arrow beside its image in the across axis',
    stage: split(gp(0, { half: 'oracle' }), amp(C_G(1), 2, 'signed')),
    claims: [
      claim('q17TwoOverRootN', 'the mark removes $2/\\sqrt8 = 0.7071$ of $|x_0\\rangle$ from $|w_0\\rangle$', () => close(V.q17TwoOverRootN, Math.SQRT1_2, 1e-9)),
      claim('q17PlaneClosed', 'the corrected formula for $Q$ on a mix of $|w_0\\rangle$ and $|x_0\\rangle$ matches the engine\u2019s step (largest gap zero)', () => close(V.q17PlaneClosed, 0, 1e-9)),
      claim('q17Bar', 'the bars are $0.3536$ in size', () => close(V.q17Bar, 1 / Math.sqrt(8), 1e-9)),
    ],
    derivation: {
      result: 'Q(c_1|w_0\\rangle + c_2|x_0\\rangle) = c_1|w_0\\rangle + \\left(\\tfrac{2c_1}{\\sqrt N} + c_2\\right)\\left(|x_0\\rangle - \\tfrac{2}{\\sqrt N}|w_0\\rangle\\right)',
      ground: [
        {
          tex: '\\langle x_0|w_0\\rangle = \\tfrac{1}{\\sqrt N}',
          why: 'Each string has amplitude $1/\\sqrt N$ in $|w_0\\rangle$, so $|w_0\\rangle$ has that much along $|x_0\\rangle$.',
          view: amp(C_G(1), 1, 'signed'),
          viewCaption: 'the even mix before the mark',
        },
        {
          tex: 'U_f|w_0\\rangle = |w_0\\rangle - \\tfrac{2}{\\sqrt N}|x_0\\rangle',
          why: 'The mark flips the sign of the $|x_0\\rangle$ part, which takes away twice that part.',
          view: amp(C_G(1), 2, 'signed'),
          viewCaption: 'one bar flipped',
        },
        {
          tex: 'U_f(c_1|w_0\\rangle + c_2|x_0\\rangle) = c_1|w_0\\rangle - \\left(\\tfrac{2c_1}{\\sqrt N} + c_2\\right)|x_0\\rangle',
          why: 'The same step works for any mix: $c_1|w_0\\rangle$ carries $c_1/\\sqrt N$ along $|x_0\\rangle$, and the flip reverses the whole $|x_0\\rangle$ part.',
          view: gp(0, { half: 'oracle' }),
          viewCaption: 'the arrow and its mirror image',
        },
        {
          tex: '-U_{w_0}|w_0\\rangle = |w_0\\rangle,\\quad -U_{w_0}|x_0\\rangle = \\tfrac{2}{\\sqrt N}|w_0\\rangle - |x_0\\rangle',
          why: 'The last three moves keep $|w_0\\rangle$ and turn $|x_0\\rangle$ into a mix of the two.',
        },
        {
          tex: 'Q(c_1|w_0\\rangle + c_2|x_0\\rangle) = c_1|w_0\\rangle + \\left(\\tfrac{2c_1}{\\sqrt N} + c_2\\right)\\left(|x_0\\rangle - \\tfrac{2}{\\sqrt N}|w_0\\rangle\\right)',
          why: 'Put the two moves together: the answer is again a mix of $|w_0\\rangle$ and $|x_0\\rangle$.',
          view: gp(1),
          viewCaption: 'one full step later',
        },
      ],
      formal: [
        {
          tex: 'U_f|w_0\\rangle = |w_0\\rangle - \\tfrac{2}{\\sqrt N}|x_0\\rangle,\\quad U_f(c_1|w_0\\rangle + c_2|x_0\\rangle) = c_1|w_0\\rangle - \\left(\\tfrac{2c_1}{\\sqrt N} + c_2\\right)|x_0\\rangle',
          why: 'Linearity, with $\\langle x_0|w_0\\rangle = 1/\\sqrt N$.',
          view: amp(C_G(1), 2, 'signed'),
        },
        {
          tex: '-U_{w_0}|w_0\\rangle = |w_0\\rangle,\\quad -U_{w_0}|x_0\\rangle = \\tfrac{2}{\\sqrt N}|w_0\\rangle - |x_0\\rangle',
          why: 'Apply $-U_{w_0} = 2|w_0\\rangle\\langle w_0| - I$ to the two basis vectors of $S$.',
          view: gp(0, { half: 'oracle' }),
        },
        {
          tex: 'Q(c_1|w_0\\rangle + c_2|x_0\\rangle) = c_1|w_0\\rangle + \\left(\\tfrac{2c_1}{\\sqrt N} + c_2\\right)\\left(|x_0\\rangle - \\tfrac{2}{\\sqrt N}|w_0\\rangle\\right)',
          why: 'Compose the two maps: $Q = (-U_{w_0})U_f$ sends $S$ into $S$ with real coefficients (the corrected Eq. 7.15).',
          view: gp(1),
        },
      ],
    },
  },
  {
    id: 'q17-plane:b3',
    phase: 'books',
    text:
      'This is not the [[bloch-sphere|Bloch sphere]]. On the sphere, angles between states are doubled (<<qc-l7-two-angles|Spin Lab, Lecture 7>>). ' +
      'Here angles are the true angles between state vectors, and a right angle means two states that never share an answer.',
    formal:
      'The plane is a real two-dimensional slice of the full [[state-space|state space]], not a [[bloch-sphere|Bloch sphere]]. Angles in it are state angles, so the two axes sit at $90°$ here, ' +
      'where [[orthogonal|orthogonal]] states sit at $180°$ on the sphere (<<qc-l7-two-angles|Spin Lab, Lecture 7>>).',
    caption: 'the same start state two ways: one arrow at its true angle, or eight equal bars',
    captionFormal: 'the start $|w_0\\rangle$: its arrow in the plane, and its eight equal amplitudes',
    stage: split(gp(0), amp(C_G(1), 1, 'signed')),
    fidelity: ['qc-gp-not-bloch'],
  },
  {
    id: 'q17-plane:b4',
    phase: 'clue',
    text: 'The register has eight dimensions. Why does one flat picture hold the whole search?',
    formal: 'Why does a two-dimensional real picture hold the state $Q^k|w_0\\rangle$ after $k$ steps exactly?',
    stage: amp(C_G(2), 9, 'signed'),
    reveal: {
      text:
        'Each half of a step only mixes $|w_0\\rangle$ and $|x_0\\rangle$, with real numbers. The seven unmarked strings always share one amplitude, so together they act as one direction.',
      formal:
        '$U_f$ and $U_{w_0}$ preserve $S$ and real coefficients (Eq. 7.15). The unmarked amplitudes stay equal at every step, as the engine\u2019s simulation shows, so $Q^k|w_0\\rangle$ always lies in $S$.',
      caption: `two full steps: seven equal bars and one tall one; the arrow at $${d(V.q17Angle2, 1)}°$`,
      captionFormal: `$Q^2|w_0\\rangle$: the unmarked bars equal, the arrow at $${d(V.q17Angle2, 2)}°$`,
      stage: split(gp(2), amp(C_G(2), 9, 'signed')),
      claims: [
        claim('q17UnmarkedEqual', 'the seven unmarked amplitudes are equal after every step of the three-step run (spread zero)', () => close(V.q17UnmarkedEqual, 0, 1e-9)),
        claim('q17Angle2', 'after two steps the arrow sits at $103.52°$', () => close(V.q17Angle2, (5 * Math.asin(1 / Math.sqrt(8)) * 180) / Math.PI, 1e-9)),
      ],
      fidelity: ['qc-gp-slice'],
    },
  },
]

/* ---------------------------------------------------------------------------------------------- */
/* q17-two-reflections — Two mirrors make a turn                                                     */
/* ---------------------------------------------------------------------------------------------- */

const twoReflections: Beat[] = [
  {
    id: 'q17-two-reflections:b1',
    phase: 'books',
    text:
      'In the plane, the mark keeps the across part and flips the up part. That is a [[qc-reflection|mirror]] along the across axis: points on the line stay, points off it jump to the other side. ' +
      'Its table (<<qc-f3-matrix-of-map|a map written as a table>>) is $1, 0$ over $0, -1$.',
    formal:
      'Restricted to $S$, $U_f = |x_0^\\perp\\rangle\\langle x_0^\\perp| - |x_0\\rangle\\langle x_0|$: the reflection about the line through $|x_0^\\perp\\rangle$ (Bergou p. 121). ' +
      'In the basis $(|x_0^\\perp\\rangle, |x_0\\rangle)$ it is $R_{x_0^\\perp} = \\mathrm{diag}(1, -1)$.',
    caption: 'the arrow and its image in the across axis, with that mirror\u2019s table (rows and columns ordered $|x_0^\\perp\\rangle, |x_0\\rangle$)',
    captionFormal: '$R_{x_0^\\perp} = \\mathrm{diag}(1, -1)$ in the basis $(|x_0^\\perp\\rangle, |x_0\\rangle)$, beside the arrow and its image',
    stage: split(gp(0, { half: 'oracle', mirrors: ['x0perp'] }), mx(R0)),
    claims: [claim('q17R0', 'the mark\u2019s mirror table is $1, 0, 0, -1$ (largest gap from $\\mathrm{diag}(1, -1)$ zero)', () => close(V.q17R0, 0, 1e-9))],
  },
  {
    id: 'q17-two-reflections:b2',
    phase: 'books',
    text:
      'The other half of the step is a mirror too, along the line through $|w_0\\rangle$. ' +
      `For $N = 8$ its table is $${d(V.q17Cos2a, 2)}, ${d(V.q17Sin2a, 4)}$ over $${d(V.q17Sin2a, 4)}, -${d(V.q17Cos2a, 2)}$.`,
    formal:
      'On $S$, $D = -U_{w_0} = I - 2|w_0^\\perp\\rangle\\langle w_0^\\perp|$ is the reflection about the line through $|w_0\\rangle$ (Bergou prints $-U_f$ here: see the Corrections box). ' +
      'So $Q = D\\,U_f$: reflect about $|x_0^\\perp\\rangle$\u2019s line, then about $|w_0\\rangle$\u2019s (Eq. 7.16). In the plane\u2019s basis its table is $R_{w_0} = \\cos 2\\alpha\\,Z + \\sin 2\\alpha\\,X$, with $Z$ and $X$ the Pauli tables.',
    caption: `both mirrors drawn, with the arrow after one step; the second mirror\u2019s table, entries $\\cos 2\\alpha$ and $\\sin 2\\alpha$ ($${d(V.q17Cos2a, 2)}$ and $${d(V.q17Sin2a, 2)}$)`,
    captionFormal: `$R_{w_0} = \\cos 2\\alpha\\,Z + \\sin 2\\alpha\\,X$: entries $${d(V.q17Cos2a, 2)}$ and $${d(V.q17Sin2a, 2)}$ for $N = 8$`,
    stage: split(gp(1, { mirrors: MIRRORS }), mx(RW)),
    claims: [
      claim('q17Cos2a', 'the second mirror\u2019s diagonal entry is $\\cos 2\\alpha = 0.75$', () => close(V.q17Cos2a, 0.75, 1e-9)),
      claim('q17Sin2a', 'its off-diagonal entry is $\\sin 2\\alpha = 0.6614$', () => close(V.q17Sin2a, Math.sqrt(7) / 4, 1e-9)),
    ],
  },
  {
    id: 'q17-two-reflections:b3',
    phase: 'books',
    text:
      'Call the mark\u2019s mirror $R_{x_0^\\perp}$ and the other mirror $R_{w_0}$. Two mirrors that meet at angle $\\alpha$ together turn everything by $2\\alpha$, written $R(2\\alpha)$. ' +
      'A vector on the first mirror stays put, then swings by $2\\alpha$ across the second. ' +
      `One Grover step turns the arrow by $${d(V.q17TwoAlphaDeg, 2)}°$.`,
    formal:
      'Theorem 1 (Bergou p. 122): reflecting in the line $M_1$ and then in the line $M_2$, at angle $\\alpha$ from it, is a rotation by $2\\alpha$ (Fig. 7.4\u20137.5). ' +
      `Here $R_{w_0}R_{x_0^\\perp} = R(2\\alpha)$ is the rotation by $${d(V.q17TwoAlphaDeg, 2)}°$ for $N = 8$.`,
    caption: `a vector on the first mirror: kept, then swung by $2\\alpha$; the product of the two tables, $${d(V.q17Cos2a, 2)}$, $-${d(V.q17Sin2a, 2)}$ over $${d(V.q17Sin2a, 2)}$, $${d(V.q17Cos2a, 2)}$, is a turn`,
    captionFormal: `$R_{w_0}R_{x_0^\\perp} = R(2\\alpha)$: the first mirror keeps a vector on it, the second swings it by $2\\alpha$; the product table is a rotation`,
    stage: split(gp(0, { proof: 'v1', mirrors: MIRRORS }), mx({ product: [RW, R0] })),
    claims: [
      claim('q17TwoAlphaDeg', 'one step turns the arrow by $41.41°$', () => close(V.q17TwoAlphaDeg, (2 * Math.asin(1 / Math.sqrt(8)) * 180) / Math.PI, 1e-9)),
      claim('q17ProductIsRot', 'the product of the two mirror tables is the table of a turn by $2\\alpha$ (largest gap zero)', () => close(V.q17ProductIsRot, 0, 1e-9)),
      claim('q17Cos2a', 'the product\u2019s diagonal entries are $\\cos 2\\alpha = 0.75$', () => close(V.q17Cos2a, 0.75, 1e-9)),
      claim('q17Sin2a', 'its off-diagonal entries are $\\pm\\sin 2\\alpha = 0.6614$', () => close(V.q17Sin2a, Math.sqrt(7) / 4, 1e-9)),
    ],
    derivation: {
      result: 'R_{w_0}R_{x_0^\\perp} = R(2\\alpha)',
      ground: [
        {
          tex: 'R_{x_0^\\perp}v_1 = v_1',
          why: 'Take $v_1$ on the first mirror: that mirror keeps it where it is.',
          view: gp(0, { proof: 'v1', mirrors: MIRRORS }),
          viewCaption: '$v_1$ lies on the first mirror',
        },
        {
          tex: 'R_{w_0}v_1 = v_1 \\text{ turned by } 2\\alpha',
          why: 'It is $\\alpha$ short of the second mirror, so that mirror puts it $\\alpha$ beyond: a swing of $2\\alpha$.',
          view: gp(0, { proof: 'v1', mirrors: MIRRORS, arcs: ['alpha'] }),
          viewCaption: 'the second mirror swings $v_1$ by $2\\alpha$',
        },
        {
          tex: 'R_{w_0}R_{x_0^\\perp}v_2 = v_2 \\text{ turned by } 2\\alpha',
          why: 'Take $v_2$ on the second mirror: the first swings it $2\\alpha$ back, the second puts it $2\\alpha$ past its start.',
          view: gp(0, { proof: 'v2', mirrors: MIRRORS }),
          viewCaption: '$v_2$ lies on the second mirror',
        },
        {
          tex: 'R_{w_0}R_{x_0^\\perp} = R(2\\alpha)',
          why: 'Both of these two directions turn by $2\\alpha$, so every vector does.',
          view: mx({ product: [RW, R0] }),
          viewCaption: 'the product table is a turn by $2\\alpha$',
        },
      ],
      formal: [
        {
          tex: 'R_\\theta = \\cos2\\theta\\,Z + \\sin2\\theta\\,X',
          why: 'The reflection about the line at angle $\\theta$ has this table in the plane\u2019s basis.',
          view: mx(RW),
        },
        {
          tex: 'R_{w_0}R_{x_0^\\perp} = \\begin{pmatrix}\\cos2\\alpha & -\\sin2\\alpha\\\\ \\sin2\\alpha & \\cos2\\alpha\\end{pmatrix}',
          why: 'Multiply by $R_{x_0^\\perp} = Z$ on the right: $ZZ = I$ and $XZ$ is the quarter turn.',
          view: mx({ product: [RW, R0] }),
        },
        {
          tex: 'R_{w_0}R_{x_0^\\perp} = R(2\\alpha)',
          why: 'That table is the rotation by $2\\alpha$ (Theorem 1).',
          view: gp(1, { arcs: ['step'] }),
        },
      ],
    },
  },
  {
    id: 'q17-two-reflections:b4',
    phase: 'clue',
    text: 'Use the mirrors the other way round: the line through $|w_0\\rangle$ first, then the across axis. Which way does the arrow turn?',
    formal: 'What is $R_{x_0^\\perp}R_{w_0}$?',
    stage: mx({ product: [RW, R0] }),
    reveal: {
      text: `The other way, by $${d(V.q17TwoAlphaDeg, 2)}°$ clockwise. Mirrors do not commute. Grover\u2019s order turns the arrow up toward $|x_0\\rangle$.`,
      formal:
        '$R_{x_0^\\perp}R_{w_0}$ is the rotation by $-2\\alpha$, the inverse of $Q$ on $S$. Reflections do not commute; the order in Eq. 7.16 is what climbs toward $|x_0\\rangle$.',
      caption: `the reversed product, $${d(V.q17Cos2a, 2)}$, $${d(V.q17Sin2a, 2)}$ over $-${d(V.q17Sin2a, 2)}$, $${d(V.q17Cos2a, 2)}$: a turn the other way`,
      captionFormal: '$R_{x_0^\\perp}R_{w_0} = R(-2\\alpha)$',
      stage: mx({ product: [R0, RW] }),
      claims: [
        claim('q17ReverseTurn', 'the reversed product is the table of a turn by $-2\\alpha$ (largest gap zero)', () => close(V.q17ReverseTurn, 0, 1e-9)),
        claim('q17TwoAlphaDeg', 'it turns by $41.41°$ the other way', () => close(V.q17TwoAlphaDeg, (2 * Math.asin(1 / Math.sqrt(8)) * 180) / Math.PI, 1e-9)),
        claim('q17Cos2a', 'its diagonal entries are $0.75$', () => close(V.q17Cos2a, 0.75, 1e-9)),
        claim('q17Sin2a', 'its off-diagonal entries are $\\mp 0.6614$', () => close(V.q17Sin2a, Math.sqrt(7) / 4, 1e-9)),
      ],
    },
  },
]

/* ---------------------------------------------------------------------------------------------- */
/* q17-iterate — Turn until you reach the target                                                     */
/* ---------------------------------------------------------------------------------------------- */

const iterate: Beat[] = [
  {
    id: 'q17-iterate:b1',
    phase: 'books',
    text:
      `Each step adds $${d(V.q17TwoAlphaDeg, 2)}°$ to the arrow\u2019s angle. After $k$ steps it sits at $(2k+1)\\alpha$. The chance of $x_0$ is its shadow squared: $${d(V.q17P1, 4)}$ after one step and $${d(V.q17P2, 4)}$ after two.`,
    formal:
      `$Q^k|w_0\\rangle = \\sin((2k+1)\\alpha)|x_0\\rangle + \\cos((2k+1)\\alpha)|x_0^\\perp\\rangle$ (Eq. 7.18), so the chance after $k$ steps is $P_k = \\sin^2((2k+1)\\alpha)$: $${d(V.q17P1, 4)}$ and $${d(V.q17P2, 4)}$ for $k = 1, 2$ when $N = 8$.`,
    caption: `two steps: the arrow at $${d(V.q17Angle2, 1)}°$ with its earlier positions faint, chance $${d(V.q17P2, 4)}$; the bars show the same chance`,
    captionFormal: `$Q^2|w_0\\rangle$: angle $5\\alpha = ${d(V.q17Angle2, 2)}°$, chance $${d(V.q17P2, 4)}$, and the chances of the eight strings`,
    stage: split(gp(2, { trail: true, readouts: ['angle', 'success'] }), amp(C_G(2), 9, 'probability')),
    claims: [
      claim('q17P1', 'after one step the chance of $x_0$ is $0.7813$', () => close(V.q17P1, 25 / 32, 1e-9)),
      claim('q17P2', 'after two steps it is $0.9453$', () => close(V.q17P2, 121 / 128, 1e-9)),
      claim('q17TwoAlphaDeg', 'each step adds $41.41°$', () => close(V.q17TwoAlphaDeg, (2 * Math.asin(1 / Math.sqrt(8)) * 180) / Math.PI, 1e-9)),
      claim('q17Angle2', 'two steps put the arrow at $103.52°$', () => close(V.q17Angle2, (5 * Math.asin(1 / Math.sqrt(8)) * 180) / Math.PI, 1e-9)),
    ],
    fidelity: ['qc-gp-engine'],
    derivation: {
      result: 'Q^k|w_0\\rangle = \\sin((2k+1)\\alpha)|x_0\\rangle + \\cos((2k+1)\\alpha)|x_0^\\perp\\rangle',
      ground: [
        {
          tex: '|w_0\\rangle = \\sin\\alpha\\,|x_0\\rangle + \\cos\\alpha\\,|x_0^\\perp\\rangle',
          why: 'The start sits at angle $\\alpha$: its up part is $\\sin\\alpha$ and its across part is $\\cos\\alpha$.',
          view: gp(0),
          viewCaption: 'the start at $\\alpha$',
        },
        {
          tex: '\\alpha \\to 3\\alpha \\to 5\\alpha \\to \\cdots',
          why: 'Each step turns the arrow by $2\\alpha$, so its angle goes $\\alpha$, $3\\alpha$, $5\\alpha$ and on.',
          view: gp(1, { trail: true }),
          viewCaption: 'one step: $\\alpha$ to $3\\alpha$',
        },
        {
          tex: 'Q^k|w_0\\rangle = \\sin((2k+1)\\alpha)|x_0\\rangle + \\cos((2k+1)\\alpha)|x_0^\\perp\\rangle',
          why: 'After $k$ steps the angle is $(2k+1)\\alpha$, and the up part is the sine of it.',
          view: amp(C_G(2), 9, 'probability'),
          viewCaption: 'after two steps the chance of $x_0$ is the squared sine',
        },
      ],
      formal: [
        {
          tex: '|w_0\\rangle = (\\cos\\alpha, \\sin\\alpha),\\quad Q = R(2\\alpha)\\ \\text{on } S',
          why: 'Eq. 7.17 gives the start\u2019s angle and Theorem 1 gives the step.',
          view: gp(0),
        },
        {
          tex: 'Q^k|w_0\\rangle = \\sin((2k+1)\\alpha)|x_0\\rangle + \\cos((2k+1)\\alpha)|x_0^\\perp\\rangle',
          why: '$k$ rotations by $2\\alpha$ take the angle $\\alpha$ to $(2k+1)\\alpha$.',
          view: amp(C_G(2), 9, 'probability'),
        },
      ],
    },
  },
  {
    id: 'q17-iterate:b2',
    phase: 'books',
    text:
      'In bars, the last three moves of a step reflect every bar about the average, the [[qc-inversion-about-mean|inversion about the mean]]. ' +
      `Write $a_x$ for the amplitude of string $x$. After the mark the average is $${d(V.q17MeanAfterOracle, 4)}$. Each of the seven bars at $${d(V.q17Bar, 4)}$ lands at $${d(V.q17InvUnmarked, 4)}$, ` +
      `and the marked bar at $-${d(V.q17Bar, 4)}$ jumps to $${d(V.q17InvMarked, 4)}$.`,
    formal:
      '$D = 2|w_0\\rangle\\langle w_0| - I$ sends each amplitude $a_x$ to $2\\bar a - a_x$, the [[qc-inversion-about-mean|inversion about the mean]] $\\bar a$ (N&C Eq. 6.7, p. 252): ' +
      `$${d(V.q17Bar, 4)}$ goes to $${d(V.q17InvUnmarked, 4)}$, and $-${d(V.q17Bar, 4)}$ to $${d(V.q17InvMarked, 4)} = \\sin3\\alpha$.`,
    caption: `one full step: seven bars at $${d(V.q17InvUnmarked, 4)}$ and the marked bar at $${d(V.q17InvMarked, 4)}$; the dashed mean line has not moved, $${d(V.q17MeanAfterStep, 4)}$`,
    captionFormal: `$Q|w_0\\rangle = D\\,U_f|w_0\\rangle$: amplitudes $${d(V.q17InvUnmarked, 4)}$ and $${d(V.q17InvMarked, 4)}$, mean $${d(V.q17MeanAfterStep, 4)}$ (inversion keeps the mean)`,
    stage: split(circ(C_G(1), 5), amp(C_G(1), 5, 'signed')),
    claims: [
      claim('q17MeanAfterOracle', 'after the mark the average amplitude is $0.2652$', () => close(V.q17MeanAfterOracle, 0.75 / Math.sqrt(8), 1e-9)),
      claim('q17Bar', 'the seven unmarked bars are $0.3536$ before the inversion', () => close(V.q17Bar, 1 / Math.sqrt(8), 1e-9)),
      claim('q17InvUnmarked', 'after the inversion each unmarked bar is $0.1768$', () => close(V.q17InvUnmarked, 0.25 / Math.SQRT2, 1e-9)),
      claim('q17InvMarked', 'and the marked bar is $0.8839$', () => close(V.q17InvMarked, 2.5 / Math.sqrt(8), 1e-9)),
      claim('q17MeanAfterStep', 'the mean after the full step is again $0.2652$', () => close(V.q17MeanAfterStep, 0.75 / Math.sqrt(8), 1e-9)),
    ],
  },
  {
    id: 'q17-iterate:b3',
    phase: 'books',
    text:
      'Stop when the arrow is nearest to vertical. A turn of $2\\alpha$ fits $(\\pi - 2\\alpha)/(4\\alpha)$ times between $\\alpha$ and a right angle, which is $\\pi/2$ in radians. ' +
      'Take the closest whole number of steps, rounding a half down (the rule N&C use), and call it $k^*$. ' +
      `For $N = 8$ it is $k^* = ${V.q17Kopt8}$. For $N = 1024$ it is $${V.q17Kopt1024}$ steps, with chance $${d(V.q17P1024, 4)}$, while checking by hand takes hundreds. The chance of a miss, $P_{\\text{fail}}$, is at most $1/N$.`,
    formal:
      '$k^* = \\mathrm{CI}\\left(\\tfrac{\\pi - 2\\alpha}{4\\alpha}\\right)$, the closest whole number with a half rounded down (N&C Eq. 6.15, p. 253); for large $N$ this is Bergou\u2019s $\\bar n$, about $\\tfrac\\pi4\\sqrt N$ steps. ' +
      `It gives $${V.q17Kopt8}$ for $N = 8$ and $${V.q17Kopt1024}$ for $N = 1024$ (chance $${d(V.q17P1024, 4)}$). The miss chance $P_{\\text{fail}}$ is then at most $\\sin^2\\alpha = 1/N$ ($${d(V.q17Fail8, 4)} \\le ${d(V.q17FailBound8, 3)}$ here), so of order $1/N$ in total (see the Corrections box).`,
    caption: `$N = 8$: $k^* = ${V.q17Kopt8}$ steps leave the arrow $${d(V.q17Over2, 1)}°$ past vertical, where one step fewer stops $${d(V.q17Short1, 1)}°$ short; the ring marks $k^*$`,
    captionFormal: `$N = 8$, $k^* = ${V.q17Kopt8}$: $${d(V.q17Angle2, 2)}°$, $${d(V.q17Over2, 2)}°$ past vertical; chance $${d(V.q17P2, 4)}$`,
    stage: gp(2, { readouts: ['kopt', 'success'] }),
    claims: [
      claim('q17Kopt8', 'for eight strings the best number of steps is $2$', () => close(V.q17Kopt8, 2, 1e-9)),
      claim('q17Kopt1024', 'for 1024 strings it is $25$', () => close(V.q17Kopt1024, 25, 1e-9)),
      claim('q17P1024', 'after $25$ steps the chance is $0.9995$', () => close(V.q17P1024, Math.sin(51 * Math.asin(1 / 32)) ** 2, 1e-9)),
      claim('q17Fail8', 'for eight strings the miss chance after two steps is $0.0547$', () => close(V.q17Fail8, 7 / 128, 1e-9)),
      claim('q17FailBound8', 'which is below $\\sin^2\\alpha = 0.125$', () => close(V.q17FailBound8, 1 / 8, 1e-9) && V.q17Fail8 <= V.q17FailBound8),
      claim('q17Over2', 'two steps leave the arrow $13.5°$ past vertical', () => close(V.q17Over2, (5 * Math.asin(1 / Math.sqrt(8)) * 180) / Math.PI - 90, 1e-9)),
      claim('q17Short1', 'one step stops $27.9°$ short of it', () => close(V.q17Short1, 90 - (3 * Math.asin(1 / Math.sqrt(8)) * 180) / Math.PI, 1e-9)),
    ],
    derivation: {
      result: 'k^* = \\mathrm{CI}\\left(\\tfrac{\\pi - 2\\alpha}{4\\alpha}\\right),\\ P_{\\text{fail}} \\le \\sin^2\\alpha = 1/N',
      ground: [
        {
          tex: '(2k+1)\\alpha \\approx 90^\\circ',
          why: 'We want the arrow nearly vertical, so $(2k+1)\\alpha$ should be close to $90°$.',
          view: gp(2, { readouts: ['kopt'] }),
          viewCaption: 'the arrow after $k^*$ steps, with the target marked',
        },
        {
          tex: `\\tfrac{\\pi - 2\\alpha}{4\\alpha} = ${d(V.q17KoptRaw, 2)} \\to k^* = ${V.q17Kopt8}`,
          why: `For $N = 8$ the steps wanted come to $${d(V.q17KoptRaw, 2)}$, and the closest whole number is $${V.q17Kopt8}$.`,
          view: gp(2),
          viewCaption: 'two steps, the closest whole number',
          claims: [claim('q17KoptRaw', 'for eight strings the steps wanted come to $1.67$', () => close(V.q17KoptRaw, Math.PI / (4 * Math.asin(1 / Math.sqrt(8))) - 0.5, 1e-9))],
        },
        {
          tex: 'k^* = \\mathrm{CI}\\left(\\tfrac{\\pi - 2\\alpha}{4\\alpha}\\right),\\ P_{\\text{fail}} \\le \\sin^2\\alpha = 1/N',
          why: 'The closest whole number lands at most $\\alpha$ from vertical, so the chance of a miss is at most $\\sin^2\\alpha$.',
          view: gp(3),
          viewCaption: 'one step too many overshoots',
        },
      ],
      formal: [
        {
          tex: 'k^* = \\mathrm{CI}\\left(\\tfrac{\\pi - 2\\alpha}{4\\alpha}\\right)',
          why: 'Solve $(2k+1)\\alpha = \\pi/2$ for $k$ and take the closest whole number, a half rounding down (N&C Eq. 6.15).',
          view: gp(2, { readouts: ['kopt'] }),
        },
        {
          tex: 'k^* = \\mathrm{CI}\\left(\\tfrac{\\pi - 2\\alpha}{4\\alpha}\\right),\\ P_{\\text{fail}} \\le \\sin^2\\alpha = 1/N',
          why: 'The angle is then within $\\alpha$ of vertical, so $\\cos^2((2k^*+1)\\alpha) \\le \\sin^2\\alpha$.',
          view: gp(3),
        },
      ],
    },
  },
  {
    id: 'q17-iterate:b4',
    phase: 'books',
    text:
      `For $N = 4$, $\\alpha = ${d(V.q17N4Alpha, 0)}°$, so one step lands exactly on $x_0$, with chance $${d(V.q17N4P, 0)}$. ` +
      'With $M$ marked strings, $\\sin\\alpha = \\sqrt{M/N}$ and the same picture holds with a bigger angle. This is [[qc-amplitude-amplification|amplitude amplification]].',
    formal:
      `$N = 4$: $3\\alpha = 90°$, so one step gives chance $${d(V.q17N4P, 0)}$. With $M$ marked strings $\\sin\\alpha = \\sqrt{M/N}$ and $|x_0\\rangle$ becomes their even mix ([[qc-amplitude-amplification|amplitude amplification]]; N&C Eq. 6.12, p. 252): ` +
      `$N = 16$ with $M = 4$ gives $\\alpha = ${d(V.q17N4Alpha, 0)}°$ again, and one step is exact.`,
    caption: '$N = 4$ on two wires, one step: the whole chance is on $|11\\rangle$',
    captionFormal: '$N = 4$, $x_0 = 11$: after one step the chance on $|11\\rangle$ is $1$',
    stage: split(circ(C_G4, 5), amp(C_G4, 5, 'probability')),
    claims: [
      claim('q17N4P', 'for four strings one step gives chance $1$ on $x_0$', () => close(V.q17N4P, 1, 1e-9)),
      claim('q17N4Alpha', 'because $\\alpha = 30°$', () => close(V.q17N4Alpha, 30, 1e-9)),
      claim('q17M4P', 'sixteen strings with four marked also give chance $1$ after one step', () => close(V.q17M4P, 1, 1e-9)),
    ],
  },
  {
    id: 'q17-iterate:b5',
    phase: 'clue',
    text: 'Take one more step than $k^*$ for $N = 8$. Does the chance rise further?',
    formal: 'What is the chance after three steps for $N = 8$, and why?',
    stage: gp(2),
    reveal: {
      text: `No, it falls to $${d(V.q17P3, 4)}$. The arrow overshoots $|x_0\\rangle$ and keeps turning. Grover\u2019s method is a rotation, so stopping on time matters, and this is called [[qc-overshoot|overshoot]].`,
      formal: `The chance after three steps is $\\sin^2(7\\alpha) = ${d(V.q17P3, 4)}$: $Q$ is a rotation, so $P_k$ is periodic in $k$, and steps past $k^*$ lower it ([[qc-overshoot|overshoot]]).`,
      caption: `three steps: the arrow at $${d(V.q17Angle3, 1)}°$, past vertical, chance $${d(V.q17P3, 4)}$`,
      captionFormal: `$Q^3|w_0\\rangle$: angle $7\\alpha = ${d(V.q17Angle3, 2)}°$, chance $${d(V.q17P3, 4)}$`,
      stage: split(gp(3, { trail: true, readouts: ['success'] }), amp(C_G(3), 13, 'probability')),
      claims: [
        claim('q17P3', 'after three steps the chance falls to $0.3301$', () => close(V.q17P3, 169 / 512, 1e-9)),
        claim('q17Angle3', 'the arrow is at $144.93°$', () => close(V.q17Angle3, (7 * Math.asin(1 / Math.sqrt(8)) * 180) / Math.PI, 1e-9)),
      ],
    },
  },
]

/* ---------------------------------------------------------------------------------------------- */
/* q17-optimal — No algorithm can do better                                                          */
/* ---------------------------------------------------------------------------------------------- */

const optimal: Beat[] = [
  {
    id: 'q17-optimal:b1',
    phase: 'books',
    text:
      'Any search method mixes oracle calls with fixed steps of its own. To cover them all, compare each run with the same fixed steps and no oracle at all. ' +
      'For Grover\u2019s method, with no oracle the state is just $|w_0\\rangle$, and it never moves.',
    formal:
      'Write any algorithm as $|\\psi_k^x\\rangle = U_kU_x\\cdots U_1U_x|\\psi_0\\rangle$ with $U_x = I - 2|x\\rangle\\langle x|$ (Eqs. 7.19\u20137.20), and compare it with $|\\psi_k\\rangle = U_k\\cdots U_1|\\psi_0\\rangle$ through ' +
      '$D_k = \\sum_x\\lVert\\psi_k^x - \\psi_k\\rVert^2$ (Bergou p. 124). This $D_k$ is a sum of differences, not the operator $D$ of Unit 17.3.',
    caption: 'the fixed steps run twice with no oracle at all: the state is still the even mix, eight equal bars',
    captionFormal: 'the circuit without its marking columns: $|\\psi_2\\rangle = |w_0\\rangle$ exactly',
    stage: split(circ(C_D(2), 7), amp(C_D(2), 7, 'signed')),
    claims: [claim('q17DiffOnlyStill', 'the fixed steps alone leave $|w_0\\rangle$ unchanged (largest gap zero)', () => close(V.q17DiffOnlyStill, 0, 1e-9))],
  },
  {
    id: 'q17-optimal:b2',
    phase: 'books',
    text:
      'One query can add only a little to the total difference between the runs. After $k$ queries that total is at most $4k^2$. ' +
      'Grover\u2019s own run gives $4$, $14$ and $25$ for $k = 1, 2, 3$.',
    formal:
      '$D_{k+1} \\le D_k + 4\\sqrt{D_k} + 4$, so $D_k \\le 4k^2$ by induction (Eqs. 7.21\u20137.25; the middle line of Eq. 7.22 needs the weight $4$ on $|\\langle x|\\psi_k\\rangle|^2$: see the Corrections box). ' +
      'For $N = 8$, Grover\u2019s run has $D_1, D_2, D_3 = 4, 14, 25$.',
    caption: 'Grover\u2019s run after two queries (column 9): its state is the one compared with the still even mix',
    captionFormal: '$|\\psi_2^x\\rangle$ for $x = 101$ after column 9, to be compared with $|\\psi_2\\rangle = |w_0\\rangle$',
    stage: split(circ(C_G(2), 9), amp(C_G(2), 9, 'signed')),
    claims: [
      claim('q17D1', 'Grover\u2019s total difference after one query is $4$', () => close(V.q17D1, 4, 1e-9)),
      claim('q17D2', 'after two queries $14$', () => close(V.q17D2, 14, 1e-9)),
      claim('q17D3', 'and after three $25$, all within $4k^2$', () => close(V.q17D3, 25, 1e-9) && V.q17D1 <= 4 + 1e-9 && V.q17D2 <= 16 + 1e-9 && V.q17D3 <= 36 + 1e-9),
    ],
  },
  {
    id: 'q17-optimal:b3',
    phase: 'books',
    text:
      'To find every possible $x_0$ with a chance over one half, the total difference must grow like $N$. So $4k^2$ must grow like $N$, and $k$ like $\\sqrt N$. ' +
      `For $N = 1024$ that means at least $${V.q17BbbvQueries1024}$ queries.`,
    formal:
      'If $|\\langle x|\\psi_k^x\\rangle|^2$ exceeds one half for every $x$, then $D_k \\ge N(2-\\sqrt2) - 2\\sqrt N$ (Eqs. 7.26\u20137.27). With $D_k \\le 4k^2$ this gives ' +
      `$k \\ge \\tfrac{\\sqrt{2-\\sqrt2}}{2}\\sqrt N\\sqrt{1 - \\tfrac{2}{(2-\\sqrt2)\\sqrt N}}$ (Eq. 7.29), which is $${d(V.q17Bbbv1024, 2)}$ for $N = 1024$.`,
    caption: `$N = 1024$: Grover\u2019s ${V.q17Kopt1024} steps put the arrow at $${d(V.q17Angle1024, 1)}°$, near vertical, with chance $${d(V.q17P1024, 4)}$`,
    captionFormal: `$N = 1024$: $k^* = ${V.q17Kopt1024}$ gives chance $${d(V.q17P1024, 4)}$; the bound asks only for $k \\ge ${d(V.q17Bbbv1024, 2)}$`,
    stage: gp10(25, { readouts: ['angle', 'success'] }),
    claims: [
      claim('q17Bbbv1024', 'for 1024 strings the lower bound is $11.57$ queries', () => close(V.q17Bbbv1024, Math.sqrt((1024 * (2 - Math.SQRT2) - 2 * 32) / 4), 1e-9)),
      claim('q17BbbvQueries1024', 'so at least $12$ whole queries', () => close(V.q17BbbvQueries1024, 12, 1e-9)),
      claim('q17P1024', 'Grover\u2019s $25$ steps reach chance $0.9995$', () => close(V.q17P1024, Math.sin(51 * Math.asin(1 / 32)) ** 2, 1e-9)),
    ],
    derivation: {
      result: 'k \\ge \\tfrac{\\sqrt{2-\\sqrt2}}{2}\\sqrt N\\sqrt{1 - \\tfrac{2}{(2-\\sqrt2)\\sqrt N}}',
      ground: [
        {
          tex: '\\text{difference} \\le 4k^2',
          why: 'One query adds little, so after $k$ queries the total difference is at most $4k^2$.',
          view: amp(C_G(2), 9, 'signed'),
          viewCaption: 'Grover\u2019s run, to be compared with the still state',
        },
        {
          tex: '\\text{each term} \\ge 2 - \\sqrt2 - 2a_x',
          why: 'If the chance of success is over one half, each string $x$ adds at least this much. Here $a_x$ is its amplitude in the no-oracle state.',
          view: amp(C_D(2), 7, 'signed'),
          viewCaption: 'the no-oracle state and its amplitudes',
        },
        {
          tex: '\\text{difference} \\ge N(2-\\sqrt2) - 2\\sqrt N',
          why: 'Add up over all $N$ strings; the amplitude terms together come to at most $2\\sqrt N$.',
          view: gp10(12),
          viewCaption: 'twelve steps for $N = 1024$',
        },
        {
          tex: 'k \\ge \\tfrac{\\sqrt{2-\\sqrt2}}{2}\\sqrt N\\sqrt{1 - \\tfrac{2}{(2-\\sqrt2)\\sqrt N}}',
          why: `Put $4k^2$ above this lower bound and solve for $k$: it gives $${d(V.q17Bbbv1024, 2)}$ for $N = 1024$.`,
          view: gp10(25),
          viewCaption: 'Grover\u2019s $25$ steps for $N = 1024$',
          claims: [claim('q17Bbbv1024', 'for 1024 strings the bound is $11.57$', () => close(V.q17Bbbv1024, Math.sqrt((1024 * (2 - Math.SQRT2) - 2 * 32) / 4), 1e-9))],
        },
      ],
      formal: [
        {
          tex: 'D_k \\le 4k^2',
          why: 'The upper bound of Eq. 7.25.',
          view: amp(C_G(2), 9, 'signed'),
        },
        {
          tex: 'D_k \\ge N(2-\\sqrt2) - 2\\sqrt N',
          why: 'The lower bound of Eq. 7.27, from each term at least $2 - 2|\\langle x|\\psi_k\\rangle| - \\sqrt2$ and the Cauchy\u2013Schwarz inequality.',
          view: amp(C_D(2), 7, 'signed'),
        },
        {
          tex: 'k \\ge \\tfrac{\\sqrt{2-\\sqrt2}}{2}\\sqrt N\\sqrt{1 - \\tfrac{2}{(2-\\sqrt2)\\sqrt N}}',
          why: 'Combine the two bounds, $4k^2 \\ge N(2-\\sqrt2) - 2\\sqrt N$, and solve for $k$ (Eq. 7.29).',
          view: gp10(25),
        },
      ],
    },
  },
  {
    id: 'q17-optimal:b4',
    phase: 'clue',
    text: `The bound says at least $${V.q17BbbvQueries1024}$ queries for $N = 1024$. Grover uses $${V.q17Kopt1024}$. Is Grover the best possible?`,
    formal: `Reconcile $k^* = ${V.q17Kopt1024}$ with the lower bound $${d(V.q17Bbbv1024, 2)}$.`,
    stage: gp10(25),
    reveal: {
      text:
        `Yes, in how the cost grows: both scale like $\\sqrt N$. The bound only asks for a chance above one half, and Grover after $${V.q17BbbvQueries1024}$ steps sits at $${d(V.q17P12of1024, 4)}$, just below that line.`,
      formal:
        `Both are of order $\\sqrt N$; the constants differ because Eq. 7.29 asks only for success above one half. Grover\u2019s chance after $12$ steps, $${d(V.q17P12of1024, 4)}$ for $N = 1024$, shows the bound is nearly tight at that target.`,
      caption: `$N = 1024$ after $${V.q17BbbvQueries1024}$ steps: chance $${d(V.q17P12of1024, 4)}$`,
      captionFormal: `chance $${d(V.q17P12of1024, 4)}$ after $${V.q17BbbvQueries1024}$ steps for $N = 1024$`,
      stage: gp10(12, { readouts: ['success'] }),
      claims: [claim('q17P12of1024', 'after $12$ steps Grover\u2019s chance for $1024$ strings is $0.4960$', () => close(V.q17P12of1024, Math.sin(25 * Math.asin(1 / 32)) ** 2, 1e-9))],
    },
  },
]

export const Q17_STORY: Record<string, Beat[]> = {
  'q17-oracle': oracle,
  'q17-plane': plane,
  'q17-two-reflections': twoReflections,
  'q17-iterate': iterate,
  'q17-optimal': optimal,
}

/** Every claim used anywhere in a unit's beats, for Unit.claims (content.test.tsx "claims hold"). */
function allClaims(beats: Beat[]) {
  return beats.flatMap((b) => [...(b.claims ?? []), ...(b.reveal?.claims ?? []), ...(b.derivation?.ground.flatMap((s) => s.claims ?? []) ?? []), ...(b.derivation?.formal?.flatMap((s) => s.claims ?? []) ?? [])])
}
export const Q17_UNIT_CLAIMS_BY_ID: Record<string, ReturnType<typeof allClaims>> = Object.fromEntries(Object.entries(Q17_STORY).map(([id, beats]) => [id, allClaims(beats)]))
