/**
 * Chapter Q24 scroll story (Physics 709; roles P + W). Beats per docs/roles/proposals/P-Q24-story.md §1, in both tracks, under the judge's rulings
 * (docs/roles/decisions/qc709-Q20-Q27.md: Z2 no hardware digits, Z3 Corrections proposed as "our calculation finds ..." for the review to confirm, Z5 no new SVG kind).
 *
 * Build notes against the plan:
 * - Phase `'books'` throughout (no 709 notes cover Bergou Chapter 12): ramp beats are `books`, the clues are `clue`; the plan has no Go-deeper beat.
 * - Every number is the ENGINE's (Q24.values.ts, physics/qc/blocheq.ts and pulses.ts). A number shown with a minus sign is stored as its size and the sign is asserted in a claim.
 * - No experimental number: the gate budget (1 microsecond against 1 millisecond), the noise (rms 1) and the drives are stated MODEL inputs (ruling Z2).
 * - The number reader takes a bare numeric fraction in TeX for a result: formulas are written \frac{\gamma}{2}, \frac{1}{T_2}, never \tfrac12 or 1/2T_1.
 * - A stage `split` never repeats a kind, so each pair below is picture + matrix or curve + matrix; two curves in one picture use `vs`.
 * - Unit mentions inside Foundations and Spin Lab are bridge chips <<id|Unit L12.7>>; this chapter's own units and the other 709 chapters are named in words ("Unit 24.2", "Chapter Q13"),
 *   except the units of the bridge rows (Q13, Q21, Q8, Q3, Q4).
 * - The times T1, T2 are in units where gamma = 1 unless a beat says otherwise.
 */
import type { BallState, Beat, BlochState, CircuitStageState, Claim, Dir, MatrixGridState, MatrixSource, PlotState, StageLayout, StageState } from '../schema'
import type { Circuit } from '../../physics/qc/circuit'
import { AXIS_THETA, AXIS_THETA_OFF, C_LIFE, R_FIG, R_GROUND, R_PLUS_X, R_STEP, R_T1, R_TPHI, V, type ValueKey, claim, close, d, tf, uf } from './Q24.values'

/* ---------------------------------------------------------------------------------------------- */
/* Stage shorthand (plan "Stage shorthand"), as plain builder functions                              */
/* ---------------------------------------------------------------------------------------------- */
const circ = (C: Circuit, upTo: number, extra: Partial<Omit<CircuitStageState, 'kind' | 'circuit' | 'upTo'>> = {}): CircuitStageState => ({ kind: 'circuit', circuit: C, upTo, shot: 'Q-WIRES', ...extra })
const mx = (source: MatrixSource, extra: Partial<Omit<MatrixGridState, 'kind' | 'source' | 'labels'>> = {}): MatrixGridState => ({ kind: 'matrix', source, labels: 'kets', values: 'decimal', shot: 'M-GRID', ...extra })
const ball = (r: readonly number[]): BallState => ({ kind: 'bloch-ball', point: { r: [r[0], r[1], r[2]] }, purity: true, shot: 'B-STD' })
const bl = (state: Dir, extra: Partial<Omit<BlochState, 'kind' | 'state'>> = {}): BlochState => ({ kind: 'bloch', state, shot: 'B-STD', ...extra })
const PL = (fn: PlotState['curve']['fn'], vs?: PlotState['curve']['vs'], markers: number[] = [], extra: Partial<Omit<PlotState, 'kind' | 'curve' | 'markers'>> = {}, x?: { from: number; to: number }): PlotState => ({
  kind: 'plot',
  curve: { fn, ...(vs ? { vs } : {}), ...(x ? { x } : {}) },
  markers: markers.map((m) => ({ x: m })),
  shot: 'P-CURVE',
  ...extra,
})
const split = (top: StageState, bottom: StageState): StageLayout => ({ layout: 'split', top, bottom })
/** A gate of a `matrix` product, angles in degrees. */
const G = (name: 'X' | 'Y' | 'Z' | 'Rx' | 'Ry' | 'Rz', deg?: number): MatrixSource => ({ gate: { name, ...(deg === undefined ? {} : { params: [deg] }) } })

/** A claim that a V key is close to the number the text shows (half a unit of the last shown digit by default). */
const cv = (key: ValueKey, text: string, x: number, tol = 5e-5): Claim => claim(key, text, () => close(V[key], x, tol))
/** A claim that a `...Gap` key (a max-abs difference of two routes, about 1e-16) is zero. */
const gap = (key: ValueKey, text: string): Claim => claim(key, text, () => close(V[key], 0, 1e-12))

const EQUATOR_60: Dir = { thetaDeg: 90, phiDeg: 60 }

/* ---------------------------------------------------------------------------------------------- */
/* q24-divincenzo — Seven things a qubit must do                                                     */
/* ---------------------------------------------------------------------------------------------- */

const divincenzo: Beat[] = [
  {
    id: 'q24-divincenzo:b1',
    phase: 'books',
    text:
      `A quantum computer needs five things from its [[qubit|qubits]]. They must be many and well defined. They must start in a known state and stay quantum long enough. ` +
      `They must be readable one at a time, and there must be a universal set of gates. Two more things serve a network, so the full list has $${V.q24CritCompute} + ${V.q24CritNet} = ${V.q24Criteria}$ items: the [[qc-divincenzo-criteria|DiVincenzo criteria]].`,
    formal:
      `The [[qc-divincenzo-criteria|DiVincenzo criteria]] (Bergou §12.1, p. 201) are: scalable and well-characterised [[qubit|qubits]]; initialisation to a fiducial state; a qubit-specific measurement; coherence times long against gate times; a universal gate set. ` +
      `Two more, interconverting stationary and flying qubits and transmitting the flying ones, serve networks: $${V.q24CritCompute} + ${V.q24CritNet} = ${V.q24Criteria}$.`,
    caption: 'the fiducial state: the arrow at the north pole',
    captionFormal: 'initialisation to $|0\\rangle = |{+z}\\rangle$',
    stage: bl('+z'),
    claims: [
      claim('q24Criteria', 'seven criteria in all', () => V.q24Criteria === 7),
      claim('q24CritCompute', 'five of them are for a computer', () => V.q24CritCompute === 5),
      claim('q24CritNet', 'two more are for a network', () => V.q24CritNet === 2),
    ],
  },
  {
    id: 'q24-divincenzo:b2',
    phase: 'books',
    text:
      'Atoms and ions come first, then photons, then chips. Five families of qubit are named, and each meets the criteria in its own way. Spins in diamond and electrons on helium are named but not treated here.',
    formal:
      `Bergou treats five families: neutral atoms and trapped ions (Chapter 13, our Chapter Q25), photons (Chapter 14, our Q26), and superconducting circuits and quantum dots (Chapter 15, our Q27). ` +
      `This chapter supplies the tools they share: the equation for an open qubit, the two decay times, Rabi oscillation and Ramsey interference.`,
    caption: 'prepare, gate, read: the three steps every platform must supply',
    captionFormal: 'prepare, gate, read: the three steps every platform must supply',
    stage: circ(C_LIFE, 2, { outcomes: '1' }),
    claims: [claim('q24Platforms', 'five platform families are named', () => V.q24Platforms === 5)],
  },
  {
    id: 'q24-divincenzo:b3',
    phase: 'clue',
    text:
      `One gate takes the time $t_{\\rm gate} = 1$ microsecond. The [[qc-t2|phase time]] $T_2$ is how long the qubit's phase signal takes to fall to $1/e$ of its size, here 1 millisecond. How many gates fit before the phase signal is down to $1/e$?`,
    formal:
      `Take $t_{\\rm gate} = 1$ microsecond and the [[qc-t2|phase time]] $T_2 = 1$ millisecond (model values, not a platform's). Find $N = T_2/t_{\\rm gate}$, the coherence factor $e^{-t_{\\rm gate}/T_2}$ per gate, and the factor after $N$ gates.`,
    caption: 'the model: one gate in a thousandth of the phase time',
    captionFormal: '$t_{\\rm gate} = 1$ microsecond, $T_2 = 1$ millisecond',
    stage: ball(R_PLUS_X),
    reveal: {
      text: `The number of gates is $N = T_2/t_{\\rm gate}$, a thousand. Each gate costs a thousandth: the phase signal is multiplied by ${d(V.q24SurviveGate, 4)}. After the thousand it is ${d(V.q24SurviveAll, 4)}, which is $1/e$.`,
      formal:
        `$N = ${V.q24GatesPerT2}$. Per gate the factor is $e^{-t_{\\rm gate}/T_2} = ${d(V.q24SurviveGate, 4)}$, and after $N$ gates it is $e^{-1} = ${d(V.q24SurviveAll, 4)}$. ` +
        `The ratio $T_2/t_{\\rm gate}$ is the figure of merit behind the fourth criterion; $T_2$ is defined properly in Unit 24.2.`,
      caption: `the equator state after a thousand gates: the arrow has shrunk to ${d(V.q24SurviveAll, 3)} of its length`,
      captionFormal: `the equator arrow after $N$ gates: length $e^{-1} = ${d(V.q24SurviveAll, 4)}$`,
      stage: ball([V.q24SurviveAll, 0, 0]),
      claims: [
        claim('q24GatesPerT2', 'a thousand gates fit in one phase time', () => V.q24GatesPerT2 === 1000),
        cv('q24SurviveGate', 'each gate multiplies the phase signal by 0.9990', 0.999),
        cv('q24SurviveAll', 'after a thousand gates it is 0.3679, which is 1/e', Math.exp(-1)),
      ],
    },
  },
]

/* ---------------------------------------------------------------------------------------------- */
/* q24-lindblad — Why a qubit slowly forgets                                                         */
/* ---------------------------------------------------------------------------------------------- */

