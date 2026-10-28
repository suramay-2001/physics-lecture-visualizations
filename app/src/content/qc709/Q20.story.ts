/**
 * Chapter Q20 scroll story (Physics 709; roles P + W). Beats per docs/roles/proposals/P-Q20-story.md §1, in both tracks, under the judge's rulings
 * (docs/roles/decisions/qc709-Q20-Q27.md: Z2 no hardware digits, Z3 Corrections proposed as "our calculation finds ..." for the review to confirm, Z5 no new SVG kind).
 *
 * Build notes against the plan:
 * - Phase `'books'` throughout (no 709 notes cover Bergou Chapter 8): ramp beats are `books`, the clues are `clue`, the Go-deeper beats are `deeper` and last in their unit.
 * - Every number is the ENGINE's (Q20.values.ts, physics/qc/machines.ts). A number shown with a minus sign is stored as its size and the sign is asserted in the claim.
 * - Bergou's "fidelity" <psi|rho|psi> is the SQUARE of Chapter Q9's root fidelity: called the copy fidelity F_c throughout, with the Rosetta line in cloner:b1.
 * - Bergou's Bell names are swapped against the standard ones (his Psi+- are our Phi+-); the standard names are used with "(Bergou: ...)" on first use.
 * - The state to flip in Unit 20.5 is written chi (Bergou's phi), because the course keeps phi for an angle.
 * - The two-round retry circuit (retry only after a first reading of 1) is drawn with the first reading kept coherent: the second CNOT is controlled by that wire too, a Toffoli;
 *   this is the same circuit as Eq. 8.30's larger program, so both beats of Unit 20.4 use it (cursor 5 for the readings, cursor 4 for the amplitudes before the readings).
 * - The number reader takes digits around a point for a decimal: equations are cited as "Eq. 8.5" or "Eqs. 8.24–8.25" (a range), never "Eqs. 8.4 and 8.6", and a fraction inside TeX is
 *   written \tfrac{c_2}{4}, never c_2/4.
 * - A stage `split` never repeats a kind, so each pair below is picture + bars, circuit + matrix, ball + matrix, or curve + bars.
 * - Unit mentions inside Foundations and Spin Lab are bridge chips <<id|Unit F4.4>>; this chapter's own units and the other 709 chapters are named in words ("Unit 20.3", "Chapter Q13"),
 *   except the three Q13/Q14 units of the new bridge rows.
 */
import type { Circuit } from '../../physics/qc/circuit'
import type { AmpSource, AmplitudesState, BallState, Beat, BlochState, CircuitStageState, Dir, MatrixGridState, MatrixSource, PlotState, StageLayout, StageState } from '../schema'
import { C_CL, C_D1, C_D2, C_PR, C_RUS, R_MP_CLONE, R_MP_UNOT, R_OUT1, R_OUT1_OTHER, R_OUT3, R_PSI, R_TURNED, V, claim, close, d, tf, uf } from './Q20.values'

/* ---------------------------------------------------------------------------------------------- */
/* Stage shorthand (plan "Stage shorthand"), as plain builder functions                              */
/* ---------------------------------------------------------------------------------------------- */
const circ = (C: Circuit, upTo: number): CircuitStageState => ({ kind: 'circuit', circuit: C, upTo, shot: 'Q-WIRES' })
const amp = (C: Circuit, upTo: number, mode: AmplitudesState['mode'], extra: Partial<Omit<AmplitudesState, 'kind' | 'state' | 'mode'>> = {}): AmplitudesState => ({
  kind: 'amplitudes',
  state: { circuit: C, upTo },
  mode,
  shot: 'A-BARS',
  ...extra,
})
const mx = (source: MatrixSource, extra: Partial<Omit<MatrixGridState, 'kind' | 'source' | 'labels'>> = {}): MatrixGridState => ({ kind: 'matrix', source, labels: 'kets', values: 'exact', shot: 'M-GRID', ...extra })
const rho = (C: Circuit, upTo: number): MatrixSource => ({ rho: { ket: { circuit: C, upTo } } })
const BELL_RHO: MatrixSource = { outer: [{ bell: '00+11' } as AmpSource] }
const ball = (r: readonly number[], compare?: Dir): BallState => ({ kind: 'bloch-ball', point: { r: [r[0], r[1], r[2]] }, ...(compare ? { compare } : {}), purity: true, shot: 'B-STD' })
const bl = (state: Dir, extra: Partial<Omit<BlochState, 'kind' | 'state'>> = {}): BlochState => ({ kind: 'bloch', state, shot: 'B-STD', ...extra })
const plot = (curve: PlotState['curve'], markers: number[] = [], extra: Partial<Omit<PlotState, 'kind' | 'curve' | 'markers'>> = {}): PlotState => ({
  kind: 'plot',
  curve,
  markers: markers.map((x) => ({ x })),
  shot: 'P-CURVE',
  ...extra,
})
const split = (top: StageState, bottom: StageState): StageLayout => ({ layout: 'split', top, bottom })

/** The running input at Bloch angles (60, 90) degrees, its opposite (the antipode), and a second input at (120, 30). */
const PSI_DIR: Dir = { thetaDeg: 60, phiDeg: 90 }
const PSI_PERP_DIR: Dir = { thetaDeg: 120, phiDeg: 270 }
const PSI_OTHER_DIR: Dir = { thetaDeg: 120, phiDeg: 30 }
const ALPHA = 30

const UP = (u: number) => ({ uDeg: u })
const FIDS = (markers: number[]): PlotState => plot({ fn: 'clonerF1', vs: 'clonerF2', x: { from: 0, to: 60 }, samples: 60 }, markers)
const USD = (markers: number[], vs = false): PlotState =>
  plot({ fn: 'usdProgrammable', ...(vs ? { vs: 'usdKnown' as const } : {}), x: { from: 0, to: 1 }, samples: 100 }, markers)
const XI60 = { flip: [60, 0] as [number, number] }

/* ---------------------------------------------------------------------------------------------- */
/* q20-cloner — A copier that loses quality                                                          */
/* ---------------------------------------------------------------------------------------------- */

