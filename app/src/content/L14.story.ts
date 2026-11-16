/**
 * Lecture 14 scroll story (owner: P). Beats per docs/roles/proposals/P-L14-story.md §1, under the judge's rulings (docs/roles/decisions/448-L14L18.md M1–M7) and the Townsend-pass
 * conventions (docs/roles/decisions/448-townsend.md T1–T11):
 * - M1: Lecture 13's notes teach §13.7 onward, so Units 13.6 (`l13-schrodinger`) and 13.7 (`l13-time`) stay in Lecture 13. This lecture recaps them in one beat each, with the unit named, and
 *   owns only what its own notes add: the discrete and continuous components, the proof that V acts by multiplication, the dispersion route with the comparison to light and the curvature, the
 *   Noether subtlety and the energy-shift argument, and the time-independent equation with stationary states and the interference of two energies.
 * - M2: the Townsend box (old `l13-stationary`) came here as the books-only unit `l14-box`; its projection beat is folded into `l14-stationary:b2` and its oscillating-or-exponential beat is
 *   `l14-stationary:b6`. The unit itself (the infinite well, Example 6.6, the two practice questions) moved on to Lecture 20 as `l20-infinite` (ruling R2 of docs/roles/decisions/448-L19L20.md);
 *   `l14-stationary:b6` ends with a pointer to it.
 * - M3: the plot curves `freeOmega` and `linearOmega` (physics/wave14.ts) are the only stage addition.
 * One track (448): sentences stay ≤ 25 words, symbols are defined before use, link-back beats name the unit they recall and define nothing new. Stage states carry physics inputs only; every number
 * in the prose comes from L14.values.ts and is backed by a keyed claim; clue beats are click-to-reveal and last in their unit; lengths are in ℓ, momenta in ħ/ℓ, times in mℓ²/ħ. A fraction such as
 * one half is never typed in a formula (the number reader would ask for a claim): kinetic energy is written \tfrac{p^2}{2m}.
 */
import type { AmplitudesState, Beat, Claim, ClocksState, PlotState, Ref, Scrub, WavefunctionState } from './schema'
import { V, claim, close, d } from './L14.values'

const sweep = (from: number, to: number): Scrub => ({ from, to })
/** The two phase clocks of Lecture 11: E₊ = 3ε, E₋ = ε, start |+x⟩, time as the angle εt/ħ in degrees. */
const K = (timeDeg: Scrub, o: Omit<ClocksState, 'kind' | 'levels' | 'timeDeg'> = {}): ClocksState => ({ kind: 'clocks', levels: { upper: 3, lower: 1 }, start: '+x', timeDeg, shot: 'K-STD', ...o })
/** A Gaussian packet: ⟨x⟩ = x0, Δx = σ, ⟨p⟩ = p0 (in ħ/ℓ). */
const PK = (x0: Scrub, sigma: Scrub, p0?: Scrub): WavefunctionState['source'] => ({ packet: { x0, sigma, ...(p0 === undefined ? {} : { p0 }) } })
/** A plane wave e^{ipx} and the sum of two. */
const PL = (p: number): WavefunctionState['source'] => ({ plane: { p } })
const TW = (p1: number, p2: number): WavefunctionState['source'] => ({ twoWaves: { p1, p2 } })
const W = (source: WavefunctionState['source'], o: Omit<WavefunctionState, 'kind' | 'source'> = {}): WavefunctionState => ({ kind: 'wavefunction', source, shot: 'W-STD', ...o })
/** Townsend §6.9 with the wall at 0 (his Problem 6.13): a box of width L, level n or an equal pair [n1, n2] (kind wavefunction, source box; ψ = 0 outside the walls). */
const BOX = (L: number, n: number | [number, number]): WavefunctionState['source'] => ({ box: { L, n } })
/** The spin in the middle of the two-bar stand-in: the ket |+x⟩ read along z, drawn as chances. */
const SPIN: AmplitudesState = { kind: 'amplitudes', state: { ket: '+' }, labels: 'spin', mode: 'probability', shot: 'A-BARS' }
/** The dispersion curves of Unit 14.3: ω = k²/2 (ħ = m = 1) with dots at k = 1, 2, 3; and beside it light's ω = |k|, which meets it at k = 2. */
const OMEGA: PlotState = { kind: 'plot', shot: 'P-CURVE', curve: { fn: 'freeOmega', samples: 120 }, markers: [{ x: 1 }, { x: 2 }, { x: 3 }] }
const OMEGA_LIGHT: PlotState = { kind: 'plot', shot: 'P-CURVE', curve: { fn: 'freeOmega', vs: 'linearOmega', samples: 120 }, markers: [{ x: 1 }, { x: 2 }, { x: 3 }] }

const townsend = (where: string, adds: string): Ref => ({ source: 'townsend', where, adds })
const susskind = (where: string, adds: string): Ref => ({ source: 'susskind', where, adds })

/* ---------------------------------------------------------------------------------------------- */
/* l14-components — Components: discrete first, then continuous                                    */
/* ---------------------------------------------------------------------------------------------- */

