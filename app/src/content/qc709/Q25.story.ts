/**
 * Chapter Q25 scroll story (Physics 709; roles P + W). Beats per docs/roles/proposals/P-Q25-story.md §1, in both tracks, under the judge's rulings
 * (docs/roles/decisions/qc709-Q20-Q27.md: Z2 no hardware digits, Z3 the Table 13.1 Correction proposed as "our calculation finds ..." for the review to confirm, Z4 the laser-cooling numbers
 * reuse the Optics Lab engine and link to its pages, Z5 no new SVG kind).
 *
 * Build notes against the plan:
 * - Phase `'books'` throughout (no 709 notes cover Bergou Chapter 13). The phase lint wants every books beat before the clues, so each unit's clue is its LAST beat (the plan numbers some clues in
 *   the middle): cooling b7 stopping an atom, readout b5 how long to look, ion-gates b5 the ground-state requirement; the Go-deeper beat (atom-gates b6) is last in its unit.
 * - Every number is the ENGINE's (Q25.values.ts). A typed decimal in prose is a model input with its own claim; counts are written through grp() (a count has no decimal point, so the number
 *   reader skips it); a fraction of two whole numbers, "2/3", "1/2", "3/2" is read as a decimal by the number reader, so formulas use \frac{symbol}{...} and the few exponents that are fractions
 *   have claims (q25TwoThirdsArg, q25OneThirdArg, q25RBexp). Equations are cited as "Eq. 13.6", never "(13.6)"; "Table 13.1" is "the table on p. 225".
 * - No experimental number (ruling Z2): record gates, coherence times and array sizes are in words. Model inputs are named as such in the beat that uses them.
 * - A stage `split` never repeats a kind. Plot points (`plot` points mode, at most 24 points and 4 groups) take every y from the engine through Q25.values.ts.
 */
import type { Circuit } from '../../physics/qc/circuit'
import type { AmplitudesState, BallState, Beat, BlochState, CircuitStageState, Claim, Dir, MatrixGridState, MatrixSource, PlotPointsState, PlotState, StageLayout, StageState } from '../schema'
import {
  C_CZ,
  C_CZG,
  C_KICK,
  C_KICK_SMALL,
  C_MS4,
  C_SB,
  C_SITE,
  PTS_COOL,
  PTS_CURV,
  PTS_CZMS,
  PTS_ERR,
  PTS_HIST,
  PTS_LOOPS,
  PTS_RAMAN,
  PTS_RYD,
  PTS_SB,
  PTS_SCALING,
  PTS_SITES,
  PTS_SPEED,
  PTS_T2,
  PTS_TD_OURS,
  PTS_TD_PRINTED,
  TD_NAMES,
  V,
  type ValueKey,
  claim,
  close,
  d,
  grp,
} from './Q25.values'

/* ---------------------------------------------------------------------------------------------- */
/* Stage shorthand (plan "Stage shorthand"), as plain builder functions                              */
/* ---------------------------------------------------------------------------------------------- */
const circ = (C: Circuit, upTo: number): CircuitStageState => ({ kind: 'circuit', circuit: C, upTo, shot: 'Q-WIRES' })
const amp = (C: Circuit, upTo: number, mode: AmplitudesState['mode']): AmplitudesState => ({ kind: 'amplitudes', state: { circuit: C, upTo }, mode, shot: 'A-BARS' })
const mx = (source: MatrixSource, extra: Partial<Omit<MatrixGridState, 'kind' | 'source' | 'labels'>> = {}): MatrixGridState => ({ kind: 'matrix', source, labels: 'kets', values: 'exact', shot: 'M-GRID', ...extra })
const ball = (r: readonly number[]): BallState => ({ kind: 'bloch-ball', point: { r: [r[0], r[1], r[2]] }, purity: true, shot: 'B-STD' })
const bl = (state: Dir, extra: Partial<Omit<BlochState, 'kind' | 'state'>> = {}): BlochState => ({ kind: 'bloch', state, shot: 'B-STD', ...extra })
const PL = (fn: PlotState['curve']['fn'], vs?: PlotState['curve']['vs'], markers: number[] = [], extra: Partial<Omit<PlotState, 'kind' | 'curve' | 'markers'>> = {}, x?: { from: number; to: number }): PlotState => ({
  kind: 'plot',
  curve: { fn, ...(vs ? { vs } : {}), ...(x ? { x } : {}), samples: 60 },
  markers: markers.map((m) => ({ x: m })),
  shot: 'P-CURVE',
  ...extra,
})
interface Grp {
  name: string
  pts: { x: number; y: number; label?: string }[]
  status?: 'computed' | 'reported'
}
/** `plot` points mode: one group per series (computed = filled; reported = hollow "as printed"), every y from the engine. */
const PT = (groups: Grp[], extra: Partial<Omit<PlotPointsState, 'kind' | 'points' | 'shot'>> = {}): PlotPointsState => ({
  kind: 'plot',
  points: groups.flatMap((g) => g.pts.map((p) => ({ ...p, status: g.status ?? ('computed' as const), group: g.name }))),
  shot: 'P-CURVE',
  ...extra,
})
const split = (top: StageState, bottom: StageState): StageLayout => ({ layout: 'split', top, bottom })

/** A claim that a V key is close to the number the text shows (half a unit of the last shown digit by default). */
const cv = (key: ValueKey, text: string, x: number, tol = 5e-4): Claim => claim(key, text, () => close(V[key], x, tol))
/** A claim that a `...Gap` key (a max-abs difference of two routes, rounded) is zero. */
const gap = (key: ValueKey, text: string): Claim => claim(key, text, () => close(V[key], 0, 1e-12))

/* ---------------------------------------------------------------------------------------------- */
/* Stage data                                                                                       */
/* ---------------------------------------------------------------------------------------------- */
const SPEED_STAGE = (upTo?: number): PlotPointsState =>
  PT([{ name: 'speed of a Rb atom', pts: (upTo ? PTS_SPEED.slice(0, upTo) : PTS_SPEED).map((p) => ({ x: p.x, y: p.y })) }], { xLabel: 'photons absorbed', yLabel: 'speed (m/s)' })
const TD_STAGE: PlotPointsState = PT(
  [
    { name: 'our calculation', pts: PTS_TD_OURS.map((y, i) => ({ x: i + 1, y, label: TD_NAMES[i] })) },
    { name: 'as printed', pts: PTS_TD_PRINTED.map((y, i) => ({ x: i + 1, y })), status: 'reported' },
  ],
  { xLabel: 'column of the table', yLabel: 'T_Doppler (µK)', yScale: 'log' },
)
const SITES_STAGE: PlotPointsState = PT([{ name: 'chance of 100 atoms', pts: PTS_SITES.map((p) => ({ x: p.x, y: p.y })) }], { xLabel: 'sites loaded half full', yLabel: 'chance of ≥ 100 atoms', yLines: [{ y: 0.99, label: '0.99' }] })
const hist = (a: number[], b: number[], c?: number[]): PlotPointsState =>
  PT(
    [
      { name: 'dark atom', pts: a.map((y, n) => ({ x: n, y })) },
      ...(c ? [{ name: 'signal alone', pts: c.map((y, n) => ({ x: n, y })) }] : []),
      { name: 'bright atom', pts: b.map((y, n) => ({ x: n, y })) },
    ],
    { xLabel: 'photon count n', yLabel: 'chance' },
  )
const ERR_STAGE: PlotPointsState = PT([{ name: 'equal-weight error', pts: PTS_ERR }], { xLabel: 'cutoff n_c', yLabel: 'error' })
const T2_STAGE: PlotPointsState = PT(
  [
    { name: 'semiclassical', pts: PTS_T2.map((p) => ({ x: p.x, y: p.semi })) },
    { name: 'exact thermal sum', pts: PTS_T2.map((p) => ({ x: p.x, y: p.quantum })) },
  ],
  { xLabel: 'temperature (µK)', yLabel: 'T2* (ms)', xScale: 'log', yScale: 'log' },
)
const RAMAN_STAGE: PlotPointsState = PT(
  [
    { name: 'our simulation', pts: PTS_RAMAN.map((p) => ({ x: p.x, y: p.sim })) },
    { name: 'estimate (π/2)γ/Δ', pts: PTS_RAMAN.map((p) => ({ x: p.x, y: p.est })) },
  ],
  { xLabel: 'Δ over γ', yLabel: 'loss of one π pulse', xScale: 'log', yScale: 'log' },
)
const SCALING_STAGE = (key: 'u' | 'rb', name: string): PlotPointsState => PT([{ name, pts: PTS_SCALING.map((p) => ({ x: p.x, y: p[key] })) }], { xLabel: 'n', yLabel: 'relative to n = 25', yScale: 'log' })
const RYD_STAGE: PlotPointsState = PT([{ name: 'best error', pts: PTS_RYD }], { xLabel: 'B times τ', yLabel: 'best gate error', xScale: 'log', yScale: 'log' })
const CURV_STAGE: PlotPointsState = PT([{ name: 'curvature', pts: PTS_CURV.map((p, i) => ({ x: p.x, y: p.y, label: ['x', 'y', 'z'][i] })) }], { xLabel: 'direction (x, y, z)', yLabel: 'curvature' })
const SB_STAGE: PlotPointsState = PT(
  [
    { name: 'exact', pts: PTS_SB.map((p) => ({ x: p.x, y: p.exact })) },
    { name: 'first order', pts: PTS_SB.map((p) => ({ x: p.x, y: p.first })) },
  ],
  { xLabel: 'phonon number n', yLabel: 'blue sideband strength' },
)
const COOL_STAGE: PlotPointsState = PT(
  [
    { name: 'a pulse per level', pts: PTS_COOL.map((p) => ({ x: p.x, y: p.sum })) },
    { name: 'every pulse the same', pts: PTS_COOL.map((p) => ({ x: p.x, y: p.naive })) },
  ],
  { xLabel: 'starting phonon number', yLabel: 'time (1/ηΩ)' },
)
const ETA_STAGE: PlotPointsState = PT(
  [
    { name: 'light, 313 nm', pts: [{ x: 1, y: V.q25eta0 }] },
    { name: 'microwave, clock line', pts: [{ x: 2, y: V.q25etaMicro * 1e-6 }] },
  ],
  { xLabel: 'light 1, microwave 2', yLabel: 'sideband/carrier = η', yScale: 'log' },
)
const CZMS_STAGE = (withCz = true): PlotPointsState =>
  PT(
    [
      { name: 'Mølmer–Sørensen', pts: PTS_CZMS.map((p) => ({ x: p.x, y: p.ms })) },
      ...(withCz ? [{ name: 'Cirac–Zoller', pts: PTS_CZMS.map((p) => ({ x: p.x, y: p.cz })) }] : []),
    ],
    { xLabel: 'phonon number n', yLabel: 'Bell chance' },
  )
const CZ_STAGE: PlotPointsState = PT([{ name: 'Cirac–Zoller', pts: PTS_CZMS.slice(0, 3).map((p) => ({ x: p.x, y: p.cz })) }], { xLabel: 'phonon number n', yLabel: 'Bell chance' })
const LOOPS_STAGE: PlotPointsState = PT([{ name: 'infidelity', pts: PTS_LOOPS }], { xLabel: 'loops completed K', yLabel: 'infidelity', yScale: 'log' })

/* ---------------------------------------------------------------------------------------------- */
/* q25-cooling — Stopping, cooling and holding an atom                                               */
/* ---------------------------------------------------------------------------------------------- */

