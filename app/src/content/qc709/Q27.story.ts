/**
 * Chapter Q27 scroll story (Physics 709; roles P + W). Beats per docs/roles/proposals/P-Q27-story.md §1, in both tracks, under the judge's rulings
 * (docs/roles/decisions/qc709-Q20-Q27.md: Z2 no hardware digits, Z3 Corrections proposed as "our calculation finds ..." for the review to confirm, Z5 no new SVG kind).
 *
 * Build notes against the plan:
 * - Phase `'books'` throughout (no 709 notes cover Bergou Chapter 15): ramp beats are `books`, the clues are `clue`, the Go-deeper beats are `deeper` and last in their unit.
 * - Every number is the ENGINE's (Q27.values.ts, physics/qc/solid.ts). A number shown with a minus sign is stored as its size and the sign is asserted in the claim (SIGN in the values).
 * - Experimental hardware results (coherence times, fidelities, device frequencies, qubit counts) appear in WORDS only (Z2); every digit comes from a stated model with stated inputs ("model, ours").
 * - E_C is the book's (4 x the common e^2/2C_Sigma): one Rosetta line in q27-transmon:b1. The book's |0> is the upper level for a spin and the lower one for the transmon (C13: stated, not changed).
 * - The number reader takes digits around a point for a decimal and "0/2" or "2/2" for a fraction: equations are cited as "Eq. 15.9" (never "(15.9)"), the table as "the table on p. 272",
 *   and a fraction inside TeX is written \frac{...}{...} with letters, never X^2/2.
 * - A stage `split` never repeats a kind, so each pair below is picture + bars, circuit + amplitudes, or circuit + two-qubit.
 * - Unit mentions inside Foundations and Spin Lab are bridge chips <<id|Unit 11.6>>; this chapter's own units and the other 709 chapters are named in words ("Unit 27.4", "Chapter Q24").
 */
import type { Circuit } from '../../physics/qc/circuit'
import type { AmplitudesState, Beat, CircuitStageState, ClocksState, MatrixGridState, MatrixSource, PlotPoint, PlotPointsState, PlotState, StageLayout, StageState, TwoQubitState, WavefunctionState } from '../schema'
import { C_CZD, C_EX, C_ISW, C_X, PTS, SIGN, V, claim, close, d, uf } from './Q27.values'

/* ---------------------------------------------------------------------------------------------- */
/* Stage shorthand (plan "Stage shorthand"), as plain builder functions                              */
/* ---------------------------------------------------------------------------------------------- */
const circ = (C: Circuit, upTo: number): CircuitStageState => ({ kind: 'circuit', circuit: C, upTo, shot: 'Q-WIRES' })
const amp = (C: Circuit, upTo: number, mode: AmplitudesState['mode']): AmplitudesState => ({ kind: 'amplitudes', state: { circuit: C, upTo }, mode, shot: 'A-BARS' })
const tq = (C: Circuit, upTo: number): TwoQubitState => ({ kind: 'two-qubit', source: { ket: { circuit: C, upTo } }, labels: 'A-B', arrows: 'reduced', grid: 'T', readouts: ['concurrence'], shot: 'TQ-PAIR' })
const mx = (source: MatrixSource): MatrixGridState => ({ kind: 'matrix', source, labels: 'kets', values: 'exact', shot: 'M-GRID' })
const ck = (upper: number, lower: number, timeDeg: number): ClocksState => ({ kind: 'clocks', levels: { upper, lower }, start: '+x', timeDeg, shot: 'K-STD' })
const wf = (L: number, n: [number, number]): WavefunctionState => ({ kind: 'wavefunction', source: { box: { L, n } }, readouts: ['energy'], shot: 'W-STD' })
const pp = (points: PlotPoint[], o: Omit<PlotPointsState, 'kind' | 'points' | 'shot'> = {}): PlotPointsState => ({ kind: 'plot', points, shot: 'P-CURVE', ...o })
const curve = (fn: NonNullable<PlotState['curve']>['fn'], o: Omit<PlotState, 'kind' | 'curve' | 'shot'> & { curve?: Partial<NonNullable<PlotState['curve']>> } = {}): PlotState => ({
  kind: 'plot',
  shot: 'P-CURVE',
  ...o,
  curve: { fn, ...(o.curve ?? {}) },
})
const split = (top: StageState, bottom: StageState): StageLayout => ({ layout: 'split', top, bottom })
void uf

/* ---------------------------------------------------------------------------------------------- */
/* q27-lc — A circuit that rings                                                                     */
/* ---------------------------------------------------------------------------------------------- */

const lc: Beat[] = [
  {
    id: 'q27-lc:b1',
    phase: 'books',
    text:
      `A capacitor stores energy $\\frac{CV^2}{2}$ and an inductor stores $\\frac{LI^2}{2}$. Here $C$ is the capacitance, $L$ the inductance, $V$ the voltage and $I$ the current. ` +
      `Join the two and the energy swings back and forth, like a mass on a spring. The current obeys $\\ddot I = -I/(LC)$, so it is a cosine.`,
    formal:
      `With $V = L\\,dI/dt$ and $-dV/dt = I/C$ one gets $\\ddot I = -I/LC$, so $I = I_0\\cos\\omega t$ with $\\omega = 1/\\sqrt{LC}$ (p. 271). ` +
      `The stored energy $H = \\frac{Q^2}{2C} + \\frac{\\Phi^2}{2L}$ is quadratic in the flux $\\Phi = LI$ and the charge $Q$, as $\\frac{p^2}{2m} + \\frac{\\kappa x^2}{2}$ is in $(x, p)$.`,
    caption: 'the current swings as a cosine: one period',
    captionFormal: '$I(t)/I_0 = \\cos\\omega t$ over one period',
    stage: pp(PTS.lcCurrent, { xLabel: 'ωt / 2π', yLabel: 'I / I₀' }),
  },
  {
    id: 'q27-lc:b2',
    phase: 'books',
    text:
      `Take $C = ${d(V.q27LcC, 1)}$ pF and $L = 3$ nH, the size of a small chip circuit. Then $\\omega = 1/\\sqrt{LC} = ${d(V.q27LcOmega, 2)}\\times10^{10}$ rad/s, which is $f = ${d(V.q27LcFreqGHz, 3)}$ GHz. ` +
      `Light of that frequency is ${d(V.q27LcLambdaCm, 2)} cm long, at least ${d(V.q27LcLambdaOverChip, 1)} times the size of the circuit. So $L$ and $C$ act as [[qc-lumped-element|single lumps]].`,
    formal:
      `Model (ours, the book's illustration): $\\omega = 1/\\sqrt{LC} = ${d(V.q27LcOmega, 3)}\\times10^{10}\\,{\\rm s}^{-1}$ and $f = ${d(V.q27LcFreqGHz, 3)}$ GHz. ` +
      `The wavelength $\\lambda = c/f = ${d(V.q27LcLambdaCm, 2)}$ cm is at least $${d(V.q27LcLambdaOverChip, 1)}$ times the millimetre-scale elements, a [[qc-lumped-element|lumped-element]] circuit. ` +
      `Its characteristic impedance is $Z = \\sqrt{L/C} = ${d(V.q27LcZ, 0)}\\,\\Omega$.`,
    caption: 'frequency against capacitance for L = 3 nH: the model sits at the third point',
    captionFormal: '$f(C)$ for $L = 3$ nH; the model circuit has $C = 0.3$ pF',
    stage: pp(PTS.lcFreq, { xLabel: 'C (pF)', yLabel: 'f (GHz)' }),
    claims: [
      claim('q27LcC', 'the model capacitance is 0.3 pF', () => close(V.q27LcC, 0.3, 1e-12)),
      claim('q27LcOmega', 'the model circuit has omega = 3.33e10 rad/s', () => close(V.q27LcOmega, 3.3333, 5e-5)),
      claim('q27LcFreqGHz', 'the model circuit rings at 5.305 GHz', () => close(V.q27LcFreqGHz, 5.305, 5e-4)),
      claim('q27LcLambdaCm', 'the wavelength at that frequency is 5.65 cm', () => close(V.q27LcLambdaCm, 5.65, 5e-3)),
      claim('q27LcLambdaOverChip', 'the wavelength is 56.5 times a millimetre', () => close(V.q27LcLambdaOverChip, 56.5, 5e-2)),
      claim('q27LcZ', 'the characteristic impedance is 100 ohm', () => close(V.q27LcZ, 100, 1e-9)),
    ],
  },
  {
    id: 'q27-lc:b3',
    phase: 'books',
    introduces: ['qc-flux-charge'],
    text:
      `Flux $\\Phi$ plays the part of position and charge $Q$ plays the part of momentum, as the table on p. 272 lists. They do not commute: $[\\hat\\Phi, \\hat Q] = i\\hbar$. ` +
      `Write them with the ladder operators $a$ and $a^\\dagger$, as for a mass on a spring. These are the [[qc-flux-charge|flux and charge operators]] of the circuit.`,
    formal:
      `[[qc-flux-charge|The operators]] are $\\hat\\Phi = \\sqrt{\\hbar Z/2}\\,(a + a^\\dagger)$ and $\\hat Q = i\\sqrt{\\hbar/2Z}\\,(a^\\dagger - a)$ with $Z = \\sqrt{L/C}$. ` +
      `Then $\\hat H = \\frac{\\hat Q^2}{2C} + \\frac{\\hat\\Phi^2}{2L} = \\hbar\\omega\\,(a^\\dagger a + \\tfrac12)$ and $[\\hat\\Phi, \\hat Q] = i\\hbar$. ` +
      `On a truncated oscillator the engine finds both to within $${d(V.q27CommGap, 0)}$, away from the last level.`,
    caption: 'the rungs of the LC oscillator: n + ½ in units of ħω',
    captionFormal: '$E_n/\\hbar\\omega = n + \\tfrac12$',
    stage: pp(PTS.lcRungs, { xLabel: 'n', yLabel: 'E / ħω' }),
    claims: [
      claim('q27ZeroPoint', 'the lowest rung of the oscillator sits at one half of hbar omega', () => close(V.q27ZeroPoint, 0.5, 1e-12)),
      claim('q27CommGap', 'the truncated oscillator keeps [Phi, Q] = i hbar and H = hbar omega (n + 1/2) below its last level (max-abs gap)', () => close(V.q27CommGap, 0, 1e-12)),
    ],
  },
  {
    id: 'q27-lc:b4',
    phase: 'books',
    text:
      `The rungs are $\\hbar\\omega(n + \\tfrac12)$: every step has the same height. A pulse tuned to $0 \\to 1$ also drives $1 \\to 2$, and more strongly. ` +
      `The coupling grows as $\\sqrt{n+1}$, so $1 \\to 2$ is ${d(V.q27LeakRatio, 3)} times stronger. The two lowest rungs cannot serve as a [[qubit|qubit]].`,
    formal:
      `Every step is $E_{n+1} - E_n = \\hbar\\omega$. The charge matrix element grows as $|\\langle n+1|\\hat Q|n\\rangle| \\propto \\sqrt{n+1}$, so $|Q_{12}|/|Q_{01}| = \\sqrt2 = ${d(V.q27LeakRatio, 3)}$ (engine, from the matrix of $\\hat Q$). ` +
      `The lowest two levels cannot be addressed alone: no [[qubit|qubit]] (p. 272).`,
    caption: 'equal steps between the rungs, and a pulse that fits 1 → 2 better than 0 → 1',
    captionFormal: 'step energy and relative pulse strength $|Q_{n+1,n}|/|Q_{10}|$ for each step $n \\to n+1$',
    stage: pp(PTS.lcLeak, { xLabel: 'step n → n+1', yLabel: 'relative size' }),
    claims: [
      claim('q27LeakRatio', 'the 1 to 2 pulse is sqrt 2 = 1.414 times stronger than the 0 to 1 pulse', () => close(V.q27LeakRatio, 1.414, 5e-4)),
      claim('q27ZeroPoint', 'the lowest rung of the oscillator sits at one half of hbar omega', () => close(V.q27ZeroPoint, 0.5, 1e-12)),
    ],
  },
  {
    id: 'q27-lc:b5',
    phase: 'books',
    text:
      `One rung is $hf/k_{\\rm B} = ${d(V.q27HfOverK, 3)}$ K of heat. At room temperature the circuit holds about ${d(V.q27Nbar300, 0)} photons on average, and the chance of its ground state is ${d(V.q27P0300, 4)}. ` +
      `At 1 K that chance is ${d(V.q27P01K, 4)}. At 20 mK it is ${d(V.q27P020mK, 6)}.`,
    formal:
      `A thermal oscillator has $\\bar n = 1/(e^{hf/k_{\\rm B}T} - 1)$ and $P(n=0) = 1 - e^{-hf/k_{\\rm B}T}$. At 300 K, $\\bar n = ${d(V.q27Nbar300, 0)}$ and $P = ${d(V.q27P0300, 4)}$. At 1 K, $P = ${d(V.q27P01K, 4)}$. ` +
      `At 20 mK, $\\bar n = ${d(V.q27Nbar20mK, 2)}\\times10^{-6}$ and $P = ${d(V.q27P020mK, 6)}$ (model temperatures, ours). The book's condition is $T \\ll hf/k_{\\rm B} = ${d(V.q27HfOverK, 3)}$ K.`,
    caption: 'chance of the ground state against temperature, log axis',
    captionFormal: '$P(n=0)$ against $T$ for the model circuit, log axis',
    stage: pp(PTS.lcThermal, { xLabel: 'T (K)', yLabel: 'P (ground)', xScale: 'log' }),
    claims: [
      claim('q27HfOverK', 'one rung of the model circuit is 0.2546 K', () => close(V.q27HfOverK, 0.2546, 5e-5)),
      claim('q27Nbar300', 'at 300 K the circuit holds about 1177.8 photons', () => close(V.q27Nbar300, 1177.78, 5e-3)),
      claim('q27P0300', 'at 300 K the ground-state chance is 0.0008', () => close(V.q27P0300, 0.0008, 5e-5)),
      claim('q27P01K', 'at 1 K the ground-state chance is 0.2248', () => close(V.q27P01K, 0.2248, 5e-5)),
      claim('q27P020mK', 'at 20 mK the ground-state chance is 0.999997', () => close(V.q27P020mK, 0.999997, 5e-7)),
      claim('q27Nbar20mK', 'at 20 mK the mean photon number is 2.96e-6', () => close(V.q27Nbar20mK, 2.96, 5e-3)),
    ],
  },
  {
    id: 'q27-lc:b6',
    phase: 'clue',
    text: `At what temperature is the circuit in its ground state with chance ${d(V.q27Target99, 2)}? Read it off the plot, then compute it.`,
    formal: `Solve $1 - e^{-hf/k_{\\rm B}T} = ${d(V.q27Target99, 2)}$ for $T$ at $f = ${d(V.q27LcFreqGHz, 3)}$ GHz.`,
    caption: 'the chance rises from the left; where does it reach the line?',
    captionFormal: '$P(n=0)$ against $T$, to be compared with the target chance',
    stage: pp(PTS.lcThermal, { xLabel: 'T (K)', yLabel: 'P (ground)', xScale: 'log' }),
    reveal: {
      text: `$T = ${d(V.q27T99mK, 1)}$ mK, about a fifth of one rung's temperature. Dilution refrigerators reach below this.`,
      formal: `$T = (hf/k_{\\rm B})/\\ln 100 = ${d(V.q27T99mK, 1)}$ mK.`,
      caption: `the line at ${d(V.q27Target99, 2)} crosses the curve at ${d(V.q27T99mK, 0)} mK`,
      captionFormal: `$P(n=0) = ${d(V.q27Target99, 2)}$ at $T = ${d(V.q27T99mK, 1)}$ mK`,
      stage: pp(PTS.lcThermal, { xLabel: 'T (K)', yLabel: 'P (ground)', xScale: 'log', yLines: [{ y: V.q27Target99, label: 'target' }] }),
      claims: [
        claim('q27Target99', 'the target ground-state chance is 0.99', () => close(V.q27Target99, 0.99, 1e-12)),
        claim('q27T99mK', 'the chance 0.99 is reached at 55.3 mK', () => close(V.q27T99mK, 55.3, 5e-2)),
      ],
    },
  },
]