const lindblad: Beat[] = [
  {
    id: 'q24-lindblad:b1',
    phase: 'books',
    introduces: ['qc-lindblad-operator'],
    text:
      `A qubit never sits alone. Ignore its surroundings and each short time step acts like a set of [[qc-kraus-operator|Kraus operators]] (<<qc-q13-from-unitary|Unit 13.1>>). ` +
      `One is nearly the identity. The others are small jumps, the [[qc-lindblad-operator|Lindblad operators]] $L_j$.`,
    formal:
      `Trace out the environment (Fig. 12.1): $\\rho(t) = \\sum_j A_j\\rho(t_0)A_j^\\dagger$ with Kraus operators $A_j$. For a step $\\delta t$ take $A_0 = I + L_0\\delta t$ and $A_j = L_j\\sqrt{\\delta t}$ for $j \\ge 1$, the [[qc-lindblad-operator|Lindblad operators]] $L_j$ of Eq. 12.1. ` +
      `To first order $\\delta\\rho = (L_0\\rho + \\rho L_0^\\dagger + \\sum_{j\\ge1}L_j\\rho L_j^\\dagger)\\,\\delta t$. The Kraus step and the Euler step of the equation below differ by $O(\\delta t^2)$: halving $\\delta t$ divides the gap by ${d(V.q24KrausGapRatio, 0)}.`,
    caption: 'the start: the equator state, an arrow of full length',
    captionFormal: 'the start: the equator state $|{+x}\\rangle$, an arrow of length 1',
    stage: ball(R_PLUS_X),
    claims: [cv('q24KrausGapRatio', 'halving δt divides the Kraus-minus-Euler gap by 4 (engine, two step sizes)', 4, 1e-9)],
  },
  {
    id: 'q24-lindblad:b2',
    phase: 'books',
    text:
      `Total chance must stay 1. That fixes the nearly-identity operator: its correction is minus half of every $L^\\dagger L$. ` +
      `Add the usual turning, $-i[H, \\rho]$ with $H$ the energy matrix, and each jump moves some weight. The result is the [[qc-lindblad-equation|Lindblad equation]].`,
    formal:
      `Write $L_0 = -iH + L_0'$. The condition $\\operatorname{Tr}\\dot\\rho = 0$ forces $L_0' = -\\frac{\\sum_{j\\ge1}L_j^\\dagger L_j}{2}$, which gives the [[qc-lindblad-equation|Lindblad equation]] $\\dot\\rho = -i[H,\\rho] + \\sum_j\\bigl(L_j\\rho L_j^\\dagger - \\frac{L_j^\\dagger L_j\\rho + \\rho L_j^\\dagger L_j}{2}\\bigr)$. ` +
      `The engine's right-hand side has trace $${d(V.q24TraceRate, 0)}$.`,
    caption: 'one short step: the arrow shortens a little and tilts toward the north pole',
    captionFormal: 'one Kraus step of the equation: shorter arrow, tilted toward $|0\\rangle$',
    stage: ball(R_STEP),
    claims: [gap('q24TraceRate', 'the trace of the right-hand side is 0')],
    derivation: {
      result: '\\dot\\rho = -i[H,\\rho] + \\sum_j\\Bigl(L_j\\rho L_j^\\dagger - \\frac{L_j^\\dagger L_j\\rho + \\rho L_j^\\dagger L_j}{2}\\Bigr)',
      ground: [
        {
          tex: '\\rho + \\delta\\rho = A_0\\rho A_0^\\dagger + \\sum_j A_j\\rho A_j^\\dagger,\\quad A_0 = I + L_0\\delta t',
          why: 'One short step is the nearly-identity operator plus the small jumps.',
          view: ball(R_PLUS_X),
          viewCaption: 'one short step: shorter, tilted arrow',
        },
        { tex: '\\dot\\rho = L_0\\rho + \\rho L_0^\\dagger + \\sum_j L_j\\rho L_j^\\dagger', why: 'Keep the terms of first order in the step.' },
        {
          tex: '\\operatorname{Tr}\\dot\\rho = 0 \\;\\Rightarrow\\; L_0 + L_0^\\dagger = -\\sum_j L_j^\\dagger L_j',
          why: 'The total chance must not change.',
          view: ball(R_STEP),
          viewCaption: 'the same, after the trace condition',
        },
        {
          tex: '\\dot\\rho = -i[H,\\rho] + \\sum_j\\Bigl(L_j\\rho L_j^\\dagger - \\frac{L_j^\\dagger L_j\\rho + \\rho L_j^\\dagger L_j}{2}\\Bigr)',
          why: 'Take $L_0 = -iH$ minus half of every $L_j^\\dagger L_j$ and insert it.',
        },
      ],
      formal: [
        {
          tex: '\\dot\\rho = L_0\\rho + \\rho L_0^\\dagger + \\sum_j L_j\\rho L_j^\\dagger',
          why: 'The step $A_0 = I + L_0\\delta t$, $A_j = L_j\\sqrt{\\delta t}$, to first order.',
          view: ball(R_PLUS_X),
          viewCaption: 'one short step: shorter, tilted arrow',
        },
        {
          tex: 'L_0 = -iH - \\frac{\\sum_j L_j^\\dagger L_j}{2}',
          why: 'The trace condition fixes the Hermitian part of $L_0$.',
          view: ball(R_STEP),
          viewCaption: 'the same, after the trace condition',
        },
        {
          tex: '\\dot\\rho = -i[H,\\rho] + \\sum_j\\Bigl(L_j\\rho L_j^\\dagger - \\frac{L_j^\\dagger L_j\\rho + \\rho L_j^\\dagger L_j}{2}\\Bigr)',
          why: 'Insert $L_0$ into the first-order equation.',
        },
      ],
    },
  },
  {
    id: 'q24-lindblad:b3',
    phase: 'books',
    text:
      `Let the excited level decay into the ground level at a rate $\\gamma$. The jump is $\\sqrt\\gamma$ times "drop from excited to ground". Population leaves the excited level at rate $\\gamma$, and the off-diagonal entry shrinks at half that rate. ` +
      `Start on the equator with $\\gamma = 1$ and wait one lifetime, $t = 1/\\gamma$: the excited share is ${d(V.q24ExcT1, 4)} and the off-diagonal entry has size ${d(V.q24CohT1, 4)}.`,
    formal:
      `The jump $L = \\sqrt\\gamma\\,|g\\rangle\\langle e|$ gives Eq. 12.2: $\\dot\\rho = -i[H,\\rho] + \\gamma\\begin{pmatrix}\\rho_{ee} & -\\frac{\\rho_{ge}}{2}\\\\ -\\frac{\\rho_{eg}}{2} & -\\rho_{ee}\\end{pmatrix}$, the [[qc-amplitude-damping|amplitude-damping]] channel of Chapter Q13 in continuous time (<<qc-q13-depolarizing|Unit 13.4>>). ` +
      `Solved with the matrix exponential of the superoperator from $|{+x}\\rangle$ at $t = 1/\\gamma$: $\\rho_{ee} = ${d(V.q24ExcT1, 4)}$ and $|\\rho_{ge}| = ${d(V.q24CohT1, 4)}$. The solution equals Chapter Q13's damping channel with damping chance $1 - e^{-\\gamma t}$ (gap $${d(V.q24DampKrausGap, 0)}$).`,
    caption: `after one lifetime: arrow (${d(V.q24RT1x, 3)}, 0, ${d(V.q24RT1z, 3)}), purity ${d(V.q24PurT1, 3)}`,
    captionFormal: `after $t = 1/\\gamma$: $\\mathbf r = (${d(V.q24RT1x, 3)}, 0, ${d(V.q24RT1z, 3)})$, $\\operatorname{Tr}\\rho^2 = ${d(V.q24PurT1, 3)}$`,
    stage: ball(R_T1),
    claims: [
      cv('q24ExcT1', 'after one lifetime the excited share is 0.1839', 0.1839),
      cv('q24CohT1', 'the off-diagonal entry has size 0.3033', 0.3033),
      cv('q24RT1x', 'the arrow has x part 0.607', 0.607, 5e-4),
      cv('q24RT1z', 'the arrow has z part 0.632', 0.632, 5e-4),
      cv('q24PurT1', 'the purity is 0.884', 0.884, 5e-4),
      gap('q24DampKrausGap', 'the solved equation equals the Chapter Q13 damping channel (max-abs gap)'),
    ],
  },
  {
    id: 'q24-lindblad:b4',
    phase: 'books',
    text:
      `The population falls as $e^{-t/T_1}$ and the phase signal as $e^{-t/T_2}$. The [[qc-t1|population time]] is $T_1 = 1/\\gamma$ and the phase time is $T_2 = 2/\\gamma$: the phase lasts twice as long as the population.`,
    formal:
      `$\\rho_{ee}(t) = \\rho_{ee}(0)e^{-\\gamma t}$ and $\\rho_{ge}(t) = \\rho_{ge}(0)e^{-\\gamma t/2}$, since the excited amplitude falls as $e^{-\\gamma t/2}$. So the [[qc-t1|population time]] is $T_1 = 1/\\gamma$ and $T_2 = 2/\\gamma = ${V.q24T2OverT1}T_1$, read off the superoperator (p. 205). ` +
      `Extra dephasing only shortens $T_2$, so $T_2 \\le 2T_1$.`,
    caption: `population left (solid) and phase signal left (dashed) against time in units of $T_1$: at 1 the values are ${d(V.q24PopFactorT1, 3)} and ${d(V.q24CohFactorT1, 3)}, and at 2 the phase signal is ${d(V.q24CohFactor2T1, 3)}`,
    captionFormal: `$e^{-t/T_1}$ and $e^{-t/T_2}$: at $t = T_1$ they are ${d(V.q24PopFactorT1, 3)} and ${d(V.q24CohFactorT1, 3)}; at $2T_1$ the second is ${d(V.q24CohFactor2T1, 3)}`,
    stage: PL('popDecay', 'cohDecay', [1, 2]),
    claims: [
      cv('q24PopFactorT1', 'at one T1 the population factor is 0.368', 0.368, 5e-4),
      cv('q24CohFactorT1', 'at one T1 the phase factor is 0.607', 0.607, 5e-4),
      cv('q24CohFactor2T1', 'at two T1 the phase factor is 0.368', 0.368, 5e-4),
      claim('q24T2OverT1', 'T2 is twice T1 for pure decay (read off the superoperator)', () => close(V.q24T2OverT1, 2, 1e-9)),
    ],
    derivation: {
      result: 'T_1 = 1/\\gamma,\\quad T_2 = 2/\\gamma',
      ground: [
        { tex: '\\dot\\rho_{ee} = -\\gamma\\rho_{ee},\\quad \\rho_{ee} \\propto e^{-\\gamma t}', why: 'The excited share leaks away at rate $\\gamma$.', view: PL('popDecay'), viewCaption: 'population left' },
        {
          tex: 'c_e \\propto e^{-\\gamma t/2},\\quad \\rho_{ge} = c_gc_e^* \\propto e^{-\\gamma t/2}',
          why: 'The excited amplitude is the square root of the excited share, and the off-diagonal entry is built from it.',
          view: PL('popDecay', 'cohDecay'),
          viewCaption: 'population and phase signal left',
        },
        { tex: 'T_1 = 1/\\gamma,\\quad T_2 = 2/\\gamma', why: 'The $1/e$ times of the two curves.' },
      ],
      formal: [
        { tex: '\\rho_{ee} \\propto e^{-\\gamma t},\\quad \\rho_{ge} \\propto e^{-\\gamma t/2}', why: 'The entries of Eq. 12.2.', view: PL('popDecay'), viewCaption: 'population left' },
        { tex: 'T_1 = 1/\\gamma,\\quad T_2 = 2/\\gamma', why: 'The $1/e$ times.', view: PL('popDecay', 'cohDecay'), viewCaption: 'population and phase signal left' },
      ],
    },
  },
  {
    id: 'q24-lindblad:b5',
    phase: 'books',
    text:
      `Noise can also scramble phase without moving population: [[qc-dephasing|dephasing]], at a rate $\\gamma_\\varphi = 1/T_\\varphi$. Then $\\frac{1}{T_2} = \\frac{\\gamma}{2} + \\gamma_\\varphi$. With $T_1 = T_\\varphi = 1$ the phase lives ${d(V.q24T2Tphi, 4)}, down from $2$.`,
    formal:
      `A second jump, the [[qc-dephasing|dephasing]] jump $\\sqrt{\\gamma_\\varphi/2}\\,Z$, written with the Pauli matrix $Z$ (<<qc-q13-depolarizing|Unit 13.4>>), shrinks $\\rho_{ge}$ at $\\gamma_\\varphi$ and leaves populations alone, so $\\frac{1}{T_2} = \\frac{\\gamma}{2} + \\frac{1}{T_\\varphi}$ with $\\gamma = 1/T_1$. ` +
      `At $T_1 = T_\\varphi = 1$ the decay rate of the off-diagonal entry is ${d(V.q24CohRate, 1)} and $T_2 = ${d(V.q24T2Tphi, 4)}$. Without decay the solved equation equals the Chapter Q13 dephasing channel with $p = (1 - e^{-t/T_\\varphi})/2$ (gap $${d(V.q24DephKrausGap, 0)}$). Problem 2 of §12.6 is cited, not worked.`,
    caption: 'after half a lifetime with decay and dephasing: shorter and lower than with decay alone',
    captionFormal: 'decay and dephasing together at half a lifetime',
    stage: ball(R_TPHI),
    claims: [
      cv('q24T2Tphi', 'with T1 = Tphi = 1 the phase time is 0.6667', 0.6667),
      cv('q24CohRate', 'the off-diagonal entry decays at rate 1.5', 1.5, 1e-9),
      gap('q24DephKrausGap', 'dephasing alone equals the Chapter Q13 dephasing channel (max-abs gap)'),
    ],
  },
  {
    id: 'q24-lindblad:b6',
    phase: 'clue',
    text: `Could a qubit keep its phase three times longer than its population? Try $T_2 = 3T_1$ from the equator state and look at the smaller eigenvalue of the state.`,
    formal:
      `Take $\\rho(t)$ with $\\rho_{ee} = \\frac{e^{-t/T_1}}{2}$ and $|\\rho_{ge}| = \\frac{e^{-t/T_2}}{2}$. Find the least over $t$ of the smaller eigenvalue for $T_2 = 2T_1$ and for $T_2 = 3T_1$.`,
    caption: 'the two curves again: the phase signal against the population',
    captionFormal: 'the factors $e^{-t/T_1}$ and $e^{-t/T_2}$ for $T_2 = 2T_1$',
    stage: PL('popDecay', 'cohDecay'),
    reveal: {
      text: `With $2T_1$ it never goes below 0. With $3T_1$ it reaches $-${d(V.q24MinEig3, 4)}$ near $${d(V.q24MinEigAt, 2)}\\,T_1$: a negative chance. So $T_2$ cannot exceed $2T_1$.`,
      formal:
        `For $T_2 = 2T_1$ the smaller eigenvalue is at least $0$ for all $t$ (it is $0$ only at $t = 0$). For $T_2 = 3T_1$ it is $-${d(V.q24MinEig3, 4)}$ at $t = ${d(V.q24MinEigAt, 2)}\\,T_1$, so $\\rho$ stops being positive: positivity gives $T_2 \\le 2T_1$ (our calculation; the book states the bound).`,
      caption: 'the phase signal falls too slowly for the population: the state would need a negative eigenvalue',
      captionFormal: `$T_2 = 3T_1$ breaks positivity: the smaller eigenvalue is negative near $t = ${d(V.q24MinEigAt, 2)}\\,T_1$`,
      stage: PL('popDecay', 'cohDecay'),
      claims: [
        gap('q24MinEig2', 'with T2 = 2 T1 the smaller eigenvalue never goes below 0'),
        cv('q24MinEig3', 'with T2 = 3 T1 it reaches 0.0096 in size', 0.0096),
        claim('q24MinEig3Sign', 'and that value is negative', () => V.q24MinEig3Sign === -1),
        cv('q24MinEigAt', 'at 3.17 T1', 3.17, 5e-3),
      ],
    },
  },
]

