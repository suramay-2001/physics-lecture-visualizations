/**
 * Lecture 16 scroll story (owner: P). Beats per docs/roles/proposals/P-L16-story.md §1, under the judge's rulings (docs/roles/decisions/448-L14L18.md M1–M7) and the Townsend-pass
 * conventions (docs/roles/decisions/448-townsend.md T1–T11):
 * - M2: the Townsend spreading beat and its clue (old `l13-schrodinger:b6`, `b7`) and the Ehrenfest beat (old `l13-time:b6a`) moved here as `l16-spread:b6`, `l16-spread:b7` and `l16-ehrenfest:b5`; their keys took
 *   the lecture prefix (`l16FreeDp4`, `l16FreeSd2`, `l16FreeSd4`, `l16SpreadElectronMant`, `l16SpreadElectronLog10`, `l16SpreadMarbleMant`, `l16SpreadMarbleYearsMant`, `l16EhrenfestDpDt`) because the claim lint needs it.
 * - M3: the plot curves `packetWidth` and `packetWidthChirp` are this lecture's stage addition; every other picture is an existing `wavefunction` state.
 * - M4/M5: no new notation; the glossary id `spreading-time` is Lecture 15's and is only reused here. The rate law d⟨A⟩/dt = (i/ħ)⟨[H, A]⟩ stays in Unit 12.1; `l16-ehrenfest:b1` recalls it and defines nothing.
 * - Plan §8 holds: no Correction box. §16.6 of the notes (when the mean motion is classical) is Lecture 17's, so this lecture ends on the two Ehrenfest equations and a hand-off.
 * One track (448): sentences stay ≤ 25 words, symbols are defined before use, link-back beats name the unit they recall and define nothing new. Stage states carry physics inputs only; every number in the prose
 * comes from L16.values.ts and is backed by a keyed claim; clue beats are click-to-reveal and last in their unit (the Go-deeper beat follows them); lengths are in ℓ, momenta in ħ/ℓ, times in mℓ²/ħ. The p₀ = 3
 * packet is run to t = 4 only (its centre reaches 12 inside the 64 ℓ window). A fraction such as one half is never typed with digits where the number reader would ask for a claim.
 */
import type { Beat, Claim, PlotState, Ref, Scrub, WavefunctionState } from './schema'
import { V, claim, close, d } from './L16.values'

const sweep = (from: number, to: number): Scrub => ({ from, to })
/** A Gaussian packet: ⟨x⟩ = x0, Δx = σ, ⟨p⟩ = p0 (in ħ/ℓ). */
const PK = (x0: Scrub, sigma: Scrub, p0?: Scrub): WavefunctionState['source'] => ({ packet: { x0, sigma, ...(p0 === undefined ? {} : { p0 }) } })
const W = (source: WavefunctionState['source'], o: Omit<WavefunctionState, 'kind' | 'source'> = {}): WavefunctionState => ({ kind: 'wavefunction', source, shot: 'W-STD', ...o })
/** The window that holds the p₀ = 3 packet from t = 0 to t = 4 (its centre reaches 12). */
const RUN = { x: [-4, 16] as [number, number] }
/** The width Δx(t) of a free packet with σ = 1: plain, and beside it the chirped packet with β = −0.2 (physics/wave.ts, physics/wave16.ts). */
const WIDTH: PlotState = { kind: 'plot', shot: 'P-CURVE', curve: { fn: 'packetWidth', samples: 120 }, markers: [{ x: 2 }, { x: 4 }] }
const WIDTH_CHIRP: PlotState = { kind: 'plot', shot: 'P-CURVE', curve: { fn: 'packetWidth', vs: 'packetWidthChirp', samples: 120 }, markers: [{ x: 2 }] }

const townsend = (where: string, adds: string): Ref => ({ source: 'townsend', where, adds })
const susskind = (where: string, adds: string): Ref => ({ source: 'susskind', where, adds })

/* ---------------------------------------------------------------------------------------------- */
/* l16-start — A Gaussian packet to evolve                                                         */
/* ---------------------------------------------------------------------------------------------- */