const cloner: Beat[] = [
  {
    id: 'q20-cloner:b1',
    phase: 'books',
    introduces: ['qc-copy-fidelity'],
    text:
      `<<qc-q13-no-cloning|Unit 13.5>> showed that no machine copies an unknown [[qubit|qubit]] exactly. A weaker wish survives: a [[qc-quantum-cloner|quantum cloner]] makes two copies that are each close to the input. ` +
      `Closeness is the [[qc-copy-fidelity|copy fidelity]] $F_{\\rm c}$, the chance that a copy passes a test for the original state. How large can it be?`,
    formal:
      `[[qc-no-cloning|No-cloning]] forbids a unitary $U$ with $U|\\psi\\rangle|0\\rangle = |\\psi\\rangle|\\psi\\rangle$ for every state $\\psi$ of a [[qubit|qubit]]. A [[qc-quantum-cloner|quantum cloner]] (Bergou §8.2, p. 145) asks only that each output $\\rho$ have the same high ` +
      `[[qc-copy-fidelity|copy fidelity]] $F_{\\rm c} = \\langle\\psi|\\rho|\\psi\\rangle$ for every input. This is the square of Chapter Q9's root fidelity: $F_{\\rm c} = F^2$ (Rosetta).`,
    caption: 'the machine: three wires, data on top, a two-wire program below',
    captionFormal: '$F_{\\rm c} = \\langle\\psi|\\rho|\\psi\\rangle$, to be read off the outputs',
    stage: circ(C_CL(UP(30)), 2),
  },
  {
    id: 'q20-cloner:b2',
    phase: 'books',
    text:
      `Four controlled-NOT gates ([[qc-cnot|CNOT]], <<qc-q4-cnot|Unit 4.4>>) act on three qubits. Qubit 1 holds the state $\\psi$ to copy. Qubits 2 and 3 hold the program, in one of two forms. ` +
      `The program $\\Xi_{00}$ is the Bell state $\\Phi^+$ (Bergou: $\\Psi_+$), and it leaves qubit 1 as it was. The program $\\Xi_{0x}$ is qubit 2 in $|0\\rangle$ and qubit 3 in $|+\\rangle$, and it moves $\\psi$ to qubit 2. ` +
      `The two programs overlap by ${uf(V.q20OverlapPrograms)}.`,
    formal:
      `Fig. 8.1 applies CNOT $1\\to2$, $1\\to3$, $2\\to1$ and $3\\to1$ in that order (our wires 0 to 2). Eq. 8.1 defines $|\\Xi_{00}\\rangle = \\tfrac{1}{\\sqrt2}(|00\\rangle + |11\\rangle)$ and $|\\Xi_{0x}\\rangle = |0\\rangle\\tfrac{1}{\\sqrt2}(|0\\rangle + |1\\rangle)$. ` +
      `By Eq. 8.2 the first leaves $|\\psi\\rangle_1|\\Xi_{00}\\rangle_{23}$ unchanged, and the second gives $|\\psi\\rangle_2|\\Xi_{00}\\rangle_{13}$. ` +
      `The drawn circuit equals the CNOT matrices (gap $${d(V.q20ClonerCircuitGap, 0)}$), both equations hold to $${d(V.q20Xi00Gap, 0)}$ at $\\theta = 60^\\circ$, $\\varphi = 90^\\circ$, and $\\langle\\Xi_{00}|\\Xi_{0x}\\rangle = ${tf(V.q20OverlapPrograms)}$.`,
    caption: 'program Ξ₀ₓ: the state ends on wire 2, a pure state',
    captionFormal: '$\\rho_2$ of the final state: $|\\psi\\rangle\\langle\\psi|$, purity 1',
    stage: split(circ(C_CL('0x'), 6), mx(rho(C_CL('0x'), 6), { partialTrace: { keep: [1] } })),
    claims: [
      claim('q20OverlapPrograms', 'the two programs overlap by one half', () => close(V.q20OverlapPrograms, 0.5, 1e-12)),
      claim('q20Xi00Gap', 'the circuit with program Ξ00 leaves the state on wire 1 (Eq. 8.2, max-abs gap)', () => close(V.q20Xi00Gap, 0, 1e-12)),
      claim('q20Xi0xGap', 'the circuit with program Ξ0x moves the state to wire 2 (Eq. 8.2, max-abs gap)', () => close(V.q20Xi0xGap, 0, 1e-12)),
      claim('q20Out2PurityXi0x', 'with program Ξ0x wire 2 ends in a pure state, purity 1', () => close(V.q20Out2PurityXi0x, 1, 1e-12)),
      claim('q20ClonerCircuitGap', 'the drawn circuit equals the four CNOT matrices (max-abs gap over five programs)', () => close(V.q20ClonerCircuitGap, 0, 1e-12)),
    ],
  },
  {
    id: 'q20-cloner:b3',
    phase: 'books',
    text:
      `Feed the program $c_0\\Xi_{00} + c_1\\Xi_{0x}$, with $c_0$ and $c_1$ real. Part of the state stays on wire 1 and part moves to wire 2. ` +
      `The programs overlap by ${uf(V.q20OverlapPrograms)}, so the program has length 1 exactly when $c_0^2 + c_1^2 + c_0c_1 = 1$. One angle $u$ keeps this true: $c_0 = \\cos u - \\sin u/\\sqrt3$ and $c_1 = 2\\sin u/\\sqrt3$. ` +
      `At $u = 15^\\circ$ they are $c_0 = ${d(V.q20C0u15, 4)}$ and $c_1 = ${d(V.q20C1u15, 4)}$. The copies then have fidelity $${d(V.q20F1u15, 4)}$ on wire 1 and $${d(V.q20F2u15, 4)}$ on wire 2.`,
    formal:
      `The program $|\\Xi\\rangle = c_0|\\Xi_{00}\\rangle + c_1|\\Xi_{0x}\\rangle$ with real $c_0$, $c_1$ has norm 1 iff $c_0^2 + c_1^2 + c_0c_1 = 1$ (Eq. 8.3), because the programs overlap by $${tf(V.q20OverlapPrograms)}$. ` +
      `Eq. 8.4 gives $\\rho_1 = (c_0^2 + c_0c_1)|\\psi\\rangle\\langle\\psi| + \\tfrac{c_1^2}{2}I$ and $\\rho_2 = (c_1^2 + c_0c_1)|\\psi\\rangle\\langle\\psi| + \\tfrac{c_0^2}{2}I$. ` +
      `We parametrise by an angle $u$ (our choice): $c_0 = \\cos u - \\sin u/\\sqrt3$ and $c_1 = 2\\sin u/\\sqrt3$, always [[normalized|normalised]]. At $u = 15^\\circ$: $c_0 = ${d(V.q20C0u15, 4)}$, $c_1 = ${d(V.q20C1u15, 4)}$, $F_{\\rm c,1} = ${d(V.q20F1u15, 4)}$ and $F_{\\rm c,2} = ${d(V.q20F2u15, 4)}$. ` +
      `The engine's gaps to Eqs. 8.3–8.4 are $${d(V.q20NormGap, 0)}$ at $u = 5^\\circ, 17^\\circ, 41^\\circ, 55^\\circ$.`,
    caption: `the two copies' fidelity against the program angle: wire 1 falls from 1 to ${uf(V.q20F2u0)}, wire 2 rises from ${uf(V.q20F2u0)} to 1`,
    captionFormal: `$F_{\\rm c,1}(u)$ and $F_{\\rm c,2}(u)$ for $u \\in [0^\\circ, 60^\\circ]$; at $u = 15^\\circ$: ${d(V.q20F1u15, 4)} and ${d(V.q20F2u15, 4)}`,
    stage: FIDS([0, 15, 30]),
    claims: [
      claim('q20NormGap', 'the program c0 Ξ00 + c1 Ξ0x has length 1 at four angles (Eq. 8.3, max-abs gap)', () => close(V.q20NormGap, 0, 1e-12)),
      claim('q20Rho1Gap', 'wire 1 follows Eq. 8.4 at four angles (max-abs gap)', () => close(V.q20Rho1Gap, 0, 1e-12)),
      claim('q20Rho2Gap', 'wire 2 follows Eq. 8.4 at four angles (max-abs gap)', () => close(V.q20Rho2Gap, 0, 1e-12)),
      claim('q20CrossGap', 'the cross terms of the two branches equal c0 c1 |ψ><ψ| at four angles (max-abs gap)', () => close(V.q20CrossGap, 0, 1e-12)),
      claim('q20C0u15', 'at u = 15 degrees c0 = 0.8165', () => close(V.q20C0u15, 0.8165, 5e-5)),
      claim('q20C1u15', 'at u = 15 degrees c1 = 0.2989', () => close(V.q20C1u15, 0.2989, 5e-5)),
      claim('q20F1u15', 'at u = 15 degrees wire 1 has fidelity 0.9553', () => close(V.q20F1u15, 0.9553, 5e-5)),
      claim('q20F2u15', 'at u = 15 degrees wire 2 has fidelity 0.6667', () => close(V.q20F2u15, 0.6667, 5e-5)),
      claim('q20F1u0', 'at u = 0 wire 1 has fidelity 1', () => close(V.q20F1u0, 1, 1e-12)),
      claim('q20F2u0', 'at u = 0 wire 2 has fidelity one half', () => close(V.q20F2u0, 0.5, 1e-12)),
    ],
    derivation: {
      result: '\\rho_1 = (c_0^2 + c_0c_1)\\,|\\psi\\rangle\\langle\\psi| + \\tfrac{c_1^2}{2}I',
      ground: [
        {
          tex: '|\\psi\\rangle_1|\\Xi_{00}\\rangle \\to |\\psi\\rangle_1|\\Xi_{00}\\rangle',
          why: 'The first program leaves the state on wire 1.',
          view: circ(C_CL('00'), 6),
          viewCaption: 'the circuit for the two programs',
        },
        {
          tex: '|\\psi\\rangle_1|\\Xi_{0x}\\rangle \\to |\\psi\\rangle_2|\\Xi_{00}\\rangle_{13}',
          why: 'The second program moves the state to wire 2, and wires 1 and 3 form a Bell pair.',
          view: mx(rho(C_CL('0x'), 6), { partialTrace: { keep: [0] } }),
          viewCaption: 'wire 1 after the second program: the maximally mixed state',
        },
        {
          tex: '\\rho_1 = c_0^2\\,|\\psi\\rangle\\langle\\psi| + \\tfrac{c_1^2}{2}I + \\text{cross terms}',
          why: 'Square each branch: the first keeps the state, the second leaves wire 1 half of the identity.',
        },
        {
          tex: '\\rho_1 = (c_0^2 + c_0c_1)\\,|\\psi\\rangle\\langle\\psi| + \\tfrac{c_1^2}{2}I',
          why: 'The branches interfere: their cross terms add the state once more, with weight $c_0c_1$.',
          view: FIDS([0, 15, 30]),
          viewCaption: "the two clones' fidelities against the program angle",
          claims: [claim('q20CrossGap', 'the cross terms equal c0 c1 |ψ><ψ| (max-abs gap)', () => close(V.q20CrossGap, 0, 1e-12))],
        },
      ],
      formal: [
        {
          tex: '|\\psi\\rangle_1|\\Xi_{00}\\rangle_{23} \\to |\\psi\\rangle_1|\\Xi_{00}\\rangle_{23},\\quad |\\psi\\rangle_1|\\Xi_{0x}\\rangle_{23} \\to |\\psi\\rangle_2|\\Xi_{00}\\rangle_{13}',
          why: 'The two program cases of Eq. 8.2.',
          view: circ(C_CL('00'), 6),
          viewCaption: 'the circuit for the two programs',
        },
        {
          tex: '\\rho_1 = c_0^2\\,|\\psi\\rangle\\langle\\psi| + c_1^2\\,\\tfrac{I}{2} + c_0c_1\\,|\\psi\\rangle\\langle\\psi|',
          why: 'Three terms: each branch squared, and the cross terms of Eq. 8.4.',
          view: mx(rho(C_CL('0x'), 6), { partialTrace: { keep: [0] } }),
          viewCaption: 'wire 1 after the second program: the maximally mixed state',
        },
        {
          tex: '\\rho_1 = (c_0^2 + c_0c_1)\\,|\\psi\\rangle\\langle\\psi| + \\tfrac{c_1^2}{2}I',
          why: 'Collect the terms in $|\\psi\\rangle\\langle\\psi|$.',
          view: FIDS([0, 15, 30]),
          viewCaption: "the two clones' fidelities against the program angle",
        },
      ],
    },
  },
  {
    id: 'q20-cloner:b4',
    phase: 'books',
    text:
      `Choose $c_0 = c_1 = 1/\\sqrt3$, which is $u = 30^\\circ$ and gives $c_0 = ${d(V.q20C, 4)}$. Each output is then $${tf(V.q20F56)}$ of the input plus $${tf(V.q20Weight16)}$ of its opposite $\\psi^\\perp$. The opposite state is at the far end of the arrow's line through the centre. ` +
      `A clone passes the test for $\\psi$ five times in six. It is never perfect.`,
    formal:
      `Eq. 8.5 gives $\\rho_1 = \\rho_2 = \\tfrac56|\\psi\\rangle\\langle\\psi| + \\tfrac16|\\psi^\\perp\\rangle\\langle\\psi^\\perp|$, so $F_{\\rm c} = ${tf(V.q20F56)}$ and the root fidelity of Chapter Q9 is $F = \\sqrt{\\tfrac56} = ${d(V.q20F56Root, 4)}$. ` +
      `On the [[qc-bloch-ball|Bloch ball]] of Chapter Q8 the clone's arrow is $\\mathbf r_{\\rm out} = \\tfrac23\\mathbf r$: the input arrow shrunk to two thirds, as a [[qc-depolarizing|depolarizing channel]] of Chapter Q13 would shrink it. The engine's gap to Eq. 8.5 is $${d(V.q20Out1Gap, 0)}$.`,
    caption: 'the input arrow on the surface and the clone’s arrow, two thirds as long, pointing the same way',
    captionFormal: '$|\\mathbf r_{\\rm out}| = \\tfrac23$, $\\mathbf r_{\\rm out}\\parallel\\mathbf r$',
    stage: ball(R_OUT1, PSI_DIR),
    claims: [
      claim('q20C', 'at the equal split c0 = c1 = 0.5774', () => close(V.q20C, 0.5774, 5e-5)),
      claim('q20F56', 'each clone has copy fidelity five sixths', () => close(V.q20F56, 5 / 6, 1e-9)),
      claim('q20Weight16', 'each clone has weight one sixth on the opposite state', () => close(V.q20Weight16, 1 / 6, 1e-9)),
      claim('q20F56Root', 'the root fidelity of the equal-split clone is 0.9129', () => close(V.q20F56Root, 0.9129, 5e-5)),
      claim('q20ShrinkClone', "the clone's arrow is two thirds as long as the input's", () => close(V.q20ShrinkClone, 2 / 3, 1e-9)),
      claim('q20Out1Gap', 'both clones equal five sixths ψ plus one sixth ψ-perp (Eq. 8.5, max-abs gap)', () => close(V.q20Out1Gap, 0, 1e-12)),
    ],
    derivation: {
      result: '\\mathbf r_{\\rm out} = \\tfrac23\\,\\mathbf r',
      ground: [
        {
          tex: '\\rho = \\tfrac56\\,|\\psi\\rangle\\langle\\psi| + \\tfrac16\\,|\\psi^\\perp\\rangle\\langle\\psi^\\perp|',
          why: 'Each clone is a [[mixture|mixture]] of the input and its opposite.',
          view: mx(rho(C_CL(UP(30)), 6), { partialTrace: { keep: [0] } }),
          viewCaption: 'the clone on wire 1 as a density matrix',
        },
        {
          tex: '|\\mathbf r_{\\rm out}| = \\tfrac56 - \\tfrac16',
          why: "The arrow's length is the weight on $\\psi$ minus the weight on $\\psi^\\perp$.",
          view: ball(R_OUT1, PSI_DIR),
          viewCaption: 'input and clone: two thirds as long',
        },
        {
          tex: '\\tfrac56 - \\tfrac16 = \\tfrac23,\\ \\text{so}\\ \\mathbf r_{\\rm out} = \\tfrac23\\,\\mathbf r',
          why: 'The difference is two thirds, and the arrow still points along the input.',
        },
      ],
      formal: [
        {
          tex: '\\rho_1 = \\tfrac56|\\psi\\rangle\\langle\\psi| + \\tfrac16|\\psi^\\perp\\rangle\\langle\\psi^\\perp|',
          why: 'Eq. 8.5.',
          view: mx(rho(C_CL(UP(30)), 6), { partialTrace: { keep: [0] } }),
          viewCaption: 'the clone on wire 1 as a density matrix',
        },
        {
          tex: '\\mathbf r_{\\rm out} = (\\tfrac56 - \\tfrac16)\\,\\mathbf r = \\tfrac23\\,\\mathbf r',
          why: 'The Bloch vector of a [[mixture|mixture]] of $\\psi$ and $\\psi^\\perp$ is the difference of the weights times $\\mathbf r$.',
          view: ball(R_OUT1, PSI_DIR),
          viewCaption: 'input and clone: two thirds as long',
        },
      ],
    },
  },
  {
    id: 'q20-cloner:b5',
    phase: 'books',
    text:
      `Try two hundred different inputs. The fidelity of the clone is $${tf(V.q20F56)}$ for every one, so no input is favoured. A cloner with this property is a [[qc-universal-cloner|universal cloner]]. ` +
      `A second input, at $\\theta = 120^\\circ$ and $\\varphi = 30^\\circ$, gives $${tf(V.q20F56Other)}$ again.`,
    formal:
      `The copy fidelity depends on neither $\\theta$ nor $\\varphi$ (Bergou p. 147): over 200 seeded random inputs the spread $\\max F_{\\rm c} - \\min F_{\\rm c}$ is $${d(V.q20UniversalSpread, 0)}$ up to roundoff (below $10^{-12}$). ` +
      `Such a cloner treats every state alike: it is a [[qc-universal-cloner|universal cloner]]. A state-dependent cloner, as in Problem 1 (⚑), may do better on a small set of inputs. ` +
      `A second input at $(120^\\circ, 30^\\circ)$ again gives $F_{\\rm c} = ${tf(V.q20F56Other)}$.`,
    caption: 'a second input, θ = 120°, φ = 30°: the clone’s arrow is again two thirds as long',
    captionFormal: '$(\\theta, \\varphi) = (120^\\circ, 30^\\circ)$: $|\\mathbf r_{\\rm out}| = \\tfrac23$ again',
    stage: ball(R_OUT1_OTHER, PSI_OTHER_DIR),
    claims: [
      claim('q20UniversalSpread', 'over 200 seeded random inputs the spread of the clone fidelity is 0 (max minus min)', () => close(V.q20UniversalSpread, 0, 1e-12)),
      claim('q20F56Other', 'a second input gives copy fidelity five sixths again', () => close(V.q20F56Other, 5 / 6, 1e-9)),
    ],
  },
  {
    id: 'q20-cloner:b6',
    phase: 'clue',
    text: 'Keep wire 1 exactly as it was, so that $c_1 = 0$. How good is the copy on wire 2?',
    formal: 'Take $c_0 = 1$ and $c_1 = 0$, which is $u = 0^\\circ$, and find $F_{\\rm c,1}$ and $F_{\\rm c,2}$. Then do the mirror case $c_0 = 0$.',
    caption: 'the left end of the plot: wire 1 perfect',
    captionFormal: '$u = 0^\\circ$',
    stage: FIDS([0]),
    reveal: {
      text:
        `Wire 2 holds only the maximally mixed state $\\tfrac{I}{2}$, so its fidelity is ${uf(V.q20F2u0)}, a coin flip. A perfect original leaves nothing for the copy. ` +
        `The equal split, $${tf(V.q20F56)}$ each, is the fair share.`,
      formal:
        `At $u = 0^\\circ$: $F_{\\rm c,1} = 1$ and $F_{\\rm c,2} = ${tf(V.q20F2u0)}$. At $u = 60^\\circ$ the values swap, $${tf(V.q20F1u60)}$ and $1$ (the plot's two ends). ` +
        `Bergou's Problem 2 (⚑, cited, not worked) states the relation between the two fidelities along the whole curve.`,
      caption: 'both ends of the plot: one wire perfect, the other a coin flip',
      captionFormal: '$u = 0^\\circ$ and $u = 60^\\circ$: $(1, \\tfrac12)$ and $(\\tfrac12, 1)$',
      stage: FIDS([0, 60]),
      claims: [
        claim('q20F2u0', 'with wire 1 kept perfect, wire 2 has fidelity one half', () => close(V.q20F2u0, 0.5, 1e-12)),
        claim('q20F1u60', 'at u = 60 degrees wire 1 has fidelity one half', () => close(V.q20F1u60, 0.5, 1e-12)),
        claim('q20F2u60', 'at u = 60 degrees wire 2 has fidelity 1', () => close(V.q20F2u60, 1, 1e-12)),
        claim('q20F56', 'the equal split gives each wire five sixths', () => close(V.q20F56, 5 / 6, 1e-9)),
      ],
    },
  },
  {
    id: 'q20-cloner:b7',
    phase: 'deeper',
    text:
      `If only states on the equator need copying, a cloner can do better than $${tf(V.q20F56)}$. Bergou's Problem 1 works this out. We cite it and do not work it.`,
    formal:
      `Phase-covariant cloning (Problem 1, p. 158, ⚑): restrict the inputs to equal-weight [[qc-superposition|superpositions]] of $|0\\rangle$ and $|1\\rangle$ with any phase between the parts, allow a two-qubit unitary with a splitting angle, ` +
      `and both fidelities can exceed $${tf(V.q20F56)}$. Cited only; the universal cloner stays this chapter's machine.`,
    caption: 'the equator, the set a phase-covariant cloner serves',
    captionFormal: 'inputs on the equator $\\theta = 90^\\circ$',
    stage: bl({ thetaDeg: 90, phiDeg: 0 }),
  },
]