/* ---------------------------------------------------------------------------------------------- */
/* q27-superconductivity — Pairs, a flux quantum, no resistance                                      */
/* ---------------------------------------------------------------------------------------------- */

const superconductivity: Beat[] = [
  {
    id: 'q27-superconductivity:b1',
    phase: 'books',
    text:
      `In a cold metal an electron pulls on the ions a little. The shifted ions pull on a second electron: a weak attraction. ` +
      `Any such attraction, however weak, binds two electrons into a [[qc-cooper-pair|Cooper pair]] of charge $2e$. Pairs behave like bosons and can share one state.`,
    formal:
      `Toy calculation: $(E - 2\\epsilon_k)a_k = \\sum_{k'}V_{kk'}a_{k'}$ with $V_{kk'} = -V$ in a shell of width $E_c$ above the Fermi level gives $1 = \\frac{N_FV}{2}\\ln\\frac{2E_c + b}{b}$ for the binding $b = 2E_F - E$. ` +
      `So $b = 2E_c/(e^{2/N_FV} - 1) \\simeq 2E_ce^{-2/N_FV}$. At $N_FV = ${d(V.q27CooperNV, 1)}$ and $E_c = 1$ this is $${d(V.q27CooperB, 3)}\\times10^{-3}$ against $${d(V.q27CooperApprox, 3)}\\times10^{-3}$, a ratio of ${d(V.q27CooperRatio, 4)}. ` +
      `The engine's quadrature of the gap equation agrees with the closed form to $${d(V.q27CooperQuadGap, 0)}$ (below $10^{-9}$). A bound state exists for every $V > 0$.`,
    caption: 'binding energy against the attraction: a bound state for every strength, tiny when weak',
    captionFormal: '$b/E_c$ from the gap equation and from $2e^{-2/N_FV}$, log axis',
    stage: pp(PTS.cooper, { xLabel: 'N_F V', yLabel: 'b / E_c', yScale: 'log' }),
    claims: [
      claim('q27CooperNV', 'the toy model uses N_F V = 0.3', () => close(V.q27CooperNV, 0.3, 1e-12)),
      claim('q27CooperB', 'the binding energy is 2.549e-3 E_c', () => close(V.q27CooperB, 2.549, 5e-4)),
      claim('q27CooperApprox', 'the exponential form gives 2.545e-3 E_c', () => close(V.q27CooperApprox, 2.545, 5e-4)),
      claim('q27CooperRatio', 'the two forms differ by the ratio 1.0013', () => close(V.q27CooperRatio, 1.0013, 5e-5)),
      claim('q27CooperQuadGap', 'quadrature and closed form agree (absolute gap in E_c)', () => V.q27CooperQuadGap < 1e-9),
    ],
  },
  {
    id: 'q27-superconductivity:b2',
    phase: 'books',
    text:
      `Pairs move so as to cancel any magnetic field inside the metal. The field dies away as $e^{-x/\\lambda}$ over a length $\\lambda$ of a few tens of nanometres. ` +
      `This is the [[qc-meissner-effect|Meissner effect]]. For the book's charge density $n = 10^{28}\\,{\\rm m}^{-3}$ and the electron mass $m$, $\\lambda = ${d(V.q27LondonNm, 1)}$ nm.`,
    formal:
      `Eq. 15.5, $\\mathbf J = \\frac{2en}{m}\\left(\\hbar\\nabla\\theta - \\frac{2e}{c}\\mathbf A\\right)$, with Maxwell's equations gives $\\nabla^2\\mathbf B = \\mathbf B/\\lambda^2$ (London). ` +
      `With the charge density $n = 10^{28}\\,{\\rm m}^{-3}$ (model, the book's) and the electron mass $m$, $\\lambda^2 = m/\\mu_0n(2e)^2$ gives $\\lambda = ${d(V.q27LondonNm, 2)}$ nm (the page: about 25 nm). The field falls to $1/e$ at $x = \\lambda$.`,
    caption: 'the field inside against depth in units of λ',
    captionFormal: '$B(x)/B_0 = e^{-x/\\lambda}$ for $x/\\lambda = 0 \\ldots 4$',
    stage: pp(PTS.london, { xLabel: 'x / λ', yLabel: 'B / B₀' }),
    claims: [claim('q27LondonNm', 'the London length for the book\'s pair density is 26.57 nm', () => close(V.q27LondonNm, 26.57, 5e-3))],
  },
  {
    id: 'q27-superconductivity:b3',
    phase: 'books',
    text:
      `The pair wave function must come back to itself after one trip around a ring. So its phase turns by a whole number $p$ of full turns. ` +
      `With no current this makes the flux through the ring a whole number of [[qc-flux-quantum|flux quanta]] $\\Phi_0 = h/2e$. The charge $2e$, not $e$, sets the size: $\\Phi_0 = ${d(V.q27Phi0, 3)}\\times10^{-15}$ Wb.`,
    formal:
      `With no current $\\nabla\\theta = 2e\\mathbf A/\\hbar$ (SI). Single-valuedness gives $\\oint\\nabla\\theta\\cdot d\\mathbf l = 2\\pi p$, and Stokes' theorem turns the left side into $2e\\Phi/\\hbar$. ` +
      `So $\\Phi = p\\Phi_0$ with $\\Phi_0 = h/2e$ ($hc/2e$ in cgs), which is $${d(V.q27Phi0, 4)}\\times10^{-15}$ Wb (engine, from $h$ and $e$).`,
    caption: 'allowed fluxes in the ring: 0, one, two … flux quanta',
    captionFormal: '$\\Phi = p\\Phi_0$ for $p = 0 \\ldots 4$, in $10^{-15}$ Wb',
    stage: pp(PTS.flux, { xLabel: 'p', yLabel: 'Φ (10⁻¹⁵ Wb)' }),
    claims: [claim('q27Phi0', 'the flux quantum h/2e is 2.0678e-15 Wb', () => close(V.q27Phi0, 2.0678, 5e-5))],
    derivation: {
      result: '\\Phi = p\\,\\frac{h}{2e}',
      ground: [
        {
          tex: '\\nabla\\theta = \\frac{2e}{\\hbar}\\,\\mathbf A',
          why: 'With no current the pair phase changes along the ring in proportion to the vector potential.',
          view: pp(PTS.flux, { xLabel: 'p', yLabel: 'Φ (10⁻¹⁵ Wb)' }),
          viewCaption: 'the allowed fluxes',
        },
        {
          tex: '\\oint\\nabla\\theta\\cdot d\\mathbf l = 2\\pi p',
          why: 'After one loop the wave function must return to itself, so the phase has turned a whole number of times.',
        },
        {
          tex: '\\frac{2e}{\\hbar}\\,\\Phi = 2\\pi p',
          why: 'The sum of the vector potential around the loop is the flux through it.',
          view: pp(PTS.fluxExample, { xLabel: 'Φ / Φ₀', yLabel: 'Φ (10⁻¹⁵ Wb)' }),
          viewCaption: 'an applied flux between them',
        },
        {
          tex: '\\Phi = p\\,\\frac{h}{2e}',
          why: 'Solve for the flux, using $h = 2\\pi\\hbar$.',
        },
      ],
      formal: [
        {
          tex: '2\\pi p = \\oint\\nabla\\theta\\cdot d\\mathbf l = \\frac{2e}{\\hbar}\\oint\\mathbf A\\cdot d\\mathbf l = \\frac{2e}{\\hbar}\\,\\Phi',
          why: 'Zero current, Stokes\' theorem and single-valuedness of the phase.',
          view: pp(PTS.flux, { xLabel: 'p', yLabel: 'Φ (10⁻¹⁵ Wb)' }),
          viewCaption: 'the allowed fluxes',
        },
        {
          tex: '\\Phi = p\\,\\frac{h}{2e}',
          why: 'Solve for $\\Phi$ with $h = 2\\pi\\hbar$.',
          view: pp(PTS.fluxExample, { xLabel: 'Φ / Φ₀', yLabel: 'Φ (10⁻¹⁵ Wb)' }),
          viewCaption: 'an applied flux between them',
        },
      ],
    },
  },
  {
    id: 'q27-superconductivity:b4',
    phase: 'clue',
    text: 'A loop of $1\\,\\mu{\\rm m}^2$ sits in a field of 1 mT. How many flux quanta would that field alone push through it?',
    formal: 'Compute $BA/\\Phi_0$ for $B = 1$ mT and $A = 1\\,\\mu{\\rm m}^2$.',
    caption: 'the allowed fluxes of the ring',
    captionFormal: '$\\Phi = p\\Phi_0$',
    stage: pp(PTS.flux, { xLabel: 'p', yLabel: 'Φ (10⁻¹⁵ Wb)' }),
    reveal: {
      text: `${d(V.q27FluxLoop, 3)}: not a whole number. The ring answers with a current that makes the total flux a whole number, here 0.`,
      formal: `$BA/\\Phi_0 = ${d(V.q27FluxLoop, 4)}$. The screening current makes $\\Phi_{\\rm total} = p\\Phi_0$; the lowest-energy $p$ is the one nearest the applied flux.`,
      caption: `the applied flux, ${d(V.q27FluxLoop, 2)} of a quantum, sits between the allowed values`,
      captionFormal: '$BA/\\Phi_0$ lies between $p = 0$ and $p = 1$',
      stage: pp(PTS.fluxExample, { xLabel: 'Φ / Φ₀', yLabel: 'Φ (10⁻¹⁵ Wb)' }),
      claims: [claim('q27FluxLoop', 'a 1 mT field through 1 um^2 is 0.4836 flux quanta', () => close(V.q27FluxLoop, 0.4836, 5e-5))],
    },
  },
]