const cooling: Beat[] = [
  {
    id: 'q25-cooling:b1',
    phase: 'books',
    text:
      `A [[qubit|qubit]] needs two long-lived states of an atom. In caesium they are two [[qc-clock-state|clock states]], one in each of the two [[hyperfine]] groups, both with $m = 0$. ` +
      `A magnetic field does not shift them to first order. Strontium offers a ground state and a long-lived excited one.`,
    formal:
      `A hyperfine [[qubit|qubit]] uses the [[qc-clock-state|clock states]] $|f_+, 0\\rangle$ and $|f_-, 0\\rangle$ of the ground configuration, which have no linear Zeeman shift (Fig. 13.3). ` +
      `Caesium has ${V.q25ZeemanCs} ground sublevels, of which two serve; the nuclear spin of ⁸⁷Sr gives ${V.q25NuclearSr} nuclear states. Optical qubits use a ground state and a metastable one.`,
    caption: 'the two clock states as the poles of a qubit',
    captionFormal: 'the two clock states as the poles of a qubit',
    stage: bl('+z'),
    claims: [claim('q25ZeemanCs', 'caesium has sixteen ground sublevels, nine plus seven', () => V.q25ZeemanCs === 16), claim('q25NuclearSr', 'strontium-87 has ten nuclear states', () => V.q25NuclearSr === 10)],
  },
  {
    id: 'q25-cooling:b2',
    phase: 'books',
    text:
      `At room temperature the caesium clock frequency has ${d(V.q25nbarCs300, 1)} thermal photons per mode. A strontium line at 698 nm sees almost none: the chance is $e^{-${d(V.q25OptExponent, 1)}}$. ` +
      `Magnetic couplings are weak, which is why atoms keep their phase.`,
    formal:
      `At $300\\,$K the Bose–Einstein factor $\\bar n = 1/(e^{h\\nu/k_BT} - 1)$ at the caesium clock frequency (a model input, the definition of the second) is $${d(V.q25nbarCs300, 1)}$ per mode. ` +
      `For the strontium line at 698 nm (Fig. 13.3), $h\\nu/k_BT = ${d(V.q25OptExponent, 1)}$, so $\\bar n \\approx e^{-${d(V.q25OptExponent, 1)}}$. The optical line is about ${grp(Math.round(V.q25FreqRatio / 100) * 100)} times faster. ` +
      `Bergou ties the long phase times of atoms to weak magnetic-dipole couplings (p. 222); chips need millikelvin cooling for this reason (Chapter Q27).`,
    caption: 'thermal photons per mode: hundreds at gigahertz, none at light frequencies',
    captionFormal: 'thermal photons per mode: hundreds at gigahertz, none at light frequencies',
    stage: bl('+x'),
    claims: [
      cv('q25nbarCs300', 'at 300 K the caesium clock mode has 679.5 thermal photons', 679.5, 0.05),
      cv('q25OptExponent', 'the 698 nm line has h nu over k T = 68.7', 68.7, 0.05),
      claim('q25FreqRatio', 'the optical line is about 46 700 times faster than the clock line', () => close(V.q25FreqRatio, 46700, 100)),
    ],
  },
  {
    id: 'q25-cooling:b3',
    phase: 'books',
    text:
      `A photon carries momentum $\\hbar k$. An atom that absorbs it gets a kick of $\\hbar k/m$ in speed. For rubidium this is ${d(V.q25vRecRb, 3)} mm/s, tiny, but the atom scatters millions of photons a second. ` +
      `Warm atoms are fast: caesium at 300 kelvin moves at ${d(V.q25vCs300, 1)} m/s.`,
    formal:
      `Energy and momentum conservation (Eqs. 13.1–13.2) give the atom a velocity change $\\hbar(\\mathbf k - \\mathbf k_{\\rm sp})/m$ per cycle (Eqs. 13.3–13.4); a photon of this size is a [[qc-op-recoil|photon recoil]]. ` +
      `For ⁸⁷Rb at 780 nm, $v_{\\rm rec} = \\hbar k/m = ${d(V.q25vRecRb, 3)}$ mm/s. A caesium atom at $300\\,$K moves at $v = \\sqrt{3k_BT/m} = ${d(V.q25vCs300, 1)}$ m/s and at $10\\,$mK at $${d(V.q25vCs10mK, 3)}$ m/s; Bergou rounds these to 240 and 1.4.`,
    caption: 'speed against photons absorbed: a straight line down to zero',
    captionFormal: 'speed against photons absorbed: a straight line down to zero',
    stage: SPEED_STAGE(),
    derivation: {
      result: 'v_{\\rm rec} = \\hbar k/m',
      ground: [
        { tex: 'p_{\\rm photon} = \\hbar k', why: 'An atom at rest absorbs a photon, which carries the momentum $\\hbar k$.', view: SPEED_STAGE(2), viewCaption: 'one photon: one kick' },
        { tex: 'mv = \\hbar k', why: 'Momentum is conserved, so the atom now has momentum $\\hbar k$.' },
        { tex: 'v = \\hbar k/m', why: 'Divide by the mass. After $N$ photons from one beam the speed is $N\\hbar k/m$.', view: SPEED_STAGE(), viewCaption: 'speed against photons' },
      ],
      formal: [
        { tex: 'm\\mathbf v_f = m\\mathbf v_i + \\hbar\\mathbf k', why: 'Eq. 13.2 with $\\mathbf v_i = 0$.', view: SPEED_STAGE(2), viewCaption: 'one photon: one kick' },
        { tex: 'v_{\\rm rec} = \\hbar k/m', why: 'The result; $N$ photons from one beam give $N v_{\\rm rec}$.', view: SPEED_STAGE(), viewCaption: 'speed against photons' },
      ],
    },
    claims: [
      cv('q25vRecRb', 'for rubidium one photon changes the speed by 5.885 mm/s', 5.885),
      cv('q25vCs300', 'caesium at 300 K moves at 237.3 m/s', 237.3, 0.05),
      cv('q25vCs10mK', 'and at 10 mK at 1.370 m/s', 1.37),
    ],
  },
  {
    id: 'q25-cooling:b4',
    phase: 'books',
    text:
      `A resonant atom cannot be more than half excited when strongly driven (<<qc-q24-bloch-eq|Unit 24.3>>). It scatters at most $\\gamma/2$ photons a second, which is ${d(V.q25rmaxRb, 2)} million for rubidium. ` +
      `The push is about ${grp(V.q25aOverG)} times gravity.`,
    formal:
      `From the optical Bloch equations (Section 12.3) the steady excited share is at most one half, so $r_{\\max} = \\gamma\\rho_{ee} \\le \\gamma/2$ (p. 224). With $\\gamma/2\\pi = ${d(V.q25GammaRb, 2)}$ MHz, ` +
      `$r_{\\max} = ${d(V.q25rmaxRb, 2)}\\times10^{6}\\,{\\rm s}^{-1}$ and $a = \\hbar k\\,r_{\\max}/m = ${grp(Math.round(V.q25aRb / 100) * 100)}$ m/s², which is ${grp(V.q25aOverG)} times $g$. Bergou says as much as ten thousand times.`,
    caption: 'a fully saturated qubit: the arrow at the centre of the ball',
    captionFormal: 'a fully saturated qubit: the arrow at the centre of the ball',
    stage: ball([0, 0, 0]),
    claims: [
      cv('q25rmaxRb', 'rubidium scatters at most 19.07 million photons a second', 19.07, 0.005),
      claim('q25aRb', 'the largest acceleration is about 112 200 m/s^2', () => close(V.q25aRb, 112200, 100)),
      claim('q25aOverG', 'the push is about 11 443 times gravity', () => close(V.q25aOverG, 11443, 1)),
      cv('q25GammaRb', 'the linewidth of rubidium is gamma over 2 pi = 6.07 MHz', 6.07, 0.005),
    ],
  },
  {
    id: 'q25-cooling:b5',
    phase: 'books',
    text:
      `Each scattered photon also heats the atom, by a third of the recoil temperature: ${d(V.q25HeatPerPhoton, 4)} µK for rubidium, so ${d(V.q25Heat100, 2)} µK after 100 photons. ` +
      `Cooling beams balance this at $k_BT_D = \\hbar\\gamma/2$, the [[qc-op-doppler-limit|Doppler limit]]. <<qc-q25-o2-limit|Optics Lab O2>> works out the balance, and <<qc-q25-o3-gradient|Optics Lab O3>> shows how light can cool below it.`,
    formal:
      `Random emission gives $T_j = (2U_r/3k_B)\\,rt$ (Eq. 13.5), with $U_r = \\frac{(\\hbar k)^2}{2m}$ and $T_r = 2U_r/k_B = ${d(V.q25TrRb, 3)}\\,\\mu$K for rubidium. Each photon adds $T_r/3 = ${d(V.q25HeatPerPhoton, 4)}\\,\\mu$K, and 100 photons add $${d(V.q25Heat100, 2)}\\,\\mu$K. ` +
      `Red-detuned opposed beams ([[qc-op-optical-molasses|optical molasses]]) reach $k_BT_D = \\hbar\\gamma/2$ (p. 225). Recomputing the table on p. 225 gives $T_D = ${d(V.q25TDRb, 1)}, ${d(V.q25TDCs, 1)}, ${d(V.q25TDSr461, 1)}, ${d(V.q25TDSr689, 3)}\\,\\mu$K ` +
      `and $T_r = ${d(V.q25TrRb, 3)}, ${d(V.q25TrCs, 3)}, ${d(V.q25TrSr461, 3)}, ${d(V.q25TrSr689, 3)}\\,\\mu$K for rubidium, caesium and strontium at 461 nm and at 689 nm. The last $T_D$ is printed as $${d(V.q25TDPrinted, 2)}$ (Errata). ` +
      `The same formulas run in the <<qc-q25-o2-limit|Optics Lab>> engine, with Steck's linewidths, so its rubidium and caesium limits differ in the fourth digit.`,
    caption: 'Doppler temperature of the four columns: ours (filled) against as printed (hollow); the fourth disagrees',
    captionFormal: 'Doppler temperature of the four columns: ours (filled) against as printed (hollow); the fourth disagrees',
    stage: TD_STAGE,
    fidelity: ['qc-plot-points-printed'],
    claims: [
      cv('q25HeatPerPhoton', 'each photon heats rubidium by 0.1207 microkelvin', 0.1207, 5e-5),
      cv('q25Heat100', 'a hundred photons heat it by 12.07 microkelvin', 12.07, 0.005),
      cv('q25TDRb', 'the Doppler temperature of rubidium is 145.7 microkelvin', 145.7, 0.05),
      cv('q25TDCs', 'of caesium 125.5', 125.5, 0.05),
      cv('q25TDSr461', 'of strontium at 461 nm 731.9', 731.9, 0.05),
      cv('q25TDSr689', 'of strontium at 689 nm 0.178', 0.178),
      cv('q25TrRb', 'the recoil temperature of rubidium is 0.362 microkelvin', 0.362),
      cv('q25TrCs', 'of caesium 0.198', 0.198),
      cv('q25TrSr461', 'of strontium at 461 nm 1.028', 1.028),
      cv('q25TrSr689', 'of strontium at 689 nm 0.460', 0.46),
      cv('q25TDPrinted', 'the table prints 1.02 for the narrow line', 1.02, 5e-3),
      claim('q25TDPrintedRb', 'the table prints 146 for rubidium', () => V.q25TDPrintedRb === 146),
      claim('q25TDPrintedCs', 'and 125 for caesium', () => V.q25TDPrintedCs === 125),
      claim('q25TDPrintedSr461', 'and 720 for strontium at 461 nm', () => V.q25TDPrintedSr461 === 720),
    ],
  },
  {
    id: 'q25-cooling:b6',
    phase: 'books',
    text:
      `Far-detuned light holds atoms in a focused [[qc-optical-tweezer|tweezer]]. Its trap depth falls as $1/\\Delta$ but its scattering falls as $1/\\Delta^2$. At ten times the detuning the ratio of scattering to depth falls to one tenth ($${d(V.q25ScatPerDepth, 1)}$ of what it was). ` +
      `Collisions remove atoms in pairs, so, for Poisson loading, a site holds one atom at most half the time.`,
    formal:
      `Scattering scales as $1/\\Delta^2$ and the light shift as $1/\\Delta$ (<<qc-q25-o5-dipole|Optics Lab O5>>). If a site loads $N \\sim$ Poisson($\\mu$) atoms and pairs leave, a site ends with one atom with chance $P(N\\ \\mathrm{odd}) = (1 - e^{-2\\mu})/2$, ` +
      `which is $${d(V.q25PodMu1, 3)}$ at $\\mu = 1$ and never above one half. After [[qc-rearrangement|rearrangement]] into a full block, $${V.q25Sites100}$ sites loaded at a half give at least 100 atoms with chance $${d(V.q25P100of235, 2)}$, while 200 sites give $${d(V.q25P100of200, 3)}$.`,
    caption: 'chance of at least 100 atoms against the number of sites loaded half full',
    captionFormal: 'chance of at least 100 atoms against the number of sites loaded half full',
    stage: SITES_STAGE,
    claims: [
      cv('q25ScatPerDepth', 'at ten times the detuning the ratio of scattering to depth falls to 0.1 of what it was', 0.1, 1e-12),
      cv('q25PodMu1', 'at mu = 1 a site holds one atom with chance 0.432', 0.432),
      claim('q25Sites100', '235 sites loaded at a half give at least 100 atoms with chance 0.99', () => V.q25Sites100 === 235),
      cv('q25P100of235', 'with chance 0.99', 0.99, 5e-3),
      cv('q25P100of200', 'and 200 sites give 0.528', 0.528),
    ],
  },
  {
    id: 'q25-cooling:b7',
    phase: 'clue',
    text:
      `A rubidium atom in a room-temperature oven has a thermal speed of about ${d(V.q25vRb300, 1)} m/s. How many photons must it scatter to stop, and how long does that take at the maximum rate?`,
    formal: `Using $v_{\\rm rec}$ and $r_{\\max}$ of the earlier beats, find $N = v/v_{\\rm rec}$ and $t = N/r_{\\max}$ for $v = \\sqrt{3k_BT/m}$ at $300\\,$K.`,
    caption: 'the same line: zero speed at the last photon',
    captionFormal: 'the same line: zero speed at the last photon',
    stage: SPEED_STAGE(),
    reveal: {
      text: `About ${grp(V.q25NstopRb)} photons, in ${d(V.q25tstopRb, 3)} ms. The atom travels only ${d(V.q25DstopRb, 3)} m while it stops: a short slowing tube is enough.`,
      formal: `$N = ${grp(V.q25NstopRb)}$ and $t = N/r_{\\max} = ${d(V.q25tstopRb, 3)}\\,$ms; the stopping distance is $vt/2 = ${d(V.q25DstopRb, 3)}\\,$m (a model: constant maximum rate, Doppler shift ignored).`,
      caption: 'the atom has stopped: the speed is zero at the last photon',
      captionFormal: 'the atom has stopped: the speed is zero at the last photon',
      stage: SPEED_STAGE(),
      claims: [
        claim('q25NstopRb', 'the atom must scatter about 49 862 photons to stop', () => close(V.q25NstopRb, 49862.057, 0.01)),
        cv('q25tstopRb', 'which takes 2.615 ms', 2.615),
        cv('q25DstopRb', 'over 0.384 m', 0.384),
      ],
    },
    claims: [cv('q25vRb300', 'the oven speed of rubidium at 300 K is 293.4 m/s', 293.4, 0.05)],
  },
]