const components: Beat[] = [
  {
    id: 'l14-components:b1',
    phase: 'lecture',
    text: 'Unit 12.3 gave two sets of components of one ket. For a spin they are $\\psi(a) = \\langle a|\\psi\\rangle$ with $a$ equal to $+$ or $-$. Along a line they are $\\psi(x) = \\langle x|\\psi\\rangle$ for every $x$. The ket is the same kind of object in both, and the sum over $a$ becomes an integral over $x$. At one fixed $x_0$, $\\psi(x_0)$ is a single complex number. This beat defines nothing new.',
    caption: 'two components of a spin above; a whole line of components below',
    stage: { layout: 'split', top: SPIN, bottom: W(PK(0, 1), { show: ['re', 'im'] }) },
  },
  {
    id: 'l14-components:b2',
    phase: 'lecture',
    text: `A chance is $|\\psi(a)|^2$. Along a line, $|\\psi(x_0)|^2\\,dx$ is the chance of finding the particle in a thin stretch $dx$ at $x_0$. So $|\\psi|^2$ is a density, not a chance. Cut $[-8, 8]$ into 16 equal cells for the packet with $\\sigma = 1\\,\\ell$ (the unit packet). The cell from 0 to 1 holds ${d(V.l14Cell16, 3)}, and the 16 chances add up to ${d(V.l14CellsSum, 0)}. With 512 cells, a cell's chance divided by its width settles at ${d(V.l14Cell512Dens, 3)} per $\\ell$: the density.`,
    caption: 'sixteen cells: each bar is a chance, and all the bars together make one',
    stage: W(PK(0, 1), { cells: 16, readouts: ['cell'] }),
    claims: [
      claim('l14Cell16', 'the cell [0, 1) of sixteen holds 0.341', () => close(V.l14Cell16, 0.3413, 5e-4)),
      claim('l14CellsSum', 'the sixteen chances add to 1', () => close(V.l14CellsSum, 1, 1e-9)),
      claim('l14Cell512Dens', 'with 512 cells the chance divided by the width is 0.399 per ℓ', () => close(V.l14Cell512Dens, 0.3989, 5e-4)),
    ],
  },
  {
    id: 'l14-components:b3',
    phase: 'lecture',
    text: `The position kets $|x\\rangle$ cannot be [[normalized|normalised]], so the function $\\psi(x)$ carries a unit: the inverse square root of a length. For $\\sigma = 1\\,\\ell$ the peak of $|\\psi|$ is ${d(V.l14AmpUnit, 3)} in that unit. This is bookkeeping, and a graph reads the same without it.`,
    caption: 'the peak readout is the density; $|\\psi|$ is its square root',
    stage: W(PK(0, 1), { show: ['re', 'density'], readouts: ['peak'] }),
    claims: [claim('l14AmpUnit', 'the peak of |ψ| for σ = 1 is 0.632 per root-ℓ', () => close(V.l14AmpUnit, 0.6316, 5e-4))],
  },
  {
    id: 'l14-components:b4',
    phase: 'books',
    text: 'Townsend §6.11 (pp. 234–235, Eqs. 6.150–6.155) puts this in general form. Let $A$ be an observable whose eigenvalue $a$ is continuous. The chance that $A$ lies in a thin stretch $da$ is $|\\langle a|\\psi\\rangle|^2\\,da$, and these chances integrate to 1. Position, with $a = x$, is the example of this lecture.',
    caption: 'sixteen cells again: for any observable with a continuous eigenvalue, the area under $|\\langle a|\\psi\\rangle|^2$ is a chance',
    stage: W(PK(0, 1), { cells: 16 }),
    refs: [townsend('§6.11, pp. 234–235 (Eqs. 6.150–6.155)', 'For an observable with a continuous eigenvalue $a$, the chance of finding it in a thin stretch $da$ is $|\\langle a|\\psi\\rangle|^2\\,da$.')],
  },
  {
    id: 'l14-components:b5',
    phase: 'clue',
    text: `If the density at $x = 0$ is ${d(V.l14Cell512Dens, 3)} per $\\ell$, what is the chance of finding the particle exactly at $x = 0$?`,
    stage: W(PK(0, 1), { cells: 512, readouts: ['cell'] }),
    reveal: {
      text: `Zero. Only stretches have chances. A cell of width $\\ell/32$ at the centre holds ${d(V.l14Cell512, 4)}, and a narrower cell holds proportionally less.`,
      caption: 'five hundred and twelve cells: the bars are thin and the chance in each is tiny',
      stage: W(PK(0, 1), { cells: 512, readouts: ['cell'] }),
      claims: [claim('l14Cell512', 'the cell [0, ℓ/32) holds 0.0125', () => close(V.l14Cell512, 0.01246, 5e-5))],
    },
  },
]

/* ---------------------------------------------------------------------------------------------- */
/* l14-schrodinger — The Schrödinger equation: what is assumed and what is proved                  */
/* ---------------------------------------------------------------------------------------------- */

