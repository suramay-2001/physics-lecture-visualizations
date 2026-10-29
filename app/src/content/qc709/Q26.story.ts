/**
 * Chapter Q26 scroll story (Physics 709; roles P + W). Beats per docs/roles/proposals/P-Q26-story.md §1, in both tracks, under the judge's rulings
 * (docs/roles/decisions/qc709-Q20-Q27.md: Z2 no hardware digits, Z3 the Correction proposed as "our calculation finds ..." for the review to confirm, Z5 no new SVG kind).
 *
 * Build notes against the plan:
 * - Phase `'books'` throughout (no 709 notes cover Bergou Chapter 14): ramp beats are `books`, the clues are `clue`, the Go-deeper beats are `deeper` and last in their unit.
 * - Every number is the ENGINE's (Q26.values.ts, physics/qc/photons.ts). A number shown with a minus sign is stored with its sign where a picture needs it and shown by its size.
 * - The stage draws at most five wires, so the six-wire circuit of Fig. 14.7 is run by the engine (its claims) and drawn in pieces: the resource |r> (four wires), one input teleported (three
 *   wires), and the ideal CNOT on |+0> (two wires), which is what the teleported gate delivers. A stage `split` never repeats a kind, so the plan's pair of `amplitudes` pictures for the
 *   sign gate is one picture with phase dials.
 * - Fock labels on an `amplitudes` bar are bit strings: captions name the bars (00 = |20>, 01 = |11>, 10 = |02> in the two-photon block), and Rosetta lines say a Fock label is not a register.
 * - The number reader takes digits around a point for a decimal: equations are cited as "Eq. 14.1a" or "Eqs. 14.1-14.2" (a range), figures as "Fig. 14.5" (never "Figure 14.5" or "Figs."),
 *   a fraction inside TeX is written \tfrac{c}{4} or \frac{..}{..}, never 2/4, and an experiment's number never appears (Z2).
 * - Unit mentions inside Foundations and Spin Lab are bridge chips <<id|Unit F4.4>>; this chapter's own units and the other 709 chapters are named in words ("Unit 26.4", "Chapter Q24").
 */
import type { Circuit } from '../../physics/qc/circuit'
import type { AmplitudesState, Beat, BlochState, CircuitStageState, ComplexPlaneState, PlotPoint, PlotPointsState, PlotState, StageLayout, StageState, TwoQubitState } from '../schema'
import { C_BS, C_BS2, C_CNOT, C_CZ, C_DR, C_ENT, C_HOM, C_KERR, C_RES, C_T1, C_U, V, claim, close, d, pct, tf, uf } from './Q26.values'

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
const ampT = (terms: string, mode: AmplitudesState['mode'], extra: Partial<Omit<AmplitudesState, 'kind' | 'state' | 'mode'>> = {}): AmplitudesState => ({
  kind: 'amplitudes',
  state: { terms },
  mode,
  shot: 'A-BARS',
  ...extra,
})
const tq = (C: Circuit, upTo: number): TwoQubitState => ({
  kind: 'two-qubit',
  source: { ket: { circuit: C, upTo } },
  readouts: ['concurrence', 'entropy'],
  labels: 'A-B',
  arrows: 'reduced',
  grid: 'none',
  shot: 'TQ-PAIR',
})
const bl = (thetaDeg: number, phiDeg: number, extra: Partial<Omit<BlochState, 'kind' | 'state'>> = {}): BlochState => ({ kind: 'bloch', state: { thetaDeg, phiDeg }, labels: 'poincare', shot: 'B-STD', ...extra })
const cp = (z: number, w: number): ComplexPlaneState => ({ kind: 'complex-plane', z: { re: z, im: 0 }, w: { re: w, im: 0 }, show: ['sum'], shot: 'C-FLAT' })
const pt = (x: number, y: number, group?: string, label?: string): PlotPoint => ({ x, y, status: 'computed', ...(group ? { group } : {}), ...(label ? { label } : {}) })
const pp = (points: PlotPoint[], xLabel: string, yLabel: string, extra: Partial<Omit<PlotPointsState, 'kind' | 'points' | 'xLabel' | 'yLabel'>> = {}): PlotPointsState => ({
  kind: 'plot',
  points,
  xLabel,
  yLabel,
  shot: 'P-CURVE',
  ...extra,
})
const curve = (fn: PlotState['curve']['fn'], x: { from: number; to: number }, samples: number, extra: Partial<Omit<PlotState, 'kind' | 'curve'>> = {}, vs?: PlotState['curve']['vs']): PlotState => ({
  kind: 'plot',
  curve: { fn, x, samples, ...(vs ? { vs } : {}) },
  shot: 'P-CURVE',
  ...extra,
})
const split = (top: StageState, bottom: StageState): StageLayout => ({ layout: 'split', top, bottom })

/** The amplitude of |n> at the solution (A_n), and the ratios A_n / A_0, for n = 0 to 3. */
const NS_AMP = (): PlotPointsState =>
  pp([V.q26NsA0, V.q26NsA1, V.q26NsA2, V.q26NsA3].map((y, n) => pt(n, y)), 'signal photons n', 'amplitude A_n')
const NS_RATIO = (): PlotPointsState =>
  pp([V.q26NsRatio0, V.q26NsA1overA0, V.q26NsA2overA0, V.q26NsRatio3].map((y, n) => pt(n, y)), 'signal photons n', 'A_n / A_0', { yLines: [{ y: 1 }, { y: -1 }] })
/** The two-gate comparison: this gate against the cited ceiling. */
const CZ_COST = (): PlotPointsState => pp([pt(1, V.q26CzSuccess, undefined, 'this gate'), pt(2, V.q26NsBound, undefined, 'limit (cited)')], 'the two chances compared', 'success chance')
const CZ_ONE = (): PlotPointsState => pp([pt(1, V.q26CzChain0, undefined, 'one gate')], 'gates in a row', 'chance all succeed', { yScale: 'log' })
const CZ_CHAIN = (): PlotPointsState =>
  pp([V.q26CzChain0, V.q26CzChain1, V.q26CzChain2, V.q26CzChain3].map((y, k) => pt(k + 1, y)), 'gates in a row', 'chance all succeed', { yScale: 'log' })
/** KLM's gate success against the photon number n, on a log axis, with the 0.99 line; and the same near the 0.9 line. */
const KLM = (lines: boolean): PlotState =>
  curve('klmSuccess', { from: 1, to: 200 }, 80, { markers: [1, 3, 9, 19, 199].map((x) => ({ x })), xScale: 'log', ...(lines ? { yLines: [{ y: V.q26Target99 }] } : {}) })
const KLM90 = (marks: boolean): PlotState =>
  curve('klmSuccess', { from: 1, to: 40 }, 78, { yLines: [{ y: V.q26Target90 }], ...(marks ? { markers: [{ x: 18 }, { x: 19 }] } : {}) })
/** The exact lower-level shifts of the atom for 0 to 5 photons, and the same with the straight line -chi n. */
const JC_EXACT = (): PlotPointsState =>
  pp([V.q26JcShift0, V.q26JcShift1, V.q26JcShift2, V.q26JcShift3, V.q26JcShift4, V.q26JcShift5].map((y, n) => pt(n, y, 'exact')), 'photons n', 'level shift (Ω₀ units)')
const JC_BOTH = (): PlotPointsState =>
  pp(
    [
      ...[V.q26JcShift0, V.q26JcShift1, V.q26JcShift2, V.q26JcShift3, V.q26JcShift4, V.q26JcShift5].map((y, n) => pt(n, y, 'exact')),
      ...[V.q26JcLine0, V.q26JcLine1, V.q26JcLine2, V.q26JcLine3, V.q26JcLine4, V.q26JcLine5].map((y, n) => pt(n, y, 'dispersive line')),
    ],
    'photons n',
    'level shift (Ω₀ units)',
  )
/** Photon-number chances for n = 0 to 11: the coherent state alone, then with its even cat. */
const COH = (): PlotPoint[] => Array.from({ length: 12 }, (_, n) => pt(n, V[`q26CohPn${n}`], 'coherent'))
const CAT = (): PlotPoint[] => Array.from({ length: 12 }, (_, n) => pt(n, V[`q26CatPn${n}`], 'even cat'))
const COH_PLOT = (): PlotPointsState => pp(COH(), 'photon number n', 'chance of n photons')
const COH_CAT_PLOT = (): PlotPointsState => pp([...COH(), ...CAT()], 'photon number n', 'chance of n photons')

/* ---------------------------------------------------------------------------------------------- */
/* q26-encodings — Three ways to write a photon qubit                                                 */
/* ---------------------------------------------------------------------------------------------- */