/* ---------------------------------------------------------------------------------------------- */
/* q25-readout — Reading a qubit with light                                                         */
/* ---------------------------------------------------------------------------------------------- */

const readout: Beat[] = [
  {
    id: 'q25-readout:b1',
    phase: 'books',
    text:
      `A bright atom scatters photons at random, so the count is not fixed ([[qc-fluorescence-readout|fluorescence readout]]). If the mean count is $\\bar n$, the chance of exactly $n$ counts is $e^{-\\bar n}\\bar n^n/n!$. ` +
      `A dark atom gives only background counts.`,
    formal:
      `$f_s(n) = P(n,\\bar n) = e^{-\\bar n}\\bar n^n/n!$ with $\\bar n = r_st_s$ (p. 228). Model: a background mean of $${d(V.q25MeanDark, 1)}$ (a dark atom) and a signal of 8 added to it for a bright atom, so $${d(V.q25MeanDark, 1)}$ and $${d(V.q25MeanBright, 1)}$. ` +
      `Then $P_{\\rm dark}(0) = ${d(V.q25PDark0, 4)}$ and $P_{\\rm bright}(8) = ${d(V.q25PBright8, 4)}$ (<<qc-f5-probability|Unit F5.1>>).`,
    caption: 'count histograms for a dark atom (mean 0.2) and a bright atom (mean 8.2)',
    captionFormal: 'count histograms for a dark atom (mean 0.2) and a bright atom (mean 8.2)',
    stage: hist(PTS_HIST.dark, PTS_HIST.bright),
    claims: [
      cv('q25MeanDark', 'the dark mean is 0.2', 0.2, 1e-9),
      cv('q25MeanBright', 'the bright mean is 8.2', 8.2, 1e-9),
      cv('q25PDark0', 'a dark atom gives zero counts with chance 0.8187', 0.8187, 5e-5),
      cv('q25PBright8', 'a bright atom gives exactly eight with chance 0.1392', 0.1392, 5e-5),
    ],
  },
  {
    id: 'q25-readout:b2',
    phase: 'books',
    text:
      `Counts from the atom and counts from the background add. Two independent Poisson counts always add to a Poisson count whose mean is the sum. So a bright atom reads as Poisson with mean ${d(V.q25MeanBright, 1)}.`,
    formal:
      `For one atom, Eq. 13.6 is the convolution $\\sum_mP(m,\\bar n_s)P(n-m,\\bar n_b) = P(n,\\bar n_s + \\bar n_b)$, which the binomial theorem proves. The engine's sum of the two series equals the single Poisson law (gap $${d(V.q25ConvGap, 0)}$). ` +
      `With atom-number uncertainty the sum over the atom number adds a third Poisson layer (p. 229).`,
    caption: 'dark, signal, and their sum: the bright histogram',
    captionFormal: 'dark, signal, and their sum: the bright histogram',
    stage: hist(PTS_HIST.dark8, PTS_HIST.bright8, PTS_HIST.signal),
    derivation: {
      result: '\\sum_m P(m,a)P(n-m,b) = P(n,a+b)',
      ground: [
        { tex: '\\sum_m \\frac{e^{-a}a^m}{m!}\\,\\frac{e^{-b}b^{n-m}}{(n-m)!}', why: 'Split the $n$ counts into $m$ from the atom and $n-m$ from the background, and sum over $m$.', view: hist(PTS_HIST.dark8, PTS_HIST.bright8, PTS_HIST.signal), viewCaption: 'dark and signal' },
        { tex: '\\frac{e^{-a-b}}{n!}\\sum_m\\binom{n}{m}a^mb^{n-m}', why: 'Multiply and divide by $n!$ to bring out the binomial coefficients.' },
        { tex: '\\frac{e^{-(a+b)}(a+b)^n}{n!} = P(n,a+b)', why: 'The binomial theorem sums the series to $(a+b)^n$.', view: hist(PTS_HIST.dark8, PTS_HIST.bright8), viewCaption: 'their sum' },
      ],
      formal: [
        { tex: '\\sum_m P(m,a)P(n-m,b) = \\frac{e^{-a-b}}{n!}\\sum_m\\binom{n}{m}a^mb^{n-m}', why: 'The convolution, written with binomial coefficients.', view: hist(PTS_HIST.dark8, PTS_HIST.bright8, PTS_HIST.signal), viewCaption: 'dark and signal' },
        { tex: '\\frac{e^{-(a+b)}(a+b)^n}{n!} = P(n,a+b)', why: 'The binomial theorem.', view: hist(PTS_HIST.dark8, PTS_HIST.bright8), viewCaption: 'their sum' },
      ],
    },
    claims: [gap('q25ConvGap', 'the convolution of the two Poisson series equals the single Poisson law (max-abs gap)'), cv('q25MeanBright', 'a bright atom reads as Poisson with mean 8.2', 8.2, 1e-9)],
  },
  {
    id: 'q25-readout:b3',
    phase: 'books',
    text:
      `Choose a cutoff $n_c$. Fewer counts than $n_c$ means dark, otherwise bright. A dark atom is misread if the background reaches $n_c$, and a bright one if its count falls short. With equal weights, $n_c = ${V.q25ncOpt}$ gives error ${d(V.q25ErrOpt, 4)}.`,
    formal:
      `$E(n_c) = |c_0|^2P(N_d \\ge n_c) + |c_1|^2P(N_b < n_c)$, which is Bergou's incomplete-gamma form $1 - \\Gamma(n_c, r_bt)/(n_c-1)!$ plus $\\Gamma(n_c, (r_b+r_s)t)/(n_c-1)!$ (identity gap $${d(V.q25GammaIdGap, 0)}$). ` +
      `For equal weights $E = ${d(V.q25ErrNc1, 4)}, ${d(V.q25ErrOpt, 4)}, ${d(V.q25ErrNc5, 4)}$ at $n_c = 1, 3, 5$, so the minimum is at $n_c = ${V.q25ncOpt}$. A dark atom is misread with chance ${d(V.q25ErrDark, 4)} and a bright one with ${d(V.q25ErrBright, 4)}. Bergou's Problem 1 uses other counts and is cited, not worked.`,
    caption: 'error against the cutoff: smallest at 3',
    captionFormal: 'error against the cutoff: smallest at 3',
    stage: ERR_STAGE,
    claims: [
      gap('q25GammaIdGap', 'the incomplete-gamma form of the book equals the Poisson sum (max-abs gap)'),
      claim('q25ncOpt', 'the best cutoff is 3', () => V.q25ncOpt === 3),
      cv('q25ErrOpt', 'its error is 0.0065', 0.0065, 5e-5),
      cv('q25ErrNc1', 'at cutoff 1 the error is 0.0908', 0.0908, 5e-5),
      cv('q25ErrNc5', 'at cutoff 5 it is 0.0444', 0.0444, 5e-5),
      cv('q25ErrDark', 'a dark atom is misread with chance 0.0011', 0.0011, 5e-5),
      cv('q25ErrBright', 'a bright one with 0.0118', 0.0118, 5e-5),
    ],
  },
  {
    id: 'q25-readout:b4',
    phase: 'books',
    text:
      `A hotter atom feels a slightly different light shift at each vibration level. That spreads the Ramsey frequency (<<qc-q24-ramsey|Unit 24.5>>) and washes out the fringes. The signal falls to $1/e$ at $T_2^* = ${d(V.q25T2starCoeff, 3)}\\,\\hbar/(\\bar\\eta k_BT)$. Here $\\bar\\eta$ is the fraction by which the light shift differs between the two qubit states.`,
    formal:
      `$\\theta_n = \\tfrac{\\bar\\eta}{2}\\,\\mathbf n\\cdot\\boldsymbol\\omega_0 - \\Delta$ (Eq. 13.9). For a thermal state each shift $\\tfrac{\\bar\\eta}{2}n_j\\omega_j$ is exponentially distributed with mean $\\bar\\eta k_BT/2\\hbar$, ` +
      `so the envelope is $1\\big/\\sqrt{(1 + t^2/T_0^2)^3}$ with $T_0 = 2\\hbar/\\bar\\eta k_BT$. It equals $e^{-1}$ at $t = T_0\\sqrt{e^{${d(V.q25TwoThirdsArg, 4)}} - 1}$, so $T_2^*/T_0 = ${d(V.q25T2starOverT0, 4)}$ and $T_2^* = ${d(V.q25T2starCoeff, 3)}\\,\\hbar/\\bar\\eta k_BT$ (Eq. 13.10). ` +
      `With the light-shift fraction $\\bar\\eta = ${d(V.q25EtaLS, 5)}$ (a model input, Fig. 13.5) and trap frequencies of 50, 50 and 10 kHz (Fig. 13.5): $T_2^* = ${d(V.q25T2star10uK, 2)}$ ms at $10\\,\\mu$K and $${d(V.q25T2star1uK, 1)}$ ms at $1\\,\\mu$K. ` +
      `The exact thermal sum gives $${d(V.q25T2starQ10uK, 2)}$ ms and $${d(V.q25T2starQ1uK, 3)}$ s, which is $${d(V.q25QuantRatio1uK, 1)}$ times more at $1\\,\\mu$K, where few levels are occupied.`,
    caption: 'T2* against temperature: semiclassical (filled) and exact thermal sum (second mark)',
    captionFormal: 'T2* against temperature: semiclassical (filled) and exact thermal sum (second mark)',
    stage: T2_STAGE,
    derivation: {
      result: '|\\langle e^{i\\theta t}\\rangle| = \\frac{1}{\\sqrt{(1 + t^2/T_0^2)^3}}',
      ground: [
        { tex: 'x_j = \\frac{\\bar\\eta}{2}n_j\\omega_j,\\qquad \\langle x_j\\rangle = \\frac{\\bar\\eta k_BT}{2\\hbar}', why: 'Each of the three shifts is exponentially distributed, with this mean.', view: T2_STAGE, viewCaption: 'the envelope, semiclassical' },
        { tex: '\\langle e^{ixt}\\rangle = (1 - i\\langle x\\rangle t)^{-1}', why: 'The average of $e^{ixt}$ over an exponential of mean $\\langle x\\rangle$ is this.' },
        { tex: '|(1 - it/T_0)^{-3}| = \\frac{1}{\\sqrt{(1 + t^2/T_0^2)^3}}', why: 'Three independent shifts multiply three such factors, of this size.', view: PT([{ name: 'exact thermal sum', pts: PTS_T2.map((p) => ({ x: p.x, y: p.quantum })) }], { xLabel: 'temperature (µK)', yLabel: 'T2* (ms)', xScale: 'log', yScale: 'log' }), viewCaption: 'the exact sum at the same temperatures' },
      ],
      formal: [
        { tex: '\\langle e^{ixt}\\rangle^3 = (1 - it/T_0)^{-3}', why: 'The characteristic function of a sum of three exponentials, a Gamma law.', view: T2_STAGE, viewCaption: 'the envelope, semiclassical' },
        { tex: '|(1 - it/T_0)^{-3}| = \\frac{1}{\\sqrt{(1 + t^2/T_0^2)^3}}', why: 'Its size; setting it to $e^{-1}$ gives $T_2^*$.', view: PT([{ name: 'exact thermal sum', pts: PTS_T2.map((p) => ({ x: p.x, y: p.quantum })) }], { xLabel: 'temperature (µK)', yLabel: 'T2* (ms)', xScale: 'log', yScale: 'log' }), viewCaption: 'the exact sum at the same temperatures' },
      ],
    },
    claims: [
      cv('q25T2starCoeff', 'T2* is 1.947 hbar over eta k T', 1.947),
      cv('q25T2starOverT0', 'T2* over T0 is 0.9735', 0.9735, 5e-5),
      cv('q25TwoThirdsArg', 'the exponent in the condition is two thirds', 0.666667, 1e-5),
      cv('q25EtaLS', 'the light-shift fraction is 0.00025', 0.00025, 1e-9),
      cv('q25T2star10uK', 'at 10 microkelvin T2* is 5.95 ms', 5.95, 0.005),
      cv('q25T2star1uK', 'at 1 microkelvin 59.5 ms', 59.5, 0.05),
      cv('q25T2starQ10uK', 'the exact sum gives 5.97 ms at 10 microkelvin', 5.97, 0.005),
      cv('q25T2starQ1uK', 'and 0.166 s at 1 microkelvin', 0.166),
      cv('q25QuantRatio1uK', 'which is 2.8 times more', 2.8, 0.05),
      cv('q25SemiAtT2star', 'the envelope at T2* is 0.3679, which is 1/e', Math.exp(-1), 5e-5),
    ],
  },
  {
    id: 'q25-readout:b5',
    phase: 'clue',
    text: `With the same rates, how much longer must the camera collect light to bring the error under 0.001?`,
    formal: `Scale both means, $(${d(V.q25MeanBright, 1)}, ${d(V.q25MeanDark, 1)}) \\to t\\,(${d(V.q25MeanBright, 1)}, ${d(V.q25MeanDark, 1)})$. Find the smallest $t$, with $n_c$ re-chosen, for which the best equal-weight error is below 0.001.`,
    caption: 'the model: two histograms, means 0.2 and 8.2, and a cutoff between them',
    captionFormal: 'the model: two histograms, means 0.2 and 8.2, and a cutoff between them',
    stage: hist(PTS_HIST.dark, PTS_HIST.bright),
    reveal: {
      text: `About ${d(V.q25ScaleFor1e3, 2)} times longer. Counting longer pulls the two histograms apart faster than it widens them.`,
      formal: `$t = ${d(V.q25ScaleFor1e3, 2)}$ in units of the first integration time, at which the best cutoff moves from ${V.q25ncOpt} to 4 and the error is just below 0.001 (our calculation).`,
      caption: 'the two histograms at 1.51 times the time',
      captionFormal: 'the two histograms at 1.51 times the time',
      stage: hist(PTS_HIST.darkSlow, PTS_HIST.brightSlow),
      claims: [cv('q25ScaleFor1e3', 'the scale for an error under 0.001 is 1.51', 1.51, 5e-3)],
    },
    claims: [cv('q25MeanBright', 'the bright mean is 8.2', 8.2, 1e-9), cv('q25MeanDark', 'the dark mean is 0.2', 0.2, 1e-9)],
  },
]