/* ---------------------------------------------------------------------------------------------- */
/* q20-unot — The best quantum NOT                                                                   */
/* ---------------------------------------------------------------------------------------------- */

const unot: Beat[] = [
  {
    id: 'q20-unot:b1',
    phase: 'books',
    text:
      `A perfect NOT would send every state to its opposite. On the ball that is the antipode: the arrow flips. But the opposite of $\\alpha|0\\rangle + \\beta|1\\rangle$ is $\\beta^*|0\\rangle - \\alpha^*|1\\rangle$, with complex conjugates, and no gate does that. ` +
      `This ideal machine is the [[qc-u-not|U-NOT]], and a map that conjugates is [[qc-anti-unitary|anti-unitary]].`,
    formal:
      `The ideal [[qc-u-not|U-NOT]] $|\\psi\\rangle \\mapsto |\\psi^\\perp\\rangle = \\beta^*|0\\rangle - \\alpha^*|1\\rangle$ is [[qc-anti-unitary|anti-unitary]] (Bergou p. 146). On density matrices it is $\\rho \\mapsto \\mathrm{Tr}(\\rho)I - \\rho = \\sigma_y\\rho^{T}\\sigma_y$, ` +
      `the transpose of <<qc-q13-properties|Unit 13.2>> followed by a unitary, so its Choi matrix has the same spectrum. That spectrum is $-${tf(V.q20UnotChoiNeg)}$ once and $${tf(V.q20UnotChoiMax)}$ three times: the map is not completely positive. ` +
      `The engine's gap for the identity is $${d(V.q20UnotIsYTYGap, 0)}$.`,
    caption: 'one Bell state with one half transposed: a negative bar, the same picture as Unit 13.2',
    captionFormal: 'Choi spectrum of the U-NOT = that of the transpose',
    stage: mx(BELL_RHO, { ptranspose: 'B', spectrum: 'bars' }),
    fidelity: ['qc-matrix-spectrum-engine', 'qc-matrix-ptranspose-not-physical'],
    claims: [
      claim('q20UnotIsYTYGap', 'Tr(ρ) I − ρ equals σy ρ-transpose σy for four states (max-abs gap)', () => close(V.q20UnotIsYTYGap, 0, 1e-12)),
      claim('q20UnotChoiNeg', 'the trace-one Choi matrix of the ideal U-NOT has the eigenvalue minus one half', () => close(V.q20UnotChoiNeg, 0.5, 1e-9)),
      claim('q20UnotChoiMax', 'and the largest eigenvalue one half', () => close(V.q20UnotChoiMax, 0.5, 1e-9)),
    ],
  },
  {
    id: 'q20-unot:b2',
    phase: 'books',
    text:
      `The cloner has a third wire we ignored. It holds a small amount, $c_0c_1$, of the conjugate state $\\psi^*$, mixed with noise. Conjugation flips the $y$ part of the arrow. ` +
      `For the input at $\\theta = 60^\\circ$, $\\varphi = 90^\\circ$ the $y$ part $${d(V.q20PsiY, 4)}$ becomes $-${d(V.q20Rho3Y, 4)}$ on wire 3, a third as long. At the equal split $c_0c_1 = ${tf(V.q20MaxC0C1)}$.`,
    formal:
      `Eq. 8.6: $\\rho_3 = c_0c_1|\\psi^*\\rangle\\langle\\psi^*| + \\tfrac12(1 - c_0c_1)I$ with $|\\psi^*\\rangle = \\alpha^*|0\\rangle + \\beta^*|1\\rangle$; conjugation sends $y$ to $-y$ on the ball. At the equal split $c_0c_1 = ${tf(V.q20MaxC0C1)}$. ` +
      `The engine's gap to Eq. 8.6 is $${d(V.q20Rho3Gap, 0)}$; the $y$ part falls from $${d(V.q20PsiY, 4)}$ to $-${d(V.q20Rho3Y, 4)}$.`,
    caption: 'wire 3’s arrow: short, tilted to −y',
    captionFormal: '$\\rho_3$ against $\\psi$ on the ball: $y \\to -y$, length $c_0c_1$',
    stage: ball(R_OUT3, PSI_DIR),
    claims: [
      claim('q20Rho3Gap', 'wire 3 follows Eq. 8.6 at four angles (max-abs gap)', () => close(V.q20Rho3Gap, 0, 1e-12)),
      claim('q20Rho3Y', 'the y part of wire 3 is of size 0.2887 and points to minus y', () => close(V.q20Rho3Y, 0.2887, 5e-5) && R_OUT3[1] < 0),
      claim('q20PsiY', 'the y part of the input arrow is 0.8660', () => close(V.q20PsiY, 0.866, 5e-5)),
      claim('q20Rho3Len', "wire 3's arrow is one third as long as the input's", () => close(V.q20Rho3Len, 1 / 3, 1e-9)),
      claim('q20MaxC0C1', 'the product c0 c1 is largest, one third, at the equal split', () => close(V.q20MaxC0C1, 1 / 3, 1e-9)),
    ],
  },
  {
    id: 'q20-unot:b3',
    phase: 'books',
    text:
      `Turn wire 3 by a half-turn about $y$, an ordinary gate $U_0$. Its arrow then points exactly opposite the input and is $${tf(V.q20UnotShrink)}$ as long. ` +
      `The state is a mixture: $${tf(V.q20UnotFid)}$ of $\\psi^\\perp$ and $${tf(V.q20UnotShrink)}$ of $\\psi$. So the fidelity to $\\psi^\\perp$ is $${tf(V.q20UnotFid)}$.`,
    formal:
      `Eq. 8.7 with $U_0 = -i\\sigma_y$ gives $U_0\\rho_3U_0^{-1} = \\tfrac12(1 + c_0c_1)|\\psi^\\perp\\rangle\\langle\\psi^\\perp| + \\tfrac12(1 - c_0c_1)|\\psi\\rangle\\langle\\psi|$. At $c_0c_1 = ${tf(V.q20MaxC0C1)}$ this is Eq. 8.8, with weights $${tf(V.q20UnotFid)}$ and $${tf(V.q20UnotShrink)}$. ` +
      `The fidelity to $\\psi^\\perp$ is $${tf(V.q20UnotFid)}$, and the Bloch vector is $-${tf(V.q20UnotShrink)}\\mathbf r$ (dot product $-${d(V.q20UnotDot, 4)}$ with the input's). ` +
      `Rosetta: here $U_0|0\\rangle = +|1\\rangle$ and $U_0|1\\rangle = -|0\\rangle$; Bergou prints the opposite signs, which leaves $\\rho$ unchanged. He calls this the best approximate U-NOT without proof (p. 148).`,
    caption: 'the turned wire 3: the opposite direction, a third of the length',
    captionFormal: '$U_0\\rho_3U_0^{-1}$ against $\\psi^\\perp$: antiparallel to $\\mathbf r$, length $\\tfrac13$',
    stage: ball(R_TURNED, PSI_PERP_DIR),
    claims: [
      claim('q20UnotGap', 'the turned wire 3 equals two thirds ψ-perp plus one third ψ (Eq. 8.8, max-abs gap)', () => close(V.q20UnotGap, 0, 1e-12)),
      claim('q20UnotFid', 'the fidelity of the turned wire 3 to the opposite state is two thirds', () => close(V.q20UnotFid, 2 / 3, 1e-9)),
      claim('q20UnotDot', 'the turned arrow has dot product minus 0.3333 with the input arrow', () => close(V.q20UnotDot, 1 / 3, 1e-9) && R_TURNED[1] * R_PSI[1] < 0),
      claim('q20UnotShrink', 'the turned arrow is one third as long as the input arrow', () => close(V.q20UnotShrink, 1 / 3, 1e-9)),
      claim('q20U0Sign', 'U0 = −iσy sends |0> to plus |1> (matrix entry +1)', () => close(V.q20U0Sign, 1, 1e-12)),
    ],
  },
  {
    id: 'q20-unot:b4',
    phase: 'books',
    text:
      `Flip the arrow and shrink it by a factor $p$. Chapter Q13's test, the Choi matrix, allows this only while $p \\le ${tf(V.q20UnotPStar)}$. At exactly $${tf(V.q20UnotPStar)}$ the machine is just physical, and the cloner's third wire reaches it. ` +
      `So $${tf(V.q20UnotFid)}$ is the best fidelity this kind of machine allows.`,
    formal:
      `Our calculation finds that $\\Lambda_p(\\rho) = p(\\mathrm{Tr}\\rho\\,I - \\rho) + (1-p)\\,\\mathrm{Tr}\\rho\\,\\tfrac{I}{2}$ has a trace-one Choi matrix with smallest eigenvalue $\\tfrac14 - \\tfrac34p$ and three eigenvalues $\\tfrac14 + \\tfrac14p$, ` +
      `so it is [[qc-complete-positivity|completely positive]] iff $p \\le ${tf(V.q20UnotPStar)}$. At $p = ${d(V.q20ShrinkP02, 1)}$ the smallest eigenvalue is $${d(V.q20ChoiMinP02, 1)}$, and at $p = ${tf(V.q20UnotChoiNeg)}$ it is $-${d(V.q20ChoiNegP05, 3)}$. ` +
      `Then $F_{\\rm c} = \\tfrac{1+p}{2} \\le ${tf(V.q20UnotFid)}$ for such maps, and the cloner's product $c_0c_1$ never exceeds $${tf(V.q20MaxC0C1)}$, so it meets the limit. Bergou states optimality without proof; the limit among these maps is ours.`,
    caption: 'the ideal NOT’s Choi bars: the negative bar must be shrunk away, and p = ⅓ is exactly where it reaches zero',
    captionFormal: '$\\tfrac14 - \\tfrac34p \\ge 0$',
    stage: split(ball(R_TURNED, PSI_PERP_DIR), mx(BELL_RHO, { ptranspose: 'B', spectrum: 'bars' })),
    fidelity: ['qc-matrix-spectrum-engine', 'qc-matrix-ptranspose-not-physical'],
    claims: [
      claim('q20ChoiMinP0', 'with no flipping (p = 0) the smallest Choi eigenvalue is one quarter', () => close(V.q20ChoiMinP0, 0.25, 1e-9)),
      claim('q20ChoiSlope', 'the smallest Choi eigenvalue falls by three quarters per unit of p', () => close(V.q20ChoiSlope, 0.75, 1e-9)),
      claim('q20ShrinkP02', 'the first probe value of the shrink factor is p = 0.2', () => close(V.q20ShrinkP02, 0.2, 1e-12)),
      claim('q20ChoiMinP02', 'at p = 0.2 the smallest Choi eigenvalue is 0.1', () => close(V.q20ChoiMinP02, 0.1, 1e-9)),
      claim('q20ChoiNegP05', 'at p = one half the smallest Choi eigenvalue is minus 0.125', () => close(V.q20ChoiNegP05, 0.125, 1e-9)),
      claim('q20UnotPStar', 'the smallest Choi eigenvalue reaches zero at p = one third (bisection)', () => close(V.q20UnotPStar, 1 / 3, 1e-9)),
      claim('q20UnotFid', 'at p = one third the fidelity is two thirds', () => close(V.q20UnotFid, 2 / 3, 1e-9)),
    ],
    derivation: {
      result: 'p \\le \\tfrac13',
      ground: [
        {
          tex: '\\Lambda_p(\\rho) = p\\,(\\mathrm{Tr}\\rho\\,I - \\rho) + (1-p)\\,\\mathrm{Tr}\\rho\\,\\tfrac{I}{2}',
          why: 'Flip the arrow, then shrink it: with chance $p$ the ideal NOT, otherwise the maximally mixed state.',
          view: ball(R_TURNED, PSI_PERP_DIR),
          viewCaption: 'flip and shrink',
        },
        {
          tex: '\\tfrac14 - \\tfrac34p\\ \\text{once},\\quad \\tfrac14 + \\tfrac14p\\ \\text{three times}',
          why: 'These are the four eigenvalues of the Choi matrix; the first one is the one that can go negative.',
          view: mx(BELL_RHO, { ptranspose: 'B', spectrum: 'bars' }),
          viewCaption: 'the Choi bars: a negative one at full strength',
        },
        {
          tex: 'F_{\\rm c} = \\tfrac{1+p}{2},\\quad \\tfrac14 - \\tfrac34p \\ge 0 \\iff p \\le \\tfrac13',
          why: 'All four eigenvalues are at least 0 exactly when $p$ is at most one third, and then the fidelity is at most two thirds.',
        },
      ],
      formal: [
        {
          tex: '\\Lambda_p:\\ \\tfrac14 - \\tfrac34p,\\ \\tfrac14 + \\tfrac14p,\\ \\tfrac14 + \\tfrac14p,\\ \\tfrac14 + \\tfrac14p',
          why: 'The spectrum of the trace-one Choi matrix of $\\Lambda_p$.',
          view: mx(BELL_RHO, { ptranspose: 'B', spectrum: 'bars' }),
          viewCaption: 'the Choi bars: a negative one at full strength',
        },
        {
          tex: 'F_{\\rm c} = \\tfrac{1+p}{2},\\quad \\tfrac14 - \\tfrac34p \\ge 0 \\iff p \\le \\tfrac13',
          why: 'Complete positivity needs the smallest eigenvalue to be at least 0.',
          view: ball(R_TURNED, PSI_PERP_DIR),
          viewCaption: 'flip and shrink',
        },
      ],
    },
  },
  {
    id: 'q20-unot:b5',
    phase: 'books',
    text:
      `A cheaper way: measure the qubit along a random axis, then build the opposite of the answer. Averaged over all axes this gives the very same mixture, $${tf(V.q20MpUnotFid)}$ of $\\psi^\\perp$ and $${tf(V.q20UnotShrink)}$ of $\\psi$.`,
    formal:
      `In [[qc-measure-and-prepare|measure-and-prepare]] (Eqs. 8.9–8.12) one measures along a uniformly random axis $\\eta$ and prepares $|\\eta^\\perp\\rangle$ on the reading $\\eta$ and $|\\eta\\rangle$ on the other. ` +
      `With $x = |\\langle\\psi|\\eta\\rangle|^2$ the fidelity to $\\psi^\\perp$ is $x^2 + (1-x)^2$, whose average is $${tf(V.q20MpUnotFid)}$. The engine's sphere average gives $${tf(V.q20MpUnotFid)}|\\psi^\\perp\\rangle\\langle\\psi^\\perp| + ${tf(V.q20UnotShrink)}|\\psi\\rangle\\langle\\psi|$ (gap $${d(V.q20MpUnotGap, 0)}$).`,
    caption: 'two machines, one answer: a circuit with no measurement, and measure then prepare',
    captionFormal: 'Eq. 8.12: the sphere average',
    stage: ball(R_MP_UNOT, PSI_PERP_DIR),
    claims: [
      claim('q20MpUnotFid', 'measure-and-prepare gives fidelity two thirds to the opposite state (sphere average)', () => close(V.q20MpUnotFid, 2 / 3, 1e-9)),
      claim('q20MpUnotGap', 'the sphere average equals two thirds ψ-perp plus one third ψ (Eq. 8.12, max-abs gap)', () => close(V.q20MpUnotGap, 0, 1e-12)),
      claim('q20UnotShrink', 'the other weight is one third', () => close(V.q20UnotShrink, 1 / 3, 1e-9)),
    ],
  },
  {
    id: 'q20-unot:b6',
    phase: 'clue',
    text:
      'Use measure-and-prepare to clone: measure along a random axis, then build two copies of the result. How good is each copy, and how good are both together?',
    formal:
      'Average the two-qubit output $|\\eta\\rangle|\\eta\\rangle$ or $|\\eta^\\perp\\rangle|\\eta^\\perp\\rangle$ over $\\eta$. Find the single-copy $F_{\\rm c}$ and the pair overlap $\\langle\\psi\\psi|\\rho_{12}|\\psi\\psi\\rangle$.',
    caption: 'the single copy’s arrow after measure-and-prepare cloning',
    captionFormal: '$\\rho_1$ of the averaged pair on the ball',
    stage: ball(R_MP_CLONE, PSI_DIR),
    reveal: {
      text:
        `Each copy has fidelity $${tf(V.q20MpCloneSingle)}$, worse than the cloner's $${tf(V.q20F56)}$. Both together match $\\psi\\psi$ only half the time, against $${tf(V.q20CloneBoth)}$ for the cloner circuit.`,
      formal:
        `The single copy has $F_{\\rm c} = ${tf(V.q20MpCloneSingle)} < ${tf(V.q20F56)}$. The pair overlap is $${tf(V.q20MpCloneBoth)}$, against $${tf(V.q20CloneBoth)}$ for the cloner circuit's pair. ` +
        `Our calculation: the book calls the single-copy $${tf(V.q20MpCloneSingle)}$ the fidelity to $|\\psi\\rangle|\\psi\\rangle$ (see the Correction below). Measure-and-prepare is optimal for the U-NOT but not for cloning.`,
      caption: 'single copy and pair: two thirds and one half, against two thirds for the circuit’s pair',
      captionFormal: '$F_{\\rm c} = \\tfrac23$ for one copy; $\\langle\\psi\\psi|\\rho_{12}|\\psi\\psi\\rangle = \\tfrac12$ against $\\tfrac23$',
      stage: ball(R_MP_CLONE, PSI_DIR),
      claims: [
        claim('q20MpCloneSingle', 'measure-and-prepare cloning gives each copy fidelity two thirds', () => close(V.q20MpCloneSingle, 2 / 3, 1e-9)),
        claim('q20MpCloneBoth', 'but the pair overlaps psi psi by only one half', () => close(V.q20MpCloneBoth, 0.5, 1e-9)),
        claim('q20CloneBoth', 'the cloner circuit’s pair overlaps psi psi by two thirds', () => close(V.q20CloneBoth, 2 / 3, 1e-9)),
        claim('q20F56', 'the cloner circuit’s single copy has fidelity five sixths', () => close(V.q20F56, 5 / 6, 1e-9)),
      ],
    },
  },
]