const schrodinger: Beat[] = [
  {
    id: 'l14-schrodinger:b1',
    phase: 'lecture',
    text: `Unit 13.6 wrote the law in the position basis for $H = \\tfrac{\\hat p^2}{2m} + V(\\hat x)$. This lecture asks what that choice assumes. The classical energy suggests the operators, but it does not prove that every classical expression has one quantum version. For a packet with $p_0 = 3$ and $\\sigma = 1\\,\\ell$ (with $\\hbar = m = 1$), the mean kinetic energy is ${d(V.l14TkinP0, 3)}. The mean momentum gives ${d(V.l14TkinMean, 1)}. The spread $\\Delta p = \\hbar/2\\sigma = ${d(V.l14DpP0, 1)}$ adds ${d(V.l14TkinSpread, 3)}.`,
    caption: 'a packet with mean momentum 3: the momentum panel gives the mean and the spread behind its kinetic energy',
    stage: W(PK(0, 1, 3), { panels: ['position', 'momentum'], readouts: ['pmean', 'pspread'] }),
    claims: [
      claim('l14TkinP0', 'the mean kinetic energy ⟨p̂²/2m⟩ of the p₀ = 3, σ = 1 packet is 4.625', () => close(V.l14TkinP0, 4.625, 1e-9)),
      claim('l14TkinMean', 'p₀²/2m is 4.5', () => close(V.l14TkinMean, 4.5, 1e-9)),
      claim('l14DpP0', 'the spread of momentum Δp = ħ/2σ is 0.5', () => close(V.l14DpP0, 0.5, 1e-9)),
      claim('l14TkinSpread', 'and (Δp)²/2m is 0.125', () => close(V.l14TkinSpread, 0.125, 1e-9)),
    ],
  },
  {
    id: 'l14-schrodinger:b2',
    phase: 'lecture',
    text: `Why $V$ simply multiplies. In $V(\\hat x)$ the argument is an operator, but in $V(x)$ it is an ordinary number. A position ket is an eigenket of $\\hat x$, so it is an eigenket of every function of $\\hat x$. The potential is real, so $V(\\hat x)$ is Hermitian, and the adjoint gives $\\langle x|V(\\hat x) = V(x)\\langle x|$. For $V = \\tfrac{x^2}{2}$ and a packet centred at $x_0 = 2\\,\\ell$, the mean potential energy is ${d(V.l14VMean, 1)}.`,
    caption: 'the packet at 2 with $\\hat x\\psi$ dashed: the operator multiplies the function by $x$',
    stage: W(PK(2, 1), { overlay: ['xpsi'], show: ['re', 'density'] }),
    derivation: {
      result: '\\langle x|V(\\hat x)|\\psi\\rangle = V(x)\\,\\psi(x)',
      ground: [
        {
          tex: '\\hat x|x\\rangle = x|x\\rangle',
          why: 'A position ket is an eigenket of the position operator, with the number $x$ as its eigenvalue.',
          view: W(PK(2, 1), { overlay: ['xpsi'], show: ['re', 'density'] }),
          viewCaption: 'the dashed curve is $x$ times the function',
        },
        {
          tex: 'V(\\hat x)|x\\rangle = V(x)|x\\rangle',
          why: 'A function of $\\hat x$ acts on its eigenket by the same function of the eigenvalue.',
        },
        {
          tex: '\\langle x|V(\\hat x) = V(x)\\langle x|',
          why: 'The potential is real, so $V(\\hat x)$ is Hermitian. Take the adjoint of the line above; the real number $V(x)$ is unchanged.',
        },
        {
          tex: '\\langle x|V(\\hat x)|\\psi\\rangle = V(x)\\,\\psi(x)',
          why: 'Close the bra on the ket: $\\langle x|\\psi\\rangle$ is $\\psi(x)$.',
          view: W(PK(2, 1), { show: ['density'], readouts: ['xmean', 'xspread'] }),
          viewCaption: 'the density that weights $V(x)$ when the mean potential is taken',
        },
      ],
    },
    claims: [claim('l14VMean', 'for V = x²/2 and a packet at 2 the mean potential energy is 2.5', () => close(V.l14VMean, 2.5, 1e-9))],
  },
  {
    id: 'l14-schrodinger:b3',
    phase: 'lecture',
    text: 'What permits each step. The kets $|x\\rangle$ do not change with time, so $\\langle x|$ slips past $d/dt$, and the derivative becomes partial because $x$ is held fixed. The bra may pass through $V(\\hat x)$ but not through all of $H$, because $\\hat p$ mixes neighbouring points. The same step works for $V(x,t)$ at each fixed time, and fails for a potential that also depends on momentum. For a $V$ that changes with time, the factor $e^{-iHt/\\hbar}$ no longer gives the evolution.',
    caption: 'the same free packet in both representations while time runs: only the position curve moves',
    stage: W(PK(0, 1, 3), { time: sweep(0, 2), panels: ['position', 'momentum'] }),
  },
  {
    id: 'l14-schrodinger:b4',
    phase: 'lecture',
    text: 'Synthesis. Nothing is added to the dynamics here. The differential equation is the first law, $i\\hbar\\,d|\\psi\\rangle/dt = H|\\psi\\rangle$, expressed in the position basis for a single Hamiltonian. The wavefunction $\\psi(x,t)$ holds the amplitudes for where the particle will be found. It is neither a displacement nor an object beside the ket. The scope is one spinless particle, nonrelativistic, in a local scalar potential; spin, several particles and relativity call for other Hamiltonians.',
    caption: 'the density of the free packet moves and widens: the amplitudes change, there is no second object',
    stage: W(PK(0, 1, 3), { time: sweep(0, 2), show: ['density'] }),
  },
  {
    id: 'l14-schrodinger:b5',
    phase: 'books',
    text: 'Townsend §6.8 (pp. 213–214, Eqs. 6.78–6.81) makes the same projection. He writes the potential step as $\\langle x|V(\\hat x) = \\langle x|V(x)$ in Eq. 6.79 and reaches the time-dependent equation in Eq. 6.81. In §6.11 (p. 236, Eq. 6.168) he lists the Hamiltonian $\\tfrac{\\hat p^2}{2m} + V$ as the one assumed for a particle on a line.',
    caption: 'the free packet again: this is the equation of Eq. 6.81 with $V = 0$',
    stage: W(PK(0, 1, 3), { time: sweep(0, 2) }),
    refs: [townsend('§6.8, pp. 213–214 (Eqs. 6.78–6.81); §6.11, p. 236 (Eq. 6.168)', 'Projecting the law on $\\langle x|$, with $\\langle x|V(\\hat x) = \\langle x|V(x)$, gives the time-dependent equation; the Hamiltonian is $\\hat p^2/2m + V$.')],
  },
  {
    id: 'l14-schrodinger:b6',
    phase: 'clue',
    text: 'Why may $\\langle x|$ pass through $V(\\hat x)$ but not through the whole Hamiltonian?',
    stage: W(PK(2, 1), { overlay: ['xpsi'] }),
    reveal: {
      text: 'The ket $|x\\rangle$ is an eigenket of $V(\\hat x)$, which only multiplies by a number. But $\\hat p$ is a derivative: it mixes neighbouring points, so $|x\\rangle$ is not an eigenket of $H$.',
      caption: 'now $\\hat p\\psi$ is added, dashed: it depends on how the function changes from point to point',
      stage: W(PK(2, 1), { overlay: ['xpsi', 'ppsi'] }),
    },
  },
]