/* ---------------------------------------------------------------------------------------------- */
/* q25-atom-gates — Rotations, Raman light and Rydberg blockade                                      */
/* ---------------------------------------------------------------------------------------------- */

const CZ_MATRIX = mx({ gate: { name: 'CZ' } })
const ZZCZ_MATRIX = mx({ product: [{ kron: [{ gate: { name: 'Z' } }, { gate: { name: 'Z' } }] }, { gate: { name: 'CZ' } }] })
const W3: AmplitudesState = { kind: 'amplitudes', state: { terms: '100+010+001' }, mode: 'amplitude', shot: 'A-BARS' }

const atomGates: Beat[] = [
  {
    id: 'q25-atom-gates:b1',
    phase: 'books',
    text:
      `A microwave pulse turns every atom at once. To turn one atom, shift only its energy with a focused beam, which gives it a $z$ turn. Sandwich that between two global turns and the result is an $x$ turn for that atom.`,
    formal:
      `Resonant Rabi pulses give $R_x$ and $R_y$ (<<qc-q24-rabi|Unit 24.4>>, with the sign correction); $Z = iYX$. With a global turn $G_y(\\varphi) = R_y(\\varphi)$ on every atom and a local $R_z$: $R_x(\\theta) = G_y(\\tfrac{\\pi}{2})R_z(\\theta)G_y(-\\tfrac{\\pi}{2})$ and ` +
      `$R_y(\\theta) = G_x(-\\tfrac{\\pi}{2})R_z(\\theta)G_x(\\tfrac{\\pi}{2})$ (p. 233); both hold to machine precision (gap $${d(V.q25IdRxGap, 0)}$ at $\\theta = ${d(V.q25InTheta, 1)}$). Atoms that miss the local pulse see $G_yG_y^{-1} = I$.`,
    caption: 'the three-pulse sandwich as a circuit, in time order from left to right',
    captionFormal: 'the three-pulse sandwich as a circuit, in time order from left to right',
    stage: circ(C_SITE, 3),
    claims: [gap('q25IdRxGap', 'the sandwich with Ry gives Rx (max-abs gap)'), gap('q25IdRyGap', 'the sandwich with Rx gives Ry (max-abs gap)'), cv('q25InTheta', 'the test angle is 0.7', 0.7, 1e-9)],
  },
  {
    id: 'q25-atom-gates:b2',
    phase: 'books',
    text:
      `Two light beams detuned by $\\Delta$ from a third level drive the atom between its two qubit states at rate $\\frac{\\Omega_1\\Omega_2}{2\\Delta}$ (a [[qc-raman-transition|Raman transition]]). ` +
      `The price is some scattering: our calculation finds a loss of $(\\pi/2)\\gamma/|\\Delta|$ per $\\pi$ pulse.`,
    formal:
      `$\\Omega = \\frac{\\Omega_1^*\\Omega_2}{2\\Delta}$ for a detuning $\\Delta$ from the intermediate level (p. 233). For $|\\Omega_1| = |\\Omega_2|$ the $\\pi$ time is $2\\pi|\\Delta|/|\\Omega_1|^2$, the intermediate level holds on average $\\frac{|\\Omega_1|^2}{4\\Delta^2}$, ` +
      `and the loss is $P_{\\rm scat} = \\gamma\\bar\\rho_{22}t_\\pi = (\\pi/2)\\gamma/|\\Delta|$, which is $${d(V.q25RamanHalfPi50, 4)}$ at $\\Delta = 50\\gamma$. Bergou's $\\sim\\gamma/|\\Delta|$ omits the factor. ` +
      `With $\\Omega_1 = \\gamma$, a three-level simulation gives $${d(V.q25RamanLoss50, 4)}$ at $50\\gamma$ and $${d(V.q25RamanLoss200, 5)}$ at $200\\gamma$; its $\\pi$ time is $${d(V.q25RamanTpiRatio50, 4)}$ times $2\\pi|\\Delta|/|\\Omega_1|^2$.`,
    caption: 'loss per π pulse against Δ/γ: our simulation and the estimate',
    captionFormal: 'loss per π pulse against Δ/γ: our simulation and the estimate',
    stage: RAMAN_STAGE,
    claims: [
      cv('q25RamanHalfPi50', 'the estimate (pi/2) gamma over Delta is 0.0314 at Delta = 50 gamma', 0.0314, 5e-5),
      cv('q25RamanLoss50', 'the simulated loss is 0.0305 at 50 gamma', 0.0305, 5e-5),
      cv('q25RamanLoss200', 'and 0.00780 at 200 gamma', 0.0078, 5e-6),
      cv('q25RamanTpiRatio50', 'the simulated pi time is 1.0002 times the estimate', 1.0002, 5e-5),
    ],
  },
  {
    id: 'q25-atom-gates:b3',
    phase: 'books',
    text:
      `A Rydberg atom is huge, so its dipole grows as $n^2$. Two such atoms feel $U \\propto d^4/\\delta R^6$, and the level spacing $\\delta$ shrinks as $n^{-3}$. Together the interaction grows as about $n^{${V.q25VdwExp}}$ (Bergou allows $n^{${V.q25VdwExp}}$ to $n^{${V.q25VdwExp + 1}}$); taking $n^{${V.q25VdwExp}}$, doubling $n$ multiplies it by ${grp(V.q25RydScale2n)}.`,
    formal:
      `The dipole matrix element scales as $n^2$ and the resonant interaction as $U_{dd} \\propto n^4$. Off resonance, $U_{vdW} \\sim U_{dd}^2/\\delta \\propto n^8/n^{-3} = n^{${V.q25VdwExp}}$ (p. 234; Bergou allows $n^{${V.q25VdwExp}}$ to $n^{${V.q25VdwExp + 1}}$, and we take $n^{${V.q25VdwExp}}$), a [[qc-rydberg-blockade|Rydberg blockade]] when $U(R_B) = \\hbar\\Omega$; ` +
      `then $R_B \\propto n^{${d(V.q25RBexp, 4)}}$. Doubling $n$ gives $2^{${V.q25VdwExp}} = ${grp(V.q25RydScale2n)}$ in $U$ and $${d(V.q25RBscale2n, 3)}$ in $R_B$ (Fig. 13.6).`,
    caption: 'interaction strength against n (relative to n = 25), logarithmic',
    captionFormal: 'interaction strength against n (relative to n = 25), logarithmic',
    stage: SCALING_STAGE('u', 'interaction vs n = 25'),
    derivation: {
      result: 'U_{\\rm vdW} \\propto n^{11}',
      ground: [
        { tex: 'd \\propto n^2,\\qquad U_{dd} \\propto d^2 \\propto n^4', why: 'The dipole grows as $n^2$, so the interaction between two dipoles grows as $n^4$.', view: SCALING_STAGE('u', 'interaction vs n = 25'), viewCaption: 'interaction against n' },
        { tex: 'U_{\\rm vdW} \\sim \\frac{U_{dd}^2}{\\delta},\\qquad \\delta \\propto n^{-3}', why: 'Off resonance the interaction is the square of $U_{dd}$ divided by the level spacing, which shrinks as $n^{-3}$.' },
        { tex: 'n^{8}\\,n^{3} = n^{11}\\ \\Rightarrow\\ U_{\\rm vdW} \\propto n^{11}', why: 'Multiply: $n^8 n^3 = n^{11}$. The blockade radius, where $U = \\hbar\\Omega$, grows more slowly.', view: SCALING_STAGE('rb', 'radius vs n = 25'), viewCaption: 'blockade radius against n' },
      ],
      formal: [
        { tex: 'U_{dd} \\propto n^4,\\qquad \\delta \\propto n^{-3}', why: 'The resonant interaction and the level spacing.', view: SCALING_STAGE('u', 'interaction vs n = 25'), viewCaption: 'interaction against n' },
        { tex: 'U_{\\rm vdW} \\propto n^{11}', why: 'The result, and $U(R_B) = \\hbar\\Omega$ gives the blockade radius.', view: SCALING_STAGE('rb', 'radius vs n = 25'), viewCaption: 'blockade radius against n' },
      ],
    },
    claims: [
      claim('q25VdwExp', 'the van der Waals interaction grows as n to the eleventh', () => V.q25VdwExp === 11),
      claim('q25RydScale2n', 'doubling n multiplies the interaction by 2048', () => V.q25RydScale2n === 2048),
      cv('q25RBexp', 'the blockade radius grows as n to the power 11 over 6, 1.8333', 1.8333, 5e-5),
      cv('q25RBscale2n', 'doubling n multiplies the blockade radius by 3.564', 3.564),
    ],
  },
  {
    id: 'q25-atom-gates:b4',
    phase: 'books',
    text:
      `Pulse the control atom by $\\pi$, the target by $2\\pi$, then the control by $\\pi$ again. A single atom in the pulsed level gets $-1$. If both start up, the control's excitation blocks the target. ` +
      `The result is $\\mathrm{diag}(1,-1,-1,-1)$, a controlled-Z gate up to single-atom phases (<<qc-q4-cnot|Unit 4.4>>).`,
    formal:
      `$|00\\rangle \\to |00\\rangle$; $|01\\rangle$ and $|10\\rangle$ pick up $-1$ (a $2\\pi$ rotation, or two $\\pi$ rotations). For $|11\\rangle$ the first pulse puts the control in $|r\\rangle$, the target is blocked, and the last pulse returns it: $(-i)^2 = -1$. ` +
      `So $U = \\mathrm{diag}(1,-1,-1,-1) = (Z\\otimes Z)\\,\\mathrm{CZ}$ (gap $${d(V.q25RydIdealGap, 0)}$ against the nine-level simulation at $B \\to \\infty$). At $B = 100\\,\\Omega$ with no decay the gate error is $${d(V.q25RydErr100, 6)}$ (p. 235, Fig. 13.7).`,
    caption: 'the state after the gate on two equal-weight atoms: four equal bars, one sign differs',
    captionFormal: '$\\mathrm{diag}(1,-1,-1,-1)$ as $(Z\\otimes Z)\\,\\mathrm{CZ}$, and the state it makes from $|{+}{+}\\rangle$',
    stage: split(ZZCZ_MATRIX, amp(C_CZG, 2, 'signed')),
    derivation: {
      result: 'U = \\mathrm{diag}(1,-1,-1,-1) = (Z\\otimes Z)\\,\\mathrm{CZ}',
      ground: [
        { tex: '|00\\rangle \\to |00\\rangle', why: 'No pulse acts on an atom that is down, so the factor is $+1$.', view: CZ_MATRIX, viewCaption: 'the controlled-Z factor' },
        { tex: '|01\\rangle \\to -|01\\rangle,\\quad |10\\rangle \\to -|10\\rangle', why: 'One atom is turned by $2\\pi$ (or by $\\pi$ and then $\\pi$): the factor is $-1$.' },
        { tex: '|11\\rangle \\to (-i)(-i)|11\\rangle = -|11\\rangle', why: 'The control rises, the target is blocked, and the control returns: two factors $-i$.', view: amp(C_CZG, 2, 'signed'), viewCaption: 'after the gate on two equal-weight atoms' },
        { tex: 'U = \\mathrm{diag}(1,-1,-1,-1) = (Z\\otimes Z)\\,\\mathrm{CZ}', why: 'The four factors are $Z\\otimes Z$ times a controlled-Z.', view: ZZCZ_MATRIX, viewCaption: 'the product (Z⊗Z)CZ' },
      ],
      formal: [
        { tex: '|ab\\rangle \\to (-1)^{a+b}|ab\\rangle\\ \\text{except}\\ |11\\rangle \\to -|11\\rangle', why: 'The three cases: no pulse, one atom turned, both atoms (blocked).', view: CZ_MATRIX, viewCaption: 'the controlled-Z factor' },
        { tex: '(-i)^2 = -1', why: 'The blocked case: the control rises and returns.', view: amp(C_CZG, 2, 'signed'), viewCaption: 'after the gate on two equal-weight atoms' },
        { tex: 'U = \\mathrm{diag}(1,-1,-1,-1) = (Z\\otimes Z)\\,\\mathrm{CZ}', why: 'The product form.', view: ZZCZ_MATRIX, viewCaption: 'the product (Z⊗Z)CZ' },
      ],
    },
    claims: [
      gap('q25RydIdealGap', 'the blockade-limit gate equals diag(1, -1, -1, -1) (max-abs gap)'),
      gap('q25ZZCZgap', 'and equals (Z kron Z) CZ (max-abs gap)'),
      cv('q25RydErr100', 'at B = 100 Omega with no decay the gate error is 0.000037', 0.000037, 5e-7),
    ],
  },
  {
    id: 'q25-atom-gates:b5',
    phase: 'clue',
    text:
      `Decay of the Rydberg state argues for a fast pulse; a leaky blockade argues for a slow one. How does the best error fall when the blockade strength times the lifetime grows tenfold?`,
    formal:
      `Scan $\\Omega$ for $B\\tau = 10^4, 10^5, 10^6$ (blockade $B = 1$, decay $\\gamma = 1/\\tau$), minimising the error over a grid of 200 values of $\\Omega$; fit the exponents of the best $\\Omega$ and of the error against $B\\tau$.`,
    caption: 'the best gate error against B times τ, to be read off',
    captionFormal: 'the best gate error against $B\\tau$, to be read off',
    stage: RYD_STAGE,
    reveal: {
      text:
        `The best error falls to about ${d(V.q25TenfoldFactor, 3)} of its value, as $10^{-${d(V.q25TwoThirdsArg, 4)}}$. Doubling $B$ would multiply it by $2^{-${d(V.q25TwoThirdsArg, 4)}} = ${d(V.q25TwoThirds, 2)}$. The error curve has small wiggles from the blockade's leak, so the best value is read from the grid.`,
      formal:
        `Best errors $${d(V.q25RydErrOpt4, 5)}, ${d(V.q25RydErrOpt5, 5)}, ${d(V.q25RydErrOpt6, 6)}$ at best $\\Omega/B = ${d(V.q25RydOptOm4, 3)}, ${d(V.q25RydOptOm5, 4)}, ${d(V.q25RydOptOm6, 4)}$: exponents $-${d(V.q25RydSlopeErr, 3)}$ for the error and $-${d(V.q25RydSlopeOm, 3)}$ for the rate against $B\\tau$. ` +
        `This is the text's $\\Omega \\sim B^{${d(V.q25TwoThirdsArg, 4)}}\\tau^{-${d(V.q25OneThirdArg, 4)}}$ and $E \\sim (B\\tau)^{-${d(V.q25TwoThirdsArg, 4)}}$ (p. 235). Bergou's Problem 3 is cited, not worked.`,
      caption: 'best error against B times τ, logarithmic: a straight line of slope −2/3',
      captionFormal: 'best error against $B\\tau$, logarithmic: a straight line of slope $-0.667$',
      stage: RYD_STAGE,
      claims: [
        cv('q25TenfoldFactor', 'a tenfold B tau lowers the best error to 0.215 of its value', 0.215),
        cv('q25TwoThirdsArg', 'the exponent is two thirds', 0.6667, 5e-5),
        cv('q25OneThirdArg', 'and the rate exponent a third', 0.3333, 5e-5),
        cv('q25TwoThirds', 'doubling B multiplies the error by 0.63', 0.63, 5e-3),
        cv('q25RydErrOpt4', 'the best error at B tau = 10^4 is 0.00915', 0.00915, 5e-6),
        cv('q25RydErrOpt5', 'at 10^5 it is 0.00199', 0.00199, 5e-6),
        cv('q25RydErrOpt6', 'at 10^6 it is 0.000423', 0.000423, 5e-7),
        cv('q25RydOptOm4', 'at the best Omega over B of 0.100', 0.1, 5e-4),
        cv('q25RydOptOm5', 'of 0.0418', 0.0418, 5e-5),
        cv('q25RydOptOm6', 'and of 0.0200', 0.02, 5e-5),
        cv('q25RydSlopeErr', 'the error falls with the exponent 0.667 of B tau', 0.667, 5e-4),
        cv('q25RydSlopeOm', 'and the best rate with the exponent 0.350', 0.35, 5e-4),
      ],
    },
    claims: [],
  },
  {
    id: 'q25-atom-gates:b6',
    phase: 'deeper',
    text:
      `Put $N$ atoms inside one blockaded region. Only one can be excited. The ground state couples to one shared state, the [[qc-w-state|W state]], $\\sqrt N$ times faster: ${V.q25WCouple100.toFixed(0)} times for 100 atoms.`,
    formal:
      `Within one blockade, $|\\bar 0\\rangle = |0\\ldots0\\rangle$ couples to $|W\\rangle = \\frac{1}{\\sqrt N}\\sum_j|0\\ldots r_j\\ldots0\\rangle$ with $\\Omega_N = \\sqrt N\\,\\Omega$ (p. 236). The engine's single-excitation block has largest eigenvalue $\\Omega\\sqrt N/2$: ` +
      `${d(V.q25WCouple4, 0)} for $N = 4$ and ${d(V.q25WCouple100, 0)} for $N = 100$ in units of $\\Omega$. For three atoms each amplitude is $${d(V.q25W3Amp, 4)}$.`,
    caption: 'the W state of three atoms: three equal bars',
    captionFormal: 'the W state of three atoms: three equal bars',
    stage: W3,
    claims: [
      claim('q25WCouple4', 'four atoms couple 2 times faster', () => close(V.q25WCouple4, 2, 1e-9)),
      claim('q25WCouple100', 'a hundred atoms couple 10 times faster', () => close(V.q25WCouple100, 10, 1e-9)),
      cv('q25W3Amp', 'each amplitude of the W state of three atoms is 0.5774', 0.5774, 5e-5),
    ],
  },
]