const start: Beat[] = [
  {
    id: 'l16-start:b1',
    phase: 'lecture',
    text: 'Unit 15.3 gave every momentum component of a free packet its own phase, so the momentum chances stay fixed. This beat recalls that and defines nothing new. Yet a packet released from a narrow spot, with every force off, can still change its density. Two questions follow. How much does it spread? And how can a density change when no force acts?',
    caption: 'a packet with mean momentum 3 in both panels: what changes when time runs?',
    stage: W(PK(0, 1, 3), { panels: ['position', 'momentum'], window: RUN }),
  },
  {
    id: 'l16-start:b2',
    phase: 'lecture',
    text: `A free packet can change in two ways. Its centre can move, because its mean momentum $\\langle p\\rangle$ is not zero. And its density can spread, even when $\\langle p\\rangle = 0$. Spreading needs no force: a force would change the mean momentum instead. In the momentum panel nothing moves. For $\\sigma = 1\\,\\ell$ the spread $\\Delta p$ stays at ${d(V.l16Dp1, 1)} $\\hbar/\\ell$ from $t = 0$ to $t = 4$.`,
    caption: 'the position curve changes while the momentum curve does not',
    stage: W(PK(0, 1), { time: sweep(0, 4), panels: ['position', 'momentum'], readouts: ['xmean', 'xspread', 'pspread'] }),
    claims: [
      claim('l16Dp1', 'Δp = 0.5 ħ/ℓ for σ = 1', () => close(V.l16Dp1, 0.5, 1e-9)),
      claim('l16DpFixed', 'Δp at t = 4 equals Δp at t = 0 (a residual of rounding size)', () => Math.abs(V.l16DpFixed) < 1e-12),
    ],
  },
  {
    id: 'l16-start:b3',
    phase: 'lecture',
    text: `Evolve the [[gaussian-packet|Gaussian packet]] of Unit 15.6, $\\psi(x,0) = \\frac{1}{\\sqrt[4]{2\\pi\\sigma^2}}\\,e^{-\\frac{(x-x_0)^2}{4\\sigma^2}}\\,e^{ip_0(x-x_0)/\\hbar}$. Its density is a bell curve of width $\\sigma$ about $x_0$, so $\\langle x\\rangle = x_0$ and $\\Delta x = \\sigma$. The phase sets $\\langle p\\rangle = p_0$. Unit 13.4 found that a bell curve in position gives a bell curve in momentum, so $\\Delta p = \\hbar/2\\sigma$ and $\\Delta x\\,\\Delta p = \\hbar/2$. For $\\sigma = 1\\,\\ell$ these are $${d(V.l16Dp1, 1)}\\,\\hbar/\\ell$ and $${d(V.l16Product0, 1)}\\,\\hbar$, with a tallest density of ${d(V.l16Peak0, 3)} per $\\ell$.`,
    caption: 'the starting packet in position and momentum: the least spread the uncertainty relation allows',
    stage: W(PK(0, 1, 3), { panels: ['position', 'momentum'], readouts: ['xspread', 'pspread', 'product'], window: RUN }),
    claims: [
      claim('l16Dp1', 'Δp = 0.5 ħ/ℓ for σ = 1', () => close(V.l16Dp1, 0.5, 1e-9)),
      claim('l16Product0', 'ΔxΔp = 0.5 ħ at t = 0', () => close(V.l16Product0, 0.5, 1e-9)),
      claim('l16Peak0', 'the tallest density is 0.399 per ℓ', () => close(V.l16Peak0, 1 / Math.sqrt(2 * Math.PI), 1e-9)),
    ],
  },
  {
    id: 'l16-start:b4',
    phase: 'lecture',
    text: `What changes? Each momentum amplitude only turns: $\\tilde\\psi(p,t) = e^{-ip^2t/2m\\hbar}\\,\\tilde\\psi(p,0)$. The notes call it $\\phi(p,t)$; here it keeps its name $\\tilde\\psi(p,t)$ from Unit 13.4. A phase cannot change a size, so the momentum chances, the centre $p_0$ and the width $\\Delta p$ stay exactly as they were. What changes is how the momenta interfere when they are added back in position space. For $p_0 = 3$ the mean momentum at $t = 4$ is still ${d(V.l16FreeMeanP4, 1)}.`,
    caption: 'the same packet while time runs: the momentum curve stays put, the position curve does not',
    stage: W(PK(0, 1, 3), { time: sweep(0, 4), panels: ['position', 'momentum'], show: ['density'], window: RUN }),
    claims: [
      claim('l16DpFixed', 'Δp at t = 4 equals Δp at t = 0 (a residual of rounding size)', () => Math.abs(V.l16DpFixed) < 1e-12),
      claim('l16FreeMeanP4', '⟨p⟩ = 3 at t = 4', () => close(V.l16FreeMeanP4, 3, 1e-9)),
    ],
  },
  {
    id: 'l16-start:b5',
    phase: 'books',
    text: 'Townsend §6.6 (pp. 204–207, Eqs. 6.59–6.72) writes the same bell curve with a width constant $a$, where $a = \\sqrt2\\,\\sigma$ (Unit 13.4). It finds $\\Delta p = \\hbar/\\sqrt2\\,a$ and so $\\Delta x\\,\\Delta p = \\hbar/2$. Ex. 6.3 on p. 208 and Problem 6.6 add that a real wavefunction has $\\langle p\\rangle = 0$, and that a phase $e^{ip_0x/\\hbar}$ shifts the mean momentum by $p_0$.',
    caption: 'the packet of this unit: its width and its momentum spread, side by side',
    stage: W(PK(0, 1, 3), { panels: ['position', 'momentum'], window: RUN }),
    refs: [townsend('§6.6, pp. 204–208 (Eqs. 6.59–6.72); Ex. 6.3; Problem 6.6', 'The Gaussian with width constant $a$ has $\\Delta x = a/\\sqrt2$ and $\\Delta p = \\hbar/\\sqrt2\\,a$; a real wavefunction has $\\langle p\\rangle = 0$, and a phase $e^{ip_0x/\\hbar}$ shifts it by $p_0$.')],
  },
  {
    id: 'l16-start:b6',
    phase: 'clue',
    text: 'A packet has $p_0 = 0$ but $\\Delta p > 0$. Must its centre $\\langle x\\rangle$ move?',
    stage: W(PK(0, 1), { time: 0, show: ['density'], readouts: ['xmean', 'xspread'] }),
    reveal: {
      text: `No. The centre stays at $x_0 = 0$ and the packet spreads on both sides: $\\Delta x$ grows from 1 to ${d(V.l16FreeSd4, 2)} $\\ell$ by $t = 4$. A force is not needed for spreading.`,
      caption: 'the same packet at $t = 4$: wider, still centred on the origin',
      stage: W(PK(0, 1), { time: 4, show: ['density'], readouts: ['xmean', 'xspread'] }),
      claims: [
        claim('l16CentreStays', '⟨x⟩ stays at 0 when p₀ = 0 (a residual of rounding size)', () => Math.abs(V.l16CentreStays) < 1e-12),
        claim('l16FreeSd4', 'Δx = 2.24 ℓ at t = 4', () => close(V.l16FreeSd4, Math.sqrt(5), 1e-9)),
      ],
    },
  },
]

/* ---------------------------------------------------------------------------------------------- */
/* l16-evolve — The free Gaussian at time t                                                        */
/* ---------------------------------------------------------------------------------------------- */