/* ---------------------------------------------------------------------------------------------- */
/* l14-dispersion — From matter-wave dispersion to the equation                                     */
/* ---------------------------------------------------------------------------------------------- */

const dispersion: Beat[] = [
  {
    id: 'l14-dispersion:b1',
    phase: 'lecture',
    text: `Reverse the reasoning and begin with a prediction. For a plane-wave component, $p = \\hbar k$ and $E = \\hbar\\omega$, and a free particle has $E = \\tfrac{p^2}{2m}$. So $\\hbar\\omega = \\tfrac{(\\hbar k)^2}{2m}$, the [[dispersion-relation|dispersion relation]] $\\omega(k) = \\tfrac{\\hbar k^2}{2m}$. For $\\hbar = m = 1$, $\\omega(3)$ is ${d(V.l14Omega3, 1)}. Doubling $k$ multiplies $\\omega$ by ${d(V.l14OmegaDouble, 0)}.`,
    caption: 'frequency against wave number: a parabola, so shorter waves turn much faster',
    stage: OMEGA,
    introduces: ['dispersion-relation'],
    fidelity: ['plot-free-omega'],
    claims: [
      claim('l14Omega3', 'ω(3) = 4.5 for ħ = m = 1', () => close(V.l14Omega3, 4.5, 1e-9)),
      claim('l14OmegaDouble', 'doubling k multiplies ω by 4', () => close(V.l14OmegaDouble, 4, 1e-9)),
    ],
  },
  {
    id: 'l14-dispersion:b2',
    phase: 'lecture',
    text: 'Unit 13.6 started from a plane wave and checked that it obeys the free equation. Now run it the other way, from $\\omega(k)$ to the equation. What can be done to a wave to read off $\\omega$ and $k^2$? Take one component $\\psi_k = Ae^{i(kx-\\omega t)}$. A time derivative brings down $-i\\omega$, and two space derivatives bring down $-k^2$. The simplest linear, local equation that matches $\\omega = \\hbar k^2/2m$ pairs the first with the second. Multiplying by $\\hbar$ gives the free Schrödinger equation.',
    caption: 'a plane wave with $p = 3$ while time runs: the pattern of the phase slides to the right',
    stage: W(PL(3), { time: sweep(0, 1), show: ['re', 'im', 'phase'] }),
  },
  {
    id: 'l14-dispersion:b3',
    phase: 'lecture',
    text: `Light is different. In empty space its dispersion relation is $\\omega = c|k|$, so $\\omega^2 = c^2k^2$, which suggests $\\partial_t^2E = c^2\\partial_x^2E$, the second-order equation that follows from Maxwell's first-order pair. The curves differ: doubling $k$ multiplies light's $\\omega$ by ${d(V.l14OmegaLightDouble, 0)} but a matter wave's by ${d(V.l14OmegaDouble, 0)}. A linear relation does not force the order, either: one right-moving branch also obeys the first-order equation $(\\partial_t + c\\,\\partial_x)E = 0$. The comparison is between dispersion relations, not between counts of derivatives.`,
    caption: 'the parabola of a matter wave and the line of light cross at $k = 2$',
    stage: OMEGA_LIGHT,
    fidelity: ['plot-free-omega'],
    claims: [claim('l14OmegaLightDouble', 'doubling k multiplies light’s ω by 2', () => close(V.l14OmegaLightDouble, 2, 1e-9))],
  },
  {
    id: 'l14-dispersion:b4',
    phase: 'lecture',
    text: `Curvature and kinetic energy. For a sinusoid, $\\partial_x^2\\psi_k = -k^2\\psi_k$: the [[curvature|curvature]] is $-k^2$ times the function, which is minus ${d(V.l14Curv3Mag, 0)} times for $k = 3$. Faster oscillation means a larger $k^2$ and so a larger $\\tfrac{p^2}{2m}$. In general $\\langle\\hat p^2\\rangle = \\hbar^2\\int|\\psi'|^2\\,dx$, the area under the squared slope. Squeeze the packet from $\\sigma = 1$ to $\\sigma = 0.5$: $\\Delta p$ doubles and the mean kinetic energy goes from ${d(V.l14GaussT1, 3)} to ${d(V.l14GaussTHalf, 1)}, ${d(V.l14GaussTRatio, 0)} times as large. This is true component by component; it is not a kinetic-energy density at each point.`,
    caption: 'the narrower packet has the wider momentum curve, so the kinetic energy is larger',
    stage: W(PK(0, 0.5), { panels: ['position', 'momentum'], readouts: ['pspread'] }),
    claims: [
      claim('l14Curv3Mag', 'for k = 3 the curvature of a plane wave is −9 times the function', () => close(V.l14Curv3Mag, 9, 1e-9)),
      claim('l14GaussT1', 'the σ = 1 packet has mean kinetic energy 0.125', () => close(V.l14GaussT1, 0.125, 1e-9)),
      claim('l14GaussTHalf', 'the σ = 0.5 packet has 0.5', () => close(V.l14GaussTHalf, 0.5, 1e-9)),
      claim('l14GaussTRatio', 'four times as much', () => close(V.l14GaussTRatio, 4, 1e-9)),
    ],
  },
  {
    id: 'l14-dispersion:b5',
    phase: 'lecture',
    text: 'Why does this work for a packet? A packet is a sum of plane waves, $\\psi = \\int dk\\,A(k)\\,e^{i[kx - \\omega(k)t]}$. Each term solves the free equation, and the equation is linear, so the sum solves it. A finite-difference check on the waves $p = 2$ and $p = 4$ added together agrees with the equation to better than one part in a million. What is derived and what is assumed: the term $V\\psi$ comes from Unit 14.2, and the curvature argument works component by component. How fast the envelope travels is the next lecture.',
    caption: 'two waves added: the density has fringes that move, and the equation holds for the sum',
    stage: W(TW(2, 4), { time: sweep(0, 2), show: ['re', 'density'] }),
    claims: [claim('l14TwoWaveOk', 'the free equation holds for p = 2 and 4 added, to 1e−6 on a finite-difference stencil (a check, not shown)', () => V.l14TwoWaveOk === 1)],
  },
  {
    id: 'l14-dispersion:b6',
    phase: 'books',
    text: 'Susskind and Friedman, Lecture 9, §9.1–9.2, compare two Hamiltonians. With $H = c\\hat p$ the equation is first order and every component moves at the same speed $c$, so the shape never changes. With $H = \\tfrac{\\hat p^2}{2m}$ the components move at different speeds, so a free packet travels and spreads.',
    caption: 'a free packet with $p_0 = 1.5$ travels and widens',
    stage: W(PK(0, 1, 1.5), { time: sweep(0, 4) }),
    refs: [susskind('Lecture 9, §9.1–9.2', 'A first-order equation with $H = c\\hat p$ keeps the shape; $H = \\hat p^2/2m$ gives packets that move and spread.')],
    claims: [claim('l14MeanP15', 'the packet’s mean momentum is 1.5', () => close(V.l14MeanP15, 1.5, 1e-9))],
  },
  {
    id: 'l14-dispersion:b7',
    phase: 'clue',
    text: 'A matter wave has twice the wave number. By what factor is its frequency larger? And for light?',
    stage: OMEGA,
    reveal: {
      text: `Four for a matter wave, since $\\omega\\propto k^2$, and two for light, since $\\omega\\propto|k|$.`,
      caption: 'the parabola and the line: at $k = 3$ the parabola is already above the line',
      stage: OMEGA_LIGHT,
      claims: [claim('l14OmegaDouble', 'four for a matter wave', () => close(V.l14OmegaDouble, 4, 1e-9)), claim('l14OmegaLightDouble', 'two for light', () => close(V.l14OmegaLightDouble, 2, 1e-9))],
    },
  },
]