/* ---------------------------------------------------------------------------------------------- */
/* q25-ion-trap — Holding an ion in the air                                                          */
/* ---------------------------------------------------------------------------------------------- */

const ionTrap: Beat[] = [
  {
    id: 'q25-ion-trap:b1',
    phase: 'books',
    text:
      `An ion can use the same kinds of qubit states as an atom: two hyperfine levels, or a ground level and a long-lived excited one. A still field cannot hold it: a charge in empty space has no stable resting point.`,
    formal:
      `Hyperfine-Zeeman or ground–metastable encodings serve (p. 236). Earnshaw's theorem: $\\nabla^2\\phi = 0$ in free space, so $U = q\\phi$ has no minimum. The quadrupole $U = \\frac{qV}{4z_c^2}(x^2 + y^2 - 2z^2)$ has curvatures $2$, $2$ and $-4$ ` +
      `in units of $qV/4z_c^2$; they sum to $${d(V.q25EarnshawSum, 0)}$, a saddle (p. 237).`,
    caption: 'the three curvatures of the quadrupole: 2, 2 and −4',
    captionFormal: 'the three curvatures of the quadrupole: 2, 2 and −4',
    stage: CURV_STAGE,
    claims: [gap('q25EarnshawSum', 'the three curvatures of the quadrupole sum to zero (finite differences)')],
  },
  {
    id: 'q25-ion-trap:b2',
    phase: 'books',
    text:
      `Flip the voltage fast and the saddle becomes a trap. The motion obeys Mathieu's equation with one number $\\tilde q = 2qV_0/mz_c^2\\omega_{\\rm rf}^2$ (a [[qc-paul-trap|Paul trap]]). Here $q$ is the ion's charge, $V_0$ the voltage amplitude, $m$ its mass, $z_c$ the distance to the electrode and $\\omega_{\\rm rf}$ the drive frequency. It is stable only for $\\tilde q$ below ${d(V.q25StabEdge, 3)}. ` +
      `A beryllium ion driven at 10 MHz has $\\tilde q = ${d(V.q25qz, 4)}$.`,
    formal:
      `With $\\tau = \\omega_{\\rm rf}t/2$ the axial motion obeys $z'' = 2\\tilde q_z\\cos(2\\tau)\\,z$; the primary stable region is $0 \\le \\tilde q_z \\le ${d(V.q25StabEdge, 3)}$ (p. 238). The Floquet monodromy gives the edge $${d(V.q25StabEdge, 3)}$. ` +
      `For Be$^+$ ($m = 15\\times10^{-27}$ kg, $V_0 = 100$ V, $\\omega_{\\rm rf}/2\\pi = 10$ MHz, $z_c = 1$ mm), $\\tilde q_z = ${d(V.q25qz, 4)}$ and the smallest stable $\\omega_{\\rm rf}/2\\pi$ is $${d(V.q25RfMin, 2)}$ MHz. Across the axis $\\tilde q = -\\tilde q_z/2$.`,
    caption: 'the Floquet number against q̃: it reaches 1 at the edge, 0.908',
    captionFormal: 'the Floquet number $\\beta$ against $\\tilde q$: it reaches 1 at the edge $0.908$, and the beryllium trap sits at $0.5411$',
    stage: PL('mathieuBeta', undefined, [V.q25qz, V.q25StabEdge], { xScale: 'linear' }),
    claims: [
      cv('q25StabEdge', 'the stability edge is 0.908', 0.908, 5e-4),
      cv('q25qz', 'the beryllium trap has q tilde 0.5411', 0.5411, 5e-5),
      cv('q25RfMin', 'the smallest stable rf frequency is 7.72 MHz', 7.72, 0.005),
    ],
  },
  {
    id: 'q25-ion-trap:b3',
    phase: 'books',
    text:
      `The ion jiggles quickly ([[qc-micromotion|micromotion]]) around a slow path (macromotion), as if held in a spring trap of frequency $\\omega_z = \\tilde q\\,\\omega_{\\rm rf}/\\sqrt{8}$. Here that is ${d(V.q25wz, 3)} MHz along $z$ and half as much across. ` +
      `At 10 µK the ion stays within ${d(V.q25Zloc, 1)} nm.`,
    formal:
      `Splitting $z = Z + \\zeta$ gives a fast part $\\zeta = -\\frac{\\tilde q_z}{2}\\cos(\\omega_{\\rm rf}t)\\,Z$ and an effective harmonic well with $\\omega_z = \\tilde q_z\\omega_{\\rm rf}/\\sqrt{8} = ${d(V.q25wz, 3)}$ MHz (so $\\omega_x = \\omega_y = ${d(V.q25wzx, 3)}$ MHz, p. 238). ` +
      `The well is $U_\\zeta/k_B = ${d(V.q25UzetaCoef, 2)}\\times10^{10}\\,Z^2$ kelvin, so half of $k_BT$ at 10 µK gives $Z = ${d(V.q25Zloc, 1)}$ nm and $\\zeta = ${d(V.q25zeta, 1)}$ nm; the depth at $z_c/10$ is ${d(V.q25Depth, 0)} K. ` +
      `Our calculation: the exact Floquet number at $\\tilde q = ${d(V.q25qz, 4)}$ is $${d(V.q25BetaExact, 3)}$ against $\\tilde q/\\sqrt2 = ${d(V.q25BetaApprox, 3)}$, a secular frequency of $${d(V.q25SecExact, 3)}$ MHz, which is ${(V.q25SecDiff * 100).toFixed(1)} % above the effective-potential value.`,
    caption: 'the Floquet number (solid) and the effective-potential line q̃/√2 (second curve)',
    captionFormal: 'the Floquet number (solid) and the effective-potential line $\\tilde q/\\sqrt2$ (second curve), with the beryllium trap marked',
    stage: PL('mathieuBeta', 'mathieuBetaApprox', [V.q25qz]),
    derivation: {
      result: '\\omega_z = \\tilde q\\,\\omega_{\\rm rf}/\\sqrt{8}',
      ground: [
        { tex: '\\zeta = -\\frac{\\tilde q}{2}\\cos(\\omega_{\\rm rf}t)\\,Z', why: 'The fast part of the motion follows the rf field with this amplitude, a fraction of the slow position $Z$.', view: PL('mathieuBeta', undefined, [V.q25qz]), viewCaption: 'the Floquet number' },
        { tex: '\\frac{m}{2}\\langle\\dot\\zeta^2\\rangle = \\frac{m\\tilde q^2\\omega_{\\rm rf}^2}{16}Z^2', why: 'Its energy, averaged over a cycle, acts as an extra potential for the slow motion.' },
        { tex: '\\omega_z^2 = \\frac{\\tilde q^2\\omega_{\\rm rf}^2}{8}\\ \\Rightarrow\\ \\omega_z = \\tilde q\\,\\omega_{\\rm rf}/\\sqrt{8}', why: 'Set it equal to $\\frac{m}{2}\\omega_z^2Z^2$ and solve for $\\omega_z$.', view: PL('mathieuBeta', 'mathieuBetaApprox', [V.q25qz]), viewCaption: 'the effective-potential line' },
      ],
      formal: [
        { tex: '\\zeta = -\\frac{\\tilde q}{2}\\cos(\\omega_{\\rm rf}t)\\,Z,\\quad \\frac{m}{2}\\langle\\dot\\zeta^2\\rangle = \\frac{m\\tilde q^2\\omega_{\\rm rf}^2}{16}Z^2', why: 'The micromotion and its cycle-averaged energy.', view: PL('mathieuBeta', undefined, [V.q25qz]), viewCaption: 'the Floquet number' },
        { tex: '\\omega_z = \\tilde q\\,\\omega_{\\rm rf}/\\sqrt{8}', why: 'The result, so $\\beta \\approx \\tilde q/\\sqrt2$.', view: PL('mathieuBeta', 'mathieuBetaApprox', [V.q25qz]), viewCaption: 'the effective-potential line' },
      ],
    },
    claims: [
      cv('q25wz', 'the axial secular frequency is 1.913 MHz', 1.913),
      cv('q25wzx', 'and the transverse one 0.957 MHz', 0.957),
      cv('q25Zloc', 'at 10 microkelvin the ion stays within 8.0 nm', 8.0, 0.05),
      cv('q25zeta', 'with a micromotion of 2.2 nm', 2.2, 0.05),
      cv('q25UzetaCoef', 'the well is 7.85 times 10^10 K per m^2', 7.85, 0.005),
      claim('q25Depth', 'the depth at one tenth of z_c is 785 K', () => close(V.q25Depth, 785, 0.5)),
      cv('q25BetaExact', 'the exact Floquet number is 0.409', 0.409),
      cv('q25BetaApprox', 'against q tilde over root 2 = 0.383', 0.383),
      cv('q25SecExact', 'the exact secular frequency is 2.045 MHz', 2.045),
      cv('q25SecDiff', 'which is 6.9 percent above the effective-potential value', 0.069, 5e-4),
    ],
  },
  {
    id: 'q25-ion-trap:b4',
    phase: 'books',
    text:
      `Two ions repel and the trap pulls them in. Balance the two and the gap is $Z_{\\rm eq} = \\sqrt[3]{\\frac{q^2}{2\\pi\\epsilon_0m\\omega_z^2}}$, about ${d(V.q25Zeq, 2)} µm: far enough apart to aim a laser at each.`,
    formal:
      `$U(Z) = \\frac{m\\omega_z^2Z^2}{4} + \\frac{q^2}{4\\pi\\epsilon_0Z}$ has $U' = 0$ at $Z_{\\rm eq}^3 = \\frac{q^2}{2\\pi\\epsilon_0m\\omega_z^2}$. For the Be$^+$ numbers $Z_{\\rm eq} = ${d(V.q25Zeq, 2)}\\,\\mu$m. ` +
      `In units of $m\\omega_z^2Z_{\\rm eq}^2$ the energy is $u(s) = \\frac{s^3+2}{4s}$, with its minimum $u = ${d(V.q25TwoIonMin, 2)}$ at $s = Z/Z_{\\rm eq} = 1$.`,
    caption: 'energy against ion separation: the minimum at 1',
    captionFormal: 'energy against ion separation: the minimum at $s = 1$',
    stage: PL('twoIonPotential', undefined, [1]),
    derivation: {
      result: 'Z_{\\rm eq}^3 = \\frac{q^2}{2\\pi\\epsilon_0m\\omega_z^2}',
      ground: [
        { tex: 'U(Z) = \\frac{m\\omega_z^2Z^2}{4} + \\frac{q^2}{4\\pi\\epsilon_0Z}', why: 'The energy of the pair: the trap plus the Coulomb repulsion.', view: PL('twoIonPotential'), viewCaption: 'two-ion energy' },
        { tex: '\\frac{m\\omega_z^2Z}{2} = \\frac{q^2}{4\\pi\\epsilon_0Z^2}', why: 'At the minimum the slope is zero: the two forces balance.' },
        { tex: 'Z_{\\rm eq}^3 = \\frac{q^2}{2\\pi\\epsilon_0m\\omega_z^2}', why: 'Solve for $Z^3$.', view: PL('twoIonPotential', undefined, [1]), viewCaption: 'its minimum' },
      ],
      formal: [
        { tex: 'U(Z) = \\frac{m\\omega_z^2Z^2}{4} + \\frac{q^2}{4\\pi\\epsilon_0Z},\\quad \\frac{dU}{dZ} = 0', why: 'The two-ion energy and its stationary point.', view: PL('twoIonPotential'), viewCaption: 'two-ion energy' },
        { tex: 'Z_{\\rm eq}^3 = \\frac{q^2}{2\\pi\\epsilon_0m\\omega_z^2}', why: 'The result.', view: PL('twoIonPotential', undefined, [1]), viewCaption: 'its minimum' },
      ],
    },
    claims: [cv('q25Zeq', 'the two ions sit 5.97 micrometres apart', 5.97, 0.005), cv('q25TwoIonMin', 'the minimum of the energy is 0.75', 0.75, 5e-3)],
  },
  {
    id: 'q25-ion-trap:b5',
    phase: 'clue',
    text: `Two ions can swing together (centre of mass) or in and out (stretch). Which is stiffer, and by what factor in frequency?`,
    formal:
      `From $U = m(\\dot Z_1^2 + \\omega_z^2Z_1^2) + \\frac{m}{4}\\bigl(\\dot Z_2^2 + 3\\omega_z^2(Z_2 - Z_{\\rm eq})^2\\bigr)$ read the two mode frequencies, and confirm them with a numerical Hessian of the two-ion energy.`,
    caption: 'the same energy curve: its curvature at the minimum sets the stretch mode',
    captionFormal: 'the same energy curve: its curvature at the minimum sets the stretch mode',
    stage: PL('twoIonPotential', undefined, [1]),
    reveal: {
      text: `The stretch mode is stiffer by $\\sqrt3 = ${d(V.q25ModeRatio, 3)}$: ${d(V.q25Stretch, 3)} MHz against ${d(V.q25wz, 3)} MHz. With many ions the mode frequencies crowd together.`,
      formal: `$\\omega_{\\rm COM} = \\omega_z$ and $\\omega_{\\rm str} = \\sqrt3\\,\\omega_z = ${d(V.q25Stretch, 3)}$ MHz; the finite-difference Hessian gives the ratio $${d(V.q25ModeRatio, 4)}$, as the printed expansion does. With $N$ ions the spectrum becomes dense (p. 239), which limits one trap.`,
      caption: 'the stretch mode has three times the curvature of the harmonic part alone',
      captionFormal: 'the stretch mode has three times the curvature of the harmonic part alone',
      stage: PL('twoIonPotential', undefined, [0.8, 1, 1.25]),
      claims: [cv('q25ModeRatio', 'the stretch mode is stiffer by 1.7321 in frequency', 1.7321, 5e-5), cv('q25Stretch', 'at 3.314 MHz', 3.314, 5e-4), cv('q25wz', 'against 1.913 MHz', 1.913)],
    },
    claims: [],
  },
]