/* ---------------------------------------------------------------------------------------------- */
/* q20-no-go — No machine runs every program                                                         */
/* ---------------------------------------------------------------------------------------------- */

const noGo: Beat[] = [
  {
    id: 'q20-no-go:b1',
    phase: 'books',
    introduces: ['qc-programmable-processor'],
    text:
      `A fixed circuit does one job. A [[qc-programmable-processor|programmable processor]] does many: one wire carries the data, and the other wires, the [[qc-program-register|program register]], carry a program that picks the job. ` +
      `Could one processor do every job a qubit can have?`,
    formal:
      `A [[qc-programmable-processor|programmable processor]] (Bergou §8.3, p. 149) is a unitary $G$ on $\\mathcal H_d \\otimes \\mathcal H_p$, the data space times the [[qc-program-register|program register]]. ` +
      `A program $|\\Pi\\rangle$ selects a unitary $U$ on the data: $G(|\\psi\\rangle|\\Pi\\rangle) = U|\\psi\\rangle|\\Pi'\\rangle$ for every data state, Eq. 8.13. A universal processor would need a program for every element of $SU(2)$, uncountably many.`,
    caption: 'a processor: data on top, program below; the program chooses what happens to the data',
    captionFormal: '$G$ acts on data ⊗ program',
    stage: circ(C_PR(ALPHA), 3),
  },
  {
    id: 'q20-no-go:b2',
    phase: 'books',
    text:
      'Send two inputs through one program. A unitary machine never changes overlaps. So if the two inputs overlap at all, the two program outputs must be the same state.',
    formal:
      `Equate the input overlap with the output overlap: $\\langle\\psi_1|\\psi_2\\rangle = \\langle\\psi_1|\\psi_2\\rangle\\langle\\Pi'_1|\\Pi'_2\\rangle$ (Eq. 8.14). ` +
      `For $\\langle\\psi_1|\\psi_2\\rangle \\ne 0$ this forces $\\langle\\Pi'_1|\\Pi'_2\\rangle = 1$: the program output does not depend on the data.`,
    caption: 'overlaps before and after a unitary are equal',
    captionFormal: '$\\langle\\psi_1|\\psi_2\\rangle$ is unchanged by $G$',
    stage: circ(C_PR(ALPHA), 3),
  },
  {
    id: 'q20-no-go:b3',
    phase: 'books',
    text:
      `Program 1 gives $U_1$ and program 2 gives $U_2$. Overlap the outputs: $\\langle\\Pi_2|\\Pi_1\\rangle = \\langle\\psi|U_2^{-1}U_1|\\psi\\rangle\\,\\langle\\Pi_2'|\\Pi_1'\\rangle$. The left side ignores $\\psi$, so the right side must too. ` +
      `For $U_1 = I$ and $U_2 = \\sigma_z$ the first factor is $\\cos\\theta$ at polar angle $\\theta$: $1$, $${d(V.q20ExpZ60, 1)}$, $0$, $-${d(V.q20ExpZ60, 1)}$, $-1$ at $0^\\circ$, $60^\\circ$, $90^\\circ$, $120^\\circ$, $180^\\circ$. It changes with the state.`,
    formal:
      `Taking [[inner-product|inner products]] of $G(|\\psi\\rangle|\\Pi_k\\rangle) = U_k|\\psi\\rangle|\\Pi'_k\\rangle$ gives Eq. 8.16: $\\langle\\Pi_2|\\Pi_1\\rangle = \\langle\\psi|U_2^{-1}U_1|\\psi\\rangle\\langle\\Pi'_2|\\Pi'_1\\rangle$. ` +
      `If $\\langle\\Pi'_2|\\Pi'_1\\rangle \\ne 0$, then $\\langle\\psi|U_2^{-1}U_1|\\psi\\rangle$ is the same for every $\\psi$ (Eq. 8.17), so $U_2^{-1}U_1$ is a multiple of $I$ and $U_2 = e^{i\\gamma}U_1$, a [[global-phase|global phase]] apart. ` +
      `For $U_1 = I$ and $U_2 = \\sigma_z$ the expectation is $\\cos\\theta$, which is $${d(V.q20ExpZ60, 1)}$ at $60^\\circ$ and $-${d(V.q20ExpZ60, 1)}$ at $120^\\circ$, with spread ${d(V.q20SpreadZ, 0)} over the sphere; for a pure phase the spread is ${d(V.q20SpreadPhase, 0)}. ` +
      `The identity of Eq. 8.16 holds to $${d(V.q20ProcOverlapGap, 0)}$ for a controlled-$U$ processor.`,
    caption: 'the z reading of a state: 1 at the pole, 0.5 here, −1 at the far pole',
    captionFormal: '$\\langle\\psi|\\sigma_z|\\psi\\rangle = \\cos\\theta$ changes with the state',
    stage: bl({ thetaDeg: 60, phiDeg: 0 }, { measure: 'z' }),
    claims: [
      claim('q20ExpZ0', 'at the pole θ = 0 the factor ⟨ψ|σz|ψ⟩ is 1', () => close(V.q20ExpZ0, 1, 1e-12)),
      claim('q20ExpZ60', 'at θ = 60 degrees it is 0.5', () => close(V.q20ExpZ60, 0.5, 1e-12)),
      claim('q20ExpZ90', 'on the equator it is 0', () => close(V.q20ExpZ90, 0, 1e-12)),
      claim('q20ExpZ120', 'at θ = 120 degrees it is −0.5', () => close(V.q20ExpZ120, -0.5, 1e-12)),
      claim('q20ExpZ180', 'at the far pole it is −1', () => close(V.q20ExpZ180, -1, 1e-12)),
      claim('q20SpreadZ', 'the values of ⟨ψ|σz|ψ⟩ over the sphere have spread 2', () => close(V.q20SpreadZ, 2, 1e-12)),
      claim('q20SpreadPhase', 'a pure phase has the same value for every state: spread 0', () => close(V.q20SpreadPhase, 0, 1e-12)),
      claim('q20ProcOverlapGap', 'the overlap identity holds for the controlled-U processor (max-abs gap)', () => close(V.q20ProcOverlapGap, 0, 1e-12)),
    ],
    derivation: {
      result: 'U_2 = e^{i\\gamma}U_1',
      ground: [
        {
          tex: '\\langle\\Pi_2|\\Pi_1\\rangle = \\langle\\psi|U_2^{-1}U_1|\\psi\\rangle\\,\\langle\\Pi_2\'|\\Pi_1\'\\rangle',
          why: 'Overlaps do not change in a unitary, so the two outputs overlap as the two inputs did.',
          view: circ(C_PR(ALPHA), 3),
          viewCaption: 'overlaps through a unitary',
        },
        {
          tex: '\\langle\\psi|U_2^{-1}U_1|\\psi\\rangle\\ \\text{is the same for every}\\ \\psi',
          why: 'The left side does not depend on $\\psi$, so neither may the first factor on the right.',
          view: bl({ thetaDeg: 60, phiDeg: 0 }, { measure: 'z' }),
          viewCaption: 'the z reading depends on the state',
        },
        {
          tex: 'U_2^{-1}U_1 = e^{-i\\gamma}I\\ \\Rightarrow\\ U_2 = e^{i\\gamma}U_1',
          why: 'Only a multiple of the identity gives the same expectation for every state, and a [[global-phase|global phase]] is no new operation.',
        },
      ],
      formal: [
        {
          tex: '\\langle\\Pi_2|\\Pi_1\\rangle = \\langle\\psi|U_2^{-1}U_1|\\psi\\rangle\\,\\langle\\Pi_2\'|\\Pi_1\'\\rangle',
          why: 'Eqs. 8.16–8.17: the left side is independent of $\\psi$.',
          view: circ(C_PR(ALPHA), 3),
          viewCaption: 'overlaps through a unitary',
        },
        {
          tex: 'U_2^{-1}U_1 = e^{-i\\gamma}I\\ \\Rightarrow\\ U_2 = e^{i\\gamma}U_1',
          why: 'A constant expectation over all states forces a multiple of the identity.',
          view: bl({ thetaDeg: 60, phiDeg: 0 }, { measure: 'z' }),
          viewCaption: 'the z reading depends on the state',
        },
      ],
    },
  },
  {
    id: 'q20-no-go:b4',
    phase: 'books',
    text:
      `Different operations need [[qc-orthogonal|orthogonal]] programs. So the program register needs at least as many dimensions as there are different operations. Ten program qubits give $2^{10} = ${V.q20MaxOps10}$ dimensions, so at most ${V.q20MaxOps10} operations.`,
    formal:
      `If $\\langle\\Pi'_2|\\Pi'_1\\rangle = 0$ then $\\langle\\Pi_2|\\Pi_1\\rangle = 0$ too: operations that differ by more than a phase need [[qc-orthogonal|orthogonal]] programs (Bergou p. 150). ` +
      `So $\\dim\\mathcal H_p$ is at least the number of distinct operations. An $n$-qubit register has $2^n$ dimensions: $n = 10$ gives ${V.q20MaxOps10}, and $n = 8$ gives ${V.q20MaxOps8}. The circle of operations $e^{i\\alpha\\sigma_z}$ alone would need infinitely many.`,
    caption: '2ⁿ against n: 1024 at ten program wires',
    captionFormal: '$2^n$ against $n$: $1024$ at $n = 10$',
    stage: plot({ fn: 'twoToN', x: { from: 1, to: 10 }, samples: 9 }, [10]),
    claims: [
      claim('q20MaxOps10', 'ten program qubits hold at most 1024 operations', () => V.q20MaxOps10 === 1024),
      claim('q20MaxOps8', 'eight program qubits hold at most 256 operations', () => V.q20MaxOps8 === 256),
    ],
  },
  {
    id: 'q20-no-go:b5',
    phase: 'clue',
    text:
      'Add a measurement: read the program wire at the end, and if the result is 1, apply a known gate $V$ to the data. Does this beat the counting argument?',
    formal:
      'Take the processor of Eq. 8.18, $G(|\\psi\\rangle|k\\rangle) = \\tfrac{1}{\\sqrt2}(U_k|\\psi\\rangle|0\\rangle + VU_k|\\psi\\rangle|1\\rangle)$ for $k = 1, 2$, followed by measure-and-correct. How many different operations can two programs realise?',
    caption: 'the processor again: a reading added at the end',
    captionFormal: 'Eq. 8.18: the program wire read, then $V$ if the reading is 1',
    stage: circ(C_PR(ALPHA), 3),
    reveal: {
      text:
        `No. The same overlap argument shows that $U_1$ and $U_2$ differ only by a phase. Four operations looked possible, but only ${V.q20MeasCorrectOps} are real: $U_1$ and $VU_1$.`,
      formal:
        `Eq. 8.19 gives $\\langle 1|2\\rangle_p = \\langle\\psi|U_1^{-1}U_2|\\psi\\rangle$, independent of $\\psi$, so $U_2 = e^{i\\gamma}U_1$. The two programs realise ${V.q20MeasCorrectOps} operations, $U_1$ and $VU_1$, not 4.`,
      caption: 'measure-and-correct adds nothing',
      captionFormal: 'two operations, not four',
      stage: circ(C_PR(ALPHA), 3),
      claims: [claim('q20MeasCorrectOps', 'two measure-and-correct programs realise only 2 operations up to a phase', () => V.q20MeasCorrectOps === 2)],
    },
  },
  {
    id: 'q20-no-go:b6',
    phase: 'deeper',
    text:
      'The theorem is about machines that always work. Let a machine fail sometimes, and one qubit of program can hold a whole circle of operations. That is the next unit.',
    formal:
      "Unit 20.3's counting assumes a deterministic machine. Allowing a heralded failure (Bergou §8.4, p. 151) lifts it: one program qubit then serves the continuous group $e^{i\\alpha\\sigma_z}$, at a cost in chance.",
    caption: 'the one-wire program of the next unit',
    captionFormal: 'one program qubit, read at the end',
    stage: circ(C_PR(ALPHA), 4),
  },
]