/* ---------------------------------------------------------------------------------------------- */
/* l14-time — Time as a parameter, and no operator that shifts energies                             */
/* ---------------------------------------------------------------------------------------------- */

const time: Beat[] = [
  {
    id: 'l14-time:b1',
    phase: 'lecture',
    text: 'Unit 13.7 said the experimenter fixes the time with a clock, and the state gives the chances of positions at that time. The new notes set the two generators side by side. The shift $T(a) = e^{-ia\\hat p/\\hbar}$ has the distance $a$ as its parameter and $\\hat p$ as its generator. The evolution $U(\\tau) = e^{-iH\\tau/\\hbar}$ has the duration $\\tau$ and $H$. In each, the parameter need not be an observable of the system.',
    caption: 'a shift in space above and a wait in time below: two unitary maps with a parameter that is not an observable',
    stage: { layout: 'split', top: W(PK(0, 1), { shift: sweep(0, 3) }), bottom: K(sweep(0, 90)) },
  },
  {
    id: 'l14-time:b2',
    phase: 'lecture',
    text: `What Noether's theorem says. A law unchanged by shifts in space conserves momentum, and a law unchanged by shifts in time conserves energy. A Hamiltonian that depends explicitly on $t$ need not conserve energy, yet it still generates the evolution, through a time-ordered product instead of one exponential. A shift in space exists even where $V$ breaks the symmetry. So a generator and a conserved generator are related but distinct. Take a free packet with mean momentum ${d(V.l14MeanP15, 1)}. Shift it by 3 then wait 2, or wait 2 then shift by 3: its centre is at ${d(V.l14ShiftThenWait, 1)} either way. <<sl-q24-rabi|Go further in 709: a driven spin does not conserve energy>>`,
    caption: 'the packet shifted by 3 and left to run: the order of shifting and waiting makes no difference',
    stage: W(PK(0, 1, 1.5), { shift: 3, time: sweep(0, 2), readouts: ['xmean'] }),
    claims: [
      claim('l14MeanP15', 'the packet’s mean momentum is 1.5', () => close(V.l14MeanP15, 1.5, 1e-9)),
      claim('l14ShiftThenWait', 'shift by 3 then wait 2 puts the centre at 6', () => close(V.l14ShiftThenWait, 6, 1e-9)),
      claim('l14WaitThenShift', 'wait 2 then shift by 3 puts it at 6 as well', () => close(V.l14WaitThenShift, 6, 1e-9)),
    ],
  },
  {
    id: 'l14-time:b3',
    phase: 'lecture',
    text: `Now the objection that time could still be an operator. Unit 13.7 showed that $[\\hat t,H] = i\\hbar$ would give $W(\\epsilon)HW(\\epsilon)^\\dagger = H + \\epsilon$ for every real $\\epsilon$, and the spectrum would have no floor. The notes write the unitary $\\hat V(\\epsilon)$; here it is $W(\\epsilon)$, because $V$ is the potential. Time evolution does something different: $c_E(t) = e^{-iEt/\\hbar}c_E(0)$ keeps each size and only turns each phase. With energies $3\\epsilon$ and $\\epsilon$, the two hands are $${d(V.l14ClockGap90, 0)}^\\circ$ apart once $\\epsilon t/\\hbar$ reaches $45^\\circ$. Here $\\epsilon$ is the clocks’ energy unit, not the shift above. So the $t$ in $\\psi(x,t)$ stays an outside parameter that labels the state. What the argument excludes is only an unrestricted self-adjoint $\\hat t$ for a Hamiltonian with a lowest energy. A clock inside a larger system, or a time of arrival, escapes it. Nor does it merely move the zero of energy: $W$ would have to shift the spectrum of one fixed system.`,
    caption: 'the phase clocks: the hands turn at different rates, but each keeps its length',
    stage: K(sweep(0, 45), { show: ['clocks', 'gap'] }),
    claims: [claim('l14ClockGap90', 'with energies 3ε and ε the hands are 90° apart at εt/ħ = 45°', () => close(V.l14ClockGap90, 90, 1e-9))],
  },
  {
    id: 'l14-time:b4',
    phase: 'clue',
    text: 'Is energy conserved if $H$ depends on $t$, and does $H$ still generate the evolution?',
    stage: K(sweep(0, 90)),
    reveal: {
      text: 'Evolution yes, conservation no. The generator acts at each instant, but energy is conserved only when $H$ does not depend on time. A driven spin gains and loses energy (Unit 12.7).',
      caption: 'two clocks standing in for a driven pair: the hands still turn, though the energies are not fixed',
      stage: K(sweep(0, 90), { show: ['clocks', 'gap'] }),
    },
  },
]