/* ---------------------------------------------------------------------------------------------- */
/* q25-phonons — Spin and motion in one ion                                                          */
/* ---------------------------------------------------------------------------------------------- */

const phonons: Beat[] = [
  {
    id: 'q25-phonons:b1',
    phase: 'books',
    text:
      `An ion's state is its spin, $g$ or $e$, plus a count $n$ of vibration quanta, called [[qc-phonon|phonons]]. A drive at the qubit frequency flips the spin. A drive lower by the trap frequency flips it and removes a phonon: a red [[qc-sideband|sideband]]. A drive higher adds one.`,
    formal:
      `States $|g/e, n\\rangle$. A field at $\\omega_q$ drives the carrier from $|g,n\\rangle$ to $|e,n\\rangle$; at $\\omega_q - \\omega_z$ the red sideband from $|g,n\\rangle$ to $|e,n-1\\rangle$; at $\\omega_q + \\omega_z$ the blue sideband from $|g,n\\rangle$ to $|e,n+1\\rangle$ (p. 240, Fig. 13.9). ` +
      `In $|g,0\\rangle$ there is no red transition and in $|e,0\\rangle$ no blue one. The engine's red $\\pi$ pulse leaves $|g,0\\rangle$ unchanged: the chance that it moves is $${d(V.q25RedFromG0, 0)}$.`,
    caption: 'wire code: first wire the spin, last two wires the phonon count in binary',
    captionFormal: '$|g,1\\rangle = 001$: a red, a blue and a carrier $\\pi$ pulse as unitary boxes',
    stage: split(circ(C_SB, 3), amp(C_SB, 3, 'probability')),
    claims: [gap('q25RedFromG0', 'a red pi pulse does not move an ion in the ground state with no phonon (chance)'), gap('q25BlueFromE0', 'a blue pi pulse does not move an excited ion with no phonon (chance)')],
  },
  {
    id: 'q25-phonons:b2',
    phase: 'books',
    text:
      `Light also pushes on the ion's position. The strength is the [[qc-lamb-dicke|Lamb–Dicke number]] $\\eta = kz_0$: the ion's spread $z_0$ against the light's wavelength. For beryllium at 313 nm, $\\eta = ${d(V.q25eta0, 4)}$, and $\\eta^2 = ${d(V.q25eta2, 4)}$ is the recoil energy over the trap energy.`,
    formal:
      `$\\hat z = z_0(\\hat a + \\hat a^\\dagger)$ with $z_0 = \\sqrt{\\hbar/2m\\omega_z} = ${d(V.q25z0, 1)}$ nm, and the interaction carries $e^{ik\\hat z} = e^{i\\eta(\\hat a + \\hat a^\\dagger)} = \\exp(-\\tfrac{\\eta^2}{2})\\,e^{i\\eta\\hat a^\\dagger}e^{i\\eta\\hat a}$ (BCH, gap $${d(V.q25BCHgap, 0)}$), ` +
      `where [[qc-lamb-dicke|$\\eta_0$]]$ = kz_0 = \\sqrt{E_R/\\hbar\\omega_z}$ (p. 243). With 313 nm (our input), $\\eta_0 = ${d(V.q25eta0, 4)}$ and $E_R/\\hbar\\omega_z = \\eta_0^2 = ${d(V.q25eta2, 4)}$. ` +
      `A recoil kick from the ground state gives the oscillator amplitudes $\\exp(-\\tfrac{\\eta^2}{2})(i\\eta)^n/\\sqrt{n!}$.`,
    caption: 'the oscillator after a light kick, η = 0.343: the ground state keeps 0.943 of its amplitude',
    captionFormal: 'the oscillator after a light kick, $\\eta = 0.343$: the ground state keeps $0.943$ of its amplitude',
    stage: amp(C_KICK, 1, 'amplitude'),
    introduces: ['qc-lamb-dicke'],
    derivation: {
      result: 'e^{i\\eta(\\hat a + \\hat a^\\dagger)} = \\exp(-\\tfrac{\\eta^2}{2})\\,e^{i\\eta\\hat a^\\dagger}e^{i\\eta\\hat a}',
      ground: [
        { tex: '[\\hat a, \\hat a^\\dagger] = 1,\\qquad [i\\eta\\hat a^\\dagger, i\\eta\\hat a] = \\eta^2', why: 'The commutator of the two pieces is a plain number, $\\eta^2$.', view: amp(C_KICK_SMALL, 1, 'amplitude'), viewCaption: 'light kick, small η' },
        { tex: 'e^{A+B} = e^{A}e^{B}\\exp(-\\frac{[A,B]}{2})', why: 'When the commutator of $A$ and $B$ is a number, the exponential of a sum splits like this.' },
        { tex: 'e^{i\\eta(\\hat a + \\hat a^\\dagger)} = \\exp(-\\tfrac{\\eta^2}{2})\\,e^{i\\eta\\hat a^\\dagger}e^{i\\eta\\hat a}', why: 'On the ground state $e^{i\\eta\\hat a}|0\\rangle = |0\\rangle$, which leaves amplitudes $\\exp(-\\tfrac{\\eta^2}{2})(i\\eta)^n/\\sqrt{n!}$.', view: amp(C_KICK, 1, 'amplitude'), viewCaption: 'light kick, η = 0.34' },
      ],
      formal: [
        { tex: '[A,B] = [i\\eta\\hat a^\\dagger, i\\eta\\hat a] = \\eta^2', why: 'The Baker–Campbell–Hausdorff series ends because the commutator is central.', view: amp(C_KICK_SMALL, 1, 'amplitude'), viewCaption: 'light kick, small η' },
        { tex: 'e^{i\\eta(\\hat a + \\hat a^\\dagger)} = \\exp(-\\tfrac{\\eta^2}{2})\\,e^{i\\eta\\hat a^\\dagger}e^{i\\eta\\hat a}', why: 'The result, normal ordered.', view: amp(C_KICK, 1, 'amplitude'), viewCaption: 'light kick, η = 0.34' },
      ],
    },
    claims: [
      cv('q25z0', 'the zero-point spread is 17.1 nm', 17.1, 0.05),
      cv('q25eta0', 'the Lamb-Dicke number for 313 nm is 0.3433', 0.3433, 5e-5),
      cv('q25eta2', 'and its square is 0.1178', 0.1178, 5e-5),
      gap('q25BCHgap', 'the BCH identity holds on the oscillator (max-abs gap)'),
      cv('q25KickKeep', 'the ground state keeps 0.943 of its amplitude', 0.943),
    ],
  },
  {
    id: 'q25-phonons:b3',
    phase: 'books',
    text:
      `The carrier keeps strength $\\Omega$, nearly untouched. The first sidebands run at $\\eta\\Omega\\sqrt n$, slower by the factor $\\eta$. For small $\\eta$ this is accurate; with more phonons the first-order rule overestimates.`,
    formal:
      `$\\hat H_{\\rm int,\\pm1} = \\tfrac{\\hbar\\eta\\Omega}{2}(\\ldots)$ with Rabi rate $\\eta\\Omega\\sqrt{n+1}$ (blue) or $\\eta\\Omega\\sqrt n$ (red), against $\\Omega$ for the carrier (p. 243). Exactly, on an 80-level oscillator at $\\eta = 0.1$, ` +
      `the blue sideband from $n = 0, 5, 10$ has $|\\langle n+1|e^{i\\eta(\\hat a + \\hat a^\\dagger)}|n\\rangle| = ${d(V.q25BlueExact0, 4)}, ${d(V.q25BlueExact5, 4)}, ${d(V.q25BlueExact10, 4)}$ against the first-order $0.1, ${d(V.q25BlueFirst5, 4)}, ${d(V.q25BlueFirst10, 4)}$; ` +
      `the carrier from $n = 0$ is $\\exp(-\\tfrac{\\eta^2}{2}) = ${d(V.q25Carrier0, 4)}$.`,
    caption: 'exact and first-order sideband strengths against n',
    captionFormal: 'exact and first-order sideband strengths against $n$ at $\\eta = 0.1$',
    stage: SB_STAGE,
    claims: [
      cv('q25BlueExact0', 'the exact blue sideband from n = 0 is 0.0995', 0.0995, 5e-5),
      cv('q25BlueExact5', 'from n = 5 it is 0.2377', 0.2377, 5e-5),
      cv('q25BlueExact10', 'from n = 10 it is 0.3138', 0.3138, 5e-5),
      cv('q25BlueFirst5', 'the first-order value at n = 5 is 0.2449', 0.2449, 5e-5),
      cv('q25BlueFirst10', 'at n = 10 it is 0.3317', 0.3317, 5e-5),
      cv('q25Carrier0', 'the carrier from n = 0 is 0.9950', 0.995, 5e-5),
    ],
  },
  {
    id: 'q25-phonons:b4',
    phase: 'books',
    text:
      `A red $\\pi$ pulse, then let the ion decay: one phonon fewer. Repeat $n$ times and the ion is in $|g,0\\rangle$, which has no red sideband ([[qc-sideband-cooling|sideband cooling]]). Because $\\eta$ is small, the decay adds no motion.`,
    formal:
      `From $|g,n\\rangle$ the red $\\pi$ pulse at level $k$ lasts $\\pi/(\\eta\\Omega\\sqrt k)$, and spontaneous decay returns $|g,k-1\\rangle$ when $\\eta_0 \\ll 1$ (the recoil is too small to change the motion). ` +
      `Cooling from $n = 10$ takes $\\pi\\sum_{k=1}^{10}1/\\sqrt k = ${d(V.q25CoolT10, 2)}$ in units of $1/\\eta\\Omega$, against $${d(V.q25CoolNaive10, 2)}$ if every pulse lasted as long as the first.`,
    caption: 'total cooling time against the starting phonon number',
    captionFormal: 'total cooling time against the starting phonon number',
    stage: COOL_STAGE,
    claims: [cv('q25CoolT10', 'cooling from ten phonons takes 15.77 in units of 1 over eta Omega', 15.77, 0.005), cv('q25CoolNaive10', 'against 31.42 if every pulse took as long as the first', 31.42, 0.005)],
  },
  {
    id: 'q25-phonons:b5',
    phase: 'clue',
    text: `Can a microwave pulse on the clock transition add a phonon the way a laser does?`,
    formal: `Find $\\eta$ for the clock transition at $${d(V.q25ClockGHz, 2)}$ GHz, with $\\lambda = c/\\nu$ and the same $\\omega_z$.`,
    caption: 'sideband over carrier for light and for a microwave: to be read off',
    captionFormal: 'sideband over carrier for light and for a microwave: to be read off',
    stage: ETA_STAGE,
    reveal: {
      text: `No. The wavelength is ${d(V.q25MicroLambda, 1)} cm, so $\\eta = ${d(V.q25etaMicro, 3)}\\times10^{-6}$. The sideband is about ${grp(V.q25MicroSlow)} times slower than the carrier. Microwaves leave the motion alone.`,
      formal: `$\\eta_\\mu = 2\\pi z_0/\\lambda_\\mu = ${d(V.q25etaMicro, 3)}\\times10^{-6}$, so the sideband Rabi frequency is smaller than the carrier's by a factor of about ${grp(V.q25MicroSlow)} (the photon momentum is far below the ion's, p. 241).`,
      caption: 'sideband over carrier: the microwave value is millionths of the light value',
      captionFormal: 'sideband over carrier: the microwave value is millionths of the light value',
      stage: ETA_STAGE,
      claims: [
        cv('q25etaMicro', 'the microwave Lamb-Dicke number is 3.295 millionths', 3.295, 5e-4),
        claim('q25MicroSlow', 'the microwave sideband is about 303 519 times slower than the carrier', () => close(V.q25MicroSlow, 303518.84, 0.01)),
        cv('q25MicroLambda', 'the microwave wavelength is 3.3 cm', 3.3, 0.05),
      ],
    },
    claims: [cv('q25ClockGHz', 'the clock transition is at 9.19 GHz', 9.19, 5e-3)],
  },
]