const encodings: Beat[] = [
  {
    id: 'q26-encodings:b1',
    phase: 'books',
    text:
      `A photon can hold a [[qubit|qubit]]: horizontal polarization is $|0\\rangle$ and vertical polarization is $|1\\rangle$ (<<qc-q2-photon|Unit 2.6>>). ` +
      `Light keeps its polarization as it travels, and wave plates turn it easily, so one-qubit gates are cheap. ` +
      `Parts that treat every photon alike make up [[qc-linear-optics|linear optics]]: mirrors, splitters and plates.`,
    formal:
      `Polarization encoding of a [[qubit|qubit]]: $|0\\rangle = |H\\rangle$ and $|1\\rangle = |V\\rangle$ (Bergou p. 253). In an isotropic medium neither the polarization nor the propagation phase changes, so the coherence times can be long. ` +
      `Photons are the practical long-distance carrier, and the BB84 of <<qc-l8-bb84|Unit 8.6>> uses this encoding. ` +
      `[[qc-linear-optics|Linear optics]] is every device whose action on the modes is a unitary matrix on the creation operators. ` +
      `The costs are this chapter's subject: no reliable single-photon source, hard storage, detectors below full efficiency, and no photon–photon interaction. We state them in words and report no number.`,
    caption: 'a horizontal photon: the north pole of the sphere',
    captionFormal: '$|H\\rangle$ is the north pole of the Poincaré sphere',
    stage: bl(0, 0),
  },
  {
    id: 'q26-encodings:b2',
    phase: 'books',
    text:
      `Wave plates, set by two angles $\\theta$ (how far the light turns) and $\\varphi$ (the axis), give the table $U = \\begin{pmatrix}\\cos\\theta & ie^{-i\\varphi}\\sin\\theta\\\\ ie^{i\\varphi}\\sin\\theta & \\cos\\theta\\end{pmatrix}$. ` +
      `Start in $|0\\rangle$: the chance of $|1\\rangle$ is $\\sin^2\\theta$, so it is ${d(V.q26WaveP1, 2)} for $\\theta = 30^\\circ$. The chance of $|0\\rangle$ is ${d(V.q26WaveP0, 2)}.`,
    formal:
      `$U(\\theta,\\varphi) = \\cos\\theta\\,I + i\\sin\\theta(\\cos\\varphi\\,\\sigma_x + \\sin\\varphi\\,\\sigma_y)$ is unitary for plate angles $\\theta$, $\\varphi$ (Bergou p. 257, <<qc-f4-unitary|Unit F4.4>>), and $U|0\\rangle = \\cos\\theta|0\\rangle + ie^{i\\varphi}\\sin\\theta|1\\rangle$. ` +
      `The page prints the [[relative-phase|relative phase]] as $\\varphi$. Our calculation finds $\\varphi + 90^\\circ$, which is $${d(V.q26TruePhase, 0)}^\\circ$ for $\\theta = 30^\\circ$ and $\\varphi = 40^\\circ$, not $${d(V.q26PrintedPhase, 0)}^\\circ$ (Correction K1). ` +
      `The chances are ${d(V.q26WaveP0, 2)} and ${d(V.q26WaveP1, 2)} either way.`,
    caption: `after the plates: bars ${d(V.q26WaveAmp0, 3)} and ${d(V.q26WaveAmp1, 1)}; the second bar's hue is its phase`,
    captionFormal: `bars $\\cos30^\\circ$ and $\\sin30^\\circ$; the phase of the second is $${d(V.q26TruePhase, 0)}^\\circ$`,
    stage: split(circ(C_U, 1), amp(C_U, 1, 'amplitude')),
    claims: [
      claim('q26WaveP0', 'wave plates at theta 30 degrees leave the chance of |0> at 0.75', () => close(V.q26WaveP0, 0.75, 1e-12)),
      claim('q26WaveP1', 'wave plates at theta 30 degrees give the chance of |1> as 0.25', () => close(V.q26WaveP1, 0.25, 1e-12)),
      claim('q26WaveAmp0', 'after the plates the |0> bar has length cos 30 degrees, 0.866', () => close(V.q26WaveAmp0, 0.866, 5e-4)),
      claim('q26WaveAmp1', 'after the plates the |1> bar has length sin 30 degrees, 0.5', () => close(V.q26WaveAmp1, 0.5, 1e-12)),
      claim('q26TruePhase', 'U(30, 40 degrees)|0> has relative phase 130 degrees (arg of the |1> amplitude over the |0> amplitude)', () => close(V.q26TruePhase, 130, 1e-9)),
      claim('q26PrintedPhase', "the page's state cos theta |0> + sin theta e^{i varphi}|1> would have relative phase 40 degrees", () => close(V.q26PrintedPhase, 40, 1e-9)),
    ],
  },
  {
    id: 'q26-encodings:b3',
    phase: 'books',
    text:
      `On the [[bloch-sphere|Bloch sphere]] this state sits at polar angle $2\\theta$, not $\\theta$: $60^\\circ$ for $\\theta = 30^\\circ$. ` +
      `A plate that turns the light by $\\theta$ moves its sphere point by twice as much, as in <<qc-l7-two-angles|Unit 7.1>>.`,
    formal:
      `The state $\\cos\\theta|0\\rangle + \\sin\\theta\\,e^{i\\phi}|1\\rangle$ has Bloch polar angle $2\\theta$ and azimuth $\\phi$. Rosetta: Bergou calls $\\theta$ the polar angle (p. 257); ours is $2\\theta$. ` +
      `Also $U(\\theta,\\varphi) = e^{i\\theta\\,\\hat n\\cdot\\boldsymbol\\sigma}$ with $\\hat n = (\\cos\\varphi, \\sin\\varphi, 0)$ turns the sphere by $2\\theta$ about the equatorial axis $\\hat n$ (<<qc-l7-two-angles|Unit 7.1>>). ` +
      `The state's azimuth $\\phi$ is the axis azimuth $\\varphi$ plus $90^\\circ$. The engine reads polar angle $${d(V.q26BlochPolar, 0)}^\\circ$ and azimuth $${d(V.q26TruePhase, 0)}^\\circ$ for $\\theta = 30^\\circ$ and $\\varphi = 40^\\circ$.`,
    caption: 'the point at polar angle 60°, twice the plate angle 30°',
    captionFormal: 'polar angle $2\\theta = 60^\\circ$, azimuth $130^\\circ$',
    stage: bl(V.q26BlochPolar, V.q26TruePhase),
    claims: [
      claim('q26BlochPolar', 'U(30, 40 degrees)|0> has Bloch polar angle 60 degrees', () => close(V.q26BlochPolar, 60, 1e-9)),
      claim('q26DoubledGap', 'the Bloch polar angle is twice theta at three plate settings (max-abs gap in degrees)', () => close(V.q26DoubledGap, 0, 1e-9)),
    ],
  },
  {
    id: 'q26-encodings:b4',
    phase: 'books',
    text:
      `In a [[qc-dual-rail|dual-rail]] qubit the photon's path is the qubit: path 0 is $|0\\rangle$ and path 1 is $|1\\rangle$. ` +
      `A splitter and a phase shifter turn one photon into $\\cos\\theta|0\\rangle + \\sin\\theta e^{i\\phi}|1\\rangle$. For $\\theta = 30^\\circ$ path 1 gets chance ${d(V.q26DualRailP1, 2)}.`,
    formal:
      `$|0\\rangle$ and $|1\\rangle$ now mean one photon in path 0 or in path 1, the one-photon mode space of <<qc-q5-interferometer|Unit 5.5>>. ` +
      `Fig. 14.3: a splitter with transmission $\\cos\\theta$ and reflection $\\sin\\theta$, then a phase $\\phi$ on path 1, prepares the state from a polarized photon. Run backwards, it converts dual rail to polarization. ` +
      `The chances are ${d(V.q26DualRailP0, 2)} and ${d(V.q26DualRailP1, 2)}.`,
    caption: `after the splitter and the phase: path 1 holds ${d(V.q26DualRailP1, 2)}`,
    captionFormal: `after the splitter and the phase: the chances ${d(V.q26DualRailP0, 2)} and ${d(V.q26DualRailP1, 2)}`,
    stage: split(circ(C_DR, 2), amp(C_DR, 2, 'probability')),
    claims: [
      claim('q26DualRailP0', 'the dual-rail circuit at theta 30 degrees puts chance 0.75 in path 0', () => close(V.q26DualRailP0, 0.75, 1e-12)),
      claim('q26DualRailP1', 'the dual-rail circuit at theta 30 degrees puts chance 0.25 in path 1', () => close(V.q26DualRailP1, 0.25, 1e-12)),
      claim('q26DualRailGap', 'the drawn dual-rail circuit equals cos theta |0> + sin theta e^{i phi}|1> (max-abs gap)', () => close(V.q26DualRailGap, 0, 1e-12)),
    ],
  },
  {
    id: 'q26-encodings:b5',
    phase: 'clue',
    text: `A plate pair has $\\theta = 22.5^\\circ$. Where does $|0\\rangle$ go on the Bloch sphere, and with what chance do we find $|1\\rangle$?`,
    formal: `Find the polar angle and the chance of $|1\\rangle$ for $U(22.5^\\circ, \\varphi)|0\\rangle$.`,
    caption: 'the start: the north pole',
    captionFormal: 'the start: $|0\\rangle$ at the north pole',
    stage: bl(0, 0),
    reveal: {
      text: `To polar angle $45^\\circ$, twice $22.5^\\circ$: an eighth of a turn from the pole. The chance of $|1\\rangle$ is ${d(V.q26Sin2225, 4)}.`,
      formal: `Polar angle $2\\theta = 45^\\circ$. The chance of $|1\\rangle$ is $\\sin^2 22.5^\\circ = (1 - \\cos45^\\circ)/2 = ${d(V.q26Sin2225, 4)}$.`,
      caption: 'polar angle 45°',
      captionFormal: 'polar angle $45^\\circ$',
      stage: bl(V.q26Polar225, 90),
      claims: [
        claim('q26Polar225', 'U(22.5, 0 degrees)|0> has Bloch polar angle 45 degrees', () => close(V.q26Polar225, 45, 1e-9)),
        claim('q26Sin2225', 'U(22.5 degrees)|0> gives |1> with chance 0.1464', () => close(V.q26Sin2225, 0.1464, 5e-5)),
      ],
    },
  },
]

/* ---------------------------------------------------------------------------------------------- */
/* q26-beamsplitter — One splitter, four numbers                                                      */
/* ---------------------------------------------------------------------------------------------- */