/* ---------------------------------------------------------------------------------------------- */
/* q24-bloch-eq — Driving a qubit that decays                                                        */
/* ---------------------------------------------------------------------------------------------- */

const blochEq: Beat[] = [
  {
    id: 'q24-bloch-eq:b1',
    phase: 'books',
    text:
      `Now shine light on the qubit. The light pushes on the off-diagonal entry, and that entry pushes the populations. Decay pulls both back. Three coupled equations tell the whole story.`,
    formal:
      `Take $H = H_q + H_1$, where $H_q$ holds the level splitting $\\omega_q$ and $H_1$ is the dipole coupling to the field, with no Stark shift. With Eq. 12.2 the Bloch equations of Eq. 12.3 give $\\dot\\rho_{gg}$, $\\dot\\rho_{ee}$ and $\\dot\\rho_{eg}$, with the times $T_1$ and $T_2$. ` +
      `The first two add to $0$: the trace is kept (engine, trace of the right-hand side $${d(V.q24Bloch3Trace, 0)}$).`,
    caption: 'the qubit under a drive: the arrow in the field, with decay pulling it back',
    captionFormal: 'the ground state $|0\\rangle$ at the start of the drive',
    stage: ball(R_GROUND),
    claims: [gap('q24Bloch3Trace', 'the two population equations of the Bloch equations add to zero (trace of the right-hand side)')],
  },
  {
    id: 'q24-bloch-eq:b2',
    phase: 'books',
    introduces: ['qc-rabi-frequency', 'qc-detuning', 'qc-population-inversion'],
    text:
      `Near resonance, drop the terms that wiggle fast. Name the [[qc-rabi-frequency|drive strength]] $\\Omega$, the [[qc-detuning|mismatch]] $\\Delta$ between the drive and the qubit, and the [[qc-population-inversion|inversion]] $w$: the excited share minus the ground share. ` +
      `Spin Lab's <<qc-l12-driven|Unit L12.7>> did the lossless case.`,
    formal:
      `The [[rotating-wave]] approximation keeps the terms at $\\omega - \\omega_q$. With the [[qc-rabi-frequency|Rabi frequency]] $\\Omega$, the [[qc-detuning|detuning]] $\\Delta = \\omega - \\omega_q$, the [[qc-population-inversion|inversion]] $w = \\rho_{ee} - \\rho_{gg}$ and $\\tilde\\rho_{eg} = \\rho_{eg}e^{i\\omega t}$: ` +
      `$\\dot w = -\\frac{1 + w}{T_1} + i(\\Omega\\tilde\\rho_{eg}^* - \\Omega^*\\tilde\\rho_{eg})$ (Eq. 12.4a) and $\\dot{\\tilde\\rho}_{eg} = (i\\Delta - \\frac{1}{T_2})\\tilde\\rho_{eg} - \\frac{i\\Omega w}{2}$ (Eq. 12.4b). ` +
      `For a qubit frequency $\\omega_q = 40\\,\\Omega$ with $\\Omega = 1$, $\\Delta = ${d(V.q24LabDelta, 1)}$, $T_1 = 4$ and $T_2 = 8$, the rotating-wave steady inversion is off by $${d(100 * V.q24RwaRelErr, 2)}\\%$ (the full time-dependent Lindblad equation, no rotating-wave step).`,
    caption: 'the ground-state arrow, with w = −1, as the drive is switched on',
    captionFormal: 'the ground state: $w = -1$ at the start of the drive',
    stage: ball(R_GROUND),
    claims: [
      cv('q24RwaRelErr', 'the rotating-wave steady inversion is off by 0.87 percent at qubit frequency 40 Omega', 0.0087, 5e-5),
      claim('q24LabDelta', 'the detuning of this example is 0.7', () => close(V.q24LabDelta, 0.7, 1e-12)),
    ],
  },
  {
    id: 'q24-bloch-eq:b3',
    phase: 'books',
    text:
      `Wait long enough and drive and decay balance. On resonance the excited share is $s/(2(1+s))$, with $s = T_1T_2\\Omega^2$. It is ${d(V.q24ReeRes1, 2)} at $s = 1$ and ${d(V.q24ReeRes100, 3)} at $s = 100$. ` +
      `It never passes one half: steady light cannot invert a qubit.`,
    formal:
      `Setting the derivatives of Eqs. 12.4 to zero gives $w = -\\frac{1 + \\Delta^2T_2^2}{1 + \\Delta^2T_2^2 + T_1T_2|\\Omega|^2}$ (Eq. 12.5a), so $\\rho_{ee} = \\frac{1 + w}{2}$. On resonance $\\rho_{ee} = \\frac{s}{2(1+s)}$, which is ${d(V.q24ReeRes1, 2)} at $s = 1$ and ${d(V.q24ReeRes100, 3)} at $s = 100$, always below one half. ` +
      `The coherence of Eq. 12.5b needs a sign fix (see the Correction): the same equations give $\\tilde\\rho_{eg} = -iw\\,\\frac{\\Omega T_2}{2}\\,\\frac{1 + i\\Delta T_2}{1 + \\Delta^2T_2^2}$. ` +
      `At $\\Omega = 1$, $\\Delta = ${d(V.q24LabDelta, 1)}$, $T_1 = 4$, $T_2 = 8$ its real part is $-${d(V.q24RtRe, 3)}$, not $+${d(V.q24RtPrintedRe, 3)}$; a time-dependent Lindblad integration without the rotating-wave step (qubit frequency 40) differs from ours by ${d(V.q24FullGapDerived, 5)} and from the printed form by ${d(V.q24FullGapPrinted, 3)}.`,
    caption: 'steady excited share against detuning for weak drive (low curve) and strong drive (high curve)',
    captionFormal: '$\\rho_{ee}(\\Delta T_2)$ at $s = 0.2$ and $s = 5$: the curve never reaches one half',
    stage: PL('steadyLow', 'steadyHigh', [0]),
    claims: [
      cv('q24ReeRes1', 'on resonance the excited share is 0.25 at s = 1', 0.25, 1e-9),
      cv('q24ReeRes100', 'and 0.495 at s = 100', 0.495),
      cv('q24RtRe', 'the real part of the steady coherence is 0.348 in size', 0.348, 5e-4),
      claim('q24RtReSign', 'and it is negative (our calculation)', () => V.q24RtReSign === -1),
      cv('q24RtPrintedRe', 'the printed Eq. 12.5b would give 0.348 in size', 0.348, 5e-4),
      claim('q24RtPrintedReSign', 'with the opposite sign: positive', () => V.q24RtPrintedReSign === 1),
      cv('q24FullGapDerived', 'the no-rotating-wave integration differs from our form by 0.00055', 0.00055, 5e-6),
      cv('q24FullGapPrinted', 'and from the printed form by 0.696', 0.696, 5e-4),
      gap('q24RtSSgap', 'the linear solve of Eqs. 12.4 equals our closed form of Eq. 12.5b (max-abs gap)'),
      claim('q24SWeak', 'the weak-drive curve has s = 0.2', () => close(V.q24SWeak, 0.2, 1e-12)),
    ],
  },
  {
    id: 'q24-bloch-eq:b4',
    phase: 'books',
    text:
      `Far off resonance the lossless solution rocks between 0 and a small ceiling, and its average is ${d(V.q24SchrAvg, 5)}. With decay the settled value is about half of that, ${d(V.q24ReeSS, 6)}. For a while the two agree.`,
    formal:
      `Fig. 12.3 takes $\\Omega = 2\\pi$, $\\Delta = 20\\pi$, $T_1 = ${d(V.q24FigT1, 1)}$ and $T_2 = 5$. The Schrödinger average is $\\langle P_e\\rangle = \\frac{\\Omega^2}{2(\\Omega^2 + \\Delta^2)} = ${d(V.q24SchrAvg, 5)}$, the Bloch steady value is $\\rho_{ee} = ${d(V.q24ReeSS, 6)}$, and the ratio is ${d(V.q24SchrOverBloch, 3)}, close to $2$ (p. 208). ` +
      `Averaged over $0 \\le t \\le ${d(V.q24InHalf, 1)}$ the Bloch chance is ${d(V.q24ReeAvgEarly, 5)}; averaged over $30 \\le t \\le 40$ it is ${d(V.q24ReeAvgLate, 6)}.`,
    caption: `the steady point: an arrow almost at the north pole, with w = −${d(V.q24WssFig, 4)}`,
    captionFormal: `the steady state of Fig. 12.3: $w = -${d(V.q24WssFig, 4)}$, an arrow of length close to 1 near $|0\\rangle$`,
    stage: ball(R_FIG),
    claims: [
      cv('q24SchrAvg', 'the lossless average chance is 0.00495', 0.00495, 5e-6),
      cv('q24ReeSS', 'the Bloch steady excited share is 0.002488', 0.002488, 5e-7),
      cv('q24SchrOverBloch', 'the ratio of the two is 1.990', 1.99, 5e-4),
      cv('q24ReeAvgEarly', 'averaged over the first half unit of time the Bloch chance is 0.00470', 0.0047, 5e-6),
      cv('q24ReeAvgLate', 'averaged over 30 to 40 it is 0.002488', 0.002488, 5e-7),
      cv('q24WssFig', 'the steady inversion is 0.9950 in size', 0.995, 5e-5),
      claim('q24WssFigSign', 'and it is negative', () => V.q24WssFigSign === -1),
      claim('q24FigT1', 'Fig. 12.3 has T1 = 2.5', () => close(V.q24FigT1, 2.5, 1e-12)),
      claim('q24InHalf', 'the early window ends at 0.5', () => close(V.q24InHalf, 0.5, 1e-12)),
    ],
  },
  {
    id: 'q24-bloch-eq:b5',
    phase: 'clue',
    text: `For weak drive the resonance curve is $2/T_2$ wide. If the drive is raised so that $s = 3$, how wide is it?`,
    formal: `From Eq. 12.5a find the full width at half height of $\\rho_{ee}(\\Delta)$ in units of $1/T_2$ for $s = 0$ and $s = 3$.`,
    caption: 'the two steady curves again: the strong-drive one is the wider',
    captionFormal: '$\\rho_{ee}(\\Delta T_2)$ at two drives',
    stage: PL('steadyLow', 'steadyHigh'),
    reveal: {
      text: `Twice as wide: $${d(V.q24FWHM3, 0)}/T_2$. Half height is at $\\Delta T_2 = \\sqrt{1+s}$, so a stronger drive blurs the resonance.`,
      formal:
        `Half height is at $\\Delta^2T_2^2 = 1 + s$, so the full width is $2\\sqrt{1+s}/T_2$: $${d(V.q24FWHM0, 0)}$ at $s = 0$ and $${d(V.q24FWHM3, 0)}$ at $s = 3$ (our calculation from Eq. 12.5a; the book does not state it). A bisection on the curve agrees (gap $${d(V.q24FwhmGap, 0)}$).`,
      caption: 'the strong-drive curve is the wider one',
      captionFormal: 'width $2\\sqrt{1+s}/T_2$',
      stage: PL('steadyLow', 'steadyHigh'),
      claims: [
        claim('q24FWHM0', 'at s = 0 the full width is 2 (units of 1/T2)', () => close(V.q24FWHM0, 2, 1e-12)),
        claim('q24FWHM3', 'at s = 3 it is 4', () => close(V.q24FWHM3, 4, 1e-12)),
        gap('q24FwhmGap', 'the width from bisection equals 2 sqrt(1 + s) (max-abs gap)'),
      ],
    },
  },
]