/* ---------------------------------------------------------------------------------------------- */
/* q25-ion-gates — Entangling ions through their motion                                              */
/* ---------------------------------------------------------------------------------------------- */

const ionGates: Beat[] = [
  {
    id: 'q25-ion-gates:b1',
    phase: 'books',
    text:
      `Cool to $n = 0$. Half-pulse ion 1 on the blue sideband: the ion and the phonon share one excitation. Flip ion 2 on the carrier. Pulse ion 2 on the blue sideband to return the phonon. ` +
      `The ions end in $(|ge\\rangle + |eg\\rangle)/\\sqrt2$ with no phonon, an entangled pair (<<qc-q6-entangled|Unit 6.3>>): the [[qc-cirac-zoller-gate|Cirac–Zoller gate]] uses one shared vibration as its messenger.`,
    formal:
      `$|gg;0\\rangle \\to (|gg;0\\rangle - i|eg;1\\rangle)/\\sqrt2 \\to (|ge;0\\rangle + |ee;1\\rangle)/\\sqrt2 \\to (|ge\\rangle + e^{i\\alpha}|eg\\rangle)|0\\rangle/\\sqrt2$, up to phases: the last pulse leaves $|ge;0\\rangle$ alone (there is no $n = -1$) ` +
      `and returns $|ee;1\\rangle$ to $|eg;0\\rangle$ (p. 244). The three-wire circuit gives the Bell chance $${d(V.q25CZbell0, 3)}$ and phonon-vacuum weight $${d(V.q25CZphonon0, 3)}$.`,
    caption: 'the circuit step by step: after the first pulse the phonon is shared; after the third it is gone',
    captionFormal: 'the circuit step by step: after the first pulse the phonon is shared; after the third it is gone',
    stage: split(circ(C_CZ, 3), amp(C_CZ, 3, 'probability')),
    derivation: {
      result: '|gg;0\\rangle \\to (|ge\\rangle + e^{i\\alpha}|eg\\rangle)|0\\rangle/\\sqrt2',
      ground: [
        { tex: '|gg;0\\rangle \\to (|gg;0\\rangle - i|eg;1\\rangle)/\\sqrt2', why: 'A blue half pulse on ion 1 entangles that ion with the phonon.', view: amp(C_CZ, 1, 'probability'), viewCaption: 'after one pulse' },
        { tex: '\\to (|ge;0\\rangle + |ee;1\\rangle)/\\sqrt2', why: 'A carrier $\\pi$ pulse flips ion 2, with a phase.', view: amp(C_CZ, 2, 'probability'), viewCaption: 'after two pulses' },
        { tex: '|gg;0\\rangle \\to (|ge\\rangle + e^{i\\alpha}|eg\\rangle)|0\\rangle/\\sqrt2', why: 'A blue $\\pi$ pulse on ion 2 returns the phonon from $|ee;1\\rangle$ and leaves $|ge;0\\rangle$ alone.', view: amp(C_CZ, 3, 'probability'), viewCaption: 'after three pulses' },
      ],
      formal: [
        { tex: '|gg;0\\rangle \\to (|gg;0\\rangle - i|eg;1\\rangle)/\\sqrt2 \\to (|ge;0\\rangle + |ee;1\\rangle)/\\sqrt2', why: 'The first two pulses.', view: amp(C_CZ, 2, 'probability'), viewCaption: 'after two pulses' },
        { tex: '|gg;0\\rangle \\to (|ge\\rangle + e^{i\\alpha}|eg\\rangle)|0\\rangle/\\sqrt2', why: 'The third pulse returns the phonon: the ions are entangled and the motion is back in its ground state.', view: amp(C_CZ, 3, 'probability'), viewCaption: 'after three pulses' },
      ],
    },
    claims: [cv('q25CZbell0', 'from n = 0 the Bell chance is 1.000', 1, 5e-4), cv('q25CZphonon0', 'and the phonon vacuum has weight 1.000', 1, 5e-4)],
  },
  {
    id: 'q25-ion-gates:b2',
    phase: 'books',
    text:
      `Shine two colours, $\\omega_c \\pm \\delta$, on both ions. Four routes lead from $|gg\\rangle$ to $|ee\\rangle$. Their strengths go as $n$ and $n+1$ with opposite signs, so the total is $(n+1) - n = 1$: the same for every $n$. This is the [[qc-molmer-sorensen-gate|Mølmer–Sørensen gate]].`,
    formal:
      `$\\tilde\\Omega = 2\\sum_j\\langle ee;n|H_{\\rm int}|j\\rangle\\langle j|H_{\\rm int}|gg;n\\rangle/(U_{gg;n} - U_j + \\hbar\\omega_\\pm)$ over $|j\\rangle = |eg;n\\pm1\\rangle, |ge;n\\pm1\\rangle$ gives $\\tilde\\Omega = -(\\eta\\Omega)^2/(\\omega_z - \\delta)$ (p. 245): ` +
      `$\\sqrt n\\sqrt n = n$ for the red route and $\\sqrt{n+1}\\sqrt{n+1} = n+1$ for the blue, with opposite detunings. For $\\eta\\Omega = ${d(V.q25MSetaOmega, 1)}$ and $\\omega_z - \\delta = 1$, $|\\tilde\\Omega| = ${d(V.q25MSOmTilde, 2)}$; ` +
      `the force-model simulation gives the Bell chance $${d(V.q25MSBell0, 3)}$ for $n = 0, 1, 2, 4$ (Fig. 13.10).`,
    caption: 'Bell chance against n: Mølmer–Sørensen flat at 1, Cirac–Zoller falling',
    captionFormal: 'Bell chance against $n$: Mølmer–Sørensen flat at 1 (first mark), Cirac–Zoller falling (second)',
    stage: CZMS_STAGE(),
    derivation: {
      result: '\\tilde\\Omega = -(\\eta\\Omega)^2/(\\omega_z - \\delta)',
      ground: [
        { tex: '|gg;n\\rangle \\to |eg;n-1\\rangle \\to |ee;n\\rangle:\\quad \\sqrt n\\cdot\\sqrt n = n', why: 'The red route goes through the state with one phonon fewer.', view: CZMS_STAGE(false), viewCaption: 'Bell chance against n, Mølmer–Sørensen' },
        { tex: '|gg;n\\rangle \\to |eg;n+1\\rangle \\to |ee;n\\rangle:\\quad \\sqrt{n+1}\\cdot\\sqrt{n+1} = n+1', why: 'The blue route goes through the state with one phonon more, with the opposite detuning.' },
        { tex: '\\tilde\\Omega = -(\\eta\\Omega)^2/(\\omega_z - \\delta)', why: 'The sum is proportional to $(n+1) - n = 1$: no $n$ is left.', view: CZMS_STAGE(), viewCaption: 'Bell chance against n, with Cirac–Zoller' },
      ],
      formal: [
        { tex: '\\tilde\\Omega \\propto (n+1) - n = 1', why: 'The second-order sum over the four intermediate states.', view: CZMS_STAGE(false), viewCaption: 'Bell chance against n, Mølmer–Sørensen' },
        { tex: '\\tilde\\Omega = -(\\eta\\Omega)^2/(\\omega_z - \\delta)', why: 'The result.', view: CZMS_STAGE(), viewCaption: 'Bell chance against n, with Cirac–Zoller' },
      ],
    },
    claims: [
      cv('q25MSetaOmega', 'the input eta Omega is 0.1', 0.1, 1e-9),
      cv('q25MSOmTilde', 'the effective rate is 0.01', 0.01, 1e-9),
      cv('q25MSBell0', 'the Bell chance is 1.000 for n = 0', 1, 5e-4),
      cv('q25MSBell1', 'and for n = 1', 1, 5e-4),
      cv('q25MSBell2', 'and for n = 2', 1, 5e-4),
      cv('q25MSBell4', 'and for n = 4', 1, 5e-4),
    ],
  },
  {
    id: 'q25-ion-gates:b3',
    phase: 'books',
    text:
      `The phonon picture adds a catch. The state leaves the motion only after whole loops of period $2\\pi/(\\omega_z - \\delta)$. With $\\eta\\Omega = ${d(V.q25MSetaOmega, 1)}$ the gate takes exactly ${V.q25MSloopsK} loops. Stop mid-loop and the ions stay tangled with the motion.`,
    formal:
      `$\\tilde\\Omega t = \\pi/2$ and $t = 2\\pi K/(\\omega_z - \\delta)$ require $K = \\frac{(\\omega_z-\\delta)^2}{4(\\eta\\Omega)^2}$: $K = ${V.q25MSloopsK}$ for $\\eta\\Omega = ${d(V.q25MSetaOmega, 1)}$ ($t = ${d(V.q25MSGateTime, 2)}$); the engine's infidelity there is $0$. ` +
      `For $\\eta\\Omega = ${d(V.q25MSetaOmega2, 2)}$, $K = ${d(V.q25MSloops1736, 2)}$ is not a whole number: the infidelity is $${d(V.q25MSInfid1736, 4)}$; at the nearest whole $K = 17$, with the angle slightly off, it is $${d(V.q25MSInfidK17, 5)}$. ` +
      `The book gives only $\\tilde\\Omega t = \\pi/2$ (p. 246).`,
    caption: 'infidelity against loops completed: near zero at whole loops with the right angle',
    captionFormal: 'infidelity against loops completed ($\\eta\\Omega = 0.12$): a dip at whole numbers, deepest near $K = 17$',
    stage: LOOPS_STAGE,
    claims: [
      claim('q25MSloopsK', 'the gate takes exactly 25 loops', () => close(V.q25MSloopsK, 25, 1e-9)),
      cv('q25MSGateTime', 'the gate time is 157.08', 157.08, 5e-3),
      cv('q25MSetaOmega2', 'the second input eta Omega is 0.12', 0.12, 1e-9),
      cv('q25MSloops1736', 'it takes 17.36 loops', 17.36, 5e-3),
      cv('q25MSInfid1736', 'stopping there leaves infidelity 0.0229', 0.0229, 5e-5),
      cv('q25MSInfidK17', 'stopping at 17 whole loops leaves 0.00027', 0.00027, 5e-6),
    ],
  },
  {
    id: 'q25-ion-gates:b4',
    phase: 'books',
    text:
      `The same pulse entangles four ions into $(|gggg\\rangle + |eeee\\rangle)/\\sqrt2$ in the same time as two. With this one pulse three ions cannot reach a GHZ state: the best chance is ${d(V.q25GHZfid3, 1)} (our calculation), which the untouched state already has. Larger ion machines must link several traps.`,
    formal:
      `With $S_y = \\sum_j\\sigma_y^{(j)}$, $H_{\\rm eff}\\propto S_y^2$ and $\\exp(-i\\theta S_y^2)|g\\ldots g\\rangle$ reaches $(|g\\ldots g\\rangle + e^{i\\alpha}|e\\ldots e\\rangle)/\\sqrt2$ at $\\theta = \\pi/8 = ${d(V.q25GHZtheta, 4)}$ for $N = 2$ and $N = 4$ ` +
      `(fidelity $${d(V.q25GHZfid2, 3)}$, the same time). For $N = 3$ the best fidelity is $${d(V.q25GHZfid3, 1)}$, since only even excitation numbers are reachable: our calculation for the recipe printed for $N$ qubits (p. 246). ` +
      `Larger machines use shuttling or photonic links with entanglement swapping (Chapter Q26); Bergou (pp. 236, 246) reports that ions hold the records for gate fidelity and coherence time (as of the book, 2021); no number is quoted here.`,
    caption: 'four ions after the Mølmer–Sørensen pulse: two equal bars, |gggg⟩ and |eeee⟩',
    captionFormal: 'four ions after the Mølmer–Sørensen pulse: two equal bars, $|gggg\\rangle$ and $|eeee\\rangle$',
    stage: amp(C_MS4, 1, 'probability'),
    claims: [
      cv('q25GHZfid2', 'two ions reach the GHZ pair with fidelity 1.000', 1, 5e-4),
      cv('q25GHZfid3', 'three ions reach only 0.5', 0.5, 1e-9),
      cv('q25GHZfid4', 'four ions reach 1.000', 1, 5e-4),
      cv('q25GHZtheta', 'at theta = 0.3927, which is pi over 8', 0.3927, 5e-5),
    ],
  },
  {
    id: 'q25-ion-gates:b5',
    phase: 'clue',
    text: `What if the ion starts with one phonon already, $n = 1$? Does the same three-pulse recipe still give a Bell pair?`,
    formal: `Run the same three pulses from $|gg;1\\rangle$ and $|gg;2\\rangle$ (oscillator truncated at 8 levels) and report the best Bell chance over the phase between the two terms.`,
    caption: 'the same recipe from a hotter ion: to be read off',
    captionFormal: 'the same recipe from a hotter ion: to be read off',
    stage: CZ_STAGE,
    reveal: {
      text: `Not at all. From $n = 1$ the Bell chance is ${d(V.q25CZbell1, 3)} and from $n = 2$ only ${d(V.q25CZbell2, 3)}. The pulse lengths are tuned for $n = 0$ and the pulses scramble the rest.`,
      formal: `$${d(V.q25CZbell1, 4)}$ ($n = 1$) and $${d(V.q25CZbell2, 4)}$ ($n = 2$), against $${d(V.q25CZbell0, 3)}$ ($n = 0$): the sideband rate $\\propto\\sqrt{n+1}$ spoils the $\\pi$ pulses (p. 244: the protocol needs the ion in its motional ground state).`,
      caption: 'Bell chance for n = 0, 1 and 2',
      captionFormal: 'Bell chance for $n = 0, 1, 2$',
      stage: CZ_STAGE,
      claims: [cv('q25CZbell1', 'from n = 1 the Bell chance is 0.2542', 0.2542, 5e-5), cv('q25CZbell2', 'from n = 2 it is 0.1384', 0.1384, 5e-5), cv('q25CZbell0', 'from n = 0 it is 1.000', 1, 5e-4)],
    },
    claims: [],
  },
]

export const Q25_STORY: Record<string, Beat[]> = {
  'q25-cooling': cooling,
  'q25-readout': readout,
  'q25-atom-gates': atomGates,
  'q25-ion-trap': ionTrap,
  'q25-phonons': phonons,
  'q25-ion-gates': ionGates,
}

/** Every claim used anywhere in a unit's beats, for Unit.claims (content.test.tsx "claims hold"). */
function allClaims(beats: Beat[]) {
  return beats.flatMap((b) => [...(b.claims ?? []), ...(b.reveal?.claims ?? []), ...(b.derivation?.ground.flatMap((s) => s.claims ?? []) ?? []), ...(b.derivation?.formal?.flatMap((s) => s.claims ?? []) ?? [])])
}
export const Q25_UNIT_CLAIMS_BY_ID: Record<string, ReturnType<typeof allClaims>> = Object.fromEntries(Object.entries(Q25_STORY).map(([id, beats]) => [id, allClaims(beats)]))