const evolve: Beat[] = [
  {
    id: 'l16-evolve:b1',
    phase: 'lecture',
    text: `The only new step is adding the components back together. Give the Gaussian amplitudes their free phases and sum them: $\\psi(x,t) = \\frac{N_p}{\\sqrt{2\\pi\\hbar}}\\int dp\\;e^{-\\sigma^2(p-p_0)^2/\\hbar^2}\\,e^{ip(x-x_0)/\\hbar}\\,e^{-ip^2t/2m\\hbar}$, where $N_p$ normalises the momentum amplitude. Shift to the mean momentum with $q = p - p_0$. Let $X = x - x_0 - p_0t/m$ and $\\tau = \\hbar t/2m\\sigma^2$, which is $t/t_s$ with the [[spreading-time|spreading time]] $t_s = 2m\\sigma^2/\\hbar$. For $\\sigma = 1\\,\\ell$ and $m = 1$, $t_s$ is ${d(V.l16Ts1, 1)} time units.`,
    caption: 'the packet at $t = 0$, before the components are added back with their phases',
    stage: W(PK(0, 1, 3), { time: 0, window: RUN }),
    claims: [claim('l16Ts1', 't_s = 2mσ²/ħ = 2 for σ = 1, m = 1', () => close(V.l16Ts1, 2, 1e-9))],
  },
  {
    id: 'l16-evolve:b2',
    phase: 'lecture',
    text: 'Collect the terms in the exponent. The integral becomes $\\int dq\\,e^{-Aq^2+Bq}$ with $A = \\sigma^2(1+i\\tau)/\\hbar^2$ and $B = iX/\\hbar$, times a phase that does not depend on $q$. The identity $\\int dq\\,e^{-Aq^2+Bq} = \\sqrt{\\pi/A}\\;e^{B^2/(4A)}$, valid for $\\mathrm{Re}\\,A > 0$, comes from completing the square. The notes supply it without proof. The combination $X$ already hints that the centre moves at $p_0/m$.',
    caption: 'the packet after the phases have turned: the pieces no longer line up',
    stage: W(PK(0, 1, 3), { time: sweep(0, 2), panels: ['position', 'momentum'], window: RUN }),
    derivation: {
      result: '\\psi(x,t) = \\frac{N_p}{\\sqrt{2\\pi\\hbar}}\\,e^{\\frac{i}{\\hbar}\\left[p_0(x-x_0) - \\frac{p_0^2t}{2m}\\right]}\\int dq\\,e^{-Aq^2+Bq}',
      ground: [
        {
          tex: '\\psi(x,t) = \\frac{N_p}{\\sqrt{2\\pi\\hbar}}\\int dp\\;e^{-\\sigma^2(p-p_0)^2/\\hbar^2}\\,e^{ip(x-x_0)/\\hbar}\\,e^{-ip^2t/2m\\hbar}',
          why: 'Multiply each starting amplitude by its free phase and add them up over every momentum.',
          view: W(PK(0, 1, 3), { time: 0, window: RUN }),
          viewCaption: 'the starting amplitudes, before the phases act',
        },
        {
          tex: 'p = p_0 + q',
          why: 'Centre the integral on the mean momentum by shifting the integration variable.',
        },
        {
          tex: '-\\frac{\\sigma^2}{\\hbar^2}(1+i\\tau)\\,q^2 + \\frac{iX}{\\hbar}\\,q + \\text{phase}',
          why: 'Collect the powers of $q$ in the exponent. The $q^2$ coefficient is complex because of the free phase.',
          view: W(PK(0, 1, 3), { time: 2, window: RUN }),
          viewCaption: 'the same amplitudes after the phases have turned',
        },
        {
          tex: '\\psi(x,t) = \\frac{N_p}{\\sqrt{2\\pi\\hbar}}\\,e^{\\frac{i}{\\hbar}\\left[p_0(x-x_0) - \\frac{p_0^2t}{2m}\\right]}\\int dq\\,e^{-Aq^2+Bq}',
          why: 'Name the two coefficients $A$ and $B$. What is left is an integral of the form the identity covers.',
        },
      ],
    },
  },
  {
    id: 'l16-evolve:b3',
    phase: 'lecture',
    text: `The identity gives the packet at every time: $\\psi(x,t) = \\frac{1}{\\sqrt[4]{2\\pi\\sigma^2}}\\,\\frac{1}{\\sqrt{1+i\\tau}}\\,e^{-\\frac{X^2}{4\\sigma^2(1+i\\tau)}}\\,e^{\\frac{i}{\\hbar}\\left[p_0(x-x_0) - \\frac{p_0^2t}{2m}\\right]}$. At $t = 0$ we have $\\tau = 0$, and it is the starting state. The complex factor $1 + i\\tau$ changes the width and the phase. As a check, for $x_0 = 0$ and $p_0 = 3$ the formula and the grid evolution of Unit 15.3 agree within one part in a hundred million.`,
    caption: 'the exact packet while time runs: real part, imaginary part and density',
    stage: W(PK(0, 1, 3), { time: sweep(0, 4), show: ['re', 'im', 'density'], window: RUN }),
    claims: [
      claim('l16FormulaGap', 'the closed form and the grid evolution differ by less than 1e−8 at t = 1, 2 and 4 (a check, not shown)', () => V.l16FormulaGap < 1e-8),
      claim('l16FormulaT0Gap', 'at t = 0 the closed form is the starting packet (a residual of rounding size)', () => V.l16FormulaT0Gap < 1e-12),
    ],
  },
  {
    id: 'l16-evolve:b4',
    phase: 'lecture',
    text: 'A detector does not see $\\psi$, only $|\\psi|^2$. The carrier phase has size one and drops out, so in the width only $1 + i\\tau$ matters. Two things are worth keeping from the formula. At $\\tau = 0$ it returns the starting state. And $t_s$ sets the time scale: the packet changes noticeably when $t$ is comparable to $t_s$.',
    caption: 'the density alone while time runs: a bell curve at every moment',
    stage: W(PK(0, 1, 3), { time: sweep(0, 4), show: ['density'], window: RUN }),
  },
  {
    id: 'l16-evolve:b5',
    phase: 'books',
    text: 'Townsend §6.6 (pp. 208–209, Eqs. 6.73–6.76) reaches the same result for a packet that starts at the origin: $\\psi(x,t) = \\frac{1}{\\sqrt{\\sqrt\\pi\\,(a + i\\hbar t/ma)}}\\,e^{-\\frac{x^2}{2a^2(1 + i\\hbar t/ma^2)}}$. With $a = \\sqrt2\\,\\sigma$ the ratio $\\hbar t/ma^2$ is our $\\tau$, so his form is ours at $x_0 = p_0 = 0$. Problem 6.4 asks you to derive it from his momentum-space integral. On the grid the two forms differ by rounding error only.',
    caption: 'the book’s packet at $t = 2$: the same state as ours',
    stage: W(PK(0, 1), { time: 2 }),
    refs: [townsend('§6.6, pp. 208–209 (Eqs. 6.73–6.76); Problem 6.4', 'The free Gaussian at time $t$ in the book’s variables, with width constant $a = \\sqrt2\\,\\sigma$; Problem 6.4 derives it.')],
    claims: [claim('l16TownsendGap', 'Townsend’s Eq. 6.76 with a = √2σ equals the notes’ form (a residual of rounding size)', () => V.l16TownsendGap < 1e-12)],
  },
  {
    id: 'l16-evolve:b6',
    phase: 'clue',
    text: 'For $p_0 = 3$, $\\sigma = 1\\,\\ell$ and $x_0 = 0$, where is the centre of $|\\psi|^2$ at $t = 2$?',
    stage: W(PK(0, 1, 3), { time: 0, show: ['density'], readouts: ['xmean'], window: RUN }),
    reveal: {
      text: `At ${d(V.l16Mean2, 1)} $\\ell$. There $X = 0$, so $x = x_0 + p_0t/m$, the classical position of a particle that left the origin at speed 3.`,
      caption: 'the centre has moved to 6',
      stage: W(PK(0, 1, 3), { time: 2, show: ['density'], readouts: ['xmean'], window: RUN }),
      claims: [claim('l16Mean2', 'the centre of the p₀ = 3 packet is at 6 ℓ at t = 2', () => close(V.l16Mean2, 6, 1e-9))],
    },
  },
]