/* ---------------------------------------------------------------------------------------------- */
/* q24-rabi — Pulses that flip, and gates from them                                                  */
/* ---------------------------------------------------------------------------------------------- */

const rabi: Beat[] = [
  {
    id: 'q24-rabi:b1',
    phase: 'books',
    text:
      `With no decay, two amplitudes tell the story. The drive turns one into the other: a [[qc-rabi-oscillation|Rabi oscillation]]. Spin Lab met this as magnetic resonance (<<qc-l11-two-level|Unit L11.6>>, <<qc-l12-driven|Unit L12.7>>). ` +
      `Here the drive strength is $\\Omega$, and Townsend's drive strength is twice this: $\\omega_1 = 2\\Omega$.`,
    formal:
      `With amplitudes $c_g$ and $c_e$ and the rotating-wave step: $\\dot c_g = \\frac{i\\Omega^*}{2}c_ee^{i\\Delta t}$ and $\\dot c_e = \\frac{i\\Omega}{2}c_ge^{-i\\Delta t}$ (Eq. 12.6), solved by $\\mathbf c(t) = U(t)\\mathbf c(0)$ with $\\Omega' = \\sqrt{|\\Omega|^2 + \\Delta^2}$ (Eq. 12.7), the [[qc-rabi-oscillation|Rabi oscillation]]. ` +
      `Rosetta: Townsend's $\\omega_1$ is $2\\Omega$. The engine's $U$ equals the exponential of the constant-coefficient form for real and complex $\\Omega$ (gap $${d(V.q24U127Gap, 0)}$), and Townsend's closed form of Eq. 4.45 agrees with $\\omega_1 = 2\\Omega$ (gap $${d(V.q24TownsendGap, 0)}$).`,
    caption: 'chance of the excited state against Ωt/π (axis ω₁t/2π): on resonance it reaches 1 at x = 1, the π pulse',
    captionFormal: '$P_e$ against $\\Omega t/\\pi$ (the axis is $\\omega_1t/2\\pi$): 1 at 1, the $\\pi$ pulse',
    stage: PL('rabiFlip', undefined, [0.5, 1]),
    claims: [gap('q24U127Gap', 'Eq. 12.7 equals the matrix exponential of Eq. 12.6 for real and complex Omega (max-abs gap)'), gap('q24TownsendGap', 'Townsend’s closed form with ω1 = 2Ω equals Eq. 12.8 (max-abs gap)')],
    derivation: {
      result: 'P_e = \\frac{|\\Omega|^2}{\\Omega\'^2}\\sin^2\\frac{\\Omega\' t}{2}',
      ground: [
        {
          tex: '\\dot c_g = \\frac{i\\Omega^*}{2}c_ee^{i\\Delta t},\\quad \\dot c_e = \\frac{i\\Omega}{2}c_ge^{-i\\Delta t}',
          why: 'A frame turning at half the detuning makes these equations constant.',
          view: PL('rabiFlip', undefined, [1]),
          viewCaption: 'chance of the excited state on resonance',
        },
        {
          tex: '\\mathbf B = (\\Omega, 0, \\Delta),\\quad \\sin\\xi = |\\Omega|/\\Omega\'',
          why: 'They are a spin in a field of strength $\\Omega\'$, tilted by an angle $\\xi$ from the $z$ axis.',
          view: bl('+z', { rotate: { axis: { thetaDeg: AXIS_THETA_OFF, phiDeg: 0 }, angleDeg: { from: 0, to: 360 } } }),
          viewCaption: 'the field’s tilt and the turning arrow',
        },
        {
          tex: 'P_e = \\sin^2\\xi\\,\\sin^2\\frac{\\Omega\' t}{2}',
          why: 'The arrow turns by $\\Omega\' t$ about the field; from the north pole its height gives this.',
          view: PL('rabiFlipOff', undefined, [0.5]),
          viewCaption: 'off resonance: a lower ceiling',
        },
        { tex: 'P_e = \\frac{|\\Omega|^2}{\\Omega\'^2}\\sin^2\\frac{\\Omega\' t}{2}', why: 'Insert $\\sin^2\\xi = |\\Omega|^2/\\Omega\'^2$.' },
      ],
      formal: [
        {
          tex: '\\mathbf B = (\\Omega, 0, \\Delta),\\quad |\\mathbf B| = \\Omega\'',
          why: 'The constant frame gives a spin in this field.',
          view: bl('+z', { rotate: { axis: { thetaDeg: AXIS_THETA_OFF, phiDeg: 0 }, angleDeg: { from: 0, to: 360 } } }),
          viewCaption: 'the field’s tilt and the turning arrow',
        },
        { tex: 'U = e^{-i\\,\\mathbf B\\cdot\\boldsymbol\\sigma\\,t/2}', why: 'A rotation by $\\Omega\' t$ about $\\mathbf B$, with the Pauli matrices $\\boldsymbol\\sigma$.' },
        {
          tex: 'P_e = \\frac{|\\Omega|^2}{\\Omega\'^2}\\sin^2\\frac{\\Omega\' t}{2}',
          why: 'Read the entry $U_{eg}$.',
          view: PL('rabiFlipOff', undefined, [0.5]),
          viewCaption: 'off resonance: a lower ceiling',
        },
      ],
    },
  },
  {
    id: 'q24-rabi:b2',
    phase: 'books',
    text:
      `Start in the ground state. The chance of the excited state is a sine squared, with a ceiling $|\\Omega|^2/(|\\Omega|^2+\\Delta^2)$. For $\\Omega = 2\\pi$ the [[qc-pi-pulse|π pulse]] takes ${d(V.q24Tpi, 1)}. At $\\Delta = 2\\Omega$ the ceiling drops to ${d(V.q24PeOff, 1)}.`,
    formal:
      `$P_e = \\frac{|\\Omega|^2}{\\Omega'^2}\\sin^2\\frac{\\Omega' t}{2}$ and $P_g = 1 - P_e$ (Eq. 12.8). A [[qc-pi-pulse|π pulse]] on resonance lasts $t_\\pi = \\pi/|\\Omega| = ${d(V.q24Tpi, 1)}$ for $\\Omega = 2\\pi$. For $\\Delta = 4\\pi = 2\\Omega$ the ceiling is ${d(V.q24PeOff, 1)} and $\\Omega' = ${d(V.q24OmPrimeOff, 2)}$ (Fig. 12.2's red curve). ` +
      `On resonance $P_e = ${d(V.q24PeQuarter, 1)}$ at $t = ${d(V.q24TQuarter, 2)}$, half the π time.`,
    caption: 'the same curve with a detuned drive: the ceiling falls to 0.2',
    captionFormal: 'on resonance (ceiling 1) and at $\\Delta = 2\\Omega$ (ceiling 0.2)',
    stage: PL('rabiFlip', 'rabiFlipOff'),
    claims: [
      cv('q24Tpi', 'the π pulse takes 0.5 at Ω = 2π', 0.5, 1e-9),
      cv('q24PeOff', 'at Δ = 2Ω the ceiling is 0.2', 0.2, 1e-9),
      cv('q24OmPrimeOff', 'and Ω′ is 14.05', 14.05, 5e-3),
      cv('q24PeQuarter', 'at a quarter unit of time on resonance P_e is 0.5', 0.5, 1e-9),
      claim('q24TQuarter', 'a quarter unit of time is 0.25', () => close(V.q24TQuarter, 0.25, 1e-12)),
    ],
  },
  {
    id: 'q24-rabi:b3',
    phase: 'books',
    text:
      `A full $2\\pi$ pulse brings the arrow home, but the state is $-|\\psi\\rangle$. A spin-½ turned through a full circle does the same (<<qc-l7-full-turn|Unit L7.2>>). Only $4\\pi$ restores the sign.`,
    formal:
      `On resonance $U(2\\pi/|\\Omega|) = -I$ (gap $${d(V.q24U2piGap, 0)}$), so $|\\psi\\rangle \\to e^{i\\pi}|\\psi\\rangle$, as for a spin turned by $2\\pi$. And $U(4\\pi/|\\Omega|) = +I$ (gap $${d(V.q24U4piGap, 0)}$). The phase is invisible alone and decisive in controlled gates.`,
    caption: 'a full turn about x: the arrow is back; the state’s sign is −1 (stated, not drawn)',
    captionFormal: '$R_x(2\\pi) = -I$: the arrow returns, the amplitude changes sign',
    stage: bl('+z', { rotate: { axis: 'x', angleDeg: { from: 0, to: 360 } } }),
    claims: [gap('q24U2piGap', 'a 2π pulse on resonance is minus the identity (max-abs gap)'), gap('q24U4piGap', 'a 4π pulse is the identity (max-abs gap)')],
  },
  {
    id: 'q24-rabi:b4',
    phase: 'books',
    text:
      `At $\\Delta = 0$ the phase of the drive picks the axis, through a gate $R_x$ or $R_y$ (<<qc-q4-one-qubit-gates|Unit 4.2>>). Our calculation finds that the book's sign for $x$ is reversed: real positive $\\Omega$ turns the arrow the other way.`,
    formal:
      `At $\\Delta = 0$: $U = \\begin{pmatrix}\\cos\\frac{\\theta}{2} & i\\frac{\\Omega^*}{|\\Omega|}\\sin\\frac{\\theta}{2}\\\\ i\\frac{\\Omega}{|\\Omega|}\\sin\\frac{\\theta}{2} & \\cos\\frac{\\theta}{2}\\end{pmatrix}$, $\\theta = |\\Omega|t$. Real $\\Omega > 0$ gives $R_x(-\\theta)$; $R_x(\\theta)$ needs $\\Omega < 0$. ` +
      `For imaginary $\\Omega$ with $i\\Omega > 0$, as printed, the result is $R_y(\\theta)$. At $\\theta = \\pi/2$ the printed $R_x$ is ${d(V.q24SignRxPlus, 3)} from the engine's $U$ (the Correction below).`,
    caption: 'a real positive drive: the arrow goes to +y, not −y',
    captionFormal: '$U(\\Omega > 0) = R_x(-90^\\circ)$: $|0\\rangle \\to |{+y}\\rangle$',
    stage: bl('+z', { rotate: { axis: 'x', angleDeg: { from: 0, to: -90 } } }),
    claims: [
      cv('q24SignRxPlus', 'the printed R_x is 1.414 from the engine’s U at θ = π/2', 1.414, 5e-4),
      gap('q24SignRxMinus', 'the engine’s U for real positive Ω equals R_x(−θ) (max-abs gap)'),
      gap('q24RyGap', 'for imaginary Ω with iΩ positive U equals R_y(θ) (max-abs gap)'),
      gap('q24RxNegGap', 'for real negative Ω, U equals R_x(θ) (max-abs gap)'),
    ],
  },
  {
    id: 'q24-rabi:b5',
    phase: 'books',
    text:
      `A pulse that is a little too long or short rotates by $\\pi(1+\\epsilon)$. A [[qc-composite-pulse|composite pulse]] of four in a row, $R_z(-\\pi)R_x(\\frac{\\pi}{2})R_y(\\pi)R_x(\\frac{\\pi}{2})$, equal a plain π pulse about $x$. ` +
      `With the same fractional error in each, the error is squared. At $\\epsilon = ${d(V.q24InEps001, 2)}$ the plain pulse is off by ${d(V.q24ErrPlain01, 4)} and the four are off by ${d(V.q24ErrComp01, 6)}.`,
    formal:
      `The [[qc-composite-pulse|composite pulse]] of p. 210 equals $R_x(\\pi)$ exactly (engine gap $${d(V.q24CompExact, 0)}$). With every angle scaled by $1+\\epsilon$ the operator-norm error is ${d(V.q24ErrPlain01, 4)} for the plain pulse and ${d(V.q24ErrComp01, 6)} for the composite at $\\epsilon = ${d(V.q24InEps001, 2)}$ (ratio ${d(V.q24RatioEps01, 1)}), and ${d(V.q24ErrPlain10, 3)} against ${d(V.q24ErrComp10, 4)} at $\\epsilon = ${d(V.q24InEps01, 1)}$: $O(\\epsilon)$ against $O(\\epsilon^2)$, the text's claim. ` +
      `Problem 5 of §12.6 asks for the leading terms and is not worked here.`,
    caption: 'error against ε for the plain pulse and the four-pulse sequence, both axes logarithmic, with the matrix of the three middle pulses',
    captionFormal: 'operator-norm error of $R_x(\\pi(1+\\epsilon))$ and of the four-pulse sequence (log–log), and $R_x(\\frac{\\pi}{2})R_y(\\pi)R_x(\\frac{\\pi}{2})$',
    stage: split(PL('pulseErr1', 'pulseErr2', [0.01, 0.1], { xScale: 'log', yScale: 'log' }, { from: 0.001, to: 0.3 }), mx({ product: [G('Rx', 90), G('Ry', 180), G('Rx', 90)] })),
    claims: [
      gap('q24CompExact', 'the four-pulse sequence equals R_x(π) (max-abs gap)'),
      cv('q24ErrPlain01', 'at ε = 0.01 the plain pulse is off by 0.0157', 0.0157),
      cv('q24ErrComp01', 'and the four pulses by 0.000247', 0.000247, 5e-7),
      cv('q24RatioEps01', 'a ratio of 63.7', 63.7, 5e-2),
      cv('q24ErrPlain10', 'at ε = 0.1 the plain pulse is off by 0.157', 0.157, 5e-4),
      cv('q24ErrComp10', 'and the four pulses by 0.0245', 0.0245, 5e-5),
      claim('q24InEps001', 'the small error is 0.01', () => close(V.q24InEps001, 0.01, 1e-12)),
      claim('q24InEps01', 'the larger error is 0.1', () => close(V.q24InEps01, 0.1, 1e-12)),
    ],
    derivation: {
      result: 'R_z(-\\pi)R_x(\\frac{\\pi}{2})R_y(\\pi)R_x(\\frac{\\pi}{2}) = R_x(\\pi)',
      ground: [
        { tex: 'R_y(\\pi) = -iY', why: 'A half turn about $y$ is minus $i$ times the Pauli matrix $Y$.', view: mx({ product: [G('Ry', 180)] }), viewCaption: 'the matrix of $R_y(\\pi)$' },
        {
          tex: 'R_x(\\frac{\\pi}{2})YR_x(\\frac{\\pi}{2}) = \\frac{(I - iX)Y(I - iX)}{2} = Y',
          why: 'The Pauli matrices $X$ and $Y$ anticommute, so $XY + YX = 0$ and $XYX = -Y$.',
        },
        {
          tex: 'R_x(\\frac{\\pi}{2})R_y(\\pi)R_x(\\frac{\\pi}{2}) = -iY',
          why: 'So the three middle pulses give the same matrix as one half turn about $y$.',
          view: mx({ product: [G('Rx', 90), G('Ry', 180), G('Rx', 90)] }),
          viewCaption: 'the three middle pulses',
        },
        { tex: 'R_z(-\\pi)(-iY) = iZ(-iY) = ZY = -iX = R_x(\\pi)', why: 'The first pulse is $R_z(-\\pi) = iZ$, and $ZY = -iX$.' },
      ],
      formal: [
        {
          tex: 'R_x(\\frac{\\pi}{2})R_y(\\pi)R_x(\\frac{\\pi}{2}) = -iY',
          why: 'The sandwich identity, from $XY = -YX$.',
          view: mx({ product: [G('Rx', 90), G('Ry', 180), G('Rx', 90)] }),
          viewCaption: 'the three middle pulses',
        },
        { tex: 'R_z(-\\pi) = iZ', why: 'A half turn about $z$ the other way.' },
        {
          tex: 'iZ(-iY) = ZY = -iX = R_x(\\pi)',
          why: 'Multiply and use $ZY = -iX$.',
          view: mx({ product: [G('Rz', -180), G('Rx', 90), G('Ry', 180), G('Rx', 90)] }),
          viewCaption: 'all four pulses: the matrix of $R_x(\\pi)$',
        },
      ],
    },
  },
  {
    id: 'q24-rabi:b6',
    phase: 'clue',
    text: `Rabi pulses make $x$ and $y$ turns. How can you make a $Z$ gate from them? How long does it take at $\\Omega = 2\\pi$?`,
    formal: `Show that $Z = iYX$ and give the time of two π pulses for $\\Omega = 2\\pi$.`,
    caption: 'two π pulses, about x then y: the product matrix',
    captionFormal: 'the product $YX$, which is $-iZ$',
    stage: mx({ product: [G('Y'), G('X')] }),
    reveal: {
      text: `Do $X$, then $Y$, up to a phase: $iYX = Z$. Two π pulses take $2 \\times ${d(V.q24Tpi, 1)} = ${d(V.q24ZTime, 0)}$. A far-detuned drive can also shift one level's phase without moving populations.`,
      formal:
        `$iYX = Z$ (engine gap $${d(V.q24ZfromYX, 0)}$). Each π pulse takes $t_\\pi = \\pi/|\\Omega| = ${d(V.q24Tpi, 1)}$, so $t = ${d(V.q24ZTime, 0)}$. The book's other route is a strongly off-resonant drive that adds a [[relative-phase|relative phase]].`,
      caption: 'the product YX is −iZ, so iYX = Z',
      captionFormal: '$YX = -iZ$',
      stage: mx({ product: [G('Y'), G('X')] }),
      claims: [gap('q24ZfromYX', 'iYX equals Z (max-abs gap)'), claim('q24ZTime', 'two π pulses take 1 at Ω = 2π', () => close(V.q24ZTime, 1, 1e-9))],
    },
  },
]