/* ---------------------------------------------------------------------------------------------- */
/* q20-probabilistic — A machine that sometimes fails                                                */
/* ---------------------------------------------------------------------------------------------- */

const probabilistic: Beat[] = [
  {
    id: 'q20-probabilistic:b1',
    phase: 'books',
    text:
      `Use a <<qc-q4-cnot|CNOT>> with the data as control and a program qubit as target. The program is $|\\Xi(\\alpha)\\rangle = (e^{i\\alpha}|0\\rangle + e^{-i\\alpha}|1\\rangle)/\\sqrt2$. Then read the program wire. ` +
      `If it reads 0, the data got the gate $U(\\alpha)$, which multiplies $|0\\rangle$ by $e^{i\\alpha}$ and $|1\\rangle$ by $e^{-i\\alpha}$. This is a [[qc-probabilistic-gate|probabilistic gate]]. It works with chance ${uf(V.q20CnotSuccess)}.`,
    formal:
      `With $|\\Xi(\\alpha)\\rangle = (e^{i\\alpha}|0\\rangle + e^{-i\\alpha}|1\\rangle)/\\sqrt2$ the output is $\\tfrac{1}{\\sqrt2}(U(\\alpha)|\\psi\\rangle|0\\rangle + U^{-1}(\\alpha)|\\psi\\rangle|1\\rangle)$ with $U(\\alpha) = e^{i\\alpha\\sigma_z}$, which is $R_z(-2\\alpha)$ (Rosetta; Eqs. 8.20–8.21). ` +
      `Keeping the data only when the program reads 0 is a [[qc-probabilistic-gate|probabilistic gate]], with success chance $${tf(V.q20CnotSuccess)}$ for every $\\alpha$ and $\\psi$ (engine ${d(V.q20CnotSuccess, 4)}).`,
    caption: 'the circuit; the program wire reads 0 or 1, equally likely',
    captionFormal: '$p(0) = p(1) = \\tfrac12$',
    stage: split(circ(C_PR(ALPHA), 4), amp(C_PR(ALPHA), 4, 'probability', { keep: [1] })),
    claims: [claim('q20CnotSuccess', 'the program wire reads 0 with chance one half, 0.5000', () => close(V.q20CnotSuccess, 0.5, 1e-12))],
  },
  {
    id: 'q20-probabilistic:b2',
    phase: 'books',
    text:
      `Start from $|+\\rangle$, the state on the equator at azimuth 0. After a success with $\\alpha = 30^\\circ$ it sits at azimuth $-60^\\circ$: its [[relative-phase|relative phase]] has turned by $2\\alpha$, with fidelity 1 to the goal $U(\\alpha)|+\\rangle$. ` +
      `Its arrow is $(${d(V.q20RotX, 4)}, -${d(V.q20RotY, 4)}, 0)$.`,
    formal:
      `$U(\\alpha)|+\\rangle$ has azimuth $-2\\alpha$, so its [[relative-phase|relative phase]] is $-2\\alpha$: its Bloch vector is $(${d(V.q20RotX, 4)}, -${d(V.q20RotY, 4)}, 0)$ at $\\alpha = 30^\\circ$. ` +
      `The success branch equals $U(\\alpha)\\psi$ and the failure branch $U^{-1}(\\alpha)\\psi$ exactly (engine gap $${d(V.q20RotGap, 0)}$).`,
    caption: 'the output arrow turned by −60° about z',
    captionFormal: '$R_z(-60^\\circ)$ applied to $|+\\rangle$',
    stage: bl('+x', { rotate: { axis: 'z', angleDeg: -2 * ALPHA } }),
    claims: [
      claim('q20RotX', 'after a success at α = 30 degrees the arrow of |+> has x part 0.5000', () => close(V.q20RotX, 0.5, 1e-9)),
      claim('q20RotY', 'and y part of size 0.8660, pointing to minus y', () => close(V.q20RotY, 0.866, 5e-5)),
      claim('q20RotGap', 'the success branch is U(α)ψ and the failure branch U−1(α)ψ (gap from a global phase)', () => close(V.q20RotGap, 0, 1e-12)),
    ],
  },
  {
    id: 'q20-probabilistic:b3',
    phase: 'books',
    text:
      `If the program reads 1, the data was turned the wrong way, by $-\\alpha$. Run again with the program $\\Xi(2\\alpha)$: success turns it to $+\\alpha$. Together the chance of success is $${tf(V.q20Rus2)}$. ` +
      `Each failed round halves the chance of failing again, so after $k$ rounds the chance of success is $1 - 2^{-k}$. For $k = 1, \\dots, 7$ it is ${d(V.q20Rus1, 1)}, ${d(V.q20Rus2, 2)}, ${d(V.q20Rus3, 3)}, ${d(V.q20Rus4, 3)}, ${d(V.q20Rus5, 3)}, ${d(V.q20Rus6, 3)}, ${d(V.q20Rus7, 3)}. ` +
      `This is [[qc-repeat-until-success|repeat until success]].`,
    formal:
      `After a failure the data is $U^{-1}(\\alpha)\\psi$. A second run with $|\\Xi(2\\alpha)\\rangle$ gives $\\tfrac{1}{\\sqrt2}(U(\\alpha)\\psi|0\\rangle + U^{-1}(3\\alpha)\\psi|1\\rangle)$ (Eq. 8.29), so the total success chance is $\\tfrac12 + \\tfrac14 = ${tf(V.q20Rus2)}$. ` +
      `Our calculation: round $j$ with $|\\Xi(2^{j-1}\\alpha)\\rangle$ gives $1 - 2^{-k}$ after $k$ rounds: ${d(V.q20Rus1, 1)}, ${d(V.q20Rus2, 2)}, ${d(V.q20Rus3, 3)}, ${d(V.q20Rus4, 3)}, ${d(V.q20Rus5, 3)}, ${d(V.q20Rus6, 3)}, ${d(V.q20Rus7, 3)}. ` +
      `Every success branch equals $U(\\alpha)\\psi$; the drawn circuit keeps the first reading coherent and agrees with the round-by-round simulation (gap $${d(V.q20RusGap, 0)}$).`,
    caption: 'two rounds: the second CNOT acts only if the first reading was 1; the chances of the readings of the two program wires',
    captionFormal: '$1 - 2^{-k}$: the readings $00$, $01$, $10$ succeed, $11$ fails',
    stage: split(circ(C_RUS, 5), amp(C_RUS, 5, 'probability', { keep: [1, 2] })),
    claims: [
      claim('q20Rus1', 'one round succeeds with chance 0.5', () => close(V.q20Rus1, 0.5, 1e-12)),
      claim('q20Rus2', 'two rounds succeed with chance 0.75', () => close(V.q20Rus2, 0.75, 1e-12)),
      claim('q20Rus3', 'three rounds succeed with chance 0.875', () => close(V.q20Rus3, 0.875, 1e-12)),
      claim('q20Rus4', 'four rounds succeed with chance 0.9375 (shown as 0.938)', () => close(V.q20Rus4, 0.9375, 1e-12)),
      claim('q20Rus5', 'five rounds succeed with chance 0.96875 (shown as 0.969)', () => close(V.q20Rus5, 0.96875, 1e-12)),
      claim('q20Rus6', 'six rounds succeed with chance 0.984375 (shown as 0.984)', () => close(V.q20Rus6, 0.984375, 1e-12)),
      claim('q20Rus7', 'seven rounds succeed with chance 0.9921875 (shown as 0.992)', () => close(V.q20Rus7, 0.9921875, 1e-12)),
      claim('q20RusGap', 'the coherent two-round circuit, the round-by-round chance and every success branch agree (max-abs gap)', () => close(V.q20RusGap, 0, 1e-12)),
    ],
    derivation: {
      result: '1 - 2^{-k}',
      ground: [
        {
          tex: '\\Pr(\\text{round 1 fails}) = \\tfrac12',
          why: 'The first round fails when the program wire reads 1, which has chance one half.',
          view: circ(C_RUS, 5),
          viewCaption: 'the retry circuit',
        },
        {
          tex: '\\Pr(\\text{all } k \\text{ rounds fail}) = \\tfrac12\\cdot\\tfrac12\\cdots\\tfrac12 = 2^{-k}',
          why: 'Each retry fails with chance one half again, and the chances multiply.',
          view: amp(C_RUS, 5, 'probability', { keep: [1, 2] }),
          viewCaption: 'chances of the final readings',
        },
        {
          tex: '\\Pr(\\text{success within } k \\text{ rounds}) = 1 - 2^{-k}',
          why: 'Success is the only other outcome.',
        },
      ],
      formal: [
        {
          tex: '\\Pr(\\text{every round fails}) = \\prod_{j=1}^{k}\\tfrac12 = 2^{-k}',
          why: 'Each round fails with chance one half, whatever the data.',
          view: circ(C_RUS, 5),
          viewCaption: 'the retry circuit',
        },
        {
          tex: '\\Pr(\\text{success within } k \\text{ rounds}) = 1 - 2^{-k}',
          why: 'The complement of every round failing.',
          view: amp(C_RUS, 5, 'probability', { keep: [1, 2] }),
          viewCaption: 'chances of the final readings',
        },
      ],
    },
  },
  {
    id: 'q20-probabilistic:b4',
    phase: 'books',
    text:
      `Instead of waiting for a failure, prepare both program wires at the start and add a [[qc-toffoli|Toffoli]] gate. This is the same circuit as in the last beat: the second CNOT acts only if the first program wire holds 1. ` +
      `Three of the four readings succeed: chance $${tf(V.q20ToffoliSuccess)}$ in one go.`,
    formal:
      `Eq. 8.30: take the input $|\\psi\\rangle|\\Xi(\\alpha)\\rangle|\\Xi(2\\alpha)\\rangle$, a CNOT $1\\to2$ and a Toffoli with controls 1, 2 and target 3. The data is left in $U(\\alpha)\\psi$ for the readings $00$, $01$, $10$ of the program wires. ` +
      `For the reading $11$ it is $U^{-1}(3\\alpha)\\psi$ (the readings carry phases that do not matter). ` +
      `Each reading has chance $${tf(V.q20ToffoliFail)}$, so the success chance is $${tf(V.q20ToffoliSuccess)}$. After the failing reading the data overlaps the goal with chance $${tf(V.q20FailOverlap)}$. ` +
      `These are Bergou's two strategies (p. 154): more tries, or a larger program (gap $${d(V.q20ToffoliGap, 0)}$).`,
    caption: 'the amplitudes before the readings: three program readings give the goal, one gives a different data state',
    captionFormal: 'the state after the Toffoli, before the program wires are read',
    stage: split(circ(C_RUS, 4), amp(C_RUS, 4, 'amplitude')),
    claims: [
      claim('q20ToffoliSuccess', 'three of the four program readings succeed: chance 0.75', () => close(V.q20ToffoliSuccess, 0.75, 1e-12)),
      claim('q20ToffoliFail', 'the failing reading has chance 0.25', () => close(V.q20ToffoliFail, 0.25, 1e-12)),
      claim('q20FailOverlap', 'after the failing reading the data overlaps the goal with chance 0.25', () => close(V.q20FailOverlap, 0.25, 1e-12)),
      claim('q20ToffoliGap', 'every reading has chance one quarter and the data in each reading is as Eq. 8.30 says (max-abs gap)', () => close(V.q20ToffoliGap, 0, 1e-12)),
    ],
  },
  {
    id: 'q20-probabilistic:b5',
    phase: 'clue',
    text: 'Keep retrying with a doubled program. How many rounds until the chance of success passes ninety-nine in a hundred?',
    formal: `Find the least $k$ with $1 - 2^{-k} \\ge ${d(V.q20Target99, 2)}$, and the program qubits needed.`,
    caption: 'the circuit for two rounds, as a reminder of what repeats',
    captionFormal: 'two rounds drawn; each further round adds a program qubit',
    stage: circ(C_RUS, 5),
    reveal: {
      text:
        `Seven rounds: $1 - 2^{-7} = ${d(V.q20Rus7, 3)}$, while six give ${d(V.q20Rus6, 3)}. Each round halves the chance of failing but needs a fresh program qubit.`,
      formal:
        `$k = ${V.q20RusRounds99}$: ${d(V.q20Rus6, 3)} at six rounds and ${d(V.q20Rus7, 3)} at seven, with programs $\\Xi(\\alpha), \\Xi(2\\alpha), \\dots, \\Xi(64\\alpha)$ (our extension of Bergou's remark that the procedure can be repeated, p. 152). ` +
        `To pass ${d(V.q20Target999, 3)} takes ${V.q20RusRounds999} rounds.`,
      caption: 'the chances of the readings of the two program wires',
      captionFormal: 'the first two rounds of the doubling programs',
      stage: amp(C_RUS, 5, 'probability', { keep: [1, 2] }),
      claims: [
        claim('q20RusRounds99', 'seven rounds are the fewest that pass the chance 0.99', () => V.q20RusRounds99 === 7),
        claim('q20RusRounds999', 'ten rounds are the fewest that pass the chance 0.999', () => V.q20RusRounds999 === 10),
        claim('q20Target99', 'the first target chance is 0.99', () => close(V.q20Target99, 0.99, 1e-12)),
        claim('q20Target999', 'the second target chance is 0.999', () => close(V.q20Target999, 0.999, 1e-12)),
        claim('q20Rus6', 'six rounds give 0.984375, below 0.99', () => close(V.q20Rus6, 0.984375, 1e-12) && V.q20Rus6 < V.q20Target99),
        claim('q20Rus7', 'seven rounds give 0.9921875, above 0.99', () => close(V.q20Rus7, 0.9921875, 1e-12) && V.q20Rus7 >= V.q20Target99),
      ],
    },
  },
  {
    id: 'q20-probabilistic:b6',
    phase: 'deeper',
    text:
      'This is no loophole. The machine pays in chance, not in dimension. A one-qubit program holds a whole circle of operations, but each use works only half the time.',
    formal:
      'Deterministic programmability is excluded (Unit 20.3); a heralded, probabilistic one is not. The Nielsen–Chuang no-go that Bergou cites (p. 149) is unchanged.',
    caption: 'the one-wire program again',
    captionFormal: 'one program qubit, read at the end',
    stage: circ(C_PR(ALPHA), 4),
  },
]