const beamsplitter: Beat[] = [
  {
    id: 'q26-beamsplitter:b1',
    phase: 'books',
    introduces: ['qc-scattering-matrix'],
    text:
      `<<qc-q5-interferometer|Unit 5.5>> treated both inputs alike. A real splitter has four numbers: $t'$ and $r'$ for light entering port 0, and $r$ and $t$ for light entering port 1. ` +
      `They sit in a table [[qc-scattering-matrix|$S$]] that must be unitary. The splitter below reflects ${pct(V.q26R70)} of the light that enters port 0.`,
    formal:
      `[[qc-scattering-matrix|$S = \\begin{pmatrix}t' & r\\\\ r' & t\\end{pmatrix}$]] maps the input amplitudes of ports 0 and 1 to the output amplitudes of ports 2 and 3 for one photon (Bergou Fig. 14.2). ` +
      `A lossless device has $SS^\\dagger = S^\\dagger S = I$ (<<qc-f4-unitary|Unit F4.4>>). Rosetta: Chapter Q5's balanced splitter is $S = \\tfrac{1}{\\sqrt2}\\begin{pmatrix}1 & -1\\\\ 1 & 1\\end{pmatrix}$.`,
    caption: `a splitter that reflects ${pct(V.q26R70)}: one photon in, two exits`,
    captionFormal: `$S$ for $R = ${d(V.q26R70, 1)}$, the real table`,
    stage: circ(C_BS(0.3), 1),
    claims: [claim('q26R70', 'a real splitter with reflectivity 0.3 reflects 30 percent of port 0 light (R = |r\'|^2)', () => close(V.q26R70, 0.3, 1e-12))],
  },
  {
    id: 'q26-beamsplitter:b2',
    phase: 'books',
    text:
      `No light is lost: $|r|^2 + |t|^2 = 1$, and the same for the other pairings. Two different inputs must stay different: $rt'^* + r'^*t = 0$. ` +
      `Together these are the [[qc-stokes-relations|Stokes relations]]. One photon in port 0 leaves at the two exits with chances ${d(V.q26T270, 1)} and ${d(V.q26R70, 1)}.`,
    formal:
      `Eq. 14.1a is $|r|^2 + |t|^2 = |r'|^2 + |t'|^2 = |r|^2 + |t'|^2 = |r'|^2 + |t|^2 = 1$, and Eq. 14.1b is $rt'^* + r'^*t = 0$ with $rt^* + r'^*t' = 0$. ` +
      `They follow from $SS^\\dagger = S^\\dagger S = I$, so $|r| = |r'|$ and $|t| = |t'|$ (p. 255). ` +
      `The engine finds all six relations true to $10^{-14}$ for three conventions and 200 random lossless $S$ (gap $${d(V.q26StokesGap, 0)}$).`,
    caption: `one photon in port 0: chances ${d(V.q26T270, 1)} and ${d(V.q26R70, 1)} at the two exits`,
    captionFormal: `one photon in port 0: chances ${d(V.q26T270, 1)} and ${d(V.q26R70, 1)} at exits 2 and 3`,
    stage: split(circ(C_BS(0.3), 1), amp(C_BS(0.3), 1, 'probability')),
    claims: [
      claim('q26T270', 'at reflectivity 0.3 the photon from port 0 leaves exit 2 with chance 0.7', () => close(V.q26T270, 0.7, 1e-12)),
      claim('q26R70', 'at reflectivity 0.3 the photon from port 0 leaves exit 3 with chance 0.3', () => close(V.q26R70, 0.3, 1e-12)),
      claim('q26StokesGap', 'the six Stokes relations hold for three conventions and 200 random lossless splitters (max-abs gap)', () => close(V.q26StokesGap, 0, 1e-12)),
      claim('q26UnitaryGap', 'S times its adjoint is the identity for the three balanced conventions (max-abs gap)', () => close(V.q26UnitaryGap, 0, 1e-12)),
    ],
    derivation: {
      result: '|r|^2 + |t|^2 = 1,\\ rt\'^* + r\'^*t = 0',
      ground: [
        {
          tex: "|t'|^2 + |r'|^2 = 1",
          why: "Column 0 of $S$ is what port 0's photon becomes, and its squared sizes are chances that add to 1.",
          view: circ(C_BS(0.3), 1),
          viewCaption: "one photon's two exits",
        },
        {
          tex: '|r|^2 + |t|^2 = 1',
          why: "Column 1 is port 1's photon and obeys the same rule. The rows give the other two pairings.",
        },
        {
          tex: "rt'^* + r'^*t = 0",
          why: 'The two columns must stand at right angles, so two different inputs stay different.',
          view: amp(C_BS(0.3), 1, 'probability'),
          viewCaption: 'the chances at the exits',
        },
      ],
      formal: [
        {
          tex: "S^\\dagger S = I:\\quad |t'|^2 + |r'|^2 = 1,\\ |r|^2 + |t|^2 = 1,\\ rt'^* + r'^*t = 0",
          why: 'Write $S^\\dagger S = I$ entry by entry.',
          view: circ(C_BS(0.3), 1),
          viewCaption: "one photon's two exits",
        },
        {
          tex: "SS^\\dagger = I:\\quad |t'|^2 + |r|^2 = 1,\\ |r'|^2 + |t|^2 = 1,\\ rt^* + r'^*t' = 0",
          why: 'The rows give the other pairings and a second cross condition, so $|r| = |r\'|$ and $|t| = |t\'|$.',
          view: amp(C_BS(0.3), 1, 'probability'),
          viewCaption: 'the chances at the exits',
        },
        {
          tex: "|r|^2 + |t|^2 = 1,\\ rt'^* + r'^*t = 0",
          why: 'Together the columns and the rows give all six relations.',
        },
      ],
    },
  },
  {
    id: 'q26-beamsplitter:b3',
    phase: 'books',
    text:
      `Phases are a choice. Take $t = t' > 0$ and $r' = -r$: a table of cosines and sines. Fig. 14.5 uses $t = 1/\\sqrt2$ and $r = i/\\sqrt2$. Both obey the same relations.`,
    formal:
      `The real convention $S = \\begin{pmatrix}t & r\\\\ -r & t\\end{pmatrix}$ is a rotation (p. 255). Fig. 14.5 uses $S = \\tfrac{1}{\\sqrt2}\\begin{pmatrix}1 & i\\\\ i & 1\\end{pmatrix}$, and Chapter Q5 uses $r = -r'$ with $r' > 0$. ` +
      `The engine finds all three pass the six relations and $SS^\\dagger = I$ (gap $${d(V.q26ConvGap, 0)}$). Which one is used changes only phases.`,
    caption: 'the 50:50 splitter: the real table and the symmetric table',
    captionFormal: 'the 50:50 splitter, real convention',
    stage: circ(C_BS(0.5), 1),
    claims: [claim('q26ConvGap', 'the real, symmetric and Q5 balanced splitters pass the six relations and unitarity (max-abs gap)', () => close(V.q26ConvGap, 0, 1e-12))],
  },
  {
    id: 'q26-beamsplitter:b4',
    phase: 'books',
    introduces: ['qc-fock-state'],
    text:
      `Send one photon into port 0. Write $|10\\rangle$ for "photon at exit 2" and $|01\\rangle$ for "photon at exit 3": a [[qc-fock-state|Fock state]] lists how many photons sit at each exit. ` +
      `The output is $t'|10\\rangle + r'|01\\rangle$. Neither exit has a state of its own: they are entangled. At 70:30 the entropy is ${d(V.q26Entropy70, 3)} bits.`,
    formal:
      `With $a_j^\\dagger$ adding a photon to mode $j$ and $|\\mathrm{vac}\\rangle$ the empty field, one photon in port 0 is $a_0^\\dagger|\\mathrm{vac}\\rangle$ (p. 256). Inverting Eq. 14.2, $a_0^\\dagger = t'a_2^\\dagger + r'a_3^\\dagger$, so $|\\psi\\rangle_{\\mathrm{out}} = t'|10\\rangle_{23} + r'|01\\rangle_{23}$. Here [[qc-fock-state|$|ij\\rangle_{23}$]] means $i$ photons in mode 2 and $j$ in mode 3. ` +
      `Rosetta: this is a Fock label, not two qubits, although two occupation wires draw it. ` +
      `At $R = ${d(V.q26R70, 1)}$ the concurrence $2|t'r'|$ is ${d(V.q26Conc70, 4)} (<<qc-q12-concurrence|Unit 12.6>>) and the entropy $H(|t'|^2)$ is ${d(V.q26Entropy70, 4)} bits (<<qc-q9-entropy|Unit 9.3>>). At 50:50 it is ${d(V.q26Entropy50, 0)} bit.`,
    caption: 'two exit-occupation wires: |10⟩ + |01⟩ with unequal weights',
    captionFormal: `concurrence ${d(V.q26Conc70, 4)}, entropy ${d(V.q26Entropy70, 4)} bits`,
    stage: tq(C_ENT(0.3), 1),
    claims: [
      claim('q26Conc70', 'one photon on a 70:30 splitter makes exits with concurrence 0.9165', () => close(V.q26Conc70, 0.9165, 5e-5)),
      claim('q26Entropy70', 'one photon on a 70:30 splitter makes exits with entropy 0.8813 bits', () => close(V.q26Entropy70, 0.8813, 5e-5)),
      claim('q26Entropy50', 'one photon on a 50:50 splitter makes exits with entropy 1 bit', () => close(V.q26Entropy50, 1, 1e-12)),
    ],
  },
  {
    id: 'q26-beamsplitter:b5',
    phase: 'clue',
    text: `Two balanced splitters of Fig. 14.5's table, one after the other. A photon enters port 0. Where does it leave, and with what chance?`,
    formal: `Compute $S^2$ for $S = \\tfrac{1}{\\sqrt2}\\begin{pmatrix}1 & i\\\\ i & 1\\end{pmatrix}$ and the chance for a photon from port 0.`,
    caption: 'before the splitters: one photon in port 0',
    captionFormal: 'before the splitters: one photon in port 0',
    stage: circ(C_BS2, 0),
    reveal: {
      text: `It always leaves the other port, with a phase of $90^\\circ$ (a quarter turn). Two splitters make a perfect swap of ports.`,
      formal:
        `$S^2 = i\\begin{pmatrix}0 & 1\\\\ 1 & 0\\end{pmatrix}$, so the chance for a photon from port 0 to leave by port 3 is ${d(V.q26TwoBsChance, 0)} and its phase is $90^\\circ$. ` +
        `Fig. 14.5's crossing between the two splitters turns this into $iI$ for the inner rails (Unit 26.4).`,
      caption: 'after two splitters: all in exit 3',
      captionFormal: 'after two splitters: exit 3 with chance 1',
      stage: amp(C_BS2, 2, 'probability'),
      claims: [
        claim('q26TwoBsChance', 'two balanced symmetric splitters send port 0 light to port 3 with chance 1', () => close(V.q26TwoBsChance, 1, 1e-12)),
        claim('q26TwoBsPhase', 'two balanced symmetric splitters add a phase of 90 degrees', () => close(V.q26TwoBsPhase, 90, 1e-9)),
      ],
    },
  },
]

/* ---------------------------------------------------------------------------------------------- */
/* q26-hom — Two photons that leave together                                                          */
/* ---------------------------------------------------------------------------------------------- */