/* ---------------------------------------------------------------------------------------------- */
/* l14-stationary — Energy eigenstates and the time-independent equation                            */
/* ---------------------------------------------------------------------------------------------- */

const stationary: Beat[] = [
  {
    id: 'l14-stationary:b1',
    phase: 'lecture',
    text: `Start from an energy eigenket of a time-independent $H$: $H|E\\rangle = E|E\\rangle$, so $|\\psi(t)\\rangle = e^{-iEt/\\hbar}|E\\rangle$ (Unit 11.5, Unit 12.1). Write $\\varphi_E(x) = \\langle x|E\\rangle$, the [[energy-eigenfunction|energy eigenfunction]]. Energy already has a definition, as an eigenvalue, so this is not a separation of variables with an unknown constant. Level 2 of a box of width 4 (with $\\hbar = m = 1$) has $E = ${d(V.l14BoxE2, 3)}$.`,
    caption: 'level 2 of a box of width 4: the real part is a function of $x$, the imaginary part is zero',
    stage: W(BOX(4, 2), { show: ['re', 'im'], readouts: ['energy'] }),
    claims: [claim('l14BoxE2', 'level 2 of a box of width 4 has E = 1.234', () => close(V.l14BoxE2, 1.2337, 5e-4))],
  },
  {
    id: 'l14-stationary:b2',
    phase: 'lecture',
    text: 'Project $H|E\\rangle = E|E\\rangle$ on $\\langle x|$. The kinetic part gives $-\\hbar^2\\varphi_E\'\'$ divided by $2m$, and the potential multiplies. The result is the [[time-independent-schrodinger|time-independent Schrödinger equation]], an ordinary differential equation in $x$. A level of the box obeys it to rounding error on the grid. Townsend §6.8 (pp. 213–214, Eqs. 6.82–6.86) reaches the same equation by letting the time factor split off.',
    caption: 'level 2: the second derivative of the real part is a fixed multiple of the function itself',
    stage: W(BOX(4, 2), { show: ['re'] }),
    refs: [townsend('§6.8, pp. 213–214 (Eqs. 6.82–6.86)', 'For one energy the time factor splits off and what is left is an ordinary equation in $x$. Townsend names the function $\\psi_E(x)$ and then drops the subscript.')],
    derivation: {
      result: '\\left[-\\tfrac{\\hbar^2}{2m}\\tfrac{d^2}{dx^2} + V(x)\\right]\\varphi_E = E\\varphi_E',
      ground: [
        {
          tex: 'H|E\\rangle = E|E\\rangle',
          why: 'The definition of an energy eigenket; the energy is its eigenvalue.',
          view: W(BOX(4, 2), { show: ['re'], readouts: ['energy'] }),
          viewCaption: 'level 2 and its energy',
        },
        {
          tex: '\\langle x|H|E\\rangle = E\\langle x|E\\rangle',
          why: 'Multiply on the left by the bra $\\langle x|$. The number $E$ comes out.',
        },
        {
          tex: '\\langle x|\\hat p^2|E\\rangle = -\\hbar^2\\varphi_E\'\',\\qquad \\langle x|V|E\\rangle = V\\varphi_E',
          why: 'Apply $-i\\hbar\\,d/dx$ twice; the potential multiplies, as in Unit 14.2.',
        },
        {
          tex: '\\left[-\\tfrac{\\hbar^2}{2m}\\tfrac{d^2}{dx^2} + V(x)\\right]\\varphi_E = E\\varphi_E',
          why: 'Put the kinetic part, divided by $2m$, and the potential part together.',
          view: W(BOX(4, 2), { show: ['re'], panels: ['position', 'momentum'] }),
          viewCaption: 'the same level in momentum as well',
        },
      ],
    },
    claims: [claim('l14BoxTiseOk', 'level 2 of the box satisfies −φ″/2 = Eφ on the grid to 1e−6 (a check, not shown)', () => V.l14BoxTiseOk === 1)],
  },
  {
    id: 'l14-stationary:b3',
    phase: 'lecture',
    text: `What "stationary" means. With $\\psi(x,t) = e^{-iEt/\\hbar}\\varphi_E(x)$ the phase keeps turning, but $|\\psi|^2 = |\\varphi_E|^2$ does not move. Level 1 of the box of width 4 has $E_1 = ${d(V.l14BoxE1, 3)}$, and its density at $t = 4$ is the same as at $t = 0$ to rounding error. Stationary does not mean that the particle sits still at a point.`,
    caption: 'level 1 while time runs: the colour band of the phase changes, the density does not',
    stage: W(BOX(4, 1), { time: sweep(0, 4), show: ['density', 'phase'], readouts: ['energy'] }),
    claims: [
      claim('l14BoxE1', 'level 1 of a box of width 4 has E₁ = 0.308', () => close(V.l14BoxE1, 0.3084, 5e-4)),
      claim('l14StationaryDrift', 'the density at t = 4 equals the density at t = 0 (drift is rounding-sized)', () => V.l14StationaryDrift < 1e-12),
    ],
  },
  {
    id: 'l14-stationary:b4',
    phase: 'lecture',
    text: `A [[superposition|superposition]] of two energies is not stationary. Take $\\psi = c_1e^{-iE_1t/\\hbar}\\varphi_1 + c_2e^{-iE_2t/\\hbar}\\varphi_2$. Then $|\\psi|^2$ has two time-independent terms and a cross term that turns at $(E_2 - E_1)/\\hbar$. Take levels 1 and 2 of the box of width 4, with equal weights, at $x = 1$. The direct terms add to ${d(V.l14SloshMean, 3)}, and the cross term swings by $\\pm${d(V.l14CrossAmp, 3)}$. The density runs from ${d(V.l14SloshD0, 3)} down to ${d(V.l14SloshDHalf, 4)} in half the period ${d(V.l14SloshPeriod, 2)}.`,
    caption: 'levels 1 and 2 together: the density sloshes from one side of the box to the other',
    stage: W(BOX(4, [1, 2]), { time: sweep(0, 6.8), show: ['density'] }),
    derivation: {
      result: '|\\psi|^2 = |c_1\\varphi_1|^2 + |c_2\\varphi_2|^2 + 2\\,\\mathrm{Re}\\!\\left[c_1^*c_2\\varphi_1^*\\varphi_2\\,e^{-i(E_2 - E_1)t/\\hbar}\\right]',
      ground: [
        {
          tex: '\\psi = c_1e^{-iE_1t/\\hbar}\\varphi_1 + c_2e^{-iE_2t/\\hbar}\\varphi_2',
          why: 'Each energy component turns by its own phase.',
          view: W(BOX(4, 1), { show: ['density'] }),
          viewCaption: 'level 1 alone: a fixed density',
        },
        {
          tex: '|\\psi|^2 = (\\psi_1 + \\psi_2)^*(\\psi_1 + \\psi_2)',
          why: 'The density is the state times its conjugate, with $\\psi_1$ and $\\psi_2$ the two terms.',
        },
        {
          tex: '|\\psi_1|^2 + |\\psi_2|^2 = |c_1\\varphi_1|^2 + |c_2\\varphi_2|^2',
          why: 'The two direct terms lose their phases when squared, so they do not depend on $t$.',
        },
        {
          tex: '|\\psi|^2 = |c_1\\varphi_1|^2 + |c_2\\varphi_2|^2 + 2\\,\\mathrm{Re}\\!\\left[c_1^*c_2\\varphi_1^*\\varphi_2\\,e^{-i(E_2 - E_1)t/\\hbar}\\right]',
          why: 'The two cross terms are conjugates, so together they are twice a real part. It keeps the difference of the two phases, which turns at $(E_2 - E_1)/\\hbar$.',
          view: W(BOX(4, [1, 2]), { time: sweep(0, 6.8), show: ['density'] }),
          viewCaption: 'both levels while time runs',
          claims: [
            claim('l14SloshMean', 'at x = 1 the two direct terms add to 0.375', () => close(V.l14SloshMean, 0.375, 1e-9)),
            claim('l14CrossAmp', 'and the cross term swings by ±0.354', () => close(V.l14CrossAmp, 0.3536, 5e-4)),
          ],
        },
      ],
    },
    claims: [
      claim('l14SloshD0', 'the density at x = 1 starts at 0.729', () => close(V.l14SloshD0, 0.7286, 5e-4)),
      claim('l14SloshDHalf', 'and falls to 0.0214 at half the period', () => close(V.l14SloshDHalf, 0.0214, 5e-5)),
      claim('l14SloshPeriod', 'the period 2π/(E₂ − E₁) is 6.79', () => close(V.l14SloshPeriod, 6.79, 5e-3)),
    ],
  },
  {
    id: 'l14-stationary:b5',
    phase: 'lecture',
    text: 'Consolidation, in three connections. First, $\\psi(x,t) = \\langle x|\\psi(t)\\rangle$, with $\\hat x = x$ and $\\hat p = -i\\hbar\\,\\partial_x$. Second, the law becomes $i\\hbar\\,\\partial_t\\psi = \\left[-\\tfrac{\\hbar^2}{2m}\\partial_x^2 + V\\right]\\psi$. Third, $H|E\\rangle = E|E\\rangle$ becomes the time-independent equation. The Hamiltonian generates time shifts without any universal operator that shifts energies. The time-independent equation gives the shape of an energy state; the time-dependent one governs every state.',
    caption: 'the box mix above and the phase clocks below: the density moves because two phases turn at different rates',
    stage: { layout: 'split', top: W(BOX(4, [1, 2]), { time: sweep(0, 6.8), show: ['density'] }), bottom: K(sweep(0, 90)) },
  },
  {
    id: 'l14-stationary:b6',
    phase: 'books',
    text: `Where $E > V$ the curvature has the opposite sign to the function, so it oscillates: $\\varphi'' = -k^2(x)\\,\\varphi$ with $k^2 = 2m(E - V)/\\hbar^2$ (Townsend §6.8, pp. 217–218, Eq. 6.97). The larger $E - V$ is, the faster it oscillates. Where $E < V$ the curvature has the same sign and the function is exponential: $\\varphi'' = q^2(x)\\,\\varphi$ (Eq. 6.98). At a finite jump of $V$ the function and its slope stay continuous. The slope may jump only where $V$ is infinite (Eq. 6.96). For a particle held between walls, a function that stays finite fits only at special energies, which are therefore quantised. Level $n$ has $n - 1$ [[node|nodes]]: level 4 of a box has ${d(V.l14TBoxNodes4, 0)}. The box itself is solved in Lecture 20.`,
    caption: 'level 4 of a box: three nodes inside the walls, and every hump is curved back down toward the zero line',
    stage: W(BOX(4, 4), { show: ['re'], readouts: ['energy'] }),
    refs: [townsend('§6.8, pp. 214–218 (Eqs. 6.96–6.98, Figs. 6.8–6.9)', 'Where $E > V$ the function oscillates, where $E < V$ it is exponential; only special energies match, and the number of nodes grows with the energy.')],
    claims: [claim('l14TBoxNodes4', 'level 4 of the box has 3 nodes (counted on the grid)', () => V.l14TBoxNodes4 === 3)],
  },
  {
    id: 'l14-stationary:b7',
    phase: 'clue',
    text: 'In a stationary state "nothing changes". What does keep changing?',
    stage: W(BOX(4, 1), { show: ['re', 'im', 'phase'] }),
    reveal: {
      text: `The phase of $\\psi$. At the centre of the box of width 4, level 1 has turned back through ${d(V.l14PhaseTurnDegMag, 1)}$^\\circ$ by $t = 4$, while the density has not changed.`,
      caption: 'level 1 at $t = 4$: the real and imaginary parts have swapped shares, the density has not',
      stage: W(BOX(4, 1), { show: ['re', 'im', 'phase'], time: 4 }),
      claims: [claim('l14PhaseTurnDegMag', 'the phase of level 1 has turned through 70.7° by t = 4 (E₁t = 1.234 rad)', () => close(V.l14PhaseTurnDegMag, 70.69, 5e-3))],
    },
  },
]

export const L14_STORY: Record<string, Beat[]> = {
  'l14-components': components,
  'l14-schrodinger': schrodinger,
  'l14-dispersion': dispersion,
  'l14-time': time,
  'l14-stationary': stationary,
}

/** Every claim of a unit's beats, reveals and derivation steps (each unit's `claims`: the number reader backs a unit's prose with it). */
const claimsOf = (beats: Beat[]): Claim[] => beats.flatMap((b) => [...(b.claims ?? []), ...(b.reveal?.claims ?? []), ...(b.derivation?.ground ?? []).flatMap((s) => s.claims ?? [])])
export const L14_UNIT_CLAIMS: Record<string, Claim[]> = Object.fromEntries(Object.entries(L14_STORY).map(([id, beats]) => [id, claimsOf(beats)]))