/* ---------------------------------------------------------------------------------------------- */
/* q20-bell-programs — Programming a phase flip in any basis                                         */
/* ---------------------------------------------------------------------------------------------- */

const bellPrograms: Beat[] = [
  {
    id: 'q20-bell-programs:b1',
    phase: 'books',
    text:
      `Return to the cloner circuit: qubit 1 is the data, qubits 2 and 3 the program. Feed it a <<qc-q6-bell-basis|Bell state>>. The program comes out unchanged and the data gets a Pauli gate. Each of the four Bell states gives a different gate.`,
    formal:
      `Eq. 8.23, with the standard names (Bergou's $\\Psi_\\pm = (|00\\rangle \\pm |11\\rangle)/\\sqrt2$ are our $\\Phi^\\pm$ and his $\\Phi_\\pm$ our $\\Psi^\\pm$): $\\Phi^+ \\to I$, $\\Phi^- \\to \\sigma_z$, $\\Psi^+ \\to \\sigma_x$ and $\\Psi^- \\to -i\\sigma_y$, ` +
      `each acting on $|\\psi\\rangle_1$ with the program state unchanged. Each is a [[qc-bell-program|Bell program]]; the engine's gap is $${d(V.q20BellProgGap, 0)}$ for all four at $\\theta = 60^\\circ$, $\\varphi = 90^\\circ$.`,
    caption: 'program Φ⁻: the data wire after the circuit, with Z applied',
    captionFormal: 'the state after program $\\Phi^-$, with the data wire traced out to the left',
    stage: split(circ(C_CL('Phi-'), 6), mx(rho(C_CL('Phi-'), 6), { partialTrace: { keep: [0] } })),
    claims: [claim('q20BellProgGap', 'each Bell program applies its Pauli and leaves the program unchanged (Eq. 8.23, max-abs gap over four programs)', () => close(V.q20BellProgGap, 0, 1e-12))],
  },
  {
    id: 'q20-bell-programs:b2',
    phase: 'books',
    text:
      `A phase flip about the direction of a state $\\chi$ is $U_\\chi = I - 2|\\chi\\rangle\\langle\\chi|$: it flips $|\\chi\\rangle$ and leaves its opposite alone. It equals minus the arrow's Pauli, $-\\mathbf n\\cdot\\boldsymbol\\sigma$. ` +
      `At $\\theta = 60^\\circ$, $\\varphi = 0^\\circ$ that is $-${d(V.q20Prog60x, 4)}\\,\\sigma_x - ${d(V.q20Prog60z, 1)}\\,\\sigma_z$.`,
    formal:
      `For $|\\chi\\rangle = \\mu|0\\rangle + \\nu|1\\rangle$ (Bergou's $|\\phi\\rangle$): $U_\\chi = -(\\mu\\nu^* + \\mu^*\\nu)\\sigma_x + (\\mu\\nu^* - \\mu^*\\nu)(-i\\sigma_y) + (|\\nu|^2 - |\\mu|^2)\\sigma_z$ (Eqs. 8.24–8.25). ` +
      `The trace is zero, so there is no $I$ term; equivalently $U_\\chi = -\\mathbf n\\cdot\\boldsymbol\\sigma$ for the Bloch direction $\\mathbf n$ of $\\chi$. ` +
      `At $\\theta = 60^\\circ$, $\\varphi = 0^\\circ$ the three coefficients are $-${d(V.q20Prog60x, 4)}$, ${d(V.q20Prog60y, 0)} and $-${d(V.q20Prog60z, 1)}$; the engine's gap to the Pauli form is $${d(V.q20UphiGap, 0)}$.`,
    caption: 'the direction $\\mathbf n$ of $\\chi$ on the ball',
    captionFormal: 'the Bloch direction of $\\chi$ at $(60^\\circ, 0^\\circ)$',
    stage: bl({ thetaDeg: 60, phiDeg: 0 }),
    claims: [
      claim('q20Prog60x', 'at (60, 0) degrees the σx coefficient has size 0.8660 and is negative', () => close(V.q20Prog60x, 0.866, 5e-5)),
      claim('q20Prog60y', 'the −iσy coefficient is 0', () => close(V.q20Prog60y, 0, 1e-12)),
      claim('q20Prog60z', 'the σz coefficient has size 0.5 and is negative', () => close(V.q20Prog60z, 0.5, 1e-12)),
      claim('q20UphiGap', 'the Pauli form equals I − 2|χ><χ| at five directions (Eq. 8.25, max-abs gap)', () => close(V.q20UphiGap, 0, 1e-12)),
    ],
  },
  {
    id: 'q20-bell-programs:b3',
    phase: 'books',
    text:
      `Put those three coefficients on three Bell states: that is the program $\\Xi_\\chi$. Run the circuit, then ask whether the program wires hold the equal mix of the three Bell states used. ` +
      `That happens one time in three, whatever $\\chi$ and the data. When it does, the data was flipped.`,
    formal:
      `Eq. 8.26, in standard names: $|\\Xi_\\chi\\rangle = c_x|\\Psi^+\\rangle + c_y|\\Psi^-\\rangle + c_z|\\Phi^-\\rangle$, with $c_x$, $c_y$, $c_z$ the coefficients of the last beat. ` +
      `Projecting the program wires on $(|\\Psi^+\\rangle + |\\Psi^-\\rangle + |\\Phi^-\\rangle)/\\sqrt3$ succeeds with chance $${tf(V.q20FlipSuccess)}$, independent of $\\chi$ and $\\psi$, and leaves $U_\\chi|\\psi\\rangle$ on the data. ` +
      `The engine gives ${d(V.q20FlipSuccess, 4)} at four directions (gap $${d(V.q20FlipGap, 0)}$).`,
    caption: 'the program’s circuit and the chances of the final readings of the program wires',
    captionFormal: '$\\Xi_\\chi$ at $(60^\\circ, 0^\\circ)$ and the chances of the program wires',
    stage: split(circ(C_CL(XI60), 6), amp(C_CL(XI60), 6, 'probability', { keep: [1, 2] })),
    claims: [
      claim('q20FlipSuccess', 'the flip program succeeds with chance one third (0.3333) at four directions', () => close(V.q20FlipSuccess, 1 / 3, 1e-9)),
      claim('q20FlipGap', 'the chance is one third and the data is U_χ ψ at four directions (max-abs gap)', () => close(V.q20FlipGap, 0, 1e-12)),
    ],
    derivation: {
      result: '\\Pr = \\tfrac13',
      ground: [
        {
          tex: '|\\Xi_\\chi\\rangle = c_x|\\Psi^+\\rangle + c_y|\\Psi^-\\rangle + c_z|\\Phi^-\\rangle,\\quad |c_x|^2 + |c_y|^2 + |c_z|^2 = 1',
          why: 'The program is the three-term mix of Bell states with the flip coefficients.',
          view: circ(C_CL(XI60), 6),
          viewCaption: 'the program circuit',
        },
        {
          tex: 'c_x\\,\\sigma_x|\\psi\\rangle|\\Psi^+\\rangle + c_y\\,(-i\\sigma_y)|\\psi\\rangle|\\Psi^-\\rangle + c_z\\,\\sigma_z|\\psi\\rangle|\\Phi^-\\rangle',
          why: 'Each Bell state applies its own Pauli to the data and stays as it is.',
          view: mx(rho(C_CL(XI60), 6), { partialTrace: { keep: [0] } }),
          viewCaption: 'the data wire after the circuit',
        },
        {
          tex: '\\tfrac{1}{\\sqrt3}\\,U_\\chi|\\psi\\rangle\\ \\text{is left, so}\\ \\Pr = \\tfrac13',
          why: 'Projecting the program wires on the equal mix leaves the data in $U_\\chi\\psi$ with weight $1/\\sqrt3$, so the chance is one third.',
          view: amp(C_CL(XI60), 6, 'probability', { keep: [1, 2] }),
          viewCaption: 'readings of the program wires',
        },
      ],
      formal: [
        {
          tex: '|\\Xi_\\chi\\rangle = c_x|\\Psi^+\\rangle + c_y|\\Psi^-\\rangle + c_z|\\Phi^-\\rangle',
          why: 'Eqs. 8.23–8.26: each Bell state applies its Pauli.',
          view: circ(C_CL(XI60), 6),
          viewCaption: 'the program circuit',
        },
        {
          tex: '\\langle B|\\,\\text{on the program wires}\\ \\to\\ \\tfrac{1}{\\sqrt3}\\,U_\\chi|\\psi\\rangle,\\quad \\Pr = \\tfrac13',
          why: 'The projector on $B = (|\\Psi^+\\rangle + |\\Psi^-\\rangle + |\\Phi^-\\rangle)/\\sqrt3$ leaves $c_x\\sigma_x + c_y(-i\\sigma_y) + c_z\\sigma_z = U_\\chi$ over $\\sqrt3$.',
          view: amp(C_CL(XI60), 6, 'probability', { keep: [1, 2] }),
          viewCaption: 'readings of the program wires',
        },
      ],
    },
  },
  {
    id: 'q20-bell-programs:b4',
    phase: 'books',
    text:
      'The same program has a tidier form, built from $\\chi$ and its opposite after one fixed relabelling of the four basis states.',
    formal:
      `Eq. 8.27: $U_{\\rm in}|00\\rangle = -|10\\rangle$, $U_{\\rm in}|10\\rangle = -|11\\rangle$, $U_{\\rm in}|01\\rangle = |00\\rangle$ and $U_{\\rm in}|11\\rangle = |01\\rangle$, a unitary (engine gap $${d(V.q20UinGap, 0)}$). ` +
      `Eq. 8.28: $|\\Xi_\\chi\\rangle = \\tfrac{1}{\\sqrt2}U_{\\rm in}(|\\chi\\rangle|\\chi^\\perp\\rangle + |\\chi^\\perp\\rangle|\\chi\\rangle)$, equal to Eq. 8.26 up to a global sign, since the phase of $|\\chi^\\perp\\rangle$ is free (overlap ${d(V.q20Xi28Overlap, 4)} at four directions). ` +
      `The basis of the flip is chosen by the program (p. 153).`,
    caption: 'the program as a symmetric pair of χ and its opposite',
    captionFormal: 'the state after the first two columns of the program circuit',
    stage: amp(C_CL(XI60), 2, 'amplitude'),
    claims: [
      claim('q20UinGap', 'U_in is unitary (max-abs gap of U_in† U_in from the identity)', () => close(V.q20UinGap, 0, 1e-12)),
      claim('q20Xi28Overlap', 'the program of Eq. 8.28 overlaps that of Eq. 8.26 with size 1.0000 at four directions', () => close(V.q20Xi28Overlap, 1, 1e-9)),
    ],
  },
  {
    id: 'q20-bell-programs:b5',
    phase: 'clue',
    text: 'Which single Bell state programs a phase flip of $|+\\rangle$?',
    formal: 'For $|\\chi\\rangle = |+\\rangle$ give the coefficients of Eq. 8.25 and name the program.',
    caption: 'the direction +x',
    captionFormal: 'the Bloch direction of $|+\\rangle$',
    stage: bl('+x'),
    reveal: {
      text:
        'The coefficient of $\\sigma_x$ is $-1$ and the others are 0, so the program is one Bell state, $\\Psi^+$ (Bergou: $\\Phi_+$). ' +
        `The chance is still $${tf(V.q20FlipSuccess)}$.`,
      formal:
        `$\\mu = \\nu = 1/\\sqrt2$ gives $(-1, 0, 0)$, so $U_\\chi = -\\sigma_x$ and the program is $-|\\Psi^+\\rangle$ (a global sign). The success chance is $${tf(V.q20FlipSuccess)}$ as for every $\\chi$.`,
      caption: 'the direction +x: only the σx coefficient is non-zero',
      captionFormal: '$(c_x, c_y, c_z) = (-1, 0, 0)$',
      stage: bl('+x'),
      claims: [
        claim('q20ProgPlusX', 'for |+> the σx coefficient is −1', () => close(V.q20ProgPlusX, -1, 1e-12)),
        claim('q20FlipSuccess', 'the flip succeeds with chance one third', () => close(V.q20FlipSuccess, 1 / 3, 1e-9)),
      ],
    },
  },
  {
    id: 'q20-bell-programs:b6',
    phase: 'deeper',
    text:
      `This does not break Unit 20.3. The machine succeeds only one time in three. More tries need fresh programs, as in Unit 20.4.`,
    formal:
      `A heralded gate: deterministic programmability is excluded (Unit 20.3), probabilistic is not. The chance $${tf(V.q20FlipSuccess)}$ is Bergou's value for this circuit (p. 153), and retries reuse the scheme of Unit 20.4.`,
    caption: 'the program circuit once more',
    captionFormal: 'the cloner circuit with the flip program',
    stage: circ(C_CL(XI60), 6),
    claims: [claim('q20FlipSuccess', 'the flip succeeds with chance one third', () => close(V.q20FlipSuccess, 1 / 3, 1e-9))],
  },
]