/* ---------------------------------------------------------------------------------------------- */
/* q27-josephson — A junction is a phase-dependent inductor                                          */
/* ---------------------------------------------------------------------------------------------- */

const josephson: Beat[] = [
  {
    id: 'q27-josephson:b1',
    phase: 'books',
    text:
      `Two superconductors with a thin insulator between them form a [[qc-josephson-junction|Josephson junction]]. Pairs tunnel across with strength $K$. Each side has a pair density and a phase. ` +
      `The tunnelling equations give a current $I = I_0\\sin\\theta$, where $I_0$, the critical current, is the largest current the junction carries. ` +
      `The [[relative-phase|relative phase]] $\\theta$ of the two sides grows as $\\dot\\theta = 2eV/\\hbar$.`,
    formal:
      `The equations $i\\hbar\\dot\\psi_1 = U_1\\psi_1 + K\\psi_2$ and $i\\hbar\\dot\\psi_2 = U_2\\psi_2 + K\\psi_1$ are a two-level system (<<qc-l11-two-level|Unit 11.6>>). ` +
      `With $\\psi_j = \\sqrt{n_j}\\,e^{i\\theta_j}$ and the [[relative-phase|relative phase]] $\\theta = \\theta_2 - \\theta_1$ they give $\\dot n_1 = (2K/\\hbar)\\sqrt{n_1n_2}\\sin(\\theta_2 - \\theta_1)$ and, for $n_1 = n_2$, $\\dot\\theta = qV/\\hbar$ with $q = 2e$ (p. 278). ` +
      `The current is $I = I_0\\sin\\theta$, where $I_0$, the critical current, is the largest current the junction carries. ` +
      `The engine's step of the two-level equations reproduces the first to $10^{-5}$. The AC Josephson frequency is $2eV/h = ${d(V.q27JosephsonMHzPerUV, 1)}$ MHz per microvolt.`,
    caption: 'current against the phase difference: a sine',
    captionFormal: '$I/I_0 = \\sin\\theta$ for $\\theta = -\\pi \\ldots \\pi$',
    stage: pp(PTS.sinTheta, { xLabel: 'θ / π', yLabel: 'I / I₀' }),
    claims: [claim('q27JosephsonMHzPerUV', 'the AC Josephson frequency is 483.6 MHz per microvolt', () => close(V.q27JosephsonMHzPerUV, 483.6, 5e-2))],
    derivation: {
      result: 'I = I_0\\sin\\theta',
      ground: [
        {
          tex: '\\psi_j = \\sqrt{n_j}\\,e^{i\\theta_j}',
          why: 'Write each side as a density times a phase factor.',
          view: pp(PTS.sinTheta, { xLabel: 'θ / π', yLabel: 'I / I₀' }),
          viewCaption: 'current against phase',
        },
        {
          tex: '\\dot n_1 = \\frac{2K}{\\hbar}\\sqrt{n_1n_2}\\,\\sin(\\theta_2 - \\theta_1)',
          why: 'Put this into the tunnelling equations: the imaginary part is the rate at which pairs cross.',
        },
        {
          tex: '\\dot\\theta_2 - \\dot\\theta_1 = \\frac{qV}{\\hbar}',
          why: 'The real part, for equal densities, is the rate at which the phase difference grows.',
          view: pp(PTS.phaseTime, { xLabel: 't × f_J', yLabel: 'θ / 2π' }),
          viewCaption: 'the phase grows in a straight line at fixed voltage',
        },
        {
          tex: 'I = I_0\\sin\\theta',
          why: 'Pairs crossing per second, times their charge, is the current.',
        },
      ],
      formal: [
        {
          tex: '\\psi_j = \\sqrt{n_j}\\,e^{i\\theta_j} \\;\\Rightarrow\\; \\dot n_1 = \\frac{2K}{\\hbar}\\sqrt{n_1n_2}\\,\\sin(\\theta_2 - \\theta_1)',
          why: 'Substitute into the two equations and take the imaginary part.',
          view: pp(PTS.sinTheta, { xLabel: 'θ / π', yLabel: 'I / I₀' }),
          viewCaption: 'current against phase',
        },
        {
          tex: '\\dot\\theta = \\frac{qV}{\\hbar},\\quad q = 2e',
          why: 'The real part, for $n_1 = n_2$.',
          view: pp(PTS.phaseTime, { xLabel: 't × f_J', yLabel: 'θ / 2π' }),
          viewCaption: 'the phase at fixed voltage',
        },
        {
          tex: 'I = I_0\\sin\\theta',
          why: 'The current is the charge times the rate of crossing.',
        },
      ],
    },
  },
  {
    id: 'q27-josephson:b2',
    phase: 'books',
    text:
      `From $V = \\frac{\\Phi_0}{2\\pi}\\dot\\theta$ and $\\dot I = I_0\\cos\\theta\\,\\dot\\theta$ the junction acts like an inductor of inductance $L_J = \\frac{\\Phi_0}{2\\pi I_0\\cos\\theta}$. It depends on the phase and becomes infinite at $90^\\circ$. ` +
      `That makes it a [[qc-josephson-inductance|Josephson inductance]], and a swinging phase is a swinging frequency.`,
    formal:
      `The inductance of the junction is $L_J(\\theta) = \\frac{\\Phi_0}{2\\pi I_0\\cos\\theta}$, with $L_{J0} = \\frac{\\Phi_0}{2\\pi I_0}$. Replace the 3 nH of Unit 27.1 by a junction with $I_0 = ${d(V.q27I0nA, 1)}$ nA, so that $L_{J0} = 3$ nH. ` +
      `At $\\theta = 60^\\circ$, $L_J = ${d(V.q27Lj60nH, 0)}$ nH and $f$ falls from ${d(V.q27F0GHz, 3)} to ${d(V.q27F60GHz, 3)} GHz, a factor $1/\\sqrt2$ (model, ours).`,
    caption: 'frequency against the phase: highest at 0°, falling as the phase grows',
    captionFormal: '$f(\\theta)/f(0) = \\sqrt{\\cos\\theta}$ for $\\theta = 0^\\circ \\ldots 80^\\circ$',
    stage: pp(PTS.lfreq, { xLabel: 'θ (degrees)', yLabel: 'f / f₀' }),
    claims: [
      claim('q27I0nA', 'a junction with L_J0 = 3 nH has I_0 = 109.7 nA', () => close(V.q27I0nA, 109.7, 5e-2)),
      claim('q27Lj60nH', 'at 60 degrees the inductance is 6 nH', () => close(V.q27Lj60nH, 6, 1e-9)),
      claim('q27F0GHz', 'at zero phase the circuit rings at 5.305 GHz', () => close(V.q27F0GHz, 5.305, 5e-4)),
      claim('q27F60GHz', 'at 60 degrees the circuit rings at 3.751 GHz', () => close(V.q27F60GHz, 3.751, 5e-4)),
    ],
  },
  {
    id: 'q27-josephson:b3',
    phase: 'books',
    text:
      `The energy in the junction is $-E_J\\cos\\theta$ with $E_J = \\frac{\\Phi_0 I_0}{2\\pi}$: a cosine well, not a parabola. Near the bottom it looks like a parabola. ` +
      `Higher up the walls open out, so the rungs get closer together.`,
    formal:
      `$U(\\theta) = E_J(1 - \\cos\\theta)$ with $E_J = \\frac{\\Phi_0I_0}{2\\pi}$, which is $E_J/h = ${d(V.q27EJoverH, 2)}$ GHz for the model $I_0$. ` +
      `The expansion $-E_J\\cos\\theta = -E_J + \\frac{E_J\\theta^2}{2} - \\frac{E_J\\theta^4}{24} + \\cdots$ has a quartic term that lowers the upper levels: the origin of the negative anharmonicity of Unit 27.4.`,
    caption: 'the cosine well against its parabola',
    captionFormal: '$1 - \\cos\\theta$ against $\\frac{\\theta^2}{2}$ for $\\theta = -\\pi \\ldots \\pi$',
    stage: pp(PTS.well, { xLabel: 'θ / π', yLabel: 'U / E_J' }),
    claims: [claim('q27EJoverH', 'the model junction has E_J/h = 54.49 GHz', () => close(V.q27EJoverH, 54.49, 5e-3))],
  },
  {
    id: 'q27-josephson:b4',
    phase: 'books',
    text:
      `Two junctions in a ring make a [[qc-squid|SQUID]]. Its effective $E_J$ is $2E_J|\\cos(\\pi\\Phi/\\Phi_0)|$, set by the flux $\\Phi$ through the ring. At half a flux quantum it vanishes and the qubit stops evolving. ` +
      `The tuning factor is ${d(V.q27Squid025, 4)} at a quarter of a flux quantum and ${d(V.q27Squid13, 1)} at a third.`,
    formal:
      `Eq. 15.7, $J = 2J_0\\sin\\theta(0)\\cos(\\pi\\Phi/\\Phi_0)$: the pair of junctions carries the critical current $2I_0|\\cos(\\pi\\Phi/\\Phi_0)|$, so $E_J \\to 2E_J|\\cos(\\pi\\Phi/\\Phi_0)|$. ` +
      `The factor $|\\cos(\\pi\\Phi/\\Phi_0)|$ is ${d(V.q27Squid025, 4)} at a quarter of a flux quantum, ${d(V.q27Squid13, 1)} at a third and ${d(V.q27SquidHalf, 0)} at a half (engine).`,
    caption: 'the tunable E_J against the flux',
    captionFormal: '$|\\cos(\\pi\\Phi/\\Phi_0)|$ for $\\Phi/\\Phi_0 = 0 \\ldots 1$',
    stage: pp(PTS.squid, { xLabel: 'Φ / Φ₀', yLabel: 'E_J scale' }),
    claims: [
      claim('q27Squid025', 'at a quarter flux quantum the tuning factor is 0.7071', () => close(V.q27Squid025, 0.7071, 5e-5)),
      claim('q27Squid13', 'at a third of a flux quantum the tuning factor is 0.5', () => close(V.q27Squid13, 0.5, 1e-9)),
      claim('q27SquidHalf', 'at half a flux quantum the tuning factor is 0', () => close(V.q27SquidHalf, 0, 1e-12)),
    ],
  },
  {
    id: 'q27-josephson:b5',
    phase: 'clue',
    text: 'A SQUID tunes a circuit whose frequency goes as $\\sqrt{E_J}$. At what flux is the frequency half its maximum?',
    formal: `Solve $\\sqrt{|\\cos(\\pi\\Phi/\\Phi_0)|} = ${d(V.q27SquidHalfFreq, 1)}$ for $\\Phi/\\Phi_0$ in the first half period.`,
    caption: 'the tuning factor against the flux: where is it small enough?',
    captionFormal: '$|\\cos(\\pi\\Phi/\\Phi_0)|$ against $\\Phi/\\Phi_0$',
    stage: pp(PTS.squid, { xLabel: 'Φ / Φ₀', yLabel: 'E_J scale' }),
    reveal: {
      text: `The cosine must equal ${d(V.q27SquidQuarter, 2)}, so $\\Phi = ${d(V.q27SquidHalfFlux, 4)}\\,\\Phi_0$.`,
      formal: `$|\\cos(\\pi\\Phi/\\Phi_0)| = ${d(V.q27SquidQuarter, 2)}$, so $\\Phi/\\Phi_0 = \\arccos(${d(V.q27SquidQuarter, 2)})/\\pi = ${d(V.q27SquidHalfFlux, 4)}$.`,
      caption: 'half the frequency needs the cosine at one quarter, near half a flux quantum',
      captionFormal: `the line at ${d(V.q27SquidQuarter, 2)} meets the curve at $\\Phi/\\Phi_0 = ${d(V.q27SquidHalfFlux, 4)}$`,
      stage: pp(PTS.squid, { xLabel: 'Φ / Φ₀', yLabel: 'E_J scale', yLines: [{ y: V.q27SquidQuarter, label: 'quarter' }] }),
      claims: [
        claim('q27SquidHalfFreq', 'at the answer the frequency factor is 0.5', () => close(V.q27SquidHalfFreq, 0.5, 1e-9)),
        claim('q27SquidQuarter', 'the cosine at the answer is 0.25', () => close(V.q27SquidQuarter, 0.25, 1e-9)),
        claim('q27SquidHalfFlux', 'the half-frequency flux is 0.4196 of a quantum', () => close(V.q27SquidHalfFlux, 0.4196, 5e-5)),
      ],
    },
  },
]
void SIGN

/* ---------------------------------------------------------------------------------------------- */
/* q27-transmon — From charge qubit to transmon                                                      */
/* ---------------------------------------------------------------------------------------------- */