const hom: Beat[] = [
  {
    id: 'q26-hom:b1',
    phase: 'books',
    text:
      `Put one photon in each port. Both can pass, both can bounce, or one of each. The output has parts $|20\\rangle$, $|11\\rangle$ and $|02\\rangle$. ` +
      `This is the [[qc-hong-ou-mandel|Hong–Ou–Mandel]] setup. At 75:25 the parts $|20\\rangle$ and $|02\\rangle$ have chance ${d(V.q26HomP20R25, 3)} each, and $|11\\rangle$ has ${d(V.q26HomP11R25, 2)}.`,
    formal:
      `$a_0^\\dagger a_1^\\dagger|\\mathrm{vac}\\rangle \\to (t'a_2^\\dagger + r'a_3^\\dagger)(ra_2^\\dagger + ta_3^\\dagger)|\\mathrm{vac}\\rangle = \\sqrt2\\,t'r|20\\rangle + (t't + r'r)|11\\rangle + \\sqrt2\\,r't|02\\rangle$ (p. 256), ` +
      `using $(a^\\dagger)^2|\\mathrm{vac}\\rangle = \\sqrt2|2\\rangle$. For $R = ${d(V.q26R25, 2)}$ in the real convention the chances are ${d(V.q26HomP20R25, 3)}, ${d(V.q26HomP11R25, 2)} and ${d(V.q26HomP02R25, 3)}. ` +
      `The permanent route and the exponential of the mode generator agree to $10^{-9}$.`,
    caption: 'after the splitter: three bars, |20⟩, |11⟩, |02⟩ (bits 00, 01, 10)',
    captionFormal: 'bars 00, 01, 10 stand for $|20\\rangle$, $|11\\rangle$, $|02\\rangle$ after the splitter',
    stage: split(circ(C_HOM(0.25), 1), amp(C_HOM(0.25), 1, 'probability')),
    claims: [
      claim('q26R25', 'the splitter of this beat reflects R = 0.25 (a model input)', () => close(V.q26R25, 0.25, 1e-12)),
      claim('q26HomP20R25', 'at R = 0.25 two photons, one per port, give |20> with chance 0.375', () => close(V.q26HomP20R25, 0.375, 1e-12)),
      claim('q26HomP11R25', 'at R = 0.25 two photons, one per port, give |11> with chance 0.25', () => close(V.q26HomP11R25, 0.25, 1e-12)),
      claim('q26HomP02R25', 'at R = 0.25 two photons, one per port, give |02> with chance 0.375', () => close(V.q26HomP02R25, 0.375, 1e-12)),
      claim('q26HomClosedGap', 'the permanent amplitudes equal sqrt2 t\'r, t\'t + r\'r and sqrt2 r\'t for 53 splitters (max-abs gap)', () => close(V.q26HomClosedGap, 0, 1e-12)),
      claim('q26HomCircuitGap', 'the drawn two-photon circuit equals the three amplitudes (max-abs gap over four splitters)', () => close(V.q26HomCircuitGap, 0, 1e-12)),
    ],
    derivation: {
      result: "a_0^\\dagger a_1^\\dagger \\to \\sqrt2\\,t'r|20\\rangle + (t't + r'r)|11\\rangle + \\sqrt2\\,r't|02\\rangle",
      ground: [
        {
          tex: "a_0^\\dagger a_1^\\dagger \\to (t'a_2^\\dagger + r'a_3^\\dagger)(ra_2^\\dagger + ta_3^\\dagger)",
          why: 'Each photon that enters becomes a sum over the two exits, with the weights from $S$.',
          view: circ(C_HOM(0.25), 1),
          viewCaption: 'the splitter box on the three Fock states',
        },
        {
          tex: "t'r\\,a_2^\\dagger a_2^\\dagger + t't\\,a_2^\\dagger a_3^\\dagger + r'r\\,a_3^\\dagger a_2^\\dagger + r't\\,a_3^\\dagger a_3^\\dagger",
          why: 'Multiply out: four terms, one for each way the two photons can choose their exits.',
        },
        {
          tex: "a_2^\\dagger a_2^\\dagger|\\mathrm{vac}\\rangle = \\sqrt2\\,|20\\rangle",
          why: 'Two photons in the same exit make $|20\\rangle$ with a factor $\\sqrt2$, and the same holds for $|02\\rangle$.',
        },
        {
          tex: "a_0^\\dagger a_1^\\dagger \\to \\sqrt2\\,t'r|20\\rangle + (t't + r'r)|11\\rangle + \\sqrt2\\,r't|02\\rangle",
          why: 'The two mixed terms both make $|11\\rangle$, so they add as amplitudes.',
          view: amp(C_HOM(0.25), 1, 'probability'),
          viewCaption: 'the three exit chances',
        },
      ],
      formal: [
        {
          tex: "a_j^\\dagger \\to \\sum_k S_{kj}\\,a_k^\\dagger",
          why: 'Substitute the mode transformation for each creation operator.',
          view: circ(C_HOM(0.25), 1),
          viewCaption: 'the splitter box on the three Fock states',
        },
        {
          tex: "(t'a_2^\\dagger + r'a_3^\\dagger)(ra_2^\\dagger + ta_3^\\dagger)|\\mathrm{vac}\\rangle,\\quad (a^\\dagger)^2|\\mathrm{vac}\\rangle = \\sqrt2|2\\rangle",
          why: 'Expand, and count each doubled creation operator with its factor $\\sqrt2$.',
        },
        {
          tex: "a_0^\\dagger a_1^\\dagger \\to \\sqrt2\\,t'r|20\\rangle + (t't + r'r)|11\\rangle + \\sqrt2\\,r't|02\\rangle",
          why: 'Collect the three Fock states.',
          view: amp(C_HOM(0.25), 1, 'probability'),
          viewCaption: 'the three exit chances',
        },
      ],
    },
  },
  {
    id: 'q26-hom:b2',
    phase: 'books',
    text:
      `The middle part is two arrows: "both pass" ($t't$) and "both bounce" ($r'r$). For any 50:50 splitter they have equal length and opposite direction, so they cancel. The photons never leave one by each exit.`,
    formal:
      `For a lossless 50:50 splitter $t't + r'r = 0$ follows from Eq. 14.1, and the page states it. The engine finds $|t't + r'r| < 10^{-14}$ over 200 random lossless 50:50 splitters (gap $${d(V.q26HomCancel, 0)}$); ` +
      `in the real convention $t^2 - r^2 = 1 - 2R = 0$. The two ways add as amplitudes before they are squared (<<qc-f1-phase|Unit F1.5>>).`,
    caption: 'the two arrows, equal and opposite: their sum is 0',
    captionFormal: '$t\'t$ and $r\'r$ as arrows: equal length, opposite direction, sum 0',
    stage: cp(V.q26HomTt, V.q26HomRr),
    claims: [
      claim('q26HomCancel', 't\'t + r\'r is 0 for 200 random lossless 50:50 splitters and the three named ones (max-abs)', () => close(V.q26HomCancel, 0, 1e-12)),
      claim('q26HomTt', 'at 50:50 in the real convention t\'t is 0.5', () => close(V.q26HomTt, 0.5, 1e-12)),
      claim('q26HomRr', 'at 50:50 in the real convention r\'r is -0.5', () => close(V.q26HomRr, -0.5, 1e-12)),
    ],
  },
  {
    id: 'q26-hom:b3',
    phase: 'books',
    text:
      `So both photons leave together: $|20\\rangle$ or $|02\\rangle$, each with chance ${d(V.q26HomP20R50, 1)}. The sign between the two parts depends on the splitter: minus for the cosine-and-sine table, plus for Fig. 14.5's.`,
    formal:
      `$|\\psi\\rangle_{\\mathrm{out}} = (|20\\rangle + e^{i\\phi}|02\\rangle)/\\sqrt2$, the [[qc-hong-ou-mandel|Hong–Ou–Mandel effect]] (p. 257). The engine gives $\\phi = ${d(V.q26HomPhaseReal, 0)}^\\circ$ for the real and Chapter Q5 conventions ` +
      `and $${d(V.q26HomPhaseSym, 0)}^\\circ$ for the symmetric one, and the chance of $|11\\rangle$ is $${d(V.q26HomP11R50, 0)}$ for all three. Rosetta: for Fig. 14.5's splitter the page's two-photon state on p. 260 carries a relative $i$, but its own formula on p. 256 gives equal phases, as here. This pair of exits is the resource of the photonic gates of Unit 26.4.`,
    caption: 'at 50:50 the middle bar vanishes and the two outer bars are equal',
    captionFormal: '$|20\\rangle - |02\\rangle$ for the real table: the two phases differ by $180^\\circ$',
    stage: amp(C_HOM(0.5), 1, 'amplitude', { dials: true }),
    claims: [
      claim('q26HomP20R50', 'at 50:50 the pair leaves as |20> with chance 0.5', () => close(V.q26HomP20R50, 0.5, 1e-12)),
      claim('q26HomP11R50', 'at 50:50 the pair never leaves one by each exit (chance 0)', () => close(V.q26HomP11R50, 0, 1e-12)),
      claim('q26HomPhaseReal', 'with the real table the |02> part is 180 degrees from the |20> part', () => close(V.q26HomPhaseReal, 180, 1e-9)),
      claim('q26HomPhaseSym', 'with the symmetric table the |02> part is 0 degrees from the |20> part', () => close(V.q26HomPhaseSym, 0, 1e-9)),
    ],
  },
  {
    id: 'q26-hom:b4',
    phase: 'books',
    text:
      `Move the splitter off 50:50 and the middle chance returns: $(1 - 2R)^2$ for reflectivity $R$. Photons you could tell apart would exit one by each side with chance ${d(V.q26DistinguishableR50, 1)} at 50:50. The dip comes from adding amplitudes.`,
    formal:
      `The chance of $|11\\rangle$ is $(t^2 - r^2)^2 = (1 - 2R)^2$, zero only at $R = \\tfrac12$; the engine agrees at 11 reflectivities (the curve below). ` +
      `Photons that can be told apart add chances instead: $|t'|^2|t|^2 + |r'|^2|r|^2 = (1-R)^2 + R^2$, which is $\\tfrac12$ at 50:50. In both cases the three chances add to 1.`,
    caption: `chance of one photon in each exit against R: the dip to 0 at 0.5, and the ${d(V.q26DistinguishableR50, 1)} of photons that could be told apart`,
    captionFormal: '$(1 - 2R)^2$ against $(1-R)^2 + R^2$',
    stage: curve('homDip', { from: 0, to: 1 }, 100, { markers: [{ x: 0.5 }] }, 'homDistinguishable'),
    claims: [claim('q26DistinguishableR50', 'photons that can be told apart give one per exit with chance 0.5 at 50:50', () => close(V.q26DistinguishableR50, 0.5, 1e-12))],
  },
  {
    id: 'q26-hom:b5',
    phase: 'clue',
    text: `A splitter reflects a fifth of the light, $R = ${d(V.q26R20, 1)}$. Two identical photons enter, one per port. How often does one leave by each exit?`,
    formal: `Evaluate the chances of $|11\\rangle$, $|20\\rangle$ and $|02\\rangle$ at $R = ${d(V.q26R20, 1)}$.`,
    caption: 'before the splitter: one photon in each port',
    captionFormal: 'before the splitter: $|11\\rangle$ at the input',
    stage: amp(C_HOM(0.2), 0, 'probability'),
    reveal: {
      text: `The chance is $(1 - 2R)^2 = ${d(V.q26HomR20, 2)}$. Both leave together the other ${d(V.q26HomBunch20, 2)} of the time, ${d(V.q26HomP20R20, 2)} at each exit.`,
      formal: `The chance of $|11\\rangle$ is $${d(V.q26HomR20, 2)}$. The chance of $|20\\rangle$ is $2|t'|^2|r|^2 = ${d(V.q26HomP20R20, 2)}$, the same as for $|02\\rangle$, and the three add to 1.`,
      caption: `R = ${d(V.q26R20, 1)}: the dip is not complete`,
      captionFormal: `$R = ${d(V.q26R20, 1)}$: the chance of $|11\\rangle$ is ${d(V.q26HomR20, 2)}`,
      stage: amp(C_HOM(0.2), 1, 'probability'),
      claims: [
        claim('q26R20', 'the splitter of this clue reflects R = 0.2 (a model input)', () => close(V.q26R20, 0.2, 1e-12)),
        claim('q26HomR20', 'at R = 0.2 the pair leaves one per exit with chance 0.36', () => close(V.q26HomR20, 0.36, 1e-12)),
        claim('q26HomP20R20', 'at R = 0.2 the pair leaves as |20> with chance 0.32', () => close(V.q26HomP20R20, 0.32, 1e-12)),
        claim('q26HomBunch20', 'at R = 0.2 the pair leaves together with chance 0.64', () => close(V.q26HomBunch20, 0.64, 1e-12)),
      ],
    },
  },
]

/* ---------------------------------------------------------------------------------------------- */
/* q26-ns-cz — A sign flip from a heralded photon                                                     */
/* ---------------------------------------------------------------------------------------------- */