/* ---------------------------------------------------------------------------------------------- */
/* l16-spread — Moving, spreading, and the uncertainty bound                                       */
/* ---------------------------------------------------------------------------------------------- */

const spread: Beat[] = [
  {
    id: 'l16-spread:b1',
    phase: 'lecture',
    text: `Take the modulus squared. The size of $1 + i\\tau$ is $\\sqrt{1+\\tau^2}$, and the real part of $1/(1+i\\tau)$ is $1/(1+\\tau^2)$. The carrier phase cancels. The density is $|\\psi|^2 = \\frac{1}{\\sqrt{2\\pi}\\,\\sigma\\sqrt{1+\\tau^2}}\\,e^{-\\frac{X^2}{2\\sigma^2(1+\\tau^2)}}$, a [[normalized|normalised]] bell curve at every time. Its tallest point falls from ${d(V.l16Peak0, 3)} per $\\ell$ at $t = 0$ to ${d(V.l16PeakTs, 3)} at $t = t_s$, while the area stays ${d(V.l16Norm4, 0)}.`,
    caption: 'the density spreads: lower and wider, with the same area',
    stage: W(PK(0, 1, 3), { time: sweep(0, 4), show: ['density'], readouts: ['xmean', 'xspread', 'peak'], window: RUN }),
    claims: [
      claim('l16Peak0', 'the tallest density is 0.399 per ℓ at t = 0', () => close(V.l16Peak0, 1 / Math.sqrt(2 * Math.PI), 1e-9)),
      claim('l16PeakTs', 'the tallest density is 0.282 per ℓ at t = t_s', () => close(V.l16PeakTs, 1 / (2 * Math.sqrt(Math.PI)), 1e-9)),
      claim('l16Norm4', 'the area under |ψ|² is still 1 at t = 4', () => close(V.l16Norm4, 1, 1e-9)),
    ],
  },
  {
    id: 'l16-spread:b2',
    phase: 'lecture',
    text: `Compare with a normal bell curve of mean $\\mu$ and width $s$. The centre is $\\langle x\\rangle = x_0 + p_0t/m$ and the width is $\\Delta x(t) = \\sigma\\sqrt{1 + (t/t_s)^2}$. At $t = t_s$ it is $\\sqrt2\\,\\sigma$. For $t \\gg t_s$ it tends to $\\hbar t/2m\\sigma = \\Delta p\\,t/m$, the velocity-spread estimate of Unit 15.6, now exact: at $t = 20$ the true width is ${d(V.l16FarRatio, 3)} times $\\Delta p\\,t$ for $\\sigma = 1\\,\\ell$.`,
    caption: 'the width against time for $\\sigma = 1\\,\\ell$: a hyperbola that bends toward a straight line',
    stage: WIDTH,
    fidelity: ['plot-packet-width'],
    derivation: {
      result: '\\Delta x(t) = \\sigma\\sqrt{1+(t/t_s)^2}',
      ground: [
        {
          tex: '|\\psi|^2 = \\frac{1}{\\sqrt{2\\pi}\\,\\sigma\\sqrt{1+\\tau^2}}\\,e^{-\\frac{X^2}{2\\sigma^2(1+\\tau^2)}}',
          why: 'The modulus squared of the packet found above.',
          view: W(PK(0, 1, 3), { time: sweep(0, 4), show: ['density'], readouts: ['xspread'], window: RUN }),
          viewCaption: 'the density widening',
        },
        {
          tex: '\\frac{1}{\\sqrt{2\\pi}\\,s}\\,e^{-\\frac{(x-\\mu)^2}{2s^2}}',
          why: 'A bell curve is read off by its exponent: the number $s$ below the square is its width.',
        },
        {
          tex: 's^2 = \\sigma^2(1+\\tau^2)',
          why: 'Match the two exponents: the centre is $\\mu = x_0 + p_0t/m$, and the squared width is $\\sigma^2(1+\\tau^2)$.',
          view: WIDTH,
          viewCaption: 'the width read from the formula, against time',
        },
        {
          tex: '\\Delta x(t) = \\sigma\\sqrt{1+(t/t_s)^2}',
          why: 'Put $\\tau = t/t_s$.',
        },
      ],
    },
    claims: [claim('l16FarRatio', 'at t = 20 the width over Δp·t is 1.005 for σ = 1', () => close(V.l16FarRatio, Math.sqrt(101) / 10, 1e-9))],
  },
  {
    id: 'l16-spread:b3',
    phase: 'lecture',
    text: `Narrower packets spread sooner and wider, because $t_s \\propto \\sigma^2$. At $t = 2$ the packet with $\\sigma = 1\\,\\ell$ has $\\Delta x = ${d(V.l16FreeSd2, 3)}\\,\\ell$, and the packet with $\\sigma = 0.5\\,\\ell$ has ${d(V.l16Dx05T2, 3)} $\\ell$. The two widths are equal, ${d(V.l16DxCross, 3)} $\\ell$, at $t = 1$. After that the narrow one is the wider.`,
    caption: 'the packet at $t = 2$ while $\\sigma$ shrinks from 1 to half: the narrower start gives the wider result',
    stage: W(PK(0, sweep(1, 0.5)), { time: 2, readouts: ['xspread'] }),
    claims: [
      claim('l16FreeSd2', 'Δx = 1.414 ℓ for σ = 1 at t = 2', () => close(V.l16FreeSd2, Math.SQRT2, 1e-9)),
      claim('l16Dx05T2', 'Δx = 2.062 ℓ for σ = 0.5 at t = 2', () => close(V.l16Dx05T2, 0.5 * Math.sqrt(17), 1e-9)),
      claim('l16DxCross', 'the two widths are 1.118 ℓ at t = 1', () => close(V.l16DxCross, Math.sqrt(5) / 2, 1e-9)),
    ],
  },
  {
    id: 'l16-spread:b4',
    phase: 'lecture',
    text: `This does not contradict the uncertainty relation. The momentum chances do not change, so $\\Delta p = \\hbar/2\\sigma$ at all times, and $\\Delta x\\,\\Delta p = \\frac{\\hbar}{2}\\sqrt{1+(t/t_s)^2} \\ge \\frac{\\hbar}{2}$. The starting Gaussian meets the bound. Later the product is larger: for $\\sigma = 1\\,\\ell$ it is $${d(V.l16ProductTs, 3)}\\,\\hbar$ at $t = t_s$ and $${d(V.l16Product4, 3)}\\,\\hbar$ at $t = 4$. The phases now tie each position to a momentum, so the packet is no longer the least uncertain one.`,
    caption: 'both spreads and their product while time runs: $\\Delta p$ is flat, $\\Delta x$ grows',
    stage: W(PK(0, 1, 3), { time: sweep(0, 4), panels: ['position', 'momentum'], readouts: ['xspread', 'pspread', 'product'], window: RUN }),
    claims: [
      claim('l16ProductTs', 'ΔxΔp = 0.7071 ħ at t = t_s', () => close(V.l16ProductTs, Math.SQRT1_2, 1e-9)),
      claim('l16Product4', 'ΔxΔp = 1.118 ħ at t = 4', () => close(V.l16Product4, Math.sqrt(5) / 2, 1e-9)),
    ],
  },
  {
    id: 'l16-spread:b5',
    phase: 'lecture',
    text: `Do not blame the spreading on the uncertainty relation. That relation limits which starting states exist. The Hamiltonian decides what happens next, and for a free particle it lets the momenta pull the density apart. Nothing random was added and nothing was lost: the area under $|\\psi|^2$ is still ${d(V.l16Norm4, 0)} at $t = 4$.`,
    caption: 'the area stays one while the width grows',
    stage: W(PK(0, 1, 3), { time: sweep(0, 4), readouts: ['norm', 'xspread'], window: RUN }),
    claims: [claim('l16Norm4', 'the area under |ψ|² is still 1 at t = 4', () => close(V.l16Norm4, 1, 1e-9))],
  },
  {
    id: 'l16-spread:b6',
    phase: 'books',
    text: `Townsend §6.6 (pp. 208–210, Eq. 6.77, Ex. 6.4) follows a Gaussian under free evolution. Its width grows as $\\sigma\\sqrt{1 + (\\hbar t/2m\\sigma^2)^2}$ while $\\Delta p = ${d(V.l16FreeDp4, 1)}\\,\\hbar/\\ell$ never changes. The spreading time $m a^2/\\hbar$, with $a = \\sqrt2\\,\\sigma$ (Unit 13.4), is $${d(V.l16SpreadElectronMant, 1)}\\times 10^{-17}$ s for an electron in an atom-sized packet ($a = 10^{-10}$ m). For a one-gram marble with $a = 1$ mm it is $${d(V.l16SpreadMarbleMant, 1)}\\times 10^{24}$ s, about $${d(V.l16SpreadMarbleYearsMant, 1)}\\times 10^{17}$ years. This is the $t_s$ of Unit 16.2.`,
    caption: 'the free packet at four times in both panels: the position curve spreads, the momentum curve does not',
    stage: W(PK(0, 1, 3), { time: sweep(0, 4), panels: ['position', 'momentum'], window: RUN }),
    refs: [townsend('§6.6, pp. 208–210 (Eq. 6.77); Ex. 6.4', 'The spreading Gaussian, $\\sigma\\sqrt{1 + (\\hbar t/2m\\sigma^2)^2}$, and the spreading time $m a^2/\\hbar$ for an electron and for a marble.')],
    claims: [
      claim('l16FreeDp4', 'Δp stays 0.5 ħ/ℓ at every time', () => close(V.l16FreeDp4, 0.5, 1e-9)),
      claim('l16SpreadElectronMant', 'an electron in an atom-sized packet spreads in 8.6e−17 s', () => close(V.l16SpreadElectronMant, 8.6, 0.05)),
      claim('l16SpreadMarbleMant', 'a one-gram marble with a = 1 mm in 9.5e24 s', () => close(V.l16SpreadMarbleMant, 9.5, 0.05)),
      claim('l16SpreadMarbleYearsMant', 'about 3.0e17 years', () => close(V.l16SpreadMarbleYearsMant, 3.0, 0.05)),
      claim('l16SpreadElectronLog10', 'the electron’s time is 10^{−16.06} s', () => close(V.l16SpreadElectronLog10, -16.06, 0.01)),
    ],
  },
  {
    id: 'l16-spread:b7',
    phase: 'clue',
    text: 'Does a free packet keep its width?',
    stage: W(PK(0, 1, 3), { time: 0, show: ['density'], readouts: ['xspread'], window: RUN }),
    reveal: {
      text: `No. For $\\sigma = 1\\,\\ell$, $\\Delta x$ grows to ${d(V.l16FreeSd2, 2)} $\\ell$ at $t = 2$ and ${d(V.l16FreeSd4, 2)} $\\ell$ at $t = 4$, following $\\sigma\\sqrt{1 + (\\hbar t/2m\\sigma^2)^2}$, while $\\Delta p$ stays ${d(V.l16FreeDp4, 1)} $\\hbar/\\ell$.`,
      caption: 'the same packet at $t = 4$: wider, and no longer tall',
      stage: W(PK(0, 1, 3), { time: 4, show: ['density'], readouts: ['xspread'], window: RUN }),
      claims: [
        claim('l16FreeSd2', 'Δx = 1.41 ℓ at t = 2', () => close(V.l16FreeSd2, Math.SQRT2, 1e-9)),
        claim('l16FreeSd4', 'and 2.24 ℓ at t = 4', () => close(V.l16FreeSd4, Math.sqrt(5), 1e-9)),
      ],
    },
  },
  {
    id: 'l16-spread:b8',
    phase: 'deeper',
    text: `The notes’ optional extension (p. 11) answers whether every free packet widens from the start. For any free packet, $(\\Delta x_t)^2 = (\\Delta x_0)^2 + 2t\\,C_{xp}/m + t^2(\\Delta p)^2/m^2$. Here $C_{xp} = \\tfrac12\\langle(\\hat x-\\langle x\\rangle)(\\hat p-\\langle p\\rangle) + (\\hat p-\\langle p\\rangle)(\\hat x-\\langle x\\rangle)\\rangle$ is the [[chirp|position–momentum correlation]]. An unchirped Gaussian has $C_{xp} = 0$ and only widens. Multiply it by $e^{i\\beta x^2}$ with $\\beta = -${d(V.l16EchoBeta, 1)}$ and it narrows first. Now $\\Delta p = ${d(V.l16ChirpDp, 3)}\\,\\hbar/\\ell$ and $C_{xp} = -${d(V.l16ChirpCovMag, 1)}\\,\\hbar$. The width bottoms out at ${d(V.l16ChirpMinWidth, 3)} $\\ell$ at $t = ${d(V.l16ChirpFocusTime, 3)}$, and it is back to ${d(V.l16ChirpDxBack, 1)} $\\ell$ at $t = ${d(V.l16ChirpBackTime, 3)}$. Phases that spread out and then refocus are the idea of a spin echo: <<sl-q24-decoupling|Go further in 709: undoing dephasing>>.`,
    caption: 'the width against time: the plain Gaussian only grows, the chirped one dips first',
    stage: WIDTH_CHIRP,
    fidelity: ['plot-packet-width'],
    claims: [
      claim('l16EchoBeta', 'the chirp used has |β| = 0.2 (an input)', () => close(V.l16EchoBeta, 0.2, 1e-12)),
      claim('l16ChirpDp', 'Δp = 0.640 ħ/ℓ for the chirped packet', () => close(V.l16ChirpDp, Math.sqrt(0.41), 1e-9)),
      claim('l16ChirpCovMag', '|C_xp| = 0.4 ħ', () => close(V.l16ChirpCovMag, 0.4, 1e-9)),
      claim('l16ChirpFocusTime', 'the narrowest width comes at t = 0.976', () => close(V.l16ChirpFocusTime, 0.4 / 0.41, 1e-9)),
      claim('l16ChirpMinWidth', 'the narrowest width is 0.781 ℓ', () => close(V.l16ChirpMinWidth, Math.sqrt(1 - 0.16 / 0.41), 1e-6)),
      claim('l16ChirpBackTime', 'the width is back to 1 at t = 1.951', () => close(V.l16ChirpBackTime, 0.8 / 0.41, 1e-9)),
      claim('l16ChirpDxBack', 'and the width there is 1 ℓ', () => close(V.l16ChirpDxBack, 1, 1e-6)),
    ],
  },
]