const BAND = curve('transmonF01r1', { curve: { vs: 'transmonF01r20', x: { from: 0, to: 1 }, samples: 8 }, markers: [{ x: 0 }, { x: 0.5 }] })
const DISP = curve('transmonDispersion', { curve: { x: { from: 2, to: 30 }, samples: 28 }, markers: [{ x: 10 }, { x: 20 }], yScale: 'log' })
const PARAB = pp(PTS.parabolas, { xLabel: 'n_g', yLabel: 'E / E_C' })
const PARAB2 = pp(PTS.parabolasTwo, { xLabel: 'n_g', yLabel: 'E / E_C' })
const GAPS = pp(PTS.gapCmp, { xLabel: 'n_g', yLabel: 'gap / E_C' })
const LEVELS = pp(PTS.levels20, { xLabel: 'n', yLabel: '(Eₙ − E₀) / E₀₁' })
const LEVELS_H = pp(PTS.levelsVsHarm, { xLabel: 'n', yLabel: '(Eₙ − E₀) / E₀₁' })

const transmon: Beat[] = [
  {
    id: 'q27-transmon:b1',
    phase: 'books',
    introduces: ['qc-charging-energy'],
    text:
      `A tiny superconducting island holds a whole number $n$ of extra Cooper pairs. Its [[qc-charging-energy|charging energy]] is $E_C(n - n_g)^2$, where a gate voltage sets the gate charge $n_g$. ` +
      `A junction adds $-E_J\\cos\\theta$, which moves one pair at a time. Together they form a [[qc-charge-qubit|charge qubit]]. Here $E_C$ counts pairs, so it is $${d(V.q27EcFactor, 0)}$ times the usual one.`,
    formal:
      `[[qc-charging-energy|The charging energy]] is $E_C = \\frac{(2e)^2}{2C_\\Sigma}$, and the [[qc-charge-qubit|charge qubit]] is $\\hat H = E_C(\\hat n - n_g)^2 - E_J\\cos\\hat\\theta$ (Eq. 15.8) with $\\hat n = -i\\partial_\\theta$. ` +
      `In the charge basis $\\cos\\hat\\theta = \\tfrac12\\sum_n(|n\\rangle\\langle n+1| + {\\rm h.c.})$, with matrix element ${d(V.q27CosElem, 1)}. ` +
      `Rosetta: the common charging energy is $\\frac{e^2}{2C_\\Sigma}$, a quarter of this one (engine ratio ${d(V.q27EcFactor, 3)}), and every number below uses the book's.`,
    caption: 'the energy of each charge state against the gate charge: parabolas crossing at the half-integers',
    captionFormal: '$E_C(n - n_g)^2$ for $n = -1, 0, 1, 2$',
    stage: PARAB,
    claims: [
      claim('q27EcFactor', 'the book\'s E_C is four times the common charging energy (engine ratio 4.000)', () => close(V.q27EcFactor, 4, 1e-9)),
      claim('q27CosElem', 'cos(theta) has matrix element one half between neighbouring charge states', () => close(V.q27CosElem, 0.5, 1e-12)),
    ],
  },
  {
    id: 'q27-transmon:b2',
    phase: 'books',
    text:
      `Near $n_g = \\tfrac12$ keep only the charge states $n = 1$ and $n = 0$. Their energies cross there, and $E_J$ opens a gap. As a 2 by 2 table, $\\sigma_z$ carries $-E_C(n_g - \\tfrac12)$ and $\\sigma_x$ carries $-E_J/2$. ` +
      `At $n_g = \\tfrac12$ the gap is $E_J$. For $E_C = 1$, $E_J = ${d(V.q27InEJ, 1)}$ and $n_g = ${d(V.q27InNg, 1)}$ the full calculation gives a gap of ${d(V.q27GapFull, 4)}$ and the cut gives ${d(V.q27GapCut, 4)}$.`,
    formal:
      `In the basis $(|1\\rangle, |0\\rangle)$ of charge states, $\\hat H \\simeq -E_C(n_g - \\tfrac12)\\sigma_z - \\frac{E_J}{2}\\sigma_x$ plus a constant, with energies $\\pm U$ and $U = \\sqrt{E_C^2(n_g - \\tfrac12)^2 + \\frac{E_J^2}{4}}$. ` +
      `The page, Eq. 15.9, prints $+E_C(n_g - \\tfrac12)\\sigma_z$ for that basis, with $|{+}\\rangle$ the state $n = 1$: our calculation finds the opposite sign (Correction K1). ` +
      `At $E_C = 1$, $E_J = ${d(V.q27InEJ, 1)}$ and $n_g = ${d(V.q27InNg, 1)}$ the coefficient is $+${d(V.q27ZcoTrue, 1)}$ and the page's form gives $-${d(V.q27ZcoTrue, 1)}$, and $U = ${d(V.q27UCut, 4)}$. ` +
      `The full charge-basis gap is ${d(V.q27GapFull, 4)} and the cut gives ${d(V.q27GapCut, 4)}. At $n_g = \\tfrac12$ the gap is ${d(V.q27GapDegenerate, 4)} against $E_J = ${d(V.q27InEJ, 1)}$.`,
    caption: 'the gap against the gate charge for E_J = 0.2 E_C: full diagonalisation and the two-level cut',
    captionFormal: 'gap$(n_g)$ for $E_J = 0.2E_C$: charge basis and two-level cut',
    stage: GAPS,
    claims: [
      claim('q27InEJ', 'the model uses E_J = 0.2 E_C', () => close(V.q27InEJ, 0.2, 1e-12)),
      claim('q27InNg', 'the model gate charge is 0.3', () => close(V.q27InNg, 0.3, 1e-12)),
      claim('q27ZcoTrue', 'the sigma_z coefficient of the block is +0.2 at n_g = 0.3 (= -E_C (n_g - 1/2))', () => close(V.q27ZcoTrue, 0.2, 1e-9) && V.q27ZcoTrue > 0),
      claim('q27ZcoPrinted', 'the page\'s sigma_z coefficient would be -0.2', () => close(V.q27ZcoPrinted, -0.2, 1e-9)),
      claim('q27UCut', 'U = 0.2236 at n_g = 0.3', () => close(V.q27UCut, 0.2236, 5e-5)),
      claim('q27GapFull', 'the full gap at n_g = 0.3 is 0.4488', () => close(V.q27GapFull, 0.4488, 5e-5)),
      claim('q27GapCut', 'the two-level cut gives 0.4472', () => close(V.q27GapCut, 0.4472, 5e-5)),
      claim('q27GapDegenerate', 'at n_g = 1/2 the full gap is 0.1995 (E_J = 0.2)', () => close(V.q27GapDegenerate, 0.1995, 5e-5)),
      claim('q27CosElem', 'cos(theta) has matrix element one half between neighbouring charge states', () => close(V.q27CosElem, 0.5, 1e-12)),
    ],
    derivation: {
      result: '\\hat H \\simeq -E_C\\left(n_g - \\tfrac12\\right)\\sigma_z - \\frac{E_J}{2}\\sigma_x',
      ground: [
        {
          tex: 'E_{|1\\rangle} = E_C(1 - n_g)^2,\\quad E_{|0\\rangle} = E_C\\,n_g^2',
          why: 'Keep two charge states: the entries on the diagonal are the two parabolas.',
          view: PARAB2,
          viewCaption: 'the two charge-state parabolas',
        },
        {
          tex: '\\frac{E_C(1 - n_g)^2 - E_C\\,n_g^2}{2} = -E_C\\left(n_g - \\tfrac12\\right)',
          why: 'Subtract their mean: half the difference is the weight of $\\sigma_z$.',
        },
        {
          tex: '\\hat H \\simeq -E_C\\left(n_g - \\tfrac12\\right)\\sigma_z - \\frac{E_J}{2}\\sigma_x',
          why: 'The term $\\cos\\hat\\theta$ moves one pair, so it links the two states with the entry $-E_J/2$.',
          view: GAPS,
          viewCaption: 'gap, full and cut',
        },
      ],
      formal: [
        {
          tex: '\\hat H = \\bar E\\,I - E_C\\left(n_g - \\tfrac12\\right)\\sigma_z - \\frac{E_J}{2}\\sigma_x',
          why: 'The 2 by 2 block on the two charge states, split into its mean $\\bar E$ and two Pauli parts.',
          view: PARAB2,
          viewCaption: 'the two charge-state parabolas',
        },
        {
          tex: '\\hat H \\simeq -E_C\\left(n_g - \\tfrac12\\right)\\sigma_z - \\frac{E_J}{2}\\sigma_x',
          why: 'Drop the constant mean; the two energies are $\\pm U$.',
          view: GAPS,
          viewCaption: 'gap, full and cut',
        },
      ],
    },
  },
  {
    id: 'q27-transmon:b3',
    phase: 'books',
    text:
      `At $n_g = \\tfrac12$ the gap has zero slope, so small charge noise barely moves the qubit frequency. Away from it the slope is steep: $-${d(V.q27SlopeOff, 2)}\\,E_C$ per unit of $n_g$ at $n_g = ${d(V.q27InNg, 1)}$. ` +
      `An $X$ gate is a visit to $n_g = \\tfrac12$ of length $\\delta t$. It flips the qubit when $E_J\\delta t/\\hbar = \\pi$.`,
    formal:
      `The slope of the gap is $${d(V.q27SlopeSweet, 0)}$ at $n_g = \\tfrac12$ (engine, below $10^{-6}$) and $-${d(V.q27SlopeOff, 2)}\\,E_C$ at $n_g = ${d(V.q27InNg, 1)}$ for $E_J = ${d(V.q27InEJ, 1)}E_C$: a first-order sweet spot (p. 281). ` +
      `The visit applies $U = e^{iE_J\\delta t\\,\\sigma_x/2\\hbar}$ (p. 282), a $\\pi$ rotation when $E_J\\delta t/\\hbar = \\pi$. $Z$ gates come from short steps in $n_g$ (same page).`,
    caption: 'the gap, flat at one half and steep elsewhere',
    captionFormal: 'gap$(n_g)$ for $E_J = 0.2E_C$: zero slope at $n_g = \\tfrac12$',
    stage: pp(PTS.gapFull, { xLabel: 'n_g', yLabel: 'gap / E_C' }),
    claims: [
      claim('q27SlopeSweet', 'the gap has zero slope at the sweet spot (below 1e-6)', () => close(V.q27SlopeSweet, 0, 1e-6)),
      claim('q27SlopeOff', 'at n_g = 0.3 the gap falls with slope 1.80 E_C per unit of n_g', () => close(V.q27SlopeOff, 1.8, 5e-3) && SIGN.slopeOff < 0),
      claim('q27CosElem', 'cos(theta) has matrix element one half between neighbouring charge states', () => close(V.q27CosElem, 0.5, 1e-12)),
      claim('q27InEJ', 'the model uses E_J = 0.2 E_C', () => close(V.q27InEJ, 0.2, 1e-12)),
      claim('q27InNg', 'the model gate charge is 0.3', () => close(V.q27InNg, 0.3, 1e-12)),
    ],
  },
  {
    id: 'q27-transmon:b4',
    phase: 'books',
    text:
      `Make $E_J$ much bigger than $E_C$. The two ends of the band, $n_g = 0$ and $n_g = \\tfrac12$, move together, and the qubit frequency stops depending on $n_g$. This is the [[qc-transmon|transmon]]. ` +
      `At $E_J/E_C = 1$ the frequency swings by ${d(V.q27F01swing1 * 100, 1)} % over a period. At 20 it swings by ${d(V.q27F01Excess20, 1)} parts in a hundred million.`,
    formal:
      `[[qc-transmon|Transmon]]: the Cooper-pair box with $E_J/E_C \\gg 1$. The ratio $f_{01}(n_g)/f_{01}(\\tfrac12)$ has its maximum $${d(V.q27F01spread1, 4)}$ at $E_J/E_C = 1$ and $1 + ${d(V.q27F01Excess20, 1)}\\times10^{-8}$ at 20. ` +
      `The engine's levels agree with the Mathieu eigenvalues $a_\\nu(q)$, $q = -2E_J/E_C$, to $10^{-8}$.`,
    caption: 'the qubit frequency over its value at one half: swinging at ratio 1, flat at ratio 20',
    captionFormal: '$f_{01}(n_g)/f_{01}(\\tfrac12)$ at $E_J/E_C = 1$ and $20$',
    stage: BAND,
    claims: [
      claim('q27F01spread1', 'at ratio 1 the frequency ratio peaks at 1.3757', () => close(V.q27F01spread1, 1.3757, 5e-5)),
      claim('q27F01swing1', 'at ratio 1 the frequency swings by 37.6 percent', () => close(V.q27F01swing1, 0.376, 5e-4)),
      claim('q27F01Excess20', 'at ratio 20 the swing is 1.5 parts in 10^8', () => close(V.q27F01Excess20, 1.5, 5e-2)),
      claim('q27CosElem', 'cos(theta) has matrix element one half between neighbouring charge states', () => close(V.q27CosElem, 0.5, 1e-12)),
    ],
  },
  {
    id: 'q27-transmon:b5',
    phase: 'books',
    text:
      `In the phase picture $\\hat n = -i\\,d/d\\theta$. Define $g(\\phi) = e^{-2in_g\\phi}\\psi(2\\phi)$ and the energy equation becomes the Mathieu equation, which is solved exactly. Our diagonalisation agrees with it to eight digits. ` +
      `At $E_J/E_C = 20$ the first gap is $${d(V.q27E0120, 3)}\\,E_C$, while the spring guess $\\sqrt{2E_JE_C}$ gives $${d(V.q27SqrtApprox20, 3)}\\,E_C$.`,
    formal:
      `The equation $[E_C(-i\\partial_\\theta - n_g)^2 - E_J\\cos\\theta]\\psi = E\\psi$ with $g(\\phi) = e^{-2in_g\\phi}\\psi(2\\phi)$ becomes $g'' + [4E/E_C + (4E_J/E_C)\\cos2\\phi]g = 0$, which is Mathieu's $y'' + (a - 2q\\cos2x)y = 0$ with $a = 4E/E_C$ and $q = -2E_J/E_C$. ` +
      `At $n_g = 0$ and $\\tfrac12$ the levels are $E_Ca_\\nu(q)/4$ (engine against the scipy twin, $10^{-8}$). The spring estimate $\\sqrt{2E_JE_C}$ (ours) is ${d(V.q27SqrtApprox20, 3)}$ against the exact ${d(V.q27E0120, 3)}$ at $E_J/E_C = 20$.`,
    caption: 'the lowest levels at ratio 20, in units of the first gap',
    captionFormal: '$(E_n - E_0)/E_{01}$ for $n = 0 \\ldots 4$ at $E_J/E_C = 20$',
    stage: LEVELS,
    claims: [
      claim('q27E0120', 'at ratio 20 the first gap is 6.063 E_C', () => close(V.q27E0120, 6.063, 5e-4)),
      claim('q27SqrtApprox20', 'the spring guess sqrt(2 E_J E_C) is 6.325 E_C at ratio 20', () => close(V.q27SqrtApprox20, 6.325, 5e-4)),
      claim('q27CosElem', 'cos(theta) has matrix element one half between neighbouring charge states', () => close(V.q27CosElem, 0.5, 1e-12)),
    ],
    derivation: {
      result: 'g\'\' + \\left(\\frac{4E}{E_C} + \\frac{4E_J}{E_C}\\cos2\\phi\\right)g = 0',
      ground: [
        {
          tex: '-E_C\\,\\psi\'\' - E_J\\cos\\theta\\,\\psi = E\\,\\psi',
          why: 'A shift of the wave function by $e^{in_g\\theta}$ moves $n_g$ into the boundary condition, and the charge becomes a derivative of the phase.',
          view: LEVELS,
          viewCaption: 'the lowest levels at ratio 20',
        },
        {
          tex: '\\frac{d^2}{d\\theta^2} = \\frac{d^2}{4\\,d\\phi^2}',
          why: 'Put $\\theta = 2\\phi$: each derivative gains a factor of one half, so the second derivative gains a factor of one quarter.',
        },
        {
          tex: 'g\'\' + \\left(\\frac{4E}{E_C} + \\frac{4E_J}{E_C}\\cos2\\phi\\right)g = 0',
          why: 'Multiply by four and divide by $E_C$: this is Mathieu\'s equation with $a = 4E/E_C$ and $q = -2E_J/E_C$.',
          view: LEVELS_H,
          viewCaption: 'the exact levels against the harmonic ladder',
        },
      ],
      formal: [
        {
          tex: 'g(\\phi) = e^{-2in_g\\phi}\\psi(2\\phi)',
          why: 'The substitution that removes $n_g$ and doubles the period.',
          view: LEVELS,
          viewCaption: 'the lowest levels at ratio 20',
        },
        {
          tex: 'g\'\' + \\left(\\frac{4E}{E_C} + \\frac{4E_J}{E_C}\\cos2\\phi\\right)g = 0',
          why: 'Mathieu\'s equation, with $a = 4E/E_C$ and $q = -2E_J/E_C$.',
          view: LEVELS_H,
          viewCaption: 'the exact levels against the harmonic ladder',
        },
      ],
    },
  },
  {
    id: 'q27-transmon:b6',
    phase: 'books',
    text:
      `In the transmon the rungs are not even. At $E_J/E_C = 20$ the levels sit at 0, 1, ${d(V.q27Ladder2, 3)}, ${d(V.q27Ladder3, 3)} and ${d(V.q27Ladder4, 3)} in units of the first gap. An LC circuit has 0, 1, 2, 3, 4. ` +
      `The second gap is ${d(V.q27Anh20 * 100, 1)} % short, so a pulse for $0 \\to 1$ misses $1 \\to 2$.`,
    formal:
      `The [[qc-anharmonicity|relative anharmonicity]] $\\alpha = (E_{21} - E_{10})/E_{10}$ is $-${d(V.q27Anh20, 4)}$ at $E_J/E_C = 20$, $-${d(V.q27Anh10, 4)}$ at 10 and $-${d(V.q27Anh50, 4)}$ at 50. ` +
      `The page's large-ratio form $-1/\\sqrt{32E_J/E_C}$ gives $-${d(V.q27Anh20Formula, 4)}$, $-${d(V.q27Anh10Formula, 4)}$ and $-${d(V.q27Anh50Formula, 4)}$: it improves with the ratio, and our calculation finds no error. ` +
      `The anharmonicity shrinks only as a power law.`,
    caption: 'the rungs of the LC circuit against the transmon at ratio 20',
    captionFormal: 'levels $(E_n - E_0)/E_{01}$ for the LC circuit and the transmon at $E_J/E_C = 20$',
    stage: pp(PTS.ladderCmp, { xLabel: 'n', yLabel: '(Eₙ − E₀) / E₀₁' }),
    claims: [
      claim('q27Ladder2', 'the second level sits at 1.954 first gaps', () => close(V.q27Ladder2, 1.954, 5e-4)),
      claim('q27Ladder3', 'the third level sits at 2.859 first gaps', () => close(V.q27Ladder3, 2.859, 5e-4)),
      claim('q27Ladder4', 'the fourth level sits at 3.708 first gaps', () => close(V.q27Ladder4, 3.708, 5e-4)),
      claim('q27Anh20', 'at ratio 20 alpha = -0.0457', () => close(V.q27Anh20, 0.0457, 5e-5) && SIGN.anh20 < 0),
      claim('q27Anh10', 'at ratio 10 alpha = -0.0696', () => close(V.q27Anh10, 0.0696, 5e-5) && SIGN.anh10 < 0),
      claim('q27Anh50', 'at ratio 50 alpha = -0.0273', () => close(V.q27Anh50, 0.0273, 5e-5) && SIGN.anh50 < 0),
      claim('q27Anh20Formula', 'the page\'s form gives -0.0395 at ratio 20', () => close(V.q27Anh20Formula, 0.0395, 5e-5)),
      claim('q27Anh10Formula', 'the page\'s form gives -0.0559 at ratio 10', () => close(V.q27Anh10Formula, 0.0559, 5e-5)),
      claim('q27Anh50Formula', 'the page\'s form gives -0.0250 at ratio 50', () => close(V.q27Anh50Formula, 0.025, 5e-5)),
    ],
  },
  {
    id: 'q27-transmon:b7',
    phase: 'books',
    text:
      `How fast does the charge dependence die as $E_J/E_C$ grows? Exponentially. This is the [[qc-charge-dispersion|charge dispersion]]. The lowest level moves by $${d(V.q27Disp10, 3)}\\times10^{-7}E_C$ over one period of $n_g$ at ratio 10, ` +
      `and by a thousand times less, $${d(V.q27Disp20, 3)}\\times10^{-9}E_C$, at ratio 20. The anharmonicity falls only from ${d(V.q27Anh10, 3)} to ${d(V.q27Anh20, 3)}.`,
    formal:
      `The exact [[qc-charge-dispersion|charge dispersion]] $\\epsilon_0 = E_0(\\tfrac12) - E_0(0)$ is $${d(V.q27Disp10, 3)}\\times10^{-7}E_C$ at $r = 10$ and $${d(V.q27Disp20, 3)}\\times10^{-9}E_C$ at $r = 20$, a ratio of ${d(V.q27DispRatio1020, 1)}. ` +
      `The page's $\\epsilon_k \\simeq (-1)^kE_C\\frac{2^{4k+3}}{k!}\\sqrt{\\tfrac2\\pi}\\,(2r)^{(2k+3)/4}e^{-\\sqrt{2r}}$ gives $${d(V.q27Disp10Printed, 3)}\\,E_C$ at $r = 10$. ` +
      `Our calculation finds that the exponent must be $\\sqrt{32r}$, with the prefactor as printed: $${d(V.q27Disp10Koch, 3)}\\times10^{-6}E_C$ and $${d(V.q27Disp20Koch, 3)}\\times10^{-9}E_C$, within ${d(V.q27KochErr10 * 100, 0)} % and ${d(V.q27KochErr20 * 100, 0)} % of the exact values (Correction K2).`,
    caption: 'charge dispersion against the ratio, log axis: exact, corrected formula, printed formula',
    captionFormal: '$\\epsilon_0/E_C$ against $r = E_J/E_C$: exact, exponent $\\sqrt{32r}$, printed exponent',
    stage: pp(PTS.dispersion, { xLabel: 'E_J / E_C', yLabel: 'ε₀ / E_C', yScale: 'log' }),
    claims: [
      claim('q27Disp10', 'at ratio 10 the dispersion is 9.759e-7 E_C', () => close(V.q27Disp10, 9.759, 5e-4)),
      claim('q27Disp20', 'at ratio 20 the dispersion is 1.009e-9 E_C', () => close(V.q27Disp20, 1.009, 5e-4)),
      claim('q27DispRatio1020', 'the dispersion falls by 966.8 from ratio 10 to 20', () => close(V.q27DispRatio1020, 966.8, 5e-2)),
      claim('q27Disp10Printed', 'the page\'s formula gives 0.690 E_C at ratio 10', () => close(V.q27Disp10Printed, 0.69, 5e-4)),
      claim('q27Disp10Koch', 'the corrected exponent gives 1.028e-6 E_C at ratio 10', () => close(V.q27Disp10Koch, 1.028, 5e-4)),
      claim('q27Disp20Koch', 'the corrected exponent gives 1.046e-9 E_C at ratio 20', () => close(V.q27Disp20Koch, 1.046, 5e-4)),
      claim('q27KochErr10', 'at ratio 10 the corrected formula is within 5 percent', () => close(V.q27KochErr10, 0.05, 5e-3)),
      claim('q27KochErr20', 'at ratio 20 the corrected formula is within 4 percent', () => close(V.q27KochErr20, 0.04, 5e-3)),
      claim('q27Anh10', 'at ratio 10 alpha = -0.0696', () => close(V.q27Anh10, 0.0696, 5e-5)),
      claim('q27Anh20', 'at ratio 20 alpha = -0.0457', () => close(V.q27Anh20, 0.0457, 5e-5)),
      claim('q27CosElem', 'cos(theta) has matrix element one half between neighbouring charge states', () => close(V.q27CosElem, 0.5, 1e-12)),
    ],
  },
  {
    id: 'q27-transmon:b8',
    phase: 'clue',
    text: '$E_J/E_C$ doubles from 10 to 20. By what factor does the charge dependence fall, and by what factor does the anharmonicity fall?',
    formal: 'Find the ratios $\\epsilon_0(10)/\\epsilon_0(20)$ and $|\\alpha(10)/\\alpha(20)|$ from the exact values.',
    caption: 'the charge dispersion against the ratio: read the heights at 10 and 20',
    captionFormal: '$\\epsilon_0$ at $r = 10$ and $r = 20$',
    stage: DISP,
    reveal: {
      text: `By ${d(V.q27DispRatio1020, 1)} for the charge dependence, but only by ${d(V.q27AnhRatio1020, 2)} for the anharmonicity. The gain in coherence costs little.`,
      formal: `$\\epsilon_0$: ${d(V.q27DispRatio1020, 1)}. $|\\alpha|$: ${d(V.q27Anh10, 4)}/${d(V.q27Anh20, 4)} = ${d(V.q27AnhRatio1020, 3)} (exact values).`,
      caption: 'a thousandfold gain for about a third of the anharmonicity',
      captionFormal: `$\\epsilon_0$ falls by a factor of ${d(V.q27DispRatio1020, 1)}, $|\\alpha|$ by ${d(V.q27AnhRatio1020, 3)}`,
      stage: DISP,
      claims: [
        claim('q27DispRatio1020', 'the dispersion falls by 966.8 from ratio 10 to 20', () => close(V.q27DispRatio1020, 966.8, 5e-2)),
        claim('q27AnhRatio1020', 'the anharmonicity falls by 1.520 from ratio 10 to 20', () => close(V.q27AnhRatio1020, 1.52, 5e-3)),
        claim('q27Anh10', 'at ratio 10 alpha = -0.0696', () => close(V.q27Anh10, 0.0696, 5e-5)),
        claim('q27Anh20', 'at ratio 20 alpha = -0.0457', () => close(V.q27Anh20, 0.0457, 5e-5)),
      ],
    },
  },
  {
    id: 'q27-transmon:b9',
    phase: 'deeper',
    text:
      'Other designs trade differently. A flux qubit sits in a double well, like the ammonia molecule of Lecture 11 in Physics 448. A phase qubit sits in a tilted cosine well. A 0–π qubit protects itself by its design. We describe these in words only.',
    formal:
      'Flux qubit ($E_J > E_C$): two wells, with a splitting exponentially sensitive to the barrier. Phase qubit: a current-biased junction in a tilted cosine well, read by tunnelling. ' +
      'The $0$–$\\pi$ circuit has two nearly degenerate states at phase $0$ and $\\pi$, split by an amount that is exponentially small in the circuit parameters (pp. 282–283, 287–288). We reproduce and compute no number from those pages.',
    caption: 'the band of the charge qubit, the starting point of all these designs',
    captionFormal: 'the frequency band again: $f_{01}(n_g)/f_{01}(\\tfrac12)$ at ratios 1 and 20',
    stage: BAND,
  },
]