const nsCz: Beat[] = [
  {
    id: 'q26-ns-cz:b1',
    phase: 'books',
    text:
      `Linear optics treats every photon alike, so photons never feel each other. A gate that gives the two-photon component a minus sign would couple them: the [[qc-nonlinear-sign-gate|nonlinear sign gate]]. ` +
      `No linear device can be that gate. So it is built with an extra photon and detectors, and it works only when a [[qc-heralded-gate|heralded]] signal says that it did.`,
    formal:
      `The gate maps $c_0|0\\rangle + c_1|1\\rangle + c_2|2\\rangle$ to $c_0|0\\rangle + c_1|1\\rangle - c_2|2\\rangle$ (p. 258). A mode transformation sends $a^\\dagger$ to a combination of creation operators, so it cannot give a phase that depends on the photon number. ` +
      `A gate is [[qc-heralded-gate|heralded]] when it is accepted only if the detectors register an agreed pattern. Rosetta: the bars 00, 01, 10 stand for 0, 1, 2 photons in one mode.`,
    caption: `three bars of length ${d(V.q26NsBar, 4)}, the two-photon bar turned over: its hue is half a turn away`,
    captionFormal: '$c_2 \\to -c_2$: a phase of $180^\\circ$ on $|2\\rangle$',
    stage: ampT('00+01-10', 'amplitude', { dials: true }),
    claims: [claim('q26NsBar', 'equal weights on 0, 1 and 2 photons give three bars of length 0.5774', () => close(V.q26NsBar, 0.5774, 5e-5))],
  },
  {
    id: 'q26-ns-cz:b2',
    phase: 'books',
    text:
      `Turn the signal's polarization by $\\theta$ and add one V-polarized ancilla photon at a polarizing splitter. Turn the light by $\\varphi$ and split again. Keep only runs where detector 0 sees nothing and detector 1 sees one photon.`,
    formal:
      `Rotator $\\theta$; a polarizing splitter PBS$_1$ (transmits H, reflects V) joins the signal and the ancilla $|1\\rangle_V$; rotator $\\varphi$; PBS$_2$ with vacuum; detector 0 must read 0 and detector 1 must read 1 (p. 258). ` +
      `Our calculation finds the amplitude of $|n\\rangle$ for $n$ signal photons: $A_n = \\cos^n\\theta\\cos^{n-1}\\varphi\\,(\\cos^2\\varphi - n\\sin^2\\varphi)$. A symbolic expansion and a mode-by-mode permanent agree to $10^{-9}$.`,
    caption: 'the amplitudes after the circuit, for the angles found next',
    captionFormal: '$A_0 = \\cos\\varphi$, $A_1 = \\cos\\theta\\cos2\\varphi$, $A_2 = \\cos^2\\theta\\cos\\varphi\\,(1 - 3\\sin^2\\varphi)$',
    stage: NS_AMP(),
    claims: [claim('q26NsFormulaGap', 'the permanent amplitudes equal cos^n theta cos^{n-1} varphi (cos^2 varphi - n sin^2 varphi) at three settings, n = 0 to 4 (max-abs gap)', () => close(V.q26NsFormulaGap, 0, 1e-12))],
    derivation: {
      result: 'A_n = \\cos^n\\theta\\cos^{n-1}\\varphi\\,(\\cos^2\\varphi - n\\sin^2\\varphi)',
      ground: [
        {
          tex: '\\cos^n\\theta',
          why: 'Each signal photon goes on with weight $\\cos\\theta$ or to detector 0 with $\\sin\\theta$. Detector 0 must stay empty, so we keep $\\cos^n\\theta$.',
          view: ampT('00+01+10', 'amplitude'),
          viewCaption: 'equal weights on 0, 1, 2 photons',
        },
        {
          tex: '(\\cos\\varphi\\,a_{\\mathrm{out}}^\\dagger + \\sin\\varphi\\,a_1^\\dagger)^n(-\\sin\\varphi\\,a_{\\mathrm{out}}^\\dagger + \\cos\\varphi\\,a_1^\\dagger)',
          why: 'The second rotator and splitter send a signal photon to the exit with $\\cos\\varphi$ or to detector 1 with $\\sin\\varphi$. The ancilla goes to the exit with $-\\sin\\varphi$ or to detector 1 with $\\cos\\varphi$.',
        },
        {
          tex: 'A_n = \\cos^n\\theta\\left[\\cos\\varphi\\cos^n\\varphi - n\\sin^2\\varphi\\cos^{n-1}\\varphi\\right]',
          why: 'Exactly one photon must reach detector 1. Either the ancilla goes there, or one of $n$ signal photons does and the ancilla stays.',
          view: NS_AMP(),
          viewCaption: 'amplitudes at the solution',
        },
        {
          tex: 'A_n = \\cos^n\\theta\\cos^{n-1}\\varphi\\,(\\cos^2\\varphi - n\\sin^2\\varphi)',
          why: 'Collect the factors of $\\cos\\varphi$.',
        },
      ],
      formal: [
        {
          tex: 'a_s^\\dagger \\to \\cos\\theta(\\cos\\varphi\\,a_{\\mathrm{out}}^\\dagger + \\sin\\varphi\\,a_1^\\dagger),\\quad a_b^\\dagger \\to -\\sin\\varphi\\,a_{\\mathrm{out}}^\\dagger + \\cos\\varphi\\,a_1^\\dagger',
          why: 'The operator substitution of the circuit, with the term for detector 0 dropped.',
          view: ampT('00+01+10', 'amplitude'),
          viewCaption: 'equal weights on 0, 1, 2 photons',
        },
        {
          tex: '\\frac{\\cos^n\\theta}{\\sqrt{n!}}(\\cos\\varphi\\,a_{\\mathrm{out}}^\\dagger + \\sin\\varphi\\,a_1^\\dagger)^n(-\\sin\\varphi\\,a_{\\mathrm{out}}^\\dagger + \\cos\\varphi\\,a_1^\\dagger)|\\mathrm{vac}\\rangle',
          why: 'The state after the circuit, with detector 0 empty.',
        },
        {
          tex: 'A_n = \\cos^n\\theta\\cos^{n-1}\\varphi\\,(\\cos^2\\varphi - n\\sin^2\\varphi)',
          why: 'The coefficient of $a_{\\mathrm{out}}^{\\dagger n}a_1^\\dagger$ times $\\sqrt{n!}$.',
          view: NS_AMP(),
          viewCaption: 'amplitudes at the solution',
        },
      ],
    },
  },
  {
    id: 'q26-ns-cz:b3',
    phase: 'books',
    text:
      `We need amplitudes $1, 1, -1$ for 0, 1, 2 photons. Two conditions give $\\cos^2\\varphi = (3 - \\sqrt2)/7$, so $\\varphi = ${d(V.q26NsPhi, 2)}^\\circ$ and $\\theta = ${d(V.q26NsTheta, 2)}^\\circ$. Each success then has chance ${d(V.q26NsSuccess, 4)}.`,
    formal:
      `The printed conditions $\\cos\\theta\\cos2\\varphi/\\cos\\varphi = 1$ and $\\cos^2\\theta(1 - 3\\sin^2\\varphi) = -1$ reduce, with $x = \\cos^2\\varphi$, to $7x^2 - 6x + 1 = 0$ and $x = (3 \\mp \\sqrt2)/7$. ` +
      `Only $x = ${d(V.q26NsSuccess, 4)}$ keeps $|\\cos\\theta| \\le 1$; the other root gives $\\cos\\theta = ${d(V.q26NsOtherRootCosTheta, 2)}$. ` +
      `So $P_{\\mathrm{NS}} = A_0^2 = ${d(V.q26NsSuccess, 4)}$, the same for every input of at most two photons (the book says at most 22.7 %). Three photons are not corrected: $A_3/A_0 = ${d(V.q26NsRatio3, 3)}$.`,
    caption: `the amplitude ratios 1, 1, −1 and the failing ${d(V.q26NsRatio3, 3)} for three photons`,
    captionFormal: `$A_n/A_0$ for $n = 0$ to 3: $1, 1, -1$ and ${d(V.q26NsRatio3, 3)}$`,
    stage: NS_RATIO(),
    claims: [
      claim('q26NsA1overA0', 'at the solution A_1/A_0 is 1', () => close(V.q26NsA1overA0, 1, 1e-12)),
      claim('q26NsA2overA0', 'at the solution A_2/A_0 is -1', () => close(V.q26NsA2overA0, -1, 1e-12)),
      claim('q26NsTheta', 'the first angle is 150.49 degrees', () => close(V.q26NsTheta, 150.49, 5e-3)),
      claim('q26NsPhi', 'the second angle is 61.58 degrees', () => close(V.q26NsPhi, 61.58, 5e-3)),
      claim('q26NsSuccess', 'one sign gate succeeds with chance (3 - sqrt2)/7 = 0.2265', () => close(V.q26NsSuccess, (3 - Math.SQRT2) / 7, 1e-12) && close(V.q26NsSuccess, 0.2265, 5e-5)),
      claim('q26NsOtherRootCosTheta', 'the other root of 7x^2 - 6x + 1 gives cos theta = 3.04', () => close(V.q26NsOtherRootCosTheta, 3.04, 5e-3)),
      claim('q26NsRatio3', 'three photons give A_3/A_0 = 0.657, not corrected', () => close(V.q26NsRatio3, 0.657, 5e-4)),
      claim('q26NsSignGap', 'the printed conditions hold at the solution (max-abs gap)', () => close(V.q26NsSignGap, 0, 1e-12)),
    ],
  },
  {
    id: 'q26-ns-cz:b4',
    phase: 'books',
    text:
      `Two dual-rail qubits share a pair of inner paths. Two balanced splitters with a crossing give the table $i, 1, -1, i$, which cannot entangle. ` +
      `Put a sign gate on each inner path between the splitters: only the input $|10\\rangle$, with two photons inside, changes sign. The table becomes $i, 1, 1, i$.`,
    formal:
      `The inner rails, qubit 1's $|1\\rangle$ and qubit 2's $|0\\rangle$, meet on $S = \\tfrac{1}{\\sqrt2}\\begin{pmatrix}1 & i\\\\ i & 1\\end{pmatrix}$ twice with a crossing between. That gives $iI$ on single photons, so $U_{\\mathrm{lin}} = \\mathrm{diag}(i, 1, -1, i)$. ` +
      `With the sign gates between, $U_{CZ} = \\mathrm{diag}(i, 1, 1, i)$: a four-mode Fock simulation, gap $${d(V.q26CzGap, 0)}$ to the printed tables, no leakage out of the code space. ` +
      `It equals CZ up to a phase gate on each qubit (<<qc-q4-cnot|Unit 4.4>>) and a global factor $i$. On $|{+}{+}\\rangle$ the concurrence is ${d(V.q26ConcLinear, 0)} without the sign gates and ${d(V.q26ConcCz, 0)} with them (<<qc-q12-concurrence|Unit 12.6>>).`,
    caption: 'the gate with the two sign gates, and the pair it makes from |++⟩: concurrence 1',
    captionFormal: '$\\mathrm{diag}(i, 1, 1, i)$ on $|{+}{+}\\rangle$: concurrence $1$, and $0$ without the sign gates',
    stage: split(circ(C_CZ(true), 1), tq(C_CZ(true), 1)),
    claims: [
      claim('q26ConcLinear', 'the linear table diag(i, 1, -1, i) leaves |++> with concurrence 0', () => close(V.q26ConcLinear, 0, 1e-12)),
      claim('q26ConcCz', 'with the sign gates the gate makes |++> into a pair with concurrence 1', () => close(V.q26ConcCz, 1, 1e-12)),
      claim('q26CzGap', 'the four-mode Fock simulation gives the printed tables diag(i, 1, -1, i) and diag(i, 1, 1, i) (max-abs gap)', () => close(V.q26CzGap, 0, 1e-12)),
      claim('q26CzLeak', 'the network never leaves the code space (largest leak chance)', () => close(V.q26CzLeak, 0, 1e-12)),
    ],
  },
  {
    id: 'q26-ns-cz:b5',
    phase: 'books',
    text:
      `Both sign gates must fire: ${d(V.q26NsSuccess, 4)} squared is ${d(V.q26CzSuccess, 4)}, one try in ${d(V.q26CzAttempts, 1)}. The book quotes a limit for a linear-optics CNOT built from independent extra photons, with no teleportation: $2/27 = ${d(V.q26NsBound, 3)}$.`,
    formal:
      `$P_{CZ} = P_{\\mathrm{NS}}^2 = ${d(V.q26CzSuccess, 4)}$ for every input; the book says about 5 %. Our calculation, which answers the chapter's first problem, finds the same value for each input because $P_{\\mathrm{NS}}$ does not depend on the state. ` +
      `The mean number of attempts is ${d(V.q26CzAttempts, 2)}. The bound $2/27 = ${d(V.q26NsBound, 4)}$ of Uskov et al. is cited, not derived (Bergou p. 260); it is ${d(V.q26NsBoundRatio, 2)} times this gate's chance. It does not bind the teleported gates of Unit 26.5.`,
    caption: 'this gate against the 2/27 ceiling',
    captionFormal: `this gate, ${d(V.q26CzSuccess, 4)}, against the cited ceiling $2/27$`,
    stage: CZ_COST(),
    claims: [
      claim('q26CzSuccess', 'both sign gates fire with chance 0.0513 for every input', () => close(V.q26CzSuccess, V.q26NsSuccess ** 2, 1e-12) && close(V.q26CzSuccess, 0.0513, 5e-5)),
      claim('q26CzAttempts', 'a CZ gate needs 19.49 attempts on average', () => close(V.q26CzAttempts, 19.49, 5e-3)),
      claim('q26NsBound', 'the cited limit for a linear-optics CNOT built from independent extra photons, with no teleportation, is 2/27', () => close(V.q26NsBound, 2 / 27, 1e-12)),
      claim('q26NsBoundRatio', 'the cited limit is 1.44 times this gate\'s chance', () => close(V.q26NsBoundRatio, 1.44, 5e-3)),
    ],
  },
  {
    id: 'q26-ns-cz:b6',
    phase: 'clue',
    text: `A program needs 3 CZ gates in a row, each with chance ${d(V.q26CzSuccess, 4)} and no way to repair a failure. What is the chance that all three succeed?`,
    formal: `Find $P_{CZ}^3$ and the number of attempts of the whole program per success.`,
    caption: 'one gate: its success chance',
    captionFormal: 'one gate: $P_{CZ}$',
    stage: CZ_ONE(),
    reveal: {
      text: `It is ${d(V.q26Cz3Chain, 6)}, about 1 attempt in ${V.q26CzAttempts3}. Each extra gate multiplies by ${d(V.q26CzSuccess, 4)}. That is why Bergou turns to gate teleportation.`,
      formal: `$P_{CZ}^3 = ${d(V.q26Cz3Chain, 6)}$ and $1/P_{CZ}^3 = ${V.q26CzAttempts3}$: exponentially small in the gate count (p. 260).`,
      caption: 'success chance of a chain of CZ gates, log axis',
      captionFormal: '$P_{CZ}^k$ for $k = 1$ to 4 gates, log axis',
      stage: CZ_CHAIN(),
      claims: [
        claim('q26Cz3Chain', 'three CZ gates in a row all succeed with chance 0.000135', () => close(V.q26Cz3Chain, 0.000135, 5e-7)),
        claim('q26CzAttempts3', 'three CZ gates in a row need 7398 attempts per success', () => V.q26CzAttempts3 === 7398),
      ],
    },
  },
]