/* ---------------------------------------------------------------------------------------------- */
/* l16-ehrenfest — The centre obeys Ehrenfest's equations                                          */
/* ---------------------------------------------------------------------------------------------- */

const ehrenfest: Beat[] = [
  {
    id: 'l16-ehrenfest:b1',
    phase: 'lecture',
    text: 'Unit 12.1 gave the rate law $\\frac{d}{dt}\\langle A\\rangle = \\frac{i}{\\hbar}\\langle[H,A]\\rangle$ for an operator $A$ without explicit time dependence. This beat recalls it and defines nothing new. The notes’ reading: the bra and the ket evolve with opposite phases. If $A$ commutes with $H$ the two cancel and $\\langle A\\rangle$ never changes. A term $\\langle\\partial A/\\partial t\\rangle$ is added only when $A$ itself depends on time. Now apply the law to $\\hat x$ and $\\hat p$.',
    caption: 'a packet at 2 with mean momentum 1.5, left alone: the readouts follow its two averages',
    stage: W(PK(2, 1, 1.5), { time: sweep(0, 2), readouts: ['xmean', 'pmean'] }),
  },
  {
    id: 'l16-ehrenfest:b2',
    phase: 'lecture',
    text: `First equation. Take $H = \\frac{\\hat p^2}{2m} + V(\\hat x)$ with $[\\hat x,\\hat p] = i\\hbar$. The potential commutes with $\\hat x$, and the kinetic part gives $[\\hat p^2,\\hat x] = -2i\\hbar\\,\\hat p$. So $\\frac{d}{dt}\\langle x\\rangle = \\langle p\\rangle/m$, exactly, for every state and every potential. It is not a property of Gaussians. On the grid, for a packet with $\\langle p\\rangle = ${d(V.l16EhrenfestDxdt, 1)}$ in $V = \\tfrac{x^2}{2}$, the commutator gives ${d(V.l16EhrenfestDxdt, 1)}.`,
    caption: 'the centre of the packet moves at $\\langle p\\rangle/m$; the dashed curve is $\\hat p\\psi$',
    stage: W(PK(2, 1, 1.5), { time: sweep(0, 2), overlay: ['ppsi'], readouts: ['xmean', 'pmean'] }),
    derivation: {
      result: '\\frac{d}{dt}\\langle x\\rangle = \\frac{i}{\\hbar}\\langle[\\hat H,\\hat x]\\rangle = \\frac{\\langle p\\rangle}{m}',
      ground: [
        {
          tex: '[\\hat H,\\hat x] = \\frac{[\\hat p^2,\\hat x]}{2m}',
          why: 'The potential $V(\\hat x)$ commutes with $\\hat x$, so only the kinetic part is left.',
          view: W(PK(2, 1, 1.5), { time: sweep(0, 2), readouts: ['xmean', 'pmean'] }),
          viewCaption: 'the two averages of one packet',
        },
        {
          tex: '[\\hat p^2,\\hat x] = \\hat p\\,[\\hat p,\\hat x] + [\\hat p,\\hat x]\\,\\hat p',
          why: 'Use the rule $[AB,C] = A[B,C] + [A,C]B$ with $A = B = \\hat p$ and $C = \\hat x$.',
        },
        {
          tex: '[\\hat p^2,\\hat x] = -2i\\hbar\\,\\hat p',
          why: 'Each commutator $[\\hat p,\\hat x]$ equals $-i\\hbar$, and the two terms add.',
          view: W(PK(2, 1, 1.5), { time: 0, overlay: ['ppsi'], readouts: ['pmean'] }),
          viewCaption: 'the function $\\hat p\\psi$ dashed: its average is $\\langle p\\rangle$',
        },
        {
          tex: '\\frac{d}{dt}\\langle x\\rangle = \\frac{i}{\\hbar}\\langle[\\hat H,\\hat x]\\rangle = \\frac{\\langle p\\rangle}{m}',
          why: 'Put the commutator into the rate law: $\\frac{i}{\\hbar}\\cdot\\frac{-2i\\hbar}{2m}$ is $\\frac{1}{m}$.',
        },
      ],
    },
    claims: [claim('l16EhrenfestDxdt', 'd⟨x⟩/dt = ⟨p⟩/m = 1.5 for the packet with ⟨p⟩ = 1.5 in V = x²/2 (the commutator on the grid)', () => close(V.l16EhrenfestDxdt, 1.5, 1e-9))],
  },
  {
    id: 'l16-ehrenfest:b3',
    phase: 'lecture',
    text: `Second equation. The kinetic energy commutes with $\\hat p$, so $[\\hat H,\\hat p] = [V(\\hat x),\\hat p]$. On a test function $f$, $[V,\\hat p]f = V(-i\\hbar f') + i\\hbar(Vf)' = i\\hbar V'f$. So $[V,\\hat p] = i\\hbar V'(\\hat x)$, and $\\frac{d}{dt}\\langle p\\rangle = -\\langle V'\\rangle = \\langle F(\\hat x)\\rangle$, the average force. For $V = \\tfrac{x^2}{2}$ and a packet at $x_0 = 2\\,\\ell$, the commutator gives $-${d(Math.abs(V.l16EhrenfestDpDt), 0)}$, and so does $-\\langle V'\\rangle = -\\langle x\\rangle$ in units $\\hbar/\\ell$ per unit time.`,
    caption: 'the packet at 2 with $\\hat p\\psi$ dashed, then $\\hat x\\psi$: the average slope of $V$ is the average of $x$',
    stage: W(PK(2, 1), { overlay: ['ppsi'] }),
    derivation: {
      result: '\\frac{d}{dt}\\langle p\\rangle = \\frac{i}{\\hbar}\\langle[\\hat H,\\hat p]\\rangle = -\\langle V\'(\\hat x)\\rangle',
      ground: [
        {
          tex: '[\\hat H,\\hat p] = [V(\\hat x),\\hat p]',
          why: 'The kinetic term $\\frac{\\hat p^2}{2m}$ commutes with $\\hat p$.',
          view: W(PK(2, 1), { overlay: ['ppsi'] }),
          viewCaption: '$\\hat p\\psi$ dashed over the packet',
        },
        {
          tex: '[V,\\hat p]f = V\\,(-i\\hbar f\') - (-i\\hbar)\\,(Vf)\'',
          why: 'Let both orders act on a test function $f$, with $\\hat p = -i\\hbar\\,d/dx$.',
        },
        {
          tex: '(Vf)\' = V\'f + Vf\'',
          why: 'The product rule. The two terms with $f\'$ cancel in the line above.',
          view: W(PK(2, 1), { overlay: ['xpsi'] }),
          viewCaption: '$\\hat x\\psi$ dashed: for this $V$ the slope $V\'$ is $x$',
        },
        {
          tex: '[V,\\hat p]f = i\\hbar\\,V\'f',
          why: 'What is left is $i\\hbar V\'f$ for every $f$.',
        },
        {
          tex: '\\frac{d}{dt}\\langle p\\rangle = \\frac{i}{\\hbar}\\langle[\\hat H,\\hat p]\\rangle = -\\langle V\'(\\hat x)\\rangle',
          why: 'Put it into the rate law: $\\frac{i}{\\hbar}\\cdot i\\hbar$ is $-1$.',
        },
      ],
    },
    claims: [
      claim('l16EhrenfestDpDt', 'd⟨p⟩/dt = −2 for V = x²/2 and a packet at 2 (the commutator on the grid)', () => close(V.l16EhrenfestDpDt, -2, 1e-9)),
      claim('l16EhrenfestForceMean', 'and −⟨V′⟩ = −⟨x⟩ = −2', () => close(V.l16EhrenfestForceMean, -2, 1e-9)),
    ],
  },
  {
    id: 'l16-ehrenfest:b4',
    phase: 'lecture',
    text: `These two equations are [[ehrenfest-theorem|Ehrenfest’s theorem]]. They look like Newton’s laws for the average position and momentum, and they hold for any state. Check them on the free Gaussian. With $V = 0$ they say $d\\langle p\\rangle/dt = 0$ and $\\langle x\\rangle = x_0 + p_0t/m$, as in Unit 16.2. On the grid, $\\langle p\\rangle$ at $t = 4$ is still ${d(V.l16FreeMeanP4, 1)}, and $\\langle x\\rangle$ matches $x_0 + p_0t/m$ to rounding. Whether the average force equals the force at the average position is not decided yet: Lecture 17.`,
    caption: 'the free packet again: its centre runs at constant speed while it widens',
    stage: W(PK(0, 1, 3), { time: sweep(0, 4), readouts: ['xmean', 'pmean'], window: RUN }),
    claims: [
      claim('l16EhrenfestFreeGap', '⟨x⟩ at t = 4 equals x₀ + p₀t/m (a residual of rounding size)', () => V.l16EhrenfestFreeGap < 1e-8),
      claim('l16FreeMeanP4', '⟨p⟩ = 3 at t = 4', () => close(V.l16FreeMeanP4, 3, 1e-9)),
    ],
  },
  {
    id: 'l16-ehrenfest:b5',
    phase: 'lecture',
    text: 'Four lines to keep. The centre is at $\\langle x\\rangle_t = x_0 + p_0t/m$. The width is $\\Delta x(t) = \\sigma\\sqrt{1 + (t/t_s)^2}$. The averages obey $\\frac{d}{dt}\\langle x\\rangle = \\langle p\\rangle/m$ and $\\frac{d}{dt}\\langle p\\rangle = -\\langle V\'\\rangle$. One state under one Hamiltonian gives both the motion and the spreading. The centre moves like a Newtonian particle, but the force in its equation is the average force, not yet the force at the centre.',
    caption: 'the free packet in both panels: it moves, it widens, and its momentum does not change',
    stage: W(PK(0, 1, 3), { panels: ['position', 'momentum'], time: sweep(0, 4), window: RUN }),
  },
  {
    id: 'l16-ehrenfest:b6',
    phase: 'books',
    text: `Townsend §6.3 (pp. 199–200, Eqs. 6.33–6.34) derives the same two equations, and Problem 6.1 asks for the general step: $[\\hat x^n,\\hat p] = i\\hbar n\\hat x^{n-1}$ by induction, then $[F(\\hat x),\\hat p] = i\\hbar F'(\\hat x)$ from the Taylor series. Momentum is conserved if and only if $H$ commutes with $\\hat p$. That is the case when $V$ does not depend on $x$: the spatial twin of energy conservation. Our example: for $V = \\tfrac{x^2}{2}$ and a packet centred at $x_0 = 2\\ell$, $d\\langle p\\rangle/dt = -\\langle V'\\rangle = -${d(Math.abs(V.l16EhrenfestDpDt), 0)}$ in units $\\hbar/\\ell$ per unit time. Susskind’s Lecture 9 reaches the same two equations.`,
    caption: 'the packet at 2 with $\\hat p\\psi$ dashed: a force pushes the mean momentum down',
    stage: W(PK(2, 1), { overlay: ['ppsi'] }),
    refs: [
      townsend('§6.3, pp. 199–200 (Eqs. 6.33–6.34); Problem 6.1', 'Momentum is conserved when $H$ commutes with $\\hat p$; Ehrenfest’s relations for $d\\langle x\\rangle/dt$ and $d\\langle p\\rangle/dt$.'),
      susskind('Lecture 9, §9.4 and §9.6', 'The same two equations for the averages of position and momentum.'),
    ],
    claims: [claim('l16EhrenfestDpDt', 'd⟨p⟩/dt = −⟨V′⟩ = −2 for V = x²/2 and a packet at 2', () => close(V.l16EhrenfestDpDt, -2, 1e-9))],
  },
  {
    id: 'l16-ehrenfest:b7',
    phase: 'clue',
    text: 'For a free particle there is no force, yet the packet widens. What does the second equation say about the mean momentum $\\langle p\\rangle$?',
    stage: W(PK(0, 1, 3), { time: 0, readouts: ['pmean', 'xspread'], window: RUN }),
    reveal: {
      text: `It stays at ${d(V.l16FreeMeanP4, 0)} for ever. Widening is not a change of the mean momentum: $d\\langle p\\rangle/dt = -\\langle V'\\rangle = 0$ when $V = 0$.`,
      caption: 'at $t = 4$ the packet is wider and $\\langle p\\rangle$ is still 3',
      stage: W(PK(0, 1, 3), { time: 4, readouts: ['pmean', 'xspread'], window: RUN }),
      claims: [claim('l16FreeMeanP4', '⟨p⟩ = 3 at t = 4', () => close(V.l16FreeMeanP4, 3, 1e-9))],
    },
  },
]

export const L16_STORY: Record<string, Beat[]> = {
  'l16-start': start,
  'l16-evolve': evolve,
  'l16-spread': spread,
  'l16-ehrenfest': ehrenfest,
}

/** Every claim of a unit's beats, reveals and derivation steps (each unit's `claims`: the number reader backs a unit's prose with it). */
const claimsOf = (beats: Beat[]): Claim[] => beats.flatMap((b) => [...(b.claims ?? []), ...(b.reveal?.claims ?? []), ...(b.derivation?.ground ?? []).flatMap((s) => s.claims ?? [])])
export const L16_UNIT_CLAIMS: Record<string, Claim[]> = Object.fromEntries(Object.entries(L16_STORY).map(([id, beats]) => [id, claimsOf(beats)]))