/* ---------------------------------------------------------------------------------------------- */
/* q27-cqed — A qubit coupled to a resonator                                                         */
/* ---------------------------------------------------------------------------------------------- */

const SHIFT = pp(PTS.shiftVsDelta, { xLabel: 'Δ/2π (MHz)', yLabel: 'shift (MHz)' })
const SHIFT200 = pp(PTS.shiftVsDelta200, { xLabel: 'Δ/2π (MHz)', yLabel: 'shift (MHz)' })

const cqed: Beat[] = [
  {
    id: 'q27-cqed:b1',
    phase: 'books',
    text:
      `Couple the transmon to a microwave resonator: a [[qc-circuit-qed|circuit-QED]] setup, one two-level system and one light mode, as in Chapter Q26's atom and light. ` +
      `Keep only the terms that conserve energy, the rotating-wave idea of <<qc-l12-driven|Unit 12.7>>. At resonance, with $g$ the coupling between qubit and resonator, the dressed levels split by $2g\\sqrt{n+1}$ for $n$ photons. ` +
      `For $g/2\\pi = 10$ MHz (model) that is ${d(V.q27VacRabi0, 1)}, ${d(V.q27VacRabi1, 1)} and ${d(V.q27VacRabi2, 1)} MHz.`,
    formal:
      `The quantum Rabi model is $\\hat H = \\frac{E}{2}\\sigma_z + \\hbar\\omega_ra^\\dagger a + \\hbar g\\sigma_x(a + a^\\dagger)$, up to a constant. Dropping the counter-rotating terms leaves ` +
      `$\\hat H_{\\rm JC} = \\frac{E}{2}\\sigma_z + \\hbar\\omega_ra^\\dagger a + \\hbar g(\\sigma_+a + \\sigma_-a^\\dagger)$ (p. 285), Chapter Q26's block with $\\Omega_0 = 2g$. ` +
      `At resonance the splitting is $2g\\sqrt{n+1}$: ${d(V.q27VacRabi0, 2)}, ${d(V.q27VacRabi1, 2)}, ${d(V.q27VacRabi2, 2)}, ${d(V.q27VacRabi3, 2)} and ${d(V.q27VacRabi4, 2)} MHz for $n = 0 \\ldots 4$ (model, ours).`,
    caption: 'the splitting at resonance grows as √(n+1)',
    captionFormal: '$2g\\sqrt{n+1}$ in MHz for $n = 0 \\ldots 4$ at $g/2\\pi = 10$ MHz',
    stage: pp(PTS.vacRabi, { xLabel: 'n', yLabel: 'splitting (MHz)' }),
    claims: [
      claim('q27VacRabi0', 'with no photon the splitting is 20.00 MHz', () => close(V.q27VacRabi0, 20, 5e-3)),
      claim('q27VacRabi1', 'with one photon the splitting is 28.28 MHz', () => close(V.q27VacRabi1, 28.28, 5e-3)),
      claim('q27VacRabi2', 'with two photons the splitting is 34.64 MHz', () => close(V.q27VacRabi2, 34.64, 5e-3)),
      claim('q27VacRabi3', 'with three photons the splitting is 40.00 MHz', () => close(V.q27VacRabi3, 40, 5e-3)),
      claim('q27VacRabi4', 'with four photons the splitting is 44.72 MHz', () => close(V.q27VacRabi4, 44.72, 5e-3)),
    ],
  },
  {
    id: 'q27-cqed:b2',
    phase: 'books',
    text:
      `Coherent exchange needs $g$ to beat both losses: the resonator's decay rate $\\kappa$ and the qubit's decay rate $\\gamma = 1/T_1$. Here $T_1$ is the qubit's relaxation time (Chapter Q24). The ratio $C = g^2/\\kappa\\gamma$ is the [[qc-cooperativity|cooperativity]]. ` +
      `Model: $g/2\\pi = 10$ MHz, a resonator quality factor $Q_{\\rm r} = 10^7$ at 10 GHz and $T_1 = 100\\,\\mu$s. Then $\\kappa/2\\pi = ${d(V.q27KappakHz, 1)}$ kHz, $\\gamma/2\\pi = ${d(V.q27GammakHz, 2)}$ kHz and $C = ${d(V.q27Coop, 1)}\\times10^{7}$.`,
    formal:
      `Strong coupling means $\\gamma, \\kappa \\ll g \\ll E, \\omega_r$, and the cooperativity is $C_{\\rm coop} = g^2/\\kappa\\gamma$ (p. 286). ` +
      `Model inputs (ours: round numbers in the spirit of the page's example, not measurements): $\\kappa = \\omega_r/Q_{\\rm r}$ and $\\gamma = 1/T_1$. They give $\\kappa/2\\pi = ${d(V.q27KappakHz, 1)}$ kHz, $\\gamma/2\\pi = ${d(V.q27GammakHz, 2)}$ kHz and $C_{\\rm coop} = ${d(V.q27Coop, 3)}\\times10^{7}$. ` +
      `Atoms in cavities have reached a far smaller value (words only).`,
    caption: 'the coupling dwarfs the two loss rates (log axis)',
    captionFormal: '$g/2\\pi$, $\\kappa/2\\pi$ and $\\gamma/2\\pi$ in kHz, log axis',
    stage: pp(PTS.rates, { xLabel: 'rate (1 g, 2 κ, 3 γ)', yLabel: 'rate / 2π (kHz)', yScale: 'log' }),
    claims: [
      claim('q27KappakHz', 'the resonator decay rate is 1.0 kHz (over 2 pi)', () => close(V.q27KappakHz, 1, 1e-9)),
      claim('q27GammakHz', 'the qubit decay rate is 1.59 kHz (over 2 pi)', () => close(V.q27GammakHz, 1.59, 5e-3)),
      claim('q27Coop', 'the cooperativity is 6.283e7', () => close(V.q27Coop, 6.283, 5e-4)),
    ],
  },
  {
    id: 'q27-cqed:b3',
    phase: 'books',
    text:
      `Detune the qubit far from the resonator, $|\\Delta| \\gg g$. The qubit's energy shifts by $g^2/\\Delta$, and the resonator's frequency shifts by $\\pm g^2/\\Delta$, with the sign set by the qubit state. ` +
      `This is [[qc-dispersive-readout|dispersive readout]]: the resonator's phase tells the qubit state without destroying it. ` +
      `At $\\Delta/2\\pi = 100$ MHz the shifts are $\\pm${d(V.q27DispShiftMHz, 1)}$ MHz, so the two lines sit ${d(V.q27DispSepMHz, 1)} MHz apart, 2000 times the line width.`,
    formal:
      `For $|\\Delta| \\gg g$ the Hamiltonian becomes $\\hat H \\simeq \\frac{E + \\hbar g^2/\\Delta}{2}\\sigma_z + \\left(\\hbar\\omega_r + \\hbar\\frac{g^2}{\\Delta}\\sigma_z\\right)a^\\dagger a$ (p. 286), the expansion of Chapter Q26 with $\\Omega_0 = 2g$. ` +
      `The shift is $\\chi = g^2/\\Delta = ${d(V.q27DispShiftMHz, 3)}$ MHz (over $2\\pi$) for the model, and the exact two-level energy gives ${d(V.q27DispShiftExact, 3)}. ` +
      `The two qubit states put the line at $\\pm\\chi$, so the lines are $2\\chi = ${d(V.q27DispSepMHz, 1)}$ MHz apart against $\\kappa/2\\pi = ${d(V.q27KappakHz, 1)}$ kHz: a ratio of ${d(V.q27ReadoutRatio, 0)}. Nothing is exchanged, so the reading is non-destructive.`,
    caption: 'the shift g²/Δ against the detuning, with the exact level shift beside it',
    captionFormal: '$\\chi = g^2/\\Delta$ and the exact shift of the dressed level, in MHz',
    stage: SHIFT,
    claims: [
      claim('q27DispShiftMHz', 'at Delta/2pi = 100 MHz the shift g^2/Delta is 1.000 MHz', () => close(V.q27DispShiftMHz, 1, 5e-4)),
      claim('q27DispSepMHz', 'the two lines are 2.0 MHz apart', () => close(V.q27DispSepMHz, 2, 5e-2)),
      claim('q27DispShiftExact', 'the exact dressed-level shift at 100 MHz is 0.990 MHz', () => close(V.q27DispShiftExact, 0.99, 5e-4)),
      claim('q27KappakHz', 'the resonator decay rate is 1.0 kHz (over 2 pi)', () => close(V.q27KappakHz, 1, 1e-9)),
      claim('q27ReadoutRatio', 'the line separation is 2000 line widths', () => close(V.q27ReadoutRatio, 2000, 1e-6)),
    ],
    derivation: {
      result: '\\chi = \\frac{g^2}{\\Delta}',
      ground: [
        {
          tex: 'E_\\pm = \\pm\\frac{\\sqrt{\\Delta^2 + 4g^2(n+1)}}{2}',
          why: 'The block of $n$ photons has two dressed energies, measured from its mean level.',
          view: SHIFT,
          viewCaption: 'the shift against the detuning',
        },
        {
          tex: 'E_+ = \\frac{\\Delta}{2} + \\frac{g^2(n+1)}{\\Delta} + \\cdots',
          why: 'For $|\\Delta| \\gg g$ expand the square root, as in Chapter Q26: the first correction is $g^2(n+1)/\\Delta$.',
        },
        {
          tex: '\\chi = \\frac{g^2}{\\Delta}',
          why: 'The qubit level and the resonator line each move by this amount, up or down with the qubit state.',
          view: SHIFT200,
          viewCaption: 'the 200 MHz point marked',
        },
      ],
      formal: [
        {
          tex: 'E_+ \\simeq \\frac{\\Delta}{2} + \\frac{g^2(n+1)}{\\Delta}',
          why: 'Expand the dressed energy of the block for $|\\Delta| \\gg g$ (Chapter Q26, with $\\Omega_0 = 2g$).',
          view: SHIFT,
          viewCaption: 'the shift against the detuning',
        },
        {
          tex: '\\chi = \\frac{g^2}{\\Delta}',
          why: 'The coefficient of $a^\\dagger a\\,\\sigma_z$.',
          view: SHIFT200,
          viewCaption: 'the 200 MHz point marked',
        },
      ],
    },
  },
  {
    id: 'q27-cqed:b4',
    phase: 'books',
    text:
      `Two qubits on one resonator swap their excitations through virtual photons, at the rate $g^2/\\Delta$. Left on for $g^2t/\\Delta = \\pi/2$, they swap up to a factor $i$: the [[qc-iswap|iSWAP]] gate, a relative of the swap of <<qc-q4-circuits|Unit 4.5>>. ` +
      `For the model numbers $t = ${d(V.q27IswapNs, 0)}$ ns. Half that time gives chance ${d(V.q27ISwapQuarterP, 1)} for $|01\\rangle \\to |10\\rangle$.`,
    formal:
      `The exchange term $\\hbar\\frac{g^2}{\\Delta}(\\sigma_{+,1}\\sigma_{-,2} + {\\rm h.c.})$ (Eq. 15.11) turns $|01\\rangle$ into $\\cos\\tau\\,|01\\rangle - i\\sin\\tau\\,|10\\rangle$ with $\\tau = g^2t/\\Delta$ (engine: matrix exponential). ` +
      `The value $\\tau = \\pi/2$ is the iSWAP type, and $\\tau = \\pi/4$ gives swap chance ${d(V.q27ISwapQuarterP, 1)}. The time is $t = (\\pi/2)\\Delta/g^2 = ${d(V.q27IswapNs, 0)}$ ns for $g/2\\pi = 10$ MHz and $\\Delta/2\\pi = 100$ MHz. ` +
      `Two iSWAPs and one-qubit gates make a CNOT, as the page says (cited, not re-derived).`,
    caption: '|01⟩ swaps into |10⟩: all of the weight crosses at τ = π/2',
    captionFormal: '$\\exp[-i\\tau(\\sigma_+\\sigma_- + {\\rm h.c.})]$ at $\\tau = \\pi/2$ acting on $|01\\rangle$',
    stage: split(circ(C_ISW(Math.PI / 2), 1), amp(C_ISW(Math.PI / 2), 1, 'probability')),
    claims: [
      claim('q27IswapNs', 'the model iSWAP takes 250 ns', () => close(V.q27IswapNs, 250, 1e-6)),
      claim('q27ISwapQuarterP', 'at tau = pi/4 the swap chance is 0.5', () => close(V.q27ISwapQuarterP, 0.5, 1e-9)),
      claim('q27IswapGap', 'the exchange evolution at tau = pi/2 is the iSWAP matrix (max-abs gap)', () => close(V.q27IswapGap, 0, 1e-12)),
    ],
  },
  {
    id: 'q27-cqed:b5',
    phase: 'clue',
    text: 'Same model, but $\\Delta/2\\pi = 200$ MHz. How long is the iSWAP, and how big is the dispersive shift?',
    formal: 'Evaluate $t = (\\pi/2)\\Delta/g^2$ and $\\chi = g^2/\\Delta$ at $\\Delta/2\\pi = 200$ MHz.',
    caption: 'the shift against the detuning: where does 200 MHz fall?',
    captionFormal: '$\\chi(\\Delta)$ with the 100 MHz model point',
    stage: SHIFT,
    reveal: {
      text: `${d(V.q27Iswap200Ns, 0)} ns and ${d(V.q27DispShift200, 1)} MHz. A larger detuning slows the gate and weakens the readout, so the detuning trades one against the other.`,
      formal: `$t = ${d(V.q27Iswap200Ns, 0)}$ ns and $\\chi/2\\pi = ${d(V.q27DispShift200, 1)}$ MHz: $t$ grows with $\\Delta$ and $\\chi$ falls with it.`,
      caption: 'doubling the detuning halves the shift and doubles the gate time',
      captionFormal: '$\\chi$ halves and $t$ doubles at $\\Delta/2\\pi = 200$ MHz',
      stage: SHIFT200,
      claims: [
        claim('q27Iswap200Ns', 'at 200 MHz the iSWAP takes 500 ns', () => close(V.q27Iswap200Ns, 500, 1e-6)),
        claim('q27DispShift200', 'at 200 MHz the dispersive shift is 0.5 MHz', () => close(V.q27DispShift200, 0.5, 5e-4)),
      ],
    },
  },
]