/* ---------------------------------------------------------------------------------------------- */
/* q26-teleport-gate — Teleport the gate, then count photons                                          */
/* ---------------------------------------------------------------------------------------------- */

const teleportGate: Beat[] = [
  {
    id: 'q26-teleport-gate:b1',
    phase: 'books',
    text:
      `A gate with success chance $P$ fails a long program: $N$ gates all work with chance $P^N$. [[qc-gate-teleportation|Gate teleportation]] moves the risk off line: keep making a special entangled state until it works, then use it. ` +
      `Waiting for one sign-gate success takes ${d(V.q26NsInverse, 3)} tries on average.`,
    formal:
      `$P^N$ is exponentially small, so probabilistic gates alone give no advantage (p. 260). Knill, Laflamme and Milburn (2001) teleport the gate with a resource state made by repeat-until-success, as Chapter Q11 teleports a state. ` +
      `Waiting for one sign-gate success takes $1/P_{\\mathrm{NS}} = 3 + \\sqrt2 = ${d(V.q26NsInverse, 3)}$ tries on average.`,
    caption: 'preparing the resource may fail; using it never does',
    captionFormal: 'five preparation columns of the resource $|r\\rangle$',
    stage: circ(C_RES, 5),
    claims: [
      claim('q26NsSuccess', 'one sign gate succeeds with chance (3 - sqrt2)/7 = 0.2265', () => close(V.q26NsSuccess, 0.2265, 5e-5)),
      claim('q26NsInverse', 'waiting for one sign-gate success takes 1/0.2265 = 4.414 tries on average', () => close(V.q26NsInverse, 4.414, 5e-4)),
    ],
  },
  {
    id: 'q26-teleport-gate:b2',
    phase: 'books',
    text:
      `Teleport each input with its own entangled pair: a Bell measurement, then an X and a Z fix-up (<<qc-q11-teleport-circuit|Unit 11.4>>). Two inputs, two pairs, four measured bits. ` +
      `Each of the 16 outcomes has chance $${tf(V.q26GateTeleportOutcome)}$.`,
    formal:
      `Each of $|c\\rangle$ and $|t\\rangle$ is Bell-measured against half of a Bell pair, and the four readings control X and Z fix-ups on the other halves (<<qc-q11-teleport-circuit|Unit 11.4>>). ` +
      `The engine runs the six-wire circuit of Fig. 14.7 for random inputs: all 16 outcomes have chance $${tf(V.q26GateTeleportOutcome)}$. One input alone has four outcomes of chance $${tf(V.q26TeleportOneOutcome)}$ each.`,
    caption: `one input through half a Bell pair: each reading has chance ${uf(V.q26TeleportOneOutcome)}; two inputs make 16 readings`,
    captionFormal: `one input: chance ${uf(V.q26TeleportOneOutcome)} for each of four readings; two inputs: $${tf(V.q26GateTeleportOutcome)}$ for each of 16`,
    stage: split(circ(C_T1, 4), amp(C_T1, 4, 'probability')),
    claims: [
      claim('q26GateTeleportOutcome', 'the circuit of Fig. 14.7 gives each of its 16 readings chance 1/16 for random inputs', () => close(V.q26GateTeleportOutcome, 1 / 16, 1e-12)),
      claim('q26GtSpread', 'the 16 readings have equal chances for random inputs (max minus min)', () => close(V.q26GtSpread, 0, 1e-12)),
      claim('q26TeleportOneOutcome', 'one input teleported through half a Bell pair gives each of four readings chance 1/4', () => close(V.q26TeleportOneOutcome, 0.25, 1e-12)),
    ],
  },
  {
    id: 'q26-teleport-gate:b3',
    phase: 'books',
    text:
      `Slip a CNOT into the entangled pairs before measuring. It acts on the pair halves, ahead of the fix-ups. The prepared state $|r\\rangle$ needs two Hadamards and three CNOTs, and is made once, then kept.`,
    formal:
      `$|r\\rangle = \\tfrac12(|0000\\rangle + |0011\\rangle + |1110\\rangle + |1101\\rangle)$ (p. 261). It equals $(I \\otimes \\mathrm{CNOT}_{1\\to3})(|\\Phi^+\\rangle|\\Phi^+\\rangle)$ and is built by H on wires 0 and 2 and CNOTs $0\\to1$, $2\\to3$, $0\\to3$. ` +
      `The engine's state equals the printed one (gap $${d(V.q26ResourceGap, 0)}$). Teleporting through the CNOT turns each Pauli fix-up into one carried across it.`,
    caption: `the five preparation columns, and the four chances ${uf(V.q26TeleportOneOutcome)} of the state |r⟩`,
    captionFormal: `the four nonzero bars of $|r\\rangle$, each ${uf(V.q26TeleportOneOutcome)}`,
    stage: split(circ(C_RES, 5), amp(C_RES, 5, 'probability')),
    claims: [claim('q26ResourceGap', 'the prepared resource equals the printed state (max-abs gap)', () => close(V.q26ResourceGap, 0, 1e-12))],
  },
  {
    id: 'q26-teleport-gate:b4',
    phase: 'books',
    text:
      `Measure. Each of the 16 outcomes has an X and Z fix-up for the two output wires. The fix-up leaves exactly the CNOT of the inputs. We checked all 16 for random inputs.`,
    formal:
      `For random $|c\\rangle$ and $|t\\rangle$ and each of the 16 Bell outcomes, one Pauli on each output wire returns $\\mathrm{CNOT}|c,t\\rangle$ (largest gap $10^{-12}$; gap $${d(V.q26GtGap, 0)}$). ` +
      `The table from outcome to fix-up is the third problem of the chapter, cited and not worked. Input $|{+}\\rangle|0\\rangle$ with outcome $0000$ needs no fix-up and leaves the Bell pair $\\Phi^+$: chances ${d(V.q26GtOut00, 1)} and ${d(V.q26GtOut11, 1)}.`,
    caption: `the gate that was teleported, CNOT on |+0⟩: the output pair holds ${d(V.q26GtOut00, 1)} and ${d(V.q26GtOut11, 1)}`,
    captionFormal: 'after outcome 0000 the output wires hold $\\Phi^+$',
    stage: split(circ(C_CNOT, 1), amp(C_CNOT, 1, 'probability')),
    claims: [
      claim('q26GtGap', 'for 16 readings and six random input pairs one Pauli on each output wire leaves exactly CNOT|c, t> (max-abs gap)', () => close(V.q26GtGap, 0, 1e-12)),
      claim('q26GtOut00', 'input |+>|0> with readings 0000 leaves the pair on 00 with chance 0.5', () => close(V.q26GtOut00, 0.5, 1e-12)),
      claim('q26GtOut11', 'input |+>|0> with readings 0000 leaves the pair on 11 with chance 0.5', () => close(V.q26GtOut11, 0.5, 1e-12)),
    ],
  },
  {
    id: 'q26-teleport-gate:b5',
    phase: 'books',
    text:
      `A Bell measurement needs a CNOT, which linear optics lacks. It can tell only two of the four Bell states apart: success at most $1/2$ per measurement and $1/4$ per gate. ` +
      `[[qc-klm|KLM's]] trick uses $n$ extra photons per teleportation and raises its chance to $n/(n+1)$ and a gate's to $(n/(n+1))^2$.`,
    formal:
      `Calsamiglia and Lütkenhaus: linear optics identifies a Bell state with chance at most $\\tfrac12$ (cited; the engine reaches ${d(V.q26BellAnalyserSuccess, 1)} on a balanced splitter). ` +
      `KLM, with $n$ photons per teleportation: $P_n = (n/(n+1))^2$, so $P_1 = ${d(V.q26Klm1, 2)}$, $P_3 = ${d(V.q26Klm3, 4)}$, $P_9 = ${d(V.q26Klm9, 2)}$, $P_{19} = ${d(V.q26Klm19, 4)}$ and $P_{199} = ${d(V.q26Klm199, 3)}$. ` +
      `For $F = P_n \\ge ${d(V.q26Target99, 2)}$ we need $n \\ge \\sqrt F/(1-\\sqrt F) = ${d(V.q26KlmExact99, 1)}$, so $n = ${V.q26KlmN99}$ (p. 262).`,
    caption: 'gate teleportation success against the photon number n, log axis',
    captionFormal: '$P_n$ against $n$, log axis, with the 0.99 line',
    stage: KLM(false),
    claims: [
      claim('q26BellAnalyserSuccess', 'a linear-optics Bell analyser identifies a Bell state with chance one half on average', () => close(V.q26BellAnalyserSuccess, 0.5, 1e-12)),
      claim('q26BellGate', 'two such analysers give a gate success of one quarter', () => close(V.q26BellGate, 0.25, 1e-12)),
      claim('q26Klm1', 'KLM with n = 1 succeeds with chance 0.25', () => close(V.q26Klm1, 0.25, 1e-12)),
      claim('q26Klm3', 'KLM with n = 3 succeeds with chance 0.5625', () => close(V.q26Klm3, 0.5625, 1e-12)),
      claim('q26Klm9', 'KLM with n = 9 succeeds with chance 0.81', () => close(V.q26Klm9, 0.81, 1e-12)),
      claim('q26Klm19', 'KLM with n = 19 succeeds with chance 0.9025', () => close(V.q26Klm19, 0.9025, 1e-12)),
      claim('q26Klm199', 'KLM with n = 199 succeeds with chance 0.990', () => close(V.q26Klm199, 0.99, 5e-4)),
      claim('q26Target99', 'the target success of this beat is F = 0.99 (a model input)', () => close(V.q26Target99, 0.99, 1e-12)),
      claim('q26KlmExact99', 'F = 0.99 needs n at least 198.5', () => close(V.q26KlmExact99, 198.5, 5e-2)),
      claim('q26KlmN99', 'F = 0.99 needs the whole number n = 199', () => V.q26KlmN99 === 199),
    ],
    derivation: {
      result: 'n = \\sqrt F/(1-\\sqrt F)',
      ground: [
        {
          tex: 'F = \\left(\\frac{n}{n+1}\\right)^2',
          why: 'The gate success is the square of the teleportation success.',
          view: KLM(false),
          viewCaption: 'gate success against n',
        },
        {
          tex: '\\sqrt F = \\frac{n}{n+1}',
          why: 'Take the square root of both sides.',
        },
        {
          tex: 'n = \\sqrt F/(1-\\sqrt F)',
          why: `Solve for $n$. For $F = ${d(V.q26Target99, 2)}$ this is ${d(V.q26KlmExact99, 1)}, so we need ${V.q26KlmN99} photons.`,
          view: KLM(true),
          viewCaption: 'the 0.99 line',
        },
      ],
      formal: [
        {
          tex: '\\sqrt F = \\frac{n}{n+1}',
          why: 'Take the square root of $F = P_n$.',
          view: KLM(false),
          viewCaption: 'gate success against n',
        },
        {
          tex: 'n \\ge \\sqrt F/(1-\\sqrt F)',
          why: `Solve for $n$: ${d(V.q26KlmExact99, 1)} at $F = ${d(V.q26Target99, 2)}$.`,
          view: KLM(true),
          viewCaption: 'the 0.99 line',
        },
      ],
    },
  },
  {
    id: 'q26-teleport-gate:b6',
    phase: 'clue',
    text: `We want gate success at least ${d(V.q26Target90, 1)}. What is the least $n$?`,
    formal: `Find the least integer $n$ with $(n/(n+1))^2 \\ge ${d(V.q26Target90, 1)}$, and the photons for ten gates at $F = ${d(V.q26Target99, 2)}$ if each uses $n + 1 = 200$.`,
    caption: 'gate success against n, with the 0.9 line',
    captionFormal: '$P_n$ against $n$ with the 0.9 line',
    stage: KLM90(false),
    reveal: {
      text: `$n = 19$ gives ${d(V.q26Klm19, 4)}; $n = 18$ gives ${d(V.q26Klm18, 4)}. For ten gates at ${d(V.q26Target99, 2)} the book counts $10 \\times 200 = ${V.q26KlmPhotons10}$ photons at once.`,
      formal:
        `$n = 19$, since $P_{18} = ${d(V.q26Klm18, 4)}$. The toy device of ten gates needs ${V.q26KlmPhotons10} simultaneous photons (p. 262), far beyond what experiments combine (stated in words).`,
      caption: 'the 0.9 line crosses between n = 18 and 19',
      captionFormal: '$P_{18}$ falls short of 0.9 and $P_{19}$ clears it',
      stage: KLM90(true),
      claims: [
        claim('q26Target90', 'the target success of this clue is 0.9 (a model input)', () => close(V.q26Target90, 0.9, 1e-12)),
        claim('q26KlmN90', 'success at least 0.9 needs the whole number n = 19', () => V.q26KlmN90 === 19),
        claim('q26Klm18', 'KLM with n = 18 succeeds with chance 0.8975, below 0.9', () => close(V.q26Klm18, 0.8975, 5e-5)),
        claim('q26Klm19', 'KLM with n = 19 succeeds with chance 0.9025, above 0.9', () => close(V.q26Klm19, 0.9025, 1e-12)),
        claim('q26KlmPhotons10', 'ten gates at success 0.99 use 10 times 200 = 2000 photons at once', () => V.q26KlmPhotons10 === 2000),
      ],
    },
  },
  {
    id: 'q26-teleport-gate:b7',
    phase: 'deeper',
    text:
      `Hong–Ou–Mandel explains the $1/2$. Mix two photons' polarization on a splitter. Of the four Bell states, two give patterns that no other state gives. The other two give the same patterns.`,
    formal:
      `Beyond the book. On a balanced splitter (four modes: path times polarization) the singlet $\\Psi^-$ exits one photon per port, and $\\Psi^+$ bunches with opposite polarizations. ` +
      `$\\Phi^+$ and $\\Phi^-$ both bunch with equal polarization and identical statistics, so only two of the four states are identified with certainty: success ${d(V.q26BellAnalyserSuccess, 1)} (engine: the permanent route, all four states).`,
    caption: 'bunching at 50:50; polarization separates Ψ⁺ from Φ±',
    captionFormal: 'bunching at 50:50; polarization separates $\\Psi^+$ from $\\Phi^\\pm$',
    stage: amp(C_HOM(0.5), 1, 'probability'),
  },
]