/* ---------------------------------------------------------------------------------------------- */
/* q20-discriminator — A discriminator that is told the states                                       */
/* ---------------------------------------------------------------------------------------------- */

const discriminator: Beat[] = [
  {
    id: 'q20-discriminator:b1',
    phase: 'books',
    text:
      `In <<qc-q14-usd|Unit 14.4>> the two states were built into the machine. Now they arrive as data: one qubit in $\\psi_1$, one in $\\psi_2$, and a third in either of them. Name which, never wrongly, or say "failed". ` +
      `Their overlap is $s = |\\langle\\psi_1|\\psi_2\\rangle|$, here ${uf(V.q20DiscOverlap)}. This is a [[qc-programmable-discriminator|programmable discriminator]].`,
    formal:
      `(Bergou §8.5, p. 154) On registers A, B, C the inputs are $|\\Psi_1^{\\rm in}\\rangle = |\\psi_1\\rangle_A|\\psi_2\\rangle_B|\\psi_1\\rangle_C$ and $|\\Psi_2^{\\rm in}\\rangle = |\\psi_1\\rangle_A|\\psi_2\\rangle_B|\\psi_2\\rangle_C$ (Eq. 8.31), with $\\psi_1$ and $\\psi_2$ unknown. ` +
      `A [[qc-povm|POVM]] $\\Pi_0 + \\Pi_1 + \\Pi_2 = I$ must never err: $\\Pi_2|\\Psi_1^{\\rm in}\\rangle = \\Pi_1|\\Psi_2^{\\rm in}\\rangle = 0$ (Eqs. 8.32–8.34). Its success chances are $p_j = \\langle\\Psi_j^{\\rm in}|\\Pi_j|\\Psi_j^{\\rm in}\\rangle$. ` +
      `This is the [[qc-programmable-discriminator|programmable discriminator]]; here $s = ${tf(V.q20DiscOverlap)}$.`,
    caption: 'input 1 for a pair at overlap one half: three wires A, B, C',
    captionFormal: '$|\\Psi_1^{\\rm in}\\rangle$ with $s = \\tfrac12$',
    stage: split(circ(C_D1, 1), amp(C_D1, 1, 'probability')),
    claims: [claim('q20DiscOverlap', 'the pair psi1, psi2 has overlap one half', () => close(V.q20DiscOverlap, 0.5, 1e-12))],
  },
  {
    id: 'q20-discriminator:b2',
    phase: 'books',
    text:
      `We know nothing of $\\psi_1$ and $\\psi_2$ except symmetry. Input 1 is unchanged if wires A and C swap. A swap-symmetric state has no overlap with the [[qc-antisymmetric-projector|antisymmetric projector]] of that pair. So test for it.`,
    formal:
      `$|\\Psi_1^{\\rm in}\\rangle$ is symmetric under swapping $A$ and $C$, and $|\\Psi_2^{\\rm in}\\rangle$ under swapping $B$ and $C$. With $|\\psi^-\\rangle = (|01\\rangle - |10\\rangle)/\\sqrt2$ and $P^{\\rm as} = |\\psi^-\\rangle\\langle\\psi^-|$ the [[qc-antisymmetric-projector|antisymmetric projector]], take ` +
      `$\\Pi_1 = c_1I_A \\otimes P^{\\rm as}_{BC}$ and $\\Pi_2 = c_2I_B \\otimes P^{\\rm as}_{AC}$ (Eq. 8.37). The engine finds $\\Pi_2|\\Psi_1^{\\rm in}\\rangle = \\Pi_1|\\Psi_2^{\\rm in}\\rangle = 0$ (gap $${d(V.q20DiscZeroGap, 0)}$) and $p_j = c_j(1 - s^2)/2$ (Eq. 8.38), which is $${d(V.q20DiscPj, 4)}$ at $c_j = ${tf(V.q20OptC)}$ and $s = ${tf(V.q20DiscOverlap)}$.`,
    caption: 'input 1’s bars: the strings that differ by swapping A and C are equal',
    captionFormal: '$|\\Psi_1^{\\rm in}\\rangle$ is symmetric under swapping $A$ and $C$',
    stage: amp(C_D1, 1, 'probability'),
    claims: [
      claim('q20DiscZeroGap', 'the two operators never err: Π2 on input 1 and Π1 on input 2 vanish (Eqs. 8.32–8.34, max norm)', () => close(V.q20DiscZeroGap, 0, 1e-12)),
      claim('q20DiscPj', 'each detection chance is 0.2500 at c = two thirds and s = one half', () => close(V.q20DiscPj, 0.25, 1e-12)),
      claim('q20OptC', 'the best constant is two thirds', () => close(V.q20OptC, 2 / 3, 1e-9)),
      claim('q20DiscOverlap', 'the overlap is one half', () => close(V.q20DiscOverlap, 0.5, 1e-12)),
    ],
  },
  {
    id: 'q20-discriminator:b3',
    phase: 'books',
    text:
      `On average the machine succeeds with chance $P = \\tfrac14(c_1 + c_2)(1 - s^2)$. The failure operator $\\Pi_0 = I - \\Pi_1 - \\Pi_2$ may have no negative eigenvalue. That limits $c_1$ and $c_2$.`,
    formal:
      `Eq. 8.39: $P = \\tfrac12(p_1 + p_2) = \\tfrac14(c_1 + c_2)(1 - s^2)$, subject to $\\Pi_0 \\ge 0$. On the subspace of four dimensions that the vectors of Eq. 8.40 span, once [[qc-orthonormal-basis|orthonormalised]], $\\Pi_0$ is two copies of the block ` +
      `$\\begin{pmatrix} 1 - c_1 - \\tfrac{c_2}{4} & -\\tfrac{\\sqrt3\\,c_2}{4} \\\\ -\\tfrac{\\sqrt3\\,c_2}{4} & 1 - \\tfrac{3c_2}{4} \\end{pmatrix}$ (Eq. 8.41), and on the rest it is $I$. The engine's gap to the full $8 \\times 8$ operator is $${d(V.q20BlockGap, 0)}$.`,
    caption: 'input 2 for comparison: the symmetric pair is now B and C',
    captionFormal: '$|\\Psi_2^{\\rm in}\\rangle$ is symmetric under swapping $B$ and $C$',
    stage: amp(C_D2, 1, 'probability'),
    claims: [claim('q20BlockGap', 'the block of Eq. 8.41 equals the 8×8 failure operator in the basis of Eq. 8.40 (max-abs gap)', () => close(V.q20BlockGap, 0, 1e-12))],
  },
  {
    id: 'q20-discriminator:b4',
    phase: 'books',
    text:
      `A $2\\times2$ block has two eigenvalues. Neither may be negative, so its determinant must be at least 0: $1 - c_1 - c_2 + \\tfrac34c_1c_2 \\ge 0$. ` +
      `Taking equality and maximising $c_1 + c_2$ gives $c_1 = c_2 = \\tfrac23$ and $P = \\tfrac13(1 - s^2)$.`,
    formal:
      `The block's trace is $2 - c_1 - c_2$ and its determinant $1 - c_1 - c_2 + \\tfrac34c_1c_2$; Bergou prints a different constant in Eqs. 8.42–8.43 (see the Correction below). Both eigenvalues are at least 0 iff trace and determinant are. ` +
      `Equality in the determinant gives Eq. 8.44, $c_2 = \\tfrac{4 - 4c_1}{4 - 3c_1}$, and maximising $c_1 + c_2$ gives $c_1 = c_2 = ${tf(V.q20OptC)}$ (Eq. 8.46) and $P = \\tfrac13(1 - s^2)$ (Eq. 8.47). ` +
      `At $c = ${tf(V.q20OptC)}$ the block's eigenvalues are $${d(V.q20BlockEigLo, 0)}$ and $${d(V.q20BlockEigHi, 4)}$; a grid over $(c_1, c_2)$ agrees.`,
    caption: 'the chance of success against the overlap, programmable machine: 0.25 at s = ½',
    captionFormal: '$P = \\tfrac13(1 - s^2)$: $0.2500$ at $s = \\tfrac12$',
    stage: USD([0.5]),
    claims: [
      claim('q20DetCoef', 'the c1 c2 coefficient of the block determinant is 0.75', () => close(V.q20DetCoef, 0.75, 1e-9)),
      claim('q20SumC', 'the best c1 + c2 is four thirds', () => close(V.q20SumC, 4 / 3, 1e-9)),
      claim('q20OptC', 'the best c1 = c2 is two thirds (bisection on the failure operator, not Eq. 8.44)', () => close(V.q20OptC, 2 / 3, 1e-9)),
      claim('q20DiscPj', 'at that constant each detection chance is 0.2500 at s = one half', () => close(V.q20DiscPj, 0.25, 1e-12)),
      claim('q20ConstTrue', 'the true determinant at c = two thirds is 0', () => close(V.q20ConstTrue, 0, 1e-12)),
      claim('q20ConstPrinted', 'the printed constant would give two thirds there', () => close(V.q20ConstPrinted, 2 / 3, 1e-9)),
      claim('q20DiscPrinted', 'the printed discriminant is −2.2222, so non-real roots for a Hermitian block', () => close(V.q20DiscPrinted, 20 / 9, 1e-9)),
      claim('q20BlockEigLo', 'the block has the eigenvalue 0 at c = two thirds', () => close(V.q20BlockEigLo, 0, 1e-12)),
      claim('q20BlockEigHi', 'and the eigenvalue 0.6667', () => close(V.q20BlockEigHi, 2 / 3, 1e-9)),
    ],
    derivation: {
      result: 'P = \\tfrac13(1 - s^2)',
      ground: [
        {
          tex: '1 - c_1 - c_2 + \\tfrac34c_1c_2 \\ge 0',
          why: 'The block of the failure operator has no negative eigenvalue, so its determinant is at least 0.',
          view: amp(C_D2, 1, 'probability'),
          viewCaption: 'input 2’s bars: symmetric in B and C',
        },
        {
          tex: 'c_1 = c_2 = \\tfrac23',
          why: 'Along the edge where the determinant is 0, the sum $c_1 + c_2$ is largest when the two are equal.',
          view: USD([0.5]),
          viewCaption: 'the programmable curve',
        },
        {
          tex: 'P = \\tfrac14(c_1 + c_2)(1 - s^2) = \\tfrac14\\cdot\\tfrac43(1 - s^2)',
          why: 'Put $c_1 + c_2 = 4/3$ into the success chance.',
        },
        {
          tex: 'P = \\tfrac13(1 - s^2)',
          why: 'One quarter times four thirds is one third.',
          view: USD([0.5], true),
          viewCaption: 'programmable against known states',
        },
      ],
      formal: [
        {
          tex: '1 - c_1 - c_2 + \\tfrac34c_1c_2 \\ge 0',
          why: 'The determinant of the block (the true constant, not the printed one).',
          view: amp(C_D2, 1, 'probability'),
          viewCaption: 'input 2’s bars: symmetric in B and C',
        },
        {
          tex: 'c_1 = c_2 = \\tfrac23,\\quad P = \\tfrac14\\cdot\\tfrac43(1 - s^2)',
          why: 'Eq. 8.46 maximises $c_1 + c_2$ on the edge.',
          view: USD([0.5]),
          viewCaption: 'the programmable curve',
        },
        {
          tex: 'P = \\tfrac13(1 - s^2)',
          why: 'Eq. 8.47.',
          view: USD([0.5], true),
          viewCaption: 'programmable against known states',
        },
      ],
    },
  },
  {
    id: 'q20-discriminator:b5',
    phase: 'books',
    text:
      `If the two states were known, the best chance would be $1 - s$ (<<qc-q14-usd|Unit 14.4>>). At $s = ${tf(V.q20DiscOverlap)}$ that is ${d(V.q20DiscKnown05, 1)}, against ${d(V.q20DiscP05, 2)} for the programmable machine. ` +
      `The programmable machine gives up chance for flexibility: it works for any two states.`,
    formal:
      `$P_{\\rm known} = 1 - s \\ge P_{\\rm prog} = \\tfrac13(1 - s^2)$ with ratio $(1+s)/3$: $${tf(V.q20DiscP0)}$ at $s = 0$, ${d(V.q20DiscRatio05, 1)} at $s = ${tf(V.q20DiscOverlap)}$, and ${d(V.q20DiscRatio0707, 3)} at $s = ${d(V.q20S0707, 4)}$ ` +
      `(the chances ${d(V.q20DiscP0707, 4)} against ${d(V.q20DiscKnown0707, 4)}), tending to $${tf(V.q20OptC)}$ as $s \\to 1$. Knowing the states is like owning unlimited copies of each (Bergou p. 157).`,
    caption: 'the programmable curve under the known-state curve',
    captionFormal: '$P_{\\rm prog}$ below $P_{\\rm known}$ for every $s$',
    stage: USD([0.5], true),
    claims: [
      claim('q20DiscP05', 'at s = one half the programmable chance is 0.25', () => close(V.q20DiscP05, 0.25, 1e-12)),
      claim('q20DiscKnown05', 'at s = one half the known-state chance is 0.5', () => close(V.q20DiscKnown05, 0.5, 1e-12)),
      claim('q20DiscRatio05', 'the ratio of the two at s = one half is 0.5', () => close(V.q20DiscRatio05, 0.5, 1e-12)),
      claim('q20S0707', 'the second pair has overlap 0.7071', () => close(V.q20S0707, 0.7071, 5e-5)),
      claim('q20DiscP0707', 'its programmable chance is 0.1667', () => close(V.q20DiscP0707, 0.1667, 5e-5)),
      claim('q20DiscKnown0707', 'its known-state chance is 0.2929', () => close(V.q20DiscKnown0707, 0.2929, 5e-5)),
      claim('q20DiscRatio0707', 'the ratio there is 0.569', () => close(V.q20DiscRatio0707, 0.569, 5e-4)),
      claim('q20DiscP0', 'at s = 0 the programmable chance is one third', () => close(V.q20DiscP0, 1 / 3, 1e-9)),
      claim('q20OptC', 'the ratio tends to two thirds as s tends to 1', () => close(V.q20OptC, 2 / 3, 1e-9)),
    ],
  },
  {
    id: 'q20-discriminator:b6',
    phase: 'clue',
    text: 'The two program qubits are orthogonal, $s = 0$. A known pair is told apart every time. What chance does the programmable machine have?',
    formal: 'Evaluate $P_{\\rm prog}$ and $P_{\\rm known}$ at $s = 0$ and explain the gap.',
    caption: 'the left end of the two curves',
    captionFormal: '$s = 0$',
    stage: USD([0], true),
    reveal: {
      text:
        `Only $${tf(V.q20DiscP0)}$, against 1. The machine does not know the states are orthogonal; it can only test for the antisymmetric part.`,
      formal:
        `$P_{\\rm prog}(0) = ${tf(V.q20DiscP0)}$ and $P_{\\rm known}(0) = 1$: with one unknown example of each state, orthogonality is not available to the POVM (Eq. 8.47).`,
      caption: 'the left end of the two curves: one third against 1',
      captionFormal: '$P_{\\rm prog}(0) = \\tfrac13$ and $P_{\\rm known}(0) = 1$',
      stage: USD([0], true),
      claims: [
        claim('q20DiscP0', 'at s = 0 the programmable chance is one third', () => close(V.q20DiscP0, 1 / 3, 1e-9)),
        claim('q20DiscKnown0', 'at s = 0 the known-state chance is 1', () => close(V.q20DiscKnown0, 1, 1e-12)),
      ],
    },
  },
]

export const Q20_STORY: Record<string, Beat[]> = {
  'q20-cloner': cloner,
  'q20-unot': unot,
  'q20-no-go': noGo,
  'q20-probabilistic': probabilistic,
  'q20-bell-programs': bellPrograms,
  'q20-discriminator': discriminator,
}

/** Every claim used anywhere in a unit's beats, for Unit.claims (content.test.tsx "claims hold"). */
function allClaims(beats: Beat[]) {
  return beats.flatMap((b) => [...(b.claims ?? []), ...(b.reveal?.claims ?? []), ...(b.derivation?.ground.flatMap((s) => s.claims ?? []) ?? []), ...(b.derivation?.formal?.flatMap((s) => s.claims ?? []) ?? [])])
}
export const Q20_UNIT_CLAIMS_BY_ID: Record<string, ReturnType<typeof allClaims>> = Object.fromEntries(Object.entries(Q20_STORY).map(([id, beats]) => [id, allClaims(beats)]))