/* ---------------------------------------------------------------------------------------------- */
/* q27-dots — One electron spin in a gated dot                                                       */
/* ---------------------------------------------------------------------------------------------- */

const dots: Beat[] = [
  {
    id: 'q27-dots:b1',
    phase: 'books',
    text:
      `An electron's spin in a magnetic field $B$ has two energies, $\\pm\\mu_BB$, so the two levels are $2\\mu_BB$ apart, as in <<qc-l1-quantized|Unit 1.1>>. ` +
      `In a [[qc-quantum-dot|quantum dot]], a tiny trap for single electrons, this gap is the qubit's frequency. At $B = ${d(V.q27InB, 1)}$ T it is ${d(V.q27Zeeman01GHz, 2)} GHz, of the same order as the circuit's 5 GHz. ` +
      `In temperature that is ${d(V.q27ZeemanTmK, 1)} mK. At ${d(V.q27InB14, 1)} T it is ${d(V.q27Zeeman14GHz, 1)} GHz.`,
    formal:
      `Spin qubit in a [[qc-quantum-dot|quantum dot]]: $|0\\rangle = |{\\uparrow}\\rangle$ and $|1\\rangle = |{\\downarrow}\\rangle$ with energies $+\\mu_BB$ and $-\\mu_BB$ (p. 289). Here $|0\\rangle$ is the upper level; the course keeps its geometric lock $|0\\rangle = |{+z}\\rangle$ elsewhere. ` +
      `The frequency $f = 2\\mu_BB/h$ is ${d(V.q27Zeeman01GHz, 4)} GHz at ${d(V.q27InB, 1)} T and ${d(V.q27Zeeman14GHz, 2)} GHz at ${d(V.q27InB14, 1)} T, and $hf/k_{\\rm B} = ${d(V.q27ZeemanTmK, 1)}$ mK at ${d(V.q27InB, 1)} T (the page rounds to 135 mK).`,
    caption: 'the two clocks of a spin in a field: the arrow turns at the Zeeman frequency (a Larmor beat, not GHz)',
    captionFormal: 'two phase clocks with a gap of one unit: the arrow on the equator turns at $f = 2\\mu_BB/h$',
    stage: ck(2, 1, 90),
    claims: [
      claim('q27InB', 'the model field is 0.1 T', () => close(V.q27InB, 0.1, 1e-12)),
      claim('q27InB14', 'the second model field is 1.4 T', () => close(V.q27InB14, 1.4, 1e-12)),
      claim('q27Zeeman01GHz', 'at 0.1 T the spin frequency is 2.799 GHz', () => close(V.q27Zeeman01GHz, 2.7992, 5e-5)),
      claim('q27ZeemanTmK', 'at 0.1 T the gap is 134.3 mK', () => close(V.q27ZeemanTmK, 134.3, 5e-2)),
      claim('q27Zeeman14GHz', 'at 1.4 T the spin frequency is 39.19 GHz', () => close(V.q27Zeeman14GHz, 39.19, 5e-3)),
    ],
  },
  {
    id: 'q27-dots:b2',
    phase: 'books',
    text:
      `Wait with the field on and the spin relaxes to its lower level. The chance of the lower level at temperature $T$ is $1/(1 + e^{-hf/k_{\\rm B}T})$. It is ${d(V.q27ZeemanPDown100mK, 3)} at 100 mK and ${d(V.q27ZeemanPDown20mK, 4)} at 20 mK. ` +
      `To read the spin, let one spin state escape from the dot and sense the charge change nearby. The reading destroys the state.`,
    formal:
      `The two-level thermal chance is $P_\\downarrow = 1/(1 + e^{-hf/k_{\\rm B}T})$: ${d(V.q27ZeemanPDown100mK, 4)}$ at 100 mK and ${d(V.q27ZeemanPDown20mK, 5)}$ at 20 mK for $f = ${d(V.q27Zeeman01GHz, 4)}$ GHz (model temperatures, ours). ` +
      `Spin-dependent tunnelling and a nearby charge sensor turn spin into charge, and destroy the state (pp. 290–291). Readout fidelities and the non-destructive variants are described there and not repeated as numbers.`,
    caption: 'chance of the lower level against temperature, log axis',
    captionFormal: `$P_\\downarrow$ against $T$ for $f = ${d(V.q27Zeeman01GHz, 4)}$ GHz, log axis`,
    stage: pp(PTS.spinThermal, { xLabel: 'T (K)', yLabel: 'P (lower level)', xScale: 'log' }),
    claims: [
      claim('q27ZeemanPDown100mK', 'at 100 mK the lower level has chance 0.7931', () => close(V.q27ZeemanPDown100mK, 0.7931, 5e-5)),
      claim('q27ZeemanPDown20mK', 'at 20 mK the lower level has chance 0.99879', () => close(V.q27ZeemanPDown20mK, 0.99879, 5e-6)),
      claim('q27Zeeman01GHz', 'at 0.1 T the spin frequency is 2.7992 GHz', () => close(V.q27Zeeman01GHz, 2.7992, 5e-5)),
    ],
  },
  {
    id: 'q27-dots:b3',
    phase: 'books',
    text:
      `A microwave field at the Zeeman frequency turns the spin: Rabi flopping, as in <<qc-l12-driven|Unit 12.7>>. The rate is $\\Omega = \\mu_BB_x/\\hbar$, where $B_x$ is the strength of the oscillating field. ` +
      `For $\\Omega/2\\pi = 10$ MHz (model) you need $B_x = ${d(V.q27RabiBxmT, 4)}$ mT, and a flip takes 50 ns.`,
    formal:
      `The field is $\\mathbf B = B_0\\hat z + B_x\\cos(\\omega_qt)\\,\\hat x$ with $\\omega_q = 2\\mu_BB_0/\\hbar$. In the rotating-wave approximation $\\Omega = \\mu_BB_x/\\hbar$ (p. 291; <<qc-l12-driven|Unit 12.7>>). ` +
      `Rabi's formula, $T_1$, $T_2$ and Ramsey belong to Chapter Q24, and only the $\\pi$-pulse time $t_\\pi = \\pi/\\Omega$ is used here. Model $\\Omega/2\\pi = 10$ MHz: $B_x = ${d(V.q27RabiBxmT, 4)}$ mT and $t_\\pi = ${d(V.q27PiTimeNs, 1)}$ ns.`,
    caption: 'a π pulse flips |0⟩ to |1⟩',
    captionFormal: '$R_x(\\pi)$ on $|0\\rangle$: the chance of $|1\\rangle$ is 1',
    stage: split(circ(C_X, 1), amp(C_X, 1, 'probability')),
    claims: [
      claim('q27RabiBxmT', 'for Omega/2pi = 10 MHz the drive field is 0.7145 mT', () => close(V.q27RabiBxmT, 0.7145, 5e-5)),
      claim('q27PiTimeNs', 'the pi pulse takes 50 ns', () => close(V.q27PiTimeNs, 50, 1e-6)),
    ],
  },
  {
    id: 'q27-dots:b4',
    phase: 'books',
    text:
      `Two electrons in neighbouring dots feel the Coulomb force and the Pauli rule. The spin-singlet and spin-triplet states get different energies, $D + K$ and $D - K$. Here $D$ is the Coulomb energy of the pair and $K$ the exchange energy. ` +
      `As spin operators this is $-2K\\,\\mathbf s_1\\cdot\\mathbf s_2$, a Heisenberg coupling: the [[qc-exchange-interaction|exchange interaction]] $J = -2K$. ` +
      `The table of $\\boldsymbol\\sigma_1\\cdot\\boldsymbol\\sigma_2$ shows $-3$ on the singlet and $+1$ on the three triplets, and $\\mathbf s_1\\cdot\\mathbf s_2$ is a quarter of it. ` +
      `With $D = 1$ and $K = ${d(V.q27InK, 1)}$ (model) the two energies are ${d(V.q27ES, 1)} and ${d(V.q27ET, 1)}.`,
    formal:
      `With symmetric and antisymmetric orbitals the Coulomb term is diagonal, $H_{11} = D + K$ and $H_{22} = D - K$ (the direct and exchange integrals, p. 293). The state $S = \\psi_s\\chi_{as}$ has energy $D + K$ and $T = \\psi_{as}\\chi_s$ has $D - K$. ` +
      `With $\\langle\\mathbf s_1\\cdot\\mathbf s_2\\rangle = -\\tfrac34$ or $\\tfrac14$ the energies are $D - \\frac{K}{2} - 2K\\langle\\mathbf s_1\\cdot\\mathbf s_2\\rangle$. ` +
      `The engine finds the eigenvalues of $\\mathbf s_1\\cdot\\mathbf s_2$ to be $-${d(V.q27S1S2Singlet, 2)}$, ${d(V.q27S1S2Triplet, 2)}, ${d(V.q27S1S2Triplet, 2)} and ${d(V.q27S1S2Triplet, 2)}, so $E_S - E_T = 2K$. ` +
      `The exchange Hamiltonian is $\\hat H_{\\rm ex} = -2K\\,\\mathbf s_1\\cdot\\mathbf s_2$ (Eq. 15.12), and for $D = 1$, $K = ${d(V.q27InK, 1)}$ the energies are ${d(V.q27ES, 1)}$ and ${d(V.q27ET, 1)}$.`,
    caption: 'the table of σ₁·σ₂: −3 on the singlet, +1 on the three triplets; s₁·s₂ is a quarter of it',
    captionFormal: '$\\boldsymbol\\sigma_1\\cdot\\boldsymbol\\sigma_2$ in the basis $|00\\rangle, |01\\rangle, |10\\rangle, |11\\rangle$; divide by 4 for $\\mathbf s_1\\cdot\\mathbf s_2$',
    stage: mx({
      lin: [
        { c: '+1', src: { pauli: 'XX' } },
        { c: '+1', src: { pauli: 'YY' } },
        { c: '+1', src: { pauli: 'ZZ' } },
      ],
    }),
    claims: [
      claim('q27InK', 'the model exchange integral is K = 0.1', () => close(V.q27InK, 0.1, 1e-12)),
      claim('q27ES', 'the singlet energy is 1.1', () => close(V.q27ES, 1.1, 5e-5)),
      claim('q27ET', 'the triplet energy is 0.9', () => close(V.q27ET, 0.9, 5e-5)),
      claim('q27S1S2Singlet', 's1.s2 is -0.75 on the singlet', () => close(V.q27S1S2Singlet, 0.75, 1e-9) && SIGN.s1s2Singlet < 0),
      claim('q27S1S2Triplet', 's1.s2 is 0.25 on the triplets', () => close(V.q27S1S2Triplet, 0.25, 1e-9)),
    ],
  },
  {
    id: 'q27-dots:b5',
    phase: 'books',
    text:
      `This is the bond gate of Chapter Q19 (<<qc-q19-simulation|Unit 19.5>>): $\\boldsymbol\\sigma_1\\cdot\\boldsymbol\\sigma_2 = 2\\,{\\rm SWAP} - I$. Keep the coupling on for the right time and the spins swap. ` +
      `Half that time gives the [[qc-sqrt-swap|square root of SWAP]]. Afterwards $|01\\rangle$ is found as $|10\\rangle$ with chance ${d(V.q27HalfSwapP, 1)}.`,
    formal:
      `A pulse with $\\int 2K\\,dt/\\hbar = \\pi$ gives $U = e^{i\\frac{\\pi}{4}\\boldsymbol\\sigma_1\\cdot\\boldsymbol\\sigma_2} = e^{i\\pi/4}\\,{\\rm SWAP}$ (Eq. 15.13; engine gap $${d(V.q27SwapPulseGap, 0)}$). ` +
      `A pulse of half the angle gives $U = e^{i\\frac{\\pi}{8}\\boldsymbol\\sigma_1\\cdot\\boldsymbol\\sigma_2}$, the book's [[qc-sqrt-swap|$\\sqrt{\\rm SWAP}$]] with its phase $e^{i\\pi/8}$, and $U^2 = e^{i\\pi/4}\\,{\\rm SWAP}$. ` +
      `Rosetta: this is the root with the opposite turn, $e^{i\\pi/8}$ times the inverse of the usual $\\sqrt{\\rm SWAP}$ matrix, and only this one makes Eq. 15.14 exact. ` +
      `The chance of $|01\\rangle \\to |10\\rangle$ is $\\sin^2(\\pi/4) = ${d(V.q27HalfSwapP, 1)}$. The evolution is $e^{-iHt/\\hbar}$; the page's first expression has the opposite sign convention, a slip without effect on Eq. 15.13.`,
    caption: 'a full exchange pulse: |01⟩ becomes |10⟩; a half pulse leaves half and half',
    captionFormal: '$e^{i\\varphi\\,\\boldsymbol\\sigma_1\\cdot\\boldsymbol\\sigma_2/4}$ at $\\varphi = \\pi$ acting on $|01\\rangle$',
    stage: split(circ(C_EX(Math.PI), 1), amp(C_EX(Math.PI), 1, 'probability')),
    claims: [
      claim('q27SwapPulseGap', 'the full pulse is e^{i pi/4} SWAP (max-abs gap)', () => close(V.q27SwapPulseGap, 0, 1e-12)),
      claim('q27HalfSwapP', 'after the half pulse the swap chance is 0.5', () => close(V.q27HalfSwapP, 0.5, 1e-9)),
      claim('q27SqrtSwapSquareGap', 'the half pulse squared is e^{i pi/4} SWAP (max-abs gap)', () => close(V.q27SqrtSwapSquareGap, 0, 1e-12)),
    ],
  },
  {
    id: 'q27-dots:b6',
    phase: 'books',
    text:
      `Half a swap is entangling. Put one-qubit turns around two half swaps and the result is exactly CZ, the controlled-phase gate. We checked Eq. 15.14 with matrices, [[global-phase|global phase]] included.`,
    formal:
      `The product $e^{-i\\frac{3\\pi}{4}}\\,e^{i\\frac{\\pi}{4}Z_1}\\,e^{-i\\frac{\\pi}{4}Z_2}\\,\\sqrt{\\rm SWAP}\\,e^{i\\frac{\\pi}{2}Z_1}\\,\\sqrt{\\rm SWAP}$ is CZ (Eq. 15.14, checked on the page image), with $\\sqrt{\\rm SWAP} = e^{i\\frac{\\pi}{8}\\boldsymbol\\sigma_1\\cdot\\boldsymbol\\sigma_2}$ and its phase kept. ` +
      `It equals $\\mathrm{diag}(1, 1, 1, -1)$ to within $${d(V.q27Cz1514Gap, 0)}$ (below $10^{-12}$). On $|{+}{+}\\rangle$ the result has concurrence ${d(V.q27CzDotConc, 0)}.`,
    caption: 'the two half swaps and the turns: the result entangles |++⟩ fully',
    captionFormal: 'the circuit of Eq. 15.14 on $|{+}{+}\\rangle$ and the two-qubit readout',
    stage: split(circ(C_CZD, 5), tq(C_CZD, 5)),
    claims: [
      claim('q27Cz1514Gap', 'Eq. 15.14 holds with the page\'s sqrt(SWAP) phase (max-abs gap)', () => close(V.q27Cz1514Gap, 0, 1e-12)),
      claim('q27CzCircuitGap', 'the drawn circuit equals the product (max-abs gap)', () => close(V.q27CzCircuitGap, 0, 1e-12)),
      claim('q27CzDotConc', 'the finished gate makes |++> maximally entangled, concurrence 1', () => close(V.q27CzDotConc, 1, 1e-9)),
    ],
    derivation: {
      result: '\\mathrm{CZ} = {\\rm diag}(1, 1, 1, -1)',
      ground: [
        {
          tex: '\\sqrt{\\rm SWAP}\\,|00\\rangle \\propto |00\\rangle,\\quad \\sqrt{\\rm SWAP}\\,|11\\rangle \\propto |11\\rangle',
          why: 'A half swap leaves $|00\\rangle$ and $|11\\rangle$ alone, up to a phase, and mixes $|01\\rangle$ with $|10\\rangle$.',
          view: circ(C_CZD, 2),
          viewCaption: 'after the first half swap',
        },
        {
          tex: 'e^{i\\frac{\\pi}{2}Z_1} = iZ_1',
          why: 'Between the two half swaps this turn gives $|01\\rangle$ and $|10\\rangle$ opposite signs, which turns the double mixing into pure phases.',
        },
        {
          tex: '\\mathrm{CZ} = {\\rm diag}(1, 1, 1, -1)',
          why: 'One-qubit $Z$ turns before and after fix every phase except the sign of $|11\\rangle$: that is CZ.',
          view: tq(C_CZD, 5),
          viewCaption: 'the finished gate on |++⟩',
        },
      ],
      formal: [
        {
          tex: '\\frac{(1 + i\\sigma_x)\\,\\sigma_z\\,(1 + i\\sigma_x)}{2} = \\sigma_z',
          why: 'In the block of $|01\\rangle$ and $|10\\rangle$ the half swap is $(1 + i\\sigma_x)/\\sqrt2$ up to a phase, and the sandwich around $\\sigma_z$ gives $\\sigma_z$.',
          view: circ(C_CZD, 2),
          viewCaption: 'after the first half swap',
        },
        {
          tex: '\\mathrm{CZ} = {\\rm diag}(1, 1, 1, -1)',
          why: 'The turns on $Z_1$ and $Z_2$ then fix the remaining phases; the engine gap is below $10^{-12}$.',
          view: tq(C_CZD, 5),
          viewCaption: 'the finished gate on |++⟩',
        },
      ],
    },
  },
  {
    id: 'q27-dots:b7',
    phase: 'clue',
    text: `At what field does a spin qubit's frequency equal the LC circuit's ${d(V.q27F5GHz, 3)} GHz?`,
    formal: `Solve $2\\mu_BB/h = ${d(V.q27F5GHz, 3)}$ GHz for $B$.`,
    caption: 'the two clocks of the first beat: the gap sets the frequency',
    captionFormal: 'two clocks with a gap of one unit',
    stage: ck(2, 1, 90),
    reveal: {
      text: `$B = ${d(V.q27ZeemanB5GHz, 4)}$ T, about twice the ${d(V.q27InB, 1)} T of the first beat.`,
      formal: `$B = hf/2\\mu_B = ${d(V.q27ZeemanB5GHz, 4)}$ T.`,
      caption: 'the same two clocks, tuned: a wider gap',
      captionFormal: 'two clocks with a gap of two units',
      stage: ck(3, 1, 90),
      claims: [
        claim('q27F5GHz', 'the LC circuit of Unit 27.1 rings at 5.305 GHz', () => close(V.q27F5GHz, 5.305, 5e-4)),
        claim('q27ZeemanB5GHz', 'a spin at 5.305 GHz needs 0.1895 T', () => close(V.q27ZeemanB5GHz, 0.1895, 5e-5)),
        claim('q27InB', 'the model field is 0.1 T', () => close(V.q27InB, 0.1, 1e-12)),
      ],
    },
  },
  {
    id: 'q27-dots:b8',
    phase: 'deeper',
    text:
      `Why is a dot one electron in a box? Take a box 100 nm wide and an effective electron mass of ${d(V.q27DotMass, 3)} electron masses (model, ours). The levels are ${d(V.q27DotE1meV, 3)} and ${d(V.q27DotE2meV, 3)} meV, a gap of ${d(V.q27DotGapmeV, 3)} meV, which is ${d(V.q27DotGapK, 1)} K. ` +
      `At 100 mK, $k_{\\rm B}T$ is ${d(V.q27DotKT100mKueV, 1)} $\\mu$eV, so higher orbitals stay empty.`,
    formal:
      `Physics 448's box (<<qc-l13-stationary|Unit 13.8>>) has $E_n = \\frac{n^2h^2}{8m^*L^2}$. Here $E_1 = ${d(V.q27DotE1meV, 4)}$ meV and $E_2 - E_1 = 3E_1 = ${d(V.q27DotGapmeV, 3)}$ meV, which is ${d(V.q27DotGapK, 2)} K, for $L = 100$ nm and $m^* = ${d(V.q27DotMass, 3)}\\,m_e$ (model; the engine's box-energy function). ` +
      `At 100 mK, $k_{\\rm B}T = ${d(V.q27DotKT100mKueV, 3)}\\,\\mu$eV: the book's condition $\\delta U \\gg k_{\\rm B}T$ (p. 292). Coherence times, isotope effects and donor qubits (pp. 295–297) are in the book in words, and we do not repeat them.`,
    caption: 'the two lowest box states',
    captionFormal: 'the box levels $n = 1, 2$ in units with $\\hbar = m = 1$',
    stage: wf(4, [1, 2]),
    claims: [
      claim('q27DotMass', 'the model effective mass is 0.067 electron masses', () => close(V.q27DotMass, 0.067, 1e-12)),
      claim('q27DotE1meV', 'the lowest box level is 0.5612 meV', () => close(V.q27DotE1meV, 0.5612, 5e-5)),
      claim('q27DotE2meV', 'the second box level is 2.245 meV', () => close(V.q27DotE2meV, 2.245, 5e-4)),
      claim('q27DotGapmeV', 'the gap is 1.684 meV', () => close(V.q27DotGapmeV, 1.684, 5e-4)),
      claim('q27DotGapK', 'the gap is 19.54 K', () => close(V.q27DotGapK, 19.54, 5e-3)),
      claim('q27DotKT100mKueV', 'at 100 mK the thermal energy is 8.617 micro-eV', () => close(V.q27DotKT100mKueV, 8.617, 5e-4)),
    ],
  },
]

export const Q27_STORY: Record<string, Beat[]> = {
  'q27-lc': lc,
  'q27-superconductivity': superconductivity,
  'q27-josephson': josephson,
  'q27-transmon': transmon,
  'q27-cqed': cqed,
  'q27-dots': dots,
}

/** Every claim used anywhere in a unit's beats, for Unit.claims (content.test.tsx "claims hold"). */
function allClaims(beats: Beat[]) {
  return beats.flatMap((b) => [...(b.claims ?? []), ...(b.reveal?.claims ?? []), ...(b.derivation?.ground.flatMap((s) => s.claims ?? []) ?? []), ...(b.derivation?.formal?.flatMap((s) => s.claims ?? []) ?? [])])
}
export const Q27_UNIT_CLAIMS_BY_ID: Record<string, ReturnType<typeof allClaims>> = Object.fromEntries(Object.entries(Q27_STORY).map(([id, beats]) => [id, allClaims(beats)]))