/* ---------------------------------------------------------------------------------------------- */
/* q26-nonlinear — Photons that talk through matter                                                   */
/* ---------------------------------------------------------------------------------------------- */

const nonlinear: Beat[] = [
  {
    id: 'q26-nonlinear:b1',
    phase: 'books',
    text:
      `If the $|1\\rangle$ paths of two dual-rail qubits pass through a medium that adds a phase per pair of photons, the gate table is $\\mathrm{diag}(1, 1, 1, e^{i\\varphi})$. ` +
      `At $\\varphi = \\pi$ it is CZ, with no failed runs. This is a [[qc-cross-kerr|cross-Kerr]] phase.`,
    formal:
      `$U_{\\mathrm{Kerr}} = e^{i\\hat H_{\\mathrm{Kerr}}t/\\hbar}$ with $\\hat H_{\\mathrm{Kerr}} = \\varphi\\hat n_1\\hat n_2$ (Eq. 14.3) sends $|11\\rangle$ to $e^{i\\varphi}|11\\rangle$ and leaves the other three alone. ` +
      `At $\\varphi = \\pi$ it is CZ (<<qc-q4-cnot|Unit 4.4>>), and on $|{+}{+}\\rangle$ it gives concurrence ${d(V.q26KerrConc, 0)} (gap $${d(V.q26KerrGap, 0)}$). ` +
      `The challenge is a full $\\pi$ without loss: reported work reaches large phases only with large absorption, which we state in words.`,
    caption: 'CZ on |++⟩ makes a Bell pair',
    captionFormal: '$\\varphi = \\pi$ on $|{+}{+}\\rangle$: concurrence 1',
    stage: tq(C_KERR, 1),
    claims: [
      claim('q26KerrConc', 'a cross-Kerr phase of pi on |++> gives concurrence 1', () => close(V.q26KerrConc, 1, 1e-12)),
      claim('q26KerrGap', 'the Kerr circuit equals diag(1, 1, 1, e^{i pi}) (max-abs gap)', () => close(V.q26KerrGap, 0, 1e-12)),
    ],
  },
  {
    id: 'q26-nonlinear:b2',
    phase: 'books',
    text:
      `Model the medium as one two-level atom (<<qc-l11-two-level|Unit 11.6>>) and one light mode: the [[qc-jaynes-cummings|Jaynes–Cummings model]]. Here $g$ is the atom's lower level and $e$ its upper level, so $|e,n\\rangle$ is the atom up with $n$ photons. ` +
      `$\\Omega_0$ is the coupling to one photon, $\\Omega_n = \\Omega_0\\sqrt{n+1}$, and $\\Delta$ is the detuning of the light from the atom. ` +
      `The states $|e,n\\rangle$ and $|g,n+1\\rangle$ mix, and the two energies are $\\sqrt{\\Delta^2 + \\Omega_n^2}$ apart. ` +
      `For $\\Delta = 10\\Omega_0$ the angle $\\varphi_0 = \\tan^{-1}(\\Omega_0/\\Delta)$ is only $${d(V.q26MixAngle0, 1)}^\\circ$, and the dressed state itself turns by half of that.`,
    formal:
      `The [[qc-jaynes-cummings|Jaynes–Cummings]] block on $\\{|e,n\\rangle,|g,n+1\\rangle\\}$ has levels $E_\\pm(n) = E_n \\pm \\tfrac{\\hbar}{2}\\sqrt{\\Delta^2 + \\Omega_n^2}$ with $\\Omega_0$ the one-photon coupling, $\\Omega_n = \\Omega_0\\sqrt{n+1}$ and $\\varphi_n = \\tan^{-1}(\\Omega_n/\\Delta)$. ` +
      `The upper dressed state is $\\cos(\\varphi_n/2)|e,n\\rangle + \\sin(\\varphi_n/2)|g,n+1\\rangle$ (p. 264). ` +
      `The engine's eigenvalues of the $2\\times2$ block equal this for $n = 0$ to 5 at $\\Delta = 10\\Omega_0$ (gap $${d(V.q26JcEigGap, 0)}$), and $\\varphi_0 = ${d(V.q26MixAngle0, 3)}^\\circ$.`,
    caption: 'energy shift of the lower level for 0 to 5 photons',
    captionFormal: '$E_-(n) - E_-(0)$ for $n = 0$ to 5 at $\\Delta = 10\\Omega_0$',
    stage: JC_EXACT(),
    claims: [
      claim('q26MixAngle0', 'at Delta = 10 Omega_0 and n = 0 the angle phi_0 = arctan(Omega_0 / Delta) is 5.711 degrees', () => close(V.q26MixAngle0, 5.711, 5e-4)),
      claim('q26JcEigGap', 'the eigenvalues of the 2x2 block equal -+(1/2) sqrt(Delta^2 + Omega_n^2) for n = 0 to 5 (max-abs gap)', () => close(V.q26JcEigGap, 0, 1e-12)),
    ],
  },
  {
    id: 'q26-nonlinear:b3',
    phase: 'books',
    text:
      `For large detuning expand the square root: $\\sqrt{\\Delta^2 + x} \\approx \\Delta + \\frac{x}{2\\Delta}$ for small $x$. Each extra photon then shifts the energy by $\\hbar\\chi$, the [[qc-dispersive-shift|dispersive shift]], with $\\chi = \\frac{\\Omega_0^2}{4\\Delta}$, which is ${d(V.q26Chi, 3)} times $\\Omega_0$ for $\\Delta = 10\\Omega_0$.`,
    formal:
      `$E_n$ is the bare energy of the block, $\\frac{(2n+1)\\hbar\\omega}{2}$ for light of frequency $\\omega$; apart from $n\\hbar\\omega$, $E_-(n) - E_-(0) \\simeq -\\hbar\\chi n$ with the [[qc-dispersive-shift|dispersive shift]] $\\chi = \\frac{\\Omega_0^2}{4\\Delta}$. For the atom in $|g\\rangle$ this gives $U_{\\mathrm{Kerr}} = e^{i\\chi\\hat a^\\dagger\\hat a t}$ (p. 265). ` +
      `The exact first step is ${d(V.q26ChiExact01, 4)}$\\,\\Omega_0$ against ${d(V.q26Chi, 3)}$\\,\\Omega_0$, and $\\chi t = \\pi$ at $t = ${d(V.q26ChiPhaseTime, 1)}/\\Omega_0$. Rosetta: Bergou's $\\Delta$ is signed; our $\\chi$ uses its size. For light below the atomic frequency the atom stays in $|g\\rangle$, in the lower dressed level.`,
    caption: 'the exact shifts hug the straight line −χn',
    captionFormal: 'exact $E_-(n) - E_-(0)$ against the line $-\\chi n$',
    stage: JC_BOTH(),
    claims: [
      claim('q26Chi', 'chi = Omega_0^2/(4 Delta) is 0.025 Omega_0 at Delta = 10 Omega_0', () => close(V.q26Chi, 0.025, 1e-12)),
      claim('q26ChiExact01', 'the exact first step of the lower level is 0.0248 Omega_0 (downward)', () => close(V.q26ChiExact01, 0.0248, 5e-5) && V.q26JcShift1 < 0),
      claim('q26ChiPhaseTime', 'chi t = pi at t = 125.7 / Omega_0', () => close(V.q26ChiPhaseTime, 125.7, 5e-2)),
    ],
    derivation: {
      result: '\\chi = \\frac{\\Omega_0^2}{4\\Delta}',
      ground: [
        {
          tex: '\\sqrt{\\Delta^2 + x} \\approx \\Delta + \\frac{x}{2\\Delta}',
          why: 'For small $x$ the square root is almost a straight line in $x$.',
          view: JC_EXACT(),
          viewCaption: 'exact shifts of the lower level',
        },
        {
          tex: 'E_-(n) \\approx E_n - \\frac{\\Delta}{2} - \\frac{\\Omega_0^2(n+1)}{4\\Delta}',
          why: 'Put $x = \\Omega_0^2(n+1)$ and halve: the lower level moves down by $\\frac{\\Omega_0^2(n+1)}{4\\Delta}$. Here $E_n$ is the bare energy of the block, $\\frac{(2n+1)\\hbar\\omega}{2}$ for light of frequency $\\omega$.',
        },
        {
          tex: '\\chi = \\frac{\\Omega_0^2}{4\\Delta}',
          why: 'Apart from the bare $n\\hbar\\omega$, the part that grows with $n$ is $-n\\frac{\\Omega_0^2}{4\\Delta}$, so each photon shifts the level by $\\hbar\\chi$.',
          view: JC_BOTH(),
          viewCaption: 'the same shifts against the line −χn',
        },
      ],
      formal: [
        {
          tex: 'E_-(n) = E_n - \\frac{\\hbar}{2}\\sqrt{\\Delta^2 + \\Omega_0^2(n+1)} \\simeq E_n - \\frac{\\hbar\\Delta}{2} - \\hbar\\frac{\\Omega_0^2(n+1)}{4\\Delta}',
          why: 'Expand the root for $\\Omega_n \\ll |\\Delta|$, with $E_n = \\frac{(2n+1)\\hbar\\omega}{2}$ the bare energy.',
          view: JC_EXACT(),
          viewCaption: 'exact shifts of the lower level',
        },
        {
          tex: '\\chi = \\frac{\\Omega_0^2}{4\\Delta}',
          why: 'The coefficient of $-\\hbar n$.',
          view: JC_BOTH(),
          viewCaption: 'the same shifts against the line −χn',
        },
      ],
    },
  },
  {
    id: 'q26-nonlinear:b4',
    phase: 'books',
    text:
      `A product $\\hat n_1\\hat n_2$ needs two light modes, each tuned to a different atomic transition. Experiments have shown such phases with cold atoms, Rydberg atoms and superconducting circuits. We state this in words.`,
    formal:
      `Bergou p. 265: a multi-level medium, with each mode resonant with its own transition (polarization selection rules), gives the cross-Kerr form in the same way. ` +
      `The microwave version is circuit QED, taken up in Chapter Q27 (in words); Chapter Q24's Lindblad and Rabi tools describe the control.`,
    caption: 'two modes, two transitions',
    captionFormal: 'two modes, two transitions',
    stage: circ(C_KERR, 1),
  },
  {
    id: 'q26-nonlinear:b5',
    phase: 'books',
    text:
      `A laser beam is a [[qc-coherent-state|coherent state]] $|\\alpha\\rangle$. Two of opposite sign overlap by $e^{-4\\alpha^2}$ in chance: ${d(V.q26Overlap1, 3)} for $\\alpha = 1$, about $10^{-7}$ for $\\alpha = 2$. ` +
      `The sum and the difference, [[qc-cat-state|cat states]], are exactly [[orthogonal|orthogonal]]: one has only even photon numbers, the other only odd.`,
    formal:
      `$|\\alpha\\rangle = e^{-\\frac{|\\alpha|^2}{2}}\\sum_n\\alpha^n|n\\rangle/\\sqrt{n!}$ and $\\langle\\beta|\\alpha\\rangle = e^{\\alpha\\beta^* - \\frac{|\\alpha|^2 + |\\beta|^2}{2}}$, so $|\\langle -\\alpha|\\alpha\\rangle|^2 = e^{-4\\alpha^2}$: ${d(V.q26Overlap1, 4)} at $\\alpha = 1$ and about $10^{-7}$ at $\\alpha = 2$. ` +
      `The states $|\\alpha\\rangle \\pm |-\\alpha\\rangle$ are even and odd in $n$, hence [[orthogonal|orthogonal]], with norm $1/\\sqrt{2(1 \\pm e^{-2\\alpha^2})}$: ${d(V.q26CatEvenNorm, 4)} for the even one at $\\alpha = 2$.`,
    caption: 'photon-number chances of |α = 2⟩ and of its even cat: the cat has only even n',
    captionFormal: '$|\\langle n|\\alpha\\rangle|^2$ and the even cat, $\\alpha = 2$',
    stage: COH_CAT_PLOT(),
    claims: [
      claim('q26Overlap1', 'two coherent states of opposite sign at alpha = 1 overlap by 0.0183', () => close(V.q26Overlap1, 0.0183, 5e-5) && close(V.q26Overlap1, Math.exp(-4), 1e-12)),
      claim('q26Overlap2', 'two coherent states of opposite sign at alpha = 2 overlap by about 10^-7', () => V.q26Overlap2 > 1e-7 && V.q26Overlap2 < 2e-7),
      claim('q26OverlapSeriesGap', 'the Fock-series overlap equals exp(-4 alpha^2) at alpha = 1 (max-abs gap)', () => close(V.q26OverlapSeriesGap, 0, 1e-12)),
      claim('q26CatEvenNorm', 'the even cat at alpha = 2 has norm factor 0.7070', () => close(V.q26CatEvenNorm, 0.707, 5e-4)),
    ],
  },
  {
    id: 'q26-nonlinear:b6',
    phase: 'clue',
    text: `The even cat with $\\alpha = 2$: what is the chance of an odd number of photons? And of no photon at all?`,
    formal: `Find the chance of an odd photon number and the chance of zero photons for $|\\alpha\\rangle + |-\\alpha\\rangle$ at $\\alpha = 2$, scaled to length 1.`,
    caption: 'photon-number chances of the coherent state, α = 2',
    captionFormal: '$|\\langle n|\\alpha\\rangle|^2$ for $\\alpha = 2$',
    stage: COH_PLOT(),
    reveal: {
      text: `Exactly ${d(V.q26CatOddP, 0)} for odd. For no photon it is ${d(V.q26CatP0, 4)}, twice the coherent state's ${d(V.q26CohP0, 4)}.`,
      formal:
        `The chance of odd $n$ is $${d(V.q26CatOddP, 0)}$. The chance of $0$ is $2e^{-4}/(1 + e^{-8}) = ${d(V.q26CatP0, 4)}$. ` +
        `The mean photon number is ${d(V.q26CatMean, 3)} for the cat and exactly ${d(V.q26CohMean, 0)} for $|\\alpha\\rangle$.`,
      caption: "the even cat's odd bars are empty",
      captionFormal: 'the even cat has no odd $n$',
      stage: COH_CAT_PLOT(),
      claims: [
        claim('q26CatOddP', 'the even cat at alpha = 2 has odd photon number with chance 0', () => close(V.q26CatOddP, 0, 1e-15)),
        claim('q26CatP0', 'the even cat at alpha = 2 has no photon with chance 0.0366', () => close(V.q26CatP0, 0.0366, 5e-5)),
        claim('q26CohP0', 'the coherent state at alpha = 2 has no photon with chance 0.0183', () => close(V.q26CohP0, 0.0183, 5e-5)),
        claim('q26CatMean', 'the even cat at alpha = 2 has mean photon number 3.997', () => close(V.q26CatMean, 3.997, 5e-4)),
        claim('q26CohMean', 'the coherent state at alpha = 2 has mean photon number 4', () => close(V.q26CohMean, 4, 1e-9)),
      ],
    },
  },
  {
    id: 'q26-nonlinear:b7',
    phase: 'deeper',
    text:
      `Probabilistic gates need many photons and detectors. Deterministic ones need strong nonlinearity. Cat-state codes make Bell measurements deterministic. None has yet passed beyond small demonstrations.`,
    formal:
      `Bergou pp. 263 and 266 name one-way (cluster) computing and a CNOT with two ancillas of chance one quarter, but derive neither. Continuous-variable gate teleportation and Bell measurement are deterministic, at the price of a large optical nonlinearity. ` +
      `Nothing here exceeds what the preceding units compute.`,
    caption: 'linear: probabilistic; nonlinear: deterministic but demanding',
    captionFormal: 'linear: probabilistic; nonlinear: deterministic but demanding',
    stage: tq(C_KERR, 1),
  },
]

export const Q26_STORY: Record<string, Beat[]> = {
  'q26-encodings': encodings,
  'q26-beamsplitter': beamsplitter,
  'q26-hom': hom,
  'q26-ns-cz': nsCz,
  'q26-teleport-gate': teleportGate,
  'q26-nonlinear': nonlinear,
}

/** Every claim used anywhere in a unit's beats, for Unit.claims (content.test.tsx "claims hold"). */
function allClaims(beats: Beat[]) {
  return beats.flatMap((b) => [...(b.claims ?? []), ...(b.reveal?.claims ?? []), ...(b.derivation?.ground.flatMap((s) => s.claims ?? []) ?? []), ...(b.derivation?.formal?.flatMap((s) => s.claims ?? []) ?? [])])
}
export const Q26_UNIT_CLAIMS_BY_ID: Record<string, ReturnType<typeof allClaims>> = Object.fromEntries(Object.entries(Q26_STORY).map(([id, beats]) => [id, allClaims(beats)]))