/* ---------------------------------------------------------------------------------------------- */
/* q24-ramsey — Two half-pulses and a wait                                                           */
/* ---------------------------------------------------------------------------------------------- */

const ramsey: Beat[] = [
  {
    id: 'q24-ramsey:b1',
    phase: 'books',
    text:
      `Turn the qubit to the equator with a half pulse. Wait, so the arrow turns by an angle $\\varphi$. Give another half pulse and read: this is [[qc-ramsey-interferometry|Ramsey interferometry]]. ` +
      `The chance of reading 1 is $\\cos^2(\\varphi/2)$: ${d(V.q24RamseyP1Deg0, 0)}, ${d(V.q24RamseyP1Deg60, 2)}, ${d(V.q24RamseyP1Deg90, 1)} and ${d(V.q24RamseyP1Deg180, 0)} at $0^\\circ$, $60^\\circ$, $90^\\circ$ and $180^\\circ$.`,
    formal:
      `$R_y(\\frac{\\pi}{2})\\,\\mathrm{diag}(1, e^{i\\varphi})\\,R_y(\\frac{\\pi}{2})|0\\rangle = e^{i\\varphi/2}(-i\\sin\\frac{\\varphi}{2},\\ \\cos\\frac{\\varphi}{2})^T$, so $P(1) = \\cos^2(\\varphi/2)$ (Fig. 12.4), [[qc-ramsey-interferometry|Ramsey interferometry]]. ` +
      `The engine agrees with $\\cos^2(\\varphi/2)$ for $0 \\le \\varphi \\le 7$ (gap $${d(V.q24RamseyGap, 0)}$). Ramsey interference is the heart of atomic clocks (p. 211).`,
    caption: 'three snapshots: after the first half pulse, after the wait by 60°, after the second half pulse',
    captionFormal: 'the sequence for $\\varphi = 60^\\circ$: equator, turned equator, and the final state with $P(1) = 0.75$',
    stage: bl('+z', { rotate: { axis: 'y', angleDeg: { from: 0, to: 90 } } }),
    claims: [
      claim('q24RamseyP1Deg0', 'at φ = 0 the chance of 1 is 1', () => close(V.q24RamseyP1Deg0, 1, 1e-12)),
      cv('q24RamseyP1Deg60', 'at φ = 60 degrees it is 0.75', 0.75, 1e-9),
      cv('q24RamseyP1Deg90', 'at φ = 90 degrees it is 0.5', 0.5, 1e-9),
      claim('q24RamseyP1Deg180', 'at φ = 180 degrees it is 0', () => close(V.q24RamseyP1Deg180, 0, 1e-12)),
      gap('q24RamseyGap', 'the engine equals cos²(φ/2) for φ from 0 to 7 (max-abs gap)'),
    ],
    derivation: {
      result: 'P(1) = \\cos^2(\\varphi/2)',
      ground: [
        {
          tex: '|0\\rangle \\to \\frac{|0\\rangle + |1\\rangle}{\\sqrt2}',
          why: 'A half pulse puts the arrow on the equator.',
          view: bl('+x'),
          viewCaption: 'the equator after the half pulse',
        },
        {
          tex: '\\frac{|0\\rangle + |1\\rangle}{\\sqrt2} \\to \\frac{|0\\rangle + e^{i\\varphi}|1\\rangle}{\\sqrt2}',
          why: 'The wait turns the phase of the excited part by $\\varphi$.',
          view: bl(EQUATOR_60),
          viewCaption: 'after the wait',
        },
        {
          tex: 'P(1) = \\bigl|\\frac{1 + e^{i\\varphi}}{2}\\bigr|^2 = \\cos^2(\\varphi/2)',
          why: 'After the second half pulse the amplitude of 1 is $(1 + e^{i\\varphi})/2$, of size $\\cos(\\varphi/2)$.',
          view: bl(EQUATOR_60, { rotate: { axis: 'y', angleDeg: { from: 0, to: 90 } } }),
          viewCaption: 'after the second half pulse',
        },
      ],
      formal: [
        {
          tex: '\\frac{|0\\rangle + |1\\rangle}{\\sqrt2} \\to \\frac{|0\\rangle + e^{i\\varphi}|1\\rangle}{\\sqrt2}',
          why: 'The first half pulse and the wait.',
          view: bl(EQUATOR_60),
          viewCaption: 'after the wait',
        },
        {
          tex: 'P(1) = \\cos^2(\\varphi/2)',
          why: 'The second half pulse $R_y(\\pi/2)$ reads the phase.',
          view: bl(EQUATOR_60, { rotate: { axis: 'y', angleDeg: { from: 0, to: 90 } } }),
          viewCaption: 'after the second half pulse',
        },
      ],
    },
  },
  {
    id: 'q24-ramsey:b2',
    phase: 'books',
    text:
      `With a drive $\\Omega$ and a small shift $\\delta$ the qubit sits in a field $\\mathbf B = (\\Omega, 0, \\delta)$. The arrow $\\mathbf M$ turns about $\\mathbf B$ like a compass needle: $d\\mathbf M/dt = \\mathbf B \\times \\mathbf M$ (<<qc-q8-ball|Unit 8.5>>). ` +
      `For $\\Omega = 1$ and $\\delta = ${d(V.q24InDelta08, 1)}$ the axis tilts ${d(V.q24TiltDeg, 1)} degrees from $x$.`,
    formal:
      `$H = \\frac{\\Omega\\sigma_x + \\delta\\sigma_z}{2}$ has eigenvalues $\\pm\\frac{\\Omega'}{2}$ with $\\Omega' = \\sqrt{\\Omega^2 + \\delta^2}$ (Eq. 12.9). For $\\rho = \\frac{I + \\mathbf M\\cdot\\boldsymbol\\sigma}{2}$ the equation $\\dot\\rho = i[\\rho, H]$ gives $\\dot{\\mathbf M} = \\mathbf B\\times\\mathbf M$ (Eq. 12.10); the engine's density-matrix evolution equals the rotation (gap $${d(V.q24PrecessGap, 0)}$). ` +
      `The tilt is $\\xi = \\tan^{-1}(\\delta/\\Omega) = ${d(V.q24TiltDeg, 2)}^\\circ$ and $|\\mathbf B| = ${d(V.q24OmPrimeNoise, 3)}$.`,
    caption: 'the arrow turning about the tilted axis',
    captionFormal: 'the arrow turning about $\\mathbf B$, tilted $\\xi$ from $x$',
    stage: bl('+z', { rotate: { axis: { thetaDeg: AXIS_THETA, phiDeg: 0 }, angleDeg: { from: 0, to: 360 } } }),
    claims: [
      cv('q24TiltDeg', 'the field tilts 38.66 degrees from x', 38.66, 5e-3),
      cv('q24OmPrimeNoise', 'and has strength 1.281', 1.281, 5e-4),
      gap('q24PrecessGap', 'the density-matrix evolution equals the turn of the arrow (max-abs gap)'),
      claim('q24InDelta08', 'the shift in this example is 0.8', () => close(V.q24InDelta08, 0.8, 1e-12)),
    ],
  },
  {
    id: 'q24-ramsey:b3',
    phase: 'books',
    text:
      `If the noise only changes the field's strength, the arrow's height stays and its sideways part turns by a random angle $\\chi$. Averaged, the sideways part shrinks by $e^{-\\frac{\\sigma^2}{2}}$, where $\\sigma$ is the noise's rms size: ` +
      `${d(V.q24Gauss1, 3)} at $\\sigma = 1$ and ${d(V.q24Gauss2, 3)} at $\\sigma = 2$.`,
    formal:
      `For noise along $\\mathbf B_0$ the height $M_\\parallel$ is constant and $M_+ = M_x + iM_y$ turns: $M_+(t) = e^{i\\varphi}M_+(0)$ with $\\varphi = B_0t + \\chi$ (Eq. 12.11). ` +
      `For Gaussian $\\chi$ of rms $\\sigma$, $\\langle e^{i\\chi}\\rangle = e^{-\\frac{\\sigma^2}{2}}$ (quadrature and closed form agree: gap $${d(V.q24GaussGap, 0)}$). It equals $e^{-1} = ${d(V.q24GaussE, 4)}$ at $\\sigma = \\sqrt2$.`,
    caption: `the equator arrow shrinking: lengths 1, ${d(V.q24Gauss1, 3)}, ${d(V.q24Gauss2, 3)}`,
    captionFormal: `the equator arrow at $\\sigma = 1$: length $e^{-1/2} = ${d(V.q24Gauss1, 4)}$`,
    stage: ball([V.q24Gauss1, 0, 0]),
    claims: [
      cv('q24Gauss1', 'at σ = 1 the sideways part shrinks to 0.607', 0.607, 5e-4),
      cv('q24Gauss2', 'at σ = 2 to 0.135', 0.135, 5e-4),
      cv('q24GaussE', 'at σ = √2 to 0.3679, which is 1/e', Math.exp(-1)),
      gap('q24GaussGap', 'the quadrature equals e^(−σ²/2) (max-abs gap)'),
    ],
    derivation: {
      result: '\\langle e^{i\\chi}\\rangle = e^{-\\frac{\\sigma^2}{2}}',
      ground: [
        {
          tex: '\\langle e^{i\\chi}\\rangle = \\langle\\cos\\chi\\rangle + i\\langle\\sin\\chi\\rangle = \\langle\\cos\\chi\\rangle',
          why: 'The sine part averages to 0, because the noise turns one way as often as the other.',
          view: ball([V.q24Gauss1, 0, 0]),
          viewCaption: 'the shrinking arrow',
        },
        {
          tex: '-\\frac{\\chi^2}{2\\sigma^2} + i\\chi = -\\frac{(\\chi - i\\sigma^2)^2}{2\\sigma^2} - \\frac{\\sigma^2}{2}',
          why: 'Complete the square in the exponent of the Gaussian weight.',
          view: PL('ouSlow'),
          viewCaption: 'slow noise: a Gaussian curve',
        },
        { tex: '\\langle e^{i\\chi}\\rangle = e^{-\\frac{\\sigma^2}{2}}', why: 'The leftover Gaussian integrates to 1.' },
      ],
      formal: [
        {
          tex: '-\\frac{\\chi^2}{2\\sigma^2} + i\\chi = -\\frac{(\\chi - i\\sigma^2)^2}{2\\sigma^2} - \\frac{\\sigma^2}{2}',
          why: 'The exponent, with the square completed.',
          view: PL('ouSlow'),
          viewCaption: 'slow noise: a Gaussian curve',
        },
        { tex: '\\langle e^{i\\chi}\\rangle = e^{-\\frac{\\sigma^2}{2}}', why: 'Integrate the remaining Gaussian.', view: ball([V.q24Gauss1, 0, 0]), viewCaption: 'the shrinking arrow' },
      ],
    },
  },
  {
    id: 'q24-ramsey:b4',
    phase: 'books',
    text:
      `The phase variance grows like the area under the noise's correlation curve times $t$ when the noise forgets itself quickly. It grows like $t^2$ when the noise hardly changes. ` +
      `The [[qc-t2-star|noise phase time]] $T_2^*$ is the $1/e$ time. Fast noise gives an exponential, $T_2^* = 1/(\\sigma^2\\tau_c)$, with the noise's correlation time $\\tau_c$. Slow noise gives a bell curve, $T_2^* = \\sqrt2/\\sigma$.`,
    formal:
      `Take noise of rms $\\sigma$ and correlation time $\\tau_c$ (our Ornstein–Uhlenbeck model): $\\langle\\chi^2\\rangle = 2\\sigma^2\\tau_c^2(\\frac{t}{\\tau_c} - 1 + e^{-t/\\tau_c})$, which quadrature confirms (gap $${d(V.q24OuVarGap, 0)}$). ` +
      `For $t \\gg \\tau_c$ it is $t$ times the area $2\\sigma^2\\tau_c$; Bergou writes the same growth rate through the noise spectrum at zero frequency, and Eq. 12.12 is the resulting $T_2^*$. For $t \\ll \\tau_c$ it is $\\sigma^2t^2$. ` +
      `At $\\sigma = 1$ the [[qc-t2-star|noise phase time]] is $T_2^* = ${d(V.q24T2starFast, 1)}$ for $\\tau_c = ${d(V.q24InTauFast, 1)}$ and ${d(V.q24T2starSlow, 3)} for $\\tau_c = 10$, between the limits ${d(V.q24T2starWhite, 0)} and $\\sqrt2 = ${d(V.q24T2starStatic, 3)}$.`,
    caption: 'slow noise (falls fast, bell-shaped) against fast noise (falls slowly, exponential)',
    captionFormal: 'the noise-averaged coherence for $\\tau_c = 10$ and $\\tau_c = 0.1$ against $\\sigma t$',
    stage: PL('ouSlow', 'ouFast'),
    claims: [
      cv('q24T2starFast', 'for τc = 0.1 the 1/e time is 10.1', 10.1, 5e-2),
      cv('q24T2starSlow', 'for τc = 10 it is 1.448', 1.448, 5e-4),
      claim('q24T2starStatic', 'the slow limit is √2 = 1.414', () => close(V.q24T2starStatic, 1.414, 5e-4)),
      claim('q24T2starWhite', 'the fast limit is 10', () => close(V.q24T2starWhite, 10, 1e-9)),
      gap('q24OuVarGap', 'the closed variance equals the double quadrature (max-abs gap)'),
      claim('q24InTauFast', 'the fast correlation time is 0.1', () => close(V.q24InTauFast, 0.1, 1e-12)),
    ],
  },
  {
    id: 'q24-ramsey:b5',
    phase: 'clue',
    text: `Noise of size 1 with correlation time 1. Is $T_2^*$ closer to the fast-noise value 1 or the slow-noise value $\\sqrt2$?`,
    formal: `Find the $1/e$ time of the noise-averaged coherence for $\\sigma = \\tau_c = 1$ and compare it with $1/(\\sigma^2\\tau_c)$ and $\\sqrt2/\\sigma$.`,
    caption: 'a middle case between the two curves',
    captionFormal: 'the two curves with the middle case marked',
    stage: PL('ouSlow', 'ouFast', [V.q24T2starMid]),
    reveal: {
      text: `It is ${d(V.q24T2starMid, 3)}, longer than both. The shortcut $1/(\\sigma^2\\tau_c) = 1$ holds only if the noise forgets much faster than the qubit decays.`,
      formal:
        `$T_2^* = ${d(V.q24T2starMid, 3)}$, the root of $\\sigma^2\\tau_c^2(\\frac{t}{\\tau_c} - 1 + e^{-t/\\tau_c}) = 1$, against $1$ and ${d(V.q24T2starStatic, 3)}. Eq. 12.12 is the short-correlation limit and fails for $\\tau_c \\sim T_2^*$, which is why the book calls the $1/f$ case ambiguous (p. 215).`,
      caption: 'the 1/e time of the middle case lies beyond both limits',
      captionFormal: '$T_2^* = 1.841$ for $\\sigma = \\tau_c = 1$',
      stage: PL('ouSlow', 'ouFast', [V.q24T2starMid]),
      claims: [cv('q24T2starMid', 'for σ = τc = 1 the 1/e time is 1.841', 1.841, 5e-4), claim('q24T2starStatic', 'against the slow limit 1.414', () => close(V.q24T2starStatic, 1.414, 5e-4))],
    },
  },
]

/* ---------------------------------------------------------------------------------------------- */
/* q24-decoupling — Undoing slow noise with flips                                                    */
/* ---------------------------------------------------------------------------------------------- */

const decoupling: Beat[] = [
  {
    id: 'q24-decoupling:b1',
    phase: 'books',
    text:
      `This is a [[qc-spin-echo|spin echo]]: wait $\\tau$, flip with a π pulse, wait $\\tau$, flip back. A fixed frequency error adds a phase in the first wait and the opposite phase in the second. They cancel exactly for every error size.`,
    formal:
      `With a frequency error $\\nu(t')$ the phase is $\\varphi(2\\tau) = \\int_\\tau^{2\\tau}\\nu\\,dt' - \\int_0^\\tau\\nu\\,dt'$ (p. 216): zero for a static $\\nu$. The engine's [[qc-spin-echo|spin echo]] $R_x(\\pi)R_z(\\nu\\tau)R_x(\\pi)R_z(\\nu\\tau)$ equals $-I$, the two flips' sign, for $0 \\le \\nu \\le 10$ (gap $${d(V.q24EchoGap, 0)}$). ` +
      `It is a temporal analogue of the decoherence-free subspace of <<qc-q21-dfs|Unit 21.7>>.`,
    caption: 'the flip turns the arrow about x; the second wait then undoes the first',
    captionFormal: 'the π pulse about $x$ on the equator state turned by the first wait',
    stage: bl(EQUATOR_60, { rotate: { axis: 'x', angleDeg: { from: 0, to: 180 } } }),
    claims: [gap('q24EchoGap', 'the echo sequence equals minus the identity for every static error from 0 to 10 (max-abs gap)')],
    derivation: {
      result: '\\varphi(2\\tau) = \\int_\\tau^{2\\tau}\\nu\\,dt\' - \\int_0^\\tau\\nu\\,dt\'',
      ground: [
        {
          tex: '|0\\rangle + e^{-i\\Phi_1}|1\\rangle,\\quad \\Phi_1 = \\int_0^\\tau\\nu\\,dt\'',
          why: 'During the first wait the excited part gains the phase $\\Phi_1$.',
          view: bl(EQUATOR_60),
          viewCaption: 'after the first wait',
        },
        {
          tex: '|1\\rangle + e^{-i\\Phi_1}|0\\rangle \\to e^{-i\\Phi_2}|1\\rangle + e^{-i\\Phi_1}|0\\rangle',
          why: 'The flip swaps the parts; the second wait puts the phase $\\Phi_2$ on the other one.',
        },
        {
          tex: '\\varphi(2\\tau) = \\int_\\tau^{2\\tau}\\nu\\,dt\' - \\int_0^\\tau\\nu\\,dt\'',
          why: 'The second flip restores the parts, and the net phase is $\\Phi_2 - \\Phi_1$, zero for a fixed $\\nu$.',
          view: PL('ouSlow', 'echoOuSlow'),
          viewCaption: 'Ramsey and echo against time',
        },
      ],
      formal: [
        {
          tex: '\\Phi_1 = \\int_0^\\tau\\nu\\,dt\',\\quad \\Phi_2 = \\int_\\tau^{2\\tau}\\nu\\,dt\'',
          why: 'The phases of the two waits (p. 216).',
          view: bl(EQUATOR_60),
          viewCaption: 'after the first wait',
        },
        {
          tex: '\\varphi(2\\tau) = \\int_\\tau^{2\\tau}\\nu\\,dt\' - \\int_0^\\tau\\nu\\,dt\'',
          why: 'The flip changes the sign of the first phase.',
          view: PL('ouSlow', 'echoOuSlow'),
          viewCaption: 'Ramsey and echo against time',
        },
      ],
    },
  },
  {
    id: 'q24-decoupling:b2',
    phase: 'books',
    text:
      `Over the same total time 2, noise of size 1 and correlation time 10 leaves ${d(V.q24RamseyCoh10, 3)} of the Ramsey signal but ${d(V.q24EchoCoh10, 3)} with the echo. ` +
      `For correlation time ${d(V.q24InTauFast, 1)} neither helps: ${d(V.q24RamseyCoh01, 3)} and ${d(V.q24EchoCoh01, 3)}.`,
    formal:
      `With the Ornstein–Uhlenbeck correlation the echo phase variance is $\\sigma^2[4\\tau_c^2(\\frac{\\tau}{\\tau_c} - 1 + e^{-\\tau/\\tau_c}) - 2\\tau_c^2(1 - e^{-\\tau/\\tau_c})^2]$ (quadrature and closed form agree: gap $${d(V.q24EchoVarGap, 0)}$). ` +
      `At $\\tau = 1$ and $\\sigma = 1$: $\\tau_c = 10$ gives ${d(V.q24EchoCoh10, 3)} against Ramsey's ${d(V.q24RamseyCoh10, 3)}, and $\\tau_c = ${d(V.q24InTauFast, 1)}$ gives ${d(V.q24EchoCoh01, 3)} against ${d(V.q24RamseyCoh01, 3)}. ` +
      `The echo helps when the noise is almost constant on the scale $\\tau$ (p. 216).`,
    caption: 'Ramsey signal (falling fast) and echo signal (staying high) against total time, slow noise',
    captionFormal: 'coherence against total time $2\\tau$ for $\\tau_c = 10$: Ramsey and echo',
    stage: PL('ouSlow', 'echoOuSlow', [2]),
    claims: [
      cv('q24RamseyCoh10', 'for τc = 10 the Ramsey signal at total time 2 is 0.154', 0.154, 5e-4),
      cv('q24EchoCoh10', 'and the echo signal is 0.940', 0.94, 5e-4),
      cv('q24RamseyCoh01', 'for τc = 0.1 the Ramsey signal is 0.827', 0.827, 5e-4),
      cv('q24EchoCoh01', 'and the echo signal is 0.844', 0.844, 5e-4),
      gap('q24EchoVarGap', 'the closed echo variance equals the double quadrature (max-abs gap)'),
      claim('q24InTauFast', 'the fast correlation time is 0.1', () => close(V.q24InTauFast, 0.1, 1e-12)),
    ],
  },
  {
    id: 'q24-decoupling:b3',
    phase: 'books',
    text:
      `Real π pulses are a little off, say by 1 %. Twenty flips in the same direction add up to a ${d(V.q24AccumDeg, 0)} degree error, and the chance of the ground state falls to ${d(V.q24PlainPulses, 4)}. ` +
      `Flipping $+x$ and $-x$ alternately cancels it: ${d(V.q24AltPulses, 4)}.`,
    formal:
      `Take $X$ pulses of area $\\pi(1+\\epsilon)$ with $\\epsilon = ${d(V.q24InEps001, 2)}$. Then $2N = 20$ pulses in the same sense give $R_x(20\\pi\\epsilon + 20\\pi)$, an error of $0.2\\pi$, which is ${d(V.q24AccumDeg, 0)} degrees (matrix angle gap $${d(V.q24AccumGap, 0)}$), and $P(0) = \\cos^2(18^\\circ) = ${d(V.q24PlainPulses, 4)}$. ` +
      `The sequence $+X, -X, +X, \\ldots$ multiplies pairs $R_x(\\theta)R_x(-\\theta) = I$ and returns $P(0) = ${d(V.q24AltPulses, 4)}$ (p. 216). Problem 7's refocusing of an Ising coupling is cited, not worked.`,
    caption: 'the same-direction error: 36 degrees from the north pole',
    captionFormal: 'twenty π pulses, each 1 % too large: the arrow ends 36° from $|0\\rangle$',
    stage: bl('+z', { rotate: { axis: 'x', angleDeg: { from: 0, to: V.q24AccumDeg } } }),
    claims: [
      claim('q24AccumDeg', 'twenty pulses 1 percent too large add up to a 36 degree error', () => close(V.q24AccumDeg, 36, 1e-9)),
      gap('q24AccumGap', 'the angle read off the matrix equals 360 N ε (max-abs gap)'),
      cv('q24PlainPulses', 'the chance of the ground state falls to 0.9045', 0.9045),
      cv('q24AltPulses', 'alternating the sign gives 1.0000', 1, 5e-5),
      claim('q24InEps001', 'the fractional error is 0.01', () => close(V.q24InEps001, 0.01, 1e-12)),
    ],
  },
]

export const Q24_STORY: Record<string, Beat[]> = {
  'q24-divincenzo': divincenzo,
  'q24-lindblad': lindblad,
  'q24-bloch-eq': blochEq,
  'q24-rabi': rabi,
  'q24-ramsey': ramsey,
  'q24-decoupling': decoupling,
}

/** Every claim used anywhere in a unit's beats, for Unit.claims (content.test.tsx "claims hold"). */
function allClaims(beats: Beat[]) {
  return beats.flatMap((b) => [...(b.claims ?? []), ...(b.reveal?.claims ?? []), ...(b.derivation?.ground.flatMap((s) => s.claims ?? []) ?? []), ...(b.derivation?.formal?.flatMap((s) => s.claims ?? []) ?? [])])
}
export const Q24_UNIT_CLAIMS_BY_ID: Record<string, ReturnType<typeof allClaims>> = Object.fromEntries(Object.entries(Q24_STORY).map(([id, beats]) => [id, allClaims(beats)]))

void tf
void uf
